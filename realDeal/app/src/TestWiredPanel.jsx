import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  connectWallet,
  isWalletAvailable,
  subscribeWalletState,
} from './midnight/wallet.js';
import RealDealGameProvider from './providers/realdeal/gameProvider.js';
import { getContractAddress } from './midnight/config.js';
import { dealFromSeed, RANKS } from '../../shared/dealing.js';

const BOT_URL = (import.meta.env.VITE_TESTWIRED_BOT_URL || 'http://127.0.0.1:3017')
  .replace(/\/$/, '');
const STANDARD_MODE = 1;
const AUTOMATIC_POLL_MS = 10_000;
const HAND_STORAGE_PREFIX = 'pob:testwired:p1-hand:';

const PHASE_NAMES = Object.freeze([
  'Waiting for Player Two',
  'Waiting for entropy reveal',
  'Playing',
  'Awaiting response',
  'Game over',
]);

const SUIT_LABELS = Object.freeze({
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
  spades: 'Spades',
});

function firstDefined(object, names) {
  for (const name of names) {
    if (object?.[name] !== undefined && object[name] !== null) return object[name];
  }
  return null;
}

function parseSafeInteger(value, label, { minimum = 0, maximum = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === null || value === undefined || typeof value === 'boolean') {
    throw new Error(`${label} was missing or was not an integer.`);
  }
  if (typeof value === 'string' && !/^\d+$/.test(value)) {
    throw new Error(`${label} must be written as a whole nonnegative number.`);
  }
  const number = typeof value === 'bigint' ? Number(value) : Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new Error(`${label} must be a safe integer from ${minimum} through ${maximum}.`);
  }
  return number;
}

/** IDs and entropy are contract Bytes<32>, represented at this boundary as hex. */
function requireHex64(value, label) {
  let candidate = value;
  if (value instanceof Uint8Array) {
    candidate = Array.from(value, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  if (typeof candidate !== 'string') {
    throw new Error(`${label} was missing or was not a hexadecimal string.`);
  }
  const clean = candidate.startsWith('0x') ? candidate.slice(2) : candidate;
  if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
    throw new Error(`${label} must contain exactly 64 hexadecimal characters.`);
  }
  return clean.toLowerCase();
}

function optionalTransactionId(result) {
  const value = result?.txId ?? result?.txHash ?? result?.transactionId ?? null;
  if (value == null) return null;
  return requireHex64(value, 'Transaction ID');
}

function shorten(value, head = 8, tail = 6) {
  if (!value) return 'not available';
  return value.length > head + tail + 3
    ? `${value.slice(0, head)}…${value.slice(-tail)}`
    : value;
}

function phaseNumber(value) {
  if (typeof value === 'string' && !/^\d+$/.test(value)) {
    const normalized = value.trim().toUpperCase().replaceAll(' ', '_');
    const index = [
      'WAITING_FOR_PLAYER_TWO',
      'WAITING_FOR_ENTROPY_REVEAL',
      'PLAYING',
      'AWAITING_RESPONSE',
      'GAMEOVER',
    ].indexOf(normalized);
    if (index >= 0) return index;
  }
  return parseSafeInteger(value, 'Match phase', { maximum: 4 });
}

/**
 * The bot endpoint is deliberately the normalization boundary. Still validate
 * every field used for rendering or deciding which wallet circuit may run: a
 * malformed localhost response must never turn into an unintended transaction.
 */
function normalizeMatchResponse(payload, expectedMatchId) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Bot returned no JSON match object. Start or update the TestWired bot.');
  }
  const source = payload.match && typeof payload.match === 'object'
    ? payload.match
    : payload;
  const responseMatchId = firstDefined(source, ['matchId', 'id']);
  if (responseMatchId != null) {
    const normalizedId = requireHex64(responseMatchId, 'Bot match ID');
    if (expectedMatchId && normalizedId !== expectedMatchId) {
      throw new Error('Bot returned status for a different match ID. Restart the bot for this match.');
    }
  }

  const phase = phaseNumber(firstDefined(source, ['phase', 'matchPhase']));
  const currentRank = parseSafeInteger(
    firstDefined(source, ['currentRank', 'requiredRank']),
    'Required rank',
    { maximum: RANKS.length - 1 },
  );
  const activePlayerIdx = parseSafeInteger(
    firstDefined(source, ['activePlayerIdx', 'activePlayer', 'turn']),
    'Active player',
    { maximum: 1 },
  );
  const winner = parseSafeInteger(firstDefined(source, ['winner']), 'Winner', { maximum: 2 });

  const seedFinalized = Boolean(firstDefined(source, ['seedFinalized']));
  const combinedSeedValue = firstDefined(source, ['combinedSeed', 'combinedSeedHex']);
  const combinedSeed = !seedFinalized || combinedSeedValue == null
    ? null
    : requireHex64(combinedSeedValue, 'Combined seed');

  return {
    matchId: expectedMatchId || (responseMatchId ? requireHex64(responseMatchId, 'Bot match ID') : null),
    phase,
    currentRank,
    activePlayerIdx,
    p1Score: parseSafeInteger(firstDefined(source, ['p1Score', 'playerOneScore']), 'P1 score'),
    p2Score: parseSafeInteger(firstDefined(source, ['p2Score', 'playerTwoScore']), 'P2 score'),
    p1HandSize: parseSafeInteger(firstDefined(source, ['p1HandSize', 'playerOneHandSize']), 'P1 hand size'),
    p2HandSize: parseSafeInteger(firstDefined(source, ['p2HandSize', 'playerTwoHandSize']), 'P2 hand size'),
    pileSize: parseSafeInteger(firstDefined(source, ['pileSize', 'pile']), 'Pile size'),
    winner,
    seedFinalized,
    combinedSeed,
    hasPendingPlay: Boolean(firstDefined(source, ['hasPendingPlay', 'pendingPlay'])),
    isChallenged: Boolean(firstDefined(source, ['isChallenged', 'challenged'])),
    lastPlayerIdx: parseSafeInteger(
      firstDefined(source, ['lastPlayerIdx', 'lastPlayer']),
      'Last player',
      { maximum: 1 },
    ),
    lastClaimRank: parseSafeInteger(
      firstDefined(source, ['lastClaimRank', 'claimedRank']) ?? 0,
      'Last claim rank',
      { maximum: RANKS.length - 1 },
    ),
    lastClaimCount: parseSafeInteger(
      firstDefined(source, ['lastClaimCount', 'claimedCount']) ?? 0,
      'Last claim count',
      { maximum: 4 },
    ),
    escrowReleased: Boolean(firstDefined(source, ['escrowReleased'])),
  };
}

