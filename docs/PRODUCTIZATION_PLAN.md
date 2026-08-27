# Productization Plan — Invisible Chain, Advertisers, and Usage Metrics

**Status**: PLANNED — written Aug 22, 2026 (Penny 🎀 + John)
**Builder handoff**: self-contained, written for a fresh agent (SOL) to execute
without reading the whole repo. Paths are relative to
`/home/js/DIDzMonolith/ProofOrBluff_MLH_Midnight/` unless noted.
**Prerequisite reading**: `docs/TESTWIRED_PLAN.md` (architecture tiers) and the
"Verified working" section below — everything here builds on a TestWired stack
that has already run real matches on the local chain.

---

## 0. What is already verified working (Aug 21-22, 2026)

Do not re-derive these; they were proven live against the local Docker stack:

- Full match lifecycle on-chain: deploy → createMatch (wager escrow) →
  joinMatch (second wallet) → revealSeed → playCards (committed bluff) →
  challengeClaim → resolveChallenge (ZK, disclosed ONLY `honest: false`) →
  scores updated. Contract `3a47e2…52afe` on the local `undeployed` chain.
- **Bot service** `realDeal/cli/src/bot.js` — localhost HTTP service
  (127.0.0.1:3017) holding a headless P2 wallet: join/advance/status/health
  endpoints, strict validation, CORS allowlist, serialized wallet ops,
  deterministic hand reconstruction, graceful shutdown. **This is the seed of
  the Game API described below.**
- **Shared deterministic dealing** `realDeal/shared/dealing.js` (28 tests).
- **TestWired browser panel** `realDeal/app/src/TestWiredPanel.jsx` — Lace P1
  vs bot P2, full game loop, mounted as default app surface
  (`VITE_POB_MODE=testwired`; original AI game preserved at `dev:demo`).
- **SponsorRail** `realDeal/app/src/SponsorRail.jsx` — Lace/Trezor "Example
  sponsor" placeholder tiles, responsive strip/side layouts.
- Suite: 35/35 tests; both app builds green.

Small known debts to clear early (Phase 0 below): CLI `e2e` command is a stub;
non-create CLI commands auto-deploy a fresh contract when state is missing;
the paused acceptance match still has a P2 claim awaiting P1's challenge.

---

## 1. The honest framing (read this before building)

### 1.1 What "users don't know it's blockchain" means for trust

Today (TestWired): the player holds a Lace wallet, signs their own
transactions, and pays their own (fake) fees. Trust is player-held.

Consumer mode (this plan): **we** hold every wallet server-side, sign every
transaction, and pay every DUST fee from our own NIGHT treasury. The player
sees a normal card game. Consequences, stated plainly:

- The player now trusts **our Game API**, not their own keys. The chain
  becomes *our internal fairness ledger and audit trail* — every deal seed,
  claim, challenge, and ZK resolution is still committed on-chain and
  auditable, but by us and any third party we grant access, not by the
  player's own wallet.
- This is an honest and appropriate model for **solo player-vs-AI**, because
  the opponent is our bot anyway — there is no counterparty the player needs
  cryptographic protection *from*. The on-chain record's value is provable
  fairness ("we cannot silently stack the deck after the fact") and a
  marketing-credible audit trail.
- It is NOT the right model for PvP wagers with real money. That remains
  realDeal (player-held Lace wallets), unchanged. Never blur the two in copy.

### 1.2 The real enemy is latency, not fees

Local-chain fees are free and mainnet DUST regenerates from NIGHT, so fee
economics are manageable (see §3.5). The thing that actually breaks the
"it just works" illusion is **proof time**: every circuit call costs roughly
15-45 seconds. A player who doesn't know (or care) about blockchains will not
tolerate 30-second turns. Therefore consumer mode ships with **chain
checkpointing** (§3.4): routine plays resolve instantly server-side; the
cryptographically meaningful moments (match creation commit, challenges,
settlement) go on-chain. Full-chain mode remains available for demos and
regulator/partner show-and-tell.

---

## 2. Workstream overview and sequencing

