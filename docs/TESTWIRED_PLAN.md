# TestWired Plan — the Middle Rung Between demoLand and realDeal

**Status**: PLANNED — written Aug 21, 2026 (Penny 🎀 + John)
**Builder handoff**: this doc is self-contained. A fresh agent (or human)
should be able to execute it top-to-bottom without reading the whole repo
first. Every file path is absolute-from-repo-root
(`/home/js/DIDzMonolith/ProofOrBluff_MLH_Midnight/`).

---

## 1. Why TestWired exists

POB currently has two tiers:

| Tier | What it is | Trust model |
|------|-----------|-------------|
| **demoLand** | Browser game vs scripted AI, all state in localStorage | Trust the client |
| **realDeal** | PvP on Midnight: on-chain escrow, ZK challenges, Lace wallet | Midnight proves it |

The problem: the jump between them is enormous. demoLand has zero
blockchain; realDeal demands two humans, two wallets, entropy exchange,
and a full local stack — all at once. When something breaks you can't
tell whether it's the contract, the SDK matrix, the wallet bridge, the
UI wiring, or the stack itself.

**TestWired** is the intermediate tier that isolates the blockchain
plumbing from the multiplayer UX:

| | demoLand | **TestWired** | realDeal |
|---|---|---|---|
| Contract calls | none | **real (local chain)** | real (local → pre-prod → mainnet) |
| Proof server | none | **real (local Docker)** | real |
| ZK proofs | none | **real** | real |
| Opponent | scripted AI (in-browser) | **scripted AI brain driving a CLI bot wallet** | real human (PvP) |
| Wallets | none | **1 browser (Lace) + 1 headless seed wallet** | 2 Lace wallets |
| Wagers | play money | **real native tokens on the fake local chain** | real tokens |
| Purpose | prove the game is fun | **prove the wiring works end-to-end** | prove it's a product |

One sentence: *TestWired is demoLand's gameplay with realDeal's
blockchain — the AI opponent stays, but every move becomes a real
on-chain transaction with a real ZK proof.*

Decision (Aug 21, 2026): P2 is a **CLI bot** (reusing the scripted AI
brain from `demoLand/src/game/ai/scripted.js`) for fast iteration.
Manual two-browser PvP is the final acceptance gate before we call
realDeal ready — see §6.

---

## 2. Current state of the codebase (verified Aug 21, 2026)

What already EXISTS and is believed good:

- **Contract**: `realDeal/contracts/proof-or-bluff.compact` — complete.
  Full state machine (create → join → revealSeed → play/accept/challenge
  → resolve → payout), commit-reveal shuffle, Zswap escrow, timeouts.
  Compiled artifacts live in `realDeal/contracts/managed/proof-or-bluff/`
  (zkir + prover/verifier keys) and are mirrored into
  `realDeal/app/dist/managed/`.
- **Browser contract layer**: `realDeal/app/src/midnight/contract.js` —
  every circuit wired, v8 SDK matrix, in-memory private-state provider,
  wrapped FetchZkConfigProvider that serves `.bzkir` to the proof server.
- **Wallet bridge**: `realDeal/app/src/midnight/wallet.js` — CAIP-372
  DApp Connector (Lace "Undeployed" network), midnight-js adapter for
  balanceTx/submitTx.
- **Provider**: `realDeal/app/src/providers/realdeal/gameProvider.js` —
  `RealDealGameProvider` class wrapping the contract API. **Written but
  never called by any UI.**
- **CLI**: `realDeal/cli/` — headless seed-wallet surface mirroring the
  browser layer. Has an `e2e` command (`npm run e2e`). v8 SDK deps in
  package.json.

What is MISSING or UNKNOWN:

1. **UI is not wired.** `realDeal/app/src/App.jsx` still imports the
   demoLand engine (`./game/engine.js`) and scripted AI directly. The
   on-chain provider is dead code from the UI's perspective.
