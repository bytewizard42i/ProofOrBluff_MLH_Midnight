/**
 * sounds.js — Web Audio API casino sound effects for Proof or Bluff.
 *
 * Everything is synthesized in the browser so we don't ship any audio
 * assets. All effects are short (<1.5s) and routed through a master gain
 * node so a single mute toggle can silence the lot.
 *
 * Browsers require a user gesture before AudioContext can produce sound;
 * call unlockAudio() from a click handler before the first effect plays.
 */

let ctx = null;
let masterGain = null;
let muted = false;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = muted ? 0 : 0.35;
  masterGain.connect(ctx.destination);
  return ctx;
}

/** Resume the AudioContext from a user gesture. Safe to call repeatedly. */
export function unlockAudio() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
}

export function setMuted(value) {
  muted = !!value;
  if (masterGain) masterGain.gain.value = muted ? 0 : 0.35;
}

export function isMuted() {
  return muted;
}

// ──────────────────────────────────────────────────────────────
// Building blocks
// ──────────────────────────────────────────────────────────────

/**
 * Schedule an oscillator that ramps frequency and volume between two
 * envelopes. `t0` is relative to ctx.currentTime.
 */
function tone({ type = 'sine', freq, freqEnd, t0 = 0, dur = 0.3, gain = 0.6, gainEnd = 0.0001 }) {
  const c = ensureCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  const start = c.currentTime + t0;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(gainEnd, start + dur);
  osc.connect(g).connect(masterGain);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/**
 * Schedule a short noise burst — used for trap snaps and percussion.
 */
function noise({ t0 = 0, dur = 0.08, gain = 0.5, lowpass = 1500 }) {
  const c = ensureCtx();
  if (!c) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filt = c.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = lowpass;
  const g = c.createGain();
  const start = c.currentTime + t0;
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  src.connect(filt).connect(g).connect(masterGain);
  src.start(start);
  src.stop(start + dur + 0.02);
}

// ──────────────────────────────────────────────────────────────
// Effects
// ──────────────────────────────────────────────────────────────

/** Cheery slot-machine bell jingle for wins. */
export function playWinBells() {
  if (!ensureCtx()) return;
  // Arpeggio C5 E5 G5 C6 then a sustained C6 chime
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => {
    tone({ type: 'sine', freq: f, t0: i * 0.08, dur: 0.4, gain: 0.45 });
    tone({ type: 'triangle', freq: f * 2, t0: i * 0.08, dur: 0.3, gain: 0.18 });
  });
  tone({ type: 'sine', freq: 1046.5, t0: 0.34, dur: 0.7, gain: 0.4 });
  tone({ type: 'sine', freq: 1318.5, t0: 0.34, dur: 0.7, gain: 0.25 });
}

/** Quick "ha-ha-ha" chuckle for catching the Ai bluffing. */
export function playLaughter() {
  if (!ensureCtx()) return;
  // Three pulses of a low square with mild pitch wobble.
  const base = 240;
  for (let i = 0; i < 4; i += 1) {
    const f = base + (i % 2 === 0 ? 0 : 30) + (Math.random() * 20 - 10);
    tone({ type: 'sawtooth', freq: f, freqEnd: f * 0.85, t0: i * 0.13, dur: 0.11, gain: 0.3 });
  }
}

/** Trombone "wah wah waaaah" — for when someone gets shown up. */
export function playWahWah() {
  if (!ensureCtx()) return;
  const steps = [
    { f: 196, t: 0.0, d: 0.18 }, // G3
    { f: 174, t: 0.2, d: 0.18 }, // F3
    { f: 130, t: 0.4, d: 0.55 }, // C3 (the long sad one)
  ];
  steps.forEach(({ f, t, d }) => {
    tone({ type: 'sawtooth', freq: f, freqEnd: f * 0.92, t0: t, dur: d, gain: 0.32 });
    tone({ type: 'square',   freq: f * 0.5, t0: t, dur: d, gain: 0.12 });
  });
}

/** Rat-trap SNAP! followed by a short reverb-y rattle. */
export function playRatTrap() {
  if (!ensureCtx()) return;
  noise({ t0: 0, dur: 0.06, gain: 0.7, lowpass: 5000 });
  tone({ type: 'square', freq: 90, freqEnd: 40, t0: 0, dur: 0.12, gain: 0.6 });
  noise({ t0: 0.08, dur: 0.18, gain: 0.25, lowpass: 1200 });
}

/** Cartoon "yeooooww" descending whoop — the Tom-cat scream. */
export function playYeoww() {
  if (!ensureCtx()) return;
  tone({ type: 'sawtooth', freq: 880, freqEnd: 180, t0: 0, dur: 0.7, gain: 0.4 });
  tone({ type: 'sine',     freq: 440, freqEnd:  90, t0: 0, dur: 0.7, gain: 0.2 });
}

/** Slide-whistle going UP — silly little flourish. */
export function playFunny() {
  if (!ensureCtx()) return;
  tone({ type: 'triangle', freq: 320, freqEnd: 1200, t0: 0, dur: 0.45, gain: 0.35 });
  tone({ type: 'sine',     freq: 640, freqEnd: 2400, t0: 0, dur: 0.45, gain: 0.12 });
}

// ──────────────────────────────────────────────────────────────
// High-level outcomes routed by the App from log events
// ──────────────────────────────────────────────────────────────

/** You caught the Ai bluffing — bells + laughter + wah-wah on the Ai. */
export function playYouCaughtAi() {
  playWinBells();
  setTimeout(playLaughter, 250);
  setTimeout(playWahWah, 700);
}

/** You got caught bluffing — rat trap snap + Tom yelp + silly slide. */
export function playYouGotCaught() {
  playRatTrap();
  setTimeout(playYeoww, 180);
  setTimeout(playFunny, 700);
}

/** Your honest claim survived a bad Ai challenge — bells. */
export function playYouSurvivedChallenge() {
  playWinBells();
}

/** Your bad challenge — wah-wah and a bonk. */
export function playYouMisCalled() {
  playWahWah();
  setTimeout(() => noise({ t0: 0, dur: 0.1, gain: 0.4, lowpass: 800 }), 300);
}

/** Big game-over bells. */
export function playGameWon() {
  playWinBells();
  setTimeout(playWinBells, 450);
}

/** Game-over trombone descent. */
export function playGameLost() {
  playWahWah();
  setTimeout(playYeoww, 600);
}