function readStoredHand(matchId) {
  try {
    const raw = window.localStorage.getItem(`${HAND_STORAGE_PREFIX}${matchId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.handIds) || !Number.isSafeInteger(parsed.drawIndex)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistHand(matchId, handState) {
  try {
    window.localStorage.setItem(`${HAND_STORAGE_PREFIX}${matchId}`, JSON.stringify(handState));
  } catch {
    // Private browsing and storage quotas must not make on-chain play fail.
  }
}

function removeP1Cards(matchId, combinedSeed, cards, removedIds) {
  const stored = readStoredHand(matchId);
  const remainingIds = new Set(removedIds);
  const handIds = (stored?.handIds || cards.map((card) => card.id))
    .filter((id) => !remainingIds.has(id));
  const next = {
    combinedSeed,
    handIds,
    drawIndex: stored?.combinedSeed === combinedSeed ? stored.drawIndex : 0,
    // Indexer reads can briefly report the pre-play size after makePlay returns.
    // Keep that stale public value from inventing replacement draw cards.
    pendingSize: { before: cards.length, after: handIds.length },
  };
  persistHand(matchId, next);
  return cards.filter((card) => !remainingIds.has(card.id));
}

/**
 * Rebuild only P1's private view. The P2 deal is intentionally never returned,
 * placed in React state, logged, or rendered by this browser component.
 */
function reconcileP1Hand(matchId, combinedSeed, publicHandSize, removedIds = []) {
  const { p1Hand, drawPile } = dealFromSeed(combinedSeed, STANDARD_MODE);
  const cardById = new Map([...p1Hand, ...drawPile].map((card) => [card.id, card]));
  const stored = readStoredHand(matchId);
  const canReuseStored = stored?.combinedSeed === combinedSeed;
  let handIds = canReuseStored
    ? stored.handIds.filter((id) => cardById.has(id))
    : p1Hand.map((card) => card.id);
  let drawIndex = canReuseStored ? stored.drawIndex : 0;
  const explicitlyRemoved = new Set(removedIds);
  handIds = handIds.filter((id) => !explicitlyRemoved.has(id));

  const pendingSize = canReuseStored ? stored.pendingSize : null;
  if (pendingSize
    && pendingSize.before === publicHandSize
    && pendingSize.after === handIds.length) {
    persistHand(matchId, { combinedSeed, handIds, drawIndex, pendingSize });
    return handIds.map((id) => cardById.get(id));
  }

  // A public decrease normally follows P1's own play, whose exact IDs were
  // removed above. On reload there is no way to infer historical private cards,
  // so deterministic tail trimming is the honest, stable fallback.
  if (handIds.length > publicHandSize) handIds = handIds.slice(0, publicHandSize);

  // Challenge penalties increase hand size. Consume the deterministic draw pile
  // in order, skipping anything already present, so card IDs remain unique.
  const seen = new Set(handIds);
  while (handIds.length < publicHandSize && drawIndex < drawPile.length) {
    const candidate = drawPile[drawIndex];
    drawIndex += 1;
    if (!seen.has(candidate.id)) {
      seen.add(candidate.id);
      handIds.push(candidate.id);
    }
  }
  if (handIds.length !== publicHandSize) {
    throw new Error(
      `Cannot reconcile ${publicHandSize} P1 cards from the deterministic STANDARD deck. Refresh bot status.`,
    );
  }

  const next = { combinedSeed, handIds, drawIndex };
  persistHand(matchId, next);
  return handIds.map((id) => cardById.get(id));
}

function botHasAction(match) {
  return (match.phase === 2 && match.activePlayerIdx === 1)
    || (match.phase === 3 && match.lastPlayerIdx === 0 && !match.isChallenged)
    || (match.phase === 3 && match.lastPlayerIdx === 1 && match.isChallenged);
}

function formatError(error) {
  if (error?.name === 'AbortError') return null;
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return `Cannot reach the TestWired bot at ${BOT_URL}. Start it on port 3017, then retry.`;
  }
  return error?.message || String(error);
}

export default function TestWiredPanel() {
  const [walletAvailable, setWalletAvailable] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [balances, setBalances] = useState({});
  const [botHealth, setBotHealth] = useState('checking');
  const [wagerInput, setWagerInput] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState('');
  const [error, setError] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [match, setMatch] = useState(null);
  const [lastTransactionId, setLastTransactionId] = useState(null);
  const [lastBotAction, setLastBotAction] = useState('');
  const [dialogue, setDialogue] = useState('');
  const [progress, setProgress] = useState([]);
  const [hand, setHand] = useState([]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const providerRef = useRef(null);
  const mountedRef = useRef(false);
  const requestControllersRef = useRef(new Set());
  const progressSequenceRef = useRef(0);

  const addProgress = useCallback((message) => {
    if (!mountedRef.current) return;
    progressSequenceRef.current += 1;
    const entry = { id: progressSequenceRef.current, message };
    setProgress((current) => [...current.slice(-39), entry]);
  }, []);

  const fetchBot = useCallback(async (path, options = {}) => {
    const controller = new AbortController();
    requestControllersRef.current.add(controller);
    try {
      const response = await fetch(`${BOT_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
      });
      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(`Bot ${path} returned non-JSON data (HTTP ${response.status}).`);
        }
      }
      if (!response.ok) {
        const detail = data?.error || data?.message || text || response.statusText;
        throw new Error(`Bot ${path} failed (HTTP ${response.status}): ${detail}`);
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error(`Bot ${path} returned an invalid JSON response.`);
      }
      return data;
    } finally {
      requestControllersRef.current.delete(controller);
    }
  }, []);

  const applyMatch = useCallback((nextMatch) => {
    if (!mountedRef.current) return;
    setMatch(nextMatch);
    if (nextMatch.combinedSeed) {
      const nextHand = reconcileP1Hand(
        nextMatch.matchId,
        nextMatch.combinedSeed,
        nextMatch.p1HandSize,
      );
      setHand(nextHand);
      const availableIds = new Set(nextHand.map((card) => card.id));
      setSelectedIds((current) => new Set([...current].filter((id) => availableIds.has(id))));
    }
  }, []);

  const refreshStatus = useCallback(async ({ quiet = false } = {}) => {
    if (!matchId) return null;
    if (!quiet) addProgress('Requesting normalized public match status from the bot.');
    const data = await fetchBot(`/api/testwired/status?matchId=${encodeURIComponent(matchId)}`);
    const normalized = normalizeMatchResponse(data, matchId);
    applyMatch(normalized);
    if (!quiet) addProgress(`Status refreshed: ${PHASE_NAMES[normalized.phase]}.`);
    return normalized;
  }, [addProgress, applyMatch, fetchBot, matchId]);

  const advanceBot = useCallback(async (activeMatchId = matchId) => {
    if (!activeMatchId) throw new Error('No active match is available for the bot.');
    addProgress('Asking the localhost P2 bot to advance its next required action.');
    const data = await fetchBot('/api/testwired/advance', {
      method: 'POST',
      body: JSON.stringify({ matchId: activeMatchId }),
    });
    const action = data.action == null ? '' : String(data.action);
    const nextDialogue = data.dialogue == null ? '' : String(data.dialogue);
    const botTransactionId = optionalTransactionId(data);
    if (mountedRef.current) {
      setLastBotAction(action);
      setDialogue(nextDialogue);
      if (botTransactionId) setLastTransactionId(botTransactionId);
    }
    if (data.match) applyMatch(normalizeMatchResponse(data, activeMatchId));
    addProgress(action ? `Bot action: ${action}.` : 'Bot reports no action is currently required.');
    return data;
  }, [addProgress, applyMatch, fetchBot, matchId]);

  const runLocked = useCallback(async (message, operation) => {
    if (busy) return;
    setError(null);
    setBusy(true);
    setBusyMessage(message);
    try {
      await operation();
    } catch (caught) {
      const formatted = formatError(caught);
      if (formatted && mountedRef.current) {
        setError(formatted);
        addProgress(`Stopped: ${formatted}`);
      }
    } finally {
      if (mountedRef.current) {
        setBusy(false);
        setBusyMessage('');
      }
    }
  }, [addProgress, busy]);

  useEffect(() => {
    mountedRef.current = true;
    isWalletAvailable()
      .then((available) => { if (mountedRef.current) setWalletAvailable(available); })
      .catch(() => { if (mountedRef.current) setWalletAvailable(false); });
    fetchBot('/health')
      .then(() => { if (mountedRef.current) setBotHealth('ready'); })
      .catch((caught) => {
        if (caught?.name !== 'AbortError' && mountedRef.current) setBotHealth('offline');
      });

    return () => {
      mountedRef.current = false;
      for (const controller of requestControllersRef.current) controller.abort();
      requestControllersRef.current.clear();
    };
  }, [fetchBot]);

  useEffect(() => {
    if (!wallet) return undefined;
    return subscribeWalletState(wallet, (next) => {
      if (!mountedRef.current) return;
      if (next?.balances) setBalances(next.balances);
      if (next?.error) setError(`Wallet balance refresh failed: ${formatError(next.error)}`);
    });
  }, [wallet]);

  // Poll only active matches, and schedule after the full interval so automatic
  // requests can never run faster than the required eight-second floor.
  useEffect(() => {
    if (!matchId || !match || match.phase === 4 || busy) return undefined;
    const timer = window.setTimeout(() => {
      (async () => {
        const refreshed = await refreshStatus({ quiet: true });
        if (!refreshed || !botHasAction(refreshed) || !mountedRef.current) return;
        setBusy(true);
        setBusyMessage(
          'The P2 bot is generating or submitting its next proof. This may take about 45 seconds; watch ProofServerLog.',
        );
        try {
          await advanceBot(matchId);
        } finally {
          if (mountedRef.current) {
            setBusy(false);
            setBusyMessage('');
          }
        }
      })().catch((caught) => {
        const formatted = formatError(caught);
        if (formatted && mountedRef.current) {
          setError(formatted);
          setBusy(false);
          setBusyMessage('');
        }
      });
    }, AUTOMATIC_POLL_MS);
    return () => window.clearTimeout(timer);
  }, [advanceBot, busy, match, matchId, refreshStatus]);

  const connect = useCallback(() => runLocked('Waiting for Lace connection approval.', async () => {
    addProgress('Requesting a Lace connection on the local Undeployed network.');
    const handle = await connectWallet();
    if (!mountedRef.current) return;
    setWallet(handle);
    setBalances(handle.balances || {});
    // Exactly one provider belongs to this connected handle. Construction is
    // side-effect free: it does not locate or deploy a contract until Start.
    providerRef.current = new RealDealGameProvider({ walletHandle: handle });
    addProgress('Lace connected. No contract was deployed during connection.');
  }), [addProgress, runLocked]);

  const startMatch = useCallback(() => runLocked(
    'Generating proofs and submitting local-chain transactions. This can take about 45 seconds; watch ProofServerLog for proof-server progress.',
    async () => {
      if (!providerRef.current || !wallet) throw new Error('Connect Lace before starting TestWired.');
      const wagerAmount = parseSafeInteger(wagerInput, 'Wager', { minimum: 0 });
      setProgress([]);
      setHand([]);
      setSelectedIds(new Set());
      setMatch(null);
      setMatchId(null);
      setLastTransactionId(null);
      setLastBotAction('');
      setDialogue('');

      addProgress(`Creating a STANDARD mode match with local-chain wager ${wagerAmount}.`);
      const created = await providerRef.current.startGame({
        mode: STANDARD_MODE,
        wagerAmount,
      });
      const newMatchId = requireHex64(created?.matchId, 'Created match ID');
      const p1Entropy = requireHex64(created?.entropy, 'P1 entropy');
      const createTransactionId = optionalTransactionId(created);
      if (!mountedRef.current) return;
      setMatchId(newMatchId);
      setLastTransactionId(createTransactionId);
      addProgress(`Match ${shorten(newMatchId)} created${createTransactionId ? ` in tx ${shorten(createTransactionId)}` : ''}.`);

      const savedContractAddress = getContractAddress();
      if (typeof savedContractAddress !== 'string' || savedContractAddress.trim() === '') {
        throw new Error('No deployed contract address was saved after createMatch. Check Lace and the local indexer.');
      }
      const contractAddress = requireHex64(savedContractAddress, 'Contract address');
      addProgress('Sending P1 entropy and contract address to the localhost P2 bot for joining.');
      const joined = await fetchBot('/api/testwired/join', {
        method: 'POST',
        body: JSON.stringify({
          matchId: newMatchId,
          wagerAmount,
          p1Entropy,
          contractAddress,
          difficulty,
        }),
      });
      const p2Entropy = requireHex64(joined.p2Entropy, 'Bot P2 entropy');
      addProgress('P2 joined and returned a valid entropy reveal. Importing it only for this match.');
      providerRef.current.importEntropy('p2', p2Entropy);

      addProgress('Revealing the combined seed with starting rank 2 (rank index 0).');
      const revealed = await providerRef.current.revealSeed({ startingRank: 0 });
      const revealTransactionId = optionalTransactionId(revealed);
      if (mountedRef.current) setLastTransactionId(revealTransactionId);
      addProgress(`Seed reveal submitted${revealTransactionId ? ` in tx ${shorten(revealTransactionId)}` : ''}.`);

      addProgress('Reading the first normalized public state.');
      const statusData = await fetchBot(`/api/testwired/status?matchId=${encodeURIComponent(newMatchId)}`);
      applyMatch(normalizeMatchResponse(statusData, newMatchId));
      await advanceBot(newMatchId);
    },
  ), [addProgress, advanceBot, applyMatch, difficulty, fetchBot, runLocked, wagerInput, wallet]);

  const transactThenAdvance = useCallback((description, transaction, options = {}) => runLocked(
    'Generating a zero-knowledge proof and submitting the transaction. Allow about 45 seconds and watch ProofServerLog for live proof progress.',
    async () => {
      if (!providerRef.current || !matchId) throw new Error('Connect Lace and start a match first.');
      addProgress(description);
      const result = await transaction(providerRef.current);
      const transactionId = optionalTransactionId(result);
      if (mountedRef.current) setLastTransactionId(transactionId);
      addProgress(`Transaction submitted${transactionId ? `: ${shorten(transactionId)}` : '.'}`);
      if (options.removedIds?.length && match?.combinedSeed && mountedRef.current) {
        setHand((currentHand) => removeP1Cards(
          matchId,
          match.combinedSeed,
          currentHand,
          options.removedIds,
        ));
      }
      if (mountedRef.current) setSelectedIds(new Set());
      if (options.advance !== false) await advanceBot(matchId);
      await refreshStatus({ quiet: true });
    },
  ), [addProgress, advanceBot, match, matchId, refreshStatus, runLocked]);

  const selectedCards = useMemo(
    () => hand.filter((card) => selectedIds.has(card.id)),
    [hand, selectedIds],
  );

  const toggleCard = useCallback((cardId) => {
    if (busy) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(cardId)) next.delete(cardId);
      else if (next.size < 4) next.add(cardId);
      return next;
    });
  }, [busy]);

  const playSelected = useCallback(() => {
    if (!match || selectedCards.length < 1 || selectedCards.length > 4) return;
    const removedIds = selectedCards.map((card) => card.id);
    transactThenAdvance(
      `Committing ${selectedCards.length} private card rank value(s) while publicly claiming ${RANKS[match.currentRank]}.`,
      (provider) => provider.makePlay({
        cards: selectedCards.map((card) => card.rankIndex),
        claimedRank: match.currentRank,
        claimedCount: selectedCards.length,
      }),
      { removedIds },
    );
  }, [match, selectedCards, transactThenAdvance]);

  const isP1TurnToPlay = match?.phase === 2 && match.activePlayerIdx === 0;
  const pendingBotClaim = match?.phase === 3
    && match.hasPendingPlay
    && match.lastPlayerIdx === 1
    && !match.isChallenged;
  const p1MustProve = match?.phase === 3
    && match.hasPendingPlay
    && match.lastPlayerIdx === 0
    && (match.isChallenged || /challenge/i.test(lastBotAction));
  const canClaimPayout = match?.phase === 4 && match.winner === 1 && !match.escrowReleased;

  const renderedBalances = Object.entries(balances).map(([token, amount]) => (
    `${shorten(token, 5, 4)}=${String(amount)}`
  ));

  return (
    <section className="testwired-panel" aria-labelledby="testwired-title">
      <header className="testwired-panel__header">
        <div>
          <p className="testwired-panel__eyebrow">Browser P1 versus localhost P2 bot</p>
          <h2 id="testwired-title">TestWired · local chain</h2>
          <p className="testwired-panel__intro">
            This developer control panel uses the local Midnight node, indexer,
            proof server, and bot. Tokens and wagers belong to the disposable
            local chain; this is not mainnet.
          </p>
        </div>
        <dl className="testwired-vitals" aria-label="Connection status">
          <div><dt>Lace</dt><dd>{wallet ? 'Connected' : walletAvailable === false ? 'Not detected' : walletAvailable ? 'Detected' : 'Checking'}</dd></div>
          <div><dt>Bot</dt><dd>{botHealth === 'ready' ? 'Ready' : botHealth === 'offline' ? 'Offline' : 'Checking'}</dd></div>
          <div><dt>Mode</dt><dd>STANDARD (1)</dd></div>
        </dl>
      </header>

      <div className="testwired-toolbar">
        {!wallet ? (
          <button type="button" className="primary" onClick={connect} disabled={busy || walletAvailable === false}>
            {busy ? 'Connecting…' : 'Connect Lace'}
          </button>
        ) : (
          <div className="testwired-wallet">
            <strong>Wallet:</strong> {shorten(wallet.address || wallet.coinPublicKey)}
            <span><strong>Network:</strong> {wallet.networkId || 'unknown'}</span>
            <span><strong>Balances:</strong> {renderedBalances.length ? renderedBalances.join(', ') : 'none reported'}</span>
          </div>
        )}
        <label>
          Wager
          <input
            type="number"
            min="0"
            step="1"
            value={wagerInput}
            onChange={(event) => setWagerInput(event.target.value)}
            disabled={busy}
          />
        </label>
        <label>
          Bot difficulty
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={busy}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <button type="button" className="primary" onClick={startMatch} disabled={busy || !wallet}>
          Start STANDARD match
        </button>
      </div>

      {walletAvailable === false && (
        <p className="testwired-notice">
          Lace was not detected. Install its Midnight connector, switch it to
          Undeployed/local, reload this page, and try again.
        </p>
      )}
      {busyMessage && <p className="testwired-proof-status" role="status">{busyMessage}</p>}
      {error && <p className="testwired-error" role="alert">{error}</p>}

      {match && (
        <div className="testwired-match">
          <div className="testwired-match__heading">
            <div>
              <h3>Public match status</h3>
              <p className="testwired-identifiers">
                Match <code title={matchId}>{shorten(matchId)}</code>
                {' · '}Last tx <code title={lastTransactionId || ''}>{shorten(lastTransactionId)}</code>
              </p>
            </div>
            <button type="button" onClick={() => runLocked('Refreshing public match status.', refreshStatus)} disabled={busy}>
              Refresh
            </button>
          </div>

          <dl className="testwired-status-grid">
            <div><dt>Phase</dt><dd>{PHASE_NAMES[match.phase]}</dd></div>
            <div><dt>Required rank</dt><dd>{RANKS[match.currentRank]}</dd></div>
            <div><dt>Turn</dt><dd>{match.activePlayerIdx === 0 ? 'P1 (Lace)' : 'P2 (bot)'}</dd></div>
            <div><dt>Scores</dt><dd>P1 {match.p1Score} · P2 {match.p2Score}</dd></div>
            <div><dt>Hand sizes</dt><dd>P1 {match.p1HandSize} · P2 {match.p2HandSize}</dd></div>
            <div><dt>Pile</dt><dd>{match.pileSize}</dd></div>
            <div><dt>Winner</dt><dd>{match.winner === 0 ? 'None' : match.winner === 1 ? 'P1' : 'P2'}</dd></div>
            <div><dt>Pending claim</dt><dd>{match.hasPendingPlay ? `${match.lastClaimCount} as ${RANKS[match.lastClaimRank]}` : 'None'}</dd></div>
          </dl>

          {dialogue && <blockquote className="testwired-dialogue">{dialogue}</blockquote>}

          <div className="testwired-hand-area">
            <div className="testwired-hand-area__heading">
              <h3>P1 deterministic hand</h3>
              <span>{selectedIds.size}/4 selected</span>
            </div>
            {hand.length ? (
              <div className="testwired-hand" aria-label="Player One hand">
                {hand.map((card) => {
                  const selected = selectedIds.has(card.id);
                  return (
                    <button
                      type="button"
                      className={`testwired-card${selected ? ' testwired-card--selected' : ''}`}
                      key={card.id}
                      aria-pressed={selected}
                      aria-label={`${card.rank} of ${SUIT_LABELS[card.suit]}`}
                      onClick={() => toggleCard(card.id)}
                      disabled={busy || !isP1TurnToPlay || (!selected && selectedIds.size >= 4)}
                    >
                      <strong>{card.rank}</strong>
                      <span>{SUIT_LABELS[card.suit]}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="testwired-muted">The P1 hand appears after the combined seed is finalized.</p>
            )}
          </div>

          <div className="testwired-actions" aria-label="Player One actions">
            <button
              type="button"
              className="primary"
              onClick={playSelected}
              disabled={busy || !isP1TurnToPlay || selectedCards.length < 1 || selectedCards.length > 4}
            >
              Play {selectedCards.length || 'N'} as {RANKS[match.currentRank]}
            </button>
            {p1MustProve && (
              <button
                type="button"
                className="primary"
                onClick={() => transactThenAdvance('Resolving the bot challenge with P1’s private play witness.', (provider) => provider.resolveChallenge())}
                disabled={busy}
              >
                Prove my play
              </button>
            )}
            {pendingBotClaim && (
              <>
                <button
                  type="button"
                  onClick={() => transactThenAdvance('Accepting the P2 bot claim.', (provider) => provider.accept())}
                  disabled={busy}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => transactThenAdvance('Challenging the P2 bot claim; the bot will resolve its witness next.', (provider) => provider.challenge())}
                  disabled={busy}
                >
                  Proof or Bluff
                </button>
              </>
            )}
            {canClaimPayout && (
              <button
                type="button"
                className="primary"
                onClick={() => transactThenAdvance('Claiming the P1 local-chain payout.', (provider) => provider.claimPayout(), { advance: false })}
                disabled={busy}
              >
                Claim payout
              </button>
            )}
          </div>
        </div>
      )}

      <div className="testwired-log" aria-live="polite" aria-atomic="false">
        <h3>TestWired progress</h3>
        <ol>
          {progress.length
            ? progress.map((entry) => <li key={entry.id}>{entry.message}</li>)
            : <li>Connect Lace, confirm the bot is ready, then start a local match.</li>}
        </ol>
      </div>
    </section>
  );
}
