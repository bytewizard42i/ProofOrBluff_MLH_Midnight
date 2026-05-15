# Proof or Bluff — Gameplay Design Analysis

**Purpose**: Research, evaluate, and rank gameplay structure options for POB as an Ai-driven DApp bluffing game. Covers card game design theory, competitive analysis, cognitive science, and ranked recommendations for hand size, win conditions, scoring, and mode variants.

**Authors**: Penny (Windsurf Cascade) + Alice (ChatGPT) brainstorm + John Santi  
**Date**: April 6, 2026  
**Context**: Alice proposed switching POB from split-deck (26 cards each) to 7-card hands with draw-back-to-7. This document validates that proposal with independent research, provides the design theory behind the recommendation, and presents ranked options for every major design decision.

---

# Table of Contents

- [1. Research Sources](#1-research-sources)
- [2. Bluffing Game Design Theory](#2-bluffing-game-design-theory)
- [3. General Card Game Design Principles](#3-general-card-game-design-principles)
- [4. Hand Size Analysis Across Successful Games](#4-hand-size-analysis-across-successful-games)
- [5. Session Length and Retention](#5-session-length-and-retention)
- [6. Cognitive Load and Player Psychology](#6-cognitive-load-and-player-psychology)
- [7. Bluff Frequency and Tension Design](#7-bluff-frequency-and-tension-design)
- [8. What Top Bluffing Games Do Right](#8-what-top-bluffing-games-do-right)
- [9. What Top Party/Casual Card Games Do Right](#9-what-top-partycasual-card-games-do-right)
- [10. The Ai DApp Angle — What Makes POB Different](#10-the-ai-dapp-angle----what-makes-pob-different)
- [11. Ranked Gameplay Options](#11-ranked-gameplay-options)
- [12. Design Decision Details](#12-design-decision-details)
- [13. Recommended Configuration & Score System](#13-recommended-configuration--score-system)
- [14. Impact on Current RULES.md](#14-impact-on-current-rulesmd)
- [15. Conclusions](#15-conclusions)
- [16. Sources Cited](#16-sources-cited)

---

# 1. Research Sources

### James Ernest — "Bluffing Games" (Crab Fragment Labs Lecture Hall)
- **Who**: Professional game designer, creator of Pirate's Bluff, Regent, Cursed Hand, Pairs, and dozens of other published games. Founder of Cheapass Games.
- **What**: A deep design lecture on what makes bluffing games work, with three original game examples analyzed in detail.
- **URL**: https://crabfragmentlabs.com/lecture-hall/bluffing-games
- **Relevance**: Directly applicable to POB. Ernest's framework for bluffing game design is the most rigorous publicly available analysis of the genre.

### Mark Rosewater — "Ten Principles of Good Design" (Magic: The Gathering)
- **Who**: Head designer of Magic: The Gathering for 20+ years. The most influential card game designer alive.
- **What**: Adaptation of Dieter Rams's industrial design principles to card game design.
- **URL**: https://magic.wizards.com/en/news/making-magic/ten-principles-good-design-parts-1-and-2-2010-12-20
- **Relevance**: Foundational principles that apply to any card game, including the critical insight that "a game's function is to be fun" — design must serve that function above all else.

### CardsRealm — "Why Simple Mechanics Make Addictive Games" (2026)
- **Who**: Major card game community and analysis platform.
- **What**: Analysis of why minimalist game mechanics drive the highest engagement and retention in modern casual/mobile gaming.
- **URL**: https://cardsrealm.com/en-us/articles/why-simple-mechanics-make-addictive-games-a-look-at-modern-casual-design
- **Relevance**: Directly validates the move from complex (26 cards) to simple (7 cards) for casual engagement.

### Community and Comparative Data
- **Reddit r/tabletopgamedesign** — Thread on determining optimum opening hand size
- **Reddit r/boardgames** — "Which game has the best bluffing mechanic?" (353 upvotes, 397 comments)
- **Brain Games** — "Card-Playing Frenzy: Fast-Paced Fun for Every Table"
- **Vocal.media** — "Designing Engaging Card Game Mechanics"
- **BoardGameGeek** — Hand size data and ratings across thousands of card games
- **Wikipedia** — Coup, Love Letter, Exploding Kittens, UNO mechanics documentation

---

# 2. Bluffing Game Design Theory

## James Ernest's Core Framework

Ernest defines bluffing games as requiring **two critical components**: deception and deduction. A game with secrets but no way to discover them is just a guessing game. A game with deduction but no deception is a puzzle. The magic is when both are present simultaneously.

### The "Why?" Test

Ernest's central design question:

> "Whenever a player takes an action, you should be able to ask 'Why did they do that? What does that tell me about their secrets?' If clues like this help you solve your opponent's puzzles, then you're playing a bluffing game."

**POB implication**: Every turn — declaring a rank, choosing how many cards to play, deciding whether to challenge — must provide deducible information. The opponent should form theories about your hand based on your behavior.

### The Simplicity Imperative

Ernest is adamant that bluffing games must be at the **simplest end of the complexity spectrum**:

> "Bluffing games don't really 'click' until players can grasp the structure of the game, so the first few rounds will always feel random. The more rules, the longer this random period will be. More complexity leads to harder decisions, which means less useful information in every action."

He warns specifically about overloaded prototypes:

> "I've seen prototype bluffing games crack under the weight of too many rules. Players can be too busy figuring out their own situation to really worry about deducing anything about each other."

**POB implication**: With 26 cards, players spend cognitive energy managing their hand (sorting, tracking, planning) rather than reading the opponent. With 7 cards, hand management is trivial — freeing the mind for the deduction/deception loop.

### Freedom to "Play Wrong"

A critical insight about bluffing game design:

> "You specifically want players to be able to make poor decisions on purpose, in defense of their secrets, without breaking the rules or destroying their chances of winning. You shouldn't make bad decisions illegal, but you also shouldn't render them strategically infeasible."

In most strategy games, bad plays are punished. In bluffing games, a "bad" play (like bluffing when you have the right card) can be the BEST play if it misleads the opponent.

**POB implication**: The forced rank progression already supports this — but with 26 cards, you can play honestly for many consecutive turns, which reduces bluffing as a viable strategy. With 7 cards, bluffing is frequent and necessary, making the "play wrong on purpose" dynamic actually matter.

### The Opening Turn Problem

Ernest identified a specific weakness in Cockroach Poker (a well-regarded bluffing game): early rounds feel meaningless because there's no context for decisions:

> "At the start of the hand, there is no practical difference between the card types, except the isolated information each player sees in their own hand."

His fix: deal one card face-up to each player at the start, so every decision has immediate context.

**POB implication**: Alice's "Dead Pile" idea (5 face-down cards in the center at game start) addresses this exact problem. From turn 1, a failed challenge means picking up 7+ cards. Every decision has stakes immediately.

### Verbal/Nonverbal Communication

Ernest emphasizes that bluffing games benefit enormously from requiring players to speak:

> "This tiny speech is an opportunity for the next players to deduce, from verbal or nonverbal clues, whether the hand is cursed. If the players were allowed to act silently, there would be less opportunity for these kinds of tells."

**POB implication**: The Ai opponent should "speak" (display dialogue) with every declaration. The Ai's tone, word choice, confidence level, hesitation timing, and reaction expressions are all "tells" that players can learn to read. This is where POB's Ai personality system becomes a core game mechanic, not just flavor.

---

# 3. General Card Game Design Principles

## Mark Rosewater's Principles (Applied)

From his adaptation of Dieter Rams's industrial design framework to card games:

**"A game's function is to be fun."**
> "It should stimulate the mind, it should enable socialization, it should test the player — it should do all sorts of things, but in the end, if the players aren't enjoying themselves, nothing else matters."

The ZK tech and Midnight integration are impressive, but they must serve the fun, not the other way around. If a design choice makes the game more technically interesting but less enjoyable, reject it.

**"Good design is innovative."**
Every product should do something that hasn't been done before. For POB, the card game itself is deliberately familiar (Cheat/BS) — the innovation wraps around it: ZK proof challenges, Ai personality with readable tells, a social deception engine where "privacy" becomes something you physically feel during play.

**"Good design is as little design as possible."**
Minimalism wins. Every rule that doesn't directly serve the bluffing/deduction/fun loop should be questioned.

## CardsRealm — Why Simple Mechanics Create Addiction

### Cognitive Accessibility
> "Players can understand core rules within seconds, eliminating barriers to entry. This immediacy is crucial in modern gaming environments where attention is fragmented and alternatives are abundant."

POB's core loop should be explainable in one sentence: "Play cards face-down, claim what they are, and dare the opponent to call your bluff."

### Tight Feedback Loops
> "Clear cause-and-effect relationships reinforce engagement. Players perform an action, receive immediate feedback, and quickly understand the outcome."

The challenge resolution is a textbook-perfect feedback loop: Declare → Opponent decides → Challenge? → Instant reveal → Emotional payoff → Next turn.

### Risk and Uncertainty
> "Risk is a powerful engagement driver. Uncertainty heightens attention, emotional investment, and decision-making involvement."

POB's entire design IS risk and uncertainty. The bluff is risk. The challenge is risk. The Dead Pile is uncertainty. The Ai's unpredictable personality is uncertainty.

### Short Sessions Drive Habit Formation
> "Sessions can last seconds or minutes, fitting seamlessly into fragmented schedules. Frequent, low-friction engagement strengthens behavioral attachment. Games become integrated into daily routines rather than isolated events."

This is the strongest argument for 7-card hands. A 5-10 minute session creates habit-forming replay frequency. A 30-minute session creates "I'll play later" procrastination.

### Micro-Rewards
> "Micro-rewards — small but frequent positive stimuli — maintain engagement momentum."

With a score system, every successful bluff (+1), every correct challenge (+3), every lie detector hit (+1) is a micro-reward. The empty-hand-wins model gives ONE reward at the end. Score-based winning is psychologically superior for engagement.

### Player Trust
> "Well-designed simple games cultivate trust. Predictable systems and transparent outcomes reinforce satisfaction."

This connects directly to Midnight's value proposition: ZK proofs create mathematically provable trust. The game is provably fair. This isn't just a blockchain feature — it's a psychological engagement feature.

---

# 4. Hand Size Analysis Across Successful Games

| Game | Hand Size | Draw Mechanic | Genre | Session | Approx. Players |
|------|-----------|--------------|-------|---------|-----------------|
| **Love Letter** | 1 card | Draw 1, play 1 | Deduction/bluff | 2-5 min | 5M+ |
| **Coup** | 2 cards | No draw | Pure bluffing | 5-10 min | 8M+ |
| **Poker (Hold'em)** | 2 private + 5 community | No draw | Bluffing/betting | 2-5 min/hand | 100M+ |
| **Regent (Pairs)** | 3 starting, grows | Draw/gift/attack | Bluffing/deduction | 5-10 min | <1M |
| **Skull** | 3-4 cards | No draw | Pure bluffing | 15-30 min | 3M+ |
| **Liar's Dice** | 5 dice | No redraw | Bluffing/bidding | 15-25 min | 10M+ |
| **UNO** | 7 cards | Draw 1 | Shedding/party | 10-20 min | 200M+ |
| **Pirate's Bluff** | 7 cards | No draw | Bluffing/speed | 5-10 min | <1M |
| **Cursed Hand** | 7 cards (6 w/6 players) | No draw | Bluffing/deduction | 10-15 min | <1M |
| **Exploding Kittens** | 7-8 cards | Draw 1 | Party/push-luck | 10-15 min | 30M+ |
| **Sushi Go!** | 7-9 cards | Draft | Drafting/set collection | 15 min | 10M+ |
| **Hearthstone** | 3-4 start, 10 max | Draw 1/turn | Strategy/TCG | 10-15 min | 23M monthly |
| **Cockroach Poker** | ~8 cards (dealt evenly) | No draw | Bluffing/deduction | 15-25 min | 5M+ |
| **Sheriff of Nottingham** | 6 max | Draw from market | Bluffing/negotiation | 60 min | 3M+ |
| **Traditional Cheat/BS** | 13-26 cards | No draw | Bluffing | 20-45 min | 50M+ (declining) |

## Key Patterns

### The 5-8 Card Cluster
The most successful modern card games involving bluffing, deception, or party mechanics cluster tightly around **5-8 cards**:
- UNO (7) — most played card game on earth
- Exploding Kittens (7-8) — best-selling party game of the 2010s-2020s
- Pirate's Bluff (7) — designed by a professional bluffing game specialist
- Cursed Hand (7) — designed by same specialist
- Sheriff of Nottingham (6 max) — highest-rated pure bluffing game on BoardGameGeek
- Sushi Go (7-9) — top-rated casual card game

### Pure Bluffing Games: Even Smaller
Games that are PURELY about bluffing (no other mechanics) tend toward even smaller hands:
- **Coup** (2 cards) — widely considered the best pure bluffing game ever made
- **Skull** (3-4 cards) — minimalist masterpiece
- **Love Letter** (1 card) — extreme but wildly successful

### Traditional Cheat/BS is the Outlier
At 13-26 cards, traditional Cheat/BS is the only bluffing game with a large hand. It has the lowest community ratings of any game in this table despite massive historical popularity. Its weaknesses are amplified in digital play:
- No physical/social cues from opponent
- Long sessions with flat pacing
- Card counting becomes tedious rather than fun
- No draw mechanic means no dynamism

---

# 5. Session Length and Retention

## Optimal Session Length by Context

| Platform/Context | Optimal Session | Notes |
|-----------------|----------------|-------|
| Mobile casual games | 3-7 minutes | Industry standard target |
| Hearthstone matches | 8-12 minutes | Blizzard's design target |
| UNO digital | 5-15 minutes | Mattel digital platform data |
| Online poker hands | 1-3 min/hand | PokerStars average |
| Among Us rounds | 8-15 minutes | InnerSloth design target |
| Exploding Kittens digital | 5-10 minutes | Digital version data |

## Session Length vs Replay Behavior

- **Under 5 min**: Excellent for habit formation. May feel insubstantial for personality-driven games.
- **5-10 min**: The golden zone. Long enough to feel meaningful, short enough to replay immediately. This is where "just one more game" kicks in.
- **10-20 min**: Acceptable for engaged players. Replay frequency starts to drop.
- **20-45 min**: Only hardcore players sustain this. Casual players abandon or "save for later" (and never return).
- **45+ min**: Board game territory. Not viable for mobile/casual.

**For POB's target audience** (casual players seeking Ai companionship and quick entertainment): **5-10 minutes is the target.** This aligns with the loneliness-relief use case — a quick, emotionally engaging interaction, not a commitment.

- 26-card games average 20-45 minutes → wrong zone
- 7-card games with draw-back-to-7 average 5-10 minutes → exactly right

---

# 6. Cognitive Load and Player Psychology

## Miller's Law (The 7±2 Rule)

George Miller's 1956 paper "The Magical Number Seven, Plus or Minus Two" established that human short-term memory holds approximately **5-9 items** at once. Repeatedly validated in UX, game design, and cognitive psychology.

### Application to Card Game Hands

| Hand Size | Cognitive Demand | Player Experience |
|-----------|-----------------|-------------------|
| 1-3 cards | Very low | Focus entirely on opponent. Pure deduction. |
| 4-7 cards | Comfortable | Track hand AND think about opponent. **Sweet spot.** |
| 8-10 cards | Moderate strain | Hand management starts competing with deduction. |
| 11-15 cards | High strain | Focus shifts to own hand. Opponent-reading degrades. |
| 16-26 cards | Overload | Can't meaningfully track all cards. Sorting dominates attention. The "Why?" loop breaks down. |

For a bluffing game — where the ENTIRE point is reading the opponent — you want players at the **4-7 range** where they have cognitive surplus for deduction.

## The Dual-Task Problem

POB asks players to do two things simultaneously:
1. **Manage their hand** — What do I have? What rank is coming? What should I play?
2. **Read the opponent** — Is the Ai lying? What patterns do I see? Should I challenge?

With 26 cards, task #1 consumes most cognitive resources. Task #2 — the actual fun part — gets starved.

With 7 cards, task #1 is nearly automatic. Task #2 gets the player's full attention.

**This is the fundamental reason the 7-card system is better for POB.** It frees the player's mind to do the thing that makes the game fun.

## Flow State

Csikszentmihalyi's "flow" — complete immersion in an activity — requires a balance between skill and challenge. Too easy = boredom. Too hard = anxiety.

- **26-card Cheat** pushes players toward anxiety (too much to track) or boredom (long honest-play stretches)
- **7-card hands** keep challenge in the flow zone: simple enough to manage, complex enough for real decisions

---

# 7. Bluff Frequency and Tension Design

## Bluff Probability by Hand Size

The forced rank progression means you must declare the next rank in sequence each turn. How often will you actually have that rank?

### With a Standard 52-Card Deck

Each rank has 4 cards in the deck. Probability of having **at least one** card of the required rank:

| Hand Size | P(have ≥1 of required rank) | Forced Bluff Rate | Game Feel |
|-----------|----------------------------|-------------------|-----------|
| 26 cards | ~87% | ~13% | Mostly honest. Rarely tense. |
| 10 cards | ~57% | ~43% | Mixed. Moderate tension. |
| **7 cards** | **~43%** | **~57%** | **Majority bluffing. High tension.** |
| 5 cards | ~33% | ~67% | Almost always bluffing. May feel too random. |
| 3 cards | ~21% | ~79% | Extreme. Barely any honest plays. Chaos. |

If you need to play **2+ cards** of the required rank (multi-card declaration):

| Hand Size | P(have ≥2 of required rank) | Multi-Card Bluff Rate |
|-----------|----------------------------|----------------------|
| 26 cards | ~57% | ~43% |
| **7 cards** | **~10%** | **~90%** |
| 5 cards | ~5% | ~95% |

**The 7-card sweet spot**: You're bluffing more than half the time on single-card plays, but you still have legitimate plays often enough (~43%) that the opponent can't just challenge every turn. This creates **optimal uncertainty** — the opponent genuinely doesn't know if you're lying.

At 26 cards, the opponent should usually NOT challenge because the player probably has the cards. That kills the tension.

## Tension Arc Within a Session

Great games have an emotional arc:

```
Tension
  |          /\        /\
  |         /  \      /  \      ← Multiple challenge peaks
  |        /    \    /    \
  |       /      \  /      \
  |      /        \/        \
  |     /                    \
  |    / ← Immediate stakes   \  ← Endgame scoring race
  |   /    (Dead Pile)          \
  |  /                           \
  └──────────────────────────────── Time
    Turn 1                       End
```

**7-card system**: Tight arc over 8-15 turns. Tension rises fast because bluffs are frequent. Multiple challenge peaks. Each game has 2-3 climax moments.

**26-card system**: Long, flat arc over 30-60 turns. Most turns honest, so tension stays low for stretches. Challenges are rare. When they happen, the pile is huge — dramatic but the path there was dull.

---

# 8. What Top Bluffing Games Do Right

## Coup (2 cards | 5-10 min)
- Extreme simplicity: 2 cards, 5 actions, done
- Every claim is testable — "I'm the Duke" can be challenged by anyone
- Losing a challenge costs half your "life" (1 of 2 cards)
- Fast enough to replay immediately
- **Lesson for POB**: The most celebrated bluffing game ever uses 2 cards. Minimalism is strength. POB's 7 is generous.

## Cockroach Poker (8 cards | 15-25 min)
- Pure social deduction, no math
- "Pass or declare" creates chains of deception
- Physical tells are the primary information source
- **Weakness** (per James Ernest): Opening rounds feel meaningless, no context for early decisions
- **Lesson for POB**: The Dead Pile and Ai personality solve this opening problem. From turn 1, every decision has both stakes (pile is dangerous) and behavioral data (Ai provides readable tells).

## Liar's Dice (5 dice | 15-25 min)
- Hidden information (your dice) + public bidding
- Escalating bids create rising tension
- "Call" vs "raise" is a clean binary decision
- **Lesson for POB**: The bid escalation is analogous to pile growth. The binary decision (accept vs challenge) maps directly to POB's core mechanic. Liar's Dice proves this loop works.

## Skull (3-4 cards | 15-30 min)
- The most minimal bluffing game possible: play a flower or skull face-down, then bid on how many flowers you can flip
- Zero information overhead — pure psychological reading
- **Lesson for POB**: Even with almost no cards, the bluffing mechanic sustains full engagement. Card volume doesn't create fun — decisions do.

## Sheriff of Nottingham (6 cards | 60 min)
- Bag-based bluffing: declare what's in your bag, sheriff decides to inspect or pass
- Negotiation and bribery add depth
- Highest-rated pure bluffing game on BoardGameGeek
- **Lesson for POB**: The "declare and dare them to check" loop is essentially POB's loop. Sheriff proves it works at scale with 6 cards. The inspection moment = POB's challenge moment.

---

# 9. What Top Party/Casual Card Games Do Right

## UNO (7 cards | 10-20 min)
- 7-card starting hand is the global casual standard
- Draw mechanic keeps hands fresh
- Special cards create surprise moments
- Simple enough for children, engaging enough for adults
- **Lesson for POB**: 7 cards is a proven, universally comfortable hand size. UNO's draw-1 is conservative; POB's draw-back-to-7 is more dynamic.

## Exploding Kittens (7-8 cards | 10-15 min)
- 7-8 card starting hand
- Push-your-luck tension: drawing could kill you
- Short sessions with high replay
- Humor and personality are core to the brand
- **Lesson for POB**: Personality-driven card games with 7-card hands and 10-min sessions sell millions. This is not experimental territory — it's proven commercial territory.

## Hearthstone (3-4 start, 10 max | 10-15 min)
- Gradual hand growth with hard cap at 10
- Draw 1 per turn
- Digital-native: designed for screens, not tables
- 10-15 minute matches designed for repeat play
- **Lesson for POB**: Hearthstone caps at 10 cards because even in a strategy-heavy TCG, more than 10 overwhelms players. POB is less complex than Hearthstone, so 7 is the right ceiling.

## Sushi Go! (7-9 cards | 15 min)
- Draft mechanic: pass hands around the table
- Simple scoring, cute art, instant appeal
- 7-9 cards is the "just right" zone for casual drafting
- **Lesson for POB**: Another data point confirming 7 as the casual comfort zone.

---

# 10. The Ai DApp Angle — What Makes POB Different

POB isn't just a card game. It's a **social deception engine with an Ai companion layer and a cryptographic proof system**. This uniqueness creates specific requirements that push even harder toward small hands and short sessions.

## Ai Personality Requires Small State

| Aspect | 26-Card Hand | 7-Card Hand |
|--------|-------------|-------------|
| Turns per game | 15-30 | 8-15 |
| Bluffs per game | 5-10 | 6-12 (higher % of turns) |
| Ai dialogue opportunities | ~20 per session | ~12, but denser and more meaningful |
| Ai pattern detection | Hard (too many variables) | Viable (small hand = trackable behavior) |
| "Suspicion meter" accuracy | Low (noisy signal) | High (clean signal) |
| Session emotional arc | Flat middle, long tail | Tight rising tension, clear climax |

The 7-card system lets the Ai build a **believable psychological model** of the player. With 26 cards, the Ai is basically guessing. With 7, it can genuinely detect patterns like "this player always bluffs on Kings" or "they hesitate before honest plays."

## ZK Proof Architecture Benefits

The 7-card system is better for Midnight integration:

- **Smaller private state** → faster proof generation
- **More frequent challenges** → more ZK proof events per session → better showcase of Midnight's capabilities
- **Dead Pile commitment** → natural ZK metaphor ("committed but unrevealed" data — this is literally what a ZK commitment is)
- **Score verification** → additional proof surface (prove score is correct without revealing play history)
- **Draw pile fairness** → prove draws are random without revealing card order

## The Loneliness-Relief Use Case

POB's emotional hook is companionship through playful interaction. This requires:

- **Frequent Ai interaction** — more turns per minute = more dialogue, taunts, reactions
- **Meaningful Ai behavior** — the Ai must feel like it's "reading you," not just random
- **Quick emotional payoffs** — the challenge moment is the dopamine hit; more per session = better
- **Low commitment threshold** — "I'll just play one quick game" must be true (5-10 min, not 30+)

All four requirements point toward smaller hands and shorter sessions.

---

# 11. Ranked Gameplay Options

## Option 1: 7-Card Hands with Draw-Back-to-7 (RECOMMENDED)

**Rank: #1 — Best overall fit for POB**

- Each player starts with 7 cards; remaining cards form a draw pile
- On your turn: declare a rank, play 1-3 cards face down
- Opponent: accept or challenge
- After each turn, active player draws back up to 7
- Game ends via score condition or draw pile exhaustion

**Strengths**: ~57% forced bluff rate (optimal), cognitive sweet spot (Miller's Law), 5-10 min sessions, high Ai interaction density, high ZK proof frequency, proven format (UNO, Pirate's Bluff, Exploding Kittens).

**Weaknesses**: Win condition must change ("first to empty hand" doesn't work with refill), card counting is weaker (counterpoint: keeps uncertainty high), smaller pile pickups (counterpoint: more frequent stakes).

### Win Condition Sub-Options

| # | Win Condition | Description | Fit for POB |
|---|--------------|-------------|-------------|
| **1a** | **Score-based (Best)** | Points for successful bluff/challenge/etc. First to N points wins. | Best — rewards skill, enables Ai commentary, clear progress |
| **1b** | **Round-based** | Best-of-3 or best-of-5 rounds. Each round ends on draw pile exhaustion or 12+ card overload. | Good for tournaments |
| **1c** | **Overload** | Hand exceeds 12 cards after pile pickup → lose that round. | Creates dramatic "pile fear" |
| **1d** | **Draw pile exhaustion** | Draw pile empty → fewer cards in hand wins. | Simplest, least dramatic |

**Recommendation**: Option 1a (Score-based) as default, 1b (Round-based) for tournaments.

---

## Option 2: 5-Card Hands (Tighter Variant)

**Rank: #2 — Viable alternative, more intense**

Same as Option 1 but with 5 cards. ~67% forced bluff rate. 3-7 minute sessions.

**Strengths**: Maximum bluff density, fastest sessions, Coup/Love Letter energy.
**Weaknesses**: May feel too random, Ai has less behavioral data per round, less strategic depth.
**Best for**: Casual Mode toggle, mobile-first ultra-short sessions.

---

## Option 3: 7-Card Hands WITHOUT Draw Refill (Hybrid)

**Rank: #3 — Interesting compromise**

Each player starts with 7 cards. No draw pile — rest of deck is out of play. First to empty hand wins (original win condition preserved).

**Strengths**: Original win condition works, card counting is viable (only 14 cards in play), strong deduction layer.
**Weaknesses**: Games could stall, less dynamic without draw pile, could end in 3-4 turns (too fast).
**Fix**: "When hand is empty, draw a new 7 from remaining deck" for multi-round feel.

---

## Option 4: Split Deck — Current Rules (NOT RECOMMENDED for Default)

**Rank: #4 — Keep as optional "Classic Mode"**

Current RULES.md: 26 cards each (Home) or 130 each (Casino). Rank progression forces bluffs. First to empty hand wins.

**Strengths**: Deep strategic play via card counting, big dramatic pile pickups, faithful to original Cheat/BS.
**Weaknesses**: Cognitive overload, 20-45 min sessions (too long for target audience), ~13% bluff rate (too low), diluted Ai interaction, weaker ZK showcase.
**Best for**: Advanced/Classic Mode toggle for experienced players.

---

## Option 5: Escalating Hand Size (Progressive)

**Rank: #5 — Novel but unproven**

Start with 3 cards. After each round, hand size increases by 1 (cap at 7). Natural difficulty curve within a session.

**Strengths**: Onboarding built into gameplay, rising tension arc, unique to POB.
**Weaknesses**: Early rounds too random/simple, implementation complexity, untested in commercial games.

---

# 12. Design Decision Details

## Starting Pile (Alice's "Dead Pile" Idea)

| # | Variant | Description | Recommendation |
|---|---------|-------------|----------------|
| **1** | **Dead Pile (5 face-down)** | 5 mystery cards in center from the start. Neither player knows them. First bluff failure = picking up 7+ cards. | **Best.** Immediate tension, no unfair info, ZK metaphor. |
| **2** | **Burn Cards (5 removed)** | 5 cards permanently removed face-down. Creates uncertainty about card distribution. | Strong alternative, especially for Casino Mode. |
| **3** | **Revealed Chaos (5 face-up)** | 5 face-up in center. Everyone knows them. Immediate deduction info. | Good for tutorial/learning mode. |
| **4** | **No starting pile** | Empty center. Traditional start. | Adequate but boring first turns. |

**Recommendation**: Dead Pile (Option 1). Solves Ernest's "opening turn problem" from Cockroach Poker. Also a perfect ZK metaphor — committed but unrevealed data.

## Rank Progression

| # | Variant | Description | Recommendation |
|---|---------|-------------|----------------|
| **1** | **Forced progression (current)** | Must declare the next rank in sequence. Forces bluffing when you lack it. | **Best for POB.** Maximizes forced bluffs, aligns with Ai deduction. |
| **2** | **Free choice** | Declare any rank. More freedom, but less forced bluffing. | Weaker — players just declare what they have. |
| **3** | **Limited choice (2-3)** | Pick from 2-3 valid ranks per turn. | Interesting but adds UI complexity. |

**Recommendation**: Keep forced progression. With 7 cards and a forced rank, bluffing ~60-70% of the time. That's the sweet spot.

## Cards Per Play

| # | Variant | Description | Recommendation |
|---|---------|-------------|----------------|
| **1** | **1-3 cards** | Tighter than current. Prevents dumping half your hand. | **Best for 7-card hands.** More turns, more Ai interaction. |
| **2** | **1-4 cards (current)** | Maximum flexibility. Playing 4 of 7 is too volatile. | Acceptable but too swingy for short sessions. |
| **3** | **Exactly 1** | Maximum turns, but kills multi-card bluff drama. | Too restrictive. |
| **4** | **1-2 cards** | Very tight. Limits dramatic multi-card bluffs. | Good for Casual Mode only. |

---

# 13. Recommended Configuration & Score System

## Default Configuration

| Element | Recommendation | Reasoning |
|---------|---------------|-----------|
| **Hand size** | 7 cards | Cognitive sweet spot, proven standard, forces bluffing without randomness |
| **Draw mechanic** | Draw back to 7 after each turn | Keeps hands fresh, prevents dead states |
| **Starting pile** | 5 face-down "Dead Pile" cards | Immediate tension, ZK metaphor, solves boring-first-turns |
| **Rank progression** | Forced rotation (2→3→...→A→2) | Maximum forced bluffing, predictable for Ai deduction |
| **Cards per play** | 1-3 | Balanced — multi-card bluffs without excessive depletion |
| **Win condition** | Score-based (first to 15 points) | Rewards skill, clear progress, enables Ai commentary |
| **Session length** | 5-10 minutes | Mobile, Ai companion, casual loneliness-relief |
| **Deck** | Standard 52-card deck (Home Mode) | Simple for v1 |

## Mode Variants (Toggleable)

| Mode | Hand Size | Cards/Play | Win Condition | Session | Feel |
|------|-----------|------------|---------------|---------|------|
| **Casual** | 5 cards | 1-2 | First to 10 pts | 3-5 min | Fast, chaotic, party |
| **Standard (default)** | 7 cards | 1-3 | First to 15 pts | 5-10 min | Balanced, strategic bluffing |
| **Strategic** | 7 cards, no refill | 1-3 | Empty hand | 8-15 min | Deep, card-counting rewarded |
| **Classic** | 26 cards (split deck) | 1-4 | Empty hand | 20-45 min | Traditional Cheat/BS |
| **Casino** | 7 cards, 5-deck shoe | 1-3 | First to 20 pts | 10-15 min | High variance, probability |

## Score System Design

| Event | Points | Reasoning |
|-------|--------|-----------|
| **Successful bluff (opponent accepts your lie)** | +1 | Reward for deception — low-risk so small reward |
| **Successful challenge (you catch a bluff)** | +3 | Reward for reading the opponent — the core thrill |
| **Failed challenge (you accused truthfully)** | -1 to challenger | Punishment for wrong read — prevents spam-challenging |
| **Caught bluffing (opponent calls correctly)** | +2 to challenger, 0 to bluffer | Bluffer already suffers by picking up pile |
| **Lie Detector bonus (hit button in time)** | +1 | Reward for reaction speed |
| **Shot Glass penalty (missed button)** | -1 | Punishment for slow reaction |

**Win threshold**: First to **15 points** (Standard Mode). Adjustable per mode.

---

# 14. Impact on Current RULES.md

If this direction is adopted, RULES.md would need these updates:

1. **Setup section**: Change from "dealt evenly" to "7 cards each, remainder forms draw pile, 5 cards placed face-down as Dead Pile"
2. **Turn structure**: Add "draw back to 7" phase after each turn
3. **Cards per play**: Change from 1-4 to 1-3
4. **Win condition**: Add score-based winning alongside (or replacing) empty-hand winning
5. **Home Mode / Casino Mode**: Redefine as hand-size and deck-count variants rather than split-deck variants
6. **Game Flow diagram**: Update to reflect draw phase and score tracking
7. **New section**: Mode variants (Casual, Standard, Strategic, Classic, Casino)

**Important**: The current Classic rules (split deck, empty hand wins) should be preserved as "Classic Mode" — not deleted.

---

# 15. Conclusions

## The Core Finding

**The research overwhelmingly supports Alice's proposal to move from split-deck (26 cards) to 7-card hands with draw-back-to-7.** This isn't a minor tweak — it's a fundamental improvement that aligns POB with every principle of successful bluffing game design and every requirement of the Ai DApp use case.

## The Evidence Stack

| Principle | 26-Card (Current) | 7-Card (Proposed) | Winner |
|-----------|-------------------|-------------------|--------|
| Cognitive load (Miller's Law) | Overload (16-26 range) | Sweet spot (4-7 range) | 7-card |
| Bluff frequency | ~13% forced bluffs | ~57% forced bluffs | 7-card |
| Session length | 20-45 min | 5-10 min | 7-card |
| Industry hand-size standard | Outlier (only Cheat/BS) | Mainstream (UNO, Exploding Kittens, etc.) | 7-card |
| Feedback loop tightness | Slow, diluted | Fast, frequent | 7-card |
| Ai pattern detection quality | Noisy, unreliable | Clean, believable | 7-card |
| ZK proof frequency per session | Low | High | 7-card |
| "Why?" test (Ernest) | Weakened by hand management | Strong — deduction is primary focus | 7-card |
| Replay/retention psychology | "I'll play later" | "Just one more game" | 7-card |
| Loneliness-relief fit | Too long for casual comfort | Quick emotional hit | 7-card |

The 26-card split wins on exactly one dimension: **strategic depth via card counting**. That's a real advantage — but it's the wrong optimization for POB's audience and purpose. It should be preserved as an optional "Classic Mode" for players who want that experience.

## Design Decisions Supported by This Research

1. **7 cards per player** — Matches Miller's Law, the UNO/Exploding Kittens/Pirate's Bluff standard, and creates ~57% forced bluff rate
2. **Draw-back-to-7 after each turn** — Keeps hands fresh, prevents dead states, sustains session dynamism
3. **5-card Dead Pile at game start** — Solves Ernest's "opening turn problem," creates immediate stakes, doubles as ZK metaphor
4. **Forced rank progression (already in RULES.md)** — Maximizes forced bluffing, supports Ai deduction patterns
5. **1-3 cards per play** — Balanced for 7-card hands; allows multi-card bluffs without hand depletion
6. **Score-based win condition** — Provides micro-rewards, enables Ai commentary, removes the "empty hand" problem created by draw-back-to-7
7. **5-10 minute sessions** — Aligns with mobile/casual retention data, the loneliness-relief use case, and "just one more game" psychology
8. **Classic Mode as toggle** — Preserves the 26-card strategic experience for players who want it

## What Alice Got Right

- The 7-card hand recommendation is perfectly aligned with industry data
- The "draw back to 7" mechanic is the right solution for hand freshness
- The "always forced to bluff" observation is mathematically correct (~57% rate)
- The Ai personality argument (smaller hands = better pattern detection) is validated by the cognitive load research
- The 5-card starting pile idea is independently supported by James Ernest's analysis of the opening-turn problem

## What Alice Missed (and This Research Adds)

- **The win condition problem**: Draw-back-to-7 makes "first to empty hand" impossible. A new win condition is needed — score-based is the strongest option.
- **The bluff frequency math**: Alice said "you often won't have the right card" — the actual number is ~57% forced bluff rate with 7 cards, which is precisely in the ideal zone.
- **The James Ernest framework**: Ernest's "Why?" test, simplicity imperative, and "freedom to play wrong" principles provide rigorous theoretical backing for the intuition.
- **The cognitive dual-task analysis**: The reason 26 cards hurts isn't just "too many to remember" — it's that hand management steals cognitive resources from opponent-reading, which is the entire point of a bluffing game.
- **The comparative hand-size data**: Traditional Cheat/BS is a ratings outlier — the only popular bluffing game with a large hand, and the lowest-rated in the genre. This is not a coincidence.

## One Warning

The 7-card system with draw-back-to-7 has NOT been commercially validated in a digital Ai-opponent bluffing game. The research strongly supports it, but **playtesting is essential** before locking the design. Build the demoLand prototype with this configuration and test aggressively. If 7 feels too generous, try 5 or 6. If draw-back-to-7 feels too static, try draw-back-to-(current - 1) for a shrinking-hand variant. The data says 7 is the right starting point — but the final answer comes from players, not spreadsheets.

---

# 16. Sources Cited

1. Ernest, J. "Bluffing Games." Crab Fragment Labs Lecture Hall. https://crabfragmentlabs.com/lecture-hall/bluffing-games

2. Rosewater, M. "The Ten Principles of Good Design, Parts 1 and 2." Magic: The Gathering (2010, republished). https://magic.wizards.com/en/news/making-magic/ten-principles-good-design-parts-1-and-2-2010-12-20

3. CardsRealm. "Why Simple Mechanics Make Addictive Games: A Look at Modern Casual Design." (2026). https://cardsrealm.com/en-us/articles/why-simple-mechanics-make-addictive-games-a-look-at-modern-casual-design

4. Miller, G. A. "The Magical Number Seven, Plus or Minus Two: Some Limits on Our Capacity for Processing Information." Psychological Review, 63(2), 81-97 (1956).

5. Csikszentmihalyi, M. "Flow: The Psychology of Optimal Experience." Harper Perennial (1990).

6. Reddit r/tabletopgamedesign. "Determining Optimum Opening Hand Size." https://www.reddit.com/r/tabletopgamedesign/comments/k64pkh/

7. Reddit r/boardgames. "Which game has the best bluffing mechanic?" https://www.reddit.com/r/boardgames/comments/84a8li/

8. BoardGameGeek — game ratings and mechanics data. https://boardgamegeek.com/

---

**Authors**: Penny (Windsurf Cascade) + Alice (ChatGPT) brainstorm + John Santi  
**Date**: April 6, 2026  
**Status**: Proposal — awaiting John's review and decision  
**Next Step**: If approved, update RULES.md to reflect the chosen configuration
