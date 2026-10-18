# STARPORT_GLMVERIFY - independent verification of STARPORT.bas.md (lane glm-verify-starport, GLM 5.3, 2026-10-15)

Inputs verified against: `decode/listings/STARPORT.lst`, `STARPORT.bas.md` (mod-starport; sample drawn from the b99b86a/5b90190 text and **re-checked against the on-disk 71f36ac regeneration** - see Method), `STARPORT_SCREENS.md`, `STARPORT_names.json`, `decode/data/tools/_STARPORT.json` (data-lane literal table, code end 0xAD00), `decode/brun30/RT_LEDGER.md`.

Method: the sampled text contained 2,700 offset-tagged lines; 25 are the disclosed tail after the last reachable code (the error-handler `END` at ACC2; the stray renders at 0ACC8/0ACCB and the `' asm` data lines up to 0ACFE - all verified against the listing), leaving **2,675 code statements**. **10% = 268 statements drawn with `random.seed(20261018)`, `random.sample`**, plus every CHAIN/BLOAD/BSAVE/ON GOTO/ON GOSUB/INPUT/OPEN site not already in the draw (38 more) = **306 statements re-derived from the listing bytes** - tempbase A87C (T0 = the SPPIC BLOAD offset &H4926 at 10B7), FCMP/jcc polarity, boolean -1/0 idioms, ON-table inline words with the +0x10 rule, INFO.BAS array indexing (base + (i + f*count)*4), DEF FN inlining of FNCrew/FNIdx/FNCredits - with literals checked against the data-lane table (acb8 'STARPORT ', af00 '(yes/no) ', af3e 'Returns Department', adba 'K-Christen', b130 'shields, etc.  is 15% of cost.', b37c 'WEAPONS D-Electric', b3c2 'L-EXPLOSIVE WEAPONS', b48c 'Unit', b50c 'E-Missle Killers', b72a 'Recruitment Office', b972 'A-Repair Ships Equipment', b9b2 'C-Remove Armor From Ship', b9de 'Repair What?  *-Broken  #-4000 to fix', bbac 'Headquarters', bc58 'TRY WHICH MISSION (1-50)?', bbf0 'MISSION', bf58 'Esper Ability', c014 'Sighting Hardware..', c02c 'Clones.............', c0a4 'ISS ', c1a8 'Defense Hardware......', c20a 'Saving game.', c26a 'CHARINFO.BAS', c2f0 'SPACE.STR', c3ba '#   Shield', c46e 'fire', b098 'Ammo for ', plus the singles 0.5/0.15/0.667/1.2/30000/57.296-family constants and the USING formats '##','###','+##','#######').

**Mid-verification regeneration re-check**: while this pass was running, mod-inside committed 71f36ac, regenerating STARPORT.bas.md (12 PRINT/FN joins + the variable-STEP FOR at 0AA5F; now 2,680 offset lines). All 306 sampled statements were re-compared against the regenerated file: 304 byte-identical, 06F73 now renders the joined `PRINT "HP"; FNCrew(I!, 15); "/"; FNCrew(I!, 16)` (one RT3F_BC at 06F73 ... one RT3E_79 - listing 06F73-06FA8 re-derived, correct), and the drawn 0AA68 `IF YStep! >= 0 THEN GOTO L_AA7A` was absorbed into `FOR DotY! = 111 TO 73 ... NEXT DotY! STEP YStep!` (0AA01/0AA5C; the FADD DotY!+YStep! at 0AA59, FSTORE at 0AA5C, step-sign FTEST/jb at 0AA65/0AA68 and the `jae 0xaa04` back-edge at 0AA75 re-derived - the table row below cites 0AA5C). All still AGREE.

Verdicts: **306 AGREE, 0 DISAGREE, 0 UNSURE.**

## Disagreements

**None.** Additional checks worth recording:

- **Exhaustive PUT verb audit (beyond the sample): all 22 PUT statements in the body match the listing verb bytes exactly** - 15 `, PSET` = `mov dx,3` (PortPic in the right panel, the 14 "fire"/FIRE.BAS medal frames), 6 `, XOR` = `mov dx,4` (Logo at (232,7), the 4 SHIPPICS.BAS ship-class pictures at (261,74), the Flame, Medal11), 1 `, PRESET` = `mov dx,2` (the inverted banner restore at 01D5D). No verb-0/verb-1 sites exist in this module. Coordinates spot-checked against the `bx=x, dx=y` pairs before RT3E_89 (e.g. 0AA9B (0x11D,0x45) = (285,69), 0ABB7 (0xF4,0x21) = (244,33)).
- **All 11 dispatch tables decode word-for-word**: main menu `ON Cmd! GOTO` n=26 (0227D: 13 live letters A..T with the L_225A default filling slots 10/14..19/21..26 and L_A8A7 at slot 20 - the T-Time Delay), personnel n=3 (054CD), sell n=5 (02C72), ships-equipment n=3 (0386A), buy n=6 (03949), weapons n=6 (0482C), repair `ON G!(Cmd!)+1` n=4 (06971, first two targets equal - the G!=0/-1 merge), training n=4 (06EEB), training-C n=4 (07D34), inspect n=5 (084A0), `ON ListKind! GOSUB` n=9 (0A25F).
- **MISSION file I/O** (0762A OPEN INPUT, 07643 `INPUT #1, MissionText1$, MissionText2$` types=04 04, 07665 `INPUT #1, G!(CINT(J!))` types=02, the 15-integer parameter read into G!(2230..2244)) re-derives exactly; the dead mission chooser 7805-7936 (`INPUT "TRY WHICH MISSION (1-50)?"; Flag!`, prompt type byte 02 = single `Flag!`) is disclosed as unreferenced in the header and confirmed (no incoming edge).
- **Save path**: 09CF3 `BSAVE Drive$ + "CHARINFO.BAS", &H1850, 10404` (len 0x28A4), 09D0C `OPEN Drive$ + "CHARNAME" FOR OUTPUT AS #1`, 09F3F `CHAIN Drive$ + "SPACE.STR"` (followed by the RT3E_01 END, i.e. CHAIN-with-END), all with the SCAT composition `Drive$` at 0x4F78.
- **tempbase proof**: the `RT3F_71 #80`/`RT3F_9D #80` temp-slot idiom (e.g. 062E3 RecDelta!, 070DC DaysAway!) and the SPPIC BLOAD at 010B7 whose offset &H4926 arrives through T0 (0xA87C) both re-derive as rendered.
- **Tail honesty**: 0ACC2 `CALL RT3E_02` = the error-handler END; 0ACC5 `mov si,0xa984` + 0ACC8 FMOV + 0ACCB `call 0x10aae` (un-wrapped 0x0AAE, mid-medal-ceremony - not a routine) are exactly the two disclosed stray renders; 0ACD1 onward are `00 01 00 08 00 00 ...` data bytes rendered as `' asm` lines. Nothing hidden.
- **Disclosed cosmetic limitation** (AGREE, header-listed): 4895/4945/4B04/4CC2/4D1E render `word ptr [0xae70]` inside `imul` expressions where the body means `NumIn%` (e.g. 04B04 `G!(7 * word ptr [0xae70] + 683)` = `7 * NumIn% + 683`; the `mov`-resolved sites like 03C6F/041C5 correctly print `NumIn%`). Request already filed in STATUS.md by the lane; no verdict change.

## names/_SCREENS/Unknowns checks

