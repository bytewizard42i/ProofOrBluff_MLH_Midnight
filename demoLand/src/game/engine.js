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
 * Replenish `deck` by recycling `discardPile` when the deck doesn't have
 * enough cards to satisfy a pending draw. Mirrors the casino "reshoe"
 * convention: as soon as the live deck would underflow, the discard
 * pile is shuffled and pushed back as the new tail of the draw deck,
 * and the discard pile is emptied.
 *
 * Returns { deck, discardPile, recycled } so callers can narrate the
 * reshuffle in the game log when it actually happened.
 *
 * If both decks are empty there is genuinely nothing to draw — the
 * caller is expected to fall back to drawCount = deck.length and log
 * that the round ran out of cards.
 */
function replenishDeck(deck, discardPile, needed) {
  if (deck.length >= needed) {
    return { deck, discardPile, recycled: 0 };
  }
  if (!discardPile || discardPile.length === 0) {
    return { deck, discardPile: discardPile || [], recycled: 0 };
  }
  const reshuffledDiscards = shuffleDeck(discardPile);
  return {
    deck: [...deck, ...reshuffledDiscards],
    discardPile: [],
    recycled: reshuffledDiscards.length,
  };
}

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
  const fullDeck = createDeck(mode);
  const shuffled = shuffleDeck(fullDeck);
  // Deal a fixed-size hand to each side so the game stays brisk and pair
  // detection feels meaningful. Remaining cards stay out of play until a
  // challenge feeds them back via the pile.
  const playerHand = shuffled.slice(0, HAND_SIZE);
  const aiHand = shuffled.slice(HAND_SIZE, HAND_SIZE * 2);
  // Remaining cards form the draw deck. Used when:
  //  - a player passes their turn (draw 1)
  //  - someone is caught bluffing with an empty pile (minimum 2-card
  //    penalty enforced by topping up from the deck)
  const deck = shuffled.slice(HAND_SIZE * 2);

  // Random starting rank
  const startingRank = RANKS[Math.floor(Math.random() * RANKS.length)];

  const state = {
    mode,
    playerHand,
    aiHand,
    deck,
    pile: [],
    // Cards that have left play. When a challenge resolves, the active
    // pile is discarded here instead of being scooped into a hand — the
    // losing player draws fresh cards from the (reshuffled) deck as the
    // penalty. Tracked so the bluff-probability estimator and any future
    // ZK proofs can account for cards no longer in circulation.
    discardPile: [],
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
  newState.log = [...state.log];
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
  newState.log = [...state.log];
  newState.pile = [...state.pile, ...state.lastPlay.cards];
  newState.currentRank = getNextRank(state.currentRank);
  newState.lastPlay = null;
  newState.stats = { ...state.stats, rounds: state.stats.rounds + 1 };

  const who = state.turn === 'player' ? 'You' : 'AI';
  newState.log.push(`${who} accepted the claim. Pile now has ${newState.pile.length} card(s). Next rank: ${rankName(newState.currentRank)}.`);

  // Check win conditions — the player who PLAYED (not the one accepting)
  // may have emptied their hand with this accepted play.
  if (checkWinCondition(newState.playerHand)) {
    newState.status = 'gameover';
    newState.winner = 'player';
    newState.log.push('YOU WIN! Your hand is empty.');
  } else if (checkWinCondition(newState.aiHand)) {
    newState.status = 'gameover';
    newState.winner = 'ai';
    newState.log.push('AI WINS! The AI emptied its hand.');
  }

  return { state: newState };
}

/**
 * Pass: voluntarily skip your turn. The passing player draws 1 card
 * from the deck (if any are left) and the turn flips to the opponent.
 * The current rank, pile, and any pending claim are untouched.
 *
 * Pre-conditions:
 *   - It is your turn.
 *   - There is no claim awaiting your response (no lastPlay against you).
 *     If a claim is on the table, the player must Accept or Challenge —
 *     passing on a claim isn't allowed.
 */
