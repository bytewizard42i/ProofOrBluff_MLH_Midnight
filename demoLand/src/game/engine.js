/**
 * engine.js — Core game engine for Proof or Bluff
 *
 * Orchestrates the full game loop:
 *   Setup → Deal → Turn cycle → Challenge resolution → Win check
 *
 * This is the demoLand engine — all state is local, no blockchain.
 * The realDeal engine wraps the same logic but routes state through Midnight.
 */

import { createDeck, shuffleDeck, dealCards, getNextRank, RANKS } from './deck.js';
import { validatePlay, resolveChallenge, checkWinCondition, formatClaim, rankName } from './rules.js';

/**
 * Game state shape:
 * {
 *   mode: 'home' | 'casino',
 *   playerHand: Card[],
 *   aiHand: Card[],
 *   pile: Card[],
 *   currentRank: string,
 *   turn: 'player' | 'ai',
 *   status: 'setup' | 'playing' | 'challenged' | 'gameover',
 *   winner: 'player' | 'ai' | null,
 *   log: string[],
 *   lastPlay: { cards: Card[], claimedRank: string, claimedCount: number, player: string } | null,
 * }
 */

/**
 * Initialize a new game.
 */
const HAND_SIZE = 10;

function initGame(mode = 'home') {
  const deck = createDeck(mode);
  const shuffled = shuffleDeck(deck);
  // Deal a fixed-size hand to each side so the game stays brisk and pair
  // detection feels meaningful. Remaining cards stay out of play until a
  // challenge feeds them back via the pile.
  const playerHand = shuffled.slice(0, HAND_SIZE);
  const aiHand = shuffled.slice(HAND_SIZE, HAND_SIZE * 2);

  // Random starting rank
  const startingRank = RANKS[Math.floor(Math.random() * RANKS.length)];

  const state = {
    mode,
    playerHand,
    aiHand,
    pile: [],
    currentRank: startingRank,
    turn: 'player', // Player goes first
    status: 'playing',
    winner: null,
    log: [],
    lastPlay: null,
    // Running scoreboard. Updated by acceptClaim() and challenge(). Used by
    // the UI scoreboard panel and the bluff-probability estimator.
    stats: {
      rounds: 0,             // completed exchanges (accept or challenge resolution)
      aiPlays: 0,            // total Ai plays observed (denominator for bluff rate)
      aiBluffsCaught: 0,     // times you successfully called out an Ai bluff
      playerBluffsCaught: 0, // times you got caught bluffing
      playerFailedChallenges: 0, // times you challenged a TRUE claim (your bad call)
      aiFailedChallenges: 0, // times Ai challenged your honest claim
    },
  };

  state.log.push(`Game started in ${mode === 'casino' ? 'Casino' : 'Home'} Mode.`);
  state.log.push(`${playerHand.length} cards each. First rank to declare: ${rankName(startingRank)}.`);

  return state;
}

/**
 * Player (or AI) plays cards and makes a claim.
 * Returns updated state or an error.
 */
function playCards(state, { cardsPlayed, claimedRank, claimedCount, player }) {
  if (state.status !== 'playing') {
    return { error: 'Game is not in playing state.' };
  }

  if (state.turn !== player) {
    return { error: `It's not ${player}'s turn.` };
  }

  const hand = player === 'player' ? state.playerHand : state.aiHand;

  const validation = validatePlay({
    cardsPlayed,
    claimedRank,
    claimedCount,
    requiredRank: state.currentRank,
    playerHand: hand,
  });

  if (!validation.valid) {
    return { error: validation.errors.join(' ') };
  }

  // Remove played cards from hand
  const playedIds = new Set(cardsPlayed.map(c => c.id));
  const updatedHand = hand.filter(c => !playedIds.has(c.id));

  const newState = { ...state };
  if (player === 'player') {
    newState.playerHand = updatedHand;
  } else {
    newState.aiHand = updatedHand;
  }

  newState.lastPlay = {
    cards: cardsPlayed,
    claimedRank,
    claimedCount,
    player,
  };

  // Track Ai play count so the bluff-probability estimator has a denominator
  if (player === 'ai') {
    newState.stats = { ...state.stats, aiPlays: state.stats.aiPlays + 1 };
  }

  // Don't add to pile yet — opponent gets chance to challenge
  newState.status = 'playing';
  newState.turn = player === 'player' ? 'ai' : 'player';

  const claimText = formatClaim(claimedCount, claimedRank);
  const who = player === 'player' ? 'You' : 'AI';
  newState.log.push(`${who} played ${claimedCount} card(s) and claimed: "${claimText}".`);

  return { state: newState };
}

