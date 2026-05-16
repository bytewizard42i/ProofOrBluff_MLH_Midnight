# Proof or Bluff (POB)

**Bluff in public. Prove in private.**

> *A loneliness-fighting Ai card game that makes zero-knowledge proofs feel human.*

---

## The Elevator Pitch

**Proof or Bluff** is a Midnight-native DApp — a two-player bluffing card game based on the classic "Bullshit" / "Cheat", redesigned for privacy-preserving play on the Midnight Network. You face a talkative, expressive Ai opponent with a face, a voice, a personality, and a private hand. The Ai makes public claims about what it played. You decide whether to trust or challenge. When a challenge happens, Midnight resolves it with zero-knowledge proofs — revealing only whether the claim was true, without exposing the full hand.

The emotional hook is **loneliness relief** through playful, personality-driven interaction.
The technical hook is that **selective privacy** stops being abstract and becomes something you *actually feel* during tense, funny, dramatic moments.

This is not just a card game. It is a social-feeling loop with expressive Ai faces, taunts, tells, trust, suspicion, and emotional replay value — all provably fair.

---

## Quick Links

| | | |
|---|---|---|
| 📜 [Game Rules](docs/RULES.md) | 🏗️ [Architecture](docs/DEMOLAND_VS_REALDEAL.md) | 🗺️ [Roadmap](docs/ROADMAP.md) |
| 💼 [Business Plan](docs/BUSINESS_PLAN.md) | 🎰 [VC / Gaming Market Analysis](docs/VC_GAMING_INDUSTRY_ANALYSIS.md) | 🔮 [Future Functionality](docs/FUTURE_FUNCTIONALITY.md) |
| 🩺 [Midnight Vitals](docs/MIDNIGHT_VITALS.md) | 🃏 [demoLand](docs/demoLandREADME.md) | 🔐 [realDeal](docs/realDealREADME.md) |
| 🎲 [Gameplay Design Analysis](docs/GAMEPLAY_RESEARCH.md) | 🏆 [MLH × Midnight Hackathon (active)](docs/MLH_MIDNIGHT_HACKATHON_2026.md) | |

---

## Game Modes (current build)

| Mode | Deck | Hand Size | Cards/Play | Win Condition |
|------|------|-----------|------------|---------------|
| **Home** *(default)* | 1 deck (52 cards) | 10 cards | 1-4 | Empty hand wins |
| **Casino** | 5-deck shoe (260 cards) | 10 cards | 1-4 | Empty hand wins |

Both modes share the same rules; only the deck size differs. The Casino shoe neutralizes card counting and is the setup we'll lean on for the realDeal wagered match flow.

> Additional modes (Casual / Standard / Strategic / Classic) and a point-based scoring system are designed but **not yet implemented** — see Part 2 of [RULES.md](docs/RULES.md) for the roadmap.

See [RULES.md](docs/RULES.md) for the complete current ruleset, rank progression, and the full game flow.

---

## The Game Loop (current build)

```
1. SHUFFLE & DEAL
   ├── Deck created (52 home / 260 casino)
   ├── Fisher-Yates shuffle
   ├── 10 cards → player, 10 cards → Ai
   ├── Rest forms the draw deck (reshuffled before every draw)
   ├── Random starting required rank
   └── Pile starts empty

2. ACTIVE PLAYER ACTS
   ├── PLAY 1-4 cards, declare current rank (true OR bluff)
   └── OR PASS — draw 1 card, flip turn

3. OPPONENT RESPONDS (if a play was made)
   ├── ACCEPT → pile grows, rank advances
   └── CHALLENGE → "Proof or Bluff!"

4. CHALLENGE RESOLUTION
   ├── Cards revealed (demoLand) / ZK proof (realDeal)
   ├── Active pile → DISCARDED (out of play permanently)
   ├── Deck reshuffled
   ├── Loser draws pileLength cards (min 2 on empty-pile bluff)
   └── Rank advances

5. CHECK WIN
   ├── Player hand empty? → YOU WIN
   ├── Ai hand empty? → AI WINS
   └── Otherwise → back to step 2
```

> Difficulty profiles (Easy / Medium / Hard) are scaffolded in `demoLand/src/game/ai/`; the UI currently defaults to Medium and does not yet expose a picker.