2. **The e2e has never been recorded green** against the current stack.
   `realDeal/docs/SDK_MATRIX_FINDING_2026-05-16.md` still says
   "blocking" even though the v8 migration commits landed afterward
   (git: `b5da4e7`, `722f91e`, `e29a190`, `93b3a5b`). Nobody updated
   the doc — so treat e2e status as UNKNOWN until Phase 0 proves it.
3. **`realDeal/app` package.json's `compile` script points at
   `../../scripts/compile-contract.sh` which does not exist.** If the
   contract needs recompiling, this must be fixed or done by hand.
4. **Contract honor-system gap** (acknowledged in the contract comments,
   ~line 504): `playCards` decrements hand size by `claimedCount` but
   never proves the played cards came from the dealt hand. Fine for
   TestWired; must be fixed (Merkle hand-membership proof) before real
   wagers. See §7.

Environment facts (verified this session):

- Local stack lives at `/home/js/utils_Midnight/midnight-local-dev/`
  with `standalone.yml` (node :9944, indexer :8088, proof-server :6300).
- Docker Desktop WSL integration must be ON — check with `docker ps`
  before anything else. **Zero containers exist right now**; first boot
  will pull images.
- Network target is `undeployed` only (pre-prod out of scope; see
  `realDeal/docs/LOCAL_DEV_GUIDE.md`).
- Per global rules: **discover the current compactc version at build
  start** (midnight-expert → Kapa MCP → docs.midnight.network support
  matrix). Do not trust the pragma comment in the contract header.

---

## 3. TestWired architecture

```
┌────────────────────────────┐        ┌────────────────────────────┐
│  BROWSER (you, Player 1)   │        │  CLI BOT (Player 2)        │
│  realDeal/app on :3016     │        │  realDeal/cli + bot loop   │
│  Lace wallet ("Undeployed")│        │  seed-phrase wallet        │
│  RealDealGameProvider      │        │  scripted.js AI brain      │
└─────────────┬──────────────┘        └─────────────┬──────────────┘
              │  createMatch / playCards / …        │  joinMatch / accept / challenge / …
              ▼                                     ▼
      ┌──────────────────────────────────────────────────┐
      │        LOCAL MIDNIGHT STACK (Docker)              │
      │  node :9944   indexer :8088   proof-server :6300  │
      │  contract: proof-or-bluff (deployed once,         │
      │  address shared via localStorage / .pob-state)    │
      └──────────────────────────────────────────────────┘
```

Key design points:

- **Same contract, same chain, two surfaces.** The browser and the bot
  are just two players. Nothing TestWired-specific goes on-chain.
- **The bot reuses the demoLand AI brain** (`decidePlay`,
  `decideChallenge` from `demoLand/src/game/ai/scripted.js`) but
  executes its decisions through the CLI's contract layer instead of
  mutating a local state object. The banter/dialogue strings can ride
  along too — the browser shows them from the public claim data.
- **Entropy exchange is automated.** In PvP, players paste each other's
  entropy hex. In TestWired, the bot writes its entropy to a small
  local handoff file (or serves it over a localhost endpoint) that the
  browser app reads. This is the one deliberate "cheat" — it replaces a
  human copy-paste step, not a trust boundary (entropy reveal is public
  by design at revealSeed time).
- **Mode switch stays env-driven**: `VITE_POB_MODE=testwired` (new) vs
  the existing provider factory pattern. demoLand behavior is untouched.

---

## 4. TestWired build plan (phased, each phase independently verifiable)

### Phase 0 — Prove the foundation (before writing ANY new code)

*Goal: a recorded green e2e. If this fails, stop and fix — everything
else is built on it.*

