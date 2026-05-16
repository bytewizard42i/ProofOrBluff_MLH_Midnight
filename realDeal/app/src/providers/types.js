/**
 * types.js — Shared provider interfaces for Proof or Bluff
 *
 * Both demoLand and realDeal implement these same interfaces.
 * The factory (index.js) selects which implementation to use
 * based on the NEXT_PUBLIC_POB_MODE environment variable.
 *
 * This follows the same provider pattern used across DIDzMonolith
 * (AutoDiscovery, ProMingle, etc.).
 */

/**
 * IGameProvider — Core game logic interface
 *
 * Methods:
 *   initGame(mode)                → GameState
 *   playCards(state, play)        → { state, error? }
 *   acceptClaim(state)            → { state, error? }
 *   challenge(state)              → { state, challengeResult, error? }
 *   getGameState()                → GameState
 *   saveGameState(state)          → void
 *   resetGame()                   → void
 *
 * demoLand: localStorage + client-side logic
 * realDeal: Midnight private state + ZK proofs
 */

/**
 * IAiProvider — AI opponent interface
 *
 * Methods:
 *   init(config)                  → void
 *   decidePlay(gameContext)        → { cardsToPlay, claimedRank, claimedCount, dialogue, mediaHint? }
 *   decideChallenge(gameContext)   → { shouldChallenge, dialogue, mediaHint? }
 *   getReaction(result)           → { dialogue, mediaHint?, emotionTag? }
 *   getGameOverMessage(aiWon)     → { dialogue, mediaHint? }
 *
 * demoLand Iteration 1-2: scripted.js
 * demoLand Iteration 3:   agent.js (live LLM)
 * realDeal:               same AI, but game state comes from Midnight
 */

/**
 * IMediaProvider — Character media interface (Iteration 2+)
 *
 * Methods:
 *   getCharacters()               → Character[]
 *   getExpression(characterId, emotion) → { imageUrl, videoUrl? }
 *   getDealerIntroVideo()         → { videoUrl }
 *   getThemes()                   → Theme[]
 *
 * Iteration 1: returns null/empty (text only)
 * Iteration 2+: returns actual media assets
 */

/**
 * IWagerProvider — Wager/stake management (realDeal Casino Mode only)
 *
 * Methods:
 *   connectWallet()               → { address, balance }
 *   placeBet(amount)              → { txHash }
 *   claimWinnings()               → { txHash, amount }
 *   getWagerState()               → { playerStake, aiStake, pot }
 *
 * demoLand: mock / play money
 * realDeal: Lace wallet + Midnight tokens
 */

// These are documentation-only in this file.
// Actual implementations live in:
//   demoLand/src/providers/demoland/
//   realDeal/src/providers/realdeal/

export default {
  description: 'Provider type definitions for Proof or Bluff. See comments above.',
};
