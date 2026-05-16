# Provably Fair Casino Mode — Design Doc

**Status**: design draft, May 15 2026
**Author**: John M.P. Santi (with Penny)
**Scope**: how Proof or Bluff becomes a payable, trust-minimized casino game on Midnight
**Related**: [`RULES.md`](RULES.md), [`MIDNIGHT_VITALS.md`](MIDNIGHT_VITALS.md), [`FUTURE_FUNCTIONALITY.md`](FUTURE_FUNCTIONALITY.md)

---

## Problem statement

For Proof or Bluff to be a **payable** casino game, contestants must be confident — without trusting the operator, the AI, or each other — that:

1. The deck contains **exactly** the canonical 52 cards (or 5×52 = 260 in shoe mode), no duplicates, no missing.
2. The deck was **shuffled fairly**, with no party able to predetermine the order.
3. Cards were **distributed honestly** — the card you receive is the next card off the (already-shuffled) deck, not cherry-picked.
4. Your **hand stays private** to you alone.
5. Face-down plays are **cryptographically bound** to actual hand cards (no swapping after the fact).
6. The **bluff resolution** is honest — revealed cards genuinely correspond to the claim.
7. **Payouts** match the proven game outcome, with a transparent house rake.
8. **Liveness** is enforced — a player who walks away forfeits their stake on a timeout.

Each of these maps to a ZK proof obligation on Midnight.

---

## The trust model — invariants and their proofs

| Invariant | Proof obligation | Where |
|---|---|---|
| **Multiset integrity** | Initial deck commitments open to exactly the canonical 52 (or 260) cards | `verifyDeckGenesis` circuit |
| **Shuffle fairness** | Multi-party shuffle with each step proven a valid permutation + re-randomization | `verifyShuffle` circuit, one per shuffler |
| **VRF cut** | Final permutation seeded by chain entropy (Midnight VRF / block hash) | Public ledger event |
| **Deal integrity** | Each dealt card is the next deck index; opening sent privately to recipient | `verifyDeal` circuit |
| **Hand secrecy** | Cards held as Pedersen commitments; only owner knows opening | Witness-only |
| **Play binding** | Each face-down play proven to come from player's current hand set | `playCards` circuit (with Merkle proof) |
| **Bluff resolution** | Openings revealed on challenge; ranks publicly verifiable against claim | `challenge` circuit |
| **Settlement honesty** | Winner + payouts derived from full game history | `settleGame` circuit |
| **Liveness / forfeit** | Idle players past `timeoutBlock` forfeit stake | Contract timeout function |

---

## Core primitive: card commitments

Every card is a Pedersen-style commitment:

```
cm = Commit(rank ‖ suit, nonce)
```

- Owner holds `(rank, suit, nonce)` as a witness
- Everyone sees `cm` on-ledger
- `cm` flows through zones (deck → hand → pile → discard) without leaking contents
- Re-randomization (multiplying by `Commit(0, r')`) shuffles identity without changing the openable value, enabling shuffle proofs

---

## The multi-party shuffle ceremony

The cryptographic backbone — derived from classical mental poker (Shamir-Rivest-Adleman 1979) modernized with **Bayer-Groth 2012** shuffle arguments for efficient ZK.

### Steps

```
1. GENESIS         House publishes 52 canonical commitments in canonical order,
                   fully opened. Everyone verifies the openings = real deck.

2. HOUSE SHUFFLE   House permutes + re-randomizes → posts new commitments
                   + Bayer-Groth shuffle proof π_H.

3. PLAYER SHUFFLE  Each player permutes + re-randomizes the prior output
                   → posts new commitments + shuffle proof π_P.
                   (For 1v1 vs Ai: house + 1 player. For N-player: N+1 shuffles.)

4. VRF CUT         Final entropy injected from Midnight VRF / block hash.
                   Ensures even house-and-player collusion can't predetermine order.

5. DEAL            For each draw, recipient receives the opening via encrypted
                   channel. Non-recipients prove they decrypted their layer
                   correctly without learning the card.

6. PLAY            Game proceeds. Hand commitments live on-ledger;
                   openings stay private.
```

