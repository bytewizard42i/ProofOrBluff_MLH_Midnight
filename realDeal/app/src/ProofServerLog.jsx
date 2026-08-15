import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * ProofServerLog — floating, draggable, resizable side panel that polls
 * the Vite dev-server middleware at /api/proof-server-logs and renders
 * docker logs from `midnight-proof-server`. Fully out-of-flow (fixed
 * positioning), so it never reflows the gameboard.
 *
 * Interactions:
 *   - Drag: mousedown anywhere on the header (except buttons) and drag
 *     to reposition. Position is clamped to the viewport so the panel
 *     never escapes off-screen.
 *   - Resize: bottom-right grip handle (also CSS native resize as a
 *     fallback). Sizes are clamped to a sensible min/max range.
 *   - Pause / collapse / dismiss buttons in the header.
 *   - Geometry (x, y, w, h) and open/closed state persist in
 *     localStorage so the layout survives reloads.
 *
 * Why this exists: makes the otherwise invisible ZK pipeline tangible
 * during the demo. When a circuit call fires, the player can see lines
 * like 'POST /prove HTTP/1.1; took 4.4s' / 'proof ok' land in real time.
 */

const ENDPOINT      = '/api/proof-server-logs';
const POLL_INTERVAL = 2000;
const TAIL_DEFAULT  = 40;

const STORAGE_OPEN  = 'pob:realdeal:proofServerLog:open';
const STORAGE_GEO   = 'pob:realdeal:proofServerLog:geometry';

const MIN_W = 280;
const MIN_H = 200;
const MAX_W = 720;
const MAX_H = 900;

function defaultGeometry() {
  // Anchored to the right margin, near the top of the play area.
  const w = Math.min(360, Math.floor(window.innerWidth * 0.30));
  const h = Math.min(520, Math.floor(window.innerHeight * 0.65));
  return {
    x: Math.max(12, window.innerWidth - w - 12),
    y: 88,
    w,
    h,
  };
}

function loadGeometry() {
  try {
    const raw = window.localStorage.getItem(STORAGE_GEO);
    if (!raw) return defaultGeometry();
    const g = JSON.parse(raw);
    if (typeof g.x !== 'number') return defaultGeometry();
    return clampGeometry(g);
  } catch {
    return defaultGeometry();
  }
}

function clampGeometry(g) {
  const w  = Math.min(MAX_W, Math.max(MIN_W, g.w));
  const h  = Math.min(MAX_H, Math.max(MIN_H, g.h));
  const x  = Math.min(window.innerWidth  - w - 4, Math.max(4, g.x));
  const y  = Math.min(window.innerHeight - h - 4, Math.max(4, g.y));
  return { x, y, w, h };
}

