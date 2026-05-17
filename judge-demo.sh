#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Proof or Bluff — one-command demo launcher for judges
# ─────────────────────────────────────────────────────────────────────
#
# What this script does, in order:
#   1. Checks Docker is installed and running
#   2. Verifies the midnight-local-dev folder exists at the expected
#      sibling path, with a friendly error if it doesn't
#   3. Brings up the local Midnight stack (node + indexer +
#      proof-server) and waits up to 60 seconds for it to go healthy
#   4. Runs the four health endpoints we promise in the docs
#   5. Installs the realDeal/app dependencies if node_modules is missing
#   6. Starts the Vite dev server on port 3016
#   7. Tries to open http://localhost:3016 in the default browser
#
# Stop the demo with Ctrl+C (Vite stops). The local Midnight stack
# stays up so you can hit it again without the warm-up wait. Run
#   docker compose -f $LOCAL_DEV/standalone.yml down
# when you're completely done.
#
# Designed to be run from the repo root:
#   ./judge-demo.sh
# ─────────────────────────────────────────────────────────────────────

set -e

# Pretty output helpers — emoji + color so judges can see at a glance
# which step succeeded.
RED=$'\033[1;31m'
GREEN=$'\033[1;32m'
YELLOW=$'\033[1;33m'
CYAN=$'\033[1;36m'
RESET=$'\033[0m'

step()  { echo -e "${CYAN}▸${RESET} $1"; }
ok()    { echo -e "  ${GREEN}✓${RESET} $1"; }
warn()  { echo -e "  ${YELLOW}!${RESET} $1"; }
fail()  { echo -e "  ${RED}✗${RESET} $1"; exit 1; }

# ─────────────────────────────────────────────────────────────────────
# Resolve paths
# ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/realDeal/app"

# midnight-local-dev is the official local stack. We expect it to live
# next to this repo or one level up; check both common spots.
LOCAL_DEV=""
for candidate in \
  "/home/js/utils_Midnight/midnight-local-dev" \
  "$SCRIPT_DIR/../midnight-local-dev" \
  "$SCRIPT_DIR/../utils_Midnight/midnight-local-dev"
do
  if [ -f "$candidate/standalone.yml" ]; then
    LOCAL_DEV="$candidate"
    break
  fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Proof or Bluff — Judge Demo Launcher                     ║"
echo "║   Local Midnight stack + browser app, one command          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ─────────────────────────────────────────────────────────────────────
# Step 1: Docker check
# ─────────────────────────────────────────────────────────────────────
step "[1/5] Checking Docker is available"
if ! command -v docker >/dev/null 2>&1; then
  fail "Docker is not installed. Install Docker Desktop or Docker Engine first."
fi
if ! docker info >/dev/null 2>&1; then
  fail "Docker is installed but the daemon isn't running. Start Docker, then re-run this script."
fi
ok "Docker is installed and running"

# ─────────────────────────────────────────────────────────────────────
# Step 2: Local-dev folder check
# ─────────────────────────────────────────────────────────────────────
step "[2/5] Locating midnight-local-dev"
if [ -z "$LOCAL_DEV" ]; then
  echo ""
  echo "Could not find midnight-local-dev. Please clone it next to this repo:"
  echo "  git clone https://github.com/midnightntwrk/midnight-local-dev.git ../midnight-local-dev"
  fail "midnight-local-dev not found"
fi
ok "Found at: $LOCAL_DEV"

# ─────────────────────────────────────────────────────────────────────
# Step 3: Bring up the stack
# ─────────────────────────────────────────────────────────────────────
step "[3/5] Starting local Midnight stack (node + indexer + proof-server)"
T0=$(date +%s)

# If the stack is already up and healthy, skip the warm-up.
HEALTHY=$(docker ps --filter name=midnight --format "{{.Status}}" | grep -c healthy || true)
TOTAL=$(docker ps --filter name=midnight -q | wc -l)
if [ "$HEALTHY" -ge 2 ] && [ "$TOTAL" -eq 3 ]; then
  ok "Stack is already up — skipping warm-up"
else
  docker compose -f "$LOCAL_DEV/standalone.yml" up -d >/dev/null 2>&1 || fail "docker compose failed (run it manually to see the error: docker compose -f $LOCAL_DEV/standalone.yml up -d)"

  echo -n "  waiting for healthy"
  for i in $(seq 1 30); do
    sleep 2
    H=$(docker ps --filter name=midnight --format "{{.Status}}" | grep -c healthy || true)
    T=$(docker ps --filter name=midnight -q | wc -l)
    if [ "$H" -ge 2 ] && [ "$T" -eq 3 ]; then
      T1=$(date +%s)
      echo " — ready in $((T1-T0))s"
      break
    fi
    echo -n "."
  done

  H=$(docker ps --filter name=midnight --format "{{.Status}}" | grep -c healthy || true)
  if [ "$H" -lt 2 ]; then
    echo ""
    warn "Stack didn't go fully healthy in 60s. Container status:"
    docker ps --filter name=midnight --format "    {{.Names}}: {{.Status}}"
    echo "  Continuing anyway — the app will retry connections as services come up."
  fi
fi

# ─────────────────────────────────────────────────────────────────────
# Step 4: Smoke-test the endpoints
# ─────────────────────────────────────────────────────────────────────
step "[4/5] Smoke-testing the endpoints"

probe_post() {
  local label=$1 url=$2 body=$3
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 4 -X POST -H "Content-Type: application/json" -d "$body" "$url" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then ok "$label  (HTTP $code)"; else warn "$label  (HTTP $code)"; fi
}
probe_get() {
  local label=$1 url=$2
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 4 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then ok "$label  (HTTP $code)"; else warn "$label  (HTTP $code)"; fi
}

