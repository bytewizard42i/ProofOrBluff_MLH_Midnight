/**
 * state.js — file-backed persistence for CLI sessions.
 *
 * Mirrors the localStorage keys used by the browser app, but rooted in
 * `./.pob-state/` (cwd of the CLI) so it's easy to nuke between test
 * runs. We deliberately do NOT touch the browser app's localStorage —
 * the CLI is its own self-contained surface. Crossing surfaces means
 * copy-pasting the contract address (printed by `pob-cli active`).
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const STATE_DIR = path.resolve(process.cwd(), '.pob-state');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

// Per-network contract address. Switching POB_NETWORK_ID gives a fresh
// contract slot, so you don't accidentally talk to the pre-prod address
// while pointing at the local stack.
const CONTRACT_FILE = (networkId) =>
  path.join(STATE_DIR, networkId, 'contract.json');

const ACTIVE_FILE = path.join(STATE_DIR, 'active.json');

const ENTROPY_FILE = (matchId, role) =>
  path.join(STATE_DIR, 'entropy', matchId, `${role}.hex`);

const PLAY_FILE = (matchId) =>
  path.join(STATE_DIR, 'play', `${matchId}.json`);

export function getContractAddress(networkId) {
  const data = readJson(CONTRACT_FILE(networkId), null);
  return data?.address || null;
}

export function setContractAddress(networkId, address) {
  writeJson(CONTRACT_FILE(networkId), {
    address,
    network: networkId,
    deployedAt: new Date().toISOString(),
  });
}

export function getActiveMatch() {
  return readJson(ACTIVE_FILE, null)?.matchId || null;
}

export function setActiveMatch(matchId) {
  writeJson(ACTIVE_FILE, { matchId, updatedAt: new Date().toISOString() });
}

export function clearActiveMatch() {
  try { fs.unlinkSync(ACTIVE_FILE); } catch { /* noop */ }
}

export function persistEntropy(matchId, role, entropyHex) {
  const file = ENTROPY_FILE(matchId, role);
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, entropyHex.replace(/^0x/, ''));
}

export function getEntropy(matchId, role) {
  try {
    return fs.readFileSync(ENTROPY_FILE(matchId, role), 'utf8').trim();
  } catch {
    return null;
  }
}

export function persistPlayReveal(matchId, dump) {
  writeJson(PLAY_FILE(matchId), dump);
}

export function loadPlayReveal(matchId) {
  return readJson(PLAY_FILE(matchId), null);
}

export function stateRoot() { return STATE_DIR; }
export function privateStateDir(networkId) {
  return path.join(STATE_DIR, networkId, 'private-state');
}

export function homeStateDir() {
  // Fallback used by long-lived caches that should outlive cwd resets.
  return path.join(os.homedir(), '.pob-realdeal');
}