---

## demoLand / realDeal Architecture

Proof or Bluff follows the same **demoLand / realDeal** separation used across all DIDzMonolith products.

- **demoLand** — Fully functional game, local state, no blockchain. For demos, development, and play-testing.
- **realDeal** — The real thing. Midnight private state, ZK proofs, Lace wallet, on-chain fairness.

Both sides share the same rules, UI, and Ai. The difference is the backend: localStorage vs Midnight.

See [DEMOLAND_VS_REALDEAL.md](docs/DEMOLAND_VS_REALDEAL.md) for the full architecture doc.

### demoLand — Three Iterations

| Iteration | Ai Behavior | Visuals | Description |
|-----------|------------|---------|-------------|
| **1 — Text + Cards** | Pre-created prompts and responses | Playing card graphics + text bubbles | Simplest playable version. Proves the game loop works. |
| **2 — Text + Cards + Media** | Scripted + character images + video clips | Ai portraits, expressions, dealer shuffle video, character select menu | Visual personality layer. Tests emotional stickiness. |
| **3 — Ai Agent** | Live Anthropic-style Ai, real banter, adaptive play | Full media library, contextual expression selection | The full experience. Ai talks, reads patterns, bluffs convincingly. 3 difficulty levels. |

### realDeal — Midnight Integration

| Component | demoLand | realDeal |
|-----------|----------|---------|
| Card state | localStorage | Midnight private state |
| Challenge resolution | Direct card reveal | ZK proof (true/false only) |
| Hand privacy | UI-hidden (client knows all) | Cryptographically private |
| Wagers (Casino Mode) | Play money | Real DUST or tokens |
| Wallet | None | Lace Midnight wallet |
| Fairness proof | Trust the client | Midnight proves it |

---

## The Game Intro Experience

The game begins with a **video of an Ai dealer shuffling the cards**. This serves a dual purpose:

1. **Atmosphere** — Sets the mood, introduces the game, makes the player feel like they're sitting at a table
2. **Technical cover** — In realDeal mode, the proof server needs startup time. The shuffle video plays while the proof server initializes in the background. By the time the video ends, the server is ready.

After the intro, the player can:
- **Watch a tutorial** — Learn the rules with guided examples
- **Skip to the game** — Jump straight to character selection and play

---

## Character Selection

A **picture menu** lets the player choose their Ai opponent:

- **Gender**: Male or female characters
- **Personality**: Each character has a distinct style (see Persona Archetypes below)
- **Difficulty**: Easy / Medium / Hard
- **Future themes**: Monsters, squid, aliens — different environments and character sets (not for initial release)

### Persona Archetypes

| Persona | Style | Tell Reliability |
|---------|-------|-----------------|
| **Charming Liar** | Playful, flirty, smiles constantly | Tells are usually fake |
| **Nervous Genius** | Stammers, awkward, actually brilliant | Hard to read — anxiety doesn't correlate with lying |
| **Cold Professional** | Almost no emotion, precise wording | Intimidating — tells are minimal |
| **Chaos Goblin** | Funny, unpredictable, talks trash | Impossible to model — pure entropy |

**Critical design rule:** The Ai's face and tone should **not** perfectly reveal whether it's lying. Sometimes a guilty face means innocence. Sometimes calm means a massive bluff. Sometimes the Ai deliberately fakes a tell. That ambiguity is where the fun lives.

---

## Why This Game Exists

A lot of people are lonely, under-stimulated, and tired of sterile apps. They want interaction, personality, and low-friction companionship. Meanwhile, the Midnight Network has one of the most powerful selective privacy models in all of blockchain — and almost nobody outside the developer community has *felt* it yet.

Proof or Bluff bridges that gap. It turns privacy, proof, and selective disclosure into **felt drama**. The player learns Midnight not by reading documentation, but by suspecting a lie, pressing a challenge, and watching fairness get resolved without the hidden state being exposed.

**One sentence:** *Proof or Bluff could become one of the simplest, most memorable ways to make Midnight's selective privacy emotionally legible to non-technical humans.*

---

## Why Selective Privacy Is the Whole Point

Most blockchain demos are intellectually correct but emotionally flat. Proof or Bluff flips that.