| # | Task | Command / file | Done when |
|---|------|----------------|-----------|
| 0.1 | Docker up + stack boot | `cd /home/js/utils_Midnight/midnight-local-dev && docker compose -f standalone.yml up -d` | `docker ps` shows 3 healthy midnight containers |
| 0.2 | Health checks | `curl http://localhost:9944/health` · `curl http://localhost:6300/health` · indexer GraphQL POST (see FOR_JUDGES.md) | all respond OK |
| 0.3 | Discover current compactc / SDK matrix | midnight-expert or Kapa MCP; compare with `realDeal/cli/package.json` pins | matrix confirmed current OR upgrade ticketed |
| 0.4 | CLI deps install | `cd realDeal/cli && npm install` | clean install |
| 0.5 | Fund the two CLI seed wallets | local-dev funding menu (`npm start` in midnight-local-dev) using `.env` seeds `POB_SEED_P1/P2` | both wallets show balance |
| 0.6 | **Run the smoke test** | `npm run e2e` (or manual `create-match` → `join-match` → full loop per `realDeal/cli/README.md`) | full match lifecycle lands real txs incl. `resolveChallenge` + `claimPayout` |
| 0.7 | Update `SDK_MATRIX_FINDING_2026-05-16.md` status line | mark RESOLVED with date + commit, or document the new failure | doc reflects reality |

If 0.6 fails on SDK/schema errors: the fix pattern is in
`SDK_MATRIX_FINDING_2026-05-16.md` §"The three options" — crib pins from
`/home/js/utils_Midnight/midnight-local-dev/package.json`, recompile the
contract with the matching compactc, re-test. Budget a full session.

### Phase 1 — The CLI bot (Player 2 automation)

*Goal: a bot that joins any open match and plays it to completion
autonomously.*

| # | Task | Notes |
|---|------|-------|
| 1.1 | New file `realDeal/cli/src/bot.js` | Long-running loop: poll match phase via indexer → act when it's P2's turn |
| 1.2 | Import the demoLand AI brain | `decidePlay` / `decideChallenge` from `demoLand/src/game/ai/scripted.js`. NOTE: the brain expects a full local game state (it knows its own hand). The bot must track its private hand off-chain — deal it deterministically from the combined seed exactly like the browser will (shared dealing code, see 2.2) |
| 1.3 | Entropy handoff | Bot writes its entropy hex to `realDeal/cli/.pob-state/entropy/<matchId>/p2.hex` (dir already exists for this) AND exposes it via a tiny localhost helper (see 1.5) so the browser can fetch it |
| 1.4 | Bot difficulty flag | `--difficulty easy|medium|hard`, mapped to the existing profiles |
| 1.5 | Tiny handoff server (optional but recommended) | `node src/bot.js --serve 3017` — one GET endpoint returning `{matchId, p2Entropy}` for the browser's TestWired auto-join flow. Localhost only, no auth needed (fake chain, public-by-design data) |
| 1.6 | npm script | `"bot": "node src/bot.js"` in `realDeal/cli/package.json` |

Acceptance: two terminals — `npm run cli -- create-match --player p1`
then `npm run bot -- --match <id>` — and the bot plays the full match
against manual P1 CLI commands.

### Phase 2 — Shared dealing module (the correctness keystone)

*Goal: both players independently derive identical hands from the
on-chain `combinedSeed`. This is what makes off-chain hands trustworthy.*

| # | Task | Notes |
|---|------|-------|
| 2.1 | New shared file `realDeal/shared/dealing.js` | Pure functions: `seedToDeck(combinedSeedHex, mode)` (deterministic Fisher-Yates from the seed, e.g. via a simple xorshift/PRNG seeded by the hash) and `dealHands(deck, mode)` → `{p1Hand, p2Hand, drawPile}` |
| 2.2 | Consume from BOTH surfaces | CLI bot (Phase 1) and browser (Phase 3) import the same module — never two implementations |
| 2.3 | Unit tests | `vitest`: same seed ⇒ same hands, both mode variants, seed-flip changes everything. This is the one module where tests are non-negotiable |

