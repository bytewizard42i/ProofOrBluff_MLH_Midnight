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

## Status (Phase 2 — all circuits wired)

| Circuit | Status | Notes |
|---|---|---|
| `createMatch` | ✅ wired | 32-byte entropy + `pureCircuits.commitEntropy(entropy)` for the commit, native-token coin, persists `pob:realdeal:entropy:{matchId}:p1`. |
| `joinMatch` | ✅ wired | Same commit pattern as p1; persists under `:p2`. |
| `revealSeed` | ✅ wired | Reads both entropies from localStorage. The opponent's hex must be pasted in via `gameProvider.importEntropy(role, hex)` first. |
| `playCards` | ✅ wired | Builds a `PlayRevealWitness` from 1-4 actual ranks + per-slot fresh salts, hashes it via `pureCircuits.commitPlay(reveal)`, persists the witness under `pob:realdeal:play:{matchId}` for later resolveChallenge. |
| `acceptClaim` | ✅ wired | Just `(matchId, currentTime)`. |
| `challengeClaim` | ✅ wired | Just `(matchId, currentTime)`. |
| `resolveChallenge` | ✅ wired | **The ZK showcase.** Loads the persisted `PlayRevealWitness`, stages it via `setPendingReveal(...)`, calls the circuit, returns `{ honest: boolean }`. The witness never leaves the circuit; only the boolean outcome is disclosed. |
| `cancelUnjoinedMatch` | ✅ wired | Player One refund if no Player Two ever joins. |
| `forfeitAbandonedMatch` | ✅ wired | Defaults to a 24h timeout. |
| `forfeitStalledChallenge` | ✅ wired | Defaults to a 1h timeout. |
| `claimPayout` | ✅ wired | Winner pulls the shielded pot. |
| `getMatch` / `getMatchPhase` / `getWinner` | ✅ wired | Read-only views via the indexer. |

Two off-chain helpers exposed for the React layer:

- `importEntropy(matchId, role, entropyHex)` — paste an opponent's entropy hex into your localStorage so `revealSeed` can find it.
- `setPendingReveal(reveal) / clearPendingReveal()` — manual witness staging, only needed if you bypass `gameProvider.resolveChallenge()`.

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
