/**
 * difficulty.js — Difficulty level definitions for AI opponents
 *
 * Shared by both scripted (Iterations 1-2) and agent (Iteration 3) AI.
 * Defines behavioral parameters that shape how the AI plays.
 */

const DIFFICULTY_LEVELS = {
  easy: {
    name: 'Easy',
    description: 'Relaxed play. AI bluffs rarely and challenges infrequently. Good for learning.',
    bluffFrequency: 0.2,       // 20% — mostly honest
    challengeFrequency: 0.15,  // 15% — usually accepts claims
    cardTracking: false,       // Does not count cards
    patternAdaptation: false,  // Does not learn player habits
    tellReliability: 0.7,      // 70% — tells usually correlate with truth/lie
    reactionDelay: 1500,       // ms — pauses before acting (feels thoughtful)
    bluffConvincing: 0.3,      // 30% — bluffs are often obvious
  },
  medium: {
    name: 'Medium',
    description: 'Competitive play. AI bluffs strategically and has detectable patterns.',
    bluffFrequency: 0.35,
    challengeFrequency: 0.3,
    cardTracking: false,       // Aware but not counting
    patternAdaptation: false,  // Some adaptation in agent mode
    tellReliability: 0.5,      // 50% — tells are coin-flip reliable
    reactionDelay: 1000,
    bluffConvincing: 0.55,
  },
  hard: {
    name: 'Hard',
    description: 'Expert play. AI uses card counting, adapts to your patterns, and misleads deliberately.',
    bluffFrequency: 0.5,
    challengeFrequency: 0.45,
    cardTracking: true,        // Full counting in Home Mode
    patternAdaptation: true,   // Learns player challenge/accept patterns
    tellReliability: 0.25,     // 25% — tells are actively misleading
    reactionDelay: 600,
    bluffConvincing: 0.8,      // 80% — bluffs are very convincing
  },
};

/**
 * Get the difficulty profile for a given level.
 */
function getDifficultyProfile(level = 'medium') {
  return DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS.medium;
}

/**
 * Get all available difficulty levels with metadata.
 */
function getAvailableDifficulties() {
  return Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => ({
    key,
    name: value.name,
    description: value.description,
  }));
}

export {
  DIFFICULTY_LEVELS,
  getDifficultyProfile,
  getAvailableDifficulties,
};
