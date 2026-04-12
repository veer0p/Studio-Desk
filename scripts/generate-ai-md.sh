#!/usr/bin/env bash
# generate-ai-md.sh — Generates thin .ai.md files for repetitive single-route/single-page folders
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

###############################################################################
# 1. Backend API route folders — thin stubs pointing to parent .ai.md
###############################################################################
API_V1="$ROOT/backend/studiodesk/app/api/v1"

if [ -d "$API_V1" ]; then
  find "$API_V1" -mindepth 1 -maxdepth 3 -name 'route.ts' -type f | while read -r route_file; do
    dir=$(dirname "$route_file")

    # Skip if .ai.md already exists
    [ -f "$dir/.ai.md" ] && continue

    # Determine the domain from path
    rel_path="${dir#$API_V1/}"
    domain=$(echo "$rel_path" | cut -d'/' -f1)

    cat > "$dir/.ai.md" << EOF
# Module: $domain
**Path**: \`$dir\`
**Last Updated**: $(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
**Language**: TypeScript (Next.js App Router)

## Purpose
API route handler for \`/api/v1/$rel_path\`

## Route Handler
**File**: \`route.ts\`
**HTTP Methods**: GET | POST | PATCH | DELETE (see parent for details)
**Async**: Yes

**Calls To** (Level 1):
- Service function → \`../../../../lib/services/.ai.md\`
- Auth guard → \`../../../../lib/auth/.ai.md\` (if protected)
- Validation schema → \`../../../../lib/validations/.ai.md\`
- Response helper → \`../../../../lib/.ai.md\`

**Called By** (Level 1):
- Frontend API layer → \`../../../../../../frontend/studiodesk-web/lib/.ai.md\`

## API Contract
See parent route table: \`../../.ai.md\`

## Related Modules
- Parent API routes: \`../../.ai.md\`
- Backend services: \`../../../../lib/services/.ai.md\`
- Frontend lib: \`../../../../../../frontend/studiodesk-web/lib/.ai.md\`
EOF
  done
  echo "✅ Backend API route .ai.md files generated."
fi

###############################################################################
# 2. Frontend page folders — thin stubs pointing to parent .ai.md
###############################################################################
APP_DIR="$ROOT/frontend/studiodesk-web/app"

if [ -d "$APP_DIR" ]; then
  find "$APP_DIR" -mindepth 1 -maxdepth 4 -name 'page.tsx' -type f | while read -r page_file; do
    dir=$(dirname "$page_file")

    # Skip if .ai.md already exists
    [ -f "$dir/.ai.md" ] && continue

    # Determine the route group
    rel_path="${dir#$APP_DIR/}"
    route_name=$(echo "$rel_path" | tr '/' ' ' | awk '{print $NF}')

    cat > "$dir/.ai.md" << EOF
# Module: $route_name page
**Path**: \`$dir\`
**Last Updated**: $(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
**Language**: TypeScript/Next.js (App Router)

## Purpose
Page component for \`/$rel_path\` route.

## Key Components
**File**: \`page.tsx\`
**Type**: Server Component | Client Component (check for "use client")

**Calls To** (Level 1):
- Domain component → \`../../../../components/.ai.md\`
- API fetcher → \`../../../../lib/.ai.md\` (if Server Component)
- SWR hook → \`../../../../hooks/.ai.md\` (if Client Component)

**Called By** (Level 1):
- Next.js App Router → \`../../.ai.md\`

## Data Fetching
See parent route table: \`../../.ai.md\`

## Related Modules
- Parent app: \`../../.ai.md\`
- Components: \`../../../../components/.ai.md\`
- Lib: \`../../../../lib/.ai.md\`
EOF
  done
  echo "✅ Frontend page .ai.md files generated."
fi

###############################################################################
# 3. Frontend component subfolders — thin stubs
###############################################################################
COMP_DIR="$ROOT/frontend/studiodesk-web/components"

if [ -d "$COMP_DIR" ]; then
  find "$COMP_DIR" -mindepth 2 -maxdepth 3 -name '*.tsx' -type f | while read -r tsx_file; do
    dir=$(dirname "$tsx_file")

    # Skip if .ai.md already exists
    [ -f "$dir/.ai.md" ] && continue

    subfolder=$(basename "$dir")
    parent_comp=$(basename "$(dirname "$dir")")

    cat > "$dir/.ai.md" << EOF
# Module: $subfolder
**Path**: \`$dir\`
**Last Updated**: $(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
**Language**: TypeScript/React

## Purpose
$subfolder components for $parent_comp domain.

## Key Components
See parent: \`../.ai.md\`

**Called By** (Level 1):
- Parent domain component → \`../.ai.md\`

## Related Modules
- Parent components: \`../.ai.md\`
- UI primitives: \`../ui/.ai.md\`
- Lib: \`../../../lib/.ai.md\`
EOF
  done
  echo "✅ Frontend component subfolder .ai.md files generated."
fi

echo "Done."
