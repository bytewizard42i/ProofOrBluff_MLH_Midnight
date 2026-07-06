# Proof or Bluff — realDeal App

The Midnight-backed sibling of the demoLand Vite app. Same UI, but the
in-memory engine is progressively swapped for `proof-or-bluff.compact`
contract calls over a local Midnight stack.

## Quick start

```bash
# 1. Compile the Compact contract → TS bindings + zkir
#    (Only needed after a contract edit; output is git-tracked.)
export PATH=/home/js/.compact/versions/0.31.0/x86_64-unknown-linux-musl:$PATH
compactc --skip-zk \
  ../contracts/proof-or-bluff.compact \
  ../contracts/managed/proof-or-bluff/

# 2. Symlink the compactc output into public/ so Vite serves the zkir files
mkdir -p public/managed
ln -sf ../../contracts/managed/proof-or-bluff public/managed/proof-or-bluff

# 3. Install + run
npm install
npm start                     # http://localhost:3016
```

## Local stack expectations

The app's defaults assume the local Midnight stack is running. Start it
once per machine:

```bash
cd /home/js/utils_Midnight/midnight-local-dev
docker compose -f standalone.yml up -d
```

Endpoints (configurable via Vite env vars):

| Service | URL |
|---|---|
| Node RPC | `http://localhost:9944` |
| Indexer GraphQL | `http://localhost:8088/api/v3/graphql` |
| Proof server | `http://localhost:6300` |

## Wallet

Install **Lace** (or the 1AM extension). In the wallet's settings:

1. Switch the network to **Undeployed**.
2. Confirm the URLs above are what the wallet targets — they should be
   the default for Undeployed.
3. Fund a test address via the local-dev funding CLI:
   ```bash
   cd /home/js/utils_Midnight/midnight-local-dev && npm start
   # menu option [1] for accounts from a config file with NIGHT + DUST
   ```

Once funded, click **Connect Lace / 1AM** in the realDeal header.

## Phase 1 vs Phase 2

| Capability | Phase 1 | Phase 2 (current) |
|---|---|---|
| Vite app boots at :3016 | ✅ | — |
| Wallet detection + connect | ✅ | — |
| Compact bindings imported | ✅ | — |
| `createMatch` on-chain | ✅ | — |
| `joinMatch` … `claimPayout` | 🟡 stubbed | ✅ all wired |
| Indexer-driven game state | 🟡 stubbed | ✅ getMatch/getMatchPhase/getWinner |
| AI opponent | ❌ removed | realDeal is PvP only |
| ZK proof on challenge | 🟡 stubbed | ✅ resolveChallenge with witness staging |
| claimWinnings (wager provider) | 🟡 stub | ✅ wired to claimPayout |

## Directory map

```
realDeal/
├── contracts/
│   ├── proof-or-bluff.compact         # source
│   ├── proof-or-bluff.escrow.test.js  # vitest regression
│   └── managed/proof-or-bluff/        # compactc output
└── app/                               # this Vite app
    ├── public/
    │   └── managed/ → ../../contracts/managed   # symlink for zkir hosting
    └── src/
        ├── App.jsx                    # demoLand UI + RealDealHeader
        ├── RealDealHeader.jsx         # wallet connect + createMatch button
        ├── game/                      # local engine (used until Phase 2 swaps in contract calls)
        ├── midnight/
        │   ├── config.js              # endpoints + persisted contract address
        │   ├── wallet.js              # DApp Connector bridge (Lace / 1AM)
        │   ├── contract.js            # contract instance + circuit wrappers
        │   └── README.md
        └── providers/realdeal/
            ├── gameProvider.js        # IGameProvider via midnight/contract.js
            ├── aiProvider.js          # throws — realDeal is PvP only
            └── wagerProvider.js       # IWagerProvider via midnight/wallet.js
```

## Why a sibling app, not a unified app with a mode toggle?

We chose silos over a mode switch so:
- demoLand keeps running unchanged on port 3015 for offline demos.
- realDeal can ship breaking dependency changes (midnight-js, wallet SDK)
  without risking the demoLand build.
- Two separate Vite configs make port + env separation trivial.

If we ever want to unify, the `providers/` factory in
`demoLand/src/providers/index.js` already has a `realdeal` branch wired
in (currently throws "not implemented"). Swap that branch to import
`realDeal/app/src/providers/realdeal/gameProvider.js` and the existing
demoLand UI works in realDeal mode automatically.
