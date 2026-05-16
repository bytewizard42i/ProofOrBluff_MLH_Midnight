/**
 * midnight/contract.js — Phase 2 wiring of every exported circuit on
 * proof-or-bluff.compact.
 *
 * Design notes:
 *   - `pureCircuits.commitEntropy()` and `pureCircuits.commitPlay()` are
 *     thin off-chain mirrors of the on-chain hashes (added to the .compact
 *     in Phase 2). The client uses them to produce commits the contract
 *     can later re-verify.
 *   - All "private" data (entropies, play witnesses) lives in localStorage
 *     keyed by matchId. For a single-machine demo (Lace profile A vs 1AM
 *     profile B) each wallet has its own storage, so creators / joiners
 *     must paste the missing piece across browsers before revealSeed.
 *     The UI exposes those values explicitly.
 *   - resolveChallenge consumes a private PlayRevealWitness via the
 *     `revealLastPlay` witness slot. We stage the witness with
 *     setPendingReveal() right before the call.
 */

import { findDeployedContract, deployContract } from
  '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from
  '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from
  '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { fetchZkConfigProvider } from
  '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { setNetworkId } from
  '@midnight-ntwrk/midnight-js-network-id';
import { nativeToken } from '@midnight-ntwrk/ledger';

import { Contract, pureCircuits } from '@pob/contract';
import { ENDPOINTS, NETWORK_ID, getContractAddress, setContractAddress }
  from './config.js';

// ---------------------------------------------------------------------------
// Network registration

// In midnight-js-network-id v4.0.4 NetworkId is just a string alias
// ('undeployed' | 'testnet' | 'mainnet') — pass the raw id through.
setNetworkId(NETWORK_ID);

// ---------------------------------------------------------------------------
// Witness staging (used by resolveChallenge)

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
// Encoding helpers

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

/**
 * Build a PlayRevealWitness in the shape pureCircuits.commitPlay expects.
 * `cards` is an array of up to 4 numeric ranks (2..14). Unused slots are
 * filled with zeros and a per-slot fresh salt (so the hash domain is
 * still well-defined).
 */
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

// ---------------------------------------------------------------------------
// LocalStorage keys (private state per matchId)

const KEY_ENTROPY     = (mid, role) => `pob:realdeal:entropy:${mid}:${role}`;
const KEY_PLAY_REVEAL = (mid)       => `pob:realdeal:play:${mid}`;

function persistEntropy(matchId, role, entropyHex) {
  window.localStorage.setItem(KEY_ENTROPY(matchId, role), entropyHex);
}

export function getStoredEntropy(matchId, role) {
  return window.localStorage.getItem(KEY_ENTROPY(matchId, role));
}

export function importEntropy(matchId, role, entropyHex) {
  // Used when the opponent pastes their entropy after a join.
  if (!/^[0-9a-fA-F]{64}$/.test(entropyHex.replace(/^0x/, ''))) {
    throw new Error('Entropy must be a 32-byte hex string');
  }
  persistEntropy(matchId, role, entropyHex.replace(/^0x/, ''));
}

