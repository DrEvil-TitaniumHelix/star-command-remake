# STARTUP: first-draft BASIC-style pseudocode

Evidence: `decode/listings/STARTUP.lst`, `decode/data/MODULE_CONSTANTS.md` (STARTUP.EXE section), and `decode/brun30/RT_LEDGER.md` read 2026-10-15. This is a conservative first draft for the verifying lane, not a decode-gate declaration.

Labels are listing/code offsets. Register temporaries deliberately retain compiler plumbing around unresolved calls. `N(address)` is a four-byte MBF single; `S(address)` is a string descriptor; MEMORY is an untyped array address. Address names carry H confidence for identity, no inferred gameplay meaning. Constants are substituted only where the register provenance is locally known. Register arguments on unresolved calls are the known entry values, otherwise the live register symbol; other runtime clobbers remain unknown. CompareLeft/Right model the immediately preceding compare/test flags; intervening MOV does not change flags. ZF/CF/SF/OF retain the x86 flags from the annotated producing operation; for unresolved runtimes their values remain unknown. Arithmetic, bit operations and comparisons update those flags as on the source CPU. Signed branches use SF/OF. All unannotated supported numeric operations follow H ledger entries. LOCATE is H; PRINT grouping M/H as in ledger.

The listing extends into metadata. Executable-path transcription stops at &H0EF5 (exclusive); later bytes are not claimed as executable. B7 calls consume candidate inline bytes 01 04; the dispatch payload at 0A17..0A21 is preserved explicitly. Tail 0EF5..0EFF is unreachable from the preceding unconditional GOTO and remains unidentified padding/data.

## Flow and screens

0040..0660: music initialization, title BLOAD/PUT, repeated file/array initialization and LOGO load. 0663..07FD: skippable image sequence and timed/key polling subroutine. 07FE..09EC: graphics frame, logo, version/copyright and five-option menu. 0A00: menu input/dispatch (runtime table unresolved). 0A94: play path, shared values and STARPORT chain. 0B0A: two new-game confirmation screens; 0B8E: waiting message and shared-data reset. 0CB9: Y/N polling. 0D2F/0D81/0DEF: drive, sound and graphics option paths. 0E4B: palette helper. 0E7F: music queue helper. Exact timer, input, dispatch and arithmetic semantics remain unknown where shown below.

The drive-option text array uses DS:D34C/50/54 (hard disk, one floppy, two floppies); sound text uses D3EA/EE; graphics text uses D3A6/AA. Confidence M from 0621..065D source-literal/destination pairs and menu indexing at 094C..09B8. N_D436! is the working drive selection (M: copied from DS:19A0, indexed into those strings, copied back at 0A94). N_19C4! is a sound option (M: D3EA indexing); N_19B4! is a graphics option (M: D3A6 indexing). Names stay address-based because value conventions and shared meanings require verification.

## Pseudocode

