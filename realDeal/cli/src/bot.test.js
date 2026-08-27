import { describe, expect, it } from 'vitest';

import {
  normalizeCompactValue,
  selectBotAction,
  validateAdvanceBody,
  validateJoinBody,
} from './bot.js';

const HEX_A = 'aa'.repeat(32);
const HEX_B = 'bb'.repeat(32);
const HEX_C = 'cc'.repeat(32);

describe('TestWired bot HTTP validation', () => {
  it('canonicalizes every 32-byte join field without changing the wager', () => {
    expect(validateJoinBody({
      matchId: `0x${HEX_A.toUpperCase()}`,
      wagerAmount: 5,
      p1Entropy: HEX_B,
      contractAddress: HEX_C,
      difficulty: 'hard',
    })).toEqual({
      matchId: HEX_A,
      wagerAmount: 5,
      p1Entropy: HEX_B,
      contractAddress: HEX_C,
      difficulty: 'hard',
    });
  });

  it('rejects unsafe wagers, malformed IDs, and unknown external fields', () => {
    expect(() => validateJoinBody({
      matchId: HEX_A,
      wagerAmount: Number.MAX_SAFE_INTEGER + 1,
      p1Entropy: HEX_B,
    })).toThrow(/safe integer/);
    expect(() => validateAdvanceBody({ matchId: 'abcd' })).toThrow(/64 hexadecimal/);
    expect(() => validateAdvanceBody({ matchId: HEX_A, player: 'p1' })).toThrow(/unsupported field/i);
  });
});

describe('Compact browser normalization', () => {
  it('normalizes nested safe bigints, large bigints, and byte arrays', () => {
    expect(normalizeCompactValue({
      phase: 2n,
      enormous: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
      combinedSeed: new Uint8Array([0, 15, 255]),
      playerOne: { bytes: new Uint8Array([1, 2]) },
    })).toEqual({
      phase: 2,
      enormous: '9007199254740992',
      combinedSeed: '000fff',
      playerOne: { bytes: '0102' },
    });
  });
});

describe('P2-only decision selection', () => {
  it('plays only when the PLAYING phase names P2 as active', () => {
    expect(selectBotAction({ phase: 2n, activePlayerIdx: 1n })).toBe('play');
    expect(selectBotAction({ phase: 2n, activePlayerIdx: 0n })).toBe('await-p1-play');
  });

  it('responds to P1 and resolves only P2 claims', () => {
    expect(selectBotAction({
      phase: 3n,
      lastPlayerIdx: 0n,
      isChallenged: false,
    })).toBe('respond-to-p1');
    expect(selectBotAction({
      phase: 3n,
      lastPlayerIdx: 1n,
      isChallenged: true,
    })).toBe('resolve-p2-play');
    expect(selectBotAction({
      phase: 3n,
      lastPlayerIdx: 0n,
      isChallenged: true,
    })).toBe('await-p1-resolution');
  });
});
