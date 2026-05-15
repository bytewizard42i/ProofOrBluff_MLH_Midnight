# MLH × Midnight Hackathon — POB Submission Checklist

> **Event**: MLH × Midnight Hackathon, May 15-17 2026 (Fri-Sun, 48h virtual)
> **Project**: Proof or Bluff (POB)
> **Track**: Gaming
> **Submission deadline**: Sunday May 17, 2026 (end of day)
> **Full event details**: [MLH_MIDNIGHT_HACKATHON_2026.md](./MLH_MIDNIGHT_HACKATHON_2026.md)
>
> Maintained by Penny 🎀. Update as items complete.

---

## Track Requirements (Gaming)

**Prompt** (verbatim from MLH): *Engaging games where players enjoy verifiable outcomes and true ownership without exposing hidden in-game states or underlying competitive strategies. Web3 gaming where fair play is guaranteed by cryptography and player data is strictly confidential.*

| Requirement | POB answer |
|---|---|
| Engaging game | Bluffing card game with Ai personality, surprise mechanics |
| Verifiable outcomes | Challenge resolution via direct reveal (demoLand) / ZK proof (realDeal stub) |
| Hidden in-game state | Player and Ai hands are private; only claims are public |
| Cryptographic fair play | Compact contract stub `proof-or-bluff.compact` shows the realDeal path |
| Confidential player data | No accounts in demoLand; realDeal would use Midnight private state |

---

## 48-Hour Build Checklist

### Friday May 15 (kickoff, evening)

- [x] Lock project + track decision (POB / Gaming)
- [x] Import MLH hackathon doc into POB repo
- [ ] Scaffold Vite + React shell at repo root
- [ ] Wire game engine (`demoLand/src/game/`) to React UI
- [ ] Minimal but readable card-table layout
- [ ] Scripted Ai integrated, basic turn loop playable end-to-end
- [ ] First commit + push to public main

### Saturday May 16

- [ ] Win/lose screen, scoring display, rematch button
- [ ] Game log / event feed visible during play
- [ ] Difficulty selector (easy / medium / hard) wired through to scripted Ai
- [ ] Mode selector (Casual / Standard) wired through
- [ ] Mobile-responsive layout (at least readable on phone width)
- [ ] Deploy demoLand to Netlify, capture public URL
- [ ] **Sat evening**: post Gimbalabs Builder Week 3 weekly tweet (24h buffer before Sun May 17 12:00 UTC deadline — see Concurrent Commitments below)

### Sunday May 17 (submission day)

- [ ] Record 2-3 minute demo video (full bluff round, challenge moment, win screen)
- [ ] README cleanup: hackathon banner, demo URL, video link at top
- [ ] Test the public URL on a fresh device / private browser
- [ ] Submit MLH project page with:
  - [ ] Public GitHub repo link
  - [ ] Deployed demo URL
  - [ ] Demo video
  - [ ] Track: Gaming
  - [ ] Team / solo declaration
- [ ] **Sun by 12:00 UTC**: confirm Gimbalabs weekly tweet was posted Sat
- [ ] Post a kickoff/submission tweet tagging `@MLHacks` `@MidnightNtwrk` `#MLHxMidnight`

---

## Concurrent Commitments During the 48-Hour Window

This is **critical to track**:

| Window | Commitment | Action |
|---|---|---|
| Sun May 17 **12:00 UTC** | Gimbalabs Builder Week 3 weekly tweet deadline (BlindOracle, Piece-of-Pie) | Draft Fri, post **Sat evening** for 24h buffer |
| Mon May 18 09:00 PDT | Splunk Agentic Ops 2026 submissions open (ZKSplunk) | Pre-stage; act after MLH submission |

> Missing the Gimbalabs tweet = Piece-of-Pie disqualification. **Sat evening post, no exceptions.**

---

## Deliverables (Final Presentation / Judging)

| Item | Where | Status |
|---|---|---|
| Public GitHub repo | https://github.com/bytewizard42i/ProofOrBluff_MLH_Midnight | ✅ |
| Deployed public URL | Netlify (TBD) | ⏳ |
| Demo video (2-3 min) | YouTube / Loom (TBD) | ⏳ |
| README with hackathon banner | `README.md` top | ⏳ |
| Track-fit narrative | `docs/MLH_MIDNIGHT_HACKATHON_2026.md` Final Decision section | ✅ |
| Architecture overview | `docs/DEMOLAND_VS_REALDEAL.md` | ✅ |
| Game rules | `docs/RULES.md` | ✅ |
| Compact contract (stub OK) | `realDeal/contracts/proof-or-bluff.compact` | ✅ stub |

---

## Disqualification Risks

| Risk | Mitigation |
|---|---|
| Repo not public at judge time | Repo is already public; verify settings before submission |
| No deployed URL (local-only doesn't qualify for MLH) | Netlify deploy Saturday |
| Late submission | Submit by Sun evening with buffer for upload retries |
| Gimbalabs tweet missed during MLH window | Pre-draft Fri, post Sat evening |

---

## Useful Links

- MLH event Discord: `#mlh-hackers` in Midnight Discord
- MLH coordinator: Amanda D'Avria
- Midnight Academy: https://docs.midnight.network
- Midnight local-dev tool: https://github.com/midnightntwrk/midnight-local-dev (see [MIDNIGHT_LOCAL_DEV_AND_ECOSYSTEM_2026-05-13.md](./MIDNIGHT_LOCAL_DEV_AND_ECOSYSTEM_2026-05-13.md))

---

*Maintained by Penny 🎀. Replaces the prior Gimbalabs/Piece-of-Pie checklist that was misfiled here (the canonical version of that lives in `BlindOracle-Gimbalabs_hackathon/docs/HACKATHON_CHECKLIST.md`).*
