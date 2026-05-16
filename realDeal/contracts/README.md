# Proof or Bluff — realDeal Contracts

**Status**: MVP — both contracts validated on `compactc v0.30.0` via the hosted Compact playground.
**Language pragma**: `>= 0.16 && <= 0.21`
**Last validated**: Apr 17, 2026

---

## What's In This Folder

| File | Purpose | Lines | Exported circuits |
|------|---------|-------|-------------------|
| `proof-or-bluff.compact` | The match engine — state machine, commit-reveal seeding, ZK challenge resolution, native Zswap wager escrow | ~1100 | `createMatch`, `joinMatch`, `revealSeed`, `playCards`, `acceptClaim`, `challengeClaim`, `resolveChallenge`, `forfeitStalledChallenge`, `cancelUnjoinedMatch`, `forfeitAbandonedMatch`, `claimPayout`, `getMatch`, `getMatchPhase`, `getWinner` |
| `player-stats.compact` | Persistent per-player stats — rank points (ELO), achievements, streaks, tournament gating | ~400 | `getOrCreatePlayerRecord`, `recordMatchResult`, `recordChallengeOutcome`, `advanceSeason`, `getPlayerRecord`, `proveRankAtLeast`, `proveMatchesPlayedAtLeast`, `proveAchievementUnlocked`, `getRankTier`, `proveTierAtLeast` |

The two contracts are **independent** — neither imports the other. The game backend wires them together:
- Match contract settles each individual game (private hands, ZK challenge resolution).
- Stats contract tracks persistent reputation across matches (operator pushes results).

---

## How the Game Plays Out on Chain

### Flow 1: Two humans (PvP)

```
┌─ Player 1 ──────────────┐          ┌─ Player 2 ──────────────┐
│ createMatch(            │          │                         │
│   mode=STANDARD,        │          │                         │
│   wager=5 DUST,         │          │                         │
│   p1EntropyCommit,      │          │                         │
│   now,                  │          │                         │
│   coin                  │          │                         │
│ ) → matchId             │          │                         │
│                         │          │ joinMatch(              │
│                         │  ←──────┤   matchId,              │
│                         │          │   p2EntropyCommit,      │
│                         │          │   coin)                 │
│                         │          │                         │
│ revealSeed(             │  (either │                         │
│   matchId,              │  side can│                         │
│   p1Entropy, p2Entropy, │  call)   │                         │
│   startingRank, now     │          │                         │
│ )                       │          │                         │
│                         │          │                         │
│ ══ now in PLAYING phase — p1 goes first ══                   │
│                         │          │                         │
│ playCards(              │          │                         │
│   matchId,              │          │                         │
│   commit=hash(cards),   │          │                         │
│   claimedRank=2,        │          │                         │
│   claimedCount=1,       │          │                         │
│   now                   │          │                         │
│ )                       │          │                         │
│                         │          │ acceptClaim(matchId, now)│
│                         │  ←──────┤   OR                     │
│                         │          │ challengeClaim(matchId, now) │
│                         │          │                         │
│ resolveChallenge(matchId, now) → Boolean (only on challenge) │
│   └── witness: private cards+salts                            │
│   └── returns true if claim was honest, false if bluff        │
│                         │          │                         │
│ ══ continue turns until score threshold or empty hand ══     │
│                         │          │                         │
│ (winner) claimPayout(matchId)  ────┼──→ escrow flag flipped  │
└─────────────────────────┘          └─────────────────────────┘
```

### Flow 2: Human vs AI

Same exact flow. The AI runs as an off-chain service with its own wallet. From the contract's perspective there's no difference — both players call the same circuits, the AI just doesn't have a UI.

**This is a big deal for adoption**: the same contract supports:
- Solo practice mode (human vs local AI, low stakes or free)
- Ranked casual mode (human vs matchmade AI opponent at their tier)
- Head-to-head PvP (two humans, wagered matches)
- AI vs AI spectator mode (two AI services play, spectators bet — Phase 2)

No fork, no duplicate code path.

---

## The ZK Showcase — `resolveChallenge`

This is the moment that sells the privacy story:

1. **During `playCards`**: the active player commits `hash(ranks, salts, count)` on-chain. The actual ranks stay in private state.
2. **During `challengeClaim`**: the opponent calls "Proof or Bluff!" — no reveal yet, just a challenge flag flipped on-chain.
3. **During `resolveChallenge`**: the challenged player passes `revealLastPlay` as a **private witness**. The circuit:
   - Recomputes `persistentHash(witness)` and asserts it equals the stored `lastPlayCommit` (proves no card swap).
   - Counts how many revealed ranks equal `lastClaimRank`.
   - Returns a `Boolean` — **only this boolean is disclosed on-chain.**
4. If the claim was **TRUE** → challenger picks up pile AND loses 1 rank point (failed challenge penalty).
5. If the claim was **FALSE** → bluffer picks up pile; challenger gains 3 points (successful catch).
6. The individual card ranks are **never disclosed** regardless of outcome.

That is the selective-privacy moment that makes ZK feel human in a game people actually want to play.

---

## Scoring (RealDeal — ZK-Enforceable)

| Event | Score change | Why |
|-------|--------------|-----|
| Accept claim (any) | 0 | No challenge fired ⇒ no ground truth ⇒ no score move |
| Challenge — claim was **true** | Challenger −1 | Failed-challenge deterrent per RULES.md |
| Challenge — claim was **false** | Challenger +3 | Successful catch reward |
| Forfeit (challenger times out) | Bluffer picks up pile, challenger +3 | Anti-stall |

