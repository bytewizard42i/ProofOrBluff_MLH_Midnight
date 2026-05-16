import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  unlockAudio,
  setMuted as setAudioMuted,
  playYouCaughtAi,
  playYouGotCaught,
  playYouSurvivedChallenge,
  playYouMisCalled,
  playGameWon,
  playGameLost,
  playSubmitClick,
  startBackgroundMusic,
  stopBackgroundMusic,
} from './sounds.js';
import {
  initGame,
  playCards,
  acceptClaim,
  challenge,
} from '../demoLand/src/game/engine.js';
import { formatClaim } from '../demoLand/src/game/rules.js';
import { RANKS } from '../demoLand/src/game/deck.js';
import {
  decidePlay,
  decideChallenge,
  getChallengeReaction,
  getGameOverDialogue,
  pickRandom,
  DIALOGUE,
} from '../demoLand/src/game/ai/scripted.js';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const SUIT_GLYPH = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLOR = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black',
};

// Neon palette for pair-group highlights. Each rank present 2+ times in the
// hand is assigned the next available color from this list.
const PAIR_COLORS = [
  { color: '#ff3df0', glow: 'rgba(255, 61, 240, 0.6)' }, // magenta
  { color: '#3dffd5', glow: 'rgba(61, 255, 213, 0.6)' }, // cyan-mint
  { color: '#ff8c3d', glow: 'rgba(255, 140, 61, 0.6)' }, // orange
  { color: '#a3ff3d', glow: 'rgba(163, 255, 61, 0.6)' }, // lime
  { color: '#3d8cff', glow: 'rgba(61, 140, 255, 0.6)' }, // electric blue
  { color: '#ff3d6e', glow: 'rgba(255, 61, 110, 0.6)' }, // hot pink
  { color: '#b03dff', glow: 'rgba(176, 61, 255, 0.6)' }, // purple
];

/**
 * Build a map of rank → { color, glow } for ranks appearing 2+ times in hand.
 */
function detectPairs(hand) {
  const counts = {};
  for (const card of hand) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  const map = {};
  let i = 0;
  for (const rank of Object.keys(counts)) {
    if (counts[rank] >= 2) {
      map[rank] = PAIR_COLORS[i % PAIR_COLORS.length];
      i += 1;
    }
  }
  return map;
}

function PlayingCard({ card, selected, onClick, disabled, pairColor, tossing }) {
  const color = SUIT_COLOR[card.suit];
  const glyph = SUIT_GLYPH[card.suit];
  const classes = [
    'card',
    color,
    selected ? 'selected' : '',
    disabled ? 'disabled' : '',
    pairColor ? 'pair' : '',
    tossing ? 'tossing' : '',
  ].filter(Boolean).join(' ');
  const style = pairColor
    ? { '--pair-color': pairColor.color, '--pair-glow': pairColor.glow }
    : undefined;
  return (
    <div
      className={classes}
      style={style}
      onClick={disabled ? undefined : onClick}
      role="button"
      aria-pressed={selected}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      <div className="corner top">
        <span>{card.rank}</span>
        <span>{glyph}</span>
      </div>
      <div className="suit-large">{glyph}</div>
    </div>
  );
}

function CardBack({ label = 'POB' }) {
  return <div className="card-back">{label}</div>;
}

/**
 * Big animated green arrow that flips between pointing UP (Ai's turn) and
 * DOWN (your turn). Sits to the left of the "How many" rank so it's the
 * first thing you see at a glance.
 */
function TurnArrow({ direction }) {
  return (
    <div className={`turn-arrow ${direction}`} aria-label={direction === 'down' ? 'Your turn' : "Ai's turn"}>
      <svg viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
        {/* Shaft + arrowhead. The shape is drawn pointing DOWN; we rotate
            via CSS for the UP variant so both share one path. */}
        <path
          d="M24 4 H40 V44 H56 L32 76 L8 44 H24 Z"
          fill="currentColor"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span className="turn-label">{direction === 'down' ? 'Your turn' : "Ai's turn"}</span>
    </div>
  );
}

/**
 * Pick a delay (ms) for an Ai play. Confident truthful plays come back
 * fast; bluffs more often pause to "think." Either branch sometimes picks
 * the opposite range so the timing itself can be a misdirection.
 */
function pickAiPlayDelay(isBluff) {
  // 30% chance the Ai chooses a deceptive timing (fast-when-bluffing or
  // slow-when-honest) to keep the player guessing.
  const flip = Math.random() < 0.3;
  const slow = (isBluff && !flip) || (!isBluff && flip);
  if (slow) return 1500 + Math.random() * 1400; // 1.5 – 2.9s
  return 300 + Math.random() * 600;             // 0.3 – 0.9s
}

/**
 * Pick a delay (ms) for an Ai accept/challenge decision. We don't get the
 * decision until we call decideChallenge, so we use a generic spread:
 * sometimes snappy (instinct), sometimes deliberate.
 */
