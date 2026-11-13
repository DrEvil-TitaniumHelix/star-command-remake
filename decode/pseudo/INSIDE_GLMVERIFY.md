# INSIDE_GLMVERIFY — independent verification of INSIDE.bas.md (lane glm-verify-inside, GLM 5.3, 2026-10-15)

Inputs verified against: `decode/listings/INSIDE.lst` (13:47 regeneration), `INSIDE.bas.md`/`INSIDE_SCREENS.md`/`INSIDE_names.json` (mod-inside, commit c48ab36), `decode/data/tools/_INSIDE.json` (data-lane literal + DATA table), the files on disk (IN-1..6.BAS, INMAP-1..6.BAS, MES-1..7, INSH, NAME, CHARNAME all exist), `decode/brun30/RT_LEDGER.md`.

Method: INSIDE.bas.md contains 1,775 offset-tagged statement lines (00046..071E0; the 13 bytes 71E3..71EF are excluded as unreachable — verified: 071E0 is an unconditional `jmp 0x6bf8`, nothing targets 71E3..71EF, and the metadata block starts at 71F0, exactly as the header's `--end 71E3` note claims). **10% = 178 statements drawn with `random.seed(20261016)`, `random.sample`** (seed listed as required), plus every CHAIN/BLOAD/BSAVE/ON GOTO/ON GOSUB/INPUT/OPEN statement not already in the draw (31 more) = **209 statements re-derived from the listing bytes** — operand chains (SCAT filename building, CSNG/BLOAD temp slots at 0x8968, FCMP/jcc polarity, boolean `mov R,0; jcc; dec R` idioms, ON-table inline words with the +0x10 rule, bp-relative DEF FN temps), with literals checked against the data-lane table.

Per the Foreman's instruction, the known translator defect (PUT verb `mov dx,3` rendered `, OR`, actually PSET — same as SPACE, qb2bas.py:551 stale enum) is **excluded from DISAGREE counting**; the 7 sampled verb-3 PUT sites are marked `AGREE*` below (coordinates, array and call verified; only the verb word is the known defect). INSIDE has 66 verb-3 PUTs (all the tile/sprite draws) and 7 verb-4 (XOR: cursor, squad marker, blips).

Verdicts: **202 AGREE + 7 AGREE* (known defect) = 209; 0 DISAGREE, 0 UNSURE.**

## Disagreements

**None.** Every sampled statement re-derives to exactly the pseudocode text. Independent confirmations worth recording:

- **OpLen% DATA (line 3331) matches the script-opcode length table**: the DATA record `1,2,2,3,3,3,2,3,2,1,2,2,2,3,2,3,4,4,1,3,2,3,1,2,2,1,2` (27 values) equals the len column of the header's opcode table op 0..26, including the two 4-word ops (16/17) and the 1-word ops (0, 9, 18, 22, 25). The script interpreter's dispatch (ON Op!+1 GOTO, 27 targets, 06CF6) was in the sample and decodes to exactly the listed labels.
- **OptionName$ DATA (line 3537)** = `#1..#9, LEAVE, ATTACK/BLOW IT UP, SEARCH/INSPECT, GREETINGS, DEMAND INFORMATION, DEMAND TRIBUTE, TAKE IT, USE IT, FOLLOW THE ADVICE, YES, NO, PAY FOR INFORMATION, ENTER A COMMAND` (22 names) — matches the screens doc's option list and the `Option! <= 22` clamps (06A48/06A98).
- **BSAVE/BLOAD lengths**: `BSAVE ..., &H48B0, 5502` (cx=0x157E at 063B5) and `BSAVE ..., &H5E2E, 8700` (cx=0x21FC at 063EF) — 5502 bytes = 2751 words = 1369 cells + 11*N room words + scripts, consistent with the IN-n format section; the BLOAD/BSAVE filename chains (STR$(-Location!) + ".BAS") and the MES-n OPEN/LINE INPUT/EOF loop were all sampled and verified.
- **Screens texts**: all quoted literals in INSIDE_SCREENS.md exist in the string table or DATA ('   Enclosed  ' at 829C, 'sees a trap!' 8DC2, 'picks the lock' 8F42, 'Dectector' 94DE, 'Radiation' 94FA, 'You Have None' 9516, 'option. ENTER to accept' 968A, "Who'll change?" 9412, 'dies!!!' 952C, 'You Are All Dead' 954A, ' Is Using:' 942C, 'hits' 9542, dotted leaders 'Armor.............' 9272, ' kg' 91C8 ...); composite descriptions ('name takes 999 hits', 'Armor.....##/##') decompose to literal+PRINT-USING/concat pieces that are individually verified. The five remaining quoted texts are variable/format descriptions, not literals.

Minor notes (no verdict change):
- The screens doc "Screen 1 ... `takes 999 hits`" describes the rendered composite; the pieces (' takes' via concatenation, 'hits' 9542) exist but I did not find a single 'takes 999 hits' literal — consistent with the pseudocode's rendering of SUB_6217, not an error.
- RT3F_71 appears in the pseudocode only in the header's `--tempbase` proof prose (line 9), not in the body — the temp-slot convention (T0 = 0x8968, holding the CSNG'd BSAVE/BLOAD offsets) was confirmed at every sampled BSAVE/BLOAD site (063B8/063F2/06436 use dx=0x8968 exactly where the pseudocode prints `&H48B0`/`&H5E2E`).

