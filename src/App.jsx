import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
      <div className="corner bottom">
        <span>{card.rank}</span>
        <span>{glyph}</span>
      </div>
    </div>
  );
}

function CardBack({ label = 'POB' }) {
  return <div className="card-back">{label}</div>;
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

function Menu({ onStart, onShowHelp }) {
  const [mode, setMode] = useState('home');
  const [difficulty, setDifficulty] = useState('medium');

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
        <button className="primary" onClick={() => onStart({ mode, difficulty })}>
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

function GameTable({ state, settings, onUpdate, aiDialogue, setAiDialogue }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [claimedCount, setClaimedCount] = useState(1);
  // IDs of cards currently mid-toss-animation. Held in local state so the
  // visual flourish completes before the new game state replaces them.
  const [tossingIds, setTossingIds] = useState(new Set());

  // Reset selection when it becomes a new turn / round
  useEffect(() => {
    setSelectedIds(new Set());
    setClaimedCount(1);
  }, [state.currentRank, state.turn, state.lastPlay?.player]);

  // Detect pairs (same-rank groups of 2+) in the current player hand.
  const pairMap = useMemo(() => detectPairs(state.playerHand), [state.playerHand]);

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
    }, 850);
  }

  function handleAccept() {
    const result = acceptClaim(state);
    if (result.error) return;
    setAiDialogue('');
    onUpdate(result.state);
  }

  function handleChallenge() {
    const result = challenge(state);
    if (result.error) return;
    const reaction = getChallengeReaction({
      aiWasChallenger: false,
      claimWasTrue: result.challengeResult.claimWasTrue,
    });
    setAiDialogue(reaction);
    onUpdate(result.state);
  }

  const pileSize = state.pile.length + (state.lastPlay ? state.lastPlay.cards.length : 0);
  const lastPlayWho = state.lastPlay?.player === 'player' ? 'You claimed' : 'The Ai claims';

  return (
    <div className="table">
      {/* Ai area */}
      <div className="ai-area">
        <div className="ai-avatar">🎭</div>
        <div className="ai-dialogue">
          {aiDialogue || (state.turn === 'ai' ? 'Studying the table…' : 'Your move.')}
        </div>
        <div className="ai-meta">
          <span className="count">{state.aiHand.length}</span>
          <span>cards in Ai hand</span>
          <br />
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {settings.difficulty} · {settings.mode}
          </span>
        </div>
      </div>

      {/* Center pile */}
      <div className="center">
        <div className="required-rank">
          Current rank
          <span className="rank">{state.currentRank}</span>
        </div>

        <div className="pile-display">
          <div className="pile-stack">
            {pileSize > 0 ? (
              <CardBack label={`PILE × ${pileSize}`} />
            ) : (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Empty pile</div>
            )}
          </div>

          {state.lastPlay && (
            <div className="last-play">
              <span className="who">{lastPlayWho}</span>
              <span className="claim">
                {formatClaim(state.lastPlay.claimedCount, state.lastPlay.claimedRank)}
              </span>
            </div>
          )}
        </div>

        {playerMustRespond && (
          <div className="center-actions">
            <button className="primary" onClick={handleAccept}>
              ✅ Accept
            </button>
            <button className="danger" onClick={handleChallenge}>
              🎲 Prove it!
            </button>
          </div>
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
  if (text.startsWith('⚠️')) return { actor: 'system', kind: 'warn', icon: '⚠️', text };

  // Win / lose
  if (text.startsWith('YOU WIN')) return { actor: 'player', kind: 'win-good', icon: '🏆', text };
  if (text.startsWith('AI WINS')) return { actor: 'ai', kind: 'win-bad', icon: '💀', text };

  // Bluffer caught (CAUGHT BLUFFING) — bluffer picks up the pile.
  // "You pick" => player bluffed and got caught (BAD for player).
  // "AI picks" => AI bluffed and got caught (GOOD for player).
  if (text.startsWith('CAUGHT BLUFFING')) {
    if (text.includes('You pick')) {
      return { actor: 'player', kind: 'win-bad', icon: '🔴', text };
    }
    return { actor: 'ai', kind: 'win-good', icon: '🟢', text };
  }

  // Challenge failed — claim was true, challenger picks up.
  // "You pick" => player challenged a true claim (BAD for player).
  // "AI picks" => AI challenged your honest claim (GOOD for player).
  if (text.startsWith('CHALLENGE FAILED')) {
    if (text.includes('You pick')) {
      return { actor: 'player', kind: 'win-bad', icon: '🔴', text };
    }
    return { actor: 'ai', kind: 'win-good', icon: '🟢', text };
  }

  // Plays and accepts — actor extracted from the leading word.
  if (text.startsWith('You played')) return { actor: 'player', kind: 'play', icon: '🎴', text };
  if (text.startsWith('AI played')) return { actor: 'ai', kind: 'play', icon: '🃏', text };
  if (text.startsWith('You accepted')) return { actor: 'player', kind: 'accept', icon: '✅', text };
  if (text.startsWith('AI accepted')) return { actor: 'ai', kind: 'accept', icon: '✅', text };

  return { actor: 'system', kind: 'info', icon: '·', text };
}

/**
 * Render a single classified log entry.
 */
function LogEntry({ entry, isNewest }) {
  const { actor, kind, icon, text } = entry;
  const className = [
    'log-entry',
    `actor-${actor}`,
    `kind-${kind}`,
    isNewest ? 'newest' : '',
  ].filter(Boolean).join(' ');
  return (
    <div className={className}>
      <span className="log-icon" aria-hidden="true">{icon}</span>
      <span className="log-text">{text}</span>
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

  const handleStart = useCallback((cfg) => {
    setSettings(cfg);
    const fresh = initGame(cfg.mode);
    setState(fresh);
    setScreen('game');
    setAiDialogue('');
  }, []);

  const handleRematch = useCallback(() => {
    const fresh = initGame(settings.mode);
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

    // Case A: Ai must decide accept/challenge of player's claim
    if (state.lastPlay && state.lastPlay.player === 'player') {
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
      }, 1100);
      return () => clearTimeout(t);
    }

    // Case B: Ai's turn to play cards (no pending lastPlay)
    if (!state.lastPlay) {
      const t = setTimeout(() => {
        const play = decidePlay({
          aiHand: state.aiHand,
          requiredRank: state.currentRank,
          difficulty: settings.difficulty,
          mode: settings.mode,
        });
        // Safety: if the Ai somehow has no cards to play, force a single card from hand
        const cardsToPlay = play.cardsToPlay.length > 0 ? play.cardsToPlay : state.aiHand.slice(0, 1);
        if (cardsToPlay.length === 0) return; // Should never happen given win check
        setAiDialogue(play.dialogue);
        const result = playCards(state, {
          cardsPlayed: cardsToPlay,
          claimedRank: state.currentRank,
          claimedCount: cardsToPlay.length,
          player: 'ai',
        });
        if (result.state) setState(result.state);
      }, 1300);
      return () => clearTimeout(t);
    }
  }, [state, settings.difficulty, settings.mode]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>
            Proof or Bluff <span className="badge">MLH × Midnight</span>
          </h1>
          <div className="tagline">Bluff in public. Prove in private.</div>
        </div>
        {screen === 'game' && (
          <button onClick={handleMenu}>← Menu</button>
        )}
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
