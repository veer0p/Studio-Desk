#!/usr/bin/env bash
# check-ai-docs.sh — CI check: verifies .ai.md timestamps are not stale relative to source files
# Usage: scripts/check-ai-docs.sh [backend|frontend|all]
# Exit 0 = all .ai.md files are fresh, Exit 1 = stale files found
#
# A .ai.md file is considered "stale" if any .ts/.tsx file in the same folder
# has a modification time newer than the .ai.md file.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXIT_CODE=0

# Find all .ai.md files
AI_FILES=$(find "$ROOT" -name '.ai.md' -type f 2>/dev/null)

if [ -z "$AI_FILES" ]; then
  echo "No .ai.md files found."
  exit 1
fi

STALE_FILES=()

for ai_file in $AI_FILES; do
  dir=$(dirname "$ai_file")

  # Find all .ts/.tsx files in this directory (not recursive)
  source_files=$(find "$dir" -maxdepth 1 -type f \( -name '*.ts' -o -name '*.tsx' \) 2>/dev/null)

  if [ -z "$source_files" ]; then
    continue
  fi

  ai_mtime=$(stat -c %Y "$ai_file" 2>/dev/null || stat -f %m "$ai_file" 2>/dev/null)

  for src_file in $source_files; do
    src_mtime=$(stat -c %Y "$src_file" 2>/dev/null || stat -f %m "$src_file" 2>/dev/null)

    if [ "$src_mtime" -gt "$ai_mtime" ]; then
      # Calculate how old the .ai.md is relative to the source
      diff=$((src_mtime - ai_mtime))
      minutes=$((diff / 60))
      STALE_FILES+=("$ai_file (source $(basename "$src_file") is ${minutes}m newer)")
      break
    fi
  done
done

if [ ${#STALE_FILES[@]} -gt 0 ]; then
  echo "❌ Stale .ai.md files detected:"
  for entry in "${STALE_FILES[@]}"; do
    echo "  - $entry"
  done
  echo ""
  echo "Run: scripts/update-ai-docs.sh to regenerate."
  EXIT_CODE=1
else
  echo "✅ All .ai.md files are up to date."
  EXIT_CODE=0
fi

exit $EXIT_CODE
