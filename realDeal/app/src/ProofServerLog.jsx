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

function classifyLine(line) {
  if (!line) return null;
  const text = line.trim();
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

  return { ts, kind, body, timing };
}

export default function ProofServerLog() {
  const [open, setOpen] = useState(() => {
    try { return window.localStorage.getItem(STORAGE_OPEN) !== '0'; }
    catch { return true; }
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
        setLines(parsed);
        setLastTick(new Date());
        setFlashTick((n) => n + 1);
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
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 0.6rem',
          fontFamily: 'JetBrains Mono, Menlo, Consolas, monospace',
          fontSize: '0.72rem',
          lineHeight: 1.45,
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
        {lines.map((ln, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr',
              columnGap: 6,
              padding: '2px 0',
              borderTop: i === 0 ? 'none' : '1px dashed #261d4a',
              color: kindColor(ln.kind),
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
        ))}
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
