#!/usr/bin/env bash
# =============================================================================
#  StudioDesk — Immich Auto-Setup Script
#  Runs on any machine with Docker + bash (Mac, Linux, Windows/WSL/Git Bash)
#  Usage: bash setup.sh [--update-backend-env]
#
#  What it does:
#    1. Writes .env for docker-compose
#    2. Pulls + starts all Immich containers
#    3. Waits for server to be healthy
#    4. Creates admin account (first-run only)
#    5. Creates a StudioDesk API key
#    6. Prints the values to paste into backend .env
#       (or auto-updates if --update-backend-env is passed)
# =============================================================================

set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[immich-setup]${RESET} $*"; }
ok()   { echo -e "${GREEN}[immich-setup]${RESET} $*"; }
warn() { echo -e "${YELLOW}[immich-setup]${RESET} $*"; }
die()  { echo -e "${RED}[immich-setup] ERROR:${RESET} $*" >&2; exit 1; }

# ── Config (override via env vars before running) ─────────────────────────────
IMMICH_HOST="${IMMICH_HOST:-localhost}"
IMMICH_PORT="${IMMICH_PORT:-2283}"
IMMICH_URL="http://${IMMICH_HOST}:${IMMICH_PORT}"

ADMIN_EMAIL="${ADMIN_EMAIL:-admin@studiodesk.local}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@StudioDesk1}"
ADMIN_NAME="${ADMIN_NAME:-StudioDesk Admin}"

DB_USERNAME="${DB_USERNAME:-immich}"
DB_PASSWORD="${DB_PASSWORD:-immich_local_pass}"
DB_DATABASE_NAME="${DB_DATABASE_NAME:-immich}"

APIKEY_NAME="studiodesk-server"
UPDATE_BACKEND_ENV=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# ── Parse flags ───────────────────────────────────────────────────────────────
for arg in "$@"; do
  [[ "$arg" == "--update-backend-env" ]] && UPDATE_BACKEND_ENV=true
done

# ── Prerequisites check ───────────────────────────────────────────────────────
log "Checking prerequisites…"
command -v docker  >/dev/null 2>&1 || die "Docker not found. Install Docker Desktop first."
command -v curl    >/dev/null 2>&1 || die "curl not found."

# docker compose (v2) or docker-compose (v1)
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  die "docker compose not found. Update Docker Desktop."
fi
ok "Docker ${COMPOSE} found."

# ── Write docker-compose .env ─────────────────────────────────────────────────
log "Writing docker-compose .env…"
cat > "${SCRIPT_DIR}/.env" <<EOF
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE_NAME=${DB_DATABASE_NAME}
REDIS_HOSTNAME=redis
IMMICH_VERSION=release
EOF
ok ".env written."

# ── Pull + start containers ───────────────────────────────────────────────────
log "Starting Immich containers (this may take a few minutes on first run)…"
cd "${SCRIPT_DIR}"
${COMPOSE} pull --quiet
# Remove any orphaned containers from previous runs before starting
${COMPOSE} down --remove-orphans 2>/dev/null || true
${COMPOSE} up -d
ok "Containers started."

# ── Wait for server to be healthy ─────────────────────────────────────────────
log "Waiting for Immich server to be ready at ${IMMICH_URL}…"
MAX_WAIT=120
ELAPSED=0
until curl -sf "${IMMICH_URL}/api/server/ping" >/dev/null 2>&1; do
  if [[ $ELAPSED -ge $MAX_WAIT ]]; then
    die "Immich did not become healthy within ${MAX_WAIT}s. Check: docker compose logs immich-server"
  fi
  echo -n "."
  sleep 3
  ELAPSED=$((ELAPSED + 3))
done
echo ""
ok "Immich server is up."

# ── Admin signup via DB (works on all Immich v2.x versions) ───────────────────
log "Checking if admin account needs to be created…"

EXISTING=$(${COMPOSE} exec -T database psql -U "${DB_USERNAME}" -d "${DB_DATABASE_NAME}" -tAc \
  "SELECT email FROM \"user\" WHERE email='${ADMIN_EMAIL}' LIMIT 1;" 2>/dev/null | tr -d '[:space:]')

