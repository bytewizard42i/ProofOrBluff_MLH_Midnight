# Proof or Bluff — Judge Guide

Welcome! This page is the **single source of truth** for running the
demo end-to-end. If anything doesn't match what you see on screen, file
an issue or message the team — this doc is the contract.

---

## 🚀 One-Command Demo

If you have **Docker** and **Node.js 18+** installed and have cloned
[`midnight-local-dev`](https://github.com/midnightntwrk/midnight-local-dev)
in any of these paths:

- `/home/js/utils_Midnight/midnight-local-dev` (default for the team's machines)
- A sibling folder next to this repo (`../midnight-local-dev`)
- `../utils_Midnight/midnight-local-dev`

…then the entire demo is one command:

```bash
./judge-demo.sh
```

That script:

1. Checks Docker is installed and running
2. Locates `midnight-local-dev` (tries the three paths above)
3. Starts the local Midnight stack (node + indexer + proof-server)
   — or **skips this step if already healthy** (idempotent)
4. Waits up to 60 seconds for everything to go healthy
5. Smoke-tests four endpoints and prints `✓` / `!` for each
6. Installs the browser app's npm deps if missing
7. Starts the realDeal Vite dev server on port `3016`
8. Opens `http://localhost:3016` in your default browser

Stop the **app** with `Ctrl+C`. The local stack stays up between runs
so subsequent launches are faster. Stop the **stack** completely with:

```bash
docker compose -f /path/to/midnight-local-dev/standalone.yml down
```

---

## What You Should See

When the script succeeds you'll see colored output like:

```
▸ [1/5] Checking Docker is available
  ✓ Docker is installed and running
▸ [2/5] Locating midnight-local-dev
  ✓ Found at: /home/js/utils_Midnight/midnight-local-dev
▸ [3/5] Starting local Midnight stack (node + indexer + proof-server)
  waiting for healthy....... — ready in 13s
▸ [4/5] Smoke-testing the endpoints
  ✓ node          (9944 JSON-RPC)  (HTTP 200)
  ✓ node /health  (9944)           (HTTP 200)
  ✓ proof-server  (6300 /health)   (HTTP 200)
  ✓ indexer       (8088 internal)  (healthy)
▸ [5/5] Starting the realDeal browser app
```

Then Vite takes over, and your browser opens to `http://localhost:3016`.

---

## What Each Service Does (in one line)

| Service | Port | Role |
|---|---|---|
| **midnight-node** | `9944` | The blockchain — produces a block every ~2s |
| **midnight-indexer** | `8088` | GraphQL API that watches the node and exposes "what happened?" queries |
| **midnight-proof-server** | `6300` | Generates the ZK proofs the contract needs before transactions can be submitted |
| **POB realDeal app** | `3016` | The browser DApp you actually play |

---

## Health Checks — Cheat Sheet

| Question | How to ask | What "healthy" looks like |
|---|---|---|
| Is anything running at all? | `docker ps --filter name=midnight` | Three rows, two with `(healthy)`, one (proof-server) just `Up …` |
| Is the node alive? | Open `http://localhost:9944/health` in a browser | `{"peers":0,"isSyncing":false,"shouldHavePeers":false}` |
| Is the proof-server alive? | Open `http://localhost:6300/health` | `{"status":"ok","timestamp":"2026-…"}` (timestamp changes each request) |
| Is the indexer alive? | `docker inspect --format '{{.State.Health.Status}}' midnight-indexer` | `healthy` |
| What block is the chain on? | (curl + JSON-RPC — see below) | A new block number every 2 seconds |

---

## Pages That **Look** Broken But Aren't

Some ports return what looks like an error when you open them in a browser.
That's because they're **not webpages** — they're protocol endpoints that
the SDK speaks for you. In particular:

| URL | What you'll see | Should I worry? |
|---|---|---|
| `http://localhost:3016/` | The POB game UI | ✅ This is the only URL you ever need to type |
| `http://localhost:9944/` | `Used HTTP Method is not allowed. POST is required` | ❌ No — the node is alive and rejecting GETs (correct) |
| `http://localhost:9944/health` | `{"peers":0,…}` | ✅ Healthy |
| `http://localhost:6300/health` | `{"status":"ok","timestamp":…}` | ✅ Healthy |
| `http://localhost:8088/` | `This localhost page can't be found` (404) | ❌ No — indexer doesn't serve a webpage; check Docker health instead |

The `POST is required` message is the node correctly saying "I only
answer structured JSON-RPC questions." The `404` from the indexer is
the indexer correctly saying "I'm a GraphQL API, not a website." The
SDK knows the right paths and verbs for both.

---

## Working Copy-Pasteable Queries

If you want to manually poke the node:

```bash
# Node version (should match the docker image tag)
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"system_version","params":[]}' \
  http://localhost:9944/

# Node's name (just a sanity ping)
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"system_name","params":[]}' \
  http://localhost:9944/

# Latest block (result.number is hex — 0x1f = 31, etc.)
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"chain_getHeader","params":[]}' \
  http://localhost:9944/
```

Run any of these twice with a few seconds between — the block number
should grow. That's the chain producing blocks.

---

## In-App Hints During the Demo

Once the browser app opens at `http://localhost:3016`:

- **Right side / floating panel**: 🔐 **Proof Server** — a live feed
  of `docker logs midnight-proof-server`. When you trigger any
  on-chain action (createMatch, playCards, resolveChallenge…) you'll
  see lines like `POST /prove HTTP/1.1; took 4.4s` and `proof ok`
  land in real time. That's the ZK proof being generated locally.
  - The panel is **draggable** (header) and **resizable** (edges
    and bottom-right corner). Position and size persist in
    localStorage.
  - Use the buttons in the panel header to pause polling, reset
    layout, or hide it.

- **Left side**: Game Log — narrates every move in the round.

- **Wallet**: connect Lace (when prompted by the app). Local-stack
  test mnemonics are committed in `realDeal/cli/.env` if you want to
  drive flows from the CLI side as well.

---

## When Something Doesn't Look Right

| Symptom | Likely cause | Fix |
|---|---|---|
| `judge-demo.sh` says Docker isn't running | Docker Desktop / Docker Engine not started | Start Docker, then re-run the script |
| `Could not find midnight-local-dev` | Repo wasn't cloned next to this one | `git clone https://github.com/midnightntwrk/midnight-local-dev.git ../midnight-local-dev` |
| Stack doesn't go healthy in 60s | Old containers stuck, port conflicts | `docker compose -f .../standalone.yml down` then re-run script |
| Browser shows "page can't be reached" on `:3016` | Vite hasn't started yet | Wait a few more seconds; if it persists, check the terminal where you ran the script for an error |
| Proof Server panel shows `proof-server unreachable` | Docker stopped while app was running | Bring the stack back up (`up -d`), the panel will reconnect on its next poll |

---

## Deeper Reference

For the full local-dev deep dive (seeds, accounts, funding flows,
wallet/SDK matrix), see
[`realDeal/docs/LOCAL_DEV_GUIDE.md`](realDeal/docs/LOCAL_DEV_GUIDE.md).
That's the developer's reference. This page is the demo runner's
reference.

---

*Last updated alongside `judge-demo.sh` — if you find a mismatch, the
script is the source of truth.*
