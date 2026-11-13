# PLBATTLE_GLMVERIFY — independent second-column verification of PLBATTLE.bas.md (lane glm-verify-plbattle, run on Fable 2026-10-18; GLM and codex were unavailable, the first column was Opus)

Inputs: `decode/listings/PLBATTLE.lst` (13:47 regeneration), `decode/pseudo/PLBATTLE.bas.md` (3646 lines, body regenerated 2026-10-16 02:24), `PLBATTLE_SCREENS.md`, `PLBATTLE_names.json`, `decode/data/tools/_PLBATTLE.json` (160 string literals, 196 numeric constants, 6 DATA records), `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` (COMMON array table). `decode/pseudo/PLBATTLE_VERIFY.md` (the Opus column) was NOT read before this report was written.

Method: the pseudocode body holds **2169 offset-tagged statements** (3 are `' push` comments on the DIM sizes). **10 % = 217 statements drawn with `random.seed(20261018)` / `random.sample`**, plus every CHAIN / BLOAD / OPEN / INPUT / ON GOTO / ON GOSUB site not already drawn (27 more; 33 such sites in all) = **244 statements re-derived from the listing bytes**. For each statement I read the instructions from the previous statement's offset up to the statement (and, where a register was set earlier, the wider window), resolved every `mov r,0xNNNN` operand against the data lane's literal table and the names file, applied the ledger semantics (FCMP + jcc polarity, `mov r,0; jcc; dec r` booleans, SCAT operand order AX+BX, 3E_58 verb 0 OR / 1 AND / 2 PRESET / 3 PSET / 4 XOR with DH <> 0 = descriptor, 3F_B7 inline types 04 string / 02 single, ON-table words + 0x10, T[b] = 0xBE88 + 8*(b AND 0x7F)) and wrote the statement down before comparing it with the pseudocode line. The 28 store targets of the ENCINFO INPUT (0E96-0FA7) were checked one by one against the 28 names in the statement.

**Verdicts: 244 AGREE, 0 DISAGREE, 0 UNSURE.** Four rows carry notes (N1, N2 below); none changes a verdict.

## Disagreements

None. Every sampled statement, every CHAIN / BLOAD / INPUT / ON site and every ON-table target list matches what the bytes say.

### Notes (presentation / wording; no decode error)

- **N1 - LINE style rendering (08949 `LINE ..., 3, -13108`, 0896A `LINE ..., 2, -13018`; 0896A is in the sample).** The bytes are `mov bx,2; mov cx,0xCD26; RT3E_86` with DX = -1 (plain line): colour 2, no box, style word &HCD26. The value is right, but the pseudocode prints the style as the third positional argument, which in BASIC syntax is the B/BF slot; a reader or a repro would take -13018 for a box flag. Suggested text: `LINE (FromX!, FromY!)-(ToX!, ToY!), 2, , &HCD26` (and `3, , &HCCCC` at 08949). This is a qb2bas.py rendering rule, so the same form appears wherever a styled LINE has no box in the other modules' outputs.
- **N2 - boolean idiom (0342C, 03473, debug fill).** `mov dx,0; jbe; dec dx; and dx,dx; jge; neg dx; CSNG` is the compiler's `-(x > c)` giving 0/1; the pseudocode renders it `ABS(DbgEsper! > 2)`, which has the same value. Dead code (DebugLoad! only).
- **N3 - names.json cosmetic defect.** The file carries a stray key `"A C248": ""` (a space inside the key, empty value) next to the real `AC248 = GrpToHitMod!`. Harmless to qb2bas (no address matches it), but it is the one entry without a `_why` that is not a SUB/FN role entry.
- **N4 - header wording.** The door-cell condition at 09AAC compares 0xC1E0 (`MapType!`), not `TerrType!`; the body line `IF MapType! <= 10 THEN GOTO L_9B05` is right and `MapType!` was set from `TerrType!` at 09702 (names.json says so), so the header's "TerrType! > 10" names the same value by its source. No body change needed.

## names / _SCREENS / Unknowns checks

- **PLBATTLE_names.json**: 426 named entries; 360 are variables or arrays and every one of them has a non-empty `_why` (checked programmatically; the 65 entries without `_why` are the SUB*/FN* role entries documented in the Subroutines table, plus the stray `A C248` key of N3). 36 `_why` claims were re-read at their cited offsets during the statement pass and all hold: Drive$ (007B-00A9; prefixed at 0333/0349/0380/1990/19DA/19F2/0E67/4335/4344, NOT at 19BD/0509), DriveCfg! G!(85), SoundOff! G!(93) -> SndDur! (00C7), UseEGA! (006A-0072, 1954-19FB, 9B0F), StdDelay!/Delay! (5447/5466 print the two "Delay" literals), CreditsHi!/CreditsLo! (29D0-29E7: Delta!/30000 -> Hi, Delta! - Hi*30000 -> Lo), ChainArg! -> EncRec! (0E4E), Terrain! -> TerrType! (0197-01A9), Surprise! (01D3), Breathable! -> Atmos! -> "Breathable" (02B0-02BB), Gravity10! (0179), Enclosure! (0224), BattleWon! (430D), EntryMode! = 1 -> SPACE.STR (4327-433B), TowLinkCond! (4469), KillPtr! -> TowIdx! (4373), MissionType!/LastEnemyType! (4404-4413), Status$ 0xC0B8 (04DD-04EF), GrpSize! 0xC604 (12B3 BoardCrew!, 12E4 = 3), MoveDX!/MoveDY! (1AB4-1AB7), GrpX!/GrpY! 0xC518/0xC53C (slot 5 = +20: 4F77, 4FAD, 47D0), GrpState! 0xC560, GrpTactic! 0xC5D4, MoveScore! 0xC570, UnitHP! 0xC2B8, UnitState! 0xC4C8, UnitWeapon! 0xC428, UnitRockets! 0xC388, Map% 0xBBCA (97C3 bottom row = 3; 9AB1 Map%(76) = 1 = direct store to 0xBC62), TileBank 0xBC6C, PortraitCGA 0x942E / PortraitEGA 0x8052 (ON-table bases 9CA6/9EBD), Cursor 0xB3B0, Burst1/2 0xB560/0xB684, UnitSprite0/1/2 0xAC70/0xACF4/0xAD78, the 28 ENCINFO column names (0EC2-0FA7), InputVal% (54AD-54BD), TgtGrp! reused as the sprite case (A01B).
- **PLBATTLE_SCREENS.md**: 166 distinct back-quoted items; 84 are literal strings and all 84 exist verbatim in the literal table or the DATA records (TerrainName$, CmdName$). The other 82 are statements, variable names, array names or paraphrases with placeholders (`name`, `n`, `A1`, `[stamina]`); every text fragment of those paraphrases resolves to literals: "Atmosphere: " + "Breathable", "To escape the combat " + "walk off the map." (0499), "Group " + CHR$ + ":" + name + "(s)" (1300/4213), " killed!", "   [" + stamina + "]", " uses " + CmdName$ + ".", " translates", " uses ESP", "'s armor absorbs the damage.", "killed. " / "Survived." / "Surrendered." (4255-42A7). LOCATE rows and columns sampled at 01BB, 0250E (row I!*2+2, col 14), 02D13/02D34/02D6B (cols 4/12/17), 03193, 03C1B, 0479F, 07ED9 (row M!+12, col 12), 09BD0/09C1D (row 2) all match the screens text; the frame geometry (023AD-027FE, 0264D, 02F5E, the 025AC/0290A GET rectangles) matches the Screen 2 table.
- **Unknowns honesty**: the body contains no `RT3x_yy` token, no `CALL`, no `' asm` line; the "runtime calls not rendered" table is empty and that is true. The dead and DebugLoad!-only ranges and the A921-A92F tail are declared in the header, and the `--end A921` cut is explained there. The header's "Unknowns / open questions" lists the boarding-epilogue COMMON slots as readings (M) and the two always-zero variables (N_D130!, N_D2C4!: 07741-0774A confirm both are only read there and at 064CE) honestly.

## Summary (counts)

- 244 statements re-derived (217 random at seed 20261018 + 27 extra CHAIN/BLOAD/OPEN/INPUT/ON sites; 33 such sites in all): **244 AGREE / 0 DISAGREE / 0 UNSURE**.
- 0 decode defects; 1 presentation fix request (N1: a styled LINE without a box prints the style in the B/BF slot; 2 sites in PLBATTLE, rule in qb2bas.py) + 1 cosmetic names.json key (N3).
- names: 360/360 variables carry a `_why`, 36 re-checked at the listing and supported; screens: 84/84 literals verbatim, 82 paraphrases resolved; Unknowns section honest.

## Verdict table

`CAT` = category site (CHAIN / BLOAD / OPEN / INPUT / ON GOTO / ON GOSUB), included regardless of the draw. Evidence = the last instructions up to and including the statement's offset (`addr bytes mnemonic`); operand resolution (literal text, constant value, variable name) was done against `_PLBATTLE.json` and `PLBATTLE_names.json` as described above.