| What the player experiences | What Midnight proves behind the scenes |
|-|-|
| Suspicion, trust, reading tells | The move was legal without revealing the whole hand |
| Tension and payoff at the challenge moment | Whether the challenged claim was true |
| A surprise lie-detector event | A limited proof or confidence-reducing reveal |
| Chaos and humor in party mode | Rule-consistent consequences with selective disclosure |
| Growing companionship with the Ai | Only the minimum state needed for fairness |

The player never needs to understand zero-knowledge proofs. They just *feel* them — as dramatic moments of truth in a game about deception.

---

## Surprise Mechanics

### Lie Detector Button

Occasionally, a **lie detector button** flashes on screen. If the player hits it in time, they get a partial insight into the Ai's truthfulness — a limited zero-knowledge reveal that shifts the confidence meter without fully exposing the hand.

If they miss it? The Ai gets the advantage instead.

This creates surprise pressure spikes that keep every round feeling alive.

### Party Mode (The Shot Glass Mechanic)

An optional **party mode** introduces a fast-reaction element:

- A shot glass (or drink icon) appears on screen
- If you **click it fast enough**, the Ai "drinks" — and its ability to bluff convincingly degrades for the next round
- If you **miss it**, *you* drink — and a minor piece of your strategic state gets revealed

This works beautifully with or without actual alcohol. It can be framed as:
- A drinking game for parties
- A reaction-speed challenge for solo play
- A "consequence roulette" in competitive mode

The key: **every consequence is still governed by Midnight's selective disclosure model**. Even the silly mechanics are provably fair.

---

## Truth or Dare Mode (Future Expansion)

A companion mode where the Ai asks the player personal, playful, or strategic questions:

- **Truth:** The player answers, and Midnight can selectively prove or withhold aspects of the "truth state" — creating interesting ZK interactions around honesty, partial disclosure, and trust
- **Dare:** The Ai challenges the player to do something in-game (or in real life), with proof-of-completion mechanics

This opens a broader **social-emotional game universe** around the core product. It pushes the companionship angle further and gives the brand room to expand beyond competitive bluffing into intimacy, humor, courage, and agentic interaction.

---

## Why This Game and Not Pong or Tetris?

We evaluated a dozen candidates. Here's the honest ranking:

| Game | Privacy Fit | Entertainment | Explainability | Verdict |
|------|------------|---------------|----------------|---------|
| **Proof or Bluff** | Natural — the whole game IS hidden state + public claims | High — social, tense, replayable | Instant — everyone gets bluffing | **Best overall** |
| **Battleship** | Excellent — private board, honest hit/miss | Good — classic, clean | Very high — famous game | Best clean technical demo |
| **Liar's Dice** | Excellent — private dice, public bids | High — elegant and compact | High — simple rules | Best minimal bluff game |
| **Mafia / Werewolf** | Amazing — secret roles, public accusations | Very high — dramatic | Medium — needs more players | More complex to build |
| **Poker variants** | Strong — hidden hands, betting | Very high | High — but crowded territory | Strong but competitive market |
| **Pong** | Weak — privacy is bolted on | Fun but shallow | High | Arcade novelty only |
| **Tetris** | Weak — no natural hidden state | Addictive | High | Privacy feels forced |

**The insight:** Selective privacy shines when some information *should* be hidden but the fairness of the game still has to be provable. Proof or Bluff doesn't need privacy bolted on — **privacy IS the game**.

---

## The Stack

| Layer | Role |
|-------|------|
| **Anthropic-style Ai** | Conversation, persona behavior, adaptive taunts, emotional texture, replay variety |
| **Midnight Network** | Private state, challenge logic, selective disclosure, provable fairness via ZK proofs |
| **Frontend** | Expressive face UI, timers, trust meter, reveal moments, atmosphere and polish |
| **Audio / UX** | Short voiced reactions, ambient feedback, dramatic challenge effects, emotional pacing |

### Why Anthropic + Midnight?

- **Anthropic** (or similar LLM layer) gives the Ai opponent genuine conversational personality — not canned responses, but adaptive, context-aware banter that makes each session feel different
- **Midnight** gives the game provable integrity — private hands stay private, challenges are resolved with mathematical certainty, and selective disclosure happens at exactly the right dramatic moment

Together, they create something neither can do alone: **a game that feels both emotionally alive and cryptographically trustworthy**.

