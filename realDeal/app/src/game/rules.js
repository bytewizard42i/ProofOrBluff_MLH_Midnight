/**
 * rules.js — Rule enforcement for Proof or Bluff
 *
 * Validates plays, resolves challenges, checks win conditions,
 * and manages rank progression.
 */

import { RANKS, getNextRank } from './deck.js';

/**
 * Validate that a play is structurally legal.
 * - Must play 1-4 cards
 * - Cards must actually be in the player's hand
 * - Claim must declare the current required rank
 *
 * Note: the cards do NOT need to match the claimed rank — that's the whole point.
 * Bluffing is legal. Only the claim's rank must match the sequence.
 */
function validatePlay({ cardsPlayed, claimedRank, claimedCount, requiredRank, playerHand }) {
  const errors = [];

  if (cardsPlayed.length < 1 || cardsPlayed.length > 4) {
    errors.push(`Must play 1-4 cards. You tried to play ${cardsPlayed.length}.`);
  }

  if (claimedCount !== cardsPlayed.length) {
    errors.push(`Claimed ${claimedCount} cards but played ${cardsPlayed.length}.`);
  }

  if (claimedRank !== requiredRank) {
    errors.push(`Must claim rank "${requiredRank}" this turn. You claimed "${claimedRank}".`);
  }

  // Check that all played cards are actually in the player's hand
  const handIds = new Set(playerHand.map(c => c.id));
  for (const card of cardsPlayed) {
    if (!handIds.has(card.id)) {
      errors.push(`Card ${card.id} is not in your hand.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Resolve a challenge.
 *
 * Checks whether the cards actually played match the claimed rank.
 * Returns:
 *   - claimWasTrue: boolean
 *   - revealedCards: the cards that were played (minimum disclosure)
 *   - penaltyTarget: 'challenger' or 'bluffer'
 *
 * In demoLand this is a direct reveal.
 * In realDeal this becomes a ZK proof (true/false only, cards not revealed).
 */
function resolveChallenge({ cardsPlayed, claimedRank }) {
  const allMatch = cardsPlayed.every(card => card.rank === claimedRank);

  return {
    claimWasTrue: allMatch,
    revealedCards: cardsPlayed, // demoLand: full reveal. realDeal: ZK proof only.
    penaltyTarget: allMatch ? 'challenger' : 'bluffer',
  };
}

/**
 * Apply the challenge penalty: loser picks up the entire pile.
 * Returns updated hands and an empty pile.
 */
function applyChallengePenalty({ penaltyTarget, playerHand, aiHand, pile, cardsPlayed }) {
  // The cards that were played go back into the pile before pickup
  const fullPile = [...pile, ...cardsPlayed];

  if (penaltyTarget === 'challenger') {
    // The person who called the challenge (wrongly) picks up the pile
    // If AI challenged the player's truthful claim → AI picks up
    // If player challenged the AI's truthful claim → player picks up
    return { playerHand, aiHand, pile: fullPile, pickupTarget: penaltyTarget };
  } else {
    // The bluffer picks up the pile
    return { playerHand, aiHand, pile: fullPile, pickupTarget: penaltyTarget };
  }
}

/**
 * Check if a player has won (hand is empty).
 */
function checkWinCondition(hand) {
  return hand.length === 0;
}

/**
 * Get a human-readable claim string.
 * e.g., "Two Kings" or "One Ace" or "Three 7s"
 */
// Spelled-out display names for face cards and the ace. Used everywhere
// claims are surfaced to the player: log lines, the big rank label, the
// selection panel, the TTS narration.
const RANK_NAMES = {
  J: { single: 'Jack',  plural: 'Jacks'  },
  Q: { single: 'Queen', plural: 'Queens' },
  K: { single: 'King',  plural: 'Kings'  },
  A: { single: 'Ace',   plural: 'Aces'   },
};

function rankName(rank, plural = false) {
  if (RANK_NAMES[rank]) return plural ? RANK_NAMES[rank].plural : RANK_NAMES[rank].single;
  // Numeric ranks: '6' -> '6es', everything else -> '<n>s'.
  if (!plural) return rank;
  return rank === '6' ? '6es' : `${rank}s`;
}

function formatClaim(count, rank) {
  const countWords = { 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four' };
  const word = rankName(rank, count !== 1);
  return `${countWords[count] || count} ${word}`;
}

export {
  validatePlay,
  resolveChallenge,
  applyChallengePenalty,
  checkWinCondition,
  formatClaim,
  rankName,
};
