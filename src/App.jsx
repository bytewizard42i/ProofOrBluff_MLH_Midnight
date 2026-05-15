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

function PlayingCard({ card, selected, onClick, disabled }) {
  const color = SUIT_COLOR[card.suit];
  const glyph = SUIT_GLYPH[card.suit];
  return (
    <div
      className={`card ${color}${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
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

// ─────────────────────────────────────────────────────────────
// Menu
// ─────────────────────────────────────────────────────────────

function Menu({ onStart }) {
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

      <button className="primary" onClick={() => onStart({ mode, difficulty })}>
        Deal me in
      </button>

      <p className="subtitle" style={{ fontSize: '0.85rem', maxWidth: 540 }}>
        <strong>How it works:</strong> Each turn you must claim the current
        rank in the sequence. Play cards face down. Your opponent decides
        whether to trust you or call <em>Proof or Bluff!</em> Empty your hand
        to win.
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

  // Reset selection when it becomes a new turn / round
  useEffect(() => {
    setSelectedIds(new Set());
    setClaimedCount(1);
  }, [state.currentRank, state.turn, state.lastPlay?.player]);

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
    const result = playCards(state, {
      cardsPlayed,
      claimedRank: state.currentRank,
      claimedCount: cardsPlayed.length,
      player: 'player',
    });
    if (result.error) {
      onUpdate({ ...state, log: [...state.log, `⚠️ ${result.error}`] });
      return;
    }
    setAiDialogue('');
    onUpdate(result.state);
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
              🎲 Proof or Bluff!
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
              disabled={!playerCanPlay}
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

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'game'
  const [settings, setSettings] = useState({ mode: 'home', difficulty: 'medium' });
  const [state, setState] = useState(null);
  const [aiDialogue, setAiDialogue] = useState('');

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

      {screen === 'menu' && <Menu onStart={handleStart} />}
      {screen === 'game' && state && (
        <>
          <GameTable
            state={state}
            settings={settings}
            onUpdate={setState}
            aiDialogue={aiDialogue}
            setAiDialogue={setAiDialogue}
          />
          <div className="log-panel" style={{ maxWidth: 1100, margin: '0 auto 1rem', width: 'calc(100% - 2rem)' }}>
            <h4>Game Log</h4>
            {state.log.slice(-6).map((entry, i) => (
              <div key={i} className="log-entry">{entry}</div>
            ))}
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