### Why this is fair

- Each shuffler permutes **after** seeing the prior output.
- No single party knows the **composed** final permutation.
- The VRF cut means even all-but-one collusion can't fix outcome.
- Card identities are blinded the entire time (re-randomization).

### Sizing concern

- A 52-card Bayer-Groth proof: ~thousands of constraints. Fits in a single Compact circuit on current `compactc` (verify against the Midnight MCP playground before relying on this).
- A 260-card shoe is ~5× larger. May need to batch into 2–3 sub-shuffles per shuffler. Benchmark early.

---

## Covering proof-gen latency with a video ceremony

Proof generation for a full shuffle (especially shoe mode) will take ~20–30s. We turn that into a **feature**: a cinematic casino intro that runs while crypto chugs in the background.

| Time | Crypto happening | What player sees |
|---|---|---|
| 0–3s | Ante escrow tx confirms on Midnight | Chips slide to center, dealer nods |
| 3–8s | Deck genesis commitments published | New deck unboxed, ribbon cut, fanned face-up |
| 8–18s | Shuffle proofs generating (heaviest step) | Dealer riffle shuffle, multiple passes, hands blur |
| 18–22s | VRF cut card | Cut card inserted, deck tapped square |
| 22–28s | Encrypted deal | Cards slide to players, AI's hand fans face-down |
| 28–30s | Buffer / "Place your bets" | Camera pulls back to table, music swells |

**UX trick**: pre-render the video at multiple lengths (20s/25s/30s). Start playback when shuffle begins. If proofs finish early, fade gracefully; if they run long, loop the riffle segment seamlessly. Total perceived latency: **~30s feels right** for casino vibe (matches real blackjack table setup).

---

## Payment layer (Midnight)

### Contract sketch (Compact)

```text
┌──────────────────────────────────────────────────────────┐
│  CasinoTable contract                                    │
│                                                          │
│  escrow:       Map<player, stake>                        │
│  potTotal:     Counter                                   │
│  rakeBps:      Uint<16>                  // house cut    │
│  deckRoot:     Bytes<32>                 // post-shuffle  │
│  dealCursor:   Counter                                    │
│  handRoots:    Map<player, MerkleRoot>                    │
│  pile:         List<Commitment>                            │
│  discardPile:  List<Commitment>           // post-May-2026 │
│  status:       Enum { Ante, Shuffle, Deal, Play, Settle } │
│  timeoutBlock: Uint<64>                                    │
└──────────────────────────────────────────────────────────┘
```

### Stake flow

1. **`ante(amount)`** — transfers tokens to contract escrow.
2. Game proceeds only after all antes received.
3. **`settle(winner, payouts[], proof)`** — circuit verifies final game state, transfers escrow minus rake.
4. **`forfeitTimeout(absentPlayer)`** — if a player goes idle past `timeoutBlock`, their stake is awarded per configured rule (forfeit / split / refund-minus-fee).

### Token choice

- **MVP**: tDUST on Midnight testnet.
- **Production**: any Midnight-native token. Could later support a "Proof or Bluff Chip" loyalty token.

### Rake model (TBD)

- Flat % (e.g., 2%) — simplest, transparent
- Tiered by pot size — favors casual play
- Subscription / season pass — predictable revenue, no per-hand friction

---

## Compact circuits to build

| Circuit | Public inputs | Witness | Proves |
|---|---|---|---|
| `verifyDeckGenesis` | deck commitments[], canonical multiset hash | openings | Exactly the 52/260 canonical cards |
| `verifyShuffle` | inputCms[], outputCms[] | permutation σ, randomness r[] | output is a valid re-randomized permutation of input |
| `verifyDeal` | dealtCm, recipient | opening, deckIndex, Merkle proof | dealtCm is the next deck entry, opening matches |
| `playCards` | claim(rank, count), pileAdds[] | hand openings, Merkle proofs | cards came from player's hand set |
| `challenge` | pileTopN, openings[] | nonces | reveals actual ranks → settles bluff |
| `passTurn` | deckIndex | opening, signature | passing player draws next deck card |
| `settleGame` | finalState, winner | gameplay history | winner consistent with rules |