```basic
L_0040: BX = &H4896
L_0043: DX = &H4948
L_0046: RT3F_61(BX=&H4896, DX=&H4948, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0049: BX = &H494C
L_004C: PLAY "MBMLT126"  'M: MODULE_CONSTANTS music literals; STATUS data lane
L_004F: DI = &H19C4
L_0052: SI = &H495C
L_0055: RT3F_97(BX=&H494C, DX=DX, SI=&H495C, DI=&H19C4, CX=CX, AX=AX)
L_0058: BX = &H1A
L_005B: RT3D_03(BX=&H001A, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_005E: DI = &H4958
L_0061: N_4958! = FAC!
L_0064: SI = DI
L_0066: RT3F_1D(BX=BX, DX=DX, SI=&H4958, DI=&H4958, CX=CX, AX=AX)
L_0069: CompareLeft! = (BX AND BX): CompareRight! = 0
L_006B: IF NOT ZF THEN GOTO L_0070  ' flags from L_0069 and bx, bx
L_006D: GOTO L_0073
L_0070: GOSUB L_0E7F
L_0073: DI = &H4960
L_0076: SI = &H495C
L_0079: N_4960! = 1
L_007C: BX = 1
L_007F: RT3E_5B(BX=&H0001, DX=DX, SI=&H495C, DI=&H4960, CX=CX, AX=AX)
L_0082: BX = &HFFFF
L_0085: RT3E_32(BX=&HFFFF, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0088: BX = 0
L_008A: RT3E_3C(BX=&H0000, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_008D: DI = &H495C
L_0090: SI = &H19B4
L_0093: CompareLeft! = N_19B4!: CompareRight! = 1
L_0096: IF CompareLeft! = CompareRight! THEN GOTO L_009B
L_0098: GOTO L_00AD
L_009B: BX = 1
L_009E: DX = 9
L_00A1: RT3E_4A(BX=&H0001, DX=&H0009, SI=SI, DI=DI, CX=CX, AX=AX)
L_00A4: BX = 2
L_00A7: DX = 4
L_00AA: RT3E_4A(BX=&H0002, DX=&H0004, SI=SI, DI=DI, CX=CX, AX=AX)
L_00AD: BX = &H4964
L_00B0: FAC! = CSNG(BX)
L_00B3: BX = &HD2E6
L_00B6: DX = &H1A
L_00B9: BLOAD "title", N(DX)  'M: DX points to single offset; preceding CSNG supplies FAC
L_00BC: BX = 0
L_00BE: DX = BX
L_00C0: CX = DX
L_00C2: AX = CX
L_00C4: PutX% = BX: PutY% = DX  ' coordinate flags CX,AX retained
L_00C7: BX = &H4964
L_00CA: DX = 4
L_00CD: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' M; mode meaning unknown
L_00D0: SI = &H4958
L_00D3: RT3F_1D(BX=&H4964, DX=&H0004, SI=&H4958, DI=DI, CX=&H0000, AX=&H0000)
L_00D6: CompareLeft! = (BX AND BX): CompareRight! = 0
L_00D8: IF NOT ZF THEN GOTO L_00DD  ' flags from L_00D6 and bx, bx
L_00DA: GOTO L_00E0
L_00DD: GOSUB L_0E7F
L_00E0: BX = 0
L_00E2: RT3E_20(BX=&H0000, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_00E5: CX = BX
L_00E7: BX = 1
L_00EA: DX = &HD2F0
L_00ED: RT3E_1E(BX=&H0001, DX=&HD2F0, SI=SI, DI=DI, CX=BX, AX=AX)
L_00F0: SI = &H495C
L_00F3: FAC! = 1
L_00F6: GOTO L_0122
L_00F9: ' alignment NOP
L_00FA: BX = 1
L_00FD: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0100: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0105: SI = &HD2F8
L_0108: BX = SI
L_010A: DX = BX
L_010C: BX = CINT(N_D2F8!)
L_010F: BX = BX * 2 ^ 1
L_0111: BX = BX * 2 ^ 1
L_0113: BX = BX + &H42AC
L_0117: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_011A: SI = DX
L_011C: DI = &H495C
L_011F: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_0122: DI = &HD2F8
L_0125: N_D2F8! = FAC!
L_0128: SI = DI
L_012A: DI = &HD2FC
L_012D: CompareLeft! = N_D2F8!: CompareRight! = 13
L_0130: IF CompareLeft! <= CompareRight! THEN GOTO L_00FA
L_0132: SI = &HD300
L_0135: FAC! = 0
L_0138: GOTO L_0164
L_013B: ' alignment NOP
L_013C: BX = 1
L_013F: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0142: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0147: SI = &HD2F8
L_014A: BX = SI
L_014C: DX = BX
L_014E: BX = CINT(N_D2F8!)
L_0151: BX = BX * 2 ^ 1
L_0153: BX = BX * 2 ^ 1
L_0155: BX = BX + &H42E4
L_0159: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_015C: SI = DX
L_015E: DI = &H495C
L_0161: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_0164: DI = &HD2F8
L_0167: N_D2F8! = FAC!
L_016A: SI = DI
L_016C: DI = &HD304
L_016F: CompareLeft! = N_D2F8!: CompareRight! = 15
L_0172: IF CompareLeft! <= CompareRight! THEN GOTO L_013C
L_0174: SI = &HD300
L_0177: FAC! = 0
L_017A: GOTO L_01A6
L_017D: ' alignment NOP
L_017E: BX = 1
L_0181: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0184: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0189: SI = &HD2F8
L_018C: BX = SI
L_018E: DX = BX
L_0190: BX = CINT(N_D2F8!)
L_0193: BX = BX * 2 ^ 1
L_0195: BX = BX * 2 ^ 1
L_0197: BX = BX + &H4324
L_019B: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_019E: SI = DX
L_01A0: DI = &H495C
L_01A3: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_01A6: DI = &HD2F8
L_01A9: N_D2F8! = FAC!
L_01AC: SI = DI
L_01AE: DI = &HD308
L_01B1: CompareLeft! = N_D2F8!: CompareRight! = 8
L_01B4: IF CompareLeft! <= CompareRight! THEN GOTO L_017E
L_01B6: SI = &HD300
L_01B9: FAC! = 0
L_01BC: GOTO L_01E8
L_01BF: ' alignment NOP
L_01C0: BX = 1
L_01C3: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_01C6: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_01CB: SI = &HD2F8
L_01CE: BX = SI
L_01D0: DX = BX
L_01D2: BX = CINT(N_D2F8!)
L_01D5: BX = BX * 2 ^ 1
L_01D7: BX = BX * 2 ^ 1
L_01D9: BX = BX + &H4348
L_01DD: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_01E0: SI = DX
L_01E2: DI = &H495C
L_01E5: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_01E8: DI = &HD2F8
L_01EB: N_D2F8! = FAC!
L_01EE: SI = DI
L_01F0: DI = &HD30C
L_01F3: CompareLeft! = N_D2F8!: CompareRight! = 3
L_01F6: IF CompareLeft! <= CompareRight! THEN GOTO L_01C0
L_01F8: SI = &HD300
L_01FB: FAC! = 0
L_01FE: GOTO L_022A
L_0201: ' alignment NOP
L_0202: BX = 1
L_0205: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0208: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_020D: SI = &HD2F8
L_0210: BX = SI
L_0212: DX = BX
L_0214: BX = CINT(N_D2F8!)
L_0217: BX = BX * 2 ^ 1
L_0219: BX = BX * 2 ^ 1
L_021B: BX = BX + &H435C
L_021F: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_0222: SI = DX
L_0224: DI = &H495C
L_0227: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_022A: DI = &HD2F8
L_022D: N_D2F8! = FAC!
L_0230: SI = DI
L_0232: DI = &HD310
L_0235: CompareLeft! = N_D2F8!: CompareRight! = 4
L_0238: IF CompareLeft! <= CompareRight! THEN GOTO L_0202
L_023A: SI = &HD300
L_023D: FAC! = 0
L_0240: GOTO L_026C
L_0243: ' alignment NOP
L_0244: BX = 1
L_0247: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_024A: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_024F: SI = &HD2F8
L_0252: BX = SI
L_0254: DX = BX
L_0256: BX = CINT(N_D2F8!)
L_0259: BX = BX * 2 ^ 1
L_025B: BX = BX * 2 ^ 1
L_025D: BX = BX + &H4370
L_0261: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_0264: SI = DX
L_0266: DI = &H495C
L_0269: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_026C: DI = &HD2F8
L_026F: N_D2F8! = FAC!
L_0272: SI = DI
L_0274: DI = &HD310
L_0277: CompareLeft! = N_D2F8!: CompareRight! = 4
L_027A: IF CompareLeft! <= CompareRight! THEN GOTO L_0244
L_027C: SI = &HD300
L_027F: FAC! = 0
L_0282: GOTO L_02AE
L_0285: ' alignment NOP
L_0286: BX = 1
L_0289: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_028C: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0291: SI = &HD2F8
L_0294: BX = SI
L_0296: DX = BX
L_0298: BX = CINT(N_D2F8!)
L_029B: BX = BX * 2 ^ 1
L_029D: BX = BX * 2 ^ 1
L_029F: BX = BX + &H4384
L_02A3: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_02A6: SI = DX
L_02A8: DI = &H495C
L_02AB: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_02AE: DI = &HD2F8
L_02B1: N_D2F8! = FAC!
L_02B4: SI = DI
L_02B6: DI = &HD314
L_02B9: CompareLeft! = N_D2F8!: CompareRight! = 2
L_02BC: IF CompareLeft! <= CompareRight! THEN GOTO L_0286
L_02BE: SI = &HD300
L_02C1: FAC! = 0
L_02C4: GOTO L_02F0
L_02C7: ' alignment NOP
L_02C8: BX = 1
L_02CB: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_02CE: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_02D3: SI = &HD2F8
L_02D6: BX = SI
L_02D8: DX = BX
L_02DA: BX = CINT(N_D2F8!)
L_02DD: BX = BX * 2 ^ 1
L_02DF: BX = BX * 2 ^ 1
L_02E1: BX = BX + &H4390
L_02E5: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_02E8: SI = DX
L_02EA: DI = &H495C
L_02ED: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_02F0: DI = &HD2F8
L_02F3: N_D2F8! = FAC!
L_02F6: SI = DI
L_02F8: DI = &HD318
L_02FB: CompareLeft! = N_D2F8!: CompareRight! = 24
L_02FE: IF CompareLeft! <= CompareRight! THEN GOTO L_02C8
L_0300: SI = &HD300
L_0303: FAC! = 0
L_0306: GOTO L_0332
L_0309: ' alignment NOP
L_030A: BX = 1
L_030D: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0310: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0315: SI = &HD2F8
L_0318: BX = SI
L_031A: DX = BX
L_031C: BX = CINT(N_D2F8!)
L_031F: BX = BX * 2 ^ 1
L_0321: BX = BX * 2 ^ 1
L_0323: BX = BX + &H43F4
L_0327: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_032A: SI = DX
L_032C: DI = &H495C
L_032F: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_0332: DI = &HD2F8
L_0335: N_D2F8! = FAC!
L_0338: SI = DI
L_033A: DI = &HD31C
L_033D: CompareLeft! = N_D2F8!: CompareRight! = 53
L_0340: IF CompareLeft! <= CompareRight! THEN GOTO L_030A
L_0342: SI = &HD300
L_0345: FAC! = 0
L_0348: GOTO L_0374
L_034B: ' alignment NOP
L_034C: BX = 1
L_034F: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0352: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0357: SI = &HD2F8
L_035A: BX = SI
L_035C: DX = BX
L_035E: BX = CINT(N_D2F8!)
L_0361: BX = BX * 2 ^ 1
L_0363: BX = BX * 2 ^ 1
L_0365: BX = BX + &H44CC
L_0369: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_036C: SI = DX
L_036E: DI = &H495C
L_0371: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_0374: DI = &HD2F8
L_0377: N_D2F8! = FAC!
L_037A: SI = DI
L_037C: DI = &HD320
L_037F: CompareLeft! = N_D2F8!: CompareRight! = 5
L_0382: IF CompareLeft! <= CompareRight! THEN GOTO L_034C
L_0384: SI = &HD300
L_0387: FAC! = 0
L_038A: GOTO L_03B6
L_038D: ' alignment NOP
L_038E: BX = 1
L_0391: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0394: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0399: SI = &HD2F8
L_039C: BX = SI
L_039E: DX = BX
L_03A0: BX = CINT(N_D2F8!)
L_03A3: BX = BX * 2 ^ 1
L_03A5: BX = BX * 2 ^ 1
L_03A7: BX = BX + &H44E4
L_03AB: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_03AE: SI = DX
L_03B0: DI = &H495C
L_03B3: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_03B6: DI = &HD2F8
L_03B9: N_D2F8! = FAC!
L_03BC: SI = DI
L_03BE: DI = &HD30C
L_03C1: CompareLeft! = N_D2F8!: CompareRight! = 3
L_03C4: IF CompareLeft! <= CompareRight! THEN GOTO L_038E
L_03C6: SI = &HD300
L_03C9: FAC! = 0
L_03CC: GOTO L_03F8
L_03CF: ' alignment NOP
L_03D0: BX = 1
L_03D3: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_03D6: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_03DB: SI = &HD2F8
L_03DE: BX = SI
L_03E0: DX = BX
L_03E2: BX = CINT(N_D2F8!)
L_03E5: BX = BX * 2 ^ 1
L_03E7: BX = BX * 2 ^ 1
L_03E9: BX = BX + &H44F4
L_03ED: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_03F0: SI = DX
L_03F2: DI = &H495C
L_03F5: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_03F8: DI = &HD2F8
L_03FB: N_D2F8! = FAC!
L_03FE: SI = DI
L_0400: DI = &HD304
L_0403: CompareLeft! = N_D2F8!: CompareRight! = 15
L_0406: IF CompareLeft! <= CompareRight! THEN GOTO L_03D0
L_0408: SI = &HD300
L_040B: FAC! = 0
L_040E: GOTO L_043A
L_0411: ' alignment NOP
L_0412: BX = 1
L_0415: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0418: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_041D: SI = &HD2F8
L_0420: BX = SI
L_0422: DX = BX
L_0424: BX = CINT(N_D2F8!)
L_0427: BX = BX * 2 ^ 1
L_0429: BX = BX * 2 ^ 1
L_042B: BX = BX + &H4534
L_042F: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_0432: SI = DX
L_0434: DI = &H495C
L_0437: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_043A: DI = &HD2F8
L_043D: N_D2F8! = FAC!
L_0440: SI = DI
L_0442: DI = &HD324
L_0445: CompareLeft! = N_D2F8!: CompareRight! = 10
L_0448: IF CompareLeft! <= CompareRight! THEN GOTO L_0412
L_044A: SI = &HD300
L_044D: FAC! = 0
L_0450: GOTO L_047C
L_0453: ' alignment NOP
L_0454: BX = 1
L_0457: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_045A: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_045F: SI = &HD2F8
L_0462: BX = SI
L_0464: DX = BX
L_0466: BX = CINT(N_D2F8!)
L_0469: BX = BX * 2 ^ 1
L_046B: BX = BX * 2 ^ 1
L_046D: BX = BX + &H4560
L_0471: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_0474: SI = DX
L_0476: DI = &H495C
L_0479: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_047C: DI = &HD2F8
L_047F: N_D2F8! = FAC!
L_0482: SI = DI
L_0484: DI = &HD328
L_0487: CompareLeft! = N_D2F8!: CompareRight! = 99
L_048A: IF CompareLeft! <= CompareRight! THEN GOTO L_0454
L_048C: SI = &HD300
L_048F: FAC! = 0
L_0492: GOTO L_04BE
L_0495: ' alignment NOP
L_0496: BX = 1
L_0499: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_049C: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_04A1: SI = &HD2F8
L_04A4: BX = SI
L_04A6: DX = BX
L_04A8: BX = CINT(N_D2F8!)
L_04AB: BX = BX * 2 ^ 1
L_04AD: BX = BX * 2 ^ 1
L_04AF: BX = BX + &H46F0
L_04B3: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_04B6: SI = DX
L_04B8: DI = &H495C
L_04BB: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_04BE: DI = &HD2F8
L_04C1: N_D2F8! = FAC!
L_04C4: SI = DI
L_04C6: DI = &HD32C
L_04C9: CompareLeft! = N_D2F8!: CompareRight! = 49
L_04CC: IF CompareLeft! <= CompareRight! THEN GOTO L_0496
L_04CE: SI = &HD300
L_04D1: FAC! = 0
L_04D4: GOTO L_0500
L_04D7: ' alignment NOP
L_04D8: BX = 1
L_04DB: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_04DE: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_04E3: SI = &HD2F8
L_04E6: BX = SI
L_04E8: DX = BX
L_04EA: BX = CINT(N_D2F8!)
L_04ED: BX = BX * 2 ^ 1
L_04EF: BX = BX * 2 ^ 1
L_04F1: BX = BX + &H47B8
L_04F5: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_04F8: SI = DX
L_04FA: DI = &H495C
L_04FD: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_0500: DI = &HD2F8
L_0503: N_D2F8! = FAC!
L_0506: SI = DI
L_0508: DI = &HD330
L_050B: CompareLeft! = N_D2F8!: CompareRight! = 22
L_050E: IF CompareLeft! <= CompareRight! THEN GOTO L_04D8
L_0510: SI = &HD300
L_0513: FAC! = 0
L_0516: GOTO L_0542
L_0519: ' alignment NOP
L_051A: BX = 1
L_051D: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0520: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0525: SI = &HD2F8
L_0528: BX = SI
L_052A: DX = BX
L_052C: BX = CINT(N_D2F8!)
L_052F: BX = BX * 2 ^ 1
L_0531: BX = BX * 2 ^ 1
L_0533: BX = BX + &H4814
L_0537: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_053A: SI = DX
L_053C: DI = &H495C
L_053F: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_0542: DI = &HD2F8
L_0545: N_D2F8! = FAC!
L_0548: SI = DI
L_054A: DI = &HD330
L_054D: CompareLeft! = N_D2F8!: CompareRight! = 22
L_0550: IF CompareLeft! <= CompareRight! THEN GOTO L_051A
L_0552: SI = &HD300
L_0555: FAC! = 0
L_0558: GOTO L_0584
L_055B: ' alignment NOP
L_055C: BX = 1
L_055F: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0562: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_0567: SI = &HD2F8
L_056A: BX = SI
L_056C: DX = BX
L_056E: BX = CINT(N_D2F8!)
L_0571: BX = BX * 2 ^ 1
L_0573: BX = BX * 2 ^ 1
L_0575: BX = BX + &H4870
L_0579: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_057C: SI = DX
L_057E: DI = &H495C
L_0581: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_0584: DI = &HD2F8
L_0587: N_D2F8! = FAC!
L_058A: SI = DI
L_058C: DI = &HD334
L_058F: CompareLeft! = N_D2F8!: CompareRight! = 6
L_0592: IF CompareLeft! <= CompareRight! THEN GOTO L_055C
L_0594: BX = 1
L_0597: RT3E_21(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_059A: BX = 0
L_059C: RT3E_20(BX=&H0000, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_059F: CX = BX
L_05A1: BX = 1
L_05A4: DX = &HD338
L_05A7: RT3E_1E(BX=&H0001, DX=&HD338, SI=SI, DI=DI, CX=BX, AX=AX)
L_05AA: BX = 1
L_05AD: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_05B0: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_05B5: BX = &H488C
L_05B8: RT3F_B8(BX=&H488C, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_05BB: SI = &H495C
L_05BE: FAC! = 1
L_05C1: GOTO L_05EC
L_05C4: BX = 1
L_05C7: RT3F_B6(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_05CA: RT3F_B7(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)  'Following 01 04 preserved as inline bytes, not ADD instruction; interpretation unknown
L_05CF: SI = &HD2F8
L_05D2: BX = SI
L_05D4: DX = BX
L_05D6: BX = CINT(N_D2F8!)
L_05D9: BX = BX * 2 ^ 1
L_05DB: BX = BX * 2 ^ 1
L_05DD: BX = BX + &H4288
L_05E1: RT3F_B8(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=DI, CX=CX, AX=AX)
L_05E4: SI = DX
L_05E6: DI = &H495C
L_05E9: RT3F_7F(BX=BX, DX=DX, SI=DX, DI=&H495C, CX=CX, AX=AX)
L_05EC: DI = &HD2F8
L_05EF: N_D2F8! = FAC!
L_05F2: SI = DI
L_05F4: DI = &HD308
L_05F7: CompareLeft! = N_D2F8!: CompareRight! = 8
L_05FA: IF CompareLeft! <= CompareRight! THEN GOTO L_05C4
L_05FC: BX = 1
L_05FF: RT3E_21(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0602: BX = &H40F4
L_0605: FAC! = CSNG(BX)
L_0608: BX = &HD344
L_060B: DX = &H1A
L_060E: BLOAD "LOGO", N(DX)  'M: DX points to single offset; preceding CSNG supplies FAC
L_0611: SI = &H4958
L_0614: RT3F_1D(BX=&HD344, DX=&H001A, SI=&H4958, DI=DI, CX=CX, AX=AX)
L_0617: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0619: IF NOT ZF THEN GOTO L_061E  ' flags from L_0617 and bx, bx
L_061B: GOTO L_0621
L_061E: GOSUB L_0E7F
L_0621: BX = &HD358
L_0624: DX = &HD34C
L_0627: RT3F_61(BX=&HD358, DX=&HD34C, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_062A: BX = &HD372
L_062D: DX = &HD350
L_0630: RT3F_61(BX=&HD372, DX=&HD350, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0633: BX = &HD38C
L_0636: DX = &HD354
L_0639: RT3F_61(BX=&HD38C, DX=&HD354, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_063C: BX = &HD3AE
L_063F: DX = &HD3A6
L_0642: RT3F_61(BX=&HD3AE, DX=&HD3A6, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0645: BX = &HD3CC
L_0648: DX = &HD3AA
L_064B: RT3F_61(BX=&HD3CC, DX=&HD3AA, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_064E: BX = &HD3F2
L_0651: DX = &HD3EA
L_0654: RT3F_61(BX=&HD3F2, DX=&HD3EA, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0657: BX = &HD400
L_065A: DX = &HD3EE
L_065D: RT3F_61(BX=&HD400, DX=&HD3EE, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0660: GOSUB L_07F4
L_0663: RT3D_06(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0666: AX = BX
L_0668: BX = &HD40E
L_066B: RT3F_62(BX=&HD40E, DX=DX, SI=SI, DI=DI, CX=CX, AX=BX)
L_066E: IF ZF THEN GOTO L_0673  ' flags from L_066B CALL RT3F_62
L_0670: GOTO L_07FE
L_0673: SI = &H495C
L_0676: FAC! = 1
L_0679: GOTO L_069E
L_067C: GOSUB L_07AD
L_067F: SI = &HD412
L_0682: RT3F_1D(BX=BX, DX=DX, SI=&HD412, DI=DI, CX=CX, AX=AX)
L_0685: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0687: IF NOT ZF THEN GOTO L_068C  ' flags from L_0685 and bx, bx
L_0689: GOTO L_0695
L_068C: DI = &HD416
L_068F: SI = &HD41A
L_0692: N_D416! = 199
L_0695: DI = &H495C
L_0698: SI = &HD416
L_069B: RT3F_7F(BX=BX, DX=DX, SI=&HD416, DI=&H495C, CX=CX, AX=AX)
L_069E: DI = &HD416
L_06A1: N_D416! = FAC!
L_06A4: SI = DI
L_06A6: DI = &HD41E
L_06A9: CompareLeft! = N_D416!: CompareRight! = 100
L_06AC: IF CompareLeft! <= CompareRight! THEN GOTO L_067C
L_06AE: DI = &HD422
L_06B1: SI = &HD416
L_06B4: CompareLeft! = N_D416!: CompareRight! = 150
L_06B7: IF CompareLeft! <= CompareRight! THEN GOTO L_06BC
L_06B9: GOTO L_07FE
L_06BC: DI = &HD426
L_06BF: SI = &H495C
L_06C2: N_D426! = 1
L_06C5: BX = &H1C
L_06C8: DX = &H36
L_06CB: CX = 0
L_06CD: AX = CX
L_06CF: PutX% = BX: PutY% = DX  ' coordinate flags CX,AX retained
L_06D2: BX = &H87E8
L_06D5: DX = 3
L_06D8: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' M; mode meaning unknown
L_06DB: GOSUB L_07AD
L_06DE: SI = &HD412
L_06E1: RT3F_1D(BX=BX, DX=DX, SI=&HD412, DI=DI, CX=CX, AX=AX)
L_06E4: CompareLeft! = (BX AND BX): CompareRight! = 0
L_06E6: IF ZF THEN GOTO L_06EB  ' flags from L_06E4 and bx, bx
L_06E8: GOTO L_07FE
L_06EB: BX = &H30
L_06EE: DX = &H3A
L_06F1: CX = 0
L_06F3: AX = CX
L_06F5: PutX% = BX: PutY% = DX  ' coordinate flags CX,AX retained
L_06F8: BX = &H9BD8
L_06FB: DX = 3
L_06FE: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' M; mode meaning unknown
L_0701: GOSUB L_07AD
L_0704: SI = &HD412
L_0707: RT3F_1D(BX=BX, DX=DX, SI=&HD412, DI=DI, CX=CX, AX=AX)
L_070A: CompareLeft! = (BX AND BX): CompareRight! = 0
L_070C: IF ZF THEN GOTO L_0711  ' flags from L_070A and bx, bx
L_070E: GOTO L_07FE
L_0711: BX = &H30
L_0714: DX = &H3A
L_0717: CX = 0
L_0719: AX = CX
L_071B: PutX% = BX: PutY% = DX  ' coordinate flags CX,AX retained
L_071E: BX = &HADDA
L_0721: DX = 3
L_0724: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' M; mode meaning unknown
L_0727: GOSUB L_07AD
L_072A: SI = &HD412
L_072D: RT3F_1D(BX=BX, DX=DX, SI=&HD412, DI=DI, CX=CX, AX=AX)
L_0730: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0732: IF ZF THEN GOTO L_0737  ' flags from L_0730 and bx, bx
L_0734: GOTO L_07FE
L_0737: BX = &H2C
L_073A: DX = &H30
L_073D: CX = 0
L_073F: AX = CX
L_0741: PutX% = BX: PutY% = DX  ' coordinate flags CX,AX retained
L_0744: BX = &HBF7A
L_0747: DX = 3
L_074A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' M; mode meaning unknown
L_074D: SI = &H495C
L_0750: FAC! = 1
L_0753: GOTO L_0778
L_0756: GOSUB L_07AD
L_0759: SI = &HD412
L_075C: RT3F_1D(BX=BX, DX=DX, SI=&HD412, DI=DI, CX=CX, AX=AX)
L_075F: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0761: IF NOT ZF THEN GOTO L_0766  ' flags from L_075F and bx, bx
L_0763: GOTO L_076F
L_0766: DI = &HD416
L_0769: SI = &HD328
L_076C: N_D416! = 99
L_076F: DI = &H495C
L_0772: SI = &HD416
L_0775: RT3F_7F(BX=BX, DX=DX, SI=&HD416, DI=&H495C, CX=CX, AX=AX)
L_0778: DI = &HD416
L_077B: N_D416! = FAC!
L_077E: SI = DI
L_0780: DI = &HD30C
L_0783: CompareLeft! = N_D416!: CompareRight! = 3
L_0786: IF CompareLeft! <= CompareRight! THEN GOTO L_0756
L_0788: DI = &HD42A
L_078B: SI = &HD416
L_078E: CompareLeft! = N_D416!: CompareRight! = 50
L_0791: IF CompareLeft! <= CompareRight! THEN GOTO L_0796
L_0793: GOTO L_07FE
L_0796: BX = 0
L_0798: DX = BX
L_079A: CX = DX
L_079C: AX = CX
L_079E: PutX% = BX: PutY% = DX  ' coordinate flags CX,AX retained
L_07A1: BX = &H4964
L_07A4: DX = 3
L_07A7: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' M; mode meaning unknown
L_07AA: GOTO L_06BC
L_07AD: RT3D_43(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_07B0: DI = &HD42E
L_07B3: RT3F_99(BX=BX, DX=DX, SI=SI, DI=&HD42E, CX=CX, AX=AX)
L_07B6: RT3F_2D(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_07B9: DI = &HD432
L_07BC: CompareLeft! = FAC!: CompareRight! = 2.4
L_07BF: IF CompareLeft! < CompareRight! THEN GOTO L_07C4
L_07C1: GOTO L_07D8
L_07C4: SI = &H4958
L_07C7: RT3F_1D(BX=BX, DX=DX, SI=&H4958, DI=DI, CX=CX, AX=AX)
L_07CA: CompareLeft! = (BX AND BX): CompareRight! = 0
L_07CC: IF NOT ZF THEN GOTO L_07D1  ' flags from L_07CA and bx, bx
L_07CE: GOTO L_07D6
L_07D1: GOSUB L_0E7F
L_07D4: GOTO L_07AD
L_07D6: GOTO L_07AD
L_07D8: RT3D_06(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_07DB: AX = BX
L_07DD: BX = &HD40E
L_07E0: RT3F_62(BX=&HD40E, DX=DX, SI=SI, DI=DI, CX=CX, AX=BX)
L_07E3: DX = 0
L_07E6: IF ZF THEN GOTO L_07E9  ' flags from L_07E0 CALL RT3F_62
L_07E8: DX = DX - 1
L_07E9: BX = DX
L_07EB: FAC! = CSNG(BX)
L_07EE: DI = &HD412
L_07F1: N_D412! = FAC!
L_07F4: RT3D_43(BX=DX, DX=DX, SI=SI, DI=&HD412, CX=CX, AX=AX)
L_07F7: DI = &HD42E
L_07FA: N_D42E! = FAC!
L_07FD: RETURN
L_07FE: BX = &HFFFF
L_0801: RT3E_32(BX=&HFFFF, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0804: BX = 0
L_0806: DX = 1
L_0809: CX = BX
L_080B: AX = CX
L_080D: RT3E_84(BX=&H0000, DX=&H0001, SI=SI, DI=DI, CX=&H0000, AX=&H0000)
L_0810: BX = &H13F
L_0813: DX = &HC6
L_0816: RT3E_85(BX=&H013F, DX=&H00C6, SI=SI, DI=DI, CX=CX, AX=AX)
L_0819: DX = AX
L_081B: BX = &HFFFF
L_081E: CX = BX
L_0820: RT3E_86(BX=&HFFFF, DX=AX, SI=SI, DI=DI, CX=&HFFFF, AX=AX)
L_0823: CX = AX
L_0825: BX = 1
L_0828: DX = 2
L_082B: RT3E_84(BX=&H0001, DX=&H0002, SI=SI, DI=DI, CX=AX, AX=AX)
L_082E: BX = &H13E
L_0831: DX = &HC5
L_0834: RT3E_85(BX=&H013E, DX=&H00C5, SI=SI, DI=DI, CX=CX, AX=AX)
L_0837: DX = AX
L_0839: BX = &HFFFF
L_083C: CX = BX
L_083E: RT3E_86(BX=&HFFFF, DX=AX, SI=SI, DI=DI, CX=&HFFFF, AX=AX)
L_0841: BX = 5
L_0844: DX = &H1D
L_0847: CX = 0
L_0849: AX = CX
L_084B: RT3E_84(BX=&H0005, DX=&H001D, SI=SI, DI=DI, CX=&H0000, AX=&H0000)
L_084E: BX = &H13A
L_0851: DX = &HC2
L_0854: RT3E_85(BX=&H013A, DX=&H00C2, SI=SI, DI=DI, CX=CX, AX=AX)
L_0857: DX = AX
L_0859: BX = &HFFFF
L_085C: CX = BX
L_085E: RT3E_86(BX=&HFFFF, DX=AX, SI=SI, DI=DI, CX=&HFFFF, AX=AX)
L_0861: CX = AX
L_0863: BX = 6
L_0866: DX = &H1E
L_0869: RT3E_84(BX=&H0006, DX=&H001E, SI=SI, DI=DI, CX=AX, AX=AX)
L_086C: BX = &H139
L_086F: DX = &HC1
L_0872: RT3E_85(BX=&H0139, DX=&H00C1, SI=SI, DI=DI, CX=CX, AX=AX)
L_0875: DX = AX
L_0877: BX = &HFFFF
L_087A: CX = BX
L_087C: RT3E_86(BX=&HFFFF, DX=AX, SI=SI, DI=DI, CX=&HFFFF, AX=AX)
L_087F: BX = 5
L_0882: DX = BX
L_0884: CX = 0
L_0886: AX = CX
L_0888: RT3E_84(BX=&H0005, DX=&H0005, SI=SI, DI=DI, CX=&H0000, AX=&H0000)
L_088B: BX = &H13A
L_088E: DX = &H1A
L_0891: RT3E_85(BX=&H013A, DX=&H001A, SI=SI, DI=DI, CX=CX, AX=AX)
L_0894: BX = &HFFFF
L_0897: DX = 1
L_089A: CX = BX
L_089C: RT3E_86(BX=&HFFFF, DX=&H0001, SI=SI, DI=DI, CX=&HFFFF, AX=AX)
L_089F: BX = &H78
L_08A2: DX = 7
L_08A5: CX = 0
L_08A7: AX = CX
L_08A9: PutX% = BX: PutY% = DX  ' coordinate flags CX,AX retained
L_08AC: BX = &H40F4
L_08AF: DX = 3
L_08B2: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' M; mode meaning unknown
L_08B5: BX = 3
L_08B8: DX = BX
L_08BA: CX = 0
L_08BC: AX = CX
L_08BE: RT3E_8D(BX=&H0003, DX=&H0003, SI=SI, DI=DI, CX=&H0000, AX=&H0000)
L_08C1: BX = 2
L_08C4: DX = 3
L_08C7: RT3E_48(BX=&H0002, DX=&H0003, SI=SI, DI=DI, CX=CX, AX=AX)
L_08CA: DI = &HD436
L_08CD: SI = &H19A0
L_08D0: N_D436! = N_19A0!
L_08D3: GOSUB L_0A34
L_08D6: BX = 5
L_08D9: LocateRow% = BX
L_08DC: BX = 2
L_08DF: LOCATE LocateRow%, BX
L_08E2: ' Begin PRINT statement; following items share one statement
L_08E5: DX = BX
L_08E7: BX = &HD43A
L_08EA: PRINT "Version 1.0                    3/18/88";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_08ED: PRINT  ' End statement / flush
L_08F0: BX = 6
L_08F3: LocateRow% = BX
L_08F6: BX = DX
L_08F8: LOCATE LocateRow%, BX
L_08FB: ' Begin PRINT statement; following items share one statement
L_08FE: BX = &HD464
L_0901: PRINT "copyright 1988 by Winston Douglas Wood";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0904: PRINT  ' End statement / flush
L_0907: BX = &HD
L_090A: LocateRow% = BX
L_090D: BX = 8
L_0910: LOCATE LocateRow%, BX
L_0913: ' Begin PRINT statement; following items share one statement
L_0916: DX = BX
L_0918: BX = &HD48E
L_091B: PRINT "1-Play Star Command";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_091E: PRINT  ' End statement / flush
L_0921: BX = &HE
L_0924: LocateRow% = BX
L_0927: BX = DX
L_0929: LOCATE LocateRow%, BX
L_092C: ' Begin PRINT statement; following items share one statement
L_092F: BX = &HD4A6
L_0932: PRINT "2-Begin New Game";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0935: PRINT  ' End statement / flush
L_0938: BX = &HF
L_093B: LocateRow% = BX
L_093E: BX = DX
L_0940: LOCATE LocateRow%, BX
L_0943: ' Begin PRINT statement; following items share one statement
L_0946: BX = &HD4BA
L_0949: PRINT "3-";
L_094C: SI = &HD436
L_094F: BX = CINT(N_D436!)
L_0952: BX = BX * 2 ^ 1
L_0954: BX = BX * 2 ^ 1
L_0956: BX = BX + &HD34C
L_095A: PRINT S(BX);  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_095D: PRINT  ' End statement / flush
L_0960: BX = &H10
L_0963: LocateRow% = BX
L_0966: BX = DX
L_0968: LOCATE LocateRow%, BX
L_096B: ' Begin PRINT statement; following items share one statement
L_096E: BX = &HD4C0
L_0971: PRINT "4-";
L_0974: SI = &H19C4
L_0977: BX = CINT(N_19C4!)
L_097A: BX = BX * 2 ^ 1
L_097C: BX = BX * 2 ^ 1
L_097E: BX = BX + &HD3EA
L_0982: PRINT S(BX);  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0985: PRINT  ' End statement / flush
L_0988: DI = &H495C
L_098B: SI = &H19B8
L_098E: CompareLeft! = N_19B8!: CompareRight! = 1
L_0991: IF CompareLeft! = CompareRight! THEN GOTO L_0996
L_0993: GOTO L_09BE
L_0996: BX = &H11
L_0999: LocateRow% = BX
L_099C: BX = DX
L_099E: LOCATE LocateRow%, BX
L_09A1: ' Begin PRINT statement; following items share one statement
L_09A4: BX = &HD4C6
L_09A7: PRINT "5-";
L_09AA: SI = &H19B4
L_09AD: BX = CINT(N_19B4!)
L_09B0: BX = BX * 2 ^ 1
L_09B2: BX = BX * 2 ^ 1
L_09B4: BX = BX + &HD3A6
L_09B8: PRINT S(BX);  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_09BB: PRINT  ' End statement / flush
L_09BE: BX = &H17
L_09C1: LocateRow% = BX
L_09C4: BX = 2
L_09C7: LOCATE LocateRow%, BX
L_09CA: ' Begin PRINT statement; following items share one statement
L_09CD: DX = BX
L_09CF: BX = &HD4CC
L_09D2: PRINT " portions of this product copyrighted";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_09D5: PRINT  ' End statement / flush
L_09D8: BX = &H18
L_09DB: LocateRow% = BX
L_09DE: BX = DX
L_09E0: LOCATE LocateRow%, BX
L_09E3: ' Begin PRINT statement; following items share one statement
L_09E6: BX = &HD4F6
L_09E9: PRINT " by Microsoft Corporation   1982-1987";
L_09EC: PRINT  ' End statement / flush
L_09EF: DI = &H495C
L_09F2: SI = &HD520
L_09F5: CompareLeft! = N_D520!: CompareRight! = 1
L_09F8: IF CompareLeft! < CompareRight! THEN GOTO L_09FD
L_09FA: GOTO L_0A00
L_09FD: GOSUB L_0A56
L_0A00: RT3D_06(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0A03: RT3D_13(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0A06: RT3F_7A(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0A09: DI = &HD524
L_0A0C: N_D524! = FAC!
L_0A0F: SI = DI
L_0A11: BX = CINT(N_D524!)
L_0A14: RT3F_5E(BX=BX, DX=DX, SI=&HD524, DI=&HD524, CX=CX, AX=AX)  'Inline bytes 05 84 0A FA 0A 1F 0D 71 0D DF 0D; probable dispatch table, base/semantics unknown
L_0A22: SI = &H4958
L_0A25: RT3F_1D(BX=BX, DX=DX, SI=&H4958, DI=DI, CX=CX, AX=AX)
L_0A28: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0A2A: IF NOT ZF THEN GOTO L_0A2F  ' flags from L_0A28 and bx, bx
L_0A2C: GOTO L_0A32
L_0A2F: GOSUB L_0E7F
L_0A32: GOTO L_0A00
L_0A34: BX = 7
L_0A37: DX = &H1F
L_0A3A: CX = 0
L_0A3C: AX = CX
L_0A3E: RT3E_84(BX=&H0007, DX=&H001F, SI=SI, DI=DI, CX=&H0000, AX=&H0000)
L_0A41: BX = &H138
L_0A44: DX = &HC0
L_0A47: RT3E_85(BX=&H0138, DX=&H00C0, SI=SI, DI=DI, CX=CX, AX=AX)
L_0A4A: BX = 0
L_0A4C: DX = 1
L_0A4F: CX = &HFFFF
L_0A52: RT3E_86(BX=&H0000, DX=&H0001, SI=SI, DI=DI, CX=&HFFFF, AX=AX)
L_0A55: RETURN
L_0A56: RT3D_43(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0A59: DI = &HD42E
L_0A5C: N_D42E! = FAC!
L_0A5F: RT3D_43(BX=BX, DX=DX, SI=SI, DI=&HD42E, CX=CX, AX=AX)
L_0A62: DI = &HD42E
L_0A65: CompareLeft! = FAC!: CompareRight! = N_D42E!
L_0A68: IF CompareLeft! = CompareRight! THEN GOTO L_0A56
L_0A6A: RT3D_43(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0A6D: DI = &HD528
L_0A70: N_D528! = FAC!
L_0A73: DI = &H495C
L_0A76: SI = &HD520
L_0A79: RT3F_7F(BX=BX, DX=DX, SI=&HD520, DI=&H495C, CX=CX, AX=AX)
L_0A7C: SWAP SI, DI
L_0A7E: BX = SI
L_0A80: N(SI) = FAC!
L_0A83: RT3D_43(BX=DI, DX=DX, SI=DI, DI=SI, CX=CX, AX=AX)
L_0A86: DI = &HD528
L_0A89: RT3F_99(BX=BX, DX=DX, SI=SI, DI=&HD528, CX=CX, AX=AX)
L_0A8C: DI = BX
L_0A8E: CompareLeft! = FAC!: CompareRight! = N(BX)
L_0A91: IF CompareLeft! < CompareRight! THEN GOTO L_0A73
L_0A93: RETURN
L_0A94: DI = &H19A0
L_0A97: SI = &HD436
L_0A9A: N_19A0! = N_D436!
L_0A9D: DI = &H19A4
L_0AA0: SI = &HD300
L_0AA3: N_19A4! = 0
L_0AA6: DI = &H19A8
L_0AA9: BX = SI
L_0AAB: SI = &HD520
L_0AAE: N_19A8! = N_D520!
L_0AB1: SI = BX
L_0AB3: DI = &H19AC
L_0AB6: N_19AC! = 0
L_0AB9: DI = &H19C0
L_0ABC: N_19C0! = 0
L_0ABF: BX = 0
L_0AC1: RT3D_44(BX=&H0000, DX=DX, SI=&HD300, DI=&H19C0, CX=CX, AX=AX)
L_0AC4: FAC! = CSNG(BX)
L_0AC7: DI = &HD52C
L_0ACA: N_D52C! = FAC!
L_0ACD: BX = 0
L_0ACF: DX = BX
L_0AD1: RT3D_44(BX=&H0000, DX=&H0000, SI=SI, DI=&HD52C, CX=CX, AX=AX)
L_0AD4: CompareLeft! = DX: CompareRight! = BX
L_0AD6: CX = 0
L_0AD9: IF NOT ZF THEN GOTO L_0ADC  ' flags from L_0AD4 cmp dx, bx
L_0ADB: CX = CX - 1
L_0ADC: BX = DX
L_0ADE: RT3D_44(BX=DX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0AE1: FAC! = CSNG(BX)
L_0AE4: SI = &HD52C
L_0AE7: RT3F_9B(BX=BX, DX=DX, SI=&HD52C, DI=DI, CX=CX, AX=AX)
L_0AEA: DI = &HD314
L_0AED: CompareLeft! = FAC!: CompareRight! = 2
L_0AF0: BX = 0
L_0AF3: IF CompareLeft! <= CompareRight! THEN GOTO L_0AF6
L_0AF5: BX = BX - 1
L_0AF6: BX = BX OR CX
L_0AF8: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0AFA: IF NOT ZF THEN GOTO L_0AFF  ' flags from L_0AF8 and bx, bx
L_0AFC: GOTO L_0B08
L_0AFF: BX = &HD530
L_0B02: CHAIN "STARPORT"  'M: MODULE_CONSTANTS destination literal; STATUS data lane
L_0B05: GOTO L_0B0A
L_0B08: GOTO L_0ACD
L_0B0A: GOSUB L_0A34
L_0B0D: BX = &HD
L_0B10: LocateRow% = BX
L_0B13: BX = 2
L_0B16: LOCATE LocateRow%, BX
L_0B19: ' Begin PRINT statement; following items share one statement
L_0B1C: DX = BX
L_0B1E: BX = &HD53C
L_0B21: PRINT "Starting a new game will erase your";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0B24: PRINT  ' End statement / flush
L_0B27: BX = &HE
L_0B2A: LocateRow% = BX
L_0B2D: BX = DX
L_0B2F: LOCATE LocateRow%, BX
L_0B32: ' Begin PRINT statement; following items share one statement
L_0B35: BX = &HD564
L_0B38: PRINT "old characters. Start a new game?(Y/N)";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0B3B: PRINT  ' End statement / flush
L_0B3E: GOSUB L_0CB9
L_0B41: SI = &HD58E
L_0B44: CompareLeft! = N_D58E!: CompareRight! = 0
L_0B47: IF CompareLeft! <> CompareRight! THEN GOTO L_0B4C
L_0B49: GOTO L_08D3
L_0B4C: GOSUB L_0A34
L_0B4F: BX = &HD
L_0B52: LocateRow% = BX
L_0B55: BX = 2
L_0B58: LOCATE LocateRow%, BX
L_0B5B: ' Begin PRINT statement; following items share one statement
L_0B5E: DX = BX
L_0B60: BX = &HD592
L_0B63: PRINT "Are you sure you want to start a new";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0B66: PRINT  ' End statement / flush
L_0B69: BX = &HE
L_0B6C: LocateRow% = BX
L_0B6F: BX = DX
L_0B71: LOCATE LocateRow%, BX
L_0B74: ' Begin PRINT statement; following items share one statement
L_0B77: BX = &HD5BA
L_0B7A: PRINT "game? (Y/N)";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0B7D: PRINT  ' End statement / flush
L_0B80: GOSUB L_0CB9
L_0B83: SI = &HD58E
L_0B86: CompareLeft! = N_D58E!: CompareRight! = 0
L_0B89: IF CompareLeft! <> CompareRight! THEN GOTO L_0B8E
L_0B8B: GOTO L_08D3
L_0B8E: GOSUB L_0A34
L_0B91: BX = &HE
L_0B94: LocateRow% = BX
L_0B97: BX = 3
L_0B9A: LOCATE LocateRow%, BX
L_0B9D: ' Begin PRINT statement; following items share one statement
L_0BA0: BX = &HD5CA
L_0BA3: PRINT "Starting a new game. Please wait.";  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0BA6: PRINT  ' End statement / flush
L_0BA9: SI = &HD300
L_0BAC: FAC! = 0
L_0BAF: GOTO L_0BD6
L_0BB2: SI = &HD2F8
L_0BB5: BX = SI
L_0BB7: DX = BX
L_0BB9: BX = CINT(N_D2F8!)
L_0BBC: BX = BX * 2 ^ 1
L_0BBE: BX = BX * 2 ^ 1
L_0BC0: BX = BX + &H4288
L_0BC4: SWAP BX, DX
L_0BC6: CX = BX
L_0BC8: BX = &HD40E
L_0BCB: RT3F_61(BX=&HD40E, DX=BX, SI=&HD2F8, DI=DI, CX=&HD2F8, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0BCE: SI = CX
L_0BD0: DI = &H495C
L_0BD3: RT3F_7F(BX=BX, DX=DX, SI=CX, DI=&H495C, CX=CX, AX=AX)
L_0BD6: DI = &HD2F8
L_0BD9: N_D2F8! = FAC!
L_0BDC: SI = DI
L_0BDE: DI = &HD308
L_0BE1: CompareLeft! = N_D2F8!: CompareRight! = 8
L_0BE4: IF CompareLeft! <= CompareRight! THEN GOTO L_0BB2
L_0BE6: BX = &HD40E
L_0BE9: DX = &H488C
L_0BEC: RT3F_61(BX=&HD40E, DX=&H488C, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0BEF: DI = &HD5F0
L_0BF2: SI = &H19B8
L_0BF5: N_D5F0! = N_19B8!
L_0BF8: SI = &HD300
L_0BFB: FAC! = 0
L_0BFE: GOTO L_0C24
L_0C01: ' alignment NOP
L_0C02: SI = &HD2F8
L_0C05: BX = SI
L_0C07: DX = BX
L_0C09: BX = CINT(N_D2F8!)
L_0C0C: DI = BX
L_0C0E: DI = DI * 2 ^ 1
L_0C10: DI = DI * 2 ^ 1
L_0C12: DI = DI + &H1850
L_0C16: SI = &HD300
L_0C19: N(DI) = 0
L_0C1C: SI = DX
L_0C1E: DI = &H495C
L_0C21: RT3F_7F(BX=BX, DX=&HD2F8, SI=&HD2F8, DI=&H495C, CX=CX, AX=AX)
L_0C24: DI = &HD2F8
L_0C27: N_D2F8! = FAC!
L_0C2A: SI = DI
L_0C2C: DI = &HD5F4
L_0C2F: CompareLeft! = N_D2F8!: CompareRight! = 2600
L_0C32: IF CompareLeft! <= CompareRight! THEN GOTO L_0C02
L_0C34: DI = &H1988
L_0C37: SI = &HD30C
L_0C3A: N_1988! = 3
L_0C3D: DI = &H198C
L_0C40: SI = &HD5F8
L_0C43: N_198C! = 5000
L_0C46: DI = &H199C
L_0C49: SI = &HD5FC
L_0C4C: N_199C! = 27
L_0C4F: DI = &H19B4
L_0C52: SI = &HD5F0
L_0C55: N_19B4! = N_D5F0!
L_0C58: DI = &H19B8
L_0C5B: N_19B8! = N_D5F0!
L_0C5E: BX = DI
L_0C60: DI = &H3AE8
L_0C63: SI = &HD314
L_0C66: N_3AE8! = 2
L_0C69: DI = &H3AF0
L_0C6C: DX = SI
L_0C6E: SI = &HD600
L_0C71: N_3AF0! = 28
L_0C74: SI = DX
L_0C76: DI = &H3AF4
L_0C79: N_3AF4! = 2
L_0C7C: DI = &H3AF8
L_0C7F: SI = &HD604
L_0C82: N_3AF8! = 7
L_0C85: DI = &H3AFC
L_0C88: N_3AFC! = 7
L_0C8B: DI = &H3B00
L_0C8E: SI = &HD334
L_0C91: N_3B00! = 6
L_0C94: DI = &H3B04
L_0C97: N_3B04! = 6
L_0C9A: SI = BX
L_0C9C: DI = &H495C
L_0C9F: CompareLeft! = N_19B8!: CompareRight! = 1
L_0CA2: IF CompareLeft! = CompareRight! THEN GOTO L_0CA7
L_0CA4: GOTO L_0CAA
L_0CA7: GOSUB L_0E4B
L_0CAA: DI = &H4958
L_0CAD: SI = &H495C
L_0CB0: N_4958! = 1
L_0CB3: GOSUB L_0E7F
L_0CB6: GOTO L_08D3
L_0CB9: DI = &HD58E
L_0CBC: SI = &HD300
L_0CBF: N_D58E! = 0
L_0CC2: RT3D_06(BX=BX, DX=DX, SI=&HD300, DI=&HD58E, CX=CX, AX=AX)
L_0CC5: DX = &HD608
L_0CC8: RT3F_61(BX=BX, DX=&HD608, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0CCB: AX = DX
L_0CCD: BX = &HD60C
L_0CD0: RT3F_62(BX=&HD60C, DX=DX, SI=SI, DI=DI, CX=CX, AX=DX)
L_0CD3: CX = 0
L_0CD6: IF NOT ZF THEN GOTO L_0CD9  ' flags from L_0CD0 CALL RT3F_62
L_0CD8: CX = CX - 1
L_0CD9: BX = &HD612
L_0CDC: RT3F_62(BX=&HD612, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0CDF: DX = 0
L_0CE2: IF NOT ZF THEN GOTO L_0CE5  ' flags from L_0CDC CALL RT3F_62
L_0CE4: DX = DX - 1
L_0CE5: DX = DX OR CX
L_0CE7: CompareLeft! = (DX AND DX): CompareRight! = 0
L_0CE9: IF NOT ZF THEN GOTO L_0CEE  ' flags from L_0CE7 and dx, dx
L_0CEB: GOTO L_0CEF
L_0CEE: RETURN
L_0CEF: BX = &HD618
L_0CF2: AX = &HD608
L_0CF5: RT3F_62(BX=&HD618, DX=DX, SI=SI, DI=DI, CX=CX, AX=&HD608)
L_0CF8: DX = 0
L_0CFB: IF NOT ZF THEN GOTO L_0CFE  ' flags from L_0CF5 CALL RT3F_62
L_0CFD: DX = DX - 1
L_0CFE: BX = &HD61E
L_0D01: RT3F_62(BX=&HD61E, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0D04: CX = 0
L_0D07: IF NOT ZF THEN GOTO L_0D0A  ' flags from L_0D01 CALL RT3F_62
L_0D09: CX = CX - 1
L_0D0A: CX = CX OR DX
L_0D0C: CompareLeft! = (CX AND CX): CompareRight! = 0
L_0D0E: IF NOT ZF THEN GOTO L_0D13  ' flags from L_0D0C and cx, cx
L_0D10: GOTO L_0D1D
L_0D13: DI = &HD58E
L_0D16: SI = &H495C
L_0D19: N_D58E! = 1
L_0D1C: RETURN
L_0D1D: SI = &H4958
L_0D20: RT3F_1D(BX=BX, DX=DX, SI=&H4958, DI=DI, CX=CX, AX=AX)
L_0D23: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0D25: IF NOT ZF THEN GOTO L_0D2A  ' flags from L_0D23 and bx, bx
L_0D27: GOTO L_0D2D
L_0D2A: GOSUB L_0E7F
L_0D2D: GOTO L_0CB9
L_0D2F: DI = &H495C
L_0D32: SI = &HD436
L_0D35: RT3F_7F(BX=BX, DX=DX, SI=&HD436, DI=&H495C, CX=CX, AX=AX)
L_0D38: DI = &H4960
L_0D3B: RT3F_71(BX=BX, DX=DX, SI=SI, DI=&H4960, CX=CX, AX=AX, selector=&H80)
L_0D3F: CompareLeft! = N(SI): CompareRight! = N(DI)
L_0D42: BX = 0
L_0D45: IF CompareLeft! >= CompareRight! THEN GOTO L_0D48
L_0D47: BX = BX - 1
L_0D48: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0D4A: IF (SF = OF) THEN GOTO L_0D4E  ' flags from L_0D48 and bx, bx
L_0D4C: BX = -BX
L_0D4E: FAC! = CSNG(BX)
L_0D51: BX = SI
L_0D53: RT3F_95(BX=SI, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX, selector=&H80)
L_0D57: DI = BX
L_0D59: N(BX) = FAC!
L_0D5C: BX = &HF
L_0D5F: LocateRow% = BX
L_0D62: BX = &HA
L_0D65: LOCATE LocateRow%, BX
L_0D68: ' Begin PRINT statement; following items share one statement
L_0D6B: SI = DI
L_0D6D: BX = CINT(N(BX))
L_0D70: BX = BX * 2 ^ 1
L_0D72: BX = BX * 2 ^ 1
L_0D74: BX = BX + &HD34C
L_0D78: PRINT S(BX);  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0D7B: PRINT  ' End statement / flush
L_0D7E: GOTO L_0A00
L_0D81: DI = &H19C4
L_0D84: SI = &H495C
L_0D87: RT3F_97(BX=BX, DX=DX, SI=&H495C, DI=&H19C4, CX=CX, AX=AX)
L_0D8A: BX = SI
L_0D8C: N(DI) = FAC!
L_0D8F: SI = BX
L_0D91: DX = DI
L_0D93: DI = &H4958
L_0D96: RT3F_97(BX=SI, DX=DI, SI=SI, DI=&H4958, CX=CX, AX=AX)
L_0D99: N(DI) = FAC!
L_0D9C: CX = BX
L_0D9E: BX = &H10
L_0DA1: LocateRow% = BX
L_0DA4: BX = &HA
L_0DA7: LOCATE LocateRow%, BX
L_0DAA: ' Begin PRINT statement; following items share one statement
L_0DAD: SI = DX
L_0DAF: BX = CINT(N(DX))
L_0DB2: BX = BX * 2 ^ 1
L_0DB4: BX = BX * 2 ^ 1
L_0DB6: BX = BX + &HD3EA
L_0DBA: PRINT S(BX);  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0DBD: PRINT  ' End statement / flush
L_0DC0: SWAP CX, DI
L_0DC2: SI = CX
L_0DC4: CompareLeft! = N(DI): CompareRight! = N(BX)
L_0DC7: IF CompareLeft! = CompareRight! THEN GOTO L_0DCC
L_0DC9: GOTO L_0DDB
L_0DCC: DI = &HD724
L_0DCF: SI = &HD300
L_0DD2: N_D724! = 0
L_0DD5: GOSUB L_0E7F
L_0DD8: GOTO L_0DEC
L_0DDB: BX = &H63
L_0DDE: DX = &HD300
L_0DE1: RT3E_5E(BX=&H0063, DX=&HD300, SI=SI, DI=DI, CX=CX, AX=AX)
L_0DE4: BX = &HFFFF
L_0DE7: DX = BX
L_0DE9: RT3E_5F(BX=&HFFFF, DX=&HFFFF, SI=SI, DI=DI, CX=CX, AX=AX)
L_0DEC: GOTO L_0A00
L_0DEF: SI = &H19B8
L_0DF2: CompareLeft! = N_19B8!: CompareRight! = 0
L_0DF5: IF CompareLeft! <> CompareRight! THEN GOTO L_0DFA
L_0DF7: GOTO L_0A00
L_0DFA: DI = &H19B4
L_0DFD: SI = &H495C
L_0E00: RT3F_97(BX=BX, DX=DX, SI=&H495C, DI=&H19B4, CX=CX, AX=AX)
L_0E03: N(DI) = FAC!
L_0E06: BX = &H11
L_0E09: LocateRow% = BX
L_0E0C: BX = &HA
L_0E0F: LOCATE LocateRow%, BX
L_0E12: ' Begin PRINT statement; following items share one statement
L_0E15: SI = DI
L_0E17: BX = CINT(N(DI))
L_0E1A: BX = BX * 2 ^ 1
L_0E1C: BX = BX * 2 ^ 1
L_0E1E: BX = BX + &HD3A6
L_0E22: PRINT S(BX);  'M: string descriptor evidence overrides conflicting single-print ledger entry
L_0E25: PRINT  ' End statement / flush
L_0E28: SI = DI
L_0E2A: DI = &H19B8
L_0E2D: CompareLeft! = N(DI): CompareRight! = N_19B8!
L_0E30: BX = 0
L_0E33: IF CompareLeft! = CompareRight! THEN GOTO L_0E36
L_0E35: BX = BX - 1
L_0E36: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0E38: IF (SF = OF) THEN GOTO L_0E3C  ' flags from L_0E36 and bx, bx
L_0E3A: BX = -BX
L_0E3C: FAC! = CSNG(BX)
L_0E3F: DI = &H19BC
L_0E42: N_19BC! = FAC!
L_0E45: GOSUB L_0E4B
L_0E48: GOTO L_0A00
L_0E4B: DI = &HD334
L_0E4E: SI = &H19B4
L_0E51: FAC! = N_19B4! * 6
L_0E54: DI = &HD30C
L_0E57: BX = SI
L_0E59: RT3F_81(BX=&H19B4, DX=DX, SI=&H19B4, DI=&HD30C, CX=CX, AX=AX)
L_0E5C: DX = BX
L_0E5E: BX = CINT(FAC!)
L_0E61: SWAP BX, DX
L_0E63: CX = BX
L_0E65: BX = 1
L_0E68: RT3E_4A(BX=&H0001, DX=BX, SI=SI, DI=DI, CX=BX, AX=AX)
L_0E6B: DI = CX
L_0E6D: SI = &HD320
L_0E70: RT3F_97(BX=BX, DX=DX, SI=&HD320, DI=CX, CX=CX, AX=AX)
L_0E73: BX = CINT(FAC!)
L_0E76: DX = BX
L_0E78: BX = 2
L_0E7B: RT3E_4A(BX=&H0002, DX=BX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0E7E: RETURN
L_0E7F: BX = 0
L_0E81: RT3D_44(BX=&H0000, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0E84: CompareLeft! = BX: CompareRight! = 0X1F
L_0E87: DX = 0
L_0E8A: IF (ZF OR (SF <> OF)) THEN GOTO L_0E8D  ' flags from L_0E84 cmp bx, 0x1f
L_0E8C: DX = DX - 1
L_0E8D: SI = &HD426
L_0E90: CompareLeft! = N_D426!: CompareRight! = 0
L_0E93: BX = 0
L_0E96: IF CompareLeft! <> CompareRight! THEN GOTO L_0E99
L_0E98: BX = BX - 1
L_0E99: BX = BX OR DX
L_0E9B: CompareLeft! = (BX AND BX): CompareRight! = 0
L_0E9D: IF NOT ZF THEN GOTO L_0EA2  ' flags from L_0E9B and bx, bx
L_0E9F: GOTO L_0EA3
L_0EA2: RETURN
L_0EA3: DI = &H495C
L_0EA6: SI = &HD724
L_0EA9: RT3F_7F(BX=BX, DX=DX, SI=&HD724, DI=&H495C, CX=CX, AX=AX)
L_0EAC: BX = CINT(FAC!)
L_0EAF: DX = BX
L_0EB1: BX = &H4948
L_0EB4: CX = 3
L_0EB7: RT3D_0A(BX=&H4948, DX=BX, SI=SI, DI=DI, CX=&H0003, AX=AX)
L_0EBA: DX = &HD728
L_0EBD: RT3F_61(BX=BX, DX=&HD728, SI=SI, DI=DI, CX=CX, AX=AX)  'Direction disputed: ledger BX<-DX, literal initialization suggests DX<-BX; preserve call
L_0EC0: BX = DX
L_0EC2: RT3F_18(BX=DX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0EC5: AX = &HD72C
L_0EC8: RT3F_55(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=&HD72C)
L_0ECB: PLAY S(BX)  'M: MODULE_CONSTANTS music literals; STATUS data lane
L_0ECE: DI = &HD30C
L_0ED1: SI = &HD724
L_0ED4: RT3F_7F(BX=BX, DX=DX, SI=&HD724, DI=&HD30C, CX=CX, AX=AX)
L_0ED7: DI = SI
L_0ED9: N(SI) = FAC!
L_0EDC: BX = &H4948
L_0EDF: RT3F_BA(BX=&H4948, DX=DX, SI=SI, DI=SI, CX=CX, AX=AX)
L_0EE2: FAC! = CSNG(BX)
L_0EE5: CompareLeft! = FAC!: CompareRight! = N(DI)
L_0EE8: IF CompareLeft! < CompareRight! THEN GOTO L_0EED
L_0EEA: GOTO L_0EF3
L_0EED: SI = &HD732
L_0EF0: N(DI) = 0
L_0EF3: GOTO L_0E7F
```

