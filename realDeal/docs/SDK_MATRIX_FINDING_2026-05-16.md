# SDK Matrix Mismatch — Finding from May 16, 2026

**Status**: blocking. POB cannot fire a real transaction against either
the local stack OR pre-prod until resolved. **No code changes have
been made in response to this finding** — the broken state is captured
here so we can decide on the upgrade path with a clear head.

## What happened

While running the first end-to-end CLI smoke test (`pob-cli
create-match` against the local stack at `localhost:9944` /
`localhost:8088` / `localhost:6300`), the wallet built successfully
from the genesis seed but failed to sync, with two cascading errors:

1. **GraphQL schema rejection** from the indexer:
   ```
   Server Error: Unknown field "wallet" on type "Subscription".
   Unknown type "ProgressUpdate" at line 1 and column 110
   Unknown type "ViewingUpdate" at line 1 and column 194
   Unknown type "MerkleTreeCollapsedUpdate" at line 1 and column 239
   Unknown field "applyStage" on type "RegularTransaction".
   ```
2. **New required parameter** from the level private state provider:
   ```
   privateStoragePasswordProvider is required.
   Provide a function that returns a strong, secret password
   (minimum 16 characters).
   ```

Both errors point at the same root cause: **POB's pinned SDK matrix
is older than what the current local stack speaks**.

## Version evidence

| Component | Running on local stack (`midnight-local-dev-johns-copy/standalone.yml`) | What POB uses (`realDeal/app/package.json` + `realDeal/cli/package.json`) |
|---|---|---|
| `proof-server` | `midnightntwrk/proof-server:8.0.3` | (compatible with 4.x) |
| `indexer-standalone` | `midnightntwrk/indexer-standalone:4.0.1` | (expects 3.x schema) |
| `midnight-node` | `midnightntwrk/midnight-node:0.22.3` | (compatible with 0.18.x) |
| `@midnight-ntwrk/ledger` | **v8** (per local-dev's `ledger-v8: 8.0.3`) | `v4.0.0` |
| Wallet API | new `wallet-sdk-*` family (`facade`, `shielded`, `unshielded`, `dust`) | legacy `@midnight-ntwrk/wallet@5.0.0` |
| `midnight-js-network-id` | `4.0.2` | `4.0.4` |

The local-dev fork's `package.json` shows the canonical new stack:

```json
"@midnight-ntwrk/ledger-v8": "8.0.3",
"@midnight-ntwrk/midnight-js-network-id": "4.0.2",
"@midnight-ntwrk/wallet-sdk-abstractions": "2.0.0",
"@midnight-ntwrk/wallet-sdk-address-format": "3.1.0",
"@midnight-ntwrk/wallet-sdk-dust-wallet": "3.0.0",
"@midnight-ntwrk/wallet-sdk-facade": "3.0.0",
"@midnight-ntwrk/wallet-sdk-hd": "3.0.1",
"@midnight-ntwrk/wallet-sdk-shielded": "2.1.0",
"@midnight-ntwrk/wallet-sdk-unshielded-wallet": "2.1.0"
```

## This also explains pre-prod

Pre-prod (`testnet-02`) is presumably on the same new stack as the
local one. Our app code talks the old protocol to it, which is why
John flagged "pre-prod is not working" — it isn't pre-prod that's
broken; it's our compatibility surface.

## The three options

### A. Roll the local stack back to match our pins (~30 min)
- Edit a copy of `standalone.yml` to use older `proof-server` /
  `indexer-standalone` / `midnight-node` images compatible with
  ledger 4.x.
- **Diverges from `midnight-local-dev-johns-copy` source-of-truth**.
- Pre-prod will still be unreachable.
- Buys local testing tonight, not a real fix.

### B. Forward-upgrade POB to the new SDK matrix (~3-6 hours)
- Bump `@midnight-ntwrk/ledger` 4.0.0 → v8.x.
- Replace `@midnight-ntwrk/wallet@5.0.0` with the new
  `@midnight-ntwrk/wallet-sdk-*` family (facade, shielded,
  unshielded, dust, abstractions).
- Update `midnight-js-*` providers — many APIs changed
  (`privateStoragePasswordProvider`, possibly `Coin` type,
  possibly the `setPendingReveal` witness staging shape).
- Recompile the contract with whatever `compactc` the new ledger
  expects (likely 0.32 or 0.33).
- Re-test browser app's contract.js end-to-end.
- Re-test CLI end-to-end.
- **Aligns POB with both local and pre-prod.**
- Touches every file under `realDeal/`. Multi-session work.

### C. Side-by-side: keep current code, build a v8 branch (~30 min to start)
- `git checkout -b sdk-v8-upgrade` and do B in isolation.
- `main` stays at the v4 matrix as a known-broken baseline.
- Lower risk because we never break a working state we have.

## Recommended path

**C, then B.** Specifically:

1. Tonight: stop. Don't make code changes against the broken main.
2. Next session: branch `sdk-v8-upgrade`. In that branch:
   - Bump `realDeal/app/package.json` and `realDeal/cli/package.json`
     to the new matrix (cribbed from
     `midnight-local-dev-johns-copy/package.json`).
   - Recompile `proof-or-bluff.compact` with the matching `compactc`
     (check `midnight-get-version-info` MCP for current).
   - Update `realDeal/app/src/midnight/contract.js` and
     `realDeal/cli/src/contract.js` for any provider signature
     changes (esp. `privateStoragePasswordProvider`).
   - Update `realDeal/cli/src/wallet-node.js` to use the
     wallet-sdk-facade pattern instead of WalletBuilder.
   - Re-run the CLI smoke test until `create-match` lands a real tx.
3. Once the branch is green, merge → main. Pre-prod and local both
   work from then on.

## What's NOT broken

The wiring logic itself is correct — the wallet built, the address
derived properly, the `setNetworkId` fix from the same session was
correct, the contract bindings load fine. The mismatch is purely at
the protocol/transport boundary. The Phase 2 game-loop methods will
likely all work as-is once the wallet/ledger/indexer versions align.

## What was committed before stopping

- `realDeal/cli/` Phase 2a CLI scaffold (commit `bb13c6c`).
- Network-id type-alias fix in both surfaces (same commit).
- `midnight-local-dev-johns-copy` reference submodule
  (DIDzMonolith commit `d61afb9`).
- Sisters global rule clarification (`PixyPi` commit `d73e827`).
- Sync-wait helper in `wallet-node.js` (uncommitted, see
  `git diff realDeal/cli/src/wallet-node.js`). Safe to commit
  but will need rewrite during the v8 upgrade.

## Files to reference during the upgrade

- `/home/js/DIDzMonolith/midnight-local-dev-johns-copy/src/index.ts` —
  the canonical example of how to build a wallet + interact with the
  new stack. Mirrors what our `wallet-node.js` should look like.
- `/home/js/DIDzMonolith/midnight-local-dev-johns-copy/package.json` —
  exact version pins to copy.
- The Midnight MCP `midnight-get-version-info` and
  `midnight-search-typescript` tools — for catching API shape
  changes before they bite.
