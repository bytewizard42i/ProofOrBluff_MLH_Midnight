/**
 * playerStats.js — Client-side player progression system.
 *
 * Mirrors the rank tiers, achievements, and stat tracking from
 * realDeal/contracts/player-stats.compact so the demoLand UI can
 * show progression NOW. When the realDeal path goes live, this
 * module gets replaced by on-chain reads.
 *
 * All data is persisted to localStorage keyed by player handle.
 */

// ============================================================================
// RANK TIERS — exact thresholds from player-stats.compact
// ============================================================================

export const RANK_TIERS = [
  { id: 0, name: 'Bronze',   minPoints: 0    },
  { id: 1, name: 'Silver',   minPoints: 1000 },
  { id: 2, name: 'Gold',     minPoints: 1200 },
  { id: 3, name: 'Platinum', minPoints: 1400 },
  { id: 4, name: 'Diamond',  minPoints: 1600 },
  { id: 5, name: 'Master',   minPoints: 1800 },
  { id: 6, name: 'Legend',   minPoints: 2000 },
];

// ============================================================================
// RANK POINT DELTAS — from player-stats.compact comments
// ============================================================================

const RANK_DELTAS = {
  win:          25,
  loss:         25,
  forfeitWin:   10,
  forfeitLoss:  40,
};

// ============================================================================
// ACHIEVEMENTS — derived from counters, same as the contract
// ============================================================================

export const ACHIEVEMENTS = [
  { id: 0, key: 'FIRST_MATCH',   label: 'First Match',     desc: 'Play your first match',        test: (s) => s.matchesPlayed >= 1 },
  { id: 1, key: 'FIRST_WIN',     label: 'First Win',       desc: 'Win your first match',         test: (s) => s.matchesWon >= 1 },
  { id: 2, key: 'TEN_WINS',      label: 'Ten Wins',        desc: 'Win 10 matches',               test: (s) => s.matchesWon >= 10 },
  { id: 3, key: 'HUNDRED_WINS',  label: 'Hundred Wins',    desc: 'Win 100 matches',              test: (s) => s.matchesWon >= 100 },
  { id: 4, key: 'STREAK_FIVE',   label: 'Hot Streak',      desc: 'Win 5 matches in a row',       test: (s) => s.longestWinStreak >= 5 },
  { id: 5, key: 'STREAK_TEN',    label: 'Unstoppable',     desc: 'Win 10 matches in a row',      test: (s) => s.longestWinStreak >= 10 },
  { id: 6, key: 'REACH_GOLD',    label: 'Gold Rank',       desc: 'Reach Gold tier (1200 pts)',    test: (s) => s.peakRankPoints >= 1200 },
  { id: 7, key: 'REACH_DIAMOND', label: 'Diamond Rank',    desc: 'Reach Diamond tier (1600 pts)', test: (s) => s.peakRankPoints >= 1600 },
  { id: 8, key: 'REACH_MASTER',  label: 'Master Rank',     desc: 'Reach Master tier (1800 pts)',  test: (s) => s.peakRankPoints >= 1800 },
  { id: 9, key: 'REACH_LEGEND',  label: 'Legend Rank',     desc: 'Reach Legend tier (2000 pts)',   test: (s) => s.peakRankPoints >= 2000 },
];

// ============================================================================
// HELPERS
// ============================================================================

const STORAGE_PREFIX = 'pob.stats.';

function storageKey(handle) {
  return STORAGE_PREFIX + handle.toLowerCase();
}

/** Determine the current rank tier from rank points. */
export function getTier(rankPoints) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (rankPoints >= RANK_TIERS[i].minPoints) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
}

/** Points needed to reach the next tier. Returns null if already Legend. */
export function pointsToNextTier(rankPoints) {
  const current = getTier(rankPoints);
  const nextIdx = current.id + 1;
  if (nextIdx >= RANK_TIERS.length) return null;
  return RANK_TIERS[nextIdx].minPoints - rankPoints;
}