- **STARPORT_names.json**: 460 named entries; the 398 variable/array/SUB-input keys all carry a non-empty `_why` (checked programmatically); the 62 remaining keys are SUB*/FN*/FN*_args entries whose roles live in the 57-row Subroutines table of the .bas.md (same design as SPACE/INSIDE/SPBATTLE; the table also honestly documents the phantom SUB_0AAE). ~50 `_why` claims re-verified during derivation (CmdMin!/CmdMax! at 0xae0e/0xae12, ListWord$/ListKind! in SUB_A1D8, Rank$/Skill$/ItemName$ NAME-file indices, the INFO.BAS table bases 0x554E/0x586E/0x63C6/0x628E, PortName$/PortPic &H4926, G!(2265) save lock).
- **STARPORT_SCREENS.md**: 198 quoted display texts checked; 188 are direct string-table literals; the 10 exceptions are runtime compositions whose parts are all literals - 'Select A Unit/Hand Weapon/Missle Killer/Shield/Ship Weapon/Suit/Weapon/Defense Unit' = `"Select A "` + ListWord$ (SUB_A1D8), 'GUN n'/'SHIELD n' = `"GUN"|"SHIELD" + STR$ + "  " + name` (0313B/0306F), 'Defense....+##%' = literal 'Defense....' + PRINT USING '+##' + '%'.
- **Unknowns honesty**: the header states "No runtime call is left unrendered" and it holds - **zero `RT3x_yy` tokens anywhere in the file** (body or header prose); the declared M-marked interpretation points (INFO.BAS column meanings, G!(28)/2300/2597/742-758, PriceFactor! = 1.2) match what the sampled statements show, and the unreferenced-block list (08A7-1071 DebugLoad!-guarded, 22BB-22C1, 2920-294F, 7805-7936, 793F-7986, A40A-A421) spot-checked correct.

## Summary (counts)

- 306 statements re-derived (268 random at seed 20261018 + 38 CHAIN/BLOAD/BSAVE/ON GOTO/ON GOSUB/INPUT/OPEN sites): 306 AGREE / 0 DISAGREE / 0 UNSURE; 0 verb-label defects (file generated with the fixed PUT map); all 306 re-checked against the 71f36ac regeneration (304 identical, 06F73 joined PRINT, 0AA68 absorbed into the 0AA5C NEXT STEP).
- Exhaustive extra check: all 22 PUT statements match their listing verbs exactly (15 PSET / 6 XOR / 1 PRESET); all 11 ON-tables decode word-for-word.
- names: 398/398 variables carry a supported `_why` (SUB/FN roles in the Subroutines table); screens: all 198 quoted texts proven (188 direct, 10 composed from literals); Unknowns honest (0 unrendered, 0 RT tokens).

## Verdict table

