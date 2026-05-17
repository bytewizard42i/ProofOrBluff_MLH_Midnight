import { initGame, playCards, acceptClaim, challenge } from './demoLand/src/game/engine.js';
import { getChallengeReaction, DIALOGUE } from './demoLand/src/game/ai/scripted.js';

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) { console.log('  PASS:', label); passed++; }
  else { console.log('  FAIL:', label); failed++; }
}

// =====================================================================
// BUG #1 — acceptClaim() never checks win condition
// =====================================================================
console.log('\n========== BUG #1: acceptClaim missing win check ==========');

// --- Scenario A: PLAYER plays last card (1 card), AI accepts ---
console.log('\n--- Scenario A: Player plays last 1 card, AI accepts ---');
{
  const s = initGame('home');
  s.playerHand = [s.playerHand[0]];
  s.currentRank = s.playerHand[0].rank;
  s.turn = 'player';
  const after = playCards(s, { cardsPlayed: s.playerHand, claimedRank: s.currentRank, claimedCount: 1, player: 'player' });
  const accepted = acceptClaim(after.state);
  assert('Player hand is empty', accepted.state.playerHand.length === 0);
  assert('Game status should be gameover', accepted.state.status === 'gameover');
  assert('Winner should be player', accepted.state.winner === 'player');
}

// --- Scenario B: PLAYER plays last 3 cards, AI accepts ---
console.log('\n--- Scenario B: Player plays last 3 cards, AI accepts ---');
{
  const s = initGame('home');
  // Give player exactly 3 cards of the same rank
  const rank = '7';
  s.playerHand = s.playerHand.filter(c => c.rank === rank).slice(0, 3);
  if (s.playerHand.length < 3) {
    // If not enough 7s, just take any 3 cards
    s.playerHand = s.playerHand.concat(initGame('home').playerHand).slice(0, 3);
  }
  s.currentRank = rank;
  s.turn = 'player';
  const after = playCards(s, { cardsPlayed: s.playerHand, claimedRank: s.currentRank, claimedCount: s.playerHand.length, player: 'player' });
  const accepted = acceptClaim(after.state);
  assert('Player hand is empty', accepted.state.playerHand.length === 0);
  assert('Game status should be gameover', accepted.state.status === 'gameover');
  assert('Winner should be player', accepted.state.winner === 'player');
}

// --- Scenario C: AI plays last card, PLAYER accepts ---
console.log('\n--- Scenario C: AI plays last 1 card, Player accepts ---');
{
  const s = initGame('home');
  s.aiHand = [s.aiHand[0]];
  s.currentRank = s.aiHand[0].rank;
  s.turn = 'ai';
  const after = playCards(s, { cardsPlayed: s.aiHand, claimedRank: s.currentRank, claimedCount: 1, player: 'ai' });
  const accepted = acceptClaim(after.state);
  assert('AI hand is empty', accepted.state.aiHand.length === 0);
  assert('Game status should be gameover', accepted.state.status === 'gameover');
  assert('Winner should be ai', accepted.state.winner === 'ai');
}

// --- Scenario D: Casino mode, Player plays last 2 cards, AI accepts ---
console.log('\n--- Scenario D: Casino mode, Player plays last 2 cards, AI accepts ---');
{
  const s = initGame('casino');
  s.playerHand = s.playerHand.slice(0, 2);
  s.currentRank = s.playerHand[0].rank;
  s.turn = 'player';
  const after = playCards(s, { cardsPlayed: s.playerHand, claimedRank: s.currentRank, claimedCount: 2, player: 'player' });
  const accepted = acceptClaim(after.state);
  assert('Player hand is empty', accepted.state.playerHand.length === 0);
  assert('Game status should be gameover', accepted.state.status === 'gameover');
  assert('Winner should be player', accepted.state.winner === 'player');
}

// =====================================================================
// BUG #2 — getChallengeReaction uses wrong dialogue
// =====================================================================
console.log('\n========== BUG #2: getChallengeReaction wrong dialogue ==========');

// The bluffWorked lines (what currently gets returned incorrectly)
const bluffWorkedLines = new Set(DIALOGUE.bluffWorked);
// The gotCaught lines
const gotCaughtLines = new Set(DIALOGUE.gotCaught);
// The challengeWon lines
const challengeWonLines = new Set(DIALOGUE.challengeWon);
// The challengeLost lines
const challengeLostLines = new Set(DIALOGUE.challengeLost);

