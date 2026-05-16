/**
 * midnight/wallet.js — Lace (or any DApp Connector compliant) wallet bridge.
 *
 * Tashar's workshop reminder: Midnight contracts speak in terms of a
 * "Coin Public Key" rather than a generic wallet address. The DApp
 * Connector returns it under `state().coinPublicKey`. Use it everywhere
 * the contract expects a `ZswapCoinPublicKey`.
 *
 * Tooling expectation: the user has Lace (or the 1AM extension) installed
 * and has switched the network to "Undeployed" so its hardcoded ports
 * line up with our local stack (9944 / 8088 / 6300).
 */

import { NETWORK_ID } from './config.js';

const DAPP_NAME = 'Proof or Bluff (realDeal)';

/**
 * Pick whichever DApp Connector the browser exposes. Lace registers as
 * `window.midnight.lace`; the 1AM extension exposes a similar key. The
 * connector spec is documented in @midnight-ntwrk/dapp-connector-api.
 */
function pickConnector() {
  if (typeof window === 'undefined') return null;
  const root = window.midnight;
  if (!root) return null;
  return root.lace || root['1am'] || Object.values(root)[0] || null;
}

export async function isWalletAvailable() {
  return pickConnector() != null;
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

  const enabled = await connector.enable({ name: DAPP_NAME });
  if (!enabled) {
    throw new Error('Wallet rejected the connection request.');
  }

  const api = await connector.apiVersion
    ? await connector.enable()
    : enabled;

  const state = await api.state();
  if (state.networkId && state.networkId !== NETWORK_ID) {
    throw new Error(
      `Wallet is on network "${state.networkId}" but realDeal expects ` +
        `"${NETWORK_ID}". Switch the wallet's network and reconnect.`
    );
  }

  return {
    api,
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    address: state.address,
    balances: state.balances || {},
    networkId: state.networkId || NETWORK_ID,
  };
}

/**
 * Subscribe to balance/state updates the wallet pushes. Returns an
 * unsubscribe function. Many DApp Connector implementations expose
 * `onStateChange`; fall back to a polling loop when they don't.
 */
export function subscribeWalletState(handle, onUpdate) {
  if (!handle?.api) return () => {};
  if (typeof handle.api.onStateChange === 'function') {
    return handle.api.onStateChange(onUpdate);
  }
  const id = setInterval(async () => {
    try {
      const next = await handle.api.state();
      onUpdate(next);
    } catch (err) {
      // Wallet may have been disconnected; let caller decide.
      onUpdate({ error: err });
    }
  }, 4000);
  return () => clearInterval(id);
}