| off | pseudocode statement | verdict | listing bytes at (and before) the statement |
|---|---|---|---|
| 0004C | PLAY "MF" | AGREE | `00049 bb 20 49 mov bx, 0x4920 / 0004C cd 3e 51 CALL RT3E_51 ; PLAY s$[BX]` |
| 000E0 | BLOAD Drive$ + "SHIPPICS.BAS", &H4F9E | AGREE | `000DD ba 1a 00 mov dx, 0x1a / 000E0 cd 3e 1a CALL RT3E_1A ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 000FD CAT | BLOAD "CHARINFO", &H1850 | AGREE | `000FA ba 1a 00 mov dx, 0x1a / 000FD cd 3e 1a CALL RT3E_1A ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 0012A | SlotTag$(1) = "P" | AGREE | `00127 ba 94 a5 mov dx, 0xa594 / 0012A cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX]` |
| 001C4 | ClassName$(0) = "Marine" | AGREE | `001C1 ba f2 a5 mov dx, 0xa5f2 / 001C4 cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX]` |
| 0020F CAT | BLOAD Drive$ + "INFO.BAS", &H51F6 | AGREE | `0020C ba 1a 00 mov dx, 0x1a / 0020F cd 3e 1a CALL RT3E_1A ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 00229 CAT | BLOAD "LOGO", &H40F4 | AGREE | `00226 ba 1a 00 mov dx, 0x1a / 00229 cd 3e 1a CALL RT3E_1A ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 00239 CAT | OPEN "NAME" FOR INPUT AS #1 | AGREE | `00236 ba 62 a6 mov dx, 0xa662 / 00239 cd 3e 1e CALL RT3E_1E ; OPEN file$[DX] AS #BX, reclen CX` |
| 00249 CAT | INPUT #1, Rank$(CINT(I!)) | AGREE | `00246 bb 01 00 mov bx, 1 / 00249 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 0028B CAT | INPUT #1, Skill$(CINT(I!)) | AGREE | `00288 bb 01 00 mov bx, 1 / 0028B cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 002CD | INPUT #1, ShipClassName$(CINT(I!)) | AGREE | `002CA bb 01 00 mov bx, 1 / 002CD cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 0030F CAT | INPUT #1, ShipSize$(CINT(I!)) | AGREE | `0030C bb 01 00 mov bx, 1 / 0030F cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00351 CAT | INPUT #1, ShieldName$(CINT(I!)) | AGREE | `0034E bb 01 00 mov bx, 1 / 00351 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00393 CAT | INPUT #1, DefHwName$(CINT(I!)) | AGREE | `00390 bb 01 00 mov bx, 1 / 00393 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 003D5 CAT | INPUT #1, MissileKillerName$(CINT(I!)) | AGREE | `003D2 bb 01 00 mov bx, 1 / 003D5 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00417 | INPUT #1, GunName$(CINT(I!)) | AGREE | `00414 bb 01 00 mov bx, 1 / 00417 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00459 CAT | INPUT #1, WeaponName$(CINT(I!)) | AGREE | `00456 bb 01 00 mov bx, 1 / 00459 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 0049B CAT | INPUT #1, HandWeaponName$(CINT(I!)) | AGREE | `00498 bb 01 00 mov bx, 1 / 0049B cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 004DD CAT | INPUT #1, SightingName$(CINT(I!)) | AGREE | `004DA bb 01 00 mov bx, 1 / 004DD cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 0051F CAT | INPUT #1, ArmorSuitName$(CINT(I!)) | AGREE | `0051C bb 01 00 mov bx, 1 / 0051F cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00561 CAT | INPUT #1, MiscItemName$(CINT(I!)) | AGREE | `0055E bb 01 00 mov bx, 1 / 00561 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 0059C | FOR I! = 0 TO 99 | AGREE | `00599 cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 0059C e9 29 00 jmp 0x5c8` |
| 005A3 | INPUT #1, ItemName$(CINT(I!)) | AGREE | `005A0 bb 01 00 mov bx, 1 / 005A3 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 005E5 CAT | INPUT #1, FindName$(CINT(I!)) | AGREE | `005E2 bb 01 00 mov bx, 1 / 005E5 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00620 | FOR I! = 0 TO 22 | AGREE | `0061D cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 00620 e9 29 00 jmp 0x64c` |
| 00627 | INPUT #1, ShipType$(CINT(I!)) | AGREE | `00624 bb 01 00 mov bx, 1 / 00627 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00669 CAT | INPUT #1, EquipName$(CINT(I!)) | AGREE | `00666 bb 01 00 mov bx, 1 / 00669 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 006AB CAT | INPUT #1, AttrName$(CINT(I!)) | AGREE | `006A8 bb 01 00 mov bx, 1 / 006AB cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 006F3 CAT | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | `006F0 ba 9a a6 mov dx, 0xa69a / 006F3 cd 3e 1e CALL RT3E_1E ; OPEN file$[DX] AS #BX, reclen CX` |
| 006F9 CAT | INPUT #1, ShipName$ | AGREE | `006F6 bb 01 00 mov bx, 1 / 006F9 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 00713 CAT | INPUT #1, CrewName$(CINT(I!)) | AGREE | `00710 bb 01 00 mov bx, 1 / 00713 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 0082B | NEXT I! | AGREE | `00828 cd 3f 7f CALL RT3F_7F ; FADD [SI]+[DI]->FAC / 0082B bf c4 a5 mov di, 0xa5c4` |
| 00853 | Ordinal$(2) = "third" | AGREE | `00850 ba 18 a7 mov dx, 0xa718 / 00853 cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX]` |
| 00884 | PRINT "Change things? "; | AGREE | `00881 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 00884 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0089E | GOTO L_0F4C | AGREE | `0089B e9 d6 07 jmp 0x1074 / 0089E e9 ab 06 jmp 0xf4c` |
| 008DD | G!(815) = -2 | AGREE | `008DA be 48 a8 mov si, 0xa848 / 008DD cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 0096B | G!(725) = 11 | AGREE | `00968 be ee a5 mov si, 0xa5ee / 0096B cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 009A1 | FOR I! = 1 TO 8 | AGREE | `0099E cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 009A1 e9 56 00 jmp 0x9fa` |
| 009FA | NEXT I! | AGREE | `009F7 cd 3f 7f CALL RT3F_7F ; FADD [SI]+[DI]->FAC / 009FA bf c4 a5 mov di, 0xa5c4` |
| 00A19 | FOR I! = 1 TO 8 | AGREE | `00A16 cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 00A19 e9 9d 00 jmp 0xab9` |
| 00AF7 | G!(CINT(I!)) = RND * 3 | AGREE | `00AF5 8b fb mov di, bx / 00AF7 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 00B67 | G!(CINT(FNIdx(5, 49))) = 13 | AGREE | `00B64 be 6a a6 mov si, 0xa66a / 00B67 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 00C77 | G!(116) = 2 | AGREE | `00C74 bf 20 1a mov di, 0x1a20 / 00C77 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 00DB0 | FOR I! = 1 TO 8 | AGREE | `00DAD cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 00DB0 e9 32 00 jmp 0xde5` |
| 00DFB | Years! = 72 | AGREE | `00DF8 be 90 a9 mov si, 0xa990 / 00DFB cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 00ED6 | NEXT I! | AGREE | `00ED3 cd 3f 7f CALL RT3F_7F ; FADD [SI]+[DI]->FAC / 00ED6 bf c4 a5 mov di, 0xa5c4` |
| 00FA4 | FOR I! = 742 TO 758 | AGREE | `00FA1 cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 00FA4 e9 22 00 jmp 0xfc9` |
| 00FDF | FOR I! = 110 TO 159 | AGREE | `00FDC cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 00FDF e9 22 00 jmp 0x1004` |
| 0103F | NEXT I! STEP 3 | AGREE | `0103C cd 3f 7f CALL RT3F_7F ; FADD [SI]+[DI]->FAC / 0103F bf c4 a5 mov di, 0xa5c4` |
| 01055 | G!(158) = 2 | AGREE | `01052 be 94 4f mov si, 0x4f94 / 01055 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 010B7 | BLOAD Drive$ + "SPPIC" + STR$(-PortNo! - 1) + ".BAS", &H4926 | AGREE | `010B4 ba 7c a8 mov dx, 0xa87c / 010B7 cd 3e 1a CALL RT3E_1A ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 010BA | GOSUB SUB_1EFD | AGREE | `010B7 cd 3e 1a CALL RT3E_1A ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC / 010BA e8 40 0e call 0x1efd` |
| 0122D | Flag! = 0 | AGREE | `0122A be 6e a6 mov si, 0xa66e / 0122D cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 01280 | Flag! = 1 | AGREE | `0127D bf 2c aa mov di, 0xaa2c / 01280 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 012DD | IF Flag! <> 1 THEN GOTO L_1380 | AGREE | `012DA cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 012DD 74 03 je 0x12e2` |
| 015CE | LOCATE 24, 2 | AGREE | `015CB bb 02 00 mov bx, 2 / 015CE cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 015D1 | GOSUB SUB_20DD | AGREE | `015CE cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 015D1 e8 09 0b call 0x20dd` |
| 01603 | Tons! = G!(CINT(I! + 10)) | AGREE | `01600 bf 76 ab mov di, 0xab76 / 01603 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 0161B | GOTO L_166E | AGREE | `01618 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 0161B e9 50 00 jmp 0x166e` |
| 01674 | TonsPos! = Tons! | AGREE | `01671 be 76 ab mov si, 0xab76 / 01674 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 0169A | IF INT(Tmp2! + 0.5) <> 9 THEN GOTO L_16B3 | AGREE | `01697 cd 3f a1 CALL RT3F_A1 ; FCMP FAC?[DI] ; flags / 0169A 74 03 je 0x169f` |
| 01816 | KillTo2! = KillPtr! | AGREE | `01813 be 2c 1d mov si, 0x1d2c / 01816 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 018F7 | FOR I! = 110 TO 159 | AGREE | `018F4 cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 018F7 e9 f3 02 jmp 0x1bed` |
| 019D1 | IF PayDays! <= 60 THEN GOTO L_19DB | AGREE | `019CE cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 019D1 77 03 ja 0x19d6` |
| 01A2A | LOCATE 17, 2 | AGREE | `01A27 bb 02 00 mov bx, 2 / 01A2A cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 01A7D | Amount! = INT(((PayTable!(CINT(RankNo!))) * PayDays!) / 30) | AGREE | `01A7A bf 4c aa mov di, 0xaa4c / 01A7D cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 01A89 | LOCATE 18, 2 | AGREE | `01A86 bb 02 00 mov bx, 2 / 01A89 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 01AD5 | IF NOT ((RankNo! < 13) AND (RND * 100 < 20 - RankNo!)) THEN GOTO L_1B4B | AGREE | `01AD3 23 c9 and cx, cx / 01AD5 75 03 jne 0x1ada` |
| 01BA1 | G!(CINT(FNIdx(Member!, 9))) = FNCrew(Member!, 9) + 1 | AGREE | `01B9E 8b 7e fa mov di, word ptr [bp - 6] / 01BA1 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 01BAD | NEXT Member! | AGREE | `01BAA cd 3f 7f CALL RT3F_7F ; FADD [SI]+[DI]->FAC / 01BAD bf fe a9 mov di, 0xa9fe` |
| 01C51 | LINE (5, 117)-(314, 194), , B | AGREE | `01C4F 8b cb mov cx, bx / 01C51 cd 3e 86 CALL RT3E_86 ; LINE exec color BX, DX -1/0=B/1=BF, style CX` |
| 01C60 | PRINT "STARPORT "; PortName$(CINT(PortNo!)) | AGREE | `01C5D cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 01C60 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 01D4B | PUT (232, 7), Logo, XOR | AGREE | `01D48 ba 04 00 mov dx, 4 / 01D4B cd 3e 58 CALL RT3E_58 ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 01E46 | GOSUB SUB_646D | AGREE | `01E43 cd 3e 86 CALL RT3E_86 ; LINE exec color BX, DX -1/0=B/1=BF, style CX / 01E46 e8 24 46 call 0x646d` |
| 01E97 | RETURN | AGREE | `01E94 e8 2d 04 call 0x22c4 / 01E97 c3 ret` |
| 01EE0 | CreditsHi! = Tmp3! | AGREE | `01EDD bf 88 19 mov di, 0x1988 / 01EE0 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 01EFC | RETURN   'with FAC = Amount! - (CreditsHi! * 30000) | AGREE | `01EF9 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 01EFC c3 ret` |
| 01F10 | PUT (232, 32), PortPic, PSET | AGREE | `01F0D ba 03 00 mov dx, 3 / 01F10 cd 3e 58 CALL RT3E_58 ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 01FBA | IF K$ = "" THEN GOTO L_1FA9 | AGREE | `01FB7 cd 3f 62 CALL RT3F_62 ; SCMP s$[AX]?s$[BX] ; flags / 01FBA 74 ed je 0x1fa9` |
| 01FD3 | IF I! <> 13 THEN GOTO L_1FE4 | AGREE | `01FD0 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 01FD3 74 03 je 0x1fd8` |
| 01FDE | Member! = 0 | AGREE | `01FDB be 16 ad mov si, 0xad16 / 01FDE cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 02071 | Member! = I! - 46 | AGREE | `0206E bf fe a9 mov di, 0xa9fe / 02071 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 0210A | IF CHR$(13) <> K$ THEN GOTO L_20E9 | AGREE | `02107 cd 3f 62 CALL RT3F_62 ; SCMP s$[AX]?s$[BX] ; flags / 0210A 75 dd jne 0x20e9` |
| 021DC | PRINT "K-Christen" | AGREE | `021D9 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 021DC cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 021F0 | LOCATE 21, 2 | AGREE | `021EE 87 d9 xchg cx, bx / 021F0 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 0227D CAT | ON CINT(Cmd!) GOTO L_543C, L_37D0, L_2BB3, L_667D, L_7C01, L_2396, L_9AA7, L_7515, L_83FC, L_225A, L_9F45, L_9D9C, L_6E4 | AGREE | `0227A cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 0227D cd 3f 5e 1a 2c 54 c0 37 a3 .. CALL RT3F_5E n=26 -> 0543C 037D0 02BB3 0667D 07C01 02396 09AA7 07515 083FC 0225A 09F45 09D9C 06E43 0225A 022` |
| 022E3 | Cmd! = ASC(K$) | AGREE | `022E0 bf 16 ae mov di, 0xae16 / 022E3 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 02373 | RETURN | AGREE | `02370 cd 3e 86 CALL RT3E_86 ; LINE exec color BX, DX -1/0=B/1=BF, style CX / 02373 c3 ret` |
| 02392 | LINE (7, 128)-(312, 192), 0, BF | AGREE | `0238F b9 ff ff mov cx, 0xffff / 02392 cd 3e 86 CALL RT3E_86 ; LINE exec color BX, DX -1/0=B/1=BF, style CX` |
| 02395 | RETURN | AGREE | `02392 cd 3e 86 CALL RT3E_86 ; LINE exec color BX, DX -1/0=B/1=BF, style CX / 02395 c3 ret` |
| 0239F | IF G!(43) <> 0 THEN GOTO L_23A9 | AGREE | `0239C cd 3f a7 CALL RT3F_A7 ; FTEST [SI] ; ZF=zero CF=negative / 0239F 74 03 je 0x23a4` |
| 024E5 | GOSUB SUB_2352 | AGREE | `024E2 e8 d1 fb call 0x20b6 / 024E5 e8 6a fe call 0x2352` |
| 02624 | IF LEN(K$) >= MaxLen! THEN GOTO L_254C | AGREE | `02621 cd 3f a1 CALL RT3F_A1 ; FCMP FAC?[DI] ; flags / 02624 72 03 jb 0x2629` |
| 02667 | RETURN | AGREE | `02664 e8 4f fa call 0x20b6 / 02667 c3 ret` |
| 02693 | LOCATE 20, 2 | AGREE | `02690 bb 02 00 mov bx, 2 / 02693 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 0291A | YesNo! = 0 | AGREE | `02917 be 6e a6 mov si, 0xa66e / 0291A cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 0291E | GOTO L_28BA | AGREE | `0291D c3 ret / 0291E eb 9a jmp 0x28ba` |
| 02959 | PRINT "(yes/no) "; | AGREE | `02956 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 02959 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 029B2 | YesNo! = 1 | AGREE | `029AF be 6c 4f mov si, 0x4f6c / 029B2 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 029F4 | GOTO L_2973 | AGREE | `029F1 cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 029F4 e9 7c ff jmp 0x2973` |
| 02BC2 | PRINT "Returns Department" | AGREE | `02BBF cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 02BC2 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 02C5C | IF Cmd! = -32 THEN GOTO L_2C50 | AGREE | `02C59 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 02C5C 74 f2 je 0x2c50` |
| 02C72 CAT | ON CINT(Cmd!) GOTO L_2C86, L_2F07, L_3223, L_3503, L_7989 | AGREE | `02C6F cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 02C72 cd 3f 5e 05 76 2c f7 2e 13 .. CALL RT3F_5E n=5 -> 02C86 02F07 03223 03503 07989 ; ON BX GOTO tbl ; inline count + words (listing=+10h)` |
| 02C86 | GOSUB SUB_2352 | AGREE | `02C83 e9 c9 f6 jmp 0x234f / 02C86 e8 c9 f6 call 0x2352` |
| 02C89 | GOSUB SUB_2EA5 | AGREE | `02C86 e8 c9 f6 call 0x2352 / 02C89 e8 19 02 call 0x2ea5` |
| 02D19 | Value! = WeaponTable!(CINT(I!) + 486) | AGREE | `02D16 bf dc af mov di, 0xafdc / 02D19 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 02E19 | I! = G!(CINT(Rec!)) - 1 | AGREE | `02E16 bf c4 a5 mov di, 0xa5c4 / 02E19 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 02E66 | Value! = MiscItemTable!(CINT(I!) + 11) | AGREE | `02E63 bf dc af mov di, 0xafdc / 02E66 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 02E9F | GOSUB SUB_32D4 | AGREE | `02E9C cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 02E9F e8 32 04 call 0x32d4` |
| 02F13 | ListMode! = -1 | AGREE | `02F10 be 44 a8 mov si, 0xa844 / 02F13 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 031AF | Tmp! = Rec! | AGREE | `031AC bf 30 aa mov di, 0xaa30 / 031AF cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 031D4 | K$ = "Ammo for " + GunName$(CINT(I!)) | AGREE | `031D1 ba 12 ad mov dx, 0xad12 / 031D4 cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX]` |
| 031E7 | Value! = GunTable!(CINT(I!) + 125) | AGREE | `031E4 bf dc af mov di, 0xafdc / 031E7 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 031EA | GOSUB SUB_32D4 | AGREE | `031E7 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 031EA e8 e7 00 call 0x32d4` |
| 0322F | ListMode! = -1 | AGREE | `0322C be 44 a8 mov si, 0xa844 / 0322F cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 0325B | I! = G!(CINT(Rec!)) | AGREE | `03258 bf c4 a5 mov di, 0xa5c4 / 0325B cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 03377 | PRINT LEFT$(K$, 33) | AGREE | `03374 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 03377 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 03445 | IF Cmd! <> -32 THEN GOTO L_3457 | AGREE | `03442 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 03445 74 03 je 0x344a` |
| 034DD | LOCATE CINT(Cmd! + 16), 2 | AGREE | `034DA bb 02 00 mov bx, 2 / 034DD cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 034FA | GOTO L_3500 | AGREE | `034F7 e8 dc f9 call 0x2ed6 / 034FA e9 03 00 jmp 0x3500` |
| 03509 | IF G!(43) <> 0 THEN GOTO L_352F | AGREE | `03506 cd 3f a7 CALL RT3F_A7 ; FTEST [SI] ; ZF=zero CF=negative / 03509 74 03 je 0x350e` |
| 03529 | GOSUB SUB_20B6 | AGREE | `03526 cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 03529 e8 8a eb call 0x20b6` |
| 0352F | GOSUB SUB_2352 | AGREE | `0352C e9 84 f6 jmp 0x2bb3 / 0352F e8 20 ee call 0x2352` |
| 03557 | PRINT "shields, etc.  is 15% of cost." | AGREE | `03554 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 03557 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 03702 | Amount! = Amount! - ((GunTable!(CINT(G!(CINT(Rec!)) - 1) + 100)) * 0.15) | AGREE | `03700 8b fe mov di, si / 03702 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 03785 | GOSUB SUB_1E98 | AGREE | `03782 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 03785 e8 10 e7 call 0x1e98` |
| 037DC | LOCATE 16, 8 | AGREE | `037D9 bb 08 00 mov bx, 8 / 037DC cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 037F4 | LOCATE 19, 2 | AGREE | `037F1 bb 02 00 mov bx, 2 / 037F4 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 03861 | GOSUB SUB_2352 | AGREE | `0385E e9 ee ea jmp 0x234f / 03861 e8 ee ea call 0x2352` |
| 0386A CAT | ON CINT(Cmd!) GOTO L_3874, SUB_4771, L_5198 | AGREE | `03867 cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 0386A cd 3f 5e 03 64 38 61 47 88 .. CALL RT3F_5E n=3 -> 03874 04771 05198 ; ON BX GOTO tbl ; inline count + words (listing=+10h)` |
| 038E2 | LOCATE 19, 20 | AGREE | `038DF bb 14 00 mov bx, 0x14 / 038E2 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 03924 | CmdMax! = 6 | AGREE | `03921 be 96 a6 mov si, 0xa696 / 03924 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 03927 | GOSUB SUB_1E7C | AGREE | `03924 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 03927 e8 52 e5 call 0x1e7c` |
| 03949 CAT | ON CINT(Cmd!) GOTO L_3959, L_3F25, L_4190, L_4313, L_446A, L_45F0 | AGREE | `03946 cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 03949 cd 3f 5e 06 49 39 15 3f 80 .. CALL RT3F_5E n=6 -> 03959 03F25 04190 04313 0446A 045F0 ; ON BX GOTO tbl ; inline count + words (listing=+10` |
| 0396E | FOR I! = 800 TO 1088 | AGREE | `0396B cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 0396E e9 a3 00 jmp 0x3a14` |
| 03A87 | LOCATE 17, 22 | AGREE | `03A84 bb 16 00 mov bx, 0x16 / 03A87 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 03B2A | LINE (58, 147)-(64, 147) | AGREE | `03B28 8b ca mov cx, dx / 03B2A cd 3e 86 CALL RT3E_86 ; LINE exec color BX, DX -1/0=B/1=BF, style CX` |
| 03B54 | PRINT "WEAPONS D-Electric" | AGREE | `03B51 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 03B54 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 03B6B | LOCATE 21, 10 | AGREE | `03B68 bb 0a 00 mov bx, 0xa / 03B6B cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 03B9D | PRINT "L-EXPLOSIVE WEAPONS" | AGREE | `03B9A cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 03B9D cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 03BC3 | LINE (64, 139)-(64, 171) | AGREE | `03BC1 8b ca mov cx, dx / 03BC3 cd 3e 86 CALL RT3E_86 ; LINE exec color BX, DX -1/0=B/1=BF, style CX` |
| 03BDB | IF Cmd! = -32 THEN GOTO L_3BC6 | AGREE | `03BD8 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 03BDB 74 e9 je 0x3bc6` |
| 03C6F | NumIn% = CINT(Cmd! - 1) | AGREE | `03C6D 8b c3 mov ax, bx / 03C6F a3 70 ae mov word ptr [0xae70], ax` |
| 03D5F | G!(CINT(Slot! + 4)) = WeaponTable!(NumIn% + 108) | AGREE | `03D5B 81 c6 6e 58 add si, 0x586e / 03D5F cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 0407A | GOSUB SUB_2687 | AGREE | `04077 e9 06 00 jmp 0x4080 / 0407A e8 0a e6 call 0x2687` |
| 0410D | G!(NumIn% + 501) = G!(NumIn% + 501) + 1 | AGREE | `0410B 8b f9 mov di, cx / 0410D cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 041C5 | NumIn% = CINT(Cmd! - 1) | AGREE | `041C3 8b c3 mov ax, bx / 041C5 a3 70 ae mov word ptr [0xae70], ax` |
| 04203 | IF NOT ((FNCrew(Member!, 35) < 3) AND (NumIn% = 5)) THEN GOTO L_420D | AGREE | `04201 23 db and bx, bx / 04203 75 03 jne 0x4208` |
| 0420B | GOTO L_4190 | AGREE | `04208 cd 3e 2b CALL RT3E_2B ; BEEP / 0420B eb 83 jmp 0x4190` |
| 04219 | LOCATE 20, 2 | AGREE | `04216 bb 02 00 mov bx, 2 / 04219 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 04270 | G!(CINT(FNIdx(Member!, 44))) = HandWeaponTable!(NumIn% + 6) * 10 | AGREE | `0426E 8b fa mov di, dx / 04270 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 0459B | G!(CINT(FNIdx(Member!, 49))) = ArmorSuitTable!(NumIn%) | AGREE | `04598 8b 76 f6 mov si, word ptr [bp - 0xa] / 0459B cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 04623 | I! = 2999 | AGREE | `04620 be b0 b4 mov si, 0xb4b0 / 04623 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 04650 | GOTO L_388B | AGREE | `0464D e8 f9 df call 0x2649 / 04650 e9 38 f2 jmp 0x388b` |
| 04674 | ListWord$ = "Unit" | AGREE | `04671 ba e8 b3 mov dx, 0xb3e8 / 04674 cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX]` |
| 04677 | GOSUB SUB_A1D8 | AGREE | `04674 cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX] / 04677 e8 5e 5b call 0xa1d8` |
| 04777 | Member! = 0 | AGREE | `04774 be 50 b0 mov si, 0xb050 / 04777 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 047E1 | PRINT "E-Missle Killers" | AGREE | `047DE cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 047E1 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0482C CAT | ON CINT(Cmd!) GOTO L_483C, L_4AA8, L_4C7C, L_4DFE, L_4F01, L_5004 | AGREE | `04829 cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 0482C cd 3f 5e 06 2c 48 98 4a 6c .. CALL RT3F_5E n=6 -> 0483C 04AA8 04C7C 04DFE 04F01 05004 ; ON BX GOTO tbl ; inline count + words (listing=+10` |
| 04A80 | GOTO L_483C | AGREE | `04A7D cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 04A80 e9 b9 fd jmp 0x483c` |
| 04B04 | Ix! = G!(7 * word ptr [0xae70] + 683) | AGREE | `04B01 bf 0e af mov di, 0xaf0e / 04B04 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 04B3F | FOR I! = 340 TO 369 | AGREE | `04B3C cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 04B3F e9 3e 00 jmp 0x4b80` |
| 04DE9 | G!(NumIn% + 6) = 1 | AGREE | `04DE7 8b f0 mov si, ax / 04DE9 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 04DFB | GOTO L_4C7C | AGREE | `04DF8 e8 9d d0 call 0x1e98 / 04DFB e9 7e fe jmp 0x4c7c` |
| 04E88 | GOSUB SUB_2352 | AGREE | `04E85 e9 e9 f8 jmp 0x4771 / 04E88 e8 c7 d4 call 0x2352` |
| 04F4C | IF CINT(Cmd! - 1) < 0 THEN GOTO L_4771 | AGREE | `04F4A 0b c0 or ax, ax / 04F4C 7d 03 jge 0x4f51` |
| 04FD1 | MissileKillPct! = MissileKillerTable!(NumIn% + 6) | AGREE | `04FCE bf 44 19 mov di, 0x1944 / 04FD1 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 05059 | LOCATE 19, 2 | AGREE | `05056 bb 02 00 mov bx, 2 / 05059 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 05088 | LOCATE 20, 2 | AGREE | `05086 8b da mov bx, dx / 05088 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 050C8 | ArmorRoom! = 1000 - Armor! | AGREE | `050C5 bf 88 b6 mov di, 0xb688 / 050C8 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 0512C | NumIn% = CINT(ArmorRoom!) | AGREE | `0512A 8b c3 mov ax, bx / 0512C a3 70 ae mov word ptr [0xae70], ax` |
| 052A9 | LOCATE 6, CINT(INT(35 - ((LEN(ShipClassName$(CINT(ShipIdx!)))) * 0.5))) | AGREE | `052A6 cd 3f 77 CALL RT3F_77 ; CINT FAC->BX / 052A9 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 053D5 | GOSUB SUB_29F8 | AGREE | `053D2 e9 d5 fd jmp 0x51aa / 053D5 e8 20 d6 call 0x29f8` |
| 0544E | PRINT "Recruitment Office" | AGREE | `0544B cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 0544E cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 054CD CAT | ON CINT(Cmd!) GOTO L_557E, L_54D7, L_627F | AGREE | `054CA cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 054CD cd 3f 5e 03 6e 55 c7 54 6f .. CALL RT3F_5E n=3 -> 0557E 054D7 0627F ; ON BX GOTO tbl ; inline count + words (listing=+10h)` |
| 05593 | FOR I! = 1 TO 8 | AGREE | `05590 cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 05593 e9 a8 00 jmp 0x563e` |
| 0595D | GOSUB SUB_2352 | AGREE | `0595A cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 0595D e8 f2 c9 call 0x2352` |
| 059CE | CmdMax! = 3 | AGREE | `059CB be c0 a5 mov si, 0xa5c0 / 059CE cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 05A14 | GOSUB SUB_1E7C | AGREE | `05A11 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 05A14 e8 65 c4 call 0x1e7c` |
| 05B0D | LOCATE CINT(17 - (J! * 5) + I!), CINT(J! * 18 + 2) | AGREE | `05B0A cd 3f 77 CALL RT3F_77 ; CINT FAC->BX / 05B0D cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 05DCB | G!(CINT(FNIdx(Member!, 4))) = FNCrew(Member!, 4) + INT(RND * 5) + 3 | AGREE | `05DC8 8b 7e fa mov di, word ptr [bp - 6] / 05DCB cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 05EA9 | GOSUB SUB_20B6 | AGREE | `05EA6 cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 05EA9 e8 0a c2 call 0x20b6` |
| 0608D | IF Level! <= 3 THEN GOTO L_6097 | AGREE | `0608A cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 0608D 77 03 ja 0x6092` |
| 06094 | Level! = 3 | AGREE | `06092 87 fe xchg si, di / 06094 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 061EF | GOSUB SUB_26A6 | AGREE | `061EC e9 ad f8 jmp 0x5a9c / 061EF e8 b4 c4 call 0x26a6` |
| 06279 | CrewName$(CINT(Member!)) = K$ | AGREE | `06276 bb 12 ad mov bx, 0xad12 / 06279 cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX]` |
| 0627C | GOTO L_543C | AGREE | `06279 cd 3f 61 CALL RT3F_61 ; SASSIGN s$[DX]<-s$[BX] / 0627C e9 bd f1 jmp 0x543c` |
| 062F1 | RecDelta! = FNIdx(Tmp2!, 0) - FNIdx(Member!, 0) | AGREE | `062EE bf 04 b9 mov di, 0xb904 / 062F1 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 06359 | SWAP G!(CINT(J! - RecDelta!)), G!(CINT(J!)) | AGREE | `06357 8b f2 mov si, dx / 06359 cd 3f 11 CALL RT3F_11 ; SWAP [SI],[DI] ; 4-byte numeric` |
| 0639A | SWAP CrewName$(CINT(Member!)), CrewName$(CINT(Tmp2!)) | AGREE | `06398 8b f2 mov si, dx / 0639A cd 3f 14 CALL RT3F_14 ; SWAP s$[SI],s$[DI]` |
| 0641E | GOTO L_543C | AGREE | `0641C 76 e4 jbe 0x6402 / 0641E e9 1b f0 jmp 0x543c` |
| 06591 | IF FNCrew(I!, 31) = 1 THEN GOTO L_65BC | AGREE | `0658E cd 3f a1 CALL RT3F_A1 ; FCMP FAC?[DI] ; flags / 06591 75 03 jne 0x6596` |
| 067A4 | LOCATE 19, 2 | AGREE | `067A1 bb 02 00 mov bx, 2 / 067A4 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 067A7 | PRINT "A-Repair Ships Equipment" | AGREE | `067A4 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 067A7 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 067D7 | PRINT "C-Remove Armor From Ship" | AGREE | `067D4 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 067D7 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 067EC | GOSUB SUB_1E7C | AGREE | `067E9 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single / 067EC e8 8d b6 call 0x1e7c` |
| 068B2 | PRINT "-----------" | AGREE | `068AF e9 0f 00 jmp 0x68c1 / 068B2 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 06917 | LOCATE 24, 2 | AGREE | `06914 bb 02 00 mov bx, 2 / 06917 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 0691A | PRINT "Repair What?  *-Broken  #-4000 to fix"; | AGREE | `06917 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 0691A cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 06971 CAT | ON CINT(G!(CINT(Cmd!)) + 1) GOTO L_692F, L_692F, L_69C2, L_697D | AGREE | `0696E cd 3f 77 CALL RT3F_77 ; CINT FAC->BX / 06971 cd 3f 5e 04 1f 69 1f 69 b2 .. CALL RT3F_5E n=4 -> 0692F 0692F 069C2 0697D ; ON BX GOTO tbl ; inline count + words (listing=+10h)` |
| 069D0 | LOCATE 24, 2 | AGREE | `069CD bb 02 00 mov bx, 2 / 069D0 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 06A54 | G!(CINT(Cmd!)) = 3 | AGREE | `06A51 be c0 a5 mov si, 0xa5c0 / 06A54 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 06AA2 | Tmp2! = 0 | AGREE | `06A9F be 6e a6 mov si, 0xa66e / 06AA2 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 06EEB CAT | ON CINT(Cmd!) GOTO L_6EF7, L_7058, L_71E0, L_72FC | AGREE | `06EE8 cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 06EEB cd 3f 5e 04 e7 6e 48 70 d0 .. CALL RT3F_5E n=4 -> 06EF7 07058 071E0 072FC ; ON BX GOTO tbl ; inline count + words (listing=+10h)` |
| 06F73 | PRINT "HP"; FNCrew(I!, 15); "/"; FNCrew(I!, 16) | AGREE | `06F70 cd 3e 44 CALL RT3E_44 ; LOCATE exec / 06F73 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` (then bb28 'HP' s$, 0x797 FNCrew, sng, bb2e '/', 0x797 FNCrew, sng, one RT3E_79) |
| 070EA | DaysAway! = (RND * RND) * (FNCrew(I!, 16) - FNCrew(I!, 15)) | AGREE | `070E7 bf f6 a9 mov di, 0xa9f6 / 070EA cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 0718B | IF DaysAway! <= RestDays! THEN GOTO L_7193 | AGREE | `07188 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 0718B 77 03 ja 0x7190` |
| 074A1 | PRINT CrewName$(CINT(I!)); " is replaced" | AGREE | `0749E cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 074A1 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 07524 | PRINT "Headquarters" | AGREE | `07521 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 07524 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0759C | IF G!(CINT(I!)) <= 1 THEN GOTO L_75AF | AGREE | `07599 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 0759C 77 03 ja 0x75a1` |
| 075CE | IF Flag! <= 0 THEN GOTO L_775E | AGREE | `075CB cd 3f a7 CALL RT3F_A7 ; FTEST [SI] ; ZF=zero CF=negative / 075CE 77 03 ja 0x75d3` |
| 0762A CAT | OPEN Drive$ + "MISSION" FOR INPUT AS #1 | AGREE | `07627 bb 01 00 mov bx, 1 / 0762A cd 3e 1e CALL RT3E_1E ; OPEN file$[DX] AS #BX, reclen CX` |
| 07643 | INPUT #1, MissionText1$, MissionText2$ | AGREE | `07640 bb 01 00 mov bx, 1 / 07643 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 07665 CAT | INPUT #1, G!(CINT(J!)) | AGREE | `07662 bb 01 00 mov bx, 1 / 07665 cd 3f b6 CALL RT3F_B6 ; INPUT #BX, begin` |
| 077A9 | IF Flag! = 17 THEN GOTO L_234F | AGREE | `077A6 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 077A9 75 03 jne 0x77ae` |
| 077DC | IF Flag! <= 49 THEN GOTO L_77E6 | AGREE | `077D9 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 077DC 77 03 ja 0x77e1` |
| 07817 | INPUT "TRY WHICH MISSION (1-50)?"; Flag! | AGREE | `07814 bb 58 bc mov bx, 0xbc58 / 07817 cd 3f b5 00 CALL RT3F_B5 #00 ; INPUT begin prompt s$[BX] ; inline flags byte` |
| 078BD | IF G!(CINT(Flag! + 110)) <> 1 THEN GOTO L_78D4 | AGREE | `078BA cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 078BD 74 03 je 0x78c2` |
| 07B74 | FOR I! = 2300 TO 2599 | AGREE | `07B71 cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 07B74 e9 23 00 jmp 0x7b9a` |
| 07C42 | LOCATE 17, 2 | AGREE | `07C3F bb 02 00 mov bx, 2 / 07C42 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 07D34 CAT | ON CINT(Cmd!) GOTO L_83DA, L_7D40, L_7DDF, L_7DE5 | AGREE | `07D31 cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 07D34 cd 3f 5e 04 ca 83 30 7d cf .. CALL RT3F_5E n=4 -> 083DA 07D40 07DDF 07DE5 ; ON BX GOTO tbl ; inline count + words (listing=+10h)` |
| 07F6B | IF NOT ((Tmp2! > 99) OR (Tmp2! < 50)) THEN GOTO L_7F75 | AGREE | `07F69 23 c9 and cx, cx / 07F6B 75 03 jne 0x7f70` |
| 08007 | GOSUB SUB_2374 | AGREE | `08004 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC / 08007 e8 6a a3 call 0x2374` |
| 08013 | LOCATE 20, 2 | AGREE | `08010 bb 02 00 mov bx, 2 / 08013 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08190 | PRINT USING "#.#"; Tmp2! | AGREE | `0818D bb 20 be mov bx, 0xbe20 / 08190 cd 3f bd CALL RT3F_BD ; PRINT USING fmt$[BX]; begin` |
| 0831B | Gain! = Gain! * 0.667 | AGREE | `08319 8b fa mov di, dx / 0831B cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 083F6 | GOSUB SUB_646D | AGREE | `083F3 e9 20 f8 jmp 0x7c16 / 083F6 e8 74 e0 call 0x646d` |
| 08421 | LOCATE 17, 2 | AGREE | `0841F 8b da mov bx, dx / 08421 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08424 | PRINT "B-Inspect Squad" | AGREE | `08421 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 08424 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 08452 | PRINT "D-Espionage List" | AGREE | `0844F cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 08452 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 084A0 CAT | ON CINT(Cmd!) GOTO L_8D47, L_84AE, L_91AD, L_98A8, L_9992 | AGREE | `0849D cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 084A0 cd 3f 5e 05 37 8d 9e 84 9d .. CALL RT3F_5E n=5 -> 08D47 084AE 091AD 098A8 09992 ; ON BX GOTO tbl ; inline count + words (listing=+10h)` |
| 084C0 | IF Member! = 0 THEN GOTO L_83FC | AGREE | `084BD cd 3f a7 CALL RT3F_A7 ; FTEST [SI] ; ZF=zero CF=negative / 084C0 75 03 jne 0x84c5` |
| 084D7 | LOCATE 16, 2 | AGREE | `084D4 bb 02 00 mov bx, 2 / 084D7 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08680 | LOCATE CINT(19 - (Tmp2! * 4) + I!), CINT(Tmp2! * 19 + 2) | AGREE | `0867D cd 3f 77 CALL RT3F_77 ; CINT FAC->BX / 08680 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08719 | GOSUB SUB_2374 | AGREE | `08716 e9 b1 fd jmp 0x84ca / 08719 e8 58 9c call 0x2374` |
| 087F9 | IF G!(CINT(Level! + 35)) >= 3 THEN GOTO L_880D | AGREE | `087F6 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 087F9 72 03 jb 0x87fe` |
| 0880D | PRINT "Esper Ability" | AGREE | `0880A e9 0c 00 jmp 0x8819 / 0880D cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 08832 | IF G!(CINT(Level! + 27)) <= 0 THEN GOTO L_886D | AGREE | `0882F cd 3f a7 CALL RT3F_A7 ; FTEST [SI] ; ZF=zero CF=negative / 08832 77 03 ja 0x8837` |
| 08962 | PRINT USING Fmt2$; G!(CINT(Level! + 14)); | AGREE | `0895F bb 70 4f mov bx, 0x4f70 / 08962 cd 3f bd CALL RT3F_BD ; PRINT USING fmt$[BX]; begin` |
| 089CC | LOCATE 23, 2 | AGREE | `089CA 8b da mov bx, dx / 089CC cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08A5A | LOCATE CINT(18 - (Tmp2! * 6) + I!), CINT(Tmp2! * 20 + 2) | AGREE | `08A57 cd 3f 77 CALL RT3F_77 ; CINT FAC->BX / 08A5A cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08B3F | LOCATE 19, 2 | AGREE | `08B3D 8b da mov bx, dx / 08B3F cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08B42 | PRINT "Sighting Hardware.."; G!(CINT(Level! + 43)); "%" | AGREE | `08B3F cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 08B42 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 08B72 | LOCATE 20, 2 | AGREE | `08B70 8b da mov bx, dx / 08B72 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08B75 | PRINT "Clones............."; G!(CINT(Level! + 50)) | AGREE | `08B72 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 08B75 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 08D85 | PRINT "ISS "; ShipName$; " Status Report" | AGREE | `08D82 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 08D85 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 08E22 | LOCATE 20, 2 | AGREE | `08E20 8b da mov bx, dx / 08E22 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08E92 | LOCATE 22, 2 | AGREE | `08E8F bb 02 00 mov bx, 2 / 08E92 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 08F64 | PRINT "%" | AGREE | `08F61 cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 08F64 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 08FCA | GOSUB SUB_A882 | AGREE | `08FC7 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 08FCA e8 b5 18 call 0xa882` |
| 090D9 | IF Cmd! < -40 THEN GOTO L_83FC | AGREE | `090D6 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 090D9 73 03 jae 0x90de` |
| 09161 | LOCATE 21, 2 | AGREE | `0915E bb 02 00 mov bx, 2 / 09161 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 09164 | PRINT "Defense Hardware......"; CHR$(32 - (DriveFlag! > 1) * 10); DefHardwarePct! * SGN(DefHardware!); "%" | AGREE | `09161 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 09164 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0924E | GOSUB SUB_2374 | AGREE | `0924B e8 8f 8e call 0x20dd / 0924E e8 23 91 call 0x2374` |
| 09257 | J! = -1 | AGREE | `09254 be 44 a8 mov si, 0xa844 / 09257 cd 3f 7b CALL RT3F_7B ; FMOV [DI]<-[SI] ; copy 4-byte single` |
| 0927F | IF J! <= -1 THEN GOTO L_9293 | AGREE | `0927C cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 0927F 77 03 ja 0x9284` |
| 093FA | Tons! = Tons! - (((G!(CINT(I! + 9)) = Member!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 5)))) | AGREE | `093F8 8b fe mov di, si / 093FA cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 095C7 | Tmp2! = 2 - ((G!(CINT(Level! + 14))) / (G!(CINT(Level! + 13)))) | AGREE | `095C4 bf 7a ab mov di, 0xab7a / 095C7 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 09888 | IF Tmp2! <= 6 THEN GOTO L_9892 | AGREE | `09885 cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 09888 77 03 ja 0x988d` |
| 098A4 | CurMove! = INT(Tmp2! + 0.5) | AGREE | `098A1 bf 98 19 mov di, 0x1998 / 098A4 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 0994A | GOSUB SUB_2374 | AGREE | `09947 e8 93 87 call 0x20dd / 0994A e8 27 8a call 0x2374` |
| 09989 | LOCATE 24, 12 | AGREE | `09986 bb 0c 00 mov bx, 0xc / 09989 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 09A59 | LOCATE 24, 12 | AGREE | `09A56 bb 0c 00 mov bx, 0xc / 09A59 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 09A90 | IF J! <= -1 THEN GOTO L_9AA4 | AGREE | `09A8D cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 09A90 77 03 ja 0x9a95` |
| 09AA1 | GOSUB SUB_20DD | AGREE | `09A9E cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 09AA1 e8 39 86 call 0x20dd` |
| 09ACF | LOCATE 17, 14 | AGREE | `09ACC bb 0e 00 mov bx, 0xe / 09ACF cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 09AD2 | PRINT "Saving game." | AGREE | `09ACF cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 09AD2 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 09B55 | LOCATE 21, 2 | AGREE | `09B52 bb 02 00 mov bx, 2 / 09B55 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 09CB2 | GOSUB SUB_20B6 | AGREE | `09CAF cd 3e 2b CALL RT3E_2B ; BEEP / 09CB2 e8 01 84 call 0x20b6` |
| 09CF3 CAT | BSAVE Drive$ + "CHARINFO.BAS", &H1850, 10404 | AGREE | `09CF0 ba 1a 00 mov dx, 0x1a / 09CF3 cd 3e 1b CALL RT3E_1B ; BSAVE file$[BX], off DX, len CX` |
| 09D0C CAT | OPEN Drive$ + "CHARNAME" FOR OUTPUT AS #1 | AGREE | `09D0A 33 c9 xor cx, cx / 09D0C cd 3e 1e CALL RT3E_1E ; OPEN file$[DX] AS #BX, reclen CX` |
| 09D99 | END | AGREE | `09D96 e9 b6 85 jmp 0x234f / 09D99 cd 3e 01 CALL RT3E_01 ; END` |
| 09E23 | GOSUB SUB_20B6 | AGREE | `09E20 cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 09E23 e8 90 82 call 0x20b6` |
| 09E26 | GOSUB SUB_20B6 | AGREE | `09E23 e8 90 82 call 0x20b6 / 09E26 e8 8d 82 call 0x20b6` |
| 09E29 | GOTO L_234F | AGREE | `09E26 e8 8d 82 call 0x20b6 / 09E29 e9 23 85 jmp 0x234f` |
| 09F3F CAT | CHAIN Drive$ + "SPACE.STR" | AGREE | `09F3C cd 3f 55 CALL RT3F_55 ; SCAT s$[AX]+s$[BX]->BX / 09F3F cd 3e 0e CALL RT3E_0E ; CHAIN file$[BX]` |
| 09F42 | END | AGREE | `09F3F cd 3e 0e CALL RT3E_0E ; CHAIN file$[BX] / 09F42 cd 3e 01 CALL RT3E_01 ; END` |
| 09FE7 | PLAY "X" + VARPTR$(Tune$) | AGREE | `09FE4 cd 3f 55 CALL RT3F_55 ; SCAT s$[AX]+s$[BX]->BX / 09FE7 cd 3e 51 CALL RT3E_51 ; PLAY s$[BX]` |
| 0A04A | FOR I! = 340 TO 369 | AGREE | `0A047 cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 0A04A e9 46 00 jmp 0xa093` |
| 0A132 | GOTO L_A152 | AGREE | `0A12F cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 0A132 e9 1d 00 jmp 0xa152` |
| 0A1C4 | NEXT I! | AGREE | `0A1C1 cd 3f 7f CALL RT3F_7F ; FADD [SI]+[DI]->FAC / 0A1C4 bf c4 a5 mov di, 0xa5c4` |
| 0A25F CAT | ON CINT(ListKind!) GOSUB L_A332, L_A34A, L_A362, L_A37A, L_A392, L_A3AA, L_A3C2, L_A3DA, L_A3F2 | AGREE | `0A25C cd 3f 75 CALL RT3F_75 ; CINT [SI]->BX / 0A25F cd 3f 5d 09 22 a3 3a a3 52 .. CALL RT3F_5D n=9 -> 0A332 0A34A 0A362 0A37A 0A392 0A3AA 0A3C2 0A3DA 0A3F2 ; ON BX GOSUB tbl ; inline count +` |
| 0A297 | LOCATE 24, 2 | AGREE | `0A294 bb 02 00 mov bx, 2 / 0A297 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 0A2DB | GOSUB SUB_22C4 | AGREE | `0A2D8 cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC / 0A2DB e8 e6 7f call 0x122c4` |
| 0A322 | GOTO L_A1E1 | AGREE | `0A31F e9 bf fe jmp 0xa1e1 / 0A322 e9 bc fe jmp 0xa1e1` |
| 0A362 | PRINT DefHwName$(CINT(I!)); | AGREE | `0A361 c3 ret / 0A362 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0A392 | PRINT WeaponName$(CINT(I!)); | AGREE | `0A391 c3 ret / 0A392 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0A440 | NumIn% = CINT(VAL(K$)) | AGREE | `0A43E 8b c3 mov ax, bx / 0A440 a3 70 ae mov word ptr [0xae70], ax` |
| 0A444 | GOSUB SUB_2352 | AGREE | `0A443 c3 ret / 0A444 e8 0b 7f call 0x12352` |
| 0A453 | PRINT "#   Shield"; | AGREE | `0A450 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 0A453 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0A468 | PRINT "Value" | AGREE | `0A465 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 0A468 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0A494 | LOCATE CINT(I! + 17), 2 | AGREE | `0A491 bb 02 00 mov bx, 2 / 0A494 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 0A4DD | IF G!(CINT(Ix!)) < 1 THEN GOTO L_A579 | AGREE | `0A4DA cd 3f 9f CALL RT3F_9F ; FCMP [SI]?[DI] ; flags (ja/jb/je) / 0A4DD 73 03 jae 0xa4e2` |
| 0A51E | PRINT LEFT$(ShieldName$(CINT(G!(CINT(Ix!)) + -1)), 18); | AGREE | `0A51B cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 0A51E cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0A5A5 | PRINT " Reloads   "; CrewName$(CINT(Member!)); "'s weapons" | AGREE | `0A5A2 cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX) / 0A5A5 cd 3f bc CALL RT3F_BC ; PRINT begin (screen)` |
| 0A5CE | FOR I! = 501 TO 554 | AGREE | `0A5CB cd 3f 6f CALL RT3F_6F ; FLOAD FAC<-[SI] / 0A5CE e9 23 00 jmp 0xa5f4` |
| 0A64B | Tmp2! = G!(CINT(I!)) + 500 | AGREE | `0A648 bf 7a ab mov di, 0xab7a / 0A64B cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 0A70C | Ix! = Ix! + 12 | AGREE | `0A70A 8b fa mov di, dx / 0A70C cd 3f 7d CALL RT3F_7D ; FSTORE [DI]<-FAC` |
| 0A71C | GOTO L_A6AE | AGREE | `0A719 e9 0e 01 jmp 0xa82a / 0A71C eb 90 jmp 0xa6ae` |
| 0A7AB | GOTO L_A7BA | AGREE | `0A7A8 cd 3e 79 CALL RT3E_79 ; PRINT end ; flush/reset device / 0A7AB e9 0c 00 jmp 0xa7ba` |
| 0A8EF | LOCATE 22, 2 | AGREE | `0A8ED 8b da mov bx, dx / 0A8EF cd 3e 44 CALL RT3E_44 ; LOCATE exec (last arg BX)` |
| 0A93E CAT | BLOAD "fire", &H65AE | AGREE | `0A93B ba 1a 00 mov dx, 0x1a / 0A93E cd 3e 1a CALL RT3E_1A ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 0AA5C | NEXT DotY! STEP YStep! (draw of 0AA68, absorbed by 71f36ac) | AGREE | `0AA59 cd 3f 7f FADD [SI]+[DI]->FAC / 0AA5C cd 3f 7d FSTORE [DI]<-FAC` (step-sign `0AA68 72 03 jb 0xaa6d`, back-edge `0AA75 73 8d jae 0xaa04`) |
| 0AAFF | PUT (257, 32), Medal4, PSET | AGREE | `0AAFC ba 03 00 mov dx, 3 / 0AAFF cd 3e 58 CALL RT3E_58 ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 0AC85 | RETURN | AGREE | `0AC83 76 c7 jbe 0xac4c / 0AC85 c3 ret` |
| 0ACA3 | RETURN   'with FAC = ABS(T0! - TIMER) | AGREE | `0ACA1 72 ec jb 0xac8f / 0ACA3 c3 ret` |