---

## Project Structure

```
proofOrBluff/
├── README.md
├── docs/                                  ← All documentation
│   ├── RULES.md                           # Game rules
│   ├── GAMEPLAY_RESEARCH.md               # Gameplay design analysis & ranked options
│   ├── DEMOLAND_VS_REALDEAL.md            # Architecture (single source of truth)
│   ├── demoLandREADME.md                  # demoLand quick reference
│   ├── realDealREADME.md                  # realDeal quick reference
│   ├── BUSINESS_PLAN.md                   # Monetization, VC, R&D
│   ├── VC_GAMING_INDUSTRY_ANALYSIS.md     # Gaming market deep dive
│   ├── ROADMAP.md                         # Phase-by-phase plan
│   ├── FUTURE_FUNCTIONALITY.md            # Vision, asset mgmt, Ai evolution
│   └── MIDNIGHT_VITALS.md                 # Diagnostics & troubleshooting
├── demoLand/                              ← No-blockchain playable version
│   └── src/
│       ├── game/                          # Engine, deck, rules, Ai
│       └── providers/                     # demoLand providers
├── realDeal/                              ← Midnight-connected version
│   └── contracts/
│       └── proof-or-bluff.compact         # Compact contract (stub)
└── media/                                 # Banners, QR codes, assets
```

---

## Strategic Value

| Audience | Why they care |
|----------|--------------|
| **Players** | Funny, tense, social-feeling interaction that reduces boredom and loneliness |
| **Builders** | A crisp example of how Ai personality and privacy-preserving logic work together |
| **Midnight ecosystem** | A memorable demo that makes selective privacy easy to pitch to non-engineers |
| **Partners / investors** | A product concept with both emotional stickiness and protocol differentiation |

---

## The Brand

**Name:** Proof or Bluff (POB)

**Tagline:** Bluff in public. Prove in private.

**Alternative taglines:**
- *Private hands. Public claims. Provable truth.*
- *Where selective privacy meets social deception.*
- *Truth, lies, and zero-knowledge.*
- *The game of hidden hands and provable claims.*

**Winner and why:** *Proof or Bluff* — because it fuses the cryptographic concept (proof) with the game mechanic (bluff) into something that sounds like a real product, not a hackathon placeholder.

---

## Roadmap

See the **[full Product Roadmap](docs/ROADMAP.md)** for detailed phase-by-phase deliverables, timelines, and success criteria.

**Current phase**: Phase 1 — First Playable (demoLand Iteration 1)

---

## On the Casino Question

Could this be a casino game? Yes, technically. But it's **stronger as a player-vs-AI companion game or a peer-to-peer wager game** than a traditional house-banked casino game.

**Why:**
- The magic of bluffing comes from *reading another mind* — against a house, that psychology fades
- House edge is harder to make feel fair in a deception game (players may feel manipulated)
- Regulatory framing is simpler as a "competitive skill game with optional wagers" than as a "casino product"
- The loneliness-relief angle works best when the AI feels like a companion, not a dealer

**Best framing:** A privacy-native competitive table game with optional stakes — not a slot machine, not a house game, but a *social experience* where money can be part of the fun without being the point.

---

## Part of the DIDzMonolith Ecosystem

Proof or Bluff lives within the [DIDzMonolith](https://github.com/bytewizard42i/DIDzMonolith) umbrella — a constellation of privacy-preserving products built on the Midnight Network.

**Potential DIDzMonolith synergies:**
- **DIDz** — Player identity and reputation across games
- **KYCz** — Age/jurisdiction verification for wager modes without exposing personal data
- **ProMingle** — Social discovery layer for finding opponents
- **SelectConnect** — Private contact sharing for tournament organizers
- **SentinelDID** — Emergency identity verification for high-stakes play

---

## Author

**John Santi**
- Midnight NightForce Bravo
- Cardano Certified Blockchain Associate
- Emurgo Certified Blockchain Business Consultant
- Midnight Academy Triple Certified
- Midnight Ambassador

---

## License

All Rights Reserved. This is a private concept under active development.

---

*Concept developed collaboratively with Alice (ChatGPT) and Penny (Windsurf Cascade). Original brainstorm: March 31, 2026. Game design formalized: April 3, 2026. Port: 3015.*
