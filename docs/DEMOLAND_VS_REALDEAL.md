<p align="center">
  <strong>🏗️ PROOF OR BLUFF — demoLand / realDeal Architecture 🏗️</strong><br/>
  <em>The Complete Technical Architecture for Both Sides of the Game</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/demoLand-No_Blockchain-blue" alt="demoLand"/>
  <img src="https://img.shields.io/badge/realDeal-Midnight_ZK-black" alt="realDeal"/>
  <img src="https://img.shields.io/badge/Pattern-DIDzMonolith_Standard-green" alt="Pattern"/>
  <img src="https://img.shields.io/badge/Port-3015-orange" alt="Port"/>
</p>

---

> *"Same game. Same Ai. Same rules. Different backend. One uses localStorage, the other uses zero-knowledge proofs."*

---

# Table of Contents

- [Overview](#overview)
- [Side-by-Side Comparison](#side-by-side-comparison)
- [demoLand — The Demo Game](#demoland--the-demo-game)
- [realDeal — The Midnight Game](#realdeal--the-midnight-game)
- [Shared Components](#shared-components)
- [Directory Structure](#directory-structure)
- [Running the Game](#running-the-game)
- [Environment Configuration](#environment-configuration)

---

# Overview

Proof or Bluff follows the **demoLand / realDeal** separation pattern used across all DIDzMonolith products:

| | demoLand | realDeal |
|---|----------|---------|
| **What** | Fully playable game, no blockchain | The real thing — Midnight-powered |
| **State** | localStorage / client JS | Midnight private state (shielded) |
| **Privacy** | UI-hidden (client knows all cards) | Cryptographically private (ZK proofs) |
| **Wallet** | None needed | Lace Midnight wallet |
| **Money** | Play money / points | Real DUST or tokens |
| **Purpose** | Demos, development, play-testing | Production, competitive, wagered play |

Both sides share the **same rules, UI, and Ai**. A player toggling between modes sees the same game — only the trust model changes.

---

# Side-by-Side Comparison

```
┌──────────────────────────────────┬──────────────────────────────────┐
│          d e m o L a n d          │          r e a l D e a l          │
├──────────────────────────────────┼──────────────────────────────────┤
│                                  │                                  │
│  📦 State: localStorage          │  🔒 State: Midnight private      │
│  🃏 Shuffle: Math.random()       │  🎲 Shuffle: committed seed      │
│  📝 Claims: text in game log     │  ⛓️  Claims: on-chain public     │
│  👀 Challenge: direct reveal     │  🔐 Challenge: ZK proof (Y/N)    │
│  🙈 Privacy: UI hides cards      │  🛡️  Privacy: cryptographic      │
│  ✅ Win check: client-side       │  📜 Win check: ZK proof          │
│  💳 Wallet: none                 │  👛 Wallet: Lace                 │
│  🎮 Wagers: play money           │  💰 Wagers: real DUST/tokens     │
│  🤝 Fairness: trust the client   │  ⚖️  Fairness: Midnight proves   │
│                                  │                                  │
│  No Docker needed                │  Proof server (Docker) required  │
│  No internet needed              │  RPC + Indexer required           │
│  Works offline                   │  Mainnet connection required      │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

---

# demoLand — The Demo Game

**No blockchain. No wallet. No real money. Just the game.**

demoLand is where the game gets built, tested, and polished before connecting to Midnight. It runs entirely in the browser.

## Three Iterations

### Iteration 1 — Text + Cards

The simplest playable version. Proves the game loop works.

| Aspect | Detail |
|--------|--------|
| **UI** | Text-based game log + CSS/SVG playing card graphics |
| **Ai** | Pre-created prompts and scripted dialogue trees |
| **Visuals** | Card faces + text bubbles only — no images or video |
| **Logic** | All client-side JS, localStorage for state |
| **Ai behavior** | Deterministic / lightly randomized — bluffs at fixed rates |
| **Challenge** | Instant local reveal (no ZK) |
| **Status** | 🔲 In development |

### Iteration 2 — Text + Cards + Media

Visual personality layer. Tests emotional stickiness.

| Aspect | Detail |
|--------|--------|
| **UI** | Card game + Ai character portraits + short video clips |
| **Ai** | Scripted dialogue + static expression images + looping video clips |
| **Visuals** | Dealer shuffle intro video, character select picture menu, expression variants |
| **Themes** | Visual table/environment themes (default first; monsters, squid, etc. later) |
| **Logic** | Same engine as Iteration 1, richer presentation |
| **Status** | 🔲 Planned |

### Iteration 3 — Ai Agent

The full experience. Ai talks, reads patterns, bluffs convincingly.

| Aspect | Detail |
|--------|--------|
| **UI** | Full visual experience from Iteration 2 |
| **Ai** | Live LLM agent (Anthropic Claude or similar) — real banter, adaptive play |
| **Capabilities** | Contextual media selection, pattern adaptation, personality-driven strategy |
| **Personas** | Charming Liar, Nervous Genius, Cold Professional, Chaos Goblin |
| **Difficulty** | Easy / Medium / Hard (see [RULES.md](RULES.md)) |
| **Status** | 🔲 Planned |

## What demoLand Does NOT Have

- ❌ No Midnight connection
- ❌ No wallet integration
- ❌ No ZK proofs — challenge resolution is direct reveal
- ❌ No real money or tokens
- ❌ No on-chain state
- ❌ Both hands are known to the client (privacy is simulated via UI)

All of the above is added in realDeal.

---

# realDeal — The Midnight Game

**Midnight private state. ZK proofs. Lace wallet. Provable fairness.**

realDeal turns the proven game loop into a genuine showcase of selective privacy on the Midnight Network. The player's hand is cryptographically private — even the client only knows its own cards.

## Compact Contract — `proof-or-bluff.compact`

### Public Ledger State

| Field | Type | Purpose |
|-------|------|---------|
| `game_id` | `Uint<64>` | Unique game identifier |
| `current_rank` | `Uint<8>` | Required rank for this turn (2–Ace cycling) |
| `turn` | `Uint<8>` | Whose turn (player or Ai) |
| `pile_size` | `Uint<32>` | Cards in the central pile |
| `game_status` | `enum` | Setup / InProgress / Challenged / GameOver |
| `winner` | `Uint<8>` | Who won (when game ends) |

### Private State (Shielded)

| Field | Purpose |
|-------|---------|
| `player_hand` | Human player's cards (only they can see) |
| `ai_hand` | Ai's cards (only Ai/contract can see) |
| `pile_cards` | Actual cards in the central pile (hidden from both) |
| `deck_commitment` | Hash commitment to shuffled deck (proves fair deal) |
| `last_play` | Actual cards placed face-down this turn |

### Circuits (ZK-Provable Operations)

| Circuit | Purpose |
|---------|---------|
| `init_game` | Shuffle, commit deck, deal cards, set initial rank |
| `play_cards` | Place cards face-down, register public claim |
| `challenge` | Verify last claim matches last play → true/false only |
| `accept_claim` | Opponent accepts — pile grows, turn advances |
| `check_win` | Prove hand is empty → game over |
| `verify_card_count` | Prove both players have correct card counts |

### Witness Functions (Private Inputs)

| Function | Purpose |
|----------|---------|
| `provide_shuffle_seed` | Random seed for deck shuffle (private) |
| `provide_play_selection` | Which cards from hand to play (private) |
| `provide_hand_for_win_check` | Prove hand is empty without revealing intermediate states |

## TypeScript SDK Layer

| Responsibility | Detail |
|----------------|--------|
| **Wallet connection** | Lace wallet integration + transaction signing |
| **Provider pattern** | Same `IGameProvider` interface, Midnight backend |
| **Proof server** | HTTP client to local Docker proof server (port 6300) |
| **Indexer** | GraphQL client for reading public game state |
| **Transaction builder** | Construct and submit game moves as Midnight transactions |
| **Private state** | Player's hand in local LevelDB via `@midnight-ntwrk/midnight-js-level-private-state-provider` |

## Midnight Dependencies

```json
{
  "@midnight-ntwrk/compact-runtime": "latest",
  "@midnight-ntwrk/midnight-js-contracts": "latest",
  "@midnight-ntwrk/midnight-js-http-client-proof-provider": "latest",
  "@midnight-ntwrk/midnight-js-indexer-public-data-provider": "latest",
  "@midnight-ntwrk/midnight-js-level-private-state-provider": "latest",
  "@midnight-ntwrk/midnight-js-network-id": "latest"
}
```

## Status

🔲 **Contract design phase** — not yet compiled or deployed. The demoLand game loop must be working first. realDeal connects the same game to Midnight.

---

# Shared Components

These are **identical** between demoLand and realDeal — write once, use in both:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED ACROSS BOTH MODES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📜 Game rules engine ─────── RULES.md + rules.js               │
│  🃏 UI components ──────────── Cards, Hand, Pile, ClaimPanel     │
│  🎭 Ai persona assets ───── Images, videos, dialogue libs     │
│  🤖 Ai agent (Iter. 3) ──── Same LLM regardless of backend    │
│  🔊 Audio ──────────────────── Sound effects, ambient, jingles   │
│  🔍 Lie Detector ──────────── Frontend mechanic (surprise ZK)    │
│  🥃 Party Mode ─────────────── Shot glass reaction mechanic      │
│  📊 Trust Meter ────────────── Confidence/trust progression UI   │
│  🏆 Score tracking ─────────── Win/loss, stats, achievements     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The **provider pattern** (`IGameProvider`, `IAiProvider`) abstracts the backend. The UI calls the same interface regardless of mode — the factory in `providers/index.js` returns the correct implementation based on `NEXT_PUBLIC_POB_MODE`.

---

# Directory Structure

```
proofOrBluff/
├── README.md
├── docs/                              ← All documentation lives here
│   ├── RULES.md                       # Full game rules
│   ├── GAMEPLAY_RESEARCH.md           # Gameplay design analysis & ranked options
│   ├── DEMOLAND_VS_REALDEAL.md        # This file — architecture
│   ├── demoLandREADME.md              # demoLand quick reference
│   ├── realDealREADME.md              # realDeal quick reference
│   ├── BUSINESS_PLAN.md               # Monetization, VC, R&D
│   ├── VC_GAMING_INDUSTRY_ANALYSIS.md # Market deep dive
│   ├── ROADMAP.md                     # Phase-by-phase plan
│   ├── FUTURE_FUNCTIONALITY.md        # Vision, asset mgmt, Ai evolution
│   └── MIDNIGHT_VITALS.md             # Diagnostics & troubleshooting
│
├── demoLand/                          ← No-blockchain playable version
│   └── src/
│       ├── game/
│       │   ├── engine.js              # Core game loop
│       │   ├── deck.js                # Deck creation + shuffle
│       │   ├── rules.js               # Rule enforcement
│       │   └── ai/
│       │       ├── scripted.js        # Iterations 1–2: scripted AI
│       │       ├── agent.js           # Iteration 3: live AI agent (stub)
│       │       └── difficulty.js      # Easy / Medium / Hard profiles
│       └── providers/
│           ├── types.js               # Shared interfaces
│           ├── index.js               # Provider factory
│           └── demoland/
│               ├── gameProvider.js     # localStorage game state
│               └── aiProvider.js       # Scripted AI wrapper
│
├── realDeal/                          ← Midnight-connected version
│   ├── contracts/
│   │   └── proof-or-bluff.compact     # Compact smart contract (stub)
│   ├── src/
│   │   ├── providers/realdeal/        # Midnight-backed providers (planned)
│   │   ├── sdk/                       # Contract API, proof client, indexer (planned)
│   │   └── utils/                     # Network config, wallet utils (planned)
│   ├── tests/                         # Contract + integration tests (planned)
│   └── managed/                       # Compiled contract artifacts (planned)
│
└── media/                             # Banners, QR codes, assets
```

---

# Running the Game

## demoLand (No Prerequisites)

```bash
npm install
npm run dev:demo
# → http://localhost:3015
```

No Docker, no wallet, no internet required. Just the game.

## realDeal (Full Midnight Stack)

```bash
# 1. Start proof server
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v

# 2. Ensure Lace wallet is installed, unlocked, and set to Midnight

# 3. Compile contract (first time only)
cd realDeal/contracts
compactc proof-or-bluff.compact

# 4. Start the app
npm run dev:real
# → http://localhost:3015
```

See [MIDNIGHT_VITALS.md](MIDNIGHT_VITALS.md) for the full startup checklist and troubleshooting.

---

# Environment Configuration

## `.env.demoland`

```env
NEXT_PUBLIC_POB_MODE=demoland

# Ai Agent (Iteration 3 only — not needed for Iterations 1–2)
POB_AI_API_KEY=
POB_AI_MODEL=claude-sonnet-4-20250514
```

## `.env.realdeal`

```env
NEXT_PUBLIC_POB_MODE=realdeal

# Midnight Network
NEXT_PUBLIC_MIDNIGHT_RPC=wss://rpc.midnight.network
NEXT_PUBLIC_MIDNIGHT_INDEXER=wss://indexer.midnight.network/api/v3/graphql
NEXT_PUBLIC_PROOF_SERVER=http://localhost:6300

# Ai Agent (Iteration 3)
POB_AI_API_KEY=sk-ant-...
POB_AI_MODEL=claude-sonnet-4-20250514

# Contract (set after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

## NPM Scripts

```json
{
  "dev:demo":   "NEXT_PUBLIC_POB_MODE=demoland next dev -p 3015",
  "dev:real":   "NEXT_PUBLIC_POB_MODE=realdeal next dev -p 3015",
  "build:demo": "NEXT_PUBLIC_POB_MODE=demoland next build",
  "build:real": "NEXT_PUBLIC_POB_MODE=realdeal next build",
  "vitals":     "node scripts/vitals-check.js"
}
```

**Port**: `3015`

---

<p align="center">
  <strong>Same game. Same fun. Different trust model.</strong><br/>
  <em>demoLand proves the game works. realDeal proves it's fair.</em>
</p>

---

**Author**: John Santi (bytewizard42i) + Penny 🎀  
**Last Updated**: April 4, 2026
