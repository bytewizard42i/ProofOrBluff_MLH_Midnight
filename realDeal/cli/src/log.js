/**
 * Tiny terminal logger. Keeps CLI output readable without pulling in
 * chalk/ora etc. — fewer deps, more deterministic in CI.
 */

const C = {
  reset: '\x1b[0m',
  dim:   '\x1b[2m',
  red:   '\x1b[31m',
  green: '\x1b[32m',
  yellow:'\x1b[33m',
  blue:  '\x1b[34m',
  magenta:'\x1b[35m',
  cyan:  '\x1b[36m',
  bold:  '\x1b[1m',
};

function ts() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

export const log = {
  info:  (m) => console.log(`${C.dim}[${ts()}]${C.reset} ${m}`),
  step:  (m) => console.log(`${C.cyan}${C.bold}→${C.reset} ${m}`),
  ok:    (m) => console.log(`${C.green}✓${C.reset} ${m}`),
  warn:  (m) => console.log(`${C.yellow}⚠${C.reset} ${m}`),
  err:   (m) => console.error(`${C.red}✗${C.reset} ${m}`),
  hr:    ()  => console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`),
  json:  (label, obj) => {
    console.log(`${C.magenta}${label}${C.reset}`);
    console.log(JSON.stringify(obj, jsonReplacer, 2));
  },
};

function jsonReplacer(_k, v) {
  if (typeof v === 'bigint') return v.toString() + 'n';
  if (v instanceof Uint8Array) {
    return '0x' + Array.from(v).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return v;
}