if [[ "${EXISTING}" == "${ADMIN_EMAIL}" ]]; then
  warn "Admin account already exists — skipping creation."
else
  # Generate bcrypt hash inside the immich-server container (bcrypt is bundled)
  PW_HASH=$(${COMPOSE} exec -T immich-server \
    node -e "const b=require('/usr/src/app/server/node_modules/bcrypt');b.hash('${ADMIN_PASSWORD}',10,(e,h)=>process.stdout.write(h))" \
    2>/dev/null)
  [[ -z "${PW_HASH}" ]] && die "Failed to generate password hash."

  ${COMPOSE} exec -T database psql -U "${DB_USERNAME}" -d "${DB_DATABASE_NAME}" -c \
    "INSERT INTO \"user\" (email, password, name, \"isAdmin\", \"shouldChangePassword\", status)
     VALUES ('${ADMIN_EMAIL}', '${PW_HASH}', '${ADMIN_NAME}', true, false, 'active')
     ON CONFLICT (email) DO NOTHING;" >/dev/null

  ok "Admin account created: ${ADMIN_EMAIL}"
fi

# ── Login + get access token ───────────────────────────────────────────────────
log "Logging in as admin…"
LOGIN_RESP=$(curl -sf -X POST "${IMMICH_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  2>&1) || die "Login failed. Check admin credentials.\nResponse: ${LOGIN_RESP}"

ACCESS_TOKEN=$(echo "${LOGIN_RESP}" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
[[ -z "${ACCESS_TOKEN}" ]] && die "Could not extract accessToken from login response:\n${LOGIN_RESP}"
ok "Logged in."

# ── Create (or reuse) API key ─────────────────────────────────────────────────
log "Creating API key '${APIKEY_NAME}'…"
KEY_RESP=$(curl -sf -X POST "${IMMICH_URL}/api/api-keys" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d "{\"name\":\"${APIKEY_NAME}\",\"permissions\":[\"all\"]}" \
  2>&1) || die "Failed to create API key.\nResponse: ${KEY_RESP}"

API_KEY=$(echo "${KEY_RESP}" | grep -o '"secret":"[^"]*"' | cut -d'"' -f4)
[[ -z "${API_KEY}" ]] && die "Could not extract API key from response:\n${KEY_RESP}"
ok "API key created."

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  Immich is running!${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  Dashboard : ${CYAN}${IMMICH_URL}${RESET}"
echo -e "  Admin     : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}"
echo ""
echo -e "${BOLD}  Add these to your backend .env:${RESET}"
echo ""
echo -e "  ${YELLOW}IMMICH_BASE_URL=${IMMICH_URL}${RESET}"
echo -e "  ${YELLOW}IMMICH_API_KEY=${API_KEY}${RESET}"
echo ""

# ── Auto-update backend .env files ────────────────────────────────────────────
if [[ "${UPDATE_BACKEND_ENV}" == "true" ]]; then
  log "Auto-updating backend .env files…"

  ENV_FILES=(
    "${PROJECT_ROOT}/backend/studiodesk/.env"
    "${PROJECT_ROOT}/backend/studiodesk/.env.local"
    "${PROJECT_ROOT}/backend/.env.local"
  )

  for ENV_FILE in "${ENV_FILES[@]}"; do
    if [[ ! -f "${ENV_FILE}" ]]; then
      warn "Skipping (not found): ${ENV_FILE}"
      continue
    fi

    # Comment out old values
    sed -i.bak \
      -e 's|^IMMICH_BASE_URL=|# IMMICH_BASE_URL=|g' \
      -e 's|^IMMICH_API_KEY=|# IMMICH_API_KEY=|g' \
      "${ENV_FILE}"

    # Append new values
    echo "" >> "${ENV_FILE}"
    echo "IMMICH_BASE_URL=${IMMICH_URL}" >> "${ENV_FILE}"
    echo "IMMICH_API_KEY=${API_KEY}" >> "${ENV_FILE}"

    ok "Updated: ${ENV_FILE}"
  done

  ok "All backend .env files updated. Restart the Next.js server to pick up changes."
else
  log "Tip: run with --update-backend-env to auto-update all backend .env files."
fi

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${GREEN}Setup complete.${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