The `demoLand` engine has an additional `+1 successful bluff` bonus when the opponent accepts a lie. That event is *not* modeled on-chain because it requires ground truth the verifier can't see without a challenge. Standard mode's first-to-15 target works fine without it — challenge swings dominate every game (±4-point swings).

---

## Wager / Escrow

The match contract now uses **native Zswap shielded escrow** for wagered matches:

- `createMatch` receives the creator's shielded native-token wager.
- `joinMatch` receives the joiner's matching native-token wager and merges it into the match pot.
- `claimPayout` sends the full contract-held pot to the winner after `GAMEOVER`.

The contract pins deposits to `nativeToken()` and also checks that the joiner's coin color matches the stored pot color. This prevents a player from satisfying the value check with a worthless custom token.

Refund and stall protection:

- `cancelUnjoinedMatch` lets the creator cancel a phase-0 match and receive the initial pot back.
- `forfeitAbandonedMatch` ends a stalled `PLAYING` turn after timeout and awards the pot to the non-abandoning player.

Privacy tradeoff: `wagerAmount` is public match metadata in the realDeal path because the contract must compare the shielded coin value against the required wager.

---

## Rank & Achievement Hooks (Profitability Layer)

`player-stats.compact` is where the game becomes a business:

- **Ranked tiers** (Bronze → Legend): drive matchmaking, tournament brackets, and badge display. See the contract for exact thresholds.
- **Achievements** are derived at query time from raw counters (no bitmask storage) — adding new achievements is a one-line change in `proveAchievementUnlocked`.
- **Tournament gating**: organizers call `proveTierAtLeast(GOLD)` and `proveMatchesPlayedAtLeast(100)` for qualification. The contract proves eligibility without revealing the player's actual history.
- **Season resets**: `advanceSeason` bumps the counter; `peakRankPoints` is preserved for lifetime achievements.
- **DIDz integration**: off-chain, player wallet → `did:midnight:...` binding lets rank and achievements carry across every DIDzMonolith product (ProMingle professional cred, SouLink social trust, HuddleBridge speaker badges, etc.).

---

## Integration With the Off-Chain Stack

| Component | Responsibility |
|-----------|---------------|
| `demoLand` (existing JS engine) | Reference implementation of the state machine. No ZK, no chain. Use for E2E testing the rules before porting to realDeal. |
| `realDeal` SDK (to be built) | TypeScript bindings for both contracts. Wraps commit hashing, witness construction, error translation. Shared by UI, AI service, tournament tooling. |
| AI service | An off-chain player. Holds a wallet, follows the same contract API as human players. Personality layer lives in the service, not the chain. |
| Midnight Vitals | Monitors proof server, wallet, indexer, RPC, and the two contracts' activity. Already documented in `../../docs/MIDNIGHT_VITALS.md`. |
| Tournament backend | Listens to `totalMatchesCompleted` events. Calls `advanceSeason` on schedule. Mints off-chain NFT badges when `proveAchievementUnlocked` returns true for new players. |

---

## Known Gaps (Phase 2 Work)

1. **Hand membership proof** — MVP trusts the `claimedCount` hand-size subtraction on the honor system. A Merkle-tree hand commitment with membership proof would eliminate the trust gap.
2. **Deck fairness proof** — The commit-reveal seed is anti-manipulation but not anti-stacking. Shuffled-deck ZK proofs are a research problem; most card games rely on client-side fairness. Acceptable for MVP.
3. **Cross-contract writes** — Today the backend operator writes to `player-stats.compact`. A future version lets the match contract call stats directly once cross-contract composition is validated on v0.30.
4. **PvE permanence** — Solo-vs-AI results currently count toward rank. A `"ranked" : Boolean` flag would let practice matches be excluded from ELO.
5. **Replay integrity** — No on-chain replay hash yet. Replays stored off-chain could be hash-committed on `playCards` for verifiable shareable replays.

---

## Compile & Deploy

Quick validation via the hosted playground:
```
# (Same playground flow as the DIDz-io contracts)
# No local compactc install needed for syntax validation.
```

Full zk-key generation for preprod:
```bash
compactc proof-or-bluff.compact build/proof-or-bluff/
compactc player-stats.compact    build/player-stats/
```

Deployment will use the standard Midnight preprod wallet config from `/home/js/utils_Midnight/preProd-Wallets/`.

---

## Compiler Learnings That Shaped These Contracts

Ran into three v0.30-specific quirks while building these:

1. **`let` is reserved for future use.** All locals must be `const`. Mutable state has to be modeled via `const` + ternary cascades.
2. **Module-level `const` declarations are rejected.** Workaround is helper circuits that inline `pad(32, "…")` domain separators at each site.
3. **Bitwise `|` on Uint types isn't accepted.** Blocked my initial achievement-bitmask design — swapped to counter-derived achievements (simpler and more extensible anyway).

All documented in the myAlice Phase 1 learnings file for future contracts.

---

## References

- Game rules: `../../docs/RULES.md`
- demoLand engine: `../../demoLand/src/game/engine.js`
- Architecture: `../../docs/DEMOLAND_VS_REALDEAL.md`
- Business plan: `../../docs/BUSINESS_PLAN.md`
- Future functionality: `../../docs/FUTURE_FUNCTIONALITY.md`
- Midnight Vitals: `../../docs/MIDNIGHT_VITALS.md`
- DIDz-io ecosystem: `../../../DIDz-io/contracts/README.md`

---

*Built by Penny 🎀 and John on Apr 17, 2026. Both contracts compile clean on compactc v0.30.0.*
