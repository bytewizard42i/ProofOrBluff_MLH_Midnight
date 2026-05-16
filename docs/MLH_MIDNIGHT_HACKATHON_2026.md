# MLH × Midnight Hackathon, May 15-17 2026

> **Status (May 15, 2026 evening, kickoff day): ProofOrBluff is the chosen submission.**
>
> This is the active hackathon doc for our MLH × Midnight entry. Originally
> drafted May 9 in EventRevolution while we were weighing options (SplitNight,
> BlindOracle, fresh build, DiscoveryManagement). On the day of kickoff John
> redirected the submission to **ProofOrBluff** on the **Gaming Track**, so
> this copy lives here and supersedes the EventRevolution version for
> hackathon purposes. The EventRevolution copy is preserved as historical
> context.
>
> Owner: John M.P. Santi. Captured by Penny 🎀.
>
> **Source mirror**: `EventRevolution/docs/MLH_MIDNIGHT_HACKATHON_2026.md` (May 9 draft, retained).

---

## At A Glance

| Field          | Value                                                              |
|----------------|--------------------------------------------------------------------|
| **Dates**      | **May 15-17, 2026** (Fri-Sun, 48-hour build window)                |
| **Format**     | 100% virtual                                                       |
| **Hosts**      | Major League Hacking (MLH) × Midnight Foundation                   |
| **Coordinator**| Amanda D'Avria (MLH)                                               |
| **Discord**    | `#mlh-hackers` channel in the Midnight Discord                     |
| **Eligibility**| Open to all skill levels, no prior blockchain experience required  |
| **Attendees**  | Minors (13-18), university students, secondary/HS students, working professionals |
| **Cost**       | Free                                                               |
| **Registration** | MLH event page (link in the announcement email John received)    |

This is the **second** MLH × Midnight hackathon, the first ran fall
2025. Mainnet went live since then so this round runs against a fully
launched network with production-ready dApp support.

---

## Prize Tracks

### Top 2 Overall Winners

- Swag bag
- **Invitation to join Build Club** — 2-month accelerator for early-stage
  founders turning privacy-focused concepts into viable businesses
- End-of-Build-Club selection: pitch to investor network, possible
  entry into the **Midnight Accelerator** (deeper technical integration,
  follow-on funding, expanded GTM support)

This is **the prize that matters**. The hardware in the track-specific
prizes is nice, but Build Club + Midnight Accelerator is the actual
runway.

### AI Track

- **Prize**: Soundcore by Anker Space Q45 Noise-Cancelling Headphones
- **Theme**: Build AI applications that process sensitive user data
  without ever exposing the underlying information. Show that powerful
  AI does not have to come at the cost of personal privacy.

### DeFi Track

- **Prize**: ASUS ZenScreen MB169CK-P Portable USB Monitor
- **Theme**: Next-generation decentralized financial tools that
  inherently protect user transaction histories, wallet balances, and
  proprietary trading strategies. Confidential smart contracts on
  Midnight that keep sensitive financial data hidden from the public
  ledger while remaining mathematically verifiable.

### Gaming Track

- **Prize**: Logitech MX Master 3S Wireless Mouse
- **Theme**: Engaging games where players enjoy verifiable outcomes
  and true ownership without exposing hidden in-game states or
  underlying competitive strategies. Web3 gaming where fair play is
  guaranteed by cryptography and player data is strictly confidential.

### Best Beginner Hack

- **Prize**: Premium Keychron Mechanical Keyboards
- **Eligibility**: Teams made up of >50% first-time hackers
- **Note**: John is a 4× Midnight hackathon winner, so he and any
  Midnight-veteran teammates are likely **not eligible** for this
  track. A team with majority first-time hackers John mentors could
  qualify.

---

## Resources From MLH

- **Midnight Academy** — basics of blockchain, ZK proofs, privacy
  concepts, learning to write Compact contracts
- **Midnight for Developers** — curated docs, example repos, guides
- **Midnight Discord** — `#mlh-hackers` channel for the event

We already have all the deeper reference material in DIDzMonolith
(`MIDNIGHT_REFERENCE.md`, `MIDNIGHT_COMPACT_V030_QUIRKS.md`, the
local Idris MCP, our own past hackathon repos).

---

## Judging Criteria & Submission Requirements

Pulled from the MLH × Midnight opening ceremony with Lauren Lee, Director of Developer Relations at Midnight Foundation (May 15, 2026). Full transcript at `docs/transcripts/2026-05-15_MLH_opening_ceremony_Lauren_Lee.txt`.

### The Privacy Filter (most important content signal)

Lauren's exact wording:

> "If I removed the privacy feature, would this product still make sense? If the answer is yes, push harder until the answer is no. That is the sweet spot for a genuine Midnight application."

