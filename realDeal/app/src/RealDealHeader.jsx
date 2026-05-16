import React, { useCallback, useEffect, useState } from 'react';

import { connectWallet, isWalletAvailable, subscribeWalletState }
  from './midnight/wallet.js';
import { getContractApi } from './midnight/contract.js';

/**
 * RealDealHeader — sits above the demoLand-style game UI and exposes the
 * Midnight-backed actions that are actually wired in Phase 1.
 *
 * What this banner offers right now:
 *   ✅ Detect Lace / 1AM wallet on the page
 *   ✅ Connect to the wallet and surface the Coin Public Key
 *   ✅ Fire `createMatch` on-chain and show matchId + tx hash
 *   🟡 Every other circuit is a stub in midnight/contract.js
 *
 * The game UI below this header continues to use the local engine.js so
 * a hacker can still play single-player demoLand-style during dev. As
 * Phase 2 wires each circuit, the providers/realdeal/ layer will swap
 * those calls over.
 *
 * TODO Phase 3: replace this bare-bones banner with an admin-only
 * MidnightVitals diagnostic panel (live ping of proof server / indexer /
 * node / wallet + interaction log) once MidnightVitals ships as a real
 * npm package. POB is committed to being consumer #2 of MidnightVitals.
 *   Plan & open questions: realDeal/docs/PHASE_3_MIDNIGHTVITALS.md
 *   Source repo:           /home/js/DIDzMonolith/MidnightVitals
 *   Current source-of-truth (until extracted): DiscoveryManagement
 */

const STYLES = {
  wrap: {
    background: 'linear-gradient(90deg, #221b3a 0%, #181432 100%)',
    color: '#e7e3ff',
    border: '1px solid #3b2e6a',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    margin: '0.75rem 1rem 0 1rem',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.92rem',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    alignItems: 'center',
  },
  pill: (color) => ({
    background: color,
    color: '#0a0a14',
    fontWeight: 600,
    padding: '0.15rem 0.55rem',
    borderRadius: '999px',
    fontSize: '0.78rem',
  }),
  btn: {
    background: '#5d4ad8',
    border: 'none',
    color: 'white',
    padding: '0.35rem 0.8rem',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnGhost: {
    background: 'transparent',
    border: '1px solid #5d4ad8',
    color: '#bcb1ff',
    padding: '0.35rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.82rem',
    color: '#bcb1ff',
    wordBreak: 'break-all',
  },
  warn: {
    color: '#ffd66b',
    fontSize: '0.85rem',
  },
  error: {
    color: '#ff8a8a',
    fontSize: '0.85rem',
  },
};

const truncate = (s, head = 8, tail = 6) =>
  !s ? '' : s.length > head + tail + 3 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s;

export default function RealDealHeader() {
  const [walletAvailable, setWalletAvailable] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [contractApi, setContractApi] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [lastMatch, setLastMatch] = useState(null);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    isWalletAvailable().then(setWalletAvailable);
  }, []);

  useEffect(() => {
    if (!wallet) return undefined;
    return subscribeWalletState(wallet, (next) => {
      if (next?.balances) setBalances(next.balances);
    });
  }, [wallet]);

  const onConnect = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const handle = await connectWallet();
      setWallet(handle);
      setBalances(handle.balances || {});
      // Don't auto-deploy the contract on connect; defer until the user
      // actually requests createMatch. Cheaper, fewer surprise tx prompts.
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }, []);

  const onCreateMatch = useCallback(async () => {
    if (!wallet) return;
    setError(null);
    setBusy(true);
    try {
      let api = contractApi;
      if (!api) {
        api = await getContractApi({ walletHandle: wallet });
        setContractApi(api);
      }
      // Demo defaults — wire a form to these later.
      const result = await api.createMatch({
        mode: 1, // STANDARD
        wagerAmount: 5,
      });
      setLastMatch(result);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setBusy(false);
    }
  }, [wallet, contractApi]);

  const status = walletAvailable === null
    ? 'detecting…'
    : walletAvailable
      ? wallet
        ? 'connected'
        : 'wallet detected'
      : 'no wallet';

  const statusColor =
    status === 'connected' ? '#8af3a8'
      : status === 'wallet detected' ? '#ffd66b'
      : status === 'detecting…' ? '#bcb1ff'
      : '#ff8a8a';

  return (
    <div style={STYLES.wrap}>
      <div style={STYLES.row}>
        <span style={STYLES.pill('#bcb1ff')}>🌙 realDeal</span>
        <span style={STYLES.pill(statusColor)}>{status}</span>
        {wallet && (
          <span style={STYLES.mono}>
            coinPK: {truncate(wallet.coinPublicKey)}
          </span>
        )}
        {wallet && balances && Object.keys(balances).length > 0 && (
          <span style={STYLES.mono}>
            balances: {Object.entries(balances)
              .map(([k, v]) => `${truncate(k, 4, 4)}=${v}`)
              .join(', ')}
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {!wallet && (
            <button
              type="button"
              style={STYLES.btn}
              onClick={onConnect}
              disabled={busy || walletAvailable === false}
            >
              {busy ? 'Connecting…' : 'Connect Lace / 1AM'}
            </button>
          )}
          {wallet && (
            <button
              type="button"
              style={STYLES.btn}
              onClick={onCreateMatch}
              disabled={busy}
            >
              {busy ? 'Working…' : 'Create On-Chain Match'}
            </button>
          )}
        </span>
      </div>

      {walletAvailable === false && (
        <div style={{ ...STYLES.warn, marginTop: '0.5rem' }}>
          No Midnight DApp Connector detected. Install Lace and set its
          network to <strong>Undeployed</strong> so it targets the local
          stack at localhost:9944.
        </div>
      )}

      {error && (
        <div style={{ ...STYLES.error, marginTop: '0.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {lastMatch && (
        <div style={{ ...STYLES.mono, marginTop: '0.5rem' }}>
          ✅ matchId: {lastMatch.matchId}
          <br />
          tx: {truncate(lastMatch.txHash, 10, 8)}
        </div>
      )}

      <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: '#988ad6' }}>
        The game UI below still runs the local engine for dev. As Phase 2 wires
        each circuit (joinMatch → claimPayout), those calls swap over to
        on-chain transactions. See <code>src/midnight/README.md</code>.
      </div>
    </div>
  );
}
