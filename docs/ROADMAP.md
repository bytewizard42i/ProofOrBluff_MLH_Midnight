<p align="center">
  <strong>🗺️ PROOF OR BLUFF — PRODUCT ROADMAP 🗺️</strong><br/>
  <em>From First Playable to Privacy Gaming Platform</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Phase_1-In_Progress-yellow" alt="Phase 1"/>
  <img src="https://img.shields.io/badge/Phase_2-Planned-lightgrey" alt="Phase 2"/>
  <img src="https://img.shields.io/badge/Phase_3-Planned-lightgrey" alt="Phase 3"/>
  <img src="https://img.shields.io/badge/Phase_4-Future-lightgrey" alt="Phase 4"/>
</p>

---

> *"Ship the game loop first. Make it fun. Then make it private. Then make it a platform."*

> **Related docs**: [Future Functionality](FUTURE_FUNCTIONALITY.md) for detailed feature vision · [Gameplay Design Analysis](GAMEPLAY_RESEARCH.md) for hand-size and game-structure research · [Business Plan](BUSINESS_PLAN.md) for revenue and scaling

---

# Roadmap Overview

```
  Q2 2026          Q3 2026          Q4 2026          Q1 2027         Q2 2027         Q3+ 2027
  ──────────────── ──────────────── ──────────────── ─────────────── ─────────────── ───────────
  PHASE 1          PHASE 2          PHASE 3          PHASE 4         PHASE 5         PHASE 6+
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐    ┌──────────┐    ┌──────────┐
  │ demoLand │     │ demoLand │     │ demoLand │     │ realDeal │    │ Casino   │    │ Platform │
  │ Iter. 1  │────▶│ Iter. 2  │────▶│ Iter. 3  │────▶│ Midnight │───▶│ + PvP    │───▶│ + Multi  │
  │ Text+Card│     │ +Media   │     │ +Ai Agent│     │ ZK Proofs│    │ Wagers   │    │ Game     │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘    └──────────┘    └──────────┘
      ▲
      │
  YOU ARE HERE
```

---

# Phase 1 — First Playable (demoLand Iteration 1)

**Timeline**: Q2 2026 (April – June)
**Goal**: A working card game you can play in the browser. Prove the rules work. Validate the fun.

### Deliverables

| # | Deliverable | Status | Notes |
|---|-----------|--------|-------|
| 1.1 | ✅ Game rules documented (RULES.md) | **Done** | Home Mode + Casino Mode, full rule set |
| 1.2 | ✅ Core game engine (engine.js, deck.js, rules.js) | **Done** | Init, play, accept, challenge, win check |
| 1.3 | ✅ Scripted Ai opponent (scripted.js) | **Done** | Dialogue trees, decision heuristics, difficulty profiles |
| 1.4 | ✅ Provider pattern (demoLand/realDeal) | **Done** | Factory, interfaces, demoLand providers |
| 1.5 | ✅ Project architecture (all docs) | **Done** | README, architecture, rules, business plan, roadmap |
| 1.6 | 🔲 Playing card UI components | **Pending** | SVG/CSS card faces, hand layout, pile display |
| 1.7 | 🔲 Game screen layout | **Pending** | Player hand, Ai area, pile, claim panel, game log |
| 1.8 | 🔲 Claim/challenge interaction UI | **Pending** | Rank selector, card picker, "Proof or Bluff!" button |
| 1.9 | 🔲 Main menu screen | **Pending** | Mode select (Home/Casino), difficulty, start game |
| 1.10 | 🔲 Game log / event feed | **Pending** | Real-time text log of all game events |
| 1.11 | 🔲 Win/lose screen | **Pending** | Results, stats, rematch option |
| 1.12 | 🔲 Basic test suite | **Pending** | Deck, rules, engine unit tests |
| 1.13 | 🔲 Deployment (web) | **Pending** | Netlify or similar, playable URL |

### Success Criteria
- [ ] A non-technical person can open the URL and play a full game
- [ ] Both Home Mode and Casino Mode work correctly
- [ ] Ai opponent makes reasonable decisions at all 3 difficulty levels
- [ ] No game-breaking bugs in the rule engine
- [ ] Game is genuinely fun to play for at least 15 minutes

---

# Phase 2 — Visual Polish (demoLand Iteration 2)