```
Phase 0  Hardening (finish acceptance match, e2e, guards)        ~1 session
Phase 1  Game API + session wallets + fee treasury               ~2-3 sessions
Phase 2  Consumer web mode (no wallet, demoLand-quality UX)      ~2 sessions
Phase 3  Docker packaging ("one command, it works")              ~1 session
Phase 4  Usage metrics service + SponsorRail beacons             ~1-2 sessions
Phase 5  MidnightVitals usage probe + advertiser dashboard       ~1-2 sessions
Phase 6  30-day data soak → media kit → advertiser outreach      calendar time
```

Phases 4-5 can run in parallel with 2-3. Phase 6 is mostly John, not SOL.

---

## Phase 0 — Hardening prerequisites

| # | Task | Detail |
|---|------|--------|
| 0.1 | Finish the paused acceptance match | P2's claim is pending; run the P1 challenge → bot resolve → play to game-over → claimPayout. Use `POB_STATE_NAMESPACE=default` (that's where the live match lives). Record tx IDs in `realDeal/docs/ACCEPTANCE_RUN_2026-08.md`. |
| 0.2 | Real `e2e` CLI command | Replace the stub in `realDeal/cli/src/cli.js` with a scripted full lifecycle using both seeds (create→join→reveal→play→challenge→resolve→…→payout), asserting phase/scores at each step. Exit nonzero on any mismatch. This becomes the CI smoke test. |
| 0.3 | Auto-deploy guard | `getContractApi` in both `contract.js` files deploys a fresh contract whenever no address is persisted. Only `create-match` (CLI) / `startGame` (browser) should be allowed to trigger deployment; every other command should fail loudly with "no contract for namespace X — run create-match first or set the address". This bug already bit us once (challenge in a fresh namespace silently deployed an empty contract). |
| 0.4 | Update `docs/ROADMAP.md` | It still says Phase 1/demoLand. Reflect the TestWired reality and this plan. |

---

## Phase 1 — The Game API (invisible-chain backend)

**Evolve `realDeal/cli/src/bot.js` into `realDeal/server/`** — a proper
service. The bot already solves the hard parts (headless wallet, serialized
tx queue, hand reconstruction, HTTP hygiene). Generalize:

### 1.1 Architecture

```
Browser (no wallet)                 Game API (Node service)
┌──────────────────┐   REST/JSON   ┌────────────────────────────────┐
│ consumer web app │ ────────────► │ session mgr → match orchestrator│
│ (demoLand-quality│ ◄──────────── │  ├ P1 session wallet (ours)     │
│  UI, no Midnight │    poll/SSE   │  ├ P2 bot wallet (ours)         │
│  code in bundle) │               │  ├ fee treasury monitor         │
└──────────────────┘               │  └ metrics recorder (Phase 4)   │
                                   └───────┬────────────────────────┘
                                           │ midnight-js + wallet-sdk
                                   ┌───────▼────────────────────────┐
                                   │ node :9944 · indexer :8088 ·   │
                                   │ proof server :6300 (Docker)    │
                                   └────────────────────────────────┘
```

### 1.2 Wallet strategy

- **Operator HD tree**: one master seed (env `POB_OPERATOR_SEED`, NEVER
  committed for non-local networks; local dev keeps the known public test
  seeds). Derive per-role accounts: `treasury` (holds NIGHT, generates DUST),
  `p1-pool[n]`, `p2-bot`. The existing `wallet-node.js` `deriveKeysFromSeed`
  already does HD derivation — extend account index rather than new code.
- **Session → wallet mapping**: sessions are ephemeral (in-memory token, no
  accounts, no PII). A session leases a P1 pool wallet for its match and
  returns it after game-over. Start with a pool of 2-4 wallets; matches are
  serialized per wallet anyway due to proof latency.
- **Fee treasury**: on startup and every N minutes, check DUST balance of all
  operator wallets; auto-register NIGHT for DUST generation (the
  `registerNightForDust` flow already exists); expose balances via the
  metrics/vitals endpoint; refuse new matches below a DUST floor with a
  friendly "table is full" message rather than a crash.

### 1.3 API surface (draft)

```
POST /api/v1/session            → { sessionToken }            (anonymous)
POST /api/v1/match              → { matchId, state }          (mode, difficulty)
GET  /api/v1/match/:id          → { state, yourHand, dialogue }
POST /api/v1/match/:id/play     → { cards[], … }              (indices into hand)
POST /api/v1/match/:id/respond  → { action: accept|challenge }
POST /api/v1/match/:id/ack      → advance bot / resolve pending
GET  /api/v1/health             → stack + treasury status
GET  /api/v1/metrics/summary    → Phase 4 aggregates (public)
```