function persistPlayReveal(matchId, reveal) {
  // Convert BigInt + Uint8Array to a JSON-friendly shape.
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
// Provider bundle + contract resolution

function buildProviders({ walletHandle }) {
  return {
    privateStateProvider: walletHandle.api.privateStateProvider,
    publicDataProvider: indexerPublicDataProvider(
      ENDPOINTS.indexer,
      ENDPOINTS.indexerWs
    ),
    zkConfigProvider: fetchZkConfigProvider(
      `${window.location.origin}/managed/proof-or-bluff`
    ),
    proofProvider: httpClientProofProvider(ENDPOINTS.proofServer),
    walletProvider: walletHandle.api,
    midnightProvider: walletHandle.api,
  };
}

async function resolveContract(providers) {
  const contract = new Contract(witnesses);
  const persisted = getContractAddress();

  if (persisted) {
    return findDeployedContract(providers, {
      contractAddress: persisted,
      contract,
    });
  }

  const deployed = await deployContract(providers, {
    contract,
    privateStateId: 'pob:realdeal:private',
    initialPrivateState: {},
  });
  setContractAddress(deployed.deployTxData.public.contractAddress);
  return deployed;
}

// ---------------------------------------------------------------------------
// Public factory

export async function getContractApi({ walletHandle }) {
  const providers = buildProviders({ walletHandle });
  const deployed = await resolveContract(providers);
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

  function nativeCoin(value) {
    return {
      nonce: randomBytes32(),
      color: nativeToken(),
      value: BigInt(value),
    };
  }

  return {
    address: deployed.deployTxData?.public?.contractAddress
      || getContractAddress(),

    // Expose the indexer view of public match state (used by the UI to
    // poll phase / scores / hand sizes between writes).
    async getMatch(matchId) {
      const result = await ensure('getMatch')(hexToBytes(matchId));
      return result.public.result;
    },
    async getMatchPhase(matchId) {
      const result = await ensure('getMatchPhase')(hexToBytes(matchId));
      return Number(result.public.result);
    },
    async getWinner(matchId) {
      const result = await ensure('getWinner')(hexToBytes(matchId));
      return Number(result.public.result);
    },

    // ----- createMatch (Player One) ---------------------------------------
    async createMatch({ mode, wagerAmount }) {
      const entropy = randomBytes32();
      const entropyHex = bytesToHex(entropy);
      const commit = pureCircuits.commitEntropy(entropy);
      const coin = nativeCoin(wagerAmount);

      const result = await ensure('createMatch')(
        BigInt(mode),
        BigInt(wagerAmount),
        commit,
        nowSec(),
        coin
      );

      const matchId = bytesToHex(result.public.result);
      persistEntropy(matchId, 'p1', entropyHex);
      return {
        matchId,
        entropy: entropyHex,
        txHash: result.public.txHash,
      };
    },

    // ----- joinMatch (Player Two) -----------------------------------------
    async joinMatch({ matchId, wagerAmount }) {
      const entropy = randomBytes32();
      const entropyHex = bytesToHex(entropy);
      const commit = pureCircuits.commitEntropy(entropy);
      const coin = nativeCoin(wagerAmount);

      const result = await ensure('joinMatch')(
        hexToBytes(matchId),
        commit,
        coin
      );
      persistEntropy(matchId, 'p2', entropyHex);
      return {
        entropy: entropyHex,
        txHash: result.public.txHash,
      };
    },

    // ----- revealSeed (either player, after both entropies are exchanged) -
    // The caller MUST have both entropies in localStorage. Use
    // importEntropy(matchId, 'p1' | 'p2', hex) to paste in the missing one
    // before this call.
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
      return { txHash: result.public.txHash };
    },

    // ----- playCards (active player makes a claim) ------------------------
    // `cards` is an array of 1-4 numeric ranks (2..14, where 14 = Ace).
    // The contract only sees the commit + claimedRank + claimedCount; the
    // actual ranks (which may be a bluff) stay in localStorage until
    // resolveChallenge.
    async playCards({ matchId, cards, claimedRank, claimedCount }) {
      if (claimedCount !== cards.length) {
        // The contract enforces count consistency only at challenge time,
        // but we'd rather catch the bug client-side.
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
        txHash: result.public.txHash,
      };
    },

    // ----- acceptClaim / challengeClaim (opponent decides) ----------------
    async acceptClaim({ matchId }) {
      const result = await ensure('acceptClaim')(
        hexToBytes(matchId),
        nowSec()
      );
      return { txHash: result.public.txHash };
    },

    async challengeClaim({ matchId }) {
      const result = await ensure('challengeClaim')(
        hexToBytes(matchId),
        nowSec()
      );
      return { txHash: result.public.txHash };
    },

    // ----- resolveChallenge (THE ZK SHOWCASE) -----------------------------
    // Stages the persisted play reveal as the private witness, then calls
    // the circuit. The contract recomputes the hash and discloses ONLY a
    // boolean (true ⇒ honest claim, false ⇒ bluff).
    async resolveChallenge({ matchId }) {
      const reveal = loadPlayReveal(matchId);
      setPendingReveal(reveal);
      try {
        const result = await ensure('resolveChallenge')(
          hexToBytes(matchId),
          nowSec()
        );
        return {
          honest: Boolean(result.public.result),
          txHash: result.public.txHash,
        };
      } finally {
        clearPendingReveal();
      }
    },

    // ----- claimPayout (winner pulls the shielded pot) --------------------
    async claimPayout({ matchId }) {
      const result = await ensure('claimPayout')(hexToBytes(matchId));
      return { txHash: result.public.txHash };
    },

    // ----- Anti-griefing paths --------------------------------------------
    async cancelUnjoinedMatch({ matchId }) {
      const result = await ensure('cancelUnjoinedMatch')(hexToBytes(matchId));
      return { txHash: result.public.txHash };
    },

    async forfeitAbandonedMatch({ matchId, timeoutSeconds = 86_400n }) {
      const result = await ensure('forfeitAbandonedMatch')(
        hexToBytes(matchId),
        nowSec(),
        BigInt(timeoutSeconds)
      );
      return { txHash: result.public.txHash };
    },

    async forfeitStalledChallenge({ matchId, timeoutSeconds = 3600n }) {
      const result = await ensure('forfeitStalledChallenge')(
        hexToBytes(matchId),
        nowSec(),
        BigInt(timeoutSeconds)
      );
      return { txHash: result.public.txHash };
    },
  };
}
