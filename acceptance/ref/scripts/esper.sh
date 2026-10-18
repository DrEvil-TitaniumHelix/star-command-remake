#!/bin/bash
# esper.sh : at the STARPORT Recruitment Office menu, roll recruits (A) until Esper > 50 (STARPORT 059EE
# offers D-Esper only then), answer y; otherwise n and roll again. Max 60 rolls.
. "$(dirname "$0")/lib.sh"
. "$SC/state"
for n in $(seq 1 60); do
  key a >/dev/null; sleep 2.2
  grab _esp >/dev/null
  v=$(python3 -I "$(dirname "$0")/ocr.py" _esp 21 22 5 | tr -dc '0-9')
  log "roll $n esper=$v"
  if [ -n "$v" ] && [ "$v" -gt 50 ]; then key y >/dev/null; echo "key a (x$n) ... y (esper $v)" >> "$SC/session.keys"; exit 0; fi
  key n >/dev/null; sleep 1.5
done
exit 1
