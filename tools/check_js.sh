#!/usr/bin/env bash
cd "$(dirname "$0")/.." || exit 1
n=0; bad=0
while IFS= read -r f; do
  n=$((n+1))
  if ! node --check "$f" >/dev/null 2>&1; then bad=$((bad+1)); echo "SYNTAX $f"; node --check "$f" 2>&1 | head -4; fi
  if LC_ALL=C grep -q $'\r' "$f"; then bad=$((bad+1)); echo "RAW CR $f"; fi
done < <(git ls-files 'game/*.js' 'game/*.mjs')
echo "check_js: $n files, $bad problems"
[ "$bad" -eq 0 ]
