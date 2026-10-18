#!/bin/bash
# zoom.sh OUT GEOM SCALE IMG... : crop GEOM (e.g. 12x12+93+42) from each image, scale, append left-to-right
# IMG = raw grab name (~/scref/raw/NAME.png) or a path
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
