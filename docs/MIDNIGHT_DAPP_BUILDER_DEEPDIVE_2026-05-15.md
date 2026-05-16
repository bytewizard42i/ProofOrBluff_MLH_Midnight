# Midnight DApp-Builder Deep Dive — MLH DevRel Calls (May 14, 2026)

**Source**: two MLH DevRel workshop streams that aired on YouTube the day before this writeup. Both lacked transcripts, captions, descriptions, or chapters. Audio was downloaded with `yt-dlp` and transcribed locally with `faster-whisper` (`small.en`, int8, CPU). Quotes below are paraphrases unless otherwise marked; timestamps refer to the transcript files saved at `/tmp/yt-pob/<videoId>.{txt,srt}`.

**Videos covered**

1. **[Build on Midnight Kickoff Workshop](https://www.youtube.com/watch?v=9p8n4SBtwRQ)** — 57:51 — speaker: **Idris** (Yudriso name was a Whisper mishear; correct handle is on socials per the talk; he is "developer at the Midnight Foundation"). Conceptual onboarding: privacy primitives, Compact mental model, dev resources.
2. **[How to Build on Midnight Using AI](https://www.youtube.com/watch?v=JFhIf0O6LoM)** — 46:35 — speaker: **Tushar** (a Midnight Fellow). Live demo of building a counter DApp end-to-end where the AI agent writes ALL the code, using a brand-new tooling layer called **Midnight Agent Skills** (`npx skills add ...`).

> The "DApp Builder" Idris referenced — and the thing he was nudging hackers toward — is **Midnight Agent Skills** + **Midnight MCP**. They're complementary AI-native dev tools. This document covers both in depth.

---

## TL;DR

The Midnight ecosystem has converged on **two AI-native developer tools** for the MLH 2026 hackathon, both designed to compensate for the same root problem: Compact / Midnight syntax post-dates the training cutoff of every major LLM, so out-of-the-box AI agents hallucinate broken code.

| Tool | What it is | Author | Distribution | Best for |
|---|---|---|---|---|
| **Midnight MCP** | Model Context Protocol server with semantic search over docs / SDK / 14+ partner repos + a hosted Compact compiler | Olanetsoft / Idris (Midnight Foundation DevRel) | `npx midnight-mcp` (per the user's existing `MEMORY[user_global]` rules) | "Just ask me about Midnight" — context-on-demand inside Claude / Cursor / Windsurf |
| **Midnight Agent Skills** | Curated, verified knowledge packs in the Vercel `agent-skills` format, installable via `npx skills add` | Utkarsh Varma (Webisoft Development Labs) — demoed at MLH by Tushar (also Webisoft) | `npx skills add UvRoxx/midnight-agent-skills` (or per-skill) | Scaffolding new DApps quickly; agent has the patterns baked in for whole-app code generation |

For Proof or Bluff, the upgrade path is:

1. Install **Midnight Agent Skills** in the realDeal subproject so that whatever AI assistant we use (Claude Code, Cursor, Windsurf, OpenCode) can scaffold the Compact contract + Lace integration + Vitest harness without us correcting syntax errors.
2. Keep the **Midnight MCP** in the loop for live syntax verification and the hosted compiler (per existing global rules).

---

## Workshop 1 — "Build on Midnight Kickoff Workshop" (Idris)

### Speaker & framing

Idris introduces himself as a Midnight Foundation DevRel engineer with a backend / DevRel background across EVM and non-EVM ecosystems, and the founder of a community for onboarding new builders. The talk's thesis: **"privacy is not an add-on, it is a property of the system you build."**

### The three-architecture story (slides 1–6)

He frames the problem space as three architectural patterns:

1. **Traditional web** — User → Internet → Company database. Sensitive data leaves the user's device and **becomes a honeypot** the moment it lands at the company. Every breach in the news fits this picture.
2. **Public blockchain (Ethereum-style)** — "Solves" the trusted-middleman problem but adds a new one: **everything is public on-chain forever**. Metadata + correlation make even pseudonymous addresses identifiable at scale. Blockchain analytics is a whole industry. Plus: companies still capture the off-chain front-end, analytics, and account data on top of the public chain — so you didn't even escape data collection, you just stapled an immutable public log on top of it.
3. **Shielded DApp (Midnight)** — Private data **never leaves the device**. The device generates a **ZK proof** that says "I have data satisfying X" and submits *only the proof*. The chain has two layers — public consensus data and shielded private data — and the "company" verifies transactions without ever collecting the underlying data.

### Why a whole new chain

Two reasons he hammered on:

- **Privacy as a human right in the digital era** — GDPR, multiple constitutional frameworks all gesture at it, but the digital tools we've actually built systematically erode it (cookie banners, loyalty cards, stacked-against-you defaults). Midnight makes privacy the *default substrate*, not a feature you bolt on.
- **Reclaim three freedoms** — association (donate/join without permanent public record), commerce (transact without every counterparty knowing volume/timing), expression (post/speak without cross-platform correlation).

### Use-case categories he highlighted

| Category | Examples |
|---|---|
| **Identity** | Age verification, jurisdiction proofs, credentials |
| **Finance** | Credit-score-above-threshold proofs, lending, private transfers |
| **Healthcare** | Clinical-trial eligibility, prescription verification, claims, portable records |
| **Gaming** | "Anywhere there is hidden information" — hands of cards, battleship boards, treasure chests. **Direct quote of the pattern: commit to private state on-chain without revealing it; prove your move against it; verifiable but completely hidden.** |

(Direct relevance to Proof or Bluff: gaming is one of the four canonical use-case categories Midnight DevRel itself promotes. POB sits squarely in the wheelhouse.)

He also added a fifth emerging category in the Q&A: **AI agents** (privacy-preserving agentic systems).

### The architecture diagram (slide 7-ish)

He walks through the operational picture for a developer:

```
┌─────────────────┐   ┌──────────────────────┐   ┌────────────────┐
│  DEVELOPER      │   │  USER BROWSER         │   │ MIDNIGHT NETWORK│
│                 │   │                       │   │                 │
│  TypeScript app │   │  DApp + Lace wallet  │   │  Validator nodes │
│  Compact contract│  │  (talks locally)     │   │  produce blocks  │
│  ↓ compactc     │   │                       │   │                 │
└─────────────────┘   │  Midnight client svc │   │   ↑              │
                      │  (read view of chain)│   │   │              │
                      └──────────────────────┘   └────────────────┘
                              │  ↑
                              ▼  │
                      ┌──────────────────────┐
                      │  PROOF SERVER        │
                      │  (local, never sees  │
                      │   keys/seed)         │
                      └──────────────────────┘
```

The thing he emphasized **"is very critical and very easy to miss"**: the **proof server**. It runs locally, generates ZK proofs (because doing so on-device would be too heavy), but it **never** receives wallet keys, seeds, or signing material. Those stay in Lace.

### Three core endpoints a developer hits

1. **Node RPC** — where transactions land
2. **Indexer** — reads / queries / contract states / balances
3. **Proof server** — generates ZK proofs for every transaction

He plugged **`midnight-local-dev`** as the fastest way to spin up everything locally — clone, `docker up`, `npm start`, point your DApp at it. Recommended over hitting the public testnet for early development. (Idris: *"number one is very fast, number two you don't have to wait for any faucets, number three very easy to set up."*)

### Compact mental model

Three design pillars he laid out:

1. **Public/private composability** — Compact lets you express both kinds of computation and "match data across the public and private boundary, ensuring integrity via ZK circuits."
2. **Safety** — privacy is hard; many ways to leak by accident. Compiler refuses to compile if you try to use a private witness in a conditional without explicitly marking it `disclose()`. **Forces you to acknowledge "I know this leaks one bit."**
3. **Familiarity** — "If you can read TypeScript, you should be able to read Compact." Curly braces, semicolons, type annotations, generics. Differences he flagged: enum access uses `.` not `::`, void return types use `[]` not `void`, and there are extra constraints from the ZK execution model.

The five Compact concepts he defined:

| Concept | What it is |
|---|---|
| **`ledger`** | On-chain durable, public state. "Your support ledger" — counters, owners, addresses, public membership sets. |
| **`witness`** | A foreign-function interface to TypeScript. **Declared in Compact, body lives in TypeScript** on the user's machine. The mechanism for accessing private user data when generating a proof. |
| **`assert`** | Verification gate; the validation/conditional layer that must pass before a circuit proceeds. |
| **`circuit`** | The unit of computation in Compact. Compiles into a ZK proof circuit. Reads private witness data, computes over it, optionally updates ledger state, and emits a proof that all of that happened correctly. |
| **`disclose`** | The safety mechanism. Wrap any operation that sends a private witness value into the public domain. Compiler enforces it. |

Idris's summary: *"Ledger is your public state. Witness is your private off-chain channel. Circuit is the computation that ties them together. Assert enforces your rules. Disclose marks the public/private boundary."*

### Resource hub he plugged

- **Developer Hub**: `developer-hub.midnight.network`
- **Midnight Academy**: `academy.midnight.network` — the zero-to-one path
- **Awesome Midnight Dev Repo**: a community-maintained list of resources, accepts PRs
- **Midnight YouTube**: live workshops, fireside chats, recorded explainer + technical + how-to videos
- **Midnight Quest**: gamified learning with rewards
- **Elite program**: support from Midnight Fellows
- **Build Club**: 8-week structured program (idea → planning → execution → customer acquisition → marketing)
- **Midnight Forum**: code help
- **Midnight Discord**: the live channel for hackathon support
- **Midnight MCP**: he named it twice as a way to "ask a lot of questions" during the hackathon — *"we encourage you to also use the Midnight MCP environment so that you don't get stuck when you want to do deployment on faucets or whatever it may be."*

### Closing advice (worth tattooing)

- Hackathon timeline is short → plan ruthlessly, list MUST-HAVE features vs nice-to-have features, build the must-haves first.
- "Don't try to put everything into it" — past hackathons have been killed by feature creep; people end with no functional submission.
- Use AI to "quickly shift some things and then focus more on what is important" — i.e., don't burn time on the front end that you should spend on the contract logic.
- Suffer in silence at your peril; ask in Discord.

---

## Workshop 2 — "How to Build on Midnight Using AI" (Tushar)

### The thesis

Tushar opens by asking how many viewers have:
1. Written a smart contract — many.
2. Deployed one to a testnet — fewer.
3. Written one where **inputs are cryptographically unprovable to anyone, including the chain** — almost nobody.

Then: *"In the next 50 to 55 minutes, you're going to watch a full-stack go from zero to a live end-to-end transaction on a zero-knowledge blockchain. AI is going to write **every line of the code**. I won't even write a single piece of code myself. And the code will not be boilerplate, not a Git tutorial copy-paste."*

The setup he uses:

- A new Next.js scaffold (he runs the create command live)
- **OpenCode** as his AI agent harness (he explicitly notes Claude Code, Anti-Gravity, Copilot, Cursor would all work the same way)
- **No API key configured** — he runs entirely on the free models built into OpenCode
- **Midnight Agent Skills installed via `npx skills add ...`** — this is the magic.

His "lame" demo prompt (his word): *"Build me a counter DApp using these two skills. Next.js is already initialized."* — and the agent took it from there.

### The three Midnight mental-model pairs (running while the agent works)

While AI is writing code, he covers concepts:

#### 1. Compact vs Solidity

| Solidity | Compact |
|---|---|
| Execution language | Circuit language |
| Logic that runs on-chain | A mathematical constraint describing what valid state transitions look like |
| Every node re-executes the function to verify | Chain never re-executes; just **checks a proof that the constraint was satisfied** |

#### 2. Night vs Dust

| Token | Role |
|---|---|
| **NIGHT** | Native value token. "Hold, trade, has economic meaning." Transfers shielded by default. |
| **DUST** | Gas token. **Every transaction costs Dust, not Night.** Completely separate from value. |

The "why split them" rationale: if your gas token is also your private value token, **gas payment itself leaks information**. Separating them keeps the privacy model clean.

The practical implication for hackathon setup:
1. Go to faucet, paste **unshielded address**, receive Night.
2. In your wallet, designate your Night to **regenerate Dust**.
3. Dust is renewable from your Night — you don't pay for gas in real-value terms.

> **Tushar's clutch tip**: *"If your transaction isn't going through, nine times out of ten it's a Dust balance issue, not a code issue. Keep that in your back pocket."*

#### 3. The network ladder

| Network | Role |
|---|---|
| **Realtime** (i.e. local) | Spin a node on your machine, fully controlled, no real network, instant feedback. Early dev. |
| **Preview** | Staging testnet, shared with other devs, resets periodically. Integration testing. |
| **Pre-prod** | Stable public testnet. Persistent, funded faucets available. Closest-to-mainnet behavior. *"Think of it as Sepolia for Midnight."* — what they used in the demo. |

Each network has its own proving keys and contract addresses. **"A contract deployed on pre-prod does not exist on preview."** Mixing them up in your config is the annoying-to-debug failure mode.

### The full-stack picture

Three pieces, one talking to the next:

```
┌─────────────────────┐       ┌──────────────┐       ┌────────────────┐
│ COMPACT CONTRACT    │       │ MIDNIGHT JS  │       │ LACE WALLET    │
│ (the language)      │ ─────►│ TS SDK       │ ────► │ Browser ext.   │
│                     │       │ Runs ZK      │       │ Sign + submit  │
│ Public ledger       │       │ prover       │       │ + manage proofs│
│ + private witnesses │       │ locally      │       │                │
└─────────────────────┘       └──────────────┘       └────────────────┘
```

The Lace wallet is "Midnight's MetaMask equivalent." During a transaction the user sees:
- **2 popups during deploy**: sign tx, then submit tx
- **4–5 popups during interaction**: each prompts permission to generate a ZK proof + use prover keys + check the transaction went through

ZK proof generation takes **~15–20 seconds** per transaction on the prover. Tushar reframes this as a feature, not a bug: *"Even though it shows submitted on the blockchain, it might not update as soon as you click on the explorer. Refresh after 15–20 seconds and you'll see the contract was successfully deployed."*

### The contract he ended up with (live walk-through)

Midnight Skills produced (and Tushar narrated) something close to:

```compact
pragma language_version >= 0.20;

import CompactStandardLibrary;

export ledger counter: Counter;

export circuit increment(): [] {
  counter.increment(1);
}
```

(Pragma 0.20 in the demo, with him noting *"the latest version is 0.23"*. ⚠️ See **version note** below — your `MEMORY[user_global]` rule references v0.30 from a later session; verify against `midnight-get-version-info` at session start as that rule already says.)

The frontend the agent built was a `CounterApp` React component that:
1. **`checkContract()`** — fetches `index.js` from the compiled `managed/` directory.
2. **`handleConnect()`** — prompts for the Lace wallet ("install browser extension if not detected"), loads the compiled contract.
3. **`handleDeploy()`** — deploys via the wallet (no CLI needed; everything happens through Lace's backend).
4. **`handleJoin(addr)`** — joins an already-deployed contract by address.
5. **`handleIncrement()`** — calls the `increment` circuit.

### The one error he hit live

**`Coin public key not found`** — common when coming from a Solana background where you have separate token accounts vs base accounts. Midnight has both a **token public key** and a **coin public key**, and you connect to / interact with contracts using the **coin** public key. Fix is one-line; he showed it on stream.

### Network-mismatch fix

Wallet was on `pre-prod`, app was on `preview`. Solution: just update the app config to `pre-prod` and refresh. Per the network-ladder pair above, this is the common mismatch.

### Final transaction flow demo

1. Click "Connect" → Lace popup.
2. Click "Deploy Counter" → 2 popups (sign + submit). Tx submitted on explorer in ~15–20s. Counter value: `0`.
3. Click "Increment" → ~4–5 popups (proving check, sign, submit). After ~15–20s, counter shows `1`. Increment again → `2`. Confirmed end-to-end.

Total demo time: ~40 min, **AI wrote everything**, Tushar typed approximately zero lines of code himself (he only fed errors back to the agent).

### His one summary takeaway

> *"Your application will break. There will be RPC outages. Your Docker won't talk to your application. Don't get anxious about it. It is super normal. It happens to every developer. If you have any issues, reach out on Discord and use AI as much as possible."*

---

## Deep dive: Midnight Agent Skills

### What it actually is

A repository of curated, verified **agent-skill packages** in the Vercel `agent-skills` format, distributed via the open `npx skills add ...` CLI ([`vercel-labs/skills`](https://github.com/vercel-labs/skills)). The skills format is a portable knowledge format that any compatible AI agent (Claude Code, Cursor, Windsurf, OpenCode, Anti-Gravity, GitHub Copilot, and 50+ more) can ingest.

**Repo**: [`UvRoxx/midnight-agent-skills`](https://github.com/UvRoxx/midnight-agent-skills)
**Author**: Utkarsh Varma (`@UvRoxx`), Webisoft Development Labs
**License**: per repo (check before any commercial use)
**Companion blog post**: [dev.to writeup](https://dev.to/uvroxx/building-midnight-agent-skills-ai-powered-development-for-privacy-first-blockchain-2j03)

### The five skills shipped

| Skill | What it teaches the agent |
|---|---|
| **`midnight-compact-guide`** | Full Compact syntax reference v0.19+: pragma, imports, Counter / Uint / Bytes / Map / Vector / Set, privacy patterns (selective disclosure, commit-reveal, authentication), token patterns (shielded & unshielded), common mistakes to avoid, links to working contracts. **Includes**: `privacy-selective-disclosure.md`, `tokens-shielded-unshielded.md`, `common-errors.md`, `openzeppelin-patterns.md`. **Derived from `Olanetsoft/midnight-mcp` syntax reference**. |
| **`midnight-sdk-guide`** | TypeScript SDK integration: Lace wallet integration, contract deployment, state management, error handling, React hooks. **Includes**: `wallet-integration.md`. |
| **`midnight-infra-setup`** | How to run a local Midnight stack: node (`ws://127.0.0.1:9944`), indexer (`http://127.0.0.1:8088`), proof server (`http://127.0.0.1:6300`), based on [`midnightntwrk/midnight-infra-dev-tools`](https://github.com/midnightntwrk/midnight-infra-dev-tools). **Critical**: indexer metadata must match node version, proof-server must use same ledger version as node (check `midnight-node/Cargo.toml` lines 63–70). |
| **`midnight-deploy`** | Compile contracts → deploy local → deploy preview testnet → environment configuration → contract address management. |
| **`midnight-test-runner`** | Vitest integration, contract simulators, private state testing, selective disclosure verification, coverage reports. |

### How to install

```bash
# Quickest: install all 5 skills at once
npx skills add UvRoxx/midnight-agent-skills

# Or per-skill
npx midnight-agent-skills add midnight-compact-guide

# Or list everything available first
npx midnight-agent-skills list

# Or git submodule the whole thing
git submodule add https://github.com/UvRoxx/midnight-agent-skills .skills/midnight
```

After install, skills auto-load into your agent's context the next time it starts a task. From the dev.to writeup: *"Once installed, skills are automatically available. The agent will use them when relevant tasks are detected."*

### The problem the skills solve (per Utkarsh's blog)

Verbatim list of bugs he hit while building on Midnight that motivated the project:

1. **Wrong syntax generation** — every AI assistant generated wrong Compact code because they were trained on outdated or incorrect syntax.
2. **Outdated patterns** — e.g., `ledger { counter: Counter; }` block syntax (deprecated) vs `export ledger counter: Counter;` (correct).
3. **Infrastructure confusion** — version synchronization between node / indexer / proof-server is fiddly.
4. **Missing patterns** — commit-reveal, selective disclosure, shielded vs unshielded tokens — none in any LLM training set.
5. **Testing struggles** — Vitest contract-simulator pattern is non-obvious.

His verification process for each skill: source-priority hierarchy (1: official Midnight docs, 2: official Midnight repos, 3: hackathon-winning examples, 4: community contributions), then verify each pattern by **actually compiling and running it** before shipping.

### How the format works

Each skill is a directory containing a `SKILL.md` file in the open Vercel agent-skills format — basically a markdown spec the agent reads as context. The CLI (`vercel-labs/skills`) discovers, installs, and registers them at the right path for whichever agent is in use.

> Full SKILL.md template + how-AI-agents-discover-skills mechanics are in the dev.to post sections 10 (Technical Architecture) and 11–12 (Verification Process). Worth reading the full post if you want to **author your own skill** (e.g., a `proof-or-bluff-patterns` skill that bakes in our card-commitment / Bayer-Groth shuffle / VRF-cut patterns from `CASINO_PROVABLY_FAIR.md`).

---

## How this compares & complements the Midnight MCP

| Axis | Midnight MCP | Midnight Agent Skills |
|---|---|---|
| **Distribution** | MCP server, started via `npx midnight-mcp@latest` (or local), registered in Claude/Cursor/Windsurf MCP config | npm-style skill packs, dropped into project via `npx skills add ...` |
| **What it provides** | **Tools** the agent calls at runtime: `midnight-search-compact`, `midnight-search-docs`, `midnight-search-typescript`, `midnight-compile-contract`, `midnight-get-version-info`, `midnight-extract-contract-structure`, etc. | **Knowledge** the agent loads as context: SKILL.md files with patterns, examples, anti-patterns, infrastructure recipes |
| **Live data?** | Yes — semantic search over docs, SDK, partner repos; hosted compiler service for real validation | No — static knowledge that ships at install time (must `npx skills add` again to update) |
| **Hosted compile?** | **Yes** — `midnight-compile-contract` calls a hosted Compact compiler service that returns real compiler errors with line numbers | No — but the skills include patterns derived from validated/compiled code |
| **Best for** | Live syntax validation; "does this contract actually compile against today's `compactc`"; pulling current docs into the conversation | Scaffolding new projects; teaching an agent the Midnight idiom; offline / on-the-plane work |
| **Author** | Olanetsoft / Idris (Midnight Foundation DevRel) | Utkarsh Varma (Webisoft Development Labs) |
| **Already in our stack** | ✅ Yes — local clone at `/home/js/utils_Midnight-Idris-MCP` per `MEMORY[user_global]` | ❌ Not yet |

**Recommendation: install both.** Skills give the agent baseline competence; the MCP gives it real-time verification + the hosted compiler. They're not redundant.

The blog post itself acknowledges this — Utkarsh writes that the `midnight-compact-guide` skill is **"derived from `midnight-mcp` syntax reference"**, i.e. they share an upstream source of truth for the syntax surface.

---

## Action items for Proof or Bluff

Concrete next moves based on these workshops:

### Short-term (this week)

1. **Install `midnight-agent-skills` in `realDeal/`** so when we (and the AI assistants) scaffold the realDeal Compact contract + Lace integration, the patterns are baked in.
   ```bash
   cd /home/js/DIDzMonolith/ProofOrBluff_MLH_Midnight/realDeal
   npx skills add UvRoxx/midnight-agent-skills
   ```
2. **Verify the current stable `compactc` version** at session start (per your global rule). The May 14 workshop demo used `>= 0.20` and named v0.23 as latest; your global memory references v0.30. Resolve before any new contract code is written — call `midnight-get-version-info` via the MCP.
3. **Re-read [`CASINO_PROVABLY_FAIR.md`](CASINO_PROVABLY_FAIR.md) with the Skills' `tokens-shielded-unshielded.md` rule open** — the shielded-token vault patterns map directly onto our card commitment + multi-party shuffle design.

### Medium-term (next 2 weeks)

4. **Author a `proof-or-bluff-patterns` skill** (proposal — not yet built):
   - Card commitment scheme (Pedersen on `Commit(rank ‖ suit, nonce)`)
   - Multi-party shuffle proof outline (Bayer-Groth)
   - VRF-cut pattern
   - Hand-set Merkle proof for `playCards` circuit
   - Discard-pile state machine (the May 2026 mechanic change)
   Submit upstream to `UvRoxx/midnight-agent-skills` as a contribution; or host our own and `npx skills add bytewizard42i/proof-or-bluff-patterns`.
5. **Add `midnight-test-runner` skill output as a pattern** to our realDeal Vitest config so the AI can write contract tests with selective-disclosure verification baked in.
6. **Use `midnight-infra-setup`** as the canonical recipe for spinning up local node + indexer + proof-server. Document version synchronization in our DEPLOYMENT.md with explicit pinned versions (currently DEPLOYMENT.md has placeholders).

### Long-term

7. Once the casino mode is live (per `CASINO_PROVABLY_FAIR.md` Phase 3), upstream the **shuffle-proof + escrow + settlement patterns** as a `provably-fair-casino` skill — the first card-game-specific skill in the ecosystem. This becomes a hackathon-friendly building block other Midnight builders can use.

---

## Quotes worth keeping (verbatim from transcripts)

> *"Privacy is not an add-on, it is a property of the system you build."* — Idris, opening minutes
>
> *"Anywhere there is hidden information in the game — a hand of cards, a chest, a battleship board — you can commit to your private state on-chain without revealing that particular thing. And then you can prove your move against it. It makes it verifiable but completely hidden."* — Idris, on gaming use cases
>
> *"Spend your time wisely. Start with the hardest things. Make sure you can define what you want to build during this hackathon and don't try to put in all the features."* — Idris, closing
>
> *"In the next 50 to 55 minutes, you're going to watch a full-stack go from zero to a live end-to-end transaction on a zero-knowledge blockchain. AI is going to write every line of the code. I won't even write a single piece of code myself."* — Tushar, opening
>
> *"If your transaction isn't going through, nine times out of ten it's a Dust balance issue and not a code issue. Keep that in your back pocket."* — Tushar
>
> *"Your application will break. There will be RPC outages. Don't get anxious about it. It is super normal."* — Tushar, closing

---

## Appendix: source artifacts

- Transcripts saved at `/tmp/yt-pob/9p8n4SBtwRQ.{txt,srt}` and `/tmp/yt-pob/JFhIf0O6LoM.{txt,srt}`
- Audio at `/tmp/yt-pob/9p8n4SBtwRQ.mp3` and `/tmp/yt-pob/JFhIf0O6LoM.mp3`
- Transcription script: `/tmp/yt-pob/transcribe.py` (faster-whisper small.en, int8, CPU)
- Wall-clock time to transcribe ~104 min of audio on Penny's 4-core WSL2: ~22 min
- Quality: small.en mishears proper nouns (e.g., "Yudriso Lubisi", "1 AM extension" for "Lace") but technical content is high-fidelity

## Cross-references in this repo

- [`CASINO_PROVABLY_FAIR.md`](CASINO_PROVABLY_FAIR.md) — payable casino mode design (multi-party shuffle, ZK proofs, video-covered proof gen)
- [`MIDNIGHT_VITALS.md`](MIDNIGHT_VITALS.md) — broader Midnight integration story
- [`MIDNIGHT_LOCAL_DEV_AND_ECOSYSTEM_2026-05-13.md`](MIDNIGHT_LOCAL_DEV_AND_ECOSYSTEM_2026-05-13.md) — earlier deep dive on local dev tooling
- [`RULES.md`](RULES.md) — game rules (with May 2026 mechanic-change addendum)
- [`MLH_MIDNIGHT_HACKATHON_2026.md`](MLH_MIDNIGHT_HACKATHON_2026.md) — this hackathon's specific notes
