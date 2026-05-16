/**
 * scripted.js — Pre-created AI opponent for Iterations 1 and 2
 *
 * The scripted AI makes decisions based on simple heuristics and
 * responds with pre-written dialogue lines. No LLM required.
 *
 * Difficulty levels affect bluff frequency, challenge accuracy,
 * and whether the AI tracks cards.
 */

import { RANKS } from '../deck.js';

// ─── Pre-created dialogue lines ───

const DIALOGUE = {
  claim: {
    confident: [
      "Easy. Take it or leave it.",
      "I wouldn't lie to you... or would I?",
      "Straight truth. Scout's honor.",
      "These cards don't lie. Well, I might.",
      "Read 'em and weep. Or don't. Your call.",
    ],
    nervous: [
      "Um... yeah, that's what I played. Probably.",
      "I mean... it's definitely those. I think.",
      "Look, just trust me on this one, okay?",
      "Why are you looking at me like that?",
      "I swear. Would this face lie to you?",
    ],
    bluffing: [
      "Absolutely, positively, one hundred percent real.",
      "*slides cards slowly* ...nothing to see here.",
      "I have never been more honest in my entire life.",
      "Trust. Me.",
      "These are definitely, certainly, without question, those cards.",
    ],
  },
  challengeCall: [
    "Proof or Bluff! Show me what you've got.",
    "Nope. I'm calling it. Prove it.",
    "Nice try. Let's see the truth.",
    "I don't buy it. Proof or Bluff!",
    "Something smells fishy. Challenge!",
  ],
  challengeWon: [
    "Ha! Caught you. Pick 'em up.",
    "I KNEW it. Bluffer!",
    "My instincts never fail. Well, sometimes.",
    "Gotcha. Enjoy your new cards.",
    "Truth always wins. Eventually.",
  ],
  challengeLost: [
    "Wait... you were telling the truth?!",
    "Okay, fine. I deserve this pile.",
    "I take it back. Bad call.",
    "Well this is embarrassing.",
    "Note to self: trust more, challenge less.",
  ],
  gotCaught: [
    "Okay okay, you got me.",
    "Fair. I was absolutely lying.",
    "I regret nothing. Except getting caught.",
    "In my defense, it was a great bluff.",
    "You're annoyingly good at this.",
  ],
  bluffWorked: [
    "*quiet smirk*",
    "Thank you for your trust. It was misplaced.",
    "Sucker.",
    "And they say honesty is the best policy...",
    "If you only knew...",
  ],
  acceptClaim: [
    "Fine, I'll let that slide.",
    "Okay, I believe you. For now.",
    "Hmm. Alright.",
    "I'll allow it.",
    "You get a pass this time.",
  ],
  winning: [
    "Better luck next time!",
    "The house always wins. Wait, I'm not the house.",
    "GG. Rematch?",
    "I'd say sorry, but I'm not.",
    "Victory tastes sweet.",
  ],
  losing: [
    "Well played. I'll get you next time.",
    "Okay, you're good. I admit it.",
    "Rematch. Right now. I demand it.",
    "I let you win. Obviously.",
    "This changes nothing between us.",
  ],
};

/**
 * Pick a random item from an array.
 */
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ─── AI Decision Making ───

/**
 * Difficulty profiles:
 *   easy:   bluffs rarely, challenges rarely, no card tracking
 *   medium: bluffs sometimes, challenges when suspicious, basic tracking
 *   hard:   bluffs strategically, challenges smartly, full tracking
 */
const DIFFICULTY_PROFILES = {
  easy: {
    bluffChance: 0.2,         // 20% chance of bluffing when it could play honestly
    challengeChance: 0.15,    // 15% base chance to challenge any claim
    tracksCards: false,
  },
  medium: {
    bluffChance: 0.35,
    challengeChance: 0.3,
    tracksCards: false,        // Basic awareness but not full counting
  },
  hard: {
    bluffChance: 0.5,
    challengeChance: 0.45,
    tracksCards: true,         // Full card counting in Home Mode
  },
};

/**
 * Decide what to play on the AI's turn.
 *
 * Returns: { cardsToPlay: Card[], claimedRank: string, isBluff: boolean, dialogue: string }
 */
