/**
 * aiProvider.js — realDeal AI placeholder.
 *
 * realDeal is strictly PvP. There is no AI opponent. We export a
 * provider that throws on every call so the demoLand AI UI components
 * fail loudly if accidentally rendered in realDeal mode (instead of
 * silently sending fake moves).
 *
 * If/when we add a "play-vs-bot but with on-chain commit-reveal entropy"
 * mode, that lives here.
 */

export class RealDealAiProvider {
  init() { /* no-op */ }

  decidePlay() {
    throw new Error('realDeal has no AI opponent — match flow requires a second human wallet.');
  }

  decideChallenge() {
    throw new Error('realDeal has no AI opponent — match flow requires a second human wallet.');
  }

  getReaction() {
    return { dialogue: '', mediaHint: null, emotionTag: null };
  }

  getGameOverMessage() {
    return { dialogue: '', mediaHint: null };
  }
}

export default RealDealAiProvider;
