# PLBATTLE — BASIC-style pseudocode (lane mod-plbattle)

Evidence: `decode/listings/PLBATTLE.lst` (regenerated after rt-naming), `decode/data/tools/_PLBATTLE.json` (literal table, DATA records 241/297/6903/7171/7172, code end 0xA960), `decode/brun30/RT_LEDGER.md` (3E_58 verb map, corrected 3F_B7 INPUT types), `decode/data/SPRITES.md` (BIGSH-n, PLBTSH, TR-n, LOGO.EGA), `decode/data/DATA_FILES.md` and the ENCINFO file itself (25 records of a name and 27 integers); read 2026-10-15. The codex draft `PLBATTLE.draft.md` was used as a literal map only; every statement is re-derived from the listing by `decode/pseudo/tools/qb2bas.py`:

```
python decode/pseudo/tools/qb2bas.py decode/listings/PLBATTLE.lst decode/data/tools/_PLBATTLE.json decode/pseudo/PLBATTLE.bas.md --title PLBATTLE --names decode/pseudo/PLBATTLE_names.json --tempbase BE88 --end A921
```

(run twice; `--end A921`: the last reachable instruction is the `ret` at A920, bytes A921..A92F have no incoming edge and block 22 starts at A930; `--tempbase BE88`: compiler temp slot T0 = DS 0xBE88, proven by `RT3F_71 #83` at 0199F followed by `mov dx,0xBEA0` (= 0xBE88 + 3*8) as the BLOAD offset at 019BA, and 13 further T3 reads.) This file = `decode/pseudo/PLBATTLE_header.md` + the generated body. Screens and flows: `decode/pseudo/PLBATTLE_SCREENS.md`.

## Conventions

