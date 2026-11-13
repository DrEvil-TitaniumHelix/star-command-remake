#!/bin/bash
REPO=$(cd "$(dirname "$0")/../../.." && pwd)
out=${1:?usage: reshoot.sh OUTDIR [ID...]}; shift
[ $# -eq 0 ] && set -- $(ls "$REPO/acceptance/out" | sed -n 's/\.png$//p')
mkdir -p "$out"
PORT=${PORT:-8094}
python -I "$REPO/tools/serve.py" "$PORT" >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1.5
GAME_URL=http://127.0.0.1:$PORT/index.html node "$REPO/acceptance/ref/scripts/shoot_all.mjs" "$out" "$@"
tomnt() { (cd "$1" && pwd) | sed 's|^/\([a-z]\)/|/mnt/\1/|'; }
MSYS_NO_PATHCONV=1 wsl.exe -d Ubuntu -- python3 -I "$(tomnt "$REPO")/acceptance/ref/scripts/shotdiff.py" "$(tomnt "$out")"
