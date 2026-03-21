#!/usr/bin/env bash
# Run this from your laptop: SSHs to the VPS, diagnoses Supabase, and restarts it.
# Uses VPS_IP from .env.local; you will be prompted for SSH password unless you use keys.
#
# Usage:
#   cd studiodesk && bash scripts/vps-supabase-restart.sh
# Or with password (avoid in shared envs): VPS_PASSWORD=xxx bash scripts/vps-supabase-restart.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_DIR/.env.local"

# Load VPS_IP (and optional VPS_PASSWORD) from .env.local
if [ -f "$ENV_FILE" ]; then
  export $(grep -E '^VPS_IP=' "$ENV_FILE" | xargs)
  if [ -z "${VPS_PASSWORD:-}" ]; then
    export $(grep -E '^VPS_PASSWORD=' "$ENV_FILE" | xargs 2>/dev/null) || true
  fi
fi

VPS_IP="${VPS_IP:-}"
SSH_USER="${SSH_USER:-root}"

if [ -z "$VPS_IP" ]; then
  echo "Error: VPS_IP not set. Add VPS_IP=your.vps.ip to .env.local or set it in the environment."
  exit 1
fi

echo "=== Connecting to $SSH_USER@$VPS_IP ==="
echo ""

# Commands to run on the VPS: diagnose + restart Supabase
REMOTE_SCRIPT='
set -e
echo "--- 1. Docker containers (Supabase stack) ---"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true

echo ""
echo "--- 2. Restarting Supabase (common project names) ---"
for name in supabase supabase-db supabase_kong supabase_rest; do
  if docker ps -a --format "{{.Names}}" | grep -q "^${name}"; then
    echo "Restarting $name..."
    docker restart "$name" 2>/dev/null || true
  fi
done
# If using docker-compose in a supabase directory
if [ -d /opt/supabase ] || [ -d ~/supabase ]; then
  SUPABASE_DIR=/opt/supabase
  [ -d ~/supabase ] && SUPABASE_DIR=~/supabase
  if [ -f "$SUPABASE_DIR/docker-compose.yml" ] || [ -f "$SUPABASE_DIR/docker-compose.yaml" ]; then
    echo "Restarting via docker-compose in $SUPABASE_DIR..."
    (cd "$SUPABASE_DIR" && docker compose restart 2>/dev/null) || (cd "$SUPABASE_DIR" && docker-compose restart 2>/dev/null) || true
  fi
fi

echo ""
echo "--- 3. Listening on 443 and 54321 ---"
ss -tlnp 2>/dev/null | grep -E ":(443|54321)\s" || true

echo ""
echo "--- 4. Quick health check (Kong local) ---"
curl -sS -o /dev/null -w "Kong (54321): HTTP %{http_code}\n" --connect-timeout 3 http://127.0.0.1:54321/ 2>/dev/null || echo "Kong not responding on 54321"
curl -sS -o /dev/null -w "HTTPS (443): HTTP %{http_code}\n" --connect-timeout 3 https://127.0.0.1:443/ -k 2>/dev/null || echo "Nothing on 443 locally"
echo ""
echo "--- Done ---"
'

# Run over SSH (password from env or prompt)
if [ -n "${VPS_PASSWORD:-}" ] && command -v sshpass &>/dev/null; then
  sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 "$SSH_USER@$VPS_IP" "$REMOTE_SCRIPT"
else
  ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 "$SSH_USER@$VPS_IP" "$REMOTE_SCRIPT"
fi

echo ""
echo "If Supabase is behind Nginx/Caddy, restart that too on the VPS:"
echo "  sudo systemctl restart nginx   # or: sudo systemctl restart caddy"
