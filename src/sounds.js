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

/** Brass-style triumphant fanfare. Two ascending arpeggios in C, finishing
 *  on a held C major chord. Used when the player catches the Ai bluffing. */
export function playFanfare() {
  if (!ensureCtx()) return;
  // Quick triplet pickup: G - C - E
  const pickup = [392.00, 523.25, 659.25];
  pickup.forEach((f, i) => {
    tone({ type: 'sawtooth', freq: f, t0: i * 0.09, dur: 0.12, gain: 0.32 });
    tone({ type: 'square',   freq: f * 0.5, t0: i * 0.09, dur: 0.12, gain: 0.14 });
  });
  // Main ascent: G - C - E - G - C  (held)
  const ascent = [
    { f: 392.00, t: 0.30, d: 0.13 }, // G4
    { f: 523.25, t: 0.43, d: 0.13 }, // C5
    { f: 659.25, t: 0.56, d: 0.13 }, // E5
    { f: 783.99, t: 0.69, d: 0.13 }, // G5
    { f: 1046.50, t: 0.82, d: 0.55 }, // C6 (held)
  ];
  ascent.forEach(({ f, t, d }) => {
    tone({ type: 'sawtooth', freq: f, t0: t, dur: d, gain: 0.38 });
    tone({ type: 'square',   freq: f * 0.5, t0: t, dur: d, gain: 0.18 });
    // Brilliant overtone for the held final note.
    if (d > 0.4) tone({ type: 'triangle', freq: f * 2, t0: t, dur: d, gain: 0.12 });
  });
  // Cymbal-ish noise hit on the held C6 for a stadium feel.
  noise({ t0: 0.82, dur: 0.6, gain: 0.22, lowpass: 6000 });
}

// ──────────────────────────────────────────────────────────────
// High-level outcomes routed by the App from log events
// ──────────────────────────────────────────────────────────────

/** You caught the Ai bluffing — triumphant fanfare + bells + laughter.
 *  This is the BIG WIN cue: trumpets-on-the-podium energy. */
export function playYouCaughtAi() {
  playFanfare();
  setTimeout(playWinBells, 200);
  setTimeout(playLaughter, 550);
}

/** You got caught bluffing — sad trombone wah-wah (per John's request),
 *  with a small rat-trap snap up front as the "gotcha". */
export function playYouGotCaught() {
  playRatTrap();
  setTimeout(playWahWah, 180);
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

/** Quick chip-click chime for the player's submit/accept/challenge press. */
export function playSubmitClick() {
  if (!ensureCtx()) return;
  tone({ type: 'sine',     freq: 880, freqEnd: 1320, t0: 0, dur: 0.12, gain: 0.32 });
  tone({ type: 'triangle', freq: 440, t0: 0, dur: 0.1, gain: 0.18 });
}

// ──────────────────────────────────────────────────────────────
// Background lounge music
// ──────────────────────────────────────────────────────────────
//
// A slow jazzy chord progression that loops softly. Synthesized purely
// in the Web Audio API so we don't ship any audio files. Tones only,
// loosely evoking the "Where do I begin?" / lounge-Vegas vibe without
// copying any specific melody.

let musicLoopId = null;
let musicGain = null;

/**
 * Start the lounge music loop. Safe to call multiple times; no-op if
 * already playing. The loop is built from chord arpeggios scheduled in
 * advance via the AudioContext clock so it stays in tempo.
 */
export function startBackgroundMusic() {
  const c = ensureCtx();
  if (!c) return;
  if (musicLoopId) return; // already running

  // Dedicated soft gain so music sits well under the SFX. Routed through
  // the master gain so the mute toggle still kills it.
  if (!musicGain) {
    musicGain = c.createGain();
    musicGain.gain.value = 0.16; // very gentle
    musicGain.connect(masterGain);
  }

  // ii–V–I–vi style progression in C minor-ish for a smoky feel:
  //   Cm7  →  Fm7  →  Bb7  →  Ebmaj7
  // Each chord = 4 beats at ~80 BPM (0.75s/beat, 3s/chord, 12s/loop).
  const beat = 0.75;
  const chord = 4 * beat;
  const chords = [
    { root: 130.81, voicing: [261.63, 311.13, 392.00, 466.16] }, // Cm7  : C Eb G Bb
    { root: 174.61, voicing: [349.23, 415.30, 523.25, 622.25] }, // Fm7  : F Ab C Eb
    { root: 116.54, voicing: [233.08, 293.66, 369.99, 466.16] }, // Bb7  : Bb D F Ab
    { root: 155.56, voicing: [311.13, 392.00, 466.16, 587.33] }, // Ebmaj7: Eb G Bb D
  ];

  const scheduleChord = ({ root, voicing }, t0) => {
    // Soft bass note across the whole chord duration.
    const bass = c.createOscillator();
    const bg = c.createGain();
    bass.type = 'sine';
    bass.frequency.setValueAtTime(root, t0);
    bg.gain.setValueAtTime(0.0001, t0);
    bg.gain.exponentialRampToValueAtTime(0.7, t0 + 0.1);
    bg.gain.exponentialRampToValueAtTime(0.4, t0 + chord - 0.3);
    bg.gain.exponentialRampToValueAtTime(0.0001, t0 + chord);
    bass.connect(bg).connect(musicGain);
    bass.start(t0);
    bass.stop(t0 + chord + 0.05);

    // Soft arpeggio of the voicing — gives the lounge piano feel.
    voicing.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, t0 + i * beat);
      g.gain.setValueAtTime(0.0001, t0 + i * beat);
      g.gain.exponentialRampToValueAtTime(0.55, t0 + i * beat + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * beat + beat * 0.95);
      o.connect(g).connect(musicGain);
      o.start(t0 + i * beat);
      o.stop(t0 + i * beat + beat);
    });
  };

  // Schedule one full loop and reschedule slightly before it ends so the
  // next loop is seamless. We use the AudioContext clock for precision.
  const tick = () => {
    if (!musicLoopId) return; // stopped
    const start = c.currentTime + 0.05;
    chords.forEach((ch, i) => scheduleChord(ch, start + i * chord));
  };

  // setInterval close to the loop length keeps queueing the next bar.
  tick();
  musicLoopId = setInterval(tick, chords.length * chord * 1000);
}

/** Stop the lounge music loop. */
export function stopBackgroundMusic() {
  if (musicLoopId) {
    clearInterval(musicLoopId);
    musicLoopId = null;
  }
  if (musicGain) {
    // Soft fade to avoid clicks.
    const c = ensureCtx();
    if (c) {
      const now = c.currentTime;
      musicGain.gain.cancelScheduledValues(now);
      musicGain.gain.setValueAtTime(musicGain.gain.value, now);
      musicGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    }
  }
}