function decidePlay({ aiHand, requiredRank, difficulty = 'medium', mode = 'home' }) {
  const profile = DIFFICULTY_PROFILES[difficulty] || DIFFICULTY_PROFILES.medium;

  // Find cards in hand that match the required rank
  const matchingCards = aiHand.filter(c => c.rank === requiredRank);

  let cardsToPlay;
  let isBluff;

  // Hard cap on how many cards the AI claims in a single play. A 52-card
  // deck has only 4 of each rank, so claiming more than 4 of the same
  // rank is impossible and would be a tell. Matches the player's
  // "select 1-4 cards" limit too.
  const MAX_CLAIM = 4;

  if (matchingCards.length > 0) {
    // AI has matching cards — decide whether to play them honestly or bluff anyway
    if (Math.random() < profile.bluffChance && aiHand.length > matchingCards.length) {
      // Bluff: play some non-matching cards instead (strategic deception)
      const nonMatching = aiHand.filter(c => c.rank !== requiredRank);
      const bluffCount = Math.min(Math.floor(Math.random() * MAX_CLAIM) + 1, nonMatching.length, MAX_CLAIM);
      cardsToPlay = nonMatching.slice(0, bluffCount);
      isBluff = true;
    } else {
      // Play honestly — some or all matching cards
      const playCount = Math.min(matchingCards.length, Math.floor(Math.random() * MAX_CLAIM) + 1, MAX_CLAIM);
      cardsToPlay = matchingCards.slice(0, playCount);
      isBluff = false;
    }
  } else {
    // No matching cards — must bluff
    const bluffCount = Math.min(Math.floor(Math.random() * MAX_CLAIM) + 1, aiHand.length, MAX_CLAIM);
    cardsToPlay = aiHand.slice(0, bluffCount);
    isBluff = true;
  }

  // Pick dialogue based on whether bluffing
  let dialogue;
  if (isBluff) {
    dialogue = pickRandom(DIALOGUE.claim.bluffing);
  } else {
    dialogue = pickRandom(Math.random() > 0.5 ? DIALOGUE.claim.confident : DIALOGUE.claim.nervous);
  }

  return {
    cardsToPlay,
    claimedRank: requiredRank,
    claimedCount: cardsToPlay.length,
    isBluff,
    dialogue,
  };
}

/**
 * Decide whether to challenge the player's claim.
 *
 * Returns: { shouldChallenge: boolean, dialogue: string }
 */
function decideChallenge({ playerClaimedRank, playerClaimedCount, aiHand, difficulty = 'medium', mode = 'home' }) {
  const profile = DIFFICULTY_PROFILES[difficulty] || DIFFICULTY_PROFILES.medium;

  let challengeProbability = profile.challengeChance;

  // In Home Mode with card tracking, adjust based on what AI knows
  if (profile.tracksCards && mode === 'home') {
    // Count how many of the claimed rank the AI holds
    const aiHoldsOfRank = aiHand.filter(c => c.rank === playerClaimedRank).length;
    // In a single deck there are only 4 of each rank
    // If AI holds 3 of them and player claims 2, that's suspicious
    const maxPossibleForPlayer = 4 - aiHoldsOfRank;
    if (playerClaimedCount > maxPossibleForPlayer) {
      challengeProbability = 0.95; // Near-certain challenge
    } else if (playerClaimedCount === maxPossibleForPlayer) {
      challengeProbability = 0.6; // Suspicious
    }
  }

  // Higher claimed counts are more suspicious
  if (playerClaimedCount >= 3) {
    challengeProbability += 0.1;
  }
  if (playerClaimedCount === 4) {
    challengeProbability += 0.15;
  }

  const shouldChallenge = Math.random() < Math.min(challengeProbability, 0.95);

  const dialogue = shouldChallenge
    ? pickRandom(DIALOGUE.challengeCall)
    : pickRandom(DIALOGUE.acceptClaim);

  return { shouldChallenge, dialogue };
}

/**
 * Get a reaction line after a challenge is resolved.
 */
function getChallengeReaction({ aiWasChallenger, claimWasTrue }) {
  if (aiWasChallenger) {
    return claimWasTrue
      ? pickRandom(DIALOGUE.challengeLost)  // AI challenged, claim was true → AI loses
      : pickRandom(DIALOGUE.challengeWon);  // AI challenged, claim was false → AI wins
  } else {
    return claimWasTrue
      ? pickRandom(DIALOGUE.bluffWorked)    // Wait — this means player challenged AI's true claim
      : pickRandom(DIALOGUE.gotCaught);     // Player caught AI bluffing
  }
}

/**
 * Get a game-over line.
 */
function getGameOverDialogue(aiWon) {
  return aiWon ? pickRandom(DIALOGUE.winning) : pickRandom(DIALOGUE.losing);
}

export {
  DIALOGUE,
  DIFFICULTY_PROFILES,
  decidePlay,
  decideChallenge,
  getChallengeReaction,
  getGameOverDialogue,
  pickRandom,
};
