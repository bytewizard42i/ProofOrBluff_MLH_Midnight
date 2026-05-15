/**
 * agent.js — Live AI agent integration for Iteration 3
 *
 * Connects to an Anthropic-style LLM to generate real-time banter,
 * strategic decisions, and contextual media selection.
 *
 * STUB — not implemented yet. This file defines the interface and
 * will be wired up when Iteration 3 development begins.
 */

/**
 * AI Agent configuration.
 * The agent needs:
 *   - API key (BYOK — Bring Your Own Key, stored in .env)
 *   - Personality profile (charming liar, nervous genius, etc.)
 *   - Difficulty level (easy, medium, hard)
 *   - Game context (current hand, pile size, recent moves, player patterns)
 */

/**
 * Initialize the AI agent with a personality and difficulty.
 *
 * @param {Object} config
 * @param {string} config.personality - 'charming_liar' | 'nervous_genius' | 'cold_professional' | 'chaos_goblin'
 * @param {string} config.difficulty - 'easy' | 'medium' | 'hard'
 * @param {string} config.apiKey - Anthropic API key (from .env)
 * @returns {Object} agent instance
 */
async function initAgent({ personality, difficulty, apiKey }) {
  // TODO: Initialize LLM connection
  // TODO: Load personality system prompt
  // TODO: Set difficulty parameters
  console.warn('AI Agent (Iteration 3) is not yet implemented. Falling back to scripted AI.');
  return null;
}

/**
 * Ask the agent to decide what to play.
 * The agent considers game state, opponent patterns, and personality.
 *
 * @param {Object} agent - The agent instance
 * @param {Object} gameContext - Current game state summary
 * @returns {Object} { cardsToPlay, claimedRank, claimedCount, dialogue, mediaHint }
 */
async function agentDecidePlay(agent, gameContext) {
  // TODO: Send game context to LLM
  // TODO: Parse structured response (play decision + dialogue + media selection)
  // TODO: mediaHint tells the UI which expression/video to show
  throw new Error('AI Agent play decision not yet implemented.');
}

/**
 * Ask the agent whether to challenge the player's claim.
 *
 * @param {Object} agent - The agent instance
 * @param {Object} gameContext - Current game state including last claim
 * @returns {Object} { shouldChallenge, dialogue, mediaHint }
 */
async function agentDecideChallenge(agent, gameContext) {
  // TODO: Send context to LLM
  // TODO: Parse structured response
  throw new Error('AI Agent challenge decision not yet implemented.');
}

/**
 * Get a contextual reaction from the agent after a challenge resolves.
 *
 * @param {Object} agent - The agent instance
 * @param {Object} result - Challenge result and game context
 * @returns {Object} { dialogue, mediaHint, emotionTag }
 */
async function agentReact(agent, result) {
  // TODO: Generate emotional, contextual reaction
  throw new Error('AI Agent reaction not yet implemented.');
}

/**
 * Get a game-over message from the agent.
 *
 * @param {Object} agent - The agent instance
 * @param {boolean} aiWon - Whether the AI won
 * @param {Object} gameStats - Final game statistics
 * @returns {Object} { dialogue, mediaHint }
 */
async function agentGameOver(agent, aiWon, gameStats) {
  // TODO: Generate game-over message based on full game history
  throw new Error('AI Agent game-over not yet implemented.');
}

export {
  initAgent,
  agentDecidePlay,
  agentDecideChallenge,
  agentReact,
  agentGameOver,
};
