/**
 * wagerProvider.js — realDeal IWagerProvider implementation.
 *
 * Wraps the wallet + native-token coin construction used during
 * createMatch and joinMatch. All circuits are now wired through
 * the game provider's contract API.
 */

import { connectWallet, subscribeWalletState } from '../../midnight/wallet.js';
import { getContractApi } from '../../midnight/contract.js';

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

  async claimWinnings({ matchId } = {}) {
    if (!this.handle) throw new Error('Wallet not connected.');
    const api = await getContractApi({ walletHandle: this.handle });
    const id = matchId || window.localStorage.getItem('pob:realdeal:active-match');
    if (!id) throw new Error('No active match to claim winnings from.');
    return api.claimPayout({ matchId: id });
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