## names/_SCREENS/Unknowns checks

- **INSIDE_names.json**: 313 entries; 252 variable entries all carry a non-empty `_why` (checked programmatically); the other 61 are SUB*/FN* role entries documented in INSIDE.bas.md's Subroutines table (same design as SPACE). ~40 `_why` claims were re-verified during statement derivation (Drive$ 0x8274 as the SCAT AX operand, TestMode! 0x87AE FTEST guards, CmdMin!/CmdMax! 0x8BFC/0x8C00, MesLine$ base 0x8030, InMap% base 0x48B0, G!() index arithmetic for the COMMON scalars: SectorX! 0x3AF0 = G!(2216), InBattle!/Airless!/N_3B78! = G!(2255)/G!(2252)/G!(2250) — (0x3B58-0x1850)/4 = 2250, (0x3B60-0x1850)/4 = 2252, (0x3B6C-0x1850)/4 = 2255, all consistent).
- **Unknowns honesty**: the "runtime calls not rendered" table is empty and holds — the only RT token in the file is the header's RT3F_71 prose; the TestMode!/dead-code blocks (0427-068B, 00BC-0300, 03A7-03C5, 01067, 0154E, 17AF-1ABC) and the unreachable 71E3..71EF tail are disclosed in the header rather than hidden; the open-questions list (N_3B88!, N_3B78!, N_9018! writes) matches what the sampled statements show (N_9018! += 12 at 039D4 never read).

## Summary (counts)

- 209 statements re-derived (178 random at seed 20261016 + 31 CHAIN/BLOAD/BSAVE/ON GOTO/GOSUB/INPUT/OPEN sites): 202 AGREE / 7 AGREE* (the known PUT OR->PSET label defect, excluded per Foreman) / 0 DISAGREE / 0 UNSURE.
- No new defects found; the module's body, opcode table, DATA formats and CHAIN graph all re-derive exactly.
- names: 252/252 variables carry a supported `_why`; screens: all quoted texts proven (strings + the two DATA lines); Unknowns honest (0 unrendered calls).

## Verdict table

`AGREE*` = statement verified except the PUT verb word (`mov dx,3` = PSET, rendered `, OR`) — the known qb2bas defect being fixed by the translator owner.