---

## Shoe mode (5 decks)

Identical protocol with 260 commitments. Two practical changes:

- **Reshuffle penetration**: real casinos reshuffle when ~75% of the shoe is consumed. Implement as `triggerReshuffle()` — repeats the shuffle ceremony with remaining cards. Shorter version of the video plays.
- **Card counting fairness**: if anti-counting is desired, reshuffle more aggressively. That's a game-design lever, not a crypto one.

---

## Adversarial cases & defenses

| Attack | Defense |
|---|---|
| House publishes bad genesis (53 cards or duplicate) | `verifyDeckGenesis` proof rejected → no stake leaves escrow |
| Shuffler refuses to publish proof | Timeout → forfeit, game restarts with bet redistributed |
| Player plays card not in hand | `playCards` Merkle proof fails |
| Player claims a card they didn't draw | `verifyDeal` requires recipient ack |
| House peeks at deck | Final permutation unknown without all parties' randomness |
| House + Player A collude vs Player B | VRF cut means even all-but-one collusion can't fix outcome |
| Replay attack on old game state | Game ID + nonce baked into every proof |
| Front-running a claim | Claims posted as commit-reveal (claim hash first, reveal on accept/challenge) |
| Side-channel info leak | All gameplay goes through wallet-signed proofs; nothing off-chain |

---

## Phased delivery

| Phase | Scope | Goal |
|---|---|---|
| **0** (current) | Plaintext local game, deck-reshuffle penalty mechanic | Gameplay loop tuned ✅ |
| **1** | Hand & pile commitments, trusted dealer, no payment | Demonstrate hand privacy + bluff resolution on Midnight |
| **2** | 2-party shuffle proof, VRF cut, encrypted deal | Provably fair single-deck, free-play |
| **3** | Stake escrow + settlement + rake | **Payable casino game, single deck** |
| **4** | Shoe mode (5 decks), reshuffle ceremony, video integration | Full casino experience |
| **5** | N-player tables, tournament mode, spectator proofs | Scale |

**Hackathon arc**: Phases 1–3 (≈ MVP for payable provably-fair POB).
**Post-hackathon**: 4–5.

---

## Open design questions

1. **Token**: tDUST only, or a custom chip token from day one?
2. **Rake model**: flat %, tiered, or subscription?
3. **Player count target**: 1v1 vs Ai MVP, 2-player human, or 3+?
4. **AI trust model**: does Ai stake real tokens (house-funded), play with house rules, or is it a tutorial mode that can't be played for money?
5. **Video production**: storyboard / AI-generate / commission?
6. **Regulatory posture**: free-to-play points, sweepstakes (US-friendly, Stake.us pattern), or offshore-licensed (Curaçao / Anjouan)? — same fork as BlindOracle.

---

## Cross-references

- **BlindOracle** has a related four-acts model (commit/lock/match/settle) that could share infrastructure with the POB casino contract.
- The deck-discard penalty mechanic implemented in `demoLand/src/game/engine.js` (May 2026) is the precursor to step (5) "DEAL" above — every draw consumes from a freshly re-randomized deck.
- `MIDNIGHT_VITALS.md` covers the broader Midnight integration story.

---

## Next steps

1. Validate Bayer-Groth proof size against `compactc` v0.30 via the Midnight MCP playground.
2. Sketch the `verifyDeckGenesis` and `verifyShuffle` circuits in isolation before integrating with gameplay.
3. Storyboard the shuffle video (30s master + loopable riffle segment).
4. Decide on token + rake + regulatory posture (open questions above).
