# lib.sh - headless DOSBox-X driver for reference captures (lane dosbox-ref)
# Source from a scenario script. Never touches the Windows display: Xvfb :99 only.
set -u
export DISPLAY=:99
export SDL_AUDIODRIVER=${SDL_AUDIODRIVER:-dummy}
REPO=${REPO:-$PWD}
ORIG=${TARGETS:-$PWD/../re-targets}/starcommand/starcoma
SC=$HOME/scref
CONF=${CONF:-$REPO/acceptance/ref/scripts/scref.conf}
REF=$REPO/acceptance/ref
LOG=${LOG:-$SC/run.log}

log() { echo "$(date +%T.%N | cut -c1-12) $*" | tee -a "$LOG"; }

xvfb_up() {
  if ! pgrep -f "Xvfb :99" >/dev/null; then
    Xvfb :99 -screen 0 1024x768x24 >/dev/null 2>&1 &
    sleep 1
  fi
}

# fresh copy of the original game dir (the game writes CHARINFO.BAS, IN-n, INMAP-n)
fresh_game() {
  mkdir -p "$SC/capture"
  rm -rf "${SC:?}/game"
  cp -r "$ORIG" "$SC/game"
  chmod -R u+w "$SC/game"
}

start_dosbox() {
  pkill -f "dosbox-x -conf" 2>/dev/null; sleep 0.5
  dosbox-x -conf "$CONF" -nopromptfolder >"$SC/dosbox.out" 2>&1 &
  DBPID=$!
  WIN=""
  for _ in $(seq 1 50); do
    WIN=$(xdotool search --pid "$DBPID" --onlyvisible 2>/dev/null | tail -1)
    [ -n "$WIN" ] && break
    sleep 0.2
  done
  T0=$(date +%s.%N)
  log "dosbox pid $DBPID win $WIN"
}

stop_dosbox() { kill "$DBPID" 2>/dev/null; sleep 0.5; }

# key <xdotool keysym...>  (sent to the dosbox window)
key() {
  for k in "$@"; do
    xdotool windowfocus --sync "$WIN" 2>/dev/null
    xdotool key --window "$WIN" --delay 80 "$k"
    log "key $k"
    sleep 0.15
  done
}
# typ <text> : one character at a time
typ() {
  local s="$1" i c
  for ((i = 0; i < ${#s}; i++)); do
    c="${s:i:1}"
    case "$c" in
      " ") c=space ;;
    esac
    xdotool windowfocus --sync "$WIN" 2>/dev/null
    xdotool key --window "$WIN" "$c"
    sleep 0.12
  done
  log "typ $s"
}
w() { sleep "$1"; }

# raw window grab -> $SC/raw/<name>.png
grab() {
  mkdir -p "$SC/raw"
  xwd -silent -id "$WIN" -display :99 | convert xwd:- "png:$SC/raw/$1.png"
  log "grab $1 ($(identify -format %wx%h "$SC/raw/$1.png"))"
}

# shot <id> : window -> game area 320x200 -> 640x400 nearest -> acceptance/ref/<id>.png
shot() {
  grab "$1"
  local g; g=$(identify -format "%w %h" "$SC/raw/$1.png")
  set -- "$1" $g
  # window may be 320x200 (scaler none) or 640x400 (double scan); normalise to 640x400
  convert "$SC/raw/$1.png" -filter point -resize 640x400\! "png:$REF/$1.png"
  log "shot $1 -> acceptance/ref/$1.png (window $2x$3)"
}

elapsed() { echo "$(date +%s.%N) - $T0" | bc; }
