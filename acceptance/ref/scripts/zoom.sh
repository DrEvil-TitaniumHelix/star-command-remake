#!/bin/bash
out=$1; geom=$2; sc=$3; shift 3
args=()
for f in "$@"; do
  [ -f "$f" ] || f=$HOME/scref/raw/$f.png
  t=$(mktemp --suffix=.png)
  convert "$f" -crop "$geom" +repage -scale "$sc%" -bordercolor red -border 2 "$t"
  args+=("$t")
done
convert "${args[@]}" +append "$out"
rm -f "${args[@]}"
