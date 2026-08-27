// This module deliberately uses only standard JavaScript so the browser UI and
// Node-based bot/tests execute exactly the same dealing algorithm.

export const RANKS = Object.freeze([
  '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A',
]);
export const SUITS = Object.freeze(['hearts', 'diamonds', 'clubs', 'spades']);

export const GAME_MODES = Object.freeze({
  CASUAL: 0,
  STANDARD: 1,
  STRATEGIC: 2,
  CLASSIC: 3,
  CASINO: 4,
});

// Keeping contract-derived rules in one table makes an invalid mode impossible
// to silently fall through to a plausible-looking but incorrect deal.
const MODE_RULES = Object.freeze({
  [GAME_MODES.CASUAL]: Object.freeze({ handSize: 5, deckCount: 1 }),
  [GAME_MODES.STANDARD]: Object.freeze({ handSize: 7, deckCount: 1 }),
  [GAME_MODES.STRATEGIC]: Object.freeze({ handSize: 7, deckCount: 1 }),
  [GAME_MODES.CLASSIC]: Object.freeze({ handSize: 26, deckCount: 1 }),
  [GAME_MODES.CASINO]: Object.freeze({ handSize: 7, deckCount: 5 }),
});

function getModeRules(mode) {
  if (!Number.isInteger(mode) || !Object.hasOwn(MODE_RULES, mode)) {
    throw new RangeError('Game mode must be an integer from 0 (CASUAL) through 4 (CASINO)');
  }
  return MODE_RULES[mode];
}

/** Convert either supported public-seed representation into a defensive copy. */
function normalizeSeed(seed) {
  if (seed instanceof Uint8Array) {
    if (seed.length !== 32) {
      throw new RangeError(`Combined seed Uint8Array must contain exactly 32 bytes; received ${seed.length}`);
    }
    return new Uint8Array(seed);
  }

  if (typeof seed === 'string') {
    if (!/^[0-9a-fA-F]{64}$/.test(seed)) {
      throw new TypeError('Combined seed hex must contain exactly 64 hexadecimal characters (without 0x)');
    }

    const bytes = new Uint8Array(32);
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Number.parseInt(seed.slice(index * 2, index * 2 + 2), 16);
    }
    return bytes;
  }

  throw new TypeError('Combined seed must be a 32-byte Uint8Array or a 64-character hex string');
}

function rotateLeft32(value, distance) {
  return ((value << distance) | (value >>> (32 - distance))) >>> 0;
}

/**
 * Expand all 32 seed bytes into xoshiro128**'s four-word state.
 *
 * This small, synchronous mixer is not used for secrecy—the combined seed is
 * already public. Its purpose is reproducibility and avalanche: every input
 * byte is incorporated before shuffling, without relying on Node-only crypto.
 */
function seedToState(seedBytes) {
  const state = new Uint32Array([0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344]);

  for (let index = 0; index < seedBytes.length; index += 1) {
    const lane = index & 3;
    const mixedByte = seedBytes[index] | ((index + 1) << 8);
    state[lane] = Math.imul(state[lane] ^ mixedByte, 0x9e3779b1) >>> 0;
    state[(lane + 1) & 3] = rotateLeft32(
      (state[(lane + 1) & 3] + state[lane] + 0x7f4a7c15) >>> 0,
      13,
    );
  }

  // xoshiro's only forbidden state is four zero words. This is effectively
  // unreachable after the constants/mixing above, but the guard documents and
  // enforces the generator's invariant.
  if (state.every((word) => word === 0)) state[0] = 1;
  return state;
}

function createRandomSource(seedBytes) {
  const state = seedToState(seedBytes);

  return function nextUint32() {
    const result = Math.imul(rotateLeft32(Math.imul(state[1], 5) >>> 0, 7), 9) >>> 0;
    const temporary = (state[1] << 9) >>> 0;

    state[2] ^= state[0];
    state[3] ^= state[1];
    state[1] ^= state[2];
    state[0] ^= state[3];
    state[2] ^= temporary;
    state[3] = rotateLeft32(state[3], 11);
    return result;
  };
}

/**
 * Map a random uint32 into [0, upperBound) without modulo bias. Values in the
 * short, uneven tail are rejected, so every possible index has equal weight.
 */
function randomIndexBelow(nextUint32, upperBound) {
  const uint32Range = 0x100000000;
  const equalRangeLimit = Math.floor(uint32Range / upperBound) * upperBound;
  let candidate;

  do candidate = nextUint32(); while (candidate >= equalRangeLimit);
  return candidate % upperBound;
}

function createDeck(deckCount) {
  const cards = [];

  for (let deckIndex = 0; deckIndex < deckCount; deckIndex += 1) {
    for (const suit of SUITS) {
      for (let rankIndex = 0; rankIndex < RANKS.length; rankIndex += 1) {
        const rank = RANKS[rankIndex];
        cards.push({
          id: `${deckIndex}:${suit}:${rank}`,
          rankIndex,
          rank,
          suit,
          deckIndex,
        });
      }
    }
  }
  return cards;
}

/** Build and deterministically Fisher-Yates shuffle the mode's complete deck. */
export function seedToDeck(combinedSeed, mode) {
  const rules = getModeRules(mode);
  const nextUint32 = createRandomSource(normalizeSeed(combinedSeed));
  const deck = createDeck(rules.deckCount);

  for (let remaining = deck.length; remaining > 1; remaining -= 1) {
    const selectedIndex = randomIndexBelow(nextUint32, remaining);
    [deck[remaining - 1], deck[selectedIndex]] = [deck[selectedIndex], deck[remaining - 1]];
  }
  return deck;
}

/**
 * Split an already shuffled deck without mutating it. Player one receives the
 * first contract-sized hand, followed by player two and then the draw pile.
 */
export function dealHands(deck, mode) {
  const { handSize, deckCount } = getModeRules(mode);
  const expectedCardCount = deckCount * RANKS.length * SUITS.length;

  if (!Array.isArray(deck)) throw new TypeError('Deck must be an array');
  if (deck.length !== expectedCardCount) {
    throw new RangeError(`Mode ${mode} requires a ${expectedCardCount}-card deck; received ${deck.length}`);
  }

  return {
    p1Hand: deck.slice(0, handSize),
    p2Hand: deck.slice(handSize, handSize * 2),
    drawPile: deck.slice(handSize * 2),
  };
}

/** Convenience entry point used when a caller needs the complete deal at once. */
export function dealFromSeed(combinedSeed, mode) {
  return dealHands(seedToDeck(combinedSeed, mode), mode);
}
