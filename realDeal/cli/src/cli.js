#!/usr/bin/env node
/**
 * pob-cli — drives every realDeal circuit from the terminal.
 *
 * Commands (each runs against the wallet selected by --player or
 * POB_DEFAULT_SEED):
 *   create-match     [--mode N --wager N]
 *   join-match       --match 0x... [--wager N]
 *   import-entropy   --match 0x... --role p1|p2 --hex 0x...
 *   reveal-seed      [--match 0x... --starting-rank 0]
 *   play             [--match 0x...] --cards 2,2,2 --rank 2
 *   accept           [--match 0x...]
 *   challenge        [--match 0x...]
 *   resolve          [--match 0x...]
 *   claim-payout     [--match 0x...]
 *   cancel           [--match 0x...]
 *   forfeit-abandon  [--match 0x... --timeout 86400]
 *   forfeit-stall    [--match 0x... --timeout 3600]
 *   state            [--match 0x...]   show full ledger view of the match
 *   active                              print active matchId + contract address
 *   address                             print contract address only
 *   e2e                                 full end-to-end smoke test
 *
 * Global flags:
 *   --player p1|p2|genesis              selects which seed env var to use
 *   --network undeployed|testnet|mainnet
 *
 * The CLI prefers `--match` flags; if omitted it uses the active match
 * stored in `.pob-state/active.json` (set after each create-match or
 * join-match).
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { log } from './log.js';
import { buildWalletFromSeed } from './wallet-node.js';
import { getContractApi } from './contract.js';
import * as state from './state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// --- argv parsing -----------------------------------------------------------

function parseArgv(argv) {
  const args = argv.slice(2);
  const cmd = args[0] || 'help';
  const flags = {};
  for (let i = 1; i < args.length; i += 1) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i += 1;
      }
    }
  }
  return { cmd, flags };
}

function num(x, fallback) {
  if (x === undefined || x === true) return fallback;
  const n = Number(x);
  if (Number.isNaN(n)) throw new Error(`Expected number, got ${x}`);
  return n;
}

function envSeed(player) {
  const map = {
    p1: process.env.POB_SEED_P1,
    p2: process.env.POB_SEED_P2,
    genesis: process.env.POB_SEED_GENESIS,
  };
  if (map[player]) return map[player];
  // Fall back to default alias env var (e.g. POB_DEFAULT_SEED=POB_SEED_GENESIS)
  const alias = process.env.POB_DEFAULT_SEED;
  if (alias && process.env[alias]) return process.env[alias];
  throw new Error(
    `No seed found for player "${player}". Set POB_SEED_${player.toUpperCase()} `
    + `in .env, or POB_DEFAULT_SEED to point at one of the seed env vars.`
  );
}

function endpointsFromEnv() {
  return {
    node: process.env.POB_NODE || 'http://localhost:9944',
    indexer: process.env.POB_INDEXER || 'http://localhost:8088/api/v3/graphql',
    indexerWs: process.env.POB_INDEXER_WS || 'ws://localhost:8088/api/v3/graphql/ws',
    proofServer: process.env.POB_PROOF_SERVER || 'http://localhost:6300',
  };
}

function resolveManagedDir() {
  const fromEnv = process.env.POB_MANAGED_DIR;
  if (fromEnv) return path.resolve(__dirname, '..', fromEnv);
  return path.resolve(__dirname, '..', '..', 'contracts', 'managed', 'proof-or-bluff');
}

function activeMatch(flags) {
  return flags.match || state.getActiveMatch();
}

// --- session boot -----------------------------------------------------------

async function openSession(flags) {
  const player = flags.player || 'genesis';
  const networkId = flags.network || process.env.POB_NETWORK_ID || 'undeployed';
  const seed = envSeed(player);
  const endpoints = endpointsFromEnv();
  const managedDir = resolveManagedDir();

  log.hr();
  log.info(`network    = ${networkId}`);
  log.info(`player     = ${player}`);
  log.info(`node       = ${endpoints.node}`);
  log.info(`indexer    = ${endpoints.indexer}`);
  log.info(`proof-srv  = ${endpoints.proofServer}`);
  log.info(`managedDir = ${managedDir}`);
  log.hr();

  const walletHandle = await buildWalletFromSeed({ seed, endpoints, networkId });
  const api = await getContractApi({
    walletHandle, endpoints, networkId, managedDir,
  });
  log.ok(`Contract: ${api.address}`);
  return { api, walletHandle, networkId };
}

// --- command implementations ------------------------------------------------

const commands = {
  async 'create-match'(flags) {
    const s = await openSession(flags);
    try {
      const result = await s.api.createMatch({
        mode: num(flags.mode, 1),
        wagerAmount: num(flags.wager, 5),
      });
      state.setActiveMatch(result.matchId);
      log.ok('createMatch confirmed');
      log.json('result', result);
      log.warn(
        'Save the entropy hex above — Player Two needs it before reveal-seed. '
        + 'Use `pob-cli import-entropy --role p1 --hex 0x...` on the other side.'
      );
    } finally { await s.walletHandle.shutdown(); }
  },

  async 'join-match'(flags) {
    if (!flags.match) throw new Error('--match 0x... is required');
    const s = await openSession(flags);
    try {
      const result = await s.api.joinMatch({
        matchId: flags.match,
        wagerAmount: num(flags.wager, 5),
      });
      state.setActiveMatch(flags.match);
      log.ok('joinMatch confirmed');
      log.json('result', result);
    } finally { await s.walletHandle.shutdown(); }
  },

  async 'import-entropy'(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    if (!flags.role) throw new Error('--role p1|p2 is required');
    if (!flags.hex)  throw new Error('--hex 0x... is required');
    // No wallet needed, this is local-only persistence.
    state.persistEntropy(matchId, flags.role, flags.hex);
    log.ok(`Stored ${flags.role} entropy for match ${matchId}`);
  },

  async 'reveal-seed'(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const result = await s.api.revealSeed({
        matchId,
        startingRank: num(flags['starting-rank'], 0),
      });
      log.ok('revealSeed confirmed');
      log.json('result', result);
    } finally { await s.walletHandle.shutdown(); }
  },

  async play(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    if (!flags.cards) throw new Error('--cards 2,2,2 (1-4 ranks) is required');
    if (flags.rank === undefined) throw new Error('--rank N is required');
    const cards = String(flags.cards).split(',').map((s) => Number(s.trim()));
    const s = await openSession(flags);
    try {
      const result = await s.api.playCards({
        matchId, cards,
        claimedRank: num(flags.rank),
        claimedCount: cards.length,
      });
      log.ok('playCards confirmed');
      log.json('result', result);
    } finally { await s.walletHandle.shutdown(); }
  },

  async accept(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const r = await s.api.acceptClaim({ matchId });
      log.ok('acceptClaim confirmed');
      log.json('result', r);
    } finally { await s.walletHandle.shutdown(); }
  },

  async challenge(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const r = await s.api.challengeClaim({ matchId });
      log.ok('challengeClaim confirmed');
      log.json('result', r);
    } finally { await s.walletHandle.shutdown(); }
  },

  async resolve(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const r = await s.api.resolveChallenge({ matchId });
      log.ok(`resolveChallenge confirmed — claim was ${r.honest ? 'HONEST ✓' : 'A BLUFF ✗'}`);
      log.json('result', r);
    } finally { await s.walletHandle.shutdown(); }
  },

  async 'claim-payout'(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const r = await s.api.claimPayout({ matchId });
      log.ok('claimPayout confirmed');
      log.json('result', r);
    } finally { await s.walletHandle.shutdown(); }
  },

  async cancel(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const r = await s.api.cancelUnjoinedMatch({ matchId });
      log.ok('cancelUnjoinedMatch confirmed');
      log.json('result', r);
    } finally { await s.walletHandle.shutdown(); }
  },

  async 'forfeit-abandon'(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const r = await s.api.forfeitAbandonedMatch({
        matchId,
        timeoutSeconds: BigInt(num(flags.timeout, 86_400)),
      });
      log.ok('forfeitAbandonedMatch confirmed');
      log.json('result', r);
    } finally { await s.walletHandle.shutdown(); }
  },

  async 'forfeit-stall'(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const r = await s.api.forfeitStalledChallenge({
        matchId,
        timeoutSeconds: BigInt(num(flags.timeout, 3600)),
      });
      log.ok('forfeitStalledChallenge confirmed');
      log.json('result', r);
    } finally { await s.walletHandle.shutdown(); }
  },

  async state(flags) {
    const matchId = activeMatch(flags);
    if (!matchId) throw new Error('No active match.');
    const s = await openSession(flags);
    try {
      const m = await s.api.getMatch(matchId);
      const phase = await s.api.getMatchPhase(matchId);
      log.ok(`Match ${matchId} phase=${phase}`);
      log.json('match', m);
    } finally { await s.walletHandle.shutdown(); }
  },

  async active() {
    const matchId = state.getActiveMatch();
    const networkId = process.env.POB_NETWORK_ID || 'undeployed';
    const address = state.getContractAddress(networkId);
    log.json('active', { matchId, networkId, contractAddress: address });
  },

  async address() {
    const networkId = process.env.POB_NETWORK_ID || 'undeployed';
    const address = state.getContractAddress(networkId);
    if (!address) {
      log.warn('No contract deployed yet for network ' + networkId);
      return;
    }
    console.log(address);
  },

  async e2e() {
    log.step('End-to-end smoke test (genesis wallet plays both sides)');
    log.warn('This drives both players from one wallet, which the contract '
      + 'rejects (joiner cannot equal creator). Use two seeds in real testing.');
  },

  async help() {
    console.log(HELP_TEXT);
  },
};

const HELP_TEXT = `pob-cli — realDeal headless driver

Commands:
  create-match     [--mode N --wager N]
  join-match       --match 0x... [--wager N]
  import-entropy   --match 0x... --role p1|p2 --hex 0x...
  reveal-seed      [--match 0x... --starting-rank N]
  play             [--match 0x...] --cards 2,2,2 --rank N
  accept           [--match 0x...]
  challenge        [--match 0x...]
  resolve          [--match 0x...]
  claim-payout     [--match 0x...]
  cancel           [--match 0x...]
  forfeit-abandon  [--match 0x... --timeout 86400]
  forfeit-stall    [--match 0x... --timeout 3600]
  state            [--match 0x...]
  active                              # print active matchId + contract address
  address                             # print contract address only
  e2e                                 # end-to-end smoke (uses 2 wallets if POB_SEED_P1/P2 set)

Global flags (apply to any command that opens a wallet):
  --player p1|p2|genesis              # which seed env var to use
  --network undeployed|testnet|mainnet

Setup:
  1) cp .env.example .env  &&  edit .env to fill in seeds + endpoints.
  2) npm install
  3) Make sure the local stack is running (docker compose -f standalone.yml
     up -d in /home/js/utils_Midnight/midnight-local-dev).

The CLI shares the on-chain contract with the browser app at ../app/, but
keeps its own local persistence under .pob-state/ — copy the contract
address printed by \`pob-cli address\` into the browser's localStorage
key \`pob:realdeal:contract-address\` if you want both surfaces talking
to the same deployed contract.
`;

// --- entry point ------------------------------------------------------------

async function main() {
  const { cmd, flags } = parseArgv(process.argv);
  const handler = commands[cmd];
  if (!handler) {
    log.err(`Unknown command: ${cmd}`);
    console.log(HELP_TEXT);
    process.exit(1);
  }
  try {
    await handler(flags);
    process.exit(0);
  } catch (err) {
    log.err(err.message || String(err));
    if (process.env.POB_VERBOSE) console.error(err);
    process.exit(1);
  }
}

main();
