# Note from John — branch repair, May 16 2026

Hey Chris! 👋 Quick note about this branch.

## TL;DR

Your `NiGHTC-dev` branch has been **rebased onto current `main`**. Your
original commits are preserved as a tag (`chris-NiGHTC-dev-original`)
in case anything looks off. Nothing of yours was thrown away.

## What happened

Between when you branched off `292cd27` and right now, `main` moved
forward significantly:

- **v8 SDK migration** for `realDeal/cli` and `realDeal/app` — the
  whole Midnight stack (ledger-v8, wallet-sdk-*, midnight-js,
  compact-js) was upgraded. Both surfaces now work end-to-end against
  the local stack. CLI lands real on-chain transactions; browser app
  loads cleanly with WASM and proof-server piping wired up.
- **Local-dev guide** at `realDeal/docs/LOCAL_DEV_GUIDE.md` plus
  committed test seeds in `realDeal/cli/.env` (local-only fakes).
- **Deck auto-recycle** in `demoLand/src/game/engine.js` — fixes the
  mid-game stall when the deck ran out. The discard pile now recycles
  back as a "reshoe" when a draw would underflow.
- **Live proof-server log panel** in the browser app — a draggable,
  resizable side panel that shows ZK proofs being generated in real
  time during the demo.

If you'd merged your branch as-is, the deck-recycle helper would have
been silently dropped (the auto-merge engine collapsed both edits into
the older shape). That's why we rebased instead of merging.

## What I did to your branch

1. Saved your original branch state as a permanent tag:
   `chris-NiGHTC-dev-original` (pushed to origin)
2. **Cherry-picked your bug-fix commit (`5b8ac18`) onto `main`** — your
   3 fixes are now in the canonical history, with you as the author:
   - `acceptClaim()` win-condition check
   - `getChallengeReaction()` honest-proven dialogue
   - Log array clone in `playCards`/`acceptClaim`/`challenge`
   - Plus your `test-bugs.mjs` (now part of the test suite!)
3. **Recreated `NiGHTC-dev` based on current `main`**, so you don't
   have to deal with any of the v8 conflicts manually.
4. Cherry-picked your **leveling-system commit (`e1f5a76`) on top**
   — `src/playerStats.js` and the `src/App.jsx` changes are still
   here, ready for you to keep iterating on. We just want to discuss
   how it interacts with our current header design and the new
   ProofServerLog panel before merging this part to `main`.
5. Wrote this note. 🙂

## How to keep working

```bash
git fetch origin
git checkout NiGHTC-dev
git reset --hard origin/NiGHTC-dev   # if your local copy diverged
```

Your leveling-system commit is the new HEAD. Build on top of it.

## If you want to see what changed on main

```bash
git log --oneline chris-NiGHTC-dev-original..origin/main
```

You'll see the v8 migration, the local-dev guide, the deck-recycle fix,
and the proof-server panel. The bug fixes you wrote are right there in
that history, with your name on them.

Thanks for the bug hunt — those were real fixes, well-tested, and we're
shipping them. The leveling UI is a great idea; let's chat about visual
integration before it lands on main.

— John
