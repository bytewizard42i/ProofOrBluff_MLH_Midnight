/**
 * speech.js — Browser TTS narration for the game log.
 *
 * Uses the built-in Web Speech API (window.speechSynthesis). Picks a
 * British female voice when available, otherwise falls back to any
 * en-GB voice, then any female voice, then the default.
 *
 * Public surface:
 *   - speak(text)         — queue a phrase to be spoken
 *   - cancelSpeech()      — flush the queue
 *   - isSpeaking()        — true while anything is queued or speaking
 *   - setSpeechMuted(b)   — when true, blocks new utterances and flushes
 *
 * NOTE: voice lists are loaded asynchronously by the browser; we listen
 * for `voiceschanged` and update our cached pick when it fires.
 */

let cachedVoice = null;
let muted = false;
let volume = 0.95; // 0..1, applied to every utterance
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function chooseVoice() {
  if (!supported) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. Known British female voice names across platforms (macOS, Chrome,
  //    Edge, Linux). We probe each in order.
  const britishFemaleNames = [
    'Kate', 'Serena', 'Fiona', 'Sonia', 'Libby', 'Hazel', 'Martha', 'Stephanie',
    'Susan', 'Google UK English Female', 'Microsoft Sonia', 'Microsoft Libby',
    'Microsoft Hazel', 'Microsoft Susan', 'Catherine',
  ];
  for (const name of britishFemaleNames) {
    const v = voices.find((vv) => vv.name.includes(name));
    if (v) return v;
  }

  // 2. Any en-GB voice whose name hints at female.
  const ukFemale = voices.find(
    (v) => /en[-_]GB/i.test(v.lang) && /female|woman/i.test(v.name)
  );
  if (ukFemale) return ukFemale;

  // 3. Any en-GB voice at all.
  const ukAny = voices.find((v) => /en[-_]GB/i.test(v.lang));
  if (ukAny) return ukAny;

  // 4. Any female English voice.
  const enFemale = voices.find(
    (v) => /^en/i.test(v.lang) && /female|woman|samantha|victoria|karen/i.test(v.name)
  );
  if (enFemale) return enFemale;

  // 5. Anything English.
  const enAny = voices.find((v) => /^en/i.test(v.lang));
  return enAny || voices[0] || null;
}

if (supported) {
  // Voices populate asynchronously; refresh the cache when ready.
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = chooseVoice();
  });
  // Try once now in case voices are already available.
  cachedVoice = chooseVoice();
}

/**
 * Pre-process a log line for natural speech. Strips emoji, unwraps
 * abbreviations, and normalises punctuation.
 */
function cleanForSpeech(text) {
  return text
    // Drop stray emoji / pictographs.
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    // Pronunciation fix for "AI" / "Ai". Most TTS voices read these
    // tokens as the word 'ai' (rhymes with 'eye'). Hyphen between the
    // two letters reliably triggers spell-out behaviour in most
    // engines so the voice reads it as "A-I".
    .replace(/\b(AI|Ai)\b/g, 'A-I')
    // Collapse multiple spaces left after substitutions.
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Speak a log entry in the chosen voice. Safe to call repeatedly — the
 * browser queues utterances and processes them in order.
 */
export function speak(text) {
  if (!supported) return;
  if (muted) return;
  const cleaned = cleanForSpeech(text);
  if (!cleaned) return;
  const u = new SpeechSynthesisUtterance(cleaned);
  const v = cachedVoice || chooseVoice();
  if (v) u.voice = v;
  u.rate = 1.06;   // slightly brisk for a casino dealer feel
  u.pitch = 1.05;
  u.volume = volume;
  window.speechSynthesis.speak(u);
}

/** Set narration volume (0..1). Applied to all future utterances. */
export function setSpeechVolume(v) {
  volume = Math.max(0, Math.min(1, Number(v) || 0));
}

export function getSpeechVolume() { return volume; }

/** Flush every pending utterance immediately. */
export function cancelSpeech() {
  if (!supported) return;
  window.speechSynthesis.cancel();
}

/** Whether anything is queued or speaking right now. */
export function isSpeaking() {
  if (!supported) return false;
  return window.speechSynthesis.speaking || window.speechSynthesis.pending;
}

/**
 * Toggle TTS on/off. Tied to the same mute control as the rest of the
 * audio. When muted we cancel anything in flight.
 */
export function setSpeechMuted(value) {
  muted = !!value;
  if (muted) cancelSpeech();
}

export function isSpeechMuted() { return muted; }