## Unknowns

Counts are static executable-region call sites, excluding metadata and inline payloads; no runtime loop multiplier. Every call below remains explicit with register arguments in the transcription.

| Call | Count |
|---|---:|
| RT3D_03 | 1 |
| RT3D_06 | 4 |
| RT3D_0A | 1 |
| RT3D_13 | 1 |
| RT3D_43 | 6 |
| RT3D_44 | 4 |
| RT3E_1E | 2 |
| RT3E_20 | 2 |
| RT3E_21 | 2 |
| RT3E_32 | 2 |
| RT3E_3C | 1 |
| RT3E_48 | 1 |
| RT3E_4A | 4 |
| RT3E_5B | 1 |
| RT3E_5E | 1 |
| RT3E_5F | 1 |
| RT3E_84 | 6 |
| RT3E_85 | 6 |
| RT3E_86 | 6 |
| RT3E_8D | 1 |
| RT3F_18 | 1 |
| RT3F_1D | 11 |
| RT3F_2D | 1 |
| RT3F_55 | 1 |
| RT3F_5E | 1 |
| RT3F_61 | 12 |
| RT3F_62 | 6 |
| RT3F_71 | 1 |
| RT3F_7A | 1 |
| RT3F_7F | 27 |
| RT3F_81 | 1 |
| RT3F_95 | 1 |
| RT3F_97 | 5 |
| RT3F_99 | 2 |
| RT3F_9B | 1 |
| RT3F_B6 | 20 |
| RT3F_B7 | 20 |
| RT3F_B8 | 20 |
| RT3F_BA | 1 |

