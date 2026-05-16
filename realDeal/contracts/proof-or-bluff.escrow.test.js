import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const NATIVE_TOKEN = 'native';

class EscrowSimulator {
  constructor() {
    this.matches = new Map();
    this.matchPots = new Map();
    this.balances = new Map();
  }

  createMatch({ matchId, playerOne, wagerAmount, coin, now }) {
    if (coin.color !== NATIVE_TOKEN) throw new Error('Creator coin must be native token');
    if (coin.value !== wagerAmount) throw new Error('Creator coin value must match wager');

    this.matches.set(matchId, {
      playerOne,
      playerTwo: playerOne,
      wagerAmount,
      phase: 0,
      activePlayerIdx: 0,
      winner: 0,
      escrowReleased: false,
      potHasCoin: true,
      lastActionAt: now,
    });
    this.matchPots.set(matchId, { color: coin.color, value: coin.value });
  }

  joinMatch({ matchId, playerTwo, coin }) {
    const match = this.matches.get(matchId);
    const pot = this.matchPots.get(matchId);
    if (coin.color !== NATIVE_TOKEN) throw new Error('Joiner coin must be native token');
    if (coin.value !== match.wagerAmount) throw new Error('Joiner coin value must match wager');
    if (coin.color !== pot.color) throw new Error('Joiner token must match pot token');

    match.playerTwo = playerTwo;
    match.phase = 1;
    this.matchPots.set(matchId, { color: pot.color, value: pot.value + coin.value });
  }

  startPlaying({ matchId, now }) {
    const match = this.matches.get(matchId);
    match.phase = 2;
    match.lastActionAt = now;
  }

  forfeitAbandonedMatch({ matchId, now, timeoutSeconds }) {
    const match = this.matches.get(matchId);
    if (match.phase !== 2) throw new Error('Match not in PLAYING');
    if (now < match.lastActionAt + timeoutSeconds) throw new Error('Abandonment window still open');

    match.phase = 4;
    match.winner = match.activePlayerIdx === 0 ? 2 : 1;
    match.lastActionAt = now;
  }

  claimPayout({ matchId, caller }) {
    const match = this.matches.get(matchId);
    const winner = match.winner === 1 ? match.playerOne : match.playerTwo;
    const pot = this.matchPots.get(matchId);
    if (caller !== winner) throw new Error('Only the winner can claim');

    this.balances.set(winner, (this.balances.get(winner) ?? 0) + pot.value);
    match.escrowReleased = true;
    match.potHasCoin = false;
    this.matchPots.delete(matchId);
  }
}

describe('proof-or-bluff native escrow', () => {
  it('covers deposit, merge, abandoned-game forfeit, payout, and pot cleanup', () => {
    const sim = new EscrowSimulator();

    sim.createMatch({
      matchId: 'match-1',
      playerOne: 'alice',
      wagerAmount: 5,
      coin: { color: NATIVE_TOKEN, value: 5 },
      now: 100,
    });
    sim.joinMatch({
      matchId: 'match-1',
      playerTwo: 'bob',
      coin: { color: NATIVE_TOKEN, value: 5 },
    });
    sim.startPlaying({ matchId: 'match-1', now: 120 });
    sim.forfeitAbandonedMatch({ matchId: 'match-1', now: 220, timeoutSeconds: 60 });
    sim.claimPayout({ matchId: 'match-1', caller: 'bob' });

    const match = sim.matches.get('match-1');
    expect(match.winner).toBe(2);
    expect(match.escrowReleased).toBe(true);
    expect(match.potHasCoin).toBe(false);
    expect(sim.balances.get('bob')).toBe(10);
    expect(sim.matchPots.has('match-1')).toBe(false);
  });

  it('keeps Compact escrow guardrails in source', () => {
    const source = readFileSync('realDeal/contracts/proof-or-bluff.compact', 'utf8');

    expect(source).toContain('receivedCoin.color == nativeToken()');
    expect(source).toContain('receivedCoin.color == existingPot.color');
    expect(source).toContain('export circuit cancelUnjoinedMatch');
    expect(source).toContain('export circuit forfeitAbandonedMatch');
    expect(source).toContain('matchPots.remove(disclose(matchId))');
  });
});