Notes for SOL:
- The server executes BOTH sides' transactions, so the browser never needs
  entropy handoff — the server generates and stores both entropies, calls
  revealSeed itself. The commit-reveal ceremony still runs on-chain (it is
  what makes the deal provably fair in the audit trail).
- `yourHand` is computed server-side from the shared dealing module. The
  browser gets P1's cards only. Never ship P2's hand or the seed derivation
  to the client in consumer mode.
- Keep the localhost bot service working (TestWired tier must not break).
  Suggested: `realDeal/server/` imports shared internals from a extracted
  module rather than copy-paste; bot.js stays as the thin TestWired surface.
- Session hygiene: tokens are random 128-bit, in-memory only, expire after
  inactivity; one active match per session; body-size and rate limits like
  bot.js already has.

### 1.4 Chain modes (per-match setting, env default)

| Mode | What goes on-chain | Use |
|------|-------------------|-----|
| `full` | every circuit (current TestWired behavior) | demos, audits |
| `checkpoint` (**consumer default**) | createMatch, revealSeed commit, every challengeClaim+resolveChallenge, final settlement/payout | consumer play |
| `settle-only` | createMatch + final result hash | high-volume/casual |

Checkpoint mode implementation: the server runs the authoritative game engine
in-process (reuse `demoLand/src/game/engine.js` rules), records a hash chain
of moves, and anchors the required checkpoints to the contract. The contract
already supports the challenge circuits; routine accepted plays simply don't
generate txs. Document in code that `full` vs `checkpoint` changes the audit
granularity, not the game rules.

### 1.5 DUST/NIGHT economics (mainnet-forward math to include in docs)

Per full-chain match: ~4 lifecycle txs + 2×(plays+responses) ≈ 20-40 txs.
Checkpoint mode: ~4-8 txs per match. Treasury sizing rule of thumb: measure
DUST cost per tx on the target network at deploy time (do NOT hardcode —
query and log it), multiply by expected daily matches ×1.5 headroom, and keep
that much DUST generation capacity in NIGHT. Add a `treasury` section to the
health endpoint showing: NIGHT balance, current DUST, DUST/hour regen,
estimated matches-per-day capacity. This number is also an advertiser-facing
"capacity" stat.

---

## Phase 2 — Consumer web mode

- New `VITE_POB_MODE=consumer`. The app renders the **polished demoLand game
  table** (cards, sounds, dialogue, banners — all of it), but the provider
  behind it is a new `ConsumerGameProvider` that talks ONLY to the Game API.
  No `@midnight-ntwrk/*` imports in the consumer bundle path — code-split so
  the WASM ledger never loads (it is ~11 MB; consumer mode should be light).
- Latency masking: dealer shuffle video/animation during match creation;
  AI banter + "thinking" delays already exist and now do double duty covering
  checkpoint txs; challenges show the existing dramatic "Proof or Bluff!"
  moment with a progress line ("The table is verifying…") — never the word
  blockchain unless the player opens "About fairness".
- **"About fairness" page** (one screen): plain-language explanation that
  every match is anchored to a privacy-preserving ledger and how to verify —
  this is the honest disclosure, discoverable but not shoved in faces. Also
  where the Midnight attribution lives.
- Keep `testwired` and `demo` modes working (three modes total, one env var).

## Phase 3 — Docker packaging

- `deploy/docker-compose.yml` at repo root: five services —
  `node`, `indexer`, `proof-server` (same images/pins as
  `midnight-local-dev/standalone.yml`; copy the pins, do not point at that
  repo), `game-api` (new Dockerfile under `realDeal/server/`), `web` (static
  build of consumer mode behind nginx or `vite preview`).
- One command: `docker compose -f deploy/docker-compose.yml up -d` →
  http://localhost:3020 just works, wallet-free.
- Startup ordering: game-api healthcheck waits for node+indexer+proof-server
  health, deploys (or finds) the contract, then reports ready; web serves a
  "table is being set" splash until game-api is ready.
