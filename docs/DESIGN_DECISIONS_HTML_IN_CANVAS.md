# proofOrBluff — HTML-in-Canvas + 3D Opponent Character

**Date**: April 21, 2026
**Status**: Recommendation — **adopt, scoped to the opponent character, lives in the shared UI layer.**
**Author**: Cassie
**Related**:
- `docs/DEMOLAND_VS_REALDEAL.md` — the canonical shared-UI protocol
- `BlindOracle-Gimbalabs_hackathon/docs/DESIGN_DECISIONS.md` — parallel decision for BlindOracle

---

## The question

Should proofOrBluff incorporate the new Chrome 148 **HTML-in-Canvas** API (and a WASM 3D object like the one Sebastien Guillemot has experimented with) for its UI when we build it?

## Short answer

**Yes — for the AI opponent character. Not for the rest of the UI. And it lives in the shared UI layer, identical on both demoLand and realDeal.**

The emotional core of proofOrBluff is *an expressive AI opponent with a face, a voice, and a personality*. That is the single most powerful place in the product to spend a "wow" rendering budget. Everything else (cards, score, menus) should stay as standard HTML/React so the game works in every browser without a flag.

---

## Honoring the demoLand / realDeal protocol

**Rule from `DEMOLAND_VS_REALDEAL.md`**: both sides share the **same rules, UI, and Ai**. The ONLY difference is the state/trust backend (localStorage vs Midnight private state).

### What this means for the opponent canvas

> The 3D AI opponent character — including HIC speech bubbles, mood switching, and the WASM renderer plug point — **must live in the shared UI layer** and be imported by both demoLand and realDeal identically.

```
proofOrBluff/
├── demoLand/src/          ← renders <OpponentCanvas mood={...}> from shared UI
├── realDeal/src/          ← renders <OpponentCanvas mood={...}> from shared UI
└── shared-ui/             ← NEW (when UI build starts)
    └── src/
        └── opponent-canvas/
            ├── OpponentCanvas.tsx      (React component, HIC-aware)
            ├── types.ts                (Wasm3dOpponent interface)
            ├── wasm3d-loader.ts        (pluggable, WASM/fallback)
            ├── personas.ts             (4 persona rigs/parameters)
            └── index.ts                (barrel)
```

A player toggling between demoLand and realDeal sees *the same* character, same animations, same speech bubbles, same accessibility, same fallback behavior. Only the *claim resolution* behind the character's words differs (localStorage reveal vs ZK proof).

### What specifically must be shared vs per-side

