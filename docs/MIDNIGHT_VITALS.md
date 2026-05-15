<p align="center">
  <strong>🩺 MIDNIGHT VITALS — Diagnostics & Troubleshooting 🩺</strong><br/>
  <em>Real-Time Health Monitoring for Proof or Bluff's Midnight Infrastructure</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Component-Proof_Server-blue" alt="Proof Server"/>
  <img src="https://img.shields.io/badge/Component-RPC_Node-green" alt="RPC"/>
  <img src="https://img.shields.io/badge/Component-Indexer-orange" alt="Indexer"/>
  <img src="https://img.shields.io/badge/Component-Lace_Wallet-purple" alt="Wallet"/>
  <img src="https://img.shields.io/badge/Status-Active-brightgreen" alt="Status"/>
</p>

---

> *"Before you bluff, make sure the table is ready."*

---

# Table of Contents

- [Overview](#overview)
- [Quick Health Check](#quick-health-check)
- [Component Reference](#component-reference)
- [Troubleshooting Guide](#troubleshooting-guide)
- [Startup Checklist](#startup-checklist)
- [Environment Configuration](#environment-configuration)
- [Vitals API Reference](#vitals-api-reference)
- [Known Issues & Workarounds](#known-issues--workarounds)
- [Hardware Requirements](#hardware-requirements)

---

# Overview

**Midnight Vitals** is the built-in diagnostics and monitoring system for Proof or Bluff's realDeal mode. It tracks the health of every Midnight-related component and provides clear, actionable guidance when something goes wrong.

In **demoLand mode**, Vitals is minimal — it only monitors the AI service and local state. In **realDeal mode**, it monitors the full Midnight stack.

### Status Indicators

| Icon | Meaning | Action Required |
|------|---------|----------------|
| 🟢 | **Healthy** — Component is running normally | None |
| 🟡 | **Degraded** — Component is running but with issues | Monitor; may self-resolve |
| 🔴 | **Critical** — Component is down or failing | Immediate attention required |
| ⚪ | **Not Applicable** — Component not needed in current mode | None |

---

# Quick Health Check

Run this command to check all Midnight components at once:

```bash
# From the proofOrBluff project root:
npm run vitals

# Or manually check each component:

# 1. Proof Server
curl -s http://localhost:6300/health || echo "❌ Proof server not responding"

# 2. Docker
docker ps | grep proof-server || echo "❌ Proof server container not running"

# 3. Lace Wallet
# → Check browser extension: Settings → Midnight → verify connection

# 4. Midnight RPC
# → Check via app: Settings → Vitals → RPC Status

# 5. Indexer
# → Check via app: Settings → Vitals → Indexer Status
```

### One-Liner Full Check (Bash)

```bash
echo "=== MIDNIGHT VITALS ===" && \
echo -n "Proof Server: " && (curl -sf http://localhost:6300/health > /dev/null && echo "🟢 OK" || echo "🔴 DOWN") && \
echo -n "Docker: " && (docker ps --format '{{.Image}}' | grep -q proof-server && echo "🟢 Running" || echo "🔴 Not running") && \
echo -n "Port 6300: " && (ss -tlnp | grep -q 6300 && echo "🟢 Listening" || echo "🔴 Not listening") && \
echo "======================="
```

---

# Component Reference

## 1. Proof Server

The local proof server generates zero-knowledge proofs for game transactions. It's the most critical infrastructure component.

| Property | Value |
|----------|-------|
| **Docker image** | `midnightntwrk/proof-server:latest` |
| **Default port** | 6300 |
| **Local URL** | `http://localhost:6300` |
| **Protocol** | HTTP |
| **Startup time** | 5–15 seconds (covered by dealer shuffle video) |
| **CPU requirement** | Skylake (6th gen Intel) or newer |
| **RAM requirement** | 2GB+ recommended |

### Start Proof Server

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
```

### Start on Alternate Port (if 6300 is occupied)

```bash
docker run -p 6301:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
# Then update env: NEXT_PUBLIC_PROOF_SERVER=http://localhost:6301
```

### Stop Proof Server

```bash
docker stop $(docker ps -q --filter ancestor=midnightntwrk/proof-server:latest)
```

### Check Proof Server Logs

```bash
docker logs $(docker ps -q --filter ancestor=midnightntwrk/proof-server:latest) --tail 50
```

### Update Proof Server

```bash
docker pull midnightntwrk/proof-server:latest
# Then restart the container
```

---

## 2. Midnight RPC Node

The RPC (Remote Procedure Call) endpoint connects POB to the Midnight blockchain network.

| Property | Value |
|----------|-------|
| **Mainnet URL** | `wss://rpc.midnight.network` |
| **Protocol** | WebSocket (WSS) |
| **Purpose** | Submit transactions, query chain state |

### Verify RPC Connection

```bash
# WebSocket test (requires wscat: npm install -g wscat)
wscat -c wss://rpc.midnight.network -x '{"jsonrpc":"2.0","method":"system_health","params":[],"id":1}'
```

---

## 3. Indexer

The indexer provides queryable access to public game state on the Midnight blockchain.

| Property | Value |
|----------|-------|
| **Mainnet URL** | `wss://indexer.midnight.network/api/v3/graphql` |
| **Protocol** | WebSocket + GraphQL |
| **Purpose** | Read public game state (current rank, turn, pile size, game status) |

### Verify Indexer Connection

```bash
# GraphQL health check
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' \
  https://indexer.midnight.network/api/v3/graphql
```

---

## 4. Lace Wallet

Lace wallet provides the player's Midnight address, signs transactions, and manages DUST tokens.

| Property | Value |
|----------|-------|
| **Extension** | Chrome / Brave browser extension |
| **Network** | Must be set to Midnight |
| **Proof server** | Must point to local (`http://localhost:6300`) |

### Wallet Setup Checklist

- [ ] Lace wallet extension installed
- [ ] Midnight network enabled in Lace settings
- [ ] Proof server URL set to `http://localhost:6300` in Lace settings
- [ ] DUST balance sufficient for transactions
- [ ] Wallet unlocked and connected to POB

---

## 5. Local Private State (LevelDB)

Player's private hand data is stored locally in an encrypted LevelDB database.

| Property | Value |
|----------|-------|
| **Location** | `~/.pob/private-state/` |
| **Engine** | LevelDB (via `@midnight-ntwrk/midnight-js-level-private-state-provider`) |
| **Contents** | Player's hand, game secrets, proof artifacts |
| **Encryption** | Midnight wallet-derived key |

### Backup Private State

```bash
cp -r ~/.pob/private-state/ ~/.pob/private-state-backup-$(date +%Y%m%d)
```

### Reset Private State (Caution: Loses Current Game Data)

```bash
rm -rf ~/.pob/private-state/
# App will recreate on next launch
```

---

## 6. Compact Compiler

For development and contract deployment.

| Property | Value |
|----------|-------|
| **Install** | `curl --proto '=https' --tlsv1.2 -LsSf https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh \| sh` |
| **Check version** | `compactc --version` |
| **Compile contract** | `compactc proof-or-bluff.compact` |

---

# Troubleshooting Guide

## Issue: "Challenge resolution failed"

**Symptom**: Clicking "Proof or Bluff!" results in an error instead of revealing the result.

```
DIAGNOSIS FLOW:
                                    ┌──────────────┐
                                    │ Challenge     │
                                    │ Failed        │
                                    └──────┬───────┘
                                           │
                                    ┌──────▼───────┐
                              ┌─ No ┤ Proof server │ Yes ─┐
                              │     │ running?     │      │
                              │     └──────────────┘      │
                              │                           │
                       ┌──────▼───────┐           ┌──────▼───────┐
                       │ Start proof  │     ┌─ No ┤ Wallet       │ Yes ─┐
                       │ server       │     │     │ connected?   │      │
                       │ (see above)  │     │     └──────────────┘      │
                       └──────────────┘     │                           │
                                     ┌──────▼───────┐           ┌──────▼───────┐
                                     │ Connect      │     ┌─ No ┤ Contract     │ Yes
                                     │ Lace wallet  │     │     │ deployed?    │
                                     └──────────────┘     │     └──────────────┘
                                                   ┌──────▼───────┐          │
                                                   │ Deploy       │   ┌──────▼───────┐
                                                   │ contract     │   │ Check RPC    │
                                                   └──────────────┘   │ + indexer    │
                                                                      └──────────────┘
```

### Step-by-step fix:

1. **Check proof server**: `curl http://localhost:6300/health`
2. **Check Docker**: `docker ps | grep proof-server`
3. **Check wallet**: Open Lace → Settings → verify Midnight enabled
4. **Check network**: Verify `NEXT_PUBLIC_MIDNIGHT_RPC` is correct in `.env`
5. **Check contract**: Verify contract address in app settings
6. **Check logs**: `docker logs $(docker ps -q --filter ancestor=midnightntwrk/proof-server) --tail 20`

---

## Issue: "Proof server startup is slow"

**Symptom**: Dealer shuffle video plays for too long; player waits.

**Causes & Fixes**:

| Cause | Fix |
|-------|-----|
| First launch (cold start) | Normal — Docker downloads layers. Subsequent starts are faster. |
| Low RAM | Proof server needs 2GB+. Close other apps. |
| Old CPU | ZK proofs need Skylake (6th gen Intel) or newer. Chuck (i7-4770 Haswell) is too old. |
| Docker not optimized | Allocate more resources in Docker Desktop settings. |
| Network pull | Run `docker pull midnightntwrk/proof-server:latest` ahead of time. |

---

## Issue: "Wallet won't connect"

**Symptom**: realDeal mode shows "No wallet detected" or connection prompt loops.

**Fixes**:

1. Verify Lace extension is installed and enabled
2. Verify Midnight is toggled ON in Lace → Settings → Midnight
3. Set proof server to Local (`http://localhost:6300`) in Lace
4. Try: Disable and re-enable the extension
5. Try: Clear browser cache, hard reload (Ctrl+Shift+R)
6. Try: Different browser profile or incognito window (extension must be enabled in incognito)

---

## Issue: "Game state appears stale / out of sync"

**Symptom**: Moves don't reflect, or game shows old state.

**Fixes**:

1. Check indexer connection: `GET /api/vitals/indexer`
2. Indexer may be lagging behind the chain — wait 30–60 seconds
3. Force refresh: app settings → "Re-sync from chain"
4. If persistent: check if the RPC and indexer are on the same network (mainnet vs testnet)

---

## Issue: "AI agent not responding" (Iteration 3)

**Symptom**: AI opponent stops talking or making moves.

**Fixes**:

1. Check API key: `POB_AI_API_KEY` must be set in `.env`
2. Check rate limits: Anthropic API has rate limits per minute
3. Check balance: BYOK model — your API key needs credits
4. Fallback: App auto-falls back to scripted AI if agent fails
5. Check network: AI API needs internet access

---

# Startup Checklist

Use this checklist every time you start a realDeal session:

```
PRE-FLIGHT CHECKLIST — realDeal Mode
═══════════════════════════════════════

□ 1. Docker is running
      → docker info

□ 2. Proof server is running on port 6300
      → docker run -p 6300:6300 midnightntwrk/proof-server:latest midnight-proof-server -v
      → curl http://localhost:6300/health

□ 3. Lace wallet extension is installed and unlocked
      → Chrome → Extensions → Lace → Enabled
      → Lace → Settings → Midnight → ON
      → Lace → Settings → Proof server → http://localhost:6300

□ 4. DUST balance is sufficient
      → Lace → Midnight → Check balance

□ 5. Internet connection is stable
      → Needed for RPC, Indexer, and AI agent (if Iteration 3)

□ 6. Environment variables are set
      → NEXT_PUBLIC_POB_MODE=realdeal
      → NEXT_PUBLIC_MIDNIGHT_RPC=wss://rpc.midnight.network
      → NEXT_PUBLIC_MIDNIGHT_INDEXER=wss://indexer.midnight.network/api/v3/graphql
      → NEXT_PUBLIC_PROOF_SERVER=http://localhost:6300

□ 7. App is running
      → npm run dev:real
      → Open http://localhost:3015

□ 8. Vitals dashboard shows all green
      → http://localhost:3015/vitals (or click status indicator)

═══════════════════════════════════════
ALL GREEN? → Start playing!
```

---

# Environment Configuration

## .env.realdeal

```env
# App mode
NEXT_PUBLIC_POB_MODE=realdeal

# Midnight Network
NEXT_PUBLIC_MIDNIGHT_RPC=wss://rpc.midnight.network
NEXT_PUBLIC_MIDNIGHT_INDEXER=wss://indexer.midnight.network/api/v3/graphql
NEXT_PUBLIC_PROOF_SERVER=http://localhost:6300

# AI Agent (Iteration 3 — optional)
POB_AI_API_KEY=sk-ant-...
POB_AI_MODEL=claude-sonnet-4-20250514
POB_AI_MAX_TOKENS=500

# Contract (set after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

## .env.demoland

```env
# App mode
NEXT_PUBLIC_POB_MODE=demoland

# AI Agent (Iteration 3 — optional, not needed for Iterations 1-2)
POB_AI_API_KEY=
POB_AI_MODEL=claude-sonnet-4-20250514

# No Midnight components needed in demoLand
```

---

# Vitals API Reference

When the app is running, these endpoints provide machine-readable health data:

| Endpoint | Returns | Use Case |
|----------|---------|----------|
| `GET /api/vitals` | Full health report (all components) | Dashboard display |
| `GET /api/vitals/proof-server` | Proof server status, latency, version | Quick check |
| `GET /api/vitals/wallet` | Wallet connection, address, balance | Pre-game verification |
| `GET /api/vitals/rpc` | RPC connection, block height, sync status | Network health |
| `GET /api/vitals/indexer` | Indexer connection, latest block, latency | Data freshness |
| `GET /api/vitals/contract` | Deployment status, address, active games | Contract health |
| `GET /api/vitals/ai` | AI mode, status, API key presence, latency | AI availability |
| `GET /api/vitals/private-state` | LevelDB health, hand card count, DB size | Local state integrity |

### Response Format

```json
{
  "component": "proof-server",
  "status": "healthy",
  "details": {
    "url": "http://localhost:6300",
    "latency_ms": 45,
    "version": "latest",
    "docker_running": true,
    "last_proof_generated": "2026-04-04T16:30:00Z"
  },
  "timestamp": "2026-04-04T16:45:00Z"
}
```

---

# Hardware Requirements

## Minimum (demoLand)

| Component | Requirement |
|-----------|------------|
| CPU | Any modern processor |
| RAM | 2GB |
| Storage | 100MB |
| Browser | Chrome, Firefox, Brave, Edge |
| Internet | Not required (demoLand is fully local) |

## Minimum (realDeal)

| Component | Requirement |
|-----------|------------|
| CPU | **Intel Skylake (6th gen) or newer** — required for ZK proof generation |
| RAM | 4GB (2GB for app + 2GB for proof server) |
| Storage | 500MB (app + Docker image + private state) |
| Browser | Chrome or Brave (Lace wallet extension required) |
| Docker | Docker Desktop or Docker Engine |
| Internet | Required (RPC, Indexer, AI agent) |

### CPU Compatibility Note

> **Important**: ZK proof generation requires ZKIR instructions available from Intel Skylake (6th gen, 2015) onwards. Older CPUs like Haswell (4th gen, e.g., i7-4770 in Chuck) **cannot generate proofs locally**. These machines can still play demoLand but need a remote/hosted proof server for realDeal mode.

---

<p align="center">
  <strong>Healthy infrastructure, fair games, private hands.</strong><br/>
  <em>Midnight Vitals — making sure the table is always ready.</em>
</p>

---

**Author**: John Santi (bytewizard42i) + Penny 🎀  
**Date**: April 4, 2026  
**Midnight Proof Server**: `midnightntwrk/proof-server:latest`  
**Midnight Docs**: [docs.midnight.network](https://docs.midnight.network)
