#!/bin/bash
. "$(dirname "$0")/lib.sh"
xvfb_up
fresh_game
start_dosbox
for i in 1 2 3 4 5 6 7 8; do w 2; grab "probe$i"; done
stop_dosbox
cat "$SC/dosbox.out" | tail -5