function passTurn(state, { player } = { player: 'player' }) {
  if (state.status !== 'playing') return { error: 'Game is not active.' };
  if (state.turn !== player) return { error: 'Not your turn.' };
  if (state.lastPlay && state.lastPlay.player !== player) {
    return { error: 'You must accept or challenge the current claim first.' };
  }

  // Reshuffle before drawing so the next card is unpredictable even to
  // anyone who's been tracking deck order. This matches the casino-table
  // behaviour we want when this gets promoted to the realDeal (Midnight ZK)
  // engine: every draw consumes from a freshly re-randomized deck.
  //
  // If the live deck doesn't have enough cards, recycle the discard pile
  // back into it (shuffled) before the draw so the game never stalls.
  const replenished = replenishDeck(state.deck, state.discardPile || [], 1);
  const shuffledDeck = shuffleDeck(replenished.deck);
  const drawCount = Math.min(1, shuffledDeck.length);
  const drawn = shuffledDeck.slice(0, drawCount);
  const remainingDeck = shuffledDeck.slice(drawCount);

  const newState = { ...state };
  if (player === 'player') {
    newState.playerHand = [...state.playerHand, ...drawn];
  } else {
    newState.aiHand = [...state.aiHand, ...drawn];
  }
  newState.deck = remainingDeck;
  newState.discardPile = replenished.discardPile;
  // Pass control. lastPlay is left as-is (null in the only legal case).
  newState.turn = player === 'player' ? 'ai' : 'player';
  newState.log = [...state.log];
  if (replenished.recycled > 0) {
    newState.log.push(
      `Deck running low — reshuffled ${replenished.recycled} discard(s) back in.`
    );
  }
  if (drawCount > 0) {
    newState.log.push(
      `${player === 'player' ? 'You pass' : 'AI passes'} — pick up 1 card from the deck.`
    );
  } else {
    newState.log.push(
      `${player === 'player' ? 'You pass' : 'AI passes'} — deck and discards are both empty.`
    );
  }
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
  newState.log = [...state.log];
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

  // New penalty mechanic (May 2026): the pile is *discarded* (out of play)
  // and the losing player draws an equal number of replacement cards from
  // the deck, which is reshuffled immediately before the draw. This
  // matches the casino-style "provably fair" model we're building toward
  // for the Midnight ZK realDeal engine — every draw consumes from a
  // freshly re-randomized deck, so no one can game card order.
  //
  // Sizing of the penalty:
  //   • Base penalty = pile cards that would have been scooped under the
  //     old rules (fullPile.length).
  //   • If caught bluffing on an empty pile, enforce a 2-card minimum so a
  //     1-card bluff still hurts.
  const MIN_BLUFF_PENALTY = 2;
  const basePenalty = fullPile.length;
  const caughtBluff = !result.claimWasTrue;
  const penaltyTarget = caughtBluff && pileWasEmpty
    ? Math.max(basePenalty, MIN_BLUFF_PENALTY)
    : basePenalty;

  // Recycle the discard pile back into the live deck if the draw would
  // underflow, then reshuffle. The active pile (fullPile) is being
  // discarded *this* turn — include it in the recycle pool so it's
  // available to be drawn back if necessary.
  const carryDiscards = [...(state.discardPile || []), ...fullPile];
  const replenished = replenishDeck(state.deck, carryDiscards, penaltyTarget);
  const reshuffledDeck = shuffleDeck(replenished.deck);
  const drawCount = Math.min(penaltyTarget, reshuffledDeck.length);
  const drawnCards = reshuffledDeck.slice(0, drawCount);
  const deckAfterDraw = reshuffledDeck.slice(drawCount);

  const loser = caughtBluff ? bluffer : challenger;
  if (loser === 'player') {
    newState.playerHand = [...state.playerHand, ...drawnCards];
  } else {
    newState.aiHand = [...state.aiHand, ...drawnCards];
  }
  newState.deck = deckAfterDraw;
  // discardPile after the recycle: if we recycled, the pool moved into
  // the deck and discards are []. If we didn't (deck had enough), the
  // fresh fullPile lands on top of the existing discards.
  newState.discardPile = replenished.recycled > 0
    ? replenished.discardPile
    : carryDiscards;

  const drawVerb = loser === 'player' ? 'You draw' : 'AI draws';
  if (caughtBluff) {
    newState.log.push(
      `CAUGHT BLUFFING! The claim was false. ${drawVerb} ${drawCount} card(s) from the deck (pile discarded).`
    );
  } else {
    newState.log.push(
      `CHALLENGE FAILED! The claim was true. ${drawVerb} ${drawCount} card(s) from the deck (pile discarded).`
    );
  }
  if (replenished.recycled > 0) {
    newState.log.push(
      `Deck ran low — reshuffled ${replenished.recycled} discarded card(s) back into the deck.`
    );
  }
  if (caughtBluff && pileWasEmpty && drawCount >= MIN_BLUFF_PENALTY && basePenalty < MIN_BLUFF_PENALTY) {
    newState.log.push(
      `Minimum bluff penalty enforced: ${MIN_BLUFF_PENALTY} cards even on an empty pile.`
    );
  }
  if (drawCount < penaltyTarget) {
    newState.log.push(
      `Deck ran short — only ${drawCount} of ${penaltyTarget} penalty card(s) could be drawn.`
    );
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
  passTurn,
};
