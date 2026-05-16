# realDeal CLI — `pob-cli`

Headless Node CLI for the realDeal Compact contract. Drives every
circuit from the terminal using a seed-phrase wallet, so the wiring
can be exercised without firing up a browser.

## Why a CLI in addition to the browser app

Both surfaces (CLI and `realDeal/app/`) talk to the **same on-chain
contract** through the **same indexer + proof server**. The browser
uses a Lace / 1AM DApp Connector wallet; the CLI uses a headless
seed-phrase wallet. Anything one surface does is visible to the other
on-chain, which means:

- **Reproducible testing.** Scripted commands beat clicking through
  Lace popups.
- **Two-player demos from one machine.** Run two CLIs in two
  terminals (`--player p1` and `--player p2`), or pair a CLI with the
  browser, no incognito profile gymnastics.
- **CI / smoke-test friendly.** `npm run e2e` (when wired) can
  exercise the full match lifecycle.

## Setup

```bash
cd realDeal/cli
npm install
cp .env.example .env
# Edit .env: set POB_SEED_P1 / POB_SEED_P2 to two distinct 64-char hex
# strings. POB_SEED_GENESIS is pre-set to the local stack's pre-funded
# wallet for "undeployed" mode.
```

Generate fresh seeds:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Make sure the local Midnight stack is running:

```bash
cd /home/js/utils_Midnight/midnight-local-dev
docker compose -f standalone.yml up -d
```

## Usage

Invoke commands via `npm run cli -- <command> [flags]`:

```bash
# Player One creates a match (mode 1 = STANDARD, wager 5 native tokens)
npm run cli -- create-match --player p1 --mode 1 --wager 5
# → matchId: 0x..., entropy: 0x..., txHash: 0x...

# Player Two joins
npm run cli -- join-match --player p2 --match 0xMATCHID --wager 5
# → entropy: 0x...

# Each side imports the OTHER side's entropy hex (paste from above output)
npm run cli -- import-entropy --player p1 --role p2 --hex 0xP2ENT
npm run cli -- import-entropy --player p2 --role p1 --hex 0xP1ENT

# Either side reveals the seed
npm run cli -- reveal-seed --player p1

# Player One plays (real cards: 2,2,2; claim: rank 2; honest!)
npm run cli -- play --player p1 --cards 2,2,2 --rank 2

# Player Two accepts the claim
npm run cli -- accept --player p2

# Or — Player Two challenges...
npm run cli -- challenge --player p2

# ...and Player One resolves (must be the SAME surface that called
# play, since the play witness is in their .pob-state/)
npm run cli -- resolve --player p1
# → "claim was HONEST ✓" or "A BLUFF ✗"

# Winner pulls the pot
npm run cli -- claim-payout --player p1

# Inspect public match state at any time
npm run cli -- state --player p1
```

## Cross-surface usage (CLI ↔ browser)

Both surfaces persist contract state independently:

- **Browser**: `localStorage` (per origin)
- **CLI**: `.pob-state/` directory in cwd

To talk to the same deployed contract:

1. Whichever surface deploys first wins.
   ```bash
   pob-cli address
   # → mn_addr_test1qq...
   ```
2. In the **browser console** (DevTools, on the realDeal app):
   ```js
   localStorage.setItem('pob:realdeal:contract-address', 'mn_addr_test1qq...')
   location.reload()
   ```
3. From now on, both surfaces hit the same contract instance.

> **TODO Phase 3**: replace this manual handshake with auto-sync via
> `realDeal/app/public/contract-state.json` written by the CLI and
> fetched by the browser at boot. Captured in `realDeal/docs/`.

## Networks

The same CLI works against the local stack or pre-prod by flipping
`POB_NETWORK_ID` and the endpoint env vars. Each network has its own
contract slot in `.pob-state/<network>/contract.json`, so switching
between local and pre-prod doesn't accidentally cross wires.

## Where the bindings come from

The CLI dynamically imports
`../contracts/managed/proof-or-bluff/contract/index.js` (overridable
via `POB_MANAGED_DIR`). To regenerate after a contract change:

```bash
export PATH=/home/js/.compact/versions/0.31.0/x86_64-unknown-linux-musl:$PATH
cd ..
compactc proof-or-bluff.compact contracts/managed/proof-or-bluff/
```

## Status

Phase 2a — initial scaffold. Once two-player end-to-end is verified
against the local stack, this README will get an "✅ verified on local
stack on YYYY-MM-DD" stamp.
