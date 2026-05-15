/**
 * aiProvider.js — demoLand AI provider
 *
 * Wraps the scripted AI (Iterations 1-2) in the standard IAiProvider interface.
 * Iteration 3 will swap this for the agent-based provider.
 */

import {
  decidePlay,
  decideChallenge,
  getChallengeReaction,
  getGameOverDialogue,
} from '../../game/ai/scripted.js';

class DemoLandAiProvider {
  constructor() {
    this.difficulty = 'medium';
    this.mode = 'home';
  }

  /**
   * Initialize the AI with settings.
   */
  init({ difficulty = 'medium', mode = 'home' }) {
    this.difficulty = difficulty;
    this.mode = mode;
  }

  /**
   * AI decides what to play on its turn.
   */
  getPlay({ aiHand, requiredRank }) {
    return decidePlay({
      aiHand,
      requiredRank,
      difficulty: this.difficulty,
      mode: this.mode,
    });
  }

  /**
   * AI decides whether to challenge the player's claim.
   */
  getChallenge({ playerClaimedRank, playerClaimedCount, aiHand }) {
    return decideChallenge({
      playerClaimedRank,
      playerClaimedCount,
      aiHand,
      difficulty: this.difficulty,
      mode: this.mode,
    });
  }

  /**
   * AI reacts to challenge resolution.
   */
  getReaction({ aiWasChallenger, claimWasTrue }) {
    return getChallengeReaction({ aiWasChallenger, claimWasTrue });
  }

  /**
   * AI says something when the game ends.
   */
  getGameOver(aiWon) {
    return getGameOverDialogue(aiWon);
  }
}

export { DemoLandAiProvider };
