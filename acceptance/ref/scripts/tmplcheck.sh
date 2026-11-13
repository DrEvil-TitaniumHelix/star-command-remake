#!/bin/bash
d=$(dirname "$0"); g=$(cat "$d/tmpl/$1.geom")
a=$(convert "$d/tmpl/$1.png" rgb:- | md5sum); b=$(convert "$HOME/scref/raw/$2.png" -crop "$g" +repage rgb:- | md5sum)
echo "tmpl $a"; echo "raw  $b"; identify "$d/tmpl/$1.png" "$HOME/scref/raw/$2.png"
