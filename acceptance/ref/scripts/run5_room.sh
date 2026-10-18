#!/bin/bash
# run5_room.sh : from save s3 (pilot, captain ABLE, marines BAKER/CHARLIE, Wasp with 4 shields, Delay = 2069)
# boot -> STARPORT -> leave -> fly to the station (30,5) -> dock -> walk to the location-1 enemy room
# (DOWN x13, RIGHT x4, UP) and stop at the PLBATTLE briefing (grab rm_brief).
C="$(dirname "$0")/ctl.sh"
CONF=${REPO:-$PWD}/acceptance/ref/scripts/scref.conf
bash "$C" boot "$CONF" SAVE=s3
bash "$C" w 3; bash "$C" key space; bash "$C" w 2.5; bash "$C" key 1; bash "$C" w 7
bash "$C" key l; bash "$C" w 8
for k in Right Right Down Down Down; do bash "$C" key $k; bash "$C" w 2.5; done
bash "$C" key d; bash "$C" w 2.5; bash "$C" key d; bash "$C" w 3; bash "$C" key b; bash "$C" w 5
for i in $(seq 13); do bash "$C" key Down; bash "$C" w 1.3; done
for i in 1 2 3 4; do bash "$C" key Right; bash "$C" w 1.3; done
bash "$C" key Up; bash "$C" w 3; bash "$C" grab rm_brief
