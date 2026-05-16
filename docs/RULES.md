# Proof or Bluff — Game Rules

**The Midnight card game where your hand stays private, your claims are public, and only disputed truth gets revealed.**

> **Design rationale**: See [Gameplay Design Analysis](GAMEPLAY_RESEARCH.md) for the research behind these rules.

> **⚠️ May 2026 mechanic change — supersedes older sections below**
>
> **The pile is no longer scooped on challenge resolution.** When a challenge
> resolves (in either direction), the active pile is **discarded permanently**
> and the losing player **draws an equal number of replacement cards from the
> deck**. The deck is **reshuffled immediately before every draw** so order
> can't be tracked or exploited.
>
> - **Caught bluffing** → bluffer draws `pile.length` cards from the reshuffled deck (min 2 if the pile was empty).
> - **Challenge failed (claim was true)** → challenger draws `pile.length` cards from the reshuffled deck.
> - **Pass turn** → passing player draws 1 card from the reshuffled deck.
>
> This is the precursor to the casino-mode "provably fair" Midnight ZK
> implementation described in [`CASINO_PROVABLY_FAIR.md`](CASINO_PROVABLY_FAIR.md).
> Older sections in this document still reference the "pick up the pile"
> mechanic — they are kept for historical context and should be read with
> the new rule in mind.

---

## Overview

Proof or Bluff (POB) is a two-player card game based on the classic bluffing game "Bullshit" / "Cheat", redesigned for privacy-preserving play on the Midnight Network. One player is human, the other is an Ai opponent.

The core mechanic: players take turns placing cards face-down and declaring what they played. The declaration may be truthful or a bluff. The opponent must decide whether to accept the claim or challenge it. When challenged, zero-knowledge proofs determine the outcome — revealing only whether the claim was true, without exposing the full hand.

---

## Game Modes

POB offers five modes with different hand sizes, win conditions, and session lengths:

| Mode | Hand Size | Cards/Play | Win Condition | Session | Feel |
|------|-----------|------------|---------------|---------|------|
| **Casual** | 5 cards | 1-2 | First to 10 pts | 3-5 min | Fast, chaotic, party |
| **Standard (default)** | 7 cards | 1-3 | First to 15 pts | 5-10 min | Balanced, strategic bluffing |
| **Strategic** | 7 cards, no refill | 1-3 | Empty hand | 8-15 min | Deep, card-counting rewarded |
| **Classic** | 26 cards (split deck) | 1-4 | Empty hand | 20-45 min | Traditional Cheat/BS |
| **Casino** | 7 cards, 5-deck shoe | 1-3 | First to 20 pts | 10-15 min | High variance, probability |

### Standard Mode (Default — Recommended)

- **Deck**: One standard 52-card deck
- **Hand**: 7 cards each; draw back to 7 after each turn
- **Dead Pile**: 5 cards dealt face-down to the center at game start (neither player knows them)
- **Draw pile**: Remaining 33 cards
- **Win**: First to 15 points
- **Session**: 5-10 minutes — perfect for mobile, companion play, quick matches

### Casual Mode

- Same as Standard but 5-card hands, 1-2 cards per play, first to 10 points
- Ultra-fast sessions (3-5 min), maximum bluff frequency
- Best for: party play, mobile-first, newcomers

### Strategic Mode

- 7-card hands with **no draw refill** — rest of deck is out of play
- First to empty hand wins (original Cheat/BS win condition)
- Card counting is viable (only 14 cards in play)
- Best for: experienced players who want a deeper deduction game

### Classic Mode (Original Rules)

- Deck split evenly: 26 cards each (Home) or 130 each (Casino deck)
- No draw pile — play until one player empties their hand
- 1-4 cards per play
- The traditional Cheat/BS experience for players who prefer the original format

### Casino Mode

- 7-card hands drawn from a 5-deck shoe (260 cards)
- Card counting neutralized — probability replaces certainty
- First to 20 points
- Best for: competitive play, wagered games, ranked matches (realDeal)

---

## Card Ranks

Standard playing card ranks, low to high:

`2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King, Ace`

Suits exist on the cards visually but **do not affect gameplay**. Only the rank matters.

---

## Setup (Standard Mode)

1. The deck is shuffled (visually: the Ai dealer shuffles on screen — this covers proof server startup time)
2. **5 cards** are placed face-down in the center as the **Dead Pile** (Genesis Proof Pile)
   - Neither player can see these cards
   - They create immediate stakes — the first bluff failure means picking up 7+ cards
