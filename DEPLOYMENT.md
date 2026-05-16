# ProofOrBluff — Deployment Guide

**Product role**: Privacy-preserving poker-style game where players bluff on hand rankings and challenge each other via ZK proofs. Revenue product — wager escrow + per-match fees.
**Current status**: `realDeal/contracts/` shipped (`a5e33a3`) with `proof-or-bluff.compact` + `player-stats.compact`. DApp not yet scaffolded.
**Validated against**: `compactc v0.30.0`, pragma `>= 0.16 && <= 0.21`.
**Reference architecture**: `bricktowers/midnight-seabattle` + `midnightntwrk/example-battleship`.

See the master roadmap at `PixyPi/DEPLOYMENT_ROADMAP.md` for ecosystem-wide patterns. This file covers ProofOrBluff specifics only.

---

## What Makes This Deployment Different

Unlike DIDz.io or the pet/equine portals, ProofOrBluff is **latency-sensitive** — players watching a live match need sub-second UI updates when cards are played. This changes two things:

1. **WebSocket relay** — we need a lightweight matchmaking + game-state broadcast server (Vercel Edge Functions + Cloudflare Durable Objects OR a small Node service on the VPS)
2. **Spectator mode** — reading public state streams from the indexer and pushing to subscribed clients

Everything else (proof server, wallet integration, config pattern) matches the rest of the monolith.

---

## What Gets Deployed

```
┌─────────────────────────────────────────────────────────────────┐
│ Vercel (free)                                                   │
│  ─ proofofbluff.app — table lobby, in-game UI, replay viewer    │
└───────────────┬───────────────┬─────────────────────────────────┘
                │ HTTPS         │ WebSocket
                ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│ VPS / Railway — est. $10-20/mo                                  │
│  ─ proof-server   :6300  (Docker, pre-baked ZK params)         │
│  ─ match-relay    :8080  (WebSocket: lobby, turn broadcast)    │
│  ─ stats-indexer  :8088  (watches player-stats contract events) │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Midnight testnet/mainnet (public)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Repo Layout (planned)

```
ProofOrBluff_MLH_Midnight/
├── realDeal/                       # ✅ Existing contracts subdirectory
│   └── contracts/
│       ├── proof-or-bluff.compact
│       └── player-stats.compact
├── pob-contract/                   # TS bindings + Vitest simulators
├── pob-api/                        # RxJS contract SDK (create/join/play/challenge)
├── pob-ui/                         # React + MUI + Vite (poker table UI)
│   ├── public/
│   │   ├── config.json             # Runtime config
│   │   └── assets/                 # Card images, chip sprites
│   └── src/
│       ├── components/
│       │   ├── Lobby.tsx           # List open matches, create new
│       │   ├── Table.tsx           # Poker table with card animations
│       │   ├── ChallengePanel.tsx  # Reveal + challenge UI
│       │   └── StatsProfile.tsx    # Rank, achievements, season record
│       └── utils/
├── match-relay/                    # Node WebSocket server for turn-order + spectate
│   └── src/
│       └── server.ts
├── stats-indexer/                  # Watches player-stats events → pushes to UI
│   └── src/
└── pob-cli/                        # Admin CLI (advance season, operator key rotate)
```

---

## Gameplay Flow (contract → UI mapping)

| Phase | Contract call | UI component | Proof? |
|-------|---------------|--------------|--------|
| 1. Create match | `createMatch(mode, wager, p1EntropyCommit, now, coin)` | `Lobby → CreateMatchModal` | No |
| 2. Join | `joinMatch(matchId, p2EntropyCommit, coin)` | `Lobby → Join Button` | No |
| 3. Reveal seed | `revealSeed(matchId, p1Seed, p2Seed, startingRank, now)` | `Table → auto` | No |
| 4. Play cards | `playCards(matchId, cardCommit, rank, count, now)` | `Table → DealCards animation` | No |
| 5. Challenge | `challengeClaim(matchId, now)` | `ChallengePanel → Challenge` | No |
| 6. Resolve | `resolveChallenge(matchId, now)` + private witness | `ChallengePanel → auto-submit` | **Yes (~5-10s)** |
| 7. Forfeit | `forfeitStalledChallenge(matchId, now, timeout)` / `forfeitAbandonedMatch(matchId, now, timeout)` | `Table → forfeit timer` | No |
| 8. Payout | `claimPayout(matchId)` | `Table → Claim Winnings` | No |

The ZK proof in step 6 is where proof server load concentrates. Provision accordingly (2-4 vCPU recommended for multi-match concurrency).

**realDeal wager privacy note**: `wagerAmount` is public on-chain match metadata. The native Zswap escrow path must compare each shielded coin value against the required wager, so wager size is intentionally auditable even though the pot is held and paid out through shielded Zswap coins.

---

## Pinned SDK Versions

Same as DIDz.io (see DIDz-io DEPLOYMENT.md for the list). Use the newer `midnight-js 3.1.0` / `ledger-v7 7.0.0` stack from `example-zkloan`, NOT the older Brick Towers pins.

---

## Local Development

```bash
git clone git@github.com:bytewizard42i/ProofOrBluff_MLH_Midnight.git
cd ProofOrBluff_MLH_Midnight
corepack enable && yarn install
docker compose -f undeployed-compose.yml up -d

