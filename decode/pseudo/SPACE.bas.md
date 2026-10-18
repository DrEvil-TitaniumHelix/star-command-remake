# SPACE — BASIC-style pseudocode (lane mod-space) — COMPLETE

Evidence: `decode/listings/SPACE.lst` (regenerated after rt-naming), `decode/data/MODULE_CONSTANTS.md` (SPACE.EXE section), `decode/data/tools/_SPACE.json` (string/numeric literal table, code end 0x99F0), `decode/brun30/RT_LEDGER.md`, `decode/data/SPRITES.md`, `decode/data/DATA_FILES.md`; read 2026-10-15. Generated mechanically by `decode/pseudo/tools/qb2bas.py` (run twice: the first pass writes `_space_try.md.vars.json` with the variable kinds the second pass uses) with `--names decode/pseudo/SPACE_names.json --tempbase A860`; this file = `decode/pseudo/SPACE_header.md` + the generated body. Every statement carries its listing offset; labels `L_XXXX` are jump targets, `SUB_XXXX` near-call targets (GOSUB bodies). Screens and flows: `decode/pseudo/SPACE_SCREENS.md`.

## Conventions

- Names come from `SPACE_names.json`; each has an `_why` evidence string (reproduced in the Variables table). Unnamed addresses would print as `N_xxxx!` (single at DS xxxx), `S_xxxx$` (string), `I_xxxx%` (integer), `A_xxxx` (array by base address); after this pass none remain in the body.
- `G!()` is the 51x51 COMMON single array at DS 0x1850 (CHARINFO.BAS = the whole game state). COMMON scalars live inside it: a variable at DS `a` with 0x1850 <= a < 0x40F4 is `G!((a-0x1850)/4)`; named ones (`Fuel!` = G!(2200), `SectorX!` = G!(2216) ...) give the index in their evidence, unnamed ones print as `G!(n)` directly.
- `DEF FN` accessors (bodies at SUB_03E2/0414/0452) are inlined at every call site by the translator (the argument stores that precede each `call` are folded into the call):
  - `FNCrew(member, field) = INT(G!(member*100 + field + 1300) + .1)` — crew record field (member 1..8, field 0..99);
  - `FNIdx(member, field) = INT(member*100 + field + 1300.5)` — index of that field, used as an assignment target `G!(CINT(FNIdx(m, f))) = ...`;
  - `FNRound2(v)` = `INT(v*100 + 1 - (INT(v*100 + 1) = 9)) / 100` — two-decimal rounding of the planet readouts (mass, gravity, diameter, density; body 0452-0490, argument `Val!`). The credits sum `INT(CreditsHi!*30000 + CreditsLo! + .5)` is the body at 0433, which no code calls (SUB_16A6 does the credits arithmetic inline).
- Compiler temp slots T0..T5 (`RT3F_71 #80..#85`, DS 0xA860 + 8*n per RT_LEDGER.md) are rendered as the expression they hold; the three addresses that appear as plain operands (0xA860 T0, 0xA870 T2, 0xA878 T3) therefore never show up as variables (the previous pass had misnamed them `ShipBankOff!`/`PicOff!`).
- FOR/NEXT are reconstructed from the compiled pattern (`jmp` to the test, counter store, compare, jump back); `NEXT x STEP n` shows a non-unit step. Conditions after FCMP/FTEST are rendered as `IF ... THEN GOTO`; `jcc L1 ; jmp L2 ; L1:` pairs are folded into `IF NOT cond THEN GOTO L2`. Boolean idioms (`mov R,0 ; jcc ; dec R`) print as BASIC relational values (-1/0), e.g. `(RND < 0.5) * 2 + 1`.
- 2-D arrays: an element index of the form `x + N*y` is printed `A(x, y)`; the first dimension (N) is noted in the Arrays table (`PixColor!`, `PixObj!`, `PixCol!` are 16 x 2).
- Integer array reads through `[reg + base]` (also with negative displacements that wrap: `[di - 0x5FF4]` = DS 0xA00C) print as `Galaxy%(i)`, `HeadX%(i)`, `PicBuf(i)`.
- `RETURN   'with FAC = expr` notes the value left in the floating accumulator at a `ret` (meaningful only for the DEF FN bodies).

## Key map (SUB_212C / SUB_1C58)

See `SPACE_SCREENS.md` "Keys". Summary: extended keys -> `Cmd!` 1..11 (2 Up, 5 Left, 7 Right, 10 Down), letters -> 12 (A) .. 37 (Z), `Cmd! = 40` = "Pilot or ship not ready"; sub-menus use SUB_1C58 (A = 1 .., ENTER = -51, SPACE = -32). Main dispatch: 1C13 (cursor keys) and 1C39 (`ON Cmd!-11 GOTO`: A galaxy scan, B switch, C computer, D sector scan, E equip, F fix, H heal, I inspect, J time delay, L load).

## G!() layout as used by SPACE (index ranges, evidence = statements that read/write them)

| indices | meaning | evidence |
|---|---|---|
| 0, 3 | ship / pilot readiness flags (2 = not ready, must be 1) | 2224, 2273 |
| 0..6, 19..22 | ship equipment condition per slot (0 none, 1 ok, 2 broken, 3 unfixable) with `EquipName$(slot)` | 4523-4537, 78CA-78E5, 45C9-46D2 |
| 5 | computer working (= 1) | 5204 |
| 7..10 | shields 1..4 strength (arcs on the ship panel) | 1F25; also via 67+3i at 7A1A-7A5B |
| 11..16 | gun I fitted flags (`G!(I+10) = 1`) | 1770, 8252 |
| 17 | drive flag (MaxMove! = G!(63) when 1) | 8112 |
| 20..22 | drop-ship parts fitted | 8D58 |
| 44..46, 48, 50..53, 55 | BaseMove!, BaseWt!, MaxWt!, CargoWt10!, TotalWt10!, Defence!, MaxFuel!, ArmorDiv!, Armor! | SUB_7F9D, 7717-7861 |
| 60..75 (step 3) | ship items: type, ?, weight | 7FAC-7FEB |
| 60/61, 63/64 | missile killer fitted/%, defence hardware fitted/% | 7983, 79D9 |
| 78, 79 | CreditsHi!, CreditsLo! (credits = hi*30000 + lo) | SUB_16A6 |
| 82, 85, 86, 88, 89, 93 | CurMove!, DriveCfg!, StdDelay!, Delay!, UseEGA!, SoundOff! | 7861, 0064, 8327, 8346, 1032, 018C |
| 110..159 | mission flags: 1 active, 2 completed | SUB_90D1, SUB_8CC2, 5001-502E |
| 160..259 | espionage finds (1 = found) | 60BB-60C5 |
| 210..259 / 260..309 | kill list: ship type / tonnage (50 entries, ring) | SUB_548D, 1D28-1D3C pointers |
| 310..315 | KillStartAll!, KillPtr!, KillStartMission!, Kills!, KillStartPort!, Tonnage! | 52EA-535C, 52FF, 531E |
| 320..329 / 330..339 | tow list: ship type / tonnage | 55E0-5627 |
| 340..369 | gun ammo stock (gun type per slot) | 17AC-17DB, 8273-82A2 |
| 400..499 | cargo items held (1 = held) by `ItemName$` index | 5EDC-5EE6, 637B, 7B0A-7B48 |
| 500..554 | reload counts per weapon type (rebuilt in L_974E) | 976F-9807 |
| 683 + 7i (i = 1..6), 690 + 7i | gun records: type, +2 ?, +5 loaded ammo | 1721-180F, 8208-82DA, 95B7 |
| 800..1088 (step 12) | squad weapons: type, +3 condition (-1 broken, -2 repairing), +5 weight, +9 owner | 4935-498F, 7CCB-7D38, 83E2-842F, 9838-9964 |
| 1100..1397 (step 3) | ammo: type, +1 weight, +2 owner | 7D5C-7DCA, 8462-84AF, 97AA-9807 |
| 1300 + 100m + f | crew records, m = 0 (ship/unused) .. 8; fields used: 0 exists, 8 cur move, 10 hit bonus, 11 defence, 12 max move, 13 max wt, 14 cur wt, 15 HP, 16 max HP, 17..28 skills (`Skill$(1..12)`), 19 investigation skill, 20 medical, 23 comms, 26 repair, 27 esper level, 29 age (days), 31 status (0 dead 1 okay 2 rad), 34 rank, 35 class, 39 carried wt, 41..47 armor/weapon slots, 48/49 armor cur/max, 50 clones, 55 ?, 90/91 ? | FNCrew/FNIdx call sites, 6EC2-75AC |
| 2200..2266 | COMMON scalars of the ship: Fuel!, Years!, Days!, Hours!, ChainArg!, SectorX!/Y!, CursorCol!/Row!, SysCurX!/Y!, ShipHeading!, EntryMode!, Terrain!, Surprise!, mission parameters (2234..2244), Gravity10!, Breathable!, StationNo! | Variables table |
| 2230 + zone | base enemy strength per zone | 9080 |
| 2300..2597 (step 3) | personal items: type, +1 weight, +2 owner; types 1 medkit, 2 repair kit, 3/4 stealth items | SUB_247C, 7DEE-7E5C, 84E2-852F |

## Manual corrections (translator limitations; the body text is as generated)

- 21DF: generated `IF NOT ((Cmd! > 37) OR (Cmd! >= 12)) THEN GOTO L_2139`; the listing (21C0-21E1: `mov bx,0 ; jae ; dec bx` = `Cmd! < 12`, `mov dx,0 ; jbe ; dec dx` = `Cmd! > 37`, `or`, `je ret`) means `IF (Cmd! < 12) OR (Cmd! > 37) THEN GOTO L_2139` (reject anything that is not a letter). Translator request filed in STATUS.md.
- 3E38 `PRINT "Star"; -StarNo!` and 576B `LEFT$(STR$(-PlanetNo!(Idx!)), 2)`: the negations are real (`RT3F_AF`/`RT3F_B1`); STR$ of a negative number has no leading space, so the screen shows e.g. `Star-3` / `Planet-2`.
- 25AA-25D9 and 25E0-2625 are reachable only by fall-through from SUB_2544's `GOTO L_2544` loop (never) - dead code blocks (a `" is dead."` message and a three-letter yes/no input).
- 2129 `GOTO L_1B5D` after SUB_2056's last RETURN and 019F7 / 08B32 / 08BC5 (`RETURN` after `RETURN`) are compiler padding between routines.
- 0x99B4-0x99EE after the last `ret` is data (the `' asm` lines at the end).

## Unknowns

No runtime call is left unrendered (see the table at the end). Open points of interpretation (all marked M in the Variables table): `Difficulty!` (0xAB8C) is only known from its use as an item range / enemy strength factor; the meaning of `G!(0)` vs `G!(3)` ("Pilot or ship not ready") is not separable from SPACE alone; crew fields 55, 90, 91 and ship-item field +1 are read without a printed label.

## Pseudocode