**Timeline**: Q3 2026 (July – September)
**Goal**: Add visual personality. Ai characters have faces, expressions, and video moments.

### Deliverables

| # | Deliverable | Notes |
|---|-----------|-------|
| 2.1 | 🔲 Ai dealer shuffle intro video | Covers proof server startup time (in realDeal) |
| 2.2 | 🔲 Character selection screen | Picture menu — gender, personality, preview |
| 2.3 | 🔲 Ai character portraits (4 personas × 2 genders) | Static images + expression variants |
| 2.4 | 🔲 Ai expression system | Confident, nervous, bluffing, caught, celebrating, sulking |
| 2.5 | 🔲 Short video clips for key moments | Challenge, win, lose, taunt, caught bluffing |
| 2.6 | 🔲 Tutorial walkthrough | Guided first-game experience with skip option |
| 2.7 | 🔲 Sound effects and ambient audio | Card sounds, challenge drama, win/lose jingles |
| 2.8 | 🔲 Lie Detector button mechanic | Random flash, timed click, partial reveal |
| 2.9 | 🔲 Party Mode (shot glass mechanic) | Reaction challenge between rounds |
| 2.10 | 🔲 Trust Meter UI | Visual confidence/trust progression |
| 2.11 | 🔲 Responsive mobile layout | Playable on phone browsers |
| 2.12 | 🔲 Analytics integration | Play session tracking, funnel analysis |

### Success Criteria
- [ ] Game feels like a polished product, not a prototype
- [ ] Ai character reactions add genuine entertainment value
- [ ] Players choose to play multiple sessions (retention signal)
- [ ] Tutorial successfully onboards first-time players
- [ ] Mobile experience is comfortable and intuitive

---

# Phase 3 — Ai Agent (demoLand Iteration 3)

**Timeline**: Q4 2026 (October – December)
**Goal**: Replace scripted Ai with a live Ai agent. Real banter, adaptive strategy, contextual media.

### Deliverables

| # | Deliverable | Notes |
|---|-----------|-------|
| 3.1 | 🔲 LLM integration (Anthropic Claude or similar) | agent.js wired up, BYOK model |
| 3.2 | 🔲 Personality system prompts (4 personas) | Charming Liar, Nervous Genius, Cold Professional, Chaos Goblin |
| 3.3 | 🔲 Contextual media selection | Ai chooses expressions/videos based on game state |
| 3.4 | 🔲 Adaptive gameplay | Ai learns player patterns mid-session |
| 3.5 | 🔲 Three difficulty levels (Ai-powered) | Easy (loose), Medium (strategic), Hard (expert) |
| 3.6 | 🔲 Real-time banter generation | Context-aware dialogue, not templates |
| 3.7 | 🔲 Ad integration (rewarded video, interstitial) | Non-intrusive placements, crypto ad partners |
| 3.8 | 🔲 Premium ad-free purchase option | IAP or payment gateway |
| 3.9 | 🔲 User accounts and progression | Win/loss stats, achievement tracking |
| 3.10 | 🔲 Season pass system (v1) | Seasonal content, cosmetic rewards |

### Success Criteria
- [ ] Ai opponent feels genuinely alive and different each session
- [ ] Players report emotional engagement (laughing, frustration, surprise)
- [ ] 3 difficulty levels are perceptibly different
- [ ] Ad revenue exceeds Ai inference costs
- [ ] Day-7 retention > 20%

---

# Phase 4 — Midnight Integration (realDeal)

**Timeline**: Q1 2027 (January – March)
**Goal**: Connect the proven game loop to Midnight. ZK proofs for challenge resolution. True hand privacy.

### Deliverables

| # | Deliverable | Notes |
|---|-----------|-------|
| 4.1 | 🔲 Compact contract — proof-or-bluff.compact | Full implementation, compiled, tested |
| 4.2 | 🔲 realDeal game provider | Midnight-backed state, replaces localStorage |
| 4.3 | 🔲 Lace wallet integration | Connect wallet, sign transactions |
| 4.4 | 🔲 ZK challenge resolution | "Was the claim true?" — proved by math, not reveal |
| 4.5 | 🔲 Proof server startup flow | Dealer video plays while proof server initializes |
| 4.6 | 🔲 Private state management (LevelDB) | Player hand in local encrypted store |
| 4.7 | 🔲 Indexer integration | Read public game state from Midnight indexer |
| 4.8 | 🔲 Midnight Vitals integration | Health check, diagnostics, troubleshooting |
| 4.9 | 🔲 DemoLand ↔ realDeal toggle | Same game, switch backend via env var |
| 4.10 | 🔲 Contract deployment (mainnet) | Live on Midnight mainnet |