- Statements carry their listing offset; `L_XXXX:` jump targets, `SUB_XXXX:` GOSUB bodies; FOR/NEXT reconstructed from the compiled counter pattern (112 loops, including the variable-STEP form). Convention of the translator in every module: the `FOR x = a TO b` line never shows the step; a non-unit or variable step is printed on the matching `NEXT x STEP s` line (e.g. `0201B FOR J! = 1100 TO 1397` ... `020BD NEXT J! STEP 3`).
- Names come from `PLBATTLE_names.json` (each with an `_why` evidence entry). `G!()` is the COMMON array at DS 0x1850; addresses below 0x40F4 are its elements: `DriveCfg!` G!(85), `StdDelay!` G!(86), `Delay!` G!(88), `UseEGA!` G!(89), `SoundOff!` G!(93), `CreditsHi!/Lo!` G!(78)/(79), `ChainArg!` G!(2214), `EntryMode!` G!(2227), `Terrain!` G!(2228), `Surprise!` G!(2229), `Gravity10!` G!(2250), `BoardCrew!` G!(2251), `Breathable!` G!(2252), `BattleWon!` G!(2254), `Enclosure!` G!(2260), and the boarding bookkeeping G!(6), G!(109), G!(310..315), G!(330..339), G!(2236/2237/2240/2263).
- Eight DEF FN bodies (06A9..1953) are inlined: `FNCrew(member, field)` / `FNIdx(member, field)` on the squad records 1500 + member*100 (member 1..6 = ship crew 3..8; names shifted by two at 0659 and back by SUB_9685), `FNDist(a, b)` between position slots, `FNRanged(g)` / `FNInRange(g)` (group within twice / once the weapon reach), `FNMap(s)` terrain under a slot, `FNOffMap(s)`, `FNPassable(s)`.
- Position slots: 0..3 enemy groups, 5 the squad (`GrpX!(5)/GrpY!(5)`; the decode had rendered these direct operands as scalars `SquadX!/SquadY!`, likewise `TileX!/TileY!` = slot 6, `ExitX!/ExitY!` = 7, `CenterX!/CenterY!` = 8 - sweep-folded), 6 the last offensive cell, 7 the bottom exit (32.5, 99), 8 the map centre (32.5, 11.5). Coordinates are text cells (8 px): map columns 26..39, rows 5..18; the 7x7 battlefield cells are 16 px at x = 184 + 16i, y = 16 + 16j (i, j = 1..7), `FNMap` = `Map%(INT(x/2 - 12) + INT(y/2 - 1.5)*9)`.
- Per-unit arrays are indexed `group*5 + unit` (groups 0..3, units 0..4). Per-group arrays by group.
- `' dynamic array (descriptor)` marks PUT/GET on the three DIM'd arrays (`HdrSave`, `MapSave`, `BoxSave`, 0040-005D; DH <> 0 in the PUT verb word).
- Screen mode: `SCREEN 7` (320x200, 16 colours) when `UseEGA!` = 1 (0072), otherwise the inherited SCREEN 1; sprite files `.EGA` / `.BAS` are chosen accordingly (0301-0380, 1954-19FB); the EGA path also BLOADs `LOGO.EGA` into `BoxSave` (0349) for the title box (25DA-2609), while the CGA path draws no logo of its own on the normal path (the only `BLOAD "LOGO"` is the debug path 0509; the CGA logo at 0x40F4 comes from STARTUP's COMMON load).

## Module structure (offsets)

| range | content |
|---|---|
| 0040-005D | DIM HdrSave(3138), MapSave(4098), BoxSave(2210) |
| 0061-00C7 | SCREEN 7 (EGA), Drive$, PLAY "MF", Pi!, SndDur! |
| 00D0-0129 | READ AttackVerb$(1..4), TerrainName$(1..13) |
| 0140-0167 | `DebugLoad!`-only CHARINFO load (never taken) |
| 016A-02D0 | entry values (Gravity!, Atmos!, SurpriseCur!, TerrType!), intro text: GROUND COMBAT, surprise line, gravity/fatigue, atmosphere, location |
| 02FC-04D7 | TR-n tiles (+ LOGO.EGA), terrain legend, escape instructions |
| 04DD-06A6 | Status$, `DebugLoad!`-only NAME/CHARNAME loading, name shift |
| 06A9-1953 | DEF FN bodies (an unused credits FN at 06F7) |
| 0716-0E33 | `DebugLoad!`-only "Change things?" debug fill |
| 0E36-1784 | RANDOMIZE; ENCINFO loading: records from ChainArg!, group creation (size, position clash test, per-unit initiative/armour/HP/rockets/flames/melee), name split, boarding override, "Group A: n name(s)", following groups by columns 22-24 |
| 1787-1A8A | squad position (33,12), BIGSH portrait and PLBTSH banks, Squad movement |
| 1AB4-1C00 | move tables, READ CmdName$(0..10), comms tables |
| 1C13-1D64 | round state, weapon-slot validation, stamina (field 58 = 3 x movement) |
| 1D6D-1F77 | oxygen check (items 10/8/9 -> fields 33/56/40) when unbreathable |
| 1F7D-21E3 | auto-reload of empty weapons from ammo items, esper derived fields 51..53 |
| 22AC-28E9 | the battle screen (SUB layout at SCREENS.md), portrait tick, member list, enemy grid, map |
| 2913-34B9 | helpers (delays, credits, A:R column, pickers, key readers, panel clears, line editor, dead code 310A-34B9) |
| 3570-3D01 | round head: Communications (y/n, translator/ESP roll, approach/objective menus, outcome, truce/tribute/surrender) |
| 3D02-40D0 | group status, strengths, state setters |
| 40D1-4550 | hostile outcome, Battle Over + BATTLE REPORT, BattleWon!, boarding epilogue (SUB_436D), CHAIN SPACE.STR / INSIDE.EXE, "You Are All Dead" |
| 4554-4DEA | movement phases 1..6: squad command (arrows, A/B/C), enemy group moves (5 candidates scored), early end |
| 4E3D-54C0 | redraw, group letters, moves, Switch Weapons (with reload counting), weapon line, Time Delay |
| 54C1-6460 | command phase per member: stamina, groups in range, command preset and keys, target, esper menu; stores fields 33/37/38 |
| 6463-70F6 | the initiative round: members act (reload / attack with projectile and damage / esper), enemy units act (SUB_7151), provocation |
| 7151-7FC0 | enemy attack: weapon choice, hit roll, projectile, damage, member death, criticals |
| 7FC1-81EA | projectile geometry |
| 81EB-8690 | squad attack resolution: weapon effects 1..12, hits, kills, criticals |
| 8691-92AD | weapon effect routines (dot/shot flights, beams, lightning, flame, rocket arc, explosions, zap) |
| 92AE-9684 | SUB_92AE weight/movement |
| 9685-96FB | name un-shift |
| 96FC-9B05 | map generation and drawing (TerrType! > 9: the whole border incl. the bottom row is type 3 (97C3); column 4 rows 4..7 are reopened (9911); for rooms, TerrType! > 10, the door cell Map%(76) = (4, 8) is set to 1 at 9AB1 - a direct store to 0xBC62 the decode had misread as a scalar HasDoor% - and the door box is drawn (9AE3-9B02); so the squad leaves a room fight by stepping onto the door cell (FNPassable 1, then FNOffMap(5) -> L_410E), while a boarded ship (terrain 10) has no door; corrected after DOSBox D-MX-1 / D-QA-7) |
| 9B06-9F75 | portrait animation (CGA/EGA frame scripts) |
| 9F76-A15C | unit sprite drawing |
| A15D-A36A | attacked box flash (enemy / member) |
| A36B-A8B5 | esper attacks and healing |
| A8B8-A920 | after a won boarding of portrait type 3: G!(109) = 1, first G!(110..159) = 1 becomes 2 |

## Data formats found here (for DATA_FILES.md)

- **ENCINFO** (25 lines): `name$, c1 .. c27`. Columns as used: c1 max group size, c2 initiative base (x1.3/x0.7/x0.6 = `InitHi!/InitMid!/InitLo!`, the bounds of the initiative countdown 1039-1055, 6587-659D - not morale: group morale is SUB_3D68), c3 to-hit modifier against the group, c4 unit armour, c5 squares per turn, c6 hit points base, c7 attitude 1..3 (a bribe offer is `(c7 < 4) * -40` = +40 at 399D, i.e. it starts at 40 instead of 50 and never fails outright), c8 hostility (1 passive, >1 attacks with chance 35*c8-35 %), c9 tactic 1..5, c10 BIGSH portrait number, c11 unused, c12 credits per unit, c13 strength per unit, c14 unused, c15/c17 rocket chance and count, c19/c21 flame-thrower chance and charges, c25 melee attacks, c16/c18/c20 rocket/melee/flame damage, c22 chance of a following group, c23/c24 the following records, c26 melee reach, c27 attack verb 1..4 (also the creature sprite). Records are read from `ChainArg!` (G!(2214)); extra groups follow the record links until 4 groups or a failed c22 roll.
- **BIGSH-n.BAS/.EGA**: the 88x56 portrait at the start; after it a frame script of integers (CGA: from word 618, one frame number 1..5 per 0.123 s, terminated by 0; EGA: from word 1240, pairs (frame type 1..4, delay in 1/100 s), terminated by a negative word) with XORed overlay frames at 0x8AF2/0x8ED4/0x91D0 placed by the integer pairs at 0x89F6..0x8A00 — i.e. the .EGA files carry their own animation offsets.
- **PLBTSH.EGA/.BAS** (18 GET arrays at &HAC70 = file offset 7; the slots are not uniform - offsets and spacing from `sprites_index.tsv`: 0 16x16@7 (+132), 1 16x16@139 (+132), 2 16x16@271 (+132), 3 24x24@403 (+292), 4 24x24@695 (+292), 5 24x24@987 (+292), 6 24x24@1279 (+292), 7 24x24@1571 (+292), 8 26x24@1863 (+388), 9 1x1@2251 (+8), 10 3x3@2259 (+16), 11 4x4@2275 (+20), 12 24x24@2295 (+292), 13 24x24@2587 (+292), 14 24x24@2879 (+292), 15 16x16@3171 (+132), 16 16x16@3303 (+132), 17 16x16@3435; only the 16x16 slots are 132 bytes, the 24x24 ones 292, cursor to Shot1 388): 0 laser-creature, 1 rocket unit, 2 flame unit, 3..7 big explosion frames, 8 the 26x24 menu cursor, 9 1x1 dot shot, 10 3x3 shot, 11 4x4 rocket, 12..14 small explosion frames, 15..17 claw/sting/bite creatures.
- **TR-n.EGA/.BAS** (&HBC6C): slot 0 typical (drawn as the XOR background pattern), 1 offensive, 2 inaccessible, 3 defensive terrain tiles.
- **DATA**: AttackVerb$ (line 241), TerrainName$ (297: index 1 Plains .. 13 Open Room), CmdName$ (6903), comms tables (7171/7172: CommMood! 5x3, CommRatio! 5x9, CommObjective! 5x4, read column-major as `(i, j)` -> `i + j*5`).

## Dead / unreferenced code

- 06F7-0715: credits DEF FN body with no caller.
- 0140-0167, 04F8-0650, 0716-0E33: only with `DebugLoad!` <> 0 (never set).
- 2983-299A ("Select Option"), 2F62-2FA5 (two LINE clears), 310A-3167 (item search), 3168-31A5 ("Can Not Carry Anymore Of That" / "Can Not Afford It"), 31AC-34B9 (member stat derivation), 352A-356F (typed yes/no), 89EA-8B79 (a beam variant with LINE (156,76)) : no label reaches them.
- A921-A92F: data tail.

## Unknowns / open questions

- No runtime call is unrendered.
- G!(6), G!(81), G!(109), G!(235), G!(285), G!(310..315), G!(330..339), G!(2236), G!(2237), G!(2240), G!(2263) are read or written only in the boarding epilogue / debug fill; their meanings belong to SPACE/SPBATTLE (the names `TowLinkCond!`, `KillPtr!`, `LastEnemyType!` are readings, M).
- `N_D2C4!` (added to the enemy hit chance) is never given a value; `N_D130!` is stored the constant 0 at 06480 and negated at 064CE: both are 0 at run time.
- Squad weapon record fields +8 and +10 (`WepReach!` = +10) are named by use only.
- The CGA portrait frame script reads `A_942E%` words 618.. of BIGSH-n.BAS; the data lane noted bytes after the picture in those files, this is their use.
