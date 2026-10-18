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

## Pseudocode

```basic
00043  ' push 3138
00047  DIM HdrSave(1 dims; sizes pushed above)
0004E  ' push 4098
00052  DIM MapSave(1 dims; sizes pushed above)
00059  ' push 2210
0005D  DIM BoxSave(1 dims; sizes pushed above)
0006A  IF UseEGA! <> 1 THEN GOTO L_0075
L_006F:
00072  SCREEN 7
L_0075:
0007B  Drive$ = ""
00087  IF DriveCfg! <> 1 THEN GOTO L_0095
L_008C:
0008F  Drive$ = "A:"
00092  GOTO L_00AC
L_0095:
0009E  IF DriveCfg! <> 2 THEN GOTO L_00AC
L_00A3:
000A9  Drive$ = "B:"
L_00AC:
000AF  PLAY "MF"
000B8  Pi! = 3.14159
000C7  SndDur! = 1 - SoundOff!
000D0  FOR I! = 1 TO 4
L_00D4:
000E6  READ AttackVerb$(CINT(I!))
000F1  NEXT I!
00108  FOR I! = 1 TO 13
L_010C:
0011E  READ TerrainName$(CINT(I!))
00129  NEXT I!
00140  IF DebugLoad! = 0 THEN GOTO L_016A
L_0145:
00151  BLOAD "CHARINFO", &H1850
0015D  IF DebugLoad! <> 1 THEN GOTO L_016A
L_0162:
00167  UseEGA! = 1
L_016A:
00179  Gravity! = INT(Gravity10!) / 10
00185  Atmos! = SGN(Breathable!)
0018E  SurpriseCur! = Surprise!
00197  TerrType! = Terrain!
001A2  IF TerrType! >= 1 THEN GOTO L_01AC
L_01A7:
001A9  TerrType! = 1
L_01AC:
001AF  CLS
001BB  LOCATE 1, 14
001BE  PRINT "GROUND COMBAT"
001D3  IF SurpriseCur! <> 2 THEN GOTO L_01E7
L_01D8:
001D8  PRINT "The squad is surprised."
001E4  GOTO L_0210
L_01E7:
001F0  IF SurpriseCur! <> 1 THEN GOTO L_0204
L_01F5:
001F5  PRINT "The enemy is surprised."
00201  GOTO L_0210
L_0204:
00204  PRINT ""
L_0210:
00216  EncAdd! = 0
00224  IF TerrType! <> 11 THEN GOTO L_0231
L_0229:
0022E  EncAdd! = Enclosure!
L_0231:
00237  Fatigue! = Gravity!
00242  IF Gravity! >= 0.5 THEN GOTO L_0251
L_0247:
0024B  Fatigue! = 0.5
0024E  GOTO L_026B
L_0251:
0025A  IF Gravity! <= 1 THEN GOTO L_026B
L_025F:
00268  Fatigue! = Gravity! ^ 3
L_026B:
0026B  PRINT "Gravity:"; Gravity!; "      Fatigue Factor:"; INT(Fatigue! * 100) / 100
0029B  PRINT "Atmosphere: ";
002B0  IF Atmos! <> 1 THEN GOTO L_02C4
L_02B5:
002B5  PRINT "Breathable"
002C1  GOTO L_02D0
L_02C4:
002C4  PRINT "Unbreathable"
L_02D0:
002D0  PRINT "Location of combat: "; TerrainName$(CINT(TerrType! + EncAdd!))
002FC  IF UseEGA! <> 1 THEN GOTO L_034F
L_0301:
00333  BLOAD Drive$ + "TR" + STR$(-TerrType!) + ".EGA", &HBC6C
00349  BLOAD Drive$ + "LOGO.EGA", VARPTR(BoxSave)
0034C  GOTO L_0383
L_034F:
00380  BLOAD Drive$ + "TR" + STR$(-TerrType!) + ".BAS", &HBC6C
L_0383:
00389  FOR I! = 16 TO 256
L_038C:
0039A  LegendEnd! = I! + 32
003A2  FOR LegendX! = I! TO LegendEnd!
L_03A6:
003AC  FOR LegendY! = 68 TO 100
L_03B0:
003C6  PUT (LegendX!, LegendY!), TileBank, XOR
003D1  NEXT LegendY! STEP 16
003EA  NEXT LegendX! STEP 16
00403  NEXT I! STEP 80
L_0416:
00429  PUT (112, 84), Tile3, PSET
0043B  PUT (192, 84), Tile4, PSET
0044D  PUT (272, 84), Tile2, PSET
00459  LOCATE 7, 1
0045C  PRINT " Typical Inacessable Defensive Offensive   Area      Area      Area      Area"
00471  LOCATE 16, 1
0047D  IF TerrType! = 10 THEN GOTO L_04BD
L_0482:
00482  PRINT "To escape the combat ";
00491  IF TerrType! >= 10 THEN GOTO L_04A5
L_0496:
00496  PRINT "walk off the map."
004A2  GOTO L_04BD
L_04A5:
004A5  PRINT "use the door at the";
004B1  PRINT "bottom of the map."
L_04BD:
004C6  IF TerrType! <> 10 THEN GOTO L_04D7
L_04CB:
004CB  PRINT "You can not flee from combat in space   vessels, it must be resolved."
L_04D7:
004DD  Status$(0) = "Dead"
004E6  Status$(1) = "Okay"
004EF  Status$(2) = "Rad "
004F8  IF DebugLoad! = 0 THEN GOTO L_0653
L_04FD:
00509  BLOAD "LOGO", &H40F4
00519  OPEN "NAME" FOR INPUT AS #1
00522  FOR I! = 1 TO 80
L_0526:
00529  INPUT #1, K$
00540  NEXT I!
00556  FOR I! = 0 TO 53
L_055A:
0055D  INPUT #1, WeaponName$(CINT(I!))
00582  NEXT I!
00598  FOR I! = 0 TO 5
L_059C:
0059F  INPUT #1, HandWeaponName$(CINT(I!))
005C4  NEXT I!
005D7  CLOSE #1
005E7  OPEN "CHARNAME" FOR INPUT AS #1
005ED  INPUT #1, ShipName$, CrewName1$, CrewName2$
0060F  FOR I! = 1 TO 6
L_0612:
00615  INPUT #1, CrewName$(CINT(I!))
0063A  NEXT I!
0064D  CLOSE #1
00650  GOTO L_06A6
L_0653:
00659  FOR I! = 1 TO 6
L_065C:
0068B  SWAP CrewName$(CINT(I! + 2)), CrewName$(CINT(I!))
00696  NEXT I!
L_06A6:
006A6  GOTO L_06D8
SUB_06A9:
006D7  RETURN   'with FAC = INT(G!(CINT(FnMember! * 100 + FnField! + 1500)) + 0.1)
L_06D8:
006D8  GOTO L_06F7
SUB_06DB:
006F6  RETURN   'with FAC = INT(FnIMember! * 100 + FnIField! + 1500.5)
L_06F7:
006F7  GOTO L_0716
00715  RETURN   'with FAC = INT(CreditsHi! * 30000 + CreditsLo! + 0.5)
L_0716:
0071C  IF DebugLoad! = 0 THEN GOTO L_0E36
L_0721:
00721  GOSUB SUB_2EFC
0072D  LOCATE 20, 2
00730  PRINT "Change things? ";
L_073C:
00742  K$ = INKEY$
00763  IF (K$ = "n") OR (K$ = "N") THEN GOTO L_0E36
L_0768:
00787  IF ((K$ <> "y") AND (K$ <> "Y")) THEN GOTO L_073C
007B0  G!(CINT(FNIdx(4, 51))) = 60
007D8  G!(CINT(FNIdx(6, 23))) = 6
007E1  ChainArg! = 20
007EA  FOR I! = 800 TO 1088
L_07EE:
0081D  G!(CINT(I!)) = INT(RND * 54 + 1)
00856  G!(CINT(I! + 9)) = INT(RND * 6 + 3)
00875  G!(CINT(I! + 8)) = 5
008AA  G!(CINT(I! + 3)) = INT(RND * 10 - 2)
008C4  G!(CINT(I! + 6)) = 12
008FF  G!(CINT(I! + 10)) = INT(RND * 50 + 25)
00919  G!(CINT(I! + 2)) = 1
00936  G!(CINT(I! + 1)) = 30
00951  G!(CINT(I! + 7)) = 70
0096C  G!(CINT(I! + 4)) = 8
00987  G!(CINT(I! + 11)) = 10
00991  NEXT I! STEP 12
L_09A4:
009AA  FOR I! = 1100 TO 1397
L_09AE:
009DD  G!(CINT(I!)) = INT(RND * 54 + 1)
00A10  G!(CINT(I! + 2)) = INT(RND * 6 + 3)
00A1A  NEXT I! STEP 3
00A30  FOR I! = 1 TO 6
L_0A34:
00A75  G!(CINT(FNIdx(I!, 32))) = INT(RND * 25 + 1)
00AB9  G!(CINT(FNCrew(I!, 32) * 12 + 797)) = I! + 2
00AF4  G!(CINT(FNIdx(I!, 27))) = INT(RND * 6)
00B1E  G!(CINT(FNIdx(I!, 52))) = 12
00B4A  G!(CINT(FNIdx(I!, 53))) = 50
00B74  G!(CINT(FNIdx(I!, 54))) = 33
00BA8  G!(CINT(FNIdx(I!, 90))) = INT(RND * 2)
00BEA  G!(CINT(FNIdx(I!, 12))) = INT(RND * 10 + 15)
00C12  G!(CINT(FNIdx(I!, 31))) = 1
00C1D  NEXT I!
L_0C30:
00C36  N_1994! = 1
00C3F  FOR I! = 2300 TO 2375
L_0C42:
00C73  G!(CINT(I!)) = INT(RND * 3 + 7)
00CA4  G!(CINT(I! + 2)) = INT(RND * 6 + 3)
00CAE  NEXT I! STEP 3
00CC4  FOR I! = 1 TO 6
L_0CC8:
00CEF  G!(CINT(FNIdx(I!, 21))) = 4
00D19  G!(CINT(FNIdx(I!, 15))) = 25
00D43  G!(CINT(FNIdx(I!, 16))) = 30
00D6D  G!(CINT(FNIdx(I!, 5))) = 100
00D95  G!(CINT(FNIdx(I!, 27))) = 8
00DA1  NEXT I!
L_0DB4:
00DBA  SurpriseCur! = 1
00DC3  KillPtr! = 26
00DCC  N_1BFC! = 99
00DD5  N_1CC4! = 999
00DDE  TowLinkCond! = 1
00DE7  TerrType! = 11
00E0F  G!(CINT(FNIdx(6, 31))) = 0
00E18  EncAdd! = 2
00E21  MapType! = 11
00E2A  BoardCrew! = 6
00E33  ChainArg! = 18
L_0E36:
00E3C  RANDOMIZE TIMER
00E45  J! = 0
00E4E  EncRec! = ChainArg!
00E57  NGroups! = 1
L_0E5A:
00E71  OPEN Drive$ + "ENCINFO" FOR INPUT AS #1
00E7A  EncPos! = 0
L_0E7D:
00E83  EncEnd! = EncRec!
00E8C  FOR I! = EncPos! TO EncEnd!
L_0E90:
00E93  INPUT #1, GrpName$(CINT(J!)), C1Size!, C2Init!, GrpToHitMod!(CINT(J!)), C4Armor!, GrpSpeed!(CINT(J!)), C6HP!, C7Mood!, C8Hostile!, GrpTactic!(CINT(J!)), GrpPortrait!(CINT(J!)), GrpCol11!(CINT(J!)), GrpValue!(CINT(J!)), GrpStrength!(CINT(J!)), GrpCol14!(CINT(J!)), C15RocketPct!, GrpRocketDmg!(CINT(J!)), C17Rockets!, GrpMeleeDmg!(CINT(J!)), C19FlamePct!, GrpFlameDmg!(CINT(J!)), C21Flames!, C22NextPct!, C23Next1!, C24Next2!, C25Melee!, GrpMeleeRange!(CINT(J!)), GrpAttackVerb!(CINT(J!))
00FB3  NEXT I!
L_0FC6:
00FCC  EncPos! = I!
L_0FCF:
00FE4  GrpState!(CINT(J!)) = 4
01008  GrpX!(CINT(J!)) = INT(RND * 14 + 26)
01028  GrpY!(CINT(J!)) = INT(RND * 7 + 5)
01039  InitHi! = C2Init! * 1.3
01047  InitMid! = C2Init! * 0.7
01055  InitLo! = C2Init! * 0.6
01064  PrevGrp! = J! - 1
0106D  FOR Col4! = 0 TO PrevGrp!
L_1070:
010BF  IF NOT ((GrpY!(CINT(Col4!)) = GrpY!(CINT(J!))) AND (GrpX!(CINT(Col4!)) = GrpX!(CINT(J!)))) THEN GOTO L_10CC
L_10C4:
010C9  Col4! = 9
L_10CC:
010D5  NEXT Col4!
010EE  IF Col4! > 8 THEN GOTO L_0FCF
L_10F3:
0112B  GrpSize!(CINT(J!)) = INT((1 - (RND ^ 2)) * C1Size! + 1)
01136  IF GrpSize!(CINT(J!)) <= 5 THEN GOTO L_1140
L_113B:
0113D  GrpSize!(CINT(J!)) = 5
L_1140:
01167  Half! = (LEN(GrpName$(CINT(J!)))) * 0.5 + 1
0117E  Sp1! = INSTR(GrpName$(CINT(J!)), " ")
01196  Sp2! = INSTR(CINT(Sp1! + 1), GrpName$(CINT(J!)), " ")
011B5  IF ABS(Sp2! - Half!) >= ABS(Sp1! - Half!) THEN GOTO L_11C1
L_11BA:
011BE  Sp1! = Sp2!
L_11C1:
011C7  IF Sp1! <> 0 THEN GOTO L_11F6
L_11CC:
011E4  GrpName1$(CINT(J!)) = GrpName$(CINT(J!))
011F0  GrpName2$(CINT(J!)) = ""
011F3  GOTO L_124E
L_11F6:
01227  GrpName1$(CINT(J!)) = LEFT$(GrpName$(CINT(J!)), CINT(Sp1! - 1))
0124B  GrpName2$(CINT(J!)) = MID$(GrpName$(CINT(J!)), CINT(Sp1! + 1), 11)
L_124E:
01270  IF NOT ((GrpPortrait!(0) <> 3) AND (Terrain! = 10)) THEN GOTO L_12E7
L_1275:
0129A  C22NextPct! = ABS(BoardCrew! > 3) * 100
012B3  GrpSize!(CINT(J!)) = BoardCrew!
012C0  C23Next1! = EncRec!
012C6  C24Next2! = EncRec!
012D3  BoardCrew! = BoardCrew! - 3
012DB  IF C22NextPct! <= 0 THEN GOTO L_12E7
L_12E0:
012E4  GrpSize!(CINT(J!)) = 3
L_12E7:
012FD  LOCATE CINT(J! + 19), 1
01300  PRINT "Group "; CHR$(CINT(J! + 65)); ":"; GrpSize!(CINT(J!)); GrpName$(CINT(J!));
01346  IF GrpSize!(CINT(J!)) <= 1 THEN GOTO L_1357
L_134B:
0134B  PRINT "(s)"
L_1357:
01370  UnitEnd! = GrpSize!(CINT(J!)) - 1
01379  FOR I! = 0 TO UnitEnd!
L_137C:
013B6  UnitInit!(CINT(J!) * 5 + CINT(I!)) = (RND * 0.6 + 0.7) * C2Init!
013C4  UnitArmor!(CINT(J!) * 5 + CINT(I!)) = C4Armor!
013E6  UnitHP!(CINT(J!) * 5 + CINT(I!)) = (RND * 0.5 + 0.75) * C6HP!
013F2  UnitState!(CINT(J!) * 5 + CINT(I!)) = 1
01404  IF RND * 100 <= C15RocketPct! THEN GOTO L_1431
L_1409:
0142B  UnitRockets!(CINT(J!) * 5 + CINT(I!)) = 0
0142E  GOTO L_14AC
L_1431:
0147A  UnitRockets!(CINT(J!) * 5 + CINT(I!)) = INT((RND * 0.7 + 0.5) * C17Rockets! + 0.5)
0149E  IF NOT ((C25Melee! < 1) OR (RND < 0.5)) THEN GOTO L_14AC
L_14A3:
014A9  UnitWeapon!(CINT(J!) * 5 + CINT(I!)) = 1
L_14AC:
014BB  IF RND * 100 <= C19FlamePct! THEN GOTO L_14E8
L_14C0:
014E2  UnitFlames!(CINT(J!) * 5 + CINT(I!)) = 0
014E5  GOTO L_1565
L_14E8:
01531  UnitFlames!(CINT(J!) * 5 + CINT(I!)) = INT((RND * 0.7 + 0.5) * C21Flames! + 0.5)
01555  IF NOT ((C25Melee! < 1) OR (RND < 0.5)) THEN GOTO L_1565
L_155A:
01562  UnitWeapon!(CINT(J!) * 5 + CINT(I!)) = 2
L_1565:
015AC  UnitMelee!(CINT(J!) * 5 + CINT(I!)) = INT((RND * 0.7 + 0.5) * C25Melee! + 0.5)
015B8  NEXT I!
L_15CB:
015F3  IF (RND * 100 > C22NextPct!) OR (J! = 3) THEN GOTO L_1784
L_15F8:
015FE  NextRec! = C23Next1!
0160C  IF RND >= 0.5 THEN GOTO L_1619
L_1611:
01616  NextRec! = C24Next2!
L_1619:
01626  J! = J! + 1
01633  NGroups! = NGroups! + 1
0163F  IF NextRec! <> EncRec! THEN GOTO L_164A
L_1644:
01644  GOSUB SUB_1669
01647  GOTO L_0FCF
L_164A:
01650  EncRec! = NextRec!
0165B  IF EncRec! >= EncPos! THEN GOTO L_0E7D
L_1660:
01663  CLOSE #1
01666  GOTO L_0E5A
SUB_1669:
01694  GrpName$(CINT(J!)) = GrpName$(CINT(J! - 1))
016A6  GrpToHitMod!(CINT(J!)) = GrpToHitMod!(CINT(J! - 1))
016B9  GrpSpeed!(CINT(J!)) = GrpSpeed!(CINT(J! - 1))
016CB  GrpTactic!(CINT(J!)) = GrpTactic!(CINT(J! - 1))
016DE  GrpPortrait!(CINT(J!)) = GrpPortrait!(CINT(J! - 1))
016F0  GrpCol11!(CINT(J!)) = GrpCol11!(CINT(J! - 1))
01703  GrpValue!(CINT(J!)) = GrpValue!(CINT(J! - 1))
01715  GrpStrength!(CINT(J!)) = GrpStrength!(CINT(J! - 1))
01728  GrpCol14!(CINT(J!)) = GrpCol14!(CINT(J! - 1))
0173A  GrpMeleeDmg!(CINT(J!)) = GrpMeleeDmg!(CINT(J! - 1))
0174D  GrpRocketDmg!(CINT(J!)) = GrpRocketDmg!(CINT(J! - 1))
0175F  GrpFlameDmg!(CINT(J!)) = GrpFlameDmg!(CINT(J! - 1))
01772  GrpMeleeRange!(CINT(J!)) = GrpMeleeRange!(CINT(J! - 1))
01780  GrpAttackVerb!(CINT(J!)) = GrpAttackVerb!(CINT(J! - 1))
01783  RETURN   'with FAC = J! - 1
L_1784:
01787  CLOSE #1
01790  GrpX!(5) = 33
01799  GrpY!(5) = 12
0179C  GOTO L_17F5
SUB_179F:
017F4  RETURN   'with FAC = SQR((GrpX!(CINT(DistA!)) - (GrpX!(CINT(DistB!)))) ^ 2 + (GrpY!(CINT(DistA!)) - (GrpY!(CINT(DistB!)))) ^ 2)
L_17F5:
017F5  GOTO L_1838
SUB_17F8:
01837  RETURN   'with FAC = ABS(FNDist(FnGrp1!, 5) * 10 - (WepReach! * 2) < 7)
L_1838:
01838  GOTO L_1872
SUB_183B:
01871  RETURN   'with FAC = ABS(FNDist(FnGrp2!, 5) * 10 - WepReach! < 7)
L_1872:
01872  GOTO L_18D2
SUB_1875:
018D1  RETURN   'with FAC = Map%(CINT(INT((GrpX!(CINT(FnSlot!))) * 0.5 - 12)) + CINT(INT((GrpY!(CINT(FnSlot!))) * 0.5 - 1.5)) * 9)
L_18D2:
018D2  GOTO L_192F
SUB_18D5:
0192E  RETURN   'with FAC = ABS((GrpY!(CINT(FnSlot2!)) > 18) OR ((GrpY!(CINT(FnSlot2!)) < 5) OR ((GrpX!(CINT(FnSlot2!)) < 26) OR (GrpX!(CINT(FnSlot2!)) > 39))))
L_192F:
0192F  GOTO L_1954
SUB_1932:
01953  RETURN   'with FAC = ABS(FNMap(FnSlot3!) <> 3)
L_1954:
0195A  IF UseEGA! <> 0 THEN GOTO L_1996
L_195F:
01990  BLOAD Drive$ + "BIGSH" + STR$(-GrpPortrait!(0)) + ".BAS", &H942E
01993  GOTO L_19C0
L_1996:
019BD  BLOAD "BIGSH" + STR$(-GrpPortrait!(0)) + ".EGA", &H8052
L_19C0:
019C9  IF UseEGA! <> 1 THEN GOTO L_19E6
L_19CE:
019E0  BLOAD Drive$ + "PLBTSH.EGA", &HAC70
019E3  GOTO L_19FB
L_19E6:
019F8  BLOAD Drive$ + "plbtsh.bas", &HAC70
L_19FB:
01A01  SquadMove! = 30
01A0A  FOR M! = 1 TO 6
L_1A0E:
01A26  IF FNCrew(M!, 31) <= 0 THEN GOTO L_1A41
L_1A2B:
01A2B  GOSUB SUB_92AE
01A37  IF SquadMove! <= Tmp! THEN GOTO L_1A41
L_1A3C:
01A3E  SquadMove! = Tmp!
L_1A41:
01A4A  NEXT M!
01A75  SquadMove! = INT(SquadMove! / 5 + 0.5)
01A80  IF SquadMove! >= 1 THEN GOTO L_1A8A
L_1A85:
01A87  SquadMove! = 1
L_1A8A:
01A93  LOCATE 23, 1
01A96  PRINT "Squad movement:"; SquadMove!; "squares per turn"
01AB4  MoveDY!(0) = -1
01ABF  MoveDX!(1) = 1
01AC5  MoveDY!(2) = 1
01ACD  MoveDX!(3) = -1
01AD6  FOR I! = 0 TO 10
L_1ADA:
01AEC  READ CmdName$(CINT(I!))
01AF7  NEXT I!
01B0E  DelayUnits! = 6
01B17  DelayBase! = StdDelay!
01B20  FOR I! = 0 TO 4
L_1B24:
01B2A  FOR J! = 0 TO 2
L_1B2E:
01B4F  READ CommMood!(CINT(I!) + CINT(J!) * 5)
01B5B  NEXT J!
01B71  FOR J! = 0 TO 8
L_1B74:
01B95  READ CommRatio!(CINT(I!) + CINT(J!) * 5)
01BA1  NEXT J!
01BB7  FOR J! = 0 TO 3
L_1BBA:
01BDB  READ CommObjective!(CINT(I!) + CINT(J!) * 5)
01BE7  NEXT J!
01C00  NEXT I!
L_1C13:
01C1B  CommState! = 2
01C24  Attacked! = 0
01C2A  N_C936! = 0
01C33  PortGroup! = -1
01C3C  Surrendered! = 0
01C45  FOR I! = 1 TO 6
L_1C48:
01C4E  K! = I!
01C51  GOSUB SUB_2263
01C6C  WepSlot! = FNCrew(I!, 32)
01C8D  IF NOT ((WepSlot! > 25) OR (WepSlot! < 1)) THEN GOTO L_1C9D
L_1C92:
01C97  WepSlot! = 0
01C9A  GOTO L_1D1D
L_1C9D:
01CB1  WeaponRec! = WepSlot! * 12 + 788
01D10  IF NOT ((G!(CINT(WeaponRec! + 9)) <> I! + 2) OR ((G!(CINT(WeaponRec!)) > 54) OR (G!(CINT(WeaponRec!)) < 1))) THEN GOTO L_1D1D
L_1D15:
01D1A  WepSlot! = 0
L_1D1D:
01D42  G!(CINT(FNIdx(I!, 32))) = WepSlot!
01D45  GOSUB SUB_21E6
01D51  NEXT I!
L_1D64:
01D6D  IF Atmos! = 1 THEN GOTO L_1F77
L_1D72:
01D7B  LOCATE 24, 1
01D7E  PRINT "Squad members with oxygen:";
01D90  FOR K! = 2300 TO 2597
L_1D94:
01DB3  I! = G!(CINT(K! + 2)) - 2
01DBB  IF I! < 0 THEN GOTO L_1E89
L_1DC0:
01DD6  IF G!(CINT(K!)) <> 10 THEN GOTO L_1E03
L_1DDB:
01E00  G!(CINT(FNIdx(I!, 33))) = 1
L_1E03:
01E19  IF G!(CINT(K!)) <> 8 THEN GOTO L_1E46
L_1E1E:
01E43  G!(CINT(FNIdx(I!, 56))) = 1
L_1E46:
01E5C  IF G!(CINT(K!)) <> 9 THEN GOTO L_1E89
L_1E61:
01E86  G!(CINT(FNIdx(I!, 40))) = 1
L_1E89:
01E92  NEXT K! STEP 3
L_1EA5:
01EAB  FOR I! = 1 TO 6
L_1EAE:
01F04  Flag! = (FNCrew(I!, 33) * FNCrew(I!, 56)) * FNCrew(I!, 40)
01F07  GOSUB SUB_21E6
01F2F  G!(CINT(FNIdx(I!, 40))) = Flag!
01F38  IF Flag! <> 1 THEN GOTO L_1F5B
L_1F3D:
01F3D  PRINT CHR$(CINT(I! + 48)); " ";
L_1F5B:
01F64  NEXT I!
L_1F77:
01F7D  FOR M! = 1 TO 6
L_1F80:
01F98  WepType! = FNCrew(M!, 32)
01FA0  IF WepType! = 0 THEN GOTO L_20D0
L_1FA5:
01FB7  WeaponRec! = WepType! * 12 + 788
01FCE  AmmoType! = G!(CINT(WeaponRec!))
02001  IF (G!(CINT(WeaponRec! + 3)) <> 0) OR (AmmoType! < 1) THEN GOTO L_20D0
L_2006:
02012  OwnerCode! = M! + 2
0201B  FOR J! = 1100 TO 1397
L_201E:
02067  IF NOT ((G!(CINT(J! + 2)) = OwnerCode!) AND (G!(CINT(J!)) = AmmoType!)) THEN GOTO L_20B4
L_206C:
02071  G!(CINT(J!)) = 0
02079  J! = 9999
020B1  G!(CINT(WeaponRec! + 3)) = G!(CINT(WeaponRec! + 4))
L_20B4:
020BD  NEXT J! STEP 3
L_20D0:
02113  G!(CINT(FNIdx(M!, 51))) = FNCrew(M!, 15)
02167  G!(CINT(FNIdx(M!, 52))) = INT(FNCrew(M!, 5) / 20)
021B5  G!(CINT(FNIdx(M!, 53))) = INT(FNCrew(M!, 5) / 33)
021C1  NEXT M!
L_21D4:
021DD  LOCATE 25, 1
021E0  GOSUB SUB_2C63
021E3  GOTO L_22AC
SUB_21E6:
0220D  G!(CINT(FNIdx(I!, 33))) = 0
02237  G!(CINT(FNIdx(I!, 56))) = 0
0225F  G!(CINT(FNIdx(I!, 40))) = 0
02262  RETURN   'with FAC = FNIdx(I!, 40)
SUB_2263:
022A8  G!(CINT(FNIdx(K!, 58))) = FNCrew(K!, 8) * 3
022AB  RETURN   'with FAC = FNCrew(K!, 8) * 3
L_22AC:
022AF  CLS
022CC  LINE (2, 0)-(4, 1), , BF
022E7  LINE (3, 2)-(3, 5)
02301  LINE (0, 3)-(6, 3)
0231F  LINE (1, 7)-(3, 5)
02334  LINE (1, 7)-(5, 7)
0234E  GET (0, 0)-(7, 7), SquadIcon
02354  CLS
02374  LINE (1, 1)-(318, 198), 2, B
02392  LINE (2, 2)-(317, 197), 2, B
023AD  LINE (0, 0)-(319, 199), 2, B
023CD  LINE (5, 5)-(98, 82), 2, B
023EA  LINE (6, 6)-(97, 81), 2, B
0240B  LINE (7, 6)-(96, 81), 2, B
02427  LINE (7, 24)-(96, 24), 2
02448  LINE (197, 29)-(314, 146), 2, B
02467  LINE (198, 30)-(313, 145), 2, B
02486  LINE (199, 31)-(312, 144), 2, B
024A7  LINE (5, 149)-(314, 194), 2, B
024C6  LINE (6, 150)-(313, 193), 2, B
024E5  LINE (7, 151)-(312, 192), 2, B
024E8  GOTO L_2719
L_24EB:
024F1  FOR I! = 1 TO 4
L_24F4:
0250E  LOCATE CINT(I! * 2 + 2), 14
02511  PRINT CHR$(CINT(I! + 64))
02530  NEXT I!
02549  LOCATE 2, 16
0254C  PRINT "1 2 3 4 5"
02573  GET (103, 6)-(194, 82), MapSave
02576  GOTO L_260F
L_2579:
02582  LOCATE 12, 5
02585  PRINT "Name    HP  Cond A:R"
025AC  GET (8, 88)-(191, 95), HdrSave
025AF  GOTO L_2667
L_25B2:
025D1  LINE (197, 5)-(314, 26), 2, BF
025DA  IF UseEGA! <> 0 THEN GOTO L_25F6
L_25DF:
025F0  PUT (215, 6), Logo, AND
025F3  GOTO L_260C
L_25F6:
02609  PUT (215, 10), BoxSave, PSET   'dynamic array (descriptor)
L_260C:
0260C  GOTO L_2579
L_260F:
0262E  LINE (101, 5)-(194, 82), 2, BF
0264D  LINE (112, 16)-(191, 79), 0, BF
02661  PUT (102, 5), MapSave, OR   'dynamic array (descriptor)
02664  GOTO L_26BF
L_2667:
02686  LINE (5, 85)-(194, 146), 2, BF
026A5  LINE (8, 96)-(191, 143), 0, BF
026B9  PUT (8, 87), HdrSave, OR   'dynamic array (descriptor)
026BC  GOTO L_24EB
L_26BF:
026C5  FOR I! = 1 TO 6
L_26C8:
026DE  LOCATE CINT(I! + 12), 2
026E1  PRINT CHR$(CINT(I! + 48)); ">"
02706  NEXT I!
02716  GOTO L_286F
L_2719:
02729  BarColor! = 3 - (UseEGA! * 2)
0274E  LINE (3, 3)-(316, 4), CINT(BarColor!), BF
02771  LINE (3, 195)-(316, 196), CINT(BarColor!), BF
02791  LINE (3, 147)-(316, 148), CINT(BarColor!), BF
027B6  LINE (3, 83)-(194, 84), CINT(BarColor!), BF
027D9  LINE (197, 27)-(314, 28), CINT(BarColor!), BF
027FE  LINE (3, 5)-(4, 194), CINT(BarColor!), BF
02821  LINE (315, 5)-(316, 194), CINT(BarColor!), BF
02846  LINE (99, 5)-(100, 82), CINT(BarColor!), BF
02869  LINE (195, 5)-(196, 146), CINT(BarColor!), BF
0286C  GOTO L_25B2
L_286F:
0286F  GOSUB SUB_9B06
02872  GOSUB SUB_2C93
02881  GrpMax5! = NGroups! - 1
0288A  FOR Grp! = 0 TO GrpMax5!
L_288E:
028A7  UnitMax3! = GrpSize!(CINT(Grp!)) - 1
028B0  FOR Unit! = 0 TO UnitMax3!
L_28B4:
028B4  GOSUB SUB_9F76
028C0  NEXT Unit!
028D9  NEXT Grp!
028E9  GOSUB SUB_96FC
028EC  GOSUB SUB_2D98
0290A  GET (200, 32)-(311, 143), HdrSave
0290D  GOSUB SUB_4E3D
02910  GOTO L_70F6
SUB_2913:
02913  GOSUB SUB_9B06
02922  DelayN1! = Delay! * 0.6
0292B  FOR OwnerCode2! = 1 TO DelayN1!
L_292E:
02937  NEXT OwnerCode2!
02947  GOSUB SUB_9B06
02956  DelayN2! = Delay! * 0.5
0295F  FOR OwnerCode2! = 1 TO DelayN2!
L_2962:
0296B  NEXT OwnerCode2!
0297B  GOSUB SUB_9B06
0297E  RETURN
02988  LOCATE 24, 2
0298B  PRINT "Select Option";
02997  GOSUB SUB_2DBF
0299A  RETURN
SUB_299B:
029B0  Delta! = CreditsHi! * 30000 + CreditsLo! + Delta!
029BB  IF Delta! <= 9999999 THEN GOTO L_29C5
L_29C0:
029C2  Delta! = 9999999
L_29C5:
029D5  CreditsHi! = Delta! / 30000
029E7  CreditsLo! = Delta! - (CreditsHi! * 30000)
029EA  RETURN   'with FAC = CreditsLo!
SUB_29EB:
02A01  LOCATE CINT(I! + 12), 22
02A1D  WepSlot! = FNCrew(I!, 32)
02A31  WeaponRec! = WepSlot! * 12 + 788
02A48  WepType! = G!(CINT(WeaponRec!))
02A63  WepOwner! = G!(CINT(WeaponRec! + 9))
02A72  M! = I! + 2
02AA5  IF NOT ((WepSlot! < 1) OR ((WepType! < 1) OR (WepOwner! <> M!))) THEN GOTO L_2AB7
L_2AAA:
02AAA  PRINT "Hnd";
02AB6  RETURN   'with FAC = M!
L_2AB7:
02AD0  Ammo! = G!(CINT(WeaponRec! + 3))
02ADB  IF Ammo! <= 9 THEN GOTO L_2AE5
L_2AE0:
02AE2  Ammo! = 9
L_2AE5:
02AEB  IF Ammo! >= 0 THEN GOTO L_2AFD
L_2AF0:
02AF0  PRINT "Brk";
02AFC  RETURN
L_2AFD:
02B03  Reloads! = 0
02B0C  FOR Tmp! = 1100 TO 1397
L_2B10:
02B60  Reloads! = (G!(CINT(Tmp!)) = WepType!) * (G!(CINT(Tmp! + 2)) = M!) + Reloads!
02B6B  NEXT Tmp! STEP 3
02B84  IF Reloads! <= 9 THEN GOTO L_2B8E
L_2B89:
02B8B  Reloads! = 9
L_2B8E:
02B8E  PRINT CHR$(CINT(Ammo! + 48)); ":"; CHR$(CINT(Reloads! + 48));
02BBB  RETURN   'with FAC = Reloads! + 48
SUB_2BBC:
02BBC  PRINT Prompt$;
L_2BC8:
02BCE  K$ = INKEY$
02BD9  IF K$ <> "" THEN GOTO L_2BE3
L_2BDE:
02BDE  GOSUB SUB_9B06
02BE1  GOTO L_2BC8
L_2BE3:
02BEF  I! = ASC(K$)
02BFA  IF I! <> 13 THEN GOTO L_2C09
L_2BFF:
02C05  M! = 0
02C08  RETURN   'with FAC = I!
L_2C09:
02C28  IF NOT ((I! < 55) AND (I! > 48)) THEN GOTO L_2C3A
L_2C2D:
02C36  M! = I! - 48
02C39  RETURN   'with FAC = M!
L_2C3A:
02C3A  GOTO L_2BC8
SUB_2C3C:
02C42  FOR DelayUnits! = 1 TO 5
L_2C46:
02C46  GOSUB SUB_2913
02C52  NEXT DelayUnits!
02C62  RETURN
SUB_2C63:
02C63  PRINT "Press ENTER Key";
L_2C6F:
02C75  K$ = INKEY$
02C80  IF K$ = "" THEN GOTO L_2C6F
02C90  IF CHR$(13) <> K$ THEN GOTO L_2C6F
02C92  RETURN
SUB_2C93:
02C99  EquipHit! = 1
02CA2  FOR I! = 1 TO 6
L_2CA6:
02CA6  GOSUB SUB_2CF3
02CD6  EquipHit! = (ABS(FNCrew(I!, 31) = 0)) * EquipHit!
02CE2  NEXT I!
02CF2  RETURN
SUB_2CF3:
02D01  Half! = I! + 12
02D13  LOCATE CINT(Half!), 4
02D16  PRINT CrewName$(CINT(I!))
02D34  LOCATE CINT(Half!), 12
02D37  PRINT FNCrew(I!, 15); " "
02D6B  LOCATE CINT(Half!), 17
02D6E  PRINT Status$(CINT(FNCrew(I!, 31)))
02D97  RETURN   'with FAC = FNCrew(I!, 31)
SUB_2D98:
02D9E  FOR I! = 1 TO 6
L_2DA2:
02DA2  GOSUB SUB_29EB
02DAE  NEXT I!
02DBE  RETURN
SUB_2DBF:
02DC5  K$ = INKEY$
02DC8  GOSUB SUB_9B06
02DD4  IF K$ = "" THEN GOTO L_2DBF
02DE2  Cmd! = ASC(K$)
02DED  IF Cmd! <= 95 THEN GOTO L_2DFD
L_2DF2:
02DFA  Cmd! = Cmd! - 32
L_2DFD:
02E08  Cmd! = Cmd! - 64
02E45  IF NOT (((Cmd! <= CmdMax!) AND (Cmd! >= CmdMin!)) OR ((Cmd! = -51) OR (Cmd! = -32))) THEN GOTO L_2E4B
L_2E4A:
02E4A  RETURN   'with FAC = Cmd!
L_2E4B:
02E4B  GOTO L_2DBF
SUB_2E4E:
02E54  K$ = INKEY$
02E57  GOSUB SUB_9B06
02E63  IF K$ = "" THEN GOTO L_2E4E
02E70  IF LEN(K$) <= 1 THEN GOTO L_2EAD
L_2E75:
02E89  Cmd! = ASC(RIGHT$(K$, 1)) - 70
02EAA  IF ((Cmd! > 11) OR (Cmd! < 1)) THEN GOTO L_2E4E
02EAC  RETURN   'with FAC = Cmd!
L_2EAD:
02EBC  Cmd! = ASC(K$) - 53
02EC7  IF Cmd! <= 43 THEN GOTO L_2ED7
L_2ECC:
02ED4  Cmd! = Cmd! - 32
L_2ED7:
02EF6  IF (Cmd! > 37) OR (Cmd! < 12) THEN GOTO L_2E4E
L_2EFB:
02EFB  RETURN
SUB_2EFC:
02F1A  LINE (8, 152)-(311, 191), 0, BF
02F1D  RETURN
SUB_2F1E:
02F3C  LINE (8, 160)-(311, 191), 0, BF
02F3F  RETURN
SUB_2F40:
02F5E  LINE (8, 176)-(311, 191), 0, BF
02F61  RETURN
02F80  LINE (200, 32)-(311, 143), 0, BF
02F83  RETURN
02FA2  LINE (200, 40)-(311, 143), 0, BF
02FA5  RETURN
SUB_2FA6:
02FAC  MaxLen! = 4
SUB_2FAF:
02FBA  Col! = POS(0)
02FC6  Row! = CSRLIN
02FCF  K$ = ""
L_2FD2:
02FF2  LOCATE CINT(Row!), CINT(Col!), 1, 0, 7
02FF5  PRINT K$; " ";
L_3007:
0300D  Ch$ = INKEY$
03018  IF Ch$ = "" THEN GOTO L_3007
03026  I! = ASC(Ch$)
03031  IF I! = 13 THEN GOTO L_30F5
L_3036:
0305B  IF NOT ((LEN(K$) > 0) AND (I! = 8)) THEN GOTO L_3077
L_3060:
03071  K$ = LEFT$(K$, LEN(K$) - 1)
03074  GOTO L_2FD2
L_3077:
030A7  IF ((I! > 57) OR (I! < 48)) AND (MaxLen! = 4) THEN GOTO L_2FD2
L_30AC:
030CB  IF (I! > 126) OR (I! < 32) THEN GOTO L_3007
L_30D0:
030DF  IF LEN(K$) >= MaxLen! THEN GOTO L_3007
L_30E4:
030EF  K$ = K$ + Ch$
030F2  GOTO L_2FD2
L_30F5:
03100  InputVal% = CINT(VAL(K$))
03103  RETURN   'with FAC = VAL(K$)
0310A  Flag! = 0
03113  FOR I! = 2300 TO 2597
L_3116:
03130  IF G!(CINT(I!)) <> ItemType! THEN GOTO L_314E
L_3135:
0313A  ItemRec! = I!
03143  Flag! = 1
0314B  I! = 2600
L_314E:
03157  NEXT I! STEP 3
03167  RETURN
03168  GOSUB SUB_2EFC
03174  LOCATE 20, 2
03177  PRINT "Can Not Carry Anymore Of That"
03183  GOSUB SUB_2C3C
03186  RETURN
03187  GOSUB SUB_2EFC
03193  LOCATE 20, 2
03196  PRINT "Can Not Afford It"
031A2  GOSUB SUB_2C3C
031A5  RETURN
0320E  G!(CINT(FNIdx(M!, 16))) = (FNCrew(M!, 0) + FNCrew(M!, 4)) * 0.25
03285  G!(CINT(FNIdx(M!, 10))) = (FNCrew(M!, 2) * 2 + FNCrew(M!, 3)) / 6 - 25
032D3  G!(CINT(FNIdx(M!, 11))) = FNCrew(M!, 1) * 0.5 - 25
03325  G!(CINT(FNIdx(M!, 13))) = FNCrew(M!, 0) / 3 + 10
03392  G!(CINT(FNIdx(M!, 12))) = (FNCrew(M!, 0) + FNCrew(M!, 1)) / 20 + 15
033AD  DbgEsper! = FNCrew(M!, 27)
033E5  G!(CINT(FNIdx(M!, 51))) = DbgEsper! * 15
0342C  G!(CINT(FNIdx(M!, 52))) = ABS(DbgEsper! > 2)
03473  G!(CINT(FNIdx(M!, 53))) = ABS(DbgEsper! > 4)
034B6  G!(CINT(FNIdx(M!, 54))) = ABS(DbgEsper! > 5)
034B9  RETURN   'with FAC = ABS(DbgEsper! > 5)
SUB_34BA:
034C0  K$ = INKEY$
034C3  GOSUB SUB_9B06
034E5  IF NOT ((K$ = "Y") OR (K$ = "y")) THEN GOTO L_34F4
L_34EA:
034F0  YesNo! = 1
034F3  RETURN
L_34F4:
03513  IF NOT ((K$ = "N") OR (K$ = "n")) THEN GOTO L_3522
L_3518:
0351E  YesNo! = 0
03521  RETURN
L_3522:
03522  GOTO L_34BA
0352A  MaxLen! = 3
0352D  PRINT "(yes/no) ";
03539  GOSUB SUB_2FAF
03542  YesNo! = 0
03564  IF NOT ((K$ = "YES") OR (K$ = "yes")) THEN GOTO L_356F
L_3569:
0356C  YesNo! = 1
L_356F:
0356F  RETURN
L_3570:
03576  CreditsGained! = 0
03579  GOSUB SUB_2D98
0357C  GOSUB SUB_3D68
03585  IF ActiveGroups! = 0 THEN GOTO L_3CE7
L_358A:
03596  ON CINT(CommState! + 1) GOTO L_3D65, L_37C5, L_35A0
L_35A0:
035A0  GOSUB SUB_2EFC
035AC  LOCATE 22, 2
035AF  PRINT "Establish communications? (y/n)";
035BB  GOSUB SUB_34BA
035C4  IF YesNo! = 0 THEN GOTO L_3D65
L_35C9:
035C9  GOSUB SUB_2EFC
035D5  LOCATE 22, 2
035DE  Flag! = 0
035E7  FOR I! = 1 TO 6
L_35EA:
03638  IF RND * 100 >= (FNCrew(I!, 23) * (SGN(FNCrew(I!, 31)))) * 10 THEN GOTO L_3646
L_363D:
03643  Flag! = I!
L_3646:
0364F  NEXT I!
03665  FOR I! = 1 TO 6
L_3668:
0370C  IF NOT ((FNCrew(I!, 27) > 3) AND ((FNCrew(I!, 5) > 49) AND (RND * 100 < FNCrew(I!, 5) * (SGN(FNCrew(I!, 31)))))) THEN GOTO L_3720
L_3711:
0371D  Flag! = I! + 6
L_3720:
03729  NEXT I!
L_373C:
03745  IF Flag! < 1 THEN GOTO L_37AA
L_374A:
03753  IF Flag! >= 7 THEN GOTO L_3775
L_3758:
03758  PRINT CrewName$(CINT(Flag!)); " translates"
03772  GOTO L_3798
L_3775:
03775  PRINT CrewName$(CINT(Flag! + -6)); " uses ESP"
L_3798:
0379E  CommState! = 1
037A1  GOSUB SUB_2C3C
037A4  GOSUB SUB_2C3C
037A7  GOTO L_37C5
L_37AA:
037B0  CommState! = 0
037B3  PRINT "Attempt fails"
037BF  GOSUB SUB_2C3C
037C2  GOTO L_3D65
L_37C5:
037C5  GOSUB SUB_2EFC
037D1  LOCATE 20, 7
037D4  PRINT "Communications Phase"
037EB  LOCATE 21, 2
037EE  PRINT "A-Plead"
03804  LOCATE 22, 2
03807  PRINT "B-Ask"
0381C  LOCATE 23, 2
0381F  PRINT "C-Demand"
03833  LOCATE 21, 13
03836  PRINT "D-Bargain/Bribe"
0384B  LOCATE 22, 13
0384E  PRINT "E-Impersonate Diety"
03861  LOCATE 23, 13
03864  PRINT "F-None"
03879  LOCATE 24, 2
0387C  PRINT "Choose An Approach: (A-F)";
0388E  CmdMin! = 1
03897  CmdMax! = 6
L_389A:
0389A  GOSUB SUB_2DBF
038A3  IF Cmd! < 0 THEN GOTO L_389A
038B1  Approach! = Cmd! - 1
038BC  IF Approach! = 5 THEN GOTO L_3D65
L_38C1:
038CA  IF Approach! <> 3 THEN GOTO L_38DB
L_38CF:
038D5  Objective! = 1
038D8  GOTO L_396D
L_38DB:
038DB  GOSUB SUB_2F1E
038E9  LOCATE 21, 2
038F3  LOCATE 21, 2
038F6  PRINT "A-Truce"
0390A  LOCATE 22, 2
0390D  PRINT "B-Tribute"
03921  LOCATE 23, 2
03924  PRINT "C-Surrender"
03938  LOCATE 24, 2
0393B  PRINT "Choose An Objective: (A-C)";
L_3947:
0394D  CmdMin! = 1
03956  CmdMax! = 3
03959  GOSUB SUB_2DBF
03962  IF Cmd! < 0 THEN GOTO L_3947
0396A  Objective! = Cmd!
L_396D:
03973  Offer! = 50
03981  IF Approach! <> 4 THEN GOTO L_39A0
L_3986:
0399D  Offer! = (C7Mood! < 4) * -40
L_39A0:
039A0  GOSUB SUB_3D68
039A3  GOSUB SUB_3FB9
039B4  Bucket! = SquadStr! - EnemyStr!
039BC  IF Bucket! <= 0 THEN GOTO L_39CE
L_39C1:
039C8  Bucket! = Bucket! / EnemyStr!
039CB  GOTO L_39DC
L_39CE:
039D9  Bucket! = Bucket! / SquadStr!
L_39DC:
03A58  Bucket! = 0 - (Bucket! > -1) - (Bucket! > -0.5) - (Bucket! > -0.25) - (Bucket! > -0.05) - (Bucket! > 0.05) - (Bucket! > 0.25) - (Bucket! > 0.5) - (Bucket! > 1)
03A7A  IF NOT ((C8Hostile! = 1) AND (Attacked! = 1)) THEN GOTO L_3A87
L_3A7F:
03A84  C8Hostile! = 3
L_3A87:
03B05  Offer! = ((CommMood!(CINT(Approach!) + CINT(C8Hostile! - 1) * 5)) * (CommRatio!(5 * CINT(Bucket!) + CINT(Approach!)))) * Offer! + CommObjective!(CINT(Objective!) * 5 + CINT(Approach!))
03B08  GOSUB SUB_2EFC
03B14  LOCATE 22, 2
03B29  Tmp! = RND * 150 - Offer!
03B31  IF Tmp! < 0 THEN GOTO L_3BB3
L_3B36:
03B65  ON 1 - (Offer! < -20) - (Offer! < 0) - (Offer! < 20) GOTO L_3B77, L_3B86, L_3B95, L_3BA4
03B71  GOSUB SUB_3D68
03B74  GOSUB SUB_3FB9
L_3B77:
03B77  PRINT "They respectfully decline"
03B83  GOTO L_40D1
L_3B86:
03B86  PRINT "They refuse your offer"
03B92  GOTO L_40D1
L_3B95:
03B95  PRINT "They are insulted by your offer"
03BA1  GOTO L_40D1
L_3BA4:
03BA4  PRINT "They laugh in your face"
03BB0  GOTO L_40D1
L_3BB3:
03BB9  ON CINT(Objective!) GOTO L_3BC3, L_3C7A, L_3CC6
L_3BC3:
03BCC  IF Approach! = 3 THEN GOTO L_3BEF
L_3BD1:
03BD1  PRINT "They agree to a truce"
03BE3  NewState! = 2
03BE6  GOSUB SUB_407B
03BE9  GOSUB SUB_2C3C
03BEC  GOTO L_410E
L_3BEF:
03BF5  Delta! = 0
03BF8  GOSUB SUB_299B
03BFB  GOSUB SUB_3D02
03C0F  EnemyValue! = INT(EnemyValue! * 0.5)
03C1B  LOCATE 21, 2
03C1E  PRINT "They accept"; EnemyValue!; "credits"
03C3C  LOCATE , 2
03C3F  PRINT "as payment for a truce"
03C54  Delta! = -EnemyValue!
03C5C  CreditsGained! = Delta!
03C5F  GOSUB SUB_299B
03C62  GOSUB SUB_2C3C
03C65  GOSUB SUB_2C3C
03C68  GOSUB SUB_2C3C
03C71  NewState! = 2
03C74  GOSUB SUB_407B
03C77  GOTO L_410E
L_3C7A:
03C7A  GOSUB SUB_3D02
03C8F  Delta! = INT(EnemyValue! * 0.5)
03C97  CreditsGained! = Delta!
03C9A  PRINT "They pay"; Delta!; "credits"
03CB1  GOSUB SUB_299B
03CBA  NewState! = 2
03CBD  GOSUB SUB_407B
03CC0  GOSUB SUB_2C3C
03CC3  GOTO L_410E
L_3CC6:
03CC6  PRINT "They surrender"
03CD8  NewState! = 1
03CDE  Surrendered! = 1
03CE1  GOSUB SUB_407B
03CE4  GOSUB SUB_2C3C
L_3CE7:
03CE7  GOSUB SUB_3D02
03CF0  Delta! = EnemyValue!
03CF3  GOSUB SUB_299B
03CFC  CreditsGained! = EnemyValue!
03CFF  GOTO L_410E
SUB_3D02:
03D08  EnemyValue! = 0
03D17  GrpMax! = NGroups! - 1
03D20  FOR I! = 0 TO GrpMax!
L_3D24:
03D49  EnemyValue! = (GrpSize!(CINT(I!))) * (GrpValue!(CINT(I!))) + EnemyValue!
03D54  NEXT I!
03D64  RETURN
L_3D65:
03D65  GOTO L_4554
SUB_3D68:
03D6E  ActiveGroups! = 0
03D7D  GrpMax2! = NGroups! - 1
03D86  FOR I! = 0 TO GrpMax2!
L_3D8A:
03D90  Flag! = 0
03DA4  IF (FNOffMap(I!) = 0) THEN GOTO L_3DDB
L_3DA9:
03DBE  GrpState!(CINT(I!)) = 2
03DCC  GrpX!(CINT(I!)) = 9999
03DD5  GrpY!(CINT(I!)) = 9999
03DD8  GOTO L_3EEB
L_3DDB:
03DF4  UnitMax2! = GrpSize!(CINT(I!)) - 1
03DFD  FOR J! = 0 TO UnitMax2!
L_3E00:
03E39  Flag! = SGN((UnitHP!(CINT(J!) + CINT(I!) * 5)) * (UnitState!(CINT(J!) + CINT(I!) * 5))) + Flag!
03E44  NEXT J!
03E5D  IF Flag! >= 1 THEN GOTO L_3E7A
L_3E62:
03E74  GrpState!(CINT(I!)) = 1
03E77  GOTO L_3EEB
L_3E7A:
03ECC  IF NOT (((GrpSize!(CINT(I!)) > 4) AND (Flag! = 2)) OR ((GrpSize!(CINT(I!)) > 2) AND (Flag! = 1))) THEN GOTO L_3EEB
L_3ED1:
03EDC  GrpState!(CINT(I!)) = 3
03EE8  GrpTactic!(CINT(I!)) = 5
L_3EEB:
03F12  ActiveGroups! = ActiveGroups! - (GrpState!(CINT(I!)) > 2.5)
03F1B  IF I! <> 0 THEN GOTO L_3F38
L_3F20:
03F32  EnemyStr! = GrpStrength!(0) + Flag! * 5
03F35  GOTO L_3F5D
L_3F38:
03F5A  EnemyStr! = ((GrpStrength!(CINT(I!))) * Flag!) * 0.125 + EnemyStr!
L_3F5D:
03F66  NEXT I!
L_3F79:
03F7F  IF ActiveGroups! <> 0 THEN GOTO L_3F8D
L_3F84:
03F8A  Surrendered! = 1
L_3F8D:
03F9E  IF (FNOffMap(5) = 0) THEN GOTO L_3FB8
L_3FA3:
03FA9  NewState! = 2
03FAC  GOSUB SUB_407B
03FB5  ActiveGroups! = 0
L_3FB8:
03FB8  RETURN
SUB_3FB9:
03FBF  SquadStr! = 0
03FC8  FOR I! = 1 TO 6
L_3FCC:
03FE6  IF FNCrew(I!, 31) <= 0 THEN GOTO L_405E
L_3FEB:
0400E  SquadStr! = FNCrew(I!, 15) / 6 + SquadStr!
0402B  WepSlot! = FNCrew(I!, 32)
04033  IF WepSlot! <= 0 THEN GOTO L_405E
L_4038:
0405B  SquadStr! = (G!(CINT(WepSlot! * 12 + 796))) * 2 + SquadStr!
L_405E:
04067  NEXT I!
L_407A:
0407A  RETURN
SUB_407B:
04087  GrpMax3! = NGroups! - 1
04090  FOR I! = 0 TO GrpMax3!
L_4094:
040AA  IF GrpState!(CINT(I!)) <= 2 THEN GOTO L_40B7
L_40AF:
040B4  GrpState!(CINT(I!)) = NewState!
L_40B7:
040C0  NEXT I!
040D0  RETURN
L_40D1:
040FB  IF NOT ((RND * 100 < Tmp!) AND (C8Hostile! > 1)) THEN GOTO L_4108
L_4100:
04105  Attacked! = 1
L_4108:
04108  GOSUB SUB_2C3C
0410B  GOTO L_4554
L_410E:
0410E  GOSUB SUB_2EFC
0411A  LOCATE 22, 12
0411D  PRINT "Battle Over"
04129  GOSUB SUB_2C3C
0412C  GOSUB SUB_2C3C
04132  CLS
04140  LOCATE 1, 14
04143  PRINT "BATTLE REPORT"
04157  LOCATE 3, 1
0415A  PRINT "Credits Gained:"; CreditsGained!
0416C  PRINT ""
04184  GrpMax4! = NGroups! - 1
0418D  FOR I! = 0 TO GrpMax4!
L_4190:
04196  Flag! = 0
041B2  UnitMax! = GrpSize!(CINT(I!)) - 1
041BB  FOR J! = 0 TO UnitMax!
L_41BE:
041EC  Flag! = SGN(UnitHP!(CINT(J!) + CINT(I!) * 5)) + Flag!
041F7  NEXT J!
04207  PRINT ""
04213  PRINT "Group "; CHR$(CINT(I! + 65)); ":"; GrpName$(CINT(I!)); "(s)"
04255  PRINT SPC(9); ""; GrpSize!(CINT(I!)) - Flag!; "killed. ";
04290  IF GrpState!(CINT(I!)) <> 2 THEN GOTO L_42A7
L_4295:
04295  PRINT Flag!; "Survived."
042A4  GOTO L_42C9
L_42A7:
042B3  IF (Flag! = 0) THEN GOTO L_42C9
L_42B8:
042B8  PRINT Flag!; "Surrendered."
L_42C9:
042D2  NEXT I!
L_42E5:
0430D  BattleWon! = ABS((CreditsGained! > 0) OR (Surrendered! > 0))
04319  IF TerrType! <> 10 THEN GOTO L_4321
L_431E:
0431E  GOSUB SUB_436D
L_4321:
04321  GOSUB SUB_9685
0432D  IF EntryMode! <> 1 THEN GOTO L_4341
L_4332:
0433B  CHAIN Drive$ + "SPACE.STR"
0433E  GOTO L_434D
L_4341:
0434A  CHAIN Drive$ + "INSIDE.EXE"
L_434D:
04350  CLS
0435C  LOCATE 13, 12
0435F  PRINT "You Are All Dead"
L_436B:
0436B  GOTO L_436B
SUB_436D:
04373  TowIdx! = KillPtr!
04381  TowPrev! = TowIdx! - 1
04389  IF TowPrev! >= 0 THEN GOTO L_4394
L_438E:
04391  TowPrev! = 49
L_4394:
0439C  IF Surrendered! <> 0 THEN GOTO L_4404
L_43A1:
043BF  Tonnage! = Tonnage! - (G!(CINT(TowIdx! + 260)))
043C8  KillPtr! = TowPrev!
043D8  KillStartAll! = KillStartAll! - 1
043E5  KillStartMission! = KillStartMission! - 1
043F2  KillStartPort! = KillStartPort! - 1
04400  Kills! = Kills! - 1
04403  RETURN   'with FAC = Kills!
L_4404:
04413  IF MissionType! - 10 <> LastEnemyType! THEN GOTO L_441B
L_4418:
04418  GOSUB SUB_A8B8
L_441B:
0442C  IF LastEnemyType! <> MissionCodeA! - 50 THEN GOTO L_4439
L_4431:
04436  MissionCodeA! = 0
L_4439:
0444A  IF LastEnemyType! <> MissionCodeB! - 50 THEN GOTO L_4457
L_444F:
04454  MissionCodeB! = 0
L_4457:
04457  PRINT ""
0446C  IF TowLinkCond! <> 2 THEN GOTO L_447E
L_4471:
04471  PRINT "Tow linkage broken"
0447D  RETURN
L_447E:
04484  SalvageMin! = 999999
0448D  FOR J! = 330 TO 339
L_4490:
044AA  IF G!(CINT(J!)) >= SalvageMin! THEN GOTO L_44BA
L_44AF:
044AF  SalvageMin! = G!(CINT(J!))
044B7  ItemRec! = J!
L_44BA:
044C3  NEXT J!
044D3  PRINT ""
044DF  PRINT "Towing for salvage"
0451D  G!(CINT(ItemRec!)) = G!(CINT(TowIdx! + 260))
04550  G!(CINT(ItemRec! - 10)) = G!(CINT(TowIdx! + 210))
04553  RETURN   'with FAC = TowIdx! + 210
L_4554:
04554  GOSUB SUB_4E3D
0455D  Moved! = 0
04566  FOR K! = 1 TO 6
L_456A:
04612  G!(CINT(FNIdx(K!, 37))) = FNCrew(K!, 37) * (ABS(FNCrew(K!, 37) > 3)) + (FNCrew(K!, 37) < 0)
04647  IF NOT ((FNCrew(K!, 40) = 0) AND (Atmos! = 0)) THEN GOTO L_46AF
L_464C:
046AC  G!(CINT(FNIdx(K!, 58))) = G!(CINT(FNIdx(K!, 58))) - (Fatigue! * 22)
L_46AF:
046B8  NEXT K!
L_46CB:
046D1  FOR Phase! = 1 TO 6
L_46D4:
046DA  Moved! = 0
L_46DD:
046DD  GOSUB SUB_2EFC
046E9  LOCATE 20, 10
046EC  PRINT "Movement Phase"; Phase!
04761  IF (SurpriseCur! = 2) OR (INT((Phase! * SquadMove!) / 6 + 0.5) = INT(((Phase! - 1) * SquadMove!) / 6 + 0.5)) THEN GOTO L_48C6
L_4766:
0476F  LOCATE 22, 2
04772  PRINT "A-Switch Weapons"
04788  LOCATE 23, 2
0478B  PRINT "B-Skip Move"
0479F  LOCATE 24, 2
047A2  PRINT "C-Time Delay";
047C1  PUT (224, 160), Cursor, XOR
L_47C4:
047CA  OldX! = GrpX!(5)
047D3  OldY! = GrpY!(5)
047DC  DX! = 0
047E2  DY! = 0
047E5  GOSUB SUB_2E4E
047EE  ON CINT(Cmd!) GOSUB L_47C4, L_4F47, L_47C4, L_47C4, L_4F53, L_47C4, L_4F6B, L_47C4, L_47C4, L_4F5F, L_47C4, L_4FCC, L_4FCB, L_5438
0482D  IF (Cmd! <> 13) AND (Moved! = 0) THEN GOTO L_46DD
L_4832:
04832  GOSUB SUB_2F1E
0483E  IF Moved! <> 1 THEN GOTO L_48C6
L_4843:
04848  FOR K! = 1 TO 6
L_484C:
048AA  G!(CINT(FNIdx(K!, 58))) = G!(CINT(FNIdx(K!, 58))) - (Fatigue! * 4)
048B6  NEXT K!
L_48C6:
048D2  GrpMax6! = NGroups! - 1
048DB  FOR J! = 0 TO GrpMax6!
L_48DE:
048DE  GOSUB SUB_9B06
048F7  IF GrpState!(CINT(J!)) < 3 THEN GOTO L_4D8D
L_48FC:
0496C  IF (SurpriseCur! = 1) OR (INT(((GrpSpeed!(CINT(J!))) * Phase!) / 6 + 0.5) = INT(((Phase! - 1) * (GrpSpeed!(CINT(J!)))) / 6 + 0.5)) THEN GOTO L_4D8D
L_4971:
04977  BestScore! = 1e+20
04980  BestMove! = 4
04998  GrpX0! = GrpX!(CINT(J!))
049A6  GrpY0! = GrpY!(CINT(J!))
049C4  KeepDist! = 2 ^ (4 - (GrpTactic!(CINT(J!)))) - 1
049CD  FOR Move! = 0 TO 4
L_49D0:
049D0  GOSUB SUB_9B06
04A07  GrpX!(CINT(J!)) = MoveDX!(CINT(Move!)) + GrpX0!
04A23  GrpY!(CINT(J!)) = MoveDY!(CINT(Move!)) + GrpY0!
04A40  Dist! = FNDist(J!, 5)
04A52  IF GrpTactic!(CINT(J!)) >= 4 THEN GOTO L_4A79
L_4A57:
04A76  MoveScore!(CINT(Move!)) = ((Dist! - KeepDist!) ^ 2) * 10
L_4A79:
04A93  IF GrpTactic!(CINT(J!)) <> 4 THEN GOTO L_4ACA
L_4A98:
04AC4  MoveScore!(CINT(Move!)) = FNDist(6, J!)
04AC7  GOTO L_4B5C
L_4ACA:
04AE4  IF GrpTactic!(CINT(J!)) <> 5 THEN GOTO L_4B5C
L_4AE9:
04AF2  IF TerrType! <= 10 THEN GOTO L_4B29
L_4AF7:
04B23  MoveScore!(CINT(Move!)) = FNDist(7, J!)
04B26  GOTO L_4B5C
L_4B29:
04B59  MoveScore!(CINT(Move!)) = -FNDist(8, J!)
L_4B5C:
04B6B  IF FNPassable(J!) <> 0 THEN GOTO L_4B8D
L_4B70:
04B8A  MoveScore!(CINT(Move!)) = MoveScore!(CINT(Move!)) + 1e+20
L_4B8D:
04BCC  IF NOT ((FNOffMap(J!) = 1) AND (GrpTactic!(CINT(J!)) <> 5)) THEN GOTO L_4BEE
L_4BD1:
04BEB  MoveScore!(CINT(Move!)) = MoveScore!(CINT(Move!)) + 1e+20
L_4BEE:
04BFA  GrpMax7! = NGroups! - 1
04C03  FOR OtherGrp! = 0 TO GrpMax7!
L_4C06:
04C0F  IF OtherGrp! = J! THEN GOTO L_4C9C
L_4C14:
04C2C  Dist2! = FNDist(OtherGrp!, J!)
04C47  IF GrpTactic!(CINT(J!)) >= 3 THEN GOTO L_4C71
L_4C4C:
04C6E  MoveScore!(CINT(Move!)) = MoveScore!(CINT(Move!)) - (Dist2! * 3)
L_4C71:
04C7A  IF Dist2! >= 0.9 THEN GOTO L_4C9C
L_4C7F:
04C99  MoveScore!(CINT(Move!)) = MoveScore!(CINT(Move!)) + 1e+20
L_4C9C:
04CA5  NEXT OtherGrp!
L_4CB8:
04CC1  IF Dist! >= 0.9 THEN GOTO L_4CE3
L_4CC6:
04CE0  MoveScore!(CINT(Move!)) = MoveScore!(CINT(Move!)) + 1e+20
L_4CE3:
04CFD  IF MoveScore!(CINT(Move!)) >= BestScore! THEN GOTO L_4D0D
L_4D02:
04D02  BestScore! = MoveScore!(CINT(Move!))
04D0A  BestMove! = Move!
L_4D0D:
04D16  NEXT Move!
L_4D29:
04D32  IF BestMove! = 4 THEN GOTO L_4D8D
L_4D37:
04D3F  Moved! = 1
04D73  GrpX!(CINT(J!)) = MoveDX!(CINT(BestMove!)) + GrpX0!
04D8A  GrpY!(CINT(J!)) = MoveDY!(CINT(BestMove!)) + GrpY0!
L_4D8D:
04D96  NEXT J!
L_4DA9:
04DAF  IF Moved! <= 0 THEN GOTO L_4DB7
L_4DB4:
04DB4  GOSUB SUB_4E3D
L_4DB7:
04DB7  GOSUB SUB_3D68
04DC0  IF ActiveGroups! <> 0 THEN GOTO L_4DCE
L_4DC5:
04DCB  Phase! = 99
L_4DCE:
04DD7  NEXT Phase!
L_4DEA:
04DF3  IF Phase! < 90 THEN GOTO L_54C1
L_4DF8:
04E09  IF FNOffMap(5) <> 0 THEN GOTO L_410E
L_4E0E:
04E14  Surrendered! = 1
04E17  GOSUB SUB_3D02
04E2C  Delta! = INT(RND * EnemyValue!)
04E34  CreditsGained! = Delta!
04E37  GOSUB SUB_299B
04E3A  GOTO L_410E
SUB_4E3D:
04E50  PUT (200, 32), HdrSave, PSET   'dynamic array (descriptor)
04E59  MinusOne! = -1
04E64  FOR I! = NGroups! - 1 TO 0
L_4E68:
04E74  NewState! = I! + 65
04E77  GOSUB SUB_4EF7
04E83  NEXT I! STEP MinusOne!
L_4EA6:
04ED5  PUT (GrpX!(5) * 8 - 8, GrpY!(5) * 8 - 8), SquadIcon, PSET
04EF3  GET (192, 24)-(319, 151), MapSave
04EF6  RETURN   'with FAC = GrpX!(5) * 8 - 8
SUB_4EF7:
04F08  IF (FNOffMap(I!) = 0) THEN GOTO L_4F0E
L_4F0D:
04F0D  RETURN   'with FAC = FNOffMap(I!)
L_4F0E:
04F31  LOCATE CINT(GrpY!(CINT(I!))), CINT(GrpX!(CINT(I!)))
04F34  PRINT CHR$(CINT(NewState!));
04F46  RETURN
L_4F47:
04F4D  DY! = -1
04F50  GOTO L_4F74
L_4F53:
04F59  DX! = -1
04F5C  GOTO L_4F74
L_4F5F:
04F65  DY! = 1
04F68  GOTO L_4F74
L_4F6B:
04F71  DX! = 1
L_4F74:
04F7F  GrpX!(5) = GrpX!(5) + DX!
04F8D  GrpY!(5) = GrpY!(5) + DY!
04F96  Moved! = 1
04FA8  IF FNPassable(5) <> 0 THEN GOTO L_4FCB
L_4FAD:
04FB3  GrpX!(5) = OldX!
04FBC  GrpY!(5) = OldY!
04FC5  Moved! = 0
04FC8  BEEP
L_4FCB:
04FCB  RETURN
L_4FCC:
04FCC  GOSUB SUB_2EFC
04FD8  LOCATE 22, 2
04FE1  Prompt$ = "Who will change weapons?"
04FE4  GOSUB SUB_2BBC
04FED  IF M! <> 0 THEN GOTO L_4FF3
L_4FF2:
04FF2  RETURN
L_4FF3:
04FF9  FOR I! = 501 TO 554
L_4FFC:
05013  G!(CINT(I!)) = 0
0501E  NEXT I!
05034  FOR I! = 1100 TO 1397
L_5038:
0505F  IF G!(CINT(I! + 2)) <> M! + 2 THEN GOTO L_509B
L_5064:
0507C  Tmp! = G!(CINT(I!)) + 500
05098  G!(CINT(Tmp!)) = G!(CINT(Tmp!)) + 1
L_509B:
050A4  NEXT I! STEP 3
050BA  WeaponRec! = 788
050BD  GOSUB SUB_2EFC
050D8  WepSlot! = FNCrew(M!, 32)
050E0  IF WepSlot! <= 0 THEN GOTO L_514F
L_50E5:
050F4  SlotRec! = WepSlot! * 12 + 788
05142  IF NOT ((G!(CINT(SlotRec! + 9)) = M! + 2) AND (G!(CINT(SlotRec!)) > 0)) THEN GOTO L_514F
L_5147:
0514C  WeaponRec! = SlotRec!
L_514F:
05158  LOCATE 20, 2
0515B  PRINT CrewName$(CINT(M!)); " Is Using:"
05182  LOCATE 21, 2
05185  GOSUB SUB_52FD
05191  LOCATE 23, 2
05194  PRINT "SPACE to change weapon ENTER to select"
L_51A0:
051AB  LOCATE 24, 2
051AE  PRINT SPC(38); "";
051C9  LOCATE 24, 2
051CC  GOSUB SUB_52FD
051D5  CmdMax! = 0
051D8  GOSUB SUB_2DBF
051E4  IF Cmd! = -51 THEN GOTO L_5264
L_51E9:
051F4  WeaponRec! = WeaponRec! + 12
051FF  IF WeaponRec! <= 1090 THEN GOTO L_520E
L_5204:
05209  WeaponRec! = 788
0520C  GOTO L_51A0
L_520E:
0525F  IF ((G!(CINT(WeaponRec! + 9)) <> M! + 2) OR (G!(CINT(WeaponRec!)) < 1)) THEN GOTO L_51E9
05261  GOTO L_51A0
L_5264:
052A5  G!(CINT(FNIdx(M!, 32))) = INT((WeaponRec! - 787) / 12)
052C3  IF FNCrew(M!, 32) = WepSlot! THEN GOTO L_52F0
L_52C8:
052ED  G!(CINT(FNIdx(M!, 37))) = 3
L_52F0:
052F6  I! = M!
052F9  GOSUB SUB_29EB
052FC  RETURN
SUB_52FD:
05306  IF WeaponRec! <> 788 THEN GOTO L_5318
L_530B:
0530B  PRINT "Hand Weapon";
05317  RETURN
L_5318:
05331  Ammo2! = G!(CINT(WeaponRec! + 3))
05339  IF Ammo2! >= 0 THEN GOTO L_5347
L_533E:
05341  Ammo2! = 0
05344  GOTO L_535A
L_5347:
05350  IF Ammo2! <= 9 THEN GOTO L_535A
L_5355:
05357  Ammo2! = 9
L_535A:
05380  Reloads2! = G!(CINT(G!(CINT(WeaponRec!)) + 500))
0538B  IF Reloads2! <= 9 THEN GOTO L_5395
L_5390:
05392  Reloads2! = 9
L_5395:
05395  PRINT "A"; CHR$(CINT(Ammo2! + 48)); " R"; CHR$(CINT(Reloads2! + 48)); " ";
053E7  IF G!(CINT(WeaponRec! + 3)) >= 0 THEN GOTO L_53FB
L_53EC:
053EC  PRINT "*";
053F8  GOTO L_5407
L_53FB:
053FB  PRINT " ";
L_5407:
05407  PRINT LEFT$(WeaponName$(CINT(G!(CINT(WeaponRec!)) + -1)), 31);
05437  RETURN   'with FAC = G!(CINT(WeaponRec!)) - 1
L_5438:
05438  GOSUB SUB_2EFC
05444  LOCATE 20, 2
05447  PRINT "Standard Time Delay:"; StdDelay!
05463  LOCATE 22, 2
05466  PRINT "Current Delay Factor"; Delay!
05480  LOCATE 24, 2
05483  PRINT "New Delay Factor (1-9999):";
0548F  GOSUB SUB_2FA6
05497  IF InputVal% >= 1 THEN GOTO L_54A2
L_549C:
0549C  InputVal% = 1
L_54A2:
054A8  IF InputVal% <= 9999 THEN GOTO L_54B3
L_54AD:
054AD  InputVal% = 9999
L_54B3:
054BD  Delay! = InputVal%
054C0  RETURN   'with FAC = Delay!
L_54C1:
054C1  GOSUB SUB_3D68
054CA  IF ActiveGroups! = 0 THEN GOTO L_410E
L_54CF:
054D8  IF SurpriseCur! <> 2 THEN GOTO L_552A
L_54DD:
054E3  FOR K! = 1 TO 6
L_54E6:
0550B  G!(CINT(FNIdx(K!, 37))) = 0
05517  NEXT K!
05527  GOTO L_6463
L_552A:
05530  FOR K! = 1 TO 6
L_5534:
0557D  IF (FNCrew(K!, 37) = 3) OR (FNCrew(K!, 31) = 0) THEN GOTO L_6444
L_5582:
055E4  G!(CINT(FNIdx(K!, 58))) = G!(CINT(FNIdx(K!, 58))) - (Fatigue! * 8)
0560C  IF G!(CINT(FNIdx(K!, 58))) >= 0 THEN GOTO L_5646
L_5611:
05611  GOSUB SUB_2263
05614  GOSUB SUB_2EFC
05620  LOCATE 22, 2
05623  PRINT CrewName$(CINT(K!)); " will rest."
05640  GOSUB SUB_2C3C
05643  GOTO L_6444
L_5646:
0565E  WepSlot! = FNCrew(K!, 32)
05674  WeaponRec! = WepSlot! * 12 + 788
0567C  IF WepSlot! <> 0 THEN GOTO L_5696
L_5681:
05687  WepReach! = 10
05690  WepDmgType! = 0
05693  GOTO L_56D1
L_5696:
056B3  WepReach! = G!(CINT(WeaponRec! + 10))
056CE  WepDmgType! = G!(CINT(WeaponRec! + 6))
L_56D1:
056F6  G!(CINT(FNIdx(K!, 56))) = 0
056F9  GOSUB SUB_2EFC
05705  LOCATE 20, 10
05708  PRINT CrewName$(CINT(K!)); "   ["; INT(FNCrew(K!, 58)); "]"
05758  LOCATE 21, 2
0575B  PRINT "Groups In Range: ";
0576D  InRangeAny! = 0
05773  Flag! = 0
05779  TgtGrp! = 0
0577F  MemberCmd! = 0
05788  MinusOne5! = -1
05793  FOR I! = NGroups! - 1 TO 0
L_5796:
057D4  IF NOT ((GrpState!(CINT(I!)) > 2) AND (FNInRange(I!) = 1)) THEN GOTO L_5811
L_57D9:
057D9  PRINT CHR$(CINT(I! + 65)); " ";
057FD  Flag! = 1
05805  TgtGrp! = I!
0580B  InRangeGrp! = I!
0580E  GOTO L_587B
L_5811:
0584F  IF NOT ((GrpState!(CINT(I!)) > 2) AND (FNRanged(I!) = 1)) THEN GOTO L_587B
L_5854:
05854  PRINT CHR$(CINT(I! + 97)); " ";
05878  InRangeAny! = 1
L_587B:
058B9  IF NOT ((WepSlot! > 0) AND ((GrpState!(CINT(I!)) > 2) AND (Flag! = 0))) THEN GOTO L_58C6
L_58BE:
058C3  TgtGrp! = I!
L_58C6:
058CF  NEXT I! STEP MinusOne5!
L_58F8:
05914  IF NOT ((InRangeAny! = 0) AND (Flag! = 0)) THEN GOTO L_5925
L_5919:
05919  PRINT "None"
L_5925:
05941  IF NOT ((Flag! = 0) AND (WepSlot! = 0)) THEN GOTO L_5952
L_5946:
0594C  MemberCmd! = 0
0594F  GOTO L_5BF9
L_5952:
059B1  IF NOT ((FNCrew(K!, 38) < NGroups!) AND (GrpState!(CINT(FNCrew(K!, 38))) > 2)) THEN GOTO L_59D1
L_59B6:
059CE  TgtGrp! = FNCrew(K!, 38)
L_59D1:
059D7  AnyUnit! = 0
059F3  UnitMax4! = GrpSize!(CINT(TgtGrp!)) - 1
059FC  FOR U! = 0 TO UnitMax4!
L_5A00:
05A28  IF UnitHP!(CINT(U!) + CINT(TgtGrp!) * 5) <= 0 THEN GOTO L_5A44
L_5A2D:
05A33  AnyUnit! = 1
05A3B  Unit! = U!
05A41  FirstUnit! = U!
L_5A44:
05A4D  NEXT U!
05A63  IF AnyUnit! <> 0 THEN GOTO L_5A74
L_5A68:
05A6E  MemberCmd! = 0
05A71  GOTO L_5BF9
L_5A74:
05AF0  IF NOT ((FNCrew(K!, 33) < GrpSize!(CINT(TgtGrp!))) AND (UnitHP!(CINT(FNCrew(K!, 33)) + CINT(TgtGrp!) * 5) > 0)) THEN GOTO L_5B10
L_5AF5:
05B0D  Unit! = FNCrew(K!, 33)
L_5B10:
05B8B  IF NOT ((FNCrew(K!, 38) = TgtGrp!) AND ((FNCrew(K!, 37) < 7) AND (FNCrew(K!, 37) > 3))) THEN GOTO L_5BC7
L_5B90:
05BA8  MemberCmd! = FNCrew(K!, 37)
05BC1  MemberCmd! = MemberCmd! - (MemberCmd! < 6)
05BC4  GOTO L_5BF9
L_5BC7:
05BDF  IF FNCrew(K!, 37) >= 0 THEN GOTO L_5BF0
L_5BE4:
05BEA  MemberCmd! = 7
05BED  GOTO L_5BF9
L_5BF0:
05BF6  MemberCmd! = 1
L_5BF9:
05C4B  IF NOT ((MemberCmd! < 8) AND ((WepSlot! > 0) AND ((MemberCmd! > 0) AND (G!(CINT(WeaponRec! + 3)) < 1)))) THEN GOTO L_5C58
L_5C50:
05C55  MemberCmd! = 2
L_5C58:
05CB7  IF NOT ((((MemberCmd! < 8) AND (MemberCmd! > 3)) OR (MemberCmd! = 1)) AND ((G!(CINT(WeaponRec! + 3)) < 1) AND (WepSlot! > 0))) THEN GOTO L_5CC4
L_5CBC:
05CC1  MemberCmd! = 0
L_5CC4:
05CDA  IF GrpState!(CINT(TgtGrp!)) >= 3 THEN GOTO L_5CE8
L_5CDF:
05CE5  MemberCmd! = 0
L_5CE8:
05D2F  IF NOT ((FNInRange(TgtGrp!) = 0) AND ((MemberCmd! < 8) AND ((MemberCmd! > 0) AND (WepSlot! = 0)))) THEN GOTO L_5D64
L_5D34:
05D3A  TgtGrp! = InRangeGrp!
05D45  Unit! = FirstUnit!
05D56  IF FNInRange(TgtGrp!) <> 0 THEN GOTO L_5D64
L_5D5B:
05D61  MemberCmd! = 0
L_5D64:
05D9A  IF NOT ((G!(CINT(WeaponRec! + 3)) < 0) AND (MemberCmd! = 2)) THEN GOTO L_5DA7
L_5D9F:
05DA4  MemberCmd! = 0
L_5DA7:
05DB0  LOCATE 22, 2
05DB3  PRINT "Command: "; CmdName$(CINT(MemberCmd!));
05DFD  IF (MemberCmd! = 9) OR ((MemberCmd! = 0) OR (MemberCmd! = 2)) THEN GOTO L_5EC1
L_5E02:
05E21  IF NOT ((MemberCmd! < 7) AND (MemberCmd! > 3)) THEN GOTO L_5E35
L_5E26:
05E26  PRINT " at ";
05E32  GOTO L_5E41
L_5E35:
05E35  PRINT " on ";
L_5E41:
05E71  IF NOT ((MemberCmd! < 8) AND ((WepDmgType! < 12) AND (WepDmgType! > 5))) THEN GOTO L_5E97
L_5E76:
05E76  PRINT "group "; CHR$(CINT(TgtGrp! + 65));
05E94  GOTO L_5EC1
L_5E97:
05E97  PRINT CHR$(CINT(TgtGrp! + 65)); CHR$(CINT(Unit! + 49));
L_5EC1:
05EC1  PRINT SPC(-(POS(0) - 38));
05EDD  LOCATE 23, 2
05EE0  PRINT "ENTER to accept   A-D  1-5 to retarget";
05EF5  LOCATE 24, 2
05EF8  PRINT "W-ait F-Attack R-apid L-oad M-Aim E-sp";
L_5F04:
05F0A  CmdMin! = -15
05F13  CmdMax! = 23
05F16  GOSUB SUB_2DBF
05F22  IF Cmd! = -32 THEN GOTO L_5F04
05F2D  IF Cmd! = -51 THEN GOTO L_62CB
L_5F32:
05F3B  IF Cmd! < -10 THEN GOTO L_6258
L_5F40:
05F46  IF Cmd! < 0 THEN GOTO L_5F04
05F4E  ON CINT(Cmd!) GOSUB L_5F83, L_5F83, L_5F83, L_5F83, L_6071, L_61A6, L_5F04, L_5F04, L_5F04, L_5F04, L_5F04, L_61CB, L_61E0, L_5F04, L_5F04, L_5F04, L_5F04, L_6229, L_5F04, L_5F04, L_5F04, L_5F04, L_624E
05F80  GOTO L_5BF9
L_5F83:
05F91  PickGrp! = Cmd! - 1
05FC3  IF NOT ((GrpState!(CINT(PickGrp!)) < 3) OR (Cmd! > NGroups!)) THEN GOTO L_5FC9
L_5FC8:
05FC8  RETURN   'with FAC = PickGrp!
L_5FC9:
06003  IF NOT ((MemberCmd! < 8) AND ((FNInRange(PickGrp!) = 0) AND (WepSlot! = 0))) THEN GOTO L_6009
L_6008:
06008  RETURN   'with FAC = FNInRange(PickGrp!)
L_6009:
0603B  IF NOT ((MemberCmd! < 7) AND ((MemberCmd! > 4) AND (TgtGrp! <> PickGrp!))) THEN GOTO L_6047
L_6040:
06044  MemberCmd! = 4
L_6047:
0604D  TgtGrp! = PickGrp!
06065  IF GrpSize!(CINT(TgtGrp!)) > Unit! THEN GOTO L_6070
L_606A:
0606D  Unit! = 0
L_6070:
06070  RETURN
L_6071:
0608C  IF FNCrew(K!, 27) >= 1 THEN GOTO L_6092
L_6091:
06091  RETURN   'with FAC = FNCrew(K!, 27)
L_6092:
0609B  LOCATE 24, 2
0609E  PRINT "M-indshock  H-ealing  P-sychic Scream ";
060AA  GOSUB SUB_2DBF
060E2  IF NOT ((FNCrew(K!, 52) > 0) AND (Cmd! = 13)) THEN GOTO L_60F1
L_60E7:
060ED  MemberCmd! = 8
060F0  RETURN   'with FAC = FNCrew(K!, 52)
L_60F1:
0614F  IF NOT ((FNCrew(K!, 53) > 0) AND ((FNCrew(K!, 27) > 4) AND (Cmd! = 8))) THEN GOTO L_615E
L_6154:
0615A  MemberCmd! = 9
0615D  RETURN   'with FAC = FNCrew(K!, 53)
L_615E:
06196  IF NOT ((FNCrew(K!, 27) > 7) AND (Cmd! = 16)) THEN GOTO L_61A5
L_619B:
061A1  MemberCmd! = 10
061A4  RETURN   'with FAC = FNCrew(K!, 27)
L_61A5:
061A5  RETURN
L_61A6:
061BC  IF GrpState!(CINT(TgtGrp!)) <= 2 THEN GOTO L_61CA
L_61C1:
061C7  MemberCmd! = 1
L_61CA:
061CA  RETURN
L_61CB:
061D1  IF WepSlot! <= 0 THEN GOTO L_61DF
L_61D6:
061DC  MemberCmd! = 2
L_61DF:
061DF  RETURN
L_61E0:
061F6  IF GrpState!(CINT(TgtGrp!)) <= 2 THEN GOTO L_6228
L_61FB:
0621C  IF NOT ((MemberCmd! > 6) OR (MemberCmd! < 4)) THEN GOTO L_6228
L_6221:
06225  MemberCmd! = 4
L_6228:
06228  RETURN
L_6229:
0623F  IF GrpState!(CINT(TgtGrp!)) <= 2 THEN GOTO L_624D
L_6244:
0624A  MemberCmd! = 7
L_624D:
0624D  RETURN
L_624E:
06254  MemberCmd! = 0
06257  RETURN
L_6258:
06264  PickUnit! = Cmd! + 15
06299  IF NOT ((MemberCmd! < 7) AND ((MemberCmd! > 4) AND (PickUnit! <> Unit!))) THEN GOTO L_62A5
L_629E:
062A2  MemberCmd! = 4
L_62A5:
062BB  IF GrpSize!(CINT(TgtGrp!)) <= PickUnit! THEN GOTO L_62C8
L_62C0:
062C5  Unit! = PickUnit!
L_62C8:
062C8  GOTO L_5BF9
L_62CB:
06346  IF NOT ((FNCrew(K!, 38) = TgtGrp!) AND ((FNCrew(K!, 37) < 7) AND (FNCrew(K!, 37) > 3))) THEN GOTO L_6393
L_634B:
06390  G!(CINT(FNIdx(K!, 56))) = FNCrew(K!, 37) - 3
L_6393:
063BA  G!(CINT(FNIdx(K!, 38))) = TgtGrp!
063E4  G!(CINT(FNIdx(K!, 37))) = MemberCmd!
0640E  G!(CINT(FNIdx(K!, 33))) = Unit!
06417  IF WepSlot! <> 0 THEN GOTO L_6444
L_641C:
06441  G!(CINT(FNIdx(0, 32))) = 0
L_6444:
0644D  NEXT K!
L_6460:
06460  GOSUB SUB_2EFC
L_6463:
06469  SquadHit! = 0
0647B  MapType! = FNMap(5)
06486  N_D130! = 0
0648E  TerrainMod! = 0
064B1  IF NOT ((MapType! < 5) AND (MapType! > 1)) THEN GOTO L_64D1
L_64B6:
064C4  TerrainMod! = 105 - (MapType! * 35)
064CE  N_D130! = -N_D130!
L_64D1:
064DD  GrpMax8! = NGroups! - 1
064E6  FOR I! = 0 TO GrpMax8!
L_64EA:
06503  UnitMax5! = GrpSize!(CINT(I!)) - 1
0650C  FOR Unit2! = 0 TO UnitMax5!
L_6510:
06538  UnitState!(CINT(I!) * 5 + CINT(Unit2!)) = SGN(UnitState!(CINT(I!) * 5 + CINT(Unit2!)))
06543  NEXT Unit2!
0655C  NEXT I!
L_656F:
0657B  InitStep! = InitLo! * (-0.25)
06587  FOR InitLevel! = InitHi! + 1 TO 0
L_658A:
06593  IF InitLevel! >= InitMid! THEN GOTO L_65A0
L_6598:
0659D  InitLevel! = 0
L_65A0:
065A6  FOR M! = 1 TO 6
L_65AA:
065C2  MemberCmd! = FNCrew(M!, 37)
065CD  IF MemberCmd! <= 7 THEN GOTO L_65D8
L_65D2:
065D2  GOSUB SUB_A36B
065D5  GOTO L_6F44
L_65D8:
0660F  IF (FNCrew(M!, 1) < InitLevel!) OR (MemberCmd! < 1) THEN GOTO L_6F44
L_6614:
06641  IF (MemberCmd! = 8) OR ((MemberCmd! < 7) AND (MemberCmd! > 2)) THEN GOTO L_6F44
L_6646:
0665E  WepType! = FNCrew(M!, 32)
06666  IF WepType! <= 0 THEN GOTO L_66D6
L_666B:
0667C  WeaponRec! = WepType! * 12 + 788
0669A  WepType! = G!(CINT(WeaponRec! + 6))
066D1  IF (MemberCmd! <> 2) AND (G!(CINT(WeaponRec! + 3)) < 1) THEN GOTO L_6F44
L_66D6:
06712  G!(CINT(FNIdx(M!, 37))) = (MemberCmd! = 7)
0671D  IF MemberCmd! <> 2 THEN GOTO L_6864
L_6722:
0672E  OwnerCode! = M! + 2
06737  Flag! = 0
0674D  AmmoType! = G!(CINT(WeaponRec!))
06756  FOR J! = 1100 TO 1397
L_675A:
067A3  IF NOT ((G!(CINT(J! + 2)) = OwnerCode!) AND (G!(CINT(J!)) = AmmoType!)) THEN GOTO L_67F9
L_67A8:
067AD  G!(CINT(J!)) = 0
067B5  J! = 9999
067ED  G!(CINT(WeaponRec! + 3)) = G!(CINT(WeaponRec! + 4))
067F6  Flag! = 1
L_67F9:
06802  NEXT J! STEP 3
L_6815:
0681E  IF Flag! <> 1 THEN GOTO L_6861
L_6823:
06823  GOSUB SUB_2EFC
0682F  LOCATE 22, 2
06832  PRINT CrewName$(CINT(M!)); " Reloads"
06858  I! = M!
0685B  GOSUB SUB_29EB
0685E  GOTO L_6F16
L_6861:
06861  GOTO L_6F44
L_6864:
0686A  IF WepType! <> 0 THEN GOTO L_688D
L_686F:
06887  WepAcc! = FNCrew(M!, 46)
0688A  GOTO L_68A9
L_688D:
068A6  WepAcc! = G!(CINT(WeaponRec! + 7))
L_68A9:
068AF  IF WepType! <> 0 THEN GOTO L_68C0
L_68B4:
068BA  SkillField! = 28
068BD  GOTO L_6927
L_68C0:
06924  SkillField! = 21 - (G!(CINT(WeaponRec! + 11)) = 3) - (G!(CINT(WeaponRec! + 11)) = 2) * 3 - (G!(CINT(WeaponRec! + 11)) = 1) * 4 - 3 * (G!(CINT(WeaponRec! + 11)) = 0)
L_6927:
06941  SkillField! = FNCrew(M!, SkillField!)
0695E  Grp! = FNCrew(M!, 38)
0697D  Unit! = FNCrew(M!, 33)
06A8E  HitPct! = SkillField! * 5 + FNCrew(M!, 10) - ((FNCrew(M!, 56) > 2) * 20) - ((FNCrew(M!, 56) > 1) * 30) - ((FNCrew(M!, 56) > 0) * 50) - (GrpToHitMod!(CINT(Grp!))) + FNCrew(M!, 43) + WepAcc! + 50
06A9C  IF MemberCmd! <> 7 THEN GOTO L_6AAE
L_6AA1:
06AAB  HitPct! = HitPct! * 0.5
L_6AAE:
06ABD  MapType! = FNMap(Grp!)
06ADE  IF NOT ((MapType! < 5) AND (MapType! > 1)) THEN GOTO L_6AFC
L_6AE3:
06AF9  HitPct! = HitPct! - (MapType! * 35) + 105
L_6AFC:
06B40  HitPct! = FNInRange(Grp!) * 25 + FNRanged(Grp!) * 25 + HitPct! + TerrainMod! - 50
06B4C  IF HitPct! >= 10 THEN GOTO L_6B59
L_6B51:
06B53  HitPct! = 10
06B56  GOTO L_6B6C
L_6B59:
06B62  IF HitPct! <= 90 THEN GOTO L_6B6C
L_6B67:
06B69  HitPct! = 90
L_6B6C:
06B6C  GOSUB SUB_2EFC
06B78  LOCATE 20, 2
06B7B  PRINT CrewName$(CINT(M!));
06B98  IF WepType! <> 0 THEN GOTO L_6BAC
L_6B9D:
06B9D  PRINT " swings"
06BA9  GOTO L_6BEB
L_6BAC:
06BCB  IF NOT ((WepType! > 6) AND (WepType! < 12)) THEN GOTO L_6BDF
L_6BD0:
06BD0  PRINT " uses"
06BDC  GOTO L_6BEB
L_6BDF:
06BDF  PRINT " fires"
L_6BEB:
06BF4  LOCATE 21, 2
06BFD  IF WepType! <= 0 THEN GOTO L_6C2F
L_6C02:
06C02  PRINT WeaponName$(CINT(G!(CINT(WeaponRec!)) + -1))
06C2C  GOTO L_6C80
L_6C2F:
06C4D  HandWep! = FNCrew(M!, 90) - 1
06C55  IF HandWep! >= 0 THEN GOTO L_6C69
L_6C5A:
06C5A  PRINT "fist"
06C66  GOTO L_6C80
L_6C69:
06C69  PRINT HandWeaponName$(CINT(HandWep!))
L_6C80:
06C86  Hits! = 0
06C8C  ActiveGroups! = 0
06C92  N_D1A4! = 0
06C98  Killed! = 0
06C9E  EquipHit! = 0
06CA4  DamageSum! = 0
06CC1  Melee! = ABS(WepType! = 0)
06CCA  Shots! = 1
06CD3  IF WepType! <= 0 THEN GOTO L_6CF7
L_6CD8:
06CF4  Shots! = G!(CINT(WeaponRec! + 2))
L_6CF7:
06D15  NShots! = (-((MemberCmd! = 7) - 1)) * Shots!
06D1E  FOR Shot! = 1 TO NShots!
L_6D22:
06D56  IF (G!(CINT(WeaponRec! + 3)) < 1) AND (Melee! = 0) THEN GOTO L_6DDB
L_6D5B:
06D61  IF Melee! <> 0 THEN GOTO L_6D89
L_6D66:
06D86  G!(CINT(WeaponRec! + 3)) = G!(CINT(WeaponRec! + 3)) - 1
L_6D89:
06DAA  Hit! = ABS(RND * 100 < HitPct!)
06DB5  IF Hit! <> 1 THEN GOTO L_6DCF
L_6DBA:
06DC4  Hits! = Hits! + 1
06DCC  SquadHit! = 1
L_6DCF:
06DD5  Flag! = 0
06DD8  GOSUB SUB_81EB
L_6DDB:
06DE4  NEXT Shot!
L_6DF7:
06E00  LOCATE 22, 2
06E03  PRINT "making"; Hits!; "hit(s)"
06E24  IF Hits! < 1 THEN GOTO L_6F16
L_6E29:
06E32  LOCATE 23, 2
06E3B  IF DamageSum! <= 0 THEN GOTO L_6E5A
L_6E40:
06E40  PRINT "for"; DamageSum!; "points of damage."
06E57  GOTO L_6E71
L_6E5A:
06E60  IF ActiveGroups! <= 0 THEN GOTO L_6E71
L_6E65:
06E65  PRINT "Armor absorbs damage."
L_6E71:
06E7A  LOCATE 24, 2
06E86  IF Killed! <= 1 THEN GOTO L_6EA6
L_6E8B:
06E8B  PRINT CHR$(CINT(Killed! + 48)); " ";
L_6EA6:
06EAC  IF Killed! <= 0 THEN GOTO L_6EE5
L_6EB1:
06EB1  PRINT GrpName$(CINT(Grp!));
06ED4  IF Killed! <= 1 THEN GOTO L_6EE5
L_6ED9:
06ED9  PRINT "(s)";
L_6EE5:
06EEB  IF Killed! <= 0 THEN GOTO L_6EFF
L_6EF0:
06EF0  PRINT " killed!";
06EFC  GOTO L_6F16
L_6EFF:
06F05  IF EquipHit! <= 0 THEN GOTO L_6F16
L_6F0A:
06F0A  PRINT "Equipment destroyed.";
L_6F16:
06F1C  PauseN! = DelayUnits!
06F25  FOR I! = 1 TO PauseN!
L_6F28:
06F28  GOSUB SUB_2913
06F34  NEXT I!
L_6F44:
06F4D  NEXT M!
L_6F60:
06F7F  IF (SurpriseCur! = 1) OR (Attacked! = 0) THEN GOTO L_70A5
L_6F84:
06F8A  Target! = 5
06F99  GrpMax9! = NGroups! - 1
06FA2  FOR AtkGrp! = 0 TO GrpMax9!
L_6FA6:
06FBC  IF GrpState!(CINT(AtkGrp!)) < 3 THEN GOTO L_7089
L_6FC1:
06FDA  UnitMax6! = GrpSize!(CINT(AtkGrp!)) - 1
06FE3  FOR Unit! = 0 TO UnitMax6!
L_6FE6:
07036  IF (UnitState!(CINT(Unit!) + CINT(AtkGrp!) * 5) = 0) OR ((UnitState!(CINT(Unit!) + CINT(AtkGrp!) * 5) = 2) OR (UnitHP!(CINT(Unit!) + CINT(AtkGrp!) * 5) < 1)) THEN GOTO L_706D
L_703B:
0703B  GOSUB SUB_7151
07065  IF UnitState!(CINT(Unit!) + CINT(AtkGrp!) * 5) <> 3 THEN GOTO L_706D
L_706A:
0706A  GOSUB SUB_7151
L_706D:
07076  NEXT Unit!
L_7089:
07092  NEXT AtkGrp!
L_70A5:
070AE  NEXT InitLevel! STEP InitStep!
L_70D7:
070DD  SurpriseCur! = 0
070E9  IF SquadHit! <> 1 THEN GOTO L_70F6
L_70EE:
070F3  Attacked! = 1
L_70F6:
07141  IF NOT (((C8Hostile! > 1) AND (SurpriseCur! = 2)) OR (RND * 100 < C8Hostile! * 35 - 35)) THEN GOTO L_714E
L_7146:
0714B  Attacked! = 1
L_714E:
0714E  GOTO L_3570
SUB_7151:
07157  Grp! = AtkGrp!
07184  IF ABS(UnitInit!(CINT(Unit!) + CINT(AtkGrp!) * 5)) >= InitLevel! THEN GOTO L_718A
L_7189:
07189  RETURN   'with FAC = ABS(UnitInit!(CINT(Unit!) + CINT(AtkGrp!) * 5))
L_718A:
071B6  NewWep! = UnitWeapon!(CINT(Unit!) + CINT(AtkGrp!) * 5)
071D3  Dist2! = FNDist(AtkGrp!, 5)
071E3  IF UnitState!(CINT(Unit!) + CINT(AtkGrp!) * 5) = 3 THEN GOTO L_74A9
L_71E8:
0721F  FlameDmg! = (UnitFlames!(CINT(Unit!) + CINT(AtkGrp!) * 5)) * (GrpFlameDmg!(CINT(AtkGrp!)))
07238  RocketDmg! = (UnitRockets!(CINT(Unit!) + CINT(AtkGrp!) * 5)) * (GrpRocketDmg!(CINT(AtkGrp!)))
0724C  MeleeDmg! = (UnitMelee!(CINT(Unit!) + CINT(AtkGrp!) * 5)) * (GrpMeleeDmg!(CINT(AtkGrp!)))
0727E  IF NOT ((RND < 0.6) AND ((Dist2! < 9) AND (FlameDmg! > 0))) THEN GOTO L_728F
L_7283:
07289  NewWep! = 2
0728C  GOTO L_73D7
L_728F:
072BF  IF NOT ((RND < 0.8) AND ((Dist2! < 6) AND (RocketDmg! > 0))) THEN GOTO L_72D0
L_72C4:
072CA  NewWep! = 1
072CD  GOTO L_73D7
L_72D0:
072FA  IF NOT ((FlameDmg! <= 0) AND ((RocketDmg! <= 0) AND (MeleeDmg! <= 0))) THEN GOTO L_7325
L_72FF:
07321  UnitState!(CINT(Grp!) * 5 + CINT(Unit!)) = 0
07324  RETURN
L_7325:
07343  IF NOT ((MeleeDmg! <= 0) AND (NewWep! = 0)) THEN GOTO L_7350
L_7348:
0734D  NewWep! = 1
L_7350:
07371  IF NOT ((RocketDmg! <= 0) AND (NewWep! = 1)) THEN GOTO L_737E
L_7376:
0737B  NewWep! = 2
L_737E:
0739F  IF NOT ((FlameDmg! <= 0) AND (NewWep! = 2)) THEN GOTO L_73AC
L_73A4:
073A9  NewWep! = 0
L_73AC:
073CA  IF NOT ((MeleeDmg! <= 0) AND (NewWep! = 0)) THEN GOTO L_73D7
L_73CF:
073D4  NewWep! = 1
L_73D7:
073FE  IF UnitWeapon!(CINT(Unit!) + CINT(AtkGrp!) * 5) = NewWep! THEN GOTO L_74A9
L_7403:
07403  GOSUB SUB_2EFC
0740F  LOCATE 22, 2
07412  PRINT GrpName$(CINT(Grp!)); " ("; CHR$(CINT(AtkGrp! + 65)); CHR$(CINT(Unit! + 49)); ") switches weapons"
0747B  UnitWeapon!(CINT(Grp!) * 5 + CINT(Unit!)) = NewWep!
0747E  GOSUB SUB_9F76
074A3  UnitState!(CINT(Grp!) * 5 + CINT(Unit!)) = 2
074A6  GOTO L_7F8B
L_74A9:
074A9  GOSUB SUB_2EFC
074B5  LOCATE 20, 2
074B8  PRINT GrpName$(CINT(AtkGrp!)); " ("; CHR$(CINT(AtkGrp! + 65)); CHR$(CINT(Unit! + 49)); ")"
0750A  LOCATE 21, 2
07513  IF NewWep! <> 0 THEN GOTO L_75BF
L_7518:
07518  PRINT AttackVerb$(CINT(GrpAttackVerb!(CINT(Grp!))))
07569  UnitMelee!(CINT(Grp!) * 5 + CINT(Unit!)) = UnitMelee!(CINT(Grp!) * 5 + CINT(Unit!)) - 1
07577  WepReach! = GrpMeleeRange!(CINT(Grp!))
075A5  UnitState!(CINT(Grp!) * 5 + CINT(Unit!)) = -(((GrpAttackVerb!(CINT(Grp!)) = 1) AND (UnitState!(CINT(Grp!) * 5 + CINT(Unit!)) = 1)) - 2)
075AE  WepDmgType! = 12
075B9  Damage! = GrpMeleeDmg!(CINT(Grp!))
075BC  GOTO L_76A4
L_75BF:
075C8  IF NewWep! <> 1 THEN GOTO L_763A
L_75CD:
075CD  PRINT "shoots rocket launcher"
07606  UnitRockets!(CINT(Grp!) * 5 + CINT(Unit!)) = UnitRockets!(CINT(Grp!) * 5 + CINT(Unit!)) - 1
0760F  WepReach! = 6.7
0761B  UnitState!(CINT(Grp!) * 5 + CINT(Unit!)) = 2
07624  WepDmgType! = 9
07634  Damage! = GrpRocketDmg!(CINT(Grp!))
07637  GOTO L_76A4
L_763A:
0763A  PRINT "fires flame thrower"
07673  UnitFlames!(CINT(Grp!) * 5 + CINT(Unit!)) = UnitFlames!(CINT(Grp!) * 5 + CINT(Unit!)) - 1
0767C  WepReach! = 3.7
07688  UnitState!(CINT(Grp!) * 5 + CINT(Unit!)) = 2
07691  WepDmgType! = 6
076A1  Damage! = GrpFlameDmg!(CINT(Grp!))
L_76A4:
076AA  FOR Try! = 1 TO 7
L_76AE:
076C6  M! = INT(RND * 6 + 1)
076E2  IF FNCrew(M!, 31) <= 0 THEN GOTO L_76F0
L_76E7:
076ED  Try! = 20
L_76F0:
076F9  NEXT Try!
07750  HitPct! = 50 - (INT(Dist2! / WepReach!) * 25) - FNCrew(M!, 11) - N_D130! + N_D2C4!
07764  MapType! = FNMap(Grp!)
07785  IF NOT ((MapType! < 5) AND (MapType! > 1)) THEN GOTO L_77A3
L_778A:
077A0  HitPct! = HitPct! - (MapType! * 35) + 105
L_77A3:
077AC  IF HitPct! >= 10 THEN GOTO L_77B9
L_77B1:
077B3  HitPct! = 10
077B6  GOTO L_77CC
L_77B9:
077C2  IF HitPct! <= 90 THEN GOTO L_77CC
L_77C7:
077C9  HitPct! = 90
L_77CC:
077EB  IF NOT ((Dist2! > 2) AND (WepReach! < 2)) THEN GOTO L_77F9
L_77F0:
077F6  HitPct! = 0
L_77F9:
077FF  Hit! = 0
0782C  IF NOT ((RND * 100 < HitPct!) AND (Try! > 10)) THEN GOTO L_7839
L_7831:
07836  Hit! = 1
L_7839:
07867  IF NOT ((GrpAttackVerb!(CINT(Grp!)) < 2) OR (NewWep! > 0)) THEN GOTO L_7885
L_786C:
0786C  GOSUB SUB_7FC1
0787B  ON CINT(NewWep! + 1) GOSUB L_9107, L_8CD2, L_8BF2
L_7885:
0788E  LOCATE 22, 2
07897  IF Hit! <> 0 THEN GOTO L_78AB
L_789C:
0789C  PRINT "and misses."
078A8  GOTO L_7F8B
L_78AB:
078AB  PRINT "and hits."
078C3  U! = RND ^ 3
078D1  IF RND >= 0.5 THEN GOTO L_78E1
L_78D6:
078DE  U! = 1 - U!
L_78E1:
078FF  NTargets! = INT((RND * NewWep!) * 2 + 1)
07941  FirstTgt! = INT(((U! ^ 3 + U! ^ 0.3333) * (7 - NTargets!)) * 0.5 + 1)
0794B  IF NTargets! <> 1 THEN GOTO L_7958
L_7950:
07955  FirstTgt! = M!
L_7958:
07958  GOSUB SUB_A301
07961  LastTgt2! = LastTgt!
0796A  FOR M! = FirstTgt! TO LastTgt2!
L_796E:
07989  IF FNCrew(M!, 31) < 1 THEN GOTO L_7F6F
L_798E:
079C5  Damage! = INT((RND ^ 0.5) * Damage! - FNCrew(M!, 48))
079D1  LOCATE 23, 2
079DD  IF Damage! >= 1 THEN GOTO L_7A02
L_79E2:
079E2  PRINT CrewName$(CINT(M!)); "'s armor absorbs the damage."
079FF  GOTO L_7F2A
L_7A02:
07A02  PRINT CrewName$(CINT(M!)); " takes"; INT(Damage!); "points of damage."
07A42  LOCATE 24, 2
07A65  NewHP! = FNCrew(M!, 15) - Damage!
07A70  IF NewHP! >= 1 THEN GOTO L_7B5E
L_7A75:
07A9E  G!(CINT(FNIdx(M!, 15))) = 0
07AC8  G!(CINT(FNIdx(M!, 31))) = 0
07AF0  G!(CINT(FNIdx(M!, 37))) = 0
07AF3  PRINT CrewName$(CINT(M!)); " dies!";
07B0B  FOR K! = 1 TO 4
L_7B0E:
07B25  SOUND 900, SndDur! * 6
07B3F  SOUND 32000, SndDur! * 0.3
07B4B  NEXT K!
07B5B  GOTO L_7EB3
L_7B5E:
07B86  G!(CINT(FNIdx(M!, 15))) = INT(NewHP!)
07BC3  IF (RND * 100 > M! + 10) AND (RND * 100 > 50) THEN GOTO L_7EC3
L_7BC8:
07BDE  ON CINT(INT(RND * 8 + 1)) GOSUB L_7C1D, L_7CB1, L_7D6D, L_7D6D, L_7D6D, L_7DF1, L_7DF1, L_7DF1
07C17  G!(CINT(FNIdx(M!, 37))) = 0
07C1A  GOTO L_7EC3
L_7C1D:
07C38  IF FNCrew(M!, 43) >= 1 THEN GOTO L_7C3E
L_7C3D:
07C3D  RETURN   'with FAC = FNCrew(M!, 43)
L_7C3E:
07C3E  PRINT "Sighting hardware destroyed.";
07C62  U! = FNIdx(M!, 41)
07C72  SightEnd! = U! + 2
07C7A  FOR K! = U! TO SightEnd!
L_7C7E:
07C95  G!(CINT(K!)) = 0
07CA0  NEXT K!
07CB0  RETURN
L_7CB1:
07CCC  IF FNCrew(M!, 45) >= 1 THEN GOTO L_7CD2
L_7CD1:
07CD1  RETURN   'with FAC = FNCrew(M!, 45)
L_7CD2:
07CD2  PRINT "Hand weapon destroyed.";
07CF6  U! = FNIdx(M!, 44)
07D06  HandEnd! = U! + 2
07D0E  FOR K! = U! TO HandEnd!
L_7D12:
07D29  G!(CINT(K!)) = 0
07D34  NEXT K!
07D69  G!(CINT(FNIdx(M!, 90))) = 0
07D6C  RETURN   'with FAC = FNIdx(M!, 90)
L_7D6D:
07D88  IF FNCrew(M!, 48) >= 1 THEN GOTO L_7D8E
L_7D8D:
07D8D  RETURN   'with FAC = FNCrew(M!, 48)
L_7D8E:
07D8E  PRINT "Armor is damaged.";
07DED  G!(CINT(FNIdx(M!, 48))) = INT(FNCrew(M!, 48) * 0.5 + 0.4)
07DF0  RETURN   'with FAC = INT(FNCrew(M!, 48) * 0.5 + 0.4)
L_7DF1:
07E09  WepSlot! = FNCrew(M!, 32)
07E11  IF WepSlot! = 0 THEN GOTO L_7C1D
L_7E16:
07E28  WeaponRec! = WepSlot! * 12 + 788
07E34  IF RND < 0.3 THEN GOTO L_7E8A
L_7E39:
07E39  PRINT "Weapon is destroyed.";
07E5E  G!(CINT(WeaponRec! + 3)) = -1
07E86  G!(CINT(FNIdx(M!, 32))) = 0
07E89  RETURN   'with FAC = FNIdx(M!, 32)
L_7E8A:
07E8A  PRINT "Ammo is destroyed.";
07EAF  G!(CINT(WeaponRec! + 3)) = 0
07EB2  RETURN   'with FAC = WeaponRec! + 3
L_7EB3:
07EB3  GOSUB SUB_2C93
07EBE  IF EquipHit! <> 0 THEN GOTO L_434D
L_7EC3:
07ED9  LOCATE CINT(M! + 12), 12
07EDC  PRINT FNCrew(M!, 15);
07F19  IF FNCrew(M!, 15) >= 10 THEN GOTO L_7F2A
L_7F1E:
07F1E  PRINT " "
L_7F2A:
07F36  PauseN2! = DelayUnits! * 0.8
07F3F  FOR I! = 1 TO PauseN2!
L_7F42:
07F42  GOSUB SUB_2913
07F4E  NEXT I!
07F67  IF M! = LastTgt! THEN GOTO L_7F6F
L_7F6C:
07F6C  GOSUB SUB_2F40
L_7F6F:
07F78  NEXT M!
L_7F8B:
07F97  PauseN3! = DelayUnits! * 0.4
07FA0  FOR I! = 1 TO PauseN3!
L_7FA4:
07FA4  GOSUB SUB_2913
07FB0  NEXT I!
07FC0  RETURN
SUB_7FC1:
07FE2  FromX! = (GrpX!(CINT(AtkGrp!))) * 8 - 5
07FF7  FromY! = (GrpY!(CINT(AtkGrp!))) * 8 - 5
08018  ToX! = (GrpX!(CINT(Target!))) * 8 - 5
0802D  ToY! = (GrpY!(CINT(Target!))) * 8 - 5
08039  IF Hit! = 1 THEN GOTO L_816D
L_803E:
08066  DX! = ToX! - INT(RND * 17) - FromX! + 8
0808B  DY! = ToY! - INT(RND * 17) - FromY! + 8
080AA  IF ((DY! = 0) OR (DX! = 0)) THEN GOTO L_803E
080B2  IF DX! <= 0 THEN GOTO L_80C3
L_80B7:
080BD  EdgeX! = 311
080C0  GOTO L_80CC
L_80C3:
080C9  EdgeX! = 200
L_80CC:
080D2  IF DY! <= 0 THEN GOTO L_80E3
L_80D7:
080DD  EdgeY! = 143
080E0  GOTO L_80EC
L_80E3:
080E9  EdgeY! = 32
L_80EC:
080FE  EdgeT! = (EdgeX! - FromX!) / DX!
08115  EdgeT2! = (EdgeY! - FromY!) / DY!
0811F  IF EdgeT2! >= EdgeT! THEN GOTO L_8127
L_8124:
08124  EdgeT! = EdgeT2!
L_8127:
0814B  ToY! = INT(DY! * EdgeT! + FromY! + 0.5)
0816A  ToX! = INT(DX! * EdgeT! + FromX! + 0.5)
L_816D:
08173  PX! = FromX!
0817E  PY! = FromY!
0818E  DX! = ToX! - FromX!
0819C  DY! = ToY! - FromY!
081CB  PStep! = 0.2 / (FNDist(AtkGrp!, Target!) ^ 0.7 + 1e-06)
081D9  Col! = DX! * PStep!
081E7  Row! = DY! * PStep!
081EA  RETURN   'with FAC = Row!
SUB_81EB:
081F1  Target! = Grp!
081FA  AtkGrp! = 5
081FD  GOSUB SUB_7FC1
08206  ON CINT(WepType!) GOSUB L_8691, L_8691, L_87E4, L_8906, SUB_8B7C, L_8BF2, L_91F0, L_8DF7, L_8CD2, L_8CD2, L_8CD2, L_9107
08228  IF Hit! <> 0 THEN GOTO L_822E
L_822D:
0822D  RETURN
L_822E:
08234  NTargets! = 1
08253  FirstTgt! = FNCrew(M!, 33)
08277  IF NOT ((WepType! < 12) AND (WepType! > 5)) THEN GOTO L_82F8
L_827C:
082B8  NTargets! = INT((RND ^ 0.7) * (GrpSize!(CINT(Grp!))) + 1)
082D8  FirstTgt! = INT(RND * (GrpSize!(CINT(Grp!)) - NTargets! + 1))
082E3  IF WepType! <> 8 THEN GOTO L_82F8
L_82E8:
082ED  NTargets! = GrpSize!(CINT(Grp!))
082F5  FirstTgt! = 0
L_82F8:
082F8  GOSUB SUB_A15D
08301  LastTgt3! = LastTgt!
0830A  FOR Unit! = FirstTgt! TO LastTgt3!
L_830E:
08335  IF UnitHP!(CINT(Unit!) + CINT(Grp!) * 5) < 1 THEN GOTO L_8633
L_833A:
08340  IF WepType! <> 0 THEN GOTO L_8363
L_8345:
0835D  WepDmg! = FNCrew(M!, 45)
08360  GOTO L_837F
L_8363:
0837C  WepDmg! = G!(CINT(WeaponRec! + 1))
L_837F:
08385  ActiveGroups! = 1
083A7  Damage! = INT((RND ^ 0.5) * WepDmg! + 1)
083D2  Damage! = Damage! - (UnitArmor!(CINT(Unit!) + CINT(Grp!) * 5))
083DA  IF Damage! < 0 THEN GOTO L_8633
L_83DF:
083EC  DamageSum! = DamageSum! + Damage!
0841B  UnitHP!(CINT(Grp!) * 5 + CINT(Unit!)) = UnitHP!(CINT(Grp!) * 5 + CINT(Unit!)) - Damage!
08426  IF UnitHP!(CINT(Grp!) * 5 + CINT(Unit!)) >= 1 THEN GOTO L_8443
L_842B:
08430  UnitHP!(CINT(Grp!) * 5 + CINT(Unit!)) = 0
0843D  Killed! = Killed! + 1
08440  GOTO L_8633
L_8443:
0847D  IF (RND * 100 > Damage! + 10) OR (RND * 100 > 50) THEN GOTO L_8633
L_8482:
08488  EquipHit! = 1
084A0  ON CINT(INT(RND * 8) + 1) GOSUB L_84DC, L_850F, L_8535, L_855B, L_8581, L_85BB, L_85F5, L_8632
084D6  UnitState!(CINT(Grp!) * 5 + CINT(Unit!)) = 2
084D9  GOTO L_8633
L_84DC:
0850B  UnitArmor!(CINT(Grp!) * 5 + CINT(Unit!)) = INT((UnitArmor!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.4)
0850E  RETURN   'with FAC = INT((UnitArmor!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.4)
L_850F:
08531  UnitRockets!(CINT(Grp!) * 5 + CINT(Unit!)) = 0
08534  RETURN
L_8535:
08557  UnitFlames!(CINT(Grp!) * 5 + CINT(Unit!)) = 0
0855A  RETURN
L_855B:
0857D  UnitMelee!(CINT(Grp!) * 5 + CINT(Unit!)) = 0
08580  RETURN
L_8581:
085B7  UnitRockets!(CINT(Grp!) * 5 + CINT(Unit!)) = INT((UnitRockets!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.5 + 0.5)
085BA  RETURN   'with FAC = INT((UnitRockets!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.5 + 0.5)
L_85BB:
085F1  UnitFlames!(CINT(Grp!) * 5 + CINT(Unit!)) = INT((UnitFlames!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.5 + 0.5)
085F4  RETURN   'with FAC = INT((UnitFlames!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.5 + 0.5)
L_85F5:
0862E  UnitMelee!(CINT(Grp!) * 5 + CINT(Unit!)) = INT((UnitMelee!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.1 + 0.5)
08631  RETURN   'with FAC = INT((UnitMelee!(CINT(Grp!) * 5 + CINT(Unit!))) * 0.1 + 0.5)
L_8632:
08632  RETURN
L_8633:
0863C  NEXT Unit!
L_864F:
08668  UnitMax7! = GrpSize!(CINT(Grp!)) - 1
08671  FOR Unit! = 0 TO UnitMax7!
L_8674:
08674  GOSUB SUB_9F76
08680  NEXT Unit!
08690  RETURN
L_8691:
08699  IF (SndDur! = 0) THEN GOTO L_86E2
L_869E:
086AC  SOUND 57, 0.1
086BD  SOUND 5947, 0.05
086CE  SOUND 57, 0.1
086DF  SOUND 5947, 0.05
L_86E2:
086E8  PStep1! = PStep!
086F1  FOR U! = 0 TO 1
L_86F4:
08708  PUT (PX!, PY!), Shot1, XOR
0870B  GOSUB SUB_87B2
08726  PUT (PX!, PY!), Shot1, XOR
08733  PX! = PX! + Col!
08740  PY! = PY! + Row!
0874C  NEXT U! STEP PStep1!
L_8778:
0878A  IF NOT (CINT(SndDur!) AND CINT(Hit!)) THEN GOTO L_87B1
L_878F:
0879D  SOUND 57, 0.09000001
087AE  SOUND 5947, 0.03
L_87B1:
087B1  RETURN
SUB_87B2:
087BE  StepN! = DelayBase! * 0.01
087C7  FOR StepI! = 1 TO StepN!
L_87CA:
087D3  NEXT StepI!
087E3  RETURN
L_87E4:
087EC  IF (SndDur! = 0) THEN GOTO L_8835
L_87F1:
087FF  SOUND 87, 0.09000001
08810  SOUND 7947, 0.03
08821  SOUND 87, 0.09000001
08832  SOUND 7947, 0.03
L_8835:
0883B  PStep2! = PStep!
08844  FOR U! = 0 TO 1
L_8848:
0885C  PUT (PX!, PY!), Shot2, XOR
0885F  GOSUB SUB_87B2
0887A  PUT (PX!, PY!), Shot2, XOR
08887  PX! = PX! + Col!
08894  PY! = PY! + Row!
088A0  NEXT U! STEP PStep2!
L_88CC:
088DE  IF NOT (CINT(SndDur!) AND CINT(Hit!)) THEN GOTO L_8905
L_88E3:
088F1  SOUND 87, 0.09000001
08902  SOUND 7947, 0.03
L_8905:
08905  RETURN
L_8906:
0890C  FOR I! = 1 TO 6
L_8910:
0892B  LINE (FromX!, FromY!)-(ToX!, ToY!), 1
08949  LINE (FromX!, FromY!)-(ToX!, ToY!), 3, , &HCCCC
0896A  LINE (FromX!, FromY!)-(ToX!, ToY!), 2, , &HCD26
08983  SOUND 14000, SndDur! * 1.3
0899D  SOUND 13500, SndDur! * 1.2
089A9  NEXT I!
L_89BC:
089CF  PUT (192, 24), MapSave, PSET   'dynamic array (descriptor)
089E0  SOUND 99, 0
089E3  RETURN
089EA  PStep3! = PStep!
089F3  FOR U! = 0 TO 1
L_89F6:
08A0A  PX! = DX! * U! + FromX!
08A1E  PY! = DY! * U! + FromY!
08A21  GOSUB SUB_8B7C
08A3B  SOUND 4444, SndDur! * 0.3
08A3E  GOSUB SUB_8B7C
08A52  N_D476! = NOT (CINT(N_D476!))
08A5E  NEXT U! STEP PStep3!
L_8A8D:
08A93  IF Flag! = 0 THEN GOTO L_86E2
L_8A98:
08AB8  LINE (156, 76)-(ToX!, ToY!), 2
08AD1  SOUND 777, SndDur! * 0.6
08AEB  SOUND 888, SndDur! * 0.5
08B05  SOUND 666, SndDur! * 0.7
08B1F  SOUND 777, SndDur! * 0.4
08B39  SOUND 700, SndDur! * 0.8
08B53  SOUND 800, SndDur! * 0.6
08B76  LINE (156, 76)-(ToX!, ToY!), 3
08B79  GOTO L_87B1
SUB_8B7C:
08B7C  GOTO L_8906
08B87  IF (SndDur! = 0) THEN GOTO L_8BF1
L_8B8C:
08B92  FOR Noise! = 1 TO 8
L_8B96:
08BC4  SOUND CINT(RND * 32 + 37), RND / 200 + 0.0275
08BD0  NEXT Noise!
08BEE  SOUND 40, 0.09000001
L_8BF1:
08BF1  RETURN
L_8BF2:
08C04  FlameCol! = UseEGA! * 10 + 1.5
08C0D  FOR I! = 1 TO 15
L_8C10:
08C67  LINE (FromX!, FromY!)-(RND * 10 + ToX! - 4, RND * 10 + ToY! - 4), CINT(RND * 2 + FlameCol!)
08C6A  GOSUB SUB_8C9D
08C76  NEXT I!
08C99  PUT (192, 24), MapSave, PSET   'dynamic array (descriptor)
08C9C  RETURN
SUB_8C9D:
08CB4  SOUND 40, SndDur! * 0.03
08CCE  SOUND 60, SndDur! * 0.05
08CD1  RETURN   'with FAC = SndDur! * 0.05
L_8CD2:
08CD2  GOSUB SUB_8DFD
08CDB  IF Hit! <> 0 THEN GOTO L_8CE1
L_8CE0:
08CE0  RETURN
L_8CE1:
08CEE  ToX! = ToX! - 11
08CFB  ToY! = ToY! - 11
08D0E  PUT (ToX!, ToY!), Burst1, XOR
08D11  GOSUB SUB_8D94
08D28  PUT (ToX!, ToY!), Burst2, XOR
08D2B  GOSUB SUB_8D94
08D42  PUT (ToX!, ToY!), Burst3, XOR
08D45  GOSUB SUB_8D94
08D5C  PUT (ToX!, ToY!), Burst3, XOR
08D5F  GOSUB SUB_87B2
08D76  PUT (ToX!, ToY!), Burst2, XOR
08D79  GOSUB SUB_87B2
08D90  PUT (ToX!, ToY!), Burst1, XOR
08D93  RETURN
SUB_8D94:
08D9C  IF (SndDur! = 0) THEN GOTO L_8DF6
L_8DA1:
08DAF  SOUND 70, 0.04
08DC0  SOUND 40, 0.03
08DD1  SOUND 55, 0.04
08DE2  SOUND 80, 0.05
08DF3  SOUND 60, 0.03
L_8DF6:
08DF6  RETURN
L_8DF7:
08DF7  GOSUB SUB_8DFD
08DFA  GOTO L_8F7C
SUB_8DFD:
08E03  Arc! = 8
08E11  IF ToX! < FromX! THEN GOTO L_8E1E
L_8E16:
08E1B  Arc! = -8
L_8E1E:
08E24  PStep4! = PStep!
08E2D  FOR U! = 0 TO 1
L_8E30:
08E44  ArcY! = SIN(U! * Pi!)
08E6A  PX! = DX! * U! + Arc! * ArcY! + FromX!
08E90  PY! = FromY! - (ArcY! * 20) + DY! * U!
08EA5  PUT (PX!, PY!), Rocket, XOR
08EB5  SOUND 99, 0
08EE2  SOUND CINT(ArcY! * 3000 + 11000), SndDur! * 999
08EE5  GOSUB SUB_8F49
08EFC  PUT (PX!, PY!), Rocket, XOR
08F08  NEXT U! STEP PStep4!
L_8F37:
08F45  SOUND 99, 0
08F48  RETURN
SUB_8F49:
08F55  StepN2! = DelayBase! * 0.03
08F5E  FOR StepI! = 1 TO StepN2!
L_8F62:
08F6B  NEXT StepI!
08F7B  RETURN
L_8F7C:
08F82  IF Hit! <> 0 THEN GOTO L_8F88
L_8F87:
08F87  RETURN
L_8F88:
08F95  ToX! = ToX! - 11
08FA2  ToY! = ToY! - 11
08FB5  PUT (ToX!, ToY!), Boom1, XOR
08FB8  GOSUB SUB_90A3
08FCF  PUT (ToX!, ToY!), Boom2, XOR
08FD2  GOSUB SUB_90A3
08FE9  PUT (ToX!, ToY!), Boom3, XOR
08FEC  GOSUB SUB_90A3
09003  PUT (ToX!, ToY!), Boom4, XOR
09006  GOSUB SUB_90A3
0901D  PUT (ToX!, ToY!), Boom5, XOR
09020  GOSUB SUB_90A3
09037  PUT (ToX!, ToY!), Boom5, XOR
0903A  GOSUB SUB_87B2
09051  PUT (ToX!, ToY!), Boom4, XOR
09054  GOSUB SUB_87B2
0906B  PUT (ToX!, ToY!), Boom3, XOR
0906E  GOSUB SUB_87B2
09085  PUT (ToX!, ToY!), Boom2, XOR
09088  GOSUB SUB_87B2
0909F  PUT (ToX!, ToY!), Boom1, XOR
090A2  RETURN
SUB_90A3:
090AB  IF (SndDur! = 0) THEN GOTO L_9106
L_90B0:
090B6  FOR I! = 1 TO 17
L_90BA:
090EA  SOUND CINT(RND * 26000 + 6000), RND * 0.4 + 0.3
090F6  NEXT I!
L_9106:
09106  RETURN
L_9107:
0911E  SOUND 7777, SndDur! * 1.5
0914C  LINE (FromX!, FromY!)-(ToX!, ToY!), CINT(UseEGA! * 12 + 3)
0915C  SOUND 8888, SndDur!
0917A  LINE (FromX!, FromY!)-(ToX!, ToY!), 0
09191  SOUND 9999, SndDur! * 4
091BF  LINE (FromX!, FromY!)-(ToX!, ToY!), CINT(UseEGA! * 12 + 2)
091D6  SOUND 11111, SndDur! * 4
091EC  PUT (192, 24), MapSave, PSET   'dynamic array (descriptor)
091EF  RETURN   'with FAC = SndDur! * 4
L_91F0:
091F6  PStep5! = PStep!
091FF  FOR U! = 0 TO 1
L_9202:
09216  PUT (PX!, PY!), Rocket, XOR
0922F  SOUND 255, SndDur! * 0.3
0924A  PUT (PX!, PY!), Rocket, XOR
09257  PX! = PX! + Col!
09264  PY! = PY! + Row!
09270  NEXT U! STEP PStep5!
L_929F:
092A5  IF Hit! <> 0 THEN GOTO L_92AB
L_92AA:
092AA  RETURN
L_92AB:
092AB  GOTO L_8CE1
SUB_92AE:
092B4  Carried! = 0
092CC  Rec! = FNIdx(M!, 0)
0939B  G!(CINT(Rec! + 39)) = (G!(CINT(Rec! + 42))) * (SGN(G!(CINT(Rec! + 41)))) + (G!(CINT(Rec! + 44))) * (SGN(G!(CINT(Rec! + 90)))) + (G!(CINT(Rec! + 91))) * (SGN(G!(CINT(Rec! + 47))))
093AA  OwnerCode2! = M! + 2
093B3  FOR I! = 800 TO 1088
L_93B6:
09420  Carried! = Carried! - (((G!(CINT(I! + 9)) = OwnerCode2!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 5))))
0942B  NEXT I! STEP 12
L_943E:
09444  FOR I! = 1100 TO 1397
L_9448:
094B2  Carried! = Carried! - (((G!(CINT(I! + 2)) = OwnerCode2!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 1))))
094BD  NEXT I! STEP 3
L_94D0:
094D6  FOR I! = 2300 TO 2597
L_94DA:
09544  Carried! = Carried! - (((G!(CINT(I! + 2)) = OwnerCode2!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 1))))
0954F  NEXT I! STEP 3
L_9562:
095A9  G!(CINT(Rec! + 14)) = INT((G!(CINT(Rec! + 39)) + Carried!) / 10)
095ED  Tmp! = 2 - ((G!(CINT(Rec! + 14))) / (G!(CINT(Rec! + 13))))
0961C  Tmp! = INT((G!(CINT(Rec! + 12))) * Tmp! + 0.5)
09624  IF Tmp! >= 0 THEN GOTO L_9632
L_9629:
0962C  Tmp! = 0
0962F  GOTO L_9656
L_9632:
0964E  IF G!(CINT(Rec! + 12)) >= Tmp! THEN GOTO L_9656
L_9653:
09653  Tmp! = G!(CINT(Rec! + 12))
L_9656:
09681  G!(CINT(Rec! + 8)) = INT(Tmp! + 0.5)
09684  RETURN   'with FAC = INT(Tmp! + 0.5)
SUB_9685:
0968B  MinusOne2! = -1
09694  FOR I! = 6 TO 1
L_9698:
096C7  SWAP CrewName$(CINT(I! + 2)), CrewName$(CINT(I!))
096D2  NEXT I! STEP MinusOne2!
L_96FB:
096FB  RETURN
SUB_96FC:
09702  MapType! = TerrType!
0970B  FOR I! = 0 TO 8
L_970E:
09714  FOR J! = 0 TO 8
L_9718:
09739  Map%(CINT(I!) + CINT(J!) * 9) = 1
09747  NEXT J!
09760  NEXT I!
09779  IF MapType! <= 9 THEN GOTO L_97E1
L_977E:
09784  FOR I! = 0 TO 8
L_9788:
0979F  Map%(CINT(I!) * 9) = 3
097AC  Map%(CINT(I!) * 9 + 8) = 3
097B6  Map%(CINT(I!)) = 3
097C3  Map%(CINT(I!) + 72) = 3
097D1  NEXT I!
L_97E1:
097E7  MinusOne3! = -1
097F0  FOR TileType! = 4 TO 2
L_97F4:
09806  NSpecial! = INT(RND * 15)
09814  IF TerrType! <> 11 THEN GOTO L_982D
L_9819:
0982A  NSpecial! = (1.5 - EncAdd!) * 14
L_982D:
09833  NSpecial2! = NSpecial!
0983C  FOR I! = 1 TO NSpecial2!
L_9840:
0988A  Map%(CINT(INT(RND * 7 + 1)) + CINT(INT(RND * 7 + 1)) * 9) = CINT(TileType!)
09894  NEXT I!
098AD  NEXT TileType! STEP MinusOne3!
L_98DC:
098E2  FOR Col4! = 4 TO 7
L_98E6:
09911  Map%(CINT(Col4!) * 9 + 4) = SGN(Map%(CINT(Col4!) * 9 + 4) - 1) + 1
0991D  NEXT Col4!
09933  MinusOne4! = -1
0993C  FOR J! = 7 TO 1
L_9940:
09950  PY! = J! * 16 + 16
09959  FOR I! = 1 TO 7
L_995C:
0996E  PX! = I! * 16 + 184
09993  ON Map%(CINT(I!) + CINT(J!) * 9) GOTO L_999F, L_99B9, L_99F9, L_9A13
L_999F:
099B3  PUT (PX!, PY!), TileBank, XOR
099B6  GOTO L_9A2A
L_99B9:
099CD  PUT (PX!, PY!), Tile2, XOR
099E0  GrpX!(6) = I! * 2 + 24.5
099F3  GrpY!(6) = J! * 2 + 3.5
099F6  GOTO L_9A2A
L_99F9:
09A0D  PUT (PX!, PY!), Tile3, XOR
09A10  GOTO L_9A2A
L_9A13:
09A27  PUT (PX!, PY!), Tile4, XOR
L_9A2A:
09A33  NEXT I!
L_9A46:
09A4F  NEXT J! STEP MinusOne4!
L_9A7E:
09A84  GrpX!(7) = 32.5
09A8F  GrpY!(7) = 99
09A97  GrpX!(8) = 32.5
09AA0  GrpY!(8) = 11.5
09AAC  IF MapType! <= 10 THEN GOTO L_9B05
L_9AB1:
09AB1  Map%(76) = 1
09AE3  LINE (245, 144)-(265, 151), CINT(3 - (UseEGA! * 2)), BF
09B02  LINE (247, 144)-(263, 151), 0, BF
L_9B05:
09B05  RETURN
SUB_9B06:
09B0F  IF UseEGA! = 1 THEN GOTO L_9D41
L_9B14:
09B26  IF ABS(TIMER - PortTimer!) >= 0.123 THEN GOTO L_9B2C
L_9B2B:
09B2B  RETURN   'with FAC = ABS(TIMER - PortTimer!)
L_9B2C:
09B32  PortTimer! = TIMER
09B5B  IF NOT ((PortraitCGA(CINT(FramePos!)) = 0) OR (FramePos! = 0)) THEN GOTO L_9B68
L_9B60:
09B65  FramePos! = 618
L_9B68:
09B6E  IF PortTick! <> 0 THEN GOTO L_9C59
L_9B73:
09BA7  PortGroup! = (PortGroup! + 1) * ABS(NGroups! - 1 > PortGroup!)
09BC7  LINE (7, 7)-(96, 23), 0, BF
09BD0  LOCATE 2, 2
09BD3  PRINT CHR$(CINT(PortGroup! + 65))
09C1D  LOCATE 2, CINT(7.5 - ((LEN(GrpName1$(CINT(PortGroup!)))) * 0.5))
09C20  PRINT GrpName1$(CINT(PortGroup!))
09C4B  LOCATE 3, CINT(7.5 - ((LEN(GrpName2$(CINT(PortGroup!)))) * 0.5))
09C4E  PRINT GrpName2$(CINT(PortGroup!))
L_9C59:
09C83  PortTick! = (PortTick! + 1) * ABS(PortTick! < 13)
09C8F  IF NGroups! <> 1 THEN GOTO L_9C9C
L_9C94:
09C99  PortTick! = 1
L_9C9C:
09CAA  ON PortraitCGA(CINT(FramePos!)) GOTO L_9CB8, L_9CD1, L_9CEA, L_9D03, L_9D1C
L_9CB8:
09CCB  PUT (8, 25), PortraitCGA, PSET
09CCE  GOTO L_9D32
L_9CD1:
09CE4  PUT (8, 25), PortFrame1, PSET
09CE7  GOTO L_9D32
L_9CEA:
09CFD  PUT (8, 25), PortFrame2, PSET
09D00  GOTO L_9D32
L_9D03:
09D16  PUT (8, 25), PortFrame3, PSET
09D19  GOTO L_9D32
L_9D1C:
09D2F  PUT (8, 25), PortFrame4, PSET
L_9D32:
09D3D  FramePos! = FramePos! + 1
09D40  RETURN   'with FAC = FramePos!
L_9D41:
09D53  IF ABS(TIMER - PortTimer!) >= DamageSum! THEN GOTO L_9D59
L_9D58:
09D58  RETURN   'with FAC = ABS(TIMER - PortTimer!)
L_9D59:
09D5F  PortTimer! = TIMER
09D88  IF NOT ((PortraitEGA(CINT(FramePos!)) < 0) OR (FramePos! = 0)) THEN GOTO L_9D95
L_9D8D:
09D92  FramePos! = 1240
L_9D95:
09DA9  IF ABS(NameTimer! - TIMER) <= 2 THEN GOTO L_9E9C
L_9DAE:
09DB3  NameTimer! = TIMER
09DEA  PortGroup! = (PortGroup! + 1) * ABS(NGroups! - 1 > PortGroup!)
09E0A  LINE (7, 7)-(96, 23), 0, BF
09E13  LOCATE 2, 2
09E16  PRINT CHR$(CINT(PortGroup! + 65))
09E60  LOCATE 2, CINT(7.5 - ((LEN(GrpName1$(CINT(PortGroup!)))) * 0.5))
09E63  PRINT GrpName1$(CINT(PortGroup!))
09E8E  LOCATE 3, CINT(7.5 - ((LEN(GrpName2$(CINT(PortGroup!)))) * 0.5))
09E91  PRINT GrpName2$(CINT(PortGroup!))
L_9E9C:
09EA5  IF NGroups! <> 1 THEN GOTO L_9EB3
L_9EAA:
09EB0  NameTimer! = TIMER
L_9EB3:
09EC1  ON PortraitEGA(CINT(FramePos!)) GOSUB L_9F02, L_9F19, L_9F38, L_9F57
09EF1  DamageSum! = (PortraitEGA(CINT(FramePos! + 1))) / 100
09EFE  FramePos! = FramePos! + 2
09F01  RETURN   'with FAC = FramePos!
L_9F02:
09F15  PUT (8, 25), PortraitEGA, PSET
09F18  RETURN
L_9F19:
09F34  PUT (FrameDX1% + 8, FrameDY1% + 25), PortEgaFrame1, XOR
09F37  RETURN
L_9F38:
09F53  PUT (FrameDX2% + 8, FrameDY2% + 25), PortEgaFrame2, XOR
09F56  RETURN
L_9F57:
09F72  PUT (FrameDX3% + 8, FrameDY3% + 25), PortEgaFrame3, XOR
09F75  RETURN
SUB_9F76:
09FBD  TgtGrp! = (UnitHP!(CINT(Unit!) + CINT(Grp!) * 5) <= 0) * -6
09FCC  TgtGrp! = UnitWeapon!(CINT(Unit!) + CINT(Grp!) * 5) + TgtGrp!
09FE1  PX! = Unit! * 16 + 112
09FF3  PY! = Grp! * 16 + 16
09FFB  IF UnitWeapon!(CINT(Unit!) + CINT(Grp!) * 5) <> 0 THEN GOTO L_A01B
L_A000:
0A018  TgtGrp! = GrpAttackVerb!(CINT(Grp!)) + TgtGrp! + 2
L_A01B:
0A021  ON CINT(TgtGrp!) GOTO L_A055, L_A06D, L_A03D, L_A085, L_A09D, L_A0B5, L_A0E5, L_A0FD, L_A0CD, L_A115, L_A12D, L_A145
L_A03D:
0A051  PUT (PX!, PY!), UnitSprite0, PSET
0A054  RETURN
L_A055:
0A069  PUT (PX!, PY!), UnitSprite1, PSET
0A06C  RETURN
L_A06D:
0A081  PUT (PX!, PY!), UnitSprite2, PSET
0A084  RETURN
L_A085:
0A099  PUT (PX!, PY!), UnitSprite3, PSET
0A09C  RETURN
L_A09D:
0A0B1  PUT (PX!, PY!), UnitSprite4, PSET
0A0B4  RETURN
L_A0B5:
0A0C9  PUT (PX!, PY!), UnitSprite5, PSET
0A0CC  RETURN
L_A0CD:
0A0E1  PUT (PX!, PY!), UnitSprite0, PRESET
0A0E4  RETURN
L_A0E5:
0A0F9  PUT (PX!, PY!), UnitSprite1, PRESET
0A0FC  RETURN
L_A0FD:
0A111  PUT (PX!, PY!), UnitSprite2, PRESET
0A114  RETURN
L_A115:
0A129  PUT (PX!, PY!), UnitSprite3, PRESET
0A12C  RETURN
L_A12D:
0A141  PUT (PX!, PY!), UnitSprite4, PRESET
0A144  RETURN
L_A145:
0A159  PUT (PX!, PY!), UnitSprite5, PRESET
0A15C  RETURN
SUB_A15D:
0A171  LastTgt! = FirstTgt! + NTargets! - 1
0A185  BoxX0! = FirstTgt! * 16 + 112
0A197  BoxX1! = LastTgt! * 16 + 127
0A1AE  BoxY0! = Grp! * 16 + 16
0A1BD  BoxY1! = Grp! * 16 + 31
SUB_A1C0:
0A1DC  GET (BoxX0!, BoxY0!)-(BoxX1!, BoxY1!), BoxSave
0A1EE  PUT (BoxX0!, BoxY0!), BoxSave, PRESET   'dynamic array (descriptor)
0A1F7  FOR K! = 1 TO 7
L_A1FA:
0A200  MinusK! = -1000
0A209  FOR I! = 3000 TO 1000
L_A20C:
0A237  SOUND CINT(3300 - I!), (I! * SndDur!) / 12000
0A243  NEXT I! STEP MinusK!
L_A26C:
0A280  PUT (BoxX0!, BoxY0!), BoxSave, XOR   'dynamic array (descriptor)
0A289  FOR I! = 1000 TO 3000
L_A28C:
0A2B1  SOUND CINT(I!), (I! * SndDur!) / 12000
0A2BD  NEXT I! STEP 1000
0A2E1  PUT (BoxX0!, BoxY0!), BoxSave, XOR   'dynamic array (descriptor)
0A2ED  NEXT K!
L_A300:
0A300  RETURN
SUB_A301:
0A315  LastTgt! = FirstTgt! + NTargets! - 1
0A320  BoxX0! = 8
0A329  BoxX1! = 191
0A33B  BoxY0! = FirstTgt! * 8 + 88
0A34D  BoxY1! = LastTgt! * 8 + 95
0A350  GOSUB SUB_A1C0
0A367  PUT (BoxX0!, BoxY0!), BoxSave, PSET   'dynamic array (descriptor)
0A36A  RETURN
SUB_A36B:
0A371  NTargets! = 1
0A38E  FirstTgt! = FNCrew(M!, 33)
0A3AB  Grp! = FNCrew(M!, 38)
0A3D4  Damage! = INT(FNCrew(M!, 5) * 0.25)
0A3E0  IF MemberCmd! <> 8 THEN GOTO L_A42F
L_A3E5:
0A42C  G!(CINT(FNIdx(I!, 52))) = FNCrew(I!, 52) - 1
L_A42F:
0A454  G!(CINT(FNIdx(M!, 37))) = 0
0A457  GOSUB SUB_2EFC
0A463  LOCATE 21, 2
0A466  PRINT CrewName$(CINT(M!)); " uses "; CmdName$(CINT(MemberCmd!)); "."
0A4AA  LOCATE 23, 2
0A527  IF NOT ((UnitHP!(CINT(FirstTgt!) + CINT(Grp!) * 5) < 1) OR ((RND * 100 > FNCrew(M!, 5) * 0.25) AND (MemberCmd! = 10))) THEN GOTO L_A53B
L_A52C:
0A52C  PRINT "It fails."
0A538  GOTO L_A71C
L_A53B:
0A547  PsiN! = MemberCmd! - 7
0A550  FOR I! = 1 TO PsiN!
L_A554:
0A55A  FOR K! = 1 TO 10
L_A55E:
0A58F  SOUND CINT((I! + K!) * 1000), (K! * SndDur!) / 5
0A59B  NEXT K!
0A5BE  PUT (192, 24), MapSave, PRESET   'dynamic array (descriptor)
0A5D0  PUT (192, 24), MapSave, PSET   'dynamic array (descriptor)
0A5DC  NEXT I!
L_A5EF:
0A5F8  IF MemberCmd! = 9 THEN GOTO L_A751
L_A5FD:
0A5FD  GOSUB SUB_A15D
0A600  PRINT GrpName$(CINT(Grp!));
0A622  IF MemberCmd! <> 10 THEN GOTO L_A653
L_A627:
0A627  PRINT " dies."
0A64D  UnitHP!(5 * CINT(Grp!) + CINT(FirstTgt!)) = 0
0A650  GOTO L_A6DC
L_A653:
0A653  PRINT " takes"; INT(Damage!); "damage";
0A69D  UnitHP!(CINT(Grp!) * 5 + CINT(FirstTgt!)) = UnitHP!(CINT(Grp!) * 5 + CINT(FirstTgt!)) - Damage!
0A6A8  IF UnitHP!(CINT(Grp!) * 5 + CINT(FirstTgt!)) >= 1 THEN GOTO L_A6D0
L_A6AD:
0A6B2  UnitHP!(CINT(Grp!) * 5 + CINT(FirstTgt!)) = 0
0A6BE  LOCATE 24, 2
0A6C1  PRINT "and dies.";
0A6CD  GOTO L_A6DC
L_A6D0:
0A6D0  PRINT "."
L_A6DC:
0A700  IF UnitHP!(CINT(FirstTgt!) + CINT(Grp!) * 5) <= 0 THEN GOTO L_A71C
L_A705:
0A719  PUT (BoxX0!, BoxY0!), BoxSave, PSET   'dynamic array (descriptor)
SUB_A71C:
0A728  PauseN4! = DelayUnits! * 0.5
0A731  FOR I! = 1 TO PauseN4!
L_A734:
0A734  GOSUB SUB_2913
0A740  NEXT I!
0A750  RETURN
L_A751:
0A798  G!(CINT(FNIdx(I!, 53))) = FNCrew(I!, 53) - 1
0A7A1  FOR I! = 1 TO 6
L_A7A4:
0A7BE  IF FNCrew(I!, 31) <= 0 THEN GOTO L_A80F
L_A7C3:
0A7FA  Heal! = FNCrew(I!, 51) - FNCrew(I!, 15)
0A805  IF Heal! <= 5 THEN GOTO L_A80F
L_A80A:
0A80C  Heal! = 5
L_A80F:
0A815  IF Heal! <= 0 THEN GOTO L_A899
L_A81A:
0A823  LOCATE 23, 2
0A826  PRINT CrewName$(CINT(I!)); " is healed.         "
0A893  G!(CINT(FNIdx(I!, 15))) = INT(FNCrew(I!, 15) + Heal!)
0A896  GOSUB SUB_A71C
L_A899:
0A8A2  NEXT I!
L_A8B5:
0A8B5  GOSUB SUB_2C93
SUB_A8B8:
0A8C1  IF GrpPortrait!(0) <> 3 THEN GOTO L_A8CF
L_A8C6:
0A8CC  N_1A04! = 1
L_A8CF:
0A8D5  FOR K! = 110 TO 159
L_A8D8:
0A8F2  IF G!(CINT(K!)) <> 1 THEN GOTO L_A907
L_A8F7:
0A8FC  G!(CINT(K!)) = 2
0A904  K! = 222
L_A907:
0A910  NEXT K!
0A920  RETURN
```