// docker often emits colored output for logs (the proof-server uses
// tracing -> the ANSI-colored format). Strip those escape sequences
// before parsing so the panel doesn't render literal '\u001b[2m'
// rubbish and so each line stays a manageable length.
//
// Regex matches a CSI escape: ESC [ <params> <intermediate> <final>.
// The params/intermediate ranges cover every variant we'll see in
// docker output (mostly SGR sequences like \e[32m, \e[1;33m, \e[0m).
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\u001b\[[0-9;]*[A-Za-z]/g;

function classifyLine(line) {
  if (!line) return null;
  const text = line.replace(ANSI_RE, '').trim();
  if (!text) return null;

  let kind = 'info';
  if (/error|panic|fatal/i.test(text))           kind = 'error';
  else if (/warn/i.test(text))                   kind = 'warn';
  else if (/proof ok|verified/i.test(text))      kind = 'ok';
  else if (/proof created/i.test(text))          kind = 'proof';
  else if (/POST \/prove/i.test(text))           kind = 'request';

  const tsMatch = text.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  const ts = tsMatch ? tsMatch[1].slice(11) : null;
  const body = tsMatch
    ? text.slice(tsMatch[0].length).replace(/^\.\d+Z\s+/, '').trim()
    : text;

  let timing = null;
  const tm = body.match(/took ([\d.]+s)/);
  if (tm) timing = tm[1];

  // Full raw line is a stable identifier for diffing across polls.
  // docker logs prefix each line with a high-resolution timestamp so
  // two lines that look identical (e.g. two GET / pings) still differ.
  return { key: text, raw: text, ts, kind, body, timing };
}

// Breakpoint below which the panel defaults to collapsed so it doesn't
// obscure mobile screens. Matches the common sm: breakpoint (640 px).
const MOBILE_BREAKPOINT = 640;

export default function ProofServerLog() {
  const [open, setOpen] = useState(() => {
    // On narrow (mobile) viewports, collapse by default so the panel
    // doesn't block the UI.  On wider screens, default to open.
    // If the user has already saved a preference it always wins.
    if (typeof window === 'undefined') return true;
    const isWide = window.innerWidth >= MOBILE_BREAKPOINT;
    try {
      const stored = window.localStorage.getItem(STORAGE_OPEN);
      if (stored === null) return isWide;
      return stored !== '0';
    } catch { return isWide; }
  });
  const [geom, setGeom] = useState(loadGeometry);
  const [lines, setLines] = useState([]);
  const [error, setError] = useState(null);
  const [paused, setPaused] = useState(false);
  // Bumped on every successful poll so the user can see the panel is
  // alive even when no new log entries arrived (proof-server only
  // emits lines when a circuit fires; between rounds it's silent).
  const [lastTick, setLastTick] = useState(null);
  // Briefly turns true after each poll to flash the "● live" dot;
  // a tiny pulse reads as "I just checked" without being annoying.
  const [flashTick, setFlashTick] = useState(0);
  const intervalRef = useRef(null);
  // Tracks which lines we've already seen and what batch they arrived
  // in. Each *batch* of new lines (i.e. every poll that produced new
  // entries) gets a unique numeric id; consecutive batches alternate
  // colors in the UI so the viewer can see at a glance which lines
  // landed together and which arrived a moment later.
  const seenRef = useRef(new Map()); // key -> { arrivedAt, batchId }
  const batchCounterRef = useRef(0);
  // The scrollable container for log entries. We auto-scroll to the
  // top whenever a new batch lands, but only if the user is already
  // near the top — otherwise we respect their manual scroll position
  // (they're presumably reading something older and don't want to be
  // yanked).
  const logScrollRef = useRef(null);
  // Bumped whenever a new batch is added so the post-render effect
  // can decide whether to scroll. We don't put this inside `lines`
  // because the effect needs to fire AFTER lines have rendered, and
  // depending on `lines` directly would create an effect on every
  // poll (including no-op polls).
  const newBatchTickRef = useRef(0);
  // True only on the very first successful poll. The initial tail
  // can be dozens of historical lines — we don't want to mark all
  // of them as "new" because then nothing visually contrasts. After
  // the first batch we flip this off and subsequent polls highlight
  // only the genuinely new arrivals.
  const isFirstPollRef = useRef(true);
  // Live drag/resize state held in refs so mousemove handlers don't
  // trigger React re-renders on every pixel.
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  // Persist open state.
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_OPEN, open ? '1' : '0'); }
    catch { /* ignore */ }
  }, [open]);

  // Persist geometry (debounced via the standard React batched render).
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_GEO, JSON.stringify(geom)); }
    catch { /* ignore */ }
  }, [geom]);

  // Poll docker logs.
  useEffect(() => {
    if (!open || paused) return undefined;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`${ENDPOINT}?tail=${TAIL_DEFAULT}`);
        const text = await r.text();
        if (cancelled) return;
        if (!r.ok) { setError(text || `HTTP ${r.status}`); return; }
        setError(null);
        // Reverse so the *newest* line is at the top of the panel.
        // docker logs prints oldest-first; for a live feed humans
        // expect a stack-like ordering where new info pushes down.
        const parsed = text.split('\n').map(classifyLine).filter(Boolean);
        parsed.reverse();

        // Diff against what we've already seen so we can mark fresh
        // arrivals with an attention color. The set of keys that are
        // genuinely new in this poll forms a "batch" — all marked
        // with the same batchId, which the renderer translates into
        // an accent color that alternates by parity (even -> teal,
        // odd -> amber). The viewer sees a clear visual break every
        // time a new wave of log lines arrives.
        const seen = seenRef.current;
        const now = Date.now();
        const newKeys = [];
        for (const ln of parsed) {
          if (!seen.has(ln.key)) newKeys.push(ln.key);
        }
        if (isFirstPollRef.current) {
          // Seed the diff map without bumping the batch counter so
          // the initial 40 lines render in the calm/default style.
          // The next poll's new arrivals (if any) will be the first
          // batch that actually shows up colored.
          for (const k of newKeys) {
            seen.set(k, { arrivedAt: now, batchId: 0 });
          }
          isFirstPollRef.current = false;
        } else if (newKeys.length > 0) {
          batchCounterRef.current += 1;
          const batchId = batchCounterRef.current;
          for (const k of newKeys) {
            seen.set(k, { arrivedAt: now, batchId });
          }
          // Signal the scroll effect that a fresh batch just landed.
          newBatchTickRef.current += 1;
        }
        // Prune anything that's no longer in the visible tail so the
        // map can't grow unbounded over a long session.
        const visible = new Set(parsed.map((l) => l.key));
        for (const k of seen.keys()) {
          if (!visible.has(k)) seen.delete(k);
        }

        // Attach freshness metadata to each line so the renderer can
        // colour it. Lines we've never recorded (shouldn't happen
        // after the loop above, but be defensive) get batchId 0.
        const enriched = parsed.map((l) => {
          const meta = seen.get(l.key) || { arrivedAt: now, batchId: 0 };
          return {
            ...l,
            arrivedAt: meta.arrivedAt,
            batchId: meta.batchId,
            // Used by the renderer to pick a colour. We only highlight
            // the two most recent batches so the panel doesn't end up
            // a rainbow of stale colours after a long idle period.
            highlightBatch:
              meta.batchId === batchCounterRef.current ? 'current'
              : meta.batchId === batchCounterRef.current - 1 ? 'previous'
              : null,
          };
        });
        setLines(enriched);
        setLastTick(new Date());
        setFlashTick((n) => n + 1);

        // Auto-stick to the top of the log when a fresh batch landed
        // AND the user is already within 60px of the top. Reading the
        // ref imperatively here (after setLines schedules the next
        // render) is intentional: we want to evaluate the scroll
        // intent BEFORE React inserts the new rows, so "are they at
        // the top right now" is a question about the previous render.
        if (newKeys.length > 0 && !isFirstPollRef.current) {
          const el = logScrollRef.current;
          if (el && el.scrollTop <= 60) {
            // Defer to the next frame so the new rows are in the DOM
            // before we scroll, otherwise we'd be scrolling the
            // pre-update layout.
            requestAnimationFrame(() => {
              if (el) el.scrollTop = 0;
            });
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      }
    };
    tick();
    intervalRef.current = setInterval(tick, POLL_INTERVAL);
    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, paused]);

  // Re-clamp on viewport resize so the panel doesn't end up off-screen.
  useEffect(() => {
    const onResize = () => setGeom((g) => clampGeometry(g));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ----- Drag --------------------------------------------------------
  const onHeaderPointerDown = useCallback((e) => {
    // Don't initiate a drag from the inline buttons in the header.
    if (e.target.closest('[data-no-drag]')) return;
    // Pointer Capture means even if the cursor leaves the header
    // element, we still get pointermove until pointerup.
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: geom.x,
      startY: geom.y,
    };
  }, [geom.x, geom.y]);

  const onHeaderPointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.startMouseX;
    const dy = e.clientY - d.startMouseY;
    setGeom((g) => clampGeometry({ ...g, x: d.startX + dx, y: d.startY + dy }));
  }, []);

  const onHeaderPointerUp = useCallback((e) => {
    if (dragRef.current && dragRef.current.pointerId === e.pointerId) {
      dragRef.current = null;
      try { e.currentTarget.releasePointerCapture(e.pointerId); }
      catch { /* ignore */ }
    }
  }, []);

  // ----- Resize ------------------------------------------------------
  // One handler factory powers all four resize affordances:
  //   - bottom-right corner   → width AND height (diagonal)
  //   - right edge strip      → width only
  //   - bottom edge strip     → height only
  //   - left edge strip       → width AND x   (resize from the left)
  // `axis` controls which dimensions move. Pointer Capture means the
  // resize survives fast cursor movement, even off-element.
  const startResize = (axis) => (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = {
      pointerId: e.pointerId,
      axis,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: geom.x,
      startY: geom.y,
      startW: geom.w,
      startH: geom.h,
    };
  };

  const onResizePointerMove = useCallback((e) => {
    const r = resizeRef.current;
    if (!r || r.pointerId !== e.pointerId) return;
    const dx = e.clientX - r.startMouseX;
    const dy = e.clientY - r.startMouseY;
    setGeom((g) => {
      const next = { ...g };
      if (r.axis.includes('e')) next.w = r.startW + dx;            // east edge
      if (r.axis.includes('s')) next.h = r.startH + dy;            // south edge
      if (r.axis.includes('w')) {                                  // west edge
        next.w = r.startW - dx;
        next.x = r.startX + dx;
      }
      return clampGeometry(next);
    });
  }, []);

  const onResizePointerUp = useCallback((e) => {
    if (resizeRef.current && resizeRef.current.pointerId === e.pointerId) {
      resizeRef.current = null;
      try { e.currentTarget.releasePointerCapture(e.pointerId); }
      catch { /* ignore */ }
    }
  }, []);

  // Collapsed pill: a tiny tab on the right edge.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Show proof-server log"
        style={{
          position: 'fixed',
          right: 0,
          top: '40%',
          zIndex: 50,
          background: '#1a1530',
          color: '#bcb1ff',
          border: '1px solid #3b2e6a',
          borderRight: 'none',
          padding: '0.5rem 0.55rem',
          borderRadius: '8px 0 0 8px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.78rem',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          letterSpacing: '0.04em',
        }}
      >
        🔐 Proof Server
      </button>
    );
  }

  const isDragging  = !!dragRef.current;
  const isResizing  = !!resizeRef.current;

  return (
    <aside
      aria-label="Midnight proof-server log"
      style={{
        position: 'fixed',
        left: geom.x,
        top: geom.y,
        width: geom.w,
        height: geom.h,
        zIndex: 50,
        background: 'linear-gradient(180deg,#1a1530 0%,#120e26 100%)',
        color: '#e7e3ff',
        border: '1px solid #3b2e6a',
        borderRadius: 12,
        boxShadow: isDragging || isResizing
          ? '0 16px 36px rgba(0,0,0,0.55)'
          : '0 10px 28px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.78rem',
        userSelect: isDragging || isResizing ? 'none' : 'auto',
        // Hint to the browser that this element will be transformed/
        // moved often, so it gets its own compositor layer and the
        // gameboard underneath isn't repainted on every pixel.
        willChange: 'left, top, width, height',
      }}
    >
      <header
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onPointerCancel={onHeaderPointerUp}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.55rem 0.75rem',
          borderBottom: '1px solid #2c2253',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        title="Drag to move"
      >
        <span
          style={{
            background: '#bcb1ff',
            color: '#0a0a14',
            fontWeight: 700,
            padding: '0.1rem 0.5rem',
            borderRadius: 999,
            fontSize: '0.7rem',
            letterSpacing: '0.04em',
          }}
        >
          🔐 PROOF SERVER
        </span>
        <span
          // The 'flashTick' key forces a remount on every successful
          // poll, which re-triggers the brief brightness animation.
          key={flashTick}
          style={{
            color: paused ? '#ffb86b' : '#74e8a3',
            fontSize: '0.7rem',
            fontWeight: 600,
            animation: paused ? 'none' : 'pob-live-flash 0.6s ease-out',
          }}
        >
          {paused ? '⏸ paused' : '● live'}
        </span>
        <span
          data-no-drag
          style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}
        >
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            title={paused ? 'Resume polling' : 'Pause polling'}
            style={miniBtn}
          >
            {paused ? '▶' : '⏸'}
          </button>
          <button
            type="button"
            onClick={() => setGeom(defaultGeometry())}
            title="Reset position and size"
            style={miniBtn}
          >
            ⤺
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            title="Hide panel"
            style={miniBtn}
          >
            ×
          </button>
        </span>
      </header>

      <div
        ref={logScrollRef}
        style={{
          flex: 1,
          minHeight: 0,            // critical for nested flex children
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0.5rem 0.6rem',
          fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
          fontSize: '0.72rem',
          lineHeight: 1.45,
          scrollBehavior: 'smooth', // nicer auto-stick behaviour
        }}
      >
        {error && (
          <div style={{ color: '#ffb1b1', whiteSpace: 'pre-wrap' }}>
            ⚠ {error}
          </div>
        )}
        {!error && lines.length === 0 && (
          <div style={{ color: '#a89cd6', fontStyle: 'italic' }}>
            Waiting for proof-server activity… Trigger a circuit call
            (createMatch / playCards / resolveChallenge) to see ZK
            proofs being generated here.
          </div>
        )}
        {lines.map((ln, i) => {
          // Highlight styling for fresh batches. The most recent
          // batch (highlightBatch === 'current') gets the brighter
          // tint; the prior batch gets a calmer tint of the *other*
          // alternating colour so adjacent batches always contrast.
          // After two more polls a line falls out of both windows
          // and renders in the default style.
          const accent = batchAccent(ln.batchId);
          const isCurrent = ln.highlightBatch === 'current';
          const isPrevious = ln.highlightBatch === 'previous';
          const highlightBg = isCurrent
            ? accent.bgStrong
            : isPrevious
              ? accent.bgSoft
              : 'transparent';
          const highlightBorder = (isCurrent || isPrevious)
            ? `3px solid ${accent.bar}`
            : '3px solid transparent';
          return (
          <div
            key={ln.key || i}
            // Re-mounting on the current batch (via the arrivedAt
            // key) re-fires the slide-in animation so freshly
            // arrived lines visibly enter from the top of the list.
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr',
              columnGap: 6,
              padding: '2px 4px',
              borderTop: i === 0 ? 'none' : '1px dashed #261d4a',
              borderLeft: highlightBorder,
              background: highlightBg,
              color: kindColor(ln.kind),
              transition: 'background 0.6s ease, border-left-color 0.6s ease',
              animation: isCurrent ? 'pob-line-arrive 0.45s ease-out' : 'none',
            }}
          >
            <span style={{ color: '#7a6db5', fontVariantNumeric: 'tabular-nums' }}>
              {ln.ts || ''}
            </span>
            <span style={{ wordBreak: 'break-word' }}>
              {ln.kind === 'request' && ln.timing && (
                <span style={pillStyle('#5cd0ff', '#0a0a14')}>
                  {ln.timing}
                </span>
              )}
              {ln.kind === 'ok' && <span style={pillStyle('#74e8a3', '#0a0a14')}>OK</span>}
              {ln.kind === 'proof' && <span style={pillStyle('#bcb1ff', '#0a0a14')}>PROOF</span>}
              {ln.kind === 'error' && <span style={pillStyle('#ff8a8a', '#0a0a14')}>ERR</span>}
              {ln.kind === 'warn' && <span style={pillStyle('#ffb86b', '#0a0a14')}>WARN</span>}
              {ln.body}
            </span>
          </div>
          );
        })}
      </div>

      <footer
        style={{
          padding: '0.4rem 0.75rem',
          borderTop: '1px solid #2c2253',
          color: '#a89cd6',
          fontSize: '0.7rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>
          {lines.length} line{lines.length === 1 ? '' : 's'} • newest first
        </span>
        <span>
          {lastTick
            ? `last poll ${lastTick.toLocaleTimeString([], { hour12: false })}`
            : `polls every ${POLL_INTERVAL / 1000}s`}
        </span>
      </footer>

      {/* Resize affordances: four handles total. Pointer Capture is
          set inside startResize() so a fast drag survives the cursor
          leaving the handle. */}
      {/* Right edge: width only. */}
      <div
        onPointerDown={startResize('e')}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        title="Drag to resize width"
        style={edgeHandleStyle.right}
      />
      {/* Left edge: width + x (panel grows leftward). */}
      <div
        onPointerDown={startResize('w')}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        title="Drag to resize width"
        style={edgeHandleStyle.left}
      />
      {/* Bottom edge: height only. */}
      <div
        onPointerDown={startResize('s')}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        title="Drag to resize height"
        style={edgeHandleStyle.bottom}
      />
      {/* Bottom-right corner: both axes (diagonal resize). Bigger
          and brighter than the v1 grip so it reads at a glance. */}
      <div
        onPointerDown={startResize('se')}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        title="Drag to resize width and height"
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 22,
          height: 22,
          cursor: 'nwse-resize',
          touchAction: 'none',
          background:
            'linear-gradient(135deg, transparent 0 8px, #bcb1ff 8px 11px, transparent 11px 14px, #bcb1ff 14px 17px, transparent 17px)',
          borderBottomRightRadius: 12,
          opacity: 0.9,
        }}
      />
    </aside>
  );
}

