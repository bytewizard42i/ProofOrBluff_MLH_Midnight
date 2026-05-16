# Proof or Bluff — Game Rules

**The Midnight card game where your hand stays private, your claims are public, and only disputed truth gets revealed.**

> **Design rationale**: See [Gameplay Design Analysis](GAMEPLAY_RESEARCH.md) for the research behind these rules.

---

## What This Document Covers

This is the **canonical ruleset for the current demoLand build** (May 2026). Every rule in [Part 1](#part-1--currently-implemented-demoland-build) below is wired into `demoLand/src/game/engine.js` and playable today.

[Part 2](#part-2--roadmap--optional-mechanics-not-yet-implemented) describes mechanics we've designed but not yet built. They're kept in this doc so the team has one place to look for both shipped behavior and the planned roadmap. Anything in Part 2 should be assumed **not yet implemented** unless this doc says otherwise.

For the realDeal (Midnight-native) flow that wraps this same logic in ZK proofs, see [`DEMOLAND_VS_REALDEAL.md`](DEMOLAND_VS_REALDEAL.md).

---

# Part 1 — Currently Implemented (demoLand build)

## Overview

Proof or Bluff (POB) is a two-player bluffing card game based on the classic "Cheat" / "Bullshit" mechanic, redesigned for privacy-preserving play on the Midnight Network. One player is human, the other is an Ai opponent.

The core mechanic: players take turns placing cards face-down and declaring what they played. The declaration may be truthful or a bluff. The opponent must decide whether to **Accept**, **Challenge**, or **Pass**. When challenged, the cards are revealed and the loser is penalized.

In the realDeal Midnight build, the challenge reveal becomes a zero-knowledge proof — the contract proves only the truth or falsehood of the claim, never the underlying cards.

In wagered realDeal matches, `wagerAmount` is public on-chain metadata. This is the tradeoff for native Zswap escrow: the contract must verify that each shielded deposit matches the required wager while keeping custody and payout inside the Midnight flow.

---

## Game Modes (implemented)

POB currently ships with two modes that vary only in deck size:

| Mode | Deck | Hand Size | Cards/Play | Win Condition | Feel |
|------|------|-----------|------------|---------------|------|
| **Home** *(default)* | 1 deck (52 cards) | 10 cards each | 1-4 | Empty hand wins | Card counting viable, faster |
| **Casino** | 5-deck shoe (260 cards) | 10 cards each | 1-4 | Empty hand wins | Card counting neutralized, higher variance |

Both modes use **identical rules** other than the deck size. The Casino shoe exists to break card-counting strategies, which is the setup we'll lean on for the realDeal wagered match flow.

> Additional modes (Casual, Standard, Strategic, Classic) are documented in [Part 2](#part-2--roadmap--optional-mechanics-not-yet-implemented) as roadmap entries.

---

## Card Ranks

Standard playing card ranks, low to high:

```
2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King, Ace
```

Suits exist on the cards visually but **do not affect gameplay**. Only the rank matters.

Face cards and Aces are spelled out in the UI and TTS narration (Jack / Queen / King / Ace), not abbreviated.

---

## Setup

1. Deck is built (52 cards for Home, 260 for Casino) and shuffled (Fisher-Yates).
2. **10 cards** are dealt to each player as their private hand.
3. The remaining cards form the **draw deck**, which is reshuffled on every draw event.
4. The starting required rank is chosen **randomly** from the 13 ranks.
5. The human player goes first.
6. The pile starts **empty** (no dead pile / genesis pile in the current build).

---

## Turn Structure

On each turn, the active player has three legal actions:

### 1. Play cards

- Select **1 to 4 cards** from your hand to play face-down onto the central pile.
- Declare a claim of the form `[count] [rank]` — e.g., "Two Kings" or "One Ace".
- The claimed rank **must equal the current required rank** (rank progression below).
- The claimed count must equal the number of cards you actually placed.
- The cards themselves can be anything you want — the rank of the cards is your secret. Bluffing is the whole point.

After the active player commits a play, control passes to the opponent for their response.

### 2. Pass turn

If you don't want to commit a play (and no claim is currently awaiting your response), you can pass:

- You draw **1 card** from the reshuffled deck (if any cards remain).
- Turn flips to the opponent.
- The current rank, pile, and any pending claim are untouched.

> You cannot pass when a claim is on the table against you — you must Accept or Challenge first.

### 3. Respond to opponent's claim

When the opponent has just played, you must choose:

- **Accept** — Cards go onto the pile face-down, the required rank advances, your turn begins.
- **Challenge** ("Proof or Bluff!") — Reveal the played cards and resolve.

---

## Challenge Resolution

When a challenge fires:

1. The challenged cards are revealed (in demoLand: direct reveal; in realDeal: ZK proof of true/false).
2. The full active pile is **discarded** out of play. It does not go to either hand.
3. The deck is **reshuffled immediately** so no one can game card order.
4. The losing player draws `pileLength` cards from the freshly reshuffled deck as their penalty.

### Loser determination

- **Claim was TRUE** (cards matched the declared rank): the **challenger** is the loser.
- **Claim was FALSE** (caught bluffing): the **bluffer** is the loser.

### Minimum bluff penalty

If a bluff is caught on an **empty pile** (the challenger fired immediately on the first play), a minimum penalty of **2 cards** is enforced. This stops a player from bluffing 1 card cheaply when there's nothing yet to lose.

### Short-deck edge case

If the deck has fewer cards remaining than the penalty calls for, the loser draws whatever's available and the game log surfaces the shortfall.

> **Privacy note (realDeal)**: when this resolution moves to Midnight, the contract proves only whether the declared rank matched all played cards. It does **not** reveal what the cards actually were on a caught bluff, and it does not reveal anything about the rest of either hand.

---

## Rank Progression

Each accepted play or resolved challenge advances the required rank by one:

```
2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → Jack → Queen → King → Ace → 2 → ...
```

The sequence wraps from Ace back to 2.

With a 10-card hand and 13 possible ranks in a single deck, you will be forced to bluff on most turns — that pressure is the engine of the game.

---

## Win Condition

**Empty hand wins.** The first player to play out their entire hand wins. There is no point system in the current build.

- Winning by exhausting your hand on an accepted play is the standard path.
- A challenge that lands cards back on the loser via the discard-and-redraw rule will frequently extend the game — the deck stays in motion.

---

## Stats Tracked (UI only)

The engine tracks rolling per-game stats and surfaces them in the UI:

- `rounds` — completed exchanges (accept or challenge resolution)
- `aiPlays` — total Ai plays observed (used as denominator for bluff-rate estimation)
- `aiBluffsCaught` — times you successfully called out an Ai bluff
- `playerBluffsCaught` — times you got caught bluffing
- `playerFailedChallenges` — challenges you fired at a truthful claim
- `aiFailedChallenges` — Ai challenges you survived because you were honest

These stats power the **bluff-probability estimator** shown alongside the play field. They are read-only — there are no point bonuses or penalties tied to them.

---

## Ai Personality and Difficulty

The Ai opponent is a scripted agent (`demoLand/src/game/ai/scripted.js`) parameterized by difficulty profiles in `demoLand/src/game/ai/difficulty.js`. The profiles tune bluff frequency, challenge aggressiveness, and tells-leakage. Personality (voice, banter, naming) is decoupled from difficulty so any of the personas can run at any level.

The agent module (`agent.js`) is wired for a future LLM-backed Ai but currently routes to the scripted decisions.

---

## UI Affordances

These are the surfaces a player actually sees and interacts with, mapped to the engine they call:

| UI element | Engine call | Notes |
|------------|-------------|-------|
| Card selection (ascending/descending blip sounds) | local UI state | Tracks selected card set before commit |
| **Play** button | `playCards()` | Validates rank, count, hand membership |
| **Pass** button | `passTurn()` | Draws 1 card, flips turn |
| **Accept** button (opponent's claim) | `acceptClaim()` | Pile grows, rank advances |
| **Proof or Bluff!** button | `challenge()` | Triggers reveal + discard-and-redraw |
| Game log column (slim) | reads `state.log[]` | Narrated via TTS, mute / volume slider in header |
| 🎵 Lounge music | independent of engine | Volume slider in header |
| Top-right speaker icon | mutes lounge music only | Game-log narration has its own toggle |
| Bluff probability estimator | reads `state.stats` | Read-only display |

### Narration (TTS)

- British voice preset for the in-game narrator.
- "Ai" is pronounced as "A-I" via a hyphen preprocessing hack so it doesn't read as "eye".
- Face-card ranks are spelled out for narration ("Jack", "Queen", etc.).
- Narration is gated on output completion before the Ai takes its turn, so the player isn't talked over.

---

## Game Flow — End-to-End

```
┌─────────────────────────────────────────────────────────┐
│              PROOF OR BLUFF — CURRENT FLOW              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. SHUFFLE & DEAL                                      │
│     ├── Deck created (52 home / 260 casino)             │
│     ├── Fisher-Yates shuffle                            │
│     ├── 10 cards → player, 10 cards → Ai                │
│     ├── Rest forms the draw deck                        │
│     ├── Random starting required rank                   │
│     └── Pile starts empty                               │
│                                                         │
│  2. ACTIVE PLAYER ACTS                                  │
│     ├── PLAY 1-4 cards, declare current rank            │
│     │   (claim may be true or a bluff)                  │
│     └── OR PASS — draw 1 card, flip turn                │
│                                                         │
│  3. OPPONENT RESPONDS (if a play was made)              │
│     ├── ACCEPT → pile grows, rank advances              │
│     └── CHALLENGE → "Proof or Bluff!"                   │
│                                                         │
│  4. CHALLENGE RESOLUTION                                │
│     ├── Cards revealed (demoLand) / ZK proof (realDeal) │
│     ├── Active pile → DISCARDED (out of play)           │
│     ├── Deck reshuffled                                 │
│     ├── Loser draws pileLength cards                    │
│     │   (minimum 2 on empty-pile bluff)                 │
│     └── Rank advances                                   │
│                                                         │
│  5. CHECK WIN                                           │
│     ├── Player hand empty? → YOU WIN                    │
│     ├── Ai hand empty? → AI WINS                        │
│     └── Otherwise → back to step 2                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Terminology

| Term | Meaning |
|------|---------|
| **POB** | Proof or Bluff (abbreviation) |
| **Pile** | Central face-down card pile that accumulates each accepted play |
| **Discard Pile** | Where the pile goes after a resolved challenge — out of play permanently |
| **Draw Deck** | The remaining cards from which players draw on pass / penalty events. Reshuffled before every draw. |
| **Claim** | The public declaration of count + rank for the cards just played |
| **Challenge** | Calling "Proof or Bluff!" — demanding a reveal (or ZK proof in realDeal) |
| **Bluff** | Playing cards that don't match your claim |
| **Pass** | Skipping your turn voluntarily; draws 1 card |
| **Home Mode** | 1-deck game (52 cards). Default. |
| **Casino Mode** | 5-deck shoe game (260 cards). Card counting neutralized. |
| **Selective Disclosure** | Midnight's ability to prove a fact without revealing the underlying data. Realized via the realDeal `resolveChallenge` circuit. |

---

# Part 2 — Roadmap / Optional Mechanics (NOT yet implemented)

Everything below this line is **design only**. None of it is in the current demoLand build. Items listed here are kept for team continuity and to anchor future PRs. Each entry notes the rough effort to ship.

## Additional Game Modes

The following modes were specified in earlier design rounds and remain on the table:

| Mode | Hand Size | Cards/Play | Win Condition | Session | Notes |
|------|-----------|------------|---------------|---------|-------|
| **Casual** | 5 cards | 1-2 | First to 10 pts | 3-5 min | Requires scoring system |
| **Standard** | 7 cards | 1-3 | First to 15 pts | 5-10 min | Requires scoring system |
| **Strategic** | 7 cards, no refill | 1-3 | Empty hand | 8-15 min | Closest variant to current build; just change hand size |
| **Classic** | 26 cards (split deck) | 1-4 | Empty hand | 20-45 min | Traditional Cheat / BS — no draw deck |

Effort: each mode is roughly a config row plus a mode picker change. **Scoring-based modes require the point system below to land first.**

## Scoring System

The current build wins on empty-hand only. A point-based system was designed but not implemented:

| Event | Proposed Points |
|-------|-----------------|
| Successful bluff (opponent accepts your lie) | +1 |
| Successful challenge (you catch a bluff) | +3 |
| Failed challenge (you accused a truthful claim) | -1 |
| Caught bluffing (extra to the challenger) | +2 to challenger |
| Truthful play accepted | 0 |

Per-mode win thresholds would be 10 / 15 / 20 points depending on the mode. **Not implemented.** Effort: ~half-day, including UI scoreboard panel.

## Dead Pile / Genesis Proof Pile

The original design opened each game with 5 face-down "mystery" cards in the center. The first failed bluff inherits those cards. **Not implemented** — the current build starts with an empty pile.

Rationale for skipping: with discard-and-redraw replacing pickup, the dead pile adds setup complexity without a clear upside. Easy to add back if it becomes desirable; effort is one constant in `initGame()`.

## Lie Detector Button (Optional)

Random in-game prompt: a lie detector icon flashes briefly; clicking in time grants a partial truth hint (+1 point in a scoring-based mode) about the Ai's last claim. Missing it would give the Ai a small advantage.

**Not implemented.** Depends on the scoring system landing first.

## Shot Glass / Party Mode (Optional)

Random reaction-test prompt; clicking in time degrades the Ai's bluffing for 1-3 rounds, missing reveals a piece of player state. Reaction-game framing for casual / drinking contexts.

**Not implemented.**

## Truth or Dare Mode (Future)

Between-round prompts that surface a Truth or Dare challenge. The Truth side could exercise selective-disclosure proofs in the realDeal build. Conceptually the most expansive feature on this list.

**Not implemented.** No design spec beyond the high-level concept.

## Difficulty Levels — Easy / Medium / Hard

Difficulty profiles **are scaffolded** in `demoLand/src/game/ai/difficulty.js` and consumed by `scripted.js`, but the UI does not yet expose a difficulty picker; the default is Medium. Surfacing a difficulty selector is straightforward (1-2 hours).

### Profile sketch (per design)
- **Easy** — bluffs rarely and obviously, challenges seldom, no card tracking.
- **Medium** — strategic bluffs with detectable patterns, mathematically motivated challenges, basic card tracking.
- **Hard** — expert misdirection, full counting in Home mode, probability play in Casino mode, adapts to the player's pattern.

## LLM-Backed Ai Persona

`agent.js` is wired to take an `apiKey` and route decisions through an LLM. Currently routes to the scripted agent. Future work: hook up Claude / OpenAI for in-character banter and adaptive bluffing.

**Not implemented** beyond the scaffolding.

---

## What Midnight Will Prove (realDeal ZK Catalog)

When realDeal lands, the following moments produce ZK proofs:

| Moment | What is proven | What stays private |
|--------|----------------|--------------------|
| Challenge resolution (claim true) | All played cards match the declared rank | All other cards in both hands |
| Challenge resolution (claim false) | At least one played card does not match the declared rank | What the cards actually were |
| Hand integrity | Both players still hold the correct card counts | Which specific cards |
| Deal fairness | Cards came from a properly shuffled deck | Card assignments |
| Win condition | Player reached the win condition | Hand contents |

The corresponding contract circuits live in `realDeal/contracts/proof-or-bluff.compact`. See [`DEMOLAND_VS_REALDEAL.md`](DEMOLAND_VS_REALDEAL.md) for the mapping from UI actions to circuit calls.

---

**Author**: John Santi (bytewizard42i) + Penny 🎀
**Game Design Origin**: March 31, 2026 (Alice brainstorm) → April 3, 2026 (rules formalized) → April 6, 2026 (7-card system) → May 2026 (discard-and-redraw + 10-card hand + Home/Casino consolidation matching the current UI)