```basic
00046  Fmt3$ = "###"
0004F  Fmt2$ = "##"
00058  Drive$ = ""
00064  IF DriveCfg! <> 1 THEN GOTO L_0072
L_0069:
0006C  Drive$ = "A:"
0006F  GOTO L_0089
L_0072:
0007B  IF DriveCfg! <> 2 THEN GOTO L_0089
L_0080:
00086  Drive$ = "B:"
L_0089:
0008F  FOR I! = 0 TO 9
L_0092:
000A6  READ OrbitDX!(CINT(I!))
000AF  READ OrbitDY!(CINT(I!))
000BA  NEXT I!
000D1  FOR I! = 0 TO 3
L_00D4:
000E6  READ TechLevel$(CINT(I!))
000F1  NEXT I!
00107  FOR I! = 0 TO 10
L_010A:
0011C  READ LifeForm$(CINT(I!))
00127  NEXT I!
0013D  FOR I! = 0 TO 4
L_0140:
00152  READ Surface$(CINT(I!))
0015D  NEXT I!
00177  Log4! = LOG(3.999)
0017D  PLAY "MF"
0018C  SndDur! = 1 - SoundOff!
00195  FOR J! = 0 TO 7
L_0198:
001AA  READ HeadX%(CINT(J!))
001B3  READ HeadY%(CINT(J!))
001BE  NEXT J!
001D5  ZoneTag$(0) = "A"
001DE  ZoneTag$(1) = "B"
001E7  ZoneTag$(2) = "N"
001F0  ZoneTag$(3) = "?"
001F9  IF Resumed! <> 0 THEN GOTO L_01FE
L_01FE:
00210  BLOAD Drive$ + "GALMAP.BAS", &H6E56
00225  BLOAD Drive$ + "GALAXY.BAS", &HA00C
0023A  BLOAD Drive$ + "SPACESH.BAS", &H4890
00243  IF Resumed! = 0 THEN GOTO L_0257
L_0248:
00254  BLOAD "CHARINFO", &H1850
L_0257:
0028B  BLOAD Drive$ + "SHIP" + STR$(-1 - ShipClass!) + ".BAS", &H65FC
00294  Status$(0) = "Dead"
0029D  Status$(1) = "Okay"
002A6  Status$(2) = "Rad"
002AF  SlotTag$(1) = "P"
002B8  SlotTag$(2) = "C"
002C1  FOR I! = 3 TO 8
L_02C4:
002E8  SlotTag$(CINT(I!)) = CHR$(CINT(I! + 46))
002F3  NEXT I!
00309  SlotTag$(0) = "SH"
00312  ClassName$(0) = "Marine"
0031B  ClassName$(1) = "Pilot"
00324  ClassName$(2) = "Soldier"
0032D  CondMark$(1) = "-"
00336  CondMark$(2) = "*"
0033F  CondMark$(3) = "#"
00348  IF Resumed! = 0 THEN GOTO L_03C4
L_034D:
00359  BLOAD "LOGO", &H40F4
00369  OPEN "CHARNAME" FOR INPUT AS #1
0036F  INPUT #1, ShipName$
00383  FOR I! = 1 TO 8
L_0386:
00389  INPUT #1, CrewName$(CINT(I!))
003AE  NEXT I!
003C1  CLOSE #1
L_03C4:
003CA  PortName$(0) = " EARTH"
003D3  PortName$(1) = "SOLONOR"
003DC  PortName$(2) = "  LUNA"
003DF  GOTO L_0411
SUB_03E2:
00410  RETURN   'with FAC = INT(G!(CINT(FnMember! * 100 + FnField! + 1300)) + 0.1)
L_0411:
00411  GOTO L_0430
SUB_0414:
0042F  RETURN   'with FAC = INT(Fn2Member! * 100 + Fn2Field! + 1300.5)
L_0430:
00430  GOTO L_044F
0044E  RETURN   'with FAC = INT(CreditsHi! * 30000 + CreditsLo! + 0.5)
L_044F:
0044F  GOTO L_0491
SUB_0452:
00490  RETURN   'with FAC = (INT(Val! * 100 + -((INT(Val! * 100 + 1) = 9) - 1))) / 100
L_0491:
00497  IF Resumed! = 0 THEN GOTO L_0EC7
L_049C:
0049C  GOSUB SUB_2299
004A8  LOCATE 20, 2
004AB  PRINT "Change things? ";
004B7  GOSUB SUB_2544
004C0  IF YesNo! = 0 THEN GOTO L_0EC7
L_04C5:
004CB  MaxFuel! = 400
004D4  G!(43) = 1
004DD  G!(800) = 12
004E6  G!(803) = -1
004EF  G!(809) = 3
004F8  G!(812) = 8
00501  G!(815) = -2
0050A  G!(821) = 2
00513  G!(1090) = 21
0051C  G!(1100) = 1
00525  G!(1101) = 8
0052E  G!(1397) = 3
00537  G!(1399) = 5
0053D  G!(1394) = 5
00546  G!(1396) = 7
0054F  FOR I! = 2300 TO 2421
L_0552:
00581  G!(CINT(I!)) = INT(RND * 11 + 1)
0058C  NEXT I! STEP 3
005A2  MissileKiller! = 2
005AD  DefHardware! = 1
005B5  G!(69) = 2
005BE  G!(72) = 3
005C7  G!(690) = 12
005D0  G!(725) = 11
005DB  G!(16) = 2
005E3  G!(340) = 11
005EC  G!(369) = 3
005F5  G!(400) = 1
005FD  G!(499) = 2
00606  FOR I! = 1 TO 8
L_060A:
00610  FOR ShipY! = 0 TO 6
L_0614:
0063B  G!(CINT(FNIdx(I!, ShipY!))) = 50
00647  NEXT ShipY!
00660  NEXT I!
00676  G!(1600) = 0
0067F  FOR I! = 1 TO 8
L_0682:
006B9  G!(CINT(FNIdx(I!, 34))) = RND * 12 + 1
006E7  G!(CINT(FNIdx(I!, 35))) = RND * 2
00713  G!(CINT(FNIdx(I!, 31))) = RND * 2
0071F  NEXT I!
L_0732:
00738  FOR I! = 0 TO 22
L_073C:
0075D  G!(CINT(I!)) = INT(RND * 4)
00768  NEXT I!
0077E  ComputerCond! = 1
007AA  G!(CINT(FNIdx(5, 48))) = 10
007D6  G!(CINT(FNIdx(5, 49))) = 13
00800  G!(CINT(FNIdx(0, 48))) = 2
00828  G!(CINT(FNIdx(0, 49))) = 7
00831  FOR I! = 1 TO 8
L_0834:
00867  G!(CINT(FNIdx(I!, 16))) = RND * 100
008B4  G!(CINT(FNIdx(I!, 15))) = RND * FNCrew(I!, 16)
008C0  NEXT I!
L_08D3:
008D9  G!(110) = 2
008DF  G!(113) = 2
008E5  G!(116) = 2
008EB  G!(119) = 2
00917  G!(CINT(FNIdx(5, 9))) = 12
00941  G!(CINT(FNIdx(6, 9))) = 9
0094A  FOR I! = 1 TO 8
L_094E:
00980  G!(CINT(FNIdx(I!, 13))) = RND * 10 + 10
0098C  NEXT I!
009C0  G!(CINT(FNIdx(5, 5))) = 70
009E8  G!(CINT(FNIdx(5, 35))) = 0
009F1  MaxWt! = 300
009FA  BaseWt! = 200
00A03  BaseMove! = 8
00A0C  Armor! = 100
00A15  ArmorDiv! = 15
00A1E  FOR I! = 1 TO 8
L_0A22:
00A47  G!(CINT(FNIdx(I!, 13))) = 5
00A53  NEXT I!
00A69  Years! = 72
00A72  Days! = 123
00A7B  FOR I! = 320 TO 329
L_0A7E:
00A9F  G!(CINT(I!)) = RND * 22
00AAA  NEXT I!
00AC0  FOR I! = 330 TO 339
L_0AC4:
00AED  G!(CINT(I!)) = INT(RND * 2.2)
00AF8  NEXT I!
00B0E  G!(210) = 22
00B17  G!(260) = 10
00B20  G!(259) = 21
00B29  G!(309) = 20
00B32  G!(105) = 1
00B3B  KillStartPort! = 26
00B41  KillPtr! = 26
00B4A  KillStartMission! = 25
00B53  KillStartAll! = 27
00B5C  Kills! = 67
00B65  Tonnage! = 123456
00B6E  G!(162) = 1
00B74  G!(189) = 1
00B7D  FOR I! = 1 TO 8
L_0B80:
00B9F  CrewName$(CINT(I!)) = "NAME" + STR$(I!)
00BAA  NEXT I!
00BC0  G!(10) = 1
00BC9  G!(123) = 1
00BD2  G!(727) = 5
00BDB  FOR I! = 1 TO 8
L_0BDE:
00C05  G!(CINT(FNIdx(I!, 49))) = 15
00C2D  G!(CINT(FNIdx(I!, 48))) = 8
00C39  NEXT I!
00C6E  G!(CINT(FNIdx(2, 20))) = 3
00C96  G!(CINT(FNIdx(7, 19))) = 5
00C9F  DropPart3! = 1
00CA8  FOR I! = 2230 TO 2244
L_0CAC:
00CBE  READ G!(CINT(I!))
00CC9  NEXT I!
00CE0  Fuel! = 999
00CE9  EngineCond! = 1
00CEF  PowerCond! = 1
00CF8  FOR I! = 1 TO 8
L_0CFC:
00D21  G!(CINT(FNIdx(I!, 23))) = 2
00D2D  NEXT I!
00D43  FOR I! = 1100 TO 1397
L_0D46:
00D6F  G!(CINT(I!)) = INT(RND * 25)
00D89  G!(CINT(I! + 2)) = 2
00D94  NEXT I! STEP 3
00DAA  FOR I! = 2300 TO 2597
L_0DAE:
00DD7  G!(CINT(I!)) = INT(RND * 11)
00DF1  G!(CINT(I! + 2)) = 2
00DFC  NEXT I! STEP 3
00E12  FOR I! = 1 TO 25
L_0E16:
00E2A  Ix! = I! * 12 + 788
00E42  G!(CINT(Ix!)) = I!
00E5D  G!(CINT(Ix! + 9)) = 2
00E68  NEXT I!
00E7E  G!(2266) = 77
00E87  Fuel! = 14
00E90  G!(7) = 2
00E9B  G!(8) = 1
00EA6  G!(9) = 0
00EAE  G!(10) = 1
00EB6  SndDur! = 0
00EBE  EngineCond! = 2
00EC4  PowerCond! = 2
L_0EC7:
00ECD  RANDOMIZE TIMER
00ED6  FOR Member! = 1 TO 8
L_0EDA:
00EF4  IF FNCrew(Member!, 0) > 0 THEN GOTO L_0F21
L_0EF9:
00F1E  G!(CINT(FNIdx(Member!, 31))) = 0
L_0F21:
00F2A  NEXT Member!
00F40  Difficulty! = 0
00F49  FOR I! = 110 TO 159
L_0F4C:
00F63  IF G!(CINT(I!)) <= 0 THEN GOTO L_0F76
L_0F68:
00F73  Difficulty! = I! - 110
L_0F76:
00F7F  NEXT I!
00F95  EncChance! = BaseEnc!
00FA0  EntryMode! = 1
00FAB  IF Resumed! <> 1 THEN GOTO L_0FB8
L_0FB0:
00FB5  EncChance! = 0
L_0FB8:
00FB8  GOSUB SUB_1023
00FBB  GOTO L_0FC1
L_0FBE:
00FBE  GOSUB SUB_2626
L_0FC1:
00FC7  IF G!(2266) <= 0 THEN GOTO L_1017
L_0FCC:
00FCF  FuelAdd! = G!(2266)
00FD7  G!(2266) = 0
00FE2  IF G!(2254) <= 0 THEN GOTO L_1017
L_0FE7:
00FE7  GOSUB SUB_2299
00FF3  LOCATE 22, 13
00FF6  PRINT "You take fuel!"
01002  GOSUB SUB_19D1
01005  GOSUB SUB_19D1
01008  GOSUB SUB_19D1
0100B  GOSUB SUB_19D1
0100E  GOSUB SUB_3629
01011  GOSUB SUB_19D1
01014  GOSUB SUB_19D1
L_1017:
0101D  ShownAlert! = 4
01020  GOTO L_28C1
SUB_1023:
01026  CLS
01032  IF UseEGA! <> 1 THEN GOTO L_104C
L_1037:
0103A  SCREEN 1
01040  PALETTE 1, 9
01049  PALETTE 2, 4
L_104C:
01069  LINE (0, 0)-(319, 199), 1, BF
01086  LINE (0, 0)-(319, 199), 2, B
010A4  LINE (1, 1)-(318, 198), 2, B
010A7  GOTO L_12A6
L_10AA:
010D0  CIRCLE (16, 75.5), 68.5, 2, 1.57, 4.71, 8
010F9  CIRCLE (15, 75.5), 68.5, 2, 1.57, 4.71, 8
01122  CIRCLE (143, 75.5), 68.5, 2, 4.71, 1.57, 8
0114B  CIRCLE (144, 75.5), 68.5, 2, 4.71, 1.57, 8
0116D  LINE (16, 6)-(143, 7), 2, BF
0118D  LINE (16, 144)-(143, 145), 2, BF
011A2  PAINT (16, 75), 0, 2
011A5  GOSUB SUB_2626
011CE  CIRCLE (16, 171.5), 20.5, 2, 1.57, 4.71, 2
011F7  CIRCLE (15, 171.5), 20.5, 2, 1.57, 4.71, 2
01220  CIRCLE (303, 171.5), 20.5, 2, 4.71, 1.57, 2
01249  CIRCLE (304, 171.5), 20.5, 2, 4.71, 1.57, 2
0126B  LINE (16, 150)-(303, 151), 2, BF
0128B  LINE (14, 192)-(305, 193), 2, BF
012A0  PAINT (16, 171), 0, 2
012A3  GOTO L_1656
L_12A6:
012CC  CIRCLE (248, 35.5), 28.5, 2, 1.57, 4.71, 3
012F5  CIRCLE (247, 35.5), 28.5, 2, 1.57, 4.71, 3
0131E  CIRCLE (303, 35.5), 28.5, 2, 4.71, 1.57, 3
01347  CIRCLE (304, 35.5), 28.5, 2, 4.71, 1.57, 3
01369  LINE (248, 6)-(303, 7), 2, BF
01389  LINE (247, 64)-(304, 65), 2, BF
0139E  PAINT (248, 35), 0, 2
013A1  GOSUB SUB_1CE3
013CA  CIRCLE (160, 107.5), 36.5, 2, 1.57, 4.71, 9
013F3  CIRCLE (159, 107.5), 36.5, 2, 1.57, 4.71, 9
0141C  CIRCLE (303, 107.5), 36.5, 2, 4.71, 1.57, 9
01445  CIRCLE (304, 107.5), 36.5, 2, 4.71, 1.57, 9
01467  LINE (160, 70)-(303, 71), 2, BF
01487  LINE (160, 144)-(303, 145), 2, BF
0149C  PAINT (160, 107), 0, 2
0149F  GOTO L_15A5
L_14A2:
014B4  PUT (154, 0), Logo, PSET
014D0  LINE (153, 0)-(236, 18), 2, B
014EF  LINE (154, 1)-(235, 17), 2, B
01504  PAINT (155, 2), 0, 2
0150D  FOR I! = 22 TO 54
L_1510:
01535  LINE (157, I!)-(234, I! + 11), 2, B
0155D  LINE (158, I! + 1)-(233, I! + 10), 2, B
01586  LINE (159, I! + 2)-(232, I! + 9), 0, BF
0158F  NEXT I! STEP 16
L_15A2:
015A2  GOTO L_161C
L_15A5:
015AE  LOCATE 10, 25
015B1  PRINT "NAME    AM RL"
015C3  FOR Member! = 1 TO 8
L_15C6:
015DC  LOCATE CINT(Member! + 10), 21
015DF  PRINT SlotTag$(CINT(Member!)); ">"
01603  NEXT Member!
01613  GOSUB SUB_1A7B
01616  GOSUB SUB_1B37
01619  GOTO L_14A2
L_161C:
01625  LOCATE 4, 21
01628  PRINT "FUEL:"
0163E  LOCATE 6, 21
01641  PRINT "ARMOR:"
0164D  GOSUB SUB_1A28
01650  GOSUB SUB_1A5F
01653  GOTO L_10AA
L_1656:
01656  RETURN
SUB_1657:
01663  DelayCount! = Delay! * 1.2
0166C  FOR Tmp4! = 1 TO DelayCount!
L_1670:
01679  NEXT Tmp4!
01689  RETURN
SUB_168A:
01693  LOCATE 24, 3
01696  PRINT "Select Option";
016A2  GOSUB SUB_1C58
016A5  RETURN
SUB_16A6:
016BB  Delta! = CreditsHi! * 30000 + CreditsLo! + Delta!
016C6  IF Delta! <= 9999999 THEN GOTO L_16D0
L_16CB:
016CD  Delta! = 9999999
L_16D0:
016E0  CreditsHi! = Delta! / 30000
016F2  CreditsLo! = Delta! - (CreditsHi! * 30000)
016F5  RETURN   'with FAC = CreditsLo!
SUB_16F6:
016F6  RETURN
SUB_16F7:
0170D  LOCATE CINT(I! + 12), 33
01721  Ix! = I! * 7 + 683
01736  Tmp3! = G!(CINT(Ix!))
01770  IF NOT ((INT(G!(CINT(I! + 10))) <> 1) OR (Tmp3! < 1)) THEN GOTO L_1782
L_1775:
01775  PRINT "-- --"
01781  RETURN   'with FAC = INT(G!(CINT(I! + 10)))
L_1782:
0178B  IF Tmp3! <= 14 THEN GOTO L_179D
L_1790:
01790  PRINT "Okay"
0179C  RETURN
L_179D:
017A3  AmmoCount! = 0
017AC  FOR Count! = 340 TO 369
L_17B0:
017DB  AmmoCount! = AmmoCount! - (G!(CINT(Count!)) = Tmp3!)
017E6  NEXT Count!
0180F  Tmp4! = G!(CINT(Ix! + 5))
01815  PRINT USING "## ##"; Tmp4!; AmmoCount!
01827  RETURN   'with FAC = Ix! + 5
SUB_1828:
01828  GOSUB SUB_2299
01834  LOCATE 22, 3
0183D  FOR I! = 1 TO 8
L_1840:
0185A  IF FNCrew(I!, 0) <= 0 THEN GOTO L_1868
L_185F:
01865  Idx! = 1
L_1868:
01871  NEXT I!
01881  PRINT Prompt$;
L_188D:
01893  K$ = INKEY$
0189E  IF K$ = "" THEN GOTO L_188D
018AC  I! = ASC(K$)
018B7  IF I! <> 13 THEN GOTO L_18C8
L_18BC:
018C2  Member! = 0
018C5  GOTO L_195E
L_18C8:
018E7  IF NOT ((I! = 112) OR (I! = 80)) THEN GOTO L_18F8
L_18EC:
018F2  Member! = 1
018F5  GOTO L_195E
L_18F8:
01917  IF NOT ((I! = 99) OR (I! = 67)) THEN GOTO L_1928
L_191C:
01922  Member! = 2
01925  GOTO L_195E
L_1928:
01947  IF NOT ((I! < 55) AND (I! > 48)) THEN GOTO L_195B
L_194C:
01955  Member! = I! - 46
01958  GOTO L_195E
L_195B:
0195B  GOTO L_188D
L_195E:
019C8  IF NOT ((PickAny! = 1) OR (((FNCrew(Member!, 31) > 0) AND (FNCrew(Member!, 0) > 0)) OR (Member! = 0))) THEN GOTO L_19CE
L_19CD:
019CD  RETURN   'with FAC = FNCrew(Member!, 31)
L_19CE:
019CE  GOTO L_188D
SUB_19D1:
019D7  FOR K! = 1 TO 5
L_19DA:
019DA  GOSUB SUB_1657
019E6  NEXT K!
019F6  RETURN
019F7  RETURN
SUB_19F8:
019F8  PRINT "Press ENTER Key";
L_1A04:
01A0A  K$ = INKEY$
01A15  IF K$ = "" THEN GOTO L_1A04
01A25  IF CHR$(13) <> K$ THEN GOTO L_1A04
01A27  RETURN
SUB_1A28:
01A2E  Tmp4! = Armor!
01A39  IF Tmp4! <= 999 THEN GOTO L_1A43
L_1A3E:
01A40  Tmp4! = 999
L_1A43:
01A4C  LOCATE 6, 27
01A52  PRINT USING "###"; Tmp4!
01A5E  RETURN
SUB_1A5F:
01A68  LOCATE 4, 26
01A6E  PRINT USING "####"; Fuel!
01A7A  RETURN
SUB_1A7B:
01A81  FOR M! = 1 TO 8
L_1A84:
01A9A  LOCATE CINT(M! + 10), 23
01AB9  IF FNCrew(M!, 31) = 1 THEN GOTO L_1AEA
L_1ABE:
01ABE  PRINT Status$(CINT(FNCrew(M!, 31)));
01AE7  GOTO L_1B01
L_1AEA:
01AEA  PRINT CrewName$(CINT(M!));
L_1B01:
01B01  PRINT SPC(-(POS(0) - 31)); "";
01B23  NEXT M!
L_1B36:
01B36  RETURN
SUB_1B37:
01B3D  FOR I! = 1 TO 6
L_1B40:
01B40  GOSUB SUB_16F7
01B4C  NEXT I!
01B5C  RETURN
L_1B5D:
01B5D  GOSUB SUB_2299
01B69  LOCATE 20, 3
01B6C  PRINT "A-Up Scan    B-Switch"
01B8B  PUT (240, 156), Cursor, XOR
01B97  LOCATE 21, 3
01B9A  PRINT "C-Computer   D-Down Scan"
01BB0  LOCATE 22, 3
01BB3  PRINT "E-Equip      F-Fix"
01BC7  LOCATE 23, 3
01BCA  PRINT "H-Heal       I-Inspect"
01BDE  LOCATE 24, 3
01BE1  PRINT "J-Time Delay L-Load     SELECT ONE";
L_1BED:
01BF3  DX! = 0
01BF9  DY! = 0
01BFC  GOSUB SUB_212C
01C08  IF Cmd! = 40 THEN GOTO L_33A6
L_1C0D:
01C13  ON CINT(Cmd!) GOTO L_1BED, L_271E, L_1BED, L_1BED, L_274E, L_1BED, L_27B4, L_1BED, L_1BED, L_277E, L_1BED
01C39  ON CINT(Cmd! - 11) GOTO L_32DF, L_4094, L_51F8, L_321A, L_83A3, L_429A, L_1BED, L_4AA8, L_6E0E, L_8318, L_1BED, L_81E7
01C55  GOTO L_1B5D
SUB_1C58:
01C5E  K$ = INKEY$
01C69  IF K$ = "" THEN GOTO L_1C58
01C77  Cmd! = ASC(K$)
01C82  IF Cmd! <= 95 THEN GOTO L_1C92
L_1C87:
01C8F  Cmd! = Cmd! - 32
L_1C92:
01C9D  Cmd! = Cmd! - 64
01CDA  IF NOT (((Cmd! <= CmdMax!) AND (Cmd! >= CmdMin!)) OR ((Cmd! = -51) OR (Cmd! = -32))) THEN GOTO L_1CE0
L_1CDF:
01CDF  RETURN   'with FAC = Cmd!
L_1CE0:
01CE0  GOTO L_1C58
SUB_1CE3:
01CE9  I! = 264
01CF2  ShipY! = 24
01CFB  Heading! = ShipHeading!
01D0A  ON CINT(Heading! + 1) GOTO L_1D1E, L_1D38, L_1D52, L_1D6C, L_1D86, L_1DA0, L_1DBA, L_1DD4
L_1D1E:
01D32  PUT (I!, ShipY!), ShipHead0, PSET
01D35  GOTO L_1DEE
L_1D38:
01D4C  PUT (I!, ShipY!), ShipHead1, PSET
01D4F  GOTO L_1DEE
L_1D52:
01D66  PUT (I!, ShipY!), ShipHead2, PSET
01D69  GOTO L_1DEE
L_1D6C:
01D80  PUT (I!, ShipY!), ShipHead3, PSET
01D83  GOTO L_1DEE
L_1D86:
01D9A  PUT (I!, ShipY!), ShipHead4, PSET
01D9D  GOTO L_1DEE
L_1DA0:
01DB4  PUT (I!, ShipY!), ShipHead5, PSET
01DB7  GOTO L_1DEE
L_1DBA:
01DCE  PUT (I!, ShipY!), ShipHead6, PSET
01DD1  GOTO L_1DEE
L_1DD4:
01DE8  PUT (I!, ShipY!), ShipHead7, PSET
01DEB  GOTO L_1DEE
L_1DEE:
01DF4  FOR Count! = 0 TO 7
L_1DF8:
01E04  Ix! = Count! + Heading!
01E0F  IF Ix! <= 7 THEN GOTO L_1E1F
L_1E14:
01E1C  Ix! = Ix! - 8
L_1E1F:
01E3E  IF NOT ((Count! = 6) OR (Count! = 2)) THEN GOTO L_1E4F
L_1E43:
01E49  J! = 7
01E4C  GOTO L_1E8B
L_1E4F:
01E88  J! = (Count! > 2) + (Count! > 6) + Count! + 1
L_1E8B:
01EA5  I! = HeadX%(CINT(Ix!)) + 228
01EB9  ShipY! = HeadY%(CINT(Ix!)) - 76
01EBC  GOSUB SUB_2056
01EC8  NEXT Count!
L_1EDB:
01EE1  L! = 1
01EEA  Tmp1! = 0
01EF5  Tmp2! = 6.28
01EFD  ArcOn! = 0
01F00  GOSUB SUB_1FB5
01F09  FOR ShieldNo! = 1 TO 4
L_1F0C:
01F25  L! = G!(CINT(ShieldNo! + 6))
01F2D  IF L! = 0 THEN GOTO L_1F6B
L_1F32:
01F4E  Tmp1! = (3.2 - (ShieldNo! * 2) - Heading!) * 0.7854
01F5C  Tmp2! = Tmp1! + 1.2566
01F65  ArcOn! = 1
01F68  GOSUB SUB_1F85
L_1F6B:
01F74  NEXT ShieldNo!
01F84  RETURN
SUB_1F85:
01F8B  IF Tmp1! >= 0 THEN GOTO L_1F9D
L_1F90:
01F98  Tmp1! = Tmp1! + 6.283185
01F9B  GOTO L_1F85
L_1F9D:
01FA3  IF Tmp2! >= 0 THEN GOTO L_1FB5
L_1FA8:
01FB0  Tmp2! = Tmp2! + 6.283185
01FB3  GOTO L_1F85
SUB_1FB5:
01FC1  ArcX1! = 277 - L!
01FCA  FOR I! = 275 TO ArcX1!
L_1FCE:
01FDA  ArcY1! = 37 - L!
01FE3  FOR ShipY! = 35 TO ArcY1!
L_1FE6:
0201D  CIRCLE (I!, ShipY!), 25.5, CINT(L! + ArcOn! - 1), Tmp1!, Tmp2!, 1
02029  NEXT ShipY!
02042  NEXT I!
L_2055:
02055  RETURN
SUB_2056:
0205C  ON CINT(J!) GOSUB L_206F, L_2087, L_209F, L_20B7, L_20CF, L_20E7, L_20FF
0206E  RETURN
L_206F:
02083  PUT (I!, ShipY!), Digit1, PSET
02086  RETURN
L_2087:
0209B  PUT (I!, ShipY!), Digit2, PSET
0209E  RETURN
L_209F:
020B3  PUT (I!, ShipY!), Digit3, PSET
020B6  RETURN
L_20B7:
020CB  PUT (I!, ShipY!), Digit4, PSET
020CE  RETURN
L_20CF:
020E3  PUT (I!, ShipY!), Digit5, PSET
020E6  RETURN
L_20E7:
020FB  PUT (I!, ShipY!), Digit6, PSET
020FE  RETURN
L_20FF:
02113  PUT (I!, ShipY!), Digit1, PSET
02125  PUT (I!, ShipY!), Digit1, XOR
02128  RETURN
02129  GOTO L_1B5D
SUB_212C:
02137  IF INKEY$ <> "" THEN GOTO L_212C
L_2139:
0213F  K$ = INKEY$
0214A  IF K$ = "" THEN GOTO L_2139
02157  IF LEN(K$) <= 1 THEN GOTO L_2196
L_215C:
02170  Cmd! = ASC(RIGHT$(K$, 1)) - 70
02191  IF ((Cmd! > 11) OR (Cmd! < 1)) THEN GOTO L_2139
02193  GOTO L_21E5
L_2196:
021A5  Cmd! = ASC(K$) - 53
021B0  IF Cmd! <= 43 THEN GOTO L_21C0
L_21B5:
021BD  Cmd! = Cmd! - 32
L_21C0:
021DF  IF (Cmd! > 37) OR (Cmd! < 12) THEN GOTO L_2139
L_21E4:
021E4  RETURN
L_21E5:
02224  IF NOT ((PowerCond! = 2) OR ((EngineCond! = 2) OR (FNCrew(1, 31) = 0))) THEN GOTO L_2254
L_2229:
02229  GOSUB SUB_2299
02235  LOCATE 22, 3
02238  PRINT "Pilot or ship not ready"
02244  GOSUB SUB_19D1
02247  GOSUB SUB_19D1
02250  Cmd! = 40
02253  RETURN
L_2254:
02273  IF NOT ((PowerCond! = 1) AND (EngineCond! = 1)) THEN GOTO L_2279
L_2278:
02278  RETURN
L_2279:
0227C  CLS
02288  LOCATE 12, 1
0228B  PRINT "Ship is irreparable. The crew starves!"
L_2297:
02297  GOTO L_2297
SUB_2299:
022B7  LINE (16, 152)-(303, 191), 0, BF
022BA  RETURN
SUB_22BB:
022D9  LINE (16, 160)-(303, 191), 0, BF
022DC  RETURN
SUB_22DD:
022FA  LINE (16, 8)-(143, 143), 0, BF
022FD  RETURN
SUB_22FE:
0231A  LINE (16, 16)-(143, 143), 0, BF
0231D  RETURN
SUB_231E:
02324  MaxLen! = 4
SUB_2327:
02332  CurX! = POS(0)
0233E  CurY! = CSRLIN
02347  K$ = ""
L_234A:
0236A  LOCATE CINT(CurY!), CINT(CurX!), 1, 0, 7
0236D  PRINT K$; " ";
L_237F:
02385  Ch$ = INKEY$
02390  IF Ch$ = "" THEN GOTO L_237F
0239E  I! = ASC(Ch$)
023A9  IF I! = 13 THEN GOTO L_246D
L_23AE:
023D3  IF NOT ((LEN(K$) > 0) AND (I! = 8)) THEN GOTO L_23EF
L_23D8:
023E9  K$ = LEFT$(K$, LEN(K$) - 1)
023EC  GOTO L_234A
L_23EF:
0241F  IF ((I! > 57) OR (I! < 48)) AND (MaxLen! = 4) THEN GOTO L_234A
L_2424:
02443  IF (I! > 126) OR (I! < 32) THEN GOTO L_237F
L_2448:
02457  IF LEN(K$) >= MaxLen! THEN GOTO L_237F
L_245C:
02467  K$ = K$ + Ch$
0246A  GOTO L_234A
L_246D:
02478  NumIn% = CINT(VAL(K$))
0247B  RETURN   'with FAC = VAL(K$)
SUB_247C:
02482  Idx! = 0
0248B  FOR I! = 2300 TO 2597
L_248E:
024A8  IF G!(CINT(I!)) <> ItemType! THEN GOTO L_24C6
L_24AD:
024B2  Ix! = I!
024BB  Idx! = 1
024C3  I! = 2600
L_24C6:
024CF  NEXT I! STEP 3
024DF  RETURN
SUB_24E0:
024E9  LOCATE 8, 21
024EC  PRINT "   RED   "
024F8  RETURN
SUB_24F9:
02502  LOCATE 8, 21
02505  PRINT " YELLOW  "
02511  RETURN
SUB_2512:
0251B  LOCATE 8, 21
0251E  PRINT "  GREEN  "
0252A  RETURN
SUB_252B:
02534  LOCATE 8, 21
02537  PRINT "         "
02543  RETURN
SUB_2544:
0254A  K$ = INKEY$
0256B  IF NOT ((K$ = "Y") OR (K$ = "y")) THEN GOTO L_257A
L_2570:
02576  YesNo! = 1
02579  RETURN
L_257A:
02599  IF NOT ((K$ = "N") OR (K$ = "n")) THEN GOTO L_25A8
L_259E:
025A4  YesNo! = 0
025A7  RETURN
L_25A8:
025A8  GOTO L_2544
025AA  GOSUB SUB_2299
025B6  LOCATE 20, 3
025B9  PRINT CrewName$(CINT(Member!)); " is dead."
025D6  GOSUB SUB_19D1
025D9  RETURN
025E0  MaxLen! = 3
025E3  PRINT "(yes/no) ";
025EF  GOSUB SUB_2327
025F8  YesNo! = 0
0261A  IF NOT ((K$ = "YES") OR (K$ = "yes")) THEN GOTO L_2625
L_261F:
02622  YesNo! = 1
L_2625:
02625  RETURN
SUB_2626:
02626  GOSUB SUB_22DD
0263B  PUT (32, 0), HdrLongRange, PSET
02654  MapCol! = INT(SectorX! * 0.125)
0266C  MapRow! = INT(SectorY! * 0.125)
02685  MapNo! = MapRow! * 4 + MapCol! + 1
02696  CellX! = SectorX! - (MapCol! * 8)
026A7  CellY! = SectorY! - (MapRow! * 8)
026BA  SectorIdx! = SectorX! + SectorY! * 32
026C3  Idx! = 1
026CF  IF MapNo! = LoadedMap! THEN GOTO L_2708
L_26D4:
026D4  LoadedMap! = MapNo!
02705  BLOAD Drive$ + "MAP" + STR$(-MapNo!) + ".BAS", &H9008
L_2708:
0271A  PUT (16, 16), PicBuf, PSET
0271D  RETURN
L_271E:
0273A  IF NOT ((CellY! > 0) OR (MapRow! > 0)) THEN GOTO L_274B
L_273F:
02745  DY! = -1
02748  GOTO L_27EA
L_274B:
0274B  GOTO L_1BED
L_274E:
0276A  IF NOT ((CellX! > 0) OR (MapCol! > 0)) THEN GOTO L_277B
L_276F:
02775  DX! = -1
02778  GOTO L_27EA
L_277B:
0277B  GOTO L_1BED
L_277E:
027A0  IF NOT ((CellY! < 7) OR (MapRow! < 3)) THEN GOTO L_27B1
L_27A5:
027AB  DY! = 1
027AE  GOTO L_27EA
L_27B1:
027B1  GOTO L_1BED
L_27B4:
027D6  IF NOT ((CellX! < 7) OR (MapCol! < 3)) THEN GOTO L_27E7
L_27DB:
027E1  DX! = 1
027E4  GOTO L_27EA
L_27E7:
027E7  GOTO L_1BED
L_27EA:
02819  PUT (CellX! * 16 + 16, CellY! * 16 + 16), PlanetMark, XOR
02822  FuelUse! = 5
0282B  Idx! = 0
0283B  SectorX! = SectorX! + DX!
0284B  SectorY! = SectorY! + DY!
02858  CellX! = CellX! + DX!
02867  CellY! = CellY! + DY!
0287F  SectorIdx! = DY! * 32 + SectorIdx! + DX!
028B9  IF NOT ((CellY! > 7) OR ((CellX! > 7) OR ((CellY! < 0) OR (CellX! < 0)))) THEN GOTO L_28C1
L_28BE:
028BE  GOSUB SUB_2626
SUB_28C1:
028F0  PUT (CellX! * 16 + 16, CellY! * 16 + 16), PlanetMark, XOR
02913  Zone! = INT((Galaxy%(CINT(SectorIdx!))) / 10000)
02927  AlertLvl! = INT(Zone! * 0.5)
02935  LOCATE 2, 5
02938  PRINT "("; MID$(STR$(SectorX! + 1), 2, 2); ","; MID$(STR$(32 - SectorY!), 2, 2); ") ZN:"; ZoneTag$(CINT(Zone!)); "  ";
0299C  IF AlertLvl! = ShownAlert! THEN GOTO L_2A49
L_29A1:
029A7  ShownAlert! = AlertLvl!
029B2  IF ShownAlert! <> 1 THEN GOTO L_29BD
L_29B7:
029B7  GOSUB SUB_2512
029BA  GOTO L_29C0
L_29BD:
029BD  GOSUB SUB_24F9
L_29C0:
029C6  IF ShownAlert! <> 0 THEN GOTO L_2A49
L_29CB:
029D1  FOR I! = 1 TO 7
L_29D4:
029EB  SOUND 4444, SndDur! * 0.5
029FC  SOUND 678, SndDur!
029FF  GOSUB SUB_252B
02A19  SOUND 4444, SndDur! * 0.5
02A2A  SOUND 678, SndDur!
02A2D  GOSUB SUB_24F9
02A39  NEXT I!
L_2A49:
02A4F  ElapsedHrs! = 10
02A52  GOSUB SUB_87AD
02A55  GOSUB SUB_87DC
02A5E  FuelUse! = 0
02A8B  RadTick! = (RadTick! + 1) * ABS(RadTick! < 2)
02A8E  GOSUB SUB_8973
02A9D  ON CINT(RadTick! + 1) GOSUB SUB_89F8, SUB_8BC6
02AB4  IF RND * 100 < EncChance! THEN GOTO L_9046
L_2AB9:
02AC2  IF Idx! = 1 THEN GOTO L_1B5D
L_2AC7:
02AC7  GOTO L_1BED
SUB_2ACA:
02ADC  PUT (32, 0), HdrSectorScan, PSET
02ADF  GOSUB SUB_22FE
02AE8  MissionCode1! = 0
02AF0  MissionCode2! = 0
02B15  IF NOT ((SectorY! = MissionY1!) AND (SectorX! = MissionX1!)) THEN GOTO L_2B22
L_2B1A:
02B1F  MissionCode1! = MissionCodeA!
L_2B22:
02B28  MissionEnc! = 0
02B4D  IF NOT ((SectorY! = MissionY2!) AND (SectorX! = MissionX2!)) THEN GOTO L_2B72
L_2B52:
02B58  MissionCode2! = MissionCodeB!
02B5B  GOSUB SUB_90D1
02B64  IF MissionNo! <> 0 THEN GOTO L_2B72
L_2B69:
02B6F  MissionEnc! = MissionEncB!
L_2B72:
02B97  SectorCode! = Galaxy%(CINT(SectorIdx!)) - (Zone! * 10000)
02BA2  IF SectorCode! < 444 THEN GOTO L_2DE3
L_2BA7:
02BB0  IF SectorCode! < 2099 THEN GOTO L_2D41
L_2BB5:
02BBB  SectorX! = 14
02BC6  SectorY! = 8
02BD4  IF SectorCode! <= 2101 THEN GOTO L_2C0A
L_2BD9:
02BE0  SectorX! = 29
02BE8  SectorY! = 13
02BF5  IF SectorCode! <= 2102 THEN GOTO L_2C0A
L_2BFA:
02BFF  SectorX! = 22
02C07  SectorY! = 11
L_2C0A:
02C1C  PUT (32, 0), HdrVisual, PSET
02C2D  PUT (28, 28), Starfield, XOR
02C30  GOSUB SUB_19D1
02C33  GOSUB SUB_2299
02C3F  LOCATE 22, 3
02C42  PRINT "You are pulled into a black hole!"
02C51  PLAY "mb"
02C5A  FOR I! = 1 TO 50
L_2C5E:
02C6C  SOUND 44, SndDur!
02CAD  LINE (28, RND * 104 + 28)-(131, RND * 104 + 28), 0
02CBD  SOUND 77, SndDur!
02CFC  LINE (RND * 104 + 28, 28)-(RND * 104 + 28, 131), 0
02D08  NEXT I!
L_2D1B:
02D1B  GOSUB SUB_22DD
02D2C  SOUND 99, 0
02D32  PLAY "mf"
02D35  GOSUB SUB_19D1
02D38  GOSUB SUB_19D1
02D3B  GOSUB SUB_19D1
02D3E  GOTO L_0FBE
L_2D41:
02D47  FOR CurX! = 0 TO 15
L_2D4A:
02D50  FOR CurY! = 0 TO 1
L_2D54:
02D79  PixColor!(CINT(CurX!), CINT(CurY!)) = 0
02D84  NEXT CurY!
02D9D  NEXT CurX!
02DB6  IF SectorCode! <= 777 THEN GOTO L_2DE2
L_2DBB:
02DC1  PixColor!(7, 0) = 4
02DCA  PixCol!(7, 0) = 7
02DDF  PUT (72, 72), BlackHoleMark, XOR
L_2DE2:
02DE2  RETURN
L_2DE3:
02E02  Ix! = CellY! * 256 + CellX! * 2 + 2
02E0B  ObjCount! = 0
02E14  FOR CurX! = 0 TO 15
L_2E18:
02E1E  FOR CurY! = 0 TO 1
L_2E22:
02E36  Heading! = PicBuf(CINT(Ix!))
02E3E  IF Heading! <> 0 THEN GOTO L_2E6C
L_2E43:
02E66  PixColor!(CINT(CurX!), CINT(CurY!)) = 0
02E69  GOTO L_305B
L_2E6C:
02E77  ObjCount! = ObjCount! + 1
02EA0  PixObj!(CINT(CurX!), CINT(CurY!)) = ObjCount!
02EA9  IF Heading! >= 0 THEN GOTO L_2EB9
L_2EAE:
02EB6  Heading! = Heading! + 65536
L_2EB9:
02EC2  LogVal! = LOG(Heading!)
02EDA  K! = INT(LogVal! / Log4!)
02EEC  LogFrac! = LogVal! - (K! * Log4!)
02F40  PixColor!(CINT(CurX!), CINT(CurY!)) = 1 - (LogFrac! > 0.5) - (LogFrac! > 1)
02F72  PixCol!(CINT(CurX!), CINT(CurY!)) = (K! < 4) * 8 - K! + 11
02F89  BlipY! = CurX! * 8 + 16
02FCD  BlipX! = CurY! * 64 + (PixCol!(CINT(CurX!), CINT(CurY!))) * 8 + 16
02FDE  IF PixColor!(CINT(CurX!), CINT(CurY!)) <> 1 THEN GOTO L_2FFB
L_2FE3:
02FF5  PUT (BlipX!, BlipY!), Blip1, XOR
02FF8  GOTO L_305B
L_2FFB:
03025  IF PixColor!(CINT(CurX!), CINT(CurY!)) <> 2 THEN GOTO L_3044
L_302A:
0303E  PUT (BlipX!, BlipY!), Blip2, XOR
03041  GOTO L_305B
L_3044:
03058  PUT (BlipX!, BlipY!), Blip3, XOR
L_305B:
03068  Ix! = Ix! + 1
03073  NEXT CurY!
L_3086:
03091  Ix! = Ix! + 14
0309D  NEXT CurX!
L_30B0:
030B0  RETURN
SUB_30B1:
030B1  GOSUB SUB_2299
030BD  LOCATE 20, 3
030C0  PRINT "A-Up Scan"
030D6  LOCATE 21, 3
030D9  PRINT "D-Down Scan"
030F7  PUT (156, 156), Cursor, XOR
03103  LOCATE 24, 3
03106  PRINT "SELECT OPTION";
03112  RETURN
L_3113:
03113  GOSUB SUB_212C
0311F  IF Cmd! = 40 THEN GOTO L_33A6
L_3124:
0312A  DX! = 0
03130  DY! = 0
03139  ON CINT(Cmd!) GOTO L_3113, L_3163, L_3113, L_3113, L_317A, L_3113, L_3191, L_3113, L_3113, L_31AB, L_3113, L_315D, L_3113, L_3113, L_33F1
0315B  GOTO L_3113
L_315D:
0315D  GOSUB SUB_2626
03160  GOTO L_28C1
L_3163:
0316C  IF CursorRow! < 1 THEN GOTO L_3113
03174  DY! = -1
03177  GOTO L_31C2
L_317A:
03183  IF CursorCol! < 1 THEN GOTO L_3113
0318B  DX! = -1
0318E  GOTO L_31C2
L_3191:
0319A  IF CursorCol! > 14 THEN GOTO L_3113
L_319F:
031A5  DX! = 1
031A8  GOTO L_31C2
L_31AB:
031B4  IF CursorRow! > 14 THEN GOTO L_3113
L_31B9:
031BF  DY! = 1
L_31C2:
031F8  PUT (CursorCol! * 7.46 + 16, CursorRow! * 7.46 + 16), PlanetMark, XOR
03206  CursorCol! = CursorCol! + DX!
03214  CursorRow! = CursorRow! + DY!
03217  GOTO L_3220
L_321A:
0321A  GOSUB SUB_2ACA
0321D  GOSUB SUB_30B1
L_3220:
03256  PUT (CursorCol! * 7.46 + 16, CursorRow! * 7.46 + 16), PlanetMark, XOR
0326B  FuelUse! = INT(RND * 1.1)
0326E  GOSUB SUB_87AD
03277  ElapsedHrs! = 1
032A3  RadTick2! = (RadTick2! + 1) * ABS(RadTick2! < 6)
032A6  GOSUB SUB_8973
032B5  ON CINT(RadTick2! + 1) GOSUB SUB_89F8, SUB_8BC6
032D7  IF RND * 100 < EncChance! + MissionEnc! THEN GOTO L_9046
L_32DC:
032DC  GOTO L_3113
L_32DF:
032F1  PUT (32, 0), HdrGalaxyScan, PSET
03302  PUT (16, 16), GalMap, PSET
03305  GOSUB SUB_2299
03311  LOCATE 20, 3
03314  PRINT "D-Down Scan"
L_3320:
03336  CurX! = SectorX! * 3 + 37
03349  CurY! = SectorY! * 3 + 37
03358  PSET (CurX!, CurY!)
0335B  GOSUB SUB_1657
0335E  GOSUB SUB_1657
03371  PRESET (CurX!, CurY!)
03374  GOSUB SUB_1657
03377  GOSUB SUB_1657
03380  K$ = INKEY$
033A1  IF (K$ <> "d") AND (K$ <> "D") THEN GOTO L_3320
L_33A6:
033A6  GOSUB SUB_2626
033A9  GOSUB SUB_28C1
033AC  GOTO L_1B5D
SUB_33AF:
033CD  LINE (28, 0)-(123, 7), 2, BF
033ED  LINE (28, 2)-(123, 5), 1, BF
033F0  RETURN
L_33F1:
03405  CurY! = INT(CursorCol! * 0.125)
03432  StarClass! = PixColor!(CINT(CursorRow!), CINT(CurY!))
03460  IF NOT ((PixCol!(CINT(CursorRow!), CINT(CurY!)) <> CursorCol! - (CurY! * 8)) OR (StarClass! = 0)) THEN GOTO L_3495
L_3465:
03465  GOSUB SUB_2299
03471  LOCATE 21, 15
03474  PRINT "Empty Area"
03489  LOCATE 24, 13
0348C  GOSUB SUB_19F8
0348F  GOSUB SUB_30B1
03492  GOTO L_3113
L_3495:
0349E  IF StarClass! < 4 THEN GOTO L_388B
L_34A3:
034B5  PUT (32, 0), HdrVisual, PSET
034B8  GOSUB SUB_22FE
034C4  IF SectorCode! > 1777 THEN GOTO L_37A8
L_34C9:
034D5  PortNo! = SectorCode! - 1000
03512  BLOAD Drive$ + "SPPIC" + STR$(-PortNo! - 1) + ".BAS", &H9008
0351E  LOCATE 4, 7
03521  PRINT "STARPORT"
03537  LOCATE 5, 7
0353A  PRINT PortName$(CINT(PortNo!))
03556  LoadedMap! = 0
0356C  PUT (28, 40), Starfield, XOR
0357E  PUT (40, 56), PicBuf, PSET
L_3581:
03581  GOSUB SUB_2299
0358D  LOCATE 20, 3
03590  PRINT "A-Up Scan"
035A6  LOCATE 21, 3
035A9  PRINT "B-Dock With Starport"
035BD  LOCATE 22, 3
035C0  PRINT "C-Refuel Only"
035D2  CmdMin! = 1
035DB  CmdMax! = 3
L_35DE:
035DE  GOSUB SUB_168A
035E7  IF Cmd! < 0 THEN GOTO L_35DE
035EF  ON CINT(Cmd!) GOTO L_321A, L_35F9, L_361A
L_35F9:
035FF  EntryMode! = 0
03608  ChainArg! = PortNo!
0360B  GOSUB SUB_81E6
03617  CHAIN Drive$ + "STARPORT.STR"
L_361A:
03620  FuelAdd! = 999
03623  GOSUB SUB_3629
03626  GOTO L_3581
SUB_3629:
03645  BarX0! = (Fuel! / MaxFuel!) * 228 + 42
0365A  Fuel! = INT(Fuel! + FuelAdd!)
03664  IF Fuel! <= MaxFuel! THEN GOTO L_366E
L_3669:
0366B  Fuel! = MaxFuel!
L_366E:
0366E  GOSUB SUB_2299
0367A  LOCATE 20, 8
0367D  PRINT "Fueling ISS "; ShipName$
036A7  Tmp2! = (Fuel! / MaxFuel!) * 228 + 42
036C8  LINE (30, 168)-(283, 188), , BF
036E7  LINE (42, 175)-(270, 181), 0, BF
03707  LINE (42, 175)-(BarX0!, 181), 2, BF
0370A  GOSUB SUB_1657
03725  BarX1! = INT(Tmp2! * 0.5) * 2
0373A  FOR I! = INT(BarX0! * 0.5) * 2 TO BarX1!
L_373E:
0375D  LINE (BarX0!, 175)-(I!, 181), 2, BF
03782  SOUND CINT(I! * 10), SndDur! * 0.2
0378E  NEXT I! STEP 2
0379E  GOSUB SUB_1A5F
037A1  GOSUB SUB_19D1
037A4  GOSUB SUB_19D1
037A7  RETURN
L_37A8:
037B4  Tmp1! = SectorCode! - 2000
037D1  BLOAD Drive$ + "SPSTGRPH" + ".BAS", &H9008
037DA  LoadedMap! = 0
037EF  PUT (28, 28), Starfield, XOR
03801  PUT (40, 48), PicBuf, PSET
03804  GOSUB SUB_2299
03810  LOCATE 20, 3
03813  PRINT "A-Up Scan"
03829  LOCATE 21, 3
0382C  PRINT "B-Dock With Space Station"
0383E  CmdMin! = 1
03847  CmdMax! = 2
L_384A:
0384A  GOSUB SUB_168A
03853  IF Cmd! < 0 THEN GOTO L_384A
0385B  ON CINT(Cmd!) GOTO L_321A
03867  EntryMode! = 3
03870  StationNo! = Tmp1!
03879  Gravity10! = 1
0387C  GOSUB SUB_81E6
03888  CHAIN Drive$ + "INSIDE.STR"
L_388B:
0389D  PUT (32, 0), HdrSystemScan, PSET
038E8  Count! = RND(-(SectorX! * 100000 + SectorY! * 1000 + CursorCol! * 1000000 + CursorRow! * 10000))
0390E  NumBodies! = INT(RND * (StarClass! + 7) + 1)
03917  FOR I! = 0 TO 9
L_391A:
03931  OrbitClass!(CINT(I!)) = 0
0393C  NEXT I!
03958  NumBig! = NumBodies! * 0.7
03961  FOR J! = 1 TO NumBig!
L_3964:
03997  OrbitClass!(CINT(INT((1 - (RND * RND)) * 10))) = 1
039A2  NEXT J!
039BE  NumMid! = NumBodies! * 0.6
039C7  FOR I! = 1 TO NumMid!
L_39CA:
039E9  OrbitClass!(CINT(INT(RND * 10))) = 2
039F5  NEXT I!
03A11  NumSmall! = NumBodies! * 0.25
03A1A  FOR I! = 0 TO NumSmall!
L_3A1E:
03A48  OrbitClass!(CINT(INT((RND * RND) * 10))) = 3
03A54  NEXT I!
03A6A  ObjCount! = 0
03A70  FOR I! = 0 TO 9
L_3A74:
03A89  IF OrbitClass!(CINT(I!)) <= 0 THEN GOTO L_3AAA
L_3A8E:
03A99  ObjCount! = ObjCount! + 1
03AA4  PlanetNo!(CINT(I!)) = ObjCount!
03AA7  GOTO L_3AC3
L_3AAA:
03ABD  PlanetNo!(CINT(I!)) = 0
03AC0  GOTO L_3D32
L_3AC3:
03AD6  ON CINT(OrbitClass!(CINT(I!))) GOTO L_3B4E, L_3B9F
03B03  PlGravity!(CINT(I!)) = RND * 0.5 + 0.01
03B1E  PlDensity!(CINT(I!)) = RND * 0.55 + 0.55
03B48  PlSurface!(CINT(I!)) = (RND < PlGravity!(CINT(I!)) - 0.2) + 4
03B4B  GOTO L_3BF8
L_3B4E:
03B71  PlGravity!(CINT(I!)) = RND * 2 + 1
03B8D  PlDensity!(CINT(I!)) = RND * 0.192 + 0.135
03B99  PlSurface!(CINT(I!)) = 0
03B9C  GOTO L_3BF8
L_3B9F:
03BBE  PlGravity!(CINT(I!)) = RND + 0.2
03BD7  PlDensity!(CINT(I!)) = RND * 0.55 + 0.55
03BF5  PlSurface!(CINT(I!)) = INT(RND * 4 + 1)
L_3BF8:
03C0D  PlLife!(CINT(I!)) = 0
03C3A  IF (RND * (PlSurface!(CINT(I!))) > 1.9) OR (PlSurface!(CINT(I!)) < 2) THEN GOTO L_3D32
L_3C3F:
03C72  IF NOT ((PlSurface!(CINT(I!)) < 4) AND (RND < 0.6)) THEN GOTO L_3C9C
L_3C77:
03C96  PlLife!(CINT(I!)) = INT(RND * 20 + 10)
03C99  GOTO L_3D0C
L_3C9C:
03CB9  PlLife!(CINT(I!)) = 4 - Zone!
03CC1  IF Zone! <> 0 THEN GOTO L_3CCF
L_3CC6:
03CC9  PlLife!(CINT(I!)) = 2
03CCC  GOTO L_3D0C
L_3CCF:
03CF1  IF NOT ((RND < 0.5) AND (Zone! = 3)) THEN GOTO L_3D0C
L_3CF6:
03D09  PlLife!(CINT(I!)) = 4
L_3D0C:
03D2D  IF PlLife!(CINT(I!)) + PlSurface!(CINT(I!)) = 6 THEN GOTO L_3BF8
L_3D32:
03D3B  NEXT I!
L_3D4E:
03D68  MapCol! = (RND < 0.5) * 2 + 1
03D84  MapRow! = (RND < 0.5) * 2 + 1
03D8D  RANDOMIZE TIMER
03D90  GOSUB SUB_22FE
03D9C  IF StarClass! <> 1 THEN GOTO L_3DBA
L_3DA1:
03DB4  PUT (64, 72), Star1, XOR
03DB7  GOTO L_3DF7
L_3DBA:
03DC3  IF StarClass! <> 2 THEN GOTO L_3DE1
L_3DC8:
03DDB  PUT (64, 72), Star2, XOR
03DDE  GOTO L_3DF7
L_3DE1:
03DF4  PUT (64, 72), Star3, XOR
L_3DF7:
03DFD  LOCATE 3, 3
03E35  StarNo! = PixObj!(CINT(CursorRow!), CINT(INT(CursorCol! * 0.125)))
03E38  PRINT "Star"; -StarNo!
03E55  FOR I! = 0 TO 9
L_3E58:
03E6B  IF OrbitClass!(CINT(I!)) = 0 THEN GOTO L_3EC0
L_3E70:
03E95  CurX! = ((OrbitDX!(CINT(I!))) * MapCol!) * 8 + 67
03EB1  CurY! = ((OrbitDY!(CINT(I!))) * MapRow!) * 8 + 75
03EBA  OrbitNo! = I!
03EBD  GOSUB SUB_9138
L_3EC0:
03EC9  NEXT I!
L_3EDC:
03EDC  GOSUB SUB_30B1
L_3EDF:
03F11  PUT (SysCurX! * 8 + 20, SysCurY! * 8 + 28), PlanetMark, XOR
03F26  FuelUse! = INT(RND * 1.1)
03F29  GOSUB SUB_87AD
03F32  ElapsedHrs! = 1
03F5E  RadTick2! = (RadTick2! + 1) * ABS(RadTick2! < 6)
03F61  GOSUB SUB_8973
03F70  ON CINT(RadTick2! + 1) GOSUB SUB_89F8, SUB_8BC6
03F92  IF RND * 100 < EncChance! + MissionEnc! THEN GOTO L_9046
L_3F97:
03F97  GOSUB SUB_212C
03FA3  IF Cmd! = 40 THEN GOTO L_33A6
L_3FA8:
03FAE  DX! = 0
03FB4  DY! = 0
03FBD  ON CINT(Cmd!) GOTO L_3F97, L_3FE1, L_3F97, L_3F97, L_3FF8, L_3F97, L_400F, L_3F97, L_3F97, L_4029, L_3F97, L_321A, L_3F97, L_3F97, L_5663
03FDF  GOTO L_3F97
L_3FE1:
03FEA  IF SysCurY! < 1 THEN GOTO L_3F97
03FF2  DY! = -1
03FF5  GOTO L_4040
L_3FF8:
04001  IF SysCurX! < 1 THEN GOTO L_3F97
04009  DX! = -1
0400C  GOTO L_4040
L_400F:
04018  IF SysCurX! > 11 THEN GOTO L_3F97
L_401D:
04023  DX! = 1
04026  GOTO L_4040
L_4029:
04032  IF SysCurY! > 11 THEN GOTO L_3F97
L_4037:
0403D  DY! = 1
L_4040:
04072  PUT (SysCurX! * 8 + 20, SysCurY! * 8 + 28), PlanetMark, XOR
04080  SysCurX! = SysCurX! + DX!
0408E  SysCurY! = SysCurY! + DY!
04091  GOTO L_3EDF
L_4094:
0409A  PickAny! = 1
040A3  Prompt$ = "Who will change positions?"
040A6  GOSUB SUB_1828
040AF  IF Member! = 0 THEN GOTO L_428E
L_40B4:
040BA  Count! = Member!
040C3  Prompt$ = "Change with who?"
040C6  GOSUB SUB_1828
040CF  IF Member! = 0 THEN GOTO L_428E
L_40D4:
0410F  RecDelta! = FNIdx(Count!, 0) - FNIdx(Member!, 0)
0412C  RecEnd! = FNIdx(Count!, 99)
04144  FOR ShipY! = FNIdx(Count!, 0) TO RecEnd!
L_4148:
04177  SWAP G!(CINT(ShipY! - RecDelta!)), G!(CINT(ShipY!))
04182  NEXT ShipY!
041B8  SWAP CrewName$(CINT(Member!)), CrewName$(CINT(Count!))
041C7  SwapSum! = Count! + Member!
041D0  FOR I! = 809 TO 1097
L_41D4:
041D4  GOSUB SUB_4242
041E0  NEXT I! STEP 12
041F6  FOR I! = 1102 TO 1399
L_41FA:
041FA  GOSUB SUB_4242
04206  NEXT I! STEP 3
0421C  FOR I! = 2302 TO 2599
L_4220:
04220  GOSUB SUB_4242
0422C  NEXT I! STEP 3
0423C  GOSUB SUB_1A7B
0423F  GOTO L_428E
SUB_4242:
0426E  IF NOT ((G!(CINT(I!)) <> Member!) AND (G!(CINT(I!)) <> Count!)) THEN GOTO L_4274
L_4273:
04273  RETURN
L_4274:
0428A  G!(CINT(I!)) = SwapSum! - (G!(CINT(I!)))
0428D  RETURN   'with FAC = SwapSum! - (G!(CINT(I!)))
L_428E:
04294  PickAny! = 0
04297  GOTO L_1B5D
L_429A:
042A0  RepairPct! = 0
042A9  Member! = 1
042AF  FOR I! = 1 TO 8
L_42B2:
042FF  IF NOT ((FNCrew(I!, 26) >= RepairPct!) AND (FNCrew(I!, 31) > 0)) THEN GOTO L_432B
L_4304:
0430C  Member! = I!
04328  RepairPct! = FNCrew(I!, 26)
L_432B:
04334  NEXT I!
L_4347:
0435A  RepairPct! = RepairPct! * 10 + 35
L_435D:
0435D  GOSUB SUB_2299
04369  LOCATE 20, 6
0436C  PRINT CrewName$(CINT(Member!)); " Repairing"
04392  LOCATE 21, 3
04395  PRINT "A-Repair Ships Equipment"
043AB  LOCATE 22, 3
043AE  PRINT "B-Repair All Personal Equipment"
L_43BA:
043C0  CmdMin! = 1
043C9  CmdMax! = 2
043CC  GOSUB SUB_168A
043D8  IF Cmd! = -32 THEN GOTO L_43BA
043E3  IF Cmd! <> -51 THEN GOTO L_43F4
L_43E8:
043E8  GOSUB SUB_1CE3
043EB  GOSUB SUB_1B37
043EE  GOSUB SUB_16F6
043F1  GOTO L_33A6
L_43F4:
043FD  IF Cmd! = 2 THEN GOTO L_46D8
L_4402:
04402  GOSUB SUB_2299
04405  GOSUB SUB_33AF
04408  GOSUB SUB_22DD
L_440B:
04411  ItemType! = 2
04414  GOSUB SUB_247C
04446  RepairPct! = Idx! * 35 + FNCrew(Member!, 26) * 10
0444F  FOR I! = 0 TO 16
L_4452:
04464  LOCATE CINT(I! + 2), 3
04467  GOSUB SUB_44F4
04473  NEXT I!
04489  FOR I! = 17 TO 19
L_448C:
0449E  LOCATE CINT(I! + 3), 3
044A1  GOSUB SUB_44F4
044AD  NEXT I!
044C3  FOR I! = 20 TO 22
L_44C6:
044D2  LOCATE CINT(I!), 21
044D5  GOSUB SUB_44F4
044E1  NEXT I!
044F1  GOTO L_4568
SUB_44F4:
044F4  PRINT CHR$(CINT(I! + 65));
04523  IF INT(G!(CINT(I!))) <> 0 THEN GOTO L_4537
L_4528:
04528  PRINT "----------"
04534  GOTO L_4567
L_4537:
04537  PRINT CondMark$(CINT(INT(G!(CINT(I!))))); EquipName$(CINT(I!))
L_4567:
04567  RETURN
L_4568:
04571  LOCATE 24, 3
04574  PRINT "Repair What?  *-Broken #-Unfixable";
04586  CmdMax! = 23
L_4589:
04589  GOSUB SUB_1C58
04595  IF Cmd! = -32 THEN GOTO L_4589
045A0  IF Cmd! = -51 THEN GOTO L_429A
L_45A5:
045B0  Cmd! = Cmd! - 1
045C9  IF INT(G!(CINT(Cmd!))) <> 2 THEN GOTO L_4589
045D1  ElapsedHrs! = 24
045D4  GOSUB SUB_8CB8
045E9  FuelUse! = INT(RND * 1.5)
045EC  GOSUB SUB_87AD
045F8  LOCATE 24, 3
045FB  PRINT SPC(34);
04616  IF RND * 100 >= RepairPct! THEN GOTO L_46A4
L_461B:
04624  LOCATE 24, 12
04627  PRINT "Sucessful";
04633  GOSUB SUB_19D1
04649  G!(CINT(Cmd!)) = 1
0466B  IF (RND < 0.9) OR (Idx! = 0) THEN GOTO L_440B
L_4670:
04683  G!(CINT(Ix!)) = 0
0468F  LOCATE 24, 12
04692  PRINT "Kit Used Up";
0469E  GOSUB SUB_19D1
046A1  GOTO L_440B
L_46A4:
046AD  LOCATE 24, 12
046B0  PRINT "Failure";
046BC  GOSUB SUB_19D1
046D2  G!(CINT(Cmd!)) = 3
046D5  GOTO L_440B
L_46D8:
046D8  GOSUB SUB_2299
046E1  ItemType! = 2
046EA  Count! = 0
046F0  ShipY! = 0
046F6  ElapsedHrs! = 0
046F9  GOSUB SUB_247C
0472B  RepairPct! = Idx! * 35 + FNCrew(Member!, 26) * 10
04734  FOR I! = 1 TO 8
L_4738:
047D9  IF (FNCrew(I!, 48) + FNCrew(I!, 55) = FNCrew(I!, 49)) OR (FNCrew(I!, 49) = FNCrew(I!, 48)) THEN GOTO L_48C9
L_47DE:
04844  G!(CINT(FNIdx(I!, 55))) = FNCrew(I!, 49) - FNCrew(I!, 48)
04852  ElapsedHrs! = ElapsedHrs! + 12
04862  ShipY! = ShipY! + 1
04874  IF RND * 100 >= RepairPct! THEN GOTO L_48C9
L_4879:
048B8  G!(CINT(FNIdx(I!, 48))) = FNCrew(I!, 49)
048C6  Count! = Count! + 1
L_48C9:
048D2  NEXT I!
L_48E5:
048EB  FOR I! = 800 TO 1088
L_48EE:
04935  IF (G!(CINT(I! + 3)) <> -1) OR (G!(CINT(I!)) < 1) THEN GOTO L_499F
L_493A:
04953  G!(CINT(I! + 3)) = -2
04963  ElapsedHrs! = ElapsedHrs! + 12
04973  ShipY! = ShipY! + 1
04985  IF RND * 100 >= RepairPct! THEN GOTO L_499F
L_498A:
0498F  G!(CINT(I! + 3)) = 0
0499C  Count! = Count! + 1
L_499F:
049A8  NEXT I! STEP 12
L_49BB:
049C1  Heading! = 0
049F5  IF NOT ((RND > 0.9 ^ Count!) AND (Idx! = 1)) THEN GOTO L_4A17
L_49FA:
049FE  Heading! = 1
04A14  G!(CINT(Ix!)) = 0
L_4A17:
04A20  LOCATE 20, 3
04A23  PRINT "Items fixed:"; Count!
04A41  LOCATE 21, 3
04A44  PRINT "Items rendered unfixable:"; ShipY! - Count!
04A66  LOCATE 22, 3
04A69  PRINT "Repair kits used up:"; Heading!
04A7B  GOSUB SUB_8CB8
04A90  FuelUse! = INT(RND * 1.5)
04A93  GOSUB SUB_87AD
04A9F  LOCATE 24, 3
04AA2  GOSUB SUB_19F8
04AA5  GOTO L_435D
L_4AA8:
04AA8  GOSUB SUB_2299
04AB4  LOCATE 20, 3
04AB7  PRINT "A-Squad Health"
04ACD  LOCATE 21, 3
04AD0  PRINT "B-Heal Squad Member"
04AE2  CmdMin! = 1
04AEB  CmdMax! = 2
L_4AEE:
04AEE  GOSUB SUB_168A
04AFA  IF Cmd! = -51 THEN GOTO L_1B5D
L_4AFF:
04B08  IF Cmd! = -32 THEN GOTO L_4AEE
04B13  IF Cmd! = 2 THEN GOTO L_4C6C
L_4B18:
04B18  GOSUB SUB_2299
04B24  LOCATE 20, 7
04B27  PRINT "Squad Hit Points and Status"
04B39  FOR I! = 0 TO 7
L_4B3C:
04B50  Count! = INT(I! * 0.25)
04B81  LOCATE CINT(21 - (Count! * 4) + I!), CINT(Count! * 19 + 3)
04BA7  IF FNCrew(I! + 1, 0) <= 0 THEN GOTO L_4C38
L_4BAC:
04BAC  PRINT SlotTag$(CINT(I! + 1)); ">"; INT(FNCrew(I! + 1, 15)); "/"; INT(FNCrew(I! + 1, 16)); Status$(CINT(FNCrew(I! + 1, 31)));
L_4C38:
04C41  NEXT I!
L_4C54:
04C5A  CmdMin! = 1
04C63  CmdMax! = 0
04C66  GOSUB SUB_1C58
04C69  GOTO L_4AA8
L_4C6C:
04C72  Member! = 1
04C7D  HealPct! = 0
04C85  FOR I! = 1 TO 8
L_4C88:
04CD5  IF NOT ((FNCrew(I!, 20) > HealPct!) AND (FNCrew(I!, 31) > 0)) THEN GOTO L_4D01
L_4CDA:
04CE2  Member! = I!
04CFE  HealPct! = FNCrew(Member!, 20)
L_4D01:
04D0A  NEXT I!
L_4D1D:
04D1D  GOSUB SUB_2299
04D29  LOCATE 20, 7
04D2C  PRINT CrewName$(CINT(Member!)); " Healing"
04D4F  ElapsedHrs! = 0
04D55  AnyHealed! = 0
04D5E  FOR J! = 1 TO 8
L_4D62:
04DC4  IF (FNCrew(J!, 31) = 0) OR (FNCrew(J!, 15) >= FNCrew(J!, 16)) THEN GOTO L_4F92
L_4DC9:
04DCF  AnyHealed! = 1
04DDF  ElapsedHrs! = ElapsedHrs! + 4
04DE7  ItemType! = 1
04DEA  GOSUB SUB_247C
04E33  HealPct! = ((FNCrew(Member!, 20) * (SGN(FNCrew(Member!, 31)))) * Idx!) * 10
04E36  GOSUB SUB_22BB
04E42  LOCATE 22, 3
04E45  PRINT CrewName$(CINT(J!)); " is ";
04E71  IF RND * 100 <= HealPct! THEN GOTO L_4E85
L_4E76:
04E76  PRINT "not healed"
04E82  GOTO L_4F83
L_4E85:
04EA5  Count! = FNCrew(J!, 15) + 4
04EC9  IF FNCrew(J!, 16) > Count! THEN GOTO L_4EFA
L_4ECE:
04EE8  Count! = FNCrew(J!, 16)
04EEB  PRINT "fully healed"
04EF7  GOTO L_4F06
L_4EFA:
04EFA  PRINT "healed 4 points"
L_4F06:
04F2B  G!(CINT(FNIdx(J!, 15))) = Count!
04F50  IF NOT ((RND > 0.8) AND (Idx! = 1)) THEN GOTO L_4F83
L_4F55:
04F5E  LOCATE 23, 3
04F61  PRINT "Medkit used up"
04F80  G!(CINT(Ix!)) = 0
L_4F83:
04F8C  LOCATE 24, 3
04F8F  GOSUB SUB_19F8
L_4F92:
04F9B  NEXT J!
L_4FAE:
04FC0  FuelUse! = INT(RND * 1.35)
04FC3  GOSUB SUB_87AD
04FC6  GOSUB SUB_8CB8
04FCF  IF AnyHealed! <> 0 THEN GOTO L_4FEF
L_4FD4:
04FDD  LOCATE 22, 3
04FE0  PRINT "Squad is fully healed"
04FEC  GOSUB SUB_19D1
L_4FEF:
04FEF  GOTO L_4AA8
L_4FF2:
04FF8  Idx! = 0
05001  FOR I! = 110 TO 159
L_5004:
0501E  IF G!(CINT(I!)) <> 1 THEN GOTO L_5031
L_5023:
0502E  Idx! = I! - 109
L_5031:
0503A  NEXT I!
05053  IF Idx! < 1 THEN GOTO L_51B5
L_5058:
05063  Idx! = Idx! - 1
L_5066:
0507D  OPEN Drive$ + "MISSION" FOR INPUT AS #1
05086  MissionIdx2! = Idx!
0508F  FOR I! = 0 TO MissionIdx2!
L_5092:
05095  INPUT #1, MissionText1$, MissionText2$
050B0  FOR ShipY! = 0 TO 14
L_50B4:
050B7  INPUT #1, Scratch!
050CE  NEXT ShipY!
050E7  NEXT I!
050FA  CLOSE #1
L_50FD:
050FD  GOSUB SUB_2299
05106  FOR I! = 0 TO 2
L_510A:
05120  LOCATE CINT(I! + 20), 3
05123  PRINT MID$(MissionText1$, CINT(I! * 34 + 1), 34)
0514F  NEXT I!
05168  LOCATE 24, 3
0516B  GOSUB SUB_19F8
05179  IF LEN(MissionText1$) <= 102 THEN GOTO L_5193
L_517E:
0518D  MissionText1$ = MID$(MissionText1$, 103, 200)
05190  GOTO L_50FD
L_5193:
0519C  IF MissionText2$ = "" THEN GOTO L_51F8
L_51A1:
051A7  MissionText1$ = MissionText2$
051AF  MissionText2$ = ""
051B2  GOTO L_50FD
L_51B5:
051B5  GOSUB SUB_2299
051C1  LOCATE 21, 3
051C4  PRINT "You have completed your mission"
051D0  GOSUB SUB_19D1
051D3  GOSUB SUB_19D1
051D6  GOTO L_51F8
051F2  G!(CINT(Idx! + 110)) = 1
051F5  GOTO L_5066
L_51F8:
051F8  GOSUB SUB_2299
05204  IF ComputerCond! = 1 THEN GOTO L_5224
L_5209:
05212  LOCATE 21, 14
05215  PRINT "Computer Broken"
05221  GOTO L_3320
L_5224:
0522F  LOCATE 20, 3
05232  PRINT "A-Total Kill List"
05248  LOCATE 21, 3
0524B  PRINT "B-Mission Kill List"
05261  LOCATE 22, 3
05264  PRINT "C-Kill List Since Starport"
05278  LOCATE 20, 27
0527B  PRINT "D-Mission"
05290  LOCATE 21, 27
05293  PRINT "E-Tow List"
L_529F:
052A5  CmdMin! = 1
052AE  CmdMax! = 5
052B1  GOSUB SUB_168A
052BD  IF Cmd! = -51 THEN GOTO L_33A6
L_52C2:
052CB  IF Cmd! = -32 THEN GOTO L_529F
052CD  GOSUB SUB_2299
052D6  ON CINT(Cmd!) GOTO L_52E4, L_5341, L_534D, L_4FF2, L_5546
L_52E4:
052EA  Tmp1! = KillStartAll!
052ED  GOSUB SUB_33AF
052F0  GOSUB SUB_22DD
052FC  LOCATE 7, 3
052FF  PRINT "Kills:"; Kills!
0531B  LOCATE 11, 3
0531E  PRINT "Tonnage:"; Tonnage!
05338  LOCATE 18, 3
0533B  GOSUB SUB_19F8
0533E  GOTO L_5356
L_5341:
05347  Tmp1! = KillStartMission!
0534A  GOTO L_5356
L_534D:
05353  Tmp1! = KillStartPort!
L_5356:
0535C  Tmp2! = KillPtr!
05365  Idx! = 0
05368  GOSUB SUB_33AF
0536B  GOSUB SUB_22DD
05377  LOCATE 2, 6
0537A  PRINT "KILL LIST"
0538C  IF Tmp1! <> 0 THEN GOTO L_539D
L_5391:
05397  Idx! = 1
0539A  GOTO L_5458
L_539D:
053B0  Tmp1! = Tmp2! - Tmp1! + 1
053B8  IF Tmp1! >= 0 THEN GOTO L_53C8
L_53BD:
053C5  Tmp1! = Tmp1! + 50
L_53C8:
053D1  IF Tmp2! < Tmp1! THEN GOTO L_5405
L_53D6:
053DB  KillEnd1! = Tmp2!
053E3  FOR I! = Tmp1! TO KillEnd1!
L_53E6:
053E6  GOSUB SUB_548D
053F2  NEXT I!
05402  GOTO L_5458
L_5405:
0540B  FOR I! = Tmp1! TO 49
L_540E:
0540E  GOSUB SUB_548D
0541A  NEXT I!
05430  KillEnd2! = Tmp2!
05439  FOR I! = 0 TO KillEnd2!
L_543C:
0543C  GOSUB SUB_548D
05448  NEXT I!
L_5458:
0545E  IF Idx! <= 0 THEN GOTO L_5472
L_5463:
0546C  LOCATE 18, 3
0546F  GOSUB SUB_19F8
L_5472:
0547B  LOCATE 18, 3
0547E  PRINT SPC(15);
0548A  GOTO L_51F8
SUB_548D:
05498  Idx! = Idx! + 1
054AE  LOCATE CINT(Idx! + 4), 3
054B1  PRINT LEFT$(ShipType$(CINT(G!(CINT(I! + 210)))), 10)
054EF  LOCATE CINT(Idx! + 4), 13
054F2  PRINT ABS(G!(CINT(I! + 260))); "T"
05525  IF Idx! <> 12 THEN GOTO L_5545
L_552A:
05533  LOCATE 18, 3
05536  GOSUB SUB_19F8
05539  GOSUB SUB_22FE
05542  Idx! = 0
L_5545:
05545  RETURN
L_5546:
0554C  Idx! = 1
0554F  GOSUB SUB_33AF
05552  GOSUB SUB_22DD
0555E  LOCATE 2, 7
05561  PRINT "TOW LIST"
05576  LOCATE 4, 3
05579  PRINT "# Ship      Tons"
0558B  FOR I! = 0 TO 9
L_558E:
055A6  LOCATE CINT(I! + 6), 3
055A9  PRINT CHR$(CINT(I! + 48)); " ";
055E0  Tmp3! = G!(CINT(I! + 330))
055E8  IF Tmp3! = 0 THEN GOTO L_5644
L_55ED:
055ED  PRINT LEFT$(ShipType$(CINT(G!(CINT(I! + 320)))), 10);
05624  LOCATE CINT(I! + 6), 16
05627  PRINT MID$(STR$(ABS(Tmp3!)), 2, 3)
L_5644:
0564D  NEXT I!
L_5660:
05660  GOTO L_51F8
L_5663:
05671  PickX! = SysCurX! - 6
0567F  PickY! = SysCurY! - 6
05688  Idx! = -1
05691  FOR I! = 0 TO 9
L_5694:
056EA  IF NOT ((OrbitClass!(CINT(I!)) > 0) AND (((OrbitDY!(CINT(I!))) * MapRow! = PickY!) AND ((OrbitDX!(CINT(I!))) * MapCol! = PickX!))) THEN GOTO L_56F7
L_56EF:
056F4  Idx! = I!
L_56F7:
05700  NEXT I!
05716  IF Idx! >= 0 THEN GOTO L_574B
L_571B:
0571B  GOSUB SUB_2299
05727  LOCATE 21, 16
0572A  PRINT "Empty Area"
0573F  LOCATE 24, 14
05742  GOSUB SUB_19F8
05745  GOSUB SUB_30B1
05748  GOTO L_3F97
L_574B:
0575D  PUT (32, 0), HdrVisual, PSET
05768  LOCATE 3, 11
0576B  PRINT "Planet"; LEFT$(STR$(-(PlanetNo!(CINT(Idx!)))), 2);
057B2  LINE (16, 24)-(143, 143), 0, BF
057BE  LOCATE 5, 3
057C1  PRINT "ATMOSPHERE:"
057D6  LOCATE 6, 4
057F1  IF OrbitClass!(CINT(Idx!)) <> 1 THEN GOTO L_5821
L_57F6:
057F6  PRINT "Hyd, Hel";
05810  IF PlGravity!(CINT(Idx!)) >= 1.2 THEN GOTO L_5821
L_5815:
05815  PRINT ", Meth"
L_5821:
05839  IF OrbitClass!(CINT(Idx!)) <> 2 THEN GOTO L_5869
L_583E:
0583E  PRINT "Nit, Oxy";
05858  IF PlGravity!(CINT(Idx!)) <= 0.7 THEN GOTO L_5869
L_585D:
0585D  PRINT ", C Di";
L_5869:
05881  IF OrbitClass!(CINT(Idx!)) <> 3 THEN GOTO L_58E7
L_5886:
05886  PRINT "C Di, ";
0589D  IF PlSurface!(CINT(Idx!)) <> 3 THEN GOTO L_58B1
L_58A2:
058A2  PRINT "Oxy"
058AE  GOTO L_58E7
L_58B1:
058C7  IF PlGravity!(CINT(Idx!)) <= 0.3 THEN GOTO L_58DB
L_58CC:
058CC  PRINT "Arg"
058D8  GOTO L_58E7
L_58DB:
058DB  PRINT "Nit"
L_58E7:
058F0  LOCATE 7, 4
0591F  IF NOT ((PlSurface!(CINT(Idx!)) = 3) OR (PlSurface!(CINT(Idx!)) = 2)) THEN GOTO L_593C
L_5924:
05924  PRINT "Breathable"
05936  BreathFlag! = 1
05939  GOTO L_5951
L_593C:
0593C  PRINT "Unbreathable"
0594E  BreathFlag! = 0
L_5951:
0595A  LOCATE 8, 3
0597F  PlDiameter! = (PlGravity!(CINT(Idx!))) / (PlDensity!(CINT(Idx!)))
05982  PRINT "MASS:"; LEFT$(STR$(FNRound2((PlDiameter! ^ 3) * (PlDensity!(CINT(Idx!))))), 7)
059C1  LOCATE 9, 3
059C4  PRINT "GRAVITY:"; LEFT$(STR$(FNRound2(PlGravity!(CINT(Idx!)))), 5)
059F4  LOCATE 10, 3
059F7  PRINT "DIAMETER:"; LEFT$(STR$(FNRound2(PlDiameter!)), 6)
05A29  LOCATE 11, 3
05A2C  PRINT "DENSITY:"; LEFT$(STR$(FNRound2(PlDensity!(CINT(Idx!)))), 5)
05A83  PlTech! = INT((PlLife!(CINT(Idx!))) / 10)
05A97  PlForm! = PlLife!(CINT(Idx!)) - (PlTech! * 10)
05AB2  PlTech! = PlTech! - (PlLife!(CINT(Idx!)) > 0)
05AE7  PlForm! = PlForm! - (PlTech! > 1) + (PlTech! < 2)
05AF3  LOCATE 12, 3
05AF6  PRINT "LIFE: "; TechLevel$(CINT(PlTech!))
05B1C  IF PlTech! <= 0 THEN GOTO L_5B44
L_5B21:
05B2A  LOCATE 13, 9
05B2D  PRINT LifeForm$(CINT(PlForm!))
L_5B44:
05B4D  LOCATE 15, 9
05B50  PRINT "SURFACE:"
05B65  LOCATE 16, 10
05B68  PRINT RIGHT$("     " + Surface$(CINT(PlSurface!(CINT(Idx!)))), 8)
05BB6  LINE (16, 97)-(61, 98), , BF
05BD5  LINE (61, 97)-(62, 143), , BF
05BF1  Gravity10! = (PlGravity!(CINT(Idx!))) * 10
05BFA  CurX! = 28
05C03  CurY! = 111
05C0C  OrbitNo! = Idx!
05C0F  GOSUB SUB_9138
05C38  PlanetKey! = StarNo! * 10 + PlanetNo!(CINT(Idx!))
05C43  PlanetCode1! = 0
05C4E  IF MissionKey1! <> PlanetKey! THEN GOTO L_5C6C
L_5C53:
05C58  PlanetCode1! = MissionCode1!
05C64  IF MissionType! <> 5 THEN GOTO L_5C6C
L_5C69:
05C69  GOSUB SUB_8CC2
L_5C6C:
05C72  PlanetCode2! = 0
05C80  IF MissionKey2! <> PlanetKey! THEN GOTO L_5C9E
L_5C85:
05C8A  PlanetCode2! = MissionCode2!
05C96  IF MissionType! <> 6 THEN GOTO L_5C9E
L_5C9B:
05C9B  GOSUB SUB_8CC2
L_5C9E:
05C9E  GOSUB SUB_90D1
05CA7  IF MissionNo! > 0 THEN GOTO L_5D66
L_5CAC:
05CC8  IF NOT ((PlanetCode1! > 0) AND (PlanetCode1! < 50)) THEN GOTO L_5CD6
L_5CCD:
05CD0  MsgNo! = PlanetCode1!
05CD3  GOSUB SUB_65A9
L_5CD6:
05CF2  IF NOT ((PlanetCode2! > 0) AND (PlanetCode2! < 50)) THEN GOTO L_5D00
L_5CF7:
05CFA  MsgNo! = PlanetCode2!
05CFD  GOSUB SUB_65A9
L_5D00:
05D1F  IF NOT ((PlanetCode1! < 150) AND (PlanetCode1! > 49)) THEN GOTO L_5D33
L_5D24:
05D2D  EnemyType! = PlanetCode1! - 50
05D30  GOTO L_8FA0
L_5D33:
05D52  IF NOT ((PlanetCode2! < 150) AND (PlanetCode2! > 49)) THEN GOTO L_5D66
L_5D57:
05D60  EnemyType! = PlanetCode2! - 50
05D63  GOTO L_8FA0
L_5D66:
05D66  GOSUB SUB_2299
05D74  LOCATE 20, 3
05D77  PRINT "A-Up Scan"
05D8D  LOCATE 21, 3
05D90  PRINT "B-Espionage Mission"
05DA4  LOCATE 22, 3
05DA7  PRINT "C-Scientific Investigation"
05DBB  LOCATE 23, 3
05DBE  PRINT "D-Cargo Pickup/Delivery"
05DD2  LOCATE 20, 18
05DD5  PRINT "E-Visit Unique Area"
05DE7  CmdMin! = 1
05DF0  CmdMax! = 5
L_5DF3:
05DF3  GOSUB SUB_168A
05DFC  IF Cmd! < 0 THEN GOTO L_5DF3
05E04  ON CINT(Cmd!) GOTO L_33F1, L_5FB4, L_5E12, L_61FF, L_67CE
L_5E12:
05E12  GOSUB SUB_2299
05E15  GOSUB SUB_6152
05E2A  SuccessPct! = BestSkill! * 10 + 25
05E2D  GOSUB SUB_8D15
05E36  IF Idx! = 0 THEN GOTO L_5D66
L_5E3B:
05E4D  FuelUse! = INT(RND * 1.3)
05E50  GOSUB SUB_87AD
05E59  ElapsedHrs! = 12
05E5C  GOSUB SUB_8CB8
05E65  EncPct! = 30
05E68  GOSUB SUB_6B82
05E71  IF EnemyType! >= 0 THEN GOTO L_6DC6
L_5E76:
05E7C  FoundQty! = 0
05E85  FOR L! = 1 TO 5
L_5E88:
05E97  IF RND * 100 >= SuccessPct! THEN GOTO L_5F3F
L_5E9C:
05EC1  FoundItem! = INT(PlForm! * 4 + RND * 4 + 50)
05EDC  IF G!(CINT(FoundItem! + 400)) <> 0 THEN GOTO L_5F3F
L_5EE1:
05EE6  G!(CINT(FoundItem! + 400)) = 1
05EE9  GOSUB SUB_2299
05EF5  LOCATE 20, 3
05EF8  PRINT "You have found:"
05F0E  LOCATE 21, 3
05F11  PRINT ItemName$(CINT(FoundItem!))
05F30  LOCATE 24, 3
05F33  GOSUB SUB_19F8
05F3C  FoundQty! = 1
L_5F3F:
05F48  NEXT L!
L_5F5B:
05F61  IF FoundQty! <> 0 THEN GOTO L_5F7E
L_5F66:
05F6F  LOCATE 22, 3
05F72  PRINT "Nothing new found"
L_5F7E:
05F7E  GOSUB SUB_6B82
05F87  IF EnemyType! >= 0 THEN GOTO L_6DC6
L_5F8C:
05F8C  GOSUB SUB_19D1
05F8F  GOSUB SUB_19D1
05F92  GOTO L_5D66
SUB_5F95:
05F95  GOSUB SUB_2299
05FA1  LOCATE 22, 3
05FA4  PRINT "Not possible"
05FB0  GOSUB SUB_19D1
05FB3  RETURN
L_5FB4:
05FD6  IF NOT ((PlTech! <> 1) OR (PlForm! > 3)) THEN GOTO L_5FE1
L_5FDB:
05FDB  GOSUB SUB_5F95
05FDE  GOTO L_5D66
L_5FE1:
05FE1  GOSUB SUB_2299
05FE4  GOSUB SUB_6152
05FF9  SuccessPct! = BestSkill! * 10 + 5
05FFC  GOSUB SUB_8D15
06005  IF Idx! = 0 THEN GOTO L_5D66
L_600A:
0601C  FuelUse! = INT(RND * 1.3)
06025  ElapsedHrs! = 24
06028  GOSUB SUB_87AD
0602B  GOSUB SUB_8CB8
06034  EncPct! = 40
06037  GOSUB SUB_6B82
06040  IF EnemyType! >= 0 THEN GOTO L_6DC6
L_6045:
0604B  FoundQty! = 0
06054  FOR L! = 1 TO 6
L_6058:
06067  IF RND * 100 >= SuccessPct! THEN GOTO L_60D5
L_606C:
060A0  FoundItem! = INT(PlForm! * 10 + (RND * (Difficulty! + 40)) * 0.1123596)
060BB  IF G!(CINT(FoundItem! + 160)) <> 0 THEN GOTO L_60D5
L_60C0:
060C5  G!(CINT(FoundItem! + 160)) = 1
060D2  FoundQty! = FoundQty! + 1
L_60D5:
060DE  NEXT L!
L_60F1:
060FA  LOCATE 21, 3
06103  IF FoundQty! <> 0 THEN GOTO L_6117
L_6108:
06108  PRINT "Nothing new found"
06114  GOTO L_612F
L_6117:
06117  PRINT "You found"; FoundQty!; "items"
L_612F:
06138  LOCATE 24, 3
0613B  GOSUB SUB_19F8
0613E  GOSUB SUB_6B82
06147  IF EnemyType! > 0 THEN GOTO L_6DC6
L_614C:
0614C  GOSUB SUB_19D1
0614F  GOTO L_5D66
SUB_6152:
06158  BestSkill! = -1
06161  BestMember! = 3
06167  FOR I! = 3 TO 8
L_616A:
061B9  IF NOT ((FNCrew(I!, 31) > 0) AND (FNCrew(I!, 19) > BestSkill!)) THEN GOTO L_61E2
L_61BE:
061D6  BestSkill! = FNCrew(I!, 19)
061DF  BestMember! = I!
L_61E2:
061EB  NEXT I!
L_61FE:
061FE  RETURN
L_61FF:
061FF  GOSUB SUB_2299
0620B  LOCATE 22, 3
0622D  IF (PlanetCode2! > 149) OR (PlanetCode1! > 149) THEN GOTO L_626B
L_6232:
06251  IF NOT ((PlTech! <> 3) AND (PlTech! <> 1)) THEN GOTO L_626B
L_6256:
06256  PRINT "No transactions on this planet now"
06262  GOSUB SUB_19D1
06265  GOSUB SUB_19D1
06268  GOTO L_5D66
L_626B:
0626B  GOSUB SUB_8D15
06274  IF Idx! = 0 THEN GOTO L_5D66
L_6279:
0628B  FuelUse! = INT(RND * 1.3)
06294  ElapsedHrs! = 12
06297  GOSUB SUB_87AD
0629A  GOSUB SUB_8CB8
062BC  IF (PlanetCode2! < 150) AND (PlanetCode1! < 150) THEN GOTO L_687C
L_62C1:
062C7  TradeCode! = PlanetCode1!
062D5  IF PlanetCode2! <= 149 THEN GOTO L_62DF
L_62DA:
062DC  TradeCode! = PlanetCode2!
L_62DF:
062E8  IF TradeCode! > 249 THEN GOTO L_644B
L_62ED:
062F9  FoundItem! = TradeCode! - 150
06305  LOCATE 20, 3
06308  PRINT "Will you accept a shipment of"
0631E  LOCATE 21, 3
06321  PRINT ItemName$(CINT(FoundItem!)); " ?"
06345  LOCATE 22, 3
06348  PRINT "(y/n)";
06354  GOSUB SUB_2544
0635D  IF YesNo! = 0 THEN GOTO L_5D66
L_6362:
0637B  G!(CINT(FoundItem! + 400)) = 1
0637E  GOSUB SUB_2299
0638A  LOCATE 22, 6
0638D  PRINT "Cargo Loaded"
063B8  IF NOT ((PlanetCode1! < 250) AND (PlanetCode1! > 149)) THEN GOTO L_63E2
L_63BD:
063C2  PlanetCode1! = 0
063C8  MissionCode1! = 0
063CE  MissionCodeA! = 0
063DA  IF MissionType! <> 1 THEN GOTO L_63E2
L_63DF:
063DF  GOSUB SUB_8CC2
L_63E2:
06401  IF NOT ((PlanetCode2! < 250) AND (PlanetCode2! > 149)) THEN GOTO L_642B
L_6406:
0640B  PlanetCode2! = 0
06411  MissionCode2! = 0
06417  MissionCodeB! = 0
06423  IF MissionType! <> 1 THEN GOTO L_642B
L_6428:
06428  GOSUB SUB_8CC2
L_642B:
06434  IF MissionEncB! <= 150 THEN GOTO L_6445
L_6439:
06442  EncChance! = MissionEncB! - 150
L_6445:
06445  GOSUB SUB_19D1
06448  GOTO L_5F7E
L_644B:
06454  LOCATE 20, 3
06463  FoundItem! = TradeCode! - 250
06466  PRINT "The locals await a shipment of"
0647C  LOCATE 21, 3
0647F  PRINT ItemName$(CINT(FoundItem!))
0649D  LOCATE 22, 3
064B9  IF G!(CINT(FoundItem! + 400)) > 0 THEN GOTO L_64DC
L_64BE:
064BE  PRINT "but you have none"
064D3  LOCATE 24, 3
064D6  GOSUB SUB_19F8
064D9  GOTO L_5D66
L_64DC:
064E5  LOCATE 23, 3
064E8  PRINT "Will you give them yours? (y/n)";
064F4  GOSUB SUB_2544
064FD  IF YesNo! = 0 THEN GOTO L_5D66
L_6502:
0651B  G!(CINT(FoundItem! + 400)) = 0
0651E  GOSUB SUB_2299
0652A  LOCATE 23, 3
0652D  PRINT "They thank you"
06539  GOSUB SUB_19D1
0653C  GOSUB SUB_19D1
06548  IF PlanetCode2! <= 249 THEN GOTO L_656E
L_654D:
06555  MissionCodeB! = 0
0655A  PlanetCode2! = 0
06566  IF MissionType! <> 3 THEN GOTO L_656E
L_656B:
0656B  GOSUB SUB_8CC2
L_656E:
06577  IF PlanetCode1! <= 249 THEN GOTO L_659D
L_657C:
06584  MissionCodeA! = 0
06589  PlanetCode1! = 0
06595  IF MissionType! <> 3 THEN GOTO L_659D
L_659A:
0659A  GOSUB SUB_8CC2
L_659D:
065A3  EncChance! = BaseEnc!
065A6  GOTO L_5D66
SUB_65A9:
065A9  GOSUB SUB_2299
065B5  LOCATE 21, 3
065B8  PRINT "Incoming signal,"
065CE  LOCATE 22, 3
065D1  PRINT "will you receive? (y/n)";
065DD  GOSUB SUB_2544
065E6  IF YesNo! <> 0 THEN GOTO L_65EC
L_65EB:
065EB  RETURN
L_65EC:
06603  IF MsgNo! / 3 <> INT(MsgNo! / 3) THEN GOTO L_671A
L_6608:
0661A  IF ABS(LastSignalDay! - Days!) < 11 THEN GOTO L_66F8
L_661F:
06625  LastSignalDay! = Days!
0662E  Idx! = 0
06637  FOR I! = 1 TO 8
L_663A:
06691  IF NOT ((RND * 10 < FNCrew(I!, 23)) AND (FNCrew(I!, 31) = 1)) THEN GOTO L_669F
L_6696:
0669C  Idx! = I!
L_669F:
066A8  NEXT I!
066BE  IF Idx! = 0 THEN GOTO L_66F8
L_66C3:
066C3  GOSUB SUB_2299
066CF  LOCATE 22, 3
066D2  PRINT CrewName$(CINT(Idx!)); " decodes the message"
066EF  GOSUB SUB_19D1
066F2  GOSUB SUB_19D1
066F5  GOTO L_671A
L_66F8:
066F8  GOSUB SUB_2299
06704  LOCATE 22, 3
06707  PRINT "No one can decode the message"
06713  GOSUB SUB_19D1
06716  GOSUB SUB_19D1
06719  RETURN
L_671A:
0671A  GOSUB SUB_2299
06734  Message$ = ItemName$(CINT(MsgNo! + 10))
L_6737:
06737  GOSUB SUB_2299
06740  FOR I! = 0 TO 2
L_6744:
0675A  LOCATE CINT(I! + 20), 3
0675D  PRINT MID$(Message$, CINT(I! * 34 + 1), 34)
06789  NEXT I!
067A2  LOCATE 24, 3
067A5  GOSUB SUB_19F8
067B3  IF LEN(Message$) <= 102 THEN GOTO L_67CD
L_67B8:
067C7  Message$ = MID$(Message$, 103, 200)
067CA  GOTO L_6737
L_67CD:
067CD  RETURN
L_67CE:
067CE  GOSUB SUB_2299
067DA  LOCATE 21, 3
067E6  IF PlanetKey! = SectorCode! THEN GOTO L_6800
L_67EB:
067EB  PRINT "Scanners reveal nothing unusual"
067F7  GOSUB SUB_19D1
067FA  GOSUB SUB_19D1
067FD  GOTO L_5D66
L_6800:
06800  PRINT "Scanners detect a unique structure"
06815  LOCATE 22, 3
06818  PRINT "Send a drop ship? (y/n)"
06824  GOSUB SUB_2544
0682D  IF YesNo! = 0 THEN GOTO L_5D66
L_6832:
06832  GOSUB SUB_8D15
0683B  IF Idx! = 0 THEN GOTO L_5D66
L_6840:
06852  FuelUse! = INT(RND * 1.3)
0685B  ElapsedHrs! = 24
0685E  GOSUB SUB_87AD
06861  GOSUB SUB_8CB8
0686A  EntryMode! = 4
0686D  GOSUB SUB_81E6
06879  CHAIN Drive$ + "INSIDE.STR"
L_687C:
06892  IF PlDensity!(CINT(OrbitNo!)) < 0.66 THEN GOTO L_6B26
L_6897:
068AD  IF PlDensity!(CINT(OrbitNo!)) < 0.88 THEN GOTO L_6A13
L_68B2:
068DB  TradeItem! = INT((PlDensity!(CINT(OrbitNo!))) * 54 - 13.5)
068FD  Price! = INT((PlGravity!(CINT(OrbitNo!))) * 65 + 25)
0691E  IF (G!(CINT(TradeItem! + 400)) = 0) THEN GOTO L_6944
L_6923:
0692B  TradeItem! = 79 - TradeItem!
0693E  Price! = INT(Price! * 0.75)
06941  GOTO L_6A5D
L_6944:
0694D  LOCATE 22, 3
06977  Price! = INT((PlGravity!(CINT(OrbitNo!))) * 65 + 25)
0697A  PRINT "Will you pay"; Price!; "credits for"
06999  LOCATE 23, 3
0699C  PRINT ItemName$(CINT(TradeItem!)); "? (Y/N)";
069B9  GOSUB SUB_2544
069C2  IF YesNo! = 0 THEN GOTO L_5D66
L_69C7:
069D0  Delta! = -Price!
069D3  GOSUB SUB_16A6
069EF  G!(CINT(TradeItem! + 400)) = 1
L_69F2:
069F2  GOSUB SUB_2299
069FE  LOCATE 22, 19
06A01  PRINT "OK"
06A0D  GOSUB SUB_19D1
06A10  GOTO L_5D66
L_6A13:
06A3C  TradeItem! = INT((PlDensity!(CINT(OrbitNo!))) * 54 - 1.6)
06A5A  Price! = INT(80 - ((PlGravity!(CINT(OrbitNo!))) * 40))
L_6A5D:
06A66  LOCATE 21, 3
06A69  PRINT ItemName$(CINT(TradeItem!)); " is needed."
06AA2  IF G!(CINT(TradeItem! + 400)) <> 0 THEN GOTO L_6AB0
L_6AA7:
06AA7  GOSUB SUB_19D1
06AAA  GOSUB SUB_19D1
06AAD  GOTO L_5D66
L_6AB0:
06AB9  LOCATE 22, 3
06ABC  PRINT "Will you sell for"; Price!; "credits?"
06ADE  LOCATE 23, 3
06AE1  PRINT "(Y/N)";
06AED  GOSUB SUB_2544
06AF6  IF YesNo! = 0 THEN GOTO L_5D66
L_6AFB:
06B01  Delta! = Price!
06B04  GOSUB SUB_16A6
06B20  G!(CINT(TradeItem! + 400)) = 0
06B23  GOTO L_69F2
L_6B26:
06B26  GOSUB SUB_2299
06B32  LOCATE 22, 3
06B35  PRINT "Buy 20 units of fuel for 150"
06B4B  LOCATE 23, 3
06B4E  PRINT "credits? (Y/N)";
06B5A  GOSUB SUB_2544
06B63  IF YesNo! = 0 THEN GOTO L_5D66
L_6B68:
06B6E  Delta! = -150
06B71  GOSUB SUB_16A6
06B7A  FuelAdd! = 20
06B7D  GOSUB SUB_3629
06B80  GOTO L_6B26
SUB_6B82:
06B88  EnemyType! = -1
06BB3  IF NOT ((RND * 100 > EncPct!) OR (PlTech! <> 1)) THEN GOTO L_6BB9
L_6BB8:
06BB8  RETURN   'with FAC = RND * 100
L_6BB9:
06BD1  EnemyType! = INT((Difficulty! * 5) / 50)
06BF7  IF NOT ((RND < 0.4) AND (EnemyType! < 4)) THEN GOTO L_6C09
L_6BFC:
06C06  EnemyType! = EnemyType! + 1
L_6C09:
06C1B  EnemyType! = INT(PlForm!) * 5 + EnemyType!
06C26  IF EnemyType! <= 19 THEN GOTO L_6C3C
L_6C2B:
06C30  EnemyType! = 0
06C33  BEEP
06C36  BEEP
06C39  BEEP
L_6C3C:
06C42  ItemType! = 3
06C45  GOSUB SUB_247C
06C54  Stealth! = Idx! * 0.2
06C5D  ItemType! = 4
06C60  GOSUB SUB_247C
06C6C  IF Idx! <> 1 THEN GOTO L_6C7A
L_6C71:
06C77  Stealth! = 0.4
L_6C7A:
06D0D  PortNo! = ABS(RND < BestSkill! * 0.05 + (PlForm! = 0) * 0.4 + (PlForm! = 2) * 0.2 + 0.5) + 2 * ABS(RND < 0.5 - Stealth!)
06D18  IF PortNo! <> 3 THEN GOTO L_6D25
L_6D1D:
06D22  PortNo! = 0
L_6D25:
06D25  GOSUB SUB_2299
06D31  LOCATE 21, 3
06D3A  IF PortNo! <> 0 THEN GOTO L_6D4E
L_6D3F:
06D3F  PRINT "Confrontation on planet surface"
06D4B  GOTO L_6D68
L_6D4E:
06D57  IF PortNo! <> 2 THEN GOTO L_6D68
L_6D5C:
06D5C  PRINT "Surprised by enemy beings"
L_6D68:
06D71  IF PortNo! <> 1 THEN GOTO L_6DC5
L_6D76:
06D76  PRINT "Enemy beings spotted by "; CrewName$(CINT(BestMember!))
06D9C  LOCATE 23, 3
06D9F  PRINT "Fight them? (y/n)";
06DAB  GOSUB SUB_2544
06DB4  IF YesNo! <> 0 THEN GOTO L_6DC5
L_6DB9:
06DBF  EnemyType! = -1
06DC2  GOSUB SUB_2299
L_6DC5:
06DC5  RETURN
L_6DC6:
06DC6  GOSUB SUB_8B33
06DCF  ChainArg! = EnemyType!
06DD8  Surprise! = PortNo!
06DF3  Terrain! = INT(RND * 3 + 1)
06DFC  Breathable! = BreathFlag!
06DFF  GOSUB SUB_81E6
06E0B  CHAIN Drive$ + "PLBATTLE.STR"
L_6E0E:
06E0E  GOSUB SUB_2299
06E1A  LOCATE 20, 3
06E1D  PRINT "A-Inspect Ship"
06E33  LOCATE 21, 3
06E36  PRINT "B-Inspect Squad"
L_6E42:
06E48  CmdMin! = 1
06E51  CmdMax! = 2
06E54  GOSUB SUB_168A
06E60  IF Cmd! = -32 THEN GOTO L_6E42
06E6B  IF Cmd! = -51 THEN GOTO L_33A6
L_6E70:
06E79  IF Cmd! = 1 THEN GOTO L_76DE
L_6E7E:
06E84  Prompt$ = "Inspect Who?"
06E87  GOSUB SUB_1828
06E90  IF Member! = 0 THEN GOTO L_6E0E
L_6E95:
06E95  GOSUB SUB_2299
06E98  GOSUB SUB_33AF
06E9B  GOSUB SUB_22DD
06EA7  LOCATE 2, 7
06EC2  Rec! = FNIdx(Member!, 0)
06EC5  PRINT CrewName$(CINT(Member!))
06EE5  LOCATE 4, 3
06EE8  PRINT "Rank: "; LEFT$(Rank$(CINT(G!(CINT(Rec! + 34)))), 10)
06F2D  LOCATE 5, 3
06F30  PRINT "Class: "; ClassName$(CINT(G!(CINT(Rec! + 35))))
06F67  LOCATE 6, 3
06F8D  AgeYears! = (G!(CINT(Rec! + 29))) * 0.005479452
06F90  PRINT INT(AgeYears!); "yr    "; Status$(CINT(G!(CINT(Rec! + 31))))
06FD3  LOCATE 7, 3
06FD6  PRINT "HP"; INT(G!(CINT(Rec! + 15))); "/"; INT(G!(CINT(Rec! + 16)))
07026  FOR I! = 0 TO 6
L_702A:
07040  LOCATE CINT(I! + 9), 3
07043  PRINT AttrName$(CINT(I!)); STRING$(17 - LEN(STR$(G!(CINT(I! + Rec!)))) - LEN(AttrName$(CINT(I!))), "."); MID$(STR$(G!(CINT(I! + Rec!))), 2, 3)
070A8  NEXT I!
L_70BB:
070BB  GOSUB SUB_7BD5
070BE  GOSUB SUB_998F
070CA  IF Cmd! < -40 THEN GOTO L_6E7E
L_70CF:
070CF  GOSUB SUB_22FE
070DB  LOCATE 4, 3
070DE  PRINT "Hit Bonus.";
070EF  PRINT USING "+##"; G!(CINT(Rec! + 10));
07110  PRINT "%"
07124  LOCATE 5, 3
07127  PRINT "Defence...";
07135  PRINT USING "+##"; G!(CINT(Rec! + 11));
07151  PRINT "%"
07165  LOCATE 6, 3
07168  PRINT "Max Wt....";
07177  PRINT USING Fmt2$; G!(CINT(Rec! + 13));
07193  PRINT " kg"
071A8  LOCATE 7, 3
071AB  PRINT "Cur Wt....";
071BC  PRINT USING Fmt2$; G!(CINT(Rec! + 14));
071DD  PRINT " kg"
071F1  LOCATE 8, 3
071F4  PRINT "Max Move..";
07202  PRINT USING Fmt2$; G!(CINT(Rec! + 12))
07226  LOCATE 9, 3
07229  PRINT "Cur Move..";
07237  PRINT USING Fmt2$; G!(CINT(Rec! + 8))
0725C  LOCATE 11, 3
0727B  IF G!(CINT(Rec! + 35)) >= 3 THEN GOTO L_728F
L_7280:
07280  PRINT "Non-Esper"
0728C  GOTO L_729B
L_728F:
0728F  PRINT "Esper Ability"
L_729B:
072B4  IF G!(CINT(Rec! + 27)) <= 0 THEN GOTO L_72EF
L_72B9:
072C2  LOCATE 12, 5
072C5  PRINT "Level"; G!(CINT(Rec! + 27))
072E0  LOCATE 13, 5
072E3  PRINT "Mindshock"
L_72EF:
0730B  IF G!(CINT(Rec! + 27)) <= 2 THEN GOTO L_7328
L_7310:
07319  LOCATE 14, 5
0731C  PRINT "Communications"
L_7328:
07344  IF G!(CINT(Rec! + 27)) <= 4 THEN GOTO L_7361
L_7349:
07352  LOCATE 15, 5
07355  PRINT "Healing";
L_7361:
0737D  IF G!(CINT(Rec! + 27)) <= 6 THEN GOTO L_738E
L_7382:
07382  PRINT ", View"
L_738E:
073AA  IF G!(CINT(Rec! + 27)) <= 7 THEN GOTO L_73C7
L_73AF:
073B8  LOCATE 16, 5
073BB  PRINT "Psychic Scream"
L_73C7:
073C7  GOSUB SUB_998F
073D3  IF Cmd! < -40 THEN GOTO L_6E7E
L_73D8:
073D8  GOSUB SUB_22FE
073E1  FOR I! = 0 TO 11
L_73E4:
073FA  LOCATE CINT(I! + 5), 3
073FD  PRINT LEFT$(Skill$(CINT(I! + 1)), 13); STRING$(-(POS(0) - 18), "."); CHR$(CINT(G!(CINT(Rec! + I! + 17)) + 48))
07468  NEXT I!
L_747B:
0747B  GOSUB SUB_998F
07487  IF Cmd! < -40 THEN GOTO L_6E7E
L_748C:
0748C  GOSUB SUB_22FE
0749A  LOCATE 4, 3
0749D  PRINT "Armor.....";
074AE  PRINT USING Fmt2$; G!(CINT(Rec! + 48));
074CD  PRINT "/";
074DC  PRINT USING Fmt2$; G!(CINT(Rec! + 49))
07500  LOCATE 7, 3
07503  PRINT "Sighting"
07517  LOCATE 8, 4
0751A  PRINT "Hardware.";
07529  PRINT USING Fmt2$; G!(CINT(Rec! + 43));
07547  PRINT "%"
0755B  LOCATE 11, 3
0755E  PRINT "Clones....";
0756C  PRINT USING Fmt2$; G!(CINT(Rec! + 50))
07591  LOCATE 14, 3
07594  PRINT "Hand"
075A9  LOCATE 15, 4
075AC  PRINT "Weapon..."; MID$(STR$(G!(CINT(Rec! + 45))), 2, 2); " pts"
075E0  GOSUB SUB_998F
075EC  IF Cmd! < -40 THEN GOTO L_6E7E
L_75F1:
075F1  GOSUB SUB_22FE
075FA  I! = 0
07603  FOR Ix! = 2300 TO 2597
L_7606:
0765D  IF NOT ((I! < 13) AND ((G!(CINT(Ix!)) > 0) AND (G!(CINT(Ix! + 2)) = Member!))) THEN GOTO L_76A3
L_7662:
0766A  I! = I! + 1
0767E  LOCATE CINT(I! + 4), 3
07681  PRINT LEFT$(MiscItemName$(CINT(G!(CINT(Ix!)) + -1)), 16)
L_76A3:
076AC  NEXT Ix! STEP 3
L_76BF:
076C5  IF I! <= 0 THEN GOTO L_76DB
L_76CA:
076CA  GOSUB SUB_998F
076D6  IF Cmd! < -40 THEN GOTO L_6E7E
L_76DB:
076DB  GOTO L_974E
L_76DE:
076DE  GOSUB SUB_2299
076E1  GOSUB SUB_33AF
076E4  GOSUB SUB_22DD
076F0  LOCATE 2, 3
076F3  PRINT "ISS "; LEFT$(ShipName$, 12)
0770B  GOSUB SUB_7F9D
07717  LOCATE 5, 3
0771A  PRINT "Base Wt...";
0772B  PRINT USING Fmt3$; BaseWt!;
07739  PRINT " tn"
0774F  LOCATE 6, 3
07752  PRINT "Cargo Wt..";
07760  PRINT USING Fmt3$; CargoWt10! / 10;
07775  PRINT " tn"
07788  LOCATE 7, 3
0778B  PRINT "Total Wt..";
07799  PRINT USING Fmt3$; TotalWt10! / 10;
077AB  PRINT " tn"
077BE  LOCATE 8, 3
077C1  PRINT "Max. Wt...";
077CF  PRINT USING Fmt3$; MaxWt!;
077DB  PRINT " tn"
077F0  LOCATE 11, 3
077F3  PRINT "Armor....."; Armor!
0780F  LOCATE 12, 3
07812  PRINT "Defence...";
07821  PRINT USING "+##"; Defence!;
0782D  PRINT "%"
07841  LOCATE 13, 3
07844  PRINT "Max. Move."; MaxMove!
0785E  LOCATE 14, 3
07861  PRINT "Cur. Move."; CurMove!
07873  GOSUB SUB_998F
0787F  IF Cmd! < -40 THEN GOTO L_6E0E
L_7884:
07884  GOSUB SUB_22FE
0788D  FOR I! = 0 TO 10
L_7890:
078B1  ShipY! = I! - ((I! > 6) * 12)
078CA  IF G!(CINT(ShipY!)) <= 0 THEN GOTO L_7904
L_78CF:
078E2  LOCATE CINT(I! + 4), 3
078E5  PRINT CondMark$(CINT(G!(CINT(ShipY!)))); EquipName$(CINT(ShipY!))
L_7904:
0790D  NEXT I!
L_7920:
07929  LOCATE 16, 3
0792C  PRINT "*Brkn #Unfixable"
07938  GOSUB SUB_998F
07944  IF Cmd! < -40 THEN GOTO L_6E0E
L_7949:
07949  GOSUB SUB_22FE
07955  LOCATE 5, 3
07958  PRINT "Missle"
0796F  LOCATE 6, 4
07972  PRINT "Killer....";
07983  PRINT USING Fmt2$; MissileKillPct! * SGN(MissileKiller!);
0799D  PRINT "%"
079B1  LOCATE 8, 3
079B4  PRINT "Defence"
079C8  LOCATE 9, 4
079CB  PRINT "Hardware..";
079D9  PRINT USING Fmt2$; DefHardwarePct! * SGN(DefHardware!);
079F1  PRINT "%"
07A03  FOR I! = 0 TO 3
L_7A06:
07A1A  ShipY! = I! * 3 + 67
07A32  LOCATE CINT(I! + 11), 3
07A35  PRINT "Shield "; CHR$(CINT(I! + 49)); "...";
07A5B  PRINT USING Fmt3$; (G!(CINT(ShipY!))) * (SGN(G!(CINT(ShipY! + -1))));
07A93  PRINT "pt"
07AA8  NEXT I!
L_7ABB:
07ABB  GOSUB SUB_998F
07AC7  IF Cmd! < -40 THEN GOTO L_6E0E
L_7ACC:
07ACC  GOSUB SUB_952B
07ACF  GOSUB SUB_998F
07ADB  IF Cmd! < -40 THEN GOTO L_6E0E
L_7AE0:
07AE0  GOSUB SUB_22DD
07AEC  LOCATE 2, 6
07AEF  PRINT "Cargo"
07B01  ShipY! = -1
07B0A  FOR I! = 400 TO 499
L_7B0E:
07B21  IF G!(CINT(I!)) = 0 THEN GOTO L_7BA2
L_7B26:
07B31  ShipY! = ShipY! + 1
07B45  LOCATE CINT(ShipY! + 4), 3
07B48  PRINT LEFT$(ItemName$(CINT(I! + -400)), 16)
07B74  IF ShipY! <> 12 THEN GOTO L_7BA2
L_7B79:
07B82  LOCATE 18, 13
07B85  GOSUB SUB_998F
07B91  IF Cmd! < -40 THEN GOTO L_6E0E
L_7B96:
07B96  GOSUB SUB_22FE
07B9F  ShipY! = -1
L_7BA2:
07BAB  NEXT I!
L_7BBE:
07BC7  IF ShipY! <= -1 THEN GOTO L_7BCF
L_7BCC:
07BCC  GOSUB SUB_998F
L_7BCF:
07BCF  GOSUB SUB_22DD
07BD2  GOTO L_6E0E
SUB_7BD5:
07BDB  WtSum! = 0
07BF3  Rec! = FNIdx(Member!, 0)
07CC2  G!(CINT(Rec! + 39)) = (G!(CINT(Rec! + 42))) * (SGN(G!(CINT(Rec! + 41)))) + (G!(CINT(Rec! + 44))) * (SGN(G!(CINT(Rec! + 90)))) + (G!(CINT(Rec! + 91))) * (SGN(G!(CINT(Rec! + 47))))
07CCB  FOR I! = 800 TO 1088
L_7CCE:
07D38  WtSum! = WtSum! - (((G!(CINT(I! + 9)) = Member!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 5))))
07D43  NEXT I! STEP 12
L_7D56:
07D5C  FOR I! = 1100 TO 1397
L_7D60:
07DCA  WtSum! = WtSum! - (((G!(CINT(I! + 2)) = Member!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 1))))
07DD5  NEXT I! STEP 3
L_7DE8:
07DEE  FOR I! = 2300 TO 2597
L_7DF2:
07E5C  WtSum! = WtSum! - (((G!(CINT(I! + 2)) = Member!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 1))))
07E67  NEXT I! STEP 3
L_7E7A:
07EC1  G!(CINT(Rec! + 14)) = INT((G!(CINT(Rec! + 39)) + WtSum!) / 10)
07F05  Count! = 2 - ((G!(CINT(Rec! + 14))) / (G!(CINT(Rec! + 13))))
07F34  Count! = INT((G!(CINT(Rec! + 12))) * Count! + 0.5)
07F3C  IF Count! >= 0 THEN GOTO L_7F4A
L_7F41:
07F44  Count! = 0
07F47  GOTO L_7F6E
L_7F4A:
07F66  IF G!(CINT(Rec! + 12)) >= Count! THEN GOTO L_7F6E
L_7F6B:
07F6B  Count! = G!(CINT(Rec! + 12))
L_7F6E:
07F99  G!(CINT(Rec! + 8)) = INT(Count! + 0.5)
07F9C  RETURN   'with FAC = INT(Count! + 0.5)
SUB_7F9D:
07FA3  WtSum! = 0
07FAC  FOR I! = 60 TO 75
L_7FB0:
07FEB  WtSum! = (G!(CINT(I! + 2))) * (SGN(G!(CINT(I!)))) + WtSum!
07FF6  NEXT I! STEP 3
0801B  WtSum! = (Armor! / ArmorDiv!) * 10 + WtSum!
08024  FOR I! = 340 TO 369
L_8028:
08063  WtSum! = (G!(CINT(I! + 30))) * (SGN(G!(CINT(I!)))) + WtSum!
0806E  NEXT I!
08084  FOR I! = 690 TO 725
L_8088:
080C3  WtSum! = (G!(CINT(I! + 3))) * (SGN(G!(CINT(I!)))) + WtSum!
080CE  NEXT I! STEP 7
080E7  IF WtSum! <= 32000 THEN GOTO L_80F1
L_80EC:
080EE  WtSum! = 32000
L_80F1:
08112  MaxMove! = DefHardware! * ABS(DefSysCond! = 1)
0814B  MaxMove! = BaseMove! - (MaxMove! > 2) - (MaxMove! > 4)
08157  CargoWt10! = INT(WtSum!)
0816F  TotalWt10! = CargoWt10! + BaseWt! * 10
08194  Count! = (2 - ((CargoWt10! / (MaxWt! - BaseWt!)) * 0.1)) * MaxMove!
0819C  IF Count! >= 0 THEN GOTO L_81AA
L_81A1:
081A4  Count! = 0
081A7  GOTO L_81BD
L_81AA:
081B3  IF Count! <= MaxMove! THEN GOTO L_81BD
L_81B8:
081BA  Count! = MaxMove!
L_81BD:
081C6  IF Count! <= 6 THEN GOTO L_81D0
L_81CB:
081CD  Count! = 6
L_81D0:
081E2  CurMove! = INT(Count! + 0.5)
081E5  RETURN   'with FAC = CurMove!
SUB_81E6:
081E6  RETURN
L_81E7:
081E7  GOSUB SUB_2299
081F0  FOR I! = 0 TO 5
L_81F4:
08208  Ix! = I! * 7 + 690
08252  IF (G!(CINT(Ix! + 5)) > 0) OR (G!(CINT(I! + 11)) <> 1) THEN GOTO L_82F6
L_8257:
0826A  GunType! = G!(CINT(Ix!))
08273  FOR ShipY! = 340 TO 369
L_8276:
08290  IF G!(CINT(ShipY!)) <> GunType! THEN GOTO L_82DD
L_8295:
0829A  G!(CINT(ShipY!)) = 0
082A2  ShipY! = 369
082DA  G!(CINT(Ix! + 5)) = G!(CINT(Ix! + 2))
L_82DD:
082E6  NEXT ShipY!
L_82F6:
082FF  NEXT I!
L_8312:
08312  GOSUB SUB_1B37
08315  GOTO L_1B5D
L_8318:
08318  GOSUB SUB_2299
08324  LOCATE 20, 3
08327  PRINT "Standard Delay Factor:"; StdDelay!
08343  LOCATE 22, 3
08346  PRINT "Current Delay Factor:"; Delay!
08360  LOCATE 24, 3
08363  PRINT "New Delay Factor (1-9999): ";
0836F  GOSUB SUB_231E
08377  IF NumIn% >= 1 THEN GOTO L_8382
L_837C:
0837C  NumIn% = 1
L_8382:
08388  IF NumIn% <= 9999 THEN GOTO L_8393
L_838D:
0838D  NumIn% = 9999
L_8393:
0839D  Delay! = NumIn%
083A0  GOTO L_1B5D
L_83A3:
083A9  Idx! = 0
083B2  ObjCount! = -1
083BB  ListRow! = 3
083BE  GOSUB SUB_33AF
083C1  GOSUB SUB_22DD
083CD  LOCATE 2, 7
083D0  PRINT "EQUIPING"
083E2  FOR Ix! = 800 TO 1088
L_83E6:
083FD  IF G!(CINT(Ix!)) <= 0 THEN GOTO L_8435
L_8402:
0840A  K$ = "Weapon"
08421  ListLine$ = WeaponName$(CINT(G!(CINT(Ix!)) - 1))
0842F  OwnerIdx! = Ix! + 9
08432  GOSUB SUB_856B
L_8435:
0843E  NEXT Ix! STEP 12
08457  IF Ix! > 3333 THEN GOTO L_33A6
L_845C:
08462  FOR Ix! = 1100 TO 1397
L_8466:
0847D  IF G!(CINT(Ix!)) <= 0 THEN GOTO L_84B5
L_8482:
0848A  K$ = "Ammo For"
084A1  ListLine$ = WeaponName$(CINT(G!(CINT(Ix!)) - 1))
084AF  OwnerIdx! = Ix! + 2
084B2  GOSUB SUB_856B
L_84B5:
084BE  NEXT Ix! STEP 3
084D7  IF Ix! > 3333 THEN GOTO L_33A6
L_84DC:
084E2  FOR Ix! = 2300 TO 2597
L_84E6:
084FD  IF G!(CINT(Ix!)) <= 0 THEN GOTO L_8535
L_8502:
0850A  K$ = ""
08521  ListLine$ = MiscItemName$(CINT(G!(CINT(Ix!)) - 1))
0852F  OwnerIdx! = Ix! + 2
08532  GOSUB SUB_856B
L_8535:
0853E  NEXT Ix! STEP 3
08557  IF Ix! > 3333 THEN GOTO L_33A6
L_855C:
08562  Idx! = 1
08565  GOSUB SUB_856B
08568  GOTO L_33A6
SUB_856B:
08571  IF Idx! > 0 THEN GOTO L_8642
L_8576:
08583  ObjCount! = ObjCount! + 1
08590  ListRow! = ListRow! + 1
085A0  LOCATE CINT(ListRow!), 3
085A3  PRINT CHR$(CINT(ObjCount! + 65)); "-"; SlotTag$(CINT(G!(CINT(OwnerIdx!))));
085EC  LOCATE , 8
08602  PlSurface!(CINT(ObjCount!)) = OwnerIdx!
0860D  PlanetNo!(CINT(ObjCount!)) = ListRow!
08619  IF K$ <> "" THEN GOTO L_8633
L_861E:
0861E  PRINT LEFT$(ListLine$, 11)
08630  GOTO L_8642
L_8633:
08633  PRINT K$
0863F  GOSUB SUB_95FB
L_8642:
08672  IF NOT ((ListRow! < 14) AND ((ObjCount! < 11) AND (Idx! = 0))) THEN GOTO L_8678
L_8677:
08677  RETURN
L_8678:
0867E  IF ObjCount! >= 0 THEN GOTO L_8684
L_8683:
08683  RETURN
L_8684:
0868D  LOCATE 17, 3
08690  PRINT "SPACE for more"
086A6  LOCATE 18, 3
086A9  PRINT "A-K to change"
L_86B5:
086BB  CmdMin! = 1
086C9  CmdMax! = ObjCount! + 1
086CC  GOSUB SUB_1C58
086D8  IF Cmd! <> -51 THEN GOTO L_86E7
L_86DD:
086E3  Ix! = 9999
086E6  RETURN
L_86E7:
086F0  IF Cmd! <> -32 THEN GOTO L_870B
L_86F5:
086FB  ObjCount! = -1
08704  ListRow! = 3
08707  GOSUB SUB_22FE
0870A  RETURN
L_870B:
08737  Count! = G!(CINT(PlSurface!(CINT(Cmd! - 1)))) + 1
08742  IF Count! <= 8 THEN GOTO L_874F
L_8747:
0874C  Count! = 0
L_874F:
08779  G!(CINT(PlSurface!(CINT(Cmd! - 1)))) = Count!
0878B  LOCATE CINT(PlanetNo!(CINT(Cmd! - 1))), 5
0878E  PRINT SlotTag$(CINT(Count!)); " "
087AA  GOTO L_86B5
SUB_87AD:
087B9  Count! = Fuel! - FuelUse!
087C1  IF Count! > 0 THEN GOTO L_87CC
L_87C6:
087C9  Count! = 0
L_87CC:
087D5  Fuel! = INT(Count!)
087D8  GOSUB SUB_1A5F
087DB  RETURN
SUB_87DC:
087E2  IF Fuel! <= 0 THEN GOTO L_87E8
L_87E7:
087E7  RETURN
L_87E8:
087E8  GOSUB SUB_2299
087F4  LOCATE 20, 3
087F7  PRINT "Out of fuel!"
08803  GOSUB SUB_8B33
08806  GOSUB SUB_19D1
08809  GOSUB SUB_19D1
08824  RescueDays! = INT(RND * 100 + 50)
08835  RescueHrs! = RescueDays! * 24 + RescueHrs!
0883E  RescueCost! = 20000
0884A  LOCATE 21, 3
0884D  PRINT "Rescued in"; INT(RescueDays!); "days"
08875  LOCATE 22, 3
08878  PRINT "for"; RescueCost!; "credits."
0889A  Delta! = -RescueCost!
0889D  GOSUB SUB_16A6
088A9  IF RescueDays! <= 100 THEN GOTO L_893C
L_88AE:
088C4  L! = INT(RND * 8 + 1)
088E0  IF FNCrew(L!, 31) <= 0 THEN GOTO L_893C
L_88E5:
088EE  LOCATE 23, 3
088F1  PRINT CrewName$(CINT(L!)); " has starved to death."
08936  G!(CINT(FNIdx(L!, 31))) = 0
08939  GOSUB SUB_1A7B
L_893C:
08948  ElapsedHrs! = RescueDays! * 24
0894B  GOSUB SUB_8CB8
08957  LOCATE 24, 3
0895A  GOSUB SUB_19F8
08963  FuelAdd! = 30
08966  GOSUB SUB_3629
0896F  Idx! = 1
08972  RETURN
SUB_8973:
089A4  TotalHrs! = Hours! + Days! * 24 + Years! * 8760 + ElapsedHrs!
089B8  Years! = INT(TotalHrs! / 8760)
089C8  TotalHrs! = TotalHrs! - (Years! * 8760)
089DD  Days! = INT(TotalHrs! / 24)
089F4  Hours! = INT(TotalHrs! - (Days! * 24))
089F7  RETURN   'with FAC = Hours!
SUB_89F8:
089FE  FOR N! = 1 TO 8
L_8A02:
08A1D  IF FNCrew(N!, 31) <> 2 THEN GOTO L_8B15
L_8A22:
08A51  Count! = FNCrew(N!, 15) - ((RND * ElapsedHrs!) * 0.5)
08A59  IF Count! > 0 THEN GOTO L_8A64
L_8A5E:
08A61  Count! = 0
L_8A64:
08A8C  G!(CINT(FNIdx(N!, 15))) = INT(Count!)
08A94  IF Count! <> 0 THEN GOTO L_8B15
L_8A99:
08A99  GOSUB SUB_8B33
08AA2  FOR J! = 1 TO 20
L_8AA6:
08ACB  G!(CINT(FNIdx(N!, 31))) = 1
08ACE  GOSUB SUB_1A7B
08AF6  G!(CINT(FNIdx(N!, 31))) = 0
08AF9  GOSUB SUB_1A7B
08B05  NEXT J!
L_8B15:
08B1E  NEXT N!
L_8B31:
08B31  RETURN
08B32  RETURN
SUB_8B33:
08B39  ShownAlert! = 2
08B42  FOR I! = 1 TO 14
L_8B46:
08B5D  SOUND 4444, SndDur! * 0.5
08B6E  SOUND 678, SndDur!
08B71  GOSUB SUB_252B
08B8B  SOUND 3333, SndDur! * 0.3
08BA5  SOUND 8888, SndDur! * 1.7
08BA8  GOSUB SUB_24E0
08BB4  NEXT I!
08BC4  RETURN
08BC5  RETURN
SUB_8BC6:
08BCC  FOR N! = 1 TO 8
L_8BD0:
08C04  IF FNCrew(N!, 15) >= FNCrew(N!, 16) THEN GOTO L_8C9B
L_8C09:
08C4C  IF NOT ((RND < ElapsedHrs! * 0.03125) AND (FNCrew(N!, 31) = 1)) THEN GOTO L_8C9B
L_8C51:
08C98  G!(CINT(FNIdx(N!, 15))) = FNCrew(N!, 15) + 1
L_8C9B:
08CA4  NEXT N!
L_8CB7:
08CB7  RETURN
SUB_8CB8:
08CB8  GOSUB SUB_8973
08CBB  GOSUB SUB_89F8
08CBE  GOSUB SUB_8BC6
08CC1  RETURN
SUB_8CC2:
08CC8  FOR J! = 110 TO 159
L_8CCC:
08CE6  IF G!(CINT(J!)) <> 1 THEN GOTO L_8CFB
L_8CEB:
08CF0  G!(CINT(J!)) = 2
08CF8  J! = 222
L_8CFB:
08D04  NEXT J!
08D14  RETURN
SUB_8D15:
08D58  Idx! = ABS(DropPart3! = 1) + ABS(DropPart2! = 1) + ABS(DropPart1! = 1)
08DB9  Idx! = ((ABS(FNCrew(2, 31) > 0)) * (ABS(FNCrew(2, 17) > 0))) * Idx!
08DC1  IF Idx! <> 0 THEN GOTO L_8DE8
L_8DC6:
08DC6  GOSUB SUB_2299
08DD2  LOCATE 22, 3
08DD5  PRINT "Drop ship or pilot not ready"
08DE1  GOSUB SUB_19D1
08DE4  GOSUB SUB_19D1
08DE7  RETURN
L_8DE8:
08E04  GET (15, 8)-(143, 144), SaveArea
08E07  GOSUB SUB_22DD
08E1D  PUT (28, 12), Starfield, XOR
08E26  CurX! = 60
08E2F  CurY! = 63
08E32  GOSUB SUB_9138
08E3B  Note! = 0
08E3E  GOSUB SUB_8F2E
08E54  PUT (56, 12), DropShip1, PSET
08E57  GOSUB SUB_8F2E
08E6D  PUT (44, 12), DropShip2, PSET
08E70  GOSUB SUB_8F2E
08E86  PUT (44, 12), DropShip3, PSET
08E89  GOSUB SUB_8F2E
08E9F  PUT (52, 19), DropShip4, PSET
08EA2  GOSUB SUB_8F2E
08EB8  PUT (56, 33), DropShip5, PSET
08EBB  GOSUB SUB_8F2E
08ED1  PUT (60, 46), DropShip6, PSET
08ED4  GOSUB SUB_8F2E
08EEA  PUT (64, 52), DropShip7, PSET
08EED  GOSUB SUB_8F2E
08F0E  LINE (64, 59)-(71, 61), 0, BF
08F11  GOSUB SUB_19D1
08F14  GOSUB SUB_19D1
08F2A  PUT (15, 8), SaveArea, PSET
08F2D  RETURN
SUB_8F2E:
08F36  IF (SndDur! = 0) THEN GOTO L_8F9F
L_8F3B:
08F41  FOR R! = 1 TO 3
L_8F44:
08F75  SOUND CINT(Note! * 3 + 38), 0.9 - (Note! / 25)
08F81  NEXT R!
08F9C  Note! = Note! + 1
L_8F9F:
08F9F  RETURN
L_8FA0:
08FA0  GOSUB SUB_2299
08FAC  LOCATE 21, 3
08FAF  PRINT "Scanning nearby craft"
08FBB  GOSUB SUB_8B33
08FBE  GOSUB SUB_19D1
08FC1  GOSUB SUB_19D1
08FC4  GOSUB SUB_19D1
08FD0  LOCATE 23, 3
08FDC  IF EnemyType! >= 1 THEN GOTO L_9022
L_8FE1:
08FE1  PRINT "It is friendly.  Approach? (y/n)";
08FED  GOSUB SUB_2544
08FF6  IF YesNo! <> 0 THEN GOTO L_9007
L_8FFB:
08FFB  GOSUB SUB_19D1
08FFE  GOSUB SUB_2626
09001  GOSUB SUB_28C1
09004  GOTO L_1B5D
L_9007:
09019  EnemyType! = INT(RND * 10)
0901C  GOTO L_902E
0901F  GOTO L_902E
L_9022:
09022  PRINT "Unidentified, prepare for combat"
L_902E:
09034  ChainArg! = EnemyType!
09037  GOSUB SUB_81E6
09043  CHAIN Drive$ + "SPBATTLE.EXE"
L_9046:
09080  EnemyType! = (G!(CINT(Zone! + 2230))) * ABS(RND > 0.1)
09088  IF EnemyType! <= 0 THEN GOTO L_90A8
L_908D:
090A5  EnemyType! = INT(RND * 3) + EnemyType!
L_90A8:
090AE  IF EnemyType! <= 0 THEN GOTO L_90CE
L_90B3:
090CB  BaseEnc! = INT(EncChance! * 0.7 + 0.6)
L_90CE:
090CE  GOTO L_8FA0
SUB_90D1:
090D7  MissionIdx! = 0
090DD  MissionNo! = 0
090E3  FOR I! = 0 TO 49
L_90E6:
09103  IF G!(CINT(I! + 110)) <= 0 THEN GOTO L_911E
L_9108:
0910D  MissionIdx! = I!
0911B  MissionNo! = G!(CINT(I! + 110)) - 1
L_911E:
09127  NEXT I!
09137  RETURN
SUB_9138:
0914B  SizeClass! = OrbitClass!(CINT(OrbitNo!))
09153  ON CINT(SizeClass!) GOTO L_915D, L_9188, L_91D0
L_915D:
09182  SpriteNo! = INT((PlGravity!(CINT(OrbitNo!))) * 5 - 4)
09185  GOTO L_9215
L_9188:
091AD  SpriteNo! = INT((PlGravity!(CINT(OrbitNo!))) * 10 + 9)
091BD  CurX! = CurX! + 2
091CA  CurY! = CurY! + 2
091CD  GOTO L_9215
L_91D0:
091F5  SpriteNo! = INT((PlGravity!(CINT(OrbitNo!))) * 20 + 20.8)
09205  CurX! = CurX! + 6
09212  CurY! = CurY! + 6
L_9215:
0921B  ON CINT(SpriteNo!) GOTO L_925B, L_9273, L_928B, L_92A3, L_92BB, L_92D3, L_92EB, L_9303, L_931B, L_9333, L_934B, L_9363, L_937B, L_9393, L_93AB, L_93C3, L_93DB, L_93F3, L_940B, L_9423, L_943B, L_9453, L_946B, L_9483, L_949B, L_94B3, L_94CB, L_94E3, L_94FB, L_9513
L_925B:
0926F  PUT (CurX!, CurY!), Planet28, XOR
09272  RETURN
L_9273:
09287  PUT (CurX!, CurY!), Planet29, XOR
0928A  RETURN
L_928B:
0929F  PUT (CurX!, CurY!), Planet30, XOR
092A2  RETURN
L_92A3:
092B7  PUT (CurX!, CurY!), Planet31, XOR
092BA  RETURN
L_92BB:
092CF  PUT (CurX!, CurY!), Planet32, XOR
092D2  RETURN
L_92D3:
092E7  PUT (CurX!, CurY!), Planet33, XOR
092EA  RETURN
L_92EB:
092FF  PUT (CurX!, CurY!), Planet34, XOR
09302  RETURN
L_9303:
09317  PUT (CurX!, CurY!), Planet35, XOR
0931A  RETURN
L_931B:
0932F  PUT (CurX!, CurY!), Planet36, XOR
09332  RETURN
L_9333:
09347  PUT (CurX!, CurY!), Planet37, XOR
0934A  RETURN
L_934B:
0935F  PUT (CurX!, CurY!), Planet38, XOR
09362  RETURN
L_9363:
09377  PUT (CurX!, CurY!), Planet39, XOR
0937A  RETURN
L_937B:
0938F  PUT (CurX!, CurY!), Planet40, XOR
09392  RETURN
L_9393:
093A7  PUT (CurX!, CurY!), Planet41, XOR
093AA  RETURN
L_93AB:
093BF  PUT (CurX!, CurY!), Planet42, XOR
093C2  RETURN
L_93C3:
093D7  PUT (CurX!, CurY!), Planet43, XOR
093DA  RETURN
L_93DB:
093EF  PUT (CurX!, CurY!), Planet44, XOR
093F2  RETURN
L_93F3:
09407  PUT (CurX!, CurY!), Planet45, XOR
0940A  RETURN
L_940B:
0941F  PUT (CurX!, CurY!), Planet46, XOR
09422  RETURN
L_9423:
09437  PUT (CurX!, CurY!), Planet47, XOR
0943A  RETURN
L_943B:
0944F  PUT (CurX!, CurY!), Planet48, XOR
09452  RETURN
L_9453:
09467  PUT (CurX!, CurY!), Planet49, XOR
0946A  RETURN
L_946B:
0947F  PUT (CurX!, CurY!), Planet50, XOR
09482  RETURN
L_9483:
09497  PUT (CurX!, CurY!), Planet51, XOR
0949A  RETURN
L_949B:
094AF  PUT (CurX!, CurY!), Planet52, XOR
094B2  RETURN
L_94B3:
094C7  PUT (CurX!, CurY!), Planet53, XOR
094CA  RETURN
L_94CB:
094DF  PUT (CurX!, CurY!), Planet54, XOR
094E2  RETURN
L_94E3:
094F7  PUT (CurX!, CurY!), Planet55, XOR
094FA  RETURN
L_94FB:
0950F  PUT (CurX!, CurY!), Planet56, XOR
09512  RETURN
L_9513:
09527  PUT (CurX!, CurY!), Planet57, XOR
0952A  RETURN
SUB_952B:
0952B  GOSUB SUB_22DD
09537  LOCATE 2, 3
0953A  PRINT "Ships Guns"
0954C  FOR I! = 1 TO 6
L_9550:
09564  ListRow! = I! * 2 + 1
09579  LOCATE CINT(ListRow! + 1), 3
0957C  PRINT CHR$(CINT(I! + 48)); ">";
095B7  Ix! = G!(CINT(I! * 7 + 683))
095BF  IF Ix! <= 0 THEN GOTO L_95DE
L_95C4:
095D8  ListLine$ = GunName$(CINT(Ix! - 1))
095DB  GOSUB SUB_95FB
L_95DE:
095E7  NEXT I!
L_95FA:
095FA  RETURN
SUB_95FB:
09608  ListRow! = ListRow! + 1
0961E  SpacePos! = INSTR(ListLine$, " ")
0962B  L! = SpacePos! + 1
09659  IF NOT ((LEN(ListLine$) < 15) OR ((SpacePos! > 15) OR (SpacePos! = 0))) THEN GOTO L_9674
L_965E:
09666  Tmp2! = 14
0966E  Tmp1! = 15
09671  GOTO L_96D8
L_9674:
0968F  SpacePos! = INSTR(CINT(L!), ListLine$, " ")
096AD  IF NOT ((SpacePos! < 16) AND (SpacePos! > 0)) THEN GOTO L_96BF
L_96B2:
096BA  L! = SpacePos! + 1
096BD  GOTO L_9674
L_96BF:
096CD  Tmp2! = L! - 2
096D5  Tmp1! = L!
L_96D8:
096E8  LOCATE CINT(ListRow!), 5
096EB  PRINT LEFT$(ListLine$, CINT(Tmp2!))
09716  IF LEN(ListLine$) <= Tmp2! THEN GOTO L_974D
L_971B:
09726  ListRow! = ListRow! + 1
09733  LOCATE CINT(ListRow!), 5
09736  PRINT MID$(ListLine$, CINT(Tmp1!), 14)
L_974D:
0974D  RETURN
L_974E:
0974E  GOSUB SUB_22DD
0975A  LOCATE 2, 3
0975D  PRINT "Rlds  Weapons"
0976F  FOR I! = 501 TO 554
L_9772:
09789  G!(CINT(I!)) = 0
09794  NEXT I!
097AA  FOR I! = 1100 TO 1397
L_97AE:
097CE  IF G!(CINT(I! + 2)) <> Member! THEN GOTO L_980A
L_97D3:
097EB  Count! = G!(CINT(I!)) + 500
09807  G!(CINT(Count!)) = G!(CINT(Count!)) + 1
L_980A:
09813  NEXT I! STEP 3
09829  Ix! = 800
L_982C:
09832  ListRow! = 3
09835  GOSUB SUB_22FE
L_9838:
0984F  GunType! = G!(CINT(Ix!))
09887  IF NOT ((G!(CINT(Ix! + 9)) <> Member!) OR (GunType! < 1)) THEN GOTO L_98A8
L_988C:
09896  Ix! = Ix! + 12
098A1  IF Ix! > 1090 THEN GOTO L_9989
L_98A6:
098A6  GOTO L_9838
L_98A8:
098BA  LOCATE CINT(ListRow! + 1), 3
098D6  Scratch! = G!(CINT(GunType! + 500))
098E1  IF Scratch! <= 9 THEN GOTO L_98EB
L_98E6:
098E8  Scratch! = 9
L_98EB:
098EB  PRINT CHR$(CINT(Scratch! + 48));
0991C  IF G!(CINT(Ix! + 3)) >= 0 THEN GOTO L_9930
L_9921:
09921  PRINT "*";
0992D  GOTO L_993C
L_9930:
09930  PRINT " ";
L_993C:
09953  ListLine$ = WeaponName$(CINT(GunType! - 1))
09956  GOSUB SUB_95FB
09964  Ix! = Ix! + 12
09970  IF ListRow! < 15 THEN GOTO L_9838
L_9975:
09975  GOSUB SUB_998F
09981  IF Cmd! >= -40 THEN GOTO L_982C
L_9986:
09986  GOTO L_6E7E
L_9989:
09989  GOSUB SUB_998F
0998C  GOTO L_6E7E
SUB_998F:
09998  LOCATE 18, 4
0999B  PRINT "Press SPACEBAR"
099AD  CmdMax! = 0
099B0  GOSUB SUB_1C58
099B3  RETURN
099B4  ' push ?
099B5  ' asm sbb byte ptr [bp - 0x5788], bh
099BF  ' asm int 0x16  (data tail?)
099C1  ' asm add byte ptr [bx + di], al
099C3  ' asm add byte ptr [bx + si], cl
099C5  ' asm add byte ptr [bx + si], al
099C7  ' asm add byte ptr [bx + si], al
099C9  ' asm add byte ptr [bx + si], al
099CC  ' asm add byte ptr [bx + si], al
099CE  ' asm add byte ptr [bx + si], al
099D0  ' asm add byte ptr [bx + si], al
099D2  ' asm add byte ptr [bx + si], al
099D4  ' asm rol word ptr [bp + si], 0xff
099D7  ' asm inc word ptr [bx + si]
099D9  ' asm add byte ptr [bx + si], al
099DB  ' asm add byte ptr [bx + si], al
099DD  ' asm add byte ptr [bx + si], al
099DF  ' asm add byte ptr [bx], dl
099E1  ' asm add byte ptr [bx + di], al
099E3  ' asm add byte ptr [bp + si], cl
099E5  ' asm add byte ptr [bx + si], al
099E7  ' asm add byte ptr [bx + si], al
099E9  ' asm add byte ptr [bx + si], al
099EC  ' asm add byte ptr [bx + si], al
099EE  ' asm add byte ptr [bx + si], al
```