| off | pseudocode statement | verdict | listing bytes at (and before) the statement |
|---|---|---|---|
| 0005D | GOTO L_0077 | AGREE | `cd 3f 61             CALL RT3F_61   ; SASSIGN s$[DX]<-s$[BX] / e9 17 00             jmp 0x77` |
| 0007D | Enclosure$(0) = "   Enclosed  " | AGREE | `ba 90 82             mov dx, 0x8290 / cd 3f 61             CALL RT3F_61   ; SASSIGN s$[DX]<-s$[BX]` |
| 000B3 CAT | BLOAD Drive$ + "INSH.BAS", &H82D6 | AGREE | `ba 1a 00             mov dx, 0x1a / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 000CD CAT | BLOAD "CHARINFO", &H1850 | AGREE | `ba 1a 00             mov dx, 0x1a / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 00102 CAT | BLOAD "LOGO", &H40F4 | AGREE | `ba 1a 00             mov dx, 0x1a / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 00112 CAT | OPEN "NAME" FOR INPUT AS #1 | AGREE | `ba ea 87             mov dx, 0x87ea / cd 3e 1e             CALL RT3E_1E   ; OPEN file$[DX] AS #BX, reclen CX` |
| 00121 CAT | INPUT #1, Rank$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 00163 CAT | INPUT #1, Skill$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 001A5 CAT | INPUT #1, K$ | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 001D9 CAT | INPUT #1, ItemName$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 0021B CAT | INPUT #1, K$ | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 0024F CAT | INPUT #1, AttrName$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 00297 CAT | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | `ba 16 88             mov dx, 0x8816 / cd 3e 1e             CALL RT3E_1E   ; OPEN file$[DX] AS #BX, reclen CX` |
| 0029D CAT | INPUT #1, ShipName$, CrewName1$, CrewName2$ | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 002C5 CAT | INPUT #1, CrewName$(CINT(I!)) | AGREE | `bb 01 00             mov bx, 1 / cd 3f b6             CALL RT3F_B6   ; INPUT #BX, begin` |
| 0033B | SWAP CrewName$(CINT(I! + 2)), CrewName$(CINT(I!)) | AGREE | `8b f2                mov si, dx / cd 3f 14             CALL RT3F_14   ; SWAP s$[SI],s$[DI]` |
| 003A7 | GOTO L_03C6 | AGREE | `c3                   ret / e9 1c 00             jmp 0x3c6` |
| 00405 | RETURN   'with FAC = FnRoom2! * 11 + FnRField2! + 1369 | AGREE | `cd 3f 81             CALL RT3F_81   ; FADD FAC+[DI]->FAC / c3                   ret` |
| 0061D | G!(CINT(FNIdx(I!, 54))) = 2 | AGREE | `be 86 82             mov si, 0x8286 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 00629 | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 00751 | GOTO L_07D0 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e9 7c 00             jmp 0x7d0` |
| 00768 | Location! = 6 | AGREE | `be 12 88             mov si, 0x8812 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 007D9 | IF TestMode! <> 1 THEN GOTO L_07F9 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 74 03                je 0x7de` |
| 007ED | StartX! = 3 | AGREE | `be b2 88             mov si, 0x88b2 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 007F6 | StartY! = 8 | AGREE | `be ae 88             mov si, 0x88ae / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0081D | GOSUB SUB_63F9 | AGREE | `e9 06 00             jmp 0x823 / e8 d9 5b             call 0x63f9` |
| 00820 | GOTO L_0829 | AGREE | `e8 d9 5b             call 0x63f9 / e9 06 00             jmp 0x829` |
| 00823 | GOSUB SUB_6473 | AGREE | `e9 06 00             jmp 0x829 / e8 4d 5c             call 0x6473` |
| 00861 | Airless! = 0 | AGREE | `be 0e 89             mov si, 0x890e / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 00864 | GOTO L_0870 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e9 09 00             jmp 0x870` |
| 0086D | Airless! = 1 | AGREE | `be 7c 82             mov si, 0x827c / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 00A35 | FOR I! = 1 TO 6 | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 e1 00             jmp 0xb19` |
| 00B3D | GOSUB SUB_13E5 | AGREE | `e8 51 07             call 0x128e / e8 a5 08             call 0x13e5` |
| 00B9F CAT | CHAIN "SPACE.STR" | AGREE | `bb c4 8a             mov bx, 0x8ac4 / cd 3e 0e             CALL RT3E_0E   ; CHAIN file$[BX]` |
| 00C00 | IF NOT ((FNCrew(Member!, 31) > 0) AND (FNCrew(Member!, 40) = 0)) THEN GOTO L_0C37 | AGREE | `23 db                and bx, bx / 75 03                jne 0xc05` |
| 00C34 | GOSUB SUB_6217 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e8 e0 55             call 0x6217` |
| 00CDE | RETURN   'with FAC = FNIdx(I!, 40) | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / c3                   ret` |
| 00E0B | PALETTE 1, 2 | AGREE | `ba 02 00             mov dx, 2 / cd 3e 4a             CALL RT3E_4A   ; PALETTE BX,DX        ; -1,-1 = reset` |
| 00EF5 | LINE (197, 108)-(313, 192), , B | AGREE | `8b cb                mov cx, bx / cd 3e 86             CALL RT3E_86   ; LINE exec color BX, DX -1/0=B/1=BF, style CX` |
| 00FFB | GOSUB SUB_60BE | AGREE | `c3                   ret / e8 c0 50             call 0x60be` |
| 0101F | NEXT DelayI! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf 9c 8b             mov di, 0x8b9c` |
| 01070 | LOCATE 24, 2 | AGREE | `bb 02 00             mov bx, 2 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 010A3 | IF Delta! <= 9999999 THEN GOTO L_10AD | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 77 03                ja 0x10a8` |
| 0119B | PRINT Prompt$ | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 011E3 | GOTO L_121B | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e9 35 00             jmp 0x121b` |
| 01205 | IF NOT ((I! < 55) AND (I! > 48)) THEN GOTO L_1219 | AGREE | `23 d2                and dx, dx / 75 03                jne 0x120a` |
| 01317 | IF Cmd! <= 95 THEN GOTO L_1327 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 77 03                ja 0x131c` |
| 0136F | IF NOT (((Cmd! <= CmdMax!) AND (Cmd! >= CmdMin!)) OR ((Cmd! = -51) OR (Cmd! = -32))) THEN GOTO L_1375 | AGREE | `23 c9                and cx, cx / 75 03                jne 0x1374` |
| 01473 | Cmd! = ASC(K$) - 53 | AGREE | `bf f0 8b             mov di, 0x8bf0 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 01551 | RETURN | AGREE | `cd 3e 86             CALL RT3E_86   ; LINE exec color BX, DX -1/0=B/1=BF, style CX / c3                   ret` |
| 01675 | IF ((I! > 57) OR (I! < 48)) AND (MaxLen! = 4) THEN GOTO L_15A0 | AGREE | `23 c9                and cx, cx / 74 03                je 0x167a` |
| 01995 | G!(CINT(FNIdx(Member!, 12))) = (FNCrew(Member!, 0) + FNCrew(Member!, 1)) / 20 + 15 | AGREE | `8b 7e f8             mov di, word ptr [bp - 8] / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 01BF5 | FOR Row! = RoomY0! TO RoomY1! | AGREE | `cd 3f 6f             CALL RT3F_6F   ; FLOAD FAC<-[SI] / e9 bc 00             jmp 0x1cb4` |
| 01D24 | ON CINT(TileHi! + 1) GOTO L_1D38, L_1E12, L_1EEC, L_1FC6, L_20A0, L_217A, L_2254, L_232E | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5e 08 28 1d 02 1e dc .. CALL RT3F_5E n=8 -> 01D38 01E12 01EEC 01FC6 020A0 0217A 02254 0232E` |
| 01D3E CAT | ON CINT(TileLo!) GOTO L_1D52, L_1D6A, L_1D82, L_1D9A, L_1DB2, L_1DCA, L_1DE2, L_1DFA | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 42 1d 5a 1d 72 .. CALL RT3F_5E n=8 -> 01D52 01D6A 01D82 01D9A 01DB2 01DCA 01DE2 01DF` |
| 01D96 | PUT (PxX!, PxY!), Tile2, PSET | AGREE* | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 01E11 | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 01E18 CAT | ON CINT(TileLo!) GOTO L_1E2C, L_1E44, L_1E5C, L_1E74, L_1E8C, L_1EA4, L_1EBC, L_1ED4 | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 1c 1e 34 1e 4c .. CALL RT3F_5E n=8 -> 01E2C 01E44 01E5C 01E74 01E8C 01EA4 01EBC 01ED` |
| 01EF2 CAT | ON CINT(TileLo!) GOTO L_1F06, L_1F1E, L_1F36, L_1F4E, L_1F66, L_1F7E, L_1F96, L_1FAE | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 f6 1e 0e 1f 26 .. CALL RT3F_5E n=8 -> 01F06 01F1E 01F36 01F4E 01F66 01F7E 01F96 01FA` |
| 01F32 | PUT (PxX!, PxY!), Tile17, PSET | AGREE* | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 01FCC CAT | ON CINT(TileLo!) GOTO L_1FE0, L_1FF8, L_2010, L_2028, L_2040, L_2058, L_2070, L_2088 | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 d0 1f e8 1f 00 .. CALL RT3F_5E n=8 -> 01FE0 01FF8 02010 02028 02040 02058 02070 0208` |
| 01FF4 | PUT (PxX!, PxY!), Tile24, PSET | AGREE* | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 0200C | PUT (PxX!, PxY!), Tile25, PSET | AGREE* | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 020A6 CAT | ON CINT(TileLo!) GOTO L_20BA, L_20D2, L_20EA, L_2102, L_211A, L_2132, L_214A, L_2162 | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 aa 20 c2 20 da .. CALL RT3F_5E n=8 -> 020BA 020D2 020EA 02102 0211A 02132 0214A 0216` |
| 020D1 | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 02146 | PUT (PxX!, PxY!), Tile37, PSET | AGREE* | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 02180 CAT | ON CINT(TileLo!) GOTO L_2194, L_21AC, L_21C4, L_21DC, L_21F4, L_220C, L_2224, L_223C | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 84 21 9c 21 b4 .. CALL RT3F_5E n=8 -> 02194 021AC 021C4 021DC 021F4 0220C 02224 0223` |
| 021C0 | PUT (PxX!, PxY!), Tile41, PSET | AGREE* | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 02220 | PUT (PxX!, PxY!), Tile45, PSET | AGREE* | `ba 03 00             mov dx, 3 / cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR` |
| 0225A CAT | ON CINT(TileLo!) GOTO L_226E, L_2286, L_229E, L_22B6, L_22CE, L_22E6, L_22FE, L_2316 | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 5e 22 76 22 8e .. CALL RT3F_5E n=8 -> 0226E 02286 0229E 022B6 022CE 022E6 022FE 0231` |
| 02334 CAT | ON CINT(TileLo!) GOTO L_2348, L_2360, L_2378, L_2390, L_23A8, L_23C0, L_23D8, L_23F0 | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 08 38 23 50 23 68 .. CALL RT3F_5E n=8 -> 02348 02360 02378 02390 023A8 023C0 023D8 023F` |
| 023D7 | RETURN | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 025A7 | CanUp! = (Pass! > 99) | AGREE | `bf 5e 8d             mov di, 0x8d5e / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 02608 CAT | ON CINT(Cmd!) GOTO L_25F0, L_2830, L_25F0, L_25F0, L_2866, L_25F0, L_289C, L_25F0, L_25F0, L_28D2, L_25F0, L_2 | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 21 e0 25 20 28 e0 .. CALL RT3F_5E n=33 -> 025F0 02830 025F0 025F0 02866 025F0 0289C 025` |
| 02794 | DrawRoom! = RoomNo! | AGREE | `be 24 8b             mov si, 0x8b24 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0288A | SOUND 900, SndDur! * 7 | AGREE | `8b d3                mov dx, bx / cd 3e 5f             CALL RT3E_5F   ; SOUND exec vol DX, voice BX ; -1 omitted` |
| 028DA | IF (CanDown! = 0) THEN GOTO L_28FC | AGREE | `23 db                and bx, bx / 75 03                jne 0x28df` |
| 0293C | NewRoom! = INT(FNCell(0) * 0.015625) | AGREE | `bf 8e 8d             mov di, 0x8d8e / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 02981 | IF (Tile! > 40) OR (Tile! < 36) THEN GOTO L_2F18 | AGREE | `23 d2                and dx, dx / 74 03                je 0x2986` |
| 029D1 | IF RadDetOn! = 0 THEN GOTO L_2A98 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 75 03                jne 0x29d6` |
| 02A7C | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 02A92 | RadSweep! = RadSweepSave! | AGREE | `be ba 8d             mov si, 0x8dba / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 02B44 | PRINT "sees a trap!" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 02C8A CAT | ON CINT(INT(TrapLevel! * 0.3225807) + 1) GOTO L_2C92, L_2DD7 | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5e 02 82 2c c7 2d CALL RT3F_5E n=2 -> 02C92 02DD7   ; ON BX GOTO tbl       ; inline count +` |
| 02CAA | PoisonTarget! = INT(RND * 6 + 1) | AGREE | `bf 46 8e             mov di, 0x8e46 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 02D76 | LOCATE 20, 26 | AGREE | `8b d9                mov bx, cx / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 02DAF | GOSUB SUB_128E | AGREE | `e8 df e4             call 0x128e / e8 dc e4             call 0x128e` |
| 02DD4 | GOTO L_2EE1 | AGREE | `e9 08 ff             jmp 0x2cdc / e9 0a 01             jmp 0x2ee1` |
| 02DFA | SOUND 900, SndDur! * 28 | AGREE | `8b d3                mov dx, bx / cd 3e 5f             CALL RT3E_5F   ; SOUND exec vol DX, voice BX ; -1 omitted` |
| 02F12 | OldY! = Y! | AGREE | `be a4 48             mov si, 0x48a4 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 02F5B | DoorHP! = ABS(FNRoom(NewRoom!, 6)) | AGREE | `bf 78 8e             mov di, 0x8e78 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 03037 | ON CINT(Cmd!) GOTO L_3043, L_308A, L_31EF, L_338D | AGREE | `cd 3f 75             CALL RT3F_75   ; CINT [SI]->BX / cd 3f 5e 04 33 30 7a 30 df .. CALL RT3F_5E n=4 -> 03043 0308A 031EF 0338D   ; ON BX GOTO tbl    ` |
| 0322D | WeaponRec! = FNCrew(Member!, 32) * 12 + 788 | AGREE | `bf 00 8f             mov di, 0x8f00 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 0335A | GOSUB SUB_3452 | AGREE | `e9 17 01             jmp 0x3471 / e8 f5 00             call 0x3452` |
| 03411 | LOCATE 19, 26 | AGREE | `bb 1a 00             mov bx, 0x1a / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 03428 | PRINT "picks the lock" | AGREE | `e9 0f 00             jmp 0x3437 / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 03434 | GOTO L_3471 | AGREE | `cd 3e 79             CALL RT3E_79   ; PRINT end            ; flush/reset device / e9 3a 00             jmp 0x3471` |
| 03471 | GOSUB SUB_128E | AGREE | `c3                   ret / e8 1a de             call 0x128e` |
| 03474 | GOSUB SUB_14CA | AGREE | `e8 1a de             call 0x128e / e8 53 e0             call 0x14ca` |
| 0348F | GOSUB SUB_128E | AGREE | `cd 3e 79             CALL RT3E_79   ; PRINT end            ; flush/reset device / e8 fc dd             call 0x128e` |
| 034AE | InMap%(CINT(FNRoomIdx(NewRoom!, 6))) = 0 | AGREE | `d1 e7                shl di, 1 / c7 85 b0 48 00 00    mov word ptr [di + 0x48b0], 0` |
| 03548 | GOSUB SUB_4F07 | AGREE | `e9 c0 ee             jmp 0x2408 / e8 bc 19             call 0x4f07` |
| 03557 CAT | CHAIN Drive$ + "SPACE.STR" | AGREE | `cd 3f 55             CALL RT3F_55   ; SCAT s$[AX]+s$[BX]->BX / cd 3e 0e             CALL RT3E_0E   ; CHAIN file$[BX]` |
| 035BD | GOTO L_64E4 | AGREE | `cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC / e9 24 2f             jmp 0x64e4` |
| 03732 | NEXT I! STEP 3 | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 03758 | NEXT I! STEP 3 | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 0387A | ItemType! = 2 | AGREE | `be 86 82             mov si, 0x8286 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 03883 | Tmp! = 0 | AGREE | `be fa 87             mov si, 0x87fa / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 039D4 | N_9018! = N_9018! + 12 | AGREE | `8b fe                mov di, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 03A54 | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 03B1C | NEXT I! STEP 12 | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 03CC1 | IF Cmd! = 2 THEN GOTO L_3E59 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 75 03                jne 0x3cc6` |
| 03CCC | GOSUB SUB_1378 | AGREE | `e8 f9 d6             call 0x13c5 / e8 a9 d6             call 0x1378` |
| 03D8F | LOCATE , 12 | AGREE | `bb 0c 00             mov bx, 0xc / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 03DCF | PRINT FNCrew(I!, 16); | AGREE | `bb 1a 00             mov bx, 0x1a / cd 3f 67             CALL RT3F_67   ; PRINT sng [BX];` |
| 03DFA | IF FNCrew(I!, 0) <= 0 THEN GOTO L_3E28 | AGREE | `cd 3f a9             CALL RT3F_A9   ; FTEST FAC            ; ZF=zero CF=negative / 77 03                ja 0x3dff` |
| 03DFF | PRINT | AGREE | `e9 29 00             jmp 0x3e28 / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 03E56 | GOTO L_3C56 | AGREE | `e8 8f d5             call 0x13e5 / e9 fd fd             jmp 0x3c56` |
| 03FFA | PRINT CrewName$(CINT(M!)); " is" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 041AF | GOSUB SUB_128E | AGREE | `cd 3e 79             CALL RT3E_79   ; PRINT end            ; flush/reset device / e8 dc d0             call 0x128e` |
| 04207 | PRINT LEFT$(Rank$(CINT(G!(CINT(Rec! + 34)))), 12); " "; CrewName$(CINT(Member!)) | AGREE | `cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 042C5 | PRINT "HP"; INT(G!(CINT(Rec! + 15))); "/"; INT(G!(CINT(Rec! + 16))) | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 04331 | PRINT AttrName$(CINT(I!)); STRING$(19 - LEN(STR$(G!(CINT(I! + Rec!)))) - LEN(AttrName$(CINT(I!))), "."); MID$( | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 04403 | PRINT "Defence Bonus..."; | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 044D3 | LOCATE 18, 2 | AGREE | `8b da                mov bx, dx / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 045A4 | LOCATE 21, 17 | AGREE | `bb 11 00             mov bx, 0x11 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 045C7 | LOCATE 22, 3 | AGREE | `bb 03 00             mov bx, 3 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 04600 | LOCATE 22, 14 | AGREE | `bb 0e 00             mov bx, 0xe / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 04639 | LOCATE 23, 3 | AGREE | `bb 03 00             mov bx, 3 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 046C6 | IF Cmd! < -40 THEN GOTO L_4B2A | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 73 03                jae 0x46cb` |
| 0478F | PRINT "Armor............."; | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 0491A | IF NOT ((I! < 15) AND ((G!(CINT(ItemRec!)) > 0) AND (G!(CINT(ItemRec! + 2)) = Member! + 2))) THEN GOTO L_4960 | AGREE | `23 c9                and cx, cx / 75 03                jne 0x491f` |
| 04969 | NEXT ItemRec! STEP 3 | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf 42 8c             mov di, 0x8c42` |
| 04A35 | GOTO L_49BD | AGREE | `e9 f2 00             jmp 0x4b27 / eb 86                jmp 0x49bd` |
| 04AEB | ListLine$ = GunName$(CINT(GunType! - 1)) | AGREE | `ba 0c 93             mov dx, 0x930c / cd 3f 61             CALL RT3F_61   ; SASSIGN s$[DX]<-s$[BX]` |
| 04B2A | GOSUB SUB_1378 | AGREE | `e8 2e 1b             call 0x6658 / e8 4b c8             call 0x1378` |
| 05027 | ListLine$ = GunName$(CINT(G!(CINT(ItemRec!)) - 1)) | AGREE | `ba 0c 93             mov dx, 0x930c / cd 3f 61             CALL RT3F_61   ; SASSIGN s$[DX]<-s$[BX]` |
| 050D9 | EquipRec! = ItemRec! + 2 | AGREE | `be 68 89             mov si, 0x8968 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 051B1 | Found! = 1 | AGREE | `be 7c 82             mov si, 0x827c / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0528F | IF NOT ((ListRow! < 21) AND (Found! = 0)) THEN GOTO L_5295 | AGREE | `23 d2                and dx, dx / 75 03                jne 0x5294` |
| 05294 | RETURN | AGREE | `e9 01 00             jmp 0x5295 / c3                   ret` |
| 052E6 | CmdMax! = ListIdx! + 1 | AGREE | `bf 00 8c             mov di, 0x8c00 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 05303 | RETURN | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / c3                   ret` |
| 05321 | ListRow! = 3 | AGREE | `be b2 88             mov si, 0x88b2 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 053B7 | LOCATE CINT(G!(CINT(Cmd! + 499))), 4 | AGREE | `bb 04 00             mov bx, 4 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 054E9 | LOCATE 16, 29 | AGREE | `bb 1d 00             mov bx, 0x1d / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 0560E | Found! = 0 | AGREE | `be fa 87             mov si, 0x87fa / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05617 | ViewXEnd! = ViewX1! | AGREE | `be ba 93             mov si, 0x93ba / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0562A | ViewYEnd! = ViewY1! | AGREE | `be c2 93             mov si, 0x93c2 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05687 | Found! = 1 | AGREE | `be 7c 82             mov si, 0x827c / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0570D | LOCATE 20, 29 | AGREE | `bb 1d 00             mov bx, 0x1d / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 0573B | GOSUB SUB_128E | AGREE | `e8 53 bb             call 0x128e / e8 50 bb             call 0x128e` |
| 057CD | G!(CINT(RadDetRec! + 1)) = 0 | AGREE | `be fa 87             mov si, 0x87fa / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 057F7 | RadTimer! = TIMER | AGREE | `bf ea 93             mov di, 0x93ea / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 0585F | RETURN   'with FAC = RadSweep! * 8 - 7 | AGREE | `cd 3e 58             CALL RT3E_58   ; PUT (x,y),arr[BX],verb DL ; 0 OR 1 AND 2 PRESET 3 PSET 4 XOR / c3                   ret` |
| 05883 | GOSUB SUB_5945 | AGREE | `e9 03 00             jmp 0x5886 / e8 bf 00             call 0x5945` |
| 05985 | Prompt$ = "Who'll change?" | AGREE | `ba c4 8b             mov dx, 0x8bc4 / cd 3f 61             CALL RT3F_61   ; SASSIGN s$[DX]<-s$[BX]` |
| 059D2 | IF WepSlot! <= 0 THEN GOTO L_5A41 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 77 03                ja 0x59d7` |
| 05A74 | LOCATE 8, 2 | AGREE | `8b da                mov bx, dx / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 05A77 | GOSUB SUB_5C12 | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / e8 98 01             call 0x5c12` |
| 05C72 | IF Ammo! <= 9 THEN GOTO L_5C7C | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 77 03                ja 0x5c77` |
| 05C79 | Ammo! = 9 | AGREE | `87 f7                xchg di, si / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05D4E | GOSUB SUB_14CA | AGREE | `c3                   ret / e8 79 b7             call 0x14ca` |
| 05D5A | LOCATE 19, 28 | AGREE | `bb 1c 00             mov bx, 0x1c / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 05DBB | IF NOT ((G!(CINT(I! + 3)) = 0) AND (WepSlot! > 0)) THEN GOTO L_5DC3 | AGREE | `23 db                and bx, bx / 75 03                jne 0x5dc0` |
| 05DDC | GOTO L_2408 | AGREE | `76 96                jbe 0x5d72 / e9 29 c6             jmp 0x2408` |
| 05E3A | G!(CINT(J!)) = 0 | AGREE | `be fa 87             mov si, 0x87fa / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 05FAC | PRINT "Dectector" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 05FDA | PRINT "Radiation" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 06018 | IF Cmd! < 0 THEN GOTO L_2408 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 73 03                jae 0x601d` |
| 06063 | PRINT "You Have None" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 061EE | ScoutSkill! = FNCrew(Member!, 19) | AGREE | `bf 08 8e             mov di, 0x8e08 / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 06216 | RETURN | AGREE | `e9 6c ff             jmp 0x6182 / c3                   ret` |
| 0634E | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 063BB CAT | BSAVE Drive$ + "IN" + STR$(-Location!) + ".BAS", &H48B0, 5502 | AGREE | `ba 68 89             mov dx, 0x8968 / cd 3e 1b             CALL RT3E_1B   ; BSAVE file$[BX], off DX, len CX` |
| 063F5 CAT | BSAVE Drive$ + "INMAP" + STR$(-Location!) + ".BAS", &H5E2E, 8700 | AGREE | `ba 68 89             mov dx, 0x8968 / cd 3e 1b             CALL RT3E_1B   ; BSAVE file$[BX], off DX, len CX` |
| 06439 | BLOAD Drive$ + "IN" + STR$(-Location!) + ".BAS", &H48B0 | AGREE | `ba 68 89             mov dx, 0x8968 / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 0646D CAT | BLOAD Drive$ + "INMAP" + STR$(-Location!) + ".BAS", &H5E2E | AGREE | `ba 68 89             mov dx, 0x8968 / cd 3e 1a             CALL RT3E_1A   ; BLOAD file$[BX], off=[DX] ; DX->single, 1A=FAC` |
| 0649D CAT | OPEN Drive$ + "MES" + STR$(-Location!) FOR INPUT AS #1 | AGREE | `bb 01 00             mov bx, 1 / cd 3e 1e             CALL RT3E_1E   ; OPEN file$[DX] AS #BX, reclen CX` |
| 064BD CAT | LINE INPUT #1, MesLine$(CINT(I!)) | AGREE | `81 c3 30 80          add bx, 0x8030 / cd 3f 5a             CALL RT3F_5A   ; LINE INPUT #, s$[BX]` |
| 064C8 | IF NOT (EOF(1)) THEN GOTO L_64D4 | AGREE | `23 db                and bx, bx / 75 03                jne 0x64cd` |
| 064D0 | CLOSE #1 | AGREE | `bb 01 00             mov bx, 1 / cd 3e 21             CALL RT3E_21   ; CLOSE #BX` |
| 064E4 | GOSUB SUB_13C5 | AGREE | `eb c5                jmp 0x64a9 / e8 de ae             call 0x13c5` |
| 06655 | CHAIN Drive$ + "PLBATTLE.EXE" | AGREE | `cd 3f 55             CALL RT3F_55   ; SCAT s$[AX]+s$[BX]->BX / cd 3e 0e             CALL RT3E_0E   ; CHAIN file$[BX]` |
| 06676 | CmdMax! = 0 | AGREE | `be fa 87             mov si, 0x87fa / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 0669D | G!(CINT(I!)) = 0 | AGREE | `be 10 96             mov si, 0x9610 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 066A8 | NEXT I! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 06706 | Tmp! = G!(CINT(I!)) + 500 | AGREE | `bf dc 8f             mov di, 0x8fdc / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 0672E | NEXT I! STEP 3 | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf f2 87             mov di, 0x87f2` |
| 06801 | GOTO L_67B8 | AGREE | `cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC / eb b5                jmp 0x67b8` |
| 06975 | Option! = 10 | AGREE | `be 0a 88             mov si, 0x880a / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 069B3 | PRINT "option. ENTER to accept" | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 06A3D | Option! = Option! + 1 | AGREE | `8b de                mov bx, si / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 06A48 | IF Option! <= 22 THEN GOTO L_6A54 | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 77 03                ja 0x6a4d` |
| 06A98 | Option! = 22 | AGREE | `be 88 8b             mov si, 0x8b88 / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 06C70 | IF Op! >= 0 THEN GOTO L_6CC6 | AGREE | `cd 3f a7             CALL RT3F_A7   ; FTEST [SI]           ; ZF=zero CF=negative / 72 03                jb 0x6c75` |
| 06CF6 CAT | ON CINT(Op! + 1) GOTO L_6BF8, L_6D30, L_6D59, L_6E46, L_6E5F, L_6E74, L_6E8D, L_6E9C, L_6F2E, L_6F5A, L_6F60,  | AGREE | `cd 3f 77             CALL RT3F_77   ; CINT FAC->BX / cd 3f 5e 1b e8 6b 20 6d 49 .. CALL RT3F_5E n=27 -> 06BF8 06D30 06D59 06E46 06E5F 06E74 06E8D 06E9` |
| 06D90 | TextRow! = 7 - (INT((LEN(K$) + 22) / 46)) | AGREE | `bf 7a 8d             mov di, 0x8d7a / cd 3f 7d             CALL RT3F_7D   ; FSTORE [DI]<-FAC` |
| 06DC5 | PRINT MID$(K$, CINT(I! * 23 + 1), 23) | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / cd 3f bc             CALL RT3F_BC   ; PRINT begin (screen)` |
| 06E3D | LOCATE 19, 8 | AGREE | `bb 08 00             mov bx, 8 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 06E96 | GOSUB SUB_1083 | AGREE | `cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single / e8 ea a1             call 0x1083` |
| 06FDE | IF Option! <> Arg1! THEN GOTO L_6FEC | AGREE | `cd 3f 9f             CALL RT3F_9F   ; FCMP [SI]?[DI]       ; flags (ja/jb/je) / 74 03                je 0x6fe3` |
| 07063 | Script! = Arg3! | AGREE | `be fa 96             mov si, 0x96fa / cd 3f 7b             CALL RT3F_7B   ; FMOV [DI]<-[SI]      ; copy 4-byte single` |
| 07069 | GOSUB SUB_1378 | AGREE | `e9 8f fb             jmp 0x6bf8 / e8 0c a3             call 0x1378` |
| 070EC | GOSUB SUB_13E5 | AGREE | `e9 0c fb             jmp 0x6bf8 / e8 f6 a2             call 0x13e5` |
| 070F5 | GOSUB SUB_1378 | AGREE | `e9 64 fc             jmp 0x6d59 / e8 80 a2             call 0x1378` |
| 0717B | NEXT Member! | AGREE | `cd 3f 7f             CALL RT3F_7F   ; FADD [SI]+[DI]->FAC / bf d2 8a             mov di, 0x8ad2` |
| 07197 | LOCATE 24, 6 | AGREE | `bb 06 00             mov bx, 6 / cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX)` |
| 0719A | GOSUB SUB_12B5 | AGREE | `cd 3e 44             CALL RT3E_44   ; LOCATE exec (last arg BX) / e8 18 a1             call 0x12b5` |
