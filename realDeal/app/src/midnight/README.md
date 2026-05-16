# realDeal — Midnight Wiring Layer

Files in `src/midnight/` translate the demoLand game flow into Midnight
contract calls. Read order:

1. **`config.js`** — endpoint URLs + the persisted contract address.
   Defaults match the local stack (`docker compose up` in
   `/home/js/utils_Midnight/midnight-local-dev`).
2. **`wallet.js`** — DApp Connector bridge for Lace / 1AM. Returns a
   handle with `coinPublicKey`, `address`, and a live state subscription.
3. **`contract.js`** — `getContractApi({ walletHandle })` builds a
   midnight-js provider bundle, deploys-or-finds the contract, and
   exposes one wrapper per exported circuit.

## Status

| Circuit | Status | Notes |
|---|---|---|
| `createMatch` | ✅ wired | Generates 32-byte entropy + commit, native-token coin, persists match-id ↔ entropy mapping in localStorage. |
| `joinMatch` | 🟡 stub | Phase 2. Needs joiner coin + saved p2 entropy. |
| `revealSeed` | 🟡 stub | Phase 2. Both entropies + deterministic startingRank. |
| `playCards` | 🟡 stub | Phase 2. Requires the play-commit hashing pattern from `engine.js`. |
| `acceptClaim` | 🟡 stub | Phase 2. |
| `challengeClaim` | 🟡 stub | Phase 2. |
| `resolveChallenge` | 🟡 stub | Phase 2. **This is the ZK showcase** — install a PlayRevealWitness via `setPendingReveal(...)` before calling. |
| `cancelUnjoinedMatch` | 🟡 stub | Phase 2. |
| `forfeitAbandonedMatch` | 🟡 stub | Phase 2. |
| `forfeitStalledChallenge` | 🟡 stub | Phase 2. |
| `claimPayout` | 🟡 stub | Phase 2. Final pot transfer. |

## How a circuit ends up wired

Each Phase 2 circuit follows the same recipe (see `createMatch` for the
reference implementation):

1. Encode arguments (`BigInt` for `Uint<N>`, `Uint8Array` for `Bytes<32>`).
2. Build any `ShieldedCoinInfo` payloads (`{ nonce, color, value }`).
3. Stage any `PlayRevealWitness` via `setPendingReveal(...)` if the
   circuit reads `revealLastPlay()`.
4. Call `deployed.callTx.<circuitName>(...)` — the Compact runtime
   coordinates proof generation (proof server) + transaction submission
   (node) + balance sync (indexer).
5. Decode `result.public.result` (the circuit's return value) +
   `result.public.txHash`.

## Generating / regenerating the bindings

The TS bindings + zkir files under
`realDeal/contracts/managed/proof-or-bluff/` are produced by
`compactc`. To regenerate after a contract change:

```bash
export PATH=/home/js/.compact/versions/0.31.0/x86_64-unknown-linux-musl:$PATH
compactc --skip-zk \
  realDeal/contracts/proof-or-bluff.compact \
  realDeal/contracts/managed/proof-or-bluff/
```

Drop `--skip-zk` to also generate proving keys (slower; needed before
deploying for real).

## Serving the zkir + keys at runtime

`fetchZkConfigProvider` (in `contract.js`) fetches the zkir files via
HTTP. The simplest way to expose them is a symlink:

```bash
cd realDeal/app/public
ln -s ../../contracts/managed/proof-or-bluff managed/proof-or-bluff
```

Then Vite serves them at `http://localhost:3016/managed/proof-or-bluff/...`
during `npm run dev`. Production builds need the same `managed/` tree
copied into `dist/`.

## Local stack expectations

| Service | URL | Container |
|---|---|---|
| Node RPC | `http://localhost:9944` | `midnight-node` |
| Indexer GraphQL | `http://localhost:8088/api/v3/graphql` | `midnight-indexer` |
| Indexer WS | `ws://localhost:8088/api/v3/graphql/ws` | `midnight-indexer` |
| Proof server | `http://localhost:6300` | `midnight-proof-server` |

All three live in `/home/js/utils_Midnight/midnight-local-dev`. Start
them with `docker compose -f standalone.yml up -d`.
