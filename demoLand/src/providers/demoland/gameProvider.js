/**
 * gameProvider.js — demoLand game provider
 *
 * Implements IGameProvider using client-side logic and localStorage.
 * No blockchain, no wallet, no ZK proofs. Pure local game state.
 */

import { initGame, playCards, acceptClaim, challenge } from '../../game/engine.js';

const STORAGE_KEY = 'pob_game_state';

class DemoLandGameProvider {
  constructor() {
    this.state = null;
  }

  /**
   * Start a new game.
   * @param {'home'|'casino'} mode - Game mode
   */
  startGame(mode = 'home') {
    this.state = initGame(mode);
    this.saveGameState(this.state);
    return this.state;
  }

  /**
   * Play cards and make a claim.
   */
  makePlay({ cardsPlayed, claimedRank, claimedCount, player }) {
    const result = playCards(this.state, { cardsPlayed, claimedRank, claimedCount, player });
    if (result.error) {
      return { error: result.error };
    }
    this.state = result.state;
    this.saveGameState(this.state);
    return { state: this.state };
  }

  /**
   * Accept the last claim.
   */
  accept() {
    const result = acceptClaim(this.state);
    if (result.error) {
      return { error: result.error };
    }
    this.state = result.state;
    this.saveGameState(this.state);
    return { state: this.state };
  }

  /**
   * Challenge the last claim — "Proof or Bluff!"
   * In demoLand this is a direct reveal. In realDeal this triggers a ZK proof.
   */
  callChallenge() {
    const result = challenge(this.state);
    if (result.error) {
      return { error: result.error };
    }
    this.state = result.state;
    this.saveGameState(this.state);
    return { state: this.state, challengeResult: result.challengeResult };
  }

  /**
   * Get the current game state.
   */
  getGameState() {
    if (!this.state) {
      this.state = this.loadGameState();
    }
    return this.state;
  }

  /**
   * Save game state to localStorage.
   */
  saveGameState(state) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }

  /**
   * Load game state from localStorage.
   */
  loadGameState() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return null;
  }

  /**
   * Reset — clear saved state.
   */
  resetGame() {
    this.state = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export { DemoLandGameProvider };
