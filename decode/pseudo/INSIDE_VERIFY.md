# INSIDE — verification (lane verify, Opus, 2026-10-15)

Inputs: `decode/pseudo/INSIDE.bas.md`, `INSIDE_SCREENS.md`, `INSIDE_names.json` (lane mod-inside; sampled at c48ab36/8ee3fa6 — the regeneration 8ee3fa6 changed only PUT verb words and line endings, checked with `git diff --ignore-cr-at-eol`, so every verdict holds for the current file), `decode/listings/INSIDE.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` + `decode/data/tools/_INSIDE.json`. Independent GLM review: `INSIDE_GLMVERIFY.md` (if present).

**Sample:**
- 1775 statement lines in `## Pseudocode`. Python `random.seed(20261015)`, `random.sample(range(1775), 178)` (10%), plus every CHAIN / BLOAD / BSAVE / ON GOTO / ON GOSUB / INPUT / OPEN line (22 sites, 21 not already drawn) = **199 statements**.
- Each statement was derived from the listing first, then compared with the pseudocode text. Four independent passes (subagents of this lane) did this.
- This lane re-checked each finding below against the bytes.
- A fifth pass did names (40, same seed), every DEF FN body with 25 call sites, the screens and the Unknowns section.
- Per the Foreman, PUT verb-3 `, OR` lines would count as KNOWN; none occurred, because the regenerated file already renders PSET.

## Summary

- 199 statements: **199 AGREE, 0 DISAGREE, 0 UNSURE** (0 KNOWN).
  - DEF FNs FNCrew 0359, FNIdx 038B, FNRoom 03C9, FNRoomIdx 03F0 and FNCell 0409 all match their bodies and caller slots. 03A7/03AA is an unused copy of SPACE's credits FN.
  - Names: 40/40 SUPPORTED. Screens: about 150 quotes and 28 coordinates/verbs all match. Unknowns honest (101 distinct runtime calls, all in the ledger).
- Out-of-sample findings, confirmed by this lane from the bytes:
  1. Translator defect: a PRINT whose first item is a DEF FN call is split into a bare `PRINT` plus separate PRINT lines (3 sites).
  2. A wrong prose reading of the atmosphere check (SCREENS heading + Unknowns note), and the `Airless!` name reads backwards.
  3. Two minor text nits.

## Findings and fix requests

1. **PRINT split around a leading FN call (translator, qb2bas).** In the bytes each of these is one PRINT, from one RT3F_BC to one RT3E_79. The rendering shows a bare `PRINT` (which in BASIC would print an empty line) followed by separate PRINTs.
   - 03D92..03DD2: `PRINT FNCrew(I!, 15); "/"; FNCrew(I!, 16);` (items 67 `;` at 3DAE, 6A `;` at 3DB4, 67 `;` at 3DCF; end 3DD2).
   - 03DFF..03E25: `PRINT Status$(CINT(FNCrew(I!, 31)))`.
   - 02680..026A5: one PRINT whose item is `s$[0x8290 + 4*CINT(FNRoom(...))]` +NL (FN 03C9 called at 2694).
   - The same defect occurs once in SPACE (01ABE..01AE4, FN 03E2 inside the PRINT) and once in SPBATTLE (01788..017AE, FN 0301). Commit 8ee3fa6 says "FN args inside PRINT", but these sites in the current files still show the split.
2. **Atmosphere check condition (prose only; the statements are right).**
   - Listing 0829-086D: `Airless! = 0` iff `TestMode! = 0 AND (Location! = 6 OR Location! = 3)`, else 1.
   - 0870-0891: `IF (InBattle! <> 0) OR (Airless! = 1) THEN GOTO L_0CDF`, which skips the check. So the "Atmosphere Unbreathable" screen runs **only** on a fresh entry (InBattle! = 0) to location 3 or 6 with TestMode 0.
   - Fix INSIDE_SCREENS.md "Screen 1" heading ("fresh entry, and after a battle when `Airless!` = 1") and INSIDE.bas.md `## Unknowns` line 2923 ("always runs on a fresh entry, the flag only matters after a battle").
   - The flag is 0 exactly where the air is unbreathable, so `Airless!` reads backwards; `Breathable!` would fit. Name choice is the Foreman's.
3. Minor: INSIDE.bas.md module-structure row 53DA-5741 says "5 sounds", but the listing has `FOR M! = 1 TO 10` (05525-0556D, limit 0x880A = 10); INSIDE_SCREENS.md already says ten.
4. Cosmetic: 01CE9 `RETURN 'with FAC = FNRoomIdx(DrawRoom!, 5)` is a translator note on a plain GOSUB return. FAC there is a leftover, not a result.

## Names, DEF FN and screens pass (output of the fifth pass)

### INSIDE verification: names, DEF FNs, screens (lane verify, 2026-10-15)

Read-only check against `decode/listings/INSIDE.lst`, `decode/data/tools/_INSIDE.json` (literal table), `decode/brun30/RT_LEDGER.md`.
Literal values come from `_INSIDE.json` `init` (addr -> text/value). G!(n) = DS 0x1850 + 4n.

#### Summary

