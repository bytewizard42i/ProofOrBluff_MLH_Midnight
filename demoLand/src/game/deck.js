/**
 * deck.js — Deck creation and shuffling for Proof or Bluff
 *
 * Supports two modes:
 *   - Home Mode:   1 standard 52-card deck (card counting viable)
 *   - Casino Mode:  5 standard 52-card decks shuffled together (260 cards)
 */

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

/**
 * Create a single 52-card deck.
 * Each card is { rank, suit, id } where id is unique within this deck copy.
 */
function createSingleDeck(deckCopyIndex = 0) {
  const cards = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        rank,
        suit,
        id: `${rank}_${suit}_${deckCopyIndex}`,
      });
    }
  }
  return cards;
}

/**
 * Create the full deck for the selected game mode.
 *   - 'home'   → 52 cards  (1 deck)
 *   - 'casino' → 260 cards (5 decks)
 */
function createDeck(mode = 'home') {
  const deckCount = mode === 'casino' ? 5 : 1;
  const allCards = [];
  for (let i = 0; i < deckCount; i++) {
    allCards.push(...createSingleDeck(i));
  }
  return allCards;
}

/**
 * Fisher-Yates shuffle — fair, unbiased, in-place.
 * Returns a new shuffled array (does not mutate the original).
 */
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deal cards evenly between two players.
 * Returns { playerHand: [], aiHand: [] }
 */
function dealCards(shuffledDeck) {
  const half = Math.floor(shuffledDeck.length / 2);
  return {
    playerHand: shuffledDeck.slice(0, half),
    aiHand: shuffledDeck.slice(half, half * 2),
  };
}

/**
 * Get the rank sequence index for rank progression.
 * Ranks cycle: 2 → 3 → ... → K → A → 2 → ...
 */
function getRankIndex(rank) {
  return RANKS.indexOf(rank);
}

/**
 * Get the next rank in the progression sequence.
 * Wraps from Ace back to 2.
 */
function getNextRank(currentRank) {
  const currentIndex = RANKS.indexOf(currentRank);
  const nextIndex = (currentIndex + 1) % RANKS.length;
  return RANKS[nextIndex];
}

export {
  RANKS,
  SUITS,
  createSingleDeck,
  createDeck,
  shuffleDeck,
  dealCards,
  getRankIndex,
  getNextRank,
};
