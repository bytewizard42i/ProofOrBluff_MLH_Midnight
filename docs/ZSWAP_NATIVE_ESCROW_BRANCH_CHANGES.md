# Zswap Native Escrow Changes

## Branch

- Branch: `zswap-native-escrow`
- Main contract changed: `realDeal/contracts/proof-or-bluff.compact`

## What Changed

This branch upgrades the `proof-or-bluff.compact` contract from an **off-chain escrow model** to a **native on-contract Zswap escrow model**.

Before this branch:

- `wagerAmount` was only a recorded number.
- The contract exposed an `escrowReleased` latch after game over.
- Actual payout was expected to happen off-chain through the SDK or backend.

After this branch:

1. `createMatch(...)` now accepts a `ShieldedCoinInfo` coin input.
   - The contract checks that the creator's deposited coin value matches `wagerAmount`.
   - The contract receives that shielded coin and stores it for the match.

2. `joinMatch(...)` now also accepts a `ShieldedCoinInfo` coin input.
   - The joiner must deposit the same wager value.
   - The contract merges both players' shielded coins into a single contract-held pot.

3. New ledger storage was added:
   - `matchPots: Map<Bytes<32>, QualifiedShieldedCoinInfo>`
   - This stores the live escrow pot for each match.

4. Match state now tracks escrow presence explicitly:
   - Added `potHasCoin: Boolean` to `MatchState`
   - This helps prevent invalid payout or double-claim flows.

5. `claimPayout(...)` now performs real shielded settlement.
   - It verifies the caller is the winner.
   - It loads the stored pot.
   - It sends the full shielded pot to the winner's `ZswapCoinPublicKey`.
   - It removes the stored pot and marks escrow as released.

6. State propagation was updated across match lifecycle circuits.
   - Every circuit that reconstructs `MatchState` now preserves `potHasCoin`.

## What This Is Used For

This change is used to make wagered matches settle **inside the Midnight contract flow**, not in a trusted off-chain service.

Practical use:

- Player 1 opens match and deposits stake.
- Player 2 joins match and deposits matching stake.
- Contract holds both stakes privately as a shielded pot.
- Game plays out normally.
- Winner calls `claimPayout(...)` and receives pot directly from contract.

This makes `proof-or-bluff.compact` closer to a real money or tournament-ready game contract instead of only a gameplay proof contract.

## How These Changes Help

### 1. Removes backend trust from settlement

Old model needed off-chain service or SDK to honor payouts correctly.

New model lets contract itself custody and release wagered funds.

Why this helps:

- less operator trust
- less dispute surface
- less mismatch between game result and payout result

### 2. Makes payout atomic with contract state

The winner is already determined on-chain. Now payout also follows on-chain logic.

Why this helps:

- game result and fund release stay in same system
- easier auditing
- fewer settlement edge cases outside contract

### 3. Better fit for Midnight privacy model

The game already uses shielded and privacy-preserving ideas for play resolution. Native Zswap escrow keeps wager flow aligned with that model.

Why this helps:

- stake custody stays in Midnight-native primitives
- better consistency with private game architecture
- cleaner story for privacy-first wagering

### 4. Stronger foundation for competitive modes

This branch is useful for:

- real wager PvP
- private high-stakes matches
- ranked cash tables
- tournament prize escrow patterns

Why this helps:

- easier to extend into production match flows
- better credibility for "realDeal" path
- less rework later when moving beyond MVP

## Contract-Level Flow After This Change

1. `createMatch` receives creator deposit.
2. `joinMatch` receives joiner deposit and merges pot.
3. Contract keeps escrow during gameplay.
4. Winner is decided through existing rules and challenge logic.
5. `claimPayout` transfers shielded pot to winner.
6. Pot record is removed, and double claim is blocked.

## Key Benefits in One Line

This branch turns wagers from a **recorded promise** into a **contract-enforced shielded payout flow**.

## Current Scope

This branch improves payout custody and settlement. It does **not** yet add every future escrow feature, such as:

- cancellation or refund flows
- abandoned-match recovery
- split payouts or fee extraction
- richer tournament treasury logic

Those can build on top of this escrow foundation later.