Unresolved ADD/SUB variants are intentionally RT3F_7F/81. String assignment direction and PRINT 6E typing conflict with the current ledger; confirm routine bodies before finalizing. Unknown runtime clobbers can affect register-derived arguments; register-level statements remain authoritative where an address cannot be propagated. Integer bit operations use 16-bit BASIC booleans (-1 true).

## Variables

| Address | Type | Inferred name | Evidence / confidence |
|---|---|---|---|
| &H1988 | MBF single | N_1988! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H198C | MBF single | N_198C! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H199C | MBF single | N_199C! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19A0 | MBF single | N_19A0! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19A4 | MBF single | N_19A4! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19A8 | MBF single | N_19A8! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19AC | MBF single | N_19AC! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19B4 | MBF single | N_19B4! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19B8 | MBF single | N_19B8! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19BC | MBF single | N_19BC! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19C0 | MBF single | N_19C0! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19C4 | MBF single | N_19C4! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H3AE8 | MBF single | N_3AE8! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H3AF0 | MBF single | N_3AF0! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H3AF4 | MBF single | N_3AF4! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H3AF8 | MBF single | N_3AF8! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H3AFC | MBF single | N_3AFC! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H3B00 | MBF single | N_3B00! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H3B04 | MBF single | N_3B04! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H494C | string descriptor | S_494C$ | literal 'MBMLT126'; H address, M string interpretation |
| &H4958 | MBF single | N_4958! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H495C | MBF single | N_495C! | constant 1; H address, H numeric storage |
| &H4960 | MBF single | N_4960! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD2E6 | string descriptor | S_D2E6$ | literal 'title'; H address, M string interpretation |
| &HD2F8 | MBF single | N_D2F8! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD2FC | MBF single | N_D2FC! | constant 13; H address, H numeric storage |
| &HD300 | MBF single | N_D300! | constant 0; H address, H numeric storage |
| &HD304 | MBF single | N_D304! | constant 15; H address, H numeric storage |
| &HD308 | MBF single | N_D308! | constant 8; H address, H numeric storage |
| &HD30C | MBF single | N_D30C! | constant 3; H address, H numeric storage |
| &HD310 | MBF single | N_D310! | constant 4; H address, H numeric storage |
| &HD314 | MBF single | N_D314! | constant 2; H address, H numeric storage |
| &HD318 | MBF single | N_D318! | constant 24; H address, H numeric storage |
| &HD31C | MBF single | N_D31C! | constant 53; H address, H numeric storage |
| &HD320 | MBF single | N_D320! | constant 5; H address, H numeric storage |
| &HD324 | MBF single | N_D324! | constant 10; H address, H numeric storage |
| &HD328 | MBF single | N_D328! | constant 99; H address, H numeric storage |
| &HD32C | MBF single | N_D32C! | constant 49; H address, H numeric storage |
| &HD330 | MBF single | N_D330! | constant 22; H address, H numeric storage |
| &HD334 | MBF single | N_D334! | constant 6; H address, H numeric storage |
| &HD344 | string descriptor | S_D344$ | literal 'LOGO'; H address, M string interpretation |
| &HD412 | MBF single | N_D412! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD416 | MBF single | N_D416! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD41A | MBF single | N_D41A! | constant 199; H address, H numeric storage |
| &HD41E | MBF single | N_D41E! | constant 100; H address, H numeric storage |
| &HD422 | MBF single | N_D422! | constant 150; H address, H numeric storage |
| &HD426 | MBF single | N_D426! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD42A | MBF single | N_D42A! | constant 50; H address, H numeric storage |
| &HD42E | MBF single | N_D42E! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD432 | MBF single | N_D432! | constant 2.4; H address, H numeric storage |
| &HD436 | MBF single | N_D436! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD43A | string descriptor | S_D43A$ | literal 'Version 1.0                    3/18/88'; H address, M string interpretation |
| &HD464 | string descriptor | S_D464$ | literal 'copyright 1988 by Winston Douglas Wood'; H address, M string interpretation |
| &HD48E | string descriptor | S_D48E$ | literal '1-Play Star Command'; H address, M string interpretation |
| &HD4A6 | string descriptor | S_D4A6$ | literal '2-Begin New Game'; H address, M string interpretation |
| &HD4BA | string descriptor | S_D4BA$ | literal '3-'; H address, M string interpretation |
| &HD4C0 | string descriptor | S_D4C0$ | literal '4-'; H address, M string interpretation |
| &HD4C6 | string descriptor | S_D4C6$ | literal '5-'; H address, M string interpretation |
| &HD4CC | string descriptor | S_D4CC$ | literal ' portions of this product copyrighted'; H address, M string interpretation |
| &HD4F6 | string descriptor | S_D4F6$ | literal ' by Microsoft Corporation   1982-1987'; H address, M string interpretation |
| &HD520 | MBF single | N_D520! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD524 | MBF single | N_D524! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD528 | MBF single | N_D528! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD52C | MBF single | N_D52C! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD530 | string descriptor | S_D530$ | literal 'STARPORT'; H address, M string interpretation |
| &HD53C | string descriptor | S_D53C$ | literal 'Starting a new game will erase your'; H address, M string interpretation |
| &HD564 | string descriptor | S_D564$ | literal 'old characters. Start a new game?(Y/N)'; H address, M string interpretation |
| &HD58E | MBF single | N_D58E! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD592 | string descriptor | S_D592$ | literal 'Are you sure you want to start a new'; H address, M string interpretation |
| &HD5BA | string descriptor | S_D5BA$ | literal 'game? (Y/N)'; H address, M string interpretation |
| &HD5CA | string descriptor | S_D5CA$ | literal 'Starting a new game. Please wait.'; H address, M string interpretation |
| &HD5F0 | MBF single | N_D5F0! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD5F4 | MBF single | N_D5F4! | constant 2600; H address, H numeric storage |
| &HD5F8 | MBF single | N_D5F8! | constant 5000; H address, H numeric storage |
| &HD5FC | MBF single | N_D5FC! | constant 27; H address, H numeric storage |
| &HD600 | MBF single | N_D600! | constant 28; H address, H numeric storage |
| &HD604 | MBF single | N_D604! | constant 7; H address, H numeric storage |
| &HD724 | MBF single | N_D724! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &HD732 | MBF single | N_D732! | constant 0; H address, H numeric storage |