// Invisible 6-px hit-strips along three edges. Cursor changes give
// the visual hint; transparent fill keeps the panel design clean.
// The bottom-right corner grip (rendered separately above) overlaps
// the right and bottom strips, so the corner gets priority for the
// last 22px of each edge — that's why these stop short of the corner.
const edgeHandleStyle = {
  right: {
    position: 'absolute',
    right: -3,
    top: 4,
    bottom: 22,
    width: 8,
    cursor: 'ew-resize',
    touchAction: 'none',
  },
  left: {
    position: 'absolute',
    left: -3,
    top: 4,
    bottom: 4,
    width: 8,
    cursor: 'ew-resize',
    touchAction: 'none',
  },
  bottom: {
    position: 'absolute',
    bottom: -3,
    left: 4,
    right: 22,
    height: 8,
    cursor: 'ns-resize',
    touchAction: 'none',
  },
};

const miniBtn = {
  background: 'transparent',
  color: '#bcb1ff',
  border: '1px solid #3b2e6a',
  padding: '0.1rem 0.4rem',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '0.75rem',
  lineHeight: 1,
};

function pillStyle(bg, fg) {
  return {
    background: bg,
    color: fg,
    fontWeight: 700,
    padding: '0 0.35rem',
    borderRadius: 999,
    fontSize: '0.65rem',
    marginRight: 4,
    letterSpacing: '0.03em',
  };
}

// Two-tone accent palette for fresh-arrival highlighting. Batches
// alternate between these two colours by parity of the batchId, so
// each new wave of log lines visibly contrasts with the wave that
// came before it. `bgStrong` is for the most recent batch, `bgSoft`
// is for the previous batch (same hue, lower opacity), and `bar` is
// the left-border accent rail.
function batchAccent(batchId) {
  const teal  = { bar: '#5cd0ff', bgStrong: 'rgba(92,208,255,0.18)', bgSoft: 'rgba(92,208,255,0.07)' };
  const amber = { bar: '#ffb86b', bgStrong: 'rgba(255,184,107,0.18)', bgSoft: 'rgba(255,184,107,0.07)' };
  return (batchId % 2 === 0) ? teal : amber;
}

function kindColor(kind) {
  switch (kind) {
    case 'ok':      return '#c6f5d8';
    case 'proof':   return '#dcd4ff';
    case 'request': return '#cdebff';
    case 'error':   return '#ffd0d0';
    case 'warn':    return '#ffe1bf';
    default:        return '#cfc8ee';
  }
}
