/**
 * wallet-node.js — headless seed-phrase wallet for the CLI.
 *
 * Wraps `@midnight-ntwrk/wallet`'s WalletBuilder.buildFromSeed() so the
 * CLI surfaces the same `walletHandle.api` shape the browser code
 * expects. Handles wallet sync, balance checks, and shutdown.
 */

import * as Rx from 'rxjs';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { nativeToken } from '@midnight-ntwrk/ledger';
import { NetworkId as ZswapNetworkId } from '@midnight-ntwrk/zswap';

import { log } from './log.js';

// Map the canonical midnight-js network string to the Zswap NetworkId
// enum the wallet builder expects.
function toZswapNetworkId(networkId) {
  switch (networkId) {
    case 'undeployed': return ZswapNetworkId.Undeployed;
    case 'testnet':    return ZswapNetworkId.TestNet;
    case 'mainnet':    return ZswapNetworkId.MainNet;
    default:
      throw new Error(`Unknown POB_NETWORK_ID: ${networkId}`);
  }
}

/**
 * Build a wallet from a 64-char hex seed and wait until it has synced
 * its first state. Returns a handle compatible with the
 * `getContractApi({ walletHandle })` factory: `walletHandle.api` is the
 * wallet itself (which midnight-js providers consume directly).
 */
export async function buildWalletFromSeed({
  seed,
  endpoints,
  networkId,
  logLevel = 'info',
}) {
  if (!seed || !/^[0-9a-fA-F]{64}$/.test(seed)) {
    throw new Error(
      'Seed must be a 64-character hex string (32 bytes). '
      + 'Generate with: node -e "console.log(require(\\\"crypto\\\").randomBytes(32).toString(\\\"hex\\\"))"'
    );
  }

  log.step(`Building wallet from seed (${seed.slice(0, 8)}…)`);
  const wallet = await WalletBuilder.buildFromSeed(
    endpoints.indexer,
    endpoints.indexerWs,
    endpoints.proofServer,
    endpoints.node,
    seed,
    toZswapNetworkId(networkId),
    logLevel,
  );
  wallet.start();

  const initialState = await Rx.firstValueFrom(wallet.state());
  log.ok(`Wallet ready: ${initialState.address}`);
  log.info('  Waiting for indexer sync (balance scan)…');

  // The first emission is the cached/initial state and usually shows
  // 0 balance even when funds exist on chain. Wait for the wallet to
  // catch up to the chain tip OR for a non-zero balance to appear,
  // whichever comes first. Bounded by a 90-second timeout.
  const synced = await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.filter((s) => {
        const synced = Number(s.syncProgress?.synced ?? 0);
        const total = Number(s.syncProgress?.total ?? 0);
        const balance = s.balances?.[nativeToken()] ?? 0n;
        return (total > 0 && synced >= total) || balance > 0n;
      }),
      Rx.take(1),
      Rx.timeout({ each: 90_000 }),
    )
  ).catch((err) => {
    log.warn(`Sync wait timed out (${err.message}). Using last known state.`);
    return initialState;
  });

  const balance = synced.balances?.[nativeToken()] ?? 0n;
  log.info(`  Native token balance: ${balance.toString()}`);

  // The browser's walletHandle has `.api` that holds the providers
  // and submit machinery. With the headless wallet the wallet itself
  // is the api — so mirror that shape so contract.js doesn't care.
  return {
    api: wallet,
    address: initialState.address,
    coinPublicKey: initialState.coinPublicKey,
    balance,
    state$: wallet.state(),
    async waitForFunds(min = 1n) {
      const have = (await Rx.firstValueFrom(wallet.state()))
        .balances[nativeToken()] ?? 0n;
      if (have >= min) return have;
      log.info(`Waiting for native token balance ≥ ${min.toString()}…`);
      return Rx.firstValueFrom(
        wallet.state().pipe(
          Rx.map((s) => s.balances[nativeToken()] ?? 0n),
          Rx.filter((b) => b >= min),
          Rx.take(1),
        )
      );
    },
    async shutdown() {
      try { await wallet.close?.(); } catch { /* noop */ }
    },
  };
}
