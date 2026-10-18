#!/bin/bash
# run7_inside_bursts.sh : as run5_room.sh, with zero-interval bursts at the dock (IN-00) and at the enemy-room step (IN-09)
# boot -> STARPORT -> leave -> fly to the station (30,5) -> dock -> walk to the location-1 enemy room
# (DOWN x13, RIGHT x4, UP) and stop at the PLBATTLE briefing (grab rm_brief).
C="$(dirname "$0")/ctl.sh"
CONF=${REPO:-$PWD}/acceptance/ref/scripts/scref.conf
bash "$C" boot "$CONF" SAVE=s3
bash "$C" w 3; bash "$C" key space; bash "$C" w 2.5; bash "$C" key 1; bash "$C" w 7
bash "$C" key l; bash "$C" w 8
for k in Right Right Down Down Down; do bash "$C" key $k; bash "$C" w 2.5; done
bash "$C" key d; bash "$C" w 2.5; bash "$C" key d; bash "$C" w 3; bash "$C" key b; bash "$C" burst dk 25 0; bash "$C" w 3
for i in $(seq 13); do bash "$C" key Down; bash "$C" w 1.3; done
for i in 1 2 3 4; do bash "$C" key Right; bash "$C" w 1.3; done
bash "$C" key Up; bash "$C" burst cfz 25 0
