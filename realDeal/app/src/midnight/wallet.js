/**
 * midnight/wallet.js — Lace (or any DApp Connector compliant) wallet bridge.
 *
 * Speaks the current @midnight-ntwrk/dapp-connector-api spec (CAIP-372):
 *
 *   window.midnight = { "<uuid>": InitialAPI, ... }
 *   InitialAPI.connect(networkId) -> Promise<ConnectedAPI>
 *
 * ConnectedAPI methods we consume here:
 *   - getShieldedAddresses()    -> { shieldedAddress, shieldedCoinPublicKey,
 *                                    shieldedEncryptionPublicKey }
 *   - getUnshieldedAddress()    -> { unshieldedAddress }
 *   - getDustAddress()          -> { dustAddress }
 *   - getShieldedBalances()     -> Record<TokenType, bigint>
 *   - getUnshieldedBalances()   -> Record<TokenType, bigint>
 *   - getDustBalance()          -> { balance: bigint, cap: bigint }
 *   - getConfiguration()        -> { networkId, indexerUri, ... }
 *
 * The handle we return preserves the shape the rest of the app expects:
 *   { api, coinPublicKey, encryptionPublicKey, address, balances, networkId }
 *
 * Tooling expectation: the user has Lace installed and has switched the
 * network to "Undeployed" so its hardcoded ports line up with our local
 * stack (9944 / 8088 / 6300).
 */

import { NETWORK_ID } from './config.js';

/**
 * The Initial API entries on `window.midnight` are keyed by UUID
 * (per CAIP-372), not by friendly names like `lace`. We pick the first
 * entry that looks like a real InitialAPI (has a callable `connect`).
 *
 * Returns the InitialAPI object, or null if none is found.
 */
function pickConnector() {
  if (typeof window === 'undefined' || !window.midnight) return null;
  const root = window.midnight;
  // Prefer legacy `lace` / `1am` keys if a wallet still uses them, then
  // fall back to the first UUID-keyed entry with a callable connect().
  const candidates = [root.lace, root.mnLace, root['1am'], ...Object.values(root)];
  for (const cand of candidates) {
    if (cand && typeof cand.connect === 'function') return cand;
    // Older wallets may still expose `.enable` instead of `.connect`.
    if (cand && typeof cand.enable === 'function') return cand;
  }
  return null;
}

export async function isWalletAvailable() {
  return pickConnector() != null;
}

/**
 * Collapse the wallet's separate balance buckets into a single
 * { tokenType -> bigint } object the existing UI already renders. Native
 * NIGHT shows up under the unshielded bucket; Dust under a synthetic
 * 'dust' key so the header can display it next to the others.
 */
async function collectBalances(api) {
  const out = {};
  const safe = async (fn) => {
    try { return await fn(); } catch { return null; }
  };
  const shielded   = await safe(() => api.getShieldedBalances());
  const unshielded = await safe(() => api.getUnshieldedBalances());
  const dust       = await safe(() => api.getDustBalance());
  if (shielded)   Object.assign(out, shielded);
  if (unshielded) Object.assign(out, unshielded);
  if (dust)       out.dust = dust.balance;
  return out;
}

/**
 * Request connection and return a handle bundling everything downstream
 * code needs: the underlying API, the coin public key, and a balance
 * snapshot.
 */
export async function connectWallet() {
  const connector = pickConnector();
  if (!connector) {
    throw new Error(
      'No Midnight wallet connector found. Install Lace and switch its ' +
        'network to "Undeployed" so it targets http://localhost:9944.'
    );
  }

  // Modern spec: connect(networkId). Older spec: enable({name}).
  let api;
  if (typeof connector.connect === 'function') {
    api = await connector.connect(NETWORK_ID);
  } else if (typeof connector.enable === 'function') {
    api = await connector.enable({ name: 'Proof or Bluff (realDeal)' });
  } else {
    throw new Error(
      'Wallet connector does not expose connect() or enable(). ' +
        'Please update Lace to a recent version.'
    );
  }
  if (!api) throw new Error('Wallet rejected the connection request.');

  // Validate network id via getConfiguration() (may not exist on legacy APIs).
  let networkId = NETWORK_ID;
  if (typeof api.getConfiguration === 'function') {
    try {
      const cfg = await api.getConfiguration();
      if (cfg?.networkId) networkId = cfg.networkId;
    } catch {
      // Configuration call is optional — keep going.
    }
  }
  if (networkId && networkId !== NETWORK_ID) {
    throw new Error(
      `Wallet is on network "${networkId}" but realDeal expects "${NETWORK_ID}". ` +
        'Switch the wallet network and reconnect.'
    );
  }

  // Pull addresses + balances. Each call is wrapped so that a single
  // failure (e.g. Dust not yet registered) does not blow up the whole
  // connection.
  const safe = async (fn) => { try { return await fn(); } catch { return null; } };
  const shieldedInfo   = await safe(() => api.getShieldedAddresses());
  const unshieldedInfo = await safe(() => api.getUnshieldedAddress());
  const balances       = await collectBalances(api);

  return {
    api,
    coinPublicKey: shieldedInfo?.shieldedCoinPublicKey ?? null,
    encryptionPublicKey: shieldedInfo?.shieldedEncryptionPublicKey ?? null,
    shieldedAddress: shieldedInfo?.shieldedAddress ?? null,
    address: unshieldedInfo?.unshieldedAddress ?? shieldedInfo?.shieldedAddress ?? null,
    balances,
    networkId,
  };
}

/**
 * Subscribe to balance/state updates by polling — the current DApp
 * Connector spec does not push state changes. Returns an unsubscribe
 * function that clears the interval. The callback receives a partial
 * state object similar to what `connectWallet()` resolves with.
 */
export function subscribeWalletState(handle, onUpdate) {
  if (!handle?.api) return () => {};
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      const balances = await collectBalances(handle.api);
      onUpdate({ balances });
    } catch (err) {
      onUpdate({ error: err });
    }
  };
  const id = setInterval(tick, 4000);
  return () => { stopped = true; clearInterval(id); };
}
