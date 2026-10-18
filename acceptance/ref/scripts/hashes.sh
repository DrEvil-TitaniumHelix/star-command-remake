#!/bin/bash
# hashes.sh PREFIX [crop] : region hash per raw grab, to find when a screen changes (stopwatch)
cd $HOME/scref/raw || exit 1
crop=${2:-320x200+0+0}
for f in "$1"*.png; do
  n=${f%.png}
  printf '%s %s\n' "$n" "$(convert "$f" -crop "$crop" +repage rgb:- | md5sum | cut -c1-8)"
done
