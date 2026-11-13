# PLBATTLE screens (what the player sees)

Lane mod-plbattle, 2026-10-15. Derived from `PLBATTLE.bas.md` (labels refer to it). Mode: `SCREEN 7` (320x200, 16 colours) when `UseEGA!` = 1, else SCREEN 1 (4 colours) inherited through CHAIN; the frame bars use colour 1 (EGA) or 3 (CGA), boxes colour 2. Text coordinates are LOCATE row, column (1-based, 40x25, 8x8 cells). PLBATTLE is reached by CHAIN from INSIDE (room encounter, `Terrain!` 11..13) and from SPACE/SPBATTLE (boarding, `Terrain!` 10, or a planet surface 1..9); it leaves by CHAIN to SPACE.STR (`EntryMode!` = 1) or INSIDE.EXE.

## Screen 1: briefing (016A-04D7, text mode on a cleared screen)

| row | col | text |
|---|---|---|
| 1 | 14 | `GROUND COMBAT` |
| 2 | 1 | `The squad is surprised.` / `The enemy is surprised.` / empty (by `Surprise!`) |
| 3 | 1 | `Gravity:` g `      Fatigue Factor:` f (f = g clipped to 0.5, g^3 above 1) |
| 4 | 1 | `Atmosphere: Breathable` / `Unbreathable` |
| 5 | 1 | `Location of combat: ` TerrainName$ (`Plains`, `Mushrooms`, `Swamp`, `Enemy Ship`, `Enclosed Room`, `Semi-enclosed Room`, `Open Room`) |
| 7 | 1 | ` Typical Inacessable Defensive Offensive   Area      Area      Area      Area` over a legend strip: the typical tile XORed as a pattern at x = 16..256 step 80, y = 68..100 step 16, and the tiles `Tile3` at (112,84), `Tile4` at (192,84), `Tile2` at (272,84) |
| 16 | 1 | `To escape the combat walk off the map.` (terrain < 10) / `To escape the combat ` + `use the door at the` (004AB, no space between the two PRINTs) + `bottom of the map.` (004B7) = 40 characters, so the last word wraps onto row 17 (> 10; the door works: 09AB1 `Map%(76) = 1` opens the door cell (4, 8) after the border loop (097C3) closed it, so a step onto it passes 04FA8 and FNOffMap(5) ends the fight via L_410E - confirmed in DOSBox, D-MX-1 / D-QA-7; the earlier decode note that the cell stays 3 came from the misread scalar HasDoor%) / `You can not flee from combat in space   vessels, it must be resolved.` (= 10; 69 characters, wraps onto row 17 as well; the 77-character legend of row 7 wraps too) |
| 19.. | 1 | `Group A: n name(s)` per enemy group as the ENCINFO records are read |
| 23 | 1 | `Squad movement: n squares per turn` |
| 24 | 1 | `Squad members with oxygen:` + member digits (unbreathable only) |
| 25 | 1 | `Press ENTER Key` |

## Screen 2: the battle screen (22AC-28E9)

| element | statement |
|---|---|
| outer boxes | `LINE (0,0)-(319,199),2,B`, `(1,1)-(318,198)`, `(2,2)-(317,197)` |
| portrait box | `LINE (5,5)-(98,82),2,B` (x3 nested) with a divider `LINE (7,24)-(96,24),2`; rows 2-3 (cols 2..12) show the group letter and the group name split in two centred lines; the 88x56 BIGSH portrait is PUT at (8,25) and animates (CGA every 0.123 s, EGA per its script); the box cycles through the groups |
| title box | `LINE (197,5)-(314,26),2,BF` with `PUT (215,6), Logo, AND` (CGA) or `PUT (215,10), BoxSave, PSET` (LOGO.EGA) |
| enemy grid | band `LINE (101,5)-(194,82),2,BF`, black `(112,16)-(191,79)`; header `1 2 3 4 5` at row 2 col 16 and letters `A`..`D` at rows 4/6/8/10 col 14 (GET/PUT through MapSave); unit sprites 16x16 at (unit*16+112, group*16+16): weapon/creature sprite PSET alive, PRESET (inverted) dead |
| battlefield | `LINE (197,29)-(314,146),2,B` (x3); 7x7 terrain tiles XORed at (184+16i, 16+16j); group letters printed at LOCATE (GrpY!, GrpX!); the squad icon (8x8, drawn with LINEs at 22AC-234E) PUT at (GrpX!(5)*8-8, GrpY!(5)*8-8), start (256,88); rooms get a door box `LINE (245,144)-(265,151)` with a black inside |
| member list | band `LINE (5,85)-(194,146),2,BF`, black `(8,96)-(191,143)`; header `Name    HP  Cond A:R` at row 12 col 5; rows 13..18: `n>` col 2, name col 4, HP col 12, `Status$` col 17, A:R col 22 = `Hnd` (hand weapon) / `Brk` (broken) / ammo`:`reloads |
| message panel | `LINE (5,149)-(314,194),2,B` (x3): rows 20..24, cleared with `LINE (8,152)-(311,191),0,BF` (SUB_2EFC) |
| bars | colour `BarColor!`: y 3-4, 83-84 (x 3..194), 147-148, 195-196; x 3-4, 99-100 (y 5..82), 195-196 (y 5..146), 315-316; and (197,27)-(314,28) |

## Round structure (L_3570 .. L_714E, repeated until the battle ends)

