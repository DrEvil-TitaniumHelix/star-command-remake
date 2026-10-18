# SPBATTLE_GLMVERIFY - independent verification of SPBATTLE.bas.md (lane glm-verify-spbattle, GLM 5.3, 2026-10-15)

Inputs verified against: `decode/listings/SPBATTLE.lst` (13:47 regeneration), `SPBATTLE.bas.md`/`SPBATTLE_SCREENS.md`/`SPBATTLE_names.json` (mod-spbattle; the file on disk is the **regenerated** version, commit a11f8b3 with the corrected PUT verb map - so no verb-label exclusions were needed: every PUT renders its true verb), `decode/data/tools/_SPBATTLE.json` (data-lane literal table), files on disk (spacesh/SPBTSH.BAS/ENCLIST/ENCTABLE/ENSHP-n.BAS/NAME/CHARNAME all exist), `decode/brun30/RT_LEDGER.md`.

Method: SPBATTLE.bas.md contains 1,673 offset-tagged lines; 24 are the tail after the last reachable instruction (07412 `ret` - verified; 0741B renders as the stray `0 = Pad!` and 07421+ are `' asm` data lines, exactly as the header discloses), leaving **1,649 code statements**. **10% = 165 statements drawn with `random.seed(20261017)`, `random.sample`** (seed listed as required), plus every CHAIN/BLOAD/BSAVE/ON GOTO/ON GOSUB/INPUT/OPEN statement not already in the draw (29 more) = **194 statements re-derived from the listing bytes** - SCAT filename chains, temp-slot conventions (tempbase 6FAA), FCMP/jcc polarity, boolean idioms, ON-table inline words with the +0x10 rule, bp-relative DEF FN temps in the FNAngle/FNCanHit/FNSize-family bodies - with literals checked against the data-lane table (6F92 'spacesh', 886E 'SPBTSH.BAS', 8B18 'ENCLIST', 8B40 'ENCTABLE', A3B4 'SPACE.EXE', A3C2 'PLBATTLE.STR', 9ED8 '-- --', 9EF6 '## ##', A1C2 'They respectfully decline', A32C 'Battle Over', A37A 'Surrendered', A38A 'Destroyed', A4F0 'B-Rotate CW', A532 'G-Time Delay', A5FE 'Will you board? (Y/N)', A724 'Failed', AAAA 'RED', 9FD0 'Pilot or ship not ready', 8C12 57.296, AA26 0.07, ...).

Verdicts: **194 AGREE, 0 DISAGREE, 0 UNSURE.** No known-defect verb labels either - see below.

## Disagreements

**None.** Additional checks worth recording:

- **Exhaustive PUT verb audit (beyond the sample): all 65 PUT statements in the body match the listing verb bytes exactly** - 21 `, OR` = `xor dx,dx` (verb 0; enemy-ship sprites EnShipHead0..7, hit/explosion flashes Hit2/Hit3, SPBTSH tiles - composited over the starfield, semantically right), 25 `, PSET` = `mov dx,3` (player ship, digits, headers, screen restore), 3 `, PRESET` = `mov dx,2`, 16 `, XOR` = `mov dx,4` (cursor, blips, erase patterns). The a11f8b3 regeneration with the corrected qb2bas map is fully verified in this module, including the verb-0 and verb-2 cases the sample alone would not have covered.
- The ten DEF FN bodies (FNAngle/FNInView/FNNorm/FNCanHit/FNSize/FNScale/FNShotX/FNShotY and the 0CCD/0DB9 helpers) re-derive exactly, including the ATN*57.296 radian-to-degree conversion, the 1e-07 divide guard, `AD #03` (x MOD 8 via INT(x*0.125)*8), and the T-slot arithmetic `#85/#88/#89/#92` in FNCanHit and the firing loops.
- The main dispatch tables all decode to exactly the listed labels: movement `ON Cmd! GOSUB` n=19 (033A0, includes the mid-table SUB_4186 entry), comm-state n=3 (020A5), offer-grade `ON 1-(...)-(...)` n=4 (02569), objectives n=4 (025BD), enemy-heading n=9 GOSUB (04248), player-heading n=8 GOTO (0437E), I!+1 n=5 GOSUB (045AD), targeting n=23 GOSUB (04EDD), IsMissile n=2 GOSUB (05E85/065B4), INT(SQR(RND)*10+1) n=9 GOTO (066B4).
- CHAIN graph verified: 02F30 `Drive$+"SPACE.EXE"` and 02F48 `Drive$+"PLBATTLE.STR"` with their guard conditions; BLOAD chains `Drive$+"SPBTSH.BAS",&H73A0` (006D5), `Drive$+"ENSHP"+STR$(-EnSprite!)+".BAS",&H6AA2` (00CAB), plus the DebugLoad!-guarded dead block (spacesh/CHARINFO/SHIP-n/LOGO/NAME/CHARNAME, offsets 000DE-002C3).
- **ENCLIST/ENCTABLE INPUT statements**: the 4-item (EnemyName$ + 3 singles), 13-item and 12-item all-type-02 (single) records (00707/0079F/00804) re-derive exactly; `EncMod!/100` after the read (0088C) confirmed.
- **Tail honesty**: 07412 is the last reachable instruction (`ret`); 07413-0741A is never-executed padding, 0741B the disclosed stray `0 = Pad!` render, 07421-0744E the `' asm` data lines - all disclosed in the header, none hidden.