| &H4896 | string descriptor | S_4896$ | MODULE_CONSTANTS literal `O1 E3>D+8E4<B4>C4<G+4 A4 E4 O1F3> E8D4< F4F+3>E8D4<F+4G3> F8E4< G4G+3>F8E4< B4 O2C4<A4> C4 E4 A3P64<A8P64A4>C4< B4G+4>F4E4< A4 E4P64 E3 A8P64 A4 E4P64 E3G+8A4>C4< B4E4< A2 P1`; H identity |
| &HD2F0 | string descriptor | S_D2F0$ | MODULE_CONSTANTS literal `NAME`; H identity |
| &HD338 | string descriptor | S_D338$ | MODULE_CONSTANTS literal `CHARNAME`; H identity |
| &HD358 | string descriptor | S_D358$ | MODULE_CONSTANTS literal `Hard Disk Drive       `; H identity |
| &HD372 | string descriptor | S_D372$ | MODULE_CONSTANTS literal `One Floppy Disk Drive `; H identity |
| &HD38C | string descriptor | S_D38C$ | MODULE_CONSTANTS literal `Two Floppy Disk Drives`; H identity |
| &HD3AE | string descriptor | S_D3AE$ | MODULE_CONSTANTS literal `Color Graphic Adaptor    `; H identity |
| &HD3CC | string descriptor | S_D3CC$ | MODULE_CONSTANTS literal `Enhanced Graphics Adaptor`; H identity |
| &HD3F2 | string descriptor | S_D3F2$ | MODULE_CONSTANTS literal `Sound On `; H identity |
| &HD400 | string descriptor | S_D400$ | MODULE_CONSTANTS literal `Sound Off`; H identity |
| &HD40E | string descriptor | S_D40E$ | MODULE_CONSTANTS literal ``; H identity |
| &HD60C | string descriptor | S_D60C$ | MODULE_CONSTANTS literal `n`; H identity |
| &HD612 | string descriptor | S_D612$ | MODULE_CONSTANTS literal `N`; H identity |
| &HD618 | string descriptor | S_D618$ | MODULE_CONSTANTS literal `y`; H identity |
| &HD61E | string descriptor | S_D61E$ | MODULE_CONSTANTS literal `Y`; H identity |
| &HD72C | string descriptor | S_D72C$ | MODULE_CONSTANTS literal `X`; H identity |

Indirect operands retain N(SI), N(DI), S(BX), and MEMORY(BX); their addresses are expressions in the transcription, not invented variables. BX/DX/SI/DI/CX/AX are 16-bit compiler temporaries; FAC! is the runtime single accumulator at DS:001A (H ledger). LocateRow%, PutX%, PutY%, CompareLeft!, CompareRight! are explanatory temporaries, not original game symbols.