| off | pseudocode statement | verdict | listing bytes at (and before) the statement |
|---|---|---|---|
| 00047 | DIM HdrSave(1 dims; sizes pushed above) | AGREE | 00044 `bb 30 80 mov bx, 0x8030` / 00047 `cd 3f 45 01 CALL RT3F_45 #01` |
| 000C7 | SndDur! = 1 - SoundOff! | AGREE | 000C1 `cd 3f 97 CALL RT3F_97` / 000C4 `bf 26 94 mov di, 0x9426` / 000C7 `cd 3f 7d CALL RT3F_7D` |
| 00140 | IF DebugLoad! = 0 THEN GOTO L_016A | AGREE | 0013A `be d4 ba mov si, 0xbad4` / 0013D `cd 3f a7 CALL RT3F_A7` / 00140 `75 03 jne 0x145` |
| 00151 CAT | BLOAD "CHARINFO", &H1850 | AGREE | 0014B `bb d8 ba mov bx, 0xbad8` / 0014E `ba 1a 00 mov dx, 0x1a` / 00151 `cd 3e 1a CALL RT3E_1A` |
| 001A9 | TerrType! = 1 | AGREE | 001A4 `e9 05 00 jmp 0x1ac` / 001A7 `87 f7 xchg di, si` / 001A9 `cd 3f 7b CALL RT3F_7B` |
| 00224 | IF TerrType! <> 11 THEN GOTO L_0231 | AGREE | 0021E `be f0 ba mov si, 0xbaf0` / 00221 `cd 3f 9f CALL RT3F_9F` / 00224 `74 03 je 0x229` |
| 0025A | IF Gravity! <= 1 THEN GOTO L_026B | AGREE | 00254 `be e4 ba mov si, 0xbae4` / 00257 `cd 3f 9f CALL RT3F_9F` / 0025A `77 03 ja 0x25f` |
| 00333 CAT | BLOAD Drive$ + "TR" + STR$(-TerrType!) + ".EGA", &HBC6C | AGREE | 0032E `8b ca mov cx, dx` / 00330 `ba 88 be mov dx, 0xbe88` / 00333 `cd 3e 1a CALL RT3E_1A` |
| 00349 CAT | BLOAD Drive$ + "LOGO.EGA", VARPTR(BoxSave) | AGREE | 00343 `cd 3f 55 CALL RT3F_55` / 00346 `ba 1a 00 mov dx, 0x1a` / 00349 `cd 3e 1a CALL RT3E_1A` |
| 00380 CAT | BLOAD Drive$ + "TR" + STR$(-TerrType!) + ".BAS", &HBC6C | AGREE | 0037A `cd 3f 55 CALL RT3F_55` / 0037D `ba 88 be mov dx, 0xbe88` / 00380 `cd 3e 1a CALL RT3E_1A` |
| 0039A | LegendEnd! = I! + 32 | AGREE | 00395 `bf a2 bf mov di, 0xbfa2` / 00398 `8b de mov bx, si` / 0039A `cd 3f 7d CALL RT3F_7D` |
| 004A2 | GOTO L_04BD | AGREE | 0049C `cd 3f 6e CALL RT3F_6E` / 0049F `cd 3e 79 CALL RT3E_79` / 004A2 `e9 18 00 jmp 0x4bd` |
| 004A5 | PRINT "use the door at the"; | AGREE | 004A5 `cd 3f bc CALL RT3F_BC` |
| 004E6 | Status$(1) = "Okay" | AGREE | 004E0 `bb cc c0 mov bx, 0xc0cc` / 004E3 `ba bc c0 mov dx, 0xc0bc` / 004E6 `cd 3f 61 CALL RT3F_61` |
| 004EF | Status$(2) = "Rad " | AGREE | 004E9 `bb d4 c0 mov bx, 0xc0d4` / 004EC `ba c0 c0 mov dx, 0xc0c0` / 004EF `cd 3f 61 CALL RT3F_61` |
| 00509 CAT | BLOAD "LOGO", &H40F4 | AGREE | 00503 `bb dc c0 mov bx, 0xc0dc` / 00506 `ba 1a 00 mov dx, 0x1a` / 00509 `cd 3e 1a CALL RT3E_1A` |
| 00519 CAT | OPEN "NAME" FOR INPUT AS #1 | AGREE | 00513 `bb 01 00 mov bx, 1` / 00516 `ba e4 c0 mov dx, 0xc0e4` / 00519 `cd 3e 1e CALL RT3E_1E` |
| 00529 CAT | INPUT #1, K$ | AGREE | 00525 `90 nop` / 00526 `bb 01 00 mov bx, 1` / 00529 `cd 3f b6 CALL RT3F_B6` |
| 0055D CAT | INPUT #1, WeaponName$(CINT(I!)) | AGREE | 00559 `90 nop` / 0055A `bb 01 00 mov bx, 1` / 0055D `cd 3f b6 CALL RT3F_B6` |
| 0059F CAT | INPUT #1, HandWeaponName$(CINT(I!)) | AGREE | 0059B `90 nop` / 0059C `bb 01 00 mov bx, 1` / 0059F `cd 3f b6 CALL RT3F_B6` |
| 005E7 CAT | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | 005E1 `bb 01 00 mov bx, 1` / 005E4 `ba f8 c0 mov dx, 0xc0f8` / 005E7 `cd 3e 1e CALL RT3E_1E` |
| 005ED CAT | INPUT #1, ShipName$, CrewName1$, CrewName2$ | AGREE | 005EA `bb 01 00 mov bx, 1` / 005ED `cd 3f b6 CALL RT3F_B6` |
| 00615 CAT | INPUT #1, CrewName$(CINT(I!)) | AGREE | 00612 `bb 01 00 mov bx, 1` / 00615 `cd 3f b6 CALL RT3F_B6` |
| 006D8 | GOTO L_06F7 | AGREE | 006D8 `e9 1c 00 jmp 0x6f7` |
| 0071C | IF DebugLoad! = 0 THEN GOTO L_0E36 | AGREE | 00716 `be d4 ba mov si, 0xbad4` / 00719 `cd 3f a7 CALL RT3F_A7` / 0071C `75 03 jne 0x721` |
| 00730 | PRINT "Change things? "; | AGREE | 00730 `cd 3f bc CALL RT3F_BC` |
| 007E1 | ChainArg! = 20 | AGREE | 007DB `bf e8 3a mov di, 0x3ae8` / 007DE `be 6c c1 mov si, 0xc16c` / 007E1 `cd 3f 7b CALL RT3F_7B` |
| 00856 | G!(CINT(I! + 9)) = INT(RND * 6 + 3) | AGREE | 00851 `8b df mov bx, di` / 00853 `8b 7e fa mov di, word ptr [bp - 6]` / 00856 `cd 3f 7d CALL RT3F_7D` |
| 00951 | G!(CINT(I! + 7)) = 70 | AGREE | 0094A `81 c7 50 18 add di, 0x1850` / 0094E `be 98 c1 mov si, 0xc198` / 00951 `cd 3f 7b CALL RT3F_7B` |
| 00BEA | G!(CINT(FNIdx(I!, 12))) = INT(RND * 10 + 15) | AGREE | 00BE5 `cd 3d 03 CALL RT3D_03` / 00BE8 `8b fa mov di, dx` / 00BEA `cd 3f 7d CALL RT3F_7D` |
| 00CA4 | G!(CINT(I! + 2)) = INT(RND * 6 + 3) | AGREE | 00CA0 `cd 3d 03 CALL RT3D_03` / 00CA3 `97 xchg di, ax` / 00CA4 `cd 3f 7d CALL RT3F_7D` |
| 00D19 | G!(CINT(FNIdx(I!, 15))) = 25 | AGREE | 00D12 `81 c7 50 18 add di, 0x1850` / 00D16 `be 8c c1 mov si, 0xc18c` / 00D19 `cd 3f 7b CALL RT3F_7B` |
| 00D6D | G!(CINT(FNIdx(I!, 5))) = 100 | AGREE | 00D66 `81 c7 50 18 add di, 0x1850` / 00D6A `be 9e bb mov si, 0xbb9e` / 00D6D `cd 3f 7b CALL RT3F_7B` |
| 00DD5 | N_1CC4! = 999 | AGREE | 00DCF `bf c4 1c mov di, 0x1cc4` / 00DD2 `be d8 c1 mov si, 0xc1d8` / 00DD5 `cd 3f 7b CALL RT3F_7B` |
| 00E0F | G!(CINT(FNIdx(6, 31))) = 0 | AGREE | 00E08 `81 c7 50 18 add di, 0x1850` / 00E0C `be dc c1 mov si, 0xc1dc` / 00E0F `cd 3f 7b CALL RT3F_7B` |
| 00E71 CAT | OPEN Drive$ + "ENCINFO" FOR INPUT AS #1 | AGREE | 00E6C `8b cb mov cx, bx` / 00E6E `bb 01 00 mov bx, 1` / 00E71 `cd 3e 1e CALL RT3E_1E` |
| 00E93 CAT | INPUT #1, GrpName$(CINT(J!)), C1Size!, C2Init!, GrpToHitMod!(CINT(J!)), C4Armor!, GrpSpeed!(CINT(J!)), C6HP!, C7Mood!, C8Hostile!, GrpTactic!(CINT(J!)), GrpPortrait!(CINT(J!)), GrpCol11!(CINT(J!)), GrpValue!(CINT(J!)), GrpStrength!(CINT(J!)), GrpCol14!(CINT(J!)), C15RocketPct!, GrpRocketDmg!(CINT(J!)), C17Rockets!, GrpMeleeDmg!(CINT(J!)), C19FlamePct!, GrpFlameDmg!(CINT(J!)), C21Flames!, C22NextPct!, C23Next1!, C24Next2!, C25Melee!, GrpMeleeRange!(CINT(J!)), GrpAttackVerb!(CINT(J!)) | AGREE | 00E8F `90 nop` / 00E90 `bb 01 00 mov bx, 1` / 00E93 `cd 3f b6 CALL RT3F_B6` |
| 0106D | FOR Col4! = 0 TO PrevGrp! | AGREE | 01067 `be b4 c6 mov si, 0xc6b4` / 0106A `cd 3f 6f CALL RT3F_6F` / 0106D `e9 65 00 jmp 0x10d5` |
| 010D5 | NEXT Col4! | AGREE | 010CF `be b8 c6 mov si, 0xc6b8` / 010D2 `cd 3f 7f CALL RT3F_7F` / 010D5 `bf b8 c6 mov di, 0xc6b8` |
| 011C7 | IF Sp1! <> 0 THEN GOTO L_11F6 | AGREE | 011C1 `be c0 c6 mov si, 0xc6c0` / 011C4 `cd 3f a7 CALL RT3F_A7` / 011C7 `74 03 je 0x11cc` |
| 012C6 | C24Next2! = EncRec! | AGREE | 012C3 `bf 88 c6 mov di, 0xc688` / 012C6 `cd 3f 7b CALL RT3F_7B` |
| 012E4 | GrpSize!(CINT(J!)) = 3 | AGREE | 012E0 `8b fb mov di, bx` / 012E2 `8b f1 mov si, cx` / 012E4 `cd 3f 7b CALL RT3F_7B` |
| 01370 | UnitEnd! = GrpSize!(CINT(J!)) - 1 | AGREE | 0136A `cd 3f 7f CALL RT3F_7F` / 0136D `bf f2 c6 mov di, 0xc6f2` / 01370 `cd 3f 7d CALL RT3F_7D` |
| 01379 | FOR I! = 0 TO UnitEnd! | AGREE | 01373 `be b4 c6 mov si, 0xc6b4` / 01376 `cd 3f 6f CALL RT3F_6F` / 01379 `e9 3c 02 jmp 0x15b8` |
| 0142B | UnitRockets!(CINT(J!) * 5 + CINT(I!)) = 0 | AGREE | 01424 `81 c7 88 c3 add di, 0xc388` / 01428 `be fa c6 mov si, 0xc6fa` / 0142B `cd 3f 7b CALL RT3F_7B` |
| 0142E | GOTO L_14AC | AGREE | 0142E `e9 7b 00 jmp 0x14ac` |
| 01626 | J! = J! + 1 | AGREE | 01622 `87 fe xchg si, di` / 01624 `8b de mov bx, si` / 01626 `cd 3f 7d CALL RT3F_7D` |
| 01647 | GOTO L_0FCF | AGREE | 01647 `e9 85 f9 jmp 0xfcf` |
| 01666 | GOTO L_0E5A | AGREE | 01666 `e9 f1 f7 jmp 0xe5a` |
| 01990 CAT | BLOAD Drive$ + "BIGSH" + STR$(-GrpPortrait!(0)) + ".BAS", &H942E | AGREE | 0198A `cd 3f 55 CALL RT3F_55` / 0198D `ba a0 be mov dx, 0xbea0` / 01990 `cd 3e 1a CALL RT3E_1A` |
| 019BD CAT | BLOAD "BIGSH" + STR$(-GrpPortrait!(0)) + ".EGA", &H8052 | AGREE | 019B7 `cd 3f 55 CALL RT3F_55` / 019BA `ba a0 be mov dx, 0xbea0` / 019BD `cd 3e 1a CALL RT3E_1A` |
| 019E0 CAT | BLOAD Drive$ + "PLBTSH.EGA", &HAC70 | AGREE | 019DA `cd 3f 55 CALL RT3F_55` / 019DD `ba 1a 00 mov dx, 0x1a` / 019E0 `cd 3e 1a CALL RT3E_1A` |
| 019F8 CAT | BLOAD Drive$ + "plbtsh.bas", &HAC70 | AGREE | 019F2 `cd 3f 55 CALL RT3F_55` / 019F5 `ba 1a 00 mov dx, 0x1a` / 019F8 `cd 3e 1a CALL RT3E_1A` |
| 01A96 | PRINT "Squad movement:"; SquadMove!; "squares per turn" | AGREE | 01A96 `cd 3f bc CALL RT3F_BC` |
| 01AB4 | MoveDY!(0) = -1 | AGREE | 01AAE `bf a6 c7 mov di, 0xc7a6` / 01AB1 `be b0 c6 mov si, 0xc6b0` / 01AB4 `cd 3f 7b CALL RT3F_7B` |
| 01AD6 | FOR I! = 0 TO 10 | AGREE | 01AD0 `be 46 bb mov si, 0xbb46` / 01AD3 `cd 3f 6f CALL RT3F_6F` / 01AD6 `e9 1e 00 jmp 0x1af7` |
| 01AF7 | NEXT I! | AGREE | 01AF1 `bf 4e 80 mov di, 0x804e` / 01AF4 `cd 3f 7f CALL RT3F_7F` / 01AF7 `bf 90 ba mov di, 0xba90` |
| 01B5B | NEXT J! | AGREE | 01B55 `be 34 c6 mov si, 0xc634` / 01B58 `cd 3f 7f CALL RT3F_7F` / 01B5B `bf 34 c6 mov di, 0xc634` |
| 01BA1 | NEXT J! | AGREE | 01B9B `be 34 c6 mov si, 0xc634` / 01B9E `cd 3f 7f CALL RT3F_7F` / 01BA1 `bf 34 c6 mov di, 0xc634` |
| 01DD6 | IF G!(CINT(K!)) <> 10 THEN GOTO L_1E03 | AGREE | 01DD0 `bf f4 ba mov di, 0xbaf4` / 01DD3 `cd 3f 9f CALL RT3F_9F` / 01DD6 `74 03 je 0x1ddb` |
| 01F98 | WepType! = FNCrew(M!, 32) | AGREE | 01F92 `e8 14 e7 call 0x6a9` / 01F95 `bf 84 c9 mov di, 0xc984` / 01F98 `cd 3f 7d CALL RT3F_7D` |
| 021C1 | NEXT M! | AGREE | 021BB `be 62 c7 mov si, 0xc762` / 021BE `cd 3f 7f CALL RT3F_7F` / 021C1 `bf 62 c7 mov di, 0xc762` |
| 0225F | G!(CINT(FNIdx(I!, 40))) = 0 | AGREE | 02258 `81 c7 50 18 add di, 0x1850` / 0225C `be 9c c9 mov si, 0xc99c` / 0225F `cd 3f 7b CALL RT3F_7B` |
| 022A8 | G!(CINT(FNIdx(K!, 58))) = FNCrew(K!, 8) * 3 | AGREE | 022A2 `cd 3f 91 CALL RT3F_91` / 022A5 `8b 7e f4 mov di, word ptr [bp - 0xc]` / 022A8 `cd 3f 7d CALL RT3F_7D` |
| 022AB | RETURN   'with FAC = FNCrew(K!, 8) * 3 | AGREE | 022AB `c3 ret` |
| 022E7 | LINE (3, 2)-(3, 5) | AGREE | 022E3 `8b d3 mov dx, bx` / 022E5 `8b ca mov cx, dx` / 022E7 `cd 3e 86 CALL RT3E_86` |
| 023AD | LINE (0, 0)-(319, 199), 2, B | AGREE | 023A7 `bb 02 00 mov bx, 2` / 023AA `b9 ff ff mov cx, 0xffff` / 023AD `cd 3e 86 CALL RT3E_86` |
| 023CD | LINE (5, 5)-(98, 82), 2, B | AGREE | 023C7 `bb 02 00 mov bx, 2` / 023CA `b9 ff ff mov cx, 0xffff` / 023CD `cd 3e 86 CALL RT3E_86` |
| 0250E | LOCATE CINT(I! * 2 + 2), 14 | AGREE | 02508 `cd 3e 42 CALL RT3E_42` / 0250B `bb 0e 00 mov bx, 0xe` / 0250E `cd 3e 44 CALL RT3E_44` |
| 02530 | NEXT I! | AGREE | 0252A `bf 4e 80 mov di, 0x804e` / 0252D `cd 3f 7f CALL RT3F_7F` / 02530 `bf 90 ba mov di, 0xba90` |
| 025AC | GET (8, 88)-(191, 95), HdrSave | AGREE | 025A7 `8b d0 mov dx, ax` / 025A9 `bb 30 80 mov bx, 0x8030` / 025AC `cd 3e 3a CALL RT3E_3A` |
| 0264D | LINE (112, 16)-(191, 79), 0, BF | AGREE | 02647 `ba 01 00 mov dx, 1` / 0264A `b9 ff ff mov cx, 0xffff` / 0264D `cd 3e 86 CALL RT3E_86` |
| 026E1 | PRINT CHR$(CINT(I! + 48)); ">" | AGREE | 026E1 `cd 3f bc CALL RT3F_BC` |
| 02771 | LINE (3, 195)-(316, 196), CINT(BarColor!), BF | AGREE | 0276B `ba 01 00 mov dx, 1` / 0276E `b9 ff ff mov cx, 0xffff` / 02771 `cd 3e 86 CALL RT3E_86` |
| 027D9 | LINE (197, 27)-(314, 28), CINT(BarColor!), BF | AGREE | 027D3 `ba 01 00 mov dx, 1` / 027D6 `b9 ff ff mov cx, 0xffff` / 027D9 `cd 3e 86 CALL RT3E_86` |
| 027FE | LINE (3, 5)-(4, 194), CINT(BarColor!), BF | AGREE | 027F8 `ba 01 00 mov dx, 1` / 027FB `b9 ff ff mov cx, 0xffff` / 027FE `cd 3e 86 CALL RT3E_86` |
| 0290A | GET (200, 32)-(311, 143), HdrSave | AGREE | 02905 `8b d0 mov dx, ax` / 02907 `bb 30 80 mov bx, 0x8030` / 0290A `cd 3e 3a CALL RT3E_3A` |
| 02910 | GOTO L_70F6 | AGREE | 02910 `e9 e3 47 jmp 0x70f6` |
| 02913 | GOSUB SUB_9B06 | AGREE | 02913 `e8 f0 71 call 0x9b06` |
| 0297E | RETURN | AGREE | 0297E `c3 ret` |
| 02A31 | WeaponRec! = WepSlot! * 12 + 788 | AGREE | 02A2B `cd 3f 81 CALL RT3F_81` / 02A2E `bf 4a c9 mov di, 0xc94a` / 02A31 `cd 3f 7d CALL RT3F_7D` |
| 02BBB | RETURN   'with FAC = Reloads! + 48 | AGREE | 02BB5 `cd 3f 6a CALL RT3F_6A` / 02BB8 `cd 3e 79 CALL RT3E_79` / 02BBB `c3 ret` |
| 02BBC | PRINT Prompt$; | AGREE | 02BBC `cd 3f bc CALL RT3F_BC` |
| 02C90 | IF CHR$(13) <> K$ THEN GOTO L_2C6F | AGREE | 02C8A `bb ec c0 mov bx, 0xc0ec` / 02C8D `cd 3f 62 CALL RT3F_62` / 02C90 `75 dd jne 0x2c6f` |
| 02D13 | LOCATE CINT(Half!), 4 | AGREE | 02D0E `8b cb mov cx, bx` / 02D10 `bb 04 00 mov bx, 4` / 02D13 `cd 3e 44 CALL RT3E_44` |
| 02D16 | PRINT CrewName$(CINT(I!)) | AGREE | 02D16 `cd 3f bc CALL RT3F_BC` |
| 02D34 | LOCATE CINT(Half!), 12 | AGREE | 02D2E `cd 3e 42 CALL RT3E_42` / 02D31 `bb 0c 00 mov bx, 0xc` / 02D34 `cd 3e 44 CALL RT3E_44` |
| 02D6B | LOCATE CINT(Half!), 17 | AGREE | 02D65 `cd 3e 42 CALL RT3E_42` / 02D68 `bb 11 00 mov bx, 0x11` / 02D6B `cd 3e 44 CALL RT3E_44` |
| 02E4B | GOTO L_2DBF | AGREE | 02E4B `e9 71 ff jmp 0x2dbf` |
| 02F5E | LINE (8, 176)-(311, 191), 0, BF | AGREE | 02F58 `ba 01 00 mov dx, 1` / 02F5B `b9 ff ff mov cx, 0xffff` / 02F5E `cd 3e 86 CALL RT3E_86` |
| 02FCF | K$ = "" | AGREE | 02FC9 `bb 08 94 mov bx, 0x9408` / 02FCC `ba ec c0 mov dx, 0xc0ec` / 02FCF `cd 3f 61 CALL RT3F_61` |
| 0305B | IF NOT ((LEN(K$) > 0) AND (I! = 8)) THEN GOTO L_3077 | AGREE | 03057 `23 c2 and ax, dx` / 03059 `23 c0 and ax, ax` / 0305B `75 03 jne 0x3060` |
| 0314B | I! = 2600 | AGREE | 03146 `8b fa mov di, dx` / 03148 `be 98 ca mov si, 0xca98` / 0314B `cd 3f 7b CALL RT3F_7B` |
| 03167 | RETURN | AGREE | 03162 `cd 3f 9f CALL RT3F_9F` / 03165 `76 af jbe 0x3116` / 03167 `c3 ret` |
| 03193 | LOCATE 20, 2 | AGREE | 0318D `cd 3e 42 CALL RT3E_42` / 03190 `bb 02 00 mov bx, 2` / 03193 `cd 3e 44 CALL RT3E_44` |
| 032D3 | G!(CINT(FNIdx(M!, 11))) = FNCrew(M!, 1) * 0.5 - 25 | AGREE | 032CD `cd 3f 81 CALL RT3F_81` / 032D0 `8b 7e f0 mov di, word ptr [bp - 0x10]` / 032D3 `cd 3f 7d CALL RT3F_7D` |
| 0342C | G!(CINT(FNIdx(M!, 52))) = ABS(DbgEsper! > 2) | AGREE - N2: `mov dx,0; jbe; dec dx; and dx,dx; jge; neg dx` = -(DbgEsper! > 2) as 0/1; rendered ABS(bool), value-equivalent | 03428 `8b fa mov di, dx` / 0342A `8b de mov bx, si` / 0342C `cd 3f 7d CALL RT3F_7D` |
| 03596 CAT | ON CINT(CommState! + 1) GOTO L_3D65, L_37C5, L_35A0 | AGREE | 03590 `cd 3f 7f CALL RT3F_7F` / 03593 `cd 3f 77 CALL RT3F_77` / 03596 `cd 3f 5e 03 55 3d b5 37 90 .. CALL RT3F_5E n=3 -> 03D65 037C5 035A0` |
| 03665 | FOR I! = 1 TO 6 | AGREE | 0365F `be 4e 80 mov si, 0x804e` / 03662 `cd 3f 6f CALL RT3F_6F` / 03665 `e9 c1 00 jmp 0x3729` |
| 03753 | IF Flag! >= 7 THEN GOTO L_3775 | AGREE | 0374D `be 7c c9 mov si, 0xc97c` / 03750 `cd 3f 9f CALL RT3F_9F` / 03753 `72 03 jb 0x3758` |
| 03758 | PRINT CrewName$(CINT(Flag!)); " translates" | AGREE | 03755 `e9 1d 00 jmp 0x3775` / 03758 `cd 3f bc CALL RT3F_BC` |
| 037BF | GOSUB SUB_2C3C | AGREE | 037B9 `cd 3f 6e CALL RT3F_6E` / 037BC `cd 3e 79 CALL RT3E_79` / 037BF `e8 7a f4 call 0x2c3c` |
| 0384E | PRINT "E-Impersonate Diety" | AGREE | 0384E `cd 3f bc CALL RT3F_BC` |
| 0387C | PRINT "Choose An Approach: (A-F)"; | AGREE | 0387C `cd 3f bc CALL RT3F_BC` |
| 038B1 | Approach! = Cmd! - 1 | AGREE | 038AB `cd 3f 7f CALL RT3F_7F` / 038AE `bf f4 cb mov di, 0xcbf4` / 038B1 `cd 3f 7d CALL RT3F_7D` |
| 03924 | PRINT "C-Surrender" | AGREE | 03924 `cd 3f bc CALL RT3F_BC` |
| 03B65 CAT | ON 1 - (Offer! < -20) - (Offer! < 0) - (Offer! < 20) GOTO L_3B77, L_3B86, L_3B95, L_3BA4 | AGREE | 03B61 `2b d3 sub dx, bx` / 03B63 `8b da mov bx, dx` / 03B65 `cd 3f 5e 04 67 3b 76 3b 85 .. CALL RT3F_5E n=4 -> 03B77 03B86 03B95 03BA4` |
| 03BB0 | GOTO L_40D1 | AGREE | 03BAA `cd 3f 6e CALL RT3F_6E` / 03BAD `cd 3e 79 CALL RT3E_79` / 03BB0 `e9 1e 05 jmp 0x40d1` |
| 03BB9 CAT | ON CINT(Objective!) GOTO L_3BC3, L_3C7A, L_3CC6 | AGREE | 03BB3 `be f8 cb mov si, 0xcbf8` / 03BB6 `cd 3f 75 CALL RT3F_75` / 03BB9 `cd 3f 5e 03 b3 3b 6a 3c b6 .. CALL RT3F_5E n=3 -> 03BC3 03C7A 03CC6` |
| 03BCC | IF Approach! = 3 THEN GOTO L_3BEF | AGREE | 03BC6 `be f4 cb mov si, 0xcbf4` / 03BC9 `cd 3f 9f CALL RT3F_9F` / 03BCC `75 03 jne 0x3bd1` |
| 03BD1 | PRINT "They agree to a truce" | AGREE | 03BCE `e9 1e 00 jmp 0x3bef` / 03BD1 `cd 3f bc CALL RT3F_BC` |
| 03BE3 | NewState! = 2 | AGREE | 03BDD `bf fe cc mov di, 0xccfe` / 03BE0 `be 12 94 mov si, 0x9412` / 03BE3 `cd 3f 7b CALL RT3F_7B` |
| 03C1B | LOCATE 21, 2 | AGREE | 03C15 `cd 3e 42 CALL RT3E_42` / 03C18 `bb 02 00 mov bx, 2` / 03C1B `cd 3e 44 CALL RT3E_44` |
| 03C3F | PRINT "as payment for a truce" | AGREE | 03C3F `cd 3f bc CALL RT3F_BC` |
| 03CDE | Surrendered! = 1 | AGREE | 03CDB `bf 3e c9 mov di, 0xc93e` / 03CDE `cd 3f 7b CALL RT3F_7B` |
| 03D7D | GrpMax2! = NGroups! - 1 | AGREE | 03D77 `cd 3f 7f CALL RT3F_7F` / 03D7A `bf 6a cd mov di, 0xcd6a` / 03D7D `cd 3f 7d CALL RT3F_7D` |
| 03DFD | FOR J! = 0 TO UnitMax2! | AGREE | 03DF7 `be b4 c6 mov si, 0xc6b4` / 03DFA `cd 3f 6f CALL RT3F_6F` / 03DFD `e9 44 00 jmp 0x3e44` |
| 03E74 | GrpState!(CINT(I!)) = 1 | AGREE | 03E6E `81 c6 60 c5 add si, 0xc560` / 03E72 `87 fe xchg si, di` / 03E74 `cd 3f 7b CALL RT3F_7B` |
| 03EDC | GrpState!(CINT(I!)) = 3 | AGREE | 03ED7 `8b fb mov di, bx` / 03ED9 `be 56 bb mov si, 0xbb56` / 03EDC `cd 3f 7b CALL RT3F_7B` |
| 03F32 | EnemyStr! = GrpStrength!(0) + Flag! * 5 | AGREE | 03F2C `cd 3f 83 CALL RT3F_83` / 03F2F `bf 48 cc mov di, 0xcc48` / 03F32 `cd 3f 7d CALL RT3F_7D` |
| 03F5A | EnemyStr! = ((GrpStrength!(CINT(I!))) * Flag!) * 0.125 + EnemyStr! | AGREE | 03F54 `bf 48 cc mov di, 0xcc48` / 03F57 `cd 3f 81 CALL RT3F_81` / 03F5A `cd 3f 7d CALL RT3F_7D` |
| 03F9E | IF (FNOffMap(5) = 0) THEN GOTO L_3FB8 | AGREE | 03F99 `cd 3f 1f CALL RT3F_1F` / 03F9C `23 db and bx, bx` / 03F9E `75 03 jne 0x3fa3` |
| 0410B | GOTO L_4554 | AGREE | 0410B `e9 46 04 jmp 0x4554` |
| 0415A | PRINT "Credits Gained:"; CreditsGained! | AGREE | 0415A `cd 3f bc CALL RT3F_BC` |
| 04213 | PRINT "Group "; CHR$(CINT(I! + 65)); ":"; GrpName$(CINT(I!)); "(s)" | AGREE | 0420D `cd 3f 6e CALL RT3F_6E` / 04210 `cd 3e 79 CALL RT3E_79` / 04213 `cd 3f bc CALL RT3F_BC` |
| 04290 | IF GrpState!(CINT(I!)) <> 2 THEN GOTO L_42A7 | AGREE | 0428A `bf 12 94 mov di, 0x9412` / 0428D `cd 3f 9f CALL RT3F_9F` / 04290 `74 03 je 0x4295` |
| 0433B CAT | CHAIN Drive$ + "SPACE.STR" | AGREE | 04335 `b8 04 94 mov ax, 0x9404` / 04338 `cd 3f 55 CALL RT3F_55` / 0433B `cd 3e 0e CALL RT3E_0E` |
| 0434A CAT | CHAIN Drive$ + "INSIDE.EXE" | AGREE | 04344 `b8 04 94 mov ax, 0x9404` / 04347 `cd 3f 55 CALL RT3F_55` / 0434A `cd 3e 0e CALL RT3E_0E` |
| 043C8 | KillPtr! = TowPrev! | AGREE | 043C2 `bf 2c 1d mov di, 0x1d2c` / 043C5 `be 28 ce mov si, 0xce28` / 043C8 `cd 3f 7b CALL RT3F_7B` |
| 04413 | IF MissionType! - 10 <> LastEnemyType! THEN GOTO L_441B | AGREE | 0440D `bf ac 3b mov di, 0x3bac` / 04410 `cd 3f a1 CALL RT3F_A1` / 04413 `74 03 je 0x4418` |
| 04418 | GOSUB SUB_A8B8 | AGREE | 04415 `e9 03 00 jmp 0x441b` / 04418 `e8 9d 64 call 0xa8b8` |
| 0446C | IF TowLinkCond! <> 2 THEN GOTO L_447E | AGREE | 04466 `be 68 18 mov si, 0x1868` / 04469 `cd 3f 9f CALL RT3F_9F` / 0446C `74 03 je 0x4471` |
| 04647 | IF NOT ((FNCrew(K!, 40) = 0) AND (Atmos! = 0)) THEN GOTO L_46AF | AGREE | 04642 `23 5e f2 and bx, word ptr [bp - 0xe]` / 04645 `23 db and bx, bx` / 04647 `75 03 jne 0x464c` |
| 04772 | PRINT "A-Switch Weapons" | AGREE | 04772 `cd 3f bc CALL RT3F_BC` |
| 0479F | LOCATE 24, 2 | AGREE | 0479A `cd 3e 42 CALL RT3E_42` / 0479D `8b da mov bx, dx` / 0479F `cd 3e 44 CALL RT3E_44` |
| 047A2 | PRINT "C-Time Delay"; | AGREE | 047A2 `cd 3f bc CALL RT3F_BC` |
| 047E2 | DY! = 0 | AGREE | 047DF `bf de ce mov di, 0xcede` / 047E2 `cd 3f 7b CALL RT3F_7B` |
| 047E5 | GOSUB SUB_2E4E | AGREE | 047E5 `e8 66 e6 call 0x2e4e` |
| 047EE CAT | ON CINT(Cmd!) GOSUB L_47C4, L_4F47, L_47C4, L_47C4, L_4F53, L_47C4, L_4F6B, L_47C4, L_47C4, L_4F5F, L_47C4, L_4FCC, L_4FCB, L_5438 | AGREE | 047E8 `be 52 ca mov si, 0xca52` / 047EB `cd 3f 75 CALL RT3F_75` / 047EE `cd 3f 5d 0e b4 47 37 4f b4 .. CALL RT3F_5D n=14 -> 047C4 04F47 047C4 047C4 04F53 047C4 04F6B 047C4 047C4 04F5F 047C4 04FCC 04FCB 05438` |
| 04832 | GOSUB SUB_2F1E | AGREE | 0482F `e9 ab fe jmp 0x46dd` / 04832 `e8 e9 e6 call 0x2f1e` |
| 04980 | BestMove! = 4 | AGREE | 0497A `bf ea ce mov di, 0xceea` / 0497D `be 94 ba mov si, 0xba94` / 04980 `cd 3f 7b CALL RT3F_7B` |
| 04AC4 | MoveScore!(CINT(Move!)) = FNDist(6, J!) | AGREE | 04ABE `e8 de cc call 0x179f` / 04AC1 `8b 7e f4 mov di, word ptr [bp - 0xc]` / 04AC4 `cd 3f 7d CALL RT3F_7D` |
| 04E3A | GOTO L_410E | AGREE | 04E3A `e9 d1 f2 jmp 0x410e` |
| 04E77 | GOSUB SUB_4EF7 | AGREE | 04E77 `e8 7d 00 call 0x4ef7` |
| 04F7F | GrpX!(5) = GrpX!(5) + DX! | AGREE | 04F7A `cd 3f 7f CALL RT3F_7F` / 04F7D `8b fe mov di, si` / 04F7F `cd 3f 7d CALL RT3F_7D` |
| 04F96 | Moved! = 1 | AGREE | 04F90 `bf 7c ce mov di, 0xce7c` / 04F93 `be 4e 80 mov si, 0x804e` / 04F96 `cd 3f 7b CALL RT3F_7B` |
| 04FB3 | GrpX!(5) = OldX! | AGREE | 04FAD `bf 2c c5 mov di, 0xc52c` / 04FB0 `be d2 ce mov si, 0xced2` / 04FB3 `cd 3f 7b CALL RT3F_7B` |
| 04FC5 | Moved! = 0 | AGREE | 04FBF `bf 7c ce mov di, 0xce7c` / 04FC2 `be 9c c9 mov si, 0xc99c` / 04FC5 `cd 3f 7b CALL RT3F_7B` |
| 04FCB | RETURN | AGREE | 04FCB `c3 ret` |
| 052ED | G!(CINT(FNIdx(M!, 37))) = 3 | AGREE | 052E6 `81 c7 50 18 add di, 0x1850` / 052EA `be 56 bb mov si, 0xbb56` / 052ED `cd 3f 7b CALL RT3F_7B` |
| 05341 | Ammo2! = 0 | AGREE | 0533B `e9 09 00 jmp 0x5347` / 0533E `be dc c1 mov si, 0xc1dc` / 05341 `cd 3f 7b CALL RT3F_7B` |
| 05380 | Reloads2! = G!(CINT(G!(CINT(WeaponRec!)) + 500)) | AGREE | 05379 `81 c6 50 18 add si, 0x1850` / 0537D `bf a2 cf mov di, 0xcfa2` / 05380 `cd 3f 7b CALL RT3F_7B` |
| 053E7 | IF G!(CINT(WeaponRec! + 3)) >= 0 THEN GOTO L_53FB | AGREE | 053E0 `81 c6 50 18 add si, 0x1850` / 053E4 `cd 3f a7 CALL RT3F_A7` / 053E7 `72 03 jb 0x53ec` |
| 053EC | PRINT "*"; | AGREE | 053E9 `e9 0f 00 jmp 0x53fb` / 053EC `cd 3f bc CALL RT3F_BC` |
| 054BD | Delay! = InputVal% | AGREE | 054B7 `cd 3f 57 CALL RT3F_57` / 054BA `bf b0 19 mov di, 0x19b0` / 054BD `cd 3f 7d CALL RT3F_7D` |
| 0560C | IF G!(CINT(FNIdx(K!, 58))) >= 0 THEN GOTO L_5646 | AGREE | 05605 `81 c6 50 18 add si, 0x1850` / 05609 `cd 3f a7 CALL RT3F_A7` / 0560C `72 03 jb 0x5611` |
| 05941 | IF NOT ((Flag! = 0) AND (WepSlot! = 0)) THEN GOTO L_5952 | AGREE | 0593D `23 d3 and dx, bx` / 0593F `23 d2 and dx, dx` / 05941 `75 03 jne 0x5946` |
| 05A6E | MemberCmd! = 0 | AGREE | 05A68 `bf 4a d0 mov di, 0xd04a` / 05A6B `be 46 bb mov si, 0xbb46` / 05A6E `cd 3f 7b CALL RT3F_7B` |
| 05BA8 | MemberCmd! = FNCrew(K!, 37) | AGREE | 05BA2 `e8 04 ab call 0x6a9` / 05BA5 `bf 4a d0 mov di, 0xd04a` / 05BA8 `cd 3f 7d CALL RT3F_7D` |
| 05D3A | TgtGrp! = InRangeGrp! | AGREE | 05D34 `bf 46 d0 mov di, 0xd046` / 05D37 `be 56 d0 mov si, 0xd056` / 05D3A `cd 3f 7b CALL RT3F_7B` |
| 05F4E CAT | ON CINT(Cmd!) GOSUB L_5F83, L_5F83, L_5F83, L_5F83, L_6071, L_61A6, L_5F04, L_5F04, L_5F04, L_5F04, L_5F04, L_61CB, L_61E0, L_5F04, L_5F04, L_5F04, L_5F04, L_6229, L_5F04, L_5F04, L_5F04, L_5F04, L_624E | AGREE | 05F48 `be 52 ca mov si, 0xca52` / 05F4B `cd 3f 75 CALL RT3F_75` / 05F4E `cd 3f 5d 17 73 5f 73 5f 73 .. CALL RT3F_5D n=23 -> 05F83 05F83 05F83 05F83 06071 061A6 05F04 05F04 05F04 05F04 05F04 061CB 061E0 05F04 05F04 05F04 05F04 06229 05F04 05F04 05F04 05F04 0624E` |
| 05F80 | GOTO L_5BF9 | AGREE | 05F80 `e9 76 fc jmp 0x5bf9` |
| 05FC8 | RETURN   'with FAC = PickGrp! | AGREE | 05FC5 `e9 01 00 jmp 0x5fc9` / 05FC8 `c3 ret` |
| 060ED | MemberCmd! = 8 | AGREE | 060E7 `bf 4a d0 mov di, 0xd04a` / 060EA `be 7c c1 mov si, 0xc17c` / 060ED `cd 3f 7b CALL RT3F_7B` |
| 0624A | MemberCmd! = 7 | AGREE | 06244 `bf 4a d0 mov di, 0xd04a` / 06247 `be 94 c1 mov si, 0xc194` / 0624A `cd 3f 7b CALL RT3F_7B` |
| 062C8 | GOTO L_5BF9 | AGREE | 062C8 `e9 2e f9 jmp 0x5bf9` |
| 064C4 | TerrainMod! = 105 - (MapType! * 35) | AGREE | 064BF `cd 3f 9b CALL RT3F_9B` / 064C2 `8b f9 mov di, cx` / 064C4 `cd 3f 7d CALL RT3F_7D` |
| 064DD | GrpMax8! = NGroups! - 1 | AGREE | 064D7 `cd 3f 7f CALL RT3F_7F` / 064DA `bf 40 d1 mov di, 0xd140` / 064DD `cd 3f 7d CALL RT3F_7D` |
| 06503 | UnitMax5! = GrpSize!(CINT(I!)) - 1 | AGREE | 064FD `cd 3f 7f CALL RT3F_7F` / 06500 `bf 44 d1 mov di, 0xd144` / 06503 `cd 3f 7d CALL RT3F_7D` |
| 0659D | InitLevel! = 0 | AGREE | 06598 `8b fe mov di, si` / 0659A `be 46 bb mov si, 0xbb46` / 0659D `cd 3f 7b CALL RT3F_7B` |
| 06823 | GOSUB SUB_2EFC | AGREE | 06820 `e9 3e 00 jmp 0x6861` / 06823 `e8 d6 c6 call 0x2efc` |
| 06B7B | PRINT CrewName$(CINT(M!)); | AGREE | 06B7B `cd 3f bc CALL RT3F_BC` |
| 06C86 | Hits! = 0 | AGREE | 06C80 `bf a0 d1 mov di, 0xd1a0` / 06C83 `be b4 c6 mov si, 0xc6b4` / 06C86 `cd 3f 7b CALL RT3F_7B` |
| 06E3B | IF DamageSum! <= 0 THEN GOTO L_6E5A | AGREE | 06E35 `be ac d1 mov si, 0xd1ac` / 06E38 `cd 3f a7 CALL RT3F_A7` / 06E3B `77 03 ja 0x6e40` |
| 070DD | SurpriseCur! = 0 | AGREE | 070D7 `bf ec ba mov di, 0xbaec` / 070DA `be dc c1 mov si, 0xc1dc` / 070DD `cd 3f 7b CALL RT3F_7B` |
| 0714E | GOTO L_3570 | AGREE | 0714E `e9 1f c4 jmp 0x3570` |
| 071D3 | Dist2! = FNDist(AtkGrp!, 5) | AGREE | 071CD `e8 cf a5 call 0x179f` / 071D0 `bf 0e cf mov di, 0xcf0e` / 071D3 `cd 3f 7d CALL RT3F_7D` |
| 0734D | NewWep! = 1 | AGREE | 07348 `8b fa mov di, dx` / 0734A `be 4e 80 mov si, 0x804e` / 0734D `cd 3f 7b CALL RT3F_7B` |
| 07577 | WepReach! = GrpMeleeRange!(CINT(Grp!)) | AGREE | 07572 `8b f2 mov si, dx` / 07574 `bf 0e c7 mov di, 0xc70e` / 07577 `cd 3f 7b CALL RT3F_7B` |
| 0760F | WepReach! = 6.7 | AGREE | 07609 `bf 0e c7 mov di, 0xc70e` / 0760C `be a0 d2 mov si, 0xd2a0` / 0760F `cd 3f 7b CALL RT3F_7B` |
| 07750 | HitPct! = 50 - (INT(Dist2! / WepReach!) * 25) - FNCrew(M!, 11) - N_D130! + N_D2C4! | AGREE | 0774A `cd 3f 81 CALL RT3F_81` / 0774D `bf 70 d1 mov di, 0xd170` / 07750 `cd 3f 7d CALL RT3F_7D` |
| 07764 | MapType! = FNMap(Grp!) | AGREE | 0775E `e8 14 a1 call 0x1875` / 07761 `bf e0 c1 mov di, 0xc1e0` / 07764 `cd 3f 7d CALL RT3F_7D` |
| 0787B CAT | ON CINT(NewWep! + 1) GOSUB L_9107, L_8CD2, L_8BF2 | AGREE | 07875 `cd 3f 7f CALL RT3F_7F` / 07878 `cd 3f 77 CALL RT3F_77` / 0787B `cd 3f 5d 03 f7 90 c2 8c e2 .. CALL RT3F_5D n=3 -> 09107 08CD2 08BF2` |
| 078DE | U! = 1 - U! | AGREE | 078D8 `be 4e 80 mov si, 0x804e` / 078DB `cd 3f 97 CALL RT3F_97` / 078DE `cd 3f 7d CALL RT3F_7D` |
| 078FF | NTargets! = INT((RND * NewWep!) * 2 + 1) | AGREE | 078FA `8b df mov bx, di` / 078FC `bf e6 d2 mov di, 0xd2e6` / 078FF `cd 3f 7d CALL RT3F_7D` |
| 079C5 | Damage! = INT((RND ^ 0.5) * Damage! - FNCrew(M!, 48)) | AGREE | 079BF `cd 3d 03 CALL RT3D_03` / 079C2 `bf 82 d2 mov di, 0xd282` / 079C5 `cd 3f 7d CALL RT3F_7D` |
| 079E2 | PRINT CrewName$(CINT(M!)); "'s armor absorbs the damage." | AGREE | 079DF `e9 20 00 jmp 0x7a02` / 079E2 `cd 3f bc CALL RT3F_BC` |
| 07A02 | PRINT CrewName$(CINT(M!)); " takes"; INT(Damage!); "points of damage." | AGREE | 07A02 `cd 3f bc CALL RT3F_BC` |
| 07B4B | NEXT K! | AGREE | 07B45 `be 42 c9 mov si, 0xc942` / 07B48 `cd 3f 7f CALL RT3F_7F` / 07B4B `bf 42 c9 mov di, 0xc942` |
| 07BDE CAT | ON CINT(INT(RND * 8 + 1)) GOSUB L_7C1D, L_7CB1, L_7D6D, L_7D6D, L_7D6D, L_7DF1, L_7DF1, L_7DF1 | AGREE | 07BD8 `cd 3d 03 CALL RT3D_03` / 07BDB `cd 3f 77 CALL RT3F_77` / 07BDE `cd 3f 5d 08 0d 7c a1 7c 5d .. CALL RT3F_5D n=8 -> 07C1D 07CB1 07D6D 07D6D 07D6D 07DF1 07DF1 07DF1` |
| 07CD1 | RETURN   'with FAC = FNCrew(M!, 45) | AGREE | 07CCE `e9 01 00 jmp 0x7cd2` / 07CD1 `c3 ret` |
| 07E86 | G!(CINT(FNIdx(M!, 32))) = 0 | AGREE | 07E7F `81 c7 50 18 add di, 0x1850` / 07E83 `be 46 bb mov si, 0xbb46` / 07E86 `cd 3f 7b CALL RT3F_7B` |
| 07E89 | RETURN   'with FAC = FNIdx(M!, 32) | AGREE | 07E89 `c3 ret` |
| 07EB3 | GOSUB SUB_2C93 | AGREE | 07EB3 `e8 dd ad call 0x2c93` |
| 07ED9 | LOCATE CINT(M! + 12), 12 | AGREE | 07ED3 `cd 3e 42 CALL RT3E_42` / 07ED6 `bb 0c 00 mov bx, 0xc` / 07ED9 `cd 3e 44 CALL RT3E_44` |
| 07FA0 | FOR I! = 1 TO PauseN3! | AGREE | 07F9A `be 4e 80 mov si, 0x804e` / 07F9D `cd 3f 6f CALL RT3F_6F` / 07FA0 `e9 0d 00 jmp 0x7fb0` |
| 07FE2 | FromX! = (GrpX!(CINT(AtkGrp!))) * 8 - 5 | AGREE | 07FDD `8b d7 mov dx, di` / 07FDF `bf f6 d3 mov di, 0xd3f6` / 07FE2 `cd 3f 7d CALL RT3F_7D` |
| 07FF7 | FromY! = (GrpY!(CINT(AtkGrp!))) * 8 - 5 | AGREE | 07FF1 `cd 3f 81 CALL RT3F_81` / 07FF4 `bf fa d3 mov di, 0xd3fa` / 07FF7 `cd 3f 7d CALL RT3F_7D` |
| 08115 | EdgeT2! = (EdgeY! - FromY!) / DY! | AGREE | 0810F `cd 3f 89 CALL RT3F_89` / 08112 `bf 26 d4 mov di, 0xd426` / 08115 `cd 3f 7d CALL RT3F_7D` |
| 081E7 | Row! = DY! * PStep! | AGREE | 081E1 `cd 3f 8f CALL RT3F_8F` / 081E4 `bf 7e ca mov di, 0xca7e` / 081E7 `cd 3f 7d CALL RT3F_7D` |
| 08206 CAT | ON CINT(WepType!) GOSUB L_8691, L_8691, L_87E4, L_8906, SUB_8B7C, L_8BF2, L_91F0, L_8DF7, L_8CD2, L_8CD2, L_8CD2, L_9107 | AGREE | 08200 `be 84 c9 mov si, 0xc984` / 08203 `cd 3f 75 CALL RT3F_75` / 08206 `cd 3f 5d 0c 81 86 81 86 d4 .. CALL RT3F_5D n=12 -> 08691 08691 087E4 08906 08B7C 08BF2 091F0 08DF7 08CD2 08CD2 08CD2 09107` |
| 082B8 | NTargets! = INT((RND ^ 0.7) * (GrpSize!(CINT(Grp!))) + 1) | AGREE | 082B3 `8b df mov bx, di` / 082B5 `bf e6 d2 mov di, 0xd2e6` / 082B8 `cd 3f 7d CALL RT3F_7D` |
| 084A0 CAT | ON CINT(INT(RND * 8) + 1) GOSUB L_84DC, L_850F, L_8535, L_855B, L_8581, L_85BB, L_85F5, L_8632 | AGREE | 0849A `cd 3f 81 CALL RT3F_81` / 0849D `cd 3f 77 CALL RT3F_77` / 084A0 `cd 3f 5d 08 cc 84 ff 84 25 .. CALL RT3F_5D n=8 -> 084DC 0850F 08535 0855B 08581 085BB 085F5 08632` |
| 087C7 | FOR StepI! = 1 TO StepN! | AGREE | 087C1 `be 4e 80 mov si, 0x804e` / 087C4 `cd 3f 6f CALL RT3F_6F` / 087C7 `e9 09 00 jmp 0x87d3` |
| 08902 | SOUND 7947, 0.03 | AGREE | 088FD `bb ff ff mov bx, 0xffff` / 08900 `8b d3 mov dx, bx` / 08902 `cd 3e 5f CALL RT3E_5F` |
| 0896A | LINE (FromX!, FromY!)-(ToX!, ToY!), 2, -13018 | AGREE (value) - rendering note N1: style word 0xCD26 printed as a third positional argument `2, -13018`; BASIC syntax is `2, , &HCD26` (the empty slot is the B/BF flag) | 08964 `bb 02 00 mov bx, 2` / 08967 `b9 26 cd mov cx, 0xcd26` / 0896A `cd 3e 86 CALL RT3E_86` |
| 08B7C | GOTO L_8906 | AGREE | 08B7C `e9 87 fd jmp 0x8906` |
| 08C67 | LINE (FromX!, FromY!)-(RND * 10 + ToX! - 4, RND * 10 + ToY! - 4), CINT(RND * 2 + FlameCol!) | AGREE | 08C62 `cd 3f 1b CALL RT3F_1B` / 08C65 `8b d0 mov dx, ax` / 08C67 `cd 3e 86 CALL RT3E_86` |
| 08C76 | NEXT I! | AGREE | 08C70 `be 90 ba mov si, 0xba90` / 08C73 `cd 3f 7f CALL RT3F_7F` / 08C76 `bf 90 ba mov di, 0xba90` |
| 08D0E | PUT (ToX!, ToY!), Burst1, XOR | AGREE | 08D08 `bb 60 b5 mov bx, 0xb560` / 08D0B `ba 04 00 mov dx, 4` / 08D0E `cd 3e 58 CALL RT3E_58` |
| 08D76 | PUT (ToX!, ToY!), Burst2, XOR | AGREE | 08D70 `bb 84 b6 mov bx, 0xb684` / 08D73 `ba 04 00 mov dx, 4` / 08D76 `cd 3e 58 CALL RT3E_58` |
| 08D93 | RETURN | AGREE | 08D93 `c3 ret` |
| 08E03 | Arc! = 8 | AGREE | 08DFD `bf 96 d4 mov di, 0xd496` / 08E00 `be 7c c1 mov si, 0xc17c` / 08E03 `cd 3f 7b CALL RT3F_7B` |
| 08FD2 | GOSUB SUB_90A3 | AGREE | 08FD2 `e8 ce 00 call 0x90a3` |
| 08FEC | GOSUB SUB_90A3 | AGREE | 08FEC `e8 b4 00 call 0x90a3` |
| 0903A | GOSUB SUB_87B2 | AGREE | 0903A `e8 75 f7 call 0x87b2` |
| 090AB | IF (SndDur! = 0) THEN GOTO L_9106 | AGREE | 090A6 `cd 3f 1d CALL RT3F_1D` / 090A9 `23 db and bx, bx` / 090AB `75 03 jne 0x90b0` |
| 09624 | IF Tmp! >= 0 THEN GOTO L_9632 | AGREE | 0961F `8b f2 mov si, dx` / 09621 `cd 3f a7 CALL RT3F_A7` / 09624 `72 03 jb 0x9629` |
| 09747 | NEXT J! | AGREE | 09741 `bf 4e 80 mov di, 0x804e` / 09744 `cd 3f 7f CALL RT3F_7F` / 09747 `bf 34 c6 mov di, 0xc634` |
| 09993 CAT | ON Map%(CINT(I!) + CINT(J!) * 9) GOTO L_999F, L_99B9, L_99F9, L_9A13 | AGREE | 0998D `d1 e7 shl di, 1` / 0998F `8b 9d ca bb mov bx, word ptr [di - 0x4436]` / 09993 `cd 3f 5e 04 8f 99 a9 99 e9 .. CALL RT3F_5E n=4 -> 0999F 099B9 099F9 09A13` |
| 09B0F | IF UseEGA! = 1 THEN GOTO L_9D41 | AGREE | 09B09 `be b4 19 mov si, 0x19b4` / 09B0C `cd 3f 9f CALL RT3F_9F` / 09B0F `75 03 jne 0x9b14` |
| 09BD3 | PRINT CHR$(CINT(PortGroup! + 65)) | AGREE | 09BD3 `cd 3f bc CALL RT3F_BC` |
| 09C1D | LOCATE 2, CINT(7.5 - ((LEN(GrpName1$(CINT(PortGroup!)))) * 0.5)) | AGREE | 09C18 `8b c6 mov ax, si` / 09C1A `cd 3f 77 CALL RT3F_77` / 09C1D `cd 3e 44 CALL RT3E_44` |
| 09CAA CAT | ON PortraitCGA(CINT(FramePos!)) GOTO L_9CB8, L_9CD1, L_9CEA, L_9D03, L_9D1C | AGREE | 09CA4 `d1 e7 shl di, 1` / 09CA6 `8b 9d 2e 94 mov bx, word ptr [di - 0x6bd2]` / 09CAA `cd 3f 5e 05 a8 9c c1 9c da .. CALL RT3F_5E n=5 -> 09CB8 09CD1 09CEA 09D03 09D1C` |
| 09D00 | GOTO L_9D32 | AGREE | 09D00 `e9 2f 00 jmp 0x9d32` |
| 09EC1 CAT | ON PortraitEGA(CINT(FramePos!)) GOSUB L_9F02, L_9F19, L_9F38, L_9F57 | AGREE | 09EBB `d1 e7 shl di, 1` / 09EBD `8b 9d 52 80 mov bx, word ptr [di - 0x7fae]` / 09EC1 `cd 3f 5d 04 f2 9e 09 9f 28 .. CALL RT3F_5D n=4 -> 09F02 09F19 09F38 09F57` |
| 09FCC | TgtGrp! = UnitWeapon!(CINT(Unit!) + CINT(Grp!) * 5) + TgtGrp! | AGREE | 09FC7 `cd 3f 7f CALL RT3F_7F` / 09FCA `8b de mov bx, si` / 09FCC `cd 3f 7d CALL RT3F_7D` |
| 0A021 CAT | ON CINT(TgtGrp!) GOTO L_A055, L_A06D, L_A03D, L_A085, L_A09D, L_A0B5, L_A0E5, L_A0FD, L_A0CD, L_A115, L_A12D, L_A145 | AGREE - the selector is the variable the decode calls TgtGrp! (0xD046) reused as the sprite case (names.json _why says so) | 0A01B `be 46 d0 mov si, 0xd046` / 0A01E `cd 3f 75 CALL RT3F_75` / 0A021 `cd 3f 5e 0c 45 a0 5d a0 2d .. CALL RT3F_5E n=12 -> 0A055 0A06D 0A03D 0A085 0A09D 0A0B5 0A0E5 0A0FD 0A0CD 0A115 0A12D 0A145` |
| 0A051 | PUT (PX!, PY!), UnitSprite0, PSET | AGREE | 0A04B `bb 70 ac mov bx, 0xac70` / 0A04E `ba 03 00 mov dx, 3` / 0A051 `cd 3e 58 CALL RT3E_58` |
| 0A081 | PUT (PX!, PY!), UnitSprite2, PSET | AGREE | 0A07B `bb 78 ad mov bx, 0xad78` / 0A07E `ba 03 00 mov dx, 3` / 0A081 `cd 3e 58 CALL RT3E_58` |
| 0A0F9 | PUT (PX!, PY!), UnitSprite1, PRESET | AGREE | 0A0F3 `bb f4 ac mov bx, 0xacf4` / 0A0F6 `ba 02 00 mov dx, 2` / 0A0F9 `cd 3e 58 CALL RT3E_58` |
| 0A12C | RETURN | AGREE | 0A12C `c3 ret` |
| 0A1AE | BoxY0! = Grp! * 16 + 16 | AGREE | 0A1A8 `cd 3f 81 CALL RT3F_81` / 0A1AB `bf 2a d5 mov di, 0xd52a` / 0A1AE `cd 3f 7d CALL RT3F_7D` |
| 0A237 | SOUND CINT(3300 - I!), (I! * SndDur!) / 12000 | AGREE | 0A232 `bb ff ff mov bx, 0xffff` / 0A235 `8b d3 mov dx, bx` / 0A237 `cd 3e 5f CALL RT3E_5F` |
| 0A33B | BoxY0! = FirstTgt! * 8 + 88 | AGREE | 0A335 `cd 3f 81 CALL RT3F_81` / 0A338 `bf 2a d5 mov di, 0xd52a` / 0A33B `cd 3f 7d CALL RT3F_7D` |
| 0A367 | PUT (BoxX0!, BoxY0!), BoxSave, PSET   'dynamic array (descriptor) | AGREE | 0A361 `bb 44 80 mov bx, 0x8044` / 0A364 `ba 03 ff mov dx, 0xff03` / 0A367 `cd 3e 58 CALL RT3E_58` |
| 0A36A | RETURN | AGREE | 0A36A `c3 ret` |
| 0A58F | SOUND CINT((I! + K!) * 1000), (K! * SndDur!) / 5 | AGREE | 0A58A `bb ff ff mov bx, 0xffff` / 0A58D `8b d3 mov dx, bx` / 0A58F `cd 3e 5f CALL RT3E_5F` |
| 0A5F8 | IF MemberCmd! = 9 THEN GOTO L_A751 | AGREE | 0A5F2 `be 4a d0 mov si, 0xd04a` / 0A5F5 `cd 3f 9f CALL RT3F_9F` / 0A5F8 `75 03 jne 0xa5fd` |
| 0A69D | UnitHP!(CINT(Grp!) * 5 + CINT(FirstTgt!)) = UnitHP!(CINT(Grp!) * 5 + CINT(FirstTgt!)) - Damage! | AGREE | 0A698 `cd 3f 97 CALL RT3F_97` / 0A69B `8b f9 mov di, cx` / 0A69D `cd 3f 7d CALL RT3F_7D` |
| 0A728 | PauseN4! = DelayUnits! * 0.5 | AGREE | 0A722 `cd 3f 8f CALL RT3F_8F` / 0A725 `bf a4 d5 mov di, 0xd5a4` / 0A728 `cd 3f 7d CALL RT3F_7D` |
| 0A731 | FOR I! = 1 TO PauseN4! | AGREE | 0A72B `be 4e 80 mov si, 0x804e` / 0A72E `cd 3f 6f CALL RT3F_6F` / 0A731 `e9 0c 00 jmp 0xa740` |
| 0A734 | GOSUB SUB_2913 | AGREE | 0A734 `e8 dc 81 call 0x2913` |
| 0A740 | NEXT I! | AGREE | 0A73A `be 90 ba mov si, 0xba90` / 0A73D `cd 3f 7f CALL RT3F_7F` / 0A740 `bf 90 ba mov di, 0xba90` |
