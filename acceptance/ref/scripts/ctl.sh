#!/bin/bash
. "$(dirname "$0")/lib.sh"
VIEW=${VIEW:-/tmp/scref-view}
cmd=$1; shift
[ -f "$SC/state" ] && . "$SC/state"
case $cmd in
  boot)
    [ -n "${1:-}" ] && CONF=$1 && shift
    for kv in "$@"; do export "$kv"; done
    xvfb_up; fresh_game
    [ -n "${SAVE:-}" ] && cp "$SC/saves/$SAVE/"* "$SC/game/"
    pkill -f "dosbox-x -conf" 2>/dev/null; sleep 0.5
    setsid nohup dosbox-x -conf "$CONF" -nopromptfolder >"$SC/dosbox.out" 2>&1 < /dev/null &
    DBPID=$!
    for _ in $(seq 1 50); do
      WIN=$(xdotool search --pid "$DBPID" --onlyvisible 2>/dev/null | tail -1)
      [ -n "$WIN" ] && break; sleep 0.2
    done
    echo "DBPID=$DBPID; WIN=$WIN; T0=$(date +%s.%N)" > "$SC/state"
    : > "$SC/session.keys"
    log "boot pid $DBPID win $WIN" ;;
  key) key "$@"; echo "key $*" >> "$SC/session.keys" ;;
  typ) typ "$*"; echo "typ $*" >> "$SC/session.keys" ;;
  w) w "$1"; echo "w $1" >> "$SC/session.keys" ;;
  grab) grab "$1"; echo "grab $1" >> "$SC/session.keys"; mkdir -p "$VIEW"; convert "$SC/raw/$1.png" -filter point -resize 200% "$VIEW/$1.png" ;;
  shot) shot "$1"; echo "shot $1" >> "$SC/session.keys" ;;
  keep) convert "$SC/raw/$1.png" -filter point -resize 640x400\! "png:$REF/$2.png"; log "keep $1 -> $2"
    echo "keep $1 $2" >> "$SC/session.keys" ;;
  burst)
    for i in $(seq -w 1 "$2"); do grab "$1$i"; sleep "$3"; done ;;
  tmpl)
    mkdir -p "$(dirname "$0")/tmpl"; convert "$SC/raw/$2.png" -crop "$3" +repage "$(dirname "$0")/tmpl/$1.png"
    echo "$3" > "$(dirname "$0")/tmpl/$1.geom"
    convert "$SC/raw/$2.png" -crop "$3" +repage rgb:- | md5sum > "$(dirname "$0")/tmpl/$1.md5"; log "tmpl $1 from $2 $3" ;;
  until)
    t="$(dirname "$0")/tmpl/$1.png"; g=$(cat "$(dirname "$0")/tmpl/$1.geom"); d=$2; shift 2
    want=$(cat "${t%.png}.md5"); n=0; ok=0
    while [ $n -lt 60 ]; do
      grab _until >/dev/null
      [ "$(convert "$SC/raw/_until.png" -crop "$g" +repage rgb:- | md5sum)" = "$want" ] && { ok=1; break; }
      k=${@:$(( n % $# + 1 )):1}; key "$k" >/dev/null; sleep "$d"; n=$((n+1))
    done
    log "until $1: $n presses, matched=$ok"; echo "until $1 $d $*" >> "$SC/session.keys" ;;
  sheet) out=$1; shift; mkdir -p "$VIEW"
    convert $(for n in "$@"; do echo "$SC/raw/$n.png"; done) -filter point -resize 200% +append "$VIEW/$out.png" ;;
  stop) kill "$DBPID" 2>/dev/null; log stop ;;
  alive) kill -0 "$DBPID" 2>/dev/null && echo alive || echo dead ;;
esac