# Terminal 1 — game UI with hot reload
yarn workspace pob-ui dev           # http://localhost:5173

# Terminal 2 — match relay
yarn workspace match-relay dev      # ws://localhost:8080

# Terminal 3 — stats indexer
yarn workspace stats-indexer dev
```

**Testing gameplay**: the realDeal/ contract tests include a two-player simulator that walks the full 8-step flow. Run:
```bash
yarn workspace pob-contract test
```

---

## Environments

| Env | Network | Proof | Match relay | UI |
|-----|---------|-------|-------------|-----|
| `local` | Undeployed | `localhost:6300` | `localhost:8080` | `localhost:5173` |
| `testnet` | Midnight TestNet | `proof.pob.app` (VPS) | `relay.pob.app` (VPS) | `pob.vercel.app` |
| `mainnet` | Midnight MainNet | `proof.proofofbluff.app` | `relay.proofofbluff.app` | `proofofbluff.app` |

---

## Frontend Deploy (Vercel)

Standard Vite + Vercel flow. See the DIDz-io DEPLOYMENT.md for detailed steps — this is identical.

**PoB-specific env vars**:
```
VITE_NETWORK_ID=TestNet
VITE_RELAY_URL=wss://relay.pob.app
```

**Card image assets**: store in `pob-ui/public/assets/cards/` — served directly by Vercel's CDN at no extra cost.

---

## Backend Deploy (VPS — Railway recommended for this product)

Railway is especially good for ProofOrBluff because:
1. **WebSocket support** is native
2. **Volume-less services** — the match-relay is stateless (state lives on-chain)
3. **Easy horizontal scaling** when match concurrency grows

### Match relay service
```bash
# In ProofOrBluff_MLH_Midnight/match-relay/Dockerfile:
FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --immutable
COPY src ./src
EXPOSE 8080
CMD ["yarn", "start"]
```

Railway → New Service → Deploy from GitHub → root = `match-relay/`. Attach `relay.pob.app` CNAME.

### Stats indexer
Runs as a long-lived worker. Use Railway's cron-style services OR just a standard Node service that reconnects to the indexer stream on failure.

### Proof server
Use the pre-baked image `bricktowers/midnight-proof-server:prebaked`. ProofOrBluff's resolve-challenge circuit is medium complexity — a single Hostinger KVM VPS 1 handles ~5 concurrent challenges comfortably. Scale up (or add a load-balanced pool) if match volume exceeds that.

---

## Revenue / Treasury Deployment

The contracts include wager escrow circuits. Production deployment needs:

1. **Operator key**: a dedicated Midnight wallet that signs operator-only circuits (`advanceSeason`, `setRankTier`). Keep seed in a password manager or HashiCorp Vault — NOT in the repo.
2. **Treasury wallet**: collects per-match fees. Fund it with tDUST for gas, sweep winnings periodically.
3. **Fee parameters**: set before first match via an admin circuit. Fee % is in the contract comments.
4. **Anti-abuse**: rate-limit match creation in the match-relay (e.g., 10 matches per hour per wallet) to prevent griefing.

---

## Phase Roadmap

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Compact contracts compile | ✅ Shipped `a5e33a3` |
| 1 | Monorepo scaffold (pob-contract, pob-api, pob-ui, match-relay) | ⏳ |
| 2 | Local 2-player game plays end-to-end | ⏳ |
| 3 | Vercel preview (TestNet) | ⏳ |
| 4 | Public TestNet tournament (10 players, free entry) | ⏳ |
| 5 | MainNet launch with tDUST wagers | ⏳ |
| 6 | Season 1 leaderboard + achievements rollout | ⏳ |

---

## Known Constraints

- **ZK resolve takes 5-10 s**: we show a spinner with "Generating zero-knowledge proof…" so players know the UI isn't frozen. Never hide this — privacy guarantees come from computational cost.
- **Spectator mode is read-only**: spectators don't generate proofs; they just subscribe to public match state via the indexer. Cheap to scale.
- **Forfeit timer** (stall protection) is contract-enforced with `forfeitStalledChallenge`. UI should surface a visible countdown when an opponent hasn't played.

---

## References

- Master roadmap: `PixyPi/DEPLOYMENT_ROADMAP.md`
- Contract README: `realDeal/contracts/README.md`
- Reference game: https://github.com/bricktowers/midnight-seabattle
- Newer official game: https://github.com/midnightntwrk/example-battleship

---

*Built by Penny 🎀 on Apr 17, 2026.*