function pickAiDecisionDelay() {
  const r = Math.random();
  if (r < 0.35) return 250 + Math.random() * 500;   // snap reaction
  if (r < 0.75) return 900 + Math.random() * 700;   // moderate
  return 1800 + Math.random() * 1200;               // up to ~3s, "deliberation"
}

// ────────────────────────────────────────────────────────────
// Scoreboard + Bluff probability
// ────────────────────────────────────────────────────────────

/**
 * How many copies of each rank exist in the active deck.
 * Home mode = 1 standard deck = 4 of each rank.
 * Casino mode = 5 decks = 20 of each rank.
 */
function copiesPerRank(mode) {
  return mode === 'casino' ? 20 : 4;
}

/**
 * Estimate the probability that the Ai's most recent claim is a bluff.
 * Combines three signals:
 *   1. Hard impossibility — if the player holds enough of the claimed rank
 *      that the Ai literally can't have what they claim, P = 1.
 *   2. Pressure — the closer the claim is to the maximum the Ai could
 *      truthfully have, the more suspicious it is.
 *   3. Observed bluff rate — historical fraction of Ai plays revealed as
 *      bluffs via challenges, blended toward a mode-specific prior.
 *
 * Returns null if there is no Ai claim to evaluate, otherwise:
 *   { p: 0..1, reason: string, stats: {...} }
 */
function estimateAiBluffProbability(state, settings) {
  if (!state.lastPlay || state.lastPlay.player !== 'ai') return null;
  const { claimedRank, claimedCount } = state.lastPlay;
  const copies = copiesPerRank(state.mode);
  const playerHasOfRank = state.playerHand.filter((c) => c.rank === claimedRank).length;
  const pileHasOfRank = state.pile.filter((c) => c.rank === claimedRank).length;
  const aiCanHaveAtMost = Math.max(0, copies - playerHasOfRank - pileHasOfRank);

  if (claimedCount > aiCanHaveAtMost) {
    return {
      p: 1.0,
      reason: `Impossible: only ${aiCanHaveAtMost} ${claimedRank}${aiCanHaveAtMost === 1 ? '' : 's'} could exist in the Ai's hand. They claim ${claimedCount}.`,
      stats: { playerHasOfRank, aiCanHaveAtMost, copies },
    };
  }

  // Difficulty prior — matches the bluffChance in the scripted Ai.
  const PRIOR = { easy: 0.2, medium: 0.35, hard: 0.5 };
  const prior = PRIOR[settings.difficulty] ?? 0.35;

  // Observed bluff rate (Laplace-smoothed so a single observation doesn't dominate).
  const observedNum = state.stats.aiBluffsCaught + 1;
  const observedDen = state.stats.aiPlays + 2;
  const observed = observedNum / observedDen;

  // Blend prior and observed (more weight to observed as plays accumulate).
  const weight = Math.min(1, state.stats.aiPlays / 6);
  const baseRate = (1 - weight) * prior + weight * observed;

  // Pressure: claimedCount / aiCanHaveAtMost in [0, 1]. Adds up to +0.45.
  const pressure = aiCanHaveAtMost > 0 ? Math.min(1, claimedCount / aiCanHaveAtMost) : 1;
  const pressureBonus = 0.45 * pressure;

  let p = Math.min(0.97, baseRate + pressureBonus * 0.6);
  if (claimedCount === aiCanHaveAtMost) p = Math.min(0.95, p + 0.1);

  const reason =
    `Ai bluff rate so far: ${state.stats.aiBluffsCaught}/${state.stats.aiPlays} caught` +
    ` (${settings.difficulty} prior ${(prior * 100).toFixed(0)}%).` +
    ` You hold ${playerHasOfRank} ${claimedRank}${playerHasOfRank === 1 ? '' : 's'};` +
    ` they claim ${claimedCount} of a possible ${aiCanHaveAtMost}.`;

  return { p, reason, stats: { playerHasOfRank, aiCanHaveAtMost, copies } };
}

function Scoreboard({ state }) {
  const aiCount = state.aiHand.length;
  const youCount = state.playerHand.length;
  const { rounds, aiBluffsCaught, playerBluffsCaught, playerFailedChallenges } = state.stats;
  return (
    <aside className="scoreboard">
      <div className="score-cell ai">
        <div className="score-label">Ai cards</div>
        <div className="score-number">{aiCount}</div>
      </div>
      <div className="score-stats">
        <div className="stat">
          <span className="stat-label">Rounds</span>
          <span className="stat-value">{rounds}</span>
        </div>
        <div className="stat good">
          <span className="stat-label">🟢 Bluffs caught</span>
          <span className="stat-value">{aiBluffsCaught}</span>
        </div>
        <div className="stat bad">
          <span className="stat-label">🔴 You got caught</span>
          <span className="stat-value">{playerBluffsCaught}</span>
        </div>
        <div className="stat bad">
          <span className="stat-label">❌ Wrong calls</span>
          <span className="stat-value">{playerFailedChallenges}</span>
        </div>
      </div>
      <div className="score-cell you">
        <div className="score-label">Your cards</div>
        <div className="score-number">{youCount}</div>
      </div>
    </aside>
  );
}