**For Proof or Bluff this is already covered**: remove the ZK challenge resolution and the game collapses to "trust the opponent's reveal." There is no version of Proof or Bluff that works without selective-disclosure proofs. This is the line we lead the demo and the written vision with.

### Five Judging Pillars

1. **Problem definition** — Can you state in one sentence who this is for and what pain it removes?
2. **Technical execution** — Does the privacy mechanism actually work, not just decoratively present?
3. **User experience** — Can a non-cryptographer use it without a tutorial?
4. **Reliability** — Does the demo flow run end-to-end without breaking?
5. **Business viability** — Judges explicitly call out that "technically beautiful projects often lose if they cannot clearly explain why someone would pay for them and who the actual target user is." Our `docs/BUSINESS_PLAN.md` answers this; the written vision must echo it.

### Submission Requirements

| Item | Spec |
|---|---|
| **Demo video** | 2 minutes maximum |
| **Code repo** | Public GitHub URL |
| **Written vision** | Submitted via Devpost project page |
| **Deadline** | Sunday May 17, 11:45 AM ET (note: this is hours **before** the 12:00 UTC Gimbalabs tweet deadline — work backward from the earlier of the two) |
| **Team size** | Solo participation allowed but **prize eligibility requires teams of 2-5 members** |
| **Network to build on** | **DevNet**, not Mainnet. Test tokens via the Midnight faucet. |
| **AI tools** | Permitted as long as they integrate Midnight MCPs or AI Skills |

### Five Time-Savers Lauren Recommended

1. Start at the **Midnight Developer Hub**
2. Follow the **Hello World Guide** on docs.midnight.network to deploy a first contract
3. Use **`create-midnight-app`** CLI instead of scaffolding from scratch
4. **Set up AI tooling before coding** — the Midnight Network Expert (Claude) and the Midnight MCP server feed the agent current Compact syntax instead of letting it hallucinate older patterns. *Note for us: we already have the Idris MCP at `/home/js/utils_Midnight-Idris-MCP` and the Midnight MCP wired into Cascade. This bullet is already checked.*
5. Reference example repos (Bboard / Bulletin Board) when stuck on syntax

### Build Club + Midnight Accelerator Path

Top 2 overall teams **and** track winners receive a **Build Club** invitation (8-week accelerator), culminating in a pitch to the **Midnight investor network**. This is the prize-after-the-prize and the main reason to compete hard, even if we don't win the track-specific hardware.

---

## Strategic Fit With Our Existing Projects

We have **6 days** before kickoff. Here is the realistic option matrix:

### Option A, Submit SplitNight (AI Track)

**Why it fits:**

- **Privacy-first by design** (matches MLH/Midnight theme)
- **AI Track ready**: the AI assistant for Guest claim chat
  ("I had the ribeye, two glasses of cab, shared the calamari") is
  exactly the "AI processing sensitive data without exposing it" pitch
- **USDCx + NIGHT settlement** is on-roadmap, gets us to Midnight
  integration during the 48 hours
- **Already scaffolded** (React + Vite + Tailwind), 6 doc files of
  thinking already done, can hit the ground running
- **AI Track prize** (Q45 headphones) plus Build Club run is the play

**Risk:** Phase 5 Midnight integration is "Research" status. We would
need to ship a believable Midnight-integrated demo in 48 hours. Lace
biometric + USDCx transfer is the hard milestone.

**Mitigation:** Use the demoLand/realDeal pattern; demoLand is the
sub-1-hour demo, realDeal is the optional flex if Midnight integration
clears in time.

### Option B, Submit BlindOracle (Gaming Track)

**Why it fits:**

- BlindOracle is a verifiable-game project (answer/guess split, anti-crowd
  cap, ZK proofs)
- "Fair play guaranteed by cryptography" is literally its thesis
- Already has 10 circuits compiling clean to ZK
- Gaming Track prize plus Build Club run

**Why it does not fit:**

- BlindOracle is an **active Gimbalabs Piece-of-Pie hackathon entry**
- Gimbalabs Rule 5 requires the hackathon to start with an empty repo
  and the hackathon doc system requires a single official repo per
  Pie. Cross-submitting may violate Gimbalabs rules.
- **Decision deferred until we read the Gimbalabs rules carefully and
  confirm with Gimbalabs admin** whether a Gaming Track submission of
  the same code is permissible.

**Action item, before May 15:** John reads Gimbalabs Rule set, asks
admin if dual-submission is allowed.

### Option C, Submit a 48-hour fresh build

**Why it fits:**

- No conflict with existing hackathon entries
- "Fresh hack" energy plays well at MLH events
- Could be a thin slice of EventRevolution (an `encounter-poc` 48-hour
  build)
- Or a fresh privacy-AI demo

**Why it does not fit:**