- `.env.deploy.example` documents every knob (network, seeds, chain mode,
  ports, metrics salt). Local defaults committed; non-local secrets never.
- Future: swapping `POB_NETWORK_ID` + endpoints to testnet/mainnet is the
  ONLY intended change for network graduation; keep it that way.

---

## Phase 4 — Usage metrics (privacy-first, and that's the pitch)

### 4.1 Principles (non-negotiable, they're the brand)

- **Count events, not people.** No cookies, no fingerprinting, no IPs stored,
  no user IDs. A session is an ephemeral random token that dies with itself.
- Aggregate-only storage: daily rollup rows, never per-user journals.
- This is a *selling point* to crypto advertisers: "your ad ran N times in
  front of a privacy-respecting audience, measured without surveillance."

### 4.2 Implementation

- Metrics live **inside the Game API** (no third-party analytics, no new
  heavy deps). Storage: `node:sqlite` (built into Node ≥22.5) with a single
  `daily_metrics(date, metric, count)` table + in-memory counters flushed
  every minute. JSON-file fallback acceptable for v1 if sqlite friction.
- Events to count:
  - `session_started`, `match_created`, `match_completed`, `match_abandoned`
  - `challenge_issued`, `bluff_caught`, `honest_survived`
  - `proof_generated` + histogram of proof seconds (ops + wow-factor stat)
  - `session_minutes` (bucketed durations)
  - `ad_impression:<slot>` and `ad_hover:<slot>` (see 4.3)
- Endpoints:
  - `GET /api/v1/metrics/summary` — public JSON: last 24h / 7d / 30d / all-time
    aggregates. Cacheable, no auth (nothing sensitive in it).
  - `GET /api/v1/metrics/daily.csv?token=…` — advertiser/export view, gated
    by a simple bearer token env var (`POB_METRICS_TOKEN`).

### 4.3 SponsorRail beacons

- In `SponsorRail.jsx`: IntersectionObserver marks a tile "viewed" when ≥50%
  visible for ≥1s, at most once per session per slot; hover counted once per
  session per slot. Batch into a single `POST /api/v1/metrics/ad-beacon`
  (fire-and-forget, `navigator.sendBeacon` where available). Respect Do Not
  Track by simply not sending (counters undercount — acceptable and honest).
- Beacons are validated like every other input (slot must be in a known
  list) and rate-limited per session token.

---

## Phase 5 — MidnightVitals integration

Verified current shape of `/home/js/DIDzMonolith/MidnightVitals`: npm
workspace with `packages/core` (headless probes) + `packages/cli`; the React
panel still lives in DiscoveryManagement (`frontend-demoland-vite-react/src/vitals`).

- **Add a `usageProbe` to `packages/core`**: given a base URL, fetch
  `/api/v1/metrics/summary` + `/api/v1/health` and normalize into the core's
  probe result shape (status + key numbers). This makes ANY consumer of
  MidnightVitals able to display usage, which fulfills POB's "consumer #2"
  commitment (see `realDeal/docs/PHASE_3_MIDNIGHTVITALS.md`) and adds a
  genuinely new capability to Vitals (usage, not just health).
- **POB admin dashboard**: an operator-only route/panel in the POB app (or
  the Vitals CLI initially) showing: stack health (existing probes), treasury
  status, and the usage aggregates — the exact screen we show advertisers.
  Panel extraction from DiscoveryManagement is NOT a blocker: v1 can be a
  simple table in POB fed by the same core probe.
- Coordination note for SOL: MidnightVitals is its own repo with its own
  conventions — read its README/tests first, keep the probe dependency-free,
  add tests mirroring the existing probe tests, and do not restructure the
  workspace. John must approve anything beyond adding the probe + tests.

---

## Phase 6 — Advertiser acquisition plan (mostly John; SOL builds the assets)

### 6.1 Sequencing — numbers before outreach

1. Ship Phases 4-5, deploy the packaged game somewhere reachable (even a
   single VPS running the compose stack), and **soak for 30 days** to gather
   real usage data. Promote through channels John already has: Midnight
   ambassador network, Discord, X, hackathon contacts.
