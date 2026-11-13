#!/bin/bash
REPO=${REPO:-$PWD}
out=$1; shift
mkdir -p "$out"
for id in "$@"; do
  r=$REPO/acceptance/ref/$id.png; e=$REPO/acceptance/out/$id.png
  [ -f "$r" ] && [ -f "$e" ] || { echo "skip $id"; continue; }
  convert "$r" \( "$e" -resize 640x400\! \) +append "$out/$id.pair.png"
  convert "$r" -colorspace gray -edge 1 -threshold 10% -fill red -opaque white -transparent black /tmp/re.png
  convert "$e" -resize 640x400\! -colorspace gray -edge 1 -threshold 10% -fill cyan -opaque white -transparent black /tmp/ee.png
  convert -size 640x400 xc:black /tmp/re.png -composite /tmp/ee.png -compose screen -composite "$out/$id.edge.png"
  echo "$id"
done