Minor note (no verdict change): 044DA renders `LINE (17, 43)-(141, 43), ` with a dangling comma - the compiled call has every optional operand default (color bx=-1, style cx=-1, dx=-1 plain line); coordinates (0x11,0x2b)-(0x8d,0x2b) are correct, only the trailing comma is a cosmetic rendering artifact of an all-default LINE.

## names/_SCREENS/Unknowns checks

- **SPBATTLE_names.json**: 524 entries; 441 variable entries all carry a non-empty `_why` (checked programmatically); the other 83 are SUB*/FN* role entries documented in the Subroutines table (same design as SPACE/INSIDE). ~45 `_why` claims re-verified during derivation (DebugLoad! 0x6F8E never-assigned guard at 000CD, CmdMin!/CmdMax! 0x9F60/0x9F64, the per-enemy array bases Hull! 0x8894 / EnStatus! 0x8A08 / MoveScore! 0x8AD0 / Shield! 0x89F0 / WeaponOK-family indexing, G!() COMMON scalar arithmetic for ChainArg!/ShipHeading!/Fuel!).
- **SPBATTLE_SCREENS.md**: every display-text literal quoted in the doc exists in the string table (the comms/menu/battle messages listed above plus 'They respectfully decline', 'Battle Over', 'Surrendered', 'Destroyed', 'RED', 'Pilot or ship not ready', 'Will you board? (Y/N)', the 'A-'+CHR$ retarget composite at 04E5F); the remaining backtick items are statement/array/code references, not literals.
- **Unknowns honesty**: the section states "No runtime call is left unrendered" and it holds - **zero `RT3x_yy` tokens anywhere in the file** (not even in header prose); the open interpretation points (ENCTABLE column readings, MoveDX!/MoveDY! assumed-zero elements, crew fields 1/56) match what the sampled statements show.

## Summary (counts)

- 194 statements re-derived (165 random at seed 20261017 + 29 CHAIN/BLOAD/ON/GOSUB/INPUT/OPEN sites): 194 AGREE / 0 DISAGREE / 0 UNSURE; 0 verb-label defects.
- Exhaustive extra check: all 65 PUT statements match their listing verbs exactly (21 OR/25 PSET/3 PRESET/16 XOR) - the corrected verb map is fully in force in this module.
- names: 441/441 variables carry a supported `_why`; screens: all quoted display texts proven; Unknowns honest (0 unrendered, 0 RT tokens).

## Verdict table

