/**
 * wagerProvider.js — realDeal IWagerProvider implementation.
 *
 * Wraps the wallet + native-token coin construction used during
 * createMatch and joinMatch. Phase 1 surfaces `connectWallet` and
 * `getWalletState`; staking/claim hooks are stubs until the matching
 * contract circuits are wired in Phase 2.
 */

import { connectWallet, subscribeWalletState } from '../../midnight/wallet.js';

export class RealDealWagerProvider {
  constructor() {
    this.handle = null;
    this._unsub = null;
    this._listeners = new Set();
  }

  async connect() {
    this.handle = await connectWallet();
    if (this._unsub) this._unsub();
    this._unsub = subscribeWalletState(this.handle, (next) => {
      this._listeners.forEach((cb) => cb(next));
    });
    return { address: this.handle.address, balances: this.handle.balances };
  }

  isConnected() {
    return this.handle != null;
  }

  onStateChange(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  getWalletHandle() {
    return this.handle;
  }

  async placeBet() {
    // The bet IS the coin handed to createMatch / joinMatch — there is
    // no separate "place" step in the on-chain flow. This method exists
    // so any UI built against IWagerProvider can call something
    // intuitive; it returns the active wallet handle for the caller to
    // forward into the game provider.
    if (!this.handle) throw new Error('Wallet not connected.');
    return this.handle;
  }

  async claimWinnings() {
    throw new Error('Phase 2: claimWinnings (claimPayout) not yet wired.');
  }

  getWagerState() {
    return {
      playerStake: null,
      aiStake: null,
      pot: null,
    };
  }
}

export default RealDealWagerProvider;
