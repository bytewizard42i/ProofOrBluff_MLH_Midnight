# Local Dev Environment — Single Source of Truth for POB

> **Pre-prod is currently broken.** Per the chat from Midnight team
> members and 1AM team on May 16, 2026, the canonical development
> target is now the local stack defined by
> [`midnightntwrk/midnight-local-dev`](https://github.com/midnightntwrk/midnight-local-dev)
> (mirrored as a reference submodule at
> `/home/js/DIDzMonolith/midnight-local-dev-johns-copy/`).
>
> **POB targets `undeployed` only.** Every example, command, and seed
> in this doc is for the local stack. Pre-prod / mainnet are out of
> scope until they are stable again.

This doc captures **everything from the official local-dev README** so
you don't have to context-switch into another repo while building POB.

---

## TL;DR — Spin up the stack

```bash
# Start once (long-running)
cd /home/js/utils_Midnight/midnight-local-dev
docker compose -f standalone.yml up -d

# OR, if you want the funding CLI's interactive menu:
cd /home/js/utils_Midnight/midnight-local-dev
npm install                # only first time
npm start                  # menu: fund accounts, check balances, exit
```

```bash
# Stop everything
cd /home/js/utils_Midnight/midnight-local-dev
docker compose -f standalone.yml down
```

```bash
# Health check
curl http://localhost:9944/health        # node — should return some JSON
curl http://localhost:6300/version        # proof server
docker ps --filter name=midnight          # all three should be running
```

---

## Why all the seeds in this repo are committed in plain text

The local stack is a **fake blockchain that only exists on your laptop
or in CI**. There is no real money on it, no real users, no
adversaries. Every seed below is well-known and reproducible across
every developer who runs the stack.

We **deliberately commit these seeds** to the repo. That:

- Makes onboarding a one-line `npm install`
- Makes regression tests deterministic (the same seed always derives
  the same addresses, the same UTXO set, the same DUST)
- Avoids the "everyone reinvents their own .env" tax

**Never use these seeds on pre-prod or mainnet.** Generate fresh ones
with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
when you eventually move off local. There is a placeholder in
`.env.example` for that — but for now, the committed `.env` file IS the
source of truth for local-dev seeds.

---

## Network services

The stack is three containers on fixed ports. These ports match what
**Lace** and **1AM** expect for the `undeployed` network out of the box —
no custom endpoint config needed in either wallet.

| Service | Container | Host port | URL |
|---|---|---|---|
| **Midnight Node** | `midnight-node` | `9944` | `http://localhost:9944` |
| **Indexer** (GraphQL HTTP) | `midnight-indexer` | `8088` | `http://localhost:8088/api/v3/graphql` |
| **Indexer** (GraphQL WS) | `midnight-indexer` | `8088` | `ws://localhost:8088/api/v3/graphql/ws` |
| **Proof Server** | `midnight-proof-server` | `6300` | `http://localhost:6300` |

All services use the `undeployed` network ID with the `dev` node preset.

### Docker images (pinned in `standalone.yml`)

| Service | Image | Version |
|---|---|---|
| Node | `midnightntwrk/midnight-node` | `0.22.3` |
| Indexer | `midnightntwrk/indexer-standalone` | `4.0.1` |
| Proof Server | `midnightntwrk/proof-server` | `8.0.3` |

The node uses sidechain block beneficiary
`04bcf7ad3be7a5c790460be82a713af570f22e0f801f6659ab8e84a52be6969e`
(hardcoded in `standalone.yml`).

### Wallet SDK compatibility matrix

POB is pinned to match this matrix exactly. See
`realDeal/app/package.json` and `realDeal/cli/package.json`.

| Package | Version |
|---|---|
| `@midnight-ntwrk/wallet-sdk-facade` | 3.0.0 |
| `@midnight-ntwrk/wallet-sdk-abstractions` | 2.0.0 |
| `@midnight-ntwrk/wallet-sdk-shielded` | 2.1.0 |
| `@midnight-ntwrk/wallet-sdk-dust-wallet` | 3.0.0 |
| `@midnight-ntwrk/wallet-sdk-unshielded-wallet` | 2.1.0 |
| `@midnight-ntwrk/wallet-sdk-address-format` | 3.1.0 |
| `@midnight-ntwrk/wallet-sdk-hd` | 3.0.1 |
| `@midnight-ntwrk/ledger-v8` | 8.0.3 |
| `@midnight-ntwrk/midnight-js-network-id` | 4.0.2 |
| `@midnight-ntwrk/midnight-js` (umbrella) | 4.0.4 |
| `@midnight-ntwrk/compact-js` (CompiledContract wrapper) | 2.5.0 |

---

## Seeds and accounts (all public, all committed)

### Genesis master wallet

The genesis block mints all NIGHT to a single wallet derived from this
seed. It is the canonical "test minter" for the local stack.

```text
Hex seed: 0000000000000000000000000000000000000000000000000000000000000001
```

Verified balances after a fresh `docker compose up` and one wallet
sync (May 16, 2026):

```text
Unshielded NIGHT: 250,000,000,000,000  (250K NIGHT in raw units)
Shielded   NIGHT: 250,000,000,000,000
DUST:             1,250,000,000,000,000,000,000,000  (registered automatically)
Address:          mn_addr_undeployed1h3ssm5ru2t6eqy4g3she78zlxn96e36ms6pq996aduvmateh9p9sk96u7s
```

**Use this seed for:** single-player tests, contract deploys, any test
where you don't need two distinct wallets.

### Test mnemonics (Alice & Bob) from `accounts.example.json`

The local-dev project ships these BIP39 mnemonics as the canonical
test recipients. They are well-known throughout the Bitcoin / Web3
ecosystem and exist solely so tests can be reproducible.

| Name | Mnemonic |
|---|---|
| **Alice** | `abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art` |
| **Bob** | `zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo zoo vote` |

**Use these for:** two-player POB tests where the contract requires
distinct signers (e.g. `joinMatch` must come from a wallet other than
the one that called `createMatch`).

To fund them: run `npm start` in `midnight-local-dev`, choose **option
1**, point at `accounts.example.json`. Each gets 50,000 NIGHT + DUST
auto-registered. Now they're ready to call any circuit.

### The POB CLI's seeds (committed in `.env`)

Our CLI uses raw 32-byte hex seeds (not mnemonics) because that's the
shape `WalletBuilder`/`HDWallet.fromSeed` accepts directly. We
publish three:

| Env var | Seed (hex) | Purpose |
|---|---|---|
| `POB_SEED_GENESIS` | `0x00…01` | Same as the local-dev master wallet |
| `POB_SEED_P1` | `0x00…02` | Player One in 2-player tests |
| `POB_SEED_P2` | `0x00…03` | Player Two in 2-player tests |

P1 and P2 are NOT the BIP39-derived seeds for Alice and Bob — they're
distinct fixed hex seeds local to this repo. To fund P1 and P2:

```bash
# 1. Get their addresses (no tx, just derives from seed):
cd realDeal/cli
node src/cli.js derive --player p1   # prints unshielded bech32 address
node src/cli.js derive --player p2   # ditto

# 2. Fund both via the local-dev CLI:
cd /home/js/utils_Midnight/midnight-local-dev
npm start
# Choose option [2] — Fund by public key
# Paste both addresses comma-separated
# Each receives 50,000 NIGHT
# Then back in the POB CLI:
cd /home/js/utils_Midnight/midnight-local-dev/../../DIDzMonolith/ProofOrBluff_MLH_Midnight/realDeal/cli
node src/cli.js create-match --player p1 ...   # P1 wallet auto-registers DUST on first sync
```

> **Note:** option 2 funds NIGHT only — DUST is registered by the
> recipient on first wallet startup. Our `pob-cli` does this
> automatically the first time it sees unregistered NIGHT UTXOs.

---

## NIGHT vs DUST — read this once, never get confused again

| Token | What it is | How you get it |
|---|---|---|
| **NIGHT** | The native value-bearing token. Has unshielded (public) and shielded (private) forms. Players' wagers in POB are denominated in NIGHT. | The genesis block mints a large supply to the master wallet. Funding CLI distributes it to test accounts. |
| **DUST** | Pays transaction fees. Cannot be transferred directly between wallets. Generated **automatically** from registered NIGHT UTXOs over time. | Each NIGHT UTXO must be **registered for DUST generation** via a one-shot bootstrap tx. After that, DUST accrues passively. |

**Critical implication:** a wallet with NIGHT but no DUST cannot
submit transactions. The first thing any newly-funded wallet must do
is `registerNightUtxosForDustGeneration` — `pob-cli` does this in
`buildWalletFromSeed` automatically.

---

## Funding flow architecture (what `npm start` does in midnight-local-dev)

```text
1. Network detection
   ├── Check if midnight-{node,indexer,proof-server} are running
   ├── If running → prompt: reuse OR restart fresh
   └── If not running → docker compose up
       ├── node    starts (waits for /health endpoint)
       ├── indexer starts (waits for "starting indexing" log)
       └── proof   starts (waits for "Actix runtime found" log)

2. Master wallet init (WalletFacade.init)
   ├── Derive HD wallet from genesis seed (0x00…001)
   ├── Compose three sub-wallets: Shielded + Unshielded + Dust
   ├── Start the facade and wait for sync
   └── Display NIGHT balance

3. DUST registration for master wallet
   ├── Find unregistered NIGHT UTXOs
   ├── Submit registration tx
   └── Wait for dust balance > 0

4. Interactive menu:
   [1] Fund accounts from config file (NIGHT + auto DUST register)
   [2] Fund accounts by public key  (NIGHT only — DUST registered later)
   [3] Display master wallet balances
   [4] Exit

5. Cleanup on Ctrl+C / [4] Exit
   ├── Close all wallet connections
   └── docker compose down (only if started by this session;
       reusing an existing network leaves containers running)
```

---

## Connecting POB to the local stack

POB connects via the standard localhost endpoints — no special config.

### CLI (`realDeal/cli/`)

```bash
cp .env.example .env       # already pre-filled with public test seeds
npm install
node src/cli.js create-match --player genesis --mode 1 --wager 5
```

### Browser (`realDeal/app/`)

The Vite dev server reads the same env vars (with `VITE_` prefix where
required). Default endpoints in `src/midnight/config.js` already point
at `localhost:{9944, 8088, 6300}` and `setNetworkId('undeployed')`.

```bash
cd realDeal/app
npm install
npm run dev   # serves at http://localhost:3016
```

Open in a browser, click **Connect Wallet**. Lace and 1AM both auto-detect
the local stack when set to "Undeployed" mode.

### Lace setup for local

1. Install Lace from <https://www.lace.io>.
2. Open Lace → Settings → Network → switch to **Undeployed**.
3. The wallet auto-points at `localhost:{9944, 8088, 6300}`.
4. To get test NIGHT: copy your shielded address, then run the
   local-dev CLI's "Fund by public key" option and paste it.

### 1AM setup for local

Per IslandGhostStephanie [1AM] in chat (May 16, 2026): 1AM is a
drop-in replacement for Lace and avoids local-proof-server pain by
offering a hosted proof server option in its settings. For our
purposes the in-browser proof server should work fine, but if the
local proof server starts misbehaving, switching to 1AM's hosted
option may unblock you. Docs: <https://1am.xyz/developers#quick-start>.

---

## Troubleshooting (from the official README + our experience)

### Port already in use

```text
Error: Bind for 0.0.0.0:9944 failed: port is already allocated
```

Stop the offender:

```bash
docker compose -f standalone.yml down
# Or find the process and kill it:
lsof -i :9944
```

### Containers not starting

Pull fresh images, watch logs:

```bash
docker compose -f standalone.yml pull
docker compose -f standalone.yml logs -f node
docker compose -f standalone.yml logs -f indexer
docker compose -f standalone.yml logs -f proof-server
```

### Wallet sync takes too long

The indexer needs time to catch up after node startup. Check:

```bash
docker compose -f standalone.yml logs -f indexer
curl http://localhost:9944/health
```

Set `DEBUG_LEVEL=debug` in the local-dev `.env` for more detailed
wallet logs.

### DUST registration fails

Usually transient. Check:

1. Wallet has non-zero NIGHT balance
2. Proof server healthy: `curl http://localhost:6300/version`
3. Retry — startup races sometimes break the first attempt

### POB-specific: `Unknown field "wallet" on type "Subscription"`

You're running an OLD POB SDK pin against the NEW local stack. The
fix: check `realDeal/{app,cli}/package.json` against the matrix in
the [Wallet SDK compatibility matrix](#wallet-sdk-compatibility-matrix)
section above. Both files should now use:

- `@midnight-ntwrk/ledger-v8` (not `@midnight-ntwrk/ledger`)
- The `@midnight-ntwrk/wallet-sdk-*` family (not `@midnight-ntwrk/wallet`)
- `@midnight-ntwrk/compact-js` for the `CompiledContract` wrapper

### POB-specific: `privateStoragePasswordProvider is required`

`levelPrivateStateProvider` v4.0.4 requires both `accountId` and
`privateStoragePasswordProvider`. We derive a strong password from
the wallet's coin public key automatically — see
`realDeal/cli/src/contract.js` `createWalletAndMidnightProvider`.

### POB-specific: `expected ShieldedCoinInfo.color: Bytes<32> but received string`

`ledger.nativeToken().raw` returns a hex **string** (used as a
balance-map key). For an on-chain `ShieldedCoinInfo.color` you need
**bytes** — convert via `hexToBytes(ledger.nativeToken().raw)`.

### POB-specific: `Failed to clone intent` during balanceTx

The wallet SDK's `signRecipe` hardcodes `'pre-proof'` when cloning
intents, but proven `UnboundTransaction` intents have `'proof'` data.
This causes a clone failure deep in the SDK. The workaround
(per `example-counter` v2.1.1, mirrored in
`realDeal/cli/src/contract.js`) is to sign manually with the correct
proof markers via a `signTransactionIntents` helper.

---

## File map (for navigating the local-dev fork)

```text
midnight-local-dev-johns-copy/
├── README.md                 — official docs, mostly mirrored above
├── package.json              — the canonical SDK matrix
├── standalone.yml            — Docker compose for the 3 services
├── standalone.env.example    — env vars consumed by the indexer
├── accounts.example.json     — Alice + Bob mnemonics
└── src/
    ├── index.ts              — entry point + interactive menu
    ├── network.ts            — Docker compose orchestration
    ├── wallet.ts             — Wallet SDK init + sync + DUST register
    ├── funding.ts            — NIGHT transfer + recipient setup
    ├── config.ts             — endpoint URLs
    └── logger.ts             — pino setup
```

When debugging "how does the canonical pattern actually work", read
those files in order — they're the source of truth.

---

## Last verified

**May 16, 2026, 8:01 PM EDT.**

Verified end-to-end on the local stack:

- Stack pulls cleanly via `docker compose pull`
- All three services healthy
- POB CLI deploys the realDeal contract (`createMatch` lands a real
  on-chain tx, wager deducted from shielded NIGHT)

If something stops working in the future, first check whether the
SDK matrix above has shifted — that's been the source of every blocker
so far in May 2026.