## Subroutines (near CALL targets)

| sub | calls | role |
|---|---|---|
| SUB_06A9 | 100 | DEF FNCrew(member, field) = INT(G!(member*100 + field + 1500) + .1)  'squad-member record field (member 1..6 = ship crew 3..8); inlined |
| SUB_06DB | 70 | DEF FNIdx(member, field) = INT(member*100 + field + 1500.5)  'index of a squad-member field in G!(); inlined |
| SUB_1669 | 1 | copy the ENCINFO columns of the previous group into the new group (same record continues: 1644) |
| SUB_179F | 9 | DEF FNDist(a, b) = SQR((GrpX!(a)-GrpX!(b))^2 + (GrpY!(a)-GrpY!(b))^2)  'distance between position slots (groups 0..3, 5 squad, 6 special tile, 7 exit, 8 centre); inlined |
| SUB_17F8 | 2 | DEF FNRanged(g) = -(FNDist(g, 5)*10 - WepReach!*2 < 7)  'group g within twice the weapon reach of the squad; inlined |
| SUB_183B | 5 | DEF FNInRange(g) = -(FNDist(g, 5)*10 - WepReach! < 7)  'group g within the weapon reach of the squad; inlined |
| SUB_1875 | 4 | DEF FNMap(s) = Map%(INT(GrpX!(s)*0.5 - 12) + INT(GrpY!(s)*0.5 - 1.5)*9)  'terrain type under position slot s; inlined |
| SUB_18D5 | 5 | DEF FNOffMap(s) = -((GrpY!(s) > 18) OR (GrpY!(s) < 5) OR (GrpX!(s) < 26) OR (GrpX!(s) > 39))  'slot s is outside the 7x7 map; inlined |
| SUB_1932 | 2 | DEF FNPassable(s) = ABS(FNMap(s) <> 3)  '+1 when slot s stands on a passable cell (type 3 = inaccessible), 0 otherwise: bytes 1944-194E are mov bx,0 / je / dec bx / and bx,bx / jge / neg bx = the integer ABS idiom applied to the -1/0 comparison (callers only test <> 0: squad moves undone + BEEP when 0 at 4FA2-4FC8, enemy moves get +1e20 at 4B65); inlined - verify fix, ABS rendering by crossref (F-5 sweep) |
| SUB_21E6 | 2 | clear member I!'s oxygen-item flags (fields 33, 56, 40) |
| SUB_2263 | 2 | field 58 (stamina) of member K! = field 8 (current movement) * 3 |
| SUB_2913 | 5 | delay: Delay!*0.6 loop, portrait tick (SUB_9B06), Delay!*0.5 loop, portrait tick |
| SUB_299B | 5 | credits = CreditsHi!*30000 + CreditsLo! + Delta!, capped 9999999, split back; Delta! = total |
| SUB_29EB | 3 | print the A:R column of member I! at row I!+12 col 22: string at DS 0xCA12 (hand weapon), string at DS 0xCA1E (ammo < 0) or ammo digit ":" reload digit |
| SUB_2BBC | 1 | member picker: PRINT Prompt$; digit 1..6 -> M!, ENTER -> 0 (portrait ticks while waiting) |
| SUB_2C3C | 15 | long pause = 5 x SUB_2913 |
| SUB_2C63 | 1 | PRINT string at DS 0xCA3A; wait for CHR$(13) |
| SUB_2C93 | 3 | redraw the six member rows (SUB_2CF3) and compute EquipHit! = 1 when every member has status 0 (all dead) |
| SUB_2CF3 | 1 | member row I!+12: name at col 4, HP at col 12, Status$ at col 17 |
| SUB_2D98 | 2 | print the A:R column of all six members (SUB_29EB) |
| SUB_2DBF | 6 | menu key: Cmd! = ASC(INKEY$) upper-cased - 64 within CmdMin!..CmdMax!, or -51 ENTER / -32 SPACE |
| SUB_2E4E | 1 | key reader: extended keys -> Cmd! 1..11, letters -> 12..37, ENTER 37 |
| SUB_2EFC | 20 | clear the message panel: LINE (8,152)-(311,191),0,BF |
| SUB_2F1E | 2 | clear the message panel below row 20: LINE (8,160)-(311,191),0,BF |
| SUB_2F40 | 1 | clear rows 23-24: LINE (8,176)-(311,191),0,BF |
| SUB_2FA6 | 1 | numeric input (MaxLen! = 4) via SUB_2FAF |
| SUB_2FAF | 1 | line editor at the cursor: K$ typed with BACKSPACE, digits only when MaxLen! = 4, ENTER ends; InputVal% = CINT(VAL(K$)) |
| SUB_34BA | 1 | YesNo! from Y/N (portrait ticks while waiting) |
| SUB_3D02 | 4 | EnemyValue! = sum over groups of GrpSize!*GrpValue! |
| SUB_3D68 | 5 | group status pass: off-map groups (FNOffMap) get state 2 and position 9999; count living units (Flag!); none -> state 1; a reduced active group (size>4 with 2 left, >2 with 1 left) -> state 3 and tactic 5 (flee); ActiveGroups! = groups with state > 2.5; EnemyStr!; Surrendered! = 1 when none active; the squad off the map ends the battle (NewState! 2) |
| SUB_3FB9 | 2 | SquadStr! = sum over living members of HP/6 + 2*G!(slot*12+796) |
| SUB_407B | 5 | every group with state > 2 gets GrpState! = NewState! |
| SUB_436D | 1 | boarding epilogue (TerrType! = 10): tow/kill bookkeeping in G!(310..315), SPACE encounter flags, string at DS 0xCE3C or string at DS 0xCE62 (salvage into the smallest G!(330..339) slot) |
| SUB_4E3D | 3 | redraw the battlefield: PUT the enemy info save, the group letters (SUB_4EF7, Z..A), the squad icon, then GET (192,24)-(319,151) into MapSave |
| SUB_4EF7 | 1 | print the group letter NewState! (CHR$) at (GrpY!, GrpX!) unless off the map |
| SUB_52FD | 2 | weapon line: string at DS 0xCF8E or text with the STARPORT string at DS 0xACB8reloads" " + "*"/" " + LEFT$(WeaponName$(type-1),31) |
| SUB_7151 | 2 | enemy unit (AtkGrp!, Unit!) acts when its initiative >= InitLevel!: chooses melee/rockets/flames (NewWep!), part of the string at DS 0xD260 (one turn lost) or attacks: picks a random living member, hit chance 50 - INT(dist/reach)*25 - defence + terrain, clipped 10..90, projectile (SUB_7FC1 + the weapon routine), string at DS 0xD2D8/string at DS 0xD2C8, damage INT(RND^.5*Damage! - armour) to 1..NTargets! members, death (status 0, 4 x SOUND) or a 1-in-2 critical (sighting/hand weapon/armour/weapon/ammo destroyed), member row update, pauses |
| SUB_7FC1 | 2 | projectile geometry from slot AtkGrp!/Target! (FromX!/FromY! -> ToX!/ToY!, a miss is extended to the map edge), PStep! and the per-step increments Col!/Row! |
| SUB_81EB | 1 | squad member fires at group Grp!: projectile by weapon type (ON WepType! GOSUB: 1-2 dot, 3 shot, 4 beam lines, 5 lightning, 6 flame, 7 rocket+burst, 8 big explosion, 9-11 burst, 12 zap); on a hit: NTargets!/FirstTgt! (area weapons 6..11 hit several units), SUB_A15D flash, damage INT(RND^.5*WepDmg!+1) - UnitArmor! per unit, kills (Killed!), 1-in-2 critical on the unit's equipment (ON RND*8 GOSUB 84DC..8632), redraw the group |
| SUB_87B2 | 8 | projectile pause: DelayBase!*0.01 empty loop |
| SUB_8B7C | 2 | beam weapon (type 5): 6 LINE flashes in colours 1/3/2 with styles and SOUND 14000/13500, then restore MapSave (shared with 8906) |
| SUB_8C9D | 1 | two short SOUNDs (40, 60) of the flame thrower |
| SUB_8D94 | 3 | five short SOUNDs of the small burst |
| SUB_8DFD | 2 | rocket flight: Rocket sprite XORed along a sine arc (Arc!*SIN(t*Pi!)) with rising SOUND, SUB_8F49 pauses |
| SUB_8F49 | 1 | projectile pause: DelayBase!*0.03 empty loop |
| SUB_90A3 | 5 | 17 random SOUNDs (6000..32000 Hz) of the big explosion |
| SUB_92AE | 1 | recompute member M!'s carried weight (Carried!) and current movement G!(rec+8) (same formula as INSIDE SUB_4B30) |
| SUB_9685 | 1 | shift the crew names back (SWAP CrewName$(I!+2), CrewName$(I!) for I! = 6 TO 1 STEP -1) before CHAIN |
| SUB_96FC | 1 | build Map%: all 1, border 3 for rooms and ships (TerrType! > 9; bottom row too, 97C3), NSpecial! random cells of types 4, 3, 2 (loop 4 downto 2), column 4 rows 4..7 = SGN(cell-1)+1 (9911), then draw rows 7 downto 1: tiles XOR at (i*16+184, j*16+16), remember the type-2 cell as TileX!/TileY!, set the exit/centre slots; for rooms (TerrType! > 10) open the door cell `Map%(76) = 1` (9AB1, cell (4, 8)) and draw the door box (9AE3-9B02) |
| SUB_9B06 | 10 | portrait tick: CGA path every 0.123 s / EGA path per script delay: cycle the group name box (SUB name rows 2-3), step the BIGSH frame script (ON frame GOTO/GOSUB PUT (8,25) PSET or XOR frames) |
| SUB_9F76 | 3 | draw unit Unit! of group Grp! at (Unit!*16+112, Grp!*16+16): sprite by weapon/attack verb, PSET alive / PRESET dead (HP <= 0 adds -6 -> cases 7..12) |
| SUB_A15D | 2 | attacked-unit box: GET the units FirstTgt!..LastTgt! of group Grp! (16x16 cells at x = unit*16+112, y = group*16+16) into BoxSave then SUB_A1C0 |
| SUB_A1C0 | 1 | flash the box: PRESET, then 7 x (descending SOUND sweep 3000..1000 step -1000, XOR, ascending sweep, XOR) |
| SUB_A301 | 1 | attacked-member box: rows FirstTgt!..LastTgt! of the member list (y = row*8+88, x 8..191) flashed by SUB_A1C0 then restored |
| SUB_A36B | 1 | esper attack by member M!: Mindshock (8, uses field 52), Healing (9 -> A751: every living member healed up to 5 HP, field 53 -1), Psychic Scream (10, needs RND*100 <= Esper/4): flash the target unit (SUB_A15D), string at DS 0xD552; CmdName$; damage INT(Esper*0.25) or death for a Scream, string at DS 0xD55C when the unit is dead or the roll fails |
| SUB_A71C | 1 | pause DelayUnits!*0.5 x SUB_2913 |
| SUB_A8B8 | 1 | after a won boarding of portrait type 3: G!(109) = 1; the first G!(110..159) element equal to 1 becomes 2 |