Design note: the contract only stores `combinedSeed` and hand SIZES.
Actual cards are derived client-side. Cheating (playing cards you
weren't dealt) is possible in TestWired — that's the known honor-system
gap (§7), acceptable at this tier.

### Phase 3 — Wire the browser UI to the chain

*Goal: `realDeal/app` actually calls `RealDealGameProvider` instead of
the local engine. The biggest single chunk of work.*

| # | Task | Notes |
|---|------|-------|
| 3.1 | Add `VITE_POB_MODE=testwired` handling | Provider factory in the app decides: demoLand engine vs RealDealGameProvider. Keep the existing local-engine path intact as fallback |
| 3.2 | Match lifecycle screen | Connect Lace → createMatch (deploys contract on first run — address persists in localStorage) → show matchId → "waiting for opponent" state → auto-detect join via phase polling |
| 3.3 | TestWired auto-join | Button: "Summon the bot" — either shells nothing (user starts bot manually per on-screen instructions) or fetches from the 1.5 handoff endpoint to auto-import entropy. Manual entropy paste field stays (it IS the realDeal flow) |
| 3.4 | Replace engine calls with provider calls | `makePlay`, `accept`, `challenge`, `resolveChallenge`, `claimPayout`. Every action becomes async: optimistic UI lock → tx submitted → poll indexer until phase changes → re-render from on-chain state |
| 3.5 | Hand rendering from shared dealing | After revealSeed, derive P1's hand via `realDeal/shared/dealing.js` from the on-chain combinedSeed. Track plays locally to know remaining hand |
| 3.6 | The 15-20s proof window UX | Reuse the shuffle-video / ProofServerLog idea — every tx that needs a proof shows progress. This is where `ProofServerLog.jsx` (already exists) earns its keep |
| 3.7 | Challenge-resolution flow | When the BOT is challenged, the bot auto-calls resolveChallenge (Phase 1 loop). When YOU are challenged, the UI must prompt "Prove it" → resolveChallenge (witness is in your localStorage from playCards) |
| 3.8 | Game-over → claimPayout | Winner clicks "Claim pot"; balances refresh via the wallet poll that already exists in wallet.js |

Acceptance: full browser-vs-bot match, wagered with local tokens,
including at least one challenge each direction and a payout claim —
with the browser NEVER touching `demoLand`'s local engine.

### Phase 4 — Hardening + docs

| # | Task |
|---|------|
| 4.1 | Fix or remove the phantom `compile` script (point at a real `scripts/compile-contract.sh` that pins the discovered compactc version) |
| 4.2 | `docs/TESTWIRED_README.md` — how to run it: 3 commands (stack up, bot up, app up) |
| 4.3 | Add TestWired to `judge-demo.sh` (or a sibling `testwired-demo.sh`) |
| 4.4 | Update `docs/ROADMAP.md` (stale — still says Phase 1) and `docs/DEMOLAND_VS_REALDEAL.md` to describe the three-tier model |
| 4.5 | Record a green run: paste tx hashes + timings into the README as proof-of-life |

---

## 5. TestWired — explicit non-goals

To keep scope tight, TestWired deliberately does NOT include:

- ❌ Two human players / two Lace wallets (that's realDeal acceptance)
- ❌ Pre-prod or mainnet (undeployed only)
- ❌ LLM-powered AI (Iteration 3) — scripted brain only
- ❌ Fixing the honor-system hand gap (contract change, see §7)
- ❌ Character art / video / party mode — gameplay surface stays as-is
- ❌ Match discovery/lobby — matchId is copy-pasted or auto-handed-off

---

## 6. realDeal plan (what remains AFTER TestWired is green)

TestWired proves the machine works. realDeal is about real humans and
real trust. Ordered by dependency:

### R1 — Two-human PvP UX
- Replace the bot handoff with the human flow: share matchId out-of-band
  (QR code / link), P2 joins from their own browser + Lace, entropy
  hexes exchanged via the UI (copy-paste fields already scaffolded in
  `gameProvider.importEntropy`).
- Turn notifications: poll-based "it's your move" indicator (indexer
  subscription if the SDK supports it cleanly).
- Timeout UX: surface `forfeitAbandonedMatch` / `forfeitStalledChallenge`
  as "claim win by timeout" buttons when the clocks expire.
- Acceptance gate: **two laptops, two Lace wallets, one full wagered
  match with challenges and payout.** This is the moment TestWired
  graduates to realDeal.

### R2 — Contract hardening (required before real money)
- **Merkle hand-membership proof**: dealing commits a Merkle root of
  each hand (derived from combinedSeed, verifiable by both parties);
  `playCards` proves the played cards are unplayed leaves. Closes the
  honor-system gap. This is a contract change → recompile → redeploy.
- Review disclosure surface: current `resolveChallenge` reveals only the
  boolean — re-verify no metadata leaks (salt reuse, timing).
- Independent review/audit pass before any non-fake-money deployment
  (per MIDNIGHT_SOURCE_POLICY.md, verify patterns against
  midnight-expert / Kapa).

### R3 — Network graduation
- Local `undeployed` → pre-prod (`testnet-02`) once Midnight declares it
  stable → mainnet. Each hop: re-check SDK matrix, recompile with
  matching compactc, fund test wallets, redeploy, re-run the R1
  acceptance match.
- Contract address management: replace localStorage-only persistence
  with a checked-in per-network address registry
  (`realDeal/deployments.json`).

### R4 — Product surface (from the existing roadmap, now unblocked)
- Match lobby / discovery (open matches list from indexer).
- MidnightVitals diagnostic panel (Phase 3 doc already written:
  `realDeal/docs/PHASE_3_MIDNIGHTVITALS.md`).
- KYCz gate for Casino mode wagers (off-chain check before joinMatch —
  already anticipated in the contract header comments).
- DIDz identity binding + player-stats companion contract (ELO,
  achievements) — header comments reference `player-stats.compact`,
  which does not exist yet.
- Iteration-3 LLM opponent for the solo mode (this stays a
  TestWired-style bot architecture — the LLM bot is just a smarter brain
  behind the same CLI bot loop, which is another reason TestWired's bot
  is worth building well).

---

## 7. Known risks & honest caveats

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Phase 0 e2e fails on SDK drift (stack images may have moved since May) | Blocks everything | Budget a session; upgrade path documented in SDK_MATRIX_FINDING; crib pins from midnight-local-dev |
| Proof latency makes turns feel slow (~15-20s per proved tx) | UX drag | Shuffle-video cover + ProofServerLog; read circuits (getMatch etc.) don't need proofs |
| Honor-system hand gap | Cheating possible | Accepted for TestWired; R2 Merkle proof before real wagers |
| Deterministic dealing bugs (two surfaces derive different hands) | Game desyncs, challenges misresolve | Phase 2 shared module + mandatory unit tests; never fork the implementation |
| localStorage witness loss (clear site data mid-match = can't resolve a challenge) | Stuck match | Timeout circuits already exist as the escape hatch; document it |
| Docker/WSL flakiness on Penny | Env friction | `docker ps` check is step 0.1 of every session; if it errors, start Docker Desktop / enable WSL integration FIRST and say so |

---

## 8. Suggested session breakdown for the builder

1. **Session A**: Phase 0 entirely. Do not start Phase 1 until e2e is
   green and the finding doc is updated.
2. **Session B**: Phase 1 (bot) + Phase 2 (shared dealing + tests).
   These are Node-only — no browser, fast feedback.
3. **Session C–D**: Phase 3 (UI wiring). Biggest chunk; 3.1–3.4 first
   (lifecycle + provider swap), then 3.5–3.8 (dealing, proof UX,
   challenge, payout).
4. **Session E**: Phase 4 (hardening, docs, demo script, roadmap
   refresh) + record the proof-of-life run.

Then stop, play it for an evening, and decide together whether R1
(two-human PvP) is next or whether gameplay polish matters more first.

---

*Written by Penny 🎀 with John, Aug 21, 2026. Grounded in a code audit of
`realDeal/` at commit `68ad1c1`. Corrections welcome — if reality
disagrees with this doc, update the doc.*
