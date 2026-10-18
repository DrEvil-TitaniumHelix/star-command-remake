# PLBATTLE — first-draft BASIC-style pseudocode

Evidence: `decode/listings/PLBATTLE.lst` (including its recorded bytes), `decode/data/MODULE_CONSTANTS.md` / PLBATTLE.EXE, `decode/brun30/RT_LEDGER.md`, and the `decode/brun30/rt_asm.txt` bodies cited below, read 2026-10-15. Unresolved operations remain explicit; this is a draft for the module-verification lane.

Only this file is the lane output. The assignment's STATUS.md append is omitted to honor the user's explicit one-file scope.

## Conventions and evidence

PUSH16 places a word on the compiler/runtime argument stack. DIM ARRAY(BX), SIZES_FROM_STACK(n) consumes n supplied sizes (H dimension-count/stack ABI; exact source-level bound expression is retained symbolically). ARRAY_OFFSET is M from RT3F_C9. All other helper definitions below apply to PLBATTLE's own offsets.

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

The corrected listing consumes inline payloads but abbreviates long byte columns with '..'. Each visible byte is checked against the original, read-only PLBATTLE.EXE load module; omitted payload bytes come from that same original. Original files are never changed.

The following payload lengths follow inline_args.json and RT_LEDGER:

| Family | Payload | Evidence / confidence |
|---|---|---|
| 3F_71/85/95/9D/8D/A5 | one temporary-selector byte | H ledger and helper 1EC3 |
| 3F_AB/AD | one signed exponent-scaling byte | H AC66..AC8A |
| 3F_45 | one dimension-count byte; sizes supplied on the stack | H C22D..C267 |
| 3F_B7 | count followed by count type bytes | H C529..C557; 04 single,03 string,02 integer,08 double |
| 3F_5D/5E | count followed by count little-endian target words | H shared body 9504..953E, ON GOSUB / ON GOTO |

CS-offset table words map to listing offsets by adding 0010h (H ledger). ON BX GOSUB pushes the post-table return address; ON BX GOTO does not. Raw tables are preserved after the transcription.

Near relative branch/call destinations are reduced modulo 65536 because this is 16-bit code. For example, the listing displays CALL 106DB at 92C6 and CALL 106A9 at A388; the actual wrapped destinations are L_06DB and L_06A9 (H instruction-byte arithmetic, both existing helper entries).

The inferred logical code end is A921h (M interpretation): header word2 is A911h, and adding the documented CS/listing bias 0010h agrees with the terminal RETURN at A920. Metadata block 16 starts at A930h (MODULE_CONSTANTS). Bytes A921..A92F form a fifteen-byte unclassified tail; they are recorded once as raw bytes and excluded from runtime-call counts. The original listing accidentally recognizes a PRINT-begin instruction inside that tail. No explicit incoming branch/table destination reaches it. The supplied source-line table is not used to assign BASIC line numbers; offset labels remain the primary provenance.

## Flows and screens

These ranges identify displayed content and associated code, not a claim that every group is a separate graphics mode. The complete transcription retains coordinates, branches, loops, arithmetic and memory accesses.

| Evidence offsets | Flow / displayed content | Confidence |
|---|---|---|
| 0040..005D | Three runtime DIM calls for sprite-array descriptors 8030/803A/8044, with stack-supplied sizes | H ledger and operands |
| 0061..0074 | Shared DS:19B4 compared with constant one; matching path executes SCREEN 7 | H comparison, value and SCREEN routine |
| 0075..01FB | Prefix/resource initialization; CHARINFO loading; ground-combat title and squad/enemy surprise text | H literals, exact initialization in transcription |
| 0271..02D6 | Gravity, fatigue, atmosphere (breathable/unbreathable), combat location | H strings; stat-field semantics remain address-based |
| 033B; 0462..04D1 | Array offset/BLOAD path, terrain legend and escape instructions: walk off map, bottom door, or no fleeing inside space vessels | H displayed strings, M ARRAY_OFFSET naming |
| 06A9, 06DB | Frequently called data/index helpers (100 / 70 direct call sites respectively) | H destinations; field names unknown |
| 0736 | “Change things?” confirmation | H literal |
| 1306..1351 | Encounter group counts/name text | H strings |
| 1A9C..1AA8 | Squad movement in squares per turn | H text; calculation retained without invented stat name |
| 1D84..1F55 | Squad members with oxygen | H strings |
| 2552..2C69 | Squad name/HP/condition/ammunition display, selector, hand/broken labels, option and ENTER prompts | H strings |
| 317D..319C | Carry-capacity and affordability feedback | H strings; associated numeric fields not renamed |
| 35B5..37B9 | Establish communications; member translates/uses ESP; attempt failure | H strings |
| 37DA..3941 | Approach choices Plead/Ask/Demand/Bargain/Impersonate Diety/None; objectives Truce/Tribute/Surrender | H exact literal wording |
| 3B7D..3CCC | Refusal reactions; truce/payment, tribute and surrender | H strings, formulas in transcription |
| 4123..42C3 | Battle-over/report, credits gained, group killed/survived/surrendered counts | H strings |
| 4365..44E5 | All-dead feedback; tow linkage broken / towing for salvage | H strings |
| 46F2..47A8 | Movement phase: switch weapons, skip move, time delay | H strings |
| 5174..5401 | Weapon selection, hand weapon, reload/status indicators | H strings |
| 544F..5489 | Standard/current/new delay factor (1–9999) | H strings |
| 563A..591F | Resting, group ranges, none in range | H strings |
| 5DB9..60A4 | Command/target selection; Wait/Attack/Rapid/Load/Aim/ESP and Mindshock/Healing/Psychic Scream choices | H strings |
| 684D..6F10 | Reload/attack results, swings/uses/fires/fist, hits/damage, armor absorption, kills and equipment destruction | H strings |
| 7429..78B1 | Enemy/group weapons, rocket launcher/flame thrower, hit/miss reporting | H strings; record-field identities remain unknown |
| 79F9..7F24 | Squad armor/damage/death; sighting hardware, hand weapon, armor, weapon and ammunition damage | H strings |
| A481..A843 | Uses/fails/death/damage/healing messages near final action paths | H strings, full ability formulas retained |

Transitions are rendered as CHAIN at their exact call sites; filenames are supplied by S_CDF4$ (“SPACE.STR”) and S_CE02$ (“INSIDE.EXE”) or computed descriptors, as shown in the full code. A literal identifies a resource, not its full record layout.

## DATA records

The following are recovered source records from MODULE_CONSTANTS. Their exact association with every READ site and the units/column meanings of numeric tables remain unknown.

| Source record | Values |
|---|---|
| 241 | fires laser,extends claw,stings,bites |
| 297 | Plains,Mushrooms,Swamp,,,,,,,Enemy Ship,Enclosed Room,Semi-enclosed Room,Open Room |
| 6903 | Wait,Attack,Reload,Switch,Aim,Aim more,Best aim,Rapid Attack,Mindshock,Healing,Psychic Scream |
| 7171 | 1,1,.7,.05,.2,.5,.7,1,1,1,1,1,-15,5,-20,-25,1.1,1,.6,0,.05,.3,.6,1,1,1,1.1,1.2,-15,5,-20,-25,.9,.8,.4,0,0,.1,.4,.6,1,1.5,2,3,-15,5,-20,-25 |
| 7172 | 2.6,2.2,1.5,.25,.4,.7,.9,1,1,1.3,1.7,2.8,-15,5,-20,-25,1,1,.9,0,0,0,0,0,0,0,0,7,0,10,-25,-30 |
| terminal (FFFF) | 01 |

Confidence H for these recorded strings/values. Source record numbers are data provenance; no code-offset/source-line mapping is invented.

## Collapsed BASIC display patterns

Each sequence below is repeated with its compiler operations in the full transcription. Descriptors resolve to literal strings under Variables. PRINT formatting differences remain subject to the routine tags in the full view.

```basic
L_01B2: LOCATE 1, 14: PRINT S_BAF8$  ' bytes 01B2..01C9; 'GROUND COMBAT'
L_0450: LOCATE 7, 1: PRINT S_BFBE$  ' bytes 0450..0467; ' Typical Inacessable Defensive Offensive   Area      Area      Area      Area'
L_0724: LOCATE 20, 2: PRINT S_C134$  ' bytes 0724..073B; 'Change things? '
L_1D72: LOCATE 24, 1: PRINT S_C952$  ' bytes 1D72..1D89; 'Squad members with oxygen:'
L_2540: LOCATE 2, 16: PRINT S_C9A8$  ' bytes 2540..2557; '1 2 3 4 5'
L_2579: LOCATE 12, 5: PRINT S_C9B6$  ' bytes 2579..2590; 'Name    HP  Cond A:R'
L_297F: LOCATE 24, 2: PRINT S_C9F4$  ' bytes 297F..2996; 'Select Option'
L_316B: LOCATE 20, 2: PRINT S_CA9C$  ' bytes 316B..3182; 'Can Not Carry Anymore Of That'
L_318A: LOCATE 20, 2: PRINT S_CABE$  ' bytes 318A..31A1; 'Can Not Afford It'
L_35A3: LOCATE 22, 2: PRINT S_CB0A$  ' bytes 35A3..35BA; 'Establish communications? (y/n)'
L_37C8: LOCATE 20, 7: PRINT S_CB66$  ' bytes 37C8..37DF; 'Communications Phase'
L_3870: LOCATE 24, 2: PRINT S_CBD6$  ' bytes 3870..3887; 'Choose An Approach: (A-F)'
L_4111: LOCATE 22, 12: PRINT S_CD82$  ' bytes 4111..4128; 'Battle Over'
L_4353: LOCATE 13, 12: PRINT S_CE10$  ' bytes 4353..436A; 'You Are All Dead'
L_5188: LOCATE 23, 2: PRINT S_CF5C$  ' bytes 5188..519F; 'SPACE to change weapon ENTER to select'
L_574F: LOCATE 21, 2: PRINT S_D01E$  ' bytes 574F..5766; 'Groups In Range: '
L_5ED4: LOCATE 23, 2: PRINT S_D0A2$  ' bytes 5ED4..5EEB; 'ENTER to accept   A-D  1-5 to retarget'
L_5EEC: LOCATE 24, 2: PRINT S_D0CC$  ' bytes 5EEC..5F03; 'W-ait F-Attack R-apid L-oad M-Aim E-sp'
L_6092: LOCATE 24, 2: PRINT S_D0FE$  ' bytes 6092..60A9; 'M-indshock  H-ealing  P-sychic Scream '
L_A6B5: LOCATE 24, 2: PRINT S_D596$  ' bytes A6B5..A6CC; 'and dies.'

```

## Complete offset transcription

### Dynamic arrays, screen and entry initialization

```basic
L_0040: AX = &HC42
L_0043: PUSH16 AX
L_0044: BX = &H8030
L_0047: DIM ARRAY(BX), SIZES_FROM_STACK(1)  ' RT3F_45; inline=&H01
L_004B: AX = &H1002
L_004E: PUSH16 AX
L_004F: BX = &H803A
L_0052: DIM ARRAY(BX), SIZES_FROM_STACK(1)  ' RT3F_45; inline=&H01
L_0056: AX = &H8A2
L_0059: PUSH16 AX
L_005A: BX = &H8044
L_005D: DIM ARRAY(BX), SIZES_FROM_STACK(1)  ' RT3F_45; inline=&H01
L_0061: DI = &H804E
L_0064: SI = &H19B4
L_0067: CompareLeft! = N_19B4!: CompareRight! = N_804E!  ' RT3F_9F
L_006A: IF CompareLeft! = CompareRight! THEN GOTO L_006F  ' flags from L_0067
L_006C: GOTO L_0075
L_006F: BX = 7
L_0072: SCREEN ARGS(), BX  ' RT3E_5B
L_0075: BX = &H9408
L_0078: DX = &H9404
L_007B: S_9404$ = S_9408$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_007E: DI = &H804E
L_0081: SI = &H19A4
L_0084: CompareLeft! = N_19A4!: CompareRight! = N_804E!  ' RT3F_9F
L_0087: IF CompareLeft! = CompareRight! THEN GOTO L_008C  ' flags from L_0084
L_0089: GOTO L_0095
L_008C: BX = &H940C
L_008F: S(DX) = S_940C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0092: GOTO L_00AC
L_0095: DI = &H9412
L_0098: SI = &H19A4
L_009B: CompareLeft! = N_19A4!: CompareRight! = N_9412!  ' RT3F_9F
L_009E: IF CompareLeft! = CompareRight! THEN GOTO L_00A3  ' flags from L_009B
L_00A0: GOTO L_00AC
L_00A3: BX = &H9416
L_00A6: DX = &H9404
L_00A9: S_9404$ = S_9416$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_00AC: BX = &H941C
L_00AF: PLAY S_941C$  ' RT3E_51
L_00B2: DI = &H9422
L_00B5: SI = &H942A
L_00B8: N_9422! = N_942A!  ' RT3F_7B
L_00BB: DI = &H19C4
L_00BE: SI = &H804E
L_00C1: FAC! = N_804E! - N_19C4!  ' RT3F_97
L_00C4: DI = &H9426
L_00C7: N_9426! = FAC!: SI = &H001A  ' RT3F_7D
L_00CA: SI = &H804E
L_00CD: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_00D0: GOTO L_00F1
L_00D3: ' Alignment NOP
L_00D4: SI = &HBA90
L_00D7: BX = SI
L_00D9: DX = BX
L_00DB: BX = CINT(N_BA90!)  ' RT3F_75
L_00DE: BX = BX * (2 ^ 1)
L_00E0: BX = BX * (2 ^ 1)
L_00E2: BX = BX + &HBA7C
L_00E6: READ S(BX)  ' RT3F_10
L_00E9: SI = DX
L_00EB: DI = &H804E
L_00EE: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_00F1: DI = &HBA90
L_00F4: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_00F7: SI = DI
L_00F9: DI = &HBA94
L_00FC: CompareLeft! = N_BA90!: CompareRight! = N_BA94!  ' RT3F_9F
L_00FF: IF CompareLeft! <= CompareRight! THEN GOTO L_00D4  ' flags from L_00FC
L_0101: ' Alignment NOP
L_0102: SI = &H804E
L_0105: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_0108: GOTO L_0129
L_010B: ' Alignment NOP
L_010C: SI = &HBA90
L_010F: BX = SI
L_0111: DX = BX
L_0113: BX = CINT(N_BA90!)  ' RT3F_75
L_0116: BX = BX * (2 ^ 1)
L_0118: BX = BX * (2 ^ 1)
L_011A: BX = BX + &HBA98
L_011E: READ S(BX)  ' RT3F_10
L_0121: SI = DX
L_0123: DI = &H804E
L_0126: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_0129: DI = &HBA90
L_012C: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_012F: SI = DI
L_0131: DI = &HBAD0
L_0134: CompareLeft! = N_BA90!: CompareRight! = N_BAD0!  ' RT3F_9F
L_0137: IF CompareLeft! <= CompareRight! THEN GOTO L_010C  ' flags from L_0134
L_0139: ' Alignment NOP
L_013A: SI = &HBAD4
L_013D: CompareLeft! = N_BAD4!: CompareRight! = 0  ' RT3F_A7
L_0140: IF CompareLeft! <> CompareRight! THEN GOTO L_0145  ' flags from L_013D
L_0142: GOTO L_016A
L_0145: BX = &H1850
L_0148: FAC! = CSNG(BX)  ' RT3F_57
L_014B: BX = &HBAD8
L_014E: DX = &H1A
L_0151: BLOAD S_BAD8$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_0154: DI = &H804E
L_0157: SI = &HBAD4
L_015A: CompareLeft! = N_BAD4!: CompareRight! = N_804E!  ' RT3F_9F
L_015D: IF CompareLeft! = CompareRight! THEN GOTO L_0162  ' flags from L_015A
L_015F: GOTO L_016A
L_0162: SI = DI
L_0164: DI = &H19B4
L_0167: N_19B4! = N(SI)  ' RT3F_7B
L_016A: BX = &H3B78
L_016D: FAC! = INT(N_3B78!)  ' RT3D_03
L_0170: DI = &HBAF4
L_0173: FAC! = FAC! / N_BAF4!  ' RT3F_89
L_0176: DI = &HBAE4
L_0179: N_BAE4! = FAC!: SI = &H001A  ' RT3F_7D
L_017C: SI = &H3B80
L_017F: FAC! = SGN(N_3B80!)  ' RT3F_2F

```

### Combat introduction and environment

```basic
L_0182: DI = &HBAE8
L_0185: N_BAE8! = FAC!: SI = &H001A  ' RT3F_7D
L_0188: DI = &HBAEC
L_018B: SI = &H3B24
L_018E: N_BAEC! = N_3B24!  ' RT3F_7B
L_0191: DI = &HBAF0
L_0194: SI = &H3B20
L_0197: N_BAF0! = N_3B20!  ' RT3F_7B
L_019A: SI = DI
L_019C: DI = &H804E
L_019F: CompareLeft! = N_BAF0!: CompareRight! = N_804E!  ' RT3F_9F
L_01A2: IF CompareLeft! < CompareRight! THEN GOTO L_01A7  ' flags from L_019F
L_01A4: GOTO L_01AC
L_01A7: SWAP DI, SI
L_01A9: N(DI) = N(SI)  ' RT3F_7B
L_01AC: BX = &HFFFF
L_01AF: CLS BX  ' RT3E_32
L_01B2: BX = 1
L_01B5: ARGPUSH BX  ' RT3E_42
L_01B8: BX = &HE
L_01BB: LOCATE ARGS(), BX  ' RT3E_44
L_01BE: ' PRINT statement begins ; RT3F_BC
L_01C1: BX = &HBAF8
L_01C4: PRINT S_BAF8$  ' RT3F_6E; H newline item, ledger correction
L_01C7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_01CA: DI = &H9412
L_01CD: SI = &HBAEC
L_01D0: CompareLeft! = N_BAEC!: CompareRight! = N_9412!  ' RT3F_9F
L_01D3: IF CompareLeft! = CompareRight! THEN GOTO L_01D8  ' flags from L_01D0
L_01D5: GOTO L_01E7
L_01D8: ' PRINT statement begins ; RT3F_BC
L_01DB: BX = &HBB0A
L_01DE: PRINT S_BB0A$  ' RT3F_6E; H newline item, ledger correction
L_01E1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_01E4: GOTO L_0210
L_01E7: DI = &H804E
L_01EA: SI = &HBAEC
L_01ED: CompareLeft! = N_BAEC!: CompareRight! = N_804E!  ' RT3F_9F
L_01F0: IF CompareLeft! = CompareRight! THEN GOTO L_01F5  ' flags from L_01ED
L_01F2: GOTO L_0204
L_01F5: ' PRINT statement begins ; RT3F_BC
L_01F8: BX = &HBB26
L_01FB: PRINT S_BB26$  ' RT3F_6E; H newline item, ledger correction
L_01FE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_0201: GOTO L_0210
L_0204: ' PRINT statement begins ; RT3F_BC
L_0207: BX = &H9408
L_020A: PRINT S_9408$  ' RT3F_6E; H newline item, ledger correction
L_020D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_0210: DI = &HBB42
L_0213: SI = &HBB46
L_0216: N_BB42! = N_BB46!  ' RT3F_7B
L_0219: BX = DI
L_021B: DI = &HBB4A
L_021E: SI = &HBAF0
L_0221: CompareLeft! = N_BAF0!: CompareRight! = N_BB4A!  ' RT3F_9F
L_0224: IF CompareLeft! = CompareRight! THEN GOTO L_0229  ' flags from L_0221
L_0226: GOTO L_0231
L_0229: DI = BX
L_022B: SI = &H3BA0
L_022E: N(DI) = N_3BA0!  ' RT3F_7B
L_0231: DI = &HBB4E
L_0234: SI = &HBAE4
L_0237: N_BB4E! = N_BAE4!  ' RT3F_7B
L_023A: BX = DI
L_023C: DI = &HBB52
L_023F: CompareLeft! = N_BAE4!: CompareRight! = N_BB52!  ' RT3F_9F
L_0242: IF CompareLeft! < CompareRight! THEN GOTO L_0247  ' flags from L_023F
L_0244: GOTO L_0251
L_0247: SWAP BX, DI
L_0249: SI = BX
L_024B: N(DI) = N(SI)  ' RT3F_7B
L_024E: GOTO L_026B
L_0251: DI = &H804E
L_0254: SI = &HBAE4
L_0257: CompareLeft! = N_BAE4!: CompareRight! = N_804E!  ' RT3F_9F
L_025A: IF CompareLeft! > CompareRight! THEN GOTO L_025F  ' flags from L_0257
L_025C: GOTO L_026B
L_025F: DI = &HBB56
L_0262: FAC! = N(SI) ^ N_BB56!  ' RT3F_23; M ledger
L_0265: DI = &HBB4E
L_0268: N_BB4E! = FAC!: SI = &H001A  ' RT3F_7D
L_026B: ' PRINT statement begins ; RT3F_BC
L_026E: BX = &HBB5A
L_0271: PRINT S_BB5A$;  ' RT3F_6A
L_0274: BX = &HBAE4
L_0277: PRINT N_BAE4!;  ' RT3F_67; H expanded ledger
L_027A: BX = &HBB66
L_027D: PRINT S_BB66$;  ' RT3F_6A
L_0280: DI = &HBB9E
L_0283: SI = &HBB4E
L_0286: FAC! = N_BB4E! * N_BB9E!  ' RT3F_8F
L_0289: BX = &H1A
L_028C: FAC! = INT(FAC!)  ' RT3D_03
L_028F: FAC! = FAC! / N(DI)  ' RT3F_89
L_0292: BX = &H1A
L_0295: PRINT FAC!  ' RT3F_6B
L_0298: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_029B: ' PRINT statement begins ; RT3F_BC
L_029E: BX = &HBB80
L_02A1: PRINT S_BB80$;  ' RT3F_6A
L_02A4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_02A7: DI = &H804E
L_02AA: SI = &HBAE8
L_02AD: CompareLeft! = N_BAE8!: CompareRight! = N_804E!  ' RT3F_9F
L_02B0: IF CompareLeft! = CompareRight! THEN GOTO L_02B5  ' flags from L_02AD
L_02B2: GOTO L_02C4
L_02B5: ' PRINT statement begins ; RT3F_BC
L_02B8: BX = &HBB90
L_02BB: PRINT S_BB90$  ' RT3F_6E; H newline item, ledger correction
L_02BE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_02C1: GOTO L_02D0
L_02C4: ' PRINT statement begins ; RT3F_BC
L_02C7: BX = &HBBA2
L_02CA: PRINT S_BBA2$  ' RT3F_6E; H newline item, ledger correction
L_02CD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_02D0: ' PRINT statement begins ; RT3F_BC
L_02D3: BX = &HBBB2
L_02D6: PRINT S_BBB2$;  ' RT3F_6A
L_02D9: DI = &HBB42
L_02DC: SI = &HBAF0
L_02DF: FAC! = N_BAF0! + N_BB42!  ' RT3F_7F
L_02E2: BX = CINT(FAC!)  ' RT3F_77
L_02E5: BX = BX * (2 ^ 1)
L_02E7: BX = BX * (2 ^ 1)
L_02E9: BX = BX + &HBA98
L_02ED: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_02F0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_02F3: DI = &H804E
L_02F6: SI = &H19B4
L_02F9: CompareLeft! = N_19B4!: CompareRight! = N_804E!  ' RT3F_9F
L_02FC: IF CompareLeft! = CompareRight! THEN GOTO L_0301  ' flags from L_02F9
L_02FE: GOTO L_034F

```

### Terrain assets and escape instructions

```basic
L_0301: BX = &HBC6C
L_0304: FAC! = CSNG(BX)  ' RT3F_57
L_0307: BX = &HBF88
L_030A: AX = &H9404
L_030D: BX = TEMP_DESC(S_9404$ + S_BF88$)  ' BX receives a temporary descriptor  ' RT3F_55
L_0310: SI = &HBAF0
L_0313: T_00! = FAC!  ' RT3F_71; inline=&H80
L_0317: FAC! = -N(SI)  ' RT3F_AF
L_031A: DX = BX
L_031C: BX = &H1A
L_031F: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_0322: SWAP DX, AX
L_0323: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_0326: AX = BX
L_0328: BX = &HBF8E
L_032B: BX = TEMP_DESC(S(AX) + S_BF8E$)  ' BX receives a temporary descriptor  ' RT3F_55
L_032E: CX = DX
L_0330: DX = &HBE88
L_0333: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_0336: BX = &H8044
L_0339: DX = 0
L_033B: FAC! = ARRAY_OFFSET(BX, DX)  ' RT3F_C9; M ledger, DS-relative offset
L_033E: AX = CX
L_0340: BX = &HBE7C
L_0343: BX = TEMP_DESC(S(AX) + S_BE7C$)  ' BX receives a temporary descriptor  ' RT3F_55
L_0346: DX = &H1A
L_0349: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_034C: GOTO L_0383
L_034F: BX = &HBC6C
L_0352: FAC! = CSNG(BX)  ' RT3F_57
L_0355: BX = &HBF88
L_0358: AX = &H9404
L_035B: BX = TEMP_DESC(S_9404$ + S_BF88$)  ' BX receives a temporary descriptor  ' RT3F_55
L_035E: SI = &HBAF0
L_0361: T_00! = FAC!  ' RT3F_71; inline=&H80
L_0365: FAC! = -N(SI)  ' RT3F_AF
L_0368: DX = BX
L_036A: BX = &H1A
L_036D: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_0370: AX = DX
L_0372: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_0375: AX = BX
L_0377: BX = &HBF96
L_037A: BX = TEMP_DESC(S(AX) + S_BF96$)  ' BX receives a temporary descriptor  ' RT3F_55
L_037D: DX = &HBE88
L_0380: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_0383: SI = &HBF9E
L_0386: FAC! = N_BF9E!: DI = &H001E  ' RT3F_6F
L_0389: GOTO L_0403
L_038C: DI = &HBFA6
L_038F: SI = &HBA90
L_0392: FAC! = N_BA90! + N_BFA6!  ' RT3F_7F
L_0395: DI = &HBFA2
L_0398: BX = SI
L_039A: N_BFA2! = FAC!: SI = &H001A  ' RT3F_7D
L_039D: SI = BX
L_039F: FAC! = N(SI): DI = &H001E  ' RT3F_6F
L_03A2: GOTO L_03EA
L_03A5: ' Alignment NOP
L_03A6: SI = &HBFAA
L_03A9: FAC! = N_BFAA!: DI = &H001E  ' RT3F_6F
L_03AC: GOTO L_03D1
L_03AF: ' Alignment NOP
L_03B0: BX = &HBFAE
L_03B3: DX = &HBFB2
L_03B6: CX = &HFFFF
L_03B9: AX = CX
L_03BB: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_03BE: BX = &HBC6C
L_03C1: CX = DX
L_03C3: DX = 4
L_03C6: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_03C9: SI = CX
L_03CB: DI = &HBF9E
L_03CE: FAC! = N(SI) + N_BF9E!  ' RT3F_7F
L_03D1: DI = &HBFB2
L_03D4: N_BFB2! = FAC!: SI = &H001A  ' RT3F_7D
L_03D7: SI = DI
L_03D9: DI = &HBB9E
L_03DC: CompareLeft! = N_BFB2!: CompareRight! = N_BB9E!  ' RT3F_9F
L_03DF: IF CompareLeft! <= CompareRight! THEN GOTO L_03B0  ' flags from L_03DC
L_03E1: DI = &HBF9E
L_03E4: SI = &HBFAE
L_03E7: FAC! = N_BFAE! + N_BF9E!  ' RT3F_7F
L_03EA: DI = &HBFAE
L_03ED: N_BFAE! = FAC!: SI = &H001A  ' RT3F_7D
L_03F0: SI = DI
L_03F2: DI = &HBFA2
L_03F5: CompareLeft! = N_BFAE!: CompareRight! = N_BFA2!  ' RT3F_9F
L_03F8: IF CompareLeft! <= CompareRight! THEN GOTO L_03A6  ' flags from L_03F5
L_03FA: DI = &HBFB6
L_03FD: SI = &HBA90
L_0400: FAC! = N_BA90! + N_BFB6!  ' RT3F_7F
L_0403: DI = &HBA90
L_0406: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0409: SI = DI
L_040B: DI = &HBFBA
L_040E: CompareLeft! = N_BA90!: CompareRight! = N_BFBA!  ' RT3F_9F
L_0411: IF CompareLeft! > CompareRight! THEN GOTO L_0416  ' flags from L_040E
L_0413: GOTO L_038C
L_0416: BX = &H70
L_0419: DX = &H54
L_041C: CX = 0
L_041E: AX = CX
L_0420: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_0423: BX = &HBD74
L_0426: DX = 3
L_0429: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_042C: BX = &HC0
L_042F: DX = &H54
L_0432: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_0435: BX = &HBDF8
L_0438: DX = 3
L_043B: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_043E: BX = &H110
L_0441: DX = &H54
L_0444: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_0447: BX = &HBCF0
L_044A: DX = 3
L_044D: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_0450: BX = 7
L_0453: ARGPUSH BX  ' RT3E_42
L_0456: BX = 1
L_0459: LOCATE ARGS(), BX  ' RT3E_44
L_045C: ' PRINT statement begins ; RT3F_BC
L_045F: BX = &HBFBE
L_0462: PRINT S_BFBE$  ' RT3F_6E; H newline item, ledger correction
L_0465: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_0468: BX = &H10
L_046B: ARGPUSH BX  ' RT3E_42
L_046E: BX = 1
L_0471: LOCATE ARGS(), BX  ' RT3E_44
L_0474: DI = &HBAF4
L_0477: SI = &HBAF0
L_047A: CompareLeft! = N_BAF0!: CompareRight! = N_BAF4!  ' RT3F_9F
L_047D: IF CompareLeft! <> CompareRight! THEN GOTO L_0482  ' flags from L_047A
L_047F: GOTO L_04BD
L_0482: ' PRINT statement begins ; RT3F_BC
L_0485: BX = &HC010
L_0488: PRINT S_C010$;  ' RT3F_6A
L_048B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_048E: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_0491: IF CompareLeft! < CompareRight! THEN GOTO L_0496  ' flags from L_048E
L_0493: GOTO L_04A5
L_0496: ' PRINT statement begins ; RT3F_BC
L_0499: BX = &HC02A
L_049C: PRINT S_C02A$  ' RT3F_6E; H newline item, ledger correction
L_049F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_04A2: GOTO L_04BD
L_04A5: ' PRINT statement begins ; RT3F_BC
L_04A8: BX = &HC040
L_04AB: PRINT S_C040$;  ' RT3F_6A
L_04AE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_04B1: ' PRINT statement begins ; RT3F_BC
L_04B4: BX = &HC058
L_04B7: PRINT S_C058$  ' RT3F_6E; H newline item, ledger correction
L_04BA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_04BD: DI = &HBAF4
L_04C0: SI = &HBAF0
L_04C3: CompareLeft! = N_BAF0!: CompareRight! = N_BAF4!  ' RT3F_9F
L_04C6: IF CompareLeft! = CompareRight! THEN GOTO L_04CB  ' flags from L_04C3
L_04C8: GOTO L_04D7
L_04CB: ' PRINT statement begins ; RT3F_BC
L_04CE: BX = &HC06E
L_04D1: PRINT S_C06E$  ' RT3F_6E; H newline item, ledger correction
L_04D4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_04D7: BX = &HC0C4
L_04DA: DX = &HC0B8
L_04DD: S_C0B8$ = S_C0C4$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_04E0: BX = &HC0CC
L_04E3: DX = &HC0BC
L_04E6: S_C0BC$ = S_C0CC$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_04E9: BX = &HC0D4
L_04EC: DX = &HC0C0
L_04EF: S_C0C0$ = S_C0D4$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_04F2: SI = &HBAD4
L_04F5: CompareLeft! = N_BAD4!: CompareRight! = 0  ' RT3F_A7
L_04F8: IF CompareLeft! <> CompareRight! THEN GOTO L_04FD  ' flags from L_04F5
L_04FA: GOTO L_0653
L_04FD: BX = &H40F4
L_0500: FAC! = CSNG(BX)  ' RT3F_57
L_0503: BX = &HC0DC
L_0506: DX = &H1A
L_0509: BLOAD S_C0DC$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_050C: BX = 0
L_050E: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_0511: CX = BX
L_0513: BX = 1
L_0516: DX = &HC0E4
L_0519: OPEN S_C0E4$ FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_051C: SI = &H804E
L_051F: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_0522: GOTO L_0540
L_0525: ' Alignment NOP
L_0526: BX = 1
L_0529: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_052C: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0531: BX = &HC0EC
L_0534: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0537: DI = &H804E
L_053A: SI = &HBA90
L_053D: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_0540: DI = &HBA90
L_0543: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0546: SI = DI
L_0548: DI = &HBFB6
L_054B: CompareLeft! = N_BA90!: CompareRight! = N_BFB6!  ' RT3F_9F
L_054E: IF CompareLeft! <= CompareRight! THEN GOTO L_0526  ' flags from L_054B
L_0550: SI = &HBB46
L_0553: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_0556: GOTO L_0582
L_0559: ' Alignment NOP
L_055A: BX = 1
L_055D: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0560: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0565: SI = &HBA90
L_0568: BX = SI
L_056A: DX = BX
L_056C: BX = CINT(N_BA90!)  ' RT3F_75
L_056F: BX = BX * (2 ^ 1)
L_0571: BX = BX * (2 ^ 1)
L_0573: BX = BX + &H43F4
L_0577: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_057A: SI = DX
L_057C: DI = &H804E
L_057F: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_0582: DI = &HBA90
L_0585: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0588: SI = DI
L_058A: DI = &HC0F0
L_058D: CompareLeft! = N_BA90!: CompareRight! = N_C0F0!  ' RT3F_9F
L_0590: IF CompareLeft! <= CompareRight! THEN GOTO L_055A  ' flags from L_058D
L_0592: SI = &HBB46
L_0595: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_0598: GOTO L_05C4
L_059B: ' Alignment NOP
L_059C: BX = 1
L_059F: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_05A2: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_05A7: SI = &HBA90
L_05AA: BX = SI
L_05AC: DX = BX
L_05AE: BX = CINT(N_BA90!)  ' RT3F_75
L_05B1: BX = BX * (2 ^ 1)
L_05B3: BX = BX * (2 ^ 1)
L_05B5: BX = BX + &H44CC
L_05B9: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_05BC: SI = DX
L_05BE: DI = &H804E
L_05C1: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_05C4: DI = &HBA90
L_05C7: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_05CA: SI = DI
L_05CC: DI = &HC0F4
L_05CF: CompareLeft! = N_BA90!: CompareRight! = N_C0F4!  ' RT3F_9F
L_05D2: IF CompareLeft! <= CompareRight! THEN GOTO L_059C  ' flags from L_05CF
L_05D4: BX = 1
L_05D7: CLOSE #BX  ' RT3E_21
L_05DA: BX = 0
L_05DC: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_05DF: CX = BX
L_05E1: BX = 1
L_05E4: DX = &HC0F8
L_05E7: OPEN S_C0F8$ FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_05EA: BX = 1
L_05ED: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_05F0: InputTypes = [4, 4, 4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_05F7: BX = &H488C
L_05FA: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_05FD: BX = &HC104

```

### Shared helpers and preparation

```basic
L_0600: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0603: BX = &HC108
L_0606: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0609: SI = &H804E
L_060C: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_060F: GOTO L_063A
L_0612: BX = 1
L_0615: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0618: InputTypes = [4]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_061D: SI = &HBA90
L_0620: BX = SI
L_0622: DX = BX
L_0624: BX = CINT(N_BA90!)  ' RT3F_75
L_0627: BX = BX * (2 ^ 1)
L_0629: BX = BX * (2 ^ 1)
L_062B: BX = BX + &H4288
L_062F: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0632: SI = DX
L_0634: DI = &H804E
L_0637: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_063A: DI = &HBA90
L_063D: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0640: SI = DI
L_0642: DI = &HC10C
L_0645: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_0648: IF CompareLeft! <= CompareRight! THEN GOTO L_0612  ' flags from L_0645
L_064A: BX = 1
L_064D: CLOSE #BX  ' RT3E_21
L_0650: GOTO L_06A6
L_0653: SI = &H804E
L_0656: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_0659: GOTO L_0696
L_065C: DI = &H9412
L_065F: SI = &HBA90
L_0662: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_0665: BX = SI
L_0667: DX = BX
L_0669: BX = CINT(FAC!)  ' RT3F_77
L_066C: SI = BX
L_066E: SI = SI * (2 ^ 1)
L_0670: SI = SI * (2 ^ 1)
L_0672: SI = SI + &H4288
L_0676: SWAP DX, SI
L_0678: BX = SI
L_067A: CX = BX
L_067C: BX = CINT(N(SI))  ' RT3F_75
L_067F: DI = BX
L_0681: DI = DI * (2 ^ 1)
L_0683: DI = DI * (2 ^ 1)
L_0685: DI = DI + &H4288
L_0689: SI = DX
L_068B: SWAP S(SI), S(DI)  ' RT3F_14
L_068E: SI = CX
L_0690: DI = &H804E
L_0693: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_0696: DI = &HBA90
L_0699: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_069C: SI = DI
L_069E: DI = &HC10C
L_06A1: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_06A4: IF CompareLeft! <= CompareRight! THEN GOTO L_065C  ' flags from L_06A1
L_06A6: GOTO L_06D8
L_06A9: DI = &HBB9E
L_06AC: SI = &HC114
L_06AF: FAC! = N_C114! * N_BB9E!  ' RT3F_8F
L_06B2: DI = &HC110
L_06B5: FAC! = FAC! + N_C110!  ' RT3F_81
L_06B8: DI = &HC118
L_06BB: FAC! = FAC! + N_C118!  ' RT3F_81
L_06BE: BX = CINT(FAC!)  ' RT3F_77
L_06C1: SI = BX
L_06C3: SI = SI * (2 ^ 1)
L_06C5: SI = SI * (2 ^ 1)
L_06C7: SI = SI + &H1850
L_06CB: DI = &HC11C
L_06CE: FAC! = N(SI) + N_C11C!  ' RT3F_7F
L_06D1: BX = &H1A
L_06D4: FAC! = INT(FAC!)  ' RT3D_03
L_06D7: RETURN
L_06D8: GOTO L_06F7
L_06DB: DI = &HBB9E
L_06DE: SI = &HC124
L_06E1: FAC! = N_C124! * N_BB9E!  ' RT3F_8F
L_06E4: DI = &HC120
L_06E7: FAC! = FAC! + N_C120!  ' RT3F_81
L_06EA: DI = &HC128
L_06ED: FAC! = FAC! + N_C128!  ' RT3F_81
L_06F0: BX = &H1A
L_06F3: FAC! = INT(FAC!)  ' RT3D_03
L_06F6: RETURN
L_06F7: GOTO L_0716
L_06FA: DI = &HC130
L_06FD: SI = &H1988
L_0700: FAC! = N_1988! * N_C130!  ' RT3F_8F
L_0703: DI = &H198C
L_0706: FAC! = FAC! + N_198C!  ' RT3F_81
L_0709: DI = &HBB52
L_070C: FAC! = FAC! + N_BB52!  ' RT3F_81
L_070F: BX = &H1A
L_0712: FAC! = INT(FAC!)  ' RT3D_03
L_0715: RETURN
L_0716: SI = &HBAD4
L_0719: CompareLeft! = N_BAD4!: CompareRight! = 0  ' RT3F_A7
L_071C: IF CompareLeft! <> CompareRight! THEN GOTO L_0721  ' flags from L_0719
L_071E: GOTO L_0E36
L_0721: GOSUB L_2EFC
L_0724: BX = &H14
L_0727: ARGPUSH BX  ' RT3E_42
L_072A: BX = 2
L_072D: LOCATE ARGS(), BX  ' RT3E_44
L_0730: ' PRINT statement begins ; RT3F_BC
L_0733: BX = &HC134
L_0736: PRINT S_C134$;  ' RT3F_6A
L_0739: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_073C: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_073F: DX = &HC0EC
L_0742: S_C0EC$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0745: AX = DX
L_0747: BX = &HC148
L_074A: CompareLeft$ = S(AX): CompareRight$ = S_C148$  ' RT3F_62; H string compare from 9E1F..9E49
L_074D: CX = 0
L_0750: IF CompareLeft$ <> CompareRight$ THEN GOTO L_0753  ' flags from L_074A
L_0752: CX = CX - 1
L_0753: BX = &HC14E
L_0756: CompareLeft$ = S(AX): CompareRight$ = S_C14E$  ' RT3F_62; H string compare from 9E1F..9E49
L_0759: DX = 0
L_075C: IF CompareLeft$ <> CompareRight$ THEN GOTO L_075F  ' flags from L_0756
L_075E: DX = DX - 1
L_075F: DX = DX OR CX
L_0761: CompareLeft% = DX: CompareRight% = 0
L_0763: IF CompareLeft% = CompareRight% THEN GOTO L_0768  ' flags from L_0761
L_0765: GOTO L_0E36
L_0768: BX = &HC154
L_076B: AX = &HC0EC
L_076E: CompareLeft$ = S_C0EC$: CompareRight$ = S_C154$  ' RT3F_62; H string compare from 9E1F..9E49
L_0771: DX = 0
L_0774: IF CompareLeft$ = CompareRight$ THEN GOTO L_0777  ' flags from L_076E
L_0776: DX = DX - 1
L_0777: BX = &HC15A
L_077A: CompareLeft$ = S(AX): CompareRight$ = S_C15A$  ' RT3F_62; H string compare from 9E1F..9E49
L_077D: CX = 0
L_0780: IF CompareLeft$ = CompareRight$ THEN GOTO L_0783  ' flags from L_077A
L_0782: CX = CX - 1
L_0783: CX = CX AND DX
L_0785: CompareLeft% = CX: CompareRight% = 0
L_0787: IF CompareLeft% <> CompareRight% THEN GOTO L_073C  ' flags from L_0785
L_0789: DI = &HC120
L_078C: SI = &HC160
L_078F: N_C120! = N_C160!  ' RT3F_7B
L_0792: BX = DI
L_0794: DI = &HC124
L_0797: SI = &HBA94
L_079A: N_C124! = N_BA94!  ' RT3F_7B
L_079D: GOSUB L_06DB
L_07A0: BX = CINT(FAC!)  ' RT3F_77
L_07A3: DI = BX
L_07A5: DI = DI * (2 ^ 1)
L_07A7: DI = DI * (2 ^ 1)
L_07A9: DI = DI + &H1850
L_07AD: SI = &HC164
L_07B0: N(DI) = N_C164!  ' RT3F_7B
L_07B3: DI = &HC120
L_07B6: SI = &HC168
L_07B9: N_C120! = N_C168!  ' RT3F_7B
L_07BC: DI = &HC124
L_07BF: SI = &HC10C
L_07C2: N_C124! = N_C10C!  ' RT3F_7B
L_07C5: GOSUB L_06DB
L_07C8: BX = CINT(FAC!)  ' RT3F_77
L_07CB: DI = BX
L_07CD: DI = DI * (2 ^ 1)
L_07CF: DI = DI * (2 ^ 1)
L_07D1: DI = DI + &H1850
L_07D5: SI = &HC10C
L_07D8: N(DI) = N_C10C!  ' RT3F_7B
L_07DB: DI = &H3AE8
L_07DE: SI = &HC16C
L_07E1: N_3AE8! = N_C16C!  ' RT3F_7B
L_07E4: SI = &HC170
L_07E7: FAC! = N_C170!: DI = &H001E  ' RT3F_6F
L_07EA: GOTO L_0991
L_07ED: ' Alignment NOP
L_07EE: SI = &HBA90
L_07F1: BX = SI
L_07F3: DX = BX
L_07F5: BX = CINT(N_BA90!)  ' RT3F_75
L_07F8: DI = BX
L_07FA: DI = DI * (2 ^ 1)
L_07FC: DI = DI * (2 ^ 1)
L_07FE: DI = DI + &H1850
L_0802: FAC! = RND  ' RT3D_34
L_0805: BX = DI
L_0807: DI = &HC174
L_080A: FAC! = FAC! * N_C174!  ' RT3F_91
L_080D: DI = &H804E
L_0810: FAC! = FAC! + N_804E!  ' RT3F_81
L_0813: CX = BX
L_0815: BX = &H1A
L_0818: FAC! = INT(FAC!)  ' RT3D_03
L_081B: SWAP CX, DI
L_081D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0820: SI = DX
L_0822: DI = &HC178
L_0825: FAC! = N(SI) + N_C178!  ' RT3F_7F
L_0828: BX = CINT(FAC!)  ' RT3F_77
L_082B: DI = BX
L_082D: DI = DI * (2 ^ 1)
L_082F: DI = DI * (2 ^ 1)
L_0831: DI = DI + &H1850
L_0835: FAC! = RND  ' RT3D_34
L_0838: BX = DI
L_083A: DI = &HC10C
L_083D: FAC! = FAC! * N_C10C!  ' RT3F_91
L_0840: AX = DI
L_0842: DI = &HBB56
L_0845: FAC! = FAC! + N_BB56!  ' RT3F_81
L_0848: WORD(BP - 6) = BX
L_084B: BX = &H1A
L_084E: FAC! = INT(FAC!)  ' RT3D_03
L_0851: BX = DI
L_0853: DI = WORD(BP - 6)
L_0856: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0859: SI = DX
L_085B: DI = &HC17C
L_085E: FAC! = N(SI) + N_C17C!  ' RT3F_7F
L_0861: BX = CINT(FAC!)  ' RT3F_77
L_0864: SI = BX
L_0866: SI = SI * (2 ^ 1)
L_0868: SI = SI * (2 ^ 1)
L_086A: SI = SI + &H1850
L_086E: SWAP SI, DI
L_0870: BX = SI
L_0872: SI = &HC0F4
L_0875: N(DI) = N_C0F4!  ' RT3F_7B
L_0878: SI = DX
L_087A: DI = &HBB56
L_087D: FAC! = N(SI) + N_BB56!  ' RT3F_7F
L_0880: BX = CINT(FAC!)  ' RT3F_77
L_0883: DI = BX
L_0885: DI = DI * (2 ^ 1)
L_0887: DI = DI * (2 ^ 1)
L_0889: DI = DI + &H1850
L_088D: FAC! = RND  ' RT3D_34
L_0890: BX = DI
L_0892: DI = &HBAF4
L_0895: FAC! = FAC! * N_BAF4!  ' RT3F_91
L_0898: DI = &HC180
L_089B: FAC! = FAC! + N_C180!  ' RT3F_81
L_089E: WORD(BP - 8) = BX
L_08A1: BX = &H1A
L_08A4: FAC! = INT(FAC!)  ' RT3D_03
L_08A7: DI = WORD(BP - 8)
L_08AA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_08AD: DI = AX
L_08AF: SI = DX
L_08B1: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_08B4: BX = CINT(FAC!)  ' RT3F_77
L_08B7: DI = BX
L_08B9: DI = DI * (2 ^ 1)
L_08BB: DI = DI * (2 ^ 1)
L_08BD: DI = DI + &H1850
L_08C1: SI = &HC184
L_08C4: N(DI) = N_C184!  ' RT3F_7B
L_08C7: SWAP DX, SI
L_08C9: DI = &HBAF4
L_08CC: FAC! = N(SI) + N_BAF4!  ' RT3F_7F
L_08CF: BX = SI
L_08D1: AX = BX
L_08D3: BX = CINT(FAC!)  ' RT3F_77
L_08D6: SI = BX
L_08D8: SI = SI * (2 ^ 1)
L_08DA: SI = SI * (2 ^ 1)
L_08DC: SI = SI + &H1850
L_08E0: SWAP SI, DI
L_08E2: FAC! = RND  ' RT3D_34
L_08E5: BX = DI
L_08E7: DI = &HC188
L_08EA: FAC! = FAC! * N_C188!  ' RT3F_91
L_08ED: DI = &HC18C
L_08F0: FAC! = FAC! + N_C18C!  ' RT3F_81
L_08F3: WORD(BP - &HA) = BX
L_08F6: BX = &H1A
L_08F9: FAC! = INT(FAC!)  ' RT3D_03
L_08FC: DI = WORD(BP - &HA)
L_08FF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0902: SI = AX
L_0904: DI = &H9412
L_0907: FAC! = N(SI) + N_9412!  ' RT3F_7F
L_090A: BX = CINT(FAC!)  ' RT3F_77
L_090D: DI = BX
L_090F: DI = DI * (2 ^ 1)
L_0911: DI = DI * (2 ^ 1)
L_0913: DI = DI + &H1850
L_0917: SI = CX
L_0919: N(DI) = N(SI)  ' RT3F_7B
L_091C: DI = CX
L_091E: SWAP SI, AX
L_091F: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_0922: BX = SI
L_0924: CX = BX
L_0926: BX = CINT(FAC!)  ' RT3F_77
L_0929: DI = BX
L_092B: DI = DI * (2 ^ 1)
L_092D: DI = DI * (2 ^ 1)
L_092F: DI = DI + &H1850
L_0933: SI = &HC190
L_0936: N(DI) = N_C190!  ' RT3F_7B
L_0939: SI = CX
L_093B: DI = &HC194
L_093E: FAC! = N(SI) + N_C194!  ' RT3F_7F
L_0941: BX = CINT(FAC!)  ' RT3F_77
L_0944: DI = BX
L_0946: DI = DI * (2 ^ 1)
L_0948: DI = DI * (2 ^ 1)
L_094A: DI = DI + &H1850
L_094E: SI = &HC198
L_0951: N(DI) = N_C198!  ' RT3F_7B
L_0954: SI = CX
L_0956: DI = &HBA94
L_0959: FAC! = N(SI) + N_BA94!  ' RT3F_7F
L_095C: BX = CINT(FAC!)  ' RT3F_77
L_095F: DI = BX
L_0961: DI = DI * (2 ^ 1)
L_0963: DI = DI * (2 ^ 1)
L_0965: DI = DI + &H1850
L_0969: SI = &HC17C
L_096C: N(DI) = N_C17C!  ' RT3F_7B
L_096F: SI = CX
L_0971: DI = &HBB4A
L_0974: FAC! = N(SI) + N_BB4A!  ' RT3F_7F
L_0977: BX = CINT(FAC!)  ' RT3F_77
L_097A: DI = BX
L_097C: DI = DI * (2 ^ 1)
L_097E: DI = DI * (2 ^ 1)
L_0980: DI = DI + &H1850
L_0984: SI = &HBAF4
L_0987: N(DI) = N_BAF4!  ' RT3F_7B
L_098A: DI = DX
L_098C: SI = CX
L_098E: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_0991: DI = &HBA90
L_0994: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0997: SI = DI
L_0999: DI = &HC19C
L_099C: CompareLeft! = N_BA90!: CompareRight! = N_C19C!  ' RT3F_9F
L_099F: IF CompareLeft! > CompareRight! THEN GOTO L_09A4  ' flags from L_099C
L_09A1: GOTO L_07EE
L_09A4: SI = &HC1A0
L_09A7: FAC! = N_C1A0!: DI = &H001E  ' RT3F_6F
L_09AA: GOTO L_0A1A
L_09AD: ' Alignment NOP
L_09AE: SI = &HBA90
L_09B1: BX = SI
L_09B3: DX = BX
L_09B5: BX = CINT(N_BA90!)  ' RT3F_75
L_09B8: DI = BX
L_09BA: DI = DI * (2 ^ 1)
L_09BC: DI = DI * (2 ^ 1)
L_09BE: DI = DI + &H1850
L_09C2: FAC! = RND  ' RT3D_34
L_09C5: BX = DI
L_09C7: DI = &HC174
L_09CA: FAC! = FAC! * N_C174!  ' RT3F_91
L_09CD: DI = &H804E
L_09D0: FAC! = FAC! + N_804E!  ' RT3F_81
L_09D3: CX = BX
L_09D5: BX = &H1A
L_09D8: FAC! = INT(FAC!)  ' RT3D_03
L_09DB: DI = CX
L_09DD: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_09E0: SI = DX
L_09E2: DI = &H9412
L_09E5: FAC! = N(SI) + N_9412!  ' RT3F_7F
L_09E8: BX = CINT(FAC!)  ' RT3F_77
L_09EB: DI = BX
L_09ED: DI = DI * (2 ^ 1)
L_09EF: DI = DI * (2 ^ 1)
L_09F1: DI = DI + &H1850
L_09F5: FAC! = RND  ' RT3D_34
L_09F8: BX = DI
L_09FA: DI = &HC10C
L_09FD: FAC! = FAC! * N_C10C!  ' RT3F_91
L_0A00: DI = &HBB56
L_0A03: FAC! = FAC! + N_BB56!  ' RT3F_81
L_0A06: CX = BX
L_0A08: BX = &H1A
L_0A0B: FAC! = INT(FAC!)  ' RT3D_03
L_0A0E: SWAP CX, DI
L_0A10: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A13: DI = CX
L_0A15: SI = DX
L_0A17: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_0A1A: DI = &HBA90
L_0A1D: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0A20: SI = DI
L_0A22: DI = &HC1A4
L_0A25: CompareLeft! = N_BA90!: CompareRight! = N_C1A4!  ' RT3F_9F
L_0A28: IF CompareLeft! <= CompareRight! THEN GOTO L_09AE  ' flags from L_0A25
L_0A2A: SI = &H804E
L_0A2D: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_0A30: GOTO L_0C1D
L_0A33: ' Alignment NOP
L_0A34: DI = &HC120
L_0A37: SI = &HBFA6
L_0A3A: N_C120! = N_BFA6!  ' RT3F_7B
L_0A3D: BX = DI
L_0A3F: DI = &HC124
L_0A42: DX = SI
L_0A44: SI = &HBA90
L_0A47: N_C124! = N_BA90!  ' RT3F_7B
L_0A4A: GOSUB L_06DB
L_0A4D: BX = CINT(FAC!)  ' RT3F_77
L_0A50: DI = BX
L_0A52: DI = DI * (2 ^ 1)
L_0A54: DI = DI * (2 ^ 1)
L_0A56: DI = DI + &H1850
L_0A5A: FAC! = RND  ' RT3D_34
L_0A5D: BX = DI
L_0A5F: DI = &HC18C
L_0A62: FAC! = FAC! * N_C18C!  ' RT3F_91
L_0A65: DI = &H804E
L_0A68: FAC! = FAC! + N_804E!  ' RT3F_81
L_0A6B: DX = BX
L_0A6D: BX = &H1A
L_0A70: FAC! = INT(FAC!)  ' RT3D_03
L_0A73: SWAP DX, DI
L_0A75: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A78: DI = &HC110
L_0A7B: SI = &HBFA6
L_0A7E: N_C110! = N_BFA6!  ' RT3F_7B
L_0A81: DI = &HC114
L_0A84: SI = &HBA90
L_0A87: N_C114! = N_BA90!  ' RT3F_7B
L_0A8A: GOSUB L_06A9
L_0A8D: DI = &HC184
L_0A90: FAC! = FAC! * N_C184!  ' RT3F_91
L_0A93: BX = DI
L_0A95: DI = &HC1A8
L_0A98: FAC! = FAC! + N_C1A8!  ' RT3F_81
L_0A9B: DX = BX
L_0A9D: BX = CINT(FAC!)  ' RT3F_77
L_0AA0: DI = BX
L_0AA2: DI = DI * (2 ^ 1)
L_0AA4: DI = DI * (2 ^ 1)
L_0AA6: DI = DI + &H1850
L_0AAA: BX = DI
L_0AAC: DI = &H9412
L_0AAF: SI = &HBA90
L_0AB2: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_0AB5: DI = BX
L_0AB7: CX = SI
L_0AB9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0ABC: DI = &HC120
L_0ABF: SI = &HC1AC
L_0AC2: N_C120! = N_C1AC!  ' RT3F_7B
L_0AC5: SI = CX
L_0AC7: BX = DI
L_0AC9: DI = &HC124
L_0ACC: N_C124! = N(SI)  ' RT3F_7B
L_0ACF: GOSUB L_06DB
L_0AD2: BX = CINT(FAC!)  ' RT3F_77
L_0AD5: DI = BX
L_0AD7: DI = DI * (2 ^ 1)
L_0AD9: DI = DI * (2 ^ 1)
L_0ADB: DI = DI + &H1850
L_0ADF: FAC! = RND  ' RT3D_34
L_0AE2: BX = DI
L_0AE4: DI = &HC10C
L_0AE7: FAC! = FAC! * N_C10C!  ' RT3F_91
L_0AEA: DX = BX
L_0AEC: BX = &H1A
L_0AEF: FAC! = INT(FAC!)  ' RT3D_03
L_0AF2: DI = DX
L_0AF4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0AF7: DI = &HC120
L_0AFA: SI = &HC1B0
L_0AFD: N_C120! = N_C1B0!  ' RT3F_7B
L_0B00: BX = DI
L_0B02: DI = &HC124
L_0B05: SI = &HBA90
L_0B08: N_C124! = N_BA90!  ' RT3F_7B
L_0B0B: GOSUB L_06DB
L_0B0E: BX = CINT(FAC!)  ' RT3F_77
L_0B11: DI = BX
L_0B13: DI = DI * (2 ^ 1)
L_0B15: DI = DI * (2 ^ 1)
L_0B17: DI = DI + &H1850
L_0B1B: SI = &HC184
L_0B1E: N(DI) = N_C184!  ' RT3F_7B
L_0B21: DI = &HC120
L_0B24: BX = SI
L_0B26: SI = &HC0F0
L_0B29: N_C120! = N_C0F0!  ' RT3F_7B
L_0B2C: DX = DI
L_0B2E: DI = &HC124
L_0B31: SI = &HBA90
L_0B34: N_C124! = N_BA90!  ' RT3F_7B
L_0B37: GOSUB L_06DB
L_0B3A: BX = CINT(FAC!)  ' RT3F_77
L_0B3D: DI = BX
L_0B3F: DI = DI * (2 ^ 1)
L_0B41: DI = DI * (2 ^ 1)
L_0B43: DI = DI + &H1850
L_0B47: SI = &HC188
L_0B4A: N(DI) = N_C188!  ' RT3F_7B
L_0B4D: DI = &HC120
L_0B50: SI = &HC174
L_0B53: N_C120! = N_C174!  ' RT3F_7B
L_0B56: BX = DI
L_0B58: DI = &HC124
L_0B5B: SI = &HBA90
L_0B5E: N_C124! = N_BA90!  ' RT3F_7B
L_0B61: GOSUB L_06DB
L_0B64: BX = CINT(FAC!)  ' RT3F_77
L_0B67: DI = BX
L_0B69: DI = DI * (2 ^ 1)
L_0B6B: DI = DI * (2 ^ 1)
L_0B6D: DI = DI + &H1850
L_0B71: SI = &HC1B4
L_0B74: N(DI) = N_C1B4!  ' RT3F_7B
L_0B77: DI = &HC120
L_0B7A: SI = &HC1B8
L_0B7D: N_C120! = N_C1B8!  ' RT3F_7B
L_0B80: BX = DI
L_0B82: DI = &HC124
L_0B85: SI = &HBA90
L_0B88: N_C124! = N_BA90!  ' RT3F_7B
L_0B8B: GOSUB L_06DB
L_0B8E: BX = CINT(FAC!)  ' RT3F_77
L_0B91: DI = BX
L_0B93: DI = DI * (2 ^ 1)
L_0B95: DI = DI * (2 ^ 1)
L_0B97: DI = DI + &H1850
L_0B9B: FAC! = RND  ' RT3D_34
L_0B9E: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_0BA2: BX = &H1A
L_0BA5: FAC! = INT(FAC!)  ' RT3D_03
L_0BA8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0BAB: DI = &HC120
L_0BAE: SI = &HC184
L_0BB1: N_C120! = N_C184!  ' RT3F_7B
L_0BB4: BX = DI
L_0BB6: DI = &HC124
L_0BB9: SI = &HBA90
L_0BBC: N_C124! = N_BA90!  ' RT3F_7B
L_0BBF: GOSUB L_06DB
L_0BC2: BX = CINT(FAC!)  ' RT3F_77
L_0BC5: DI = BX
L_0BC7: DI = DI * (2 ^ 1)
L_0BC9: DI = DI * (2 ^ 1)
L_0BCB: DI = DI + &H1850
L_0BCF: FAC! = RND  ' RT3D_34
L_0BD2: BX = DI
L_0BD4: DI = &HBAF4
L_0BD7: FAC! = FAC! * N_BAF4!  ' RT3F_91
L_0BDA: DI = &HC1BC
L_0BDD: FAC! = FAC! + N_C1BC!  ' RT3F_81
L_0BE0: DX = BX
L_0BE2: BX = &H1A
L_0BE5: FAC! = INT(FAC!)  ' RT3D_03
L_0BE8: DI = DX
L_0BEA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0BED: DI = &HC120
L_0BF0: SI = &HC1C0
L_0BF3: N_C120! = N_C1C0!  ' RT3F_7B
L_0BF6: DI = &HC124
L_0BF9: SI = &HBA90
L_0BFC: N_C124! = N_BA90!  ' RT3F_7B
L_0BFF: GOSUB L_06DB
L_0C02: BX = CINT(FAC!)  ' RT3F_77
L_0C05: DI = BX
L_0C07: DI = DI * (2 ^ 1)
L_0C09: DI = DI * (2 ^ 1)
L_0C0B: DI = DI + &H1850
L_0C0F: SI = &H804E
L_0C12: N(DI) = N_804E!  ' RT3F_7B
L_0C15: DI = SI
L_0C17: SI = &HBA90
L_0C1A: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_0C1D: DI = &HBA90
L_0C20: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0C23: SI = DI
L_0C25: DI = &HC10C
L_0C28: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_0C2B: IF CompareLeft! > CompareRight! THEN GOTO L_0C30  ' flags from L_0C28
L_0C2D: GOTO L_0A34
L_0C30: DI = &H1994
L_0C33: SI = &H804E
L_0C36: N_1994! = N_804E!  ' RT3F_7B
L_0C39: SI = &HC1C4
L_0C3C: FAC! = N_C1C4!: DI = &H001E  ' RT3F_6F
L_0C3F: GOTO L_0CAE
L_0C42: SI = &HBA90
L_0C45: BX = SI
L_0C47: DX = BX
L_0C49: BX = CINT(N_BA90!)  ' RT3F_75
L_0C4C: DI = BX
L_0C4E: DI = DI * (2 ^ 1)
L_0C50: DI = DI * (2 ^ 1)
L_0C52: DI = DI + &H1850
L_0C56: FAC! = RND  ' RT3D_34
L_0C59: BX = DI
L_0C5B: DI = &HBB56
L_0C5E: FAC! = FAC! * N_BB56!  ' RT3F_91
L_0C61: CX = DI
L_0C63: DI = &HC194
L_0C66: FAC! = FAC! + N_C194!  ' RT3F_81
L_0C69: AX = BX
L_0C6B: BX = &H1A
L_0C6E: FAC! = INT(FAC!)  ' RT3D_03
L_0C71: DI = AX
L_0C73: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0C76: SI = DX
L_0C78: DI = &H9412
L_0C7B: FAC! = N(SI) + N_9412!  ' RT3F_7F
L_0C7E: BX = CINT(FAC!)  ' RT3F_77
L_0C81: DI = BX
L_0C83: DI = DI * (2 ^ 1)
L_0C85: DI = DI * (2 ^ 1)
L_0C87: DI = DI + &H1850
L_0C8B: FAC! = RND  ' RT3D_34
L_0C8E: BX = DI
L_0C90: DI = &HC10C
L_0C93: FAC! = FAC! * N_C10C!  ' RT3F_91
L_0C96: DI = CX
L_0C98: FAC! = FAC! + N(DI)  ' RT3F_81
L_0C9B: AX = BX
L_0C9D: BX = &H1A
L_0CA0: FAC! = INT(FAC!)  ' RT3D_03
L_0CA3: SWAP DI, AX
L_0CA4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0CA7: DI = AX
L_0CA9: SI = DX
L_0CAB: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_0CAE: DI = &HBA90
L_0CB1: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0CB4: SI = DI
L_0CB6: DI = &HC1C8
L_0CB9: CompareLeft! = N_BA90!: CompareRight! = N_C1C8!  ' RT3F_9F
L_0CBC: IF CompareLeft! <= CompareRight! THEN GOTO L_0C42  ' flags from L_0CB9
L_0CBE: SI = &H804E
L_0CC1: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_0CC4: GOTO L_0DA1
L_0CC7: ' Alignment NOP
L_0CC8: DI = &HC120
L_0CCB: SI = &HC1CC
L_0CCE: N_C120! = N_C1CC!  ' RT3F_7B
L_0CD1: BX = DI
L_0CD3: DI = &HC124
L_0CD6: SI = &HBA90
L_0CD9: N_C124! = N_BA90!  ' RT3F_7B
L_0CDC: GOSUB L_06DB
L_0CDF: BX = CINT(FAC!)  ' RT3F_77
L_0CE2: DI = BX
L_0CE4: DI = DI * (2 ^ 1)
L_0CE6: DI = DI * (2 ^ 1)
L_0CE8: DI = DI + &H1850
L_0CEC: SI = &HBA94
L_0CEF: N(DI) = N_BA94!  ' RT3F_7B
L_0CF2: DI = &HC120
L_0CF5: SI = &HC1BC
L_0CF8: N_C120! = N_C1BC!  ' RT3F_7B
L_0CFB: BX = DI
L_0CFD: DI = &HC124
L_0D00: SI = &HBA90
L_0D03: N_C124! = N_BA90!  ' RT3F_7B
L_0D06: GOSUB L_06DB
L_0D09: BX = CINT(FAC!)  ' RT3F_77
L_0D0C: DI = BX
L_0D0E: DI = DI * (2 ^ 1)
L_0D10: DI = DI * (2 ^ 1)
L_0D12: DI = DI + &H1850
L_0D16: SI = &HC18C
L_0D19: N(DI) = N_C18C!  ' RT3F_7B
L_0D1C: DI = &HC120
L_0D1F: SI = &HBF9E
L_0D22: N_C120! = N_BF9E!  ' RT3F_7B
L_0D25: BX = DI
L_0D27: DI = &HC124
L_0D2A: SI = &HBA90
L_0D2D: N_C124! = N_BA90!  ' RT3F_7B
L_0D30: GOSUB L_06DB
L_0D33: BX = CINT(FAC!)  ' RT3F_77
L_0D36: DI = BX
L_0D38: DI = DI * (2 ^ 1)
L_0D3A: DI = DI * (2 ^ 1)
L_0D3C: DI = DI + &H1850
L_0D40: SI = &HC190
L_0D43: N(DI) = N_C190!  ' RT3F_7B
L_0D46: DI = &HC120
L_0D49: SI = &HC0F4
L_0D4C: N_C120! = N_C0F4!  ' RT3F_7B
L_0D4F: BX = DI
L_0D51: DI = &HC124
L_0D54: SI = &HBA90
L_0D57: N_C124! = N_BA90!  ' RT3F_7B
L_0D5A: GOSUB L_06DB
L_0D5D: BX = CINT(FAC!)  ' RT3F_77
L_0D60: DI = BX
L_0D62: DI = DI * (2 ^ 1)
L_0D64: DI = DI * (2 ^ 1)
L_0D66: DI = DI + &H1850
L_0D6A: SI = &HBB9E
L_0D6D: N(DI) = N_BB9E!  ' RT3F_7B
L_0D70: DI = &HC120
L_0D73: SI = &HC1AC
L_0D76: N_C120! = N_C1AC!  ' RT3F_7B
L_0D79: DI = &HC124
L_0D7C: SI = &HBA90
L_0D7F: N_C124! = N_BA90!  ' RT3F_7B
L_0D82: GOSUB L_06DB
L_0D85: BX = CINT(FAC!)  ' RT3F_77
L_0D88: DI = BX
L_0D8A: DI = DI * (2 ^ 1)
L_0D8C: DI = DI * (2 ^ 1)
L_0D8E: DI = DI + &H1850
L_0D92: SI = &HC17C
L_0D95: N(DI) = N_C17C!  ' RT3F_7B
L_0D98: DI = &H804E
L_0D9B: SI = &HBA90
L_0D9E: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_0DA1: DI = &HBA90
L_0DA4: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0DA7: SI = DI
L_0DA9: DI = &HC10C
L_0DAC: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_0DAF: IF CompareLeft! > CompareRight! THEN GOTO L_0DB4  ' flags from L_0DAC
L_0DB1: GOTO L_0CC8
L_0DB4: DI = &HBAEC
L_0DB7: SI = &H804E
L_0DBA: N_BAEC! = N_804E!  ' RT3F_7B
L_0DBD: DI = &H1D2C
L_0DC0: SI = &HC1D0
L_0DC3: N_1D2C! = N_C1D0!  ' RT3F_7B
L_0DC6: DI = &H1BFC
L_0DC9: SI = &HC1D4
L_0DCC: N_1BFC! = N_C1D4!  ' RT3F_7B
L_0DCF: DI = &H1CC4
L_0DD2: SI = &HC1D8
L_0DD5: N_1CC4! = N_C1D8!  ' RT3F_7B
L_0DD8: DI = &H1868
L_0DDB: SI = &H804E
L_0DDE: N_1868! = N_804E!  ' RT3F_7B
L_0DE1: DI = &HBAF0
L_0DE4: SI = &HBB4A
L_0DE7: N_BAF0! = N_BB4A!  ' RT3F_7B
L_0DEA: DI = &HC120
L_0DED: SI = &HC1C0
L_0DF0: N_C120! = N_C1C0!  ' RT3F_7B
L_0DF3: DI = &HC124
L_0DF6: SI = &HC10C
L_0DF9: N_C124! = N_C10C!  ' RT3F_7B
L_0DFC: GOSUB L_06DB
L_0DFF: BX = CINT(FAC!)  ' RT3F_77

```

### Encounter and graphics preparation

```basic
L_0E02: DI = BX
L_0E04: DI = DI * (2 ^ 1)
L_0E06: DI = DI * (2 ^ 1)
L_0E08: DI = DI + &H1850
L_0E0C: SI = &HC1DC
L_0E0F: N(DI) = N_C1DC!  ' RT3F_7B
L_0E12: DI = &HBB42
L_0E15: SI = &H9412
L_0E18: N_BB42! = N_9412!  ' RT3F_7B
L_0E1B: DI = &HC1E0
L_0E1E: SI = &HBB4A
L_0E21: N_C1E0! = N_BB4A!  ' RT3F_7B
L_0E24: DI = &H3B7C
L_0E27: SI = &HC10C
L_0E2A: N_3B7C! = N_C10C!  ' RT3F_7B
L_0E2D: DI = &H3AE8
L_0E30: SI = &HC1E4
L_0E33: N_3AE8! = N_C1E4!  ' RT3F_7B
L_0E36: FAC! = TIMER  ' RT3D_43
L_0E39: BX = &H1A
L_0E3C: RANDOMIZE FAC!  ' RT3E_09
L_0E3F: DI = &HC634
L_0E42: SI = &HC640
L_0E45: N_C634! = N_C640!  ' RT3F_7B
L_0E48: DI = &HC638
L_0E4B: SI = &H3AE8
L_0E4E: N_C638! = N_3AE8!  ' RT3F_7B
L_0E51: DI = &HC63C
L_0E54: SI = &H804E
L_0E57: N_C63C! = N_804E!  ' RT3F_7B
L_0E5A: BX = 0
L_0E5C: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_0E5F: DX = BX
L_0E61: BX = &HC644
L_0E64: AX = &H9404
L_0E67: BX = TEMP_DESC(S_9404$ + S_C644$)  ' BX receives a temporary descriptor  ' RT3F_55
L_0E6A: SWAP BX, DX
L_0E6C: CX = BX
L_0E6E: BX = 1
L_0E71: OPEN S(DX) FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_0E74: DI = &HC650
L_0E77: SI = &HBB46
L_0E7A: N_C650! = N_BB46!  ' RT3F_7B
L_0E7D: DI = &HC654
L_0E80: SI = &HC638
L_0E83: N_C654! = N_C638!  ' RT3F_7B
L_0E86: SI = &HC650
L_0E89: FAC! = N_C650!: DI = &H001E  ' RT3F_6F
L_0E8C: GOTO L_0FB3
L_0E8F: ' Alignment NOP
L_0E90: BX = 1
L_0E93: InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0E96: InputTypes = [4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]: INPUT #InputFile%, BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0EB6: SI = &HC634
L_0EB9: BX = CINT(N_C634!)  ' RT3F_75
L_0EBC: BX = BX * (2 ^ 1)
L_0EBE: BX = BX * (2 ^ 1)
L_0EC0: DX = BX
L_0EC2: BX = BX + &HC1E8
L_0EC6: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0EC9: BX = &HC658
L_0ECC: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0ECF: BX = &HC65C
L_0ED2: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0ED5: BX = DX
L_0ED7: DX = DX + &HC248
L_0EDB: SWAP DX, BX
L_0EDD: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0EE0: BX = &HC660
L_0EE3: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0EE6: BX = DX
L_0EE8: DX = DX + &HC2A8
L_0EEC: SWAP DX, BX
L_0EEE: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0EF1: BX = &HC664
L_0EF4: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0EF7: BX = &HC668
L_0EFA: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0EFD: BX = &HC66C
L_0F00: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F03: BX = DX
L_0F05: DX = DX + &HC5D4
L_0F09: SWAP DX, BX
L_0F0B: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F0E: BX = DX
L_0F10: DX = DX + &HC308
L_0F14: SWAP DX, BX
L_0F16: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F19: BX = DX
L_0F1B: DX = DX + &HC318
L_0F1F: SWAP DX, BX
L_0F21: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F24: BX = DX
L_0F26: DX = DX + &HC328
L_0F2A: SWAP DX, BX
L_0F2C: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F2F: BX = DX
L_0F31: DX = DX + &HC338
L_0F35: SWAP DX, BX
L_0F37: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F3A: BX = DX
L_0F3C: DX = DX + &HC348
L_0F40: SWAP DX, BX
L_0F42: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F45: BX = &HC670
L_0F48: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F4B: BX = DX
L_0F4D: DX = DX + &HC368
L_0F51: SWAP DX, BX
L_0F53: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F56: BX = &HC674
L_0F59: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F5C: BX = DX
L_0F5E: DX = DX + &HC358
L_0F62: SWAP DX, BX
L_0F64: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F67: BX = &HC678
L_0F6A: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F6D: BX = DX
L_0F6F: DX = DX + &HC378
L_0F73: SWAP DX, BX
L_0F75: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F78: BX = &HC67C
L_0F7B: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F7E: BX = &HC680
L_0F81: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F84: BX = &HC684
L_0F87: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F8A: BX = &HC688
L_0F8D: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F90: BX = &HC68C
L_0F93: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0F96: BX = DX
L_0F98: DX = DX + &HC614
L_0F9C: SWAP DX, BX
L_0F9E: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0FA1: DX = DX + &HC624
L_0FA5: BX = DX
L_0FA7: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0FAA: DI = &H804E
L_0FAD: SI = &HBA90
L_0FB0: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_0FB3: DI = &HBA90
L_0FB6: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_0FB9: SI = DI
L_0FBB: DI = &HC654
L_0FBE: CompareLeft! = N_BA90!: CompareRight! = N_C654!  ' RT3F_9F
L_0FC1: IF CompareLeft! > CompareRight! THEN GOTO L_0FC6  ' flags from L_0FBE
L_0FC3: GOTO L_0E90
L_0FC6: DI = &HC650
L_0FC9: SI = &HBA90
L_0FCC: N_C650! = N_BA90!  ' RT3F_7B
L_0FCF: SI = &HC634
L_0FD2: BX = CINT(N_C634!)  ' RT3F_75
L_0FD5: DI = BX
L_0FD7: DI = DI * (2 ^ 1)
L_0FD9: DI = DI * (2 ^ 1)
L_0FDB: BX = DI
L_0FDD: DI = DI + &HC560
L_0FE1: SI = &HBA94
L_0FE4: N(DI) = N_BA94!  ' RT3F_7B
L_0FE7: DX = BX
L_0FE9: BX = BX + &HC518
L_0FED: DI = BX
L_0FEF: FAC! = RND  ' RT3D_34
L_0FF2: DI = &HC69C
L_0FF5: FAC! = FAC! * N_C69C!  ' RT3F_91
L_0FF8: DI = &HC1D0
L_0FFB: FAC! = FAC! + N_C1D0!  ' RT3F_81
L_0FFE: CX = BX
L_1000: BX = &H1A
L_1003: FAC! = INT(FAC!)  ' RT3D_03
L_1006: DI = CX
L_1008: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_100B: DX = DX + &HC53C
L_100F: DI = DX
L_1011: FAC! = RND  ' RT3D_34
L_1014: DI = &HC194
L_1017: FAC! = FAC! * N_C194!  ' RT3F_91
L_101A: DI = &HC0F4
L_101D: FAC! = FAC! + N_C0F4!  ' RT3F_81
L_1020: BX = &H1A
L_1023: FAC! = INT(FAC!)  ' RT3D_03
L_1026: DI = DX
L_1028: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_102B: DI = &HC6A0
L_102E: SI = &HC65C
L_1031: FAC! = N_C65C! * N_C6A0!  ' RT3F_8F
L_1034: DI = &HC690
L_1037: BX = SI
L_1039: N_C690! = FAC!: SI = &H001A  ' RT3F_7D
L_103C: SI = BX
L_103E: DI = &HC6A4
L_1041: FAC! = N(SI) * N_C6A4!  ' RT3F_8F
L_1044: DI = &HC694
L_1047: N_C694! = FAC!: SI = &H001A  ' RT3F_7D
L_104A: SI = BX
L_104C: DI = &HC6A8
L_104F: FAC! = N(SI) * N_C6A8!  ' RT3F_8F
L_1052: DI = &HC698
L_1055: N_C698! = FAC!: SI = &H001A  ' RT3F_7D
L_1058: DI = &HC6B0
L_105B: SI = &HC634
L_105E: FAC! = N_C634! + N_C6B0!  ' RT3F_7F
L_1061: DI = &HC6AC
L_1064: N_C6AC! = FAC!: SI = &H001A  ' RT3F_7D
L_1067: SI = &HC6B4
L_106A: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_106D: GOTO L_10D5
L_1070: SI = &HC6B8
L_1073: BX = SI
L_1075: DX = BX
L_1077: BX = CINT(N_C6B8!)  ' RT3F_75
L_107A: SI = BX
L_107C: SI = SI * (2 ^ 1)
L_107E: SI = SI * (2 ^ 1)
L_1080: BX = SI
L_1082: SI = SI + &HC518
L_1086: CX = SI
L_1088: SI = &HC634
L_108B: AX = BX
L_108D: BX = CINT(N_C634!)  ' RT3F_75
L_1090: DI = BX
L_1092: DI = DI * (2 ^ 1)
L_1094: DI = DI * (2 ^ 1)
L_1096: BX = DI
L_1098: DI = DI + &HC518
L_109C: SI = CX
L_109E: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_10A1: CX = 0
L_10A4: IF CompareLeft! <> CompareRight! THEN GOTO L_10A7  ' flags from L_109E
L_10A6: CX = CX - 1
L_10A7: AX = AX + &HC53C
L_10AA: SI = AX
L_10AC: BX = BX + &HC53C
L_10B0: DI = BX
L_10B2: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_10B5: BX = 0
L_10B8: IF CompareLeft! <> CompareRight! THEN GOTO L_10BB  ' flags from L_10B2
L_10BA: BX = BX - 1
L_10BB: BX = BX AND CX
L_10BD: CompareLeft% = BX: CompareRight% = 0
L_10BF: IF CompareLeft% <> CompareRight% THEN GOTO L_10C4  ' flags from L_10BD
L_10C1: GOTO L_10CC
L_10C4: DI = DX
L_10C6: SI = &HC178
L_10C9: N(DI) = N_C178!  ' RT3F_7B
L_10CC: DI = &H804E
L_10CF: SI = &HC6B8
L_10D2: FAC! = N_C6B8! + N_804E!  ' RT3F_7F
L_10D5: DI = &HC6B8
L_10D8: N_C6B8! = FAC!: SI = &H001A  ' RT3F_7D
L_10DB: SI = DI
L_10DD: DI = &HC6AC
L_10E0: CompareLeft! = N_C6B8!: CompareRight! = N_C6AC!  ' RT3F_9F
L_10E3: IF CompareLeft! <= CompareRight! THEN GOTO L_1070  ' flags from L_10E0
L_10E5: DI = &HC17C
L_10E8: SI = &HC6B8
L_10EB: CompareLeft! = N_C6B8!: CompareRight! = N_C17C!  ' RT3F_9F
L_10EE: IF CompareLeft! <= CompareRight! THEN GOTO L_10F3  ' flags from L_10EB
L_10F0: GOTO L_0FCF
L_10F3: SI = &HC634
L_10F6: BX = CINT(N_C634!)  ' RT3F_75
L_10F9: DI = BX
L_10FB: DI = DI * (2 ^ 1)
L_10FD: DI = DI * (2 ^ 1)
L_10FF: DI = DI + &HC604
L_1103: FAC! = RND  ' RT3D_34
L_1106: BX = DI
L_1108: DI = &H9412
L_110B: FAC! = FAC! ^ N_9412!  ' RT3F_25; M ledger
L_110E: SI = &H804E
L_1111: FAC! = N_804E! - FAC!  ' RT3F_9B
L_1114: DI = &HC658
L_1117: DX = SI
L_1119: FAC! = FAC! * N_C658!  ' RT3F_91
L_111C: DI = DX
L_111E: FAC! = FAC! + N(DI)  ' RT3F_81
L_1121: DX = BX
L_1123: BX = &H1A
L_1126: FAC! = INT(FAC!)  ' RT3D_03
L_1129: DI = DX
L_112B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_112E: SI = DX
L_1130: DI = &HC0F4
L_1133: CompareLeft! = N(SI): CompareRight! = N_C0F4!  ' RT3F_9F
L_1136: IF CompareLeft! > CompareRight! THEN GOTO L_113B  ' flags from L_1133
L_1138: GOTO L_1140
L_113B: SWAP SI, DI
L_113D: N(DI) = N(SI)  ' RT3F_7B
L_1140: SI = &HC634
L_1143: BX = CINT(N_C634!)  ' RT3F_75
L_1146: BX = BX * (2 ^ 1)
L_1148: BX = BX * (2 ^ 1)
L_114A: BX = BX + &HC1E8
L_114E: DX = BX
L_1150: BX = LEN(S(BX))  ' RT3F_BA
L_1153: FAC! = CSNG(BX)  ' RT3F_57
L_1156: DI = &HBB52
L_1159: FAC! = FAC! * N_BB52!  ' RT3F_91
L_115C: DI = &H804E
L_115F: FAC! = FAC! + N_804E!  ' RT3F_81
L_1162: BX = DI
L_1164: DI = &HC6BC
L_1167: N_C6BC! = FAC!: SI = &H001A  ' RT3F_7D
L_116A: SWAP DX, BX
L_116C: CX = DX
L_116E: DX = &HC6C8
L_1171: AX = BX
L_1173: BX = INSTR(S(BX), S_C6C8$)  ' RT3D_09
L_1176: FAC! = CSNG(BX)  ' RT3F_57
L_1179: BX = DI
L_117B: DI = &HC6C0
L_117E: N_C6C0! = FAC!: SI = &H001A  ' RT3F_7D
L_1181: SWAP CX, DI
L_1183: SI = CX
L_1185: FAC! = N_C6C0! + N(DI)  ' RT3F_7F
L_1188: BX = CINT(FAC!)  ' RT3F_77
L_118B: SWAP DX, AX
L_118C: SWAP CX, AX
L_118D: BX = INSTR(BX, S(DX), S(CX))  ' RT3D_08
L_1190: FAC! = CSNG(BX)  ' RT3F_57
L_1193: DI = &HC6C4
L_1196: N_C6C4! = FAC!: SI = &H001A  ' RT3F_7D
L_1199: SI = DI
L_119B: DI = &HC6BC
L_119E: FAC! = N_C6C4! - N_C6BC!  ' RT3F_97
L_11A1: FAC! = ABS(FAC!)  ' RT3F_2D
L_11A4: SWAP SI, AX
L_11A5: T_01! = FAC!  ' RT3F_71; inline=&H81
L_11A9: FAC! = N(SI) - N(DI)  ' RT3F_97
L_11AC: FAC! = ABS(FAC!)  ' RT3F_2D
L_11AF: BX = SI
L_11B1: CompareLeft! = T_01!: CompareRight! = FAC!  ' RT3F_A5; inline=&H81
L_11B5: IF CompareLeft! < CompareRight! THEN GOTO L_11BA  ' flags from L_11B1
L_11B7: GOTO L_11C1
L_11BA: DI = BX
L_11BC: SI = AX
L_11BE: N(DI) = N(SI)  ' RT3F_7B
L_11C1: SI = &HC6C0
L_11C4: CompareLeft! = N_C6C0!: CompareRight! = 0  ' RT3F_A7
L_11C7: IF CompareLeft! = CompareRight! THEN GOTO L_11CC  ' flags from L_11C4
L_11C9: GOTO L_11F6
L_11CC: SI = &HC634
L_11CF: BX = CINT(N_C634!)  ' RT3F_75
L_11D2: BX = BX * (2 ^ 1)
L_11D4: BX = BX * (2 ^ 1)
L_11D6: DX = BX
L_11D8: BX = BX + &HC5E4
L_11DC: CX = DX
L_11DE: DX = DX + &HC1E8
L_11E2: SWAP BX, DX
L_11E4: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_11E7: CX = CX + &HC5F4
L_11EB: DX = CX
L_11ED: BX = &H9408
L_11F0: S(DX) = S_9408$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_11F3: GOTO L_124E
L_11F6: SI = &HC634
L_11F9: BX = CINT(N_C634!)  ' RT3F_75
L_11FC: BX = BX * (2 ^ 1)
L_11FE: BX = BX * (2 ^ 1)
L_1200: DX = BX
L_1202: BX = BX + &HC5E4
L_1206: DI = &HC6B0
L_1209: SI = &HC6C0
L_120C: FAC! = N_C6C0! + N_C6B0!  ' RT3F_7F
L_120F: CX = SI
L_1211: AX = BX
L_1213: BX = CINT(FAC!)  ' RT3F_77
L_1216: WORD(BP - 6) = DX
L_1219: DX = DX + &HC1E8
L_121D: SWAP BX, DX
L_121F: WORD(BP - 8) = BX
L_1222: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_1225: DX = AX
L_1227: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_122A: DX = WORD(BP - 6)
L_122D: DX = DX + &HC5F4
L_1231: SI = CX
L_1233: DI = &H804E
L_1236: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_1239: BX = CINT(FAC!)  ' RT3F_77
L_123C: SWAP BX, DX
L_123E: AX = BX
L_1240: BX = WORD(BP - 8)
L_1243: CX = &HB
L_1246: BX = TEMP_DESC(MID$(S(BX), DX, CX))  ' BX receives a temporary descriptor  ' RT3D_0A
L_1249: DX = AX
L_124B: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_124E: DI = &HBAF4
L_1251: SI = &H3B20
L_1254: CompareLeft! = N_3B20!: CompareRight! = N_BAF4!  ' RT3F_9F
L_1257: BX = 0
L_125A: IF CompareLeft! <> CompareRight! THEN GOTO L_125D  ' flags from L_1254
L_125C: BX = BX - 1
L_125D: DI = &HBB56
L_1260: SI = &HC308
L_1263: CompareLeft! = N_C308!: CompareRight! = N_BB56!  ' RT3F_9F
L_1266: DX = 0
L_1269: IF CompareLeft! = CompareRight! THEN GOTO L_126C  ' flags from L_1263
L_126B: DX = DX - 1
L_126C: DX = DX AND BX
L_126E: CompareLeft% = DX: CompareRight% = 0
L_1270: IF CompareLeft% <> CompareRight% THEN GOTO L_1275  ' flags from L_126E
L_1272: GOTO L_12E7
L_1275: SI = &H3B7C
L_1278: CompareLeft! = N_3B7C!: CompareRight! = N(DI)  ' RT3F_9F
L_127B: BX = 0
L_127E: IF CompareLeft! <= CompareRight! THEN GOTO L_1281  ' flags from L_1278
L_1280: BX = BX - 1
L_1281: CompareLeft% = BX: CompareRight% = 0
L_1283: IF CompareLeft% >= CompareRight% THEN GOTO L_1287  ' flags from L_1281
L_1285: BX = -BX
L_1287: AX = BX
L_1289: DX = &H64
L_128C: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_128E: BX = AX
L_1290: FAC! = CSNG(BX)  ' RT3F_57
L_1293: BX = DI
L_1295: DI = &HC680
L_1298: DX = SI
L_129A: N_C680! = FAC!: SI = &H001A  ' RT3F_7D
L_129D: SI = &HC634
L_12A0: CX = BX
L_12A2: BX = CINT(N_C634!)  ' RT3F_75
L_12A5: SI = BX
L_12A7: SI = SI * (2 ^ 1)
L_12A9: SI = SI * (2 ^ 1)
L_12AB: SI = SI + &HC604
L_12AF: SWAP SI, DI
L_12B1: SWAP DX, SI
L_12B3: N(DI) = N(SI)  ' RT3F_7B
L_12B6: BX = DI
L_12B8: DI = &HC684
L_12BB: AX = SI
L_12BD: SI = &HC638
L_12C0: N_C684! = N_C638!  ' RT3F_7B
L_12C3: DI = &HC688
L_12C6: N_C688! = N_C638!  ' RT3F_7B
L_12C9: SI = AX
L_12CB: DI = &HC6CE
L_12CE: FAC! = N(SI) + N_C6CE!  ' RT3F_7F
L_12D1: DI = AX
L_12D3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_12D6: SI = DX
L_12D8: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_12DB: IF CompareLeft! > CompareRight! THEN GOTO L_12E0  ' flags from L_12D8
L_12DD: GOTO L_12E7
L_12E0: DI = BX
L_12E2: SI = CX
L_12E4: N(DI) = N(SI)  ' RT3F_7B
L_12E7: DI = &HC6DC
L_12EA: SI = &HC634
L_12ED: FAC! = N_C634! + N_C6DC!  ' RT3F_7F
L_12F0: BX = SI
L_12F2: DX = BX
L_12F4: BX = CINT(FAC!)  ' RT3F_77
L_12F7: ARGPUSH BX  ' RT3E_42
L_12FA: BX = 1
L_12FD: LOCATE ARGS(), BX  ' RT3E_44
L_1300: ' PRINT statement begins ; RT3F_BC
L_1303: BX = &HC6D2
L_1306: PRINT S_C6D2$;  ' RT3F_6A
L_1309: SI = DX
L_130B: DI = &HC6E0
L_130E: FAC! = N(SI) + N_C6E0!  ' RT3F_7F
L_1311: BX = CINT(FAC!)  ' RT3F_77
L_1314: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_1317: PRINT S(BX);  ' RT3F_6A
L_131A: BX = &HC6E4
L_131D: PRINT S_C6E4$;  ' RT3F_6A
L_1320: SI = DX
L_1322: BX = CINT(N(SI))  ' RT3F_75
L_1325: BX = BX * (2 ^ 1)
L_1327: BX = BX * (2 ^ 1)
L_1329: DX = BX
L_132B: BX = BX + &HC604
L_132F: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_1332: DX = DX + &HC1E8
L_1336: SWAP DX, BX
L_1338: PRINT S(BX);  ' RT3F_6A
L_133B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_133E: SI = DX
L_1340: DI = &H804E
L_1343: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_1346: IF CompareLeft! > CompareRight! THEN GOTO L_134B  ' flags from L_1343
L_1348: GOTO L_1357
L_134B: ' PRINT statement begins ; RT3F_BC
L_134E: BX = &HC6EA
L_1351: PRINT S_C6EA$  ' RT3F_6E; H newline item, ledger correction
L_1354: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1357: SI = &HC634
L_135A: BX = CINT(N_C634!)  ' RT3F_75
L_135D: SI = BX
L_135F: SI = SI * (2 ^ 1)
L_1361: SI = SI * (2 ^ 1)
L_1363: SI = SI + &HC604
L_1367: DI = &HC6B0
L_136A: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_136D: DI = &HC6F2
L_1370: N_C6F2! = FAC!: SI = &H001A  ' RT3F_7D
L_1373: SI = &HC6B4
L_1376: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_1379: GOTO L_15B8
L_137C: SI = &HC634
L_137F: BX = CINT(N_C634!)  ' RT3F_75
L_1382: AX = BX
L_1384: DI = 5
L_1387: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_1389: DI = AX
L_138B: SI = &HBA90
L_138E: BX = CINT(N_BA90!)  ' RT3F_75
L_1391: DI = DI + BX
L_1393: DI = DI * (2 ^ 1)
L_1395: DI = DI * (2 ^ 1)
L_1397: BX = DI
L_1399: DI = DI + &HC1F8
L_139D: FAC! = RND  ' RT3D_34
L_13A0: DX = DI
L_13A2: DI = &HC6A8
L_13A5: FAC! = FAC! * N_C6A8!  ' RT3F_91
L_13A8: DI = &HC6A4
L_13AB: FAC! = FAC! + N_C6A4!  ' RT3F_81
L_13AE: DI = &HC65C
L_13B1: FAC! = FAC! * N_C65C!  ' RT3F_91
L_13B4: DI = DX
L_13B6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_13B9: DX = BX
L_13BB: BX = BX + &HC258
L_13BF: DI = BX
L_13C1: SI = &HC660
L_13C4: N(DI) = N_C660!  ' RT3F_7B
L_13C7: BX = DX
L_13C9: DX = DX + &HC2B8
L_13CD: DI = DX
L_13CF: FAC! = RND  ' RT3D_34
L_13D2: DI = &HBB52
L_13D5: FAC! = FAC! * N_BB52!  ' RT3F_91
L_13D8: DI = &HC6F6
L_13DB: FAC! = FAC! + N_C6F6!  ' RT3F_81
L_13DE: DI = &HC664
L_13E1: FAC! = FAC! * N_C664!  ' RT3F_91
L_13E4: DI = DX
L_13E6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_13E9: BX = BX + &HC4C8
L_13ED: DI = BX
L_13EF: SI = &H804E
L_13F2: N(DI) = N_804E!  ' RT3F_7B
L_13F5: FAC! = RND  ' RT3D_34
L_13F8: DI = &HBB9E
L_13FB: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_13FE: DI = &HC670
L_1401: CompareLeft! = FAC!: CompareRight! = N_C670!  ' RT3F_A1
L_1404: IF CompareLeft! > CompareRight! THEN GOTO L_1409  ' flags from L_1401
L_1406: GOTO L_1431
L_1409: SI = &HC634
L_140C: BX = CINT(N_C634!)  ' RT3F_75
L_140F: AX = BX
L_1411: DI = 5
L_1414: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_1416: DI = AX
L_1418: SI = &HBA90
L_141B: BX = CINT(N_BA90!)  ' RT3F_75
L_141E: DI = DI + BX
L_1420: DI = DI * (2 ^ 1)
L_1422: DI = DI * (2 ^ 1)
L_1424: DI = DI + &HC388
L_1428: SI = &HC6FA
L_142B: N(DI) = N_C6FA!  ' RT3F_7B
L_142E: GOTO L_14AC
L_1431: SI = &HC634
L_1434: BX = CINT(N_C634!)  ' RT3F_75
L_1437: AX = BX
L_1439: DI = 5
L_143C: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_143E: DI = AX
L_1440: SI = &HBA90
L_1443: BX = CINT(N_BA90!)  ' RT3F_75
L_1446: DI = DI + BX
L_1448: DI = DI * (2 ^ 1)
L_144A: DI = DI * (2 ^ 1)
L_144C: BX = DI
L_144E: DI = DI + &HC388
L_1452: FAC! = RND  ' RT3D_34
L_1455: DX = DI
L_1457: DI = &HC6A4
L_145A: FAC! = FAC! * N_C6A4!  ' RT3F_91
L_145D: DI = &HBB52
L_1460: FAC! = FAC! + N_BB52!  ' RT3F_81
L_1463: CX = DI
L_1465: DI = &HC674
L_1468: FAC! = FAC! * N_C674!  ' RT3F_91
L_146B: DI = CX
L_146D: FAC! = FAC! + N(DI)  ' RT3F_81
L_1470: AX = BX
L_1472: BX = &H1A
L_1475: FAC! = INT(FAC!)  ' RT3D_03
L_1478: SWAP DX, DI
L_147A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_147D: FAC! = RND  ' RT3D_34
L_1480: DI = CX
L_1482: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_1485: BX = 0
L_1488: IF CompareLeft! >= CompareRight! THEN GOTO L_148B  ' flags from L_1482
L_148A: BX = BX - 1
L_148B: DI = &H804E
L_148E: SI = &HC68C
L_1491: CompareLeft! = N_C68C!: CompareRight! = N_804E!  ' RT3F_9F
L_1494: DX = 0
L_1497: IF CompareLeft! >= CompareRight! THEN GOTO L_149A  ' flags from L_1491
L_1499: DX = DX - 1
L_149A: DX = DX OR BX
L_149C: CompareLeft% = DX: CompareRight% = 0
L_149E: IF CompareLeft% <> CompareRight% THEN GOTO L_14A3  ' flags from L_149C
L_14A0: GOTO L_14AC
L_14A3: AX = AX + &HC428
L_14A6: SWAP DI, AX
L_14A7: SI = AX
L_14A9: N(DI) = N(SI)  ' RT3F_7B
L_14AC: FAC! = RND  ' RT3D_34
L_14AF: DI = &HBB9E
L_14B2: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_14B5: DI = &HC678
L_14B8: CompareLeft! = FAC!: CompareRight! = N_C678!  ' RT3F_A1
L_14BB: IF CompareLeft! > CompareRight! THEN GOTO L_14C0  ' flags from L_14B8
L_14BD: GOTO L_14E8
L_14C0: SI = &HC634
L_14C3: BX = CINT(N_C634!)  ' RT3F_75
L_14C6: AX = BX
L_14C8: DI = 5
L_14CB: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_14CD: DI = AX
L_14CF: SI = &HBA90
L_14D2: BX = CINT(N_BA90!)  ' RT3F_75
L_14D5: DI = DI + BX
L_14D7: DI = DI * (2 ^ 1)
L_14D9: DI = DI * (2 ^ 1)
L_14DB: DI = DI + &HC3D8
L_14DF: SI = &HC6FA
L_14E2: N(DI) = N_C6FA!  ' RT3F_7B
L_14E5: GOTO L_1565
L_14E8: SI = &HC634
L_14EB: BX = CINT(N_C634!)  ' RT3F_75
L_14EE: AX = BX
L_14F0: DI = 5
L_14F3: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_14F5: DI = AX
L_14F7: SI = &HBA90
L_14FA: BX = CINT(N_BA90!)  ' RT3F_75
L_14FD: DI = DI + BX
L_14FF: DI = DI * (2 ^ 1)
L_1501: DI = DI * (2 ^ 1)
L_1503: BX = DI
L_1505: DI = DI + &HC3D8
L_1509: FAC! = RND  ' RT3D_34
L_150C: DX = DI
L_150E: DI = &HC6A4
L_1511: FAC! = FAC! * N_C6A4!  ' RT3F_91
L_1514: DI = &HBB52
L_1517: FAC! = FAC! + N_BB52!  ' RT3F_81
L_151A: CX = DI
L_151C: DI = &HC67C
L_151F: FAC! = FAC! * N_C67C!  ' RT3F_91
L_1522: DI = CX
L_1524: FAC! = FAC! + N(DI)  ' RT3F_81
L_1527: AX = BX
L_1529: BX = &H1A
L_152C: FAC! = INT(FAC!)  ' RT3D_03
L_152F: SWAP DX, DI
L_1531: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1534: FAC! = RND  ' RT3D_34
L_1537: DI = CX
L_1539: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_153C: BX = 0
L_153F: IF CompareLeft! >= CompareRight! THEN GOTO L_1542  ' flags from L_1539
L_1541: BX = BX - 1
L_1542: DI = &H804E
L_1545: SI = &HC68C
L_1548: CompareLeft! = N_C68C!: CompareRight! = N_804E!  ' RT3F_9F
L_154B: DX = 0
L_154E: IF CompareLeft! >= CompareRight! THEN GOTO L_1551  ' flags from L_1548
L_1550: DX = DX - 1
L_1551: DX = DX OR BX
L_1553: CompareLeft% = DX: CompareRight% = 0
L_1555: IF CompareLeft% <> CompareRight% THEN GOTO L_155A  ' flags from L_1553
L_1557: GOTO L_1565
L_155A: AX = AX + &HC428
L_155D: DI = AX
L_155F: SI = &H9412
L_1562: N(DI) = N_9412!  ' RT3F_7B
L_1565: SI = &HC634
L_1568: BX = CINT(N_C634!)  ' RT3F_75
L_156B: AX = BX
L_156D: DI = 5
L_1570: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_1572: DI = AX
L_1574: SI = &HBA90
L_1577: BX = CINT(N_BA90!)  ' RT3F_75
L_157A: DI = DI + BX
L_157C: DI = DI * (2 ^ 1)
L_157E: DI = DI * (2 ^ 1)
L_1580: DI = DI + &HC478
L_1584: FAC! = RND  ' RT3D_34
L_1587: BX = DI
L_1589: DI = &HC6A4
L_158C: FAC! = FAC! * N_C6A4!  ' RT3F_91
L_158F: DI = &HBB52
L_1592: FAC! = FAC! + N_BB52!  ' RT3F_81
L_1595: DX = DI
L_1597: DI = &HC68C
L_159A: FAC! = FAC! * N_C68C!  ' RT3F_91
L_159D: DI = DX
L_159F: FAC! = FAC! + N(DI)  ' RT3F_81
L_15A2: DX = BX
L_15A4: BX = &H1A
L_15A7: FAC! = INT(FAC!)  ' RT3D_03
L_15AA: DI = DX
L_15AC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_15AF: DI = &H804E
L_15B2: SI = &HBA90
L_15B5: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_15B8: DI = &HBA90
L_15BB: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_15BE: SI = DI
L_15C0: DI = &HC6F2
L_15C3: CompareLeft! = N_BA90!: CompareRight! = N_C6F2!  ' RT3F_9F
L_15C6: IF CompareLeft! > CompareRight! THEN GOTO L_15CB  ' flags from L_15C3
L_15C8: GOTO L_137C
L_15CB: DI = &HBB56
L_15CE: SI = &HC634
L_15D1: CompareLeft! = N_C634!: CompareRight! = N_BB56!  ' RT3F_9F
L_15D4: BX = 0
L_15D7: IF CompareLeft! <> CompareRight! THEN GOTO L_15DA  ' flags from L_15D1
L_15D9: BX = BX - 1
L_15DA: FAC! = RND  ' RT3D_34
L_15DD: DI = &HBB9E
L_15E0: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_15E3: DI = &HC680
L_15E6: CompareLeft! = FAC!: CompareRight! = N_C680!  ' RT3F_A1
L_15E9: DX = 0
L_15EC: IF CompareLeft! <= CompareRight! THEN GOTO L_15EF  ' flags from L_15E6
L_15EE: DX = DX - 1
L_15EF: DX = DX OR BX
L_15F1: CompareLeft% = DX: CompareRight% = 0
L_15F3: IF CompareLeft% = CompareRight% THEN GOTO L_15F8  ' flags from L_15F1
L_15F5: GOTO L_1784
L_15F8: DI = &HC6FE
L_15FB: SI = &HC684
L_15FE: N_C6FE! = N_C684!  ' RT3F_7B
L_1601: FAC! = RND  ' RT3D_34
L_1604: BX = DI
L_1606: DI = &HBB52
L_1609: CompareLeft! = FAC!: CompareRight! = N_BB52!  ' RT3F_A1
L_160C: IF CompareLeft! < CompareRight! THEN GOTO L_1611  ' flags from L_1609
L_160E: GOTO L_1619
L_1611: DI = BX
L_1613: SI = &HC688
L_1616: N(DI) = N_C688!  ' RT3F_7B
L_1619: DI = &H804E
L_161C: SI = &HC634
L_161F: FAC! = N_C634! + N_804E!  ' RT3F_7F
L_1622: SWAP SI, DI
L_1624: BX = SI
L_1626: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1629: DI = BX
L_162B: SI = &HC63C
L_162E: FAC! = N_C63C! + N(DI)  ' RT3F_7F
L_1631: DI = SI
L_1633: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1636: DI = &HC638
L_1639: SI = &HC6FE
L_163C: CompareLeft! = N_C6FE!: CompareRight! = N_C638!  ' RT3F_9F
L_163F: IF CompareLeft! = CompareRight! THEN GOTO L_1644  ' flags from L_163C
L_1641: GOTO L_164A
L_1644: GOSUB L_1669
L_1647: GOTO L_0FCF
L_164A: DI = &HC638
L_164D: SI = &HC6FE
L_1650: N_C638! = N_C6FE!  ' RT3F_7B
L_1653: SI = DI
L_1655: DI = &HC650
L_1658: CompareLeft! = N_C638!: CompareRight! = N_C650!  ' RT3F_9F
L_165B: IF CompareLeft! < CompareRight! THEN GOTO L_1660  ' flags from L_1658
L_165D: GOTO L_0E7D
L_1660: BX = 1
L_1663: CLOSE #BX  ' RT3E_21
L_1666: GOTO L_0E5A
L_1669: SI = &HC634
L_166C: BX = SI
L_166E: DX = BX
L_1670: BX = CINT(N_C634!)  ' RT3F_75
L_1673: BX = BX * (2 ^ 1)
L_1675: BX = BX * (2 ^ 1)
L_1677: CX = BX
L_1679: BX = BX + &HC1E8
L_167D: SI = DX
L_167F: DI = &HC6B0
L_1682: FAC! = N_C634! + N_C6B0!  ' RT3F_7F
L_1685: DX = BX
L_1687: BX = CINT(FAC!)  ' RT3F_77
L_168A: BX = BX * (2 ^ 1)
L_168C: BX = BX * (2 ^ 1)
L_168E: AX = BX
L_1690: BX = BX + &HC1E8
L_1694: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1697: BX = CX
L_1699: CX = CX + &HC248
L_169D: DI = CX
L_169F: DX = AX
L_16A1: AX = AX + &HC248
L_16A4: SI = AX
L_16A6: N(DI) = N(SI)  ' RT3F_7B
L_16A9: CX = BX
L_16AB: BX = BX + &HC2A8
L_16AF: DI = BX
L_16B1: AX = DX
L_16B3: DX = DX + &HC2A8
L_16B7: SI = DX
L_16B9: N(DI) = N(SI)  ' RT3F_7B
L_16BC: BX = CX
L_16BE: CX = CX + &HC5D4
L_16C2: DI = CX
L_16C4: DX = AX
L_16C6: AX = AX + &HC5D4
L_16C9: SI = AX
L_16CB: N(DI) = N(SI)  ' RT3F_7B
L_16CE: CX = BX
L_16D0: BX = BX + &HC308
L_16D4: DI = BX
L_16D6: AX = DX
L_16D8: DX = DX + &HC308
L_16DC: SI = DX
L_16DE: N(DI) = N(SI)  ' RT3F_7B
L_16E1: BX = CX
L_16E3: CX = CX + &HC318
L_16E7: DI = CX
L_16E9: DX = AX
L_16EB: AX = AX + &HC318
L_16EE: SI = AX
L_16F0: N(DI) = N(SI)  ' RT3F_7B
L_16F3: CX = BX
L_16F5: BX = BX + &HC328
L_16F9: DI = BX
L_16FB: AX = DX
L_16FD: DX = DX + &HC328

```

### Squad movement and oxygen

```basic
L_1701: SI = DX
L_1703: N(DI) = N(SI)  ' RT3F_7B
L_1706: BX = CX
L_1708: CX = CX + &HC338
L_170C: DI = CX
L_170E: DX = AX
L_1710: AX = AX + &HC338
L_1713: SI = AX
L_1715: N(DI) = N(SI)  ' RT3F_7B
L_1718: CX = BX
L_171A: BX = BX + &HC348
L_171E: DI = BX
L_1720: AX = DX
L_1722: DX = DX + &HC348
L_1726: SI = DX
L_1728: N(DI) = N(SI)  ' RT3F_7B
L_172B: BX = CX
L_172D: CX = CX + &HC358
L_1731: DI = CX
L_1733: DX = AX
L_1735: AX = AX + &HC358
L_1738: SI = AX
L_173A: N(DI) = N(SI)  ' RT3F_7B
L_173D: CX = BX
L_173F: BX = BX + &HC368
L_1743: DI = BX
L_1745: AX = DX
L_1747: DX = DX + &HC368
L_174B: SI = DX
L_174D: N(DI) = N(SI)  ' RT3F_7B
L_1750: BX = CX
L_1752: CX = CX + &HC378
L_1756: DI = CX
L_1758: DX = AX
L_175A: AX = AX + &HC378
L_175D: SI = AX
L_175F: N(DI) = N(SI)  ' RT3F_7B
L_1762: CX = BX
L_1764: BX = BX + &HC614
L_1768: DI = BX
L_176A: AX = DX
L_176C: DX = DX + &HC614
L_1770: SI = DX
L_1772: N(DI) = N(SI)  ' RT3F_7B
L_1775: CX = CX + &HC624
L_1779: DI = CX
L_177B: AX = AX + &HC624
L_177E: SI = AX
L_1780: N(DI) = N(SI)  ' RT3F_7B
L_1783: RETURN
L_1784: BX = 1
L_1787: CLOSE #BX  ' RT3E_21
L_178A: DI = &HC52C
L_178D: SI = &HC1B4
L_1790: N_C52C! = N_C1B4!  ' RT3F_7B
L_1793: DI = &HC550
L_1796: SI = &HC184
L_1799: N_C550! = N_C184!  ' RT3F_7B
L_179C: GOTO L_17F5
L_179F: SI = &HC702
L_17A2: BX = CINT(N_C702!)  ' RT3F_75
L_17A5: SI = BX
L_17A7: SI = SI * (2 ^ 1)
L_17A9: SI = SI * (2 ^ 1)
L_17AB: BX = SI
L_17AD: SI = SI + &HC518
L_17B1: DX = SI
L_17B3: SI = &HC706
L_17B6: CX = BX
L_17B8: BX = CINT(N_C706!)  ' RT3F_75
L_17BB: DI = BX
L_17BD: DI = DI * (2 ^ 1)
L_17BF: DI = DI * (2 ^ 1)
L_17C1: BX = DI
L_17C3: DI = DI + &HC518
L_17C7: SI = DX
L_17C9: FAC! = N(SI) - N(DI)  ' RT3F_97
L_17CC: DI = &H9412
L_17CF: FAC! = FAC! ^ N_9412!  ' RT3F_25; M ledger
L_17D2: CX = CX + &HC53C
L_17D6: SI = CX
L_17D8: BX = BX + &HC53C
L_17DC: SWAP BX, DI
L_17DE: T_01! = FAC!  ' RT3F_71; inline=&H81
L_17E2: FAC! = N(SI) - N(DI)  ' RT3F_97
L_17E5: DI = BX
L_17E7: FAC! = FAC! ^ N(DI)  ' RT3F_25; M ledger
L_17EA: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_17EE: BX = &H1A
L_17F1: FAC! = SQR(FAC!)  ' RT3D_3A
L_17F4: RETURN
L_17F5: GOTO L_1838
L_17F8: DI = &HC702
L_17FB: SI = &HC70A
L_17FE: N_C702! = N_C70A!  ' RT3F_7B
L_1801: DI = &HC706
L_1804: SI = &HC0F4
L_1807: N_C706! = N_C0F4!  ' RT3F_7B
L_180A: GOSUB L_179F
L_180D: DI = &HBAF4
L_1810: FAC! = FAC! * N_BAF4!  ' RT3F_91
L_1813: SI = &HC70E
L_1816: T_02! = FAC!  ' RT3F_71; inline=&H82
L_181A: FAC! = N(SI) * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_181E: FAC! = T_02! - FAC!  ' RT3F_9D; inline=&H82
L_1822: DI = &HC194
L_1825: CompareLeft! = FAC!: CompareRight! = N_C194!  ' RT3F_A1
L_1828: BX = 0
L_182B: IF CompareLeft! >= CompareRight! THEN GOTO L_182E  ' flags from L_1825
L_182D: BX = BX - 1
L_182E: CompareLeft% = BX: CompareRight% = 0
L_1830: IF CompareLeft% >= CompareRight% THEN GOTO L_1834  ' flags from L_182E
L_1832: BX = -BX
L_1834: FAC! = CSNG(BX)  ' RT3F_57
L_1837: RETURN
L_1838: GOTO L_1872
L_183B: DI = &HC702
L_183E: SI = &HC712
L_1841: N_C702! = N_C712!  ' RT3F_7B
L_1844: DI = &HC706
L_1847: SI = &HC0F4
L_184A: N_C706! = N_C0F4!  ' RT3F_7B
L_184D: GOSUB L_179F
L_1850: DI = &HBAF4
L_1853: FAC! = FAC! * N_BAF4!  ' RT3F_91
L_1856: DI = &HC70E
L_1859: FAC! = FAC! - N_C70E!  ' RT3F_99
L_185C: DI = &HC194
L_185F: CompareLeft! = FAC!: CompareRight! = N_C194!  ' RT3F_A1
L_1862: BX = 0
L_1865: IF CompareLeft! >= CompareRight! THEN GOTO L_1868  ' flags from L_185F
L_1867: BX = BX - 1
L_1868: CompareLeft% = BX: CompareRight% = 0
L_186A: IF CompareLeft% >= CompareRight% THEN GOTO L_186E  ' flags from L_1868
L_186C: BX = -BX
L_186E: FAC! = CSNG(BX)  ' RT3F_57
L_1871: RETURN
L_1872: GOTO L_18D2
L_1875: SI = &HC716
L_1878: BX = CINT(N_C716!)  ' RT3F_75
L_187B: SI = BX
L_187D: SI = SI * (2 ^ 1)
L_187F: SI = SI * (2 ^ 1)
L_1881: BX = SI
L_1883: SI = SI + &HC53C
L_1887: DI = &HBB52
L_188A: FAC! = N(SI) * N_BB52!  ' RT3F_8F
L_188D: DX = DI
L_188F: DI = &HC71A
L_1892: FAC! = FAC! + N_C71A!  ' RT3F_81
L_1895: CX = BX
L_1897: BX = &H1A
L_189A: FAC! = INT(FAC!)  ' RT3D_03
L_189D: BX = CINT(FAC!)  ' RT3F_77
L_18A0: AX = BX
L_18A2: DI = 9
L_18A5: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_18A7: DI = AX
L_18A9: CX = CX + &HC518
L_18AD: SI = CX
L_18AF: DI = &HBB52
L_18B2: FAC! = N(SI) * N_BB52!  ' RT3F_8F
L_18B5: DI = &HC71E
L_18B8: FAC! = FAC! + N_C71E!  ' RT3F_81
L_18BB: BX = &H1A
L_18BE: FAC! = INT(FAC!)  ' RT3D_03
L_18C1: BX = CINT(FAC!)  ' RT3F_77
L_18C4: BX = BX + AX
L_18C6: DI = BX
L_18C8: DI = DI * (2 ^ 1)
L_18CA: BX = WORD(DI - &H4436)
L_18CE: FAC! = CSNG(BX)  ' RT3F_57
L_18D1: RETURN
L_18D2: GOTO L_192F
L_18D5: SI = &HC722
L_18D8: BX = CINT(N_C722!)  ' RT3F_75
L_18DB: SI = BX
L_18DD: SI = SI * (2 ^ 1)
L_18DF: SI = SI * (2 ^ 1)
L_18E1: BX = SI
L_18E3: SI = SI + &HC518
L_18E7: DI = &HC726
L_18EA: CompareLeft! = N(SI): CompareRight! = N_C726!  ' RT3F_9F
L_18ED: DX = 0
L_18F0: IF CompareLeft! <= CompareRight! THEN GOTO L_18F3  ' flags from L_18EA
L_18F2: DX = DX - 1
L_18F3: DI = &HC1D0
L_18F6: CompareLeft! = N(SI): CompareRight! = N_C1D0!  ' RT3F_9F
L_18F9: CX = 0
L_18FC: IF CompareLeft! >= CompareRight! THEN GOTO L_18FF  ' flags from L_18F6
L_18FE: CX = CX - 1
L_18FF: CX = CX OR DX
L_1901: BX = BX + &HC53C
L_1905: SI = BX
L_1907: DI = &HC0F4
L_190A: CompareLeft! = N(SI): CompareRight! = N_C0F4!  ' RT3F_9F
L_190D: DX = 0
L_1910: IF CompareLeft! >= CompareRight! THEN GOTO L_1913  ' flags from L_190A
L_1912: DX = DX - 1
L_1913: DX = DX OR CX
L_1915: DI = &HC1E4
L_1918: CompareLeft! = N(SI): CompareRight! = N_C1E4!  ' RT3F_9F
L_191B: CX = 0
L_191E: IF CompareLeft! <= CompareRight! THEN GOTO L_1921  ' flags from L_1918
L_1920: CX = CX - 1
L_1921: CX = CX OR DX
L_1923: CompareLeft% = CX: CompareRight% = 0
L_1925: IF CompareLeft% >= CompareRight% THEN GOTO L_1929  ' flags from L_1923
L_1927: CX = -CX
L_1929: BX = CX
L_192B: FAC! = CSNG(BX)  ' RT3F_57
L_192E: RETURN
L_192F: GOTO L_1954
L_1932: DI = &HC716
L_1935: SI = &HC72A
L_1938: N_C716! = N_C72A!  ' RT3F_7B
L_193B: GOSUB L_1875
L_193E: DI = &HBB56
L_1941: CompareLeft! = FAC!: CompareRight! = N_BB56!  ' RT3F_A1
L_1944: BX = 0
L_1947: IF CompareLeft! = CompareRight! THEN GOTO L_194A  ' flags from L_1941
L_1949: BX = BX - 1
L_194A: CompareLeft% = BX: CompareRight% = 0
L_194C: IF CompareLeft% >= CompareRight% THEN GOTO L_1950  ' flags from L_194A
L_194E: BX = -BX
L_1950: FAC! = CSNG(BX)  ' RT3F_57
L_1953: RETURN
L_1954: SI = &H19B4
L_1957: CompareLeft! = N_19B4!: CompareRight! = 0  ' RT3F_A7
L_195A: IF CompareLeft! = CompareRight! THEN GOTO L_195F  ' flags from L_1957
L_195C: GOTO L_1996
L_195F: BX = &H942E
L_1962: FAC! = CSNG(BX)  ' RT3F_57
L_1965: BX = &HC72E
L_1968: AX = &H9404
L_196B: BX = TEMP_DESC(S_9404$ + S_C72E$)  ' BX receives a temporary descriptor  ' RT3F_55
L_196E: SI = &HC308
L_1971: T_03! = FAC!  ' RT3F_71; inline=&H83
L_1975: FAC! = -N(SI)  ' RT3F_AF
L_1978: DX = BX
L_197A: BX = &H1A
L_197D: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_1980: AX = DX
L_1982: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_1985: AX = BX
L_1987: BX = &HBF96
L_198A: BX = TEMP_DESC(S(AX) + S_BF96$)  ' BX receives a temporary descriptor  ' RT3F_55
L_198D: DX = &HBEA0
L_1990: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_1993: GOTO L_19C0
L_1996: BX = &H8052
L_1999: FAC! = CSNG(BX)  ' RT3F_57
L_199C: SI = &HC308
L_199F: T_03! = FAC!  ' RT3F_71; inline=&H83
L_19A3: FAC! = -N(SI)  ' RT3F_AF
L_19A6: BX = &H1A
L_19A9: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_19AC: AX = &HC738
L_19AF: BX = TEMP_DESC(S_C738$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_19B2: AX = BX
L_19B4: BX = &HBF8E
L_19B7: BX = TEMP_DESC(S(AX) + S_BF8E$)  ' BX receives a temporary descriptor  ' RT3F_55
L_19BA: DX = &HBEA0
L_19BD: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_19C0: DI = &H804E
L_19C3: SI = &H19B4
L_19C6: CompareLeft! = N_19B4!: CompareRight! = N_804E!  ' RT3F_9F
L_19C9: IF CompareLeft! = CompareRight! THEN GOTO L_19CE  ' flags from L_19C6
L_19CB: GOTO L_19E6
L_19CE: BX = &HAC70
L_19D1: FAC! = CSNG(BX)  ' RT3F_57
L_19D4: BX = &HC742
L_19D7: AX = &H9404
L_19DA: BX = TEMP_DESC(S_9404$ + S_C742$)  ' BX receives a temporary descriptor  ' RT3F_55
L_19DD: DX = &H1A
L_19E0: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_19E3: GOTO L_19FB
L_19E6: BX = &HAC70
L_19E9: FAC! = CSNG(BX)  ' RT3F_57
L_19EC: BX = &HC750
L_19EF: AX = &H9404
L_19F2: BX = TEMP_DESC(S_9404$ + S_C750$)  ' BX receives a temporary descriptor  ' RT3F_55
L_19F5: DX = &H1A
L_19F8: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_19FB: DI = &HC75E
L_19FE: SI = &HC190
L_1A01: N_C75E! = N_C190!  ' RT3F_7B
L_1A04: SI = &H804E
L_1A07: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_1A0A: GOTO L_1A4A
L_1A0D: ' Alignment NOP
L_1A0E: DI = &HC110
L_1A11: SI = &HC1C0
L_1A14: N_C110! = N_C1C0!  ' RT3F_7B
L_1A17: DI = &HC114
L_1A1A: SI = &HC762
L_1A1D: N_C114! = N_C762!  ' RT3F_7B
L_1A20: GOSUB L_06A9
L_1A23: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_1A26: IF CompareLeft! > CompareRight! THEN GOTO L_1A2B  ' flags from L_1A23
L_1A28: GOTO L_1A41
L_1A2B: GOSUB L_92AE
L_1A2E: DI = &HC766
L_1A31: SI = &HC75E
L_1A34: CompareLeft! = N_C75E!: CompareRight! = N_C766!  ' RT3F_9F
L_1A37: IF CompareLeft! > CompareRight! THEN GOTO L_1A3C  ' flags from L_1A34
L_1A39: GOTO L_1A41
L_1A3C: SWAP DI, SI
L_1A3E: N(DI) = N(SI)  ' RT3F_7B
L_1A41: DI = &H804E
L_1A44: SI = &HC762
L_1A47: FAC! = N_C762! + N_804E!  ' RT3F_7F
L_1A4A: DI = &HC762
L_1A4D: N_C762! = FAC!: SI = &H001A  ' RT3F_7D
L_1A50: SI = DI
L_1A52: DI = &HC10C
L_1A55: CompareLeft! = N_C762!: CompareRight! = N_C10C!  ' RT3F_9F
L_1A58: IF CompareLeft! <= CompareRight! THEN GOTO L_1A0E  ' flags from L_1A55
L_1A5A: DI = &HC0F4
L_1A5D: SI = &HC75E
L_1A60: FAC! = N_C75E! / N_C0F4!  ' RT3F_87
L_1A63: DI = &HBB52
L_1A66: BX = SI
L_1A68: FAC! = FAC! + N_BB52!  ' RT3F_81
L_1A6B: DX = BX
L_1A6D: BX = &H1A
L_1A70: FAC! = INT(FAC!)  ' RT3D_03
L_1A73: DI = DX
L_1A75: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1A78: SI = DX
L_1A7A: DI = &H804E
L_1A7D: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_1A80: IF CompareLeft! < CompareRight! THEN GOTO L_1A85  ' flags from L_1A7D
L_1A82: GOTO L_1A8A
L_1A85: SWAP SI, DI
L_1A87: N(DI) = N(SI)  ' RT3F_7B
L_1A8A: BX = &H17
L_1A8D: ARGPUSH BX  ' RT3E_42
L_1A90: BX = 1
L_1A93: LOCATE ARGS(), BX  ' RT3E_44
L_1A96: ' PRINT statement begins ; RT3F_BC
L_1A99: BX = &HC76A
L_1A9C: PRINT S_C76A$;  ' RT3F_6A
L_1A9F: BX = &HC75E
L_1AA2: PRINT N_C75E!;  ' RT3F_67; H expanded ledger
L_1AA5: BX = &HC77E
L_1AA8: PRINT S_C77E$  ' RT3F_6E; H newline item, ledger correction
L_1AAB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1AAE: DI = &HC7A6
L_1AB1: SI = &HC6B0
L_1AB4: N_C7A6! = N_C6B0!  ' RT3F_7B
L_1AB7: DI = &HC796
L_1ABA: BX = SI
L_1ABC: SI = &H804E
L_1ABF: N_C796! = N_804E!  ' RT3F_7B
L_1AC2: DI = &HC7AE
L_1AC5: N_C7AE! = N_804E!  ' RT3F_7B
L_1AC8: SI = BX
L_1ACA: DI = &HC79E
L_1ACD: N_C79E! = N_C6B0!  ' RT3F_7B
L_1AD0: SI = &HBB46
L_1AD3: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_1AD6: GOTO L_1AF7
L_1AD9: ' Alignment NOP
L_1ADA: SI = &HBA90
L_1ADD: BX = SI
L_1ADF: DX = BX
L_1AE1: BX = CINT(N_BA90!)  ' RT3F_75
L_1AE4: BX = BX * (2 ^ 1)
L_1AE6: BX = BX * (2 ^ 1)
L_1AE8: BX = BX + &HC7BA
L_1AEC: READ S(BX)  ' RT3F_10
L_1AEF: SI = DX
L_1AF1: DI = &H804E
L_1AF4: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_1AF7: DI = &HBA90
L_1AFA: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_1AFD: SI = DI
L_1AFF: DI = &HBAF4
L_1B02: CompareLeft! = N_BA90!: CompareRight! = N_BAF4!  ' RT3F_9F
L_1B05: IF CompareLeft! <= CompareRight! THEN GOTO L_1ADA  ' flags from L_1B02
L_1B07: ' Alignment NOP
L_1B08: DI = &HC7E6
L_1B0B: SI = &HC10C
L_1B0E: N_C7E6! = N_C10C!  ' RT3F_7B
L_1B11: DI = &HC7EA
L_1B14: SI = &H19A8
L_1B17: N_C7EA! = N_19A8!  ' RT3F_7B
L_1B1A: SI = &HBB46
L_1B1D: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_1B20: GOTO L_1C00
L_1B23: ' Alignment NOP
L_1B24: SI = &HBB46
L_1B27: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_1B2A: GOTO L_1B5B
L_1B2D: ' Alignment NOP
L_1B2E: SI = &HC634
L_1B31: BX = SI
L_1B33: DX = BX
L_1B35: BX = CINT(N_C634!)  ' RT3F_75
L_1B38: AX = BX
L_1B3A: CX = 5
L_1B3D: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_1B3F: SI = &HBA90
L_1B42: BX = CINT(N_BA90!)  ' RT3F_75
L_1B45: BX = BX + AX
L_1B47: BX = BX * (2 ^ 1)
L_1B49: BX = BX * (2 ^ 1)
L_1B4B: BX = BX + &HC7EE
L_1B4F: READ N(BX)  ' RT3F_0D
L_1B52: DI = &H804E
L_1B55: SI = &HC634
L_1B58: FAC! = N_C634! + N_804E!  ' RT3F_7F
L_1B5B: DI = &HC634
L_1B5E: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_1B61: SI = DI
L_1B63: DI = &H9412
L_1B66: CompareLeft! = N_C634!: CompareRight! = N_9412!  ' RT3F_9F
L_1B69: IF CompareLeft! <= CompareRight! THEN GOTO L_1B2E  ' flags from L_1B66
L_1B6B: SI = &HBB46
L_1B6E: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_1B71: GOTO L_1BA1
L_1B74: SI = &HC634
L_1B77: BX = SI
L_1B79: DX = BX
L_1B7B: BX = CINT(N_C634!)  ' RT3F_75
L_1B7E: AX = BX
L_1B80: CX = 5
L_1B83: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_1B85: SI = &HBA90
L_1B88: BX = CINT(N_BA90!)  ' RT3F_75
L_1B8B: BX = BX + AX
L_1B8D: BX = BX * (2 ^ 1)
L_1B8F: BX = BX * (2 ^ 1)
L_1B91: BX = BX + &HC82A
L_1B95: READ N(BX)  ' RT3F_0D
L_1B98: DI = &H804E
L_1B9B: SI = &HC634
L_1B9E: FAC! = N_C634! + N_804E!  ' RT3F_7F
L_1BA1: DI = &HC634
L_1BA4: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_1BA7: SI = DI
L_1BA9: DI = &HC17C
L_1BAC: CompareLeft! = N_C634!: CompareRight! = N_C17C!  ' RT3F_9F
L_1BAF: IF CompareLeft! <= CompareRight! THEN GOTO L_1B74  ' flags from L_1BAC
L_1BB1: SI = &HBB46
L_1BB4: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_1BB7: GOTO L_1BE7
L_1BBA: SI = &HC634
L_1BBD: BX = SI
L_1BBF: DX = BX
L_1BC1: BX = CINT(N_C634!)  ' RT3F_75
L_1BC4: AX = BX
L_1BC6: CX = 5
L_1BC9: DX:AX = SIGNED16(AX) * SIGNED16(CX)
L_1BCB: SI = &HBA90
L_1BCE: BX = CINT(N_BA90!)  ' RT3F_75
L_1BD1: BX = BX + AX
L_1BD3: BX = BX * (2 ^ 1)
L_1BD5: BX = BX * (2 ^ 1)
L_1BD7: BX = BX + &HC8DE
L_1BDB: READ N(BX)  ' RT3F_0D
L_1BDE: DI = &H804E
L_1BE1: SI = &HC634
L_1BE4: FAC! = N_C634! + N_804E!  ' RT3F_7F
L_1BE7: DI = &HC634
L_1BEA: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_1BED: SI = DI
L_1BEF: DI = &HBB56
L_1BF2: CompareLeft! = N_C634!: CompareRight! = N_BB56!  ' RT3F_9F
L_1BF5: IF CompareLeft! <= CompareRight! THEN GOTO L_1BBA  ' flags from L_1BF2
L_1BF7: DI = &H804E
L_1BFA: SI = &HBA90
L_1BFD: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_1C00: DI = &HBA90
L_1C03: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_1C06: SI = DI
L_1C08: DI = &HBA94
L_1C0B: CompareLeft! = N_BA90!: CompareRight! = N_BA94!  ' RT3F_9F
L_1C0E: IF CompareLeft! > CompareRight! THEN GOTO L_1C13  ' flags from L_1C0B
L_1C10: GOTO L_1B24
L_1C13: ' Alignment NOP
L_1C14: ' Alignment NOP
L_1C15: DI = &HC92E
L_1C18: SI = &H9412
L_1C1B: N_C92E! = N_9412!  ' RT3F_7B
L_1C1E: DI = &HC932
L_1C21: SI = &HBB46
L_1C24: N_C932! = N_BB46!  ' RT3F_7B
L_1C27: DI = &HC936
L_1C2A: N_C936! = N_BB46!  ' RT3F_7B
L_1C2D: DI = &HC93A
L_1C30: SI = &HC6B0
L_1C33: N_C93A! = N_C6B0!  ' RT3F_7B
L_1C36: DI = &HC93E
L_1C39: SI = &HC6B4
L_1C3C: N_C93E! = N_C6B4!  ' RT3F_7B
L_1C3F: SI = &H804E
L_1C42: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_1C45: GOTO L_1D51
L_1C48: DI = &HC942
L_1C4B: SI = &HBA90
L_1C4E: N_C942! = N_BA90!  ' RT3F_7B
L_1C51: GOSUB L_2263
L_1C54: DI = &HC110
L_1C57: SI = &HBFA6
L_1C5A: N_C110! = N_BFA6!  ' RT3F_7B
L_1C5D: DI = &HC114
L_1C60: SI = &HBA90
L_1C63: N_C114! = N_BA90!  ' RT3F_7B
L_1C66: GOSUB L_06A9
L_1C69: DI = &HC946
L_1C6C: N_C946! = FAC!: SI = &H001A  ' RT3F_7D
L_1C6F: SI = DI
L_1C71: DI = &H804E
L_1C74: CompareLeft! = N_C946!: CompareRight! = N_804E!  ' RT3F_9F
L_1C77: BX = 0
L_1C7A: IF CompareLeft! >= CompareRight! THEN GOTO L_1C7D  ' flags from L_1C74
L_1C7C: BX = BX - 1
L_1C7D: DI = &HC18C
L_1C80: CompareLeft! = N(SI): CompareRight! = N_C18C!  ' RT3F_9F
L_1C83: DX = 0
L_1C86: IF CompareLeft! <= CompareRight! THEN GOTO L_1C89  ' flags from L_1C80
L_1C88: DX = DX - 1
L_1C89: DX = DX OR BX
L_1C8B: CompareLeft% = DX: CompareRight% = 0
L_1C8D: IF CompareLeft% <> CompareRight% THEN GOTO L_1C92  ' flags from L_1C8B
L_1C8F: GOTO L_1C9D
L_1C92: DI = SI
L_1C94: SI = &HC6FA
L_1C97: N(DI) = N_C6FA!  ' RT3F_7B
L_1C9A: GOTO L_1D1D
L_1C9D: DI = &HC184
L_1CA0: SI = &HC946
L_1CA3: FAC! = N_C946! * N_C184!  ' RT3F_8F
L_1CA6: DI = &HC94E
L_1CA9: BX = SI
L_1CAB: FAC! = FAC! + N_C94E!  ' RT3F_81
L_1CAE: DI = &HC94A
L_1CB1: N_C94A! = FAC!: SI = &H001A  ' RT3F_7D
L_1CB4: SI = DI
L_1CB6: DX = BX
L_1CB8: BX = CINT(N_C94A!)  ' RT3F_75
L_1CBB: SI = BX
L_1CBD: SI = SI * (2 ^ 1)
L_1CBF: SI = SI * (2 ^ 1)
L_1CC1: SI = SI + &H1850
L_1CC5: BX = DI
L_1CC7: DI = &H804E
L_1CCA: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_1CCD: CX = 0
L_1CD0: IF CompareLeft! >= CompareRight! THEN GOTO L_1CD3  ' flags from L_1CCA
L_1CD2: CX = CX - 1
L_1CD3: DI = &HC174
L_1CD6: CompareLeft! = N(SI): CompareRight! = N_C174!  ' RT3F_9F
L_1CD9: AX = 0
L_1CDC: IF CompareLeft! <= CompareRight! THEN GOTO L_1CDF  ' flags from L_1CD6
L_1CDE: AX = AX - 1
L_1CDF: AX = AX OR CX
L_1CE1: SI = BX
L_1CE3: DI = &HC178
L_1CE6: FAC! = N(SI) + N_C178!  ' RT3F_7F
L_1CE9: BX = CINT(FAC!)  ' RT3F_77
L_1CEC: SI = BX
L_1CEE: SI = SI * (2 ^ 1)
L_1CF0: SI = SI * (2 ^ 1)
L_1CF2: SI = SI + &H1850
L_1CF6: DI = &H9412
L_1CF9: BX = SI
L_1CFB: SI = &HBA90
L_1CFE: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_1D01: SI = BX
L_1D03: CompareLeft! = N(SI): CompareRight! = FAC!  ' RT3F_A3
L_1D06: CX = 0
L_1D09: IF CompareLeft! = CompareRight! THEN GOTO L_1D0C  ' flags from L_1D03
L_1D0B: CX = CX - 1
L_1D0C: CX = CX OR AX
L_1D0E: CompareLeft% = CX: CompareRight% = 0
L_1D10: IF CompareLeft% <> CompareRight% THEN GOTO L_1D15  ' flags from L_1D0E
L_1D12: GOTO L_1D1D
L_1D15: DI = DX
L_1D17: SI = &HBB46
L_1D1A: N(DI) = N_BB46!  ' RT3F_7B
L_1D1D: DI = &HC120
L_1D20: SI = &HBFA6
L_1D23: N_C120! = N_BFA6!  ' RT3F_7B
L_1D26: DI = &HC124
L_1D29: SI = &HBA90
L_1D2C: N_C124! = N_BA90!  ' RT3F_7B
L_1D2F: GOSUB L_06DB
L_1D32: BX = CINT(FAC!)  ' RT3F_77
L_1D35: DI = BX
L_1D37: DI = DI * (2 ^ 1)
L_1D39: DI = DI * (2 ^ 1)
L_1D3B: DI = DI + &H1850
L_1D3F: SI = &HC946
L_1D42: N(DI) = N_C946!  ' RT3F_7B
L_1D45: GOSUB L_21E6
L_1D48: DI = &H804E
L_1D4B: SI = &HBA90
L_1D4E: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_1D51: DI = &HBA90
L_1D54: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_1D57: SI = DI
L_1D59: DI = &HC10C
L_1D5C: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_1D5F: IF CompareLeft! > CompareRight! THEN GOTO L_1D64  ' flags from L_1D5C
L_1D61: GOTO L_1C48
L_1D64: DI = &H804E
L_1D67: SI = &HBAE8
L_1D6A: CompareLeft! = N_BAE8!: CompareRight! = N_804E!  ' RT3F_9F
L_1D6D: IF CompareLeft! <> CompareRight! THEN GOTO L_1D72  ' flags from L_1D6A
L_1D6F: GOTO L_1F77
L_1D72: BX = &H18
L_1D75: ARGPUSH BX  ' RT3E_42
L_1D78: BX = 1
L_1D7B: LOCATE ARGS(), BX  ' RT3E_44
L_1D7E: ' PRINT statement begins ; RT3F_BC
L_1D81: BX = &HC952
L_1D84: PRINT S_C952$;  ' RT3F_6A
L_1D87: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1D8A: SI = &HC1C4
L_1D8D: FAC! = N_C1C4!: DI = &H001E  ' RT3F_6F
L_1D90: GOTO L_1E92
L_1D93: ' Alignment NOP
L_1D94: DI = &H9412
L_1D97: SI = &HC942
L_1D9A: FAC! = N_C942! + N_9412!  ' RT3F_7F
L_1D9D: BX = CINT(FAC!)  ' RT3F_77
L_1DA0: SI = BX
L_1DA2: SI = SI * (2 ^ 1)
L_1DA4: SI = SI * (2 ^ 1)
L_1DA6: SI = SI + &H1850
L_1DAA: DI = &HC180
L_1DAD: FAC! = N(SI) + N_C180!  ' RT3F_7F
L_1DB0: DI = &HBA90
L_1DB3: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_1DB6: SI = DI
L_1DB8: CompareLeft! = N_BA90!: CompareRight! = 0  ' RT3F_A7
L_1DBB: IF CompareLeft! >= CompareRight! THEN GOTO L_1DC0  ' flags from L_1DB8
L_1DBD: GOTO L_1E89
L_1DC0: SI = &HC942
L_1DC3: BX = CINT(N_C942!)  ' RT3F_75
L_1DC6: SI = BX
L_1DC8: SI = SI * (2 ^ 1)
L_1DCA: SI = SI * (2 ^ 1)
L_1DCC: SI = SI + &H1850
L_1DD0: DI = &HBAF4
L_1DD3: CompareLeft! = N(SI): CompareRight! = N_BAF4!  ' RT3F_9F
L_1DD6: IF CompareLeft! = CompareRight! THEN GOTO L_1DDB  ' flags from L_1DD3
L_1DD8: GOTO L_1E03
L_1DDB: DI = &HC120
L_1DDE: SI = &HC1B4
L_1DE1: N_C120! = N_C1B4!  ' RT3F_7B
L_1DE4: DI = &HC124
L_1DE7: SI = &HBA90
L_1DEA: N_C124! = N_BA90!  ' RT3F_7B
L_1DED: GOSUB L_06DB
L_1DF0: BX = CINT(FAC!)  ' RT3F_77
L_1DF3: DI = BX
L_1DF5: DI = DI * (2 ^ 1)
L_1DF7: DI = DI * (2 ^ 1)
L_1DF9: DI = DI + &H1850
L_1DFD: SI = &H804E
L_1E00: N(DI) = N_804E!  ' RT3F_7B
L_1E03: SI = &HC942
L_1E06: BX = CINT(N_C942!)  ' RT3F_75
L_1E09: SI = BX
L_1E0B: SI = SI * (2 ^ 1)
L_1E0D: SI = SI * (2 ^ 1)
L_1E0F: SI = SI + &H1850
L_1E13: DI = &HC17C
L_1E16: CompareLeft! = N(SI): CompareRight! = N_C17C!  ' RT3F_9F
L_1E19: IF CompareLeft! = CompareRight! THEN GOTO L_1E1E  ' flags from L_1E16
L_1E1B: GOTO L_1E46
L_1E1E: DI = &HC120
L_1E21: SI = &HC970
L_1E24: N_C120! = N_C970!  ' RT3F_7B
L_1E27: DI = &HC124
L_1E2A: SI = &HBA90
L_1E2D: N_C124! = N_BA90!  ' RT3F_7B
L_1E30: GOSUB L_06DB
L_1E33: BX = CINT(FAC!)  ' RT3F_77
L_1E36: DI = BX
L_1E38: DI = DI * (2 ^ 1)
L_1E3A: DI = DI * (2 ^ 1)
L_1E3C: DI = DI + &H1850
L_1E40: SI = &H804E
L_1E43: N(DI) = N_804E!  ' RT3F_7B
L_1E46: SI = &HC942
L_1E49: BX = CINT(N_C942!)  ' RT3F_75
L_1E4C: SI = BX
L_1E4E: SI = SI * (2 ^ 1)
L_1E50: SI = SI * (2 ^ 1)
L_1E52: SI = SI + &H1850
L_1E56: DI = &HC178
L_1E59: CompareLeft! = N(SI): CompareRight! = N_C178!  ' RT3F_9F
L_1E5C: IF CompareLeft! = CompareRight! THEN GOTO L_1E61  ' flags from L_1E59
L_1E5E: GOTO L_1E89
L_1E61: DI = &HC120
L_1E64: SI = &HC974
L_1E67: N_C120! = N_C974!  ' RT3F_7B
L_1E6A: DI = &HC124
L_1E6D: SI = &HBA90
L_1E70: N_C124! = N_BA90!  ' RT3F_7B
L_1E73: GOSUB L_06DB
L_1E76: BX = CINT(FAC!)  ' RT3F_77
L_1E79: DI = BX
L_1E7B: DI = DI * (2 ^ 1)
L_1E7D: DI = DI * (2 ^ 1)
L_1E7F: DI = DI + &H1850
L_1E83: SI = &H804E
L_1E86: N(DI) = N_804E!  ' RT3F_7B
L_1E89: DI = &HBB56
L_1E8C: SI = &HC942
L_1E8F: FAC! = N_C942! + N_BB56!  ' RT3F_7F
L_1E92: DI = &HC942
L_1E95: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_1E98: SI = DI
L_1E9A: DI = &HC978
L_1E9D: CompareLeft! = N_C942!: CompareRight! = N_C978!  ' RT3F_9F
L_1EA0: IF CompareLeft! > CompareRight! THEN GOTO L_1EA5  ' flags from L_1E9D
L_1EA2: GOTO L_1D94
L_1EA5: SI = &H804E
L_1EA8: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_1EAB: GOTO L_1F64
L_1EAE: DI = &HC110
L_1EB1: SI = &HC1B4
L_1EB4: N_C110! = N_C1B4!  ' RT3F_7B
L_1EB7: BX = DI
L_1EB9: DI = &HC114
L_1EBC: SI = &HBA90
L_1EBF: N_C114! = N_BA90!  ' RT3F_7B
L_1EC2: GOSUB L_06A9
L_1EC5: DI = &HC110
L_1EC8: SI = &HC970
L_1ECB: N_C110! = N_C970!  ' RT3F_7B
L_1ECE: BX = DI
L_1ED0: DI = &HC114
L_1ED3: SI = &HBA90
L_1ED6: N_C114! = N_BA90!  ' RT3F_7B
L_1ED9: T_03! = FAC!  ' RT3F_71; inline=&H83
L_1EDD: GOSUB L_06A9
L_1EE0: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_1EE4: DI = &HC110
L_1EE7: SI = &HC974
L_1EEA: N_C110! = N_C974!  ' RT3F_7B
L_1EED: DI = &HC114
L_1EF0: SI = &HBA90
L_1EF3: N_C114! = N_BA90!  ' RT3F_7B
L_1EF6: T_04! = FAC!  ' RT3F_71; inline=&H84
L_1EFA: GOSUB L_06A9
L_1EFD: FAC! = T_04! * FAC!  ' RT3F_95; inline=&H84
L_1F01: DI = &HC97C
L_1F04: N_C97C! = FAC!: SI = &H001A  ' RT3F_7D
L_1F07: GOSUB L_21E6
L_1F0A: DI = &HC120
L_1F0D: SI = &HC974
L_1F10: N_C120! = N_C974!  ' RT3F_7B
L_1F13: DI = &HC124
L_1F16: SI = &HBA90
L_1F19: N_C124! = N_BA90!  ' RT3F_7B
L_1F1C: GOSUB L_06DB
L_1F1F: BX = CINT(FAC!)  ' RT3F_77
L_1F22: DI = BX
L_1F24: DI = DI * (2 ^ 1)
L_1F26: DI = DI * (2 ^ 1)
L_1F28: DI = DI + &H1850
L_1F2C: SI = &HC97C
L_1F2F: N(DI) = N_C97C!  ' RT3F_7B
L_1F32: DI = &H804E
L_1F35: CompareLeft! = N_C97C!: CompareRight! = N_804E!  ' RT3F_9F
L_1F38: IF CompareLeft! = CompareRight! THEN GOTO L_1F3D  ' flags from L_1F35
L_1F3A: GOTO L_1F5B
L_1F3D: ' PRINT statement begins ; RT3F_BC
L_1F40: DI = &HC980
L_1F43: SI = &HBA90
L_1F46: FAC! = N_BA90! + N_C980!  ' RT3F_7F
L_1F49: BX = CINT(FAC!)  ' RT3F_77
L_1F4C: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_1F4F: PRINT S(BX);  ' RT3F_6A
L_1F52: BX = &HC6C8
L_1F55: PRINT S_C6C8$;  ' RT3F_6A
L_1F58: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1F5B: DI = &H804E
L_1F5E: SI = &HBA90
L_1F61: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_1F64: DI = &HBA90
L_1F67: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_1F6A: SI = DI
L_1F6C: DI = &HC10C
L_1F6F: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_1F72: IF CompareLeft! > CompareRight! THEN GOTO L_1F77  ' flags from L_1F6F
L_1F74: GOTO L_1EAE
L_1F77: SI = &H804E
L_1F7A: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_1F7D: GOTO L_21C1
L_1F80: DI = &HC110
L_1F83: SI = &HBFA6
L_1F86: N_C110! = N_BFA6!  ' RT3F_7B
L_1F89: DI = &HC114
L_1F8C: SI = &HC762
L_1F8F: N_C114! = N_C762!  ' RT3F_7B
L_1F92: GOSUB L_06A9
L_1F95: DI = &HC984
L_1F98: N_C984! = FAC!: SI = &H001A  ' RT3F_7D
L_1F9B: SI = DI
L_1F9D: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_1FA0: IF CompareLeft! <> CompareRight! THEN GOTO L_1FA5  ' flags from L_1F9D
L_1FA2: GOTO L_20D0
L_1FA5: DI = &HC184
L_1FA8: SI = &HC984
L_1FAB: FAC! = N_C984! * N_C184!  ' RT3F_8F
L_1FAE: DI = &HC94E
L_1FB1: FAC! = FAC! + N_C94E!  ' RT3F_81
L_1FB4: DI = &HC94A
L_1FB7: N_C94A! = FAC!: SI = &H001A  ' RT3F_7D
L_1FBA: SI = DI
L_1FBC: BX = CINT(N_C94A!)  ' RT3F_75
L_1FBF: SI = BX
L_1FC1: SI = SI * (2 ^ 1)
L_1FC3: SI = SI * (2 ^ 1)
L_1FC5: SI = SI + &H1850
L_1FC9: BX = DI
L_1FCB: DI = &HC988
L_1FCE: N_C988! = N(SI)  ' RT3F_7B
L_1FD1: SI = DI
L_1FD3: DI = &H804E
L_1FD6: CompareLeft! = N_C988!: CompareRight! = N_804E!  ' RT3F_9F
L_1FD9: DX = 0
L_1FDC: IF CompareLeft! >= CompareRight! THEN GOTO L_1FDF  ' flags from L_1FD6
L_1FDE: DX = DX - 1
L_1FDF: SI = BX
L_1FE1: DI = &HBB56
L_1FE4: FAC! = N(SI) + N_BB56!  ' RT3F_7F
L_1FE7: BX = CINT(FAC!)  ' RT3F_77
L_1FEA: SI = BX
L_1FEC: SI = SI * (2 ^ 1)
L_1FEE: SI = SI * (2 ^ 1)
L_1FF0: SI = SI + &H1850
L_1FF4: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_1FF7: BX = 0
L_1FFA: IF CompareLeft! = CompareRight! THEN GOTO L_1FFD  ' flags from L_1FF4
L_1FFC: BX = BX - 1
L_1FFD: BX = BX OR DX
L_1FFF: CompareLeft% = BX: CompareRight% = 0
L_2001: IF CompareLeft% = CompareRight% THEN GOTO L_2006  ' flags from L_1FFF
L_2003: GOTO L_20D0
L_2006: DI = &H9412
L_2009: SI = &HC762
L_200C: FAC! = N_C762! + N_9412!  ' RT3F_7F
L_200F: DI = &HC98C
L_2012: N_C98C! = FAC!: SI = &H001A  ' RT3F_7D
L_2015: SI = &HC1A0
L_2018: FAC! = N_C1A0!: DI = &H001E  ' RT3F_6F
L_201B: GOTO L_20BD
L_201E: SI = &HC634
L_2021: BX = SI
L_2023: DX = BX
L_2025: BX = CINT(N_C634!)  ' RT3F_75
L_2028: SI = BX
L_202A: SI = SI * (2 ^ 1)
L_202C: SI = SI * (2 ^ 1)
L_202E: SI = SI + &H1850
L_2032: DI = &HC988
L_2035: CompareLeft! = N(SI): CompareRight! = N_C988!  ' RT3F_9F
L_2038: BX = 0
L_203B: IF CompareLeft! <> CompareRight! THEN GOTO L_203E  ' flags from L_2035
L_203D: BX = BX - 1
L_203E: SWAP DX, SI
L_2040: DI = &H9412
L_2043: FAC! = N(SI) + N_9412!  ' RT3F_7F
L_2046: CX = SI
L_2048: AX = BX
L_204A: BX = CINT(FAC!)  ' RT3F_77
L_204D: SI = BX
L_204F: SI = SI * (2 ^ 1)
L_2051: SI = SI * (2 ^ 1)
L_2053: SI = SI + &H1850
L_2057: DI = &HC98C
L_205A: CompareLeft! = N(SI): CompareRight! = N_C98C!  ' RT3F_9F
L_205D: BX = 0
L_2060: IF CompareLeft! <> CompareRight! THEN GOTO L_2063  ' flags from L_205A
L_2062: BX = BX - 1
L_2063: BX = BX AND AX
L_2065: CompareLeft% = BX: CompareRight% = 0
L_2067: IF CompareLeft% <> CompareRight% THEN GOTO L_206C  ' flags from L_2065
L_2069: GOTO L_20B4
L_206C: DI = DX
L_206E: SI = &HBB46
L_2071: N(DI) = N_BB46!  ' RT3F_7B
L_2074: DI = CX
L_2076: SI = &HC990
L_2079: N(DI) = N_C990!  ' RT3F_7B
L_207C: DI = &HBB56
L_207F: SI = &HC94A
L_2082: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_2085: BX = SI
L_2087: DX = BX
L_2089: BX = CINT(FAC!)  ' RT3F_77
L_208C: DI = BX
L_208E: DI = DI * (2 ^ 1)
L_2090: DI = DI * (2 ^ 1)
L_2092: DI = DI + &H1850
L_2096: SI = DX
L_2098: BX = DI
L_209A: DI = &HBA94
L_209D: FAC! = N(SI) + N_BA94!  ' RT3F_7F
L_20A0: DX = BX
L_20A2: BX = CINT(FAC!)  ' RT3F_77
L_20A5: SI = BX
L_20A7: SI = SI * (2 ^ 1)
L_20A9: SI = SI * (2 ^ 1)
L_20AB: SI = SI + &H1850
L_20AF: DI = DX
L_20B1: N(DI) = N(SI)  ' RT3F_7B
L_20B4: DI = &HBB56
L_20B7: SI = &HC634
L_20BA: FAC! = N_C634! + N_BB56!  ' RT3F_7F
L_20BD: DI = &HC634
L_20C0: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_20C3: SI = DI
L_20C5: DI = &HC1A4
L_20C8: CompareLeft! = N_C634!: CompareRight! = N_C1A4!  ' RT3F_9F
L_20CB: IF CompareLeft! > CompareRight! THEN GOTO L_20D0  ' flags from L_20C8
L_20CD: GOTO L_201E
L_20D0: DI = &HC120
L_20D3: SI = &HC160
L_20D6: N_C120! = N_C160!  ' RT3F_7B
L_20D9: BX = DI
L_20DB: DI = &HC124
L_20DE: SI = &HC762
L_20E1: N_C124! = N_C762!  ' RT3F_7B
L_20E4: GOSUB L_06DB
L_20E7: BX = CINT(FAC!)  ' RT3F_77
L_20EA: DI = BX
L_20EC: DI = DI * (2 ^ 1)
L_20EE: DI = DI * (2 ^ 1)
L_20F0: DI = DI + &H1850
L_20F4: BX = DI
L_20F6: DI = &HC110
L_20F9: SI = &HC1BC
L_20FC: N_C110! = N_C1BC!  ' RT3F_7B
L_20FF: DX = DI
L_2101: DI = &HC114
L_2104: SI = &HC762
L_2107: N_C114! = N_C762!  ' RT3F_7B
L_210A: WORD(BP - &HC) = BX
L_210D: GOSUB L_06A9
L_2110: DI = WORD(BP - &HC)
L_2113: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2116: DI = &HC120
L_2119: SI = &HC1B0
L_211C: N_C120! = N_C1B0!  ' RT3F_7B
L_211F: BX = DI
L_2121: DI = &HC124
L_2124: SI = &HC762
L_2127: N_C124! = N_C762!  ' RT3F_7B
L_212A: GOSUB L_06DB
L_212D: BX = CINT(FAC!)  ' RT3F_77
L_2130: DI = BX
L_2132: DI = DI * (2 ^ 1)
L_2134: DI = DI * (2 ^ 1)
L_2136: DI = DI + &H1850
L_213A: BX = DI
L_213C: DI = &HC110
L_213F: SI = &HC0F4
L_2142: N_C110! = N_C0F4!  ' RT3F_7B
L_2145: DX = DI
L_2147: DI = &HC114
L_214A: CX = SI
L_214C: SI = &HC762
L_214F: N_C114! = N_C762!  ' RT3F_7B
L_2152: WORD(BP - &HE) = BX
L_2155: GOSUB L_06A9
L_2158: DI = &HC16C
L_215B: FAC! = FAC! / N_C16C!  ' RT3F_89
L_215E: BX = &H1A
L_2161: FAC! = INT(FAC!)  ' RT3D_03
L_2164: DI = WORD(BP - &HE)
L_2167: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_216A: DI = &HC120
L_216D: SI = &HC0F0
L_2170: N_C120! = N_C0F0!  ' RT3F_7B
L_2173: DI = &HC124
L_2176: SI = &HC762
L_2179: N_C124! = N_C762!  ' RT3F_7B
L_217C: GOSUB L_06DB
L_217F: BX = CINT(FAC!)  ' RT3F_77
L_2182: DI = BX
L_2184: DI = DI * (2 ^ 1)
L_2186: DI = DI * (2 ^ 1)
L_2188: DI = DI + &H1850
L_218C: BX = DI
L_218E: DI = &HC110
L_2191: SI = &HC0F4
L_2194: N_C110! = N_C0F4!  ' RT3F_7B
L_2197: DI = &HC114
L_219A: SI = &HC762
L_219D: N_C114! = N_C762!  ' RT3F_7B
L_21A0: WORD(BP - &H10) = BX
L_21A3: GOSUB L_06A9
L_21A6: DI = &HC1B4
L_21A9: FAC! = FAC! / N_C1B4!  ' RT3F_89
L_21AC: BX = &H1A
L_21AF: FAC! = INT(FAC!)  ' RT3D_03
L_21B2: DI = WORD(BP - &H10)
L_21B5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_21B8: DI = &H804E
L_21BB: SI = &HC762
L_21BE: FAC! = N_C762! + N_804E!  ' RT3F_7F
L_21C1: DI = &HC762
L_21C4: N_C762! = FAC!: SI = &H001A  ' RT3F_7D
L_21C7: SI = DI
L_21C9: DI = &HC10C
L_21CC: CompareLeft! = N_C762!: CompareRight! = N_C10C!  ' RT3F_9F
L_21CF: IF CompareLeft! > CompareRight! THEN GOTO L_21D4  ' flags from L_21CC
L_21D1: GOTO L_1F80
L_21D4: BX = &H19
L_21D7: ARGPUSH BX  ' RT3E_42
L_21DA: BX = 1
L_21DD: LOCATE ARGS(), BX  ' RT3E_44
L_21E0: GOSUB L_2C63
L_21E3: GOTO L_22AC
L_21E6: DI = &HC120
L_21E9: SI = &HC1B4
L_21EC: N_C120! = N_C1B4!  ' RT3F_7B
L_21EF: BX = DI
L_21F1: DI = &HC124
L_21F4: SI = &HBA90
L_21F7: N_C124! = N_BA90!  ' RT3F_7B
L_21FA: GOSUB L_06DB
L_21FD: BX = CINT(FAC!)  ' RT3F_77

```

### Combat map and squad displays

```basic
L_2200: DI = BX
L_2202: DI = DI * (2 ^ 1)
L_2204: DI = DI * (2 ^ 1)
L_2206: DI = DI + &H1850
L_220A: SI = &HC994
L_220D: N(DI) = N_C994!  ' RT3F_7B
L_2210: DI = &HC120
L_2213: SI = &HC970
L_2216: N_C120! = N_C970!  ' RT3F_7B
L_2219: BX = DI
L_221B: DI = &HC124
L_221E: SI = &HBA90
L_2221: N_C124! = N_BA90!  ' RT3F_7B
L_2224: GOSUB L_06DB
L_2227: BX = CINT(FAC!)  ' RT3F_77
L_222A: DI = BX
L_222C: DI = DI * (2 ^ 1)
L_222E: DI = DI * (2 ^ 1)
L_2230: DI = DI + &H1850
L_2234: SI = &HC998
L_2237: N(DI) = N_C998!  ' RT3F_7B
L_223A: DI = &HC120
L_223D: SI = &HC974
L_2240: N_C120! = N_C974!  ' RT3F_7B
L_2243: DI = &HC124
L_2246: SI = &HBA90
L_2249: N_C124! = N_BA90!  ' RT3F_7B
L_224C: GOSUB L_06DB
L_224F: BX = CINT(FAC!)  ' RT3F_77
L_2252: DI = BX
L_2254: DI = DI * (2 ^ 1)
L_2256: DI = DI * (2 ^ 1)
L_2258: DI = DI + &H1850
L_225C: SI = &HC99C
L_225F: N(DI) = N_C99C!  ' RT3F_7B
L_2262: RETURN
L_2263: DI = &HC120
L_2266: SI = &HC9A0
L_2269: N_C120! = N_C9A0!  ' RT3F_7B
L_226C: DI = &HC124
L_226F: SI = &HC942
L_2272: N_C124! = N_C942!  ' RT3F_7B
L_2275: GOSUB L_06DB
L_2278: BX = CINT(FAC!)  ' RT3F_77
L_227B: DI = BX
L_227D: DI = DI * (2 ^ 1)
L_227F: DI = DI * (2 ^ 1)
L_2281: DI = DI + &H1850
L_2285: BX = DI
L_2287: DI = &HC110
L_228A: SI = &HC17C
L_228D: N_C110! = N_C17C!  ' RT3F_7B
L_2290: DI = &HC114
L_2293: SI = &HC942
L_2296: N_C114! = N_C942!  ' RT3F_7B
L_2299: WORD(BP - &HC) = BX
L_229C: GOSUB L_06A9
L_229F: DI = &HBB56
L_22A2: FAC! = FAC! * N_BB56!  ' RT3F_91
L_22A5: DI = WORD(BP - &HC)
L_22A8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_22AB: RETURN
L_22AC: BX = &HFFFF
L_22AF: CLS BX  ' RT3E_32
L_22B2: BX = 2
L_22B5: DX = 0
L_22B7: CX = DX
L_22B9: AX = CX
L_22BB: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_22BE: BX = 4
L_22C1: DX = 1
L_22C4: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_22C7: BX = &HFFFF
L_22CA: CX = BX
L_22CC: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_22CF: CX = AX
L_22D1: BX = 3
L_22D4: DX = 2
L_22D7: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_22DA: DX = 5
L_22DD: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_22E0: BX = &HFFFF
L_22E3: DX = BX
L_22E5: CX = DX
L_22E7: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_22EA: BX = AX
L_22EC: CX = AX
L_22EE: DX = 3
L_22F1: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_22F4: BX = 6
L_22F7: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_22FA: BX = &HFFFF
L_22FD: DX = BX
L_22FF: CX = DX
L_2301: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2304: CX = AX
L_2306: BX = 1
L_2309: DX = 7
L_230C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_230F: BX = 3
L_2312: DX = 5
L_2315: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2318: BX = &HFFFF
L_231B: DX = BX
L_231D: CX = DX
L_231F: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2322: CX = AX
L_2324: BX = 5
L_2327: DX = 7
L_232A: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_232D: BX = &HFFFF
L_2330: DX = BX
L_2332: CX = DX
L_2334: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2337: BX = AX
L_2339: DX = AX
L_233B: CX = AX
L_233D: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_2340: BX = 7
L_2343: DX = BX
L_2345: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_2348: BX = &HBA58
L_234B: DX = &H24
L_234E: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_2351: BX = &HFFFF
L_2354: CLS BX  ' RT3E_32
L_2357: BX = 1
L_235A: DX = BX
L_235C: CX = 0
L_235E: AX = CX
L_2360: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2363: BX = &H13E
L_2366: DX = &HC6
L_2369: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_236C: DX = AX
L_236E: BX = 2
L_2371: CX = &HFFFF
L_2374: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2377: CX = AX
L_2379: BX = 2
L_237C: DX = BX
L_237E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2381: BX = &H13D
L_2384: DX = &HC5
L_2387: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_238A: DX = AX
L_238C: BX = 2
L_238F: CX = &HFFFF
L_2392: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2395: BX = AX
L_2397: CX = AX
L_2399: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_239C: BX = &H13F
L_239F: DX = &HC7
L_23A2: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_23A5: DX = AX
L_23A7: BX = 2
L_23AA: CX = &HFFFF
L_23AD: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_23B0: BX = 5
L_23B3: DX = BX
L_23B5: CX = 0
L_23B7: AX = CX
L_23B9: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_23BC: BX = &H62
L_23BF: DX = &H52
L_23C2: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_23C5: DX = AX
L_23C7: BX = 2
L_23CA: CX = &HFFFF
L_23CD: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_23D0: CX = AX
L_23D2: BX = 6
L_23D5: DX = BX
L_23D7: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_23DA: BX = &H61
L_23DD: DX = &H51
L_23E0: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_23E3: SWAP DX, AX
L_23E4: BX = 2
L_23E7: CX = &HFFFF
L_23EA: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_23ED: SWAP DX, CX
L_23EF: AX = CX
L_23F1: BX = 7
L_23F4: DX = 6
L_23F7: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_23FA: BX = &H60
L_23FD: DX = &H51
L_2400: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2403: DX = AX
L_2405: BX = 2
L_2408: CX = &HFFFF
L_240B: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_240E: CX = AX
L_2410: BX = 7
L_2413: DX = &H18
L_2416: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2419: BX = &H60
L_241C: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_241F: BX = 2
L_2422: DX = &HFFFF
L_2425: CX = DX
L_2427: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_242A: BX = &HC5
L_242D: DX = &H1D
L_2430: CX = 0
L_2432: AX = CX
L_2434: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2437: BX = &H13A
L_243A: DX = &H92
L_243D: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2440: DX = AX
L_2442: BX = 2
L_2445: CX = &HFFFF
L_2448: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_244B: CX = AX
L_244D: BX = &HC6
L_2450: DX = &H1E
L_2453: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2456: BX = &H139
L_2459: DX = &H91
L_245C: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_245F: DX = AX
L_2461: BX = 2
L_2464: CX = &HFFFF
L_2467: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_246A: CX = AX
L_246C: BX = &HC7
L_246F: DX = &H1F
L_2472: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2475: BX = &H138
L_2478: DX = &H90
L_247B: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_247E: DX = AX
L_2480: BX = 2
L_2483: CX = &HFFFF
L_2486: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2489: BX = 5
L_248C: DX = &H95
L_248F: CX = 0
L_2491: AX = CX
L_2493: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2496: BX = &H13A
L_2499: DX = &HC2
L_249C: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_249F: DX = AX
L_24A1: BX = 2
L_24A4: CX = &HFFFF
L_24A7: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_24AA: CX = AX
L_24AC: BX = 6
L_24AF: DX = &H96
L_24B2: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_24B5: BX = &H139
L_24B8: DX = &HC1
L_24BB: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_24BE: DX = AX
L_24C0: BX = 2
L_24C3: CX = &HFFFF
L_24C6: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_24C9: CX = AX
L_24CB: BX = 7
L_24CE: DX = &H97
L_24D1: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_24D4: BX = &H138
L_24D7: DX = &HC0
L_24DA: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_24DD: DX = AX
L_24DF: BX = 2
L_24E2: CX = &HFFFF
L_24E5: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_24E8: GOTO L_2719
L_24EB: SI = &H804E
L_24EE: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_24F1: GOTO L_2530
L_24F4: SI = &HBA90
L_24F7: FAC! = N_BA90! * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_24FB: DI = &H9412
L_24FE: BX = SI
L_2500: FAC! = FAC! + N_9412!  ' RT3F_81
L_2503: DX = BX
L_2505: BX = CINT(FAC!)  ' RT3F_77
L_2508: ARGPUSH BX  ' RT3E_42
L_250B: BX = &HE
L_250E: LOCATE ARGS(), BX  ' RT3E_44
L_2511: ' PRINT statement begins ; RT3F_BC
L_2514: SI = DX
L_2516: DI = &HC9A4
L_2519: FAC! = N(SI) + N_C9A4!  ' RT3F_7F
L_251C: BX = CINT(FAC!)  ' RT3F_77
L_251F: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_2522: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_2525: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2528: SI = DX
L_252A: DI = &H804E
L_252D: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_2530: DI = &HBA90
L_2533: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_2536: SI = DI
L_2538: DI = &HBA94
L_253B: CompareLeft! = N_BA90!: CompareRight! = N_BA94!  ' RT3F_9F
L_253E: IF CompareLeft! <= CompareRight! THEN GOTO L_24F4  ' flags from L_253B
L_2540: BX = 2
L_2543: ARGPUSH BX  ' RT3E_42
L_2546: BX = &H10
L_2549: LOCATE ARGS(), BX  ' RT3E_44
L_254C: ' PRINT statement begins ; RT3F_BC
L_254F: BX = &HC9A8
L_2552: PRINT S_C9A8$  ' RT3F_6E; H newline item, ledger correction
L_2555: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2558: BX = &H67
L_255B: DX = 6
L_255E: CX = 0
L_2560: AX = CX
L_2562: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_2565: BX = &HC2
L_2568: DX = &H52
L_256B: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_256E: DX = AX
L_2570: BX = &H803A
L_2573: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_2576: GOTO L_260F
L_2579: BX = &HC
L_257C: ARGPUSH BX  ' RT3E_42
L_257F: BX = 5
L_2582: LOCATE ARGS(), BX  ' RT3E_44
L_2585: ' PRINT statement begins ; RT3F_BC
L_2588: BX = &HC9B6
L_258B: PRINT S_C9B6$  ' RT3F_6E; H newline item, ledger correction
L_258E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2591: BX = 8
L_2594: DX = &H58
L_2597: CX = 0
L_2599: AX = CX
L_259B: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_259E: BX = &HBF
L_25A1: DX = &H5F
L_25A4: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_25A7: DX = AX
L_25A9: BX = &H8030
L_25AC: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_25AF: GOTO L_2667
L_25B2: BX = &HC5
L_25B5: DX = 5
L_25B8: CX = 0
L_25BA: AX = CX
L_25BC: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_25BF: BX = &H13A
L_25C2: DX = &H1A
L_25C5: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_25C8: BX = 2
L_25CB: DX = 1
L_25CE: CX = &HFFFF
L_25D1: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_25D4: SI = &H19B4
L_25D7: CompareLeft! = N_19B4!: CompareRight! = 0  ' RT3F_A7
L_25DA: IF CompareLeft! = CompareRight! THEN GOTO L_25DF  ' flags from L_25D7
L_25DC: GOTO L_25F6
L_25DF: CX = AX
L_25E1: BX = &HD7
L_25E4: DX = 6
L_25E7: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_25EA: BX = &H40F4
L_25ED: DX = 1
L_25F0: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_25F3: GOTO L_260C
L_25F6: BX = &HD7
L_25F9: DX = &HA
L_25FC: CX = 0
L_25FE: AX = CX
L_2600: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_2603: BX = &H8044
L_2606: DX = &HFF03
L_2609: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_260C: GOTO L_2579
L_260F: BX = &H65
L_2612: DX = 5
L_2615: CX = 0
L_2617: AX = CX
L_2619: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_261C: BX = &HC2
L_261F: DX = &H52
L_2622: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2625: BX = 2
L_2628: DX = 1
L_262B: CX = &HFFFF
L_262E: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2631: CX = AX
L_2633: BX = &H70
L_2636: DX = &H10
L_2639: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_263C: BX = &HBF
L_263F: DX = &H4F
L_2642: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2645: BX = 0
L_2647: DX = 1
L_264A: CX = &HFFFF
L_264D: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2650: CX = AX
L_2652: BX = &H66
L_2655: DX = 5
L_2658: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_265B: BX = &H803A
L_265E: DX = &HFF00
L_2661: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_2664: GOTO L_26BF
L_2667: BX = 5
L_266A: DX = &H55
L_266D: CX = 0
L_266F: AX = CX
L_2671: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2674: BX = &HC2
L_2677: DX = &H92
L_267A: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_267D: BX = 2
L_2680: DX = 1
L_2683: CX = &HFFFF
L_2686: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2689: CX = AX
L_268B: BX = 8
L_268E: DX = &H60
L_2691: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2694: BX = &HBF
L_2697: DX = &H8F
L_269A: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_269D: BX = 0
L_269F: DX = 1
L_26A2: CX = &HFFFF
L_26A5: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_26A8: CX = AX
L_26AA: BX = 8
L_26AD: DX = &H57
L_26B0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_26B3: BX = &H8030
L_26B6: DX = &HFF00
L_26B9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_26BC: GOTO L_24EB
L_26BF: SI = &H804E
L_26C2: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_26C5: GOTO L_2706
L_26C8: DI = &HC184
L_26CB: SI = &HBA90
L_26CE: FAC! = N_BA90! + N_C184!  ' RT3F_7F
L_26D1: BX = SI
L_26D3: DX = BX
L_26D5: BX = CINT(FAC!)  ' RT3F_77
L_26D8: ARGPUSH BX  ' RT3E_42
L_26DB: BX = 2
L_26DE: LOCATE ARGS(), BX  ' RT3E_44
L_26E1: ' PRINT statement begins ; RT3F_BC
L_26E4: SI = DX
L_26E6: DI = &HC980
L_26E9: FAC! = N(SI) + N_C980!  ' RT3F_7F
L_26EC: BX = CINT(FAC!)  ' RT3F_77
L_26EF: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_26F2: PRINT S(BX);  ' RT3F_6A
L_26F5: BX = &HC9CE
L_26F8: PRINT S_C9CE$  ' RT3F_6E; H newline item, ledger correction
L_26FB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_26FE: SI = DX
L_2700: DI = &H804E
L_2703: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_2706: DI = &HBA90
L_2709: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_270C: SI = DI
L_270E: DI = &HC10C
L_2711: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_2714: IF CompareLeft! <= CompareRight! THEN GOTO L_26C8  ' flags from L_2711
L_2716: GOTO L_286F
L_2719: SI = &H19B4
L_271C: FAC! = N_19B4! * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_2720: SI = &HBB56
L_2723: FAC! = N_BB56! - FAC!  ' RT3F_9B
L_2726: DI = &HC9D4
L_2729: N_C9D4! = FAC!: SI = &H001A  ' RT3F_7D
L_272C: BX = 3
L_272F: DX = BX
L_2731: CX = 0
L_2733: AX = CX
L_2735: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2738: BX = &H13C
L_273B: DX = 4
L_273E: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2741: SI = DI
L_2743: DX = BX
L_2745: BX = CINT(N(SI))  ' RT3F_19
L_2748: DX = 1
L_274B: CX = &HFFFF
L_274E: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2751: CX = AX
L_2753: WORD(BP - &HC) = BX
L_2756: BX = 3
L_2759: DX = &HC3
L_275C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_275F: BX = &H13C
L_2762: DX = &HC4
L_2765: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2768: BX = WORD(BP - &HC)
L_276B: DX = 1
L_276E: CX = &HFFFF
L_2771: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2774: CX = AX
L_2776: BX = 3
L_2779: DX = &H93
L_277C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_277F: BX = &H13C
L_2782: DX = &H94
L_2785: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2788: BX = WORD(BP - &HC)
L_278B: DX = 1
L_278E: CX = &HFFFF
L_2791: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2794: BX = 3
L_2797: DX = &H53
L_279A: CX = 0
L_279C: AX = CX
L_279E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_27A1: BX = &HC2
L_27A4: DX = &H54
L_27A7: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_27AA: SI = &HC9D4
L_27AD: BX = CINT(N(SI))  ' RT3F_19
L_27B0: DX = 1
L_27B3: CX = &HFFFF
L_27B6: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_27B9: CX = AX
L_27BB: WORD(BP - &HC) = BX
L_27BE: BX = &HC5
L_27C1: DX = &H1B
L_27C4: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_27C7: BX = &H13A
L_27CA: DX = &H1C
L_27CD: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_27D0: BX = WORD(BP - &HC)
L_27D3: DX = 1
L_27D6: CX = &HFFFF
L_27D9: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_27DC: BX = 3
L_27DF: DX = 5
L_27E2: CX = 0
L_27E4: AX = CX
L_27E6: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_27E9: BX = 4
L_27EC: DX = &HC2
L_27EF: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_27F2: SI = &HC9D4
L_27F5: BX = CINT(N(SI))  ' RT3F_19
L_27F8: DX = 1
L_27FB: CX = &HFFFF
L_27FE: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2801: CX = AX
L_2803: WORD(BP - &HC) = BX
L_2806: BX = &H13B
L_2809: DX = 5
L_280C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_280F: BX = &H13C
L_2812: DX = &HC2
L_2815: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2818: BX = WORD(BP - &HC)
L_281B: DX = 1
L_281E: CX = &HFFFF
L_2821: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2824: BX = &H63
L_2827: DX = 5
L_282A: CX = 0
L_282C: AX = CX
L_282E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2831: BX = &H64
L_2834: DX = &H52
L_2837: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_283A: SI = &HC9D4
L_283D: BX = CINT(N(SI))  ' RT3F_19
L_2840: DX = 1
L_2843: CX = &HFFFF
L_2846: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2849: CX = AX
L_284B: WORD(BP - &HC) = BX
L_284E: BX = &HC3
L_2851: DX = 5
L_2854: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2857: BX = &HC4
L_285A: DX = &H92
L_285D: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2860: BX = WORD(BP - &HC)
L_2863: DX = 1
L_2866: CX = &HFFFF
L_2869: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_286C: GOTO L_25B2
L_286F: GOSUB L_9B06
L_2872: GOSUB L_2C93
L_2875: DI = &HC6B0
L_2878: SI = &HC63C
L_287B: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_287E: DI = &HC9D8
L_2881: N_C9D8! = FAC!: SI = &H001A  ' RT3F_7D
L_2884: SI = &HC6B4
L_2887: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_288A: GOTO L_28D9
L_288D: ' Alignment NOP
L_288E: SI = &HC9DC
L_2891: BX = CINT(N_C9DC!)  ' RT3F_75
L_2894: SI = BX
L_2896: SI = SI * (2 ^ 1)
L_2898: SI = SI * (2 ^ 1)
L_289A: SI = SI + &HC604
L_289E: DI = &HC6B0
L_28A1: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_28A4: DI = &HC9E0
L_28A7: N_C9E0! = FAC!: SI = &H001A  ' RT3F_7D
L_28AA: SI = &HC6B4
L_28AD: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_28B0: GOTO L_28C0
L_28B3: ' Alignment NOP
L_28B4: GOSUB L_9F76
L_28B7: DI = &H804E
L_28BA: SI = &HC9E4
L_28BD: FAC! = N_C9E4! + N_804E!  ' RT3F_7F
L_28C0: DI = &HC9E4
L_28C3: N_C9E4! = FAC!: SI = &H001A  ' RT3F_7D
L_28C6: SI = DI
L_28C8: DI = &HC9E0
L_28CB: CompareLeft! = N_C9E4!: CompareRight! = N_C9E0!  ' RT3F_9F
L_28CE: IF CompareLeft! <= CompareRight! THEN GOTO L_28B4  ' flags from L_28CB
L_28D0: DI = &H804E
L_28D3: SI = &HC9DC
L_28D6: FAC! = N_C9DC! + N_804E!  ' RT3F_7F
L_28D9: DI = &HC9DC
L_28DC: N_C9DC! = FAC!: SI = &H001A  ' RT3F_7D
L_28DF: SI = DI
L_28E1: DI = &HC9D8
L_28E4: CompareLeft! = N_C9DC!: CompareRight! = N_C9D8!  ' RT3F_9F
L_28E7: IF CompareLeft! <= CompareRight! THEN GOTO L_288E  ' flags from L_28E4
L_28E9: GOSUB L_96FC
L_28EC: GOSUB L_2D98
L_28EF: BX = &HC8
L_28F2: DX = &H20
L_28F5: CX = 0
L_28F7: AX = CX
L_28F9: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_28FC: BX = &H137
L_28FF: DX = &H8F
L_2902: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_2905: DX = AX
L_2907: BX = &H8030
L_290A: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_290D: GOSUB L_4E3D
L_2910: GOTO L_70F6

```

### Selection and stat helpers

```basic
L_2913: GOSUB L_9B06
L_2916: DI = &HC6A8
L_2919: SI = &H19B0
L_291C: FAC! = N_19B0! * N_C6A8!  ' RT3F_8F
L_291F: DI = &HC9E8
L_2922: N_C9E8! = FAC!: SI = &H001A  ' RT3F_7D
L_2925: SI = &H804E
L_2928: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_292B: GOTO L_2937
L_292E: DI = &H804E
L_2931: SI = &HC9EC
L_2934: FAC! = N_C9EC! + N_804E!  ' RT3F_7F
L_2937: DI = &HC9EC
L_293A: N_C9EC! = FAC!: SI = &H001A  ' RT3F_7D
L_293D: SI = DI
L_293F: DI = &HC9E8
L_2942: CompareLeft! = N_C9EC!: CompareRight! = N_C9E8!  ' RT3F_9F
L_2945: IF CompareLeft! <= CompareRight! THEN GOTO L_292E  ' flags from L_2942
L_2947: GOSUB L_9B06
L_294A: DI = &HBB52
L_294D: SI = &H19B0
L_2950: FAC! = N_19B0! * N_BB52!  ' RT3F_8F
L_2953: DI = &HC9F0
L_2956: N_C9F0! = FAC!: SI = &H001A  ' RT3F_7D
L_2959: SI = &H804E
L_295C: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_295F: GOTO L_296B
L_2962: DI = &H804E
L_2965: SI = &HC9EC
L_2968: FAC! = N_C9EC! + N_804E!  ' RT3F_7F
L_296B: DI = &HC9EC
L_296E: N_C9EC! = FAC!: SI = &H001A  ' RT3F_7D
L_2971: SI = DI
L_2973: DI = &HC9F0
L_2976: CompareLeft! = N_C9EC!: CompareRight! = N_C9F0!  ' RT3F_9F
L_2979: IF CompareLeft! <= CompareRight! THEN GOTO L_2962  ' flags from L_2976
L_297B: GOSUB L_9B06
L_297E: RETURN
L_297F: BX = &H18
L_2982: ARGPUSH BX  ' RT3E_42
L_2985: BX = 2
L_2988: LOCATE ARGS(), BX  ' RT3E_44
L_298B: ' PRINT statement begins ; RT3F_BC
L_298E: BX = &HC9F4
L_2991: PRINT S_C9F4$;  ' RT3F_6A
L_2994: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2997: GOSUB L_2DBF
L_299A: RETURN
L_299B: DI = &HC130
L_299E: SI = &H1988
L_29A1: FAC! = N_1988! * N_C130!  ' RT3F_8F
L_29A4: DI = &H198C
L_29A7: FAC! = FAC! + N_198C!  ' RT3F_81
L_29AA: DI = &HCA06
L_29AD: FAC! = FAC! + N_CA06!  ' RT3F_81
L_29B0: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_29B3: SI = DI
L_29B5: DI = &HCA0A
L_29B8: CompareLeft! = N(SI): CompareRight! = N_CA0A!  ' RT3F_9F
L_29BB: IF CompareLeft! > CompareRight! THEN GOTO L_29C0  ' flags from L_29B8
L_29BD: GOTO L_29C5
L_29C0: SWAP DI, SI
L_29C2: N(DI) = N(SI)  ' RT3F_7B
L_29C5: DI = &HC130
L_29C8: SI = &HCA06
L_29CB: FAC! = N_CA06! / N_C130!  ' RT3F_87
L_29CE: BX = DI
L_29D0: DI = &H1988
L_29D3: DX = SI
L_29D5: N_1988! = FAC!: SI = &H001A  ' RT3F_7D
L_29D8: SWAP BX, DI
L_29DA: SI = BX
L_29DC: FAC! = N_1988! * N(DI)  ' RT3F_8F
L_29DF: SI = DX
L_29E1: FAC! = N(SI) - FAC!  ' RT3F_9B
L_29E4: DI = &H198C
L_29E7: N_198C! = FAC!: SI = &H001A  ' RT3F_7D
L_29EA: RETURN
L_29EB: DI = &HC184
L_29EE: SI = &HBA90
L_29F1: FAC! = N_BA90! + N_C184!  ' RT3F_7F
L_29F4: BX = SI
L_29F6: DX = BX
L_29F8: BX = CINT(FAC!)  ' RT3F_77
L_29FB: ARGPUSH BX  ' RT3E_42
L_29FE: BX = &H16
L_2A01: LOCATE ARGS(), BX  ' RT3E_44
L_2A04: BX = DI
L_2A06: DI = &HC110
L_2A09: SI = &HBFA6
L_2A0C: N_C110! = N_BFA6!  ' RT3F_7B
L_2A0F: SI = DX
L_2A11: DI = &HC114
L_2A14: N_C114! = N(SI)  ' RT3F_7B
L_2A17: GOSUB L_06A9
L_2A1A: DI = &HC946
L_2A1D: N_C946! = FAC!: SI = &H001A  ' RT3F_7D
L_2A20: SI = DI
L_2A22: DI = &HC184
L_2A25: FAC! = N_C946! * N_C184!  ' RT3F_8F
L_2A28: DI = &HC94E
L_2A2B: FAC! = FAC! + N_C94E!  ' RT3F_81
L_2A2E: DI = &HC94A
L_2A31: N_C94A! = FAC!: SI = &H001A  ' RT3F_7D
L_2A34: SI = DI
L_2A36: BX = CINT(N_C94A!)  ' RT3F_75
L_2A39: SI = BX
L_2A3B: SI = SI * (2 ^ 1)
L_2A3D: SI = SI * (2 ^ 1)
L_2A3F: SI = SI + &H1850
L_2A43: BX = DI
L_2A45: DI = &HC984
L_2A48: N_C984! = N(SI)  ' RT3F_7B
L_2A4B: SI = BX
L_2A4D: DI = &HC178
L_2A50: FAC! = N_C94A! + N_C178!  ' RT3F_7F
L_2A53: BX = CINT(FAC!)  ' RT3F_77
L_2A56: SI = BX
L_2A58: SI = SI * (2 ^ 1)
L_2A5A: SI = SI * (2 ^ 1)
L_2A5C: SI = SI + &H1850
L_2A60: DI = &HCA0E
L_2A63: N_CA0E! = N(SI)  ' RT3F_7B
L_2A66: DI = &H9412
L_2A69: SI = &HBA90
L_2A6C: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_2A6F: DI = &HC762
L_2A72: N_C762! = FAC!: SI = &H001A  ' RT3F_7D
L_2A75: DI = &HC762
L_2A78: SI = &HCA0E
L_2A7B: CompareLeft! = N_CA0E!: CompareRight! = N_C762!  ' RT3F_9F
L_2A7E: BX = 0
L_2A81: IF CompareLeft! = CompareRight! THEN GOTO L_2A84  ' flags from L_2A7B
L_2A83: BX = BX - 1
L_2A84: DI = &H804E
L_2A87: SI = &HC984
L_2A8A: CompareLeft! = N_C984!: CompareRight! = N_804E!  ' RT3F_9F
L_2A8D: DX = 0
L_2A90: IF CompareLeft! >= CompareRight! THEN GOTO L_2A93  ' flags from L_2A8A
L_2A92: DX = DX - 1
L_2A93: DX = DX OR BX
L_2A95: SI = &HC946
L_2A98: CompareLeft! = N_C946!: CompareRight! = N(DI)  ' RT3F_9F
L_2A9B: BX = 0
L_2A9E: IF CompareLeft! >= CompareRight! THEN GOTO L_2AA1  ' flags from L_2A98
L_2AA0: BX = BX - 1
L_2AA1: BX = BX OR DX
L_2AA3: CompareLeft% = BX: CompareRight% = 0
L_2AA5: IF CompareLeft% <> CompareRight% THEN GOTO L_2AAA  ' flags from L_2AA3
L_2AA7: GOTO L_2AB7
L_2AAA: ' PRINT statement begins ; RT3F_BC
L_2AAD: BX = &HCA12
L_2AB0: PRINT S_CA12$;  ' RT3F_6A
L_2AB3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2AB6: RETURN
L_2AB7: DI = &HBB56
L_2ABA: SI = &HC94A
L_2ABD: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_2AC0: BX = CINT(FAC!)  ' RT3F_77
L_2AC3: SI = BX
L_2AC5: SI = SI * (2 ^ 1)
L_2AC7: SI = SI * (2 ^ 1)
L_2AC9: SI = SI + &H1850
L_2ACD: DI = &HCA1A
L_2AD0: N_CA1A! = N(SI)  ' RT3F_7B
L_2AD3: SI = DI
L_2AD5: DI = &HC178
L_2AD8: CompareLeft! = N_CA1A!: CompareRight! = N_C178!  ' RT3F_9F
L_2ADB: IF CompareLeft! > CompareRight! THEN GOTO L_2AE0  ' flags from L_2AD8
L_2ADD: GOTO L_2AE5
L_2AE0: SWAP DI, SI
L_2AE2: N(DI) = N(SI)  ' RT3F_7B
L_2AE5: SI = &HCA1A
L_2AE8: CompareLeft! = N_CA1A!: CompareRight! = 0  ' RT3F_A7
L_2AEB: IF CompareLeft! < CompareRight! THEN GOTO L_2AF0  ' flags from L_2AE8
L_2AED: GOTO L_2AFD
L_2AF0: ' PRINT statement begins ; RT3F_BC
L_2AF3: BX = &HCA1E
L_2AF6: PRINT S_CA1E$;  ' RT3F_6A
L_2AF9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2AFC: RETURN
L_2AFD: DI = &HCA26
L_2B00: SI = &HC1DC
L_2B03: N_CA26! = N_C1DC!  ' RT3F_7B
L_2B06: SI = &HC1A0
L_2B09: FAC! = N_C1A0!: DI = &H001E  ' RT3F_6F
L_2B0C: GOTO L_2B6B
L_2B0F: ' Alignment NOP
L_2B10: SI = &HC766
L_2B13: BX = SI
L_2B15: DX = BX
L_2B17: BX = CINT(N_C766!)  ' RT3F_75
L_2B1A: SI = BX
L_2B1C: SI = SI * (2 ^ 1)
L_2B1E: SI = SI * (2 ^ 1)
L_2B20: SI = SI + &H1850
L_2B24: DI = &HC984
L_2B27: CompareLeft! = N(SI): CompareRight! = N_C984!  ' RT3F_9F
L_2B2A: AX = 0
L_2B2D: IF CompareLeft! <> CompareRight! THEN GOTO L_2B30  ' flags from L_2B27
L_2B2F: AX = AX - 1
L_2B30: SI = DX
L_2B32: DI = &H9412
L_2B35: FAC! = N(SI) + N_9412!  ' RT3F_7F
L_2B38: BX = CINT(FAC!)  ' RT3F_77
L_2B3B: SI = BX
L_2B3D: SI = SI * (2 ^ 1)
L_2B3F: SI = SI * (2 ^ 1)
L_2B41: SI = SI + &H1850
L_2B45: DI = &HC762
L_2B48: CompareLeft! = N(SI): CompareRight! = N_C762!  ' RT3F_9F
L_2B4B: BX = 0
L_2B4E: IF CompareLeft! <> CompareRight! THEN GOTO L_2B51  ' flags from L_2B48
L_2B50: BX = BX - 1
L_2B51: CX = DX
L_2B53: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_2B55: BX = AX
L_2B57: FAC! = CSNG(BX)  ' RT3F_57
L_2B5A: DI = &HCA26
L_2B5D: FAC! = FAC! + N_CA26!  ' RT3F_81
L_2B60: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2B63: SI = CX
L_2B65: DI = &HBB56
L_2B68: FAC! = N(SI) + N_BB56!  ' RT3F_7F
L_2B6B: DI = &HC766
L_2B6E: N_C766! = FAC!: SI = &H001A  ' RT3F_7D
L_2B71: SI = DI
L_2B73: DI = &HC1A4
L_2B76: CompareLeft! = N_C766!: CompareRight! = N_C1A4!  ' RT3F_9F
L_2B79: IF CompareLeft! <= CompareRight! THEN GOTO L_2B10  ' flags from L_2B76
L_2B7B: DI = &HC178
L_2B7E: SI = &HCA26
L_2B81: CompareLeft! = N_CA26!: CompareRight! = N_C178!  ' RT3F_9F
L_2B84: IF CompareLeft! > CompareRight! THEN GOTO L_2B89  ' flags from L_2B81
L_2B86: GOTO L_2B8E
L_2B89: SWAP DI, SI
L_2B8B: N(DI) = N(SI)  ' RT3F_7B
L_2B8E: ' PRINT statement begins ; RT3F_BC
L_2B91: DI = &HC980
L_2B94: SI = &HCA1A
L_2B97: FAC! = N_CA1A! + N_C980!  ' RT3F_7F
L_2B9A: BX = CINT(FAC!)  ' RT3F_77
L_2B9D: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_2BA0: PRINT S(BX);  ' RT3F_6A
L_2BA3: BX = &HC6E4
L_2BA6: PRINT S_C6E4$;  ' RT3F_6A
L_2BA9: SI = &HCA26
L_2BAC: FAC! = N_CA26! + N(DI)  ' RT3F_7F
L_2BAF: BX = CINT(FAC!)  ' RT3F_77
L_2BB2: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_2BB5: PRINT S(BX);  ' RT3F_6A
L_2BB8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2BBB: RETURN
L_2BBC: ' PRINT statement begins ; RT3F_BC
L_2BBF: BX = &HCA2A
L_2BC2: PRINT S_CA2A$;  ' RT3F_6A
L_2BC5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2BC8: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_2BCB: DX = &HC0EC
L_2BCE: S_C0EC$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2BD1: AX = DX
L_2BD3: BX = &H9408
L_2BD6: CompareLeft$ = S(AX): CompareRight$ = S_9408$  ' RT3F_62; H string compare from 9E1F..9E49
L_2BD9: IF CompareLeft$ = CompareRight$ THEN GOTO L_2BDE  ' flags from L_2BD6
L_2BDB: GOTO L_2BE3
L_2BDE: GOSUB L_9B06
L_2BE1: GOTO L_2BC8
L_2BE3: BX = &HC0EC
L_2BE6: BX = ASC(S_C0EC$)  ' RT3F_BB
L_2BE9: FAC! = CSNG(BX)  ' RT3F_57
L_2BEC: DI = &HBA90
L_2BEF: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_2BF2: SI = DI
L_2BF4: DI = &HBAD0
L_2BF7: CompareLeft! = N_BA90!: CompareRight! = N_BAD0!  ' RT3F_9F
L_2BFA: IF CompareLeft! = CompareRight! THEN GOTO L_2BFF  ' flags from L_2BF7
L_2BFC: GOTO L_2C09
L_2BFF: DI = &HC762
L_2C02: SI = &HCA2E
L_2C05: N_C762! = N_CA2E!  ' RT3F_7B
L_2C08: RETURN
L_2C09: DI = &HC980
L_2C0C: SI = &HBA90
L_2C0F: CompareLeft! = N_BA90!: CompareRight! = N_C980!  ' RT3F_9F
L_2C12: BX = 0
L_2C15: IF CompareLeft! <= CompareRight! THEN GOTO L_2C18  ' flags from L_2C0F
L_2C17: BX = BX - 1
L_2C18: DI = &HCA32
L_2C1B: CompareLeft! = N(SI): CompareRight! = N_CA32!  ' RT3F_9F
L_2C1E: DX = 0
L_2C21: IF CompareLeft! >= CompareRight! THEN GOTO L_2C24  ' flags from L_2C1B
L_2C23: DX = DX - 1
L_2C24: DX = DX AND BX
L_2C26: CompareLeft% = DX: CompareRight% = 0
L_2C28: IF CompareLeft% <> CompareRight% THEN GOTO L_2C2D  ' flags from L_2C26
L_2C2A: GOTO L_2C3A
L_2C2D: DI = &HCA36
L_2C30: FAC! = N(SI) + N_CA36!  ' RT3F_7F
L_2C33: DI = &HC762
L_2C36: N_C762! = FAC!: SI = &H001A  ' RT3F_7D
L_2C39: RETURN
L_2C3A: GOTO L_2BC8
L_2C3C: SI = &H804E
L_2C3F: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_2C42: GOTO L_2C52
L_2C45: ' Alignment NOP
L_2C46: GOSUB L_2913
L_2C49: DI = &H804E
L_2C4C: SI = &HC7E6
L_2C4F: FAC! = N_C7E6! + N_804E!  ' RT3F_7F
L_2C52: DI = &HC7E6
L_2C55: N_C7E6! = FAC!: SI = &H001A  ' RT3F_7D
L_2C58: SI = DI
L_2C5A: DI = &HC0F4
L_2C5D: CompareLeft! = N_C7E6!: CompareRight! = N_C0F4!  ' RT3F_9F
L_2C60: IF CompareLeft! <= CompareRight! THEN GOTO L_2C46  ' flags from L_2C5D
L_2C62: RETURN
L_2C63: ' PRINT statement begins ; RT3F_BC
L_2C66: BX = &HCA3A
L_2C69: PRINT S_CA3A$;  ' RT3F_6A
L_2C6C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2C6F: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_2C72: DX = &HC0EC
L_2C75: S_C0EC$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2C78: AX = DX
L_2C7A: BX = &H9408
L_2C7D: CompareLeft$ = S(AX): CompareRight$ = S_9408$  ' RT3F_62; H string compare from 9E1F..9E49
L_2C80: IF CompareLeft$ = CompareRight$ THEN GOTO L_2C6F  ' flags from L_2C7D
L_2C82: BX = &HD
L_2C85: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_2C88: AX = BX
L_2C8A: BX = &HC0EC
L_2C8D: CompareLeft$ = S(AX): CompareRight$ = S_C0EC$  ' RT3F_62; H string compare from 9E1F..9E49
L_2C90: IF CompareLeft$ <> CompareRight$ THEN GOTO L_2C6F  ' flags from L_2C8D
L_2C92: RETURN
L_2C93: DI = &HCA4E
L_2C96: SI = &H804E
L_2C99: N_CA4E! = N_804E!  ' RT3F_7B
L_2C9C: SI = &H804E
L_2C9F: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_2CA2: GOTO L_2CE2
L_2CA5: ' Alignment NOP
L_2CA6: GOSUB L_2CF3
L_2CA9: DI = &HC110
L_2CAC: SI = &HC1C0
L_2CAF: N_C110! = N_C1C0!  ' RT3F_7B
L_2CB2: DI = &HC114
L_2CB5: SI = &HBA90
L_2CB8: N_C114! = N_BA90!  ' RT3F_7B
L_2CBB: GOSUB L_06A9
L_2CBE: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_2CC1: BX = 0
L_2CC4: IF CompareLeft! <> CompareRight! THEN GOTO L_2CC7  ' flags from L_2CBE
L_2CC6: BX = BX - 1
L_2CC7: CompareLeft% = BX: CompareRight% = 0
L_2CC9: IF CompareLeft% >= CompareRight% THEN GOTO L_2CCD  ' flags from L_2CC7
L_2CCB: BX = -BX
L_2CCD: FAC! = CSNG(BX)  ' RT3F_57
L_2CD0: DI = &HCA4E
L_2CD3: FAC! = FAC! * N_CA4E!  ' RT3F_91
L_2CD6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2CD9: DI = &H804E
L_2CDC: SI = &HBA90
L_2CDF: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_2CE2: DI = &HBA90
L_2CE5: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_2CE8: SI = DI
L_2CEA: DI = &HC10C
L_2CED: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_2CF0: IF CompareLeft! <= CompareRight! THEN GOTO L_2CA6  ' flags from L_2CED
L_2CF2: RETURN
L_2CF3: DI = &HC184
L_2CF6: SI = &HBA90
L_2CF9: FAC! = N_BA90! + N_C184!  ' RT3F_7F
L_2CFC: DI = &HC6BC
L_2CFF: BX = SI
L_2D01: N_C6BC! = FAC!: SI = &H001A  ' RT3F_7D
L_2D04: SI = DI
L_2D06: DX = BX
L_2D08: BX = CINT(N_C6BC!)  ' RT3F_75
L_2D0B: ARGPUSH BX  ' RT3E_42
L_2D0E: CX = BX
L_2D10: BX = 4
L_2D13: LOCATE ARGS(), BX  ' RT3E_44
L_2D16: ' PRINT statement begins ; RT3F_BC
L_2D19: SI = DX
L_2D1B: BX = CINT(N(SI))  ' RT3F_75
L_2D1E: BX = BX * (2 ^ 1)
L_2D20: BX = BX * (2 ^ 1)
L_2D22: BX = BX + &H4288
L_2D26: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_2D29: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2D2C: BX = CX
L_2D2E: ARGPUSH BX  ' RT3E_42
L_2D31: BX = &HC
L_2D34: LOCATE ARGS(), BX  ' RT3E_44
L_2D37: ' PRINT statement begins ; RT3F_BC
L_2D3A: DI = &HC110
L_2D3D: SI = &HC1BC
L_2D40: N_C110! = N_C1BC!  ' RT3F_7B
L_2D43: SI = DX
L_2D45: BX = DI
L_2D47: DI = &HC114
L_2D4A: N_C114! = N(SI)  ' RT3F_7B
L_2D4D: WORD(BP - &HC) = CX
L_2D50: GOSUB L_06A9
L_2D53: BX = &H1A
L_2D56: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_2D59: BX = &HC6C8
L_2D5C: PRINT S_C6C8$  ' RT3F_6E; H newline item, ledger correction
L_2D5F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2D62: BX = WORD(BP - &HC)
L_2D65: ARGPUSH BX  ' RT3E_42
L_2D68: BX = &H11
L_2D6B: LOCATE ARGS(), BX  ' RT3E_44
L_2D6E: ' PRINT statement begins ; RT3F_BC
L_2D71: DI = &HC110
L_2D74: SI = &HC1C0
L_2D77: N_C110! = N_C1C0!  ' RT3F_7B
L_2D7A: DI = &HC114
L_2D7D: SI = &HBA90
L_2D80: N_C114! = N_BA90!  ' RT3F_7B
L_2D83: GOSUB L_06A9
L_2D86: BX = CINT(FAC!)  ' RT3F_77
L_2D89: BX = BX * (2 ^ 1)
L_2D8B: BX = BX * (2 ^ 1)
L_2D8D: BX = BX + &HC0B8
L_2D91: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_2D94: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2D97: RETURN
L_2D98: SI = &H804E
L_2D9B: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_2D9E: GOTO L_2DAE
L_2DA1: ' Alignment NOP
L_2DA2: GOSUB L_29EB
L_2DA5: DI = &H804E
L_2DA8: SI = &HBA90
L_2DAB: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_2DAE: DI = &HBA90
L_2DB1: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_2DB4: SI = DI
L_2DB6: DI = &HC10C
L_2DB9: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_2DBC: IF CompareLeft! <= CompareRight! THEN GOTO L_2DA2  ' flags from L_2DB9
L_2DBE: RETURN
L_2DBF: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_2DC2: DX = &HC0EC
L_2DC5: S_C0EC$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2DC8: GOSUB L_9B06
L_2DCB: BX = &H9408
L_2DCE: AX = &HC0EC
L_2DD1: CompareLeft$ = S_C0EC$: CompareRight$ = S_9408$  ' RT3F_62; H string compare from 9E1F..9E49
L_2DD4: IF CompareLeft$ = CompareRight$ THEN GOTO L_2DBF  ' flags from L_2DD1
L_2DD6: BX = &HC0EC
L_2DD9: BX = ASC(S_C0EC$)  ' RT3F_BB
L_2DDC: FAC! = CSNG(BX)  ' RT3F_57
L_2DDF: DI = &HCA52
L_2DE2: N_CA52! = FAC!: SI = &H001A  ' RT3F_7D
L_2DE5: SI = DI
L_2DE7: DI = &HCA56
L_2DEA: CompareLeft! = N_CA52!: CompareRight! = N_CA56!  ' RT3F_9F
L_2DED: IF CompareLeft! > CompareRight! THEN GOTO L_2DF2  ' flags from L_2DEA
L_2DEF: GOTO L_2DFD
L_2DF2: DI = &HCA5A
L_2DF5: FAC! = N(SI) + N_CA5A!  ' RT3F_7F
L_2DF8: DI = SI
L_2DFA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2DFD: DI = &HCA66
L_2E00: SI = &HCA52
L_2E03: FAC! = N_CA52! + N_CA66!  ' RT3F_7F
L_2E06: DI = SI
L_2E08: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2E0B: SI = DI
L_2E0D: DI = &HCA5A
L_2E10: CompareLeft! = N(SI): CompareRight! = N_CA5A!  ' RT3F_9F
L_2E13: BX = 0
L_2E16: IF CompareLeft! <> CompareRight! THEN GOTO L_2E19  ' flags from L_2E10
L_2E18: BX = BX - 1
L_2E19: DI = &HCA6A
L_2E1C: CompareLeft! = N(SI): CompareRight! = N_CA6A!  ' RT3F_9F
L_2E1F: DX = 0
L_2E22: IF CompareLeft! <> CompareRight! THEN GOTO L_2E25  ' flags from L_2E1C
L_2E24: DX = DX - 1
L_2E25: DX = DX OR BX
L_2E27: DI = &HCA5E
L_2E2A: CompareLeft! = N(SI): CompareRight! = N_CA5E!  ' RT3F_9F
L_2E2D: BX = 0
L_2E30: IF CompareLeft! < CompareRight! THEN GOTO L_2E33  ' flags from L_2E2A
L_2E32: BX = BX - 1
L_2E33: DI = &HCA62
L_2E36: CompareLeft! = N(SI): CompareRight! = N_CA62!  ' RT3F_9F
L_2E39: CX = 0
L_2E3C: IF CompareLeft! > CompareRight! THEN GOTO L_2E3F  ' flags from L_2E36
L_2E3E: CX = CX - 1
L_2E3F: CX = CX AND BX
L_2E41: CX = CX OR DX
L_2E43: CompareLeft% = CX: CompareRight% = 0
L_2E45: IF CompareLeft% <> CompareRight% THEN GOTO L_2E4A  ' flags from L_2E43
L_2E47: GOTO L_2E4B
L_2E4A: RETURN
L_2E4B: GOTO L_2DBF
L_2E4E: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_2E51: DX = &HC0EC
L_2E54: S_C0EC$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2E57: GOSUB L_9B06
L_2E5A: BX = &H9408
L_2E5D: AX = &HC0EC
L_2E60: CompareLeft$ = S_C0EC$: CompareRight$ = S_9408$  ' RT3F_62; H string compare from 9E1F..9E49
L_2E63: IF CompareLeft$ = CompareRight$ THEN GOTO L_2E4E  ' flags from L_2E60
L_2E65: BX = &HC0EC
L_2E68: DX = BX
L_2E6A: BX = LEN(S_C0EC$)  ' RT3F_BA
L_2E6D: CompareLeft% = BX: CompareRight% = 1
L_2E70: IF CompareLeft% > CompareRight% THEN GOTO L_2E75  ' flags from L_2E6D
L_2E72: GOTO L_2EAD
L_2E75: BX = DX
L_2E77: DX = 1
L_2E7A: BX = TEMP_DESC(RIGHT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0C
L_2E7D: BX = ASC(S(BX))  ' RT3F_BB
L_2E80: BX = BX + -&H46
L_2E83: FAC! = CSNG(BX)  ' RT3F_57
L_2E86: DI = &HCA52
L_2E89: N_CA52! = FAC!: SI = &H001A  ' RT3F_7D
L_2E8C: SI = DI
L_2E8E: DI = &H804E
L_2E91: CompareLeft! = N_CA52!: CompareRight! = N_804E!  ' RT3F_9F
L_2E94: BX = 0
L_2E97: IF CompareLeft! >= CompareRight! THEN GOTO L_2E9A  ' flags from L_2E91
L_2E99: BX = BX - 1
L_2E9A: DI = &HBB4A
L_2E9D: CompareLeft! = N(SI): CompareRight! = N_BB4A!  ' RT3F_9F
L_2EA0: DX = 0
L_2EA3: IF CompareLeft! <= CompareRight! THEN GOTO L_2EA6  ' flags from L_2E9D
L_2EA5: DX = DX - 1
L_2EA6: DX = DX OR BX
L_2EA8: CompareLeft% = DX: CompareRight% = 0
L_2EAA: IF CompareLeft% <> CompareRight% THEN GOTO L_2E4E  ' flags from L_2EA8
L_2EAC: RETURN
L_2EAD: BX = &HC0EC
L_2EB0: BX = ASC(S_C0EC$)  ' RT3F_BB
L_2EB3: BX = BX + -&H35
L_2EB6: FAC! = CSNG(BX)  ' RT3F_57
L_2EB9: DI = &HCA52
L_2EBC: N_CA52! = FAC!: SI = &H001A  ' RT3F_7D
L_2EBF: SI = DI
L_2EC1: DI = &HCA6E
L_2EC4: CompareLeft! = N_CA52!: CompareRight! = N_CA6E!  ' RT3F_9F
L_2EC7: IF CompareLeft! > CompareRight! THEN GOTO L_2ECC  ' flags from L_2EC4
L_2EC9: GOTO L_2ED7
L_2ECC: DI = &HCA5A
L_2ECF: FAC! = N(SI) + N_CA5A!  ' RT3F_7F
L_2ED2: DI = SI
L_2ED4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2ED7: DI = &HC184
L_2EDA: SI = &HCA52
L_2EDD: CompareLeft! = N_CA52!: CompareRight! = N_C184!  ' RT3F_9F
L_2EE0: BX = 0
L_2EE3: IF CompareLeft! >= CompareRight! THEN GOTO L_2EE6  ' flags from L_2EDD
L_2EE5: BX = BX - 1
L_2EE6: DI = &HCA72
L_2EE9: CompareLeft! = N(SI): CompareRight! = N_CA72!  ' RT3F_9F
L_2EEC: DX = 0
L_2EEF: IF CompareLeft! <= CompareRight! THEN GOTO L_2EF2  ' flags from L_2EE9
L_2EF1: DX = DX - 1
L_2EF2: DX = DX OR BX
L_2EF4: CompareLeft% = DX: CompareRight% = 0
L_2EF6: IF CompareLeft% = CompareRight% THEN GOTO L_2EFB  ' flags from L_2EF4
L_2EF8: GOTO L_2E4E
L_2EFB: RETURN
L_2EFC: BX = 8
L_2EFF: DX = &H98
L_2F02: CX = 0
L_2F04: AX = CX
L_2F06: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2F09: BX = &H137
L_2F0C: DX = &HBF
L_2F0F: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2F12: BX = 0
L_2F14: DX = 1
L_2F17: CX = &HFFFF
L_2F1A: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2F1D: RETURN
L_2F1E: BX = 8
L_2F21: DX = &HA0
L_2F24: CX = 0
L_2F26: AX = CX
L_2F28: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2F2B: BX = &H137
L_2F2E: DX = &HBF
L_2F31: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2F34: BX = 0
L_2F36: DX = 1
L_2F39: CX = &HFFFF
L_2F3C: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2F3F: RETURN
L_2F40: BX = 8
L_2F43: DX = &HB0
L_2F46: CX = 0
L_2F48: AX = CX
L_2F4A: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2F4D: BX = &H137
L_2F50: DX = &HBF
L_2F53: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2F56: BX = 0
L_2F58: DX = 1
L_2F5B: CX = &HFFFF
L_2F5E: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2F61: RETURN
L_2F62: BX = &HC8
L_2F65: DX = &H20
L_2F68: CX = 0
L_2F6A: AX = CX
L_2F6C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2F6F: BX = &H137
L_2F72: DX = &H8F
L_2F75: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2F78: BX = 0
L_2F7A: DX = 1
L_2F7D: CX = &HFFFF
L_2F80: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2F83: RETURN
L_2F84: BX = &HC8
L_2F87: DX = &H28
L_2F8A: CX = 0
L_2F8C: AX = CX
L_2F8E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2F91: BX = &H137
L_2F94: DX = &H8F
L_2F97: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2F9A: BX = 0
L_2F9C: DX = 1
L_2F9F: CX = &HFFFF
L_2FA2: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2FA5: RETURN
L_2FA6: DI = &HCA76
L_2FA9: SI = &HBA94
L_2FAC: N_CA76! = N_BA94!  ' RT3F_7B
L_2FAF: BX = 0
L_2FB1: BX = POS(BX)  ' RT3D_21
L_2FB4: FAC! = CSNG(BX)  ' RT3F_57
L_2FB7: DI = &HCA7A
L_2FBA: N_CA7A! = FAC!: SI = &H001A  ' RT3F_7D
L_2FBD: BX = CSRLIN  ' RT3D_25
L_2FC0: FAC! = CSNG(BX)  ' RT3F_57
L_2FC3: DI = &HCA7E
L_2FC6: N_CA7E! = FAC!: SI = &H001A  ' RT3F_7D
L_2FC9: BX = &H9408
L_2FCC: DX = &HC0EC
L_2FCF: S_C0EC$ = S_9408$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2FD2: SI = &HCA7E
L_2FD5: BX = CINT(N_CA7E!)  ' RT3F_75
L_2FD8: ARGPUSH BX  ' RT3E_42
L_2FDB: SI = &HCA7A
L_2FDE: BX = CINT(N_CA7A!)  ' RT3F_75
L_2FE1: ARGPUSH BX  ' RT3E_42
L_2FE4: BX = 1
L_2FE7: ARGPUSH BX  ' RT3E_42
L_2FEA: BX = 0
L_2FEC: ARGPUSH BX  ' RT3E_42
L_2FEF: BX = 7
L_2FF2: LOCATE ARGS(), BX  ' RT3E_44
L_2FF5: ' PRINT statement begins ; RT3F_BC
L_2FF8: BX = &HC0EC
L_2FFB: PRINT S_C0EC$;  ' RT3F_6A
L_2FFE: BX = &HC6C8
L_3001: PRINT S_C6C8$;  ' RT3F_6A
L_3004: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3007: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_300A: DX = &HCA82
L_300D: S_CA82$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_3010: AX = DX
L_3012: BX = &H9408
L_3015: CompareLeft$ = S(AX): CompareRight$ = S_9408$  ' RT3F_62; H string compare from 9E1F..9E49
L_3018: IF CompareLeft$ = CompareRight$ THEN GOTO L_3007  ' flags from L_3015
L_301A: BX = &HCA82
L_301D: BX = ASC(S_CA82$)  ' RT3F_BB
L_3020: FAC! = CSNG(BX)  ' RT3F_57
L_3023: DI = &HBA90
L_3026: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_3029: SI = DI
L_302B: DI = &HBAD0
L_302E: CompareLeft! = N_BA90!: CompareRight! = N_BAD0!  ' RT3F_9F
L_3031: IF CompareLeft! <> CompareRight! THEN GOTO L_3036  ' flags from L_302E
L_3033: GOTO L_30F5
L_3036: DI = &HC17C
L_3039: SI = &HBA90
L_303C: CompareLeft! = N_BA90!: CompareRight! = N_C17C!  ' RT3F_9F
L_303F: BX = 0
L_3042: IF CompareLeft! <> CompareRight! THEN GOTO L_3045  ' flags from L_303C
L_3044: BX = BX - 1
L_3045: DX = BX
L_3047: BX = &HC0EC
L_304A: CX = BX
L_304C: BX = LEN(S_C0EC$)  ' RT3F_BA
L_304F: BX = BX OR BX
L_3051: AX = 0
L_3054: IF (ZF OR SF <> OF) THEN GOTO L_3057  ' flags from L_304F
L_3056: AX = AX - 1
L_3057: AX = AX AND DX
L_3059: CompareLeft% = AX: CompareRight% = 0
L_305B: IF CompareLeft% <> CompareRight% THEN GOTO L_3060  ' flags from L_3059
L_305D: GOTO L_3077
L_3060: BX = CX
L_3062: BX = LEN(S(BX))  ' RT3F_BA
L_3065: BX = BX - 1
L_3066: SWAP CX, BX
L_3068: DX = CX
L_306A: AX = BX
L_306C: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_306F: DX = AX
L_3071: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_3074: GOTO L_2FD2
L_3077: DI = &HBA94
L_307A: SI = &HCA76
L_307D: CompareLeft! = N_CA76!: CompareRight! = N_BA94!  ' RT3F_9F
L_3080: BX = 0
L_3083: IF CompareLeft! <> CompareRight! THEN GOTO L_3086  ' flags from L_307D
L_3085: BX = BX - 1
L_3086: DI = &HC980
L_3089: SI = &HBA90
L_308C: CompareLeft! = N_BA90!: CompareRight! = N_C980!  ' RT3F_9F
L_308F: DX = 0
L_3092: IF CompareLeft! >= CompareRight! THEN GOTO L_3095  ' flags from L_308C
L_3094: DX = DX - 1
L_3095: DI = &HCA86
L_3098: CompareLeft! = N(SI): CompareRight! = N_CA86!  ' RT3F_9F
L_309B: CX = 0
L_309E: IF CompareLeft! <= CompareRight! THEN GOTO L_30A1  ' flags from L_3098
L_30A0: CX = CX - 1
L_30A1: CX = CX OR DX
L_30A3: CX = CX AND BX
L_30A5: CompareLeft% = CX: CompareRight% = 0
L_30A7: IF CompareLeft% = CompareRight% THEN GOTO L_30AC  ' flags from L_30A5
L_30A9: GOTO L_2FD2
L_30AC: DI = &HBFA6
L_30AF: SI = &HBA90
L_30B2: CompareLeft! = N_BA90!: CompareRight! = N_BFA6!  ' RT3F_9F
L_30B5: BX = 0
L_30B8: IF CompareLeft! >= CompareRight! THEN GOTO L_30BB  ' flags from L_30B2
L_30BA: BX = BX - 1
L_30BB: DI = &HCA8A
L_30BE: CompareLeft! = N(SI): CompareRight! = N_CA8A!  ' RT3F_9F
L_30C1: DX = 0
L_30C4: IF CompareLeft! <= CompareRight! THEN GOTO L_30C7  ' flags from L_30BE
L_30C6: DX = DX - 1
L_30C7: DX = DX OR BX
L_30C9: CompareLeft% = DX: CompareRight% = 0
L_30CB: IF CompareLeft% = CompareRight% THEN GOTO L_30D0  ' flags from L_30C9
L_30CD: GOTO L_3007
L_30D0: BX = &HC0EC
L_30D3: BX = LEN(S_C0EC$)  ' RT3F_BA
L_30D6: FAC! = CSNG(BX)  ' RT3F_57
L_30D9: DI = &HCA76
L_30DC: CompareLeft! = FAC!: CompareRight! = N_CA76!  ' RT3F_A1
L_30DF: IF CompareLeft! < CompareRight! THEN GOTO L_30E4  ' flags from L_30DC
L_30E1: GOTO L_3007
L_30E4: BX = &HCA82
L_30E7: AX = &HC0EC
L_30EA: BX = TEMP_DESC(S_C0EC$ + S_CA82$)  ' BX receives a temporary descriptor  ' RT3F_55
L_30ED: DX = AX
L_30EF: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_30F2: GOTO L_2FD2
L_30F5: BX = &HC0EC
L_30F8: DAC# = VAL(S_C0EC$)  ' RT3D_13
L_30FB: BX = CINT(DAC#)  ' RT3F_78
L_30FE: AX = BX

```

### Inventory and input helpers

```basic
L_3100: WORD(&HCA8E) = AX
L_3103: RETURN
L_3104: DI = &HC97C
L_3107: SI = &HC1DC
L_310A: N_C97C! = N_C1DC!  ' RT3F_7B
L_310D: SI = &HC1C4
L_3110: FAC! = N_C1C4!: DI = &H001E  ' RT3F_6F
L_3113: GOTO L_3157
L_3116: SI = &HBA90
L_3119: BX = SI
L_311B: DX = BX
L_311D: BX = CINT(N_BA90!)  ' RT3F_75
L_3120: SI = BX
L_3122: SI = SI * (2 ^ 1)
L_3124: SI = SI * (2 ^ 1)
L_3126: SI = SI + &H1850
L_312A: DI = &HCA90
L_312D: CompareLeft! = N(SI): CompareRight! = N_CA90!  ' RT3F_9F
L_3130: IF CompareLeft! = CompareRight! THEN GOTO L_3135  ' flags from L_312D
L_3132: GOTO L_314E
L_3135: SI = DX
L_3137: DI = &HCA94
L_313A: N_CA94! = N(SI)  ' RT3F_7B
L_313D: DI = &HC97C
L_3140: SI = &H804E
L_3143: N_C97C! = N_804E!  ' RT3F_7B
L_3146: DI = DX
L_3148: SI = &HCA98
L_314B: N(DI) = N_CA98!  ' RT3F_7B
L_314E: DI = &HBB56
L_3151: SI = &HBA90
L_3154: FAC! = N_BA90! + N_BB56!  ' RT3F_7F
L_3157: DI = &HBA90
L_315A: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_315D: SI = DI
L_315F: DI = &HC978
L_3162: CompareLeft! = N_BA90!: CompareRight! = N_C978!  ' RT3F_9F
L_3165: IF CompareLeft! <= CompareRight! THEN GOTO L_3116  ' flags from L_3162
L_3167: RETURN
L_3168: GOSUB L_2EFC
L_316B: BX = &H14
L_316E: ARGPUSH BX  ' RT3E_42
L_3171: BX = 2
L_3174: LOCATE ARGS(), BX  ' RT3E_44
L_3177: ' PRINT statement begins ; RT3F_BC
L_317A: BX = &HCA9C
L_317D: PRINT S_CA9C$  ' RT3F_6E; H newline item, ledger correction
L_3180: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3183: GOSUB L_2C3C
L_3186: RETURN
L_3187: GOSUB L_2EFC
L_318A: BX = &H14
L_318D: ARGPUSH BX  ' RT3E_42
L_3190: BX = 2
L_3193: LOCATE ARGS(), BX  ' RT3E_44
L_3196: ' PRINT statement begins ; RT3F_BC
L_3199: BX = &HCABE
L_319C: PRINT S_CABE$  ' RT3F_6E; H newline item, ledger correction
L_319F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_31A2: GOSUB L_2C3C
L_31A5: RETURN
L_31A6: DI = &HC120
L_31A9: SI = &HBF9E
L_31AC: N_C120! = N_BF9E!  ' RT3F_7B
L_31AF: BX = DI
L_31B1: DI = &HC124
L_31B4: SI = &HC762
L_31B7: N_C124! = N_C762!  ' RT3F_7B
L_31BA: GOSUB L_06DB
L_31BD: BX = CINT(FAC!)  ' RT3F_77
L_31C0: DI = BX
L_31C2: DI = DI * (2 ^ 1)
L_31C4: DI = DI * (2 ^ 1)
L_31C6: DI = DI + &H1850
L_31CA: BX = DI
L_31CC: DI = &HC110
L_31CF: SI = &HBB46
L_31D2: N_C110! = N_BB46!  ' RT3F_7B
L_31D5: DX = DI
L_31D7: DI = &HC114
L_31DA: SI = &HC762
L_31DD: N_C114! = N_C762!  ' RT3F_7B
L_31E0: WORD(BP - &HC) = BX
L_31E3: GOSUB L_06A9
L_31E6: DI = &HC110
L_31E9: SI = &HBA94
L_31EC: N_C110! = N_BA94!  ' RT3F_7B
L_31EF: BX = DI
L_31F1: DI = &HC114
L_31F4: SI = &HC762
L_31F7: N_C114! = N_C762!  ' RT3F_7B
L_31FA: T_03! = FAC!  ' RT3F_71; inline=&H83
L_31FE: GOSUB L_06A9
L_3201: FAC! = T_03! + FAC!  ' RT3F_85; inline=&H83
L_3205: DI = &HCAD4
L_3208: FAC! = FAC! * N_CAD4!  ' RT3F_91
L_320B: DI = WORD(BP - &HC)
L_320E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3211: DI = &HC120
L_3214: SI = &HBAF4
L_3217: N_C120! = N_BAF4!  ' RT3F_7B
L_321A: BX = DI
L_321C: DI = &HC124
L_321F: SI = &HC762
L_3222: N_C124! = N_C762!  ' RT3F_7B
L_3225: GOSUB L_06DB
L_3228: BX = CINT(FAC!)  ' RT3F_77
L_322B: DI = BX
L_322D: DI = DI * (2 ^ 1)
L_322F: DI = DI * (2 ^ 1)
L_3231: DI = DI + &H1850
L_3235: BX = DI
L_3237: DI = &HC110
L_323A: SI = &H9412
L_323D: N_C110! = N_9412!  ' RT3F_7B
L_3240: DX = DI
L_3242: DI = &HC114
L_3245: SI = &HC762
L_3248: N_C114! = N_C762!  ' RT3F_7B
L_324B: WORD(BP - &HE) = BX
L_324E: GOSUB L_06A9
L_3251: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_3255: DI = &HC110
L_3258: SI = &HBB56
L_325B: N_C110! = N_BB56!  ' RT3F_7B
L_325E: BX = DI
L_3260: DI = &HC114
L_3263: SI = &HC762
L_3266: N_C114! = N_C762!  ' RT3F_7B
L_3269: T_04! = FAC!  ' RT3F_71; inline=&H84
L_326D: GOSUB L_06A9
L_3270: FAC! = T_04! + FAC!  ' RT3F_85; inline=&H84
L_3274: DI = &HC10C
L_3277: FAC! = FAC! / N_C10C!  ' RT3F_89
L_327A: DI = &HCAD8
L_327D: FAC! = FAC! + N_CAD8!  ' RT3F_81
L_3280: BX = DI
L_3282: DI = WORD(BP - &HE)
L_3285: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3288: DI = &HC120
L_328B: SI = &HBB4A
L_328E: N_C120! = N_BB4A!  ' RT3F_7B
L_3291: DI = &HC124
L_3294: SI = &HC762
L_3297: N_C124! = N_C762!  ' RT3F_7B
L_329A: GOSUB L_06DB
L_329D: BX = CINT(FAC!)  ' RT3F_77
L_32A0: DI = BX
L_32A2: DI = DI * (2 ^ 1)
L_32A4: DI = DI * (2 ^ 1)
L_32A6: DI = DI + &H1850
L_32AA: BX = DI
L_32AC: DI = &HC110
L_32AF: SI = &H804E
L_32B2: N_C110! = N_804E!  ' RT3F_7B
L_32B5: DI = &HC114
L_32B8: SI = &HC762
L_32BB: N_C114! = N_C762!  ' RT3F_7B
L_32BE: WORD(BP - &H10) = BX
L_32C1: GOSUB L_06A9
L_32C4: DI = &HBB52
L_32C7: FAC! = FAC! * N_BB52!  ' RT3F_91
L_32CA: DI = &HCAD8
L_32CD: FAC! = FAC! + N_CAD8!  ' RT3F_81
L_32D0: DI = WORD(BP - &H10)
L_32D3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_32D6: DI = &HC120
L_32D9: SI = &HBAD0
L_32DC: N_C120! = N_BAD0!  ' RT3F_7B
L_32DF: BX = DI
L_32E1: DI = &HC124
L_32E4: SI = &HC762
L_32E7: N_C124! = N_C762!  ' RT3F_7B
L_32EA: GOSUB L_06DB
L_32ED: BX = CINT(FAC!)  ' RT3F_77
L_32F0: DI = BX
L_32F2: DI = DI * (2 ^ 1)
L_32F4: DI = DI * (2 ^ 1)
L_32F6: DI = DI + &H1850
L_32FA: BX = DI
L_32FC: DI = &HC110
L_32FF: SI = &HCA2E
L_3302: N_C110! = N_CA2E!  ' RT3F_7B
L_3305: DX = DI
L_3307: DI = &HC114
L_330A: SI = &HC762
L_330D: N_C114! = N_C762!  ' RT3F_7B
L_3310: WORD(BP - &HC) = BX
L_3313: GOSUB L_06A9
L_3316: DI = &HBB56
L_3319: FAC! = FAC! / N_BB56!  ' RT3F_89
L_331C: DI = &HBAF4
L_331F: FAC! = FAC! + N_BAF4!  ' RT3F_81
L_3322: DI = WORD(BP - &HC)
L_3325: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3328: DI = &HC120
L_332B: SI = &HC184
L_332E: N_C120! = N_C184!  ' RT3F_7B
L_3331: DI = &HC124
L_3334: SI = &HC762
L_3337: N_C124! = N_C762!  ' RT3F_7B
L_333A: GOSUB L_06DB
L_333D: BX = CINT(FAC!)  ' RT3F_77
L_3340: DI = BX
L_3342: DI = DI * (2 ^ 1)
L_3344: DI = DI * (2 ^ 1)
L_3346: DI = DI + &H1850
L_334A: BX = DI
L_334C: DI = &HC110
L_334F: SI = &HC1DC
L_3352: N_C110! = N_C1DC!  ' RT3F_7B
L_3355: DX = DI
L_3357: DI = &HC114
L_335A: SI = &HC762
L_335D: N_C114! = N_C762!  ' RT3F_7B
L_3360: WORD(BP - &HE) = BX
L_3363: GOSUB L_06A9
L_3366: DI = &HC110
L_3369: SI = &H804E
L_336C: N_C110! = N_804E!  ' RT3F_7B
L_336F: DI = &HC114
L_3372: SI = &HC762
L_3375: N_C114! = N_C762!  ' RT3F_7B
L_3378: T_03! = FAC!  ' RT3F_71; inline=&H83
L_337C: GOSUB L_06A9
L_337F: FAC! = T_03! + FAC!  ' RT3F_85; inline=&H83
L_3383: DI = &HC16C
L_3386: FAC! = FAC! / N_C16C!  ' RT3F_89
L_3389: DI = &HC1BC
L_338C: FAC! = FAC! + N_C1BC!  ' RT3F_81
L_338F: DI = WORD(BP - &HE)
L_3392: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3395: DI = &HC110
L_3398: SI = &HC1AC
L_339B: N_C110! = N_C1AC!  ' RT3F_7B
L_339E: DI = &HC114
L_33A1: SI = &HC762
L_33A4: N_C114! = N_C762!  ' RT3F_7B
L_33A7: GOSUB L_06A9
L_33AA: DI = &HCADC
L_33AD: N_CADC! = FAC!: SI = &H001A  ' RT3F_7D
L_33B0: BX = DI
L_33B2: DI = &HC120
L_33B5: SI = &HC160
L_33B8: N_C120! = N_C160!  ' RT3F_7B
L_33BB: DX = DI
L_33BD: DI = &HC124
L_33C0: SI = &HC762
L_33C3: N_C124! = N_C762!  ' RT3F_7B
L_33C6: GOSUB L_06DB
L_33C9: BX = CINT(FAC!)  ' RT3F_77
L_33CC: DI = BX
L_33CE: DI = DI * (2 ^ 1)
L_33D0: DI = DI * (2 ^ 1)
L_33D2: DI = DI + &H1850
L_33D6: BX = DI
L_33D8: DI = &HC1BC
L_33DB: SI = &HCADC
L_33DE: FAC! = N_CADC! * N_C1BC!  ' RT3F_8F
L_33E1: DI = BX
L_33E3: DX = SI
L_33E5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_33E8: DI = &HC120
L_33EB: SI = &HC1B0
L_33EE: N_C120! = N_C1B0!  ' RT3F_7B
L_33F1: BX = DI
L_33F3: DI = &HC124
L_33F6: SI = &HC762
L_33F9: N_C124! = N_C762!  ' RT3F_7B
L_33FC: GOSUB L_06DB
L_33FF: BX = CINT(FAC!)  ' RT3F_77
L_3402: DI = BX
L_3404: DI = DI * (2 ^ 1)
L_3406: DI = DI * (2 ^ 1)
L_3408: DI = DI + &H1850
L_340C: BX = DI
L_340E: DI = &H9412
L_3411: SI = &HCADC
L_3414: CompareLeft! = N_CADC!: CompareRight! = N_9412!  ' RT3F_9F
L_3417: DX = 0
L_341A: IF CompareLeft! <= CompareRight! THEN GOTO L_341D  ' flags from L_3414
L_341C: DX = DX - 1
L_341D: CompareLeft% = DX: CompareRight% = 0
L_341F: IF CompareLeft% >= CompareRight% THEN GOTO L_3423  ' flags from L_341D
L_3421: DX = -DX
L_3423: SWAP DX, BX
L_3425: FAC! = CSNG(BX)  ' RT3F_57
L_3428: DI = DX
L_342A: BX = SI
L_342C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_342F: DI = &HC120
L_3432: SI = &HC0F0
L_3435: N_C120! = N_C0F0!  ' RT3F_7B
L_3438: DX = DI
L_343A: DI = &HC124
L_343D: SI = &HC762
L_3440: N_C124! = N_C762!  ' RT3F_7B
L_3443: GOSUB L_06DB
L_3446: BX = CINT(FAC!)  ' RT3F_77
L_3449: DI = BX
L_344B: DI = DI * (2 ^ 1)
L_344D: DI = DI * (2 ^ 1)
L_344F: DI = DI + &H1850
L_3453: BX = DI
L_3455: DI = &HBA94
L_3458: SI = &HCADC
L_345B: CompareLeft! = N_CADC!: CompareRight! = N_BA94!  ' RT3F_9F
L_345E: DX = 0
L_3461: IF CompareLeft! <= CompareRight! THEN GOTO L_3464  ' flags from L_345B
L_3463: DX = DX - 1
L_3464: CompareLeft% = DX: CompareRight% = 0
L_3466: IF CompareLeft% >= CompareRight% THEN GOTO L_346A  ' flags from L_3464
L_3468: DX = -DX
L_346A: SWAP DX, BX
L_346C: FAC! = CSNG(BX)  ' RT3F_57
L_346F: DI = DX
L_3471: BX = SI
L_3473: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3476: DI = &HC120
L_3479: SI = &HC174
L_347C: N_C120! = N_C174!  ' RT3F_7B
L_347F: DI = &HC124
L_3482: SI = &HC762
L_3485: N_C124! = N_C762!  ' RT3F_7B
L_3488: GOSUB L_06DB
L_348B: BX = CINT(FAC!)  ' RT3F_77
L_348E: DI = BX
L_3490: DI = DI * (2 ^ 1)
L_3492: DI = DI * (2 ^ 1)
L_3494: DI = DI + &H1850
L_3498: BX = DI
L_349A: DI = &HC0F4
L_349D: SI = &HCADC
L_34A0: CompareLeft! = N_CADC!: CompareRight! = N_C0F4!  ' RT3F_9F
L_34A3: DX = 0
L_34A6: IF CompareLeft! <= CompareRight! THEN GOTO L_34A9  ' flags from L_34A0
L_34A8: DX = DX - 1
L_34A9: CompareLeft% = DX: CompareRight% = 0
L_34AB: IF CompareLeft% >= CompareRight% THEN GOTO L_34AF  ' flags from L_34A9
L_34AD: DX = -DX
L_34AF: SWAP DX, BX
L_34B1: FAC! = CSNG(BX)  ' RT3F_57
L_34B4: DI = DX
L_34B6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_34B9: RETURN
L_34BA: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_34BD: DX = &HC0EC
L_34C0: S_C0EC$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_34C3: GOSUB L_9B06
L_34C6: BX = &HC15A
L_34C9: AX = &HC0EC
L_34CC: CompareLeft$ = S_C0EC$: CompareRight$ = S_C15A$  ' RT3F_62; H string compare from 9E1F..9E49
L_34CF: DX = 0
L_34D2: IF CompareLeft$ <> CompareRight$ THEN GOTO L_34D5  ' flags from L_34CC
L_34D4: DX = DX - 1
L_34D5: BX = &HC154
L_34D8: CompareLeft$ = S(AX): CompareRight$ = S_C154$  ' RT3F_62; H string compare from 9E1F..9E49
L_34DB: CX = 0
L_34DE: IF CompareLeft$ <> CompareRight$ THEN GOTO L_34E1  ' flags from L_34D8
L_34E0: CX = CX - 1
L_34E1: CX = CX OR DX
L_34E3: CompareLeft% = CX: CompareRight% = 0
L_34E5: IF CompareLeft% <> CompareRight% THEN GOTO L_34EA  ' flags from L_34E3
L_34E7: GOTO L_34F4
L_34EA: DI = &HCAE0
L_34ED: SI = &H804E
L_34F0: N_CAE0! = N_804E!  ' RT3F_7B
L_34F3: RETURN
L_34F4: BX = &HC14E
L_34F7: AX = &HC0EC
L_34FA: CompareLeft$ = S_C0EC$: CompareRight$ = S_C14E$  ' RT3F_62; H string compare from 9E1F..9E49
L_34FD: DX = 0

```

### Communications

```basic
L_3500: IF CompareLeft$ <> CompareRight$ THEN GOTO L_3503  ' flags from L_34FA
L_3502: DX = DX - 1
L_3503: BX = &HC148
L_3506: CompareLeft$ = S(AX): CompareRight$ = S_C148$  ' RT3F_62; H string compare from 9E1F..9E49
L_3509: CX = 0
L_350C: IF CompareLeft$ <> CompareRight$ THEN GOTO L_350F  ' flags from L_3506
L_350E: CX = CX - 1
L_350F: CX = CX OR DX
L_3511: CompareLeft% = CX: CompareRight% = 0
L_3513: IF CompareLeft% <> CompareRight% THEN GOTO L_3518  ' flags from L_3511
L_3515: GOTO L_3522
L_3518: DI = &HCAE0
L_351B: SI = &HBB46
L_351E: N_CAE0! = N_BB46!  ' RT3F_7B
L_3521: RETURN
L_3522: GOTO L_34BA
L_3524: DI = &HCA76
L_3527: SI = &HBB56
L_352A: N_CA76! = N_BB56!  ' RT3F_7B
L_352D: ' PRINT statement begins ; RT3F_BC
L_3530: BX = &HCAE4
L_3533: PRINT S_CAE4$;  ' RT3F_6A
L_3536: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3539: GOSUB L_2FAF
L_353C: DI = &HCAE0
L_353F: SI = &HC1DC
L_3542: N_CAE0! = N_C1DC!  ' RT3F_7B
L_3545: BX = &HCAF2
L_3548: AX = &HC0EC
L_354B: CompareLeft$ = S_C0EC$: CompareRight$ = S_CAF2$  ' RT3F_62; H string compare from 9E1F..9E49
L_354E: DX = 0
L_3551: IF CompareLeft$ <> CompareRight$ THEN GOTO L_3554  ' flags from L_354B
L_3553: DX = DX - 1
L_3554: BX = &HCAFA
L_3557: CompareLeft$ = S(AX): CompareRight$ = S_CAFA$  ' RT3F_62; H string compare from 9E1F..9E49
L_355A: CX = 0
L_355D: IF CompareLeft$ <> CompareRight$ THEN GOTO L_3560  ' flags from L_3557
L_355F: CX = CX - 1
L_3560: CX = CX OR DX
L_3562: CompareLeft% = CX: CompareRight% = 0
L_3564: IF CompareLeft% <> CompareRight% THEN GOTO L_3569  ' flags from L_3562
L_3566: GOTO L_356F
L_3569: SI = &H804E
L_356C: N(DI) = N_804E!  ' RT3F_7B
L_356F: RETURN
L_3570: DI = &HCB02
L_3573: SI = &HBB46
L_3576: N_CB02! = N_BB46!  ' RT3F_7B
L_3579: GOSUB L_2D98
L_357C: GOSUB L_3D68
L_357F: SI = &HCB06
L_3582: CompareLeft! = N_CB06!: CompareRight! = 0  ' RT3F_A7
L_3585: IF CompareLeft! <> CompareRight! THEN GOTO L_358A  ' flags from L_3582
L_3587: GOTO L_3CE7
L_358A: DI = &H804E
L_358D: SI = &HC92E
L_3590: FAC! = N_C92E! + N_804E!  ' RT3F_7F
L_3593: BX = CINT(FAC!)  ' RT3F_77
L_3596: ON BX GOTO L_3D65, L_37C5, L_35A0  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_35A0: GOSUB L_2EFC
L_35A3: BX = &H16
L_35A6: ARGPUSH BX  ' RT3E_42
L_35A9: BX = 2
L_35AC: LOCATE ARGS(), BX  ' RT3E_44
L_35AF: ' PRINT statement begins ; RT3F_BC
L_35B2: BX = &HCB0A
L_35B5: PRINT S_CB0A$;  ' RT3F_6A
L_35B8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_35BB: GOSUB L_34BA
L_35BE: SI = &HCAE0
L_35C1: CompareLeft! = N_CAE0!: CompareRight! = 0  ' RT3F_A7
L_35C4: IF CompareLeft! <> CompareRight! THEN GOTO L_35C9  ' flags from L_35C1
L_35C6: GOTO L_3D65
L_35C9: GOSUB L_2EFC
L_35CC: BX = &H16
L_35CF: ARGPUSH BX  ' RT3E_42
L_35D2: BX = 2
L_35D5: LOCATE ARGS(), BX  ' RT3E_44
L_35D8: DI = &HC97C
L_35DB: SI = &HBB46
L_35DE: N_C97C! = N_BB46!  ' RT3F_7B
L_35E1: SI = &H804E
L_35E4: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_35E7: GOTO L_364F
L_35EA: FAC! = RND  ' RT3D_34
L_35ED: DI = &HBB9E
L_35F0: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_35F3: DI = &HC110
L_35F6: SI = &HC168
L_35F9: N_C110! = N_C168!  ' RT3F_7B
L_35FC: BX = DI
L_35FE: DI = &HC114
L_3601: SI = &HBA90
L_3604: N_C114! = N_BA90!  ' RT3F_7B
L_3607: T_03! = FAC!  ' RT3F_71; inline=&H83
L_360B: GOSUB L_06A9
L_360E: DI = &HC110
L_3611: SI = &HC1C0
L_3614: N_C110! = N_C1C0!  ' RT3F_7B
L_3617: DI = &HC114
L_361A: SI = &HBA90
L_361D: N_C114! = N_BA90!  ' RT3F_7B
L_3620: T_04! = FAC!  ' RT3F_71; inline=&H84
L_3624: GOSUB L_06A9
L_3627: FAC! = SGN(FAC!)  ' RT3F_31
L_362A: FAC! = T_04! * FAC!  ' RT3F_95; inline=&H84
L_362E: DI = &HBAF4
L_3631: FAC! = FAC! * N_BAF4!  ' RT3F_91
L_3634: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_3638: IF CompareLeft! < CompareRight! THEN GOTO L_363D  ' flags from L_3634
L_363A: GOTO L_3646
L_363D: DI = &HC97C
L_3640: SI = &HBA90
L_3643: N_C97C! = N_BA90!  ' RT3F_7B
L_3646: DI = &H804E
L_3649: SI = &HBA90
L_364C: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_364F: DI = &HBA90
L_3652: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_3655: SI = DI
L_3657: DI = &HC10C
L_365A: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_365D: IF CompareLeft! <= CompareRight! THEN GOTO L_35EA  ' flags from L_365A
L_365F: SI = &H804E
L_3662: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_3665: GOTO L_3729
L_3668: FAC! = RND  ' RT3D_34
L_366B: DI = &HBB9E
L_366E: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_3671: DI = &HC110
L_3674: SI = &HC0F4
L_3677: N_C110! = N_C0F4!  ' RT3F_7B
L_367A: BX = DI
L_367C: DI = &HC114
L_367F: DX = SI
L_3681: SI = &HBA90
L_3684: N_C114! = N_BA90!  ' RT3F_7B
L_3687: T_03! = FAC!  ' RT3F_71; inline=&H83
L_368B: GOSUB L_06A9
L_368E: DI = &HC110
L_3691: SI = &HC1C0
L_3694: N_C110! = N_C1C0!  ' RT3F_7B
L_3697: BX = DI
L_3699: DI = &HC114
L_369C: SI = &HBA90
L_369F: N_C114! = N_BA90!  ' RT3F_7B
L_36A2: T_04! = FAC!  ' RT3F_71; inline=&H84
L_36A6: GOSUB L_06A9
L_36A9: FAC! = SGN(FAC!)  ' RT3F_31
L_36AC: FAC! = T_04! * FAC!  ' RT3F_95; inline=&H84
L_36B0: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_36B4: BX = 0
L_36B7: IF CompareLeft! >= CompareRight! THEN GOTO L_36BA  ' flags from L_36B0
L_36B9: BX = BX - 1
L_36BA: DI = &HC110
L_36BD: SI = &HC0F4
L_36C0: N_C110! = N_C0F4!  ' RT3F_7B
L_36C3: DX = DI
L_36C5: DI = &HC114
L_36C8: SI = &HBA90
L_36CB: N_C114! = N_BA90!  ' RT3F_7B
L_36CE: WORD(BP - &HC) = BX
L_36D1: GOSUB L_06A9
L_36D4: DI = &HCB2E
L_36D7: CompareLeft! = FAC!: CompareRight! = N_CB2E!  ' RT3F_A1
L_36DA: BX = 0
L_36DD: IF CompareLeft! <= CompareRight! THEN GOTO L_36E0  ' flags from L_36D7
L_36DF: BX = BX - 1
L_36E0: BX = BX AND WORD(BP - &HC)
L_36E3: DI = &HC110
L_36E6: SI = &HC1AC
L_36E9: N_C110! = N_C1AC!  ' RT3F_7B
L_36EC: DI = &HC114
L_36EF: SI = &HBA90
L_36F2: N_C114! = N_BA90!  ' RT3F_7B
L_36F5: WORD(BP - &HE) = BX
L_36F8: GOSUB L_06A9
L_36FB: DI = &HBB56
L_36FE: CompareLeft! = FAC!: CompareRight! = N_BB56!  ' RT3F_A1
L_3701: BX = 0
L_3704: IF CompareLeft! <= CompareRight! THEN GOTO L_3707  ' flags from L_36FE
L_3706: BX = BX - 1
L_3707: BX = BX AND WORD(BP - &HE)
L_370A: CompareLeft% = BX: CompareRight% = 0
L_370C: IF CompareLeft% <> CompareRight% THEN GOTO L_3711  ' flags from L_370A
L_370E: GOTO L_3720
L_3711: DI = &HC10C
L_3714: SI = &HBA90
L_3717: FAC! = N_BA90! + N_C10C!  ' RT3F_7F
L_371A: DI = &HC97C
L_371D: N_C97C! = FAC!: SI = &H001A  ' RT3F_7D
L_3720: DI = &H804E
L_3723: SI = &HBA90
L_3726: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_3729: DI = &HBA90
L_372C: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_372F: SI = DI
L_3731: DI = &HC10C
L_3734: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_3737: IF CompareLeft! > CompareRight! THEN GOTO L_373C  ' flags from L_3734
L_3739: GOTO L_3668
L_373C: DI = &H804E
L_373F: SI = &HC97C
L_3742: CompareLeft! = N_C97C!: CompareRight! = N_804E!  ' RT3F_9F
L_3745: IF CompareLeft! >= CompareRight! THEN GOTO L_374A  ' flags from L_3742
L_3747: GOTO L_37AA
L_374A: DI = &HC194
L_374D: SI = &HC97C
L_3750: CompareLeft! = N_C97C!: CompareRight! = N_C194!  ' RT3F_9F
L_3753: IF CompareLeft! < CompareRight! THEN GOTO L_3758  ' flags from L_3750
L_3755: GOTO L_3775
L_3758: ' PRINT statement begins ; RT3F_BC
L_375B: BX = CINT(N(SI))  ' RT3F_75
L_375E: BX = BX * (2 ^ 1)
L_3760: BX = BX * (2 ^ 1)
L_3762: BX = BX + &H4288
L_3766: PRINT S(BX);  ' RT3F_6A
L_3769: BX = &HCB32
L_376C: PRINT S_CB32$  ' RT3F_6E; H newline item, ledger correction
L_376F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3772: GOTO L_3798
L_3775: ' PRINT statement begins ; RT3F_BC
L_3778: DI = &HCB50
L_377B: SI = &HC97C
L_377E: FAC! = N_C97C! + N_CB50!  ' RT3F_7F
L_3781: BX = CINT(FAC!)  ' RT3F_77
L_3784: BX = BX * (2 ^ 1)
L_3786: BX = BX * (2 ^ 1)
L_3788: BX = BX + &H4288
L_378C: PRINT S(BX);  ' RT3F_6A
L_378F: BX = &HCB42
L_3792: PRINT S_CB42$  ' RT3F_6E; H newline item, ledger correction
L_3795: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3798: DI = &HC92E
L_379B: SI = &H804E
L_379E: N_C92E! = N_804E!  ' RT3F_7B
L_37A1: GOSUB L_2C3C
L_37A4: GOSUB L_2C3C
L_37A7: GOTO L_37C5
L_37AA: DI = &HC92E
L_37AD: SI = &HBB46
L_37B0: N_C92E! = N_BB46!  ' RT3F_7B
L_37B3: ' PRINT statement begins ; RT3F_BC
L_37B6: BX = &HCB54
L_37B9: PRINT S_CB54$  ' RT3F_6E; H newline item, ledger correction
L_37BC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_37BF: GOSUB L_2C3C
L_37C2: GOTO L_3D65
L_37C5: GOSUB L_2EFC
L_37C8: BX = &H14
L_37CB: ARGPUSH BX  ' RT3E_42
L_37CE: BX = 7
L_37D1: LOCATE ARGS(), BX  ' RT3E_44
L_37D4: ' PRINT statement begins ; RT3F_BC
L_37D7: BX = &HCB66
L_37DA: PRINT S_CB66$  ' RT3F_6E; H newline item, ledger correction
L_37DD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_37E0: BX = &H15
L_37E3: ARGPUSH BX  ' RT3E_42
L_37E6: DX = BX
L_37E8: BX = 2
L_37EB: LOCATE ARGS(), BX  ' RT3E_44
L_37EE: ' PRINT statement begins ; RT3F_BC
L_37F1: CX = BX
L_37F3: BX = &HCB7E
L_37F6: PRINT S_CB7E$  ' RT3F_6E; H newline item, ledger correction
L_37F9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_37FC: BX = &H16
L_37FF: ARGPUSH BX  ' RT3E_42
L_3802: SWAP CX, BX
L_3804: LOCATE ARGS(), BX  ' RT3E_44
L_3807: ' PRINT statement begins ; RT3F_BC
L_380A: AX = BX
L_380C: BX = &HCB8A
L_380F: PRINT S_CB8A$  ' RT3F_6E; H newline item, ledger correction
L_3812: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3815: BX = &H17
L_3818: ARGPUSH BX  ' RT3E_42
L_381B: SWAP BX, AX
L_381C: LOCATE ARGS(), BX  ' RT3E_44
L_381F: ' PRINT statement begins ; RT3F_BC
L_3822: BX = &HCB94
L_3825: PRINT S_CB94$  ' RT3F_6E; H newline item, ledger correction
L_3828: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_382B: BX = DX
L_382D: ARGPUSH BX  ' RT3E_42
L_3830: BX = &HD
L_3833: LOCATE ARGS(), BX  ' RT3E_44
L_3836: ' PRINT statement begins ; RT3F_BC
L_3839: DX = BX
L_383B: BX = &HCBA0
L_383E: PRINT S_CBA0$  ' RT3F_6E; H newline item, ledger correction
L_3841: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3844: BX = CX
L_3846: ARGPUSH BX  ' RT3E_42
L_3849: BX = DX
L_384B: LOCATE ARGS(), BX  ' RT3E_44
L_384E: ' PRINT statement begins ; RT3F_BC
L_3851: BX = &HCBB4
L_3854: PRINT S_CBB4$  ' RT3F_6E; H newline item, ledger correction
L_3857: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_385A: BX = AX
L_385C: ARGPUSH BX  ' RT3E_42
L_385F: BX = DX
L_3861: LOCATE ARGS(), BX  ' RT3E_44
L_3864: ' PRINT statement begins ; RT3F_BC
L_3867: BX = &HCBCC
L_386A: PRINT S_CBCC$  ' RT3F_6E; H newline item, ledger correction
L_386D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3870: BX = &H18
L_3873: ARGPUSH BX  ' RT3E_42
L_3876: BX = 2
L_3879: LOCATE ARGS(), BX  ' RT3E_44
L_387C: ' PRINT statement begins ; RT3F_BC
L_387F: BX = &HCBD6
L_3882: PRINT S_CBD6$;  ' RT3F_6A
L_3885: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3888: DI = &HCA5E
L_388B: SI = &H804E
L_388E: N_CA5E! = N_804E!  ' RT3F_7B
L_3891: DI = &HCA62
L_3894: SI = &HC10C
L_3897: N_CA62! = N_C10C!  ' RT3F_7B
L_389A: GOSUB L_2DBF
L_389D: SI = &HCA52
L_38A0: CompareLeft! = N_CA52!: CompareRight! = 0  ' RT3F_A7
L_38A3: IF CompareLeft! < CompareRight! THEN GOTO L_389A  ' flags from L_38A0
L_38A5: DI = &HC6B0
L_38A8: SI = &HCA52
L_38AB: FAC! = N_CA52! + N_C6B0!  ' RT3F_7F
L_38AE: DI = &HCBF4
L_38B1: N_CBF4! = FAC!: SI = &H001A  ' RT3F_7D
L_38B4: SI = DI
L_38B6: DI = &HC0F4
L_38B9: CompareLeft! = N_CBF4!: CompareRight! = N_C0F4!  ' RT3F_9F
L_38BC: IF CompareLeft! <> CompareRight! THEN GOTO L_38C1  ' flags from L_38B9
L_38BE: GOTO L_3D65
L_38C1: DI = &HBB56
L_38C4: SI = &HCBF4
L_38C7: CompareLeft! = N_CBF4!: CompareRight! = N_BB56!  ' RT3F_9F
L_38CA: IF CompareLeft! = CompareRight! THEN GOTO L_38CF  ' flags from L_38C7
L_38CC: GOTO L_38DB
L_38CF: DI = &HCBF8
L_38D2: SI = &H804E
L_38D5: N_CBF8! = N_804E!  ' RT3F_7B
L_38D8: GOTO L_396D
L_38DB: GOSUB L_2F1E
L_38DE: BX = &H15
L_38E1: ARGPUSH BX  ' RT3E_42
L_38E4: DX = BX
L_38E6: BX = 2
L_38E9: LOCATE ARGS(), BX  ' RT3E_44
L_38EC: SWAP DX, BX
L_38EE: ARGPUSH BX  ' RT3E_42
L_38F1: BX = DX
L_38F3: LOCATE ARGS(), BX  ' RT3E_44
L_38F6: ' PRINT statement begins ; RT3F_BC
L_38F9: BX = &HCBFC
L_38FC: PRINT S_CBFC$  ' RT3F_6E; H newline item, ledger correction
L_38FF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3902: BX = &H16
L_3905: ARGPUSH BX  ' RT3E_42
L_3908: BX = DX
L_390A: LOCATE ARGS(), BX  ' RT3E_44
L_390D: ' PRINT statement begins ; RT3F_BC
L_3910: BX = &HCC08
L_3913: PRINT S_CC08$  ' RT3F_6E; H newline item, ledger correction
L_3916: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3919: BX = &H17
L_391C: ARGPUSH BX  ' RT3E_42
L_391F: BX = DX
L_3921: LOCATE ARGS(), BX  ' RT3E_44
L_3924: ' PRINT statement begins ; RT3F_BC
L_3927: BX = &HCC16
L_392A: PRINT S_CC16$  ' RT3F_6E; H newline item, ledger correction
L_392D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3930: BX = &H18
L_3933: ARGPUSH BX  ' RT3E_42
L_3936: BX = DX
L_3938: LOCATE ARGS(), BX  ' RT3E_44
L_393B: ' PRINT statement begins ; RT3F_BC
L_393E: BX = &HCC26
L_3941: PRINT S_CC26$;  ' RT3F_6A
L_3944: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3947: DI = &HCA5E
L_394A: SI = &H804E
L_394D: N_CA5E! = N_804E!  ' RT3F_7B
L_3950: DI = &HCA62
L_3953: SI = &HBB56
L_3956: N_CA62! = N_BB56!  ' RT3F_7B
L_3959: GOSUB L_2DBF
L_395C: SI = &HCA52
L_395F: CompareLeft! = N_CA52!: CompareRight! = 0  ' RT3F_A7
L_3962: IF CompareLeft! < CompareRight! THEN GOTO L_3947  ' flags from L_395F
L_3964: DI = &HCBF8
L_3967: SI = &HCA52
L_396A: N_CBF8! = N_CA52!  ' RT3F_7B
L_396D: DI = &HCC44
L_3970: SI = &HC188
L_3973: N_CC44! = N_C188!  ' RT3F_7B
L_3976: BX = DI
L_3978: DI = &HBA94
L_397B: SI = &HCBF4
L_397E: CompareLeft! = N_CBF4!: CompareRight! = N_BA94!  ' RT3F_9F
L_3981: IF CompareLeft! = CompareRight! THEN GOTO L_3986  ' flags from L_397E
L_3983: GOTO L_39A0
L_3986: SI = &HC668
L_3989: CompareLeft! = N_C668!: CompareRight! = N(DI)  ' RT3F_9F
L_398C: AX = 0
L_398F: IF CompareLeft! >= CompareRight! THEN GOTO L_3992  ' flags from L_3989
L_3991: AX = AX - 1
L_3992: DX = &HFFD8
L_3995: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_3997: SWAP BX, AX
L_3998: FAC! = CSNG(BX)  ' RT3F_57
L_399B: DI = AX
L_399D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_39A0: GOSUB L_3D68
L_39A3: GOSUB L_3FB9
L_39A6: DI = &HCC48
L_39A9: SI = &HCC4C
L_39AC: FAC! = N_CC4C! - N_CC48!  ' RT3F_97
L_39AF: BX = DI
L_39B1: DI = &HCC50
L_39B4: N_CC50! = FAC!: SI = &H001A  ' RT3F_7D
L_39B7: SI = DI
L_39B9: CompareLeft! = N_CC50!: CompareRight! = 0  ' RT3F_A7
L_39BC: IF CompareLeft! > CompareRight! THEN GOTO L_39C1  ' flags from L_39B9
L_39BE: GOTO L_39CE
L_39C1: SWAP BX, DI
L_39C3: FAC! = N(SI) / N(DI)  ' RT3F_87
L_39C6: DI = BX
L_39C8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_39CB: GOTO L_39DC
L_39CE: DI = &HCC4C
L_39D1: SI = &HCC50
L_39D4: FAC! = N_CC50! / N_CC4C!  ' RT3F_87
L_39D7: DI = SI
L_39D9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_39DC: DI = &HC6B0
L_39DF: SI = &HCC50
L_39E2: CompareLeft! = N_CC50!: CompareRight! = N_C6B0!  ' RT3F_9F
L_39E5: BX = 0
L_39E8: IF CompareLeft! <= CompareRight! THEN GOTO L_39EB  ' flags from L_39E2
L_39EA: BX = BX - 1
L_39EB: DX = 0
L_39ED: DX = DX - BX
L_39EF: DI = &HCC54
L_39F2: CompareLeft! = N(SI): CompareRight! = N_CC54!  ' RT3F_9F
L_39F5: BX = 0
L_39F8: IF CompareLeft! <= CompareRight! THEN GOTO L_39FB  ' flags from L_39F2
L_39FA: BX = BX - 1
L_39FB: DX = DX - BX
L_39FD: DI = &HCC58
L_3A00: CompareLeft! = N(SI): CompareRight! = N_CC58!  ' RT3F_9F
L_3A03: BX = 0
L_3A06: IF CompareLeft! <= CompareRight! THEN GOTO L_3A09  ' flags from L_3A00
L_3A08: BX = BX - 1
L_3A09: DX = DX - BX
L_3A0B: DI = &HCC5C
L_3A0E: CompareLeft! = N(SI): CompareRight! = N_CC5C!  ' RT3F_9F
L_3A11: BX = 0
L_3A14: IF CompareLeft! <= CompareRight! THEN GOTO L_3A17  ' flags from L_3A0E
L_3A16: BX = BX - 1
L_3A17: DX = DX - BX
L_3A19: DI = &HCC60
L_3A1C: CompareLeft! = N(SI): CompareRight! = N_CC60!  ' RT3F_9F
L_3A1F: BX = 0
L_3A22: IF CompareLeft! <= CompareRight! THEN GOTO L_3A25  ' flags from L_3A1C
L_3A24: BX = BX - 1
L_3A25: DX = DX - BX
L_3A27: DI = &HCAD4
L_3A2A: CompareLeft! = N(SI): CompareRight! = N_CAD4!  ' RT3F_9F
L_3A2D: BX = 0
L_3A30: IF CompareLeft! <= CompareRight! THEN GOTO L_3A33  ' flags from L_3A2A
L_3A32: BX = BX - 1
L_3A33: DX = DX - BX
L_3A35: DI = &HBB52
L_3A38: CompareLeft! = N(SI): CompareRight! = N_BB52!  ' RT3F_9F
L_3A3B: BX = 0
L_3A3E: IF CompareLeft! <= CompareRight! THEN GOTO L_3A41  ' flags from L_3A38
L_3A40: BX = BX - 1
L_3A41: DX = DX - BX
L_3A43: DI = &H804E
L_3A46: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_3A49: BX = 0
L_3A4C: IF CompareLeft! <= CompareRight! THEN GOTO L_3A4F  ' flags from L_3A46
L_3A4E: BX = BX - 1
L_3A4F: DX = DX - BX
L_3A51: BX = DX
L_3A53: FAC! = CSNG(BX)  ' RT3F_57
L_3A56: DI = SI
L_3A58: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3A5B: DI = &H804E
L_3A5E: SI = &HC932
L_3A61: CompareLeft! = N_C932!: CompareRight! = N_804E!  ' RT3F_9F
L_3A64: BX = 0
L_3A67: IF CompareLeft! <> CompareRight! THEN GOTO L_3A6A  ' flags from L_3A61
L_3A69: BX = BX - 1
L_3A6A: SI = &HC66C
L_3A6D: CompareLeft! = N_C66C!: CompareRight! = N(DI)  ' RT3F_9F
L_3A70: DX = 0
L_3A73: IF CompareLeft! <> CompareRight! THEN GOTO L_3A76  ' flags from L_3A6D
L_3A75: DX = DX - 1
L_3A76: DX = DX AND BX
L_3A78: CompareLeft% = DX: CompareRight% = 0
L_3A7A: IF CompareLeft% <> CompareRight% THEN GOTO L_3A7F  ' flags from L_3A78
L_3A7C: GOTO L_3A87
L_3A7F: DI = SI
L_3A81: SI = &HBB56
L_3A84: N(DI) = N_BB56!  ' RT3F_7B
L_3A87: DI = &HC6B0
L_3A8A: SI = &HC66C
L_3A8D: FAC! = N_C66C! + N_C6B0!  ' RT3F_7F
L_3A90: BX = CINT(FAC!)  ' RT3F_77
L_3A93: AX = BX
L_3A95: SI = 5
L_3A98: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_3A9A: DI = AX
L_3A9C: BX = SI
L_3A9E: SI = &HCBF4
L_3AA1: DX = BX
L_3AA3: BX = CINT(N_CBF4!)  ' RT3F_75
L_3AA6: CX = BX
L_3AA8: BX = BX + AX
L_3AAA: SI = BX
L_3AAC: SI = SI * (2 ^ 1)
L_3AAE: SI = SI * (2 ^ 1)
L_3AB0: SI = SI + &HC7EE
L_3AB4: BX = SI
L_3AB6: SI = &HCC50
L_3AB9: AX = BX
L_3ABB: BX = CINT(N_CC50!)  ' RT3F_75
L_3ABE: SWAP DX, AX
L_3ABF: WORD(BP - &HC) = DX
L_3AC2: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_3AC4: AX = AX + CX
L_3AC6: DI = AX
L_3AC8: DI = DI * (2 ^ 1)
L_3ACA: DI = DI * (2 ^ 1)
L_3ACC: DI = DI + &HC82A
L_3AD0: SI = WORD(BP - &HC)
L_3AD3: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_3AD6: DI = &HCC44
L_3AD9: FAC! = FAC! * N_CC44!  ' RT3F_91
L_3ADC: SI = &HCBF8
L_3ADF: T_03! = FAC!  ' RT3F_71; inline=&H83
L_3AE3: BX = CINT(N(SI))  ' RT3F_75
L_3AE6: AX = BX
L_3AE8: DX = 5
L_3AEB: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_3AED: AX = AX + CX
L_3AEF: SI = AX
L_3AF1: SI = SI * (2 ^ 1)
L_3AF3: SI = SI * (2 ^ 1)
L_3AF5: SI = SI + &HC8DE
L_3AF9: SWAP SI, DI
L_3AFB: BX = SI
L_3AFD: SI = &HBEA0

```

### Negotiation outcomes

```basic
L_3B00: FAC! = N_BEA0! + N(DI)  ' RT3F_7F
L_3B03: DI = BX
L_3B05: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3B08: GOSUB L_2EFC
L_3B0B: BX = &H16
L_3B0E: ARGPUSH BX  ' RT3E_42
L_3B11: BX = 2
L_3B14: LOCATE ARGS(), BX  ' RT3E_44
L_3B17: FAC! = RND  ' RT3D_34
L_3B1A: DI = &HCC64
L_3B1D: FAC! = FAC! * N_CC64!  ' RT3F_91
L_3B20: DI = &HCC44
L_3B23: FAC! = FAC! - N_CC44!  ' RT3F_99
L_3B26: DI = &HC766
L_3B29: N_C766! = FAC!: SI = &H001A  ' RT3F_7D
L_3B2C: SI = DI
L_3B2E: CompareLeft! = N_C766!: CompareRight! = 0  ' RT3F_A7
L_3B31: IF CompareLeft! >= CompareRight! THEN GOTO L_3B36  ' flags from L_3B2E
L_3B33: GOTO L_3BB3
L_3B36: DI = &HCC68
L_3B39: SI = &HCC44
L_3B3C: CompareLeft! = N_CC44!: CompareRight! = N_CC68!  ' RT3F_9F
L_3B3F: BX = 0
L_3B42: IF CompareLeft! >= CompareRight! THEN GOTO L_3B45  ' flags from L_3B3C
L_3B44: BX = BX - 1
L_3B45: DX = 1
L_3B48: DX = DX - BX
L_3B4A: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3B4D: BX = 0
L_3B50: IF CompareLeft! >= CompareRight! THEN GOTO L_3B53  ' flags from L_3B4A
L_3B52: BX = BX - 1
L_3B53: DX = DX - BX
L_3B55: DI = &HC16C
L_3B58: CompareLeft! = N(SI): CompareRight! = N_C16C!  ' RT3F_9F
L_3B5B: BX = 0
L_3B5E: IF CompareLeft! >= CompareRight! THEN GOTO L_3B61  ' flags from L_3B58
L_3B60: BX = BX - 1
L_3B61: DX = DX - BX
L_3B63: BX = DX
L_3B65: ON BX GOTO L_3B77, L_3B86, L_3B95, L_3BA4  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_3B71: GOSUB L_3D68
L_3B74: GOSUB L_3FB9
L_3B77: ' PRINT statement begins ; RT3F_BC
L_3B7A: BX = &HCC6C
L_3B7D: PRINT S_CC6C$  ' RT3F_6E; H newline item, ledger correction
L_3B80: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3B83: GOTO L_40D1
L_3B86: ' PRINT statement begins ; RT3F_BC
L_3B89: BX = &HCC8A
L_3B8C: PRINT S_CC8A$  ' RT3F_6E; H newline item, ledger correction
L_3B8F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3B92: GOTO L_40D1
L_3B95: ' PRINT statement begins ; RT3F_BC
L_3B98: BX = &HCCA4
L_3B9B: PRINT S_CCA4$  ' RT3F_6E; H newline item, ledger correction
L_3B9E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3BA1: GOTO L_40D1
L_3BA4: ' PRINT statement begins ; RT3F_BC
L_3BA7: BX = &HCCC8
L_3BAA: PRINT S_CCC8$  ' RT3F_6E; H newline item, ledger correction
L_3BAD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3BB0: GOTO L_40D1
L_3BB3: SI = &HCBF8
L_3BB6: BX = CINT(N_CBF8!)  ' RT3F_75
L_3BB9: ON BX GOTO L_3BC3, L_3C7A, L_3CC6  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_3BC3: DI = &HBB56
L_3BC6: SI = &HCBF4
L_3BC9: CompareLeft! = N_CBF4!: CompareRight! = N_BB56!  ' RT3F_9F
L_3BCC: IF CompareLeft! <> CompareRight! THEN GOTO L_3BD1  ' flags from L_3BC9
L_3BCE: GOTO L_3BEF
L_3BD1: ' PRINT statement begins ; RT3F_BC
L_3BD4: BX = &HCCE4
L_3BD7: PRINT S_CCE4$  ' RT3F_6E; H newline item, ledger correction
L_3BDA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3BDD: DI = &HCCFE
L_3BE0: SI = &H9412
L_3BE3: N_CCFE! = N_9412!  ' RT3F_7B
L_3BE6: GOSUB L_407B
L_3BE9: GOSUB L_2C3C
L_3BEC: GOTO L_410E
L_3BEF: DI = &HCA06
L_3BF2: SI = &HBB46
L_3BF5: N_CA06! = N_BB46!  ' RT3F_7B
L_3BF8: GOSUB L_299B
L_3BFB: GOSUB L_3D02
L_3BFE: DI = &HBB52
L_3C01: SI = &HCD02
L_3C04: FAC! = N_CD02! * N_BB52!  ' RT3F_8F
L_3C07: BX = &H1A
L_3C0A: FAC! = INT(FAC!)  ' RT3D_03
L_3C0D: DI = SI
L_3C0F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3C12: BX = &H15
L_3C15: ARGPUSH BX  ' RT3E_42
L_3C18: BX = 2
L_3C1B: LOCATE ARGS(), BX  ' RT3E_44
L_3C1E: ' PRINT statement begins ; RT3F_BC
L_3C21: BX = &HCD06
L_3C24: PRINT S_CD06$;  ' RT3F_6A
L_3C27: BX = &HCD02
L_3C2A: PRINT N_CD02!;  ' RT3F_67; H expanded ledger
L_3C2D: BX = &HCD16
L_3C30: PRINT S_CD16$  ' RT3F_6E; H newline item, ledger correction
L_3C33: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3C36: ARGPUSH OMITTED  ' RT3E_43
L_3C39: BX = 2
L_3C3C: LOCATE ARGS(), BX  ' RT3E_44
L_3C3F: ' PRINT statement begins ; RT3F_BC
L_3C42: BX = &HCD22
L_3C45: PRINT S_CD22$  ' RT3F_6E; H newline item, ledger correction
L_3C48: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3C4B: SI = &HCD02
L_3C4E: FAC! = -N_CD02!  ' RT3F_AF
L_3C51: DI = &HCA06
L_3C54: N_CA06! = FAC!: SI = &H001A  ' RT3F_7D
L_3C57: SI = DI
L_3C59: DI = &HCB02
L_3C5C: N_CB02! = N_CA06!  ' RT3F_7B
L_3C5F: GOSUB L_299B
L_3C62: GOSUB L_2C3C
L_3C65: GOSUB L_2C3C
L_3C68: GOSUB L_2C3C
L_3C6B: DI = &HCCFE
L_3C6E: SI = &H9412
L_3C71: N_CCFE! = N_9412!  ' RT3F_7B
L_3C74: GOSUB L_407B
L_3C77: GOTO L_410E
L_3C7A: GOSUB L_3D02
L_3C7D: DI = &HBB52
L_3C80: SI = &HCD02
L_3C83: FAC! = N_CD02! * N_BB52!  ' RT3F_8F
L_3C86: BX = &H1A
L_3C89: FAC! = INT(FAC!)  ' RT3D_03
L_3C8C: DI = &HCA06
L_3C8F: N_CA06! = FAC!: SI = &H001A  ' RT3F_7D
L_3C92: SI = DI
L_3C94: DI = &HCB02
L_3C97: N_CB02! = N_CA06!  ' RT3F_7B
L_3C9A: ' PRINT statement begins ; RT3F_BC
L_3C9D: BX = &HCD3C
L_3CA0: PRINT S_CD3C$;  ' RT3F_6A
L_3CA3: BX = SI
L_3CA5: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_3CA8: BX = &HCD48
L_3CAB: PRINT S_CD48$  ' RT3F_6E; H newline item, ledger correction
L_3CAE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3CB1: GOSUB L_299B
L_3CB4: DI = &HCCFE
L_3CB7: SI = &H9412
L_3CBA: N_CCFE! = N_9412!  ' RT3F_7B
L_3CBD: GOSUB L_407B
L_3CC0: GOSUB L_2C3C
L_3CC3: GOTO L_410E
L_3CC6: ' PRINT statement begins ; RT3F_BC
L_3CC9: BX = &HCD54
L_3CCC: PRINT S_CD54$  ' RT3F_6E; H newline item, ledger correction
L_3CCF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3CD2: DI = &HCCFE
L_3CD5: SI = &H804E
L_3CD8: N_CCFE! = N_804E!  ' RT3F_7B
L_3CDB: DI = &HC93E
L_3CDE: N_C93E! = N_804E!  ' RT3F_7B
L_3CE1: GOSUB L_407B
L_3CE4: GOSUB L_2C3C
L_3CE7: GOSUB L_3D02
L_3CEA: DI = &HCA06
L_3CED: SI = &HCD02
L_3CF0: N_CA06! = N_CD02!  ' RT3F_7B
L_3CF3: GOSUB L_299B
L_3CF6: DI = &HCB02
L_3CF9: SI = &HCD02
L_3CFC: N_CB02! = N_CD02!  ' RT3F_7B
L_3CFF: GOTO L_410E
L_3D02: DI = &HCD02
L_3D05: SI = &HBB46
L_3D08: N_CD02! = N_BB46!  ' RT3F_7B
L_3D0B: DI = &HC6B0
L_3D0E: SI = &HC63C
L_3D11: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_3D14: DI = &HCD66
L_3D17: N_CD66! = FAC!: SI = &H001A  ' RT3F_7D
L_3D1A: SI = &HC6B4
L_3D1D: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_3D20: GOTO L_3D54
L_3D23: ' Alignment NOP
L_3D24: SI = &HBA90
L_3D27: BX = SI
L_3D29: DX = BX
L_3D2B: BX = CINT(N_BA90!)  ' RT3F_75
L_3D2E: SI = BX
L_3D30: SI = SI * (2 ^ 1)
L_3D32: SI = SI * (2 ^ 1)
L_3D34: BX = SI
L_3D36: SI = SI + &HC604
L_3D3A: BX = BX + &HC328
L_3D3E: DI = BX
L_3D40: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_3D43: DI = &HCD02
L_3D46: FAC! = FAC! + N_CD02!  ' RT3F_81
L_3D49: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3D4C: SI = DX
L_3D4E: DI = &H804E
L_3D51: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_3D54: DI = &HBA90
L_3D57: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_3D5A: SI = DI
L_3D5C: DI = &HCD66
L_3D5F: CompareLeft! = N_BA90!: CompareRight! = N_CD66!  ' RT3F_9F
L_3D62: IF CompareLeft! <= CompareRight! THEN GOTO L_3D24  ' flags from L_3D5F
L_3D64: RETURN
L_3D65: GOTO L_4554
L_3D68: DI = &HCB06
L_3D6B: SI = &HBB46
L_3D6E: N_CB06! = N_BB46!  ' RT3F_7B
L_3D71: DI = &HC6B0
L_3D74: SI = &HC63C
L_3D77: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_3D7A: DI = &HCD6A
L_3D7D: N_CD6A! = FAC!: SI = &H001A  ' RT3F_7D
L_3D80: SI = &HC6B4
L_3D83: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_3D86: GOTO L_3F66
L_3D89: ' Alignment NOP
L_3D8A: DI = &HC97C
L_3D8D: SI = &HC6B4
L_3D90: N_C97C! = N_C6B4!  ' RT3F_7B
L_3D93: DI = &HC722
L_3D96: SI = &HBA90
L_3D99: N_C722! = N_BA90!  ' RT3F_7B
L_3D9C: GOSUB L_18D5
L_3D9F: BX = BASIC_BOOL(FAC! <> 0)  ' RT3F_1F
L_3DA2: CompareLeft% = BX: CompareRight% = 0
L_3DA4: IF CompareLeft% <> CompareRight% THEN GOTO L_3DA9  ' flags from L_3DA2
L_3DA6: GOTO L_3DDB
L_3DA9: SI = &HBA90
L_3DAC: BX = CINT(N_BA90!)  ' RT3F_75
L_3DAF: DI = BX
L_3DB1: DI = DI * (2 ^ 1)
L_3DB3: DI = DI * (2 ^ 1)
L_3DB5: BX = DI
L_3DB7: DI = DI + &HC560
L_3DBB: SI = &H9412
L_3DBE: N(DI) = N_9412!  ' RT3F_7B
L_3DC1: DX = BX
L_3DC3: BX = BX + &HC518
L_3DC7: DI = BX
L_3DC9: SI = &HC990
L_3DCC: N(DI) = N_C990!  ' RT3F_7B
L_3DCF: DX = DX + &HC53C
L_3DD3: DI = DX
L_3DD5: N(DI) = N_C990!  ' RT3F_7B
L_3DD8: GOTO L_3EEB
L_3DDB: SI = &HBA90
L_3DDE: BX = CINT(N_BA90!)  ' RT3F_75
L_3DE1: SI = BX
L_3DE3: SI = SI * (2 ^ 1)
L_3DE5: SI = SI * (2 ^ 1)
L_3DE7: SI = SI + &HC604
L_3DEB: DI = &HC6B0
L_3DEE: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_3DF1: DI = &HCD6E
L_3DF4: N_CD6E! = FAC!: SI = &H001A  ' RT3F_7D
L_3DF7: SI = &HC6B4
L_3DFA: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_3DFD: GOTO L_3E44
L_3E00: SI = &HBA90
L_3E03: BX = CINT(N_BA90!)  ' RT3F_75
L_3E06: AX = BX
L_3E08: SI = 5
L_3E0B: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_3E0D: SI = AX
L_3E0F: SI = &HC634
L_3E12: BX = SI
L_3E14: DX = BX
L_3E16: BX = CINT(N_C634!)  ' RT3F_75
L_3E19: BX = BX + AX
L_3E1B: SI = BX
L_3E1D: SI = SI * (2 ^ 1)
L_3E1F: SI = SI * (2 ^ 1)
L_3E21: BX = SI
L_3E23: SI = SI + &HC2B8
L_3E27: BX = BX + &HC4C8
L_3E2B: DI = BX
L_3E2D: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_3E30: FAC! = SGN(FAC!)  ' RT3F_31
L_3E33: DI = &HC97C
L_3E36: FAC! = FAC! + N_C97C!  ' RT3F_81
L_3E39: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3E3C: SI = DX
L_3E3E: DI = &H804E
L_3E41: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_3E44: DI = &HC634
L_3E47: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_3E4A: SI = DI
L_3E4C: DI = &HCD6E
L_3E4F: CompareLeft! = N_C634!: CompareRight! = N_CD6E!  ' RT3F_9F
L_3E52: IF CompareLeft! <= CompareRight! THEN GOTO L_3E00  ' flags from L_3E4F
L_3E54: DI = &H804E
L_3E57: SI = &HC97C
L_3E5A: CompareLeft! = N_C97C!: CompareRight! = N_804E!  ' RT3F_9F
L_3E5D: IF CompareLeft! < CompareRight! THEN GOTO L_3E62  ' flags from L_3E5A
L_3E5F: GOTO L_3E7A
L_3E62: SI = &HBA90
L_3E65: BX = CINT(N_BA90!)  ' RT3F_75
L_3E68: SI = BX
L_3E6A: SI = SI * (2 ^ 1)
L_3E6C: SI = SI * (2 ^ 1)
L_3E6E: SI = SI + &HC560
L_3E72: SWAP SI, DI
L_3E74: N(DI) = N(SI)  ' RT3F_7B
L_3E77: GOTO L_3EEB
L_3E7A: DI = &H804E
L_3E7D: SI = &HC97C
L_3E80: CompareLeft! = N_C97C!: CompareRight! = N_804E!  ' RT3F_9F
L_3E83: BX = 0
L_3E86: IF CompareLeft! <> CompareRight! THEN GOTO L_3E89  ' flags from L_3E80
L_3E88: BX = BX - 1
L_3E89: DX = SI
L_3E8B: SI = &HBA90
L_3E8E: CX = BX
L_3E90: BX = CINT(N_BA90!)  ' RT3F_75
L_3E93: SI = BX
L_3E95: SI = SI * (2 ^ 1)
L_3E97: SI = SI * (2 ^ 1)
L_3E99: BX = SI
L_3E9B: SI = SI + &HC604
L_3E9F: DI = &H9412
L_3EA2: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_3EA5: AX = 0
L_3EA8: IF CompareLeft! <= CompareRight! THEN GOTO L_3EAB  ' flags from L_3EA2
L_3EAA: AX = AX - 1
L_3EAB: AX = AX AND CX
L_3EAD: SWAP DX, SI
L_3EAF: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_3EB2: CX = 0
L_3EB5: IF CompareLeft! <> CompareRight! THEN GOTO L_3EB8  ' flags from L_3EAF
L_3EB7: CX = CX - 1
L_3EB8: SI = DX
L_3EBA: DI = &HBA94
L_3EBD: CompareLeft! = N(SI): CompareRight! = N_BA94!  ' RT3F_9F
L_3EC0: DX = 0
L_3EC3: IF CompareLeft! <= CompareRight! THEN GOTO L_3EC6  ' flags from L_3EBD
L_3EC5: DX = DX - 1
L_3EC6: DX = DX AND CX
L_3EC8: DX = DX OR AX
L_3ECA: CompareLeft% = DX: CompareRight% = 0
L_3ECC: IF CompareLeft% <> CompareRight% THEN GOTO L_3ED1  ' flags from L_3ECA
L_3ECE: GOTO L_3EEB
L_3ED1: DX = BX
L_3ED3: BX = BX + &HC560
L_3ED7: DI = BX
L_3ED9: SI = &HBB56
L_3EDC: N(DI) = N_BB56!  ' RT3F_7B
L_3EDF: DX = DX + &HC5D4
L_3EE3: DI = DX
L_3EE5: SI = &HC0F4
L_3EE8: N(DI) = N_C0F4!  ' RT3F_7B
L_3EEB: SI = &HBA90
L_3EEE: BX = CINT(N_BA90!)  ' RT3F_75
L_3EF1: SI = BX
L_3EF3: SI = SI * (2 ^ 1)
L_3EF5: SI = SI * (2 ^ 1)
L_3EF7: SI = SI + &HC560
L_3EFB: DI = &HCD72
L_3EFE: CompareLeft! = N(SI): CompareRight! = N_CD72!  ' RT3F_9F
L_3F01: BX = 0
L_3F04: IF CompareLeft! <= CompareRight! THEN GOTO L_3F07  ' flags from L_3EFE
L_3F06: BX = BX - 1
L_3F07: FAC! = CSNG(BX)  ' RT3F_57
L_3F0A: SI = &HCB06
L_3F0D: FAC! = N_CB06! - FAC!  ' RT3F_9B
L_3F10: DI = SI
L_3F12: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3F15: SI = &HBA90
L_3F18: CompareLeft! = N_BA90!: CompareRight! = 0  ' RT3F_A7
L_3F1B: IF CompareLeft! = CompareRight! THEN GOTO L_3F20  ' flags from L_3F18
L_3F1D: GOTO L_3F38
L_3F20: DI = &HC0F4
L_3F23: SI = &HC97C
L_3F26: FAC! = N_C97C! * N_C0F4!  ' RT3F_8F
L_3F29: SI = &HC338
L_3F2C: FAC! = N_C338! + FAC!  ' RT3F_83
L_3F2F: DI = &HCC48
L_3F32: N_CC48! = FAC!: SI = &H001A  ' RT3F_7D
L_3F35: GOTO L_3F5D
L_3F38: SI = &HBA90
L_3F3B: BX = CINT(N_BA90!)  ' RT3F_75
L_3F3E: SI = BX
L_3F40: SI = SI * (2 ^ 1)
L_3F42: SI = SI * (2 ^ 1)
L_3F44: SI = SI + &HC338
L_3F48: DI = &HC97C
L_3F4B: FAC! = N(SI) * N_C97C!  ' RT3F_8F
L_3F4E: DI = &HCD76
L_3F51: FAC! = FAC! * N_CD76!  ' RT3F_91
L_3F54: DI = &HCC48
L_3F57: FAC! = FAC! + N_CC48!  ' RT3F_81
L_3F5A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3F5D: DI = &H804E
L_3F60: SI = &HBA90
L_3F63: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_3F66: DI = &HBA90
L_3F69: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_3F6C: SI = DI
L_3F6E: DI = &HCD6A
L_3F71: CompareLeft! = N_BA90!: CompareRight! = N_CD6A!  ' RT3F_9F
L_3F74: IF CompareLeft! > CompareRight! THEN GOTO L_3F79  ' flags from L_3F71
L_3F76: GOTO L_3D8A
L_3F79: SI = &HCB06
L_3F7C: CompareLeft! = N_CB06!: CompareRight! = 0  ' RT3F_A7
L_3F7F: IF CompareLeft! = CompareRight! THEN GOTO L_3F84  ' flags from L_3F7C
L_3F81: GOTO L_3F8D
L_3F84: DI = &HC93E
L_3F87: SI = &H804E
L_3F8A: N_C93E! = N_804E!  ' RT3F_7B
L_3F8D: DI = &HC722
L_3F90: SI = &HC0F4
L_3F93: N_C722! = N_C0F4!  ' RT3F_7B
L_3F96: GOSUB L_18D5
L_3F99: BX = BASIC_BOOL(FAC! <> 0)  ' RT3F_1F
L_3F9C: CompareLeft% = BX: CompareRight% = 0
L_3F9E: IF CompareLeft% <> CompareRight% THEN GOTO L_3FA3  ' flags from L_3F9C
L_3FA0: GOTO L_3FB8
L_3FA3: DI = &HCCFE
L_3FA6: SI = &H9412
L_3FA9: N_CCFE! = N_9412!  ' RT3F_7B
L_3FAC: GOSUB L_407B
L_3FAF: DI = &HCB06
L_3FB2: SI = &HBB46
L_3FB5: N_CB06! = N_BB46!  ' RT3F_7B
L_3FB8: RETURN
L_3FB9: DI = &HCC4C
L_3FBC: SI = &HBB46
L_3FBF: N_CC4C! = N_BB46!  ' RT3F_7B
L_3FC2: SI = &H804E
L_3FC5: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_3FC8: GOTO L_4067
L_3FCB: ' Alignment NOP
L_3FCC: DI = &HC110
L_3FCF: SI = &HC1C0
L_3FD2: N_C110! = N_C1C0!  ' RT3F_7B
L_3FD5: BX = DI
L_3FD7: DI = &HC114
L_3FDA: SI = &HBA90
L_3FDD: N_C114! = N_BA90!  ' RT3F_7B
L_3FE0: GOSUB L_06A9
L_3FE3: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_3FE6: IF CompareLeft! > CompareRight! THEN GOTO L_3FEB  ' flags from L_3FE3
L_3FE8: GOTO L_405E
L_3FEB: DI = &HC110
L_3FEE: SI = &HC1BC
L_3FF1: N_C110! = N_C1BC!  ' RT3F_7B
L_3FF4: BX = DI
L_3FF6: DI = &HC114
L_3FF9: SI = &HBA90
L_3FFC: N_C114! = N_BA90!  ' RT3F_7B
L_3FFF: GOSUB L_06A9

```

### Battle report and return flows

```basic
L_4002: DI = &HC10C
L_4005: FAC! = FAC! / N_C10C!  ' RT3F_89
L_4008: DI = &HCC4C
L_400B: FAC! = FAC! + N_CC4C!  ' RT3F_81
L_400E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4011: BX = DI
L_4013: DI = &HC110
L_4016: SI = &HBFA6
L_4019: N_C110! = N_BFA6!  ' RT3F_7B
L_401C: DI = &HC114
L_401F: SI = &HBA90
L_4022: N_C114! = N_BA90!  ' RT3F_7B
L_4025: GOSUB L_06A9
L_4028: DI = &HC946
L_402B: N_C946! = FAC!: SI = &H001A  ' RT3F_7D
L_402E: SI = DI
L_4030: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_4033: IF CompareLeft! > CompareRight! THEN GOTO L_4038  ' flags from L_4030
L_4035: GOTO L_405E
L_4038: DI = &HC184
L_403B: FAC! = N(SI) * N_C184!  ' RT3F_8F
L_403E: DI = &HCD7A
L_4041: FAC! = FAC! + N_CD7A!  ' RT3F_81
L_4044: BX = CINT(FAC!)  ' RT3F_77
L_4047: SI = BX
L_4049: SI = SI * (2 ^ 1)
L_404B: SI = SI * (2 ^ 1)
L_404D: SI = SI + &H1850
L_4051: FAC! = N(SI) * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_4055: DI = &HCC4C
L_4058: FAC! = FAC! + N_CC4C!  ' RT3F_81
L_405B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_405E: DI = &H804E
L_4061: SI = &HBA90
L_4064: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_4067: DI = &HBA90
L_406A: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_406D: SI = DI
L_406F: DI = &HC10C
L_4072: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_4075: IF CompareLeft! > CompareRight! THEN GOTO L_407A  ' flags from L_4072
L_4077: GOTO L_3FCC
L_407A: RETURN
L_407B: DI = &HC6B0
L_407E: SI = &HC63C
L_4081: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_4084: DI = &HCD7E
L_4087: N_CD7E! = FAC!: SI = &H001A  ' RT3F_7D
L_408A: SI = &HC6B4
L_408D: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_4090: GOTO L_40C0
L_4093: ' Alignment NOP
L_4094: SI = &HBA90
L_4097: BX = CINT(N_BA90!)  ' RT3F_75
L_409A: SI = BX
L_409C: SI = SI * (2 ^ 1)
L_409E: SI = SI * (2 ^ 1)
L_40A0: SI = SI + &HC560
L_40A4: DI = &H9412
L_40A7: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_40AA: IF CompareLeft! > CompareRight! THEN GOTO L_40AF  ' flags from L_40A7
L_40AC: GOTO L_40B7
L_40AF: DI = SI
L_40B1: SI = &HCCFE
L_40B4: N(DI) = N_CCFE!  ' RT3F_7B
L_40B7: DI = &H804E
L_40BA: SI = &HBA90
L_40BD: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_40C0: DI = &HBA90
L_40C3: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_40C6: SI = DI
L_40C8: DI = &HCD7E
L_40CB: CompareLeft! = N_BA90!: CompareRight! = N_CD7E!  ' RT3F_9F
L_40CE: IF CompareLeft! <= CompareRight! THEN GOTO L_4094  ' flags from L_40CB
L_40D0: RETURN
L_40D1: DI = &H804E
L_40D4: SI = &HC66C
L_40D7: CompareLeft! = N_C66C!: CompareRight! = N_804E!  ' RT3F_9F
L_40DA: BX = 0
L_40DD: IF CompareLeft! <= CompareRight! THEN GOTO L_40E0  ' flags from L_40D7
L_40DF: BX = BX - 1
L_40E0: FAC! = RND  ' RT3D_34
L_40E3: DX = DI
L_40E5: DI = &HBB9E
L_40E8: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_40EB: DI = &HC766
L_40EE: CompareLeft! = FAC!: CompareRight! = N_C766!  ' RT3F_A1
L_40F1: CX = 0
L_40F4: IF CompareLeft! >= CompareRight! THEN GOTO L_40F7  ' flags from L_40EE
L_40F6: CX = CX - 1
L_40F7: CX = CX AND BX
L_40F9: CompareLeft% = CX: CompareRight% = 0
L_40FB: IF CompareLeft% <> CompareRight% THEN GOTO L_4100  ' flags from L_40F9
L_40FD: GOTO L_4108
L_4100: SI = DX
L_4102: DI = &HC932
L_4105: N_C932! = N(SI)  ' RT3F_7B
L_4108: GOSUB L_2C3C
L_410B: GOTO L_4554
L_410E: GOSUB L_2EFC
L_4111: BX = &H16
L_4114: ARGPUSH BX  ' RT3E_42
L_4117: BX = &HC
L_411A: LOCATE ARGS(), BX  ' RT3E_44
L_411D: ' PRINT statement begins ; RT3F_BC
L_4120: BX = &HCD82
L_4123: PRINT S_CD82$  ' RT3F_6E; H newline item, ledger correction
L_4126: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4129: GOSUB L_2C3C
L_412C: GOSUB L_2C3C
L_412F: BX = &HFFFF
L_4132: CLS BX  ' RT3E_32
L_4135: BX = 1
L_4138: ARGPUSH BX  ' RT3E_42
L_413B: DX = BX
L_413D: BX = &HE
L_4140: LOCATE ARGS(), BX  ' RT3E_44
L_4143: ' PRINT statement begins ; RT3F_BC
L_4146: BX = &HCD92
L_4149: PRINT S_CD92$  ' RT3F_6E; H newline item, ledger correction
L_414C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_414F: BX = 3
L_4152: ARGPUSH BX  ' RT3E_42
L_4155: BX = DX
L_4157: LOCATE ARGS(), BX  ' RT3E_44
L_415A: ' PRINT statement begins ; RT3F_BC
L_415D: BX = &HCDA4
L_4160: PRINT S_CDA4$;  ' RT3F_6A
L_4163: BX = &HCB02
L_4166: PRINT N_CB02!  ' RT3F_6B
L_4169: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_416C: ' PRINT statement begins ; RT3F_BC
L_416F: BX = &H9408
L_4172: PRINT S_9408$  ' RT3F_6E; H newline item, ledger correction
L_4175: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4178: DI = &HC6B0
L_417B: SI = &HC63C
L_417E: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_4181: DI = &HCDB8
L_4184: N_CDB8! = FAC!: SI = &H001A  ' RT3F_7D
L_4187: SI = &HC6B4
L_418A: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_418D: GOTO L_42D2
L_4190: DI = &HC97C
L_4193: SI = &HBB46
L_4196: N_C97C! = N_BB46!  ' RT3F_7B
L_4199: SI = &HBA90
L_419C: BX = CINT(N_BA90!)  ' RT3F_75
L_419F: SI = BX
L_41A1: SI = SI * (2 ^ 1)
L_41A3: SI = SI * (2 ^ 1)
L_41A5: SI = SI + &HC604
L_41A9: DI = &HC6B0
L_41AC: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_41AF: DI = &HCDBC
L_41B2: N_CDBC! = FAC!: SI = &H001A  ' RT3F_7D
L_41B5: SI = &HC6B4
L_41B8: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_41BB: GOTO L_41F7
L_41BE: SI = &HBA90
L_41C1: BX = CINT(N_BA90!)  ' RT3F_75
L_41C4: AX = BX
L_41C6: SI = 5
L_41C9: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_41CB: SI = AX
L_41CD: SI = &HC634
L_41D0: BX = SI
L_41D2: DX = BX
L_41D4: BX = CINT(N_C634!)  ' RT3F_75
L_41D7: BX = BX + AX
L_41D9: SI = BX
L_41DB: SI = SI * (2 ^ 1)
L_41DD: SI = SI * (2 ^ 1)
L_41DF: SI = SI + &HC2B8
L_41E3: FAC! = SGN(N(SI))  ' RT3F_2F
L_41E6: DI = &HC97C
L_41E9: FAC! = FAC! + N_C97C!  ' RT3F_81
L_41EC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_41EF: SI = DX
L_41F1: DI = &H804E
L_41F4: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_41F7: DI = &HC634
L_41FA: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_41FD: SI = DI
L_41FF: DI = &HCDBC
L_4202: CompareLeft! = N_C634!: CompareRight! = N_CDBC!  ' RT3F_9F
L_4205: IF CompareLeft! <= CompareRight! THEN GOTO L_41BE  ' flags from L_4202
L_4207: ' PRINT statement begins ; RT3F_BC
L_420A: BX = &H9408
L_420D: PRINT S_9408$  ' RT3F_6E; H newline item, ledger correction
L_4210: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4213: ' PRINT statement begins ; RT3F_BC
L_4216: DX = BX
L_4218: BX = &HCDC0
L_421B: PRINT S_CDC0$;  ' RT3F_6A
L_421E: DI = &HC6E0
L_4221: SI = &HBA90
L_4224: FAC! = N_BA90! + N_C6E0!  ' RT3F_7F
L_4227: BX = SI
L_4229: CX = BX
L_422B: BX = CINT(FAC!)  ' RT3F_77
L_422E: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_4231: PRINT S(BX);  ' RT3F_6A
L_4234: BX = &HC6E4
L_4237: PRINT S_C6E4$;  ' RT3F_6A
L_423A: SI = CX
L_423C: BX = CINT(N(SI))  ' RT3F_75
L_423F: BX = BX * (2 ^ 1)
L_4241: BX = BX * (2 ^ 1)
L_4243: CX = BX
L_4245: BX = BX + &HC1E8
L_4249: PRINT S(BX);  ' RT3F_6A
L_424C: BX = &HC6EA
L_424F: PRINT S_C6EA$  ' RT3F_6E; H newline item, ledger correction
L_4252: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4255: ' PRINT statement begins ; RT3F_BC
L_4258: BX = 9
L_425B: PRINT SPC(BX);  ' RT3F_35; M ledger
L_425E: BX = DX
L_4260: PRINT S(BX);  ' RT3F_6A
L_4263: BX = CX
L_4265: CX = CX + &HC604
L_4269: SI = CX
L_426B: DI = &HC97C
L_426E: FAC! = N(SI) - N_C97C!  ' RT3F_97
L_4271: DX = BX
L_4273: BX = &H1A
L_4276: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_4279: BX = &HCDCA
L_427C: PRINT S_CDCA$;  ' RT3F_6A
L_427F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4282: DX = DX + &HC560
L_4286: SI = DX
L_4288: BX = DI
L_428A: DI = &H9412
L_428D: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_4290: IF CompareLeft! = CompareRight! THEN GOTO L_4295  ' flags from L_428D
L_4292: GOTO L_42A7
L_4295: ' PRINT statement begins ; RT3F_BC
L_4298: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_429B: BX = &HCDD6
L_429E: PRINT S_CDD6$  ' RT3F_6E; H newline item, ledger correction
L_42A1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_42A4: GOTO L_42C9
L_42A7: SI = &HC97C
L_42AA: BX = SI
L_42AC: DX = BX
L_42AE: BX = BASIC_BOOL(N_C97C! <> 0)  ' RT3F_1D
L_42B1: CompareLeft% = BX: CompareRight% = 0
L_42B3: IF CompareLeft% <> CompareRight% THEN GOTO L_42B8  ' flags from L_42B1
L_42B5: GOTO L_42C9
L_42B8: ' PRINT statement begins ; RT3F_BC
L_42BB: BX = DX
L_42BD: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_42C0: BX = &HCDE4
L_42C3: PRINT S_CDE4$  ' RT3F_6E; H newline item, ledger correction
L_42C6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_42C9: DI = &H804E
L_42CC: SI = &HBA90
L_42CF: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_42D2: DI = &HBA90
L_42D5: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_42D8: SI = DI
L_42DA: DI = &HCDB8
L_42DD: CompareLeft! = N_BA90!: CompareRight! = N_CDB8!  ' RT3F_9F
L_42E0: IF CompareLeft! > CompareRight! THEN GOTO L_42E5  ' flags from L_42DD
L_42E2: GOTO L_4190
L_42E5: SI = &HC93E
L_42E8: CompareLeft! = N_C93E!: CompareRight! = 0  ' RT3F_A7
L_42EB: BX = 0
L_42EE: IF CompareLeft! <= CompareRight! THEN GOTO L_42F1  ' flags from L_42E8
L_42F0: BX = BX - 1
L_42F1: SI = &HCB02
L_42F4: CompareLeft! = N_CB02!: CompareRight! = 0  ' RT3F_A7
L_42F7: DX = 0
L_42FA: IF CompareLeft! <= CompareRight! THEN GOTO L_42FD  ' flags from L_42F4
L_42FC: DX = DX - 1
L_42FD: DX = DX OR BX
L_42FF: CompareLeft% = DX: CompareRight% = 0
L_4301: IF CompareLeft% >= CompareRight% THEN GOTO L_4305  ' flags from L_42FF
L_4303: DX = -DX
L_4305: BX = DX
L_4307: FAC! = CSNG(BX)  ' RT3F_57
L_430A: DI = &H3B88
L_430D: N_3B88! = FAC!: SI = &H001A  ' RT3F_7D
L_4310: DI = &HBAF4
L_4313: SI = &HBAF0
L_4316: CompareLeft! = N_BAF0!: CompareRight! = N_BAF4!  ' RT3F_9F
L_4319: IF CompareLeft! = CompareRight! THEN GOTO L_431E  ' flags from L_4316
L_431B: GOTO L_4321
L_431E: GOSUB L_436D
L_4321: GOSUB L_9685
L_4324: DI = &H804E
L_4327: SI = &H3B1C
L_432A: CompareLeft! = N_3B1C!: CompareRight! = N_804E!  ' RT3F_9F
L_432D: IF CompareLeft! = CompareRight! THEN GOTO L_4332  ' flags from L_432A
L_432F: GOTO L_4341
L_4332: BX = &HCDF4
L_4335: AX = &H9404
L_4338: BX = TEMP_DESC(S_9404$ + S_CDF4$)  ' BX receives a temporary descriptor  ' RT3F_55
L_433B: CHAIN S(BX)  ' RT3E_0E; H expanded ledger
L_433E: GOTO L_434D
L_4341: BX = &HCE02
L_4344: AX = &H9404
L_4347: BX = TEMP_DESC(S_9404$ + S_CE02$)  ' BX receives a temporary descriptor  ' RT3F_55
L_434A: CHAIN S(BX)  ' RT3E_0E; H expanded ledger
L_434D: BX = &HFFFF
L_4350: CLS BX  ' RT3E_32
L_4353: BX = &HD
L_4356: ARGPUSH BX  ' RT3E_42
L_4359: BX = &HC
L_435C: LOCATE ARGS(), BX  ' RT3E_44
L_435F: ' PRINT statement begins ; RT3F_BC
L_4362: BX = &HCE10
L_4365: PRINT S_CE10$  ' RT3F_6E; H newline item, ledger correction
L_4368: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_436B: GOTO L_436B
L_436D: DI = &HCE24
L_4370: SI = &H1D2C
L_4373: N_CE24! = N_1D2C!  ' RT3F_7B
L_4376: SI = DI
L_4378: DI = &HC6B0
L_437B: FAC! = N_CE24! + N_C6B0!  ' RT3F_7F
L_437E: DI = &HCE28
L_4381: N_CE28! = FAC!: SI = &H001A  ' RT3F_7D
L_4384: SI = DI
L_4386: CompareLeft! = N_CE28!: CompareRight! = 0  ' RT3F_A7
L_4389: IF CompareLeft! < CompareRight! THEN GOTO L_438E  ' flags from L_4386
L_438B: GOTO L_4394
L_438E: SI = &HCB2E
L_4391: N(DI) = N_CB2E!  ' RT3F_7B
L_4394: SI = &HC93E
L_4397: BX = BASIC_BOOL(N_C93E! <> 0)  ' RT3F_1D
L_439A: CompareLeft% = BX: CompareRight% = 0
L_439C: IF CompareLeft% = CompareRight% THEN GOTO L_43A1  ' flags from L_439A
L_439E: GOTO L_4404
L_43A1: DI = &HCE2C
L_43A4: SI = &HCE24
L_43A7: FAC! = N_CE24! + N_CE2C!  ' RT3F_7F
L_43AA: BX = CINT(FAC!)  ' RT3F_77
L_43AD: DI = BX
L_43AF: DI = DI * (2 ^ 1)
L_43B1: DI = DI * (2 ^ 1)
L_43B3: DI = DI + &H1850
L_43B7: SI = &H1D3C
L_43BA: FAC! = N_1D3C! - N(DI)  ' RT3F_97
L_43BD: DI = SI
L_43BF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_43C2: DI = &H1D2C
L_43C5: SI = &HCE28
L_43C8: N_1D2C! = N_CE28!  ' RT3F_7B
L_43CB: DI = &HC6B0
L_43CE: SI = &H1D28
L_43D1: FAC! = N_1D28! + N_C6B0!  ' RT3F_7F
L_43D4: SWAP SI, DI
L_43D6: BX = SI
L_43D8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_43DB: DI = BX
L_43DD: SI = &H1D30
L_43E0: FAC! = N_1D30! + N(DI)  ' RT3F_7F
L_43E3: SWAP SI, DI
L_43E5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_43E8: DI = BX
L_43EA: SI = &H1D38
L_43ED: FAC! = N_1D38! + N(DI)  ' RT3F_7F
L_43F0: DI = SI
L_43F2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_43F5: DI = &HC6B0
L_43F8: SI = &H1D34
L_43FB: FAC! = N_1D34! + N_C6B0!  ' RT3F_7F
L_43FE: DI = SI

```

### Towing and movement phase

```basic
L_4400: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4403: RETURN
L_4404: DI = &HCE30
L_4407: SI = &H3B44
L_440A: FAC! = N_3B44! + N_CE30!  ' RT3F_7F
L_440D: DI = &H3BAC
L_4410: CompareLeft! = FAC!: CompareRight! = N_3BAC!  ' RT3F_A1
L_4413: IF CompareLeft! = CompareRight! THEN GOTO L_4418  ' flags from L_4410
L_4415: GOTO L_441B
L_4418: GOSUB L_A8B8
L_441B: DI = &HCE34
L_441E: SI = &H3B50
L_4421: FAC! = N_3B50! + N_CE34!  ' RT3F_7F
L_4424: BX = SI
L_4426: SI = &H3BAC
L_4429: CompareLeft! = N_3BAC!: CompareRight! = FAC!  ' RT3F_A3
L_442C: IF CompareLeft! = CompareRight! THEN GOTO L_4431  ' flags from L_4429
L_442E: GOTO L_4439
L_4431: DI = BX
L_4433: SI = &HCE38
L_4436: N(DI) = N_CE38!  ' RT3F_7B
L_4439: DI = &HCE34
L_443C: SI = &H3B40
L_443F: FAC! = N_3B40! + N_CE34!  ' RT3F_7F
L_4442: BX = SI
L_4444: SI = &H3BAC
L_4447: CompareLeft! = N_3BAC!: CompareRight! = FAC!  ' RT3F_A3
L_444A: IF CompareLeft! = CompareRight! THEN GOTO L_444F  ' flags from L_4447
L_444C: GOTO L_4457
L_444F: DI = BX
L_4451: SI = &HCE38
L_4454: N(DI) = N_CE38!  ' RT3F_7B
L_4457: ' PRINT statement begins ; RT3F_BC
L_445A: BX = &H9408
L_445D: PRINT S_9408$  ' RT3F_6E; H newline item, ledger correction
L_4460: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4463: DI = &H9412
L_4466: SI = &H1868
L_4469: CompareLeft! = N_1868!: CompareRight! = N_9412!  ' RT3F_9F
L_446C: IF CompareLeft! = CompareRight! THEN GOTO L_4471  ' flags from L_4469
L_446E: GOTO L_447E
L_4471: ' PRINT statement begins ; RT3F_BC
L_4474: BX = &HCE3C
L_4477: PRINT S_CE3C$  ' RT3F_6E; H newline item, ledger correction
L_447A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_447D: RETURN
L_447E: DI = &HCE52
L_4481: SI = &HCE56
L_4484: N_CE52! = N_CE56!  ' RT3F_7B
L_4487: SI = &HCE5A
L_448A: FAC! = N_CE5A!: DI = &H001E  ' RT3F_6F
L_448D: GOTO L_44C3
L_4490: SI = &HC634
L_4493: BX = SI
L_4495: DX = BX
L_4497: BX = CINT(N_C634!)  ' RT3F_75
L_449A: SI = BX
L_449C: SI = SI * (2 ^ 1)
L_449E: SI = SI * (2 ^ 1)
L_44A0: SI = SI + &H1850
L_44A4: DI = &HCE52
L_44A7: CompareLeft! = N(SI): CompareRight! = N_CE52!  ' RT3F_9F
L_44AA: IF CompareLeft! < CompareRight! THEN GOTO L_44AF  ' flags from L_44A7
L_44AC: GOTO L_44BA
L_44AF: N(DI) = N(SI)  ' RT3F_7B
L_44B2: SI = DX
L_44B4: DI = &HCA94
L_44B7: N_CA94! = N(SI)  ' RT3F_7B
L_44BA: DI = &H804E
L_44BD: SI = &HC634
L_44C0: FAC! = N_C634! + N_804E!  ' RT3F_7F
L_44C3: DI = &HC634
L_44C6: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_44C9: SI = DI
L_44CB: DI = &HCE5E
L_44CE: CompareLeft! = N_C634!: CompareRight! = N_CE5E!  ' RT3F_9F
L_44D1: IF CompareLeft! <= CompareRight! THEN GOTO L_4490  ' flags from L_44CE
L_44D3: ' PRINT statement begins ; RT3F_BC
L_44D6: BX = &H9408
L_44D9: PRINT S_9408$  ' RT3F_6E; H newline item, ledger correction
L_44DC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_44DF: ' PRINT statement begins ; RT3F_BC
L_44E2: BX = &HCE62
L_44E5: PRINT S_CE62$  ' RT3F_6E; H newline item, ledger correction
L_44E8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_44EB: SI = &HCA94
L_44EE: BX = SI
L_44F0: DX = BX
L_44F2: BX = CINT(N_CA94!)  ' RT3F_75
L_44F5: DI = BX
L_44F7: DI = DI * (2 ^ 1)
L_44F9: DI = DI * (2 ^ 1)
L_44FB: DI = DI + &H1850
L_44FF: BX = DI
L_4501: DI = &HCE2C
L_4504: SI = &HCE24
L_4507: FAC! = N_CE24! + N_CE2C!  ' RT3F_7F
L_450A: CX = SI
L_450C: AX = BX
L_450E: BX = CINT(FAC!)  ' RT3F_77
L_4511: SI = BX
L_4513: SI = SI * (2 ^ 1)
L_4515: SI = SI * (2 ^ 1)
L_4517: SI = SI + &H1850
L_451B: DI = AX
L_451D: N(DI) = N(SI)  ' RT3F_7B
L_4520: SI = DX
L_4522: DI = &HCE30
L_4525: FAC! = N(SI) + N_CE30!  ' RT3F_7F
L_4528: BX = CINT(FAC!)  ' RT3F_77
L_452B: DI = BX
L_452D: DI = DI * (2 ^ 1)
L_452F: DI = DI * (2 ^ 1)
L_4531: DI = DI + &H1850
L_4535: SI = CX
L_4537: BX = DI
L_4539: DI = &HCE78
L_453C: FAC! = N(SI) + N_CE78!  ' RT3F_7F
L_453F: DX = BX
L_4541: BX = CINT(FAC!)  ' RT3F_77
L_4544: SI = BX
L_4546: SI = SI * (2 ^ 1)
L_4548: SI = SI * (2 ^ 1)
L_454A: SI = SI + &H1850
L_454E: DI = DX
L_4550: N(DI) = N(SI)  ' RT3F_7B
L_4553: RETURN
L_4554: GOSUB L_4E3D
L_4557: DI = &HCE7C
L_455A: SI = &HCE80
L_455D: N_CE7C! = N_CE80!  ' RT3F_7B
L_4560: SI = &H804E
L_4563: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_4566: GOTO L_46B8
L_4569: ' Alignment NOP
L_456A: DI = &HC120
L_456D: SI = &HCA72
L_4570: N_C120! = N_CA72!  ' RT3F_7B
L_4573: BX = DI
L_4575: DI = &HC124
L_4578: DX = SI
L_457A: SI = &HC942
L_457D: N_C124! = N_C942!  ' RT3F_7B
L_4580: GOSUB L_06DB
L_4583: BX = CINT(FAC!)  ' RT3F_77
L_4586: DI = BX
L_4588: DI = DI * (2 ^ 1)
L_458A: DI = DI * (2 ^ 1)
L_458C: DI = DI + &H1850
L_4590: BX = DI
L_4592: DI = &HC110
L_4595: SI = &HCA72
L_4598: N_C110! = N_CA72!  ' RT3F_7B
L_459B: DX = DI
L_459D: DI = &HC114
L_45A0: CX = SI
L_45A2: SI = &HC942
L_45A5: N_C114! = N_C942!  ' RT3F_7B
L_45A8: WORD(BP - &HC) = BX
L_45AB: GOSUB L_06A9
L_45AE: DI = &HC110
L_45B1: SI = &HCA72
L_45B4: N_C110! = N_CA72!  ' RT3F_7B
L_45B7: BX = DI
L_45B9: DI = &HC114
L_45BC: DX = SI
L_45BE: SI = &HC942
L_45C1: N_C114! = N_C942!  ' RT3F_7B
L_45C4: T_03! = FAC!  ' RT3F_71; inline=&H83
L_45C8: GOSUB L_06A9
L_45CB: DI = &HBB56
L_45CE: CompareLeft! = FAC!: CompareRight! = N_BB56!  ' RT3F_A1
L_45D1: BX = 0
L_45D4: IF CompareLeft! <= CompareRight! THEN GOTO L_45D7  ' flags from L_45CE
L_45D6: BX = BX - 1
L_45D7: CompareLeft% = BX: CompareRight% = 0
L_45D9: IF CompareLeft% >= CompareRight% THEN GOTO L_45DD  ' flags from L_45D7
L_45DB: BX = -BX
L_45DD: FAC! = CSNG(BX)  ' RT3F_57
L_45E0: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_45E4: DI = &HC110
L_45E7: SI = &HCA72
L_45EA: N_C110! = N_CA72!  ' RT3F_7B
L_45ED: BX = DI
L_45EF: DI = &HC114
L_45F2: SI = &HC942
L_45F5: N_C114! = N_C942!  ' RT3F_7B
L_45F8: T_04! = FAC!  ' RT3F_71; inline=&H84
L_45FC: GOSUB L_06A9
L_45FF: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_4602: BX = 0
L_4605: IF CompareLeft! >= CompareRight! THEN GOTO L_4608  ' flags from L_45FF
L_4607: BX = BX - 1
L_4608: FAC! = CSNG(BX)  ' RT3F_57
L_460B: FAC! = T_04! + FAC!  ' RT3F_85; inline=&H84
L_460F: DI = WORD(BP - &HC)
L_4612: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4615: SI = &HBAE8
L_4618: CompareLeft! = N_BAE8!: CompareRight! = 0  ' RT3F_A7
L_461B: BX = 0
L_461E: IF CompareLeft! <> CompareRight! THEN GOTO L_4621  ' flags from L_4618
L_4620: BX = BX - 1
L_4621: DI = &HC110
L_4624: SI = &HC974
L_4627: N_C110! = N_C974!  ' RT3F_7B
L_462A: DI = &HC114
L_462D: SI = &HC942
L_4630: N_C114! = N_C942!  ' RT3F_7B
L_4633: WORD(BP - &HE) = BX
L_4636: GOSUB L_06A9
L_4639: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_463C: BX = 0
L_463F: IF CompareLeft! <> CompareRight! THEN GOTO L_4642  ' flags from L_4639
L_4641: BX = BX - 1
L_4642: BX = BX AND WORD(BP - &HE)
L_4645: CompareLeft% = BX: CompareRight% = 0
L_4647: IF CompareLeft% <> CompareRight% THEN GOTO L_464C  ' flags from L_4645
L_4649: GOTO L_46AF
L_464C: DI = &HC120
L_464F: SI = &HC9A0
L_4652: N_C120! = N_C9A0!  ' RT3F_7B
L_4655: BX = DI
L_4657: DI = &HC124
L_465A: DX = SI
L_465C: SI = &HC942
L_465F: N_C124! = N_C942!  ' RT3F_7B
L_4662: GOSUB L_06DB
L_4665: BX = CINT(FAC!)  ' RT3F_77
L_4668: DI = BX
L_466A: DI = DI * (2 ^ 1)
L_466C: DI = DI * (2 ^ 1)
L_466E: DI = DI + &H1850
L_4672: BX = DI
L_4674: DI = &HC120
L_4677: SI = &HC9A0
L_467A: N_C120! = N_C9A0!  ' RT3F_7B
L_467D: DI = &HC124
L_4680: SI = &HC942
L_4683: N_C124! = N_C942!  ' RT3F_7B
L_4686: WORD(BP - &H10) = BX
L_4689: GOSUB L_06DB
L_468C: BX = CINT(FAC!)  ' RT3F_77
L_468F: SI = BX
L_4691: SI = SI * (2 ^ 1)
L_4693: SI = SI * (2 ^ 1)
L_4695: SI = SI + &H1850
L_4699: DI = &HCE84
L_469C: BX = SI
L_469E: SI = &HBB4E
L_46A1: FAC! = N_BB4E! * N_CE84!  ' RT3F_8F
L_46A4: SI = BX
L_46A6: FAC! = N(SI) - FAC!  ' RT3F_9B
L_46A9: DI = WORD(BP - &H10)
L_46AC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_46AF: DI = &H804E
L_46B2: SI = &HC942
L_46B5: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_46B8: DI = &HC942
L_46BB: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_46BE: SI = DI
L_46C0: DI = &HC10C
L_46C3: CompareLeft! = N_C942!: CompareRight! = N_C10C!  ' RT3F_9F
L_46C6: IF CompareLeft! > CompareRight! THEN GOTO L_46CB  ' flags from L_46C3
L_46C8: GOTO L_456A
L_46CB: SI = &H804E
L_46CE: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_46D1: GOTO L_4DD7
L_46D4: DI = &HCE7C
L_46D7: SI = &HBB46
L_46DA: N_CE7C! = N_BB46!  ' RT3F_7B
L_46DD: GOSUB L_2EFC
L_46E0: BX = &H14
L_46E3: ARGPUSH BX  ' RT3E_42
L_46E6: BX = &HA
L_46E9: LOCATE ARGS(), BX  ' RT3E_44
L_46EC: ' PRINT statement begins ; RT3F_BC
L_46EF: BX = &HCE88
L_46F2: PRINT S_CE88$;  ' RT3F_6A
L_46F5: BX = &HCE9A
L_46F8: PRINT N_CE9A!  ' RT3F_6B
L_46FB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_46FE: DI = &HC75E
L_4701: SI = &HCE9A
L_4704: FAC! = N_CE9A! * N_C75E!  ' RT3F_8F
L_4707: BX = DI
L_4709: DI = &HC10C
L_470C: DX = SI
L_470E: FAC! = FAC! / N_C10C!  ' RT3F_89
L_4711: CX = DI
L_4713: DI = &HBB52
L_4716: FAC! = FAC! + N_BB52!  ' RT3F_81
L_4719: AX = BX
L_471B: BX = &H1A
L_471E: FAC! = INT(FAC!)  ' RT3D_03
L_4721: SI = DX
L_4723: BX = DI
L_4725: DI = &HC6B0
L_4728: T_03! = FAC!  ' RT3F_71; inline=&H83
L_472C: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_472F: DI = AX
L_4731: FAC! = FAC! * N(DI)  ' RT3F_91
L_4734: DI = CX
L_4736: FAC! = FAC! / N(DI)  ' RT3F_89
L_4739: DI = BX
L_473B: FAC! = FAC! + N(DI)  ' RT3F_81
L_473E: BX = &H1A
L_4741: FAC! = INT(FAC!)  ' RT3D_03
L_4744: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_4748: BX = 0
L_474B: IF CompareLeft! <> CompareRight! THEN GOTO L_474E  ' flags from L_4744
L_474D: BX = BX - 1
L_474E: DI = &H9412
L_4751: SI = &HBAEC
L_4754: CompareLeft! = N_BAEC!: CompareRight! = N_9412!  ' RT3F_9F
L_4757: DX = 0
L_475A: IF CompareLeft! <> CompareRight! THEN GOTO L_475D  ' flags from L_4754
L_475C: DX = DX - 1
L_475D: DX = DX OR BX
L_475F: CompareLeft% = DX: CompareRight% = 0
L_4761: IF CompareLeft% = CompareRight% THEN GOTO L_4766  ' flags from L_475F
L_4763: GOTO L_48C6
L_4766: BX = &H16
L_4769: ARGPUSH BX  ' RT3E_42
L_476C: BX = 2
L_476F: LOCATE ARGS(), BX  ' RT3E_44
L_4772: ' PRINT statement begins ; RT3F_BC
L_4775: DX = BX
L_4777: BX = &HCE9E
L_477A: PRINT S_CE9E$  ' RT3F_6E; H newline item, ledger correction
L_477D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4780: BX = &H17
L_4783: ARGPUSH BX  ' RT3E_42
L_4786: BX = DX
L_4788: LOCATE ARGS(), BX  ' RT3E_44
L_478B: ' PRINT statement begins ; RT3F_BC
L_478E: BX = &HCEB2
L_4791: PRINT S_CEB2$  ' RT3F_6E; H newline item, ledger correction
L_4794: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4797: BX = &H18
L_479A: ARGPUSH BX  ' RT3E_42
L_479D: BX = DX
L_479F: LOCATE ARGS(), BX  ' RT3E_44
L_47A2: ' PRINT statement begins ; RT3F_BC
L_47A5: BX = &HCEC2
L_47A8: PRINT S_CEC2$;  ' RT3F_6A
L_47AB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_47AE: BX = &HE0
L_47B1: DX = &HA0
L_47B4: CX = 0
L_47B6: AX = CX
L_47B8: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_47BB: BX = &HB3B0
L_47BE: DX = 4
L_47C1: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_47C4: DI = &HCED2
L_47C7: SI = &HC52C
L_47CA: N_CED2! = N_C52C!  ' RT3F_7B
L_47CD: DI = &HCED6
L_47D0: SI = &HC550
L_47D3: N_CED6! = N_C550!  ' RT3F_7B
L_47D6: DI = &HCEDA
L_47D9: SI = &HBB46
L_47DC: N_CEDA! = N_BB46!  ' RT3F_7B
L_47DF: DI = &HCEDE
L_47E2: N_CEDE! = N_BB46!  ' RT3F_7B
L_47E5: GOSUB L_2E4E
L_47E8: SI = &HCA52
L_47EB: BX = CINT(N_CA52!)  ' RT3F_75
L_47EE: ON BX GOSUB L_47C4, L_4F47, L_47C4, L_47C4, L_4F53, L_47C4, L_4F6B, L_47C4, L_47C4, L_4F5F, L_47C4, L_4FCC, L_4FCB, L_5438  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_480E: SI = &HCE7C
L_4811: CompareLeft! = N_CE7C!: CompareRight! = 0  ' RT3F_A7
L_4814: BX = 0
L_4817: IF CompareLeft! <> CompareRight! THEN GOTO L_481A  ' flags from L_4811
L_4819: BX = BX - 1
L_481A: DI = &HBAD0
L_481D: SI = &HCA52
L_4820: CompareLeft! = N_CA52!: CompareRight! = N_BAD0!  ' RT3F_9F
L_4823: DX = 0
L_4826: IF CompareLeft! = CompareRight! THEN GOTO L_4829  ' flags from L_4820
L_4828: DX = DX - 1
L_4829: DX = DX AND BX
L_482B: CompareLeft% = DX: CompareRight% = 0
L_482D: IF CompareLeft% = CompareRight% THEN GOTO L_4832  ' flags from L_482B
L_482F: GOTO L_46DD
L_4832: GOSUB L_2F1E
L_4835: DI = &H804E
L_4838: SI = &HCE7C
L_483B: CompareLeft! = N_CE7C!: CompareRight! = N_804E!  ' RT3F_9F
L_483E: IF CompareLeft! = CompareRight! THEN GOTO L_4843  ' flags from L_483B
L_4840: GOTO L_48C6
L_4843: SI = DI
L_4845: FAC! = N(SI): DI = &H001E  ' RT3F_6F
L_4848: GOTO L_48B6
L_484B: ' Alignment NOP
L_484C: DI = &HC120
L_484F: SI = &HC9A0
L_4852: N_C120! = N_C9A0!  ' RT3F_7B
L_4855: BX = DI
L_4857: DI = &HC124
L_485A: DX = SI
L_485C: SI = &HC942
L_485F: N_C124! = N_C942!  ' RT3F_7B
L_4862: GOSUB L_06DB
L_4865: BX = CINT(FAC!)  ' RT3F_77
L_4868: DI = BX
L_486A: DI = DI * (2 ^ 1)
L_486C: DI = DI * (2 ^ 1)
L_486E: DI = DI + &H1850
L_4872: BX = DI
L_4874: DI = &HC120
L_4877: SI = &HC9A0
L_487A: N_C120! = N_C9A0!  ' RT3F_7B
L_487D: DI = &HC124
L_4880: SI = &HC942
L_4883: N_C124! = N_C942!  ' RT3F_7B
L_4886: WORD(BP - &HC) = BX
L_4889: GOSUB L_06DB
L_488C: BX = CINT(FAC!)  ' RT3F_77
L_488F: SI = BX
L_4891: SI = SI * (2 ^ 1)
L_4893: SI = SI * (2 ^ 1)
L_4895: SI = SI + &H1850
L_4899: BX = SI
L_489B: SI = &HBB4E
L_489E: FAC! = N_BB4E! * 2 ^ (2)  ' RT3F_AB; inline=&H02
L_48A2: SI = BX
L_48A4: FAC! = N(SI) - FAC!  ' RT3F_9B
L_48A7: DI = WORD(BP - &HC)
L_48AA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_48AD: DI = &H804E
L_48B0: SI = &HC942
L_48B3: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_48B6: DI = &HC942
L_48B9: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_48BC: SI = DI
L_48BE: DI = &HC10C
L_48C1: CompareLeft! = N_C942!: CompareRight! = N_C10C!  ' RT3F_9F
L_48C4: IF CompareLeft! <= CompareRight! THEN GOTO L_484C  ' flags from L_48C1
L_48C6: DI = &HC6B0
L_48C9: SI = &HC63C
L_48CC: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_48CF: DI = &HCEE2
L_48D2: N_CEE2! = FAC!: SI = &H001A  ' RT3F_7D
L_48D5: SI = &HC6B4
L_48D8: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_48DB: GOTO L_4D96
L_48DE: GOSUB L_9B06
L_48E1: SI = &HC634
L_48E4: BX = CINT(N_C634!)  ' RT3F_75
L_48E7: SI = BX
L_48E9: SI = SI * (2 ^ 1)
L_48EB: SI = SI * (2 ^ 1)
L_48ED: SI = SI + &HC560
L_48F1: DI = &HBB56
L_48F4: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_48F7: IF CompareLeft! >= CompareRight! THEN GOTO L_48FC  ' flags from L_48F4
L_48F9: GOTO L_4D8D
L_48FC: SI = &HC634
L_48FF: BX = CINT(N_C634!)  ' RT3F_75
L_4902: SI = BX
L_4904: SI = SI * (2 ^ 1)
L_4906: SI = SI * (2 ^ 1)
L_4908: SI = SI + &HC2A8
L_490C: DI = &HCE9A
L_490F: FAC! = N(SI) * N_CE9A!  ' RT3F_8F
L_4912: BX = DI
L_4914: DI = &HC10C
L_4917: DX = SI
L_4919: FAC! = FAC! / N_C10C!  ' RT3F_89
L_491C: CX = DI
L_491E: DI = &HBB52
L_4921: FAC! = FAC! + N_BB52!  ' RT3F_81
L_4924: AX = BX
L_4926: BX = &H1A
L_4929: FAC! = INT(FAC!)  ' RT3D_03
L_492C: SI = AX
L_492E: BX = DI
L_4930: DI = &HC6B0
L_4933: T_03! = FAC!  ' RT3F_71; inline=&H83
L_4937: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_493A: DI = DX
L_493C: FAC! = FAC! * N(DI)  ' RT3F_91
L_493F: DI = CX
L_4941: FAC! = FAC! / N(DI)  ' RT3F_89
L_4944: DI = BX
L_4946: FAC! = FAC! + N(DI)  ' RT3F_81
L_4949: BX = &H1A
L_494C: FAC! = INT(FAC!)  ' RT3D_03
L_494F: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_4953: BX = 0
L_4956: IF CompareLeft! <> CompareRight! THEN GOTO L_4959  ' flags from L_494F
L_4958: BX = BX - 1
L_4959: DI = &H804E
L_495C: SI = &HBAEC
L_495F: CompareLeft! = N_BAEC!: CompareRight! = N_804E!  ' RT3F_9F
L_4962: DX = 0
L_4965: IF CompareLeft! <> CompareRight! THEN GOTO L_4968  ' flags from L_495F
L_4967: DX = DX - 1
L_4968: DX = DX OR BX
L_496A: CompareLeft% = DX: CompareRight% = 0
L_496C: IF CompareLeft% = CompareRight% THEN GOTO L_4971  ' flags from L_496A
L_496E: GOTO L_4D8D
L_4971: DI = &HCEE6
L_4974: SI = &HCEEE
L_4977: N_CEE6! = N_CEEE!  ' RT3F_7B
L_497A: DI = &HCEEA
L_497D: SI = &HBA94
L_4980: N_CEEA! = N_BA94!  ' RT3F_7B
L_4983: SI = &HC634
L_4986: BX = CINT(N_C634!)  ' RT3F_75
L_4989: SI = BX
L_498B: SI = SI * (2 ^ 1)
L_498D: SI = SI * (2 ^ 1)
L_498F: BX = SI
L_4991: SI = SI + &HC518
L_4995: DI = &HCEF2
L_4998: N_CEF2! = N(SI)  ' RT3F_7B
L_499B: DX = BX
L_499D: BX = BX + &HC53C
L_49A1: SI = BX
L_49A3: DI = &HCEF6
L_49A6: N_CEF6! = N(SI)  ' RT3F_7B
L_49A9: DX = DX + &HC5D4
L_49AD: DI = DX
L_49AF: SI = &HBA94
L_49B2: FAC! = N_BA94! - N(DI)  ' RT3F_97
L_49B5: SI = &H9412
L_49B8: FAC! = N_9412! ^ FAC!  ' RT3F_27; M ledger
L_49BB: DI = &HC6B0
L_49BE: FAC! = FAC! + N_C6B0!  ' RT3F_81
L_49C1: DI = &HCEFA
L_49C4: N_CEFA! = FAC!: SI = &H001A  ' RT3F_7D
L_49C7: SI = &HBB46
L_49CA: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_49CD: GOTO L_4D16
L_49D0: GOSUB L_9B06
L_49D3: SI = &HC634
L_49D6: BX = SI
L_49D8: DX = BX
L_49DA: BX = CINT(N_C634!)  ' RT3F_75
L_49DD: DI = BX
L_49DF: DI = DI * (2 ^ 1)
L_49E1: DI = DI * (2 ^ 1)
L_49E3: BX = DI
L_49E5: DI = DI + &HC518
L_49E9: SI = &HCEFE
L_49EC: CX = BX
L_49EE: BX = CINT(N_CEFE!)  ' RT3F_75
L_49F1: SI = BX
L_49F3: SI = SI * (2 ^ 1)
L_49F5: SI = SI * (2 ^ 1)
L_49F7: BX = SI
L_49F9: SI = SI + &HC792
L_49FD: AX = DI
L_49FF: DI = &HCEF2
L_4A02: FAC! = N(SI) + N_CEF2!  ' RT3F_7F
L_4A05: DI = AX
L_4A07: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4A0A: AX = CX
L_4A0C: CX = CX + &HC53C
L_4A10: DI = CX
L_4A12: WORD(BP - &HC) = BX
L_4A15: BX = BX + &HC7A6
L_4A19: SI = BX
L_4A1B: DI = &HCEF6
L_4A1E: FAC! = N(SI) + N_CEF6!  ' RT3F_7F
L_4A21: DI = CX
L_4A23: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4A26: SI = DX
L_4A28: DI = &HC702
L_4A2B: N_C702! = N(SI)  ' RT3F_7B
L_4A2E: DI = &HC706
L_4A31: SI = &HC0F4
L_4A34: N_C706! = N_C0F4!  ' RT3F_7B
L_4A37: WORD(BP - &HE) = AX
L_4A3A: GOSUB L_179F
L_4A3D: DI = &HCF02
L_4A40: N_CF02! = FAC!: SI = &H001A  ' RT3F_7D
L_4A43: SI = WORD(BP - &HE)
L_4A46: SI = SI + &HC5D4
L_4A4A: BX = DI
L_4A4C: DI = &HBA94
L_4A4F: CompareLeft! = N(SI): CompareRight! = N_BA94!  ' RT3F_9F
L_4A52: IF CompareLeft! < CompareRight! THEN GOTO L_4A57  ' flags from L_4A4F
L_4A54: GOTO L_4A79
L_4A57: DI = WORD(BP - &HC)
L_4A5A: DI = DI + &HC570
L_4A5E: SI = BX
L_4A60: DX = DI
L_4A62: DI = &HCEFA
L_4A65: FAC! = N(SI) - N_CEFA!  ' RT3F_97
L_4A68: DI = &H9412
L_4A6B: FAC! = FAC! ^ N_9412!  ' RT3F_25; M ledger
L_4A6E: DI = &HBAF4
L_4A71: FAC! = FAC! * N_BAF4!  ' RT3F_91
L_4A74: DI = DX
L_4A76: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4A79: SI = &HC634
L_4A7C: BX = SI
L_4A7E: DX = BX
L_4A80: BX = CINT(N_C634!)  ' RT3F_75
L_4A83: SI = BX
L_4A85: SI = SI * (2 ^ 1)
L_4A87: SI = SI * (2 ^ 1)
L_4A89: SI = SI + &HC5D4
L_4A8D: DI = &HBA94
L_4A90: CompareLeft! = N(SI): CompareRight! = N_BA94!  ' RT3F_9F
L_4A93: IF CompareLeft! = CompareRight! THEN GOTO L_4A98  ' flags from L_4A90
L_4A95: GOTO L_4ACA
L_4A98: SI = &HCEFE
L_4A9B: BX = CINT(N_CEFE!)  ' RT3F_75
L_4A9E: DI = BX
L_4AA0: DI = DI * (2 ^ 1)
L_4AA2: DI = DI * (2 ^ 1)
L_4AA4: DI = DI + &HC570
L_4AA8: BX = DI
L_4AAA: DI = &HC702
L_4AAD: SI = &HC10C
L_4AB0: N_C702! = N_C10C!  ' RT3F_7B
L_4AB3: SI = DX
L_4AB5: DI = &HC706
L_4AB8: N_C706! = N(SI)  ' RT3F_7B
L_4ABB: WORD(BP - &HC) = BX
L_4ABE: GOSUB L_179F
L_4AC1: DI = WORD(BP - &HC)
L_4AC4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4AC7: GOTO L_4B5C
L_4ACA: SI = &HC634
L_4ACD: BX = SI
L_4ACF: DX = BX
L_4AD1: BX = CINT(N_C634!)  ' RT3F_75
L_4AD4: SI = BX
L_4AD6: SI = SI * (2 ^ 1)
L_4AD8: SI = SI * (2 ^ 1)
L_4ADA: SI = SI + &HC5D4
L_4ADE: DI = &HC0F4
L_4AE1: CompareLeft! = N(SI): CompareRight! = N_C0F4!  ' RT3F_9F
L_4AE4: IF CompareLeft! = CompareRight! THEN GOTO L_4AE9  ' flags from L_4AE1
L_4AE6: GOTO L_4B5C
L_4AE9: DI = &HBAF4
L_4AEC: SI = &HBAF0
L_4AEF: CompareLeft! = N_BAF0!: CompareRight! = N_BAF4!  ' RT3F_9F
L_4AF2: IF CompareLeft! > CompareRight! THEN GOTO L_4AF7  ' flags from L_4AEF
L_4AF4: GOTO L_4B29
L_4AF7: SI = &HCEFE
L_4AFA: BX = CINT(N_CEFE!)  ' RT3F_75
L_4AFD: DI = BX
L_4AFF: DI = DI * (2 ^ 1)
L_4B01: DI = DI * (2 ^ 1)
L_4B03: DI = DI + &HC570
L_4B07: BX = DI
L_4B09: DI = &HC702
L_4B0C: SI = &HC194
L_4B0F: N_C702! = N_C194!  ' RT3F_7B
L_4B12: SI = DX
L_4B14: DI = &HC706
L_4B17: N_C706! = N(SI)  ' RT3F_7B
L_4B1A: WORD(BP - &HC) = BX
L_4B1D: GOSUB L_179F
L_4B20: DI = WORD(BP - &HC)
L_4B23: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4B26: GOTO L_4B5C
L_4B29: SI = &HCEFE
L_4B2C: BX = CINT(N_CEFE!)  ' RT3F_75
L_4B2F: DI = BX
L_4B31: DI = DI * (2 ^ 1)
L_4B33: DI = DI * (2 ^ 1)
L_4B35: DI = DI + &HC570
L_4B39: BX = DI
L_4B3B: DI = &HC702
L_4B3E: SI = &HC17C
L_4B41: N_C702! = N_C17C!  ' RT3F_7B
L_4B44: DI = &HC706
L_4B47: SI = &HC634
L_4B4A: N_C706! = N_C634!  ' RT3F_7B
L_4B4D: WORD(BP - &HC) = BX
L_4B50: GOSUB L_179F
L_4B53: FAC! = -FAC!  ' RT3F_B1
L_4B56: DI = WORD(BP - &HC)
L_4B59: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4B5C: DI = &HC72A
L_4B5F: SI = &HC634
L_4B62: N_C72A! = N_C634!  ' RT3F_7B
L_4B65: GOSUB L_1932
L_4B68: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_4B6B: IF CompareLeft! = CompareRight! THEN GOTO L_4B70  ' flags from L_4B68
L_4B6D: GOTO L_4B8D
L_4B70: SI = &HCEFE
L_4B73: BX = CINT(N_CEFE!)  ' RT3F_75
L_4B76: DI = BX
L_4B78: DI = DI * (2 ^ 1)
L_4B7A: DI = DI * (2 ^ 1)
L_4B7C: DI = DI + &HC570
L_4B80: SI = DI
L_4B82: DI = &HCEEE
L_4B85: FAC! = N(SI) + N_CEEE!  ' RT3F_7F
L_4B88: DI = SI
L_4B8A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4B8D: SI = &HC634
L_4B90: BX = SI
L_4B92: DX = BX
L_4B94: BX = CINT(N_C634!)  ' RT3F_75
L_4B97: SI = BX
L_4B99: SI = SI * (2 ^ 1)
L_4B9B: SI = SI * (2 ^ 1)
L_4B9D: SI = SI + &HC5D4
L_4BA1: DI = &HC0F4
L_4BA4: CompareLeft! = N(SI): CompareRight! = N_C0F4!  ' RT3F_9F
L_4BA7: BX = 0
L_4BAA: IF CompareLeft! = CompareRight! THEN GOTO L_4BAD  ' flags from L_4BA4
L_4BAC: BX = BX - 1
L_4BAD: SI = DX
L_4BAF: DI = &HC722
L_4BB2: N_C722! = N(SI)  ' RT3F_7B
L_4BB5: WORD(BP - &HC) = BX
L_4BB8: GOSUB L_18D5
L_4BBB: DI = &H804E
L_4BBE: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_4BC1: BX = 0
L_4BC4: IF CompareLeft! <> CompareRight! THEN GOTO L_4BC7  ' flags from L_4BBE
L_4BC6: BX = BX - 1
L_4BC7: BX = BX AND WORD(BP - &HC)
L_4BCA: CompareLeft% = BX: CompareRight% = 0
L_4BCC: IF CompareLeft% <> CompareRight% THEN GOTO L_4BD1  ' flags from L_4BCA
L_4BCE: GOTO L_4BEE
L_4BD1: SI = &HCEFE
L_4BD4: BX = CINT(N_CEFE!)  ' RT3F_75
L_4BD7: DI = BX
L_4BD9: DI = DI * (2 ^ 1)
L_4BDB: DI = DI * (2 ^ 1)
L_4BDD: DI = DI + &HC570
L_4BE1: SI = DI
L_4BE3: DI = &HCEEE
L_4BE6: FAC! = N(SI) + N_CEEE!  ' RT3F_7F
L_4BE9: DI = SI
L_4BEB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4BEE: DI = &HC6B0
L_4BF1: SI = &HC63C
L_4BF4: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_4BF7: DI = &HCF06
L_4BFA: N_CF06! = FAC!: SI = &H001A  ' RT3F_7D
L_4BFD: SI = &HC6B4
L_4C00: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_4C03: GOTO L_4CA5
L_4C06: DI = &HC634
L_4C09: SI = &HCF0A
L_4C0C: CompareLeft! = N_CF0A!: CompareRight! = N_C634!  ' RT3F_9F
L_4C0F: IF CompareLeft! <> CompareRight! THEN GOTO L_4C14  ' flags from L_4C0C
L_4C11: GOTO L_4C9C
L_4C14: DI = &HC702
L_4C17: SI = &HCF0A
L_4C1A: N_C702! = N_CF0A!  ' RT3F_7B
L_4C1D: DI = &HC706
L_4C20: SI = &HC634
L_4C23: N_C706! = N_C634!  ' RT3F_7B
L_4C26: GOSUB L_179F
L_4C29: DI = &HCF0E
L_4C2C: N_CF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_4C2F: SI = &HC634
L_4C32: BX = CINT(N_C634!)  ' RT3F_75
L_4C35: SI = BX
L_4C37: SI = SI * (2 ^ 1)
L_4C39: SI = SI * (2 ^ 1)
L_4C3B: SI = SI + &HC5D4
L_4C3F: BX = DI
L_4C41: DI = &HBB56
L_4C44: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_4C47: IF CompareLeft! < CompareRight! THEN GOTO L_4C4C  ' flags from L_4C44
L_4C49: GOTO L_4C71
L_4C4C: SI = &HCEFE
L_4C4F: DX = BX
L_4C51: BX = CINT(N_CEFE!)  ' RT3F_75
L_4C54: SI = BX
L_4C56: SI = SI * (2 ^ 1)
L_4C58: SI = SI * (2 ^ 1)
L_4C5A: SI = SI + &HC570
L_4C5E: SWAP SI, DI
L_4C60: SWAP SI, DI
L_4C62: SWAP DX, SI
L_4C64: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_4C67: SI = DX
L_4C69: FAC! = N(SI) - FAC!  ' RT3F_9B
L_4C6C: DI = DX
L_4C6E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4C71: DI = &HCF12
L_4C74: SI = &HCF0E
L_4C77: CompareLeft! = N_CF0E!: CompareRight! = N_CF12!  ' RT3F_9F
L_4C7A: IF CompareLeft! < CompareRight! THEN GOTO L_4C7F  ' flags from L_4C77
L_4C7C: GOTO L_4C9C
L_4C7F: SI = &HCEFE
L_4C82: BX = CINT(N_CEFE!)  ' RT3F_75
L_4C85: DI = BX
L_4C87: DI = DI * (2 ^ 1)
L_4C89: DI = DI * (2 ^ 1)
L_4C8B: DI = DI + &HC570
L_4C8F: SI = DI
L_4C91: DI = &HCEEE
L_4C94: FAC! = N(SI) + N_CEEE!  ' RT3F_7F
L_4C97: DI = SI
L_4C99: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4C9C: DI = &H804E
L_4C9F: SI = &HCF0A
L_4CA2: FAC! = N_CF0A! + N_804E!  ' RT3F_7F
L_4CA5: DI = &HCF0A
L_4CA8: N_CF0A! = FAC!: SI = &H001A  ' RT3F_7D
L_4CAB: SI = DI
L_4CAD: DI = &HCF06
L_4CB0: CompareLeft! = N_CF0A!: CompareRight! = N_CF06!  ' RT3F_9F
L_4CB3: IF CompareLeft! > CompareRight! THEN GOTO L_4CB8  ' flags from L_4CB0
L_4CB5: GOTO L_4C06
L_4CB8: DI = &HCF12
L_4CBB: SI = &HCF02
L_4CBE: CompareLeft! = N_CF02!: CompareRight! = N_CF12!  ' RT3F_9F
L_4CC1: IF CompareLeft! < CompareRight! THEN GOTO L_4CC6  ' flags from L_4CBE
L_4CC3: GOTO L_4CE3
L_4CC6: SI = &HCEFE
L_4CC9: BX = CINT(N_CEFE!)  ' RT3F_75
L_4CCC: DI = BX
L_4CCE: DI = DI * (2 ^ 1)
L_4CD0: DI = DI * (2 ^ 1)
L_4CD2: DI = DI + &HC570
L_4CD6: SI = DI
L_4CD8: DI = &HCEEE
L_4CDB: FAC! = N(SI) + N_CEEE!  ' RT3F_7F
L_4CDE: DI = SI
L_4CE0: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4CE3: SI = &HCEFE
L_4CE6: BX = SI
L_4CE8: DX = BX
L_4CEA: BX = CINT(N_CEFE!)  ' RT3F_75
L_4CED: SI = BX
L_4CEF: SI = SI * (2 ^ 1)
L_4CF1: SI = SI * (2 ^ 1)
L_4CF3: SI = SI + &HC570
L_4CF7: DI = &HCEE6
L_4CFA: CompareLeft! = N(SI): CompareRight! = N_CEE6!  ' RT3F_9F
L_4CFD: IF CompareLeft! < CompareRight! THEN GOTO L_4D02  ' flags from L_4CFA
L_4CFF: GOTO L_4D0D

```

### Movement and weapon selection

```basic
L_4D02: N(DI) = N(SI)  ' RT3F_7B
L_4D05: SI = DX
L_4D07: DI = &HCEEA
L_4D0A: N_CEEA! = N(SI)  ' RT3F_7B
L_4D0D: DI = &H804E
L_4D10: SI = &HCEFE
L_4D13: FAC! = N_CEFE! + N_804E!  ' RT3F_7F
L_4D16: DI = &HCEFE
L_4D19: N_CEFE! = FAC!: SI = &H001A  ' RT3F_7D
L_4D1C: SI = DI
L_4D1E: DI = &HBA94
L_4D21: CompareLeft! = N_CEFE!: CompareRight! = N_BA94!  ' RT3F_9F
L_4D24: IF CompareLeft! > CompareRight! THEN GOTO L_4D29  ' flags from L_4D21
L_4D26: GOTO L_49D0
L_4D29: DI = &HBA94
L_4D2C: SI = &HCEEA
L_4D2F: CompareLeft! = N_CEEA!: CompareRight! = N_BA94!  ' RT3F_9F
L_4D32: IF CompareLeft! <> CompareRight! THEN GOTO L_4D37  ' flags from L_4D2F
L_4D34: GOTO L_4D8D
L_4D37: DI = &HCE7C
L_4D3A: BX = SI
L_4D3C: SI = &H804E
L_4D3F: N_CE7C! = N_804E!  ' RT3F_7B
L_4D42: SI = &HC634
L_4D45: DX = BX
L_4D47: BX = CINT(N_C634!)  ' RT3F_75
L_4D4A: DI = BX
L_4D4C: DI = DI * (2 ^ 1)
L_4D4E: DI = DI * (2 ^ 1)
L_4D50: BX = DI
L_4D52: DI = DI + &HC518
L_4D56: SI = DX
L_4D58: CX = BX
L_4D5A: BX = CINT(N(SI))  ' RT3F_75
L_4D5D: SI = BX
L_4D5F: SI = SI * (2 ^ 1)
L_4D61: SI = SI * (2 ^ 1)
L_4D63: BX = SI
L_4D65: SI = SI + &HC792
L_4D69: DX = DI
L_4D6B: DI = &HCEF2
L_4D6E: FAC! = N(SI) + N_CEF2!  ' RT3F_7F
L_4D71: DI = DX
L_4D73: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4D76: CX = CX + &HC53C
L_4D7A: DI = CX
L_4D7C: BX = BX + &HC7A6
L_4D80: SI = BX
L_4D82: DI = &HCEF6
L_4D85: FAC! = N(SI) + N_CEF6!  ' RT3F_7F
L_4D88: DI = CX
L_4D8A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4D8D: DI = &H804E
L_4D90: SI = &HC634
L_4D93: FAC! = N_C634! + N_804E!  ' RT3F_7F
L_4D96: DI = &HC634
L_4D99: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_4D9C: SI = DI
L_4D9E: DI = &HCEE2
L_4DA1: CompareLeft! = N_C634!: CompareRight! = N_CEE2!  ' RT3F_9F
L_4DA4: IF CompareLeft! > CompareRight! THEN GOTO L_4DA9  ' flags from L_4DA1
L_4DA6: GOTO L_48DE
L_4DA9: SI = &HCE7C
L_4DAC: CompareLeft! = N_CE7C!: CompareRight! = 0  ' RT3F_A7
L_4DAF: IF CompareLeft! > CompareRight! THEN GOTO L_4DB4  ' flags from L_4DAC
L_4DB1: GOTO L_4DB7
L_4DB4: GOSUB L_4E3D
L_4DB7: GOSUB L_3D68
L_4DBA: SI = &HCB06
L_4DBD: CompareLeft! = N_CB06!: CompareRight! = 0  ' RT3F_A7
L_4DC0: IF CompareLeft! = CompareRight! THEN GOTO L_4DC5  ' flags from L_4DBD
L_4DC2: GOTO L_4DCE
L_4DC5: DI = &HCE9A
L_4DC8: SI = &HC1D4
L_4DCB: N_CE9A! = N_C1D4!  ' RT3F_7B
L_4DCE: DI = &H804E
L_4DD1: SI = &HCE9A
L_4DD4: FAC! = N_CE9A! + N_804E!  ' RT3F_7F
L_4DD7: DI = &HCE9A
L_4DDA: N_CE9A! = FAC!: SI = &H001A  ' RT3F_7D
L_4DDD: SI = DI
L_4DDF: DI = &HC10C
L_4DE2: CompareLeft! = N_CE9A!: CompareRight! = N_C10C!  ' RT3F_9F
L_4DE5: IF CompareLeft! > CompareRight! THEN GOTO L_4DEA  ' flags from L_4DE2
L_4DE7: GOTO L_46D4
L_4DEA: DI = &HC1B8
L_4DED: SI = &HCE9A
L_4DF0: CompareLeft! = N_CE9A!: CompareRight! = N_C1B8!  ' RT3F_9F
L_4DF3: IF CompareLeft! >= CompareRight! THEN GOTO L_4DF8  ' flags from L_4DF0
L_4DF5: GOTO L_54C1
L_4DF8: DI = &HC722
L_4DFB: SI = &HC0F4
L_4DFE: N_C722! = N_C0F4!  ' RT3F_7B
L_4E01: GOSUB L_18D5
L_4E04: BX = BASIC_BOOL(FAC! <> 0)  ' RT3F_1F
L_4E07: CompareLeft% = BX: CompareRight% = 0
L_4E09: IF CompareLeft% = CompareRight% THEN GOTO L_4E0E  ' flags from L_4E07
L_4E0B: GOTO L_410E
L_4E0E: DI = &HC93E
L_4E11: SI = &H804E
L_4E14: N_C93E! = N_804E!  ' RT3F_7B
L_4E17: GOSUB L_3D02
L_4E1A: FAC! = RND  ' RT3D_34
L_4E1D: DI = &HCD02
L_4E20: FAC! = FAC! * N_CD02!  ' RT3F_91
L_4E23: BX = &H1A
L_4E26: FAC! = INT(FAC!)  ' RT3D_03
L_4E29: DI = &HCA06
L_4E2C: N_CA06! = FAC!: SI = &H001A  ' RT3F_7D
L_4E2F: SI = DI
L_4E31: DI = &HCB02
L_4E34: N_CB02! = N_CA06!  ' RT3F_7B
L_4E37: GOSUB L_299B
L_4E3A: GOTO L_410E
L_4E3D: BX = &HC8
L_4E40: DX = &H20
L_4E43: CX = 0
L_4E45: AX = CX
L_4E47: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4E4A: BX = &H8030
L_4E4D: DX = &HFF03
L_4E50: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4E53: DI = &HCF16
L_4E56: SI = &HC6B0
L_4E59: N_CF16! = N_C6B0!  ' RT3F_7B
L_4E5C: DI = SI
L_4E5E: SI = &HC63C
L_4E61: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_4E64: GOTO L_4E83
L_4E67: ' Alignment NOP
L_4E68: DI = &HC6E0
L_4E6B: SI = &HBA90
L_4E6E: FAC! = N_BA90! + N_C6E0!  ' RT3F_7F
L_4E71: DI = &HCCFE
L_4E74: N_CCFE! = FAC!: SI = &H001A  ' RT3F_7D
L_4E77: GOSUB L_4EF7
L_4E7A: DI = &HCF16
L_4E7D: SI = &HBA90
L_4E80: FAC! = N_BA90! + N_CF16!  ' RT3F_7F
L_4E83: DI = &HBA90
L_4E86: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_4E89: SI = &HCF16
L_4E8C: CompareLeft! = N_CF16!: CompareRight! = 0  ' RT3F_A7
L_4E8F: IF CompareLeft! < CompareRight! THEN GOTO L_4E94  ' flags from L_4E8C
L_4E91: GOTO L_4E9E
L_4E94: SI = DI
L_4E96: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4E99: IF CompareLeft! >= CompareRight! THEN GOTO L_4E68  ' flags from L_4E96
L_4E9B: GOTO L_4EA6
L_4E9E: SI = &HBA90
L_4EA1: CompareLeft! = N_BA90!: CompareRight! = 0  ' RT3F_A7
L_4EA4: IF CompareLeft! <= CompareRight! THEN GOTO L_4E68  ' flags from L_4EA1
L_4EA6: SI = &HC550
L_4EA9: FAC! = N_C550! * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_4EAD: DI = &HCF1A
L_4EB0: FAC! = FAC! + N_CF1A!  ' RT3F_81
L_4EB3: SI = &HC52C
L_4EB6: T_03! = FAC!  ' RT3F_71; inline=&H83
L_4EBA: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_4EBE: FAC! = FAC! + N(DI)  ' RT3F_81
L_4EC1: CX = &HFFFF
L_4EC4: AX = CX
L_4EC6: BX = &H1A
L_4EC9: DX = &HBEA0
L_4ECC: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_4ECF: BX = &HBA58
L_4ED2: DX = 3
L_4ED5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_4ED8: BX = &HC0
L_4EDB: DX = &H18
L_4EDE: CX = 0
L_4EE0: AX = CX
L_4EE2: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_4EE5: BX = &H13F
L_4EE8: DX = &H97
L_4EEB: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_4EEE: DX = AX
L_4EF0: BX = &H803A
L_4EF3: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_4EF6: RETURN
L_4EF7: DI = &HC722
L_4EFA: SI = &HBA90
L_4EFD: N_C722! = N_BA90!  ' RT3F_7B
L_4F00: GOSUB L_18D5
L_4F03: BX = BASIC_BOOL(FAC! <> 0)  ' RT3F_1F
L_4F06: CompareLeft% = BX: CompareRight% = 0
L_4F08: IF CompareLeft% <> CompareRight% THEN GOTO L_4F0D  ' flags from L_4F06
L_4F0A: GOTO L_4F0E
L_4F0D: RETURN
L_4F0E: SI = &HBA90
L_4F11: BX = CINT(N_BA90!)  ' RT3F_75
L_4F14: SI = BX
L_4F16: SI = SI * (2 ^ 1)
L_4F18: SI = SI * (2 ^ 1)
L_4F1A: BX = SI
L_4F1C: SI = SI + &HC53C
L_4F20: DX = BX
L_4F22: BX = CINT(N(SI))  ' RT3F_75
L_4F25: ARGPUSH BX  ' RT3E_42
L_4F28: DX = DX + &HC518
L_4F2C: SI = DX
L_4F2E: BX = CINT(N(SI))  ' RT3F_75
L_4F31: LOCATE ARGS(), BX  ' RT3E_44
L_4F34: ' PRINT statement begins ; RT3F_BC
L_4F37: SI = &HCCFE
L_4F3A: BX = CINT(N_CCFE!)  ' RT3F_75
L_4F3D: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_4F40: PRINT S(BX);  ' RT3F_6A
L_4F43: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4F46: RETURN
L_4F47: DI = &HCEDE
L_4F4A: SI = &HC6B0
L_4F4D: N_CEDE! = N_C6B0!  ' RT3F_7B
L_4F50: GOTO L_4F74
L_4F53: DI = &HCEDA
L_4F56: SI = &HC6B0
L_4F59: N_CEDA! = N_C6B0!  ' RT3F_7B
L_4F5C: GOTO L_4F74
L_4F5F: DI = &HCEDE
L_4F62: SI = &H804E
L_4F65: N_CEDE! = N_804E!  ' RT3F_7B
L_4F68: GOTO L_4F74
L_4F6B: DI = &HCEDA
L_4F6E: SI = &H804E
L_4F71: N_CEDA! = N_804E!  ' RT3F_7B
L_4F74: DI = &HCEDA
L_4F77: SI = &HC52C
L_4F7A: FAC! = N_C52C! + N_CEDA!  ' RT3F_7F
L_4F7D: DI = SI
L_4F7F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4F82: DI = &HCEDE
L_4F85: SI = &HC550
L_4F88: FAC! = N_C550! + N_CEDE!  ' RT3F_7F
L_4F8B: DI = SI
L_4F8D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4F90: DI = &HCE7C
L_4F93: SI = &H804E
L_4F96: N_CE7C! = N_804E!  ' RT3F_7B
L_4F99: DI = &HC72A
L_4F9C: SI = &HC0F4
L_4F9F: N_C72A! = N_C0F4!  ' RT3F_7B
L_4FA2: GOSUB L_1932
L_4FA5: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_4FA8: IF CompareLeft! = CompareRight! THEN GOTO L_4FAD  ' flags from L_4FA5
L_4FAA: GOTO L_4FCB
L_4FAD: DI = &HC52C
L_4FB0: SI = &HCED2
L_4FB3: N_C52C! = N_CED2!  ' RT3F_7B
L_4FB6: DI = &HC550
L_4FB9: SI = &HCED6
L_4FBC: N_C550! = N_CED6!  ' RT3F_7B
L_4FBF: DI = &HCE7C
L_4FC2: SI = &HC99C
L_4FC5: N_CE7C! = N_C99C!  ' RT3F_7B
L_4FC8: BEEP  ' RT3E_2B
L_4FCB: RETURN
L_4FCC: GOSUB L_2EFC
L_4FCF: BX = &H16
L_4FD2: ARGPUSH BX  ' RT3E_42
L_4FD5: BX = 2
L_4FD8: LOCATE ARGS(), BX  ' RT3E_44
L_4FDB: BX = &HCF1E
L_4FDE: DX = &HCA2A
L_4FE1: S_CA2A$ = S_CF1E$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_4FE4: GOSUB L_2BBC
L_4FE7: SI = &HC762
L_4FEA: CompareLeft! = N_C762!: CompareRight! = 0  ' RT3F_A7
L_4FED: IF CompareLeft! = CompareRight! THEN GOTO L_4FF2  ' flags from L_4FEA
L_4FEF: GOTO L_4FF3
L_4FF2: RETURN
L_4FF3: SI = &HCF3A
L_4FF6: FAC! = N_CF3A!: DI = &H001E  ' RT3F_6F
L_4FF9: GOTO L_501E
L_4FFC: SI = &HBA90
L_4FFF: BX = SI
L_5001: DX = BX
L_5003: BX = CINT(N_BA90!)  ' RT3F_75
L_5006: DI = BX
L_5008: DI = DI * (2 ^ 1)
L_500A: DI = DI * (2 ^ 1)
L_500C: DI = DI + &H1850
L_5010: SI = &HCF3E
L_5013: N(DI) = N_CF3E!  ' RT3F_7B
L_5016: SI = DX
L_5018: DI = &H804E
L_501B: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_501E: DI = &HBA90
L_5021: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_5024: SI = DI
L_5026: DI = &HCF42
L_5029: CompareLeft! = N_BA90!: CompareRight! = N_CF42!  ' RT3F_9F
L_502C: IF CompareLeft! <= CompareRight! THEN GOTO L_4FFC  ' flags from L_5029
L_502E: SI = &HC1A0
L_5031: FAC! = N_C1A0!: DI = &H001E  ' RT3F_6F
L_5034: GOTO L_50A4
L_5037: ' Alignment NOP
L_5038: DI = &H9412
L_503B: SI = &HBA90
L_503E: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_5041: BX = SI
L_5043: DX = BX
L_5045: BX = CINT(FAC!)  ' RT3F_77
L_5048: SI = BX
L_504A: SI = SI * (2 ^ 1)
L_504C: SI = SI * (2 ^ 1)
L_504E: SI = SI + &H1850
L_5052: BX = SI
L_5054: SI = &HC762
L_5057: FAC! = N_C762! + N(DI)  ' RT3F_7F
L_505A: SI = BX
L_505C: CompareLeft! = N(SI): CompareRight! = FAC!  ' RT3F_A3
L_505F: IF CompareLeft! = CompareRight! THEN GOTO L_5064  ' flags from L_505C
L_5061: GOTO L_509B
L_5064: SI = DX
L_5066: BX = CINT(N(SI))  ' RT3F_75
L_5069: SI = BX
L_506B: SI = SI * (2 ^ 1)
L_506D: SI = SI * (2 ^ 1)
L_506F: SI = SI + &H1850
L_5073: DI = &HCF46
L_5076: FAC! = N(SI) + N_CF46!  ' RT3F_7F
L_5079: DI = &HC766
L_507C: N_C766! = FAC!: SI = &H001A  ' RT3F_7D
L_507F: SI = DI
L_5081: BX = CINT(N_C766!)  ' RT3F_75
L_5084: DI = BX
L_5086: DI = DI * (2 ^ 1)
L_5088: DI = DI * (2 ^ 1)
L_508A: DI = DI + &H1850
L_508E: SI = DI
L_5090: DI = &H804E
L_5093: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_5096: DI = SI
L_5098: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_509B: DI = &HBB56
L_509E: SI = &HBA90
L_50A1: FAC! = N_BA90! + N_BB56!  ' RT3F_7F
L_50A4: DI = &HBA90
L_50A7: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_50AA: SI = DI
L_50AC: DI = &HC1A4
L_50AF: CompareLeft! = N_BA90!: CompareRight! = N_C1A4!  ' RT3F_9F
L_50B2: IF CompareLeft! <= CompareRight! THEN GOTO L_5038  ' flags from L_50AF
L_50B4: DI = &HC94A
L_50B7: SI = &HC94E
L_50BA: N_C94A! = N_C94E!  ' RT3F_7B
L_50BD: GOSUB L_2EFC
L_50C0: DI = &HC110
L_50C3: SI = &HBFA6
L_50C6: N_C110! = N_BFA6!  ' RT3F_7B
L_50C9: DI = &HC114
L_50CC: SI = &HC762
L_50CF: N_C114! = N_C762!  ' RT3F_7B
L_50D2: GOSUB L_06A9
L_50D5: DI = &HC946
L_50D8: N_C946! = FAC!: SI = &H001A  ' RT3F_7D
L_50DB: SI = DI
L_50DD: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_50E0: IF CompareLeft! > CompareRight! THEN GOTO L_50E5  ' flags from L_50DD
L_50E2: GOTO L_514F
L_50E5: DI = &HC184
L_50E8: FAC! = N(SI) * N_C184!  ' RT3F_8F
L_50EB: DI = &HC94E
L_50EE: FAC! = FAC! + N_C94E!  ' RT3F_81
L_50F1: DI = &HCF4A
L_50F4: N_CF4A! = FAC!: SI = &H001A  ' RT3F_7D
L_50F7: SI = DI
L_50F9: BX = CINT(N_CF4A!)  ' RT3F_75
L_50FC: SI = BX
L_50FE: SI = SI * (2 ^ 1)
L_5100: SI = SI * (2 ^ 1)
L_5102: SI = SI + &H1850
L_5106: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5109: BX = 0
L_510C: IF CompareLeft! <= CompareRight! THEN GOTO L_510F  ' flags from L_5106
L_510E: BX = BX - 1
L_510F: SI = DI
L_5111: DI = &HC178
L_5114: FAC! = N(SI) + N_C178!  ' RT3F_7F
L_5117: DX = SI
L_5119: CX = BX
L_511B: BX = CINT(FAC!)  ' RT3F_77
L_511E: SI = BX
L_5120: SI = SI * (2 ^ 1)
L_5122: SI = SI * (2 ^ 1)
L_5124: SI = SI + &H1850
L_5128: DI = &H9412
L_512B: BX = SI
L_512D: SI = &HC762
L_5130: FAC! = N_C762! + N_9412!  ' RT3F_7F
L_5133: SI = BX
L_5135: CompareLeft! = N(SI): CompareRight! = FAC!  ' RT3F_A3
L_5138: AX = 0
L_513B: IF CompareLeft! <> CompareRight! THEN GOTO L_513E  ' flags from L_5135
L_513D: AX = AX - 1
L_513E: AX = AX AND CX
L_5140: CompareLeft% = AX: CompareRight% = 0
L_5142: IF CompareLeft% <> CompareRight% THEN GOTO L_5147  ' flags from L_5140
L_5144: GOTO L_514F
L_5147: SI = DX
L_5149: DI = &HC94A
L_514C: N_C94A! = N(SI)  ' RT3F_7B
L_514F: BX = &H14
L_5152: ARGPUSH BX  ' RT3E_42
L_5155: BX = 2
L_5158: LOCATE ARGS(), BX  ' RT3E_44
L_515B: ' PRINT statement begins ; RT3F_BC
L_515E: SI = &HC762
L_5161: DX = BX
L_5163: BX = CINT(N_C762!)  ' RT3F_75
L_5166: BX = BX * (2 ^ 1)
L_5168: BX = BX * (2 ^ 1)
L_516A: BX = BX + &H4288
L_516E: PRINT S(BX);  ' RT3F_6A
L_5171: BX = &HCF4E
L_5174: PRINT S_CF4E$  ' RT3F_6E; H newline item, ledger correction
L_5177: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_517A: BX = &H15
L_517D: ARGPUSH BX  ' RT3E_42
L_5180: BX = DX
L_5182: LOCATE ARGS(), BX  ' RT3E_44
L_5185: GOSUB L_52FD
L_5188: BX = &H17
L_518B: ARGPUSH BX  ' RT3E_42
L_518E: BX = 2
L_5191: LOCATE ARGS(), BX  ' RT3E_44
L_5194: ' PRINT statement begins ; RT3F_BC
L_5197: BX = &HCF5C
L_519A: PRINT S_CF5C$  ' RT3F_6E; H newline item, ledger correction
L_519D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_51A0: BX = &H18
L_51A3: ARGPUSH BX  ' RT3E_42
L_51A6: DX = BX
L_51A8: BX = 2
L_51AB: LOCATE ARGS(), BX  ' RT3E_44
L_51AE: ' PRINT statement begins ; RT3F_BC
L_51B1: CX = BX
L_51B3: BX = &H26
L_51B6: PRINT SPC(BX);  ' RT3F_35; M ledger
L_51B9: BX = &H9408
L_51BC: PRINT S_9408$;  ' RT3F_6A
L_51BF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_51C2: BX = DX
L_51C4: ARGPUSH BX  ' RT3E_42
L_51C7: BX = CX
L_51C9: LOCATE ARGS(), BX  ' RT3E_44
L_51CC: GOSUB L_52FD
L_51CF: DI = &HCA62
L_51D2: SI = &HBB46
L_51D5: N_CA62! = N_BB46!  ' RT3F_7B
L_51D8: GOSUB L_2DBF
L_51DB: DI = &HCA6A
L_51DE: SI = &HCA52
L_51E1: CompareLeft! = N_CA52!: CompareRight! = N_CA6A!  ' RT3F_9F
L_51E4: IF CompareLeft! <> CompareRight! THEN GOTO L_51E9  ' flags from L_51E1
L_51E6: GOTO L_5264
L_51E9: DI = &HC184
L_51EC: SI = &HC94A
L_51EF: FAC! = N_C94A! + N_C184!  ' RT3F_7F
L_51F2: DI = SI
L_51F4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_51F7: SI = DI
L_51F9: DI = &HCF86
L_51FC: CompareLeft! = N(SI): CompareRight! = N_CF86!  ' RT3F_9F
L_51FF: IF CompareLeft! > CompareRight! THEN GOTO L_5204  ' flags from L_51FC
L_5201: GOTO L_520E
L_5204: DI = SI
L_5206: SI = &HC94E
L_5209: N(DI) = N_C94E!  ' RT3F_7B
L_520C: GOTO L_51A0
L_520E: SI = &HC94A
L_5211: BX = SI
L_5213: DX = BX
L_5215: BX = CINT(N_C94A!)  ' RT3F_75
L_5218: SI = BX
L_521A: SI = SI * (2 ^ 1)
L_521C: SI = SI * (2 ^ 1)
L_521E: SI = SI + &H1850
L_5222: DI = &H804E
L_5225: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_5228: BX = 0
L_522B: IF CompareLeft! >= CompareRight! THEN GOTO L_522E  ' flags from L_5225
L_522D: BX = BX - 1
L_522E: SI = DX
L_5230: DI = &HC178
L_5233: FAC! = N(SI) + N_C178!  ' RT3F_7F
L_5236: DX = BX
L_5238: BX = CINT(FAC!)  ' RT3F_77
L_523B: SI = BX
L_523D: SI = SI * (2 ^ 1)
L_523F: SI = SI * (2 ^ 1)
L_5241: SI = SI + &H1850
L_5245: DI = &H9412
L_5248: BX = SI
L_524A: SI = &HC762
L_524D: FAC! = N_C762! + N_9412!  ' RT3F_7F
L_5250: SI = BX
L_5252: CompareLeft! = N(SI): CompareRight! = FAC!  ' RT3F_A3
L_5255: CX = 0
L_5258: IF CompareLeft! = CompareRight! THEN GOTO L_525B  ' flags from L_5252
L_525A: CX = CX - 1
L_525B: CX = CX OR DX
L_525D: CompareLeft% = CX: CompareRight% = 0
L_525F: IF CompareLeft% <> CompareRight% THEN GOTO L_51E9  ' flags from L_525D
L_5261: GOTO L_51A0
L_5264: DI = &HC120
L_5267: SI = &HBFA6
L_526A: N_C120! = N_BFA6!  ' RT3F_7B
L_526D: BX = DI
L_526F: DI = &HC124
L_5272: DX = SI
L_5274: SI = &HC762
L_5277: N_C124! = N_C762!  ' RT3F_7B
L_527A: GOSUB L_06DB
L_527D: BX = CINT(FAC!)  ' RT3F_77
L_5280: DI = BX
L_5282: DI = DI * (2 ^ 1)
L_5284: DI = DI * (2 ^ 1)
L_5286: DI = DI + &H1850
L_528A: BX = DI
L_528C: DI = &HCF8A
L_528F: SI = &HC94A
L_5292: FAC! = N_C94A! + N_CF8A!  ' RT3F_7F
L_5295: DI = &HC184
L_5298: FAC! = FAC! / N_C184!  ' RT3F_89
L_529B: DX = BX
L_529D: BX = &H1A
L_52A0: FAC! = INT(FAC!)  ' RT3D_03
L_52A3: DI = DX
L_52A5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_52A8: DI = &HC110
L_52AB: SI = &HBFA6
L_52AE: N_C110! = N_BFA6!  ' RT3F_7B
L_52B1: DI = &HC114
L_52B4: SI = &HC762
L_52B7: N_C114! = N_C762!  ' RT3F_7B
L_52BA: GOSUB L_06A9
L_52BD: DI = &HC946
L_52C0: CompareLeft! = FAC!: CompareRight! = N_C946!  ' RT3F_A1
L_52C3: IF CompareLeft! <> CompareRight! THEN GOTO L_52C8  ' flags from L_52C0
L_52C5: GOTO L_52F0
L_52C8: DI = &HC120
L_52CB: SI = &HCA72
L_52CE: N_C120! = N_CA72!  ' RT3F_7B
L_52D1: DI = &HC124
L_52D4: SI = &HC762
L_52D7: N_C124! = N_C762!  ' RT3F_7B
L_52DA: GOSUB L_06DB
L_52DD: BX = CINT(FAC!)  ' RT3F_77
L_52E0: DI = BX
L_52E2: DI = DI * (2 ^ 1)
L_52E4: DI = DI * (2 ^ 1)
L_52E6: DI = DI + &H1850
L_52EA: SI = &HBB56
L_52ED: N(DI) = N_BB56!  ' RT3F_7B
L_52F0: DI = &HBA90
L_52F3: SI = &HC762
L_52F6: N_BA90! = N_C762!  ' RT3F_7B
L_52F9: GOSUB L_29EB
L_52FC: RETURN
L_52FD: DI = &HC94E
L_5300: SI = &HC94A
L_5303: CompareLeft! = N_C94A!: CompareRight! = N_C94E!  ' RT3F_9F
L_5306: IF CompareLeft! = CompareRight! THEN GOTO L_530B  ' flags from L_5303
L_5308: GOTO L_5318
L_530B: ' PRINT statement begins ; RT3F_BC
L_530E: BX = &HCF8E
L_5311: PRINT S_CF8E$;  ' RT3F_6A
L_5314: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5317: RETURN
L_5318: DI = &HBB56
L_531B: SI = &HC94A
L_531E: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_5321: BX = CINT(FAC!)  ' RT3F_77
L_5324: SI = BX
L_5326: SI = SI * (2 ^ 1)
L_5328: SI = SI * (2 ^ 1)
L_532A: SI = SI + &H1850
L_532E: DI = &HCF9E
L_5331: N_CF9E! = N(SI)  ' RT3F_7B
L_5334: SI = DI
L_5336: CompareLeft! = N_CF9E!: CompareRight! = 0  ' RT3F_A7
L_5339: IF CompareLeft! < CompareRight! THEN GOTO L_533E  ' flags from L_5336
L_533B: GOTO L_5347
L_533E: SI = &HC1DC
L_5341: N(DI) = N_C1DC!  ' RT3F_7B
L_5344: GOTO L_535A
L_5347: DI = &HC178
L_534A: SI = &HCF9E
L_534D: CompareLeft! = N_CF9E!: CompareRight! = N_C178!  ' RT3F_9F
L_5350: IF CompareLeft! > CompareRight! THEN GOTO L_5355  ' flags from L_534D
L_5352: GOTO L_535A
L_5355: SWAP DI, SI
L_5357: N(DI) = N(SI)  ' RT3F_7B
L_535A: SI = &HC94A
L_535D: BX = CINT(N_C94A!)  ' RT3F_75
L_5360: SI = BX
L_5362: SI = SI * (2 ^ 1)
L_5364: SI = SI * (2 ^ 1)
L_5366: SI = SI + &H1850
L_536A: DI = &HCF46
L_536D: FAC! = N(SI) + N_CF46!  ' RT3F_7F
L_5370: BX = CINT(FAC!)  ' RT3F_77
L_5373: SI = BX
L_5375: SI = SI * (2 ^ 1)
L_5377: SI = SI * (2 ^ 1)
L_5379: SI = SI + &H1850
L_537D: DI = &HCFA2
L_5380: N_CFA2! = N(SI)  ' RT3F_7B
L_5383: SI = DI
L_5385: DI = &HC178
L_5388: CompareLeft! = N_CFA2!: CompareRight! = N_C178!  ' RT3F_9F
L_538B: IF CompareLeft! > CompareRight! THEN GOTO L_5390  ' flags from L_5388
L_538D: GOTO L_5395
L_5390: SWAP DI, SI
L_5392: N(DI) = N(SI)  ' RT3F_7B
L_5395: ' PRINT statement begins ; RT3F_BC
L_5398: BX = &HCFA6
L_539B: PRINT S_CFA6$;  ' RT3F_6A
L_539E: DI = &HC980
L_53A1: SI = &HCF9E
L_53A4: FAC! = N_CF9E! + N_C980!  ' RT3F_7F
L_53A7: BX = CINT(FAC!)  ' RT3F_77
L_53AA: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_53AD: PRINT S(BX);  ' RT3F_6A
L_53B0: BX = &HCFAC
L_53B3: PRINT S_CFAC$;  ' RT3F_6A
L_53B6: SI = &HCFA2
L_53B9: FAC! = N_CFA2! + N(DI)  ' RT3F_7F
L_53BC: BX = CINT(FAC!)  ' RT3F_77
L_53BF: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_53C2: PRINT S(BX);  ' RT3F_6A
L_53C5: BX = &HC6C8
L_53C8: PRINT S_C6C8$;  ' RT3F_6A
L_53CB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_53CE: DI = &HBB56
L_53D1: SI = &HC94A
L_53D4: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_53D7: BX = CINT(FAC!)  ' RT3F_77
L_53DA: SI = BX
L_53DC: SI = SI * (2 ^ 1)
L_53DE: SI = SI * (2 ^ 1)
L_53E0: SI = SI + &H1850
L_53E4: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_53E7: IF CompareLeft! < CompareRight! THEN GOTO L_53EC  ' flags from L_53E4
L_53E9: GOTO L_53FB
L_53EC: ' PRINT statement begins ; RT3F_BC
L_53EF: BX = &HCFB2
L_53F2: PRINT S_CFB2$;  ' RT3F_6A
L_53F5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_53F8: GOTO L_5407
L_53FB: ' PRINT statement begins ; RT3F_BC
L_53FE: BX = &HC6C8

```

### Delay and action preparation

```basic
L_5401: PRINT S_C6C8$;  ' RT3F_6A
L_5404: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5407: ' PRINT statement begins ; RT3F_BC
L_540A: SI = &HC94A
L_540D: BX = CINT(N_C94A!)  ' RT3F_75
L_5410: SI = BX
L_5412: SI = SI * (2 ^ 1)
L_5414: SI = SI * (2 ^ 1)
L_5416: SI = SI + &H1850
L_541A: DI = &HC6B0
L_541D: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_5420: BX = CINT(FAC!)  ' RT3F_77
L_5423: BX = BX * (2 ^ 1)
L_5425: BX = BX * (2 ^ 1)
L_5427: BX = BX + &H43F4
L_542B: DX = &H1F
L_542E: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_5431: PRINT S(BX);  ' RT3F_6A
L_5434: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5437: RETURN
L_5438: GOSUB L_2EFC
L_543B: BX = &H14
L_543E: ARGPUSH BX  ' RT3E_42
L_5441: BX = 2
L_5444: LOCATE ARGS(), BX  ' RT3E_44
L_5447: ' PRINT statement begins ; RT3F_BC
L_544A: DX = BX
L_544C: BX = &HCFB8
L_544F: PRINT S_CFB8$;  ' RT3F_6A
L_5452: BX = &H19A8
L_5455: PRINT N_19A8!  ' RT3F_6B
L_5458: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_545B: BX = &H16
L_545E: ARGPUSH BX  ' RT3E_42
L_5461: BX = DX
L_5463: LOCATE ARGS(), BX  ' RT3E_44
L_5466: ' PRINT statement begins ; RT3F_BC
L_5469: BX = &HCFD0
L_546C: PRINT S_CFD0$;  ' RT3F_6A
L_546F: BX = &H19B0
L_5472: PRINT N_19B0!  ' RT3F_6B
L_5475: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5478: BX = &H18
L_547B: ARGPUSH BX  ' RT3E_42
L_547E: BX = DX
L_5480: LOCATE ARGS(), BX  ' RT3E_44
L_5483: ' PRINT statement begins ; RT3F_BC
L_5486: BX = &HCFE8
L_5489: PRINT S_CFE8$;  ' RT3F_6A
L_548C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_548F: GOSUB L_2FA6
L_5492: CompareLeft% = WORD(&HCA8E): CompareRight% = 1
L_5497: IF CompareLeft% < CompareRight% THEN GOTO L_549C  ' flags from L_5492
L_5499: GOTO L_54A2
L_549C: WORD(&HCA8E) = 1
L_54A2: CompareLeft% = WORD(&HCA8E): CompareRight% = &H270F
L_54A8: IF CompareLeft% > CompareRight% THEN GOTO L_54AD  ' flags from L_54A2
L_54AA: GOTO L_54B3
L_54AD: WORD(&HCA8E) = &H270F
L_54B3: BX = WORD(&HCA8E)
L_54B7: FAC! = CSNG(BX)  ' RT3F_57
L_54BA: DI = &H19B0
L_54BD: N_19B0! = FAC!: SI = &H001A  ' RT3F_7D
L_54C0: RETURN
L_54C1: GOSUB L_3D68
L_54C4: SI = &HCB06
L_54C7: CompareLeft! = N_CB06!: CompareRight! = 0  ' RT3F_A7
L_54CA: IF CompareLeft! <> CompareRight! THEN GOTO L_54CF  ' flags from L_54C7
L_54CC: GOTO L_410E
L_54CF: DI = &H9412
L_54D2: SI = &HBAEC
L_54D5: CompareLeft! = N_BAEC!: CompareRight! = N_9412!  ' RT3F_9F
L_54D8: IF CompareLeft! = CompareRight! THEN GOTO L_54DD  ' flags from L_54D5
L_54DA: GOTO L_552A
L_54DD: SI = &H804E
L_54E0: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_54E3: GOTO L_5517
L_54E6: DI = &HC120
L_54E9: SI = &HCA72
L_54EC: N_C120! = N_CA72!  ' RT3F_7B
L_54EF: DI = &HC124
L_54F2: SI = &HC942
L_54F5: N_C124! = N_C942!  ' RT3F_7B
L_54F8: GOSUB L_06DB
L_54FB: BX = CINT(FAC!)  ' RT3F_77
L_54FE: DI = BX
L_5500: DI = DI * (2 ^ 1)
L_5502: DI = DI * (2 ^ 1)
L_5504: DI = DI + &H1850
L_5508: SI = &HD006
L_550B: N(DI) = N_D006!  ' RT3F_7B
L_550E: DI = &H804E
L_5511: SI = &HC942
L_5514: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_5517: DI = &HC942
L_551A: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_551D: SI = DI
L_551F: DI = &HC10C
L_5522: CompareLeft! = N_C942!: CompareRight! = N_C10C!  ' RT3F_9F
L_5525: IF CompareLeft! <= CompareRight! THEN GOTO L_54E6  ' flags from L_5522
L_5527: GOTO L_6463
L_552A: SI = &H804E
L_552D: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_5530: GOTO L_644D
L_5533: ' Alignment NOP
L_5534: DI = &HC110
L_5537: SI = &HC1C0
L_553A: N_C110! = N_C1C0!  ' RT3F_7B
L_553D: BX = DI
L_553F: DI = &HC114
L_5542: SI = &HC942
L_5545: N_C114! = N_C942!  ' RT3F_7B
L_5548: GOSUB L_06A9
L_554B: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_554E: BX = 0
L_5551: IF CompareLeft! <> CompareRight! THEN GOTO L_5554  ' flags from L_554B
L_5553: BX = BX - 1
L_5554: DI = &HC110
L_5557: SI = &HCA72
L_555A: N_C110! = N_CA72!  ' RT3F_7B
L_555D: DI = &HC114
L_5560: SI = &HC942
L_5563: N_C114! = N_C942!  ' RT3F_7B
L_5566: WORD(BP - &HC) = BX
L_5569: GOSUB L_06A9
L_556C: DI = &HBB56
L_556F: CompareLeft! = FAC!: CompareRight! = N_BB56!  ' RT3F_A1
L_5572: BX = 0
L_5575: IF CompareLeft! <> CompareRight! THEN GOTO L_5578  ' flags from L_556F
L_5577: BX = BX - 1
L_5578: BX = BX OR WORD(BP - &HC)
L_557B: CompareLeft% = BX: CompareRight% = 0
L_557D: IF CompareLeft% = CompareRight% THEN GOTO L_5582  ' flags from L_557B
L_557F: GOTO L_6444
L_5582: DI = &HC120
L_5585: SI = &HC9A0
L_5588: N_C120! = N_C9A0!  ' RT3F_7B
L_558B: BX = DI
L_558D: DI = &HC124
L_5590: DX = SI
L_5592: SI = &HC942
L_5595: N_C124! = N_C942!  ' RT3F_7B
L_5598: GOSUB L_06DB
L_559B: BX = CINT(FAC!)  ' RT3F_77
L_559E: DI = BX
L_55A0: DI = DI * (2 ^ 1)
L_55A2: DI = DI * (2 ^ 1)
L_55A4: DI = DI + &H1850
L_55A8: BX = DI
L_55AA: DI = &HC120
L_55AD: SI = &HC9A0
L_55B0: N_C120! = N_C9A0!  ' RT3F_7B
L_55B3: DX = DI
L_55B5: DI = &HC124
L_55B8: CX = SI
L_55BA: SI = &HC942
L_55BD: N_C124! = N_C942!  ' RT3F_7B
L_55C0: WORD(BP - &HC) = BX
L_55C3: GOSUB L_06DB
L_55C6: BX = CINT(FAC!)  ' RT3F_77
L_55C9: SI = BX
L_55CB: SI = SI * (2 ^ 1)
L_55CD: SI = SI * (2 ^ 1)
L_55CF: SI = SI + &H1850
L_55D3: BX = SI
L_55D5: SI = &HBB4E
L_55D8: FAC! = N_BB4E! * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_55DC: SI = BX
L_55DE: FAC! = N(SI) - FAC!  ' RT3F_9B
L_55E1: DI = WORD(BP - &HC)
L_55E4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_55E7: DI = &HC120
L_55EA: SI = &HC9A0
L_55ED: N_C120! = N_C9A0!  ' RT3F_7B
L_55F0: DI = &HC124
L_55F3: SI = &HC942
L_55F6: N_C124! = N_C942!  ' RT3F_7B
L_55F9: GOSUB L_06DB
L_55FC: BX = CINT(FAC!)  ' RT3F_77
L_55FF: SI = BX
L_5601: SI = SI * (2 ^ 1)
L_5603: SI = SI * (2 ^ 1)
L_5605: SI = SI + &H1850
L_5609: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_560C: IF CompareLeft! < CompareRight! THEN GOTO L_5611  ' flags from L_5609
L_560E: GOTO L_5646
L_5611: GOSUB L_2263
L_5614: GOSUB L_2EFC
L_5617: BX = &H16
L_561A: ARGPUSH BX  ' RT3E_42
L_561D: BX = 2
L_5620: LOCATE ARGS(), BX  ' RT3E_44
L_5623: ' PRINT statement begins ; RT3F_BC
L_5626: SI = &HC942
L_5629: BX = CINT(N_C942!)  ' RT3F_75
L_562C: BX = BX * (2 ^ 1)
L_562E: BX = BX * (2 ^ 1)
L_5630: BX = BX + &H4288
L_5634: PRINT S(BX);  ' RT3F_6A
L_5637: BX = &HD00A
L_563A: PRINT S_D00A$  ' RT3F_6E; H newline item, ledger correction
L_563D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5640: GOSUB L_2C3C
L_5643: GOTO L_6444
L_5646: DI = &HC110
L_5649: SI = &HBFA6
L_564C: N_C110! = N_BFA6!  ' RT3F_7B
L_564F: DI = &HC114
L_5652: SI = &HC942
L_5655: N_C114! = N_C942!  ' RT3F_7B
L_5658: GOSUB L_06A9
L_565B: DI = &HC946
L_565E: N_C946! = FAC!: SI = &H001A  ' RT3F_7D
L_5661: SI = DI
L_5663: DI = &HC184
L_5666: FAC! = N_C946! * N_C184!  ' RT3F_8F
L_5669: DI = &HC94E
L_566C: BX = SI
L_566E: FAC! = FAC! + N_C94E!  ' RT3F_81
L_5671: DI = &HC94A
L_5674: N_C94A! = FAC!: SI = &H001A  ' RT3F_7D
L_5677: SI = BX
L_5679: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_567C: IF CompareLeft! = CompareRight! THEN GOTO L_5681  ' flags from L_5679
L_567E: GOTO L_5696
L_5681: DI = &HC70E
L_5684: SI = &HBAF4
L_5687: N_C70E! = N_BAF4!  ' RT3F_7B
L_568A: DI = &HD01A
L_568D: SI = &HC99C
L_5690: N_D01A! = N_C99C!  ' RT3F_7B
L_5693: GOTO L_56D1
L_5696: DI = &HBAF4
L_5699: SI = &HC94A
L_569C: FAC! = N_C94A! + N_BAF4!  ' RT3F_7F
L_569F: BX = SI
L_56A1: DX = BX
L_56A3: BX = CINT(FAC!)  ' RT3F_77
L_56A6: SI = BX
L_56A8: SI = SI * (2 ^ 1)
L_56AA: SI = SI * (2 ^ 1)
L_56AC: SI = SI + &H1850
L_56B0: DI = &HC70E
L_56B3: N_C70E! = N(SI)  ' RT3F_7B
L_56B6: SI = DX
L_56B8: DI = &HC10C
L_56BB: FAC! = N(SI) + N_C10C!  ' RT3F_7F
L_56BE: BX = CINT(FAC!)  ' RT3F_77
L_56C1: SI = BX
L_56C3: SI = SI * (2 ^ 1)
L_56C5: SI = SI * (2 ^ 1)
L_56C7: SI = SI + &H1850
L_56CB: DI = &HD01A
L_56CE: N_D01A! = N(SI)  ' RT3F_7B
L_56D1: DI = &HC120
L_56D4: SI = &HC970
L_56D7: N_C120! = N_C970!  ' RT3F_7B
L_56DA: DI = &HC124
L_56DD: SI = &HC942
L_56E0: N_C124! = N_C942!  ' RT3F_7B
L_56E3: GOSUB L_06DB
L_56E6: BX = CINT(FAC!)  ' RT3F_77
L_56E9: DI = BX
L_56EB: DI = DI * (2 ^ 1)
L_56ED: DI = DI * (2 ^ 1)
L_56EF: DI = DI + &H1850
L_56F3: SI = &HC998
L_56F6: N(DI) = N_C998!  ' RT3F_7B
L_56F9: GOSUB L_2EFC
L_56FC: BX = &H14
L_56FF: ARGPUSH BX  ' RT3E_42

```

### Ranges and target selection

```basic
L_5702: BX = &HA
L_5705: LOCATE ARGS(), BX  ' RT3E_44
L_5708: ' PRINT statement begins ; RT3F_BC
L_570B: SI = &HC942
L_570E: BX = SI
L_5710: DX = BX
L_5712: BX = CINT(N_C942!)  ' RT3F_75
L_5715: BX = BX * (2 ^ 1)
L_5717: BX = BX * (2 ^ 1)
L_5719: BX = BX + &H4288
L_571D: PRINT S(BX);  ' RT3F_6A
L_5720: BX = &HD034
L_5723: PRINT S_D034$;  ' RT3F_6A
L_5726: DI = &HC110
L_5729: SI = &HC9A0
L_572C: N_C110! = N_C9A0!  ' RT3F_7B
L_572F: SI = DX
L_5731: DI = &HC114
L_5734: N_C114! = N(SI)  ' RT3F_7B
L_5737: GOSUB L_06A9
L_573A: BX = &H1A
L_573D: FAC! = INT(FAC!)  ' RT3D_03
L_5740: BX = &H1A
L_5743: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_5746: BX = &HD03C
L_5749: PRINT S_D03C$  ' RT3F_6E; H newline item, ledger correction
L_574C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_574F: BX = &H15
L_5752: ARGPUSH BX  ' RT3E_42
L_5755: BX = 2
L_5758: LOCATE ARGS(), BX  ' RT3E_44
L_575B: ' PRINT statement begins ; RT3F_BC
L_575E: BX = &HD01E
L_5761: PRINT S_D01E$;  ' RT3F_6A
L_5764: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5767: DI = &HD042
L_576A: SI = &HD052
L_576D: N_D042! = N_D052!  ' RT3F_7B
L_5770: DI = &HC97C
L_5773: N_C97C! = N_D052!  ' RT3F_7B
L_5776: DI = &HD046
L_5779: N_D046! = N_D052!  ' RT3F_7B
L_577C: DI = &HD04A
L_577F: N_D04A! = N_D052!  ' RT3F_7B
L_5782: DI = &HD04E
L_5785: SI = &HC6B0
L_5788: N_D04E! = N_C6B0!  ' RT3F_7B
L_578B: DI = SI
L_578D: SI = &HC63C
L_5790: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_5793: GOTO L_58CF
L_5796: DI = &HC712
L_5799: SI = &HBA90
L_579C: N_C712! = N_BA90!  ' RT3F_7B
L_579F: GOSUB L_183B
L_57A2: DI = &H804E
L_57A5: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_57A8: BX = 0
L_57AB: IF CompareLeft! <> CompareRight! THEN GOTO L_57AE  ' flags from L_57A5
L_57AD: BX = BX - 1
L_57AE: SI = &HBA90
L_57B1: DX = SI
L_57B3: CX = BX
L_57B5: BX = CINT(N_BA90!)  ' RT3F_75
L_57B8: SI = BX
L_57BA: SI = SI * (2 ^ 1)
L_57BC: SI = SI * (2 ^ 1)
L_57BE: SI = SI + &HC560
L_57C2: BX = DI
L_57C4: DI = &H9412
L_57C7: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_57CA: AX = 0
L_57CD: IF CompareLeft! <= CompareRight! THEN GOTO L_57D0  ' flags from L_57C7
L_57CF: AX = AX - 1
L_57D0: AX = AX AND CX
L_57D2: CompareLeft% = AX: CompareRight% = 0
L_57D4: IF CompareLeft% <> CompareRight% THEN GOTO L_57D9  ' flags from L_57D2
L_57D6: GOTO L_5811
L_57D9: ' PRINT statement begins ; RT3F_BC
L_57DC: SI = DX
L_57DE: DI = &HC6E0
L_57E1: FAC! = N(SI) + N_C6E0!  ' RT3F_7F
L_57E4: CX = BX
L_57E6: BX = CINT(FAC!)  ' RT3F_77
L_57E9: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_57EC: PRINT S(BX);  ' RT3F_6A
L_57EF: BX = &HC6C8
L_57F2: PRINT S_C6C8$;  ' RT3F_6A
L_57F5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_57F8: SI = CX
L_57FA: DI = &HC97C
L_57FD: N_C97C! = N(SI)  ' RT3F_7B
L_5800: SI = DX
L_5802: DI = &HD046
L_5805: N_D046! = N(SI)  ' RT3F_7B
L_5808: DI = &HD056
L_580B: N_D056! = N(SI)  ' RT3F_7B
L_580E: GOTO L_587B
L_5811: DI = &HC70A
L_5814: SI = &HBA90
L_5817: N_C70A! = N_BA90!  ' RT3F_7B
L_581A: GOSUB L_17F8
L_581D: DI = &H804E
L_5820: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_5823: BX = 0
L_5826: IF CompareLeft! <> CompareRight! THEN GOTO L_5829  ' flags from L_5820
L_5828: BX = BX - 1
L_5829: SI = &HBA90
L_582C: DX = SI
L_582E: CX = BX
L_5830: BX = CINT(N_BA90!)  ' RT3F_75
L_5833: SI = BX
L_5835: SI = SI * (2 ^ 1)
L_5837: SI = SI * (2 ^ 1)
L_5839: SI = SI + &HC560
L_583D: BX = DI
L_583F: DI = &H9412
L_5842: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_5845: AX = 0
L_5848: IF CompareLeft! <= CompareRight! THEN GOTO L_584B  ' flags from L_5842
L_584A: AX = AX - 1
L_584B: AX = AX AND CX
L_584D: CompareLeft% = AX: CompareRight% = 0
L_584F: IF CompareLeft% <> CompareRight% THEN GOTO L_5854  ' flags from L_584D
L_5851: GOTO L_587B
L_5854: ' PRINT statement begins ; RT3F_BC
L_5857: SI = DX
L_5859: DI = &HD05A
L_585C: FAC! = N(SI) + N_D05A!  ' RT3F_7F
L_585F: DX = BX
L_5861: BX = CINT(FAC!)  ' RT3F_77
L_5864: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_5867: PRINT S(BX);  ' RT3F_6A
L_586A: BX = &HC6C8
L_586D: PRINT S_C6C8$;  ' RT3F_6A
L_5870: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5873: SI = DX
L_5875: DI = &HD042
L_5878: N_D042! = N(SI)  ' RT3F_7B
L_587B: SI = &HC97C
L_587E: CompareLeft! = N_C97C!: CompareRight! = 0  ' RT3F_A7
L_5881: BX = 0
L_5884: IF CompareLeft! <> CompareRight! THEN GOTO L_5887  ' flags from L_587E
L_5886: BX = BX - 1
L_5887: SI = &HBA90
L_588A: DX = SI
L_588C: CX = BX
L_588E: BX = CINT(N_BA90!)  ' RT3F_75
L_5891: SI = BX
L_5893: SI = SI * (2 ^ 1)
L_5895: SI = SI * (2 ^ 1)
L_5897: SI = SI + &HC560
L_589B: DI = &H9412
L_589E: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_58A1: BX = 0
L_58A4: IF CompareLeft! <= CompareRight! THEN GOTO L_58A7  ' flags from L_589E
L_58A6: BX = BX - 1
L_58A7: BX = BX AND CX
L_58A9: SI = &HC946
L_58AC: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_58AF: CX = 0
L_58B2: IF CompareLeft! <= CompareRight! THEN GOTO L_58B5  ' flags from L_58AC
L_58B4: CX = CX - 1
L_58B5: CX = CX AND BX
L_58B7: CompareLeft% = CX: CompareRight% = 0
L_58B9: IF CompareLeft% <> CompareRight% THEN GOTO L_58BE  ' flags from L_58B7
L_58BB: GOTO L_58C6
L_58BE: SI = DX
L_58C0: DI = &HD046
L_58C3: N_D046! = N(SI)  ' RT3F_7B
L_58C6: DI = &HD04E
L_58C9: SI = &HBA90
L_58CC: FAC! = N_BA90! + N_D04E!  ' RT3F_7F
L_58CF: DI = &HBA90
L_58D2: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_58D5: SI = &HD04E
L_58D8: CompareLeft! = N_D04E!: CompareRight! = 0  ' RT3F_A7
L_58DB: IF CompareLeft! < CompareRight! THEN GOTO L_58E0  ' flags from L_58D8
L_58DD: GOTO L_58ED
L_58E0: SI = DI
L_58E2: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_58E5: IF CompareLeft! < CompareRight! THEN GOTO L_58EA  ' flags from L_58E2
L_58E7: GOTO L_5796
L_58EA: GOTO L_58F8
L_58ED: SI = &HBA90
L_58F0: CompareLeft! = N_BA90!: CompareRight! = 0  ' RT3F_A7
L_58F3: IF CompareLeft! > CompareRight! THEN GOTO L_58F8  ' flags from L_58F0
L_58F5: GOTO L_5796
L_58F8: SI = &HC97C
L_58FB: CompareLeft! = N_C97C!: CompareRight! = 0  ' RT3F_A7
L_58FE: BX = 0
L_5901: IF CompareLeft! <> CompareRight! THEN GOTO L_5904  ' flags from L_58FB
L_5903: BX = BX - 1
L_5904: SI = &HD042
L_5907: CompareLeft! = N_D042!: CompareRight! = 0  ' RT3F_A7
L_590A: DX = 0
L_590D: IF CompareLeft! <> CompareRight! THEN GOTO L_5910  ' flags from L_5907
L_590F: DX = DX - 1
L_5910: DX = DX AND BX
L_5912: CompareLeft% = DX: CompareRight% = 0
L_5914: IF CompareLeft% <> CompareRight% THEN GOTO L_5919  ' flags from L_5912
L_5916: GOTO L_5925
L_5919: ' PRINT statement begins ; RT3F_BC
L_591C: BX = &HD05E
L_591F: PRINT S_D05E$  ' RT3F_6E; H newline item, ledger correction
L_5922: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5925: SI = &HC946
L_5928: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_592B: BX = 0
L_592E: IF CompareLeft! <> CompareRight! THEN GOTO L_5931  ' flags from L_5928
L_5930: BX = BX - 1
L_5931: SI = &HC97C
L_5934: CompareLeft! = N_C97C!: CompareRight! = 0  ' RT3F_A7
L_5937: DX = 0
L_593A: IF CompareLeft! <> CompareRight! THEN GOTO L_593D  ' flags from L_5934
L_593C: DX = DX - 1
L_593D: DX = DX AND BX
L_593F: CompareLeft% = DX: CompareRight% = 0
L_5941: IF CompareLeft% <> CompareRight% THEN GOTO L_5946  ' flags from L_593F
L_5943: GOTO L_5952
L_5946: DI = &HD04A
L_5949: SI = &HBB46
L_594C: N_D04A! = N_BB46!  ' RT3F_7B
L_594F: GOTO L_5BF9
L_5952: DI = &HC110
L_5955: SI = &HD066
L_5958: N_C110! = N_D066!  ' RT3F_7B
L_595B: BX = DI
L_595D: DI = &HC114
L_5960: DX = SI
L_5962: SI = &HC942
L_5965: N_C114! = N_C942!  ' RT3F_7B
L_5968: GOSUB L_06A9
L_596B: BX = CINT(FAC!)  ' RT3F_77
L_596E: SI = BX
L_5970: SI = SI * (2 ^ 1)
L_5972: SI = SI * (2 ^ 1)
L_5974: SI = SI + &HC560
L_5978: DI = &H9412
L_597B: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_597E: BX = 0
L_5981: IF CompareLeft! <= CompareRight! THEN GOTO L_5984  ' flags from L_597B
L_5983: BX = BX - 1
L_5984: DI = &HC110
L_5987: SI = &HD066
L_598A: N_C110! = N_D066!  ' RT3F_7B
L_598D: DX = DI
L_598F: DI = &HC114
L_5992: CX = SI
L_5994: SI = &HC942
L_5997: N_C114! = N_C942!  ' RT3F_7B
L_599A: WORD(BP - &HC) = BX
L_599D: GOSUB L_06A9
L_59A0: DI = &HC63C
L_59A3: CompareLeft! = FAC!: CompareRight! = N_C63C!  ' RT3F_A1
L_59A6: BX = 0
L_59A9: IF CompareLeft! >= CompareRight! THEN GOTO L_59AC  ' flags from L_59A3
L_59AB: BX = BX - 1
L_59AC: BX = BX AND WORD(BP - &HC)
L_59AF: CompareLeft% = BX: CompareRight% = 0
L_59B1: IF CompareLeft% <> CompareRight% THEN GOTO L_59B6  ' flags from L_59AF
L_59B3: GOTO L_59D1
L_59B6: DI = &HC110
L_59B9: SI = &HD066
L_59BC: N_C110! = N_D066!  ' RT3F_7B
L_59BF: DI = &HC114
L_59C2: SI = &HC942
L_59C5: N_C114! = N_C942!  ' RT3F_7B
L_59C8: GOSUB L_06A9
L_59CB: DI = &HD046
L_59CE: N_D046! = FAC!: SI = &H001A  ' RT3F_7D
L_59D1: DI = &HD06A
L_59D4: SI = &HBB46
L_59D7: N_D06A! = N_BB46!  ' RT3F_7B
L_59DA: SI = &HD046
L_59DD: BX = CINT(N_D046!)  ' RT3F_75
L_59E0: SI = BX
L_59E2: SI = SI * (2 ^ 1)
L_59E4: SI = SI * (2 ^ 1)
L_59E6: SI = SI + &HC604
L_59EA: DI = &HC6B0
L_59ED: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_59F0: DI = &HD06E
L_59F3: N_D06E! = FAC!: SI = &H001A  ' RT3F_7D
L_59F6: SI = &HC6B4
L_59F9: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_59FC: GOTO L_5A4D
L_59FF: ' Alignment NOP
L_5A00: SI = &HD046
L_5A03: BX = CINT(N_D046!)  ' RT3F_75
L_5A06: AX = BX
L_5A08: SI = 5
L_5A0B: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_5A0D: SI = AX
L_5A0F: SI = &HD072
L_5A12: BX = SI
L_5A14: DX = BX
L_5A16: BX = CINT(N_D072!)  ' RT3F_75
L_5A19: BX = BX + AX
L_5A1B: SI = BX
L_5A1D: SI = SI * (2 ^ 1)
L_5A1F: SI = SI * (2 ^ 1)
L_5A21: SI = SI + &HC2B8
L_5A25: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5A28: IF CompareLeft! > CompareRight! THEN GOTO L_5A2D  ' flags from L_5A25
L_5A2A: GOTO L_5A44
L_5A2D: DI = &HD06A
L_5A30: SI = &H804E
L_5A33: N_D06A! = N_804E!  ' RT3F_7B
L_5A36: SI = DX
L_5A38: DI = &HC9E4
L_5A3B: N_C9E4! = N(SI)  ' RT3F_7B
L_5A3E: DI = &HD076
L_5A41: N_D076! = N(SI)  ' RT3F_7B
L_5A44: DI = &H804E
L_5A47: SI = &HD072
L_5A4A: FAC! = N_D072! + N_804E!  ' RT3F_7F
L_5A4D: DI = &HD072
L_5A50: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_5A53: SI = DI
L_5A55: DI = &HD06E
L_5A58: CompareLeft! = N_D072!: CompareRight! = N_D06E!  ' RT3F_9F
L_5A5B: IF CompareLeft! <= CompareRight! THEN GOTO L_5A00  ' flags from L_5A58
L_5A5D: SI = &HD06A
L_5A60: CompareLeft! = N_D06A!: CompareRight! = 0  ' RT3F_A7
L_5A63: IF CompareLeft! = CompareRight! THEN GOTO L_5A68  ' flags from L_5A60
L_5A65: GOTO L_5A74
L_5A68: DI = &HD04A
L_5A6B: SI = &HBB46
L_5A6E: N_D04A! = N_BB46!  ' RT3F_7B
L_5A71: GOTO L_5BF9
L_5A74: SI = &HD046
L_5A77: BX = CINT(N_D046!)  ' RT3F_75
L_5A7A: AX = BX
L_5A7C: SI = 5
L_5A7F: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_5A81: SI = AX
L_5A83: DI = &HC110
L_5A86: SI = &HC1B4
L_5A89: N_C110! = N_C1B4!  ' RT3F_7B
L_5A8C: DX = DI
L_5A8E: DI = &HC114
L_5A91: CX = SI
L_5A93: SI = &HC942
L_5A96: N_C114! = N_C942!  ' RT3F_7B
L_5A99: WORD(BP - &HC) = BX
L_5A9C: WORD(BP - &HE) = AX
L_5A9F: GOSUB L_06A9
L_5AA2: BX = CINT(FAC!)  ' RT3F_77
L_5AA5: BX = BX + WORD(BP - &HE)
L_5AA8: SI = BX
L_5AAA: SI = SI * (2 ^ 1)
L_5AAC: SI = SI * (2 ^ 1)
L_5AAE: SI = SI + &HC2B8
L_5AB2: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5AB5: BX = 0
L_5AB8: IF CompareLeft! <= CompareRight! THEN GOTO L_5ABB  ' flags from L_5AB2
L_5ABA: BX = BX - 1
L_5ABB: DI = &HC110
L_5ABE: SI = &HC1B4
L_5AC1: N_C110! = N_C1B4!  ' RT3F_7B
L_5AC4: DX = DI
L_5AC6: DI = &HC114
L_5AC9: CX = SI
L_5ACB: SI = &HC942
L_5ACE: N_C114! = N_C942!  ' RT3F_7B
L_5AD1: WORD(BP - &H10) = BX
L_5AD4: GOSUB L_06A9
L_5AD7: DI = WORD(BP - &HC)
L_5ADA: DI = DI * (2 ^ 1)
L_5ADC: DI = DI * (2 ^ 1)
L_5ADE: DI = DI + &HC604
L_5AE2: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_5AE5: BX = 0
L_5AE8: IF CompareLeft! >= CompareRight! THEN GOTO L_5AEB  ' flags from L_5AE2
L_5AEA: BX = BX - 1
L_5AEB: BX = BX AND WORD(BP - &H10)
L_5AEE: CompareLeft% = BX: CompareRight% = 0
L_5AF0: IF CompareLeft% <> CompareRight% THEN GOTO L_5AF5  ' flags from L_5AEE
L_5AF2: GOTO L_5B10
L_5AF5: DI = &HC110
L_5AF8: SI = &HC1B4
L_5AFB: N_C110! = N_C1B4!  ' RT3F_7B
L_5AFE: DI = &HC114
L_5B01: SI = &HC942
L_5B04: N_C114! = N_C942!  ' RT3F_7B
L_5B07: GOSUB L_06A9
L_5B0A: DI = &HC9E4
L_5B0D: N_C9E4! = FAC!: SI = &H001A  ' RT3F_7D
L_5B10: DI = &HC110
L_5B13: SI = &HCA72
L_5B16: N_C110! = N_CA72!  ' RT3F_7B
L_5B19: BX = DI
L_5B1B: DI = &HC114
L_5B1E: DX = SI
L_5B20: SI = &HC942
L_5B23: N_C114! = N_C942!  ' RT3F_7B
L_5B26: GOSUB L_06A9
L_5B29: DI = &HBB56
L_5B2C: CompareLeft! = FAC!: CompareRight! = N_BB56!  ' RT3F_A1
L_5B2F: BX = 0
L_5B32: IF CompareLeft! <= CompareRight! THEN GOTO L_5B35  ' flags from L_5B2C
L_5B34: BX = BX - 1
L_5B35: DI = &HC110
L_5B38: SI = &HCA72
L_5B3B: N_C110! = N_CA72!  ' RT3F_7B
L_5B3E: DX = DI
L_5B40: DI = &HC114
L_5B43: CX = SI
L_5B45: SI = &HC942
L_5B48: N_C114! = N_C942!  ' RT3F_7B
L_5B4B: WORD(BP - &HC) = BX
L_5B4E: GOSUB L_06A9
L_5B51: DI = &HC194
L_5B54: CompareLeft! = FAC!: CompareRight! = N_C194!  ' RT3F_A1
L_5B57: BX = 0
L_5B5A: IF CompareLeft! >= CompareRight! THEN GOTO L_5B5D  ' flags from L_5B54
L_5B5C: BX = BX - 1
L_5B5D: BX = BX AND WORD(BP - &HC)
L_5B60: DI = &HC110
L_5B63: SI = &HD066
L_5B66: N_C110! = N_D066!  ' RT3F_7B
L_5B69: DX = DI
L_5B6B: DI = &HC114
L_5B6E: SI = &HC942
L_5B71: N_C114! = N_C942!  ' RT3F_7B
L_5B74: WORD(BP - &HE) = BX
L_5B77: GOSUB L_06A9
L_5B7A: DI = &HD046
L_5B7D: CompareLeft! = FAC!: CompareRight! = N_D046!  ' RT3F_A1
L_5B80: BX = 0
L_5B83: IF CompareLeft! <> CompareRight! THEN GOTO L_5B86  ' flags from L_5B7D
L_5B85: BX = BX - 1
L_5B86: BX = BX AND WORD(BP - &HE)
L_5B89: CompareLeft% = BX: CompareRight% = 0
L_5B8B: IF CompareLeft% <> CompareRight% THEN GOTO L_5B90  ' flags from L_5B89
L_5B8D: GOTO L_5BC7
L_5B90: DI = &HC110
L_5B93: SI = &HCA72
L_5B96: N_C110! = N_CA72!  ' RT3F_7B
L_5B99: DI = &HC114
L_5B9C: SI = &HC942
L_5B9F: N_C114! = N_C942!  ' RT3F_7B
L_5BA2: GOSUB L_06A9
L_5BA5: DI = &HD04A
L_5BA8: N_D04A! = FAC!: SI = &H001A  ' RT3F_7D
L_5BAB: SI = DI
L_5BAD: DI = &HC10C
L_5BB0: CompareLeft! = N_D04A!: CompareRight! = N_C10C!  ' RT3F_9F
L_5BB3: BX = 0
L_5BB6: IF CompareLeft! >= CompareRight! THEN GOTO L_5BB9  ' flags from L_5BB0
L_5BB8: BX = BX - 1
L_5BB9: FAC! = CSNG(BX)  ' RT3F_57
L_5BBC: FAC! = N(SI) - FAC!  ' RT3F_9B
L_5BBF: DI = SI
L_5BC1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5BC4: GOTO L_5BF9
L_5BC7: DI = &HC110
L_5BCA: SI = &HCA72
L_5BCD: N_C110! = N_CA72!  ' RT3F_7B
L_5BD0: DI = &HC114
L_5BD3: SI = &HC942
L_5BD6: N_C114! = N_C942!  ' RT3F_7B
L_5BD9: GOSUB L_06A9
L_5BDC: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_5BDF: IF CompareLeft! < CompareRight! THEN GOTO L_5BE4  ' flags from L_5BDC
L_5BE1: GOTO L_5BF0
L_5BE4: DI = &HD04A
L_5BE7: SI = &HC194
L_5BEA: N_D04A! = N_C194!  ' RT3F_7B
L_5BED: GOTO L_5BF9
L_5BF0: DI = &HD04A
L_5BF3: SI = &H804E
L_5BF6: N_D04A! = N_804E!  ' RT3F_7B
L_5BF9: DI = &HBB56
L_5BFC: SI = &HC94A
L_5BFF: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_5C02: BX = CINT(FAC!)  ' RT3F_77
L_5C05: SI = BX
L_5C07: SI = SI * (2 ^ 1)
L_5C09: SI = SI * (2 ^ 1)
L_5C0B: SI = SI + &H1850
L_5C0F: DI = &H804E
L_5C12: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_5C15: BX = 0
L_5C18: IF CompareLeft! >= CompareRight! THEN GOTO L_5C1B  ' flags from L_5C12
L_5C1A: BX = BX - 1
L_5C1B: SI = &HD04A
L_5C1E: CompareLeft! = N_D04A!: CompareRight! = 0  ' RT3F_A7
L_5C21: DX = 0
L_5C24: IF CompareLeft! <= CompareRight! THEN GOTO L_5C27  ' flags from L_5C1E
L_5C26: DX = DX - 1
L_5C27: DX = DX AND BX
L_5C29: BX = SI
L_5C2B: SI = &HC946
L_5C2E: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_5C31: CX = 0
L_5C34: IF CompareLeft! <= CompareRight! THEN GOTO L_5C37  ' flags from L_5C2E
L_5C36: CX = CX - 1
L_5C37: CX = CX AND DX
L_5C39: SI = BX
L_5C3B: DI = &HC17C
L_5C3E: CompareLeft! = N(SI): CompareRight! = N_C17C!  ' RT3F_9F
L_5C41: DX = 0
L_5C44: IF CompareLeft! >= CompareRight! THEN GOTO L_5C47  ' flags from L_5C3E
L_5C46: DX = DX - 1
L_5C47: DX = DX AND CX
L_5C49: CompareLeft% = DX: CompareRight% = 0
L_5C4B: IF CompareLeft% <> CompareRight% THEN GOTO L_5C50  ' flags from L_5C49
L_5C4D: GOTO L_5C58
L_5C50: DI = BX
L_5C52: SI = &H9412
L_5C55: N(DI) = N_9412!  ' RT3F_7B
L_5C58: SI = &HC946
L_5C5B: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_5C5E: BX = 0
L_5C61: IF CompareLeft! <= CompareRight! THEN GOTO L_5C64  ' flags from L_5C5B
L_5C63: BX = BX - 1
L_5C64: DI = &HBB56
L_5C67: SI = &HC94A
L_5C6A: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_5C6D: DX = BX
L_5C6F: BX = CINT(FAC!)  ' RT3F_77
L_5C72: SI = BX
L_5C74: SI = SI * (2 ^ 1)
L_5C76: SI = SI * (2 ^ 1)
L_5C78: SI = SI + &H1850
L_5C7C: BX = DI
L_5C7E: DI = &H804E
L_5C81: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_5C84: CX = 0
L_5C87: IF CompareLeft! >= CompareRight! THEN GOTO L_5C8A  ' flags from L_5C81
L_5C89: CX = CX - 1
L_5C8A: CX = CX AND DX
L_5C8C: SI = &HD04A
L_5C8F: CompareLeft! = N_D04A!: CompareRight! = N(DI)  ' RT3F_9F
L_5C92: DX = 0
L_5C95: IF CompareLeft! <> CompareRight! THEN GOTO L_5C98  ' flags from L_5C8F
L_5C97: DX = DX - 1
L_5C98: DI = BX
L_5C9A: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_5C9D: AX = 0
L_5CA0: IF CompareLeft! <= CompareRight! THEN GOTO L_5CA3  ' flags from L_5C9A
L_5CA2: AX = AX - 1
L_5CA3: DI = &HC17C
L_5CA6: CompareLeft! = N(SI): CompareRight! = N_C17C!  ' RT3F_9F
L_5CA9: BX = 0
L_5CAC: IF CompareLeft! >= CompareRight! THEN GOTO L_5CAF  ' flags from L_5CA6
L_5CAE: BX = BX - 1
L_5CAF: BX = BX AND AX
L_5CB1: BX = BX OR DX
L_5CB3: BX = BX AND CX
L_5CB5: CompareLeft% = BX: CompareRight% = 0
L_5CB7: IF CompareLeft% <> CompareRight% THEN GOTO L_5CBC  ' flags from L_5CB5
L_5CB9: GOTO L_5CC4
L_5CBC: DI = SI
L_5CBE: SI = &HBB46
L_5CC1: N(DI) = N_BB46!  ' RT3F_7B
L_5CC4: SI = &HD046
L_5CC7: BX = CINT(N_D046!)  ' RT3F_75
L_5CCA: SI = BX
L_5CCC: SI = SI * (2 ^ 1)
L_5CCE: SI = SI * (2 ^ 1)
L_5CD0: SI = SI + &HC560
L_5CD4: DI = &HBB56
L_5CD7: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_5CDA: IF CompareLeft! < CompareRight! THEN GOTO L_5CDF  ' flags from L_5CD7
L_5CDC: GOTO L_5CE8
L_5CDF: DI = &HD04A
L_5CE2: SI = &HC1DC
L_5CE5: N_D04A! = N_C1DC!  ' RT3F_7B
L_5CE8: SI = &HC946
L_5CEB: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_5CEE: BX = 0
L_5CF1: IF CompareLeft! <> CompareRight! THEN GOTO L_5CF4  ' flags from L_5CEB
L_5CF3: BX = BX - 1
L_5CF4: SI = &HD04A
L_5CF7: CompareLeft! = N_D04A!: CompareRight! = 0  ' RT3F_A7
L_5CFA: DX = 0
L_5CFD: IF CompareLeft! <= CompareRight! THEN GOTO L_5D00  ' flags from L_5CF7
L_5CFF: DX = DX - 1

```

### Action command selection

```basic
L_5D00: DX = DX AND BX
L_5D02: DI = &HC17C
L_5D05: CompareLeft! = N(SI): CompareRight! = N_C17C!  ' RT3F_9F
L_5D08: BX = 0
L_5D0B: IF CompareLeft! >= CompareRight! THEN GOTO L_5D0E  ' flags from L_5D05
L_5D0D: BX = BX - 1
L_5D0E: BX = BX AND DX
L_5D10: DI = &HC712
L_5D13: DX = SI
L_5D15: SI = &HD046
L_5D18: N_C712! = N_D046!  ' RT3F_7B
L_5D1B: WORD(BP - &HC) = BX
L_5D1E: GOSUB L_183B
L_5D21: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_5D24: BX = 0
L_5D27: IF CompareLeft! <> CompareRight! THEN GOTO L_5D2A  ' flags from L_5D21
L_5D29: BX = BX - 1
L_5D2A: BX = BX AND WORD(BP - &HC)
L_5D2D: CompareLeft% = BX: CompareRight% = 0
L_5D2F: IF CompareLeft% <> CompareRight% THEN GOTO L_5D34  ' flags from L_5D2D
L_5D31: GOTO L_5D64
L_5D34: DI = &HD046
L_5D37: SI = &HD056
L_5D3A: N_D046! = N_D056!  ' RT3F_7B
L_5D3D: BX = DI
L_5D3F: DI = &HC9E4
L_5D42: SI = &HD076
L_5D45: N_C9E4! = N_D076!  ' RT3F_7B
L_5D48: SI = BX
L_5D4A: DI = &HC712
L_5D4D: N_C712! = N_D046!  ' RT3F_7B
L_5D50: GOSUB L_183B
L_5D53: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_5D56: IF CompareLeft! = CompareRight! THEN GOTO L_5D5B  ' flags from L_5D53
L_5D58: GOTO L_5D64
L_5D5B: DI = &HD04A
L_5D5E: SI = &HBB46
L_5D61: N_D04A! = N_BB46!  ' RT3F_7B
L_5D64: DI = &H9412
L_5D67: SI = &HD04A
L_5D6A: CompareLeft! = N_D04A!: CompareRight! = N_9412!  ' RT3F_9F
L_5D6D: BX = 0
L_5D70: IF CompareLeft! <> CompareRight! THEN GOTO L_5D73  ' flags from L_5D6A
L_5D72: BX = BX - 1
L_5D73: DI = &HBB56
L_5D76: DX = SI
L_5D78: SI = &HC94A
L_5D7B: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_5D7E: CX = BX
L_5D80: BX = CINT(FAC!)  ' RT3F_77
L_5D83: SI = BX
L_5D85: SI = SI * (2 ^ 1)
L_5D87: SI = SI * (2 ^ 1)
L_5D89: SI = SI + &H1850
L_5D8D: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5D90: BX = 0
L_5D93: IF CompareLeft! >= CompareRight! THEN GOTO L_5D96  ' flags from L_5D8D
L_5D95: BX = BX - 1
L_5D96: BX = BX AND CX
L_5D98: CompareLeft% = BX: CompareRight% = 0
L_5D9A: IF CompareLeft% <> CompareRight% THEN GOTO L_5D9F  ' flags from L_5D98
L_5D9C: GOTO L_5DA7
L_5D9F: DI = DX
L_5DA1: SI = &HC1DC
L_5DA4: N(DI) = N_C1DC!  ' RT3F_7B
L_5DA7: BX = &H16
L_5DAA: ARGPUSH BX  ' RT3E_42
L_5DAD: BX = 2
L_5DB0: LOCATE ARGS(), BX  ' RT3E_44
L_5DB3: ' PRINT statement begins ; RT3F_BC
L_5DB6: BX = &HD07A
L_5DB9: PRINT S_D07A$;  ' RT3F_6A
L_5DBC: SI = &HD04A
L_5DBF: BX = SI
L_5DC1: DX = BX
L_5DC3: BX = CINT(N_D04A!)  ' RT3F_75
L_5DC6: BX = BX * (2 ^ 1)
L_5DC8: BX = BX * (2 ^ 1)
L_5DCA: BX = BX + &HC7BA
L_5DCE: PRINT S(BX);  ' RT3F_6A
L_5DD1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5DD4: SI = DX
L_5DD6: DI = &H9412
L_5DD9: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_5DDC: BX = 0
L_5DDF: IF CompareLeft! <> CompareRight! THEN GOTO L_5DE2  ' flags from L_5DD9
L_5DE1: BX = BX - 1
L_5DE2: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5DE5: CX = 0
L_5DE8: IF CompareLeft! <> CompareRight! THEN GOTO L_5DEB  ' flags from L_5DE2
L_5DEA: CX = CX - 1
L_5DEB: CX = CX OR BX
L_5DED: DI = &HC178
L_5DF0: CompareLeft! = N(SI): CompareRight! = N_C178!  ' RT3F_9F
L_5DF3: BX = 0
L_5DF6: IF CompareLeft! <> CompareRight! THEN GOTO L_5DF9  ' flags from L_5DF0
L_5DF8: BX = BX - 1
L_5DF9: BX = BX OR CX
L_5DFB: CompareLeft% = BX: CompareRight% = 0
L_5DFD: IF CompareLeft% = CompareRight% THEN GOTO L_5E02  ' flags from L_5DFB
L_5DFF: GOTO L_5EC1
L_5E02: DI = &HBB56
L_5E05: SI = &HD04A
L_5E08: CompareLeft! = N_D04A!: CompareRight! = N_BB56!  ' RT3F_9F
L_5E0B: BX = 0
L_5E0E: IF CompareLeft! <= CompareRight! THEN GOTO L_5E11  ' flags from L_5E08
L_5E10: BX = BX - 1
L_5E11: DI = &HC194
L_5E14: CompareLeft! = N(SI): CompareRight! = N_C194!  ' RT3F_9F
L_5E17: DX = 0
L_5E1A: IF CompareLeft! >= CompareRight! THEN GOTO L_5E1D  ' flags from L_5E14
L_5E1C: DX = DX - 1
L_5E1D: DX = DX AND BX
L_5E1F: CompareLeft% = DX: CompareRight% = 0
L_5E21: IF CompareLeft% <> CompareRight% THEN GOTO L_5E26  ' flags from L_5E1F
L_5E23: GOTO L_5E35
L_5E26: ' PRINT statement begins ; RT3F_BC
L_5E29: BX = &HD088
L_5E2C: PRINT S_D088$;  ' RT3F_6A
L_5E2F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5E32: GOTO L_5E41
L_5E35: ' PRINT statement begins ; RT3F_BC
L_5E38: BX = &HD090
L_5E3B: PRINT S_D090$;  ' RT3F_6A
L_5E3E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5E41: DI = &HC0F4
L_5E44: SI = &HD01A
L_5E47: CompareLeft! = N_D01A!: CompareRight! = N_C0F4!  ' RT3F_9F
L_5E4A: BX = 0
L_5E4D: IF CompareLeft! <= CompareRight! THEN GOTO L_5E50  ' flags from L_5E47
L_5E4F: BX = BX - 1
L_5E50: DI = &HC184
L_5E53: CompareLeft! = N(SI): CompareRight! = N_C184!  ' RT3F_9F
L_5E56: DX = 0
L_5E59: IF CompareLeft! >= CompareRight! THEN GOTO L_5E5C  ' flags from L_5E53
L_5E5B: DX = DX - 1
L_5E5C: DX = DX AND BX
L_5E5E: DI = &HC17C
L_5E61: SI = &HD04A
L_5E64: CompareLeft! = N_D04A!: CompareRight! = N_C17C!  ' RT3F_9F
L_5E67: BX = 0
L_5E6A: IF CompareLeft! >= CompareRight! THEN GOTO L_5E6D  ' flags from L_5E64
L_5E6C: BX = BX - 1
L_5E6D: BX = BX AND DX
L_5E6F: CompareLeft% = BX: CompareRight% = 0
L_5E71: IF CompareLeft% <> CompareRight% THEN GOTO L_5E76  ' flags from L_5E6F
L_5E73: GOTO L_5E97
L_5E76: ' PRINT statement begins ; RT3F_BC
L_5E79: BX = &HD098
L_5E7C: PRINT S_D098$;  ' RT3F_6A
L_5E7F: DI = &HC6E0
L_5E82: SI = &HD046
L_5E85: FAC! = N_D046! + N_C6E0!  ' RT3F_7F
L_5E88: BX = CINT(FAC!)  ' RT3F_77
L_5E8B: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_5E8E: PRINT S(BX);  ' RT3F_6A
L_5E91: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5E94: GOTO L_5EC1
L_5E97: ' PRINT statement begins ; RT3F_BC
L_5E9A: DI = &HC6E0
L_5E9D: SI = &HD046
L_5EA0: FAC! = N_D046! + N_C6E0!  ' RT3F_7F
L_5EA3: BX = CINT(FAC!)  ' RT3F_77
L_5EA6: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_5EA9: PRINT S(BX);  ' RT3F_6A
L_5EAC: DI = &HCB2E
L_5EAF: SI = &HC9E4
L_5EB2: FAC! = N_C9E4! + N_CB2E!  ' RT3F_7F
L_5EB5: BX = CINT(FAC!)  ' RT3F_77
L_5EB8: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_5EBB: PRINT S(BX);  ' RT3F_6A
L_5EBE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5EC1: ' PRINT statement begins ; RT3F_BC
L_5EC4: BX = 0
L_5EC6: BX = POS(BX)  ' RT3D_21
L_5EC9: BX = BX - &H26
L_5ECC: BX = -BX
L_5ECE: PRINT SPC(BX);  ' RT3F_35; M ledger
L_5ED1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5ED4: BX = &H17
L_5ED7: ARGPUSH BX  ' RT3E_42
L_5EDA: BX = 2
L_5EDD: LOCATE ARGS(), BX  ' RT3E_44
L_5EE0: ' PRINT statement begins ; RT3F_BC
L_5EE3: BX = &HD0A2
L_5EE6: PRINT S_D0A2$;  ' RT3F_6A
L_5EE9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5EEC: BX = &H18
L_5EEF: ARGPUSH BX  ' RT3E_42
L_5EF2: BX = 2
L_5EF5: LOCATE ARGS(), BX  ' RT3E_44
L_5EF8: ' PRINT statement begins ; RT3F_BC
L_5EFB: BX = &HD0CC
L_5EFE: PRINT S_D0CC$;  ' RT3F_6A
L_5F01: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5F04: DI = &HCA5E
L_5F07: SI = &HD0F6
L_5F0A: N_CA5E! = N_D0F6!  ' RT3F_7B
L_5F0D: DI = &HCA62
L_5F10: SI = &HC168
L_5F13: N_CA62! = N_C168!  ' RT3F_7B
L_5F16: GOSUB L_2DBF
L_5F19: DI = &HCA5A
L_5F1C: SI = &HCA52
L_5F1F: CompareLeft! = N_CA52!: CompareRight! = N_CA5A!  ' RT3F_9F
L_5F22: IF CompareLeft! = CompareRight! THEN GOTO L_5F04  ' flags from L_5F1F
L_5F24: DI = &HCA6A
L_5F27: SI = &HCA52
L_5F2A: CompareLeft! = N_CA52!: CompareRight! = N_CA6A!  ' RT3F_9F
L_5F2D: IF CompareLeft! <> CompareRight! THEN GOTO L_5F32  ' flags from L_5F2A
L_5F2F: GOTO L_62CB
L_5F32: DI = &HCE30
L_5F35: SI = &HCA52
L_5F38: CompareLeft! = N_CA52!: CompareRight! = N_CE30!  ' RT3F_9F
L_5F3B: IF CompareLeft! >= CompareRight! THEN GOTO L_5F40  ' flags from L_5F38
L_5F3D: GOTO L_6258
L_5F40: SI = &HCA52
L_5F43: CompareLeft! = N_CA52!: CompareRight! = 0  ' RT3F_A7
L_5F46: IF CompareLeft! < CompareRight! THEN GOTO L_5F04  ' flags from L_5F43
L_5F48: SI = &HCA52
L_5F4B: BX = CINT(N_CA52!)  ' RT3F_75
L_5F4E: ON BX GOSUB L_5F83, L_5F83, L_5F83, L_5F83, L_6071, L_61A6, L_5F04, L_5F04, L_5F04, L_5F04, L_5F04, L_61CB, L_61E0, L_5F04, L_5F04, L_5F04, L_5F04, L_6229, L_5F04, L_5F04, L_5F04, L_5F04, L_624E  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_5F80: GOTO L_5BF9
L_5F83: DI = &HC6B0
L_5F86: SI = &HCA52
L_5F89: FAC! = N_CA52! + N_C6B0!  ' RT3F_7F
L_5F8C: DI = &HD0FA
L_5F8F: BX = SI
L_5F91: N_D0FA! = FAC!: SI = &H001A  ' RT3F_7D
L_5F94: SI = BX
L_5F96: DX = DI
L_5F98: DI = &HC63C
L_5F9B: CompareLeft! = N(SI): CompareRight! = N_C63C!  ' RT3F_9F
L_5F9E: CX = 0
L_5FA1: IF CompareLeft! <= CompareRight! THEN GOTO L_5FA4  ' flags from L_5F9B
L_5FA3: CX = CX - 1
L_5FA4: SI = DX
L_5FA6: BX = CINT(N(SI))  ' RT3F_75
L_5FA9: SI = BX
L_5FAB: SI = SI * (2 ^ 1)
L_5FAD: SI = SI * (2 ^ 1)
L_5FAF: SI = SI + &HC560
L_5FB3: DI = &HBB56
L_5FB6: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_5FB9: BX = 0
L_5FBC: IF CompareLeft! >= CompareRight! THEN GOTO L_5FBF  ' flags from L_5FB6
L_5FBE: BX = BX - 1
L_5FBF: BX = BX OR CX
L_5FC1: CompareLeft% = BX: CompareRight% = 0
L_5FC3: IF CompareLeft% <> CompareRight% THEN GOTO L_5FC8  ' flags from L_5FC1
L_5FC5: GOTO L_5FC9
L_5FC8: RETURN
L_5FC9: SI = &HC946
L_5FCC: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_5FCF: BX = 0
L_5FD2: IF CompareLeft! <> CompareRight! THEN GOTO L_5FD5  ' flags from L_5FCC
L_5FD4: BX = BX - 1
L_5FD5: DI = &HC712
L_5FD8: SI = &HD0FA
L_5FDB: N_C712! = N_D0FA!  ' RT3F_7B
L_5FDE: WORD(BP - &HC) = BX
L_5FE1: GOSUB L_183B
L_5FE4: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_5FE7: BX = 0
L_5FEA: IF CompareLeft! <> CompareRight! THEN GOTO L_5FED  ' flags from L_5FE4
L_5FEC: BX = BX - 1
L_5FED: BX = BX AND WORD(BP - &HC)
L_5FF0: DI = &HC17C
L_5FF3: SI = &HD04A
L_5FF6: CompareLeft! = N_D04A!: CompareRight! = N_C17C!  ' RT3F_9F
L_5FF9: DX = 0
L_5FFC: IF CompareLeft! >= CompareRight! THEN GOTO L_5FFF  ' flags from L_5FF6
L_5FFE: DX = DX - 1
L_5FFF: DX = DX AND BX
L_6001: CompareLeft% = DX: CompareRight% = 0
L_6003: IF CompareLeft% <> CompareRight% THEN GOTO L_6008  ' flags from L_6001
L_6005: GOTO L_6009
L_6008: RETURN
L_6009: DI = &HD0FA
L_600C: SI = &HD046
L_600F: CompareLeft! = N_D046!: CompareRight! = N_D0FA!  ' RT3F_9F
L_6012: BX = 0
L_6015: IF CompareLeft! = CompareRight! THEN GOTO L_6018  ' flags from L_600F
L_6017: BX = BX - 1
L_6018: DI = &HBA94
L_601B: SI = &HD04A
L_601E: CompareLeft! = N_D04A!: CompareRight! = N_BA94!  ' RT3F_9F
L_6021: DX = 0
L_6024: IF CompareLeft! <= CompareRight! THEN GOTO L_6027  ' flags from L_601E
L_6026: DX = DX - 1
L_6027: DX = DX AND BX
L_6029: BX = DI
L_602B: DI = &HC194
L_602E: CompareLeft! = N(SI): CompareRight! = N_C194!  ' RT3F_9F
L_6031: CX = 0
L_6034: IF CompareLeft! >= CompareRight! THEN GOTO L_6037  ' flags from L_602E
L_6036: CX = CX - 1
L_6037: CX = CX AND DX
L_6039: CompareLeft% = CX: CompareRight% = 0
L_603B: IF CompareLeft% <> CompareRight% THEN GOTO L_6040  ' flags from L_6039
L_603D: GOTO L_6047
L_6040: DI = SI
L_6042: SWAP BX, SI
L_6044: N(DI) = N(SI)  ' RT3F_7B
L_6047: DI = &HD046
L_604A: SI = &HD0FA
L_604D: N_D046! = N_D0FA!  ' RT3F_7B
L_6050: SI = DI
L_6052: BX = CINT(N_D046!)  ' RT3F_75
L_6055: SI = BX
L_6057: SI = SI * (2 ^ 1)
L_6059: SI = SI * (2 ^ 1)
L_605B: SI = SI + &HC604
L_605F: DI = &HC9E4
L_6062: CompareLeft! = N(SI): CompareRight! = N_C9E4!  ' RT3F_9F
L_6065: IF CompareLeft! <= CompareRight! THEN GOTO L_606A  ' flags from L_6062
L_6067: GOTO L_6070
L_606A: SI = &HBB46
L_606D: N(DI) = N_BB46!  ' RT3F_7B
L_6070: RETURN
L_6071: DI = &HC110
L_6074: SI = &HC1AC
L_6077: N_C110! = N_C1AC!  ' RT3F_7B
L_607A: DI = &HC114
L_607D: SI = &HC942
L_6080: N_C114! = N_C942!  ' RT3F_7B
L_6083: GOSUB L_06A9
L_6086: DI = &H804E
L_6089: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_608C: IF CompareLeft! < CompareRight! THEN GOTO L_6091  ' flags from L_6089
L_608E: GOTO L_6092
L_6091: RETURN
L_6092: BX = &H18
L_6095: ARGPUSH BX  ' RT3E_42
L_6098: BX = 2
L_609B: LOCATE ARGS(), BX  ' RT3E_44
L_609E: ' PRINT statement begins ; RT3F_BC
L_60A1: BX = &HD0FE
L_60A4: PRINT S_D0FE$;  ' RT3F_6A
L_60A7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_60AA: GOSUB L_2DBF
L_60AD: DI = &HBAD0
L_60B0: SI = &HCA52
L_60B3: CompareLeft! = N_CA52!: CompareRight! = N_BAD0!  ' RT3F_9F
L_60B6: BX = 0
L_60B9: IF CompareLeft! <> CompareRight! THEN GOTO L_60BC  ' flags from L_60B3
L_60BB: BX = BX - 1
L_60BC: DI = &HC110
L_60BF: SI = &HC1B0
L_60C2: N_C110! = N_C1B0!  ' RT3F_7B
L_60C5: DI = &HC114
L_60C8: SI = &HC942
L_60CB: N_C114! = N_C942!  ' RT3F_7B
L_60CE: WORD(BP - &HC) = BX
L_60D1: GOSUB L_06A9
L_60D4: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_60D7: BX = 0
L_60DA: IF CompareLeft! <= CompareRight! THEN GOTO L_60DD  ' flags from L_60D4
L_60DC: BX = BX - 1
L_60DD: BX = BX AND WORD(BP - &HC)
L_60E0: CompareLeft% = BX: CompareRight% = 0
L_60E2: IF CompareLeft% <> CompareRight% THEN GOTO L_60E7  ' flags from L_60E0
L_60E4: GOTO L_60F1
L_60E7: DI = &HD04A
L_60EA: SI = &HC17C
L_60ED: N_D04A! = N_C17C!  ' RT3F_7B
L_60F0: RETURN
L_60F1: DI = &HC17C
L_60F4: SI = &HCA52
L_60F7: CompareLeft! = N_CA52!: CompareRight! = N_C17C!  ' RT3F_9F
L_60FA: BX = 0
L_60FD: IF CompareLeft! <> CompareRight! THEN GOTO L_6100  ' flags from L_60F7
L_60FF: BX = BX - 1
L_6100: DI = &HC110
L_6103: SI = &HC1AC
L_6106: N_C110! = N_C1AC!  ' RT3F_7B
L_6109: DX = DI
L_610B: DI = &HC114
L_610E: SI = &HC942
L_6111: N_C114! = N_C942!  ' RT3F_7B
L_6114: WORD(BP - &HC) = BX
L_6117: GOSUB L_06A9
L_611A: DI = &HBA94
L_611D: CompareLeft! = FAC!: CompareRight! = N_BA94!  ' RT3F_A1
L_6120: BX = 0
L_6123: IF CompareLeft! <= CompareRight! THEN GOTO L_6126  ' flags from L_611D
L_6125: BX = BX - 1
L_6126: BX = BX AND WORD(BP - &HC)
L_6129: DI = &HC110
L_612C: SI = &HC0F0
L_612F: N_C110! = N_C0F0!  ' RT3F_7B
L_6132: DI = &HC114
L_6135: SI = &HC942
L_6138: N_C114! = N_C942!  ' RT3F_7B
L_613B: WORD(BP - &HE) = BX
L_613E: GOSUB L_06A9
L_6141: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_6144: BX = 0
L_6147: IF CompareLeft! <= CompareRight! THEN GOTO L_614A  ' flags from L_6141
L_6149: BX = BX - 1
L_614A: BX = BX AND WORD(BP - &HE)
L_614D: CompareLeft% = BX: CompareRight% = 0
L_614F: IF CompareLeft% <> CompareRight% THEN GOTO L_6154  ' flags from L_614D
L_6151: GOTO L_615E
L_6154: DI = &HD04A
L_6157: SI = &HC178
L_615A: N_D04A! = N_C178!  ' RT3F_7B
L_615D: RETURN
L_615E: DI = &HBF9E
L_6161: SI = &HCA52
L_6164: CompareLeft! = N_CA52!: CompareRight! = N_BF9E!  ' RT3F_9F
L_6167: BX = 0
L_616A: IF CompareLeft! <> CompareRight! THEN GOTO L_616D  ' flags from L_6164
L_616C: BX = BX - 1
L_616D: DI = &HC110
L_6170: SI = &HC1AC
L_6173: N_C110! = N_C1AC!  ' RT3F_7B
L_6176: DI = &HC114
L_6179: SI = &HC942
L_617C: N_C114! = N_C942!  ' RT3F_7B
L_617F: WORD(BP - &HC) = BX
L_6182: GOSUB L_06A9
L_6185: DI = &HC194
L_6188: CompareLeft! = FAC!: CompareRight! = N_C194!  ' RT3F_A1
L_618B: BX = 0
L_618E: IF CompareLeft! <= CompareRight! THEN GOTO L_6191  ' flags from L_6188
L_6190: BX = BX - 1
L_6191: BX = BX AND WORD(BP - &HC)
L_6194: CompareLeft% = BX: CompareRight% = 0
L_6196: IF CompareLeft% <> CompareRight% THEN GOTO L_619B  ' flags from L_6194
L_6198: GOTO L_61A5
L_619B: DI = &HD04A
L_619E: SI = &HBAF4
L_61A1: N_D04A! = N_BAF4!  ' RT3F_7B
L_61A4: RETURN
L_61A5: RETURN
L_61A6: SI = &HD046
L_61A9: BX = CINT(N_D046!)  ' RT3F_75
L_61AC: SI = BX
L_61AE: SI = SI * (2 ^ 1)
L_61B0: SI = SI * (2 ^ 1)
L_61B2: SI = SI + &HC560
L_61B6: DI = &H9412
L_61B9: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_61BC: IF CompareLeft! > CompareRight! THEN GOTO L_61C1  ' flags from L_61B9
L_61BE: GOTO L_61CA
L_61C1: DI = &HD04A
L_61C4: SI = &H804E
L_61C7: N_D04A! = N_804E!  ' RT3F_7B
L_61CA: RETURN
L_61CB: SI = &HC946
L_61CE: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_61D1: IF CompareLeft! > CompareRight! THEN GOTO L_61D6  ' flags from L_61CE
L_61D3: GOTO L_61DF
L_61D6: DI = &HD04A
L_61D9: SI = &H9412
L_61DC: N_D04A! = N_9412!  ' RT3F_7B
L_61DF: RETURN
L_61E0: SI = &HD046
L_61E3: BX = CINT(N_D046!)  ' RT3F_75
L_61E6: SI = BX
L_61E8: SI = SI * (2 ^ 1)
L_61EA: SI = SI * (2 ^ 1)
L_61EC: SI = SI + &HC560
L_61F0: DI = &H9412
L_61F3: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_61F6: IF CompareLeft! > CompareRight! THEN GOTO L_61FB  ' flags from L_61F3
L_61F8: GOTO L_6228
L_61FB: DI = &HBA94
L_61FE: SI = &HD04A
L_6201: CompareLeft! = N_D04A!: CompareRight! = N_BA94!  ' RT3F_9F
L_6204: BX = 0
L_6207: IF CompareLeft! >= CompareRight! THEN GOTO L_620A  ' flags from L_6201
L_6209: BX = BX - 1
L_620A: DX = DI
L_620C: DI = &HC10C
L_620F: CompareLeft! = N(SI): CompareRight! = N_C10C!  ' RT3F_9F
L_6212: CX = 0
L_6215: IF CompareLeft! <= CompareRight! THEN GOTO L_6218  ' flags from L_620F
L_6217: CX = CX - 1
L_6218: CX = CX OR BX
L_621A: CompareLeft% = CX: CompareRight% = 0
L_621C: IF CompareLeft% <> CompareRight% THEN GOTO L_6221  ' flags from L_621A
L_621E: GOTO L_6228
L_6221: DI = SI
L_6223: SWAP DX, SI
L_6225: N(DI) = N(SI)  ' RT3F_7B
L_6228: RETURN
L_6229: SI = &HD046
L_622C: BX = CINT(N_D046!)  ' RT3F_75
L_622F: SI = BX
L_6231: SI = SI * (2 ^ 1)
L_6233: SI = SI * (2 ^ 1)
L_6235: SI = SI + &HC560
L_6239: DI = &H9412
L_623C: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_623F: IF CompareLeft! > CompareRight! THEN GOTO L_6244  ' flags from L_623C
L_6241: GOTO L_624D
L_6244: DI = &HD04A
L_6247: SI = &HC194
L_624A: N_D04A! = N_C194!  ' RT3F_7B
L_624D: RETURN
L_624E: DI = &HD04A
L_6251: SI = &HC998
L_6254: N_D04A! = N_C998!  ' RT3F_7B
L_6257: RETURN
L_6258: DI = &HC1BC
L_625B: SI = &HCA52
L_625E: FAC! = N_CA52! + N_C1BC!  ' RT3F_7F
L_6261: DI = &HD128
L_6264: N_D128! = FAC!: SI = &H001A  ' RT3F_7D
L_6267: DI = &HC9E4
L_626A: SI = &HD128
L_626D: CompareLeft! = N_D128!: CompareRight! = N_C9E4!  ' RT3F_9F
L_6270: BX = 0
L_6273: IF CompareLeft! = CompareRight! THEN GOTO L_6276  ' flags from L_626D
L_6275: BX = BX - 1
L_6276: DI = &HBA94
L_6279: SI = &HD04A
L_627C: CompareLeft! = N_D04A!: CompareRight! = N_BA94!  ' RT3F_9F
L_627F: DX = 0
L_6282: IF CompareLeft! <= CompareRight! THEN GOTO L_6285  ' flags from L_627C
L_6284: DX = DX - 1
L_6285: DX = DX AND BX
L_6287: BX = DI
L_6289: DI = &HC194
L_628C: CompareLeft! = N(SI): CompareRight! = N_C194!  ' RT3F_9F
L_628F: CX = 0
L_6292: IF CompareLeft! >= CompareRight! THEN GOTO L_6295  ' flags from L_628C
L_6294: CX = CX - 1
L_6295: CX = CX AND DX
L_6297: CompareLeft% = CX: CompareRight% = 0
L_6299: IF CompareLeft% <> CompareRight% THEN GOTO L_629E  ' flags from L_6297
L_629B: GOTO L_62A5
L_629E: DI = SI
L_62A0: SWAP BX, SI
L_62A2: N(DI) = N(SI)  ' RT3F_7B
L_62A5: SI = &HD046
L_62A8: BX = CINT(N_D046!)  ' RT3F_75
L_62AB: SI = BX
L_62AD: SI = SI * (2 ^ 1)
L_62AF: SI = SI * (2 ^ 1)
L_62B1: SI = SI + &HC604
L_62B5: DI = &HD128
L_62B8: CompareLeft! = N(SI): CompareRight! = N_D128!  ' RT3F_9F
L_62BB: IF CompareLeft! > CompareRight! THEN GOTO L_62C0  ' flags from L_62B8
L_62BD: GOTO L_62C8
L_62C0: SI = DI
L_62C2: DI = &HC9E4
L_62C5: N_C9E4! = N(SI)  ' RT3F_7B
L_62C8: GOTO L_5BF9
L_62CB: DI = &HC110
L_62CE: SI = &HCA72
L_62D1: N_C110! = N_CA72!  ' RT3F_7B
L_62D4: BX = DI
L_62D6: DI = &HC114
L_62D9: DX = SI
L_62DB: SI = &HC942
L_62DE: N_C114! = N_C942!  ' RT3F_7B
L_62E1: GOSUB L_06A9
L_62E4: DI = &HBB56
L_62E7: CompareLeft! = FAC!: CompareRight! = N_BB56!  ' RT3F_A1
L_62EA: BX = 0
L_62ED: IF CompareLeft! <= CompareRight! THEN GOTO L_62F0  ' flags from L_62E7
L_62EF: BX = BX - 1
L_62F0: DI = &HC110
L_62F3: SI = &HCA72
L_62F6: N_C110! = N_CA72!  ' RT3F_7B
L_62F9: DX = DI
L_62FB: DI = &HC114
L_62FE: CX = SI

```

### Action and combat calculations

```basic
L_6300: SI = &HC942
L_6303: N_C114! = N_C942!  ' RT3F_7B
L_6306: WORD(BP - &HC) = BX
L_6309: GOSUB L_06A9
L_630C: DI = &HC194
L_630F: CompareLeft! = FAC!: CompareRight! = N_C194!  ' RT3F_A1
L_6312: BX = 0
L_6315: IF CompareLeft! >= CompareRight! THEN GOTO L_6318  ' flags from L_630F
L_6317: BX = BX - 1
L_6318: BX = BX AND WORD(BP - &HC)
L_631B: DI = &HC110
L_631E: SI = &HD066
L_6321: N_C110! = N_D066!  ' RT3F_7B
L_6324: DX = DI
L_6326: DI = &HC114
L_6329: SI = &HC942
L_632C: N_C114! = N_C942!  ' RT3F_7B
L_632F: WORD(BP - &HE) = BX
L_6332: GOSUB L_06A9
L_6335: DI = &HD046
L_6338: CompareLeft! = FAC!: CompareRight! = N_D046!  ' RT3F_A1
L_633B: BX = 0
L_633E: IF CompareLeft! <> CompareRight! THEN GOTO L_6341  ' flags from L_6338
L_6340: BX = BX - 1
L_6341: BX = BX AND WORD(BP - &HE)
L_6344: CompareLeft% = BX: CompareRight% = 0
L_6346: IF CompareLeft% <> CompareRight% THEN GOTO L_634B  ' flags from L_6344
L_6348: GOTO L_6393
L_634B: DI = &HC120
L_634E: SI = &HC970
L_6351: N_C120! = N_C970!  ' RT3F_7B
L_6354: DI = &HC124
L_6357: SI = &HC942
L_635A: N_C124! = N_C942!  ' RT3F_7B
L_635D: GOSUB L_06DB
L_6360: BX = CINT(FAC!)  ' RT3F_77
L_6363: DI = BX
L_6365: DI = DI * (2 ^ 1)
L_6367: DI = DI * (2 ^ 1)
L_6369: DI = DI + &H1850
L_636D: BX = DI
L_636F: DI = &HC110
L_6372: SI = &HCA72
L_6375: N_C110! = N_CA72!  ' RT3F_7B
L_6378: DI = &HC114
L_637B: SI = &HC942
L_637E: N_C114! = N_C942!  ' RT3F_7B
L_6381: WORD(BP - &H10) = BX
L_6384: GOSUB L_06A9
L_6387: DI = &HC6CE
L_638A: FAC! = FAC! + N_C6CE!  ' RT3F_81
L_638D: DI = WORD(BP - &H10)
L_6390: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6393: DI = &HC120
L_6396: SI = &HD066
L_6399: N_C120! = N_D066!  ' RT3F_7B
L_639C: BX = DI
L_639E: DI = &HC124
L_63A1: SI = &HC942
L_63A4: N_C124! = N_C942!  ' RT3F_7B
L_63A7: GOSUB L_06DB
L_63AA: BX = CINT(FAC!)  ' RT3F_77
L_63AD: DI = BX
L_63AF: DI = DI * (2 ^ 1)
L_63B1: DI = DI * (2 ^ 1)
L_63B3: DI = DI + &H1850
L_63B7: SI = &HD046
L_63BA: N(DI) = N_D046!  ' RT3F_7B
L_63BD: DI = &HC120
L_63C0: SI = &HCA72
L_63C3: N_C120! = N_CA72!  ' RT3F_7B
L_63C6: BX = DI
L_63C8: DI = &HC124
L_63CB: SI = &HC942
L_63CE: N_C124! = N_C942!  ' RT3F_7B
L_63D1: GOSUB L_06DB
L_63D4: BX = CINT(FAC!)  ' RT3F_77
L_63D7: DI = BX
L_63D9: DI = DI * (2 ^ 1)
L_63DB: DI = DI * (2 ^ 1)
L_63DD: DI = DI + &H1850
L_63E1: SI = &HD04A
L_63E4: N(DI) = N_D04A!  ' RT3F_7B
L_63E7: DI = &HC120
L_63EA: SI = &HC1B4
L_63ED: N_C120! = N_C1B4!  ' RT3F_7B
L_63F0: BX = DI
L_63F2: DI = &HC124
L_63F5: SI = &HC942
L_63F8: N_C124! = N_C942!  ' RT3F_7B
L_63FB: GOSUB L_06DB
L_63FE: BX = CINT(FAC!)  ' RT3F_77
L_6401: DI = BX
L_6403: DI = DI * (2 ^ 1)
L_6405: DI = DI * (2 ^ 1)
L_6407: DI = DI + &H1850
L_640B: SI = &HC9E4
L_640E: N(DI) = N_C9E4!  ' RT3F_7B
L_6411: SI = &HC946
L_6414: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_6417: IF CompareLeft! = CompareRight! THEN GOTO L_641C  ' flags from L_6414
L_6419: GOTO L_6444
L_641C: DI = &HC120
L_641F: SI = &HBFA6
L_6422: N_C120! = N_BFA6!  ' RT3F_7B
L_6425: DI = &HC124
L_6428: SI = &HBB46
L_642B: N_C124! = N_BB46!  ' RT3F_7B
L_642E: GOSUB L_06DB
L_6431: BX = CINT(FAC!)  ' RT3F_77
L_6434: DI = BX
L_6436: DI = DI * (2 ^ 1)
L_6438: DI = DI * (2 ^ 1)
L_643A: DI = DI + &H1850
L_643E: SI = &HBB46
L_6441: N(DI) = N_BB46!  ' RT3F_7B
L_6444: DI = &H804E
L_6447: SI = &HC942
L_644A: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_644D: DI = &HC942
L_6450: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_6453: SI = DI
L_6455: DI = &HC10C
L_6458: CompareLeft! = N_C942!: CompareRight! = N_C10C!  ' RT3F_9F
L_645B: IF CompareLeft! > CompareRight! THEN GOTO L_6460  ' flags from L_6458
L_645D: GOTO L_5534
L_6460: GOSUB L_2EFC
L_6463: DI = &HD12C
L_6466: SI = &HBB46
L_6469: N_D12C! = N_BB46!  ' RT3F_7B
L_646C: DI = &HC716
L_646F: SI = &HC0F4
L_6472: N_C716! = N_C0F4!  ' RT3F_7B
L_6475: GOSUB L_1875
L_6478: DI = &HC1E0
L_647B: N_C1E0! = FAC!: SI = &H001A  ' RT3F_7D
L_647E: BX = DI
L_6480: DI = &HD130
L_6483: SI = &HC99C
L_6486: N_D130! = N_C99C!  ' RT3F_7B
L_6489: DX = DI
L_648B: DI = &HD134
L_648E: N_D134! = N_C99C!  ' RT3F_7B
L_6491: SI = BX
L_6493: CX = DI
L_6495: DI = &H804E
L_6498: CompareLeft! = N_C1E0!: CompareRight! = N_804E!  ' RT3F_9F
L_649B: AX = 0
L_649E: IF CompareLeft! <= CompareRight! THEN GOTO L_64A1  ' flags from L_6498
L_64A0: AX = AX - 1
L_64A1: DI = &HC0F4
L_64A4: CompareLeft! = N(SI): CompareRight! = N_C0F4!  ' RT3F_9F
L_64A7: BX = 0
L_64AA: IF CompareLeft! >= CompareRight! THEN GOTO L_64AD  ' flags from L_64A4
L_64AC: BX = BX - 1
L_64AD: BX = BX AND AX
L_64AF: CompareLeft% = BX: CompareRight% = 0
L_64B1: IF CompareLeft% <> CompareRight% THEN GOTO L_64B6  ' flags from L_64AF
L_64B3: GOTO L_64D1
L_64B6: DI = &HD138
L_64B9: FAC! = N(SI) * N_D138!  ' RT3F_8F
L_64BC: SI = &HD13C
L_64BF: FAC! = N_D13C! - FAC!  ' RT3F_9B
L_64C2: DI = CX
L_64C4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_64C7: SI = DX
L_64C9: FAC! = -N(SI)  ' RT3F_AF
L_64CC: DI = DX
L_64CE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_64D1: DI = &HC6B0
L_64D4: SI = &HC63C
L_64D7: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_64DA: DI = &HD140
L_64DD: N_D140! = FAC!: SI = &H001A  ' RT3F_7D
L_64E0: SI = &HC6B4
L_64E3: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_64E6: GOTO L_655C
L_64E9: ' Alignment NOP
L_64EA: SI = &HBA90
L_64ED: BX = CINT(N_BA90!)  ' RT3F_75
L_64F0: SI = BX
L_64F2: SI = SI * (2 ^ 1)
L_64F4: SI = SI * (2 ^ 1)
L_64F6: SI = SI + &HC604
L_64FA: DI = &HC6B0
L_64FD: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_6500: DI = &HD144
L_6503: N_D144! = FAC!: SI = &H001A  ' RT3F_7D
L_6506: SI = &HC6B4
L_6509: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_650C: GOTO L_6543
L_650F: ' Alignment NOP
L_6510: SI = &HBA90
L_6513: BX = CINT(N_BA90!)  ' RT3F_75
L_6516: AX = BX
L_6518: DI = 5
L_651B: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_651D: DI = AX
L_651F: SI = &HD148
L_6522: BX = SI
L_6524: DX = BX
L_6526: BX = CINT(N_D148!)  ' RT3F_75
L_6529: DI = DI + BX
L_652B: DI = DI * (2 ^ 1)
L_652D: DI = DI * (2 ^ 1)
L_652F: DI = DI + &HC4C8
L_6533: SI = DI
L_6535: FAC! = SGN(N(SI))  ' RT3F_2F
L_6538: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_653B: SI = DX
L_653D: DI = &H804E
L_6540: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_6543: DI = &HD148
L_6546: N_D148! = FAC!: SI = &H001A  ' RT3F_7D
L_6549: SI = DI
L_654B: DI = &HD144
L_654E: CompareLeft! = N_D148!: CompareRight! = N_D144!  ' RT3F_9F
L_6551: IF CompareLeft! <= CompareRight! THEN GOTO L_6510  ' flags from L_654E
L_6553: DI = &H804E
L_6556: SI = &HBA90
L_6559: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_655C: DI = &HBA90
L_655F: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_6562: SI = DI
L_6564: DI = &HD140
L_6567: CompareLeft! = N_BA90!: CompareRight! = N_D140!  ' RT3F_9F
L_656A: IF CompareLeft! > CompareRight! THEN GOTO L_656F  ' flags from L_6567
L_656C: GOTO L_64EA
L_656F: DI = &HCC58
L_6572: SI = &HC698
L_6575: FAC! = N_C698! * N_CC58!  ' RT3F_8F
L_6578: DI = &HD14C
L_657B: N_D14C! = FAC!: SI = &H001A  ' RT3F_7D
L_657E: DI = &H804E
L_6581: SI = &HC690
L_6584: FAC! = N_C690! + N_804E!  ' RT3F_7F
L_6587: GOTO L_70AE
L_658A: DI = &HC694
L_658D: SI = &HD150
L_6590: CompareLeft! = N_D150!: CompareRight! = N_C694!  ' RT3F_9F
L_6593: IF CompareLeft! < CompareRight! THEN GOTO L_6598  ' flags from L_6590
L_6595: GOTO L_65A0
L_6598: DI = SI
L_659A: SI = &HBB46
L_659D: N(DI) = N_BB46!  ' RT3F_7B
L_65A0: SI = &H804E
L_65A3: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_65A6: GOTO L_6F4D
L_65A9: ' Alignment NOP
L_65AA: DI = &HC110
L_65AD: SI = &HCA72
L_65B0: N_C110! = N_CA72!  ' RT3F_7B
L_65B3: DI = &HC114
L_65B6: SI = &HC762
L_65B9: N_C114! = N_C762!  ' RT3F_7B
L_65BC: GOSUB L_06A9
L_65BF: DI = &HD04A
L_65C2: N_D04A! = FAC!: SI = &H001A  ' RT3F_7D
L_65C5: SI = DI
L_65C7: DI = &HC194
L_65CA: CompareLeft! = N_D04A!: CompareRight! = N_C194!  ' RT3F_9F
L_65CD: IF CompareLeft! > CompareRight! THEN GOTO L_65D2  ' flags from L_65CA
L_65CF: GOTO L_65D8
L_65D2: GOSUB L_A36B
L_65D5: GOTO L_6F44
L_65D8: DI = &H804E
L_65DB: SI = &HD04A
L_65DE: CompareLeft! = N_D04A!: CompareRight! = N_804E!  ' RT3F_9F
L_65E1: BX = 0
L_65E4: IF CompareLeft! >= CompareRight! THEN GOTO L_65E7  ' flags from L_65DE
L_65E6: BX = BX - 1
L_65E7: SI = DI
L_65E9: DI = &HC110
L_65EC: N_C110! = N(SI)  ' RT3F_7B
L_65EF: DI = &HC114
L_65F2: SI = &HC762
L_65F5: N_C114! = N_C762!  ' RT3F_7B
L_65F8: WORD(BP - &HC) = BX
L_65FB: GOSUB L_06A9
L_65FE: DI = &HD150
L_6601: CompareLeft! = FAC!: CompareRight! = N_D150!  ' RT3F_A1
L_6604: BX = 0
L_6607: IF CompareLeft! >= CompareRight! THEN GOTO L_660A  ' flags from L_6601
L_6609: BX = BX - 1
L_660A: BX = BX OR WORD(BP - &HC)
L_660D: CompareLeft% = BX: CompareRight% = 0
L_660F: IF CompareLeft% = CompareRight% THEN GOTO L_6614  ' flags from L_660D
L_6611: GOTO L_6F44
L_6614: DI = &H9412
L_6617: SI = &HD04A
L_661A: CompareLeft! = N_D04A!: CompareRight! = N_9412!  ' RT3F_9F
L_661D: BX = 0
L_6620: IF CompareLeft! <= CompareRight! THEN GOTO L_6623  ' flags from L_661A
L_6622: BX = BX - 1
L_6623: DI = &HC194
L_6626: CompareLeft! = N(SI): CompareRight! = N_C194!  ' RT3F_9F
L_6629: DX = 0
L_662C: IF CompareLeft! >= CompareRight! THEN GOTO L_662F  ' flags from L_6626
L_662E: DX = DX - 1
L_662F: DX = DX AND BX
L_6631: DI = &HC17C
L_6634: CompareLeft! = N(SI): CompareRight! = N_C17C!  ' RT3F_9F
L_6637: BX = 0
L_663A: IF CompareLeft! <> CompareRight! THEN GOTO L_663D  ' flags from L_6634
L_663C: BX = BX - 1
L_663D: BX = BX OR DX
L_663F: CompareLeft% = BX: CompareRight% = 0
L_6641: IF CompareLeft% = CompareRight% THEN GOTO L_6646  ' flags from L_663F
L_6643: GOTO L_6F44
L_6646: DI = &HC110
L_6649: SI = &HBFA6
L_664C: N_C110! = N_BFA6!  ' RT3F_7B
L_664F: DI = &HC114
L_6652: SI = &HC762
L_6655: N_C114! = N_C762!  ' RT3F_7B
L_6658: GOSUB L_06A9
L_665B: DI = &HC984
L_665E: N_C984! = FAC!: SI = &H001A  ' RT3F_7D
L_6661: SI = DI
L_6663: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_6666: IF CompareLeft! > CompareRight! THEN GOTO L_666B  ' flags from L_6663
L_6668: GOTO L_66D6
L_666B: DI = &HC184
L_666E: FAC! = N(SI) * N_C184!  ' RT3F_8F
L_6671: DI = &HC94E
L_6674: BX = SI
L_6676: FAC! = FAC! + N_C94E!  ' RT3F_81
L_6679: DI = &HC94A
L_667C: N_C94A! = FAC!: SI = &H001A  ' RT3F_7D
L_667F: SI = DI
L_6681: DI = &HC10C
L_6684: FAC! = N_C94A! + N_C10C!  ' RT3F_7F
L_6687: DX = SI
L_6689: CX = BX
L_668B: BX = CINT(FAC!)  ' RT3F_77
L_668E: SI = BX
L_6690: SI = SI * (2 ^ 1)
L_6692: SI = SI * (2 ^ 1)
L_6694: SI = SI + &H1850
L_6698: DI = CX
L_669A: N(DI) = N(SI)  ' RT3F_7B
L_669D: SI = DX
L_669F: DI = &HBB56
L_66A2: FAC! = N(SI) + N_BB56!  ' RT3F_7F
L_66A5: BX = CINT(FAC!)  ' RT3F_77
L_66A8: SI = BX
L_66AA: SI = SI * (2 ^ 1)
L_66AC: SI = SI * (2 ^ 1)
L_66AE: SI = SI + &H1850
L_66B2: DI = &H804E
L_66B5: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_66B8: BX = 0
L_66BB: IF CompareLeft! >= CompareRight! THEN GOTO L_66BE  ' flags from L_66B5
L_66BD: BX = BX - 1
L_66BE: DI = &H9412
L_66C1: SI = &HD04A
L_66C4: CompareLeft! = N_D04A!: CompareRight! = N_9412!  ' RT3F_9F
L_66C7: DX = 0
L_66CA: IF CompareLeft! = CompareRight! THEN GOTO L_66CD  ' flags from L_66C4
L_66CC: DX = DX - 1
L_66CD: DX = DX AND BX
L_66CF: CompareLeft% = DX: CompareRight% = 0
L_66D1: IF CompareLeft% = CompareRight% THEN GOTO L_66D6  ' flags from L_66CF
L_66D3: GOTO L_6F44
L_66D6: DI = &HC120
L_66D9: SI = &HCA72
L_66DC: N_C120! = N_CA72!  ' RT3F_7B
L_66DF: DI = &HC124
L_66E2: SI = &HC762
L_66E5: N_C124! = N_C762!  ' RT3F_7B
L_66E8: GOSUB L_06DB
L_66EB: BX = CINT(FAC!)  ' RT3F_77
L_66EE: DI = BX
L_66F0: DI = DI * (2 ^ 1)
L_66F2: DI = DI * (2 ^ 1)
L_66F4: DI = DI + &H1850
L_66F8: BX = DI
L_66FA: DI = &HC194
L_66FD: SI = &HD04A
L_6700: CompareLeft! = N_D04A!: CompareRight! = N_C194!  ' RT3F_9F
L_6703: DX = 0
L_6706: IF CompareLeft! <> CompareRight! THEN GOTO L_6709  ' flags from L_6700
L_6708: DX = DX - 1
L_6709: SWAP DX, BX
L_670B: FAC! = CSNG(BX)  ' RT3F_57
L_670E: DI = DX
L_6710: BX = SI
L_6712: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6715: SI = BX
L_6717: DI = &H9412
L_671A: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_671D: IF CompareLeft! = CompareRight! THEN GOTO L_6722  ' flags from L_671A
L_671F: GOTO L_6864
L_6722: DI = &H9412
L_6725: SI = &HC762
L_6728: FAC! = N_C762! + N_9412!  ' RT3F_7F
L_672B: DI = &HC98C
L_672E: N_C98C! = FAC!: SI = &H001A  ' RT3F_7D
L_6731: DI = &HC97C
L_6734: SI = &HBB46
L_6737: N_C97C! = N_BB46!  ' RT3F_7B
L_673A: SI = &HC94A
L_673D: BX = CINT(N_C94A!)  ' RT3F_75
L_6740: SI = BX
L_6742: SI = SI * (2 ^ 1)
L_6744: SI = SI * (2 ^ 1)
L_6746: SI = SI + &H1850
L_674A: DI = &HC988
L_674D: N_C988! = N(SI)  ' RT3F_7B
L_6750: SI = &HC1A0
L_6753: FAC! = N_C1A0!: DI = &H001E  ' RT3F_6F
L_6756: GOTO L_6802
L_6759: ' Alignment NOP
L_675A: SI = &HC634
L_675D: BX = SI
L_675F: DX = BX
L_6761: BX = CINT(N_C634!)  ' RT3F_75
L_6764: SI = BX
L_6766: SI = SI * (2 ^ 1)
L_6768: SI = SI * (2 ^ 1)
L_676A: SI = SI + &H1850
L_676E: DI = &HC988
L_6771: CompareLeft! = N(SI): CompareRight! = N_C988!  ' RT3F_9F
L_6774: BX = 0
L_6777: IF CompareLeft! <> CompareRight! THEN GOTO L_677A  ' flags from L_6771
L_6779: BX = BX - 1
L_677A: SWAP DX, SI
L_677C: DI = &H9412
L_677F: FAC! = N(SI) + N_9412!  ' RT3F_7F
L_6782: CX = SI
L_6784: AX = BX
L_6786: BX = CINT(FAC!)  ' RT3F_77
L_6789: SI = BX
L_678B: SI = SI * (2 ^ 1)
L_678D: SI = SI * (2 ^ 1)
L_678F: SI = SI + &H1850
L_6793: DI = &HC98C
L_6796: CompareLeft! = N(SI): CompareRight! = N_C98C!  ' RT3F_9F
L_6799: BX = 0
L_679C: IF CompareLeft! <> CompareRight! THEN GOTO L_679F  ' flags from L_6796
L_679E: BX = BX - 1
L_679F: BX = BX AND AX
L_67A1: CompareLeft% = BX: CompareRight% = 0
L_67A3: IF CompareLeft% <> CompareRight% THEN GOTO L_67A8  ' flags from L_67A1
L_67A5: GOTO L_67F9
L_67A8: DI = DX
L_67AA: SI = &HBB46
L_67AD: N(DI) = N_BB46!  ' RT3F_7B
L_67B0: DI = CX
L_67B2: SI = &HC990
L_67B5: N(DI) = N_C990!  ' RT3F_7B
L_67B8: DI = &HBB56
L_67BB: SI = &HC94A
L_67BE: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_67C1: BX = SI
L_67C3: DX = BX
L_67C5: BX = CINT(FAC!)  ' RT3F_77
L_67C8: DI = BX
L_67CA: DI = DI * (2 ^ 1)
L_67CC: DI = DI * (2 ^ 1)
L_67CE: DI = DI + &H1850
L_67D2: SI = DX
L_67D4: BX = DI
L_67D6: DI = &HBA94
L_67D9: FAC! = N(SI) + N_BA94!  ' RT3F_7F
L_67DC: DX = BX
L_67DE: BX = CINT(FAC!)  ' RT3F_77
L_67E1: SI = BX
L_67E3: SI = SI * (2 ^ 1)
L_67E5: SI = SI * (2 ^ 1)
L_67E7: SI = SI + &H1850
L_67EB: DI = DX
L_67ED: N(DI) = N(SI)  ' RT3F_7B
L_67F0: DI = &HC97C
L_67F3: SI = &H804E
L_67F6: N_C97C! = N_804E!  ' RT3F_7B
L_67F9: DI = &HBB56
L_67FC: SI = &HC634
L_67FF: FAC! = N_C634! + N_BB56!  ' RT3F_7F

```

### Squad attack resolution

```basic
L_6802: DI = &HC634
L_6805: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_6808: SI = DI
L_680A: DI = &HC1A4
L_680D: CompareLeft! = N_C634!: CompareRight! = N_C1A4!  ' RT3F_9F
L_6810: IF CompareLeft! > CompareRight! THEN GOTO L_6815  ' flags from L_680D
L_6812: GOTO L_675A
L_6815: DI = &H804E
L_6818: SI = &HC97C
L_681B: CompareLeft! = N_C97C!: CompareRight! = N_804E!  ' RT3F_9F
L_681E: IF CompareLeft! = CompareRight! THEN GOTO L_6823  ' flags from L_681B
L_6820: GOTO L_6861
L_6823: GOSUB L_2EFC
L_6826: BX = &H16
L_6829: ARGPUSH BX  ' RT3E_42
L_682C: BX = 2
L_682F: LOCATE ARGS(), BX  ' RT3E_44
L_6832: ' PRINT statement begins ; RT3F_BC
L_6835: SI = &HC762
L_6838: BX = SI
L_683A: DX = BX
L_683C: BX = CINT(N_C762!)  ' RT3F_75
L_683F: BX = BX * (2 ^ 1)
L_6841: BX = BX * (2 ^ 1)
L_6843: BX = BX + &H4288
L_6847: PRINT S(BX);  ' RT3F_6A
L_684A: BX = &HD154
L_684D: PRINT S_D154$  ' RT3F_6E; H newline item, ledger correction
L_6850: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6853: SI = DX
L_6855: DI = &HBA90
L_6858: N_BA90! = N(SI)  ' RT3F_7B
L_685B: GOSUB L_29EB
L_685E: GOTO L_6F16
L_6861: GOTO L_6F44
L_6864: SI = &HC984
L_6867: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_686A: IF CompareLeft! = CompareRight! THEN GOTO L_686F  ' flags from L_6867
L_686C: GOTO L_688D
L_686F: DI = &HC110
L_6872: SI = &HD164
L_6875: N_C110! = N_D164!  ' RT3F_7B
L_6878: DI = &HC114
L_687B: SI = &HC762
L_687E: N_C114! = N_C762!  ' RT3F_7B
L_6881: GOSUB L_06A9
L_6884: DI = &HD160
L_6887: N_D160! = FAC!: SI = &H001A  ' RT3F_7D
L_688A: GOTO L_68A9
L_688D: DI = &HC194
L_6890: SI = &HC94A
L_6893: FAC! = N_C94A! + N_C194!  ' RT3F_7F
L_6896: BX = CINT(FAC!)  ' RT3F_77
L_6899: SI = BX
L_689B: SI = SI * (2 ^ 1)
L_689D: SI = SI * (2 ^ 1)
L_689F: SI = SI + &H1850
L_68A3: DI = &HD160
L_68A6: N_D160! = N(SI)  ' RT3F_7B
L_68A9: SI = &HC984
L_68AC: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_68AF: IF CompareLeft! = CompareRight! THEN GOTO L_68B4  ' flags from L_68AC
L_68B1: GOTO L_68C0
L_68B4: DI = &HD168
L_68B7: SI = &HD16C
L_68BA: N_D168! = N_D16C!  ' RT3F_7B
L_68BD: GOTO L_6927
L_68C0: DI = &HBB4A
L_68C3: SI = &HC94A
L_68C6: FAC! = N_C94A! + N_BB4A!  ' RT3F_7F
L_68C9: BX = CINT(FAC!)  ' RT3F_77
L_68CC: SI = BX
L_68CE: SI = SI * (2 ^ 1)
L_68D0: SI = SI * (2 ^ 1)
L_68D2: SI = SI + &H1850
L_68D6: DI = &HBB56
L_68D9: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_68DC: BX = 0
L_68DF: IF CompareLeft! <> CompareRight! THEN GOTO L_68E2  ' flags from L_68D9
L_68E1: BX = BX - 1
L_68E2: DX = &H15
L_68E5: DX = DX - BX
L_68E7: DI = &H9412
L_68EA: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_68ED: AX = 0
L_68F0: IF CompareLeft! <> CompareRight! THEN GOTO L_68F3  ' flags from L_68EA
L_68F2: AX = AX - 1
L_68F3: BX = 3
L_68F6: CX = DX
L_68F8: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_68FA: CX = CX - AX
L_68FC: DI = &H804E
L_68FF: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_6902: DX = 0
L_6905: IF CompareLeft! <> CompareRight! THEN GOTO L_6908  ' flags from L_68FF
L_6907: DX = DX - 1
L_6908: DX = DX * (2 ^ 1)
L_690A: DX = DX * (2 ^ 1)
L_690C: CX = CX - DX
L_690E: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_6911: DX = 0
L_6914: IF CompareLeft! <> CompareRight! THEN GOTO L_6917  ' flags from L_690E
L_6916: DX = DX - 1
L_6917: SWAP BX, AX
L_6918: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_691A: CX = CX - AX
L_691C: BX = CX
L_691E: FAC! = CSNG(BX)  ' RT3F_57
L_6921: DI = &HD168
L_6924: N_D168! = FAC!: SI = &H001A  ' RT3F_7D
L_6927: DI = &HC110
L_692A: SI = &HD168
L_692D: N_C110! = N_D168!  ' RT3F_7B
L_6930: DI = &HC114
L_6933: BX = SI
L_6935: SI = &HC762
L_6938: N_C114! = N_C762!  ' RT3F_7B
L_693B: GOSUB L_06A9
L_693E: DI = &HD168
L_6941: N_D168! = FAC!: SI = &H001A  ' RT3F_7D
L_6944: DI = &HC110
L_6947: SI = &HD066
L_694A: N_C110! = N_D066!  ' RT3F_7B
L_694D: BX = DI
L_694F: DI = &HC114
L_6952: SI = &HC762
L_6955: N_C114! = N_C762!  ' RT3F_7B
L_6958: GOSUB L_06A9
L_695B: DI = &HC9DC
L_695E: N_C9DC! = FAC!: SI = &H001A  ' RT3F_7D
L_6961: BX = DI
L_6963: DI = &HC110
L_6966: SI = &HC1B4
L_6969: N_C110! = N_C1B4!  ' RT3F_7B
L_696C: DX = DI
L_696E: DI = &HC114
L_6971: SI = &HC762
L_6974: N_C114! = N_C762!  ' RT3F_7B
L_6977: GOSUB L_06A9
L_697A: DI = &HC9E4
L_697D: N_C9E4! = FAC!: SI = &H001A  ' RT3F_7D
L_6980: DI = &HC0F4
L_6983: SI = &HD168
L_6986: FAC! = N_D168! * N_C0F4!  ' RT3F_8F
L_6989: DI = &HC110
L_698C: SI = &HBAF4
L_698F: N_C110! = N_BAF4!  ' RT3F_7B
L_6992: BX = DI
L_6994: DI = &HC114
L_6997: SI = &HC762
L_699A: N_C114! = N_C762!  ' RT3F_7B
L_699D: T_03! = FAC!  ' RT3F_71; inline=&H83
L_69A1: GOSUB L_06A9
L_69A4: FAC! = T_03! + FAC!  ' RT3F_85; inline=&H83
L_69A8: DI = &HC110
L_69AB: SI = &HC970
L_69AE: N_C110! = N_C970!  ' RT3F_7B
L_69B1: BX = DI
L_69B3: DI = &HC114
L_69B6: DX = SI
L_69B8: SI = &HC762
L_69BB: N_C114! = N_C762!  ' RT3F_7B
L_69BE: T_04! = FAC!  ' RT3F_71; inline=&H84
L_69C2: GOSUB L_06A9
L_69C5: DI = &H9412
L_69C8: CompareLeft! = FAC!: CompareRight! = N_9412!  ' RT3F_A1
L_69CB: AX = 0
L_69CE: IF CompareLeft! <= CompareRight! THEN GOTO L_69D1  ' flags from L_69C8
L_69D0: AX = AX - 1
L_69D1: BX = &H14
L_69D4: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_69D6: BX = AX
L_69D8: FAC! = CSNG(BX)  ' RT3F_57
L_69DB: FAC! = T_04! - FAC!  ' RT3F_9D; inline=&H84
L_69DF: DI = &HC110
L_69E2: SI = &HC970
L_69E5: N_C110! = N_C970!  ' RT3F_7B
L_69E8: BX = DI
L_69EA: DI = &HC114
L_69ED: DX = SI
L_69EF: SI = &HC762
L_69F2: N_C114! = N_C762!  ' RT3F_7B
L_69F5: T_05! = FAC!  ' RT3F_71; inline=&H85
L_69F9: GOSUB L_06A9
L_69FC: DI = &H804E
L_69FF: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_6A02: AX = 0
L_6A05: IF CompareLeft! <= CompareRight! THEN GOTO L_6A08  ' flags from L_69FF
L_6A07: AX = AX - 1
L_6A08: BX = &H1E
L_6A0B: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_6A0D: BX = AX
L_6A0F: FAC! = CSNG(BX)  ' RT3F_57
L_6A12: FAC! = T_05! - FAC!  ' RT3F_9D; inline=&H85
L_6A16: DI = &HC110
L_6A19: SI = &HC970
L_6A1C: N_C110! = N_C970!  ' RT3F_7B
L_6A1F: BX = DI
L_6A21: DI = &HC114
L_6A24: SI = &HC762
L_6A27: N_C114! = N_C762!  ' RT3F_7B
L_6A2A: T_06! = FAC!  ' RT3F_71; inline=&H86
L_6A2E: GOSUB L_06A9
L_6A31: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_6A34: AX = 0
L_6A37: IF CompareLeft! <= CompareRight! THEN GOTO L_6A3A  ' flags from L_6A31
L_6A39: AX = AX - 1
L_6A3A: BX = &H32
L_6A3D: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_6A3F: BX = AX
L_6A41: FAC! = CSNG(BX)  ' RT3F_57
L_6A44: FAC! = T_06! - FAC!  ' RT3F_9D; inline=&H86
L_6A48: SI = &HC9DC
L_6A4B: T_07! = FAC!  ' RT3F_71; inline=&H87
L_6A4F: BX = CINT(N(SI))  ' RT3F_75
L_6A52: DI = BX
L_6A54: DI = DI * (2 ^ 1)
L_6A56: DI = DI * (2 ^ 1)
L_6A58: DI = DI + &HC248
L_6A5C: SI = &HBEC0
L_6A5F: FAC! = N_BEC0! - N(DI)  ' RT3F_97
L_6A62: DI = &HC110
L_6A65: SI = &HCA6E
L_6A68: N_C110! = N_CA6E!  ' RT3F_7B
L_6A6B: DI = &HC114
L_6A6E: SI = &HC762
L_6A71: N_C114! = N_C762!  ' RT3F_7B
L_6A74: T_08! = FAC!  ' RT3F_71; inline=&H88
L_6A78: GOSUB L_06A9
L_6A7B: FAC! = T_08! + FAC!  ' RT3F_85; inline=&H88
L_6A7F: DI = &HD160
L_6A82: FAC! = FAC! + N_D160!  ' RT3F_81
L_6A85: DI = &HC188
L_6A88: FAC! = FAC! + N_C188!  ' RT3F_81
L_6A8B: DI = &HD170
L_6A8E: N_D170! = FAC!: SI = &H001A  ' RT3F_7D
L_6A91: BX = DI
L_6A93: DI = &HC194
L_6A96: SI = &HD04A
L_6A99: CompareLeft! = N_D04A!: CompareRight! = N_C194!  ' RT3F_9F
L_6A9C: IF CompareLeft! = CompareRight! THEN GOTO L_6AA1  ' flags from L_6A99
L_6A9E: GOTO L_6AAE
L_6AA1: SI = BX
L_6AA3: DI = &HBB52
L_6AA6: FAC! = N(SI) * N_BB52!  ' RT3F_8F
L_6AA9: DI = BX
L_6AAB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6AAE: DI = &HC716
L_6AB1: SI = &HC9DC
L_6AB4: N_C716! = N_C9DC!  ' RT3F_7B
L_6AB7: GOSUB L_1875
L_6ABA: DI = &HC1E0
L_6ABD: N_C1E0! = FAC!: SI = &H001A  ' RT3F_7D
L_6AC0: SI = DI
L_6AC2: DI = &H804E
L_6AC5: CompareLeft! = N_C1E0!: CompareRight! = N_804E!  ' RT3F_9F
L_6AC8: BX = 0
L_6ACB: IF CompareLeft! <= CompareRight! THEN GOTO L_6ACE  ' flags from L_6AC5
L_6ACD: BX = BX - 1
L_6ACE: DI = &HC0F4
L_6AD1: CompareLeft! = N(SI): CompareRight! = N_C0F4!  ' RT3F_9F
L_6AD4: DX = 0
L_6AD7: IF CompareLeft! >= CompareRight! THEN GOTO L_6ADA  ' flags from L_6AD1
L_6AD9: DX = DX - 1
L_6ADA: DX = DX AND BX
L_6ADC: CompareLeft% = DX: CompareRight% = 0
L_6ADE: IF CompareLeft% <> CompareRight% THEN GOTO L_6AE3  ' flags from L_6ADC
L_6AE0: GOTO L_6AFC
L_6AE3: DI = &HD138
L_6AE6: FAC! = N(SI) * N_D138!  ' RT3F_8F
L_6AE9: SI = &HD170
L_6AEC: FAC! = N_D170! - FAC!  ' RT3F_9B
L_6AEF: DI = &HD13C
L_6AF2: BX = SI
L_6AF4: FAC! = FAC! + N_D13C!  ' RT3F_81
L_6AF7: DI = BX
L_6AF9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6AFC: DI = &HC712
L_6AFF: SI = &HC9DC
L_6B02: N_C712! = N_C9DC!  ' RT3F_7B
L_6B05: GOSUB L_183B
L_6B08: DI = &HC18C
L_6B0B: FAC! = FAC! * N_C18C!  ' RT3F_91
L_6B0E: BX = DI
L_6B10: DI = &HC70A
L_6B13: SI = &HC9DC
L_6B16: N_C70A! = N_C9DC!  ' RT3F_7B
L_6B19: T_03! = FAC!  ' RT3F_71; inline=&H83
L_6B1D: GOSUB L_17F8
L_6B20: DI = &HC18C
L_6B23: FAC! = FAC! * N_C18C!  ' RT3F_91
L_6B26: FAC! = T_03! + FAC!  ' RT3F_85; inline=&H83
L_6B2A: DI = &HD170
L_6B2D: FAC! = FAC! + N_D170!  ' RT3F_81
L_6B30: BX = DI
L_6B32: DI = &HD134
L_6B35: FAC! = FAC! + N_D134!  ' RT3F_81
L_6B38: DI = &HCE34
L_6B3B: FAC! = FAC! + N_CE34!  ' RT3F_81
L_6B3E: DI = BX
L_6B40: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6B43: DI = &HBAF4
L_6B46: SI = &HD170
L_6B49: CompareLeft! = N_D170!: CompareRight! = N_BAF4!  ' RT3F_9F
L_6B4C: IF CompareLeft! < CompareRight! THEN GOTO L_6B51  ' flags from L_6B49
L_6B4E: GOTO L_6B59
L_6B51: SWAP DI, SI
L_6B53: N(DI) = N(SI)  ' RT3F_7B
L_6B56: GOTO L_6B6C
L_6B59: DI = &HC1B8
L_6B5C: SI = &HD170
L_6B5F: CompareLeft! = N_D170!: CompareRight! = N_C1B8!  ' RT3F_9F
L_6B62: IF CompareLeft! > CompareRight! THEN GOTO L_6B67  ' flags from L_6B5F
L_6B64: GOTO L_6B6C
L_6B67: SWAP DI, SI
L_6B69: N(DI) = N(SI)  ' RT3F_7B
L_6B6C: GOSUB L_2EFC
L_6B6F: BX = &H14
L_6B72: ARGPUSH BX  ' RT3E_42
L_6B75: BX = 2
L_6B78: LOCATE ARGS(), BX  ' RT3E_44
L_6B7B: ' PRINT statement begins ; RT3F_BC
L_6B7E: SI = &HC762
L_6B81: BX = CINT(N_C762!)  ' RT3F_75
L_6B84: BX = BX * (2 ^ 1)
L_6B86: BX = BX * (2 ^ 1)
L_6B88: BX = BX + &H4288
L_6B8C: PRINT S(BX);  ' RT3F_6A
L_6B8F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6B92: SI = &HC984
L_6B95: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_6B98: IF CompareLeft! = CompareRight! THEN GOTO L_6B9D  ' flags from L_6B95
L_6B9A: GOTO L_6BAC
L_6B9D: ' PRINT statement begins ; RT3F_BC
L_6BA0: BX = &HD174
L_6BA3: PRINT S_D174$  ' RT3F_6E; H newline item, ledger correction
L_6BA6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6BA9: GOTO L_6BEB
L_6BAC: DI = &HC184
L_6BAF: SI = &HC984
L_6BB2: CompareLeft! = N_C984!: CompareRight! = N_C184!  ' RT3F_9F
L_6BB5: BX = 0
L_6BB8: IF CompareLeft! >= CompareRight! THEN GOTO L_6BBB  ' flags from L_6BB2
L_6BBA: BX = BX - 1
L_6BBB: DI = &HC10C
L_6BBE: CompareLeft! = N(SI): CompareRight! = N_C10C!  ' RT3F_9F
L_6BC1: DX = 0
L_6BC4: IF CompareLeft! <= CompareRight! THEN GOTO L_6BC7  ' flags from L_6BBE
L_6BC6: DX = DX - 1
L_6BC7: DX = DX AND BX
L_6BC9: CompareLeft% = DX: CompareRight% = 0
L_6BCB: IF CompareLeft% <> CompareRight% THEN GOTO L_6BD0  ' flags from L_6BC9
L_6BCD: GOTO L_6BDF
L_6BD0: ' PRINT statement begins ; RT3F_BC
L_6BD3: BX = &HD180
L_6BD6: PRINT S_D180$  ' RT3F_6E; H newline item, ledger correction
L_6BD9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6BDC: GOTO L_6BEB
L_6BDF: ' PRINT statement begins ; RT3F_BC
L_6BE2: BX = &HD18A
L_6BE5: PRINT S_D18A$  ' RT3F_6E; H newline item, ledger correction
L_6BE8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6BEB: BX = &H15
L_6BEE: ARGPUSH BX  ' RT3E_42
L_6BF1: BX = 2
L_6BF4: LOCATE ARGS(), BX  ' RT3E_44
L_6BF7: SI = &HC984
L_6BFA: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_6BFD: IF CompareLeft! > CompareRight! THEN GOTO L_6C02  ' flags from L_6BFA
L_6BFF: GOTO L_6C2F
L_6C02: ' PRINT statement begins ; RT3F_BC
L_6C05: SI = &HC94A
L_6C08: BX = CINT(N_C94A!)  ' RT3F_75
L_6C0B: SI = BX
L_6C0D: SI = SI * (2 ^ 1)
L_6C0F: SI = SI * (2 ^ 1)
L_6C11: SI = SI + &H1850
L_6C15: DI = &HC6B0
L_6C18: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_6C1B: BX = CINT(FAC!)  ' RT3F_77
L_6C1E: BX = BX * (2 ^ 1)
L_6C20: BX = BX * (2 ^ 1)
L_6C22: BX = BX + &H43F4
L_6C26: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_6C29: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6C2C: GOTO L_6C80
L_6C2F: DI = &HC110
L_6C32: SI = &HC1B8
L_6C35: N_C110! = N_C1B8!  ' RT3F_7B
L_6C38: DI = &HC114
L_6C3B: SI = &HC762
L_6C3E: N_C114! = N_C762!  ' RT3F_7B
L_6C41: GOSUB L_06A9
L_6C44: DI = &HC6B0
L_6C47: FAC! = FAC! + N_C6B0!  ' RT3F_81
L_6C4A: DI = &HD194
L_6C4D: N_D194! = FAC!: SI = &H001A  ' RT3F_7D
L_6C50: SI = DI
L_6C52: CompareLeft! = N_D194!: CompareRight! = 0  ' RT3F_A7
L_6C55: IF CompareLeft! < CompareRight! THEN GOTO L_6C5A  ' flags from L_6C52
L_6C57: GOTO L_6C69
L_6C5A: ' PRINT statement begins ; RT3F_BC
L_6C5D: BX = &HD198
L_6C60: PRINT S_D198$  ' RT3F_6E; H newline item, ledger correction
L_6C63: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6C66: GOTO L_6C80
L_6C69: ' PRINT statement begins ; RT3F_BC
L_6C6C: SI = &HD194
L_6C6F: BX = CINT(N_D194!)  ' RT3F_75
L_6C72: BX = BX * (2 ^ 1)
L_6C74: BX = BX * (2 ^ 1)
L_6C76: BX = BX + &H44CC
L_6C7A: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_6C7D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6C80: DI = &HD1A0
L_6C83: SI = &HC6B4
L_6C86: N_D1A0! = N_C6B4!  ' RT3F_7B
L_6C89: DI = &HCB06
L_6C8C: N_CB06! = N_C6B4!  ' RT3F_7B
L_6C8F: DI = &HD1A4
L_6C92: N_D1A4! = N_C6B4!  ' RT3F_7B
L_6C95: DI = &HD1A8
L_6C98: N_D1A8! = N_C6B4!  ' RT3F_7B
L_6C9B: DI = &HCA4E
L_6C9E: N_CA4E! = N_C6B4!  ' RT3F_7B
L_6CA1: DI = &HD1AC
L_6CA4: N_D1AC! = N_C6B4!  ' RT3F_7B
L_6CA7: DI = SI
L_6CA9: SI = &HC984
L_6CAC: CompareLeft! = N_C984!: CompareRight! = N_C6B4!  ' RT3F_9F
L_6CAF: BX = 0
L_6CB2: IF CompareLeft! <> CompareRight! THEN GOTO L_6CB5  ' flags from L_6CAC
L_6CB4: BX = BX - 1
L_6CB5: CompareLeft% = BX: CompareRight% = 0
L_6CB7: IF CompareLeft% >= CompareRight% THEN GOTO L_6CBB  ' flags from L_6CB5
L_6CB9: BX = -BX
L_6CBB: FAC! = CSNG(BX)  ' RT3F_57
L_6CBE: DI = &HD1B0
L_6CC1: N_D1B0! = FAC!: SI = &H001A  ' RT3F_7D
L_6CC4: DI = &HD1B4
L_6CC7: SI = &H804E
L_6CCA: N_D1B4! = N_804E!  ' RT3F_7B
L_6CCD: SI = &HC984
L_6CD0: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_6CD3: IF CompareLeft! > CompareRight! THEN GOTO L_6CD8  ' flags from L_6CD0
L_6CD5: GOTO L_6CF7
L_6CD8: BX = DI
L_6CDA: DI = &H9412
L_6CDD: SI = &HC94A
L_6CE0: FAC! = N_C94A! + N_9412!  ' RT3F_7F
L_6CE3: DX = BX
L_6CE5: BX = CINT(FAC!)  ' RT3F_77
L_6CE8: SI = BX
L_6CEA: SI = SI * (2 ^ 1)
L_6CEC: SI = SI * (2 ^ 1)
L_6CEE: SI = SI + &H1850
L_6CF2: DI = DX
L_6CF4: N(DI) = N(SI)  ' RT3F_7B
L_6CF7: DI = &HC194
L_6CFA: SI = &HD04A
L_6CFD: CompareLeft! = N_D04A!: CompareRight! = N_C194!  ' RT3F_9F
L_6D00: BX = 0
L_6D03: IF CompareLeft! <> CompareRight! THEN GOTO L_6D06  ' flags from L_6CFD
L_6D05: BX = BX - 1
L_6D06: BX = BX - 1
L_6D07: BX = -BX
L_6D09: FAC! = CSNG(BX)  ' RT3F_57
L_6D0C: DI = &HD1B4
L_6D0F: FAC! = FAC! * N_D1B4!  ' RT3F_91
L_6D12: DI = &HD1B8
L_6D15: N_D1B8! = FAC!: SI = &H001A  ' RT3F_7D
L_6D18: SI = &H804E
L_6D1B: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_6D1E: GOTO L_6DE4
L_6D21: ' Alignment NOP
L_6D22: SI = &HD1B0
L_6D25: CompareLeft! = N_D1B0!: CompareRight! = 0  ' RT3F_A7
L_6D28: BX = 0
L_6D2B: IF CompareLeft! <> CompareRight! THEN GOTO L_6D2E  ' flags from L_6D25
L_6D2D: BX = BX - 1
L_6D2E: DI = &HBB56
L_6D31: SI = &HC94A
L_6D34: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_6D37: DX = BX
L_6D39: BX = CINT(FAC!)  ' RT3F_77
L_6D3C: SI = BX
L_6D3E: SI = SI * (2 ^ 1)
L_6D40: SI = SI * (2 ^ 1)
L_6D42: SI = SI + &H1850
L_6D46: DI = &H804E
L_6D49: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_6D4C: BX = 0
L_6D4F: IF CompareLeft! >= CompareRight! THEN GOTO L_6D52  ' flags from L_6D49
L_6D51: BX = BX - 1
L_6D52: BX = BX AND DX
L_6D54: CompareLeft% = BX: CompareRight% = 0
L_6D56: IF CompareLeft% = CompareRight% THEN GOTO L_6D5B  ' flags from L_6D54
L_6D58: GOTO L_6DDB
L_6D5B: SI = &HD1B0
L_6D5E: CompareLeft! = N_D1B0!: CompareRight! = 0  ' RT3F_A7
L_6D61: IF CompareLeft! = CompareRight! THEN GOTO L_6D66  ' flags from L_6D5E
L_6D63: GOTO L_6D89
L_6D66: DI = &HBB56
L_6D69: SI = &HC94A
L_6D6C: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_6D6F: BX = CINT(FAC!)  ' RT3F_77
L_6D72: DI = BX
L_6D74: DI = DI * (2 ^ 1)
L_6D76: DI = DI * (2 ^ 1)
L_6D78: DI = DI + &H1850
L_6D7C: SI = DI
L_6D7E: DI = &HC6B0
L_6D81: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_6D84: DI = SI
L_6D86: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6D89: FAC! = RND  ' RT3D_34
L_6D8C: DI = &HBB9E
L_6D8F: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_6D92: DI = &HD170
L_6D95: CompareLeft! = FAC!: CompareRight! = N_D170!  ' RT3F_A1
L_6D98: BX = 0
L_6D9B: IF CompareLeft! >= CompareRight! THEN GOTO L_6D9E  ' flags from L_6D95
L_6D9D: BX = BX - 1
L_6D9E: CompareLeft% = BX: CompareRight% = 0
L_6DA0: IF CompareLeft% >= CompareRight% THEN GOTO L_6DA4  ' flags from L_6D9E
L_6DA2: BX = -BX
L_6DA4: FAC! = CSNG(BX)  ' RT3F_57
L_6DA7: DI = &HD1BC
L_6DAA: N_D1BC! = FAC!: SI = &H001A  ' RT3F_7D
L_6DAD: SI = DI
L_6DAF: DI = &H804E
L_6DB2: CompareLeft! = N_D1BC!: CompareRight! = N_804E!  ' RT3F_9F
L_6DB5: IF CompareLeft! = CompareRight! THEN GOTO L_6DBA  ' flags from L_6DB2
L_6DB7: GOTO L_6DCF
L_6DBA: SI = &HD1A0
L_6DBD: FAC! = N_D1A0! + N(DI)  ' RT3F_7F
L_6DC0: SWAP SI, DI
L_6DC2: BX = SI
L_6DC4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6DC7: SI = BX
L_6DC9: DI = &HD12C
L_6DCC: N_D12C! = N(SI)  ' RT3F_7B
L_6DCF: DI = &HC97C
L_6DD2: SI = &HBB46
L_6DD5: N_C97C! = N_BB46!  ' RT3F_7B
L_6DD8: GOSUB L_81EB
L_6DDB: DI = &H804E
L_6DDE: SI = &HD1C0
L_6DE1: FAC! = N_D1C0! + N_804E!  ' RT3F_7F
L_6DE4: DI = &HD1C0
L_6DE7: N_D1C0! = FAC!: SI = &H001A  ' RT3F_7D
L_6DEA: SI = DI
L_6DEC: DI = &HD1B8
L_6DEF: CompareLeft! = N_D1C0!: CompareRight! = N_D1B8!  ' RT3F_9F
L_6DF2: IF CompareLeft! > CompareRight! THEN GOTO L_6DF7  ' flags from L_6DEF
L_6DF4: GOTO L_6D22
L_6DF7: BX = &H16
L_6DFA: ARGPUSH BX  ' RT3E_42
L_6DFD: BX = 2
L_6E00: LOCATE ARGS(), BX  ' RT3E_44
L_6E03: ' PRINT statement begins ; RT3F_BC
L_6E06: BX = &HD1C4
L_6E09: PRINT S_D1C4$;  ' RT3F_6A
L_6E0C: BX = &HD1A0
L_6E0F: PRINT N_D1A0!;  ' RT3F_67; H expanded ledger
L_6E12: BX = &HD1CE
L_6E15: PRINT S_D1CE$  ' RT3F_6E; H newline item, ledger correction
L_6E18: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6E1B: DI = &H804E
L_6E1E: SI = &HD1A0
L_6E21: CompareLeft! = N_D1A0!: CompareRight! = N_804E!  ' RT3F_9F
L_6E24: IF CompareLeft! >= CompareRight! THEN GOTO L_6E29  ' flags from L_6E21
L_6E26: GOTO L_6F16
L_6E29: BX = &H17
L_6E2C: ARGPUSH BX  ' RT3E_42
L_6E2F: BX = 2
L_6E32: LOCATE ARGS(), BX  ' RT3E_44
L_6E35: SI = &HD1AC
L_6E38: CompareLeft! = N_D1AC!: CompareRight! = 0  ' RT3F_A7
L_6E3B: IF CompareLeft! > CompareRight! THEN GOTO L_6E40  ' flags from L_6E38
L_6E3D: GOTO L_6E5A
L_6E40: ' PRINT statement begins ; RT3F_BC
L_6E43: BX = &HD1EE
L_6E46: PRINT S_D1EE$;  ' RT3F_6A
L_6E49: BX = SI
L_6E4B: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_6E4E: BX = &HD1D8
L_6E51: PRINT S_D1D8$  ' RT3F_6E; H newline item, ledger correction
L_6E54: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6E57: GOTO L_6E71
L_6E5A: SI = &HCB06
L_6E5D: CompareLeft! = N_CB06!: CompareRight! = 0  ' RT3F_A7
L_6E60: IF CompareLeft! > CompareRight! THEN GOTO L_6E65  ' flags from L_6E5D
L_6E62: GOTO L_6E71
L_6E65: ' PRINT statement begins ; RT3F_BC
L_6E68: BX = &HD1F6
L_6E6B: PRINT S_D1F6$  ' RT3F_6E; H newline item, ledger correction
L_6E6E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6E71: BX = &H18
L_6E74: ARGPUSH BX  ' RT3E_42
L_6E77: BX = 2
L_6E7A: LOCATE ARGS(), BX  ' RT3E_44
L_6E7D: DI = &H804E
L_6E80: SI = &HD1A8
L_6E83: CompareLeft! = N_D1A8!: CompareRight! = N_804E!  ' RT3F_9F
L_6E86: IF CompareLeft! > CompareRight! THEN GOTO L_6E8B  ' flags from L_6E83
L_6E88: GOTO L_6EA6
L_6E8B: ' PRINT statement begins ; RT3F_BC
L_6E8E: DI = &HC980
L_6E91: FAC! = N(SI) + N_C980!  ' RT3F_7F
L_6E94: BX = CINT(FAC!)  ' RT3F_77
L_6E97: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_6E9A: PRINT S(BX);  ' RT3F_6A
L_6E9D: BX = &HC6C8
L_6EA0: PRINT S_C6C8$;  ' RT3F_6A
L_6EA3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6EA6: SI = &HD1A8
L_6EA9: CompareLeft! = N_D1A8!: CompareRight! = 0  ' RT3F_A7
L_6EAC: IF CompareLeft! > CompareRight! THEN GOTO L_6EB1  ' flags from L_6EA9
L_6EAE: GOTO L_6EE5
L_6EB1: ' PRINT statement begins ; RT3F_BC
L_6EB4: BX = SI
L_6EB6: SI = &HC9DC
L_6EB9: DX = BX
L_6EBB: BX = CINT(N_C9DC!)  ' RT3F_75
L_6EBE: BX = BX * (2 ^ 1)
L_6EC0: BX = BX * (2 ^ 1)
L_6EC2: BX = BX + &HC1E8
L_6EC6: PRINT S(BX);  ' RT3F_6A
L_6EC9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6ECC: SI = DX
L_6ECE: DI = &H804E
L_6ED1: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_6ED4: IF CompareLeft! > CompareRight! THEN GOTO L_6ED9  ' flags from L_6ED1
L_6ED6: GOTO L_6EE5
L_6ED9: ' PRINT statement begins ; RT3F_BC
L_6EDC: BX = &HC6EA
L_6EDF: PRINT S_C6EA$;  ' RT3F_6A
L_6EE2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6EE5: SI = &HD1A8
L_6EE8: CompareLeft! = N_D1A8!: CompareRight! = 0  ' RT3F_A7
L_6EEB: IF CompareLeft! > CompareRight! THEN GOTO L_6EF0  ' flags from L_6EE8
L_6EED: GOTO L_6EFF
L_6EF0: ' PRINT statement begins ; RT3F_BC
L_6EF3: BX = &HD210
L_6EF6: PRINT S_D210$;  ' RT3F_6A
L_6EF9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6EFC: GOTO L_6F16
L_6EFF: SI = &HCA4E
L_6F02: CompareLeft! = N_CA4E!: CompareRight! = 0  ' RT3F_A7
L_6F05: IF CompareLeft! > CompareRight! THEN GOTO L_6F0A  ' flags from L_6F02
L_6F07: GOTO L_6F16
L_6F0A: ' PRINT statement begins ; RT3F_BC
L_6F0D: BX = &HD21C
L_6F10: PRINT S_D21C$;  ' RT3F_6A
L_6F13: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6F16: DI = &HD234
L_6F19: SI = &HC7E6
L_6F1C: N_D234! = N_C7E6!  ' RT3F_7B
L_6F1F: SI = &H804E
L_6F22: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_6F25: GOTO L_6F34
L_6F28: GOSUB L_2913
L_6F2B: DI = &H804E
L_6F2E: SI = &HBA90
L_6F31: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_6F34: DI = &HBA90
L_6F37: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_6F3A: SI = DI
L_6F3C: DI = &HD234
L_6F3F: CompareLeft! = N_BA90!: CompareRight! = N_D234!  ' RT3F_9F
L_6F42: IF CompareLeft! <= CompareRight! THEN GOTO L_6F28  ' flags from L_6F3F
L_6F44: DI = &H804E
L_6F47: SI = &HC762
L_6F4A: FAC! = N_C762! + N_804E!  ' RT3F_7F
L_6F4D: DI = &HC762
L_6F50: N_C762! = FAC!: SI = &H001A  ' RT3F_7D
L_6F53: SI = DI
L_6F55: DI = &HC10C
L_6F58: CompareLeft! = N_C762!: CompareRight! = N_C10C!  ' RT3F_9F
L_6F5B: IF CompareLeft! > CompareRight! THEN GOTO L_6F60  ' flags from L_6F58
L_6F5D: GOTO L_65AA
L_6F60: SI = &HC932
L_6F63: CompareLeft! = N_C932!: CompareRight! = 0  ' RT3F_A7
L_6F66: BX = 0
L_6F69: IF CompareLeft! <> CompareRight! THEN GOTO L_6F6C  ' flags from L_6F63
L_6F6B: BX = BX - 1
L_6F6C: DI = &H804E
L_6F6F: SI = &HBAEC
L_6F72: CompareLeft! = N_BAEC!: CompareRight! = N_804E!  ' RT3F_9F
L_6F75: DX = 0
L_6F78: IF CompareLeft! <> CompareRight! THEN GOTO L_6F7B  ' flags from L_6F72
L_6F7A: DX = DX - 1
L_6F7B: DX = DX OR BX
L_6F7D: CompareLeft% = DX: CompareRight% = 0
L_6F7F: IF CompareLeft% = CompareRight% THEN GOTO L_6F84  ' flags from L_6F7D
L_6F81: GOTO L_70A5
L_6F84: DI = &HD238
L_6F87: SI = &HC0F4
L_6F8A: N_D238! = N_C0F4!  ' RT3F_7B
L_6F8D: DI = &HC6B0
L_6F90: SI = &HC63C
L_6F93: FAC! = N_C63C! + N_C6B0!  ' RT3F_7F
L_6F96: DI = &HD23C
L_6F99: N_D23C! = FAC!: SI = &H001A  ' RT3F_7D
L_6F9C: SI = &HC6B4
L_6F9F: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_6FA2: GOTO L_7092
L_6FA5: ' Alignment NOP
L_6FA6: SI = &HD240
L_6FA9: BX = CINT(N_D240!)  ' RT3F_75
L_6FAC: SI = BX
L_6FAE: SI = SI * (2 ^ 1)
L_6FB0: SI = SI * (2 ^ 1)
L_6FB2: SI = SI + &HC560
L_6FB6: DI = &HBB56
L_6FB9: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_6FBC: IF CompareLeft! >= CompareRight! THEN GOTO L_6FC1  ' flags from L_6FB9
L_6FBE: GOTO L_7089
L_6FC1: SI = &HD240
L_6FC4: BX = CINT(N_D240!)  ' RT3F_75
L_6FC7: SI = BX
L_6FC9: SI = SI * (2 ^ 1)
L_6FCB: SI = SI * (2 ^ 1)
L_6FCD: SI = SI + &HC604
L_6FD1: DI = &HC6B0
L_6FD4: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_6FD7: DI = &HD244
L_6FDA: N_D244! = FAC!: SI = &H001A  ' RT3F_7D
L_6FDD: SI = &HC6B4
L_6FE0: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_6FE3: GOTO L_7076
L_6FE6: SI = &HD240
L_6FE9: BX = CINT(N_D240!)  ' RT3F_75
L_6FEC: AX = BX
L_6FEE: SI = 5
L_6FF1: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_6FF3: SI = AX
L_6FF5: SI = &HC9E4
L_6FF8: BX = CINT(N_C9E4!)  ' RT3F_75
L_6FFB: BX = BX + AX
L_6FFD: SI = BX
L_6FFF: SI = SI * (2 ^ 1)
L_7001: SI = SI * (2 ^ 1)
L_7003: BX = SI
L_7005: SI = SI + &HC2B8
L_7009: DI = &H804E
L_700C: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_700F: DX = 0
L_7012: IF CompareLeft! >= CompareRight! THEN GOTO L_7015  ' flags from L_700C
L_7014: DX = DX - 1
L_7015: BX = BX + &HC4C8
L_7019: SI = BX
L_701B: DI = &H9412
L_701E: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_7021: CX = 0
L_7024: IF CompareLeft! <> CompareRight! THEN GOTO L_7027  ' flags from L_701E
L_7026: CX = CX - 1
L_7027: CX = CX OR DX
L_7029: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_702C: DX = 0
L_702F: IF CompareLeft! <> CompareRight! THEN GOTO L_7032  ' flags from L_7029
L_7031: DX = DX - 1
L_7032: DX = DX OR CX
L_7034: CompareLeft% = DX: CompareRight% = 0
L_7036: IF CompareLeft% = CompareRight% THEN GOTO L_703B  ' flags from L_7034
L_7038: GOTO L_706D
L_703B: GOSUB L_7151
L_703E: SI = &HD240
L_7041: BX = CINT(N_D240!)  ' RT3F_75
L_7044: AX = BX
L_7046: SI = 5
L_7049: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_704B: SI = AX
L_704D: SI = &HC9E4
L_7050: BX = CINT(N_C9E4!)  ' RT3F_75
L_7053: BX = BX + AX
L_7055: SI = BX
L_7057: SI = SI * (2 ^ 1)
L_7059: SI = SI * (2 ^ 1)
L_705B: SI = SI + &HC4C8
L_705F: DI = &HBB56
L_7062: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_7065: IF CompareLeft! = CompareRight! THEN GOTO L_706A  ' flags from L_7062
L_7067: GOTO L_706D
L_706A: GOSUB L_7151
L_706D: DI = &H804E
L_7070: SI = &HC9E4
L_7073: FAC! = N_C9E4! + N_804E!  ' RT3F_7F
L_7076: DI = &HC9E4
L_7079: N_C9E4! = FAC!: SI = &H001A  ' RT3F_7D
L_707C: SI = DI
L_707E: DI = &HD244
L_7081: CompareLeft! = N_C9E4!: CompareRight! = N_D244!  ' RT3F_9F
L_7084: IF CompareLeft! > CompareRight! THEN GOTO L_7089  ' flags from L_7081
L_7086: GOTO L_6FE6
L_7089: DI = &H804E
L_708C: SI = &HD240
L_708F: FAC! = N_D240! + N_804E!  ' RT3F_7F
L_7092: DI = &HD240
L_7095: N_D240! = FAC!: SI = &H001A  ' RT3F_7D
L_7098: SI = DI
L_709A: DI = &HD23C
L_709D: CompareLeft! = N_D240!: CompareRight! = N_D23C!  ' RT3F_9F
L_70A0: IF CompareLeft! > CompareRight! THEN GOTO L_70A5  ' flags from L_709D
L_70A2: GOTO L_6FA6
L_70A5: DI = &HD14C
L_70A8: SI = &HD150
L_70AB: FAC! = N_D150! + N_D14C!  ' RT3F_7F
L_70AE: DI = &HD150
L_70B1: N_D150! = FAC!: SI = &H001A  ' RT3F_7D
L_70B4: SI = &HD14C
L_70B7: CompareLeft! = N_D14C!: CompareRight! = 0  ' RT3F_A7
L_70BA: IF CompareLeft! < CompareRight! THEN GOTO L_70BF  ' flags from L_70B7
L_70BC: GOTO L_70CC
L_70BF: SI = DI
L_70C1: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_70C4: IF CompareLeft! < CompareRight! THEN GOTO L_70C9  ' flags from L_70C1
L_70C6: GOTO L_658A
L_70C9: GOTO L_70D7
L_70CC: SI = &HD150
L_70CF: CompareLeft! = N_D150!: CompareRight! = 0  ' RT3F_A7
L_70D2: IF CompareLeft! > CompareRight! THEN GOTO L_70D7  ' flags from L_70CF
L_70D4: GOTO L_658A
L_70D7: DI = &HBAEC
L_70DA: SI = &HC1DC
L_70DD: N_BAEC! = N_C1DC!  ' RT3F_7B
L_70E0: DI = &H804E
L_70E3: SI = &HD12C
L_70E6: CompareLeft! = N_D12C!: CompareRight! = N_804E!  ' RT3F_9F
L_70E9: IF CompareLeft! = CompareRight! THEN GOTO L_70EE  ' flags from L_70E6
L_70EB: GOTO L_70F6
L_70EE: SI = DI
L_70F0: DI = &HC932
L_70F3: N_C932! = N(SI)  ' RT3F_7B
L_70F6: FAC! = RND  ' RT3D_34
L_70F9: DI = &HBB9E
L_70FC: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_70FF: DI = &HD138

```

### Enemy action resolution

```basic
L_7102: SI = &HC66C
L_7105: T_03! = FAC!  ' RT3F_71; inline=&H83
L_7109: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_710C: DI = &HD248
L_710F: BX = SI
L_7111: FAC! = FAC! + N_D248!  ' RT3F_81
L_7114: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_7118: DX = 0
L_711B: IF CompareLeft! >= CompareRight! THEN GOTO L_711E  ' flags from L_7114
L_711D: DX = DX - 1
L_711E: DI = &H9412
L_7121: SI = &HBAEC
L_7124: CompareLeft! = N_BAEC!: CompareRight! = N_9412!  ' RT3F_9F
L_7127: CX = 0
L_712A: IF CompareLeft! <> CompareRight! THEN GOTO L_712D  ' flags from L_7124
L_712C: CX = CX - 1
L_712D: SI = BX
L_712F: DI = &H804E
L_7132: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_7135: AX = 0
L_7138: IF CompareLeft! <= CompareRight! THEN GOTO L_713B  ' flags from L_7132
L_713A: AX = AX - 1
L_713B: AX = AX AND CX
L_713D: AX = AX OR DX
L_713F: CompareLeft% = AX: CompareRight% = 0
L_7141: IF CompareLeft% <> CompareRight% THEN GOTO L_7146  ' flags from L_713F
L_7143: GOTO L_714E
L_7146: SI = DI
L_7148: DI = &HC932
L_714B: N_C932! = N(SI)  ' RT3F_7B
L_714E: GOTO L_3570
L_7151: DI = &HC9DC
L_7154: SI = &HD240
L_7157: N_C9DC! = N_D240!  ' RT3F_7B
L_715A: SI = &HD240
L_715D: BX = CINT(N_D240!)  ' RT3F_75
L_7160: AX = BX
L_7162: SI = 5
L_7165: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_7167: SI = AX
L_7169: SI = &HC9E4
L_716C: BX = CINT(N_C9E4!)  ' RT3F_75
L_716F: BX = BX + AX
L_7171: SI = BX
L_7173: SI = SI * (2 ^ 1)
L_7175: SI = SI * (2 ^ 1)
L_7177: SI = SI + &HC1F8
L_717B: FAC! = ABS(N(SI))  ' RT3F_2B
L_717E: DI = &HD150
L_7181: CompareLeft! = FAC!: CompareRight! = N_D150!  ' RT3F_A1
L_7184: IF CompareLeft! < CompareRight! THEN GOTO L_7189  ' flags from L_7181
L_7186: GOTO L_718A
L_7189: RETURN
L_718A: SI = &HD240
L_718D: BX = SI
L_718F: DX = BX
L_7191: BX = CINT(N_D240!)  ' RT3F_75
L_7194: AX = BX
L_7196: SI = 5
L_7199: CX = DX
L_719B: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_719D: SI = AX
L_719F: SI = &HC9E4
L_71A2: BX = CINT(N_C9E4!)  ' RT3F_75
L_71A5: BX = BX + AX
L_71A7: SI = BX
L_71A9: SI = SI * (2 ^ 1)
L_71AB: SI = SI * (2 ^ 1)
L_71AD: BX = SI
L_71AF: SI = SI + &HC428
L_71B3: DI = &HD24C
L_71B6: N_D24C! = N(SI)  ' RT3F_7B
L_71B9: SI = CX
L_71BB: DI = &HC702
L_71BE: N_C702! = N_D240!  ' RT3F_7B
L_71C1: DI = &HC706
L_71C4: SI = &HC0F4
L_71C7: N_C706! = N_C0F4!  ' RT3F_7B
L_71CA: WORD(BP - &HC) = BX
L_71CD: GOSUB L_179F
L_71D0: DI = &HCF0E
L_71D3: N_CF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_71D6: SI = WORD(BP - &HC)
L_71D9: SI = SI + &HC4C8
L_71DD: DI = &HBB56
L_71E0: CompareLeft! = N(SI): CompareRight! = N_BB56!  ' RT3F_9F
L_71E3: IF CompareLeft! <> CompareRight! THEN GOTO L_71E8  ' flags from L_71E0
L_71E5: GOTO L_74A9
L_71E8: SI = &HD240
L_71EB: BX = CINT(N_D240!)  ' RT3F_75
L_71EE: AX = BX
L_71F0: SI = 5
L_71F3: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_71F5: SI = AX
L_71F7: SI = &HC9E4
L_71FA: DX = BX
L_71FC: BX = CINT(N_C9E4!)  ' RT3F_75
L_71FF: BX = BX + AX
L_7201: SI = BX
L_7203: SI = SI * (2 ^ 1)
L_7205: SI = SI * (2 ^ 1)
L_7207: BX = SI
L_7209: SI = SI + &HC3D8
L_720D: DI = DX
L_720F: DI = DI * (2 ^ 1)
L_7211: DI = DI * (2 ^ 1)
L_7213: DX = DI
L_7215: DI = DI + &HC378
L_7219: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_721C: DI = &HD250
L_721F: N_D250! = FAC!: SI = &H001A  ' RT3F_7D
L_7222: CX = BX
L_7224: BX = BX + &HC388
L_7228: SI = BX
L_722A: AX = DX
L_722C: DX = DX + &HC368
L_7230: SWAP DX, DI
L_7232: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_7235: DI = &HD254
L_7238: N_D254! = FAC!: SI = &H001A  ' RT3F_7D
L_723B: CX = CX + &HC478
L_723F: SI = CX
L_7241: AX = AX + &HC358
L_7244: DI = AX
L_7246: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_7249: DI = &HD258
L_724C: N_D258! = FAC!: SI = &H001A  ' RT3F_7D
L_724F: SI = DX
L_7251: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_7254: BX = 0
L_7257: IF CompareLeft! <= CompareRight! THEN GOTO L_725A  ' flags from L_7251
L_7259: BX = BX - 1
L_725A: DI = &HC178
L_725D: SI = &HCF0E
L_7260: CompareLeft! = N_CF0E!: CompareRight! = N_C178!  ' RT3F_9F
L_7263: DX = 0
L_7266: IF CompareLeft! >= CompareRight! THEN GOTO L_7269  ' flags from L_7260
L_7268: DX = DX - 1
L_7269: DX = DX AND BX
L_726B: FAC! = RND  ' RT3D_34
L_726E: DI = &HC6A8
L_7271: CompareLeft! = FAC!: CompareRight! = N_C6A8!  ' RT3F_A1
L_7274: BX = 0
L_7277: IF CompareLeft! >= CompareRight! THEN GOTO L_727A  ' flags from L_7271
L_7279: BX = BX - 1
L_727A: BX = BX AND DX
L_727C: CompareLeft% = BX: CompareRight% = 0
L_727E: IF CompareLeft% <> CompareRight% THEN GOTO L_7283  ' flags from L_727C
L_7280: GOTO L_728F
L_7283: DI = &HD24C
L_7286: SI = &H9412
L_7289: N_D24C! = N_9412!  ' RT3F_7B
L_728C: GOTO L_73D7
L_728F: SI = &HD254
L_7292: CompareLeft! = N_D254!: CompareRight! = 0  ' RT3F_A7
L_7295: BX = 0
L_7298: IF CompareLeft! <= CompareRight! THEN GOTO L_729B  ' flags from L_7292
L_729A: BX = BX - 1
L_729B: DI = &HC10C
L_729E: SI = &HCF0E
L_72A1: CompareLeft! = N_CF0E!: CompareRight! = N_C10C!  ' RT3F_9F
L_72A4: DX = 0
L_72A7: IF CompareLeft! >= CompareRight! THEN GOTO L_72AA  ' flags from L_72A1
L_72A9: DX = DX - 1
L_72AA: DX = DX AND BX
L_72AC: FAC! = RND  ' RT3D_34
L_72AF: DI = &HD25C
L_72B2: CompareLeft! = FAC!: CompareRight! = N_D25C!  ' RT3F_A1
L_72B5: BX = 0
L_72B8: IF CompareLeft! >= CompareRight! THEN GOTO L_72BB  ' flags from L_72B2
L_72BA: BX = BX - 1
L_72BB: BX = BX AND DX
L_72BD: CompareLeft% = BX: CompareRight% = 0
L_72BF: IF CompareLeft% <> CompareRight% THEN GOTO L_72C4  ' flags from L_72BD
L_72C1: GOTO L_72D0
L_72C4: DI = &HD24C
L_72C7: SI = &H804E
L_72CA: N_D24C! = N_804E!  ' RT3F_7B
L_72CD: GOTO L_73D7
L_72D0: SI = &HD258
L_72D3: CompareLeft! = N_D258!: CompareRight! = 0  ' RT3F_A7
L_72D6: BX = 0
L_72D9: IF CompareLeft! > CompareRight! THEN GOTO L_72DC  ' flags from L_72D3
L_72DB: BX = BX - 1
L_72DC: SI = &HD254
L_72DF: CompareLeft! = N_D254!: CompareRight! = 0  ' RT3F_A7
L_72E2: DX = 0
L_72E5: IF CompareLeft! > CompareRight! THEN GOTO L_72E8  ' flags from L_72DF
L_72E7: DX = DX - 1
L_72E8: DX = DX AND BX
L_72EA: SI = &HD250
L_72ED: CompareLeft! = N_D250!: CompareRight! = 0  ' RT3F_A7
L_72F0: BX = 0
L_72F3: IF CompareLeft! > CompareRight! THEN GOTO L_72F6  ' flags from L_72ED
L_72F5: BX = BX - 1
L_72F6: BX = BX AND DX
L_72F8: CompareLeft% = BX: CompareRight% = 0
L_72FA: IF CompareLeft% <> CompareRight% THEN GOTO L_72FF  ' flags from L_72F8
L_72FC: GOTO L_7325
L_72FF: SI = &HC9DC
L_7302: BX = CINT(N_C9DC!)  ' RT3F_75
L_7305: AX = BX
L_7307: DI = 5
L_730A: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_730C: DI = AX
L_730E: SI = &HC9E4
L_7311: BX = CINT(N_C9E4!)  ' RT3F_75
L_7314: DI = DI + BX
L_7316: DI = DI * (2 ^ 1)
L_7318: DI = DI * (2 ^ 1)
L_731A: DI = DI + &HC4C8
L_731E: SI = &HBB46
L_7321: N(DI) = N_BB46!  ' RT3F_7B
L_7324: RETURN
L_7325: SI = &HD24C
L_7328: CompareLeft! = N_D24C!: CompareRight! = 0  ' RT3F_A7
L_732B: BX = 0
L_732E: IF CompareLeft! <> CompareRight! THEN GOTO L_7331  ' flags from L_7328
L_7330: BX = BX - 1
L_7331: DX = SI
L_7333: SI = &HD258
L_7336: CompareLeft! = N_D258!: CompareRight! = 0  ' RT3F_A7
L_7339: CX = 0
L_733C: IF CompareLeft! > CompareRight! THEN GOTO L_733F  ' flags from L_7336
L_733E: CX = CX - 1
L_733F: CX = CX AND BX
L_7341: CompareLeft% = CX: CompareRight% = 0
L_7343: IF CompareLeft% <> CompareRight% THEN GOTO L_7348  ' flags from L_7341
L_7345: GOTO L_7350
L_7348: DI = DX
L_734A: SI = &H804E
L_734D: N(DI) = N_804E!  ' RT3F_7B
L_7350: DI = &H804E
L_7353: SI = &HD24C
L_7356: CompareLeft! = N_D24C!: CompareRight! = N_804E!  ' RT3F_9F
L_7359: BX = 0
L_735C: IF CompareLeft! <> CompareRight! THEN GOTO L_735F  ' flags from L_7356
L_735E: BX = BX - 1
L_735F: DX = SI
L_7361: SI = &HD254
L_7364: CompareLeft! = N_D254!: CompareRight! = 0  ' RT3F_A7
L_7367: CX = 0
L_736A: IF CompareLeft! > CompareRight! THEN GOTO L_736D  ' flags from L_7364
L_736C: CX = CX - 1
L_736D: CX = CX AND BX
L_736F: CompareLeft% = CX: CompareRight% = 0
L_7371: IF CompareLeft% <> CompareRight% THEN GOTO L_7376  ' flags from L_736F
L_7373: GOTO L_737E
L_7376: DI = DX
L_7378: SI = &H9412
L_737B: N(DI) = N_9412!  ' RT3F_7B
L_737E: DI = &H9412
L_7381: SI = &HD24C
L_7384: CompareLeft! = N_D24C!: CompareRight! = N_9412!  ' RT3F_9F
L_7387: BX = 0
L_738A: IF CompareLeft! <> CompareRight! THEN GOTO L_738D  ' flags from L_7384
L_738C: BX = BX - 1
L_738D: DX = SI
L_738F: SI = &HD250
L_7392: CompareLeft! = N_D250!: CompareRight! = 0  ' RT3F_A7
L_7395: CX = 0
L_7398: IF CompareLeft! > CompareRight! THEN GOTO L_739B  ' flags from L_7392
L_739A: CX = CX - 1
L_739B: CX = CX AND BX
L_739D: CompareLeft% = CX: CompareRight% = 0
L_739F: IF CompareLeft% <> CompareRight% THEN GOTO L_73A4  ' flags from L_739D
L_73A1: GOTO L_73AC
L_73A4: DI = DX
L_73A6: SI = &HBB46
L_73A9: N(DI) = N_BB46!  ' RT3F_7B
L_73AC: SI = &HD24C
L_73AF: CompareLeft! = N_D24C!: CompareRight! = 0  ' RT3F_A7
L_73B2: BX = 0
L_73B5: IF CompareLeft! <> CompareRight! THEN GOTO L_73B8  ' flags from L_73AF
L_73B7: BX = BX - 1
L_73B8: DX = SI
L_73BA: SI = &HD258
L_73BD: CompareLeft! = N_D258!: CompareRight! = 0  ' RT3F_A7
L_73C0: CX = 0
L_73C3: IF CompareLeft! > CompareRight! THEN GOTO L_73C6  ' flags from L_73BD
L_73C5: CX = CX - 1
L_73C6: CX = CX AND BX
L_73C8: CompareLeft% = CX: CompareRight% = 0
L_73CA: IF CompareLeft% <> CompareRight% THEN GOTO L_73CF  ' flags from L_73C8
L_73CC: GOTO L_73D7
L_73CF: DI = DX
L_73D1: SI = &H804E
L_73D4: N(DI) = N_804E!  ' RT3F_7B
L_73D7: SI = &HD240
L_73DA: BX = CINT(N_D240!)  ' RT3F_75
L_73DD: AX = BX
L_73DF: SI = 5
L_73E2: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_73E4: SI = AX
L_73E6: SI = &HC9E4
L_73E9: BX = CINT(N_C9E4!)  ' RT3F_75
L_73EC: BX = BX + AX
L_73EE: SI = BX
L_73F0: SI = SI * (2 ^ 1)
L_73F2: SI = SI * (2 ^ 1)
L_73F4: SI = SI + &HC428
L_73F8: DI = &HD24C
L_73FB: CompareLeft! = N(SI): CompareRight! = N_D24C!  ' RT3F_9F
L_73FE: IF CompareLeft! <> CompareRight! THEN GOTO L_7403  ' flags from L_73FB
L_7400: GOTO L_74A9
L_7403: GOSUB L_2EFC
L_7406: BX = &H16
L_7409: ARGPUSH BX  ' RT3E_42
L_740C: BX = 2
L_740F: LOCATE ARGS(), BX  ' RT3E_44
L_7412: ' PRINT statement begins ; RT3F_BC
L_7415: SI = &HC9DC
L_7418: BX = CINT(N_C9DC!)  ' RT3F_75
L_741B: BX = BX * (2 ^ 1)
L_741D: BX = BX * (2 ^ 1)
L_741F: BX = BX + &HC1E8
L_7423: PRINT S(BX);  ' RT3F_6A
L_7426: BX = &HD276
L_7429: PRINT S_D276$;  ' RT3F_6A
L_742C: DI = &HC6E0
L_742F: SI = &HD240
L_7432: FAC! = N_D240! + N_C6E0!  ' RT3F_7F
L_7435: BX = CINT(FAC!)  ' RT3F_77
L_7438: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_743B: PRINT S(BX);  ' RT3F_6A
L_743E: DI = &HCB2E
L_7441: SI = &HC9E4
L_7444: FAC! = N_C9E4! + N_CB2E!  ' RT3F_7F
L_7447: BX = CINT(FAC!)  ' RT3F_77
L_744A: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_744D: PRINT S(BX);  ' RT3F_6A
L_7450: BX = &HD260
L_7453: PRINT S_D260$  ' RT3F_6E; H newline item, ledger correction
L_7456: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7459: SI = &HC9DC
L_745C: BX = CINT(N_C9DC!)  ' RT3F_75
L_745F: AX = BX
L_7461: DI = 5
L_7464: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_7466: DI = AX
L_7468: SI = &HC9E4
L_746B: BX = CINT(N_C9E4!)  ' RT3F_75
L_746E: DI = DI + BX
L_7470: DI = DI * (2 ^ 1)
L_7472: DI = DI * (2 ^ 1)
L_7474: DI = DI + &HC428
L_7478: SI = &HD24C
L_747B: N(DI) = N_D24C!  ' RT3F_7B
L_747E: GOSUB L_9F76
L_7481: SI = &HC9DC
L_7484: BX = CINT(N_C9DC!)  ' RT3F_75
L_7487: AX = BX
L_7489: DI = 5
L_748C: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_748E: DI = AX
L_7490: SI = &HC9E4
L_7493: BX = CINT(N_C9E4!)  ' RT3F_75
L_7496: DI = DI + BX
L_7498: DI = DI * (2 ^ 1)
L_749A: DI = DI * (2 ^ 1)
L_749C: DI = DI + &HC4C8
L_74A0: SI = &H9412
L_74A3: N(DI) = N_9412!  ' RT3F_7B
L_74A6: GOTO L_7F8B
L_74A9: GOSUB L_2EFC
L_74AC: BX = &H14
L_74AF: ARGPUSH BX  ' RT3E_42
L_74B2: BX = 2
L_74B5: LOCATE ARGS(), BX  ' RT3E_44
L_74B8: ' PRINT statement begins ; RT3F_BC
L_74BB: SI = &HD240
L_74BE: DX = SI
L_74C0: CX = BX
L_74C2: BX = CINT(N_D240!)  ' RT3F_75
L_74C5: BX = BX * (2 ^ 1)
L_74C7: BX = BX * (2 ^ 1)
L_74C9: BX = BX + &HC1E8
L_74CD: PRINT S(BX);  ' RT3F_6A
L_74D0: BX = &HD276
L_74D3: PRINT S_D276$;  ' RT3F_6A
L_74D6: SI = DX
L_74D8: DI = &HC6E0
L_74DB: FAC! = N(SI) + N_C6E0!  ' RT3F_7F
L_74DE: BX = CINT(FAC!)  ' RT3F_77
L_74E1: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_74E4: PRINT S(BX);  ' RT3F_6A
L_74E7: DI = &HCB2E
L_74EA: SI = &HC9E4
L_74ED: FAC! = N_C9E4! + N_CB2E!  ' RT3F_7F
L_74F0: BX = CINT(FAC!)  ' RT3F_77
L_74F3: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_74F6: PRINT S(BX);  ' RT3F_6A
L_74F9: BX = &HD27C
L_74FC: PRINT S_D27C$  ' RT3F_6E; H newline item, ledger correction
L_74FF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7502: BX = &H15
L_7505: ARGPUSH BX  ' RT3E_42
L_7508: BX = CX
L_750A: LOCATE ARGS(), BX  ' RT3E_44
L_750D: SI = &HD24C
L_7510: CompareLeft! = N_D24C!: CompareRight! = 0  ' RT3F_A7
L_7513: IF CompareLeft! = CompareRight! THEN GOTO L_7518  ' flags from L_7510
L_7515: GOTO L_75BF
L_7518: ' PRINT statement begins ; RT3F_BC
L_751B: SI = &HC9DC
L_751E: BX = CINT(N_C9DC!)  ' RT3F_75
L_7521: SI = BX
L_7523: SI = SI * (2 ^ 1)
L_7525: SI = SI * (2 ^ 1)
L_7527: DX = SI
L_7529: SI = SI + &HC624
L_752D: CX = SI
L_752F: AX = BX
L_7531: BX = CINT(N(SI))  ' RT3F_75
L_7534: BX = BX * (2 ^ 1)
L_7536: BX = BX * (2 ^ 1)
L_7538: BX = BX + &HBA7C
L_753C: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_753F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7542: DI = 5
L_7545: BX = DX
L_7547: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_7549: DI = AX
L_754B: SI = &HC9E4
L_754E: DX = BX
L_7550: BX = CINT(N_C9E4!)  ' RT3F_75
L_7553: DI = DI + BX
L_7555: DI = DI * (2 ^ 1)
L_7557: DI = DI * (2 ^ 1)
L_7559: BX = DI
L_755B: DI = DI + &HC478
L_755F: SI = DI
L_7561: DI = &HC6B0
L_7564: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_7567: DI = SI
L_7569: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_756C: AX = DX
L_756E: DX = DX + &HC614
L_7572: SI = DX
L_7574: DI = &HC70E
L_7577: N_C70E! = N(SI)  ' RT3F_7B
L_757A: BX = BX + &HC4C8
L_757E: DI = BX
L_7580: SI = BX
L_7582: DI = &H804E
L_7585: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_7588: DX = 0
L_758B: IF CompareLeft! <> CompareRight! THEN GOTO L_758E  ' flags from L_7585
L_758D: DX = DX - 1
L_758E: SWAP CX, SI
L_7590: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_7593: BX = 0
L_7596: IF CompareLeft! <> CompareRight! THEN GOTO L_7599  ' flags from L_7590
L_7598: BX = BX - 1
L_7599: BX = BX AND DX
L_759B: BX = BX - 2
L_759E: BX = -BX
L_75A0: FAC! = CSNG(BX)  ' RT3F_57
L_75A3: DI = CX
L_75A5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_75A8: DI = &HD01A
L_75AB: SI = &HC184
L_75AE: N_D01A! = N_C184!  ' RT3F_7B
L_75B1: AX = AX + &HC358
L_75B4: SI = AX
L_75B6: DI = &HD282
L_75B9: N_D282! = N(SI)  ' RT3F_7B
L_75BC: GOTO L_76A4
L_75BF: DI = &H804E
L_75C2: SI = &HD24C
L_75C5: CompareLeft! = N_D24C!: CompareRight! = N_804E!  ' RT3F_9F
L_75C8: IF CompareLeft! = CompareRight! THEN GOTO L_75CD  ' flags from L_75C5
L_75CA: GOTO L_763A
L_75CD: ' PRINT statement begins ; RT3F_BC
L_75D0: BX = &HD286
L_75D3: PRINT S_D286$  ' RT3F_6E; H newline item, ledger correction
L_75D6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_75D9: SI = &HC9DC
L_75DC: BX = CINT(N_C9DC!)  ' RT3F_75
L_75DF: AX = BX
L_75E1: DI = 5
L_75E4: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_75E6: DI = AX
L_75E8: SI = &HC9E4
L_75EB: DX = BX
L_75ED: BX = CINT(N_C9E4!)  ' RT3F_75
L_75F0: DI = DI + BX
L_75F2: DI = DI * (2 ^ 1)
L_75F4: DI = DI * (2 ^ 1)
L_75F6: BX = DI
L_75F8: DI = DI + &HC388
L_75FC: SI = DI
L_75FE: DI = &HC6B0
L_7601: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_7604: DI = SI
L_7606: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7609: DI = &HC70E
L_760C: SI = &HD2A0
L_760F: N_C70E! = N_D2A0!  ' RT3F_7B
L_7612: BX = BX + &HC4C8
L_7616: DI = BX
L_7618: SI = &H9412
L_761B: N(DI) = N_9412!  ' RT3F_7B
L_761E: DI = &HD01A
L_7621: SI = &HC178
L_7624: N_D01A! = N_C178!  ' RT3F_7B
L_7627: SI = DX
L_7629: SI = SI * (2 ^ 1)
L_762B: SI = SI * (2 ^ 1)
L_762D: SI = SI + &HC368
L_7631: DI = &HD282
L_7634: N_D282! = N(SI)  ' RT3F_7B
L_7637: GOTO L_76A4
L_763A: ' PRINT statement begins ; RT3F_BC
L_763D: BX = &HD2A4
L_7640: PRINT S_D2A4$  ' RT3F_6E; H newline item, ledger correction
L_7643: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7646: SI = &HC9DC
L_7649: BX = CINT(N_C9DC!)  ' RT3F_75
L_764C: AX = BX
L_764E: DI = 5
L_7651: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_7653: DI = AX
L_7655: SI = &HC9E4
L_7658: DX = BX
L_765A: BX = CINT(N_C9E4!)  ' RT3F_75
L_765D: DI = DI + BX
L_765F: DI = DI * (2 ^ 1)
L_7661: DI = DI * (2 ^ 1)
L_7663: BX = DI
L_7665: DI = DI + &HC3D8
L_7669: SI = DI
L_766B: DI = &HC6B0
L_766E: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_7671: DI = SI
L_7673: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7676: DI = &HC70E
L_7679: SI = &HD2BC
L_767C: N_C70E! = N_D2BC!  ' RT3F_7B
L_767F: BX = BX + &HC4C8
L_7683: DI = BX
L_7685: SI = &H9412
L_7688: N(DI) = N_9412!  ' RT3F_7B
L_768B: DI = &HD01A
L_768E: SI = &HC10C
L_7691: N_D01A! = N_C10C!  ' RT3F_7B
L_7694: SI = DX
L_7696: SI = SI * (2 ^ 1)
L_7698: SI = SI * (2 ^ 1)
L_769A: SI = SI + &HC378
L_769E: DI = &HD282
L_76A1: N_D282! = N(SI)  ' RT3F_7B
L_76A4: SI = &H804E
L_76A7: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_76AA: GOTO L_76F9
L_76AD: ' Alignment NOP
L_76AE: FAC! = RND  ' RT3D_34
L_76B1: DI = &HC10C
L_76B4: FAC! = FAC! * N_C10C!  ' RT3F_91
L_76B7: DI = &H804E
L_76BA: FAC! = FAC! + N_804E!  ' RT3F_81
L_76BD: BX = &H1A
L_76C0: FAC! = INT(FAC!)  ' RT3D_03
L_76C3: DI = &HC762
L_76C6: N_C762! = FAC!: SI = &H001A  ' RT3F_7D
L_76C9: BX = DI
L_76CB: DI = &HC110
L_76CE: SI = &HC1C0
L_76D1: N_C110! = N_C1C0!  ' RT3F_7B
L_76D4: SI = BX
L_76D6: DI = &HC114
L_76D9: N_C114! = N_C762!  ' RT3F_7B
L_76DC: GOSUB L_06A9
L_76DF: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_76E2: IF CompareLeft! > CompareRight! THEN GOTO L_76E7  ' flags from L_76DF
L_76E4: GOTO L_76F0
L_76E7: DI = &HD2C0
L_76EA: SI = &HC16C
L_76ED: N_D2C0! = N_C16C!  ' RT3F_7B
L_76F0: DI = &H804E
L_76F3: SI = &HD2C0
L_76F6: FAC! = N_D2C0! + N_804E!  ' RT3F_7F
L_76F9: DI = &HD2C0
L_76FC: N_D2C0! = FAC!: SI = &H001A  ' RT3F_7D
L_76FF: SI = DI
L_7701: DI = &HC194
L_7704: CompareLeft! = N_D2C0!: CompareRight! = N_C194!  ' RT3F_9F
L_7707: IF CompareLeft! <= CompareRight! THEN GOTO L_76AE  ' flags from L_7704
L_7709: DI = &HC70E
L_770C: SI = &HCF0E
L_770F: FAC! = N_CF0E! / N_C70E!  ' RT3F_87
L_7712: BX = &H1A
L_7715: FAC! = INT(FAC!)  ' RT3D_03
L_7718: DI = &HC18C
L_771B: FAC! = FAC! * N_C18C!  ' RT3F_91
L_771E: SI = &HC188
L_7721: FAC! = N_C188! - FAC!  ' RT3F_9B
L_7724: DI = &HC110
L_7727: SI = &HBB4A
L_772A: N_C110! = N_BB4A!  ' RT3F_7B
L_772D: DI = &HC114
L_7730: SI = &HC762
L_7733: N_C114! = N_C762!  ' RT3F_7B
L_7736: T_03! = FAC!  ' RT3F_71; inline=&H83
L_773A: GOSUB L_06A9
L_773D: FAC! = T_03! - FAC!  ' RT3F_9D; inline=&H83
L_7741: DI = &HD130
L_7744: FAC! = FAC! - N_D130!  ' RT3F_99
L_7747: DI = &HD2C4
L_774A: FAC! = FAC! + N_D2C4!  ' RT3F_81
L_774D: DI = &HD170
L_7750: N_D170! = FAC!: SI = &H001A  ' RT3F_7D
L_7753: BX = DI
L_7755: DI = &HC716
L_7758: SI = &HC9DC
L_775B: N_C716! = N_C9DC!  ' RT3F_7B
L_775E: GOSUB L_1875
L_7761: DI = &HC1E0
L_7764: N_C1E0! = FAC!: SI = &H001A  ' RT3F_7D
L_7767: SI = DI
L_7769: DI = &H804E
L_776C: CompareLeft! = N_C1E0!: CompareRight! = N_804E!  ' RT3F_9F
L_776F: BX = 0
L_7772: IF CompareLeft! <= CompareRight! THEN GOTO L_7775  ' flags from L_776C
L_7774: BX = BX - 1
L_7775: DI = &HC0F4
L_7778: CompareLeft! = N(SI): CompareRight! = N_C0F4!  ' RT3F_9F
L_777B: DX = 0
L_777E: IF CompareLeft! >= CompareRight! THEN GOTO L_7781  ' flags from L_7778
L_7780: DX = DX - 1
L_7781: DX = DX AND BX
L_7783: CompareLeft% = DX: CompareRight% = 0
L_7785: IF CompareLeft% <> CompareRight% THEN GOTO L_778A  ' flags from L_7783
L_7787: GOTO L_77A3
L_778A: DI = &HD138
L_778D: FAC! = N(SI) * N_D138!  ' RT3F_8F
L_7790: SI = &HD170
L_7793: FAC! = N_D170! - FAC!  ' RT3F_9B
L_7796: DI = &HD13C
L_7799: BX = SI
L_779B: FAC! = FAC! + N_D13C!  ' RT3F_81
L_779E: DI = BX
L_77A0: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_77A3: DI = &HBAF4
L_77A6: SI = &HD170
L_77A9: CompareLeft! = N_D170!: CompareRight! = N_BAF4!  ' RT3F_9F
L_77AC: IF CompareLeft! < CompareRight! THEN GOTO L_77B1  ' flags from L_77A9
L_77AE: GOTO L_77B9
L_77B1: SWAP DI, SI
L_77B3: N(DI) = N(SI)  ' RT3F_7B
L_77B6: GOTO L_77CC
L_77B9: DI = &HC1B8
L_77BC: SI = &HD170
L_77BF: CompareLeft! = N_D170!: CompareRight! = N_C1B8!  ' RT3F_9F
L_77C2: IF CompareLeft! > CompareRight! THEN GOTO L_77C7  ' flags from L_77BF
L_77C4: GOTO L_77CC
L_77C7: SWAP DI, SI
L_77C9: N(DI) = N(SI)  ' RT3F_7B
L_77CC: DI = &H9412
L_77CF: SI = &HC70E
L_77D2: CompareLeft! = N_C70E!: CompareRight! = N_9412!  ' RT3F_9F
L_77D5: BX = 0
L_77D8: IF CompareLeft! >= CompareRight! THEN GOTO L_77DB  ' flags from L_77D2
L_77DA: BX = BX - 1
L_77DB: SI = &HCF0E
L_77DE: CompareLeft! = N_CF0E!: CompareRight! = N(DI)  ' RT3F_9F
L_77E1: DX = 0
L_77E4: IF CompareLeft! <= CompareRight! THEN GOTO L_77E7  ' flags from L_77DE
L_77E6: DX = DX - 1
L_77E7: DX = DX AND BX
L_77E9: CompareLeft% = DX: CompareRight% = 0
L_77EB: IF CompareLeft% <> CompareRight% THEN GOTO L_77F0  ' flags from L_77E9
L_77ED: GOTO L_77F9
L_77F0: DI = &HD170
L_77F3: SI = &HBB46
L_77F6: N_D170! = N_BB46!  ' RT3F_7B
L_77F9: DI = &HD1BC
L_77FC: SI = &HBB46
L_77FF: N_D1BC! = N_BB46!  ' RT3F_7B
L_7802: BX = DI
L_7804: DI = &HBAF4
L_7807: SI = &HD2C0
L_780A: CompareLeft! = N_D2C0!: CompareRight! = N_BAF4!  ' RT3F_9F
L_780D: DX = 0
L_7810: IF CompareLeft! <= CompareRight! THEN GOTO L_7813  ' flags from L_780A
L_7812: DX = DX - 1
L_7813: FAC! = RND  ' RT3D_34
L_7816: DI = &HBB9E
L_7819: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_781C: DI = &HD170
L_781F: CompareLeft! = FAC!: CompareRight! = N_D170!  ' RT3F_A1
L_7822: CX = 0
L_7825: IF CompareLeft! >= CompareRight! THEN GOTO L_7828  ' flags from L_781F
L_7827: CX = CX - 1
L_7828: CX = CX AND DX
L_782A: CompareLeft% = CX: CompareRight% = 0
L_782C: IF CompareLeft% <> CompareRight% THEN GOTO L_7831  ' flags from L_782A
L_782E: GOTO L_7839
L_7831: DI = BX
L_7833: SI = &H804E
L_7836: N(DI) = N_804E!  ' RT3F_7B
L_7839: SI = &HD24C
L_783C: CompareLeft! = N_D24C!: CompareRight! = 0  ' RT3F_A7
L_783F: BX = 0
L_7842: IF CompareLeft! <= CompareRight! THEN GOTO L_7845  ' flags from L_783C
L_7844: BX = BX - 1
L_7845: SI = &HC9DC
L_7848: DX = BX
L_784A: BX = CINT(N_C9DC!)  ' RT3F_75
L_784D: SI = BX
L_784F: SI = SI * (2 ^ 1)
L_7851: SI = SI * (2 ^ 1)
L_7853: SI = SI + &HC624
L_7857: DI = &H9412
L_785A: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_785D: BX = 0
L_7860: IF CompareLeft! >= CompareRight! THEN GOTO L_7863  ' flags from L_785A
L_7862: BX = BX - 1
L_7863: BX = BX OR DX
L_7865: CompareLeft% = BX: CompareRight% = 0
L_7867: IF CompareLeft% <> CompareRight% THEN GOTO L_786C  ' flags from L_7865
L_7869: GOTO L_7885
L_786C: GOSUB L_7FC1
L_786F: DI = &H804E
L_7872: SI = &HD24C
L_7875: FAC! = N_D24C! + N_804E!  ' RT3F_7F
L_7878: BX = CINT(FAC!)  ' RT3F_77
L_787B: ON BX GOSUB L_9107, L_8CD2, L_8BF2  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_7885: BX = &H16
L_7888: ARGPUSH BX  ' RT3E_42
L_788B: BX = 2
L_788E: LOCATE ARGS(), BX  ' RT3E_44
L_7891: SI = &HD1BC
L_7894: CompareLeft! = N_D1BC!: CompareRight! = 0  ' RT3F_A7
L_7897: IF CompareLeft! = CompareRight! THEN GOTO L_789C  ' flags from L_7894
L_7899: GOTO L_78AB
L_789C: ' PRINT statement begins ; RT3F_BC
L_789F: BX = &HD2C8
L_78A2: PRINT S_D2C8$  ' RT3F_6E; H newline item, ledger correction
L_78A5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_78A8: GOTO L_7F8B
L_78AB: ' PRINT statement begins ; RT3F_BC
L_78AE: BX = &HD2D8
L_78B1: PRINT S_D2D8$  ' RT3F_6E; H newline item, ledger correction
L_78B4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_78B7: FAC! = RND  ' RT3D_34
L_78BA: DI = &HBB56
L_78BD: FAC! = FAC! ^ N_BB56!  ' RT3F_25; M ledger
L_78C0: DI = &HD072
L_78C3: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_78C6: FAC! = RND  ' RT3D_34
L_78C9: BX = DI
L_78CB: DI = &HBB52
L_78CE: CompareLeft! = FAC!: CompareRight! = N_BB52!  ' RT3F_A1
L_78D1: IF CompareLeft! < CompareRight! THEN GOTO L_78D6  ' flags from L_78CE
L_78D3: GOTO L_78E1
L_78D6: DI = BX
L_78D8: SI = &H804E
L_78DB: FAC! = N_804E! - N(DI)  ' RT3F_97
L_78DE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_78E1: FAC! = RND  ' RT3D_34
L_78E4: DI = &HD24C
L_78E7: FAC! = FAC! * N_D24C!  ' RT3F_91
L_78EA: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_78EE: DI = &H804E
L_78F1: FAC! = FAC! + N_804E!  ' RT3F_81
L_78F4: BX = &H1A
L_78F7: FAC! = INT(FAC!)  ' RT3D_03
L_78FA: BX = DI
L_78FC: DI = &HD2E6
L_78FF: N_D2E6! = FAC!: SI = &H001A  ' RT3F_7D

```

### Squad damage and equipment losses

```basic
L_7902: DX = DI
L_7904: DI = &HBB56
L_7907: SI = &HD072
L_790A: FAC! = N_D072! ^ N_BB56!  ' RT3F_23; M ledger
L_790D: DI = &HD2EE
L_7910: T_03! = FAC!  ' RT3F_71; inline=&H83
L_7914: FAC! = N(SI) ^ N(DI)  ' RT3F_23; M ledger
L_7917: FAC! = T_03! + FAC!  ' RT3F_85; inline=&H83
L_791B: DI = DX
L_791D: SI = &HC194
L_7920: T_04! = FAC!  ' RT3F_71; inline=&H84
L_7924: FAC! = N(SI) - N(DI)  ' RT3F_97
L_7927: FAC! = T_04! * FAC!  ' RT3F_95; inline=&H84
L_792B: DI = &HBB52
L_792E: FAC! = FAC! * N_BB52!  ' RT3F_91
L_7931: DI = BX
L_7933: FAC! = FAC! + N(DI)  ' RT3F_81
L_7936: BX = &H1A
L_7939: FAC! = INT(FAC!)  ' RT3D_03
L_793C: BX = DI
L_793E: DI = &HD2EA
L_7941: N_D2EA! = FAC!: SI = &H001A  ' RT3F_7D
L_7944: SWAP BX, DI
L_7946: SI = DX
L_7948: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_794B: IF CompareLeft! = CompareRight! THEN GOTO L_7950  ' flags from L_7948
L_794D: GOTO L_7958
L_7950: DI = BX
L_7952: SI = &HC762
L_7955: N(DI) = N_C762!  ' RT3F_7B
L_7958: GOSUB L_A301
L_795B: DI = &HD2F2
L_795E: SI = &HD2F6
L_7961: N_D2F2! = N_D2F6!  ' RT3F_7B
L_7964: SI = &HD2EA
L_7967: FAC! = N_D2EA!: DI = &H001E  ' RT3F_6F
L_796A: GOTO L_7F78
L_796D: ' Alignment NOP
L_796E: DI = &HC110
L_7971: SI = &HC1C0
L_7974: N_C110! = N_C1C0!  ' RT3F_7B
L_7977: DI = &HC114
L_797A: SI = &HC762
L_797D: N_C114! = N_C762!  ' RT3F_7B
L_7980: GOSUB L_06A9
L_7983: DI = &H804E
L_7986: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_7989: IF CompareLeft! >= CompareRight! THEN GOTO L_798E  ' flags from L_7986
L_798B: GOTO L_7F6F
L_798E: FAC! = RND  ' RT3D_34
L_7991: DI = &HBB52
L_7994: FAC! = FAC! ^ N_BB52!  ' RT3F_25; M ledger
L_7997: DI = &HD282
L_799A: FAC! = FAC! * N_D282!  ' RT3F_91
L_799D: BX = DI
L_799F: DI = &HC110
L_79A2: SI = &HC980
L_79A5: N_C110! = N_C980!  ' RT3F_7B
L_79A8: DI = &HC114
L_79AB: SI = &HC762
L_79AE: N_C114! = N_C762!  ' RT3F_7B
L_79B1: T_03! = FAC!  ' RT3F_71; inline=&H83
L_79B5: GOSUB L_06A9
L_79B8: FAC! = T_03! - FAC!  ' RT3F_9D; inline=&H83
L_79BC: BX = &H1A
L_79BF: FAC! = INT(FAC!)  ' RT3D_03
L_79C2: DI = &HD282
L_79C5: N_D282! = FAC!: SI = &H001A  ' RT3F_7D
L_79C8: BX = &H17
L_79CB: ARGPUSH BX  ' RT3E_42
L_79CE: BX = 2
L_79D1: LOCATE ARGS(), BX  ' RT3E_44
L_79D4: DI = &H804E
L_79D7: SI = &HD282
L_79DA: CompareLeft! = N_D282!: CompareRight! = N_804E!  ' RT3F_9F
L_79DD: IF CompareLeft! < CompareRight! THEN GOTO L_79E2  ' flags from L_79DA
L_79DF: GOTO L_7A02
L_79E2: ' PRINT statement begins ; RT3F_BC
L_79E5: SI = &HC762
L_79E8: BX = CINT(N_C762!)  ' RT3F_75
L_79EB: BX = BX * (2 ^ 1)
L_79ED: BX = BX * (2 ^ 1)
L_79EF: BX = BX + &H4288
L_79F3: PRINT S(BX);  ' RT3F_6A
L_79F6: BX = &HD2FA
L_79F9: PRINT S_D2FA$  ' RT3F_6E; H newline item, ledger correction
L_79FC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_79FF: GOTO L_7F2A
L_7A02: ' PRINT statement begins ; RT3F_BC
L_7A05: SI = &HC762
L_7A08: BX = SI
L_7A0A: DX = BX
L_7A0C: BX = CINT(N_C762!)  ' RT3F_75
L_7A0F: BX = BX * (2 ^ 1)
L_7A11: BX = BX * (2 ^ 1)
L_7A13: BX = BX + &H4288
L_7A17: PRINT S(BX);  ' RT3F_6A
L_7A1A: CX = BX
L_7A1C: BX = &HD31A
L_7A1F: PRINT S_D31A$;  ' RT3F_6A
L_7A22: BX = &HD282
L_7A25: FAC! = INT(N_D282!)  ' RT3D_03
L_7A28: AX = BX
L_7A2A: BX = &H1A
L_7A2D: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_7A30: BX = &HD324
L_7A33: PRINT S_D324$  ' RT3F_6E; H newline item, ledger correction
L_7A36: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7A39: BX = &H18
L_7A3C: ARGPUSH BX  ' RT3E_42
L_7A3F: BX = 2
L_7A42: LOCATE ARGS(), BX  ' RT3E_44
L_7A45: DI = &HC110
L_7A48: SI = &HC1BC
L_7A4B: N_C110! = N_C1BC!  ' RT3F_7B
L_7A4E: SWAP DX, SI
L_7A50: DI = &HC114
L_7A53: N_C114! = N(SI)  ' RT3F_7B
L_7A56: WORD(BP - &HC) = CX
L_7A59: GOSUB L_06A9
L_7A5C: DI = &HD282
L_7A5F: FAC! = FAC! - N_D282!  ' RT3F_99
L_7A62: DI = &HD344
L_7A65: N_D344! = FAC!: SI = &H001A  ' RT3F_7D
L_7A68: SI = DI
L_7A6A: DI = &H804E
L_7A6D: CompareLeft! = N_D344!: CompareRight! = N_804E!  ' RT3F_9F
L_7A70: IF CompareLeft! < CompareRight! THEN GOTO L_7A75  ' flags from L_7A6D
L_7A72: GOTO L_7B5E
L_7A75: BX = DI
L_7A77: DI = &HC120
L_7A7A: SI = &HC1BC
L_7A7D: N_C120! = N_C1BC!  ' RT3F_7B
L_7A80: DX = DI
L_7A82: DI = &HC124
L_7A85: SI = &HC762
L_7A88: N_C124! = N_C762!  ' RT3F_7B
L_7A8B: GOSUB L_06DB
L_7A8E: BX = CINT(FAC!)  ' RT3F_77
L_7A91: DI = BX
L_7A93: DI = DI * (2 ^ 1)
L_7A95: DI = DI * (2 ^ 1)
L_7A97: DI = DI + &H1850
L_7A9B: SI = &HD348
L_7A9E: N(DI) = N_D348!  ' RT3F_7B
L_7AA1: DI = &HC120
L_7AA4: SI = &HC1C0
L_7AA7: N_C120! = N_C1C0!  ' RT3F_7B
L_7AAA: BX = DI
L_7AAC: DI = &HC124
L_7AAF: SI = &HC762
L_7AB2: N_C124! = N_C762!  ' RT3F_7B
L_7AB5: GOSUB L_06DB
L_7AB8: BX = CINT(FAC!)  ' RT3F_77
L_7ABB: DI = BX
L_7ABD: DI = DI * (2 ^ 1)
L_7ABF: DI = DI * (2 ^ 1)
L_7AC1: DI = DI + &H1850
L_7AC5: SI = &HD34C
L_7AC8: N(DI) = N_D34C!  ' RT3F_7B
L_7ACB: DI = &HC120
L_7ACE: SI = &HCA72
L_7AD1: N_C120! = N_CA72!  ' RT3F_7B
L_7AD4: DI = &HC124
L_7AD7: SI = &HC762
L_7ADA: N_C124! = N_C762!  ' RT3F_7B
L_7ADD: GOSUB L_06DB
L_7AE0: BX = CINT(FAC!)  ' RT3F_77
L_7AE3: DI = BX
L_7AE5: DI = DI * (2 ^ 1)
L_7AE7: DI = DI * (2 ^ 1)
L_7AE9: DI = DI + &H1850
L_7AED: SI = &HD006
L_7AF0: N(DI) = N_D006!  ' RT3F_7B
L_7AF3: ' PRINT statement begins ; RT3F_BC
L_7AF6: BX = WORD(BP - &HC)
L_7AF9: PRINT S(BX);  ' RT3F_6A
L_7AFC: BX = &HD33A
L_7AFF: PRINT S_D33A$;  ' RT3F_6A
L_7B02: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7B05: SI = &H804E
L_7B08: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_7B0B: GOTO L_7B4B
L_7B0E: DI = &HC10C
L_7B11: SI = &H9426
L_7B14: FAC! = N_9426! * N_C10C!  ' RT3F_8F
L_7B17: BX = &H384
L_7B1A: DX = &H1A
L_7B1D: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_7B20: BX = &HFFFF
L_7B23: DX = BX
L_7B25: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_7B28: DI = &HD350
L_7B2B: SI = &H9426
L_7B2E: FAC! = N_9426! * N_D350!  ' RT3F_8F
L_7B31: BX = &H7D00
L_7B34: DX = &H1A
L_7B37: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_7B3A: BX = &HFFFF
L_7B3D: DX = BX
L_7B3F: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_7B42: DI = &H804E
L_7B45: SI = &HC942
L_7B48: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_7B4B: DI = &HC942
L_7B4E: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_7B51: SI = DI
L_7B53: DI = &HBA94
L_7B56: CompareLeft! = N_C942!: CompareRight! = N_BA94!  ' RT3F_9F
L_7B59: IF CompareLeft! <= CompareRight! THEN GOTO L_7B0E  ' flags from L_7B56
L_7B5B: GOTO L_7EB3
L_7B5E: DI = &HC120
L_7B61: SI = &HC1BC
L_7B64: N_C120! = N_C1BC!  ' RT3F_7B
L_7B67: DI = &HC124
L_7B6A: SI = &HC762
L_7B6D: N_C124! = N_C762!  ' RT3F_7B
L_7B70: GOSUB L_06DB
L_7B73: BX = CINT(FAC!)  ' RT3F_77
L_7B76: DI = BX
L_7B78: DI = DI * (2 ^ 1)
L_7B7A: DI = DI * (2 ^ 1)
L_7B7C: DI = DI + &H1850
L_7B80: BX = &HD344
L_7B83: FAC! = INT(N_D344!)  ' RT3D_03
L_7B86: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7B89: FAC! = RND  ' RT3D_34
L_7B8C: DI = &HBB9E
L_7B8F: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_7B92: BX = DI
L_7B94: DI = &HC188
L_7B97: CompareLeft! = FAC!: CompareRight! = N_C188!  ' RT3F_A1
L_7B9A: DX = 0
L_7B9D: IF CompareLeft! <= CompareRight! THEN GOTO L_7BA0  ' flags from L_7B97
L_7B9F: DX = DX - 1
L_7BA0: FAC! = RND  ' RT3D_34
L_7BA3: DI = BX
L_7BA5: FAC! = FAC! * N(DI)  ' RT3F_91
L_7BA8: DI = &HBAF4
L_7BAB: SI = &HC762
L_7BAE: T_03! = FAC!  ' RT3F_71; inline=&H83
L_7BB2: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_7BB5: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_7BB9: BX = 0
L_7BBC: IF CompareLeft! <= CompareRight! THEN GOTO L_7BBF  ' flags from L_7BB5
L_7BBE: BX = BX - 1
L_7BBF: BX = BX AND DX
L_7BC1: CompareLeft% = BX: CompareRight% = 0
L_7BC3: IF CompareLeft% = CompareRight% THEN GOTO L_7BC8  ' flags from L_7BC1
L_7BC5: GOTO L_7EC3
L_7BC8: FAC! = RND  ' RT3D_34
L_7BCB: FAC! = FAC! * 2 ^ (3)  ' RT3F_AD; inline=&H03
L_7BCF: DI = &H804E
L_7BD2: FAC! = FAC! + N_804E!  ' RT3F_81
L_7BD5: BX = &H1A
L_7BD8: FAC! = INT(FAC!)  ' RT3D_03
L_7BDB: BX = CINT(FAC!)  ' RT3F_77
L_7BDE: ON BX GOSUB L_7C1D, L_7CB1, L_7D6D, L_7D6D, L_7D6D, L_7DF1, L_7DF1, L_7DF1  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_7BF2: DI = &HC120
L_7BF5: SI = &HCA72
L_7BF8: N_C120! = N_CA72!  ' RT3F_7B
L_7BFB: DI = &HC124
L_7BFE: SI = &HC762
L_7C01: N_C124! = N_C762!  ' RT3F_7B
L_7C04: GOSUB L_06DB
L_7C07: BX = CINT(FAC!)  ' RT3F_77
L_7C0A: DI = BX
L_7C0C: DI = DI * (2 ^ 1)
L_7C0E: DI = DI * (2 ^ 1)
L_7C10: DI = DI + &H1850
L_7C14: SI = &HD006
L_7C17: N(DI) = N_D006!  ' RT3F_7B
L_7C1A: GOTO L_7EC3
L_7C1D: DI = &HC110
L_7C20: SI = &HCA6E
L_7C23: N_C110! = N_CA6E!  ' RT3F_7B
L_7C26: DI = &HC114
L_7C29: SI = &HC762
L_7C2C: N_C114! = N_C762!  ' RT3F_7B
L_7C2F: GOSUB L_06A9
L_7C32: DI = &H804E
L_7C35: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_7C38: IF CompareLeft! < CompareRight! THEN GOTO L_7C3D  ' flags from L_7C35
L_7C3A: GOTO L_7C3E
L_7C3D: RETURN
L_7C3E: ' PRINT statement begins ; RT3F_BC
L_7C41: BX = &HD354
L_7C44: PRINT S_D354$;  ' RT3F_6A
L_7C47: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7C4A: DI = &HC120
L_7C4D: SI = &HD378
L_7C50: N_C120! = N_D378!  ' RT3F_7B
L_7C53: DI = &HC124
L_7C56: SI = &HC762
L_7C59: N_C124! = N_C762!  ' RT3F_7B
L_7C5C: GOSUB L_06DB
L_7C5F: DI = &HD072
L_7C62: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_7C65: SI = DI
L_7C67: DI = &H9412
L_7C6A: FAC! = N_D072! + N_9412!  ' RT3F_7F
L_7C6D: DI = &HD374
L_7C70: BX = SI
L_7C72: N_D374! = FAC!: SI = &H001A  ' RT3F_7D
L_7C75: SI = BX
L_7C77: FAC! = N(SI): DI = &H001E  ' RT3F_6F
L_7C7A: GOTO L_7CA0
L_7C7D: ' Alignment NOP
L_7C7E: SI = &HC942
L_7C81: BX = SI
L_7C83: DX = BX
L_7C85: BX = CINT(N_C942!)  ' RT3F_75
L_7C88: DI = BX
L_7C8A: DI = DI * (2 ^ 1)
L_7C8C: DI = DI * (2 ^ 1)
L_7C8E: DI = DI + &H1850
L_7C92: SI = &HBB46
L_7C95: N(DI) = N_BB46!  ' RT3F_7B
L_7C98: SI = DX
L_7C9A: DI = &H804E
L_7C9D: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_7CA0: DI = &HC942
L_7CA3: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_7CA6: SI = DI
L_7CA8: DI = &HD374
L_7CAB: CompareLeft! = N_C942!: CompareRight! = N_D374!  ' RT3F_9F
L_7CAE: IF CompareLeft! <= CompareRight! THEN GOTO L_7C7E  ' flags from L_7CAB
L_7CB0: RETURN
L_7CB1: DI = &HC110
L_7CB4: SI = &HD37C
L_7CB7: N_C110! = N_D37C!  ' RT3F_7B
L_7CBA: DI = &HC114
L_7CBD: SI = &HC762
L_7CC0: N_C114! = N_C762!  ' RT3F_7B
L_7CC3: GOSUB L_06A9
L_7CC6: DI = &H804E
L_7CC9: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_7CCC: IF CompareLeft! < CompareRight! THEN GOTO L_7CD1  ' flags from L_7CC9
L_7CCE: GOTO L_7CD2
L_7CD1: RETURN
L_7CD2: ' PRINT statement begins ; RT3F_BC
L_7CD5: BX = &HD380
L_7CD8: PRINT S_D380$;  ' RT3F_6A
L_7CDB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7CDE: DI = &HC120
L_7CE1: SI = &HD39E
L_7CE4: N_C120! = N_D39E!  ' RT3F_7B
L_7CE7: DI = &HC124
L_7CEA: SI = &HC762
L_7CED: N_C124! = N_C762!  ' RT3F_7B
L_7CF0: GOSUB L_06DB
L_7CF3: DI = &HD072
L_7CF6: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_7CF9: SI = DI
L_7CFB: DI = &H9412
L_7CFE: FAC! = N_D072! + N_9412!  ' RT3F_7F
L_7D01: DI = &HD39A
L_7D04: BX = SI
L_7D06: N_D39A! = FAC!: SI = &H001A  ' RT3F_7D
L_7D09: SI = BX
L_7D0B: FAC! = N(SI): DI = &H001E  ' RT3F_6F
L_7D0E: GOTO L_7D34
L_7D11: ' Alignment NOP
L_7D12: SI = &HC942
L_7D15: BX = SI
L_7D17: DX = BX
L_7D19: BX = CINT(N_C942!)  ' RT3F_75
L_7D1C: DI = BX
L_7D1E: DI = DI * (2 ^ 1)
L_7D20: DI = DI * (2 ^ 1)
L_7D22: DI = DI + &H1850
L_7D26: SI = &HBB46
L_7D29: N(DI) = N_BB46!  ' RT3F_7B
L_7D2C: SI = DX
L_7D2E: DI = &H804E
L_7D31: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_7D34: DI = &HC942
L_7D37: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_7D3A: SI = DI
L_7D3C: DI = &HD39A
L_7D3F: CompareLeft! = N_C942!: CompareRight! = N_D39A!  ' RT3F_9F
L_7D42: IF CompareLeft! <= CompareRight! THEN GOTO L_7D12  ' flags from L_7D3F
L_7D44: DI = &HC120
L_7D47: SI = &HC1B8
L_7D4A: N_C120! = N_C1B8!  ' RT3F_7B
L_7D4D: DI = &HC124
L_7D50: SI = &HC762
L_7D53: N_C124! = N_C762!  ' RT3F_7B
L_7D56: GOSUB L_06DB
L_7D59: BX = CINT(FAC!)  ' RT3F_77
L_7D5C: DI = BX
L_7D5E: DI = DI * (2 ^ 1)
L_7D60: DI = DI * (2 ^ 1)
L_7D62: DI = DI + &H1850
L_7D66: SI = &HD3A2
L_7D69: N(DI) = N_D3A2!  ' RT3F_7B
L_7D6C: RETURN
L_7D6D: DI = &HC110
L_7D70: SI = &HC980
L_7D73: N_C110! = N_C980!  ' RT3F_7B
L_7D76: DI = &HC114
L_7D79: SI = &HC762
L_7D7C: N_C114! = N_C762!  ' RT3F_7B
L_7D7F: GOSUB L_06A9
L_7D82: DI = &H804E
L_7D85: CompareLeft! = FAC!: CompareRight! = N_804E!  ' RT3F_A1
L_7D88: IF CompareLeft! < CompareRight! THEN GOTO L_7D8D  ' flags from L_7D85
L_7D8A: GOTO L_7D8E
L_7D8D: RETURN
L_7D8E: ' PRINT statement begins ; RT3F_BC
L_7D91: BX = &HD3A6
L_7D94: PRINT S_D3A6$;  ' RT3F_6A
L_7D97: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7D9A: DI = &HC120
L_7D9D: SI = &HC980
L_7DA0: N_C120! = N_C980!  ' RT3F_7B
L_7DA3: DI = &HC124
L_7DA6: BX = SI
L_7DA8: SI = &HC762
L_7DAB: N_C124! = N_C762!  ' RT3F_7B
L_7DAE: GOSUB L_06DB
L_7DB1: BX = CINT(FAC!)  ' RT3F_77
L_7DB4: DI = BX
L_7DB6: DI = DI * (2 ^ 1)
L_7DB8: DI = DI * (2 ^ 1)
L_7DBA: DI = DI + &H1850
L_7DBE: BX = DI
L_7DC0: DI = &HC110
L_7DC3: SI = &HC980
L_7DC6: N_C110! = N_C980!  ' RT3F_7B
L_7DC9: DI = &HC114
L_7DCC: SI = &HC762
L_7DCF: N_C114! = N_C762!  ' RT3F_7B
L_7DD2: WORD(BP - &HC) = BX
L_7DD5: GOSUB L_06A9
L_7DD8: DI = &HBB52
L_7DDB: FAC! = FAC! * N_BB52!  ' RT3F_91
L_7DDE: DI = &HD3BC
L_7DE1: FAC! = FAC! + N_D3BC!  ' RT3F_81
L_7DE4: BX = &H1A
L_7DE7: FAC! = INT(FAC!)  ' RT3D_03
L_7DEA: DI = WORD(BP - &HC)
L_7DED: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7DF0: RETURN
L_7DF1: DI = &HC110
L_7DF4: SI = &HBFA6
L_7DF7: N_C110! = N_BFA6!  ' RT3F_7B
L_7DFA: DI = &HC114
L_7DFD: SI = &HC762
L_7E00: N_C114! = N_C762!  ' RT3F_7B
L_7E03: GOSUB L_06A9
L_7E06: DI = &HC946
L_7E09: N_C946! = FAC!: SI = &H001A  ' RT3F_7D
L_7E0C: SI = DI
L_7E0E: CompareLeft! = N_C946!: CompareRight! = 0  ' RT3F_A7
L_7E11: IF CompareLeft! <> CompareRight! THEN GOTO L_7E16  ' flags from L_7E0E
L_7E13: GOTO L_7C1D
L_7E16: DI = &HC184
L_7E19: SI = &HC946
L_7E1C: FAC! = N_C946! * N_C184!  ' RT3F_8F
L_7E1F: DI = &HC94E
L_7E22: FAC! = FAC! + N_C94E!  ' RT3F_81
L_7E25: DI = &HC94A
L_7E28: N_C94A! = FAC!: SI = &H001A  ' RT3F_7D
L_7E2B: FAC! = RND  ' RT3D_34
L_7E2E: DI = &HD350
L_7E31: CompareLeft! = FAC!: CompareRight! = N_D350!  ' RT3F_A1
L_7E34: IF CompareLeft! >= CompareRight! THEN GOTO L_7E39  ' flags from L_7E31
L_7E36: GOTO L_7E8A
L_7E39: ' PRINT statement begins ; RT3F_BC
L_7E3C: BX = &HD3C0
L_7E3F: PRINT S_D3C0$;  ' RT3F_6A
L_7E42: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7E45: DI = &HBB56
L_7E48: SI = &HC94A
L_7E4B: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_7E4E: BX = CINT(FAC!)  ' RT3F_77
L_7E51: DI = BX
L_7E53: DI = DI * (2 ^ 1)
L_7E55: DI = DI * (2 ^ 1)
L_7E57: DI = DI + &H1850
L_7E5B: SI = &HC6B0
L_7E5E: N(DI) = N_C6B0!  ' RT3F_7B
L_7E61: DI = &HC120
L_7E64: SI = &HBFA6
L_7E67: N_C120! = N_BFA6!  ' RT3F_7B
L_7E6A: DI = &HC124
L_7E6D: SI = &HC762
L_7E70: N_C124! = N_C762!  ' RT3F_7B
L_7E73: GOSUB L_06DB
L_7E76: BX = CINT(FAC!)  ' RT3F_77
L_7E79: DI = BX
L_7E7B: DI = DI * (2 ^ 1)
L_7E7D: DI = DI * (2 ^ 1)
L_7E7F: DI = DI + &H1850
L_7E83: SI = &HBB46
L_7E86: N(DI) = N_BB46!  ' RT3F_7B
L_7E89: RETURN
L_7E8A: ' PRINT statement begins ; RT3F_BC
L_7E8D: BX = &HD3D8
L_7E90: PRINT S_D3D8$;  ' RT3F_6A
L_7E93: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7E96: DI = &HBB56
L_7E99: SI = &HC94A
L_7E9C: FAC! = N_C94A! + N_BB56!  ' RT3F_7F
L_7E9F: BX = CINT(FAC!)  ' RT3F_77
L_7EA2: DI = BX
L_7EA4: DI = DI * (2 ^ 1)
L_7EA6: DI = DI * (2 ^ 1)
L_7EA8: DI = DI + &H1850
L_7EAC: SI = &HC1DC
L_7EAF: N(DI) = N_C1DC!  ' RT3F_7B
L_7EB2: RETURN
L_7EB3: GOSUB L_2C93
L_7EB6: SI = &HCA4E
L_7EB9: BX = BASIC_BOOL(N_CA4E! <> 0)  ' RT3F_1D
L_7EBC: CompareLeft% = BX: CompareRight% = 0
L_7EBE: IF CompareLeft% = CompareRight% THEN GOTO L_7EC3  ' flags from L_7EBC
L_7EC0: GOTO L_434D
L_7EC3: DI = &HC184
L_7EC6: SI = &HC762
L_7EC9: FAC! = N_C762! + N_C184!  ' RT3F_7F
L_7ECC: BX = SI
L_7ECE: DX = BX
L_7ED0: BX = CINT(FAC!)  ' RT3F_77
L_7ED3: ARGPUSH BX  ' RT3E_42
L_7ED6: BX = &HC
L_7ED9: LOCATE ARGS(), BX  ' RT3E_44
L_7EDC: ' PRINT statement begins ; RT3F_BC
L_7EDF: DI = &HC110
L_7EE2: SI = &HC1BC
L_7EE5: N_C110! = N_C1BC!  ' RT3F_7B
L_7EE8: SWAP DX, SI
L_7EEA: BX = DI
L_7EEC: DI = &HC114
L_7EEF: N_C114! = N(SI)  ' RT3F_7B
L_7EF2: GOSUB L_06A9
L_7EF5: BX = &H1A
L_7EF8: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_7EFB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7EFE: DI = &HC110
L_7F01: SI = &HC1BC
L_7F04: N_C110! = N_C1BC!  ' RT3F_7B
L_7F07: DI = &HC114
L_7F0A: SI = &HC762
L_7F0D: N_C114! = N_C762!  ' RT3F_7B
L_7F10: GOSUB L_06A9
L_7F13: DI = &HBAF4
L_7F16: CompareLeft! = FAC!: CompareRight! = N_BAF4!  ' RT3F_A1
L_7F19: IF CompareLeft! < CompareRight! THEN GOTO L_7F1E  ' flags from L_7F16
L_7F1B: GOTO L_7F2A
L_7F1E: ' PRINT statement begins ; RT3F_BC
L_7F21: BX = &HC6C8
L_7F24: PRINT S_C6C8$  ' RT3F_6E; H newline item, ledger correction
L_7F27: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7F2A: DI = &HD25C
L_7F2D: SI = &HC7E6
L_7F30: FAC! = N_C7E6! * N_D25C!  ' RT3F_8F
L_7F33: DI = &HD3EE
L_7F36: N_D3EE! = FAC!: SI = &H001A  ' RT3F_7D
L_7F39: SI = &H804E
L_7F3C: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_7F3F: GOTO L_7F4E
L_7F42: GOSUB L_2913
L_7F45: DI = &H804E
L_7F48: SI = &HBA90
L_7F4B: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_7F4E: DI = &HBA90
L_7F51: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_7F54: SI = DI
L_7F56: DI = &HD3EE
L_7F59: CompareLeft! = N_BA90!: CompareRight! = N_D3EE!  ' RT3F_9F
L_7F5C: IF CompareLeft! <= CompareRight! THEN GOTO L_7F42  ' flags from L_7F59
L_7F5E: DI = &HD2F6
L_7F61: SI = &HC762
L_7F64: CompareLeft! = N_C762!: CompareRight! = N_D2F6!  ' RT3F_9F
L_7F67: IF CompareLeft! <> CompareRight! THEN GOTO L_7F6C  ' flags from L_7F64
L_7F69: GOTO L_7F6F
L_7F6C: GOSUB L_2F40
L_7F6F: DI = &H804E
L_7F72: SI = &HC762
L_7F75: FAC! = N_C762! + N_804E!  ' RT3F_7F
L_7F78: DI = &HC762
L_7F7B: N_C762! = FAC!: SI = &H001A  ' RT3F_7D
L_7F7E: SI = DI
L_7F80: DI = &HD2F2
L_7F83: CompareLeft! = N_C762!: CompareRight! = N_D2F2!  ' RT3F_9F
L_7F86: IF CompareLeft! > CompareRight! THEN GOTO L_7F8B  ' flags from L_7F83
L_7F88: GOTO L_796E
L_7F8B: DI = &HD3BC
L_7F8E: SI = &HC7E6
L_7F91: FAC! = N_C7E6! * N_D3BC!  ' RT3F_8F
L_7F94: DI = &HD3F2
L_7F97: N_D3F2! = FAC!: SI = &H001A  ' RT3F_7D
L_7F9A: SI = &H804E
L_7F9D: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_7FA0: GOTO L_7FB0
L_7FA3: ' Alignment NOP
L_7FA4: GOSUB L_2913
L_7FA7: DI = &H804E
L_7FAA: SI = &HBA90
L_7FAD: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_7FB0: DI = &HBA90
L_7FB3: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_7FB6: SI = DI
L_7FB8: DI = &HD3F2
L_7FBB: CompareLeft! = N_BA90!: CompareRight! = N_D3F2!  ' RT3F_9F
L_7FBE: IF CompareLeft! <= CompareRight! THEN GOTO L_7FA4  ' flags from L_7FBB
L_7FC0: RETURN
L_7FC1: SI = &HD240
L_7FC4: BX = CINT(N_D240!)  ' RT3F_75
L_7FC7: SI = BX
L_7FC9: SI = SI * (2 ^ 1)
L_7FCB: SI = SI * (2 ^ 1)
L_7FCD: BX = SI
L_7FCF: SI = SI + &HC518
L_7FD3: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_7FD7: DI = &HD406
L_7FDA: FAC! = FAC! + N_D406!  ' RT3F_81
L_7FDD: DX = DI
L_7FDF: DI = &HD3F6
L_7FE2: N_D3F6! = FAC!: SI = &H001A  ' RT3F_7D
L_7FE5: BX = BX + &HC53C
L_7FE9: SI = BX
L_7FEB: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_7FEF: DI = DX
L_7FF1: FAC! = FAC! + N(DI)  ' RT3F_81
L_7FF4: DI = &HD3FA
L_7FF7: N_D3FA! = FAC!: SI = &H001A  ' RT3F_7D
L_7FFA: SI = &HD238
L_7FFD: BX = CINT(N_D238!)  ' RT3F_75

```

### Movement and combat dispatch

```basic
L_8000: SI = BX
L_8002: SI = SI * (2 ^ 1)
L_8004: SI = SI * (2 ^ 1)
L_8006: BX = SI
L_8008: SI = SI + &HC518
L_800C: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_8010: DI = DX
L_8012: FAC! = FAC! + N(DI)  ' RT3F_81
L_8015: DI = &HD3FE
L_8018: N_D3FE! = FAC!: SI = &H001A  ' RT3F_7D
L_801B: BX = BX + &HC53C
L_801F: SI = BX
L_8021: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_8025: DI = DX
L_8027: FAC! = FAC! + N(DI)  ' RT3F_81
L_802A: DI = &HD402
L_802D: N_D402! = FAC!: SI = &H001A  ' RT3F_7D
L_8030: DI = &H804E
L_8033: SI = &HD1BC
L_8036: CompareLeft! = N_D1BC!: CompareRight! = N_804E!  ' RT3F_9F
L_8039: IF CompareLeft! <> CompareRight! THEN GOTO L_803E  ' flags from L_8036
L_803B: GOTO L_816D
L_803E: FAC! = RND  ' RT3D_34
L_8041: DI = &HD40A
L_8044: FAC! = FAC! * N_D40A!  ' RT3F_91
L_8047: BX = &H1A
L_804A: FAC! = INT(FAC!)  ' RT3D_03
L_804D: SI = &HD3FE
L_8050: BX = DI
L_8052: FAC! = N_D3FE! - FAC!  ' RT3F_9B
L_8055: DI = &HD3F6
L_8058: FAC! = FAC! - N_D3F6!  ' RT3F_99
L_805B: DI = &HC17C
L_805E: FAC! = FAC! + N_C17C!  ' RT3F_81
L_8061: DX = DI
L_8063: DI = &HCEDA
L_8066: N_CEDA! = FAC!: SI = &H001A  ' RT3F_7D
L_8069: FAC! = RND  ' RT3D_34
L_806C: DI = BX
L_806E: FAC! = FAC! * N(DI)  ' RT3F_91
L_8071: BX = &H1A
L_8074: FAC! = INT(FAC!)  ' RT3D_03
L_8077: SI = &HD402
L_807A: FAC! = N_D402! - FAC!  ' RT3F_9B
L_807D: DI = &HD3FA
L_8080: FAC! = FAC! - N_D3FA!  ' RT3F_99
L_8083: DI = DX
L_8085: FAC! = FAC! + N(DI)  ' RT3F_81
L_8088: DI = &HCEDE
L_808B: N_CEDE! = FAC!: SI = &H001A  ' RT3F_7D
L_808E: SI = &HCEDA
L_8091: CompareLeft! = N_CEDA!: CompareRight! = 0  ' RT3F_A7
L_8094: BX = 0
L_8097: IF CompareLeft! <> CompareRight! THEN GOTO L_809A  ' flags from L_8091
L_8099: BX = BX - 1
L_809A: SI = &HCEDE
L_809D: CompareLeft! = N_CEDE!: CompareRight! = 0  ' RT3F_A7
L_80A0: DX = 0
L_80A3: IF CompareLeft! <> CompareRight! THEN GOTO L_80A6  ' flags from L_809D
L_80A5: DX = DX - 1
L_80A6: DX = DX OR BX
L_80A8: CompareLeft% = DX: CompareRight% = 0
L_80AA: IF CompareLeft% <> CompareRight% THEN GOTO L_803E  ' flags from L_80A8
L_80AC: SI = &HCEDA
L_80AF: CompareLeft! = N_CEDA!: CompareRight! = 0  ' RT3F_A7
L_80B2: IF CompareLeft! > CompareRight! THEN GOTO L_80B7  ' flags from L_80AF
L_80B4: GOTO L_80C3
L_80B7: DI = &HD40E
L_80BA: SI = &HD412
L_80BD: N_D40E! = N_D412!  ' RT3F_7B
L_80C0: GOTO L_80CC
L_80C3: DI = &HD40E
L_80C6: SI = &HD416
L_80C9: N_D40E! = N_D416!  ' RT3F_7B
L_80CC: SI = &HCEDE
L_80CF: CompareLeft! = N_CEDE!: CompareRight! = 0  ' RT3F_A7
L_80D2: IF CompareLeft! > CompareRight! THEN GOTO L_80D7  ' flags from L_80CF
L_80D4: GOTO L_80E3
L_80D7: DI = &HD41A
L_80DA: SI = &HD41E
L_80DD: N_D41A! = N_D41E!  ' RT3F_7B
L_80E0: GOTO L_80EC
L_80E3: DI = &HD41A
L_80E6: SI = &HBFA6
L_80E9: N_D41A! = N_BFA6!  ' RT3F_7B
L_80EC: DI = &HD3F6
L_80EF: SI = &HD40E
L_80F2: FAC! = N_D40E! - N_D3F6!  ' RT3F_97
L_80F5: DI = &HCEDA
L_80F8: FAC! = FAC! / N_CEDA!  ' RT3F_89
L_80FB: DI = &HD422
L_80FE: N_D422! = FAC!: SI = &H001A  ' RT3F_7D
L_8101: BX = DI
L_8103: DI = &HD3FA
L_8106: SI = &HD41A
L_8109: FAC! = N_D41A! - N_D3FA!  ' RT3F_97
L_810C: DI = &HCEDE
L_810F: FAC! = FAC! / N_CEDE!  ' RT3F_89
L_8112: DI = &HD426
L_8115: N_D426! = FAC!: SI = &H001A  ' RT3F_7D
L_8118: SWAP BX, DI
L_811A: SI = BX
L_811C: CompareLeft! = N_D426!: CompareRight! = N(DI)  ' RT3F_9F
L_811F: IF CompareLeft! < CompareRight! THEN GOTO L_8124  ' flags from L_811C
L_8121: GOTO L_8127
L_8124: N(DI) = N(SI)  ' RT3F_7B
L_8127: DI = &HD422
L_812A: SI = &HCEDE
L_812D: FAC! = N_CEDE! * N_D422!  ' RT3F_8F
L_8130: BX = DI
L_8132: DI = &HD3FA
L_8135: FAC! = FAC! + N_D3FA!  ' RT3F_81
L_8138: DI = &HBB52
L_813B: FAC! = FAC! + N_BB52!  ' RT3F_81
L_813E: DX = BX
L_8140: BX = &H1A
L_8143: FAC! = INT(FAC!)  ' RT3D_03
L_8146: BX = DI
L_8148: DI = &HD402
L_814B: N_D402! = FAC!: SI = &H001A  ' RT3F_7D
L_814E: DI = DX
L_8150: SI = &HCEDA
L_8153: FAC! = N_CEDA! * N(DI)  ' RT3F_8F
L_8156: DI = &HD3F6
L_8159: FAC! = FAC! + N_D3F6!  ' RT3F_81
L_815C: DI = BX
L_815E: FAC! = FAC! + N(DI)  ' RT3F_81
L_8161: BX = &H1A
L_8164: FAC! = INT(FAC!)  ' RT3D_03
L_8167: DI = &HD3FE
L_816A: N_D3FE! = FAC!: SI = &H001A  ' RT3F_7D
L_816D: DI = &HD42A
L_8170: SI = &HD3F6
L_8173: N_D42A! = N_D3F6!  ' RT3F_7B
L_8176: DI = &HD42E
L_8179: BX = SI
L_817B: SI = &HD3FA
L_817E: N_D42E! = N_D3FA!  ' RT3F_7B
L_8181: DI = BX
L_8183: DX = SI
L_8185: SI = &HD3FE
L_8188: FAC! = N_D3FE! - N_D3F6!  ' RT3F_97
L_818B: DI = &HCEDA
L_818E: N_CEDA! = FAC!: SI = &H001A  ' RT3F_7D
L_8191: SWAP DX, DI
L_8193: SI = &HD402
L_8196: FAC! = N_D402! - N(DI)  ' RT3F_97
L_8199: DI = &HCEDE
L_819C: N_CEDE! = FAC!: SI = &H001A  ' RT3F_7D
L_819F: BX = DI
L_81A1: DI = &HC702
L_81A4: SI = &HD240
L_81A7: N_C702! = N_D240!  ' RT3F_7B
L_81AA: DI = &HC706
L_81AD: SI = &HD238
L_81B0: N_C706! = N_D238!  ' RT3F_7B
L_81B3: GOSUB L_179F
L_81B6: DI = &HC6A4
L_81B9: FAC! = FAC! ^ N_C6A4!  ' RT3F_25; M ledger
L_81BC: DI = &HD436
L_81BF: FAC! = FAC! + N_D436!  ' RT3F_81
L_81C2: SI = &HD43A
L_81C5: FAC! = N_D43A! / FAC!  ' RT3F_8B
L_81C8: DI = &HD432
L_81CB: N_D432! = FAC!: SI = &H001A  ' RT3F_7D
L_81CE: SI = &HCEDA
L_81D1: FAC! = N_CEDA! * N_D432!  ' RT3F_8F
L_81D4: BX = DI
L_81D6: DI = &HCA7A
L_81D9: N_CA7A! = FAC!: SI = &H001A  ' RT3F_7D
L_81DC: DI = BX
L_81DE: SI = &HCEDE
L_81E1: FAC! = N_CEDE! * N(DI)  ' RT3F_8F
L_81E4: DI = &HCA7E
L_81E7: N_CA7E! = FAC!: SI = &H001A  ' RT3F_7D
L_81EA: RETURN
L_81EB: DI = &HD238
L_81EE: SI = &HC9DC
L_81F1: N_D238! = N_C9DC!  ' RT3F_7B
L_81F4: DI = &HD240
L_81F7: SI = &HC0F4
L_81FA: N_D240! = N_C0F4!  ' RT3F_7B
L_81FD: GOSUB L_7FC1
L_8200: SI = &HC984
L_8203: BX = CINT(N_C984!)  ' RT3F_75
L_8206: ON BX GOSUB L_8691, L_8691, L_87E4, L_8906, L_8B7C, L_8BF2, L_91F0, L_8DF7, L_8CD2, L_8CD2, L_8CD2, L_9107  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_8222: SI = &HD1BC
L_8225: CompareLeft! = N_D1BC!: CompareRight! = 0  ' RT3F_A7
L_8228: IF CompareLeft! = CompareRight! THEN GOTO L_822D  ' flags from L_8225
L_822A: GOTO L_822E
L_822D: RETURN
L_822E: DI = &HD2E6
L_8231: SI = &H804E
L_8234: N_D2E6! = N_804E!  ' RT3F_7B
L_8237: BX = DI
L_8239: DI = &HC110
L_823C: DX = SI
L_823E: SI = &HC1B4
L_8241: N_C110! = N_C1B4!  ' RT3F_7B
L_8244: DI = &HC114
L_8247: SI = &HC762
L_824A: N_C114! = N_C762!  ' RT3F_7B
L_824D: GOSUB L_06A9
L_8250: DI = &HD2EA
L_8253: N_D2EA! = FAC!: SI = &H001A  ' RT3F_7D
L_8256: BX = DI
L_8258: DI = &HC0F4
L_825B: SI = &HC984
L_825E: CompareLeft! = N_C984!: CompareRight! = N_C0F4!  ' RT3F_9F
L_8261: DX = 0
L_8264: IF CompareLeft! <= CompareRight! THEN GOTO L_8267  ' flags from L_825E
L_8266: DX = DX - 1
L_8267: DI = &HC184
L_826A: CompareLeft! = N(SI): CompareRight! = N_C184!  ' RT3F_9F
L_826D: CX = 0
L_8270: IF CompareLeft! >= CompareRight! THEN GOTO L_8273  ' flags from L_826A
L_8272: CX = CX - 1
L_8273: CX = CX AND DX
L_8275: CompareLeft% = CX: CompareRight% = 0
L_8277: IF CompareLeft% <> CompareRight% THEN GOTO L_827C  ' flags from L_8275
L_8279: GOTO L_82F8
L_827C: FAC! = RND  ' RT3D_34
L_827F: DI = &HC6A4
L_8282: DX = SI
L_8284: FAC! = FAC! ^ N_C6A4!  ' RT3F_25; M ledger
L_8287: SI = &HC9DC
L_828A: CX = BX
L_828C: T_03! = FAC!  ' RT3F_71; inline=&H83
L_8290: BX = CINT(N(SI))  ' RT3F_75
L_8293: DI = BX
L_8295: DI = DI * (2 ^ 1)
L_8297: DI = DI * (2 ^ 1)
L_8299: DI = DI + &HC604
L_829D: SI = &HBEA0
L_82A0: FAC! = N_BEA0! * N(DI)  ' RT3F_8F
L_82A3: BX = DI
L_82A5: DI = &H804E
L_82A8: FAC! = FAC! + N_804E!  ' RT3F_81
L_82AB: AX = BX
L_82AD: BX = &H1A
L_82B0: FAC! = INT(FAC!)  ' RT3D_03
L_82B3: BX = DI
L_82B5: DI = &HD2E6
L_82B8: N_D2E6! = FAC!: SI = &H001A  ' RT3F_7D
L_82BB: FAC! = RND  ' RT3D_34
L_82BE: SI = AX
L_82C0: T_04! = FAC!  ' RT3F_71; inline=&H84
L_82C4: FAC! = N(SI) - N(DI)  ' RT3F_97
L_82C7: SWAP BX, DI
L_82C9: FAC! = FAC! + N(DI)  ' RT3F_81
L_82CC: FAC! = T_04! * FAC!  ' RT3F_95; inline=&H84
L_82D0: BX = &H1A
L_82D3: FAC! = INT(FAC!)  ' RT3D_03
L_82D6: DI = CX
L_82D8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_82DB: SI = DX
L_82DD: DI = &HC17C
L_82E0: CompareLeft! = N(SI): CompareRight! = N_C17C!  ' RT3F_9F
L_82E3: IF CompareLeft! = CompareRight! THEN GOTO L_82E8  ' flags from L_82E0
L_82E5: GOTO L_82F8
L_82E8: SI = AX
L_82EA: DI = &HD2E6
L_82ED: N_D2E6! = N(SI)  ' RT3F_7B
L_82F0: DI = CX
L_82F2: SI = &HBB46
L_82F5: N(DI) = N_BB46!  ' RT3F_7B
L_82F8: GOSUB L_A15D
L_82FB: DI = &HD43E
L_82FE: SI = &HD2F6
L_8301: N_D43E! = N_D2F6!  ' RT3F_7B
L_8304: SI = &HD2EA
L_8307: FAC! = N_D2EA!: DI = &H001E  ' RT3F_6F
L_830A: GOTO L_863C
L_830D: ' Alignment NOP
L_830E: SI = &HC9DC
L_8311: BX = CINT(N_C9DC!)  ' RT3F_75
L_8314: AX = BX
L_8316: SI = 5
L_8319: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_831B: SI = AX
L_831D: SI = &HC9E4
L_8320: BX = CINT(N_C9E4!)  ' RT3F_75
L_8323: BX = BX + AX
L_8325: SI = BX
L_8327: SI = SI * (2 ^ 1)
L_8329: SI = SI * (2 ^ 1)
L_832B: SI = SI + &HC2B8
L_832F: DI = &H804E
L_8332: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_8335: IF CompareLeft! >= CompareRight! THEN GOTO L_833A  ' flags from L_8332
L_8337: GOTO L_8633
L_833A: SI = &HC984
L_833D: CompareLeft! = N_C984!: CompareRight! = 0  ' RT3F_A7
L_8340: IF CompareLeft! = CompareRight! THEN GOTO L_8345  ' flags from L_833D
L_8342: GOTO L_8363
L_8345: DI = &HC110
L_8348: SI = &HD37C
L_834B: N_C110! = N_D37C!  ' RT3F_7B
L_834E: DI = &HC114
L_8351: SI = &HC762
L_8354: N_C114! = N_C762!  ' RT3F_7B
L_8357: GOSUB L_06A9
L_835A: DI = &HD442
L_835D: N_D442! = FAC!: SI = &H001A  ' RT3F_7D
L_8360: GOTO L_837F
L_8363: DI = &H804E
L_8366: SI = &HC94A
L_8369: FAC! = N_C94A! + N_804E!  ' RT3F_7F
L_836C: BX = CINT(FAC!)  ' RT3F_77
L_836F: SI = BX
L_8371: SI = SI * (2 ^ 1)
L_8373: SI = SI * (2 ^ 1)
L_8375: SI = SI + &H1850
L_8379: DI = &HD442
L_837C: N_D442! = N(SI)  ' RT3F_7B
L_837F: DI = &HCB06
L_8382: SI = &H804E
L_8385: N_CB06! = N_804E!  ' RT3F_7B
L_8388: FAC! = RND  ' RT3D_34
L_838B: DI = &HBB52
L_838E: BX = SI
L_8390: FAC! = FAC! ^ N_BB52!  ' RT3F_25; M ledger
L_8393: DI = &HD442
L_8396: FAC! = FAC! * N_D442!  ' RT3F_91
L_8399: DI = BX
L_839B: FAC! = FAC! + N(DI)  ' RT3F_81
L_839E: BX = &H1A
L_83A1: FAC! = INT(FAC!)  ' RT3D_03
L_83A4: DI = &HD282
L_83A7: N_D282! = FAC!: SI = &H001A  ' RT3F_7D
L_83AA: SI = &HC9DC
L_83AD: BX = CINT(N_C9DC!)  ' RT3F_75
L_83B0: AX = BX
L_83B2: SI = 5
L_83B5: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_83B7: SI = AX
L_83B9: SI = &HC9E4
L_83BC: BX = CINT(N_C9E4!)  ' RT3F_75
L_83BF: BX = BX + AX
L_83C1: SI = BX
L_83C3: SI = SI * (2 ^ 1)
L_83C5: SI = SI * (2 ^ 1)
L_83C7: SI = SI + &HC258
L_83CB: SWAP SI, DI
L_83CD: FAC! = N_D282! - N(DI)  ' RT3F_97
L_83D0: DI = SI
L_83D2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_83D5: SI = DI
L_83D7: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_83DA: IF CompareLeft! >= CompareRight! THEN GOTO L_83DF  ' flags from L_83D7
L_83DC: GOTO L_8633
L_83DF: DI = &HD282
L_83E2: SI = &HD1AC
L_83E5: FAC! = N_D1AC! + N_D282!  ' RT3F_7F
L_83E8: SWAP SI, DI
L_83EA: BX = SI
L_83EC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_83EF: SI = &HC9DC
L_83F2: DX = BX
L_83F4: BX = CINT(N_C9DC!)  ' RT3F_75
L_83F7: AX = BX
L_83F9: DI = 5
L_83FC: CX = DX
L_83FE: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_8400: DI = AX
L_8402: SI = &HC9E4
L_8405: BX = CINT(N_C9E4!)  ' RT3F_75
L_8408: DI = DI + BX
L_840A: DI = DI * (2 ^ 1)
L_840C: DI = DI * (2 ^ 1)
L_840E: DI = DI + &HC2B8
L_8412: SWAP CX, DI
L_8414: SI = CX
L_8416: FAC! = N(SI) - N(DI)  ' RT3F_97
L_8419: DI = CX
L_841B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_841E: SI = CX
L_8420: DI = &H804E
L_8423: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_8426: IF CompareLeft! < CompareRight! THEN GOTO L_842B  ' flags from L_8423
L_8428: GOTO L_8443
L_842B: SWAP CX, DI
L_842D: SI = &HBB46
L_8430: N(DI) = N_BB46!  ' RT3F_7B
L_8433: DI = CX
L_8435: SI = &HD1A8
L_8438: FAC! = N_D1A8! + N(DI)  ' RT3F_7F
L_843B: DI = SI
L_843D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8440: GOTO L_8633
L_8443: FAC! = RND  ' RT3D_34
L_8446: DI = &HBB9E
L_8449: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_844C: BX = DI
L_844E: DI = &HC188
L_8451: CompareLeft! = FAC!: CompareRight! = N_C188!  ' RT3F_A1
L_8454: DX = 0
L_8457: IF CompareLeft! <= CompareRight! THEN GOTO L_845A  ' flags from L_8451
L_8459: DX = DX - 1
L_845A: FAC! = RND  ' RT3D_34
L_845D: DI = BX
L_845F: FAC! = FAC! * N(DI)  ' RT3F_91
L_8462: DI = &HBAF4
L_8465: SI = &HD282
L_8468: T_03! = FAC!  ' RT3F_71; inline=&H83
L_846C: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_846F: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_8473: BX = 0
L_8476: IF CompareLeft! <= CompareRight! THEN GOTO L_8479  ' flags from L_846F
L_8478: BX = BX - 1
L_8479: BX = BX OR DX
L_847B: CompareLeft% = BX: CompareRight% = 0
L_847D: IF CompareLeft% = CompareRight% THEN GOTO L_8482  ' flags from L_847B
L_847F: GOTO L_8633
L_8482: DI = &HCA4E
L_8485: SI = &H804E
L_8488: N_CA4E! = N_804E!  ' RT3F_7B
L_848B: FAC! = RND  ' RT3D_34
L_848E: FAC! = FAC! * 2 ^ (3)  ' RT3F_AD; inline=&H03
L_8492: BX = &H1A
L_8495: FAC! = INT(FAC!)  ' RT3D_03
L_8498: DI = SI
L_849A: FAC! = FAC! + N(DI)  ' RT3F_81
L_849D: BX = CINT(FAC!)  ' RT3F_77
L_84A0: ON BX GOSUB L_84DC, L_850F, L_8535, L_855B, L_8581, L_85BB, L_85F5, L_8632  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_84B4: SI = &HC9DC
L_84B7: BX = CINT(N_C9DC!)  ' RT3F_75
L_84BA: AX = BX
L_84BC: DI = 5
L_84BF: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_84C1: DI = AX
L_84C3: SI = &HC9E4
L_84C6: BX = CINT(N_C9E4!)  ' RT3F_75
L_84C9: DI = DI + BX
L_84CB: DI = DI * (2 ^ 1)
L_84CD: DI = DI * (2 ^ 1)
L_84CF: DI = DI + &HC4C8
L_84D3: SI = &H9412
L_84D6: N(DI) = N_9412!  ' RT3F_7B
L_84D9: GOTO L_8633
L_84DC: SI = &HC9DC
L_84DF: BX = CINT(N_C9DC!)  ' RT3F_75
L_84E2: AX = BX
L_84E4: DI = 5
L_84E7: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_84E9: DI = AX
L_84EB: SI = &HC9E4
L_84EE: BX = CINT(N_C9E4!)  ' RT3F_75
L_84F1: DI = DI + BX
L_84F3: DI = DI * (2 ^ 1)
L_84F5: DI = DI * (2 ^ 1)
L_84F7: DI = DI + &HC258
L_84FB: SI = DI
L_84FD: DI = &HD3BC
L_8500: FAC! = N(SI) * N_D3BC!  ' RT3F_8F
L_8503: BX = &H1A
L_8506: FAC! = INT(FAC!)  ' RT3D_03
L_8509: DI = SI
L_850B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_850E: RETURN
L_850F: SI = &HC9DC
L_8512: BX = CINT(N_C9DC!)  ' RT3F_75
L_8515: AX = BX
L_8517: DI = 5
L_851A: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_851C: DI = AX
L_851E: SI = &HC9E4
L_8521: BX = CINT(N_C9E4!)  ' RT3F_75
L_8524: DI = DI + BX
L_8526: DI = DI * (2 ^ 1)
L_8528: DI = DI * (2 ^ 1)
L_852A: DI = DI + &HC388
L_852E: SI = &HD446
L_8531: N(DI) = N_D446!  ' RT3F_7B
L_8534: RETURN
L_8535: SI = &HC9DC
L_8538: BX = CINT(N_C9DC!)  ' RT3F_75
L_853B: AX = BX
L_853D: DI = 5
L_8540: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_8542: DI = AX
L_8544: SI = &HC9E4
L_8547: BX = CINT(N_C9E4!)  ' RT3F_75
L_854A: DI = DI + BX
L_854C: DI = DI * (2 ^ 1)
L_854E: DI = DI * (2 ^ 1)
L_8550: DI = DI + &HC3D8
L_8554: SI = &HD446
L_8557: N(DI) = N_D446!  ' RT3F_7B
L_855A: RETURN
L_855B: SI = &HC9DC
L_855E: BX = CINT(N_C9DC!)  ' RT3F_75
L_8561: AX = BX
L_8563: DI = 5
L_8566: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_8568: DI = AX
L_856A: SI = &HC9E4
L_856D: BX = CINT(N_C9E4!)  ' RT3F_75
L_8570: DI = DI + BX
L_8572: DI = DI * (2 ^ 1)
L_8574: DI = DI * (2 ^ 1)
L_8576: DI = DI + &HC478
L_857A: SI = &HD446
L_857D: N(DI) = N_D446!  ' RT3F_7B
L_8580: RETURN
L_8581: SI = &HC9DC
L_8584: BX = CINT(N_C9DC!)  ' RT3F_75
L_8587: AX = BX
L_8589: DI = 5
L_858C: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_858E: DI = AX
L_8590: SI = &HC9E4
L_8593: BX = CINT(N_C9E4!)  ' RT3F_75
L_8596: DI = DI + BX
L_8598: DI = DI * (2 ^ 1)
L_859A: DI = DI * (2 ^ 1)
L_859C: DI = DI + &HC388
L_85A0: SI = DI
L_85A2: DI = &HBB52
L_85A5: FAC! = N(SI) * N_BB52!  ' RT3F_8F
L_85A8: BX = SI
L_85AA: FAC! = FAC! + N(DI)  ' RT3F_81
L_85AD: DX = BX
L_85AF: BX = &H1A
L_85B2: FAC! = INT(FAC!)  ' RT3D_03
L_85B5: DI = DX
L_85B7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_85BA: RETURN
L_85BB: SI = &HC9DC
L_85BE: BX = CINT(N_C9DC!)  ' RT3F_75
L_85C1: AX = BX
L_85C3: DI = 5
L_85C6: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_85C8: DI = AX
L_85CA: SI = &HC9E4
L_85CD: BX = CINT(N_C9E4!)  ' RT3F_75
L_85D0: DI = DI + BX
L_85D2: DI = DI * (2 ^ 1)
L_85D4: DI = DI * (2 ^ 1)
L_85D6: DI = DI + &HC3D8
L_85DA: SI = DI
L_85DC: DI = &HBB52
L_85DF: FAC! = N(SI) * N_BB52!  ' RT3F_8F
L_85E2: BX = SI
L_85E4: FAC! = FAC! + N(DI)  ' RT3F_81
L_85E7: DX = BX
L_85E9: BX = &H1A
L_85EC: FAC! = INT(FAC!)  ' RT3D_03
L_85EF: DI = DX
L_85F1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_85F4: RETURN
L_85F5: SI = &HC9DC
L_85F8: BX = CINT(N_C9DC!)  ' RT3F_75
L_85FB: AX = BX
L_85FD: DI = 5
L_8600: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_8602: DI = AX
L_8604: SI = &HC9E4
L_8607: BX = CINT(N_C9E4!)  ' RT3F_75
L_860A: DI = DI + BX
L_860C: DI = DI * (2 ^ 1)
L_860E: DI = DI * (2 ^ 1)
L_8610: DI = DI + &HC478
L_8614: SI = DI
L_8616: DI = &HC11C
L_8619: FAC! = N(SI) * N_C11C!  ' RT3F_8F
L_861C: DI = &HBB52
L_861F: BX = SI
L_8621: FAC! = FAC! + N_BB52!  ' RT3F_81
L_8624: DX = BX
L_8626: BX = &H1A
L_8629: FAC! = INT(FAC!)  ' RT3D_03
L_862C: DI = DX
L_862E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8631: RETURN
L_8632: RETURN
L_8633: DI = &H804E
L_8636: SI = &HC9E4
L_8639: FAC! = N_C9E4! + N_804E!  ' RT3F_7F
L_863C: DI = &HC9E4
L_863F: N_C9E4! = FAC!: SI = &H001A  ' RT3F_7D
L_8642: SI = DI
L_8644: DI = &HD43E
L_8647: CompareLeft! = N_C9E4!: CompareRight! = N_D43E!  ' RT3F_9F
L_864A: IF CompareLeft! > CompareRight! THEN GOTO L_864F  ' flags from L_8647
L_864C: GOTO L_830E
L_864F: SI = &HC9DC
L_8652: BX = CINT(N_C9DC!)  ' RT3F_75
L_8655: SI = BX
L_8657: SI = SI * (2 ^ 1)
L_8659: SI = SI * (2 ^ 1)
L_865B: SI = SI + &HC604
L_865F: DI = &HC6B0
L_8662: FAC! = N(SI) + N_C6B0!  ' RT3F_7F
L_8665: DI = &HD44A
L_8668: N_D44A! = FAC!: SI = &H001A  ' RT3F_7D
L_866B: SI = &HC6B4
L_866E: FAC! = N_C6B4!: DI = &H001E  ' RT3F_6F
L_8671: GOTO L_8680
L_8674: GOSUB L_9F76
L_8677: DI = &H804E
L_867A: SI = &HC9E4
L_867D: FAC! = N_C9E4! + N_804E!  ' RT3F_7F
L_8680: DI = &HC9E4
L_8683: N_C9E4! = FAC!: SI = &H001A  ' RT3F_7D
L_8686: SI = DI
L_8688: DI = &HD44A
L_868B: CompareLeft! = N_C9E4!: CompareRight! = N_D44A!  ' RT3F_9F
L_868E: IF CompareLeft! <= CompareRight! THEN GOTO L_8674  ' flags from L_868B
L_8690: RETURN
L_8691: SI = &H9426
L_8694: BX = BASIC_BOOL(N_9426! <> 0)  ' RT3F_1D
L_8697: CompareLeft% = BX: CompareRight% = 0
L_8699: IF CompareLeft% <> CompareRight% THEN GOTO L_869E  ' flags from L_8697
L_869B: GOTO L_86E2
L_869E: BX = &H39
L_86A1: DX = &HC11C
L_86A4: SoundFreq% = BX: SoundDuration! = N_C11C!  ' RT3E_5E
L_86A7: BX = &HFFFF
L_86AA: DX = BX
L_86AC: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_86AF: BX = &H173B
L_86B2: DX = &HCC60
L_86B5: SoundFreq% = BX: SoundDuration! = N_CC60!  ' RT3E_5E
L_86B8: BX = &HFFFF
L_86BB: DX = BX
L_86BD: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_86C0: BX = &H39
L_86C3: DX = &HC11C
L_86C6: SoundFreq% = BX: SoundDuration! = N_C11C!  ' RT3E_5E
L_86C9: BX = &HFFFF
L_86CC: DX = BX
L_86CE: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_86D1: BX = &H173B
L_86D4: DX = &HCC60
L_86D7: SoundFreq% = BX: SoundDuration! = N_CC60!  ' RT3E_5E
L_86DA: BX = &HFFFF
L_86DD: DX = BX
L_86DF: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_86E2: DI = &HD44E
L_86E5: SI = &HD432
L_86E8: N_D44E! = N_D432!  ' RT3F_7B
L_86EB: SI = &HBB46
L_86EE: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_86F1: GOTO L_874C
L_86F4: BX = &HD42A
L_86F7: DX = &HD42E
L_86FA: CX = &HFFFF
L_86FD: AX = CX
L_86FF: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8702: BX = &HB534
L_8705: DX = 4
L_8708: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_870B: GOSUB L_87B2
L_870E: BX = &HD42A
L_8711: DX = &HD42E
L_8714: CX = &HFFFF
L_8717: AX = CX
L_8719: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_871C: CX = BX
L_871E: BX = &HB534
L_8721: AX = DX
L_8723: DX = 4
L_8726: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8729: SI = CX
L_872B: DI = &HCA7A
L_872E: FAC! = N(SI) + N_CA7A!  ' RT3F_7F
L_8731: DI = CX
L_8733: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8736: SI = AX
L_8738: DI = &HCA7E
L_873B: FAC! = N(SI) + N_CA7E!  ' RT3F_7F
L_873E: DI = AX
L_8740: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8743: DI = &HD44E
L_8746: SI = &HD072
L_8749: FAC! = N_D072! + N_D44E!  ' RT3F_7F
L_874C: DI = &HD072
L_874F: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_8752: SI = &HD44E
L_8755: CompareLeft! = N_D44E!: CompareRight! = 0  ' RT3F_A7
L_8758: IF CompareLeft! < CompareRight! THEN GOTO L_875D  ' flags from L_8755
L_875A: GOTO L_876A
L_875D: SI = DI
L_875F: DI = &H804E
L_8762: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_8765: IF CompareLeft! >= CompareRight! THEN GOTO L_86F4  ' flags from L_8762
L_8767: GOTO L_8778
L_876A: DI = &H804E
L_876D: SI = &HD072
L_8770: CompareLeft! = N_D072!: CompareRight! = N_804E!  ' RT3F_9F
L_8773: IF CompareLeft! > CompareRight! THEN GOTO L_8778  ' flags from L_8770
L_8775: GOTO L_86F4
L_8778: SI = &HD1BC
L_877B: BX = CINT(N_D1BC!)  ' RT3F_75
L_877E: SI = &H9426
L_8781: DX = BX
L_8783: BX = CINT(N_9426!)  ' RT3F_75
L_8786: BX = BX AND DX
L_8788: CompareLeft% = BX: CompareRight% = 0
L_878A: IF CompareLeft% <> CompareRight% THEN GOTO L_878F  ' flags from L_8788
L_878C: GOTO L_87B1
L_878F: BX = &H39
L_8792: DX = &HD452
L_8795: SoundFreq% = BX: SoundDuration! = N_D452!  ' RT3E_5E
L_8798: BX = &HFFFF
L_879B: DX = BX
L_879D: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_87A0: BX = &H173B
L_87A3: DX = &HD456
L_87A6: SoundFreq% = BX: SoundDuration! = N_D456!  ' RT3E_5E
L_87A9: BX = &HFFFF
L_87AC: DX = BX
L_87AE: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_87B1: RETURN
L_87B2: DI = &HD45E
L_87B5: SI = &HC7EA
L_87B8: FAC! = N_C7EA! * N_D45E!  ' RT3F_8F
L_87BB: DI = &HD45A
L_87BE: N_D45A! = FAC!: SI = &H001A  ' RT3F_7D
L_87C1: SI = &H804E
L_87C4: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_87C7: GOTO L_87D3
L_87CA: DI = &H804E
L_87CD: SI = &HD462
L_87D0: FAC! = N_D462! + N_804E!  ' RT3F_7F
L_87D3: DI = &HD462
L_87D6: N_D462! = FAC!: SI = &H001A  ' RT3F_7D
L_87D9: SI = DI
L_87DB: DI = &HD45A
L_87DE: CompareLeft! = N_D462!: CompareRight! = N_D45A!  ' RT3F_9F
L_87E1: IF CompareLeft! <= CompareRight! THEN GOTO L_87CA  ' flags from L_87DE
L_87E3: RETURN
L_87E4: SI = &H9426
L_87E7: BX = BASIC_BOOL(N_9426! <> 0)  ' RT3F_1D
L_87EA: CompareLeft% = BX: CompareRight% = 0
L_87EC: IF CompareLeft% <> CompareRight% THEN GOTO L_87F1  ' flags from L_87EA
L_87EE: GOTO L_8835
L_87F1: BX = &H57
L_87F4: DX = &HD452
L_87F7: SoundFreq% = BX: SoundDuration! = N_D452!  ' RT3E_5E
L_87FA: BX = &HFFFF
L_87FD: DX = BX
L_87FF: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F

```

### Numerical and display helpers

```basic
L_8802: BX = &H1F0B
L_8805: DX = &HD456
L_8808: SoundFreq% = BX: SoundDuration! = N_D456!  ' RT3E_5E
L_880B: BX = &HFFFF
L_880E: DX = BX
L_8810: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8813: BX = &H57
L_8816: DX = &HD452
L_8819: SoundFreq% = BX: SoundDuration! = N_D452!  ' RT3E_5E
L_881C: BX = &HFFFF
L_881F: DX = BX
L_8821: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8824: BX = &H1F0B
L_8827: DX = &HD456
L_882A: SoundFreq% = BX: SoundDuration! = N_D456!  ' RT3E_5E
L_882D: BX = &HFFFF
L_8830: DX = BX
L_8832: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8835: DI = &HD466
L_8838: SI = &HD432
L_883B: N_D466! = N_D432!  ' RT3F_7B
L_883E: SI = &HBB46
L_8841: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_8844: GOTO L_88A0
L_8847: ' Alignment NOP
L_8848: BX = &HD42A
L_884B: DX = &HD42E
L_884E: CX = &HFFFF
L_8851: AX = CX
L_8853: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8856: BX = &HB53C
L_8859: DX = 4
L_885C: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_885F: GOSUB L_87B2
L_8862: BX = &HD42A
L_8865: DX = &HD42E
L_8868: CX = &HFFFF
L_886B: AX = CX
L_886D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8870: CX = BX
L_8872: BX = &HB53C
L_8875: AX = DX
L_8877: DX = 4
L_887A: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_887D: SI = CX
L_887F: DI = &HCA7A
L_8882: FAC! = N(SI) + N_CA7A!  ' RT3F_7F
L_8885: DI = CX
L_8887: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_888A: SI = AX
L_888C: DI = &HCA7E
L_888F: FAC! = N(SI) + N_CA7E!  ' RT3F_7F
L_8892: DI = AX
L_8894: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8897: DI = &HD466
L_889A: SI = &HD072
L_889D: FAC! = N_D072! + N_D466!  ' RT3F_7F
L_88A0: DI = &HD072
L_88A3: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_88A6: SI = &HD466
L_88A9: CompareLeft! = N_D466!: CompareRight! = 0  ' RT3F_A7
L_88AC: IF CompareLeft! < CompareRight! THEN GOTO L_88B1  ' flags from L_88A9
L_88AE: GOTO L_88BE
L_88B1: SI = DI
L_88B3: DI = &H804E
L_88B6: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_88B9: IF CompareLeft! >= CompareRight! THEN GOTO L_8848  ' flags from L_88B6
L_88BB: GOTO L_88CC
L_88BE: DI = &H804E
L_88C1: SI = &HD072
L_88C4: CompareLeft! = N_D072!: CompareRight! = N_804E!  ' RT3F_9F
L_88C7: IF CompareLeft! > CompareRight! THEN GOTO L_88CC  ' flags from L_88C4
L_88C9: GOTO L_8848
L_88CC: SI = &HD1BC
L_88CF: BX = CINT(N_D1BC!)  ' RT3F_75
L_88D2: SI = &H9426
L_88D5: DX = BX
L_88D7: BX = CINT(N_9426!)  ' RT3F_75
L_88DA: BX = BX AND DX
L_88DC: CompareLeft% = BX: CompareRight% = 0
L_88DE: IF CompareLeft% <> CompareRight% THEN GOTO L_88E3  ' flags from L_88DC
L_88E0: GOTO L_8905
L_88E3: BX = &H57
L_88E6: DX = &HD452
L_88E9: SoundFreq% = BX: SoundDuration! = N_D452!  ' RT3E_5E
L_88EC: BX = &HFFFF
L_88EF: DX = BX
L_88F1: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_88F4: BX = &H1F0B
L_88F7: DX = &HD456
L_88FA: SoundFreq% = BX: SoundDuration! = N_D456!  ' RT3E_5E
L_88FD: BX = &HFFFF
L_8900: DX = BX
L_8902: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8905: RETURN
L_8906: SI = &H804E
L_8909: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_890C: GOTO L_89A9
L_890F: ' Alignment NOP
L_8910: BX = &HD3F6
L_8913: DX = &HD3FA
L_8916: CX = &HFFFF
L_8919: AX = CX
L_891B: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_891E: BX = &HD3FE
L_8921: DX = &HD402
L_8924: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_8927: SWAP DX, AX
L_8928: BX = 1
L_892B: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_892E: AX = CX
L_8930: BX = &HD3F6
L_8933: DX = &HD3FA
L_8936: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_8939: BX = &HD3FE
L_893C: DX = &HD402
L_893F: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_8942: SWAP DX, AX
L_8943: BX = 3
L_8946: CX = &HCCCC
L_8949: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_894C: CX = DX
L_894E: AX = CX
L_8950: BX = &HD3F6
L_8953: DX = &HD3FA
L_8956: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_8959: BX = &HD3FE
L_895C: DX = &HD402
L_895F: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_8962: DX = AX
L_8964: BX = 2
L_8967: CX = &HCD26
L_896A: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_896D: DI = &HC6A0
L_8970: SI = &H9426
L_8973: FAC! = N_9426! * N_C6A0!  ' RT3F_8F
L_8976: BX = &H36B0
L_8979: DX = &H1A
L_897C: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_897F: BX = AX
L_8981: DX = AX
L_8983: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8986: DI = &HD46A
L_8989: SI = &H9426
L_898C: FAC! = N_9426! * N_D46A!  ' RT3F_8F
L_898F: BX = &H34BC
L_8992: DX = &H1A
L_8995: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8998: BX = &HFFFF
L_899B: DX = BX
L_899D: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_89A0: DI = &H804E
L_89A3: SI = &HBA90
L_89A6: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_89A9: DI = &HBA90
L_89AC: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_89AF: SI = DI
L_89B1: DI = &HC10C
L_89B4: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_89B7: IF CompareLeft! > CompareRight! THEN GOTO L_89BC  ' flags from L_89B4
L_89B9: GOTO L_8910
L_89BC: BX = &HC0
L_89BF: DX = &H18
L_89C2: CX = 0
L_89C4: AX = CX
L_89C6: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_89C9: BX = &H803A
L_89CC: DX = &HFF03
L_89CF: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_89D2: BX = &H63
L_89D5: DX = &HD46E
L_89D8: SoundFreq% = BX: SoundDuration! = N_D46E!  ' RT3E_5E
L_89DB: BX = &HFFFF
L_89DE: DX = BX
L_89E0: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_89E3: RETURN
L_89E4: DI = &HD472
L_89E7: SI = &HD432
L_89EA: N_D472! = N_D432!  ' RT3F_7B
L_89ED: SI = &HBB46
L_89F0: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_89F3: GOTO L_8A5E
L_89F6: DI = &HD072
L_89F9: SI = &HCEDA
L_89FC: FAC! = N_CEDA! * N_D072!  ' RT3F_8F
L_89FF: BX = DI
L_8A01: DI = &HD3F6
L_8A04: FAC! = FAC! + N_D3F6!  ' RT3F_81
L_8A07: DI = &HD42A
L_8A0A: N_D42A! = FAC!: SI = &H001A  ' RT3F_7D
L_8A0D: DI = BX
L_8A0F: SI = &HCEDE
L_8A12: FAC! = N_CEDE! * N(DI)  ' RT3F_8F
L_8A15: DI = &HD3FA
L_8A18: FAC! = FAC! + N_D3FA!  ' RT3F_81
L_8A1B: DI = &HD42E
L_8A1E: N_D42E! = FAC!: SI = &H001A  ' RT3F_7D
L_8A21: GOSUB L_8B7C
L_8A24: DI = &HD350
L_8A27: SI = &H9426
L_8A2A: FAC! = N_9426! * N_D350!  ' RT3F_8F
L_8A2D: BX = &H115C
L_8A30: DX = &H1A
L_8A33: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8A36: BX = &HFFFF
L_8A39: DX = BX
L_8A3B: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8A3E: GOSUB L_8B7C
L_8A41: SI = &HD476
L_8A44: BX = SI
L_8A46: DX = BX
L_8A48: BX = CINT(N_D476!)  ' RT3F_75
L_8A4B: BX = NOT BX
L_8A4D: FAC! = CSNG(BX)  ' RT3F_57
L_8A50: DI = DX
L_8A52: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8A55: DI = &HD472
L_8A58: SI = &HD072
L_8A5B: FAC! = N_D072! + N_D472!  ' RT3F_7F
L_8A5E: DI = &HD072
L_8A61: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_8A64: SI = &HD472
L_8A67: CompareLeft! = N_D472!: CompareRight! = 0  ' RT3F_A7
L_8A6A: IF CompareLeft! < CompareRight! THEN GOTO L_8A6F  ' flags from L_8A67
L_8A6C: GOTO L_8A7F
L_8A6F: SI = DI
L_8A71: DI = &H804E
L_8A74: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_8A77: IF CompareLeft! < CompareRight! THEN GOTO L_8A7C  ' flags from L_8A74
L_8A79: GOTO L_89F6
L_8A7C: GOTO L_8A8D
L_8A7F: DI = &H804E
L_8A82: SI = &HD072
L_8A85: CompareLeft! = N_D072!: CompareRight! = N_804E!  ' RT3F_9F
L_8A88: IF CompareLeft! > CompareRight! THEN GOTO L_8A8D  ' flags from L_8A85
L_8A8A: GOTO L_89F6
L_8A8D: SI = &HC97C
L_8A90: CompareLeft! = N_C97C!: CompareRight! = 0  ' RT3F_A7
L_8A93: IF CompareLeft! <> CompareRight! THEN GOTO L_8A98  ' flags from L_8A90
L_8A95: GOTO L_86E2
L_8A98: BX = &H9C
L_8A9B: DX = &H4C
L_8A9E: CX = 0
L_8AA0: AX = CX
L_8AA2: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_8AA5: BX = &HD3FE
L_8AA8: DX = &HD402
L_8AAB: CX = &HFFFF
L_8AAE: AX = CX
L_8AB0: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_8AB3: DX = AX
L_8AB5: BX = 2
L_8AB8: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_8ABB: DI = &HC6A8
L_8ABE: SI = &H9426
L_8AC1: FAC! = N_9426! * N_C6A8!  ' RT3F_8F
L_8AC4: BX = &H309
L_8AC7: DX = &H1A
L_8ACA: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8ACD: BX = AX
L_8ACF: DX = AX
L_8AD1: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8AD4: DI = &HBB52
L_8AD7: SI = &H9426
L_8ADA: FAC! = N_9426! * N_BB52!  ' RT3F_8F
L_8ADD: BX = &H378
L_8AE0: DX = &H1A
L_8AE3: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8AE6: BX = &HFFFF
L_8AE9: DX = BX
L_8AEB: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8AEE: DI = &HC6A4
L_8AF1: SI = &H9426
L_8AF4: FAC! = N_9426! * N_C6A4!  ' RT3F_8F
L_8AF7: BX = &H29A
L_8AFA: DX = &H1A
L_8AFD: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8B00: BX = &HFFFF
L_8B03: DX = BX
L_8B05: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8B08: DI = &HD3BC
L_8B0B: SI = &H9426
L_8B0E: FAC! = N_9426! * N_D3BC!  ' RT3F_8F
L_8B11: BX = &H309
L_8B14: DX = &H1A
L_8B17: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8B1A: BX = &HFFFF
L_8B1D: DX = BX
L_8B1F: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8B22: DI = &HD25C
L_8B25: SI = &H9426
L_8B28: FAC! = N_9426! * N_D25C!  ' RT3F_8F
L_8B2B: BX = &H2BC
L_8B2E: DX = &H1A
L_8B31: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8B34: BX = &HFFFF
L_8B37: DX = BX
L_8B39: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8B3C: DI = &HC6A8
L_8B3F: SI = &H9426
L_8B42: FAC! = N_9426! * N_C6A8!  ' RT3F_8F
L_8B45: BX = &H320
L_8B48: DX = &H1A
L_8B4B: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8B4E: BX = &HFFFF
L_8B51: DX = BX
L_8B53: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8B56: BX = &H9C
L_8B59: DX = &H4C
L_8B5C: CX = 0
L_8B5E: AX = CX
L_8B60: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_8B63: BX = &HD3FE
L_8B66: DX = &HD402
L_8B69: CX = &HFFFF
L_8B6C: AX = CX
L_8B6E: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_8B71: DX = AX
L_8B73: BX = 3
L_8B76: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_8B79: GOTO L_87B1
L_8B7C: GOTO L_8906
L_8B7F: SI = &H9426
L_8B82: BX = BASIC_BOOL(N_9426! <> 0)  ' RT3F_1D
L_8B85: CompareLeft% = BX: CompareRight% = 0
L_8B87: IF CompareLeft% <> CompareRight% THEN GOTO L_8B8C  ' flags from L_8B85
L_8B89: GOTO L_8BF1
L_8B8C: SI = &H804E
L_8B8F: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_8B92: GOTO L_8BD0
L_8B95: ' Alignment NOP
L_8B96: FAC! = RND  ' RT3D_34
L_8B99: DI = &HD416
L_8B9C: FAC! = FAC! / N_D416!  ' RT3F_89
L_8B9F: DI = &HD47A
L_8BA2: FAC! = FAC! + N_D47A!  ' RT3F_81
L_8BA5: T_03! = FAC!  ' RT3F_71; inline=&H83
L_8BA9: FAC! = RND  ' RT3D_34
L_8BAC: FAC! = FAC! * 2 ^ (5)  ' RT3F_AD; inline=&H05
L_8BB0: DI = &HCA72
L_8BB3: FAC! = FAC! + N_CA72!  ' RT3F_81
L_8BB6: BX = CINT(FAC!)  ' RT3F_77
L_8BB9: DX = &HBEA0
L_8BBC: SoundFreq% = BX: SoundDuration! = N_BEA0!  ' RT3E_5E
L_8BBF: BX = &HFFFF
L_8BC2: DX = BX
L_8BC4: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8BC7: DI = &H804E
L_8BCA: SI = &HD47E
L_8BCD: FAC! = N_D47E! + N_804E!  ' RT3F_7F
L_8BD0: DI = &HD47E
L_8BD3: N_D47E! = FAC!: SI = &H001A  ' RT3F_7D
L_8BD6: SI = DI
L_8BD8: DI = &HC17C
L_8BDB: CompareLeft! = N_D47E!: CompareRight! = N_C17C!  ' RT3F_9F
L_8BDE: IF CompareLeft! <= CompareRight! THEN GOTO L_8B96  ' flags from L_8BDB
L_8BE0: BX = &H28
L_8BE3: DX = &HD452
L_8BE6: SoundFreq% = BX: SoundDuration! = N_D452!  ' RT3E_5E
L_8BE9: BX = &HFFFF
L_8BEC: DX = BX
L_8BEE: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8BF1: RETURN
L_8BF2: DI = &HBAF4
L_8BF5: SI = &H19B4
L_8BF8: FAC! = N_19B4! * N_BAF4!  ' RT3F_8F
L_8BFB: DI = &HD486
L_8BFE: FAC! = FAC! + N_D486!  ' RT3F_81
L_8C01: DI = &HD482
L_8C04: N_D482! = FAC!: SI = &H001A  ' RT3F_7D
L_8C07: SI = &H804E
L_8C0A: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_8C0D: GOTO L_8C76
L_8C10: BX = &HD3F6
L_8C13: DX = &HD3FA
L_8C16: CX = &HFFFF
L_8C19: AX = CX
L_8C1B: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_8C1E: FAC! = RND  ' RT3D_34
L_8C21: DI = &HBAF4
L_8C24: FAC! = FAC! * N_BAF4!  ' RT3F_91
L_8C27: BX = DI
L_8C29: DI = &HD402
L_8C2C: FAC! = FAC! + N_D402!  ' RT3F_81
L_8C2F: DI = &HD48A
L_8C32: FAC! = FAC! + N_D48A!  ' RT3F_81
L_8C35: T_03! = FAC!  ' RT3F_71; inline=&H83
L_8C39: FAC! = RND  ' RT3D_34
L_8C3C: SWAP BX, DI
L_8C3E: FAC! = FAC! * N(DI)  ' RT3F_91
L_8C41: DI = &HD3FE
L_8C44: FAC! = FAC! + N_D3FE!  ' RT3F_81
L_8C47: DI = BX
L_8C49: FAC! = FAC! + N(DI)  ' RT3F_81
L_8C4C: BX = &H1A
L_8C4F: DX = &HBEA0
L_8C52: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_8C55: FAC! = RND  ' RT3D_34
L_8C58: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_8C5C: DI = &HD482
L_8C5F: FAC! = FAC! + N_D482!  ' RT3F_81
L_8C62: BX = CINT(FAC!)  ' RT3F_1B
L_8C65: DX = AX
L_8C67: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_8C6A: GOSUB L_8C9D
L_8C6D: DI = &H804E
L_8C70: SI = &HBA90
L_8C73: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_8C76: DI = &HBA90
L_8C79: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_8C7C: SI = DI
L_8C7E: DI = &HC1BC
L_8C81: CompareLeft! = N_BA90!: CompareRight! = N_C1BC!  ' RT3F_9F
L_8C84: IF CompareLeft! <= CompareRight! THEN GOTO L_8C10  ' flags from L_8C81
L_8C86: BX = &HC0
L_8C89: DX = &H18
L_8C8C: CX = 0
L_8C8E: AX = CX
L_8C90: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8C93: BX = &H803A
L_8C96: DX = &HFF03
L_8C99: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8C9C: RETURN
L_8C9D: DI = &HD456
L_8CA0: SI = &H9426
L_8CA3: FAC! = N_9426! * N_D456!  ' RT3F_8F
L_8CA6: BX = &H28
L_8CA9: DX = &H1A
L_8CAC: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8CAF: BX = &HFFFF
L_8CB2: DX = BX
L_8CB4: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8CB7: DI = &HCC60
L_8CBA: SI = &H9426
L_8CBD: FAC! = N_9426! * N_CC60!  ' RT3F_8F
L_8CC0: BX = &H3C
L_8CC3: DX = &H1A
L_8CC6: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_8CC9: BX = &HFFFF
L_8CCC: DX = BX
L_8CCE: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8CD1: RETURN
L_8CD2: GOSUB L_8DFD
L_8CD5: SI = &HD1BC
L_8CD8: CompareLeft! = N_D1BC!: CompareRight! = 0  ' RT3F_A7
L_8CDB: IF CompareLeft! = CompareRight! THEN GOTO L_8CE0  ' flags from L_8CD8
L_8CDD: GOTO L_8CE1
L_8CE0: RETURN
L_8CE1: DI = &HD48E
L_8CE4: SI = &HD3FE
L_8CE7: FAC! = N_D3FE! + N_D48E!  ' RT3F_7F
L_8CEA: SWAP SI, DI
L_8CEC: BX = SI
L_8CEE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8CF1: SWAP BX, DI
L_8CF3: SI = &HD402
L_8CF6: FAC! = N_D402! + N(DI)  ' RT3F_7F
L_8CF9: DI = SI
L_8CFB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8CFE: DX = DI
L_8D00: CX = &HFFFF
L_8D03: AX = CX
L_8D05: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8D08: BX = &HB560
L_8D0B: DX = 4
L_8D0E: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8D11: GOSUB L_8D94
L_8D14: BX = &HD3FE
L_8D17: DX = &HD402
L_8D1A: CX = &HFFFF
L_8D1D: AX = CX
L_8D1F: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8D22: BX = &HB684
L_8D25: DX = 4
L_8D28: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8D2B: GOSUB L_8D94
L_8D2E: BX = &HD3FE
L_8D31: DX = &HD402
L_8D34: CX = &HFFFF
L_8D37: AX = CX
L_8D39: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8D3C: BX = &HB7A8
L_8D3F: DX = 4
L_8D42: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8D45: GOSUB L_8D94
L_8D48: BX = &HD3FE
L_8D4B: DX = &HD402
L_8D4E: CX = &HFFFF
L_8D51: AX = CX
L_8D53: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8D56: BX = &HB7A8
L_8D59: DX = 4
L_8D5C: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8D5F: GOSUB L_87B2
L_8D62: BX = &HD3FE
L_8D65: DX = &HD402
L_8D68: CX = &HFFFF
L_8D6B: AX = CX
L_8D6D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8D70: BX = &HB684
L_8D73: DX = 4
L_8D76: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8D79: GOSUB L_87B2
L_8D7C: BX = &HD3FE
L_8D7F: DX = &HD402
L_8D82: CX = &HFFFF
L_8D85: AX = CX
L_8D87: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8D8A: BX = &HB560
L_8D8D: DX = 4
L_8D90: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8D93: RETURN
L_8D94: SI = &H9426
L_8D97: BX = BASIC_BOOL(N_9426! <> 0)  ' RT3F_1D
L_8D9A: CompareLeft% = BX: CompareRight% = 0
L_8D9C: IF CompareLeft% <> CompareRight% THEN GOTO L_8DA1  ' flags from L_8D9A
L_8D9E: GOTO L_8DF6
L_8DA1: BX = &H46
L_8DA4: DX = &HD492
L_8DA7: SoundFreq% = BX: SoundDuration! = N_D492!  ' RT3E_5E
L_8DAA: BX = &HFFFF
L_8DAD: DX = BX
L_8DAF: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8DB2: BX = &H28
L_8DB5: DX = &HD456
L_8DB8: SoundFreq% = BX: SoundDuration! = N_D456!  ' RT3E_5E
L_8DBB: BX = &HFFFF
L_8DBE: DX = BX
L_8DC0: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8DC3: BX = &H37
L_8DC6: DX = &HD492
L_8DC9: SoundFreq% = BX: SoundDuration! = N_D492!  ' RT3E_5E
L_8DCC: BX = &HFFFF
L_8DCF: DX = BX
L_8DD1: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8DD4: BX = &H50
L_8DD7: DX = &HCC60
L_8DDA: SoundFreq% = BX: SoundDuration! = N_CC60!  ' RT3E_5E
L_8DDD: BX = &HFFFF
L_8DE0: DX = BX
L_8DE2: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8DE5: BX = &H3C
L_8DE8: DX = &HD456
L_8DEB: SoundFreq% = BX: SoundDuration! = N_D456!  ' RT3E_5E
L_8DEE: BX = &HFFFF
L_8DF1: DX = BX
L_8DF3: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8DF6: RETURN
L_8DF7: GOSUB L_8DFD
L_8DFA: GOTO L_8F7C
L_8DFD: DI = &HD496
L_8E00: SI = &HC17C
L_8E03: N_D496! = N_C17C!  ' RT3F_7B
L_8E06: BX = DI
L_8E08: DI = &HD3F6
L_8E0B: SI = &HD3FE
L_8E0E: CompareLeft! = N_D3FE!: CompareRight! = N_D3F6!  ' RT3F_9F
L_8E11: IF CompareLeft! >= CompareRight! THEN GOTO L_8E16  ' flags from L_8E0E
L_8E13: GOTO L_8E1E
L_8E16: DI = BX
L_8E18: SI = &HCF1A
L_8E1B: N(DI) = N_CF1A!  ' RT3F_7B
L_8E1E: DI = &HD49A
L_8E21: SI = &HD432
L_8E24: N_D49A! = N_D432!  ' RT3F_7B
L_8E27: SI = &HBB46
L_8E2A: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_8E2D: GOTO L_8F08
L_8E30: DI = &H9422
L_8E33: SI = &HD072
L_8E36: FAC! = N_D072! * N_9422!  ' RT3F_8F
L_8E39: BX = &H1A
L_8E3C: FAC! = SIN(FAC!)  ' RT3D_39
L_8E3F: DI = &HD49E
L_8E42: BX = SI
L_8E44: N_D49E! = FAC!: SI = &H001A  ' RT3F_7D
L_8E47: SWAP BX, DI
L_8E49: SI = &HCEDA
L_8E4C: FAC! = N_CEDA! * N(DI)  ' RT3F_8F
L_8E4F: SWAP BX, DI
L_8E51: SI = &HD496
L_8E54: T_03! = FAC!  ' RT3F_71; inline=&H83
L_8E58: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_8E5B: DX = DI
L_8E5D: FAC! = T_03! + FAC!  ' RT3F_85; inline=&H83
L_8E61: DI = &HD3F6
L_8E64: FAC! = FAC! + N_D3F6!  ' RT3F_81
L_8E67: DI = &HD42A
L_8E6A: N_D42A! = FAC!: SI = &H001A  ' RT3F_7D
L_8E6D: SI = DX
L_8E6F: CX = DI
L_8E71: DI = &HC16C
L_8E74: FAC! = N(SI) * N_C16C!  ' RT3F_8F
L_8E77: SI = &HD3FA
L_8E7A: FAC! = N_D3FA! - FAC!  ' RT3F_9B
L_8E7D: DI = BX
L_8E7F: SI = &HCEDE
L_8E82: T_04! = FAC!  ' RT3F_71; inline=&H84
L_8E86: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_8E89: FAC! = T_04! + FAC!  ' RT3F_85; inline=&H84
L_8E8D: DI = &HD42E
L_8E90: N_D42E! = FAC!: SI = &H001A  ' RT3F_7D
L_8E93: BX = CX
L_8E95: DX = DI
L_8E97: CX = &HFFFF
L_8E9A: AX = CX
L_8E9C: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8E9F: BX = &HB54C
L_8EA2: DX = 4
L_8EA5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8EA8: BX = &H63
L_8EAB: DX = &HC99C
L_8EAE: SoundFreq% = BX: SoundDuration! = N_C99C!  ' RT3E_5E
L_8EB1: BX = AX
L_8EB3: DX = AX
L_8EB5: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8EB8: DI = &HC1D8
L_8EBB: SI = &H9426
L_8EBE: FAC! = N_9426! * N_C1D8!  ' RT3F_8F
L_8EC1: DI = &HD4A2
L_8EC4: SI = &HD49E
L_8EC7: T_03! = FAC!  ' RT3F_71; inline=&H83
L_8ECB: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_8ECE: DI = &HD4A6
L_8ED1: FAC! = FAC! + N_D4A6!  ' RT3F_81
L_8ED4: BX = CINT(FAC!)  ' RT3F_77
L_8ED7: DX = &HBEA0
L_8EDA: SoundFreq% = BX: SoundDuration! = N_BEA0!  ' RT3E_5E
L_8EDD: BX = &HFFFF
L_8EE0: DX = BX
L_8EE2: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8EE5: GOSUB L_8F49
L_8EE8: BX = &HD42A
L_8EEB: DX = &HD42E
L_8EEE: CX = &HFFFF
L_8EF1: AX = CX
L_8EF3: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8EF6: BX = &HB54C
L_8EF9: DX = 4
L_8EFC: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8EFF: DI = &HD49A
L_8F02: SI = &HD072
L_8F05: FAC! = N_D072! + N_D49A!  ' RT3F_7F
L_8F08: DI = &HD072
L_8F0B: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_8F0E: SI = &HD49A
L_8F11: CompareLeft! = N_D49A!: CompareRight! = 0  ' RT3F_A7
L_8F14: IF CompareLeft! < CompareRight! THEN GOTO L_8F19  ' flags from L_8F11
L_8F16: GOTO L_8F29
L_8F19: SI = DI
L_8F1B: DI = &H804E
L_8F1E: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_8F21: IF CompareLeft! < CompareRight! THEN GOTO L_8F26  ' flags from L_8F1E
L_8F23: GOTO L_8E30
L_8F26: GOTO L_8F37
L_8F29: DI = &H804E
L_8F2C: SI = &HD072
L_8F2F: CompareLeft! = N_D072!: CompareRight! = N_804E!  ' RT3F_9F
L_8F32: IF CompareLeft! > CompareRight! THEN GOTO L_8F37  ' flags from L_8F2F
L_8F34: GOTO L_8E30
L_8F37: BX = &H63
L_8F3A: DX = &HD4AA
L_8F3D: SoundFreq% = BX: SoundDuration! = N_D4AA!  ' RT3E_5E
L_8F40: BX = &HFFFF
L_8F43: DX = BX
L_8F45: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_8F48: RETURN
L_8F49: DI = &HD456
L_8F4C: SI = &HC7EA
L_8F4F: FAC! = N_C7EA! * N_D456!  ' RT3F_8F
L_8F52: DI = &HD4AE
L_8F55: N_D4AE! = FAC!: SI = &H001A  ' RT3F_7D
L_8F58: SI = &H804E
L_8F5B: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_8F5E: GOTO L_8F6B
L_8F61: ' Alignment NOP
L_8F62: DI = &H804E
L_8F65: SI = &HD462
L_8F68: FAC! = N_D462! + N_804E!  ' RT3F_7F
L_8F6B: DI = &HD462
L_8F6E: N_D462! = FAC!: SI = &H001A  ' RT3F_7D
L_8F71: SI = DI
L_8F73: DI = &HD4AE
L_8F76: CompareLeft! = N_D462!: CompareRight! = N_D4AE!  ' RT3F_9F
L_8F79: IF CompareLeft! <= CompareRight! THEN GOTO L_8F62  ' flags from L_8F76
L_8F7B: RETURN
L_8F7C: SI = &HD1BC
L_8F7F: CompareLeft! = N_D1BC!: CompareRight! = 0  ' RT3F_A7
L_8F82: IF CompareLeft! = CompareRight! THEN GOTO L_8F87  ' flags from L_8F7F
L_8F84: GOTO L_8F88
L_8F87: RETURN
L_8F88: DI = &HD48E
L_8F8B: SI = &HD3FE
L_8F8E: FAC! = N_D3FE! + N_D48E!  ' RT3F_7F
L_8F91: SWAP SI, DI
L_8F93: BX = SI
L_8F95: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8F98: SWAP BX, DI
L_8F9A: SI = &HD402
L_8F9D: FAC! = N_D402! + N(DI)  ' RT3F_7F
L_8FA0: DI = SI
L_8FA2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8FA5: DX = DI
L_8FA7: CX = &HFFFF
L_8FAA: AX = CX
L_8FAC: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8FAF: BX = &HADFC
L_8FB2: DX = 4
L_8FB5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8FB8: GOSUB L_90A3
L_8FBB: BX = &HD3FE
L_8FBE: DX = &HD402
L_8FC1: CX = &HFFFF
L_8FC4: AX = CX
L_8FC6: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8FC9: BX = &HAF20
L_8FCC: DX = 4
L_8FCF: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8FD2: GOSUB L_90A3
L_8FD5: BX = &HD3FE
L_8FD8: DX = &HD402
L_8FDB: CX = &HFFFF
L_8FDE: AX = CX
L_8FE0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8FE3: BX = &HB044
L_8FE6: DX = 4
L_8FE9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_8FEC: GOSUB L_90A3
L_8FEF: BX = &HD3FE
L_8FF2: DX = &HD402
L_8FF5: CX = &HFFFF
L_8FF8: AX = CX
L_8FFA: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_8FFD: BX = &HB168
L_9000: DX = 4
L_9003: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9006: GOSUB L_90A3
L_9009: BX = &HD3FE
L_900C: DX = &HD402
L_900F: CX = &HFFFF
L_9012: AX = CX
L_9014: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9017: BX = &HB28C
L_901A: DX = 4
L_901D: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9020: GOSUB L_90A3
L_9023: BX = &HD3FE
L_9026: DX = &HD402
L_9029: CX = &HFFFF
L_902C: AX = CX
L_902E: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9031: BX = &HB28C
L_9034: DX = 4
L_9037: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_903A: GOSUB L_87B2
L_903D: BX = &HD3FE
L_9040: DX = &HD402
L_9043: CX = &HFFFF
L_9046: AX = CX
L_9048: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_904B: BX = &HB168
L_904E: DX = 4
L_9051: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9054: GOSUB L_87B2
L_9057: BX = &HD3FE
L_905A: DX = &HD402
L_905D: CX = &HFFFF
L_9060: AX = CX
L_9062: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9065: BX = &HB044
L_9068: DX = 4
L_906B: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_906E: GOSUB L_87B2
L_9071: BX = &HD3FE
L_9074: DX = &HD402
L_9077: CX = &HFFFF
L_907A: AX = CX
L_907C: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_907F: BX = &HAF20
L_9082: DX = 4
L_9085: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9088: GOSUB L_87B2
L_908B: BX = &HD3FE
L_908E: DX = &HD402
L_9091: CX = &HFFFF
L_9094: AX = CX
L_9096: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9099: BX = &HADFC
L_909C: DX = 4
L_909F: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_90A2: RETURN
L_90A3: SI = &H9426
L_90A6: BX = BASIC_BOOL(N_9426! <> 0)  ' RT3F_1D
L_90A9: CompareLeft% = BX: CompareRight% = 0
L_90AB: IF CompareLeft% <> CompareRight% THEN GOTO L_90B0  ' flags from L_90A9
L_90AD: GOTO L_9106
L_90B0: SI = &H804E
L_90B3: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_90B6: GOTO L_90F6
L_90B9: ' Alignment NOP
L_90BA: FAC! = RND  ' RT3D_34
L_90BD: DI = &HD3BC
L_90C0: FAC! = FAC! * N_D3BC!  ' RT3F_91
L_90C3: DI = &HD350
L_90C6: FAC! = FAC! + N_D350!  ' RT3F_81
L_90C9: T_03! = FAC!  ' RT3F_71; inline=&H83
L_90CD: FAC! = RND  ' RT3D_34
L_90D0: DI = &HD4B2
L_90D3: FAC! = FAC! * N_D4B2!  ' RT3F_91
L_90D6: DI = &HD4B6
L_90D9: FAC! = FAC! + N_D4B6!  ' RT3F_81
L_90DC: BX = CINT(FAC!)  ' RT3F_77
L_90DF: DX = &HBEA0
L_90E2: SoundFreq% = BX: SoundDuration! = N_BEA0!  ' RT3E_5E
L_90E5: BX = &HFFFF
L_90E8: DX = BX
L_90EA: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_90ED: DI = &H804E
L_90F0: SI = &HBA90
L_90F3: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_90F6: DI = &HBA90
L_90F9: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_90FC: SI = DI
L_90FE: DI = &HD40A

```

### Further combat calculations

```basic
L_9101: CompareLeft! = N_BA90!: CompareRight! = N_D40A!  ' RT3F_9F
L_9104: IF CompareLeft! <= CompareRight! THEN GOTO L_90BA  ' flags from L_9101
L_9106: RETURN
L_9107: DI = &HD486
L_910A: SI = &H9426
L_910D: FAC! = N_9426! * N_D486!  ' RT3F_8F
L_9110: BX = &H1E61
L_9113: DX = &H1A
L_9116: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_9119: BX = &HFFFF
L_911C: DX = BX
L_911E: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_9121: BX = &HD3F6
L_9124: DX = &HD3FA
L_9127: CX = &HFFFF
L_912A: AX = CX
L_912C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_912F: BX = &HD3FE
L_9132: DX = &HD402
L_9135: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_9138: DI = &HC184
L_913B: SI = &H19B4
L_913E: FAC! = N_19B4! * N_C184!  ' RT3F_8F
L_9141: DI = &HBB56
L_9144: FAC! = FAC! + N_BB56!  ' RT3F_81
L_9147: BX = CINT(FAC!)  ' RT3F_1B
L_914A: DX = AX
L_914C: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_914F: BX = &H22B8
L_9152: DX = &H9426
L_9155: SoundFreq% = BX: SoundDuration! = N_9426!  ' RT3E_5E
L_9158: BX = AX
L_915A: DX = AX
L_915C: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_915F: BX = &HD3F6
L_9162: DX = &HD3FA
L_9165: CX = &HFFFF
L_9168: AX = CX
L_916A: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_916D: BX = &HD3FE
L_9170: DX = &HD402
L_9173: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_9176: DX = AX
L_9178: BX = 0
L_917A: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_917D: SI = &H9426
L_9180: FAC! = N_9426! * 2 ^ (2)  ' RT3F_AB; inline=&H02
L_9184: BX = &H270F
L_9187: DX = &H1A
L_918A: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_918D: BX = AX
L_918F: DX = AX
L_9191: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_9194: BX = &HD3F6
L_9197: DX = &HD3FA
L_919A: CX = &HFFFF
L_919D: AX = CX
L_919F: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_91A2: BX = &HD3FE
L_91A5: DX = &HD402
L_91A8: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_91AB: DI = &HC184
L_91AE: SI = &H19B4
L_91B1: FAC! = N_19B4! * N_C184!  ' RT3F_8F
L_91B4: DI = &H9412
L_91B7: FAC! = FAC! + N_9412!  ' RT3F_81
L_91BA: BX = CINT(FAC!)  ' RT3F_1B
L_91BD: DX = AX
L_91BF: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_91C2: SI = &H9426
L_91C5: FAC! = N_9426! * 2 ^ (2)  ' RT3F_AB; inline=&H02
L_91C9: BX = &H2B67
L_91CC: DX = &H1A
L_91CF: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_91D2: BX = AX
L_91D4: DX = AX
L_91D6: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_91D9: BX = &HC0
L_91DC: DX = &H18
L_91DF: CX = 0
L_91E1: AX = CX
L_91E3: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_91E6: BX = &H803A
L_91E9: DX = &HFF03
L_91EC: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_91EF: RETURN
L_91F0: DI = &HD4BA
L_91F3: SI = &HD432
L_91F6: N_D4BA! = N_D432!  ' RT3F_7B
L_91F9: SI = &HBB46
L_91FC: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_91FF: GOTO L_9270
L_9202: BX = &HD42A
L_9205: DX = &HD42E
L_9208: CX = &HFFFF
L_920B: AX = CX
L_920D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9210: BX = &HB54C
L_9213: DX = 4
L_9216: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9219: DI = &HD350
L_921C: SI = &H9426
L_921F: FAC! = N_9426! * N_D350!  ' RT3F_8F
L_9222: BX = &HFF
L_9225: DX = &H1A
L_9228: SoundFreq% = BX: SoundDuration! = FAC!  ' RT3E_5E
L_922B: BX = AX
L_922D: DX = AX
L_922F: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_9232: BX = &HD42A
L_9235: DX = &HD42E
L_9238: CX = &HFFFF
L_923B: AX = CX
L_923D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9240: CX = BX
L_9242: BX = &HB54C
L_9245: AX = DX
L_9247: DX = 4
L_924A: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_924D: SI = CX
L_924F: DI = &HCA7A
L_9252: FAC! = N(SI) + N_CA7A!  ' RT3F_7F
L_9255: DI = CX
L_9257: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_925A: SI = AX
L_925C: DI = &HCA7E
L_925F: FAC! = N(SI) + N_CA7E!  ' RT3F_7F
L_9262: DI = AX
L_9264: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9267: DI = &HD4BA
L_926A: SI = &HD072
L_926D: FAC! = N_D072! + N_D4BA!  ' RT3F_7F
L_9270: DI = &HD072
L_9273: N_D072! = FAC!: SI = &H001A  ' RT3F_7D
L_9276: SI = &HD4BA
L_9279: CompareLeft! = N_D4BA!: CompareRight! = 0  ' RT3F_A7
L_927C: IF CompareLeft! < CompareRight! THEN GOTO L_9281  ' flags from L_9279
L_927E: GOTO L_9291
L_9281: SI = DI
L_9283: DI = &H804E
L_9286: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_9289: IF CompareLeft! < CompareRight! THEN GOTO L_928E  ' flags from L_9286
L_928B: GOTO L_9202
L_928E: GOTO L_929F
L_9291: DI = &H804E
L_9294: SI = &HD072
L_9297: CompareLeft! = N_D072!: CompareRight! = N_804E!  ' RT3F_9F
L_929A: IF CompareLeft! > CompareRight! THEN GOTO L_929F  ' flags from L_9297
L_929C: GOTO L_9202
L_929F: SI = &HD1BC
L_92A2: CompareLeft! = N_D1BC!: CompareRight! = 0  ' RT3F_A7
L_92A5: IF CompareLeft! = CompareRight! THEN GOTO L_92AA  ' flags from L_92A2
L_92A7: GOTO L_92AB
L_92AA: RETURN
L_92AB: GOTO L_8CE1
L_92AE: DI = &HD4BE
L_92B1: SI = &HD46E
L_92B4: N_D4BE! = N_D46E!  ' RT3F_7B
L_92B7: DI = &HC120
L_92BA: N_C120! = N_D46E!  ' RT3F_7B
L_92BD: DI = &HC124
L_92C0: SI = &HC762
L_92C3: N_C124! = N_C762!  ' RT3F_7B
L_92C6: GOSUB L_06DB
L_92C9: DI = &HD4C2
L_92CC: N_D4C2! = FAC!: SI = &H001A  ' RT3F_7D
L_92CF: SI = DI
L_92D1: DI = &HC726
L_92D4: FAC! = N_D4C2! + N_C726!  ' RT3F_7F
L_92D7: BX = SI
L_92D9: DX = BX
L_92DB: BX = CINT(FAC!)  ' RT3F_77
L_92DE: DI = BX
L_92E0: DI = DI * (2 ^ 1)
L_92E2: DI = DI * (2 ^ 1)
L_92E4: DI = DI + &H1850
L_92E8: SI = DX
L_92EA: BX = DI
L_92EC: DI = &HD4C6
L_92EF: FAC! = N(SI) + N_D4C6!  ' RT3F_7F
L_92F2: CX = BX
L_92F4: BX = CINT(FAC!)  ' RT3F_77
L_92F7: SI = BX
L_92F9: SI = SI * (2 ^ 1)
L_92FB: SI = SI * (2 ^ 1)
L_92FD: SI = SI + &H1850
L_9301: SWAP DX, SI
L_9303: DI = &HD378
L_9306: FAC! = N(SI) + N_D378!  ' RT3F_7F
L_9309: BX = SI
L_930B: AX = BX
L_930D: BX = CINT(FAC!)  ' RT3F_77
L_9310: SI = BX
L_9312: SI = SI * (2 ^ 1)
L_9314: SI = SI * (2 ^ 1)
L_9316: SI = SI + &H1850
L_931A: FAC! = SGN(N(SI))  ' RT3F_2F
L_931D: SI = DX
L_931F: FAC! = N(SI) * FAC!  ' RT3F_93
L_9322: SI = AX
L_9324: DI = &HD39E
L_9327: T_03! = FAC!  ' RT3F_71; inline=&H83
L_932B: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_932E: BX = CINT(FAC!)  ' RT3F_77
L_9331: SI = BX
L_9333: SI = SI * (2 ^ 1)
L_9335: SI = SI * (2 ^ 1)
L_9337: SI = SI + &H1850
L_933B: SWAP SI, AX
L_933C: DI = &HC1B8
L_933F: FAC! = N(SI) + N_C1B8!  ' RT3F_7F
L_9342: BX = SI
L_9344: DX = BX
L_9346: BX = CINT(FAC!)  ' RT3F_77
L_9349: SI = BX
L_934B: SI = SI * (2 ^ 1)
L_934D: SI = SI * (2 ^ 1)
L_934F: SI = SI + &H1850
L_9353: FAC! = SGN(N(SI))  ' RT3F_2F
L_9356: SI = AX
L_9358: FAC! = N(SI) * FAC!  ' RT3F_93
L_935B: FAC! = T_03! + FAC!  ' RT3F_85; inline=&H83
L_935F: SI = DX
L_9361: DI = &HD4CA
L_9364: T_04! = FAC!  ' RT3F_71; inline=&H84
L_9368: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_936B: BX = CINT(FAC!)  ' RT3F_77
L_936E: SI = BX
L_9370: SI = SI * (2 ^ 1)
L_9372: SI = SI * (2 ^ 1)
L_9374: SI = SI + &H1850
L_9378: SWAP DX, SI
L_937A: DI = &HD4CE
L_937D: FAC! = N(SI) + N_D4CE!  ' RT3F_7F
L_9380: BX = CINT(FAC!)  ' RT3F_77
L_9383: SI = BX
L_9385: SI = SI * (2 ^ 1)
L_9387: SI = SI * (2 ^ 1)
L_9389: SI = SI + &H1850
L_938D: FAC! = SGN(N(SI))  ' RT3F_2F
L_9390: SI = DX
L_9392: FAC! = N(SI) * FAC!  ' RT3F_93
L_9395: FAC! = T_04! + FAC!  ' RT3F_85; inline=&H84
L_9399: DI = CX
L_939B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_939E: DI = &H9412
L_93A1: SI = &HC762
L_93A4: FAC! = N_C762! + N_9412!  ' RT3F_7F
L_93A7: DI = &HC9EC
L_93AA: N_C9EC! = FAC!: SI = &H001A  ' RT3F_7D
L_93AD: SI = &HC170
L_93B0: FAC! = N_C170!: DI = &H001E  ' RT3F_6F
L_93B3: GOTO L_942B
L_93B6: DI = &HC178
L_93B9: SI = &HBA90
L_93BC: FAC! = N_BA90! + N_C178!  ' RT3F_7F
L_93BF: BX = SI
L_93C1: DX = BX
L_93C3: BX = CINT(FAC!)  ' RT3F_77
L_93C6: SI = BX
L_93C8: SI = SI * (2 ^ 1)
L_93CA: SI = SI * (2 ^ 1)
L_93CC: SI = SI + &H1850
L_93D0: DI = &HC9EC
L_93D3: CompareLeft! = N(SI): CompareRight! = N_C9EC!  ' RT3F_9F
L_93D6: BX = 0
L_93D9: IF CompareLeft! <> CompareRight! THEN GOTO L_93DC  ' flags from L_93D3
L_93DB: BX = BX - 1
L_93DC: FAC! = CSNG(BX)  ' RT3F_57
L_93DF: SI = DX
L_93E1: T_03! = FAC!  ' RT3F_71; inline=&H83
L_93E5: BX = CINT(N(SI))  ' RT3F_75
L_93E8: SI = BX
L_93EA: SI = SI * (2 ^ 1)
L_93EC: SI = SI * (2 ^ 1)
L_93EE: SI = SI + &H1850
L_93F2: FAC! = SGN(N(SI))  ' RT3F_2F
L_93F5: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_93F9: SI = DX
L_93FB: DI = &HC0F4
L_93FE: T_04! = FAC!  ' RT3F_71; inline=&H84
L_9402: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9405: BX = CINT(FAC!)  ' RT3F_77
L_9408: DI = BX
L_940A: DI = DI * (2 ^ 1)
L_940C: DI = DI * (2 ^ 1)
L_940E: DI = DI + &H1850
L_9412: SI = &HBEA8
L_9415: FAC! = N_BEA8! * N(DI)  ' RT3F_8F
L_9418: SI = &HD4BE
L_941B: FAC! = N_D4BE! - FAC!  ' RT3F_9B
L_941E: DI = SI
L_9420: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9423: SI = DX
L_9425: DI = &HC184
L_9428: FAC! = N(SI) + N_C184!  ' RT3F_7F
L_942B: DI = &HBA90
L_942E: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_9431: SI = DI
L_9433: DI = &HC19C
L_9436: CompareLeft! = N_BA90!: CompareRight! = N_C19C!  ' RT3F_9F
L_9439: IF CompareLeft! > CompareRight! THEN GOTO L_943E  ' flags from L_9436
L_943B: GOTO L_93B6
L_943E: SI = &HC1A0
L_9441: FAC! = N_C1A0!: DI = &H001E  ' RT3F_6F
L_9444: GOTO L_94BD
L_9447: ' Alignment NOP
L_9448: DI = &H9412
L_944B: SI = &HBA90
L_944E: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_9451: BX = SI
L_9453: DX = BX
L_9455: BX = CINT(FAC!)  ' RT3F_77
L_9458: SI = BX
L_945A: SI = SI * (2 ^ 1)
L_945C: SI = SI * (2 ^ 1)
L_945E: SI = SI + &H1850
L_9462: DI = &HC9EC
L_9465: CompareLeft! = N(SI): CompareRight! = N_C9EC!  ' RT3F_9F
L_9468: BX = 0
L_946B: IF CompareLeft! <> CompareRight! THEN GOTO L_946E  ' flags from L_9465
L_946D: BX = BX - 1
L_946E: FAC! = CSNG(BX)  ' RT3F_57
L_9471: SI = DX
L_9473: T_03! = FAC!  ' RT3F_71; inline=&H83
L_9477: BX = CINT(N(SI))  ' RT3F_75
L_947A: SI = BX
L_947C: SI = SI * (2 ^ 1)
L_947E: SI = SI * (2 ^ 1)
L_9480: SI = SI + &H1850
L_9484: FAC! = SGN(N(SI))  ' RT3F_2F
L_9487: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_948B: SI = DX
L_948D: DI = &H804E
L_9490: T_04! = FAC!  ' RT3F_71; inline=&H84
L_9494: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9497: BX = CINT(FAC!)  ' RT3F_77
L_949A: DI = BX
L_949C: DI = DI * (2 ^ 1)
L_949E: DI = DI * (2 ^ 1)
L_94A0: DI = DI + &H1850
L_94A4: SI = &HBEA8
L_94A7: FAC! = N_BEA8! * N(DI)  ' RT3F_8F
L_94AA: SI = &HD4BE
L_94AD: FAC! = N_D4BE! - FAC!  ' RT3F_9B
L_94B0: DI = SI
L_94B2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_94B5: SI = DX
L_94B7: DI = &HBB56
L_94BA: FAC! = N(SI) + N_BB56!  ' RT3F_7F
L_94BD: DI = &HBA90
L_94C0: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_94C3: SI = DI
L_94C5: DI = &HC1A4
L_94C8: CompareLeft! = N_BA90!: CompareRight! = N_C1A4!  ' RT3F_9F
L_94CB: IF CompareLeft! > CompareRight! THEN GOTO L_94D0  ' flags from L_94C8
L_94CD: GOTO L_9448
L_94D0: SI = &HC1C4
L_94D3: FAC! = N_C1C4!: DI = &H001E  ' RT3F_6F
L_94D6: GOTO L_954F
L_94D9: ' Alignment NOP
L_94DA: DI = &H9412
L_94DD: SI = &HBA90
L_94E0: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_94E3: BX = SI
L_94E5: DX = BX
L_94E7: BX = CINT(FAC!)  ' RT3F_77
L_94EA: SI = BX
L_94EC: SI = SI * (2 ^ 1)
L_94EE: SI = SI * (2 ^ 1)
L_94F0: SI = SI + &H1850
L_94F4: DI = &HC9EC
L_94F7: CompareLeft! = N(SI): CompareRight! = N_C9EC!  ' RT3F_9F
L_94FA: BX = 0
L_94FD: IF CompareLeft! <> CompareRight! THEN GOTO L_9500  ' flags from L_94F7
L_94FF: BX = BX - 1
L_9500: FAC! = CSNG(BX)  ' RT3F_57
L_9503: SI = DX
L_9505: T_03! = FAC!  ' RT3F_71; inline=&H83
L_9509: BX = CINT(N(SI))  ' RT3F_75
L_950C: SI = BX
L_950E: SI = SI * (2 ^ 1)
L_9510: SI = SI * (2 ^ 1)
L_9512: SI = SI + &H1850
L_9516: FAC! = SGN(N(SI))  ' RT3F_2F
L_9519: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_951D: SI = DX
L_951F: DI = &H804E
L_9522: T_04! = FAC!  ' RT3F_71; inline=&H84
L_9526: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9529: BX = CINT(FAC!)  ' RT3F_77
L_952C: DI = BX
L_952E: DI = DI * (2 ^ 1)
L_9530: DI = DI * (2 ^ 1)
L_9532: DI = DI + &H1850
L_9536: SI = &HBEA8
L_9539: FAC! = N_BEA8! * N(DI)  ' RT3F_8F
L_953C: SI = &HD4BE
L_953F: FAC! = N_D4BE! - FAC!  ' RT3F_9B
L_9542: DI = SI
L_9544: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9547: SI = DX
L_9549: DI = &HBB56
L_954C: FAC! = N(SI) + N_BB56!  ' RT3F_7F
L_954F: DI = &HBA90
L_9552: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_9555: SI = DI
L_9557: DI = &HC978
L_955A: CompareLeft! = N_BA90!: CompareRight! = N_C978!  ' RT3F_9F
L_955D: IF CompareLeft! > CompareRight! THEN GOTO L_9562  ' flags from L_955A
L_955F: GOTO L_94DA
L_9562: DI = &HC69C
L_9565: SI = &HD4C2
L_9568: FAC! = N_D4C2! + N_C69C!  ' RT3F_7F
L_956B: BX = SI
L_956D: DX = BX
L_956F: BX = CINT(FAC!)  ' RT3F_77
L_9572: DI = BX
L_9574: DI = DI * (2 ^ 1)
L_9576: DI = DI * (2 ^ 1)
L_9578: DI = DI + &H1850
L_957C: SI = DX
L_957E: BX = DI
L_9580: DI = &HC726
L_9583: FAC! = N(SI) + N_C726!  ' RT3F_7F
L_9586: DX = BX
L_9588: BX = CINT(FAC!)  ' RT3F_77
L_958B: SI = BX
L_958D: SI = SI * (2 ^ 1)
L_958F: SI = SI * (2 ^ 1)
L_9591: SI = SI + &H1850
L_9595: DI = &HD4BE
L_9598: FAC! = N(SI) + N_D4BE!  ' RT3F_7F
L_959B: DI = &HBAF4
L_959E: FAC! = FAC! / N_BAF4!  ' RT3F_89
L_95A1: BX = &H1A
L_95A4: FAC! = INT(FAC!)  ' RT3D_03
L_95A7: DI = DX
L_95A9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_95AC: DI = &HC69C
L_95AF: SI = &HD4C2
L_95B2: FAC! = N_D4C2! + N_C69C!  ' RT3F_7F
L_95B5: BX = SI
L_95B7: DX = BX
L_95B9: BX = CINT(FAC!)  ' RT3F_77
L_95BC: SI = BX
L_95BE: SI = SI * (2 ^ 1)
L_95C0: SI = SI * (2 ^ 1)
L_95C2: SI = SI + &H1850
L_95C6: SWAP DX, SI
L_95C8: DI = &HBAD0
L_95CB: FAC! = N(SI) + N_BAD0!  ' RT3F_7F
L_95CE: BX = SI
L_95D0: CX = BX
L_95D2: BX = CINT(FAC!)  ' RT3F_77
L_95D5: DI = BX
L_95D7: DI = DI * (2 ^ 1)
L_95D9: DI = DI * (2 ^ 1)
L_95DB: DI = DI + &H1850
L_95DF: SI = DX
L_95E1: FAC! = N(SI) / N(DI)  ' RT3F_87
L_95E4: SI = &H9412
L_95E7: FAC! = N_9412! - FAC!  ' RT3F_9B
L_95EA: DI = &HC766
L_95ED: N_C766! = FAC!: SI = &H001A  ' RT3F_7D
L_95F0: SI = CX
L_95F2: BX = DI
L_95F4: DI = &HC184
L_95F7: FAC! = N(SI) + N_C184!  ' RT3F_7F
L_95FA: DX = BX
L_95FC: BX = CINT(FAC!)  ' RT3F_77
L_95FF: SI = BX
L_9601: SI = SI * (2 ^ 1)
L_9603: SI = SI * (2 ^ 1)
L_9605: SI = SI + &H1850
L_9609: DI = DX
L_960B: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_960E: DI = &HBB52
L_9611: FAC! = FAC! + N_BB52!  ' RT3F_81
L_9614: BX = &H1A
L_9617: FAC! = INT(FAC!)  ' RT3D_03
L_961A: DI = DX
L_961C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_961F: SI = DX
L_9621: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_9624: IF CompareLeft! < CompareRight! THEN GOTO L_9629  ' flags from L_9621
L_9626: GOTO L_9632
L_9629: SI = &HC1DC
L_962C: N(DI) = N_C1DC!  ' RT3F_7B
L_962F: GOTO L_9656
L_9632: DI = &HC184
L_9635: SI = &HD4C2
L_9638: FAC! = N_D4C2! + N_C184!  ' RT3F_7F
L_963B: BX = CINT(FAC!)  ' RT3F_77
L_963E: SI = BX
L_9640: SI = SI * (2 ^ 1)
L_9642: SI = SI * (2 ^ 1)
L_9644: SI = SI + &H1850
L_9648: DI = &HC766
L_964B: CompareLeft! = N(SI): CompareRight! = N_C766!  ' RT3F_9F
L_964E: IF CompareLeft! < CompareRight! THEN GOTO L_9653  ' flags from L_964B
L_9650: GOTO L_9656
L_9653: N(DI) = N(SI)  ' RT3F_7B
L_9656: DI = &HC17C
L_9659: SI = &HD4C2
L_965C: FAC! = N_D4C2! + N_C17C!  ' RT3F_7F
L_965F: BX = CINT(FAC!)  ' RT3F_77
L_9662: DI = BX
L_9664: DI = DI * (2 ^ 1)
L_9666: DI = DI * (2 ^ 1)
L_9668: DI = DI + &H1850
L_966C: BX = DI
L_966E: DI = &HBB52
L_9671: SI = &HC766
L_9674: FAC! = N_C766! + N_BB52!  ' RT3F_7F
L_9677: DX = BX
L_9679: BX = &H1A
L_967C: FAC! = INT(FAC!)  ' RT3D_03
L_967F: DI = DX
L_9681: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9684: RETURN
L_9685: DI = &HD4D2
L_9688: SI = &HC6B0
L_968B: N_D4D2! = N_C6B0!  ' RT3F_7B
L_968E: SI = &HC10C
L_9691: FAC! = N_C10C!: DI = &H001E  ' RT3F_6F
L_9694: GOTO L_96D2
L_9697: ' Alignment NOP
L_9698: DI = &H9412
L_969B: SI = &HBA90
L_969E: FAC! = N_BA90! + N_9412!  ' RT3F_7F
L_96A1: BX = SI
L_96A3: DX = BX
L_96A5: BX = CINT(FAC!)  ' RT3F_77
L_96A8: SI = BX
L_96AA: SI = SI * (2 ^ 1)
L_96AC: SI = SI * (2 ^ 1)
L_96AE: SI = SI + &H4288
L_96B2: SWAP DX, SI
L_96B4: BX = SI
L_96B6: CX = BX
L_96B8: BX = CINT(N(SI))  ' RT3F_75
L_96BB: DI = BX
L_96BD: DI = DI * (2 ^ 1)
L_96BF: DI = DI * (2 ^ 1)
L_96C1: DI = DI + &H4288
L_96C5: SI = DX
L_96C7: SWAP S(SI), S(DI)  ' RT3F_14
L_96CA: SI = CX
L_96CC: DI = &HD4D2
L_96CF: FAC! = N(SI) + N_D4D2!  ' RT3F_7F
L_96D2: DI = &HBA90
L_96D5: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_96D8: SI = &HD4D2
L_96DB: CompareLeft! = N_D4D2!: CompareRight! = 0  ' RT3F_A7
L_96DE: IF CompareLeft! < CompareRight! THEN GOTO L_96E3  ' flags from L_96DB
L_96E0: GOTO L_96F0
L_96E3: SI = DI
L_96E5: DI = &H804E
L_96E8: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_96EB: IF CompareLeft! >= CompareRight! THEN GOTO L_9698  ' flags from L_96E8
L_96ED: GOTO L_96FB
L_96F0: DI = &H804E
L_96F3: SI = &HBA90
L_96F6: CompareLeft! = N_BA90!: CompareRight! = N_804E!  ' RT3F_9F
L_96F9: IF CompareLeft! <= CompareRight! THEN GOTO L_9698  ' flags from L_96F6
L_96FB: RETURN
L_96FC: DI = &HC1E0
L_96FF: SI = &HBAF0
L_9702: N_C1E0! = N_BAF0!  ' RT3F_7B
L_9705: SI = &HBB46
L_9708: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_970B: GOTO L_9760
L_970E: SI = &HBB46
L_9711: FAC! = N_BB46!: DI = &H001E  ' RT3F_6F
L_9714: GOTO L_9747
L_9717: ' Alignment NOP
L_9718: SI = &HC634
L_971B: BX = SI
L_971D: DX = BX
L_971F: BX = CINT(N_C634!)  ' RT3F_75
L_9722: AX = BX
L_9724: DI = 9
L_9727: CX = DX
L_9729: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_972B: DI = AX
L_972D: SI = &HBA90
L_9730: BX = CINT(N_BA90!)  ' RT3F_75
L_9733: BX = BX + AX
L_9735: DI = BX
L_9737: DI = DI * (2 ^ 1)
L_9739: WORD(DI - &H4436) = 1
L_973F: SI = CX
L_9741: DI = &H804E
L_9744: FAC! = N_C634! + N_804E!  ' RT3F_7F
L_9747: DI = &HC634
L_974A: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_974D: SI = DI
L_974F: DI = &HC17C
L_9752: CompareLeft! = N_C634!: CompareRight! = N_C17C!  ' RT3F_9F
L_9755: IF CompareLeft! <= CompareRight! THEN GOTO L_9718  ' flags from L_9752
L_9757: DI = &H804E
L_975A: SI = &HBA90
L_975D: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_9760: DI = &HBA90
L_9763: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_9766: SI = DI
L_9768: DI = &HC17C
L_976B: CompareLeft! = N_BA90!: CompareRight! = N_C17C!  ' RT3F_9F
L_976E: IF CompareLeft! <= CompareRight! THEN GOTO L_970E  ' flags from L_976B
L_9770: DI = &HC178
L_9773: SI = &HC1E0
L_9776: CompareLeft! = N_C1E0!: CompareRight! = N_C178!  ' RT3F_9F
L_9779: IF CompareLeft! > CompareRight! THEN GOTO L_977E  ' flags from L_9776
L_977B: GOTO L_97E1
L_977E: SI = &HC640
L_9781: FAC! = N_C640!: DI = &H001E  ' RT3F_6F
L_9784: GOTO L_97D1
L_9787: ' Alignment NOP
L_9788: SI = &HBA90
L_978B: BX = SI
L_978D: DX = BX
L_978F: BX = CINT(N_BA90!)  ' RT3F_75
L_9792: AX = BX
L_9794: DI = 9
L_9797: CX = DX
L_9799: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_979B: DI = AX
L_979D: DI = DI * (2 ^ 1)
L_979F: WORD(DI - &H4436) = 3
L_97A5: AX = AX + 8
L_97A8: DI = AX
L_97AA: DI = DI * (2 ^ 1)
L_97AC: WORD(DI - &H4436) = 3
L_97B2: DI = BX
L_97B4: DI = DI * (2 ^ 1)
L_97B6: WORD(DI - &H4436) = 3
L_97BC: BX = BX + &H48
L_97BF: DI = BX
L_97C1: DI = DI * (2 ^ 1)
L_97C3: WORD(DI - &H4436) = 3
L_97C9: SI = CX
L_97CB: DI = &H804E
L_97CE: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_97D1: DI = &HBA90
L_97D4: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_97D7: SI = DI
L_97D9: DI = &HC17C
L_97DC: CompareLeft! = N_BA90!: CompareRight! = N_C17C!  ' RT3F_9F
L_97DF: IF CompareLeft! <= CompareRight! THEN GOTO L_9788  ' flags from L_97DC
L_97E1: DI = &HD4D6
L_97E4: SI = &HC6B0
L_97E7: N_D4D6! = N_C6B0!  ' RT3F_7B
L_97EA: SI = &HBA94
L_97ED: FAC! = N_BA94!: DI = &H001E  ' RT3F_6F
L_97F0: GOTO L_98AD
L_97F3: ' Alignment NOP
L_97F4: FAC! = RND  ' RT3D_34
L_97F7: DI = &HC1BC
L_97FA: FAC! = FAC! * N_C1BC!  ' RT3F_91
L_97FD: BX = &H1A
L_9800: FAC! = INT(FAC!)  ' RT3D_03
L_9803: DI = &HD4DA
L_9806: N_D4DA! = FAC!: SI = &H001A  ' RT3F_7D
L_9809: BX = DI
L_980B: DI = &HBB4A
L_980E: SI = &HBAF0
L_9811: CompareLeft! = N_BAF0!: CompareRight! = N_BB4A!  ' RT3F_9F
L_9814: IF CompareLeft! = CompareRight! THEN GOTO L_9819  ' flags from L_9811
L_9816: GOTO L_982D
L_9819: DI = &HBB42
L_981C: SI = &HD486
L_981F: FAC! = N_D486! - N_BB42!  ' RT3F_97
L_9822: DI = &HC69C
L_9825: FAC! = FAC! * N_C69C!  ' RT3F_91
L_9828: DI = BX
L_982A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_982D: DI = &HD4DE
L_9830: SI = &HD4DA
L_9833: N_D4DE! = N_D4DA!  ' RT3F_7B
L_9836: SI = &H804E
L_9839: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_983C: GOTO L_9894
L_983F: ' Alignment NOP
L_9840: SI = &HD4E2
L_9843: BX = CINT(N_D4E2!)  ' RT3F_75
L_9846: FAC! = RND  ' RT3D_34
L_9849: DI = &HC194
L_984C: FAC! = FAC! * N_C194!  ' RT3F_91
L_984F: DX = DI
L_9851: DI = &H804E
L_9854: FAC! = FAC! + N_804E!  ' RT3F_81
L_9857: CX = BX
L_9859: BX = &H1A
L_985C: FAC! = INT(FAC!)  ' RT3D_03
L_985F: BX = CINT(FAC!)  ' RT3F_77
L_9862: AX = BX
L_9864: SI = 9
L_9867: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_9869: SI = AX
L_986B: FAC! = RND  ' RT3D_34
L_986E: BX = DI
L_9870: DI = &HC194
L_9873: FAC! = FAC! * N_C194!  ' RT3F_91
L_9876: DI = BX
L_9878: FAC! = FAC! + N(DI)  ' RT3F_81
L_987B: BX = &H1A
L_987E: FAC! = INT(FAC!)  ' RT3D_03
L_9881: BX = CINT(FAC!)  ' RT3F_77
L_9884: BX = BX + AX
L_9886: SI = BX
L_9888: SI = SI * (2 ^ 1)
L_988A: WORD(SI - &H4436) = CX
L_988E: SI = &HBA90
L_9891: FAC! = N_BA90! + N(DI)  ' RT3F_7F
L_9894: DI = &HBA90
L_9897: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_989A: SI = DI
L_989C: DI = &HD4DE
L_989F: CompareLeft! = N_BA90!: CompareRight! = N_D4DE!  ' RT3F_9F
L_98A2: IF CompareLeft! <= CompareRight! THEN GOTO L_9840  ' flags from L_989F
L_98A4: DI = &HD4D6
L_98A7: SI = &HD4E2
L_98AA: FAC! = N_D4E2! + N_D4D6!  ' RT3F_7F
L_98AD: DI = &HD4E2
L_98B0: N_D4E2! = FAC!: SI = &H001A  ' RT3F_7D
L_98B3: SI = &HD4D6
L_98B6: CompareLeft! = N_D4D6!: CompareRight! = 0  ' RT3F_A7
L_98B9: IF CompareLeft! < CompareRight! THEN GOTO L_98BE  ' flags from L_98B6
L_98BB: GOTO L_98CE
L_98BE: SI = DI
L_98C0: DI = &H9412
L_98C3: CompareLeft! = N(SI): CompareRight! = N_9412!  ' RT3F_9F
L_98C6: IF CompareLeft! < CompareRight! THEN GOTO L_98CB  ' flags from L_98C3
L_98C8: GOTO L_97F4
L_98CB: GOTO L_98DC
L_98CE: DI = &H9412
L_98D1: SI = &HD4E2
L_98D4: CompareLeft! = N_D4E2!: CompareRight! = N_9412!  ' RT3F_9F
L_98D7: IF CompareLeft! > CompareRight! THEN GOTO L_98DC  ' flags from L_98D4
L_98D9: GOTO L_97F4
L_98DC: SI = &HBA94
L_98DF: FAC! = N_BA94!: DI = &H001E  ' RT3F_6F
L_98E2: GOTO L_991D
L_98E5: ' Alignment NOP
L_98E6: SI = &HC6B8
L_98E9: BX = SI
L_98EB: DX = BX
L_98ED: BX = CINT(N_C6B8!)  ' RT3F_75
L_98F0: AX = BX
L_98F2: DI = 9
L_98F5: CX = DX
L_98F7: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_98F9: DI = AX
L_98FB: DI = DI + 4
L_98FE: DI = DI * (2 ^ 1)

```

### Ability dispatch and effects

```basic
L_9900: BX = WORD(DI - &H4436)
L_9904: BX = BX - 1
L_9905: CompareLeft% = BX: CompareRight% = 0
L_9907: IF CompareLeft% = CompareRight% THEN GOTO L_9910  ' flags from L_9905
L_9909: BX = 1
L_990C: IF CompareLeft% >= CompareRight% THEN GOTO L_9910  ' flags from L_9905
L_990E: BX = -BX
L_9910: BX = BX + 1
L_9911: WORD(DI - &H4436) = BX
L_9915: SI = CX
L_9917: DI = &H804E
L_991A: FAC! = N(SI) + N_804E!  ' RT3F_7F
L_991D: DI = &HC6B8
L_9920: N_C6B8! = FAC!: SI = &H001A  ' RT3F_7D
L_9923: SI = DI
L_9925: DI = &HC194
L_9928: CompareLeft! = N_C6B8!: CompareRight! = N_C194!  ' RT3F_9F
L_992B: IF CompareLeft! <= CompareRight! THEN GOTO L_98E6  ' flags from L_9928
L_992D: DI = &HD4E6
L_9930: SI = &HC6B0
L_9933: N_D4E6! = N_C6B0!  ' RT3F_7B
L_9936: SI = &HC194
L_9939: FAC! = N_C194!: DI = &H001E  ' RT3F_6F
L_993C: GOTO L_9A4F
L_993F: ' Alignment NOP
L_9940: SI = &HC634
L_9943: FAC! = N_C634! * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_9947: DI = &HBF9E
L_994A: FAC! = FAC! + N_BF9E!  ' RT3F_81
L_994D: DI = &HD42E
L_9950: N_D42E! = FAC!: SI = &H001A  ' RT3F_7D
L_9953: SI = &H804E
L_9956: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_9959: GOTO L_9A33
L_995C: SI = &HBA90
L_995F: FAC! = N_BA90! * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_9963: DI = &HD4EA
L_9966: BX = SI
L_9968: FAC! = FAC! + N_D4EA!  ' RT3F_81
L_996B: DI = &HD42A
L_996E: N_D42A! = FAC!: SI = &H001A  ' RT3F_7D
L_9971: SI = &HC634
L_9974: DX = BX
L_9976: BX = CINT(N_C634!)  ' RT3F_75
L_9979: AX = BX
L_997B: DI = 9
L_997E: CX = DX
L_9980: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_9982: DI = AX
L_9984: SI = CX
L_9986: BX = CINT(N(SI))  ' RT3F_75
L_9989: BX = BX + AX
L_998B: DI = BX
L_998D: DI = DI * (2 ^ 1)
L_998F: BX = WORD(DI - &H4436)
L_9993: ON BX GOTO L_999F, L_99B9, L_99F9, L_9A13  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_999F: BX = &HD42A
L_99A2: DX = &HD42E
L_99A5: CX = &HFFFF
L_99A8: AX = CX
L_99AA: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_99AD: BX = &HBC6C
L_99B0: DX = 4
L_99B3: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_99B6: GOTO L_9A2A
L_99B9: BX = &HD42A
L_99BC: DX = &HD42E
L_99BF: CX = &HFFFF
L_99C2: AX = CX
L_99C4: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_99C7: BX = &HBCF0
L_99CA: DX = 4
L_99CD: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_99D0: SI = &HBA90
L_99D3: FAC! = N_BA90! * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_99D7: DI = &HD4EE
L_99DA: FAC! = FAC! + N_D4EE!  ' RT3F_81
L_99DD: DI = &HC530
L_99E0: N_C530! = FAC!: SI = &H001A  ' RT3F_7D
L_99E3: SI = &HC634
L_99E6: FAC! = N_C634! * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_99EA: DI = &HD4F2
L_99ED: FAC! = FAC! + N_D4F2!  ' RT3F_81
L_99F0: DI = &HC554
L_99F3: N_C554! = FAC!: SI = &H001A  ' RT3F_7D
L_99F6: GOTO L_9A2A
L_99F9: BX = &HD42A
L_99FC: DX = &HD42E
L_99FF: CX = &HFFFF
L_9A02: AX = CX
L_9A04: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9A07: BX = &HBD74
L_9A0A: DX = 4
L_9A0D: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9A10: GOTO L_9A2A
L_9A13: BX = &HD42A
L_9A16: DX = &HD42E
L_9A19: CX = &HFFFF
L_9A1C: AX = CX
L_9A1E: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9A21: BX = &HBDF8
L_9A24: DX = 4
L_9A27: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9A2A: DI = &H804E
L_9A2D: SI = &HBA90
L_9A30: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_9A33: DI = &HBA90
L_9A36: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_9A39: SI = DI
L_9A3B: DI = &HC194
L_9A3E: CompareLeft! = N_BA90!: CompareRight! = N_C194!  ' RT3F_9F
L_9A41: IF CompareLeft! > CompareRight! THEN GOTO L_9A46  ' flags from L_9A3E
L_9A43: GOTO L_995C
L_9A46: DI = &HD4E6
L_9A49: SI = &HC634
L_9A4C: FAC! = N_C634! + N_D4E6!  ' RT3F_7F
L_9A4F: DI = &HC634
L_9A52: N_C634! = FAC!: SI = &H001A  ' RT3F_7D
L_9A55: SI = &HD4E6
L_9A58: CompareLeft! = N_D4E6!: CompareRight! = 0  ' RT3F_A7
L_9A5B: IF CompareLeft! < CompareRight! THEN GOTO L_9A60  ' flags from L_9A58
L_9A5D: GOTO L_9A70
L_9A60: SI = DI
L_9A62: DI = &H804E
L_9A65: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_9A68: IF CompareLeft! < CompareRight! THEN GOTO L_9A6D  ' flags from L_9A65
L_9A6A: GOTO L_9940
L_9A6D: GOTO L_9A7E
L_9A70: DI = &H804E
L_9A73: SI = &HC634
L_9A76: CompareLeft! = N_C634!: CompareRight! = N_804E!  ' RT3F_9F
L_9A79: IF CompareLeft! > CompareRight! THEN GOTO L_9A7E  ' flags from L_9A76
L_9A7B: GOTO L_9940
L_9A7E: DI = &HC534
L_9A81: SI = &HD4F6
L_9A84: N_C534! = N_D4F6!  ' RT3F_7B
L_9A87: DI = &HC558
L_9A8A: BX = SI
L_9A8C: SI = &HC1D4
L_9A8F: N_C558! = N_C1D4!  ' RT3F_7B
L_9A92: SI = BX
L_9A94: DI = &HC538
L_9A97: N_C538! = N_D4F6!  ' RT3F_7B
L_9A9A: DI = &HC55C
L_9A9D: SI = &HD4FA
L_9AA0: N_C55C! = N_D4FA!  ' RT3F_7B
L_9AA3: DI = &HBAF4
L_9AA6: SI = &HC1E0
L_9AA9: CompareLeft! = N_C1E0!: CompareRight! = N_BAF4!  ' RT3F_9F
L_9AAC: IF CompareLeft! > CompareRight! THEN GOTO L_9AB1  ' flags from L_9AA9
L_9AAE: GOTO L_9B05
L_9AB1: WORD(&HBC62) = 1
L_9AB7: BX = &HF5
L_9ABA: DX = &H90
L_9ABD: CX = 0
L_9ABF: AX = CX
L_9AC1: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_9AC4: BX = &H109
L_9AC7: DX = &H97
L_9ACA: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_9ACD: SI = &H19B4
L_9AD0: FAC! = N_19B4! * 2 ^ (1)  ' RT3F_AB; inline=&H01
L_9AD4: SI = &HBB56
L_9AD7: FAC! = N_BB56! - FAC!  ' RT3F_9B
L_9ADA: BX = CINT(FAC!)  ' RT3F_1B
L_9ADD: DX = 1
L_9AE0: CX = &HFFFF
L_9AE3: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_9AE6: CX = AX
L_9AE8: BX = &HF7
L_9AEB: DX = &H90
L_9AEE: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_9AF1: BX = &H107
L_9AF4: DX = &H97
L_9AF7: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_9AFA: BX = 0
L_9AFC: DX = 1
L_9AFF: CX = &HFFFF
L_9B02: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_9B05: RETURN
L_9B06: DI = &H804E
L_9B09: SI = &H19B4
L_9B0C: CompareLeft! = N_19B4!: CompareRight! = N_804E!  ' RT3F_9F
L_9B0F: IF CompareLeft! <> CompareRight! THEN GOTO L_9B14  ' flags from L_9B0C
L_9B11: GOTO L_9D41
L_9B14: FAC! = TIMER  ' RT3D_43
L_9B17: DI = &HD4FE
L_9B1A: FAC! = FAC! - N_D4FE!  ' RT3F_99
L_9B1D: FAC! = ABS(FAC!)  ' RT3F_2D
L_9B20: DI = &HD502
L_9B23: CompareLeft! = FAC!: CompareRight! = N_D502!  ' RT3F_A1
L_9B26: IF CompareLeft! < CompareRight! THEN GOTO L_9B2B  ' flags from L_9B23
L_9B28: GOTO L_9B2C
L_9B2B: RETURN
L_9B2C: FAC! = TIMER  ' RT3D_43
L_9B2F: DI = &HD4FE
L_9B32: N_D4FE! = FAC!: SI = &H001A  ' RT3F_7D
L_9B35: SI = &HD506
L_9B38: CompareLeft! = N_D506!: CompareRight! = 0  ' RT3F_A7
L_9B3B: BX = 0
L_9B3E: IF CompareLeft! <> CompareRight! THEN GOTO L_9B41  ' flags from L_9B38
L_9B40: BX = BX - 1
L_9B41: DX = SI
L_9B43: CX = BX
L_9B45: BX = CINT(N(SI))  ' RT3F_75
L_9B48: DI = BX
L_9B4A: DI = DI * (2 ^ 1)
L_9B4C: CompareLeft% = WORD(DI - &H6BD2): CompareRight% = 0
L_9B51: BX = 0
L_9B54: IF CompareLeft% <> CompareRight% THEN GOTO L_9B57  ' flags from L_9B4C
L_9B56: BX = BX - 1
L_9B57: BX = BX OR CX
L_9B59: CompareLeft% = BX: CompareRight% = 0
L_9B5B: IF CompareLeft% <> CompareRight% THEN GOTO L_9B60  ' flags from L_9B59
L_9B5D: GOTO L_9B68
L_9B60: DI = DX
L_9B62: SI = &HD50A
L_9B65: N(DI) = N_D50A!  ' RT3F_7B
L_9B68: SI = &HD50E
L_9B6B: CompareLeft! = N_D50E!: CompareRight! = 0  ' RT3F_A7
L_9B6E: IF CompareLeft! = CompareRight! THEN GOTO L_9B73  ' flags from L_9B6B
L_9B70: GOTO L_9C59
L_9B73: DI = &H804E
L_9B76: SI = &HC93A
L_9B79: FAC! = N_C93A! + N_804E!  ' RT3F_7F
L_9B7C: DI = &HC6B0
L_9B7F: BX = SI
L_9B81: SI = &HC63C
L_9B84: T_03! = FAC!  ' RT3F_71; inline=&H83
L_9B88: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9B8B: DI = BX
L_9B8D: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_9B90: DX = 0
L_9B93: IF CompareLeft! <= CompareRight! THEN GOTO L_9B96  ' flags from L_9B8D
L_9B95: DX = DX - 1
L_9B96: CompareLeft% = DX: CompareRight% = 0
L_9B98: IF CompareLeft% >= CompareRight% THEN GOTO L_9B9C  ' flags from L_9B96
L_9B9A: DX = -DX
L_9B9C: SWAP DX, BX
L_9B9E: FAC! = CSNG(BX)  ' RT3F_57
L_9BA1: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_9BA5: DI = DX
L_9BA7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9BAA: BX = 7
L_9BAD: DX = BX
L_9BAF: CX = 0
L_9BB1: AX = CX
L_9BB3: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_9BB6: BX = &H60
L_9BB9: DX = &H17
L_9BBC: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_9BBF: BX = 0
L_9BC1: DX = 1
L_9BC4: CX = &HFFFF
L_9BC7: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_9BCA: BX = 2
L_9BCD: ARGPUSH BX  ' RT3E_42
L_9BD0: LOCATE ARGS(), BX  ' RT3E_44
L_9BD3: ' PRINT statement begins ; RT3F_BC
L_9BD6: SI = DI
L_9BD8: DI = &HC6E0
L_9BDB: FAC! = N(SI) + N_C6E0!  ' RT3F_7F
L_9BDE: DX = SI
L_9BE0: CX = BX
L_9BE2: BX = CINT(FAC!)  ' RT3F_77
L_9BE5: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_9BE8: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_9BEB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9BEE: BX = CX
L_9BF0: ARGPUSH BX  ' RT3E_42
L_9BF3: SI = DX
L_9BF5: BX = CINT(N(SI))  ' RT3F_75
L_9BF8: BX = BX * (2 ^ 1)
L_9BFA: BX = BX * (2 ^ 1)
L_9BFC: DX = BX
L_9BFE: BX = BX + &HC5E4
L_9C02: CX = BX
L_9C04: BX = LEN(S(BX))  ' RT3F_BA
L_9C07: FAC! = CSNG(BX)  ' RT3F_57
L_9C0A: DI = &HBB52
L_9C0D: FAC! = FAC! * N_BB52!  ' RT3F_91
L_9C10: SI = &HD512
L_9C13: BX = DI
L_9C15: FAC! = N_D512! - FAC!  ' RT3F_9B
L_9C18: AX = SI
L_9C1A: BX = CINT(FAC!)  ' RT3F_77
L_9C1D: LOCATE ARGS(), BX  ' RT3E_44
L_9C20: ' PRINT statement begins ; RT3F_BC
L_9C23: BX = CX
L_9C25: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_9C28: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9C2B: BX = 3
L_9C2E: ARGPUSH BX  ' RT3E_42
L_9C31: DX = DX + &HC5F4
L_9C35: BX = DX
L_9C37: BX = LEN(S(BX))  ' RT3F_BA
L_9C3A: FAC! = CSNG(BX)  ' RT3F_57
L_9C3D: DI = &HBB52
L_9C40: FAC! = FAC! * N_BB52!  ' RT3F_91
L_9C43: SI = AX
L_9C45: FAC! = N(SI) - FAC!  ' RT3F_9B
L_9C48: BX = CINT(FAC!)  ' RT3F_77
L_9C4B: LOCATE ARGS(), BX  ' RT3E_44
L_9C4E: ' PRINT statement begins ; RT3F_BC
L_9C51: BX = DX
L_9C53: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_9C56: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9C59: DI = &H804E
L_9C5C: SI = &HD50E
L_9C5F: FAC! = N_D50E! + N_804E!  ' RT3F_7F
L_9C62: DI = &HBAD0
L_9C65: T_03! = FAC!  ' RT3F_71; inline=&H83
L_9C69: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_9C6C: BX = 0
L_9C6F: IF CompareLeft! >= CompareRight! THEN GOTO L_9C72  ' flags from L_9C69
L_9C71: BX = BX - 1
L_9C72: CompareLeft% = BX: CompareRight% = 0
L_9C74: IF CompareLeft% >= CompareRight% THEN GOTO L_9C78  ' flags from L_9C72
L_9C76: BX = -BX
L_9C78: FAC! = CSNG(BX)  ' RT3F_57
L_9C7B: BX = SI
L_9C7D: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_9C81: DI = BX
L_9C83: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9C86: DI = &H804E
L_9C89: SI = &HC63C
L_9C8C: CompareLeft! = N_C63C!: CompareRight! = N_804E!  ' RT3F_9F
L_9C8F: IF CompareLeft! = CompareRight! THEN GOTO L_9C94  ' flags from L_9C8C
L_9C91: GOTO L_9C9C
L_9C94: SI = DI
L_9C96: DI = &HD50E
L_9C99: N_D50E! = N(SI)  ' RT3F_7B
L_9C9C: SI = &HD506
L_9C9F: BX = CINT(N_D506!)  ' RT3F_75
L_9CA2: DI = BX
L_9CA4: DI = DI * (2 ^ 1)
L_9CA6: BX = WORD(DI - &H6BD2)
L_9CAA: ON BX GOTO L_9CB8, L_9CD1, L_9CEA, L_9D03, L_9D1C  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_9CB8: BX = 8
L_9CBB: DX = &H19
L_9CBE: CX = 0
L_9CC0: AX = CX
L_9CC2: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9CC5: BX = &H942E
L_9CC8: DX = 3
L_9CCB: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9CCE: GOTO L_9D32
L_9CD1: BX = 8
L_9CD4: DX = &H19
L_9CD7: CX = 0
L_9CD9: AX = CX
L_9CDB: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9CDE: BX = &H9920
L_9CE1: DX = 3
L_9CE4: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9CE7: GOTO L_9D32
L_9CEA: BX = 8
L_9CED: DX = &H19
L_9CF0: CX = 0
L_9CF2: AX = CX
L_9CF4: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9CF7: BX = &H9DF4
L_9CFA: DX = 3
L_9CFD: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9D00: GOTO L_9D32
L_9D03: BX = 8
L_9D06: DX = &H19
L_9D09: CX = 0
L_9D0B: AX = CX
L_9D0D: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9D10: BX = &HA2C8
L_9D13: DX = 3
L_9D16: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9D19: GOTO L_9D32
L_9D1C: BX = 8
L_9D1F: DX = &H19
L_9D22: CX = 0
L_9D24: AX = CX
L_9D26: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9D29: BX = &HA79C
L_9D2C: DX = 3
L_9D2F: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9D32: DI = &H804E
L_9D35: SI = &HD506
L_9D38: FAC! = N_D506! + N_804E!  ' RT3F_7F
L_9D3B: DI = SI
L_9D3D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9D40: RETURN
L_9D41: FAC! = TIMER  ' RT3D_43
L_9D44: DI = &HD4FE
L_9D47: FAC! = FAC! - N_D4FE!  ' RT3F_99
L_9D4A: FAC! = ABS(FAC!)  ' RT3F_2D
L_9D4D: DI = &HD1AC
L_9D50: CompareLeft! = FAC!: CompareRight! = N_D1AC!  ' RT3F_A1
L_9D53: IF CompareLeft! < CompareRight! THEN GOTO L_9D58  ' flags from L_9D50
L_9D55: GOTO L_9D59
L_9D58: RETURN
L_9D59: FAC! = TIMER  ' RT3D_43
L_9D5C: DI = &HD4FE
L_9D5F: N_D4FE! = FAC!: SI = &H001A  ' RT3F_7D
L_9D62: SI = &HD506
L_9D65: CompareLeft! = N_D506!: CompareRight! = 0  ' RT3F_A7
L_9D68: BX = 0
L_9D6B: IF CompareLeft! <> CompareRight! THEN GOTO L_9D6E  ' flags from L_9D65
L_9D6D: BX = BX - 1
L_9D6E: DX = SI
L_9D70: CX = BX
L_9D72: BX = CINT(N(SI))  ' RT3F_75
L_9D75: DI = BX
L_9D77: DI = DI * (2 ^ 1)
L_9D79: CompareLeft% = WORD(DI - &H7FAE): CompareRight% = 0
L_9D7E: BX = 0
L_9D81: IF CompareLeft% >= CompareRight% THEN GOTO L_9D84  ' flags from L_9D79
L_9D83: BX = BX - 1
L_9D84: BX = BX OR CX
L_9D86: CompareLeft% = BX: CompareRight% = 0
L_9D88: IF CompareLeft% <> CompareRight% THEN GOTO L_9D8D  ' flags from L_9D86
L_9D8A: GOTO L_9D95
L_9D8D: DI = DX
L_9D8F: SI = &HD516
L_9D92: N(DI) = N_D516!  ' RT3F_7B
L_9D95: FAC! = TIMER  ' RT3D_43
L_9D98: SI = &HD51A
L_9D9B: FAC! = N_D51A! - FAC!  ' RT3F_9B
L_9D9E: FAC! = ABS(FAC!)  ' RT3F_2D
L_9DA1: DI = &H9412
L_9DA4: BX = SI
L_9DA6: CompareLeft! = FAC!: CompareRight! = N_9412!  ' RT3F_A1
L_9DA9: IF CompareLeft! > CompareRight! THEN GOTO L_9DAE  ' flags from L_9DA6
L_9DAB: GOTO L_9E9C
L_9DAE: FAC! = TIMER  ' RT3D_43
L_9DB1: DI = BX
L_9DB3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9DB6: DI = &H804E
L_9DB9: SI = &HC93A
L_9DBC: FAC! = N_C93A! + N_804E!  ' RT3F_7F
L_9DBF: DI = &HC6B0
L_9DC2: BX = SI
L_9DC4: SI = &HC63C
L_9DC7: T_03! = FAC!  ' RT3F_71; inline=&H83
L_9DCB: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9DCE: DI = BX
L_9DD0: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_9DD3: DX = 0
L_9DD6: IF CompareLeft! <= CompareRight! THEN GOTO L_9DD9  ' flags from L_9DD0
L_9DD8: DX = DX - 1
L_9DD9: CompareLeft% = DX: CompareRight% = 0
L_9DDB: IF CompareLeft% >= CompareRight% THEN GOTO L_9DDF  ' flags from L_9DD9
L_9DDD: DX = -DX
L_9DDF: SWAP DX, BX
L_9DE1: FAC! = CSNG(BX)  ' RT3F_57
L_9DE4: FAC! = T_03! * FAC!  ' RT3F_95; inline=&H83
L_9DE8: DI = DX
L_9DEA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9DED: BX = 7
L_9DF0: DX = BX
L_9DF2: CX = 0
L_9DF4: AX = CX
L_9DF6: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_9DF9: BX = &H60
L_9DFC: DX = &H17
L_9DFF: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_9E02: BX = 0
L_9E04: DX = 1
L_9E07: CX = &HFFFF
L_9E0A: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_9E0D: BX = 2
L_9E10: ARGPUSH BX  ' RT3E_42
L_9E13: LOCATE ARGS(), BX  ' RT3E_44
L_9E16: ' PRINT statement begins ; RT3F_BC
L_9E19: SI = DI
L_9E1B: DI = &HC6E0
L_9E1E: FAC! = N(SI) + N_C6E0!  ' RT3F_7F
L_9E21: DX = SI
L_9E23: CX = BX
L_9E25: BX = CINT(FAC!)  ' RT3F_77
L_9E28: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_9E2B: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_9E2E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9E31: BX = CX
L_9E33: ARGPUSH BX  ' RT3E_42
L_9E36: SI = DX
L_9E38: BX = CINT(N(SI))  ' RT3F_75
L_9E3B: BX = BX * (2 ^ 1)
L_9E3D: BX = BX * (2 ^ 1)
L_9E3F: DX = BX
L_9E41: BX = BX + &HC5E4
L_9E45: CX = BX
L_9E47: BX = LEN(S(BX))  ' RT3F_BA
L_9E4A: FAC! = CSNG(BX)  ' RT3F_57
L_9E4D: DI = &HBB52
L_9E50: FAC! = FAC! * N_BB52!  ' RT3F_91
L_9E53: SI = &HD512
L_9E56: BX = DI
L_9E58: FAC! = N_D512! - FAC!  ' RT3F_9B
L_9E5B: AX = SI
L_9E5D: BX = CINT(FAC!)  ' RT3F_77
L_9E60: LOCATE ARGS(), BX  ' RT3E_44
L_9E63: ' PRINT statement begins ; RT3F_BC
L_9E66: BX = CX
L_9E68: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_9E6B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9E6E: BX = 3
L_9E71: ARGPUSH BX  ' RT3E_42
L_9E74: DX = DX + &HC5F4
L_9E78: BX = DX
L_9E7A: BX = LEN(S(BX))  ' RT3F_BA
L_9E7D: FAC! = CSNG(BX)  ' RT3F_57
L_9E80: DI = &HBB52
L_9E83: FAC! = FAC! * N_BB52!  ' RT3F_91
L_9E86: SI = AX
L_9E88: FAC! = N(SI) - FAC!  ' RT3F_9B
L_9E8B: BX = CINT(FAC!)  ' RT3F_77
L_9E8E: LOCATE ARGS(), BX  ' RT3E_44
L_9E91: ' PRINT statement begins ; RT3F_BC
L_9E94: BX = DX
L_9E96: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_9E99: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9E9C: DI = &H804E
L_9E9F: SI = &HC63C
L_9EA2: CompareLeft! = N_C63C!: CompareRight! = N_804E!  ' RT3F_9F
L_9EA5: IF CompareLeft! = CompareRight! THEN GOTO L_9EAA  ' flags from L_9EA2
L_9EA7: GOTO L_9EB3
L_9EAA: FAC! = TIMER  ' RT3D_43
L_9EAD: DI = &HD51A
L_9EB0: N_D51A! = FAC!: SI = &H001A  ' RT3F_7D
L_9EB3: SI = &HD506
L_9EB6: BX = CINT(N_D506!)  ' RT3F_75
L_9EB9: DI = BX
L_9EBB: DI = DI * (2 ^ 1)
L_9EBD: BX = WORD(DI - &H7FAE)
L_9EC1: ON BX GOSUB L_9F02, L_9F19, L_9F38, L_9F57  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_9ECD: DI = &H804E
L_9ED0: SI = &HD506
L_9ED3: FAC! = N_D506! + N_804E!  ' RT3F_7F
L_9ED6: BX = SI
L_9ED8: DX = BX
L_9EDA: BX = CINT(FAC!)  ' RT3F_77
L_9EDD: DI = BX
L_9EDF: DI = DI * (2 ^ 1)
L_9EE1: BX = WORD(DI - &H7FAE)
L_9EE5: FAC! = CSNG(BX)  ' RT3F_57
L_9EE8: DI = &HBB9E
L_9EEB: FAC! = FAC! / N_BB9E!  ' RT3F_89
L_9EEE: DI = &HD1AC
L_9EF1: N_D1AC! = FAC!: SI = &H001A  ' RT3F_7D
L_9EF4: SI = DX
L_9EF6: DI = &H9412
L_9EF9: FAC! = N(SI) + N_9412!  ' RT3F_7F
L_9EFC: DI = DX
L_9EFE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9F01: RETURN
L_9F02: BX = 8
L_9F05: DX = &H19
L_9F08: CX = 0
L_9F0A: AX = CX
L_9F0C: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9F0F: BX = &H8052
L_9F12: DX = 3
L_9F15: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9F18: RETURN
L_9F19: DX = WORD(&H89F8)
L_9F1D: DX = DX + &H19
L_9F20: BX = WORD(&H89F6)
L_9F24: BX = BX + 8
L_9F27: CX = 0
L_9F29: AX = CX
L_9F2B: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9F2E: BX = &H8AF2
L_9F31: DX = 4
L_9F34: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9F37: RETURN
L_9F38: DX = WORD(&H89FC)
L_9F3C: DX = DX + &H19
L_9F3F: BX = WORD(&H89FA)
L_9F43: BX = BX + 8
L_9F46: CX = 0
L_9F48: AX = CX
L_9F4A: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9F4D: BX = &H8ED4
L_9F50: DX = 4
L_9F53: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9F56: RETURN
L_9F57: DX = WORD(&H8A00)
L_9F5B: DX = DX + &H19
L_9F5E: BX = WORD(&H89FE)
L_9F62: BX = BX + 8
L_9F65: CX = 0
L_9F67: AX = CX
L_9F69: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_9F6C: BX = &H91D0
L_9F6F: DX = 4
L_9F72: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_9F75: RETURN
L_9F76: SI = &HC9DC
L_9F79: BX = SI
L_9F7B: DX = BX
L_9F7D: BX = CINT(N_C9DC!)  ' RT3F_75
L_9F80: AX = BX
L_9F82: SI = 5
L_9F85: CX = DX
L_9F87: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_9F89: SI = AX
L_9F8B: SI = &HC9E4
L_9F8E: DX = SI
L_9F90: WORD(BP - &HC) = BX
L_9F93: BX = CINT(N_C9E4!)  ' RT3F_75
L_9F96: BX = BX + AX
L_9F98: SI = BX
L_9F9A: SI = SI * (2 ^ 1)
L_9F9C: SI = SI * (2 ^ 1)
L_9F9E: BX = SI
L_9FA0: SI = SI + &HC2B8
L_9FA4: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_9FA7: AX = 0
L_9FAA: IF CompareLeft! > CompareRight! THEN GOTO L_9FAD  ' flags from L_9FA4
L_9FAC: AX = AX - 1
L_9FAD: WORD(BP - &HE) = BX
L_9FB0: BX = &HFFFA
L_9FB3: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_9FB5: BX = AX
L_9FB7: FAC! = CSNG(BX)  ' RT3F_57
L_9FBA: DI = &HD046
L_9FBD: N_D046! = FAC!: SI = &H001A  ' RT3F_7D
L_9FC0: SI = WORD(BP - &HE)
L_9FC3: SI = SI + &HC428
L_9FC7: FAC! = N(SI) + N_D046!  ' RT3F_7F
L_9FCA: BX = SI
L_9FCC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9FCF: SI = &HC9E4
L_9FD2: FAC! = N_C9E4! * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_9FD6: DX = DI
L_9FD8: DI = &HD51E
L_9FDB: FAC! = FAC! + N_D51E!  ' RT3F_81
L_9FDE: DI = &HD42A
L_9FE1: N_D42A! = FAC!: SI = &H001A  ' RT3F_7D
L_9FE4: SI = CX
L_9FE6: FAC! = N(SI) * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_9FEA: DI = &HBF9E
L_9FED: FAC! = FAC! + N_BF9E!  ' RT3F_81
L_9FF0: DI = &HD42E
L_9FF3: N_D42E! = FAC!: SI = &H001A  ' RT3F_7D
L_9FF6: SI = BX
L_9FF8: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_9FFB: IF CompareLeft! = CompareRight! THEN GOTO L_A000  ' flags from L_9FF8
L_9FFD: GOTO L_A01B
L_A000: SI = WORD(BP - &HC)
L_A003: SI = SI * (2 ^ 1)
L_A005: SI = SI * (2 ^ 1)
L_A007: SI = SI + &HC624
L_A00B: DI = DX
L_A00D: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_A010: DI = &H9412
L_A013: FAC! = FAC! + N_9412!  ' RT3F_81
L_A016: DI = DX
L_A018: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A01B: SI = &HD046
L_A01E: BX = CINT(N_D046!)  ' RT3F_75
L_A021: ON BX GOTO L_A055, L_A06D, L_A03D, L_A085, L_A09D, L_A0B5, L_A0E5, L_A0FD, L_A0CD, L_A115, L_A12D, L_A145  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_A03D: BX = &HD42A
L_A040: DX = &HD42E
L_A043: CX = &HFFFF
L_A046: AX = CX
L_A048: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A04B: BX = &HAC70
L_A04E: DX = 3
L_A051: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A054: RETURN
L_A055: BX = &HD42A
L_A058: DX = &HD42E
L_A05B: CX = &HFFFF
L_A05E: AX = CX
L_A060: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A063: BX = &HACF4
L_A066: DX = 3
L_A069: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A06C: RETURN
L_A06D: BX = &HD42A
L_A070: DX = &HD42E
L_A073: CX = &HFFFF
L_A076: AX = CX
L_A078: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A07B: BX = &HAD78
L_A07E: DX = 3
L_A081: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A084: RETURN
L_A085: BX = &HD42A
L_A088: DX = &HD42E
L_A08B: CX = &HFFFF
L_A08E: AX = CX
L_A090: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A093: BX = &HB8CC
L_A096: DX = 3
L_A099: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A09C: RETURN
L_A09D: BX = &HD42A
L_A0A0: DX = &HD42E
L_A0A3: CX = &HFFFF
L_A0A6: AX = CX
L_A0A8: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A0AB: BX = &HB950
L_A0AE: DX = 3
L_A0B1: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A0B4: RETURN
L_A0B5: BX = &HD42A
L_A0B8: DX = &HD42E
L_A0BB: CX = &HFFFF
L_A0BE: AX = CX
L_A0C0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A0C3: BX = &HB9D4
L_A0C6: DX = 3
L_A0C9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A0CC: RETURN
L_A0CD: BX = &HD42A
L_A0D0: DX = &HD42E
L_A0D3: CX = &HFFFF
L_A0D6: AX = CX
L_A0D8: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A0DB: BX = &HAC70
L_A0DE: DX = 2
L_A0E1: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A0E4: RETURN
L_A0E5: BX = &HD42A
L_A0E8: DX = &HD42E
L_A0EB: CX = &HFFFF
L_A0EE: AX = CX
L_A0F0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A0F3: BX = &HACF4
L_A0F6: DX = 2
L_A0F9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A0FC: RETURN
L_A0FD: BX = &HD42A
L_A100: DX = &HD42E
L_A103: CX = &HFFFF
L_A106: AX = CX
L_A108: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A10B: BX = &HAD78
L_A10E: DX = 2
L_A111: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A114: RETURN
L_A115: BX = &HD42A
L_A118: DX = &HD42E
L_A11B: CX = &HFFFF
L_A11E: AX = CX
L_A120: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A123: BX = &HB8CC
L_A126: DX = 2
L_A129: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A12C: RETURN
L_A12D: BX = &HD42A
L_A130: DX = &HD42E
L_A133: CX = &HFFFF
L_A136: AX = CX
L_A138: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A13B: BX = &HB950
L_A13E: DX = 2
L_A141: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A144: RETURN
L_A145: BX = &HD42A
L_A148: DX = &HD42E
L_A14B: CX = &HFFFF
L_A14E: AX = CX
L_A150: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A153: BX = &HB9D4
L_A156: DX = 2
L_A159: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A15C: RETURN
L_A15D: DI = &HD2E6
L_A160: SI = &HD2EA
L_A163: FAC! = N_D2EA! + N_D2E6!  ' RT3F_7F
L_A166: DI = &HC6B0
L_A169: BX = SI
L_A16B: FAC! = FAC! + N_C6B0!  ' RT3F_81
L_A16E: DI = &HD2F6
L_A171: N_D2F6! = FAC!: SI = &H001A  ' RT3F_7D
L_A174: SI = BX
L_A176: FAC! = N(SI) * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_A17A: BX = DI
L_A17C: DI = &HD51E
L_A17F: FAC! = FAC! + N_D51E!  ' RT3F_81
L_A182: DI = &HD522
L_A185: N_D522! = FAC!: SI = &H001A  ' RT3F_7D
L_A188: SI = BX
L_A18A: FAC! = N(SI) * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_A18E: DI = &HD532
L_A191: FAC! = FAC! + N_D532!  ' RT3F_81
L_A194: DI = &HD526
L_A197: N_D526! = FAC!: SI = &H001A  ' RT3F_7D
L_A19A: SI = &HC9DC
L_A19D: FAC! = N_C9DC! * 2 ^ (4)  ' RT3F_AB; inline=&H04
L_A1A1: DI = &HBF9E
L_A1A4: T_03! = FAC!  ' RT3F_71; inline=&H83
L_A1A8: FAC! = FAC! + N(DI)  ' RT3F_81
L_A1AB: DI = &HD52A
L_A1AE: N_D52A! = FAC!: SI = &H001A  ' RT3F_7D
L_A1B1: DI = &HC1C0
L_A1B4: SI = &HBEA0
L_A1B7: FAC! = N_BEA0! + N_C1C0!  ' RT3F_7F
L_A1BA: DI = &HD52E
L_A1BD: N_D52E! = FAC!: SI = &H001A  ' RT3F_7D
L_A1C0: BX = &HD522
L_A1C3: DX = &HD52A
L_A1C6: CX = &HFFFF
L_A1C9: AX = CX
L_A1CB: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_A1CE: BX = &HD526
L_A1D1: DX = &HD52E
L_A1D4: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_A1D7: BX = &H8044
L_A1DA: DX = 0
L_A1DC: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_A1DF: BX = &HD522
L_A1E2: DX = &HD52A
L_A1E5: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A1E8: BX = &H8044
L_A1EB: DX = &HFF02
L_A1EE: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A1F1: SI = &H804E
L_A1F4: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_A1F7: GOTO L_A2ED
L_A1FA: DI = &HD536
L_A1FD: SI = &HD53A
L_A200: N_D536! = N_D53A!  ' RT3F_7B
L_A203: SI = &HD4A2
L_A206: FAC! = N_D4A2!: DI = &H001E  ' RT3F_6F
L_A209: GOTO L_A243
L_A20C: DI = &H9426
L_A20F: SI = &HBA90
L_A212: FAC! = N_BA90! * N_9426!  ' RT3F_8F
L_A215: DI = &HD53E
L_A218: BX = SI
L_A21A: FAC! = FAC! / N_D53E!  ' RT3F_89
L_A21D: DI = BX
L_A21F: SI = &HD542
L_A222: T_03! = FAC!  ' RT3F_71; inline=&H83
L_A226: FAC! = N(SI) - N(DI)  ' RT3F_97
L_A229: BX = CINT(FAC!)  ' RT3F_77
L_A22C: DX = &HBEA0
L_A22F: SoundFreq% = BX: SoundDuration! = N_BEA0!  ' RT3E_5E
L_A232: BX = &HFFFF
L_A235: DX = BX
L_A237: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_A23A: DI = &HD536
L_A23D: SI = &HBA90
L_A240: FAC! = N_BA90! + N_D536!  ' RT3F_7F
L_A243: DI = &HBA90
L_A246: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_A249: SI = &HD536
L_A24C: CompareLeft! = N_D536!: CompareRight! = 0  ' RT3F_A7
L_A24F: IF CompareLeft! < CompareRight! THEN GOTO L_A254  ' flags from L_A24C
L_A251: GOTO L_A261
L_A254: SI = DI
L_A256: DI = &HD546
L_A259: CompareLeft! = N(SI): CompareRight! = N_D546!  ' RT3F_9F
L_A25C: IF CompareLeft! >= CompareRight! THEN GOTO L_A20C  ' flags from L_A259
L_A25E: GOTO L_A26C
L_A261: DI = &HD546
L_A264: SI = &HBA90
L_A267: CompareLeft! = N_BA90!: CompareRight! = N_D546!  ' RT3F_9F
L_A26A: IF CompareLeft! <= CompareRight! THEN GOTO L_A20C  ' flags from L_A267
L_A26C: BX = &HD522
L_A26F: DX = &HD52A
L_A272: CX = &HFFFF
L_A275: AX = CX
L_A277: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A27A: BX = &H8044
L_A27D: DX = &HFF04
L_A280: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A283: SI = &HD546
L_A286: FAC! = N_D546!: DI = &H001E  ' RT3F_6F
L_A289: GOTO L_A2BD
L_A28C: DI = &H9426
L_A28F: SI = &HBA90
L_A292: FAC! = N_BA90! * N_9426!  ' RT3F_8F
L_A295: DI = &HD53E
L_A298: BX = SI
L_A29A: FAC! = FAC! / N_D53E!  ' RT3F_89
L_A29D: SI = BX
L_A29F: T_03! = FAC!  ' RT3F_71; inline=&H83
L_A2A3: BX = CINT(N(SI))  ' RT3F_75
L_A2A6: DX = &HBEA0
L_A2A9: SoundFreq% = BX: SoundDuration! = N_BEA0!  ' RT3E_5E
L_A2AC: BX = &HFFFF
L_A2AF: DX = BX
L_A2B1: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_A2B4: DI = &HD546
L_A2B7: SI = &HBA90
L_A2BA: FAC! = N_BA90! + N_D546!  ' RT3F_7F
L_A2BD: DI = &HBA90
L_A2C0: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_A2C3: SI = DI
L_A2C5: DI = &HD4A2
L_A2C8: CompareLeft! = N_BA90!: CompareRight! = N_D4A2!  ' RT3F_9F
L_A2CB: IF CompareLeft! <= CompareRight! THEN GOTO L_A28C  ' flags from L_A2C8
L_A2CD: BX = &HD522
L_A2D0: DX = &HD52A
L_A2D3: CX = &HFFFF
L_A2D6: AX = CX
L_A2D8: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A2DB: BX = &H8044
L_A2DE: DX = &HFF04
L_A2E1: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A2E4: DI = &H804E
L_A2E7: SI = &HC942
L_A2EA: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_A2ED: DI = &HC942
L_A2F0: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_A2F3: SI = DI
L_A2F5: DI = &HC194
L_A2F8: CompareLeft! = N_C942!: CompareRight! = N_C194!  ' RT3F_9F
L_A2FB: IF CompareLeft! > CompareRight! THEN GOTO L_A300  ' flags from L_A2F8
L_A2FD: GOTO L_A1FA
L_A300: RETURN
L_A301: DI = &HD2E6
L_A304: SI = &HD2EA
L_A307: FAC! = N_D2EA! + N_D2E6!  ' RT3F_7F
L_A30A: DI = &HC6B0
L_A30D: BX = SI
L_A30F: FAC! = FAC! + N_C6B0!  ' RT3F_81
L_A312: DI = &HD2F6
L_A315: N_D2F6! = FAC!: SI = &H001A  ' RT3F_7D
L_A318: DX = DI
L_A31A: DI = &HD522
L_A31D: SI = &HC17C
L_A320: N_D522! = N_C17C!  ' RT3F_7B
L_A323: DI = &HD526
L_A326: SI = &HD54A
L_A329: N_D526! = N_D54A!  ' RT3F_7B
L_A32C: SI = BX
L_A32E: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_A332: DI = &HD54E
L_A335: FAC! = FAC! + N_D54E!  ' RT3F_81
L_A338: DI = &HD52A
L_A33B: N_D52A! = FAC!: SI = &H001A  ' RT3F_7D
L_A33E: SI = DX
L_A340: FAC! = N(SI) * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_A344: DI = &HCA56
L_A347: FAC! = FAC! + N_CA56!  ' RT3F_81
L_A34A: DI = &HD52E
L_A34D: N_D52E! = FAC!: SI = &H001A  ' RT3F_7D
L_A350: GOSUB L_A1C0
L_A353: BX = &HD522
L_A356: DX = &HD52A
L_A359: CX = &HFFFF
L_A35C: AX = CX
L_A35E: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A361: BX = &H8044
L_A364: DX = &HFF03
L_A367: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A36A: RETURN
L_A36B: DI = &HD2E6
L_A36E: SI = &H804E
L_A371: N_D2E6! = N_804E!  ' RT3F_7B
L_A374: DI = &HC110
L_A377: SI = &HC1B4
L_A37A: N_C110! = N_C1B4!  ' RT3F_7B
L_A37D: BX = DI
L_A37F: DI = &HC114
L_A382: SI = &HC762
L_A385: N_C114! = N_C762!  ' RT3F_7B
L_A388: GOSUB L_06A9
L_A38B: DI = &HD2EA
L_A38E: N_D2EA! = FAC!: SI = &H001A  ' RT3F_7D
L_A391: DI = &HC110
L_A394: SI = &HD066
L_A397: N_C110! = N_D066!  ' RT3F_7B
L_A39A: BX = DI
L_A39C: DI = &HC114
L_A39F: SI = &HC762
L_A3A2: N_C114! = N_C762!  ' RT3F_7B
L_A3A5: GOSUB L_06A9
L_A3A8: DI = &HC9DC
L_A3AB: N_C9DC! = FAC!: SI = &H001A  ' RT3F_7D
L_A3AE: DI = &HC110
L_A3B1: SI = &HC0F4
L_A3B4: N_C110! = N_C0F4!  ' RT3F_7B
L_A3B7: BX = DI
L_A3B9: DI = &HC114
L_A3BC: SI = &HC762
L_A3BF: N_C114! = N_C762!  ' RT3F_7B
L_A3C2: GOSUB L_06A9
L_A3C5: DI = &HCAD4
L_A3C8: FAC! = FAC! * N_CAD4!  ' RT3F_91
L_A3CB: BX = &H1A
L_A3CE: FAC! = INT(FAC!)  ' RT3D_03
L_A3D1: DI = &HD282
L_A3D4: N_D282! = FAC!: SI = &H001A  ' RT3F_7D
L_A3D7: DI = &HC17C
L_A3DA: SI = &HD04A
L_A3DD: CompareLeft! = N_D04A!: CompareRight! = N_C17C!  ' RT3F_9F
L_A3E0: IF CompareLeft! = CompareRight! THEN GOTO L_A3E5  ' flags from L_A3DD
L_A3E2: GOTO L_A42F
L_A3E5: DI = &HC120
L_A3E8: SI = &HC1B0
L_A3EB: N_C120! = N_C1B0!  ' RT3F_7B
L_A3EE: DI = &HC124
L_A3F1: BX = SI
L_A3F3: SI = &HBA90
L_A3F6: N_C124! = N_BA90!  ' RT3F_7B
L_A3F9: GOSUB L_06DB
L_A3FC: BX = CINT(FAC!)  ' RT3F_77
L_A3FF: DI = BX

```

### Ability outcomes and final helpers

```basic
L_A401: DI = DI * (2 ^ 1)
L_A403: DI = DI * (2 ^ 1)
L_A405: DI = DI + &H1850
L_A409: BX = DI
L_A40B: DI = &HC110
L_A40E: SI = &HC1B0
L_A411: N_C110! = N_C1B0!  ' RT3F_7B
L_A414: DI = &HC114
L_A417: SI = &HBA90
L_A41A: N_C114! = N_BA90!  ' RT3F_7B
L_A41D: WORD(BP - &HC) = BX
L_A420: GOSUB L_06A9
L_A423: DI = &HC6B0
L_A426: FAC! = FAC! + N_C6B0!  ' RT3F_81
L_A429: DI = WORD(BP - &HC)
L_A42C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A42F: DI = &HC120
L_A432: SI = &HCA72
L_A435: N_C120! = N_CA72!  ' RT3F_7B
L_A438: DI = &HC124
L_A43B: SI = &HC762
L_A43E: N_C124! = N_C762!  ' RT3F_7B
L_A441: GOSUB L_06DB
L_A444: BX = CINT(FAC!)  ' RT3F_77
L_A447: DI = BX
L_A449: DI = DI * (2 ^ 1)
L_A44B: DI = DI * (2 ^ 1)
L_A44D: DI = DI + &H1850
L_A451: SI = &HD006
L_A454: N(DI) = N_D006!  ' RT3F_7B
L_A457: GOSUB L_2EFC
L_A45A: BX = &H15
L_A45D: ARGPUSH BX  ' RT3E_42
L_A460: BX = 2
L_A463: LOCATE ARGS(), BX  ' RT3E_44
L_A466: ' PRINT statement begins ; RT3F_BC
L_A469: SI = &HC762
L_A46C: DX = SI
L_A46E: CX = BX
L_A470: BX = CINT(N_C762!)  ' RT3F_75
L_A473: BX = BX * (2 ^ 1)
L_A475: BX = BX * (2 ^ 1)
L_A477: BX = BX + &H4288
L_A47B: PRINT S(BX);  ' RT3F_6A
L_A47E: BX = &HD552
L_A481: PRINT S_D552$;  ' RT3F_6A
L_A484: SI = &HD04A
L_A487: BX = SI
L_A489: AX = BX
L_A48B: BX = CINT(N_D04A!)  ' RT3F_75
L_A48E: BX = BX * (2 ^ 1)
L_A490: BX = BX * (2 ^ 1)
L_A492: BX = BX + &HC7BA
L_A496: PRINT S(BX);  ' RT3F_6A
L_A499: BX = &HD56A
L_A49C: PRINT S_D56A$  ' RT3F_6E; H newline item, ledger correction
L_A49F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A4A2: BX = &H17
L_A4A5: ARGPUSH BX  ' RT3E_42
L_A4A8: BX = CX
L_A4AA: LOCATE ARGS(), BX  ' RT3E_44
L_A4AD: SI = AX
L_A4AF: DI = &HBAF4
L_A4B2: CompareLeft! = N(SI): CompareRight! = N_BAF4!  ' RT3F_9F
L_A4B5: BX = 0
L_A4B8: IF CompareLeft! <> CompareRight! THEN GOTO L_A4BB  ' flags from L_A4B2
L_A4BA: BX = BX - 1
L_A4BB: FAC! = RND  ' RT3D_34
L_A4BE: DI = &HBB9E
L_A4C1: FAC! = FAC! * N_BB9E!  ' RT3F_91
L_A4C4: DI = &HC110
L_A4C7: SI = &HC0F4
L_A4CA: N_C110! = N_C0F4!  ' RT3F_7B
L_A4CD: SI = DX
L_A4CF: DI = &HC114
L_A4D2: N_C114! = N(SI)  ' RT3F_7B
L_A4D5: T_03! = FAC!  ' RT3F_71; inline=&H83
L_A4D9: WORD(BP - &HC) = BX
L_A4DC: GOSUB L_06A9
L_A4DF: DI = &HCAD4
L_A4E2: FAC! = FAC! * N_CAD4!  ' RT3F_91
L_A4E5: CompareLeft! = T_03!: CompareRight! = FAC!  ' RT3F_A5; inline=&H83
L_A4E9: BX = 0
L_A4EC: IF CompareLeft! <= CompareRight! THEN GOTO L_A4EF  ' flags from L_A4E5
L_A4EE: BX = BX - 1
L_A4EF: BX = BX AND WORD(BP - &HC)
L_A4F2: SI = &HC9DC
L_A4F5: DX = BX
L_A4F7: BX = CINT(N_C9DC!)  ' RT3F_75
L_A4FA: AX = BX
L_A4FC: SI = 5
L_A4FF: CX = DX
L_A501: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_A503: SI = AX
L_A505: SI = &HD2EA
L_A508: BX = CINT(N_D2EA!)  ' RT3F_75
L_A50B: BX = BX + AX
L_A50D: SI = BX
L_A50F: SI = SI * (2 ^ 1)
L_A511: SI = SI * (2 ^ 1)
L_A513: SI = SI + &HC2B8
L_A517: DI = &H804E
L_A51A: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_A51D: BX = 0
L_A520: IF CompareLeft! >= CompareRight! THEN GOTO L_A523  ' flags from L_A51A
L_A522: BX = BX - 1
L_A523: BX = BX OR CX
L_A525: CompareLeft% = BX: CompareRight% = 0
L_A527: IF CompareLeft% <> CompareRight% THEN GOTO L_A52C  ' flags from L_A525
L_A529: GOTO L_A53B
L_A52C: ' PRINT statement begins ; RT3F_BC
L_A52F: BX = &HD55C
L_A532: PRINT S_D55C$  ' RT3F_6E; H newline item, ledger correction
L_A535: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A538: GOTO L_A71C
L_A53B: DI = &HD574
L_A53E: SI = &HD04A
L_A541: FAC! = N_D04A! + N_D574!  ' RT3F_7F
L_A544: DI = &HD570
L_A547: N_D570! = FAC!: SI = &H001A  ' RT3F_7D
L_A54A: SI = &H804E
L_A54D: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_A550: GOTO L_A5DC
L_A553: ' Alignment NOP
L_A554: SI = &H804E
L_A557: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_A55A: GOTO L_A59B
L_A55D: ' Alignment NOP
L_A55E: DI = &H9426
L_A561: SI = &HC942
L_A564: FAC! = N_C942! * N_9426!  ' RT3F_8F
L_A567: DI = &HC0F4
L_A56A: BX = SI
L_A56C: FAC! = FAC! / N_C0F4!  ' RT3F_89
L_A56F: DI = BX
L_A571: SI = &HBA90
L_A574: T_03! = FAC!  ' RT3F_71; inline=&H83
L_A578: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_A57B: DI = &HD546
L_A57E: FAC! = FAC! * N_D546!  ' RT3F_91
L_A581: BX = CINT(FAC!)  ' RT3F_77
L_A584: DX = &HBEA0
L_A587: SoundFreq% = BX: SoundDuration! = N_BEA0!  ' RT3E_5E
L_A58A: BX = &HFFFF
L_A58D: DX = BX
L_A58F: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_A592: DI = &H804E
L_A595: SI = &HC942
L_A598: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_A59B: DI = &HC942
L_A59E: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_A5A1: SI = DI
L_A5A3: DI = &HBAF4
L_A5A6: CompareLeft! = N_C942!: CompareRight! = N_BAF4!  ' RT3F_9F
L_A5A9: IF CompareLeft! <= CompareRight! THEN GOTO L_A55E  ' flags from L_A5A6
L_A5AB: BX = &HC0
L_A5AE: DX = &H18
L_A5B1: CX = 0
L_A5B3: AX = CX
L_A5B5: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A5B8: BX = &H803A
L_A5BB: DX = &HFF02
L_A5BE: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A5C1: BX = &HC0
L_A5C4: DX = &H18
L_A5C7: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A5CA: BX = &H803A
L_A5CD: DX = &HFF03
L_A5D0: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A5D3: DI = &H804E
L_A5D6: SI = &HBA90
L_A5D9: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_A5DC: DI = &HBA90
L_A5DF: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_A5E2: SI = DI
L_A5E4: DI = &HD570
L_A5E7: CompareLeft! = N_BA90!: CompareRight! = N_D570!  ' RT3F_9F
L_A5EA: IF CompareLeft! > CompareRight! THEN GOTO L_A5EF  ' flags from L_A5E7
L_A5EC: GOTO L_A554
L_A5EF: DI = &HC178
L_A5F2: SI = &HD04A
L_A5F5: CompareLeft! = N_D04A!: CompareRight! = N_C178!  ' RT3F_9F
L_A5F8: IF CompareLeft! <> CompareRight! THEN GOTO L_A5FD  ' flags from L_A5F5
L_A5FA: GOTO L_A751
L_A5FD: GOSUB L_A15D
L_A600: ' PRINT statement begins ; RT3F_BC
L_A603: SI = &HC9DC
L_A606: BX = CINT(N_C9DC!)  ' RT3F_75
L_A609: DX = BX
L_A60B: BX = BX * (2 ^ 1)
L_A60D: BX = BX * (2 ^ 1)
L_A60F: BX = BX + &HC1E8
L_A613: PRINT S(BX);  ' RT3F_6A
L_A616: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A619: DI = &HBAF4
L_A61C: SI = &HD04A
L_A61F: CompareLeft! = N_D04A!: CompareRight! = N_BAF4!  ' RT3F_9F
L_A622: IF CompareLeft! = CompareRight! THEN GOTO L_A627  ' flags from L_A61F
L_A624: GOTO L_A653
L_A627: ' PRINT statement begins ; RT3F_BC
L_A62A: BX = &HD578
L_A62D: PRINT S_D578$  ' RT3F_6E; H newline item, ledger correction
L_A630: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A633: AX = 5
L_A636: DX:AX = SIGNED16(AX) * SIGNED16(DX)
L_A638: DI = AX
L_A63A: SI = &HD2EA
L_A63D: BX = CINT(N_D2EA!)  ' RT3F_75
L_A640: DI = DI + BX
L_A642: DI = DI * (2 ^ 1)
L_A644: DI = DI * (2 ^ 1)
L_A646: DI = DI + &HC2B8
L_A64A: SI = &HC99C
L_A64D: N(DI) = N_C99C!  ' RT3F_7B
L_A650: GOTO L_A6DC
L_A653: ' PRINT statement begins ; RT3F_BC
L_A656: BX = &HD582
L_A659: PRINT S_D582$;  ' RT3F_6A
L_A65C: BX = &HD282
L_A65F: FAC! = INT(N_D282!)  ' RT3D_03
L_A662: DX = BX
L_A664: BX = &H1A
L_A667: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_A66A: BX = &HD58C
L_A66D: PRINT S_D58C$;  ' RT3F_6A
L_A670: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A673: SI = &HC9DC
L_A676: BX = CINT(N_C9DC!)  ' RT3F_75
L_A679: AX = BX
L_A67B: DI = 5
L_A67E: CX = DX
L_A680: DX:AX = SIGNED16(AX) * SIGNED16(DI)
L_A682: DI = AX
L_A684: SI = &HD2EA
L_A687: BX = CINT(N_D2EA!)  ' RT3F_75
L_A68A: DI = DI + BX
L_A68C: DI = DI * (2 ^ 1)
L_A68E: DI = DI * (2 ^ 1)
L_A690: DI = DI + &HC2B8
L_A694: SWAP CX, DI
L_A696: SI = CX
L_A698: FAC! = N(SI) - N(DI)  ' RT3F_97
L_A69B: DI = CX
L_A69D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A6A0: SI = CX
L_A6A2: DI = &H804E
L_A6A5: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_A6A8: IF CompareLeft! < CompareRight! THEN GOTO L_A6AD  ' flags from L_A6A5
L_A6AA: GOTO L_A6D0
L_A6AD: DI = CX
L_A6AF: SI = &HBB46
L_A6B2: N(DI) = N_BB46!  ' RT3F_7B
L_A6B5: BX = &H18
L_A6B8: ARGPUSH BX  ' RT3E_42
L_A6BB: BX = 2
L_A6BE: LOCATE ARGS(), BX  ' RT3E_44
L_A6C1: ' PRINT statement begins ; RT3F_BC
L_A6C4: BX = &HD596
L_A6C7: PRINT S_D596$;  ' RT3F_6A
L_A6CA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A6CD: GOTO L_A6DC
L_A6D0: ' PRINT statement begins ; RT3F_BC
L_A6D3: BX = &HD56A
L_A6D6: PRINT S_D56A$  ' RT3F_6E; H newline item, ledger correction
L_A6D9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A6DC: SI = &HC9DC
L_A6DF: BX = CINT(N_C9DC!)  ' RT3F_75
L_A6E2: AX = BX
L_A6E4: SI = 5
L_A6E7: DX:AX = SIGNED16(AX) * SIGNED16(SI)
L_A6E9: SI = AX
L_A6EB: SI = &HD2EA
L_A6EE: BX = CINT(N_D2EA!)  ' RT3F_75
L_A6F1: BX = BX + AX
L_A6F3: SI = BX
L_A6F5: SI = SI * (2 ^ 1)
L_A6F7: SI = SI * (2 ^ 1)
L_A6F9: SI = SI + &HC2B8
L_A6FD: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_A700: IF CompareLeft! > CompareRight! THEN GOTO L_A705  ' flags from L_A6FD
L_A702: GOTO L_A71C
L_A705: BX = &HD522
L_A708: DX = &HD52A
L_A70B: CX = &HFFFF
L_A70E: AX = CX
L_A710: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_A713: BX = &H8044
L_A716: DX = &HFF03
L_A719: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_A71C: DI = &HBB52
L_A71F: SI = &HC7E6
L_A722: FAC! = N_C7E6! * N_BB52!  ' RT3F_8F
L_A725: DI = &HD5A4
L_A728: N_D5A4! = FAC!: SI = &H001A  ' RT3F_7D
L_A72B: SI = &H804E
L_A72E: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_A731: GOTO L_A740
L_A734: GOSUB L_2913
L_A737: DI = &H804E
L_A73A: SI = &HBA90
L_A73D: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_A740: DI = &HBA90
L_A743: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_A746: SI = DI
L_A748: DI = &HD5A4
L_A74B: CompareLeft! = N_BA90!: CompareRight! = N_D5A4!  ' RT3F_9F
L_A74E: IF CompareLeft! <= CompareRight! THEN GOTO L_A734  ' flags from L_A74B
L_A750: RETURN
L_A751: DI = &HC120
L_A754: SI = &HC0F0
L_A757: N_C120! = N_C0F0!  ' RT3F_7B
L_A75A: DI = &HC124
L_A75D: BX = SI
L_A75F: SI = &HBA90
L_A762: N_C124! = N_BA90!  ' RT3F_7B
L_A765: GOSUB L_06DB
L_A768: BX = CINT(FAC!)  ' RT3F_77
L_A76B: DI = BX
L_A76D: DI = DI * (2 ^ 1)
L_A76F: DI = DI * (2 ^ 1)
L_A771: DI = DI + &H1850
L_A775: BX = DI
L_A777: DI = &HC110
L_A77A: SI = &HC0F0
L_A77D: N_C110! = N_C0F0!  ' RT3F_7B
L_A780: DI = &HC114
L_A783: SI = &HBA90
L_A786: N_C114! = N_BA90!  ' RT3F_7B
L_A789: WORD(BP - &HC) = BX
L_A78C: GOSUB L_06A9
L_A78F: DI = &HC6B0
L_A792: FAC! = FAC! + N_C6B0!  ' RT3F_81
L_A795: DI = WORD(BP - &HC)
L_A798: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A79B: SI = &H804E
L_A79E: FAC! = N_804E!: DI = &H001E  ' RT3F_6F
L_A7A1: GOTO L_A8A2
L_A7A4: DI = &HC110
L_A7A7: SI = &HC1C0
L_A7AA: N_C110! = N_C1C0!  ' RT3F_7B
L_A7AD: BX = DI
L_A7AF: DI = &HC114
L_A7B2: SI = &HBA90
L_A7B5: N_C114! = N_BA90!  ' RT3F_7B
L_A7B8: GOSUB L_06A9
L_A7BB: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_A7BE: IF CompareLeft! > CompareRight! THEN GOTO L_A7C3  ' flags from L_A7BB
L_A7C0: GOTO L_A80F
L_A7C3: DI = &HC110
L_A7C6: SI = &HC160
L_A7C9: N_C110! = N_C160!  ' RT3F_7B
L_A7CC: BX = DI
L_A7CE: DI = &HC114
L_A7D1: SI = &HBA90
L_A7D4: N_C114! = N_BA90!  ' RT3F_7B
L_A7D7: GOSUB L_06A9
L_A7DA: DI = &HC110
L_A7DD: SI = &HC1BC
L_A7E0: N_C110! = N_C1BC!  ' RT3F_7B
L_A7E3: DI = &HC114
L_A7E6: SI = &HBA90
L_A7E9: N_C114! = N_BA90!  ' RT3F_7B
L_A7EC: T_03! = FAC!  ' RT3F_71; inline=&H83
L_A7F0: GOSUB L_06A9
L_A7F3: FAC! = T_03! - FAC!  ' RT3F_9D; inline=&H83
L_A7F7: DI = &HD5A8
L_A7FA: N_D5A8! = FAC!: SI = &H001A  ' RT3F_7D
L_A7FD: SI = DI
L_A7FF: DI = &HC0F4
L_A802: CompareLeft! = N_D5A8!: CompareRight! = N_C0F4!  ' RT3F_9F
L_A805: IF CompareLeft! > CompareRight! THEN GOTO L_A80A  ' flags from L_A802
L_A807: GOTO L_A80F
L_A80A: SWAP DI, SI
L_A80C: N(DI) = N(SI)  ' RT3F_7B
L_A80F: SI = &HD5A8
L_A812: CompareLeft! = N_D5A8!: CompareRight! = 0  ' RT3F_A7
L_A815: IF CompareLeft! > CompareRight! THEN GOTO L_A81A  ' flags from L_A812
L_A817: GOTO L_A899
L_A81A: BX = &H17
L_A81D: ARGPUSH BX  ' RT3E_42
L_A820: BX = 2
L_A823: LOCATE ARGS(), BX  ' RT3E_44
L_A826: ' PRINT statement begins ; RT3F_BC
L_A829: BX = SI
L_A82B: SI = &HBA90
L_A82E: DX = SI
L_A830: CX = BX
L_A832: BX = CINT(N_BA90!)  ' RT3F_75
L_A835: BX = BX * (2 ^ 1)
L_A837: BX = BX * (2 ^ 1)
L_A839: BX = BX + &H4288
L_A83D: PRINT S(BX);  ' RT3F_6A
L_A840: BX = &HD5AC
L_A843: PRINT S_D5AC$  ' RT3F_6E; H newline item, ledger correction
L_A846: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A849: DI = &HC120
L_A84C: SI = &HC1BC
L_A84F: N_C120! = N_C1BC!  ' RT3F_7B
L_A852: SWAP DX, SI
L_A854: DI = &HC124
L_A857: N_C124! = N(SI)  ' RT3F_7B
L_A85A: GOSUB L_06DB
L_A85D: BX = CINT(FAC!)  ' RT3F_77
L_A860: DI = BX
L_A862: DI = DI * (2 ^ 1)
L_A864: DI = DI * (2 ^ 1)
L_A866: DI = DI + &H1850
L_A86A: BX = DI
L_A86C: DI = &HC110
L_A86F: SI = &HC1BC
L_A872: N_C110! = N_C1BC!  ' RT3F_7B
L_A875: DI = &HC114
L_A878: SI = &HBA90
L_A87B: N_C114! = N_BA90!  ' RT3F_7B
L_A87E: WORD(BP - &HC) = BX
L_A881: GOSUB L_06A9
L_A884: DI = &HD5A8
L_A887: FAC! = FAC! + N_D5A8!  ' RT3F_81
L_A88A: BX = &H1A
L_A88D: FAC! = INT(FAC!)  ' RT3D_03
L_A890: DI = WORD(BP - &HC)
L_A893: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A896: GOSUB L_A71C
L_A899: DI = &H804E
L_A89C: SI = &HBA90
L_A89F: FAC! = N_BA90! + N_804E!  ' RT3F_7F
L_A8A2: DI = &HBA90
L_A8A5: N_BA90! = FAC!: SI = &H001A  ' RT3F_7D
L_A8A8: SI = DI
L_A8AA: DI = &HC10C
L_A8AD: CompareLeft! = N_BA90!: CompareRight! = N_C10C!  ' RT3F_9F
L_A8B0: IF CompareLeft! > CompareRight! THEN GOTO L_A8B5  ' flags from L_A8AD
L_A8B2: GOTO L_A7A4
L_A8B5: GOSUB L_2C93
L_A8B8: DI = &HBB56
L_A8BB: SI = &HC308
L_A8BE: CompareLeft! = N_C308!: CompareRight! = N_BB56!  ' RT3F_9F
L_A8C1: IF CompareLeft! = CompareRight! THEN GOTO L_A8C6  ' flags from L_A8BE
L_A8C3: GOTO L_A8CF
L_A8C6: DI = &H1A04
L_A8C9: SI = &H804E
L_A8CC: N_1A04! = N_804E!  ' RT3F_7B
L_A8CF: SI = &HD5C4
L_A8D2: FAC! = N_D5C4!: DI = &H001E  ' RT3F_6F
L_A8D5: GOTO L_A910
L_A8D8: SI = &HC942
L_A8DB: BX = SI
L_A8DD: DX = BX
L_A8DF: BX = CINT(N_C942!)  ' RT3F_75
L_A8E2: SI = BX
L_A8E4: SI = SI * (2 ^ 1)
L_A8E6: SI = SI * (2 ^ 1)
L_A8E8: SI = SI + &H1850
L_A8EC: DI = &H804E
L_A8EF: CompareLeft! = N(SI): CompareRight! = N_804E!  ' RT3F_9F
L_A8F2: IF CompareLeft! = CompareRight! THEN GOTO L_A8F7  ' flags from L_A8EF
L_A8F4: GOTO L_A907
L_A8F7: DI = SI
L_A8F9: SI = &H9412
L_A8FC: N(DI) = N_9412!  ' RT3F_7B
L_A8FF: DI = DX
L_A901: SI = &HD5C8
L_A904: N(DI) = N_D5C8!  ' RT3F_7B
L_A907: DI = &H804E
L_A90A: SI = &HC942
L_A90D: FAC! = N_C942! + N_804E!  ' RT3F_7F
L_A910: DI = &HC942
L_A913: N_C942! = FAC!: SI = &H001A  ' RT3F_7D
L_A916: SI = DI
L_A918: DI = &HD5CC
L_A91B: CompareLeft! = N_C942!: CompareRight! = N_D5CC!  ' RT3F_9F
L_A91E: IF CompareLeft! <= CompareRight! THEN GOTO L_A8D8  ' flags from L_A91B
L_A920: RETURN

```

### Unclassified trailing bytes

```basic
L_A921: ' Unclassified bytes after logical code end (not decoded as game logic): 9f 90 90 74 03 e9 8a 00 cd 3f bc 90 90 bb 66

```

## Inline dispatch evidence

The ON statements above use listing labels; these raw payloads preserve the CS-offset source words and allow independent checking of the &H0010 conversion and post-table return address.

| Call | Runtime | Payload bytes (after opcode) | Position after payload |
|---|---|---|---|
| L_3596 | RT3F_5E | `03 55 3d b5 37 90 35` | L_35A0 |
| L_3B65 | RT3F_5E | `04 67 3b 76 3b 85 3b 94 3b` | L_3B71 |
| L_3BB9 | RT3F_5E | `03 b3 3b 6a 3c b6 3c` | L_3BC3 |
| L_47EE | RT3F_5D | `0e b4 47 37 4f b4 47 b4 47 43 4f b4 47 5b 4f b4 47 b4 47 4f 4f b4 47 bc 4f bb 4f 28 54` | L_480E |
| L_5F4E | RT3F_5D | `17 73 5f 73 5f 73 5f 73 5f 61 60 96 61 f4 5e f4 5e f4 5e f4 5e f4 5e bb 61 d0 61 f4 5e f4 5e f4 5e f4 5e 19 62 f4 5e f4 5e f4 5e f4 5e 3e 62` | L_5F80 |
| L_787B | RT3F_5D | `03 f7 90 c2 8c e2 8b` | L_7885 |
| L_7BDE | RT3F_5D | `08 0d 7c a1 7c 5d 7d 5d 7d 5d 7d e1 7d e1 7d e1 7d` | L_7BF2 |
| L_8206 | RT3F_5D | `0c 81 86 81 86 d4 87 f6 88 6c 8b e2 8b e0 91 e7 8d c2 8c c2 8c c2 8c f7 90` | L_8222 |
| L_84A0 | RT3F_5D | `08 cc 84 ff 84 25 85 4b 85 71 85 ab 85 e5 85 22 86` | L_84B4 |
| L_9993 | RT3F_5E | `04 8f 99 a9 99 e9 99 03 9a` | L_999F |
| L_9CAA | RT3F_5E | `05 a8 9c c1 9c da 9c f3 9c 0c 9d` | L_9CB8 |
| L_9EC1 | RT3F_5D | `04 f2 9e 09 9f 28 9f 47 9f` | L_9ECD |
| L_A021 | RT3F_5E | `0c 45 a0 5d a0 2d a0 75 a0 8d a0 a5 a0 d5 a0 ed a0 bd a0 05 a1 1d a1 35 a1` | L_A03D |

Recovered coverage: 15760 instruction/data records, 4769 runtime sites, 105 distinct runtime IDs, 0 unresolved sites in 0 IDs. Every byte 0040..A92F is accounted for as an instruction, inline payload or explicitly unclassified tail bytes; every explicit branch and mapped dispatch destination is an instruction boundary. Inline payloads: 158 sites. Structural checks validate unique labels, branch/table boundaries, runtime provenance and exact unresolved-call inventory. No DOSBox behavior or independent semantic verification is claimed.

## Unknowns

Counts are static call sites in 0040..A92F, excluding the unclassified tail; no runtime loop multiplier. The corrected byte walk is authoritative for these counts, rather than the original listing footer. Every unresolved call below retains all six live register arguments plus any inline payload in the transcription.

| Runtime | Count | First offsets (all sites in transcription) |
|---|---:|---|
| None | 0 | All 105 runtime identities rendered from the expanded ledger |

No runtime-call identities remain unresolved in this draft after incorporating the expanded ledger. This is not a decode-gate claim. Remaining unknowns include runtime clobbers not fully modeled by this semantic transcription; exact array bounds/record-field meanings and DATA-to-array mappings; attacker/defender/crew field identities; units and interpretation of combat/communications formulas beyond their now-named arithmetic; complete bounds/error behavior for statements; M-confidence PUT action enumeration, exponentiation and SPC details; and the unclassified tail at A921..A92F. Numeric formulas are preserved rather than assigned unsupported gameplay names.

## Variables

Address identities are H. Names remain address-based unless a literal directly identifies their content. MBF operand types are H where a known numeric runtime consumes them; string identities are H from the literal table, with PRINT typing H from the updated ledger. Multiple roles at one address are retained rather than silently reconciled.

| DS address | Type | Draft name | Evidence |
|---|---|---|---|
| &H001A | MBF single | N_001A! | 028C; 0295; 031F; 036D; 06D4 … |
| &H1868 | MBF single | N_1868! | 0DDE; 4469 |
| &H1988 | MBF single | N_1988! | 0700; 29A1; 29D5; 29DC |
| &H198C | MBF single | N_198C! | 0706; 29A7; 29E7 |
| &H1994 | MBF single | N_1994! | 0C36 |
| &H19A4 | MBF single | N_19A4! | 0084; 009B |
| &H19A8 | MBF single | N_19A8! | 1B17; 5455 |
| &H19B0 | MBF single | N_19B0! | 291C; 2950; 5472; 54BD |
| &H19B4 | MBF single | N_19B4! | 0067; 0167; 02F9; 1957; 19C6 … |
| &H19C4 | MBF single | N_19C4! | 00C1 |
| &H1A04 | MBF single | N_1A04! | A8CC |
| &H1BFC | MBF single | N_1BFC! | 0DCC |
| &H1CC4 | MBF single | N_1CC4! | 0DD5 |
| &H1D28 | MBF single | N_1D28! | 43D1 |
| &H1D2C | MBF single | N_1D2C! | 0DC3; 4373; 43C8 |
| &H1D30 | MBF single | N_1D30! | 43E0 |
| &H1D34 | MBF single | N_1D34! | 43FB |
| &H1D38 | MBF single | N_1D38! | 43ED |
| &H1D3C | MBF single | N_1D3C! | 43BA |
| &H3AE8 | MBF single | N_3AE8! | 07E1; 0E33; 0E4E |
| &H3B1C | MBF single | N_3B1C! | 432A |
| &H3B20 | MBF single | N_3B20! | 0197; 1254 |
| &H3B24 | MBF single | N_3B24! | 018E |
| &H3B40 | MBF single | N_3B40! | 443F |
| &H3B44 | MBF single | N_3B44! | 440A |
| &H3B50 | MBF single | N_3B50! | 4421 |
| &H3B78 | MBF single | N_3B78! | 016D |
| &H3B7C | MBF single | N_3B7C! | 0E2A; 1278 |
| &H3B80 | MBF single | N_3B80! | 017F |
| &H3B88 | MBF single | N_3B88! | 430D |
| &H3BA0 | MBF single | N_3BA0! | 022E |
| &H3BAC | MBF single | N_3BAC! | 4410; 4429; 4447 |
| &H804E | MBF single | N_804E! | 0067; 0084; 00C1; 00CD; 00EE … |
| &H804E | MBF single constant | N_804E! | MODULE_CONSTANTS = 1 |
| &H9404 | string descriptor | S_9404$ | 007B; 00A9; 030D; 035B; 0E67 … |
| &H9408 | string descriptor | S_9408$ | MODULE_CONSTANTS literal ''; 007B; 020A; 11F0; 2BD6 … |
| &H940C | string descriptor | S_940C$ | MODULE_CONSTANTS literal 'A:'; 008F |
| &H9412 | MBF single | N_9412! | 009B; 01D0; 0662; 0907; 09E5 … |
| &H9412 | MBF single constant | N_9412! | MODULE_CONSTANTS = 2 |
| &H9416 | string descriptor | S_9416$ | MODULE_CONSTANTS literal 'B:'; 00A9 |
| &H941C | string descriptor | S_941C$ | MODULE_CONSTANTS literal 'MF'; 00AF |
| &H9422 | MBF single | N_9422! | 00B8; 8E36 |
| &H9426 | MBF single | N_9426! | 00C7; 7B14; 7B2E; 8694; 8783 … |
| &H942A | MBF single | N_942A! | 00B8 |
| &H942A | MBF single constant | N_942A! | MODULE_CONSTANTS = 3.14159 |
| &HBA90 | MBF single | N_BA90! | 00DB; 00F4; 00FC; 0113; 012C … |
| &HBA94 | MBF single | N_BA94! | 00FC; 079A; 0959; 0CEF; 0FE4 … |
| &HBA94 | MBF single constant | N_BA94! | MODULE_CONSTANTS = 4 |
| &HBAD0 | MBF single | N_BAD0! | 0134; 2BF7; 302E; 32DC; 4820 … |
| &HBAD0 | MBF single constant | N_BAD0! | MODULE_CONSTANTS = 13 |
| &HBAD4 | MBF single | N_BAD4! | 013D; 015A; 04F5; 0719 |
| &HBAD8 | string descriptor | S_BAD8$ | MODULE_CONSTANTS literal 'CHARINFO'; 0151 |
| &HBAE4 | MBF single | N_BAE4! | 0179; 0237; 023F; 0257; 0277 |
| &HBAE8 | MBF single | N_BAE8! | 0185; 02AD; 1D6A; 4618 |
| &HBAEC | MBF single | N_BAEC! | 018E; 01D0; 01ED; 0DBA; 4754 … |
| &HBAF0 | MBF single | N_BAF0! | 0197; 019F; 0221; 02DF; 047A … |
| &HBAF4 | MBF single | N_BAF4! | 0173; 047A; 04C3; 0895; 08CC … |
| &HBAF4 | MBF single constant | N_BAF4! | MODULE_CONSTANTS = 10 |
| &HBAF8 | string descriptor | S_BAF8$ | MODULE_CONSTANTS literal 'GROUND COMBAT'; 01C4 |
| &HBB0A | string descriptor | S_BB0A$ | MODULE_CONSTANTS literal 'The squad is surprised.'; 01DE |
| &HBB26 | string descriptor | S_BB26$ | MODULE_CONSTANTS literal 'The enemy is surprised.'; 01FB |
| &HBB42 | MBF single | N_BB42! | 0216; 02DF; 0E18; 981F |
| &HBB46 | MBF single | N_BB46! | 0216; 0553; 0595; 0E7A; 1AD3 … |
| &HBB46 | MBF single constant | N_BB46! | MODULE_CONSTANTS = 0 |
| &HBB4A | MBF single | N_BB4A! | 0221; 0974; 0DE7; 0E21; 2E9D … |
| &HBB4A | MBF single constant | N_BB4A! | MODULE_CONSTANTS = 11 |
| &HBB4E | MBF single | N_BB4E! | 0237; 0268; 0286; 46A1; 489E … |
| &HBB52 | MBF single | N_BB52! | 023F; 070C; 1159; 13D5; 1460 … |
| &HBB52 | MBF single constant | N_BB52! | MODULE_CONSTANTS = 0.5 |
| &HBB56 | MBF single | N_BB56! | 0262; 0845; 087D; 0A03; 0C5E … |
| &HBB56 | MBF single constant | N_BB56! | MODULE_CONSTANTS = 3 |
| &HBB5A | string descriptor | S_BB5A$ | MODULE_CONSTANTS literal 'Gravity:'; 0271 |
| &HBB66 | string descriptor | S_BB66$ | MODULE_CONSTANTS literal '      Fatigue Factor:'; 027D |
| &HBB80 | string descriptor | S_BB80$ | MODULE_CONSTANTS literal 'Atmosphere: '; 02A1 |
| &HBB90 | string descriptor | S_BB90$ | MODULE_CONSTANTS literal 'Breathable'; 02BB |
| &HBB9E | MBF single | N_BB9E! | 0286; 03DC; 06AF; 06E1; 0D6D … |
| &HBB9E | MBF single constant | N_BB9E! | MODULE_CONSTANTS = 100 |
| &HBBA2 | string descriptor | S_BBA2$ | MODULE_CONSTANTS literal 'Unbreathable'; 02CA |
| &HBBB2 | string descriptor | S_BBB2$ | MODULE_CONSTANTS literal 'Location of combat: '; 02D6 |
| &HBE7C | string descriptor | S_BE7C$ | MODULE_CONSTANTS literal 'LOGO.EGA'; 0343 |
| &HBEA0 | MBF single | N_BEA0! | 3B00; 82A0; 8BBC; 8EDA; 90E2 … |
| &HBEA8 | MBF single | N_BEA8! | 9415; 94A7; 9539 |
| &HBEC0 | MBF single | N_BEC0! | 6A5F |
| &HBF88 | string descriptor | S_BF88$ | MODULE_CONSTANTS literal 'TR'; 030D; 035B |
| &HBF8E | string descriptor | S_BF8E$ | MODULE_CONSTANTS literal '.EGA'; 032B; 19B7 |
| &HBF96 | string descriptor | S_BF96$ | MODULE_CONSTANTS literal '.BAS'; 037A; 198A |
| &HBF9E | MBF single | N_BF9E! | 0386; 03CE; 03E7; 0D22; 31AC … |
| &HBF9E | MBF single constant | N_BF9E! | MODULE_CONSTANTS = 16 |
| &HBFA2 | MBF single | N_BFA2! | 039A; 03F5 |
| &HBFA6 | MBF single | N_BFA6! | 0392; 0A3A; 0A7E; 1C5A; 1D23 … |
| &HBFA6 | MBF single constant | N_BFA6! | MODULE_CONSTANTS = 32 |
| &HBFAA | MBF single | N_BFAA! | 03A9 |
| &HBFAA | MBF single constant | N_BFAA! | MODULE_CONSTANTS = 68 |
| &HBFAE | MBF single | N_BFAE! | 03E7; 03ED; 03F5 |
| &HBFB2 | MBF single | N_BFB2! | 03D4; 03DC |
| &HBFB6 | MBF single | N_BFB6! | 0400; 054B |
| &HBFB6 | MBF single constant | N_BFB6! | MODULE_CONSTANTS = 80 |
| &HBFBA | MBF single | N_BFBA! | 040E |
| &HBFBA | MBF single constant | N_BFBA! | MODULE_CONSTANTS = 256 |
| &HBFBE | string descriptor | S_BFBE$ | MODULE_CONSTANTS literal ' Typical Inacessable Defensive Offensive   Area      Area      Area      Area'; 0462 |
| &HC010 | string descriptor | S_C010$ | MODULE_CONSTANTS literal 'To escape the combat '; 0488 |
| &HC02A | string descriptor | S_C02A$ | MODULE_CONSTANTS literal 'walk off the map.'; 049C |
| &HC040 | string descriptor | S_C040$ | MODULE_CONSTANTS literal 'use the door at the'; 04AB |
| &HC058 | string descriptor | S_C058$ | MODULE_CONSTANTS literal 'bottom of the map.'; 04B7 |
| &HC06E | string descriptor | S_C06E$ | MODULE_CONSTANTS literal 'You can not flee from combat in space   vessels, it must be resolved.'; 04D1 |
| &HC0B8 | string descriptor | S_C0B8$ | 04DD |
| &HC0BC | string descriptor | S_C0BC$ | 04E6 |
| &HC0C0 | string descriptor | S_C0C0$ | 04EF |
| &HC0C4 | string descriptor | S_C0C4$ | MODULE_CONSTANTS literal 'Dead'; 04DD |
| &HC0CC | string descriptor | S_C0CC$ | MODULE_CONSTANTS literal 'Okay'; 04E6 |
| &HC0D4 | string descriptor | S_C0D4$ | MODULE_CONSTANTS literal 'Rad '; 04EF |
| &HC0DC | string descriptor | S_C0DC$ | MODULE_CONSTANTS literal 'LOGO'; 0509 |
| &HC0E4 | string descriptor | S_C0E4$ | MODULE_CONSTANTS literal 'NAME'; 0519 |
| &HC0EC | string descriptor | S_C0EC$ | 0742; 076E; 2BCE; 2BE6; 2C75 … |
| &HC0F0 | MBF single | N_C0F0! | 058D; 0B29; 2170; 3435; 612F … |
| &HC0F0 | MBF single constant | N_C0F0! | MODULE_CONSTANTS = 53 |
| &HC0F4 | MBF single | N_C0F4! | 05CF; 0875; 0D4C; 101D; 1133 … |
| &HC0F4 | MBF single constant | N_C0F4! | MODULE_CONSTANTS = 5 |
| &HC0F8 | string descriptor | S_C0F8$ | MODULE_CONSTANTS literal 'CHARNAME'; 05E7 |
| &HC10C | MBF single | N_C10C! | 0645; 06A1; 07C2; 07D8; 083D … |
| &HC10C | MBF single constant | N_C10C! | MODULE_CONSTANTS = 6 |
| &HC110 | MBF single | N_C110! | 06B5; 0A7E; 1A14; 1C5A; 1EB4 … |
| &HC114 | MBF single | N_C114! | 06AF; 0A87; 1A1D; 1C63; 1EBF … |
| &HC118 | MBF single | N_C118! | 06BB |
| &HC118 | MBF single constant | N_C118! | MODULE_CONSTANTS = 1500 |
| &HC11C | MBF single | N_C11C! | 06CE; 8619; 86A4; 86C6 |
| &HC11C | MBF single constant | N_C11C! | MODULE_CONSTANTS = 0.1 |
| &HC120 | MBF single | N_C120! | 06E7; 078F; 07B9; 0A3A; 0AC2 … |
| &HC124 | MBF single | N_C124! | 06E1; 079A; 07C2; 0A47; 0ACC … |
| &HC128 | MBF single | N_C128! | 06ED |
| &HC128 | MBF single constant | N_C128! | MODULE_CONSTANTS = 1500.5 |
| &HC130 | MBF single | N_C130! | 0700; 29A1; 29CB |
| &HC130 | MBF single constant | N_C130! | MODULE_CONSTANTS = 30000 |
| &HC134 | string descriptor | S_C134$ | MODULE_CONSTANTS literal 'Change things? '; 0736 |
| &HC148 | string descriptor | S_C148$ | MODULE_CONSTANTS literal 'N'; 074A; 3506 |
| &HC14E | string descriptor | S_C14E$ | MODULE_CONSTANTS literal 'n'; 0756; 34FA |
| &HC154 | string descriptor | S_C154$ | MODULE_CONSTANTS literal 'Y'; 076E; 34D8 |
| &HC15A | string descriptor | S_C15A$ | MODULE_CONSTANTS literal 'y'; 077A; 34CC |
| &HC160 | MBF single | N_C160! | 078F; 20D6; 33B8; A7C9 |
| &HC160 | MBF single constant | N_C160! | MODULE_CONSTANTS = 51 |
| &HC164 | MBF single | N_C164! | 07B0 |
| &HC164 | MBF single constant | N_C164! | MODULE_CONSTANTS = 60 |
| &HC168 | MBF single | N_C168! | 07B9; 35F9; 5F13 |
| &HC168 | MBF single constant | N_C168! | MODULE_CONSTANTS = 23 |
| &HC16C | MBF single | N_C16C! | 07E1; 215B; 3386; 3B58; 76ED … |
| &HC16C | MBF single constant | N_C16C! | MODULE_CONSTANTS = 20 |
| &HC170 | MBF single | N_C170! | 07E7; 93B0 |
| &HC170 | MBF single constant | N_C170! | MODULE_CONSTANTS = 800 |
| &HC174 | MBF single | N_C174! | 080A; 09CA; 0B53; 1CD6; 347C |
| &HC174 | MBF single constant | N_C174! | MODULE_CONSTANTS = 54 |
| &HC178 | MBF single | N_C178! | 0825; 10C9; 1CE6; 1E59; 2A50 … |
| &HC178 | MBF single constant | N_C178! | MODULE_CONSTANTS = 9 |
| &HC17C | MBF single | N_C17C! | 085E; 096C; 0D95; 10EB; 1BAC … |
| &HC17C | MBF single constant | N_C17C! | MODULE_CONSTANTS = 8 |
| &HC180 | MBF single | N_C180! | 089B; 1DAD |
| &HC180 | MBF single constant | N_C180! | MODULE_CONSTANTS = -2 |
| &HC184 | MBF single | N_C184! | 08C4; 0A90; 0B1E; 0BB1; 1799 … |
| &HC184 | MBF single constant | N_C184! | MODULE_CONSTANTS = 12 |
| &HC188 | MBF single | N_C188! | 08EA; 0B4A; 3973; 6A88; 7721 … |
| &HC188 | MBF single constant | N_C188! | MODULE_CONSTANTS = 50 |
| &HC18C | MBF single | N_C18C! | 08F0; 0A62; 0D19; 1C80; 6B0B … |
| &HC18C | MBF single constant | N_C18C! | MODULE_CONSTANTS = 25 |
| &HC190 | MBF single | N_C190! | 0936; 0D43; 1A01 |
| &HC190 | MBF single constant | N_C190! | MODULE_CONSTANTS = 30 |
| &HC194 | MBF single | N_C194! | 093E; 0C66; 1017; 1825; 185F … |
| &HC194 | MBF single constant | N_C194! | MODULE_CONSTANTS = 7 |
| &HC198 | MBF single | N_C198! | 0951 |
| &HC198 | MBF single constant | N_C198! | MODULE_CONSTANTS = 70 |
| &HC19C | MBF single | N_C19C! | 099C; 9436 |
| &HC19C | MBF single constant | N_C19C! | MODULE_CONSTANTS = 1088 |
| &HC1A0 | MBF single | N_C1A0! | 09A7; 2018; 2B09; 5031; 6753 … |
| &HC1A0 | MBF single constant | N_C1A0! | MODULE_CONSTANTS = 1100 |
| &HC1A4 | MBF single | N_C1A4! | 0A25; 20C8; 2B76; 50AF; 680D … |
| &HC1A4 | MBF single constant | N_C1A4! | MODULE_CONSTANTS = 1397 |
| &HC1A8 | MBF single | N_C1A8! | 0A98 |
| &HC1A8 | MBF single constant | N_C1A8! | MODULE_CONSTANTS = 797 |
| &HC1AC | MBF single | N_C1AC! | 0AC2; 0D76; 339B; 36E9; 6077 … |
| &HC1AC | MBF single constant | N_C1AC! | MODULE_CONSTANTS = 27 |
| &HC1B0 | MBF single | N_C1B0! | 0AFD; 211C; 33EE; 60C2; A3EB … |
| &HC1B0 | MBF single constant | N_C1B0! | MODULE_CONSTANTS = 52 |
| &HC1B4 | MBF single | N_C1B4! | 0B74; 1790; 1DE1; 1EB4; 21A9 … |
| &HC1B4 | MBF single constant | N_C1B4! | MODULE_CONSTANTS = 33 |
| &HC1B8 | MBF single | N_C1B8! | 0B7D; 4DF0; 6B5F; 6C35; 77BF … |
| &HC1B8 | MBF single constant | N_C1B8! | MODULE_CONSTANTS = 90 |
| &HC1BC | MBF single | N_C1BC! | 0BDD; 0CF8; 20FC; 2D40; 338C … |
| &HC1BC | MBF single constant | N_C1BC! | MODULE_CONSTANTS = 15 |
| &HC1C0 | MBF single | N_C1C0! | 0BF3; 0DF0; 1A14; 2CAF; 2D77 … |
| &HC1C0 | MBF single constant | N_C1C0! | MODULE_CONSTANTS = 31 |
| &HC1C4 | MBF single | N_C1C4! | 0C3C; 1D8D; 3110; 94D3 |
| &HC1C4 | MBF single constant | N_C1C4! | MODULE_CONSTANTS = 2300 |
| &HC1C8 | MBF single | N_C1C8! | 0CB9 |
| &HC1C8 | MBF single constant | N_C1C8! | MODULE_CONSTANTS = 2375 |
| &HC1CC | MBF single | N_C1CC! | 0CCE |
| &HC1CC | MBF single constant | N_C1CC! | MODULE_CONSTANTS = 21 |
| &HC1D0 | MBF single | N_C1D0! | 0DC3; 0FFB; 18F6 |
| &HC1D0 | MBF single constant | N_C1D0! | MODULE_CONSTANTS = 26 |
| &HC1D4 | MBF single | N_C1D4! | 0DCC; 4DCB; 9A8F |
| &HC1D4 | MBF single constant | N_C1D4! | MODULE_CONSTANTS = 99 |
| &HC1D8 | MBF single | N_C1D8! | 0DD5; 8EBE |
| &HC1D8 | MBF single constant | N_C1D8! | MODULE_CONSTANTS = 999 |
| &HC1DC | MBF single | N_C1DC! | 0E0F; 2B03; 310A; 3352; 3542 … |
| &HC1DC | MBF single constant | N_C1DC! | MODULE_CONSTANTS = 0 |
| &HC1E0 | MBF single | N_C1E0! | 0E21; 647B; 6498; 6ABD; 6AC5 … |
| &HC1E4 | MBF single | N_C1E4! | 0E33; 1918 |
| &HC1E4 | MBF single constant | N_C1E4! | MODULE_CONSTANTS = 18 |
| &HC308 | MBF single | N_C308! | 1263; A8BE |
| &HC338 | MBF single | N_C338! | 3F2C |
| &HC52C | MBF single | N_C52C! | 1790; 47CA; 4F7A; 4FB3 |
| &HC530 | MBF single | N_C530! | 99E0 |
| &HC534 | MBF single | N_C534! | 9A84 |
| &HC538 | MBF single | N_C538! | 9A97 |
| &HC550 | MBF single | N_C550! | 1799; 47D3; 4EA9; 4F88; 4FBC |
| &HC554 | MBF single | N_C554! | 99F3 |
| &HC558 | MBF single | N_C558! | 9A8F |
| &HC55C | MBF single | N_C55C! | 9AA0 |
| &HC634 | MBF single | N_C634! | 0E45; 0EB9; 0FD2; 105E; 108D … |
| &HC638 | MBF single | N_C638! | 0E4E; 0E83; 12C0; 12C6; 163C … |
| &HC63C | MBF single | N_C63C! | 0E57; 162E; 287B; 3D11; 3D77 … |
| &HC640 | MBF single | N_C640! | 0E45; 9781 |
| &HC640 | MBF single constant | N_C640! | MODULE_CONSTANTS = 0 |
| &HC644 | string descriptor | S_C644$ | MODULE_CONSTANTS literal 'ENCINFO'; 0E67 |
| &HC650 | MBF single | N_C650! | 0E7A; 0E89; 0FCC; 1658 |
| &HC654 | MBF single | N_C654! | 0E83; 0FBE |
| &HC658 | MBF single | N_C658! | 1119 |
| &HC65C | MBF single | N_C65C! | 1031; 13B1 |
| &HC660 | MBF single | N_C660! | 13C4 |
| &HC664 | MBF single | N_C664! | 13E1 |
| &HC668 | MBF single | N_C668! | 3989 |
| &HC66C | MBF single | N_C66C! | 3A6D; 3A8D; 40D7 |
| &HC670 | MBF single | N_C670! | 1401 |
| &HC674 | MBF single | N_C674! | 1468 |
| &HC678 | MBF single | N_C678! | 14B8 |
| &HC67C | MBF single | N_C67C! | 151F |
| &HC680 | MBF single | N_C680! | 129A; 15E6 |
| &HC684 | MBF single | N_C684! | 12C0; 15FE |
| &HC688 | MBF single | N_C688! | 12C6; 1616 |
| &HC68C | MBF single | N_C68C! | 1491; 1548; 159A |
| &HC690 | MBF single | N_C690! | 1039; 6584 |
| &HC694 | MBF single | N_C694! | 1047; 6590 |
| &HC698 | MBF single | N_C698! | 1055; 6575 |
| &HC69C | MBF single | N_C69C! | 0FF5; 9568; 95B2; 9825 |
| &HC69C | MBF single constant | N_C69C! | MODULE_CONSTANTS = 14 |
| &HC6A0 | MBF single | N_C6A0! | 1031; 8973 |
| &HC6A0 | MBF single constant | N_C6A0! | MODULE_CONSTANTS = 1.3 |
| &HC6A4 | MBF single | N_C6A4! | 1041; 13AB; 145A; 1511; 158C … |
| &HC6A4 | MBF single constant | N_C6A4! | MODULE_CONSTANTS = 0.7 |
| &HC6A8 | MBF single | N_C6A8! | 104F; 13A5; 291C; 7271; 8AC1 … |
| &HC6A8 | MBF single constant | N_C6A8! | MODULE_CONSTANTS = 0.6 |
| &HC6AC | MBF single | N_C6AC! | 1064; 10E0 |
| &HC6B0 | MBF single | N_C6B0! | 105E; 120C; 136A; 1682; 1AB4 … |
| &HC6B0 | MBF single constant | N_C6B0! | MODULE_CONSTANTS = -1 |
| &HC6B4 | MBF single | N_C6B4! | 106A; 1376; 1C3C; 2887; 28AD … |
| &HC6B4 | MBF single constant | N_C6B4! | MODULE_CONSTANTS = 0 |
| &HC6B8 | MBF single | N_C6B8! | 1077; 10D2; 10D8; 10E0; 10EB … |
| &HC6BC | MBF single | N_C6BC! | 1167; 119E; 2D01; 2D08 |
| &HC6C0 | MBF single | N_C6C0! | 117E; 1185; 11C4; 120C |
| &HC6C4 | MBF single | N_C6C4! | 1196; 119E |
| &HC6C8 | string descriptor | S_C6C8$ | MODULE_CONSTANTS literal ' '; 1173; 1F55; 2D5C; 3001 … |
| &HC6CE | MBF single | N_C6CE! | 12CE; 638A |
| &HC6CE | MBF single constant | N_C6CE! | MODULE_CONSTANTS = -3 |
| &HC6D2 | string descriptor | S_C6D2$ | MODULE_CONSTANTS literal 'Group '; 1306 |
| &HC6DC | MBF single | N_C6DC! | 12ED |
| &HC6DC | MBF single constant | N_C6DC! | MODULE_CONSTANTS = 19 |
| &HC6E0 | MBF single | N_C6E0! | 130E; 4224; 4E6E; 57E1; 5E85 … |
| &HC6E0 | MBF single constant | N_C6E0! | MODULE_CONSTANTS = 65 |
| &HC6E4 | string descriptor | S_C6E4$ | MODULE_CONSTANTS literal ':'; 131D; 2BA6; 4237 |
| &HC6EA | string descriptor | S_C6EA$ | MODULE_CONSTANTS literal '(s)'; 1351; 424F; 6EDF |
| &HC6F2 | MBF single | N_C6F2! | 1370; 15C3 |
| &HC6F6 | MBF single | N_C6F6! | 13DB |
| &HC6F6 | MBF single constant | N_C6F6! | MODULE_CONSTANTS = 0.75 |
| &HC6FA | MBF single | N_C6FA! | 142B; 14E2; 1C97 |
| &HC6FA | MBF single constant | N_C6FA! | MODULE_CONSTANTS = 0 |
| &HC6FE | MBF single | N_C6FE! | 15FE; 163C; 1650 |
| &HC702 | MBF single | N_C702! | 17A2; 17FE; 1841; 4A2B; 4AB0 … |
| &HC706 | MBF single | N_C706! | 17B8; 1807; 184A; 4A34; 4AB8 … |
| &HC70A | MBF single | N_C70A! | 17FE; 5817; 6B16 |
| &HC70E | MBF single | N_C70E! | 1859; 5687; 56B3; 7577; 760F … |
| &HC712 | MBF single | N_C712! | 1841; 579C; 5D18; 5D4D; 5FDB … |
| &HC716 | MBF single | N_C716! | 1878; 1938; 6472; 6AB4; 775B |
| &HC71A | MBF single | N_C71A! | 1892 |
| &HC71A | MBF single constant | N_C71A! | MODULE_CONSTANTS = -1.5 |
| &HC71E | MBF single | N_C71E! | 18B8 |
| &HC71E | MBF single constant | N_C71E! | MODULE_CONSTANTS = -12 |
| &HC722 | MBF single | N_C722! | 18D8; 3D99; 3F93; 4BB2; 4DFE … |
| &HC726 | MBF single | N_C726! | 18EA; 92D4; 9583 |
| &HC726 | MBF single constant | N_C726! | MODULE_CONSTANTS = 39 |
| &HC72A | MBF single | N_C72A! | 1938; 4B62; 4F9F |
| &HC72E | string descriptor | S_C72E$ | MODULE_CONSTANTS literal 'BIGSH'; 196B |
| &HC738 | string descriptor | S_C738$ | MODULE_CONSTANTS literal 'BIGSH'; 19AF |
| &HC742 | string descriptor | S_C742$ | MODULE_CONSTANTS literal 'PLBTSH.EGA'; 19DA |
| &HC750 | string descriptor | S_C750$ | MODULE_CONSTANTS literal 'plbtsh.bas'; 19F2 |
| &HC75E | MBF single | N_C75E! | 1A01; 1A34; 1A60; 1AA2; 4704 |
| &HC762 | MBF single | N_C762! | 1A1D; 1A47; 1A4D; 1A55; 1F8F … |
| &HC766 | MBF single | N_C766! | 1A34; 2B17; 2B6E; 2B76; 3B29 … |
| &HC76A | string descriptor | S_C76A$ | MODULE_CONSTANTS literal 'Squad movement:'; 1A9C |
| &HC77E | string descriptor | S_C77E$ | MODULE_CONSTANTS literal 'squares per turn'; 1AA8 |
| &HC796 | MBF single | N_C796! | 1ABF |
| &HC79E | MBF single | N_C79E! | 1ACD |
| &HC7A6 | MBF single | N_C7A6! | 1AB4 |
| &HC7AE | MBF single | N_C7AE! | 1AC5 |
| &HC7E6 | MBF single | N_C7E6! | 1B0E; 2C4F; 2C55; 2C5D; 6F1C … |
| &HC7EA | MBF single | N_C7EA! | 1B17; 87B8; 8F4F |
| &HC92E | MBF single | N_C92E! | 1C1B; 3590; 379E; 37B0 |
| &HC932 | MBF single | N_C932! | 1C24; 3A61; 4105; 6F63; 70F3 … |
| &HC936 | MBF single | N_C936! | 1C2A |
| &HC93A | MBF single | N_C93A! | 1C33; 9B79; 9DBC |
| &HC93E | MBF single | N_C93E! | 1C3C; 3CDE; 3F8A; 42E8; 4397 … |
| &HC942 | MBF single | N_C942! | 1C4E; 1D9A; 1DC3; 1E06; 1E49 … |
| &HC946 | MBF single | N_C946! | 1C6C; 1C74; 1CA3; 1D42; 2A1D … |
| &HC94A | MBF single | N_C94A! | 1CB1; 1CB8; 1FB7; 1FBC; 2082 … |
| &HC94E | MBF single | N_C94E! | 1CAB; 1FB1; 2A2B; 50BA; 50EE … |
| &HC94E | MBF single constant | N_C94E! | MODULE_CONSTANTS = 788 |
| &HC952 | string descriptor | S_C952$ | MODULE_CONSTANTS literal 'Squad members with oxygen:'; 1D84 |
| &HC970 | MBF single | N_C970! | 1E24; 1ECB; 2216; 56D7; 6351 … |
| &HC970 | MBF single constant | N_C970! | MODULE_CONSTANTS = 56 |
| &HC974 | MBF single | N_C974! | 1E67; 1EEA; 1F10; 2240; 4627 |
| &HC974 | MBF single constant | N_C974! | MODULE_CONSTANTS = 40 |
| &HC978 | MBF single | N_C978! | 1E9D; 3162; 955A |
| &HC978 | MBF single constant | N_C978! | MODULE_CONSTANTS = 2597 |
| &HC97C | MBF single | N_C97C! | 1F04; 1F2F; 1F35; 310A; 3143 … |
| &HC980 | MBF single | N_C980! | 1F46; 26E9; 2B97; 2C0F; 308C … |
| &HC980 | MBF single constant | N_C980! | MODULE_CONSTANTS = 48 |
| &HC984 | MBF single | N_C984! | 1F98; 1F9D; 1FAB; 2A48; 2A8A … |
| &HC988 | MBF single | N_C988! | 1FCE; 1FD6; 2035; 674D; 6771 |
| &HC98C | MBF single | N_C98C! | 2012; 205A; 672E; 6796 |
| &HC990 | MBF single | N_C990! | 2079; 3DCC; 3DD5; 67B5 |
| &HC990 | MBF single constant | N_C990! | MODULE_CONSTANTS = 9999 |
| &HC994 | MBF single | N_C994! | 220D |
| &HC994 | MBF single constant | N_C994! | MODULE_CONSTANTS = 0 |
| &HC998 | MBF single | N_C998! | 2237; 56F6; 6254 |
| &HC998 | MBF single constant | N_C998! | MODULE_CONSTANTS = 0 |
| &HC99C | MBF single | N_C99C! | 225F; 4FC5; 5690; 6486; 648E … |
| &HC99C | MBF single constant | N_C99C! | MODULE_CONSTANTS = 0 |
| &HC9A0 | MBF single | N_C9A0! | 2269; 4652; 467A; 4852; 487A … |
| &HC9A0 | MBF single constant | N_C9A0! | MODULE_CONSTANTS = 58 |
| &HC9A4 | MBF single | N_C9A4! | 2519 |
| &HC9A4 | MBF single constant | N_C9A4! | MODULE_CONSTANTS = 64 |
| &HC9A8 | string descriptor | S_C9A8$ | MODULE_CONSTANTS literal '1 2 3 4 5'; 2552 |
| &HC9B6 | string descriptor | S_C9B6$ | MODULE_CONSTANTS literal 'Name    HP  Cond A:R'; 258B |
| &HC9CE | string descriptor | S_C9CE$ | MODULE_CONSTANTS literal '>'; 26F8 |
| &HC9D4 | MBF single | N_C9D4! | 2729 |
| &HC9D8 | MBF single | N_C9D8! | 2881; 28E4 |
| &HC9DC | MBF single | N_C9DC! | 2891; 28D6; 28DC; 28E4; 695E … |
| &HC9E0 | MBF single | N_C9E0! | 28A7; 28CB |
| &HC9E4 | MBF single | N_C9E4! | 28BD; 28C3; 28CB; 5A3B; 5B0D … |
| &HC9E8 | MBF single | N_C9E8! | 2922; 2942 |
| &HC9EC | MBF single | N_C9EC! | 2934; 293A; 2942; 2968; 296E … |
| &HC9F0 | MBF single | N_C9F0! | 2956; 2976 |
| &HC9F4 | string descriptor | S_C9F4$ | MODULE_CONSTANTS literal 'Select Option'; 2991 |
| &HCA06 | MBF single | N_CA06! | 29AD; 29CB; 3BF5; 3C54; 3C5C … |
| &HCA0A | MBF single | N_CA0A! | 29B8 |
| &HCA0A | MBF single constant | N_CA0A! | MODULE_CONSTANTS = 1e+07 |
| &HCA0E | MBF single | N_CA0E! | 2A63; 2A7B |
| &HCA12 | string descriptor | S_CA12$ | MODULE_CONSTANTS literal 'Hnd'; 2AB0 |
| &HCA1A | MBF single | N_CA1A! | 2AD0; 2AD8; 2AE8; 2B97 |
| &HCA1E | string descriptor | S_CA1E$ | MODULE_CONSTANTS literal 'Brk'; 2AF6 |
| &HCA26 | MBF single | N_CA26! | 2B03; 2B5D; 2B81; 2BAC |
| &HCA2A | string descriptor | S_CA2A$ | 2BC2; 4FE1 |
| &HCA2E | MBF single | N_CA2E! | 2C05; 3302 |
| &HCA2E | MBF single constant | N_CA2E! | MODULE_CONSTANTS = 0 |
| &HCA32 | MBF single | N_CA32! | 2C1B |
| &HCA32 | MBF single constant | N_CA32! | MODULE_CONSTANTS = 55 |
| &HCA36 | MBF single | N_CA36! | 2C30 |
| &HCA36 | MBF single constant | N_CA36! | MODULE_CONSTANTS = -48 |
| &HCA3A | string descriptor | S_CA3A$ | MODULE_CONSTANTS literal 'Press ENTER Key'; 2C69 |
| &HCA4E | MBF single | N_CA4E! | 2C99; 2CD3; 6C9E; 6F02; 7EB9 … |
| &HCA52 | MBF single | N_CA52! | 2DE2; 2DEA; 2E03; 2E89; 2E91 … |
| &HCA56 | MBF single | N_CA56! | 2DEA; A347 |
| &HCA56 | MBF single constant | N_CA56! | MODULE_CONSTANTS = 95 |
| &HCA5A | MBF single | N_CA5A! | 2DF5; 2E10; 2ECF; 5F1F |
| &HCA5A | MBF single constant | N_CA5A! | MODULE_CONSTANTS = -32 |
| &HCA5E | MBF single | N_CA5E! | 2E2A; 388E; 394D; 5F0A |
| &HCA62 | MBF single | N_CA62! | 2E36; 3897; 3956; 51D5; 5F13 |
| &HCA66 | MBF single | N_CA66! | 2E03 |
| &HCA66 | MBF single constant | N_CA66! | MODULE_CONSTANTS = -64 |
| &HCA6A | MBF single | N_CA6A! | 2E1C; 51E1; 5F2A |
| &HCA6A | MBF single constant | N_CA6A! | MODULE_CONSTANTS = -51 |
| &HCA6E | MBF single | N_CA6E! | 2EC4; 6A68; 7C23 |
| &HCA6E | MBF single constant | N_CA6E! | MODULE_CONSTANTS = 43 |
| &HCA72 | MBF single | N_CA72! | 2EE9; 4570; 4598; 45B4; 45EA … |
| &HCA72 | MBF single constant | N_CA72! | MODULE_CONSTANTS = 37 |
| &HCA76 | MBF single | N_CA76! | 2FAC; 307D; 30DC; 352A |
| &HCA7A | MBF single | N_CA7A! | 2FBA; 2FDE; 81D9; 872E; 8882 … |
| &HCA7E | MBF single | N_CA7E! | 2FC6; 2FD5; 81E7; 873B; 888F … |
| &HCA82 | string descriptor | S_CA82$ | 300D; 301D; 30EA |
| &HCA86 | MBF single | N_CA86! | 3098 |
| &HCA86 | MBF single constant | N_CA86! | MODULE_CONSTANTS = 57 |
| &HCA8A | MBF single | N_CA8A! | 30BE |
| &HCA8A | MBF single constant | N_CA8A! | MODULE_CONSTANTS = 126 |
| &HCA90 | MBF single | N_CA90! | 312D |
| &HCA94 | MBF single | N_CA94! | 313A; 44B7; 44F2 |
| &HCA98 | MBF single | N_CA98! | 314B |
| &HCA98 | MBF single constant | N_CA98! | MODULE_CONSTANTS = 2600 |
| &HCA9C | string descriptor | S_CA9C$ | MODULE_CONSTANTS literal 'Can Not Carry Anymore Of That'; 317D |
| &HCABE | string descriptor | S_CABE$ | MODULE_CONSTANTS literal 'Can Not Afford It'; 319C |
| &HCAD4 | MBF single | N_CAD4! | 3208; 3A2A; A3C8; A4E2 |
| &HCAD4 | MBF single constant | N_CAD4! | MODULE_CONSTANTS = 0.25 |
| &HCAD8 | MBF single | N_CAD8! | 327D; 32CD |
| &HCAD8 | MBF single constant | N_CAD8! | MODULE_CONSTANTS = -25 |
| &HCADC | MBF single | N_CADC! | 33AD; 33DE; 3414; 345B; 34A0 |
| &HCAE0 | MBF single | N_CAE0! | 34F0; 351E; 3542; 35C1 |
| &HCAE4 | string descriptor | S_CAE4$ | MODULE_CONSTANTS literal '(yes/no) '; 3533 |
| &HCAF2 | string descriptor | S_CAF2$ | MODULE_CONSTANTS literal 'yes'; 354B |
| &HCAFA | string descriptor | S_CAFA$ | MODULE_CONSTANTS literal 'YES'; 3557 |
| &HCB02 | MBF single | N_CB02! | 3576; 3C5C; 3C97; 3CFC; 4166 … |
| &HCB06 | MBF single | N_CB06! | 3582; 3D6E; 3F0D; 3F7C; 3FB5 … |
| &HCB0A | string descriptor | S_CB0A$ | MODULE_CONSTANTS literal 'Establish communications? (y/n)'; 35B5 |
| &HCB2E | MBF single | N_CB2E! | 36D7; 4391; 5EB2; 7444; 74ED |
| &HCB2E | MBF single constant | N_CB2E! | MODULE_CONSTANTS = 49 |
| &HCB32 | string descriptor | S_CB32$ | MODULE_CONSTANTS literal ' translates'; 376C |
| &HCB42 | string descriptor | S_CB42$ | MODULE_CONSTANTS literal ' uses ESP'; 3792 |
| &HCB50 | MBF single | N_CB50! | 377E |
| &HCB50 | MBF single constant | N_CB50! | MODULE_CONSTANTS = -6 |
| &HCB54 | string descriptor | S_CB54$ | MODULE_CONSTANTS literal 'Attempt fails'; 37B9 |
| &HCB66 | string descriptor | S_CB66$ | MODULE_CONSTANTS literal 'Communications Phase'; 37DA |
| &HCB7E | string descriptor | S_CB7E$ | MODULE_CONSTANTS literal 'A-Plead'; 37F6 |
| &HCB8A | string descriptor | S_CB8A$ | MODULE_CONSTANTS literal 'B-Ask'; 380F |
| &HCB94 | string descriptor | S_CB94$ | MODULE_CONSTANTS literal 'C-Demand'; 3825 |
| &HCBA0 | string descriptor | S_CBA0$ | MODULE_CONSTANTS literal 'D-Bargain/Bribe'; 383E |
| &HCBB4 | string descriptor | S_CBB4$ | MODULE_CONSTANTS literal 'E-Impersonate Diety'; 3854 |
| &HCBCC | string descriptor | S_CBCC$ | MODULE_CONSTANTS literal 'F-None'; 386A |
| &HCBD6 | string descriptor | S_CBD6$ | MODULE_CONSTANTS literal 'Choose An Approach: (A-F)'; 3882 |
| &HCBF4 | MBF single | N_CBF4! | 38B1; 38B9; 38C7; 397E; 3AA3 … |
| &HCBF8 | MBF single | N_CBF8! | 38D5; 396A; 3BB6 |
| &HCBFC | string descriptor | S_CBFC$ | MODULE_CONSTANTS literal 'A-Truce'; 38FC |
| &HCC08 | string descriptor | S_CC08$ | MODULE_CONSTANTS literal 'B-Tribute'; 3913 |
| &HCC16 | string descriptor | S_CC16$ | MODULE_CONSTANTS literal 'C-Surrender'; 392A |
| &HCC26 | string descriptor | S_CC26$ | MODULE_CONSTANTS literal 'Choose An Objective: (A-C)'; 3941 |
| &HCC44 | MBF single | N_CC44! | 3973; 3AD9; 3B23; 3B3C |
| &HCC48 | MBF single | N_CC48! | 39AC; 3F32; 3F57 |
| &HCC4C | MBF single | N_CC4C! | 39AC; 39D4; 3FBF; 400B; 4058 |
| &HCC50 | MBF single | N_CC50! | 39B4; 39B9; 39D4; 39E2; 3ABB |
| &HCC54 | MBF single | N_CC54! | 39F2 |
| &HCC54 | MBF single constant | N_CC54! | MODULE_CONSTANTS = -0.5 |
| &HCC58 | MBF single | N_CC58! | 3A00; 6575 |
| &HCC58 | MBF single constant | N_CC58! | MODULE_CONSTANTS = -0.25 |
| &HCC5C | MBF single | N_CC5C! | 3A0E |
| &HCC5C | MBF single constant | N_CC5C! | MODULE_CONSTANTS = -0.05 |
| &HCC60 | MBF single | N_CC60! | 3A1C; 86B5; 86D7; 8CBD; 8DDA |
| &HCC60 | MBF single constant | N_CC60! | MODULE_CONSTANTS = 0.05 |
| &HCC64 | MBF single | N_CC64! | 3B1D |
| &HCC64 | MBF single constant | N_CC64! | MODULE_CONSTANTS = 150 |
| &HCC68 | MBF single | N_CC68! | 3B3C |
| &HCC68 | MBF single constant | N_CC68! | MODULE_CONSTANTS = -20 |
| &HCC6C | string descriptor | S_CC6C$ | MODULE_CONSTANTS literal 'They respectfully decline'; 3B7D |
| &HCC8A | string descriptor | S_CC8A$ | MODULE_CONSTANTS literal 'They refuse your offer'; 3B8C |
| &HCCA4 | string descriptor | S_CCA4$ | MODULE_CONSTANTS literal 'They are insulted by your offer'; 3B9B |
| &HCCC8 | string descriptor | S_CCC8$ | MODULE_CONSTANTS literal 'They laugh in your face'; 3BAA |
| &HCCE4 | string descriptor | S_CCE4$ | MODULE_CONSTANTS literal 'They agree to a truce'; 3BD7 |
| &HCCFE | MBF single | N_CCFE! | 3BE3; 3C71; 3CBA; 3CD8; 3FA9 … |
| &HCD02 | MBF single | N_CD02! | 3C04; 3C2A; 3C4E; 3C83; 3CF0 … |
| &HCD06 | string descriptor | S_CD06$ | MODULE_CONSTANTS literal 'They accept'; 3C24 |
| &HCD16 | string descriptor | S_CD16$ | MODULE_CONSTANTS literal 'credits'; 3C30 |
| &HCD22 | string descriptor | S_CD22$ | MODULE_CONSTANTS literal 'as payment for a truce'; 3C45 |
| &HCD3C | string descriptor | S_CD3C$ | MODULE_CONSTANTS literal 'They pay'; 3CA0 |
| &HCD48 | string descriptor | S_CD48$ | MODULE_CONSTANTS literal 'credits'; 3CAB |
| &HCD54 | string descriptor | S_CD54$ | MODULE_CONSTANTS literal 'They surrender'; 3CCC |
| &HCD66 | MBF single | N_CD66! | 3D17; 3D5F |
| &HCD6A | MBF single | N_CD6A! | 3D7D; 3F71 |
| &HCD6E | MBF single | N_CD6E! | 3DF4; 3E4F |
| &HCD72 | MBF single | N_CD72! | 3EFE |
| &HCD72 | MBF single constant | N_CD72! | MODULE_CONSTANTS = 2.5 |
| &HCD76 | MBF single | N_CD76! | 3F51 |
| &HCD76 | MBF single constant | N_CD76! | MODULE_CONSTANTS = 0.125 |
| &HCD7A | MBF single | N_CD7A! | 4041 |
| &HCD7A | MBF single constant | N_CD7A! | MODULE_CONSTANTS = 796 |
| &HCD7E | MBF single | N_CD7E! | 4087; 40CB |
| &HCD82 | string descriptor | S_CD82$ | MODULE_CONSTANTS literal 'Battle Over'; 4123 |
| &HCD92 | string descriptor | S_CD92$ | MODULE_CONSTANTS literal 'BATTLE REPORT'; 4149 |
| &HCDA4 | string descriptor | S_CDA4$ | MODULE_CONSTANTS literal 'Credits Gained:'; 4160 |
| &HCDB8 | MBF single | N_CDB8! | 4184; 42DD |
| &HCDBC | MBF single | N_CDBC! | 41B2; 4202 |
| &HCDC0 | string descriptor | S_CDC0$ | MODULE_CONSTANTS literal 'Group '; 421B |
| &HCDCA | string descriptor | S_CDCA$ | MODULE_CONSTANTS literal 'killed. '; 427C |
| &HCDD6 | string descriptor | S_CDD6$ | MODULE_CONSTANTS literal 'Survived.'; 429E |
| &HCDE4 | string descriptor | S_CDE4$ | MODULE_CONSTANTS literal 'Surrendered.'; 42C3 |
| &HCDF4 | string descriptor | S_CDF4$ | MODULE_CONSTANTS literal 'SPACE.STR'; 4338 |
| &HCE02 | string descriptor | S_CE02$ | MODULE_CONSTANTS literal 'INSIDE.EXE'; 4347 |
| &HCE10 | string descriptor | S_CE10$ | MODULE_CONSTANTS literal 'You Are All Dead'; 4365 |
| &HCE24 | MBF single | N_CE24! | 4373; 437B; 43A7; 4507 |
| &HCE28 | MBF single | N_CE28! | 4381; 4386; 43C8 |
| &HCE2C | MBF single | N_CE2C! | 43A7; 4507 |
| &HCE2C | MBF single constant | N_CE2C! | MODULE_CONSTANTS = 260 |
| &HCE30 | MBF single | N_CE30! | 440A; 4525; 5F38 |
| &HCE30 | MBF single constant | N_CE30! | MODULE_CONSTANTS = -10 |
| &HCE34 | MBF single | N_CE34! | 4421; 443F; 6B3B |
| &HCE34 | MBF single constant | N_CE34! | MODULE_CONSTANTS = -50 |
| &HCE38 | MBF single | N_CE38! | 4436; 4454 |
| &HCE38 | MBF single constant | N_CE38! | MODULE_CONSTANTS = 0 |
| &HCE3C | string descriptor | S_CE3C$ | MODULE_CONSTANTS literal 'Tow linkage broken'; 4477 |
| &HCE52 | MBF single | N_CE52! | 4484; 44A7 |
| &HCE56 | MBF single | N_CE56! | 4484 |
| &HCE56 | MBF single constant | N_CE56! | MODULE_CONSTANTS = 999999 |
| &HCE5A | MBF single | N_CE5A! | 448A |
| &HCE5A | MBF single constant | N_CE5A! | MODULE_CONSTANTS = 330 |
| &HCE5E | MBF single | N_CE5E! | 44CE |
| &HCE5E | MBF single constant | N_CE5E! | MODULE_CONSTANTS = 339 |
| &HCE62 | string descriptor | S_CE62$ | MODULE_CONSTANTS literal 'Towing for salvage'; 44E5 |
| &HCE78 | MBF single | N_CE78! | 453C |
| &HCE78 | MBF single constant | N_CE78! | MODULE_CONSTANTS = 210 |
| &HCE7C | MBF single | N_CE7C! | 455D; 46DA; 4811; 483B; 4D3F … |
| &HCE80 | MBF single | N_CE80! | 455D |
| &HCE80 | MBF single constant | N_CE80! | MODULE_CONSTANTS = 0 |
| &HCE84 | MBF single | N_CE84! | 46A1 |
| &HCE84 | MBF single constant | N_CE84! | MODULE_CONSTANTS = 22 |
| &HCE88 | string descriptor | S_CE88$ | MODULE_CONSTANTS literal 'Movement Phase'; 46F2 |
| &HCE9A | MBF single | N_CE9A! | 46F8; 4704; 490F; 4DCB; 4DD4 … |
| &HCE9E | string descriptor | S_CE9E$ | MODULE_CONSTANTS literal 'A-Switch Weapons'; 477A |
| &HCEB2 | string descriptor | S_CEB2$ | MODULE_CONSTANTS literal 'B-Skip Move'; 4791 |
| &HCEC2 | string descriptor | S_CEC2$ | MODULE_CONSTANTS literal 'C-Time Delay'; 47A8 |
| &HCED2 | MBF single | N_CED2! | 47CA; 4FB3 |
| &HCED6 | MBF single | N_CED6! | 47D3; 4FBC |
| &HCEDA | MBF single | N_CEDA! | 47DC; 4F59; 4F71; 4F7A; 8066 … |
| &HCEDE | MBF single | N_CEDE! | 47E2; 4F4D; 4F65; 4F88; 808B … |
| &HCEE2 | MBF single | N_CEE2! | 48D2; 4DA1 |
| &HCEE6 | MBF single | N_CEE6! | 4977; 4CFA |
| &HCEEA | MBF single | N_CEEA! | 4980; 4D0A; 4D2F |
| &HCEEE | MBF single | N_CEEE! | 4977; 4B85; 4BE6; 4C94; 4CDB |
| &HCEEE | MBF single constant | N_CEEE! | MODULE_CONSTANTS = 1e+20 |
| &HCEF2 | MBF single | N_CEF2! | 4998; 4A02; 4D6E |
| &HCEF6 | MBF single | N_CEF6! | 49A6; 4A1E; 4D85 |
| &HCEFA | MBF single | N_CEFA! | 49C4; 4A65 |
| &HCEFE | MBF single | N_CEFE! | 49EE; 4A9B; 4AFA; 4B2C; 4B73 … |
| &HCF02 | MBF single | N_CF02! | 4A40; 4CBE |
| &HCF06 | MBF single | N_CF06! | 4BFA; 4CB0 |
| &HCF0A | MBF single | N_CF0A! | 4C0C; 4C1A; 4CA2; 4CA8; 4CB0 |
| &HCF0E | MBF single | N_CF0E! | 4C2C; 4C77; 71D3; 7260; 72A1 … |
| &HCF12 | MBF single | N_CF12! | 4C77; 4CBE |
| &HCF12 | MBF single constant | N_CF12! | MODULE_CONSTANTS = 0.9 |
| &HCF16 | MBF single | N_CF16! | 4E59; 4E80; 4E8C |
| &HCF1A | MBF single | N_CF1A! | 4EB0; 8E1B |
| &HCF1A | MBF single constant | N_CF1A! | MODULE_CONSTANTS = -8 |
| &HCF1E | string descriptor | S_CF1E$ | MODULE_CONSTANTS literal 'Who will change weapons?'; 4FE1 |
| &HCF3A | MBF single | N_CF3A! | 4FF6 |
| &HCF3A | MBF single constant | N_CF3A! | MODULE_CONSTANTS = 501 |
| &HCF3E | MBF single | N_CF3E! | 5013 |
| &HCF3E | MBF single constant | N_CF3E! | MODULE_CONSTANTS = 0 |
| &HCF42 | MBF single | N_CF42! | 5029 |
| &HCF42 | MBF single constant | N_CF42! | MODULE_CONSTANTS = 554 |
| &HCF46 | MBF single | N_CF46! | 5076; 536D |
| &HCF46 | MBF single constant | N_CF46! | MODULE_CONSTANTS = 500 |
| &HCF4A | MBF single | N_CF4A! | 50F4; 50F9 |
| &HCF4E | string descriptor | S_CF4E$ | MODULE_CONSTANTS literal ' Is Using:'; 5174 |
| &HCF5C | string descriptor | S_CF5C$ | MODULE_CONSTANTS literal 'SPACE to change weapon ENTER to select'; 519A |
| &HCF86 | MBF single | N_CF86! | 51FC |
| &HCF86 | MBF single constant | N_CF86! | MODULE_CONSTANTS = 1090 |
| &HCF8A | MBF single | N_CF8A! | 5292 |
| &HCF8A | MBF single constant | N_CF8A! | MODULE_CONSTANTS = -787 |
| &HCF8E | string descriptor | S_CF8E$ | MODULE_CONSTANTS literal 'Hand Weapon'; 5311 |
| &HCF9E | MBF single | N_CF9E! | 5331; 5336; 534D; 53A4 |
| &HCFA2 | MBF single | N_CFA2! | 5380; 5388; 53B9 |
| &HCFA6 | string descriptor | S_CFA6$ | MODULE_CONSTANTS literal 'A'; 539B |
| &HCFAC | string descriptor | S_CFAC$ | MODULE_CONSTANTS literal ' R'; 53B3 |
| &HCFB2 | string descriptor | S_CFB2$ | MODULE_CONSTANTS literal '*'; 53F2 |
| &HCFB8 | string descriptor | S_CFB8$ | MODULE_CONSTANTS literal 'Standard Time Delay:'; 544F |
| &HCFD0 | string descriptor | S_CFD0$ | MODULE_CONSTANTS literal 'Current Delay Factor'; 546C |
| &HCFE8 | string descriptor | S_CFE8$ | MODULE_CONSTANTS literal 'New Delay Factor (1-9999):'; 5489 |
| &HD006 | MBF single | N_D006! | 550B; 7AF0; 7C17; A454 |
| &HD006 | MBF single constant | N_D006! | MODULE_CONSTANTS = 0 |
| &HD00A | string descriptor | S_D00A$ | MODULE_CONSTANTS literal ' will rest.'; 563A |
| &HD01A | MBF single | N_D01A! | 5690; 56CE; 5E47; 75AE; 7624 … |
| &HD01E | string descriptor | S_D01E$ | MODULE_CONSTANTS literal 'Groups In Range: '; 5761 |
| &HD034 | string descriptor | S_D034$ | MODULE_CONSTANTS literal '   ['; 5723 |
| &HD03C | string descriptor | S_D03C$ | MODULE_CONSTANTS literal ']'; 5749 |
| &HD042 | MBF single | N_D042! | 576D; 5878; 5907 |
| &HD046 | MBF single | N_D046! | 5779; 5805; 58C3; 59CE; 59DD … |
| &HD04A | MBF single | N_D04A! | 577F; 594C; 5A6E; 5BA8; 5BB0 … |
| &HD04E | MBF single | N_D04E! | 5788; 58CC; 58D8 |
| &HD052 | MBF single | N_D052! | 576D; 5773; 5779; 577F |
| &HD052 | MBF single constant | N_D052! | MODULE_CONSTANTS = 0 |
| &HD056 | MBF single | N_D056! | 580B; 5D3A |
| &HD05A | MBF single | N_D05A! | 585C |
| &HD05A | MBF single constant | N_D05A! | MODULE_CONSTANTS = 97 |
| &HD05E | string descriptor | S_D05E$ | MODULE_CONSTANTS literal 'None'; 591F |
| &HD066 | MBF single | N_D066! | 5958; 598A; 59BC; 5B66; 6321 … |
| &HD066 | MBF single constant | N_D066! | MODULE_CONSTANTS = 38 |
| &HD06A | MBF single | N_D06A! | 59D7; 5A33; 5A60 |
| &HD06E | MBF single | N_D06E! | 59F3; 5A58 |
| &HD072 | MBF single | N_D072! | 5A16; 5A4A; 5A50; 5A58; 78C3 … |
| &HD076 | MBF single | N_D076! | 5A41; 5D45 |
| &HD07A | string descriptor | S_D07A$ | MODULE_CONSTANTS literal 'Command: '; 5DB9 |
| &HD088 | string descriptor | S_D088$ | MODULE_CONSTANTS literal ' at '; 5E2C |
| &HD090 | string descriptor | S_D090$ | MODULE_CONSTANTS literal ' on '; 5E3B |
| &HD098 | string descriptor | S_D098$ | MODULE_CONSTANTS literal 'group '; 5E7C |
| &HD0A2 | string descriptor | S_D0A2$ | MODULE_CONSTANTS literal 'ENTER to accept   A-D  1-5 to retarget'; 5EE6 |
| &HD0CC | string descriptor | S_D0CC$ | MODULE_CONSTANTS literal 'W-ait F-Attack R-apid L-oad M-Aim E-sp'; 5EFE |
| &HD0F6 | MBF single | N_D0F6! | 5F0A |
| &HD0F6 | MBF single constant | N_D0F6! | MODULE_CONSTANTS = -15 |
| &HD0FA | MBF single | N_D0FA! | 5F91; 5FDB; 600F; 604D |
| &HD0FE | string descriptor | S_D0FE$ | MODULE_CONSTANTS literal 'M-indshock  H-ealing  P-sychic Scream '; 60A4 |
| &HD128 | MBF single | N_D128! | 6264; 626D; 62B8 |
| &HD12C | MBF single | N_D12C! | 6469; 6DCC; 70E6 |
| &HD130 | MBF single | N_D130! | 6486; 7744 |
| &HD134 | MBF single | N_D134! | 648E; 6B35 |
| &HD138 | MBF single | N_D138! | 64B9; 6AE6; 778D |
| &HD138 | MBF single constant | N_D138! | MODULE_CONSTANTS = 35 |
| &HD13C | MBF single | N_D13C! | 64BF; 6AF4; 779B |
| &HD13C | MBF single constant | N_D13C! | MODULE_CONSTANTS = 105 |
| &HD140 | MBF single | N_D140! | 64DD; 6567 |
| &HD144 | MBF single | N_D144! | 6503; 654E |
| &HD148 | MBF single | N_D148! | 6526; 6546; 654E |
| &HD14C | MBF single | N_D14C! | 657B; 70AB; 70B7 |
| &HD150 | MBF single | N_D150! | 6590; 6601; 70AB; 70B1; 70CF … |
| &HD154 | string descriptor | S_D154$ | MODULE_CONSTANTS literal ' Reloads'; 684D |
| &HD160 | MBF single | N_D160! | 6887; 68A6; 6A82 |
| &HD164 | MBF single | N_D164! | 6875 |
| &HD164 | MBF single constant | N_D164! | MODULE_CONSTANTS = 46 |
| &HD168 | MBF single | N_D168! | 68BA; 6924; 692D; 6941; 6986 |
| &HD16C | MBF single | N_D16C! | 68BA |
| &HD16C | MBF single constant | N_D16C! | MODULE_CONSTANTS = 28 |
| &HD170 | MBF single | N_D170! | 6A8E; 6AEC; 6B2D; 6B49; 6B5F … |
| &HD174 | string descriptor | S_D174$ | MODULE_CONSTANTS literal ' swings'; 6BA3 |
| &HD180 | string descriptor | S_D180$ | MODULE_CONSTANTS literal ' uses'; 6BD6 |
| &HD18A | string descriptor | S_D18A$ | MODULE_CONSTANTS literal ' fires'; 6BE5 |
| &HD194 | MBF single | N_D194! | 6C4D; 6C52; 6C6F |
| &HD198 | string descriptor | S_D198$ | MODULE_CONSTANTS literal 'fist'; 6C60 |
| &HD1A0 | MBF single | N_D1A0! | 6C86; 6DBD; 6E0F; 6E21 |
| &HD1A4 | MBF single | N_D1A4! | 6C92 |
| &HD1A8 | MBF single | N_D1A8! | 6C98; 6E83; 6EA9; 6EE8; 8438 |
| &HD1AC | MBF single | N_D1AC! | 6CA4; 6E38; 83E5; 9D50; 9EF1 |
| &HD1B0 | MBF single | N_D1B0! | 6CC1; 6D25; 6D5E |
| &HD1B4 | MBF single | N_D1B4! | 6CCA; 6D0F |
| &HD1B8 | MBF single | N_D1B8! | 6D15; 6DEF |
| &HD1BC | MBF single | N_D1BC! | 6DAA; 6DB2; 77FF; 7894; 8036 … |
| &HD1C0 | MBF single | N_D1C0! | 6DE1; 6DE7; 6DEF |
| &HD1C4 | string descriptor | S_D1C4$ | MODULE_CONSTANTS literal 'making'; 6E09 |
| &HD1CE | string descriptor | S_D1CE$ | MODULE_CONSTANTS literal 'hit(s)'; 6E15 |
| &HD1D8 | string descriptor | S_D1D8$ | MODULE_CONSTANTS literal 'points of damage.'; 6E51 |
| &HD1EE | string descriptor | S_D1EE$ | MODULE_CONSTANTS literal 'for'; 6E46 |
| &HD1F6 | string descriptor | S_D1F6$ | MODULE_CONSTANTS literal 'Armor absorbs damage.'; 6E6B |
| &HD210 | string descriptor | S_D210$ | MODULE_CONSTANTS literal ' killed!'; 6EF6 |
| &HD21C | string descriptor | S_D21C$ | MODULE_CONSTANTS literal 'Equipment destroyed.'; 6F10 |
| &HD234 | MBF single | N_D234! | 6F1C; 6F3F |
| &HD238 | MBF single | N_D238! | 6F8A; 7FFD; 81B0; 81F1 |
| &HD23C | MBF single | N_D23C! | 6F99; 709D |
| &HD240 | MBF single | N_D240! | 6FA9; 6FC4; 6FE9; 7041; 708F … |
| &HD244 | MBF single | N_D244! | 6FDA; 7081 |
| &HD248 | MBF single | N_D248! | 7111 |
| &HD248 | MBF single constant | N_D248! | MODULE_CONSTANTS = -35 |
| &HD24C | MBF single | N_D24C! | 71B6; 7289; 72CA; 7328; 7356 … |
| &HD250 | MBF single | N_D250! | 721F; 72ED; 7392 |
| &HD254 | MBF single | N_D254! | 7238; 7292; 72DF; 7364 |
| &HD258 | MBF single | N_D258! | 724C; 72D3; 7336; 73BD |
| &HD25C | MBF single | N_D25C! | 72B2; 7F30; 8B28 |
| &HD25C | MBF single constant | N_D25C! | MODULE_CONSTANTS = 0.8 |
| &HD260 | string descriptor | S_D260$ | MODULE_CONSTANTS literal ') switches weapons'; 7453 |
| &HD276 | string descriptor | S_D276$ | MODULE_CONSTANTS literal ' ('; 7429; 74D3 |
| &HD27C | string descriptor | S_D27C$ | MODULE_CONSTANTS literal ')'; 74FC |
| &HD282 | MBF single | N_D282! | 75B9; 7634; 76A1; 799A; 79C5 … |
| &HD286 | string descriptor | S_D286$ | MODULE_CONSTANTS literal 'shoots rocket launcher'; 75D3 |
| &HD2A0 | MBF single | N_D2A0! | 760F |
| &HD2A0 | MBF single constant | N_D2A0! | MODULE_CONSTANTS = 6.7 |
| &HD2A4 | string descriptor | S_D2A4$ | MODULE_CONSTANTS literal 'fires flame thrower'; 7640 |
| &HD2BC | MBF single | N_D2BC! | 767C |
| &HD2BC | MBF single constant | N_D2BC! | MODULE_CONSTANTS = 3.7 |
| &HD2C0 | MBF single | N_D2C0! | 76ED; 76F6; 76FC; 7704; 780A |
| &HD2C4 | MBF single | N_D2C4! | 774A |
| &HD2C8 | string descriptor | S_D2C8$ | MODULE_CONSTANTS literal 'and misses.'; 78A2 |
| &HD2D8 | string descriptor | S_D2D8$ | MODULE_CONSTANTS literal 'and hits.'; 78B1 |
| &HD2E6 | MBF single | N_D2E6! | 78FF; 8234; 82B8; 82ED; A163 … |
| &HD2EA | MBF single | N_D2EA! | 7941; 7967; 8253; 8307; A163 … |
| &HD2EE | MBF single constant | N_D2EE! | MODULE_CONSTANTS = 0.3333 |
| &HD2F2 | MBF single | N_D2F2! | 7961; 7F83 |
| &HD2F6 | MBF single | N_D2F6! | 7961; 7F64; 8301; A171; A315 |
| &HD2FA | string descriptor | S_D2FA$ | MODULE_CONSTANTS literal "'s armor absorbs the damage."; 79F9 |
| &HD31A | string descriptor | S_D31A$ | MODULE_CONSTANTS literal ' takes'; 7A1F |
| &HD324 | string descriptor | S_D324$ | MODULE_CONSTANTS literal 'points of damage.'; 7A33 |
| &HD33A | string descriptor | S_D33A$ | MODULE_CONSTANTS literal ' dies!'; 7AFF |
| &HD344 | MBF single | N_D344! | 7A65; 7A6D; 7B83 |
| &HD348 | MBF single | N_D348! | 7A9E |
| &HD348 | MBF single constant | N_D348! | MODULE_CONSTANTS = 0 |
| &HD34C | MBF single | N_D34C! | 7AC8 |
| &HD34C | MBF single constant | N_D34C! | MODULE_CONSTANTS = 0 |
| &HD350 | MBF single | N_D350! | 7B2E; 7E31; 8A2A; 90C6; 921F |
| &HD350 | MBF single constant | N_D350! | MODULE_CONSTANTS = 0.3 |
| &HD354 | string descriptor | S_D354$ | MODULE_CONSTANTS literal 'Sighting hardware destroyed.'; 7C44 |
| &HD374 | MBF single | N_D374! | 7C72; 7CAB |
| &HD378 | MBF single | N_D378! | 7C50; 9306 |
| &HD378 | MBF single constant | N_D378! | MODULE_CONSTANTS = 41 |
| &HD37C | MBF single | N_D37C! | 7CB7; 834B |
| &HD37C | MBF single constant | N_D37C! | MODULE_CONSTANTS = 45 |
| &HD380 | string descriptor | S_D380$ | MODULE_CONSTANTS literal 'Hand weapon destroyed.'; 7CD8 |
| &HD39A | MBF single | N_D39A! | 7D06; 7D3F |
| &HD39E | MBF single | N_D39E! | 7CE4 |
| &HD39E | MBF single constant | N_D39E! | MODULE_CONSTANTS = 44 |
| &HD3A2 | MBF single | N_D3A2! | 7D69 |
| &HD3A2 | MBF single constant | N_D3A2! | MODULE_CONSTANTS = 0 |
| &HD3A6 | string descriptor | S_D3A6$ | MODULE_CONSTANTS literal 'Armor is damaged.'; 7D94 |
| &HD3BC | MBF single | N_D3BC! | 7DE1; 7F91; 8500; 8B0E; 90C0 |
| &HD3BC | MBF single constant | N_D3BC! | MODULE_CONSTANTS = 0.4 |
| &HD3C0 | string descriptor | S_D3C0$ | MODULE_CONSTANTS literal 'Weapon is destroyed.'; 7E3F |
| &HD3D8 | string descriptor | S_D3D8$ | MODULE_CONSTANTS literal 'Ammo is destroyed.'; 7E90 |
| &HD3EE | MBF single | N_D3EE! | 7F36; 7F59 |
| &HD3F2 | MBF single | N_D3F2! | 7F97; 7FBB |
| &HD3F6 | MBF single | N_D3F6! | 7FE2; 8058; 80F2; 8159; 8173 … |
| &HD3FA | MBF single | N_D3FA! | 7FF7; 8080; 8109; 8135; 817E … |
| &HD3FE | MBF single | N_D3FE! | 8018; 8052; 816A; 8188; 8C44 … |
| &HD402 | MBF single | N_D402! | 802D; 807A; 814B; 8196; 8C2C … |
| &HD406 | MBF single | N_D406! | 7FDA |
| &HD406 | MBF single constant | N_D406! | MODULE_CONSTANTS = -5 |
| &HD40A | MBF single | N_D40A! | 8044; 9101 |
| &HD40A | MBF single constant | N_D40A! | MODULE_CONSTANTS = 17 |
| &HD40E | MBF single | N_D40E! | 80BD; 80C9; 80F2 |
| &HD412 | MBF single | N_D412! | 80BD |
| &HD412 | MBF single constant | N_D412! | MODULE_CONSTANTS = 311 |
| &HD416 | MBF single | N_D416! | 80C9; 8B9C |
| &HD416 | MBF single constant | N_D416! | MODULE_CONSTANTS = 200 |
| &HD41A | MBF single | N_D41A! | 80DD; 80E9; 8109 |
| &HD41E | MBF single | N_D41E! | 80DD |
| &HD41E | MBF single constant | N_D41E! | MODULE_CONSTANTS = 143 |
| &HD422 | MBF single | N_D422! | 80FE; 812D |
| &HD426 | MBF single | N_D426! | 8115; 811C |
| &HD42A | MBF single | N_D42A! | 8173; 8A0A; 8E6A; 996E; 9FE1 |
| &HD42E | MBF single | N_D42E! | 817E; 8A1E; 8E90; 9950; 9FF3 |
| &HD432 | MBF single | N_D432! | 81CB; 81D1; 86E8; 883B; 89EA … |
| &HD436 | MBF single | N_D436! | 81BF |
| &HD436 | MBF single constant | N_D436! | MODULE_CONSTANTS = 1e-06 |
| &HD43A | MBF single | N_D43A! | 81C5 |
| &HD43A | MBF single constant | N_D43A! | MODULE_CONSTANTS = 0.2 |
| &HD43E | MBF single | N_D43E! | 8301; 8647 |
| &HD442 | MBF single | N_D442! | 835D; 837C; 8396 |
| &HD446 | MBF single | N_D446! | 8531; 8557; 857D |
| &HD446 | MBF single constant | N_D446! | MODULE_CONSTANTS = 0 |
| &HD44A | MBF single | N_D44A! | 8668; 868B |
| &HD44E | MBF single | N_D44E! | 86E8; 8749; 8755 |
| &HD452 | MBF single | N_D452! | 8795; 87F7; 8819; 88E9; 8BE6 |
| &HD452 | MBF single constant | N_D452! | MODULE_CONSTANTS = 0.09 |
| &HD456 | MBF single | N_D456! | 87A6; 8808; 882A; 88FA; 8CA3 … |
| &HD456 | MBF single constant | N_D456! | MODULE_CONSTANTS = 0.03 |
| &HD45A | MBF single | N_D45A! | 87BE; 87DE |
| &HD45E | MBF single | N_D45E! | 87B8 |
| &HD45E | MBF single constant | N_D45E! | MODULE_CONSTANTS = 0.01 |
| &HD462 | MBF single | N_D462! | 87D0; 87D6; 87DE; 8F68; 8F6E … |
| &HD466 | MBF single | N_D466! | 883B; 889D; 88A9 |
| &HD46A | MBF single | N_D46A! | 898C |
| &HD46A | MBF single constant | N_D46A! | MODULE_CONSTANTS = 1.2 |
| &HD46E | MBF single | N_D46E! | 89D8; 92B4; 92BA |
| &HD46E | MBF single constant | N_D46E! | MODULE_CONSTANTS = 0 |
| &HD472 | MBF single | N_D472! | 89EA; 8A5B; 8A67 |
| &HD476 | MBF single | N_D476! | 8A48 |
| &HD47A | MBF single | N_D47A! | 8BA2 |
| &HD47A | MBF single constant | N_D47A! | MODULE_CONSTANTS = 0.0275 |
| &HD47E | MBF single | N_D47E! | 8BCD; 8BD3; 8BDB |
| &HD482 | MBF single | N_D482! | 8C04; 8C5F |
| &HD486 | MBF single | N_D486! | 8BFE; 910D; 981F |
| &HD486 | MBF single constant | N_D486! | MODULE_CONSTANTS = 1.5 |
| &HD48A | MBF single | N_D48A! | 8C32 |
| &HD48A | MBF single constant | N_D48A! | MODULE_CONSTANTS = -4 |
| &HD48E | MBF single | N_D48E! | 8CE7; 8F8E |
| &HD48E | MBF single constant | N_D48E! | MODULE_CONSTANTS = -11 |
| &HD492 | MBF single | N_D492! | 8DA7; 8DC9 |
| &HD492 | MBF single constant | N_D492! | MODULE_CONSTANTS = 0.04 |
| &HD496 | MBF single | N_D496! | 8E03 |
| &HD49A | MBF single | N_D49A! | 8E24; 8F05; 8F11 |
| &HD49E | MBF single | N_D49E! | 8E44 |
| &HD4A2 | MBF single | N_D4A2! | A206; A2C8 |
| &HD4A2 | MBF single constant | N_D4A2! | MODULE_CONSTANTS = 3000 |
| &HD4A6 | MBF single | N_D4A6! | 8ED1 |
| &HD4A6 | MBF single constant | N_D4A6! | MODULE_CONSTANTS = 11000 |
| &HD4AA | MBF single | N_D4AA! | 8F3D |
| &HD4AA | MBF single constant | N_D4AA! | MODULE_CONSTANTS = 0 |
| &HD4AE | MBF single | N_D4AE! | 8F55; 8F76 |
| &HD4B2 | MBF single | N_D4B2! | 90D3 |
| &HD4B2 | MBF single constant | N_D4B2! | MODULE_CONSTANTS = 26000 |
| &HD4B6 | MBF single | N_D4B6! | 90D9 |
| &HD4B6 | MBF single constant | N_D4B6! | MODULE_CONSTANTS = 6000 |
| &HD4BA | MBF single | N_D4BA! | 91F6; 926D; 9279 |
| &HD4BE | MBF single | N_D4BE! | 92B4; 941B; 94AD; 953F; 9598 |
| &HD4C2 | MBF single | N_D4C2! | 92CC; 92D4; 9568; 95B2; 9638 … |
| &HD4C6 | MBF single | N_D4C6! | 92EF |
| &HD4C6 | MBF single constant | N_D4C6! | MODULE_CONSTANTS = 42 |
| &HD4CA | MBF single constant | N_D4CA! | MODULE_CONSTANTS = 91 |
| &HD4CE | MBF single | N_D4CE! | 937D |
| &HD4CE | MBF single constant | N_D4CE! | MODULE_CONSTANTS = 47 |
| &HD4D2 | MBF single | N_D4D2! | 968B; 96CF; 96DB |
| &HD4D6 | MBF single | N_D4D6! | 97E7; 98AA; 98B6 |
| &HD4DA | MBF single | N_D4DA! | 9806; 9833 |
| &HD4DE | MBF single | N_D4DE! | 9833; 989F |
| &HD4E2 | MBF single | N_D4E2! | 9843; 98AA; 98B0; 98D4 |
| &HD4E6 | MBF single | N_D4E6! | 9933; 9A4C; 9A58 |
| &HD4EA | MBF single | N_D4EA! | 9968 |
| &HD4EA | MBF single constant | N_D4EA! | MODULE_CONSTANTS = 184 |
| &HD4EE | MBF single | N_D4EE! | 99DA |
| &HD4EE | MBF single constant | N_D4EE! | MODULE_CONSTANTS = 24.5 |
| &HD4F2 | MBF single | N_D4F2! | 99ED |
| &HD4F2 | MBF single constant | N_D4F2! | MODULE_CONSTANTS = 3.5 |
| &HD4F6 | MBF single | N_D4F6! | 9A84; 9A97 |
| &HD4F6 | MBF single constant | N_D4F6! | MODULE_CONSTANTS = 32.5 |
| &HD4FA | MBF single | N_D4FA! | 9AA0 |
| &HD4FA | MBF single constant | N_D4FA! | MODULE_CONSTANTS = 11.5 |
| &HD4FE | MBF single | N_D4FE! | 9B1A; 9B32; 9D47; 9D5F |
| &HD502 | MBF single | N_D502! | 9B23 |
| &HD502 | MBF single constant | N_D502! | MODULE_CONSTANTS = 0.123 |
| &HD506 | MBF single | N_D506! | 9B38; 9C9F; 9D38; 9D65; 9EB6 … |
| &HD50A | MBF single | N_D50A! | 9B65 |
| &HD50A | MBF single constant | N_D50A! | MODULE_CONSTANTS = 618 |
| &HD50E | MBF single | N_D50E! | 9B6B; 9C5F; 9C99 |
| &HD512 | MBF single | N_D512! | 9C15; 9E58 |
| &HD512 | MBF single constant | N_D512! | MODULE_CONSTANTS = 7.5 |
| &HD516 | MBF single | N_D516! | 9D92 |
| &HD516 | MBF single constant | N_D516! | MODULE_CONSTANTS = 1240 |
| &HD51A | MBF single | N_D51A! | 9D9B; 9EB0 |
| &HD51E | MBF single | N_D51E! | 9FDB; A17F |
| &HD51E | MBF single constant | N_D51E! | MODULE_CONSTANTS = 112 |
| &HD522 | MBF single | N_D522! | A185; A320 |
| &HD526 | MBF single | N_D526! | A197; A329 |
| &HD52A | MBF single | N_D52A! | A1AE; A33B |
| &HD52E | MBF single | N_D52E! | A1BD; A34D |
| &HD532 | MBF single | N_D532! | A191 |
| &HD532 | MBF single constant | N_D532! | MODULE_CONSTANTS = 127 |
| &HD536 | MBF single | N_D536! | A200; A240; A24C |
| &HD53A | MBF single | N_D53A! | A200 |
| &HD53A | MBF single constant | N_D53A! | MODULE_CONSTANTS = -1000 |
| &HD53E | MBF single | N_D53E! | A21A; A29A |
| &HD53E | MBF single constant | N_D53E! | MODULE_CONSTANTS = 12000 |
| &HD542 | MBF single constant | N_D542! | MODULE_CONSTANTS = 3300 |
| &HD546 | MBF single | N_D546! | A259; A267; A286; A2BA; A57E |
| &HD546 | MBF single constant | N_D546! | MODULE_CONSTANTS = 1000 |
| &HD54A | MBF single | N_D54A! | A329 |
| &HD54A | MBF single constant | N_D54A! | MODULE_CONSTANTS = 191 |
| &HD54E | MBF single | N_D54E! | A335 |
| &HD54E | MBF single constant | N_D54E! | MODULE_CONSTANTS = 88 |
| &HD552 | string descriptor | S_D552$ | MODULE_CONSTANTS literal ' uses '; A481 |
| &HD55C | string descriptor | S_D55C$ | MODULE_CONSTANTS literal 'It fails.'; A532 |
| &HD56A | string descriptor | S_D56A$ | MODULE_CONSTANTS literal '.'; A49C; A6D6 |
| &HD570 | MBF single | N_D570! | A547; A5E7 |
| &HD574 | MBF single | N_D574! | A541 |
| &HD574 | MBF single constant | N_D574! | MODULE_CONSTANTS = -7 |
| &HD578 | string descriptor | S_D578$ | MODULE_CONSTANTS literal ' dies.'; A62D |
| &HD582 | string descriptor | S_D582$ | MODULE_CONSTANTS literal ' takes'; A659 |
| &HD58C | string descriptor | S_D58C$ | MODULE_CONSTANTS literal 'damage'; A66D |
| &HD596 | string descriptor | S_D596$ | MODULE_CONSTANTS literal 'and dies.'; A6C7 |
| &HD5A4 | MBF single | N_D5A4! | A728; A74B |
| &HD5A8 | MBF single | N_D5A8! | A7FA; A802; A812; A887 |
| &HD5AC | string descriptor | S_D5AC$ | MODULE_CONSTANTS literal ' is healed.         '; A843 |
| &HD5C4 | MBF single | N_D5C4! | A8D2 |
| &HD5C4 | MBF single constant | N_D5C4! | MODULE_CONSTANTS = 110 |
| &HD5C8 | MBF single | N_D5C8! | A904 |
| &HD5C8 | MBF single constant | N_D5C8! | MODULE_CONSTANTS = 222 |
| &HD5CC | MBF single | N_D5CC! | A91B |
| &HD5CC | MBF single constant | N_D5CC! | MODULE_CONSTANTS = 159 |

T_nn! temporary slots are addressed through the runtime base and the inline selector; they have no fixed game-variable DS address. InputFile%, InputTypes, BUFFER and INPUT_NEXT are explanatory representations of the runtime's input state. ARGS(), COORD(), ACTION(), BOXMODE(), CAPACITY(), TEMP_DESC(), OPENMODE() and BASIC_BOOL() are semantic helpers defined above; BASIC_BOOL returns -1 or 0. SoundFreq%/SoundDuration!, Line1/2X!/Y!, Get1/2X!/Y! and CircleStart!/End!/Aspect! hold the pending statement arguments, with omissions/defaults governed by the original runtime flags.

FAC! is DS:001A (H ledger). AX/BX/CX/DX/SI/DI and BP are compiler/runtime registers; DX:AX is the IMUL product pair. CompareLeft!/Right!, CompareLeft$/Right$, CompareLeft%/Right%, LocateRow%, PutX%/PutY%/PutXFlag%/PutYFlag% are explanatory temporaries, not original game variables. BYTE/WORD preserve memory width and the original BP-relative workspace.

The first three dynamic-array descriptors are DS:8030/803A/8044 (H identity at 0044/004F/005A). DIM consumes stack values 0C42h/1002h/08A2h at 0040..005D; SIZES_FROM_STACK preserves runtime dimension/count interpretation instead of assuming a source-level upper bound. ARRAY_OFFSET(BX,DX) is the M-confidence VARPTR-array routine from the ledger and returns a DS-relative single offset for BLOAD.

Literal resource names include LOGO.EGA, TR, .EGA/.BAS, BIGSH, PLBTSH.EGA and plbtsh.bas (H literal identities). Their dynamic concatenations and array destinations are retained in code. Shared DS:19B4 controls the observed SCREEN 7 branch (H branch evidence); its complete cross-module meaning remains address-named. The prefix candidate at DS:9404 is M from empty/A:/B: assignments at entry; it is not renamed to imply unsupported wider semantics. Numeric stat arrays and string descriptor arrays remain N(expr)/S(expr) with explicit address arithmetic and unknown field names.