## Variables

Addresses are DS offsets. kinds: N = 4-byte single, S = string descriptor, I = integer, P = array/untyped (PUT/BLOAD target). Names come from `PLBATTLE_names.json` (evidence column = why).
| address | kinds (uses) | name | evidence |
|---|---|---|---|
| 0x1868 | N x2 | TowLinkCond! | G!(6): condition of slot 6 "Tow Link" (EquipName$(6)): 2 = broken -> string at DS 0xCE3C (446C-4471), else string at DS 0xCE62 - crossref |
| 0x1988 | N x18 | CreditsHi! | G!(78): credits = CreditsHi!*30000 + CreditsLo! (SUB_299B 29B0-29E7) |
| 0x198C | N x8 | CreditsLo! | G!(79): low part of the credits (SUB_299B) |
| 0x1994 | N x1 | N_1994! | G!(81): = 1 in the debug fill only (0C36) |
| 0x19A4 | N x2 | DriveCfg! | G!(85): 1 -> string at DS 0x940C, 2 -> string at DS 0x9416 (0087-00A9) |
| 0x19A8 | N x2 | StdDelay! | G!(86): string at DS 0xCFB8; StdDelay! (5447) |
| 0x19B0 | N x9 | Delay! | G!(88): string at DS 0xCFD0; Delay! (5466); SUB_2913 loops Delay!*0.6 and Delay!*0.5 times; new value 1..9999 at 54BD |
| 0x19B4 | N x23 | UseEGA! | G!(89): 1 -> SCREEN 7 (006A-0072), .EGA sprite files (0301-0349, 1996-19E0), colour 1 instead of 3 for the frame bars (2729), and the EGA BIGSH animation path in SUB_9B06 (9B0F); set to 1 in the standalone path when DebugLoad! = 1 (0167) |
| 0x19C4 | N x2 | SoundOff! | G!(93): SndDur! = 1 - SoundOff! (00C7) |
| 0x1A04 | N x1 | N_1A04! | G!(109): = 1 at A8CC when the enemy portrait is 3 (SUB_A8B8, after a won boarding) |
| 0x1BFC | N x1 | N_1BFC! | G!(235): = 99 in the debug fill only (0DCC) |
| 0x1CC4 | N x1 | N_1CC4! | G!(285): = 999 in the debug fill only (0DD5) |
| 0x1D28 | N x6 | KillStartAll! | G!(310): first kill-list index since the game start (SPACE); decremented in the boarding epilogue (43D8) when a lost boarding retracts the kill entry - crossref name |
| 0x1D2C | N x3 | KillPtr! | G!(311) COMMON: kill-list write index (SPACE KillPtr!); slot of the boarded ship (4373: TowIdx! = it; 43C8 = TowIdx!-1 wrapping to 49 when the boarding was lost) - crossref name |
| 0x1D30 | N x6 | KillStartMission! | G!(312): first kill-list index of the mission (SPACE); decremented at 43E5 - crossref name |
| 0x1D34 | N x6 | Kills! | G!(313): decremented in the boarding epilogue (4400); SPACE_names.json: SPACE string at DS 0xB42A |
| 0x1D38 | N x6 | KillStartPort! | G!(314): first kill-list index since the starport (SPACE); decremented at 43F2 - crossref name |
| 0x1D3C | N x6 | Tonnage! | G!(315): -= G!(TowIdx!+260) (43BF); SPACE_names.json: SPACE string at DS 0xB434 |
| 0x3AE8 | N x3 | ChainArg! | G!(2214) COMMON: record for the chained module (crossref ChainArg!): here the first ENCINFO record (0-based line) to load (0E4E -> EncRec!) = INSIDE's EnemyGroup! / SPACE's encounter id; 20 in the debug fill, 18 for the debug boarding |
| 0x3B1C | N x1 | EntryMode! | G!(2227) COMMON: entry mode set by STARPORT (1) / SPACE (0, 3, 4): 1 -> CHAIN SPACE.STR, else CHAIN INSIDE.EXE (432D-434A) - crossref name |
| 0x3B20 | N x2 | Terrain! | G!(2228): combat terrain 1..13 = TerrainName$ index and the TR-n tile file (0197 -> TerrType!; INSIDE sets 11 = room, SPACE/SPBATTLE 10 = DATA line 297); 1..9 outdoor (walk off the map to escape), 10 = inside a ship (no escape), >10 = rooms (door at the bottom) |
| 0x3B24 | N x1 | Surprise! | G!(2229) COMMON: surprise code from SPACE/INSIDE/SPBATTLE: 2 = string at DS 0xBB0A, 1 = string at DS 0xBB26 (01D3-01F5) -> SurpriseCur! - crossref name |
| 0x3B40 | N x3 | MissionCodeB! | G!(2236) COMMON: mission code of target 2 (SPACE); zeroed at 4454 when LastEnemyType! = it - 50 (boarding of the mission ship) - crossref name |
| 0x3B44 | N x2 | MissionType! | G!(2237) COMMON: mission type (SPACE); MissionType!-10 = LastEnemyType! -> SUB_A8B8 completes the mission (4413) - crossref name |
| 0x3B50 | N x3 | MissionCodeA! | G!(2240) COMMON: mission code of target 1 (SPACE); zeroed at 4436 when LastEnemyType! = it - 50 - crossref name |
| 0x3B78 | N x1 | Gravity10! | G!(2250) COMMON: gravity x10 (SPACE planet, 1 at a station, 10 = 1 g from SPBATTLE/INSIDE): Gravity! = INT(G!(2250))/10 (0179) - crossref name |
| 0x3B7C | N x9 | BoardCrew! | G!(2251): when boarding a ship (TerrType! = 10, enemy type with Portrait! <> 3) the group size is taken from it and it is reduced by 3 per group (12B3-12D3); when > 3 the next group is forced (1299). Set by SPBATTLE. M |
| 0x3B80 | N x1 | Breathable! | G!(2252): SGN of it printed as string at DS 0xBB90 (1) / string at DS 0xBBA2 (02B0-02C4) -> Atmos!; set by INSIDE (0 for its locations 3 and 6) |
| 0x3B88 | N x4 | BattleWon! | G!(2254): = -((CreditsGained! > 0) OR (Surrendered! > 0)) before the CHAIN (430D); INSIDE reads it at its 0D51 |
| 0x3BA0 | N x1 | Enclosure! | G!(2260): INSIDE's room enclosure 0..2, added to TerrType! 11 to pick text with the INSIDE string at DS 0x829C (0224-022E) |
| 0x3BAC | N x3 | LastEnemyType! | G!(2263) COMMON: last space enemy type fought (set by SPBATTLE 2F16); compared with MissionType!-10, MissionCodeA!-50, MissionCodeB!-50 in the boarding epilogue (4413-444A) - crossref name |
| 0x488C | S x1 | ShipName$ | CHARNAME field 1 (05ED, standalone path) |
| 0x89F6 | I x1 | FrameDX1% | x offset of PortEgaFrame1 (9F34), stored in the .EGA file |
| 0x89F8 | I x1 | FrameDY1% | y offset of PortEgaFrame1 |
| 0x89FA | I x1 | FrameDX2% | x offset of PortEgaFrame2 (9F53) |
| 0x89FC | I x1 | FrameDY2% | y offset of PortEgaFrame2 |
| 0x89FE | I x1 | FrameDX3% | x offset of PortEgaFrame3 (9F72) |
| 0x8A00 | I x1 | FrameDY3% | y offset of PortEgaFrame3 |
| 0x9404 | S x12 | Drive$ | assigned ""/string at DS 0x940C/string at DS 0x9416 at 007B-00A9 from DriveCfg!; prefixed to the TR-n (0333/0380), LOGO.EGA (0349), BIGSH-n.BAS (1990), PLBTSH (19DA/19F2), ENCINFO (0E67) names and the CHAIN targets; NOT prefixed for BIGSH-n.EGA (19BD) and the debug-path string at DS 0xC0DC (0509) - verify fix |
| 0x9422 | N x3 | Pi! | = 3.14159 (00B8); SIN(t * Pi!) in the rocket arc (8E44) |
| 0x9426 | N x52 | SndDur! | = 1 - SoundOff! (00C7); multiplier of every SOUND duration; 0 disables the sound bursts (8699, 87EC, 8B87 ...) |
| 0xBA90 | N x511 | I! | FOR counter of most loops (00D0, 0108, 0389 ...) |
| 0xBAD4 | N x4 | DebugLoad! | never assigned (module local above 0x7FAA): a nonzero value would BLOAD CHARINFO (0151), LOGO/NAME/CHARNAME (04F8-0650) and run the part of the string at DS 0xC134 debug fill (071C-0E33); 0 at run time |
| 0xBAE4 | N x10 | Gravity! | = INT(Gravity10!)/10 (0179); PRINT string at DS 0xBB5A; Gravity! (026B); Fatigue! = Gravity!^3 above 1 g |
| 0xBAE8 | N x7 | Atmos! | = SGN(Breathable!) (0185); 1 -> string at DS 0xBB90 (02B5), else string at DS 0xBBA2; oxygen check skipped when 1 (1D6D); members without oxygen lose Fatigue!*22 stamina per movement phase (4647) |
| 0xBAEC | N x10 | SurpriseCur! | working copy of Surprise! (018E): 2 squad surprised (enemies move first, squad skips the first movement 4761), 1 enemy surprised (enemies skip 496C); cleared after the first round (70DD); the debug fill sets 1 - crossref name (was Surprise!) |
| 0xBAF0 | N x16 | TerrType! | = Terrain!, min 1 (0197-01A9): TerrainName$(TerrType! + EncAdd!) printed (02D0), TR-n file (0333), escape text (047D-04CB), map border (9779), wall tiles 9AAC |
| 0xBB42 | N x7 | EncAdd! | = Enclosure! when TerrType! = 11 (0224-022E), else 0; also the chance of a special tile row count for rooms (982A) |
| 0xBB4E | N x14 | Fatigue! | = Gravity!, min 0.5, Gravity!^3 above 1 (0237-0268); printed as part of the string at DS 0xBB66 INT(Fatigue!*100)/100; stamina costs Fatigue!*22 / *4 / *8 (46AC, 48AA, 55E4) |
| 0xBC62 | I x1 | Map%(76) | element 76 of Map% = cell (x 4, y 8), the door cell under the door box: 0xBBCA + 2*76 = 0xBC62. The compiler folded the constant index into a direct store (`mov word ptr [0xBC62],1` at 9AB1), which the decode had read as a scalar "HasDoor%". For TerrType! > 10 (rooms) the cell is set to 1 = passable AFTER the border loop made it 3 (97C3), so the squad CAN leave a room fight through the bottom door: the step onto (4, 8) passes FNPassable (4FA8), FNOffMap(5) is then true (GrpY! 19 > 18) and SUB_3D68 (3F9E) / 4E09 end the fight via L_410E (escape, INSIDE restores OldX!/OldY!). Terrain 10 (boarding a ship) keeps the border closed: "You can not flee from combat in space vessels". Decode fix after DOSBox D-MX-1 / D-QA-7 (acceptance/ref/PB-04door1/2.png) |
| 0xBFA2 | N x5 | LegendEnd! | = I!+32: inner loop bound of the terrain legend (039A) |
| 0xBFAE | N x5 | LegendX! | x loop of the terrain legend background 68..100 (03A2) |
| 0xBFB2 | N x5 | LegendY! | y loop of the terrain legend background (03AC) |
| 0xC0B8 | S x1 | Status$(0) | element 0 of Status$ assigned as a scalar (04DD) |
| 0xC0BC | S x1 | Status$(1) | element 1 (04E6) |
| 0xC0C0 | S x1 | Status$(2) | element 2 (04EF) |
| 0xC0EC | S x37 | K$ | INKEY$ (0742, 2BCE, 2C75, 2DC5, 2E54); typed buffer of SUB_2FAF; NAME skip scratch (0529) |
| 0xC104 | S x1 | CrewName1$ | CHARNAME field 2 (05ED) |
| 0xC108 | S x1 | CrewName2$ | CHARNAME field 3 (05ED) |
| 0xC110 | N x102 | FnField! | argument 2 of FNCrew |
| 0xC114 | N x106 | FnMember! | argument 1 of FNCrew |
| 0xC120 | N x72 | FnIField! | argument 2 of FNIdx |
| 0xC124 | N x76 | FnIMember! | argument 1 of FNIdx |
| 0xC1E0 | N x28 | MapType! | map terrain type under the squad (6475 FNMap(5)) or a group (6ABD, 7764); starts as TerrType! (9702); 11 in the debug fill |
| 0xC308 | N x4 | GrpPortrait!(0) | element 0 read as a scalar: the portrait file of the first group (1270, 1990, 19BD, A8C1) |
| 0xC338 | N x2 | GrpStrength!(0) | element 0 read as a scalar for the comms strength (3F32) |
| 0xC52C | N x12 | GrpX!(5) | formerly named `SquadX!` - the address is GrpX!(5) (a constant index folded into a direct operand by the compiler); squad x in 8-pixel columns (33 at start, 1790): = GrpX!(5); moved by DX! (4F7F); icon PUT (SquadX!*8-8, SquadY!*8-8) (4ED5) |
| 0xC530 | N x4 | GrpX!(6) | formerly named `TileX!` - the address is GrpX!(6) (a constant index folded into a direct operand by the compiler); x of the last offensive (type 2) cell = i*2+24.5 (99E0): GrpX!(6), target of tactic 4 (4AB0) |
| 0xC534 | N x1 | GrpX!(7) | formerly named `ExitX!` - the address is GrpX!(7) (a constant index folded into a direct operand by the compiler); = 32.5 (9A7E): GrpX!(7), flee target for rooms (tactic 5, 4B0F) |
| 0xC538 | N x1 | GrpX!(8) | formerly named `CenterX!` - the address is GrpX!(8) (a constant index folded into a direct operand by the compiler); = 32.5 (9A94): GrpX!(8); outdoor fleeing maximises the distance from it (4B41-4B59) |
| 0xC550 | N x12 | GrpY!(5) | formerly named `SquadY!` - the address is GrpY!(5) (a constant index folded into a direct operand by the compiler); squad y in 8-pixel rows (12 at start, 1799): = GrpY!(5) |
| 0xC554 | N x4 | GrpY!(6) | formerly named `TileY!` - the address is GrpY!(6) (a constant index folded into a direct operand by the compiler); y of the last offensive (type 2) cell = j*2+3.5 (99F3): GrpY!(6) |
| 0xC558 | N x1 | GrpY!(7) | formerly named `ExitY!` - the address is GrpY!(7) (a constant index folded into a direct operand by the compiler); = 99 (9A87): GrpY!(7), below the map (bottom door) |
| 0xC55C | N x1 | GrpY!(8) | formerly named `CenterY!` - the address is GrpY!(8) (a constant index folded into a direct operand by the compiler); = 11.5 (9A9A): GrpY!(8) |
| 0xC634 | N x125 | J! | (also) group index 0..3 while the groups are created (0FCF-15F3) |
| 0xC638 | N x7 | EncRec! | ENCINFO record to read next (0-based line): starts at ChainArg! (0E4E), follows the record's column 23/24 links (12C0, 164A-165B) |
| 0xC63C | N x41 | NGroups! | number of enemy groups (1 + each extra group at 1633); loops run 0..NGroups!-1 |
| 0xC650 | N x4 | EncPos! | ENCINFO line already consumed (0E7A, 0FCC): the file is re-read from the start when the next record lies before it (165B-1666) |
| 0xC654 | N x2 | EncEnd! | = EncRec! (0E83): INPUT loop bound |
| 0xC658 | N x3 | C1Size! | ENCINFO column 1: maximum group size: GrpSize! = INT((1-RND^2)*C1Size! + 1), max 5 (112B-113D) |
| 0xC65C | N x9 | C2Init! | column 2: initiative/speed base: UnitInit! = (RND*0.6+0.7)*C2Init! (13B6); InitHi!/InitMid!/InitLo! = *1.3/*0.7/*0.6 (1039-1055) bound the initiative countdown |
| 0xC660 | N x8 | C4Armor! | column 4: unit armour UnitArmor! = C4Armor! (13C4): subtracted from every hit (83D2) |
| 0xC664 | N x3 | C6HP! | column 6: hit points UnitHP! = (RND*0.5+0.75)*C6HP! (13E6) |
| 0xC668 | N x2 | C7Mood! | column 7: 1..3 attitude: for a bribe (Approach! = 4, D-Bargain/Bribe) the offer becomes `(C7Mood! < 4) * -40` = +40 when < 4 (every ENCINFO value) and 0 otherwise (3986-399D; QB true = -1, so it is not a -40 penalty: the bribe starts at 40 instead of 50 and is never an automatic fail); also selects the comms table row - manual-xcheck fix |
| 0xC66C | N x13 | C8Hostile! | column 8: 1 = may attack when provoked (3A7A sets 3 after a truce); > 1 = attacks: Attacked! = 1 with chance (C8Hostile!*35 - 35)% per round (7141), surprise (6F7F) |
| 0xC670 | N x2 | C15RocketPct! | column 15: % chance a unit carries rockets (1404) |
| 0xC674 | N x3 | C17Rockets! | column 17: rocket count base: INT((RND*0.7+0.5)*C17Rockets! + 0.5) (147A) |
| 0xC678 | N x2 | C19FlamePct! | column 19: % chance a unit carries a flame thrower (14BB) |
| 0xC67C | N x3 | C21Flames! | column 21: flame-thrower charges base (1531) |
| 0xC680 | N x7 | C22NextPct! | column 22: % chance that another group follows (15F3); forced to 100 when boarding with BoardCrew! > 3 (129A) |
| 0xC684 | N x3 | C23Next1! | column 23: ENCINFO record of the following group (choice 1, 15FE) |
| 0xC688 | N x3 | C24Next2! | column 24: alternative following record (1611-1616, 50%) |
| 0xC68C | N x5 | C25Melee! | column 25: melee attacks base INT((RND*0.7+0.5)*C25Melee! + 0.5) (15AC); < 1 lets a unit start with rockets/flames (149E, 1555) |
| 0xC690 | N x6 | InitHi! | = C2Init!*1.3 (1039) |
| 0xC694 | N x5 | InitMid! | = C2Init!*0.7 (1047) |
| 0xC698 | N x6 | InitLo! | = C2Init!*0.6 (1055) |
| 0xC6AC | N x5 | PrevGrp! | = group-1 bound for the position clash test (1064) |
| 0xC6B8 | N x12 | Col4! | map rows 4..7 of column 4 get SGN(cell-1)+1 (98E2-991D) |
| 0xC6BC | N x13 | Half! | = LEN(GrpName$)/2 + 1 (1167): middle of the name; also the member row LOCATE row (2D01) |
| 0xC6C0 | N x14 | Sp1! | INSTR of the first space in GrpName$ (117E), replaced by the second when nearer the middle (11BE) |
| 0xC6C4 | N x7 | Sp2! | INSTR of the second space (1196) |
| 0xC6F2 | N x5 | UnitEnd! | = GrpSize!-1 bound of the unit creation loop (1370) |
| 0xC6FE | N x4 | NextRec! | = C23Next1! or C24Next2! (15FE-1616): the following ENCINFO record |
| 0xC702 | N x10 | DistA! | argument 1 of FNDist (slot a) |
| 0xC706 | N x10 | DistB! | argument 2 of FNDist (slot b) |
| 0xC70A | N x3 | FnGrp1! | argument of FNRanged (group) |
| 0xC70E | N x13 | WepReach! | = G!(rec+10) (56B3; WeaponTable +216 range) / 10 for the hand weapon (5687): reach used by FNInRange (1837); also the enemy melee reach (7577, 760F, 767C) |
| 0xC712 | N x6 | FnGrp2! | argument of FNInRange (group) |
| 0xC716 | N x5 | FnSlot! | argument of FNMap (slot) |
| 0xC722 | N x6 | FnSlot2! | argument of FNOffMap (slot) |
| 0xC72A | N x3 | FnSlot3! | argument of FNPassable (slot) |
| 0xC75E | N x18 | SquadMove! | squares per movement phase = INT(min movement of the living members / 5 + 0.5), min 1 (1A01-1A87); string at DS 0xC76A; SquadMove! |
| 0xC762 | N x134 | M! | squad member index 1..6 in the member loops and the picker result (1A0A, 1F7D, 2C05, 4FED, 65A6) |
| 0xC766 | N x36 | Tmp! | scratch: movement value (1A37), reload count index (507C), comms roll RND*150 - Offer! (3B29), movement calc (95ED-9681) |
| 0xC796 | N x1 | MoveDX!(1) | = 1 (1AB7): move 1 = right |
| 0xC79E | N x1 | MoveDX!(3) | = -1 (1ACA): move 3 = left |
| 0xC7A6 | N x1 | MoveDY!(0) | = -1 (1AB4): move 0 = up (element 0 of MoveDY!, constant index folded into a direct store; same pattern as MoveDX!(1) / MoveDY!(2)) |
| 0xC7AE | N x1 | MoveDY!(2) | = 1 (1AC2): move 2 = down |
| 0xC7E6 | N x12 | DelayUnits! | = 6 (1B0E): pause unit count (6F1C, 7F36, 7F97, A728) |
| 0xC7EA | N x5 | DelayBase! | = StdDelay! (1B17): projectile step delay DelayBase!*0.01 (87BE) / *0.03 (8F55) |
| 0xC92E | N x5 | CommState! | 0 none, 1 translator/ESP contact made, 2 = comms screen entered directly (ON CommState!+1 GOTO 3596); starts at 2 (1C1B) |
| 0xC932 | N x6 | Attacked! | 1 once the enemy attacks (4105, 70F3, 714B); needed for the enemy's turn (6F7F) |
| 0xC936 | N x1 | N_C936! | = 0 at 1C2A, never read |
| 0xC93A | N x29 | PortGroup! | group whose name/portrait box is shown, cycling 0..NGroups!-1 (9BA7, 9DEA) |
| 0xC93E | N x6 | Surrendered! | 1 when all groups are gone/surrendered (3CDE, 3F8A, 4E14); part of BattleWon! |
| 0xC942 | N x106 | K! | third loop counter (1C45, 1D90, 4566, 7B0B, A1F7) |
| 0xC946 | N x67 | WepSlot! | field 32 of the member = weapon slot 1..25 (1C6C); 0 = hand weapon; validated (1C8D-1D1A) |
| 0xC94A | N x99 | WeaponRec! | = WepSlot!*12 + 788 (1CB1, 2A31, 5674 ...): the weapon record; 788 = string at DS 0xCF8E |
| 0xC97C | N x55 | Flag! | general flag/accumulator: item found (310A), translator member (3643), living-unit count (3E39, 41EC), reloaded (67F6), hit flag in SUB_7151 (8A93) |
| 0xC984 | N x37 | WepType! | = G!(WeaponRec!) weapon type (1FCE, 2A48, 665E); after 669A the weapon's damage type G!(rec+6) (WeaponTable +270, 1..12: ON WepType! GOSUB at 8206, types 1-5 and 12 hit one unit, 6-11 several) - manual-xcheck fix (was "range") |
| 0xC988 | N x5 | AmmoType! | = G!(WeaponRec!) when reloading (1FCE, 674D): ammo records (1100+3k) with the same type are consumed |
| 0xC98C | N x10 | OwnerCode! | = member + 2 = owner field value (2012, 672E) |
| 0xC9D4 | N x8 | BarColor! | = 3 - UseEGA!*2 : colour of the frame bars (2729-2869) |
| 0xC9D8 | N x5 | GrpMax5! | = NGroups!-1 loop bound at 288A |
| 0xC9DC | N x53 | Grp! | current enemy group: drawing loop (288A), target group of the member (695E), attacker group (7157, 81F1) |
| 0xC9E0 | N x5 | UnitMax3! | = GrpSize!-1 loop bound at 28B0 |
| 0xC9E4 | N x64 | Unit! | current unit within Grp! (28B0, 697D, 6FE3) |
| 0xC9E8 | N x5 | DelayN1! | = Delay!*0.6 (2922) |
| 0xC9EC | N x21 | OwnerCode2! | = M!+2 in SUB_92AE (93AA); also the SUB_2913 delay counter |
| 0xC9F0 | N x5 | DelayN2! | = Delay!*0.5 (2956) |
| 0xCA06 | N x30 | Delta! | argument/result of SUB_299B: credits + Delta! capped at 9999999 (29B0-29C2); tribute/truce payments (3C54, 3C8F), loot INT(RND*enemy value) (4E2C) |
| 0xCA0E | N x2 | WepOwner! | = G!(WeaponRec!+9) owner field (2A63) |
| 0xCA1A | N x6 | Ammo! | ammo digit (0..9) shown in the A:R column (2AD0-2AE2); string at DS 0xCA1E when negative (2AEB) |
| 0xCA26 | N x11 | Reloads! | number of ammo items of the weapon type owned by the member (2B03-2B8B), shown after ":" |
| 0xCA2A | S x2 | Prompt$ | string at DS 0xCF1E (4FE1) printed by the member picker SUB_2BBC |
| 0xCA4E | N x11 | EquipHit! | 1 when a critical hit destroyed enemy equipment (8488) -> string at DS 0xD21C; SUB_2C93 computes the all-dead product into it (2CD6, all members status 0 -> 1) |
| 0xCA52 | N x61 | Cmd! | SUB_2DBF: ASC(INKEY$) upper-cased - 64 (A=1.., ENTER -51, SPACE -32); SUB_2E4E: extended keys 1..11 (2 Up, 5 Left, 7 Right, 10 Down), letters 12..37 (A=12), ENTER 37 |
| 0xCA5E | N x4 | CmdMin! | lower bound accepted by SUB_2DBF (2E45) |
| 0xCA62 | N x5 | CmdMax! | upper bound accepted by SUB_2DBF (2E45) |
| 0xCA76 | N x4 | MaxLen! | max input length of SUB_2FAF: 4 for numbers (SUB_2FA6), 3 for yes/no (352A) |
| 0xCA7A | N x15 | Col! | POS(0) saved by SUB_2FAF (2FBA); also the projectile x step (81D9) |
| 0xCA7E | N x15 | Row! | CSRLIN saved by SUB_2FAF (2FC6); also the projectile y step (81E7) |
| 0xCA82 | S x4 | Ch$ | INKEY$ inside the line editor SUB_2FAF (300D) |
| 0xCA8E | I x6 | InputVal% | = CINT(VAL(K$)) at the end of SUB_2FAF (3100); new delay (5497-54BD) |
| 0xCA90 | N x1 | ItemType! | item type searched by the unreachable item search at 310A-3167 |
| 0xCA94 | N x5 | ItemRec! | record found by the item search (313A); salvage slot in the boarding epilogue (44B7-4550) |
| 0xCADC | N x9 | DbgEsper! | esper level in the unreachable member-stat block 31AC-34B9 |
| 0xCAE0 | N x5 | YesNo! | SUB_34BA: 1 for Y/y, 0 for N/n; the unreachable 352A variant uses the typed string at DS 0xCAF2 |
| 0xCB02 | N x7 | CreditsGained! | credits won: truce payment (3C5C), tribute (3C97), surrender/loot (3CFC, 4E34); string at DS 0xCDA4 (415A) |
| 0xCB06 | N x15 | ActiveGroups! | groups with GrpState! > 2.5 (3F12); 0 = battle over (3585, 54CA, 4DC0) |
| 0xCBF4 | N x9 | Approach! | 0 Plead, 1 Ask, 2 Demand, 3 Bargain/Bribe, 4 Impersonate Diety, 5 None (38B1-38BC) |
| 0xCBF8 | N x4 | Objective! | 1 Truce, 2 Tribute, 3 Surrender (396A); Bargain forces 1 (38D5) |
| 0xCC44 | N x16 | Offer! | comms score: 50 (3973); a bribe (Approach! = 4) instead starts at `(C7Mood! < 4) * -40` = +40 when C7Mood! < 4, 0 otherwise (399D; QB true = -1, NOT -40), then CommMood!*CommRatio!*Offer! + CommObjective! (3B05); outcome RND*150 - Offer! < 0 = accepted (3B29) - manual-xcheck fix |
| 0xCC48 | N x14 | EnemyStr! | enemy strength: GrpStrength!(0) + living*5 for group 0, + GrpStrength!*living*0.125 for the others (3F32-3F5A) |
| 0xCC4C | N x17 | SquadStr! | squad strength: sum of HP/6 + 2*G!(slot*12+796) per living member (3FBF-405B) |
| 0xCC50 | N x30 | Bucket! | (SquadStr!-EnemyStr!)/min(...) mapped to 0..8 by eight thresholds -1,-.5,-.25,-.05,.05,.25,.5,1 (39B4-3A58): row of CommRatio! |
| 0xCCFE | N x11 | NewState! | argument of SUB_407B: GrpState! of every fighting group := NewState! (2 truce/paid at 3BE3/3C71/3CBA, 1 surrendered at 3CD8; 40B4); the slot is also reused as a letter code: NewState! = I!+65 (4E74), PRINT CHR$(NewState!) (4F34) - verify fix |
| 0xCD02 | N x21 | EnemyValue! | sum of GrpSize!*GrpValue! (SUB_3D02); tribute/truce payment = half of it (3C0F, 3C8F) |
| 0xCD66 | N x5 | GrpMax! | = NGroups!-1 loop bound in SUB_3D02 |
| 0xCD6A | N x5 | GrpMax2! | = NGroups!-1 loop bound in SUB_3D68 |
| 0xCD6E | N x5 | UnitMax2! | = GrpSize!-1 loop bound in SUB_3D68 |
| 0xCD7E | N x5 | GrpMax3! | = NGroups!-1 loop bound in SUB_407B |
| 0xCDB8 | N x5 | GrpMax4! | = NGroups!-1 loop bound of the battle report |
| 0xCDBC | N x5 | UnitMax! | = GrpSize!-1 loop bound in the battle report |
| 0xCE24 | N x9 | TowIdx! | = KillPtr! (4373) |
| 0xCE28 | N x7 | TowPrev! | = TowIdx!-1, 49 when negative (4381-4391) |
| 0xCE52 | N x3 | SalvageMin! | smallest G!(330..339) value = the salvage slot to overwrite (4484-44B7) |
| 0xCE7C | N x8 | Moved! | 1 when the squad moved this phase (4F96), 0 when blocked; a move costs Fatigue!*4 stamina per member (4843-48AA) |
| 0xCE9A | N x31 | Phase! | movement phase 1..6 of the round (46D1); 99 ends the round early when no group is left (4DCB) |
| 0xCED2 | N x2 | OldX! | squad x before a move (47CA), restored when the move is blocked (4FB3) |
| 0xCED6 | N x2 | OldY! | squad y before a move (47D3) |
| 0xCEDA | N x31 | DX! | -1/0/1 from Left/Right (4F59, 4F71); also the projectile x span (8066, 818E) |
| 0xCEDE | N x33 | DY! | -1/0/1 from Up/Down (4F4D, 4F65); also the projectile y span |
| 0xCEE2 | N x5 | GrpMax6! | = NGroups!-1 loop bound of the enemy movement (48DB) |
| 0xCEE6 | N x3 | BestScore! | minimum MoveScore! (4977, 4D02) |
| 0xCEEA | N x4 | BestMove! | move 0..4 with the best score, 4 = stay (4980, 4D0A-4D32) |
| 0xCEF2 | N x5 | GrpX0! | group x before trying the moves (4998) |
| 0xCEF6 | N x5 | GrpY0! | group y before trying the moves (49A6) |
| 0xCEFA | N x6 | KeepDist! | = 2^(4-GrpTactic!) - 1 : preferred distance to the squad (49C4) |
| 0xCEFE | N x15 | Move! | candidate move 0..4 (49CD) |
| 0xCF02 | N x11 | Dist! | distance of the candidate position to the squad (4A40) |
| 0xCF06 | N x5 | GrpMax7! | = NGroups!-1 loop bound of the separation test (4C03) |
| 0xCF0A | N x6 | OtherGrp! | other group in the separation test (4C03) |
| 0xCF0E | N x18 | Dist2! | distance to another group (4C2C) / the attacker's distance to the target (71D3) |
| 0xCF16 | N x3 | MinusOne! | = -1 (4E59): STEP of the group drawing loop |
| 0xCF4A | N x8 | SlotRec! | = WepSlot!*12 + 788 in Switch Weapons (50F4) |
| 0xCF9E | N x7 | Ammo2! | ammo digit in the weapon line of SUB_52FD (5331-5357) |
| 0xCFA2 | N x5 | Reloads2! | = G!(500 + weapon type) reload count (5380-5392) |
| 0xD01A | N x7 | WepDmgType! | damage type G!(rec+6) of the member's weapon (56CE; WeaponTable +270, 1..12) or 0 for the hand weapon (5690); 6..11 (flame, rocket, explosive, chemical, nuclear, incendiary) are the area types, so the target line prints "group X" instead of a unit (5E71) - was WepRange! (misnomer), manual-xcheck fix |
| 0xD042 | N x3 | InRangeAny! | 1 when some group is in weapon range (5878) |
| 0xD046 | N x45 | TgtGrp! | target group of the member (5805, 58C3, 604D), stored to field 38 (63BA); in SUB_9F76 the sprite case number |
| 0xD04A | N x79 | MemberCmd! | command chosen for the member 0..10 (CmdName$): preset from field 37 (5BA8-5BF6), keys W/F/R/L/M/E and the esper letters (5F4E-6254), stored to field 37 (63E4) |
| 0xD04E | N x3 | MinusOne5! | = -1 (5788): STEP of the group listing loop |
| 0xD056 | N x2 | InRangeGrp! | last group in melee range (580B) |
| 0xD06A | N x3 | AnyUnit! | 1 when the target group has a living unit (5A33) |
| 0xD06E | N x5 | UnitMax4! | = GrpSize!-1 loop bound at 59FC |
| 0xD072 | N x69 | U! | unit loop index (59FC); also the projectile parameter 0..1 (874C) and a damage factor RND^3 (78C3) |
| 0xD076 | N x2 | FirstUnit! | first living unit of the target group (5A41) |
| 0xD0FA | N x8 | PickGrp! | group letter typed (A-D) - 1 (5F91) |
| 0xD128 | N x7 | PickUnit! | unit number typed (1-5) - 1 (6264) |
| 0xD12C | N x3 | SquadHit! | 1 once the squad lands a hit this round (6DCC); provokes the enemy (70E9) |
| 0xD130 | N x8 | N_D130! | = 0 then negated (6486, 64CE): never nonzero; added to the hit chance (7750) |
| 0xD134 | N x7 | TerrainMod! | = 105 - 35*map type when the squad stands on type 2..4 (64B1-64C4): hit-chance modifier |
| 0xD140 | N x5 | GrpMax8! | = NGroups!-1 loop bound at 64E6 |
| 0xD144 | N x5 | UnitMax5! | = GrpSize!-1 loop bound at 650C |
| 0xD148 | N x5 | Unit2! | unit loop index of the state reset (650C) |
| 0xD14C | N x6 | InitStep! | = InitLo!*(-0.25) (657B): STEP of the initiative countdown |
| 0xD150 | N x8 | InitLevel! | initiative countdown from InitHi!+1 down to 0 (6587-70AE); a member acts when Speed (field 1) >= InitLevel! (660F), a unit when ABS(UnitInit!) >= InitLevel! (7184); clipped to 0 below InitMid! (6593) |
| 0xD160 | N x7 | WepAcc! | weapon to-hit bonus G!(rec+7) (68A6; WeaponTable +432) or the hand-weapon skill field 46 (6887) - manual-xcheck fix (was "accuracy") |
| 0xD168 | N x12 | SkillField! | skill field used for the attack: 28 (hand weapon) or from the weapon/skill type G!(rec+11) (WeaponTable +594: 1 heavy arms -> 25, 2 light arms -> 24, 3 chemical weaponry -> 22, 4 explosives -> 21; 68BA-6924), then its value (6941) |
| 0xD170 | N x47 | HitPct! | hit chance: skill*5 + sighting bonuses - GrpToHitMod! + accuracy + 50, halved for Rapid Attack, terrain and range modifiers, clipped 10..90 (6A8E-6B69); enemy version 7750-77C9 |
| 0xD194 | N x6 | HandWep! | = field 90 - 1 : HandWeaponName$ index (6C4D) |
| 0xD1A0 | N x9 | Hits! | hits landed this attack (6DC4); string at DS 0xD1C4; Hits!; string at DS 0xD1CE |
| 0xD1A4 | N x1 | N_D1A4! | = 0 at 6C92, never read |
| 0xD1A8 | N x13 | Killed! | units killed this attack (843D); text with the string at DS 0xD210 |
| 0xD1AC | N x14 | DamageSum! | damage points dealt this attack (83EC); string at DS 0xD1EE; DamageSum!; string at DS 0xD1D8; reused as the EGA frame delay (9EF1) |
| 0xD1B0 | N x6 | Melee! | 1 for a hand-weapon attack (6CC1): no ammo used |
| 0xD1B4 | N x4 | Shots! | shots per attack = the weapon's rate of fire G!(rec+2) (6CF4; WeaponTable +54), 1 for melee; doubled by Rapid Attack (6D15) |
| 0xD1B8 | N x5 | NShots! | = Shots! (2x for Rapid Attack) (6D15) |
| 0xD1BC | N x17 | Hit! | 1 when the shot hits (6DAA, 7831); drives the projectile animation and the hit text |
| 0xD1C0 | N x4 | Shot! | shot loop counter (6D1E) |
| 0xD234 | N x2 | PauseN! | = DelayUnits! : number of SUB_2913 delays after an attack (6F1C) |
| 0xD238 | N x4 | Target! | target slot for the projectile routine: 5 = the squad (6F8A), the attacking group when the squad fires (81F1) |
| 0xD23C | N x5 | GrpMax9! | = NGroups!-1 loop bound of the enemy attack loop (6FA2) |
| 0xD240 | N x22 | AtkGrp! | attacking group in the enemy turn (6FA2 -> SUB_7151) |
| 0xD244 | N x5 | UnitMax6! | = GrpSize!-1 loop bound at 6FE3 |
| 0xD24C | N x20 | NewWep! | weapon the unit will use this turn (71B6-73D4): 0 melee, 1 rockets, 2 flames |
| 0xD250 | N x7 | FlameDmg! | = UnitFlames! * GrpFlameDmg! (721F) |
| 0xD254 | N x7 | RocketDmg! | = UnitRockets! * GrpRocketDmg! (7238) |
| 0xD258 | N x7 | MeleeDmg! | = UnitMelee! * GrpMeleeDmg! (724C) |
| 0xD282 | N x37 | Damage! | damage of the enemy weapon (75B9, 7634, 76A1) then INT(RND^.5 * Damage! - armour) (79C5); squad weapon damage (83A7) |
| 0xD2C0 | N x8 | Try! | loop 1..7 picking a random living member as the target (76AA-76F9) |
| 0xD2C4 | N x2 | N_D2C4! | added to the enemy hit chance (7750); never assigned |
| 0xD2E6 | N x22 | NTargets! | members/units hit by an area attack: 1, or INT(RND*2*NewWep!+1) for rockets/flames (78FF), RND^.7*GrpSize!+1 for area weapons (82B8) |
| 0xD2EA | N x38 | FirstTgt! | first member/unit hit (7941-7955, 82D8-82F5) |
| 0xD2F2 | N x2 | LastTgt2! | copy of LastTgt! (7961) |
| 0xD2F6 | N x17 | LastTgt! | = FirstTgt! + NTargets! - 1 (A171, A315) |
| 0xD344 | N x6 | NewHP! | = HP - Damage! (7A65); <= 0 -> string at DS 0xD33A (7AF3) |
| 0xD374 | N x5 | SightEnd! | = field 41 index + 2 (7C72): sighting hardware fields 41..43 cleared |
| 0xD39A | N x5 | HandEnd! | = field 44 index + 2 (7D06): hand-weapon fields 44..46 cleared |
| 0xD3EE | N x5 | PauseN2! | = DelayUnits!*0.8 (7F36) |
| 0xD3F2 | N x5 | PauseN3! | = DelayUnits!*0.4 (7F97) |
| 0xD3F6 | N x25 | FromX! | projectile start x = GrpX!(attacker)*8-5 (7FE2) |
| 0xD3FA | N x24 | FromY! | projectile start y (7FF7) |
| 0xD3FE | N x57 | ToX! | projectile end x = GrpX!(target)*8-5 (8018), moved to the map edge for a miss (803E-816A) |
| 0xD402 | N x54 | ToY! | projectile end y (802D) |
| 0xD40E | N x6 | EdgeX! | 311 or 200: map edge the miss flies to (80BD-80C9) |
| 0xD41A | N x6 | EdgeY! | 143 or 32 (80DD-80E9) |
| 0xD422 | N x10 | EdgeT! | parameter to the nearer edge (80FE-8124) |
| 0xD426 | N x6 | EdgeT2! | = (EdgeY!-FromY!)/DY! (8115) |
| 0xD42A | N x59 | PX! | projectile x (8173, 8733) |
| 0xD42E | N x59 | PY! | projectile y (817E, 8740) |
| 0xD432 | N x13 | PStep! | = 0.2/(distance^0.7 + 1e-6) : projectile parameter step (81CB); STEP of the flight loops |
| 0xD43E | N x2 | LastTgt3! | = LastTgt! (8301): loop bound over the units hit |
| 0xD442 | N x7 | WepDmg! | weapon maximum damage: hand weapon field 45 (835D) or G!(rec+1) (837C; WeaponTable +0); a hit does INT(RND^.5*WepDmg!+1) - UnitArmor! (83A7-83D2) |
| 0xD44A | N x5 | UnitMax7! | = GrpSize!-1 loop bound at 8671 |
| 0xD44E | N x3 | PStep1! | copy of PStep! for the type-1/2 shot loop (86E8) |
| 0xD45A | N x5 | StepN! | = DelayBase!*0.01 (87BE): projectile pause loop bound |
| 0xD462 | N x8 | StepI! | projectile pause loop counter (87C7, 8F5E) |
| 0xD466 | N x3 | PStep2! | copy for the type-3 shot (883B) |
| 0xD472 | N x3 | PStep3! | copy for the unreachable 89EA loop |
| 0xD476 | N x5 | N_D476! | toggled NOT in the unreachable 89EA loop (8A52) |
| 0xD47E | N x4 | Noise! | loop 1..8 of random SOUNDs (8B92) |
| 0xD482 | N x6 | FlameCol! | = UseEGA!*10 + 1.5 : flame colour base (8C04) |
| 0xD496 | N x8 | Arc! | +8/-8 rocket arc direction (8E03-8E1B) |
| 0xD49A | N x3 | PStep4! | copy for the rocket arc (8E24) |
| 0xD49E | N x14 | ArcY! | = SIN(t*Pi!) (8E44): rocket height |
| 0xD4AE | N x5 | StepN2! | = DelayBase!*0.03 (8F55) |
| 0xD4BA | N x3 | PStep5! | copy for the rocket of weapon 7 (91F6) |
| 0xD4BE | N x21 | Carried! | SUB_92AE: weight carried by member M! (9420-9544) -> G!(rec+14), movement G!(rec+8) |
| 0xD4C2 | N x32 | Rec! | = FNIdx(M!, 0) record base in SUB_92AE (92CC) |
| 0xD4D2 | N x3 | MinusOne2! | = -1 (968B): STEP of the name un-shift loop |
| 0xD4D6 | N x3 | MinusOne3! | = -1 (97E7): STEP of the special-tile loop (4 downto 2) |
| 0xD4DA | N x9 | NSpecial! | number of random special cells INT(RND*15), (1.5-EncAdd!)*14 for rooms (9806-982A) |
| 0xD4DE | N x2 | NSpecial2! | loop bound copy (9833) |
| 0xD4E2 | N x9 | TileType! | terrain type being scattered: FOR TileType! = 4 TO 2 STEP -1 (97F4-98DC), NSpecial! random cells each |
| 0xD4E6 | N x3 | MinusOne4! | = -1 (9933): STEP of the map drawing loop (rows 7 downto 1) |
| 0xD4FE | N x12 | PortTimer! | TIMER of the last portrait step: 0.123 s (CGA, 9B26) or the script delay (EGA, 9D53) |
| 0xD506 | N x24 | FramePos! | index into the portrait frame script (9B5B-9D3D, 9D88-9EFE); 618 (CGA) / 1240 (EGA) = first script word, wraps at a 0 / negative word |
| 0xD50E | N x11 | PortTick! | counter 0..13 of portrait ticks: T = PortTick!+1 compared with 13 on the old value (9C5C-9C83), so the sequence is 0..12 -> 13 -> 0; the group name box is redrawn when it wraps (9B6E-9C83) - verify fix |
| 0xD51A | N x10 | NameTimer! | TIMER of the last group-name change in the EGA path (2 s, 9DA9-9DB3) |
| 0xD522 | N x11 | BoxX0! | attacked box left (A185, A320) |
| 0xD526 | N x6 | BoxX1! | attacked box right (A197, A329) |
| 0xD52A | N x14 | BoxY0! | attacked box top (A1AE, A33B) |
| 0xD52E | N x9 | BoxY1! | attacked box bottom (A1BD, A34D) |
| 0xD536 | N x3 | MinusK! | = -1000 (A200): STEP of the descending SOUND sweep |
| 0xD570 | N x5 | PsiN! | = MemberCmd! - 7 : number of flash/sound passes of the esper attack (A547) |
| 0xD5A4 | N x5 | PauseN4! | = DelayUnits!*0.5 (A728) |
| 0xD5A8 | N x9 | Heal! | = field 51 - HP, max 5 (A7FA-A80C): part of the string at DS 0xD5AC amount |

### Arrays (indexed access base addresses)

| base | element size / kinds (uses) | name | evidence |
|---|---|---|---|
| 0x1850 | N x271, 2601 elements (0..2600) | G! | the 51x51 COMMON array (CHARINFO.BAS): squad records 1500+member*100 (FNCrew/FNIdx), weapons 800+12k (+0 type, +1 max damage, +2 rate of fire = shots per attack, +3 loaded ammo, +4 magazine capacity, +5 weight x10, +6 damage type 1..12, +7 to-hit bonus, +8 intimidation factor (squad strength 405B), +9 owner, +10 range, +11 weapon/skill type 1..4; filled by STARPORT 3CFF-3EC0 from the INFO.BAS WeaponTable columns), ammo 1100+3k, items 2300+3k, reload counts 500+type - manual-xcheck fix |
| 0x40F4 | P x1, 202 elements (0..201) | Logo | LOGO.BAS BLOADed at &H40F4 (0509, standalone path); PUT (215,6), AND in the CGA title box (25F0) |
| 0x4288 | S x18, 9 elements (0..8) | CrewName$ | CHARNAME fields 4..9 (0615) shifted by two at 0659-0696 so that (1..6) = the squad (ship crew 3..8); shifted back by SUB_9685 before the CHAIN |
| 0x43F4 | S x3, 54 elements (0..53) | WeaponName$ | 54 NAME strings = squad weapon names (STARTUP/STARPORT WeaponName$, items 81..134 -> (0..53), 055D) - crossref name (was GunName$) |
| 0x44CC | S x2, 6 elements (0..5) | HandWeaponName$ | 6 NAME strings = hand weapon names (STARTUP/STARPORT HandWeaponName$, items 135..140 -> (0..5), 059F) - crossref name (was HandWeapon$) |
| 0x8030 | P x5 | HdrSave | DIM'd (3138 elements) GET buffer: the "Name HP Cond A:R" header strip (25AC/26B9) and later the enemy-info area (200,32)-(311,143) (290A, 4E50) |
| 0x803A | P x9 | MapSave | DIM'd (4098 elements) GET buffer: the enemy-grid band (103,6)-(194,82) (2573/2661; the title box is at x 197-314) and the battlefield (192,24)-(319,151) (4EF3) restored after effects (89CF, 8C99, 91EC, A5BE-A5D0) - verify fix |
| 0x8044 | P x9 | BoxSave | DIM'd (2210 elements) GET buffer: LOGO.EGA PUT (215,10) (2609) and the attacked unit/member box flashed with PRESET/XOR (A1DC-A2E1, A367, A719) |
| 0x8052 | I x3, P x1 | PortraitEGA | BIGSH-n.EGA BLOADed at &H8052 (19BD) into the DIM'd area: portrait PUT (8,25) (9F15); words after it = frame script pairs (type, delay/100) (9EC1-9EFE) with frames at 0x8AF2/0x8ED4/0x91D0 XORed at (dx+8, dy+25) from the integer pairs at 0x89F6..0x8A00 |
| 0x8AF2 | P x1 | PortEgaFrame1 | BIGSH EGA frame PUT XOR at (I_89F6%+8, I_89F8%+25) (9F34) |
| 0x8ED4 | P x1 | PortEgaFrame2 | BIGSH EGA frame (9F53) |
| 0x91D0 | P x1 | PortEgaFrame3 | BIGSH EGA frame (9F72) |
| 0x942E | I x2, P x1 | PortraitCGA | BIGSH-n.BAS BLOADed at &H942E (1990): 88x56 portrait PUT (8,25) (9CCB); words after the picture = frame script (9B5B: A_942E%(FramePos!)) selecting frames at 0x9920/0x9DF4/0xA2C8/0xA79C |
| 0x9920 | P x1 | PortFrame1 | BIGSH CGA animation frame (9CE4) |
| 0x9DF4 | P x1 | PortFrame2 | BIGSH CGA animation frame (9CFD) |
| 0xA2C8 | P x1 | PortFrame3 | BIGSH CGA animation frame (9D16) |
| 0xA79C | P x1 | PortFrame4 | BIGSH CGA animation frame (9D2F) |
| 0xAC70 | P x2 | UnitSprite0 | PLBTSH slot 0: melee unit with attack verb 1 (DATA line 241), cases 3/9 |
| 0xACF4 | P x2 | UnitSprite1 | PLBTSH slot 1 (16x16): enemy unit with weapon 1 (rockets) PSET/PRESET by SUB_9F76 cases 1/7 |
| 0xAD78 | P x2 | UnitSprite2 | PLBTSH slot 2: unit with weapon 2 (flame thrower), cases 2/8 |
| 0xADFC | P x2 | Boom1 | PLBTSH slot 3 (24x24): big explosion frame 1 (8FB5) |
| 0xAF20 | P x2 | Boom2 | PLBTSH slot 4: big explosion frame 2 |
| 0xB044 | P x2 | Boom3 | PLBTSH slot 5: big explosion frame 3 |
| 0xB168 | P x2 | Boom4 | PLBTSH slot 6: big explosion frame 4 |
| 0xB28C | P x2 | Boom5 | PLBTSH slot 7: big explosion frame 5 (901D) |
| 0xB3B0 | P x1 | Cursor | PLBTSH slot 8 (26x24): PUT (224,160), XOR beside the movement menu (47C1) |
| 0xB534 | P x2 | Shot1 | PLBTSH slot 9 (1x1): projectile of weapon types 1-2 (8708) |
| 0xB53C | P x2 | Shot2 | PLBTSH slot 10 (3x3): projectile of weapon type 3 (885C) |
| 0xB54C | P x4 | Rocket | PLBTSH slot 11 (4x4): rocket (8EA5, 9216) |
| 0xB560 | P x2 | Burst1 | PLBTSH slot 12 (24x24): small explosion frame 1 (8D0E) |
| 0xB684 | P x2 | Burst2 | PLBTSH slot 13: small explosion frame 2 |
| 0xB7A8 | P x2 | Burst3 | PLBTSH slot 14: small explosion frame 3 (8D42) |
| 0xB8CC | P x2 | UnitSprite3 | PLBTSH slot 15: melee unit, attack verb 2 (DATA line 241), cases 4/10 |
| 0xB950 | P x2 | UnitSprite4 | PLBTSH slot 16: attack verb 3 (DATA line 241), cases 5/11 |
| 0xB9D4 | P x2 | UnitSprite5 | PLBTSH slot 17: attack verb 4 (DATA line 241), cases 6/12 |
| 0xBA58 | P x2 | SquadIcon | 8x8 icon drawn with LINEs and GET (0,0)-(7,7) at 22AC-234E; PUT (SquadX!*8-8, SquadY!*8-8) (4ED5) |
| 0xBA7C | S x2, N x1, 5 elements (0..4) | AttackVerb$ | READ from DATA line 241 (00E6): DATA line 241, DATA line 241, DATA line 241, DATA line 241 (1..4); printed for melee attacks (7518) | extent: 5 elements (0..4) - READ AttackVerb$(1..4) (00D0-00E6); I! starts at 0xBA90 = 0xBA7C + 5*4 |
| 0xBA98 | S x2, N x1, 14 elements (0..13) | TerrainName$ | READ from DATA line 297 (011E): Plains, Mushrooms, Swamp, (6 empty), Enemy Ship, Enclosed Room, Semi-enclosed Room, Open Room (1..13); string at DS 0xBBB2 (02D0) | extent: 14 elements (0..13) - READ TerrainName$(1..13) (0108-011E) |
| 0xBBCA | I x17, 81 elements (0..80) | Map% | 9x9 terrain map, index x + y*9 (9739): 1 typical, 2 offensive (+35 to hit from it), 3 inaccessible, 4 defensive (-35); hit modifier TerrainMod! = 105 - 35*type (64B1, 7785); border = 3 for rooms and ships (977E-97D1, bottom row 97C3 `Map%(I+72) = 3`); random special cells (983C-9894); column 4 rows 4..7 = SGN(x-1)+1 (98E2-9911, index Col4!*9 + 4: a passage from the centre down to row 7); then for rooms (TerrType! > 10) the door cell Map%(76) = (4, 8) is set to 1 at 9AB1 (direct store to 0xBC62, formerly misread as HasDoor%) so the squad can walk out through the door; FNMap gives the type under a group | extent: 81 elements (0..80) - 9x9 cells; the tile bank TileBank is BLOADed at 0xBC6C = 0xBBCA + 81*2 |
| 0xBC6C | P x2 | TileBank | TR-n.EGA/.BAS BLOADed at &HBC6C (0333-0380): 4 terrain tiles 16x16 in 132-byte slots; slot 0 = Tile1 |
| 0xBCF0 | P x2 | Tile2 | TR-n slot 1: terrain type 2 = part of the string at DS 0xBFBE (legend PUT at (272,84), 044D); the last type-2 cell becomes TileX!/TileY! (99E0-99F3) |
| 0xBD74 | P x2 | Tile3 | TR-n slot 2: terrain type 3 = part of the string at DS 0xBFBE (legend PUT at (112,84), 0429): FNPassable is 0 on it, room borders are 3 (977E-97D1) |
| 0xBDF8 | P x2 | Tile4 | TR-n slot 3: terrain type 4 = part of the string at DS 0xBFBE (legend PUT at (192,84), 043B) |
| 0xC0B8 | S x1, 3 elements (0..2) | Status$ | string at DS 0xC0C4, string at DS 0xC0CC, string at DS 0xC0D4 (04DD-04EF) -> (0..2); printed from field 31 (2D91) | extent: 3 elements (0..2) - status codes 0 dead / 1 okay / 2 rad (04DD-04EF) |
| 0xC1E8 | S x15, 4 elements (0..3) | GrpName$ | ENCINFO name of group g (0E93); printed "Group A: n name(s)" (1300), in the battle report (4213) and the attack messages (6EB1, 7412) | extent: 4 elements (0..3) - groups 0..3; UnitInit! starts at 0xC1F8 = 0xC1E8 + 4*4 |
| 0xC1F8 | N x3 | UnitInit! | initiative of unit u of group g (g*5+u): (RND*0.6+0.7)*C2Init! (13B6); a unit acts when ABS(UnitInit!) >= the countdown InitLevel! (7184) |
| 0xC248 | N x5 | GrpToHitMod! | column 3 per group (0E93): subtracted from the squad's hit chance against that group (6A8E) |
| 0xC258 | N x7 | UnitArmor! | = C4Armor! (13C4): subtracted from the squad's hit damage (83D2); damaged to 40% by a critical (850B) |
| 0xC2A8 | N x11 | GrpSpeed! | column 5: squares per turn of the group: moves when INT(GrpSpeed!*turn/6+.5) changes (496C) |
| 0xC2B8 | N x29 | UnitHP! | hit points (13E6); <= 0 dead (3E39, 8426 ...); reduced by hits (841B) and esper attacks (A69D) |
| 0xC308 | N x3, 4 elements (0..3) | GrpPortrait! | column 10: BIGSH-n portrait file (1990, 19BD); 3 = the civilian/special type that sets G!(109) after a won boarding (A8C1); when boarding (Terrain! = 10) a first group whose portrait is <> 3 gets its size from BoardCrew! (1251-1270, FCMP with the constant 3 at 0xBB56) - verify fix | extent: 4 elements (0..3) - groups 0..3; GrpCol11! starts at 0xC318 = 0xC308 + 4*4 |
| 0xC318 | N x3 | GrpCol11! | column 11 (0E93, copied to the next group 16F0); not read elsewhere |
| 0xC328 | N x5 | GrpValue! | column 12: credits per unit: EnemyValue! = sum of GrpSize!*GrpValue! (3D49); part of the string at DS 0xCDA4 |
| 0xC338 | N x9, 4 elements (0..3) | GrpStrength! | column 13: strength per living unit: EnemyStr! = sum GrpStrength!*living*0.125 (3F32-3F5A) for the comms ratio | extent: 4 elements (0..3) - groups 0..3; GrpCol14! starts at 0xC348 = 0xC338 + 4*4 |
| 0xC348 | N x3 | GrpCol14! | column 14 (0E93, 1728); not read elsewhere |
| 0xC358 | N x6 | GrpMeleeDmg! | column 18: melee damage base (727E Melee!, 75B9) |
| 0xC368 | N x6 | GrpRocketDmg! | column 16: rocket damage base (7238, 7634) |
| 0xC378 | N x6 | GrpFlameDmg! | column 20: flame-thrower damage base (721F, 76A1) |
| 0xC388 | N x16 | UnitRockets! | rockets left (147A); -1 per shot (7606) |
| 0xC3D8 | N x16 | UnitFlames! | flame-thrower charges left (1531); -1 per shot (7673) |
| 0xC428 | N x8 | UnitWeapon! | weapon in use: 0 melee, 1 rockets (14A9), 2 flame thrower (1562); re-chosen in SUB_7151 (7283-73D4) -> part of the string at DS 0xD260 |
| 0xC478 | N x15 | UnitMelee! | melee attacks left (15AC); -1 per attack (7569) |
| 0xC4C8 | N x18 | UnitState! | 1 alive (13F2), 0 dead/unarmed (72FF), 2 acted/switched weapon this round (74A3, 7688, 84D6), 3 may act twice (7065); SGN() each round (6538) |
| 0xC518 | N x29, 9 elements (0..8) | GrpX! | x of group g in 8-pixel text columns 26..39 (1008: RND*14+26); index 5 = the squad (SquadX!), 6 = the special tile (TileX!), 7 = the bottom exit (32.5, 99), 8 = the map centre (32.5, 11.5); 9999 when off the map (3DCC) | extent: 9 elements (0..8) - position slots 0..8 (0..3 groups, 5 squad, 6 special tile, 7 exit, 8 centre); GrpY! starts at 0xC53C = 0xC518 + 9*4 |
| 0xC53C | N x31, 9 elements (0..8) | GrpY! | y of group g in 8-pixel rows 5..18 (1028: RND*7+5); same slots as GrpX! | extent: 9 elements (0..8) - same slots; GrpState! starts at 0xC560 = 0xC53C + 9*4 |
| 0xC560 | N x19 | GrpState! | 4 at creation (0FE4); SUB_3D68: 2 = left the map / truce / surrendered (3DBE, SUB_407B), 1 = all dead (3E74), 3 = active and reduced -> flee (3EDC); > 2 = still fighting |
| 0xC570 | N x30 | MoveScore! | score of the 5 candidate moves of a group (4A76-4CE0): distance terms, +1e20 for blocked/off-map/too close; the minimum wins (4CFD-4D0A) |
| 0xC5D4 | N x13 | GrpTactic! | column 9: 1..5 movement tactic (49C4: keeps 2^(4-tactic)-1 squares away; 4 heads for the last offensive cell, 5 flees to the bottom exit (rooms) or away from the centre (outdoors), >= 3 ignores other groups); set to 5 (flee) when a group is reduced (3EE8) |
| 0xC5E4 | S x6 | GrpName1$ | first word(s) of GrpName$ for the portrait box, split at the space nearest the middle (1167-124B); printed centred on row 2 (9C1D) |
| 0xC5F4 | S x6 | GrpName2$ | rest of GrpName$ (11 chars) for row 3 of the portrait box (124B, 9C4E) |
| 0xC604 | N x44 | GrpSize! | units in group g: INT((1-RND^2)*C1Size!+1) max 5 (112B-113D), BoardCrew! when boarding (12B3), 3 when forced (12E4); "Group A:" GrpSize! name string at DS 0xC6EA (1300) |
| 0xC614 | N x4 | GrpMeleeRange! | column 26: melee reach in squares (7577 -> Reach!) |
| 0xC624 | N x10, 4 elements (0..3) | GrpAttackVerb! | column 27: 1..4 index into AttackVerb$ (7518) and the creature sprite (A018); 1 = DATA line 241 (ranged melee, 75A5) | extent: 4 elements (0..3) - groups 0..3; J! starts at 0xC634 = 0xC624 + 4*4 |
| 0xC792 | N x4, 5 elements (0..4) | MoveDX! | x offset of move 0..4: (0, 1, 0, -1, 0) (1AB7-1ACD, 4A07, 4D73) | extent: 5 elements (0..4) - moves 0..4 (4A07 loop); MoveDY! starts at 0xC7A6 = 0xC792 + 5*4 |
| 0xC7A6 | N x4, 5 elements (0..4) | MoveDY! | y offset of move 0..4: (-1, 0, 1, 0, 0) (1AB4-1AC5, 4A23, 4D8A) | extent: 5 elements (0..4) - moves 0..4; CmdName$ starts at 0xC7BA = 0xC7A6 + 5*4 |
| 0xC7BA | S x3, N x1, 11 elements (0..10) | CmdName$ | READ from DATA line 6903 (1AEC): Wait, Attack, Reload, Switch, Aim, Aim more, Best aim, Rapid Attack, Mindshock, Healing, Psychic Scream (0..10); string at DS 0xD07A; CmdName$(MemberCmd!) (5DB3), string at DS 0xD552; CmdName$ (A466) | extent: 11 elements (0..10) - READ CmdName$(0..10) (1AD6-1AEC); DelayUnits! starts at 0xC7E6 = 0xC7BA + 11*4 |
| 0xC7EE | N x5, S x1 | CommMood! | READ from DATA line 7171 (1B4F): 5 approaches x 3 attitudes (approach + (C7Mood!-1)*5) comms multiplier (3B05) |
| 0xC82A | N x3, S x1 | CommRatio! | READ from DATA 7171/7172 (1B95): 5 approaches x 9 strength-ratio buckets (5*Bucket! + approach) (3B05) |
| 0xC8DE | N x3, S x1 | CommObjective! | READ from DATA 7172 (1BDB): 5 approaches x 4 objectives (objective*5 + approach) added to the offer (3B05) |

## Unknowns (runtime calls not rendered)

| routine | uses | sites |
|---|---|---|
