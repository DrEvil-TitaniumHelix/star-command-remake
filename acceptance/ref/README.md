# acceptance/ref — DOSBox-X reference captures of the original (lane dosbox-ref)

Headless DOSBox-X 2026.01.02 in WSL Ubuntu on `Xvfb :99` (never the Windows display), `machine=ega`, 8086 normal core, `cycles=fixed 3000` (`scripts/scref.conf`). The game runs from a scratch copy `~/scref/game` of `re-targets/starcommand/starcoma` (the originals are never touched; the game writes CHARINFO.BAS / CHARNAME / IN-n / INMAP-n). `<id>.png` = the 320x200 window, 2x nearest = 640x400, same id as ACCEPTANCE.md; extra suffixes are variants (frames, states). Verdict files `verdicts-*.tsv` feed the reviewer column (`scripts/fill_acceptance.py`); `verdicts-r2.tsv` is the merged state after the SC-2 / F-1 / F-3 re-compare.

## Tools (`scripts/`)
| file | use |
|---|---|
| `ctl.sh` | step driver: `boot [conf] [SAVE=name] [ENV=VAL]`, `key`, `typ`, `w`, `grab`, `shot ID`, `keep RAW ID`, `burst PREFIX N INTERVAL`, `tmpl` / `until` (press keys until a screen template matches), `sheet`, `stop`; every step is logged to `~/scref/session.keys` and `~/scref/run.log` (timestamps = stopwatch) |
| `lib.sh` | shared functions (Xvfb, fresh game copy, xdotool keys, xwd grabs) |
| `run5_room.sh`, `run6_blackhole.sh`, `run7_inside_bursts.sh` | scripted routes from save s3 (station room battle, black hole, INSIDE entry bursts); `run1.keys` = log of run 1 |
| `compare.py` | ref vs engine on the 320x200 raster, ref colours mapped to the engine colour covering them (colours ignored), mismatch count + 8x8 cell map + diff image; `ID:enginepath` compares with another engine shot |
| `pair.sh`, `zoom.sh`, `glyph.py`, `ocr.py`, `bbox.py`, `blobs.py`, `colpix.py`, `hashes.sh` | side-by-side / zoom crops / text-cell bits / text OCR with the captured font / changed-pixel boxes / sprite blobs / pixel runs of one colour / per-grab region hashes |
| `mkfontcom.py`, `fontdiff.py` | 58-byte DOS program that prints all 256 glyphs in mode 4; decode -> `font_dosbox_ega8x8.json` and diff against the engine font |
| `raw2wav.py`, `notes.py` | SDL disk-audio dump -> WAV (`SU-01.wav`) and pitch segments |
| `patchsave.py` | set CHARINFO.BAS elements (MBF singles) in a scratch save copy - the documented test interventions |
| `abs_audit.py` | finds every `and/jge/neg` (integer ABS) idiom in the listings and how the pseudocode rendered it |

Saves used (in `~/scref/saves/`, scratch only): s2 (pilot, Wasp, 4 shields, mission 1), s2enc (= s2 with G!(2235) = 100: an encounter on every SPACE entry), s3 (+ captain ABLE, marines BAKER/CHARLIE with combat suits, Delay = Standard 2069), s3drop (= s3 with drop-ship parts G!(21)/G!(22) = 1). The rule-book check accepts letters within +-1 of the word (shipped placeholder words: type `a` per dash).

## Not captured (and why)
- PT-01 / PT-01m (kill reward, medal): need a destroyed enemy ship and a completed mission; the Wasp has no guns.
- SB-05 / SB-06 (gunner commands / firing): no ship guns; SB-07 BATTLE REPORT is on screen < 0.15 s (D-SB-1); SB-08 / SB-09 (life support) and SB-02d / SB-02dY (docking) need rare states.
- PB-03 / PB-07 (communications, bribe report): need a translator (crew field 23) or an esper of level > 3 in the squad (PLBATTLE 03638-0370C), otherwise `Attempt fails` and the movement phase follows.
- IN-14v / D-IN-3: V needs an esper with level > 6 and View points (INSIDE 05439).
- IN-11 (`Reloading`) and IN-09 (`Confrontation with enemies`) are shown for less than one grab interval (~0.1 s) at this speed; IN-00 is not a separate visible state (the room picture appears with the screen).
- IN-01 (airless location 3), IN-02a/b, IN-10 (location 5), SP-12s (Hi-Tech planet), SP-14, CM-01, SU-05: not reached / no visual of their own.
- D-MX-2 needs a ship with only Shield #1.
