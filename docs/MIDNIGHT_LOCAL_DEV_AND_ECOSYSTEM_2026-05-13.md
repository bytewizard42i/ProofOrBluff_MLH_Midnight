> 📍 **MIRROR**. Canonical lives at `@/home/js/DIDzMonolith/monolith-docs/midnight/archive/2026-05-13_local-dev-and-1am.md`.
> Last sync: 2026-05-14. Update the canonical first, then re-mirror.

---

# Midnight Ecosystem Update — 2026-05-13 (Local Dev, 1AM, Federation)

> Source 1: Idris (Olanetsoft) — *"Run a complete Midnight blockchain on your laptop"* — Midnight Foundation video, May 13, 2026  
> Source 2: Stev (Foundation) + Jay (Foundation) + Utkash / "Bubbles" (Webisoft / 1AM VP Engineering) — Devil Fireside Hang livestream, May 13, 2026 12:31 PM EDT  
> Captured by: Penny 🎀 — May 14, 2026

> ⚠️ **Transcript caveat**: Idris is African with a thick accent. Auto-generated transcripts mangle some terms. Where the transcript said "DOS" we read **DUST**, "fount/foret" we read **faucet**, "fund" sometimes meant "foundation." Verify against the official README links below before quoting verbatim.

---

## TL;DR

1. **Official Midnight Local Network tool exists.** It's `midnightntwrk/midnight-local-dev` — three Docker containers (node + indexer + proof server), one `npm start` command, an interactive CLI to fund test accounts. **This is the new gold-standard local-dev environment.**
2. **1AM × Midnight Foundation Zealy sprint just kicked off** (running ~2 weeks from May 13). Three winners get **early access passes** to ZK Social, ZK Chat, and the customizable theme engine.
3. **Midnight is officially branded as a Cardano partner chain** — Stev jokes "L1.5." Mainnet block time is **6 seconds**. Pre-prod is now a **federated test network** (migrated to guarded WireGuard overlay May 12 with zero downtime).
4. Federated mainnet partners include: **Alpha Compute, Bitco, Block Demon, Bullish, Etero, Google, Keratage, Midnight Foundation, Shielded Technologies, StakeFi, Twin Stake, Vodafone, World Pay**.
5. Validator workshop coming "in next few weeks" — subscribe to the **Midnight Validator Digest** on Notify.

---

## Section 1 — Midnight Local Network (the official tool)

### Repo & docs

- **GitHub**: https://github.com/midnightntwrk/midnight-local-dev
- **Docs guide**: https://docs.midnight.network/guides/midnight-local-network
- **Hello World companion**: https://github.com/Olanetsoft/hello-world-compact (Idris's tutorial repo)

### What it is

A standalone tool that spins up an entire Midnight stack on your laptop:

| Service | Container | Host Port | URL |
|---|---|---|---|
| Midnight Node | `midnight-node` | 9944 | http://localhost:9944 |
| Indexer (GraphQL) | `midnight-indexer` | 8088 | http://localhost:8088/api/v3/graphql |
| Indexer (WebSocket) | `midnight-indexer` | 8088 | ws://localhost:8088/api/v3/graphql/ws |
| Proof Server | `midnight-proof-server` | 6300 | http://localhost:6300 |

These ports match Lace wallet's hardcoded defaults for the **`undeployed`** network, so Lace just works out of the box once you select "Undeployed" in network settings.

### Docker images (pinned, May 2026)

| Image | Version |
|---|---|
| `midnightntwrk/midnight-node` | 0.22.3 |
| `midnightntwrk/indexer-standalone` | 4.0.1 |
| `midnightntwrk/proof-server` | 8.0.3 |

### Wallet SDK compatibility (May 2026)

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

> When wiring this into our DApps (BlindOracle, ZKSplunk demo, EventRevolution, SplitNight, SilentLedger, etc.), match these versions.

### Prerequisites

- Node.js >= 22.0.0
- Docker + Docker Compose v2
- Access to the Midnight npm registry for `@midnight-ntwrk/*` packages

### Quick start

