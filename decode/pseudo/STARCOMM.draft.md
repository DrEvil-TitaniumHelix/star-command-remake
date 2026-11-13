# STARCOMM: first-draft BASIC-style pseudocode

Evidence: `decode/listings/STARCOMM.lst`, `decode/data/MODULE_CONSTANTS.md` (STARCOMM.EXE section), and `decode/brun30/RT_LEDGER.md` read 2026-10-15. This is a conservative first draft for the verifying lane, not a decode-gate declaration.

Labels are listing/code offsets. Register temporaries deliberately retain compiler plumbing around unresolved calls. `N(address)` is a four-byte MBF single; `S(address)` is a string descriptor; MEMORY is an untyped array address. Address names carry H confidence for identity, no inferred gameplay meaning. Constants are substituted only where the register provenance is locally known. Register arguments on unresolved calls are the known entry values, otherwise the live register symbol; other runtime clobbers remain unknown. CompareLeft/Right model the immediately preceding compare/test flags; intervening MOV does not change flags. ZF/CF/SF/OF retain the x86 flags from the annotated producing operation; for unresolved runtimes their values remain unknown. Arithmetic, bit operations and comparisons update those flags as on the source CPU. Signed branches use SF/OF. All unannotated supported numeric operations follow H ledger entries. LOCATE is H; PRINT grouping M/H as in ledger.

The listing extends into metadata. Executable-path transcription stops at &H0128 (exclusive); later bytes are not claimed as executable. STARCOMM terminates at runtime call 0125; the apparent 0128 arithmetic is outside the reachable launcher path.

## Flow and screens

Launcher initializes runtime/display settings, BLOADs CHARINFO.BAS at offset 6224, copies constants into shared values, branches on shared flags, then CHAINs STARTUP. No text screen is proven here. Unknown display/palette calls remain explicit.

## Pseudocode

```basic
L_0040: BX = 1
L_0043: RT3E_5B(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0046: DX = BX
L_0048: BX = 0
L_004A: RT3E_33(BX=&H0000, DX=BX, SI=SI, DI=DI, CX=CX, AX=AX)
L_004D: SWAP DX, BX
L_004F: RT3E_35(BX=DX, DX=BX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0052: CX = BX
L_0054: BX = &HFFFF
L_0057: RT3E_32(BX=&HFFFF, DX=DX, SI=SI, DI=DI, CX=BX, AX=AX)
L_005A: SWAP CX, BX
L_005C: RT3E_5B(BX=CX, DX=DX, SI=SI, DI=DI, CX=BX, AX=AX)
L_005F: SWAP DX, BX
L_0061: RT3E_33(BX=DX, DX=BX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0064: BX = DX
L_0066: RT3E_35(BX=DX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0069: SWAP CX, BX
L_006B: RT3E_32(BX=CX, DX=DX, SI=SI, DI=DI, CX=BX, AX=AX)
L_006E: BX = CX
L_0070: RT3E_5B(BX=CX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0073: BX = 0
L_0075: RT3E_3C(BX=&H0000, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0078: BX = &H1850
L_007B: FAC! = CSNG(BX)
L_007E: BX = &H40FA
L_0081: DX = &H1A
L_0084: BLOAD "CHARINFO.BAS", N(DX)  'M: DX points to single offset; preceding CSNG supplies FAC
L_0087: DI = &H19B8
L_008A: SI = &H410A
L_008D: N_19B8! = 0
L_0090: DX = &H10F
L_0093: RT3F_02(BX=&H40FA, DX=&H010F, SI=&H410A, DI=&H19B8, CX=CX, AX=AX)
L_0096: BX = 1
L_0099: DX = 9
L_009C: RT3E_4A(BX=&H0001, DX=&H0009, SI=SI, DI=DI, CX=CX, AX=AX)
L_009F: BX = 2
L_00A2: DX = 4
L_00A5: RT3E_4A(BX=&H0002, DX=&H0004, SI=SI, DI=DI, CX=CX, AX=AX)
L_00A8: DI = &H19B8
L_00AB: SI = &H410E
L_00AE: N_19B8! = 1
L_00B1: SI = &H19B8
L_00B4: CompareLeft! = N_19B8!: CompareRight! = 0
L_00B7: BX = 0
L_00BA: IF CompareLeft! <> CompareRight! THEN GOTO L_00BD
L_00BC: BX = BX - 1
L_00BD: DI = &H410E
L_00C0: SI = &H19BC
L_00C3: CompareLeft! = N_19BC!: CompareRight! = 1
L_00C6: DX = 0
L_00C9: IF CompareLeft! <> CompareRight! THEN GOTO L_00CC
L_00CB: DX = DX - 1
L_00CC: DX = DX OR BX
L_00CE: CompareLeft! = (DX AND DX): CompareRight! = 0
L_00D0: IF NOT ZF THEN GOTO L_00D5  ' flags from L_00CE and dx, dx
L_00D2: GOTO L_00E1
L_00D5: DI = &H19B4
L_00D8: SI = &H410A
L_00DB: N_19B4! = 0
L_00DE: GOTO L_00EA
L_00E1: DI = &H19B4
L_00E4: SI = &H410E
L_00E7: N_19B4! = 1
L_00EA: DI = &H410E
L_00ED: SI = &H19B8
L_00F0: CompareLeft! = N_19B8!: CompareRight! = 1
L_00F3: BX = 0
L_00F6: IF CompareLeft! <> CompareRight! THEN GOTO L_00F9
L_00F8: BX = BX - 1
L_00F9: SI = &H19B4
L_00FC: CompareLeft! = N_19B4!: CompareRight! = 0
L_00FF: DX = 0
L_0102: IF CompareLeft! <> CompareRight! THEN GOTO L_0105
L_0104: DX = DX - 1
L_0105: DX = DX AND BX: CompareLeft! = (DX AND BX): CompareRight! = 0
L_0107: CompareLeft! = (DX AND DX): CompareRight! = 0
L_0109: IF NOT ZF THEN GOTO L_010E  ' flags from L_0107 and dx, dx
L_010B: GOTO L_0119
L_010E: BX = 0
L_0110: RT3E_33(BX=&H0000, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0113: BX = 1
L_0116: RT3E_35(BX=&H0001, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0119: BX = &H4112
L_011C: CHAIN "STARTUP"  'M: MODULE_CONSTANTS destination literal; STATUS data lane
L_011F: BX = &HA1
L_0122: RT3F_09(BX=&H00A1, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
L_0125: RT3E_02(BX=BX, DX=DX, SI=SI, DI=DI, CX=CX, AX=AX)
```

