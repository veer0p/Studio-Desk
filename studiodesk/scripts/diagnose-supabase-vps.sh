#!/usr/bin/env bash
# Run this ON your VPS (and optionally from your laptop) to find why Supabase isn't reachable.
# Usage: bash scripts/diagnose-supabase-vps.sh

set -e
HOST="${1:-db.veer-vps.duckdns.org}"
echo "=== Supabase connectivity diagnostic for $HOST ==="
echo ""

echo "1. DNS resolution"
if command -v nslookup &>/dev/null; then
  nslookup "$HOST" || true
elif command -v dig &>/dev/null; then
  dig +short "$HOST" || true
fi
echo ""

echo "2. Can we reach port 443 from this machine?"
if command -v nc &>/dev/null; then
  nc -zv "$HOST" 443 2>&1 || echo "nc failed"
elif command -v timeout &>/dev/null; then
  timeout 5 bash -c "echo | openssl s_client -connect $HOST:443 -servername $HOST 2>/dev/null" && echo "Port 443 OK" || echo "Port 443 failed"
else
  curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://$HOST/" 2>&1 || echo "curl failed"
fi
echo ""

echo "3. HTTPS response from Supabase URL"
curl -sS -o /dev/null -w "HTTP %{http_code} (connect: %{time_connect}s)\n" --connect-timeout 10 "https://$HOST/" 2>&1 || echo "curl request failed"
echo ""

echo "4. Supabase REST health (if Kong is up)"
curl -sS -w "\nHTTP %{http_code}\n" --connect-timeout 10 -H "apikey: test" "https://$HOST/rest/v1/" 2>&1 | tail -5
echo ""

echo "5. Is Supabase stack running on THIS machine? (Docker)"
if command -v docker &>/dev/null; then
  docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | head -20
  echo ""
  docker ps -a --filter "name=supabase" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
else
  echo "Docker not found; skip if Supabase runs elsewhere."
fi
echo ""

echo "6. Listening ports (443, 54321, 8000)"
if command -v ss &>/dev/null; then
  ss -tlnp | grep -E ':(443|54321|8000)\s' || true
elif command -v netstat &>/dev/null; then
  netstat -tlnp 2>/dev/null | grep -E ':(443|54321|8000)' || true
fi
echo ""

echo "7. If using Nginx/Caddy as reverse proxy"
if [ -d /etc/nginx ]; then
  echo "Nginx configs mentioning $HOST or supabase:"
  grep -r -l "supabase\|$HOST" /etc/nginx/ 2>/dev/null || true
fi
if [ -d /etc/caddy ]; then
  echo "Caddy configs:"
  ls -la /etc/caddy/ 2>/dev/null || true
fi
echo ""

echo "=== Done. Check: DNS, firewall (ufw/iptables), Docker containers, reverse proxy, and SSL. ==="
