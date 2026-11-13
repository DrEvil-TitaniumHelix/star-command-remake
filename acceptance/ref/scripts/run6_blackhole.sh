#!/bin/bash
C="$(dirname "$0")/ctl.sh"
CONF=${REPO:-$PWD}/acceptance/ref/scripts/scref.conf
bash "$C" boot "$CONF" SAVE=s3
bash "$C" w 3; bash "$C" key space; bash "$C" w 2.5; bash "$C" key 1; bash "$C" w 7
bash "$C" key f; bash "$C" w 6; bash "$C" key l; bash "$C" w 8
bash "$C" key Left; bash "$C" w 2.5
for i in $(seq 16); do bash "$C" key Down; bash "$C" w 2.4; done
bash "$C" grab bh_lr