2. SOL builds the **media kit** from live data: one-pager (PDF + page in the
   app) with: audience description (privacy-conscious crypto users), 30-day
   sessions / matches / ad impressions / avg session minutes, placement
   screenshots (strip + wide-screen tokens), the privacy-first measurement
   story, and pricing.
3. Only then: outreach.

### 6.2 The two launch targets and the path to each

| Target | Path | First ask |
|--------|------|-----------|
| **Lace (IOG)** | Warm intro through the Midnight ambassador program — John is NightForce Bravo and Midnight-certified; POB is already a Midnight showcase, so Lace sponsorship is ecosystem-aligned marketing for them. Pitch: "the game that makes Midnight privacy legible ships with your wallet as the featured onboarding path." | Free 60-day pilot placement in exchange for feedback + permission to use their brand assets properly. Convert to paid monthly after pilot metrics. |
| **Trezor** | Cold-ish, but they run a public **affiliate program** — join it FIRST (no permission needed), replace the placeholder with a real affiliate placement, and let the affiliate clicks/conversions become the evidence for a direct sponsorship conversation with their partnerships team. | Affiliate → direct flat-rate sponsorship upgrade once we can show impressions + clicks. |

Fallback bench (same category, in order): Ledger, Tangem, NuFi, Begin, Eternl.
Two signed (or one signed + one active affiliate) = goal met.

### 6.3 Pricing and packaging (starting posture)

- Two perimeter slots only — scarcity is the product. Flat monthly rate per
  slot (niche-audience sponsorship pricing, not CPM), pilot-discounted.
  Suggested opening: free/discounted 30-60 day pilot → $250-500/mo per slot
  once 30-day impressions clear a stated threshold; revisit with data.
- Contract basics (John + template): monthly term, either-party 30-day out,
  brand assets provided by sponsor, we retain placement/UX control, clear
  FTC-style "Sponsor" disclosure stays on the tile.

### 6.4 Integrity rules (already in force, keep them)

- "Example sponsor" labeling stays until a real agreement is signed.
- Never imply endorsement of the game by the brand.
- No tracking beyond §4 aggregate beacons — that promise is in the pitch.

---

## Risks & honest caveats

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Proof latency breaks consumer UX | Players leave | Checkpoint mode default; latency masked by existing dialogue/animation systems; measure proof-seconds histogram from day one |
| Custodial framing gets marketed as trustless | Credibility damage in the exact community we court | §1.1 language is canonical; "About fairness" page states the model plainly; PvP stays realDeal |
| Contract honor-system gap (playCards doesn't prove hand membership) | Irrelevant in consumer mode (server controls both hands) but blocks real-money PvP | Already tracked as realDeal R2 (Merkle hand proof) in TESTWIRED_PLAN.md — unchanged |
| Operator seed compromise (non-local) | Treasury theft | Non-local seeds only via env/secret manager, never committed; treasury holds operating float only; document rotation |
| Local stack images drift vs SDK pins | Stack breaks on re-pull | Pin image digests in deploy compose; the SDK matrix dance from May is documented in `realDeal/docs/SDK_MATRIX_FINDING_2026-05-16.md` |
| DUST starvation under load | New matches fail | Treasury floor check → friendly "tables full" + alert in Vitals |
| Advertiser outreach before data | Burned first impression | Phase 6 hard-gates outreach behind 30-day soak |

---

## Suggested session breakdown for SOL

1. **Session A**: Phase 0 entirely (finish match, real e2e, deploy guard).
2. **Session B-C**: Phase 1 Game API (wallet pool + treasury + REST loop),
   with the e2e from 0.2 extended to drive the API end-to-end.
3. **Session D**: Phase 2 consumer mode UI wiring + latency masking.
4. **Session E**: Phase 3 Docker compose + splash/readiness.
5. **Session F**: Phase 4 metrics + beacons; Phase 5 Vitals probe + admin view.
6. **Then John**: deploy, soak, promote; SOL builds the media kit from data.

Definition of done for the whole plan: a stranger with Docker runs one
command, plays three matches in a browser with zero wallet knowledge, the
admin dashboard shows their sessions and ad impressions, and the on-chain
audit trail for their matches exists on the local chain.

---

*Grounded in the verified TestWired build of Aug 21-22, 2026 (35/35 tests,
live on-chain match on the local stack). If reality disagrees with this doc,
update the doc.*
