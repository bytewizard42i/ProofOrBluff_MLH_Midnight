import { describe, expect, it } from 'vitest';
import {
  GAME_MODES,
  RANKS,
  SUITS,
  dealFromSeed,
  dealHands,
  seedToDeck,
} from './dealing.js';

const BASE_SEED_HEX = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';

function allDealtCards(deal) {
  return [...deal.p1Hand, ...deal.p2Hand, ...deal.drawPile];
}

describe('deterministic TestWired dealing', () => {
  it('repeats the exact deck and hands for the same seed and mode', () => {
    const firstDeck = seedToDeck(BASE_SEED_HEX, GAME_MODES.STANDARD);
    const secondDeck = seedToDeck(BASE_SEED_HEX, GAME_MODES.STANDARD);

    expect(secondDeck).toEqual(firstDeck);
    expect(dealFromSeed(BASE_SEED_HEX, GAME_MODES.STANDARD)).toEqual(
      dealFromSeed(BASE_SEED_HEX, GAME_MODES.STANDARD),
    );
  });

  it('treats equivalent hexadecimal and Uint8Array seeds identically', () => {
    const byteSeed = Uint8Array.from(
      BASE_SEED_HEX.match(/.{2}/g),
      (hexByte) => Number.parseInt(hexByte, 16),
    );

    expect(seedToDeck(byteSeed, GAME_MODES.STRATEGIC)).toEqual(
      seedToDeck(BASE_SEED_HEX.toUpperCase(), GAME_MODES.STRATEGIC),
    );
  });

  it('changes the shuffle when any one of the 32 seed bytes changes', () => {
    const baseSeed = new Uint8Array(32);
    const baseOrder = seedToDeck(baseSeed, GAME_MODES.STANDARD).map((card) => card.id);

    // Testing every byte protects against a PRNG implementation that accidentally
    // truncates the 256-bit combined seed to only its first or last few bytes.
    for (let byteIndex = 0; byteIndex < baseSeed.length; byteIndex += 1) {
      const changedSeed = new Uint8Array(baseSeed);
      changedSeed[byteIndex] = 1;
      const changedOrder = seedToDeck(changedSeed, GAME_MODES.STANDARD).map((card) => card.id);
      expect(changedOrder).not.toEqual(baseOrder);
    }
  });

  it.each([
    ['CASUAL', GAME_MODES.CASUAL, 5, 42],
    ['STANDARD', GAME_MODES.STANDARD, 7, 38],
    ['STRATEGIC', GAME_MODES.STRATEGIC, 7, 38],
    ['CLASSIC', GAME_MODES.CLASSIC, 26, 0],
    ['CASINO', GAME_MODES.CASINO, 7, 246],
  ])('deals contract-sized %s hands', (_name, mode, handSize, drawSize) => {
    const deal = dealFromSeed(BASE_SEED_HEX, mode);

    expect(deal.p1Hand).toHaveLength(handSize);
    expect(deal.p2Hand).toHaveLength(handSize);
    expect(deal.drawPile).toHaveLength(drawSize);
  });

  it.each([
    ['single-deck mode', GAME_MODES.CASUAL, 52],
    ['Casino mode', GAME_MODES.CASINO, 260],
  ])('conserves every card and unique ID in %s', (_name, mode, expectedCount) => {
    const cards = allDealtCards(dealFromSeed(BASE_SEED_HEX, mode));
    const ids = new Set(cards.map((card) => card.id));

    expect(cards).toHaveLength(expectedCount);
    expect(ids.size).toBe(expectedCount);
    for (const card of cards) {
      expect(card).toEqual({
        id: `${card.deckIndex}:${card.suit}:${card.rank}`,
        rankIndex: RANKS.indexOf(card.rank),
        rank: card.rank,
        suit: card.suit,
        deckIndex: card.deckIndex,
      });
      expect(SUITS).toContain(card.suit);
    }
  });

  it('constructs Casino from five complete 52-card deck copies', () => {
    const casinoDeck = seedToDeck(BASE_SEED_HEX, GAME_MODES.CASINO);

    expect(casinoDeck).toHaveLength(260);
    for (let deckIndex = 0; deckIndex < 5; deckIndex += 1) {
      const deckCopy = casinoDeck.filter((card) => card.deckIndex === deckIndex);
      expect(deckCopy).toHaveLength(52);
      expect(new Set(deckCopy.map((card) => `${card.suit}:${card.rank}`)).size).toBe(52);
    }
  });

  it.each([
    [new Uint8Array(31)],
    [new Uint8Array(33)],
    ['00'.repeat(31)],
    ['00'.repeat(33)],
    ['g0'.repeat(32)],
    [`0x${'00'.repeat(32)}`],
    [null],
    [[]],
  ])('rejects malformed combined seed %#', (invalidSeed) => {
    expect(() => seedToDeck(invalidSeed, GAME_MODES.STANDARD)).toThrow(/seed/i);
  });

  it.each([-1, 5, 1.5, '1', null, undefined, Number.NaN])(
    'rejects malformed mode %p',
    (invalidMode) => {
      expect(() => seedToDeck(BASE_SEED_HEX, invalidMode)).toThrow(/mode/i);
      expect(() => dealHands([], invalidMode)).toThrow(/mode/i);
    },
  );

  it('rejects a non-array or wrong-sized deck instead of dealing partial hands', () => {
    expect(() => dealHands(null, GAME_MODES.STANDARD)).toThrow(/deck/i);
    expect(() => dealHands([], GAME_MODES.STANDARD)).toThrow(/52-card deck/i);
    expect(() => dealHands(seedToDeck(BASE_SEED_HEX, GAME_MODES.STANDARD), GAME_MODES.CASINO))
      .toThrow(/260-card deck/i);
  });

  it('returns fresh arrays and card objects so calls cannot mutate each other', () => {
    const firstDeal = dealFromSeed(BASE_SEED_HEX, GAME_MODES.STANDARD);
    const untouchedDeal = dealFromSeed(BASE_SEED_HEX, GAME_MODES.STANDARD);
    const originalFirstCard = { ...untouchedDeal.p1Hand[0] };
    const originalDrawLength = untouchedDeal.drawPile.length;

    expect(firstDeal.p1Hand).not.toBe(untouchedDeal.p1Hand);
    expect(firstDeal.p1Hand[0]).not.toBe(untouchedDeal.p1Hand[0]);

    firstDeal.p1Hand[0].rank = 'mutated';
    firstDeal.drawPile.pop();

    expect(untouchedDeal.p1Hand[0]).toEqual(originalFirstCard);
    expect(untouchedDeal.drawPile).toHaveLength(originalDrawLength);
    expect(dealFromSeed(BASE_SEED_HEX, GAME_MODES.STANDARD)).toEqual(untouchedDeal);
  });
});