// --- Scenario E: Player challenges AI's HONEST claim (aiWasChallenger=false, claimWasTrue=true) ---
console.log('\n--- Scenario E: Player challenges AI honest claim ---');
{
  const results = new Set();
  for (let i = 0; i < 50; i++) {
    results.add(getChallengeReaction({ aiWasChallenger: false, claimWasTrue: true }));
  }
  const allAreBluffWorked = [...results].every(r => bluffWorkedLines.has(r));
  console.log('  Lines returned:', [...results].map(r => JSON.stringify(r)).join(', '));
  assert('All returned lines come from bluffWorked (WRONG category)', allAreBluffWorked);
  console.log('  ^ This PASS means the bug exists: it SHOULD use a vindicated/proud category,');
  console.log('    not "Sucker" / "If you only knew" which are for lies that fooled someone.');
}

// --- Scenario F: Player challenges AI's BLUFF (aiWasChallenger=false, claimWasTrue=false) ---
console.log('\n--- Scenario F: Player challenges AI bluff (control test) ---');
{
  const results = new Set();
  for (let i = 0; i < 50; i++) {
    results.add(getChallengeReaction({ aiWasChallenger: false, claimWasTrue: false }));
  }
  const allAreGotCaught = [...results].every(r => gotCaughtLines.has(r));
  assert('All returned lines come from gotCaught (correct category)', allAreGotCaught);
}

// --- Scenario G: AI challenges player's honest claim (aiWasChallenger=true, claimWasTrue=true) ---
console.log('\n--- Scenario G: AI challenges player honest claim (control test) ---');
{
  const results = new Set();
  for (let i = 0; i < 50; i++) {
    results.add(getChallengeReaction({ aiWasChallenger: true, claimWasTrue: true }));
  }
  const allAreChallengeLost = [...results].every(r => challengeLostLines.has(r));
  assert('All returned lines come from challengeLost (correct category)', allAreChallengeLost);
}

// =====================================================================
// BUG #3 — Shallow copy: log array shared between old and new state
// =====================================================================
console.log('\n========== BUG #3: Log array mutation via shallow copy ==========');

// --- Scenario H: playCards mutates original log ---
console.log('\n--- Scenario H: playCards() log mutation ---');
{
  const s = initGame('home');
  const logBefore = [...s.log]; // snapshot
  const logRef = s.log;
  s.turn = 'player';
  s.currentRank = s.playerHand[0].rank;
  const after = playCards(s, { cardsPlayed: [s.playerHand[0]], claimedRank: s.currentRank, claimedCount: 1, player: 'player' });
  assert('Log arrays are same JS reference (bug)', logRef === after.state.log);
  assert('Original state log was mutated (grew from ' + logBefore.length + ' to ' + s.log.length + ')', s.log.length > logBefore.length);
}

// --- Scenario I: acceptClaim mutates original log ---
console.log('\n--- Scenario I: acceptClaim() log mutation ---');
{
  const s = initGame('home');
  s.turn = 'player';
  s.currentRank = s.playerHand[0].rank;
  const played = playCards(s, { cardsPlayed: [s.playerHand[0]], claimedRank: s.currentRank, claimedCount: 1, player: 'player' });
  const logBefore = [...played.state.log];
  const logRef = played.state.log;
  const accepted = acceptClaim(played.state);
  assert('Log arrays are same JS reference (bug)', logRef === accepted.state.log);
  assert('Previous state log was mutated (grew from ' + logBefore.length + ' to ' + played.state.log.length + ')', played.state.log.length > logBefore.length);
}

// --- Scenario J: challenge mutates original log ---
console.log('\n--- Scenario J: challenge() log mutation ---');
{
  const s = initGame('home');
  s.turn = 'player';
  s.currentRank = s.playerHand[0].rank;
  const played = playCards(s, { cardsPlayed: [s.playerHand[0]], claimedRank: s.currentRank, claimedCount: 1, player: 'player' });
  const logBefore = [...played.state.log];
  const logRef = played.state.log;
  const challenged = challenge(played.state);
  assert('Log arrays are same JS reference (bug)', logRef === challenged.state.log);
  assert('Previous state log was mutated', played.state.log.length > logBefore.length);
}

// --- Scenario K: passTurn does NOT mutate (control - this one is correct) ---
console.log('\n--- Scenario K: passTurn() log mutation (control - should be clean) ---');
{
  const s = initGame('home');
  s.turn = 'player';
  s.lastPlay = null;
  const logRef = s.log;
  const logBefore = [...s.log];
  // import passTurn
  const { passTurn } = await import('./demoLand/src/game/engine.js');
  const result = passTurn(s, { player: 'player' });
  assert('Log arrays are DIFFERENT references (correct!)', logRef !== result.state.log);
  assert('Original state log was NOT mutated', s.log.length === logBefore.length);
}

// =====================================================================
// SUMMARY
// =====================================================================
console.log('\n========== SUMMARY ==========');
console.log('Passed:', passed);
console.log('Failed:', failed);
if (failed > 0) {
  console.log('\nFailed tests indicate the bugs do NOT exist or test was wrong.');
} else {
  console.log('\nAll tests passed — all 3 bugs are CONFIRMED across multiple scenarios.');
}