### Success Criteria
- [ ] Challenge resolution takes < 10 seconds (proof generation + verification)
- [ ] Player hand is cryptographically private (not just UI-hidden)
- [ ] Game is provably fair — anyone can verify via on-chain state
- [ ] Wallet connection flow is smooth and intuitive
- [ ] demoLand and realDeal are indistinguishable to the player (same UX)

---

# Phase 5 — Casino Mode & PvP

**Timeline**: Q2 2027 (April – June)
**Goal**: Real-money wagering and human vs human play.

### Deliverables

| # | Deliverable | Notes |
|---|-----------|-------|
| 5.1 | 🔲 Casino Mode wager escrow (Compact contract) | Deposit, hold, pay winner |
| 5.2 | 🔲 Shielded wager transactions | Bet amounts invisible to observers |
| 5.3 | 🔲 PvP matchmaking | Find opponents, lobby system |
| 5.4 | 🔲 PvP game flow | Both players are human, Midnight manages fairness |
| 5.5 | 🔲 Tournament system (v1) | Bracket tournaments, entry fees, prize pools |
| 5.6 | 🔲 Legal/compliance review | Jurisdiction analysis, viewing keys for regulators |
| 5.7 | 🔲 KYCz integration | Age/jurisdiction verification for wager mode |
| 5.8 | 🔲 Anti-collusion measures | Prevent cheating in PvP/tournaments |

---

# Phase 6 — Asset Management & Platform

**Timeline**: Q3 2027+
**Goal**: Launch the privacy-preserving game asset management platform as a standalone product.

### Deliverables

| # | Deliverable | Notes |
|---|-----------|-------|
| 6.1 | 🔲 POB asset system (cards, skins, themes, personas) | Mint, own, trade game assets |
| 6.2 | 🔲 Private marketplace | Trade assets without exposing inventory |
| 6.3 | 🔲 Achievement/badge system (ZK-verified) | Prove rank without revealing identity |
| 6.4 | 🔲 Generalized asset management SDK | Any game can integrate |
| 6.5 | 🔲 B2B platform with API | SaaS offering for game studios |
| 6.6 | 🔲 Multi-game asset interoperability | Assets work across POB + future games |

---

# Phase 7+ — Expansion

**Timeline**: 2028+

| Feature | Description |
|---------|-------------|
| **Truth or Dare Mode** | Social-emotional expansion beyond card play |
| **Voice-enabled Ai** | Ai opponent speaks with synthesized voice |
| **Theme packs** | Monsters, underwater, space, seasonal themes |
| **Mobile native apps** | iOS + Android native (not just responsive web) |
| **Esports league** | Official POB competitive circuit |
| **Multi-game platform** | Additional privacy-native games using POB engine |
| **DIDz player identity** | Persistent cross-game identity and reputation |
| **International expansion** | Localization, regional Ai personas |

---

# Milestone Tracking

| Milestone | Target Date | Status |
|-----------|-----------|--------|
| Game rules finalized | April 3, 2026 | ✅ **Complete** |
| Game engine skeleton | April 3, 2026 | ✅ **Complete** |
| Scripted Ai system | April 3, 2026 | ✅ **Complete** |
| Architecture docs | April 4, 2026 | ✅ **Complete** |
| Business plan | April 4, 2026 | ✅ **Complete** |
| First playable (browser) | June 2026 | 🔲 In progress |
| Visual polish + media | September 2026 | 🔲 Planned |
| Ai agent integration | December 2026 | 🔲 Planned |
| Midnight mainnet deployment | March 2027 | 🔲 Planned |
| Casino Mode + PvP | June 2027 | 🔲 Planned |
| Asset management platform | September 2027 | 🔲 Planned |

---

<p align="center">
  <strong>The journey from prototype to platform.</strong><br/>
  <em>Every phase builds on the last. Every phase generates revenue. Every phase deepens the moat.</em>
</p>

---

**Author**: John Santi (bytewizard42i) + Penny 🎀  
**Last Updated**: April 4, 2026
