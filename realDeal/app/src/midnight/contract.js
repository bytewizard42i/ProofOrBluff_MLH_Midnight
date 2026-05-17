/**
 * midnight/contract.js — Phase 2 wiring of every exported circuit on
 * proof-or-bluff.compact, browser flavour, v8 SDK matrix.
 *
 * Mirrors realDeal/cli/src/contract.js. Differences:
 *   - Wallet bridge: comes from Lace / 1AM via the DApp Connector
 *     (`walletHandle.api`) rather than a headless WalletFacade.
 *   - ZK assets: served over HTTP from /managed/proof-or-bluff/ by Vite
 *     (fetchZkConfigProvider) rather than read from disk.
 *   - Persistence: browser localStorage rather than .pob-state/.
 *
 * The on-chain coding (commits, witness staging, result decoding) is
 * identical to the CLI so behaviour is consistent across surfaces.
 */

import {
  findDeployedContract,
  deployContract,
} from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from
  '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from
  '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { FetchZkConfigProvider } from
  '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { setNetworkId } from
  '@midnight-ntwrk/midnight-js-network-id';
import * as ledger from '@midnight-ntwrk/ledger-v8';
import { CompiledContract } from '@midnight-ntwrk/compact-js';

import { Contract, pureCircuits } from '@pob/contract';
import { ENDPOINTS, NETWORK_ID, getContractAddress, setContractAddress }
  from './config.js';

// ---------------------------------------------------------------------------
// Network registration (NetworkId is just a string in v4.0.4 — pass through).

setNetworkId(NETWORK_ID);

// ---------------------------------------------------------------------------
// Witness staging — used by resolveChallenge.

let _pendingReveal = null;
export function setPendingReveal(reveal) { _pendingReveal = reveal; }
export function clearPendingReveal() { _pendingReveal = null; }

const witnesses = {
  revealLastPlay(context) {
    if (!_pendingReveal) {
      throw new Error(
        'revealLastPlay called with no pending reveal staged. Call '
        + 'setPendingReveal(witness) before resolveChallenge.'
      );
    }
    return [context.privateState, _pendingReveal];
  },
};

// ---------------------------------------------------------------------------
// Encoding helpers.