probe_post "node          (9944 JSON-RPC)" "http://localhost:9944/" '{"jsonrpc":"2.0","id":1,"method":"system_health","params":[]}'
probe_get  "node /health  (9944)         " "http://localhost:9944/health"
probe_get  "proof-server  (6300 /health) " "http://localhost:6300/health"
INDEXER_HEALTH=$(docker inspect --format '{{.State.Health.Status}}' midnight-indexer 2>/dev/null || echo "unknown")
if [ "$INDEXER_HEALTH" = "healthy" ]; then ok "indexer       (8088 internal)  ($INDEXER_HEALTH)"; else warn "indexer       (8088 internal)  ($INDEXER_HEALTH)"; fi

# ─────────────────────────────────────────────────────────────────────
# Step 5: Start the browser app
# ─────────────────────────────────────────────────────────────────────
step "[5/5] Starting the realDeal browser app"
if [ ! -d "$APP_DIR" ]; then fail "realDeal/app folder not found at $APP_DIR"; fi
if [ ! -d "$APP_DIR/node_modules" ]; then
  warn "node_modules missing — installing now (this takes ~1-2 minutes the first time)"
  ( cd "$APP_DIR" && npm install ) || fail "npm install failed in $APP_DIR"
  ok "Dependencies installed"
fi

# Open the browser. Detection is layered so WSL gets priority handling
# (WSL is where most demo machines actually live — `xdg-open` would
# silently fail in a headless WSL session, masking the open).
#
# Override:
#   POB_NO_OPEN=1 ./judge-demo.sh   ← skip auto-open
#   POB_OPEN_CMD='/path/to/browser' ./judge-demo.sh   ← force a specific opener
#
# Order:
#   1. POB_OPEN_CMD (explicit override)
#   2. wslview                              (cleanest on WSL when installed)
#   3. /mnt/c/Windows/explorer.exe          (WSL fallback, always present)
#   4. cmd.exe /c start                     (WSL fallback #2)
#   5. xdg-open                             (Linux desktops)
#   6. open                                 (macOS)
#   7. explorer.exe                         (native Windows / Git Bash)
URL="http://localhost:3016/"
open_browser() {
  if [ "${POB_NO_OPEN:-0}" = "1" ]; then
    warn "POB_NO_OPEN=1 — skipping auto-open. Visit $URL when ready."
    return
  fi
  local tried=""
  if [ -n "${POB_OPEN_CMD:-}" ]; then
    $POB_OPEN_CMD "$URL" >/dev/null 2>&1 && return
    tried="POB_OPEN_CMD"
  fi
  # WSL detection: $WSL_DISTRO_NAME is set on every modern WSL2 distro,
  # and /proc/version contains 'microsoft' on the rest.
  if [ -n "${WSL_DISTRO_NAME:-}" ] || grep -qi microsoft /proc/version 2>/dev/null; then
    # Prefer a *real* full browser window with a new window so we get
    # a fresh, resizable frame. The previous strategy used Windows'
    # default URL handler via explorer.exe, which on some setups
    # routes through a "PWA / app mode" Chromium window that the
    # user can't resize. --new-window forces a normal tabbed window.
    #
    # The order here looks at full installed paths first so we never
    # land in an app-mode shell:
    local chrome_paths=(
      "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
      "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
      "/mnt/c/Users/${USER}/AppData/Local/Google/Chrome/Application/chrome.exe"
    )
    for chrome in "${chrome_paths[@]}"; do
      if [ -x "$chrome" ]; then
        # Background + disown so Chrome keeps running after the
        # script exits (Vite is the foreground process).
        "$chrome" --new-window "$URL" >/dev/null 2>&1 &
        disown 2>/dev/null || true
        return
      fi
    done
    # Edge as a Chromium fallback if Chrome isn't installed — same
    # --new-window flag, since msedge.exe is just Chromium under the hood.
    local edge_paths=(
      "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
      "/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe"
    )
    for edge in "${edge_paths[@]}"; do
      if [ -x "$edge" ]; then
        "$edge" --new-window "$URL" >/dev/null 2>&1 &
        disown 2>/dev/null || true
        return
      fi
    done
    # Last-resort WSL fallbacks (these may end up in an app-mode shell,
    # but at least the demo URL gets to the user).
    command -v wslview >/dev/null 2>&1 && wslview "$URL" >/dev/null 2>&1 && return
    command -v cmd.exe >/dev/null 2>&1 && cmd.exe /c start "" "$URL" >/dev/null 2>&1 && return
    [ -x /mnt/c/Windows/explorer.exe ] && /mnt/c/Windows/explorer.exe "$URL" >/dev/null 2>&1 && return
    tried="$tried wsl-stack"
  fi
  command -v xdg-open     >/dev/null 2>&1 && xdg-open     "$URL" >/dev/null 2>&1 && return
  command -v open         >/dev/null 2>&1 && open         "$URL" >/dev/null 2>&1 && return
  command -v explorer.exe >/dev/null 2>&1 && explorer.exe "$URL" >/dev/null 2>&1 && return
  warn "Couldn't auto-open a browser (tried: $tried). Visit $URL manually."
}
# Fire the open in the background after Vite has had a moment to bind.
( sleep 4 && open_browser ) &

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Demo is starting!                                        ║"
echo "║                                                            ║"
echo "║   Open in browser:  http://localhost:3016/                 ║"
echo "║   Stop with:        Ctrl+C  (stops the app only)           ║"
echo "║                                                            ║"
echo "║   Local stack stays up between runs. To stop it entirely:  ║"
echo "║     docker compose -f \$LOCAL_DEV/standalone.yml down       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "$APP_DIR"
exec npx vite --port 3016 --host
