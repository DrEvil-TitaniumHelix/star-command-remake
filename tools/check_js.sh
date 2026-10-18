#!/usr/bin/env bash
# check_js.sh — syntax-check every tracked game JS file (node --check) and reject raw CR bytes.
# Why: commit 2181fab put a raw CR into a string literal in game/modules/starport.js; the node test suites never
# load the module files, so STARPORT failed to load in the browser and nothing caught it (fixed 86de203).
# Run before every commit that touches game/: `bash tools/check_js.sh` (exit 1 on any failure).
cd "$(dirname "$0")/.." || exit 1
n=0; bad=0
while IFS= read -r f; do
  n=$((n+1))
  if ! node --check "$f" >/dev/null 2>&1; then bad=$((bad+1)); echo "SYNTAX $f"; node --check "$f" 2>&1 | head -4; fi
  if LC_ALL=C grep -q $'\r' "$f"; then bad=$((bad+1)); echo "RAW CR $f"; fi
done < <(git ls-files 'game/*.js' 'game/*.mjs')
echo "check_js: $n files, $bad problems"
[ "$bad" -eq 0 ]