## Subroutines (near CALL targets)

| sub | calls | role |
|---|---|---|
| SUB_03E2 | 50 | DEF FNCrew(member, field) = INT(G!(member*100 + field + 1300) + .1)  'crew-record field accessor; inlined at every call site |
| SUB_0414 | 36 | DEF FNIdx(member, field) = INT(member*100 + field + 1300.5)  'crew-record field index into G!(); inlined at every call site |
| SUB_0452 | 4 | DEF FNRound2(v): T = v*100: FNRound2 = INT(T + 1 - (INT(T + 1) = 9)) / 100  '2-decimal rounding of the planet readouts (verify lane: body 0452-0490 reads only Val!, constants 100/1/9); inlined at every call site |
| SUB_1023 | 1 | draw the console frame: SCREEN 1 (+PALETTE on EGA), rounded panels (picture 16..143x8..143, ship 248..303x6..64, crew 160..303x70..144, text 16..303x152..191), logo + FUEL:/ARMOR:/alert boxes, crew list, ship sprite; falls into the sector-map view |
| SUB_1657 | 6 | empty delay loop FOR Tmp4! = 1 TO Delay!*1.2 |
| SUB_168A | 7 | LOCATE 24,3: PRINT string at DS 0xAC1E; then SUB_1C58 (menu key) |
| SUB_16A6 | 4 | add Delta! to the credits (CreditsHi!*30000 + CreditsLo!), cap 9999999 |
| SUB_16F6 | 1 | empty (RETURN only) |
| SUB_16F7 | 1 | crew-panel AM/RL columns for gun I!: string at DS 0xAC38 if not fitted, string at DS 0xA988 if type > 14, else PRINT USING string at DS 0xAC5A; ammo loaded; ammo in stock |
| SUB_1828 | 3 | crew member picker: prints Prompt$, keys ENTER = 0, P = 1 (pilot), C = 2 (captain), 1..6 -> 3..8; rejects dead/empty members unless PickAny! = 1 |
| SUB_19D1 | 49 | pause: 5 x SUB_1657 |
| SUB_19F8 | 13 | PRINT string at DS 0xAC94; then wait for K$ = CHR$(13) |
| SUB_1A28 | 1 | ARMOR: readout at 6,27 (PRINT USING string at DS 0x6AAE, clipped to 999) |
| SUB_1A5F | 3 | FUEL: readout at 4,26 (PRINT USING string at DS 0xACA8; Fuel!) |
| SUB_1A7B | 5 | crew panel names: rows 11..18 col 23, CrewName$ or Status$ when status <> 1 |
| SUB_1B37 | 3 | crew panel AM/RL columns for the 6 guns (SUB_16F7 x6) |
| SUB_1C58 | 5 | menu key: Cmd! = ASC(INKEY$) - 64 (lowercase -32 more), loop until CmdMin! <= Cmd! <= CmdMax! or Cmd! = -51 (ENTER) or -32 (SPACE) |
| SUB_1CE3 | 2 | ship panel: ship sprite for ShipHeading! at (264,24), gun digits 1..6 around it at the 8 compass positions (HeadX%/HeadY% rotated by heading), shield arcs (SUB_1FB5 per shield G!(7..10)) |
| SUB_1F85 | 1 | normalise the arc angles N_AD80!/N_AD84! to >= 0 (+2 pi) |
| SUB_1FB5 | 1 | draw the shield arc band: CIRCLE (275..277-n, 35..37-n), 25.5, colour, start, end |
| SUB_2056 | 1 | PUT the gun-number digit J! (1..6) at (I!, ShipY!); case 7 = erase (PSET then XOR) |
| SUB_212C | 3 | wait for a key: extended key -> Cmd! = scan code - 70 (1..11: 2 Up, 5 Left, 7 Right, 10 Down), letter -> Cmd! = 12 (A) .. 37 (Z); cursor keys require EngineCond!/PowerCond!/pilot alive else string at DS 0xADC0 (Cmd! = 40) or string at DS 0xADDC (hang) |
| SUB_2299 | 50 | clear the bottom text box: LINE (16,152)-(303,191),0,BF |
| SUB_22BB | 1 | clear text box rows below 160: LINE (16,160)-(303,191),0,BF |
| SUB_22DD | 14 | clear the left picture area: LINE (16,8)-(143,143),0,BF |
| SUB_22FE | 13 | clear the picture area below the header: LINE (16,16)-(143,143),0,BF |
| SUB_231E | 1 | numeric input: MaxLen! = 4 then SUB_2327 |
| SUB_2327 | 1 | line editor at the cursor: echoes K$, BACKSPACE, digits only unless MaxLen! = 4, ENTER -> NumIn% = VAL(K$) |
| SUB_247C | 5 | find an item of type ItemType! in G!(2300..2597 STEP 3): Idx! = 1 and Ix! = slot index when found |
| SUB_24E0 | 1 | alert box string at DS 0xAE32 at 8,21 |
| SUB_24F9 | 2 | alert box string at DS 0xAE40 |
| SUB_2512 | 1 | alert box string at DS 0xAE4E |
| SUB_252B | 2 | alert box blank |
| SUB_2544 | 10 | YesNo! = 1 for Y/y, 0 for N/n (loops until one is pressed) |
| SUB_2626 | 6 | sector-map view: "LONG RANGE" header, MapCol!/MapRow!/CellX!/CellY!/SectorIdx! from SectorX!/SectorY!, BLOAD MAP-MapNo! into PicBuf when the tile changes, PUT (16,16) |
| SUB_28C1 | 2 | after a move: PUT the 16x16 cell marker, Zone! and SectorCode! from Galaxy%, print "(x,y) ZN:" + zone tag, alert colour (siren on yellow), clock +10 h, fuel check, rad tick, encounter roll |
| SUB_2ACA | 1 | sector scan: "SECTOR SCAN" header; mission-sector codes; black hole (2BB5: visual + random lines, then teleport to one of 3 sectors), or decode the 16x2 pixel words of the cell into PixColor!/PixObj!/PixCol! and PUT Blip1..3 |
| SUB_30B1 | 4 | scan menu: string at DS 0xAF82, string at DS 0xAF90, cursor sprite, string at DS 0xAFA0 |
| SUB_33AF | 7 | header bar: LINE (28,0)-(123,7),2,BF and (28,2)-(123,5),1,BF |
| SUB_3629 | 4 | refuel animation: string at DS 0xB066; ShipName$, bar 42..270 grows by FuelAdd! with SOUND, then FUEL: readout and pause |
| SUB_4242 | 3 | swap owner numbers Member!/Count! in one item record: G!(I!) = SwapSum! - G!(I!) |
| SUB_44F4 | 3 | one ship-equipment row: letter, string at DS 0xB1D8 or CondMark$ + EquipName$ |
| SUB_548D | 3 | one kill-list row: ShipType$ name and tonnage; page break every 12 rows |
| SUB_5F95 | 1 | string at DS 0xB666 message |
| SUB_6152 | 2 | find the alive member 3..8 with the best field-19 skill -> BestSkill!/BestMember! |
| SUB_65A9 | 2 | text with the string at DS 0xB7A6 -> decode check (field 23 vs RND*10, once per 11 days) -> print Message$ = ItemName$(MsgNo!+10) 34 chars per row |
| SUB_6B82 | 4 | surface encounter roll: EnemyType! from difficulty/life form (or -1), stealth from items, then PortNo! (reused) = 0 confrontation / 1 spotted (part of the string at DS 0xB9B6) / 2 surprised |
| SUB_7BD5 | 1 | recompute a member's carried weight (armor/weapon fields + owned weapons/ammo/items), G!(Rec!+14), and current move G!(Rec!+8) |
| SUB_7F9D | 1 | recompute ship weights: CargoWt10!, TotalWt10!, MaxMove!, CurMove! |
| SUB_81E6 | 5 | empty (RETURN only); called before every CHAIN (probably a compiled-out save) |
| SUB_856B | 4 | EQUIPING list row (letter, owner tag, name, word-wrapped) and the A-K / SPACE / ENTER handling that cycles an item's owner 0..8 |
| SUB_87AD | 10 | burn FuelUse! units of fuel (not below 0) and refresh the FUEL: readout |
| SUB_87DC | 1 | if Fuel! <= 0: string at DS 0xBD5A siren, rescue after RescueDays! days for 20000 credits, possible starvation of one member, clock advance, 30 units of fuel |
| SUB_8973 | 4 | advance the clock by ElapsedHrs! (Hours!/Days!/Years!) |
| SUB_89F8 | 1 | radiation damage: members with status 2 lose up to ElapsedHrs!/2 HP; at 0 HP siren and 20 name flashes (dead) |
| SUB_8B33 | 4 | red alert: alert box RED, 14 siren cycles |
| SUB_8BC6 | 1 | natural healing: alive members below max HP gain 1 HP with chance ElapsedHrs!/32 |
| SUB_8CB8 | 8 | clock advance + rad damage + healing (SUB_8973, SUB_89F8, SUB_8BC6) |
| SUB_8CC2 | 6 | mark the active mission flag G!(110..159) = 1 as completed (= 2) |
| SUB_8D15 | 4 | drop-ship launch: Idx! = ready (3 parts fitted, member 2 alive with field 17) else string at DS 0xBDD6; animation DropShip1..7 with rising SOUND, screen saved/restored |
| SUB_8F2E | 8 | three SOUNDs of rising pitch (Note!) unless sound is off |
| SUB_90D1 | 2 | find the active mission: MissionIdx!/MissionNo! from G!(110..159) = value > 0 |
| SUB_9138 | 3 | choose and PUT the planet sprite: SizeClass! = OrbitClass!(OrbitNo!) -> SpriteNo! from PlGravity! (20x20 1..10, 16x16 11..20 with +2 offset, 8x8 21..30 with +6 offset) |
| SUB_952B | 1 | string at DS 0xBE90 list: 6 slots with GunName$ word-wrapped |
| SUB_95FB | 3 | print ListLine$ word-wrapped into 14-character rows at column 5 |
| SUB_998F | 13 | LOCATE 18,4: string at DS 0xBEC4; SUB_1C58 with CmdMax! = 0 (SPACE = -32 continues, ENTER = -51 backs out) |

