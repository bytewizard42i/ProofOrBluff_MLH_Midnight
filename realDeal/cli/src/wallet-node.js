/**
 * wallet-node.js — headless seed-based wallet for the CLI, v8 SDK.
 *
 * Built around @midnight-ntwrk/wallet-sdk-facade. Mirrors the canonical
 * pattern from midnightntwrk/example-counter/counter-cli/src/api.ts and
 * midnight-local-dev-johns-copy/src/wallet.ts.
 *
 * Three sub-wallets back the facade — Shielded (Zswap), Unshielded
 * (NIGHT), Dust — derived from the same HD seed via role-specific paths.
 * Tx fees are paid in DUST, which is generated FROM unshielded NIGHT
 * UTXOs but only after a one-time `registerNightUtxosForDustGeneration`
 * tx. We do that automatically the first time a wallet has unregistered
 * NIGHT.
 */

import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import {
  createKeystore,
  InMemoryTransactionHistoryStorage,
  PublicKey as UnshieldedPublicKey,
  UnshieldedWallet,
} from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { Buffer } from 'buffer';

import { log } from './log.js';

// Apollo's GraphQL subscription client uses globalThis.WebSocket. Node
// doesn't ship one, so polyfill from `ws` before any wallet code runs.
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = WebSocket;
}

/**
 * Derive the three role-specific keys from a 32-byte hex seed.
 * Mirrors the example-counter pattern. Throws if the seed is invalid.
 */
function deriveKeysFromSeed(hexSeed) {
  if (!/^[0-9a-fA-F]{64}$/.test(hexSeed)) {
    throw new Error(
      'Seed must be a 64-character hex string (32 bytes). '
      + 'Generate with: node -e "console.log(require(\\\"crypto\\\").randomBytes(32).toString(\\\"hex\\\"))"'
    );
  }
  const seed = Buffer.from(hexSeed, 'hex');
  const hd = HDWallet.fromSeed(seed);
  if (hd.type !== 'seedOk') {
    throw new Error(`HDWallet.fromSeed failed: ${hd.type}`);
  }
  const derivation = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);
  if (derivation.type !== 'keysDerived') {
    throw new Error(`Failed to derive keys: ${derivation.type}`);
  }
  hd.hdWallet.clear();
  return derivation.keys;
}

function buildFacadeConfig(networkId, endpoints) {
  return {
    networkId,
    indexerClientConnection: {
      indexerHttpUrl: endpoints.indexer,
      indexerWsUrl: endpoints.indexerWs,
    },
    provingServerUrl: new URL(endpoints.proofServer),
    relayURL: new URL(endpoints.node.replace(/^http/, 'ws')),
    costParameters: {
      additionalFeeOverhead: 300_000_000_000_000n,
      feeBlocksMargin: 5,
    },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
  };
}

/**
 * Build the WalletContext (facade + secret keys + unshielded keystore)
 * and wait for it to sync. Returns a `walletHandle` whose `.api` shape
 * mirrors what the contract.js layer expects.
 */
export async function buildWalletFromSeed({
  seed,
  endpoints,
  networkId,
}) {
  log.step(`Building wallet from seed (${seed.slice(0, 8)}…) on ${networkId}`);
  const keys = deriveKeysFromSeed(seed);
  const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
  const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
  const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

  const configuration = buildFacadeConfig(networkId, endpoints);

  const facade = await WalletFacade.init({
    configuration,
    shielded: (cfg) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
    unshielded: (cfg) =>
      UnshieldedWallet(cfg).startWithPublicKey(
        UnshieldedPublicKey.fromKeyStore(unshieldedKeystore),
      ),
    dust: (cfg) =>
      DustWallet(cfg).startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust,
      ),
  });
  await facade.start(shieldedSecretKeys, dustSecretKey);

  const ctx = { wallet: facade, shieldedSecretKeys, dustSecretKey, unshieldedKeystore };

  log.info(`  Unshielded address: ${unshieldedKeystore.getBech32Address().asString()}`);
  log.info('  Waiting for wallet sync…');
  const synced = await Rx.firstValueFrom(
    facade.state().pipe(
      Rx.throttleTime(3_000),
      Rx.tap((s) => {
        if (!s.isSynced) log.info('    syncing…');
      }),
      Rx.filter((s) => s.isSynced),
      Rx.take(1),
      Rx.timeout({ each: 120_000 }),
    )
  );

  const unshieldedNight =
    synced.unshielded?.balances?.[ledger.nativeToken().raw] ?? 0n;
  const shieldedNight =
    synced.shielded?.balances?.[ledger.nativeToken().raw] ?? 0n;
  const dustBalance = synced.dust?.balance(new Date()) ?? 0n;
  log.ok(`  Synced. NIGHT (unshielded): ${unshieldedNight}, NIGHT (shielded): ${shieldedNight}, DUST: ${dustBalance}`);

  // DUST registration — required so the wallet has fees to pay for txs.
  // Skip if there's already DUST or no NIGHT to register.
  if (dustBalance === 0n && unshieldedNight > 0n) {
    log.step('Registering NIGHT UTXOs for DUST generation…');
    await registerNightForDust(ctx);
  }

  return {
    api: facade,
    ctx,
    address: unshieldedKeystore.getBech32Address().asString(),
    coinPublicKey: synced.shielded?.coinPublicKey?.toHexString?.() ?? null,
    async shutdown() {
      try { await facade.stop(); } catch { /* noop */ }
    },
  };
}

/**
 * Register all unregistered NIGHT UTXOs for dust generation. This is a
 * separate on-chain tx that costs no fees (it's the bootstrap path) and
 * unblocks the wallet's ability to pay future tx fees in DUST.
 */
async function registerNightForDust(ctx) {
  const state = await Rx.firstValueFrom(
    ctx.wallet.state().pipe(Rx.filter((s) => s.isSynced))
  );
  const unregistered = (state.unshielded?.availableCoins ?? []).filter(
    (c) => c.meta.registeredForDustGeneration === false,
  );
  if (unregistered.length === 0) {
    log.warn('  No unregistered NIGHT UTXOs found.');
    return false;
  }
  log.info(`  Found ${unregistered.length} unregistered NIGHT UTXO(s)`);
  const recipe = await ctx.wallet.registerNightUtxosForDustGeneration(
    unregistered,
    ctx.unshieldedKeystore.getPublicKey(),
    (payload) => ctx.unshieldedKeystore.signData(payload),
  );
  const finalized = await ctx.wallet.finalizeRecipe(recipe);
  const txId = await ctx.wallet.submitTransaction(finalized);
  log.info(`  DUST-registration tx: ${txId}`);
  await Rx.firstValueFrom(
    ctx.wallet.state().pipe(
      Rx.throttleTime(3_000),
      Rx.filter((s) => (s.dust?.balance(new Date()) ?? 0n) > 0n),
      Rx.take(1),
      Rx.timeout({ each: 120_000 }),
    )
  );
  log.ok('  DUST registered and accruing.');
  return true;
}
