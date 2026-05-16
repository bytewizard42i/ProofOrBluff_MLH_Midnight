/**
 * gameProvider.js — realDeal IGameProvider implementation.
 *
 * Phase 1 status: only `createMatch` is wired to the contract; every
 * other method throws "Phase 2: not yet wired". The shape matches the
 * IGameProvider docstring in `src/providers/types.js` so a future swap
 * via `providers/index.js` is a one-line change.
 *
 * The realDeal flow is fundamentally different from demoLand in two ways:
 *   1. There is NO AI opponent. realDeal is strictly PvP — matches wait
 *      in WAITING_FOR_PLAYER_TWO until a real wallet calls joinMatch.
 *   2. Game state lives ON-CHAIN. We poll/subscribe via the indexer
 *      instead of mutating a local object.
 */

import { getContractApi } from '../../midnight/contract.js';

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

  async startGame({ mode = 1, wagerAmount = 5 } = {}) {
    const api = await this._ensureApi();
    const result = await api.createMatch({ mode, wagerAmount });
    this.activeMatchId = result.matchId;
    try {
      window.localStorage.setItem(STORAGE_KEY, result.matchId);
    } catch { /* localStorage may be unavailable */ }
    return result;
  }

  async makePlay() {
    throw new Error('Phase 2: makePlay (playCards) not yet wired.');
  }

  async accept() {
    throw new Error('Phase 2: accept (acceptClaim) not yet wired.');
  }

  async challenge() {
    throw new Error('Phase 2: challenge (challengeClaim + resolveChallenge) not yet wired.');
  }

  async getGameState() {
    throw new Error('Phase 2: getGameState (indexer subscription on matches Map) not yet wired.');
  }

  resetGame() {
    this.activeMatchId = null;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }
}

export default RealDealGameProvider;