- We have lots of in-flight projects, taking energy off Splunk
  preparation (May 13 rules drop, May 18 submissions open) and
  Gimbalabs weekly tweets
- Fresh-build risk over 48 hours when other projects are mid-flight

### Option D, Submit DiscoveryManagement (DeFi Track)

**Why it fits:**

- "Confidential smart contracts that keep sensitive financial data
  hidden from the public ledger while remaining mathematically
  verifiable" is exactly DiscoveryManagement's thesis (just legal
  data instead of financial)
- Already polished, already MVP
- Strong narrative for the judges

**Why it does not fit:**

- DiscoveryManagement is **legal compliance**, not DeFi proper
- Track judges may push back on "this is not DeFi" framing
- Already shown at Midnight Vegas Summit April 2026

### Recommendation, As Of May 9

**Lean: SplitNight for the AI Track.** It is the cleanest narrative
fit, it is on a phase boundary where a 48-hour push genuinely advances
the roadmap, and the "AI claim assistant + privacy-preserving payment"
story tells beautifully. Build Club acceptance for SplitNight would
unlock the consumer-facing arm of the EnterpriseZK product family.

**Backup: Gaming Track with BlindOracle**, **only if** Gimbalabs rules
allow dual-submission. Confirm with admin before committing.

### Final Decision, May 15 (kickoff day)

**Submission: ProofOrBluff on the Gaming Track.**

Why POB won the slot:

- **Track fit is exact.** "Engaging games where players enjoy verifiable
  outcomes and true ownership without exposing hidden in-game states or
  underlying competitive strategies" is literally the POB thesis. Hidden
  hands, public claims, ZK challenge resolution.
- **No hackathon-rule conflict.** Unlike BlindOracle (Gimbalabs Piece-of-Pie
  active entry), POB is not committed to another concurrent hackathon, so
  no dual-submission ambiguity.
- **Existing scaffolding accelerates the 48-hour build.** Game engine,
  deck, rules, scripted Ai, provider pattern, Compact contract stub all
  already drafted. Phase 1 "first playable" is exactly what fits a 48-hour
  window.
- **Demoable narrative.** "Bluff in public, prove in private" lands in
  judges' first 30 seconds without prerequisite ZK literacy.

SplitNight remains the AI-track candidate for a future MLH round. BlindOracle
stays focused on Gimbalabs Piece-of-Pie (Sun May 17 weekly tweet still due
during this same window — see Concurrent Commitments below).

**Action items (now that POB is the pick, May 15 evening)**:

- [x] John confirmed registration for the MLH × Midnight hackathon
- [x] Track + project pick locked: **POB / Gaming Track**
- [ ] Stand up `package.json` + Vite shell so `demoLand/` is actually runnable
- [ ] Wire `demoLand/src/game/engine.js` to a minimal React UI (player hand,
      Ai area, pile, claim panel, challenge button, log)
- [ ] Hook the scripted Ai (`demoLand/src/game/ai/scripted.js`) into the UI
- [ ] Deploy demoLand to Netlify (public URL is a hackathon submission
      requirement)
- [ ] Stub realDeal flow: Compact contract scaffold compiles; UI shows
      "realDeal mode coming" toggle so judges see the privacy story
- [ ] Record a 2-3 minute demo video showing a full bluff/challenge round
- [ ] Sat May 16 evening: post Gimbalabs Builder Week 3 weekly tweet
      (24h buffer before Sun May 17 12:00 UTC deadline) — see Concurrent
      Commitments
- [ ] Sun May 17 evening: submit MLH project page with repo link, demo
      URL, and video

---

## Concurrent Commitments During the 48-Hour Window

This is **critical to track**:

- **Sunday May 17, 12:00 UTC** = Gimbalabs Builder Week 3 weekly
  tweet deadline. Missing it = Gimbalabs disqualification.
- **Monday May 18** = Splunk Agentic Ops 2026 submissions open at
  9:00 AM PDT. Pre-stage your Splunk submission readiness in the
  hours after MLH submission.

The Gimbalabs tweet has to happen **during MLH submission window**.
Plan: schedule the tweet content on Friday May 15 morning, post Saturday
May 16 evening to give 24 hours of buffer before the deadline.

---

## Reciprocal Tracking

This doc now lives in ProofOrBluff (the active MLH submission). It is
referenced from:

- `/home/js/DIDzMonolith/HACKATHON_CALENDAR.md` (master calendar — update to
  point at this file)
- `EventRevolution/docs/MLH_MIDNIGHT_HACKATHON_2026.md` (May 9 historical
  draft, retained as context)
- `ProofOrBluff_MLH_Midnight/README.md` (project README — link in Quick
  Links table)

---

**Status**: registration confirmed, **POB / Gaming Track** locked May 15,
build window active. Update with submission link and post-event outcome
by end of day Sunday May 17.