1. **Communications** (first round, or when `CommState!` allows): row 22 col 2 `Establish communications? (y/n)`. `y`: a member with Code Breaking (field 23) may translate (`name translates`) or a strong esper (`name uses ESP`), else `Attempt fails` -> movement. Then the panel: row 20 col 7 `Communications Phase`; rows 21-23 col 2 `A-Plead`, `B-Ask`, `C-Demand`; col 13 `D-Bargain/Bribe`, `E-Impersonate Diety`, `F-None`; row 24 col 2 `Choose An Approach: (A-F)`. Unless Bargain (objective fixed to Truce) the objective menu follows: rows 21-23 `A-Truce`, `B-Tribute`, `C-Surrender`, row 24 `Choose An Objective: (A-C)`. The offer score (`CommMood! x CommRatio! x 50 + CommObjective!`, strength ratio bucketed) is rolled against `RND*150`: row 22 `They respectfully decline` / `They refuse your offer` / `They are insulted by your offer` / `They laugh in your face` (by score, may provoke an attack), or `They agree to a truce`, `They accept n credits` / `as payment for a truce` (row 21/22), `They pay n credits`, `They surrender` -> Screen 3.
2. **Movement phases 1..6** (L_46CB): row 20 col 10 `Movement Phase n`; when the squad may move this phase: rows 22-24 col 2 `A-Switch Weapons`, `B-Skip Move`, `C-Time Delay` with the cursor sprite PUT (224,160) XOR. Arrow keys move the squad one cell (inaccessible cells: BEEP and no move); ENTER / B ends the phase. `A`: picker `Who will change weapons?` (digit), then row 20 `name Is Using:`, row 21 the weapon line (`Hand Weapon` or `A<ammo> R<reloads> <*>name`), row 23 `SPACE to change weapon ENTER to select`, row 24 the candidate; ENTER stores the slot. `C`: rows 20/22/24 `Standard Time Delay: n`, `Current Delay Factor n`, `New Delay Factor (1-9999):` + line editor. Each enemy group then scores its five candidate moves (keep distance 2^(4-tactic)-1, approach the offensive cell, flee, stay on passable cells, avoid other groups) and moves when its speed allows; the screen is redrawn (SUB_4E3D).
3. **Command phase** (L_552A): for each living member not resting: row 20 col 10 `name   [stamina]`, row 21 col 2 `Groups In Range: ` + letters (`A` = within reach, `a` = within twice the reach, `None`), row 22 `Command: <CmdName$> at/on group X` or `X1` (group letter + unit number), row 23 `ENTER to accept   A-D  1-5 to retarget`, row 24 `W-ait F-Attack R-apid L-oad M-Aim E-sp`; `E` shows row 24 `M-indshock  H-ealing  P-sychic Scream ` (needs esper levels 1 / 5 / 8). Stamina below 0 prints `name will rest.` instead. A member whose stamina (field 58) fell below zero rests; an empty weapon forces `Reload`.
4. **Initiative round** (L_6587): a countdown from `InitHi!+1` to 0 in steps of `InitLo!/4`; at each level the members whose Speed reaches it act, then enemy units whose initiative reaches it.
   - Member attack: rows 20/21 `name swings` / `uses` / `fires` + the weapon name (`fist`, `HandWeaponName$`, `WeaponName$`); projectile animation by weapon type (dots, shot, beam lines, lightning, flame, rocket arc + burst, big explosion, zap, each with SOUNDs); row 22 `making n hit(s)`; row 23 `for n points of damage.` / `Armor absorbs damage.`; row 24 `n name(s) killed!` / `Equipment destroyed.`. Reload: row 22 `name Reloads`. Esper: row 21 `name uses Mindshock/Healing/Psychic Scream.`, row 23 `It fails.` or `name takes n damage` / `dies.` (`and dies.` row 24); Healing: `name is healed.` per member.
   - Enemy attack (SUB_7151): row 22 `name (A1) switches weapons`, or rows 20/21 `name (A1)` + `AttackVerb$` / `shoots rocket launcher` / `fires flame thrower`; row 22 `and hits.` / `and misses.`; row 23 `name takes n points of damage.` / `name's armor absorbs the damage.`; row 24 `name dies!` (4 SOUND pairs) or a critical: `Sighting hardware destroyed.`, `Hand weapon destroyed.`, `Armor is damaged.`, `Weapon is destroyed.`, `Ammo is destroyed.`; the member row's HP is reprinted at col 12.
   - Attacked units/members are flashed (PRESET/XOR box with a SOUND sweep).
5. Enemy groups attack only once `Attacked!` is set (a squad hit, a hostile roll `RND*100 < c8*35-35`, or a refused offer).

## Screen 3: Battle Over and report (L_410E)

Row 22 col 12 `Battle Over`, two pauses, then `CLS`: row 1 col 14 `BATTLE REPORT`, row 3 col 1 `Credits Gained: n`, a blank line, then per group `Group A: name(s)` / 9 spaces + `n killed. ` + `n Survived.` (truce) or `n Surrendered.`. When boarding (terrain 10) the epilogue adds `Tow linkage broken` or `Towing for salvage`. Then `CHAIN SPACE.STR` or `CHAIN INSIDE.EXE` (`BattleWon!` = credits gained or a surrender).

## Screen 4: squad wiped out

`CLS`, row 13 col 12 `You Are All Dead`, endless loop (L_436B).

## Transitions summary

INSIDE / SPACE / SPBATTLE -> PLBATTLE (CHAIN). Battle ends when no group is active (dead, left the map, truce, surrendered) or the squad walks off the map (rooms: the bottom door) -> report -> SPACE.STR (`EntryMode!` = 1) or INSIDE.EXE. All members dead -> Screen 4 (no exit).