function BluffOddsBadge({ estimate }) {
  if (!estimate) return null;
  const pct = Math.round(estimate.p * 100);
  const cls = pct >= 70 ? 'high' : pct >= 40 ? 'med' : 'low';
  return (
    <div className={`bluff-odds ${cls}`}>
      <div className="odds-headline">
        <span className="odds-label">Bluff odds</span>
        <span className="odds-value">{pct}%</span>
      </div>
      <div className="odds-reason">{estimate.reason}</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Tutorial / How-to-play
// ────────────────────────────────────────────────────────────

function Tutorial({ onClose }) {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <h2>How to Play</h2>
        <p className="subtitle">Bluff in public. Prove in private.</p>
        <ol>
          <li>
            Each round demands a specific <strong>rank</strong> (e.g.
            <em> Queens</em>). The required rank advances one step every round.
          </li>
          <li>
            On your turn, play <strong>1–4 cards face down</strong> and claim
            you played that many of the required rank. The cards don't have
            to actually match — that's where the bluffing lives.
          </li>
          <li>
            The Ai then chooses to <strong>Accept</strong> your claim or call{' '}
            <strong>Proof or Bluff!</strong>
          </li>
          <li>
            If challenged: cards reveal. If you told the truth, the
            challenger picks up the pile. If you bluffed, you do.
          </li>
          <li>
            <strong>Empty your hand to win.</strong> Each player starts with
            10 cards.
          </li>
        </ol>
        <div className="hint">
          💡 <strong>Pair hint:</strong> Cards of the same rank in your hand
          glow with a matching neon ring — useful when you want to dump a
          pair and claim them as something else, or stack honest plays.
        </div>
        <div className="tutorial-actions">
          <button className="primary" onClick={onClose}>Got it — deal me in</button>
          <button onClick={onClose}>Skip</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Menu
// ─────────────────────────────────────────────────────────────

// localStorage key for the player's chosen handle so we can pre-fill it
// on subsequent visits.
const HANDLE_KEY = 'pob.handle';

function Menu({ onStart, onShowHelp }) {
  const [mode, setMode] = useState('home');
  const [difficulty, setDifficulty] = useState('medium');
  const [handle, setHandle] = useState(() => {
    try { return window.localStorage.getItem(HANDLE_KEY) || ''; }
    catch { return ''; }
  });

  const trimmedHandle = handle.trim();
  const canStart = trimmedHandle.length > 0;
  const submit = () => {
    if (!canStart) return;
    try { window.localStorage.setItem(HANDLE_KEY, trimmedHandle); } catch { /* noop */ }
    onStart({ mode, difficulty, handle: trimmedHandle });
  };

  return (
    <div className="menu">
      <div>
        <h2>Proof or Bluff</h2>
        <p className="subtitle">
          Bluff in public. Prove in private. A privacy-native bluffing card
          game on the Midnight Network — where every challenge is a felt
          moment of cryptographic truth.
        </p>
      </div>

      <div className="menu-options">
        <div className="option-group">
          <h3>Your handle</h3>
          <input
            className="handle-input"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value.slice(0, 24))}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="e.g. johnny5i"
            maxLength={24}
            autoFocus
            aria-label="Player handle"
          />
        </div>

        <div className="option-group">
          <h3>Mode</h3>
          <div className="option-buttons">
            <button
              className={mode === 'home' ? 'active' : ''}
              onClick={() => setMode('home')}
            >
              Home (52 cards)
            </button>
            <button
              className={mode === 'casino' ? 'active' : ''}
              onClick={() => setMode('casino')}
            >
              Casino (5 decks)
            </button>
          </div>
        </div>

        <div className="option-group">
          <h3>Difficulty</h3>
          <div className="option-buttons">
            <button
              className={difficulty === 'easy' ? 'active' : ''}
              onClick={() => setDifficulty('easy')}
            >
              Easy
            </button>
            <button
              className={difficulty === 'medium' ? 'active' : ''}
              onClick={() => setDifficulty('medium')}
            >
              Medium
            </button>
            <button
              className={difficulty === 'hard' ? 'active' : ''}
              onClick={() => setDifficulty('hard')}
            >
              Hard
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="primary"
          onClick={submit}
          disabled={!canStart}
          title={canStart ? '' : 'Enter a handle to begin'}
        >
          Deal me in
        </button>
        <button onClick={onShowHelp}>How to Play</button>
      </div>

      <p className="subtitle" style={{ fontSize: '0.85rem', maxWidth: 540 }}>
        <strong>The short version:</strong> claim the required rank, play
        cards face down (they don't have to match), and either bluff your
        way through or call out the Ai. Empty your hand to win.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Result overlay
// ─────────────────────────────────────────────────────────────

function ResultOverlay({ winner, onRematch, onMenu }) {
  const isPlayerWin = winner === 'player';
  const aiLine = useMemo(
    () => getGameOverDialogue(!isPlayerWin),
    [isPlayerWin]
  );
  return (
    <div className="result-overlay">
      <div className={`result-card ${isPlayerWin ? 'win' : 'lose'}`}>
        <h2>{isPlayerWin ? 'You Win' : 'The Ai Wins'}</h2>
        <p className="display" style={{ color: 'var(--text-dim)' }}>
          {isPlayerWin
            ? 'Truth, lies, and zero-knowledge — and you read them all.'
            : 'The hand stays hidden. The proof says you lost this round.'}
        </p>
        <p className="dialogue">"{aiLine}"</p>
        <div className="result-actions">
          <button className="primary" onClick={onRematch}>
            Rematch
          </button>
          <button onClick={onMenu}>Menu</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Game Table
// ─────────────────────────────────────────────────────────────

function GameTable({ state, settings, onUpdate, aiDialogue, setAiDialogue, displayedRank, banner, skipFutureOutcomeSounds }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [claimedCount, setClaimedCount] = useState(1);
  // IDs of cards currently mid-toss-animation. Held in local state so the
  // visual flourish completes before the new game state replaces them.
  const [tossingIds, setTossingIds] = useState(new Set());
  // Toggleable bluff-odds analyzer that appears when the Ai is awaiting
  // your decision. Persists across rounds so the player can leave it on.
  const [showOdds, setShowOdds] = useState(false);

  // Reset selection when it becomes a new turn / round
  useEffect(() => {
    setSelectedIds(new Set());
    setClaimedCount(1);
  }, [state.currentRank, state.turn, state.lastPlay?.player]);

  // Detect pairs (same-rank groups of 2+) in the current player hand.
  const pairMap = useMemo(() => detectPairs(state.playerHand), [state.playerHand]);

  // Compute bluff odds whenever the Ai is the one waiting on you.
  const bluffEstimate = useMemo(
    () => estimateAiBluffProbability(state, settings),
    [state, settings]
  );

  const playerCanPlay =
    state.status === 'playing' &&
    state.turn === 'player' &&
    state.lastPlay === null;

  const playerMustRespond =
    state.status === 'playing' &&
    state.turn === 'player' &&
    state.lastPlay !== null &&
    state.lastPlay.player === 'ai';

  // Toggle card selection
  function toggleCard(card) {
    if (!playerCanPlay) return;
    const next = new Set(selectedIds);
    if (next.has(card.id)) next.delete(card.id);
    else if (next.size < 4) next.add(card.id);
    setSelectedIds(next);
    // Auto-adjust claimed count to match selected (player can still override)
    if (next.size > 0 && claimedCount > next.size) {
      setClaimedCount(next.size);
    }
  }

  function handlePlay() {
    const cardsPlayed = state.playerHand.filter((c) => selectedIds.has(c.id));
    if (cardsPlayed.length === 0) return;
    playSubmitClick();
    // Trigger the 3D toss animation first; commit state when it finishes
    // so the cards visibly fly off the hand into the pile.
    const ids = new Set(cardsPlayed.map((c) => c.id));
    setTossingIds(ids);
    setAiDialogue('');
    setTimeout(() => {
      const result = playCards(state, {
        cardsPlayed,
        claimedRank: state.currentRank,
        claimedCount: cardsPlayed.length,
        player: 'player',
      });
      setTossingIds(new Set());
      if (result.error) {
        onUpdate({ ...state, log: [...state.log, `⚠️ ${result.error}`] });
        return;
      }
      onUpdate(result.state);
    }, 1100);
  }

  function handleAccept() {
    playSubmitClick();
    const result = acceptClaim(state);
    if (result.error) return;
    setAiDialogue('');
    onUpdate(result.state);
  }

  function handleChallenge() {
    playSubmitClick();
    const result = challenge(state);
    if (result.error) return;
    const reaction = getChallengeReaction({
      aiWasChallenger: false,
      claimWasTrue: result.challengeResult.claimWasTrue,
    });
    setAiDialogue(reaction);
    onUpdate(result.state);
    // The outcome is already known synchronously. Play the matching
    // outcome SFX 250ms after the press so the player gets immediate
    // feedback instead of waiting for the staggered log to reach the
    // CAUGHT BLUFFING / CHALLENGE FAILED line. Tell App to skip the
    // log-reveal duplicate.
    const claimWasTrue = result.challengeResult.claimWasTrue;
    const newLogLength = result.state.log.length;
    setTimeout(() => {
      if (claimWasTrue) playYouMisCalled();   // you called a true claim
      else              playYouCaughtAi();    // you caught a bluff
    }, 250);
    if (skipFutureOutcomeSounds) skipFutureOutcomeSounds(newLogLength);
  }

  const pileSize = state.pile.length + (state.lastPlay ? state.lastPlay.cards.length : 0);
  const lastPlayWho = state.lastPlay?.player === 'player' ? 'You claimed' : 'The Ai claims';

  return (
    <div className="table">
      <div className="table-main">
      {/* Ai area */}
      <div className="ai-area">
        <div className="ai-avatar">🎭</div>
        <div className="ai-dialogue">
          {aiDialogue || (state.turn === 'ai' ? 'Studying the table…' : 'Your move.')}
        </div>
        <div className="ai-meta">
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {settings.difficulty} · {settings.mode}
          </span>
        </div>
      </div>

      {/* Center pile */}
      <div className="center">
        <div className="required-rank">
          <span className="required-label">
            {settings.handle ? `${settings.handle}, how many:` : 'How many'}
          </span>
          <span className="rank-display">
            <span className="rank-glow" aria-hidden="true" />
            <span className="rank">{displayedRank ?? state.currentRank}</span>
          </span>
        </div>

        {state.status === 'playing' && (state.turn === 'ai' || state.lastPlay?.player === 'ai') && (
          <div className="ai-thinking">
            <div className="ai-thinking-text">
              I have {state.aiHand.length} card{state.aiHand.length === 1 ? '' : 's'}
            </div>
            <div
              className="ai-thinking-cards"
              style={{ '--count': state.aiHand.length }}
            >
              {state.aiHand.map((card, i) => (
                <div
                  key={card.id}
                  className="ai-thinking-card"
                  style={{ '--i': i }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}

        <div className="pile-display">
          <div className="pile-stack">
            {pileSize > 0 ? (
              <CardBack label={`PILE × ${pileSize}`} />
            ) : (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Empty pile</div>
            )}
          </div>
        </div>

        {banner && (
          <div className={`play-banner ${banner.kind}`}>
            <span className="play-banner-text">{banner.title}</span>
          </div>
        )}

        {playerMustRespond && (
          <>
            <div className="center-actions">
              <button className="primary" onClick={handleAccept}>
                ✅ Accept
              </button>
              <button className="danger" onClick={handleChallenge}>
                🎲 Prove it!
              </button>
              <button
                className={showOdds ? 'active' : ''}
                onClick={() => setShowOdds((v) => !v)}
                title="Toggle the Ai bluff probability analyzer"
              >
                {showOdds ? '🔍 Hide odds' : '🔍 Bluff odds'}
              </button>
            </div>
            {showOdds && <BluffOddsBadge estimate={bluffEstimate} />}
          </>
        )}
      </div>

      {/* Player area */}
      <div className="player-area">
        <h3>Your hand ({state.playerHand.length})</h3>
        <div className="hand">
          {state.playerHand.map((card) => (
            <PlayingCard
              key={card.id}
              card={card}
              selected={selectedIds.has(card.id)}
              onClick={() => toggleCard(card)}
              disabled={!playerCanPlay || tossingIds.size > 0}
              pairColor={pairMap[card.rank]}
              tossing={tossingIds.has(card.id)}
            />
          ))}
        </div>

        {playerCanPlay && (
          <div className="claim-panel">
            <span className="claim-summary">
              {selectedIds.size > 0
                ? `Claim: ${formatClaim(selectedIds.size, state.currentRank)}`
                : `Select 1-4 cards. You'll claim them as ${state.currentRank}s.`}
            </span>
            <button
              className="primary"
              disabled={selectedIds.size === 0}
              onClick={handlePlay}
            >
              Play & Claim
            </button>
          </div>
        )}
      </div>
      </div> {/* /table-main */}

      <Scoreboard state={state} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App — orchestrates state and Ai turns
// ─────────────────────────────────────────────────────────────

// localStorage key used to remember whether the player has dismissed the
// tutorial at least once, so we don't pop it up every visit.
const TUTORIAL_KEY = 'pob.tutorialSeen.v1';

// How long each new log line stays as "the latest" before the next one
// is revealed. Gives the reader a beat to absorb each event.
const LOG_REVEAL_INTERVAL_MS = 1300;

/**
 * Classify a raw log string into a structured display entry:
 *   - actor:  'player' | 'ai' | 'system'
 *   - kind:   'info' | 'play' | 'accept' | 'win-good' | 'win-bad' | 'warn'
 *   - icon:   emoji glyph
 *   - text:   the original message
 *
 * "win-good" / "win-bad" are framed from the player's perspective so the
 * green/red coloring tracks "did the player benefit from this event."
 */
function classifyLog(text) {
  // Helper to build a result, stripping the leading actor word from the
  // body (since we render the badge separately).
  const make = (actor, kind, icon, label, body) => ({
    actor, kind, icon, label, body, text,
  });

  if (text.startsWith('⚠️')) return make('system', 'warn', '⚠️', null, text);

  // Win / lose
  if (text.startsWith('YOU WIN')) {
    return make('player', 'win-good', '🏆', 'You', text.replace(/^YOU\s+/, ''));
  }
  if (text.startsWith('AI WINS')) {
    return make('ai', 'win-bad', '💀', 'Ai', text.replace(/^AI\s+/, ''));
  }

  // Bluffer caught (CAUGHT BLUFFING) — bluffer picks up the pile.
  // "You pick" => player bluffed and got caught (BAD for player).
  // "AI picks" => AI bluffed and got caught (GOOD for player).
  if (text.startsWith('CAUGHT BLUFFING')) {
    if (text.includes('You pick')) return make('player', 'win-bad', '🔴', 'You', text);
    return make('ai', 'win-good', '🟢', 'Ai', text);
  }

  // Challenge failed — claim was true, challenger picks up.
  if (text.startsWith('CHALLENGE FAILED')) {
    if (text.includes('You pick')) return make('player', 'win-bad', '🔴', 'You', text);
    return make('ai', 'win-good', '🟢', 'Ai', text);
  }

  // Plays and accepts — actor extracted from the leading word and stripped
  // from the body so the badge replaces the pronoun.
  if (text.startsWith('You played')) {
    return make('player', 'play', '🎴', 'You', text.replace(/^You\s+/, ''));
  }
  if (text.startsWith('AI played')) {
    return make('ai', 'play', '🃏', 'Ai', text.replace(/^AI\s+/, ''));
  }
  if (text.startsWith('You accepted')) {
    return make('player', 'accept', '✅', 'You', text.replace(/^You\s+/, ''));
  }
  if (text.startsWith('AI accepted')) {
    return make('ai', 'accept', '✅', 'Ai', text.replace(/^AI\s+/, ''));
  }

  return make('system', 'info', '·', null, text);
}

/**
 * Render a single classified log entry.
 */
function LogEntry({ entry, isNewest }) {
  const { actor, kind, icon, label, body } = entry;
  const className = [
    'log-entry',
    `actor-${actor}`,
    `kind-${kind}`,
    isNewest ? 'newest' : '',
  ].filter(Boolean).join(' ');
  return (
    <div className={className}>
      <span className="log-icon" aria-hidden="true">{icon}</span>
      {label && <span className={`log-badge badge-${actor}`}>{label}</span>}
      <span className="log-text">{body}</span>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'game'
  const [settings, setSettings] = useState({ mode: 'home', difficulty: 'medium' });
  const [state, setState] = useState(null);
  const [aiDialogue, setAiDialogue] = useState('');
  // Show the tutorial automatically the first time a visitor lands on the
  // menu. They can Skip; either way we set the flag and won't show it again.
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return typeof window !== 'undefined' && !window.localStorage.getItem(TUTORIAL_KEY);
    } catch {
      return true;
    }
  });

  const dismissTutorial = useCallback(() => {
    setShowTutorial(false);
    try {
      window.localStorage.setItem(TUTORIAL_KEY, '1');
    } catch {
      /* localStorage unavailable — just don't persist */
    }
  }, []);

  // Rank shown to the player. Lags state.currentRank until the log has
  // finished revealing every queued entry, so the player can read what
  // happened before the rank updates.
  const [displayedRank, setDisplayedRank] = useState(null);

  // Audio mute state — persisted across visits via localStorage.
  const [muted, setMuted] = useState(() => {
    try { return window.localStorage.getItem('pob.muted') === '1'; }
    catch { return false; }
  });
  useEffect(() => {
    setAudioMuted(muted);
    try { window.localStorage.setItem('pob.muted', muted ? '1' : '0'); } catch { /* noop */ }
  }, [muted]);

  // First-gesture audio unlock. Browsers require a user interaction
  // before AudioContext can play, so we listen for the first click/key
  // anywhere on the page and use it to prime the context + start the
  // lounge music. Self-removes after firing once.
  useEffect(() => {
    const start = () => {
      unlockAudio();
      startBackgroundMusic();
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
    window.addEventListener('pointerdown', start, { once: false });
    window.addEventListener('keydown', start, { once: false });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  // Tracks the last log index we played a sound for, so each newly
  // revealed entry triggers its outcome cue exactly once.
  const lastSoundedRef = useRef(0);

  // Remembers the most recent state.lastPlay even after the engine clears
  // it, so we can tell whether an "AI accepted" event came after a bluff
  // or an honest play (the cards aren't preserved anywhere else once the
  // pile absorbs them).
  const lastPlayRef = useRef(null);
  useEffect(() => {
    if (state?.lastPlay) lastPlayRef.current = state.lastPlay;
  }, [state?.lastPlay]);

  // Big result banner shown below the pile after a play resolves.
  // Auto-clears after a few seconds so it doesn't linger into the next play.
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    if (!banner) return undefined;
    const t = setTimeout(() => setBanner(null), 3500);
    return () => clearTimeout(t);
  }, [banner]);

  // ── Staggered log reveal ──
  // The engine pushes new entries onto state.log synchronously, but we want
  // the player to see them appear one at a time so each event has a beat
  // to be read. We track how many entries are currently "visible" and
  // advance one per LOG_REVEAL_INTERVAL_MS until caught up.
  const [visibleLogCount, setVisibleLogCount] = useState(0);
  const totalLogCount = state?.log?.length ?? 0;

  useEffect(() => {
    if (visibleLogCount >= totalLogCount) return;
    const t = setTimeout(() => {
      setVisibleLogCount((n) => Math.min(n + 1, totalLogCount));
    }, LOG_REVEAL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [visibleLogCount, totalLogCount]);

  // Reset visible count whenever a brand-new game starts.
  useEffect(() => {
    if (totalLogCount === 0) setVisibleLogCount(0);
  }, [totalLogCount]);

  // Sync the displayed rank to the live rank, but only once the log has
  // finished revealing all queued entries. This way the rank doesn't visibly
  // change until the player has had a chance to read what happened.
  useEffect(() => {
    if (!state) return;
    if (visibleLogCount >= totalLogCount && state.currentRank !== displayedRank) {
      setDisplayedRank(state.currentRank);
    }
  }, [state, visibleLogCount, totalLogCount, displayedRank]);

  // Play casino sound effects + set the result banner as outcome log
  // entries reveal. We diff against the previous reveal count so each
  // line fires at most once.
  useEffect(() => {
    if (!state) return;
    while (lastSoundedRef.current < visibleLogCount) {
      const entry = state.log[lastSoundedRef.current];
      lastSoundedRef.current += 1;
      if (!entry) continue;

      // Bluffer caught: bluffer picks up the pile.
      if (entry.startsWith('CAUGHT BLUFFING')) {
        if (entry.includes('AI picks')) {
          playYouCaughtAi();
          setBanner({ kind: 'good', title: 'The Ai was bluffing!' });
        } else if (entry.includes('You pick')) {
          playYouGotCaught();
          setBanner({ kind: 'bad', title: 'Your bluff was called!' });
        }
      } else if (entry.startsWith('CHALLENGE FAILED')) {
        // Challenger was wrong (the claim was true).
        if (entry.includes('AI picks')) {
          // AI challenged your honest claim and lost.
          playYouSurvivedChallenge();
          setBanner({ kind: 'good', title: 'Your honesty paid off!' });
        } else if (entry.includes('You pick')) {
          // You challenged a true Ai claim.
          playYouMisCalled();
          setBanner({ kind: 'bad', title: 'The Ai was telling the truth!' });
        }
      } else if (entry.startsWith('YOU WIN')) {
        playGameWon();
        setBanner({ kind: 'win', title: 'Game won!' });
      } else if (entry.startsWith('AI WINS')) {
        playGameLost();
        setBanner({ kind: 'loss', title: 'The Ai cleaned house.' });
      } else if (entry.startsWith('AI accepted')) {
        // No challenge — judge whether the player's last play was a bluff.
        const last = lastPlayRef.current;
        if (last && last.player === 'player') {
          const wasBluff = last.cards.some((c) => c.rank !== last.claimedRank);
          if (wasBluff) {
            setBanner({ kind: 'good', title: 'Your bluff succeeded!' });
          } else {
            setBanner({ kind: 'good', title: 'Honest play — accepted.' });
          }
        }
      }
    }
  }, [visibleLogCount, state]);

  // Reset the sound cursor when a new game begins.
  useEffect(() => {
    if (totalLogCount === 0) lastSoundedRef.current = 0;
  }, [totalLogCount]);

  // Fast-forward the outcome-sound cursor past the entries that the
  // GameTable just played manually (after a player challenge). Without
  // this the staggered log-reveal would re-trigger the same SFX a few
  // seconds later.
  const skipFutureOutcomeSounds = useCallback((upToIndex) => {
    if (typeof upToIndex === 'number') {
      lastSoundedRef.current = Math.max(lastSoundedRef.current, upToIndex);
    }
  }, []);

  const handleStart = useCallback((cfg) => {
    unlockAudio(); // user gesture — primes the AudioContext
    startBackgroundMusic();
    lastSoundedRef.current = 0;
    setSettings(cfg);
    const fresh = initGame(cfg.mode);
    setState(fresh);
    setDisplayedRank(fresh.currentRank);
    setVisibleLogCount(0);
    setScreen('game');
    setAiDialogue('');
  }, []);

  const handleRematch = useCallback(() => {
    const fresh = initGame(settings.mode);
    setDisplayedRank(fresh.currentRank);
    setVisibleLogCount(0);
    setState(fresh);
    setAiDialogue('');
  }, [settings.mode]);

  const handleMenu = useCallback(() => {
    setScreen('menu');
    setState(null);
    setAiDialogue('');
  }, []);

  // ── Drive Ai turns ──
  useEffect(() => {
    if (!state || state.status !== 'playing') return;
    if (state.turn !== 'ai') return;
    // Hold off on Ai's next action until every queued log entry has
    // finished revealing. This way the player sees the outcome of the
    // previous play before the next hand starts.
    if (visibleLogCount < totalLogCount) return;

    // Case A: Ai must decide accept/challenge of player's claim.
    // Variable delay 0.25–3.0s simulates instinct / deliberation.
    if (state.lastPlay && state.lastPlay.player === 'player') {
      const delay = pickAiDecisionDelay();
      const t = setTimeout(() => {
        const decision = decideChallenge({
          playerClaimedRank: state.lastPlay.claimedRank,
          playerClaimedCount: state.lastPlay.claimedCount,
          aiHand: state.aiHand,
          difficulty: settings.difficulty,
          mode: settings.mode,
        });
        setAiDialogue(decision.dialogue);
        if (decision.shouldChallenge) {
          const result = challenge(state);
          // Give the Ai a follow-up reaction after the resolution
          setTimeout(() => {
            const reaction = getChallengeReaction({
              aiWasChallenger: true,
              claimWasTrue: result.challengeResult.claimWasTrue,
            });
            setAiDialogue(reaction);
          }, 900);
          setState(result.state);
        } else {
          const result = acceptClaim(state);
          setState(result.state);
        }
      }, delay);
      return () => clearTimeout(t);
    }

    // Case B: Ai's turn to play cards (no pending lastPlay).
    // Decide first so we can pick a delay that reflects (or sometimes
    // deliberately misleads about) whether the Ai is bluffing.
    if (!state.lastPlay) {
      const play = decidePlay({
        aiHand: state.aiHand,
        requiredRank: state.currentRank,
        difficulty: settings.difficulty,
        mode: settings.mode,
      });
      const cardsToPlay = play.cardsToPlay.length > 0 ? play.cardsToPlay : state.aiHand.slice(0, 1);
      if (cardsToPlay.length === 0) return; // Should never happen given win check
      const delay = pickAiPlayDelay(play.isBluff);
      const t = setTimeout(() => {
        setAiDialogue(play.dialogue);
        const result = playCards(state, {
          cardsPlayed: cardsToPlay,
          claimedRank: state.currentRank,
          claimedCount: cardsToPlay.length,
          player: 'ai',
        });
        if (result.state) setState(result.state);
      }, delay);
      return () => clearTimeout(t);
    }
  }, [state, settings.difficulty, settings.mode, visibleLogCount, totalLogCount]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>
            Proof or Bluff <span className="badge">MLH × Midnight</span>
          </h1>
          <div className="tagline">Bluff publicly. Prove privately.</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { unlockAudio(); setMuted((m) => !m); }}
            title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {screen === 'game' && (
            <button onClick={handleMenu}>← Menu</button>
          )}
        </div>
      </header>

      {showTutorial && <Tutorial onClose={dismissTutorial} />}
      {screen === 'menu' && (
        <Menu onStart={handleStart} onShowHelp={() => setShowTutorial(true)} />
      )}
      {screen === 'game' && state && (
        <>
          <div className="play-area">
            <aside className="log-panel side">
              <h4>Game Log</h4>
              <div className="log-entries">
                {visibleLogCount === 0 ? (
                  <div className="log-entry actor-system" style={{ fontStyle: 'italic' }}>
                    <span className="log-icon">·</span>
                    <span className="log-text">Events will appear here as the round unfolds.</span>
                  </div>
                ) : (
                  state.log
                    .slice(0, visibleLogCount)
                    .map((raw, idx, arr) => ({ raw, idx, isNewest: idx === arr.length - 1 }))
                    .reverse()
                    .map(({ raw, idx, isNewest }) => (
                      <LogEntry key={idx} entry={classifyLog(raw)} isNewest={isNewest} />
                    ))
                )}
              </div>
            </aside>
            <GameTable
              state={state}
              settings={settings}
              onUpdate={setState}
              aiDialogue={aiDialogue}
              setAiDialogue={setAiDialogue}
              displayedRank={displayedRank}
              banner={banner}
              skipFutureOutcomeSounds={skipFutureOutcomeSounds}
            />
          </div>
          {state.status === 'gameover' && (
            <ResultOverlay
              winner={state.winner}
              onRematch={handleRematch}
              onMenu={handleMenu}
            />
          )}
        </>
      )}

      <footer className="footer">
        demoLand build · MLH × Midnight Hackathon · May 15-17 2026 ·{' '}
        <a href="https://github.com/bytewizard42i/ProofOrBluff_MLH_Midnight" target="_blank" rel="noreferrer">
          GitHub
        </a>
        {' · '}
        <a href="https://midnight.network" target="_blank" rel="noreferrer">
          Midnight Network
        </a>
      </footer>
    </div>
  );
}
