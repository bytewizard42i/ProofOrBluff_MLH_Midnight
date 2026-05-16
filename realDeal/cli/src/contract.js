/**
 * cli/src/contract.js — Node-side mirror of realDeal/app/src/midnight/contract.js.
 *
 * IMPORTANT: keep this file in sync with the browser version. They both
 * wrap the same compiled bindings; the only differences are:
 *   - we build the providers bundle from Node-flavoured packages
 *     (level private-state, node zk config, no DApp Connector)
 *   - persistence routes through ../state.js (filesystem) instead of
 *     window.localStorage
 *
 * TODO: extract a shared "core API factory" into
 * realDeal/app/src/midnight/contract-core.js so the two surfaces import
 * the same symbol. Holding off until the wiring is proven end-to-end on
 * both surfaces; clone-then-dedupe is lower risk than refactor-then-test.
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { findDeployedContract, deployContract } from
  '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from
  '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from
  '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from
  '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from
  '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { setNetworkId } from
  '@midnight-ntwrk/midnight-js-network-id';
import { nativeToken } from '@midnight-ntwrk/ledger';

import * as state from './state.js';

// The compiled contract bindings live next to the .compact source.
// We dynamically import so the path is resolved relative to wherever
// the CLI is launched from.
async function loadContractModule(managedDir) {
  const indexJs = path.resolve(managedDir, 'contract', 'index.js');
  const url = pathToFileURL(indexJs).href;
  return import(url);
}

// In midnight-js-network-id v4.0.4 NetworkId is just a string alias.
// The valid values are 'undeployed', 'testnet', 'mainnet'.
function setNetwork(networkId) {
  setNetworkId(networkId);
}

function randomBytes32() {
  const out = new Uint8Array(32);
  globalThis.crypto.getRandomValues(out);
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

function dumpReveal(reveal) {
  return {
    count: reveal.count.toString(),
    rank0: reveal.rank0.toString(), salt0: bytesToHex(reveal.salt0),
    rank1: reveal.rank1.toString(), salt1: bytesToHex(reveal.salt1),
    rank2: reveal.rank2.toString(), salt2: bytesToHex(reveal.salt2),
    rank3: reveal.rank3.toString(), salt3: bytesToHex(reveal.salt3),
  };
}

function rehydrateReveal(j) {
  return {
    count: BigInt(j.count),
    rank0: BigInt(j.rank0), salt0: hexToBytes(j.salt0),
    rank1: BigInt(j.rank1), salt1: hexToBytes(j.salt1),
    rank2: BigInt(j.rank2), salt2: hexToBytes(j.salt2),
    rank3: BigInt(j.rank3), salt3: hexToBytes(j.salt3),
  };
}

// ---------------------------------------------------------------------------
// Public factory

export async function getContractApi({
  walletHandle,
  endpoints,
  networkId,
  managedDir,
}) {
  setNetwork(networkId);
  const { Contract, pureCircuits } = await loadContractModule(managedDir);

  // Witness staging (used by resolveChallenge). One per process is OK
  // because the CLI runs commands one at a time.
  let pendingReveal = null;

  const witnesses = {
    revealLastPlay(context) {
      if (!pendingReveal) {
        throw new Error(
          'revealLastPlay called with no pending reveal staged.'
        );
      }
      return [context.privateState, pendingReveal];
    },
  };

  const providers = {
    privateStateProvider: await levelPrivateStateProvider({
      privateStateStoreName: 'pob-realdeal',
      privateStateStorePath: state.privateStateDir(networkId),
    }),
    publicDataProvider: indexerPublicDataProvider(
      endpoints.indexer,
      endpoints.indexerWs,
    ),
    zkConfigProvider: new NodeZkConfigProvider(managedDir),
    proofProvider: httpClientProofProvider(endpoints.proofServer),
    walletProvider: walletHandle.api,
    midnightProvider: walletHandle.api,
  };

  const contract = new Contract(witnesses);
  const persisted = state.getContractAddress(networkId);

  let deployed;
  if (persisted) {
    deployed = await findDeployedContract(providers, {
      contractAddress: persisted,
      contract,
    });
  } else {
    deployed = await deployContract(providers, {
      contract,
      privateStateId: 'pob:realdeal:private',
      initialPrivateState: {},
    });
    state.setContractAddress(
      networkId,
      deployed.deployTxData.public.contractAddress,
    );
  }

  const tx = deployed.callTx;
  const ensure = (name) => {
    const fn = tx[name];
    if (!fn) throw new Error(`Circuit "${name}" not callable.`);
    return fn;
  };
  const nowSec = () => BigInt(Math.floor(Date.now() / 1000));
  const nativeCoin = (value) => ({
    nonce: randomBytes32(),
    color: nativeToken(),
    value: BigInt(value),
  });

  return {
    address: deployed.deployTxData?.public?.contractAddress
      || state.getContractAddress(networkId),

    async createMatch({ mode, wagerAmount }) {
      const entropy = randomBytes32();
      const entropyHex = bytesToHex(entropy);
      const commit = pureCircuits.commitEntropy(entropy);
      const result = await ensure('createMatch')(
        BigInt(mode), BigInt(wagerAmount), commit, nowSec(),
        nativeCoin(wagerAmount),
      );
      const matchId = bytesToHex(result.public.result);
      state.persistEntropy(matchId, 'p1', entropyHex);
      return { matchId, entropy: entropyHex, txHash: result.public.txHash };
    },

    async joinMatch({ matchId, wagerAmount }) {
      const entropy = randomBytes32();
      const entropyHex = bytesToHex(entropy);
      const commit = pureCircuits.commitEntropy(entropy);
      const result = await ensure('joinMatch')(
        hexToBytes(matchId), commit, nativeCoin(wagerAmount),
      );
      state.persistEntropy(matchId, 'p2', entropyHex);
      return { entropy: entropyHex, txHash: result.public.txHash };
    },

    importEntropy(matchId, role, entropyHex) {
      if (!/^(0x)?[0-9a-fA-F]{64}$/.test(entropyHex)) {
        throw new Error('Entropy must be a 32-byte hex string');
      }
      state.persistEntropy(matchId, role, entropyHex.replace(/^0x/, ''));
    },

    async revealSeed({ matchId, startingRank = 0 }) {
      const p1 = state.getEntropy(matchId, 'p1');
      const p2 = state.getEntropy(matchId, 'p2');
      if (!p1 || !p2) {
        throw new Error(
          `revealSeed needs both entropies. Have p1=${!!p1} p2=${!!p2}.`
        );
      }
      const result = await ensure('revealSeed')(
        hexToBytes(matchId), hexToBytes(p1), hexToBytes(p2),
        BigInt(startingRank), nowSec(),
      );
      return { txHash: result.public.txHash };
    },

    async playCards({ matchId, cards, claimedRank, claimedCount }) {
      if (claimedCount !== cards.length) {
        throw new Error('claimedCount must equal cards.length');
      }
      const reveal = buildPlayReveal(cards);
      const playCommit = pureCircuits.commitPlay(reveal);
      const result = await ensure('playCards')(
        hexToBytes(matchId), playCommit,
        BigInt(claimedRank), BigInt(claimedCount), nowSec(),
      );
      state.persistPlayReveal(matchId, dumpReveal(reveal));
      return { playCommit: bytesToHex(playCommit), txHash: result.public.txHash };
    },

    async acceptClaim({ matchId }) {
      const r = await ensure('acceptClaim')(hexToBytes(matchId), nowSec());
      return { txHash: r.public.txHash };
    },

    async challengeClaim({ matchId }) {
      const r = await ensure('challengeClaim')(hexToBytes(matchId), nowSec());
      return { txHash: r.public.txHash };
    },

    async resolveChallenge({ matchId }) {
      const dump = state.loadPlayReveal(matchId);
      if (!dump) {
        throw new Error(
          `No stored play reveal for match ${matchId}. The challenged `
          + `player must call resolveChallenge from the same surface that `
          + `submitted playCards. (Surface = browser localStorage OR this `
          + `CLI's .pob-state/, not both.)`
        );
      }
      pendingReveal = rehydrateReveal(dump);
      try {
        const r = await ensure('resolveChallenge')(
          hexToBytes(matchId), nowSec(),
        );
        return {
          honest: Boolean(r.public.result),
          txHash: r.public.txHash,
        };
      } finally {
        pendingReveal = null;
      }
    },

    async claimPayout({ matchId }) {
      const r = await ensure('claimPayout')(hexToBytes(matchId));
      return { txHash: r.public.txHash };
    },

    async cancelUnjoinedMatch({ matchId }) {
      const r = await ensure('cancelUnjoinedMatch')(hexToBytes(matchId));
      return { txHash: r.public.txHash };
    },

    async forfeitAbandonedMatch({ matchId, timeoutSeconds = 86_400n }) {
      const r = await ensure('forfeitAbandonedMatch')(
        hexToBytes(matchId), nowSec(), BigInt(timeoutSeconds),
      );
      return { txHash: r.public.txHash };
    },

    async forfeitStalledChallenge({ matchId, timeoutSeconds = 3600n }) {
      const r = await ensure('forfeitStalledChallenge')(
        hexToBytes(matchId), nowSec(), BigInt(timeoutSeconds),
      );
      return { txHash: r.public.txHash };
    },

    async getMatch(matchId) {
      const r = await ensure('getMatch')(hexToBytes(matchId));
      return r.public.result;
    },

    async getMatchPhase(matchId) {
      const r = await ensure('getMatchPhase')(hexToBytes(matchId));
      return Number(r.public.result);
    },

    async getWinner(matchId) {
      const r = await ensure('getWinner')(hexToBytes(matchId));
      return Number(r.public.result);
    },
  };
}