/**
 * Accept the last claim — cards go to pile, turn advances, rank progresses.
 */
function acceptClaim(state) {
  if (!state.lastPlay) {
    return { error: 'No play to accept.' };
  }

  const newState = { ...state };
  newState.pile = [...state.pile, ...state.lastPlay.cards];
  newState.currentRank = getNextRank(state.currentRank);
  newState.lastPlay = null;
  newState.stats = { ...state.stats, rounds: state.stats.rounds + 1 };

  const who = state.turn === 'player' ? 'You' : 'AI';
  newState.log.push(`${who} accepted the claim. Pile now has ${newState.pile.length} card(s). Next rank: ${rankName(newState.currentRank)}.`);

  return { state: newState };
}

/**
 * Challenge the last claim — "Proof or Bluff!"
 * Resolves via direct reveal (demoLand) or ZK proof (realDeal).
 */
function challenge(state) {
  if (!state.lastPlay) {
    return { error: 'No play to challenge.' };
  }

  const result = resolveChallenge({
    cardsPlayed: state.lastPlay.cards,
    claimedRank: state.lastPlay.claimedRank,
  });

  const newState = { ...state };
  const fullPile = [...state.pile, ...state.lastPlay.cards];
  // Was there a real pile to pick up, or was this challenge fired
  // before any prior accepts had stacked cards? When the pile started
  // empty, the only cards available are the ones the bluffer just
  // played — we surface that explicitly in the narration below.
  const pileWasEmpty = state.pile.length === 0;

  const challenger = state.turn; // The person whose turn it is now is the one challenging
  const bluffer = state.lastPlay.player;

  // Update scoreboard stats for this round.
  const newStats = { ...state.stats, rounds: state.stats.rounds + 1 };
  if (result.claimWasTrue) {
    // Challenger was wrong.
    if (challenger === 'player') newStats.playerFailedChallenges += 1;
    else newStats.aiFailedChallenges += 1;
  } else {
    // Bluffer got caught.
    if (bluffer === 'player') newStats.playerBluffsCaught += 1;
    else newStats.aiBluffsCaught += 1;
  }
  newState.stats = newStats;

  if (result.claimWasTrue) {
    // Challenger loses — picks up the pile
    if (challenger === 'player') {
      newState.playerHand = [...state.playerHand, ...fullPile];
    } else {
      newState.aiHand = [...state.aiHand, ...fullPile];
    }
    const who = challenger === 'player' ? 'You pick' : 'AI picks';
    newState.log.push(`CHALLENGE FAILED! The claim was true. ${who} up ${fullPile.length} card(s).`);
    if (pileWasEmpty) {
      newState.log.push(`The pile was empty — ${who.toLowerCase()} up the ${fullPile.length} card(s) just played as the penalty.`);
    }
  } else {
    // Bluffer loses — picks up the pile
    if (bluffer === 'player') {
      newState.playerHand = [...state.playerHand, ...fullPile];
    } else {
      newState.aiHand = [...state.aiHand, ...fullPile];
    }
    const who = bluffer === 'player' ? 'You pick' : 'AI picks';
    newState.log.push(`CAUGHT BLUFFING! The claim was false. ${who} up ${fullPile.length} card(s).`);
    if (pileWasEmpty) {
      newState.log.push(`The pile was empty — ${who.toLowerCase()} up the ${fullPile.length} card(s) just played as the penalty.`);
    }
  }

  newState.pile = [];
  newState.lastPlay = null;
  newState.currentRank = getNextRank(state.currentRank);

  // Check win conditions
  if (checkWinCondition(newState.playerHand)) {
    newState.status = 'gameover';
    newState.winner = 'player';
    newState.log.push('YOU WIN! Your hand is empty.');
  } else if (checkWinCondition(newState.aiHand)) {
    newState.status = 'gameover';
    newState.winner = 'ai';
    newState.log.push('AI WINS! The AI emptied its hand.');
  }

  return { state: newState, challengeResult: result };
}

export {
  initGame,
  playCards,
  acceptClaim,
  challenge,
};