/** Progress fraction (0-1) within the current tier toward the next. */
export function tierProgress(rankPoints) {
  const current = getTier(rankPoints);
  const nextIdx = current.id + 1;
  if (nextIdx >= RANK_TIERS.length) return 1; // Legend — full bar
  const rangeStart = current.minPoints;
  const rangeEnd = RANK_TIERS[nextIdx].minPoints;
  return Math.min(1, Math.max(0, (rankPoints - rangeStart) / (rangeEnd - rangeStart)));
}

/** Get unlocked achievement IDs for a given stats record. */
export function getUnlockedAchievements(stats) {
  return ACHIEVEMENTS.filter((a) => a.test(stats));
}

// ============================================================================
// DEFAULT RECORD — matches PlayerRecord in the contract (start at 1000 = Silver)
// ============================================================================

function createFreshRecord(handle) {
  return {
    handle,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    matchesForfeited: 0,
    rankPoints: 1000,
    peakRankPoints: 1000,
    currentWinStreak: 0,
    longestWinStreak: 0,
    successfulChallenges: 0,
    failedChallenges: 0,
    firstMatchAt: null,
    lastMatchAt: null,
  };
}

// ============================================================================
// PUBLIC API
// ============================================================================

/** Load (or create) the stats record for a handle. */
export function loadStats(handle) {
  if (!handle) return createFreshRecord('');
  try {
    const raw = window.localStorage.getItem(storageKey(handle));
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with fresh record to pick up any newly added fields
      return { ...createFreshRecord(handle), ...parsed, handle };
    }
  } catch { /* corrupted — start fresh */ }
  return createFreshRecord(handle);
}

/** Persist a stats record. */
function saveStats(stats) {
  if (!stats.handle) return;
  try {
    window.localStorage.setItem(storageKey(stats.handle), JSON.stringify(stats));
  } catch { /* localStorage full or unavailable */ }
}

/**
 * Record a match result. Returns { stats, newAchievements }.
 * newAchievements = achievements that were NOT unlocked before but ARE now.
 *
 * @param {string} handle
 * @param {'win'|'loss'} outcome
 * @param {object} matchStats - { successfulChallenges, failedChallenges } from the game
 */
export function recordMatchResult(handle, outcome, matchStats = {}) {
  const prev = loadStats(handle);
  const achievementsBefore = new Set(getUnlockedAchievements(prev).map((a) => a.id));

  const isWin = outcome === 'win';
  const delta = isWin ? RANK_DELTAS.win : RANK_DELTAS.loss;
  const nextRankPoints = isWin
    ? prev.rankPoints + delta
    : Math.max(0, prev.rankPoints - delta);

  const nextCurrentStreak = isWin ? prev.currentWinStreak + 1 : 0;
  const nextLongestStreak = Math.max(prev.longestWinStreak, nextCurrentStreak);

  const now = Date.now();

  const updated = {
    ...prev,
    matchesPlayed: prev.matchesPlayed + 1,
    matchesWon: isWin ? prev.matchesWon + 1 : prev.matchesWon,
    matchesLost: !isWin ? prev.matchesLost + 1 : prev.matchesLost,
    rankPoints: nextRankPoints,
    peakRankPoints: Math.max(prev.peakRankPoints, nextRankPoints),
    currentWinStreak: nextCurrentStreak,
    longestWinStreak: nextLongestStreak,
    successfulChallenges: prev.successfulChallenges + (matchStats.successfulChallenges || 0),
    failedChallenges: prev.failedChallenges + (matchStats.failedChallenges || 0),
    firstMatchAt: prev.firstMatchAt || now,
    lastMatchAt: now,
  };

  saveStats(updated);

  const achievementsAfter = getUnlockedAchievements(updated);
  const newAchievements = achievementsAfter.filter((a) => !achievementsBefore.has(a.id));

  return { stats: updated, newAchievements };
}