## Unknowns

Counts are static executable-region call sites, excluding metadata and inline payloads; no runtime loop multiplier. Every call below remains explicit with register arguments in the transcription.

| Call | Count |
|---|---:|
| RT3E_02 | 1 |
| RT3E_32 | 2 |
| RT3E_33 | 3 |
| RT3E_35 | 3 |
| RT3E_3C | 1 |
| RT3E_4A | 2 |
| RT3E_5B | 3 |
| RT3F_02 | 1 |
| RT3F_09 | 1 |

Unresolved ADD/SUB variants are intentionally RT3F_7F/81. String assignment direction and PRINT 6E typing conflict with the current ledger; confirm routine bodies before finalizing. Unknown runtime clobbers can affect register-derived arguments; register-level statements remain authoritative where an address cannot be propagated. Integer bit operations use 16-bit BASIC booleans (-1 true).

## Variables

| Address | Type | Inferred name | Evidence / confidence |
|---|---|---|---|
| &H19B4 | MBF single | N_19B4! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19B8 | MBF single | N_19B8! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H19BC | MBF single | N_19BC! | typed runtime operand in labeled transcription; H address, H numeric storage |
| &H40FA | string descriptor | S_40FA$ | literal 'CHARINFO.BAS'; H address, M string interpretation |
| &H410A | MBF single | N_410A! | constant 0; H address, H numeric storage |
| &H410E | MBF single | N_410E! | constant 1; H address, H numeric storage |
| &H4112 | string descriptor | S_4112$ | literal 'STARTUP'; H address, M string interpretation |


Indirect operands retain N(SI), N(DI), S(BX), and MEMORY(BX); their addresses are expressions in the transcription, not invented variables. BX/DX/SI/DI/CX/AX are 16-bit compiler temporaries; FAC! is the runtime single accumulator at DS:001A (H ledger). LocateRow%, PutX%, PutY%, CompareLeft!, CompareRight! are explanatory temporaries, not original game symbols.
