/**
 * index.js — Provider factory for Proof or Bluff
 *
 * Selects demoLand or realDeal providers based on environment.
 * Same pattern used across all DIDzMonolith products.
 */

/**
 * Get the current app mode from environment.
 * Defaults to 'demoland' if not set.
 */
function getAppMode() {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NEXT_PUBLIC_POB_MODE || 'demoland';
  }
  return 'demoland';
}

/**
 * Create the game provider for the current mode.
 *
 * demoLand: local state, direct card reveal on challenge
 * realDeal: Midnight private state, ZK proof on challenge
 */
async function createGameProvider() {
  const mode = getAppMode();

  if (mode === 'realdeal') {
    // TODO: Import and return realDeal game provider
    // const { RealDealGameProvider } = await import('../../realDeal/src/providers/realdeal/gameProvider.js');
    // return new RealDealGameProvider();
    throw new Error('realDeal game provider not yet implemented. Use demoland mode.');
  }

  const { DemoLandGameProvider } = await import('./demoland/gameProvider.js');
  return new DemoLandGameProvider();
}

/**
 * Create the AI provider for the current mode.
 *
 * Both modes use the same AI — the difference is where game state comes from.
 */
async function createAiProvider(iteration = 1) {
  if (iteration >= 3) {
    // Iteration 3: live AI agent
    // TODO: Import agent provider
    throw new Error('AI Agent provider (Iteration 3) not yet implemented.');
  }

  const { DemoLandAiProvider } = await import('./demoland/aiProvider.js');
  return new DemoLandAiProvider();
}

export {
  getAppMode,
  createGameProvider,
  createAiProvider,
};
