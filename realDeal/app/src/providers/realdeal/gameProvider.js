/**
 * gameProvider.js — realDeal IGameProvider implementation.
 *
 * Phase 2 status: every circuit on proof-or-bluff.compact has a wired
 * call here. Two flows that DON'T exist in demoLand:
 *   1. There is NO AI opponent. realDeal is strictly PvP — matches wait
 *      in WAITING_FOR_PLAYER_TWO until a real wallet calls joinMatch.
 *   2. Game state lives ON-CHAIN. We read it via api.getMatch() against
 *      the indexer instead of mutating a local object.
 *
 * This provider keeps a thin in-memory cache of the last fetched match
 * state so the React tree can render between polls without thrashing
 * the indexer.
 */

import { getContractApi, importEntropy as importEntropyHex }
  from '../../midnight/contract.js';

const STORAGE_KEY = 'pob:realdeal:active-match';

export class RealDealGameProvider {
  constructor({ walletHandle }) {
    if (!walletHandle) {
      throw new Error('RealDealGameProvider requires a connected wallet.');
    }
    this.walletHandle = walletHandle;
    this.api = null;
    this.activeMatchId = null;
    try {
      this.activeMatchId =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
    } catch {
      this.activeMatchId = null;
    }
  }

  async _ensureApi() {
    if (!this.api) {
      this.api = await getContractApi({ walletHandle: this.walletHandle });
    }
    return this.api;
  }

  _setActiveMatch(matchId) {
    this.activeMatchId = matchId;
    try {
      if (matchId) window.localStorage.setItem(STORAGE_KEY, matchId);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch { /* localStorage may be unavailable */ }
  }

  // Player One: deploy + open a new match.
  async startGame({ mode = 1, wagerAmount = 5 } = {}) {
    const api = await this._ensureApi();
    const result = await api.createMatch({ mode, wagerAmount });
    this._setActiveMatch(result.matchId);
    return result;
  }

  // Player Two: pick up an existing match by id.
  async joinMatch({ matchId, wagerAmount }) {
    const api = await this._ensureApi();
    const result = await api.joinMatch({ matchId, wagerAmount });
    this._setActiveMatch(matchId);
    return result;
  }

  // Either player: paste in the opponent's entropy hex (after both
  // sides have committed) so revealSeed has the inputs it needs.
  importEntropy(role, entropyHex) {
    if (!this.activeMatchId) {
      throw new Error('No active match — call startGame or joinMatch first.');
    }
    importEntropyHex(this.activeMatchId, role, entropyHex);
  }

  async revealSeed({ startingRank = 0 } = {}) {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.revealSeed({ matchId: this.activeMatchId, startingRank });
  }

  // Active player declares a play. `cards` is the actual hand of 1-4
  // ranks (may include a bluff); `claimedRank` is what they declare.
  async makePlay({ cards, claimedRank, claimedCount = cards.length } = {}) {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.playCards({
      matchId: this.activeMatchId,
      cards,
      claimedRank,
      claimedCount,
    });
  }

  async accept() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.acceptClaim({ matchId: this.activeMatchId });
  }

  // Two-step challenge: first the opponent issues challengeClaim, then
  // the original claimer (in their browser) calls resolveChallenge to
  // expose the witness. Each player calls the right method from their
  // own session.
  async challenge() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.challengeClaim({ matchId: this.activeMatchId });
  }

  async resolveChallenge() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.resolveChallenge({ matchId: this.activeMatchId });
  }

  async claimPayout() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.claimPayout({ matchId: this.activeMatchId });
  }

  async cancelUnjoinedMatch() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.cancelUnjoinedMatch({ matchId: this.activeMatchId });
  }

  async forfeitAbandonedMatch({ timeoutSeconds } = {}) {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.forfeitAbandonedMatch({
      matchId: this.activeMatchId,
      timeoutSeconds,
    });
  }

  async forfeitStalledChallenge({ timeoutSeconds } = {}) {
    const api = await this._ensureApi();
    if (!this.activeMatchId) throw new Error('No active match.');
    return api.forfeitStalledChallenge({
      matchId: this.activeMatchId,
      timeoutSeconds,
    });
  }

  // Read public match state from the indexer. Returns the full record
  // (phase, scores, hand sizes, winner, etc.) — see the Ledger.matches
  // type in the compiled bindings.
  async getGameState() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) return null;
    return api.getMatch(this.activeMatchId);
  }

  async getMatchPhase() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) return null;
    return api.getMatchPhase(this.activeMatchId);
  }

  async getWinner() {
    const api = await this._ensureApi();
    if (!this.activeMatchId) return null;
    return api.getWinner(this.activeMatchId);
  }

  resetGame() {
    this._setActiveMatch(null);
  }
}

export default RealDealGameProvider;
