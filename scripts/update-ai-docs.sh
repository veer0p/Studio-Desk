#!/usr/bin/env bash
# update-ai-docs.sh — Scans for changed .ts/.tsx files and flags affected .ai.md for regeneration.
# Usage: scripts/update-ai-docs.sh [since-git-commit|full]
#
# Modes:
#   since-git-commit  — Check only files changed since last git commit (default)
#   full              — Scan all source files and list all affected .ai.md files
#
# This script DOES NOT regenerate .ai.md files (that requires AI/LLM context).
# It outputs a list of .ai.md files that need updating, one per line.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-since-git-commit}"

AFFECTED_DIRS=()

if [ "$MODE" = "since-git-commit" ]; then
  # Get changed .ts/.tsx files since last commit
  CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' || true)

  if [ -z "$CHANGED_FILES" ]; then
    echo "No source files changed since last commit."
    exit 0
  fi

  for file in $CHANGED_FILES; do
    abs_file="$ROOT/$file"
    dir=$(dirname "$abs_file")

    # Check if this directory (or a parent) has a .ai.md file
    check_dir="$dir"
    while [ "$check_dir" != "$ROOT" ] && [ "$check_dir" != "/" ]; do
      if [ -f "$check_dir/.ai.md" ]; then
        AFFECTED_DIRS+=("$check_dir/.ai.md")
        break
      fi
      check_dir=$(dirname "$check_dir")
    done
  done

elif [ "$MODE" = "full" ]; then
  # Full scan: find all source files and their parent .ai.md
  SOURCE_FILES=$(find "$ROOT" -type f \( -name '*.ts' -o -name '*.tsx' \) 2>/dev/null)

  for file in $SOURCE_FILES; do
    dir=$(dirname "$file")

    check_dir="$dir"
    while [ "$check_dir" != "$ROOT" ] && [ "$check_dir" != "/" ]; do
      if [ -f "$check_dir/.ai.md" ]; then
        AFFECTED_DIRS+=("$check_dir/.ai.md")
        break
      fi
      check_dir=$(dirname "$check_dir")
    done
  done
else
  echo "Usage: $0 [since-git-commit|full]"
  exit 1
fi

# Deduplicate and output
if [ ${#AFFECTED_DIRS[@]} -gt 0 ]; then
  printf '%s\n' "${AFFECTED_DIRS[@]}" | sort -u
  echo "---"
  echo "Total: $(printf '%s\n' "${AFFECTED_DIRS[@]}" | sort -u | wc -l) .ai.md files need updating."
else
  echo "No .ai.md files need updating."
fi