| off | pseudocode statement | verdict | listing bytes at (and before) the statement |
|---|---|---|---|
| 000A2 | READ HeadX%(CINT(J!)) | AGREE | `81 c3 62 6f          add bx, 0x6f62 / cd 3f 0f             CALL RT3F_0F   ; READ int ->[BX]` |
| 000CD | IF DebugLoad! = 0 THEN GOTO L_0115 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 75 03                jne 0xd2` |
| 000DE CAT | BLOAD "spacesh", &H4890 | AGREE | `ba 1a 00             mov dx, 0x1a / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 000ED CAT | BLOAD "CHARINFO", &H1850 | AGREE | `ba 1a 00             mov dx, 0x1a / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 00112 | BLOAD "SHIP" + STR$(-1 - ShipClass!), &H65FC | AGREE | `ba aa 6f             mov dx, 0x6faa / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 00148 | FOR I! = 3 TO 8 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 30 00             jmp 0x17b` |
| 001A3 | ClassName$(1) = "Pilot" | AGREE | `ba 24 71             mov dx, 0x7124 / cd 3f 61             CALL RT3F_61   ; SASSIGN s$[DX]<-s$[BX]` |
| 001C6 | BLOAD "LOGO", &H40F4 | AGREE | `ba 1a 00             mov dx, 0x1a / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 001D6 CAT | OPEN "NAME" FOR INPUT AS #1 | AGREE | `ba 54 71             mov dx, 0x7154 / cd 3e 1e             CALL RT3E_1E   ; OPEN file$[DX] AS #BX, reclen CX` |
| 001E5 CAT | INPUT #1, K$ | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 00219 CAT | INPUT #1, MissileKillerName$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 0025B CAT | INPUT #1, GunName$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 00280 | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf 0e 71             mov di, 0x710e` |
| 002A3 CAT | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | `ba 68 71             mov dx, 0x7168 / cd 3e 1e             CALL RT3E_1E   ; OPEN file$[DX] AS #BX, reclen CX` |
| 002A9 | INPUT #1, ShipName$ | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 002C3 CAT | INPUT #1, CrewName$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 003DF | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf 0e 71             mov di, 0x710e` |
| 003F5 | FOR Ix! = 690 TO 725 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 d5 00             jmp 0x4cd` |
| 005AD | MissileKiller! = 3 | AGREE | `be 0a 71             mov si, 0x710a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 006A4 | G!(8) = 2 | AGREE | `be 54 6f             mov si, 0x6f54 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 006D5 CAT | BLOAD Drive$ + "SPBTSH.BAS", &H73A0 | AGREE | `ba 1a 00             mov dx, 0x1a / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 006EF CAT | OPEN Drive$ + "ENCLIST" FOR INPUT AS #1 | AGREE | `bb 01 00             mov bx, 1 / cd 3e 1e             CALL RT3E_1E   ; OPEN file$[DX] AS #BX, reclen CX` |
| 00707 CAT | INPUT #1, EnemyName$, NumEnemy!, EncMod!, EncRow! | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 00787 CAT | OPEN Drive$ + "ENCTABLE" FOR INPUT AS #1 | AGREE | `bb 01 00             mov bx, 1 / cd 3e 1e             CALL RT3E_1E   ; OPEN file$[DX] AS #BX, reclen CX` |
| 0079F CAT | INPUT #1, TblHull!, TblGun!, TblDef!, TblFuel!, TblArmor!, TblMissileDmg!, TblShield!, TblWeapon!(0), TblWeapo | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 00804 CAT | INPUT #1, EnMoves!, EnTech!, EnAttitude!, EnTactic!, EnSprite!, EnBoardArg!, EnTonnage!, EnShipType!, EnStreng | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 0088C | EncMod! = EncMod! / 100 | AGREE | `8b fe                mov di, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 00B87 | NEXT K! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf dc 8b             mov di, 0x8bdc` |
| 00C55 | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf 0e 71             mov di, 0x710e` |
| 00CAB CAT | BLOAD Drive$ + "ENSHP" + STR$(-EnSprite!) + ".BAS", &H6AA2 | AGREE | `ba b2 6f             mov dx, 0x6fb2 / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 00CCD | RETURN   'with FAC = INT(Arg0CB1! - (INT(Arg0CB1! * 0.125) * 8)) | AGREE | `cd 3d 03             CALL RT3D_03   ; INT [BX]->FAC / c3                   ret` |
| 00DB9 | RETURN   'with FAC = INT(90 - ((EnX!(CINT(ArgB0D2A!)) < EnX!(CINT(ArgA0D2A!))) * 180) - ((ATN((EnY!(CINT(ArgA0 | AGREE | `cd 3d 03             CALL RT3D_03   ; INT [BX]->FAC / c3                   ret` |
| 00E62 | READ ArcAngle!(CINT(I!)) | AGREE | `81 c3 42 8c          add bx, 0x8c42 / cd 3f 0d             CALL RT3F_0D   ; READ sng ->[BX]` |
| 00F6F | RETURN   'with FAC = (((FNDist(5, ArgB0EAC!) < 10) * (ABS(FNNorm(ArcAngle!(CINT(ArgA0EAC!)) - FNAngle(5, ArgB0 | AGREE | `cd 3f 95 89          CALL RT3F_95 #89   ; FMUL T[#]*FAC->FAC / c3                   ret` |
| 00FAE | FOR I! = 0 TO 7 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 29 00             jmp 0xfda` |
| 00FEA | GOTO L_1030 | AGREE | `76 c8                jbe 0xfb2 / e9 43 00             jmp 0x1030` |
| 011E8 | FOR K! = 0 TO 2 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 2e 00             jmp 0x1219` |
| 0137C | Hostile! = 0 | AGREE | `be 82 6f             mov si, 0x6f82 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 01407 | RETURN | AGREE | `76 e7                jbe 0x13ee / c3                   ret` |
| 014F3 | PRINT "-- --" | AGREE | `e9 0d 00             jmp 0x1500 / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 01593 | PRINT USING "## ##"; Tmp!; AmmoCount! | AGREE | `bb f6 9e             mov bx, 0x9ef6 / cd 3f bd             CALL RT3F_BD   ; PRINT USING fmt$[BX]; begin` |
| 015F6 | Member! = 0 | AGREE | `be 08 9f             mov si, 0x9f08 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0161B | IF NOT ((I! = 112) OR (I! = 80)) THEN GOTO L_162C | AGREE | `23 d2                and dx, dx / 75 03                jne 0x1620` |
| 01656 | Member! = 2 | AGREE | `be 54 6f             mov si, 0x6f54 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 01699 | FOR DelayN! = 1 TO 5 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 0c 00             jmp 0x16a8` |
| 01742 | AllDead! = 1 | AGREE | `be 4a 6f             mov si, 0x6f4a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 01788 | PRINT | AGREE | `e9 2c 00             jmp 0x17b4 / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 01830 | RETURN | AGREE | `e9 1e ff             jmp 0x174e / c3                   ret` |
| 01868 | IF K$ = "" THEN GOTO L_1857 | AGREE | `cd 3f 62             CALL RT3F_62   ; SCMP s$[AX]?s$[BX]   ; flags / 74 ed                je 0x1857` |
| 01921 | IF Ix! <= 7 THEN GOTO L_1931 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 77 03                ja 0x1926` |
| 0195B | J! = 7 | AGREE | `be 8a 6f             mov si, 0x6f8a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0199A | J! = (Tmp2! > 2) + (Tmp2! > 6) + Tmp2! + 1 | AGREE | `bf 86 6f             mov di, 0x6f86 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 01A12 | GOSUB SUB_1AC7 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e8 b2 00             call 0x1ac7` |
| 01AAA | ArcStart! = ArcStart! + 6.283185 | AGREE | `8b fe                mov di, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 01AAD | GOTO L_1A97 | AGREE | `cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC / eb e8                jmp 0x1a97` |
| 01B6E CAT | ON CINT(J!) GOSUB L_1B81, L_1B99, L_1BB1, L_1BC9, L_1BE1, L_1BF9, L_1C11 | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5d 07 71 1b 89 1b a1 .. CALL RT3F_5D n=7 -> 01B81 01B99 01BB1 01BC9 01BE1 01BF9 01C11   ; ` |
| 01BC8 | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 01C0D | PUT (I!, K!), Digit6, PSET | AGREE | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 01C10 | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 01C3A | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 01C41 | K$ = INKEY$ | AGREE | `ba 5c 71             mov dx, 0x715c / cd 3f 61             CALL RT3F_61   ; SASSIGN s$[DX]<-s$[BX]` |
| 01CE1 | IF (Cmd! > 37) OR (Cmd! < 12) THEN GOTO L_1C3B | AGREE | `23 d2                and dx, dx / 74 03                je 0x1ce6` |
| 01D6D | LOCATE 22, 3 | AGREE | `bb 03 00             mov bx, 3 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 01E93 | I! = ASC(Ch$) | AGREE | `bf 0e 71             mov di, 0x710e / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 01F80 | FOR I! = 2300 TO 2597 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 42 00             jmp 0x1fc5` |
| 0207C | IF NOT ((K$ = "YES") OR (K$ = "yes")) THEN GOTO L_2087 | AGREE | `23 c9                and cx, cx / 75 03                jne 0x2081` |
| 020A5 CAT | ON CINT(CommState! + 1) GOTO L_2922, L_21A6, L_20AF | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5e 03 12 29 96 21 9f .. CALL RT3F_5E n=3 -> 02922 021A6 020AF   ; ON BX GOTO tbl       ; in` |
| 021B2 | LOCATE 20, 8 | AGREE | `bb 08 00             mov bx, 8 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 021CF | PRINT "A-Plead" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 02278 | CmdMax! = 6 | AGREE | `be d8 71             mov si, 0x71d8 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0232E | PRINT "CHOOSE AN OBJECTIVE: (A-D)"; | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 02569 CAT | ON 1 - (Offer! < -20) - (Offer! < 0) - (Offer! < 20) GOTO L_2575, L_2584, L_2593, L_25A2 | AGREE | `8b da                mov bx, dx / cd 3f 5e 04 65 25 74 25 83 .. CALL RT3F_5E n=4 -> 02575 02584 02593 025A2   ; ON BX GOTO tbl       ; inline count + ` |
| 02575 | PRINT "They respectfully decline" | AGREE | `cd 3f 5e 04 65 25 74 25 83 .. CALL RT3F_5E n=4 -> 02575 02584 02593 025A2   ; ON BX GOTO tbl       ; inline count + words (listing=+10h) / cd 3f bc   ` |
| 025BD CAT | ON CINT(Objective! + 1) GOTO L_25C9, L_27C7, L_286E, L_28F5 | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5e 04 b9 25 b7 27 5e .. CALL RT3F_5E n=4 -> 025C9 027C7 0286E 028F5   ; ON BX GOTO tbl     ` |
| 0285C | GOSUB SUB_1693 | AGREE | `e8 37 ee             call 0x1693 / e8 34 ee             call 0x1693` |
| 028EC | GOSUB SUB_1424 | AGREE | `cd 3e 79             CALL RT3E_79   ; PRINT end            ; flush/reset device / e8 35 eb             call 0x1424` |
| 0290D | GOSUB SUB_1693 | AGREE | `e8 86 ed             call 0x1693 / e8 83 ed             call 0x1693` |
| 0291C | LOCATE 22, 3 | AGREE | `bb 03 00             mov bx, 3 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 029D8 | EnemyNear! = 1 | AGREE | `be 4a 6f             mov si, 0x6f4a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 02A4D | GOTO L_2B20 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e9 d0 00             jmp 0x2b20` |
| 02AA1 | EnStatus!(CINT(I!)) = 3 | AGREE | `be 0a 71             mov si, 0x710a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 02B1D | EnStatus!(CINT(I!)) = 3 | AGREE | `be 0a 71             mov si, 0x710a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 02B7C | ShipsN3! = NumEnemy! - 1 | AGREE | `bf 28 a3             mov di, 0xa328 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 02BB6 | Tmp! = Tmp! + 1 | AGREE | `8b fe                mov di, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 02BFD | IF NOT ((RND * 100 < Tmp2!) AND (EnAttitude! > 1)) THEN GOTO L_2C0A | AGREE | `23 c9                and cx, cx / 75 03                jne 0x2c02` |
| 02C1F | PRINT "Battle Over" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 02C66 | Flag! = 0 | AGREE | `be 82 6f             mov si, 0x6f82 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 02D31 | IF Hull!(CINT(I!)) <= 0 THEN GOTO L_2D45 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 77 03                ja 0x2d36` |
| 02D45 | PRINT "Destroyed" | AGREE | `e9 0c 00             jmp 0x2d51 / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 02DA6 | KillStartAll! = INT(KillStartAll! + -(KillStartAll! < 49.5)) | AGREE | `8b fe                mov di, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 02E53 | Tonnage! = Tonnage! + ABS(EnTonnage!) | AGREE | `8b fe                mov di, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 02F03 | IF NOT ((MissionCodeB! - 50 = ChainArg!) AND (Flag! = 1)) THEN GOTO L_2F10 | AGREE | `23 c9                and cx, cx / 75 03                jne 0x2f08` |
| 02F30 CAT | CHAIN Drive$ + "SPACE.EXE" | AGREE | `cd 3f 55             CALL RT3F_55   ; SCAT s$[AX]+s$[BX]->BX / cd 3e 0e             CALL RT3E_0E   ; CHAIN file$[BX]` |
| 02F48 CAT | CHAIN Drive$ + "PLBATTLE.STR" | AGREE | `cd 3f 55             CALL RT3F_55   ; SCAT s$[AX]+s$[BX]->BX / cd 3e 0e             CALL RT3E_0E   ; CHAIN file$[BX]` |
| 03002 | PRINT "last second!" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 0301B | GOSUB SUB_16B9 | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / e8 9b e6             call 0x16b9` |
| 030AA | Turned! = 0 | AGREE | `bf b6 a4             mov di, 0xa4b6 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0317A | IF Missiles!(CINT(I!)) >= 1 THEN GOTO L_31E9 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 72 03                jb 0x317f` |
| 03185 | FOR Slot! = 0 TO 5 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 51 00             jmp 0x31d9` |
| 031CE | WeaponOK!(CINT(I!) * 6 + CINT(Slot!)) = (WeaponOK!(CINT(I!) * 6 + CINT(Slot!))) * (-(WeaponDmg!(CINT(I!) * 6 + | AGREE | `8b fe                mov di, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 032C8 | PRINT "B-Rotate CW" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 03356 | PRINT "G-Time Delay" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 03395 | IF Cmd! = 40 THEN GOTO L_3231 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 75 03                jne 0x339a` |
| 033A0 CAT | ON CINT(Cmd!) GOSUB L_337A, L_46D7, L_337A, L_337A, L_46E3, L_337A, L_46FB, L_337A, L_337A, L_46EF, L_337A, L_ | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5d 13 6a 33 c7 46 6a .. CALL RT3F_5D n=19 -> 0337A 046D7 0337A 0337A 046E3 0337A 046FB 033` |
| 03533 | Facing!(CINT(K!)) = INT((RelAngle! + 45) / 90) | AGREE | `8b fa                mov di, dx / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 03590 | MoveScore!(CINT(HeadTry!)) = (Shield!(CINT(Facing!(CINT(K!))), CINT(K!)) > 0) * -40 | AGREE | `cd 3f 57             CALL RT3F_57   ; CSNG BX->FAC / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 03642 | Tmp2! = -(WeaponOK!(CINT(ArcB!(CINT(K!))) + CINT(K!) * 6) > 0) + -(WeaponOK!(CINT(ArcA!(CINT(K!))) + CINT(K!)  | AGREE | `bf f2 9e             mov di, 0x9ef2 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 036CB | IF MoveScore!(CINT(HeadTry!)) <= BestScore! THEN GOTO L_36D3 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 77 03                ja 0x36d0` |
| 036F7 | GOTO L_3705 | AGREE | `e9 e7 fd             jmp 0x34de / e9 0b 00             jmp 0x3705` |
| 038C8 | IF (Hull!(CINT(K!)) < 1) OR (CanTurn!(CINT(K!)) < 1) THEN GOTO L_3943 | AGREE | `23 c9                and cx, cx / 74 03                je 0x38cd` |
| 038D3 | Turned! = 1 | AGREE | `be 4a 6f             mov si, 0x6f4a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 039EE | WantRange! = (EnTactic! = 2) * 3 + 6 - (EnStatus!(CINT(K!)) = 3) * 1000 | AGREE | `8b de                mov bx, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 03C2B | BestScore! = MoveScore!(CINT(MoveTry!)) | AGREE | `e9 0b 00             jmp 0x3c36 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 03D17 | FOR I! = 0 TO 5 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 3e 00             jmp 0x3d58` |
| 03D58 | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf 0e 71             mov di, 0x710e` |
| 03EA9 | PRINT "Will you board? (Y/N)"; | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 03EE6 | EnStatus!(CINT(I!)) = 5 | AGREE | `be d4 71             mov si, 0x71d4 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 03FCC | G!(CINT(FNIdx(Tmp2!, 37))) = 3 | AGREE | `be 0a 71             mov si, 0x710a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0403F | FOR K! = FNIdx(Tmp2!, 0) TO RecEnd! | AGREE | `e8 f4 c2             call 0x333 / e9 3a 00             jmp 0x407c` |
| 04116 | FOR I! = 2302 TO 2599 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 0d 00             jmp 0x4126` |
| 041A1 | PUT (32, 0), HdrVisual, PSET | AGREE | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 04210 | IF NOT ((EnY!(CINT(I!)) < 17) AND ((EnY!(CINT(I!)) > 3) AND ((EnX!(CINT(I!)) < 28) AND (EnX!(CINT(I!)) > 13))) | AGREE | `23 c9                and cx, cx / 75 03                jne 0x4215` |
| 04224 | PutX! = (EnX!(CINT(I!))) * 8 - 96 | AGREE | `bf 70 9f             mov di, 0x9f70 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 04248 CAT | ON CINT(EnHeading!(CINT(I!)) + 1) GOSUB L_4294, L_42AB, L_42C2, L_42D9, L_42F0, L_4307, L_431E, L_4335, L_4452 | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5d 09 84 42 9b 42 b2 .. CALL RT3F_5D n=9 -> 04294 042AB 042C2 042D9 042F0 04307 0431E 04335` |
| 042EC | PUT (PutX!, PutY!), EnShipHead3, OR | AGREE | `33 d2                xor dx, dx / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 04331 | PUT (PutX!, PutY!), EnShipHead6, OR | AGREE | `33 d2                xor dx, dx / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 0437E CAT | ON CINT(ShipHeading! + 1) GOTO L_4392, L_43AA, L_43C2, L_43DA, L_43F2, L_440A, L_4422, L_443A | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5e 08 82 43 9a 43 b2 .. CALL RT3F_5E n=8 -> 04392 043AA 043C2 043DA 043F2 0440A 04422 0443A` |
| 04439 | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 044DA | LINE (17, 43)-(141, 43),  | AGREE | `8b ca                mov cx, dx / cd 3e 86             CALL RT3E_86   ; LINE exec color BX, DX -1/0=B/1=BF, style CX` |
| 045AD CAT | ON CINT(I! + 1) GOSUB L_45BE, L_45D5, L_45EC, L_4603, L_461A | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5d 05 ae 45 c5 45 dc .. CALL RT3F_5D n=5 -> 045BE 045D5 045EC 04603 0461A   ; ON BX GOSUB t` |
| 04602 | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 04646 | IF StepDir4! >= 0 THEN GOTO L_4658 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 72 03                jb 0x464b` |
| 046D3 | PUT (PutX! + 1, PutY! + 1), Star, XOR | AGREE | `ba 04 00             mov dx, 4 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 046DD | DY! = -1 | AGREE | `be aa 70             mov si, 0x70aa / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 046F8 | GOTO L_4704 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e9 09 00             jmp 0x4704` |
| 04726 | Moved! = 1 | AGREE | `be 4a 6f             mov si, 0x6f4a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 04730 | TurnDir! = 1 | AGREE | `be 4a 6f             mov si, 0x6f4a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 047C0 | Turned! = 1 | AGREE | `be 4a 6f             mov si, 0x6f4a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 04873 | IF EnStatus!(CINT(I!)) <> 2 THEN GOTO L_4887 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 74 03                je 0x4878` |
| 0489D | IF EnStatus!(CINT(I!)) > 2 THEN GOTO L_48DB | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 76 03                jbe 0x48a2` |
| 048C9 | GOTO L_48D8 | AGREE | `cd 3e 79             CALL RT3E_79   ; PRINT end            ; flush/reset device / e9 0c 00             jmp 0x48d8` |
| 048FE | PRINT "Out Of Range" | AGREE | `e9 0c 00             jmp 0x490a / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 049B9 | PRINT "Failed" | AGREE | `e9 12 00             jmp 0x49cb / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 049DD | AmmoCount! = 2 | AGREE | `be 54 6f             mov si, 0x6f54 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 04AE5 | Flag! = 0 | AGREE | `bf 10 a0             mov di, 0xa010 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 04B62 | I! = FAC | AGREE | `bf 0e 71             mov di, 0x710e / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 04CF8 | Command! = 7 | AGREE | `be 8a 6f             mov si, 0x6f8a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 04E5A | IF NOT (((Command! > 3) OR (Command! = 1)) AND (NumEnemy! > 1)) THEN GOTO L_4E85 | AGREE | `23 c0                and ax, ax / 75 03                jne 0x4e5f` |
| 04E5F | PRINT "A-"; CHR$(CINT(NumEnemy! + 64)); " to retarget" | AGREE | `e9 26 00             jmp 0x4e85 / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 04EB8 | CmdMax! = 23 | AGREE | `be f8 71             mov si, 0x71f8 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 04ED2 | IF Cmd! = -51 THEN GOTO L_502E | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 75 03                jne 0x4ed7` |
| 04EDD CAT | ON CINT(Cmd!) GOSUB L_4F12, L_4F12, L_4F12, L_4F12, L_4F12, L_4FAF, L_4EA9, L_4EA9, L_4EA9, L_4EA9, L_4EA9, L_ | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5d 17 02 4f 02 4f 02 .. CALL RT3F_5D n=23 -> 04F12 04F12 04F12 04F12 04F12 04FAF 04EA9 04E` |
| 04F20 | NewTarget! = Cmd! - 1 | AGREE | `8b de                mov bx, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 05008 | Command! = 4 | AGREE | `87 f2                xchg dx, si / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05020 | Command! = 7 | AGREE | `be 8a 6f             mov si, 0x6f8a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05145 | G!(CINT(FNIdx(J!, 37))) = Command! | AGREE | `be 54 a7             mov si, 0xa754 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 051E8 | DefHwPct2! = (-(DriveFlag! = 1)) * DefHardwarePct! | AGREE | `bf ea a7             mov di, 0xa7ea / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 052CD | NEXT Slot! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf c2 a4             mov di, 0xa4c2` |
| 05325 | TimeSlot! = 0 | AGREE | `be 82 6f             mov si, 0x6f82 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 054BA | K! = 369 | AGREE | `be ec 71             mov si, 0x71ec / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05577 | ShieldNo! = FNCrew(Member!, 38) | AGREE | `bf 98 9f             mov di, 0x9f98 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 05971 | LOCATE 23, 3 | AGREE | `bb 03 00             mov bx, 3 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 059FB | PRINT "Armor reduced."; | AGREE | `e9 0f 00             jmp 0x5a0a / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 05A9B | IF FNInView(EnShip!) = 0 THEN GOTO L_5AEE | AGREE | `cd 3f a9             CALL RT3F_A9   ; FTEST FAC            ; ZF=zero CF=negative / 75 03                jne 0x5aa0` |
| 05AB3 | EnSlot! = ArcA!(CINT(EnShip!)) | AGREE | `bf f4 a8             mov di, 0xa8f4 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05E85 CAT | ON CINT(IsMissile! + 1) GOSUB L_6B7A, L_6A48 | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5d 02 6a 6b 38 6a CALL RT3F_5D n=2 -> 06B7A 06A48   ; ON BX GOSUB tbl      ; inline count +` |
| 05F43 | PRINT "hits." | AGREE | `e9 5f 03             jmp 0x62a2 / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 05F58 | LOCATE 22, 3 | AGREE | `bb 03 00             mov bx, 3 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 060A0 | IF Armor! > 0 THEN GOTO L_60D0 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 76 03                jbe 0x60a5` |
| 060BA | G!(CINT(HitSlot!)) = 2 | AGREE | `be 54 6f             mov si, 0x6f54 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 062AE | DelayN3! = DelayN! * 0.2 | AGREE | `bf aa a9             mov di, 0xa9aa / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 06475 | GOTO L_6481 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e9 09 00             jmp 0x6481` |
| 0647E | EdgeX! = 17 | AGREE | `be cc 9f             mov si, 0x9fcc / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 064D9 | Scale! = Scale2! | AGREE | `e9 03 00             jmp 0x64dc / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 06500 | Y2! = INT(DY! * Scale! + Y1! + 0.5) | AGREE | `bf be a9             mov di, 0xa9be / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 065B4 CAT | ON CINT(IsMissile! + 1) GOSUB L_6B7A, L_6A48 | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5d 02 6a 6b 38 6a CALL RT3F_5D n=2 -> 06B7A 06A48   ; ON BX GOSUB tbl      ; inline count +` |
| 066B4 CAT | ON CINT(INT(SQR(RND) * 10 + 1)) GOTO L_66CA, L_66CB, L_66E2, L_66F9, L_66CA, L_6717, L_6717, L_6744, L_6717 | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5e 09 ba 66 bb 66 d2 .. CALL RT3F_5E n=9 -> 066CA 066CB 066E2 066F9 066CA 06717 06717 06744` |
| 067A4 | IF RND * 22 >= Hull!(CINT(ShieldNo!)) + 10 THEN GOTO L_67E7 | AGREE | `cd 3f a5 92          CALL RT3F_A5 #92   ; FCMP T[#]?FAC        ; flags / 72 03                jb 0x67a9` |
| 0691D | PUT (X2!, Y2!), SaveArea, PSET | AGREE | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 06D79 | PUT (PutX!, PutY!), Plus, XOR | AGREE | `ba 04 00             mov dx, 4 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 06DAA | FOR N! = 1 TO 14 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 3b 00             jmp 0x6de8` |
| 06EED | RETURN | AGREE | `cd 3e 5f             CALL RT3E_5F   ; SOUND exec vol DX, voice BX ; -1 omitted / c3                   ret` |
| 06F1A | PUT (X2!, Y2!), Hit2, OR | AGREE | `33 d2                xor dx, dx / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 06F33 | PUT (X2!, Y2!), Hit3, OR | AGREE | `33 d2                xor dx, dx / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 06F48 | ExpX! = X2! + 4 | AGREE | `bf 2a aa             mov di, 0xaa2a / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 06F56 | ExpY! = Y2! + 4 | AGREE | `bf 2e aa             mov di, 0xaa2e / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 070AB | WtSum! = (G!(CINT(I! + 30))) * (SGN(G!(CINT(I!)))) + WtSum! | AGREE | `cd 3f 81             CALL RT3F_81   ; FADD FAC+[DI]->FAC / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 071FB | IF Tmp2! <= MaxMove2! THEN GOTO L_7205 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 77 03                ja 0x7200` |
| 072B6 | GOTO L_3231 | AGREE | `cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC / e9 78 bf             jmp 0x3231` |
| 072D6 | Tmp2! = 0 | AGREE | `be 82 6f             mov si, 0x6f82 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 072EF | Alert! = 2 | AGREE | `be 54 6f             mov si, 0x6f54 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 072F8 | FOR I! = 1 TO 14 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 99 00             jmp 0x7394` |
| 0737C | LOCATE 8, 24 | AGREE | `bb 18 00             mov bx, 0x18 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 0737F | PRINT "RED" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