3. **7 cards** are dealt to each player (private state)
4. Remaining **33 cards** form the face-down **draw pile**
5. The required rank for the first round is determined randomly (or starts at 2)
6. Score starts at 0-0

---

## Turn Structure

### The Active Player's Turn

The active player must do the following:

1. **Select 1 to 3 cards** from their hand to play face-down onto the central pile
2. **Declare a claim** about what they played:
   - The claim must state **how many cards** and **what rank** — e.g., "Two Kings" or "One Ace"
   - The declared rank must follow the **rank sequence** (see Rank Progression below)
   - **The claim may be true or false** — the player can play any cards they want regardless of what they declare

### The Opponent's Response

The opponent must choose one of two actions:

1. **Accept** — They believe (or tolerate) the claim. The face-down cards stay on the pile. If the claim was a bluff, the active player scores **+1 point** (successful bluff). Play passes to the next turn.
2. **Challenge ("Proof or Bluff!")** — They call the active player's bluff.

### Challenge Resolution

When a challenge is called:

- **If the claim was TRUE** (the active player really did play what they declared):
  - The **challenger loses** — they must pick up the entire central pile and add it to their hand
  - Challenger receives **-1 point** (failed challenge penalty)
  - Only the challenged cards are revealed (via ZK proof) — the rest of both hands stay private

- **If the claim was FALSE** (the active player bluffed):
  - The **bluffer loses** — they must pick up the entire central pile and add it to their hand
  - Challenger scores **+3 points** (successful challenge) and **+2 points** (caught a bluff)
  - Only the challenged cards are revealed — minimum disclosure

### Draw Phase

After each turn (whether challenged or not):

- The active player **draws cards from the draw pile** until they have **7 cards** in hand
- If the draw pile is empty, play continues without drawing (hands shrink naturally)
- If a player's hand exceeds 7 after picking up a pile, they do NOT draw

**Key privacy rule**: On challenge, Midnight proves whether the specific claim was true or false. It does NOT reveal what the cards actually were if the claim was false. It answers: *"Did they play what they said?"* — Yes or No. Nothing more.

---

## Rank Progression

Each turn, the required rank advances by one:

```
2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → Jack → Queen → King → Ace → 2 → 3 → ...
```

The rank wraps around from Ace back to 2.

- On your turn, you **must** declare the current rank in the sequence
- You may play cards of any actual rank — but you must *claim* they are the required rank
- This forces bluffing when you don't hold the required rank
- Strategic players will track which ranks are coming and plan ahead
- With 7 cards and 13 possible ranks, you'll need to bluff roughly 60-70% of the time — that's where the fun lives

---

## Scoring System

Points are awarded for successful deception and deduction:

| Event | Points | Why |
|-------|--------|-----|
| **Successful bluff** (opponent accepts your lie) | +1 | Reward for deception — low-risk so small reward |
| **Successful challenge** (you catch a bluff) | +3 | Reward for reading the opponent — the core thrill |
| **Failed challenge** (you accused a truthful claim) | -1 | Punishment for wrong read — prevents spam-challenging |
| **Caught bluffing** (opponent calls you correctly) | +2 to challenger | Challenger rewarded; bluffer already suffers pile pickup |
| **Truthful play accepted** | 0 | No reward for honesty that goes unchallenged |
| **Lie Detector bonus** (hit button in time) | +1 | Reward for reaction speed |
| **Shot Glass penalty** (missed button) | -1 | Punishment for slow reaction |

### Win Conditions by Mode

| Mode | Win Condition |
|------|--------------|
| **Casual** | First to **10 points** |
| **Standard** | First to **15 points** |
| **Strategic** | **Empty hand** wins (no score) |
| **Classic** | **Empty hand** wins (no score) |
| **Casino** | First to **20 points** |

---

## The Central Pile & Dead Pile

### The Dead Pile (Genesis Proof Pile)

- **5 cards** dealt face-down to the center at game start
- Neither player knows what they are
- They seed the central pile with mystery cards, creating immediate stakes
- The first failed bluff means picking up at least 7 cards (5 dead + your played cards + any others)
- A perfect ZK metaphor: committed, unknown, consequential

### The Central Pile

- Cards played face-down accumulate on top of the Dead Pile
- The pile grows each turn that goes unchallenged
- When a challenge occurs, the loser takes the **entire** pile (including Dead Pile cards)
- Letting the pile grow before challenging can be devastating (or backfire spectacularly)

---

## Special Mechanics (Optional — Toggleable)

### Lie Detector Button