| Layer | Location | Notes |
|---|---|---|
| 3D character renderer + HIC bubbles | **shared-ui** | Identical both sides |
| Persona definitions (Charming Liar, Nervous Genius, Cold Professional, Chaos Goblin) | **shared-ui** | Same rigs, same animation parameters |
| Speech bubble component + subtitles | **shared-ui** | Same HTML/CSS |
| Card UI, score HUD, menus | **shared-ui** | Standard React, no HIC |
| Game engine / rules | **shared-ui** (pure logic — already in `demoLand/src/game/`) | Can stay in demoLand and be imported by realDeal, or promoted to `shared-ui/src/game/` when realDeal UI is built |
| Turn outcome resolution | **demoLand/** vs **realDeal/** | Only difference: mock reveal vs ZK circuit |
| State storage | **demoLand/** vs **realDeal/** | localStorage vs Midnight private state |

The opponent canvas is *completely agnostic* about whether the AI's claim just got revealed as a bluff via `localStorage.getItem('aiHand')` or via a Midnight ZK proof circuit. It only knows "a challenge just resolved with outcome `trueClaim | bluff`" and plays the appropriate animation/line.

---

## Where HIC genuinely shines for proofOrBluff

### 1. The 3D AI Opponent Character — ⭐ primary use case

The game's emotional hook is **loneliness relief through playful, personality-driven interaction** with the AI opponent. A 3D rendered character that actually emotes is *directly* aligned with that hook in a way no other feature is.

The four persona archetypes map perfectly to 3D animation:

| Persona | 3D opportunity |
|---|---|
| **Charming Liar** | Slow smirk, eye contact, subtle flirty tilts. A rigged face-mesh sells this in ways 2D images cannot. |
| **Nervous Genius** | Micro-twitches, eye dart, awkward hand-to-neck gestures — all hard in 2D, natural in 3D rig. |
| **Cold Professional** | Minimal motion. Long unblinking stare. The 3D subtlety of *not moving* is more intimidating than any 2D frame. |
| **Chaos Goblin** | Full-body bounce, unpredictable head tilts, exaggerated mouth. 3D physics lets chaos feel real. |

**Why HIC specifically?** Because the AI *talks*. Speech bubbles, subtitles, chat transcripts are HTML. Rendering them as HTML *inside* the 3D scene (via `<canvas layoutsubtree>`) gives us:

- **Accessibility preserved** — screen readers read subtitles, tab order works, keyboard dismissal works
- **Text stays crisp** — no font-rendering-on-a-texture fuzziness
- **Styling stays simple** — normal CSS, no WebGL text atlas, no signed-distance fields
- **Speech bubble sits "in" the scene** — sampled onto a surface that follows the character's head, rather than floating over the canvas as a disconnected HTML overlay

### 2. The Dealer Shuffle Intro — ⭐ secondary use case

The game already plans to open with *"a video of an Ai dealer shuffling the cards."* Upgrading that to a 3D dealer (same opponent-character rig, different costume) doubles as:

- A visually impressive opening that makes the demo look high-budget
- **Technical cover for proof-server startup latency** in realDeal mode (already in the plan — 3D version is just more impressive cover)

This use case is *realDeal-specific* only in that the cover latency matters there. demoLand can play the same 3D intro for consistency, or skip it for speed. **The component is identical; the callsite decides whether to play it.**

### 3. Shot Glass + Lie Detector Micro-games — *maybe*

The Party Mode shot glass and the Lie Detector button flash are moments the game *wants* to feel physical and weighty. A 3D shot glass that lands with shadow/reflection, clickable *inside* the canvas via HIC, is a stronger feel than a 2D HTML button.

**Caveat**: these are 1–3 second moments. Don't over-engineer. A well-animated 2D CSS shot glass is 80% as good at 5% of the cost. Revisit only after the opponent character is working.

---

## Where HIC does NOT belong

| Subsystem | Reason |
|---|---|
| **Card hand / pile / deck UI** | Cards are already physical metaphors in 2D. A 3D card table adds complexity without adding emotional depth. Keep cards as React components. |
| **Score / round / phase displays** | These must stay accessible and readable in every browser. No flag-gated rendering for core stats. |
| **Character select menu** | The picture menu is 2D by design. 3D previews of each persona would be cool but is post-launch polish. |
| **Casino mode wager UI** | Money-adjacent UI must work everywhere. No flag. |
| **Tutorial / Help / Settings** | Standard HTML. Zero reason to put these in a canvas. |

**The rule**: use HIC where *character expressiveness* is the product. Everything else uses plain React.

---

## Why this is different from BlindOracle's decision

BlindOracle's `OracleCanvas` uses HIC for the *entire* entry screen — the canvas IS the experience, and the whole game has one main screen. proofOrBluff is a multi-screen card game with a persistent character. The scope here is the **character presentation layer**, not the whole UI.

Both projects can share the same `Wasm3dOracle`-style interface pattern and fallback strategy. When proofOrBluff's shared UI is built, we lift the scaffold from `BlindOracle-Gimbalabs_hackathon/blindoracle-ui/src/oracle-canvas/` and adapt it — renaming `OracleCanvas` → `OpponentCanvas` and `OracleMood` → `OpponentMood` (or similar). If duplication becomes material, promote the shared bits to a PixyPi workspace package (e.g. `@pixypi/html-in-canvas-react`) both projects can depend on.

---

## Compatibility and fallback (same as BlindOracle)

| Browser | Behavior |
|---|---|
| Chrome 148+ with flag on | HIC path — speech bubbles render *inside* `<canvas layoutsubtree>` sampled onto the character's head |
| Chrome with flag off | Fallback — speech bubbles render as absolutely-positioned HTML overlays; 3D character still renders via WebGL/WebGPU |
| Firefox / Safari | Fallback path (HIC not yet available elsewhere) |
| No WASM / low-GPU | Plain 2D character portrait with HTML speech bubbles — same UX, zero fanciness |

Feature detection happens once at mount. Every player still gets a playable game. Only the *aesthetic* differs by browser. This is mandatory because proofOrBluff is a consumer card game — it cannot ship behind a Chrome flag for its primary audience.

---

## Integration plan — respecting the protocol

### Phase 1 — demoLand UI with 2D character (first playable)

Build the demoLand UI with **standard 2D character portraits + HTML speech bubbles**. Ship the full game loop (5 modes, 4 personas, tutorial, character select, scoring, shot glass, lie detector) without any 3D or HIC. This proves the game loop and the persona design.

- Shared UI folder created: `proofOrBluff/shared-ui/src/`
- `<OpponentPortrait mood={...} persona={...} />` component in shared-ui using 2D images
- demoLand imports from shared-ui, wires localStorage backend

### Phase 2 — realDeal UI with the same shared UI

Stand up the realDeal UI. It imports the **exact same** `<OpponentPortrait>` component. Only the backend provider wiring changes (Midnight wallet, ZK circuits, private state). At this point we verify the protocol: both sides visually identical.

### Phase 3 — Upgrade to 3D opponent (shared-ui module swap)

- Rename `<OpponentPortrait>` → `<OpponentCanvas>` in shared-ui
- Add `opponent-canvas/` folder mirroring `blindoracle-ui/src/oracle-canvas/` structure
- Implement the 4 persona rigs via the `Wasm3dOpponent` interface
- Feature-detect HIC; fall back to 2D portraits when unavailable (same component, graceful degradation)
- Both demoLand and realDeal automatically get the upgrade

### Phase 4 — Integrate Sebastien's WASM 3D artifact (if/when located)

- Drop WASM bundle into `shared-ui/public/wasm/opponent-3d/`
- Implement the adapter in `shared-ui/src/opponent-canvas/wasm3d-sebastien-adapter.ts`
- Flip `USE_WASM_OPPONENT = true`

### Phase 5 — Optional: dealer shuffle + shot glass upgrades

Only if Phase 3/4 land cleanly and there's runway. These are polish, not critical path.

---

## Reference links

- **HTML-in-Canvas spec**: https://wicg.github.io/html-in-canvas/
- **WICG repo**: https://github.com/WICG/html-in-canvas
- **Chrome flag**: `chrome://flags/#canvas-draw-element` (enable in Chrome 148+ Canary/Beta)
- **Sibling scaffold (to lift from)**: `/home/js/DIDzMonolith/BlindOracle-Gimbalabs_hackathon/blindoracle-ui/src/oracle-canvas/`
- **The shared-UI protocol**: `docs/DEMOLAND_VS_REALDEAL.md`

---

## Open questions

| Question | Who decides | When |
|---|---|---|
| Should `shared-ui/` be its own npm workspace or just a folder demoLand/realDeal import from relatively? | John | When UI build starts |
| Is Sebastien's WASM artifact WebGL, WebGPU, or WASM-native canvas 2D? | Once we locate the repo | Before Phase 4 |
| Do we want one rig with swappable textures for all 4 personas, or 4 separate rigs? | Design call during Phase 3 | Before 3D work |
| Does proofOrBluff want a shared `@pixypi/html-in-canvas-react` package with BlindOracle? | John — tradeoff of reuse vs simplicity | When second use-site actually exists |

---

*Last updated: April 21, 2026*
