# INSIDE — BASIC-style pseudocode (lane mod-inside)

Evidence: `decode/listings/INSIDE.lst` (regenerated after rt-naming), `decode/data/tools/_INSIDE.json` (string/number literal table, DATA records, LINES table of `decode/data/MODULE_CONSTANTS.md` section INSIDE.EXE), `decode/brun30/RT_LEDGER.md`, `decode/data/DATA_FILES.md` / `SPRITES.md` (IN-n, INMAP-n, MES-n, INSH, NAME), the NAME file itself for the string-array indices; all read 2026-10-15. The codex draft `INSIDE.draft.md` was used as a scaffold only; every statement below was re-derived from the listing by `decode/pseudo/tools/qb2bas.py`:

```
python decode/pseudo/tools/qb2bas.py decode/listings/INSIDE.lst decode/data/tools/_INSIDE.json decode/pseudo/INSIDE.bas.md --title INSIDE --names decode/pseudo/INSIDE_names.json --end 71E3 --tempbase 8968
```

(run twice so that the INPUT-type pre-pass sees the variable kinds; `--end 71E3` stops at the last reachable instruction, the 13 bytes 71E3..71EF have no incoming edge and the metadata block 22 starts at 71F0; `--tempbase 8968`: the compiler's temp slot T0 is DS 0x8968 — proven by `RT3F_71 #80` at 060EF followed by `mov dx,0x8968` as the PUT y operand at 06104, and T1 = 0x8970 at 04CA2.)

## Conventions

- Every statement carries its listing offset; `L_XXXX:` = jump target, `SUB_XXXX:` = near-call target (GOSUB). `GOTO`/`IF ... THEN GOTO` are the compiled jumps; FOR/NEXT are reconstructed from the compiled counter-store/compare pattern (three shapes: short `jbe BODY`, long `ja +3 / jmp BODY`, and variable STEP with the sign test). Translator convention (all modules): the `FOR x = a TO b` line never shows the step; a non-unit or variable step is printed on the matching `NEXT x STEP s` line.
- Names come from `INSIDE_names.json` (every name has an `_why` evidence entry, listing offsets in hex). Unnamed items keep `N_xxxx!` (single at DS xxxx), `S_xxxx$`, `A_xxxx!(i)`. `G!()` is the 51x51 COMMON array (CHARINFO.BAS at DS 0x1850); DS addresses below 0x40F4 are its elements, index = (addr - 0x1850) / 4, so `DriveCfg!` = G!(85), `UseEGA!` = G!(89), `StdDelay!` = G!(86), `Delay!` = G!(88), `CreditsHi!/CreditsLo!` = G!(78)/G!(79), `SectorX!` = G!(2216), `InBattle!` = G!(2255), `Breathable!` = G!(2252), and the four values handed to PLBATTLE are G!(2214), G!(2228), G!(2229), G!(2260).
- DEF FN bodies (the five one-expression subroutines at 0359..0426) are inlined at their call sites as `FNCrew(member, field)`, `FNIdx(member, field)`, `FNRoom(room, field)`, `FNRoomIdx(room, field)`, `FNCell(0)`; the compiled form is `argument stores ; call ; FAC`. `FNCrew` addresses the squad records at 1500 + member*100 (member 1..6), which are the ship crew slots 3..8 of SPACE's `FNCrew` (1300 + crew*100): the module shifts `CrewName$` by two on entry (0303) and back before every CHAIN (SUB_4F07).
- Conditions: `(a > b)` as a value is the BASIC boolean -1/0; `IF NOT (...) THEN GOTO` is the compiled "skip" form (the source probably read `IF ... THEN <block>`).
- `' with FAC = ...` on a RETURN = the value a DEF FN body leaves in the accumulator.
- Runtime-call semantics are the ledger's; nothing in this module is unrendered (see Unknowns / open questions below).

## Module structure (offsets)

| range | content |
|---|---|
| 0040-00B3 | `Drive$` from `DriveCfg!`, `Enclosure$(0..2)`, `SndDur!`, `BLOAD INSH.BAS` to &H82D6 |
| 00BC-0356 | standalone-test loading guarded by `TestMode!` (always 0 at run time, see names): CHARINFO, LOGO, NAME (Rank$ 1..13, Skill$ 0..15, skip 130, MiscItemName$ 0..10, skip 197, AttrName$ 0..6), CHARNAME; the normal path only shifts `CrewName$` by two (0303) |
| 0359-0426 | the DEF FN bodies (FNCrew, FNIdx, an unused FNKey copy at 03A7, FNRoom, FNRoomIdx, FNCell) |
| 0427-068B | `TestMode!`-only debug initialisation ("Change things?") |
| 068E-07F9 | `RANDOMIZE TIMER`, frame (SUB_0DEE), `Location!`/`StartX!`/`StartY!` from `SectorX!`: <=5 -> 4 (17,0); 6 -> 7 (18,0); 7..10 -> 5 (25,0); 11..14 -> 3 (4,3); 15..18 -> 6 (3,8); 19..30 -> 1 (18,8); >30 -> 2 (9,28) |
| 07F9-0829 | fresh entry (`InBattle!` = 0): load the location (SUB_63F9) ; return from PLBATTLE: read MES-n only (SUB_6473) and restore the map |
| 0829-0CDF | `Breathable!` (0 for locations 3 and 6, 1 elsewhere); the atmosphere/oxygen check runs only on a fresh entry (InBattle! = 0) when it is 0 (088F): members need items 10, 8 and 9 (flags in fields 33/56/40, product -> field 40); "Atmosphere Unbreathable", list of members with oxygen, "Some squad members have no oxygen source. Will you continue? (Y/N)": N -> save names and `CHAIN SPACE.STR`, Y -> every living member without oxygen takes 999 hits (dies) |
| 0CDF-0DEB | READ `OpLen%(0..26)` and `OptionName$(1..22)`; position: fresh entry -> `StartX!/StartY!`; back from battle (`InBattle!`): `BattleWon!` = 0 -> back to `OldX!/OldY!` (0D51-0D68), nonzero -> stay and mark the room's enemy group -1 (cleared, 0D86-0DA4) |
| 0DEE-0FFA | SUB_0DEE: the screen frame |
| 0FFB-1707 | helper subroutines (delays, member picker, key readers, line editor, panel clears, map save/restore) |
| 1707-17A8 | SUB_1707 item search; 17AF-1ABC unreachable leftover (derives a member's stats) |
| 1ABD-2407 | Y/N, room drawing (SUB_1B23 + the 64-case tile PUT SUB_1CEA) |
| 2408-2650 | main loop head: command list, cursor, `RoomNo!`, passability digits, key dispatch `ON Cmd! GOTO` (Up/Left/Right/Down, C E F G I M R S T U V) |
| 2650-2830 | new room: `Enclosure$`, room text (14-char rows), draw if unmapped, enemies -> 64E4, script -> 6BF2, else 34C5 |
| 2830-2F18 | the four moves (blocked -> SOUND 900) and the trap event (radiation 1..3 / explosive 4..6; detection by the radiation detector or a Scout roll; disarm by `Scout!`) |
| 2F18-34B7 | the vault door (A-Leave, B-Use Torch, C-Fire At Door, D-Pick Lock) |
| 34B7-35BD | room bookkeeping, "The Exit" (Y -> save names, BSAVE IN-n/INMAP-n, `CHAIN SPACE.STR`), 1% random encounter per step (TestMode 0) |
| 35C0-37C0 | G-Switch: exchange two members' records, names and item ownership |
| 37C3-3C53 | F-Fix Items: best Ship Repair member, repair kit (item 2), armour (fields 48/49/55) and weapons (ammo field -1 broken -> -2 unfixable / 0 fixed), summary |
| 3C56-41B5 | M-Medical: A-Squad Health table, B-Heal Member (best Medical, medkit item 1, +4 HP or full, 20% medkit used up) |
| 41B8-4B2D | I-Inspect: page 1 stats, page 2 skills, page 3 armour/items/weapons (SUB_4B30 recomputes weight and movement) |
| 4F07-4F7D | SUB_4F07 un-shift names |
| 4F7E-53D7 | E-Equip: EQUIPING list of weapons (800+12k, owner > 2), ammo ("Ammo For "), items; A-R changes an item's owner 3..8 |
| 53DA-5741 | V-View: a member with esper level >= 7 and field 54 > 0 (decremented), 10 sounds, map flashed with PRESET, rooms within 2 cells revealed, "Beings!" / "No Life" |
| 5744-597B | detector sweep animations (radiation: top/bottom edge, motion: left/right edge) |
| 597C-5D4D | C-Change Wep.: cycle through the member's weapons with SPACE, ENTER selects (field 32; field 37 = 3 when changed) |
| 5D4E-5EF0 | R-Reload all weapons with ammo 0 from matching ammo items |
| 5EF1-5F67 | S-Search: "You Find Nothing Unusual" unless the room has a script (-> 6BF2) |
| 5F6A-60BB | U-Use: A/B activate the motion (items 3/4) or radiation (item 11) detector |
| 60BE-6216 | SUB_60BE background tick (detectors + squad marker), SUB_6169 best Scout |
| 6217-6386 | SUB_6217 damage/death, "You Are All Dead" (endless loop) |
| 6387-64E2 | save/load the location files, read MES-n |
| 64E4-6655 | encounter: surprise roll `RND*100 < 50 - MotDetOn!*20 + enclosure*20` (0 confrontation / 1 you surprise / 2 enemies surprise, random +0..1 with a 3 folded to 0), then `CHAIN PLBATTLE.EXE` |
| 6658-6891 | spacebar wait, reload counts, list-line word wrap |
| 6892-695F | T-Time Delay: standard/current/new delay (1..9999) |
| 6962-6BF1 | SUB_6962 option picker + typed single word |
| 6BF2-71E0 | the interaction-script interpreter (see the opcode table) |

## Data formats found here (for DATA_FILES.md)

- **IN-n.BAS** (`InMap%`, BLOAD at &H48B0, BSAVEd back with 5502 bytes = 2751 words when the player takes the exit): words 0..1368 = 37x37 cells, index `y*37 + x`, value `room*64 + tile`; words 1369.. = room records of 11 words at `1369 + room*11`: 0 trap level (1..3 radiation, 4..6 explosive), 1 enemy group (-1 none; >= 0 -> PLBATTLE), 2 script pointer (0 none; negative = one-shot), 3 MES-n line number of the description, 4 enclosure 0..2, 5 mapped flag, 6 vault door strength (sign flips after a failed pick), 7..10 rectangle x0 y0 x1 y1; scripts follow (see opcodes); words 1930..1932 = random-encounter enemy groups. The explored flags and consumed one-shot scripts are saved into the file, so the shipped IN-n files carry state.
- **INSH.BAS** (`TilePass%`, BLOAD at &H82D6, 1228 bytes): words 0..63 = 4-digit decimal code of the blocked directions of tile 0..63 (a SET digit blocks the move: thousands = down, hundreds = up, tens = right, units = left; 0 = open on all sides; polarity verified at 2833-285A: nonzero -> SOUND 900, zero -> move), then 64 GET arrays of 14 bytes (5x5 CGA tiles) at 0x8356 + 14*t, the 24x28 command-panel cursor at 0x86D6 (PUT (280,144) XOR), and two 8x6 detector blips at 0x8782 / 0x8792. Tile 42 doubles as the squad marker (PUT (x*5+8, y*5+7) XOR), 34/35 are the vault door, 36..40 traps, 41 the exit.
- **INMAP-n.BAS** (`MapPic`, BLOAD at &H5E2E): the 185x185 picture of the map area (8,7)-(192,191); redrawn rooms are BSAVEd back (8700 bytes).
- **MES-n**: one line per room (index = room field 3), 14-character cells; a 3-letter line at index k is a typed-command keyword giving `Option!` = k + 100; lines 0..100 are searched.
- **Script opcodes** (`InMap%` words from the room's field 2; `OpLen%` = words per opcode from DATA line 3331; arguments are the following words):

| op | len | effect (label) |
|---|---|---|
| 0 | 1 | nothing (6BF8) |
| 1 | 2 | battle with enemy group Arg1, `Surprise!` = 0 (6D30 -> SUB_656F) |
| 2 | 2 | show `MesLine$(Arg1)` in the map panel, 23 chars per row (6D59) |
| 3 | 3 | `G!(Arg1) = Arg2` (6E46) |
| 4 | 3 | `X! = Arg1: Y! = Arg2` (6E5F) |
| 5 | 3 | `InMap%(Arg1) = Arg2` (6E74) |
| 6 | 2 | credits + Arg1 (6E8D) |
| 7 | 3 | every living member: field Arg1 + Arg2 (6E9C) |
| 8 | 2 | `IF G!(Arg1+109) = 1 THEN G!(Arg1+109) = 2` (6F2E) |
| 9 | 1 | option picker (6F5A -> SUB_6962) |
| 10 | 2 | "Nothing unusual happens", jump to Arg1 (6F60) |
| 11 | 2 | "Not valid or possible", jump to Arg1 (6F87) |
| 12 | 2 | "What?", jump to Arg1 (6FAE) |
| 13 | 3 | `IF Option! = Arg1 THEN` jump to Arg2 (6FD5) |
| 14 | 2 | jump to Arg1 (6FEF) |
| 15 | 3 | `IF RND*100 < Arg1 THEN` jump to Arg2 (6FFB) |
| 16 | 4 | `IF G!(Arg1) <= Arg2 THEN` jump to Arg3 (701B) |
| 17 | 4 | `IF G!(Arg1) >= Arg2 THEN` jump to Arg3 (7042) |
| 18 | 1 | "Enter Amount:" -> `Amount!` (7069) |
| 19 | 3 | `IF Amount! >= Arg1 THEN` jump to Arg2 (7097) |
| 20 | 2 | credits + Arg1 * `Amount!` (70B1) |
| 21 | 3 | `IF credits >= Arg1 THEN` jump to Arg2 (70C6) |
| 22 | 1 | end: restore the map, back to the command loop (70EC) |
| 23 | 2 | as 2 plus "Press ENTER" (70F2) |
| 24 | 2 | every living member takes INT(RND*Arg1 + 1) hits (70F5) |
| 25 | 1 | `X!, Y! = OldX!, OldY!` (71A0) |
| 26 | 2 | unmap room Arg1 and force a redraw (71B5) |

A negative opcode word marks a one-shot instruction: after it is read the whole instruction is zeroed (6C75-6CB6) and the saved IN-n file keeps it zeroed.

## Dead / unreferenced code

- 03A7-03C5: a DEF FN body `INT(CreditsHi!*30000 + CreditsLo! + .5)` (SPACE's FNKey) with no caller.
- 01067-01082 ("Select Option" + key wait), 0154E-01551 (LINE), 017AF-01ABC (member stat derivation using DbgEsper!): no label reaches them (they follow a RETURN); compiler leftovers of removed GOSUBs.
- 0427-068B, 00BC-0300, 27CD, 6D3E: reachable only with `TestMode!` <> 0, which nothing sets.
- 71E3-71EF: 13 bytes after the last `GOTO L_6BF8`, no incoming edge (not rendered).

## LINES table

The module's LINES block maps source line numbers to offsets: lines 1/3/10 -> 0040, 20 -> 00BC, 30 -> 00C2, 40 -> 00EE, 100 -> 00FB, 300 -> 0118. Only these early lines are recorded (the table has 8 entries), consistent with `ON ERROR`-style references in the source; no line numbers are invented elsewhere.

## Unknowns / open questions

- No runtime call is unrendered (the generated Unknowns table at the end of this file is empty).
- `BattleWon!` (G!(2254), PLBATTLE 430D = credits gained or a surrender): read once after a return from PLBATTLE (0D51, `FCMP [3B88] ? 0; je 0D56`): 0 -> the squad is put back on `OldX!/OldY!`, nonzero -> it stays on the encounter cell and the room is marked (0D6B-0DA4). (Polarity corrected 2026-10-18, glm-review-crossref D1.)
- `N_3B78!` (G!(2250)) is set to 10 for locations 4 and 1 and never read here (PLBATTLE reads it as the gravity x10); `N_9018!` is incremented by Fix and never read.
- `Breathable!` (G!(2252)) is 0 for locations 3 and 6 and 1 elsewhere; the atmosphere/oxygen screen runs only on a fresh entry (`InBattle!` = 0) when it is 0 (088F); PLBATTLE prints "Breathable" for 1, so the polarity is proven there.
- `GunName$` (A_43F4) is a COMMON string array loaded by STARPORT/PLBATTLE (NAME items 81..134).
- `FOR I! = FirstRow! TO LastRow!` at 2717: `FirstRow!` (0x8D82) is never assigned; the loop starts at 0 at run time.
- The unreachable blocks listed under "Dead / unreferenced code" are rendered but not reachable.

## Pseudocode

```basic
00046  Drive$ = ""
00052  IF DriveCfg! <> 1 THEN GOTO L_0060
L_0057:
0005A  Drive$ = "A:"
0005D  GOTO L_0077
L_0060:
00069  IF DriveCfg! <> 2 THEN GOTO L_0077
L_006E:
00074  Drive$ = "B:"
L_0077:
0007D  Enclosure$(0) = "   Enclosed  "
00086  Enclosure$(1) = "Semi-Enclosed"
0008F  Enclosure$(2) = "     Open    "
0009E  SndDur! = 1 - SoundOff!
000B3  BLOAD Drive$ + "INSH.BAS", &H82D6
000BC  IF TestMode! = 0 THEN GOTO L_00D0
L_00C1:
000CD  BLOAD "CHARINFO", &H1850
L_00D0:
000D6  Status$(0) = "Dead"
000DF  Status$(1) = "Okay"
000E8  Status$(2) = "Rad"
000F1  IF TestMode! = 0 THEN GOTO L_0303
L_00F6:
00102  BLOAD "LOGO", &H40F4
00112  OPEN "NAME" FOR INPUT AS #1
0011B  FOR I! = 1 TO 13
L_011E:
00121  INPUT #1, Rank$(CINT(I!))
00146  NEXT I!
0015C  FOR I! = 0 TO 15
L_0160:
00163  INPUT #1, Skill$(CINT(I!))
00188  NEXT I!
0019E  FOR I! = 0 TO 129
L_01A2:
001A5  INPUT #1, K$
001BC  NEXT I!
001D2  FOR I! = 0 TO 10
L_01D6:
001D9  INPUT #1, MiscItemName$(CINT(I!))
001FE  NEXT I!
00214  FOR I! = 1 TO 196
L_0218:
0021B  INPUT #1, K$
00232  NEXT I!
00248  FOR I! = 0 TO 6
L_024C:
0024F  INPUT #1, AttrName$(CINT(I!))
00274  NEXT I!
00287  CLOSE #1
00297  OPEN "CHARNAME" FOR INPUT AS #1
0029D  INPUT #1, ShipName$, CrewName1$, CrewName2$
002BF  FOR I! = 1 TO 6
L_02C2:
002C5  INPUT #1, CrewName$(CINT(I!))
002EA  NEXT I!
002FD  CLOSE #1
00300  GOTO L_0356
L_0303:
00309  FOR I! = 1 TO 6
L_030C:
0033B  SWAP CrewName$(CINT(I! + 2)), CrewName$(CINT(I!))
00346  NEXT I!
L_0356:
00356  GOTO L_0388
SUB_0359:
00387  RETURN   'with FAC = INT(G!(CINT(FnMember! * 100 + FnField! + 1500)) + 0.1)
L_0388:
00388  GOTO L_03A7
SUB_038B:
003A6  RETURN   'with FAC = INT(FnIMember! * 100 + FnIField! + 1500.5)
L_03A7:
003A7  GOTO L_03C6
003C5  RETURN   'with FAC = INT(CreditsHi! * 30000 + CreditsLo! + 0.5)
L_03C6:
003C6  GOTO L_03ED
SUB_03C9:
003EC  RETURN   'with FAC = InMap%(CINT(FnRoom! * 11 + FnRField! + 1369))
L_03ED:
003ED  GOTO L_0406
SUB_03F0:
00405  RETURN   'with FAC = FnRoom2! * 11 + FnRField2! + 1369
L_0406:
00406  GOTO L_0427
SUB_0409:
00426  RETURN   'with FAC = InMap%(CINT(Y! * 37 + X!))
L_0427:
0042D  IF TestMode! = 0 THEN GOTO L_068E
L_0432:
00432  GOSUB SUB_14CA
0043E  LOCATE 20, 2
00441  PRINT "Change things? ";
0044D  GOSUB SUB_1ABD
00456  IF YesNo! = 0 THEN GOTO L_068E
L_045B:
00482  G!(CINT(FNIdx(0, 31))) = 1
004AA  G!(CINT(FNIdx(0, 23))) = 5
004B3  FOR I! = 2300 TO 2597
L_04B6:
004CD  G!(CINT(I!)) = RldCnt!
004E8  G!(CINT(I! + 2)) = DbgOwner!
004F7  RldCnt! = RldCnt! + 1
00502  IF RldCnt! <= 11 THEN GOTO L_052E
L_0507:
0050B  RldCnt! = 1
00517  DbgOwner! = DbgOwner! + 1
00522  IF DbgOwner! <= 8 THEN GOTO L_052E
L_0527:
0052B  DbgOwner! = 1
L_052E:
00537  NEXT I! STEP 3
L_054A:
00550  FOR I! = 1 TO 6
L_0554:
005A1  G!(CINT(FNIdx(I!, 15))) = INT(FNCrew(I!, 16) * 0.8)
005CB  G!(CINT(FNIdx(I!, 35))) = 3
005F5  G!(CINT(FNIdx(I!, 27))) = 8
0061D  G!(CINT(FNIdx(I!, 54))) = 2
00629  NEXT I!
L_063C:
00663  G!(CINT(FNIdx(5, 0))) = 123
0068B  G!(CINT(FNIdx(5, 1))) = 7
L_068E:
00694  RANDOMIZE TIMER
00697  GOSUB SUB_0DEE
006A3  IF SectorX! > 5 THEN GOTO L_06CF
L_06A8:
006AE  Location! = 4
006B7  StartX! = 17
006C0  StartY! = 0
006C9  Gravity10! = 10
006CC  GOTO L_07D0
L_06CF:
006D8  IF SectorX! > 6 THEN GOTO L_06FB
L_06DD:
006E3  Location! = 7
006EC  StartX! = 18
006F5  StartY! = 0
006F8  GOTO L_07D0
L_06FB:
00704  IF SectorX! > 10 THEN GOTO L_0727
L_0709:
0070F  Location! = 5
00718  StartX! = 25
00721  StartY! = 0
00724  GOTO L_07D0
L_0727:
00730  IF SectorX! > 14 THEN GOTO L_0754
L_0735:
0073B  Location! = 3
00746  StartX! = 4
0074E  StartY! = 3
00751  GOTO L_07D0
L_0754:
0075D  IF SectorX! > 18 THEN GOTO L_0780
L_0762:
00768  Location! = 6
00771  StartX! = 3
0077A  StartY! = 8
0077D  GOTO L_07D0
L_0780:
00789  IF SectorX! > 30 THEN GOTO L_07B5
L_078E:
00794  Location! = 1
0079D  StartX! = 18
007A6  StartY! = 8
007AF  Gravity10! = 10
007B2  GOTO L_07D0
L_07B5:
007BB  Location! = 2
007C4  StartX! = 9
007CD  StartY! = 28
L_07D0:
007D9  IF TestMode! <> 1 THEN GOTO L_07F9
L_07DE:
007E4  Location! = 6
007ED  StartX! = 3
007F6  StartY! = 8
L_07F9:
00818  IF NOT ((InBattle! = 0) OR (TestMode! = 1)) THEN GOTO L_0823
L_081D:
0081D  GOSUB SUB_63F9
00820  GOTO L_0829
L_0823:
00823  GOSUB SUB_6473
00826  GOSUB SUB_13E5
L_0829:
00856  IF NOT ((TestMode! = 0) AND ((Location! = 6) OR (Location! = 3))) THEN GOTO L_0867
L_085B:
00861  Breathable! = 0
00864  GOTO L_0870
L_0867:
0086D  Breathable! = 1
L_0870:
0088F  IF (InBattle! <> 0) OR (Breathable! = 1) THEN GOTO L_0CDF
L_0894:
00894  GOSUB SUB_13C5
00897  GOSUB SUB_1378
008A3  LOCATE 4, 2
008A6  PRINT "Atmosphere Unbreathable"
008BC  LOCATE 10, 2
008BF  PRINT "Squad members with"
008D3  LOCATE 11, 2
008D6  PRINT "oxygen:";
008E8  FOR I! = 1 TO 6
L_08EC:
008EC  GOSUB SUB_0C62
008F8  NEXT I!
0090E  FOR M! = 2300 TO 2597
L_0912:
00931  I! = G!(CINT(M! + 2)) - 2
0093C  IF I! < 1 THEN GOTO L_0A0A
L_0941:
00957  IF G!(CINT(M!)) <> 10 THEN GOTO L_0984
L_095C:
00981  G!(CINT(FNIdx(I!, 33))) = 1
L_0984:
0099A  IF G!(CINT(M!)) <> 8 THEN GOTO L_09C7
L_099F:
009C4  G!(CINT(FNIdx(I!, 56))) = 1
L_09C7:
009DD  IF G!(CINT(M!)) <> 9 THEN GOTO L_0A0A
L_09E2:
00A07  G!(CINT(FNIdx(I!, 40))) = 1
L_0A0A:
00A13  NEXT M! STEP 3
L_0A26:
00A2C  NoOxygen! = 0
00A35  FOR I! = 1 TO 6
L_0A38:
00A52  IF FNCrew(I!, 31) <= 0 THEN GOTO L_0B10
L_0A57:
00AAD  Found! = (FNCrew(I!, 33) * FNCrew(I!, 56)) * FNCrew(I!, 40)
00AB0  GOSUB SUB_0C62
00AD8  G!(CINT(FNIdx(I!, 40))) = Found!
00AE1  IF Found! <> 1 THEN GOTO L_0B07
L_0AE6:
00AE6  PRINT CHR$(CINT(I! + 48)); " ";
00B04  GOTO L_0B10
L_0B07:
00B0D  NoOxygen! = 1
L_0B10:
00B19  NEXT I!
L_0B2C:
00B32  IF NoOxygen! <> 0 THEN GOTO L_0B43
L_0B37:
00B37  GOSUB SUB_128E
00B3A  GOSUB SUB_128E
00B3D  GOSUB SUB_13E5
00B40  GOTO L_0CDF
L_0B43:
00B4C  LOCATE 16, 2
00B4F  PRINT "Some squad members have"
00B65  LOCATE 17, 2
00B68  PRINT "no oxygen source. Will"
00B7C  LOCATE 18, 2
00B7F  PRINT "you continue? (Y/N)"
00B8B  GOSUB SUB_1ABD
00B94  IF YesNo! <> 0 THEN GOTO L_0BA2
L_0B99:
00B99  GOSUB SUB_4F07
00B9F  CHAIN "SPACE.STR"
L_0BA2:
00BA2  GOSUB SUB_1378
00BAE  LOCATE 9, 4
00BB7  FOR Member! = 1 TO 6
L_0BBA:
00C00  IF NOT ((FNCrew(Member!, 31) > 0) AND (FNCrew(Member!, 40) = 0)) THEN GOTO L_0C37
L_0C05:
00C0B  LOCATE , 4
00C0E  PRINT CrewName$(CINT(Member!)); " ";
00C31  Damage! = 999
00C34  GOSUB SUB_6217
L_0C37:
00C40  NEXT Member!
L_0C53:
00C53  GOSUB SUB_128E
00C56  GOSUB SUB_128E
00C59  GOSUB SUB_128E
00C5C  GOSUB SUB_13E5
00C5F  GOTO L_0CDF
SUB_0C62:
00C89  G!(CINT(FNIdx(I!, 33))) = 0
00CB3  G!(CINT(FNIdx(I!, 56))) = 0
00CDB  G!(CINT(FNIdx(I!, 40))) = 0
00CDE  RETURN   'with FAC = FNIdx(I!, 40)
L_0CDF:
00CE5  FOR I! = 0 TO 26
L_0CE8:
00CF8  READ OpLen%(CINT(I!))
00D03  NEXT I!
00D1A  IF InBattle! <> 0 THEN GOTO L_0D40
L_0D1F:
00D25  X! = StartX!
00D2B  OldX! = StartX!
00D34  Y! = StartY!
00D3A  OldY! = StartY!
00D3D  GOTO L_0DAA
L_0D40:
00D46  InBattle! = 0
00D51  IF BattleWon! <> 0 THEN GOTO L_0D6B
L_0D56:
00D5C  X! = OldX!
00D65  Y! = OldY!
00D68  GOTO L_0DAA
L_0D6B:
00D86  RoomNo! = INT(FNCell(0) * 0.015625)
00DA4  InMap%(CINT(FNRoomIdx(RoomNo!, 1))) = -1
L_0DAA:
00DB0  FOR I! = 1 TO 22
L_0DB4:
00DC6  READ OptionName$(CINT(I!))
00DD1  NEXT I!
00DE8  PrevRoom! = -1
00DEB  GOTO L_2408
SUB_0DEE:
00DF1  CLS
00DF7  SCREEN 1
00E03  IF UseEGA! <> 1 THEN GOTO L_0E19
L_0E08:
00E0B  PALETTE 1, 2
00E13  PALETTE 2, 6
00E16  GOTO L_0E24
L_0E19:
00E21  COLOR 0, 1
L_0E24:
00E40  LINE (3, 3)-(317, 195), , B
00E60  LINE (7, 6)-(193, 192), , B
00E81  LINE (197, 6)-(313, 26), , BF
00E95  PUT (216, 7), Logo, PSET
00EB5  LINE (197, 29)-(313, 89), , B
00ED5  LINE (197, 92)-(313, 105), , B
00EF5  LINE (197, 108)-(313, 192), , B
00F16  LINE (4, 4)-(316, 5), 2, BF
00F36  LINE (4, 193)-(316, 194), 2, BF
00F56  LINE (197, 27)-(313, 28), 2, BF
00F76  LINE (197, 90)-(313, 91), 2, BF
00F96  LINE (197, 106)-(313, 107), 2, BF
00FB7  LINE (4, 6)-(6, 192), 2, BF
00FD7  LINE (194, 6)-(196, 192), 2, BF
00FF7  LINE (314, 6)-(316, 192), 2, BF
00FFA  RETURN
SUB_0FFB:
00FFB  GOSUB SUB_60BE
0100A  DelayN1! = Delay! * 0.6
01013  FOR DelayI! = 1 TO DelayN1!
L_1016:
0101F  NEXT DelayI!
0102F  GOSUB SUB_60BE
0103E  DelayN2! = Delay! * 0.5
01047  FOR DelayI! = 1 TO DelayN2!
L_104A:
01053  NEXT DelayI!
01063  GOSUB SUB_60BE
01066  RETURN
01070  LOCATE 24, 2
01073  PRINT "Select Option";
0107F  GOSUB SUB_12E9
01082  RETURN
SUB_1083:
01098  Delta! = CreditsHi! * 30000 + CreditsLo! + Delta!
010A3  IF Delta! <= 9999999 THEN GOTO L_10AD
L_10A8:
010AA  Delta! = 9999999
L_10AD:
010BD  CreditsHi! = Delta! / 30000
010CF  CreditsLo! = Delta! - (CreditsHi! * 30000)
010D2  RETURN   'with FAC = CreditsLo!
SUB_10D3:
010D3  GOSUB SUB_14CA
010DC  FOR I! = 1 TO 6
L_10E0:
01128  IF NOT ((FNCrew(I!, 31) > 0) AND (FNCrew(I!, 0) > 0)) THEN GOTO L_1173
L_112D:
01143  LOCATE CINT(I! + 14), 26
01146  PRINT CHR$(CINT(I! + 48)); ">"; CrewName$(CINT(I!))
L_1173:
0117C  NEXT I!
L_118F:
01198  LOCATE 22, 26
0119B  PRINT Prompt$
L_11A7:
011AD  K$ = INKEY$
011B0  GOSUB SUB_60BE
011BC  IF K$ = "" THEN GOTO L_11A7
011CA  I! = ASC(K$)
011D5  IF I! <> 13 THEN GOTO L_11E6
L_11DA:
011E0  Member! = 0
011E3  GOTO L_121B
L_11E6:
01205  IF NOT ((I! < 55) AND (I! > 48)) THEN GOTO L_1219
L_120A:
01213  Member! = I! - 48
01216  GOTO L_121B
L_1219:
01219  GOTO L_11A7
L_121B:
01285  IF NOT ((AllowAny! = 1) OR (((FNCrew(Member!, 31) > 0) AND (FNCrew(Member!, 0) > 0)) OR (Member! = 0))) THEN GOTO L_128B
L_128A:
0128A  RETURN   'with FAC = FNCrew(Member!, 31)
L_128B:
0128B  GOTO L_11A7
SUB_128E:
01294  FOR PauseI! = 1 TO 5
L_1298:
01298  GOSUB SUB_0FFB
012A4  NEXT PauseI!
012B4  RETURN
SUB_12B5:
012B5  PRINT "Press ENTER";
L_12C1:
012C7  K$ = INKEY$
012CA  GOSUB SUB_60BE
012D6  IF K$ = "" THEN GOTO L_12C1
012E6  IF CHR$(13) <> K$ THEN GOTO L_12C1
012E8  RETURN
SUB_12E9:
012EF  K$ = INKEY$
012F2  GOSUB SUB_60BE
012FE  IF K$ = "" THEN GOTO L_12E9
0130C  Cmd! = ASC(K$)
01317  IF Cmd! <= 95 THEN GOTO L_1327
L_131C:
01324  Cmd! = Cmd! - 32
L_1327:
01332  Cmd! = Cmd! - 64
0136F  IF NOT (((Cmd! <= CmdMax!) AND (Cmd! >= CmdMin!)) OR ((Cmd! = -51) OR (Cmd! = -32))) THEN GOTO L_1375
L_1374:
01374  RETURN   'with FAC = Cmd!
L_1375:
01375  GOTO L_12E9
SUB_1378:
0137E  MapHidden! = 1
0139F  LINE (8, 7)-(192, 191), 0, BF
013A2  RETURN
SUB_13A3:
013C1  LINE (8, 16)-(192, 191), 0, BF
013C4  RETURN
SUB_13C5:
013E1  GET (8, 7)-(192, 191), MapPic
013E4  RETURN
SUB_13E5:
013EB  MapHidden! = 0
01401  PUT (8, 7), MapPic, PSET
01404  RETURN
SUB_1405:
0140B  K$ = INKEY$
0140E  GOSUB SUB_60BE
0141A  IF K$ = "" THEN GOTO L_1405
01427  IF LEN(K$) <= 1 THEN GOTO L_1464
L_142C:
01440  Cmd! = ASC(RIGHT$(K$, 1)) - 70
01461  IF ((Cmd! > 11) OR (Cmd! < 1)) THEN GOTO L_1405
01463  RETURN   'with FAC = Cmd!
L_1464:
01473  Cmd! = ASC(K$) - 53
0147E  IF Cmd! <= 43 THEN GOTO L_148E
L_1483:
0148B  Cmd! = Cmd! - 32
L_148E:
01497  IF Cmd! <> -40 THEN GOTO L_14A5
L_149C:
014A1  Cmd! = 37
014A4  RETURN
L_14A5:
014C4  IF (Cmd! > 37) OR (Cmd! < 12) THEN GOTO L_1405
L_14C9:
014C9  RETURN
SUB_14CA:
014E8  LINE (200, 110)-(311, 191), 0, BF
014EB  RETURN
SUB_14EC:
0150A  LINE (200, 31)-(311, 87), 0, BF
0150D  RETURN
SUB_150E:
0152C  LINE (200, 128)-(311, 191), 0, BF
0152F  RETURN
0154E  LINE (8, 7)-(192, 191), 0, BF
01551  RETURN
SUB_1552:
01570  LINE (8, 16)-(192, 191), 0, BF
01573  RETURN
SUB_1574:
0157A  MaxLen! = 4
SUB_157D:
01588  Col! = POS(0)
01594  Row! = CSRLIN
0159D  K$ = ""
L_15A0:
015C0  LOCATE CINT(Row!), CINT(Col!), 1, 0, 7
015C3  PRINT K$; " ";
L_15D5:
015DB  Ch$ = INKEY$
015E6  IF Ch$ = "" THEN GOTO L_15D5
015F4  I! = ASC(Ch$)
015FF  IF I! = 13 THEN GOTO L_16F8
L_1604:
01629  IF NOT ((LEN(K$) > 0) AND (I! = 8)) THEN GOTO L_1645
L_162E:
0163F  K$ = LEFT$(K$, LEN(K$) - 1)
01642  GOTO L_15A0
L_1645:
01675  IF ((I! > 57) OR (I! < 48)) AND (MaxLen! = 4) THEN GOTO L_15A0
L_167A:
01699  IF (I! > 126) OR (I! < 32) THEN GOTO L_15D5
L_169E:
016BD  IF NOT ((I! < 123) AND (I! > 96)) THEN GOTO L_16CD
L_16C2:
016CA  I! = I! - 32
L_16CD:
016DC  IF LEN(K$) >= MaxLen! THEN GOTO L_15D5
L_16E1:
016F2  K$ = K$ + CHR$(CINT(I!))
016F5  GOTO L_15A0
L_16F8:
01703  InputVal% = CINT(VAL(K$))
01706  RETURN   'with FAC = VAL(K$)
SUB_1707:
0170D  Found! = 0
01716  FOR I! = 2300 TO 2597
L_171A:
0175E  IF NOT ((G!(CINT(I! + 2)) > 2) AND (G!(CINT(I!)) = ItemType!)) THEN GOTO L_178C
L_1763:
01768  ItemRec! = I!
01773  Found! = 1
01781  ItemOwner! = G!(CINT(I! + 2)) - 2
01789  I! = 2600
L_178C:
01795  NEXT I! STEP 3
L_17A8:
017A8  RETURN
01811  G!(CINT(FNIdx(Member!, 16))) = (FNCrew(Member!, 0) + FNCrew(Member!, 4)) * 0.25
01888  G!(CINT(FNIdx(Member!, 10))) = (FNCrew(Member!, 2) * 2 + FNCrew(Member!, 3)) / 6 - 25
018D6  G!(CINT(FNIdx(Member!, 11))) = FNCrew(Member!, 1) * 0.5 - 25
01928  G!(CINT(FNIdx(Member!, 13))) = FNCrew(Member!, 0) / 3 + 10
01995  G!(CINT(FNIdx(Member!, 12))) = (FNCrew(Member!, 0) + FNCrew(Member!, 1)) / 20 + 15
019B0  DbgEsper! = FNCrew(Member!, 27)
019E8  G!(CINT(FNIdx(Member!, 51))) = DbgEsper! * 15
01A2F  G!(CINT(FNIdx(Member!, 52))) = ABS(DbgEsper! > 2)
01A76  G!(CINT(FNIdx(Member!, 53))) = ABS(DbgEsper! > 4)
01AB9  G!(CINT(FNIdx(Member!, 54))) = ABS(DbgEsper! > 5)
01ABC  RETURN   'with FAC = ABS(DbgEsper! > 5)
SUB_1ABD:
01AC3  K$ = INKEY$
01AE4  IF NOT ((K$ = "Y") OR (K$ = "y")) THEN GOTO L_1AF3
L_1AE9:
01AEF  YesNo! = 1
01AF2  RETURN
L_1AF3:
01B12  IF NOT ((K$ = "N") OR (K$ = "n")) THEN GOTO L_1B21
L_1B17:
01B1D  YesNo! = 0
01B20  RETURN
L_1B21:
01B21  GOTO L_1ABD
SUB_1B23:
01B3F  RoomX0! = FNRoom(DrawRoom!, 7)
01B60  RoomY0! = FNRoom(DrawRoom!, 8)
01B78  CellIdx! = RoomY0! * 37 + RoomX0!
01B93  RoomX1! = FNRoom(DrawRoom!, 9)
01BA7  RowSkip! = 36 - RoomX1! + RoomX0!
01BBD  PxX0! = RoomX0! * 5 + 8
01BD1  PxY! = RoomY0! * 5 + 7
01BEC  RoomY1! = FNRoom(DrawRoom!, 10)
01BF5  FOR Row! = RoomY0! TO RoomY1!
L_1BF8:
01BFE  PxX! = PxX0!
01C07  ColEnd! = RoomX1!
01C10  FOR Col! = RoomX0! TO ColEnd!
L_1C14:
01C38  CellRoom! = INT((InMap%(CINT(CellIdx!))) * 0.015625)
01C43  IF CellRoom! <> DrawRoom! THEN GOTO L_1C59
L_1C48:
01C53  CellTile! = InMap%(CINT(CellIdx!)) - (CellRoom! * 64)
01C56  GOSUB SUB_1CEA
L_1C59:
01C66  CellIdx! = CellIdx! + 1
01C74  PxX! = PxX! + 5
01C7F  NEXT Col!
01C9A  CellIdx! = CellIdx! + RowSkip!
01CA8  PxY! = PxY! + 5
01CB4  NEXT Row!
L_1CC7:
01CE3  InMap%(CINT(FNRoomIdx(DrawRoom!, 5))) = 1
01CE9  RETURN   'with FAC = FNRoomIdx(DrawRoom!, 5)
SUB_1CEA:
01CFE  TileHi! = INT(CellTile! * 0.125)
01D15  TileLo! = CellTile! - (TileHi! * 8) + 1
01D24  ON CINT(TileHi! + 1) GOTO L_1D38, L_1E12, L_1EEC, L_1FC6, L_20A0, L_217A, L_2254, L_232E
L_1D38:
01D3E  ON CINT(TileLo!) GOTO L_1D52, L_1D6A, L_1D82, L_1D9A, L_1DB2, L_1DCA, L_1DE2, L_1DFA
L_1D52:
01D66  PUT (PxX!, PxY!), Tile0, PSET
01D69  RETURN
L_1D6A:
01D7E  PUT (PxX!, PxY!), Tile1, PSET
01D81  RETURN
L_1D82:
01D96  PUT (PxX!, PxY!), Tile2, PSET
01D99  RETURN
L_1D9A:
01DAE  PUT (PxX!, PxY!), Tile3, PSET
01DB1  RETURN
L_1DB2:
01DC6  PUT (PxX!, PxY!), Tile4, PSET
01DC9  RETURN
L_1DCA:
01DDE  PUT (PxX!, PxY!), Tile5, PSET
01DE1  RETURN
L_1DE2:
01DF6  PUT (PxX!, PxY!), Tile6, PSET
01DF9  RETURN
L_1DFA:
01E0E  PUT (PxX!, PxY!), Tile7, PSET
01E11  RETURN
L_1E12:
01E18  ON CINT(TileLo!) GOTO L_1E2C, L_1E44, L_1E5C, L_1E74, L_1E8C, L_1EA4, L_1EBC, L_1ED4
L_1E2C:
01E40  PUT (PxX!, PxY!), Tile8, PSET
01E43  RETURN
L_1E44:
01E58  PUT (PxX!, PxY!), Tile9, PSET
01E5B  RETURN
L_1E5C:
01E70  PUT (PxX!, PxY!), Tile10, PSET
01E73  RETURN
L_1E74:
01E88  PUT (PxX!, PxY!), Tile11, PSET
01E8B  RETURN
L_1E8C:
01EA0  PUT (PxX!, PxY!), Tile12, PSET
01EA3  RETURN
L_1EA4:
01EB8  PUT (PxX!, PxY!), Tile13, PSET
01EBB  RETURN
L_1EBC:
01ED0  PUT (PxX!, PxY!), Tile14, PSET
01ED3  RETURN
L_1ED4:
01EE8  PUT (PxX!, PxY!), Tile15, PSET
01EEB  RETURN
L_1EEC:
01EF2  ON CINT(TileLo!) GOTO L_1F06, L_1F1E, L_1F36, L_1F4E, L_1F66, L_1F7E, L_1F96, L_1FAE
L_1F06:
01F1A  PUT (PxX!, PxY!), Tile16, PSET
01F1D  RETURN
L_1F1E:
01F32  PUT (PxX!, PxY!), Tile17, PSET
01F35  RETURN
L_1F36:
01F4A  PUT (PxX!, PxY!), Tile18, PSET
01F4D  RETURN
L_1F4E:
01F62  PUT (PxX!, PxY!), Tile19, PSET
01F65  RETURN
L_1F66:
01F7A  PUT (PxX!, PxY!), Tile20, PSET
01F7D  RETURN
L_1F7E:
01F92  PUT (PxX!, PxY!), Tile21, PSET
01F95  RETURN
L_1F96:
01FAA  PUT (PxX!, PxY!), Tile22, PSET
01FAD  RETURN
L_1FAE:
01FC2  PUT (PxX!, PxY!), Tile23, PSET
01FC5  RETURN
L_1FC6:
01FCC  ON CINT(TileLo!) GOTO L_1FE0, L_1FF8, L_2010, L_2028, L_2040, L_2058, L_2070, L_2088
L_1FE0:
01FF4  PUT (PxX!, PxY!), Tile24, PSET
01FF7  RETURN
L_1FF8:
0200C  PUT (PxX!, PxY!), Tile25, PSET
0200F  RETURN
L_2010:
02024  PUT (PxX!, PxY!), Tile26, PSET
02027  RETURN
L_2028:
0203C  PUT (PxX!, PxY!), Tile27, PSET
0203F  RETURN
L_2040:
02054  PUT (PxX!, PxY!), Tile28, PSET
02057  RETURN
L_2058:
0206C  PUT (PxX!, PxY!), Tile29, PSET
0206F  RETURN
L_2070:
02084  PUT (PxX!, PxY!), Tile30, PSET
02087  RETURN
L_2088:
0209C  PUT (PxX!, PxY!), Tile31, PSET
0209F  RETURN
L_20A0:
020A6  ON CINT(TileLo!) GOTO L_20BA, L_20D2, L_20EA, L_2102, L_211A, L_2132, L_214A, L_2162
L_20BA:
020CE  PUT (PxX!, PxY!), Tile32, PSET
020D1  RETURN
L_20D2:
020E6  PUT (PxX!, PxY!), Tile33, PSET
020E9  RETURN
L_20EA:
020FE  PUT (PxX!, PxY!), Tile34, PSET
02101  RETURN
L_2102:
02116  PUT (PxX!, PxY!), Tile35, PSET
02119  RETURN
L_211A:
0212E  PUT (PxX!, PxY!), Tile36, PSET
02131  RETURN
L_2132:
02146  PUT (PxX!, PxY!), Tile37, PSET
02149  RETURN
L_214A:
0215E  PUT (PxX!, PxY!), Tile38, PSET
02161  RETURN
L_2162:
02176  PUT (PxX!, PxY!), Tile39, PSET
02179  RETURN
L_217A:
02180  ON CINT(TileLo!) GOTO L_2194, L_21AC, L_21C4, L_21DC, L_21F4, L_220C, L_2224, L_223C
L_2194:
021A8  PUT (PxX!, PxY!), Tile40, PSET
021AB  RETURN
L_21AC:
021C0  PUT (PxX!, PxY!), Tile41, PSET
021C3  RETURN
L_21C4:
021D8  PUT (PxX!, PxY!), Tile42, PSET
021DB  RETURN
L_21DC:
021F0  PUT (PxX!, PxY!), Tile43, PSET
021F3  RETURN
L_21F4:
02208  PUT (PxX!, PxY!), Tile44, PSET
0220B  RETURN
L_220C:
02220  PUT (PxX!, PxY!), Tile45, PSET
02223  RETURN
L_2224:
02238  PUT (PxX!, PxY!), Tile46, PSET
0223B  RETURN
L_223C:
02250  PUT (PxX!, PxY!), Tile47, PSET
02253  RETURN
L_2254:
0225A  ON CINT(TileLo!) GOTO L_226E, L_2286, L_229E, L_22B6, L_22CE, L_22E6, L_22FE, L_2316
L_226E:
02282  PUT (PxX!, PxY!), Tile48, PSET
02285  RETURN
L_2286:
0229A  PUT (PxX!, PxY!), Tile49, PSET
0229D  RETURN
L_229E:
022B2  PUT (PxX!, PxY!), Tile50, PSET
022B5  RETURN
L_22B6:
022CA  PUT (PxX!, PxY!), Tile51, PSET
022CD  RETURN
L_22CE:
022E2  PUT (PxX!, PxY!), Tile52, PSET
022E5  RETURN
L_22E6:
022FA  PUT (PxX!, PxY!), Tile53, PSET
022FD  RETURN
L_22FE:
02312  PUT (PxX!, PxY!), Tile54, PSET
02315  RETURN
L_2316:
0232A  PUT (PxX!, PxY!), Tile55, PSET
0232D  RETURN
L_232E:
02334  ON CINT(TileLo!) GOTO L_2348, L_2360, L_2378, L_2390, L_23A8, L_23C0, L_23D8, L_23F0
L_2348:
0235C  PUT (PxX!, PxY!), Tile56, PSET
0235F  RETURN
L_2360:
02374  PUT (PxX!, PxY!), Tile57, PSET
02377  RETURN
L_2378:
0238C  PUT (PxX!, PxY!), Tile58, PSET
0238F  RETURN
L_2390:
023A4  PUT (PxX!, PxY!), Tile59, PSET
023A7  RETURN
L_23A8:
023BC  PUT (PxX!, PxY!), Tile60, PSET
023BF  RETURN
L_23C0:
023D4  PUT (PxX!, PxY!), Tile61, PSET
023D7  RETURN
L_23D8:
023EC  PUT (PxX!, PxY!), Tile62, PSET
023EF  RETURN
L_23F0:
02404  PUT (PxX!, PxY!), Tile63, PSET
02407  RETURN
L_2408:
02408  GOSUB SUB_14CA
02414  LOCATE 15, 26
02417  PRINT "C-Change Wep."
0242D  LOCATE 16, 26
02430  PRINT "E-Equip"
02444  LOCATE 17, 26
02447  PRINT "F-Fix Items"
0245B  LOCATE 18, 26
0245E  PRINT "G-Switch"
02472  LOCATE 19, 26
02475  PRINT "I-Inspect"
02489  LOCATE 20, 26
0248C  PRINT "M-Medical"
024A0  LOCATE 21, 26
024A3  PRINT "R-Reload"
024B8  LOCATE 22, 26
024BB  PRINT "S-Search"
024D1  LOCATE 23, 26
024D4  PRINT "T-Time Delay"
024E8  LOCATE 24, 26
024EB  PRINT "U-Use  V-View";
0250A  PUT (280, 144), Cursor, XOR
02528  RoomNo! = INT(FNCell(0) * 0.015625)
02534  IF RoomNo! <> PrevRoom! THEN GOTO L_2650
L_2539:
02565  Pass! = TilePass%(CINT(FNCell(0) - (RoomNo! * 64)))
0257E  BlockDown! = (Pass! > 999)
0258E  Pass! = BlockDown! * 1000 + Pass!
025A7  BlockUp! = (Pass! > 99)
025B7  Pass! = BlockUp! * 100 + Pass!
025CE  BlockRight! = (Pass! > 9)
025ED  BlockLeft! = (BlockRight! * 10 + Pass! > 0)
L_25F0:
025F6  DX! = 0
025FC  DY! = 0
025FF  GOSUB SUB_1405
02608  ON CINT(Cmd!) GOTO L_25F0, L_2830, L_25F0, L_25F0, L_2866, L_25F0, L_289C, L_25F0, L_25F0, L_28D2, L_25F0, L_25F0, L_25F0, L_597C, L_25F0, L_4F7E, L_37C3, L_35C0, L_25F0, L_41B8, L_25F0, L_25F0, L_25F0, L_3C56, L_25F0, L_25F0, L_25F0, L_25F0, L_5D4E, L_5EF1, L_6892, L_5F6A, L_53DA
0264E  GOTO L_25F0
L_2650:
02656  Found! = 0
02671  RoomNo! = INT(FNCell(0) * 0.015625)
0267D  LOCATE 13, 26
02680  PRINT Enclosure$(CINT(FNRoom(RoomNo!, 4)))
026A8  GOSUB SUB_14EC
026B1  PrevRoom! = RoomNo!
026D7  K$ = MesLine$(CINT(FNRoom(RoomNo!, 3)))
026FA  TextRow! = 8 - (INT((LEN(K$) + 13) / 28))
0270E  LastRow! = LEN(K$) / 14
02717  FOR I! = FirstRow! TO LastRow!
L_271A:
0272C  LOCATE CINT(TextRow! + I!), 26
0272F  PRINT MID$(K$, CINT(I! * 14 + 1), 14)
0275F  NEXT I!
02789  IF FNRoom(RoomNo!, 5) <> 0 THEN GOTO L_279A
L_278E:
02794  DrawRoom! = RoomNo!
02797  GOSUB SUB_1B23
L_279A:
027B2  EnemyGroup! = FNRoom(RoomNo!, 1)
027BD  IF EnemyGroup! <= -1 THEN GOTO L_27D0
L_27C2:
027C8  IF TestMode! = 0 THEN GOTO L_64E4
L_27CD:
027CD  BEEP
L_27D0:
027E8  Script! = FNRoom(RoomNo!, 2)
027F0  IF Script! = 0 THEN GOTO L_34C5
L_27F5:
027FB  IF Script! >= 0 THEN GOTO L_2822
L_2800:
0281C  InMap%(CINT(FNRoomIdx(RoomNo!, 2))) = 0
L_2822:
0282A  Script! = ABS(Script!)
0282D  GOTO L_6BF2
L_2830:
02838  IF (BlockUp! = 0) THEN GOTO L_285A
L_283D:
02854  SOUND 900, SndDur! * 7
02857  GOTO L_25F0
L_285A:
02860  DY! = -1
02863  GOTO L_2905
L_2866:
0286E  IF (BlockLeft! = 0) THEN GOTO L_2890
L_2873:
0288A  SOUND 900, SndDur! * 7
0288D  GOTO L_25F0
L_2890:
02896  DX! = -1
02899  GOTO L_2905
L_289C:
028A4  IF (BlockRight! = 0) THEN GOTO L_28C6
L_28A9:
028C0  SOUND 900, SndDur! * 7
028C3  GOTO L_25F0
L_28C6:
028CC  DX! = 1
028CF  GOTO L_2905
L_28D2:
028DA  IF (BlockDown! = 0) THEN GOTO L_28FC
L_28DF:
028F6  SOUND 900, SndDur! * 7
028F9  GOTO L_25F0
L_28FC:
02902  DY! = 1
L_2905:
02910  X! = X! + DX!
0291E  Y! = Y! + DY!
0293C  NewRoom! = INT(FNCell(0) * 0.015625)
0295F  Tile! = FNCell(0) - (NewRoom! * 64)
02981  IF (Tile! > 40) OR (Tile! < 36) THEN GOTO L_2F18
L_2986:
02986  GOSUB SUB_6169
029A1  TrapLevel! = FNRoom(NewRoom!, 0)
029AC  IF TrapLevel! < 1 THEN GOTO L_2F18
L_29B1:
029B7  Found! = 0
029BA  GOSUB SUB_14CA
029C6  IF TrapLevel! >= 4 THEN GOTO L_2A9B
L_29CB:
029D1  IF RadDetOn! = 0 THEN GOTO L_2A98
L_29D6:
029DC  Found! = 1
029E8  LOCATE 15, 26
029EB  PRINT "Radiation trap"
02A01  LOCATE 16, 26
02A04  PRINT "dectected."
02A18  RadSweepSave! = RadSweep!
02A20  FOR I! = 1 TO 8
L_2A24:
02A2A  FOR RadSweep! = 1 TO 25
L_2A2E:
02A2E  GOSUB SUB_5829
02A3A  NEXT RadSweep!
02A58  SOUND 555, SndDur!
02A70  SOUND 1234, SndDur! * 2
02A7C  NEXT I!
02A92  RadSweep! = RadSweepSave!
02A95  GOTO L_2B7F
L_2A98:
02A98  GOTO L_2C63
L_2A9B:
02AA1  FOR Member! = 1 TO 6
L_2AA4:
02B04  IF NOT ((RND * 100 < FNCrew(Member!, 19) * 10 + 5) AND (FNCrew(Member!, 31) > 0)) THEN GOTO L_2B58
L_2B09:
02B0F  Found! = 1
02B1B  LOCATE 15, 26
02B1E  PRINT CrewName$(CINT(Member!))
02B41  LOCATE 16, 26
02B44  PRINT "sees a trap!"
02B55  Member! = 7
L_2B58:
02B61  NEXT Member!
L_2B74:
02B7A  IF Found! = 0 THEN GOTO L_2C63
L_2B7F:
02B88  LOCATE 19, 26
02B8B  PRINT "Will you have"
02BA1  LOCATE 20, 26
02BA4  PRINT CrewName$(CINT(Scout!)); " dis-";
02BC9  LOCATE 21, 26
02BCC  PRINT "arm it? (Y/N)";
02BD8  GOSUB SUB_1ABD
02BE1  IF YesNo! <> 0 THEN GOTO L_2BFB
L_2BE6:
02BEC  X! = OldX!
02BF5  Y! = OldY!
02BF8  GOTO L_2408
L_2BFB:
02C0D  DisarmPct! = ScoutSkill! * 10 + 15
02C18  IF DisarmPct! <= 90 THEN GOTO L_2C22
L_2C1D:
02C1F  DisarmPct! = 90
L_2C22:
02C2B  LOCATE 23, 26
02C3D  IF RND * 100 >= DisarmPct! THEN GOTO L_2C54
L_2C42:
02C42  PRINT "Successful!"
02C4E  GOSUB SUB_128E
02C51  GOTO L_2EE1
L_2C54:
02C54  PRINT "Failure!"
02C60  GOSUB SUB_128E
L_2C63:
02C63  GOSUB SUB_14CA
02C6F  LOCATE 15, 26
02C8A  ON CINT(INT(TrapLevel! * 0.3225807) + 1) GOTO L_2C92, L_2DD7
L_2C92:
02CAA  PoisonTarget! = INT(RND * 6 + 1)
02CAD  PRINT "Radiation Trap"
02CD0  SOUND 900, SndDur! * 28
02CD9  FOR Member! = 1 TO 6
L_2CDC:
02D42  IF NOT ((FNCrew(Member!, 31) > 0) AND ((Member! = PoisonTarget!) OR (RND * 100 < (2 ^ (TrapLevel! - 1)) * 13))) THEN GOTO L_2DB8
L_2D47:
02D50  LOCATE 19, 26
02D53  PRINT CrewName$(CINT(Member!))
02D76  LOCATE 20, 26
02D79  PRINT "is poisoned!"
02DA9  G!(CINT(FNIdx(Member!, 31))) = 2
02DAC  GOSUB SUB_128E
02DAF  GOSUB SUB_128E
02DB2  GOSUB SUB_128E
02DB5  GOSUB SUB_14CA
L_2DB8:
02DC1  NEXT Member!
L_2DD4:
02DD4  GOTO L_2EE1
L_2DD7:
02DD7  PRINT "Explosive Trap"
02DFA  SOUND 900, SndDur! * 28
02E03  FOR Member! = 1 TO 6
L_2E06:
02E60  IF NOT ((FNCrew(Member!, 31) > 0) AND (RND * 200 > FNCrew(Member!, 1) + 50)) THEN GOTO L_2EC2
L_2E65:
02E6E  LOCATE 19, 26
02E71  PRINT CrewName$(CINT(Member!))
02E92  LOCATE 20, 26
02EB0  Damage! = INT((RND * TrapLevel!) * TrapLevel! + 9)
02EB3  GOSUB SUB_6217
02EB6  GOSUB SUB_128E
02EB9  GOSUB SUB_128E
02EBC  GOSUB SUB_128E
02EBF  GOSUB SUB_14CA
L_2EC2:
02ECB  NEXT Member!
L_2EDE:
02EDE  GOTO L_2EE1
L_2EE1:
02EFD  InMap%(CINT(FNRoomIdx(NewRoom!, 0))) = 0
02F09  OldX! = X!
02F12  OldY! = Y!
02F15  GOTO L_2408
L_2F18:
02F37  IF (Tile! > 35) OR (Tile! < 34) THEN GOTO L_34B7
L_2F3C:
02F5B  DoorHP! = ABS(FNRoom(NewRoom!, 6))
02F7B  DoorSgn! = SGN(FNRoom(NewRoom!, 6))
02F87  IF DoorHP! < 1 THEN GOTO L_34B7
L_2F8C:
02F8C  GOSUB SUB_14CA
02F98  LOCATE 15, 26
02F9B  PRINT "A Vault Door"
02FA7  GOSUB SUB_3452
02FB3  LOCATE 19, 26
02FB6  PRINT "A-Leave"
02FCC  LOCATE 20, 26
02FCF  PRINT "B-Use Torch"
02FE3  LOCATE 21, 26
02FE6  PRINT "C-Fire At Door"
02FFA  LOCATE 22, 26
02FFD  PRINT "D-Pick Lock"
0300F  CmdMax! = 4
03018  CmdMin! = 1
0301B  GOSUB SUB_12E9
03024  IF Cmd! >= 0 THEN GOTO L_3031
L_3029:
0302E  Cmd! = 1
L_3031:
03037  ON CINT(Cmd!) GOTO L_3043, L_308A, L_31EF, L_338D
L_3043:
03071  InMap%(CINT(FNRoomIdx(NewRoom!, 6))) = CINT(DoorHP! * DoorSgn!)
0307B  X! = OldX!
03084  Y! = OldY!
03087  GOTO L_2408
L_308A:
0308A  GOSUB SUB_14CA
03093  ItemType! = 6
03096  GOSUB SUB_1707
0309F  IF Found! <> 0 THEN GOTO L_30D9
L_30A4:
030AA  ItemType! = 5
030AD  GOSUB SUB_1707
030B6  IF Found! <> 0 THEN GOTO L_30D9
L_30BB:
030C4  LOCATE 19, 26
030C7  PRINT "No Torches"
030D3  GOSUB SUB_128E
030D6  GOTO L_2F8C
L_30D9:
030E2  LOCATE 19, 26
030E5  PRINT CrewName$(CINT(ItemOwner!)); " uses"
0310C  LOCATE 20, 26
0310F  PRINT MiscItemName$(CINT(ItemType! + -1))
L_312C:
03143  SOUND 4444, SndDur! * 1.2
0315D  SOUND 5555, SndDur! * 0.9
03179  DoorHP! = DoorHP! - (ItemType! * 15) + 25
03184  IF DoorHP! < 1 THEN GOTO L_3471
L_3189:
03189  GOSUB SUB_3452
0319B  IF RND * 15 < 14 THEN GOTO L_312C
031B4  G!(CINT(ItemRec!)) = 0
031CF  G!(CINT(ItemRec! + 1)) = 0
031E9  G!(CINT(ItemRec! + 2)) = 0
031EC  GOTO L_2F8C
L_31EF:
031F5  Prompt$ = "Who will fire?"
031F8  GOSUB SUB_10D3
031FB  GOSUB SUB_14CA
03204  IF Member! = 0 THEN GOTO L_2F8C
L_3209:
0322D  WeaponRec! = FNCrew(Member!, 32) * 12 + 788
0326D  IF NOT ((G!(CINT(WeaponRec! + 9)) <> Member! + 2) OR (WeaponRec! < 800)) THEN GOTO L_3293
L_3272:
03272  GOSUB SUB_14CA
0327E  LOCATE 19, 26
03281  PRINT "Not Armed"
0328D  GOSUB SUB_128E
03290  GOTO L_2F8C
L_3293:
032AF  IF G!(CINT(WeaponRec! + 3)) >= 1 THEN GOTO L_32D5
L_32B4:
032B4  GOSUB SUB_14CA
032C0  LOCATE 19, 26
032C3  PRINT "Out Of Ammo"
032CF  GOSUB SUB_128E
032D2  GOTO L_2F8C
L_32D5:
032EC  SOUND 5555, SndDur! * 0.9
03306  SOUND 1111, SndDur! * 1.7
0334B  DoorHP! = DoorHP! - (INT((RND ^ 0.5) * (G!(CINT(WeaponRec! + 1))) + 1))
03355  IF DoorHP! < 1 THEN GOTO L_3471
L_335A:
0335A  GOSUB SUB_3452
0337D  G!(CINT(WeaponRec! + 3)) = G!(CINT(WeaponRec! + 3)) - 1
03385  IF G!(CINT(WeaponRec! + 3)) > 0 THEN GOTO L_32D5
L_338A:
0338A  GOTO L_2F8C
L_338D:
03393  ItemType! = 7
03396  GOSUB SUB_1707
03399  GOSUB SUB_14CA
033A5  LOCATE 18, 26
033AE  IF Found! <> 0 THEN GOTO L_33C5
L_33B3:
033B3  PRINT "No Lock Pick"
033BF  GOSUB SUB_128E
033C2  GOTO L_2F8C
L_33C5:
033C5  GOSUB SUB_6169
033DA  PickPct! = ScoutSkill! * 5 + 20
033E3  IF DoorSgn! >= 0 THEN GOTO L_33F1
L_33E8:
033EE  PickPct! = 0
L_33F1:
033F1  PRINT CrewName$(CINT(Scout!))
03411  LOCATE 19, 26
03423  IF RND * 100 >= PickPct! THEN GOTO L_3437
L_3428:
03428  PRINT "picks the lock"
03434  GOTO L_3471
L_3437:
03437  PRINT "fails"
03449  DoorSgn! = -1
0344C  GOSUB SUB_128E
0344F  GOTO L_2F8C
SUB_3452:
0345B  LOCATE 16, 26
0345E  PRINT DoorHP!; "pts   "
03470  RETURN
L_3471:
03471  GOSUB SUB_128E
03474  GOSUB SUB_14CA
03480  LOCATE 19, 26
03483  PRINT "Door Opened"
0348F  GOSUB SUB_128E
034AE  InMap%(CINT(FNRoomIdx(NewRoom!, 6))) = 0
034B4  GOTO L_2408
L_34B7:
034C0  IF RoomNo! <> NewRoom! THEN GOTO L_2650
L_34C5:
034CB  OldX! = X!
034D4  OldY! = Y!
034DD  PrevRoom! = RoomNo!
034E9  IF Tile! <> 41 THEN GOTO L_355A
L_34EE:
034EE  GOSUB SUB_14CA
034FA  LOCATE 17, 29
034FD  PRINT "The Exit"
03512  LOCATE 20, 26
03515  PRINT "Will you take"
0352B  LOCATE 21, 26
0352E  PRINT "it? (Y/N)";
0353A  GOSUB SUB_1ABD
03543  IF YesNo! = 0 THEN GOTO L_2408
L_3548:
03548  GOSUB SUB_4F07
0354B  GOSUB SUB_6387
03557  CHAIN Drive$ + "SPACE.STR"
L_355A:
0357C  IF (TestMode! = 1) OR (RND < 0.99) THEN GOTO L_2539
L_3581:
035BA  EnemyGroup! = InMap%(CINT(INT(RND * 2) + INT(RND * 2 + 1930)))
035BD  GOTO L_64E4
L_35C0:
035C6  AllowAny! = 1
035CF  Prompt$ = "Switch who?"
035D2  GOSUB SUB_10D3
035DB  IF Member! = 0 THEN GOTO L_37B7
L_35E0:
035E6  Tmp! = Member!
035EF  Prompt$ = "With who?"
035F2  GOSUB SUB_10D3
035FB  IF Member! = 0 THEN GOTO L_37B7
L_3600:
0363B  RecDiff! = FNIdx(Tmp!, 0) - FNIdx(Member!, 0)
03658  RecEnd! = FNIdx(Tmp!, 99)
03670  FOR J! = FNIdx(Tmp!, 0) TO RecEnd!
L_3674:
036A3  SWAP G!(CINT(J! - RecDiff!)), G!(CINT(J!))
036AE  NEXT J!
036E4  SWAP CrewName$(CINT(Member!)), CrewName$(CINT(Tmp!))
036F3  OwnerSum! = Tmp! + Member!
036FC  FOR I! = 809 TO 1097
L_3700:
03700  GOSUB SUB_376B
0370C  NEXT I! STEP 12
03722  FOR I! = 1102 TO 1399
L_3726:
03726  GOSUB SUB_376B
03732  NEXT I! STEP 3
03748  FOR I! = 2302 TO 2599
L_374C:
0374C  GOSUB SUB_376B
03758  NEXT I! STEP 3
03768  GOTO L_37B7
SUB_376B:
03797  IF NOT ((G!(CINT(I!)) <> Member!) AND (G!(CINT(I!)) <> Tmp!)) THEN GOTO L_379D
L_379C:
0379C  RETURN
L_379D:
037B3  G!(CINT(I!)) = OwnerSum! - (G!(CINT(I!)))
037B6  RETURN   'with FAC = OwnerSum! - (G!(CINT(I!)))
L_37B7:
037BD  AllowAny! = 0
037C0  GOTO L_2408
L_37C3:
037C9  RepairSkill! = 0
037D2  Member! = 1
037D8  FOR I! = 1 TO 6
L_37DC:
03829  IF NOT ((FNCrew(I!, 26) >= RepairSkill!) AND (FNCrew(I!, 31) > 0)) THEN GOTO L_3855
L_382E:
03836  Member! = I!
03852  RepairSkill! = FNCrew(I!, 26)
L_3855:
0385E  NEXT I!
L_3871:
03871  GOSUB SUB_14CA
0387A  ItemType! = 2
03883  Tmp! = 0
03889  J! = 0
0388C  GOSUB SUB_1707
038AD  RepairSkill! = Found! * 35 + RepairSkill! * 10
038B6  FOR I! = 1 TO 6
L_38BA:
0395B  IF (FNCrew(I!, 48) + FNCrew(I!, 55) = FNCrew(I!, 49)) OR (FNCrew(I!, 49) = FNCrew(I!, 48)) THEN GOTO L_3A4B
L_3960:
039C6  G!(CINT(FNIdx(I!, 55))) = FNCrew(I!, 49) - FNCrew(I!, 48)
039D4  N_9018! = N_9018! + 12
039E4  J! = J! + 1
039F6  IF RND * 100 >= RepairSkill! THEN GOTO L_3A4B
L_39FB:
03A3A  G!(CINT(FNIdx(I!, 48))) = FNCrew(I!, 49)
03A48  Tmp! = Tmp! + 1
L_3A4B:
03A54  NEXT I!
L_3A67:
03A6D  FOR I! = 800 TO 1088
L_3A70:
03AB7  IF (G!(CINT(I! + 3)) <> -1) OR (G!(CINT(I!)) < 1) THEN GOTO L_3B13
L_3ABC:
03AD5  G!(CINT(I! + 3)) = -2
03AE7  J! = J! + 1
03AF9  IF RND * 100 >= RepairSkill! THEN GOTO L_3B13
L_3AFE:
03B03  G!(CINT(I! + 3)) = 0
03B10  Tmp! = Tmp! + 1
L_3B13:
03B1C  NEXT I! STEP 12
L_3B2F:
03B35  KitUsed! = 0
03B69  IF NOT ((RND > 0.9 ^ Tmp!) AND (Found! = 1)) THEN GOTO L_3B8B
L_3B6E:
03B72  KitUsed! = 1
03B88  G!(CINT(ItemRec!)) = 0
L_3B8B:
03B94  LOCATE 15, 26
03B97  PRINT "Items fixed by"
03BAD  LOCATE 16, 26
03BB0  PRINT CrewName$(CINT(Member!)); ":"; Tmp!
03BDD  LOCATE 18, 26
03BE0  PRINT "Items rendered"
03BF4  LOCATE 19, 26
03BF7  PRINT "unfixable:"; J! - Tmp!
03C19  LOCATE 21, 26
03C1C  PRINT "Repair kits"
03C30  LOCATE 22, 26
03C33  PRINT "used up:"; KitUsed!
03C4D  LOCATE 24, 26
03C50  GOSUB SUB_12B5
03C53  GOTO L_2408
L_3C56:
03C56  GOSUB SUB_14CA
03C62  LOCATE 15, 26
03C65  PRINT "A-Squad Health"
03C7B  LOCATE 16, 26
03C7E  PRINT "B-Heal Member"
03C90  CmdMin! = 1
03C99  CmdMax! = 2
L_3C9C:
03C9C  GOSUB SUB_12E9
03CA8  IF Cmd! = -51 THEN GOTO L_2408
L_3CAD:
03CB6  IF Cmd! = -32 THEN GOTO L_3C9C
03CC1  IF Cmd! = 2 THEN GOTO L_3E59
L_3CC6:
03CC6  GOSUB SUB_14CA
03CC9  GOSUB SUB_13C5
03CCC  GOSUB SUB_1378
03CD8  LOCATE 5, 8
03CDB  PRINT "Squad Health"
03CF1  LOCATE 8, 4
03CF4  PRINT "Name"
03D08  LOCATE 8, 13
03D0B  PRINT "Hit Pts"
03D1D  FOR I! = 1 TO 6
L_3D20:
03D36  LOCATE CINT(I! + 8), 2
03D52  IF FNCrew(I!, 0) <= 0 THEN GOTO L_3DDE
L_3D57:
03D57  PRINT CHR$(CINT(I! + 48)); ">"; CrewName$(CINT(I!));
03D8F  LOCATE , 12
03D92  PRINT FNCrew(I!, 15); "/"; FNCrew(I!, 16);
03DDB  LOCATE , 21
L_3DDE:
03DFA  IF FNCrew(I!, 0) <= 0 THEN GOTO L_3E28
L_3DFF:
03DFF  PRINT Status$(CINT(FNCrew(I!, 31)))
L_3E28:
03E31  NEXT I!
L_3E44:
03E4D  LOCATE 24, 8
03E50  GOSUB SUB_12B5
03E53  GOSUB SUB_13E5
03E56  GOTO L_3C56
L_3E59:
03E5F  Member! = 1
03E6A  MedSkill! = 0
03E72  FOR I! = 1 TO 6
L_3E76:
03EC3  IF NOT ((FNCrew(I!, 20) >= MedSkill!) AND (FNCrew(I!, 31) > 0)) THEN GOTO L_3EEF
L_3EC8:
03ED0  Member! = I!
03EEC  MedSkill! = FNCrew(I!, 20)
L_3EEF:
03EF8  NEXT I!
L_3F0B:
03F0B  GOSUB SUB_14CA
03F17  LOCATE 15, 26
03F1A  PRINT CrewName$(CINT(Member!))
03F3B  LOCATE 16, 26
03F3E  PRINT "will heal"
03F50  NoOxygen! = 0
03F59  FOR M! = 1 TO 6
L_3F5C:
03FBE  IF (FNCrew(M!, 31) = 0) OR (FNCrew(M!, 15) >= FNCrew(M!, 16)) THEN GOTO L_4154
L_3FC3:
03FC9  NoOxygen! = 1
03FCF  ItemType! = 1
03FD2  GOSUB SUB_1707
03FE8  MedSkill! = (MedSkill! * Found!) * 10
03FEB  GOSUB SUB_150E
03FF7  LOCATE 19, 26
03FFA  PRINT CrewName$(CINT(M!)); " is"
04021  LOCATE 20, 26
04033  IF RND * 100 <= MedSkill! THEN GOTO L_4047
L_4038:
04038  PRINT "not healed"
04044  GOTO L_4145
L_4047:
04067  Tmp! = FNCrew(M!, 15) + 4
0408B  IF FNCrew(M!, 16) > Tmp! THEN GOTO L_40BC
L_4090:
040AA  Tmp! = FNCrew(M!, 16)
040AD  PRINT "fully healed"
040B9  GOTO L_40C8
L_40BC:
040BC  PRINT "healed 4 pts"
L_40C8:
040ED  G!(CINT(FNIdx(M!, 15))) = Tmp!
04112  IF NOT ((RND > 0.8) AND (Found! = 1)) THEN GOTO L_4145
L_4117:
04120  LOCATE 22, 26
04123  PRINT "Medkit used up"
04142  G!(CINT(ItemRec!)) = 0
L_4145:
0414E  LOCATE 24, 26
04151  GOSUB SUB_12B5
L_4154:
0415D  NEXT M!
L_4170:
04176  IF NoOxygen! <> 0 THEN GOTO L_41B5
L_417B:
0417B  GOSUB SUB_150E
04187  LOCATE 20, 26
0418A  PRINT "Squad is"
041A0  LOCATE 21, 26
041A3  PRINT "fully healed"
041AF  GOSUB SUB_128E
041B2  GOTO L_3C56
L_41B5:
041B5  GOTO L_3C56
L_41B8:
041B8  GOSUB SUB_13C5
L_41BB:
041C1  Prompt$ = "Inspect Who?"
041C4  GOSUB SUB_10D3
041CD  IF Member! <> 0 THEN GOTO L_41D8
L_41D2:
041D2  GOSUB SUB_13E5
041D5  GOTO L_2408
L_41D8:
041D8  GOSUB SUB_14CA
041DB  GOSUB SUB_1378
041E9  LOCATE 2, 3
04204  Rec! = FNIdx(Member!, 0)
04207  PRINT LEFT$(Rank$(CINT(G!(CINT(Rec! + 34)))), 12); " "; CrewName$(CINT(Member!))
04256  LOCATE 4, 2
0427C  Age! = (G!(CINT(Rec! + 29))) * 0.005479452
0427F  PRINT INT(Age!); "years   "; Status$(CINT(G!(CINT(Rec! + 31))))
042C2  LOCATE 5, 14
042C5  PRINT "HP"; INT(G!(CINT(Rec! + 15))); "/"; INT(G!(CINT(Rec! + 16)))
04315  FOR I! = 0 TO 6
L_4318:
0432E  LOCATE CINT(I! + 6), 2
04331  PRINT AttrName$(CINT(I!)); STRING$(19 - LEN(STR$(G!(CINT(I! + Rec!)))) - LEN(AttrName$(CINT(I!))), "."); MID$(STR$(G!(CINT(I! + Rec!))), 2, 3)
04398  NEXT I!
L_43AB:
043AB  GOSUB SUB_4B30
043B7  LOCATE 14, 2
043BA  PRINT "To Hit Bonus....";
043CB  PRINT USING "+##"; G!(CINT(Rec! + 10));
043EC  PRINT "%"
04400  LOCATE 15, 2
04403  PRINT "Defence Bonus...";
04411  PRINT USING "+##"; G!(CINT(Rec! + 11));
0442D  PRINT "%"
04441  LOCATE 16, 2
04444  PRINT "Maximum Weight..";
04453  PRINT USING "##"; G!(CINT(Rec! + 13));
0446F  PRINT " kg"
04484  LOCATE 17, 2
04487  PRINT "Current Weight..";
04498  PRINT USING "##"; INT(G!(CINT(Rec! + 14)));
044BF  PRINT " kg"
044D3  LOCATE 18, 2
044D6  PRINT "Max Movement....";
044E4  PRINT USING "##"; G!(CINT(Rec! + 12))
04508  LOCATE 19, 2
0450B  PRINT "Cur Movement....";
04519  PRINT USING "##"; G!(CINT(Rec! + 8))
0453E  LOCATE 21, 2
0455D  IF G!(CINT(Rec! + 35)) >= 3 THEN GOTO L_4571
L_4562:
04562  PRINT "Non-Esper"
0456E  GOTO L_457D
L_4571:
04571  PRINT "Esper Ability:"
L_457D:
04596  IF G!(CINT(Rec! + 27)) <= 0 THEN GOTO L_45D6
L_459B:
045A4  LOCATE 21, 17
045A7  PRINT "Level"; INT(G!(CINT(Rec! + 27)))
045C7  LOCATE 22, 3
045CA  PRINT "Mindshock"
L_45D6:
045F2  IF G!(CINT(Rec! + 27)) <= 2 THEN GOTO L_460F
L_45F7:
04600  LOCATE 22, 14
04603  PRINT "Communicate"
L_460F:
0462B  IF G!(CINT(Rec! + 27)) <= 4 THEN GOTO L_4648
L_4630:
04639  LOCATE 23, 3
0463C  PRINT "Heal"
L_4648:
04664  IF G!(CINT(Rec! + 27)) <= 6 THEN GOTO L_4681
L_4669:
04672  LOCATE 23, 9
04675  PRINT "View"
L_4681:
0469D  IF G!(CINT(Rec! + 27)) <= 7 THEN GOTO L_46BA
L_46A2:
046AB  LOCATE 23, 15
046AE  PRINT "Psy Scream"
L_46BA:
046BA  GOSUB SUB_6658
046C6  IF Cmd! < -40 THEN GOTO L_4B2A
L_46CB:
046CB  GOSUB SUB_13A3
046D4  FOR I! = 0 TO 11
L_46D8:
046EE  LOCATE CINT(I! + 7), 2
046F1  PRINT LEFT$(Skill$(CINT(I! + 1)), 20); STRING$(-(POS(0) - 23), "."); CHR$(CINT(G!(CINT(Rec! + I! + 17)) + 48))
0475C  NEXT I!
L_476F:
0476F  GOSUB SUB_6658
0477B  IF Cmd! < -40 THEN GOTO L_4B2A
L_4780:
04780  GOSUB SUB_13A3
0478C  LOCATE 4, 2
0478F  PRINT "Armor.............";
047A0  PRINT USING "##"; G!(CINT(Rec! + 48));
047C1  PRINT "/";
047CF  PRINT USING "##"; G!(CINT(Rec! + 49))
047F3  LOCATE 5, 2
047F6  PRINT "Sighting Hardware.";
04804  PRINT USING "##"; G!(CINT(Rec! + 43));
04820  PRINT "%"
04835  LOCATE 6, 2
04838  PRINT "Clones............";
04849  PRINT USING "#"; G!(CINT(Rec! + 50))
04872  LOCATE 7, 2
04875  PRINT "Hand Weapon.......";
04884  PRINT USING "##"; G!(CINT(Rec! + 45));
048A0  PRINT " pt"
048B2  I! = 0
048BB  FOR ItemRec! = 2300 TO 2597
L_48BE:
0491A  IF NOT ((I! < 15) AND ((G!(CINT(ItemRec!)) > 0) AND (G!(CINT(ItemRec! + 2)) = Member! + 2))) THEN GOTO L_4960
L_491F:
04927  I! = I! + 1
0493B  LOCATE CINT(I! + 8), 2
0493E  PRINT LEFT$(MiscItemName$(CINT(G!(CINT(ItemRec!)) + -1)), 23)
L_4960:
04969  NEXT ItemRec! STEP 3
L_497C:
0497C  GOSUB SUB_6658
04988  IF Cmd! < -40 THEN GOTO L_4B2A
L_498D:
0498D  GOSUB SUB_13A3
04999  LOCATE 4, 2
0499C  PRINT "Rlds    Weapons"
049A8  GOSUB SUB_667D
049B1  ItemRec! = 800
049BA  ListRow! = 4
L_49BD:
049D4  GunType! = G!(CINT(ItemRec!))
04A16  IF NOT ((G!(CINT(ItemRec! + 9)) <> Member! + 2) OR (GunType! < 1)) THEN GOTO L_4A37
L_4A1B:
04A25  ItemRec! = ItemRec! + 12
04A30  IF ItemRec! > 1090 THEN GOTO L_4B27
L_4A35:
04A35  GOTO L_49BD
L_4A37:
04A49  LOCATE CINT(ListRow! + 1), 4
04A65  RldCnt! = G!(CINT(GunType! + 500))
04A70  IF RldCnt! <= 9 THEN GOTO L_4A7D
L_4A75:
04A7A  RldCnt! = 0
L_4A7D:
04A7D  PRINT CHR$(CINT(RldCnt! + 48)); "  ";
04AB4  IF G!(CINT(ItemRec! + 3)) >= 0 THEN GOTO L_4AC8
L_4AB9:
04AB9  PRINT "*";
04AC5  GOTO L_4AD4
L_4AC8:
04AC8  PRINT " ";
L_4AD4:
04AEB  ListLine$ = WeaponName$(CINT(GunType! - 1))
04AEE  GOSUB SUB_673F
04AFC  ItemRec! = ItemRec! + 12
04B22  IF (ItemRec! < 1090) AND (ListRow! < 23) THEN GOTO L_49BD
L_4B27:
04B27  GOSUB SUB_6658
L_4B2A:
04B2A  GOSUB SUB_1378
04B2D  GOTO L_41BB
SUB_4B30:
04B36  Carried! = 0
04B4E  Rec! = FNIdx(Member!, 0)
04C1D  G!(CINT(Rec! + 39)) = (G!(CINT(Rec! + 42))) * (SGN(G!(CINT(Rec! + 41)))) + (G!(CINT(Rec! + 44))) * (SGN(G!(CINT(Rec! + 90)))) + (G!(CINT(Rec! + 91))) * (SGN(G!(CINT(Rec! + 47))))
04C2C  OwnerCode! = Member! + 2
04C35  FOR I! = 800 TO 1088
L_4C38:
04CA2  Carried! = Carried! - (((G!(CINT(I! + 9)) = OwnerCode!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 5))))
04CAD  NEXT I! STEP 12
L_4CC0:
04CC6  FOR I! = 1100 TO 1397
L_4CCA:
04D34  Carried! = Carried! - (((G!(CINT(I! + 2)) = OwnerCode!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 1))))
04D3F  NEXT I! STEP 3
L_4D52:
04D58  FOR I! = 2300 TO 2597
L_4D5C:
04DC6  Carried! = Carried! - (((G!(CINT(I! + 2)) = OwnerCode!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 1))))
04DD1  NEXT I! STEP 3
L_4DE4:
04E2B  G!(CINT(Rec! + 14)) = INT((G!(CINT(Rec! + 39)) + Carried!) / 10)
04E6F  Tmp! = 2 - ((G!(CINT(Rec! + 14))) / (G!(CINT(Rec! + 13))))
04E9E  Tmp! = INT((G!(CINT(Rec! + 12))) * Tmp! + 0.5)
04EA6  IF Tmp! >= 0 THEN GOTO L_4EB4
L_4EAB:
04EAE  Tmp! = 0
04EB1  GOTO L_4ED8
L_4EB4:
04ED0  IF G!(CINT(Rec! + 12)) >= Tmp! THEN GOTO L_4ED8
L_4ED5:
04ED5  Tmp! = G!(CINT(Rec! + 12))
L_4ED8:
04F03  G!(CINT(Rec! + 8)) = INT(Tmp! + 0.5)
04F06  RETURN   'with FAC = INT(Tmp! + 0.5)
SUB_4F07:
04F0D  MinusOne2! = -1
04F16  FOR I! = 6 TO 1
L_4F1A:
04F49  SWAP CrewName$(CINT(I! + 2)), CrewName$(CINT(I!))
04F54  NEXT I! STEP MinusOne2!
L_4F7D:
04F7D  RETURN
L_4F7E:
04F84  ListRow! = 3
04F8D  Found! = 0
04F96  ListIdx! = -1
04F99  GOSUB SUB_13C5
04F9C  GOSUB SUB_1378
04F9F  GOSUB SUB_1378
04FAB  LOCATE 2, 10
04FAE  PRINT "EQUIPING"
04FC0  FOR ItemRec! = 800 TO 1088
L_4FC4:
0500C  IF NOT ((G!(CINT(ItemRec! + 9)) > 2) AND (G!(CINT(ItemRec!)) > 0)) THEN GOTO L_5036
L_5011:
05027  ListLine$ = WeaponName$(CINT(G!(CINT(ItemRec!)) - 1))
05030  EquipRec! = ItemRec! + 9
05033  GOSUB SUB_51BA
L_5036:
0503F  NEXT ItemRec! STEP 12
L_5052:
0505B  IF ItemRec! > 3333 THEN GOTO L_53D4
L_5060:
05066  FOR ItemRec! = 1100 TO 1397
L_506A:
050AF  IF NOT ((G!(CINT(ItemRec! + 2)) > 2) AND (G!(CINT(ItemRec!)) > 0)) THEN GOTO L_50DF
L_50B4:
050D0  ListLine$ = "Ammo For " + WeaponName$(CINT(G!(CINT(ItemRec!)) - 1))
050D9  EquipRec! = ItemRec! + 2
050DC  GOSUB SUB_51BA
L_50DF:
050E8  NEXT ItemRec! STEP 3
L_50FB:
05104  IF ItemRec! > 3333 THEN GOTO L_53D4
L_5109:
0510F  FOR ItemRec! = 2300 TO 2597
L_5112:
05157  IF NOT ((G!(CINT(ItemRec! + 2)) > 2) AND (G!(CINT(ItemRec!)) > 0)) THEN GOTO L_5181
L_515C:
05172  ListLine$ = MiscItemName$(CINT(G!(CINT(ItemRec!)) - 1))
0517B  EquipRec! = ItemRec! + 2
0517E  GOSUB SUB_51BA
L_5181:
0518A  NEXT ItemRec! STEP 3
L_519D:
051A6  IF ItemRec! > 3333 THEN GOTO L_53D4
L_51AB:
051B1  Found! = 1
051B4  GOSUB SUB_51BA
051B7  GOTO L_53D4
SUB_51BA:
051C0  IF Found! > 0 THEN GOTO L_5270
L_51C5:
051D2  ListIdx! = ListIdx! + 1
051F8  G!(CINT(ListIdx! + 500)) = ListRow! + 1
05204  LOCATE CINT(ListRow! + 1), 2
05207  PRINT CHR$(CINT(ListIdx! + 65)); "-"; CHR$(CINT(G!(CINT(EquipRec!)) + 46))
05254  LOCATE CINT(ListIdx! + 4), 7
05257  GOSUB SUB_673F
0526D  ListRec!(CINT(ListIdx!)) = EquipRec!
L_5270:
0528F  IF NOT ((ListRow! < 21) AND (Found! = 0)) THEN GOTO L_5295
L_5294:
05294  RETURN
L_5295:
0529B  IF ListIdx! >= 0 THEN GOTO L_52A1
L_52A0:
052A0  RETURN
L_52A1:
052AA  LOCATE 23, 2
052AD  PRINT "SPACEBAR for more"
052C3  LOCATE 24, 2
052C6  PRINT "A-R to change owner";
L_52D2:
052D8  CmdMin! = 1
052E6  CmdMax! = ListIdx! + 1
052E9  GOSUB SUB_12E9
052F5  IF Cmd! <> -51 THEN GOTO L_5304
L_52FA:
05300  ItemRec! = 9999
05303  RETURN
L_5304:
0530D  IF Cmd! <> -32 THEN GOTO L_5328
L_5312:
05318  ListIdx! = -1
05321  ListRow! = 3
05324  GOSUB SUB_1552
05327  RETURN
L_5328:
05354  Tmp! = G!(CINT(ListRec!(CINT(Cmd! - 1)))) + 1
0535F  IF Tmp! <= 8 THEN GOTO L_536C
L_5364:
05369  Tmp! = 3
L_536C:
05396  G!(CINT(ListRec!(CINT(Cmd! - 1)))) = Tmp!
053B7  LOCATE CINT(G!(CINT(Cmd! + 499))), 4
053BA  PRINT CHR$(CINT(Tmp! + 46))
053D1  GOTO L_52D2
L_53D4:
053D4  GOSUB SUB_13E5
053D7  GOTO L_2408
L_53DA:
053E0  Found! = 0
053E9  FOR I! = 1 TO 6
L_53EC:
05439  IF NOT ((FNCrew(I!, 54) > 0) AND (FNCrew(I!, 27) > 6)) THEN GOTO L_5499
L_543E:
05444  Found! = I!
0548D  G!(CINT(FNIdx(I!, 54))) = FNCrew(I!, 54) - 1
05496  I! = 9
L_5499:
054A2  NEXT I!
L_54B5:
054BB  IF Found! <> 0 THEN GOTO L_54DD
L_54C0:
054D7  SOUND 900, SndDur! * 7
054DA  GOTO L_2408
L_54DD:
054DD  GOSUB SUB_14CA
054E9  LOCATE 16, 29
054EC  PRINT CrewName$(CINT(Found!))
0550D  LOCATE 17, 29
05510  PRINT "views..."
0551C  GOSUB SUB_13C5
05525  FOR M! = 1 TO 10
L_5528:
05553  SOUND CINT(M! * 1000), (M! * SndDur!) / 5
0555F  NEXT M!
05582  PUT (8, 7), MapPic, PRESET
05585  GOSUB SUB_13E5
05594  ViewX0! = X! - 2
0559C  IF ViewX0! >= 0 THEN GOTO L_55A7
L_55A1:
055A4  ViewX0! = 0
L_55A7:
055B3  ViewX1! = X! + 2
055BE  IF ViewX1! <= 36 THEN GOTO L_55C8
L_55C3:
055C5  ViewX1! = 36
L_55C8:
055D4  ViewY0! = Y! - 2
055DC  IF ViewY0! >= 0 THEN GOTO L_55E7
L_55E1:
055E4  ViewY0! = 0
L_55E7:
055F3  ViewY1! = Y! + 2
055FE  IF ViewY1! <= 36 THEN GOTO L_5608
L_5603:
05605  ViewY1! = 36
L_5608:
0560E  Found! = 0
05617  ViewXEnd! = ViewX1!
05620  FOR I! = ViewX0! TO ViewXEnd!
L_5624:
0562A  ViewYEnd! = ViewY1!
05633  FOR J! = ViewY0! TO ViewYEnd!
L_5636:
05662  ViewRoom! = INT((InMap%(CINT(J! * 37 + I!))) * 0.015625)
0567C  IF FNRoom(ViewRoom!, 1) <= 0 THEN GOTO L_568A
L_5681:
05687  Found! = 1
L_568A:
056BB  IF NOT ((FNRoom(ViewRoom!, 5) = 0) AND (ViewRoom! > 0)) THEN GOTO L_56CC
L_56C0:
056C6  DrawRoom! = ViewRoom!
056C9  GOSUB SUB_1B23
L_56CC:
056D5  NEXT J!
L_56E8:
056F1  NEXT I!
L_5704:
0570D  LOCATE 20, 29
05718  IF (Found! = 0) THEN GOTO L_572C
L_571D:
0571D  PRINT "Beings!"
05729  GOTO L_5738
L_572C:
0572C  PRINT "No Life"
L_5738:
05738  GOSUB SUB_128E
0573B  GOSUB SUB_128E
0573E  GOSUB SUB_128E
05741  GOTO L_2408
SUB_5744:
05756  IF ABS(TIMER - RadTimer!) >= 0.23 THEN GOTO L_575C
L_575B:
0575B  RETURN   'with FAC = ABS(TIMER - RadTimer!)
L_575C:
05762  IF RadSweep! <= 0 THEN GOTO L_576A
L_5767:
05767  GOSUB SUB_5829
L_576A:
0578C  IF NOT ((RND > 0.995) AND (RND < 0.005)) THEN GOTO L_57F1
L_5791:
05797  RadDetOn! = 0
057B2  G!(CINT(RadDetRec!)) = 0
057CD  G!(CINT(RadDetRec! + 1)) = 0
057E7  G!(CINT(RadDetRec! + 2)) = 0
057ED  RadSweep! = 0
057F0  RETURN   'with FAC = RadDetRec! + 2
L_57F1:
057F7  RadTimer! = TIMER
05822  RadSweep! = (RadSweep! > 24) * 25 + RadSweep! + 1
05825  GOSUB SUB_5829
05828  RETURN
SUB_5829:
0584A  PUT (RadSweep! * 8 - 7, 1), BlipH, XOR
0585C  PUT (RadSweep! * 8 - 7, 192), BlipH, XOR
0585F  RETURN   'with FAC = RadSweep! * 8 - 7
SUB_5860:
05872  IF ABS(TIMER - MotTimer!) >= 0.07 THEN GOTO L_5878
L_5877:
05877  RETURN   'with FAC = ABS(TIMER - MotTimer!)
L_5878:
0587E  IF MotSweep! <= 0 THEN GOTO L_5886
L_5883:
05883  GOSUB SUB_5945
L_5886:
058A8  IF NOT ((RND > 0.995) AND (RND < 0.005)) THEN GOTO L_590D
L_58AD:
058B3  MotDetOn! = 0
058CE  G!(CINT(MotDetRec!)) = 0
058E9  G!(CINT(MotDetRec! + 1)) = 0
05903  G!(CINT(MotDetRec! + 2)) = 0
05909  MotSweep! = 0
0590C  RETURN   'with FAC = MotDetRec! + 2
L_590D:
05913  MotTimer! = TIMER
0593E  MotSweep! = (MotSweep! > 24) * 25 + MotSweep! + 1
05941  GOSUB SUB_5945
05944  RETURN
SUB_5945:
05966  PUT (1, MotSweep! * 8 - 7), BlipV, XOR
05978  PUT (193, MotSweep! * 8 - 7), BlipV, XOR
0597B  RETURN   'with FAC = MotSweep! * 8 - 7
L_597C:
0597C  GOSUB SUB_13C5
L_597F:
05985  Prompt$ = "Who'll change?"
05988  GOSUB SUB_10D3
0598B  GOSUB SUB_14CA
05994  IF Member! <> 0 THEN GOTO L_599F
L_5999:
05999  GOSUB SUB_13E5
0599C  GOTO L_2408
L_599F:
0599F  GOSUB SUB_1378
059A2  GOSUB SUB_667D
059AB  WeaponRec! = 788
059CA  WepSlot! = FNCrew(Member!, 32)
059D2  IF WepSlot! <= 0 THEN GOTO L_5A41
L_59D7:
059E6  SlotRec! = WepSlot! * 12 + 788
05A34  IF NOT ((G!(CINT(SlotRec! + 9)) = Member! + 2) AND (G!(CINT(SlotRec!)) > 0)) THEN GOTO L_5A41
L_5A39:
05A3E  WeaponRec! = SlotRec!
L_5A41:
05A4A  LOCATE 6, 2
05A4D  PRINT CrewName$(CINT(Member!)); " Is Using:"
05A74  LOCATE 8, 2
05A77  GOSUB SUB_5C12
05A83  LOCATE 14, 2
05A86  PRINT "SPACE to change weapon"
05A9C  LOCATE 15, 2
05A9F  PRINT "ENTER to select"
L_5AAB:
05AB6  LOCATE 18, 2
05AB9  PRINT SPC(23);
05AD1  LOCATE 19, 2
05AD4  PRINT SPC(23);
05AE5  LOCATE 18, 2
05AE8  GOSUB SUB_5C12
05AF1  CmdMax! = 0
05AF4  GOSUB SUB_12E9
05B00  IF Cmd! = -51 THEN GOTO L_5B80
L_5B05:
05B10  WeaponRec! = WeaponRec! + 12
05B1B  IF WeaponRec! <= 1090 THEN GOTO L_5B2A
L_5B20:
05B25  WeaponRec! = 788
05B28  GOTO L_5AAB
L_5B2A:
05B7B  IF ((G!(CINT(WeaponRec! + 9)) <> Member! + 2) OR (G!(CINT(WeaponRec!)) < 1)) THEN GOTO L_5B05
05B7D  GOTO L_5AAB
L_5B80:
05BC1  G!(CINT(FNIdx(Member!, 32))) = INT((WeaponRec! - 788) / 12)
05BDF  IF FNCrew(Member!, 32) = WepSlot! THEN GOTO L_5C0C
L_5BE4:
05C09  G!(CINT(FNIdx(Member!, 37))) = 3
L_5C0C:
05C0C  GOSUB SUB_1378
05C0F  GOTO L_597F
SUB_5C12:
05C1B  IF WeaponRec! <> 788 THEN GOTO L_5C2D
L_5C20:
05C20  PRINT "Hand Weapon"
05C2C  RETURN
L_5C2D:
05C37  ListRow! = CSRLIN - 1
05C53  Ammo! = G!(CINT(WeaponRec! + 3))
05C5B  IF Ammo! >= 0 THEN GOTO L_5C69
L_5C60:
05C63  Ammo! = 0
05C66  GOTO L_5C7C
L_5C69:
05C72  IF Ammo! <= 9 THEN GOTO L_5C7C
L_5C77:
05C79  Ammo! = 9
L_5C7C:
05CA2  Reloads! = G!(CINT(G!(CINT(WeaponRec!)) + 500))
05CAD  IF Reloads! <= 9 THEN GOTO L_5CB7
L_5CB2:
05CB4  Reloads! = 9
L_5CB7:
05CB7  PRINT "A"; CHR$(CINT(Ammo! + 48)); " R"; CHR$(CINT(Reloads! + 48));
05D03  IF G!(CINT(WeaponRec! + 3)) >= 0 THEN GOTO L_5D17
L_5D08:
05D08  PRINT "*";
05D14  GOTO L_5D23
L_5D17:
05D17  PRINT " ";
L_5D23:
05D47  ListLine$ = WeaponName$(CINT(G!(CINT(WeaponRec!)) - 1))
05D4A  GOSUB SUB_673F
05D4D  RETURN
L_5D4E:
05D4E  GOSUB SUB_14CA
05D5A  LOCATE 19, 28
05D5D  PRINT "Reloading"
05D6F  FOR I! = 800 TO 1088
L_5D72:
05D89  WepSlot! = G!(CINT(I!))
05DBB  IF NOT ((G!(CINT(I! + 3)) = 0) AND (WepSlot! > 0)) THEN GOTO L_5DC3
L_5DC0:
05DC0  GOSUB SUB_5DDF
L_5DC3:
05DCC  NEXT I! STEP 12
05DDC  GOTO L_2408
SUB_5DDF:
05DE5  FOR J! = 1100 TO 1397
L_5DE8:
05E2E  IF NOT ((G!(CINT(J! + 2)) > 2) AND (G!(CINT(J!)) = WepSlot!)) THEN GOTO L_5ED4
L_5E33:
05E3A  G!(CINT(J!)) = 0
05E58  G!(CINT(J! + 1)) = 0
05E5D  G!(CINT(J! + 2)) = 0
05E65  J! = 9999
05E9D  G!(CINT(I! + 3)) = G!(CINT(I! + 4))
05EB7  SOUND 6666, SndDur! * 0.3
05ED1  SOUND 66, SndDur! * 0.3
L_5ED4:
05EDD  NEXT J! STEP 3
L_5EF0:
05EF0  RETURN
L_5EF1:
05F09  Script! = FNRoom(RoomNo!, 2)
05F11  IF Script! <> 0 THEN GOTO L_5F67
L_5F16:
05F16  GOSUB SUB_14CA
05F22  LOCATE 18, 29
05F25  PRINT "You Find"
05F3B  LOCATE 19, 29
05F3E  PRINT "Nothing"
05F52  LOCATE 20, 29
05F55  PRINT "Unusual"
05F61  GOSUB SUB_128E
05F64  GOTO L_2408
L_5F67:
05F67  GOTO L_6BF2
L_5F6A:
05F6A  GOSUB SUB_14CA
05F76  LOCATE 15, 26
05F79  PRINT "A-Activate"
05F90  LOCATE 16, 28
05F93  PRINT "Motion"
05FA9  LOCATE 17, 28
05FAC  PRINT "Dectector"
05FC0  LOCATE 19, 26
05FC3  PRINT "B-Activate"
05FD7  LOCATE 20, 28
05FDA  PRINT "Radiation"
05FEE  LOCATE 21, 28
05FF1  PRINT "Dectector"
06003  CmdMin! = 1
0600C  CmdMax! = 2
0600F  GOSUB SUB_12E9
06018  IF Cmd! < 0 THEN GOTO L_2408
L_601D:
06026  IF Cmd! = 1 THEN GOTO L_6075
L_602B:
06031  ItemType! = 11
06034  GOSUB SUB_1707
0603D  IF Found! = 0 THEN GOTO L_6057
L_6042:
06048  RadDetOn! = 1
06051  RadDetRec! = ItemRec!
06054  GOTO L_5F6A
L_6057:
06060  LOCATE 23, 26
06063  PRINT "You Have None"
0606F  GOSUB SUB_128E
06072  GOTO L_5F6A
L_6075:
0607B  ItemType! = 4
0607E  GOSUB SUB_1707
0608A  IF Found! = 1 THEN GOTO L_60A3
L_608F:
06095  ItemType! = 3
06098  GOSUB SUB_1707
060A1  IF Found! = 0 THEN GOTO L_6057
L_60A3:
060AF  MotDetOn! = ItemType! - 2
060B8  MotDetRec! = ItemRec!
060BB  GOTO L_5F6A
SUB_60BE:
060C6  IF (RadDetOn! = 0) THEN GOTO L_60CE
L_60CB:
060CB  GOSUB SUB_5744
L_60CE:
060D4  IF MapHidden! <> 0 THEN GOTO L_6113
L_60D9:
06110  PUT (X! * 5 + 8, Y! * 5 + 7), Tile42, XOR
L_6113:
0611B  IF (MotDetOn! = 0) THEN GOTO L_6123
L_6120:
06120  GOSUB SUB_5860
L_6123:
06129  IF MapHidden! <> 0 THEN GOTO L_6168
L_612E:
06165  PUT (X! * 5 + 8, Y! * 5 + 7), Tile42, XOR
L_6168:
06168  RETURN
SUB_6169:
0616F  ScoutSkill! = -1
06178  Scout! = 1
0617E  FOR Member! = 1 TO 6
L_6182:
061CF  IF NOT ((FNCrew(Member!, 19) > ScoutSkill!) AND (FNCrew(Member!, 31) > 0)) THEN GOTO L_61FA
L_61D4:
061EE  ScoutSkill! = FNCrew(Member!, 19)
061F7  Scout! = Member!
L_61FA:
06203  NEXT Member!
L_6216:
06216  RETURN
SUB_6217:
06235  NewHP! = FNCrew(Member!, 15) - Damage!
06240  IF NewHP! >= 1 THEN GOTO L_624D
L_6245:
0624A  NewHP! = 0
L_624D:
06272  G!(CINT(FNIdx(Member!, 15))) = NewHP!
062A4  IF NOT ((FNCrew(Member!, 31) <> 0) AND (NewHP! = 0)) THEN GOTO L_62FA
L_62A9:
062A9  PRINT "dies!!!"
062CC  SOUND 900, SndDur! * 28
062F4  G!(CINT(FNIdx(Member!, 31))) = 0
062F7  GOTO L_6312
L_62FA:
062FA  PRINT "takes"; Damage!; "hits"
L_6312:
06318  Found! = 0
06321  FOR I! = 1 TO 6
L_6324:
06342  Found! = SGN(FNCrew(I!, 31)) + Found!
0634E  NEXT I!
06364  IF Found! = 0 THEN GOTO L_636A
L_6369:
06369  RETURN
L_636A:
0636A  GOSUB SUB_1378
06376  LOCATE 13, 5
06379  PRINT "You Are All Dead"
L_6385:
06385  GOTO L_6385
SUB_6387:
063BB  BSAVE Drive$ + "IN" + STR$(-Location!) + ".BAS", &H48B0, 5502
063BE  GOSUB SUB_13C5
063F5  BSAVE Drive$ + "INMAP" + STR$(-Location!) + ".BAS", &H5E2E, 8700
063F8  RETURN   'with FAC = -Location!
SUB_63F9:
063FF  RadDetOn! = 0
06405  MotDetOn! = 0
06439  BLOAD Drive$ + "IN" + STR$(-Location!) + ".BAS", &H48B0
0646D  BLOAD Drive$ + "INMAP" + STR$(-Location!) + ".BAS", &H5E2E
06470  GOSUB SUB_13E5
SUB_6473:
0649D  OPEN Drive$ + "MES" + STR$(-Location!) FOR INPUT AS #1
064A6  I! = 0
L_64A9:
064BD  LINE INPUT #1, MesLine$(CINT(I!))
064C8  IF NOT (EOF(1)) THEN GOTO L_64D4
L_64CD:
064D0  CLOSE #1
064D3  RETURN
L_64D4:
064DF  I! = I! + 1
064E2  GOTO L_64A9
L_64E4:
064E4  GOSUB SUB_13C5
06557  Surprise! = (ABS(RND * 100 < 50 - (MotDetOn! * 20) + FNRoom(RoomNo!, 4) * 20)) * 2 + INT(RND * 1.8)
06562  IF Surprise! <> 3 THEN GOTO L_656F
L_6567:
0656C  Surprise! = 0
SUB_656F:
06575  Surprise! = Surprise!
06578  GOSUB SUB_14CA
06584  LOCATE 18, 26
0658D  IF Surprise! <> 0 THEN GOTO L_65BA
L_6592:
06592  PRINT "Confrontation"
065A8  LOCATE 19, 26
065AB  PRINT "with enemies"
065B7  GOTO L_6613
L_65BA:
065C3  IF Surprise! <> 1 THEN GOTO L_65EF
L_65C8:
065C8  PRINT "You surprise"
065DD  LOCATE 19, 26
065E0  PRINT "enemies"
065EC  GOTO L_6613
L_65EF:
065EF  PRINT "Enemies"
06604  LOCATE 19, 26
06607  PRINT "surprise you"
L_6613:
06619  InBattle! = 1
06634  Enclosure! = FNRoom(RoomNo!, 4)
0663D  ChainArg! = EnemyGroup!
06646  Terrain! = 11
06649  GOSUB SUB_4F07
06655  CHAIN Drive$ + "PLBATTLE.EXE"
SUB_6658:
06661  LOCATE 24, 6
06664  PRINT "Press SPACEBAR";
06676  CmdMax! = 0
06679  GOSUB SUB_12E9
0667C  RETURN
SUB_667D:
06683  FOR I! = 501 TO 554
L_6686:
0669D  G!(CINT(I!)) = 0
066A8  NEXT I!
066BE  FOR I! = 1100 TO 1397
L_66C2:
066E9  IF G!(CINT(I! + 2)) <> Member! + 2 THEN GOTO L_6725
L_66EE:
06706  Tmp! = G!(CINT(I!)) + 500
06722  G!(CINT(Tmp!)) = G!(CINT(Tmp!)) + 1
L_6725:
0672E  NEXT I! STEP 3
0673E  RETURN
SUB_673F:
0674C  ListRow! = ListRow! + 1
06762  SpacePos! = INSTR(ListLine$, " ")
0676F  WrapFrom! = SpacePos! + 1
0679D  IF NOT ((LEN(ListLine$) < 18) OR ((SpacePos! > 18) OR (SpacePos! = 0))) THEN GOTO L_67B8
L_67A2:
067AA  CutLen! = 17
067B2  TextRow! = 18
067B5  GOTO L_681C
L_67B8:
067D3  SpacePos! = INSTR(CINT(WrapFrom!), ListLine$, " ")
067F1  IF NOT ((SpacePos! < 19) AND (SpacePos! > 0)) THEN GOTO L_6803
L_67F6:
067FE  WrapFrom! = SpacePos! + 1
06801  GOTO L_67B8
L_6803:
06811  CutLen! = WrapFrom! - 2
06819  TextRow! = WrapFrom!
L_681C:
0682C  LOCATE CINT(ListRow!), 8
0682F  PRINT LEFT$(ListLine$, CINT(CutLen!))
0685A  IF LEN(ListLine$) <= CutLen! THEN GOTO L_6891
L_685F:
0686A  ListRow! = ListRow! + 1
06877  LOCATE CINT(ListRow!), 8
0687A  PRINT MID$(ListLine$, CINT(TextRow!), 17);
L_6891:
06891  RETURN
L_6892:
06892  GOSUB SUB_14CA
0689E  LOCATE 16, 26
068A1  PRINT "Standard"
068B7  LOCATE 17, 26
068BA  PRINT "Delay:"; StdDelay!
068D4  LOCATE 19, 26
068D7  PRINT "Current"
068EB  LOCATE 20, 26
068EE  PRINT "Delay:"; Delay!
06908  LOCATE 22, 26
0690B  PRINT "New Delay"
0691F  LOCATE 23, 26
06922  PRINT "(1-9999):";
0692E  GOSUB SUB_1574
06936  IF InputVal% >= 1 THEN GOTO L_6941
L_693B:
0693B  InputVal% = 1
L_6941:
06947  IF InputVal% <= 9999 THEN GOTO L_6952
L_694C:
0694C  InputVal% = 9999
L_6952:
0695C  Delay! = InputVal%
0695F  GOTO L_2408
SUB_6962:
0696B  IF Option! >= 1 THEN GOTO L_697B
L_6970:
06975  Option! = 10
06978  GOTO L_698E
L_697B:
06984  IF Option! <= 22 THEN GOTO L_698E
L_6989:
0698B  Option! = 22
L_698E:
06997  LOCATE 17, 2
0699A  PRINT "Use arrow keys to pick"
069B0  LOCATE 18, 2
069B3  PRINT "option. ENTER to accept"
L_69BF:
069C8  LOCATE 20, 2
069CB  PRINT ">"; OptionName$(CINT(Option!));
069E8  PRINT SPC(-(POS(0) - 25));
069FB  GOSUB SUB_1405
06A07  IF Cmd! = 37 THEN GOTO L_6A9E
L_6A0C:
06A2B  IF NOT ((Cmd! = 7) OR (Cmd! = 2)) THEN GOTO L_6A54
L_6A30:
06A3D  Option! = Option! + 1
06A48  IF Option! <= 22 THEN GOTO L_6A54
L_6A4D:
06A51  Option! = 1
L_6A54:
06A73  IF NOT ((Cmd! = 10) OR (Cmd! = 5)) THEN GOTO L_6A9B
L_6A78:
06A83  Option! = Option! - 1
06A8E  IF Option! >= 1 THEN GOTO L_6A9B
L_6A93:
06A98  Option! = 22
L_6A9B:
06A9B  GOTO L_69BF
L_6A9E:
06AA7  IF Option! = 22 THEN GOTO L_6ACD
SUB_6AAC:
06AC9  LINE (8, 112)-(191, 191), 0, BF
06ACC  RETURN
L_6ACD:
06AD6  LOCATE 22, 2
06AD9  PRINT "Enter a single word"
06AEF  LOCATE 23, 2
06AF2  PRINT "-->";
06B04  MaxLen! = 10
06B07  GOSUB SUB_157D
06B16  Word$ = LEFT$(K$, 3)
06B1F  MinusOne! = -1
06B28  FOR I! = 100 TO 0
L_6B2C:
06B44  IF Word$ <> MesLine$(CINT(I!)) THEN GOTO L_6B5F
L_6B49:
06B54  Option! = I! + 100
06B5C  I! = -9
L_6B5F:
06B68  NEXT I! STEP MinusOne!
L_6B8B:
06BA8  LINE (8, 168)-(191, 191), 0, BF
06BB4  IF I! < -3 THEN GOTO L_6BF1
L_6BB9:
06BD0  SOUND 900, SndDur! * 7
06BDC  LOCATE 15, 2
06BDF  GOSUB SUB_6AAC
06BE2  PRINT "Unrecognized Command"
06BEE  GOTO L_6962
L_6BF1:
06BF1  RETURN
L_6BF2:
06BF2  GOSUB SUB_14CA
06BF5  GOSUB SUB_13C5
L_6BF8:
06C10  Op! = InMap%(CINT(Script!))
06C30  Arg1! = InMap%(CINT(Script! + 1))
06C4C  Arg2! = InMap%(CINT(Script! + 2))
06C68  Arg3! = InMap%(CINT(Script! + 3))
06C70  IF Op! >= 0 THEN GOTO L_6CC6
L_6C75:
06C8F  OneShotEnd! = OpLen%(CINT(ABS(Op!))) - 1 + Script!
06C97  FOR I! = Script! TO OneShotEnd!
L_6C9A:
06CA8  InMap%(CINT(I!)) = 0
06CB6  NEXT I!
L_6CC6:
06CCE  Op! = ABS(Op!)
06CE7  Script! = OpLen%(CINT(Op!)) + Script!
06CF6  ON CINT(Op! + 1) GOTO L_6BF8, L_6D30, L_6D59, L_6E46, L_6E5F, L_6E74, L_6E8D, L_6E9C, L_6F2E, L_6F5A, L_6F60, L_6F87, L_6FAE, L_6FD5, L_6FEF, L_6FFB, L_701B, L_7042, L_7069, L_7097, L_70B1, L_70C6, L_70EC, L_70F2, L_70F5, L_71A0, L_71B5
L_6D30:
06D39  IF TestMode! <> 1 THEN GOTO L_6D44
L_6D3E:
06D3E  BEEP
06D41  GOTO L_70EC
L_6D44:
06D4A  EnemyGroup! = Arg1!
06D53  Surprise! = 0
06D56  GOSUB SUB_656F
L_6D59:
06D59  GOSUB SUB_1378
06D6D  K$ = MesLine$(CINT(Arg1!))
06D90  TextRow! = 7 - (INT((LEN(K$) + 22) / 46))
06DA4  LastRow23! = LEN(K$) / 23
06DAD  FOR I! = 0 TO LastRow23!
L_6DB0:
06DC2  LOCATE CINT(TextRow! + I!), 2
06DC5  PRINT MID$(K$, CINT(I! * 23 + 1), 23)
06DF5  NEXT I!
06E23  LINE (8, 96)-(192, 97), , BF
06E2F  IF Op! <= 9 THEN GOTO L_6E43
L_6E34:
06E3D  LOCATE 19, 8
06E40  GOSUB SUB_12B5
L_6E43:
06E43  GOTO L_6BF8
L_6E46:
06E59  G!(CINT(Arg1!)) = Arg2!
06E5C  GOTO L_6BF8
L_6E5F:
06E65  X! = Arg1!
06E6E  Y! = Arg2!
06E71  GOTO L_6BF8
L_6E74:
06E86  InMap%(CINT(Arg1!)) = CINT(Arg2!)
06E8A  GOTO L_6BF8
L_6E8D:
06E93  Delta! = Arg1!
06E96  GOSUB SUB_1083
06E99  GOTO L_6BF8
L_6E9C:
06EA2  FOR I! = 1 TO 6
L_6EA6:
06EC0  IF FNCrew(I!, 31) <= 0 THEN GOTO L_6F0F
L_6EC5:
06F0C  G!(CINT(FNIdx(I!, Arg1!))) = FNCrew(I!, Arg1!) + Arg2!
L_6F0F:
06F18  NEXT I!
L_6F2B:
06F2B  GOTO L_6BF8
L_6F2E:
06F4A  IF G!(CINT(Arg1! + 109)) <> 1 THEN GOTO L_6F57
L_6F4F:
06F54  G!(CINT(Arg1! + 109)) = 2
L_6F57:
06F57  GOTO L_6BF8
L_6F5A:
06F5A  GOSUB SUB_6962
06F5D  GOTO L_6BF8
L_6F60:
06F69  LOCATE 15, 2
06F6C  PRINT "Nothing unusual happens"
06F78  GOSUB SUB_128E
06F81  Script! = Arg1!
06F84  GOTO L_6BF8
L_6F87:
06F90  LOCATE 15, 2
06F93  PRINT "Not valid or possible  "
06F9F  GOSUB SUB_128E
06FA8  Script! = Arg1!
06FAB  GOTO L_6BF8
L_6FAE:
06FB7  LOCATE 15, 2
06FBA  PRINT "What?                  "
06FC6  GOSUB SUB_128E
06FCF  Script! = Arg1!
06FD2  GOTO L_6BF8
L_6FD5:
06FDE  IF Option! <> Arg1! THEN GOTO L_6FEC
L_6FE3:
06FE9  Script! = Arg2!
L_6FEC:
06FEC  GOTO L_6BF8
L_6FEF:
06FF5  Script! = Arg1!
06FF8  GOTO L_6BF8
L_6FFB:
0700A  IF RND * 100 >= Arg1! THEN GOTO L_7018
L_700F:
07015  Script! = Arg2!
L_7018:
07018  GOTO L_6BF8
L_701B:
07031  IF G!(CINT(Arg1!)) > Arg2! THEN GOTO L_703F
L_7036:
0703C  Script! = Arg3!
L_703F:
0703F  GOTO L_6BF8
L_7042:
07058  IF G!(CINT(Arg1!)) < Arg2! THEN GOTO L_7066
L_705D:
07063  Script! = Arg3!
L_7066:
07066  GOTO L_6BF8
L_7069:
07069  GOSUB SUB_1378
07075  LOCATE 13, 2
07078  PRINT "Enter Amount:";
07084  GOSUB SUB_1574
07091  Amount! = InputVal%
07094  GOTO L_6BF8
L_7097:
070A0  IF Amount! < Arg1! THEN GOTO L_70AE
L_70A5:
070AB  Script! = Arg2!
L_70AE:
070AE  GOTO L_6BF8
L_70B1:
070BD  Delta! = Arg1! * Amount!
070C0  GOSUB SUB_1083
070C3  GOTO L_6BF8
L_70C6:
070CC  Delta! = 0
070CF  GOSUB SUB_1083
070DB  IF Delta! < Arg1! THEN GOTO L_70E9
L_70E0:
070E6  Script! = Arg2!
L_70E9:
070E9  GOTO L_6BF8
L_70EC:
070EC  GOSUB SUB_13E5
070EF  GOTO L_2408
L_70F2:
070F2  GOTO L_6D59
L_70F5:
070F5  GOSUB SUB_1378
070FE  FOR Member! = 1 TO 6
L_7102:
0711A  IF FNCrew(Member!, 31) <= 0 THEN GOTO L_7172
L_711F:
07135  LOCATE CINT(Member! + 10), 2
07138  PRINT CrewName$(CINT(Member!)); " ";
0716C  Damage! = INT(RND * Arg1! + 1)
0716F  GOSUB SUB_6217
L_7172:
0717B  NEXT Member!
L_718E:
07197  LOCATE 24, 6
0719A  GOSUB SUB_12B5
0719D  GOTO L_6BF8
L_71A0:
071A6  X! = OldX!
071AF  Y! = OldY!
071B2  GOTO L_6BF8
L_71B5:
071BB  PrevRoom! = -1
071DA  InMap%(CINT(FNRoomIdx(Arg1!, 5))) = 0
071E0  GOTO L_6BF8
```

## Subroutines (near CALL targets)

| sub | calls | role |
|---|---|---|
| SUB_0359 | 65 | DEF FNCrew(member, field) = INT(G!(member*100 + field + 1500) + .1)  'squad-member record field (member 1..6 = ship crew 3..8); inlined at every call site |
| SUB_038B | 40 | DEF FNIdx(member, field) = INT(member*100 + field + 1500.5)  'index of a squad-member field in G!(); inlined |
| SUB_03C9 | 17 | DEF FNRoom(room, field) = InMap%(CINT(room*11 + field + 1369))  'room record field (0 trap level, 1 enemy group, 2 script, 3 text line, 4 enclosure, 5 mapped, 6 door, 7..10 rectangle x0 y0 x1 y1); inlined |
| SUB_03F0 | 7 | DEF FNRoomIdx(room, field) = room*11 + field + 1369  'index of a room field in InMap%; inlined |
| SUB_0409 | 6 | DEF FNCell(dummy) = InMap%(CINT(Y!*37 + X!))  'cell value under the squad; the argument is unused; inlined |
| SUB_0C62 | 2 | clear member I!'s oxygen-item flags: FNCrew fields 33, 56, 40 = 0 |
| SUB_0DEE | 1 | draw the screen frame: SCREEN 1, palette (EGA) or COLOR 0,1, the outer box, the map box (7,6)-(193,192), the title box with the logo, the three right-hand panels and the colour-2 borders |
| SUB_0FFB | 1 | delay: Delay!*0.6 empty loop, detector tick, Delay!*0.5 loop, detector tick (SUB_60BE) |
| SUB_1083 | 3 | credits = CreditsHi!*30000 + CreditsLo! + Delta!, capped at 9999999, split back; Delta! = total |
| SUB_10D3 | 5 | member picker: clears the command panel, lists living members (rows 15.., "n>"name), prints Prompt$ at 22,26, reads 1..6 -> Member! (ENTER -> 0); dead slots refused unless AllowAny! |
| SUB_128E | 29 | long pause = 5 x SUB_0FFB |
| SUB_12B5 | 5 | PRINT string at DS 0x8BE0; then wait for CHR$(13) (detector ticks while waiting) |
| SUB_12E9 | 7 | menu key: Cmd! = ASC(INKEY$) upper-cased - 64, accepted when CmdMin! <= Cmd! <= CmdMax! or Cmd! is -51 (ENTER) / -32 (SPACE) |
| SUB_1378 | 13 | blank the map area LINE (8,7)-(192,191),0,BF and set MapHidden! = 1 |
| SUB_13A3 | 3 | blank the map area below the title row: LINE (8,16)-(192,191),0,BF |
| SUB_13C5 | 9 | save the map area: GET (8,7)-(192,191), MapPic |
| SUB_13E5 | 10 | restore the map area: PUT (8,7), MapPic, OR; MapHidden! = 0 |
| SUB_1405 | 2 | key reader for the exploration loop: extended keys -> Cmd! 1..11, letters -> 12..37, ENTER -> 37 (others ignored) |
| SUB_14CA | 28 | clear the command panel: LINE (200,110)-(311,191),0,BF |
| SUB_14EC | 1 | clear the room-text panel: LINE (200,31)-(311,87),0,BF |
| SUB_150E | 2 | clear the lower command panel: LINE (200,128)-(311,191),0,BF |
| SUB_1552 | 1 | LINE (8,16)-(192,191),0,BF (same as SUB_13A3) |
| SUB_1574 | 2 | numeric input: MaxLen! = 4 then SUB_157D |
| SUB_157D | 1 | line editor at the cursor: builds K$ from keys (BACKSPACE deletes, lowercase -> upper, digits only when MaxLen! = 4, ENTER ends); InputVal% = CINT(VAL(K$)) |
| SUB_1707 | 8 | find an item of type ItemType! among records 2300..2597 (step 3) with owner > 2: Found! = 1, ItemRec!, ItemOwner! = owner - 2 |
| SUB_1ABD | 4 | YesNo! = 1 for Y/y, 0 for N/n (loops until one is pressed) |
| SUB_1B23 | 2 | draw room DrawRoom!: for every cell of its rectangle (fields 7..10) whose room number matches, PUT the tile (SUB_1CEA); then field 5 (mapped) = 1 |
| SUB_1CEA | 1 | PUT the 5x5 tile sprite CellTile! (Tile0..Tile63) at (PxX!, PxY!), OR: ON INT(tile/8)+1 GOTO 8 groups x ON tile MOD 8 + 1 GOTO |
| SUB_3452 | 3 | LOCATE 16,26: PRINT DoorHP!; part of the string at DS 0x8F5E |
| SUB_376B | 3 | Switch helper: a record whose owner field is Member! or Tmp! gets the other owner (owner = Member!+Tmp! - owner) |
| SUB_4B30 | 1 | recompute the inspected member's weight: G!(Rec!+39) = armour weights, Carried! = sum of owned weapon/ammo/item weights, G!(Rec!+14) = INT((G!(Rec!+39)+Carried!)/10), current movement G!(Rec!+8) = INT(maxmove*(2 - cur/max) + .5) clamped 0..maxmove |
| SUB_4F07 | 3 | shift the crew names back: SWAP CrewName$(I!+2), CrewName$(I!) for I! = 6 TO 1 STEP -1 (undoes 0303 before CHAIN) |
| SUB_51BA | 4 | EQUIPING list: add a row (letter A.., owner tag CHR$(owner+46) = 1..6, wrapped name) and remember ListRec!; when the page is full or at the end: string at DS 0x9370 / string at DS 0x9386: a letter cycles that item's owner 3..8, ENTER ends (ItemRec! = 9999), SPACE clears for the next page |
| SUB_5744 | 1 | radiation detector tick: every 0.23 s step RadSweep! (1..25) and PUT the blips (SUB_5829); a (practically impossible) double RND test burns the detector out |
| SUB_5829 | 3 | PUT (RadSweep!*8-7, 1) and (RadSweep!*8-7, 192), BlipH, XOR |
| SUB_5860 | 1 | motion detector tick: every 0.07 s step MotSweep! and PUT the blips (SUB_5945) |
| SUB_5945 | 2 | PUT (1, MotSweep!*8-7) and (193, MotSweep!*8-7), BlipV, XOR |
| SUB_5C12 | 2 | print the equipped weapon line: string at DS 0x946C or text with the STARPORT string at DS 0xACB8reloads + "*"/" " (ammo < 0 = broken) + WeaponName$ |
| SUB_5DDF | 1 | reload weapon record I!: consume one ammo item of the same type (records 1100..1397), ammo (+3) = full (+4), two SOUNDs |
| SUB_60BE | 7 | background tick: radiation/motion detector sweeps when active, and the squad marker PUT (X!*5+8, Y!*5+7), Tile42, XOR before and after (only when the map is visible) |
| SUB_6169 | 2 | Scout! = living member with the highest Scouting/Recon (field 19), ScoutSkill! |
| SUB_6217 | 3 | apply Damage! to Member!: HP (field 15) -= Damage!, min 0; string at DS 0x952C + status 0 when it reaches 0, else string at DS 0x9538; Damage!; string at DS 0x9542; if nobody is alive: string at DS 0x954A and an endless loop at 6385 |
| SUB_6387 | 1 | save the location: BSAVE IN-n.BAS from &H48B0 (5502 bytes) and INMAP-n.BAS from the saved map picture (&H5E2E, 8700 bytes) |
| SUB_63F9 | 1 | load the location: detectors off, BLOAD IN-n.BAS to &H48B0 and INMAP-n.BAS to &H5E2E, PUT the map (SUB_13E5) |
| SUB_6473 | 1 | read MES-n into MesLine$(0..) with LINE INPUT until EOF |
| SUB_656F | 1 | show the encounter (text with the string at DS 0x9590 / text with the string at DS 0x95B2 / text with the string at DS 0x95DA), set InBattle!, G!(2260), G!(2214), G!(2228) = 11, un-shift the names and CHAIN PLBATTLE.EXE |
| SUB_6658 | 4 | LOCATE 24,6: string at DS 0x95FA and wait (SUB_12E9 with CmdMax! = 0) |
| SUB_667D | 2 | count reloads: G!(501..554) = 0, then +1 at G!(500 + ammo type) for every ammo record (1100..1397) owned by Member! |
| SUB_673F | 3 | print ListLine$ at (ListRow!, 8) wrapped at the last space before column 18; the rest on the next row |
| SUB_6962 | 1 | option picker: Option! clamped 1..22, ">" OptionName$(Option!) at 20,2, Up/Down or PgUp/PgDn cycle, ENTER accepts; option 22 asks "Enter a single word" and looks the first 3 letters up in MesLine$(100..0): Option! = line + 100, else "Unrecognized Command" |
| SUB_6AAC | 1 | LINE (8,112)-(191,191),0,BF |

## Variables

Addresses are DS offsets. kinds: N = 4-byte single, S = string descriptor, I = integer, P = array/untyped (PUT/BLOAD target). Names come from `INSIDE_names.json` (evidence column = why).
| address | kinds (uses) | name | evidence |
|---|---|---|---|
| 0x1988 | N x18 | CreditsHi! | G!(78) (3.0 in the shipped save): credits = CreditsHi!*30000 + CreditsLo! (SUB_1083 1098-10CF; SPACE's FNKey uses the same pair) |
| 0x198C | N x8 | CreditsLo! | G!(79) (5000.0 in the shipped save): low part of the credits, see CreditsHi! |
| 0x19A4 | N x2 | DriveCfg! | G!(85): 1 -> Drive$=string at DS 0x8280, 2 -> string at DS 0x828A (0052-0074); same address as SPACE_names.json |
| 0x19A8 | N x1 | StdDelay! | G!(86): PRINT string at DS 0x9624 string at DS 0x9630; StdDelay! (68BA) |
| 0x19B0 | N x9 | Delay! | G!(88): PRINT string at DS 0x963A string at DS 0x9630; Delay! (68EE); set from the typed value 1..9999 (695C); SUB_0FFB loops Delay!*0.6 and Delay!*0.5 times |
| 0x19B4 | N x1 | UseEGA! | G!(89) = STARTUP adapter toggle: 1 -> PALETTE 1,2: PALETTE 2,6 else COLOR 0,1 (0E03-0E21) |
| 0x19C4 | N x2 | SoundOff! | G!(93) = STARTUP's sound toggle; SndDur! = 1 - SoundOff! (009E) |
| 0x3AE8 | N x1 | ChainArg! | G!(2214) COMMON: record for the chained module; = EnemyGroup! right before CHAIN PLBATTLE (663D) - crossref name |
| 0x3AF0 | N x6 | SectorX! | G!(2216) (28.0 in the shipped save; SPACE_names.json calls it SectorX!): its range picks the interior Location! 1..7 and the start cell (06A3-07CD) |
| 0x3B20 | N x1 | Terrain! | G!(2228) COMMON: PLBATTLE terrain index = DATA record 297 of PLBATTLE (1..3 Plains/Mushrooms/Swamp from SPACE INT(RND*3+1) 6DF3, 10 Enemy Ship from SPBATTLE 3EEF, 11 Enclosed Room from INSIDE 6646) - crossref |
| 0x3B24 | N x1 | Surprise! | G!(2229) COMMON: surprise code before CHAIN PLBATTLE: 0 confrontation / 1 you surprise / 2 enemies surprise (SPACE 6DD8, INSIDE 6575, SPBATTLE 3EFA) - crossref |
| 0x3B78 | N x2 | Gravity10! | G!(2250) COMMON: planet gravity x10 in SPACE; set to 10 for Location! 4 and 1 (06C9, 07AF), not read in INSIDE - crossref name |
| 0x3B80 | N x3 | Breathable! | G!(2252): 0 when Location! is 3 or 6 (the airless locations), else 1 (0829-086D); the atmosphere/oxygen check runs only on a fresh entry (InBattle! = 0) when it is 0 (088F); PLBATTLE prints SPACE string at DS 0xB50A when SGN(G!(2252)) = 1 (its 02B0-02C4), which fixes the polarity |
| 0x3B88 | N x1 | BattleWon! | G!(2254) COMMON: set by PLBATTLE 430D = -((CreditsGained! > 0) OR (Surrendered! > 0)); tested once at 0D51 after a return from PLBATTLE (InBattle!<>0): 0D4B-0D53 FCMP [3B88] ? 0.0, je 0D56: 0 (lost or fled) -> X!,Y! = OldX!,OldY! (the squad is pushed back off the encounter cell), nonzero (won) -> stays on X!,Y! and L_0D6B marks the room (0D86-0DA4) - crossref name, polarity corrected by glm-review-crossref D1 (2026-10-18) |
| 0x3B8C | N x5 | InBattle! | G!(2255): set 1 at 6619 right before CHAIN PLBATTLE; on entry 0818/088F/0D1A a nonzero value skips the map reload and the atmosphere check and restores the squad position; cleared at 0D46 |
| 0x3BA0 | N x4 | Enclosure! | G!(2260) COMMON: = room field 4 (enclosure) before CHAIN PLBATTLE (6634) - crossref name |
| 0x488C | S x1 | ShipName$ | CHARNAME field 1 (029D); same COMMON address as SPACE |
| 0x4890 | N x5 | RadDetOn! | COMMON: 1 while the radiation detector is active (6048); reset at 63FF/5797; radiation traps are detected only when set (29D1) |
| 0x4894 | N x6 | RadDetRec! | COMMON: item record of the active radiation detector (6051); zeroed when it burns out (57B2) |
| 0x4898 | N x9 | MotDetOn! | COMMON: 1 or 2 = active motion detector of item type 3 or 4 (60AF); reduces the surprise chance by 20 per level (6557) |
| 0x489C | N x6 | MotDetRec! | COMMON: item record of the active motion detector (60B8) |
| 0x48A0 | N x28 | X! | squad cell x 0..36: cell index Y!*37+X! (SUB_0409); marker PUT (X!*5+8, Y!*5+7) (6110); X! = X! + DX! (2910) |
| 0x48A4 | N x30 | Y! | squad cell y 0..36 (see X!); Y! = Y! + DY! (291E) |
| 0x48A8 | N x7 | OldX! | previous x: restored on a refused move (2BEC, 307B, 71A6), updated after a completed move (2F09, 34CB) |
| 0x48AC | N x7 | OldY! | previous y (see OldX!) |
| 0x8274 | S x11 | Drive$ | assigned ""/string at DS 0x8280/string at DS 0x828A at 0046-0074 from DriveCfg!, prefixed to every file name (BLOAD/BSAVE/OPEN/CHAIN) |
| 0x8290 | S x1 | Enclosure$(0) | element 0 of Enclosure$ assigned as a scalar at 007D |
| 0x8294 | S x1 | Enclosure$(1) | element 1 (0086) |
| 0x8298 | S x1 | Enclosure$(2) | element 2 (008F) |
| 0x82D2 | N x40 | SndDur! | = 1 - SoundOff! (009E); multiplier of every SOUND duration (2854, 2A58, 2CD0, 3143...) |
| 0x87AE | N x13 | TestMode! | never assigned in INSIDE (reads only: 00BC, 00F1, 042D, 07D9, 0818, 0856, 27C8, 357C, 6D39) and it is a module local above the COMMON end 0x7FAA, so it is 0 at run time; a nonzero value would run the standalone-test path (BLOAD CHARINFO/LOGO, NAME/CHARNAME loading, the part of the string at DS 0x8876 debug prompt at 0441, BEEP instead of combat at 27CD/6D3E). Name is a reading: M |
| 0x87BE | S x1 | Status$(0) | element 0 of Status$ assigned as a scalar at 00D6 |
| 0x87C2 | S x1 | Status$(1) | element 1 (00DF) |
| 0x87C6 | S x1 | Status$(2) | element 2 (00E8) |
| 0x87F2 | N x365 | I! | FOR counter of most loops (011B, 0CE5, 10DC, ...) |
| 0x8802 | S x40 | K$ | INKEY$ (11AD, 12C7, 12EF, 140B); also the typed-word buffer of SUB_157D (159D-16F2), the NAME skip scratch (01A5) and the room text copy (26D7, 6D6D) |
| 0x8822 | S x1 | CrewName1$ | CHARNAME field 2 (029D, standalone path only): crew slot 1, stays on the ship |
| 0x8826 | S x1 | CrewName2$ | CHARNAME field 3 (029D): crew slot 2 |
| 0x882A | N x67 | FnField! | argument 2 of FNCrew |
| 0x882E | N x71 | FnMember! | argument 1 of FNCrew (stored right before each GOSUB SUB_0359) |
| 0x883E | N x42 | FnIField! | argument 2 of FNIdx |
| 0x8842 | N x46 | FnIMember! | argument 1 of FNIdx |
| 0x8856 | N x23 | FnRoom! | argument 1 of FNRoom |
| 0x885A | N x19 | FnRField! | argument 2 of FNRoom |
| 0x8866 | N x13 | FnRoom2! | argument 1 of FNRoomIdx |
| 0x886A | N x9 | FnRField2! | argument 2 of FNRoomIdx |
| 0x886E | N x6 | FnDummy! | argument of FNCell (always 0, never read by the function) |
| 0x888A | N x6 | YesNo! | SUB_1ABD: 1 for Y/y, 0 for N/n |
| 0x88A6 | N x14 | RldCnt! | = G!(GunType!+500) reload count, shown as a digit (max 9) in the Rlds/Weapons list (4A65-4A7D); also the cycling item type of the debug fill (04CD, TestMode! path) |
| 0x88AA | N x9 | DbgOwner! | cycling owner 1..8 of the debug fill at 04E8 (TestMode! path only) |
| 0x88D6 | N x15 | Location! | 1..7 = which IN-n.BAS / INMAP-n.BAS / MES-n set is loaded (6439, 646D, 649D: string at DS 0x955E+STR$(-Location!)); chosen from SectorX! at 06A3-07CD |
| 0x88DA | N x10 | StartX! | initial squad cell x for the location (06B7..07C4); copied to X!/OldX! at 0D25 |
| 0x88DE | N x10 | StartY! | initial squad cell y (06C0..07CD); copied to Y!/OldY! at 0D34 |
| 0x8950 | N x33 | M! | second loop counter: item records 2300..2597 (0912), members 1..6 (3F59, 5525) |
| 0x8964 | N x6 | NoOxygen! | 1 when some living member's oxygen product is not 1 (0B0D) -> text with the string at DS 0x8A76 (0B4F) |
| 0x8A68 | N x44 | Found! | SUB_1707 result: 1 when an item of type ItemType! is held by a squad member, else 0 (170D, 1773); also the oxygen product at 0AAD and the string at DS 0x93D2 flag at 5687 |
| 0x8AD2 | N x126 | Member! | selected squad member 1..6: result of SUB_10D3 (1213), CrewName$(Member!) printed at 2B1E, 3F1A, 5A4D ...; 0 = ENTER pressed |
| 0x8AD6 | N x12 | Damage! | argument of SUB_6217: HP = HP - Damage! (6235), PRINT string at DS 0x9538; Damage!; string at DS 0x9542 (62FA) |
| 0x8B24 | N x30 | RoomNo! | = INT(cell/64) of the squad's cell (2528, 2671) = room number; room records at InMap%(1369 + RoomNo!*11 + field) |
| 0x8B8C | N x5 | PrevRoom! | = RoomNo! once the room is shown (26B1, 34DD); the room panel is redrawn when it differs (2534, 34C0); -1 at 71BB forces a redraw |
| 0x8B94 | N x5 | DelayN1! | = Delay!*0.6 (100A): first empty loop bound of SUB_0FFB |
| 0x8B9C | N x8 | DelayI! | counter of the SUB_0FFB loops |
| 0x8BA0 | N x5 | DelayN2! | = Delay!*0.5 (103E): second loop bound |
| 0x8BB6 | N x19 | Delta! | argument/result of SUB_1083: credits = credits + Delta! capped at 9999999 (1098-10AA), then Delta! holds the total (70DB compares it with Arg1!) |
| 0x8BC4 | S x6 | Prompt$ | string at DS 0x8EEE (31F5), string at DS 0x8FBE, string at DS 0x8FCE, string at DS 0x9140, string at DS 0x9412: printed at LOCATE 22,26 by SUB_10D3 (119B) |
| 0x8BD4 | N x3 | AllowAny! | 1 only during Switch (35C6, cleared 37BD): SUB_10D3 then accepts any slot, otherwise only living members (1285) |
| 0x8BDC | N x4 | PauseI! | counter of SUB_128E (5 x SUB_0FFB) |
| 0x8BF0 | N x68 | Cmd! | SUB_12E9: ASC(INKEY$) upper-cased minus 64 (A=1..; ENTER=-51, SPACE=-32); SUB_1405: extended keys -> 1..11 (scan code - 70: 2 Up, 5 Left, 7 Right, 10 Down), letters -> 12..37 (A=12), ENTER -> 37; dispatched by ON Cmd! GOTO at 2608/3037 |
| 0x8BFC | N x5 | CmdMin! | lower bound accepted by SUB_12E9 (136F) |
| 0x8C00 | N x10 | CmdMax! | upper bound accepted by SUB_12E9 (136F) |
| 0x8C0C | N x4 | MapHidden! | 1 after SUB_1378 blanks the map area, 0 after SUB_13E5 restores it; SUB_60BE draws the squad marker only when 0 (60D4, 6129) |
| 0x8C1C | N x4 | MaxLen! | maximum length accepted by SUB_157D: 4 for numbers (SUB_1574), 10 for the typed command (6B04); when 4 only digits are accepted (1675) |
| 0x8C20 | N x9 | Col! | POS(0) saved by SUB_157D (1588); column loop variable of SUB_1B23 (1C10) |
| 0x8C24 | N x9 | Row! | CSRLIN saved by SUB_157D (1594); row loop variable of SUB_1B23 (1BF5) |
| 0x8C28 | S x3 | Ch$ | INKEY$ inside the line editor SUB_157D (15DB) |
| 0x8C3C | I x7 | InputVal% | = CINT(VAL(K$)) at the end of SUB_157D (1703); new delay (6936-695C) and Amount! (7091) |
| 0x8C3E | N x15 | ItemType! | argument of SUB_1707 = item type to look for among records 2300..2597 (1 medkit 3FCF, 2 repair kit 387A, 3/4 motion detectors 607B/6095, 5/6 torches 3093/30AA, 7 lock pick 3393, 11 radiation detector 6031) |
| 0x8C42 | N x62 | ItemRec! | record index found by SUB_1707 (1768); G!(ItemRec!) = 0 consumes the item (31B4, 3B88, 4142) |
| 0x8C46 | N x5 | ItemOwner! | = owner field - 2 = squad member holding the found item (1781); CrewName$(ItemOwner!); string at DS 0x8EDC (30E5) |
| 0x8C5A | N x9 | DbgEsper! | esper level copy in the unreachable block 17AF-1ABC (no label after SUB_1707's RETURN; debug leftover that derives fields 51..54) |
| 0x8C82 | N x10 | DrawRoom! | argument of SUB_1B23 = room to draw (2794, 56C6) |
| 0x8C86 | N x13 | RoomX0! | room field 7 = left cell of the room rectangle (1B3F) |
| 0x8C8A | N x13 | RoomY0! | room field 8 = top cell (1B60) |
| 0x8C8E | N x19 | CellIdx! | = RoomY0!*37 + RoomX0!, advanced per cell (1B78, 1C66, 1C9A) |
| 0x8C92 | N x7 | RoomX1! | room field 9 = right cell (1B93) |
| 0x8C96 | N x6 | RowSkip! | = 36 - RoomX1! + RoomX0! = cells to skip to the next row (1BA7) |
| 0x8C9A | N x5 | PxX0! | = RoomX0!*5 + 8 = pixel x of the first tile (1BBD) |
| 0x8C9E | N x74 | PxY! | = RoomY0!*5 + 7, +5 per row (1BD1, 1CA8): tile PUT y |
| 0x8CA6 | N x5 | RoomY1! | room field 10 = bottom cell (1BEC) |
| 0x8CAA | N x71 | PxX! | tile PUT x, +5 per cell (1BFE, 1C74) |
| 0x8CAE | N x2 | ColEnd! | = RoomX1! (1C07), column loop limit |
| 0x8CB2 | N x8 | CellRoom! | = INT(cell/64) of the cell being drawn (1C38); drawn only when equal to DrawRoom! (1C43) |
| 0x8CB6 | N x10 | CellTile! | = cell - CellRoom!*64 (1C53) -> SUB_1CEA |
| 0x8CBA | N x9 | TileHi! | = INT(CellTile!/8) (1CFE): selects the 8-case group in SUB_1CEA |
| 0x8CBE | N x12 | TileLo! | = CellTile! - TileHi!*8 + 1 (1D15): case within the group |
| 0x8D56 | N x21 | Pass! | = TilePass%(tile of the current cell) (255B-2565): 4-digit decimal code of the BLOCKED directions (a set digit blocks: thousands down, hundreds up, tens right, units left) - polarity fixed by crossref from 2833-285A |
| 0x8D5A | N x9 | BlockDown! | thousands digit of Pass! (-1 when set, 257E): Down is refused with SOUND 900 when nonzero (28DA-28F6), the move happens when 0 - crossref |
| 0x8D5E | N x9 | BlockUp! | hundreds digit of Pass! (25A7): Up refused with SOUND 900 when nonzero (2833-2854: BOOL -> jne -> SOUND; 0 -> jmp 285A = move) - crossref |
| 0x8D62 | N x9 | BlockRight! | tens digit of Pass! (25CE): Right refused when nonzero (28A4-28C0) - crossref |
| 0x8D66 | N x5 | BlockLeft! | units digit of Pass! (25ED): Left refused when nonzero (286E-288A) - crossref |
| 0x8D72 | N x5 | DX! | -1/0/1 from Left/Right (2896, 28CC) |
| 0x8D76 | N x5 | DY! | -1/0/1 from Up/Down (2860, 2902) |
| 0x8D7A | N x15 | TextRow! | first row of wrapped text: 8 - INT((LEN(K$)+13)/28) for 14-char rows (26FA), 7 - INT((LEN+22)/46) for 23-char rows (6D90); MID$ start of the second list line in SUB_673F (67B2, 6819) |
| 0x8D7E | N x5 | LastRow! | LEN(K$)/14 = last row of the 14-char room text (270E) |
| 0x8D82 | N x1 | FirstRow! | never assigned (0): lower bound of the room-text row loop FOR I! = FirstRow! TO LastRow! (2717) |
| 0x8D86 | N x11 | EnemyGroup! | room field 1 (27B2): > -1 means enemies -> confrontation at 64E4; random pick InMap%(1930..1932) at 35BA; copied to G!(2214) for PLBATTLE (663D) |
| 0x8D8A | N x42 | Script! | room field 2 (27E8) = index of the room's interaction script in InMap%; 0 = none; negative = one-shot (cleared 281C, then ABS); advanced by OpLen% (6CE7) and set by jump opcodes (6F81...) |
| 0x8D8E | N x14 | NewRoom! | room of the cell after a move (293C); its field 0/6 drive the trap and door events |
| 0x8D92 | N x9 | Tile! | = cell - room*64 = tile 0..63 of the cell after a move (295F); 34/35 vault door (2F37), 36..40 trap (2981), 41 the exit (34E9) |
| 0x8D96 | N x16 | TrapLevel! | room field 0 of NewRoom! (29A1); <1 = no trap; INT(TrapLevel!*0.3225807)+1 -> 1 radiation (levels 1..3), 2 explosive (4..6) (2C8A) |
| 0x8DBA | N x2 | RadSweepSave! | RadSweep! saved around the trap animation (2A18, 2A92) |
| 0x8DBE | N x22 | RadSweep! | radiation sweep position 1..25 (5822): blips at (RadSweep!*8-7, 1) and (.., 192) (SUB_5829) |
| 0x8E04 | N x6 | Scout! | SUB_6169: living member with the highest field 19 (= Skill$(3) "Scouting/Recon") (61F7); disarms traps (2BA4) and picks locks (33F1) |
| 0x8E08 | N x14 | ScoutSkill! | field 19 of Scout! (61EE); -1 when nobody |
| 0x8E0C | N x7 | DisarmPct! | = ScoutSkill!*10 + 15, max 90 (2C0D-2C1F); RND*100 < DisarmPct! = string at DS 0x8E14 |
| 0x8E46 | N x5 | PoisonTarget! | = INT(RND*6+1): member always hit by a radiation trap (2CAA, 2D42) |
| 0x8E78 | N x24 | DoorHP! | = ABS(room field 6) (2F5B): vault door strength shown as part of the string at DS 0x8F5E (SUB_3452); reduced by torch (3179) and gunfire (334B); door opens when < 1 (3471) |
| 0x8E7C | N x8 | DoorSgn! | = SGN(room field 6) (2F7B); -1 after a failed lock pick (3449); field 6 = DoorHP!*DoorSgn! when leaving the door (3071) |
| 0x8F00 | N x37 | WeaponRec! | = field 32 * 12 + 788 (322D, 59E6): record of the member's equipped weapon (records 800+12k; 788 = string at DS 0x946C, 5C1B); fields +0 type, +1 damage, +3 ammo, +4 full ammo, +5 weight, +9 owner |
| 0x8F3E | N x6 | PickPct! | = ScoutSkill!*5 + 20, 0 after a failed pick (33DA-33EE); RND*100 < PickPct! = string at DS 0x8F42 |
| 0x8FDC | N x66 | Tmp! | general scratch: switch partner (35E6), items fixed (3A48, printed 3BB0), healed HP (4067), movement (4E6F), ammo count (5354), reload index (6706) |
| 0x8FE0 | N x6 | RecDiff! | = FNIdx(Tmp!,0) - FNIdx(Member!,0): offset between the two switched members' records (363B); SWAP G!(J!-RecDiff!), G!(J!) (36A3) |
| 0x8FE4 | N x5 | RecEnd! | = FNIdx(Tmp!, 99): last field of the switched record (3658) |
| 0x8FEC | N x42 | J! | inner loop counter (3670, 5633, 5DE5) and count of items examined by Fix (39E4, 3AE7) |
| 0x8FF0 | N x6 | OwnerSum! | = Tmp! + Member! (36F3): SUB_376B sets owner = OwnerSum! - owner to exchange the two owners |
| 0x9010 | N x16 | RepairSkill! | best field 26 (= Skill$(10) "Ship Repair") among living members (3852); then = Found!*35 + RepairSkill!*10 = repair chance (38AD) |
| 0x9018 | N x6 | N_9018! | +12 per weapon record examined by Fix (39D4); never read |
| 0x9020 | N x3 | KitUsed! | 1 when the repair kit is consumed (3B72); string at DS 0x906A; KitUsed! (3C33) |
| 0x90CA | N x15 | MedSkill! | best field 20 (= Skill$(4) part of the string at DS 0x8D0E) among living members (3EEC); heal chance = MedSkill!*Found!*10 (3FE8) |
| 0x9150 | N x86 | Rec! | = FNIdx(Member!, 0) = record base of the inspected member (4204, 4B4E): G!(Rec!+34) rank, +29 age, +31 status, +15/+16 HP, +10/+11 bonuses, +13/+14 weight, +12/+8 movement, +27 esper, +17.. skills, +48/+49 armor, +43 sighting, +50 clones, +45 hand weapon |
| 0x9160 | N x5 | Age! | = G!(Rec!+29) * 0.005479452 (4260); INT(Age!); part of the string at DS 0x9154 |
| 0x92F0 | N x27 | ListRow! | current list row (LOCATE ListRow!+1 at 4A49, 5204); +1 per printed line in SUB_673F |
| 0x92F4 | N x6 | GunType! | = G!(record) weapon type (49D4); WeaponName$(GunType!-1) printed (4AEB) |
| 0x930C | S x11 | ListLine$ | text of the current list row (4AEB, 5027, 50D0, 5172, 5D47) word-wrapped by SUB_673F |
| 0x9310 | N x21 | Carried! | SUB_4B30: sum of the weights of the member's weapons/ammo/items (4CA2, 4D34, 4DC6) -> G!(Rec!+14) = INT((G!(Rec!+39) + Carried!)/10) |
| 0x9328 | N x13 | OwnerCode! | = Member! + 2 = value of the owner field of records belonging to the member (4C2C) |
| 0x9334 | N x3 | MinusOne2! | = -1 (4F0D), STEP of the name un-swap loop in SUB_4F07 |
| 0x9338 | N x18 | ListIdx! | EQUIPING list index 0..17 (CHR$(ListIdx!+65) = A..R, 5207); -1 at the top of a page |
| 0x9348 | N x5 | EquipRec! | record passed to SUB_51BA (5030, 50D9, 517B) |
| 0x93B2 | N x7 | ViewX0! | = X! - 2, min 0 (5594-55A4): esper View box |
| 0x93BA | N x7 | ViewX1! | = X! + 2, max 36 (55B3-55C5) |
| 0x93BE | N x7 | ViewY0! | = Y! - 2, min 0 (55D4-55E4) |
| 0x93C2 | N x7 | ViewY1! | = Y! + 2, max 36 (55F3-5605) |
| 0x93C6 | N x2 | ViewXEnd! | loop limit copy of ViewX1! (5617) |
| 0x93CA | N x2 | ViewYEnd! | loop limit copy of ViewY1! (562A) |
| 0x93CE | N x8 | ViewRoom! | room of each viewed cell (5662); field 1 > 0 -> string at DS 0x93D2, unmapped rooms get drawn (56C9) |
| 0x93EA | N x6 | RadTimer! | TIMER of the last radiation sweep step (57F7); next step after 0.23 s (5756) |
| 0x9406 | N x6 | MotTimer! | TIMER of the last motion sweep step (5913); next after 0.07 s (5872) |
| 0x940E | N x16 | MotSweep! | motion sweep position 1..25 (593E): blips at (1, MotSweep!*8-7) and (193, ..) (SUB_5945) |
| 0x9424 | N x13 | WepSlot! | field 32 of Member! = equipped weapon slot (59CA); 0 = hand weapon |
| 0x9428 | N x8 | SlotRec! | = WepSlot!*12 + 788 (59E6) |
| 0x947C | N x7 | Ammo! | ammo digit shown by SUB_5C12 (5C53, clamped 0..9) |
| 0x9480 | N x5 | Reloads! | = G!(500 + weapon type) = reloads available (5CA2, clamped 9) |
| 0x9528 | N x8 | NewHP! | = HP - Damage!, min 0 (6235-624A) -> field 15 (6272); 0 with status <> 0 = string at DS 0x952C |
| 0x9588 | N x10 | Surprise! | 0 text with the string at DS 0x9590, 1 text with the string at DS 0x95B2, 2 text with the string at DS 0x95DA (6557-6607); copied to G!(2229) (6575) |
| 0x9618 | N x16 | SpacePos! | INSTR position of a space in ListLine$ (6762, 67D3) |
| 0x961C | N x12 | WrapFrom! | character after the last space found (676F, 67FE) |
| 0x9620 | N x7 | CutLen! | characters printed on the first list line (67AA, 6811) |
| 0x966C | N x27 | Option! | option picked in SUB_6962: 1..22 (69CB OptionName$(Option!)), or keyword line + 100 for a typed command (6B54); tested by opcode 13 (6FDE) |
| 0x96C6 | S x2 | Word$ | = LEFT$(K$, 3) of the typed command (6B16), matched against MesLine$ (6B44) |
| 0x96CA | N x3 | MinusOne! | = -1 (6B1F), STEP of the keyword search loop |
| 0x96EE | N x19 | Op! | script opcode InMap%(Script!) (6C10); negative = one-shot; ON Op!+1 GOTO at 6CF6 |
| 0x96F2 | N x31 | Arg1! | InMap%(Script!+1) (6C30) |
| 0x96F6 | N x15 | Arg2! | InMap%(Script!+2) (6C4C) |
| 0x96FA | N x6 | Arg3! | InMap%(Script!+3) (6C68) |
| 0x96FE | N x5 | OneShotEnd! | = OpLen%(ABS(Op!)) - 1 + Script! (6C8F): InMap%(Script!..OneShotEnd!) zeroed |
| 0x9702 | N x5 | LastRow23! | LEN(K$)/23 = last row of the 23-char script text (6DA4) |
| 0x9770 | N x7 | Amount! | string at DS 0x975E result (7091); compared with Arg1! (70A0) and multiplied into Delta! (70BD) |

### Arrays (indexed access base addresses)

| base | element size / kinds (uses) | name | evidence |
|---|---|---|---|
| 0x1850 | N x242, 2601 elements (0..2600) | G! | the 51x51 COMMON single array (CHARINFO.BAS at DS 0x1850): crew records at 1500+member*100 (FNCrew/FNIdx), squad weapons 800+12k, ammo 1100+3k, items 2300+3k, reload counts 500+type |
| 0x40F4 | P x1, 202 elements (0..201) | Logo | LOGO.BAS BLOADed at &H40F4 (0102, standalone path); PUT (216,7), OR in the title box (0E95) |
| 0x4288 | S x23, 9 elements (0..8) | CrewName$ | CHARNAME fields 4..9 -> (1..6) (02C5); in the normal (chained) path the names are shifted by two at 0303 so that CrewName$(1..6) = ship crew slots 3..8 = the squad; shifted back by SUB_4F07 before every CHAIN |
| 0x42AC | S x2, 14 elements (0..13) | Rank$ | NAME items 1..13 (0121: Private..Grand Admiral per DATA_FILES.md); LEFT$(Rank$(G!(Rec!+34)), 12) in Inspect (4207) |
| 0x42E4 | S x2, 16 elements (0..15) | Skill$ | NAME items 14..29 -> (0..15) (0163: Desk Duty, Pilot, Astro Gunner, Scouting/Recon, Medical, Explosives, ...); LEFT$(Skill$(I!+1), 20) with level G!(Rec!+17+I!) in Inspect page 2 (46F1) |
| 0x43F4 | S x4, 54 elements (0..53) | WeaponName$ | 54 NAME strings = squad weapon names (STARPORT WeaponTable!); printed in the Rlds/Weapons list (4AEB), EQUIPING (5027, 50D0) and part of the string at DS 0x942C - crossref name (was GunName$) |
| 0x4534 | S x4, 11 elements (0..10) | MiscItemName$ | 11 NAME strings = the STARPORT string at DS 0xB2EE items of STARPORT held in G!(2300..2597): medkit 1, repair kit 2, motion detector 3/4, oxygen gear 8/9/10, radiation detector 11 - crossref name (was ItemName$) |
| 0x4870 | S x3, 7 elements (0..6) | AttrName$ | NAME items 368..374 -> (0..6) (024F): the 7 attribute names printed with dotted leaders and G!(Rec!+I!) (4331) |
| 0x48B0 | I x27 | InMap% | IN-n.BAS BLOADed at &H48B0 (6439; BSAVEd back at 63BB, 5502 bytes): cells (Y*37+X, 0..1368) = room*64 + tile, room records at 1369 + room*11 + field (FNRoom/FNRoomIdx), interaction scripts after them (Script!), random encounter group at 1930..1932 (35BA) |
| 0x5E2E | P x3 | MapPic | INMAP-n.BAS picture BLOADed at &H5E2E (646D) = the 185x185 map area: GET (8,7)-(192,191) (13E1), PUT (8,7) OR / AND (1401, 5582), BSAVEd back (63F5, 8700 bytes) |
| 0x8030 | S x4 | MesLine$ | lines of MES-n read with LINE INPUT #1 (64BD, index = line number); MesLine$(room field 3) is the room text (26D7), MesLine$(Arg1!) the script text (6D6D); 3-letter lines are the typed-command keywords (6B44) |
| 0x81C4 | N x3 | ListRec! | record of each EQUIPING list entry (526D); G!(ListRec!(Cmd!-1)) owner cycled 3..8 by A-R (5354-5396) |
| 0x8290 | S x1, 3 elements (0..2) | Enclosure$ | string at DS 0x829C, string at DS 0x82AE, string at DS 0x82C0 (007D-008F) -> (0..2); Enclosure$(room field 4) printed at LOCATE 13,26 (26A2) | extent: 3 elements (0..2) - enclosures 0..2 (0086-008F) |
| 0x82D6 | I x1 | TilePass% | INSH.BAS BLOADed at &H82D6 (00B3): words 0..63 = 4-digit code of the blocked directions of tile 0..63 (255B: a set thousands digit blocks down, hundreds up, tens right, units left; 0 = open on all sides); the 64 5x5 tile sprites follow from 0x8356 (14 bytes each), then Cursor (0x86D6) and the detector blips (0x8782, 0x8792) - polarity fixed by crossref |
| 0x8356 | P x1 | Tile0 | INSH.BAS GET array 0 (DS 0x8356 = 0x8356 + 14*0): 5x5 tile PUT by SUB_1CEA case 0 |
| 0x8364 | P x1 | Tile1 | INSH.BAS GET array 1 (DS 0x8364 = 0x8356 + 14*1): 5x5 tile PUT by SUB_1CEA case 1 |
| 0x8372 | P x1 | Tile2 | INSH.BAS GET array 2 (DS 0x8372 = 0x8356 + 14*2): 5x5 tile PUT by SUB_1CEA case 2 |
| 0x8380 | P x1 | Tile3 | INSH.BAS GET array 3 (DS 0x8380 = 0x8356 + 14*3): 5x5 tile PUT by SUB_1CEA case 3 |
| 0x838E | P x1 | Tile4 | INSH.BAS GET array 4 (DS 0x838E = 0x8356 + 14*4): 5x5 tile PUT by SUB_1CEA case 4 |
| 0x839C | P x1 | Tile5 | INSH.BAS GET array 5 (DS 0x839C = 0x8356 + 14*5): 5x5 tile PUT by SUB_1CEA case 5 |
| 0x83AA | P x1 | Tile6 | INSH.BAS GET array 6 (DS 0x83AA = 0x8356 + 14*6): 5x5 tile PUT by SUB_1CEA case 6 |
| 0x83B8 | P x1 | Tile7 | INSH.BAS GET array 7 (DS 0x83B8 = 0x8356 + 14*7): 5x5 tile PUT by SUB_1CEA case 7 |
| 0x83C6 | P x1 | Tile8 | INSH.BAS GET array 8 (DS 0x83C6 = 0x8356 + 14*8): 5x5 tile PUT by SUB_1CEA case 8 |
| 0x83D4 | P x1 | Tile9 | INSH.BAS GET array 9 (DS 0x83D4 = 0x8356 + 14*9): 5x5 tile PUT by SUB_1CEA case 9 |
| 0x83E2 | P x1 | Tile10 | INSH.BAS GET array 10 (DS 0x83E2 = 0x8356 + 14*10): 5x5 tile PUT by SUB_1CEA case 10 |
| 0x83F0 | P x1 | Tile11 | INSH.BAS GET array 11 (DS 0x83F0 = 0x8356 + 14*11): 5x5 tile PUT by SUB_1CEA case 11 |
| 0x83FE | P x1 | Tile12 | INSH.BAS GET array 12 (DS 0x83FE = 0x8356 + 14*12): 5x5 tile PUT by SUB_1CEA case 12 |
| 0x840C | P x1 | Tile13 | INSH.BAS GET array 13 (DS 0x840C = 0x8356 + 14*13): 5x5 tile PUT by SUB_1CEA case 13 |
| 0x841A | P x1 | Tile14 | INSH.BAS GET array 14 (DS 0x841A = 0x8356 + 14*14): 5x5 tile PUT by SUB_1CEA case 14 |
| 0x8428 | P x1 | Tile15 | INSH.BAS GET array 15 (DS 0x8428 = 0x8356 + 14*15): 5x5 tile PUT by SUB_1CEA case 15 |
| 0x8436 | P x1 | Tile16 | INSH.BAS GET array 16 (DS 0x8436 = 0x8356 + 14*16): 5x5 tile PUT by SUB_1CEA case 16 |
| 0x8444 | P x1 | Tile17 | INSH.BAS GET array 17 (DS 0x8444 = 0x8356 + 14*17): 5x5 tile PUT by SUB_1CEA case 17 |
| 0x8452 | P x1 | Tile18 | INSH.BAS GET array 18 (DS 0x8452 = 0x8356 + 14*18): 5x5 tile PUT by SUB_1CEA case 18 |
| 0x8460 | P x1 | Tile19 | INSH.BAS GET array 19 (DS 0x8460 = 0x8356 + 14*19): 5x5 tile PUT by SUB_1CEA case 19 |
| 0x846E | P x1 | Tile20 | INSH.BAS GET array 20 (DS 0x846E = 0x8356 + 14*20): 5x5 tile PUT by SUB_1CEA case 20 |
| 0x847C | P x1 | Tile21 | INSH.BAS GET array 21 (DS 0x847C = 0x8356 + 14*21): 5x5 tile PUT by SUB_1CEA case 21 |
| 0x848A | P x1 | Tile22 | INSH.BAS GET array 22 (DS 0x848A = 0x8356 + 14*22): 5x5 tile PUT by SUB_1CEA case 22 |
| 0x8498 | P x1 | Tile23 | INSH.BAS GET array 23 (DS 0x8498 = 0x8356 + 14*23): 5x5 tile PUT by SUB_1CEA case 23 |
| 0x84A6 | P x1 | Tile24 | INSH.BAS GET array 24 (DS 0x84A6 = 0x8356 + 14*24): 5x5 tile PUT by SUB_1CEA case 24 |
| 0x84B4 | P x1 | Tile25 | INSH.BAS GET array 25 (DS 0x84B4 = 0x8356 + 14*25): 5x5 tile PUT by SUB_1CEA case 25 |
| 0x84C2 | P x1 | Tile26 | INSH.BAS GET array 26 (DS 0x84C2 = 0x8356 + 14*26): 5x5 tile PUT by SUB_1CEA case 26 |
| 0x84D0 | P x1 | Tile27 | INSH.BAS GET array 27 (DS 0x84D0 = 0x8356 + 14*27): 5x5 tile PUT by SUB_1CEA case 27 |
| 0x84DE | P x1 | Tile28 | INSH.BAS GET array 28 (DS 0x84DE = 0x8356 + 14*28): 5x5 tile PUT by SUB_1CEA case 28 |
| 0x84EC | P x1 | Tile29 | INSH.BAS GET array 29 (DS 0x84EC = 0x8356 + 14*29): 5x5 tile PUT by SUB_1CEA case 29 |
| 0x84FA | P x1 | Tile30 | INSH.BAS GET array 30 (DS 0x84FA = 0x8356 + 14*30): 5x5 tile PUT by SUB_1CEA case 30 |
| 0x8508 | P x1 | Tile31 | INSH.BAS GET array 31 (DS 0x8508 = 0x8356 + 14*31): 5x5 tile PUT by SUB_1CEA case 31 |
| 0x8516 | P x1 | Tile32 | INSH.BAS GET array 32 (DS 0x8516 = 0x8356 + 14*32): 5x5 tile PUT by SUB_1CEA case 32 |
| 0x8524 | P x1 | Tile33 | INSH.BAS GET array 33 (DS 0x8524 = 0x8356 + 14*33): 5x5 tile PUT by SUB_1CEA case 33 |
| 0x8532 | P x1 | Tile34 | INSH.BAS GET array 34 (DS 0x8532 = 0x8356 + 14*34): 5x5 tile PUT by SUB_1CEA case 34 |
| 0x8540 | P x1 | Tile35 | INSH.BAS GET array 35 (DS 0x8540 = 0x8356 + 14*35): 5x5 tile PUT by SUB_1CEA case 35 |
| 0x854E | P x1 | Tile36 | INSH.BAS GET array 36 (DS 0x854E = 0x8356 + 14*36): 5x5 tile PUT by SUB_1CEA case 36 |
| 0x855C | P x1 | Tile37 | INSH.BAS GET array 37 (DS 0x855C = 0x8356 + 14*37): 5x5 tile PUT by SUB_1CEA case 37 |
| 0x856A | P x1 | Tile38 | INSH.BAS GET array 38 (DS 0x856A = 0x8356 + 14*38): 5x5 tile PUT by SUB_1CEA case 38 |
| 0x8578 | P x1 | Tile39 | INSH.BAS GET array 39 (DS 0x8578 = 0x8356 + 14*39): 5x5 tile PUT by SUB_1CEA case 39 |
| 0x8586 | P x1 | Tile40 | INSH.BAS GET array 40 (DS 0x8586 = 0x8356 + 14*40): 5x5 tile PUT by SUB_1CEA case 40 |
| 0x8594 | P x1 | Tile41 | INSH.BAS GET array 41 (DS 0x8594 = 0x8356 + 14*41): 5x5 tile PUT by SUB_1CEA case 41 |
| 0x85A2 | P x3 | Tile42 | INSH.BAS GET array 42 (DS 0x85A2 = 0x8356 + 14*42): 5x5 tile PUT by SUB_1CEA case 42 (also the squad marker, 6110/6165) |
| 0x85B0 | P x1 | Tile43 | INSH.BAS GET array 43 (DS 0x85B0 = 0x8356 + 14*43): 5x5 tile PUT by SUB_1CEA case 43 |
| 0x85BE | P x1 | Tile44 | INSH.BAS GET array 44 (DS 0x85BE = 0x8356 + 14*44): 5x5 tile PUT by SUB_1CEA case 44 |
| 0x85CC | P x1 | Tile45 | INSH.BAS GET array 45 (DS 0x85CC = 0x8356 + 14*45): 5x5 tile PUT by SUB_1CEA case 45 |
| 0x85DA | P x1 | Tile46 | INSH.BAS GET array 46 (DS 0x85DA = 0x8356 + 14*46): 5x5 tile PUT by SUB_1CEA case 46 |
| 0x85E8 | P x1 | Tile47 | INSH.BAS GET array 47 (DS 0x85E8 = 0x8356 + 14*47): 5x5 tile PUT by SUB_1CEA case 47 |
| 0x85F6 | P x1 | Tile48 | INSH.BAS GET array 48 (DS 0x85F6 = 0x8356 + 14*48): 5x5 tile PUT by SUB_1CEA case 48 |
| 0x8604 | P x1 | Tile49 | INSH.BAS GET array 49 (DS 0x8604 = 0x8356 + 14*49): 5x5 tile PUT by SUB_1CEA case 49 |
| 0x8612 | P x1 | Tile50 | INSH.BAS GET array 50 (DS 0x8612 = 0x8356 + 14*50): 5x5 tile PUT by SUB_1CEA case 50 |
| 0x8620 | P x1 | Tile51 | INSH.BAS GET array 51 (DS 0x8620 = 0x8356 + 14*51): 5x5 tile PUT by SUB_1CEA case 51 |
| 0x862E | P x1 | Tile52 | INSH.BAS GET array 52 (DS 0x862E = 0x8356 + 14*52): 5x5 tile PUT by SUB_1CEA case 52 |
| 0x863C | P x1 | Tile53 | INSH.BAS GET array 53 (DS 0x863C = 0x8356 + 14*53): 5x5 tile PUT by SUB_1CEA case 53 |
| 0x864A | P x1 | Tile54 | INSH.BAS GET array 54 (DS 0x864A = 0x8356 + 14*54): 5x5 tile PUT by SUB_1CEA case 54 |
| 0x8658 | P x1 | Tile55 | INSH.BAS GET array 55 (DS 0x8658 = 0x8356 + 14*55): 5x5 tile PUT by SUB_1CEA case 55 |
| 0x8666 | P x1 | Tile56 | INSH.BAS GET array 56 (DS 0x8666 = 0x8356 + 14*56): 5x5 tile PUT by SUB_1CEA case 56 |
| 0x8674 | P x1 | Tile57 | INSH.BAS GET array 57 (DS 0x8674 = 0x8356 + 14*57): 5x5 tile PUT by SUB_1CEA case 57 |
| 0x8682 | P x1 | Tile58 | INSH.BAS GET array 58 (DS 0x8682 = 0x8356 + 14*58): 5x5 tile PUT by SUB_1CEA case 58 |
| 0x8690 | P x1 | Tile59 | INSH.BAS GET array 59 (DS 0x8690 = 0x8356 + 14*59): 5x5 tile PUT by SUB_1CEA case 59 |
| 0x869E | P x1 | Tile60 | INSH.BAS GET array 60 (DS 0x869E = 0x8356 + 14*60): 5x5 tile PUT by SUB_1CEA case 60 |
| 0x86AC | P x1 | Tile61 | INSH.BAS GET array 61 (DS 0x86AC = 0x8356 + 14*61): 5x5 tile PUT by SUB_1CEA case 61 |
| 0x86BA | P x1 | Tile62 | INSH.BAS GET array 62 (DS 0x86BA = 0x8356 + 14*62): 5x5 tile PUT by SUB_1CEA case 62 |
| 0x86C8 | P x1 | Tile63 | INSH.BAS GET array 63 (DS 0x86C8 = 0x8356 + 14*63): 5x5 tile PUT by SUB_1CEA case 63 |
| 0x86D6 | P x1 | Cursor | INSH.BAS array at 0x86D6: PUT (280,144), XOR next to the command list (250A) |
| 0x8782 | P x2 | BlipV | INSH.BAS array at 0x8782: motion-detector blip PUT at x=1 and x=193 (5966, 5978) |
| 0x8792 | P x2 | BlipH | INSH.BAS array at 0x8792: radiation-detector blip PUT at y=1 and y=192 (584A, 585C) |
| 0x87BE | S x2, 3 elements (0..2) | Status$ | string at DS 0x87CA, string at DS 0x87D2, string at DS 0x87DA (00D6-00E8) -> (0..2); Status$(field 31) in the health table (3E22) and Inspect (427F) | extent: 3 elements (0..2) - status codes 0..2 |
| 0x8AEA | I x3, N x1, S x1, 27 elements (0..26) | OpLen% | READ from DATA line 3331 (0CF8): 1,2,2,3,3,3,2,3,2,1,2,2,2,3,2,3,4,4,1,3,2,3,1,2,2,1,2 = length in words of script opcode 0..26; advances Script! (6CE7) and sizes a one-shot block (6C8F) | extent: 27 elements (0..26) - READ OpLen%(0..26) (0CE5-0CF8) |
| 0x8B2C | S x2, N x1, 23 elements (0..22) | OptionName$ | READ from DATA line 3537 (0DC6): DATA line 3537..DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537, DATA line 3537 (1..22); printed after ">" by the option picker (69CB) | extent: 23 elements (0..22) - READ OptionName$(1..22) (0DB0-0DC6); element 0 unused |

## Unknowns (runtime calls not rendered)

| routine | uses | sites |
|---|---|---|