- Occasionally (random interval), a **lie detector icon** flashes briefly on screen
- If the player **clicks it in time**: they get a partial ZK insight — a confidence hint about whether the Ai's last claim was honest (+1 point bonus)
- If they **miss it**: the Ai gains a small strategic advantage (e.g., sees one card from the player's hand, or gets a confidence boost)
- Frequency and impact can be tuned per difficulty level

### Party Mode (Shot Glass Mechanic)

- A **shot glass icon** appears at random intervals during play
- **Player clicks fast enough**: The Ai "drinks" — its bluffing accuracy degrades for the next 1-3 rounds
- **Player misses**: The player "drinks" — a minor piece of their game state is revealed to the Ai (-1 point penalty)
- Can be framed as drinking game, reaction challenge, or consequence roulette
- All consequences governed by selective disclosure — even silly mechanics are provably fair

### Truth or Dare Mode (Future Expansion)

- Between rounds, the Ai may pose a Truth or Dare challenge
- **Truth**: Player answers a question; Midnight can selectively prove/withhold aspects
- **Dare**: Ai challenges the player to an in-game action with proof-of-completion
- Expands the social-emotional game universe beyond pure card play

---

## Difficulty Levels (Ai Opponent)

### Easy
- Ai bluffs infrequently and obviously
- Ai challenges rarely and often incorrectly
- Ai does not track cards or use process of elimination
- Good for learning the game

### Medium
- Ai bluffs strategically but has detectable patterns
- Ai challenges when mathematically suspicious
- Ai does basic card tracking in Strategic/Classic Mode
- Competitive but beatable

### Hard
- Ai bluffs expertly with realistic misdirection
- Ai uses full card counting in Strategic/Classic Mode and probability in Casino Mode
- Ai adapts to the player's challenge patterns
- Ai's "tells" become unreliable or deliberately misleading
- A genuine challenge

---

## Game Flow — Standard Mode

```
┌─────────────────────────────────────────────────────────┐
│           PROOF OR BLUFF — STANDARD MODE FLOW            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. SHUFFLE & DEAL                                      │
│     ├── Ai dealer shuffles on screen                    │
│     │   (covers proof server startup)                   │
│     ├── 5 cards → Dead Pile (face-down center)          │
│     ├── 7 cards → each player                           │
│     └── 33 cards → draw pile                            │
│                                                         │
│  2. PLAYER'S TURN (or Ai's turn)                        │
│     ├── Select cards from hand (1-3)                    │
│     ├── Place face-down on pile                         │
│     └── Declare: "[N] [Rank]s"                          │
│         (must match rank sequence)                      │
│                                                         │
│  3. OPPONENT DECIDES                                    │
│     ├── ACCEPT → pile grows, score updated              │
│     └── CHALLENGE → "Proof or Bluff!"                   │
│                                                         │
│  4. CHALLENGE RESOLUTION (ZK proof)                     │
│     ├── Claim TRUE → challenger takes pile, -1 pt       │
│     └── Claim FALSE → bluffer takes pile, +3/+2 pts    │
│     └── Only the disputed claim is revealed             │
│                                                         │
│  5. DRAW PHASE                                          │
│     └── Active player draws back up to 7 cards          │
│                                                         │
│  6. CHECK WIN CONDITION                                 │
│     ├── Score ≥ 15? → YOU WIN                           │
│     └── Under 15? → next turn (step 2)                  │
│                                                         │
│  Optional events trigger between turns:                 │
│  ├── Lie Detector flash (+1 pt if caught)               │
│  ├── Shot Glass reaction challenge (-1 pt if missed)    │
│  └── Truth or Dare prompt (future)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Recommended Gameplay Scenario — A Full Standard Mode Game

Here's what a typical 7-minute Standard Mode game looks like, turn by turn:

**Setup**: You're playing against "Charming Liar" (Medium difficulty). 52-card deck shuffled. 5 Dead Pile cards placed in center. You receive 7 cards: 3♠, 5♦, 7♥, 7♣, 10♠, Q♦, K♥. Ai gets 7 cards (hidden). 33 cards in draw pile. Score: 0-0. Required rank: 2.

**Turn 1 — Your turn (Required: 2s)**
You don't have any 2s. You must bluff. You play 3♠ face-down and declare "One 2." The Ai studies you, smirks, says *"Hmm... I'll let it slide."* **Accept.** You score +1 (successful bluff). You draw 1 card from the draw pile back to 7. Score: **You 1, Ai 0.**

**Turn 2 — Ai's turn (Required: 3s)**
Ai plays 2 cards face-down: "Two 3s." You have no information yet — the pile has 6 cards (5 dead + your 1). You're not confident enough to challenge. **Accept.** Ai played honestly — no score change. Score: **You 1, Ai 0.**

**Turn 3 — Your turn (Required: 4s)**
You don't have any 4s. Another forced bluff. You play 5♦ face-down: "One 4." Ai pauses, narrows its eyes... *"Proof or Bluff!"* **CHALLENGED.** ZK proof resolves: your claim was FALSE. You pick up the pile (8 cards). Ai scores +3 (successful challenge) and +2 (caught your bluff). You don't draw (hand > 7). Score: **You 1, Ai 5.**

**Turn 4 — Ai's turn (Required: 5s)**
Ai plays 1 card: "One 5." With your expanded hand of 14 cards, you have two 5s yourself. In a single deck, there are four 5s total. If Ai has one and you have two, there's only one left unaccounted for. Plausible. **Accept.** Score: **You 1, Ai 5.**

**Turns 5-8** — Back-and-forth of bluffs and honest plays. You successfully challenge the Ai's false claim of "Three 9s" — scoring +3 and +2. Ai catches one more of your bluffs for +3/+2. Score: **You 6, Ai 10.**

**Turn 9 — Lie Detector Flash!**
A lie detector icon flashes on your screen. You click it in time! +1 point, and you get a hint: Ai's next claim has *"low confidence."* Score: **You 7, Ai 10.**

**Turn 10 — Ai's turn (Required: Jacks)**
Ai plays 2 cards: "Two Jacks." Your lie detector hint says low confidence. You challenge! *"Proof or Bluff!"* ZK proof: Ai's claim was FALSE. Ai picks up the pile (12 cards). You score +3 and +2. Score: **You 12, Ai 10.**

**Turns 11-14** — Momentum shifts. You bluff successfully twice (+2), Ai challenges you correctly once (+5 to Ai). Score: **You 14, Ai 15.**

**Ai wins!** The Charming Liar grins: *"Better luck next time, darling."* Rematch? The whole game took 7 minutes.

### What Made This Engaging

- **Forced bluffing 60%+ of turns** — rank progression + 7-card hand guarantees constant deception
- **Score swings create drama** — catching a bluff = +5 point swing, keeps every game competitive
- **Ai personality makes every decision social** — the opponent isn't a faceless engine, it's a character
- **14 turns in 7 minutes** — high interaction density, no dead time
- **ZK proofs resolve disputes instantly** — no hand reveals, no information leakage, just yes/no truth

---

## What Midnight Proves (ZK Proof Catalog)

| Moment | What is proven | What stays private |
|--------|---------------|--------------------|
| **Challenge — claim was true** | "Yes, those cards match the declared rank" | The rest of both hands; all other pile cards |
| **Challenge — claim was false** | "No, those cards do not all match the declared rank" | What the cards actually were; both hands |
| **Deal fairness** | Cards were dealt from a properly shuffled deck | The actual card assignments |
| **Card count integrity** | Both players still have the correct number of cards | Which specific cards |
| **Score integrity** | Points were awarded according to the rules | Nothing — scores are public |
| **Win condition** | Player reached the point threshold | Nothing — game is over |
| **Lie detector hint** | Partial confidence signal about last claim | Full truth of the claim |
| **Party mode consequence** | The revealed info is accurate and rule-consistent | Everything not explicitly revealed |

---

## Terminology

| Term | Meaning |
|------|---------|
| **POB** | Proof or Bluff (abbreviation) |
| **The Pile** | Central face-down card pile that accumulates each turn |
| **Dead Pile** | The 5 mystery cards placed face-down at game start (also: Genesis Proof Pile) |
| **Draw Pile** | The remaining deck from which players draw back to hand size |
| **Claim** | The public declaration of what cards were played |
| **Challenge** | Calling "Proof or Bluff!" — demanding cryptographic verification |
| **Bluff** | Playing cards that don't match your claim |
| **Tell** | A visual or verbal hint from the Ai about whether it's lying |
| **Score** | Points earned through successful bluffs and challenges |
| **Standard Mode** | Default 7-card mode with score-based winning (recommended) |
| **Classic Mode** | Traditional split-deck mode with empty-hand winning |
| **Casino Mode** | 5-deck shoe with 7-card hands and higher point threshold |
| **Selective Disclosure** | Midnight's ability to prove a fact without revealing the underlying data |

---

**Author**: John Santi (bytewizard42i) + Penny 🎀  
**Game Design Origin**: March 31, 2026 (Alice brainstorm) → April 3, 2026 (rules formalized) → April 6, 2026 (7-card system adopted)
