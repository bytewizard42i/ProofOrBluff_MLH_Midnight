# Phase 3 — MidnightVitals as POB's Permanent Admin Layer

**Status**: deferred (not blocking Phase 2). Captured May 16, 2026.

POB is committed to being **consumer #2** of the MidnightVitals diagnostic
console (DiscoveryManagement is consumer #1, where the source currently
lives). This doc captures the rationale, integration shape, and open
questions so the work isn't forgotten between sessions.

> Source repo: https://github.com/bytewizard42i/MidnightVitals
> Local path: `/home/js/DIDzMonolith/MidnightVitals/`
> Source-of-truth code: still inside
> `/home/js/DIDzMonolith/DiscoveryManagement/` — to be extracted as an
> npm package once it's stable.

---

## Why MidnightVitals fits POB

MidnightVitals is a developer/admin diagnostic console that pings every
moving Midnight DApp dependency on a timer (proof server, indexer, node,
wallet, smart contract) and presents a live readout plus a
human-readable interaction log (hover / click / output).

| What MidnightVitals provides | What POB gets out of it |
|---|---|
| Live ping of proof server / indexer / node / wallet | Demo-day insurance — judges see "all green" instead of staring at a spinner during the 15-20s ZK sync window. |
| Contract address + deployment health | Catches stale-binding and wrong-network bugs before they bite. Today we have to grep localStorage to find the contract address. |
| Real-time interaction log | A judge clicks **Challenge** and the diagnostic console shows `→ challengeClaim(matchId=0x..., currentTime=...)` then `← txHash=0x..., 15s ZK delay starting`. Concrete demo of what the contract is doing. |
| Operator-vs-player separation | Diagnostic panel is admin-only. Players never see it. Maps cleanly to "auth admins" framing. |
| Reusability validation | POB becoming consumer #2 proves the standalone-npm-package promise. |

## What "auth admins" should resolve to (open question)

The May 16 conversation flagged ambiguity in "auth admins". Three readings:

1. **Operators / observers** — people running POB infrastructure who need
   a diagnostic dashboard. Pure MidnightVitals fit. No player-side auth
   involved; players just connect Lace / 1AM and play.
2. **Authenticated admin users** — specific wallet addresses with admin
   privileges on the contract (pause matches, refund stuck escrows, kick
   players). This is identity / authorization, not observability —
   solved by an allowlist of `ZswapCoinPublicKey` values in the
   contract, NOT by MidnightVitals.
3. **Both** — MidnightVitals for ops health PLUS an admin-role check
   (allowlisted coinPublicKeys) on the contract for privileged actions.

> **TODO**: John to confirm which reading. Best guess from context:
> reading (1) for now (MidnightVitals only). Reading (2) is its own
> Phase 4 contract change — see "Future contract work" below.

---

## Integration shape

Three viable paths once MidnightVitals is extracted as an npm package.
**Decision deferred until then.**

### Path A — npm package (preferred, requires extraction)

```jsonc
// realDeal/app/package.json
{
  "dependencies": {
    "@bytewizard42i/midnight-vitals": "^0.1.0"
  }
}
```

```jsx
// realDeal/app/src/App.jsx
import { MidnightVitalsPanel } from '@bytewizard42i/midnight-vitals';

<MidnightVitalsPanel
  endpoints={{
    node:        'http://localhost:9944',
    indexer:     'http://localhost:8088/api/v3/graphql',
    indexerWs:   'ws://localhost:8088/api/v3/graphql/ws',
    proofServer: 'http://localhost:6300',
  }}
  contractAddress={getContractAddress()}
  walletHandle={walletHandle}
  visibleTo="admin"
  dockTo="bottom-right"
/>
```

Cleanest, no source duplication, npm-publish path.

### Path B — Git submodule (interim)

Add MidnightVitals as a sibling submodule under POB and import via a
relative path in `vite.config.js`:

```js
resolve: {
  alias: {
    '@midnight-vitals': path.resolve(__dirname, '../../MidnightVitals/src'),
  },
},
```

Workable but breaks once MidnightVitals starts publishing real versions.

### Path C — Copy/vendor (last resort)

Copy the relevant components from
`/home/js/DIDzMonolith/DiscoveryManagement/` into POB. **Avoid** —
creates a fork to maintain.

---

## What needs to happen first (in MidnightVitals repo)

Per its README ("What's left to make it standalone"):

- [ ] Build pipeline (tsup or vite library mode)
- [ ] `package.json` with peer deps for React + Tailwind
- [ ] CSS extraction strategy for Tailwind consumers (POB does NOT use
  Tailwind; the panel needs to either ship its own CSS or accept a
  classNames prop so POB can style it)
- [ ] Optional `react-router-dom` integration (POB doesn't use router,
  so panel must be route-agnostic)
- [ ] Tests

The Tailwind question is the biggest snag for POB specifically — the
realDeal app uses plain CSS (`src/styles.css`). MidnightVitals must
ship its own scoped styles or the integration creates a Tailwind
runtime cost POB doesn't otherwise pay.

---

## Recommended sequencing

| Phase | What | When |
|---|---|---|
| 2a — CLI wiring | Node CLI exercises all 14 circuits end-to-end against local stack | now (May 16-17 2026) |
| 2b — UI panel | `RealDealMatchPanel` with buttons for each game-loop method | tonight after CLI is green |
| 2c — End-to-end browser test | Full match on local stack via Lace | once 2b is in |
| **3 — MidnightVitals integration** | **This document** | once MidnightVitals ships as a real npm package, OR if we hit a Phase 2 debugging session where the diagnostic value pays for itself early |
| 4 — Auth-admin contract layer | Allowlist of admin `ZswapCoinPublicKey` values in proof-or-bluff.compact + admin-only circuits (pauseMatch, refundEscrow) | only if reading (2) of "auth admins" is confirmed |

## Cross-references

- MidnightVitals README & roadmap: `/home/js/DIDzMonolith/MidnightVitals/README.md`
- DiscoveryManagement (current source-of-truth): `/home/js/DIDzMonolith/DiscoveryManagement/`
- POB realDeal Phase 2 wiring layer: `realDeal/app/src/midnight/contract.js`
- POB realDeal contract: `realDeal/contracts/proof-or-bluff.compact`
- DIDzMonolith global rule on local-first network ladder applies — see
  `/home/js/PixyPi/SISTERS_GLOBAL_RULES.md`