## Variables

Addresses are DS offsets. kinds: N = 4-byte single, S = string descriptor, I = integer, P = array/untyped (PUT/BLOAD target). Names come from `SPACE_names.json` (evidence column = why).
| address | kinds (uses) | name | evidence |
|---|---|---|---|
| 0x1850 | N x4 | EngineCond! | G!(0): condition of ship equipment slot 0 "Engine" (NAME 344; EquipName$(0)): 1 ok, 2 broken -> string at DS 0xADC0 (SPACE 2224, SPBATTLE 1D5B), else part of the string at DS 0xADDC (SPACE 2273) - crossref |
| 0x185C | N x4 | PowerCond! | G!(3): condition of slot 3 "Power" (EquipName$(3)): must be 1 to move/rotate (SPACE 2224/2273, SPBATTLE 1D5B, 4794) - crossref |
| 0x1864 | N x2 | ComputerCond! | G!(5): condition of slot 5 part of the string at DS 0xACCE: string at DS 0xB3AE unless 1 (SPACE 5204) - crossref |
| 0x186C | N x1 | G!(7) | fixed-index element of the COMMON array G! at DS 0x186C (= 0x1850 + 7*4); the compiler addresses constant subscripts directly |
| 0x1870 | N x1 | G!(8) | fixed-index element of the COMMON array G! at DS 0x1870 (= 0x1850 + 8*4); the compiler addresses constant subscripts directly |
| 0x1874 | N x1 | G!(9) | fixed-index element of the COMMON array G! at DS 0x1874 (= 0x1850 + 9*4); the compiler addresses constant subscripts directly |
| 0x1878 | N x2 | G!(10) | fixed-index element of the COMMON array G! at DS 0x1878 (= 0x1850 + 10*4); the compiler addresses constant subscripts directly |
| 0x1890 | N x1 | G!(16) | fixed-index element of the COMMON array G! at DS 0x1890 (= 0x1850 + 16*4); the compiler addresses constant subscripts directly |
| 0x1894 | N x1 | DefSysCond! | G!(17): condition/fitted flag of slot 17 "Def. Systm" (defense hardware): set 1 when bought (STARPORT 4ED7); MaxMove! uses G!(63) when 1 (SPACE 8112) - crossref |
| 0x18A0 | N x1 | DropPart1! | G!(20): drop ship ready = (G!(20)=1)+(G!(21)=1)+(G!(22)=1) (8D58) |
| 0x18A4 | N x1 | DropPart2! | G!(21): see DropPart1! |
| 0x18A8 | N x2 | DropPart3! | G!(22): see DropPart1! |
| 0x18C4 | N x2 | ShipClass! | BLOAD string at DS 0xA960+STR$(-1-ShipClass!)+string at DS 0xA96C (028B) -> SHIP-1..4 = ship class pictures |
| 0x18FC | N x1 | G!(43) | fixed-index element of the COMMON array G! at DS 0x18FC (= 0x1850 + 43*4); the compiler addresses constant subscripts directly |
| 0x1900 | N x3 | BaseMove! | G!(44): MaxMove! = BaseMove! - (MaxMove!>2) - (MaxMove!>4) (814B) |
| 0x1904 | N x8 | BaseWt! | G!(45): string at DS 0xBB8A PRINT USING Fmt3$; BaseWt! (772B); Total = Cargo + BaseWt!*10 (816F) |
| 0x1908 | N x4 | MaxWt! | G!(46): string at DS 0xBBB4 (77CF); move penalty uses MaxWt!-BaseWt! (8194) |
| 0x1910 | N x12 | CargoWt10! | G!(48): cargo weight x10 (8157); printed /10 as string at DS 0xBB98 (7760) |
| 0x1918 | N x6 | TotalWt10! | G!(50): total weight x10 (816F); printed /10 as string at DS 0xBBA6 (7799) |
| 0x191C | N x1 | Defence! | G!(51): string at DS 0xBA5C PRINT USING string at DS 0xBA78; Defence! (7821) |
| 0x1920 | N x7 | MaxFuel! | G!(52): fuel capacity (3664: Fuel! clipped to MaxFuel!) |
| 0x1924 | N x3 | ArmorDiv! | G!(53): weight adds Armor!/ArmorDiv!*10 (801B) |
| 0x192C | N x9 | Armor! | G!(55): string at DS 0xBB2A; Armor! (77F3); ARMOR: readout clipped to 999 (SUB_1A28) |
| 0x1940 | N x2 | MissileKiller! | G!(60): fitted flag, SGN() multiplies the percentage (7983) |
| 0x1944 | N x2 | MissileKillPct! | G!(61): text with the STARPORT string at DS 0xB5E0 (7983) |
| 0x194C | N x4 | DefHardware! | G!(63): fitted flag (79D9); also the drive rating used for MaxMove! (8112) |
| 0x1950 | N x2 | DefHardwarePct! | G!(64): text with the string at DS 0xBC3E (79D9) |
| 0x1964 | N x1 | G!(69) | fixed-index element of the COMMON array G! at DS 0x1964 (= 0x1850 + 69*4); the compiler addresses constant subscripts directly |
| 0x1970 | N x1 | G!(72) | fixed-index element of the COMMON array G! at DS 0x1970 (= 0x1850 + 72*4); the compiler addresses constant subscripts directly |
| 0x1988 | N x18 | CreditsHi! | G!(78) (shipped 3): credits = CreditsHi!*30000 + CreditsLo! (SUB_16A6; the FN body at 0433 computes the same sum but has no caller) |
| 0x198C | N x8 | CreditsLo! | G!(79) (shipped 5000): low part of the credits (SUB_16A6) |
| 0x1998 | N x5 | CurMove! | G!(82): string at DS 0xBBF4; CurMove! (7861) = INT(Count!+.5) in SUB_7F9D |
| 0x19A4 | N x2 | DriveCfg! | G!(85): 1 -> Drive$=string at DS 0x6AC4, 2 -> string at DS 0x6ACE (0064-0086) |
| 0x19A8 | N x1 | StdDelay! | G!(86) (shipped 188): string at DS 0xBCAC; StdDelay! (8327); STARTUP: Speed |
| 0x19B0 | N x7 | Delay! | G!(88) (shipped 188): string at DS 0xBCC6; Delay! (8346); DelayCount! = Delay!*1.2 |
| 0x19B4 | N x1 | UseEGA! | G!(89) (STARTUP: UseEGA): SCREEN 1 + PALETTE 1,9 / 2,4 when = 1 (1032-1049) |
| 0x19C4 | N x2 | SoundOff! | G!(93) (STARTUP: SoundOff): SndDur! = 1 - SoundOff! (018C); SUB_8F2E silent when SndDur! = 0 |
| 0x19F4 | N x1 | G!(105) | fixed-index element of the COMMON array G! at DS 0x19F4 (= 0x1850 + 105*4); the compiler addresses constant subscripts directly |
| 0x1A08 | N x1 | G!(110) | fixed-index element of the COMMON array G! at DS 0x1A08 (= 0x1850 + 110*4); the compiler addresses constant subscripts directly |
| 0x1A14 | N x1 | G!(113) | fixed-index element of the COMMON array G! at DS 0x1A14 (= 0x1850 + 113*4); the compiler addresses constant subscripts directly |
| 0x1A20 | N x1 | G!(116) | fixed-index element of the COMMON array G! at DS 0x1A20 (= 0x1850 + 116*4); the compiler addresses constant subscripts directly |
| 0x1A2C | N x1 | G!(119) | fixed-index element of the COMMON array G! at DS 0x1A2C (= 0x1850 + 119*4); the compiler addresses constant subscripts directly |
| 0x1A3C | N x1 | G!(123) | fixed-index element of the COMMON array G! at DS 0x1A3C (= 0x1850 + 123*4); the compiler addresses constant subscripts directly |
| 0x1AD8 | N x1 | G!(162) | fixed-index element of the COMMON array G! at DS 0x1AD8 (= 0x1850 + 162*4); the compiler addresses constant subscripts directly |
| 0x1B44 | N x1 | G!(189) | fixed-index element of the COMMON array G! at DS 0x1B44 (= 0x1850 + 189*4); the compiler addresses constant subscripts directly |
| 0x1B98 | N x1 | G!(210) | fixed-index element of the COMMON array G! at DS 0x1B98 (= 0x1850 + 210*4); the compiler addresses constant subscripts directly |
| 0x1C5C | N x1 | G!(259) | fixed-index element of the COMMON array G! at DS 0x1C5C (= 0x1850 + 259*4); the compiler addresses constant subscripts directly |
| 0x1C60 | N x1 | G!(260) | fixed-index element of the COMMON array G! at DS 0x1C60 (= 0x1850 + 260*4); the compiler addresses constant subscripts directly |
| 0x1D24 | N x1 | G!(309) | fixed-index element of the COMMON array G! at DS 0x1D24 (= 0x1850 + 309*4); the compiler addresses constant subscripts directly |
| 0x1D28 | N x2 | KillStartAll! | G!(310): first kill-list index for string at DS 0xB3C2 (52EA) |
| 0x1D2C | N x2 | KillPtr! | G!(311): kill-list write index (535C) |
| 0x1D30 | N x2 | KillStartMission! | G!(312): first index for string at DS 0xB3D8 (5347) |
| 0x1D34 | N x2 | Kills! | G!(313): string at DS 0xB42A; Kills! (52FF) |
| 0x1D38 | N x2 | KillStartPort! | G!(314): first index for string at DS 0xB3F0 (5353) |
| 0x1D3C | N x2 | Tonnage! | G!(315): string at DS 0xB434; Tonnage! (531E) |
| 0x1DA0 | N x1 | G!(340) | fixed-index element of the COMMON array G! at DS 0x1DA0 (= 0x1850 + 340*4); the compiler addresses constant subscripts directly |
| 0x1E14 | N x1 | G!(369) | fixed-index element of the COMMON array G! at DS 0x1E14 (= 0x1850 + 369*4); the compiler addresses constant subscripts directly |
| 0x1E90 | N x1 | G!(400) | fixed-index element of the COMMON array G! at DS 0x1E90 (= 0x1850 + 400*4); the compiler addresses constant subscripts directly |
| 0x201C | N x1 | G!(499) | fixed-index element of the COMMON array G! at DS 0x201C (= 0x1850 + 499*4); the compiler addresses constant subscripts directly |
| 0x2318 | N x1 | G!(690) | fixed-index element of the COMMON array G! at DS 0x2318 (= 0x1850 + 690*4); the compiler addresses constant subscripts directly |
| 0x23A4 | N x1 | G!(725) | fixed-index element of the COMMON array G! at DS 0x23A4 (= 0x1850 + 725*4); the compiler addresses constant subscripts directly |
| 0x23AC | N x1 | G!(727) | fixed-index element of the COMMON array G! at DS 0x23AC (= 0x1850 + 727*4); the compiler addresses constant subscripts directly |
| 0x24D0 | N x1 | G!(800) | fixed-index element of the COMMON array G! at DS 0x24D0 (= 0x1850 + 800*4); the compiler addresses constant subscripts directly |
| 0x24DC | N x1 | G!(803) | fixed-index element of the COMMON array G! at DS 0x24DC (= 0x1850 + 803*4); the compiler addresses constant subscripts directly |
| 0x24F4 | N x1 | G!(809) | fixed-index element of the COMMON array G! at DS 0x24F4 (= 0x1850 + 809*4); the compiler addresses constant subscripts directly |
| 0x2500 | N x1 | G!(812) | fixed-index element of the COMMON array G! at DS 0x2500 (= 0x1850 + 812*4); the compiler addresses constant subscripts directly |
| 0x250C | N x1 | G!(815) | fixed-index element of the COMMON array G! at DS 0x250C (= 0x1850 + 815*4); the compiler addresses constant subscripts directly |
| 0x2524 | N x1 | G!(821) | fixed-index element of the COMMON array G! at DS 0x2524 (= 0x1850 + 821*4); the compiler addresses constant subscripts directly |
| 0x2958 | N x1 | G!(1090) | fixed-index element of the COMMON array G! at DS 0x2958 (= 0x1850 + 1090*4); the compiler addresses constant subscripts directly |
| 0x2980 | N x1 | G!(1100) | fixed-index element of the COMMON array G! at DS 0x2980 (= 0x1850 + 1100*4); the compiler addresses constant subscripts directly |
| 0x2984 | N x1 | G!(1101) | fixed-index element of the COMMON array G! at DS 0x2984 (= 0x1850 + 1101*4); the compiler addresses constant subscripts directly |
| 0x2E18 | N x1 | G!(1394) | fixed-index element of the COMMON array G! at DS 0x2E18 (= 0x1850 + 1394*4); the compiler addresses constant subscripts directly |
| 0x2E20 | N x1 | G!(1396) | fixed-index element of the COMMON array G! at DS 0x2E20 (= 0x1850 + 1396*4); the compiler addresses constant subscripts directly |
| 0x2E24 | N x1 | G!(1397) | fixed-index element of the COMMON array G! at DS 0x2E24 (= 0x1850 + 1397*4); the compiler addresses constant subscripts directly |
| 0x2E2C | N x1 | G!(1399) | fixed-index element of the COMMON array G! at DS 0x2E2C (= 0x1850 + 1399*4); the compiler addresses constant subscripts directly |
| 0x3150 | N x1 | G!(1600) | fixed-index element of the COMMON array G! at DS 0x3150 (= 0x1850 + 1600*4); the compiler addresses constant subscripts directly |
| 0x3AB0 | N x30 | Fuel! | G!(2200) COMMON: string at DS 0xABFE readout PRINT USING string at DS 0xACA8 (SUB_1A5F); fuel bar = Fuel!/MaxFuel! (3645); burned by SUB_87AD |
| 0x3AB8 | N x13 | Years! | G!(2202) COMMON: clock years (SUB_8973: hours -> days (24) -> years (8760)) |
| 0x3AC0 | N x12 | Days! | G!(2204) COMMON: clock day of year (SUB_8973); compared with LastSignalDay! (661A) |
| 0x3AC8 | N x6 | Hours! | G!(2206) COMMON: clock hour of day (SUB_8973) |
| 0x3AE8 | N x3 | ChainArg! | G!(2214) COMMON argument for the CHAINed module: starport number (3608), enemy type (6DCF, 9034) |
| 0x3AF0 | N x25 | SectorX! | G!(2216) COMMON (shipped save = 28): PRINT "("; SectorX!+1; "," (2938); moved by DX! (283B) |
| 0x3AF4 | N x26 | SectorY! | G!(2217) COMMON (shipped save = 27): PRINT ...; 32-SectorY!; string at DS 0xAEE0 (2938) |
| 0x3AF8 | N x28 | CursorCol! | G!(2218) COMMON: sector-scan cursor column 0..14 (31C2: PUT (CursorCol!*7.46+16, ...)); half = INT(CursorCol!/8) (3405) |
| 0x3AFC | N x22 | CursorRow! | G!(2219) COMMON: sector-scan cursor row 0..14 (PixColor!(CursorRow!, half), 3432) |
| 0x3B00 | N x18 | SysCurX! | G!(2220) COMMON: system-scan cursor x 0..11 (3F11: PUT (SysCurX!*8+20, SysCurY!*8+28)); planet picked at SysCurX!-6 (5671) |
| 0x3B04 | N x16 | SysCurY! | G!(2221) COMMON: system-scan cursor y 0..11 |
| 0x3B18 | N x1 | ShipHeading! | G!(2226) COMMON: Heading! = ShipHeading! in SUB_1CE3 (1CFB) |
| 0x3B1C | N x4 | EntryMode! | G!(2227) COMMON: 0 dock at starport (35FF), 3 space station (3867), 4 planet unique area (686A) before CHAIN STARPORT/INSIDE |
| 0x3B20 | N x4 | Terrain! | G!(2228) COMMON: PLBATTLE terrain index = DATA record 297 of PLBATTLE (1..3 Plains/Mushrooms/Swamp from SPACE INT(RND*3+1) 6DF3, 10 Enemy Ship from SPBATTLE 3EEF, 11 Enclosed Room from INSIDE 6646) - crossref |
| 0x3B24 | N x1 | Surprise! | G!(2229) COMMON: surprise code before CHAIN PLBATTLE: 0 confrontation / 1 you surprise / 2 enemies surprise (SPACE 6DD8, INSIDE 6575, SPBATTLE 3EFA) - crossref |
| 0x3B38 | N x1 | MissionKey2! | G!(2234) COMMON: planet key of mission target 2 (5C80) |
| 0x3B3C | N x6 | BaseEnc! | G!(2235) COMMON: encounter chance restored after a delivery (65A3) |
| 0x3B40 | N x3 | MissionCodeB! | G!(2236) COMMON: code of mission target 2 (2B58); cleared when delivered (6417) |
| 0x3B44 | N x6 | MissionType! | G!(2237) COMMON: 1 pickup, 3 delivery, 5/6 planet visit (63DA, 6423, 6566, 5C64, 5C96): completes the mission via SUB_8CC2 |
| 0x3B48 | N x1 | MissionX1! | G!(2238) COMMON: sector x of mission target 1 (2B15) |
| 0x3B4C | N x1 | MissionY1! | G!(2239) COMMON: sector y of target 1 |
| 0x3B50 | N x3 | MissionCodeA! | G!(2240) COMMON: code of mission target 1 (2B1F); cleared when done (63CE) |
| 0x3B54 | N x1 | MissionKey1! | G!(2241) COMMON: planet key of mission target 1 (5C4E) |
| 0x3B58 | N x4 | MissionEncB! | G!(2242) COMMON: encounter bonus at target 2 (2B6F) / = EncChance!+150 (6442) |
| 0x3B5C | N x1 | MissionX2! | G!(2243) COMMON: sector x of mission target 2 (2B4D) |
| 0x3B60 | N x1 | MissionY2! | G!(2244) COMMON: sector y of target 2 |
| 0x3B78 | N x5 | Gravity10! | G!(2250) COMMON = planet gravity*10 (5BF1) or 1 at a station (3879) for the chained module |
| 0x3B80 | N x1 | Breathable! | G!(2252) COMMON = 1 breathable atmosphere (5936/594E -> 6DFC) |
| 0x3B84 | N x1 | StationNo! | G!(2253) COMMON = SectorCode!-2000 (3870) before CHAIN INSIDE |
| 0x3B88 | N x1 | G!(2254) | fixed-index element of the COMMON array G! at DS 0x3B88 (= 0x1850 + 2254*4); the compiler addresses constant subscripts directly |
| 0x3BB8 | N x4 | G!(2266) | fixed-index element of the COMMON array G! at DS 0x3BB8 (= 0x1850 + 2266*4); the compiler addresses constant subscripts directly |
| 0x488C | S x3 | ShipName$ | first CHARNAME field (STARTUP: CharName$); printed as string at DS 0xB066; ShipName$ (367D) and string at DS 0xBB82; LEFT$(ShipName$,12) (76F3) |
| 0x6AA2 | S x6 | Fmt3$ | = string at DS 0x6AAE at 0046, used only as PRINT USING format |
| 0x6AA6 | S x11 | Fmt2$ | = string at DS 0x6AB6 at 004F, PRINT USING format |
| 0x6AAA | S x16 | Drive$ | assigned ""/string at DS 0x6AC4/string at DS 0x6ACE at 0058-0086 from N_19A4 (drive configuration from STARTUP), prefixed to every file name (BLOAD/CHAIN/OPEN) |
| 0x6C28 | N x618 | I! | FOR counter of almost every loop (655 uses) |
| 0x6C8C | N x10 | Log4! | = LOG(3.999) (0177): divisor that turns LOG(word) into the pixel index |
| 0x6C9A | N x23 | SndDur! | = 1 - N_19C4! (018C) and used as every SOUND duration (29EB..) |
| 0x6D3A | N x1 | PixColor!(7, 0) | element (7,0) of PixColor! (0x6D1E + 7*4) set to 4 at 2DC1 = black-hole marker colour |
| 0x6DBA | N x1 | PixCol!(7, 0) | element (7,0) of PixCol! (0x6D9E + 7*4) set to 7 at 2DCA = black-hole marker column |
| 0x6E3E | N x39 | J! | inner FOR counter (0195, 4E42) |
| 0x6E46 | S x1 | ZoneTag$(0) | element 0 of the string array at 0x6E46 (literal store at initialisation) |
| 0x6E4A | S x1 | ZoneTag$(1) | element 1 of the string array at 0x6E46 (literal store at initialisation) |
| 0x6E4E | S x1 | ZoneTag$(2) | element 2 of the string array at 0x6E46 (literal store at initialisation) |
| 0x6E52 | S x1 | ZoneTag$(3) | element 3 of the string array at 0x6E46 (literal store at initialisation) |
| 0xA80C | N x5 | Resumed! | 0 on first entry: skips the CHARINFO BLOAD (0243) and the CHARNAME read (0348); set by the CHAINing module (COMMON) - name is a reading, M |
| 0xA974 | S x1 | Status$(0) | element 0 of the string array at 0xA974 (literal store at initialisation) |
| 0xA978 | S x1 | Status$(1) | element 1 of the string array at 0xA974 (literal store at initialisation) |
| 0xA97C | S x1 | Status$(2) | element 2 of the string array at 0xA974 (literal store at initialisation) |
| 0xA998 | S x1 | SlotTag$(0) | element 0 of the string array at 0xA998 (literal store at initialisation) |
| 0xA99C | S x1 | SlotTag$(1) | element 1 of the string array at 0xA998 (literal store at initialisation) |
| 0xA9A0 | S x1 | SlotTag$(2) | element 2 of the string array at 0xA998 (literal store at initialisation) |
| 0xA9D6 | S x1 | ClassName$(0) | element 0 of the string array at 0xA9D6 (literal store at initialisation) |
| 0xA9DA | S x1 | ClassName$(1) | element 1 of the string array at 0xA9D6 (literal store at initialisation) |
| 0xA9DE | S x1 | ClassName$(2) | element 2 of the string array at 0xA9D6 (literal store at initialisation) |
| 0xAA06 | S x1 | CondMark$(1) | element 1 of CondMark$ (base 0xAA02 + 1*4): "-" for equipment condition 1 (ok) (032D). The decode had named this CondMark$(0): the base of the indexed reads at 4537/78E5 is 0xAA02 (`add bx,0xAA02` at 04554/078F1), so the literal stores at 032D/0336/033F fill elements 1..3, exactly as STARPORT 01E8-01FA - sweep-folded fix |
| 0xAA0A | S x1 | CondMark$(2) | element 2 of CondMark$ (0xAA02 + 2*4): "*" for condition 2 (broken) (0336) - was named CondMark$(1), sweep-folded fix |
| 0xAA0E | S x1 | CondMark$(3) | element 3 of CondMark$ (0xAA02 + 3*4): "#" for condition 3 (unfixable) (033F) - was named CondMark$(2), sweep-folded fix |
| 0xAA38 | S x1 | PortName$(0) | element 0 of the string array at 0xAA38 (literal store at initialisation) |
| 0xAA3C | S x1 | PortName$(1) | element 1 of the string array at 0xAA38 (literal store at initialisation) |
| 0xAA40 | S x1 | PortName$(2) | element 2 of the string array at 0xAA38 (literal store at initialisation) |
| 0xAA64 | N x52 | FnField! | argument 1 of FN_03E2 (G!(FnMember!*100 + FnField! + 1300)): set right before each GOSUB SUB_03E2 |
| 0xAA68 | N x58 | FnMember! | argument 2 of FN_03E2 (set before GOSUB SUB_03E2) |
| 0xAA78 | N x38 | Fn2Field! | argument of FN_0414 (INT(Fn2Member!*100 + Fn2Field! + 1300.5)) |
| 0xAA7C | N x42 | Fn2Member! | argument of FN_0414 |
| 0xAA90 | N x13 | Val! | argument of FNRound2 (2-decimal rounding) in the planet readouts: mass = PlDiameter!^3 * PlDensity!(Idx!) (599D), gravity (59D3), diameter (5A08), density (5A48) |
| 0xAAA8 | N x14 | YesNo! | SUB_2544 sets 1 for Y/y, 0 for N/n and callers test it |
| 0xAACC | N x87 | ShipY! | y of the ship sprite PUTs (1D32..) and equipment-list rows (7B45) |
| 0xAB74 | N x113 | Ix! | scratch index: heading compass index (1E04), G! slot found by SUB_247C (24B2), map pixel word index (2E02), record pointer in the EQUIPING / weapon / gun lists (83E2, 9829, 95B7, 8208) |
| 0xAB84 | N x59 | Member! | selected crew member: CrewName$(Member!) at 25B9/436C/4D2C, LOCATE Member!+10 (15DC) |
| 0xAB8C | N x17 | Difficulty! | game difficulty: item range (60A0) and enemy strength INT(Difficulty!*5/50) (6BD1) - name is a reading, M |
| 0xAB9C | N x16 | EncChance! | encounter probability in percent: RND*100 < EncChance! (+ MissionEnc!) -> L_9046 (2AB4, 32D7, 3F92); set from the mission (6442, 65A3) and after combat (90CB) |
| 0xABA0 | N x6 | FuelAdd! | units added by SUB_3629: 999 refuel-only at a starport (3620), 20 bought (6B7A), 30 after rescue (8963) |
| 0xABB6 | N x6 | ShownAlert! | last alert level drawn in the 8,21 box (29A7); 2 = red (SUB_8B33 siren) |
| 0xAC12 | N x5 | DelayCount! | = Delay!*1.2 (1663): iterations of the empty delay loop SUB_1657 |
| 0xAC1A | N x10 | Tmp4! | scratch: delay loop counter (166C), armor readout clipped to 999 (1A2E), gun AM value (180F) |
| 0xAC30 | N x22 | Delta! | amount added to the credits by SUB_16A6: -Price! (69D0), +Price! (6B01), -150 (6B6E), -20000 (889A) |
| 0xAC42 | N x9 | Tmp3! | scratch: gun record value (1736), tow tonnage (55E0) |
| 0xAC4A | N x8 | AmmoCount! | number of G!(340..369) entries equal to the gun type (17DB): the RL column of the crew panel |
| 0xAC52 | N x130 | Count! | general counter: string at DS 0xB24E; Count! (4A23); loop bound tests (17F4) |
| 0xAC64 | N x95 | Idx! | list index / flag: LOCATE Idx!+4 in kill list (54AE), planet index in string at DS 0xB49E (576B), set to 1 as a found-flag (1865) |
| 0xAC68 | S x4 | Prompt$ | prompt printed by SUB_1828: string at DS 0xB124, string at DS 0xB142, string at DS 0xBA02 |
| 0xAC6C | S x39 | K$ | always assigned from INKEY$ (1C5E, 2547, 188D ...) |
| 0xAC88 | N x3 | PickAny! | 1 while SUB_1828 may also pick dead/empty members (409A, cleared 4294); the picker otherwise requires status > 0 and field 0 > 0 (19C8) |
| 0xAC90 | N x17 | K! | scratch: FOR K! = 1 TO 5 in SUB_19D1; = INT(LogVal!/LOG(3.999)) = pixel position inside the word (2EDA) |
| 0xACB0 | N x9 | M! | crew loop counter of SUB_1A7B (1A81) |
| 0xAD40 | N x19 | DX! | x step of the cursor/ship: -1/0/+1 set by the arrow-key cases (3183-31BF, 2745-27E1, 4001-403D) |
| 0xAD44 | N x22 | DY! | y step of the cursor/ship: -1/0/+1 (arrow-key cases) |
| 0xAD48 | N x95 | Cmd! | SUB_1C58: ASC(K$), -32 if lowercase, -64 -> A=1..; indexes the ON GOTO menu tables at 1C13/1C39/3139/3FBD |
| 0xAD5C | N x10 | CmdMin! | lower bound accepted by SUB_1C58 (1CDA) |
| 0xAD60 | N x15 | CmdMax! | upper bound accepted by SUB_1C58 (1CDA) |
| 0xAD6C | N x23 | Heading! | ON Heading!+1 GOTO 8 cases each PUTting one of the 8 ship sprites (1D0A-1DE8); = N_3B18! (G!(2226)); REUSED as scratch: map pixel word at 2E36, kits-used-up count at 49C1/4A69 |
| 0xAD7C | N x40 | L! | spare loop counter: FOR L! = 1 TO 5/6 (5E85, 6054), random member (88C4), INSTR scan position (962B) |
| 0xAD80 | N x43 | Tmp1! | scratch: station number = SectorCode!-2000 (37B4), kill-list start (52EA-5353), INSTR split (966E) |
| 0xAD84 | N x34 | Tmp2! | scratch: fuel-bar end x (36A7), kill-list write index (535C), split length (9666) |
| 0xAD88 | N x4 | ArcOn! | 0 = draw base arc, 1 = shield arc (1EFD/1F65) in SUB_1FB5 colour = N_AD7C!+ArcOn!-1 |
| 0xAD90 | N x7 | ShieldNo! | 1..4: shield strength = G!(ShieldNo!+6) (1F25), arcs at (3.2-2*ShieldNo!-Heading!)*0.7854 (1F4E) |
| 0xADA4 | N x5 | ArcX1! | = 277 - N_AD7C! (1FC1) |
| 0xADB0 | N x5 | ArcY1! | = 37 - N_AD7C! (1FDA) |
| 0xAE06 | N x4 | MaxLen! | maximum input length for SUB_2327 (4 digits via SUB_231E, 3 letters at 25E0); digits only unless 4 |
| 0xAE0A | N x76 | CurX! | x of cursor/planet PUTs (925B..), LOCATE CurY!,CurX! (236A) |
| 0xAE0E | N x80 | CurY! | y of cursor/planet PUTs (925B..), LOCATE CurY!,CurX! (236A) |
| 0xAE18 | S x4 | Ch$ | key read inside SUB_2327 |
| 0xAE28 | I x6 | NumIn% | = VAL(K$) returned by SUB_2327 (2478); clamped 1..9999 for Delay! (8377-839D) |
| 0xAE2A | N x6 | ItemType! | item type searched by SUB_247C in G!(2300..2597 STEP 3): 1 medkit (4DE7), 2 repair kit (4411, 46E1), 3/4 (6C42/6C5D) |
| 0xAEA8 | N x17 | MapCol! | = INT(SectorX!/8) (2654): map tile column; REUSED at 3D68 as the orbit x mirror (+1/-1) in the system scan |
| 0xAEAC | N x20 | MapRow! | = INT(SectorY!/8) (266C): map tile row; REUSED at 3D84 as the orbit y mirror (+1/-1) |
| 0xAEB0 | N x9 | MapNo! | BLOAD string at DS 0xAEC8+STR$(-MapNo!)+string at DS 0xA96C, &H9008 (2705); = MapRow!*4 + MapCol! + 1 (2685): the galaxy is 4x4 map tiles of 8x8 cells |
| 0xAEB4 | N x27 | CellX! | = SectorX! - MapCol!*8 (2696): 0..7 cell column inside the map tile; PUT (CellX!*16+16, CellY!*16+16), PlanetMark (2819) |
| 0xAEB8 | N x23 | CellY! | = SectorY! - MapRow!*8 (26A7): 0..7 cell row inside the map tile |
| 0xAEC0 | N x14 | SectorIdx! | = SectorX! + SectorY!*32 (26BA): index into Galaxy%; stepped by DX! + DY!*32 (287F) |
| 0xAEC4 | N x4 | LoadedMap! | map tile number currently in PicBuf (26CF/26D4); 0 forces a reload after a starport/station picture (3556, 37DA) |
| 0xAED0 | N x40 | FuelUse! | fuel burned per step: 5 per sector move (2822), INT(RND*1.1) per scan-cursor move (326B), INT(RND*1.5) repair (45E9) ...; subtracted by SUB_87AD |
| 0xAED4 | N x17 | Zone! | ZoneTag$(Zone!) at 2938 |
| 0xAED8 | N x6 | AlertLvl! | = INT(Zone!/2) (2927): 0 for zones A/B -> yellow + siren, 1 for N/? -> green (29B2-2A39) |
| 0xAEFC | N x38 | ElapsedHrs! | hours to add to the clock in SUB_8973: 10 per sector move (2A4F), 1 per cursor move (3277), 24 repair (45D1), 12 science (5E59) ... |
| 0xAF00 | N x13 | RadTick! | cycles 0,1,0,1.. per sector move (2A8B): ON RadTick!+1 GOSUB SUB_89F8 (rad damage), SUB_8BC6 (healing) |
| 0xAF04 | N x4 | MissionCode1! | = N_3B50! (G!(2240)) while the ship is in the first mission sector (3B48/3B4C) (2B1F); <50 message, 50..149 enemy ship, 150..249 pickup item, 250+ delivery item (5CC8-5D63, 62BC-62E8) |
| 0xAF08 | N x4 | MissionCode2! | = N_3B40! (G!(2236)) while in the second mission sector (3B5C/3B60) (2B58) |
| 0xAF0C | N x6 | MissionEnc! | extra encounter chance (= N_3B58!, 2B6F) while in the second mission sector |
| 0xAF10 | N x7 | MissionNo! | = active mission number - 1 found by SUB_90D1 (G!(110+I) = 1 -> I) |
| 0xAF14 | N x15 | SectorCode! | = Galaxy%(SectorIdx!) MOD 10000 (2B97): <444 star system (2DE3), 1000+n starport n (34D5), 2000+n space station n (37B4), 2099..2102 black hole (2BA7-2C07), >777 black-hole marker (2DB6) |
| 0xAF6A | N x31 | ObjCount! | running count: contacts in the sector scan (2E77), bodies in the system (3A99), rows in the EQUIPING list (8583) |
| 0xAF72 | N x8 | LogVal! | = LOG(pixel word) (2EC2) |
| 0xAF76 | N x6 | LogFrac! | = LogVal! - K!*Log4! (2EEC): 0 / 0.69 / 1.1 for pixel colour 1/2/3 |
| 0xAF7A | N x9 | BlipY! | = CurX!*8 + 16 (2F89): y of the sector-scan blip (CurX! = pixel row) |
| 0xAF7E | N x7 | BlipX! | = CurY!*64 + PixCol!*8 + 16 (2FCD): x of the blip (CurY! = word half) |
| 0xAFBA | N x26 | RadTick2! | cycles 0..5 per cursor move (32A3, 3F5E): ON RadTick2!+1 GOSUB SUB_89F8, SUB_8BC6 |
| 0xAFDA | N x13 | StarClass! | = PixColor!(CursorRow!, half) at the scan cursor (3432): 1..3 star class (Star1..3, 3D9C-3DF4), >= 4 starport/station (349E) |
| 0xB006 | N x23 | PortNo! | BLOAD string at DS 0xAFF0+STR$(-PortNo!-1) (3512); PRINT PortName$(PortNo!) (353A) |
| 0xB05A | N x8 | BarX0! | fuel bar x before refuel = Fuel!/MaxFuel!*228+42 (3645) |
| 0xB076 | N x5 | BarX1! | fuel bar target x rounded to even (3725) |
| 0xB0D8 | N x10 | NumBodies! | = INT(RND*(StarClass!+7)+1) (390E) after seeding RND with the sector/cell coordinates (38E8) |
| 0xB0DC | N x5 | NumBig! | = NumBodies!*0.7 (3958) |
| 0xB0E4 | N x5 | NumMid! | = NumBodies!*0.6 (39BE) |
| 0xB0EC | N x5 | NumSmall! | = NumBodies!*0.25 (3A11) |
| 0xB110 | N x4 | StarNo! | = PixObj! at the scan cursor (3E35); PRINT string at DS 0xB114; -StarNo! (3E38); PlanetKey! = StarNo!*10 + planet |
| 0xB120 | N x11 | OrbitNo! | orbit index passed to SUB_9138 (3EBA, 5C0C) and the trade code (68DB) |
| 0xB156 | N x6 | RecDelta! | = FNIdx(Count!,0) - FNIdx(Member!,0) (410F): distance between the two crew records being swapped |
| 0xB15A | N x5 | RecEnd! | = FNIdx(Count!,99) (412C): last index of the record to swap |
| 0xB162 | N x6 | SwapSum! | = Count! + Member! (41C7): SUB_4242 maps owner m to SwapSum!-m in the item records |
| 0xB182 | N x25 | RepairPct! | repair success percent: best repair skill*10+35 (435A), HasKit!*35 + skill*10 (4446, 472B) |
| 0xB2E8 | N x11 | HealPct! | best medical skill (field 20) found at 4CD5-4CFE; heal chance = skill * SGN(status) * HasKit! * 10 (4E33) |
| 0xB2F8 | N x3 | AnyHealed! | 1 if any member needed healing (4DCF): else string at DS 0xB350 |
| 0xB37A | N x2 | MissionIdx2! | = Idx! (5086): number of MISSION records to skip |
| 0xB37E | S x6 | MissionText1$ | first quoted field of MISSION (5095), printed 34 chars per row (5123) |
| 0xB382 | S x4 | MissionText2$ | second quoted field of MISSION (5095) |
| 0xB386 | N x6 | Scratch! | INPUT #1 sink for the 15 MISSION integers (50B7); reload count clipped to 9 (98D6) |
| 0xB44E | N x2 | KillEnd1! | loop limit copy of KillPtr! (53DB) |
| 0xB452 | N x2 | KillEnd2! | loop limit copy of KillPtr! (5430) |
| 0xB484 | N x5 | PickX! | = SysCurX!-6 (5671): orbit x of the planet under the system-scan cursor |
| 0xB488 | N x5 | PickY! | = SysCurY!-6 (567F) |
| 0xB518 | N x3 | BreathFlag! | 1 string at DS 0xB50A / 0 string at DS 0xB51C (5936/594E) -> Breathable! for PLBATTLE |
| 0xB542 | N x9 | PlDiameter! | = PlGravity!/PlDensity! (597F), string at DS 0xB546 |
| 0xB560 | N x24 | PlTech! | = INT(PlLife!/10) - (PlLife!>0) (5A83-5AB2): index into TechLevel$ (string at DS 0xB568) |
| 0xB564 | N x34 | PlForm! | = PlLife! MOD 10 adjusted (5A97-5AE7): index into LifeForm$ (5B2D); item range base in science/espionage finds (5EC1, 60A0) |
| 0xB58C | N x7 | PlanetKey! | = StarNo!*10 + PlanetNo!(Idx!) (5C38): compared with the mission planet keys N_3B54!/N_3B38! (5C4E, 5C80) |
| 0xB590 | N x17 | PlanetCode1! | mission code 1 if this is the mission planet (5C58) else 0; drives signal/enemy/trade branches |
| 0xB594 | N x18 | PlanetCode2! | mission code 2 if this is the second mission planet (5C8A) else 0 |
| 0xB598 | N x6 | MsgNo! | incoming-signal message number: Message$ = ItemName$(MsgNo!+10) (6734); decoding needed when MsgNo! MOD 3 <> 0 (6603) |
| 0xB59C | N x56 | EnemyType! | enemy ship type for SPBATTLE (ChainArg! = EnemyType!, 9034) = mission code - 50 (5D2D) or G!(Zone!+2230)+RND*3 (9080-90A5); -1 = no surface encounter (6B88) |
| 0xB620 | N x16 | BestSkill! | best skill value found by SUB_6152 (field 19 of members 3..8): espionage/science success = BestSkill!*10+25 / +5 (5E2A, 5FF9) |
| 0xB624 | N x12 | SuccessPct! | percent chance per find attempt (5E97, 6067) |
| 0xB62C | N x3 | EncPct! | surface encounter chance passed to SUB_6B82: 30 science (5E65), 40 espionage (6034) |
| 0xB634 | N x12 | FoundQty! | string at DS 0xB694; FoundQty!; string at DS 0xB6A2 (6117) |
| 0xB638 | N x29 | FoundItem! | ItemName$(FoundItem!) after string at DS 0xB63C (5F11) and cargo prompts (6321, 647F) |
| 0xB6AC | N x3 | BestMember! | member with the best skill (SUB_6152); string at DS 0xB99A; CrewName$(BestMember!) (6D76) |
| 0xB6DA | N x7 | TradeCode! | mission code 150..349 selected for the cargo screen (62C7/62DC): -150 = item to accept, -250 = item awaited |
| 0xB7D6 | N x3 | LastSignalDay! | day of the last decoded signal (6625) |
| 0xB814 | S x5 | Message$ | printed 34 chars per row after part of the string at DS 0xB7DA (675D) |
| 0xB894 | N x24 | TradeItem! | ItemName$(TradeItem!) in the trade prompts (699C, 6A69) |
| 0xB898 | N x22 | Price! | string at DS 0xB8A8; Price!; string at DS 0xB8B8 (697A), part of the string at DS 0xB8EE; Price! (6ABC) |
| 0xB950 | N x7 | Stealth! | 0.2 per item type 3 found, 0.4 if type 4 carried (6C54-6C77): lowers the surprise chance (6D0D) |
| 0xBA28 | N x88 | Rec! | crew record base: G!(Rec!+34) rank, +35 class, +31 status, +10 hit bonus, +11 defence ... (6EE8-75AC) |
| 0xBA36 | N x5 | AgeYears! | = G!(Rec!+29) * 0.005479452 (6F8D): age in years from days (printed INT(AgeYears!); part of the string at DS 0xBA2C) |
| 0xBC02 | N x17 | MaxMove! | string at DS 0xBBE6; MaxMove! (7844); = N_194C! when DefSysCond!=1, then BaseMove! - (>2) - (>4) (8112-814B) |
| 0xBC78 | N x49 | WtSum! | weight accumulator: carried weight of a member (SUB_7BD5), ship cargo weight (SUB_7F9D) |
| 0xBCA4 | N x8 | GunType! | gun type to load (826A) / weapon type in the Rlds list (984F) |
| 0xBD00 | N x35 | ListRow! | LOCATE ListRow!,3 in the equip and gun lists (85A0, 9579, 96E8) |
| 0xBD1A | S x12 | ListLine$ | text of the current equip/weapon list row (861E, 96EB, 9736) |
| 0xBD1E | N x14 | OwnerIdx! | G! index of the owner field of the listed item (842F/84AF/852F): weapons +9, ammo/items +2; cycled 0..8 by A-K (8737-8779) |
| 0xBD6A | N x14 | RescueDays! | = INT(RND*100+50) (8824): string at DS 0xBD7A; INT(RescueDays!); string at DS 0xBD94 |
| 0xBD6E | N x6 | RescueHrs! | accumulated rescue hours (8835) - never read elsewhere in SPACE |
| 0xBD72 | N x3 | RescueCost! | = 20000 credits (883E, 8878) |
| 0xBDBE | N x16 | TotalHrs! | = Hours! + Days!*24 + Years!*8760 + ElapsedHrs! (89A4) |
| 0xBDC6 | N x18 | N! | crew loop counter of SUB_89F8 / SUB_8BC6 |
| 0xBDFA | N x13 | Note! | rising SOUND pitch step of the drop-ship animation (SUB_8F2E) |
| 0xBE06 | N x4 | R! | repeat counter 1..3 in SUB_8F2E |
| 0xBE7C | N x2 | MissionIdx! | index of the active mission flag in G!(110..159) (SUB_90D1) |
| 0xBE80 | N x2 | SizeClass! | SUB_9138: = A_6AD4!(N_B120!) then ON SizeClass! GOTO three planet-sprite formulas |
| 0xBE84 | N x13 | SpriteNo! | ON SpriteNo! GOTO 30 PUT cases (921B) |
| 0xBE9E | N x16 | SpacePos! | INSTR position of the next space in ListLine$ (SUB_95FB word wrap) |

