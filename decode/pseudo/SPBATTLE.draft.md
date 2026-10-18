# SPBATTLE — first-draft BASIC-style pseudocode

Evidence: `decode/listings/SPBATTLE.lst` (including its recorded bytes), `decode/data/MODULE_CONSTANTS.md` / SPBATTLE.EXE, `decode/brun30/RT_LEDGER.md`, and the `decode/brun30/rt_asm.txt` bodies cited below, read 2026-10-15. Unresolved operations remain explicit; this is a draft for the module-verification lane.

Only this file is the lane output. The assignment's STATUS.md append is omitted to honor the user's explicit one-file scope.

## Conventions and evidence

- Labels are listing/load-module offsets, not source BASIC line numbers. CALL/RET become GOSUB/RETURN and jumps become GOTO. The collapsed display view gives BASIC statements; the complete transcription retains register calculations around those statements.
- `N_AAAA!` is a four-byte MBF single at DS:AAAA; `S_AAAA$` is a string descriptor there. N(expr), S(expr), BYTE(expr), WORD(expr), MEMORY(expr) retain computed addresses. FAC! aliases DS:001A; DAC# is the double accumulator at DS:0016..001D. AX/BX/CX/DX/SI/DI/BP are compiler/runtime registers, not inferred game variables.
- The expanded RT_LEDGER read during this assignment supplies H meanings for the rendered routines unless marked M at a call. The runtime tag preserves the source identity; the BASIC expression denotes its main operation while original ABI side effects/flags still apply. This is semantic pseudocode, not executable BASIC.
- Numeric register constants are substituted only from local setups; propagation stops at branch targets and nontrivial calls. Integer calculations wrap to 16 bits. IMUL yields the signed product in DX:AX. CompareLeft/Right are snapshots; ZF/CF/SF/OF retain CPU semantics. DEC/INC preserve CF; NOT preserves all flags.
- RT3F_61 assigns S(DX)=S(BX), H expanded-ledger correction, consistent with 9DC4..9DD0. RT3F_62 compares strings in AX/BX (H). 3F_6E prints a string plus newline, 3F_6A prints a string with semicolon, 3F_6B prints a single plus newline, and 3F_67 prints a single with semicolon (H). 3E_79 flushes without inserting CR/LF. Earlier disputed labels have been superseded by the new ledger.
- ARGPUSH/ARGS() represent the BASIC statement argument buffer: 3E_42/33 push a supplied argument, 43 pushes an omission, and LOCATE/COLOR/SCREEN consume the arguments plus the final BX. No phantom row is introduced for LOCATE with omitted arguments.
- COORD(value,flag) means N(value) when flag=-1, or the integer value when flag=0 (H ledger 0DC92). PUT action DL is preserved with DH selecting the far-array form; the PSET=0/PRESET=1/AND=2/OR=3/XOR=4 mapping remains M. LINE BOXMODE(DX) means -1 plain, 0 B, 1 BF; CX is style (-1 omitted). GET CAPACITY(DX) is a word capacity, zero meaning descriptor-derived.
- INPUT parsing and destination stores are split by the compiler. INPUT #InputFile%, BUFFER(InputTypes) and INPUT_NEXT MEMORY(BX) denote the parsed typed buffer then its next destination store (H ledger B6/B7/B8). OPENMODE converts 0 INPUT,1 OUTPUT,2 RANDOM,3 APPEND; zero record length is the runtime default.
- TEMP_DESC(string expression) allocates/returns a temporary string descriptor address in BX. T_nn! denotes the runtime temporary slot selected by inline byte b: nn=b AND 7Fh, slot address base+(nn*8), base from runtime DS:0010/0012. The numbered slots are H ledger identities, not game variable names.
- FSTORE makes SI=001A (1E2D..1E38); FLOAD leaves DI=001E after two MOVSWs (1E47..1E4F). These effects are explicit. Other runtime side effects remain implicit in the routine tags.

## Instruction boundaries and inline data

The runtime lane regenerated SPBATTLE.lst during this assignment. Its corrected listing consumes inline payloads but abbreviates long byte columns with '..'. Visible bytes were checked against the original, read-only SPBATTLE.EXE load module; omitted payload bytes came from that same original. No original was modified. The instruction walk applies the newly published inline_args.json conventions:

| Family | Payload | Evidence / confidence |
|---|---|---|
| 3F_71/85/95/9D/8D/A5 | one temp-selector byte | H ledger and helper 1EC3 |
| 3F_AB/AD | one signed scaling byte | H AC66..AC8A; multiply by 2^b |
| 3F_B7 | count followed by count type bytes | H C529..C557; 04 single,03 string,02 integer,08 double |
| 3F_5D/5E | count followed by count little-endian CS-offset words | H 9504..953E, ON GOSUB / ON GOTO |

Table words map to listing offsets by adding 0010h (H expanded ledger, independently all destinations align). ON BX GOSUB preserves the post-table return address; ON BX GOTO does not push a return. Raw tables appear below the transcription. Runtime bounds/error paths remain the original routine's behavior.

Metadata block 16 begins at 7420h (MODULE_CONSTANTS). It is excluded from code and call counts. The thirteen-byte tail 7413..741F follows RETURN at 7412 and has no explicit incoming edge. It is retained as an unclassified tail; the final bytes 89 5E cannot form a complete instruction before metadata and are preserved as bytes. The supplied source-line table contains offsets beyond this module's extent (e.g. 0D0AC), so it is not used to assign source line numbers.

## Flows and screens

Ranges identify evidence for content groups; exact branches, coordinates, conditional fields, calculations and loops are retained in the complete transcription.

| Evidence offsets | Flow / displayed content | Confidence |
|---|---|---|
| 0040..02FF | Drive prefix; shared state; conditional spacesh/CHARINFO/SHIP loading; crew status and role labels; LOGO/NAME/CHARNAME initialization | M literals and patterns |
| 0301, 0333 | Frequently called numeric/data helpers; address names retained | H targets, formulas partly unknown |
| 038E | “Change things?” confirmation | H literal |
| 070A, 07A2, 0807 | Encounter file/record initialization through typed inline input groups | H payload bytes, M grouping, unknown field meanings |
| 141A..16BF | Option prompt, status display and “Press ENTER Key” | H strings |
| 1D76 | “Pilot or ship not ready” | H string; readiness formula remains in code |
| 20C4..219A | Establish communications Y/N; success/failure feedback | H text |
| 21BB..2334 | Communications phase: Plead, Ask, Demand, Bargain/Bribe, Impersonate Diety, None; objectives Fuel, Truce, Tribute, Surrender | H literal wording |
| 257B..28FB | Refusal reactions; fuel transfer, truce/payment, tribute and surrendered valuables | H strings, transfer formulas unresolved where RT calls remain |
| 2C25..2D4B | Battle over/report; survived, docked, surrendered, destroyed | H strings |
| 2F62..3078 | Life-support emergency, repair selection/outcomes and all-dead message | H strings |
| 3246..3374 | Movement phase: rotate CCW/CW, scan, visual, skip, switch, delay, hyperspace | H command labels |
| 3E7B..3EAF | Docking and boarding confirmation | H strings |
| 47DC..4904 | Enemy report: escaped, destroyed, surrendered, in/out of range | H strings |
| 4954..49D1 | Hyperspace attempt and failed/“Sucessfull” feedback | H literal spelling |
| 4AD3..4EA3 | Ships in range, target/command selection, accept/retarget, Wait/Fire/Rapid/Load/Aim | H strings |
| 554E..5A10 | Reload/fire resolution, hit/damage report, ship/crew/hull/armor/shield feedback | H strings, combat formulas partly unknown |
| 5D18..6228 | Other fire/miss/interception, damage absorption, hull/destruction and crew death messages | H strings, attacker/defender field identities unknown |
| 7245..727F | Standard/current/new delay factor (1–9999) | H strings |
| 7339..7412 | Color/status text and numeric iteration helper | H text, helper meaning unknown |

## DATA records

These are the data lane's recovered source records. Their association with specific runtime READ/RESTORE calls remains unresolved; no array dimensions, units or balance-table column meanings are invented.

| Source record | Recovered values |
|---|---|
| 182 | 46,91,60,95,64,109,60,124,46,128,32,124,28,109,32,95 |
| 3693 | 45,135,180,215,315 |
| 3991 | Wait,Fire,Reload,Switch,Aim,Aim more,Best aim,Rapid fire |
| 4254 | 11,2,17,5,20,11,17,17,11,20,5,17,2,11,5,5 |
| 4801 | 1,1,.7,.05,.2,.5,.7,1,1,1,1,1,-15,5,-20,-25,1.1,1,.6,0,.05,.3,.6,1,1,1,1.1,1.2,-15,5,-20,-25,.9,.8,.4,0,0,.1,.4,.6,1,1.5,2,3,-15,5,-20,-25 |
| 4802 | 2.6,2.2,1.5,.25,.4,.7,.9,1,1,1.3,1.7,2.8,-15,5,-20,-25,1,1,.9,0,0,0,0,0,0,0,0,7,0,10,-25,-30 |

Confidence H for the text/values as recorded in MODULE_CONSTANTS; their source line numbers are provenance labels, not trusted code-offset mappings.

## Collapsed BASIC display patterns

Each sequence below is repeated with its compiler operations in the full transcription. Descriptors resolve to literal strings under Variables. PRINT formatting differences remain subject to the routine tags in the full view.

```basic
L_037C: LOCATE 20, 2: PRINT S_71A0$  ' bytes 037C..0393; 'Change things? '
L_1408: LOCATE 24, 3: PRINT S_9EBE$  ' bytes 1408..141F; 'Select Option'
L_1D64: LOCATE 22, 3: PRINT S_9FD0$  ' bytes 1D64..1D7B; 'Pilot or ship not ready'
L_20B2: LOCATE 22, 3: PRINT S_A062$  ' bytes 20B2..20C9; 'Establish communications? (y/n)'
L_21A9: LOCATE 20, 8: PRINT S_A0AE$  ' bytes 21A9..21C0; 'Communications Phase'
L_2251: LOCATE 24, 3: PRINT S_A11E$  ' bytes 2251..2268; 'Choose An Approach: (A-F)'
L_2C13: LOCATE 22, 14: PRINT S_A32C$  ' bytes 2C13..2C2A; 'Battle Over'
L_2C48: LOCATE 1, 14: PRINT S_A33C$  ' bytes 2C48..2C5F; 'BATTLE REPORT'
L_304B: LOCATE 22, 3: PRINT S_A468$  ' bytes 304B..3062; 'support systems your air runs out.'
L_3066: LOCATE 9, 3: PRINT S_A496$  ' bytes 3066..307D; 'You Are All Dead'
L_32EC: LOCATE 24, 3: PRINT S_A50A$  ' bytes 32EC..3303; 'D-Visual'
L_3362: LOCATE 24, 17: PRINT S_A542$  ' bytes 3362..3379; 'H-Jump To Hyperspace'
L_47CA: LOCATE 20, 11: PRINT S_A690$  ' bytes 47CA..47E1; 'Enemy Report'
L_4942: LOCATE 21, 3: PRINT S_A6F8$  ' bytes 4942..4959; 'Attempting jump to hyperspace...'
L_4AC1: LOCATE 21, 3: PRINT S_A740$  ' bytes 4AC1..4AD8; 'Ships In Range: '
L_4E13: LOCATE 23, 3: PRINT S_A788$  ' bytes 4E13..4E2A; 'ENTER to accept   '
L_4E91: LOCATE 24, 3: PRINT S_A7B8$  ' bytes 4E91..4EA8; 'W-Wait F-Fire R-Rapid L-Load M-Aim'
L_5FCB: LOCATE 22, 3: PRINT S_A95C$  ' bytes 5FCB..5FE2; 'Armor reduced.'
L_7327: LOCATE 8, 24: PRINT S_AA9E$  ' bytes 7327..733E; '   '
L_7373: LOCATE 8, 24: PRINT S_AAAA$  ' bytes 7373..738A; 'RED'

```

## Complete offset transcription

### Entry, loading and initialization

```basic
L_0040: BX = &H6F46
L_0043: DX = &H6F42
L_0046: S_6F42$ = S_6F46$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0049: DI = &H6F4A
L_004C: SI = &H19A4
L_004F: CompareLeft! = N_19A4!: CompareRight! = N_6F4A!  ' RT3F_9F
L_0052: IF CompareLeft! = CompareRight! THEN GOTO L_0057  ' flags from L_004F
L_0054: GOTO L_0060
L_0057: BX = &H6F4E
L_005A: S(DX) = S_6F4E$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_005D: GOTO L_0077
L_0060: DI = &H6F54
L_0063: SI = &H19A4
L_0066: CompareLeft! = N_19A4!: CompareRight! = N_6F54!  ' RT3F_9F
L_0069: IF CompareLeft! = CompareRight! THEN GOTO L_006E  ' flags from L_0066
L_006B: GOTO L_0077
L_006E: BX = &H6F58
L_0071: DX = &H6F42
L_0074: S_6F42$ = S_6F58$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0077: DI = &H19C4
L_007A: SI = &H6F4A
L_007D: FAC! = N_6F4A! - N_19C4!  ' RT3F_97
L_0080: DI = &H6F5E
L_0083: N_6F5E! = FAC!: SI = &H001A  ' RT3F_7D
L_0086: SI = &H6F82
L_0089: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_008C: GOTO L_00B6
L_008F: ' Alignment NOP
L_0090: SI = &H6F86
L_0093: BX = SI
L_0095: DX = BX
L_0097: BX = CINT(N_6F86!)  ' RT3F_75
L_009A: BX = BX * (2 ^ 1)
L_009C: CX = BX
L_009E: BX = BX + &H6F62
L_00A2: READ WORD(BX)  ' RT3F_0F
L_00A5: CX = CX + &H6F72
L_00A9: BX = CX
L_00AB: READ WORD(BX)  ' RT3F_0F
L_00AE: SI = DX
L_00B0: DI = &H6F4A
L_00B3: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_00B6: DI = &H6F86
L_00B9: N_6F86! = FAC!: SI = &H001A  ' RT3F_7D
L_00BC: SI = DI
L_00BE: DI = &H6F8A
L_00C1: CompareLeft! = N_6F86!: CompareRight! = N_6F8A!  ' RT3F_9F
L_00C4: IF CompareLeft! <= CompareRight! THEN GOTO L_0090  ' flags from L_00C1
L_00C6: ' Alignment NOP
L_00C7: SI = &H6F8E
L_00CA: CompareLeft! = N_6F8E!: CompareRight! = 0  ' RT3F_A7
L_00CD: IF CompareLeft! <> CompareRight! THEN GOTO L_00D2  ' flags from L_00CA
L_00CF: GOTO L_0115
L_00D2: BX = &H4890
L_00D5: FAC! = CSNG(BX)  ' RT3F_57
L_00D8: BX = &H6F92
L_00DB: DX = &H1A
L_00DE: BLOAD S_6F92$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_00E1: BX = &H1850
L_00E4: FAC! = CSNG(BX)  ' RT3F_57
L_00E7: BX = &H6F9E
L_00EA: DX = &H1A
L_00ED: BLOAD S_6F9E$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_00F0: BX = &H65FC
L_00F3: FAC! = CSNG(BX)  ' RT3F_57
L_00F6: DI = &H18C4
L_00F9: SI = &H70AA
L_00FC: T_00! = FAC!  ' RT3F_71; inline=&H80
L_0100: FAC! = N(SI) - N(DI)  ' RT3F_97
L_0103: BX = &H1A
L_0106: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_0109: AX = &H70AE
L_010C: BX = TEMP_DESC(S_70AE$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_010F: DX = &H6FAA
L_0112: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_0115: BX = &H70C2
L_0118: DX = &H70B6
L_011B: S_70B6$ = S_70C2$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_011E: BX = &H70CA
L_0121: DX = &H70BA
L_0124: S_70BA$ = S_70CA$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0127: BX = &H70D2
L_012A: DX = &H70BE
L_012D: S_70BE$ = S_70D2$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0130: BX = &H70FE
L_0133: DX = &H70DE
L_0136: S_70DE$ = S_70FE$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0139: BX = &H7104
L_013C: DX = &H70E2
L_013F: S_70E2$ = S_7104$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0142: SI = &H710A
L_0145: FAC! = N_710A!: DI = &H001E  ' RT3F_6F
L_0148: GOTO L_017B
L_014B: ' Alignment NOP
L_014C: SI = &H710E
L_014F: BX = SI
L_0151: DX = BX
L_0153: BX = CINT(N_710E!)  ' RT3F_75
L_0156: BX = BX * (2 ^ 1)
L_0158: BX = BX * (2 ^ 1)
L_015A: BX = BX + &H70DA
L_015E: SI = DX
L_0160: DI = &H7112
L_0163: FAC! = N_710E! + N_7112!  ' RT3F_7F
L_0166: CX = BX
L_0168: BX = CINT(FAC!)  ' RT3F_77
L_016B: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_016E: SWAP CX, DX
L_0170: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0173: SI = CX
L_0175: DI = &H6F4A
L_0178: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_017B: DI = &H710E
L_017E: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0181: SI = DI
L_0183: DI = &H7116
L_0186: CompareLeft! = N_710E!: CompareRight! = N_7116!  ' RT3F_9F
L_0189: IF CompareLeft! <= CompareRight! THEN GOTO L_014C  ' flags from L_0186
L_018B: BX = &H711A
L_018E: DX = &H70DA
L_0191: S_70DA$ = S_711A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0194: BX = &H712C
L_0197: DX = &H7120
L_019A: S_7120$ = S_712C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_019D: BX = &H7136
L_01A0: DX = &H7124
L_01A3: S_7124$ = S_7136$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01A6: BX = &H7140
L_01A9: DX = &H7128
L_01AC: S_7128$ = S_7140$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01AF: SI = &H6F8E
L_01B2: CompareLeft! = N_6F8E!: CompareRight! = 0  ' RT3F_A7
L_01B5: IF CompareLeft! <> CompareRight! THEN GOTO L_01BA  ' flags from L_01B2
L_01B7: GOTO L_02FE
L_01BA: BX = &H40F4
L_01BD: FAC! = CSNG(BX)  ' RT3F_57
L_01C0: BX = &H714C
L_01C3: DX = &H1A
L_01C6: BLOAD S_714C$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_01C9: BX = 0
L_01CB: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_01CE: CX = BX
L_01D0: BX = 1
L_01D3: DX = &H7154
L_01D6: OPEN S_7154$ FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_01D9: SI = &H6F4A
L_01DC: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_01DF: GOTO L_01FC
L_01E2: BX = 1
L_01E5: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_01E8: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_01ED: BX = &H715C
L_01F0: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_01F3: DI = &H6F4A
L_01F6: SI = &H710E
L_01F9: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_01FC: DI = &H710E
L_01FF: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0202: SI = DI
L_0204: DI = &H7160
L_0207: CompareLeft! = N_710E!: CompareRight! = N_7160!  ' RT3F_9F
L_020A: IF CompareLeft! <= CompareRight! THEN GOTO L_01E2  ' flags from L_0207
L_020C: SI = &H6F82
L_020F: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0212: GOTO L_023E
L_0215: ' Alignment NOP
L_0216: BX = 1
L_0219: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_021C: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0221: SI = &H710E
L_0224: BX = SI
L_0226: DX = BX
L_0228: BX = CINT(N_710E!)  ' RT3F_75
L_022B: BX = BX * (2 ^ 1)
L_022D: BX = BX * (2 ^ 1)
L_022F: BX = BX + &H4384
L_0233: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0236: SI = DX
L_0238: DI = &H6F4A
L_023B: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_023E: DI = &H710E
L_0241: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0244: SI = DI
L_0246: DI = &H6F54
L_0249: CompareLeft! = N_710E!: CompareRight! = N_6F54!  ' RT3F_9F
L_024C: IF CompareLeft! <= CompareRight! THEN GOTO L_0216  ' flags from L_0249
L_024E: SI = &H6F82
L_0251: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0254: GOTO L_0280
L_0257: ' Alignment NOP
L_0258: BX = 1
L_025B: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_025E: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0263: SI = &H710E
L_0266: BX = SI
L_0268: DX = BX
L_026A: BX = CINT(N_710E!)  ' RT3F_75
L_026D: BX = BX * (2 ^ 1)
L_026F: BX = BX * (2 ^ 1)
L_0271: BX = BX + &H4390
L_0275: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0278: SI = DX
L_027A: DI = &H6F4A
L_027D: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_0280: DI = &H710E
L_0283: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0286: SI = DI
L_0288: DI = &H7164
L_028B: CompareLeft! = N_710E!: CompareRight! = N_7164!  ' RT3F_9F
L_028E: IF CompareLeft! <= CompareRight! THEN GOTO L_0258  ' flags from L_028B
L_0290: BX = 1
L_0293: CLOSE #BX  ' RT3E_21
L_0296: BX = 0
L_0298: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_029B: CX = BX
L_029D: BX = 1
L_02A0: DX = &H7168
L_02A3: OPEN S_7168$ FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_02A6: BX = 1
L_02A9: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_02AC: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_02B1: BX = &H488C
L_02B4: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_02B7: SI = &H6F4A
L_02BA: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_02BD: GOTO L_02E8
L_02C0: BX = 1
L_02C3: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_02C6: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_02CB: SI = &H710E
L_02CE: BX = SI
L_02D0: DX = BX
L_02D2: BX = CINT(N_710E!)  ' RT3F_75
L_02D5: BX = BX * (2 ^ 1)
L_02D7: BX = BX * (2 ^ 1)
L_02D9: BX = BX + &H4288
L_02DD: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_02E0: SI = DX
L_02E2: DI = &H6F4A
L_02E5: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_02E8: DI = &H710E
L_02EB: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_02EE: SI = DI
L_02F0: DI = &H7116
L_02F3: CompareLeft! = N_710E!: CompareRight! = N_7116!  ' RT3F_9F
L_02F6: IF CompareLeft! <= CompareRight! THEN GOTO L_02C0  ' flags from L_02F3
L_02F8: BX = 1
L_02FB: CLOSE #BX  ' RT3E_21
L_02FE: GOTO L_0330

```

### Shared data helpers and preparation

```basic
L_0301: DI = &H717C
L_0304: SI = &H7178
L_0307: FAC! = N_7178! * N_717C!  ' RT3F_8F
L_030A: DI = &H7174
L_030D: FAC! = FAC! + N_7174!  ' RT3F_81
L_0310: DI = &H7180
L_0313: FAC! = FAC! + N_7180!  ' RT3F_81
L_0316: BX = CINT(FAC!)  ' RT3F_77
L_0319: SI = BX
L_031B: SI = SI * (2 ^ 1)
L_031D: SI = SI * (2 ^ 1)
L_031F: SI = SI + &H1850
L_0323: DI = &H7184
L_0326: FAC! = N(SI) + N_7184!  ' RT3F_7F
L_0329: BX = &H1A
L_032C: FAC! = INT(FAC!)  ' RT3D_03
L_032F: RETURN
L_0330: GOTO L_034F
L_0333: DI = &H717C
L_0336: SI = &H718C
L_0339: FAC! = N_718C! * N_717C!  ' RT3F_8F
L_033C: DI = &H7188
L_033F: FAC! = FAC! + N_7188!  ' RT3F_81
L_0342: DI = &H7190
L_0345: FAC! = FAC! + N_7190!  ' RT3F_81
L_0348: BX = &H1A
L_034B: FAC! = INT(FAC!)  ' RT3D_03
L_034E: RETURN
L_034F: GOTO L_036E
L_0352: DI = &H7198
L_0355: SI = &H1988
L_0358: FAC! = N_1988! * N_7198!  ' RT3F_8F
L_035B: DI = &H198C
L_035E: FAC! = FAC! + N_198C!  ' RT3F_81
L_0361: DI = &H719C
L_0364: FAC! = FAC! + N_719C!  ' RT3F_81
L_0367: BX = &H1A
L_036A: FAC! = INT(FAC!)  ' RT3D_03
L_036D: RETURN
L_036E: SI = &H6F8E
L_0371: CompareLeft! = N_6F8E!: CompareRight! = 0  ' RT3F_A7
L_0374: IF CompareLeft! <> CompareRight! THEN GOTO L_0379  ' flags from L_0371
L_0376: GOTO L_06BA
L_0379: GOSUB L_1D8C
L_037C: BX = &H14
L_037F: ARGPUSH BX  ' RT3E_42
L_0382: BX = 2
L_0385: LOCATE ARGS(), BX  ' RT3E_44
L_0388: ' PRINT statement begins ; RT3F_BC
L_038B: BX = &H71A0
L_038E: PRINT S_71A0$;  ' RT3F_6A
L_0391: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_0394: GOSUB L_1FD6
L_0397: SI = &H71B4
L_039A: CompareLeft! = N_71B4!: CompareRight! = 0  ' RT3F_A7
L_039D: IF CompareLeft! <> CompareRight! THEN GOTO L_03A2  ' flags from L_039A
L_039F: GOTO L_06BA
L_03A2: DI = &H1854
L_03A5: SI = &H6F4A
L_03A8: N_1854! = N_6F4A!  ' RT3F_7B
L_03AB: FAC! = TIMER  ' RT3D_43
L_03AE: BX = &H1A
L_03B1: RANDOMIZE FAC!  ' RT3E_09
L_03B4: SI = &H6F82
L_03B7: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_03BA: GOTO L_03DF
L_03BD: ' Alignment NOP
L_03BE: SI = &H710E
L_03C1: BX = SI
L_03C3: DX = BX
L_03C5: BX = CINT(N_710E!)  ' RT3F_75
L_03C8: DI = BX
L_03CA: DI = DI * (2 ^ 1)
L_03CC: DI = DI * (2 ^ 1)
L_03CE: DI = DI + &H1850
L_03D2: SI = &H6F4A
L_03D5: N(DI) = N_6F4A!  ' RT3F_7B
L_03D8: DI = SI
L_03DA: SWAP DX, SI
L_03DC: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_03DF: DI = &H710E
L_03E2: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_03E5: SI = DI
L_03E7: DI = &H71B8
L_03EA: CompareLeft! = N_710E!: CompareRight! = N_71B8!  ' RT3F_9F
L_03ED: IF CompareLeft! <= CompareRight! THEN GOTO L_03BE  ' flags from L_03EA
L_03EF: SI = &H71BC
L_03F2: FAC! = N_71BC!: DI = &H001E  ' RT3F_6F
L_03F5: GOTO L_04CD
L_03F8: SI = &H71C0
L_03FB: BX = SI
L_03FD: DX = BX
L_03FF: BX = CINT(N_71C0!)  ' RT3F_75
L_0402: DI = BX
L_0404: DI = DI * (2 ^ 1)
L_0406: DI = DI * (2 ^ 1)
L_0408: DI = DI + &H1850
L_040C: FAC! = RND  ' RT3D_34
L_040F: BX = DI
L_0411: DI = &H719C
L_0414: CompareLeft! = FAC!: CompareRight! = N_719C!  ' RT3F_A1
L_0417: AX = 0
L_041A: IF CompareLeft! >= CompareRight! THEN GOTO L_041D  ' flags from L_0414
L_041C: AX = AX - 1
L_041D: CX = 0xF
L_0420: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_0422: DX = 2
L_0425: DX = DX - AX
L_0427: SWAP DX, BX
L_0429: FAC! = CSNG(BX)  ' RT3F_57
L_042C: DI = DX
L_042E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0431: DI = &H6F4A
L_0434: SI = &H71C0
L_0437: FAC! = N_71C0! + N_6F4A!  ' RT3F_7F
L_043A: BX = SI
L_043C: DX = BX
L_043E: BX = CINT(FAC!)  ' RT3F_77
L_0441: DI = BX
L_0443: DI = DI * (2 ^ 1)
L_0445: DI = DI * (2 ^ 1)
L_0447: DI = DI + &H1850
L_044B: SI = &H71C4
L_044E: N(DI) = N_71C4!  ' RT3F_7B
L_0451: SI = DX
L_0453: DI = &H6F54
L_0456: FAC! = N(SI) + N_6F54!  ' RT3F_7F
L_0459: BX = CINT(FAC!)  ' RT3F_77
L_045C: SI = BX
L_045E: SI = SI * (2 ^ 1)
L_0460: SI = SI * (2 ^ 1)
L_0462: SI = SI + &H1850
L_0466: SWAP SI, DI
L_0468: BX = SI
L_046A: SI = &H71C8
L_046D: N(DI) = N_71C8!  ' RT3F_7B
L_0470: SI = DX
L_0472: DI = &H71CC
L_0475: FAC! = N(SI) + N_71CC!  ' RT3F_7F
L_0478: CX = BX
L_047A: BX = CINT(FAC!)  ' RT3F_77
L_047D: DI = BX
L_047F: DI = DI * (2 ^ 1)
L_0481: DI = DI * (2 ^ 1)
L_0483: DI = DI + &H1850
L_0487: SI = &H71D0
L_048A: N(DI) = N_71D0!  ' RT3F_7B
L_048D: SI = DX
L_048F: DI = &H71D4
L_0492: FAC! = N(SI) + N_71D4!  ' RT3F_7F
L_0495: BX = CINT(FAC!)  ' RT3F_77
L_0498: DI = BX
L_049A: DI = DI * (2 ^ 1)
L_049C: DI = DI * (2 ^ 1)
L_049E: DI = DI + &H1850
L_04A2: SI = &H6F8A
L_04A5: N(DI) = N_6F8A!  ' RT3F_7B
L_04A8: SWAP DX, SI
L_04AA: DI = &H71D8
L_04AD: FAC! = N(SI) + N_71D8!  ' RT3F_7F
L_04B0: BX = SI
L_04B2: AX = BX
L_04B4: BX = CINT(FAC!)  ' RT3F_77
L_04B7: DI = BX
L_04B9: DI = DI * (2 ^ 1)
L_04BB: DI = DI * (2 ^ 1)
L_04BD: DI = DI + &H1850
L_04C1: SI = CX
L_04C3: N(DI) = N(SI)  ' RT3F_7B
L_04C6: DI = DX
L_04C8: SI = AX
L_04CA: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_04CD: DI = &H71C0
L_04D0: N_71C0! = FAC!: SI = &H001A  ' RT3F_7D
L_04D3: SI = DI
L_04D5: DI = &H71DC
L_04D8: CompareLeft! = N_71C0!: CompareRight! = N_71DC!  ' RT3F_9F
L_04DB: IF CompareLeft! > CompareRight! THEN GOTO L_04E0  ' flags from L_04D8
L_04DD: GOTO L_03F8
L_04E0: SI = &H6F4A
L_04E3: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_04E6: GOTO L_052B
L_04E9: ' Alignment NOP
L_04EA: DI = &H7188
L_04ED: SI = &H6F4A
L_04F0: N_7188! = N_6F4A!  ' RT3F_7B
L_04F3: DI = &H718C
L_04F6: SI = &H710E
L_04F9: N_718C! = N_710E!  ' RT3F_7B
L_04FC: GOSUB L_0333
L_04FF: BX = CINT(FAC!)  ' RT3F_77
L_0502: DI = BX
L_0504: DI = DI * (2 ^ 1)
L_0506: DI = DI * (2 ^ 1)
L_0508: DI = DI + &H1850
L_050C: FAC! = RND  ' RT3D_34
L_050F: BX = DI
L_0511: DI = &H71E0
L_0514: FAC! = FAC! * N_71E0!  ' RT3F_91
L_0517: DI = &H71E4
L_051A: FAC! = FAC! + N_71E4!  ' RT3F_81
L_051D: DI = BX
L_051F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0522: DI = &H6F4A
L_0525: SI = &H710E
L_0528: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_052B: DI = &H710E
L_052E: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0531: SI = DI
L_0533: DI = &H7116
L_0536: CompareLeft! = N_710E!: CompareRight! = N_7116!  ' RT3F_9F
L_0539: IF CompareLeft! <= CompareRight! THEN GOTO L_04EA  ' flags from L_0536
L_053B: SI = &H71E8
L_053E: FAC! = N_71E8!: DI = &H001E  ' RT3F_6F
L_0541: GOTO L_0586
L_0544: SI = &H710E
L_0547: BX = SI
L_0549: DX = BX
L_054B: BX = CINT(N_710E!)  ' RT3F_75
L_054E: DI = BX
L_0550: DI = DI * (2 ^ 1)
L_0552: DI = DI * (2 ^ 1)
L_0554: DI = DI + &H1850
L_0558: FAC! = RND  ' RT3D_34
L_055B: BX = DI
L_055D: DI = &H719C
L_0560: CompareLeft! = FAC!: CompareRight! = N_719C!  ' RT3F_A1
L_0563: AX = 0
L_0566: IF CompareLeft! >= CompareRight! THEN GOTO L_0569  ' flags from L_0560
L_0568: AX = AX - 1
L_0569: CX = 0xF
L_056C: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_056E: DX = 2
L_0571: DX = DX - AX
L_0573: SWAP DX, BX
L_0575: FAC! = CSNG(BX)  ' RT3F_57
L_0578: DI = DX
L_057A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_057D: DI = &H6F4A
L_0580: SI = &H710E
L_0583: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_0586: DI = &H710E
L_0589: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_058C: SI = DI
L_058E: DI = &H71EC
L_0591: CompareLeft! = N_710E!: CompareRight! = N_71EC!  ' RT3F_9F
L_0594: IF CompareLeft! <= CompareRight! THEN GOTO L_0544  ' flags from L_0591
L_0596: DI = &H1894
L_0599: SI = &H6F4A
L_059C: N_1894! = N_6F4A!  ' RT3F_7B
L_059F: DI = &H1898
L_05A2: N_1898! = N_6F4A!  ' RT3F_7B
L_05A5: DI = &H1940
L_05A8: BX = SI
L_05AA: SI = &H710A
L_05AD: N_1940! = N_710A!  ' RT3F_7B
L_05B0: DI = &H1944
L_05B3: SI = &H71F0
L_05B6: N_1944! = N_71F0!  ' RT3F_7B
L_05B9: DI = &H1950
L_05BC: SI = &H71E4
L_05BF: N_1950! = N_71E4!  ' RT3F_7B
L_05C2: SI = BX
L_05C4: DI = &H189C
L_05C7: N_189C! = N_6F4A!  ' RT3F_7B
L_05CA: DI = &H7188
L_05CD: SI = &H71F4
L_05D0: N_7188! = N_71F4!  ' RT3F_7B
L_05D3: BX = DI
L_05D5: DI = &H718C
L_05D8: SI = &H6F54
L_05DB: N_718C! = N_6F54!  ' RT3F_7B
L_05DE: GOSUB L_0333
L_05E1: BX = CINT(FAC!)  ' RT3F_77
L_05E4: DI = BX
L_05E6: DI = DI * (2 ^ 1)
L_05E8: DI = DI * (2 ^ 1)
L_05EA: DI = DI + &H1850
L_05EE: SI = &H6F4A
L_05F1: N(DI) = N_6F4A!  ' RT3F_7B
L_05F4: DI = &H7188
L_05F7: SI = &H71F8
L_05FA: N_7188! = N_71F8!  ' RT3F_7B
L_05FD: DI = &H718C

```

### Encounter initialization

```basic
L_0600: SI = &H6F54
L_0603: N_718C! = N_6F54!  ' RT3F_7B
L_0606: GOSUB L_0333
L_0609: BX = CINT(FAC!)  ' RT3F_77
L_060C: DI = BX
L_060E: DI = DI * (2 ^ 1)
L_0610: DI = DI * (2 ^ 1)
L_0612: DI = DI + &H1850
L_0616: SI = &H71D8
L_0619: N(DI) = N_71D8!  ' RT3F_7B
L_061C: DI = &H3AB0
L_061F: SI = &H717C
L_0622: N_3AB0! = N_717C!  ' RT3F_7B
L_0625: DI = &H7188
L_0628: SI = &H71FC
L_062B: N_7188! = N_71FC!  ' RT3F_7B
L_062E: DI = &H718C
L_0631: SI = &H6F54
L_0634: N_718C! = N_6F54!  ' RT3F_7B
L_0637: GOSUB L_0333
L_063A: BX = CINT(FAC!)  ' RT3F_77
L_063D: DI = BX
L_063F: DI = DI * (2 ^ 1)
L_0641: DI = DI * (2 ^ 1)
L_0643: DI = DI + &H1850
L_0647: SI = &H71D8
L_064A: N(DI) = N_71D8!  ' RT3F_7B
L_064D: DI = &H3AE8
L_0650: SI = &H6F8A
L_0653: N_3AE8! = N_6F8A!  ' RT3F_7B
L_0656: DI = &H3AB0
L_0659: SI = &H6F4A
L_065C: N_3AB0! = N_6F4A!  ' RT3F_7B
L_065F: DI = &H195C
L_0662: SI = &H6F82
L_0665: N_195C! = N_6F82!  ' RT3F_7B
L_0668: DI = &H1968
L_066B: N_1968! = N_6F82!  ' RT3F_7B
L_066E: DI = &H1974
L_0671: N_1974! = N_6F82!  ' RT3F_7B
L_0674: DI = &H1980
L_0677: N_1980! = N_6F82!  ' RT3F_7B
L_067A: DI = &H3AE8
L_067D: SI = &H7200
L_0680: N_3AE8! = N_7200!  ' RT3F_7B
L_0683: DI = &H192C
L_0686: SI = &H7204
L_0689: N_192C! = N_7204!  ' RT3F_7B
L_068C: DI = &H191C
L_068F: SI = &H7208
L_0692: N_191C! = N_7208!  ' RT3F_7B
L_0695: DI = &H186C
L_0698: SI = &H6F4A
L_069B: N_186C! = N_6F4A!  ' RT3F_7B
L_069E: DI = &H1870
L_06A1: SI = &H6F54
L_06A4: N_1870! = N_6F54!  ' RT3F_7B
L_06A7: DI = &H1874
L_06AA: BX = SI
L_06AC: SI = &H6F82
L_06AF: N_1874! = N_6F82!  ' RT3F_7B
L_06B2: SI = BX
L_06B4: DI = &H1878
L_06B7: N_1878! = N_6F54!  ' RT3F_7B
L_06BA: FAC! = TIMER  ' RT3D_43
L_06BD: BX = &H1A
L_06C0: RANDOMIZE FAC!  ' RT3E_09
L_06C3: BX = &H73A0
L_06C6: FAC! = CSNG(BX)  ' RT3F_57
L_06C9: BX = &H886E
L_06CC: AX = &H6F42
L_06CF: BX = TEMP_DESC(S_6F42$ + S_886E$)  ' BX receives a temporary descriptor  ' RT3F_55
L_06D2: DX = &H1A
L_06D5: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_06D8: BX = 0
L_06DA: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_06DD: DX = BX
L_06DF: BX = &H8B18
L_06E2: AX = &H6F42
L_06E5: BX = TEMP_DESC(S_6F42$ + S_8B18$)  ' BX receives a temporary descriptor  ' RT3F_55
L_06E8: SWAP BX, DX
L_06EA: CX = BX
L_06EC: BX = 1
L_06EF: OPEN S(DX) FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_06F2: DI = &H8B24
L_06F5: SI = &H3AE8
L_06F8: N_8B24! = N_3AE8!  ' RT3F_7B
L_06FB: SI = &H6F82
L_06FE: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0701: GOTO L_0733
L_0704: BX = 1
L_0707: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_070A: InputTypes = [4, 2, 2, 2]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0712: BX = &H8B28
L_0715: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0718: BX = &H8B2C
L_071B: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_071E: BX = &H8B30
L_0721: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0724: BX = &H8B34
L_0727: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_072A: DI = &H6F4A
L_072D: SI = &H710E
L_0730: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_0733: DI = &H710E
L_0736: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0739: SI = DI
L_073B: DI = &H8B24
L_073E: CompareLeft! = N_710E!: CompareRight! = N_8B24!  ' RT3F_9F
L_0741: IF CompareLeft! <= CompareRight! THEN GOTO L_0704  ' flags from L_073E
L_0743: BX = 1
L_0746: CLOSE #BX  ' RT3E_21
L_0749: GOSUB L_1D8C
L_074C: BX = &H16
L_074F: ARGPUSH BX  ' RT3E_42
L_0752: BX = 3
L_0755: LOCATE ARGS(), BX  ' RT3E_44
L_0758: ' PRINT statement begins ; RT3F_BC
L_075B: BX = &H8B2C
L_075E: PRINT N_8B2C!;  ' RT3F_67; H expanded ledger
L_0761: BX = &H8B28
L_0764: PRINT S_8B28$;  ' RT3F_6A
L_0767: BX = &H8B38
L_076A: PRINT S_8B38$  ' RT3F_6E; H newline item, ledger correction
L_076D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_0770: BX = 0
L_0772: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_0775: DX = BX
L_0777: BX = &H8B40
L_077A: AX = &H6F42
L_077D: BX = TEMP_DESC(S_6F42$ + S_8B40$)  ' BX receives a temporary descriptor  ' RT3F_55
L_0780: SWAP BX, DX
L_0782: CX = BX
L_0784: BX = 1
L_0787: OPEN S(DX) FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_078A: DI = &H8B4C
L_078D: SI = &H8B34
L_0790: N_8B4C! = N_8B34!  ' RT3F_7B
L_0793: SI = &H6F82
L_0796: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0799: GOTO L_0868
L_079C: BX = 1
L_079F: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_07A2: InputTypes = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_07B3: BX = &H8B50
L_07B6: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07B9: BX = &H8B54
L_07BC: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07BF: BX = &H8B58
L_07C2: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07C5: BX = &H8B5C
L_07C8: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07CB: BX = &H8B60
L_07CE: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07D1: BX = &H8B64
L_07D4: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07D7: BX = &H8B68
L_07DA: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07DD: BX = &H887C
L_07E0: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07E3: BX = &H8880
L_07E6: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07E9: BX = &H8884
L_07EC: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07EF: BX = &H8888
L_07F2: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07F5: BX = &H888C
L_07F8: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_07FB: BX = &H8890
L_07FE: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0801: BX = 1
L_0804: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0807: InputTypes = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0817: BX = &H8B6C
L_081A: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_081D: BX = &H8B70
L_0820: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0823: BX = &H8B74
L_0826: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0829: BX = &H8B78
L_082C: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_082F: BX = &H8B7C
L_0832: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0835: BX = &H8B80
L_0838: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_083B: BX = &H8B84
L_083E: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0841: BX = &H8B88
L_0844: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0847: BX = &H8B8C
L_084A: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_084D: BX = &H8B90
L_0850: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0853: BX = &H8B94
L_0856: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0859: BX = &H8B98
L_085C: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_085F: DI = &H6F4A
L_0862: SI = &H710E
L_0865: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_0868: DI = &H710E
L_086B: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_086E: SI = DI
L_0870: DI = &H8B4C
L_0873: CompareLeft! = N_710E!: CompareRight! = N_8B4C!  ' RT3F_9F
L_0876: IF CompareLeft! > CompareRight! THEN GOTO L_087B  ' flags from L_0873
L_0878: GOTO L_079C
L_087B: BX = 1
L_087E: CLOSE #BX  ' RT3E_21
L_0881: DI = &H717C
L_0884: SI = &H8B30
L_0887: FAC! = N_8B30! / N_717C!  ' RT3F_87
L_088A: DI = SI
L_088C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_088F: DI = &H8B2C
L_0892: SI = &H8B8C
L_0895: FAC! = N_8B8C! * N_8B2C!  ' RT3F_8F
L_0898: DI = SI
L_089A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_089D: SI = &H6F82
L_08A0: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_08A3: GOTO L_08C8
L_08A6: SI = &H710E
L_08A9: BX = SI
L_08AB: DX = BX
L_08AD: BX = CINT(N_710E!)  ' RT3F_75
L_08B0: DI = BX
L_08B2: DI = DI * (2 ^ 1)
L_08B4: DI = DI * (2 ^ 1)
L_08B6: DI = DI + &H8A08
L_08BA: SI = &H6F82
L_08BD: N(DI) = N_6F82!  ' RT3F_7B
L_08C0: SI = DX
L_08C2: DI = &H6F4A
L_08C5: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_08C8: DI = &H710E
L_08CB: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_08CE: SI = DI
L_08D0: DI = &H71CC
L_08D3: CompareLeft! = N_710E!: CompareRight! = N_71CC!  ' RT3F_9F
L_08D6: IF CompareLeft! <= CompareRight! THEN GOTO L_08A6  ' flags from L_08D3
L_08D8: DI = &H8BA8
L_08DB: SI = &H8B30
L_08DE: FAC! = N_8B30! * N_8BA8!  ' RT3F_8F
L_08E1: DI = &H8BAC
L_08E4: BX = SI
L_08E6: FAC! = FAC! + N_8BAC!  ' RT3F_81
L_08E9: DI = &H8B54
L_08EC: FAC! = FAC! * N_8B54!  ' RT3F_91
L_08EF: DX = DI
L_08F1: DI = &H8B9C
L_08F4: N_8B9C! = FAC!: SI = &H001A  ' RT3F_7D
L_08F7: SI = BX
L_08F9: CX = DI
L_08FB: DI = &H7184
L_08FE: FAC! = N(SI) * N_7184!  ' RT3F_8F
L_0901: DI = &H8BB0
L_0904: FAC! = FAC! + N_8BB0!  ' RT3F_81
L_0907: DI = DX
L_0909: FAC! = FAC! * N(DI)  ' RT3F_91
L_090C: DI = &H8BA0
L_090F: N_8BA0! = FAC!: SI = &H001A  ' RT3F_7D
L_0912: SWAP CX, DI
L_0914: SI = CX
L_0916: FAC! = N_8BA0! - N(DI)  ' RT3F_97
L_0919: DI = &H8BA4
L_091C: N_8BA4! = FAC!: SI = &H001A  ' RT3F_7D
L_091F: SI = BX
L_0921: DI = &H8BB4
L_0924: FAC! = N(SI) * N_8BB4!  ' RT3F_8F
L_0927: DI = &H6F4A
L_092A: FAC! = FAC! + N_6F4A!  ' RT3F_81
L_092D: DI = &H8B84
L_0930: FAC! = FAC! * N_8B84!  ' RT3F_91
L_0933: BX = DI
L_0935: DI = &H719C
L_0938: FAC! = FAC! + N_719C!  ' RT3F_81
L_093B: DX = BX
L_093D: BX = &H1A
L_0940: FAC! = INT(FAC!)  ' RT3D_03
L_0943: DI = DX
L_0945: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0948: DI = &H70AA
L_094B: SI = &H8B2C
L_094E: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_0951: DI = &H8BB8
L_0954: N_8BB8! = FAC!: SI = &H001A  ' RT3F_7D
L_0957: SI = &H8BBC
L_095A: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_095D: GOTO L_0C55
L_0960: SI = &H710E
L_0963: BX = CINT(N_710E!)  ' RT3F_75
L_0966: DI = BX
L_0968: DI = DI * (2 ^ 1)
L_096A: DI = DI * (2 ^ 1)
L_096C: BX = DI
L_096E: DI = DI + &H8894
L_0972: DX = DI
L_0974: DI = &H8BA8
L_0977: SI = &H8B30
L_097A: FAC! = N_8B30! * N_8BA8!  ' RT3F_8F
L_097D: DI = &H6F4A
L_0980: CX = SI
L_0982: FAC! = FAC! + N_6F4A!  ' RT3F_81
L_0985: AX = DI
L_0987: DI = &H8B50
L_098A: FAC! = FAC! * N_8B50!  ' RT3F_91
L_098D: DI = &H719C
L_0990: FAC! = FAC! + N_719C!  ' RT3F_81
L_0993: WORD(BP - 6) = BX
L_0996: BX = &H1A
L_0999: FAC! = INT(FAC!)  ' RT3D_03
L_099C: SWAP DX, DI
L_099E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_09A1: DI = WORD(BP - 6)
L_09A4: BX = DI
L_09A6: DI = DI + &H8920
L_09AA: SI = AX
L_09AC: N(DI) = N(SI)  ' RT3F_7B
L_09AF: BX = BX + &H8934
L_09B3: DI = BX
L_09B5: N(DI) = N(SI)  ' RT3F_7B
L_09B8: DI = WORD(BP - 6)
L_09BB: BX = DI
L_09BD: DI = DI + &H8998
L_09C1: SWAP DX, DI
L_09C3: SWAP CX, SI
L_09C5: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_09C8: SWAP DI, AX
L_09C9: FAC! = FAC! + N(DI)  ' RT3F_81
L_09CC: DI = &H8B60
L_09CF: T_01! = FAC!  ' RT3F_71; inline=&H81
L_09D3: FAC! = FAC! * N(DI)  ' RT3F_91
L_09D6: DI = AX
L_09D8: FAC! = FAC! + N(DI)  ' RT3F_81
L_09DB: CX = BX
L_09DD: BX = &H1A
L_09E0: FAC! = INT(FAC!)  ' RT3D_03
L_09E3: SWAP DX, DI
L_09E5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_09E8: BX = CX
L_09EA: CX = CX + &H89AC
L_09EE: DI = CX
L_09F0: FAC! = RND  ' RT3D_34
L_09F3: DI = &H8BC0
L_09F6: FAC! = FAC! * N_8BC0!  ' RT3F_91
L_09F9: DI = &H8BC4
L_09FC: FAC! = FAC! + N_8BC4!  ' RT3F_81
L_09FF: DI = &H6FB2
L_0A02: FAC! = FAC! * N_6FB2!  ' RT3F_91
L_0A05: DI = &H8B5C
L_0A08: FAC! = FAC! * N_8B5C!  ' RT3F_91
L_0A0B: DI = CX
L_0A0D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A10: BX = BX + &H89D8
L_0A14: DI = BX
L_0A16: FAC! = RND  ' RT3D_34
L_0A19: SWAP DI, AX
L_0A1A: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_0A1D: CX = 0
L_0A20: IF CompareLeft! >= CompareRight! THEN GOTO L_0A23  ' flags from L_0A1A
L_0A22: CX = CX - 1
L_0A23: SWAP CX, AX
L_0A24: DX = 0xC
L_0A27: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_0A29: DX = 4
L_0A2C: DX = DX - AX
L_0A2E: SWAP DX, BX
L_0A30: FAC! = CSNG(BX)  ' RT3F_57
L_0A33: DI = CX
L_0A35: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A38: DI = &H719C
L_0A3B: SI = &H8B30
L_0A3E: FAC! = N_8B30! * N_719C!  ' RT3F_8F
L_0A41: BX = DI
L_0A43: DI = &H8B64
L_0A46: DX = SI
L_0A48: FAC! = FAC! + N_8B64!  ' RT3F_81
L_0A4B: CX = DI
L_0A4D: DI = &H6F4A
L_0A50: FAC! = FAC! + N_6F4A!  ' RT3F_81
L_0A53: SWAP CX, DI
L_0A55: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A58: SI = DX
L_0A5A: DI = &H8BC4
L_0A5D: FAC! = N(SI) * N_8BC4!  ' RT3F_8F
L_0A60: SWAP CX, DI
L_0A62: FAC! = FAC! + N(DI)  ' RT3F_81
L_0A65: DI = &H8B94
L_0A68: FAC! = FAC! * N_8B94!  ' RT3F_91
L_0A6B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A6E: SI = &H710E
L_0A71: AX = BX
L_0A73: BX = CINT(N_710E!)  ' RT3F_75
L_0A76: DI = BX
L_0A78: DI = DI * (2 ^ 1)
L_0A7A: DI = DI * (2 ^ 1)
L_0A7C: DI = DI + &H8B04
L_0A80: FAC! = RND  ' RT3D_34
L_0A83: SWAP CX, DI
L_0A85: FAC! = FAC! * N(DI)  ' RT3F_91
L_0A88: SI = DX
L_0A8A: DI = &H8BC8
L_0A8D: T_01! = FAC!  ' RT3F_71; inline=&H81
L_0A91: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_0A94: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_0A98: DI = &H8BAC
L_0A9B: FAC! = FAC! + N_8BAC!  ' RT3F_81
L_0A9E: DI = &H8B98
L_0AA1: FAC! = FAC! * N_8B98!  ' RT3F_91
L_0AA4: DI = AX
L_0AA6: FAC! = FAC! + N(DI)  ' RT3F_81
L_0AA9: BX = &H1A
L_0AAC: FAC! = INT(FAC!)  ' RT3D_03
L_0AAF: DI = CX
L_0AB1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0AB4: SI = &H710E
L_0AB7: BX = SI
L_0AB9: DX = BX
L_0ABB: BX = CINT(N_710E!)  ' RT3F_75
L_0ABE: DI = BX
L_0AC0: DI = DI * (2 ^ 1)
L_0AC2: DI = DI * (2 ^ 1)
L_0AC4: BX = DI
L_0AC6: DI = DI + &H89C0
L_0ACA: CX = DI
L_0ACC: DI = &H8BCC
L_0ACF: SI = &H8B2C
L_0AD2: FAC! = N_8B2C! + N_8BCC!  ' RT3F_7F
L_0AD5: SI = DX
L_0AD7: FAC! = N(SI) / FAC!  ' RT3F_8B
L_0ADA: DI = &H8BD0
L_0ADD: FAC! = FAC! * N_8BD0!  ' RT3F_91
L_0AE0: DI = &H8BD4
L_0AE3: FAC! = FAC! + N_8BD4!  ' RT3F_81
L_0AE6: DX = BX
L_0AE8: BX = &H1A
L_0AEB: FAC! = INT(FAC!)  ' RT3D_03
L_0AEE: DI = CX
L_0AF0: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0AF3: BX = DX
L_0AF5: DX = DX + &H89F0
L_0AF9: DI = DX
L_0AFB: CX = BX
L_0AFD: BX = BX + &H89D8
L_0B01: SI = BX
L_0B03: DI = &H8BD8
L_0B06: CompareLeft! = N(SI): CompareRight! = N_8BD8!  ' RT3F_9F
L_0B09: AX = 0
L_0B0C: IF CompareLeft! >= CompareRight! THEN GOTO L_0B0F  ' flags from L_0B06
L_0B0E: AX = AX - 1
L_0B0F: AX = AX * (2 ^ 1)
L_0B11: AX = AX * (2 ^ 1)
L_0B13: AX = -AX
L_0B15: BX = AX
L_0B17: FAC! = CSNG(BX)  ' RT3F_57
L_0B1A: DI = DX
L_0B1C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0B1F: BX = CX
L_0B21: CX = CX + &H8A08
L_0B25: DI = CX
L_0B27: SI = &H71CC
L_0B2A: N(DI) = N_71CC!  ' RT3F_7B
L_0B2D: BX = BX + &H8AF0
L_0B31: DI = BX
L_0B33: SI = &H8B58
L_0B36: N(DI) = N_8B58!  ' RT3F_7B
L_0B39: SI = &H6F82
L_0B3C: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0B3F: GOTO L_0B87
L_0B42: SI = &H8BDC
L_0B45: BX = SI
L_0B47: DX = BX
L_0B49: BX = CINT(N_8BDC!)  ' RT3F_75
L_0B4C: DI = BX
L_0B4E: SI = &H710E
L_0B51: BX = CINT(N_710E!)  ' RT3F_75
L_0B54: BX = BX * (2 ^ 1)
L_0B56: BX = BX * (2 ^ 1)
L_0B58: DI = DI + BX
L_0B5A: DI = DI * (2 ^ 1)
L_0B5C: DI = DI * (2 ^ 1)
L_0B5E: DI = DI + &H8948
L_0B62: BX = DI
L_0B64: DI = &H8BA8
L_0B67: SI = &H8B30
L_0B6A: FAC! = N_8B30! * N_8BA8!  ' RT3F_8F
L_0B6D: DI = &H6F4A
L_0B70: FAC! = FAC! + N_6F4A!  ' RT3F_81
L_0B73: CX = DI
L_0B75: DI = &H8B68
L_0B78: FAC! = FAC! * N_8B68!  ' RT3F_91
L_0B7B: DI = BX
L_0B7D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0B80: DI = CX
L_0B82: SI = DX
L_0B84: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_0B87: DI = &H8BDC
L_0B8A: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_0B8D: SI = DI
L_0B8F: DI = &H710A
L_0B92: CompareLeft! = N_8BDC!: CompareRight! = N_710A!  ' RT3F_9F
L_0B95: IF CompareLeft! <= CompareRight! THEN GOTO L_0B42  ' flags from L_0B92
L_0B97: SI = &H6F82
L_0B9A: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0B9D: GOTO L_0C39
L_0BA0: SI = &H710E
L_0BA3: BX = CINT(N_710E!)  ' RT3F_75
L_0BA6: AX = BX
L_0BA8: DI = 6
L_0BAB: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_0BAD: DI = AX
L_0BAF: SI = &H8BDC
L_0BB2: BX = CINT(N_8BDC!)  ' RT3F_75
L_0BB5: DI = DI + BX
L_0BB7: DI = DI * (2 ^ 1)
L_0BB9: DI = DI * (2 ^ 1)
L_0BBB: DX = DI
L_0BBD: DI = DI + &H8A1C
L_0BC1: FAC! = RND  ' RT3D_34
L_0BC4: CX = DI
L_0BC6: DI = &H717C
L_0BC9: FAC! = FAC! * N_717C!  ' RT3F_91
L_0BCC: SI = BX
L_0BCE: SI = SI * (2 ^ 1)
L_0BD0: SI = SI * (2 ^ 1)
L_0BD2: SI = SI + &H887C
L_0BD6: T_01! = FAC!  ' RT3F_71; inline=&H81
L_0BDA: FAC! = ABS(N(SI))  ' RT3F_2B
L_0BDD: DI = &H71E4
L_0BE0: BX = SI
L_0BE2: SI = &H8B30
L_0BE5: T_02! = FAC!  ' RT3F_71; inline=&H82
L_0BE9: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_0BEC: FAC! = T_02! + FAC!  ' RT3F_85; inline=&H82
L_0BF0: CompareLeft! = T_01!: CompareRight! = FAC!  ' RT3F_A5; inline=&H81
L_0BF4: AX = 0
L_0BF7: IF CompareLeft! >= CompareRight! THEN GOTO L_0BFA  ' flags from L_0BF0
L_0BF9: AX = AX - 1
L_0BFA: CompareLeft% = AX: CompareRight% = 0
L_0BFC: IF CompareLeft% >= CompareRight% THEN GOTO L_0C00  ' flags from L_0BFA
L_0BFE: AX = -AX

```

### Graphics and ship display helpers

```basic
L_0C00: SWAP BX, AX
L_0C01: FAC! = CSNG(BX)  ' RT3F_57
L_0C04: DI = CX
L_0C06: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0C09: DX = DX + &H88A8
L_0C0D: DI = DX
L_0C0F: SI = AX
L_0C11: FAC! = SGN(N(SI))  ' RT3F_2F
L_0C14: T_03! = FAC!  ' RT3F_71; inline=&H83
L_0C18: FAC! = RND  ' RT3D_34
L_0C1B: DI = &H8BA4
L_0C1E: FAC! = FAC! * N_8BA4!  ' RT3F_91
L_0C21: DI = &H8B9C
L_0C24: FAC! = FAC! + N_8B9C!  ' RT3F_81
L_0C27: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_0C2B: DI = DX
L_0C2D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0C30: DI = &H6F4A
L_0C33: SI = &H8BDC
L_0C36: FAC! = N_8BDC! + N_6F4A!  ' RT3F_7F
L_0C39: DI = &H8BDC
L_0C3C: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_0C3F: SI = DI
L_0C41: DI = &H71D4
L_0C44: CompareLeft! = N_8BDC!: CompareRight! = N_71D4!  ' RT3F_9F
L_0C47: IF CompareLeft! > CompareRight! THEN GOTO L_0C4C  ' flags from L_0C44
L_0C49: GOTO L_0BA0
L_0C4C: DI = &H6F4A
L_0C4F: SI = &H710E
L_0C52: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_0C55: DI = &H710E
L_0C58: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0C5B: SI = DI
L_0C5D: DI = &H8BB8
L_0C60: CompareLeft! = N_710E!: CompareRight! = N_8BB8!  ' RT3F_9F
L_0C63: IF CompareLeft! > CompareRight! THEN GOTO L_0C68  ' flags from L_0C60
L_0C65: GOTO L_0960
L_0C68: DI = &H89D4
L_0C6B: SI = &H71E4
L_0C6E: N_89D4! = N_71E4!  ' RT3F_7B
L_0C71: DI = &H89EC
L_0C74: SI = &H8BD8
L_0C77: N_89EC! = N_8BD8!  ' RT3F_7B
L_0C7A: BX = &H6AA2
L_0C7D: FAC! = CSNG(BX)  ' RT3F_57
L_0C80: BX = &H8BE0
L_0C83: AX = &H6F42
L_0C86: BX = TEMP_DESC(S_6F42$ + S_8BE0$)  ' BX receives a temporary descriptor  ' RT3F_55
L_0C89: SI = &H8B7C
L_0C8C: T_01! = FAC!  ' RT3F_71; inline=&H81
L_0C90: FAC! = -N(SI)  ' RT3F_AF
L_0C93: DX = BX
L_0C95: BX = &H1A
L_0C98: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_0C9B: AX = DX
L_0C9D: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_0CA0: AX = BX
L_0CA2: BX = &H8BEA
L_0CA5: BX = TEMP_DESC(S(AX) + S_8BEA$)  ' BX receives a temporary descriptor  ' RT3F_55
L_0CA8: DX = &H6FB2
L_0CAB: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_0CAE: GOTO L_0CCE
L_0CB1: DI = &H8BF6
L_0CB4: SI = &H8BF2
L_0CB7: FAC! = N_8BF2! * N_8BF6!  ' RT3F_8F
L_0CBA: BX = &H1A
L_0CBD: FAC! = INT(FAC!)  ' RT3D_03
L_0CC0: FAC! = FAC! * 2 ^ (3)  ' RT3F_AD; inline=&H03
L_0CC4: FAC! = N(SI) - FAC!  ' RT3F_9B
L_0CC7: BX = &H1A
L_0CCA: FAC! = INT(FAC!)  ' RT3D_03
L_0CCD: RETURN
L_0CCE: GOTO L_0D27
L_0CD1: SI = &H8BFA
L_0CD4: BX = CINT(N_8BFA!)  ' RT3F_75
L_0CD7: SI = BX
L_0CD9: SI = SI * (2 ^ 1)
L_0CDB: SI = SI * (2 ^ 1)
L_0CDD: BX = SI
L_0CDF: SI = SI + &H89C0
L_0CE3: DX = SI
L_0CE5: SI = &H8BFE
L_0CE8: CX = BX
L_0CEA: BX = CINT(N_8BFE!)  ' RT3F_75
L_0CED: DI = BX
L_0CEF: DI = DI * (2 ^ 1)
L_0CF1: DI = DI * (2 ^ 1)
L_0CF3: BX = DI
L_0CF5: DI = DI + &H89C0
L_0CF9: SI = DX
L_0CFB: FAC! = N(SI) - N(DI)  ' RT3F_97
L_0CFE: DI = &H6F54
L_0D01: FAC! = FAC! ^ N_6F54!  ' RT3F_25; M ledger
L_0D04: CX = CX + &H89D8
L_0D08: SI = CX
L_0D0A: BX = BX + &H89D8
L_0D0E: SWAP BX, DI
L_0D10: T_04! = FAC!  ' RT3F_71; inline=&H84
L_0D14: FAC! = N(SI) - N(DI)  ' RT3F_97
L_0D17: DI = BX
L_0D19: FAC! = FAC! ^ N(DI)  ' RT3F_25; M ledger
L_0D1C: FAC! = T_04! + FAC!  ' RT3F_85; inline=&H84
L_0D20: BX = &H1A
L_0D23: FAC! = SQR(FAC!)  ' RT3D_3A
L_0D26: RETURN
L_0D27: GOTO L_0DBA
L_0D2A: SI = &H8C06
L_0D2D: BX = CINT(N_8C06!)  ' RT3F_75
L_0D30: SI = BX
L_0D32: SI = SI * (2 ^ 1)
L_0D34: SI = SI * (2 ^ 1)
L_0D36: BX = SI
L_0D38: SI = SI + &H89C0
L_0D3C: DX = SI
L_0D3E: SI = &H8C02
L_0D41: CX = BX
L_0D43: BX = CINT(N_8C02!)  ' RT3F_75
L_0D46: DI = BX
L_0D48: DI = DI * (2 ^ 1)
L_0D4A: DI = DI * (2 ^ 1)
L_0D4C: BX = DI
L_0D4E: DI = DI + &H89C0
L_0D52: SI = DX
L_0D54: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_0D57: AX = 0
L_0D5A: IF CompareLeft! >= CompareRight! THEN GOTO L_0D5D  ' flags from L_0D54
L_0D5C: AX = AX - 1
L_0D5D: WORD(BP - 8) = BX
L_0D60: BX = 0xB4
L_0D63: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_0D65: BX = AX
L_0D67: FAC! = CSNG(BX)  ' RT3F_57
L_0D6A: BX = SI
L_0D6C: SI = &H8C0A
L_0D6F: DX = DI
L_0D71: FAC! = N_8C0A! - FAC!  ' RT3F_9B
L_0D74: SI = WORD(BP - 8)
L_0D77: SI = SI + &H89D8
L_0D7B: CX = CX + &H89D8
L_0D7F: DI = CX
L_0D81: T_05! = FAC!  ' RT3F_71; inline=&H85
L_0D85: FAC! = N(SI) - N(DI)  ' RT3F_97
L_0D88: DI = DX
L_0D8A: SI = BX
L_0D8C: T_06! = FAC!  ' RT3F_71; inline=&H86
L_0D90: FAC! = N(SI) - N(DI)  ' RT3F_97
L_0D93: DI = &H8C0E
L_0D96: FAC! = FAC! + N_8C0E!  ' RT3F_81
L_0D99: FAC! = T_06! / FAC!  ' RT3F_8D; inline=&H86
L_0D9D: BX = &H1A
L_0DA0: FAC! = ATN(FAC!)  ' RT3D_35
L_0DA3: DI = &H8C12
L_0DA6: FAC! = FAC! * N_8C12!  ' RT3F_91
L_0DA9: FAC! = T_05! - FAC!  ' RT3F_9D; inline=&H85
L_0DAD: DI = &H719C
L_0DB0: FAC! = FAC! + N_719C!  ' RT3F_81
L_0DB3: BX = &H1A
L_0DB6: FAC! = INT(FAC!)  ' RT3D_03
L_0DB9: RETURN
L_0DBA: GOSUB L_6FE6
L_0DBD: DI = &H8C2A
L_0DC0: SI = &H70AA
L_0DC3: N_8C2A! = N_70AA!  ' RT3F_7B
L_0DC6: DI = &H8C1A
L_0DC9: BX = SI
L_0DCB: SI = &H6F4A
L_0DCE: N_8C1A! = N_6F4A!  ' RT3F_7B
L_0DD1: DI = &H8C32
L_0DD4: N_8C32! = N_6F4A!  ' RT3F_7B
L_0DD7: SI = BX
L_0DD9: DI = &H8C22
L_0DDC: N_8C22! = N_70AA!  ' RT3F_7B
L_0DDF: GOTO L_0E47
L_0DE2: SI = &H8C3E
L_0DE5: BX = CINT(N_8C3E!)  ' RT3F_75
L_0DE8: DI = BX
L_0DEA: DI = DI * (2 ^ 1)
L_0DEC: DI = DI * (2 ^ 1)
L_0DEE: BX = DI
L_0DF0: DI = DI + &H89C0
L_0DF4: SI = &H89D4
L_0DF7: FAC! = N_89D4! - N(DI)  ' RT3F_97
L_0DFA: DX = DI
L_0DFC: DI = &H6F8A
L_0DFF: CX = SI
L_0E01: CompareLeft! = FAC!: CompareRight! = N_6F8A!  ' RT3F_A1
L_0E04: AX = 0
L_0E07: IF CompareLeft! >= CompareRight! THEN GOTO L_0E0A  ' flags from L_0E01
L_0E09: AX = AX - 1
L_0E0A: SWAP CX, DI
L_0E0C: SI = DX
L_0E0E: FAC! = N(SI) - N(DI)  ' RT3F_97
L_0E11: DI = &H7116
L_0E14: CompareLeft! = FAC!: CompareRight! = N_7116!  ' RT3F_A1
L_0E17: DX = 0
L_0E1A: IF CompareLeft! >= CompareRight! THEN GOTO L_0E1D  ' flags from L_0E14
L_0E1C: DX = DX - 1
L_0E1D: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_0E1F: BX = BX + &H89D8
L_0E23: DI = BX
L_0E25: SI = &H89EC
L_0E28: FAC! = N_89EC! - N(DI)  ' RT3F_97
L_0E2B: FAC! = ABS(FAC!)  ' RT3F_2D
L_0E2E: DI = CX
L_0E30: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_0E33: BX = 0
L_0E36: IF CompareLeft! >= CompareRight! THEN GOTO L_0E39  ' flags from L_0E30
L_0E38: BX = BX - 1
L_0E39: CompareLeft% = BX: CompareRight% = 0
L_0E3B: IF CompareLeft% >= CompareRight% THEN GOTO L_0E3F  ' flags from L_0E39
L_0E3D: BX = -BX
L_0E3F: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_0E41: BX = AX
L_0E43: FAC! = CSNG(BX)  ' RT3F_57
L_0E46: RETURN
L_0E47: SI = &H6F4A
L_0E4A: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_0E4D: GOTO L_0E6D
L_0E50: SI = &H710E
L_0E53: BX = SI
L_0E55: DX = BX
L_0E57: BX = CINT(N_710E!)  ' RT3F_75
L_0E5A: BX = BX * (2 ^ 1)
L_0E5C: BX = BX * (2 ^ 1)
L_0E5E: BX = BX + &H8C42
L_0E62: READ N(BX)  ' RT3F_0D
L_0E65: SI = DX
L_0E67: DI = &H6F4A
L_0E6A: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_0E6D: DI = &H710E
L_0E70: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0E73: SI = DI
L_0E75: DI = &H71D4
L_0E78: CompareLeft! = N_710E!: CompareRight! = N_71D4!  ' RT3F_9F
L_0E7B: IF CompareLeft! <= CompareRight! THEN GOTO L_0E50  ' flags from L_0E78
L_0E7D: ' Alignment NOP
L_0E7E: GOTO L_0EA9
L_0E81: DI = &H8C5E
L_0E84: SI = &H8C5A
L_0E87: FAC! = N_8C5A! + N_8C5E!  ' RT3F_7F
L_0E8A: DI = &H8C62
L_0E8D: BX = SI
L_0E8F: FAC! = FAC! / N_8C62!  ' RT3F_89
L_0E92: DX = BX
L_0E94: BX = &H1A
L_0E97: FAC! = INT(FAC!)  ' RT3D_03
L_0E9A: FAC! = FAC! * N(DI)  ' RT3F_91
L_0E9D: SI = DX
L_0E9F: FAC! = N(SI) - FAC!  ' RT3F_9B
L_0EA2: BX = &H1A
L_0EA5: FAC! = INT(FAC!)  ' RT3D_03
L_0EA8: RETURN
L_0EA9: GOTO L_0F70
L_0EAC: SI = &H8C66
L_0EAF: BX = CINT(N_8C66!)  ' RT3F_75
L_0EB2: SI = BX
L_0EB4: SI = SI * (2 ^ 1)
L_0EB6: SI = SI * (2 ^ 1)
L_0EB8: SI = SI + &H8C42
L_0EBC: DI = &H8C02
L_0EBF: BX = SI
L_0EC1: SI = &H71D4
L_0EC4: N_8C02! = N_71D4!  ' RT3F_7B
L_0EC7: DI = &H8C06
L_0ECA: DX = SI
L_0ECC: SI = &H8C6A
L_0ECF: N_8C06! = N_8C6A!  ' RT3F_7B
L_0ED2: WORD(BP - 0xA) = BX
L_0ED5: GOSUB L_0D2A
L_0ED8: SI = WORD(BP - 0xA)
L_0EDB: FAC! = N(SI) - FAC!  ' RT3F_9B
L_0EDE: DI = &H8C6E
L_0EE1: SI = &H3B18
L_0EE4: T_07! = FAC!  ' RT3F_71; inline=&H87
L_0EE8: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_0EEB: FAC! = T_07! + FAC!  ' RT3F_85; inline=&H87
L_0EEF: DI = &H8C5A
L_0EF2: N_8C5A! = FAC!: SI = &H001A  ' RT3F_7D
L_0EF5: GOSUB L_0E81
L_0EF8: FAC! = ABS(FAC!)  ' RT3F_2D
L_0EFB: DI = &H8C72
L_0EFE: CompareLeft! = FAC!: CompareRight! = N_8C72!  ' RT3F_A1
L_0F01: AX = 0
L_0F04: IF CompareLeft! >= CompareRight! THEN GOTO L_0F07  ' flags from L_0EFE
L_0F06: AX = AX - 1
L_0F07: DI = &H8BFA
L_0F0A: SI = &H71D4
L_0F0D: N_8BFA! = N_71D4!  ' RT3F_7B
L_0F10: DI = &H8BFE
L_0F13: SI = &H8C6A
L_0F16: N_8BFE! = N_8C6A!  ' RT3F_7B
L_0F19: WORD(BP - 0xC) = AX
L_0F1C: GOSUB L_0CD1
L_0F1F: DI = &H8BD8
L_0F22: CompareLeft! = FAC!: CompareRight! = N_8BD8!  ' RT3F_A1
L_0F25: BX = 0
L_0F28: IF CompareLeft! >= CompareRight! THEN GOTO L_0F2B  ' flags from L_0F22
L_0F2A: BX = BX - 1
L_0F2B: SWAP BX, AX
L_0F2C: DX:AX = SIGNED16(AX) * SIGNED16(WORD(BP - 0xC))
L_0F2F: BX = AX
L_0F31: FAC! = CSNG(BX)  ' RT3F_57
L_0F34: SI = &H8C6A
L_0F37: BX = SI
L_0F39: DX = BX
L_0F3B: T_08! = FAC!  ' RT3F_71; inline=&H88
L_0F3F: BX = CINT(N(SI))  ' RT3F_75
L_0F42: SI = BX
L_0F44: SI = SI * (2 ^ 1)
L_0F46: SI = SI * (2 ^ 1)
L_0F48: SI = SI + &H8A08
L_0F4C: DI = &H710A
L_0F4F: FAC! = N(SI) / N_710A!  ' RT3F_87
L_0F52: BX = &H1A
L_0F55: FAC! = INT(FAC!)  ' RT3D_03
L_0F58: FAC! = T_08! * FAC!  ' RT3F_95; inline=&H88
L_0F5C: SI = DX
L_0F5E: DI = &H8C3E
L_0F61: N_8C3E! = N(SI)  ' RT3F_7B
L_0F64: T_09! = FAC!  ' RT3F_71; inline=&H89
L_0F68: GOSUB L_0DE2
L_0F6B: FAC! = T_09! * FAC!  ' RT3F_95; inline=&H89
L_0F6F: RETURN
L_0F70: SI = &H6F82
L_0F73: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0F76: GOTO L_0F97
L_0F79: ' Alignment NOP
L_0F7A: SI = &H710E
L_0F7D: BX = SI
L_0F7F: DX = BX
L_0F81: BX = CINT(N_710E!)  ' RT3F_75
L_0F84: BX = BX * (2 ^ 1)
L_0F86: BX = BX * (2 ^ 1)
L_0F88: BX = BX + &H8C76
L_0F8C: READ S(BX)  ' RT3F_10
L_0F8F: SI = DX
L_0F91: DI = &H6F4A
L_0F94: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_0F97: DI = &H710E
L_0F9A: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0F9D: SI = DI
L_0F9F: DI = &H6F8A
L_0FA2: CompareLeft! = N_710E!: CompareRight! = N_6F8A!  ' RT3F_9F
L_0FA5: IF CompareLeft! <= CompareRight! THEN GOTO L_0F7A  ' flags from L_0FA2
L_0FA7: ' Alignment NOP
L_0FA8: SI = &H6F82
L_0FAB: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_0FAE: GOTO L_0FDA
L_0FB1: ' Alignment NOP
L_0FB2: SI = &H710E
L_0FB5: BX = SI
L_0FB7: DX = BX
L_0FB9: BX = CINT(N_710E!)  ' RT3F_75
L_0FBC: BX = BX * (2 ^ 1)
L_0FBE: BX = BX * (2 ^ 1)
L_0FC0: CX = BX
L_0FC2: BX = BX + &H8C96
L_0FC6: READ N(BX)  ' RT3F_0D
L_0FC9: CX = CX + &H8CB6
L_0FCD: BX = CX
L_0FCF: READ N(BX)  ' RT3F_0D
L_0FD2: SI = DX
L_0FD4: DI = &H6F4A
L_0FD7: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_0FDA: DI = &H710E
L_0FDD: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_0FE0: SI = DI
L_0FE2: DI = &H6F8A
L_0FE5: CompareLeft! = N_710E!: CompareRight! = N_6F8A!  ' RT3F_9F
L_0FE8: IF CompareLeft! <= CompareRight! THEN GOTO L_0FB2  ' flags from L_0FE5
L_0FEA: GOTO L_1030
L_0FED: DI = &H71D4
L_0FF0: SI = &H8CD6
L_0FF3: CompareLeft! = N_8CD6!: CompareRight! = N_71D4!  ' RT3F_9F
L_0FF6: BX = 0
L_0FF9: IF CompareLeft! >= CompareRight! THEN GOTO L_0FFC  ' flags from L_0FF3
L_0FFB: BX = BX - 1
L_0FFC: FAC! = CSNG(BX)  ' RT3F_57
L_0FFF: BX = DI
L_1001: DI = &H8B84
L_1004: DX = SI
L_1006: FAC! = FAC! * N_8B84!  ' RT3F_91
L_1009: FAC! = ABS(FAC!)  ' RT3F_2D
L_100C: DI = BX
L_100E: SI = DX
L_1010: T_0A! = FAC!  ' RT3F_71; inline=&H8A
L_1014: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_1017: CX = 0
L_101A: IF CompareLeft! <> CompareRight! THEN GOTO L_101D  ' flags from L_1014
L_101C: CX = CX - 1
L_101D: BX = CX
L_101F: FAC! = CSNG(BX)  ' RT3F_57
L_1022: SI = &H1904
L_1025: FAC! = N_1904! * FAC!  ' RT3F_93
L_1028: FAC! = ABS(FAC!)  ' RT3F_2D
L_102B: FAC! = T_0A! + FAC!  ' RT3F_85; inline=&H8A
L_102F: RETURN
L_1030: GOTO L_10AE
L_1033: DI = &H8CD6
L_1036: SI = &H8CDA
L_1039: N_8CD6! = N_8CDA!  ' RT3F_7B
L_103C: GOSUB L_0FED
L_103F: DI = &H8CDE
L_1042: CompareLeft! = FAC!: CompareRight! = N_8CDE!  ' RT3F_A1
L_1045: BX = 0
L_1048: IF CompareLeft! <= CompareRight! THEN GOTO L_104B  ' flags from L_1042
L_104A: BX = BX - 1
L_104B: FAC! = CSNG(BX)  ' RT3F_57
L_104E: DI = &H8BC8
L_1051: FAC! = FAC! * N_8BC8!  ' RT3F_91
L_1054: SI = DI
L_1056: FAC! = N(SI) - FAC!  ' RT3F_9B
L_1059: DI = &H8CD6
L_105C: SI = &H8CDA
L_105F: N_8CD6! = N_8CDA!  ' RT3F_7B
L_1062: T_0B! = FAC!  ' RT3F_71; inline=&H8B
L_1066: GOSUB L_0FED
L_1069: DI = &H8CE2
L_106C: CompareLeft! = FAC!: CompareRight! = N_8CE2!  ' RT3F_A1
L_106F: BX = 0
L_1072: IF CompareLeft! <= CompareRight! THEN GOTO L_1075  ' flags from L_106C
L_1074: BX = BX - 1
L_1075: FAC! = CSNG(BX)  ' RT3F_57
L_1078: DI = &H8BA8
L_107B: FAC! = FAC! * N_8BA8!  ' RT3F_91
L_107E: BX = DI
L_1080: FAC! = T_0B! - FAC!  ' RT3F_9D; inline=&H8B
L_1084: DI = &H8CD6
L_1087: SI = &H8CDA
L_108A: N_8CD6! = N_8CDA!  ' RT3F_7B
L_108D: T_0C! = FAC!  ' RT3F_71; inline=&H8C
L_1091: GOSUB L_0FED
L_1094: DI = &H8CE6
L_1097: CompareLeft! = FAC!: CompareRight! = N_8CE6!  ' RT3F_A1
L_109A: BX = 0
L_109D: IF CompareLeft! <= CompareRight! THEN GOTO L_10A0  ' flags from L_1097
L_109F: BX = BX - 1
L_10A0: FAC! = CSNG(BX)  ' RT3F_57
L_10A3: DI = &H8BA8
L_10A6: FAC! = FAC! * N_8BA8!  ' RT3F_91
L_10A9: FAC! = T_0C! - FAC!  ' RT3F_9D; inline=&H8C
L_10AD: RETURN
L_10AE: ' Alignment NOP
L_10AF: GOTO L_114D
L_10B2: SI = &H8CEE
L_10B5: BX = SI
L_10B7: DX = BX
L_10B9: BX = CINT(N_8CEE!)  ' RT3F_75
L_10BC: SI = BX
L_10BE: SI = SI * (2 ^ 1)
L_10C0: SI = SI * (2 ^ 1)
L_10C2: BX = SI
L_10C4: SI = SI + &H89C0
L_10C8: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_10CC: SI = DX
L_10CE: DI = &H8CDA
L_10D1: N_8CDA! = N(SI)  ' RT3F_7B
L_10D4: T_0D! = FAC!  ' RT3F_71; inline=&H8D
L_10D8: WORD(BP - 0xE) = BX
L_10DB: GOSUB L_1033
L_10DE: SI = WORD(BP - 0xE)
L_10E1: SI = SI + &H89F0
L_10E5: DI = &H71CC
L_10E8: BX = SI
L_10EA: SI = &H8CEA
L_10ED: T_0E! = FAC!  ' RT3F_71; inline=&H8E
L_10F1: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_10F4: DX = 0
L_10F7: IF CompareLeft! <= CompareRight! THEN GOTO L_10FA  ' flags from L_10F1
L_10F9: DX = DX - 1
L_10FA: SWAP DX, BX
L_10FC: FAC! = CSNG(BX)  ' RT3F_57
L_10FF: SWAP DX, SI
L_1101: FAC! = N(SI) - FAC!  ' RT3F_9B
L_1104: SI = DX
L_1106: DI = &H6F4A
L_1109: T_0F! = FAC!  ' RT3F_71; inline=&H8F
L_110D: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_1110: BX = 0
L_1113: IF CompareLeft! <= CompareRight! THEN GOTO L_1116  ' flags from L_110D
L_1115: BX = BX - 1
L_1116: FAC! = CSNG(BX)  ' RT3F_57
L_1119: FAC! = T_0F! - FAC!  ' RT3F_9D; inline=&H8F
L_111D: DI = DX
L_111F: FAC! = FAC! + N(DI)  ' RT3F_81
L_1122: DI = &H8BF2
L_1125: N_8BF2! = FAC!: SI = &H001A  ' RT3F_7D
L_1128: GOSUB L_0CB1
L_112B: BX = CINT(FAC!)  ' RT3F_77
L_112E: SI = BX
L_1130: SI = SI * (2 ^ 1)
L_1132: SI = SI * (2 ^ 1)
L_1134: SI = SI + &H8C96
L_1138: DI = &H8CF2
L_113B: FAC! = N(SI) + N_8CF2!  ' RT3F_7F
L_113E: FAC! = T_0E! * FAC!  ' RT3F_95; inline=&H8E
L_1142: FAC! = T_0D! + FAC!  ' RT3F_85; inline=&H8D
L_1146: DI = &H8CF6
L_1149: FAC! = FAC! + N_8CF6!  ' RT3F_81
L_114C: RETURN
L_114D: GOTO L_11CA
L_1150: SI = &H8CFE
L_1153: BX = CINT(N_8CFE!)  ' RT3F_75
L_1156: SI = BX
L_1158: SI = SI * (2 ^ 1)
L_115A: SI = SI * (2 ^ 1)
L_115C: BX = SI
L_115E: SI = SI + &H89D8
L_1162: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_1166: BX = BX + &H89F0
L_116A: SI = BX
L_116C: DI = &H71CC
L_116F: SI = &H8CFA
L_1172: T_10! = FAC!  ' RT3F_71; inline=&H90
L_1176: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_1179: DX = 0
L_117C: IF CompareLeft! <= CompareRight! THEN GOTO L_117F  ' flags from L_1176
L_117E: DX = DX - 1
L_117F: SWAP DX, BX
L_1181: FAC! = CSNG(BX)  ' RT3F_57
L_1184: SWAP DX, SI
L_1186: FAC! = N(SI) - FAC!  ' RT3F_9B
L_1189: SI = DX
L_118B: DI = &H6F4A
L_118E: T_11! = FAC!  ' RT3F_71; inline=&H91
L_1192: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_1195: BX = 0
L_1198: IF CompareLeft! <= CompareRight! THEN GOTO L_119B  ' flags from L_1192
L_119A: BX = BX - 1
L_119B: FAC! = CSNG(BX)  ' RT3F_57
L_119E: FAC! = T_11! - FAC!  ' RT3F_9D; inline=&H91
L_11A2: DI = DX
L_11A4: FAC! = FAC! + N(DI)  ' RT3F_81
L_11A7: DI = &H8BF2
L_11AA: N_8BF2! = FAC!: SI = &H001A  ' RT3F_7D
L_11AD: GOSUB L_0CB1
L_11B0: BX = CINT(FAC!)  ' RT3F_77
L_11B3: DI = BX
L_11B5: DI = DI * (2 ^ 1)
L_11B7: DI = DI * (2 ^ 1)
L_11B9: DI = DI + &H8CB6
L_11BD: SI = &H702A
L_11C0: FAC! = N_702A! + N(DI)  ' RT3F_7F
L_11C3: DI = &H8D02
L_11C6: FAC! = FAC! + N_8D02!  ' RT3F_81
L_11C9: RETURN
L_11CA: DI = &H9D46
L_11CD: SI = &H71D8
L_11D0: N_9D46! = N_71D8!  ' RT3F_7B
L_11D3: DI = &H9D4A
L_11D6: N_9D4A! = N_71D8!  ' RT3F_7B
L_11D9: SI = &H6F82
L_11DC: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_11DF: GOTO L_12BE
L_11E2: SI = &H6F82
L_11E5: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_11E8: GOTO L_1219
L_11EB: ' Alignment NOP
L_11EC: SI = &H8BDC
L_11EF: BX = SI
L_11F1: DX = BX
L_11F3: BX = CINT(N_8BDC!)  ' RT3F_75
L_11F6: AX = BX
L_11F8: CX = 5
L_11FB: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_11FD: SI = &H710E
L_1200: BX = CINT(N_710E!)  ' RT3F_75
L_1203: BX = BX + AX
L_1205: BX = BX * (2 ^ 1)
L_1207: BX = BX * (2 ^ 1)
L_1209: BX = BX + &H9D4E
L_120D: READ N(BX)  ' RT3F_0D
L_1210: DI = &H6F4A
L_1213: SI = &H8BDC
L_1216: FAC! = N_8BDC! + N_6F4A!  ' RT3F_7F
L_1219: DI = &H8BDC
L_121C: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_121F: SI = DI
L_1221: DI = &H6F54
L_1224: CompareLeft! = N_8BDC!: CompareRight! = N_6F54!  ' RT3F_9F
L_1227: IF CompareLeft! <= CompareRight! THEN GOTO L_11EC  ' flags from L_1224
L_1229: SI = &H6F82
L_122C: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_122F: GOTO L_125F
L_1232: SI = &H8BDC
L_1235: BX = SI
L_1237: DX = BX
L_1239: BX = CINT(N_8BDC!)  ' RT3F_75
L_123C: AX = BX
L_123E: CX = 5
L_1241: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_1243: SI = &H710E
L_1246: BX = CINT(N_710E!)  ' RT3F_75
L_1249: BX = BX + AX
L_124B: BX = BX * (2 ^ 1)
L_124D: BX = BX * (2 ^ 1)
L_124F: BX = BX + &H9D8A
L_1253: READ N(BX)  ' RT3F_0D
L_1256: DI = &H6F4A
L_1259: SI = &H8BDC
L_125C: FAC! = N_8BDC! + N_6F4A!  ' RT3F_7F
L_125F: DI = &H8BDC
L_1262: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_1265: SI = DI
L_1267: DI = &H7116
L_126A: CompareLeft! = N_8BDC!: CompareRight! = N_7116!  ' RT3F_9F
L_126D: IF CompareLeft! <= CompareRight! THEN GOTO L_1232  ' flags from L_126A
L_126F: SI = &H6F82
L_1272: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_1275: GOTO L_12A5
L_1278: SI = &H8BDC
L_127B: BX = SI
L_127D: DX = BX
L_127F: BX = CINT(N_8BDC!)  ' RT3F_75
L_1282: AX = BX
L_1284: CX = 5
L_1287: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_1289: SI = &H710E
L_128C: BX = CINT(N_710E!)  ' RT3F_75
L_128F: BX = BX + AX
L_1291: BX = BX * (2 ^ 1)
L_1293: BX = BX * (2 ^ 1)
L_1295: BX = BX + &H9E3E
L_1299: READ N(BX)  ' RT3F_0D
L_129C: DI = &H6F4A
L_129F: SI = &H8BDC
L_12A2: FAC! = N_8BDC! + N_6F4A!  ' RT3F_7F
L_12A5: DI = &H8BDC
L_12A8: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_12AB: SI = DI
L_12AD: DI = &H710A
L_12B0: CompareLeft! = N_8BDC!: CompareRight! = N_710A!  ' RT3F_9F
L_12B3: IF CompareLeft! <= CompareRight! THEN GOTO L_1278  ' flags from L_12B0
L_12B5: DI = &H6F4A
L_12B8: SI = &H710E
L_12BB: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_12BE: DI = &H710E
L_12C1: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_12C4: SI = DI
L_12C6: DI = &H71CC
L_12C9: CompareLeft! = N_710E!: CompareRight! = N_71CC!  ' RT3F_9F
L_12CC: IF CompareLeft! > CompareRight! THEN GOTO L_12D1  ' flags from L_12C9
L_12CE: GOTO L_11E2
L_12D1: ' Alignment NOP
L_12D2: ' Alignment NOP
L_12D3: DI = &H9E92
L_12D6: SI = &H18C4
L_12D9: FAC! = N_18C4! * N_9E92!  ' RT3F_8F
L_12DC: BX = DI
L_12DE: DI = &H8BD8
L_12E1: SI = &H1910
L_12E4: T_12! = FAC!  ' RT3F_71; inline=&H92
L_12E8: FAC! = N(SI) / N(DI)  ' RT3F_87
L_12EB: FAC! = T_12! + FAC!  ' RT3F_85; inline=&H92
L_12EF: SI = &H186C
L_12F2: T_13! = FAC!  ' RT3F_71; inline=&H93
L_12F6: FAC! = SGN(N(SI))  ' RT3F_2F
L_12F9: SI = &H195C
L_12FC: FAC! = N_195C! * FAC!  ' RT3F_93
L_12FF: SI = &H1870
L_1302: T_14! = FAC!  ' RT3F_71; inline=&H94
L_1306: FAC! = SGN(N(SI))  ' RT3F_2F
L_1309: SI = &H1968
L_130C: FAC! = N_1968! * FAC!  ' RT3F_93
L_130F: FAC! = T_14! + FAC!  ' RT3F_85; inline=&H94
L_1313: SI = &H1874
L_1316: T_15! = FAC!  ' RT3F_71; inline=&H95
L_131A: FAC! = SGN(N(SI))  ' RT3F_2F
L_131D: SI = &H1974
L_1320: FAC! = N_1974! * FAC!  ' RT3F_93
L_1323: FAC! = T_15! + FAC!  ' RT3F_85; inline=&H95
L_1327: SI = &H1878
L_132A: T_16! = FAC!  ' RT3F_71; inline=&H96
L_132E: FAC! = SGN(N(SI))  ' RT3F_2F
L_1331: SI = &H1980
L_1334: FAC! = N_1980! * FAC!  ' RT3F_93
L_1337: FAC! = T_16! + FAC!  ' RT3F_85; inline=&H96
L_133B: DI = &H71F0
L_133E: FAC! = FAC! / N_71F0!  ' RT3F_89
L_1341: FAC! = T_13! + FAC!  ' RT3F_85; inline=&H93
L_1345: DI = BX
L_1347: FAC! = FAC! + N(DI)  ' RT3F_81
L_134A: DI = &H9E96
L_134D: SI = &H189C
L_1350: T_17! = FAC!  ' RT3F_71; inline=&H97
L_1354: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_1357: BX = &H1A
L_135A: FAC! = INT(FAC!)  ' RT3D_03
L_135D: DI = &H8C0E
L_1360: FAC! = FAC! + N_8C0E!  ' RT3F_81
L_1363: FAC! = T_17! / FAC!  ' RT3F_8D; inline=&H97
L_1367: DI = &H9E8E
L_136A: N_9E8E! = FAC!: SI = &H001A  ' RT3F_7D
L_136D: DI = &H9E9A
L_1370: SI = &H6F54
L_1373: N_9E9A! = N_6F54!  ' RT3F_7B
L_1376: DI = &H9E9E
L_1379: SI = &H6F82
L_137C: N_9E9E! = N_6F82!  ' RT3F_7B
L_137F: DI = &H9EA2
L_1382: N_9EA2! = N_6F82!  ' RT3F_7B
L_1385: SI = &H6F4A
L_1388: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_138B: GOTO L_13BF
L_138E: DI = &H7188
L_1391: SI = &H9EAA
L_1394: N_7188! = N_9EAA!  ' RT3F_7B
L_1397: DI = &H718C
L_139A: SI = &H9EA6
L_139D: N_718C! = N_9EA6!  ' RT3F_7B
L_13A0: GOSUB L_0333
L_13A3: BX = CINT(FAC!)  ' RT3F_77
L_13A6: DI = BX
L_13A8: DI = DI * (2 ^ 1)
L_13AA: DI = DI * (2 ^ 1)
L_13AC: DI = DI + &H1850
L_13B0: SI = &H9EAE
L_13B3: N(DI) = N_9EAE!  ' RT3F_7B
L_13B6: DI = &H6F4A
L_13B9: SI = &H9EA6
L_13BC: FAC! = N_9EA6! + N_6F4A!  ' RT3F_7F
L_13BF: DI = &H9EA6
L_13C2: N_9EA6! = FAC!: SI = &H001A  ' RT3F_7D
L_13C5: SI = DI
L_13C7: DI = &H7116
L_13CA: CompareLeft! = N_9EA6!: CompareRight! = N_7116!  ' RT3F_9F
L_13CD: IF CompareLeft! <= CompareRight! THEN GOTO L_138E  ' flags from L_13CA
L_13CF: GOSUB L_4186
L_13D2: GOTO L_2088

```

### Option and status displays

```basic
L_13D5: DI = &H9EB6
L_13D8: SI = &H19B0
L_13DB: FAC! = N_19B0! * N_9EB6!  ' RT3F_8F
L_13DE: DI = &H9EB2
L_13E1: N_9EB2! = FAC!: SI = &H001A  ' RT3F_7D
L_13E4: SI = &H6F4A
L_13E7: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_13EA: GOTO L_13F7
L_13ED: ' Alignment NOP
L_13EE: DI = &H6F4A
L_13F1: SI = &H9EBA
L_13F4: FAC! = N_9EBA! + N_6F4A!  ' RT3F_7F
L_13F7: DI = &H9EBA
L_13FA: N_9EBA! = FAC!: SI = &H001A  ' RT3F_7D
L_13FD: SI = DI
L_13FF: DI = &H9EB2
L_1402: CompareLeft! = N_9EBA!: CompareRight! = N_9EB2!  ' RT3F_9F
L_1405: IF CompareLeft! <= CompareRight! THEN GOTO L_13EE  ' flags from L_1402
L_1407: RETURN
L_1408: BX = &H18
L_140B: ARGPUSH BX  ' RT3E_42
L_140E: BX = 3
L_1411: LOCATE ARGS(), BX  ' RT3E_44
L_1414: ' PRINT statement begins ; RT3F_BC
L_1417: BX = &H9EBE
L_141A: PRINT S_9EBE$;  ' RT3F_6A
L_141D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1420: GOSUB L_1857
L_1423: RETURN
L_1424: DI = &H7198
L_1427: SI = &H1988
L_142A: FAC! = N_1988! * N_7198!  ' RT3F_8F
L_142D: DI = &H198C
L_1430: FAC! = FAC! + N_198C!  ' RT3F_81
L_1433: DI = &H9ED0
L_1436: FAC! = FAC! + N_9ED0!  ' RT3F_81
L_1439: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_143C: SI = DI
L_143E: DI = &H9ED4
L_1441: CompareLeft! = N(SI): CompareRight! = N_9ED4!  ' RT3F_9F
L_1444: IF CompareLeft! > CompareRight! THEN GOTO L_1449  ' flags from L_1441
L_1446: GOTO L_144E
L_1449: SWAP DI, SI
L_144B: N(DI) = N(SI)  ' RT3F_7B
L_144E: DI = &H7198
L_1451: SI = &H9ED0
L_1454: FAC! = N_9ED0! / N_7198!  ' RT3F_87
L_1457: BX = DI
L_1459: DI = &H1988
L_145C: DX = SI
L_145E: N_1988! = FAC!: SI = &H001A  ' RT3F_7D
L_1461: SWAP BX, DI
L_1463: SI = BX
L_1465: FAC! = N_1988! * N(DI)  ' RT3F_8F
L_1468: SI = DX
L_146A: FAC! = N(SI) - FAC!  ' RT3F_9B
L_146D: DI = &H198C
L_1470: N_198C! = FAC!: SI = &H001A  ' RT3F_7D
L_1473: RETURN
L_1474: RETURN
L_1475: DI = &H9EE6
L_1478: SI = &H710E
L_147B: FAC! = N_710E! + N_9EE6!  ' RT3F_7F
L_147E: BX = SI
L_1480: DX = BX
L_1482: BX = CINT(FAC!)  ' RT3F_77
L_1485: ARGPUSH BX  ' RT3E_42
L_1488: BX = &H21
L_148B: LOCATE ARGS(), BX  ' RT3E_44
L_148E: SI = DX
L_1490: DI = &H6F8A
L_1493: FAC! = N(SI) * N_6F8A!  ' RT3F_8F
L_1496: DI = &H9EEA
L_1499: FAC! = FAC! + N_9EEA!  ' RT3F_81
L_149C: DI = &H71C0
L_149F: N_71C0! = FAC!: SI = &H001A  ' RT3F_7D
L_14A2: SI = DI
L_14A4: BX = CINT(N_71C0!)  ' RT3F_75
L_14A7: SI = BX
L_14A9: SI = SI * (2 ^ 1)
L_14AB: SI = SI * (2 ^ 1)
L_14AD: SI = SI + &H1850
L_14B1: DI = &H9EE2
L_14B4: N_9EE2! = N(SI)  ' RT3F_7B
L_14B7: SI = DI
L_14B9: DI = &H6F4A
L_14BC: CompareLeft! = N_9EE2!: CompareRight! = N_6F4A!  ' RT3F_9F
L_14BF: BX = 0
L_14C2: IF CompareLeft! >= CompareRight! THEN GOTO L_14C5  ' flags from L_14BC
L_14C4: BX = BX - 1
L_14C5: SI = DX
L_14C7: CX = DI
L_14C9: DI = &H8BD8
L_14CC: FAC! = N(SI) + N_8BD8!  ' RT3F_7F
L_14CF: DX = BX
L_14D1: BX = CINT(FAC!)  ' RT3F_77
L_14D4: BX = BX * (2 ^ 1)
L_14D6: BX = BX * (2 ^ 1)
L_14D8: BX = BX + &H1850
L_14DC: FAC! = INT(N(BX))  ' RT3D_03
L_14DF: DI = CX
L_14E1: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_14E4: BX = 0
L_14E7: IF CompareLeft! = CompareRight! THEN GOTO L_14EA  ' flags from L_14E1
L_14E9: BX = BX - 1
L_14EA: BX = BX OR DX
L_14EC: CompareLeft% = BX: CompareRight% = 0
L_14EE: IF CompareLeft% <> CompareRight% THEN GOTO L_14F3  ' flags from L_14EC
L_14F0: GOTO L_1500
L_14F3: ' PRINT statement begins ; RT3F_BC
L_14F6: BX = &H9ED8
L_14F9: PRINT S_9ED8$  ' RT3F_6E; H newline item, ledger correction
L_14FC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_14FF: RETURN
L_1500: DI = &H8BD4
L_1503: SI = &H9EE2
L_1506: CompareLeft! = N_9EE2!: CompareRight! = N_8BD4!  ' RT3F_9F
L_1509: IF CompareLeft! > CompareRight! THEN GOTO L_150E  ' flags from L_1506
L_150B: GOTO L_151B
L_150E: ' PRINT statement begins ; RT3F_BC
L_1511: BX = &H70CA
L_1514: PRINT S_70CA$  ' RT3F_6E; H newline item, ledger correction
L_1517: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_151A: RETURN
L_151B: DI = &H9EEE
L_151E: SI = &H6F82
L_1521: N_9EEE! = N_6F82!  ' RT3F_7B
L_1524: SI = &H71E8
L_1527: FAC! = N_71E8!: DI = &H001E  ' RT3F_6F
L_152A: GOTO L_1564
L_152D: ' Alignment NOP
L_152E: SI = &H9EF2
L_1531: BX = SI
L_1533: DX = BX
L_1535: BX = CINT(N_9EF2!)  ' RT3F_75
L_1538: SI = BX
L_153A: SI = SI * (2 ^ 1)
L_153C: SI = SI * (2 ^ 1)
L_153E: SI = SI + &H1850
L_1542: DI = &H9EE2
L_1545: CompareLeft! = N(SI): CompareRight! = N_9EE2!  ' RT3F_9F
L_1548: BX = 0
L_154B: IF CompareLeft! <> CompareRight! THEN GOTO L_154E  ' flags from L_1545
L_154D: BX = BX - 1
L_154E: FAC! = CSNG(BX)  ' RT3F_57
L_1551: SI = &H9EEE
L_1554: FAC! = N_9EEE! - FAC!  ' RT3F_9B
L_1557: DI = SI
L_1559: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_155C: SI = DX
L_155E: DI = &H6F4A
L_1561: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_1564: DI = &H9EF2
L_1567: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_156A: SI = DI
L_156C: DI = &H71EC
L_156F: CompareLeft! = N_9EF2!: CompareRight! = N_71EC!  ' RT3F_9F
L_1572: IF CompareLeft! <= CompareRight! THEN GOTO L_152E  ' flags from L_156F
L_1574: DI = &H71D4
L_1577: SI = &H71C0
L_157A: FAC! = N_71C0! + N_71D4!  ' RT3F_7F
L_157D: BX = CINT(FAC!)  ' RT3F_77
L_1580: SI = BX
L_1582: SI = SI * (2 ^ 1)
L_1584: SI = SI * (2 ^ 1)
L_1586: SI = SI + &H1850
L_158A: DI = &H9EBA
L_158D: N_9EBA! = N(SI)  ' RT3F_7B
L_1590: BX = &H9EF6
L_1593: PRINT USING S_9EF6$;  ' RT3F_BD
L_1596: BX = &H9EBA
L_1599: PRINT N_9EBA!;  ' RT3F_67; H expanded ledger
L_159C: BX = &H9EEE
L_159F: PRINT N_9EEE!  ' RT3F_6B
L_15A2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_15A5: RETURN
L_15A6: GOSUB L_1D8C
L_15A9: BX = &H16
L_15AC: ARGPUSH BX  ' RT3E_42
L_15AF: BX = 3
L_15B2: LOCATE ARGS(), BX  ' RT3E_44
L_15B5: ' PRINT statement begins ; RT3F_BC
L_15B8: BX = &H9F00
L_15BB: PRINT S_9F00$;  ' RT3F_6A
L_15BE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_15C1: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_15C4: DX = &H715C
L_15C7: S_715C$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_15CA: AX = DX
L_15CC: BX = &H6F46
L_15CF: CompareLeft$ = S(AX): CompareRight$ = S_6F46$  ' RT3F_62; H string compare from 9E1F..9E49
L_15D2: IF CompareLeft$ = CompareRight$ THEN GOTO L_15C1  ' flags from L_15CF
L_15D4: BX = &H715C
L_15D7: BX = ASC(S_715C$)  ' RT3F_BB
L_15DA: FAC! = CSNG(BX)  ' RT3F_57
L_15DD: DI = &H710E
L_15E0: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_15E3: SI = DI
L_15E5: DI = &H9F04
L_15E8: CompareLeft! = N_710E!: CompareRight! = N_9F04!  ' RT3F_9F
L_15EB: IF CompareLeft! = CompareRight! THEN GOTO L_15F0  ' flags from L_15E8
L_15ED: GOTO L_15FC
L_15F0: DI = &H9EA6
L_15F3: SI = &H9F08
L_15F6: N_9EA6! = N_9F08!  ' RT3F_7B
L_15F9: GOTO L_1692
L_15FC: DI = &H9F0C
L_15FF: SI = &H710E
L_1602: CompareLeft! = N_710E!: CompareRight! = N_9F0C!  ' RT3F_9F
L_1605: BX = 0
L_1608: IF CompareLeft! <> CompareRight! THEN GOTO L_160B  ' flags from L_1602
L_160A: BX = BX - 1
L_160B: DI = &H9F10
L_160E: CompareLeft! = N(SI): CompareRight! = N_9F10!  ' RT3F_9F
L_1611: DX = 0
L_1614: IF CompareLeft! <> CompareRight! THEN GOTO L_1617  ' flags from L_160E
L_1616: DX = DX - 1
L_1617: DX = DX OR BX
L_1619: CompareLeft% = DX: CompareRight% = 0
L_161B: IF CompareLeft% <> CompareRight% THEN GOTO L_1620  ' flags from L_1619
L_161D: GOTO L_162C
L_1620: DI = &H9EA6
L_1623: SI = &H6F4A
L_1626: N_9EA6! = N_6F4A!  ' RT3F_7B
L_1629: GOTO L_1692
L_162C: DI = &H9F14
L_162F: SI = &H710E
L_1632: CompareLeft! = N_710E!: CompareRight! = N_9F14!  ' RT3F_9F
L_1635: BX = 0
L_1638: IF CompareLeft! <> CompareRight! THEN GOTO L_163B  ' flags from L_1632
L_163A: BX = BX - 1
L_163B: DI = &H71C4
L_163E: CompareLeft! = N(SI): CompareRight! = N_71C4!  ' RT3F_9F
L_1641: DX = 0
L_1644: IF CompareLeft! <> CompareRight! THEN GOTO L_1647  ' flags from L_163E
L_1646: DX = DX - 1
L_1647: DX = DX OR BX
L_1649: CompareLeft% = DX: CompareRight% = 0
L_164B: IF CompareLeft% <> CompareRight% THEN GOTO L_1650  ' flags from L_1649
L_164D: GOTO L_165C
L_1650: DI = &H9EA6
L_1653: SI = &H6F54
L_1656: N_9EA6! = N_6F54!  ' RT3F_7B
L_1659: GOTO L_1692
L_165C: DI = &H9F18
L_165F: SI = &H710E
L_1662: CompareLeft! = N_710E!: CompareRight! = N_9F18!  ' RT3F_9F
L_1665: BX = 0
L_1668: IF CompareLeft! <= CompareRight! THEN GOTO L_166B  ' flags from L_1662
L_166A: BX = BX - 1
L_166B: DI = &H9F1C
L_166E: CompareLeft! = N(SI): CompareRight! = N_9F1C!  ' RT3F_9F
L_1671: DX = 0
L_1674: IF CompareLeft! >= CompareRight! THEN GOTO L_1677  ' flags from L_166E
L_1676: DX = DX - 1
L_1677: DX = DX AND BX
L_1679: CompareLeft% = DX: CompareRight% = 0
L_167B: IF CompareLeft% <> CompareRight% THEN GOTO L_1680  ' flags from L_1679
L_167D: GOTO L_168F
L_1680: DI = &H9F20
L_1683: FAC! = N(SI) + N_9F20!  ' RT3F_7F
L_1686: DI = &H9EA6
L_1689: N_9EA6! = FAC!: SI = &H001A  ' RT3F_7D
L_168C: GOTO L_1692
L_168F: GOTO L_15C1
L_1692: RETURN
L_1693: SI = &H6F4A
L_1696: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_1699: GOTO L_16A8
L_169C: GOSUB L_13D5
L_169F: DI = &H6F4A
L_16A2: SI = &H9D46
L_16A5: FAC! = N_9D46! + N_6F4A!  ' RT3F_7F
L_16A8: DI = &H9D46
L_16AB: N_9D46! = FAC!: SI = &H001A  ' RT3F_7D
L_16AE: SI = DI
L_16B0: DI = &H71D4
L_16B3: CompareLeft! = N_9D46!: CompareRight! = N_71D4!  ' RT3F_9F
L_16B6: IF CompareLeft! <= CompareRight! THEN GOTO L_169C  ' flags from L_16B3
L_16B8: RETURN
L_16B9: ' PRINT statement begins ; RT3F_BC
L_16BC: BX = &H9F24
L_16BF: PRINT S_9F24$;  ' RT3F_6A
L_16C2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_16C5: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_16C8: DX = &H715C
L_16CB: S_715C$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_16CE: AX = DX
L_16D0: BX = &H6F46
L_16D3: CompareLeft$ = S(AX): CompareRight$ = S_6F46$  ' RT3F_62; H string compare from 9E1F..9E49
L_16D6: IF CompareLeft$ = CompareRight$ THEN GOTO L_16C5  ' flags from L_16D3
L_16D8: BX = 0xD
L_16DB: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_16DE: AX = BX
L_16E0: BX = &H715C
L_16E3: CompareLeft$ = S(AX): CompareRight$ = S_715C$  ' RT3F_62; H string compare from 9E1F..9E49
L_16E6: IF CompareLeft$ <> CompareRight$ THEN GOTO L_16C5  ' flags from L_16E3
L_16E8: RETURN
L_16E9: DI = &H9EBA
L_16EC: SI = &H192C
L_16EF: N_9EBA! = N_192C!  ' RT3F_7B
L_16F2: SI = DI
L_16F4: DI = &H9F38
L_16F7: CompareLeft! = N_9EBA!: CompareRight! = N_9F38!  ' RT3F_9F
L_16FA: IF CompareLeft! > CompareRight! THEN GOTO L_16FF  ' flags from L_16F7
L_16FC: GOTO L_1704
L_16FF: SWAP DI, SI
L_1701: N(DI) = N(SI)  ' RT3F_7B
L_1704: BX = 6
L_1707: ARGPUSH BX  ' RT3E_42
L_170A: BX = &H1B
L_170D: LOCATE ARGS(), BX  ' RT3E_44
L_1710: BX = &H9F3C
L_1713: PRINT USING S_9F3C$;  ' RT3F_BD
L_1716: BX = &H9EBA
L_1719: PRINT N_9EBA!  ' RT3F_6B
L_171C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_171F: RETURN
L_1720: BX = 4
L_1723: ARGPUSH BX  ' RT3E_42
L_1726: BX = &H1A
L_1729: LOCATE ARGS(), BX  ' RT3E_44
L_172C: BX = &H9F44
L_172F: PRINT USING S_9F44$;  ' RT3F_BD
L_1732: BX = &H3AB0
L_1735: PRINT N_3AB0!  ' RT3F_6B
L_1738: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_173B: RETURN
L_173C: DI = &H9F4C
L_173F: SI = &H6F4A
L_1742: N_9F4C! = N_6F4A!  ' RT3F_7B
L_1745: SI = &H6F4A
L_1748: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_174B: GOTO L_181D
L_174E: DI = &H8BD8
L_1751: SI = &H9F50
L_1754: FAC! = N_9F50! + N_8BD8!  ' RT3F_7F
L_1757: BX = SI
L_1759: DX = BX
L_175B: BX = CINT(FAC!)  ' RT3F_77
L_175E: ARGPUSH BX  ' RT3E_42
L_1761: BX = &H17
L_1764: LOCATE ARGS(), BX  ' RT3E_44
L_1767: DI = &H7174
L_176A: SI = &H71F4
L_176D: N_7174! = N_71F4!  ' RT3F_7B
L_1770: SWAP DX, SI
L_1772: BX = DI
L_1774: DI = &H7178
L_1777: N_7178! = N(SI)  ' RT3F_7B
L_177A: GOSUB L_0301
L_177D: DI = &H6F4A
L_1780: CompareLeft! = FAC!: CompareRight! = N_6F4A!  ' RT3F_A1
L_1783: IF CompareLeft! <> CompareRight! THEN GOTO L_1788  ' flags from L_1780
L_1785: GOTO L_17B4
L_1788: ' PRINT statement begins ; RT3F_BC
L_178B: DI = &H7174
L_178E: SI = &H71F4
L_1791: N_7174! = N_71F4!  ' RT3F_7B
L_1794: DI = &H7178
L_1797: SI = &H9F50
L_179A: N_7178! = N_9F50!  ' RT3F_7B
L_179D: GOSUB L_0301
L_17A0: BX = CINT(FAC!)  ' RT3F_77
L_17A3: BX = BX * (2 ^ 1)
L_17A5: BX = BX * (2 ^ 1)
L_17A7: BX = BX + &H70B6
L_17AB: PRINT S(BX);  ' RT3F_6A
L_17AE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_17B1: GOTO L_17CB
L_17B4: ' PRINT statement begins ; RT3F_BC
L_17B7: SI = &H9F50
L_17BA: BX = CINT(N_9F50!)  ' RT3F_75
L_17BD: BX = BX * (2 ^ 1)
L_17BF: BX = BX * (2 ^ 1)
L_17C1: BX = BX + &H4288
L_17C5: PRINT S(BX);  ' RT3F_6A
L_17C8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_17CB: ' PRINT statement begins ; RT3F_BC
L_17CE: BX = 0
L_17D0: BX = POS(BX)  ' RT3D_21
L_17D3: BX = BX - &H1F
L_17D6: BX = -BX
L_17D8: PRINT SPC(BX);  ' RT3F_35; M ledger
L_17DB: BX = &H6F46
L_17DE: PRINT S_6F46$;  ' RT3F_6A
L_17E1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_17E4: DI = &H7174
L_17E7: SI = &H71F4
L_17EA: N_7174! = N_71F4!  ' RT3F_7B
L_17ED: DI = &H7178
L_17F0: SI = &H9F50
L_17F3: N_7178! = N_9F50!  ' RT3F_7B
L_17F6: GOSUB L_0301
L_17F9: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_17FC: BX = 0
L_17FF: IF CompareLeft! <> CompareRight! THEN GOTO L_1802  ' flags from L_17F9
L_1801: BX = BX - 1
L_1802: CompareLeft% = BX: CompareRight% = 0
L_1804: IF CompareLeft% >= CompareRight% THEN GOTO L_1808  ' flags from L_1802
L_1806: BX = -BX
L_1808: FAC! = CSNG(BX)  ' RT3F_57
L_180B: DI = &H9F4C
L_180E: FAC! = FAC! * N_9F4C!  ' RT3F_91
L_1811: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1814: DI = &H6F4A
L_1817: SI = &H9F50
L_181A: FAC! = N_9F50! + N_6F4A!  ' RT3F_7F
L_181D: DI = &H9F50
L_1820: N_9F50! = FAC!: SI = &H001A  ' RT3F_7D
L_1823: SI = DI
L_1825: DI = &H7116
L_1828: CompareLeft! = N_9F50!: CompareRight! = N_7116!  ' RT3F_9F
L_182B: IF CompareLeft! > CompareRight! THEN GOTO L_1830  ' flags from L_1828
L_182D: GOTO L_174E
L_1830: RETURN
L_1831: SI = &H6F4A
L_1834: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_1837: GOTO L_1846
L_183A: GOSUB L_1475
L_183D: DI = &H6F4A
L_1840: SI = &H710E
L_1843: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_1846: DI = &H710E
L_1849: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_184C: SI = DI
L_184E: DI = &H71D8
L_1851: CompareLeft! = N_710E!: CompareRight! = N_71D8!  ' RT3F_9F
L_1854: IF CompareLeft! <= CompareRight! THEN GOTO L_183A  ' flags from L_1851
L_1856: RETURN
L_1857: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_185A: DX = &H715C
L_185D: S_715C$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1860: AX = DX
L_1862: BX = &H6F46
L_1865: CompareLeft$ = S(AX): CompareRight$ = S_6F46$  ' RT3F_62; H string compare from 9E1F..9E49
L_1868: IF CompareLeft$ = CompareRight$ THEN GOTO L_1857  ' flags from L_1865
L_186A: BX = &H715C
L_186D: BX = ASC(S_715C$)  ' RT3F_BB
L_1870: FAC! = CSNG(BX)  ' RT3F_57
L_1873: DI = &H9F54
L_1876: N_9F54! = FAC!: SI = &H001A  ' RT3F_7D
L_1879: SI = DI
L_187B: DI = &H9F58
L_187E: CompareLeft! = N_9F54!: CompareRight! = N_9F58!  ' RT3F_9F
L_1881: IF CompareLeft! > CompareRight! THEN GOTO L_1886  ' flags from L_187E
L_1883: GOTO L_1891
L_1886: DI = &H9F5C
L_1889: FAC! = N(SI) + N_9F5C!  ' RT3F_7F
L_188C: DI = SI
L_188E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1891: DI = &H9F68
L_1894: SI = &H9F54
L_1897: FAC! = N_9F54! + N_9F68!  ' RT3F_7F
L_189A: DI = SI
L_189C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_189F: SI = DI
L_18A1: DI = &H9F5C
L_18A4: CompareLeft! = N(SI): CompareRight! = N_9F5C!  ' RT3F_9F
L_18A7: BX = 0
L_18AA: IF CompareLeft! <> CompareRight! THEN GOTO L_18AD  ' flags from L_18A4
L_18AC: BX = BX - 1
L_18AD: DI = &H9F6C
L_18B0: CompareLeft! = N(SI): CompareRight! = N_9F6C!  ' RT3F_9F
L_18B3: DX = 0
L_18B6: IF CompareLeft! <> CompareRight! THEN GOTO L_18B9  ' flags from L_18B0
L_18B8: DX = DX - 1
L_18B9: DX = DX OR BX
L_18BB: DI = &H9F60
L_18BE: CompareLeft! = N(SI): CompareRight! = N_9F60!  ' RT3F_9F
L_18C1: BX = 0
L_18C4: IF CompareLeft! < CompareRight! THEN GOTO L_18C7  ' flags from L_18BE
L_18C6: BX = BX - 1
L_18C7: DI = &H9F64
L_18CA: CompareLeft! = N(SI): CompareRight! = N_9F64!  ' RT3F_9F
L_18CD: CX = 0
L_18D0: IF CompareLeft! > CompareRight! THEN GOTO L_18D3  ' flags from L_18CA
L_18D2: CX = CX - 1
L_18D3: CX = CX AND BX
L_18D5: CX = CX OR DX
L_18D7: CompareLeft% = CX: CompareRight% = 0
L_18D9: IF CompareLeft% <> CompareRight% THEN GOTO L_18DE  ' flags from L_18D7
L_18DB: GOTO L_18DF
L_18DE: RETURN
L_18DF: GOTO L_1857
L_18E2: DI = &H9F70
L_18E5: SI = &H9F7C
L_18E8: N_9F70! = N_9F7C!  ' RT3F_7B
L_18EB: DI = &H9F74
L_18EE: SI = &H7164
L_18F1: N_9F74! = N_7164!  ' RT3F_7B
L_18F4: DI = &H9F78
L_18F7: SI = &H3B18
L_18FA: N_9F78! = N_3B18!  ' RT3F_7B
L_18FD: GOSUB L_4372
L_1900: SI = &H6F82
L_1903: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_1906: GOTO L_19DA
L_1909: ' Alignment NOP
L_190A: DI = &H9F78
L_190D: SI = &H9EF2
L_1910: FAC! = N_9EF2! + N_9F78!  ' RT3F_7F
L_1913: DI = &H71C0
L_1916: N_71C0! = FAC!: SI = &H001A  ' RT3F_7D
L_1919: SI = DI
L_191B: DI = &H6F8A
L_191E: CompareLeft! = N_71C0!: CompareRight! = N_6F8A!  ' RT3F_9F
L_1921: IF CompareLeft! > CompareRight! THEN GOTO L_1926  ' flags from L_191E
L_1923: GOTO L_1931
L_1926: DI = &H9F80
L_1929: FAC! = N(SI) + N_9F80!  ' RT3F_7F
L_192C: DI = SI
L_192E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1931: DI = &H6F54
L_1934: SI = &H9EF2
L_1937: CompareLeft! = N_9EF2!: CompareRight! = N_6F54!  ' RT3F_9F
L_193A: BX = 0
L_193D: IF CompareLeft! <> CompareRight! THEN GOTO L_1940  ' flags from L_1937
L_193F: BX = BX - 1
L_1940: DI = &H71D8
L_1943: CompareLeft! = N(SI): CompareRight! = N_71D8!  ' RT3F_9F
L_1946: DX = 0
L_1949: IF CompareLeft! <> CompareRight! THEN GOTO L_194C  ' flags from L_1943
L_194B: DX = DX - 1
L_194C: DX = DX OR BX
L_194E: CompareLeft% = DX: CompareRight% = 0
L_1950: IF CompareLeft% <> CompareRight% THEN GOTO L_1955  ' flags from L_194E
L_1952: GOTO L_1961
L_1955: DI = &H6F86
L_1958: SI = &H6F8A
L_195B: N_6F86! = N_6F8A!  ' RT3F_7B
L_195E: GOTO L_199D
L_1961: DI = &H6F54
L_1964: SI = &H9EF2
L_1967: CompareLeft! = N_9EF2!: CompareRight! = N_6F54!  ' RT3F_9F
L_196A: BX = 0
L_196D: IF CompareLeft! <= CompareRight! THEN GOTO L_1970  ' flags from L_1967
L_196F: BX = BX - 1
L_1970: FAC! = CSNG(BX)  ' RT3F_57
L_1973: DI = &H71D8
L_1976: T_12! = FAC!  ' RT3F_71; inline=&H92
L_197A: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_197D: BX = 0
L_1980: IF CompareLeft! <= CompareRight! THEN GOTO L_1983  ' flags from L_197A
L_1982: BX = BX - 1
L_1983: FAC! = CSNG(BX)  ' RT3F_57
L_1986: BX = SI
L_1988: FAC! = T_12! + FAC!  ' RT3F_85; inline=&H92
L_198C: DI = BX
L_198E: FAC! = FAC! + N(DI)  ' RT3F_81
L_1991: DI = &H6F4A
L_1994: FAC! = FAC! + N_6F4A!  ' RT3F_81
L_1997: DI = &H6F86
L_199A: N_6F86! = FAC!: SI = &H001A  ' RT3F_7D
L_199D: SI = &H71C0
L_19A0: BX = CINT(N_71C0!)  ' RT3F_75
L_19A3: DI = BX
L_19A5: DI = DI * (2 ^ 1)
L_19A7: BX = WORD(DI + &H6F62)
L_19AB: BX = BX + 0xE4
L_19AF: FAC! = CSNG(BX)  ' RT3F_57
L_19B2: BX = DI
L_19B4: DI = &H710E
L_19B7: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_19BA: DI = BX
L_19BC: DX = WORD(BX + &H6F72)
L_19C0: DX = DX + -&H4C
L_19C3: BX = DX
L_19C5: FAC! = CSNG(BX)  ' RT3F_57
L_19C8: DI = &H8BDC
L_19CB: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_19CE: GOSUB L_1B68
L_19D1: DI = &H6F4A
L_19D4: SI = &H9EF2
L_19D7: FAC! = N_9EF2! + N_6F4A!  ' RT3F_7F
L_19DA: DI = &H9EF2
L_19DD: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_19E0: SI = DI
L_19E2: DI = &H6F8A
L_19E5: CompareLeft! = N_9EF2!: CompareRight! = N_6F8A!  ' RT3F_9F
L_19E8: IF CompareLeft! > CompareRight! THEN GOTO L_19ED  ' flags from L_19E5
L_19EA: GOTO L_190A
L_19ED: DI = &H9F84
L_19F0: SI = &H6F4A
L_19F3: N_9F84! = N_6F4A!  ' RT3F_7B
L_19F6: DI = &H9F88
L_19F9: SI = &H6F82
L_19FC: N_9F88! = N_6F82!  ' RT3F_7B
L_19FF: DI = &H9F8C

```

### Selection and readiness

```basic
L_1A02: BX = SI
L_1A04: SI = &H9F94
L_1A07: N_9F8C! = N_9F94!  ' RT3F_7B
L_1A0A: SI = BX
L_1A0C: DI = &H9F90
L_1A0F: N_9F90! = N_6F82!  ' RT3F_7B
L_1A12: GOSUB L_1AC7
L_1A15: SI = &H6F4A
L_1A18: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_1A1B: GOTO L_1A86
L_1A1E: DI = &H71D8
L_1A21: SI = &H9F98
L_1A24: FAC! = N_9F98! + N_71D8!  ' RT3F_7F
L_1A27: BX = CINT(FAC!)  ' RT3F_77
L_1A2A: SI = BX
L_1A2C: SI = SI * (2 ^ 1)
L_1A2E: SI = SI * (2 ^ 1)
L_1A30: SI = SI + &H1850
L_1A34: DI = &H9F84
L_1A37: N_9F84! = N(SI)  ' RT3F_7B
L_1A3A: SI = DI
L_1A3C: CompareLeft! = N_9F84!: CompareRight! = 0  ' RT3F_A7
L_1A3F: IF CompareLeft! <> CompareRight! THEN GOTO L_1A44  ' flags from L_1A3C
L_1A41: GOTO L_1A7D
L_1A44: SI = &H9F98
L_1A47: FAC! = N_9F98! * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_1A4B: SI = &H9F9C
L_1A4E: FAC! = N_9F9C! - FAC!  ' RT3F_9B
L_1A51: DI = &H9F78
L_1A54: FAC! = FAC! - N_9F78!  ' RT3F_99
L_1A57: DI = &H9FA0
L_1A5A: FAC! = FAC! * N_9FA0!  ' RT3F_91
L_1A5D: DI = &H9F88
L_1A60: N_9F88! = FAC!: SI = &H001A  ' RT3F_7D
L_1A63: SI = DI
L_1A65: DI = &H9FA4
L_1A68: FAC! = N_9F88! + N_9FA4!  ' RT3F_7F
L_1A6B: DI = &H9F8C
L_1A6E: N_9F8C! = FAC!: SI = &H001A  ' RT3F_7D
L_1A71: DI = &H9F90
L_1A74: SI = &H6F4A
L_1A77: N_9F90! = N_6F4A!  ' RT3F_7B
L_1A7A: GOSUB L_1A97
L_1A7D: DI = &H6F4A
L_1A80: SI = &H9F98
L_1A83: FAC! = N_9F98! + N_6F4A!  ' RT3F_7F
L_1A86: DI = &H9F98
L_1A89: N_9F98! = FAC!: SI = &H001A  ' RT3F_7D
L_1A8C: SI = DI
L_1A8E: DI = &H71CC
L_1A91: CompareLeft! = N_9F98!: CompareRight! = N_71CC!  ' RT3F_9F
L_1A94: IF CompareLeft! <= CompareRight! THEN GOTO L_1A1E  ' flags from L_1A91
L_1A96: RETURN
L_1A97: SI = &H9F88
L_1A9A: CompareLeft! = N_9F88!: CompareRight! = 0  ' RT3F_A7
L_1A9D: IF CompareLeft! < CompareRight! THEN GOTO L_1AA2  ' flags from L_1A9A
L_1A9F: GOTO L_1AAF
L_1AA2: DI = &H9FA8
L_1AA5: FAC! = N(SI) + N_9FA8!  ' RT3F_7F
L_1AA8: DI = SI
L_1AAA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1AAD: GOTO L_1A97
L_1AAF: SI = &H9F8C
L_1AB2: CompareLeft! = N_9F8C!: CompareRight! = 0  ' RT3F_A7
L_1AB5: IF CompareLeft! < CompareRight! THEN GOTO L_1ABA  ' flags from L_1AB2
L_1AB7: GOTO L_1AC7
L_1ABA: DI = &H9FA8
L_1ABD: FAC! = N(SI) + N_9FA8!  ' RT3F_7F
L_1AC0: DI = SI
L_1AC2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1AC5: GOTO L_1A97
L_1AC7: DI = &H9F84
L_1ACA: SI = &H9FB0
L_1ACD: FAC! = N_9FB0! - N_9F84!  ' RT3F_97
L_1AD0: DI = &H9FAC
L_1AD3: N_9FAC! = FAC!: SI = &H001A  ' RT3F_7D
L_1AD6: SI = &H9FB4
L_1AD9: FAC! = N_9FB4!: DI = &H001E  ' RT3F_6F
L_1ADC: GOTO L_1B54
L_1ADF: ' Alignment NOP
L_1AE0: DI = &H9F84
L_1AE3: SI = &H9EAA
L_1AE6: FAC! = N_9EAA! - N_9F84!  ' RT3F_97
L_1AE9: DI = &H9FB8
L_1AEC: N_9FB8! = FAC!: SI = &H001A  ' RT3F_7D
L_1AEF: SI = &H9FBC
L_1AF2: FAC! = N_9FBC!: DI = &H001E  ' RT3F_6F
L_1AF5: GOTO L_1B3B
L_1AF8: BX = &H710E
L_1AFB: DX = &H8BDC
L_1AFE: CX = 0xFFFF
L_1B01: AX = CX
L_1B03: GfxX! = COORD(BX,CX): GfxY! = COORD(DX,AX): CircleFlags% = 0  ' RT3E_8D
L_1B06: BX = &H9F88
L_1B09: CircleStart! = N_9F88!  ' RT3E_2F
L_1B0C: BX = &H9F8C
L_1B0F: CircleEnd! = N_9F8C!  ' RT3E_30
L_1B12: BX = &H6F4A
L_1B15: CircleAspect! = N_6F4A!  ' RT3E_31
L_1B18: DI = &H9F90
L_1B1B: SI = &H9F84
L_1B1E: FAC! = N_9F84! + N_9F90!  ' RT3F_7F
L_1B21: DI = &H70AA
L_1B24: FAC! = FAC! + N_70AA!  ' RT3F_81
L_1B27: BX = CINT(FAC!)  ' RT3F_1B
L_1B2A: DX = BX
L_1B2C: BX = &H9FC0
L_1B2F: CIRCLE (GfxX!,GfxY!), N_9FC0!, DX, CircleStart!, CircleEnd!, CircleAspect!  ' RT3E_8C
L_1B32: DI = &H6F4A
L_1B35: SI = &H8BDC
L_1B38: FAC! = N_8BDC! + N_6F4A!  ' RT3F_7F
L_1B3B: DI = &H8BDC
L_1B3E: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_1B41: SI = DI
L_1B43: DI = &H9FB8
L_1B46: CompareLeft! = N_8BDC!: CompareRight! = N_9FB8!  ' RT3F_9F
L_1B49: IF CompareLeft! <= CompareRight! THEN GOTO L_1AF8  ' flags from L_1B46
L_1B4B: DI = &H6F4A
L_1B4E: SI = &H710E
L_1B51: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_1B54: DI = &H710E
L_1B57: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_1B5A: SI = DI
L_1B5C: DI = &H9FAC
L_1B5F: CompareLeft! = N_710E!: CompareRight! = N_9FAC!  ' RT3F_9F
L_1B62: IF CompareLeft! > CompareRight! THEN GOTO L_1B67  ' flags from L_1B5F
L_1B64: GOTO L_1AE0
L_1B67: RETURN
L_1B68: SI = &H6F86
L_1B6B: BX = CINT(N_6F86!)  ' RT3F_75
L_1B6E: ON BX GOSUB L_1B81, L_1B99, L_1BB1, L_1BC9, L_1BE1, L_1BF9, L_1C11  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_1B80: RETURN
L_1B81: BX = &H710E
L_1B84: DX = &H8BDC
L_1B87: CX = 0xFFFF
L_1B8A: AX = CX
L_1B8C: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1B8F: BX = &H4BCE
L_1B92: DX = 3
L_1B95: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1B98: RETURN
L_1B99: BX = &H710E
L_1B9C: DX = &H8BDC
L_1B9F: CX = 0xFFFF
L_1BA2: AX = CX
L_1BA4: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1BA7: BX = &H4BD8
L_1BAA: DX = 3
L_1BAD: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1BB0: RETURN
L_1BB1: BX = &H710E
L_1BB4: DX = &H8BDC
L_1BB7: CX = 0xFFFF
L_1BBA: AX = CX
L_1BBC: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1BBF: BX = &H4BE2
L_1BC2: DX = 3
L_1BC5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1BC8: RETURN
L_1BC9: BX = &H710E
L_1BCC: DX = &H8BDC
L_1BCF: CX = 0xFFFF
L_1BD2: AX = CX
L_1BD4: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1BD7: BX = &H4BEC
L_1BDA: DX = 3
L_1BDD: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1BE0: RETURN
L_1BE1: BX = &H710E
L_1BE4: DX = &H8BDC
L_1BE7: CX = 0xFFFF
L_1BEA: AX = CX
L_1BEC: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1BEF: BX = &H4BF6
L_1BF2: DX = 3
L_1BF5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1BF8: RETURN
L_1BF9: BX = &H710E
L_1BFC: DX = &H8BDC
L_1BFF: CX = 0xFFFF
L_1C02: AX = CX
L_1C04: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1C07: BX = &H4C00
L_1C0A: DX = 3
L_1C0D: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1C10: RETURN
L_1C11: BX = &H710E
L_1C14: DX = &H8BDC
L_1C17: CX = 0xFFFF
L_1C1A: AX = CX
L_1C1C: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1C1F: BX = &H4BCE
L_1C22: DX = 3
L_1C25: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1C28: BX = &H710E
L_1C2B: DX = &H8BDC
L_1C2E: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1C31: BX = &H4BCE
L_1C34: DX = 4
L_1C37: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1C3A: RETURN
L_1C3B: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_1C3E: DX = &H715C
L_1C41: S_715C$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1C44: AX = DX
L_1C46: BX = &H6F46
L_1C49: CompareLeft$ = S(AX): CompareRight$ = S_6F46$  ' RT3F_62; H string compare from 9E1F..9E49
L_1C4C: IF CompareLeft$ = CompareRight$ THEN GOTO L_1C3B  ' flags from L_1C49
L_1C4E: BX = &H715C
L_1C51: DX = BX
L_1C53: BX = LEN(S_715C$)  ' RT3F_BA
L_1C56: CompareLeft% = BX: CompareRight% = 1
L_1C59: IF CompareLeft% > CompareRight% THEN GOTO L_1C5E  ' flags from L_1C56
L_1C5B: GOTO L_1C98
L_1C5E: BX = DX
L_1C60: DX = 1
L_1C63: BX = TEMP_DESC(RIGHT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0C
L_1C66: BX = ASC(S(BX))  ' RT3F_BB
L_1C69: BX = BX + -&H46
L_1C6C: FAC! = CSNG(BX)  ' RT3F_57
L_1C6F: DI = &H9F54
L_1C72: N_9F54! = FAC!: SI = &H001A  ' RT3F_7D
L_1C75: SI = DI
L_1C77: DI = &H6F4A
L_1C7A: CompareLeft! = N_9F54!: CompareRight! = N_6F4A!  ' RT3F_9F
L_1C7D: BX = 0
L_1C80: IF CompareLeft! >= CompareRight! THEN GOTO L_1C83  ' flags from L_1C7A
L_1C82: BX = BX - 1
L_1C83: DI = &H9FC4
L_1C86: CompareLeft! = N(SI): CompareRight! = N_9FC4!  ' RT3F_9F
L_1C89: DX = 0
L_1C8C: IF CompareLeft! <= CompareRight! THEN GOTO L_1C8F  ' flags from L_1C86
L_1C8E: DX = DX - 1
L_1C8F: DX = DX OR BX
L_1C91: CompareLeft% = DX: CompareRight% = 0
L_1C93: IF CompareLeft% <> CompareRight% THEN GOTO L_1C3B  ' flags from L_1C91
L_1C95: GOTO L_1CE7
L_1C98: BX = &H715C
L_1C9B: BX = ASC(S_715C$)  ' RT3F_BB
L_1C9E: BX = BX + -&H35
L_1CA1: FAC! = CSNG(BX)  ' RT3F_57
L_1CA4: DI = &H9F54
L_1CA7: N_9F54! = FAC!: SI = &H001A  ' RT3F_7D
L_1CAA: SI = DI
L_1CAC: DI = &H9FC8
L_1CAF: CompareLeft! = N_9F54!: CompareRight! = N_9FC8!  ' RT3F_9F
L_1CB2: IF CompareLeft! > CompareRight! THEN GOTO L_1CB7  ' flags from L_1CAF
L_1CB4: GOTO L_1CC2
L_1CB7: DI = &H9F5C
L_1CBA: FAC! = N(SI) + N_9F5C!  ' RT3F_7F
L_1CBD: DI = SI
L_1CBF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1CC2: DI = &H9EE6
L_1CC5: SI = &H9F54
L_1CC8: CompareLeft! = N_9F54!: CompareRight! = N_9EE6!  ' RT3F_9F
L_1CCB: BX = 0
L_1CCE: IF CompareLeft! >= CompareRight! THEN GOTO L_1CD1  ' flags from L_1CC8
L_1CD0: BX = BX - 1
L_1CD1: DI = &H9EAA
L_1CD4: CompareLeft! = N(SI): CompareRight! = N_9EAA!  ' RT3F_9F
L_1CD7: DX = 0
L_1CDA: IF CompareLeft! <= CompareRight! THEN GOTO L_1CDD  ' flags from L_1CD4
L_1CDC: DX = DX - 1
L_1CDD: DX = DX OR BX
L_1CDF: CompareLeft% = DX: CompareRight% = 0
L_1CE1: IF CompareLeft% = CompareRight% THEN GOTO L_1CE6  ' flags from L_1CDF
L_1CE3: GOTO L_1C3B
L_1CE6: RETURN
L_1CE7: DI = &H7174
L_1CEA: SI = &H71F4
L_1CED: N_7174! = N_71F4!  ' RT3F_7B
L_1CF0: BX = DI
L_1CF2: DI = &H7178
L_1CF5: SI = &H6F4A
L_1CF8: N_7178! = N_6F4A!  ' RT3F_7B
L_1CFB: GOSUB L_0301
L_1CFE: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_1D01: BX = 0
L_1D04: IF CompareLeft! <= CompareRight! THEN GOTO L_1D07  ' flags from L_1CFE
L_1D06: BX = BX - 1
L_1D07: DI = &H6F4A
L_1D0A: SI = &H1850
L_1D0D: CompareLeft! = N_1850!: CompareRight! = N_6F4A!  ' RT3F_9F
L_1D10: DX = 0
L_1D13: IF CompareLeft! <> CompareRight! THEN GOTO L_1D16  ' flags from L_1D0D
L_1D15: DX = DX - 1
L_1D16: DX = DX AND BX
L_1D18: SI = &H185C
L_1D1B: CompareLeft! = N_185C!: CompareRight! = N(DI)  ' RT3F_9F
L_1D1E: BX = 0
L_1D21: IF CompareLeft! <> CompareRight! THEN GOTO L_1D24  ' flags from L_1D1B
L_1D23: BX = BX - 1
L_1D24: BX = BX AND DX
L_1D26: SI = &H3AB0
L_1D29: CompareLeft! = N_3AB0!: CompareRight! = 0  ' RT3F_A7
L_1D2C: DX = 0
L_1D2F: IF CompareLeft! <= CompareRight! THEN GOTO L_1D32  ' flags from L_1D29
L_1D31: DX = DX - 1
L_1D32: DX = DX AND BX
L_1D34: BX = DI
L_1D36: DI = &H7174
L_1D39: SI = &H9FCC
L_1D3C: N_7174! = N_9FCC!  ' RT3F_7B
L_1D3F: SI = BX
L_1D41: DI = &H7178
L_1D44: N_7178! = N(SI)  ' RT3F_7B
L_1D47: WORD(BP - &H10) = DX
L_1D4A: GOSUB L_0301
L_1D4D: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_1D50: BX = 0
L_1D53: IF CompareLeft! <= CompareRight! THEN GOTO L_1D56  ' flags from L_1D4D
L_1D55: BX = BX - 1
L_1D56: BX = BX AND WORD(BP - &H10)
L_1D59: CompareLeft% = BX: CompareRight% = 0
L_1D5B: IF CompareLeft% <> CompareRight% THEN GOTO L_1D60  ' flags from L_1D59
L_1D5D: GOTO L_1D61
L_1D60: RETURN
L_1D61: GOSUB L_1D8C
L_1D64: BX = &H16
L_1D67: ARGPUSH BX  ' RT3E_42
L_1D6A: BX = 3
L_1D6D: LOCATE ARGS(), BX  ' RT3E_44
L_1D70: ' PRINT statement begins ; RT3F_BC
L_1D73: BX = &H9FD0
L_1D76: PRINT S_9FD0$  ' RT3F_6E; H newline item, ledger correction
L_1D79: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1D7C: GOSUB L_1693
L_1D7F: GOSUB L_1693
L_1D82: DI = &H9F54
L_1D85: SI = &H71D0
L_1D88: N_9F54! = N_71D0!  ' RT3F_7B
L_1D8B: RETURN
L_1D8C: BX = &H10
L_1D8F: DX = &H98
L_1D92: CX = 0
L_1D94: AX = CX
L_1D96: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1D99: BX = &H12F
L_1D9C: DX = 0xBF
L_1D9F: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1DA2: BX = 0
L_1DA4: DX = 1
L_1DA7: CX = 0xFFFF
L_1DAA: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1DAD: RETURN
L_1DAE: BX = &H10
L_1DB1: DX = 0xA0
L_1DB4: CX = 0
L_1DB6: AX = CX
L_1DB8: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1DBB: BX = &H12F
L_1DBE: DX = 0xBF
L_1DC1: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1DC4: BX = 0
L_1DC6: DX = 1
L_1DC9: CX = 0xFFFF
L_1DCC: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1DCF: RETURN
L_1DD0: BX = &H10
L_1DD3: DX = 8
L_1DD6: CX = 0
L_1DD8: AX = CX
L_1DDA: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1DDD: BX = &H8F
L_1DE0: DX = &H90
L_1DE3: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1DE6: BX = 0
L_1DE8: DX = 1
L_1DEB: CX = 0xFFFF
L_1DEE: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1DF1: RETURN
L_1DF2: BX = &H10
L_1DF5: DX = BX
L_1DF7: CX = 0
L_1DF9: AX = CX
L_1DFB: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1DFE: BX = &H8F
L_1E01: DX = &H90
L_1E04: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1E07: BX = 0
L_1E09: DX = 1
L_1E0C: CX = 0xFFFF
L_1E0F: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1E12: RETURN
L_1E13: DI = &H9FEC
L_1E16: SI = &H71CC
L_1E19: N_9FEC! = N_71CC!  ' RT3F_7B
L_1E1C: BX = 0
L_1E1E: BX = POS(BX)  ' RT3D_21
L_1E21: FAC! = CSNG(BX)  ' RT3F_57
L_1E24: DI = &H9FF0
L_1E27: N_9FF0! = FAC!: SI = &H001A  ' RT3F_7D
L_1E2A: BX = CSRLIN  ' RT3D_25
L_1E2D: FAC! = CSNG(BX)  ' RT3F_57
L_1E30: DI = &H9FF4
L_1E33: N_9FF4! = FAC!: SI = &H001A  ' RT3F_7D
L_1E36: BX = &H6F46
L_1E39: DX = &H715C
L_1E3C: S_715C$ = S_6F46$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1E3F: SI = &H9FF4
L_1E42: BX = CINT(N_9FF4!)  ' RT3F_75
L_1E45: ARGPUSH BX  ' RT3E_42
L_1E48: SI = &H9FF0
L_1E4B: BX = CINT(N_9FF0!)  ' RT3F_75
L_1E4E: ARGPUSH BX  ' RT3E_42
L_1E51: BX = 1
L_1E54: ARGPUSH BX  ' RT3E_42
L_1E57: BX = 0
L_1E59: ARGPUSH BX  ' RT3E_42
L_1E5C: BX = 7
L_1E5F: LOCATE ARGS(), BX  ' RT3E_44
L_1E62: ' PRINT statement begins ; RT3F_BC
L_1E65: BX = &H715C
L_1E68: PRINT S_715C$;  ' RT3F_6A
L_1E6B: BX = &H9FF8
L_1E6E: PRINT S_9FF8$;  ' RT3F_6A
L_1E71: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1E74: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_1E77: DX = &H9FFE
L_1E7A: S_9FFE$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1E7D: AX = DX
L_1E7F: BX = &H6F46
L_1E82: CompareLeft$ = S(AX): CompareRight$ = S_6F46$  ' RT3F_62; H string compare from 9E1F..9E49
L_1E85: IF CompareLeft$ = CompareRight$ THEN GOTO L_1E74  ' flags from L_1E82
L_1E87: BX = &H9FFE
L_1E8A: BX = ASC(S_9FFE$)  ' RT3F_BB
L_1E8D: FAC! = CSNG(BX)  ' RT3F_57
L_1E90: DI = &H710E
L_1E93: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_1E96: SI = DI
L_1E98: DI = &H9F04
L_1E9B: CompareLeft! = N_710E!: CompareRight! = N_9F04!  ' RT3F_9F
L_1E9E: IF CompareLeft! <> CompareRight! THEN GOTO L_1EA3  ' flags from L_1E9B
L_1EA0: GOTO L_1F62
L_1EA3: DI = &H7116
L_1EA6: SI = &H710E
L_1EA9: CompareLeft! = N_710E!: CompareRight! = N_7116!  ' RT3F_9F
L_1EAC: BX = 0
L_1EAF: IF CompareLeft! <> CompareRight! THEN GOTO L_1EB2  ' flags from L_1EA9
L_1EB1: BX = BX - 1
L_1EB2: DX = BX
L_1EB4: BX = &H715C
L_1EB7: CX = BX
L_1EB9: BX = LEN(S_715C$)  ' RT3F_BA
L_1EBC: BX = BX OR BX
L_1EBE: AX = 0
L_1EC1: IF (ZF OR SF <> OF) THEN GOTO L_1EC4  ' flags from L_1EBC
L_1EC3: AX = AX - 1
L_1EC4: AX = AX AND DX
L_1EC6: CompareLeft% = AX: CompareRight% = 0
L_1EC8: IF CompareLeft% <> CompareRight% THEN GOTO L_1ECD  ' flags from L_1EC6
L_1ECA: GOTO L_1EE4
L_1ECD: BX = CX
L_1ECF: BX = LEN(S(BX))  ' RT3F_BA
L_1ED2: BX = BX - 1
L_1ED3: SWAP CX, BX
L_1ED5: DX = CX
L_1ED7: AX = BX
L_1ED9: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_1EDC: DX = AX
L_1EDE: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1EE1: GOTO L_1E3F
L_1EE4: DI = &H71CC
L_1EE7: SI = &H9FEC
L_1EEA: CompareLeft! = N_9FEC!: CompareRight! = N_71CC!  ' RT3F_9F
L_1EED: BX = 0
L_1EF0: IF CompareLeft! <> CompareRight! THEN GOTO L_1EF3  ' flags from L_1EEA
L_1EF2: BX = BX - 1
L_1EF3: DI = &H9F18
L_1EF6: SI = &H710E
L_1EF9: CompareLeft! = N_710E!: CompareRight! = N_9F18!  ' RT3F_9F
L_1EFC: DX = 0
L_1EFF: IF CompareLeft! >= CompareRight! THEN GOTO L_1F02  ' flags from L_1EF9
L_1F01: DX = DX - 1
L_1F02: DI = 0xA002
L_1F05: CompareLeft! = N(SI): CompareRight! = N_A002!  ' RT3F_9F
L_1F08: CX = 0
L_1F0B: IF CompareLeft! <= CompareRight! THEN GOTO L_1F0E  ' flags from L_1F05
L_1F0D: CX = CX - 1
L_1F0E: CX = CX OR DX
L_1F10: CX = CX AND BX
L_1F12: CompareLeft% = CX: CompareRight% = 0
L_1F14: IF CompareLeft% = CompareRight% THEN GOTO L_1F19  ' flags from L_1F12
L_1F16: GOTO L_1E3F
L_1F19: DI = 0xA006
L_1F1C: SI = &H710E
L_1F1F: CompareLeft! = N_710E!: CompareRight! = N_A006!  ' RT3F_9F
L_1F22: BX = 0
L_1F25: IF CompareLeft! >= CompareRight! THEN GOTO L_1F28  ' flags from L_1F1F
L_1F27: BX = BX - 1
L_1F28: DI = 0xA00A
L_1F2B: CompareLeft! = N(SI): CompareRight! = N_A00A!  ' RT3F_9F
L_1F2E: DX = 0
L_1F31: IF CompareLeft! <= CompareRight! THEN GOTO L_1F34  ' flags from L_1F2B
L_1F33: DX = DX - 1
L_1F34: DX = DX OR BX
L_1F36: CompareLeft% = DX: CompareRight% = 0
L_1F38: IF CompareLeft% = CompareRight% THEN GOTO L_1F3D  ' flags from L_1F36
L_1F3A: GOTO L_1E74
L_1F3D: BX = &H715C
L_1F40: BX = LEN(S_715C$)  ' RT3F_BA
L_1F43: FAC! = CSNG(BX)  ' RT3F_57
L_1F46: DI = &H9FEC
L_1F49: CompareLeft! = FAC!: CompareRight! = N_9FEC!  ' RT3F_A1
L_1F4C: IF CompareLeft! < CompareRight! THEN GOTO L_1F51  ' flags from L_1F49
L_1F4E: GOTO L_1E74
L_1F51: BX = &H9FFE
L_1F54: AX = &H715C
L_1F57: BX = TEMP_DESC(S_715C$ + S_9FFE$)  ' BX receives a temporary descriptor  ' RT3F_55
L_1F5A: DX = AX
L_1F5C: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1F5F: GOTO L_1E3F
L_1F62: BX = &H715C
L_1F65: DAC# = VAL(S_715C$)  ' RT3D_13
L_1F68: BX = CINT(DAC#)  ' RT3F_78
L_1F6B: AX = BX
L_1F6D: WORD(0xA00E) = AX
L_1F70: RETURN
L_1F71: DI = 0xA010
L_1F74: SI = 0xA014
L_1F77: N_A010! = N_A014!  ' RT3F_7B
L_1F7A: SI = 0xA018
L_1F7D: FAC! = N_A018!: DI = &H001E  ' RT3F_6F
L_1F80: GOTO L_1FC5
L_1F83: ' Alignment NOP
L_1F84: SI = &H710E
L_1F87: BX = SI
L_1F89: DX = BX
L_1F8B: BX = CINT(N_710E!)  ' RT3F_75
L_1F8E: SI = BX
L_1F90: SI = SI * (2 ^ 1)
L_1F92: SI = SI * (2 ^ 1)
L_1F94: SI = SI + &H1850
L_1F98: DI = 0xA01C
L_1F9B: CompareLeft! = N(SI): CompareRight! = N_A01C!  ' RT3F_9F
L_1F9E: IF CompareLeft! = CompareRight! THEN GOTO L_1FA3  ' flags from L_1F9B
L_1FA0: GOTO L_1FBC
L_1FA3: SI = DX
L_1FA5: DI = &H71C0
L_1FA8: N_71C0! = N(SI)  ' RT3F_7B
L_1FAB: DI = 0xA010
L_1FAE: SI = &H6F4A
L_1FB1: N_A010! = N_6F4A!  ' RT3F_7B
L_1FB4: DI = DX
L_1FB6: SI = 0xA020
L_1FB9: N(DI) = N_A020!  ' RT3F_7B
L_1FBC: DI = &H710A
L_1FBF: SI = &H710E
L_1FC2: FAC! = N_710E! + N_710A!  ' RT3F_7F
L_1FC5: DI = &H710E
L_1FC8: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_1FCB: SI = DI
L_1FCD: DI = 0xA024
L_1FD0: CompareLeft! = N_710E!: CompareRight! = N_A024!  ' RT3F_9F
L_1FD3: IF CompareLeft! <= CompareRight! THEN GOTO L_1F84  ' flags from L_1FD0
L_1FD5: RETURN
L_1FD6: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_1FD9: DX = &H715C
L_1FDC: S_715C$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1FDF: AX = DX
L_1FE1: BX = 0xA028
L_1FE4: CompareLeft$ = S(AX): CompareRight$ = S_A028$  ' RT3F_62; H string compare from 9E1F..9E49
L_1FE7: CX = 0
L_1FEA: IF CompareLeft$ <> CompareRight$ THEN GOTO L_1FED  ' flags from L_1FE4
L_1FEC: CX = CX - 1
L_1FED: BX = 0xA02E
L_1FF0: CompareLeft$ = S(AX): CompareRight$ = S_A02E$  ' RT3F_62; H string compare from 9E1F..9E49
L_1FF3: DX = 0
L_1FF6: IF CompareLeft$ <> CompareRight$ THEN GOTO L_1FF9  ' flags from L_1FF0
L_1FF8: DX = DX - 1
L_1FF9: DX = DX OR CX
L_1FFB: CompareLeft% = DX: CompareRight% = 0
L_1FFD: IF CompareLeft% <> CompareRight% THEN GOTO L_2002  ' flags from L_1FFB
L_1FFF: GOTO L_200C

```

### Communications input

```basic
L_2002: DI = &H71B4
L_2005: SI = &H6F4A
L_2008: N_71B4! = N_6F4A!  ' RT3F_7B
L_200B: RETURN
L_200C: BX = 0xA034
L_200F: AX = &H715C
L_2012: CompareLeft$ = S_715C$: CompareRight$ = S_A034$  ' RT3F_62; H string compare from 9E1F..9E49
L_2015: DX = 0
L_2018: IF CompareLeft$ <> CompareRight$ THEN GOTO L_201B  ' flags from L_2012
L_201A: DX = DX - 1
L_201B: BX = 0xA03A
L_201E: CompareLeft$ = S(AX): CompareRight$ = S_A03A$  ' RT3F_62; H string compare from 9E1F..9E49
L_2021: CX = 0
L_2024: IF CompareLeft$ <> CompareRight$ THEN GOTO L_2027  ' flags from L_201E
L_2026: CX = CX - 1
L_2027: CX = CX OR DX
L_2029: CompareLeft% = CX: CompareRight% = 0
L_202B: IF CompareLeft% <> CompareRight% THEN GOTO L_2030  ' flags from L_2029
L_202D: GOTO L_203A
L_2030: DI = &H71B4
L_2033: SI = &H6F82
L_2036: N_71B4! = N_6F82!  ' RT3F_7B
L_2039: RETURN
L_203A: GOTO L_1FD6
L_203C: DI = &H9FEC
L_203F: SI = &H710A
L_2042: N_9FEC! = N_710A!  ' RT3F_7B
L_2045: ' PRINT statement begins ; RT3F_BC
L_2048: BX = 0xA040
L_204B: PRINT S_A040$;  ' RT3F_6A
L_204E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2051: GOSUB L_1E1C
L_2054: DI = &H71B4
L_2057: SI = 0xA014
L_205A: N_71B4! = N_A014!  ' RT3F_7B
L_205D: BX = 0xA04E
L_2060: AX = &H715C
L_2063: CompareLeft$ = S_715C$: CompareRight$ = S_A04E$  ' RT3F_62; H string compare from 9E1F..9E49
L_2066: DX = 0
L_2069: IF CompareLeft$ <> CompareRight$ THEN GOTO L_206C  ' flags from L_2063
L_206B: DX = DX - 1
L_206C: BX = 0xA056
L_206F: CompareLeft$ = S(AX): CompareRight$ = S_A056$  ' RT3F_62; H string compare from 9E1F..9E49
L_2072: CX = 0
L_2075: IF CompareLeft$ <> CompareRight$ THEN GOTO L_2078  ' flags from L_206F
L_2077: CX = CX - 1
L_2078: CX = CX OR DX
L_207A: CompareLeft% = CX: CompareRight% = 0
L_207C: IF CompareLeft% <> CompareRight% THEN GOTO L_2081  ' flags from L_207A
L_207E: GOTO L_2087
L_2081: SI = &H6F4A
L_2084: N(DI) = N_6F4A!  ' RT3F_7B
L_2087: RETURN
L_2088: GOSUB L_1831
L_208B: GOSUB L_2925
L_208E: SI = 0xA05E
L_2091: CompareLeft! = N_A05E!: CompareRight! = 0  ' RT3F_A7
L_2094: IF CompareLeft! <> CompareRight! THEN GOTO L_2099  ' flags from L_2091
L_2096: GOTO L_2C10
L_2099: DI = &H6F4A
L_209C: SI = &H9E9A
L_209F: FAC! = N_9E9A! + N_6F4A!  ' RT3F_7F
L_20A2: BX = CINT(FAC!)  ' RT3F_77
L_20A5: ON BX GOTO L_2922, L_21A6, L_20AF  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_20AF: GOSUB L_1D8C
L_20B2: BX = &H16
L_20B5: ARGPUSH BX  ' RT3E_42
L_20B8: BX = 3
L_20BB: LOCATE ARGS(), BX  ' RT3E_44
L_20BE: ' PRINT statement begins ; RT3F_BC
L_20C1: BX = 0xA062
L_20C4: PRINT S_A062$;  ' RT3F_6A
L_20C7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_20CA: GOSUB L_1FD6
L_20CD: SI = &H71B4
L_20D0: CompareLeft! = N_71B4!: CompareRight! = 0  ' RT3F_A7
L_20D3: IF CompareLeft! <> CompareRight! THEN GOTO L_20D8  ' flags from L_20D0
L_20D5: GOTO L_2922
L_20D8: GOSUB L_1D8C
L_20DB: BX = &H16
L_20DE: ARGPUSH BX  ' RT3E_42
L_20E1: BX = 3
L_20E4: LOCATE ARGS(), BX  ' RT3E_44
L_20E7: DI = &H7174
L_20EA: SI = &H71F4
L_20ED: N_7174! = N_71F4!  ' RT3F_7B
L_20F0: BX = DI
L_20F2: DI = &H7178
L_20F5: SI = &H6F54
L_20F8: N_7178! = N_6F54!  ' RT3F_7B
L_20FB: GOSUB L_0301
L_20FE: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_2101: BX = 0
L_2104: IF CompareLeft! <= CompareRight! THEN GOTO L_2107  ' flags from L_20FE
L_2106: BX = BX - 1
L_2107: FAC! = RND  ' RT3D_34
L_210A: DI = &H717C
L_210D: FAC! = FAC! * N_717C!  ' RT3F_91
L_2110: DI = &H7174
L_2113: SI = &H71F8
L_2116: N_7174! = N_71F8!  ' RT3F_7B
L_2119: DI = &H7178
L_211C: SI = &H6F54
L_211F: N_7178! = N_6F54!  ' RT3F_7B
L_2122: T_12! = FAC!  ' RT3F_71; inline=&H92
L_2126: WORD(BP - &H10) = BX
L_2129: GOSUB L_0301
L_212C: DI = &H71D4
L_212F: FAC! = FAC! * N_71D4!  ' RT3F_91
L_2132: DI = &H71F0
L_2135: FAC! = FAC! + N_71F0!  ' RT3F_81
L_2138: CompareLeft! = T_12!: CompareRight! = FAC!  ' RT3F_A5; inline=&H92
L_213C: BX = 0
L_213F: IF CompareLeft! >= CompareRight! THEN GOTO L_2142  ' flags from L_2138
L_2141: BX = BX - 1
L_2142: BX = BX AND WORD(BP - &H10)
L_2145: DI = &H6F4A
L_2148: SI = &H8B74
L_214B: CompareLeft! = N_8B74!: CompareRight! = N_6F4A!  ' RT3F_9F
L_214E: DX = 0
L_2151: IF CompareLeft! <> CompareRight! THEN GOTO L_2154  ' flags from L_214B
L_2153: DX = DX - 1
L_2154: DX = DX OR BX
L_2156: SI = &H1860
L_2159: CompareLeft! = N_1860!: CompareRight! = N(DI)  ' RT3F_9F
L_215C: BX = 0
L_215F: IF CompareLeft! <> CompareRight! THEN GOTO L_2162  ' flags from L_2159
L_2161: BX = BX - 1
L_2162: BX = BX AND DX
L_2164: CompareLeft% = BX: CompareRight% = 0
L_2166: IF CompareLeft% <> CompareRight% THEN GOTO L_216B  ' flags from L_2164
L_2168: GOTO L_2185
L_216B: ' PRINT statement begins ; RT3F_BC
L_216E: BX = 0xA086
L_2171: PRINT S_A086$  ' RT3F_6E; H newline item, ledger correction
L_2174: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2177: SI = DI
L_2179: DI = &H9E9A
L_217C: N_9E9A! = N(SI)  ' RT3F_7B
L_217F: GOSUB L_1693
L_2182: GOTO L_21A6
L_2185: DI = &H9E9A
L_2188: SI = &H6F82
L_218B: N_9E9A! = N_6F82!  ' RT3F_7B
L_218E: ' PRINT statement begins ; RT3F_BC
L_2191: BX = &H4290
L_2194: PRINT S_4290$;  ' RT3F_6A
L_2197: BX = 0xA0A4
L_219A: PRINT S_A0A4$  ' RT3F_6E; H newline item, ledger correction
L_219D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79

```

### Communications menus and resolution

```basic
L_21A0: GOSUB L_1693
L_21A3: GOTO L_2922
L_21A6: GOSUB L_1D8C
L_21A9: BX = &H14
L_21AC: ARGPUSH BX  ' RT3E_42
L_21AF: BX = 8
L_21B2: LOCATE ARGS(), BX  ' RT3E_44
L_21B5: ' PRINT statement begins ; RT3F_BC
L_21B8: BX = 0xA0AE
L_21BB: PRINT S_A0AE$  ' RT3F_6E; H newline item, ledger correction
L_21BE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_21C1: BX = &H15
L_21C4: ARGPUSH BX  ' RT3E_42
L_21C7: DX = BX
L_21C9: BX = 3
L_21CC: LOCATE ARGS(), BX  ' RT3E_44
L_21CF: ' PRINT statement begins ; RT3F_BC
L_21D2: CX = BX
L_21D4: BX = 0xA0C6
L_21D7: PRINT S_A0C6$  ' RT3F_6E; H newline item, ledger correction
L_21DA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_21DD: BX = &H16
L_21E0: ARGPUSH BX  ' RT3E_42
L_21E3: SWAP CX, BX
L_21E5: LOCATE ARGS(), BX  ' RT3E_44
L_21E8: ' PRINT statement begins ; RT3F_BC
L_21EB: AX = BX
L_21ED: BX = 0xA0D2
L_21F0: PRINT S_A0D2$  ' RT3F_6E; H newline item, ledger correction
L_21F3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_21F6: BX = &H17
L_21F9: ARGPUSH BX  ' RT3E_42
L_21FC: SWAP BX, AX
L_21FD: LOCATE ARGS(), BX  ' RT3E_44
L_2200: ' PRINT statement begins ; RT3F_BC
L_2203: BX = 0xA0DC
L_2206: PRINT S_A0DC$  ' RT3F_6E; H newline item, ledger correction
L_2209: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_220C: BX = DX
L_220E: ARGPUSH BX  ' RT3E_42
L_2211: BX = 0xF
L_2214: LOCATE ARGS(), BX  ' RT3E_44
L_2217: ' PRINT statement begins ; RT3F_BC
L_221A: DX = BX
L_221C: BX = 0xA0E8
L_221F: PRINT S_A0E8$  ' RT3F_6E; H newline item, ledger correction
L_2222: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2225: BX = CX
L_2227: ARGPUSH BX  ' RT3E_42
L_222A: BX = DX
L_222C: LOCATE ARGS(), BX  ' RT3E_44
L_222F: ' PRINT statement begins ; RT3F_BC
L_2232: BX = 0xA0FC
L_2235: PRINT S_A0FC$  ' RT3F_6E; H newline item, ledger correction
L_2238: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_223B: BX = AX
L_223D: ARGPUSH BX  ' RT3E_42
L_2240: BX = DX
L_2242: LOCATE ARGS(), BX  ' RT3E_44
L_2245: ' PRINT statement begins ; RT3F_BC
L_2248: BX = 0xA114
L_224B: PRINT S_A114$  ' RT3F_6E; H newline item, ledger correction
L_224E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2251: BX = &H18
L_2254: ARGPUSH BX  ' RT3E_42
L_2257: BX = 3
L_225A: LOCATE ARGS(), BX  ' RT3E_44
L_225D: ' PRINT statement begins ; RT3F_BC
L_2260: BX = 0xA11E
L_2263: PRINT S_A11E$;  ' RT3F_6A
L_2266: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2269: DI = &H9F60
L_226C: SI = &H6F4A
L_226F: N_9F60! = N_6F4A!  ' RT3F_7B
L_2272: DI = &H9F64
L_2275: SI = &H71D8
L_2278: N_9F64! = N_71D8!  ' RT3F_7B
L_227B: GOSUB L_1857
L_227E: SI = &H9F54
L_2281: CompareLeft! = N_9F54!: CompareRight! = 0  ' RT3F_A7
L_2284: IF CompareLeft! < CompareRight! THEN GOTO L_227B  ' flags from L_2281
L_2286: DI = &H70AA
L_2289: SI = &H9F54
L_228C: FAC! = N_9F54! + N_70AA!  ' RT3F_7F
L_228F: DI = 0xA13C
L_2292: N_A13C! = FAC!: SI = &H001A  ' RT3F_7D
L_2295: SI = DI
L_2297: DI = &H71D4
L_229A: CompareLeft! = N_A13C!: CompareRight! = N_71D4!  ' RT3F_9F
L_229D: IF CompareLeft! <> CompareRight! THEN GOTO L_22A2  ' flags from L_229A
L_229F: GOTO L_2922
L_22A2: DI = &H710A
L_22A5: SI = 0xA13C
L_22A8: CompareLeft! = N_A13C!: CompareRight! = N_710A!  ' RT3F_9F
L_22AB: IF CompareLeft! = CompareRight! THEN GOTO L_22B0  ' flags from L_22A8
L_22AD: GOTO L_22BC
L_22B0: DI = 0xA140
L_22B3: SI = &H6F4A
L_22B6: N_A140! = N_6F4A!  ' RT3F_7B
L_22B9: GOTO L_2366
L_22BC: GOSUB L_1DAE
L_22BF: BX = &H15
L_22C2: ARGPUSH BX  ' RT3E_42
L_22C5: DX = BX
L_22C7: BX = 3
L_22CA: LOCATE ARGS(), BX  ' RT3E_44
L_22CD: ' PRINT statement begins ; RT3F_BC
L_22D0: CX = BX
L_22D2: BX = 0xA144
L_22D5: PRINT S_A144$  ' RT3F_6E; H newline item, ledger correction
L_22D8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_22DB: BX = &H16
L_22DE: ARGPUSH BX  ' RT3E_42
L_22E1: SWAP CX, BX
L_22E3: LOCATE ARGS(), BX  ' RT3E_44
L_22E6: ' PRINT statement begins ; RT3F_BC
L_22E9: AX = BX
L_22EB: BX = 0xA14E
L_22EE: PRINT S_A14E$  ' RT3F_6E; H newline item, ledger correction
L_22F1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_22F4: BX = DX
L_22F6: ARGPUSH BX  ' RT3E_42
L_22F9: BX = 0xF
L_22FC: LOCATE ARGS(), BX  ' RT3E_44
L_22FF: ' PRINT statement begins ; RT3F_BC
L_2302: DX = BX
L_2304: BX = 0xA15A
L_2307: PRINT S_A15A$  ' RT3F_6E; H newline item, ledger correction
L_230A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_230D: BX = CX
L_230F: ARGPUSH BX  ' RT3E_42
L_2312: BX = DX
L_2314: LOCATE ARGS(), BX  ' RT3E_44
L_2317: ' PRINT statement begins ; RT3F_BC
L_231A: BX = 0xA168
L_231D: PRINT S_A168$  ' RT3F_6E; H newline item, ledger correction
L_2320: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2323: BX = &H18
L_2326: ARGPUSH BX  ' RT3E_42
L_2329: BX = AX
L_232B: LOCATE ARGS(), BX  ' RT3E_44
L_232E: ' PRINT statement begins ; RT3F_BC
L_2331: BX = 0xA178
L_2334: PRINT S_A178$;  ' RT3F_6A
L_2337: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_233A: DI = &H9F60
L_233D: SI = &H6F4A
L_2340: N_9F60! = N_6F4A!  ' RT3F_7B
L_2343: DI = &H9F64
L_2346: SI = &H71CC
L_2349: N_9F64! = N_71CC!  ' RT3F_7B
L_234C: GOSUB L_1857
L_234F: SI = &H9F54
L_2352: CompareLeft! = N_9F54!: CompareRight! = 0  ' RT3F_A7
L_2355: IF CompareLeft! < CompareRight! THEN GOTO L_233A  ' flags from L_2352
L_2357: DI = &H70AA
L_235A: SI = &H9F54
L_235D: FAC! = N_9F54! + N_70AA!  ' RT3F_7F
L_2360: DI = 0xA140
L_2363: N_A140! = FAC!: SI = &H001A  ' RT3F_7D
L_2366: DI = 0xA196
L_2369: SI = &H71F0
L_236C: N_A196! = N_71F0!  ' RT3F_7B
L_236F: BX = DI
L_2371: DI = &H71CC
L_2374: SI = 0xA13C
L_2377: CompareLeft! = N_A13C!: CompareRight! = N_71CC!  ' RT3F_9F
L_237A: IF CompareLeft! = CompareRight! THEN GOTO L_237F  ' flags from L_2377
L_237C: GOTO L_2399
L_237F: SI = &H8B70
L_2382: CompareLeft! = N_8B70!: CompareRight! = N(DI)  ' RT3F_9F
L_2385: AX = 0
L_2388: IF CompareLeft! >= CompareRight! THEN GOTO L_238B  ' flags from L_2382
L_238A: AX = AX - 1
L_238B: DX = 0xFFD8
L_238E: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_2390: SWAP BX, AX
L_2391: FAC! = CSNG(BX)  ' RT3F_57
L_2394: DI = AX
L_2396: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2399: DI = &H8B8C
L_239C: SI = &H9E8E
L_239F: FAC! = N_9E8E! - N_8B8C!  ' RT3F_97
L_23A2: BX = DI
L_23A4: DI = 0xA19A
L_23A7: N_A19A! = FAC!: SI = &H001A  ' RT3F_7D
L_23AA: SI = DI
L_23AC: CompareLeft! = N_A19A!: CompareRight! = 0  ' RT3F_A7
L_23AF: IF CompareLeft! > CompareRight! THEN GOTO L_23B4  ' flags from L_23AC
L_23B1: GOTO L_23C1
L_23B4: SWAP BX, DI
L_23B6: FAC! = N(SI) / N(DI)  ' RT3F_87
L_23B9: DI = BX
L_23BB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_23BE: GOTO L_23CF
L_23C1: DI = &H9E8E
L_23C4: SI = 0xA19A
L_23C7: FAC! = N_A19A! / N_9E8E!  ' RT3F_87
L_23CA: DI = SI
L_23CC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_23CF: DI = &H70AA
L_23D2: SI = 0xA19A
L_23D5: CompareLeft! = N_A19A!: CompareRight! = N_70AA!  ' RT3F_9F
L_23D8: BX = 0
L_23DB: IF CompareLeft! <= CompareRight! THEN GOTO L_23DE  ' flags from L_23D5
L_23DD: BX = BX - 1
L_23DE: DX = 0
L_23E0: DX = DX - BX
L_23E2: DI = 0xA19E
L_23E5: CompareLeft! = N(SI): CompareRight! = N_A19E!  ' RT3F_9F
L_23E8: BX = 0
L_23EB: IF CompareLeft! <= CompareRight! THEN GOTO L_23EE  ' flags from L_23E5
L_23ED: BX = BX - 1
L_23EE: DX = DX - BX
L_23F0: DI = 0xA1A2
L_23F3: CompareLeft! = N(SI): CompareRight! = N_A1A2!  ' RT3F_9F
L_23F6: BX = 0
L_23F9: IF CompareLeft! <= CompareRight! THEN GOTO L_23FC  ' flags from L_23F3
L_23FB: BX = BX - 1
L_23FC: DX = DX - BX
L_23FE: DI = 0xA1A6
L_2401: CompareLeft! = N(SI): CompareRight! = N_A1A6!  ' RT3F_9F
L_2404: BX = 0
L_2407: IF CompareLeft! <= CompareRight! THEN GOTO L_240A  ' flags from L_2401
L_2409: BX = BX - 1
L_240A: DX = DX - BX
L_240C: DI = 0xA1AA
L_240F: CompareLeft! = N(SI): CompareRight! = N_A1AA!  ' RT3F_9F
L_2412: BX = 0
L_2415: IF CompareLeft! <= CompareRight! THEN GOTO L_2418  ' flags from L_240F
L_2417: BX = BX - 1
L_2418: DX = DX - BX
L_241A: DI = 0xA1AE
L_241D: CompareLeft! = N(SI): CompareRight! = N_A1AE!  ' RT3F_9F
L_2420: BX = 0
L_2423: IF CompareLeft! <= CompareRight! THEN GOTO L_2426  ' flags from L_241D
L_2425: BX = BX - 1
L_2426: DX = DX - BX
L_2428: DI = &H719C
L_242B: CompareLeft! = N(SI): CompareRight! = N_719C!  ' RT3F_9F
L_242E: BX = 0
L_2431: IF CompareLeft! <= CompareRight! THEN GOTO L_2434  ' flags from L_242B
L_2433: BX = BX - 1
L_2434: DX = DX - BX
L_2436: DI = &H6F4A
L_2439: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_243C: BX = 0
L_243F: IF CompareLeft! <= CompareRight! THEN GOTO L_2442  ' flags from L_2439
L_2441: BX = BX - 1
L_2442: DX = DX - BX
L_2444: BX = DX
L_2446: FAC! = CSNG(BX)  ' RT3F_57
L_2449: DI = SI
L_244B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_244E: DI = &H6F4A
L_2451: SI = &H9E9E
L_2454: CompareLeft! = N_9E9E!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2457: BX = 0
L_245A: IF CompareLeft! <> CompareRight! THEN GOTO L_245D  ' flags from L_2454
L_245C: BX = BX - 1
L_245D: SI = &H8B74
L_2460: CompareLeft! = N_8B74!: CompareRight! = N(DI)  ' RT3F_9F
L_2463: DX = 0
L_2466: IF CompareLeft! <> CompareRight! THEN GOTO L_2469  ' flags from L_2460
L_2468: DX = DX - 1
L_2469: DX = DX AND BX
L_246B: CompareLeft% = DX: CompareRight% = 0
L_246D: IF CompareLeft% <> CompareRight% THEN GOTO L_2472  ' flags from L_246B
L_246F: GOTO L_247A
L_2472: DI = SI
L_2474: SI = &H710A
L_2477: N(DI) = N_710A!  ' RT3F_7B
L_247A: DI = &H70AA
L_247D: SI = &H8B74
L_2480: FAC! = N_8B74! + N_70AA!  ' RT3F_7F
L_2483: BX = CINT(FAC!)  ' RT3F_77
L_2486: AX = BX
L_2488: SI = 5
L_248B: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_248D: DI = AX
L_248F: BX = SI
L_2491: SI = 0xA13C
L_2494: DX = BX
L_2496: BX = CINT(N_A13C!)  ' RT3F_75
L_2499: CX = BX
L_249B: BX = BX + AX
L_249D: SI = BX
L_249F: SI = SI * (2 ^ 1)
L_24A1: SI = SI * (2 ^ 1)
L_24A3: SI = SI + &H9D4E
L_24A7: BX = SI
L_24A9: SI = 0xA19A
L_24AC: AX = BX
L_24AE: BX = CINT(N_A19A!)  ' RT3F_75
L_24B1: SWAP DX, AX
L_24B2: WORD(BP - &H10) = DX
L_24B5: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_24B7: AX = AX + CX
L_24B9: DI = AX
L_24BB: DI = DI * (2 ^ 1)
L_24BD: DI = DI * (2 ^ 1)
L_24BF: DI = DI + &H9D8A
L_24C3: SI = WORD(BP - &H10)
L_24C6: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_24C9: DI = 0xA196
L_24CC: FAC! = FAC! * N_A196!  ' RT3F_91
L_24CF: SI = 0xA140
L_24D2: T_12! = FAC!  ' RT3F_71; inline=&H92
L_24D6: BX = CINT(N(SI))  ' RT3F_75
L_24D9: AX = BX
L_24DB: DX = 5
L_24DE: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_24E0: AX = AX + CX
L_24E2: SI = AX
L_24E4: SI = SI * (2 ^ 1)
L_24E6: SI = SI * (2 ^ 1)
L_24E8: SI = SI + &H9E3E
L_24EC: SWAP SI, DI
L_24EE: BX = SI
L_24F0: SI = &H703A
L_24F3: FAC! = N_703A! + N(DI)  ' RT3F_7F
L_24F6: DI = BX
L_24F8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_24FB: SI = 0xA1B2
L_24FE: CompareLeft! = N_A1B2!: CompareRight! = 0  ' RT3F_A7
L_2501: IF CompareLeft! = CompareRight! THEN GOTO L_2506  ' flags from L_24FE
L_2503: GOTO L_250C
L_2506: SI = 0xA1B6
L_2509: N(DI) = N_A1B6!  ' RT3F_7B
L_250C: GOSUB L_1D8C
L_250F: BX = &H16
L_2512: ARGPUSH BX  ' RT3E_42
L_2515: BX = 3
L_2518: LOCATE ARGS(), BX  ' RT3E_44
L_251B: FAC! = RND  ' RT3D_34
L_251E: DI = 0xA1BA
L_2521: FAC! = FAC! * N_A1BA!  ' RT3F_91
L_2524: DI = 0xA196
L_2527: FAC! = FAC! - N_A196!  ' RT3F_99
L_252A: DI = &H9EF2
L_252D: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_2530: SI = DI
L_2532: CompareLeft! = N_9EF2!: CompareRight! = 0  ' RT3F_A7
L_2535: IF CompareLeft! >= CompareRight! THEN GOTO L_253A  ' flags from L_2532
L_2537: GOTO L_25B1
L_253A: DI = 0xA1BE
L_253D: SI = 0xA196
L_2540: CompareLeft! = N_A196!: CompareRight! = N_A1BE!  ' RT3F_9F
L_2543: BX = 0
L_2546: IF CompareLeft! >= CompareRight! THEN GOTO L_2549  ' flags from L_2540
L_2548: BX = BX - 1
L_2549: DX = 1
L_254C: DX = DX - BX
L_254E: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_2551: BX = 0
L_2554: IF CompareLeft! >= CompareRight! THEN GOTO L_2557  ' flags from L_254E
L_2556: BX = BX - 1
L_2557: DX = DX - BX
L_2559: DI = &H71E4
L_255C: CompareLeft! = N(SI): CompareRight! = N_71E4!  ' RT3F_9F
L_255F: BX = 0
L_2562: IF CompareLeft! >= CompareRight! THEN GOTO L_2565  ' flags from L_255C
L_2564: BX = BX - 1
L_2565: DX = DX - BX
L_2567: BX = DX
L_2569: ON BX GOTO L_2575, L_2584, L_2593, L_25A2  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_2575: ' PRINT statement begins ; RT3F_BC
L_2578: BX = 0xA1C2
L_257B: PRINT S_A1C2$  ' RT3F_6E; H newline item, ledger correction
L_257E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2581: GOTO L_2BD3
L_2584: ' PRINT statement begins ; RT3F_BC
L_2587: BX = 0xA1E0
L_258A: PRINT S_A1E0$  ' RT3F_6E; H newline item, ledger correction
L_258D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2590: GOTO L_2BD3
L_2593: ' PRINT statement begins ; RT3F_BC
L_2596: BX = 0xA1FA
L_2599: PRINT S_A1FA$  ' RT3F_6E; H newline item, ledger correction
L_259C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_259F: GOTO L_2BD3
L_25A2: ' PRINT statement begins ; RT3F_BC
L_25A5: BX = 0xA21E
L_25A8: PRINT S_A21E$  ' RT3F_6E; H newline item, ledger correction
L_25AB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_25AE: GOTO L_2BD3
L_25B1: DI = &H6F4A
L_25B4: SI = 0xA140
L_25B7: FAC! = N_A140! + N_6F4A!  ' RT3F_7F
L_25BA: BX = CINT(FAC!)  ' RT3F_77
L_25BD: ON BX GOTO L_25C9, L_27C7, L_286E, L_28F5  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_25C9: DI = &H9EEE
L_25CC: SI = &H6F54
L_25CF: N_9EEE! = N_6F54!  ' RT3F_7B
L_25D2: ' PRINT statement begins ; RT3F_BC
L_25D5: BX = 0xA23A
L_25D8: PRINT S_A23A$  ' RT3F_6E; H newline item, ledger correction
L_25DB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_25DE: GOSUB L_1693
L_25E1: GOSUB L_1D8C
L_25E4: BX = &H14
L_25E7: ARGPUSH BX  ' RT3E_42
L_25EA: BX = 9
L_25ED: LOCATE ARGS(), BX  ' RT3E_44
L_25F0: ' PRINT statement begins ; RT3F_BC
L_25F3: BX = 0xA260
L_25F6: PRINT S_A260$;  ' RT3F_6A
L_25F9: BX = &H488C
L_25FC: PRINT S_488C$  ' RT3F_6E; H newline item, ledger correction
L_25FF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2602: DI = &H1920
L_2605: SI = &H3AB0
L_2608: FAC! = N_3AB0! / N_1920!  ' RT3F_87
L_260B: DI = 0xA278
L_260E: FAC! = FAC! * N_A278!  ' RT3F_91
L_2611: DI = 0xA27C
L_2614: FAC! = FAC! + N_A27C!  ' RT3F_81
L_2617: DI = 0xA270
L_261A: N_A270! = FAC!: SI = &H001A  ' RT3F_7D
L_261D: DI = &H70AA
L_2620: SI = &H8B2C
L_2623: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_2626: DI = 0xA274
L_2629: N_A274! = FAC!: SI = &H001A  ' RT3F_7D
L_262C: SI = &H8BBC
L_262F: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_2632: GOTO L_2673
L_2635: ' Alignment NOP
L_2636: SI = &H710E
L_2639: BX = CINT(N_710E!)  ' RT3F_75
L_263C: SI = BX
L_263E: SI = SI * (2 ^ 1)
L_2640: SI = SI * (2 ^ 1)
L_2642: BX = SI
L_2644: SI = SI + &H8A08
L_2648: DI = 0xA280
L_264B: CompareLeft! = N(SI): CompareRight! = N_A280!  ' RT3F_9F
L_264E: IF CompareLeft! > CompareRight! THEN GOTO L_2653  ' flags from L_264B
L_2650: GOTO L_266A
L_2653: BX = BX + &H89AC
L_2657: SI = BX
L_2659: DI = 0xA284
L_265C: FAC! = N(SI) * N_A284!  ' RT3F_8F
L_265F: SI = &H3AB0
L_2662: FAC! = N_3AB0! + FAC!  ' RT3F_83
L_2665: DI = SI
L_2667: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_266A: DI = &H6F4A
L_266D: SI = &H710E
L_2670: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_2673: DI = &H710E
L_2676: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_2679: SI = DI
L_267B: DI = 0xA274
L_267E: CompareLeft! = N_710E!: CompareRight! = N_A274!  ' RT3F_9F
L_2681: IF CompareLeft! <= CompareRight! THEN GOTO L_2636  ' flags from L_267E
L_2683: DI = &H719C
L_2686: SI = &H3AB0
L_2689: FAC! = N_3AB0! + N_719C!  ' RT3F_7F
L_268C: BX = &H1A
L_268F: FAC! = INT(FAC!)  ' RT3D_03
L_2692: DI = SI
L_2694: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2697: SI = DI
L_2699: DI = &H1920
L_269C: CompareLeft! = N(SI): CompareRight! = N_1920!  ' RT3F_9F
L_269F: IF CompareLeft! > CompareRight! THEN GOTO L_26A4  ' flags from L_269C
L_26A1: GOTO L_26A9
L_26A4: SWAP DI, SI
L_26A6: N(DI) = N(SI)  ' RT3F_7B
L_26A9: DI = &H1920
L_26AC: SI = &H3AB0
L_26AF: FAC! = N_3AB0! / N_1920!  ' RT3F_87
L_26B2: DI = 0xA278
L_26B5: FAC! = FAC! * N_A278!  ' RT3F_91
L_26B8: DI = 0xA27C
L_26BB: FAC! = FAC! + N_A27C!  ' RT3F_81
L_26BE: DI = &H9F8C
L_26C1: N_9F8C! = FAC!: SI = &H001A  ' RT3F_7D
L_26C4: BX = &H1E
L_26C7: DX = 0xA8
L_26CA: CX = 0
L_26CC: AX = CX
L_26CE: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_26D1: BX = &H11B
L_26D4: DX = 0xBC
L_26D7: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_26DA: BX = 0xFFFF
L_26DD: DX = 1
L_26E0: CX = BX
L_26E2: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_26E5: CX = AX
L_26E7: BX = &H2A
L_26EA: DX = 0xAF
L_26ED: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_26F0: BX = &H10E
L_26F3: DX = 0xB5
L_26F6: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_26F9: BX = 0
L_26FB: DX = 1
L_26FE: CX = 0xFFFF
L_2701: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2704: CX = AX
L_2706: BX = &H2A
L_2709: DX = 0xAF
L_270C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_270F: BX = 0xA270
L_2712: DX = 0xB5
L_2715: CX = 0xFFFF
L_2718: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_271B: BX = 2
L_271E: DX = 1
L_2721: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2724: GOSUB L_13D5
L_2727: DI = &H719C
L_272A: SI = &H9F8C
L_272D: FAC! = N_9F8C! * N_719C!  ' RT3F_8F
L_2730: BX = &H1A
L_2733: FAC! = INT(FAC!)  ' RT3D_03
L_2736: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_273A: BX = DI
L_273C: DI = 0xA288
L_273F: N_A288! = FAC!: SI = &H001A  ' RT3F_7D
L_2742: DI = BX
L_2744: SI = 0xA270
L_2747: FAC! = N_A270! * N(DI)  ' RT3F_8F
L_274A: BX = &H1A
L_274D: FAC! = INT(FAC!)  ' RT3D_03
L_2750: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_2754: GOTO L_27A8
L_2757: ' Alignment NOP
L_2758: BX = 0xA270
L_275B: DX = 0xAF
L_275E: CX = 0xFFFF
L_2761: AX = 0
L_2763: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2766: BX = &H710E
L_2769: DX = 0xB5
L_276C: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_276F: AX = BX
L_2771: BX = 2
L_2774: DX = 1
L_2777: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_277A: DI = &H8BA8
L_277D: SI = &H6F5E
L_2780: FAC! = N_6F5E! * N_8BA8!  ' RT3F_8F
L_2783: SI = AX
L_2785: DI = &H8BD8
L_2788: T_12! = FAC!  ' RT3F_71; inline=&H92
L_278C: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_278F: BX = CINT(FAC!)  ' RT3F_77
L_2792: DX = &H703A
L_2795: SoundFreq% = BX: SoundDuration! = N_703A!  ' RT3E_5E
L_2798: BX = CX
L_279A: DX = CX
L_279C: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_279F: DI = &H6F54
L_27A2: SI = &H710E
L_27A5: FAC! = N_710E! + N_6F54!  ' RT3F_7F
L_27A8: DI = &H710E
L_27AB: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_27AE: SI = DI
L_27B0: DI = 0xA288
L_27B3: CompareLeft! = N_710E!: CompareRight! = N_A288!  ' RT3F_9F
L_27B6: IF CompareLeft! <= CompareRight! THEN GOTO L_2758  ' flags from L_27B3
L_27B8: GOSUB L_1720
L_27BB: GOSUB L_1693
L_27BE: GOSUB L_1693
L_27C1: GOSUB L_2B67
L_27C4: GOTO L_2C10
L_27C7: DI = &H710A
L_27CA: SI = 0xA13C
L_27CD: CompareLeft! = N_A13C!: CompareRight! = N_710A!  ' RT3F_9F
L_27D0: IF CompareLeft! <> CompareRight! THEN GOTO L_27D5  ' flags from L_27CD
L_27D2: GOTO L_27F3
L_27D5: ' PRINT statement begins ; RT3F_BC
L_27D8: BX = 0xA28C
L_27DB: PRINT S_A28C$  ' RT3F_6E; H newline item, ledger correction
L_27DE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_27E1: DI = &H9EEE
L_27E4: SI = &H6F54
L_27E7: N_9EEE! = N_6F54!  ' RT3F_7B
L_27EA: GOSUB L_2B67
L_27ED: GOSUB L_1693
L_27F0: GOTO L_2C10
L_27F3: DI = &H9ED0
L_27F6: SI = &H6F82
L_27F9: N_9ED0! = N_6F82!  ' RT3F_7B
L_27FC: GOSUB L_1424
L_27FF: BX = &H1918
L_2802: FAC! = INT(N_1918!)  ' RT3D_03
L_2805: DI = 0xA2A6
L_2808: N_A2A6! = FAC!: SI = &H001A  ' RT3F_7D
L_280B: BX = &H15
L_280E: ARGPUSH BX  ' RT3E_42
L_2811: BX = 3
L_2814: LOCATE ARGS(), BX  ' RT3E_44
L_2817: ' PRINT statement begins ; RT3F_BC
L_281A: BX = 0xA2AA
L_281D: PRINT S_A2AA$;  ' RT3F_6A
L_2820: BX = 0xA2A6
L_2823: PRINT N_A2A6!;  ' RT3F_67; H expanded ledger
L_2826: BX = 0xA2BA
L_2829: PRINT S_A2BA$  ' RT3F_6E; H newline item, ledger correction
L_282C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_282F: ARGPUSH OMITTED  ' RT3E_43
L_2832: BX = 3
L_2835: LOCATE ARGS(), BX  ' RT3E_44
L_2838: ' PRINT statement begins ; RT3F_BC
L_283B: BX = 0xA2C6
L_283E: PRINT S_A2C6$  ' RT3F_6E; H newline item, ledger correction
L_2841: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2844: SI = 0xA2A6
L_2847: FAC! = -N_A2A6!  ' RT3F_AF
L_284A: DI = &H9ED0
L_284D: N_9ED0! = FAC!: SI = &H001A  ' RT3F_7D
L_2850: GOSUB L_1424
L_2853: GOSUB L_72BA
L_2856: GOSUB L_1693
L_2859: GOSUB L_1693
L_285C: GOSUB L_1693
L_285F: DI = &H9EEE
L_2862: SI = &H6F54
L_2865: N_9EEE! = N_6F54!  ' RT3F_7B
L_2868: GOSUB L_2B67
L_286B: GOTO L_2C10
L_286E: DI = &H9EEE
L_2871: SI = &H6F54
L_2874: N_9EEE! = N_6F54!  ' RT3F_7B
L_2877: GOSUB L_2B67
L_287A: DI = &H6F4A
L_287D: SI = &H3BB0
L_2880: FAC! = N_3BB0! + N_6F4A!  ' RT3F_7F
L_2883: DI = SI
L_2885: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2888: BX = DI
L_288A: DI = &H9EBA
L_288D: SI = &H8B84
L_2890: FAC! = N_8B84! * N_9EBA!  ' RT3F_8F
L_2893: DI = &H8BD8
L_2896: FAC! = FAC! * N_8BD8!  ' RT3F_91
L_2899: FAC! = ABS(FAC!)  ' RT3F_2D
L_289C: DX = BX
L_289E: BX = &H1A
L_28A1: FAC! = INT(FAC!)  ' RT3D_03
L_28A4: DI = &H9ED0
L_28A7: N_9ED0! = FAC!: SI = &H001A  ' RT3F_7D
L_28AA: SI = DX
L_28AC: BX = DI
L_28AE: DI = &H71D4
L_28B1: CompareLeft! = N(SI): CompareRight! = N_71D4!  ' RT3F_9F
L_28B4: IF CompareLeft! > CompareRight! THEN GOTO L_28B9  ' flags from L_28B1
L_28B6: GOTO L_28D4
L_28B9: SWAP DX, DI
L_28BB: SWAP BX, SI
L_28BD: FAC! = N(SI) / N(DI)  ' RT3F_87
L_28C0: DI = DX
L_28C2: BX = SI
L_28C4: FAC! = FAC! * N(DI)  ' RT3F_91
L_28C7: DX = BX
L_28C9: BX = &H1A
L_28CC: FAC! = INT(FAC!)  ' RT3D_03
L_28CF: DI = DX
L_28D1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_28D4: ' PRINT statement begins ; RT3F_BC
L_28D7: BX = 0xA2E0
L_28DA: PRINT S_A2E0$;  ' RT3F_6A
L_28DD: BX = &H9ED0
L_28E0: PRINT N_9ED0!;  ' RT3F_67; H expanded ledger
L_28E3: BX = 0xA2EC
L_28E6: PRINT S_A2EC$  ' RT3F_6E; H newline item, ledger correction
L_28E9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_28EC: GOSUB L_1424
L_28EF: GOSUB L_1693
L_28F2: GOTO L_2C10
L_28F5: ' PRINT statement begins ; RT3F_BC
L_28F8: BX = 0xA2F8
L_28FB: PRINT S_A2F8$  ' RT3F_6E; H newline item, ledger correction
L_28FE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2901: DI = &H9EEE
L_2904: SI = &H6F4A
L_2907: N_9EEE! = N_6F4A!  ' RT3F_7B
L_290A: GOSUB L_1693
L_290D: GOSUB L_1693
L_2910: GOSUB L_1D8C
L_2913: BX = &H16
L_2916: ARGPUSH BX  ' RT3E_42
L_2919: BX = 3
L_291C: LOCATE ARGS(), BX  ' RT3E_44
L_291F: GOTO L_25D2
L_2922: GOTO L_309B
L_2925: DI = 0xA1B2
L_2928: SI = &H6F82
L_292B: N_A1B2! = N_6F82!  ' RT3F_7B
L_292E: DI = 0xA05E
L_2931: N_A05E! = N_6F82!  ' RT3F_7B
L_2934: DI = &H70AA
L_2937: SI = &H8B2C
L_293A: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_293D: DI = 0xA318
L_2940: N_A318! = FAC!: SI = &H001A  ' RT3F_7D
L_2943: SI = &H8BBC
L_2946: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_2949: GOTO L_2B53
L_294C: SI = &H710E
L_294F: BX = CINT(N_710E!)  ' RT3F_75
L_2952: SI = BX
L_2954: SI = SI * (2 ^ 1)
L_2956: SI = SI * (2 ^ 1)
L_2958: SI = SI + &H8A08
L_295C: DI = &H710A
L_295F: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_2962: BX = 0
L_2965: IF CompareLeft! >= CompareRight! THEN GOTO L_2968  ' flags from L_295F
L_2967: BX = BX - 1
L_2968: DI = &H71CC
L_296B: CompareLeft! = N(SI): CompareRight! = N_71CC!  ' RT3F_9F
L_296E: DX = 0
L_2971: IF CompareLeft! <= CompareRight! THEN GOTO L_2974  ' flags from L_296B
L_2973: DX = DX - 1
L_2974: DX = DX OR BX
L_2976: CompareLeft% = DX: CompareRight% = 0
L_2978: IF CompareLeft% = CompareRight% THEN GOTO L_297D  ' flags from L_2976
L_297A: GOTO L_2B20
L_297D: SI = &H710E
L_2980: BX = CINT(N_710E!)  ' RT3F_75
L_2983: SI = BX
L_2985: SI = SI * (2 ^ 1)
L_2987: SI = SI * (2 ^ 1)
L_2989: BX = SI
L_298B: SI = SI + &H89C0
L_298F: DI = &H9F04
L_2992: CompareLeft! = N(SI): CompareRight! = N_9F04!  ' RT3F_9F
L_2995: DX = 0
L_2998: IF CompareLeft! <= CompareRight! THEN GOTO L_299B  ' flags from L_2992
L_299A: DX = DX - 1
L_299B: DI = 0xA31C
L_299E: CompareLeft! = N(SI): CompareRight! = N_A31C!  ' RT3F_9F
L_29A1: CX = 0
L_29A4: IF CompareLeft! >= CompareRight! THEN GOTO L_29A7  ' flags from L_299E
L_29A6: CX = CX - 1
L_29A7: CX = CX AND DX
L_29A9: BX = BX + &H89D8
L_29AD: SI = BX
L_29AF: DI = &H710A
L_29B2: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_29B5: DX = 0
L_29B8: IF CompareLeft! <= CompareRight! THEN GOTO L_29BB  ' flags from L_29B2
L_29BA: DX = DX - 1
L_29BB: DX = DX AND CX
L_29BD: DI = &H9FCC
L_29C0: CompareLeft! = N(SI): CompareRight! = N_9FCC!  ' RT3F_9F
L_29C3: CX = 0
L_29C6: IF CompareLeft! >= CompareRight! THEN GOTO L_29C9  ' flags from L_29C0
L_29C8: CX = CX - 1
L_29C9: CX = CX AND DX
L_29CB: CompareLeft% = CX: CompareRight% = 0
L_29CD: IF CompareLeft% <> CompareRight% THEN GOTO L_29D2  ' flags from L_29CB
L_29CF: GOTO L_29DB
L_29D2: DI = 0xA1B2
L_29D5: SI = &H6F4A
L_29D8: N_A1B2! = N_6F4A!  ' RT3F_7B
L_29DB: SI = &H710E
L_29DE: BX = CINT(N_710E!)  ' RT3F_75
L_29E1: SI = BX
L_29E3: SI = SI * (2 ^ 1)
L_29E5: SI = SI * (2 ^ 1)
L_29E7: BX = SI
L_29E9: SI = SI + &H89C0
L_29ED: DI = &H9FBC
L_29F0: CompareLeft! = N(SI): CompareRight! = N_9FBC!  ' RT3F_9F
L_29F3: DX = 0
L_29F6: IF CompareLeft! <= CompareRight! THEN GOTO L_29F9  ' flags from L_29F0
L_29F8: DX = DX - 1
L_29F9: DI = &H71D4
L_29FC: CompareLeft! = N(SI): CompareRight! = N_71D4!  ' RT3F_9F
L_29FF: CX = 0
L_2A02: IF CompareLeft! >= CompareRight! THEN GOTO L_2A05  ' flags from L_29FC
L_2A04: CX = CX - 1
L_2A05: CX = CX OR DX
L_2A07: DX = BX
L_2A09: BX = BX + &H89D8
L_2A0D: SWAP BX, SI
L_2A0F: DI = 0xA320
L_2A12: CompareLeft! = N(SI): CompareRight! = N_A320!  ' RT3F_9F
L_2A15: AX = 0
L_2A18: IF CompareLeft! >= CompareRight! THEN GOTO L_2A1B  ' flags from L_2A12
L_2A1A: AX = AX - 1
L_2A1B: AX = AX OR CX
L_2A1D: DI = &H9E92
L_2A20: CompareLeft! = N(SI): CompareRight! = N_9E92!  ' RT3F_9F
L_2A23: CX = 0
L_2A26: IF CompareLeft! <= CompareRight! THEN GOTO L_2A29  ' flags from L_2A20
L_2A28: CX = CX - 1
L_2A29: CX = CX OR AX
L_2A2B: CompareLeft% = CX: CompareRight% = 0
L_2A2D: IF CompareLeft% <> CompareRight% THEN GOTO L_2A32  ' flags from L_2A2B
L_2A2F: GOTO L_2A50
L_2A32: DX = DX + &H8A08
L_2A36: DI = DX
L_2A38: CX = SI
L_2A3A: SI = &H6F54
L_2A3D: N(DI) = N_6F54!  ' RT3F_7B
L_2A40: DI = BX
L_2A42: SI = 0xA324
L_2A45: N(DI) = N_A324!  ' RT3F_7B
L_2A48: DI = CX
L_2A4A: N(DI) = N_A324!  ' RT3F_7B
L_2A4D: GOTO L_2B20
L_2A50: SI = &H710E
L_2A53: BX = CINT(N_710E!)  ' RT3F_75
L_2A56: SI = BX
L_2A58: SI = SI * (2 ^ 1)
L_2A5A: SI = SI * (2 ^ 1)
L_2A5C: BX = SI
L_2A5E: SI = SI + &H8894
L_2A62: DI = &H6F4A
L_2A65: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_2A68: IF CompareLeft! < CompareRight! THEN GOTO L_2A6D  ' flags from L_2A65
L_2A6A: GOTO L_2A7B
L_2A6D: BX = BX + &H8A08
L_2A71: SWAP BX, DI
L_2A73: SI = BX
L_2A75: N(DI) = N(SI)  ' RT3F_7B
L_2A78: GOTO L_2B20
L_2A7B: SI = &H710E
L_2A7E: BX = CINT(N_710E!)  ' RT3F_75
L_2A81: SI = BX
L_2A83: SI = SI * (2 ^ 1)
L_2A85: SI = SI * (2 ^ 1)
L_2A87: BX = SI
L_2A89: SI = SI + &H8894
L_2A8D: DI = &H6F54
L_2A90: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_2A93: IF CompareLeft! < CompareRight! THEN GOTO L_2A98  ' flags from L_2A90
L_2A95: GOTO L_2AA7
L_2A98: BX = BX + &H8A08
L_2A9C: DI = BX
L_2A9E: SI = &H710A
L_2AA1: N(DI) = N_710A!  ' RT3F_7B
L_2AA4: GOTO L_2B20
L_2AA7: DI = 0xA010
L_2AAA: SI = &H6F82
L_2AAD: N_A010! = N_6F82!  ' RT3F_7B
L_2AB0: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_2AB3: GOTO L_2AEC
L_2AB6: SI = &H710E
L_2AB9: BX = CINT(N_710E!)  ' RT3F_75
L_2ABC: AX = BX
L_2ABE: SI = 6
L_2AC1: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_2AC3: SI = AX
L_2AC5: SI = &H8BDC
L_2AC8: BX = SI
L_2ACA: DX = BX
L_2ACC: BX = CINT(N_8BDC!)  ' RT3F_75
L_2ACF: BX = BX + AX
L_2AD1: SI = BX
L_2AD3: SI = SI * (2 ^ 1)
L_2AD5: SI = SI * (2 ^ 1)
L_2AD7: SI = SI + &H8A1C
L_2ADB: DI = 0xA010
L_2ADE: FAC! = N(SI) + N_A010!  ' RT3F_7F
L_2AE1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2AE4: SI = DX
L_2AE6: DI = &H6F4A
L_2AE9: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_2AEC: DI = &H8BDC
L_2AEF: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_2AF2: SI = DI
L_2AF4: DI = &H71D4
L_2AF7: CompareLeft! = N_8BDC!: CompareRight! = N_71D4!  ' RT3F_9F
L_2AFA: IF CompareLeft! <= CompareRight! THEN GOTO L_2AB6  ' flags from L_2AF7
L_2AFC: DI = &H6F4A
L_2AFF: SI = 0xA010

```

### Battle outcomes and report

```basic
L_2B02: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2B05: IF CompareLeft! < CompareRight! THEN GOTO L_2B0A  ' flags from L_2B02
L_2B07: GOTO L_2B20
L_2B0A: SI = &H710E
L_2B0D: BX = CINT(N_710E!)  ' RT3F_75
L_2B10: DI = BX
L_2B12: DI = DI * (2 ^ 1)
L_2B14: DI = DI * (2 ^ 1)
L_2B16: DI = DI + &H8A08
L_2B1A: SI = &H710A
L_2B1D: N(DI) = N_710A!  ' RT3F_7B
L_2B20: SI = &H710E
L_2B23: BX = CINT(N_710E!)  ' RT3F_75
L_2B26: SI = BX
L_2B28: SI = SI * (2 ^ 1)
L_2B2A: SI = SI * (2 ^ 1)
L_2B2C: SI = SI + &H8A08
L_2B30: DI = 0xA280
L_2B33: CompareLeft! = N(SI): CompareRight! = N_A280!  ' RT3F_9F
L_2B36: BX = 0
L_2B39: IF CompareLeft! <= CompareRight! THEN GOTO L_2B3C  ' flags from L_2B33
L_2B3B: BX = BX - 1
L_2B3C: FAC! = CSNG(BX)  ' RT3F_57
L_2B3F: SI = 0xA05E
L_2B42: FAC! = N_A05E! - FAC!  ' RT3F_9B
L_2B45: DI = SI
L_2B47: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2B4A: DI = &H6F4A
L_2B4D: SI = &H710E
L_2B50: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_2B53: DI = &H710E
L_2B56: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_2B59: SI = DI
L_2B5B: DI = 0xA318
L_2B5E: CompareLeft! = N_710E!: CompareRight! = N_A318!  ' RT3F_9F
L_2B61: IF CompareLeft! > CompareRight! THEN GOTO L_2B66  ' flags from L_2B5E
L_2B63: GOTO L_294C
L_2B66: RETURN
L_2B67: DI = &H9EBA
L_2B6A: SI = &H6F82
L_2B6D: N_9EBA! = N_6F82!  ' RT3F_7B
L_2B70: DI = &H70AA
L_2B73: SI = &H8B2C
L_2B76: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_2B79: DI = 0xA328
L_2B7C: N_A328! = FAC!: SI = &H001A  ' RT3F_7D
L_2B7F: SI = &H8BBC
L_2B82: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_2B85: GOTO L_2BC2
L_2B88: SI = &H710E
L_2B8B: BX = CINT(N_710E!)  ' RT3F_75
L_2B8E: SI = BX
L_2B90: SI = SI * (2 ^ 1)
L_2B92: SI = SI * (2 ^ 1)
L_2B94: SI = SI + &H8A08
L_2B98: DI = &H6F54
L_2B9B: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_2B9E: IF CompareLeft! > CompareRight! THEN GOTO L_2BA3  ' flags from L_2B9B
L_2BA0: GOTO L_2BB9
L_2BA3: DI = SI
L_2BA5: SI = &H9EEE
L_2BA8: N(DI) = N_9EEE!  ' RT3F_7B
L_2BAB: DI = &H6F4A
L_2BAE: SI = &H9EBA
L_2BB1: FAC! = N_9EBA! + N_6F4A!  ' RT3F_7F
L_2BB4: DI = SI
L_2BB6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2BB9: DI = &H6F4A
L_2BBC: SI = &H710E
L_2BBF: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_2BC2: DI = &H710E
L_2BC5: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_2BC8: SI = DI
L_2BCA: DI = 0xA328
L_2BCD: CompareLeft! = N_710E!: CompareRight! = N_A328!  ' RT3F_9F
L_2BD0: IF CompareLeft! <= CompareRight! THEN GOTO L_2B88  ' flags from L_2BCD
L_2BD2: RETURN
L_2BD3: DI = &H6F4A
L_2BD6: SI = &H8B74
L_2BD9: CompareLeft! = N_8B74!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2BDC: BX = 0
L_2BDF: IF CompareLeft! <= CompareRight! THEN GOTO L_2BE2  ' flags from L_2BD9
L_2BE1: BX = BX - 1
L_2BE2: FAC! = RND  ' RT3D_34
L_2BE5: DX = DI
L_2BE7: DI = &H717C
L_2BEA: FAC! = FAC! * N_717C!  ' RT3F_91
L_2BED: DI = &H9EF2
L_2BF0: CompareLeft! = FAC!: CompareRight! = N_9EF2!  ' RT3F_A1
L_2BF3: CX = 0
L_2BF6: IF CompareLeft! >= CompareRight! THEN GOTO L_2BF9  ' flags from L_2BF0
L_2BF8: CX = CX - 1
L_2BF9: CX = CX AND BX
L_2BFB: CompareLeft% = CX: CompareRight% = 0
L_2BFD: IF CompareLeft% <> CompareRight% THEN GOTO L_2C02  ' flags from L_2BFB
L_2BFF: GOTO L_2C0A
L_2C02: SI = DX
L_2C04: DI = &H9E9E
L_2C07: N_9E9E! = N(SI)  ' RT3F_7B
L_2C0A: GOSUB L_1693
L_2C0D: GOTO L_309B
L_2C10: GOSUB L_1D8C
L_2C13: BX = &H16
L_2C16: ARGPUSH BX  ' RT3E_42
L_2C19: BX = 0xE
L_2C1C: LOCATE ARGS(), BX  ' RT3E_44
L_2C1F: ' PRINT statement begins ; RT3F_BC
L_2C22: BX = 0xA32C
L_2C25: PRINT S_A32C$  ' RT3F_6E; H newline item, ledger correction
L_2C28: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2C2B: GOSUB L_1693
L_2C2E: GOSUB L_1693
L_2C31: DI = &H6F4A
L_2C34: SI = &H1858
L_2C37: CompareLeft! = N_1858!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2C3A: IF CompareLeft! <> CompareRight! THEN GOTO L_2C3F  ' flags from L_2C37
L_2C3C: GOTO L_2C42
L_2C3F: GOSUB L_2F4B
L_2C42: BX = 0xFFFF
L_2C45: CLS BX  ' RT3E_32
L_2C48: BX = 1
L_2C4B: ARGPUSH BX  ' RT3E_42
L_2C4E: BX = 0xE
L_2C51: LOCATE ARGS(), BX  ' RT3E_44
L_2C54: ' PRINT statement begins ; RT3F_BC
L_2C57: BX = 0xA33C
L_2C5A: PRINT S_A33C$  ' RT3F_6E; H newline item, ledger correction
L_2C5D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2C60: DI = 0xA010
L_2C63: SI = &H6F82
L_2C66: N_A010! = N_6F82!  ' RT3F_7B
L_2C69: DI = &H70AA
L_2C6C: SI = &H8B2C
L_2C6F: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_2C72: DI = 0xA34E
L_2C75: N_A34E! = FAC!: SI = &H001A  ' RT3F_7D
L_2C78: SI = &H8BBC
L_2C7B: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_2C7E: GOTO L_2E5F
L_2C81: ' Alignment NOP
L_2C82: ' PRINT statement begins ; RT3F_BC
L_2C85: BX = &H6F46
L_2C88: PRINT S_6F46$  ' RT3F_6E; H newline item, ledger correction
L_2C8B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2C8E: ' PRINT statement begins ; RT3F_BC
L_2C91: BX = 0xA35E
L_2C94: PRINT S_A35E$;  ' RT3F_6A
L_2C97: DI = 0xA364
L_2C9A: SI = &H710E
L_2C9D: FAC! = N_710E! + N_A364!  ' RT3F_7F
L_2CA0: BX = SI
L_2CA2: DX = BX
L_2CA4: BX = CINT(FAC!)  ' RT3F_77
L_2CA7: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_2CAA: PRINT S(BX);  ' RT3F_6A
L_2CAD: BX = &H9FF8
L_2CB0: PRINT S_9FF8$;  ' RT3F_6A
L_2CB3: BX = &H8B28
L_2CB6: PRINT S_8B28$;  ' RT3F_6A
L_2CB9: BX = 0xA368
L_2CBC: PRINT S_A368$;  ' RT3F_6A
L_2CBF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2CC2: SI = DX
L_2CC4: BX = CINT(N(SI))  ' RT3F_75
L_2CC7: SI = BX
L_2CC9: SI = SI * (2 ^ 1)
L_2CCB: SI = SI * (2 ^ 1)
L_2CCD: SI = SI + &H8A08
L_2CD1: DI = &H6F54
L_2CD4: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_2CD7: IF CompareLeft! = CompareRight! THEN GOTO L_2CDC  ' flags from L_2CD4
L_2CD9: GOTO L_2CEB
L_2CDC: ' PRINT statement begins ; RT3F_BC
L_2CDF: BX = 0xA352
L_2CE2: PRINT S_A352$  ' RT3F_6E; H newline item, ledger correction
L_2CE5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2CE8: GOTO L_2E56
L_2CEB: SI = &H710E
L_2CEE: BX = CINT(N_710E!)  ' RT3F_75
L_2CF1: SI = BX
L_2CF3: SI = SI * (2 ^ 1)
L_2CF5: SI = SI * (2 ^ 1)
L_2CF7: SI = SI + &H8A08
L_2CFB: DI = &H71D4
L_2CFE: CompareLeft! = N(SI): CompareRight! = N_71D4!  ' RT3F_9F
L_2D01: IF CompareLeft! = CompareRight! THEN GOTO L_2D06  ' flags from L_2CFE
L_2D03: GOTO L_2D15
L_2D06: ' PRINT statement begins ; RT3F_BC
L_2D09: BX = 0xA370
L_2D0C: PRINT S_A370$  ' RT3F_6E; H newline item, ledger correction
L_2D0F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2D12: GOTO L_2D51
L_2D15: DI = 0xA010
L_2D18: SI = &H6F4A
L_2D1B: N_A010! = N_6F4A!  ' RT3F_7B
L_2D1E: SI = &H710E
L_2D21: BX = CINT(N_710E!)  ' RT3F_75
L_2D24: SI = BX
L_2D26: SI = SI * (2 ^ 1)
L_2D28: SI = SI * (2 ^ 1)
L_2D2A: SI = SI + &H8894
L_2D2E: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_2D31: IF CompareLeft! > CompareRight! THEN GOTO L_2D36  ' flags from L_2D2E
L_2D33: GOTO L_2D45
L_2D36: ' PRINT statement begins ; RT3F_BC
L_2D39: BX = 0xA37A
L_2D3C: PRINT S_A37A$  ' RT3F_6E; H newline item, ledger correction
L_2D3F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2D42: GOTO L_2D51
L_2D45: ' PRINT statement begins ; RT3F_BC
L_2D48: BX = 0xA38A
L_2D4B: PRINT S_A38A$  ' RT3F_6E; H newline item, ledger correction
L_2D4E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2D51: DI = &H6F4A
L_2D54: SI = &H1D2C
L_2D57: FAC! = N_1D2C! + N_6F4A!  ' RT3F_7F
L_2D5A: DI = 0xA398
L_2D5D: T_12! = FAC!  ' RT3F_71; inline=&H92
L_2D61: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_2D64: BX = 0
L_2D67: IF CompareLeft! >= CompareRight! THEN GOTO L_2D6A  ' flags from L_2D61
L_2D69: BX = BX - 1
L_2D6A: CompareLeft% = BX: CompareRight% = 0
L_2D6C: IF CompareLeft% >= CompareRight% THEN GOTO L_2D70  ' flags from L_2D6A
L_2D6E: BX = -BX
L_2D70: FAC! = CSNG(BX)  ' RT3F_57
L_2D73: FAC! = T_12! * FAC!  ' RT3F_95; inline=&H92
L_2D77: BX = &H1A
L_2D7A: FAC! = INT(FAC!)  ' RT3D_03
L_2D7D: DI = &H71C0
L_2D80: N_71C0! = FAC!: SI = &H001A  ' RT3F_7D
L_2D83: DI = 0xA39C
L_2D86: SI = &H1D28
L_2D89: CompareLeft! = N_1D28!: CompareRight! = N_A39C!  ' RT3F_9F
L_2D8C: BX = 0
L_2D8F: IF CompareLeft! >= CompareRight! THEN GOTO L_2D92  ' flags from L_2D89
L_2D91: BX = BX - 1
L_2D92: CompareLeft% = BX: CompareRight% = 0
L_2D94: IF CompareLeft% >= CompareRight% THEN GOTO L_2D98  ' flags from L_2D92
L_2D96: BX = -BX
L_2D98: FAC! = CSNG(BX)  ' RT3F_57
L_2D9B: FAC! = N(SI) + FAC!  ' RT3F_83
L_2D9E: BX = &H1A
L_2DA1: FAC! = INT(FAC!)  ' RT3D_03
L_2DA4: DI = SI
L_2DA6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2DA9: DI = 0xA39C
L_2DAC: SI = &H1D30
L_2DAF: CompareLeft! = N_1D30!: CompareRight! = N_A39C!  ' RT3F_9F
L_2DB2: BX = 0
L_2DB5: IF CompareLeft! >= CompareRight! THEN GOTO L_2DB8  ' flags from L_2DAF
L_2DB7: BX = BX - 1
L_2DB8: CompareLeft% = BX: CompareRight% = 0
L_2DBA: IF CompareLeft% >= CompareRight% THEN GOTO L_2DBE  ' flags from L_2DB8
L_2DBC: BX = -BX
L_2DBE: FAC! = CSNG(BX)  ' RT3F_57
L_2DC1: FAC! = N(SI) + FAC!  ' RT3F_83
L_2DC4: BX = &H1A
L_2DC7: FAC! = INT(FAC!)  ' RT3D_03
L_2DCA: DI = SI
L_2DCC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2DCF: DI = 0xA39C
L_2DD2: SI = &H1D38
L_2DD5: CompareLeft! = N_1D38!: CompareRight! = N_A39C!  ' RT3F_9F
L_2DD8: BX = 0
L_2DDB: IF CompareLeft! >= CompareRight! THEN GOTO L_2DDE  ' flags from L_2DD5
L_2DDD: BX = BX - 1
L_2DDE: CompareLeft% = BX: CompareRight% = 0
L_2DE0: IF CompareLeft% >= CompareRight% THEN GOTO L_2DE4  ' flags from L_2DDE
L_2DE2: BX = -BX
L_2DE4: FAC! = CSNG(BX)  ' RT3F_57
L_2DE7: FAC! = N(SI) + FAC!  ' RT3F_83
L_2DEA: BX = &H1A
L_2DED: FAC! = INT(FAC!)  ' RT3D_03
L_2DF0: DI = SI
L_2DF2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2DF5: DI = 0xA3A0
L_2DF8: SI = &H71C0
L_2DFB: FAC! = N_71C0! + N_A3A0!  ' RT3F_7F
L_2DFE: BX = SI
L_2E00: DX = BX
L_2E02: BX = CINT(FAC!)  ' RT3F_77
L_2E05: DI = BX
L_2E07: DI = DI * (2 ^ 1)
L_2E09: DI = DI * (2 ^ 1)
L_2E0B: DI = DI + &H1850
L_2E0F: SI = &H8B88
L_2E12: N(DI) = N_8B88!  ' RT3F_7B
L_2E15: SI = DX
L_2E17: DI = 0xA3A4
L_2E1A: FAC! = N(SI) + N_A3A4!  ' RT3F_7F
L_2E1D: BX = CINT(FAC!)  ' RT3F_77
L_2E20: DI = BX
L_2E22: DI = DI * (2 ^ 1)
L_2E24: DI = DI * (2 ^ 1)
L_2E26: DI = DI + &H1850
L_2E2A: SI = &H8B84
L_2E2D: N(DI) = N_8B84!  ' RT3F_7B
L_2E30: SWAP DX, SI
L_2E32: DI = &H1D2C
L_2E35: N_1D2C! = N(SI)  ' RT3F_7B
L_2E38: DI = &H6F4A
L_2E3B: SI = &H1D34
L_2E3E: FAC! = N_1D34! + N_6F4A!  ' RT3F_7F
L_2E41: DI = SI
L_2E43: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2E46: SI = DX
L_2E48: FAC! = ABS(N(SI))  ' RT3F_2B
L_2E4B: SI = &H1D3C
L_2E4E: FAC! = N_1D3C! + FAC!  ' RT3F_83
L_2E51: DI = SI
L_2E53: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2E56: DI = &H6F4A
L_2E59: SI = &H710E
L_2E5C: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_2E5F: DI = &H710E
L_2E62: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_2E65: SI = DI
L_2E67: DI = 0xA34E
L_2E6A: CompareLeft! = N_710E!: CompareRight! = N_A34E!  ' RT3F_9F
L_2E6D: IF CompareLeft! > CompareRight! THEN GOTO L_2E72  ' flags from L_2E6A
L_2E6F: GOTO L_2C82
L_2E72: DI = &H6F4A
L_2E75: SI = 0xA010
L_2E78: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2E7B: BX = 0
L_2E7E: IF CompareLeft! <> CompareRight! THEN GOTO L_2E81  ' flags from L_2E78
L_2E80: BX = BX - 1
L_2E81: DI = 0xA3A8
L_2E84: SI = &H3B44
L_2E87: FAC! = N_3B44! + N_A3A8!  ' RT3F_7F
L_2E8A: DI = &H3AE8
L_2E8D: CompareLeft! = FAC!: CompareRight! = N_3AE8!  ' RT3F_A1
L_2E90: DX = 0
L_2E93: IF CompareLeft! <> CompareRight! THEN GOTO L_2E96  ' flags from L_2E8D
L_2E95: DX = DX - 1
L_2E96: DX = DX AND BX
L_2E98: CompareLeft% = DX: CompareRight% = 0
L_2E9A: IF CompareLeft% <> CompareRight% THEN GOTO L_2E9F  ' flags from L_2E98
L_2E9C: GOTO L_2EA2
L_2E9F: GOSUB L_73A9
L_2EA2: DI = &H6F4A
L_2EA5: SI = 0xA010
L_2EA8: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2EAB: BX = 0
L_2EAE: IF CompareLeft! <> CompareRight! THEN GOTO L_2EB1  ' flags from L_2EA8
L_2EB0: BX = BX - 1
L_2EB1: DI = 0xA3AC
L_2EB4: SI = &H3B50
L_2EB7: FAC! = N_3B50! + N_A3AC!  ' RT3F_7F
L_2EBA: DI = &H3AE8
L_2EBD: DX = SI
L_2EBF: CompareLeft! = FAC!: CompareRight! = N_3AE8!  ' RT3F_A1
L_2EC2: CX = 0
L_2EC5: IF CompareLeft! <> CompareRight! THEN GOTO L_2EC8  ' flags from L_2EBF
L_2EC7: CX = CX - 1
L_2EC8: CX = CX AND BX
L_2ECA: CompareLeft% = CX: CompareRight% = 0
L_2ECC: IF CompareLeft% <> CompareRight% THEN GOTO L_2ED1  ' flags from L_2ECA
L_2ECE: GOTO L_2ED9
L_2ED1: DI = DX
L_2ED3: SI = 0xA3B0
L_2ED6: N(DI) = N_A3B0!  ' RT3F_7B
L_2ED9: DI = &H6F4A
L_2EDC: SI = 0xA010
L_2EDF: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2EE2: BX = 0
L_2EE5: IF CompareLeft! <> CompareRight! THEN GOTO L_2EE8  ' flags from L_2EDF
L_2EE7: BX = BX - 1
L_2EE8: DI = 0xA3AC
L_2EEB: SI = &H3B40
L_2EEE: FAC! = N_3B40! + N_A3AC!  ' RT3F_7F
L_2EF1: DI = &H3AE8
L_2EF4: DX = SI
L_2EF6: CompareLeft! = FAC!: CompareRight! = N_3AE8!  ' RT3F_A1
L_2EF9: CX = 0
L_2EFC: IF CompareLeft! <> CompareRight! THEN GOTO L_2EFF  ' flags from L_2EF6
L_2EFE: CX = CX - 1
L_2EFF: CX = CX AND BX

```

### Life support

```basic
L_2F01: CompareLeft% = CX: CompareRight% = 0
L_2F03: IF CompareLeft% <> CompareRight% THEN GOTO L_2F08  ' flags from L_2F01
L_2F05: GOTO L_2F10
L_2F08: DI = DX
L_2F0A: SI = 0xA3B0
L_2F0D: N(DI) = N_A3B0!  ' RT3F_7B
L_2F10: DI = &H3BAC
L_2F13: SI = &H3AE8
L_2F16: N_3BAC! = N_3AE8!  ' RT3F_7B
L_2F19: GOSUB L_72B9
L_2F1C: SI = &H9EA2
L_2F1F: CompareLeft! = N_9EA2!: CompareRight! = 0  ' RT3F_A7
L_2F22: IF CompareLeft! = CompareRight! THEN GOTO L_2F27  ' flags from L_2F1F
L_2F24: GOTO L_2F36
L_2F27: BX = 0xA3B4
L_2F2A: AX = &H6F42
L_2F2D: BX = TEMP_DESC(S_6F42$ + S_A3B4$)  ' BX receives a temporary descriptor  ' RT3F_55
L_2F30: CHAIN S(BX)  ' RT3E_0E; H expanded ledger
L_2F33: GOTO L_2F4B
L_2F36: DI = &H3AE8
L_2F39: SI = &H8B80
L_2F3C: N_3AE8! = N_8B80!  ' RT3F_7B
L_2F3F: BX = 0xA3C2
L_2F42: AX = &H6F42
L_2F45: BX = TEMP_DESC(S_6F42$ + S_A3C2$)  ' BX receives a temporary descriptor  ' RT3F_55
L_2F48: CHAIN S(BX)  ' RT3E_0E; H expanded ledger
L_2F4B: GOSUB L_1D8C
L_2F4E: BX = &H14
L_2F51: ARGPUSH BX  ' RT3E_42
L_2F54: BX = 3
L_2F57: LOCATE ARGS(), BX  ' RT3E_44
L_2F5A: ' PRINT statement begins ; RT3F_BC
L_2F5D: DX = BX
L_2F5F: BX = 0xA3D2
L_2F62: PRINT S_A3D2$  ' RT3F_6E; H newline item, ledger correction
L_2F65: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2F68: BX = &H15
L_2F6B: ARGPUSH BX  ' RT3E_42
L_2F6E: BX = DX
L_2F70: LOCATE ARGS(), BX  ' RT3E_44
L_2F73: ' PRINT statement begins ; RT3F_BC
L_2F76: BX = 0xA3EA
L_2F79: PRINT S_A3EA$  ' RT3F_6E; H newline item, ledger correction
L_2F7C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2F7F: BX = &H18
L_2F82: ARGPUSH BX  ' RT3E_42
L_2F85: BX = DX
L_2F87: LOCATE ARGS(), BX  ' RT3E_44
L_2F8A: GOSUB L_16B9
L_2F8D: BX = 0xA40A
L_2F90: DX = &H9F00
L_2F93: S_9F00$ = S_A40A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2F96: GOSUB L_15A6
L_2F99: DI = &H6F4A
L_2F9C: SI = &H9EA6
L_2F9F: CompareLeft! = N_9EA6!: CompareRight! = N_6F4A!  ' RT3F_9F
L_2FA2: IF CompareLeft! < CompareRight! THEN GOTO L_2F8D  ' flags from L_2F9F
L_2FA4: GOSUB L_1D8C
L_2FA7: BX = &H15
L_2FAA: ARGPUSH BX  ' RT3E_42
L_2FAD: BX = 3
L_2FB0: LOCATE ARGS(), BX  ' RT3E_44
L_2FB3: FAC! = RND  ' RT3D_34
L_2FB6: DI = &H717C
L_2FB9: FAC! = FAC! * N_717C!  ' RT3F_91
L_2FBC: DI = &H7174
L_2FBF: SI = &H71FC
L_2FC2: N_7174! = N_71FC!  ' RT3F_7B
L_2FC5: DI = &H7178
L_2FC8: SI = &H9EA6
L_2FCB: N_7178! = N_9EA6!  ' RT3F_7B
L_2FCE: T_12! = FAC!  ' RT3F_71; inline=&H92
L_2FD2: GOSUB L_0301
L_2FD5: DI = &H8BD8
L_2FD8: FAC! = FAC! * N_8BD8!  ' RT3F_91
L_2FDB: DI = &H9FBC
L_2FDE: FAC! = FAC! + N_9FBC!  ' RT3F_81
L_2FE1: CompareLeft! = T_12!: CompareRight! = FAC!  ' RT3F_A5; inline=&H92
L_2FE5: IF CompareLeft! < CompareRight! THEN GOTO L_2FEA  ' flags from L_2FE1
L_2FE7: GOTO L_3028
L_2FEA: ' PRINT statement begins ; RT3F_BC
L_2FED: BX = 0xA41E
L_2FF0: PRINT S_A41E$  ' RT3F_6E; H newline item, ledger correction
L_2FF3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2FF6: BX = &H16
L_2FF9: ARGPUSH BX  ' RT3E_42
L_2FFC: BX = 3
L_2FFF: LOCATE ARGS(), BX  ' RT3E_44
L_3002: ' PRINT statement begins ; RT3F_BC
L_3005: DX = BX
L_3007: BX = 0xA43C
L_300A: PRINT S_A43C$  ' RT3F_6E; H newline item, ledger correction
L_300D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3010: BX = &H18
L_3013: ARGPUSH BX  ' RT3E_42
L_3016: BX = DX
L_3018: LOCATE ARGS(), BX  ' RT3E_44
L_301B: GOSUB L_16B9
L_301E: DI = &H1858
L_3021: SI = &H6F4A
L_3024: N_1858! = N_6F4A!  ' RT3F_7B
L_3027: RETURN
L_3028: ' PRINT statement begins ; RT3F_BC
L_302B: BX = 0xA48E
L_302E: PRINT S_A48E$;  ' RT3F_6A
L_3031: SI = &H9EA6
L_3034: BX = CINT(N_9EA6!)  ' RT3F_75
L_3037: BX = BX * (2 ^ 1)
L_3039: BX = BX * (2 ^ 1)
L_303B: BX = BX + &H4288
L_303F: PRINT S(BX);  ' RT3F_6A
L_3042: BX = 0xA44C
L_3045: PRINT S_A44C$  ' RT3F_6E; H newline item, ledger correction
L_3048: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_304B: BX = &H16
L_304E: ARGPUSH BX  ' RT3E_42
L_3051: BX = 3
L_3054: LOCATE ARGS(), BX  ' RT3E_44
L_3057: ' PRINT statement begins ; RT3F_BC
L_305A: BX = 0xA468
L_305D: PRINT S_A468$  ' RT3F_6E; H newline item, ledger correction
L_3060: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3063: GOSUB L_1DD0
L_3066: BX = 9
L_3069: ARGPUSH BX  ' RT3E_42
L_306C: BX = 3
L_306F: LOCATE ARGS(), BX  ' RT3E_44
L_3072: ' PRINT statement begins ; RT3F_BC
L_3075: BX = 0xA496
L_3078: PRINT S_A496$  ' RT3F_6E; H newline item, ledger correction
L_307B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_307E: FAC! = TIMER  ' RT3D_43
L_3081: DI = 0xA4AA
L_3084: N_A4AA! = FAC!: SI = &H001A  ' RT3F_7D
L_3087: FAC! = TIMER  ' RT3D_43
L_308A: DI = 0xA4AA
L_308D: FAC! = FAC! - N_A4AA!  ' RT3F_99
L_3090: DI = 0xA4AE
L_3093: CompareLeft! = FAC!: CompareRight! = N_A4AE!  ' RT3F_A1
L_3096: IF CompareLeft! < CompareRight! THEN GOTO L_3087  ' flags from L_3093
L_3098: END  ' RT3E_01
L_309B: GOSUB L_4186
L_309E: DI = 0xA4B2
L_30A1: SI = 0xA4BA
L_30A4: N_A4B2! = N_A4BA!  ' RT3F_7B
L_30A7: DI = 0xA4B6
L_30AA: N_A4B6! = N_A4BA!  ' RT3F_7B
L_30AD: SI = &H6F4A
L_30B0: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_30B3: GOTO L_3139
L_30B6: DI = &H7188
L_30B9: SI = &H9EAA
L_30BC: N_7188! = N_9EAA!  ' RT3F_7B
L_30BF: DI = &H718C
L_30C2: BX = SI
L_30C4: SI = &H6F86
L_30C7: N_718C! = N_6F86!  ' RT3F_7B
L_30CA: GOSUB L_0333
L_30CD: BX = CINT(FAC!)  ' RT3F_77
L_30D0: DI = BX
L_30D2: DI = DI * (2 ^ 1)
L_30D4: DI = DI * (2 ^ 1)
L_30D6: DI = DI + &H1850
L_30DA: BX = DI
L_30DC: DI = &H7174
L_30DF: SI = &H9EAA
L_30E2: N_7174! = N_9EAA!  ' RT3F_7B
L_30E5: DX = DI
L_30E7: DI = &H7178
L_30EA: CX = SI
L_30EC: SI = &H6F86
L_30EF: N_7178! = N_6F86!  ' RT3F_7B
L_30F2: WORD(BP - &H10) = BX
L_30F5: GOSUB L_0301
L_30F8: DI = &H7174
L_30FB: SI = &H9EAA
L_30FE: N_7174! = N_9EAA!  ' RT3F_7B

```

### Movement phase

```basic
L_3101: DI = &H7178
L_3104: SI = &H6F86
L_3107: N_7178! = N_6F86!  ' RT3F_7B
L_310A: T_12! = FAC!  ' RT3F_71; inline=&H92
L_310E: GOSUB L_0301
L_3111: DI = &H710A
L_3114: CompareLeft! = FAC!: CompareRight! = N_710A!  ' RT3F_A1
L_3117: BX = 0
L_311A: IF CompareLeft! <= CompareRight! THEN GOTO L_311D  ' flags from L_3114
L_311C: BX = BX - 1
L_311D: CompareLeft% = BX: CompareRight% = 0
L_311F: IF CompareLeft% >= CompareRight% THEN GOTO L_3123  ' flags from L_311D
L_3121: BX = -BX
L_3123: FAC! = CSNG(BX)  ' RT3F_57
L_3126: FAC! = T_12! * FAC!  ' RT3F_95; inline=&H92
L_312A: DI = WORD(BP - &H10)
L_312D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3130: DI = &H6F4A
L_3133: SI = &H6F86
L_3136: FAC! = N_6F86! + N_6F4A!  ' RT3F_7F
L_3139: DI = &H6F86
L_313C: N_6F86! = FAC!: SI = &H001A  ' RT3F_7D
L_313F: SI = DI
L_3141: DI = &H7116
L_3144: CompareLeft! = N_6F86!: CompareRight! = N_7116!  ' RT3F_9F
L_3147: IF CompareLeft! > CompareRight! THEN GOTO L_314C  ' flags from L_3144
L_3149: GOTO L_30B6
L_314C: DI = &H70AA
L_314F: SI = &H8B2C
L_3152: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_3155: DI = 0xA4BE
L_3158: N_A4BE! = FAC!: SI = &H001A  ' RT3F_7D
L_315B: SI = &H8BBC
L_315E: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_3161: GOTO L_31F2
L_3164: SI = &H710E
L_3167: BX = CINT(N_710E!)  ' RT3F_75
L_316A: SI = BX
L_316C: SI = SI * (2 ^ 1)
L_316E: SI = SI * (2 ^ 1)
L_3170: SI = SI + &H8B04
L_3174: DI = &H6F4A
L_3177: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_317A: IF CompareLeft! < CompareRight! THEN GOTO L_317F  ' flags from L_3177
L_317C: GOTO L_31E9
L_317F: SI = &H6F82
L_3182: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_3185: GOTO L_31D9
L_3188: SI = &H710E
L_318B: BX = CINT(N_710E!)  ' RT3F_75
L_318E: AX = BX
L_3190: DI = 6
L_3193: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_3195: DI = AX
L_3197: SI = 0xA4C2
L_319A: BX = SI
L_319C: DX = BX
L_319E: BX = CINT(N_A4C2!)  ' RT3F_75
L_31A1: DI = DI + BX
L_31A3: DI = DI * (2 ^ 1)
L_31A5: DI = DI * (2 ^ 1)
L_31A7: BX = DI
L_31A9: DI = DI + &H8A1C
L_31AD: BX = BX + &H88A8
L_31B1: SI = BX
L_31B3: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_31B6: CX = 0
L_31B9: IF CompareLeft! <= CompareRight! THEN GOTO L_31BC  ' flags from L_31B3
L_31BB: CX = CX - 1
L_31BC: CompareLeft% = CX: CompareRight% = 0
L_31BE: IF CompareLeft% >= CompareRight% THEN GOTO L_31C2  ' flags from L_31BC
L_31C0: CX = -CX
L_31C2: BX = CX
L_31C4: FAC! = CSNG(BX)  ' RT3F_57
L_31C7: SI = DI
L_31C9: FAC! = N(SI) * FAC!  ' RT3F_93
L_31CC: DI = SI
L_31CE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_31D1: SI = DX
L_31D3: DI = &H6F4A
L_31D6: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_31D9: DI = 0xA4C2
L_31DC: N_A4C2! = FAC!: SI = &H001A  ' RT3F_7D
L_31DF: SI = DI
L_31E1: DI = &H71D4
L_31E4: CompareLeft! = N_A4C2!: CompareRight! = N_71D4!  ' RT3F_9F
L_31E7: IF CompareLeft! <= CompareRight! THEN GOTO L_3188  ' flags from L_31E4
L_31E9: DI = &H6F4A
L_31EC: SI = &H710E
L_31EF: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_31F2: DI = &H710E
L_31F5: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_31F8: SI = DI
L_31FA: DI = 0xA4BE
L_31FD: CompareLeft! = N_710E!: CompareRight! = N_A4BE!  ' RT3F_9F
L_3200: IF CompareLeft! > CompareRight! THEN GOTO L_3205  ' flags from L_31FD
L_3202: GOTO L_3164
L_3205: SI = &H6F4A
L_3208: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_320B: GOTO L_3DC5
L_320E: DI = 0xA4B6
L_3211: SI = &H6F82
L_3214: N_A4B6! = N_6F82!  ' RT3F_7B
L_3217: DI = 0xA4B2
L_321A: N_A4B2! = N_6F82!  ' RT3F_7B
L_321D: DI = 0xA4C6
L_3220: N_A4C6! = N_6F82!  ' RT3F_7B
L_3223: DI = &H6F8A
L_3226: SI = 0xA4CA
L_3229: CompareLeft! = N_A4CA!: CompareRight! = N_6F8A!  ' RT3F_9F
L_322C: IF CompareLeft! <> CompareRight! THEN GOTO L_3231  ' flags from L_3229
L_322E: GOTO L_3446
L_3231: GOSUB L_1D8C
L_3234: BX = &H14
L_3237: ARGPUSH BX  ' RT3E_42
L_323A: BX = 0xC
L_323D: LOCATE ARGS(), BX  ' RT3E_44
L_3240: ' PRINT statement begins ; RT3F_BC
L_3243: BX = 0xA4CE
L_3246: PRINT S_A4CE$;  ' RT3F_6A
L_3249: BX = 0xA4CA
L_324C: PRINT N_A4CA!  ' RT3F_6B
L_324F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3252: DI = 0xA4CA
L_3255: SI = &H1998
L_3258: FAC! = N_1998! * N_A4CA!  ' RT3F_8F
L_325B: BX = DI
L_325D: DI = &H71D8
L_3260: DX = SI
L_3262: FAC! = FAC! / N_71D8!  ' RT3F_89
L_3265: CX = DI
L_3267: DI = &H719C
L_326A: FAC! = FAC! + N_719C!  ' RT3F_81
L_326D: AX = BX
L_326F: BX = &H1A
L_3272: FAC! = INT(FAC!)  ' RT3D_03
L_3275: SI = AX
L_3277: BX = DI
L_3279: DI = &H70AA
L_327C: T_12! = FAC!  ' RT3F_71; inline=&H92
L_3280: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_3283: DI = DX
L_3285: FAC! = FAC! * N(DI)  ' RT3F_91
L_3288: DI = CX
L_328A: FAC! = FAC! / N(DI)  ' RT3F_89
L_328D: DI = BX
L_328F: FAC! = FAC! + N(DI)  ' RT3F_81
L_3292: BX = &H1A
L_3295: FAC! = INT(FAC!)  ' RT3D_03
L_3298: CompareLeft! = T_12!: CompareRight! = FAC!  ' RT3F_A5; inline=&H92
L_329C: IF CompareLeft! <> CompareRight! THEN GOTO L_32A1  ' flags from L_3298
L_329E: GOTO L_33F7
L_32A1: BX = &H15
L_32A4: ARGPUSH BX  ' RT3E_42
L_32A7: DX = BX
L_32A9: BX = 3
L_32AC: LOCATE ARGS(), BX  ' RT3E_44
L_32AF: ' PRINT statement begins ; RT3F_BC
L_32B2: CX = BX
L_32B4: BX = 0xA4E0
L_32B7: PRINT S_A4E0$  ' RT3F_6E; H newline item, ledger correction
L_32BA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_32BD: BX = &H16
L_32C0: ARGPUSH BX  ' RT3E_42
L_32C3: SWAP CX, BX
L_32C5: LOCATE ARGS(), BX  ' RT3E_44
L_32C8: ' PRINT statement begins ; RT3F_BC
L_32CB: AX = BX
L_32CD: BX = 0xA4F0
L_32D0: PRINT S_A4F0$  ' RT3F_6E; H newline item, ledger correction
L_32D3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_32D6: BX = &H17
L_32D9: ARGPUSH BX  ' RT3E_42
L_32DC: SWAP BX, AX
L_32DD: LOCATE ARGS(), BX  ' RT3E_44
L_32E0: ' PRINT statement begins ; RT3F_BC
L_32E3: BX = 0xA500
L_32E6: PRINT S_A500$  ' RT3F_6E; H newline item, ledger correction
L_32E9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_32EC: BX = &H18
L_32EF: ARGPUSH BX  ' RT3E_42
L_32F2: BX = 3
L_32F5: LOCATE ARGS(), BX  ' RT3E_44
L_32F8: ' PRINT statement begins ; RT3F_BC
L_32FB: BX = 0xA50A
L_32FE: PRINT S_A50A$;  ' RT3F_6A
L_3301: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3304: BX = 0xFE
L_3307: DX = 0xA0
L_330A: CX = 0
L_330C: AX = CX
L_330E: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_3311: BX = &H4C5A
L_3314: DX = 4
L_3317: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_331A: BX = &H15
L_331D: ARGPUSH BX  ' RT3E_42
L_3320: BX = &H11
L_3323: LOCATE ARGS(), BX  ' RT3E_44
L_3326: ' PRINT statement begins ; RT3F_BC
L_3329: DX = BX
L_332B: BX = 0xA516
L_332E: PRINT S_A516$  ' RT3F_6E; H newline item, ledger correction
L_3331: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3334: BX = &H16
L_3337: ARGPUSH BX  ' RT3E_42
L_333A: BX = DX
L_333C: LOCATE ARGS(), BX  ' RT3E_44
L_333F: ' PRINT statement begins ; RT3F_BC
L_3342: BX = 0xA526
L_3345: PRINT S_A526$  ' RT3F_6E; H newline item, ledger correction
L_3348: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_334B: BX = &H17
L_334E: ARGPUSH BX  ' RT3E_42
L_3351: BX = DX
L_3353: LOCATE ARGS(), BX  ' RT3E_44
L_3356: ' PRINT statement begins ; RT3F_BC
L_3359: BX = 0xA532
L_335C: PRINT S_A532$  ' RT3F_6E; H newline item, ledger correction
L_335F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3362: BX = &H18
L_3365: ARGPUSH BX  ' RT3E_42
L_3368: BX = &H11
L_336B: LOCATE ARGS(), BX  ' RT3E_44
L_336E: ' PRINT statement begins ; RT3F_BC
L_3371: BX = 0xA542
L_3374: PRINT S_A542$;  ' RT3F_6A
L_3377: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_337A: DI = 0xA55A
L_337D: SI = 0xA014
L_3380: N_A55A! = N_A014!  ' RT3F_7B
L_3383: DI = 0xA55E
L_3386: N_A55E! = N_A014!  ' RT3F_7B
L_3389: GOSUB L_1C3B
L_338C: DI = &H71D0
L_338F: SI = &H9F54
L_3392: CompareLeft! = N_9F54!: CompareRight! = N_71D0!  ' RT3F_9F
L_3395: IF CompareLeft! <> CompareRight! THEN GOTO L_339A  ' flags from L_3392
L_3397: GOTO L_3231
L_339A: SI = &H9F54
L_339D: BX = CINT(N_9F54!)  ' RT3F_75
L_33A0: ON BX GOSUB L_337A, L_46D7, L_337A, L_337A, L_46E3, L_337A, L_46FB, L_337A, L_337A, L_46EF, L_337A, L_4736, L_472A, L_47C4, L_4186, L_4729, L_3F42, L_722E, L_4936  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_33CA: DI = 0xA4B2
L_33CD: SI = 0xA4B6
L_33D0: FAC! = N_A4B6! + N_A4B2!  ' RT3F_7F
L_33D3: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_33D6: BX = 0
L_33D9: IF CompareLeft! <> CompareRight! THEN GOTO L_33DC  ' flags from L_33D3
L_33DB: BX = BX - 1
L_33DC: DI = 0xA562
L_33DF: SI = &H9F54
L_33E2: CompareLeft! = N_9F54!: CompareRight! = N_A562!  ' RT3F_9F
L_33E5: DX = 0
L_33E8: IF CompareLeft! = CompareRight! THEN GOTO L_33EB  ' flags from L_33E2
L_33EA: DX = DX - 1
L_33EB: DX = DX AND BX
L_33ED: CompareLeft% = DX: CompareRight% = 0
L_33EF: IF CompareLeft% = CompareRight% THEN GOTO L_33F4  ' flags from L_33ED
L_33F1: GOTO L_3231
L_33F4: GOSUB L_1DAE
L_33F7: DI = &H8B6C
L_33FA: SI = 0xA4CA
L_33FD: FAC! = N_A4CA! * N_8B6C!  ' RT3F_8F
L_3400: BX = DI
L_3402: DI = &H71D8
L_3405: DX = SI
L_3407: FAC! = FAC! / N_71D8!  ' RT3F_89
L_340A: CX = DI
L_340C: DI = &H719C
L_340F: FAC! = FAC! + N_719C!  ' RT3F_81
L_3412: AX = BX
L_3414: BX = &H1A
L_3417: FAC! = INT(FAC!)  ' RT3D_03
L_341A: SI = DX
L_341C: BX = DI
L_341E: DI = &H70AA
L_3421: T_12! = FAC!  ' RT3F_71; inline=&H92
L_3425: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_3428: DI = AX
L_342A: FAC! = FAC! * N(DI)  ' RT3F_91
L_342D: DI = CX
L_342F: FAC! = FAC! / N(DI)  ' RT3F_89
L_3432: DI = BX
L_3434: FAC! = FAC! + N(DI)  ' RT3F_81
L_3437: BX = &H1A
L_343A: FAC! = INT(FAC!)  ' RT3D_03
L_343D: CompareLeft! = T_12!: CompareRight! = FAC!  ' RT3F_A5; inline=&H92
L_3441: IF CompareLeft! <> CompareRight! THEN GOTO L_3446  ' flags from L_343D
L_3443: GOTO L_3CD2
L_3446: DI = &H70AA
L_3449: SI = &H8B2C
L_344C: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_344F: DI = 0xA566
L_3452: N_A566! = FAC!: SI = &H001A  ' RT3F_7D
L_3455: SI = &H8BBC
L_3458: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_345B: GOTO L_3CBF
L_345E: DI = &H8C02
L_3461: SI = &H8BDC
L_3464: N_8C02! = N_8BDC!  ' RT3F_7B
L_3467: DI = &H8C06
L_346A: SI = &H71D4
L_346D: N_8C06! = N_71D4!  ' RT3F_7B
L_3470: GOSUB L_0D2A
L_3473: DI = 0xA56A
L_3476: N_A56A! = FAC!: SI = &H001A  ' RT3F_7D
L_3479: DI = 0xA56E
L_347C: SI = 0xA572
L_347F: N_A56E! = N_A572!  ' RT3F_7B
L_3482: DI = &H6F8A
L_3485: SI = 0xA4CA
L_3488: CompareLeft! = N_A4CA!: CompareRight! = N_6F8A!  ' RT3F_9F
L_348B: BX = 0
L_348E: IF CompareLeft! = CompareRight! THEN GOTO L_3491  ' flags from L_3488
L_3490: BX = BX - 1
L_3491: SI = &H8BDC
L_3494: DX = BX
L_3496: BX = CINT(N_8BDC!)  ' RT3F_75
L_3499: SI = BX
L_349B: SI = SI * (2 ^ 1)
L_349D: SI = SI * (2 ^ 1)
L_349F: BX = SI
L_34A1: SI = SI + &H8934
L_34A5: DI = &H6F4A
L_34A8: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_34AB: CX = 0
L_34AE: IF CompareLeft! >= CompareRight! THEN GOTO L_34B1  ' flags from L_34A8
L_34B0: CX = CX - 1
L_34B1: BX = BX + &H8894
L_34B5: SI = BX
L_34B7: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_34BA: AX = 0
L_34BD: IF CompareLeft! >= CompareRight! THEN GOTO L_34C0  ' flags from L_34B7
L_34BF: AX = AX - 1
L_34C0: AX = AX OR CX
L_34C2: AX = AX AND DX
L_34C4: CompareLeft% = AX: CompareRight% = 0
L_34C6: IF CompareLeft% = CompareRight% THEN GOTO L_34CB  ' flags from L_34C4
L_34C8: GOTO L_3943
L_34CB: DI = 0xA576
L_34CE: SI = &H70AA
L_34D1: N_A576! = N_70AA!  ' RT3F_7B
L_34D4: SI = &H6F8A
L_34D7: FAC! = N_6F8A!: DI = &H001E  ' RT3F_6F
L_34DA: GOTO L_36DC
L_34DD: ' Alignment NOP
L_34DE: DI = &H8C6E
L_34E1: SI = 0xA57A
L_34E4: FAC! = N_A57A! * N_8C6E!  ' RT3F_8F
L_34E7: SI = 0xA56A
L_34EA: FAC! = N_A56A! - FAC!  ' RT3F_9B
L_34ED: DI = 0xA57E
L_34F0: N_A57E! = FAC!: SI = &H001A  ' RT3F_7D
L_34F3: SI = DI
L_34F5: CompareLeft! = N_A57E!: CompareRight! = 0  ' RT3F_A7
L_34F8: IF CompareLeft! < CompareRight! THEN GOTO L_34FD  ' flags from L_34F5
L_34FA: GOTO L_3508
L_34FD: DI = &H8C62
L_3500: FAC! = N(SI) + N_8C62!  ' RT3F_7F
L_3503: DI = SI
L_3505: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3508: SI = &H8BDC
L_350B: BX = CINT(N_8BDC!)  ' RT3F_75
L_350E: DI = BX
L_3510: DI = DI * (2 ^ 1)
L_3512: DI = DI * (2 ^ 1)
L_3514: DI = DI + &H8ABC
L_3518: BX = DI
L_351A: DI = &H8C6E
L_351D: SI = 0xA57E
L_3520: FAC! = N_A57E! + N_8C6E!  ' RT3F_7F
L_3523: DI = &H8C0A
L_3526: FAC! = FAC! / N_8C0A!  ' RT3F_89
L_3529: DX = BX
L_352B: BX = &H1A
L_352E: FAC! = INT(FAC!)  ' RT3D_03
L_3531: DI = DX
L_3533: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3536: SI = DX
L_3538: DI = &H710A
L_353B: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_353E: IF CompareLeft! > CompareRight! THEN GOTO L_3543  ' flags from L_353B
L_3540: GOTO L_3548
L_3543: SWAP SI, DI
L_3545: N(DI) = N(SI)  ' RT3F_7B
L_3548: SI = 0xA57A
L_354B: BX = CINT(N_A57A!)  ' RT3F_75
L_354E: DI = BX
L_3550: DI = DI * (2 ^ 1)
L_3552: DI = DI * (2 ^ 1)
L_3554: DI = DI + &H8AD0
L_3558: SI = &H8BDC
L_355B: BX = CINT(N_8BDC!)  ' RT3F_75
L_355E: SI = BX
L_3560: SI = SI * (2 ^ 1)
L_3562: SI = SI * (2 ^ 1)
L_3564: SI = SI + &H8ABC
L_3568: DX = BX
L_356A: BX = CINT(N(SI))  ' RT3F_75
L_356D: SI = BX
L_356F: DX = DX * (2 ^ 1)
L_3571: DX = DX * (2 ^ 1)
L_3573: SI = SI + DX
L_3575: SI = SI * (2 ^ 1)
L_3577: SI = SI * (2 ^ 1)
L_3579: SI = SI + &H8948
L_357D: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3580: AX = 0
L_3583: IF CompareLeft! <= CompareRight! THEN GOTO L_3586  ' flags from L_357D
L_3585: AX = AX - 1
L_3586: BX = 0xFFD8
L_3589: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_358B: BX = AX
L_358D: FAC! = CSNG(BX)  ' RT3F_57
L_3590: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3593: SI = &H8BDC
L_3596: BX = CINT(N_8BDC!)  ' RT3F_75
L_3599: DI = BX
L_359B: DI = DI * (2 ^ 1)
L_359D: DI = DI * (2 ^ 1)
L_359F: DX = DI
L_35A1: DI = DI + &H8A94
L_35A5: CX = DI
L_35A7: DI = 0xA582
L_35AA: SI = 0xA57E
L_35AD: FAC! = N_A57E! / N_A582!  ' RT3F_87
L_35B0: AX = BX
L_35B2: BX = &H1A
L_35B5: FAC! = INT(FAC!)  ' RT3D_03
L_35B8: DI = CX
L_35BA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_35BD: DX = DX + &H8AA8
L_35C1: SWAP DX, DI
L_35C3: SI = CX
L_35C5: BX = DI
L_35C7: DI = &H6F4A
L_35CA: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_35CD: DI = &H71D4
L_35D0: T_12! = FAC!  ' RT3F_71; inline=&H92
L_35D4: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_35D7: DX = 0
L_35DA: IF CompareLeft! >= CompareRight! THEN GOTO L_35DD  ' flags from L_35D4
L_35DC: DX = DX - 1
L_35DD: CompareLeft% = DX: CompareRight% = 0
L_35DF: IF CompareLeft% >= CompareRight% THEN GOTO L_35E3  ' flags from L_35DD
L_35E1: DX = -DX
L_35E3: SWAP DX, BX
L_35E5: FAC! = CSNG(BX)  ' RT3F_57
L_35E8: FAC! = T_12! * FAC!  ' RT3F_95; inline=&H92
L_35EC: DI = DX
L_35EE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_35F1: SI = 6
L_35F4: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_35F6: SI = AX
L_35F8: SWAP CX, SI
L_35FA: BX = CINT(N(SI))  ' RT3F_75
L_35FD: BX = BX + AX
L_35FF: SI = BX
L_3601: SI = SI * (2 ^ 1)
L_3603: SI = SI * (2 ^ 1)
L_3605: SI = SI + &H8A1C
L_3609: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_360C: BX = 0
L_360F: IF CompareLeft! <= CompareRight! THEN GOTO L_3612  ' flags from L_3609
L_3611: BX = BX - 1
L_3612: CompareLeft% = BX: CompareRight% = 0
L_3614: IF CompareLeft% >= CompareRight% THEN GOTO L_3618  ' flags from L_3612
L_3616: BX = -BX
L_3618: SI = DI
L_361A: DX = BX
L_361C: BX = CINT(N(SI))  ' RT3F_75
L_361F: BX = BX + AX
L_3621: SI = BX
L_3623: SI = SI * (2 ^ 1)
L_3625: SI = SI * (2 ^ 1)
L_3627: SI = SI + &H8A1C
L_362B: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_362E: BX = 0
L_3631: IF CompareLeft! <= CompareRight! THEN GOTO L_3634  ' flags from L_362B
L_3633: BX = BX - 1
L_3634: CompareLeft% = BX: CompareRight% = 0
L_3636: IF CompareLeft% >= CompareRight% THEN GOTO L_363A  ' flags from L_3634
L_3638: BX = -BX
L_363A: BX = BX + DX
L_363C: FAC! = CSNG(BX)  ' RT3F_57
L_363F: DI = &H9EF2
L_3642: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_3645: SI = 0xA57A
L_3648: BX = CINT(N_A57A!)  ' RT3F_75
L_364B: SI = BX
L_364D: SI = SI * (2 ^ 1)
L_364F: SI = SI * (2 ^ 1)
L_3651: SI = SI + &H8AD0
L_3655: SWAP SI, DI
L_3657: BX = SI
L_3659: FAC! = SQR(N_9EF2!)  ' RT3D_3A
L_365C: BX = DI
L_365E: DI = &H71F0
L_3661: FAC! = FAC! * N_71F0!  ' RT3F_91
L_3664: SI = BX
L_3666: FAC! = N(SI) + FAC!  ' RT3F_83
L_3669: BX = &H1A
L_366C: FAC! = INT(FAC!)  ' RT3D_03
L_366F: DI = SI
L_3671: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3674: SI = &H8BDC
L_3677: BX = CINT(N_8BDC!)  ' RT3F_75
L_367A: SI = BX
L_367C: SI = SI * (2 ^ 1)
L_367E: SI = SI * (2 ^ 1)
L_3680: SI = SI + &H89F0
L_3684: DI = 0xA57A
L_3687: CompareLeft! = N(SI): CompareRight! = N_A57A!  ' RT3F_9F
L_368A: BX = 0
L_368D: IF CompareLeft! <> CompareRight! THEN GOTO L_3690  ' flags from L_3687
L_368F: BX = BX - 1
L_3690: DX = DI
L_3692: DI = &H6F8A
L_3695: SI = 0xA4CA
L_3698: CompareLeft! = N_A4CA!: CompareRight! = N_6F8A!  ' RT3F_9F
L_369B: CX = 0
L_369E: IF CompareLeft! <> CompareRight! THEN GOTO L_36A1  ' flags from L_3698
L_36A0: CX = CX - 1
L_36A1: CX = CX AND BX
L_36A3: CompareLeft% = CX: CompareRight% = 0
L_36A5: IF CompareLeft% <> CompareRight% THEN GOTO L_36AA  ' flags from L_36A3
L_36A7: GOTO L_36B5
L_36AA: DI = DX
L_36AC: SI = 0xA586
L_36AF: N(DI) = N_A586!  ' RT3F_7B
L_36B2: GOTO L_36D3
L_36B5: SI = 0xA57A
L_36B8: BX = CINT(N_A57A!)  ' RT3F_75
L_36BB: SI = BX
L_36BD: SI = SI * (2 ^ 1)
L_36BF: SI = SI * (2 ^ 1)
L_36C1: SI = SI + &H8AD0
L_36C5: DI = 0xA56E
L_36C8: CompareLeft! = N(SI): CompareRight! = N_A56E!  ' RT3F_9F
L_36CB: IF CompareLeft! > CompareRight! THEN GOTO L_36D0  ' flags from L_36C8
L_36CD: GOTO L_36D3
L_36D0: N(DI) = N(SI)  ' RT3F_7B
L_36D3: DI = 0xA576
L_36D6: SI = 0xA57A
L_36D9: FAC! = N_A57A! + N_A576!  ' RT3F_7F
L_36DC: DI = 0xA57A
L_36DF: N_A57A! = FAC!: SI = &H001A  ' RT3F_7D
L_36E2: SI = 0xA576
L_36E5: CompareLeft! = N_A576!: CompareRight! = 0  ' RT3F_A7
L_36E8: IF CompareLeft! < CompareRight! THEN GOTO L_36ED  ' flags from L_36E5
L_36EA: GOTO L_36FA
L_36ED: SI = DI
L_36EF: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_36F2: IF CompareLeft! < CompareRight! THEN GOTO L_36F7  ' flags from L_36EF
L_36F4: GOTO L_34DE
L_36F7: GOTO L_3705
L_36FA: SI = 0xA57A
L_36FD: CompareLeft! = N_A57A!: CompareRight! = 0  ' RT3F_A7
L_3700: IF CompareLeft! > CompareRight! THEN GOTO L_3705  ' flags from L_36FD
L_3702: GOTO L_34DE
L_3705: DI = &H6F8A
L_3708: SI = 0xA4CA
L_370B: CompareLeft! = N_A4CA!: CompareRight! = N_6F8A!  ' RT3F_9F
L_370E: IF CompareLeft! <> CompareRight! THEN GOTO L_3713  ' flags from L_370B
L_3710: GOTO L_3CB6
L_3713: SI = &H8BDC
L_3716: BX = CINT(N_8BDC!)  ' RT3F_75
L_3719: SI = BX
L_371B: SI = SI * (2 ^ 1)
L_371D: SI = SI * (2 ^ 1)
L_371F: SI = SI + &H89F0
L_3723: BX = CINT(N(SI))  ' RT3F_75
L_3726: SI = BX
L_3728: SI = SI * (2 ^ 1)
L_372A: SI = SI * (2 ^ 1)
L_372C: SI = SI + &H8AD0
L_3730: DI = 0xA56E
L_3733: CompareLeft! = N(SI): CompareRight! = N_A56E!  ' RT3F_9F
L_3736: IF CompareLeft! <> CompareRight! THEN GOTO L_373B  ' flags from L_3733
L_3738: GOTO L_3943
L_373B: DI = 0xA58A
L_373E: SI = &H71CC
L_3741: N_A58A! = N_71CC!  ' RT3F_7B
L_3744: DI = 0xA58E
L_3747: N_A58E! = N_71CC!  ' RT3F_7B
L_374A: SI = &H8BDC
L_374D: BX = CINT(N_8BDC!)  ' RT3F_75
L_3750: SI = BX
L_3752: SI = SI * (2 ^ 1)
L_3754: SI = SI * (2 ^ 1)
L_3756: SI = SI + &H89F0
L_375A: DI = &H710A
L_375D: FAC! = N(SI) + N_710A!  ' RT3F_7F
L_3760: DI = 0xA592
L_3763: BX = SI
L_3765: N_A592! = FAC!: SI = &H001A  ' RT3F_7D
L_3768: SI = BX
L_376A: DI = &H6F4A
L_376D: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_3770: GOTO L_37CF
L_3773: ' Alignment NOP
L_3774: DI = &H8BF2
L_3777: SI = 0xA57A
L_377A: N_8BF2! = N_A57A!  ' RT3F_7B
L_377D: GOSUB L_0CB1
L_3780: DI = &H9EF2
L_3783: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_3786: SI = DI
L_3788: BX = CINT(N_9EF2!)  ' RT3F_75
L_378B: SI = BX
L_378D: SI = SI * (2 ^ 1)
L_378F: SI = SI * (2 ^ 1)
L_3791: SI = SI + &H8AD0
L_3795: DI = 0xA56E
L_3798: CompareLeft! = N(SI): CompareRight! = N_A56E!  ' RT3F_9F
L_379B: IF CompareLeft! = CompareRight! THEN GOTO L_37A0  ' flags from L_3798
L_379D: GOTO L_37C6
L_37A0: SI = &H8BDC
L_37A3: BX = CINT(N_8BDC!)  ' RT3F_75
L_37A6: DI = BX
L_37A8: DI = DI * (2 ^ 1)
L_37AA: DI = DI * (2 ^ 1)
L_37AC: DI = DI + &H89F0
L_37B0: SI = 0xA57A
L_37B3: FAC! = N_A57A! - N(DI)  ' RT3F_97
L_37B6: DI = 0xA58A
L_37B9: BX = SI
L_37BB: N_A58A! = FAC!: SI = &H001A  ' RT3F_7D
L_37BE: DI = BX
L_37C0: SI = &H71C4
L_37C3: N(DI) = N_71C4!  ' RT3F_7B
L_37C6: DI = &H6F4A
L_37C9: SI = 0xA57A
L_37CC: FAC! = N_A57A! + N_6F4A!  ' RT3F_7F
L_37CF: DI = 0xA57A
L_37D2: N_A57A! = FAC!: SI = &H001A  ' RT3F_7D
L_37D5: SI = DI
L_37D7: DI = 0xA592
L_37DA: CompareLeft! = N_A57A!: CompareRight! = N_A592!  ' RT3F_9F
L_37DD: IF CompareLeft! <= CompareRight! THEN GOTO L_3774  ' flags from L_37DA
L_37DF: SI = &H8BDC
L_37E2: BX = CINT(N_8BDC!)  ' RT3F_75
L_37E5: SI = BX
L_37E7: SI = SI * (2 ^ 1)
L_37E9: SI = SI * (2 ^ 1)
L_37EB: SI = SI + &H89F0
L_37EF: DI = 0xA59E
L_37F2: FAC! = N(SI) + N_A59E!  ' RT3F_7F
L_37F5: DI = 0xA596
L_37F8: BX = SI
L_37FA: N_A596! = FAC!: SI = &H001A  ' RT3F_7D
L_37FD: DI = 0xA59A
L_3800: SI = &H70AA
L_3803: N_A59A! = N_70AA!  ' RT3F_7B
L_3806: DI = SI
L_3808: SWAP BX, SI
L_380A: FAC! = N(SI) + N_70AA!  ' RT3F_7F
L_380D: GOTO L_386B
L_3810: DI = &H8BF2
L_3813: SI = 0xA57A
L_3816: N_8BF2! = N_A57A!  ' RT3F_7B
L_3819: GOSUB L_0CB1
L_381C: DI = &H9EF2
L_381F: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_3822: SI = DI
L_3824: BX = CINT(N_9EF2!)  ' RT3F_75
L_3827: SI = BX
L_3829: SI = SI * (2 ^ 1)
L_382B: SI = SI * (2 ^ 1)
L_382D: SI = SI + &H8AD0
L_3831: DI = 0xA56E
L_3834: CompareLeft! = N(SI): CompareRight! = N_A56E!  ' RT3F_9F
L_3837: IF CompareLeft! = CompareRight! THEN GOTO L_383C  ' flags from L_3834
L_3839: GOTO L_3862
L_383C: SI = &H8BDC
L_383F: BX = CINT(N_8BDC!)  ' RT3F_75
L_3842: SI = BX
L_3844: SI = SI * (2 ^ 1)
L_3846: SI = SI * (2 ^ 1)
L_3848: SI = SI + &H89F0
L_384C: DI = 0xA57A
L_384F: FAC! = N(SI) - N_A57A!  ' RT3F_97
L_3852: BX = DI
L_3854: DI = 0xA58E
L_3857: N_A58E! = FAC!: SI = &H001A  ' RT3F_7D
L_385A: DI = BX
L_385C: SI = 0xA1B6
L_385F: N(DI) = N_A1B6!  ' RT3F_7B
L_3862: DI = 0xA59A
L_3865: SI = 0xA57A
L_3868: FAC! = N_A57A! + N_A59A!  ' RT3F_7F
L_386B: DI = 0xA57A
L_386E: N_A57A! = FAC!: SI = &H001A  ' RT3F_7D
L_3871: SI = 0xA59A
L_3874: CompareLeft! = N_A59A!: CompareRight! = 0  ' RT3F_A7
L_3877: IF CompareLeft! < CompareRight! THEN GOTO L_387C  ' flags from L_3874
L_3879: GOTO L_3889
L_387C: SI = DI
L_387E: DI = 0xA596
L_3881: CompareLeft! = N(SI): CompareRight! = N_A596!  ' RT3F_9F
L_3884: IF CompareLeft! >= CompareRight! THEN GOTO L_3810  ' flags from L_3881
L_3886: GOTO L_3897
L_3889: DI = 0xA596
L_388C: SI = 0xA57A
L_388F: CompareLeft! = N_A57A!: CompareRight! = N_A596!  ' RT3F_9F
L_3892: IF CompareLeft! > CompareRight! THEN GOTO L_3897  ' flags from L_388F
L_3894: GOTO L_3810
L_3897: SI = &H8BDC
L_389A: BX = CINT(N_8BDC!)  ' RT3F_75
L_389D: SI = BX
L_389F: SI = SI * (2 ^ 1)
L_38A1: SI = SI * (2 ^ 1)
L_38A3: BX = SI
L_38A5: SI = SI + &H8934
L_38A9: DI = &H6F4A
L_38AC: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_38AF: DX = 0
L_38B2: IF CompareLeft! >= CompareRight! THEN GOTO L_38B5  ' flags from L_38AC
L_38B4: DX = DX - 1
L_38B5: BX = BX + &H8894
L_38B9: SI = BX
L_38BB: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_38BE: CX = 0
L_38C1: IF CompareLeft! >= CompareRight! THEN GOTO L_38C4  ' flags from L_38BB
L_38C3: CX = CX - 1
L_38C4: CX = CX OR DX
L_38C6: CompareLeft% = CX: CompareRight% = 0
L_38C8: IF CompareLeft% = CompareRight% THEN GOTO L_38CD  ' flags from L_38C6
L_38CA: GOTO L_3943
L_38CD: DI = 0xA4B6
L_38D0: SI = &H6F4A
L_38D3: N_A4B6! = N_6F4A!  ' RT3F_7B
L_38D6: DI = 0xA58E
L_38D9: BX = SI
L_38DB: SI = 0xA58A
L_38DE: CompareLeft! = N_A58A!: CompareRight! = N_A58E!  ' RT3F_9F
L_38E1: IF CompareLeft! <= CompareRight! THEN GOTO L_38E6  ' flags from L_38DE
L_38E3: GOTO L_3914
L_38E6: SI = &H8BDC
L_38E9: DX = BX
L_38EB: BX = CINT(N_8BDC!)  ' RT3F_75
L_38EE: DI = BX
L_38F0: DI = DI * (2 ^ 1)
L_38F2: DI = DI * (2 ^ 1)
L_38F4: DI = DI + &H89F0
L_38F8: SWAP DX, DI
L_38FA: SI = DX
L_38FC: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_38FF: DI = &H8BF2
L_3902: N_8BF2! = FAC!: SI = &H001A  ' RT3F_7D
L_3905: WORD(BP - &H10) = DX
L_3908: GOSUB L_0CB1
L_390B: DI = WORD(BP - &H10)
L_390E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3911: GOTO L_3940
L_3914: SI = &H8BDC
L_3917: BX = CINT(N_8BDC!)  ' RT3F_75
L_391A: DI = BX
L_391C: DI = DI * (2 ^ 1)
L_391E: DI = DI * (2 ^ 1)
L_3920: DI = DI + &H89F0
L_3924: SI = DI
L_3926: DI = &H70AA
L_3929: FAC! = N(SI) + N_70AA!  ' RT3F_7F
L_392C: DI = &H8BF2
L_392F: BX = SI
L_3931: N_8BF2! = FAC!: SI = &H001A  ' RT3F_7D
L_3934: WORD(BP - &H10) = BX
L_3937: GOSUB L_0CB1
L_393A: DI = WORD(BP - &H10)
L_393D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3940: GOTO L_3CB6
L_3943: SI = &H8BDC
L_3946: BX = CINT(N_8BDC!)  ' RT3F_75
L_3949: SI = BX
L_394B: SI = SI * (2 ^ 1)
L_394D: SI = SI * (2 ^ 1)
L_394F: BX = SI
L_3951: SI = SI + &H8920
L_3955: DI = &H6F4A
L_3958: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_395B: DX = 0
L_395E: IF CompareLeft! >= CompareRight! THEN GOTO L_3961  ' flags from L_3958
L_3960: DX = DX - 1
L_3961: CX = BX
L_3963: BX = BX + &H89AC
L_3967: SI = BX
L_3969: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_396C: AX = 0
L_396F: IF CompareLeft! >= CompareRight! THEN GOTO L_3972  ' flags from L_3969
L_3971: AX = AX - 1
L_3972: AX = AX OR DX
L_3974: CX = CX + &H8894
L_3978: SI = CX
L_397A: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_397D: BX = 0
L_3980: IF CompareLeft! >= CompareRight! THEN GOTO L_3983  ' flags from L_397A
L_3982: BX = BX - 1
L_3983: BX = BX OR AX
L_3985: CompareLeft% = BX: CompareRight% = 0
L_3987: IF CompareLeft% = CompareRight% THEN GOTO L_398C  ' flags from L_3985
L_3989: GOTO L_3CB6
L_398C: DI = 0xA56E
L_398F: SI = 0xA5A6
L_3992: N_A56E! = N_A5A6!  ' RT3F_7B
L_3995: DI = 0xA5A2
L_3998: SI = &H71CC
L_399B: N_A5A2! = N_71CC!  ' RT3F_7B
L_399E: SI = &H8BDC
L_39A1: BX = CINT(N_8BDC!)  ' RT3F_75
L_39A4: SI = BX
L_39A6: SI = SI * (2 ^ 1)
L_39A8: SI = SI * (2 ^ 1)
L_39AA: BX = SI
L_39AC: SI = SI + &H8A08
L_39B0: DI = &H710A
L_39B3: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_39B6: AX = 0
L_39B9: IF CompareLeft! <> CompareRight! THEN GOTO L_39BC  ' flags from L_39B3
L_39BB: AX = AX - 1
L_39BC: DX = &H3E8
L_39BF: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_39C1: DX = 6
L_39C4: CX = DX
L_39C6: DX = DX - AX
L_39C8: AX = DI
L_39CA: DI = &H6F54
L_39CD: SI = &H8B78
L_39D0: CompareLeft! = N_8B78!: CompareRight! = N_6F54!  ' RT3F_9F
L_39D3: WORD(BP - &H10) = DX
L_39D6: DX = 0
L_39D9: IF CompareLeft! <> CompareRight! THEN GOTO L_39DC  ' flags from L_39D0
L_39DB: DX = DX - 1
L_39DC: SWAP DX, AX
L_39DD: DX = 3
L_39E0: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_39E2: AX = AX + WORD(BP - &H10)
L_39E5: SWAP BX, AX
L_39E6: FAC! = CSNG(BX)  ' RT3F_57
L_39E9: DI = 0xA5AA
L_39EC: BX = SI
L_39EE: N_A5AA! = FAC!: SI = &H001A  ' RT3F_7D
L_39F1: SI = BX
L_39F3: DI = &H710A
L_39F6: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_39F9: DX = 0
L_39FC: IF CompareLeft! <> CompareRight! THEN GOTO L_39FF  ' flags from L_39F6
L_39FE: DX = DX - 1
L_39FF: DX = DX * (2 ^ 1)
L_3A01: DX = DX * (2 ^ 1)
L_3A03: DX = DX + CX
L_3A05: BX = DX
L_3A07: FAC! = CSNG(BX)  ' RT3F_57
L_3A0A: DI = 0xA5AE
L_3A0D: N_A5AE! = FAC!: SI = &H001A  ' RT3F_7D
L_3A10: BX = AX
L_3A12: AX = AX + &H89C0
L_3A15: SI = AX
L_3A17: DI = 0xA5B2
L_3A1A: N_A5B2! = N(SI)  ' RT3F_7B
L_3A1D: BX = BX + &H89D8
L_3A21: SI = BX
L_3A23: DI = 0xA5B6
L_3A26: N_A5B6! = N(SI)  ' RT3F_7B
L_3A29: SI = &H6F82
L_3A2C: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_3A2F: GOTO L_3C3F
L_3A32: SI = &H8BDC
L_3A35: BX = SI
L_3A37: DX = BX
L_3A39: BX = CINT(N_8BDC!)  ' RT3F_75
L_3A3C: DI = BX
L_3A3E: DI = DI * (2 ^ 1)
L_3A40: DI = DI * (2 ^ 1)
L_3A42: BX = DI
L_3A44: DI = DI + &H89C0
L_3A48: SI = 0xA5BA
L_3A4B: CX = BX
L_3A4D: BX = CINT(N_A5BA!)  ' RT3F_75
L_3A50: SI = BX
L_3A52: SI = SI * (2 ^ 1)
L_3A54: SI = SI * (2 ^ 1)
L_3A56: BX = SI
L_3A58: SI = SI + &H8C16
L_3A5C: AX = DI
L_3A5E: DI = 0xA5B2
L_3A61: FAC! = N(SI) + N_A5B2!  ' RT3F_7F
L_3A64: DI = AX
L_3A66: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3A69: CX = CX + &H89D8
L_3A6D: DI = CX
L_3A6F: AX = BX
L_3A71: BX = BX + &H8C2A
L_3A75: SI = BX
L_3A77: DI = 0xA5B6
L_3A7A: FAC! = N(SI) + N_A5B6!  ' RT3F_7F
L_3A7D: DI = CX
L_3A7F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3A82: AX = AX + &H8AD0
L_3A85: DI = AX
L_3A87: SI = DX
L_3A89: DI = &H8BFA
L_3A8C: N_8BFA! = N(SI)  ' RT3F_7B
L_3A8F: DI = &H8BFE
L_3A92: SI = &H71D4
L_3A95: N_8BFE! = N_71D4!  ' RT3F_7B
L_3A98: WORD(BP - &H10) = AX
L_3A9B: GOSUB L_0CD1
L_3A9E: DI = 0xA5AA
L_3AA1: FAC! = FAC! - N_A5AA!  ' RT3F_99
L_3AA4: DI = &H6F54
L_3AA7: FAC! = FAC! ^ N_6F54!  ' RT3F_25; M ledger
L_3AAA: DI = &H8BD8
L_3AAD: FAC! = FAC! * N_8BD8!  ' RT3F_91
L_3AB0: DI = WORD(BP - &H10)
L_3AB3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3AB6: SI = &H8BDC
L_3AB9: BX = CINT(N_8BDC!)  ' RT3F_75
L_3ABC: SI = BX
L_3ABE: SI = SI * (2 ^ 1)
L_3AC0: SI = SI * (2 ^ 1)
L_3AC2: BX = SI
L_3AC4: SI = SI + &H89C0
L_3AC8: DI = &H89D4
L_3ACB: FAC! = N(SI) - N_89D4!  ' RT3F_97
L_3ACE: FAC! = ABS(FAC!)  ' RT3F_2D
L_3AD1: DI = 0xA5BE
L_3AD4: N_A5BE! = FAC!: SI = &H001A  ' RT3F_7D
L_3AD7: BX = BX + &H89D8
L_3ADB: SI = BX
L_3ADD: DX = DI
L_3ADF: DI = &H89EC
L_3AE2: FAC! = N(SI) - N_89EC!  ' RT3F_97
L_3AE5: FAC! = ABS(FAC!)  ' RT3F_2D
L_3AE8: DI = 0xA5C2
L_3AEB: N_A5C2! = FAC!: SI = &H001A  ' RT3F_7D
L_3AEE: SI = DX
L_3AF0: DI = &H71D8
L_3AF3: CompareLeft! = N(SI): CompareRight! = N_71D8!  ' RT3F_9F
L_3AF6: IF CompareLeft! > CompareRight! THEN GOTO L_3AFB  ' flags from L_3AF3
L_3AF8: GOTO L_3B25
L_3AFB: SI = 0xA5BA
L_3AFE: BX = CINT(N_A5BA!)  ' RT3F_75
L_3B01: DI = BX
L_3B03: DI = DI * (2 ^ 1)
L_3B05: DI = DI * (2 ^ 1)
L_3B07: DI = DI + &H8AD0
L_3B0B: SI = DX
L_3B0D: BX = DI
L_3B0F: DI = 0xA5C6
L_3B12: FAC! = N(SI) * N_A5C6!  ' RT3F_8F
L_3B15: SI = BX
L_3B17: FAC! = N(SI) + FAC!  ' RT3F_83
L_3B1A: DI = 0xA5CA
L_3B1D: FAC! = FAC! + N_A5CA!  ' RT3F_81
L_3B20: DI = BX
L_3B22: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3B25: DI = &H71D8
L_3B28: SI = 0xA5C2
L_3B2B: CompareLeft! = N_A5C2!: CompareRight! = N_71D8!  ' RT3F_9F
L_3B2E: IF CompareLeft! > CompareRight! THEN GOTO L_3B33  ' flags from L_3B2B
L_3B30: GOTO L_3B61
L_3B33: BX = SI
L_3B35: SI = 0xA5BA
L_3B38: DX = BX
L_3B3A: BX = CINT(N_A5BA!)  ' RT3F_75
L_3B3D: DI = BX
L_3B3F: DI = DI * (2 ^ 1)
L_3B41: DI = DI * (2 ^ 1)
L_3B43: DI = DI + &H8AD0
L_3B47: SI = DX
L_3B49: BX = DI
L_3B4B: DI = 0xA5C6
L_3B4E: FAC! = N(SI) * N_A5C6!  ' RT3F_8F
L_3B51: SI = BX
L_3B53: FAC! = N(SI) + FAC!  ' RT3F_83
L_3B56: DI = 0xA5CA
L_3B59: FAC! = FAC! + N_A5CA!  ' RT3F_81
L_3B5C: DI = BX
L_3B5E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3B61: DI = &H70AA
L_3B64: SI = &H8B2C
L_3B67: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_3B6A: DI = 0xA5CE
L_3B6D: N_A5CE! = FAC!: SI = &H001A  ' RT3F_7D
L_3B70: SI = &H8BBC
L_3B73: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_3B76: GOTO L_3BF9
L_3B79: ' Alignment NOP
L_3B7A: DI = &H8BDC
L_3B7D: SI = 0xA5D2
L_3B80: CompareLeft! = N_A5D2!: CompareRight! = N_8BDC!  ' RT3F_9F
L_3B83: IF CompareLeft! <> CompareRight! THEN GOTO L_3B88  ' flags from L_3B80
L_3B85: GOTO L_3BF0
L_3B88: SWAP DI, SI
L_3B8A: BX = DI
L_3B8C: DI = &H8BFA
L_3B8F: N_8BFA! = N(SI)  ' RT3F_7B
L_3B92: SI = BX
L_3B94: DI = &H8BFE
L_3B97: N_8BFE! = N(SI)  ' RT3F_7B
L_3B9A: GOSUB L_0CD1
L_3B9D: DI = 0xA5D6
L_3BA0: N_A5D6! = FAC!: SI = &H001A  ' RT3F_7D
L_3BA3: SI = 0xA5BA
L_3BA6: BX = CINT(N_A5BA!)  ' RT3F_75
L_3BA9: SI = BX
L_3BAB: SI = SI * (2 ^ 1)
L_3BAD: SI = SI * (2 ^ 1)
L_3BAF: SI = SI + &H8AD0
L_3BB3: SWAP SI, DI
L_3BB5: BX = DI
L_3BB7: DI = 0xA280
L_3BBA: CompareLeft! = N_A5D6!: CompareRight! = N_A280!  ' RT3F_9F
L_3BBD: AX = 0
L_3BC0: IF CompareLeft! >= CompareRight! THEN GOTO L_3BC3  ' flags from L_3BBA
L_3BC2: AX = AX - 1
L_3BC3: DX = &H2710
L_3BC6: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_3BC8: SWAP BX, AX
L_3BC9: FAC! = CSNG(BX)  ' RT3F_57
L_3BCC: SWAP SI, AX
L_3BCD: FAC! = N(SI) - FAC!  ' RT3F_9B
L_3BD0: SWAP SI, AX
L_3BD1: DI = 0xA5AE
L_3BD4: T_12! = FAC!  ' RT3F_71; inline=&H92
L_3BD8: FAC! = N(SI) - N(DI)  ' RT3F_97
L_3BDB: DI = &H6F54
L_3BDE: FAC! = FAC! ^ N_6F54!  ' RT3F_25; M ledger
L_3BE1: DI = &H710A
L_3BE4: FAC! = FAC! * N_710A!  ' RT3F_91
L_3BE7: FAC! = T_12! + FAC!  ' RT3F_85; inline=&H92
L_3BEB: DI = AX
L_3BED: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3BF0: DI = &H6F4A
L_3BF3: SI = 0xA5D2
L_3BF6: FAC! = N_A5D2! + N_6F4A!  ' RT3F_7F
L_3BF9: DI = 0xA5D2
L_3BFC: N_A5D2! = FAC!: SI = &H001A  ' RT3F_7D
L_3BFF: SI = DI
L_3C01: DI = 0xA5CE
L_3C04: CompareLeft! = N_A5D2!: CompareRight! = N_A5CE!  ' RT3F_9F
L_3C07: IF CompareLeft! > CompareRight! THEN GOTO L_3C0C  ' flags from L_3C04
L_3C09: GOTO L_3B7A
L_3C0C: SI = 0xA5BA
L_3C0F: BX = SI
L_3C11: DX = BX
L_3C13: BX = CINT(N_A5BA!)  ' RT3F_75
L_3C16: SI = BX
L_3C18: SI = SI * (2 ^ 1)
L_3C1A: SI = SI * (2 ^ 1)
L_3C1C: SI = SI + &H8AD0
L_3C20: DI = 0xA56E
L_3C23: CompareLeft! = N(SI): CompareRight! = N_A56E!  ' RT3F_9F
L_3C26: IF CompareLeft! < CompareRight! THEN GOTO L_3C2B  ' flags from L_3C23
L_3C28: GOTO L_3C36
L_3C2B: N(DI) = N(SI)  ' RT3F_7B
L_3C2E: SI = DX
L_3C30: DI = 0xA5A2
L_3C33: N_A5A2! = N(SI)  ' RT3F_7B
L_3C36: DI = &H6F4A
L_3C39: SI = 0xA5BA
L_3C3C: FAC! = N_A5BA! + N_6F4A!  ' RT3F_7F
L_3C3F: DI = 0xA5BA
L_3C42: N_A5BA! = FAC!: SI = &H001A  ' RT3F_7D
L_3C45: SI = DI
L_3C47: DI = &H71CC
L_3C4A: CompareLeft! = N_A5BA!: CompareRight! = N_71CC!  ' RT3F_9F
L_3C4D: IF CompareLeft! > CompareRight! THEN GOTO L_3C52  ' flags from L_3C4A
L_3C4F: GOTO L_3A32
L_3C52: DI = &H71CC
L_3C55: SI = 0xA5A2
L_3C58: CompareLeft! = N_A5A2!: CompareRight! = N_71CC!  ' RT3F_9F
L_3C5B: IF CompareLeft! <> CompareRight! THEN GOTO L_3C60  ' flags from L_3C58
L_3C5D: GOTO L_3CB6
L_3C60: DI = 0xA4B2
L_3C63: BX = SI
L_3C65: SI = &H6F4A
L_3C68: N_A4B2! = N_6F4A!  ' RT3F_7B
L_3C6B: SI = &H8BDC
L_3C6E: DX = BX
L_3C70: BX = CINT(N_8BDC!)  ' RT3F_75
L_3C73: DI = BX
L_3C75: DI = DI * (2 ^ 1)
L_3C77: DI = DI * (2 ^ 1)
L_3C79: BX = DI
L_3C7B: DI = DI + &H89C0
L_3C7F: SI = DX
L_3C81: CX = BX
L_3C83: BX = CINT(N(SI))  ' RT3F_75
L_3C86: SI = BX
L_3C88: SI = SI * (2 ^ 1)
L_3C8A: SI = SI * (2 ^ 1)
L_3C8C: BX = SI
L_3C8E: SI = SI + &H8C16
L_3C92: DX = DI
L_3C94: DI = 0xA5B2
L_3C97: FAC! = N(SI) + N_A5B2!  ' RT3F_7F
L_3C9A: DI = DX
L_3C9C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3C9F: CX = CX + &H89D8
L_3CA3: DI = CX
L_3CA5: BX = BX + &H8C2A
L_3CA9: SI = BX
L_3CAB: DI = 0xA5B6
L_3CAE: FAC! = N(SI) + N_A5B6!  ' RT3F_7F
L_3CB1: DI = CX
L_3CB3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3CB6: DI = &H6F4A
L_3CB9: SI = &H8BDC
L_3CBC: FAC! = N_8BDC! + N_6F4A!  ' RT3F_7F
L_3CBF: DI = &H8BDC
L_3CC2: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_3CC5: SI = DI
L_3CC7: DI = 0xA566
L_3CCA: CompareLeft! = N_8BDC!: CompareRight! = N_A566!  ' RT3F_9F
L_3CCD: IF CompareLeft! > CompareRight! THEN GOTO L_3CD2  ' flags from L_3CCA
L_3CCF: GOTO L_345E
L_3CD2: DI = 0xA1BE
L_3CD5: SI = &H89D4
L_3CD8: FAC! = N_89D4! + N_A1BE!  ' RT3F_7F
L_3CDB: DI = 0xA55A
L_3CDE: N_A55A! = FAC!: SI = &H001A  ' RT3F_7D
L_3CE1: BX = DI
L_3CE3: DI = 0xA3A8
L_3CE6: SI = &H89EC
L_3CE9: FAC! = N_89EC! + N_A3A8!  ' RT3F_7F
L_3CEC: DI = 0xA55E
L_3CEF: N_A55E! = FAC!: SI = &H001A  ' RT3F_7D
L_3CF2: SI = BX
L_3CF4: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3CF7: DX = 0
L_3CFA: IF CompareLeft! = CompareRight! THEN GOTO L_3CFD  ' flags from L_3CF4
L_3CFC: DX = DX - 1
L_3CFD: SI = DI
L_3CFF: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7

```

### Docking and movement resolution

```basic
L_3D02: BX = 0
L_3D05: IF CompareLeft! = CompareRight! THEN GOTO L_3D08  ' flags from L_3CFF
L_3D07: BX = BX - 1
L_3D08: BX = BX OR DX
L_3D0A: CompareLeft% = BX: CompareRight% = 0
L_3D0C: IF CompareLeft% <> CompareRight% THEN GOTO L_3D11  ' flags from L_3D0A
L_3D0E: GOTO L_3D68
L_3D11: SI = 0xA5DA
L_3D14: FAC! = N_A5DA!: DI = &H001E  ' RT3F_6F
L_3D17: GOTO L_3D58
L_3D1A: SI = &H710E
L_3D1D: BX = SI
L_3D1F: DX = BX
L_3D21: BX = CINT(N_710E!)  ' RT3F_75
L_3D24: DI = BX
L_3D26: DI = DI * (2 ^ 1)
L_3D28: DI = DI * (2 ^ 1)
L_3D2A: BX = DI
L_3D2C: DI = DI + &H89C0
L_3D30: SI = DI
L_3D32: DI = 0xA55A
L_3D35: FAC! = N(SI) - N_A55A!  ' RT3F_97
L_3D38: DI = SI
L_3D3A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3D3D: BX = BX + &H89D8
L_3D41: DI = BX
L_3D43: SI = BX
L_3D45: DI = 0xA55E
L_3D48: FAC! = N(SI) - N_A55E!  ' RT3F_97
L_3D4B: DI = BX
L_3D4D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3D50: SI = DX
L_3D52: DI = &H6F4A
L_3D55: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_3D58: DI = &H710E
L_3D5B: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_3D5E: SI = DI
L_3D60: DI = &H71D4
L_3D63: CompareLeft! = N_710E!: CompareRight! = N_71D4!  ' RT3F_9F
L_3D66: IF CompareLeft! <= CompareRight! THEN GOTO L_3D1A  ' flags from L_3D63
L_3D68: SI = 0xA5DE
L_3D6B: CompareLeft! = N_A5DE!: CompareRight! = 0  ' RT3F_A7
L_3D6E: BX = 0
L_3D71: IF CompareLeft! <> CompareRight! THEN GOTO L_3D74  ' flags from L_3D6B
L_3D73: BX = BX - 1
L_3D74: DI = 0xA4B2
L_3D77: SI = 0xA4B6
L_3D7A: FAC! = N_A4B6! + N_A4B2!  ' RT3F_7F
L_3D7D: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_3D80: DX = 0
L_3D83: IF CompareLeft! <= CompareRight! THEN GOTO L_3D86  ' flags from L_3D7D
L_3D85: DX = DX - 1
L_3D86: DX = DX AND BX
L_3D88: CompareLeft% = DX: CompareRight% = 0
L_3D8A: IF CompareLeft% <> CompareRight% THEN GOTO L_3D8F  ' flags from L_3D88
L_3D8C: GOTO L_3D95
L_3D8F: GOSUB L_4186
L_3D92: GOTO L_3DBC
L_3D95: DI = &H6F4A
L_3D98: SI = 0xA5DE
L_3D9B: CompareLeft! = N_A5DE!: CompareRight! = N_6F4A!  ' RT3F_9F
L_3D9E: BX = 0
L_3DA1: IF CompareLeft! <> CompareRight! THEN GOTO L_3DA4  ' flags from L_3D9B
L_3DA3: BX = BX - 1
L_3DA4: SI = 0xA4B2
L_3DA7: CompareLeft! = N_A4B2!: CompareRight! = 0  ' RT3F_A7
L_3DAA: DX = 0
L_3DAD: IF CompareLeft! <= CompareRight! THEN GOTO L_3DB0  ' flags from L_3DA7
L_3DAF: DX = DX - 1
L_3DB0: DX = DX AND BX
L_3DB2: CompareLeft% = DX: CompareRight% = 0
L_3DB4: IF CompareLeft% <> CompareRight% THEN GOTO L_3DB9  ' flags from L_3DB2
L_3DB6: GOTO L_3DBC
L_3DB9: GOSUB L_4469
L_3DBC: DI = &H6F4A
L_3DBF: SI = 0xA4CA
L_3DC2: FAC! = N_A4CA! + N_6F4A!  ' RT3F_7F
L_3DC5: DI = 0xA4CA
L_3DC8: N_A4CA! = FAC!: SI = &H001A  ' RT3F_7D
L_3DCB: SI = DI
L_3DCD: DI = &H6F8A
L_3DD0: CompareLeft! = N_A4CA!: CompareRight! = N_6F8A!  ' RT3F_9F
L_3DD3: IF CompareLeft! > CompareRight! THEN GOTO L_3DD8  ' flags from L_3DD0
L_3DD5: GOTO L_320E
L_3DD8: GOSUB L_2925
L_3DDB: DI = &H6F4A
L_3DDE: SI = 0xA05E
L_3DE1: CompareLeft! = N_A05E!: CompareRight! = N_6F4A!  ' RT3F_9F
L_3DE4: IF CompareLeft! = CompareRight! THEN GOTO L_3DE9  ' flags from L_3DE1
L_3DE6: GOTO L_49E9
L_3DE9: DI = &H70AA
L_3DEC: SI = &H8B2C
L_3DEF: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_3DF2: DI = 0xA5E2
L_3DF5: N_A5E2! = FAC!: SI = &H001A  ' RT3F_7D
L_3DF8: SI = &H8BBC
L_3DFB: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_3DFE: GOTO L_3F2C
L_3E01: ' Alignment NOP
L_3E02: SI = &H710E
L_3E05: BX = CINT(N_710E!)  ' RT3F_75
L_3E08: SI = BX
L_3E0A: SI = SI * (2 ^ 1)
L_3E0C: SI = SI * (2 ^ 1)
L_3E0E: BX = SI
L_3E10: SI = SI + &H8A08
L_3E14: DI = &H6F54
L_3E17: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_3E1A: DX = 0
L_3E1D: IF CompareLeft! > CompareRight! THEN GOTO L_3E20  ' flags from L_3E17
L_3E1F: DX = DX - 1
L_3E20: CX = BX
L_3E22: BX = BX + &H89D8
L_3E26: SI = BX
L_3E28: DI = &H89EC
L_3E2B: FAC! = N(SI) - N_89EC!  ' RT3F_97
L_3E2E: FAC! = ABS(FAC!)  ' RT3F_2D
L_3E31: DI = &H6F4A
L_3E34: CompareLeft! = FAC!: CompareRight! = N_6F4A!  ' RT3F_A1
L_3E37: BX = 0
L_3E3A: IF CompareLeft! <= CompareRight! THEN GOTO L_3E3D  ' flags from L_3E34
L_3E3C: BX = BX - 1
L_3E3D: BX = BX OR DX
L_3E3F: CX = CX + &H89C0
L_3E43: SI = CX
L_3E45: DX = DI
L_3E47: DI = &H89D4
L_3E4A: FAC! = N(SI) - N_89D4!  ' RT3F_97
L_3E4D: FAC! = ABS(FAC!)  ' RT3F_2D
L_3E50: DI = DX
L_3E52: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_3E55: CX = 0
L_3E58: IF CompareLeft! <= CompareRight! THEN GOTO L_3E5B  ' flags from L_3E52
L_3E5A: CX = CX - 1
L_3E5B: CX = CX OR BX
L_3E5D: CompareLeft% = CX: CompareRight% = 0
L_3E5F: IF CompareLeft% = CompareRight% THEN GOTO L_3E64  ' flags from L_3E5D
L_3E61: GOTO L_3F23
L_3E64: GOSUB L_1D8C
L_3E67: BX = &H14
L_3E6A: ARGPUSH BX  ' RT3E_42
L_3E6D: BX = 3
L_3E70: LOCATE ARGS(), BX  ' RT3E_44
L_3E73: ' PRINT statement begins ; RT3F_BC
L_3E76: DX = BX
L_3E78: BX = 0xA5E6
L_3E7B: PRINT S_A5E6$  ' RT3F_6E; H newline item, ledger correction
L_3E7E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3E81: BX = &H15
L_3E84: ARGPUSH BX  ' RT3E_42
L_3E87: BX = DX
L_3E89: LOCATE ARGS(), BX  ' RT3E_44
L_3E8C: ' PRINT statement begins ; RT3F_BC
L_3E8F: BX = &H8B28
L_3E92: PRINT S_8B28$;  ' RT3F_6A
L_3E95: BX = 0xA618
L_3E98: PRINT S_A618$  ' RT3F_6E; H newline item, ledger correction
L_3E9B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3E9E: BX = &H18
L_3EA1: ARGPUSH BX  ' RT3E_42
L_3EA4: BX = DX
L_3EA6: LOCATE ARGS(), BX  ' RT3E_44
L_3EA9: ' PRINT statement begins ; RT3F_BC
L_3EAC: BX = 0xA5FE
L_3EAF: PRINT S_A5FE$;  ' RT3F_6A
L_3EB2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3EB5: GOSUB L_1FD6
L_3EB8: SI = &H71B4
L_3EBB: CompareLeft! = N_71B4!: CompareRight! = 0  ' RT3F_A7
L_3EBE: IF CompareLeft! <> CompareRight! THEN GOTO L_3EC3  ' flags from L_3EBB
L_3EC0: GOTO L_3F23
L_3EC3: SI = &H710E
L_3EC6: BX = CINT(N_710E!)  ' RT3F_75
L_3EC9: SI = BX
L_3ECB: SI = SI * (2 ^ 1)
L_3ECD: SI = SI * (2 ^ 1)
L_3ECF: BX = SI
L_3ED1: SI = SI + &H89AC
L_3ED5: DI = &H3BB8
L_3ED8: N_3BB8! = N(SI)  ' RT3F_7B
L_3EDB: DX = BX
L_3EDD: BX = BX + &H8A08
L_3EE1: DI = BX
L_3EE3: SI = &H71D4
L_3EE6: N(DI) = N_71D4!  ' RT3F_7B
L_3EE9: DI = &H3B20
L_3EEC: SI = &H8BD8
L_3EEF: N_3B20! = N_8BD8!  ' RT3F_7B
L_3EF2: DI = &H3B24
L_3EF5: BX = SI
L_3EF7: SI = 0xA572
L_3EFA: N_3B24! = N_A572!  ' RT3F_7B
L_3EFD: SI = BX
L_3EFF: DI = &H3B78
L_3F02: N_3B78! = N_8BD8!  ' RT3F_7B
L_3F05: DX = DX + &H8894
L_3F09: SI = DX
L_3F0B: DI = &H3B7C
L_3F0E: N_3B7C! = N(SI)  ' RT3F_7B
L_3F11: DI = &H3B80
L_3F14: SI = &H6F4A
L_3F17: N_3B80! = N_6F4A!  ' RT3F_7B
L_3F1A: DI = &H9EA2
L_3F1D: N_9EA2! = N_6F4A!  ' RT3F_7B
L_3F20: GOTO L_2C31
L_3F23: DI = &H6F4A
L_3F26: SI = &H710E
L_3F29: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_3F2C: DI = &H710E
L_3F2F: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_3F32: SI = DI
L_3F34: DI = 0xA5E2
L_3F37: CompareLeft! = N_710E!: CompareRight! = N_A5E2!  ' RT3F_9F
L_3F3A: IF CompareLeft! > CompareRight! THEN GOTO L_3F3F  ' flags from L_3F37
L_3F3C: GOTO L_3E02
L_3F3F: GOTO L_49E9
L_3F42: BX = 0xA61E
L_3F45: DX = &H9F00
L_3F48: S_9F00$ = S_A61E$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_3F4B: GOSUB L_15A6
L_3F4E: SI = &H9EA6
L_3F51: CompareLeft! = N_9EA6!: CompareRight! = 0  ' RT3F_A7
L_3F54: IF CompareLeft! <> CompareRight! THEN GOTO L_3F59  ' flags from L_3F51
L_3F56: GOTO L_309B
L_3F59: DI = &H9EF2
L_3F5C: SI = &H9EA6
L_3F5F: N_9EF2! = N_9EA6!  ' RT3F_7B
L_3F62: BX = 0xA63C
L_3F65: DX = &H9F00
L_3F68: S_9F00$ = S_A63C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_3F6B: GOSUB L_15A6
L_3F6E: SI = &H9EA6
L_3F71: CompareLeft! = N_9EA6!: CompareRight! = 0  ' RT3F_A7
L_3F74: IF CompareLeft! <> CompareRight! THEN GOTO L_3F79  ' flags from L_3F71
L_3F76: GOTO L_309B
L_3F79: DI = &H7188
L_3F7C: SI = &H9EAA
L_3F7F: N_7188! = N_9EAA!  ' RT3F_7B
L_3F82: BX = DI
L_3F84: DI = &H718C
L_3F87: DX = SI
L_3F89: SI = &H9EA6
L_3F8C: N_718C! = N_9EA6!  ' RT3F_7B
L_3F8F: GOSUB L_0333
L_3F92: BX = CINT(FAC!)  ' RT3F_77
L_3F95: DI = BX
L_3F97: DI = DI * (2 ^ 1)
L_3F99: DI = DI * (2 ^ 1)
L_3F9B: DI = DI + &H1850
L_3F9F: SI = &H710A
L_3FA2: N(DI) = N_710A!  ' RT3F_7B
L_3FA5: DI = &H7188
L_3FA8: BX = SI
L_3FAA: SI = &H9EAA
L_3FAD: N_7188! = N_9EAA!  ' RT3F_7B
L_3FB0: DI = &H718C
L_3FB3: SI = &H9EF2
L_3FB6: N_718C! = N_9EF2!  ' RT3F_7B
L_3FB9: GOSUB L_0333
L_3FBC: BX = CINT(FAC!)  ' RT3F_77
L_3FBF: DI = BX
L_3FC1: DI = DI * (2 ^ 1)
L_3FC3: DI = DI * (2 ^ 1)
L_3FC5: DI = DI + &H1850
L_3FC9: SI = &H710A
L_3FCC: N(DI) = N_710A!  ' RT3F_7B
L_3FCF: DI = &H7188
L_3FD2: SI = &H6F82
L_3FD5: N_7188! = N_6F82!  ' RT3F_7B
L_3FD8: BX = DI
L_3FDA: DI = &H718C
L_3FDD: DX = SI
L_3FDF: SI = &H9EF2
L_3FE2: N_718C! = N_9EF2!  ' RT3F_7B
L_3FE5: GOSUB L_0333
L_3FE8: DI = &H7188
L_3FEB: SI = &H6F82
L_3FEE: N_7188! = N_6F82!  ' RT3F_7B
L_3FF1: BX = DI
L_3FF3: DI = &H718C
L_3FF6: SI = &H9EA6
L_3FF9: N_718C! = N_9EA6!  ' RT3F_7B
L_3FFC: T_12! = FAC!  ' RT3F_71; inline=&H92
L_4000: GOSUB L_0333
L_4003: FAC! = T_12! - FAC!  ' RT3F_9D; inline=&H92
L_4007: DI = 0xA650
L_400A: N_A650! = FAC!: SI = &H001A  ' RT3F_7D
L_400D: DI = &H7188
L_4010: SI = &H71C4
L_4013: N_7188! = N_71C4!  ' RT3F_7B
L_4016: BX = DI
L_4018: DI = &H718C
L_401B: SI = &H9EF2
L_401E: N_718C! = N_9EF2!  ' RT3F_7B
L_4021: GOSUB L_0333
L_4024: DI = 0xA654
L_4027: N_A654! = FAC!: SI = &H001A  ' RT3F_7D
L_402A: DI = &H7188
L_402D: SI = 0xA658
L_4030: N_7188! = N_A658!  ' RT3F_7B
L_4033: DI = &H718C
L_4036: SI = &H9EF2
L_4039: N_718C! = N_9EF2!  ' RT3F_7B
L_403C: GOSUB L_0333
L_403F: GOTO L_407C
L_4042: DI = 0xA650
L_4045: SI = &H8BDC
L_4048: FAC! = N_8BDC! - N_A650!  ' RT3F_97
L_404B: BX = SI
L_404D: DX = BX
L_404F: BX = CINT(FAC!)  ' RT3F_77
L_4052: SI = BX
L_4054: SI = SI * (2 ^ 1)
L_4056: SI = SI * (2 ^ 1)
L_4058: SI = SI + &H1850
L_405C: SWAP DX, SI
L_405E: BX = SI
L_4060: CX = BX
L_4062: BX = CINT(N(SI))  ' RT3F_75
L_4065: DI = BX
L_4067: DI = DI * (2 ^ 1)
L_4069: DI = DI * (2 ^ 1)
L_406B: DI = DI + &H1850
L_406F: SI = DX
L_4071: SWAP N(SI), N(DI)  ' RT3F_11
L_4074: SI = CX
L_4076: DI = &H6F4A
L_4079: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_407C: DI = &H8BDC
L_407F: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_4082: SI = DI
L_4084: DI = 0xA654
L_4087: CompareLeft! = N_8BDC!: CompareRight! = N_A654!  ' RT3F_9F
L_408A: IF CompareLeft! <= CompareRight! THEN GOTO L_4042  ' flags from L_4087
L_408C: SI = &H9EA6
L_408F: BX = CINT(N_9EA6!)  ' RT3F_75
L_4092: SI = BX
L_4094: SI = SI * (2 ^ 1)
L_4096: SI = SI * (2 ^ 1)
L_4098: SI = SI + &H4288
L_409C: BX = SI
L_409E: SI = &H9EF2
L_40A1: DX = BX
L_40A3: BX = CINT(N_9EF2!)  ' RT3F_75
L_40A6: DI = BX
L_40A8: DI = DI * (2 ^ 1)
L_40AA: DI = DI * (2 ^ 1)
L_40AC: DI = DI + &H4288
L_40B0: SI = DX
L_40B2: SWAP S(SI), S(DI)  ' RT3F_14
L_40B5: DI = &H9EA6
L_40B8: SI = &H9EF2
L_40BB: FAC! = N_9EF2! + N_9EA6!  ' RT3F_7F
L_40BE: DI = 0xA65C
L_40C1: N_A65C! = FAC!: SI = &H001A  ' RT3F_7D
L_40C4: SI = 0xA660
L_40C7: FAC! = N_A660!: DI = &H001E  ' RT3F_6F
L_40CA: GOTO L_40DA
L_40CD: ' Alignment NOP
L_40CE: GOSUB L_413A
L_40D1: DI = &H9EE6
L_40D4: SI = &H710E
L_40D7: FAC! = N_710E! + N_9EE6!  ' RT3F_7F
L_40DA: DI = &H710E
L_40DD: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_40E0: SI = DI
L_40E2: DI = 0xA664
L_40E5: CompareLeft! = N_710E!: CompareRight! = N_A664!  ' RT3F_9F
L_40E8: IF CompareLeft! <= CompareRight! THEN GOTO L_40CE  ' flags from L_40E5
L_40EA: SI = 0xA668
L_40ED: FAC! = N_A668!: DI = &H001E  ' RT3F_6F
L_40F0: GOTO L_4100
L_40F3: ' Alignment NOP
L_40F4: GOSUB L_413A
L_40F7: DI = &H710A
L_40FA: SI = &H710E
L_40FD: FAC! = N_710E! + N_710A!  ' RT3F_7F

```

### Position and action dispatch

```basic
L_4100: DI = &H710E
L_4103: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_4106: SI = DI
L_4108: DI = 0xA66C
L_410B: CompareLeft! = N_710E!: CompareRight! = N_A66C!  ' RT3F_9F
L_410E: IF CompareLeft! <= CompareRight! THEN GOTO L_40F4  ' flags from L_410B
L_4110: SI = 0xA670
L_4113: FAC! = N_A670!: DI = &H001E  ' RT3F_6F
L_4116: GOTO L_4126
L_4119: ' Alignment NOP
L_411A: GOSUB L_413A
L_411D: DI = &H710A
L_4120: SI = &H710E
L_4123: FAC! = N_710E! + N_710A!  ' RT3F_7F
L_4126: DI = &H710E
L_4129: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_412C: SI = DI
L_412E: DI = 0xA674
L_4131: CompareLeft! = N_710E!: CompareRight! = N_A674!  ' RT3F_9F
L_4134: IF CompareLeft! <= CompareRight! THEN GOTO L_411A  ' flags from L_4131
L_4136: GOSUB L_173C
L_4139: RETURN
L_413A: SI = &H710E
L_413D: BX = CINT(N_710E!)  ' RT3F_75
L_4140: SI = BX
L_4142: SI = SI * (2 ^ 1)
L_4144: SI = SI * (2 ^ 1)
L_4146: SI = SI + &H1850
L_414A: DI = &H9EF2
L_414D: CompareLeft! = N(SI): CompareRight! = N_9EF2!  ' RT3F_9F
L_4150: BX = 0
L_4153: IF CompareLeft! = CompareRight! THEN GOTO L_4156  ' flags from L_414D
L_4155: BX = BX - 1
L_4156: DI = &H9EA6
L_4159: CompareLeft! = N(SI): CompareRight! = N_9EA6!  ' RT3F_9F
L_415C: DX = 0
L_415F: IF CompareLeft! = CompareRight! THEN GOTO L_4162  ' flags from L_4159
L_4161: DX = DX - 1
L_4162: DX = DX AND BX
L_4164: CompareLeft% = DX: CompareRight% = 0
L_4166: IF CompareLeft% <> CompareRight% THEN GOTO L_416B  ' flags from L_4164
L_4168: GOTO L_416C
L_416B: RETURN
L_416C: SI = &H710E
L_416F: BX = CINT(N_710E!)  ' RT3F_75
L_4172: DI = BX
L_4174: DI = DI * (2 ^ 1)
L_4176: DI = DI * (2 ^ 1)
L_4178: DI = DI + &H1850
L_417C: SI = 0xA65C
L_417F: FAC! = N_A65C! - N(DI)  ' RT3F_97
L_4182: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4185: RETURN
L_4186: DI = 0xA5DE
L_4189: SI = 0xA678
L_418C: N_A5DE! = N_A678!  ' RT3F_7B
L_418F: BX = &H20
L_4192: DX = 0
L_4194: CX = DX
L_4196: AX = CX
L_4198: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_419B: BX = &H4B28
L_419E: DX = 3
L_41A1: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_41A4: GOSUB L_1DD0
L_41A7: GOSUB L_434C
L_41AA: DI = 0xA67C
L_41AD: SI = &H70AA
L_41B0: N_A67C! = N_70AA!  ' RT3F_7B
L_41B3: DI = SI
L_41B5: SI = &H8B2C
L_41B8: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_41BB: GOTO L_4267
L_41BE: SI = &H710E
L_41C1: BX = CINT(N_710E!)  ' RT3F_75
L_41C4: SI = BX
L_41C6: SI = SI * (2 ^ 1)
L_41C8: SI = SI * (2 ^ 1)
L_41CA: BX = SI
L_41CC: SI = SI + &H89C0
L_41D0: DI = &H9F04
L_41D3: CompareLeft! = N(SI): CompareRight! = N_9F04!  ' RT3F_9F
L_41D6: DX = 0
L_41D9: IF CompareLeft! <= CompareRight! THEN GOTO L_41DC  ' flags from L_41D3
L_41DB: DX = DX - 1
L_41DC: DI = 0xA31C
L_41DF: CompareLeft! = N(SI): CompareRight! = N_A31C!  ' RT3F_9F
L_41E2: CX = 0
L_41E5: IF CompareLeft! >= CompareRight! THEN GOTO L_41E8  ' flags from L_41DF
L_41E7: CX = CX - 1
L_41E8: CX = CX AND DX
L_41EA: DX = BX
L_41EC: BX = BX + &H89D8
L_41F0: SWAP BX, SI
L_41F2: DI = &H710A
L_41F5: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_41F8: AX = 0
L_41FB: IF CompareLeft! <= CompareRight! THEN GOTO L_41FE  ' flags from L_41F5
L_41FD: AX = AX - 1
L_41FE: AX = AX AND CX
L_4200: DI = &H9FCC
L_4203: CompareLeft! = N(SI): CompareRight! = N_9FCC!  ' RT3F_9F
L_4206: CX = 0
L_4209: IF CompareLeft! >= CompareRight! THEN GOTO L_420C  ' flags from L_4203
L_420B: CX = CX - 1
L_420C: CX = CX AND AX
L_420E: CompareLeft% = CX: CompareRight% = 0
L_4210: IF CompareLeft% <> CompareRight% THEN GOTO L_4215  ' flags from L_420E
L_4212: GOTO L_425E
L_4215: SWAP BX, SI
L_4217: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_421B: DI = 0xA680
L_421E: FAC! = FAC! + N_A680!  ' RT3F_81
L_4221: DI = &H9F70
L_4224: N_9F70! = FAC!: SI = &H001A  ' RT3F_7D
L_4227: SI = BX
L_4229: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_422D: DI = &H8D02
L_4230: FAC! = FAC! + N_8D02!  ' RT3F_81
L_4233: DI = &H9F74
L_4236: N_9F74! = FAC!: SI = &H001A  ' RT3F_7D
L_4239: DX = DX + &H89F0
L_423D: SI = DX
L_423F: DI = &H6F4A
L_4242: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_4245: BX = CINT(FAC!)  ' RT3F_77
L_4248: ON BX GOSUB L_4294, L_42AB, L_42C2, L_42D9, L_42F0, L_4307, L_431E, L_4335, L_4452  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_425E: DI = 0xA67C
L_4261: SI = &H710E
L_4264: FAC! = N_710E! + N_A67C!  ' RT3F_7F
L_4267: DI = &H710E
L_426A: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_426D: SI = 0xA67C
L_4270: CompareLeft! = N_A67C!: CompareRight! = 0  ' RT3F_A7
L_4273: IF CompareLeft! < CompareRight! THEN GOTO L_4278  ' flags from L_4270
L_4275: GOTO L_4285
L_4278: SI = DI
L_427A: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_427D: IF CompareLeft! < CompareRight! THEN GOTO L_4282  ' flags from L_427A
L_427F: GOTO L_41BE
L_4282: GOTO L_4290
L_4285: SI = &H710E
L_4288: CompareLeft! = N_710E!: CompareRight! = 0  ' RT3F_A7
L_428B: IF CompareLeft! > CompareRight! THEN GOTO L_4290  ' flags from L_4288
L_428D: GOTO L_41BE
L_4290: GOSUB L_434C
L_4293: RETURN
L_4294: BX = &H9F70
L_4297: DX = &H9F74
L_429A: CX = 0xFFFF
L_429D: AX = CX
L_429F: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_42A2: BX = &H6AA2
L_42A5: DX = 0
L_42A7: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_42AA: RETURN
L_42AB: BX = &H9F70
L_42AE: DX = &H9F74
L_42B1: CX = 0xFFFF
L_42B4: AX = CX
L_42B6: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_42B9: BX = &H6B36
L_42BC: DX = 0
L_42BE: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_42C1: RETURN
L_42C2: BX = &H9F70
L_42C5: DX = &H9F74
L_42C8: CX = 0xFFFF
L_42CB: AX = CX
L_42CD: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_42D0: BX = &H6BCA
L_42D3: DX = 0
L_42D5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_42D8: RETURN
L_42D9: BX = &H9F70
L_42DC: DX = &H9F74
L_42DF: CX = 0xFFFF
L_42E2: AX = CX
L_42E4: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_42E7: BX = &H6C5E
L_42EA: DX = 0
L_42EC: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_42EF: RETURN
L_42F0: BX = &H9F70
L_42F3: DX = &H9F74
L_42F6: CX = 0xFFFF
L_42F9: AX = CX
L_42FB: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_42FE: BX = &H6CF2
L_4301: DX = 0
L_4303: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4306: RETURN
L_4307: BX = &H9F70
L_430A: DX = &H9F74
L_430D: CX = 0xFFFF
L_4310: AX = CX
L_4312: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4315: BX = &H6D86
L_4318: DX = 0
L_431A: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_431D: RETURN
L_431E: BX = &H9F70
L_4321: DX = &H9F74
L_4324: CX = 0xFFFF
L_4327: AX = CX
L_4329: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_432C: BX = &H6E1A
L_432F: DX = 0
L_4331: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4334: RETURN
L_4335: BX = &H9F70
L_4338: DX = &H9F74
L_433B: CX = 0xFFFF
L_433E: AX = CX
L_4340: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4343: BX = &H6EAE
L_4346: DX = 0
L_4348: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_434B: RETURN
L_434C: SI = &H89D4
L_434F: FAC! = N_89D4! * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_4353: DI = 0xA680
L_4356: FAC! = FAC! + N_A680!  ' RT3F_81
L_4359: DI = &H9F70
L_435C: N_9F70! = FAC!: SI = &H001A  ' RT3F_7D
L_435F: SI = &H89EC
L_4362: FAC! = N_89EC! * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_4366: DI = &H8D02
L_4369: FAC! = FAC! + N_8D02!  ' RT3F_81
L_436C: DI = &H9F74
L_436F: N_9F74! = FAC!: SI = &H001A  ' RT3F_7D
L_4372: DI = &H6F4A
L_4375: SI = &H3B18
L_4378: FAC! = N_3B18! + N_6F4A!  ' RT3F_7F
L_437B: BX = CINT(FAC!)  ' RT3F_77
L_437E: ON BX GOTO L_4392, L_43AA, L_43C2, L_43DA, L_43F2, L_440A, L_4422, L_443A  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_4392: BX = &H9F70
L_4395: DX = &H9F74
L_4398: CX = 0xFFFF
L_439B: AX = CX
L_439D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_43A0: BX = &H65FC
L_43A3: DX = 3
L_43A6: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_43A9: RETURN
L_43AA: BX = &H9F70
L_43AD: DX = &H9F74
L_43B0: CX = 0xFFFF
L_43B3: AX = CX
L_43B5: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_43B8: BX = &H6690
L_43BB: DX = 3
L_43BE: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_43C1: RETURN
L_43C2: BX = &H9F70
L_43C5: DX = &H9F74
L_43C8: CX = 0xFFFF
L_43CB: AX = CX
L_43CD: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_43D0: BX = &H6724
L_43D3: DX = 3
L_43D6: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_43D9: RETURN
L_43DA: BX = &H9F70
L_43DD: DX = &H9F74
L_43E0: CX = 0xFFFF
L_43E3: AX = CX
L_43E5: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_43E8: BX = &H67B8
L_43EB: DX = 3
L_43EE: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_43F1: RETURN
L_43F2: BX = &H9F70
L_43F5: DX = &H9F74
L_43F8: CX = 0xFFFF
L_43FB: AX = CX
L_43FD: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4400: BX = &H684C
L_4403: DX = 3
L_4406: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4409: RETURN
L_440A: BX = &H9F70
L_440D: DX = &H9F74
L_4410: CX = 0xFFFF
L_4413: AX = CX
L_4415: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4418: BX = &H68E0
L_441B: DX = 3
L_441E: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4421: RETURN
L_4422: BX = &H9F70
L_4425: DX = &H9F74
L_4428: CX = 0xFFFF
L_442B: AX = CX
L_442D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4430: BX = &H6974
L_4433: DX = 3
L_4436: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4439: RETURN
L_443A: BX = &H9F70
L_443D: DX = &H9F74
L_4440: CX = 0xFFFF
L_4443: AX = CX
L_4445: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4448: BX = &H6A08
L_444B: DX = 3
L_444E: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4451: RETURN
L_4452: BX = &H9F70
L_4455: DX = &H9F74
L_4458: CX = 0xFFFF
L_445B: AX = CX
L_445D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4460: BX = &H8096
L_4463: DX = 0
L_4465: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4468: RETURN
L_4469: DI = 0xA5DE
L_446C: SI = &H6F4A
L_446F: N_A5DE! = N_6F4A!  ' RT3F_7B
L_4472: BX = &H20
L_4475: DX = 0
L_4477: CX = DX
L_4479: AX = CX
L_447B: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_447E: BX = &H4936
L_4481: DX = 3
L_4484: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4487: GOSUB L_1DD0
L_448A: BX = &H2E
L_448D: DX = 9
L_4490: CX = 0
L_4492: AX = CX
L_4494: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_4497: DX = &H8F
L_449A: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_449D: BX = 0xFFFF
L_44A0: DX = BX
L_44A2: CX = DX
L_44A4: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_44A7: CX = AX
L_44A9: BX = &H75
L_44AC: DX = 9
L_44AF: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_44B2: DX = &H8F
L_44B5: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_44B8: BX = 0xFFFF
L_44BB: DX = BX
L_44BD: CX = DX
L_44BF: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_44C2: CX = AX
L_44C4: BX = &H11
L_44C7: DX = &H2B
L_44CA: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_44CD: BX = &H8D
L_44D0: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_44D3: BX = 0xFFFF
L_44D6: DX = BX
L_44D8: CX = DX
L_44DA: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_44DD: CX = AX
L_44DF: BX = &H11
L_44E2: DX = &H6D
L_44E5: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_44E8: BX = &H8D
L_44EB: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_44EE: BX = 0xFFFF
L_44F1: DX = BX
L_44F3: CX = DX
L_44F5: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_44F8: DI = 0xA684
L_44FB: SI = &H70AA
L_44FE: N_A684! = N_70AA!  ' RT3F_7B
L_4501: DI = SI
L_4503: SI = &H8B2C
L_4506: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_4509: GOTO L_463A
L_450C: SI = &H710E
L_450F: BX = CINT(N_710E!)  ' RT3F_75
L_4512: SI = BX
L_4514: SI = SI * (2 ^ 1)
L_4516: SI = SI * (2 ^ 1)
L_4518: BX = SI
L_451A: SI = SI + &H89C0
L_451E: DI = &H7116
L_4521: CompareLeft! = N(SI): CompareRight! = N_7116!  ' RT3F_9F
L_4524: DX = 0
L_4527: IF CompareLeft! >= CompareRight! THEN GOTO L_452A  ' flags from L_4521
L_4529: DX = DX - 1
L_452A: DI = 0xA006
L_452D: CompareLeft! = N(SI): CompareRight! = N_A006!  ' RT3F_9F
L_4530: CX = 0
L_4533: IF CompareLeft! <= CompareRight! THEN GOTO L_4536  ' flags from L_452D
L_4535: CX = CX - 1
L_4536: CX = CX OR DX
L_4538: BX = BX + &H89D8
L_453C: SI = BX
L_453E: DI = 0xA59E
L_4541: CompareLeft! = N(SI): CompareRight! = N_A59E!  ' RT3F_9F
L_4544: DX = 0
L_4547: IF CompareLeft! >= CompareRight! THEN GOTO L_454A  ' flags from L_4541
L_4549: DX = DX - 1
L_454A: DX = DX OR CX
L_454C: DI = &H71F8
L_454F: CompareLeft! = N(SI): CompareRight! = N_71F8!  ' RT3F_9F
L_4552: CX = 0
L_4555: IF CompareLeft! <= CompareRight! THEN GOTO L_4558  ' flags from L_454F
L_4557: CX = CX - 1
L_4558: CX = CX OR DX
L_455A: CompareLeft% = CX: CompareRight% = 0
L_455C: IF CompareLeft% = CompareRight% THEN GOTO L_4561  ' flags from L_455A
L_455E: GOTO L_4631
L_4561: SI = &H710E
L_4564: BX = SI
L_4566: DX = BX
L_4568: BX = CINT(N_710E!)  ' RT3F_75
L_456B: SI = BX
L_456D: SI = SI * (2 ^ 1)
L_456F: SI = SI * (2 ^ 1)
L_4571: BX = SI
L_4573: SI = SI + &H89C0
L_4577: DI = &H71D4
L_457A: FAC! = N(SI) * N_71D4!  ' RT3F_8F
L_457D: CX = DI
L_457F: DI = 0xA688
L_4582: FAC! = FAC! + N_A688!  ' RT3F_81
L_4585: DI = &H9F70
L_4588: N_9F70! = FAC!: SI = &H001A  ' RT3F_7D
L_458B: BX = BX + &H89D8
L_458F: SI = BX
L_4591: DI = CX
L_4593: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_4596: DI = &H7164
L_4599: FAC! = FAC! + N_7164!  ' RT3F_81
L_459C: DI = &H9F74
L_459F: N_9F74! = FAC!: SI = &H001A  ' RT3F_7D
L_45A2: SI = DX
L_45A4: DI = &H6F4A
L_45A7: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_45AA: BX = CINT(FAC!)  ' RT3F_77
L_45AD: ON BX GOSUB L_45BE, L_45D5, L_45EC, L_4603, L_461A  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_45BB: GOTO L_4631
L_45BE: BX = &H9F70
L_45C1: DX = &H9F74
L_45C4: CX = 0xFFFF
L_45C7: AX = CX
L_45C9: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_45CC: BX = &H73A0
L_45CF: DX = 0
L_45D1: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_45D4: RETURN
L_45D5: BX = &H9F70
L_45D8: DX = &H9F74
L_45DB: CX = 0xFFFF
L_45DE: AX = CX
L_45E0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_45E3: BX = &H73AE
L_45E6: DX = 0
L_45E8: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_45EB: RETURN
L_45EC: BX = &H9F70
L_45EF: DX = &H9F74
L_45F2: CX = 0xFFFF
L_45F5: AX = CX
L_45F7: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_45FA: BX = &H73BC
L_45FD: DX = 0
L_45FF: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4602: RETURN
L_4603: BX = &H9F70
L_4606: DX = &H9F74
L_4609: CX = 0xFFFF
L_460C: AX = CX
L_460E: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4611: BX = &H73CA
L_4614: DX = 0
L_4616: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4619: RETURN
L_461A: BX = &H9F70
L_461D: DX = &H9F74
L_4620: CX = 0xFFFF
L_4623: AX = CX
L_4625: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4628: BX = &H73D8
L_462B: DX = 0
L_462D: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4630: RETURN
L_4631: DI = 0xA684
L_4634: SI = &H710E
L_4637: FAC! = N_710E! + N_A684!  ' RT3F_7F
L_463A: DI = &H710E
L_463D: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_4640: SI = 0xA684
L_4643: CompareLeft! = N_A684!: CompareRight! = 0  ' RT3F_A7
L_4646: IF CompareLeft! < CompareRight! THEN GOTO L_464B  ' flags from L_4643
L_4648: GOTO L_4658
L_464B: SI = DI
L_464D: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4650: IF CompareLeft! < CompareRight! THEN GOTO L_4655  ' flags from L_464D
L_4652: GOTO L_450C
L_4655: GOTO L_4663
L_4658: SI = &H710E
L_465B: CompareLeft! = N_710E!: CompareRight! = 0  ' RT3F_A7
L_465E: IF CompareLeft! > CompareRight! THEN GOTO L_4663  ' flags from L_465B
L_4660: GOTO L_450C
L_4663: DI = &H71D4
L_4666: SI = &H89D4
L_4669: FAC! = N_89D4! * N_71D4!  ' RT3F_8F
L_466C: BX = DI
L_466E: DI = 0xA688
L_4671: FAC! = FAC! + N_A688!  ' RT3F_81
L_4674: DI = &H9F70
L_4677: N_9F70! = FAC!: SI = &H001A  ' RT3F_7D
L_467A: SWAP BX, DI
L_467C: SI = &H89EC
L_467F: FAC! = N_89EC! * N(DI)  ' RT3F_8F
L_4682: DI = &H7164
L_4685: FAC! = FAC! + N_7164!  ' RT3F_81
L_4688: DI = &H9F74
L_468B: N_9F74! = FAC!: SI = &H001A  ' RT3F_7D
L_468E: DX = DI
L_4690: CX = 0xFFFF
L_4693: AX = CX
L_4695: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4698: BX = &H73A0
L_469B: DX = 2
L_469E: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_46A1: DX = DI
L_46A3: BX = &H9F70
L_46A6: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_46A9: BX = &H73A0
L_46AC: DX = 4
L_46AF: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_46B2: SI = DI
L_46B4: DI = &H6F4A
L_46B7: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_46BA: SI = &H9F70
L_46BD: T_12! = FAC!  ' RT3F_71; inline=&H92
L_46C1: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_46C4: BX = &H1A
L_46C7: DX = &H703A
L_46CA: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_46CD: BX = &H73EE
L_46D0: DX = 4
L_46D3: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_46D6: RETURN
L_46D7: DI = 0xA55E
L_46DA: SI = &H70AA
L_46DD: N_A55E! = N_70AA!  ' RT3F_7B
L_46E0: GOTO L_4704
L_46E3: DI = 0xA55A
L_46E6: SI = &H70AA
L_46E9: N_A55A! = N_70AA!  ' RT3F_7B
L_46EC: GOTO L_4704
L_46EF: DI = 0xA55E
L_46F2: SI = &H6F4A
L_46F5: N_A55E! = N_6F4A!  ' RT3F_7B
L_46F8: GOTO L_4704
L_46FB: DI = 0xA55A
L_46FE: SI = &H6F4A

```

### Enemy report and hyperspace

```basic
L_4701: N_A55A! = N_6F4A!  ' RT3F_7B
L_4704: DI = 0xA55A
L_4707: SI = &H89D4
L_470A: FAC! = N_89D4! + N_A55A!  ' RT3F_7F
L_470D: DI = SI
L_470F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4712: DI = 0xA55E
L_4715: SI = &H89EC
L_4718: FAC! = N_89EC! + N_A55E!  ' RT3F_7F
L_471B: DI = SI
L_471D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4720: DI = 0xA4B2
L_4723: SI = &H6F4A
L_4726: N_A4B2! = N_6F4A!  ' RT3F_7B
L_4729: RETURN
L_472A: DI = 0xA68C
L_472D: SI = &H6F4A
L_4730: N_A68C! = N_6F4A!  ' RT3F_7B
L_4733: GOTO L_473F
L_4736: DI = 0xA68C
L_4739: SI = &H70AA
L_473C: N_A68C! = N_70AA!  ' RT3F_7B
L_473F: DI = &H6F4A
L_4742: SI = &H3AB0
L_4745: CompareLeft! = N_3AB0!: CompareRight! = N_6F4A!  ' RT3F_9F
L_4748: BX = 0
L_474B: IF CompareLeft! >= CompareRight! THEN GOTO L_474E  ' flags from L_4745
L_474D: BX = BX - 1
L_474E: SI = &H1854
L_4751: CompareLeft! = N_1854!: CompareRight! = N(DI)  ' RT3F_9F
L_4754: DX = 0
L_4757: IF CompareLeft! = CompareRight! THEN GOTO L_475A  ' flags from L_4751
L_4759: DX = DX - 1
L_475A: DX = DX OR BX
L_475C: SI = &H185C
L_475F: CompareLeft! = N_185C!: CompareRight! = N(DI)  ' RT3F_9F
L_4762: BX = 0
L_4765: IF CompareLeft! = CompareRight! THEN GOTO L_4768  ' flags from L_475F
L_4767: BX = BX - 1
L_4768: BX = BX OR DX
L_476A: DX = DI
L_476C: DI = &H7174
L_476F: SI = &H71F4
L_4772: N_7174! = N_71F4!  ' RT3F_7B
L_4775: SI = DX
L_4777: DI = &H7178
L_477A: N_7178! = N(SI)  ' RT3F_7B
L_477D: WORD(BP - &H10) = BX
L_4780: GOSUB L_0301
L_4783: DI = &H6F4A
L_4786: CompareLeft! = FAC!: CompareRight! = N_6F4A!  ' RT3F_A1
L_4789: BX = 0
L_478C: IF CompareLeft! >= CompareRight! THEN GOTO L_478F  ' flags from L_4786
L_478E: BX = BX - 1
L_478F: BX = BX OR WORD(BP - &H10)
L_4792: CompareLeft% = BX: CompareRight% = 0
L_4794: IF CompareLeft% <> CompareRight% THEN GOTO L_4799  ' flags from L_4792
L_4796: GOTO L_479D
L_4799: GOSUB L_1D61
L_479C: RETURN
L_479D: DI = 0xA68C
L_47A0: SI = &H3B18
L_47A3: FAC! = N_3B18! + N_A68C!  ' RT3F_7F
L_47A6: DI = &H8BF2
L_47A9: BX = SI
L_47AB: N_8BF2! = FAC!: SI = &H001A  ' RT3F_7D
L_47AE: GOSUB L_0CB1
L_47B1: DI = &H3B18
L_47B4: N_3B18! = FAC!: SI = &H001A  ' RT3F_7D
L_47B7: GOSUB L_18E2
L_47BA: DI = 0xA4B6
L_47BD: SI = &H6F4A
L_47C0: N_A4B6! = N_6F4A!  ' RT3F_7B
L_47C3: RETURN
L_47C4: GOSUB L_4469
L_47C7: GOSUB L_1D8C
L_47CA: BX = &H14
L_47CD: ARGPUSH BX  ' RT3E_42
L_47D0: BX = 0xB
L_47D3: LOCATE ARGS(), BX  ' RT3E_44
L_47D6: ' PRINT statement begins ; RT3F_BC
L_47D9: BX = 0xA690
L_47DC: PRINT S_A690$  ' RT3F_6E; H newline item, ledger correction
L_47DF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_47E2: DI = &H70AA
L_47E5: SI = &H8B2C
L_47E8: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_47EB: DI = 0xA6A0
L_47EE: N_A6A0! = FAC!: SI = &H001A  ' RT3F_7D
L_47F1: SI = &H8BBC
L_47F4: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_47F7: GOTO L_4913
L_47FA: DI = &H710A
L_47FD: SI = &H710E
L_4800: FAC! = N_710E! / N_710A!  ' RT3F_87
L_4803: BX = &H1A
L_4806: FAC! = INT(FAC!)  ' RT3D_03
L_4809: DI = &H9EF2
L_480C: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_480F: DI = &H710A
L_4812: SI = &H9EF2
L_4815: FAC! = N_9EF2! * N_710A!  ' RT3F_8F
L_4818: BX = SI
L_481A: SI = 0xA6B0
L_481D: DX = DI
L_481F: FAC! = N_A6B0! - FAC!  ' RT3F_9B
L_4822: DI = &H710E
L_4825: FAC! = FAC! + N_710E!  ' RT3F_81
L_4828: CX = BX
L_482A: BX = CINT(FAC!)  ' RT3F_77
L_482D: ARGPUSH BX  ' RT3E_42
L_4830: SI = CX
L_4832: FAC! = N(SI) * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_4836: SWAP DX, DI
L_4838: FAC! = FAC! + N(DI)  ' RT3F_81
L_483B: BX = CINT(FAC!)  ' RT3F_77
L_483E: LOCATE ARGS(), BX  ' RT3E_44
L_4841: ' PRINT statement begins ; RT3F_BC
L_4844: SI = DX
L_4846: DI = 0xA6B4
L_4849: FAC! = N(SI) + N_A6B4!  ' RT3F_7F
L_484C: BX = CINT(FAC!)  ' RT3F_77
L_484F: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_4852: PRINT S(BX);  ' RT3F_6A
L_4855: BX = 0xA6B8
L_4858: PRINT S_A6B8$;  ' RT3F_6A
L_485B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_485E: SI = DX
L_4860: BX = CINT(N(SI))  ' RT3F_75
L_4863: SI = BX
L_4865: SI = SI * (2 ^ 1)
L_4867: SI = SI * (2 ^ 1)
L_4869: SI = SI + &H8A08
L_486D: DI = &H6F54
L_4870: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_4873: IF CompareLeft! = CompareRight! THEN GOTO L_4878  ' flags from L_4870
L_4875: GOTO L_4887
L_4878: ' PRINT statement begins ; RT3F_BC
L_487B: BX = 0xA6A4
L_487E: PRINT S_A6A4$  ' RT3F_6E; H newline item, ledger correction
L_4881: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4884: GOTO L_48D8
L_4887: SI = &H710E
L_488A: BX = CINT(N_710E!)  ' RT3F_75
L_488D: SI = BX
L_488F: SI = SI * (2 ^ 1)
L_4891: SI = SI * (2 ^ 1)
L_4893: SI = SI + &H8A08
L_4897: DI = &H6F54
L_489A: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_489D: IF CompareLeft! <= CompareRight! THEN GOTO L_48A2  ' flags from L_489A
L_489F: GOTO L_48DB
L_48A2: SI = &H710E
L_48A5: BX = CINT(N_710E!)  ' RT3F_75
L_48A8: SI = BX
L_48AA: SI = SI * (2 ^ 1)
L_48AC: SI = SI * (2 ^ 1)
L_48AE: SI = SI + &H8894
L_48B2: DI = &H6F4A
L_48B5: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_48B8: IF CompareLeft! < CompareRight! THEN GOTO L_48BD  ' flags from L_48B5
L_48BA: GOTO L_48CC
L_48BD: ' PRINT statement begins ; RT3F_BC
L_48C0: BX = 0xA6BE
L_48C3: PRINT S_A6BE$  ' RT3F_6E; H newline item, ledger correction
L_48C6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_48C9: GOTO L_48D8
L_48CC: ' PRINT statement begins ; RT3F_BC
L_48CF: BX = 0xA6CC
L_48D2: PRINT S_A6CC$  ' RT3F_6E; H newline item, ledger correction
L_48D5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_48D8: GOTO L_490A
L_48DB: DI = &H8C3E
L_48DE: SI = &H710E
L_48E1: N_8C3E! = N_710E!  ' RT3F_7B
L_48E4: GOSUB L_0DE2
L_48E7: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_48EA: IF CompareLeft! > CompareRight! THEN GOTO L_48EF  ' flags from L_48E7
L_48EC: GOTO L_48FE
L_48EF: ' PRINT statement begins ; RT3F_BC
L_48F2: BX = 0xA6DC
L_48F5: PRINT S_A6DC$  ' RT3F_6E; H newline item, ledger correction
L_48F8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_48FB: GOTO L_490A
L_48FE: ' PRINT statement begins ; RT3F_BC
L_4901: BX = 0xA6E8
L_4904: PRINT S_A6E8$  ' RT3F_6E; H newline item, ledger correction
L_4907: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_490A: DI = &H6F4A
L_490D: SI = &H710E
L_4910: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_4913: DI = &H710E
L_4916: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_4919: SI = DI
L_491B: DI = 0xA6A0
L_491E: CompareLeft! = N_710E!: CompareRight! = N_A6A0!  ' RT3F_9F
L_4921: IF CompareLeft! > CompareRight! THEN GOTO L_4926  ' flags from L_491E
L_4923: GOTO L_47FA
L_4926: BX = &H18
L_4929: ARGPUSH BX  ' RT3E_42
L_492C: BX = 3
L_492F: LOCATE ARGS(), BX  ' RT3E_44
L_4932: GOSUB L_16B9
L_4935: RETURN
L_4936: DI = 0xA4C6
L_4939: SI = &H6F4A
L_493C: N_A4C6! = N_6F4A!  ' RT3F_7B
L_493F: GOSUB L_1D8C
L_4942: BX = &H15
L_4945: ARGPUSH BX  ' RT3E_42
L_4948: BX = 3
L_494B: LOCATE ARGS(), BX  ' RT3E_44
L_494E: ' PRINT statement begins ; RT3F_BC
L_4951: BX = 0xA6F8
L_4954: PRINT S_A6F8$  ' RT3F_6E; H newline item, ledger correction
L_4957: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_495A: GOSUB L_1693
L_495D: GOSUB L_1693
L_4960: DI = 0xA71C
L_4963: SI = &H71D0
L_4966: N_A71C! = N_71D0!  ' RT3F_7B
L_4969: SI = DI
L_496B: DI = 0xA720
L_496E: N_A720! = N_A71C!  ' RT3F_7B
L_4971: SWAP SI, DI
L_4973: BX = SI
L_4975: SI = &H3AB0
L_4978: CompareLeft! = N_3AB0!: CompareRight! = N_A71C!  ' RT3F_9F
L_497B: IF CompareLeft! < CompareRight! THEN GOTO L_4980  ' flags from L_4978
L_497D: GOTO L_4985
L_4980: DI = BX
L_4982: N(DI) = N(SI)  ' RT3F_7B
L_4985: GOSUB L_72BA
L_4988: BX = &H17
L_498B: ARGPUSH BX  ' RT3E_42
L_498E: BX = 3
L_4991: LOCATE ARGS(), BX  ' RT3E_44
L_4994: FAC! = RND  ' RT3D_34
L_4997: DI = 0xA71C
L_499A: SI = 0xA720
L_499D: T_12! = FAC!  ' RT3F_71; inline=&H92
L_49A1: FAC! = N(SI) / N(DI)  ' RT3F_87
L_49A4: DI = &H8BC4
L_49A7: FAC! = FAC! * N_8BC4!  ' RT3F_91
L_49AA: DI = &H8BA8
L_49AD: FAC! = FAC! + N_8BA8!  ' RT3F_81
L_49B0: CompareLeft! = T_12!: CompareRight! = FAC!  ' RT3F_A5; inline=&H92
L_49B4: IF CompareLeft! > CompareRight! THEN GOTO L_49B9  ' flags from L_49B0
L_49B6: GOTO L_49CB
L_49B9: ' PRINT statement begins ; RT3F_BC
L_49BC: BX = 0xA724
L_49BF: PRINT S_A724$  ' RT3F_6E; H newline item, ledger correction
L_49C2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_49C5: GOSUB L_1693
L_49C8: GOTO L_5164
L_49CB: ' PRINT statement begins ; RT3F_BC
L_49CE: BX = 0xA72E
L_49D1: PRINT S_A72E$  ' RT3F_6E; H newline item, ledger correction
L_49D4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_49D7: DI = &H9EEE
L_49DA: SI = &H6F54
L_49DD: N_9EEE! = N_6F54!  ' RT3F_7B
L_49E0: GOSUB L_2B67
L_49E3: GOSUB L_1693
L_49E6: GOTO L_2C10
L_49E9: SI = 0xA1B2
L_49EC: CompareLeft! = N_A1B2!: CompareRight! = 0  ' RT3F_A7
L_49EF: IF CompareLeft! <> CompareRight! THEN GOTO L_49F4  ' flags from L_49EC
L_49F1: GOTO L_5164
L_49F4: SI = &H710A
L_49F7: FAC! = N_710A!: DI = &H001E  ' RT3F_6F
L_49FA: GOTO L_5151
L_49FD: ' Alignment NOP
L_49FE: DI = &H7174

```

### Targeting and command selection

```basic
L_4A01: SI = &H71F4
L_4A04: N_7174! = N_71F4!  ' RT3F_7B
L_4A07: BX = DI
L_4A09: DI = &H7178
L_4A0C: SI = &H6F86
L_4A0F: N_7178! = N_6F86!  ' RT3F_7B
L_4A12: GOSUB L_0301
L_4A15: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_4A18: BX = 0
L_4A1B: IF CompareLeft! <> CompareRight! THEN GOTO L_4A1E  ' flags from L_4A15
L_4A1D: BX = BX - 1
L_4A1E: DI = &H7116
L_4A21: SI = &H6F86
L_4A24: FAC! = N_6F86! + N_7116!  ' RT3F_7F
L_4A27: DX = SI
L_4A29: CX = BX
L_4A2B: BX = CINT(FAC!)  ' RT3F_77
L_4A2E: SI = BX
L_4A30: SI = SI * (2 ^ 1)
L_4A32: SI = SI * (2 ^ 1)
L_4A34: SI = SI + &H1850
L_4A38: DI = &H6F4A
L_4A3B: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_4A3E: BX = 0
L_4A41: IF CompareLeft! = CompareRight! THEN GOTO L_4A44  ' flags from L_4A3B
L_4A43: BX = BX - 1
L_4A44: BX = BX OR CX
L_4A46: DI = &H7174
L_4A49: SI = &H9EAA
L_4A4C: N_7174! = N_9EAA!  ' RT3F_7B
L_4A4F: SI = DX
L_4A51: DI = &H7178
L_4A54: N_7178! = N(SI)  ' RT3F_7B
L_4A57: WORD(BP - &H10) = BX
L_4A5A: GOSUB L_0301
L_4A5D: DI = &H710A
L_4A60: CompareLeft! = FAC!: CompareRight! = N_710A!  ' RT3F_A1
L_4A63: BX = 0
L_4A66: IF CompareLeft! <> CompareRight! THEN GOTO L_4A69  ' flags from L_4A60
L_4A68: BX = BX - 1
L_4A69: BX = BX OR WORD(BP - &H10)
L_4A6C: CompareLeft% = BX: CompareRight% = 0
L_4A6E: IF CompareLeft% = CompareRight% THEN GOTO L_4A73  ' flags from L_4A6C
L_4A70: GOTO L_5148
L_4A73: DI = &H7188
L_4A76: SI = 0xA73C
L_4A79: N_7188! = N_A73C!  ' RT3F_7B
L_4A7C: DI = &H718C
L_4A7F: SI = &H6F86
L_4A82: N_718C! = N_6F86!  ' RT3F_7B
L_4A85: GOSUB L_0333
L_4A88: BX = CINT(FAC!)  ' RT3F_77
L_4A8B: DI = BX
L_4A8D: DI = DI * (2 ^ 1)
L_4A8F: DI = DI * (2 ^ 1)
L_4A91: DI = DI + &H1850
L_4A95: SI = 0xA586
L_4A98: N(DI) = N_A586!  ' RT3F_7B
L_4A9B: GOSUB L_1D8C
L_4A9E: BX = &H14
L_4AA1: ARGPUSH BX  ' RT3E_42
L_4AA4: BX = 0xB
L_4AA7: LOCATE ARGS(), BX  ' RT3E_44
L_4AAA: ' PRINT statement begins ; RT3F_BC
L_4AAD: SI = &H6F86
L_4AB0: BX = CINT(N_6F86!)  ' RT3F_75
L_4AB3: BX = BX * (2 ^ 1)
L_4AB5: BX = BX * (2 ^ 1)
L_4AB7: BX = BX + &H4288
L_4ABB: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_4ABE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4AC1: BX = &H15
L_4AC4: ARGPUSH BX  ' RT3E_42
L_4AC7: BX = 3
L_4ACA: LOCATE ARGS(), BX  ' RT3E_44
L_4ACD: ' PRINT statement begins ; RT3F_BC
L_4AD0: BX = 0xA740
L_4AD3: PRINT S_A740$;  ' RT3F_6A
L_4AD6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4AD9: DI = 0xA754
L_4ADC: SI = 0xA586
L_4ADF: N_A754! = N_A586!  ' RT3F_7B
L_4AE2: DI = 0xA010
L_4AE5: N_A010! = N_A586!  ' RT3F_7B
L_4AE8: DI = 0xA758
L_4AEB: SI = &H70AA
L_4AEE: N_A758! = N_70AA!  ' RT3F_7B
L_4AF1: DI = SI
L_4AF3: SI = &H8B2C
L_4AF6: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_4AF9: GOTO L_4B5F
L_4AFC: DI = 0xA59E
L_4AFF: SI = &H6F86
L_4B02: FAC! = N_6F86! + N_A59E!  ' RT3F_7F
L_4B05: DI = &H8C66
L_4B08: N_8C66! = FAC!: SI = &H001A  ' RT3F_7D
L_4B0B: DI = &H8C6A
L_4B0E: SI = &H710E
L_4B11: N_8C6A! = N_710E!  ' RT3F_7B
L_4B14: GOSUB L_0EAC
L_4B17: DI = &H6F4A
L_4B1A: CompareLeft! = FAC!: CompareRight! = N_6F4A!  ' RT3F_A1
L_4B1D: IF CompareLeft! = CompareRight! THEN GOTO L_4B22  ' flags from L_4B1A
L_4B1F: GOTO L_4B56
L_4B22: ' PRINT statement begins ; RT3F_BC
L_4B25: BX = DI
L_4B27: DI = 0xA6B4
L_4B2A: SI = &H710E
L_4B2D: FAC! = N_710E! + N_A6B4!  ' RT3F_7F
L_4B30: DX = SI
L_4B32: CX = BX
L_4B34: BX = CINT(FAC!)  ' RT3F_77
L_4B37: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_4B3A: PRINT S(BX);  ' RT3F_6A
L_4B3D: BX = &H9FF8
L_4B40: PRINT S_9FF8$;  ' RT3F_6A
L_4B43: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4B46: SI = CX
L_4B48: DI = 0xA010
L_4B4B: N_A010! = N(SI)  ' RT3F_7B
L_4B4E: SI = DX
L_4B50: DI = &H9F98
L_4B53: N_9F98! = N(SI)  ' RT3F_7B
L_4B56: DI = 0xA758
L_4B59: SI = &H710E
L_4B5C: FAC! = N_710E! + N_A758!  ' RT3F_7F
L_4B5F: DI = &H710E
L_4B62: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_4B65: SI = 0xA758
L_4B68: CompareLeft! = N_A758!: CompareRight! = 0  ' RT3F_A7
L_4B6B: IF CompareLeft! < CompareRight! THEN GOTO L_4B70  ' flags from L_4B68
L_4B6D: GOTO L_4B7A
L_4B70: SI = DI
L_4B72: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4B75: IF CompareLeft! >= CompareRight! THEN GOTO L_4AFC  ' flags from L_4B72
L_4B77: GOTO L_4B85
L_4B7A: SI = &H710E
L_4B7D: CompareLeft! = N_710E!: CompareRight! = 0  ' RT3F_A7
L_4B80: IF CompareLeft! > CompareRight! THEN GOTO L_4B85  ' flags from L_4B7D
L_4B82: GOTO L_4AFC
L_4B85: SI = 0xA010
L_4B88: CompareLeft! = N_A010!: CompareRight! = 0  ' RT3F_A7
L_4B8B: IF CompareLeft! = CompareRight! THEN GOTO L_4B90  ' flags from L_4B88
L_4B8D: GOTO L_4B9C
L_4B90: ' PRINT statement begins ; RT3F_BC
L_4B93: BX = 0xA75C
L_4B96: PRINT S_A75C$  ' RT3F_6E; H newline item, ledger correction
L_4B99: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4B9C: DI = &H6F8A
L_4B9F: SI = &H6F86
L_4BA2: FAC! = N_6F86! * N_6F8A!  ' RT3F_8F
L_4BA5: DI = 0xA764
L_4BA8: FAC! = FAC! + N_A764!  ' RT3F_81
L_4BAB: DI = &H71C0
L_4BAE: N_71C0! = FAC!: SI = &H001A  ' RT3F_7D
L_4BB1: SI = 0xA010
L_4BB4: CompareLeft! = N_A010!: CompareRight! = 0  ' RT3F_A7
L_4BB7: IF CompareLeft! = CompareRight! THEN GOTO L_4BBC  ' flags from L_4BB4
L_4BB9: GOTO L_4BC8
L_4BBC: DI = 0xA754
L_4BBF: SI = 0xA586
L_4BC2: N_A754! = N_A586!  ' RT3F_7B
L_4BC5: GOTO L_4D07
L_4BC8: DI = 0xA59E
L_4BCB: SI = &H6F86
L_4BCE: FAC! = N_6F86! + N_A59E!  ' RT3F_7F
L_4BD1: DI = &H8C66
L_4BD4: BX = SI
L_4BD6: N_8C66! = FAC!: SI = &H001A  ' RT3F_7D
L_4BD9: DI = &H7174
L_4BDC: SI = 0xA768
L_4BDF: N_7174! = N_A768!  ' RT3F_7B
L_4BE2: SWAP BX, SI
L_4BE4: DX = DI
L_4BE6: DI = &H7178
L_4BE9: N_7178! = N(SI)  ' RT3F_7B
L_4BEC: GOSUB L_0301
L_4BEF: DI = &H8C6A
L_4BF2: N_8C6A! = FAC!: SI = &H001A  ' RT3F_7D
L_4BF5: GOSUB L_0EAC
L_4BF8: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_4BFB: IF CompareLeft! > CompareRight! THEN GOTO L_4C00  ' flags from L_4BF8
L_4BFD: GOTO L_4C1B
L_4C00: DI = &H7174
L_4C03: SI = 0xA768
L_4C06: N_7174! = N_A768!  ' RT3F_7B
L_4C09: DI = &H7178
L_4C0C: SI = &H6F86
L_4C0F: N_7178! = N_6F86!  ' RT3F_7B
L_4C12: GOSUB L_0301
L_4C15: DI = &H9F98
L_4C18: N_9F98! = FAC!: SI = &H001A  ' RT3F_7D
L_4C1B: DI = &H7174
L_4C1E: SI = &H9EAA
L_4C21: N_7174! = N_9EAA!  ' RT3F_7B
L_4C24: BX = DI
L_4C26: DI = &H7178
L_4C29: DX = SI
L_4C2B: SI = &H6F86
L_4C2E: N_7178! = N_6F86!  ' RT3F_7B
L_4C31: GOSUB L_0301
L_4C34: DI = &H710A
L_4C37: CompareLeft! = FAC!: CompareRight! = N_710A!  ' RT3F_A1
L_4C3A: BX = 0
L_4C3D: IF CompareLeft! <= CompareRight! THEN GOTO L_4C40  ' flags from L_4C37
L_4C3F: BX = BX - 1
L_4C40: DI = &H7174
L_4C43: SI = &H9EAA
L_4C46: N_7174! = N_9EAA!  ' RT3F_7B
L_4C49: DX = DI
L_4C4B: DI = &H7178
L_4C4E: CX = SI
L_4C50: SI = &H6F86
L_4C53: N_7178! = N_6F86!  ' RT3F_7B
L_4C56: WORD(BP - &H10) = BX
L_4C59: GOSUB L_0301
L_4C5C: DI = &H6F8A
L_4C5F: CompareLeft! = FAC!: CompareRight! = N_6F8A!  ' RT3F_A1
L_4C62: BX = 0
L_4C65: IF CompareLeft! >= CompareRight! THEN GOTO L_4C68  ' flags from L_4C5F
L_4C67: BX = BX - 1
L_4C68: BX = BX AND WORD(BP - &H10)
L_4C6B: DI = &H7174
L_4C6E: SI = 0xA768
L_4C71: N_7174! = N_A768!  ' RT3F_7B
L_4C74: DX = DI
L_4C76: DI = &H7178
L_4C79: SI = &H6F86
L_4C7C: N_7178! = N_6F86!  ' RT3F_7B
L_4C7F: WORD(BP - &H12) = BX
L_4C82: GOSUB L_0301
L_4C85: DI = &H9F98
L_4C88: CompareLeft! = FAC!: CompareRight! = N_9F98!  ' RT3F_A1
L_4C8B: BX = 0
L_4C8E: IF CompareLeft! <> CompareRight! THEN GOTO L_4C91  ' flags from L_4C88
L_4C90: BX = BX - 1
L_4C91: BX = BX AND WORD(BP - &H12)
L_4C94: CompareLeft% = BX: CompareRight% = 0
L_4C96: IF CompareLeft% <> CompareRight% THEN GOTO L_4C9B  ' flags from L_4C94
L_4C98: GOTO L_4CD2
L_4C9B: DI = &H7174
L_4C9E: SI = &H9EAA
L_4CA1: N_7174! = N_9EAA!  ' RT3F_7B
L_4CA4: DI = &H7178
L_4CA7: SI = &H6F86
L_4CAA: N_7178! = N_6F86!  ' RT3F_7B
L_4CAD: GOSUB L_0301
L_4CB0: DI = 0xA754
L_4CB3: N_A754! = FAC!: SI = &H001A  ' RT3F_7D
L_4CB6: SI = DI
L_4CB8: DI = &H71D8
L_4CBB: CompareLeft! = N_A754!: CompareRight! = N_71D8!  ' RT3F_9F
L_4CBE: BX = 0
L_4CC1: IF CompareLeft! >= CompareRight! THEN GOTO L_4CC4  ' flags from L_4CBB
L_4CC3: BX = BX - 1
L_4CC4: FAC! = CSNG(BX)  ' RT3F_57
L_4CC7: FAC! = N(SI) - FAC!  ' RT3F_9B
L_4CCA: DI = SI
L_4CCC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4CCF: GOTO L_4D07
L_4CD2: DI = &H7174
L_4CD5: SI = &H9EAA
L_4CD8: N_7174! = N_9EAA!  ' RT3F_7B
L_4CDB: DI = &H7178
L_4CDE: SI = &H6F86
L_4CE1: N_7178! = N_6F86!  ' RT3F_7B
L_4CE4: GOSUB L_0301
L_4CE7: DI = &H7116
L_4CEA: CompareLeft! = FAC!: CompareRight! = N_7116!  ' RT3F_A1
L_4CED: IF CompareLeft! = CompareRight! THEN GOTO L_4CF2  ' flags from L_4CEA
L_4CEF: GOTO L_4CFE
L_4CF2: DI = 0xA754
L_4CF5: SI = &H6F8A
L_4CF8: N_A754! = N_6F8A!  ' RT3F_7B
L_4CFB: GOTO L_4D07
L_4CFE: DI = 0xA754
L_4D01: SI = &H6F4A
L_4D04: N_A754! = N_6F4A!  ' RT3F_7B
L_4D07: DI = &H71D4
L_4D0A: SI = &H71C0
L_4D0D: FAC! = N_71C0! + N_71D4!  ' RT3F_7F
L_4D10: BX = CINT(FAC!)  ' RT3F_77
L_4D13: SI = BX
L_4D15: SI = SI * (2 ^ 1)
L_4D17: SI = SI * (2 ^ 1)
L_4D19: SI = SI + &H1850
L_4D1D: DI = &H6F4A
L_4D20: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_4D23: BX = 0
L_4D26: IF CompareLeft! >= CompareRight! THEN GOTO L_4D29  ' flags from L_4D20
L_4D28: BX = BX - 1
L_4D29: SI = 0xA754
L_4D2C: CompareLeft! = N_A754!: CompareRight! = 0  ' RT3F_A7
L_4D2F: DX = 0
L_4D32: IF CompareLeft! = CompareRight! THEN GOTO L_4D35  ' flags from L_4D2C
L_4D34: DX = DX - 1
L_4D35: DX = DX AND BX
L_4D37: CompareLeft% = DX: CompareRight% = 0
L_4D39: IF CompareLeft% <> CompareRight% THEN GOTO L_4D3E  ' flags from L_4D37
L_4D3B: GOTO L_4D46
L_4D3E: DI = SI
L_4D40: SI = &H6F54
L_4D43: N(DI) = N_6F54!  ' RT3F_7B
L_4D46: SI = &H71C0
L_4D49: BX = CINT(N_71C0!)  ' RT3F_75
L_4D4C: SI = BX
L_4D4E: SI = SI * (2 ^ 1)
L_4D50: SI = SI * (2 ^ 1)
L_4D52: SI = SI + &H1850
L_4D56: DI = &H8BD4
L_4D59: CompareLeft! = N(SI): CompareRight! = N_8BD4!  ' RT3F_9F
L_4D5C: BX = 0
L_4D5F: IF CompareLeft! <= CompareRight! THEN GOTO L_4D62  ' flags from L_4D59
L_4D61: BX = BX - 1
L_4D62: DI = &H6F54
L_4D65: SI = 0xA754
L_4D68: CompareLeft! = N_A754!: CompareRight! = N_6F54!  ' RT3F_9F
L_4D6B: DX = 0
L_4D6E: IF CompareLeft! <> CompareRight! THEN GOTO L_4D71  ' flags from L_4D68
L_4D70: DX = DX - 1
L_4D71: DX = DX AND BX
L_4D73: CompareLeft% = DX: CompareRight% = 0
L_4D75: IF CompareLeft% <> CompareRight% THEN GOTO L_4D7A  ' flags from L_4D73
L_4D77: GOTO L_4D82
L_4D7A: DI = SI
L_4D7C: SI = &H6F82
L_4D7F: N(DI) = N_6F82!  ' RT3F_7B
L_4D82: BX = &H16
L_4D85: ARGPUSH BX  ' RT3E_42
L_4D88: BX = 3
L_4D8B: LOCATE ARGS(), BX  ' RT3E_44
L_4D8E: ' PRINT statement begins ; RT3F_BC
L_4D91: BX = 0xA76C
L_4D94: PRINT S_A76C$;  ' RT3F_6A
L_4D97: SI = 0xA754
L_4D9A: BX = SI
L_4D9C: DX = BX
L_4D9E: BX = CINT(N_A754!)  ' RT3F_75
L_4DA1: BX = BX * (2 ^ 1)
L_4DA3: BX = BX * (2 ^ 1)
L_4DA5: BX = BX + &H8C76
L_4DA9: PRINT S(BX);  ' RT3F_6A
L_4DAC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4DAF: SI = DX
L_4DB1: DI = &H6F4A
L_4DB4: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_4DB7: BX = 0
L_4DBA: IF CompareLeft! <> CompareRight! THEN GOTO L_4DBD  ' flags from L_4DB4
L_4DBC: BX = BX - 1
L_4DBD: DI = &H710A
L_4DC0: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_4DC3: CX = 0
L_4DC6: IF CompareLeft! <= CompareRight! THEN GOTO L_4DC9  ' flags from L_4DC0
L_4DC8: CX = CX - 1
L_4DC9: CX = CX OR BX
L_4DCB: CompareLeft% = CX: CompareRight% = 0
L_4DCD: IF CompareLeft% <> CompareRight% THEN GOTO L_4DD2  ' flags from L_4DCB
L_4DCF: GOTO L_4E00
L_4DD2: ' PRINT statement begins ; RT3F_BC
L_4DD5: BX = 0xA77A
L_4DD8: PRINT S_A77A$;  ' RT3F_6A
L_4DDB: DI = 0xA6B4
L_4DDE: SI = &H9F98
L_4DE1: FAC! = N_9F98! + N_A6B4!  ' RT3F_7F
L_4DE4: BX = CINT(FAC!)  ' RT3F_77
L_4DE7: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_4DEA: PRINT S(BX);  ' RT3F_6A
L_4DED: BX = 0
L_4DEF: BX = POS(BX)  ' RT3D_21
L_4DF2: BX = BX - &H22
L_4DF5: BX = -BX
L_4DF7: PRINT SPC(BX);  ' RT3F_35; M ledger
L_4DFA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4DFD: GOTO L_4E13
L_4E00: ' PRINT statement begins ; RT3F_BC
L_4E03: BX = 0
L_4E05: BX = POS(BX)  ' RT3D_21
L_4E08: BX = BX - &H22
L_4E0B: BX = -BX
L_4E0D: PRINT SPC(BX);  ' RT3F_35; M ledger
L_4E10: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4E13: BX = &H17
L_4E16: ARGPUSH BX  ' RT3E_42
L_4E19: BX = 3
L_4E1C: LOCATE ARGS(), BX  ' RT3E_44
L_4E1F: ' PRINT statement begins ; RT3F_BC
L_4E22: BX = 0xA788
L_4E25: PRINT S_A788$;  ' RT3F_6A
L_4E28: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4E2B: DI = &H6F4A
L_4E2E: SI = &H8B2C
L_4E31: CompareLeft! = N_8B2C!: CompareRight! = N_6F4A!  ' RT3F_9F
L_4E34: BX = 0
L_4E37: IF CompareLeft! <= CompareRight! THEN GOTO L_4E3A  ' flags from L_4E31
L_4E39: BX = BX - 1
L_4E3A: DX = SI
L_4E3C: SI = 0xA754
L_4E3F: CompareLeft! = N_A754!: CompareRight! = N(DI)  ' RT3F_9F
L_4E42: CX = 0
L_4E45: IF CompareLeft! <> CompareRight! THEN GOTO L_4E48  ' flags from L_4E3F
L_4E47: CX = CX - 1
L_4E48: DI = &H710A
L_4E4B: CompareLeft! = N(SI): CompareRight! = N_710A!  ' RT3F_9F
L_4E4E: AX = 0
L_4E51: IF CompareLeft! <= CompareRight! THEN GOTO L_4E54  ' flags from L_4E4B
L_4E53: AX = AX - 1
L_4E54: AX = AX OR CX
L_4E56: AX = AX AND BX
L_4E58: CompareLeft% = AX: CompareRight% = 0
L_4E5A: IF CompareLeft% <> CompareRight% THEN GOTO L_4E5F  ' flags from L_4E58
L_4E5C: GOTO L_4E85
L_4E5F: ' PRINT statement begins ; RT3F_BC
L_4E62: BX = 0xA7AE
L_4E65: PRINT S_A7AE$;  ' RT3F_6A
L_4E68: SI = DX
L_4E6A: DI = 0xA7B4
L_4E6D: FAC! = N(SI) + N_A7B4!  ' RT3F_7F
L_4E70: BX = CINT(FAC!)  ' RT3F_77
L_4E73: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_4E76: PRINT S(BX);  ' RT3F_6A
L_4E79: BX = 0xA79E
L_4E7C: PRINT S_A79E$  ' RT3F_6E; H newline item, ledger correction
L_4E7F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4E82: GOTO L_4E91
L_4E85: ' PRINT statement begins ; RT3F_BC
L_4E88: BX = 0xF
L_4E8B: PRINT SPC(BX);  ' RT3F_35; M ledger
L_4E8E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4E91: BX = &H18
L_4E94: ARGPUSH BX  ' RT3E_42
L_4E97: BX = 3
L_4E9A: LOCATE ARGS(), BX  ' RT3E_44
L_4E9D: ' PRINT statement begins ; RT3F_BC
L_4EA0: BX = 0xA7B8
L_4EA3: PRINT S_A7B8$;  ' RT3F_6A
L_4EA6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4EA9: DI = &H9F60
L_4EAC: SI = &H6F4A
L_4EAF: N_9F60! = N_6F4A!  ' RT3F_7B
L_4EB2: DI = &H9F64
L_4EB5: SI = &H71F8
L_4EB8: N_9F64! = N_71F8!  ' RT3F_7B
L_4EBB: GOSUB L_1857
L_4EBE: DI = &H9F5C
L_4EC1: SI = &H9F54
L_4EC4: CompareLeft! = N_9F54!: CompareRight! = N_9F5C!  ' RT3F_9F
L_4EC7: IF CompareLeft! = CompareRight! THEN GOTO L_4EA9  ' flags from L_4EC4
L_4EC9: DI = &H9F6C
L_4ECC: SI = &H9F54
L_4ECF: CompareLeft! = N_9F54!: CompareRight! = N_9F6C!  ' RT3F_9F
L_4ED2: IF CompareLeft! <> CompareRight! THEN GOTO L_4ED7  ' flags from L_4ECF
L_4ED4: GOTO L_502E
L_4ED7: SI = &H9F54
L_4EDA: BX = CINT(N_9F54!)  ' RT3F_75
L_4EDD: ON BX GOSUB L_4F12, L_4F12, L_4F12, L_4F12, L_4F12, L_4FAF, L_4EA9, L_4EA9, L_4EA9, L_4EA9, L_4EA9, L_4FC6, L_4FD0, L_4EA9, L_4EA9, L_4EA9, L_4EA9, L_500C, L_4EA9, L_4EA9, L_4EA9, L_4EA9, L_5024  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_4F0F: GOTO L_4D07
L_4F12: DI = &H70AA
L_4F15: SI = &H9F54
L_4F18: FAC! = N_9F54! + N_70AA!  ' RT3F_7F
L_4F1B: DI = 0xA7DE
L_4F1E: BX = SI
L_4F20: N_A7DE! = FAC!: SI = &H001A  ' RT3F_7D
L_4F23: SI = BX
L_4F25: DX = DI
L_4F27: DI = &H8B2C
L_4F2A: CompareLeft! = N(SI): CompareRight! = N_8B2C!  ' RT3F_9F
L_4F2D: CX = 0
L_4F30: IF CompareLeft! <= CompareRight! THEN GOTO L_4F33  ' flags from L_4F2A
L_4F32: CX = CX - 1
L_4F33: DI = 0xA59E
L_4F36: SI = &H6F86
L_4F39: FAC! = N_6F86! + N_A59E!  ' RT3F_7F
L_4F3C: DI = &H8C66
L_4F3F: N_8C66! = FAC!: SI = &H001A  ' RT3F_7D
L_4F42: SI = DX
L_4F44: DI = &H8C6A
L_4F47: N_8C6A! = N(SI)  ' RT3F_7B
L_4F4A: WORD(BP - &H10) = CX
L_4F4D: GOSUB L_0EAC
L_4F50: DI = &H6F4A
L_4F53: CompareLeft! = FAC!: CompareRight! = N_6F4A!  ' RT3F_A1
L_4F56: BX = 0
L_4F59: IF CompareLeft! >= CompareRight! THEN GOTO L_4F5C  ' flags from L_4F53
L_4F5B: BX = BX - 1
L_4F5C: BX = BX OR WORD(BP - &H10)
L_4F5F: CompareLeft% = BX: CompareRight% = 0
L_4F61: IF CompareLeft% <> CompareRight% THEN GOTO L_4F66  ' flags from L_4F5F
L_4F63: GOTO L_4F67
L_4F66: RETURN
L_4F67: DI = 0xA7DE
L_4F6A: SI = &H9F98
L_4F6D: CompareLeft! = N_9F98!: CompareRight! = N_A7DE!  ' RT3F_9F
L_4F70: BX = 0
L_4F73: IF CompareLeft! = CompareRight! THEN GOTO L_4F76  ' flags from L_4F6D
L_4F75: BX = BX - 1
L_4F76: DI = &H71CC
L_4F79: SI = 0xA754
L_4F7C: CompareLeft! = N_A754!: CompareRight! = N_71CC!  ' RT3F_9F
L_4F7F: DX = 0
L_4F82: IF CompareLeft! <= CompareRight! THEN GOTO L_4F85  ' flags from L_4F7C
L_4F84: DX = DX - 1
L_4F85: DX = DX AND BX
L_4F87: BX = DI
L_4F89: DI = &H6F8A
L_4F8C: CompareLeft! = N(SI): CompareRight! = N_6F8A!  ' RT3F_9F
L_4F8F: CX = 0
L_4F92: IF CompareLeft! >= CompareRight! THEN GOTO L_4F95  ' flags from L_4F8C
L_4F94: CX = CX - 1
L_4F95: CX = CX AND DX
L_4F97: CompareLeft% = CX: CompareRight% = 0
L_4F99: IF CompareLeft% <> CompareRight% THEN GOTO L_4F9E  ' flags from L_4F97
L_4F9B: GOTO L_4FA5
L_4F9E: DI = SI
L_4FA0: SWAP BX, SI
L_4FA2: N(DI) = N(SI)  ' RT3F_7B
L_4FA5: DI = &H9F98
L_4FA8: SI = 0xA7DE
L_4FAB: N_9F98! = N_A7DE!  ' RT3F_7B
L_4FAE: RETURN
L_4FAF: DI = &H6F4A
L_4FB2: SI = 0xA010
L_4FB5: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_4FB8: IF CompareLeft! = CompareRight! THEN GOTO L_4FBD  ' flags from L_4FB5
L_4FBA: GOTO L_4FC5
L_4FBD: SI = DI
L_4FBF: DI = 0xA754
L_4FC2: N_A754! = N(SI)  ' RT3F_7B
L_4FC5: RETURN
L_4FC6: DI = 0xA754
L_4FC9: SI = &H6F54
L_4FCC: N_A754! = N_6F54!  ' RT3F_7B
L_4FCF: RETURN
L_4FD0: DI = &H6F4A
L_4FD3: SI = 0xA010
L_4FD6: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_4FD9: IF CompareLeft! = CompareRight! THEN GOTO L_4FDE  ' flags from L_4FD6
L_4FDB: GOTO L_500B
L_4FDE: DI = &H71CC
L_4FE1: SI = 0xA754
L_4FE4: CompareLeft! = N_A754!: CompareRight! = N_71CC!  ' RT3F_9F
L_4FE7: BX = 0
L_4FEA: IF CompareLeft! >= CompareRight! THEN GOTO L_4FED  ' flags from L_4FE4
L_4FEC: BX = BX - 1
L_4FED: DX = DI
L_4FEF: DI = &H71D8
L_4FF2: CompareLeft! = N(SI): CompareRight! = N_71D8!  ' RT3F_9F
L_4FF5: CX = 0
L_4FF8: IF CompareLeft! <= CompareRight! THEN GOTO L_4FFB  ' flags from L_4FF2
L_4FFA: CX = CX - 1
L_4FFB: CX = CX OR BX
L_4FFD: CompareLeft% = CX: CompareRight% = 0
L_4FFF: IF CompareLeft% <> CompareRight% THEN GOTO L_5004  ' flags from L_4FFD
L_5001: GOTO L_500B
L_5004: DI = SI
L_5006: SWAP DX, SI
L_5008: N(DI) = N(SI)  ' RT3F_7B
L_500B: RETURN
L_500C: DI = &H6F4A
L_500F: SI = 0xA010
L_5012: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_5015: IF CompareLeft! = CompareRight! THEN GOTO L_501A  ' flags from L_5012
L_5017: GOTO L_5023
L_501A: DI = 0xA754
L_501D: SI = &H6F8A
L_5020: N_A754! = N_6F8A!  ' RT3F_7B
L_5023: RETURN
L_5024: DI = 0xA754
L_5027: SI = 0xA586
L_502A: N_A754! = N_A586!  ' RT3F_7B
L_502D: RETURN
L_502E: DI = &H7174
L_5031: SI = &H9EAA
L_5034: N_7174! = N_9EAA!  ' RT3F_7B
L_5037: BX = DI
L_5039: DI = &H7178
L_503C: DX = SI
L_503E: SI = &H6F86
L_5041: N_7178! = N_6F86!  ' RT3F_7B
L_5044: GOSUB L_0301
L_5047: DI = &H710A
L_504A: CompareLeft! = FAC!: CompareRight! = N_710A!  ' RT3F_A1
L_504D: BX = 0
L_5050: IF CompareLeft! <= CompareRight! THEN GOTO L_5053  ' flags from L_504A
L_5052: BX = BX - 1
L_5053: DI = &H7174
L_5056: SI = &H9EAA
L_5059: N_7174! = N_9EAA!  ' RT3F_7B
L_505C: DX = DI
L_505E: DI = &H7178
L_5061: CX = SI
L_5063: SI = &H6F86
L_5066: N_7178! = N_6F86!  ' RT3F_7B
L_5069: WORD(BP - &H10) = BX
L_506C: GOSUB L_0301
L_506F: DI = &H6F8A
L_5072: CompareLeft! = FAC!: CompareRight! = N_6F8A!  ' RT3F_A1
L_5075: BX = 0
L_5078: IF CompareLeft! >= CompareRight! THEN GOTO L_507B  ' flags from L_5072
L_507A: BX = BX - 1
L_507B: BX = BX AND WORD(BP - &H10)
L_507E: DI = &H7174
L_5081: SI = 0xA768
L_5084: N_7174! = N_A768!  ' RT3F_7B
L_5087: DX = DI
L_5089: DI = &H7178
L_508C: SI = &H6F86
L_508F: N_7178! = N_6F86!  ' RT3F_7B
L_5092: WORD(BP - &H12) = BX
L_5095: GOSUB L_0301
L_5098: DI = &H9F98
L_509B: CompareLeft! = FAC!: CompareRight! = N_9F98!  ' RT3F_A1
L_509E: BX = 0
L_50A1: IF CompareLeft! <> CompareRight! THEN GOTO L_50A4  ' flags from L_509B
L_50A3: BX = BX - 1
L_50A4: BX = BX AND WORD(BP - &H12)
L_50A7: CompareLeft% = BX: CompareRight% = 0
L_50A9: IF CompareLeft% <> CompareRight% THEN GOTO L_50AE  ' flags from L_50A7
L_50AB: GOTO L_50F6
L_50AE: DI = &H7188
L_50B1: SI = 0xA73C
L_50B4: N_7188! = N_A73C!  ' RT3F_7B
L_50B7: DI = &H718C
L_50BA: SI = &H6F86
L_50BD: N_718C! = N_6F86!  ' RT3F_7B
L_50C0: GOSUB L_0333
L_50C3: BX = CINT(FAC!)  ' RT3F_77
L_50C6: DI = BX
L_50C8: DI = DI * (2 ^ 1)
L_50CA: DI = DI * (2 ^ 1)
L_50CC: DI = DI + &H1850
L_50D0: BX = DI
L_50D2: DI = &H7174
L_50D5: SI = &H9EAA
L_50D8: N_7174! = N_9EAA!  ' RT3F_7B
L_50DB: DI = &H7178
L_50DE: SI = &H6F86
L_50E1: N_7178! = N_6F86!  ' RT3F_7B
L_50E4: WORD(BP - &H14) = BX
L_50E7: GOSUB L_0301
L_50EA: DI = 0xA59E
L_50ED: FAC! = FAC! + N_A59E!  ' RT3F_81
L_50F0: DI = WORD(BP - &H14)
L_50F3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_50F6: DI = &H7188
L_50F9: SI = 0xA768
L_50FC: N_7188! = N_A768!  ' RT3F_7B
L_50FF: BX = DI

```

### Action and combat calculations

```basic
L_5101: DI = &H718C
L_5104: SI = &H6F86
L_5107: N_718C! = N_6F86!  ' RT3F_7B
L_510A: GOSUB L_0333
L_510D: BX = CINT(FAC!)  ' RT3F_77
L_5110: DI = BX
L_5112: DI = DI * (2 ^ 1)
L_5114: DI = DI * (2 ^ 1)
L_5116: DI = DI + &H1850
L_511A: SI = &H9F98
L_511D: N(DI) = N_9F98!  ' RT3F_7B
L_5120: DI = &H7188
L_5123: SI = &H9EAA
L_5126: N_7188! = N_9EAA!  ' RT3F_7B
L_5129: DI = &H718C
L_512C: SI = &H6F86
L_512F: N_718C! = N_6F86!  ' RT3F_7B
L_5132: GOSUB L_0333
L_5135: BX = CINT(FAC!)  ' RT3F_77
L_5138: DI = BX
L_513A: DI = DI * (2 ^ 1)
L_513C: DI = DI * (2 ^ 1)
L_513E: DI = DI + &H1850
L_5142: SI = 0xA754
L_5145: N(DI) = N_A754!  ' RT3F_7B
L_5148: DI = &H6F4A
L_514B: SI = &H6F86
L_514E: FAC! = N_6F86! + N_6F4A!  ' RT3F_7F
L_5151: DI = &H6F86
L_5154: N_6F86! = FAC!: SI = &H001A  ' RT3F_7D
L_5157: SI = DI
L_5159: DI = &H7116
L_515C: CompareLeft! = N_6F86!: CompareRight! = N_7116!  ' RT3F_9F
L_515F: IF CompareLeft! > CompareRight! THEN GOTO L_5164  ' flags from L_515C
L_5161: GOTO L_49FE
L_5164: DI = 0xA7E2
L_5167: SI = &H9EAE
L_516A: N_A7E2! = N_9EAE!  ' RT3F_7B
L_516D: GOSUB L_1D8C
L_5170: DI = &H6F4A
L_5173: SI = 0xA5DE
L_5176: CompareLeft! = N_A5DE!: CompareRight! = N_6F4A!  ' RT3F_9F
L_5179: IF CompareLeft! = CompareRight! THEN GOTO L_517E  ' flags from L_5176
L_517B: GOTO L_5181
L_517E: GOSUB L_4186
L_5181: BX = &H10
L_5184: DX = 0xC
L_5187: CX = 0
L_5189: AX = CX
L_518B: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_518E: BX = &H8F
L_5191: DX = &H8B
L_5194: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_5197: BX = &H8D06
L_519A: DX = &H1040
L_519D: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_51A0: DI = &H6F4A
L_51A3: SI = &H1898
L_51A6: CompareLeft! = N_1898!: CompareRight! = N_6F4A!  ' RT3F_9F
L_51A9: BX = 0
L_51AC: IF CompareLeft! <> CompareRight! THEN GOTO L_51AF  ' flags from L_51A6
L_51AE: BX = BX - 1
L_51AF: CompareLeft% = BX: CompareRight% = 0
L_51B1: IF CompareLeft% >= CompareRight% THEN GOTO L_51B5  ' flags from L_51AF
L_51B3: BX = -BX
L_51B5: FAC! = CSNG(BX)  ' RT3F_57
L_51B8: BX = DI
L_51BA: DI = &H1944
L_51BD: FAC! = FAC! * N_1944!  ' RT3F_91
L_51C0: DI = 0xA7E6
L_51C3: N_A7E6! = FAC!: SI = &H001A  ' RT3F_7D
L_51C6: DI = BX
L_51C8: SI = &H1894
L_51CB: CompareLeft! = N_1894!: CompareRight! = N(DI)  ' RT3F_9F
L_51CE: DX = 0
L_51D1: IF CompareLeft! <> CompareRight! THEN GOTO L_51D4  ' flags from L_51CB
L_51D3: DX = DX - 1
L_51D4: CompareLeft% = DX: CompareRight% = 0
L_51D6: IF CompareLeft% >= CompareRight% THEN GOTO L_51DA  ' flags from L_51D4
L_51D8: DX = -DX
L_51DA: BX = DX
L_51DC: FAC! = CSNG(BX)  ' RT3F_57
L_51DF: DI = &H1950
L_51E2: FAC! = FAC! * N_1950!  ' RT3F_91
L_51E5: DI = 0xA7EA
L_51E8: N_A7EA! = FAC!: SI = &H001A  ' RT3F_7D
L_51EB: DI = &H8A04
L_51EE: SI = &H3B18
L_51F1: N_8A04! = N_3B18!  ' RT3F_7B
L_51F4: DI = &H7174
L_51F7: SI = &H9FCC
L_51FA: N_7174! = N_9FCC!  ' RT3F_7B
L_51FD: BX = DI
L_51FF: DI = &H7178
L_5202: SI = &H6F4A
L_5205: N_7178! = N_6F4A!  ' RT3F_7B
L_5208: GOSUB L_0301
L_520B: DI = &H7174
L_520E: SI = &H71F4
L_5211: N_7174! = N_71F4!  ' RT3F_7B
L_5214: DI = &H7178
L_5217: SI = &H6F4A
L_521A: N_7178! = N_6F4A!  ' RT3F_7B
L_521D: T_12! = FAC!  ' RT3F_71; inline=&H92
L_5221: GOSUB L_0301
L_5224: FAC! = SGN(FAC!)  ' RT3F_31
L_5227: FAC! = T_12! * FAC!  ' RT3F_95; inline=&H92
L_522B: DI = &H71D4
L_522E: FAC! = FAC! * N_71D4!  ' RT3F_91
L_5231: SI = &H71F0
L_5234: FAC! = N_71F0! - FAC!  ' RT3F_9B
L_5237: DI = &H191C
L_523A: FAC! = FAC! - N_191C!  ' RT3F_99
L_523D: DI = 0xA7EA
L_5240: FAC! = FAC! - N_A7EA!  ' RT3F_99
L_5243: DI = &H8B90
L_5246: FAC! = FAC! + N_8B90!  ' RT3F_81
L_5249: DI = 0xA7EE
L_524C: N_A7EE! = FAC!: SI = &H001A  ' RT3F_7D
L_524F: DI = &H8BD8
L_5252: SI = 0xA7EE
L_5255: CompareLeft! = N_A7EE!: CompareRight! = N_8BD8!  ' RT3F_9F
L_5258: IF CompareLeft! < CompareRight! THEN GOTO L_525D  ' flags from L_5255
L_525A: GOTO L_5265
L_525D: SWAP DI, SI
L_525F: N(DI) = N(SI)  ' RT3F_7B
L_5262: GOTO L_5278
L_5265: DI = &H8C0A
L_5268: SI = 0xA7EE
L_526B: CompareLeft! = N_A7EE!: CompareRight! = N_8C0A!  ' RT3F_9F
L_526E: IF CompareLeft! > CompareRight! THEN GOTO L_5273  ' flags from L_526B
L_5270: GOTO L_5278
L_5273: SWAP DI, SI
L_5275: N(DI) = N(SI)  ' RT3F_7B
L_5278: DI = &H70AA
L_527B: SI = &H8B2C
L_527E: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_5281: DI = 0xA7F2
L_5284: N_A7F2! = FAC!: SI = &H001A  ' RT3F_7D
L_5287: SI = &H8BBC
L_528A: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_528D: GOTO L_52E6
L_5290: SI = &H6F82
L_5293: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_5296: GOTO L_52CD
L_5299: ' Alignment NOP
L_529A: SI = &H710E
L_529D: BX = CINT(N_710E!)  ' RT3F_75
L_52A0: AX = BX
L_52A2: DI = 6
L_52A5: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_52A7: DI = AX
L_52A9: SI = 0xA4C2
L_52AC: BX = SI
L_52AE: DX = BX
L_52B0: BX = CINT(N_A4C2!)  ' RT3F_75
L_52B3: DI = DI + BX
L_52B5: DI = DI * (2 ^ 1)
L_52B7: DI = DI * (2 ^ 1)
L_52B9: DI = DI + &H8A1C
L_52BD: SI = DI
L_52BF: FAC! = SGN(N(SI))  ' RT3F_2F
L_52C2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_52C5: SI = DX
L_52C7: DI = &H6F4A
L_52CA: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_52CD: DI = 0xA4C2
L_52D0: N_A4C2! = FAC!: SI = &H001A  ' RT3F_7D
L_52D3: SI = DI
L_52D5: DI = &H71D4
L_52D8: CompareLeft! = N_A4C2!: CompareRight! = N_71D4!  ' RT3F_9F
L_52DB: IF CompareLeft! <= CompareRight! THEN GOTO L_529A  ' flags from L_52D8
L_52DD: DI = &H6F4A
L_52E0: SI = &H710E
L_52E3: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_52E6: DI = &H710E
L_52E9: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_52EC: SI = DI
L_52EE: DI = 0xA7F2
L_52F1: CompareLeft! = N_710E!: CompareRight! = N_A7F2!  ' RT3F_9F
L_52F4: IF CompareLeft! <= CompareRight! THEN GOTO L_5290  ' flags from L_52F1
L_52F6: DI = 0xA1A2
L_52F9: SI = &H8BA4
L_52FC: FAC! = N_8BA4! * N_A1A2!  ' RT3F_8F
L_52FF: DI = 0xA7F6
L_5302: N_A7F6! = FAC!: SI = &H001A  ' RT3F_7D
L_5305: DI = &H6F4A
L_5308: SI = &H8BA0
L_530B: FAC! = N_8BA0! + N_6F4A!  ' RT3F_7F
L_530E: GOTO L_5B10
L_5311: ' Alignment NOP
L_5312: DI = &H8B9C
L_5315: SI = 0xA7FA
L_5318: CompareLeft! = N_A7FA!: CompareRight! = N_8B9C!  ' RT3F_9F
L_531B: IF CompareLeft! < CompareRight! THEN GOTO L_5320  ' flags from L_5318
L_531D: GOTO L_5328
L_5320: DI = SI
L_5322: SI = &H6F82
L_5325: N(DI) = N_6F82!  ' RT3F_7B
L_5328: SI = &H710A
L_532B: FAC! = N_710A!: DI = &H001E  ' RT3F_6F
L_532E: GOTO L_5A4D
L_5331: ' Alignment NOP
L_5332: DI = &H7174
L_5335: SI = &H9EAA
L_5338: N_7174! = N_9EAA!  ' RT3F_7B
L_533B: BX = DI
L_533D: DI = &H7178
L_5340: SI = &H9EA6
L_5343: N_7178! = N_9EA6!  ' RT3F_7B
L_5346: GOSUB L_0301
L_5349: DI = 0xA754
L_534C: N_A754! = FAC!: SI = &H001A  ' RT3F_7D
L_534F: SI = DI
L_5351: CompareLeft! = N_A754!: CompareRight! = 0  ' RT3F_A7
L_5354: BX = 0
L_5357: IF CompareLeft! <> CompareRight! THEN GOTO L_535A  ' flags from L_5351
L_5359: BX = BX - 1
L_535A: DI = &H7174
L_535D: SI = &H6F4A
L_5360: N_7174! = N_6F4A!  ' RT3F_7B
L_5363: DI = &H7178
L_5366: SI = &H9EA6
L_5369: N_7178! = N_9EA6!  ' RT3F_7B
L_536C: WORD(BP - &H10) = BX
L_536F: GOSUB L_0301
L_5372: DI = 0xA7FA
L_5375: CompareLeft! = FAC!: CompareRight! = N_A7FA!  ' RT3F_A1
L_5378: BX = 0
L_537B: IF CompareLeft! >= CompareRight! THEN GOTO L_537E  ' flags from L_5375
L_537D: BX = BX - 1
L_537E: BX = BX OR WORD(BP - &H10)
L_5381: CompareLeft% = BX: CompareRight% = 0
L_5383: IF CompareLeft% = CompareRight% THEN GOTO L_5388  ' flags from L_5381
L_5385: GOTO L_5A44
L_5388: DI = &H6F54
L_538B: SI = 0xA754
L_538E: CompareLeft! = N_A754!: CompareRight! = N_6F54!  ' RT3F_9F
L_5391: BX = 0
L_5394: IF CompareLeft! <= CompareRight! THEN GOTO L_5397  ' flags from L_538E
L_5396: BX = BX - 1
L_5397: DI = &H6F8A
L_539A: CompareLeft! = N(SI): CompareRight! = N_6F8A!  ' RT3F_9F
L_539D: DX = 0
L_53A0: IF CompareLeft! >= CompareRight! THEN GOTO L_53A3  ' flags from L_539A
L_53A2: DX = DX - 1
L_53A3: DX = DX AND BX
L_53A5: DI = &H7116
L_53A8: BX = SI
L_53AA: SI = &H9EA6
L_53AD: FAC! = N_9EA6! + N_7116!  ' RT3F_7F
L_53B0: CX = BX
L_53B2: BX = CINT(FAC!)  ' RT3F_77
L_53B5: SI = BX
L_53B7: SI = SI * (2 ^ 1)
L_53B9: SI = SI * (2 ^ 1)
L_53BB: SI = SI + &H1850
L_53BF: BX = DI
L_53C1: DI = &H6F4A
L_53C4: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_53C7: AX = 0
L_53CA: IF CompareLeft! = CompareRight! THEN GOTO L_53CD  ' flags from L_53C4
L_53CC: AX = AX - 1
L_53CD: AX = AX OR DX
L_53CF: DI = BX
L_53D1: SI = CX
L_53D3: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_53D6: DX = 0
L_53D9: IF CompareLeft! <> CompareRight! THEN GOTO L_53DC  ' flags from L_53D3
L_53DB: DX = DX - 1
L_53DC: DX = DX OR AX
L_53DE: CompareLeft% = DX: CompareRight% = 0
L_53E0: IF CompareLeft% = CompareRight% THEN GOTO L_53E5  ' flags from L_53DE
L_53E2: GOTO L_5A44
L_53E5: DI = &H6F8A
L_53E8: SI = &H9EA6
L_53EB: FAC! = N_9EA6! * N_6F8A!  ' RT3F_8F
L_53EE: DI = 0xA764
L_53F1: FAC! = FAC! + N_A764!  ' RT3F_81
L_53F4: DI = 0xA7FE
L_53F7: N_A7FE! = FAC!: SI = &H001A  ' RT3F_7D
L_53FA: SI = DI
L_53FC: BX = CINT(N_A7FE!)  ' RT3F_75
L_53FF: SI = BX
L_5401: SI = SI * (2 ^ 1)
L_5403: SI = SI * (2 ^ 1)
L_5405: SI = SI + &H1850
L_5409: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_540C: IF CompareLeft! <> CompareRight! THEN GOTO L_5411  ' flags from L_5409
L_540E: GOTO L_5A44
L_5411: DI = &H7188
L_5414: SI = &H9EAA
L_5417: N_7188! = N_9EAA!  ' RT3F_7B
L_541A: DI = &H718C
L_541D: SI = &H9EA6
L_5420: N_718C! = N_9EA6!  ' RT3F_7B
L_5423: GOSUB L_0333
L_5426: BX = CINT(FAC!)  ' RT3F_77
L_5429: DI = BX
L_542B: DI = DI * (2 ^ 1)
L_542D: DI = DI * (2 ^ 1)
L_542F: DI = DI + &H1850
L_5433: BX = DI
L_5435: DI = &H6F8A
L_5438: SI = 0xA754
L_543B: CompareLeft! = N_A754!: CompareRight! = N_6F8A!  ' RT3F_9F
L_543E: DX = 0
L_5441: IF CompareLeft! <> CompareRight! THEN GOTO L_5444  ' flags from L_543B
L_5443: DX = DX - 1
L_5444: DX = DX * (2 ^ 1)
L_5446: DX = DX * (2 ^ 1)
L_5448: DX = DX * (2 ^ 1)
L_544A: DX = -DX
L_544C: SWAP DX, BX
L_544E: FAC! = CSNG(BX)  ' RT3F_57
L_5451: DI = DX
L_5453: BX = SI
L_5455: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5458: SI = BX
L_545A: DI = &H6F54
L_545D: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_5460: IF CompareLeft! = CompareRight! THEN GOTO L_5465  ' flags from L_545D
L_5462: GOTO L_555D
L_5465: DI = 0xA010
L_5468: SI = &H6F82
L_546B: N_A010! = N_6F82!  ' RT3F_7B
L_546E: SI = 0xA7FE
L_5471: BX = CINT(N_A7FE!)  ' RT3F_75
L_5474: SI = BX
L_5476: SI = SI * (2 ^ 1)
L_5478: SI = SI * (2 ^ 1)
L_547A: SI = SI + &H1850
L_547E: DI = 0xA802
L_5481: N_A802! = N(SI)  ' RT3F_7B
L_5484: SI = &H71E8
L_5487: FAC! = N_71E8!: DI = &H001E  ' RT3F_6F
L_548A: GOTO L_5507
L_548D: ' Alignment NOP
L_548E: SI = &H8BDC
L_5491: BX = SI
L_5493: DX = BX
L_5495: BX = CINT(N_8BDC!)  ' RT3F_75
L_5498: SI = BX
L_549A: SI = SI * (2 ^ 1)
L_549C: SI = SI * (2 ^ 1)
L_549E: SI = SI + &H1850
L_54A2: DI = 0xA802
L_54A5: CompareLeft! = N(SI): CompareRight! = N_A802!  ' RT3F_9F
L_54A8: IF CompareLeft! = CompareRight! THEN GOTO L_54AD  ' flags from L_54A5
L_54AA: GOTO L_54FE
L_54AD: DI = SI
L_54AF: SI = 0xA806
L_54B2: N(DI) = N_A806!  ' RT3F_7B
L_54B5: DI = DX
L_54B7: SI = &H71EC
L_54BA: N(DI) = N_71EC!  ' RT3F_7B
L_54BD: DI = &H71D4
L_54C0: SI = 0xA7FE
L_54C3: FAC! = N_A7FE! + N_71D4!  ' RT3F_7F
L_54C6: BX = SI
L_54C8: DX = BX
L_54CA: BX = CINT(FAC!)  ' RT3F_77
L_54CD: DI = BX
L_54CF: DI = DI * (2 ^ 1)
L_54D1: DI = DI * (2 ^ 1)
L_54D3: DI = DI + &H1850
L_54D7: SI = DX
L_54D9: BX = DI
L_54DB: DI = &H6F54
L_54DE: FAC! = N(SI) + N_6F54!  ' RT3F_7F
L_54E1: DX = BX
L_54E3: BX = CINT(FAC!)  ' RT3F_77
L_54E6: SI = BX
L_54E8: SI = SI * (2 ^ 1)
L_54EA: SI = SI * (2 ^ 1)
L_54EC: SI = SI + &H1850
L_54F0: DI = DX
L_54F2: N(DI) = N(SI)  ' RT3F_7B
L_54F5: DI = 0xA010
L_54F8: SI = &H6F4A
L_54FB: N_A010! = N_6F4A!  ' RT3F_7B
L_54FE: DI = &H6F4A

```

### Fire and damage reporting

```basic
L_5501: SI = &H8BDC
L_5504: FAC! = N_8BDC! + N_6F4A!  ' RT3F_7F
L_5507: DI = &H8BDC
L_550A: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_550D: SI = DI
L_550F: DI = &H71EC
L_5512: CompareLeft! = N_8BDC!: CompareRight! = N_71EC!  ' RT3F_9F
L_5515: IF CompareLeft! > CompareRight! THEN GOTO L_551A  ' flags from L_5512
L_5517: GOTO L_548E
L_551A: DI = &H6F4A
L_551D: SI = 0xA010
L_5520: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_5523: IF CompareLeft! = CompareRight! THEN GOTO L_5528  ' flags from L_5520
L_5525: GOTO L_555A
L_5528: GOSUB L_1D8C
L_552B: BX = &H16
L_552E: ARGPUSH BX  ' RT3E_42
L_5531: BX = 3
L_5534: LOCATE ARGS(), BX  ' RT3E_44
L_5537: ' PRINT statement begins ; RT3F_BC
L_553A: SI = &H9EA6
L_553D: BX = CINT(N_9EA6!)  ' RT3F_75
L_5540: BX = BX * (2 ^ 1)
L_5542: BX = BX * (2 ^ 1)
L_5544: BX = BX + &H4288
L_5548: PRINT S(BX);  ' RT3F_6A
L_554B: BX = 0xA80A
L_554E: PRINT S_A80A$  ' RT3F_6E; H newline item, ledger correction
L_5551: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5554: GOSUB L_1831
L_5557: GOTO L_5A16
L_555A: GOTO L_5A44
L_555D: DI = &H7174
L_5560: SI = 0xA768
L_5563: N_7174! = N_A768!  ' RT3F_7B
L_5566: BX = DI
L_5568: DI = &H7178
L_556B: SI = &H9EA6
L_556E: N_7178! = N_9EA6!  ' RT3F_7B
L_5571: GOSUB L_0301
L_5574: DI = &H9F98
L_5577: N_9F98! = FAC!: SI = &H001A  ' RT3F_7D
L_557A: SI = 0xA7FE
L_557D: BX = SI
L_557F: DX = BX
L_5581: BX = CINT(N_A7FE!)  ' RT3F_75
L_5584: SI = BX
L_5586: SI = SI * (2 ^ 1)
L_5588: SI = SI * (2 ^ 1)
L_558A: SI = SI + &H1850
L_558E: BX = DI
L_5590: DI = &H70AA
L_5593: FAC! = N(SI) + N_70AA!  ' RT3F_7F
L_5596: DI = 0xA802
L_5599: N_A802! = FAC!: SI = &H001A  ' RT3F_7D
L_559C: DI = &H7174
L_559F: SI = &H7200
L_55A2: N_7174! = N_7200!  ' RT3F_7B
L_55A5: CX = DI
L_55A7: DI = &H7178
L_55AA: SI = &H9EA6
L_55AD: N_7178! = N_9EA6!  ' RT3F_7B
L_55B0: GOSUB L_0301
L_55B3: DI = &H71D4
L_55B6: FAC! = FAC! * N_71D4!  ' RT3F_91
L_55B9: BX = DI
L_55BB: DI = &H7174
L_55BE: SI = &H8BD8
L_55C1: N_7174! = N_8BD8!  ' RT3F_7B
L_55C4: DX = DI
L_55C6: DI = &H7178
L_55C9: SI = &H9EA6
L_55CC: N_7178! = N_9EA6!  ' RT3F_7B
L_55CF: T_12! = FAC!  ' RT3F_71; inline=&H92
L_55D3: GOSUB L_0301
L_55D6: FAC! = T_12! + FAC!  ' RT3F_85; inline=&H92
L_55DA: DI = &H71CC
L_55DD: SI = 0xA7FE
L_55E0: T_13! = FAC!  ' RT3F_71; inline=&H93
L_55E4: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_55E7: BX = CINT(FAC!)  ' RT3F_77
L_55EA: DI = BX
L_55EC: DI = DI * (2 ^ 1)
L_55EE: DI = DI * (2 ^ 1)
L_55F0: DI = DI + &H1850
L_55F4: SI = &H7042
L_55F7: FAC! = N_7042! + N(DI)  ' RT3F_7F
L_55FA: DI = &H8BFA
L_55FD: SI = &H71D4
L_5600: N_8BFA! = N_71D4!  ' RT3F_7B
L_5603: DI = &H8BFE
L_5606: SI = &H9F98
L_5609: N_8BFE! = N_9F98!  ' RT3F_7B
L_560C: T_14! = FAC!  ' RT3F_71; inline=&H94
L_5610: GOSUB L_0CD1
L_5613: DI = &H6F4A
L_5616: FAC! = FAC! + N_6F4A!  ' RT3F_81
L_5619: SI = &H717C
L_561C: BX = DI
L_561E: FAC! = N_717C! / FAC!  ' RT3F_8B
L_5621: FAC! = T_14! + FAC!  ' RT3F_85; inline=&H94
L_5625: DI = &H7174
L_5628: SI = 0xA73C
L_562B: N_7174! = N_A73C!  ' RT3F_7B
L_562E: DX = DI
L_5630: DI = &H7178
L_5633: CX = SI
L_5635: SI = &H9EA6
L_5638: N_7178! = N_9EA6!  ' RT3F_7B
L_563B: T_15! = FAC!  ' RT3F_71; inline=&H95
L_563F: GOSUB L_0301
L_5642: DI = &H6F54
L_5645: CompareLeft! = FAC!: CompareRight! = N_6F54!  ' RT3F_A1
L_5648: AX = 0
L_564B: IF CompareLeft! <= CompareRight! THEN GOTO L_564E  ' flags from L_5645
L_564D: AX = AX - 1
L_564E: BX = &H14
L_5651: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_5653: BX = AX
L_5655: FAC! = CSNG(BX)  ' RT3F_57
L_5658: FAC! = T_15! - FAC!  ' RT3F_9D; inline=&H95
L_565C: DI = &H7174
L_565F: SI = 0xA73C
L_5662: N_7174! = N_A73C!  ' RT3F_7B
L_5665: BX = DI
L_5667: DI = &H7178
L_566A: DX = SI
L_566C: SI = &H9EA6
L_566F: N_7178! = N_9EA6!  ' RT3F_7B
L_5672: T_16! = FAC!  ' RT3F_71; inline=&H96
L_5676: GOSUB L_0301
L_5679: DI = &H6F4A
L_567C: CompareLeft! = FAC!: CompareRight! = N_6F4A!  ' RT3F_A1
L_567F: AX = 0
L_5682: IF CompareLeft! <= CompareRight! THEN GOTO L_5685  ' flags from L_567C
L_5684: AX = AX - 1
L_5685: BX = &H1E
L_5688: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_568A: BX = AX
L_568C: FAC! = CSNG(BX)  ' RT3F_57
L_568F: FAC! = T_16! - FAC!  ' RT3F_9D; inline=&H96
L_5693: DI = &H7174
L_5696: SI = 0xA73C
L_5699: N_7174! = N_A73C!  ' RT3F_7B
L_569C: DI = &H7178
L_569F: SI = &H9EA6
L_56A2: N_7178! = N_9EA6!  ' RT3F_7B
L_56A5: T_17! = FAC!  ' RT3F_71; inline=&H97
L_56A9: GOSUB L_0301
L_56AC: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_56AF: AX = 0
L_56B2: IF CompareLeft! <= CompareRight! THEN GOTO L_56B5  ' flags from L_56AC
L_56B4: AX = AX - 1
L_56B5: BX = &H32
L_56B8: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_56BA: BX = AX
L_56BC: FAC! = CSNG(BX)  ' RT3F_57
L_56BF: FAC! = T_17! - FAC!  ' RT3F_9D; inline=&H97
L_56C3: SI = &H9F98
L_56C6: T_18! = FAC!  ' RT3F_71; inline=&H98
L_56CA: BX = CINT(N(SI))  ' RT3F_75
L_56CD: SI = BX
L_56CF: SI = SI * (2 ^ 1)
L_56D1: SI = SI * (2 ^ 1)
L_56D3: BX = SI
L_56D5: SI = SI + &H8AF0
L_56D9: BX = BX + &H8894
L_56DD: SWAP BX, SI
L_56DF: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_56E2: DX = 0
L_56E5: IF CompareLeft! <= CompareRight! THEN GOTO L_56E8  ' flags from L_56DF
L_56E7: DX = DX - 1
L_56E8: SWAP DX, BX
L_56EA: FAC! = CSNG(BX)  ' RT3F_57
L_56ED: SI = DX
L_56EF: FAC! = N(SI) * FAC!  ' RT3F_93
L_56F2: FAC! = T_18! + FAC!  ' RT3F_85; inline=&H98
L_56F6: DI = &H71F0
L_56F9: FAC! = FAC! + N_71F0!  ' RT3F_81
L_56FC: DI = 0xA816
L_56FF: N_A816! = FAC!: SI = &H001A  ' RT3F_7D
L_5702: BX = DI
L_5704: DI = &H6F8A
L_5707: SI = 0xA754
L_570A: CompareLeft! = N_A754!: CompareRight! = N_6F8A!  ' RT3F_9F
L_570D: IF CompareLeft! = CompareRight! THEN GOTO L_5712  ' flags from L_570A
L_570F: GOTO L_571F
L_5712: SI = BX
L_5714: DI = &H719C
L_5717: FAC! = N(SI) * N_719C!  ' RT3F_8F
L_571A: DI = BX
L_571C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_571F: DI = &H8BD8
L_5722: SI = 0xA816
L_5725: CompareLeft! = N_A816!: CompareRight! = N_8BD8!  ' RT3F_9F
L_5728: IF CompareLeft! < CompareRight! THEN GOTO L_572D  ' flags from L_5725
L_572A: GOTO L_5735
L_572D: SWAP DI, SI
L_572F: N(DI) = N(SI)  ' RT3F_7B
L_5732: GOTO L_5748
L_5735: DI = &H8C0A
L_5738: SI = 0xA816
L_573B: CompareLeft! = N_A816!: CompareRight! = N_8C0A!  ' RT3F_9F
L_573E: IF CompareLeft! > CompareRight! THEN GOTO L_5743  ' flags from L_573B
L_5740: GOTO L_5748
L_5743: SWAP DI, SI
L_5745: N(DI) = N(SI)  ' RT3F_7B
L_5748: GOSUB L_1D8C
L_574B: BX = &H14
L_574E: ARGPUSH BX  ' RT3E_42
L_5751: BX = 3
L_5754: LOCATE ARGS(), BX  ' RT3E_44
L_5757: ' PRINT statement begins ; RT3F_BC
L_575A: SI = &H9EA6
L_575D: DX = BX
L_575F: BX = CINT(N_9EA6!)  ' RT3F_75
L_5762: BX = BX * (2 ^ 1)
L_5764: BX = BX * (2 ^ 1)
L_5766: BX = BX + &H4288
L_576A: PRINT S(BX);  ' RT3F_6A
L_576D: BX = 0xA81A
L_5770: PRINT S_A81A$  ' RT3F_6E; H newline item, ledger correction
L_5773: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5776: BX = &H15
L_5779: ARGPUSH BX  ' RT3E_42
L_577C: BX = DX
L_577E: LOCATE ARGS(), BX  ' RT3E_44
L_5781: ' PRINT statement begins ; RT3F_BC
L_5784: SI = 0xA802
L_5787: BX = CINT(N_A802!)  ' RT3F_75
L_578A: BX = BX * (2 ^ 1)
L_578C: BX = BX * (2 ^ 1)
L_578E: BX = BX + &H4390
L_5792: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_5795: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5798: DI = 0xA824
L_579B: SI = 0xA838
L_579E: N_A824! = N_A838!  ' RT3F_7B
L_57A1: DI = 0xA05E
L_57A4: N_A05E! = N_A838!  ' RT3F_7B
L_57A7: DI = 0xA828
L_57AA: N_A828! = N_A838!  ' RT3F_7B
L_57AD: DI = 0xA82C
L_57B0: N_A82C! = N_A838!  ' RT3F_7B
L_57B3: DI = &H9F4C
L_57B6: N_9F4C! = N_A838!  ' RT3F_7B
L_57B9: DI = 0xA830
L_57BC: N_A830! = N_A838!  ' RT3F_7B
L_57BF: DI = &H9F04
L_57C2: SI = 0xA802
L_57C5: CompareLeft! = N_A802!: CompareRight! = N_9F04!  ' RT3F_9F
L_57C8: BX = 0
L_57CB: IF CompareLeft! <= CompareRight! THEN GOTO L_57CE  ' flags from L_57C5
L_57CD: BX = BX - 1
L_57CE: CompareLeft% = BX: CompareRight% = 0
L_57D0: IF CompareLeft% >= CompareRight% THEN GOTO L_57D4  ' flags from L_57CE
L_57D2: BX = -BX
L_57D4: FAC! = CSNG(BX)  ' RT3F_57
L_57D7: DI = 0xA834
L_57DA: N_A834! = FAC!: SI = &H001A  ' RT3F_7D
L_57DD: DI = &H71D8
L_57E0: SI = 0xA7FE
L_57E3: FAC! = N_A7FE! + N_71D8!  ' RT3F_7F
L_57E6: BX = CINT(FAC!)  ' RT3F_77
L_57E9: SI = BX
L_57EB: SI = SI * (2 ^ 1)
L_57ED: SI = SI * (2 ^ 1)
L_57EF: SI = SI + &H1850
L_57F3: DI = &H6F8A
L_57F6: BX = SI
L_57F8: SI = 0xA754
L_57FB: CompareLeft! = N_A754!: CompareRight! = N_6F8A!  ' RT3F_9F
L_57FE: DX = 0
L_5801: IF CompareLeft! <> CompareRight! THEN GOTO L_5804  ' flags from L_57FB
L_5803: DX = DX - 1
L_5804: CX = 1
L_5807: CX = CX - DX
L_5809: SWAP CX, BX
L_580B: FAC! = CSNG(BX)  ' RT3F_57
L_580E: SI = CX
L_5810: FAC! = N(SI) * FAC!  ' RT3F_93
L_5813: DI = 0xA83C
L_5816: N_A83C! = FAC!: SI = &H001A  ' RT3F_7D
L_5819: SI = &H6F4A
L_581C: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_581F: GOTO L_5923
L_5822: SI = 0xA834
L_5825: CompareLeft! = N_A834!: CompareRight! = 0  ' RT3F_A7
L_5828: BX = 0
L_582B: IF CompareLeft! <> CompareRight! THEN GOTO L_582E  ' flags from L_5825
L_582D: BX = BX - 1
L_582E: DI = &H71D4
L_5831: DX = SI
L_5833: SI = 0xA7FE
L_5836: FAC! = N_A7FE! + N_71D4!  ' RT3F_7F
L_5839: CX = BX
L_583B: BX = CINT(FAC!)  ' RT3F_77
L_583E: SI = BX
L_5840: SI = SI * (2 ^ 1)
L_5842: SI = SI * (2 ^ 1)
L_5844: SI = SI + &H1850
L_5848: DI = &H6F4A
L_584B: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_584E: BX = 0
L_5851: IF CompareLeft! >= CompareRight! THEN GOTO L_5854  ' flags from L_584B
L_5853: BX = BX - 1
L_5854: BX = BX AND CX
L_5856: SI = DX
L_5858: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_585B: CX = 0
L_585E: IF CompareLeft! <> CompareRight! THEN GOTO L_5861  ' flags from L_5858
L_5860: CX = CX - 1
L_5861: SI = &H3AB0
L_5864: CompareLeft! = N_3AB0!: CompareRight! = N(DI)  ' RT3F_9F
L_5867: DX = 0
L_586A: IF CompareLeft! >= CompareRight! THEN GOTO L_586D  ' flags from L_5864
L_586C: DX = DX - 1
L_586D: DX = DX AND CX
L_586F: DX = DX OR BX
L_5871: CompareLeft% = DX: CompareRight% = 0
L_5873: IF CompareLeft% = CompareRight% THEN GOTO L_5878  ' flags from L_5871
L_5875: GOTO L_591A
L_5878: DI = &H6F4A
L_587B: SI = 0xA834
L_587E: CompareLeft! = N_A834!: CompareRight! = N_6F4A!  ' RT3F_9F
L_5881: IF CompareLeft! = CompareRight! THEN GOTO L_5886  ' flags from L_587E
L_5883: GOTO L_5894
L_5886: SI = DI
L_5888: DI = 0xA720
L_588B: N_A720! = N(SI)  ' RT3F_7B
L_588E: GOSUB L_72BA
L_5891: GOTO L_58B7
L_5894: DI = &H71D4
L_5897: SI = 0xA7FE
L_589A: FAC! = N_A7FE! + N_71D4!  ' RT3F_7F
L_589D: BX = CINT(FAC!)  ' RT3F_77
L_58A0: DI = BX
L_58A2: DI = DI * (2 ^ 1)
L_58A4: DI = DI * (2 ^ 1)
L_58A6: DI = DI + &H1850
L_58AA: SI = DI
L_58AC: DI = &H70AA
L_58AF: FAC! = N(SI) + N_70AA!  ' RT3F_7F
L_58B2: DI = SI
L_58B4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_58B7: FAC! = RND  ' RT3D_34
L_58BA: DI = &H717C
L_58BD: FAC! = FAC! * N_717C!  ' RT3F_91
L_58C0: DI = 0xA816
L_58C3: CompareLeft! = FAC!: CompareRight! = N_A816!  ' RT3F_A1
L_58C6: BX = 0
L_58C9: IF CompareLeft! >= CompareRight! THEN GOTO L_58CC  ' flags from L_58C3
L_58CB: BX = BX - 1
L_58CC: CompareLeft% = BX: CompareRight% = 0
L_58CE: IF CompareLeft% >= CompareRight% THEN GOTO L_58D2  ' flags from L_58CC
L_58D0: BX = -BX
L_58D2: FAC! = CSNG(BX)  ' RT3F_57
L_58D5: DI = 0xA840
L_58D8: N_A840! = FAC!: SI = &H001A  ' RT3F_7D
L_58DB: SI = DI
L_58DD: DI = &H6F4A
L_58E0: CompareLeft! = N_A840!: CompareRight! = N_6F4A!  ' RT3F_9F
L_58E3: IF CompareLeft! = CompareRight! THEN GOTO L_58E8  ' flags from L_58E0
L_58E5: GOTO L_5900
L_58E8: SI = 0xA824
L_58EB: FAC! = N_A824! + N(DI)  ' RT3F_7F
L_58EE: SWAP SI, DI
L_58F0: BX = SI
L_58F2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_58F5: SI = BX
L_58F7: DI = 0xA7E2
L_58FA: N_A7E2! = N(SI)  ' RT3F_7B
L_58FD: GOTO L_590E
L_5900: DI = &H6F4A
L_5903: SI = 0xA844
L_5906: FAC! = N_A844! + N_6F4A!  ' RT3F_7F
L_5909: DI = SI
L_590B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_590E: DI = 0xA010
L_5911: SI = &H6F82
L_5914: N_A010! = N_6F82!  ' RT3F_7B
L_5917: GOSUB L_6523
L_591A: DI = &H6F4A
L_591D: SI = 0xA848
L_5920: FAC! = N_A848! + N_6F4A!  ' RT3F_7F
L_5923: DI = 0xA848
L_5926: N_A848! = FAC!: SI = &H001A  ' RT3F_7D
L_5929: SI = DI
L_592B: DI = 0xA83C
L_592E: CompareLeft! = N_A848!: CompareRight! = N_A83C!  ' RT3F_9F
L_5931: IF CompareLeft! > CompareRight! THEN GOTO L_5936  ' flags from L_592E
L_5933: GOTO L_5822
L_5936: BX = &H16
L_5939: ARGPUSH BX  ' RT3E_42
L_593C: BX = 3
L_593F: LOCATE ARGS(), BX  ' RT3E_44
L_5942: ' PRINT statement begins ; RT3F_BC
L_5945: BX = 0xA84C
L_5948: PRINT S_A84C$;  ' RT3F_6A
L_594B: BX = 0xA824
L_594E: PRINT N_A824!;  ' RT3F_67; H expanded ledger
L_5951: BX = 0xA856
L_5954: PRINT S_A856$  ' RT3F_6E; H newline item, ledger correction
L_5957: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_595A: DI = &H6F4A
L_595D: SI = 0xA824
L_5960: CompareLeft! = N_A824!: CompareRight! = N_6F4A!  ' RT3F_9F
L_5963: IF CompareLeft! >= CompareRight! THEN GOTO L_5968  ' flags from L_5960
L_5965: GOTO L_5A16
L_5968: BX = &H17
L_596B: ARGPUSH BX  ' RT3E_42
L_596E: BX = 3
L_5971: LOCATE ARGS(), BX  ' RT3E_44
L_5974: SI = 0xA830
L_5977: CompareLeft! = N_A830!: CompareRight! = 0  ' RT3F_A7
L_597A: IF CompareLeft! > CompareRight! THEN GOTO L_597F  ' flags from L_5977
L_597C: GOTO L_5990
L_597F: ' PRINT statement begins ; RT3F_BC
L_5982: BX = SI
L_5984: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_5987: BX = 0xA85E
L_598A: PRINT S_A85E$  ' RT3F_6E; H newline item, ledger correction
L_598D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5990: BX = &H18
L_5993: ARGPUSH BX  ' RT3E_42
L_5996: BX = 3
L_5999: LOCATE ARGS(), BX  ' RT3E_44
L_599C: SI = &H9F4C
L_599F: CompareLeft! = N_9F4C!: CompareRight! = 0  ' RT3F_A7
L_59A2: IF CompareLeft! > CompareRight! THEN GOTO L_59A7  ' flags from L_599F
L_59A4: GOTO L_59BC
L_59A7: ' PRINT statement begins ; RT3F_BC
L_59AA: BX = &H8B28
L_59AD: PRINT S_8B28$;  ' RT3F_6A
L_59B0: BX = 0xA878
L_59B3: PRINT S_A878$;  ' RT3F_6A
L_59B6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_59B9: GOTO L_5A16
L_59BC: SI = 0xA82C
L_59BF: CompareLeft! = N_A82C!: CompareRight! = 0  ' RT3F_A7
L_59C2: IF CompareLeft! > CompareRight! THEN GOTO L_59C7  ' flags from L_59BF
L_59C4: GOTO L_59D6
L_59C7: ' PRINT statement begins ; RT3F_BC
L_59CA: BX = 0xA888
L_59CD: PRINT S_A888$;  ' RT3F_6A
L_59D0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_59D3: GOTO L_5A16
L_59D6: SI = 0xA828
L_59D9: CompareLeft! = N_A828!: CompareRight! = 0  ' RT3F_A7
L_59DC: IF CompareLeft! > CompareRight! THEN GOTO L_59E1  ' flags from L_59D9
L_59DE: GOTO L_59F0
L_59E1: ' PRINT statement begins ; RT3F_BC
L_59E4: BX = 0xA8A6
L_59E7: PRINT S_A8A6$;  ' RT3F_6A
L_59EA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_59ED: GOTO L_5A16
L_59F0: SI = 0xA05E
L_59F3: CompareLeft! = N_A05E!: CompareRight! = 0  ' RT3F_A7
L_59F6: IF CompareLeft! > CompareRight! THEN GOTO L_59FB  ' flags from L_59F3
L_59F8: GOTO L_5A0A
L_59FB: ' PRINT statement begins ; RT3F_BC
L_59FE: BX = 0xA8B8
L_5A01: PRINT S_A8B8$;  ' RT3F_6A
L_5A04: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5A07: GOTO L_5A16
L_5A0A: ' PRINT statement begins ; RT3F_BC
L_5A0D: BX = 0xA8CA
L_5A10: PRINT S_A8CA$;  ' RT3F_6A
L_5A13: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5A16: DI = 0xA8E4
L_5A19: SI = &H9D46
L_5A1C: N_A8E4! = N_9D46!  ' RT3F_7B
L_5A1F: SI = &H6F4A
L_5A22: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_5A25: GOTO L_5A34
L_5A28: GOSUB L_13D5
L_5A2B: DI = &H6F4A
L_5A2E: SI = &H710E
L_5A31: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_5A34: DI = &H710E
L_5A37: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_5A3A: SI = DI
L_5A3C: DI = 0xA8E4
L_5A3F: CompareLeft! = N_710E!: CompareRight! = N_A8E4!  ' RT3F_9F
L_5A42: IF CompareLeft! <= CompareRight! THEN GOTO L_5A28  ' flags from L_5A3F
L_5A44: DI = &H6F4A
L_5A47: SI = &H9EA6
L_5A4A: FAC! = N_9EA6! + N_6F4A!  ' RT3F_7F
L_5A4D: DI = &H9EA6
L_5A50: N_9EA6! = FAC!: SI = &H001A  ' RT3F_7D
L_5A53: SI = DI
L_5A55: DI = &H7116
L_5A58: CompareLeft! = N_9EA6!: CompareRight! = N_7116!  ' RT3F_9F
L_5A5B: IF CompareLeft! > CompareRight! THEN GOTO L_5A60  ' flags from L_5A58
L_5A5D: GOTO L_5332
L_5A60: SI = &H9E9E
L_5A63: CompareLeft! = N_9E9E!: CompareRight! = 0  ' RT3F_A7
L_5A66: IF CompareLeft! <> CompareRight! THEN GOTO L_5A6B  ' flags from L_5A63
L_5A68: GOTO L_5B07
L_5A6B: DI = 0xA8E8
L_5A6E: SI = &H71D4
L_5A71: N_A8E8! = N_71D4!  ' RT3F_7B
L_5A74: DI = &H70AA
L_5A77: SI = &H8B2C
L_5A7A: FAC! = N_8B2C! + N_70AA!  ' RT3F_7F
L_5A7D: DI = 0xA8EC
L_5A80: N_A8EC! = FAC!: SI = &H001A  ' RT3F_7D
L_5A83: SI = &H8BBC
L_5A86: FAC! = N_8BBC!: DI = &H001E  ' RT3F_6F
L_5A89: GOTO L_5AF7
L_5A8C: DI = &H8C3E
L_5A8F: SI = 0xA8F0
L_5A92: N_8C3E! = N_A8F0!  ' RT3F_7B
L_5A95: GOSUB L_0DE2
L_5A98: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_5A9B: IF CompareLeft! <> CompareRight! THEN GOTO L_5AA0  ' flags from L_5A98
L_5A9D: GOTO L_5AEE
L_5AA0: SI = 0xA8F0
L_5AA3: BX = CINT(N_A8F0!)  ' RT3F_75
L_5AA6: SI = BX
L_5AA8: SI = SI * (2 ^ 1)
L_5AAA: SI = SI * (2 ^ 1)
L_5AAC: SI = SI + &H8A94
L_5AB0: DI = 0xA8F4
L_5AB3: N_A8F4! = N(SI)  ' RT3F_7B
L_5AB6: GOSUB L_5B84
L_5AB9: SI = 0xA834
L_5ABC: CompareLeft! = N_A834!: CompareRight! = 0  ' RT3F_A7
L_5ABF: IF CompareLeft! = CompareRight! THEN GOTO L_5AC4  ' flags from L_5ABC
L_5AC1: GOTO L_5AC7
L_5AC4: GOSUB L_5B84
L_5AC7: SI = 0xA8F0
L_5ACA: BX = CINT(N_A8F0!)  ' RT3F_75
L_5ACD: SI = BX
L_5ACF: SI = SI * (2 ^ 1)
L_5AD1: SI = SI * (2 ^ 1)
L_5AD3: SI = SI + &H8AA8
L_5AD7: DI = 0xA8F4
L_5ADA: N_A8F4! = N(SI)  ' RT3F_7B
L_5ADD: GOSUB L_5B84
L_5AE0: SI = 0xA834
L_5AE3: CompareLeft! = N_A834!: CompareRight! = 0  ' RT3F_A7
L_5AE6: IF CompareLeft! = CompareRight! THEN GOTO L_5AEB  ' flags from L_5AE3
L_5AE8: GOTO L_5AEE
L_5AEB: GOSUB L_5B84
L_5AEE: DI = &H6F4A
L_5AF1: SI = 0xA8F0
L_5AF4: FAC! = N_A8F0! + N_6F4A!  ' RT3F_7F
L_5AF7: DI = 0xA8F0
L_5AFA: N_A8F0! = FAC!: SI = &H001A  ' RT3F_7D
L_5AFD: SI = DI
L_5AFF: DI = 0xA8EC

```

### Further combat resolution

```basic
L_5B02: CompareLeft! = N_A8F0!: CompareRight! = N_A8EC!  ' RT3F_9F
L_5B05: IF CompareLeft! <= CompareRight! THEN GOTO L_5A8C  ' flags from L_5B02
L_5B07: DI = 0xA7F6
L_5B0A: SI = 0xA7FA
L_5B0D: FAC! = N_A7FA! + N_A7F6!  ' RT3F_7F
L_5B10: DI = 0xA7FA
L_5B13: N_A7FA! = FAC!: SI = &H001A  ' RT3F_7D
L_5B16: SI = 0xA7F6
L_5B19: CompareLeft! = N_A7F6!: CompareRight! = 0  ' RT3F_A7
L_5B1C: IF CompareLeft! < CompareRight! THEN GOTO L_5B21  ' flags from L_5B19
L_5B1E: GOTO L_5B2E
L_5B21: SI = DI
L_5B23: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5B26: IF CompareLeft! < CompareRight! THEN GOTO L_5B2B  ' flags from L_5B23
L_5B28: GOTO L_5312
L_5B2B: GOTO L_5B39
L_5B2E: SI = 0xA7FA
L_5B31: CompareLeft! = N_A7FA!: CompareRight! = 0  ' RT3F_A7
L_5B34: IF CompareLeft! > CompareRight! THEN GOTO L_5B39  ' flags from L_5B31
L_5B36: GOTO L_5312
L_5B39: DI = &H6F4A
L_5B3C: SI = 0xA7E2
L_5B3F: CompareLeft! = N_A7E2!: CompareRight! = N_6F4A!  ' RT3F_9F
L_5B42: BX = 0
L_5B45: IF CompareLeft! <> CompareRight! THEN GOTO L_5B48  ' flags from L_5B3F
L_5B47: BX = BX - 1
L_5B48: FAC! = RND  ' RT3D_34
L_5B4B: DX = DI
L_5B4D: DI = &H717C
L_5B50: FAC! = FAC! * N_717C!  ' RT3F_91
L_5B53: DI = &H9E92
L_5B56: SI = &H8B74
L_5B59: T_12! = FAC!  ' RT3F_71; inline=&H92
L_5B5D: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_5B60: DI = 0xA8F8
L_5B63: FAC! = FAC! + N_A8F8!  ' RT3F_81
L_5B66: CompareLeft! = T_12!: CompareRight! = FAC!  ' RT3F_A5; inline=&H92
L_5B6A: CX = 0
L_5B6D: IF CompareLeft! >= CompareRight! THEN GOTO L_5B70  ' flags from L_5B66
L_5B6F: CX = CX - 1
L_5B70: CX = CX OR BX
L_5B72: CompareLeft% = CX: CompareRight% = 0
L_5B74: IF CompareLeft% <> CompareRight% THEN GOTO L_5B79  ' flags from L_5B72
L_5B76: GOTO L_5B81
L_5B79: SI = DX
L_5B7B: DI = &H9E9E
L_5B7E: N_9E9E! = N(SI)  ' RT3F_7B
L_5B81: GOTO L_2088
L_5B84: SI = 0xA8F0
L_5B87: BX = CINT(N_A8F0!)  ' RT3F_75
L_5B8A: AX = BX
L_5B8C: SI = 6
L_5B8F: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_5B91: SI = AX
L_5B93: SI = 0xA8F4
L_5B96: DX = BX
L_5B98: BX = CINT(N_A8F4!)  ' RT3F_75
L_5B9B: BX = BX + AX
L_5B9D: SI = BX
L_5B9F: SI = SI * (2 ^ 1)
L_5BA1: SI = SI * (2 ^ 1)
L_5BA3: SI = SI + &H8A1C
L_5BA7: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5BAA: BX = 0
L_5BAD: IF CompareLeft! <> CompareRight! THEN GOTO L_5BB0  ' flags from L_5BA7
L_5BAF: BX = BX - 1
L_5BB0: DI = &H6F54
L_5BB3: CompareLeft! = N(SI): CompareRight! = N_6F54!  ' RT3F_9F
L_5BB6: CX = 0
L_5BB9: IF CompareLeft! <> CompareRight! THEN GOTO L_5BBC  ' flags from L_5BB3
L_5BBB: CX = CX - 1
L_5BBC: CX = CX OR BX
L_5BBE: SI = DX
L_5BC0: SI = SI * (2 ^ 1)
L_5BC2: SI = SI * (2 ^ 1)
L_5BC4: SI = SI + &H8894
L_5BC8: FAC! = RND  ' RT3D_34
L_5BCB: FAC! = FAC! * 2 ^ (2)  ' RT3F_AD; inline=&H02
L_5BCF: FAC! = N(SI) + FAC!  ' RT3F_83
L_5BD2: DI = &H71CC
L_5BD5: CompareLeft! = FAC!: CompareRight! = N_71CC!  ' RT3F_A1
L_5BD8: BX = 0
L_5BDB: IF CompareLeft! >= CompareRight! THEN GOTO L_5BDE  ' flags from L_5BD5
L_5BDD: BX = BX - 1
L_5BDE: BX = BX OR CX
L_5BE0: CompareLeft% = BX: CompareRight% = 0
L_5BE2: IF CompareLeft% <> CompareRight% THEN GOTO L_5BE7  ' flags from L_5BE0
L_5BE4: GOTO L_5BE8
L_5BE7: RETURN
L_5BE8: SI = 0xA8F0
L_5BEB: BX = CINT(N_A8F0!)  ' RT3F_75
L_5BEE: AX = BX
L_5BF0: SI = 6
L_5BF3: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_5BF5: SI = AX
L_5BF7: SI = 0xA8F4
L_5BFA: BX = CINT(N_A8F4!)  ' RT3F_75
L_5BFD: BX = BX + AX
L_5BFF: SI = BX
L_5C01: SI = SI * (2 ^ 1)
L_5C03: SI = SI * (2 ^ 1)
L_5C05: SI = SI + &H88A8
L_5C09: FAC! = ABS(N(SI))  ' RT3F_2B
L_5C0C: DI = 0xA7FA
L_5C0F: CompareLeft! = FAC!: CompareRight! = N_A7FA!  ' RT3F_A1
L_5C12: IF CompareLeft! < CompareRight! THEN GOTO L_5C17  ' flags from L_5C0F
L_5C14: GOTO L_5C18
L_5C17: RETURN
L_5C18: SI = 0xA8F0
L_5C1B: BX = CINT(N_A8F0!)  ' RT3F_75
L_5C1E: AX = BX
L_5C20: SI = 6
L_5C23: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_5C25: SI = AX
L_5C27: SI = 0xA8F4
L_5C2A: DX = BX
L_5C2C: BX = CINT(N_A8F4!)  ' RT3F_75
L_5C2F: BX = BX + AX
L_5C31: SI = BX
L_5C33: SI = SI * (2 ^ 1)
L_5C35: SI = SI * (2 ^ 1)
L_5C37: SI = SI + &H88A8
L_5C3B: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5C3E: BX = 0
L_5C41: IF CompareLeft! <= CompareRight! THEN GOTO L_5C44  ' flags from L_5C3B
L_5C43: BX = BX - 1
L_5C44: CompareLeft% = BX: CompareRight% = 0
L_5C46: IF CompareLeft% >= CompareRight% THEN GOTO L_5C4A  ' flags from L_5C44
L_5C48: BX = -BX
L_5C4A: FAC! = CSNG(BX)  ' RT3F_57
L_5C4D: DI = 0xA834
L_5C50: N_A834! = FAC!: SI = &H001A  ' RT3F_7D
L_5C53: SI = DI
L_5C55: CompareLeft! = N_A834!: CompareRight! = 0  ' RT3F_A7
L_5C58: BX = 0
L_5C5B: IF CompareLeft! <> CompareRight! THEN GOTO L_5C5E  ' flags from L_5C55
L_5C5D: BX = BX - 1
L_5C5E: DI = DX
L_5C60: DI = DI * (2 ^ 1)
L_5C62: DI = DI * (2 ^ 1)
L_5C64: DX = DI
L_5C66: DI = DI + &H8B04
L_5C6A: SWAP DI, SI
L_5C6C: CX = DI
L_5C6E: DI = &H6F4A
L_5C71: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_5C74: AX = 0
L_5C77: IF CompareLeft! >= CompareRight! THEN GOTO L_5C7A  ' flags from L_5C71
L_5C79: AX = AX - 1
L_5C7A: AX = AX AND BX
L_5C7C: SI = CX
L_5C7E: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_5C81: BX = 0
L_5C84: IF CompareLeft! <> CompareRight! THEN GOTO L_5C87  ' flags from L_5C7E
L_5C86: BX = BX - 1
L_5C87: FAC! = RND  ' RT3D_34
L_5C8A: DI = &H71E4
L_5C8D: FAC! = FAC! * N_71E4!  ' RT3F_91
L_5C90: DX = DX + &H89AC
L_5C94: DI = DX
L_5C96: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_5C99: CX = 0
L_5C9C: IF CompareLeft! <= CompareRight! THEN GOTO L_5C9F  ' flags from L_5C96
L_5C9E: CX = CX - 1
L_5C9F: CX = CX AND BX
L_5CA1: CX = CX OR AX
L_5CA3: CompareLeft% = CX: CompareRight% = 0
L_5CA5: IF CompareLeft% <> CompareRight% THEN GOTO L_5CAA  ' flags from L_5CA3
L_5CA7: GOTO L_5CAB
L_5CAA: RETURN
L_5CAB: DI = 0xA010
L_5CAE: SI = 0xA572
L_5CB1: N_A010! = N_A572!  ' RT3F_7B
L_5CB4: SWAP SI, DI
L_5CB6: BX = SI
L_5CB8: SI = 0xA834
L_5CBB: CompareLeft! = N_A834!: CompareRight! = N_A572!  ' RT3F_9F
L_5CBE: DX = 0
L_5CC1: IF CompareLeft! <> CompareRight! THEN GOTO L_5CC4  ' flags from L_5CBB
L_5CC3: DX = DX - 1
L_5CC4: FAC! = RND  ' RT3D_34
L_5CC7: DI = &H717C
L_5CCA: FAC! = FAC! * N_717C!  ' RT3F_91
L_5CCD: DI = 0xA7E6
L_5CD0: CompareLeft! = FAC!: CompareRight! = N_A7E6!  ' RT3F_A1
L_5CD3: CX = 0
L_5CD6: IF CompareLeft! >= CompareRight! THEN GOTO L_5CD9  ' flags from L_5CD0
L_5CD8: CX = CX - 1
L_5CD9: CX = CX AND DX
L_5CDB: CompareLeft% = CX: CompareRight% = 0
L_5CDD: IF CompareLeft% <> CompareRight% THEN GOTO L_5CE2  ' flags from L_5CDB
L_5CDF: GOTO L_5CEA
L_5CE2: DI = BX
L_5CE4: SI = &H6F4A
L_5CE7: N(DI) = N_6F4A!  ' RT3F_7B
L_5CEA: GOSUB L_1D8C
L_5CED: BX = &H14
L_5CF0: ARGPUSH BX  ' RT3E_42
L_5CF3: BX = 3
L_5CF6: LOCATE ARGS(), BX  ' RT3E_44
L_5CF9: ' PRINT statement begins ; RT3F_BC
L_5CFC: DX = BX
L_5CFE: BX = &H8B28
L_5D01: PRINT S_8B28$  ' RT3F_6E; H newline item, ledger correction
L_5D04: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5D07: BX = &H15
L_5D0A: ARGPUSH BX  ' RT3E_42
L_5D0D: BX = DX
L_5D0F: LOCATE ARGS(), BX  ' RT3E_44
L_5D12: ' PRINT statement begins ; RT3F_BC
L_5D15: BX = 0xA8FC
L_5D18: PRINT S_A8FC$;  ' RT3F_6A
L_5D1B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5D1E: DI = 0xA834
L_5D21: SI = &H8B64
L_5D24: FAC! = N_8B64! * N_A834!  ' RT3F_8F
L_5D27: SI = &H6F4A
L_5D2A: T_12! = FAC!  ' RT3F_71; inline=&H92
L_5D2E: FAC! = N(SI) - N(DI)  ' RT3F_97
L_5D31: DI = &H8B94
L_5D34: BX = SI
L_5D36: FAC! = FAC! * N_8B94!  ' RT3F_91
L_5D39: FAC! = T_12! + FAC!  ' RT3F_85; inline=&H92
L_5D3D: DI = 0xA90A
L_5D40: N_A90A! = FAC!: SI = &H001A  ' RT3F_7D
L_5D43: FAC! = RND  ' RT3D_34
L_5D46: DX = DI
L_5D48: DI = &H719C
L_5D4B: FAC! = FAC! ^ N_719C!  ' RT3F_25; M ledger
L_5D4E: SWAP DX, DI
L_5D50: FAC! = FAC! * N(DI)  ' RT3F_91
L_5D53: SWAP DX, DI
L_5D55: FAC! = FAC! + N(DI)  ' RT3F_81
L_5D58: CX = BX
L_5D5A: BX = &H1A
L_5D5D: FAC! = INT(FAC!)  ' RT3D_03
L_5D60: DI = DX
L_5D62: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5D65: DI = &H8C02
L_5D68: SI = &H71D4
L_5D6B: N_8C02! = N_71D4!  ' RT3F_7B
L_5D6E: DI = &H8C06
L_5D71: SI = 0xA8F0
L_5D74: N_8C06! = N_A8F0!  ' RT3F_7B
L_5D77: GOSUB L_0D2A
L_5D7A: DI = &H8C6E
L_5D7D: SI = &H3B18
L_5D80: T_13! = FAC!  ' RT3F_71; inline=&H93
L_5D84: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_5D87: BX = DI
L_5D89: FAC! = T_13! - FAC!  ' RT3F_9D; inline=&H93
L_5D8D: DI = BX
L_5D8F: FAC! = FAC! + N(DI)  ' RT3F_81
L_5D92: DI = &H8C5A
L_5D95: N_8C5A! = FAC!: SI = &H001A  ' RT3F_7D
L_5D98: GOSUB L_0E81
L_5D9B: DI = &H8C5E
L_5D9E: FAC! = FAC! + N_8C5E!  ' RT3F_81
L_5DA1: DI = &H8C0A
L_5DA4: FAC! = FAC! / N_8C0A!  ' RT3F_89
L_5DA7: BX = &H1A
L_5DAA: FAC! = INT(FAC!)  ' RT3D_03
L_5DAD: DI = 0xA90E
L_5DB0: N_A90E! = FAC!: SI = &H001A  ' RT3F_7D
L_5DB3: SI = DI
L_5DB5: DI = &H6F8A
L_5DB8: FAC! = N_A90E! + N_6F8A!  ' RT3F_7F
L_5DBB: BX = SI
L_5DBD: DX = BX
L_5DBF: BX = CINT(FAC!)  ' RT3F_77
L_5DC2: SI = BX
L_5DC4: SI = SI * (2 ^ 1)
L_5DC6: SI = SI * (2 ^ 1)
L_5DC8: SI = SI + &H1850
L_5DCC: DI = &H6F4A
L_5DCF: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_5DD2: BX = 0
L_5DD5: IF CompareLeft! <> CompareRight! THEN GOTO L_5DD8  ' flags from L_5DCF
L_5DD7: BX = BX - 1
L_5DD8: FAC! = CSNG(BX)  ' RT3F_57
L_5DDB: SI = DX
L_5DDD: DI = &H710A
L_5DE0: T_14! = FAC!  ' RT3F_71; inline=&H94
L_5DE4: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_5DE7: DI = &H9F14
L_5DEA: FAC! = FAC! + N_9F14!  ' RT3F_81
L_5DED: BX = CINT(FAC!)  ' RT3F_77
L_5DF0: DI = BX
L_5DF2: DI = DI * (2 ^ 1)
L_5DF4: DI = DI * (2 ^ 1)
L_5DF6: DI = DI + &H1850
L_5DFA: SI = &H704A
L_5DFD: FAC! = N_704A! * N(DI)  ' RT3F_8F
L_5E00: DI = 0xA90A
L_5E03: FAC! = FAC! + N_A90A!  ' RT3F_81
L_5E06: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5E09: SI = 0xA8F0
L_5E0C: BX = CINT(N_A8F0!)  ' RT3F_75
L_5E0F: DI = BX
L_5E11: DI = DI * (2 ^ 1)
L_5E13: DI = DI * (2 ^ 1)
L_5E15: BX = DI
L_5E17: DI = DI + &H89AC
L_5E1B: SI = DI
L_5E1D: DI = 0xA834
L_5E20: FAC! = N(SI) - N_A834!  ' RT3F_97
L_5E23: SWAP SI, DI
L_5E25: DX = SI
L_5E27: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5E2A: BX = BX + &H8B04
L_5E2E: DI = BX
L_5E30: SWAP DX, DI
L_5E32: SI = DX
L_5E34: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_5E37: CX = DI
L_5E39: DI = &H70AA
L_5E3C: FAC! = FAC! + N_70AA!  ' RT3F_81
L_5E3F: DI = DX
L_5E41: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5E44: FAC! = RND  ' RT3D_34
L_5E47: DI = &H717C
L_5E4A: FAC! = FAC! * N_717C!  ' RT3F_91
L_5E4D: DI = 0xA7EE
L_5E50: CompareLeft! = FAC!: CompareRight! = N_A7EE!  ' RT3F_A1
L_5E53: BX = 0
L_5E56: IF CompareLeft! >= CompareRight! THEN GOTO L_5E59  ' flags from L_5E50
L_5E58: BX = BX - 1
L_5E59: CompareLeft% = BX: CompareRight% = 0
L_5E5B: IF CompareLeft% >= CompareRight% THEN GOTO L_5E5F  ' flags from L_5E59
L_5E5D: BX = -BX
L_5E5F: FAC! = CSNG(BX)  ' RT3F_57
L_5E62: DI = 0xA010
L_5E65: SI = &H6F4A
L_5E68: T_12! = FAC!  ' RT3F_71; inline=&H92
L_5E6C: FAC! = N(SI) - N(DI)  ' RT3F_97
L_5E6F: BX = SI
L_5E71: FAC! = T_12! * FAC!  ' RT3F_95; inline=&H92
L_5E75: DI = 0xA840
L_5E78: N_A840! = FAC!: SI = &H001A  ' RT3F_7D
L_5E7B: DI = BX
L_5E7D: SI = CX
L_5E7F: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_5E82: BX = CINT(FAC!)  ' RT3F_77
L_5E85: ON BX GOSUB L_6B7A, L_6A48  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_5E8D: SI = 0xA8F0
L_5E90: BX = CINT(N_A8F0!)  ' RT3F_75
L_5E93: AX = BX
L_5E95: DI = 6
L_5E98: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_5E9A: DI = AX
L_5E9C: SI = 0xA8F4
L_5E9F: BX = CINT(N_A8F4!)  ' RT3F_75
L_5EA2: DI = DI + BX
L_5EA4: DI = DI * (2 ^ 1)
L_5EA6: DI = DI * (2 ^ 1)
L_5EA8: DI = DI + &H8A1C
L_5EAC: SI = DI
L_5EAE: DI = &H6F4A
L_5EB1: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_5EB4: AX = 0
L_5EB7: IF CompareLeft! <> CompareRight! THEN GOTO L_5EBA  ' flags from L_5EB1
L_5EB9: AX = AX - 1
L_5EBA: BX = SI
L_5EBC: SI = 0xA834
L_5EBF: CompareLeft! = N_A834!: CompareRight! = 0  ' RT3F_A7
L_5EC2: DX = 0
L_5EC5: IF CompareLeft! <> CompareRight! THEN GOTO L_5EC8  ' flags from L_5EBF
L_5EC7: DX = DX - 1
L_5EC8: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_5ECA: AX = AX + 2
L_5ECD: SWAP BX, AX
L_5ECE: FAC! = CSNG(BX)  ' RT3F_57
L_5ED1: DI = AX
L_5ED3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5ED6: SI = 0xA840
L_5ED9: CompareLeft! = N_A840!: CompareRight! = 0  ' RT3F_A7
L_5EDC: IF CompareLeft! = CompareRight! THEN GOTO L_5EE1  ' flags from L_5ED9
L_5EDE: GOTO L_5F43
L_5EE1: ' PRINT statement begins ; RT3F_BC
L_5EE4: BX = 0xA912
L_5EE7: PRINT S_A912$  ' RT3F_6E; H newline item, ledger correction
L_5EEA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5EED: SI = 0xA010
L_5EF0: CompareLeft! = N_A010!: CompareRight! = 0  ' RT3F_A7
L_5EF3: IF CompareLeft! <> CompareRight! THEN GOTO L_5EF8  ' flags from L_5EF0
L_5EF5: GOTO L_62D6
L_5EF8: BX = &H17
L_5EFB: ARGPUSH BX  ' RT3E_42
L_5EFE: BX = 3
L_5F01: LOCATE ARGS(), BX  ' RT3E_44
L_5F04: ' PRINT statement begins ; RT3F_BC
L_5F07: DX = BX
L_5F09: BX = 0xA91E
L_5F0C: PRINT S_A91E$  ' RT3F_6E; H newline item, ledger correction
L_5F0F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5F12: BX = &H18
L_5F15: ARGPUSH BX  ' RT3E_42
L_5F18: BX = DX
L_5F1A: LOCATE ARGS(), BX  ' RT3E_44
L_5F1D: ' PRINT statement begins ; RT3F_BC
L_5F20: DI = &H70AA
L_5F23: SI = &H1940
L_5F26: FAC! = N_1940! + N_70AA!  ' RT3F_7F
L_5F29: BX = CINT(FAC!)  ' RT3F_77
L_5F2C: BX = BX * (2 ^ 1)
L_5F2E: BX = BX * (2 ^ 1)
L_5F30: BX = BX + &H4384
L_5F34: PRINT S(BX);  ' RT3F_6A
L_5F37: BX = 0xA618
L_5F3A: PRINT S_A618$;  ' RT3F_6A
L_5F3D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5F40: GOTO L_62A2
L_5F43: ' PRINT statement begins ; RT3F_BC
L_5F46: BX = 0xA930
L_5F49: PRINT S_A930$  ' RT3F_6E; H newline item, ledger correction
L_5F4C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5F4F: BX = &H16
L_5F52: ARGPUSH BX  ' RT3E_42
L_5F55: BX = 3
L_5F58: LOCATE ARGS(), BX  ' RT3E_44
L_5F5B: SI = 0xA90A
L_5F5E: CompareLeft! = N_A90A!: CompareRight! = 0  ' RT3F_A7
L_5F61: IF CompareLeft! <= CompareRight! THEN GOTO L_5F66  ' flags from L_5F5E
L_5F63: GOTO L_5F75
L_5F66: ' PRINT statement begins ; RT3F_BC
L_5F69: BX = 0xA93A
L_5F6C: PRINT S_A93A$  ' RT3F_6E; H newline item, ledger correction
L_5F6F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5F72: GOTO L_62A2
L_5F75: DI = 0xA954
L_5F78: SI = &H8BAC
L_5F7B: N_A954! = N_8BAC!  ' RT3F_7B
L_5F7E: DI = 0xA90A
L_5F81: SI = &H192C
L_5F84: FAC! = N_192C! - N_A90A!  ' RT3F_97
L_5F87: BX = &H1A
L_5F8A: FAC! = INT(FAC!)  ' RT3D_03
L_5F8D: DI = SI
L_5F8F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5F92: SI = DI
L_5F94: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5F97: IF CompareLeft! > CompareRight! THEN GOTO L_5F9C  ' flags from L_5F94
L_5F99: GOTO L_5FE6
L_5F9C: GOSUB L_16E9
L_5F9F: DI = &H9F4C
L_5FA2: SI = &H6F82
L_5FA5: N_9F4C! = N_6F82!  ' RT3F_7B
L_5FA8: DI = 0xA958
L_5FAB: SI = &H70AA
L_5FAE: N_A958! = N_70AA!  ' RT3F_7B
L_5FB1: FAC! = RND  ' RT3D_34
L_5FB4: DI = &H8BC4
L_5FB7: CompareLeft! = FAC!: CompareRight! = N_8BC4!  ' RT3F_A1
L_5FBA: IF CompareLeft! < CompareRight! THEN GOTO L_5FBF  ' flags from L_5FB7
L_5FBC: GOTO L_5FCB
L_5FBF: DI = 0xA954
L_5FC2: SI = &H719C
L_5FC5: N_A954! = N_719C!  ' RT3F_7B
L_5FC8: GOTO L_5FE6
L_5FCB: BX = &H16
L_5FCE: ARGPUSH BX  ' RT3E_42
L_5FD1: BX = 3
L_5FD4: LOCATE ARGS(), BX  ' RT3E_44
L_5FD7: ' PRINT statement begins ; RT3F_BC
L_5FDA: BX = 0xA95C
L_5FDD: PRINT S_A95C$  ' RT3F_6E; H newline item, ledger correction
L_5FE0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5FE3: GOTO L_60D0
L_5FE6: FAC! = RND  ' RT3D_34
L_5FE9: DI = 0xA954
L_5FEC: FAC! = FAC! ^ N_A954!  ' RT3F_25; M ledger
L_5FEF: BX = DI
L_5FF1: DI = &H9E92
L_5FF4: FAC! = FAC! * N_9E92!  ' RT3F_91
L_5FF7: DX = BX
L_5FF9: BX = &H1A
L_5FFC: FAC! = INT(FAC!)  ' RT3D_03
L_5FFF: DI = 0xA958
L_6002: N_A958! = FAC!: SI = &H001A  ' RT3F_7D
L_6005: SI = DX
L_6007: BX = DI
L_6009: DI = &H8BAC
L_600C: CompareLeft! = N(SI): CompareRight! = N_8BAC!  ' RT3F_9F
L_600F: CX = 0
L_6012: IF CompareLeft! >= CompareRight! THEN GOTO L_6015  ' flags from L_600C
L_6014: CX = CX - 1
L_6015: SI = BX
L_6017: DI = &H71CC
L_601A: CompareLeft! = N(SI): CompareRight! = N_71CC!  ' RT3F_9F
L_601D: DX = 0
L_6020: IF CompareLeft! >= CompareRight! THEN GOTO L_6023  ' flags from L_601A
L_6022: DX = DX - 1
L_6023: DI = &H71D8
L_6026: CompareLeft! = N(SI): CompareRight! = N_71D8!  ' RT3F_9F
L_6029: AX = 0
L_602C: IF CompareLeft! <= CompareRight! THEN GOTO L_602F  ' flags from L_6026
L_602E: AX = AX - 1
L_602F: DI = &H9FCC
L_6032: CompareLeft! = N(SI): CompareRight! = N_9FCC!  ' RT3F_9F
L_6035: BX = 0
L_6038: IF CompareLeft! >= CompareRight! THEN GOTO L_603B  ' flags from L_6032
L_603A: BX = BX - 1
L_603B: BX = BX AND AX
L_603D: BX = BX OR DX
L_603F: BX = BX AND CX
L_6041: CompareLeft% = BX: CompareRight% = 0
L_6043: IF CompareLeft% <> CompareRight% THEN GOTO L_5FE6  ' flags from L_6041
L_6045: SI = &H192C
L_6048: CompareLeft! = N_192C!: CompareRight! = 0  ' RT3F_A7
L_604B: IF CompareLeft! < CompareRight! THEN GOTO L_6050  ' flags from L_6048
L_604D: GOTO L_605B
L_6050: DI = SI
L_6052: SI = 0xA96E
L_6055: N(DI) = N_A96E!  ' RT3F_7B
L_6058: GOSUB L_16E9
L_605B: BX = &H16
L_605E: ARGPUSH BX  ' RT3E_42
L_6061: BX = 3
L_6064: LOCATE ARGS(), BX  ' RT3E_44
L_6067: SI = 0xA958
L_606A: BX = CINT(N_A958!)  ' RT3F_75
L_606D: SI = BX
L_606F: SI = SI * (2 ^ 1)
L_6071: SI = SI * (2 ^ 1)
L_6073: SI = SI + &H1850
L_6077: DI = &H6F4A
L_607A: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_607D: IF CompareLeft! <> CompareRight! THEN GOTO L_6082  ' flags from L_607A
L_607F: GOTO L_609A
L_6082: ' PRINT statement begins ; RT3F_BC
L_6085: BX = 0xA972
L_6088: PRINT S_A972$  ' RT3F_6E; H newline item, ledger correction
L_608B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_608E: DI = &H189C
L_6091: SI = &H6F54
L_6094: N_189C! = N_6F54!  ' RT3F_7B
L_6097: GOTO L_60D0
L_609A: SI = &H192C
L_609D: CompareLeft! = N_192C!: CompareRight! = 0  ' RT3F_A7
L_60A0: IF CompareLeft! <= CompareRight! THEN GOTO L_60A5  ' flags from L_609D
L_60A2: GOTO L_60D0
L_60A5: SI = 0xA958
L_60A8: BX = CINT(N_A958!)  ' RT3F_75
L_60AB: DI = BX
L_60AD: DI = DI * (2 ^ 1)
L_60AF: DI = DI * (2 ^ 1)
L_60B1: BX = DI
L_60B3: DI = DI + &H1850
L_60B7: SI = &H6F54
L_60BA: N(DI) = N_6F54!  ' RT3F_7B
L_60BD: ' PRINT statement begins ; RT3F_BC
L_60C0: BX = BX + &H4814
L_60C4: PRINT S(BX);  ' RT3F_6A
L_60C7: BX = 0xA984
L_60CA: PRINT S_A984$  ' RT3F_6E; H newline item, ledger correction
L_60CD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_60D0: BX = &H10
L_60D3: DX = 0xC
L_60D6: CX = 0
L_60D8: AX = CX
L_60DA: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_60DD: BX = &H8D06
L_60E0: DX = 2
L_60E3: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_60E6: BX = &H10
L_60E9: DX = 0xC
L_60EC: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_60EF: BX = &H8D06
L_60F2: DX = 3
L_60F5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_60F8: SI = 0xA958
L_60FB: CompareLeft! = N_A958!: CompareRight! = 0  ' RT3F_A7
L_60FE: IF CompareLeft! > CompareRight! THEN GOTO L_6103  ' flags from L_60FB
L_6100: GOTO L_612D
L_6103: GOSUB L_1474
L_6106: DI = &H71D8
L_6109: SI = 0xA958
L_610C: CompareLeft! = N_A958!: CompareRight! = N_71D8!  ' RT3F_9F
L_610F: BX = 0
L_6112: IF CompareLeft! <= CompareRight! THEN GOTO L_6115  ' flags from L_610C
L_6114: BX = BX - 1
L_6115: DI = &H9FC4
L_6118: CompareLeft! = N(SI): CompareRight! = N_9FC4!  ' RT3F_9F
L_611B: DX = 0
L_611E: IF CompareLeft! >= CompareRight! THEN GOTO L_6121  ' flags from L_6118
L_6120: DX = DX - 1
L_6121: DX = DX AND BX
L_6123: CompareLeft% = DX: CompareRight% = 0
L_6125: IF CompareLeft% <> CompareRight% THEN GOTO L_612A  ' flags from L_6123
L_6127: GOTO L_612D
L_612A: GOSUB L_18E2
L_612D: DI = &H7200
L_6130: SI = 0xA958
L_6133: CompareLeft! = N_A958!: CompareRight! = N_7200!  ' RT3F_9F
L_6136: IF CompareLeft! = CompareRight! THEN GOTO L_613B  ' flags from L_6133
L_6138: GOTO L_6144
L_613B: DI = 0xA7E6
L_613E: SI = 0xA994
L_6141: N_A7E6! = N_A994!  ' RT3F_7B
L_6144: DI = &H7116
L_6147: SI = 0xA958
L_614A: CompareLeft! = N_A958!: CompareRight! = N_7116!  ' RT3F_9F
L_614D: BX = 0
L_6150: IF CompareLeft! <= CompareRight! THEN GOTO L_6153  ' flags from L_614A
L_6152: BX = BX - 1
L_6153: DI = &H9FCC
L_6156: CompareLeft! = N(SI): CompareRight! = N_9FCC!  ' RT3F_9F
L_6159: DX = 0
L_615C: IF CompareLeft! >= CompareRight! THEN GOTO L_615F  ' flags from L_6156
L_615E: DX = DX - 1
L_615F: DX = DX AND BX
L_6161: CompareLeft% = DX: CompareRight% = 0
L_6163: IF CompareLeft% <> CompareRight% THEN GOTO L_6168  ' flags from L_6161
L_6165: GOTO L_624A
L_6168: DI = &H9F80
L_616B: FAC! = N(SI) + N_9F80!  ' RT3F_7F
L_616E: DI = &H9EA6
L_6171: N_9EA6! = FAC!: SI = &H001A  ' RT3F_7D
L_6174: FAC! = RND  ' RT3D_34
L_6177: BX = DI
L_6179: DI = &H719C
L_617C: CompareLeft! = FAC!: CompareRight! = N_719C!  ' RT3F_A1
L_617F: DX = 0
L_6182: IF CompareLeft! >= CompareRight! THEN GOTO L_6185  ' flags from L_617C
L_6184: DX = DX - 1
L_6185: DI = &H7174
L_6188: SI = &H71F4
L_618B: N_7174! = N_71F4!  ' RT3F_7B
L_618E: SWAP BX, SI
L_6190: DI = &H7178
L_6193: N_7178! = N(SI)  ' RT3F_7B
L_6196: WORD(BP - &H10) = DX
L_6199: GOSUB L_0301
L_619C: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_619F: BX = 0
L_61A2: IF CompareLeft! <= CompareRight! THEN GOTO L_61A5  ' flags from L_619C
L_61A4: BX = BX - 1
L_61A5: BX = BX AND WORD(BP - &H10)
L_61A8: CompareLeft% = BX: CompareRight% = 0
L_61AA: IF CompareLeft% <> CompareRight% THEN GOTO L_61AF  ' flags from L_61A8
L_61AC: GOTO L_624A
L_61AF: DI = &H7188
L_61B2: SI = &H71F4
L_61B5: N_7188! = N_71F4!  ' RT3F_7B
L_61B8: BX = DI
L_61BA: DI = &H718C
L_61BD: SI = &H9EA6
L_61C0: N_718C! = N_9EA6!  ' RT3F_7B
L_61C3: GOSUB L_0333
L_61C6: BX = CINT(FAC!)  ' RT3F_77
L_61C9: DI = BX
L_61CB: DI = DI * (2 ^ 1)
L_61CD: DI = DI * (2 ^ 1)
L_61CF: DI = DI + &H1850
L_61D3: SI = 0xA9A2
L_61D6: N(DI) = N_A9A2!  ' RT3F_7B
L_61D9: DI = &H7188
L_61DC: SI = 0xA4AE
L_61DF: N_7188! = N_A4AE!  ' RT3F_7B
L_61E2: DI = &H718C
L_61E5: SI = &H9EA6
L_61E8: N_718C! = N_9EA6!  ' RT3F_7B
L_61EB: GOSUB L_0333
L_61EE: BX = CINT(FAC!)  ' RT3F_77
L_61F1: DI = BX
L_61F3: DI = DI * (2 ^ 1)
L_61F5: DI = DI * (2 ^ 1)
L_61F7: DI = DI + &H1850
L_61FB: SI = 0xA4BA
L_61FE: N(DI) = N_A4BA!  ' RT3F_7B

```

### Crew damage and subsequent calculations

```basic
L_6201: BX = &H18
L_6204: ARGPUSH BX  ' RT3E_42
L_6207: BX = 3
L_620A: LOCATE ARGS(), BX  ' RT3E_44
L_620D: ' PRINT statement begins ; RT3F_BC
L_6210: BX = SI
L_6212: SI = &H9EA6
L_6215: DX = BX
L_6217: BX = CINT(N_9EA6!)  ' RT3F_75
L_621A: BX = BX * (2 ^ 1)
L_621C: BX = BX * (2 ^ 1)
L_621E: BX = BX + &H4288
L_6222: PRINT S(BX);  ' RT3F_6A
L_6225: BX = 0xA998
L_6228: PRINT S_A998$;  ' RT3F_6A
L_622B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_622E: SI = DX
L_6230: DI = &H9F4C
L_6233: N_9F4C! = N(SI)  ' RT3F_7B
L_6236: GOSUB L_173C
L_6239: GOSUB L_72E9
L_623C: DI = 0xA9A6
L_623F: SI = &H9E8E
L_6242: FAC! = N_9E8E! * N_A9A6!  ' RT3F_8F
L_6245: DI = SI
L_6247: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_624A: SI = &H9F4C
L_624D: CompareLeft! = N_9F4C!: CompareRight! = 0  ' RT3F_A7
L_6250: IF CompareLeft! <> CompareRight! THEN GOTO L_6255  ' flags from L_624D
L_6252: GOTO L_62A2
L_6255: SI = &H6F4A
L_6258: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_625B: GOTO L_628F
L_625E: BX = &H10
L_6261: DX = 0xC
L_6264: CX = 0
L_6266: AX = CX
L_6268: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_626B: BX = &H8D06
L_626E: DX = 2
L_6271: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6274: BX = &H10
L_6277: DX = 0xC
L_627A: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_627D: BX = &H8D06
L_6280: DX = 3
L_6283: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6286: DI = &H6F4A
L_6289: SI = &H710E
L_628C: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_628F: DI = &H710E
L_6292: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_6295: SI = DI
L_6297: DI = &H8BD8
L_629A: CompareLeft! = N_710E!: CompareRight! = N_8BD8!  ' RT3F_9F
L_629D: IF CompareLeft! <= CompareRight! THEN GOTO L_625E  ' flags from L_629A
L_629F: GOTO L_3063
L_62A2: DI = &H8BA8
L_62A5: SI = &H9D46
L_62A8: FAC! = N_9D46! * N_8BA8!  ' RT3F_8F
L_62AB: DI = 0xA9AA
L_62AE: N_A9AA! = FAC!: SI = &H001A  ' RT3F_7D
L_62B1: SI = &H6F4A
L_62B4: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_62B7: GOTO L_62C6
L_62BA: GOSUB L_13D5
L_62BD: DI = &H6F4A
L_62C0: SI = &H710E
L_62C3: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_62C6: DI = &H710E
L_62C9: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_62CC: SI = DI
L_62CE: DI = 0xA9AA
L_62D1: CompareLeft! = N_710E!: CompareRight! = N_A9AA!  ' RT3F_9F
L_62D4: IF CompareLeft! <= CompareRight! THEN GOTO L_62BA  ' flags from L_62D1
L_62D6: DI = &H8BC8
L_62D9: SI = &H9D46
L_62DC: FAC! = N_9D46! * N_8BC8!  ' RT3F_8F
L_62DF: DI = 0xA9AE
L_62E2: N_A9AE! = FAC!: SI = &H001A  ' RT3F_7D
L_62E5: SI = &H6F4A
L_62E8: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_62EB: GOTO L_62FA
L_62EE: GOSUB L_13D5
L_62F1: DI = &H6F4A
L_62F4: SI = &H710E
L_62F7: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_62FA: DI = &H710E
L_62FD: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_6300: SI = DI
L_6302: DI = 0xA9AE
L_6305: CompareLeft! = N_710E!: CompareRight! = N_A9AE!  ' RT3F_9F
L_6308: IF CompareLeft! <= CompareRight! THEN GOTO L_62EE  ' flags from L_6305
L_630A: RETURN
L_630B: DI = &H8CEA
L_630E: SI = 0xA8F4
L_6311: N_8CEA! = N_A8F4!  ' RT3F_7B
L_6314: BX = DI
L_6316: DI = &H8CEE
L_6319: DX = SI
L_631B: SI = 0xA8F0
L_631E: N_8CEE! = N_A8F0!  ' RT3F_7B
L_6321: GOSUB L_10B2
L_6324: DI = 0xA9B2
L_6327: N_A9B2! = FAC!: SI = &H001A  ' RT3F_7D
L_632A: DI = &H8CFA
L_632D: SI = 0xA8F4
L_6330: N_8CFA! = N_A8F4!  ' RT3F_7B
L_6333: BX = DI
L_6335: DI = &H8CFE
L_6338: SI = 0xA8F0
L_633B: N_8CFE! = N_A8F0!  ' RT3F_7B
L_633E: GOSUB L_1150
L_6341: DI = 0xA9B6
L_6344: N_A9B6! = FAC!: SI = &H001A  ' RT3F_7D
L_6347: FAC! = RND  ' RT3D_34
L_634A: DI = &H71D8
L_634D: FAC! = FAC! * N_71D8!  ' RT3F_91
L_6350: BX = &H1A
L_6353: FAC! = INT(FAC!)  ' RT3D_03
L_6356: BX = DI
L_6358: DI = &H8CEA
L_635B: N_8CEA! = FAC!: SI = &H001A  ' RT3F_7D
L_635E: DI = &H8CEE
L_6361: SI = 0xA8E8
L_6364: N_8CEE! = N_A8E8!  ' RT3F_7B
L_6367: GOSUB L_10B2
L_636A: DI = &H719C
L_636D: FAC! = FAC! + N_719C!  ' RT3F_81
L_6370: BX = DI
L_6372: DI = 0xA9BA
L_6375: N_A9BA! = FAC!: SI = &H001A  ' RT3F_7D
L_6378: FAC! = RND  ' RT3D_34
L_637B: DI = &H71D8
L_637E: FAC! = FAC! * N_71D8!  ' RT3F_91
L_6381: DX = BX
L_6383: BX = &H1A
L_6386: FAC! = INT(FAC!)  ' RT3D_03
L_6389: DI = &H8CFA
L_638C: N_8CFA! = FAC!: SI = &H001A  ' RT3F_7D
L_638F: DI = &H8CFE
L_6392: SI = 0xA8E8
L_6395: N_8CFE! = N_A8E8!  ' RT3F_7B
L_6398: GOSUB L_1150
L_639B: DI = &H719C
L_639E: FAC! = FAC! + N_719C!  ' RT3F_81
L_63A1: DI = 0xA9BE
L_63A4: N_A9BE! = FAC!: SI = &H001A  ' RT3F_7D
L_63A7: DI = &H6F4A
L_63AA: SI = 0xA840
L_63AD: CompareLeft! = N_A840!: CompareRight! = N_6F4A!  ' RT3F_9F
L_63B0: IF CompareLeft! = CompareRight! THEN GOTO L_63B5  ' flags from L_63AD
L_63B2: GOTO L_63B6
L_63B5: RETURN
L_63B6: FAC! = RND  ' RT3D_34
L_63B9: DI = 0xA6B0
L_63BC: FAC! = FAC! * N_A6B0!  ' RT3F_91
L_63BF: BX = &H1A
L_63C2: FAC! = INT(FAC!)  ' RT3D_03
L_63C5: SI = 0xA9BA
L_63C8: BX = DI
L_63CA: FAC! = N_A9BA! - FAC!  ' RT3F_9B
L_63CD: DI = 0xA9B2
L_63D0: FAC! = FAC! - N_A9B2!  ' RT3F_99
L_63D3: DI = &H8BD8
L_63D6: FAC! = FAC! + N_8BD8!  ' RT3F_81
L_63D9: DX = DI
L_63DB: DI = 0xA55A
L_63DE: N_A55A! = FAC!: SI = &H001A  ' RT3F_7D
L_63E1: FAC! = RND  ' RT3D_34
L_63E4: DI = BX
L_63E6: FAC! = FAC! * N(DI)  ' RT3F_91
L_63E9: BX = &H1A
L_63EC: FAC! = INT(FAC!)  ' RT3D_03
L_63EF: SI = 0xA9BE
L_63F2: FAC! = N_A9BE! - FAC!  ' RT3F_9B
L_63F5: DI = 0xA9B6
L_63F8: FAC! = FAC! - N_A9B6!  ' RT3F_99
L_63FB: DI = DX
L_63FD: FAC! = FAC! + N(DI)  ' RT3F_81
L_6400: DI = 0xA55E
L_6403: N_A55E! = FAC!: SI = &H001A  ' RT3F_7D
L_6406: DI = &H6F4A
L_6409: SI = 0xA010
L_640C: CompareLeft! = N_A010!: CompareRight! = N_6F4A!  ' RT3F_9F
L_640F: IF CompareLeft! = CompareRight! THEN GOTO L_6414  ' flags from L_640C
L_6411: GOTO L_6440
L_6414: DI = 0xA9C2
L_6417: SI = 0xA55A
L_641A: FAC! = N_A55A! * N_A9C2!  ' RT3F_8F
L_641D: BX = DI
L_641F: DI = 0xA9B2
L_6422: FAC! = FAC! + N_A9B2!  ' RT3F_81
L_6425: DI = 0xA9BA
L_6428: N_A9BA! = FAC!: SI = &H001A  ' RT3F_7D
L_642B: DI = BX
L_642D: SI = 0xA55E
L_6430: FAC! = N_A55E! * N(DI)  ' RT3F_8F
L_6433: DI = 0xA9B6
L_6436: FAC! = FAC! + N_A9B6!  ' RT3F_81
L_6439: DI = 0xA9BE
L_643C: N_A9BE! = FAC!: SI = &H001A  ' RT3F_7D
L_643F: RETURN
L_6440: SI = 0xA55A
L_6443: CompareLeft! = N_A55A!: CompareRight! = 0  ' RT3F_A7
L_6446: BX = 0
L_6449: IF CompareLeft! <> CompareRight! THEN GOTO L_644C  ' flags from L_6443
L_644B: BX = BX - 1
L_644C: SI = 0xA55E
L_644F: CompareLeft! = N_A55E!: CompareRight! = 0  ' RT3F_A7
L_6452: DX = 0
L_6455: IF CompareLeft! <> CompareRight! THEN GOTO L_6458  ' flags from L_644F
L_6457: DX = DX - 1
L_6458: DX = DX OR BX
L_645A: CompareLeft% = DX: CompareRight% = 0
L_645C: IF CompareLeft% = CompareRight% THEN GOTO L_6461  ' flags from L_645A
L_645E: GOTO L_63B6
L_6461: SI = 0xA55A
L_6464: CompareLeft! = N_A55A!: CompareRight! = 0  ' RT3F_A7
L_6467: IF CompareLeft! > CompareRight! THEN GOTO L_646C  ' flags from L_6464
L_6469: GOTO L_6478
L_646C: DI = 0xA9C6
L_646F: SI = 0xA9CA
L_6472: N_A9C6! = N_A9CA!  ' RT3F_7B
L_6475: GOTO L_6481
L_6478: DI = 0xA9C6
L_647B: SI = &H9FCC
L_647E: N_A9C6! = N_9FCC!  ' RT3F_7B
L_6481: SI = 0xA55E
L_6484: CompareLeft! = N_A55E!: CompareRight! = 0  ' RT3F_A7
L_6487: IF CompareLeft! > CompareRight! THEN GOTO L_648C  ' flags from L_6484
L_6489: GOTO L_6498
L_648C: DI = 0xA9CE
L_648F: SI = 0xA9D2
L_6492: N_A9CE! = N_A9D2!  ' RT3F_7B
L_6495: GOTO L_64A1
L_6498: DI = 0xA9CE
L_649B: SI = &H9EE6
L_649E: N_A9CE! = N_9EE6!  ' RT3F_7B
L_64A1: DI = 0xA9B2
L_64A4: SI = 0xA9C6
L_64A7: FAC! = N_A9C6! - N_A9B2!  ' RT3F_97
L_64AA: DI = 0xA55A
L_64AD: FAC! = FAC! / N_A55A!  ' RT3F_89
L_64B0: DI = 0xA9D6
L_64B3: N_A9D6! = FAC!: SI = &H001A  ' RT3F_7D
L_64B6: BX = DI
L_64B8: DI = 0xA9B6
L_64BB: SI = 0xA9CE
L_64BE: FAC! = N_A9CE! - N_A9B6!  ' RT3F_97
L_64C1: DI = 0xA55E
L_64C4: FAC! = FAC! / N_A55E!  ' RT3F_89
L_64C7: DI = 0xA9DA
L_64CA: N_A9DA! = FAC!: SI = &H001A  ' RT3F_7D
L_64CD: SWAP BX, DI
L_64CF: SI = BX
L_64D1: CompareLeft! = N_A9DA!: CompareRight! = N(DI)  ' RT3F_9F
L_64D4: IF CompareLeft! < CompareRight! THEN GOTO L_64D9  ' flags from L_64D1
L_64D6: GOTO L_64DC
L_64D9: N(DI) = N(SI)  ' RT3F_7B
L_64DC: DI = 0xA9D6
L_64DF: SI = 0xA55E
L_64E2: FAC! = N_A55E! * N_A9D6!  ' RT3F_8F
L_64E5: BX = DI
L_64E7: DI = 0xA9B6
L_64EA: FAC! = FAC! + N_A9B6!  ' RT3F_81
L_64ED: DI = &H719C
L_64F0: FAC! = FAC! + N_719C!  ' RT3F_81
L_64F3: DX = BX
L_64F5: BX = &H1A
L_64F8: FAC! = INT(FAC!)  ' RT3D_03
L_64FB: BX = DI
L_64FD: DI = 0xA9BE
L_6500: N_A9BE! = FAC!: SI = &H001A  ' RT3F_7D
L_6503: DI = DX
L_6505: SI = 0xA55A
L_6508: FAC! = N_A55A! * N(DI)  ' RT3F_8F
L_650B: DI = 0xA9B2
L_650E: FAC! = FAC! + N_A9B2!  ' RT3F_81
L_6511: DI = BX
L_6513: FAC! = FAC! + N(DI)  ' RT3F_81
L_6516: BX = &H1A
L_6519: FAC! = INT(FAC!)  ' RT3D_03
L_651C: DI = 0xA9BA
L_651F: N_A9BA! = FAC!: SI = &H001A  ' RT3F_7D
L_6522: RETURN
L_6523: FAC! = RND  ' RT3D_34
L_6526: DI = &H719C
L_6529: FAC! = FAC! ^ N_719C!  ' RT3F_25; M ledger
L_652C: DI = &H6F4A
L_652F: SI = 0xA7FE
L_6532: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6536: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_6539: BX = CINT(FAC!)  ' RT3F_77
L_653C: DI = BX
L_653E: DI = DI * (2 ^ 1)
L_6540: DI = DI * (2 ^ 1)
L_6542: DI = DI + &H1850
L_6546: SI = &H703A
L_6549: FAC! = N_703A! * N(DI)  ' RT3F_8F
L_654C: SI = &H9F98
L_654F: T_13! = FAC!  ' RT3F_71; inline=&H93
L_6553: BX = CINT(N(SI))  ' RT3F_75
L_6556: SI = BX
L_6558: SI = SI * (2 ^ 1)
L_655A: SI = SI * (2 ^ 1)
L_655C: SI = SI + &H8ABC
L_6560: DX = BX
L_6562: BX = CINT(N(SI))  ' RT3F_75
L_6565: DI = BX
L_6567: DX = DX * (2 ^ 1)
L_6569: DX = DX * (2 ^ 1)
L_656B: DI = DI + DX
L_656D: DI = DI * (2 ^ 1)
L_656F: DI = DI * (2 ^ 1)
L_6571: DI = DI + &H8948
L_6575: SI = &H7042
L_6578: FAC! = N_7042! - N(DI)  ' RT3F_97
L_657B: BX = &H1A
L_657E: FAC! = INT(FAC!)  ' RT3D_03
L_6581: DI = 0xA90A
L_6584: N_A90A! = FAC!: SI = &H001A  ' RT3F_7D
L_6587: DI = 0xA59E
L_658A: SI = &H9EA6
L_658D: FAC! = N_9EA6! + N_A59E!  ' RT3F_7F
L_6590: DI = 0xA8F4
L_6593: N_A8F4! = FAC!: SI = &H001A  ' RT3F_7D
L_6596: DI = 0xA8E8
L_6599: SI = &H9F98
L_659C: N_A8E8! = N_9F98!  ' RT3F_7B
L_659F: DI = 0xA8F0
L_65A2: SI = &H71D4
L_65A5: N_A8F0! = N_71D4!  ' RT3F_7B
L_65A8: DI = &H6F4A
L_65AB: SI = 0xA834
L_65AE: FAC! = N_A834! + N_6F4A!  ' RT3F_7F
L_65B1: BX = CINT(FAC!)  ' RT3F_77
L_65B4: ON BX GOSUB L_6B7A, L_6A48  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_65BC: SI = 0xA90A
L_65BF: CompareLeft! = N_A90A!: CompareRight! = 0  ' RT3F_A7
L_65C2: BX = 0
L_65C5: IF CompareLeft! >= CompareRight! THEN GOTO L_65C8  ' flags from L_65BF
L_65C7: BX = BX - 1
L_65C8: SI = 0xA840
L_65CB: CompareLeft! = N_A840!: CompareRight! = 0  ' RT3F_A7
L_65CE: DX = 0
L_65D1: IF CompareLeft! <> CompareRight! THEN GOTO L_65D4  ' flags from L_65CB
L_65D3: DX = DX - 1
L_65D4: DX = DX OR BX
L_65D6: CompareLeft% = DX: CompareRight% = 0
L_65D8: IF CompareLeft% <> CompareRight% THEN GOTO L_65DD  ' flags from L_65D6
L_65DA: GOTO L_65DE
L_65DD: RETURN
L_65DE: DI = 0xA05E
L_65E1: SI = &H6F4A
L_65E4: N_A05E! = N_6F4A!  ' RT3F_7B
L_65E7: DI = 0xA90A
L_65EA: SI = 0xA830
L_65ED: FAC! = N_A830! + N_A90A!  ' RT3F_7F
L_65F0: SWAP SI, DI
L_65F2: BX = SI
L_65F4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_65F7: SI = &H9F98
L_65FA: DX = BX
L_65FC: BX = CINT(N_9F98!)  ' RT3F_75
L_65FF: DI = BX

```

### Dispatch and numerical helpers

```basic
L_6601: DI = DI * (2 ^ 1)
L_6603: DI = DI * (2 ^ 1)
L_6605: DI = DI + &H8998
L_6609: SWAP DX, DI
L_660B: SI = DX
L_660D: FAC! = N(SI) - N(DI)  ' RT3F_97
L_6610: DI = DX
L_6612: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6615: SI = DX
L_6617: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_661A: IF CompareLeft! >= CompareRight! THEN GOTO L_661F  ' flags from L_6617
L_661C: GOTO L_6620
L_661F: RETURN
L_6620: DI = 0xA828
L_6623: SI = &H6F4A
L_6626: N_A828! = N_6F4A!  ' RT3F_7B
L_6629: FAC! = RND  ' RT3D_34
L_662C: DI = 0xA9DE
L_662F: FAC! = FAC! * N_A9DE!  ' RT3F_91
L_6632: SI = &H9F98
L_6635: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6639: BX = CINT(N(SI))  ' RT3F_75
L_663C: DI = BX
L_663E: DI = DI * (2 ^ 1)
L_6640: DI = DI * (2 ^ 1)
L_6642: BX = DI
L_6644: DI = DI + &H8998
L_6648: SI = &H703A
L_664B: CompareLeft! = N_703A!: CompareRight! = N(DI)  ' RT3F_9F
L_664E: DX = 0
L_6651: IF CompareLeft! <= CompareRight! THEN GOTO L_6654  ' flags from L_664B
L_6653: DX = DX - 1
L_6654: CX = BX
L_6656: BX = BX + &H89F0
L_665A: SI = BX
L_665C: DI = &H7116
L_665F: CompareLeft! = N(SI): CompareRight! = N_7116!  ' RT3F_9F
L_6662: AX = 0
L_6665: IF CompareLeft! = CompareRight! THEN GOTO L_6668  ' flags from L_665F
L_6667: AX = AX - 1
L_6668: AX = AX AND DX
L_666A: CompareLeft% = AX: CompareRight% = 0
L_666C: IF CompareLeft% <> CompareRight% THEN GOTO L_6671  ' flags from L_666A
L_666E: GOTO L_6680
L_6671: CX = CX + &H8894
L_6675: DI = CX
L_6677: SI = &H6F82
L_667A: N(DI) = N_6F82!  ' RT3F_7B
L_667D: GOTO L_67E8
L_6680: SI = &H9F98
L_6683: BX = CINT(N_9F98!)  ' RT3F_75
L_6686: DI = BX
L_6688: DI = DI * (2 ^ 1)
L_668A: DI = DI * (2 ^ 1)
L_668C: DI = DI + &H8998
L_6690: SI = &H6F82
L_6693: N(DI) = N_6F82!  ' RT3F_7B
L_6696: FAC! = RND  ' RT3D_34
L_6699: BX = &H1A
L_669C: FAC! = SQR(FAC!)  ' RT3D_3A
L_669F: DI = &H8BD8
L_66A2: FAC! = FAC! * N_8BD8!  ' RT3F_91
L_66A5: DI = &H6F4A
L_66A8: FAC! = FAC! + N_6F4A!  ' RT3F_81
L_66AB: BX = &H1A
L_66AE: FAC! = INT(FAC!)  ' RT3D_03
L_66B1: BX = CINT(FAC!)  ' RT3F_77
L_66B4: ON BX GOTO L_66CA, L_66CB, L_66E2, L_66F9, L_66CA, L_6717, L_6717, L_6744, L_6717  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_66CA: RETURN
L_66CB: SI = &H9F98
L_66CE: BX = CINT(N_9F98!)  ' RT3F_75
L_66D1: DI = BX
L_66D3: DI = DI * (2 ^ 1)
L_66D5: DI = DI * (2 ^ 1)
L_66D7: DI = DI + &H8920
L_66DB: SI = 0xA572
L_66DE: N(DI) = N_A572!  ' RT3F_7B
L_66E1: RETURN
L_66E2: SI = &H9F98
L_66E5: BX = CINT(N_9F98!)  ' RT3F_75
L_66E8: DI = BX
L_66EA: DI = DI * (2 ^ 1)
L_66EC: DI = DI * (2 ^ 1)
L_66EE: DI = DI + &H8934
L_66F2: SI = 0xA572
L_66F5: N(DI) = N_A572!  ' RT3F_7B
L_66F8: RETURN
L_66F9: SI = &H9F98
L_66FC: BX = CINT(N_9F98!)  ' RT3F_75
L_66FF: DI = BX
L_6701: DI = DI * (2 ^ 1)
L_6703: DI = DI * (2 ^ 1)
L_6705: DI = DI + &H8AF0
L_6709: SI = DI
L_670B: FAC! = ABS(N(SI))  ' RT3F_2B
L_670E: FAC! = N(SI) - FAC!  ' RT3F_9B
L_6711: DI = SI
L_6713: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6716: RETURN
L_6717: FAC! = RND  ' RT3D_34
L_671A: FAC! = FAC! * 2 ^ (2)  ' RT3F_AD; inline=&H02
L_671E: BX = &H1A
L_6721: FAC! = INT(FAC!)  ' RT3D_03
L_6724: BX = CINT(FAC!)  ' RT3F_77
L_6727: DI = BX
L_6729: SI = &H9F98
L_672C: BX = CINT(N_9F98!)  ' RT3F_75
L_672F: BX = BX * (2 ^ 1)
L_6731: BX = BX * (2 ^ 1)
L_6733: DI = DI + BX
L_6735: DI = DI * (2 ^ 1)
L_6737: DI = DI * (2 ^ 1)
L_6739: DI = DI + &H8948
L_673D: SI = &H6F82
L_6740: N(DI) = N_6F82!  ' RT3F_7B
L_6743: RETURN
L_6744: FAC! = RND  ' RT3D_34
L_6747: DI = &H71D8
L_674A: FAC! = FAC! * N_71D8!  ' RT3F_91
L_674D: BX = &H1A
L_6750: FAC! = INT(FAC!)  ' RT3D_03
L_6753: DI = 0xA8F4
L_6756: N_A8F4! = FAC!: SI = &H001A  ' RT3F_7D
L_6759: SI = &H9F98
L_675C: BX = CINT(N_9F98!)  ' RT3F_75
L_675F: AX = BX
L_6761: SI = 6
L_6764: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_6766: SI = AX
L_6768: SWAP DI, SI
L_676A: DX = BX
L_676C: BX = CINT(N_A8F4!)  ' RT3F_75
L_676F: DI = DI + BX
L_6771: DI = DI * (2 ^ 1)
L_6773: DI = DI * (2 ^ 1)
L_6775: DI = DI + &H8A1C
L_6779: SI = 0xA014
L_677C: N(DI) = N_A014!  ' RT3F_7B
L_677F: FAC! = RND  ' RT3D_34
L_6782: DI = &H71B8
L_6785: FAC! = FAC! * N_71B8!  ' RT3F_91
L_6788: SI = DX
L_678A: SI = SI * (2 ^ 1)
L_678C: SI = SI * (2 ^ 1)
L_678E: BX = SI
L_6790: SI = SI + &H8894
L_6794: DI = &H8BD8
L_6797: T_12! = FAC!  ' RT3F_71; inline=&H92
L_679B: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_679E: DX = SI
L_67A0: CompareLeft! = T_12!: CompareRight! = FAC!  ' RT3F_A5; inline=&H92
L_67A4: IF CompareLeft! < CompareRight! THEN GOTO L_67A9  ' flags from L_67A0
L_67A6: GOTO L_67E7
L_67A9: SI = DX
L_67AB: FAC! = SGN(N(SI))  ' RT3F_2F
L_67AE: DI = 0xA82C
L_67B1: N_A82C! = FAC!: SI = &H001A  ' RT3F_7D
L_67B4: SI = DX
L_67B6: DI = &H70AA
L_67B9: FAC! = N(SI) + N_70AA!  ' RT3F_7F
L_67BC: DI = DX
L_67BE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_67C1: DI = 0xA9A6
L_67C4: SI = &H8B8C
L_67C7: FAC! = N_8B8C! * N_A9A6!  ' RT3F_8F
L_67CA: DI = SI
L_67CC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_67CF: SI = DX
L_67D1: DI = &H6F4A
L_67D4: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_67D7: IF CompareLeft! < CompareRight! THEN GOTO L_67DC  ' flags from L_67D4
L_67D9: GOTO L_67E7
L_67DC: BX = BX + &H8A08
L_67E0: SWAP BX, DI
L_67E2: SI = BX
L_67E4: N(DI) = N(SI)  ' RT3F_7B
L_67E7: RETURN
L_67E8: SI = &H9F98
L_67EB: BX = CINT(N_9F98!)  ' RT3F_75
L_67EE: SI = BX
L_67F0: SI = SI * (2 ^ 1)
L_67F2: SI = SI * (2 ^ 1)
L_67F4: BX = SI
L_67F6: SI = SI + &H89C0
L_67FA: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_67FE: DI = 0xA9E2
L_6801: FAC! = FAC! + N_A9E2!  ' RT3F_81
L_6804: DI = 0xA9BA
L_6807: N_A9BA! = FAC!: SI = &H001A  ' RT3F_7D
L_680A: BX = BX + &H89D8
L_680E: SI = BX
L_6810: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_6814: BX = DI
L_6816: DI = 0xA9E6
L_6819: FAC! = FAC! + N_A9E6!  ' RT3F_81
L_681C: DI = 0xA9BE
L_681F: N_A9BE! = FAC!: SI = &H001A  ' RT3F_7D
L_6822: DX = DI
L_6824: CX = 0xFFFF
L_6827: AX = CX
L_6829: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_682C: SI = DX
L_682E: DI = 0xA9EA
L_6831: FAC! = N(SI) + N_A9EA!  ' RT3F_7F
L_6834: SWAP BX, SI
L_6836: T_12! = FAC!  ' RT3F_71; inline=&H92
L_683A: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_683D: BX = &H1A
L_6840: DX = &H703A
L_6843: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_6846: BX = &H720C
L_6849: DX = &H194
L_684C: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_684F: BX = SI
L_6851: DX = 0xA9BE
L_6854: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6857: BX = &H73F6
L_685A: DX = 0
L_685C: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_685F: GOSUB L_6E0A
L_6862: BX = 0xA9BA
L_6865: DX = 0xA9BE
L_6868: CX = 0xFFFF
L_686B: AX = CX
L_686D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6870: BX = &H758A
L_6873: DX = 0
L_6875: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6878: GOSUB L_6E0A
L_687B: BX = 0xA9BA
L_687E: DX = 0xA9BE
L_6881: CX = 0xFFFF
L_6884: AX = CX
L_6886: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6889: BX = &H771E
L_688C: DX = 0
L_688E: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6891: GOSUB L_6E0A
L_6894: BX = 0xA9BA
L_6897: DX = 0xA9BE
L_689A: CX = 0xFFFF
L_689D: AX = CX
L_689F: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_68A2: BX = &H78B2
L_68A5: DX = 0
L_68A7: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_68AA: GOSUB L_6E0A
L_68AD: DI = 0xA9EE
L_68B0: SI = &H8B84
L_68B3: CompareLeft! = N_8B84!: CompareRight! = N_A9EE!  ' RT3F_9F
L_68B6: IF CompareLeft! < CompareRight! THEN GOTO L_68BB  ' flags from L_68B3
L_68B8: GOTO L_6948
L_68BB: BX = 0xA9BA
L_68BE: DX = 0xA9BE
L_68C1: CX = 0xFFFF
L_68C4: AX = CX
L_68C6: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_68C9: BX = &H812A
L_68CC: DX = 4
L_68CF: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_68D2: GOSUB L_6E0A
L_68D5: BX = 0xA9BA
L_68D8: DX = 0xA9BE
L_68DB: CX = 0xFFFF
L_68DE: AX = CX
L_68E0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_68E3: BX = &H82BE
L_68E6: DX = 4
L_68E9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_68EC: GOSUB L_6E0A
L_68EF: BX = 0xA9BA
L_68F2: DX = 0xA9BE
L_68F5: CX = 0xFFFF
L_68F8: AX = CX
L_68FA: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_68FD: BX = &H8452
L_6900: DX = 4
L_6903: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6906: GOSUB L_6E0A
L_6909: BX = 0xA9BA
L_690C: DX = 0xA9BE
L_690F: CX = 0xFFFF
L_6912: AX = CX
L_6914: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6917: BX = &H720C
L_691A: DX = 3
L_691D: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6920: DI = &H7116
L_6923: SI = 0xA9BE
L_6926: FAC! = N_A9BE! + N_7116!  ' RT3F_7F
L_6929: SI = 0xA9BA
L_692C: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6930: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_6933: BX = &H1A
L_6936: DX = &H703A
L_6939: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_693C: BX = &H8096
L_693F: DX = 3
L_6942: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6945: GOTO L_69EC
L_6948: BX = 0xA9BA
L_694B: DX = 0xA9BE
L_694E: CX = 0xFFFF
L_6951: AX = CX
L_6953: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6956: BX = &H7A46
L_6959: DX = 4
L_695C: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_695F: GOSUB L_6E7C
L_6962: BX = 0xA9BA
L_6965: DX = 0xA9BE
L_6968: CX = 0xFFFF
L_696B: AX = CX
L_696D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6970: BX = &H7BDA
L_6973: DX = 4
L_6976: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6979: GOSUB L_6E7C
L_697C: BX = 0xA9BA
L_697F: DX = 0xA9BE
L_6982: CX = 0xFFFF
L_6985: AX = CX
L_6987: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_698A: BX = &H7D6E
L_698D: DX = 4
L_6990: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6993: GOSUB L_6E7C
L_6996: BX = 0xA9BA
L_6999: DX = 0xA9BE
L_699C: CX = 0xFFFF
L_699F: AX = CX
L_69A1: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_69A4: BX = &H7F02
L_69A7: DX = 4
L_69AA: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_69AD: GOSUB L_6E7C
L_69B0: BX = 0xA9BA
L_69B3: DX = 0xA9BE
L_69B6: CX = 0xFFFF
L_69B9: AX = CX
L_69BB: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_69BE: BX = &H720C
L_69C1: DX = 3
L_69C4: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_69C7: DI = &H7116
L_69CA: SI = 0xA9BE
L_69CD: FAC! = N_A9BE! + N_7116!  ' RT3F_7F
L_69D0: SI = 0xA9BA
L_69D3: T_12! = FAC!  ' RT3F_71; inline=&H92
L_69D7: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_69DA: BX = &H1A
L_69DD: DX = &H703A
L_69E0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_69E3: BX = &H8096
L_69E6: DX = 3
L_69E9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_69EC: SI = &H9F98
L_69EF: BX = CINT(N_9F98!)  ' RT3F_75
L_69F2: DI = BX
L_69F4: DI = DI * (2 ^ 1)
L_69F6: DI = DI * (2 ^ 1)
L_69F8: BX = DI
L_69FA: DI = DI + &H89F0
L_69FE: SI = &H7116
L_6A01: N(DI) = N_7116!  ' RT3F_7B
L_6A04: DI = &H9F4C
L_6A07: SI = &H6F4A
L_6A0A: N_9F4C! = N_6F4A!  ' RT3F_7B
L_6A0D: WORD(BP - &H10) = BX
L_6A10: BX = &H10
L_6A13: DX = 0xC
L_6A16: CX = 0
L_6A18: AX = CX
L_6A1A: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_6A1D: BX = &H8F
L_6A20: DX = &H8B
L_6A23: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_6A26: BX = &H8D06
L_6A29: DX = &H1040
L_6A2C: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_6A2F: DI = WORD(BP - &H10)
L_6A32: DI = DI + &H8A08
L_6A36: N(DI) = N(SI)  ' RT3F_7B
L_6A39: DI = 0xA9F2
L_6A3C: SI = &H8B8C
L_6A3F: FAC! = N_8B8C! * N_A9F2!  ' RT3F_8F
L_6A42: DI = SI
L_6A44: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6A47: RETURN
L_6A48: GOSUB L_630B
L_6A4B: BX = 0xA9B2
L_6A4E: DX = 0xA9B6
L_6A51: CX = 0xFFFF
L_6A54: AX = CX
L_6A56: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_6A59: BX = 0xA9BA
L_6A5C: DX = 0xA9BE
L_6A5F: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_6A62: DX = AX
L_6A64: BX = 1
L_6A67: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_6A6A: DI = 0xA9F6
L_6A6D: SI = &H6F5E
L_6A70: FAC! = N_6F5E! * N_A9F6!  ' RT3F_8F
L_6A73: BX = &H1E61
L_6A76: DX = &H1A
L_6A79: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6A7C: BX = AX
L_6A7E: DX = AX
L_6A80: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6A83: BX = &H22B8
L_6A86: DX = &H6F5E
L_6A89: SoundFreq% = BX: SoundDuration! = N_6F5E!  ' RT3E_5E
L_6A8C: BX = 0xFFFF
L_6A8F: DX = BX
L_6A91: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6A94: SI = &H6F5E
L_6A97: FAC! = N_6F5E! * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_6A9B: BX = &H270F
L_6A9E: DX = &H1A
L_6AA1: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6AA4: BX = 0xFFFF
L_6AA7: DX = BX
L_6AA9: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6AAC: SI = &H6F5E
L_6AAF: FAC! = N_6F5E! * 2 ^ (2)  ' RT3F_AB; inline=&H02
L_6AB3: BX = &H2B67
L_6AB6: DX = &H1A
L_6AB9: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6ABC: BX = 0xFFFF
L_6ABF: DX = BX
L_6AC1: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6AC4: BX = 0xA9B2
L_6AC7: DX = 0xA9B6
L_6ACA: CX = 0xFFFF
L_6ACD: AX = CX
L_6ACF: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_6AD2: BX = 0xA9BA
L_6AD5: DX = 0xA9BE
L_6AD8: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_6ADB: DX = AX
L_6ADD: BX = 2
L_6AE0: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_6AE3: SI = 0xA840
L_6AE6: CompareLeft! = N_A840!: CompareRight! = 0  ' RT3F_A7
L_6AE9: IF CompareLeft! <> CompareRight! THEN GOTO L_6AEE  ' flags from L_6AE6
L_6AEB: GOTO L_6B63
L_6AEE: DI = 0xA9FA
L_6AF1: SI = 0xA9BA
L_6AF4: FAC! = N_A9BA! + N_A9FA!  ' RT3F_7F
L_6AF7: SWAP SI, DI
L_6AF9: BX = SI
L_6AFB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6AFE: SWAP BX, DI
L_6B00: SI = 0xA9BE
L_6B03: FAC! = N_A9BE! + N(DI)  ' RT3F_7F
L_6B06: DI = SI
L_6B08: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6B0B: DX = DI
L_6B0D: CX = 0xFFFF
L_6B10: AX = CX
L_6B12: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_6B15: SI = DX
L_6B17: DI = &H71F8
L_6B1A: FAC! = N(SI) + N_71F8!  ' RT3F_7F
L_6B1D: SI = BX
L_6B1F: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6B23: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_6B26: BX = &H1A
L_6B29: DX = &H703A
L_6B2C: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_6B2F: BX = &H720C
L_6B32: DX = &H194
L_6B35: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_6B38: SI = 0xA90A
L_6B3B: CompareLeft! = N_A90A!: CompareRight! = 0  ' RT3F_A7
L_6B3E: IF CompareLeft! > CompareRight! THEN GOTO L_6B43  ' flags from L_6B3B
L_6B40: GOTO L_6B49
L_6B43: GOSUB L_6EEE
L_6B46: GOTO L_6B4C
L_6B49: GOSUB L_6F3A
L_6B4C: BX = 0xA9BA
L_6B4F: DX = 0xA9BE
L_6B52: CX = 0xFFFF
L_6B55: AX = CX
L_6B57: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6B5A: BX = &H720C
L_6B5D: DX = 3
L_6B60: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6B63: BX = &H10
L_6B66: DX = 0xC
L_6B69: CX = 0
L_6B6B: AX = CX
L_6B6D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6B70: BX = &H8D06
L_6B73: DX = 3
L_6B76: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6B79: RETURN
L_6B7A: GOSUB L_630B
L_6B7D: DI = 0xA9B2
L_6B80: SI = 0xA9BA
L_6B83: FAC! = N_A9BA! - N_A9B2!  ' RT3F_97
L_6B86: DI = 0xA55A
L_6B89: N_A55A! = FAC!: SI = &H001A  ' RT3F_7D
L_6B8C: BX = DI
L_6B8E: DI = 0xA9B6
L_6B91: SI = 0xA9BE
L_6B94: FAC! = N_A9BE! - N_A9B6!  ' RT3F_97
L_6B97: DI = 0xA55E
L_6B9A: N_A55E! = FAC!: SI = &H001A  ' RT3F_7D
L_6B9D: SI = BX
L_6B9F: FAC! = ABS(N(SI))  ' RT3F_2B
L_6BA2: SI = DI
L_6BA4: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6BA8: FAC! = ABS(N(SI))  ' RT3F_2B
L_6BAB: FAC! = T_12! + FAC!  ' RT3F_85; inline=&H92
L_6BAF: DI = 0xAA02
L_6BB2: FAC! = FAC! + N_AA02!  ' RT3F_81
L_6BB5: SI = &H6F54
L_6BB8: FAC! = N_6F54! / FAC!  ' RT3F_8B
L_6BBB: DI = 0xA9FE
L_6BBE: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_6BC1: DI = 0xAA06
L_6BC4: SI = 0xA9FE
L_6BC7: N_AA06! = N_A9FE!  ' RT3F_7B
L_6BCA: SI = &H6F82
L_6BCD: FAC! = N_6F82!: DI = &H001E  ' RT3F_6F
L_6BD0: GOTO L_6C3C
L_6BD3: ' Alignment NOP
L_6BD4: DI = &H9F84
L_6BD7: SI = 0xA55A
L_6BDA: FAC! = N_A55A! * N_9F84!  ' RT3F_8F
L_6BDD: BX = DI
L_6BDF: DI = 0xA9B2
L_6BE2: FAC! = FAC! + N_A9B2!  ' RT3F_81
L_6BE5: DI = &H9F70
L_6BE8: N_9F70! = FAC!: SI = &H001A  ' RT3F_7D
L_6BEB: DI = BX
L_6BED: SI = 0xA55E
L_6BF0: FAC! = N_A55E! * N(DI)  ' RT3F_8F
L_6BF3: DI = 0xA9B6
L_6BF6: FAC! = FAC! + N_A9B6!  ' RT3F_81
L_6BF9: DI = &H9F74
L_6BFC: N_9F74! = FAC!: SI = &H001A  ' RT3F_7D
L_6BFF: GOSUB L_6D58
L_6C02: DI = &H8BC8
L_6C05: SI = &H6F5E
L_6C08: FAC! = N_6F5E! * N_8BC8!  ' RT3F_8F
L_6C0B: BX = &H115C
L_6C0E: DX = &H1A
L_6C11: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6C14: BX = 0xFFFF
L_6C17: DX = BX
L_6C19: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6C1C: GOSUB L_6D58
L_6C1F: SI = 0xAA0A
L_6C22: BX = SI
L_6C24: DX = BX
L_6C26: BX = CINT(N_AA0A!)  ' RT3F_75
L_6C29: BX = NOT BX
L_6C2B: FAC! = CSNG(BX)  ' RT3F_57
L_6C2E: DI = DX
L_6C30: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6C33: DI = 0xAA06
L_6C36: SI = &H9F84
L_6C39: FAC! = N_9F84! + N_AA06!  ' RT3F_7F
L_6C3C: DI = &H9F84
L_6C3F: N_9F84! = FAC!: SI = &H001A  ' RT3F_7D
L_6C42: SI = 0xAA06
L_6C45: CompareLeft! = N_AA06!: CompareRight! = 0  ' RT3F_A7
L_6C48: IF CompareLeft! < CompareRight! THEN GOTO L_6C4D  ' flags from L_6C45
L_6C4A: GOTO L_6C5D
L_6C4D: SI = DI
L_6C4F: DI = &H6F4A
L_6C52: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_6C55: IF CompareLeft! < CompareRight! THEN GOTO L_6C5A  ' flags from L_6C52
L_6C57: GOTO L_6BD4
L_6C5A: GOTO L_6C6B
L_6C5D: DI = &H6F4A
L_6C60: SI = &H9F84
L_6C63: CompareLeft! = N_9F84!: CompareRight! = N_6F4A!  ' RT3F_9F
L_6C66: IF CompareLeft! > CompareRight! THEN GOTO L_6C6B  ' flags from L_6C63
L_6C68: GOTO L_6BD4
L_6C6B: SI = 0xA010
L_6C6E: CompareLeft! = N_A010!: CompareRight! = 0  ' RT3F_A7
L_6C71: IF CompareLeft! <> CompareRight! THEN GOTO L_6C76  ' flags from L_6C6E
L_6C73: GOTO L_6AE3
L_6C76: BX = &H4C
L_6C79: DX = BX
L_6C7B: CX = 0
L_6C7D: AX = CX
L_6C7F: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_6C82: BX = 0xA9BA
L_6C85: DX = 0xA9BE
L_6C88: CX = 0xFFFF
L_6C8B: AX = CX
L_6C8D: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_6C90: DX = AX
L_6C92: BX = 2
L_6C95: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_6C98: DI = &H8BC4
L_6C9B: SI = &H6F5E
L_6C9E: FAC! = N_6F5E! * N_8BC4!  ' RT3F_8F
L_6CA1: BX = &H309
L_6CA4: DX = &H1A
L_6CA7: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6CAA: BX = AX
L_6CAC: DX = AX
L_6CAE: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6CB1: DI = &H719C
L_6CB4: SI = &H6F5E
L_6CB7: FAC! = N_6F5E! * N_719C!  ' RT3F_8F
L_6CBA: BX = &H378
L_6CBD: DX = &H1A
L_6CC0: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6CC3: BX = 0xFFFF
L_6CC6: DX = BX
L_6CC8: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6CCB: DI = &H8BAC
L_6CCE: SI = &H6F5E
L_6CD1: FAC! = N_6F5E! * N_8BAC!  ' RT3F_8F
L_6CD4: BX = &H29A
L_6CD7: DX = &H1A
L_6CDA: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6CDD: BX = 0xFFFF
L_6CE0: DX = BX
L_6CE2: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6CE5: DI = &H8BC0
L_6CE8: SI = &H6F5E
L_6CEB: FAC! = N_6F5E! * N_8BC0!  ' RT3F_8F
L_6CEE: BX = &H309
L_6CF1: DX = &H1A
L_6CF4: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6CF7: BX = 0xFFFF
L_6CFA: DX = BX
L_6CFC: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6CFF: DI = 0xAA0E
L_6D02: SI = &H6F5E
L_6D05: FAC! = N_6F5E! * N_AA0E!  ' RT3F_8F
L_6D08: BX = &H2BC
L_6D0B: DX = &H1A
L_6D0E: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6D11: BX = 0xFFFF
L_6D14: DX = BX
L_6D16: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6D19: DI = &H8BC4
L_6D1C: SI = &H6F5E
L_6D1F: FAC! = N_6F5E! * N_8BC4!  ' RT3F_8F
L_6D22: BX = &H320
L_6D25: DX = &H1A
L_6D28: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6D2B: BX = 0xFFFF
L_6D2E: DX = BX
L_6D30: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6D33: BX = &H4C
L_6D36: DX = BX
L_6D38: CX = 0
L_6D3A: AX = CX
L_6D3C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_6D3F: BX = 0xA9BA
L_6D42: DX = 0xA9BE
L_6D45: CX = 0xFFFF
L_6D48: AX = CX
L_6D4A: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_6D4D: DX = AX
L_6D4F: BX = 3
L_6D52: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_6D55: GOTO L_6AEE
L_6D58: SI = 0xAA0A
L_6D5B: BX = BASIC_BOOL(N_AA0A! <> 0)  ' RT3F_1D
L_6D5E: CompareLeft% = BX: CompareRight% = 0
L_6D60: IF CompareLeft% <> CompareRight% THEN GOTO L_6D65  ' flags from L_6D5E
L_6D62: GOTO L_6D7F
L_6D65: BX = &H9F70
L_6D68: DX = &H9F74
L_6D6B: CX = 0xFFFF
L_6D6E: AX = CX
L_6D70: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6D73: BX = &H73E6
L_6D76: DX = 4
L_6D79: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6D7C: GOTO L_6D96
L_6D7F: BX = &H9F70
L_6D82: DX = &H9F74
L_6D85: CX = 0xFFFF
L_6D88: AX = CX
L_6D8A: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6D8D: BX = &H73EE
L_6D90: DX = 4
L_6D93: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6D96: RETURN
L_6D97: SI = &H6F5E
L_6D9A: BX = BASIC_BOOL(N_6F5E! <> 0)  ' RT3F_1D
L_6D9D: CompareLeft% = BX: CompareRight% = 0
L_6D9F: IF CompareLeft% <> CompareRight% THEN GOTO L_6DA4  ' flags from L_6D9D
L_6DA1: GOTO L_6E09
L_6DA4: SI = &H6F4A
L_6DA7: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_6DAA: GOTO L_6DE8
L_6DAD: ' Alignment NOP
L_6DAE: FAC! = RND  ' RT3D_34
L_6DB1: DI = 0xAA12
L_6DB4: FAC! = FAC! / N_AA12!  ' RT3F_89
L_6DB7: DI = 0xAA16
L_6DBA: FAC! = FAC! + N_AA16!  ' RT3F_81
L_6DBD: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6DC1: FAC! = RND  ' RT3D_34
L_6DC4: FAC! = FAC! * 2 ^ (5)  ' RT3F_AD; inline=&H05
L_6DC8: DI = 0xA002
L_6DCB: FAC! = FAC! + N_A002!  ' RT3F_81
L_6DCE: BX = CINT(FAC!)  ' RT3F_77
L_6DD1: DX = &H703A
L_6DD4: SoundFreq% = BX: SoundDuration! = N_703A!  ' RT3E_5E
L_6DD7: BX = 0xFFFF
L_6DDA: DX = BX
L_6DDC: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6DDF: DI = &H6F4A
L_6DE2: SI = 0xAA1A
L_6DE5: FAC! = N_AA1A! + N_6F4A!  ' RT3F_7F
L_6DE8: DI = 0xAA1A
L_6DEB: N_AA1A! = FAC!: SI = &H001A  ' RT3F_7D
L_6DEE: SI = DI
L_6DF0: DI = &H8BD4
L_6DF3: CompareLeft! = N_AA1A!: CompareRight! = N_8BD4!  ' RT3F_9F
L_6DF6: IF CompareLeft! <= CompareRight! THEN GOTO L_6DAE  ' flags from L_6DF3
L_6DF8: BX = &H3C
L_6DFB: DX = 0xAA1E
L_6DFE: SoundFreq% = BX: SoundDuration! = N_AA1E!  ' RT3E_5E

```

### Numerical and delay helpers

```basic
L_6E01: BX = 0xFFFF
L_6E04: DX = BX
L_6E06: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6E09: RETURN
L_6E0A: SI = &H6F5E
L_6E0D: BX = BASIC_BOOL(N_6F5E! <> 0)  ' RT3F_1D
L_6E10: CompareLeft% = BX: CompareRight% = 0
L_6E12: IF CompareLeft% <> CompareRight% THEN GOTO L_6E17  ' flags from L_6E10
L_6E14: GOTO L_6E7B
L_6E17: SI = &H6F4A
L_6E1A: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_6E1D: GOTO L_6E5A
L_6E20: FAC! = RND  ' RT3D_34
L_6E23: DI = 0xAA22
L_6E26: FAC! = FAC! / N_AA22!  ' RT3F_89
L_6E29: DI = 0xAA16
L_6E2C: FAC! = FAC! + N_AA16!  ' RT3F_81
L_6E2F: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6E33: FAC! = RND  ' RT3D_34
L_6E36: FAC! = FAC! * 2 ^ (5)  ' RT3F_AD; inline=&H05
L_6E3A: DI = &H9EAA
L_6E3D: FAC! = FAC! + N_9EAA!  ' RT3F_81
L_6E40: BX = CINT(FAC!)  ' RT3F_77
L_6E43: DX = &H703A
L_6E46: SoundFreq% = BX: SoundDuration! = N_703A!  ' RT3E_5E
L_6E49: BX = 0xFFFF
L_6E4C: DX = BX
L_6E4E: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6E51: DI = &H6F4A
L_6E54: SI = 0xAA1A
L_6E57: FAC! = N_AA1A! + N_6F4A!  ' RT3F_7F
L_6E5A: DI = 0xAA1A
L_6E5D: N_AA1A! = FAC!: SI = &H001A  ' RT3F_7D
L_6E60: SI = DI
L_6E62: DI = &H71CC
L_6E65: CompareLeft! = N_AA1A!: CompareRight! = N_71CC!  ' RT3F_9F
L_6E68: IF CompareLeft! <= CompareRight! THEN GOTO L_6E20  ' flags from L_6E65
L_6E6A: BX = &H28
L_6E6D: DX = 0xAA26
L_6E70: SoundFreq% = BX: SoundDuration! = N_AA26!  ' RT3E_5E
L_6E73: BX = 0xFFFF
L_6E76: DX = BX
L_6E78: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6E7B: RETURN
L_6E7C: SI = &H6F5E
L_6E7F: BX = BASIC_BOOL(N_6F5E! <> 0)  ' RT3F_1D
L_6E82: CompareLeft% = BX: CompareRight% = 0
L_6E84: IF CompareLeft% <> CompareRight% THEN GOTO L_6E89  ' flags from L_6E82
L_6E86: GOTO L_6EED
L_6E89: SI = &H6F4A
L_6E8C: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_6E8F: GOTO L_6ECC
L_6E92: FAC! = RND  ' RT3D_34
L_6E95: DI = 0xAA12
L_6E98: FAC! = FAC! / N_AA12!  ' RT3F_89
L_6E9B: DI = 0xAA16
L_6E9E: FAC! = FAC! + N_AA16!  ' RT3F_81
L_6EA1: T_12! = FAC!  ' RT3F_71; inline=&H92
L_6EA5: FAC! = RND  ' RT3D_34
L_6EA8: FAC! = FAC! * 2 ^ (5)  ' RT3F_AD; inline=&H05
L_6EAC: DI = &H9EAA
L_6EAF: FAC! = FAC! + N_9EAA!  ' RT3F_81
L_6EB2: BX = CINT(FAC!)  ' RT3F_77
L_6EB5: DX = &H703A
L_6EB8: SoundFreq% = BX: SoundDuration! = N_703A!  ' RT3E_5E
L_6EBB: BX = 0xFFFF
L_6EBE: DX = BX
L_6EC0: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6EC3: DI = &H6F4A
L_6EC6: SI = 0xAA1A
L_6EC9: FAC! = N_AA1A! + N_6F4A!  ' RT3F_7F
L_6ECC: DI = 0xAA1A
L_6ECF: N_AA1A! = FAC!: SI = &H001A  ' RT3F_7D
L_6ED2: SI = DI
L_6ED4: DI = &H6F8A
L_6ED7: CompareLeft! = N_AA1A!: CompareRight! = N_6F8A!  ' RT3F_9F
L_6EDA: IF CompareLeft! <= CompareRight! THEN GOTO L_6E92  ' flags from L_6ED7
L_6EDC: BX = &H28
L_6EDF: DX = 0xAA26
L_6EE2: SoundFreq% = BX: SoundDuration! = N_AA26!  ' RT3E_5E
L_6EE5: BX = 0xFFFF
L_6EE8: DX = BX
L_6EEA: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6EED: RETURN
L_6EEE: BX = 0xA9BA
L_6EF1: DX = 0xA9BE
L_6EF4: CX = 0xFFFF
L_6EF7: AX = CX
L_6EF9: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6EFC: BX = &H85E6
L_6EFF: DX = 0
L_6F01: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6F04: GOSUB L_6D97
L_6F07: BX = 0xA9BA
L_6F0A: DX = 0xA9BE
L_6F0D: CX = 0xFFFF
L_6F10: AX = CX
L_6F12: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6F15: BX = &H867A
L_6F18: DX = 0
L_6F1A: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6F1D: GOSUB L_6D97
L_6F20: BX = 0xA9BA
L_6F23: DX = 0xA9BE
L_6F26: CX = 0xFFFF
L_6F29: AX = CX
L_6F2B: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6F2E: BX = &H870E
L_6F31: DX = 0
L_6F33: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6F36: GOSUB L_6D97
L_6F39: RETURN
L_6F3A: DI = &H71CC
L_6F3D: SI = 0xA9BA
L_6F40: FAC! = N_A9BA! + N_71CC!  ' RT3F_7F
L_6F43: BX = DI
L_6F45: DI = 0xAA2A
L_6F48: N_AA2A! = FAC!: SI = &H001A  ' RT3F_7D
L_6F4B: SWAP BX, DI
L_6F4D: SI = 0xA9BE
L_6F50: FAC! = N_A9BE! + N(DI)  ' RT3F_7F
L_6F53: DI = 0xAA2E
L_6F56: N_AA2E! = FAC!: SI = &H001A  ' RT3F_7D
L_6F59: DX = DI
L_6F5B: CX = 0xFFFF
L_6F5E: AX = CX
L_6F60: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6F63: BX = &H87A2
L_6F66: DX = 4
L_6F69: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6F6C: DI = &H8BAC
L_6F6F: SI = &H6F5E
L_6F72: FAC! = N_6F5E! * N_8BAC!  ' RT3F_8F
L_6F75: BX = &H5A4
L_6F78: DX = &H1A
L_6F7B: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6F7E: BX = AX
L_6F80: DX = AX
L_6F82: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6F85: BX = 0xAA2A
L_6F88: DX = 0xAA2E
L_6F8B: CX = 0xFFFF
L_6F8E: AX = CX
L_6F90: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6F93: BX = &H87E6
L_6F96: DX = 4
L_6F99: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6F9C: DI = &H719C
L_6F9F: SI = &H6F5E
L_6FA2: FAC! = N_6F5E! * N_719C!  ' RT3F_8F
L_6FA5: BX = 0xA6A
L_6FA8: DX = &H1A
L_6FAB: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6FAE: BX = AX
L_6FB0: DX = AX
L_6FB2: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6FB5: BX = 0xAA2A
L_6FB8: DX = 0xAA2E
L_6FBB: CX = 0xFFFF
L_6FBE: AX = CX
L_6FC0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_6FC3: BX = &H882A
L_6FC6: DX = 4
L_6FC9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_6FCC: DI = &H8BC4
L_6FCF: SI = &H6F5E
L_6FD2: FAC! = N_6F5E! * N_8BC4!  ' RT3F_8F
L_6FD5: BX = &H613
L_6FD8: DX = &H1A
L_6FDB: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_6FDE: BX = AX
L_6FE0: DX = AX
L_6FE2: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_6FE5: RETURN
L_6FE6: DI = 0xAA32
L_6FE9: SI = 0xA014
L_6FEC: N_AA32! = N_A014!  ' RT3F_7B
L_6FEF: SI = 0xA582
L_6FF2: FAC! = N_A582!: DI = &H001E  ' RT3F_6F
L_6FF5: GOTO L_703E
L_6FF8: DI = &H6F54
L_6FFB: SI = &H710E
L_6FFE: FAC! = N_710E! + N_6F54!  ' RT3F_7F
L_7001: BX = SI
L_7003: DX = BX
L_7005: BX = CINT(FAC!)  ' RT3F_77
L_7008: SI = BX
L_700A: SI = SI * (2 ^ 1)
L_700C: SI = SI * (2 ^ 1)
L_700E: SI = SI + &H1850
L_7012: SWAP DX, SI
L_7014: BX = SI
L_7016: CX = BX
L_7018: BX = CINT(N(SI))  ' RT3F_75
L_701B: SI = BX
L_701D: SI = SI * (2 ^ 1)
L_701F: SI = SI * (2 ^ 1)
L_7021: SI = SI + &H1850
L_7025: FAC! = SGN(N(SI))  ' RT3F_2F
L_7028: SI = DX
L_702A: FAC! = N(SI) * FAC!  ' RT3F_93
L_702D: DI = 0xAA32
L_7030: FAC! = FAC! + N_AA32!  ' RT3F_81
L_7033: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7036: SI = CX
L_7038: DI = &H710A
L_703B: FAC! = N(SI) + N_710A!  ' RT3F_7F
L_703E: DI = &H710E
L_7041: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_7044: SI = DI
L_7046: DI = 0xAA36
L_7049: CompareLeft! = N_710E!: CompareRight! = N_AA36!  ' RT3F_9F
L_704C: IF CompareLeft! <= CompareRight! THEN GOTO L_6FF8  ' flags from L_7049
L_704E: DI = &H1924
L_7051: SI = &H192C
L_7054: FAC! = N_192C! / N_1924!  ' RT3F_87
L_7057: DI = &H8BD8
L_705A: FAC! = FAC! * N_8BD8!  ' RT3F_91
L_705D: DI = 0xAA32
L_7060: FAC! = FAC! + N_AA32!  ' RT3F_81
L_7063: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7066: SI = &H71E8
L_7069: FAC! = N_71E8!: DI = &H001E  ' RT3F_6F
L_706C: GOTO L_70B6
L_706F: ' Alignment NOP
L_7070: DI = 0xAA3A
L_7073: SI = &H710E
L_7076: FAC! = N_710E! + N_AA3A!  ' RT3F_7F
L_7079: BX = SI
L_707B: DX = BX
L_707D: BX = CINT(FAC!)  ' RT3F_77
L_7080: SI = BX
L_7082: SI = SI * (2 ^ 1)
L_7084: SI = SI * (2 ^ 1)
L_7086: SI = SI + &H1850
L_708A: SWAP DX, SI
L_708C: BX = SI
L_708E: CX = BX
L_7090: BX = CINT(N(SI))  ' RT3F_75
L_7093: SI = BX
L_7095: SI = SI * (2 ^ 1)
L_7097: SI = SI * (2 ^ 1)
L_7099: SI = SI + &H1850
L_709D: FAC! = SGN(N(SI))  ' RT3F_2F
L_70A0: SI = DX
L_70A2: FAC! = N(SI) * FAC!  ' RT3F_93
L_70A5: DI = 0xAA32
L_70A8: FAC! = FAC! + N_AA32!  ' RT3F_81
L_70AB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_70AE: SI = CX
L_70B0: DI = &H6F4A
L_70B3: FAC! = N(SI) + N_6F4A!  ' RT3F_7F
L_70B6: DI = &H710E
L_70B9: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_70BC: SI = DI
L_70BE: DI = &H71EC
L_70C1: CompareLeft! = N_710E!: CompareRight! = N_71EC!  ' RT3F_9F
L_70C4: IF CompareLeft! <= CompareRight! THEN GOTO L_7070  ' flags from L_70C1
L_70C6: SI = &H71BC
L_70C9: FAC! = N_71BC!: DI = &H001E  ' RT3F_6F
L_70CC: GOTO L_7116
L_70CF: ' Alignment NOP
L_70D0: DI = &H710A
L_70D3: SI = &H710E
L_70D6: FAC! = N_710E! + N_710A!  ' RT3F_7F
L_70D9: BX = SI
L_70DB: DX = BX
L_70DD: BX = CINT(FAC!)  ' RT3F_77
L_70E0: SI = BX
L_70E2: SI = SI * (2 ^ 1)
L_70E4: SI = SI * (2 ^ 1)
L_70E6: SI = SI + &H1850
L_70EA: SWAP DX, SI
L_70EC: BX = SI
L_70EE: CX = BX
L_70F0: BX = CINT(N(SI))  ' RT3F_75
L_70F3: SI = BX
L_70F5: SI = SI * (2 ^ 1)
L_70F7: SI = SI * (2 ^ 1)
L_70F9: SI = SI + &H1850
L_70FD: FAC! = SGN(N(SI))  ' RT3F_2F
L_7100: SI = DX
L_7102: FAC! = N(SI) * FAC!  ' RT3F_93
L_7105: DI = 0xAA32
L_7108: FAC! = FAC! + N_AA32!  ' RT3F_81
L_710B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_710E: SI = CX
L_7110: DI = &H6F8A
L_7113: FAC! = N(SI) + N_6F8A!  ' RT3F_7F
L_7116: DI = &H710E
L_7119: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_711C: SI = DI
L_711E: DI = &H71DC
L_7121: CompareLeft! = N_710E!: CompareRight! = N_71DC!  ' RT3F_9F
L_7124: IF CompareLeft! <= CompareRight! THEN GOTO L_70D0  ' flags from L_7121
L_7126: DI = 0xAA3E
L_7129: SI = 0xAA32
L_712C: CompareLeft! = N_AA32!: CompareRight! = N_AA3E!  ' RT3F_9F
L_712F: IF CompareLeft! > CompareRight! THEN GOTO L_7134  ' flags from L_712C
L_7131: GOTO L_7139
L_7134: SWAP DI, SI
L_7136: N(DI) = N(SI)  ' RT3F_7B
L_7139: DI = &H6F4A
L_713C: SI = &H1894
L_713F: CompareLeft! = N_1894!: CompareRight! = N_6F4A!  ' RT3F_9F
L_7142: BX = 0
L_7145: IF CompareLeft! <> CompareRight! THEN GOTO L_7148  ' flags from L_713F
L_7147: BX = BX - 1
L_7148: CompareLeft% = BX: CompareRight% = 0
L_714A: IF CompareLeft% >= CompareRight% THEN GOTO L_714E  ' flags from L_7148
L_714C: BX = -BX
L_714E: FAC! = CSNG(BX)  ' RT3F_57
L_7151: SI = &H194C
L_7154: FAC! = N_194C! * FAC!  ' RT3F_93
L_7157: DI = 0xAA42
L_715A: N_AA42! = FAC!: SI = &H001A  ' RT3F_7D
L_715D: SI = DI
L_715F: DI = &H6F54
L_7162: CompareLeft! = N_AA42!: CompareRight! = N_6F54!  ' RT3F_9F
L_7165: BX = 0
L_7168: IF CompareLeft! <= CompareRight! THEN GOTO L_716B  ' flags from L_7162
L_716A: BX = BX - 1
L_716B: FAC! = CSNG(BX)  ' RT3F_57
L_716E: BX = SI
L_7170: SI = &H1900
L_7173: FAC! = N_1900! - FAC!  ' RT3F_9B
L_7176: SI = BX
L_7178: DI = &H71CC
L_717B: T_12! = FAC!  ' RT3F_71; inline=&H92
L_717F: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_7182: DX = 0
L_7185: IF CompareLeft! <= CompareRight! THEN GOTO L_7188  ' flags from L_717F
L_7187: DX = DX - 1
L_7188: SWAP DX, BX
L_718A: FAC! = CSNG(BX)  ' RT3F_57
L_718D: FAC! = T_12! - FAC!  ' RT3F_9D; inline=&H92
L_7191: DI = DX
L_7193: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7196: BX = 0xAA32
L_7199: FAC! = INT(N_AA32!)  ' RT3D_03
L_719C: DI = &H1910
L_719F: N_1910! = FAC!: SI = &H001A  ' RT3F_7D
L_71A2: BX = DI
L_71A4: DI = &H8BD8
L_71A7: SI = &H1904
L_71AA: FAC! = N_1904! * N_8BD8!  ' RT3F_8F
L_71AD: SWAP BX, SI
L_71AF: FAC! = N(SI) + FAC!  ' RT3F_83
L_71B2: DI = &H1918
L_71B5: DX = SI
L_71B7: N_1918! = FAC!: SI = &H001A  ' RT3F_7D
L_71BA: DI = BX
L_71BC: SI = &H1908
L_71BF: FAC! = N_1908! - N(DI)  ' RT3F_97
L_71C2: SI = DX
L_71C4: FAC! = N(SI) / FAC!  ' RT3F_8B
L_71C7: DI = &H7184
L_71CA: FAC! = FAC! * N_7184!  ' RT3F_91
L_71CD: SI = &H6F54
L_71D0: FAC! = N_6F54! - FAC!  ' RT3F_9B
L_71D3: DI = 0xAA42
L_71D6: FAC! = FAC! * N_AA42!  ' RT3F_91
L_71D9: DI = &H9EF2
L_71DC: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_71DF: SI = DI
L_71E1: CompareLeft! = N_9EF2!: CompareRight! = 0  ' RT3F_A7
L_71E4: IF CompareLeft! < CompareRight! THEN GOTO L_71E9  ' flags from L_71E1
L_71E6: GOTO L_71F2
L_71E9: SI = &H6F82
L_71EC: N(DI) = N_6F82!  ' RT3F_7B
L_71EF: GOTO L_7205
L_71F2: DI = 0xAA42
L_71F5: SI = &H9EF2
L_71F8: CompareLeft! = N_9EF2!: CompareRight! = N_AA42!  ' RT3F_9F
L_71FB: IF CompareLeft! > CompareRight! THEN GOTO L_7200  ' flags from L_71F8
L_71FD: GOTO L_7205

```

### Delay-factor entry and final helpers

```basic
L_7200: SWAP DI, SI
L_7202: N(DI) = N(SI)  ' RT3F_7B
L_7205: DI = &H71D8
L_7208: SI = &H9EF2
L_720B: CompareLeft! = N_9EF2!: CompareRight! = N_71D8!  ' RT3F_9F
L_720E: IF CompareLeft! > CompareRight! THEN GOTO L_7213  ' flags from L_720B
L_7210: GOTO L_7218
L_7213: SWAP DI, SI
L_7215: N(DI) = N(SI)  ' RT3F_7B
L_7218: DI = &H719C
L_721B: SI = &H9EF2
L_721E: FAC! = N_9EF2! + N_719C!  ' RT3F_7F
L_7221: BX = &H1A
L_7224: FAC! = INT(FAC!)  ' RT3D_03
L_7227: DI = &H1998
L_722A: N_1998! = FAC!: SI = &H001A  ' RT3F_7D
L_722D: RETURN
L_722E: GOSUB L_1D8C
L_7231: BX = &H14
L_7234: ARGPUSH BX  ' RT3E_42
L_7237: BX = 3
L_723A: LOCATE ARGS(), BX  ' RT3E_44
L_723D: ' PRINT statement begins ; RT3F_BC
L_7240: DX = BX
L_7242: BX = 0xAA46
L_7245: PRINT S_AA46$;  ' RT3F_6A
L_7248: BX = &H19A8
L_724B: PRINT N_19A8!  ' RT3F_6B
L_724E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7251: BX = &H16
L_7254: ARGPUSH BX  ' RT3E_42
L_7257: BX = DX
L_7259: LOCATE ARGS(), BX  ' RT3E_44
L_725C: ' PRINT statement begins ; RT3F_BC
L_725F: BX = 0xAA60
L_7262: PRINT S_AA60$;  ' RT3F_6A
L_7265: BX = &H19B0
L_7268: PRINT N_19B0!  ' RT3F_6B
L_726B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_726E: BX = &H18
L_7271: ARGPUSH BX  ' RT3E_42
L_7274: BX = DX
L_7276: LOCATE ARGS(), BX  ' RT3E_44
L_7279: ' PRINT statement begins ; RT3F_BC
L_727C: BX = 0xAA7A
L_727F: PRINT S_AA7A$;  ' RT3F_6A
L_7282: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7285: GOSUB L_1E13
L_7288: CompareLeft% = WORD(0xA00E): CompareRight% = 1
L_728D: IF CompareLeft% < CompareRight% THEN GOTO L_7292  ' flags from L_7288
L_728F: GOTO L_7298
L_7292: WORD(0xA00E) = 1
L_7298: CompareLeft% = WORD(0xA00E): CompareRight% = &H270F
L_729E: IF CompareLeft% > CompareRight% THEN GOTO L_72A3  ' flags from L_7298
L_72A0: GOTO L_72A9
L_72A3: WORD(0xA00E) = &H270F
L_72A9: BX = WORD(0xA00E)
L_72AD: FAC! = CSNG(BX)  ' RT3F_57
L_72B0: DI = &H19B0
L_72B3: N_19B0! = FAC!: SI = &H001A  ' RT3F_7D
L_72B6: GOTO L_3231
L_72B9: RETURN
L_72BA: DI = 0xA720
L_72BD: SI = &H3AB0
L_72C0: FAC! = N_3AB0! - N_A720!  ' RT3F_97
L_72C3: DI = &H9EF2
L_72C6: N_9EF2! = FAC!: SI = &H001A  ' RT3F_7D
L_72C9: SI = DI
L_72CB: CompareLeft! = N_9EF2!: CompareRight! = 0  ' RT3F_A7
L_72CE: IF CompareLeft! <= CompareRight! THEN GOTO L_72D3  ' flags from L_72CB
L_72D0: GOTO L_72D9
L_72D3: SI = &H6F82
L_72D6: N(DI) = N_6F82!  ' RT3F_7B
L_72D9: BX = &H9EF2
L_72DC: FAC! = INT(N_9EF2!)  ' RT3D_03
L_72DF: DI = &H3AB0
L_72E2: N_3AB0! = FAC!: SI = &H001A  ' RT3F_7D
L_72E5: GOSUB L_1720
L_72E8: RETURN
L_72E9: DI = 0xAA9A
L_72EC: SI = &H6F54
L_72EF: N_AA9A! = N_6F54!  ' RT3F_7B
L_72F2: SI = &H6F4A
L_72F5: FAC! = N_6F4A!: DI = &H001E  ' RT3F_6F
L_72F8: GOTO L_7394
L_72FB: ' Alignment NOP
L_72FC: DI = &H719C
L_72FF: SI = &H6F5E
L_7302: FAC! = N_6F5E! * N_719C!  ' RT3F_8F
L_7305: BX = &H115C
L_7308: DX = &H1A
L_730B: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_730E: BX = 0xFFFF
L_7311: DX = BX
L_7313: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_7316: BX = &H2A6
L_7319: DX = &H6F5E
L_731C: SoundFreq% = BX: SoundDuration! = N_6F5E!  ' RT3E_5E
L_731F: BX = 0xFFFF
L_7322: DX = BX
L_7324: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_7327: BX = 8
L_732A: ARGPUSH BX  ' RT3E_42
L_732D: BX = &H18
L_7330: LOCATE ARGS(), BX  ' RT3E_44
L_7333: ' PRINT statement begins ; RT3F_BC
L_7336: BX = 0xAA9E
L_7339: PRINT S_AA9E$  ' RT3F_6E; H newline item, ledger correction
L_733C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_733F: DI = &H8BC8
L_7342: SI = &H6F5E
L_7345: FAC! = N_6F5E! * N_8BC8!  ' RT3F_8F
L_7348: BX = 0xD05
L_734B: DX = &H1A
L_734E: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_7351: BX = 0xFFFF
L_7354: DX = BX
L_7356: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_7359: DI = 0xAAA6
L_735C: SI = &H6F5E
L_735F: FAC! = N_6F5E! * N_AAA6!  ' RT3F_8F
L_7362: BX = &H22B8
L_7365: DX = &H1A
L_7368: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_736B: BX = 0xFFFF
L_736E: DX = BX
L_7370: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_7373: BX = 8
L_7376: ARGPUSH BX  ' RT3E_42
L_7379: BX = &H18
L_737C: LOCATE ARGS(), BX  ' RT3E_44
L_737F: ' PRINT statement begins ; RT3F_BC
L_7382: BX = 0xAAAA
L_7385: PRINT S_AAAA$  ' RT3F_6E; H newline item, ledger correction
L_7388: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_738B: DI = &H6F4A
L_738E: SI = &H710E
L_7391: FAC! = N_710E! + N_6F4A!  ' RT3F_7F
L_7394: DI = &H710E
L_7397: N_710E! = FAC!: SI = &H001A  ' RT3F_7D
L_739A: SI = DI
L_739C: DI = &H8BD4
L_739F: CompareLeft! = N_710E!: CompareRight! = N_8BD4!  ' RT3F_9F
L_73A2: IF CompareLeft! > CompareRight! THEN GOTO L_73A7  ' flags from L_739F
L_73A4: GOTO L_72FC
L_73A7: RETURN
L_73A8: RETURN
L_73A9: DI = &H71F8
L_73AC: SI = &H8B80
L_73AF: CompareLeft! = N_8B80!: CompareRight! = N_71F8!  ' RT3F_9F
L_73B2: IF CompareLeft! = CompareRight! THEN GOTO L_73B7  ' flags from L_73AF
L_73B4: GOTO L_73C0
L_73B7: DI = &H1A04
L_73BA: SI = &H6F4A
L_73BD: N_1A04! = N_6F4A!  ' RT3F_7B
L_73C0: SI = 0xAAB2
L_73C3: FAC! = N_AAB2!: DI = &H001E  ' RT3F_6F
L_73C6: GOTO L_7402
L_73C9: ' Alignment NOP
L_73CA: SI = &H6F86
L_73CD: BX = SI
L_73CF: DX = BX
L_73D1: BX = CINT(N_6F86!)  ' RT3F_75
L_73D4: SI = BX
L_73D6: SI = SI * (2 ^ 1)
L_73D8: SI = SI * (2 ^ 1)
L_73DA: SI = SI + &H1850
L_73DE: DI = &H6F4A
L_73E1: CompareLeft! = N(SI): CompareRight! = N_6F4A!  ' RT3F_9F
L_73E4: IF CompareLeft! = CompareRight! THEN GOTO L_73E9  ' flags from L_73E1
L_73E6: GOTO L_73F9
L_73E9: DI = SI
L_73EB: SI = &H6F54
L_73EE: N(DI) = N_6F54!  ' RT3F_7B
L_73F1: DI = DX
L_73F3: SI = 0xAAB6
L_73F6: N(DI) = N_AAB6!  ' RT3F_7B
L_73F9: DI = &H6F4A
L_73FC: SI = &H6F86
L_73FF: FAC! = N_6F86! + N_6F4A!  ' RT3F_7F
L_7402: DI = &H6F86
L_7405: N_6F86! = FAC!: SI = &H001A  ' RT3F_7D
L_7408: SI = DI
L_740A: DI = 0xAABA
L_740D: CompareLeft! = N_6F86!: CompareRight! = N_AABA!  ' RT3F_9F
L_7410: IF CompareLeft! <= CompareRight! THEN GOTO L_73CA  ' flags from L_740D
L_7412: RETURN

```

### Unclassified trailing instructions

```basic
L_7413: DX = DI
L_7415: DI = 0xA658
L_7418: SI = 0xA534
L_741B: N_A658! = N_A534!  ' RT3F_7B
L_741E: ' Unclassified trailing bytes (instruction crosses metadata boundary): 89 5e

```

## Inline dispatch evidence

The ON statements above use listing labels; these raw payloads preserve the CS-offset source words and allow independent checking of the &H0010 conversion and post-table return address.

| Call | Runtime | Payload bytes (after opcode) | Position after payload |
|---|---|---|---|
| L_1B6E | RT3F_5D | `07 71 1b 89 1b a1 1b b9 1b d1 1b e9 1b 01 1c` | L_1B80 |
| L_20A5 | RT3F_5E | `03 12 29 96 21 9f 20` | L_20AF |
| L_2569 | RT3F_5E | `04 65 25 74 25 83 25 92 25` | L_2575 |
| L_25BD | RT3F_5E | `04 b9 25 b7 27 5e 28 e5 28` | L_25C9 |
| L_33A0 | RT3F_5D | `13 6a 33 c7 46 6a 33 6a 33 d3 46 6a 33 eb 46 6a 33 6a 33 df 46 6a 33 26 47 1a 47 b4 47 76 41 19 47 32 3f 1e 72 26 49` | L_33CA |
| L_4248 | RT3F_5D | `09 84 42 9b 42 b2 42 c9 42 e0 42 f7 42 0e 43 25 43 42 44` | L_425E |
| L_437E | RT3F_5E | `08 82 43 9a 43 b2 43 ca 43 e2 43 fa 43 12 44 2a 44` | L_4392 |
| L_45AD | RT3F_5D | `05 ae 45 c5 45 dc 45 f3 45 0a 46` | L_45BB |
| L_4EDD | RT3F_5D | `17 02 4f 02 4f 02 4f 02 4f 02 4f 9f 4f 99 4e 99 4e 99 4e 99 4e 99 4e b6 4f c0 4f 99 4e 99 4e 99 4e 99 4e fc 4f 99 4e 99 4e 99 4e 99 4e 14 50` | L_4F0F |
| L_5E85 | RT3F_5D | `02 6a 6b 38 6a` | L_5E8D |
| L_65B4 | RT3F_5D | `02 6a 6b 38 6a` | L_65BC |
| L_66B4 | RT3F_5E | `09 ba 66 bb 66 d2 66 e9 66 ba 66 07 67 07 67 34 67 07 67` | L_66CA |

Recovered coverage: 10808 instruction/data records, 3368 runtime sites, 101 distinct runtime IDs, 0 unresolved sites in 0 IDs. Every byte 0040..741F is accounted for as an instruction, inline payload or explicitly unclassified tail bytes; every explicit branch and mapped dispatch destination is an instruction boundary. Inline payloads: 155 sites. Structural checks validate unique labels, branch/table boundaries, runtime provenance and exact unresolved-call inventory. No DOSBox behavior or independent semantic verification is claimed.

## Unknowns

Counts are static call sites in 0040..741F, including the single FMOV in the unclassified tail; no runtime loop multiplier. The corrected byte walk is authoritative for these counts, rather than the original listing footer. Every unresolved call below retains all six live register arguments plus any inline payload in the transcription.

| Runtime | Count | First offsets (all sites in transcription) |
|---|---:|---|
| None | 0 | All 101 runtime identities rendered from the expanded ledger |

No runtime-call identities remain unresolved in this draft after incorporating the expanded ledger. This is not a decode-gate claim. Remaining unknowns include runtime clobbers not fully modeled by this semantic transcription; exact array bounds/record-field meanings and DATA-to-array mappings; attacker/defender/crew field identities; units and interpretation of combat/communications formulas beyond their now-named arithmetic; complete bounds/error behavior for statements; M-confidence PUT action enumeration, exponentiation and SPC details; and the unclassified tail at 7413..741F. Numeric formulas are preserved rather than assigned unsupported gameplay names.

## Variables

Address identities are H. Names remain address-based unless a literal directly identifies their content. MBF operand types are H where a known numeric runtime consumes them; string identities are H from the literal table, with PRINT typing H from the updated ledger. Multiple roles at one address are retained rather than silently reconciled.

| DS address | Type | Draft name | Evidence |
|---|---|---|---|
| &H001A | MBF single | N_001A! | 0106; 032C; 034B; 036A; 03B1 … |
| &H1850 | MBF single | N_1850! | 1D0D |
| &H1854 | MBF single | N_1854! | 03A8; 4751 |
| &H1858 | MBF single | N_1858! | 2C37; 3024 |
| &H185C | MBF single | N_185C! | 1D1B; 475F |
| &H1860 | MBF single | N_1860! | 2159 |
| &H186C | MBF single | N_186C! | 069B |
| &H1870 | MBF single | N_1870! | 06A4 |
| &H1874 | MBF single | N_1874! | 06AF |
| &H1878 | MBF single | N_1878! | 06B7 |
| &H1894 | MBF single | N_1894! | 059C; 51CB; 713F |
| &H1898 | MBF single | N_1898! | 05A2; 51A6 |
| &H189C | MBF single | N_189C! | 05C7; 6094 |
| &H18C4 | MBF single | N_18C4! | 12D9 |
| &H1900 | MBF single | N_1900! | 7173 |
| &H1904 | MBF single | N_1904! | 1025; 71AA |
| &H1908 | MBF single | N_1908! | 71BF |
| &H1910 | MBF single | N_1910! | 719F |
| &H1918 | MBF single | N_1918! | 2802; 71B7 |
| &H191C | MBF single | N_191C! | 0692; 523A |
| &H1920 | MBF single | N_1920! | 2608; 269C; 26AF |
| &H1924 | MBF single | N_1924! | 7054 |
| &H192C | MBF single | N_192C! | 0689; 16EF; 5F84; 6048; 609D … |
| &H1940 | MBF single | N_1940! | 05AD; 5F26 |
| &H1944 | MBF single | N_1944! | 05B6; 51BD |
| &H194C | MBF single | N_194C! | 7154 |
| &H1950 | MBF single | N_1950! | 05BF; 51E2 |
| &H195C | MBF single | N_195C! | 0665; 12FC |
| &H1968 | MBF single | N_1968! | 066B; 130C |
| &H1974 | MBF single | N_1974! | 0671; 1320 |
| &H1980 | MBF single | N_1980! | 0677; 1334 |
| &H1988 | MBF single | N_1988! | 0358; 142A; 145E; 1465 |
| &H198C | MBF single | N_198C! | 035E; 1430; 1470 |
| &H1998 | MBF single | N_1998! | 3258; 722A |
| &H19A4 | MBF single | N_19A4! | 004F; 0066 |
| &H19A8 | MBF single | N_19A8! | 724B |
| &H19B0 | MBF single | N_19B0! | 13DB; 7268; 72B3 |
| &H19C4 | MBF single | N_19C4! | 007D |
| &H1A04 | MBF single | N_1A04! | 73BD |
| &H1D28 | MBF single | N_1D28! | 2D89 |
| &H1D2C | MBF single | N_1D2C! | 2D57; 2E35 |
| &H1D30 | MBF single | N_1D30! | 2DAF |
| &H1D34 | MBF single | N_1D34! | 2E3E |
| &H1D38 | MBF single | N_1D38! | 2DD5 |
| &H1D3C | MBF single | N_1D3C! | 2E4E |
| &H3AB0 | MBF single | N_3AB0! | 0622; 065C; 1735; 1D29; 2608 … |
| &H3AE8 | MBF single | N_3AE8! | 0653; 0680; 06F8; 2E8D; 2EBF … |
| &H3B18 | MBF single | N_3B18! | 18FA; 4378; 47A3; 47B4; 51F1 |
| &H3B20 | MBF single | N_3B20! | 3EEF |
| &H3B24 | MBF single | N_3B24! | 3EFA |
| &H3B40 | MBF single | N_3B40! | 2EEE |
| &H3B44 | MBF single | N_3B44! | 2E87 |
| &H3B50 | MBF single | N_3B50! | 2EB7 |
| &H3B78 | MBF single | N_3B78! | 3F02 |
| &H3B7C | MBF single | N_3B7C! | 3F0E |
| &H3B80 | MBF single | N_3B80! | 3F17 |
| &H3BAC | MBF single | N_3BAC! | 2F16 |
| &H3BB0 | MBF single | N_3BB0! | 2880 |
| &H3BB8 | MBF single | N_3BB8! | 3ED8 |
| &H4290 | string descriptor | S_4290$ | 2194 |
| &H488C | string descriptor | S_488C$ | 25FC |
| &H6F42 | string descriptor | S_6F42$ | 0046; 0074; 06CF; 06E5; 077D … |
| &H6F46 | string descriptor | S_6F46$ | MODULE_CONSTANTS literal ''; 0046; 15CF; 16D3; 17DE … |
| &H6F4A | MBF single | N_6F4A! | 004F; 007D; 00B3; 0178; 01DC … |
| &H6F4A | MBF single constant | N_6F4A! | MODULE_CONSTANTS = 1 |
| &H6F4E | string descriptor | S_6F4E$ | MODULE_CONSTANTS literal 'A:'; 005A |
| &H6F54 | MBF single | N_6F54! | 0066; 0249; 0456; 05DB; 0603 … |
| &H6F54 | MBF single constant | N_6F54! | MODULE_CONSTANTS = 2 |
| &H6F58 | string descriptor | S_6F58$ | MODULE_CONSTANTS literal 'B:'; 0074 |
| &H6F5E | MBF single | N_6F5E! | 0083; 2780; 6A70; 6A89; 6A97 … |
| &H6F82 | MBF single | N_6F82! | 0089; 020F; 0251; 03B7; 0665 … |
| &H6F82 | MBF single constant | N_6F82! | MODULE_CONSTANTS = 0 |
| &H6F86 | MBF single | N_6F86! | 0097; 00B9; 00C1; 195B; 199A … |
| &H6F8A | MBF single | N_6F8A! | 00C1; 04A5; 0653; 0E01; 0FA2 … |
| &H6F8A | MBF single constant | N_6F8A! | MODULE_CONSTANTS = 7 |
| &H6F8E | MBF single | N_6F8E! | 00CA; 01B2; 0371 |
| &H6F92 | string descriptor | S_6F92$ | MODULE_CONSTANTS literal 'spacesh'; 00DE |
| &H6F9E | string descriptor | S_6F9E$ | MODULE_CONSTANTS literal 'CHARINFO'; 00ED |
| &H6FB2 | MBF single | N_6FB2! | 0A02 |
| &H702A | MBF single | N_702A! | 11C0 |
| &H703A | MBF single | N_703A! | 24F3; 2795; 6549; 664B; 6DD4 … |
| &H7042 | MBF single | N_7042! | 55F7; 6578 |
| &H704A | MBF single | N_704A! | 5DFD |
| &H70AA | MBF single | N_70AA! | 094E; 0DC3; 0DDC; 1B24; 228C … |
| &H70AA | MBF single constant | N_70AA! | MODULE_CONSTANTS = -1 |
| &H70AE | string descriptor | S_70AE$ | MODULE_CONSTANTS literal 'SHIP'; 010C |
| &H70B6 | string descriptor | S_70B6$ | 011B |
| &H70BA | string descriptor | S_70BA$ | 0124 |
| &H70BE | string descriptor | S_70BE$ | 012D |
| &H70C2 | string descriptor | S_70C2$ | MODULE_CONSTANTS literal 'Dead'; 011B |
| &H70CA | string descriptor | S_70CA$ | MODULE_CONSTANTS literal 'Okay'; 0124; 1514 |
| &H70D2 | string descriptor | S_70D2$ | MODULE_CONSTANTS literal 'Rad'; 012D |
| &H70DA | string descriptor | S_70DA$ | 0191 |
| &H70DE | string descriptor | S_70DE$ | 0136 |
| &H70E2 | string descriptor | S_70E2$ | 013F |
| &H70FE | string descriptor | S_70FE$ | MODULE_CONSTANTS literal 'P'; 0136 |
| &H7104 | string descriptor | S_7104$ | MODULE_CONSTANTS literal 'C'; 013F |
| &H710A | MBF single | N_710A! | 0145; 05AD; 0B92; 0F4F; 12B0 … |
| &H710A | MBF single constant | N_710A! | MODULE_CONSTANTS = 3 |
| &H710E | MBF single | N_710E! | 0153; 0163; 017E; 0186; 01F9 … |
| &H7112 | MBF single | N_7112! | 0163 |
| &H7112 | MBF single constant | N_7112! | MODULE_CONSTANTS = 46 |
| &H7116 | MBF single | N_7116! | 0186; 02F3; 0536; 0E14; 126A … |
| &H7116 | MBF single constant | N_7116! | MODULE_CONSTANTS = 8 |
| &H711A | string descriptor | S_711A$ | MODULE_CONSTANTS literal 'SH'; 0191 |
| &H7120 | string descriptor | S_7120$ | 019A |
| &H7124 | string descriptor | S_7124$ | 01A3 |
| &H7128 | string descriptor | S_7128$ | 01AC |
| &H712C | string descriptor | S_712C$ | MODULE_CONSTANTS literal 'Marine'; 019A |
| &H7136 | string descriptor | S_7136$ | MODULE_CONSTANTS literal 'Pilot'; 01A3 |
| &H7140 | string descriptor | S_7140$ | MODULE_CONSTANTS literal 'Soldier'; 01AC |
| &H714C | string descriptor | S_714C$ | MODULE_CONSTANTS literal 'LOGO'; 01C6 |
| &H7154 | string descriptor | S_7154$ | MODULE_CONSTANTS literal 'NAME'; 01D6 |
| &H715C | string descriptor | S_715C$ | 15C7; 15D7; 16CB; 16E3; 185D … |
| &H7160 | MBF single | N_7160! | 0207 |
| &H7160 | MBF single constant | N_7160! | MODULE_CONSTANTS = 52 |
| &H7164 | MBF single | N_7164! | 028B; 18F1; 4599; 4685 |
| &H7164 | MBF single constant | N_7164! | MODULE_CONSTANTS = 24 |
| &H7168 | string descriptor | S_7168$ | MODULE_CONSTANTS literal 'CHARNAME'; 02A3 |
| &H7174 | MBF single | N_7174! | 030D; 176D; 1791; 17EA; 1CED … |
| &H7178 | MBF single | N_7178! | 0307; 1777; 179A; 17F3; 1CF8 … |
| &H717C | MBF single | N_717C! | 0307; 0339; 0622; 0887; 0BC9 … |
| &H717C | MBF single constant | N_717C! | MODULE_CONSTANTS = 100 |
| &H7180 | MBF single | N_7180! | 0313 |
| &H7180 | MBF single constant | N_7180! | MODULE_CONSTANTS = 1300 |
| &H7184 | MBF single | N_7184! | 0326; 08FE; 71CA |
| &H7184 | MBF single constant | N_7184! | MODULE_CONSTANTS = 0.1 |
| &H7188 | MBF single | N_7188! | 033F; 04F0; 05D0; 05FA; 062B … |
| &H718C | MBF single | N_718C! | 0339; 04F9; 05DB; 0603; 0634 … |
| &H7190 | MBF single | N_7190! | 0345 |
| &H7190 | MBF single constant | N_7190! | MODULE_CONSTANTS = 1300.5 |
| &H7198 | MBF single | N_7198! | 0358; 142A; 1454 |
| &H7198 | MBF single constant | N_7198! | MODULE_CONSTANTS = 30000 |
| &H719C | MBF single | N_719C! | 0364; 0414; 0560; 0938; 0990 … |
| &H719C | MBF single constant | N_719C! | MODULE_CONSTANTS = 0.5 |
| &H71A0 | string descriptor | S_71A0$ | MODULE_CONSTANTS literal 'Change things? '; 038E |
| &H71B4 | MBF single | N_71B4! | 039A; 2008; 2036; 205A; 20D0 … |
| &H71B8 | MBF single | N_71B8! | 03EA; 6785 |
| &H71B8 | MBF single constant | N_71B8! | MODULE_CONSTANTS = 22 |
| &H71BC | MBF single | N_71BC! | 03F2; 70C9 |
| &H71BC | MBF single constant | N_71BC! | MODULE_CONSTANTS = 690 |
| &H71C0 | MBF single | N_71C0! | 03FF; 0437; 04D0; 04D8; 149F … |
| &H71C4 | MBF single | N_71C4! | 044E; 163E; 37C3; 4013 |
| &H71C4 | MBF single constant | N_71C4! | MODULE_CONSTANTS = 99 |
| &H71C8 | MBF single | N_71C8! | 046D |
| &H71C8 | MBF single constant | N_71C8! | MODULE_CONSTANTS = 9 |
| &H71CC | MBF single | N_71CC! | 0475; 08D3; 0B2A; 12C9; 1A91 … |
| &H71CC | MBF single constant | N_71CC! | MODULE_CONSTANTS = 4 |
| &H71D0 | MBF single | N_71D0! | 048A; 1D88; 3392; 4966 |
| &H71D0 | MBF single constant | N_71D0! | MODULE_CONSTANTS = 40 |
| &H71D4 | MBF single | N_71D4! | 0492; 0C44; 0E78; 0EC4; 0F0D … |
| &H71D4 | MBF single constant | N_71D4! | MODULE_CONSTANTS = 5 |
| &H71D8 | MBF single | N_71D8! | 04AD; 0619; 064A; 11D0; 11D6 … |
| &H71D8 | MBF single constant | N_71D8! | MODULE_CONSTANTS = 6 |
| &H71DC | MBF single | N_71DC! | 04D8; 7121 |
| &H71DC | MBF single constant | N_71DC! | MODULE_CONSTANTS = 725 |
| &H71E0 | MBF single | N_71E0! | 0514 |
| &H71E0 | MBF single constant | N_71E0! | MODULE_CONSTANTS = 70 |
| &H71E4 | MBF single | N_71E4! | 051A; 05BF; 0C6E; 255C; 5C8D |
| &H71E4 | MBF single constant | N_71E4! | MODULE_CONSTANTS = 20 |
| &H71E8 | MBF single | N_71E8! | 053E; 1527; 5487; 7069 |
| &H71E8 | MBF single constant | N_71E8! | MODULE_CONSTANTS = 340 |
| &H71EC | MBF single | N_71EC! | 0591; 156F; 54BA; 5512; 70C1 |
| &H71EC | MBF single constant | N_71EC! | MODULE_CONSTANTS = 369 |
| &H71F0 | MBF single | N_71F0! | 05B6; 133E; 2135; 236C; 3661 … |
| &H71F0 | MBF single constant | N_71F0! | MODULE_CONSTANTS = 50 |
| &H71F4 | MBF single | N_71F4! | 05D0; 176D; 1791; 17EA; 1CED … |
| &H71F4 | MBF single constant | N_71F4! | MODULE_CONSTANTS = 31 |
| &H71F8 | MBF single | N_71F8! | 05FA; 2116; 454F; 4EB8; 6B1A … |
| &H71F8 | MBF single constant | N_71F8! | MODULE_CONSTANTS = 23 |
| &H71FC | MBF single | N_71FC! | 062B; 2FC2 |
| &H71FC | MBF single constant | N_71FC! | MODULE_CONSTANTS = 26 |
| &H7200 | MBF single | N_7200! | 0680; 55A2; 6133 |
| &H7200 | MBF single constant | N_7200! | MODULE_CONSTANTS = 18 |
| &H7204 | MBF single | N_7204! | 0689 |
| &H7204 | MBF single constant | N_7204! | MODULE_CONSTANTS = 777 |
| &H7208 | MBF single | N_7208! | 0692 |
| &H7208 | MBF single constant | N_7208! | MODULE_CONSTANTS = -999 |
| &H886E | string descriptor | S_886E$ | MODULE_CONSTANTS literal 'SPBTSH.BAS'; 06CF |
| &H89D4 | MBF single | N_89D4! | 0C6E; 0DF7; 3ACB; 3CD8; 3E4A … |
| &H89EC | MBF single | N_89EC! | 0C77; 0E28; 3AE2; 3CE9; 3E2B … |
| &H8A04 | MBF single | N_8A04! | 51F1 |
| &H8B18 | string descriptor | S_8B18$ | MODULE_CONSTANTS literal 'ENCLIST'; 06E5 |
| &H8B24 | MBF single | N_8B24! | 06F8; 073E |
| &H8B28 | string descriptor | S_8B28$ | 0764; 2CB6; 3E92; 59AD; 5D01 |
| &H8B2C | MBF single | N_8B2C! | 075E; 0895; 094E; 0AD2; 2623 … |
| &H8B30 | MBF single | N_8B30! | 0887; 08DE; 097A; 0A3E; 0B6A |
| &H8B34 | MBF single | N_8B34! | 0790 |
| &H8B38 | string descriptor | S_8B38$ | MODULE_CONSTANTS literal '(s)'; 076A |
| &H8B40 | string descriptor | S_8B40$ | MODULE_CONSTANTS literal 'ENCTABLE'; 077D |
| &H8B4C | MBF single | N_8B4C! | 0790; 0873 |
| &H8B50 | MBF single | N_8B50! | 098A |
| &H8B54 | MBF single | N_8B54! | 08EC |
| &H8B58 | MBF single | N_8B58! | 0B36 |
| &H8B5C | MBF single | N_8B5C! | 0A08 |
| &H8B64 | MBF single | N_8B64! | 0A48; 5D24 |
| &H8B68 | MBF single | N_8B68! | 0B78 |
| &H8B6C | MBF single | N_8B6C! | 33FD |
| &H8B70 | MBF single | N_8B70! | 2382 |
| &H8B74 | MBF single | N_8B74! | 214B; 2460; 2480; 2BD9 |
| &H8B78 | MBF single | N_8B78! | 39D0 |
| &H8B80 | MBF single | N_8B80! | 2F3C; 73AF |
| &H8B84 | MBF single | N_8B84! | 0930; 1006; 2890; 2E2D; 68B3 |
| &H8B88 | MBF single | N_8B88! | 2E12 |
| &H8B8C | MBF single | N_8B8C! | 0895; 239F; 67C7; 6A3F |
| &H8B90 | MBF single | N_8B90! | 5246 |
| &H8B94 | MBF single | N_8B94! | 0A68; 5D36 |
| &H8B98 | MBF single | N_8B98! | 0AA1 |
| &H8B9C | MBF single | N_8B9C! | 08F4; 0C24; 5318 |
| &H8BA0 | MBF single | N_8BA0! | 090F; 0916; 530B |
| &H8BA4 | MBF single | N_8BA4! | 091C; 0C1E; 52FC |
| &H8BA8 | MBF single | N_8BA8! | 08DE; 097A; 0B6A; 107B; 10A6 … |
| &H8BA8 | MBF single constant | N_8BA8! | MODULE_CONSTANTS = 0.2 |
| &H8BAC | MBF single | N_8BAC! | 08E6; 0A9B; 5F7B; 600C; 6CD1 … |
| &H8BAC | MBF single constant | N_8BAC! | MODULE_CONSTANTS = 0.7 |
| &H8BB0 | MBF single | N_8BB0! | 0904 |
| &H8BB0 | MBF single constant | N_8BB0! | MODULE_CONSTANTS = 1.3 |
| &H8BB4 | MBF single | N_8BB4! | 0924 |
| &H8BB4 | MBF single constant | N_8BB4! | MODULE_CONSTANTS = 0.37 |
| &H8BB8 | MBF single | N_8BB8! | 0954; 0C60 |
| &H8BBC | MBF single | N_8BBC! | 095A; 262F; 2946; 2B82; 2C7B … |
| &H8BBC | MBF single constant | N_8BBC! | MODULE_CONSTANTS = 0 |
| &H8BC0 | MBF single | N_8BC0! | 09F6; 6CEB |
| &H8BC0 | MBF single constant | N_8BC0! | MODULE_CONSTANTS = 0.4 |
| &H8BC4 | MBF single | N_8BC4! | 09FC; 0A5D; 49A7; 5FB7; 6C9E … |
| &H8BC4 | MBF single constant | N_8BC4! | MODULE_CONSTANTS = 0.6 |
| &H8BC8 | MBF single | N_8BC8! | 1051; 62DC; 6C08; 7345 |
| &H8BC8 | MBF single constant | N_8BC8! | MODULE_CONSTANTS = 0.3 |
| &H8BCC | MBF single | N_8BCC! | 0AD2 |
| &H8BCC | MBF single constant | N_8BCC! | MODULE_CONSTANTS = -0.9999 |
| &H8BD0 | MBF single | N_8BD0! | 0ADD |
| &H8BD0 | MBF single constant | N_8BD0! | MODULE_CONSTANTS = 13.1 |
| &H8BD4 | MBF single | N_8BD4! | 0AE3; 1506; 4D59; 6DF3; 739F |
| &H8BD4 | MBF single constant | N_8BD4! | MODULE_CONSTANTS = 14 |
| &H8BD8 | MBF single | N_8BD8! | 0B06; 0C77; 0F22; 14CC; 1754 … |
| &H8BD8 | MBF single constant | N_8BD8! | MODULE_CONSTANTS = 10 |
| &H8BDC | MBF single | N_8BDC! | 0B49; 0B8A; 0B92; 0BB2; 0C36 … |
| &H8BE0 | string descriptor | S_8BE0$ | MODULE_CONSTANTS literal 'ENSHP'; 0C86 |
| &H8BEA | string descriptor | S_8BEA$ | MODULE_CONSTANTS literal '.BAS'; 0CA5 |
| &H8BF2 | MBF single | N_8BF2! | 0CB7; 1125; 11AA; 377A; 3816 … |
| &H8BF6 | MBF single | N_8BF6! | 0CB7 |
| &H8BF6 | MBF single constant | N_8BF6! | MODULE_CONSTANTS = 0.125 |
| &H8BFA | MBF single | N_8BFA! | 0CD4; 0F0D; 3A8C; 3B8F; 5600 |
| &H8BFE | MBF single | N_8BFE! | 0CEA; 0F16; 3A95; 3B97; 5609 |
| &H8C02 | MBF single | N_8C02! | 0D43; 0EC4; 3464; 5D6B |
| &H8C06 | MBF single | N_8C06! | 0D2D; 0ECF; 346D; 5D74 |
| &H8C0A | MBF single | N_8C0A! | 0D71; 3526; 526B; 573B; 5DA4 |
| &H8C0A | MBF single constant | N_8C0A! | MODULE_CONSTANTS = 90 |
| &H8C0E | MBF single | N_8C0E! | 0D96; 1360 |
| &H8C0E | MBF single constant | N_8C0E! | MODULE_CONSTANTS = 1e-07 |
| &H8C12 | MBF single | N_8C12! | 0DA6 |
| &H8C12 | MBF single constant | N_8C12! | MODULE_CONSTANTS = 57.296 |
| &H8C1A | MBF single | N_8C1A! | 0DCE |
| &H8C22 | MBF single | N_8C22! | 0DDC |
| &H8C2A | MBF single | N_8C2A! | 0DC3 |
| &H8C32 | MBF single | N_8C32! | 0DD4 |
| &H8C3E | MBF single | N_8C3E! | 0DE5; 0F61; 48E1; 5A92 |
| &H8C5A | MBF single | N_8C5A! | 0E87; 0EF2; 5D95 |
| &H8C5E | MBF single | N_8C5E! | 0E87; 5D9E |
| &H8C5E | MBF single constant | N_8C5E! | MODULE_CONSTANTS = 180 |
| &H8C62 | MBF single | N_8C62! | 0E8F; 3500 |
| &H8C62 | MBF single constant | N_8C62! | MODULE_CONSTANTS = 360 |
| &H8C66 | MBF single | N_8C66! | 0EAF; 4B08; 4BD6; 4F3F |
| &H8C6A | MBF single | N_8C6A! | 0ECF; 0F16; 4B11; 4BF2; 4F47 |
| &H8C6E | MBF single | N_8C6E! | 34E4; 3520 |
| &H8C6E | MBF single constant | N_8C6E! | MODULE_CONSTANTS = 45 |
| &H8C72 | MBF single | N_8C72! | 0EFE |
| &H8C72 | MBF single constant | N_8C72! | MODULE_CONSTANTS = 60.5 |
| &H8CD6 | MBF single | N_8CD6! | 0FF3; 1039; 105F; 108A |
| &H8CDA | MBF single | N_8CDA! | 1039; 105F; 108A; 10D1 |
| &H8CDE | MBF single | N_8CDE! | 1042 |
| &H8CDE | MBF single constant | N_8CDE! | MODULE_CONSTANTS = 77 |
| &H8CE2 | MBF single | N_8CE2! | 106C |
| &H8CE2 | MBF single constant | N_8CE2! | MODULE_CONSTANTS = 148 |
| &H8CE6 | MBF single | N_8CE6! | 1097 |
| &H8CE6 | MBF single constant | N_8CE6! | MODULE_CONSTANTS = 199 |
| &H8CEA | MBF single | N_8CEA! | 6311; 635B |
| &H8CEE | MBF single | N_8CEE! | 10B9; 631E; 6364 |
| &H8CF2 | MBF single | N_8CF2! | 113B |
| &H8CF2 | MBF single constant | N_8CF2! | MODULE_CONSTANTS = -11 |
| &H8CF6 | MBF single | N_8CF6! | 1149 |
| &H8CF6 | MBF single constant | N_8CF6! | MODULE_CONSTANTS = -85 |
| &H8CFA | MBF single | N_8CFA! | 6330; 638C |
| &H8CFE | MBF single | N_8CFE! | 1153; 633B; 6395 |
| &H8D02 | MBF single | N_8D02! | 11C6; 4230; 4369 |
| &H8D02 | MBF single constant | N_8D02! | MODULE_CONSTANTS = -16 |
| &H9D46 | MBF single | N_9D46! | 11D0; 16A5; 16AB; 16B3; 5A1C … |
| &H9D4A | MBF single | N_9D4A! | 11D6 |
| &H9E8E | MBF single | N_9E8E! | 136A; 239F; 23C7; 6242 |
| &H9E92 | MBF single | N_9E92! | 12D9; 2A20; 5FF4 |
| &H9E92 | MBF single constant | N_9E92! | MODULE_CONSTANTS = 25 |
| &H9E96 | MBF single constant | N_9E96! | MODULE_CONSTANTS = 0.9 |
| &H9E9A | MBF single | N_9E9A! | 1373; 209F; 217C; 218B |
| &H9E9E | MBF single | N_9E9E! | 137C; 2454; 2C07; 5A63; 5B7E |
| &H9EA2 | MBF single | N_9EA2! | 1382; 2F1F; 3F1D |
| &H9EA6 | MBF single | N_9EA6! | 139D; 13BC; 13C2; 13CA; 15F6 … |
| &H9EAA | MBF single | N_9EAA! | 1394; 1AE6; 1CD4; 30BC; 30E2 … |
| &H9EAA | MBF single constant | N_9EAA! | MODULE_CONSTANTS = 37 |
| &H9EAE | MBF single | N_9EAE! | 13B3; 516A |
| &H9EAE | MBF single constant | N_9EAE! | MODULE_CONSTANTS = 0 |
| &H9EB2 | MBF single | N_9EB2! | 13E1; 1402 |
| &H9EB6 | MBF single | N_9EB6! | 13DB |
| &H9EB6 | MBF single constant | N_9EB6! | MODULE_CONSTANTS = 1.2 |
| &H9EBA | MBF single | N_9EBA! | 13F4; 13FA; 1402; 158D; 1599 … |
| &H9EBE | string descriptor | S_9EBE$ | MODULE_CONSTANTS literal 'Select Option'; 141A |
| &H9ED0 | MBF single | N_9ED0! | 1436; 1454; 27F9; 284D; 28A7 … |
| &H9ED4 | MBF single | N_9ED4! | 1441 |
| &H9ED4 | MBF single constant | N_9ED4! | MODULE_CONSTANTS = 1e+07 |
| &H9ED8 | string descriptor | S_9ED8$ | MODULE_CONSTANTS literal '-- --'; 14F9 |
| &H9EE2 | MBF single | N_9EE2! | 14B4; 14BC; 1506; 1545 |
| &H9EE6 | MBF single | N_9EE6! | 147B; 1CC8; 40D7; 649E |
| &H9EE6 | MBF single constant | N_9EE6! | MODULE_CONSTANTS = 12 |
| &H9EEA | MBF single | N_9EEA! | 1499 |
| &H9EEA | MBF single constant | N_9EEA! | MODULE_CONSTANTS = 683 |
| &H9EEE | MBF single | N_9EEE! | 1521; 1554; 159F; 25CF; 27E7 … |
| &H9EF2 | MBF single | N_9EF2! | 1535; 1567; 156F; 1910; 1937 … |
| &H9EF6 | string descriptor | S_9EF6$ | MODULE_CONSTANTS literal '## ##'; 1593 |
| &H9F00 | string descriptor | S_9F00$ | 15BB; 2F93; 3F48; 3F68 |
| &H9F04 | MBF single | N_9F04! | 15E8; 1E9B; 2992; 41D3; 57C5 |
| &H9F04 | MBF single constant | N_9F04! | MODULE_CONSTANTS = 13 |
| &H9F08 | MBF single | N_9F08! | 15F6 |
| &H9F08 | MBF single constant | N_9F08! | MODULE_CONSTANTS = 0 |
| &H9F0C | MBF single | N_9F0C! | 1602 |
| &H9F0C | MBF single constant | N_9F0C! | MODULE_CONSTANTS = 80 |
| &H9F10 | MBF single | N_9F10! | 160E |
| &H9F10 | MBF single constant | N_9F10! | MODULE_CONSTANTS = 112 |
| &H9F14 | MBF single | N_9F14! | 1632; 5DEA |
| &H9F14 | MBF single constant | N_9F14! | MODULE_CONSTANTS = 67 |
| &H9F18 | MBF single | N_9F18! | 1662; 1EF9 |
| &H9F18 | MBF single constant | N_9F18! | MODULE_CONSTANTS = 48 |
| &H9F1C | MBF single | N_9F1C! | 166E |
| &H9F1C | MBF single constant | N_9F1C! | MODULE_CONSTANTS = 55 |
| &H9F20 | MBF single | N_9F20! | 1683 |
| &H9F20 | MBF single constant | N_9F20! | MODULE_CONSTANTS = -46 |
| &H9F24 | string descriptor | S_9F24$ | MODULE_CONSTANTS literal 'Press ENTER Key'; 16BF |
| &H9F38 | MBF single | N_9F38! | 16F7 |
| &H9F38 | MBF single constant | N_9F38! | MODULE_CONSTANTS = 999 |
| &H9F3C | string descriptor | S_9F3C$ | MODULE_CONSTANTS literal '###'; 1713 |
| &H9F44 | string descriptor | S_9F44$ | MODULE_CONSTANTS literal '####'; 172F |
| &H9F4C | MBF single | N_9F4C! | 1742; 180E; 57B6; 599F; 5FA5 … |
| &H9F50 | MBF single | N_9F50! | 1754; 179A; 17BA; 17F3; 181A … |
| &H9F54 | MBF single | N_9F54! | 1876; 187E; 1897; 1C72; 1C7A … |
| &H9F58 | MBF single | N_9F58! | 187E |
| &H9F58 | MBF single constant | N_9F58! | MODULE_CONSTANTS = 95 |
| &H9F5C | MBF single | N_9F5C! | 1889; 18A4; 1CBA; 4EC4 |
| &H9F5C | MBF single constant | N_9F5C! | MODULE_CONSTANTS = -32 |
| &H9F60 | MBF single | N_9F60! | 18BE; 226F; 2340; 4EAF |
| &H9F64 | MBF single | N_9F64! | 18CA; 2278; 2349; 4EB8 |
| &H9F68 | MBF single | N_9F68! | 1897 |
| &H9F68 | MBF single constant | N_9F68! | MODULE_CONSTANTS = -64 |
| &H9F6C | MBF single | N_9F6C! | 18B0; 4ECF |
| &H9F6C | MBF single constant | N_9F6C! | MODULE_CONSTANTS = -51 |
| &H9F70 | MBF single | N_9F70! | 18E8; 4224; 435C; 4588; 4677 … |
| &H9F74 | MBF single | N_9F74! | 18F1; 4236; 436F; 459F; 468B … |
| &H9F78 | MBF single | N_9F78! | 18FA; 1910; 1A54 |
| &H9F7C | MBF single | N_9F7C! | 18E8 |
| &H9F7C | MBF single constant | N_9F7C! | MODULE_CONSTANTS = 264 |
| &H9F80 | MBF single | N_9F80! | 1929; 616B |
| &H9F80 | MBF single constant | N_9F80! | MODULE_CONSTANTS = -8 |
| &H9F84 | MBF single | N_9F84! | 19F3; 1A37; 1A3C; 1ACD; 1AE6 … |
| &H9F88 | MBF single | N_9F88! | 19FC; 1A60; 1A68; 1A9A; 1B09 |
| &H9F8C | MBF single | N_9F8C! | 1A07; 1A6E; 1AB2; 1B0F; 26C1 … |
| &H9F90 | MBF single | N_9F90! | 1A0F; 1A77; 1B1E |
| &H9F94 | MBF single | N_9F94! | 1A07 |
| &H9F94 | MBF single constant | N_9F94! | MODULE_CONSTANTS = 6.28 |
| &H9F98 | MBF single | N_9F98! | 1A24; 1A47; 1A83; 1A89; 1A91 … |
| &H9F9C | MBF single | N_9F9C! | 1A4E |
| &H9F9C | MBF single constant | N_9F9C! | MODULE_CONSTANTS = 3.2 |
| &H9FA0 | MBF single | N_9FA0! | 1A5A |
| &H9FA0 | MBF single constant | N_9FA0! | MODULE_CONSTANTS = 0.7854 |
| &H9FA4 | MBF single | N_9FA4! | 1A68 |
| &H9FA4 | MBF single constant | N_9FA4! | MODULE_CONSTANTS = 1.2566 |
| &H9FA8 | MBF single | N_9FA8! | 1AA5; 1ABD |
| &H9FA8 | MBF single constant | N_9FA8! | MODULE_CONSTANTS = 6.28319 |
| &H9FAC | MBF single | N_9FAC! | 1AD3; 1B5F |
| &H9FB0 | MBF single | N_9FB0! | 1ACD |
| &H9FB0 | MBF single constant | N_9FB0! | MODULE_CONSTANTS = 277 |
| &H9FB4 | MBF single | N_9FB4! | 1AD9 |
| &H9FB4 | MBF single constant | N_9FB4! | MODULE_CONSTANTS = 275 |
| &H9FB8 | MBF single | N_9FB8! | 1AEC; 1B46 |
| &H9FBC | MBF single | N_9FBC! | 1AF2; 29F0; 2FDE |
| &H9FBC | MBF single constant | N_9FBC! | MODULE_CONSTANTS = 35 |
| &H9FC0 | MBF single | N_9FC0! | 1B2F |
| &H9FC0 | MBF single constant | N_9FC0! | MODULE_CONSTANTS = 25.5 |
| &H9FC4 | MBF single | N_9FC4! | 1C86; 6118 |
| &H9FC4 | MBF single constant | N_9FC4! | MODULE_CONSTANTS = 11 |
| &H9FC8 | MBF single | N_9FC8! | 1CAF |
| &H9FC8 | MBF single constant | N_9FC8! | MODULE_CONSTANTS = 43 |
| &H9FCC | MBF single | N_9FCC! | 1D3C; 29C0; 4203; 51FA; 6032 … |
| &H9FCC | MBF single constant | N_9FCC! | MODULE_CONSTANTS = 17 |
| &H9FD0 | string descriptor | S_9FD0$ | MODULE_CONSTANTS literal 'Pilot or ship not ready'; 1D76 |
| &H9FEC | MBF single | N_9FEC! | 1E19; 1EEA; 1F49; 2042 |
| &H9FF0 | MBF single | N_9FF0! | 1E27; 1E4B |
| &H9FF4 | MBF single | N_9FF4! | 1E33; 1E42 |
| &H9FF8 | string descriptor | S_9FF8$ | MODULE_CONSTANTS literal ' '; 1E6E; 2CB0; 4B40 |
| &H9FFE | string descriptor | S_9FFE$ | 1E7A; 1E8A; 1F57 |
| &HA002 | MBF single | N_A002! | 1F05; 6DCB |
| &HA002 | MBF single constant | N_A002! | MODULE_CONSTANTS = 57 |
| &HA006 | MBF single | N_A006! | 1F1F; 452D |
| &HA006 | MBF single constant | N_A006! | MODULE_CONSTANTS = 32 |
| &HA00A | MBF single | N_A00A! | 1F2B |
| &HA00A | MBF single constant | N_A00A! | MODULE_CONSTANTS = 126 |
| &HA010 | MBF single | N_A010! | 1F77; 1FB1; 2AAD; 2ADE; 2B02 … |
| &HA014 | MBF single | N_A014! | 1F77; 205A; 3380; 3386; 677C … |
| &HA014 | MBF single constant | N_A014! | MODULE_CONSTANTS = 0 |
| &HA018 | MBF single | N_A018! | 1F7D |
| &HA018 | MBF single constant | N_A018! | MODULE_CONSTANTS = 2300 |
| &HA01C | MBF single | N_A01C! | 1F9B |
| &HA020 | MBF single | N_A020! | 1FB9 |
| &HA020 | MBF single constant | N_A020! | MODULE_CONSTANTS = 2600 |
| &HA024 | MBF single | N_A024! | 1FD0 |
| &HA024 | MBF single constant | N_A024! | MODULE_CONSTANTS = 2597 |
| &HA028 | string descriptor | S_A028$ | MODULE_CONSTANTS literal 'y'; 1FE4 |
| &HA02E | string descriptor | S_A02E$ | MODULE_CONSTANTS literal 'Y'; 1FF0 |
| &HA034 | string descriptor | S_A034$ | MODULE_CONSTANTS literal 'n'; 2012 |
| &HA03A | string descriptor | S_A03A$ | MODULE_CONSTANTS literal 'N'; 201E |
| &HA040 | string descriptor | S_A040$ | MODULE_CONSTANTS literal '(yes/no) '; 204B |
| &HA04E | string descriptor | S_A04E$ | MODULE_CONSTANTS literal 'yes'; 2063 |
| &HA056 | string descriptor | S_A056$ | MODULE_CONSTANTS literal 'YES'; 206F |
| &HA05E | MBF single | N_A05E! | 2091; 2931; 2B42; 3DE1; 57A4 … |
| &HA062 | string descriptor | S_A062$ | MODULE_CONSTANTS literal 'Establish communications? (y/n)'; 20C4 |
| &HA086 | string descriptor | S_A086$ | MODULE_CONSTANTS literal 'Communications established'; 2171 |
| &HA0A4 | string descriptor | S_A0A4$ | MODULE_CONSTANTS literal ' fails'; 219A |
| &HA0AE | string descriptor | S_A0AE$ | MODULE_CONSTANTS literal 'Communications Phase'; 21BB |
| &HA0C6 | string descriptor | S_A0C6$ | MODULE_CONSTANTS literal 'A-Plead'; 21D7 |
| &HA0D2 | string descriptor | S_A0D2$ | MODULE_CONSTANTS literal 'B-Ask'; 21F0 |
| &HA0DC | string descriptor | S_A0DC$ | MODULE_CONSTANTS literal 'C-Demand'; 2206 |
| &HA0E8 | string descriptor | S_A0E8$ | MODULE_CONSTANTS literal 'D-Bargain/Bribe'; 221F |
| &HA0FC | string descriptor | S_A0FC$ | MODULE_CONSTANTS literal 'E-Impersonate Diety'; 2235 |
| &HA114 | string descriptor | S_A114$ | MODULE_CONSTANTS literal 'F-None'; 224B |
| &HA11E | string descriptor | S_A11E$ | MODULE_CONSTANTS literal 'Choose An Approach: (A-F)'; 2263 |
| &HA13C | MBF single | N_A13C! | 2292; 229A; 22A8; 2377; 2496 … |
| &HA140 | MBF single | N_A140! | 22B6; 2363; 25B7 |
| &HA144 | string descriptor | S_A144$ | MODULE_CONSTANTS literal 'A-Fuel'; 22D5 |
| &HA14E | string descriptor | S_A14E$ | MODULE_CONSTANTS literal 'B-Truce'; 22EE |
| &HA15A | string descriptor | S_A15A$ | MODULE_CONSTANTS literal 'C-Tribute'; 2307 |
| &HA168 | string descriptor | S_A168$ | MODULE_CONSTANTS literal 'D-Surrender'; 231D |
| &HA178 | string descriptor | S_A178$ | MODULE_CONSTANTS literal 'CHOOSE AN OBJECTIVE: (A-D)'; 2334 |
| &HA196 | MBF single | N_A196! | 236C; 24CC; 2527; 2540 |
| &HA19A | MBF single | N_A19A! | 23A7; 23AC; 23C7; 23D5; 24AE |
| &HA19E | MBF single | N_A19E! | 23E5 |
| &HA19E | MBF single constant | N_A19E! | MODULE_CONSTANTS = -0.5 |
| &HA1A2 | MBF single | N_A1A2! | 23F3; 52FC |
| &HA1A2 | MBF single constant | N_A1A2! | MODULE_CONSTANTS = -0.25 |
| &HA1A6 | MBF single | N_A1A6! | 2401 |
| &HA1A6 | MBF single constant | N_A1A6! | MODULE_CONSTANTS = -0.05 |
| &HA1AA | MBF single | N_A1AA! | 240F |
| &HA1AA | MBF single constant | N_A1AA! | MODULE_CONSTANTS = 0.05 |
| &HA1AE | MBF single | N_A1AE! | 241D |
| &HA1AE | MBF single constant | N_A1AE! | MODULE_CONSTANTS = 0.25 |
| &HA1B2 | MBF single | N_A1B2! | 24FE; 292B; 29D8; 49EC |
| &HA1B6 | MBF single | N_A1B6! | 2509; 385F |
| &HA1B6 | MBF single constant | N_A1B6! | MODULE_CONSTANTS = -99 |
| &HA1BA | MBF single | N_A1BA! | 2521 |
| &HA1BA | MBF single constant | N_A1BA! | MODULE_CONSTANTS = 400 |
| &HA1BE | MBF single | N_A1BE! | 2540; 3CD8 |
| &HA1BE | MBF single constant | N_A1BE! | MODULE_CONSTANTS = -20 |
| &HA1C2 | string descriptor | S_A1C2$ | MODULE_CONSTANTS literal 'They respectfully decline'; 257B |
| &HA1E0 | string descriptor | S_A1E0$ | MODULE_CONSTANTS literal 'They refuse your offer'; 258A |
| &HA1FA | string descriptor | S_A1FA$ | MODULE_CONSTANTS literal 'They are insulted by your offer'; 2599 |
| &HA21E | string descriptor | S_A21E$ | MODULE_CONSTANTS literal 'They laugh in your face'; 25A8 |
| &HA23A | string descriptor | S_A23A$ | MODULE_CONSTANTS literal 'They surrender most of their fuel'; 25D8 |
| &HA260 | string descriptor | S_A260$ | MODULE_CONSTANTS literal 'Fueling ISS '; 25F6 |
| &HA270 | MBF single | N_A270! | 261A; 2747 |
| &HA274 | MBF single | N_A274! | 2629; 267E |
| &HA278 | MBF single | N_A278! | 260E; 26B5 |
| &HA278 | MBF single constant | N_A278! | MODULE_CONSTANTS = 228 |
| &HA27C | MBF single | N_A27C! | 2614; 26BB |
| &HA27C | MBF single constant | N_A27C! | MODULE_CONSTANTS = 42 |
| &HA280 | MBF single | N_A280! | 264B; 2B33; 3BBA |
| &HA280 | MBF single constant | N_A280! | MODULE_CONSTANTS = 2.5 |
| &HA284 | MBF single | N_A284! | 265C |
| &HA284 | MBF single constant | N_A284! | MODULE_CONSTANTS = 0.75 |
| &HA288 | MBF single | N_A288! | 273F; 27B3 |
| &HA28C | string descriptor | S_A28C$ | MODULE_CONSTANTS literal 'They agree to a truce'; 27DB |
| &HA2A6 | MBF single | N_A2A6! | 2808; 2823; 2847 |
| &HA2AA | string descriptor | S_A2AA$ | MODULE_CONSTANTS literal 'They accept'; 281D |
| &HA2BA | string descriptor | S_A2BA$ | MODULE_CONSTANTS literal 'credits'; 2829 |
| &HA2C6 | string descriptor | S_A2C6$ | MODULE_CONSTANTS literal 'as payment for a truce'; 283E |
| &HA2E0 | string descriptor | S_A2E0$ | MODULE_CONSTANTS literal 'They pay'; 28DA |
| &HA2EC | string descriptor | S_A2EC$ | MODULE_CONSTANTS literal 'credits'; 28E6 |
| &HA2F8 | string descriptor | S_A2F8$ | MODULE_CONSTANTS literal 'They surrender all valuables'; 28FB |
| &HA318 | MBF single | N_A318! | 2940; 2B5E |
| &HA31C | MBF single | N_A31C! | 299E; 41DF |
| &HA31C | MBF single constant | N_A31C! | MODULE_CONSTANTS = 28 |
| &HA320 | MBF single | N_A320! | 2A12 |
| &HA320 | MBF single constant | N_A320! | MODULE_CONSTANTS = -5 |
| &HA324 | MBF single | N_A324! | 2A45; 2A4A |
| &HA324 | MBF single constant | N_A324! | MODULE_CONSTANTS = 9999 |
| &HA328 | MBF single | N_A328! | 2B7C; 2BCD |
| &HA32C | string descriptor | S_A32C$ | MODULE_CONSTANTS literal 'Battle Over'; 2C25 |
| &HA33C | string descriptor | S_A33C$ | MODULE_CONSTANTS literal 'BATTLE REPORT'; 2C5A |
| &HA34E | MBF single | N_A34E! | 2C75; 2E6A |
| &HA352 | string descriptor | S_A352$ | MODULE_CONSTANTS literal 'Survived'; 2CE2 |
| &HA35E | string descriptor | S_A35E$ | MODULE_CONSTANTS literal '#'; 2C94 |
| &HA364 | MBF single | N_A364! | 2C9D |
| &HA364 | MBF single constant | N_A364! | MODULE_CONSTANTS = 49 |
| &HA368 | string descriptor | S_A368$ | MODULE_CONSTANTS literal ' - '; 2CBC |
| &HA370 | string descriptor | S_A370$ | MODULE_CONSTANTS literal 'Docked'; 2D0C |
| &HA37A | string descriptor | S_A37A$ | MODULE_CONSTANTS literal 'Surrendered'; 2D3C |
| &HA38A | string descriptor | S_A38A$ | MODULE_CONSTANTS literal 'Destroyed'; 2D4B |
| &HA398 | MBF single constant | N_A398! | MODULE_CONSTANTS = 48.5 |
| &HA39C | MBF single | N_A39C! | 2D89; 2DAF; 2DD5 |
| &HA39C | MBF single constant | N_A39C! | MODULE_CONSTANTS = 49.5 |
| &HA3A0 | MBF single | N_A3A0! | 2DFB |
| &HA3A0 | MBF single constant | N_A3A0! | MODULE_CONSTANTS = 210 |
| &HA3A4 | MBF single | N_A3A4! | 2E1A |
| &HA3A4 | MBF single constant | N_A3A4! | MODULE_CONSTANTS = 260 |
| &HA3A8 | MBF single | N_A3A8! | 2E87; 3CE9 |
| &HA3A8 | MBF single constant | N_A3A8! | MODULE_CONSTANTS = -10 |
| &HA3AC | MBF single | N_A3AC! | 2EB7; 2EEE |
| &HA3AC | MBF single constant | N_A3AC! | MODULE_CONSTANTS = -50 |
| &HA3B0 | MBF single | N_A3B0! | 2ED6; 2F0D |
| &HA3B0 | MBF single constant | N_A3B0! | MODULE_CONSTANTS = 0 |
| &HA3B4 | string descriptor | S_A3B4$ | MODULE_CONSTANTS literal 'SPACE.EXE'; 2F2D |
| &HA3C2 | string descriptor | S_A3C2$ | MODULE_CONSTANTS literal 'PLBATTLE.STR'; 2F45 |
| &HA3D2 | string descriptor | S_A3D2$ | MODULE_CONSTANTS literal 'Life Support is out!'; 2F62 |
| &HA3EA | string descriptor | S_A3EA$ | MODULE_CONSTANTS literal 'You have a few seconds left.'; 2F79 |
| &HA40A | string descriptor | S_A40A$ | MODULE_CONSTANTS literal 'Who will fix it?'; 2F93 |
| &HA41E | string descriptor | S_A41E$ | MODULE_CONSTANTS literal 'Life Support fixed at the'; 2FF0 |
| &HA43C | string descriptor | S_A43C$ | MODULE_CONSTANTS literal 'last second!'; 300A |
| &HA44C | string descriptor | S_A44C$ | MODULE_CONSTANTS literal ' struggles with the life'; 3045 |
| &HA468 | string descriptor | S_A468$ | MODULE_CONSTANTS literal 'support systems your air runs out.'; 305D |
| &HA48E | string descriptor | S_A48E$ | MODULE_CONSTANTS literal 'As '; 302E |
| &HA496 | string descriptor | S_A496$ | MODULE_CONSTANTS literal 'You Are All Dead'; 3078 |
| &HA4AA | MBF single | N_A4AA! | 3084; 308D |
| &HA4AE | MBF single | N_A4AE! | 3093; 61DF |
| &HA4AE | MBF single constant | N_A4AE! | MODULE_CONSTANTS = 15 |
| &HA4B2 | MBF single | N_A4B2! | 30A4; 321A; 33D0; 3C68; 3D7A … |
| &HA4B6 | MBF single | N_A4B6! | 30AA; 3214; 33D0; 38D3; 3D7A … |
| &HA4BA | MBF single | N_A4BA! | 30A4; 30AA; 61FE |
| &HA4BA | MBF single constant | N_A4BA! | MODULE_CONSTANTS = 0 |
| &HA4BE | MBF single | N_A4BE! | 3158; 31FD |
| &HA4C2 | MBF single | N_A4C2! | 319E; 31DC; 31E4; 52B0; 52D0 … |
| &HA4C6 | MBF single | N_A4C6! | 3220; 493C |
| &HA4CA | MBF single | N_A4CA! | 3229; 324C; 3258; 33FD; 3488 … |
| &HA4CE | string descriptor | S_A4CE$ | MODULE_CONSTANTS literal 'Movement Phase'; 3246 |
| &HA4E0 | string descriptor | S_A4E0$ | MODULE_CONSTANTS literal 'A-Rotate CCW'; 32B7 |
| &HA4F0 | string descriptor | S_A4F0$ | MODULE_CONSTANTS literal 'B-Rotate CW'; 32D0 |
| &HA500 | string descriptor | S_A500$ | MODULE_CONSTANTS literal 'C-Scan'; 32E6 |
| &HA50A | string descriptor | S_A50A$ | MODULE_CONSTANTS literal 'D-Visual'; 32FE |
| &HA516 | string descriptor | S_A516$ | MODULE_CONSTANTS literal 'E-Skip Move'; 332E |
| &HA526 | string descriptor | S_A526$ | MODULE_CONSTANTS literal 'F-Switch'; 3345 |
| &HA532 | string descriptor | S_A532$ | MODULE_CONSTANTS literal 'G-Time Delay'; 335C |
| &HA534 | MBF single | N_A534! | 741B |
| &HA542 | string descriptor | S_A542$ | MODULE_CONSTANTS literal 'H-Jump To Hyperspace'; 3374 |
| &HA55A | MBF single | N_A55A! | 3380; 3CDE; 3D35; 46E9; 4701 … |
| &HA55E | MBF single | N_A55E! | 3386; 3CEF; 3D48; 46DD; 46F5 … |
| &HA562 | MBF single | N_A562! | 33E2 |
| &HA562 | MBF single constant | N_A562! | MODULE_CONSTANTS = 16 |
| &HA566 | MBF single | N_A566! | 3452; 3CCA |
| &HA56A | MBF single | N_A56A! | 3476; 34EA |
| &HA56E | MBF single | N_A56E! | 347F; 36C8; 3733; 3798; 3834 … |
| &HA572 | MBF single | N_A572! | 347F; 3EFA; 5CB1; 5CBB; 66DE … |
| &HA572 | MBF single constant | N_A572! | MODULE_CONSTANTS = 0 |
| &HA576 | MBF single | N_A576! | 34D1; 36D9; 36E5 |
| &HA57A | MBF single | N_A57A! | 34E4; 354B; 3648; 3687; 36B8 … |
| &HA57E | MBF single | N_A57E! | 34F0; 34F5; 3520; 35AD |
| &HA582 | MBF single | N_A582! | 35AD; 6FF2 |
| &HA582 | MBF single constant | N_A582! | MODULE_CONSTANTS = 60 |
| &HA586 | MBF single | N_A586! | 36AF; 4A98; 4ADF; 4AE5; 4BC2 … |
| &HA586 | MBF single constant | N_A586! | MODULE_CONSTANTS = 0 |
| &HA58A | MBF single | N_A58A! | 3741; 37BB; 38DE |
| &HA58E | MBF single | N_A58E! | 3747; 3857; 38DE |
| &HA592 | MBF single | N_A592! | 3765; 37DA |
| &HA596 | MBF single | N_A596! | 37FA; 3881; 388F |
| &HA59A | MBF single | N_A59A! | 3803; 3868; 3874 |
| &HA59E | MBF single | N_A59E! | 37F2; 4541; 4B02; 4BCE; 4F39 … |
| &HA59E | MBF single constant | N_A59E! | MODULE_CONSTANTS = -3 |
| &HA5A2 | MBF single | N_A5A2! | 399B; 3C33; 3C58 |
| &HA5A6 | MBF single | N_A5A6! | 3992 |
| &HA5A6 | MBF single constant | N_A5A6! | MODULE_CONSTANTS = 1e+20 |
| &HA5AA | MBF single | N_A5AA! | 39EE; 3AA1 |
| &HA5AE | MBF single | N_A5AE! | 3A0D |
| &HA5B2 | MBF single | N_A5B2! | 3A1A; 3A61; 3C97 |
| &HA5B6 | MBF single | N_A5B6! | 3A26; 3A7A; 3CAE |
| &HA5BA | MBF single | N_A5BA! | 3A4D; 3AFE; 3B3A; 3BA6; 3C13 … |
| &HA5BE | MBF single | N_A5BE! | 3AD4 |
| &HA5C2 | MBF single | N_A5C2! | 3AEB; 3B2B |
| &HA5C6 | MBF single | N_A5C6! | 3B12; 3B4E |
| &HA5C6 | MBF single constant | N_A5C6! | MODULE_CONSTANTS = 1000 |
| &HA5CA | MBF single | N_A5CA! | 3B1D; 3B59 |
| &HA5CA | MBF single constant | N_A5CA! | MODULE_CONSTANTS = -6000 |
| &HA5CE | MBF single | N_A5CE! | 3B6D; 3C04 |
| &HA5D2 | MBF single | N_A5D2! | 3B80; 3BF6; 3BFC; 3C04 |
| &HA5D6 | MBF single | N_A5D6! | 3BA0; 3BBA |
| &HA5DA | MBF single | N_A5DA! | 3D14 |
| &HA5DA | MBF single constant | N_A5DA! | MODULE_CONSTANTS = 0 |
| &HA5DE | MBF single | N_A5DE! | 3D6B; 3D9B; 418C; 446F; 5176 |
| &HA5E2 | MBF single | N_A5E2! | 3DF5; 3F37 |
| &HA5E6 | string descriptor | S_A5E6$ | MODULE_CONSTANTS literal 'You have docked with'; 3E7B |
| &HA5FE | string descriptor | S_A5FE$ | MODULE_CONSTANTS literal 'Will you board? (Y/N)'; 3EAF |
| &HA618 | string descriptor | S_A618$ | MODULE_CONSTANTS literal '.'; 3E98; 5F3A |
| &HA61E | string descriptor | S_A61E$ | MODULE_CONSTANTS literal 'Who will change positions?'; 3F48 |
| &HA63C | string descriptor | S_A63C$ | MODULE_CONSTANTS literal 'Change with who?'; 3F68 |
| &HA650 | MBF single | N_A650! | 400A; 4048 |
| &HA654 | MBF single | N_A654! | 4027; 4087 |
| &HA658 | MBF single | N_A658! | 4030; 741B |
| &HA658 | MBF single constant | N_A658! | MODULE_CONSTANTS = 0 |
| &HA65C | MBF single | N_A65C! | 40C1; 417F |
| &HA660 | MBF single | N_A660! | 40C7 |
| &HA660 | MBF single constant | N_A660! | MODULE_CONSTANTS = 809 |
| &HA664 | MBF single | N_A664! | 40E5 |
| &HA664 | MBF single constant | N_A664! | MODULE_CONSTANTS = 1097 |
| &HA668 | MBF single | N_A668! | 40ED |
| &HA668 | MBF single constant | N_A668! | MODULE_CONSTANTS = 1102 |
| &HA66C | MBF single | N_A66C! | 410B |
| &HA66C | MBF single constant | N_A66C! | MODULE_CONSTANTS = 1399 |
| &HA670 | MBF single | N_A670! | 4113 |
| &HA670 | MBF single constant | N_A670! | MODULE_CONSTANTS = 2302 |
| &HA674 | MBF single | N_A674! | 4131 |
| &HA674 | MBF single constant | N_A674! | MODULE_CONSTANTS = 2599 |
| &HA678 | MBF single | N_A678! | 418C |
| &HA678 | MBF single constant | N_A678! | MODULE_CONSTANTS = 0 |
| &HA67C | MBF single | N_A67C! | 41B0; 4264; 4270 |
| &HA680 | MBF single | N_A680! | 421E; 4356 |
| &HA680 | MBF single constant | N_A680! | MODULE_CONSTANTS = -96 |
| &HA684 | MBF single | N_A684! | 44FE; 4637; 4643 |
| &HA688 | MBF single | N_A688! | 4582; 4671 |
| &HA688 | MBF single constant | N_A688! | MODULE_CONSTANTS = -23 |
| &HA68C | MBF single | N_A68C! | 4730; 473C; 47A3 |
| &HA690 | string descriptor | S_A690$ | MODULE_CONSTANTS literal 'Enemy Report'; 47DC |
| &HA6A0 | MBF single | N_A6A0! | 47EE; 491E |
| &HA6A4 | string descriptor | S_A6A4$ | MODULE_CONSTANTS literal 'Escaped'; 487E |
| &HA6B0 | MBF single | N_A6B0! | 481F; 63BC |
| &HA6B0 | MBF single constant | N_A6B0! | MODULE_CONSTANTS = 21 |
| &HA6B4 | MBF single | N_A6B4! | 4849; 4B2D; 4DE1 |
| &HA6B4 | MBF single constant | N_A6B4! | MODULE_CONSTANTS = 65 |
| &HA6B8 | string descriptor | S_A6B8$ | MODULE_CONSTANTS literal '-'; 4858 |
| &HA6BE | string descriptor | S_A6BE$ | MODULE_CONSTANTS literal 'Destroyed'; 48C3 |
| &HA6CC | string descriptor | S_A6CC$ | MODULE_CONSTANTS literal 'Surrendered'; 48D2 |
| &HA6DC | string descriptor | S_A6DC$ | MODULE_CONSTANTS literal 'In Range'; 48F5 |
| &HA6E8 | string descriptor | S_A6E8$ | MODULE_CONSTANTS literal 'Out Of Range'; 4904 |
| &HA6F8 | string descriptor | S_A6F8$ | MODULE_CONSTANTS literal 'Attempting jump to hyperspace...'; 4954 |
| &HA71C | MBF single | N_A71C! | 4966; 496E; 4978 |
| &HA720 | MBF single | N_A720! | 496E; 588B; 72C0 |
| &HA724 | string descriptor | S_A724$ | MODULE_CONSTANTS literal 'Failed'; 49BF |
| &HA72E | string descriptor | S_A72E$ | MODULE_CONSTANTS literal 'Sucessfull'; 49D1 |
| &HA73C | MBF single | N_A73C! | 4A79; 50B4; 562B; 5662; 5699 |
| &HA73C | MBF single constant | N_A73C! | MODULE_CONSTANTS = 56 |
| &HA740 | string descriptor | S_A740$ | MODULE_CONSTANTS literal 'Ships In Range: '; 4AD3 |
| &HA754 | MBF single | N_A754! | 4ADF; 4BC2; 4CB3; 4CBB; 4CF8 … |
| &HA758 | MBF single | N_A758! | 4AEE; 4B5C; 4B68 |
| &HA75C | string descriptor | S_A75C$ | MODULE_CONSTANTS literal 'None'; 4B96 |
| &HA764 | MBF single | N_A764! | 4BA8; 53F1 |
| &HA764 | MBF single constant | N_A764! | MODULE_CONSTANTS = 669 |
| &HA768 | MBF single | N_A768! | 4BDF; 4C06; 4C71; 5084; 50FC … |
| &HA768 | MBF single constant | N_A768! | MODULE_CONSTANTS = 38 |
| &HA76C | string descriptor | S_A76C$ | MODULE_CONSTANTS literal 'Command: '; 4D94 |
| &HA77A | string descriptor | S_A77A$ | MODULE_CONSTANTS literal ' at ship '; 4DD8 |
| &HA788 | string descriptor | S_A788$ | MODULE_CONSTANTS literal 'ENTER to accept   '; 4E25 |
| &HA79E | string descriptor | S_A79E$ | MODULE_CONSTANTS literal ' to retarget'; 4E7C |
| &HA7AE | string descriptor | S_A7AE$ | MODULE_CONSTANTS literal 'A-'; 4E65 |
| &HA7B4 | MBF single | N_A7B4! | 4E6D |
| &HA7B4 | MBF single constant | N_A7B4! | MODULE_CONSTANTS = 64 |
| &HA7B8 | string descriptor | S_A7B8$ | MODULE_CONSTANTS literal 'W-Wait F-Fire R-Rapid L-Load M-Aim'; 4EA3 |
| &HA7DE | MBF single | N_A7DE! | 4F20; 4F6D; 4FAB |
| &HA7E2 | MBF single | N_A7E2! | 516A; 58FA; 5B3F |
| &HA7E6 | MBF single | N_A7E6! | 51C3; 5CD0; 6141 |
| &HA7EA | MBF single | N_A7EA! | 51E8; 5240 |
| &HA7EE | MBF single | N_A7EE! | 524C; 5255; 526B; 5E50 |
| &HA7F2 | MBF single | N_A7F2! | 5284; 52F1 |
| &HA7F6 | MBF single | N_A7F6! | 5302; 5B0D; 5B19 |
| &HA7FA | MBF single | N_A7FA! | 5318; 5375; 5B0D; 5B13; 5B31 … |
| &HA7FE | MBF single | N_A7FE! | 53F7; 53FC; 5471; 54C3; 5581 … |
| &HA802 | MBF single | N_A802! | 5481; 54A5; 5599; 5787; 57C5 |
| &HA806 | MBF single | N_A806! | 54B2 |
| &HA806 | MBF single constant | N_A806! | MODULE_CONSTANTS = 0 |
| &HA80A | string descriptor | S_A80A$ | MODULE_CONSTANTS literal ' Reloads'; 554E |
| &HA816 | MBF single | N_A816! | 56FF; 5725; 573B; 58C3 |
| &HA81A | string descriptor | S_A81A$ | MODULE_CONSTANTS literal ' fires'; 5770 |
| &HA824 | MBF single | N_A824! | 579E; 58EB; 594E; 5960 |
| &HA828 | MBF single | N_A828! | 57AA; 59D9; 6626 |
| &HA82C | MBF single | N_A82C! | 57B0; 59BF; 67B1 |
| &HA830 | MBF single | N_A830! | 57BC; 5977; 65ED |
| &HA834 | MBF single | N_A834! | 57DA; 5825; 587E; 5ABC; 5AE3 … |
| &HA838 | MBF single | N_A838! | 579E; 57A4; 57AA; 57B0; 57B6 … |
| &HA838 | MBF single constant | N_A838! | MODULE_CONSTANTS = 0 |
| &HA83C | MBF single | N_A83C! | 5816; 592E |
| &HA840 | MBF single | N_A840! | 58D8; 58E0; 5E78; 5ED9; 63AD … |
| &HA844 | MBF single | N_A844! | 5906 |
| &HA848 | MBF single | N_A848! | 5920; 5926; 592E |
| &HA84C | string descriptor | S_A84C$ | MODULE_CONSTANTS literal 'making'; 5948 |
| &HA856 | string descriptor | S_A856$ | MODULE_CONSTANTS literal 'hits'; 5954 |
| &HA85E | string descriptor | S_A85E$ | MODULE_CONSTANTS literal 'points of damage done.'; 598A |
| &HA878 | string descriptor | S_A878$ | MODULE_CONSTANTS literal ' destroyed!'; 59B3 |
| &HA888 | string descriptor | S_A888$ | MODULE_CONSTANTS literal 'Some crew members killed.'; 59CD |
| &HA8A6 | string descriptor | S_A8A6$ | MODULE_CONSTANTS literal 'Hull breached.'; 59E7 |
| &HA8B8 | string descriptor | S_A8B8$ | MODULE_CONSTANTS literal 'Armor reduced.'; 5A01 |
| &HA8CA | string descriptor | S_A8CA$ | MODULE_CONSTANTS literal 'Shields absorb damage.'; 5A10 |
| &HA8E4 | MBF single | N_A8E4! | 5A1C; 5A3F |
| &HA8E8 | MBF single | N_A8E8! | 5A71; 6364; 6395; 659C |
| &HA8EC | MBF single | N_A8EC! | 5A80; 5B02 |
| &HA8F0 | MBF single | N_A8F0! | 5A92; 5AA3; 5ACA; 5AF4; 5AFA … |
| &HA8F4 | MBF single | N_A8F4! | 5AB3; 5ADA; 5B98; 5BFA; 5C2C … |
| &HA8F8 | MBF single | N_A8F8! | 5B63 |
| &HA8F8 | MBF single constant | N_A8F8! | MODULE_CONSTANTS = -25 |
| &HA8FC | string descriptor | S_A8FC$ | MODULE_CONSTANTS literal 'fires and '; 5D18 |
| &HA90A | MBF single | N_A90A! | 5D40; 5E03; 5F5E; 5F84; 6584 … |
| &HA90E | MBF single | N_A90E! | 5DB0; 5DB8 |
| &HA912 | string descriptor | S_A912$ | MODULE_CONSTANTS literal 'misses.'; 5EE7 |
| &HA91E | string descriptor | S_A91E$ | MODULE_CONSTANTS literal 'Intercepted by'; 5F0C |
| &HA930 | string descriptor | S_A930$ | MODULE_CONSTANTS literal 'hits.'; 5F49 |
| &HA93A | string descriptor | S_A93A$ | MODULE_CONSTANTS literal 'Shields absorb damage.'; 5F6C |
| &HA954 | MBF single | N_A954! | 5F7B; 5FC5; 5FEC |
| &HA958 | MBF single | N_A958! | 5FAE; 6002; 606A; 60A8; 60FB … |
| &HA95C | string descriptor | S_A95C$ | MODULE_CONSTANTS literal 'Armor reduced.'; 5FDD |
| &HA96E | MBF single | N_A96E! | 6055 |
| &HA96E | MBF single constant | N_A96E! | MODULE_CONSTANTS = 0 |
| &HA972 | string descriptor | S_A972$ | MODULE_CONSTANTS literal 'Hull breached.'; 6088 |
| &HA984 | string descriptor | S_A984$ | MODULE_CONSTANTS literal ' destroyed.'; 60CA |
| &HA994 | MBF single | N_A994! | 6141 |
| &HA994 | MBF single constant | N_A994! | MODULE_CONSTANTS = 0 |
| &HA998 | string descriptor | S_A998$ | MODULE_CONSTANTS literal ' dies.'; 6228 |
| &HA9A2 | MBF single | N_A9A2! | 61D6 |
| &HA9A2 | MBF single constant | N_A9A2! | MODULE_CONSTANTS = 0 |
| &HA9A6 | MBF single | N_A9A6! | 6242; 67C7 |
| &HA9A6 | MBF single constant | N_A9A6! | MODULE_CONSTANTS = 0.68 |
| &HA9AA | MBF single | N_A9AA! | 62AE; 62D1 |
| &HA9AE | MBF single | N_A9AE! | 62E2; 6305 |
| &HA9B2 | MBF single | N_A9B2! | 6327; 63D0; 6422; 64A7; 650E … |
| &HA9B6 | MBF single | N_A9B6! | 6344; 63F8; 6436; 64BE; 64EA … |
| &HA9BA | MBF single | N_A9BA! | 6375; 63CA; 6428; 651F; 6807 … |
| &HA9BE | MBF single | N_A9BE! | 63A4; 63F2; 643C; 6500; 681F … |
| &HA9C2 | MBF single | N_A9C2! | 641A |
| &HA9C2 | MBF single constant | N_A9C2! | MODULE_CONSTANTS = 0.55 |
| &HA9C6 | MBF single | N_A9C6! | 6472; 647E; 64A7 |
| &HA9CA | MBF single | N_A9CA! | 6472 |
| &HA9CA | MBF single constant | N_A9CA! | MODULE_CONSTANTS = 142 |
| &HA9CE | MBF single | N_A9CE! | 6492; 649E; 64BE |
| &HA9D2 | MBF single | N_A9D2! | 6492 |
| &HA9D2 | MBF single constant | N_A9D2! | MODULE_CONSTANTS = 139 |
| &HA9D6 | MBF single | N_A9D6! | 64B3; 64E2 |
| &HA9DA | MBF single | N_A9DA! | 64CA; 64D1 |
| &HA9DE | MBF single | N_A9DE! | 662F |
| &HA9DE | MBF single constant | N_A9DE! | MODULE_CONSTANTS = -100 |
| &HA9E2 | MBF single | N_A9E2! | 6801 |
| &HA9E2 | MBF single constant | N_A9E2! | MODULE_CONSTANTS = -104 |
| &HA9E6 | MBF single | N_A9E6! | 6819 |
| &HA9E6 | MBF single constant | N_A9E6! | MODULE_CONSTANTS = -24 |
| &HA9EA | MBF single | N_A9EA! | 6831 |
| &HA9EA | MBF single constant | N_A9EA! | MODULE_CONSTANTS = 39 |
| &HA9EE | MBF single | N_A9EE! | 68B3 |
| &HA9EE | MBF single constant | N_A9EE! | MODULE_CONSTANTS = 130 |
| &HA9F2 | MBF single | N_A9F2! | 6A3F |
| &HA9F2 | MBF single constant | N_A9F2! | MODULE_CONSTANTS = 0.26 |
| &HA9F6 | MBF single | N_A9F6! | 6A70 |
| &HA9F6 | MBF single constant | N_A9F6! | MODULE_CONSTANTS = 1.5 |
| &HA9FA | MBF single | N_A9FA! | 6AF4 |
| &HA9FA | MBF single constant | N_A9FA! | MODULE_CONSTANTS = -12 |
| &HA9FE | MBF single | N_A9FE! | 6BBE; 6BC7 |
| &HAA02 | MBF single | N_AA02! | 6BB2 |
| &HAA02 | MBF single constant | N_AA02! | MODULE_CONSTANTS = 1e-06 |
| &HAA06 | MBF single | N_AA06! | 6BC7; 6C39; 6C45 |
| &HAA0A | MBF single | N_AA0A! | 6C26; 6D5B |
| &HAA0E | MBF single | N_AA0E! | 6D05 |
| &HAA0E | MBF single constant | N_AA0E! | MODULE_CONSTANTS = 0.8 |
| &HAA12 | MBF single | N_AA12! | 6DB4; 6E98 |
| &HAA12 | MBF single constant | N_AA12! | MODULE_CONSTANTS = 200 |
| &HAA16 | MBF single | N_AA16! | 6DBA; 6E2C; 6E9E |
| &HAA16 | MBF single constant | N_AA16! | MODULE_CONSTANTS = 0.0275 |
| &HAA1A | MBF single | N_AA1A! | 6DE5; 6DEB; 6DF3; 6E57; 6E5D … |
| &HAA1E | MBF single | N_AA1E! | 6DFE |
| &HAA1E | MBF single constant | N_AA1E! | MODULE_CONSTANTS = 0.09 |
| &HAA22 | MBF single | N_AA22! | 6E26 |
| &HAA22 | MBF single constant | N_AA22! | MODULE_CONSTANTS = 300 |
| &HAA26 | MBF single | N_AA26! | 6E70; 6EE2 |
| &HAA26 | MBF single constant | N_AA26! | MODULE_CONSTANTS = 0.07 |
| &HAA2A | MBF single | N_AA2A! | 6F48 |
| &HAA2E | MBF single | N_AA2E! | 6F56 |
| &HAA32 | MBF single | N_AA32! | 6FEC; 7030; 7060; 70A8; 7108 … |
| &HAA36 | MBF single | N_AA36! | 7049 |
| &HAA36 | MBF single constant | N_AA36! | MODULE_CONSTANTS = 75 |
| &HAA3A | MBF single | N_AA3A! | 7076 |
| &HAA3A | MBF single constant | N_AA3A! | MODULE_CONSTANTS = 30 |
| &HAA3E | MBF single | N_AA3E! | 712C |
| &HAA3E | MBF single constant | N_AA3E! | MODULE_CONSTANTS = 32000 |
| &HAA42 | MBF single | N_AA42! | 715A; 7162; 71D6; 71F8 |
| &HAA46 | string descriptor | S_AA46$ | MODULE_CONSTANTS literal 'Standard Delay Factor:'; 7245 |
| &HAA60 | string descriptor | S_AA60$ | MODULE_CONSTANTS literal 'Current Delay Factor:'; 7262 |
| &HAA7A | string descriptor | S_AA7A$ | MODULE_CONSTANTS literal 'New Delay Factor (1-9999): '; 727F |
| &HAA9A | MBF single | N_AA9A! | 72EF |
| &HAA9E | string descriptor | S_AA9E$ | MODULE_CONSTANTS literal '   '; 7339 |
| &HAAA6 | MBF single | N_AAA6! | 735F |
| &HAAA6 | MBF single constant | N_AAA6! | MODULE_CONSTANTS = 1.7 |
| &HAAAA | string descriptor | S_AAAA$ | MODULE_CONSTANTS literal 'RED'; 7385 |
| &HAAB2 | MBF single | N_AAB2! | 73C3 |
| &HAAB2 | MBF single constant | N_AAB2! | MODULE_CONSTANTS = 110 |
| &HAAB6 | MBF single | N_AAB6! | 73F6 |
| &HAAB6 | MBF single constant | N_AAB6! | MODULE_CONSTANTS = 222 |
| &HAABA | MBF single | N_AABA! | 740D |
| &HAABA | MBF single constant | N_AABA! | MODULE_CONSTANTS = 159 |

T_nn! temporary slots are addressed through the runtime base and the inline selector; they have no fixed game-variable DS address. InputFile%, InputTypes, BUFFER and INPUT_NEXT are explanatory representations of the runtime's input state. ARGS(), COORD(), ACTION(), BOXMODE(), CAPACITY(), TEMP_DESC(), OPENMODE() and BASIC_BOOL() are semantic helpers defined above; BASIC_BOOL returns -1 or 0. SoundFreq%/SoundDuration!, Line1/2X!/Y!, Get1/2X!/Y! and CircleStart!/End!/Aspect! hold the pending statement arguments, with omissions/defaults governed by the original runtime flags.

FAC! is DS:001A (H ledger). AX/BX/CX/DX/SI/DI and BP are compiler/runtime registers; DX:AX is the IMUL product pair. CompareLeft!/Right!, CompareLeft$/Right$, CompareLeft%/Right%, LocateRow%, PutX%/PutY%/PutXFlag%/PutYFlag% are explanatory temporaries, not original game variables. BYTE/WORD preserve memory width and the original BP-relative workspace.

DS:6F42 is a filename-prefix descriptor (M: empty/A:/B: assignments at 0040..0074, tested against shared DS:19A4). DS:6F46/6F4E/6F58 are those literal descriptors (H). Shared DS:19A4 remains address-named because its wider mode/value conventions are not proved here. DS:6F86 is an iteration value (M: 0086..00C4 and many later CINT/index patterns). DS:6F62/6F72 are word-addressed regions in the initial loop (M: 0097..00AB); element meanings remain unknown. Other numeric arrays and string descriptor arrays remain N(expr)/S(expr) with their address calculations visible in the transcription. Literal filenames name resources; they do not establish complete file-record formats or destination-array dimensions.