function randomBytes32() {
  const out = new Uint8Array(32);
  crypto.getRandomValues(out);
  return out;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex) {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error(`Invalid hex string length: ${clean.length}`);
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function emptyWitnessSlot() {
  return { rank: 0n, salt: new Uint8Array(32) };
}

function buildPlayReveal(cards) {
  if (cards.length < 1 || cards.length > 4) {
    throw new Error('Play must declare 1-4 cards');
  }
  const slots = [0, 1, 2, 3].map((i) => {
    if (i < cards.length) {
      return { rank: BigInt(cards[i]), salt: randomBytes32() };
    }
    return emptyWitnessSlot();
  });
  return {
    count: BigInt(cards.length),
    rank0: slots[0].rank, salt0: slots[0].salt,
    rank1: slots[1].rank, salt1: slots[1].salt,
    rank2: slots[2].rank, salt2: slots[2].salt,
    rank3: slots[3].rank, salt3: slots[3].salt,
  };
}

// Result-shape extraction tolerant to v8 SDK key changes.
const extractTxId = (r) =>
  r?.public?.txId ?? r?.public?.txHash ?? r?.public?.transactionId ?? null;
const extractResult = (r) =>
  r?.public?.result
    ?? r?.public?.callResult?.result
    ?? r?.private?.result
    ?? r?.result
    ?? null;

// ---------------------------------------------------------------------------
// LocalStorage keys (private state per matchId).

const KEY_ENTROPY     = (mid, role) => `pob:realdeal:entropy:${mid}:${role}`;
const KEY_PLAY_REVEAL = (mid)       => `pob:realdeal:play:${mid}`;

function persistEntropy(matchId, role, entropyHex) {
  window.localStorage.setItem(KEY_ENTROPY(matchId, role), entropyHex);
}

export function getStoredEntropy(matchId, role) {
  return window.localStorage.getItem(KEY_ENTROPY(matchId, role));
}

export function importEntropy(matchId, role, entropyHex) {
  if (!/^[0-9a-fA-F]{64}$/.test(entropyHex.replace(/^0x/, ''))) {
    throw new Error('Entropy must be a 32-byte hex string');
  }
  persistEntropy(matchId, role, entropyHex.replace(/^0x/, ''));
}

function persistPlayReveal(matchId, reveal) {
  const dump = {
    count: reveal.count.toString(),
    rank0: reveal.rank0.toString(), salt0: bytesToHex(reveal.salt0),
    rank1: reveal.rank1.toString(), salt1: bytesToHex(reveal.salt1),
    rank2: reveal.rank2.toString(), salt2: bytesToHex(reveal.salt2),
    rank3: reveal.rank3.toString(), salt3: bytesToHex(reveal.salt3),
  };
  window.localStorage.setItem(KEY_PLAY_REVEAL(matchId), JSON.stringify(dump));
}

function loadPlayReveal(matchId) {
  const raw = window.localStorage.getItem(KEY_PLAY_REVEAL(matchId));
  if (!raw) {
    throw new Error(
      `No stored play reveal for match ${matchId}. The challenged player `
      + `must call resolveChallenge from the same browser that submitted `
      + `the original playCards.`
    );
  }
  const j = JSON.parse(raw);
  return {
    count: BigInt(j.count),
    rank0: BigInt(j.rank0), salt0: hexToBytes(j.salt0),
    rank1: BigInt(j.rank1), salt1: hexToBytes(j.salt1),
    rank2: BigInt(j.rank2), salt2: hexToBytes(j.salt2),
    rank3: BigInt(j.rank3), salt3: hexToBytes(j.salt3),
  };
}

// ---------------------------------------------------------------------------
// In-memory PrivateStateProvider implementation. Satisfies the interface
// from @midnight-ntwrk/midnight-js-types without pulling in the level
// stack (which fails to bundle for the browser due to its EventEmitter
// dependency). Private states are scoped by contract address to mirror
// the on-disk provider's namespace isolation.
// ---------------------------------------------------------------------------

function createMemoryPrivateStateProvider() {
  let scopedAddress = null;
  const states = new Map();        // key: `${address}::${psi}` -> private state
  const signingKeys = new Map();   // key: address -> signing key
  const k = (psi) => `${scopedAddress ?? '_'}::${psi}`;

  return {
    setContractAddress(address) { scopedAddress = address; },
    async set(psi, state)        { states.set(k(psi), state); },
    async get(psi)               { return states.has(k(psi)) ? states.get(k(psi)) : null; },
    async remove(psi)            { states.delete(k(psi)); },
    async clear()                { states.clear(); },
    async setSigningKey(addr, key)   { signingKeys.set(addr, key); },
    async getSigningKey(addr)        { return signingKeys.has(addr) ? signingKeys.get(addr) : null; },
    async removeSigningKey(addr)     { signingKeys.delete(addr); },
    async clearSigningKeys()         { signingKeys.clear(); },
    // Export/import are not required by deployContract / findDeployedContract;
    // implement as no-ops so the interface is satisfied if midnight-js
    // ever introspects them.
    async exportPrivateStates() { return { version: 1, states: [] }; },
    async importPrivateStates() { return { imported: 0, skipped: 0, overwritten: 0 }; },
    async exportSigningKeys()   { return { version: 1, keys: [] }; },
    async importSigningKeys()   { return { imported: 0, skipped: 0, overwritten: 0 }; },
  };
}

// ---------------------------------------------------------------------------
// Provider bundle.

function buildProviders({ walletHandle }) {
  const zkConfigProvider = new FetchZkConfigProvider(
    `${window.location.origin}/managed/proof-or-bluff`
  );
  // Tiny in-memory PrivateStateProvider. The real
  // levelPrivateStateProvider depends on `level` / `abstract-level`,
  // which extend Node's `events.EventEmitter` — externalised by Vite for
  // the browser, breaking module init. For our local-dev hackathon demo
  // we don't need persistence across reloads (the contract address is
  // stored separately in localStorage by setContractAddress), so a
  // map-backed implementation is sufficient and ships zero new deps.
  const privateStateProvider = createMemoryPrivateStateProvider();
  return {
    privateStateProvider,
    publicDataProvider: indexerPublicDataProvider(
      ENDPOINTS.indexer,
      ENDPOINTS.indexerWs
    ),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(ENDPOINTS.proofServer, zkConfigProvider),
    // The DApp Connector's ConnectedAPI does not implement the midnight-js
    // WalletProvider / MidnightProvider interfaces. wallet.js builds an
    // adapter that does — use it for both roles.
    walletProvider: walletHandle.adapter,
    midnightProvider: walletHandle.adapter,
  };
}

async function resolveContract(providers, compiledContract) {
  const persisted = getContractAddress();

  if (persisted) {
    return findDeployedContract(providers, {
      contractAddress: persisted,
      compiledContract,
      privateStateId: 'pob:realdeal:private',
      initialPrivateState: {},
    });
  }

  const deployed = await deployContract(providers, {
    compiledContract,
    privateStateId: 'pob:realdeal:private',
    initialPrivateState: {},
  });
  setContractAddress(deployed.deployTxData.public.contractAddress);
  return deployed;
}

// ---------------------------------------------------------------------------
// Public factory.

export async function getContractApi({ walletHandle }) {
  const providers = buildProviders({ walletHandle });

  // v8 midnight-js requires the CompiledContract wrapper around the
  // raw Contract class. fetchZkConfigProvider serves the assets over
  // HTTP, but the CompiledContract still needs an asset path tag so
  // the runtime can locate them.
  const compiledContract = CompiledContract.make('proof-or-bluff', Contract).pipe(
    CompiledContract.withWitnesses(witnesses),
    CompiledContract.withCompiledFileAssets(
      `${window.location.origin}/managed/proof-or-bluff`
    ),
  );

  const deployed = await resolveContract(providers, compiledContract);
  const tx = deployed.callTx;

  const ensure = (name) => {
    const fn = tx[name];
    if (!fn) {
      throw new Error(
        `Circuit "${name}" not callable on the deployed contract. The `
        + `bindings may be stale — rerun the realDeal contract compile.`
      );
    }
    return fn;
  };

  function nowSec() {
    return BigInt(Math.floor(Date.now() / 1000));
  }

  // ShieldedCoinInfo.color is Bytes<32>. ledger-v8's nativeToken().raw
  // is a hex string used as a balance-map key — convert to bytes here.
  const nativeColorBytes = hexToBytes(ledger.nativeToken().raw);
  function nativeCoin(value) {
    return {
      nonce: randomBytes32(),
      color: nativeColorBytes,
      value: BigInt(value),
    };
  }

  return {
    address: deployed.deployTxData?.public?.contractAddress
      || getContractAddress(),

    async getMatch(matchId) {
      const r = await ensure('getMatch')(hexToBytes(matchId));
      return extractResult(r);
    },
    async getMatchPhase(matchId) {
      const r = await ensure('getMatchPhase')(hexToBytes(matchId));
      const v = extractResult(r);
      return v == null ? null : Number(v);
    },
    async getWinner(matchId) {
      const r = await ensure('getWinner')(hexToBytes(matchId));
      const v = extractResult(r);
      return v == null ? null : Number(v);
    },

    async createMatch({ mode, wagerAmount }) {
      const entropy = randomBytes32();
      const entropyHex = bytesToHex(entropy);
      const commit = pureCircuits.commitEntropy(entropy);
      const result = await ensure('createMatch')(
        BigInt(mode),
        BigInt(wagerAmount),
        commit,
        nowSec(),
        nativeCoin(wagerAmount)
      );
      const matchIdBytes = extractResult(result);
      const matchId = matchIdBytes ? bytesToHex(matchIdBytes) : null;
      if (matchId) persistEntropy(matchId, 'p1', entropyHex);
      return { matchId, entropy: entropyHex, txId: extractTxId(result) };
    },

    async joinMatch({ matchId, wagerAmount }) {
      const entropy = randomBytes32();
      const entropyHex = bytesToHex(entropy);
      const commit = pureCircuits.commitEntropy(entropy);
      const result = await ensure('joinMatch')(
        hexToBytes(matchId),
        commit,
        nativeCoin(wagerAmount)
      );
      persistEntropy(matchId, 'p2', entropyHex);
      return { entropy: entropyHex, txId: extractTxId(result) };
    },

    async revealSeed({ matchId, startingRank = 0 }) {
      const p1 = getStoredEntropy(matchId, 'p1');
      const p2 = getStoredEntropy(matchId, 'p2');
      if (!p1 || !p2) {
        throw new Error(
          `revealSeed needs both entropies. Have: p1=${!!p1} p2=${!!p2}. `
          + `Call importEntropy(matchId, role, hex) first.`
        );
      }
      const result = await ensure('revealSeed')(
        hexToBytes(matchId),
        hexToBytes(p1),
        hexToBytes(p2),
        BigInt(startingRank),
        nowSec()
      );
      return { txId: extractTxId(result) };
    },

    async playCards({ matchId, cards, claimedRank, claimedCount }) {
      if (claimedCount !== cards.length) {
        throw new Error('claimedCount must equal cards.length');
      }
      const reveal = buildPlayReveal(cards);
      const playCommit = pureCircuits.commitPlay(reveal);
      const result = await ensure('playCards')(
        hexToBytes(matchId),
        playCommit,
        BigInt(claimedRank),
        BigInt(claimedCount),
        nowSec()
      );
      persistPlayReveal(matchId, reveal);
      return {
        playCommit: bytesToHex(playCommit),
        txId: extractTxId(result),
      };
    },

    async acceptClaim({ matchId }) {
      const r = await ensure('acceptClaim')(hexToBytes(matchId), nowSec());
      return { txId: extractTxId(r) };
    },

    async challengeClaim({ matchId }) {
      const r = await ensure('challengeClaim')(hexToBytes(matchId), nowSec());
      return { txId: extractTxId(r) };
    },

    async resolveChallenge({ matchId }) {
      const reveal = loadPlayReveal(matchId);
      setPendingReveal(reveal);
      try {
        const r = await ensure('resolveChallenge')(
          hexToBytes(matchId),
          nowSec()
        );
        return {
          honest: Boolean(extractResult(r)),
          txId: extractTxId(r),
        };
      } finally {
        clearPendingReveal();
      }
    },

    async claimPayout({ matchId }) {
      const r = await ensure('claimPayout')(hexToBytes(matchId));
      return { txId: extractTxId(r) };
    },

    async cancelUnjoinedMatch({ matchId }) {
      const r = await ensure('cancelUnjoinedMatch')(hexToBytes(matchId));
      return { txId: extractTxId(r) };
    },

    async forfeitAbandonedMatch({ matchId, timeoutSeconds = 86_400n }) {
      const r = await ensure('forfeitAbandonedMatch')(
        hexToBytes(matchId),
        nowSec(),
        BigInt(timeoutSeconds)
      );
      return { txId: extractTxId(r) };
    },

    async forfeitStalledChallenge({ matchId, timeoutSeconds = 3600n }) {
      const r = await ensure('forfeitStalledChallenge')(
        hexToBytes(matchId),
        nowSec(),
        BigInt(timeoutSeconds)
      );
      return { txId: extractTxId(r) };
    },
  };
}