### Arrays (indexed access base addresses)

| base | element size / kinds (uses) | name | evidence |
|---|---|---|---|
| 0x1850 | N x256, S x1, 2601 elements (0..2600) | G! | the 51x51 COMMON single array (CHARINFO.BAS, DS 0x1850); every crew/ship/planet record is G!(index) with computed offsets (see FN_03E2/FN_0414) |
| 0x40F4 | P x1, 202 elements (0..201) | Logo | BLOAD LOGO at &H40F4 (0359); PUT (154,0), Logo, PSET (14B4) |
| 0x4288 | S x13, 9 elements (0..8) | CrewName$ | CHARNAME fields 2..9 (STARTUP: Crew$); printed with string at DS 0xAE7C (25B9), string at DS 0xB186 (436C), string at DS 0xB2EC (4D2C) |
| 0x42AC | S x1, 14 elements (0..13) | Rank$ | string at DS 0xBA12; LEFT$(Rank$(G!(Rec!+34)),10) (6EE8) |
| 0x42E4 | S x1, 16 elements (0..15) | Skill$ | NAME fields 14..29 (STARTUP: Skill$); SPACE prints Skill$(1..12) with dotted leaders under string at DS 0xBAC6 (73FD) |
| 0x4390 | S x1, 25 elements (0..24) | GunName$ | 25 NAME strings (STARTUP: N4390$); printed in the string at DS 0xBE90 list: GunName$(G!(I*7+683) - 1) (95D8) |
| 0x43F4 | S x3, 54 elements (0..53) | WeaponName$ | 54 NAME strings (STARTUP: N43F4$); squad weapon/ammo names in the EQUIPING list (8421 string at DS 0xBD10, 84A1 string at DS 0xBD26) and the string at DS 0xBEA2 list (9953) |
| 0x4534 | S x2, 11 elements (0..10) | MiscItemName$ | 11 NAME strings (STARTUP: N4534$); LEFT$(MiscItemName$(G!(k)-1),16) for the carried items G!(2300..2597) on the squad-member page after INSIDE string at DS 0x946C (7681) and in EQUIPING (8521) |
| 0x4560 | S x7, 100 elements (0..99) | ItemName$ | string at DS 0xB63C ItemName$(n) (5F11), cargo lists (7B48, 6321) |
| 0x47B8 | S x2, 23 elements (0..22) | ShipType$ | LEFT$(ShipType$(G!(..)),10) in the KILL LIST / TOW LIST (54B1, 55ED) |
| 0x4814 | S x2, 23 elements (0..22) | EquipName$ | printed after CondMark$ in the repair / inspect-ship lists (4537, 78E5) |
| 0x4870 | S x2, 7 elements (0..6) | AttrName$ | attribute names with dotted leaders and G!(I+Rec!) values (7043) |
| 0x4890 | P x1 | HdrGalaxyScan | SPACESH array 0 (92x7 "GALAXY SCAN" label, file offset 7): BLOAD SPACESH.BAS at &H4890 (023A); PUT (32,0) at 32F1 in the galaxy scan |
| 0x4936 | P x1 | HdrLongRange | SPACESH array 1 (92x7 "LONG RANGE", offset 173 = 0x4936-0x4890+7): PUT (32,0) at 263B (SUB_2626, sector-map view) |
| 0x49DC | P x1 | HdrSectorScan | SPACESH array 2 (92x7 "SECTOR SCAN", offset 339): PUT (32,0) at 2ADC (SUB_2ACA) |
| 0x4A82 | P x1 | HdrSystemScan | SPACESH array 3 (92x7 "SYSTEM SCAN", offset 505): PUT (32,0) at 389D |
| 0x4B28 | P x3 | HdrVisual | SPACESH array 4 (92x7 "VISUAL", offset 671): PUT (32,0) at 2C1C (black hole), 34B5 (starport), 575D (planet) |
| 0x4BCE | P x3 | Digit1 | SPACESH array 5 (4x5 digit "1", offset 837): PUT by SUB_2056 case 1 and case 7 (PSET then XOR = erase) |
| 0x4BD8 | P x1 | Digit2 | SPACESH array 6 (digit "2", offset 847): SUB_2056 case 2 |
| 0x4BE2 | P x1 | Digit3 | SPACESH array 7 (digit "3", offset 857): SUB_2056 case 3 |
| 0x4BEC | P x1 | Digit4 | SPACESH array 8 (digit "4", offset 867): SUB_2056 case 4 |
| 0x4BF6 | P x1 | Digit5 | SPACESH array 9 (digit "5", offset 877): SUB_2056 case 5 |
| 0x4C00 | P x1 | Digit6 | SPACESH array 10 (digit "6", offset 887): SUB_2056 case 6 |
| 0x4C0A | P x1 | Blip3 | SPACESH array 11 (8x8 icon, offset 897): PUT in the sector scan for pixel colour 3 (3058) |
| 0x4C1E | P x1 | Blip2 | SPACESH array 12 (8x8 icon, offset 917): sector scan, pixel colour 2 (303E) |
| 0x4C32 | P x1 | Blip1 | SPACESH array 13 (8x8 icon, offset 937): sector scan, pixel colour 1 (2FF5) |
| 0x4C46 | P x1 | BlackHoleMark | SPACESH array 14 (8x8 icon, offset 957): PUT (72,72) XOR at 2DDF when the sector code is a black hole (> 777) |
| 0x4C5A | P x2 | Cursor | SPACESH array 15 (26x24 arrows, offset 977): PUT (240,156)/(156,156) XOR beside the SELECT prompt (1B8B, 30F7) |
| 0x4D06 | P x6 | PlanetMark | PUT (x, PicOff!), A_4D06, XOR in the sector scan (2819, 28F0, 31F8): SPACESH offset 0x476 = 1142 -> array 16 (16x16 box at 1149) |
| 0x4D4A | P x1 | Star1 | SPACESH array 17 (24x24, offset 1217): PUT (64,72) in the system scan when the star class N_AFDA! = 1 (3DB4) |
| 0x4DDE | P x1 | Star2 | SPACESH array 18 (24x24, offset 1365): star class 2 (3DDB) |
| 0x4E72 | P x1 | Star3 | SPACESH array 19 (24x24, offset 1513): star class 3 (3DF4) |
| 0x4F06 | P x4 | Starfield | PUT (28,28)/(28,40)/(28,12), A_4F06, XOR: SPACESH offset 0x4F06-0x4890 = 0x676 = 1654 -> array 20 (104x104 star-field viewport at file offset 1661) |
| 0x599A | P x1 | DropShip1 | SPACESH array 21 (28x6, offset 4369): drop-ship launch animation frame 1, PUT (56,12) at 8E54 (SUB_8D15) |
| 0x59C8 | P x1 | DropShip2 | SPACESH array 22 (52x19, offset 4415): frame 2, PUT (44,12) 8E6D |
| 0x5AC4 | P x1 | DropShip3 | SPACESH array 23 (52x32, offset 4667): frame 3, PUT (44,12) 8E86 |
| 0x5C68 | P x1 | DropShip4 | SPACESH array 24 (36x32, offset 5087): frame 4, PUT (52,19) 8E9F |
| 0x5D8C | P x1 | DropShip5 | SPACESH array 25 (24x24, offset 5379): frame 5, PUT (56,33) 8EB8 |
| 0x5E20 | P x1 | DropShip6 | SPACESH array 26 (16x13, offset 5527): frame 6, PUT (60,46) 8ED1 |
| 0x5E58 | P x1 | DropShip7 | SPACESH array 27 (12x10, offset 5583): frame 7, PUT (64,52) 8EEA |
| 0x5E7C | P x1 | Planet28 | SPACESH array 28 (20x20 planet, file offset 5619): PUT (CurX!,CurY!) XOR in SUB_9138 case 1 |
| 0x5EE4 | P x1 | Planet29 | SPACESH array 29 (20x20 planet, file offset 5723): PUT (CurX!,CurY!) XOR in SUB_9138 case 2 |
| 0x5F4C | P x1 | Planet30 | SPACESH array 30 (20x20 planet, file offset 5827): PUT (CurX!,CurY!) XOR in SUB_9138 case 3 |
| 0x5FB4 | P x1 | Planet31 | SPACESH array 31 (20x20 planet, file offset 5931): PUT (CurX!,CurY!) XOR in SUB_9138 case 4 |
| 0x601C | P x1 | Planet32 | SPACESH array 32 (20x20 planet, file offset 6035): PUT (CurX!,CurY!) XOR in SUB_9138 case 5 |
| 0x6084 | P x1 | Planet33 | SPACESH array 33 (20x20 planet, file offset 6139): PUT (CurX!,CurY!) XOR in SUB_9138 case 6 |
| 0x60EC | P x1 | Planet34 | SPACESH array 34 (20x20 planet, file offset 6243): PUT (CurX!,CurY!) XOR in SUB_9138 case 7 |
| 0x6154 | P x1 | Planet35 | SPACESH array 35 (20x20 planet, file offset 6347): PUT (CurX!,CurY!) XOR in SUB_9138 case 8 |
| 0x61BC | P x1 | Planet36 | SPACESH array 36 (20x20 planet, file offset 6451): PUT (CurX!,CurY!) XOR in SUB_9138 case 9 |
| 0x6224 | P x1 | Planet37 | SPACESH array 37 (20x20 planet, file offset 6555): PUT (CurX!,CurY!) XOR in SUB_9138 case 10 |
| 0x628C | P x1 | Planet38 | SPACESH array 38 (16x16 planet, file offset 6659): SUB_9138 case 11 (+2,+2 offset) |
| 0x62D0 | P x1 | Planet39 | SPACESH array 39 (16x16 planet, file offset 6727): SUB_9138 case 12 (+2,+2 offset) |
| 0x6314 | P x1 | Planet40 | SPACESH array 40 (16x16 planet, file offset 6795): SUB_9138 case 13 (+2,+2 offset) |
| 0x6358 | P x1 | Planet41 | SPACESH array 41 (16x16 planet, file offset 6863): SUB_9138 case 14 (+2,+2 offset) |
| 0x639C | P x1 | Planet42 | SPACESH array 42 (16x16 planet, file offset 6931): SUB_9138 case 15 (+2,+2 offset) |
| 0x63E0 | P x1 | Planet43 | SPACESH array 43 (16x16 planet, file offset 6999): SUB_9138 case 16 (+2,+2 offset) |
| 0x6424 | P x1 | Planet44 | SPACESH array 44 (16x16 planet, file offset 7067): SUB_9138 case 17 (+2,+2 offset) |
| 0x6468 | P x1 | Planet45 | SPACESH array 45 (16x16 planet, file offset 7135): SUB_9138 case 18 (+2,+2 offset) |
| 0x64AC | P x1 | Planet46 | SPACESH array 46 (16x16 planet, file offset 7203): SUB_9138 case 19 (+2,+2 offset) |
| 0x64F0 | P x1 | Planet47 | SPACESH array 47 (16x16 planet, file offset 7271): SUB_9138 case 20 (+2,+2 offset) |
| 0x6534 | P x1 | Planet48 | SPACESH array 48 (8x8 planet, file offset 7339): SUB_9138 case 21 (+6,+6 offset) |
| 0x6548 | P x1 | Planet49 | SPACESH array 49 (8x8 planet, file offset 7359): SUB_9138 case 22 (+6,+6 offset) |
| 0x655C | P x1 | Planet50 | SPACESH array 50 (8x8 planet, file offset 7379): SUB_9138 case 23 (+6,+6 offset) |
| 0x6570 | P x1 | Planet51 | SPACESH array 51 (8x8 planet, file offset 7399): SUB_9138 case 24 (+6,+6 offset) |
| 0x6584 | P x1 | Planet52 | SPACESH array 52 (8x8 planet, file offset 7419): SUB_9138 case 25 (+6,+6 offset) |
| 0x6598 | P x1 | Planet53 | SPACESH array 53 (8x8 planet, file offset 7439): SUB_9138 case 26 (+6,+6 offset) |
| 0x65AC | P x1 | Planet54 | SPACESH array 54 (8x8 planet, file offset 7459): SUB_9138 case 27 (+6,+6 offset) |
| 0x65C0 | P x1 | Planet55 | SPACESH array 55 (8x8 planet, file offset 7479): SUB_9138 case 28 (+6,+6 offset) |
| 0x65D4 | P x1 | Planet56 | SPACESH array 56 (8x8 planet, file offset 7499): SUB_9138 case 29 (+6,+6 offset) |
| 0x65E8 | P x1 | Planet57 | SPACESH array 57 (8x8 planet, file offset 7519): SUB_9138 case 30 (+6,+6 offset) |
| 0x65FC | P x1 | ShipHead0 | SHIP-n.BAS bank (BLOAD at &H65FC, 028B): heading 0 sprite, PUT (264,24) at 1D32 (SUB_1CE3) |
| 0x6690 | P x1 | ShipHead1 | SHIP-n.BAS heading 1 (1D4C) |
| 0x6724 | P x1 | ShipHead2 | SHIP-n.BAS heading 2 (1D66) |
| 0x67B8 | P x1 | ShipHead3 | SHIP-n.BAS heading 3 (1D80) |
| 0x684C | P x1 | ShipHead4 | SHIP-n.BAS heading 4 (1D9A) |
| 0x68E0 | P x1 | ShipHead5 | SHIP-n.BAS heading 5 (1DB4) |
| 0x6974 | P x1 | ShipHead6 | SHIP-n.BAS heading 6 (1DCE) |
| 0x6A08 | P x1 | ShipHead7 | SHIP-n.BAS heading 7 (1DE8) |
| 0x6AD4 | N x12 | OrbitClass! | (0..9) planet size class per orbit: 0 none, 1 (3997), 2 (39E9), 3 (3A48); SizeClass! = OrbitClass!(OrbitNo!) in SUB_9138 |
| 0x6AFC | N x38 | PlGravity! | (0..9) gravity: class 1 RND*2+1, class 2 RND+.2, class 3 RND*.5+.01 (3B03-3BBE); string at DS 0xB536 (59D3), sprite index in SUB_9138, Gravity10! for PLBATTLE |
| 0x6B24 | N x21 | PlDensity! | (0..9) density (3B1E/3B8D/3BD7): string at DS 0xB554 (5A48); diameter = gravity/density (597F); trade branch (6892/68AD) |
| 0x6B4C | N x7 | PlanetNo! | (0..9) running planet number per occupied orbit (3AA4); printed string at DS 0xB49E; LEFT$(STR$(-PlanetNo!(Idx!)),2) (576B) |
| 0x6B7C | N x24 | PlSurface! | (0..9) surface type 0..4 = Surface$ (5B68): class 1 -> 0 Gas, class 2 -> 1..4, class 3 -> 4+4*(RND < gravity-.2) (3B48-3BF5); 2/3 = breathable (591F) |
| 0x6BAC | N x14 | PlLife! | (0..9) life code: 10*tech + form (3C96 = 10..29, 3CB9 = 4-Zone!, ...); tech = INT(PlLife!/10) - (PlLife!>0) -> TechLevel$, form -> LifeForm$ (5A83-5B2D) |
| 0x6BD4 | N x7, S x1 | OrbitDX! | DATA 186 pairs (0,-3),(3,-1)... first of pair (00A6) |
| 0x6BFC | N x7, S x1 | OrbitDY! | DATA 186 pairs, second of pair (00AF) |
| 0x6C30 | S x2, N x1 | TechLevel$ | READ from DATA 349 items 1-4 (None,Hi-Tech,No-Tech,Lo-Tech); string at DS 0xB568; TechLevel$(..) (5AF6) |
| 0x6C40 | S x2, N x1 | LifeForm$ | DATA 349 items 5-15 (Machine..Avain) printed under LIFE (5B2D) |
| 0x6C6C | S x2, N x1, 6 elements (0..5) | Surface$ | DATA 349 items 16-20 (Gas,Inferno,Warm,Cool,Cold) printed after string at DS 0xB572 (5B68) | extent: 6 elements (0..5) - READ Surface$(1..5) (0152); element 0 unused |
| 0x6C9E | N x2, 32 elements (0..31), 2-D (first dimension 16) | PixObj! | 2-D (16 x 2) contact number per cell pixel (2EA0); = StarNo! at the cursor (3E35) | extent: 32 elements (0..31) - 2-D 16 x 2 (128 bytes up to PixColor! at 0x6D1E) |
| 0x6D1E | N x7, 32 elements (0..31), 2-D (first dimension 16) | PixColor! | 2-D (16 rows x 2 words) colour 0..3 of each pixel of the current map cell (2F40); 0 = empty (3460); 1..3 select Blip1..3; = star class in the system scan (N_AFDA!) | extent: 32 elements (0..31) - 2-D 16 x 2 (128 bytes up to PixCol! at 0x6D9E) |
| 0x6D9E | N x8, 32 elements (0..31), 2-D (first dimension 16) | PixCol! | 2-D (16 x 2) pixel column 0..7 inside the word (2F72): 3-K! for K!<4 else 11-K! | extent: 32 elements (0..31) - 2-D 16 x 2 (128 bytes up to HeadX% at 0x6E1E) |
| 0x6E1E | I x2, N x1, S x1, 8 elements (0..7) | HeadX% | DATA 446 pairs (46,91),(60,95)...: 8 compass positions, x (01AA) | extent: 8 elements (0..7) - 8 compass positions (01AA READ loop); HeadY% starts at 0x6E2E = 0x6E1E + 8*2 |
| 0x6E2E | I x2, N x1, S x1, 8 elements (0..7) | HeadY% | DATA 446 pairs, y (01B3) | extent: 8 elements (0..7) - 8 compass positions; J! starts at 0x6E3E = 0x6E2E + 8*2 |
| 0x6E46 | S x1, 4 elements (0..3) | ZoneTag$ | "A","B","N","?" (01D5-01F0) printed after ") ZN:" (2938) | extent: 4 elements (0..3) - zones 0..3 (A/B/N/?); GalMap starts at 0x6E56 = 0x6E46 + 4*4 |
| 0x6E56 | P x1 | GalMap | BLOAD GALMAP.BAS at &H6E56 (0210); PUT (16,16) (3302) |
| 0x7E5A | P x2 | SaveArea | GET (15,8)-(143,144) scratch buffer (8E04) restored by PUT (15,8) PSET (8F2A) around the drop-ship animation |
| 0x9008 | P x3, I x1 | PicBuf | shared 128x128 picture buffer at DS 0x9008: BLOAD target of MAP-n.BAS (2705, PUT (16,16)), SPPIC-n.BAS (3512, PUT (40,56)), SPSTGRPH.BAS (37D1, PUT (40,48)); its pixel words are read back as the sector map (PicBuf(idx) at 2E36) |
| 0xA00C | I x2 | Galaxy% | BLOAD GALAXY.BAS at &HA00C (0225): 32x32 int16 sector grid; read as Galaxy%(SectorIdx!) at 2913/2B97 (zone = value \ 10000, code = value MOD 10000) |
| 0xA974 | S x3, 3 elements (0..2) | Status$ | string at DS 0xA980,string at DS 0xA988,string at DS 0xA990 (0294-02A6), printed from G! fields (1AE1, 4C32, 6F90) | extent: 3 elements (0..2) - status codes 0..2 |
| 0xA998 | S x5, 9 elements (0..8) | SlotTag$ | string at DS 0xA9D0,"P","C","1part of the string at DS 0xBA5C6" (02E8-0309): crew slot tags printed before ">" (15DF, 4BAC) | extent: 9 elements (0..8) - (0) "SH", (1) "P", (2) "C", (3..8) CHR$(I+46) = the member digits (02C1 loop FOR I! = 3 TO 8) |
| 0xA9D6 | S x1, 3 elements (0..2) | ClassName$ | string at DS 0xA9E2,string at DS 0xA9EC,string at DS 0xA9F6 (0312-0324) printed as string at DS 0xBA1C (6F30) | extent: 3 elements (0..2) - classes 0..2 (0312-0324) |
| 0xAA02 | S x2, 4 elements (0..3) | CondMark$ | "-","*","#" (032D-033F): condition marks, "*-Broken #-Unfixable" (4574) | extent: 4 elements (0..3) - equipment conditions 1 ok / 2 broken / 3 unfixable -> elements 1..3 = "-" / "*" / "#" (032D-033F, read by CondMark$(G!(slot)) at 4537/78E5 with base 0xAA02: `add bx,0xAA02` at 04554/078F1); element 0 unused |
| 0xAA38 | S x1, 3 elements (0..2) | PortName$ | string at DS 0xAA44, string at DS 0xAA4E, string at DS 0xAA5A (03CA-03DC) printed under string at DS 0xAFFA (3537) | extent: 3 elements (0..2) - starports 0..2 (03CA-03DC) |

## Unknowns (runtime calls not rendered)

| routine | uses | sites |
|---|---|---|