```bash
git clone https://github.com/midnightntwrk/midnight-local-dev.git
cd midnight-local-dev
npm install
npm start
```

`npm start` does six things:
1. Detects whether a local network is already running (offers reuse vs. fresh restart)
2. Pulls/starts the three Docker containers in dependency order (node → indexer → proof server)
3. Initializes the **genesis master wallet** (seed `0x00...001`) which holds all minted NIGHT
4. Registers DUST for the master wallet (required to pay tx fees)
5. Displays master wallet balance
6. Presents an interactive menu

### Funding menu

```
[1] Fund accounts from config file (NIGHT + DUST registration)
[2] Fund accounts by public key (NIGHT transfer only)
[3] Display master wallet balances
[4] Exit
```

Pre-loads with **50,000+ tNIGHT** to the master wallet at genesis. From there you fund any DApp wallet by:

- **Option 1**: Pass a JSON config file with multiple addresses + amounts (registers DUST automatically)
- **Option 2**: Paste a single public address from your DApp UI's "Create Fresh Wallet" flow → instant NIGHT transfer

### Key concepts (Midnight 101 reminders)

- **NIGHT** = native token. Genesis mints a large supply to the master wallet.
- **DUST** = gas mechanism (NOT a token, per Midnight's official rubric). Generated by registering NIGHT UTXOs. **A wallet with NIGHT but no DUST cannot submit transactions.**
- **Master wallet** = genesis seed `0x00...001`, source of all funding transfers in the local-dev tool.
- **Shielded vs. Unshielded NIGHT**: this local-dev tool transfers **unshielded** NIGHT. Use your DApp's own circuits to move funds shielded after that.
- All services run on the **`undeployed`** network ID with the `dev` node preset.

### Why this matters for our projects

- **No more waiting on the pre-prod faucet** during build sprints
- **Reproducible by judges/reviewers** — `git clone && npm install && npm start` and they have the full chain locally in 5 minutes
- **Offline-capable demos** — no testnet dependency for hackathon recordings
- **Fast iteration** — proof failures, contract redeploys, balance edge cases all become same-laptop debugging instead of network round trips

---

## Section 2 — 1AM × Midnight Foundation Partner Sprint (Zealy)

### Who's behind 1AM

- **Webisoft** (Midnight Foundation partner) co-founded the 1AM ecosystem
- **VP of Engineering**: Utkash ("Bubbles" on Discord)
- **Mission** (Utkash's words): *"Bring Midnight to the masses. Rational privacy in every form factor."*

### Product surface

- **Mobile wallet** (iOS + Android — **Android is live**)
- **Browser extension wallet**
- **CLI wallet**: `cli.1am.xyz`
- **Block explorer**
- **Indexer**
- **No-code DApp builder** (vibe-codes Compact contracts + UI)
- **Proof Station** (trusted-execution-environment proof generation as a service, with **transaction sponsorship** — users do their first txns gas-free, paid by you the dev)
- **W Store** (vibe-coded apps from the no-code builder land here automatically)
- **App Store / app registry** (traditional GitHub repo of Midnight DApps; you raise a PR to list — 2-3 day due-diligence review)
- **Customizable theme engine** (incl. partner themes: Ascent, Notar, Pulse, Galaxy Swap)

### Ongoing audits

Utkash (verbatim, paraphrased): "Going through multiple security audits as we speak. Architecture written from the ground up to be extremely secure, following best principles from MetaMask, Phantom, and other industry leaders." — answer to a live audience question about safety on mainnet.

### The Zealy Sprint (RUNNING NOW — ends ~May 27, 2026)

Quests in the 1AM module of the Midnight Zealy board:

1. **Explore 1AM** — visit websites, links, learn the stack
2. **Follow 1AM on X**
3. **Create a 1AM wallet** — submit your unshielded address for points
4. **Use the 1AM Explorer** — analyze on-chain data
5. **Try Proof Station** — sign up, get an API key, optionally enable sponsorship for a sample DApp
6. **Build with the no-code builder** — submit the share link to a deployed DApp
7. **Submit a DApp that uses 1AM tech** (wallet, proof station, no-code builder, anything)
8. **List a DApp in the App Store** via PR to the app registry GitHub

### Prizes — Top 3 win an Early Access Pass

What the Early Access Pass unlocks (1-2 months before public release):
- **Customizable theme engine** (full custom themes + icons + layout)
- **ZK Social** — Twitter alternative built into 1AM, on Midnight (experimental — production status TBD based on community response)
- **ZK Chat** — quantum-resistant peer-to-peer chat between pass holders

### Penny's read

If we want to surface ZKSplunk's brand inside the Midnight community AND collect 1AM tokens-of-attention before the Splunk hackathon, the Zealy sprint is **literally free expected value** for the few hours it costs to run the quests. Tasks 3 + 4 + 5 are no-brainers. Task 6 + 7 we already cover by virtue of having BlindOracle, SilentLedger, BlindOracle, KYCz, etc. — submitting any one of them is +points for negligible effort.

---

## Section 3 — Federation, Mainnet, and the "6-Second Miracle"

### Stev's framing

Mainnet block target = **6 seconds**. If we ever see a block production gap > 6s on mainnet, it's a real incident.

### Three public environments (canonical names + purposes)

| Environment | Cardano partner chain to | Maintained by | Purpose |
|---|---|---|---|
| **Midnight Preview** | Cardano Preview | Core engineering (Shielded Technologies) | Experimental features, rapid iteration. Used to be `testnet-02` in 2025. |
| **Midnight Pre-prod** | Cardano Pre-prod | **Federated** (the FNOs listed below) | Production-mirror test net. Migrated May 12, 2026 to guarded WireGuard overlay with zero downtime. |
| **Midnight Mainnet** | Cardano Mainnet | **Federated** | Live since Apr 1, 2026. Currently in a **guarded phase** (WireGuard overlay between FNOs; restricted deployments). |

> ⚠️ **Important**: each Midnight env is a partner chain to its **respective** Cardano env. `midnight-pre-prod` ↔ `cardano-pre-prod`. They share security from Cardano (UTXO following for DUST generation, partner-chain smart contracts for block-producer committees).

### Federated Network Operators (FNOs) — full list

Alphabetical, captured May 13:

- Alpha Compute (formerly Alpha Ton Capital)
- Bitco
- Block Demon
- Bullish
- Etero
- Google
- Keratage
- Midnight Foundation
- Shielded Technologies (core engineering)
- StakeFi (formerly BCW)
- Twin Stake
- Vodafone
- World Pay

> Worth noting Google + Vodafone + World Pay + Bullish + Block Demon = a Tier-1 enterprise validator set. This is a strong validator-credibility story for **EnterpriseZK Labs** and **Midnight Ventures Co** pitches.

### Infrastructure stack (current — 2026)

```
Cardano Node ──► Cardano DB Sync ──► PostgreSQL ──► Midnight Node
```

- **Pivot from Docker → binary/source-first distribution**. Partners then layered Docker, K8s, Helm charts, Ansible on top.
- **No more Aginio**, **no more partner-chain CLI**. The toolchain is leaner.
- **WireGuard guarded overlay** between FNOs protects the relatively small federation from malicious peers.

### Validator workshop (upcoming)

Stev is brewing a hands-on midnight node validator workshop in Discord (~next few weeks from May 13). Action: subscribe to the **Midnight Validator Digest** on Notify to get the invitation email.

> If we want to operate our own node (story for the G-4 book + EnterpriseZK enterprise pitches), this is the workshop to attend.

---

## Section 4 — How This Reshapes Our Project Plans

### ZKSplunk (hackathon June 15)

- ✅ **Replace** my prior "Midnight Standalone Docker" recommendation with **`midnightntwrk/midnight-local-dev`** as the official base layer for our demo. Lower risk, sanctioned, judge-reproducible.
- ✅ Pin our connector against **wallet-sdk-facade 3.0.0 + ledger-v8 8.0.3 + midnight-js-network-id 4.0.2**.
- ⚠️ Our network ID for the demo will be **`undeployed`**, not `mainnet` or `testnet-02`. Update env files accordingly.
- ⚠️ DUST registration must happen for any wallet we want to submit txns from. The local-dev CLI handles this automatically — but if we script our own demo provisioning, we must call DUST registration.

### EventRevolution (MLH Midnight Hackathon 2026 + production roadmap)

- Use `midnight-local-dev` for all dev/CI environments. Eliminates the testnet dependency that's been a blocker for batch-provisioning beacons during local tests.
- The `undeployed` network ID matches what beacon firmware should target during dev mode.
- Add a Compose override that bundles `midnight-local-dev` alongside the `apps/api` and `apps/attendee-pwa` services so a contributor can `docker compose up` and have the entire stack.

### SplitNight (BuildClub application)

- **Local-dev tool is the answer to "how do I demo this without internet"**. Perfect for in-person BuildClub presentations where wifi is unreliable.
- Use the master wallet to pre-fund 4-8 dummy "guests" before each demo so settlement can happen instantly.
- Pin SDK versions in `package.json` to the matrix above.

### BlindOracle (Gimbalabs hackathon)

- Local-dev becomes the canonical local test env — matches Lace `undeployed` mode out of the box.
- Document the master wallet → bot-player funding pattern in the BlindOracle README.

### Other DIDzMonolith Midnight projects

Anywhere a project currently says "deploy to pre-prod" or "fund from faucet" in its README, we should add: *"For local development, use `midnightntwrk/midnight-local-dev` (see `MIDNIGHT_LOCAL_DEV_AND_ECOSYSTEM_2026-05-13.md`)."*

Affected: AgenticDID, KYCz, GeoZ, EncryptVault, SilentLedger, SelectConnect, DiscoveryManagement, equineProData, petProData, sharedScience, proofOrBluff, realVote, SentinelDID, SentinelAI, ProMingle, HuddleBridge, DownMan, DIDz-io, SouLink, PopCork, safeHealthData.

---

## Section 5 — Penny's Action Items

For John to consider:
1. **Subscribe to the Midnight Validator Digest** on Notify — workshop invite drops there
2. **Run the 1AM Zealy sprint quests this weekend** — easy wins, marketing surface for our projects
3. **Pin SDK versions** across all DIDzMonolith Midnight projects to the May 2026 compatibility matrix above
4. **Update each project's README** with the local-dev path
5. **Submit a 1AM-listed DApp** (BlindOracle is the obvious candidate) via PR to their app registry — 2-3 day review, free distribution

For Penny to execute (already in motion):
- Update ZKSplunk's `MIDNIGHT_BASE_LAYER_RESEARCH.md` to point at the official tool (this session)
- Drop a copy of this doc into `EventRevolution/docs/` and `SplitNight_me_app/docs/` (this session)
- Mention in `PENNYS_NOTES_TO_JOHN.md` for the hackathon

---

## Reference Links

| Resource | URL |
|---|---|
| Midnight Local Dev (official) | https://github.com/midnightntwrk/midnight-local-dev |
| Local Network guide (docs) | https://docs.midnight.network/guides/midnight-local-network |
| Hello World Compact (Idris) | https://github.com/Olanetsoft/hello-world-compact |
| Midnight docs | https://docs.midnight.network/ |
| Midnight network home | https://midnight.network/ |
| 1AM website | https://1am.xyz/ |
| 1AM CLI | https://cli.1am.xyz/ |
| 1AM forum guide (community) | https://forum.midnight.network/t/a-comprehensive-guide-to-the-1am-crypto-wallet-on-the-midnight-network/1173 |
| Midnight Notify (announcements) | https://notify.midnight.network/ |
| Midnight Discord | (in invite list — `#splunk-ai-hackathon` is unrelated) |

---

*Master copy lives in `ZKSplunk_Splunking_w_Midnight/docs/`. Mirror copies are placed in `EventRevolution/docs/` and `SplitNight_me_app/docs/`. If you update one, update all three (or rip out the dupes and reference the master).*