| task | checked | SUPPORTED / match | WEAK | CONTRADICTED / mismatch | NOT FOUND |
|---|---|---|---|---|---|
| A names (seed 20261015, 40 of 252) | 40 | 40 | 0 | 0 | 0 |
| B DEF FNs (5 live + dead FNKey copy) | 6 bodies, 25 call sites | 6 / 25 | 0 | 0 | - |
| C1 quoted screen texts | ~150 distinct quotes | all byte-equal to a literal, a DATA item, or a PRINT concatenation in the pseudocode | 1 notation (numbers printed with BASIC's sign/trailing blanks shown as `<n>`) | 0 | 0 |
| C2 coordinates | 28 (20 LOCATE, 6 LINE, 3 PUT, incl. verbs) | 28 | 0 | 0 | - |
| C3 Unknowns honesty | 101 distinct RT entry points used | all have an H ledger row (3E_33 = alias in the 3E_42 row); none unrendered | - | 0 | - |
| extra findings (outside the samples) | - | - | - | 2 content + 1 minor | - |

Extra findings:
1. **CONTRADICTED: when the atmosphere check runs.** `INSIDE_SCREENS.md` Screen 1 heading says "fresh entry, and after a battle when `Airless!` = 1". `INSIDE.bas.md` Unknowns says "the atmosphere screen itself always runs on a fresh entry, the flag only matters after a battle". Listing 0870-0891: `dx = (InBattle! <> 0) OR (Airless! = 1)`; `and dx,dx / je 0x894 / jmp 0xcdf`. So the check is skipped whenever `Airless!` = 1. It runs only on a fresh entry (`InBattle!` = 0) with `Airless!` = 0, which is Location 3 or 6 with TestMode 0 (0829-0861). The pseudocode statement at 0088F is right; the two prose readings are wrong. The name `Airless!` is also backwards: the value is 0 exactly where the air is unbreathable. A name like `Breathable!` would fit.
2. Minor: the module-structure table in `INSIDE.bas.md` (row 53DA-5741) says "5 sounds" for V-View. The listing has a 10-pass loop: 05525-0556D, `FOR M! = 1 TO 10` (limit 0x880a = 10.0, `jbe 0x5528`), with `SOUND CINT(M!*1000), M!*SndDur!/5`. `INSIDE_SCREENS.md` correctly says ten.
3. Cosmetic: 01CE9 `RETURN 'with FAC = FNRoomIdx(DrawRoom!, 5)`. SUB_1B23 is a plain GOSUB, and FAC only happens to still hold the index from the integer store at 01CE3. This is a translator annotation artifact, not a DEF FN.
- Known defect check: no `PUT ..., OR` for verb 3 remains in the current INSIDE.bas.md (0 hits; 66 `PSET`). Example: 00E95 `PUT (216,7), Logo, PSET` with dx=3.

#### Task A: names (random.seed(20261015); random.sample(sorted keys, 40))

| addr | name | verdict | evidence |
|---|---|---|---|
| A862E | Tile52 | SUPPORTED | SUB_1CEA does a 2-level `ON` dispatch (01D24 by INT(t/8), then 8 leaves each). A script walk over all 64 leaves found every leaf k doing `PUT ...,0x8356+14k, dx=3` in order. 0x862E = 0x8356+14*52, referenced at 022DC |
| 8964 | NoOxygen! | SUPPORTED | 00A2C =0; 00B07-00B0D `FMOV 8964<-1.0` when Found! (FNCrew 33*56*40) <> 1 for a member with field 31 > 0; 00B2C FTEST, then 00B43-00B57 LOCATE 16,2 `"Some squad members have"` (0x8a76) |
| 88D6 | Location! | SUPPORTED | 006A8..007DE store 4/7/5/3/6/1/2 by SectorX! thresholds; 06417 `NEG [88d6]` -> STR$ -> "IN"+..+".BAS" BLOAD (06439); likewise INMAP and MES |
| 8E04 | Scout! | SUPPORTED | SUB_6169: 06172 =1, 061A2-061BB FNCrew(Member!,19) compared with ScoutSkill!, 061F1 `Scout! <- Member!`. Field 19 = Skill$(3): Inspect prints Skill$(I+1) against field Rec+17+I (046F1), so field = 16+k. Used as CrewName$ index at 02BA7 and 033F4 |
| 8FEC | J! | SUPPORTED | FOR counter at 03670/05633/05DE5 (FMOV/FCMP refs 3677, 5639, 5DE8); `J!=J!+1` at 039E4/03AE7 |
| 19A4 | DriveCfg! | SUPPORTED | (0x19A4-0x1850)/4 = 85; 0004C/00063 FCMP with 1.0/2.0, then SASSIGN Drive$ <- "A:"/"B:" (0x8280/0x828a) |
| A84D0 | Tile27 | SUPPORTED | 0x8356+14*27 = 0x84D0, leaf 02036 (see Tile52) |
| A84DE | Tile28 | SUPPORTED | = 0x8356+14*28, leaf 27 of the walk |
| 3B24 | N_3B24! | SUPPORTED | G!(2229) checks out; 0656F-06575 `FMOV 3b24 <- 9588 (Surprise!)` at SUB_656F entry, on the path to the PLBATTLE CHAIN at 06655 |
| 3AE8 | N_3AE8! | SUPPORTED | G!(2214) checks out; 06637-0663D `FMOV 3ae8 <- 8d86 (EnemyGroup!)`, then 06655 CHAIN PLBATTLE |
| 961C | WrapFrom! | SUPPORTED | 0676C/0676F FSTORE = SpacePos!+1 (also 067FE); read at 067B8/06806 |
| 88AA | DbgOwner! | SUPPORTED | only direct ref 004E5 (`G!(I+2) <- DbgOwner!`). Register tracing 004EB-00522 (xchg dx,si) shows the +1 increment, the `> 8.0` compare and the reset to 1. Inside the TestMode path |
| 9310 | Carried! | SUPPORTED | 04B30/04B36 = 0; 04C9A/04D2C/04DBE `Carried! - (owner=OwnerCode)*SGN(type)*weight` (boolean -1, so this adds); 04E2B `G!(Rec+14) = INT((G!(Rec+39)+Carried!)/10)` |
| A84EC | Tile29 | SUPPORTED | 0x8356+14*29 |
| 8D92 | Tile! | SUPPORTED | 0295C FSTORE `FNCell(0) - NewRoom!*64`; read 02F1B (34/35), 02965 (36..40), 034E3 (41) |
| A85CC | Tile45 | SUPPORTED | 0x8356+14*45 |
| 8D76 | DY! | SUPPORTED | 0285A <- -1.0 (0x8b90), 028FC <- 1.0, 02913 `Y!+DY!` |
| 93EA | RadTimer! | SUPPORTED | 057F1-057F7 `TIMER -> FSTORE 93ea`; 05747 `ABS(TIMER-RadTimer!) >= 0.23` |
| 9770 | Amount! | SUPPORTED | 07087-07091 `CSNG [InputVal%] -> 9770` after "Enter Amount:" (0707B); 0709A compare, 070B1 multiply |
| A48B0 | InMap% | SUPPORTED | word array `[di+0x48b0]` in FNRoom (003E5)/FNCell (0041F); BLOAD at 06439, BSAVE 5502 at 063BB; 035BA index `INT(RND*2)+INT(RND*2+1930)` |
| A847C | Tile21 | SUPPORTED | 0x8356+14*21 |
| 96EE | Op! | SUPPORTED | 06C06-06C10 `InMap%(Script!) -> 96ee`; 06CF6 `ON CINT(Op!+1)`, 27-entry table |
| A8620 | Tile51 | SUPPORTED | 0x8356+14*51 |
| A85E8 | Tile47 | SUPPORTED | 0x8356+14*47 |
| 8D72 | DX! | SUPPORTED | 02890-02896 <- -1.0; 028C6-028CC <- 1.0 |
| A84FA | Tile30 | SUPPORTED | 0x8356+14*30 |
| 8B8C | PrevRoom! | SUPPORTED | 026B1/034DD = RoomNo!; 02534 / 034C0 compares; 071BB = -1 |
| A846E | Tile20 | SUPPORTED | 0x8356+14*20 |
| 9020 | KitUsed! | SUPPORTED | 03B2F-03B35 = 0.0; 03B38 `bx=di` (=0x9020) kept, 03B6E-03B72 `FMOV [bx] <- [cx]` (cx=827c=1.0) when `RND > .9^Tmp!` AND Found!=1; 03C3C printed after "used up:" |
| A4870 | AttrName$ | SUPPORTED | 0024F INPUT #1 loop 0..6. Item numbers 368..374 check out against the declared skips: 13+16+130+11+197 = 367. Printed at 04331 |
| A854E | Tile36 | SUPPORTED | 0x8356+14*36 |
| 3B8C | InBattle! | SUPPORTED | G!(2255) checks out; 06613-06619 <- 1.0 before the CHAIN; tests at 0087F (088F), 00818, 00D1A; cleared at 00D46 |
| A85B0 | Tile43 | SUPPORTED | 0x8356+14*43 |
| 93BE | ViewY0! | SUPPORTED | 055C8-055D4 `Y! + (-2.0)`; clamped to 0 at 055E4 |
| 886E | FnDummy! | SUPPORTED | stored 0.0 before every `call 0x409` (00D6B, 0250D, 02539, 02659, 02921, 02941); FN body 0409-0426 never reads 0x886e |
| 3BA0 | N_3BA0! | SUPPORTED | G!(2260) checks out; 0662E FNRoom(RoomNo!,4) -> 06634 FSTORE 3ba0 |
| A1850 | G! | SUPPORTED | `add si/di, 0x1850` after `shl 2` everywhere (e.g. 00377); `common_start` = 6224 = 0x1850 in `_INSIDE.json` |
| 8C00 | CmdMax! | SUPPORTED | 0135D FCMP Cmd! ? CmdMax! (`ja` -> 0), ANDed with the CmdMin! test (01351); set at 03009, 03C93, 052E3, 05AEB, ... |
| 4890 | RadDetOn! | SUPPORTED | 0x4890 lies in 0x40F4..0x7FAA (COMMON); 06042-06048 <- 1.0; 063F9-063FF and 05791-05797 <- 0.0; 029CB FTEST gates the radiation detection |
| 8CAA | PxX! | SUPPORTED | 01BF8 = PxX0!; 01C6C-01C74 +5.0; x operand (bx) of every tile PUT in SUB_1CEA (01D52 ...) |

All 5 G!() index claims in the sample check out: 85, 2214, 2229, 2255, 2260. The 12 Tile addresses all equal 0x8356+14k, and the full 64-leaf walk found no mismatch.

#### Task B: DEF FNs

Bodies (listing 0359-0426):

| FN | body (listing) | stated formula | args (slots) | verdict |
|---|---|---|---|---|
| FNCrew 0359 | `[882e]*100 + [882a] + 1500` -> CINT -> `G![..] + 0.1` -> INT | `INT(G!(member*100+field+1500)+.1)` | 882E member, 882A field | SUPPORTED |
| FNIdx 038B | `[8842]*100 + [883e] + 1500.5` -> INT | `INT(member*100+field+1500.5)` | 8842 member, 883E field | SUPPORTED |
| (dead) 03AA | `CreditsHi!*30000 + CreditsLo! + .5` -> INT | "unused FNKey copy" | none | SUPPORTED (0 `call 0x3aa`; the 0388/03A7 jmps skip it) |
| FNRoom 03C9 | `[8856]*11 + [885a] + 1369` -> CINT -> `InMap%[..]` -> CSNG | `InMap%(CINT(room*11+field+1369))` | 8856 room, 885A field | SUPPORTED |
| FNRoomIdx 03F0 | `[8866]*11 + [886a] + 1369` (no INT) | `room*11+field+1369` | 8866 room, 886A field | SUPPORTED |
| FNCell 0409 | `Y!*37 + X!` -> CINT -> `InMap%[..]` -> CSNG; 886E not read | `InMap%(CINT(Y!*37+X!))` | 886E dummy | SUPPORTED |

Call counts: 0359 x65, 038B x40, 03C9 x17, 03F0 x7, 0409 x6, 03AA x0.

Call sites (the slot values the caller stores match the pseudocode's argument order):

| FN | site | stores seen | pseudocode | ok |
|---|---|---|---|---|
| FNCrew | 02AE6 | 882A<-19.0, 882E<-Member! | `FNCrew(Member!, 19)` (02B04) | yes |
| FNCrew | 03EE6 | 882A<-20.0, 882E<-si=I! (via dx) | `MedSkill! = FNCrew(I!, 20)` | yes |
| FNCrew | 059C4 | 882A<-32.0, 882E<-Member! | `WepSlot! = FNCrew(Member!, 32)` | yes |
| FNCrew | 06196 / 061BB | 882A<-31.0 / 19.0, 882E<-Member! | SUB_6169 `FNCrew(Member!,31)`, `ScoutSkill! = FNCrew(Member!,19)` | yes |
| FNIdx | 005E2 | 883E<-27.0, 8842<-I! | `G!(CINT(FNIdx(I!, 27))) = 8` | yes |
| FNIdx | 009F4 | 883E<-40.0, 8842<-I! | `G!(CINT(FNIdx(I!, 40))) = 1` | yes |
| FNIdx | 00AC5 | 8842<-I! (field 40) | `G!(CINT(FNIdx(I!, 40))) = Found!` | yes |
| FNRoom | 01B39 | 8856<-DrawRoom!, 885A<-7.0 | `RoomX0! = FNRoom(DrawRoom!, 7)` | yes |
| FNRoom | 027AC | 8856<-RoomNo!, 885A<-1.0 | `EnemyGroup! = FNRoom(RoomNo!, 1)` | yes |
| FNRoom | 02F72 | 8856<-NewRoom!, 885A<-6.0 | `DoorSgn! = SGN(FNRoom(NewRoom!, 6))` | yes |
| FNRoom | 0662E | -> 3BA0 | `N_3BA0! = FNRoom(RoomNo!, 4)` | yes |
| FNRoomIdx | 00D9A | 8866<-RoomNo! (si=di after FSTORE), 886A<-1.0 | `InMap%(CINT(FNRoomIdx(RoomNo!, 1))) = -1` | yes |
| FNRoomIdx | 01CD9 | 8866<-DrawRoom!, 886A<-5.0 | `FNRoomIdx(DrawRoom!, 5)` | yes |
| FNRoomIdx | 02812 | 8866<-RoomNo!, 886A<-2.0 | `FNRoomIdx(RoomNo!, 2)` | yes |
| FNRoomIdx | 02EF3 | 8866<-NewRoom!, 886A<-0.0 | `FNRoomIdx(NewRoom!, 0)` | yes |
| FNCell | 02516 / 02542 / 0292A | 886E<-0.0 | `FNCell(0)` (02528, 02565, 0295F) | yes |

No FN is mislabelled: the names, formulas and argument order all match the bodies. This is unlike the SPACE FN0452 case.

#### Task C: screens

##### C1 quoted texts

Every backtick-quoted on-screen string in `INSIDE_SCREENS.md` was compared by script with the `_INSIDE.json` string literals:

- Byte-equal literals, including padding: the 10 command-list lines, `   Enclosed  `, `     Open    `, `Not valid or possible  `, `What?                  `, `U-Use  V-View`, `Rlds    Weapons`, `dectected.`, `Dectector`, and all the others.
- `OptionName$` items: in DATA line 3537.
- Composites, each proven by a pseudocode PRINT whose pieces are all literals:

| quote | PRINT |
|---|---|
| `takes 999 hits` | 062FA `"takes"; Damage!; "hits"` |
| `Scout! dis-` | 02BA4 `" dis-"` |
| `owner uses` | 030E5 `" uses"` |
| `<strength> pts` | 0345E `DoorHP!; "pts   "` |
| `name Is Using:` | 05A4D `" Is Using:"` |
| `A<ammo> R<reloads>` | 05CB7 |
| `name:<n>`, `unfixable:<n>`, `used up:<0\|1>` | 03BB0, 03BF7, 03C33 |
| `<age> years   <Status$>` | 0427F `"years   "` |
| `HP <cur>/<max>` | 042C5 |
| `Level n` | 045A7 |
| `To Hit Bonus....+##%`, `Defence Bonus...+##%` | 043BA-0442D, USING `"+##"` and `"%"` |
| `Maximum Weight..## kg`, `Current Weight..## kg` | `" kg"` |
| `Max Movement....##`, `Cur Movement....##` | 044D6-04519 |
| `Armor.............##/##`, `Sighting Hardware.##%`, `Clones............#`, `Hand Weapon.......## pt` | 0478F-048A0 |
| `n>name` | 01146 |
| `name is` | 03FFA |
| `Delay: n` | 068BA / 068EE |

- One notation item: numbers PRINTed with `;` carry BASIC's leading sign blank and a trailing blank, so 042C5 actually shows `HP 5 / 10 ` rather than `HP 5/10`. The same holds for `name: n `. The placeholders do not show this; it is not a wrong literal.

##### C2 coordinates (LOCATE row = first ARGPUSH; LINE x=BX, y=DX)

| text / element | listing | result |
|---|---|---|
| Atmosphere Unbreathable 4,2 | 008A3 | ok |
| Some squad members have 16,2 | 00B43-00B4C (0x10, 2) | ok |
| The Exit 17,29 | 034FA | ok |
| Will you take 20,26 | 03512 | ok |
| Door Opened 19,26 | 03480 | ok |
| Radiation trap 15,26 | 029E8 | ok |
| EQUIPING 2,10 | 04FAB | ok |
| Press SPACEBAR 24,6 | 06661 | ok |
| Squad Health 5,8 | 03CD8 | ok |
| A-Squad Health 15,26 | 03C62 | ok |
| Reloading 19,28 | 05D5A | ok |
| Mindshock 22,3 / Communicate 22,14 / Psy Scream 23,15 | 045C7 / 04600 / 046AB | ok |
| Rlds    Weapons 4,2 | 04999 | ok |
| You Have None 23,26 | 06060 | ok |
| Enter Amount: 13,2 | 07075 | ok |
| Beings! 20,29 | 0570D | ok |
| Unrecognized Command 15,2 | 06BDC | ok |
| Use arrow keys to pick 17,2 | 06997 | ok |
| Standard 16,26 | 0689E | ok |
| LINE (3,3)-(317,195),,B | 00E24-00E40 (3,3)-(0x13d,0xc3), dx=-1 | ok |
| LINE (7,6)-(193,192),,B | 00E43-00E60 (0xc1,0xc0) | ok |
| LINE (197,6)-(313,26),,BF | 00E63-00E81 dx=1 | ok |
| LINE (197,29)-(313,89),,B | 00E98-00EB5 (0x1d)-(0x139,0x59) | ok |
| LINE (200,110)-(311,191),0,BF (SUB_14CA) | 014CA-014E8 (0xc8,0x6e)-(0x137,0xbf), bx=0, dx=1 | ok |
| LINE (8,96)-(192,97),,BF | 06E12-06E23 (0xc0,0x61), dx=1 | ok |
| PUT (216,7), Logo, PSET | 00E86-00E95 (0xd8,7), bx=0x40f4, dl=3 | ok |
| PUT (280,144), Cursor, XOR | 024F7-0250A (0x118,0x90), bx=0x86d6, dl=4 | ok |
| PUT (8,7), MapPic, PRESET (View) | 0556F-05582 (8,7), bx=0x5e2e, dl=2 | ok |

##### C3 Unknowns honesty

- All 101 distinct `CALL RT3x_yy` entry points in the listing carry an annotation; 0 calls lack one.
- Each has an `H`-confidence row in `RT_LEDGER.md`. `3E_33` is covered by the combined `3E_42 / 3E_33 / 3E_59` ARGPUSH row.
- No other `cd 3d/3e/3f` byte sequence appears outside `CALL RT` lines.
- The empty "Unknowns (runtime calls not rendered)" table is therefore honest. Nothing unknown is hidden.
- The open-questions list is honest except the `Airless!` sentence (extra finding 1).

## Verdict table (199 sampled statements)

Columns: statement offset (as printed in INSIDE.bas.md) / first bytes / derivation from the listing / pseudocode text / verdict / note.

| offset | bytes | derivation | pseudocode | verdict | note |
|---|---|---|---|---|---|
| 0005D | e9 17 00 | 005D jmp 0x77 (after Drive$="A:" at 0057) | GOTO L_0077 | AGREE | |
| 000B3 | cd 3e 1a | 00A1 CSNG &H82D6 -> FAC; 00AA SCAT Drive$(AX)+"INSH.BAS"(BX); RT3E_1A BLOAD file,[FAC] | BLOAD Drive$ + "INSH.BAS", &H82D6 | AGREE | |
| 000CD | cd 3e 1a | 00BC jne/jmp TestMode! guard tail; 00C1 CSNG 0x1850; BLOAD "CHARINFO" (literal 87B2, no Drive$) | BLOAD "CHARINFO", &H1850 | AGREE | |
| 00102 | cd 3e 1a | 00F6 CSNG 0x40F4; BLOAD "LOGO" 87E2 | BLOAD "LOGO", &H40F4 | AGREE | |
| 00112 | cd 3e 1e | 0105 OPEN mode 0 (INPUT); #1; file 87EA "NAME" | OPEN "NAME" FOR INPUT AS #1 | AGREE | |
| 00121 | cd 3f b6 | 0121 INPUT #1 begin; 0124 B7 n=1 type 04 (string); store Rank$ 0x42AC + CINT(I!)*4 | INPUT #1, Rank$(CINT(I!)) | AGREE | |
| 00146 | cd 3f b7 | 0143 I!+#1, 0149 store I!, cmp #13 (87F6), jbe 011E | NEXT I! | AGREE | loop limit 13 |
| 0015C | cd 3f 7d | 0156 FLOAD #0 -> jmp 0188 store I!; cmp #15 (87FE) jbe 0160 | FOR I! = 0 TO 15 | AGREE | |
| 00163 | 90 bb 01 | 0163 INPUT #1; type 04; store Skill$ 0x42E4 + CINT(I!)*4 | INPUT #1, Skill$(CINT(I!)) | AGREE | |
| 001A5 | 90 bb 01 | 01A5 INPUT #1; type 04; store K$ 0x8802 | INPUT #1, K$ | AGREE | (loop 0..129) |
| 001D9 | 90 bb 01 | 01D9 INPUT #1; type 04; store ItemName$ 0x4534 + CINT(I!)*4 | INPUT #1, ItemName$(CINT(I!)) | AGREE | |
| 0021B | 90 bb 01 | 021B INPUT #1; type 04; store K$ 0x8802 | INPUT #1, K$ | AGREE | (loop 1..196) |
| 0024F | 90 bb 01 | 024F INPUT #1; type 04; store AttrName$ 0x4870 + CINT(I!)*4 | INPUT #1, AttrName$(CINT(I!)) | AGREE | |
| 00287 | cd 3f b7 | NEXT tail (cmp #6 jbe 024C); 0284 bx=1; RT3E_21 CLOSE #1 | CLOSE #1 | AGREE | |
| 00297 | 33 db cd | 028A OPEN mode 0, #1, 8816 "CHARNAME" | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | |
| 0029D | bb 01 00 | 029D INPUT #1; B7 n=3 types 04 04 04 -> 488C ShipName$, 8822 CrewName1$, 8826 CrewName2$ | INPUT #1, ShipName$, CrewName1$, CrewName2$ | AGREE | |
| 002C5 | bb 01 00 | 02C5 INPUT #1; type 04; store CrewName$ 0x4288 + CINT(I!)*4 | INPUT #1, CrewName$(CINT(I!)) | AGREE | |
| 002FD | cd 3f b7 | NEXT tail (cmp #6 jbe 02C2); 02FA CLOSE #1 | CLOSE #1 | AGREE | |
| 00356 | 8b f2 cd | NEXT tail (SWAP loop, cmp #6 jbe 030C); 0356 jmp 0x388 | GOTO L_0388 | AGREE | |
| 00432 | be ae 87 | 0427 IF TestMode!=0 GOTO 068E (prev stmt); 0432 call 0x14CA | GOSUB SUB_14CA | AGREE | |
| 00482 | 75 03 e9 | 045B FnIField!(883E)=#31, FnIMember!(8842)=#0, call 038B (FNIdx = INT(m*100+f+1500.5)); CINT; G!(..) <- #1 | G!(CINT(FNIdx(0, 31))) = 1 | AGREE | FN038B body checked: member=8842, field=883E |
| 004AA | bf 3e 88 | field=#23, member=#0, call 038B, G!(..) <- #5 | G!(CINT(FNIdx(0, 23))) = 5 | AGREE | |
| 004E8 | cd 3f 7b | DX=&I!; 04D0 xchg -> SI=I!; +#2; CINT; G!(..) <- DbgOwner! (88AA) | G!(CINT(I! + 2)) = DbgOwner! | AGREE | |
| 0052B | cd 3f 7b | 050E DbgOwner!+#1 (DX=&#1 after 0510 xchg), store; cmp #8 ja 0527; 0527 SI=#1 -> FMOV DbgOwner! | DbgOwner! = 1 | AGREE | wrap when > 8 |
| 005CB | cd 3f 7b | field=#35, member=I!, call 038B, G!(..) <- #3 | G!(CINT(FNIdx(I!, 35))) = 3 | AGREE | |
| 0061D | cd 3f 7b | field=#54, member=I!, call 038B, G!(..) <- #2 (8286) | G!(CINT(FNIdx(I!, 54))) = 2 | AGREE | |
| 006CC | cd 3f 7b | after N_3B78!=10 (06C3); 06CC jmp 0x7D0 | GOTO L_07D0 | AGREE | |
| 006F5 | cd 3f 7b | 06EF StartY!(88DE) <- #0 (88F2) | StartY! = 0 | AGREE | |
| 007A6 | cd 3f 7b | 07A0 StartY! <- #8 (88AE) | StartY! = 8 | AGREE | |
| 007AF | cd 3f 7b | 07A9 N_3B78! <- #10 (880A) | N_3B78! = 10 | AGREE | |
| 007ED | cd 3f 7b | 07E7 StartX! <- #3 (88B2) | StartX! = 3 | AGREE | |
| 0088F | cd 3f 7b | 0870 BX=-1 if Airless!=#1 (jne skip dec); 087F DX=-1 if InBattle!<>0 (je skip dec); OR; 088F je 0894 else jmp 0CDF | IF (InBattle! <> 0) OR (Airless! = 1) THEN GOTO L_0CDF | AGREE | |
| 008BC | e8 2e 0b | 08B4 ARGPUSH 10; BX=DX=2 (saved at 08A9); LOCATE exec | LOCATE 10, 2 | AGREE | col 2 via DX copy of BX after the first LOCATE (08A9) |
| 00B0D | cd 3f 7b | 0B07 NoOxygen!(8964) <- #1 | NoOxygen! = 1 | AGREE | |
| 00B65 | 8b d3 bb | 0B5D ARGPUSH 17 (0x11); BX=DX=2; LOCATE exec | LOCATE 17, 2 | AGREE | |
| 00B9F | e8 6b 43 | 0B99 call 4F07 (prev stmt); 0B9C bx=8AC4 "SPACE.STR" literal; RT3E_0E CHAIN | CHAIN "SPACE.STR" | AGREE | |
| 00C34 | cd 3f 7b | 0C2B Damage!=999 (prev); 0C34 call 0x6217 | GOSUB SUB_6217 | AGREE | |
| 00CDB | cd 3f 7b | field=#40 (8960), member=I!, call 038B, G!(..) <- #0 (8AE6) | G!(CINT(FNIdx(I!, 40))) = 0 | AGREE | |
| 00E13 | cd 3e 4a | 0E0B PALETTE (BX),2 prev; 0E0E BX=DX=2, DX=6, RT3E_4A | PALETTE 2, 6 | AGREE | |
| 00E40 | bb 03 00 | 0E24 (3,3) RT3E_84; (0x13D=317,0xC3=195) 85; exec DX=AX=0 (B), color BX=-1 omitted | LINE (3, 3)-(317, 195), , B | AGREE | |
| 00EB5 | bb c5 00 | (0xC5=197,0x1D=29)-(0x139=313,0x59=89); DX=AX=0 B; color -1 | LINE (197, 29)-(313, 89), , B | AGREE | |
| 00F36 | 8b c8 bb | (4,0xC1=193)-(0x13C=316,0xC2=194); color 2; DX=1 BF | LINE (4, 193)-(316, 194), 2, BF | AGREE | |
| 00F96 | 8b c8 bb | (197,0x6A=106)-(313,0x6B=107); color 2; BF | LINE (197, 106)-(313, 107), 2, BF | AGREE | |
| 01063 | 8b f2 ... | NEXT DelayI! tail (cmp DelayN2! jbe 104A); 1063 call 0x60BE | GOSUB SUB_60BE | AGREE | |
| 01198 | bb 16 00 | 118F ARGPUSH 22 (0x16); BX=0x1A=26 literal; LOCATE exec | LOCATE 22, 26 | AGREE | 0x1A here is the literal 26, not FAC |
| 0119B | cd 3f bc | 119B PRINT begin; 11A1 RT3F_6E Prompt$(8BC4) +NL; 11A4 end | PRINT Prompt$ | AGREE | newline item, no `;` |
| 011B0 | cd 3e 79 | 11A7 K$=INKEY$ (prev); 11B0 call 0x60BE | GOSUB SUB_60BE | AGREE | |
| 01324 | 74 03 e9 | 1314 IF Cmd!>95 (ja 131C); SI=Cmd! + #-32 -> store DI=SI=Cmd! | Cmd! = Cmd! - 32 | AGREE | |
| 01570 | bb 08 00 | (8,0x10=16)-(0xC0=192,0xBF=191); color BX=0; DX=1 BF | LINE (8, 16)-(192, 191), 0, BF | AGREE | |
| 016DC | bf f8 8b | 16CD LEN(K$) CSNG; FCMP FAC?MaxLen! (8C1C); jb 16E1 (skip) else jmp 15D5 | IF LEN(K$) >= MaxLen! THEN GOTO L_15D5 | AGREE | |
| 016F5 | e9 a8 fe | jmp 0x15A0 | GOTO L_15A0 | AGREE | |
| 01768 | cd 3f 7b | 175E jne body; 1763 xchg dx,si -> si=I! (dx=I! from 171F); FMOV ItemRec!(8C42)<-I! | ItemRec! = I! | AGREE | |
| 01795 | e9 7c 00 (FOR jmp) / 178C bf b2 88 | 178C I!+#3 -> 1795 FSTORE I!, FCMP #2597 ja exit; FOR from 1707: FAC=#2300 jmp 1795 | NEXT I! STEP 3 | AGREE | FOR I!=2300 TO 2597 STEP 3 |
| 01995 | cd 3f 7d | FNIdx(Member!,12) via 038B (FnIMember!/FnIField!=12) -> G! ptr [bp-8]; FNCrew(Member!,0)->T80; FNCrew(Member!,1); T80+FAC; /#20; +#15; store | G!(CINT(FNIdx(Member!,12))) = (FNCrew(Member!,0)+FNCrew(Member!,1))/20+15 | AGREE | 0359 body = INT(G!(CINT(m*100+f+1500))+.1); 038B = INT(m*100+f+1500.5) |
| 01A2F | cd 3f 7d | FNIdx(Member!,52) -> G! ptr; FCMP DbgEsper!?#2 jbe->0 else -1; and/jge/neg = ABS; CSNG; store | G!(CINT(FNIdx(Member!,52))) = -(DbgEsper! > 2) | AGREE | ABS(bool)=-(bool) |
| 01B1D | cd 3f 7b | 1B12 jne body (K$="n" OR K$="N"); FMOV YesNo!<-#0 (87FA) | YesNo! = 0 | AGREE | |
| 01B21 | eb 9a | jmp 0x1ABD | GOTO L_1ABD | AGREE | |
| 01BA7 | cd 3f 7d | 1B96 FSUB #36 - RoomX1! (DI still RoomX1!); + RoomX0!; store RowSkip! | RowSkip! = 36 - RoomX1! + RoomX0! | AGREE | |
| 01C43 | 74 03 | FCMP CellRoom!?DrawRoom!; je body else jmp 1C59 | IF CellRoom! <> DrawRoom! THEN GOTO L_1C59 | AGREE | |
| 01CFE | cd 3f 7d | CellTile!*#0.125; INT; store TileHi! | TileHi! = INT(CellTile! * 0.125) | AGREE | |
| 01D69 | c3 | ret (after PUT Tile0 PSET) | RETURN | AGREE | |
| 01DE1 | c3 | ret | RETURN | AGREE | |
| 02024 | cd 3e 58 | coord PxX!,PxY! (cx=ax=-1 singles); bx=0x84C2=Tile26 (8356+26*14); dx=3 PSET | PUT (PxX!, PxY!), Tile26, PSET | AGREE | |
| 0203F | c3 | ret | RETURN | AGREE | |
| 0209F | c3 | ret | RETURN | AGREE | |
| 020E6 | cd 3e 58 | PxX!,PxY!; 0x8524=Tile33; dx=3 | PUT (PxX!, PxY!), Tile33, PSET | AGREE | |
| 02149 | c3 | ret | RETURN | AGREE | |
| 0215E | cd 3e 58 | PxX!,PxY!; 0x856A=Tile38; dx=3 | PUT (PxX!, PxY!), Tile38, PSET | AGREE | |
| 021AB | c3 | ret | RETURN | AGREE | |
| 02253 | c3 | ret | RETURN | AGREE | |
| 023A4 | cd 3e 58 | PxX!,PxY!; 0x8690=Tile59; dx=3 | PUT (PxX!, PxY!), Tile59, PSET | AGREE | |
| 023EF | c3 | ret | RETURN | AGREE | |
| 02407 | c3 | ret | RETURN | AGREE | |
| 02414 | bb 0f 00 | ARGPUSH 0x0F (row 15); LOCATE exec bx=0x1A (26) | LOCATE 15, 26 | AGREE | |
| 02717 | e9 45 00 | FLOAD FirstRow!; jmp 275F store I!; FCMP LastRow! jbe 271A; step = #1 (275C FADD I!+#1) | FOR I! = FirstRow! TO LastRow! | AGREE | |
| 0272F | cd 3f bc | PRINT begin; MID$(K$, DX=CINT(I!*14+1), CX=14); 6E newline; 3E_79 | PRINT MID$(K$, CINT(I! * 14 + 1), 14) | AGREE | |
| 02797 | e8 89 f3 | call 0x1B23 | GOSUB SUB_1B23 | AGREE | |
| 0282A | cd 3f 7d | ABS Script! -> store Script! | Script! = ABS(Script!) | AGREE | |
| 0286E | 75 03 | BOOL CanLeft! (-1 if nonzero); jne -> blocked SOUND; else jmp 2890 | IF (CanLeft! = 0) THEN GOTO L_2890 | AGREE | |
| 0291E | cd 3f 7d | Y! + DY! -> Y! | Y! = Y! + DY! | AGREE | |
| 02A70 | cd 3e 5f | SndDur!*2^1 (FSCALE #01); SOUND 0x4D2=1234 | SOUND 1234, SndDur! * 2 | AGREE | |
| 02B0F | cd 3f 7b | 2B04 jne body; FMOV Found!<-#1 | Found! = 1 | AGREE | |
| 02D53 | cd 3f bc | PRINT begin; CrewName$(CINT(Member!)) (0x4288+4i); 6E newline | PRINT CrewName$(CINT(Member!)) | AGREE | |
| 02E60 | 75 03 | RND*#200 -> T80; FNCrew(Member!,1)+#50; T80>FAC (jbe->0); FNCrew(Member!,31)>0; AND; jne body else jmp 2EC2 | IF NOT ((FNCrew(Member!,31) > 0) AND (RND*200 > FNCrew(Member!,1)+50)) THEN GOTO L_2EC2 | AGREE | FN slots 882E/882A = FNCrew body 0359 |
| 02E71 | cd 3f bc | PRINT begin; CrewName$(CINT(Member!)); 6E | PRINT CrewName$(CINT(Member!)) | AGREE | |
| 02EB0 | cd 3f 7d | RND*TrapLevel!*TrapLevel! + #9; INT; store Damage! | Damage! = INT((RND * TrapLevel!) * TrapLevel! + 9) | AGREE | |
| 03096 | e8 6e e6 | ItemType! = 6 (prev); call 0x1707 | GOSUB SUB_1707 | AGREE | |
| 0315D | cd 3e 5f | SndDur!*#0.9; SOUND 0x15B3=5555 | SOUND 5555, SndDur! * 0.9 | AGREE | |
| 03204 | 75 03 | FTEST Member!; jne continue else jmp 2F8C | IF Member! = 0 THEN GOTO L_2F8C | AGREE | |
| 032C3 | cd 3f bc | PRINT begin; "Out Of Ammo" (8F1A); 6E | PRINT "Out Of Ammo" | AGREE | |
| 03306 | cd 3e 5f | SndDur!*#1.7; SOUND 0x457=1111 | SOUND 1111, SndDur! * 1.7 | AGREE | |
| 0334B | cd 3f 7d | RND^#0.5 -> T80; G!(CINT(WeaponRec!+1)); T0(8968)*G; +#1; INT; DoorHP! - FAC; store DoorHP! | DoorHP! = DoorHP! - (INT((RND^0.5)*(G!(CINT(WeaponRec!+1)))+1)) | AGREE | |
| 0335A | e8 f5 00 | 3352 FCMP DoorHP!?#1 jae -> 335A call 0x3452 (else jmp 3471) | GOSUB SUB_3452 | AGREE | |
| 0337D | cd 3f 7d | G!(CINT(WeaponRec!+3)) + #-1 -> same slot | G!(CINT(WeaponRec!+3)) = G!(CINT(WeaponRec!+3)) - 1 | AGREE | |
| 0338A | e9 ff fb | 3385 jbe 338A (G<=0); 338A jmp 0x2F8C | GOTO L_2F8C | AGREE | |
| 033EE | cd 3f 7b | 33E3 jb body (DoorSgn!<0); FMOV PickPct!<-#0 (8AE6) | PickPct! = 0 | AGREE | |
| 034E9 | 74 03 | FCMP Tile!?#41; je body else jmp 355A | IF Tile! <> 41 THEN GOTO L_355A | AGREE | |
| 0354B | e8 39 2e | call 0x6387 | GOSUB SUB_6387 | AGREE | |
| 03557 | cd 3e 0e | Drive$ + "SPACE.STR" (8FA8) SCAT; CHAIN | CHAIN Drive$ + "SPACE.STR" | AGREE | special/unsampled, checked anyway |
| 035D2 | e8 fe da | Prompt$="Switch who?" (prev); call 0x10D3 | GOSUB SUB_10D3 | AGREE | |
| 035DB | be d2 8a | 35D5 FTEST Member!; jne 35E0 else jmp 37B7 -> IF Member!=0 GOTO 37B7 | IF Member! = 0 THEN GOTO L_37B7 | AGREE | |
| 0363B | e9 b7 01 | FnIField!=0,FnIMember!=Tmp!, call 038B (INT(m*100+f+1500.5)) -> T0; FnIField!=0,FnIMember!=Member!, call 038B; T0-FAC -> 8FE0 RecDiff! | RecDiff! = FNIdx(Tmp!,0) - FNIdx(Member!,0) | AGREE | FN body 038B checked: 8842 = member (*100), 883E = field |
| 03871 | cd 3f 7d | tail of NEXT I! (cmp 6, jmp 37DC); 3871 call 14CA | GOSUB SUB_14CA | AGREE | |
| 0387A | bf 3e 8c | 3874 ItemType! <- #2 (8286) | ItemType! = 2 | AGREE | |
| 03889 | bf ec 8f | si still #0 (87FA, from Tmp!=0 at 387D); 3886 J! <- [si] | J! = 0 | AGREE | |
| 038B6 | be 7c 82 | FLOAD #1; jmp 3A54 (store I!, cmp #6 ja exit / jmp body 38BA) | FOR I! = 1 TO 6 | AGREE | |
| 03A3A | e9 50 00 | IF tail jmp 3A4B; FnIField!=48, FnIMember!=I!, call 038B, CINT -> &G!(); FnField!=49, FnMember!=I!, call 0359 (INT(G!(m*100+f+1500)+.1)); store | G!(CINT(FNIdx(I!,48))) = FNCrew(I!,49) | AGREE | both FN bodies opened; slot mapping 882E member/882A field, 8842/883E correct |
| 03BDD | be d2 8a | PRINT CrewName$(CINT(Member!)) ";" ":" ";" Tmp! NL (prev stmt); 3BD5 ARGPUSH 0x12, BX=DX=26 (DX=BX after LOCATE 15,26 at 3B9A) | LOCATE 18, 26 | AGREE | |
| 03CC9 | d6 | tail of call 14CA; 3CC9 call 13C5 | GOSUB SUB_13C5 | AGREE | |
| 03CF4 | cd 3e 79 | LOCATE 8,4 tail; 3CF4 PRINT begin, "Name" (90BC) 6E NL | PRINT "Name" | AGREE | |
| 03DCF | bb c4 90 | "/" 6A ; ; FnField!=16, FnMember!=I!, call 0359, PRINT sng 67 ; (all part of the PRINT begun at 3D92) | PRINT FNCrew(I!, 16); | AGREE | output-equivalent; but the PRINT begun at 03D92 (items FNCrew(I!,15);"/";FNCrew(I!,16);) is rendered as bare `03D92 PRINT` + two PRINTs -> spurious newline at 03D92 (translator split at FN call; not this item) |
| 03DDB | cd 3e 79 | PRINT end; ARGPUSH omitted; col 0x15 | LOCATE , 21 | AGREE | |
| 03E22 | bf 2a 88 | (PRINT begin 3DFF) FnField!=31, FnMember!=I!, call 0359, CINT, Status$(87BE + 4*n) 6E NL | PRINT Status$(CINT(FNCrew(I!,31))) | AGREE | same split artifact: preceding `03DFF PRINT` (bare) is the PRINT begin of this statement -> extra newline in rendering |
| 03EF8 | bf 7c 82 | I! = I!+1 ; store, cmp #6, ja exit / jmp 3E76 (body after FOR at 3E72) | NEXT I! | AGREE | |
| 0414E | bb 18 00 | ARGPUSH 0x18, last 0x1A | LOCATE 24, 26 | AGREE | |
| 04176 | cd 3f 7d | NEXT M! tail (cmp 6, jmp 3F5C); FTEST NoOxygen!; je skip else jmp 41B5 | IF NoOxygen! <> 0 THEN GOTO L_41B5 | AGREE | |
| 041A3 | cd 3e 44 | LOCATE 21,DX tail; 41A3 PRINT begin, "fully healed" NL | PRINT "fully healed" | AGREE | |
| 042C2 | 8b df | prev PRINT INT(Age!); "years   "; Status$(G!(dx+31)) NL; then ARGPUSH 5, last 0x0E | LOCATE 5, 14 | AGREE | |
| 043EC | bf 0a 88 | PRINT USING "+##"; G!(CINT(Rec!+10)); (prev); 43EC PRINT begin, "%" NL | PRINT "%" | AGREE | |
| 04571 | cd 3f bc | 4571 PRINT begin (target of branch), "Esper Ability:" NL | PRINT "Esper Ability:" | AGREE | |
| 046AE | cd 3f bc | LOCATE 23,15 tail; PRINT begin, "Psy Scream" NL | PRINT "Psy Scream" | AGREE | |
| 0477B | e8 e6 1e | FCMP Cmd! ? #-40 (8C14); jae skip else jmp 4B2A -> Cmd! < -40 | IF Cmd! < -40 THEN GOTO L_4B2A | AGREE | |
| 0499C | cd 3e 44 | LOCATE 4,2 tail; PRINT begin, "Rlds    Weapons" NL | PRINT "Rlds    Weapons" | AGREE | |
| 04A49 | bf 7c 82 | CINT(ListRow!+1) ARGPUSH; last 4 | LOCATE CINT(ListRow! + 1), 4 | AGREE | |
| 04A7D | 7a cd | 4A7D PRINT begin; CHR$(CINT(RldCnt!+48)) 6A ;, "  " (9300) 6A ;, end | PRINT CHR$(CINT(RldCnt! + 48)); "  "; | AGREE | |
| 04AEE | e8 4e 1c | ListLine$ = GunName$(..) tail; 4AEE call 673F | GOSUB SUB_673F | AGREE | |
| 04B27 | e9 96 fe | IF tail jmp 49BD; 4B27 call 6658 | GOSUB SUB_6658 | AGREE | |
| 04B2D | cd 3f | call 1378 tail; 4B2D jmp 41BB | GOTO L_41BB | AGREE | |
| 04CAD | 8b f2 | DX = I! (set 4C43 from si=I! at 4C3B); I!+#12 -> I!; cmp #1088 ja exit / jmp 4C38; FOR at 4C35 from 800 | NEXT I! STEP 12 | AGREE | STEP shown on NEXT (translator convention; FOR line is `FOR I! = 800 TO 1088`) |
| 04EAE | e9 09 00 | DI=DX=Tmp! (4E74/4E7C); if Tmp!<0 (jb): Tmp! <- #0 (890E) | Tmp! = 0 | AGREE | |
| 04F16 | be 12 88 | FLOAD #6; jmp 4F54 (store I!; step MinusOne2! (=-1 at 4F0D) sign test; neg: I! >= 1 jae 4F1A) | FOR I! = 6 TO 1 | AGREE | variable STEP MinusOne2! (-1) rendered on NEXT (04F54 `NEXT I! STEP MinusOne2!`), convention |
| 04F49 | 90 | I!+2 CINT -> &CrewName$(I!+2) in DX; CINT(I!) -> &CrewName$(I!) in DI; RT3F_14 SWAP | SWAP CrewName$(CINT(I!+2)), CrewName$(CINT(I!)) | AGREE | |
| 0500C | 90 | (G!(CINT(ItemRec!)) > 0) -1/0 [FTEST jbe]; T0=ItemRec!+9, (G!(CINT(T0)) > 2) [jbe]; AND; jne body else jmp 5036 | IF NOT ((G!(CINT(ItemRec!+9)) > 2) AND (G!(CINT(ItemRec!)) > 0)) THEN GOTO L_5036 | AGREE | AND operand order swapped only |
| 0517B | cd 3f 61 | EquipRec! <- T0; T0 = ItemRec!+2 stored at 5139 (no intervening T0 write) | EquipRec! = ItemRec! + 2 | AGREE | |
| 05300 | e9 0a 00 | IF Cmd!=-51 (je) : ItemRec! <- #9999 ; RETURN | ItemRec! = 9999 | AGREE | |
| 05321 | bf f0 92 | ListRow! <- #3 (88B2) | ListRow! = 3 | AGREE | |
| 053D4 | e9 fe | jmp 52D2 tail; 53D4 call 13E5 | GOSUB SUB_13E5 | AGREE | |
| 05444 | e9 5b 00 | IF tail jmp 5499; Found! <- I! | Found! = I! | AGREE | |
| 05525 | a6 be | call 13C5 tail; FLOAD #1, jmp 555F (store M!, cmp #10 jbe 5528) | FOR M! = 1 TO 10 | AGREE | |
| 0560E | bf 68 8a | Found! <- #0 | Found! = 0 | AGREE | |
| 05687 | e9 09 00 | IF FNRoom(..)>0 tail; Found! <- #1 | Found! = 1 | AGREE | |
| 056BB | be ce 93 | (ViewRoom! > 0) -1/0 [FTEST jbe]; FnRoom!=ViewRoom!, FnRField!=5, call 03C9 (InMap%(r*11+f+1369)); FTEST FAC jne -> (=0); AND; jne body else jmp 56CC | IF NOT ((FNRoom(ViewRoom!,5) = 0) AND (ViewRoom! > 0)) THEN GOTO L_56CC | AGREE | FN body 03C9 checked: 8856 room (*11), 885A field |
| 0585C | ba c0 00 | prev PUT tail; x = FAC (RadSweep!*8-7 computed 5829, reused), y DX=0xC0=192, arr 8792 BlipH, verb DL=4 XOR | PUT (RadSweep! * 8 - 7, 192), BlipH, XOR | AGREE | |
| 05913 | cd 3d 43 | TIMER -> MotTimer! | MotTimer! = TIMER | AGREE | |
| 0593E | bf fe 93 | (MotSweep! > 24) -1/0 [jbe]; imul 25; CSNG; + MotSweep!; + 1; store MotSweep! | MotSweep! = (MotSweep! > 24) * 25 + MotSweep! + 1 | AGREE | |
| 05941 | e8 01 00 | call 5945 | GOSUB SUB_5945 | AGREE | |
| 0599C | e9 | call 13E5 tail; jmp 2408 | GOTO L_2408 | AGREE | |
| 059CA | 7b | WeaponRec!=788 tail; FnField!=32, FnMember!=Member!, call 0359, store 9424 WepSlot! | WepSlot! = FNCrew(Member!, 32) | AGREE | |
| 05A3E | e9 08 00 | IF tail jmp 5A41; SI=DX=SlotRec! (5A09, si=di=SlotRec!); WeaponRec! <- [si] | WeaponRec! = SlotRec! | AGREE | |
| 05B10 | e9 7b 00 | IF Cmd!=-51 tail (jne/jmp 5B80); WeaponRec!+#12 -> WeaponRec! | WeaponRec! = WeaponRec! + 12 | AGREE | |
| 05C2C | c3 | tail of PRINT "Hand Weapon" (946C, RT3F_6E, 3E_79); 5C2C ret -> RETURN | RETURN | AGREE | |
| 05D4E | e8 79 b7 | call 0x14CA -> GOSUB SUB_14CA | GOSUB SUB_14CA | AGREE | |
| 05D5D | cd 3f bc | after LOCATE 19,28 (0x13/0x1C); PRINT begin, 9490 "Reloading" RT3F_6E (+NL) | PRINT "Reloading" | AGREE | |
| 05DBB | 8b f7 cd 3f a7 | dx=&I! (5D77); FTEST WepSlot! jbe/dec -> (WepSlot!>0); G!(CINT(I!+3)) (88B2=3.0) FTEST jne/dec -> (=0); and; jne 5DC0 (GOSUB 5DDF) else jmp 5DC3 | IF NOT ((G!(CINT(I! + 3)) = 0) AND (WepSlot! > 0)) THEN GOTO L_5DC3 | AGREE | |
| 05F09 | bf 56 88 | FnRoom!(8856)<-RoomNo!(8B24), FnRField!(885A)<-2.0; call 03C9 = InMap%(CINT(room*11+field+1369)); FSTORE Script!(8D8A) | Script! = FNRoom(RoomNo!, 2) | AGREE | FN body 03C9 checked: FNRoom(room,field) mapping correct |
| 05F52 | bb ae 94 | tail PRINT "Nothing"; bx=0x14 ARGPUSH row 20; bx=dx (dx<-bx=0x1D at 5F28, after LOCATE 18,29) LOCATE exec -> LOCATE 20, 29 | LOCATE 20, 29 | AGREE | |
| 0600C | bf 00 8c | CmdMax!(8C00) <- 2.0 (8286) FMOV | CmdMax! = 2 | AGREE | range starts in CmdMin!=1 tail |
| 06034 | e8 d0 b6 | tail ItemType!=11; call 0x1707 | GOSUB SUB_1707 | AGREE | |
| 0607B | bf 3e 8c | ItemType!(8C3E) <- 4.0 (88E2) | ItemType! = 4 | AGREE | |
| 060B8 | bf 9c 48 | MotDetRec!(489C) <- ItemRec!(8C42) FMOV | MotDetRec! = ItemRec! | AGREE | |
| 060D4 | be 0c 8c | FTEST MapHidden!(8C0C); je 60D9 (continue) else jmp 6113 | IF MapHidden! <> 0 THEN GOTO L_6113 | AGREE | |
| 0616F | bf 08 8e | ScoutSkill!(8E08) <- -1.0 (8B90) | ScoutSkill! = -1 | AGREE | |
| 062CC | bb 2c 95 | tail PRINT "dies!!!"; FMUL SndDur!*28.0 (890A); bx=0x384 (900) RT3E_5E/5F vol/voice -1 | SOUND 900, SndDur! * 28 | AGREE | |
| 06379 | cd 3f bc | after LOCATE 13,5; PRINT begin; 954A "You Are All Dead" +NL | PRINT "You Are All Dead" | AGREE | |
| 063BB | bb b0 48 | CSNG 0x48B0 -> T80 (offset); Drive$+"IN"+STR$(-Location!)+".BAS"; cx=0x157E=5502; RT3E_1B BSAVE | BSAVE Drive$ + "IN" + STR$(-Location!) + ".BAS", &H48B0, 5502 | AGREE | |
| 063F5 | e8 04 b0 | tail call 13C5; CSNG 0x5E2E; Drive$+"INMAP"+STR$(-Location!)+".BAS"; cx=0x21FC=8700; BSAVE | BSAVE Drive$ + "INMAP" + STR$(-Location!) + ".BAS", &H5E2E, 8700 | AGREE | |
| 063FF | c3 bf 90 48 | tail RETURN; RadDetOn!(4890) <- 0.0 (93B6) | RadDetOn! = 0 | AGREE | |
| 06439 | bf 98 48 | tail MotDetOn!=0 (si reused); CSNG 0x48B0; Drive$+"IN"+STR$(-Location!)+".BAS"; RT3E_1A BLOAD | BLOAD Drive$ + "IN" + STR$(-Location!) + ".BAS", &H48B0 | AGREE | |
| 0646D | bb 2e 5e | CSNG 0x5E2E; Drive$+"INMAP"+STR$(-Location!)+".BAS"; BLOAD | BLOAD Drive$ + "INMAP" + STR$(-Location!) + ".BAS", &H5E2E | AGREE | |
| 0649D | e8 72 af | tail call 13E5; RT3E_20 mode 0 (INPUT); Drive$+"MES"+STR$(-Location!); bx=1; RT3E_1E OPEN | OPEN Drive$ + "MES" + STR$(-Location!) FOR INPUT AS #1 | AGREE | |
| 064BD | 7b bb 01 00 | tail I!=0; RT3F_B6 #1; MesLine$(8030 +4*CINT(I!)); RT3F_5A LINE INPUT # | LINE INPUT #1, MesLine$(CINT(I!)) | AGREE | |
| 06562 | 7d 8b f7 | Surprise!(9588) FCMP 3.0 (88B2); je 6567 else jmp 656F | IF Surprise! <> 3 THEN GOTO L_656F | AGREE | |
| 06646 | 7b bf 20 3b | N_3B20!(3B20) <- 11.0 (885E) | N_3B20! = 11 | AGREE | |
| 06655 | bb ea 95 | tail GOSUB 4F07; Drive$+"PLBATTLE.EXE" SCAT; RT3E_0E CHAIN | CHAIN Drive$ + "PLBATTLE.EXE" | AGREE | |
| 0669D | 22 00 be f2 87 | FOR I!=501.. body; di=G!+4*CINT(I!) <- 0.0 (9610) | G!(CINT(I!)) = 0 | AGREE | |
| 0676F | 7d 87 f9 | cx=&1.0 (827C via 6748 xchg/674A/674F); xchg cx,di -> SpacePos!(9618)+1.0 FADD -> WrapFrom!(961C) | WrapFrom! = SpacePos! + 1 | AGREE | |
| 06877 | 7d 8b f7 | CINT(ListRow!) ARGPUSH (row); bx=ax (ax<-bx=8 at 6837 after LOCATE ..,8 at 6829) LOCATE exec | LOCATE CINT(ListRow!), 8 | AGREE | |
| 069B3 | 44 cd 3f bc | after LOCATE 18,dx; PRINT begin; 968A "option. ENTER to accept" +NL | PRINT "option. ENTER to accept" | AGREE | |
| 06A51 | e9 07 00 | tail IF Option!<=22 (ja 6A4D); di=&Option!, si=&1.0 (bx from 6A3B) FMOV | Option! = 1 | AGREE | |
| 06B16 | e8 73 aa | tail GOSUB 157D; LEFT$(K$(8802),3) -> SASSIGN Word$(96C6) | Word$ = LEFT$(K$, 3) | AGREE | |
| 06B44 | 90 be f2 87 | SCMP Word$ ? MesLine$(CINT(I!)); je 6B49 (continue) else jmp 6B5F | IF Word$ <> MesLine$(CINT(I!)) THEN GOTO L_6B5F | AGREE | |
| 06BD0 | e9 38 00 | tail IF I!>=-3; FMUL SndDur!*7.0 (88D2); bx=900; SOUND exec | SOUND 900, SndDur! * 7 | AGREE | |
| 06C8F | e9 51 00 | tail IF Op!<0; cx=&Op! (6C15/6C1D), dx=&Script!; ABS(Op!) CINT -> OpLen%(8AEA word) dec bx (-1) CSNG + Script! -> OneShotEnd!(96FE) | OneShotEnd! = OpLen%(CINT(ABS(Op!))) - 1 + Script! | AGREE | |
| 06CE7 | 8b f7 cd 3f 75 | (Op!=ABS(Op!) at 6CCE); OpLen%(CINT(Op!)) CSNG + Script! -> Script! | Script! = OpLen%(CINT(Op!)) + Script! | AGREE | |
| 06D39 | 5e 1b ... | tail ON CINT(Op!+1) GOTO table; L_6D30: TestMode!(87AE) FCMP 1.0; je 6D3E (BEEP) else jmp 6D44 | IF TestMode! <> 1 THEN GOTO L_6D44 | AGREE | |
| 06D59 | e8 1c a6 | call 0x1378 (prev 6D56 = GOSUB 656F) | GOSUB SUB_1378 | AGREE | |
| 06D90 | 8b da | dx=&K$ (after K$=MesLine$(Arg1!)); LEN+0x16(22) CSNG /46.0 (9368) INT; 7.0 - FAC (RT3F_9B) -> TextRow!(8D7A) | TextRow! = 7 - (INT((LEN(K$) + 22) / 46)) | AGREE | |
| 06DA4 | 8b da | LEN(K$) CSNG / 23.0 (8896) -> LastRow23!(9702) | LastRow23! = LEN(K$) / 23 | AGREE | |
| 06E3D | e9 0f 00 | tail IF Op!>9 (ja 6E34); 0x13 ARGPUSH, 8 LOCATE exec | LOCATE 19, 8 | AGREE | |
| 06E59 | 46 be f2 96 | L_6E46: di=G!+4*CINT(Arg1!) <- Arg2!(96F6) | G!(CINT(Arg1!)) = Arg2! | AGREE | |
| 06E65 | e9 99 fd bf | tail GOTO 6BF8; X!(48A0) <- Arg1!(96F2) | X! = Arg1! | AGREE | |
| 06E8A | 48 e9 6b fd | tail InMap%(CINT(Arg1!))=CINT(Arg2!); jmp 6BF8 | GOTO L_6BF8 | AGREE | |
| 06F0C | e9 4a 00 | tail IF FNCrew(I!,..)>0; FnIField!<-Arg1!, FnIMember!<-I!, call 038B (FNIdx=INT(m*100+f+1500.5)) CINT -> G! slot; FnField!<-Arg1!, FnMember!<-I!, call 0359 (FNCrew=INT(G!(CINT(m*100+f+1500))+0.1)) + Arg2! -> store | G!(CINT(FNIdx(I!, Arg1!))) = FNCrew(I!, Arg1!) + Arg2! | AGREE | FN bodies 0359/038B checked: member/field slots match |
| 06FE9 | e9 09 00 | tail IF Option!=Arg1! (je 6FE3); Script! <- Arg2! | Script! = Arg2! | AGREE | |
| 07063 | e9 09 00 | tail IF G!(..)>=Arg2! (jae 705D); Script! <- Arg3!(96FA) | Script! = Arg3! | AGREE | |
| 07066 | e9 8f fb | jmp 6BF8 | GOTO L_6BF8 | AGREE | |
| 070A0 | bf f2 96 | L_7097: Amount!(9770) FCMP Arg1!; jae 70A5 (continue) else jmp 70AE | IF Amount! < Arg1! THEN GOTO L_70AE | AGREE | |
| 070AB | e9 09 00 | tail jmp; Script! <- Arg2! | Script! = Arg2! | AGREE | |
| 070F5 | 64 fc e8 80 a2 | tail L_70F2 jmp 6D59; L_70F5 call 0x1378 | GOSUB SUB_1378 | AGREE | |
