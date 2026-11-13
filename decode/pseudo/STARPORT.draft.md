# STARPORT — first-draft BASIC-style pseudocode

Evidence: `decode/listings/STARPORT.lst` (including its recorded bytes), `decode/data/MODULE_CONSTANTS.md` / STARPORT.EXE, `decode/brun30/RT_LEDGER.md`, and the `decode/brun30/rt_asm.txt` bodies cited below, read 2026-10-15. Unresolved operations remain explicit; this is a draft for the module-verification lane.

Only this file is the lane output. The assignment's STATUS.md append is omitted to honor the one-file scope.

## Conventions and evidence

- Labels are listing/load-module offsets, not source BASIC line numbers. CALL/RET become GOSUB/RETURN and jumps become GOTO. The collapsed display view gives BASIC statements; the complete transcription retains register calculations around those statements.
- `N_AAAA!` is a four-byte MBF single at DS:AAAA; `S_AAAA$` is a string descriptor there. N(expr), S(expr), BYTE(expr), WORD(expr), MEMORY(expr) retain computed addresses. FAC! aliases DS:001A; DAC# is the double accumulator at DS:0016..001D. AX/BX/CX/DX/SI/DI/BP are compiler/runtime registers, not inferred game variables.
- The expanded RT_LEDGER read during this assignment supplies H meanings for the rendered routines unless marked M at a call. The runtime tag preserves the source identity; the BASIC expression denotes its main operation while original ABI side effects/flags still apply. This is semantic pseudocode, not executable BASIC.
- Numeric register constants are substituted only from local setups; propagation stops at branch targets and nontrivial calls. Integer calculations wrap to 16 bits. IMUL yields the signed product in DX:AX. CompareLeft/Right are snapshots; ZF/CF/SF/OF retain CPU semantics. DEC/INC preserve CF; NOT preserves all flags.
- RT3F_61 assigns S(DX)=S(BX), H expanded-ledger correction, consistent with 9DC4..9DD0. RT3F_62 compares strings in AX/BX (H). 3F_6E prints a string plus newline, 3F_6A prints a string with semicolon, 3F_6B prints a single plus newline, and 3F_67 prints a single with semicolon (H). 3E_79 flushes without inserting CR/LF. Earlier disputed labels have been superseded by the new ledger.
- ARGPUSH/ARGS() represent the BASIC statement argument buffer: 3E_42/33 push a supplied argument, 43 pushes an omission, and LOCATE/COLOR/SCREEN consume the arguments plus the final BX. No phantom row is introduced for LOCATE with omitted arguments.
- COORD(value,flag) means N(value) when flag=-1, or the integer value when flag=0 (H ledger 0DC92). PUT action DL is preserved with DH selecting the far-array form; the PSET=0/PRESET=1/AND=2/OR=3/XOR=4 mapping remains M. LINE BOXMODE(DX) means -1 plain, 0 B, 1 BF; CX is style (-1 omitted). GET CAPACITY(DX) is a word capacity, zero meaning descriptor-derived.
- INPUT parsing and destination stores are split by the compiler. INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes) and INPUT_NEXT MEMORY(BX) denote the parsed typed buffer then its next destination store (H ledger B6/B7/B8). CURRENT_SOURCE preserves keyboard/file selection; FILE(BX) comes from 3F_B6 and KEYBOARD plus prompt/flags from 3F_B5. InputFlags bit 1 suppresses the runtime question-mark prompt. OPENMODE converts 0 INPUT,1 OUTPUT,2 RANDOM,3 APPEND; zero record length is the runtime default.
- TEMP_DESC(string expression) allocates/returns a temporary string descriptor address in BX. T_nn! denotes the runtime temporary slot selected by inline byte b: nn=b AND 7Fh, slot address base+(nn*8), base from runtime DS:0010/0012. The numbered slots are H ledger identities, not game variable names.
- PRINT #PrintDestination denotes the destination captured by the preceding PRINT-file begin; screen PRINT begin resets it. BSAVE retains OFFSET_ARG(DX) and LENGTH_ARG(CX) to preserve the raw ABI while its conversion details await final verification. KEY uses 0 OFF,1 ON,2 LIST. ERROR_ACTIVE is the runtime error-handler state; END via 3E_02 raises error 19 if that state is active (H ledger).
- FSTORE makes SI=001A (1E2D..1E38); FLOAD leaves DI=001E after two MOVSWs (1E47..1E4F). These effects are explicit. Other runtime side effects remain implicit in the routine tags.

## Instruction boundaries and inline data

The corrected listing consumes inline payloads but abbreviates long byte columns with '..'. Each visible byte is checked against the original, read-only STARPORT.EXE load module; omitted payload bytes come from that same original. Original files are never changed.

The following payload lengths follow inline_args.json and RT_LEDGER:

| Family | Payload | Evidence / confidence |
|---|---|---|
| 3F_71/85/95/9D/8D/A5 | one temporary-selector byte | H ledger and helper 1EC3 |
| 3F_AB/AD | one signed exponent-scaling byte | H AC66..AC8A |
| 3F_45 | one dimension-count byte; sizes supplied on the stack | H C22D..C267 |
| 3F_B7 | count followed by count type bytes | H C529..C557; 04 single,03 string,02 integer,08 double |
| 3F_5D/5E | count followed by count little-endian target words | H shared body 9504..953E, ON GOSUB / ON GOTO |

CS-offset table words map to listing offsets by adding 0010h (H ledger). ON BX GOSUB pushes the post-table return address; ON BX GOTO does not. Raw tables are preserved after the transcription.

Near relative branch/call destinations are reduced modulo 65536 for 16-bit code; stored CS-offset table entries still receive the separate 0010h listing bias.

The inferred logical code end is ACC5h (M interpretation): header word2 ACB5h plus bias 0010h agrees with END at ACC2..ACC4. Metadata block 16 begins at ACD0h (MODULE_CONSTANTS). The eleven bytes ACC5..ACCF are preserved once as unclassified raw data and excluded from runtime-call counts. No explicit incoming code/table edge reaches that tail. Source BASIC line numbers are unavailable in MODULE_CONSTANTS, so labels use only the evidenced code offsets.

## Flows and screens

These are content groups rather than an assertion that every group uses a separate graphics mode. Exact coordinates, loops, branches, arithmetic and address expressions are in the full transcription.

| Evidence offsets | Flow / displayed content | Confidence |
|---|---|---|
| 0040..00FF | Music/resource setup; shared graphics-option test and SCREEN 1 path; filename-prefix construction | H runtime/literal evidence |
| 0797, 07C9, 07E8 | Frequently called numeric/data helpers; address names retained | H destinations, record-field meanings unknown |
| 088A | “Change things?” | H literal |
| 1221..137A | Character aging and death | H strings |
| 145C..1985 | Mission performance, special bonuses, valuable item analysis, salvage/reward and mission completion payments | H strings; record/stat roles only where supported |
| 1A45..1B05 | Pay and promotion | H strings |
| 1C66..20E3 | Starport banner, option/member selection, no-members message, ENTER prompt | H strings |
| 2122..2254 | Main menu: Personnel, Buy, Sell, Dry Dock, Training, Fuel, Save, Headquarters, Inspect, Christen, Leave, Medical, Delay | H literal choices |
| 23D2 | Refueling | H literal |
| 265E..269C | Onboard limits, carrying limits and affordability | H strings |
| 2BC8..2C4A | Returns Department: personal equipment, ship equipment, cargo, ship sale, bankruptcy | H strings |
| 2EB7..341B | Sell lists, owners, credit values and paging/selection | H strings |
| 3546..37A6 | Ship-sale confirmation and reinstallation fees; total received | H strings; displayed 15% is literal evidence, not an independently checked formula |
| 37E5..3BA3 | Arsenal, personal gear categories, weapon classes | H exact strings, including original spelling |
| 3FD0..4189 | Ammo selection and buying with credits | H strings |
| 4794..5100 | Ship guns/ammo/shields/defense/missile killers/armor and installation positions; armor purchase limits | H strings |
| 51E6..5408 | Ship class, price, browsing, buy/exit and christening notice | H strings |
| 5454..6249 | Recruitment, dismissal, positions; basic training, assignment, levels/promotions and name entry | H strings |
| 6481..6620 | Rank/name/class and squad selection display | H strings |
| 6795..6E05 | Dry dock repairs, personal repairs, armor removal, repair success/failure/cost | H strings |
| 6E5B..7509 | Sickbay health/rest/cloning/replacement and cost | H strings |
| 752A..78C8 | Headquarters, mission review/new mission, explicit numeric mission INPUT and validation messages | H strings and typed input calls |
| 79A0..79D4 | Bankruptcy confirmation and High Command reaction | H strings |
| 7C62..835B | Post-mission training, sessions due/purchased/used, valid-area and level feedback | H strings |
| 8413..8BC4 | Inspection menu and squad statistics, Esper abilities, inventory/armor/clones | H strings |
| 8D6A..91A1 | Ship status: class, weight, cargo, armor, credits, movement, weapons, shields and hardware | H strings |
| 91C2..99A7 | Cargo, espionage and miscellaneous lists | H strings |
| 9AD8..9CA9 | Saving game and rule-book word challenge, wrong-answer feedback | H strings |
| 9CF3; 9D12..9D4F | BSAVE plus file PRINT of character names/comma separators | H routine identities; raw BSAVE argument conversion retained |
| 9D85..9E58 | Quit confirmation, pilot/ship readiness and overloaded checks, departure | H strings |
| 9F80..9FD5 | Ship-name input and fleet welcome | H strings |
| A002..A894 | Gun/shield/weapon selection displays and SPACEBAR prompt | H strings |
| A8BE..A8F8 | Delay-factor settings (1–9999) | H strings |
| A9E9 | Medal-of-honor feedback | H literal |
| ACAD..ACC4 | Final timer wait helper and error-aware END | H runtime identities |

The menu text establishes the service names above. Numeric formulas remain address-based where field identities are unknown; no price, stat, class or mission-column meaning is invented solely from an offset.

## DATA records

Data-lane source records are preserved below. The two sequences of repeated 'a' words are recorded data, not explanatory placeholders introduced by this draft. Their use/field mapping remains unknown until linked to READ operations. Source record numbers are provenance, not invented source-line/code-offset mappings.

| line | text |
|---|---|
| 429 | ` 16,19,23,26,27,31,34,41,47,49,54` |
| 2136 | ` aaaa,aaaaaaa,aa,aaaa,aa,aaaa,aaaaaaa,aaaaa,aa,aaa,aaaaaa,aaa,aaaaa,aaaaaaa,aaa,aa,aa,aaa,aaa,aaaa,aaa,aaaaaaaaa,aaa,aaaaaaaaa,aaaaaa,aaa,aaaaaaa,aaaaaaa,aaa,aaaaaaaa,aaaaaa,aaa,aaaa,aaaa,aa,aaaa,aaa,aaaa,aaaaa,aa,aa,aaaaaaa,aaaaaa,aaaa` |
| 2137 | ` aaaaaaaa,aaaaaaa,aaaaaaaa,aaaa,aaaaaaaa,aa` |
| end (FF FF) | `01` |

## Collapsed BASIC display patterns

Each sequence below is repeated with its compiler operations in the full transcription. Descriptors resolve to literal strings under Variables. PRINT formatting differences remain subject to the routine tags in the full view.

```basic
L_0878: LOCATE 20, 2: PRINT S_A824$  ' bytes 0878..088F; 'Change things? '
L_1E7C: LOCATE 24, 2: PRINT S_ACCE$  ' bytes 1E7C..1E93; 'Select Option'
L_2110: LOCATE 16, 11: PRINT S_AD4A$  ' bytes 2110..2127; 'Main Menu'
L_264C: LOCATE 20, 2: PRINT S_AE72$  ' bytes 264C..2663; 'No More Of That Allowed Onboard'
L_266B: LOCATE 20, 2: PRINT S_AE96$  ' bytes 266B..2682; 'Can Not Carry Anymore Of That'
L_268A: LOCATE 20, 2: PRINT S_AEB8$  ' bytes 268A..26A1; 'Can Not Afford It'
L_2BB6: LOCATE 16, 6: PRINT S_AF3E$  ' bytes 2BB6..2BCD; 'Returns Department'
L_33F2: LOCATE 24, 2: PRINT S_B0BA$  ' bytes 33F2..3409; 'Select item to sell'
L_3511: LOCATE 20, 2: PRINT S_B0EE$  ' bytes 3511..3528; 'You do not have one'
L_37D3: LOCATE 16, 8: PRINT S_B238$  ' bytes 37D3..37EA; 'Arsenal'
L_3A4F: LOCATE 16, 2: PRINT S_B30A$  ' bytes 3A4F..3A66; 'A-ALL WEAPONS'
L_3A7E: LOCATE 17, 22: PRINT S_B32A$  ' bytes 3A7E..3A95; 'HEAVY  H-Flame'
L_3A96: LOCATE 18, 9: PRINT S_B33C$  ' bytes 3A96..3AAD; '-B-Bullet   WEAPONS I-Rocket'
L_3AAE: LOCATE 19, 3: PRINT S_B35C$  ' bytes 3AAE..3AC5; 'LIGHT  C-Needler'
L_3B48: LOCATE 20, 2: PRINT S_B37C$  ' bytes 3B48..3B5F; 'WEAPONS D-Electric'
L_3B7A: LOCATE 22, 9: PRINT S_B3B4$  ' bytes 3B7A..3B91; '-F-Gernade'
L_3FBE: LOCATE 24, 2: PRINT S_B40C$  ' bytes 3FBE..3FD5; 'Ammo for which gun?'
L_4842: LOCATE 24, 2: PRINT S_B52C$  ' bytes 4842..4859; 'Buy weapon for which position? (1-6)'
L_4A86: LOCATE 20, 2: PRINT S_B568$  ' bytes 4A86..4A9D; 'You Already Have One'
L_4AAB: LOCATE 24, 2: PRINT S_B580$  ' bytes 4AAB..4AC2; 'Buy ammo for which gun? (1-6)'
L_4C7F: LOCATE 24, 2: PRINT S_B5AA$  ' bytes 4C7F..4C96; 'Which position? (1-4)'
L_50EE: LOCATE 24, 2: PRINT S_B68C$  ' bytes 50EE..5105; 'Buy how many points? '
L_53F6: LOCATE 20, 2: PRINT S_B70C$  ' bytes 53F6..540D; 'You May Christen Your Ship'
L_5442: LOCATE 16, 6: PRINT S_B72A$  ' bytes 5442..5459; 'Recruitment Office'
L_588C: LOCATE 24, 2: PRINT S_B7F2$  ' bytes 588C..58A3; 'Keep this squad member? (y/n)'
L_59F3: LOCATE 19, 2: PRINT S_B81C$  ' bytes 59F3..5A0A; 'D-Esper'
L_5CCF: LOCATE 17, 2: PRINT S_B850$  ' bytes 5CCF..5CE6; 'You did not make it'
L_6237: LOCATE 20, 2: PRINT S_B8C2$  ' bytes 6237..624E; 'Input Name: '
L_690E: LOCATE 24, 2: PRINT S_B9DE$  ' bytes 690E..6925; 'Repair What?  *-Broken  #-4000 to fix'
L_6A26: LOCATE 24, 10: PRINT S_BA22$  ' bytes 6A26..6A3D; 'Failure'
L_6DF3: LOCATE 20, 2: PRINT S_BAAE$  ' bytes 6DF3..6E0A; 'Remove how many? '
L_6E49: LOCATE 16, 8: PRINT S_BAC4$  ' bytes 6E49..6E60; 'Sickbay'
L_74F7: LOCATE 20, 2: PRINT S_BB9C$  ' bytes 74F7..750E; 'Not possible'
L_7518: LOCATE 16, 14: PRINT S_BBAC$  ' bytes 7518..752F; 'Headquarters'
L_75ED: LOCATE 21, 2: PRINT S_BBDE$  ' bytes 75ED..7604; 'mission? (y/n)'
L_79C2: LOCATE 20, 2: PRINT S_BCE8$  ' bytes 79C2..79D9; 'High Command is very disapointed'
L_7CFF: LOCATE 22, 2: PRINT S_BDA4$  ' bytes 7CFF..7D16; 'D-Use training session'
L_7D60: LOCATE 20, 2: PRINT S_BDC6$  ' bytes 7D60..7D77; 'Are you sure? (Y/N)'
L_81C1: LOCATE 24, 2: PRINT S_BE28$  ' bytes 81C1..81D8; 'Select Valid Training Area'
L_888E: LOCATE 21, 25: PRINT S_BF86$  ' bytes 888E..88A5; 'Communications'
L_88C7: LOCATE 22, 25: PRINT S_BF98$  ' bytes 88C7..88DE; 'Healing'
L_892D: LOCATE 23, 25: PRINT S_BFAE$  ' bytes 892D..8944; 'Psychic Scream'
L_8D58: LOCATE 20, 2: PRINT S_C06E$  ' bytes 8D58..8D6F; 'You do not have one'
L_8E89: LOCATE 22, 2: PRINT S_C0EA$  ' bytes 8E89..8EA0; 'Max. Weight...'
L_8F0A: LOCATE 23, 2: PRINT S_C10E$  ' bytes 8F0A..8F21; 'Credits.......'
L_8F3D: LOCATE 20, 25: PRINT S_C12C$  ' bytes 8F3D..8F54; 'Defense....'
L_8F70: LOCATE 21, 25: PRINT S_C13C$  ' bytes 8F70..8F87; 'Max. Move.....'
L_8F97: LOCATE 22, 25: PRINT S_C152$  ' bytes 8F97..8FAE; 'Cur. Move.....'
L_90A9: LOCATE 23, 2: PRINT S_C164$  ' bytes 90A9..90C0; '(-) okay  (*) broken  (#) 4000 to fix'
L_91B0: LOCATE 16, 15: PRINT S_C1C2$  ' bytes 91B0..91C7; 'Cargo List'
L_98AB: LOCATE 16, 13: PRINT S_C1D8$  ' bytes 98AB..98C2; 'Espionage List'
L_9995: LOCATE 16, 9: PRINT S_C1EA$  ' bytes 9995..99AC; 'Miscellaneous Items'
L_9AC6: LOCATE 17, 14: PRINT S_C20A$  ' bytes 9AC6..9ADD; 'Saving game.'
L_9C97: LOCATE 19, 17: PRINT S_C260$  ' bytes 9C97..9CAE; 'Wrong!'
L_9D73: LOCATE 20, 2: PRINT S_C28C$  ' bytes 9D73..9D8A; 'Quit the game? (Y/N)'
L_9F6E: LOCATE 20, 2: PRINT S_C2FE$  ' bytes 9F6E..9F85; 'Input ship name: ISS '
L_9FF0: LOCATE 16, 2: PRINT S_C356$  ' bytes 9FF0..A007; "#  Ammo    Ship's Guns"
L_A447: LOCATE 16, 2: PRINT S_C3BA$  ' bytes A447..A45E; '#   Shield'
L_A85D: LOCATE 20, 15: PRINT S_C3FC$  ' bytes A85D..A874; 'No Weapons'
L_A882: LOCATE 24, 14: PRINT S_C40A$  ' bytes A882..A899; 'Press SPACEBAR'

```

## Complete offset transcription

### Entry, music and resource loading

```basic
L_0040: BX = &H4896
L_0043: DX = &H491C
L_0046: S_491C$ = S_4896$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0049: BX = &H4920
L_004C: PLAY S_4920$  ' RT3E_51
L_004F: DI = &H4F6C
L_0052: SI = &H19B4
L_0055: CompareLeft! = N_19B4!: CompareRight! = N_4F6C!  ' RT3F_9F
L_0058: IF CompareLeft! = CompareRight! THEN GOTO L_005D  ' flags from L_0055
L_005A: GOTO L_0072
L_005D: BX = 1
L_0060: SCREEN ARGS(), BX  ' RT3E_5B
L_0063: DX = 9
L_0066: PALETTE BX, DX  ' RT3E_4A
L_0069: BX = 2
L_006C: DX = 4
L_006F: PALETTE BX, DX  ' RT3E_4A
L_0072: BX = &H4F7C
L_0075: DX = &H4F70
L_0078: S_4F70$ = S_4F7C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_007B: BX = &H4F82
L_007E: DX = &H4F74
L_0081: S_4F74$ = S_4F82$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0084: BX = &H4F8A
L_0087: DX = &H4F78
L_008A: S_4F78$ = S_4F8A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_008D: DI = &H4F6C
L_0090: SI = &H19A4
L_0093: CompareLeft! = N_19A4!: CompareRight! = N_4F6C!  ' RT3F_9F
L_0096: IF CompareLeft! = CompareRight! THEN GOTO L_009B  ' flags from L_0093
L_0098: GOTO L_00A4
L_009B: BX = &H4F8E
L_009E: S(DX) = S_4F8E$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_00A1: GOTO L_00BB
L_00A4: DI = &H4F94
L_00A7: SI = &H19A4
L_00AA: CompareLeft! = N_19A4!: CompareRight! = N_4F94!  ' RT3F_9F
L_00AD: IF CompareLeft! = CompareRight! THEN GOTO L_00B2  ' flags from L_00AA
L_00AF: GOTO L_00BB
L_00B2: BX = &H4F98
L_00B5: DX = &H4F78
L_00B8: S_4F78$ = S_4F98$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_00BB: SI = &H19B0
L_00BE: CompareLeft! = N_19B0!: CompareRight! = 0  ' RT3F_A7
L_00C1: IF CompareLeft! = CompareRight! THEN GOTO L_00C6  ' flags from L_00BE
L_00C3: GOTO L_00CE
L_00C6: DI = SI
L_00C8: SI = &H19A8
L_00CB: N(DI) = N_19A8!  ' RT3F_7B
L_00CE: BX = &H4F9E
L_00D1: FAC! = CSNG(BX)  ' RT3F_57
L_00D4: BX = &HA4C4
L_00D7: AX = &H4F78
L_00DA: BX = TEMP_DESC(S_4F78$ + S_A4C4$)  ' BX receives a temporary descriptor  ' RT3F_55
L_00DD: DX = &H1A
L_00E0: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_00E3: DI = &H4F6C
L_00E6: SI = &HA4E0
L_00E9: CompareLeft! = N_A4E0!: CompareRight! = N_4F6C!  ' RT3F_9F
L_00EC: IF CompareLeft! = CompareRight! THEN GOTO L_00F1  ' flags from L_00E9
L_00EE: GOTO L_0100
L_00F1: BX = &H1850
L_00F4: FAC! = CSNG(BX)  ' RT3F_57
L_00F7: BX = &HA4D4
L_00FA: DX = &H1A
L_00FD: BLOAD S_A4D4$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_0100: DI = &HA4E4
L_0103: SI = &H3AE8
L_0106: N_A4E4! = N_3AE8!  ' RT3F_7B
L_0109: BX = &HA4F4
L_010C: DX = &HA4E8
L_010F: S_A4E8$ = S_A4F4$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0112: BX = &HA4FC
L_0115: DX = &HA4EC
L_0118: S_A4EC$ = S_A4FC$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_011B: BX = &HA504
L_011E: DX = &HA4F0
L_0121: S_A4F0$ = S_A504$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0124: BX = &HA5B4
L_0127: DX = &HA594
L_012A: S_A594$ = S_A5B4$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_012D: BX = &HA5BA
L_0130: DX = &HA598
L_0133: S_A598$ = S_A5BA$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0136: SI = &HA5C0
L_0139: FAC! = N_A5C0!: DI = &H001E  ' RT3F_6F
L_013C: GOTO L_016F
L_013F: ' Alignment NOP
L_0140: SI = &HA5C4
L_0143: BX = SI
L_0145: DX = BX
L_0147: BX = CINT(N_A5C4!)  ' RT3F_75
L_014A: BX = BX * (2 ^ 1)
L_014C: BX = BX * (2 ^ 1)
L_014E: BX = BX + &HA590
L_0152: SI = DX
L_0154: DI = &HA5C8
L_0157: FAC! = N_A5C4! + N_A5C8!  ' RT3F_7F
L_015A: CX = BX
L_015C: BX = CINT(FAC!)  ' RT3F_77
L_015F: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_0162: SWAP CX, DX
L_0164: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0167: SI = CX
L_0169: DI = &H4F6C
L_016C: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_016F: DI = &HA5C4
L_0172: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0175: SI = DI
L_0177: DI = &HA5CC
L_017A: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_017D: IF CompareLeft! <= CompareRight! THEN GOTO L_0140  ' flags from L_017A
L_017F: BX = &HA5D0
L_0182: DX = &HA590
L_0185: S_A590$ = S_A5D0$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0188: SI = &H4F6C
L_018B: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_018E: GOTO L_01AD
L_0191: ' Alignment NOP
L_0192: SI = &HA5C4
L_0195: BX = SI
L_0197: DX = BX
L_0199: BX = CINT(N_A5C4!)  ' RT3F_75
L_019C: BX = BX * (2 ^ 1)
L_019E: BX = BX + &HA5D6
L_01A2: READ WORD(BX)  ' RT3F_0F
L_01A5: SI = DX
L_01A7: DI = &H4F6C
L_01AA: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_01AD: DI = &HA5C4
L_01B0: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_01B3: SI = DI
L_01B5: DI = &HA5EE
L_01B8: CompareLeft! = N_A5C4!: CompareRight! = N_A5EE!  ' RT3F_9F
L_01BB: IF CompareLeft! <= CompareRight! THEN GOTO L_0192  ' flags from L_01B8
L_01BD: ' Alignment NOP
L_01BE: BX = &HA602
L_01C1: DX = &HA5F2
L_01C4: S_A5F2$ = S_A602$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01C7: BX = &HA60C
L_01CA: DX = &HA5F6
L_01CD: S_A5F6$ = S_A60C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01D0: BX = &HA616
L_01D3: DX = &HA5FA
L_01D6: S_A5FA$ = S_A616$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01D9: BX = &HA622
L_01DC: DX = &HA5FE
L_01DF: S_A5FE$ = S_A622$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01E2: BX = &HA63C
L_01E5: DX = &HA630
L_01E8: S_A630$ = S_A63C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01EB: BX = &HA642
L_01EE: DX = &HA634
L_01F1: S_A634$ = S_A642$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01F4: BX = &HA648
L_01F7: DX = &HA638
L_01FA: S_A638$ = S_A648$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_01FD: BX = &H51F6
L_0200: FAC! = CSNG(BX)  ' RT3F_57
L_0203: BX = &HA64E
L_0206: AX = &H4F78
L_0209: BX = TEMP_DESC(S_4F78$ + S_A64E$)  ' BX receives a temporary descriptor  ' RT3F_55
L_020C: DX = &H1A
L_020F: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_0212: SI = &HA4E0
L_0215: CompareLeft! = N_A4E0!: CompareRight! = 0  ' RT3F_A7
L_0218: IF CompareLeft! <> CompareRight! THEN GOTO L_021D  ' flags from L_0215
L_021A: GOTO L_074E
L_021D: BX = &H40F4
L_0220: FAC! = CSNG(BX)  ' RT3F_57
L_0223: BX = &HA65A
L_0226: DX = &H1A
L_0229: BLOAD S_A65A$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_022C: BX = 0
L_022E: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_0231: CX = BX
L_0233: BX = 1
L_0236: DX = &HA662
L_0239: OPEN S_A662$ FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_023C: SI = &H4F6C
L_023F: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_0242: GOTO L_026E
L_0245: ' Alignment NOP
L_0246: BX = 1
L_0249: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_024C: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0251: SI = &HA5C4
L_0254: BX = SI
L_0256: DX = BX
L_0258: BX = CINT(N_A5C4!)  ' RT3F_75
L_025B: BX = BX * (2 ^ 1)
L_025D: BX = BX * (2 ^ 1)
L_025F: BX = BX + &H42AC
L_0263: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0266: SI = DX
L_0268: DI = &H4F6C
L_026B: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_026E: DI = &HA5C4
L_0271: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0274: SI = DI
L_0276: DI = &HA66A
L_0279: CompareLeft! = N_A5C4!: CompareRight! = N_A66A!  ' RT3F_9F
L_027C: IF CompareLeft! <= CompareRight! THEN GOTO L_0246  ' flags from L_0279
L_027E: SI = &HA66E
L_0281: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0284: GOTO L_02B0
L_0287: ' Alignment NOP
L_0288: BX = 1
L_028B: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_028E: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0293: SI = &HA5C4
L_0296: BX = SI
L_0298: DX = BX
L_029A: BX = CINT(N_A5C4!)  ' RT3F_75
L_029D: BX = BX * (2 ^ 1)
L_029F: BX = BX * (2 ^ 1)
L_02A1: BX = BX + &H42E4
L_02A5: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_02A8: SI = DX
L_02AA: DI = &H4F6C
L_02AD: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_02B0: DI = &HA5C4
L_02B3: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_02B6: SI = DI
L_02B8: DI = &HA672
L_02BB: CompareLeft! = N_A5C4!: CompareRight! = N_A672!  ' RT3F_9F
L_02BE: IF CompareLeft! <= CompareRight! THEN GOTO L_0288  ' flags from L_02BB
L_02C0: SI = &HA66E
L_02C3: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_02C6: GOTO L_02F2
L_02C9: ' Alignment NOP
L_02CA: BX = 1
L_02CD: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_02D0: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_02D5: SI = &HA5C4
L_02D8: BX = SI
L_02DA: DX = BX
L_02DC: BX = CINT(N_A5C4!)  ' RT3F_75
L_02DF: BX = BX * (2 ^ 1)
L_02E1: BX = BX * (2 ^ 1)
L_02E3: BX = BX + &H4324
L_02E7: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_02EA: SI = DX
L_02EC: DI = &H4F6C
L_02EF: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_02F2: DI = &HA5C4
L_02F5: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_02F8: SI = DI
L_02FA: DI = &HA5CC
L_02FD: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_0300: IF CompareLeft! <= CompareRight! THEN GOTO L_02CA  ' flags from L_02FD
L_0302: SI = &HA66E
L_0305: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0308: GOTO L_0334
L_030B: ' Alignment NOP
L_030C: BX = 1
L_030F: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0312: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0317: SI = &HA5C4
L_031A: BX = SI
L_031C: DX = BX
L_031E: BX = CINT(N_A5C4!)  ' RT3F_75
L_0321: BX = BX * (2 ^ 1)
L_0323: BX = BX * (2 ^ 1)
L_0325: BX = BX + &H4348
L_0329: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_032C: SI = DX
L_032E: DI = &H4F6C
L_0331: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0334: DI = &HA5C4
L_0337: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_033A: SI = DI
L_033C: DI = &HA5C0
L_033F: CompareLeft! = N_A5C4!: CompareRight! = N_A5C0!  ' RT3F_9F
L_0342: IF CompareLeft! <= CompareRight! THEN GOTO L_030C  ' flags from L_033F
L_0344: SI = &HA66E
L_0347: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_034A: GOTO L_0376
L_034D: ' Alignment NOP
L_034E: BX = 1
L_0351: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0354: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0359: SI = &HA5C4
L_035C: BX = SI
L_035E: DX = BX
L_0360: BX = CINT(N_A5C4!)  ' RT3F_75
L_0363: BX = BX * (2 ^ 1)
L_0365: BX = BX * (2 ^ 1)
L_0367: BX = BX + &H435C
L_036B: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_036E: SI = DX
L_0370: DI = &H4F6C
L_0373: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0376: DI = &HA5C4
L_0379: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_037C: SI = DI
L_037E: DI = &HA676
L_0381: CompareLeft! = N_A5C4!: CompareRight! = N_A676!  ' RT3F_9F
L_0384: IF CompareLeft! <= CompareRight! THEN GOTO L_034E  ' flags from L_0381
L_0386: SI = &HA66E
L_0389: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_038C: GOTO L_03B8
L_038F: ' Alignment NOP
L_0390: BX = 1
L_0393: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0396: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_039B: SI = &HA5C4
L_039E: BX = SI
L_03A0: DX = BX
L_03A2: BX = CINT(N_A5C4!)  ' RT3F_75
L_03A5: BX = BX * (2 ^ 1)
L_03A7: BX = BX * (2 ^ 1)
L_03A9: BX = BX + &H4370
L_03AD: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_03B0: SI = DX
L_03B2: DI = &H4F6C
L_03B5: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_03B8: DI = &HA5C4
L_03BB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_03BE: SI = DI
L_03C0: DI = &HA676
L_03C3: CompareLeft! = N_A5C4!: CompareRight! = N_A676!  ' RT3F_9F
L_03C6: IF CompareLeft! <= CompareRight! THEN GOTO L_0390  ' flags from L_03C3
L_03C8: SI = &HA66E
L_03CB: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_03CE: GOTO L_03FA
L_03D1: ' Alignment NOP
L_03D2: BX = 1
L_03D5: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_03D8: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_03DD: SI = &HA5C4
L_03E0: BX = SI
L_03E2: DX = BX
L_03E4: BX = CINT(N_A5C4!)  ' RT3F_75
L_03E7: BX = BX * (2 ^ 1)
L_03E9: BX = BX * (2 ^ 1)
L_03EB: BX = BX + &H4384
L_03EF: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_03F2: SI = DX
L_03F4: DI = &H4F6C
L_03F7: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_03FA: DI = &HA5C4
L_03FD: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0400: SI = DI
L_0402: DI = &H4F94
L_0405: CompareLeft! = N_A5C4!: CompareRight! = N_4F94!  ' RT3F_9F
L_0408: IF CompareLeft! <= CompareRight! THEN GOTO L_03D2  ' flags from L_0405
L_040A: SI = &HA66E
L_040D: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0410: GOTO L_043C
L_0413: ' Alignment NOP
L_0414: BX = 1
L_0417: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_041A: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_041F: SI = &HA5C4
L_0422: BX = SI
L_0424: DX = BX
L_0426: BX = CINT(N_A5C4!)  ' RT3F_75
L_0429: BX = BX * (2 ^ 1)
L_042B: BX = BX * (2 ^ 1)
L_042D: BX = BX + &H4390
L_0431: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0434: SI = DX
L_0436: DI = &H4F6C
L_0439: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_043C: DI = &HA5C4
L_043F: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0442: SI = DI
L_0444: DI = &HA67A
L_0447: CompareLeft! = N_A5C4!: CompareRight! = N_A67A!  ' RT3F_9F
L_044A: IF CompareLeft! <= CompareRight! THEN GOTO L_0414  ' flags from L_0447
L_044C: SI = &HA66E
L_044F: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0452: GOTO L_047E
L_0455: ' Alignment NOP
L_0456: BX = 1
L_0459: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_045C: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0461: SI = &HA5C4
L_0464: BX = SI
L_0466: DX = BX
L_0468: BX = CINT(N_A5C4!)  ' RT3F_75
L_046B: BX = BX * (2 ^ 1)
L_046D: BX = BX * (2 ^ 1)
L_046F: BX = BX + &H43F4
L_0473: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0476: SI = DX
L_0478: DI = &H4F6C
L_047B: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_047E: DI = &HA5C4
L_0481: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0484: SI = DI
L_0486: DI = &HA67E
L_0489: CompareLeft! = N_A5C4!: CompareRight! = N_A67E!  ' RT3F_9F
L_048C: IF CompareLeft! <= CompareRight! THEN GOTO L_0456  ' flags from L_0489
L_048E: SI = &HA66E
L_0491: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0494: GOTO L_04C0
L_0497: ' Alignment NOP
L_0498: BX = 1
L_049B: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_049E: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_04A3: SI = &HA5C4
L_04A6: BX = SI
L_04A8: DX = BX
L_04AA: BX = CINT(N_A5C4!)  ' RT3F_75
L_04AD: BX = BX * (2 ^ 1)
L_04AF: BX = BX * (2 ^ 1)
L_04B1: BX = BX + &H44CC
L_04B5: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_04B8: SI = DX
L_04BA: DI = &H4F6C
L_04BD: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_04C0: DI = &HA5C4
L_04C3: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_04C6: SI = DI
L_04C8: DI = &HA682
L_04CB: CompareLeft! = N_A5C4!: CompareRight! = N_A682!  ' RT3F_9F
L_04CE: IF CompareLeft! <= CompareRight! THEN GOTO L_0498  ' flags from L_04CB
L_04D0: SI = &HA66E
L_04D3: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_04D6: GOTO L_0502
L_04D9: ' Alignment NOP
L_04DA: BX = 1
L_04DD: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_04E0: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_04E5: SI = &HA5C4
L_04E8: BX = SI
L_04EA: DX = BX
L_04EC: BX = CINT(N_A5C4!)  ' RT3F_75
L_04EF: BX = BX * (2 ^ 1)
L_04F1: BX = BX * (2 ^ 1)
L_04F3: BX = BX + &H44E4
L_04F7: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_04FA: SI = DX
L_04FC: DI = &H4F6C
L_04FF: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0502: DI = &HA5C4
L_0505: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0508: SI = DI
L_050A: DI = &HA5C0
L_050D: CompareLeft! = N_A5C4!: CompareRight! = N_A5C0!  ' RT3F_9F
L_0510: IF CompareLeft! <= CompareRight! THEN GOTO L_04DA  ' flags from L_050D
L_0512: SI = &HA66E
L_0515: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0518: GOTO L_0544
L_051B: ' Alignment NOP
L_051C: BX = 1
L_051F: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0522: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0527: SI = &HA5C4
L_052A: BX = SI
L_052C: DX = BX
L_052E: BX = CINT(N_A5C4!)  ' RT3F_75
L_0531: BX = BX * (2 ^ 1)
L_0533: BX = BX * (2 ^ 1)
L_0535: BX = BX + &H44F4
L_0539: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_053C: SI = DX
L_053E: DI = &H4F6C
L_0541: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0544: DI = &HA5C4
L_0547: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_054A: SI = DI
L_054C: DI = &HA672
L_054F: CompareLeft! = N_A5C4!: CompareRight! = N_A672!  ' RT3F_9F
L_0552: IF CompareLeft! <= CompareRight! THEN GOTO L_051C  ' flags from L_054F
L_0554: SI = &HA66E
L_0557: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_055A: GOTO L_0586
L_055D: ' Alignment NOP
L_055E: BX = 1
L_0561: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0564: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0569: SI = &HA5C4
L_056C: BX = SI
L_056E: DX = BX
L_0570: BX = CINT(N_A5C4!)  ' RT3F_75
L_0573: BX = BX * (2 ^ 1)
L_0575: BX = BX * (2 ^ 1)
L_0577: BX = BX + &H4534
L_057B: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_057E: SI = DX
L_0580: DI = &H4F6C
L_0583: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0586: DI = &HA5C4
L_0589: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_058C: SI = DI
L_058E: DI = &HA686
L_0591: CompareLeft! = N_A5C4!: CompareRight! = N_A686!  ' RT3F_9F
L_0594: IF CompareLeft! <= CompareRight! THEN GOTO L_055E  ' flags from L_0591
L_0596: SI = &HA66E
L_0599: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_059C: GOTO L_05C8
L_059F: ' Alignment NOP
L_05A0: BX = 1
L_05A3: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_05A6: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_05AB: SI = &HA5C4
L_05AE: BX = SI
L_05B0: DX = BX
L_05B2: BX = CINT(N_A5C4!)  ' RT3F_75
L_05B5: BX = BX * (2 ^ 1)
L_05B7: BX = BX * (2 ^ 1)
L_05B9: BX = BX + &H4560
L_05BD: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_05C0: SI = DX
L_05C2: DI = &H4F6C
L_05C5: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_05C8: DI = &HA5C4
L_05CB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_05CE: SI = DI
L_05D0: DI = &HA68A
L_05D3: CompareLeft! = N_A5C4!: CompareRight! = N_A68A!  ' RT3F_9F
L_05D6: IF CompareLeft! <= CompareRight! THEN GOTO L_05A0  ' flags from L_05D3
L_05D8: SI = &HA66E
L_05DB: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_05DE: GOTO L_060A
L_05E1: ' Alignment NOP
L_05E2: BX = 1
L_05E5: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_05E8: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_05ED: SI = &HA5C4
L_05F0: BX = SI
L_05F2: DX = BX
L_05F4: BX = CINT(N_A5C4!)  ' RT3F_75
L_05F7: BX = BX * (2 ^ 1)
L_05F9: BX = BX * (2 ^ 1)
L_05FB: BX = BX + &H46F0
L_05FF: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0602: SI = DX
L_0604: DI = &H4F6C
L_0607: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_060A: DI = &HA5C4
L_060D: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0610: SI = DI
L_0612: DI = &HA68E
L_0615: CompareLeft! = N_A5C4!: CompareRight! = N_A68E!  ' RT3F_9F
L_0618: IF CompareLeft! <= CompareRight! THEN GOTO L_05E2  ' flags from L_0615
L_061A: SI = &HA66E
L_061D: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0620: GOTO L_064C
L_0623: ' Alignment NOP
L_0624: BX = 1
L_0627: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_062A: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_062F: SI = &HA5C4
L_0632: BX = SI
L_0634: DX = BX
L_0636: BX = CINT(N_A5C4!)  ' RT3F_75
L_0639: BX = BX * (2 ^ 1)
L_063B: BX = BX * (2 ^ 1)
L_063D: BX = BX + &H47B8
L_0641: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0644: SI = DX
L_0646: DI = &H4F6C
L_0649: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_064C: DI = &HA5C4
L_064F: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0652: SI = DI
L_0654: DI = &HA692
L_0657: CompareLeft! = N_A5C4!: CompareRight! = N_A692!  ' RT3F_9F
L_065A: IF CompareLeft! <= CompareRight! THEN GOTO L_0624  ' flags from L_0657
L_065C: SI = &HA66E
L_065F: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0662: GOTO L_068E
L_0665: ' Alignment NOP
L_0666: BX = 1
L_0669: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_066C: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0671: SI = &HA5C4
L_0674: BX = SI
L_0676: DX = BX
L_0678: BX = CINT(N_A5C4!)  ' RT3F_75
L_067B: BX = BX * (2 ^ 1)
L_067D: BX = BX * (2 ^ 1)
L_067F: BX = BX + &H4814
L_0683: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0686: SI = DX
L_0688: DI = &H4F6C
L_068B: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_068E: DI = &HA5C4
L_0691: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0694: SI = DI
L_0696: DI = &HA692
L_0699: CompareLeft! = N_A5C4!: CompareRight! = N_A692!  ' RT3F_9F
L_069C: IF CompareLeft! <= CompareRight! THEN GOTO L_0666  ' flags from L_0699
L_069E: SI = &HA66E
L_06A1: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_06A4: GOTO L_06D0
L_06A7: ' Alignment NOP
L_06A8: BX = 1
L_06AB: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_06AE: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_06B3: SI = &HA5C4
L_06B6: BX = SI
L_06B8: DX = BX
L_06BA: BX = CINT(N_A5C4!)  ' RT3F_75
L_06BD: BX = BX * (2 ^ 1)
L_06BF: BX = BX * (2 ^ 1)
L_06C1: BX = BX + &H4870
L_06C5: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_06C8: SI = DX
L_06CA: DI = &H4F6C
L_06CD: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_06D0: DI = &HA5C4
L_06D3: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_06D6: SI = DI
L_06D8: DI = &HA696
L_06DB: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_06DE: IF CompareLeft! <= CompareRight! THEN GOTO L_06A8  ' flags from L_06DB
L_06E0: BX = 1
L_06E3: CLOSE #BX  ' RT3E_21
L_06E6: BX = 0
L_06E8: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_06EB: CX = BX
L_06ED: BX = 1
L_06F0: DX = &HA69A
L_06F3: OPEN S_A69A$ FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_06F6: BX = 1
L_06F9: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_06FC: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_0701: BX = &H488C
L_0704: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0707: SI = &H4F6C
L_070A: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_070D: GOTO L_0738
L_0710: BX = 1
L_0713: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_0716: InputTypes = [4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_071B: SI = &HA5C4
L_071E: BX = SI
L_0720: DX = BX
L_0722: BX = CINT(N_A5C4!)  ' RT3F_75
L_0725: BX = BX * (2 ^ 1)
L_0727: BX = BX * (2 ^ 1)
L_0729: BX = BX + &H4288
L_072D: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_0730: SI = DX
L_0732: DI = &H4F6C
L_0735: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0738: DI = &HA5C4
L_073B: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_073E: SI = DI
L_0740: DI = &HA5CC
L_0743: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_0746: IF CompareLeft! <= CompareRight! THEN GOTO L_0710  ' flags from L_0743
L_0748: BX = 1
L_074B: CLOSE #BX  ' RT3E_21
L_074E: BX = &HA6BE
L_0751: DX = &HA6A6
L_0754: S_A6A6$ = S_A6BE$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0757: BX = &HA6C8
L_075A: DX = &HA6AA
L_075D: S_A6AA$ = S_A6C8$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0760: BX = &HA6D8
L_0763: DX = &HA6AE
L_0766: S_A6AE$ = S_A6D8$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0769: DI = &HA6B2
L_076C: SI = &HA6E0
L_076F: N_A6B2! = N_A6E0!  ' RT3F_7B
L_0772: DI = &HA6B6
L_0775: N_A6B6! = N_A6E0!  ' RT3F_7B
L_0778: DI = &HA6BA
L_077B: N_A6BA! = N_A6E0!  ' RT3F_7B
L_077E: SI = &HA4E4
L_0781: BX = CINT(N_A4E4!)  ' RT3F_75
L_0784: SI = BX
L_0786: SI = SI * (2 ^ 1)
L_0788: SI = SI * (2 ^ 1)
L_078A: SI = SI + &HA6B2
L_078E: DI = &HA6D4
L_0791: N_A6D4! = N(SI)  ' RT3F_7B
L_0794: GOTO L_07C6

```

### Shared helpers and entry preparation

```basic
L_0797: DI = &HA6EC
L_079A: SI = &HA6E8
L_079D: FAC! = N_A6E8! * N_A6EC!  ' RT3F_8F
L_07A0: DI = &HA6E4
L_07A3: FAC! = FAC! + N_A6E4!  ' RT3F_81
L_07A6: DI = &HA6F0
L_07A9: FAC! = FAC! + N_A6F0!  ' RT3F_81
L_07AC: BX = CINT(FAC!)  ' RT3F_77
L_07AF: SI = BX
L_07B1: SI = SI * (2 ^ 1)
L_07B3: SI = SI * (2 ^ 1)
L_07B5: SI = SI + &H1850
L_07B9: DI = &HA6F4
L_07BC: FAC! = N(SI) + N_A6F4!  ' RT3F_7F
L_07BF: BX = &H1A
L_07C2: FAC! = INT(FAC!)  ' RT3D_03
L_07C5: RETURN
L_07C6: GOTO L_07E5
L_07C9: DI = &HA6EC
L_07CC: SI = &HA6FC
L_07CF: FAC! = N_A6FC! * N_A6EC!  ' RT3F_8F
L_07D2: DI = &HA6F8
L_07D5: FAC! = FAC! + N_A6F8!  ' RT3F_81
L_07D8: DI = &HA700
L_07DB: FAC! = FAC! + N_A700!  ' RT3F_81
L_07DE: BX = &H1A
L_07E1: FAC! = INT(FAC!)  ' RT3D_03
L_07E4: RETURN
L_07E5: GOTO L_0804
L_07E8: DI = &HA708
L_07EB: SI = &H1988
L_07EE: FAC! = N_1988! * N_A708!  ' RT3F_8F
L_07F1: DI = &H198C
L_07F4: FAC! = FAC! + N_198C!  ' RT3F_81
L_07F7: DI = &HA70C
L_07FA: FAC! = FAC! + N_A70C!  ' RT3F_81
L_07FD: BX = &H1A
L_0800: FAC! = INT(FAC!)  ' RT3D_03
L_0803: RETURN
L_0804: SI = &HA66E
L_0807: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_080A: GOTO L_082B
L_080D: ' Alignment NOP
L_080E: SI = &HA5C4
L_0811: BX = SI
L_0813: DX = BX
L_0815: BX = CINT(N_A5C4!)  ' RT3F_75
L_0818: BX = BX * (2 ^ 1)
L_081A: BX = BX * (2 ^ 1)
L_081C: BX = BX + &HA728
L_0820: READ S(BX)  ' RT3F_10
L_0823: SI = DX
L_0825: DI = &H4F6C
L_0828: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_082B: DI = &HA5C4
L_082E: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0831: SI = DI
L_0833: DI = &HA68E
L_0836: CompareLeft! = N_A5C4!: CompareRight! = N_A68E!  ' RT3F_9F
L_0839: IF CompareLeft! <= CompareRight! THEN GOTO L_080E  ' flags from L_0836
L_083B: BX = &HA7F0
L_083E: DX = &HA710
L_0841: S_A710$ = S_A7F0$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0844: BX = &HA7FA
L_0847: DX = &HA714
L_084A: S_A714$ = S_A7FA$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_084D: BX = &HA804
L_0850: DX = &HA718
L_0853: S_A718$ = S_A804$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0856: BX = &HA80E
L_0859: DX = &HA71C
L_085C: S_A71C$ = S_A80E$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_085F: BX = &HA818
L_0862: DX = &HA720
L_0865: S_A720$ = S_A818$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_0868: ' Alignment NOP
L_0869: ' Alignment NOP
L_086A: SI = &HA4E0
L_086D: CompareLeft! = N_A4E0!: CompareRight! = 0  ' RT3F_A7
L_0870: IF CompareLeft! <> CompareRight! THEN GOTO L_0875  ' flags from L_086D
L_0872: GOTO L_1074
L_0875: GOSUB L_2352
L_0878: BX = &H14
L_087B: ARGPUSH BX  ' RT3E_42
L_087E: BX = 2
L_0881: LOCATE ARGS(), BX  ' RT3E_44
L_0884: ' PRINT statement begins (screen) ; RT3F_BC
L_0887: BX = &HA824
L_088A: PRINT S_A824$;  ' RT3F_6A
L_088D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_0890: GOSUB L_28BA
L_0893: SI = &HA838
L_0896: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_0899: IF CompareLeft! <> CompareRight! THEN GOTO L_089E  ' flags from L_0896
L_089B: GOTO L_1074
L_089E: GOTO L_0F4C
L_08A1: DI = &H1920
L_08A4: SI = &HA83C
L_08A7: N_1920! = N_A83C!  ' RT3F_7B
L_08AA: DI = &H18FC
L_08AD: SI = &H4F6C
L_08B0: N_18FC! = N_4F6C!  ' RT3F_7B
L_08B3: DI = &H24D0
L_08B6: SI = &HA840
L_08B9: N_24D0! = N_A840!  ' RT3F_7B
L_08BC: DI = &H24DC
L_08BF: SI = &HA844
L_08C2: N_24DC! = N_A844!  ' RT3F_7B
L_08C5: DI = &H24F4
L_08C8: SI = &HA5C0
L_08CB: N_24F4! = N_A5C0!  ' RT3F_7B
L_08CE: DI = &H2500
L_08D1: SI = &HA5CC
L_08D4: N_2500! = N_A5CC!  ' RT3F_7B
L_08D7: DI = &H250C
L_08DA: SI = &HA848
L_08DD: N_250C! = N_A848!  ' RT3F_7B
L_08E0: DI = &H2524
L_08E3: SI = &H4F94
L_08E6: N_2524! = N_4F94!  ' RT3F_7B
L_08E9: DI = &H2958
L_08EC: SI = &HA84C
L_08EF: N_2958! = N_A84C!  ' RT3F_7B
L_08F2: DI = &H2980
L_08F5: SI = &H4F6C
L_08F8: N_2980! = N_4F6C!  ' RT3F_7B
L_08FB: DI = &H2984
L_08FE: SI = &HA5CC
L_0901: N_2984! = N_A5CC!  ' RT3F_7B
L_0904: DI = &H2E24
L_0907: SI = &HA5C0
L_090A: N_2E24! = N_A5C0!  ' RT3F_7B
L_090D: DI = &H2E2C
L_0910: SI = &HA682
L_0913: N_2E2C! = N_A682!  ' RT3F_7B
L_0916: DI = &H2E18
L_0919: N_2E18! = N_A682!  ' RT3F_7B
L_091C: DI = &H2E20
L_091F: SI = &HA850
L_0922: N_2E20! = N_A850!  ' RT3F_7B
L_0925: DI = &H3C40
L_0928: SI = &HA5C0
L_092B: N_3C40! = N_A5C0!  ' RT3F_7B
L_092E: DI = &H40E4
L_0931: SI = &HA854
L_0934: N_40E4! = N_A854!  ' RT3F_7B
L_0937: DI = &H1940
L_093A: SI = &H4F94
L_093D: N_1940! = N_4F94!  ' RT3F_7B
L_0940: DI = &H194C
L_0943: BX = SI
L_0945: SI = &H4F6C
L_0948: N_194C! = N_4F6C!  ' RT3F_7B
L_094B: SI = BX
L_094D: DI = &H1964
L_0950: N_1964! = N_4F94!  ' RT3F_7B
L_0953: DI = &H1970
L_0956: SI = &HA5C0
L_0959: N_1970! = N_A5C0!  ' RT3F_7B
L_095C: DI = &H2318
L_095F: SI = &HA840
L_0962: N_2318! = N_A840!  ' RT3F_7B
L_0965: DI = &H23A4
L_0968: SI = &HA5EE
L_096B: N_23A4! = N_A5EE!  ' RT3F_7B
L_096E: DI = &H1890
L_0971: BX = SI
L_0973: SI = &H4F94
L_0976: N_1890! = N_4F94!  ' RT3F_7B
L_0979: SWAP BX, SI
L_097B: DI = &H1DA0
L_097E: N_1DA0! = N_A5EE!  ' RT3F_7B
L_0981: DI = &H1E14
L_0984: SI = &HA5C0
L_0987: N_1E14! = N_A5C0!  ' RT3F_7B
L_098A: DI = &H1E90
L_098D: SI = &H4F6C
L_0990: N_1E90! = N_4F6C!  ' RT3F_7B
L_0993: SI = BX
L_0995: DI = &H201C
L_0998: N_201C! = N_4F94!  ' RT3F_7B
L_099B: SI = &H4F6C
L_099E: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_09A1: GOTO L_09FA
L_09A4: SI = &HA66E
L_09A7: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_09AA: GOTO L_09E1
L_09AD: ' Alignment NOP
L_09AE: DI = &HA6F8
L_09B1: SI = &HA858
L_09B4: N_A6F8! = N_A858!  ' RT3F_7B
L_09B7: DI = &HA6FC
L_09BA: BX = SI
L_09BC: SI = &HA5C4
L_09BF: N_A6FC! = N_A5C4!  ' RT3F_7B
L_09C2: GOSUB L_07C9
L_09C5: BX = CINT(FAC!)  ' RT3F_77
L_09C8: DI = BX
L_09CA: DI = DI * (2 ^ 1)
L_09CC: DI = DI * (2 ^ 1)
L_09CE: DI = DI + &H1850
L_09D2: SI = &HA85C
L_09D5: N(DI) = N_A85C!  ' RT3F_7B
L_09D8: DI = &H4F6C
L_09DB: SI = &HA858
L_09DE: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_09E1: DI = &HA858
L_09E4: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_09E7: SI = DI
L_09E9: DI = &HA696
L_09EC: CompareLeft! = N_A858!: CompareRight! = N_A696!  ' RT3F_9F
L_09EF: IF CompareLeft! <= CompareRight! THEN GOTO L_09AE  ' flags from L_09EC
L_09F1: DI = &H4F6C
L_09F4: SI = &HA5C4
L_09F7: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_09FA: DI = &HA5C4
L_09FD: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0A00: SI = DI
L_0A02: DI = &HA5CC
L_0A05: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_0A08: IF CompareLeft! <= CompareRight! THEN GOTO L_09A4  ' flags from L_0A05
L_0A0A: DI = &H3150
L_0A0D: SI = &HA860
L_0A10: N_3150! = N_A860!  ' RT3F_7B
L_0A13: SI = &H4F6C
L_0A16: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_0A19: GOTO L_0AB9
L_0A1C: DI = &HA6F8
L_0A1F: SI = &HA864
L_0A22: N_A6F8! = N_A864!  ' RT3F_7B
L_0A25: BX = DI
L_0A27: DI = &HA6FC
L_0A2A: SI = &HA5C4
L_0A2D: N_A6FC! = N_A5C4!  ' RT3F_7B
L_0A30: GOSUB L_07C9
L_0A33: BX = CINT(FAC!)  ' RT3F_77
L_0A36: DI = BX
L_0A38: DI = DI * (2 ^ 1)
L_0A3A: DI = DI * (2 ^ 1)
L_0A3C: DI = DI + &H1850
L_0A40: FAC! = RND  ' RT3D_34
L_0A43: BX = DI
L_0A45: DI = &HA840
L_0A48: FAC! = FAC! * N_A840!  ' RT3F_91
L_0A4B: DI = &H4F6C
L_0A4E: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_0A51: SWAP BX, DI
L_0A53: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A56: DI = &HA6F8
L_0A59: SI = &HA868
L_0A5C: N_A6F8! = N_A868!  ' RT3F_7B
L_0A5F: DX = DI
L_0A61: DI = &HA6FC
L_0A64: SI = &HA5C4
L_0A67: N_A6FC! = N_A5C4!  ' RT3F_7B
L_0A6A: GOSUB L_07C9
L_0A6D: BX = CINT(FAC!)  ' RT3F_77
L_0A70: DI = BX
L_0A72: DI = DI * (2 ^ 1)
L_0A74: DI = DI * (2 ^ 1)
L_0A76: DI = DI + &H1850
L_0A7A: FAC! = RND  ' RT3D_34
L_0A7D: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_0A81: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0A84: DI = &HA6F8
L_0A87: SI = &HA86C
L_0A8A: N_A6F8! = N_A86C!  ' RT3F_7B
L_0A8D: DI = &HA6FC
L_0A90: SI = &HA5C4
L_0A93: N_A6FC! = N_A5C4!  ' RT3F_7B
L_0A96: GOSUB L_07C9
L_0A99: BX = CINT(FAC!)  ' RT3F_77
L_0A9C: DI = BX
L_0A9E: DI = DI * (2 ^ 1)
L_0AA0: DI = DI * (2 ^ 1)
L_0AA2: DI = DI + &H1850
L_0AA6: FAC! = RND  ' RT3D_34
L_0AA9: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_0AAD: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0AB0: DI = &H4F6C
L_0AB3: SI = &HA5C4
L_0AB6: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_0AB9: DI = &HA5C4
L_0ABC: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0ABF: SI = DI
L_0AC1: DI = &HA5CC
L_0AC4: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_0AC7: IF CompareLeft! > CompareRight! THEN GOTO L_0ACC  ' flags from L_0AC4
L_0AC9: GOTO L_0A1C
L_0ACC: SI = &HA66E
L_0ACF: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_0AD2: GOTO L_0B02
L_0AD5: ' Alignment NOP
L_0AD6: SI = &HA5C4
L_0AD9: BX = SI
L_0ADB: DX = BX
L_0ADD: BX = CINT(N_A5C4!)  ' RT3F_75
L_0AE0: DI = BX
L_0AE2: DI = DI * (2 ^ 1)
L_0AE4: DI = DI * (2 ^ 1)
L_0AE6: DI = DI + &H1850
L_0AEA: FAC! = RND  ' RT3D_34
L_0AED: BX = DI
L_0AEF: DI = &HA5C0
L_0AF2: FAC! = FAC! * N_A5C0!  ' RT3F_91
L_0AF5: DI = BX
L_0AF7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0AFA: SI = DX
L_0AFC: DI = &H4F6C
L_0AFF: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0B02: DI = &HA5C4
L_0B05: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0B08: SI = DI
L_0B0A: DI = &HA692
L_0B0D: CompareLeft! = N_A5C4!: CompareRight! = N_A692!  ' RT3F_9F
L_0B10: IF CompareLeft! <= CompareRight! THEN GOTO L_0AD6  ' flags from L_0B0D
L_0B12: DI = &HA6F8
L_0B15: SI = &HA870
L_0B18: N_A6F8! = N_A870!  ' RT3F_7B
L_0B1B: BX = DI
L_0B1D: DI = &HA6FC
L_0B20: DX = SI
L_0B22: SI = &HA682
L_0B25: N_A6FC! = N_A682!  ' RT3F_7B
L_0B28: GOSUB L_07C9
L_0B2B: BX = CINT(FAC!)  ' RT3F_77
L_0B2E: DI = BX
L_0B30: DI = DI * (2 ^ 1)
L_0B32: DI = DI * (2 ^ 1)
L_0B34: DI = DI + &H1850
L_0B38: SI = &HA686
L_0B3B: N(DI) = N_A686!  ' RT3F_7B
L_0B3E: DI = &HA6F8
L_0B41: SI = &HA68E
L_0B44: N_A6F8! = N_A68E!  ' RT3F_7B
L_0B47: BX = DI
L_0B49: DI = &HA6FC
L_0B4C: DX = SI
L_0B4E: SI = &HA682
L_0B51: N_A6FC! = N_A682!  ' RT3F_7B
L_0B54: GOSUB L_07C9
L_0B57: BX = CINT(FAC!)  ' RT3F_77
L_0B5A: DI = BX
L_0B5C: DI = DI * (2 ^ 1)
L_0B5E: DI = DI * (2 ^ 1)
L_0B60: DI = DI + &H1850
L_0B64: SI = &HA66A
L_0B67: N(DI) = N_A66A!  ' RT3F_7B
L_0B6A: DI = &HA6F8
L_0B6D: SI = &HA870
L_0B70: N_A6F8! = N_A870!  ' RT3F_7B
L_0B73: BX = DI
L_0B75: DI = &HA6FC
L_0B78: SI = &HA874
L_0B7B: N_A6FC! = N_A874!  ' RT3F_7B
L_0B7E: GOSUB L_07C9
L_0B81: BX = CINT(FAC!)  ' RT3F_77
L_0B84: DI = BX
L_0B86: DI = DI * (2 ^ 1)
L_0B88: DI = DI * (2 ^ 1)
L_0B8A: DI = DI + &H1850
L_0B8E: SI = &H4F94
L_0B91: N(DI) = N_4F94!  ' RT3F_7B
L_0B94: DI = &HA6F8
L_0B97: SI = &HA68E
L_0B9A: N_A6F8! = N_A68E!  ' RT3F_7B
L_0B9D: DI = &HA6FC
L_0BA0: SI = &HA878
L_0BA3: N_A6FC! = N_A878!  ' RT3F_7B
L_0BA6: GOSUB L_07C9
L_0BA9: BX = CINT(FAC!)  ' RT3F_77
L_0BAC: DI = BX
L_0BAE: DI = DI * (2 ^ 1)
L_0BB0: DI = DI * (2 ^ 1)
L_0BB2: DI = DI + &H1850
L_0BB6: SI = &HA850
L_0BB9: N(DI) = N_A850!  ' RT3F_7B
L_0BBC: SI = &H4F6C
L_0BBF: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_0BC2: GOTO L_0C52
L_0BC5: ' Alignment NOP
L_0BC6: DI = &HA6F8
L_0BC9: SI = &HA97C
L_0BCC: N_A6F8! = N_A97C!  ' RT3F_7B
L_0BCF: BX = DI
L_0BD1: DI = &HA6FC
L_0BD4: DX = SI
L_0BD6: SI = &HA5C4
L_0BD9: N_A6FC! = N_A5C4!  ' RT3F_7B
L_0BDC: GOSUB L_07C9
L_0BDF: BX = CINT(FAC!)  ' RT3F_77
L_0BE2: DI = BX
L_0BE4: DI = DI * (2 ^ 1)
L_0BE6: DI = DI * (2 ^ 1)
L_0BE8: DI = DI + &H1850
L_0BEC: FAC! = RND  ' RT3D_34
L_0BEF: BX = DI
L_0BF1: DI = &HA6EC
L_0BF4: FAC! = FAC! * N_A6EC!  ' RT3F_91
L_0BF7: DI = BX
L_0BF9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0BFC: DI = &HA6F8
L_0BFF: SI = &HA672
L_0C02: N_A6F8! = N_A672!  ' RT3F_7B
L_0C05: DI = &HA6FC
L_0C08: SI = &HA5C4
L_0C0B: N_A6FC! = N_A5C4!  ' RT3F_7B
L_0C0E: GOSUB L_07C9
L_0C11: BX = CINT(FAC!)  ' RT3F_77
L_0C14: DI = BX
L_0C16: DI = DI * (2 ^ 1)
L_0C18: DI = DI * (2 ^ 1)
L_0C1A: DI = DI + &H1850
L_0C1E: FAC! = RND  ' RT3D_34
L_0C21: BX = DI
L_0C23: DI = &HA6E4
L_0C26: SI = &HA97C
L_0C29: N_A6E4! = N_A97C!  ' RT3F_7B
L_0C2C: DI = &HA6E8
L_0C2F: SI = &HA5C4
L_0C32: N_A6E8! = N_A5C4!  ' RT3F_7B
L_0C35: T_00! = FAC!  ' RT3F_71; inline=&H80
L_0C39: WORD(BP - 6) = BX
L_0C3C: GOSUB L_0797
L_0C3F: FAC! = T_00! * FAC!  ' RT3F_95; inline=&H80
L_0C43: DI = WORD(BP - 6)
L_0C46: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0C49: DI = &H4F6C
L_0C4C: SI = &HA5C4
L_0C4F: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_0C52: DI = &HA5C4
L_0C55: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0C58: SI = DI
L_0C5A: DI = &HA5CC
L_0C5D: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_0C60: IF CompareLeft! > CompareRight! THEN GOTO L_0C65  ' flags from L_0C5D
L_0C62: GOTO L_0BC6
L_0C65: DI = &H1A08
L_0C68: SI = &H4F94
L_0C6B: N_1A08! = N_4F94!  ' RT3F_7B
L_0C6E: DI = &H1A14
L_0C71: N_1A14! = N_4F94!  ' RT3F_7B
L_0C74: DI = &H1A20
L_0C77: N_1A20! = N_4F94!  ' RT3F_7B
L_0C7A: DI = &H1A2C
L_0C7D: N_1A2C! = N_4F94!  ' RT3F_7B
L_0C80: DI = &HA6F8
L_0C83: SI = &HA854
L_0C86: N_A6F8! = N_A854!  ' RT3F_7B
L_0C89: BX = DI
L_0C8B: DI = &HA6FC
L_0C8E: DX = SI
L_0C90: SI = &HA682
L_0C93: N_A6FC! = N_A682!  ' RT3F_7B
L_0C96: GOSUB L_07C9
L_0C99: BX = CINT(FAC!)  ' RT3F_77
L_0C9C: DI = BX
L_0C9E: DI = DI * (2 ^ 1)
L_0CA0: DI = DI * (2 ^ 1)
L_0CA2: DI = DI + &H1850
L_0CA6: SI = &HA840
L_0CA9: N(DI) = N_A840!  ' RT3F_7B
L_0CAC: DI = &HA6F8
L_0CAF: SI = &HA854
L_0CB2: N_A6F8! = N_A854!  ' RT3F_7B
L_0CB5: DI = &HA6FC
L_0CB8: BX = SI
L_0CBA: SI = &HA696
L_0CBD: N_A6FC! = N_A696!  ' RT3F_7B
L_0CC0: GOSUB L_07C9
L_0CC3: BX = CINT(FAC!)  ' RT3F_77
L_0CC6: DI = BX
L_0CC8: DI = DI * (2 ^ 1)
L_0CCA: DI = DI * (2 ^ 1)
L_0CCC: DI = DI + &H1850
L_0CD0: SI = &HA854
L_0CD3: N(DI) = N_A854!  ' RT3F_7B
L_0CD6: SI = &H4F6C
L_0CD9: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_0CDC: GOTO L_0D1E
L_0CDF: ' Alignment NOP
L_0CE0: DI = &HA6F8
L_0CE3: SI = &HA66A
L_0CE6: N_A6F8! = N_A66A!  ' RT3F_7B
L_0CE9: DI = &HA6FC
L_0CEC: SI = &HA5C4
L_0CEF: N_A6FC! = N_A5C4!  ' RT3F_7B
L_0CF2: GOSUB L_07C9
L_0CF5: BX = CINT(FAC!)  ' RT3F_77
L_0CF8: DI = BX
L_0CFA: DI = DI * (2 ^ 1)
L_0CFC: DI = DI * (2 ^ 1)
L_0CFE: DI = DI + &H1850
L_0D02: FAC! = RND  ' RT3D_34
L_0D05: BX = DI
L_0D07: DI = &HA686
L_0D0A: FAC! = FAC! * N_A686!  ' RT3F_91
L_0D0D: FAC! = FAC! + N(DI)  ' RT3F_81
L_0D10: DI = BX
L_0D12: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0D15: DI = &H4F6C
L_0D18: SI = &HA5C4
L_0D1B: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_0D1E: DI = &HA5C4
L_0D21: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0D24: SI = DI
L_0D26: DI = &HA5CC
L_0D29: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_0D2C: IF CompareLeft! <= CompareRight! THEN GOTO L_0CE0  ' flags from L_0D29
L_0D2E: DI = &HA6F8
L_0D31: SI = &HA682
L_0D34: N_A6F8! = N_A682!  ' RT3F_7B
L_0D37: BX = DI
L_0D39: DI = &HA6FC
L_0D3C: N_A6FC! = N_A682!  ' RT3F_7B
L_0D3F: GOSUB L_07C9
L_0D42: BX = CINT(FAC!)  ' RT3F_77
L_0D45: DI = BX
L_0D47: DI = DI * (2 ^ 1)
L_0D49: DI = DI * (2 ^ 1)
L_0D4B: DI = DI + &H1850
L_0D4F: SI = &HA980
L_0D52: N(DI) = N_A980!  ' RT3F_7B
L_0D55: DI = &HA6F8
L_0D58: SI = &HA868
L_0D5B: N_A6F8! = N_A868!  ' RT3F_7B
L_0D5E: DI = &HA6FC
L_0D61: SI = &HA682
L_0D64: N_A6FC! = N_A682!  ' RT3F_7B
L_0D67: GOSUB L_07C9
L_0D6A: BX = CINT(FAC!)  ' RT3F_77
L_0D6D: DI = BX
L_0D6F: DI = DI * (2 ^ 1)
L_0D71: DI = DI * (2 ^ 1)
L_0D73: DI = DI + &H1850
L_0D77: SI = &HA984
L_0D7A: N(DI) = N_A984!  ' RT3F_7B
L_0D7D: DI = &H1908
L_0D80: SI = &HA988
L_0D83: N_1908! = N_A988!  ' RT3F_7B
L_0D86: DI = &H1904
L_0D89: SI = &HA98C
L_0D8C: N_1904! = N_A98C!  ' RT3F_7B
L_0D8F: DI = &H1900
L_0D92: SI = &HA5CC
L_0D95: N_1900! = N_A5CC!  ' RT3F_7B
L_0D98: DI = &H192C
L_0D9B: SI = &HA6EC
L_0D9E: N_192C! = N_A6EC!  ' RT3F_7B
L_0DA1: DI = &H1924
L_0DA4: SI = &HA672
L_0DA7: N_1924! = N_A672!  ' RT3F_7B
L_0DAA: SI = &H4F6C
L_0DAD: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_0DB0: GOTO L_0DE5
L_0DB3: ' Alignment NOP
L_0DB4: DI = &HA6F8
L_0DB7: SI = &HA66A
L_0DBA: N_A6F8! = N_A66A!  ' RT3F_7B
L_0DBD: DI = &HA6FC
L_0DC0: SI = &HA5C4
L_0DC3: N_A6FC! = N_A5C4!  ' RT3F_7B
L_0DC6: GOSUB L_07C9
L_0DC9: BX = CINT(FAC!)  ' RT3F_77
L_0DCC: DI = BX
L_0DCE: DI = DI * (2 ^ 1)
L_0DD0: DI = DI * (2 ^ 1)
L_0DD2: DI = DI + &H1850
L_0DD6: SI = &HA682
L_0DD9: N(DI) = N_A682!  ' RT3F_7B
L_0DDC: DI = &H4F6C
L_0DDF: SI = &HA5C4
L_0DE2: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_0DE5: DI = &HA5C4
L_0DE8: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0DEB: SI = DI
L_0DED: DI = &HA5CC
L_0DF0: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_0DF3: IF CompareLeft! <= CompareRight! THEN GOTO L_0DB4  ' flags from L_0DF0
L_0DF5: DI = &H3AB8
L_0DF8: SI = &HA990
L_0DFB: N_3AB8! = N_A990!  ' RT3F_7B
L_0DFE: DI = &H3AC0
L_0E01: SI = &HA994
L_0E04: N_3AC0! = N_A994!  ' RT3F_7B
L_0E07: SI = &HA998
L_0E0A: FAC! = N_A998!: DI = &H001E  ' RT3F_6F
L_0E0D: GOTO L_0E3C
L_0E10: SI = &HA5C4
L_0E13: BX = SI
L_0E15: DX = BX
L_0E17: BX = CINT(N_A5C4!)  ' RT3F_75
L_0E1A: DI = BX
L_0E1C: DI = DI * (2 ^ 1)
L_0E1E: DI = DI * (2 ^ 1)
L_0E20: DI = DI + &H1850
L_0E24: FAC! = RND  ' RT3D_34
L_0E27: BX = DI
L_0E29: DI = &HA692
L_0E2C: FAC! = FAC! * N_A692!  ' RT3F_91
L_0E2F: DI = BX
L_0E31: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0E34: SI = DX
L_0E36: DI = &H4F6C
L_0E39: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0E3C: DI = &HA5C4
L_0E3F: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0E42: SI = DI
L_0E44: DI = &HA99C
L_0E47: CompareLeft! = N_A5C4!: CompareRight! = N_A99C!  ' RT3F_9F
L_0E4A: IF CompareLeft! <= CompareRight! THEN GOTO L_0E10  ' flags from L_0E47
L_0E4C: SI = &HA9A0
L_0E4F: FAC! = N_A9A0!: DI = &H001E  ' RT3F_6F
L_0E52: GOTO L_0E90
L_0E55: ' Alignment NOP
L_0E56: SI = &HA5C4
L_0E59: BX = SI
L_0E5B: DX = BX
L_0E5D: BX = CINT(N_A5C4!)  ' RT3F_75
L_0E60: DI = BX
L_0E62: DI = DI * (2 ^ 1)
L_0E64: DI = DI * (2 ^ 1)
L_0E66: DI = DI + &H1850
L_0E6A: FAC! = RND  ' RT3D_34
L_0E6D: BX = DI
L_0E6F: DI = &HA9A4
L_0E72: FAC! = FAC! * N_A9A4!  ' RT3F_91
L_0E75: DI = &HA9A8
L_0E78: FAC! = FAC! + N_A9A8!  ' RT3F_81
L_0E7B: CX = BX
L_0E7D: BX = &H1A
L_0E80: FAC! = INT(FAC!)  ' RT3D_03
L_0E83: DI = CX
L_0E85: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0E88: SI = DX
L_0E8A: DI = &H4F6C
L_0E8D: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0E90: DI = &HA5C4
L_0E93: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0E96: SI = DI
L_0E98: DI = &HA9AC
L_0E9B: CompareLeft! = N_A5C4!: CompareRight! = N_A9AC!  ' RT3F_9F
L_0E9E: IF CompareLeft! <= CompareRight! THEN GOTO L_0E56  ' flags from L_0E9B
L_0EA0: SI = &HA9B0
L_0EA3: FAC! = N_A9B0!: DI = &H001E  ' RT3F_6F
L_0EA6: GOTO L_0ED6
L_0EA9: ' Alignment NOP
L_0EAA: SI = &HA5C4
L_0EAD: BX = SI
L_0EAF: DX = BX
L_0EB1: BX = CINT(N_A5C4!)  ' RT3F_75
L_0EB4: DI = BX
L_0EB6: DI = DI * (2 ^ 1)
L_0EB8: DI = DI * (2 ^ 1)
L_0EBA: DI = DI + &H1850
L_0EBE: FAC! = RND  ' RT3D_34
L_0EC1: BX = DI
L_0EC3: DI = &HA692
L_0EC6: FAC! = FAC! * N_A692!  ' RT3F_91
L_0EC9: DI = BX
L_0ECB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0ECE: SI = DX
L_0ED0: DI = &H4F6C
L_0ED3: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0ED6: DI = &HA5C4
L_0ED9: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0EDC: SI = DI
L_0EDE: DI = &HA9B4
L_0EE1: CompareLeft! = N_A5C4!: CompareRight! = N_A9B4!  ' RT3F_9F
L_0EE4: IF CompareLeft! <= CompareRight! THEN GOTO L_0EAA  ' flags from L_0EE1
L_0EE6: SI = &HA9B8
L_0EE9: FAC! = N_A9B8!: DI = &H001E  ' RT3F_6F
L_0EEC: GOTO L_0F1B
L_0EEF: ' Alignment NOP
L_0EF0: SI = &HA5C4
L_0EF3: BX = SI
L_0EF5: DX = BX
L_0EF7: BX = CINT(N_A5C4!)  ' RT3F_75
L_0EFA: DI = BX
L_0EFC: DI = DI * (2 ^ 1)
L_0EFE: DI = DI * (2 ^ 1)
L_0F00: DI = DI + &H1850
L_0F04: SI = DX
L_0F06: BX = DI
L_0F08: DI = &HA9BC
L_0F0B: FAC! = N_A5C4! + N_A9BC!  ' RT3F_7F
L_0F0E: DI = BX
L_0F10: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_0F13: SI = DX
L_0F15: DI = &H4F6C
L_0F18: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_0F1B: DI = &HA5C4
L_0F1E: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0F21: SI = DI
L_0F23: DI = &HA9C0
L_0F26: CompareLeft! = N_A5C4!: CompareRight! = N_A9C0!  ' RT3F_9F
L_0F29: IF CompareLeft! <= CompareRight! THEN GOTO L_0EF0  ' flags from L_0F26
L_0F2B: DI = &H1D38
L_0F2E: SI = &HA9A4
L_0F31: N_1D38! = N_A9A4!  ' RT3F_7B
L_0F34: DI = &H1D2C
L_0F37: SI = &HA686
L_0F3A: N_1D2C! = N_A686!  ' RT3F_7B
L_0F3D: DI = &H1AD8
L_0F40: SI = &H4F6C
L_0F43: N_1AD8! = N_4F6C!  ' RT3F_7B
L_0F46: DI = &H1B44
L_0F49: N_1B44! = N_4F6C!  ' RT3F_7B
L_0F4C: DI = &HA6F8
L_0F4F: SI = &HA66E
L_0F52: N_A6F8! = N_A66E!  ' RT3F_7B
L_0F55: BX = DI
L_0F57: DI = &HA6FC
L_0F5A: SI = &H4F94
L_0F5D: N_A6FC! = N_4F94!  ' RT3F_7B
L_0F60: GOSUB L_07C9
L_0F63: BX = CINT(FAC!)  ' RT3F_77
L_0F66: DI = BX
L_0F68: DI = DI * (2 ^ 1)
L_0F6A: DI = DI * (2 ^ 1)
L_0F6C: DI = DI + &H1850
L_0F70: SI = &HA850
L_0F73: N(DI) = N_A850!  ' RT3F_7B
L_0F76: DI = &HA6F8
L_0F79: SI = &HA5C0
L_0F7C: N_A6F8! = N_A5C0!  ' RT3F_7B
L_0F7F: DI = &HA6FC
L_0F82: SI = &H4F94
L_0F85: N_A6FC! = N_4F94!  ' RT3F_7B
L_0F88: GOSUB L_07C9
L_0F8B: BX = CINT(FAC!)  ' RT3F_77
L_0F8E: DI = BX
L_0F90: DI = DI * (2 ^ 1)
L_0F92: DI = DI * (2 ^ 1)
L_0F94: DI = DI + &H1850
L_0F98: SI = &HA9C4
L_0F9B: N(DI) = N_A9C4!  ' RT3F_7B
L_0F9E: SI = &HA9C8
L_0FA1: FAC! = N_A9C8!: DI = &H001E  ' RT3F_6F
L_0FA4: GOTO L_0FC9
L_0FA7: ' Alignment NOP
L_0FA8: SI = &HA5C4
L_0FAB: BX = SI
L_0FAD: DX = BX
L_0FAF: BX = CINT(N_A5C4!)  ' RT3F_75
L_0FB2: DI = BX
L_0FB4: DI = DI * (2 ^ 1)
L_0FB6: DI = DI * (2 ^ 1)
L_0FB8: DI = DI + &H1850
L_0FBC: SI = &H4F6C
L_0FBF: N(DI) = N_4F6C!  ' RT3F_7B
L_0FC2: DI = SI
L_0FC4: SWAP DX, SI
L_0FC6: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_0FC9: DI = &HA5C4
L_0FCC: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_0FCF: SI = DI
L_0FD1: DI = &HA9CC
L_0FD4: CompareLeft! = N_A5C4!: CompareRight! = N_A9CC!  ' RT3F_9F
L_0FD7: IF CompareLeft! <= CompareRight! THEN GOTO L_0FA8  ' flags from L_0FD4
L_0FD9: SI = &HA9D0
L_0FDC: FAC! = N_A9D0!: DI = &H001E  ' RT3F_6F
L_0FDF: GOTO L_1004
L_0FE2: SI = &HA5C4
L_0FE5: BX = SI
L_0FE7: DX = BX
L_0FE9: BX = CINT(N_A5C4!)  ' RT3F_75
L_0FEC: DI = BX
L_0FEE: DI = DI * (2 ^ 1)
L_0FF0: DI = DI * (2 ^ 1)
L_0FF2: DI = DI + &H1850
L_0FF6: SI = &HA9D4
L_0FF9: N(DI) = N_A9D4!  ' RT3F_7B
L_0FFC: SI = DX
L_0FFE: DI = &H4F6C

```

### Aging, rewards and mission accounting

```basic
L_1001: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_1004: DI = &HA5C4
L_1007: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_100A: SI = DI
L_100C: DI = &HA9D8
L_100F: CompareLeft! = N_A5C4!: CompareRight! = N_A9D8!  ' RT3F_9F
L_1012: IF CompareLeft! <= CompareRight! THEN GOTO L_0FE2  ' flags from L_100F
L_1014: SI = &HA9D0
L_1017: FAC! = N_A9D0!: DI = &H001E  ' RT3F_6F
L_101A: GOTO L_103F
L_101D: ' Alignment NOP
L_101E: SI = &HA5C4
L_1021: BX = SI
L_1023: DX = BX
L_1025: BX = CINT(N_A5C4!)  ' RT3F_75
L_1028: DI = BX
L_102A: DI = DI * (2 ^ 1)
L_102C: DI = DI * (2 ^ 1)
L_102E: DI = DI + &H1850
L_1032: SI = &HA5C0
L_1035: N(DI) = N_A5C0!  ' RT3F_7B
L_1038: DI = SI
L_103A: SWAP DX, SI
L_103C: FAC! = N_A5C4! + N_A5C0!  ' RT3F_7F
L_103F: DI = &HA5C4
L_1042: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_1045: SI = DI
L_1047: DI = &HA9DC
L_104A: CompareLeft! = N_A5C4!: CompareRight! = N_A9DC!  ' RT3F_9F
L_104D: IF CompareLeft! <= CompareRight! THEN GOTO L_101E  ' flags from L_104A
L_104F: DI = &H1AC8
L_1052: SI = &H4F94
L_1055: N_1AC8! = N_4F94!  ' RT3F_7B
L_1058: DI = &H1A04
L_105B: SI = &H4F6C
L_105E: N_1A04! = N_4F6C!  ' RT3F_7B
L_1061: DI = &H1988
L_1064: BX = SI
L_1066: SI = &HA9E0
L_1069: N_1988! = N_A9E0!  ' RT3F_7B
L_106C: SI = BX
L_106E: DI = &H19C4
L_1071: N_19C4! = N_4F6C!  ' RT3F_7B
L_1074: FAC! = TIMER  ' RT3D_43
L_1077: BX = &H1A
L_107A: RANDOMIZE FAC!  ' RT3E_09
L_107D: GOSUB L_1C09
L_1080: BX = &H4926
L_1083: FAC! = CSNG(BX)  ' RT3F_57
L_1086: BX = &HA9E4
L_1089: AX = &H4F78
L_108C: BX = TEMP_DESC(S_4F78$ + S_A9E4$)  ' BX receives a temporary descriptor  ' RT3F_55
L_108F: SI = &HA4E4
L_1092: T_00! = FAC!  ' RT3F_71; inline=&H80
L_1096: FAC! = -N(SI)  ' RT3F_AF
L_1099: DI = &HA844
L_109C: FAC! = FAC! + N_A844!  ' RT3F_81
L_109F: DX = BX
L_10A1: BX = &H1A
L_10A4: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_10A7: AX = DX
L_10A9: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_10AC: AX = BX
L_10AE: BX = &HA9EE
L_10B1: BX = TEMP_DESC(S(AX) + S_A9EE$)  ' BX receives a temporary descriptor  ' RT3F_55
L_10B4: DX = &HA87C
L_10B7: BLOAD S(BX), N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_10BA: GOSUB L_1EFD
L_10BD: DI = &H3B50
L_10C0: SI = &H3BA4
L_10C3: N_3B50! = N_3BA4!  ' RT3F_7B
L_10C6: DI = &H3B40
L_10C9: SI = &H3BA8
L_10CC: N_3B40! = N_3BA8!  ' RT3F_7B
L_10CF: DI = &H3AD8
L_10D2: SI = &H3AB8
L_10D5: FAC! = N_3AB8! - N_3AD8!  ' RT3F_97
L_10D8: BX = DI
L_10DA: DI = &HA9FA
L_10DD: DX = SI
L_10DF: FAC! = FAC! * N_A9FA!  ' RT3F_91
L_10E2: DI = &H3AE0
L_10E5: FAC! = FAC! - N_3AE0!  ' RT3F_99
L_10E8: CX = DI
L_10EA: DI = &H3AC0
L_10ED: FAC! = FAC! + N_3AC0!  ' RT3F_81
L_10F0: AX = DI
L_10F2: DI = &HA9F6
L_10F5: N_A9F6! = FAC!: SI = &H001A  ' RT3F_7D
L_10F8: DI = BX
L_10FA: SI = DX
L_10FC: N(DI) = N(SI)  ' RT3F_7B
L_10FF: DI = CX
L_1101: SI = AX
L_1103: N(DI) = N(SI)  ' RT3F_7B
L_1106: SI = &H4F6C
L_1109: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_110C: GOTO L_13C3
L_110F: ' Alignment NOP
L_1110: DI = &HA6E4
L_1113: SI = &HA66E
L_1116: N_A6E4! = N_A66E!  ' RT3F_7B
L_1119: DI = &HA6E8
L_111C: BX = SI
L_111E: SI = &HA9FE
L_1121: N_A6E8! = N_A9FE!  ' RT3F_7B
L_1124: GOSUB L_0797
L_1127: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_112A: IF CompareLeft! <> CompareRight! THEN GOTO L_112F  ' flags from L_1127
L_112C: GOTO L_13BA
L_112F: DI = &HA6E4
L_1132: SI = &HAA0A
L_1135: N_A6E4! = N_AA0A!  ' RT3F_7B
L_1138: BX = DI
L_113A: DI = &HA6E8
L_113D: SI = &HA9FE
L_1140: N_A6E8! = N_A9FE!  ' RT3F_7B
L_1143: GOSUB L_0797
L_1146: DI = &HA70C
L_1149: SI = &HA9F6
L_114C: T_00! = FAC!  ' RT3F_71; inline=&H80
L_1150: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_1153: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_1157: DI = &HAA02
L_115A: N_AA02! = FAC!: SI = &H001A  ' RT3F_7D
L_115D: SI = DI
L_115F: DI = &HAA0E
L_1162: FAC! = N_AA02! * N_AA0E!  ' RT3F_8F
L_1165: BX = &H1A
L_1168: FAC! = INT(FAC!)  ' RT3D_03
L_116B: DI = &HAA06
L_116E: N_AA06! = FAC!: SI = &H001A  ' RT3F_7D
L_1171: SI = DI
L_1173: DI = &HAA12
L_1176: CompareLeft! = N_AA06!: CompareRight! = N_AA12!  ' RT3F_9F
L_1179: BX = 0
L_117C: IF CompareLeft! >= CompareRight! THEN GOTO L_117F  ' flags from L_1176
L_117E: BX = BX - 1
L_117F: DI = &HA6E4
L_1182: DX = SI
L_1184: SI = &HAA16
L_1187: N_A6E4! = N_AA16!  ' RT3F_7B
L_118A: DI = &HA6E8
L_118D: SI = &HA9FE
L_1190: N_A6E8! = N_A9FE!  ' RT3F_7B
L_1193: WORD(BP - 6) = BX
L_1196: GOSUB L_0797
L_1199: DI = &HAA06
L_119C: CompareLeft! = FAC!: CompareRight! = N_AA06!  ' RT3F_A1
L_119F: BX = 0
L_11A2: IF CompareLeft! <> CompareRight! THEN GOTO L_11A5  ' flags from L_119C
L_11A4: BX = BX - 1
L_11A5: BX = BX OR WORD(BP - 6)
L_11A8: CompareLeft% = BX: CompareRight% = 0
L_11AA: IF CompareLeft% = CompareRight% THEN GOTO L_11AF  ' flags from L_11A8
L_11AC: GOTO L_1392
L_11AF: DI = &HA6F8
L_11B2: SI = &HAA16
L_11B5: N_A6F8! = N_AA16!  ' RT3F_7B
L_11B8: DI = &HA6FC
L_11BB: SI = &HA9FE
L_11BE: N_A6FC! = N_A9FE!  ' RT3F_7B
L_11C1: GOSUB L_07C9
L_11C4: BX = CINT(FAC!)  ' RT3F_77
L_11C7: DI = BX
L_11C9: DI = DI * (2 ^ 1)
L_11CB: DI = DI * (2 ^ 1)
L_11CD: DI = DI + &H1850
L_11D1: SI = &HAA06
L_11D4: N(DI) = N_AA06!  ' RT3F_7B
L_11D7: FAC! = RND  ' RT3D_34
L_11DA: DI = &HA6EC
L_11DD: BX = SI
L_11DF: FAC! = FAC! * N_A6EC!  ' RT3F_91
L_11E2: SI = BX
L_11E4: T_00! = FAC!  ' RT3F_71; inline=&H80
L_11E8: FAC! = N(SI) * 2 ^ (2)  ' RT3F_AB; inline=&H02
L_11EC: DI = &HAA1A
L_11EF: FAC! = FAC! + N_AA1A!  ' RT3F_81
L_11F2: CompareLeft! = T_00!: CompareRight! = FAC!  ' RT3F_A5; inline=&H80
L_11F6: IF CompareLeft! < CompareRight! THEN GOTO L_11FB  ' flags from L_11F2
L_11F8: GOTO L_1392
L_11FB: GOSUB L_2352
L_11FE: BX = &H13
L_1201: ARGPUSH BX  ' RT3E_42
L_1204: BX = 2
L_1207: LOCATE ARGS(), BX  ' RT3E_44
L_120A: ' PRINT statement begins (screen) ; RT3F_BC
L_120D: SI = &HA9FE
L_1210: BX = CINT(N_A9FE!)  ' RT3F_75
L_1213: BX = BX * (2 ^ 1)
L_1215: BX = BX * (2 ^ 1)
L_1217: BX = BX + &H4288
L_121B: PRINT S(BX);  ' RT3F_6A
L_121E: BX = &HAA1E
L_1221: PRINT S_AA1E$  ' RT3F_6E; H newline item, ledger correction
L_1224: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1227: DI = &HAA2C
L_122A: SI = &HA66E
L_122D: N_AA2C! = N_A66E!  ' RT3F_7B
L_1230: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_1233: GOTO L_12C1
L_1236: DI = &HA6E4
L_1239: SI = &HA858
L_123C: N_A6E4! = N_A858!  ' RT3F_7B
L_123F: DI = &HA6E8
L_1242: SI = &HA9FE
L_1245: N_A6E8! = N_A9FE!  ' RT3F_7B
L_1248: GOSUB L_0797
L_124B: T_00! = FAC!  ' RT3F_71; inline=&H80
L_124F: FAC! = RND  ' RT3D_34
L_1252: FAC! = FAC! * 2 ^ (2)  ' RT3F_AD; inline=&H02
L_1256: BX = &H1A
L_1259: FAC! = INT(FAC!)  ' RT3D_03
L_125C: FAC! = T_00! - FAC!  ' RT3F_9D; inline=&H80
L_1260: DI = &HA844
L_1263: FAC! = FAC! + N_A844!  ' RT3F_81
L_1266: DI = &HAA30
L_1269: N_AA30! = FAC!: SI = &H001A  ' RT3F_7D
L_126C: SI = DI
L_126E: DI = &H4F6C
L_1271: CompareLeft! = N_AA30!: CompareRight! = N_4F6C!  ' RT3F_9F
L_1274: IF CompareLeft! < CompareRight! THEN GOTO L_1279  ' flags from L_1271
L_1276: GOTO L_128B
L_1279: SWAP DI, SI
L_127B: BX = DI
L_127D: DI = &HAA2C
L_1280: N_AA2C! = N(SI)  ' RT3F_7B
L_1283: DI = BX
L_1285: SI = &HA66E
L_1288: N(DI) = N_A66E!  ' RT3F_7B
L_128B: DI = &HA6F8
L_128E: SI = &HA858
L_1291: N_A6F8! = N_A858!  ' RT3F_7B
L_1294: DI = &HA6FC
L_1297: BX = SI
L_1299: SI = &HA9FE
L_129C: N_A6FC! = N_A9FE!  ' RT3F_7B
L_129F: GOSUB L_07C9
L_12A2: BX = CINT(FAC!)  ' RT3F_77
L_12A5: DI = BX
L_12A7: DI = DI * (2 ^ 1)
L_12A9: DI = DI * (2 ^ 1)
L_12AB: DI = DI + &H1850
L_12AF: BX = &HAA30
L_12B2: FAC! = INT(N_AA30!)  ' RT3D_03
L_12B5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_12B8: DI = &H4F6C
L_12BB: SI = &HA858
L_12BE: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_12C1: DI = &HA858
L_12C4: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_12C7: SI = DI
L_12C9: DI = &H4F94
L_12CC: CompareLeft! = N_A858!: CompareRight! = N_4F94!  ' RT3F_9F
L_12CF: IF CompareLeft! > CompareRight! THEN GOTO L_12D4  ' flags from L_12CC
L_12D1: GOTO L_1236
L_12D4: DI = &H4F6C
L_12D7: SI = &HAA2C
L_12DA: CompareLeft! = N_AA2C!: CompareRight! = N_4F6C!  ' RT3F_9F
L_12DD: IF CompareLeft! = CompareRight! THEN GOTO L_12E2  ' flags from L_12DA
L_12DF: GOTO L_1380
L_12E2: SI = &HA66E
L_12E5: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_12E8: GOTO L_131F
L_12EB: ' Alignment NOP
L_12EC: DI = &HA6F8
L_12EF: SI = &HA858
L_12F2: N_A6F8! = N_A858!  ' RT3F_7B
L_12F5: DI = &HA6FC
L_12F8: BX = SI
L_12FA: SI = &HA9FE
L_12FD: N_A6FC! = N_A9FE!  ' RT3F_7B
L_1300: GOSUB L_07C9
L_1303: BX = CINT(FAC!)  ' RT3F_77
L_1306: DI = BX
L_1308: DI = DI * (2 ^ 1)
L_130A: DI = DI * (2 ^ 1)
L_130C: DI = DI + &H1850
L_1310: SI = &HA66E
L_1313: N(DI) = N_A66E!  ' RT3F_7B
L_1316: DI = &H4F6C
L_1319: SI = &HA858
L_131C: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_131F: DI = &HA858
L_1322: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_1325: SI = DI
L_1327: DI = &HAA34
L_132A: CompareLeft! = N_A858!: CompareRight! = N_AA34!  ' RT3F_9F
L_132D: IF CompareLeft! <= CompareRight! THEN GOTO L_12EC  ' flags from L_132A
L_132F: DI = &HA6F8
L_1332: SI = &HA86C
L_1335: N_A6F8! = N_A86C!  ' RT3F_7B
L_1338: DI = &HA6FC
L_133B: SI = &HA9FE
L_133E: N_A6FC! = N_A9FE!  ' RT3F_7B
L_1341: GOSUB L_07C9
L_1344: BX = CINT(FAC!)  ' RT3F_77
L_1347: DI = BX
L_1349: DI = DI * (2 ^ 1)
L_134B: DI = DI * (2 ^ 1)
L_134D: DI = DI + &H1850
L_1351: SI = &HAA44
L_1354: N(DI) = N_AA44!  ' RT3F_7B
L_1357: BX = &H15
L_135A: ARGPUSH BX  ' RT3E_42
L_135D: BX = 2
L_1360: LOCATE ARGS(), BX  ' RT3E_44
L_1363: ' PRINT statement begins (screen) ; RT3F_BC
L_1366: SI = &HA9FE
L_1369: BX = CINT(N_A9FE!)  ' RT3F_75
L_136C: BX = BX * (2 ^ 1)
L_136E: BX = BX * (2 ^ 1)
L_1370: BX = BX + &H4288
L_1374: PRINT S(BX);  ' RT3F_6A
L_1377: BX = &HAA38
L_137A: PRINT S_AA38$  ' RT3F_6E; H newline item, ledger correction
L_137D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1380: GOSUB L_26A6
L_1383: BX = &H18
L_1386: ARGPUSH BX  ' RT3E_42
L_1389: BX = 2
L_138C: LOCATE ARGS(), BX  ' RT3E_44
L_138F: GOSUB L_20DD
L_1392: DI = &HA6F8
L_1395: SI = &HAA0A
L_1398: N_A6F8! = N_AA0A!  ' RT3F_7B
L_139B: DI = &HA6FC
L_139E: SI = &HA9FE
L_13A1: N_A6FC! = N_A9FE!  ' RT3F_7B
L_13A4: GOSUB L_07C9
L_13A7: BX = CINT(FAC!)  ' RT3F_77
L_13AA: DI = BX
L_13AC: DI = DI * (2 ^ 1)
L_13AE: DI = DI * (2 ^ 1)
L_13B0: DI = DI + &H1850
L_13B4: SI = &HAA02
L_13B7: N(DI) = N_AA02!  ' RT3F_7B
L_13BA: DI = &H4F6C
L_13BD: SI = &HA9FE
L_13C0: FAC! = N_A9FE! + N_4F6C!  ' RT3F_7F
L_13C3: DI = &HA9FE
L_13C6: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_13C9: SI = DI
L_13CB: DI = &HA5CC
L_13CE: CompareLeft! = N_A9FE!: CompareRight! = N_A5CC!  ' RT3F_9F
L_13D1: IF CompareLeft! > CompareRight! THEN GOTO L_13D6  ' flags from L_13CE
L_13D3: GOTO L_1110
L_13D6: GOSUB L_646D
L_13D9: GOTO L_1779
L_13DC: DI = &HAA48
L_13DF: SI = &HA66E
L_13E2: N_AA48! = N_A66E!  ' RT3F_7B
L_13E5: SI = &HA6EC
L_13E8: FAC! = N_A6EC!: DI = &H001E  ' RT3F_6F
L_13EB: GOTO L_14E5
L_13EE: SI = &HA5C4
L_13F1: BX = CINT(N_A5C4!)  ' RT3F_75
L_13F4: SI = BX
L_13F6: SI = SI * (2 ^ 1)
L_13F8: SI = SI * (2 ^ 1)
L_13FA: SI = SI + &H1850
L_13FE: DI = &H4F6C
L_1401: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_1404: IF CompareLeft! = CompareRight! THEN GOTO L_1409  ' flags from L_1401
L_1406: GOTO L_14DC
L_1409: SI = &HA5C4
L_140C: BX = SI
L_140E: DX = BX
L_1410: BX = CINT(N_A5C4!)  ' RT3F_75
L_1413: DI = BX
L_1415: DI = DI * (2 ^ 1)
L_1417: DI = DI * (2 ^ 1)
L_1419: DI = DI + &H1850
L_141D: SI = &H4F94
L_1420: N(DI) = N_4F94!  ' RT3F_7B
L_1423: SI = DX
L_1425: DI = &HAA48
L_1428: N_AA48! = N_A5C4!  ' RT3F_7B
L_142B: DI = &HAA50
L_142E: FAC! = N_A5C4! * N_AA50!  ' RT3F_8F
L_1431: DI = &HAA54
L_1434: FAC! = FAC! + N_AA54!  ' RT3F_81
L_1437: DI = &HAA4C
L_143A: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_143D: DI = DX
L_143F: SI = &HAA58
L_1442: N(DI) = N_AA58!  ' RT3F_7B
L_1445: GOSUB L_2352
L_1448: BX = &H11
L_144B: ARGPUSH BX  ' RT3E_42
L_144E: BX = 2
L_1451: LOCATE ARGS(), BX  ' RT3E_44
L_1454: ' PRINT statement begins (screen) ; RT3F_BC
L_1457: DX = BX
L_1459: BX = &HAA5C
L_145C: PRINT S_AA5C$  ' RT3F_6E; H newline item, ledger correction
L_145F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1462: ARGPUSH OMITTED  ' RT3E_43
L_1465: BX = DX
L_1467: LOCATE ARGS(), BX  ' RT3E_44
L_146A: ' PRINT statement begins (screen) ; RT3F_BC
L_146D: BX = &HAA86
L_1470: PRINT S_AA86$  ' RT3F_6E; H newline item, ledger correction
L_1473: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1476: BX = &H13
L_1479: ARGPUSH BX  ' RT3E_42
L_147C: BX = DX
L_147E: LOCATE ARGS(), BX  ' RT3E_44
L_1481: ' PRINT statement begins (screen) ; RT3F_BC
L_1484: BX = &HAAAC
L_1487: PRINT S_AAAC$  ' RT3F_6E; H newline item, ledger correction
L_148A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_148D: BX = &H15
L_1490: ARGPUSH BX  ' RT3E_42
L_1493: BX = 2
L_1496: LOCATE ARGS(), BX  ' RT3E_44
L_1499: ' PRINT statement begins (screen) ; RT3F_BC
L_149C: DX = BX
L_149E: BX = &HAACA
L_14A1: PRINT S_AACA$  ' RT3F_6E; H newline item, ledger correction
L_14A4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_14A7: BX = &H16
L_14AA: ARGPUSH BX  ' RT3E_42
L_14AD: BX = DX
L_14AF: LOCATE ARGS(), BX  ' RT3E_44
L_14B2: ' PRINT statement begins (screen) ; RT3F_BC
L_14B5: BX = &HAAFA
L_14B8: PRINT S_AAFA$;  ' RT3F_6A
L_14BB: BX = &HAA4C
L_14BE: PRINT N_AA4C!;  ' RT3F_67; H expanded ledger
L_14C1: BX = &HAAEE
L_14C4: PRINT S_AAEE$  ' RT3F_6E; H newline item, ledger correction
L_14C7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_14CA: GOSUB L_1E98
L_14CD: BX = &H18
L_14D0: ARGPUSH BX  ' RT3E_42
L_14D3: BX = 2
L_14D6: LOCATE ARGS(), BX  ' RT3E_44
L_14D9: GOSUB L_20DD
L_14DC: DI = &H4F6C
L_14DF: SI = &HA5C4
L_14E2: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_14E5: DI = &HA5C4
L_14E8: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_14EB: SI = DI
L_14ED: DI = &HAA58
L_14F0: CompareLeft! = N_A5C4!: CompareRight! = N_AA58!  ' RT3F_9F
L_14F3: IF CompareLeft! > CompareRight! THEN GOTO L_14F8  ' flags from L_14F0
L_14F5: GOTO L_13EE
L_14F8: DI = &HAB00
L_14FB: SI = &HAA48
L_14FE: CompareLeft! = N_AA48!: CompareRight! = N_AB00!  ' RT3F_9F
L_1501: IF CompareLeft! > CompareRight! THEN GOTO L_1506  ' flags from L_14FE
L_1503: GOTO L_1509
L_1506: GOSUB L_A932
L_1509: RETURN
L_150A: GOSUB L_2352
L_150D: DI = &HA686
L_1510: SI = &HA5C4
L_1513: FAC! = N_A5C4! / N_A686!  ' RT3F_87
L_1516: BX = &H1A
L_1519: FAC! = INT(FAC!)  ' RT3D_03
L_151C: BX = SI
L_151E: FAC! = FAC! * N(DI)  ' RT3F_91
L_1521: SI = &H4F6C
L_1524: FAC! = N_4F6C! - FAC!  ' RT3F_9B
L_1527: DI = BX
L_1529: FAC! = FAC! + N(DI)  ' RT3F_81
L_152C: DI = &HAB5C
L_152F: FAC! = FAC! ^ N_AB5C!  ' RT3F_25; M ledger
L_1532: DI = &HA98C
L_1535: FAC! = FAC! * N_A98C!  ' RT3F_91
L_1538: DX = BX
L_153A: BX = &H1A
L_153D: FAC! = INT(FAC!)  ' RT3D_03
L_1540: DI = &HAA4C
L_1543: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_1546: BX = &H11
L_1549: ARGPUSH BX  ' RT3E_42
L_154C: BX = 2
L_154F: LOCATE ARGS(), BX  ' RT3E_44
L_1552: ' PRINT statement begins (screen) ; RT3F_BC
L_1555: CX = BX
L_1557: BX = &HAB04
L_155A: PRINT S_AB04$  ' RT3F_6E; H newline item, ledger correction
L_155D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1560: BX = &H12
L_1563: ARGPUSH BX  ' RT3E_42
L_1566: BX = CX
L_1568: LOCATE ARGS(), BX  ' RT3E_44
L_156B: ' PRINT statement begins (screen) ; RT3F_BC
L_156E: BX = &HAB22
L_1571: PRINT S_AB22$  ' RT3F_6E; H newline item, ledger correction
L_1574: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1577: BX = &H13
L_157A: ARGPUSH BX  ' RT3E_42
L_157D: BX = CX
L_157F: LOCATE ARGS(), BX  ' RT3E_44
L_1582: ' PRINT statement begins (screen) ; RT3F_BC
L_1585: SI = DX
L_1587: AX = DI
L_1589: DI = &HAB60
L_158C: FAC! = N(SI) + N_AB60!  ' RT3F_7F
L_158F: BX = CINT(FAC!)  ' RT3F_77
L_1592: BX = BX * (2 ^ 1)
L_1594: BX = BX * (2 ^ 1)
L_1596: BX = BX + &H46F0
L_159A: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_159D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_15A0: BX = &H15
L_15A3: ARGPUSH BX  ' RT3E_42
L_15A6: BX = CX
L_15A8: LOCATE ARGS(), BX  ' RT3E_44
L_15AB: ' PRINT statement begins (screen) ; RT3F_BC
L_15AE: BX = &HAB40
L_15B1: PRINT S_AB40$;  ' RT3F_6A
L_15B4: BX = AX
L_15B6: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_15B9: BX = &HAB50
L_15BC: PRINT S_AB50$  ' RT3F_6E; H newline item, ledger correction
L_15BF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_15C2: GOSUB L_1E98
L_15C5: BX = &H18
L_15C8: ARGPUSH BX  ' RT3E_42
L_15CB: BX = 2
L_15CE: LOCATE ARGS(), BX  ' RT3E_44
L_15D1: GOSUB L_20DD
L_15D4: RETURN
L_15D5: DI = &HAB6E
L_15D8: SI = &HA686
L_15DB: N_AB6E! = N_A686!  ' RT3F_7B
L_15DE: BX = &HAB64
L_15E1: DX = &HAB72
L_15E4: S_AB72$ = S_AB64$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_15E7: DI = SI
L_15E9: SI = &HA5C4
L_15EC: FAC! = N_A5C4! + N(DI)  ' RT3F_7F
L_15EF: BX = SI
L_15F1: DX = BX
L_15F3: BX = CINT(FAC!)  ' RT3F_77
L_15F6: SI = BX
L_15F8: SI = SI * (2 ^ 1)
L_15FA: SI = SI * (2 ^ 1)
L_15FC: SI = SI + &H1850
L_1600: DI = &HAB76
L_1603: N_AB76! = N(SI)  ' RT3F_7B
L_1606: SI = DX
L_1608: BX = CINT(N(SI))  ' RT3F_75
L_160B: SI = BX
L_160D: SI = SI * (2 ^ 1)
L_160F: SI = SI * (2 ^ 1)
L_1611: SI = SI + &H1850
L_1615: DI = &HAB7A
L_1618: N_AB7A! = N(SI)  ' RT3F_7B
L_161B: GOTO L_166E
L_161E: DI = &HAB6E
L_1621: SI = &HA9A4
L_1624: N_AB6E! = N_A9A4!  ' RT3F_7B
L_1627: BX = &HAB7E
L_162A: DX = &HAB72
L_162D: S_AB72$ = S_AB7E$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1630: DI = &HA9B8
L_1633: SI = &HA5C4
L_1636: FAC! = N_A5C4! + N_A9B8!  ' RT3F_7F
L_1639: BX = SI
L_163B: DX = BX
L_163D: BX = CINT(FAC!)  ' RT3F_77
L_1640: SI = BX
L_1642: SI = SI * (2 ^ 1)
L_1644: SI = SI * (2 ^ 1)
L_1646: SI = SI + &H1850
L_164A: DI = &HAB76
L_164D: N_AB76! = N(SI)  ' RT3F_7B
L_1650: SI = DX
L_1652: DI = &HA9B0
L_1655: FAC! = N(SI) + N_A9B0!  ' RT3F_7F
L_1658: BX = CINT(FAC!)  ' RT3F_77
L_165B: SI = BX
L_165D: SI = SI * (2 ^ 1)
L_165F: SI = SI * (2 ^ 1)
L_1661: SI = SI + &H1850
L_1665: DI = &HAB7A
L_1668: N_AB7A! = N(SI)  ' RT3F_7B
L_166B: GOTO L_166E
L_166E: DI = &HAB8C
L_1671: SI = &HAB76
L_1674: N_AB8C! = N_AB76!  ' RT3F_7B
L_1677: CompareLeft! = N_AB76!: CompareRight! = 0  ' RT3F_A7
L_167A: IF CompareLeft! < CompareRight! THEN GOTO L_167F  ' flags from L_1677
L_167C: GOTO L_1685
L_167F: SI = &HAB90
L_1682: N(DI) = N_AB90!  ' RT3F_7B
L_1685: DI = &HA70C
L_1688: SI = &HAB7A
L_168B: FAC! = N_AB7A! + N_A70C!  ' RT3F_7F
L_168E: BX = &H1A
L_1691: FAC! = INT(FAC!)  ' RT3D_03
L_1694: DI = &HA854
L_1697: CompareLeft! = FAC!: CompareRight! = N_A854!  ' RT3F_A1
L_169A: IF CompareLeft! = CompareRight! THEN GOTO L_169F  ' flags from L_1697
L_169C: GOTO L_16B3
L_169F: DI = &HAB94
L_16A2: SI = &HAB6E
L_16A5: FAC! = N_AB6E! * N_AB94!  ' RT3F_8F
L_16A8: BX = &H1A
L_16AB: FAC! = INT(FAC!)  ' RT3D_03
L_16AE: DI = SI
L_16B0: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_16B3: GOSUB L_2352
L_16B6: BX = &H11
L_16B9: ARGPUSH BX  ' RT3E_42
L_16BC: BX = 2
L_16BF: LOCATE ARGS(), BX  ' RT3E_44
L_16C2: ' PRINT statement begins (screen) ; RT3F_BC
L_16C5: DX = BX
L_16C7: BX = &HAB98
L_16CA: PRINT S_AB98$;  ' RT3F_6A
L_16CD: BX = &HAB72
L_16D0: PRINT S_AB72$  ' RT3F_6E; H newline item, ledger correction
L_16D3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_16D6: BX = &H12
L_16D9: ARGPUSH BX  ' RT3E_42
L_16DC: BX = DX
L_16DE: LOCATE ARGS(), BX  ' RT3E_44
L_16E1: ' PRINT statement begins (screen) ; RT3F_BC
L_16E4: BX = &HABDE
L_16E7: PRINT S_ABDE$;  ' RT3F_6A
L_16EA: SI = &HAB7A
L_16ED: BX = CINT(N_AB7A!)  ' RT3F_75
L_16F0: BX = BX * (2 ^ 1)
L_16F2: BX = BX * (2 ^ 1)
L_16F4: BX = BX + &H47B8
L_16F8: PRINT S(BX);  ' RT3F_6A
L_16FB: BX = &HABAC
L_16FE: PRINT S_ABAC$  ' RT3F_6E; H newline item, ledger correction
L_1701: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1704: BX = &H13
L_1707: ARGPUSH BX  ' RT3E_42
L_170A: BX = DX
L_170C: LOCATE ARGS(), BX  ' RT3E_44
L_170F: ' PRINT statement begins (screen) ; RT3F_BC
L_1712: BX = &HABB6
L_1715: PRINT S_ABB6$;  ' RT3F_6A
L_1718: SI = &HAB76
L_171B: FAC! = ABS(N_AB76!)  ' RT3F_2B
L_171E: BX = &H1A
L_1721: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_1724: BX = &HABE4
L_1727: PRINT S_ABE4$  ' RT3F_6E; H newline item, ledger correction
L_172A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_172D: BX = &H14
L_1730: ARGPUSH BX  ' RT3E_42
L_1733: BX = DX
L_1735: LOCATE ARGS(), BX  ' RT3E_44
L_1738: ' PRINT statement begins (screen) ; RT3F_BC
L_173B: BX = &HABC2
L_173E: PRINT S_ABC2$;  ' RT3F_6A
L_1741: DI = &HAB8C
L_1744: SI = &HAB6E
L_1747: FAC! = N_AB6E! * N_AB8C!  ' RT3F_8F
L_174A: BX = &H1A
L_174D: T_00! = FAC!  ' RT3F_71; inline=&H80
L_1751: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_1754: BX = &HABD2
L_1757: PRINT S_ABD2$  ' RT3F_6E; H newline item, ledger correction
L_175A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_175D: DI = &HAA4C
L_1760: SI = &HA87C
L_1763: N_AA4C! = N_A87C!  ' RT3F_7B
L_1766: GOSUB L_1E98
L_1769: BX = &H18
L_176C: ARGPUSH BX  ' RT3E_42
L_176F: BX = 2
L_1772: LOCATE ARGS(), BX  ' RT3E_44
L_1775: GOSUB L_20DD
L_1778: RETURN
L_1779: SI = &H1D38
L_177C: CompareLeft! = N_1D38!: CompareRight! = 0  ' RT3F_A7
L_177F: IF CompareLeft! <> CompareRight! THEN GOTO L_1784  ' flags from L_177C
L_1781: GOTO L_183E
L_1784: DI = &H1D38
L_1787: SI = &H1D2C
L_178A: FAC! = N_1D2C! - N_1D38!  ' RT3F_97
L_178D: DI = &H4F6C
L_1790: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_1793: DI = &HABEC
L_1796: N_ABEC! = FAC!: SI = &H001A  ' RT3F_7D
L_1799: SI = DI
L_179B: CompareLeft! = N_ABEC!: CompareRight! = 0  ' RT3F_A7
L_179E: IF CompareLeft! < CompareRight! THEN GOTO L_17A3  ' flags from L_179B
L_17A0: GOTO L_17AE
L_17A3: DI = &HA85C
L_17A6: FAC! = N(SI) + N_A85C!  ' RT3F_7F
L_17A9: DI = SI
L_17AB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_17AE: DI = &HABEC
L_17B1: SI = &H1D2C
L_17B4: CompareLeft! = N_1D2C!: CompareRight! = N_ABEC!  ' RT3F_9F
L_17B7: IF CompareLeft! >= CompareRight! THEN GOTO L_17BC  ' flags from L_17B4
L_17B9: GOTO L_17EB
L_17BC: BX = DI
L_17BE: DI = &HABF0
L_17C1: N_ABF0! = N(SI)  ' RT3F_7B
L_17C4: SI = BX
L_17C6: FAC! = N(SI): DI = &H001E  ' RT3F_6F
L_17C9: GOTO L_17D8
L_17CC: GOSUB L_161E
L_17CF: DI = &H4F6C
L_17D2: SI = &HA5C4
L_17D5: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_17D8: DI = &HA5C4
L_17DB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_17DE: SI = DI
L_17E0: DI = &HABF0
L_17E3: CompareLeft! = N_A5C4!: CompareRight! = N_ABF0!  ' RT3F_9F
L_17E6: IF CompareLeft! <= CompareRight! THEN GOTO L_17CC  ' flags from L_17E3
L_17E8: GOTO L_183E
L_17EB: SI = &HABEC
L_17EE: FAC! = N_ABEC!: DI = &H001E  ' RT3F_6F
L_17F1: GOTO L_1800
L_17F4: GOSUB L_161E
L_17F7: DI = &H4F6C
L_17FA: SI = &HA5C4
L_17FD: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_1800: DI = &HA5C4
L_1803: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_1806: SI = DI
L_1808: DI = &HA68E
L_180B: CompareLeft! = N_A5C4!: CompareRight! = N_A68E!  ' RT3F_9F
L_180E: IF CompareLeft! <= CompareRight! THEN GOTO L_17F4  ' flags from L_180B
L_1810: DI = &HABF4
L_1813: SI = &H1D2C
L_1816: N_ABF4! = N_1D2C!  ' RT3F_7B
L_1819: SI = &HA66E
L_181C: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_181F: GOTO L_182E
L_1822: GOSUB L_161E
L_1825: DI = &H4F6C
L_1828: SI = &HA5C4
L_182B: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_182E: DI = &HA5C4
L_1831: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_1834: SI = DI
L_1836: DI = &HABF4
L_1839: CompareLeft! = N_A5C4!: CompareRight! = N_ABF4!  ' RT3F_9F
L_183C: IF CompareLeft! <= CompareRight! THEN GOTO L_1822  ' flags from L_1839
L_183E: DI = &H1D38
L_1841: SI = &HA66E
L_1844: N_1D38! = N_A66E!  ' RT3F_7B
L_1847: SI = &HA998
L_184A: FAC! = N_A998!: DI = &H001E  ' RT3F_6F
L_184D: GOTO L_1899
L_1850: DI = &HA686
L_1853: SI = &HA5C4
L_1856: FAC! = N_A5C4! + N_A686!  ' RT3F_7F
L_1859: BX = CINT(FAC!)  ' RT3F_77
L_185C: SI = BX
L_185E: SI = SI * (2 ^ 1)
L_1860: SI = SI * (2 ^ 1)
L_1862: SI = SI + &H1850
L_1866: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_1869: IF CompareLeft! <> CompareRight! THEN GOTO L_186E  ' flags from L_1866
L_186B: GOTO L_1871
L_186E: GOSUB L_15D5
L_1871: DI = &HA686
L_1874: SI = &HA5C4
L_1877: FAC! = N_A5C4! + N_A686!  ' RT3F_7F
L_187A: BX = SI
L_187C: DX = BX
L_187E: BX = CINT(FAC!)  ' RT3F_77
L_1881: DI = BX
L_1883: DI = DI * (2 ^ 1)
L_1885: DI = DI * (2 ^ 1)
L_1887: DI = DI + &H1850
L_188B: SI = &HA984
L_188E: N(DI) = N_A984!  ' RT3F_7B
L_1891: SI = DX
L_1893: DI = &H4F6C
L_1896: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_1899: DI = &HA5C4
L_189C: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_189F: SI = DI
L_18A1: DI = &HA99C
L_18A4: CompareLeft! = N_A5C4!: CompareRight! = N_A99C!  ' RT3F_9F
L_18A7: IF CompareLeft! <= CompareRight! THEN GOTO L_1850  ' flags from L_18A4
L_18A9: SI = &HABF8
L_18AC: FAC! = N_ABF8!: DI = &H001E  ' RT3F_6F
L_18AF: GOTO L_18E1
L_18B2: SI = &HA5C4
L_18B5: BX = CINT(N_A5C4!)  ' RT3F_75
L_18B8: SI = BX
L_18BA: SI = SI * (2 ^ 1)
L_18BC: SI = SI * (2 ^ 1)
L_18BE: SI = SI + &H1850
L_18C2: DI = &H4F6C
L_18C5: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_18C8: IF CompareLeft! = CompareRight! THEN GOTO L_18CD  ' flags from L_18C5
L_18CA: GOTO L_18D8
L_18CD: DI = SI
L_18CF: SI = &H4F94
L_18D2: N(DI) = N_4F94!  ' RT3F_7B
L_18D5: GOSUB L_150A
L_18D8: DI = &H4F6C
L_18DB: SI = &HA5C4
L_18DE: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_18E1: DI = &HA5C4
L_18E4: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_18E7: SI = DI
L_18E9: DI = &HABFC
L_18EC: CompareLeft! = N_A5C4!: CompareRight! = N_ABFC!  ' RT3F_9F
L_18EF: IF CompareLeft! <= CompareRight! THEN GOTO L_18B2  ' flags from L_18EC
L_18F1: SI = &HA9D0
L_18F4: FAC! = N_A9D0!: DI = &H001E  ' RT3F_6F
L_18F7: GOTO L_1BED
L_18FA: SI = &HA5C4
L_18FD: BX = CINT(N_A5C4!)  ' RT3F_75
L_1900: SI = BX
L_1902: SI = SI * (2 ^ 1)
L_1904: SI = SI * (2 ^ 1)
L_1906: SI = SI + &H1850
L_190A: DI = &H4F94
L_190D: CompareLeft! = N(SI): CompareRight! = N_4F94!  ' RT3F_9F
L_1910: IF CompareLeft! = CompareRight! THEN GOTO L_1915  ' flags from L_190D
L_1912: GOTO L_1BE4
L_1915: SI = &HA5C4
L_1918: BX = CINT(N_A5C4!)  ' RT3F_75
L_191B: DI = BX
L_191D: DI = DI * (2 ^ 1)
L_191F: DI = DI * (2 ^ 1)
L_1921: DI = DI + &H1850
L_1925: SI = &HA5C0
L_1928: N(DI) = N_A5C0!  ' RT3F_7B
L_192B: GOSUB L_2352
L_192E: DI = &HAC4C
L_1931: SI = &HA5C4
L_1934: FAC! = N_A5C4! + N_AC4C!  ' RT3F_7F
L_1937: DI = &HA5C0
L_193A: FAC! = FAC! / N_A5C0!  ' RT3F_89
L_193D: BX = &H1A
L_1940: FAC! = INT(FAC!)  ' RT3D_03
L_1943: DI = &HAC50
L_1946: FAC! = FAC! * N_AC50!  ' RT3F_91
L_1949: DI = &HAA4C
L_194C: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_194F: BX = &H13
L_1952: ARGPUSH BX  ' RT3E_42
L_1955: BX = 2
L_1958: LOCATE ARGS(), BX  ' RT3E_44
L_195B: ' PRINT statement begins (screen) ; RT3F_BC
L_195E: DX = BX
L_1960: BX = &HAC00
L_1963: PRINT S_AC00$  ' RT3F_6E; H newline item, ledger correction
L_1966: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1969: BX = &H14
L_196C: ARGPUSH BX  ' RT3E_42
L_196F: BX = DX
L_1971: LOCATE ARGS(), BX  ' RT3E_44
L_1974: ' PRINT statement begins (screen) ; RT3F_BC
L_1977: BX = &HAC28
L_197A: PRINT S_AC28$;  ' RT3F_6A
L_197D: BX = DI
L_197F: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_1982: BX = &HAC40
L_1985: PRINT S_AC40$  ' RT3F_6E; H newline item, ledger correction
L_1988: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_198B: GOSUB L_1E98
L_198E: BX = &H18
L_1991: ARGPUSH BX  ' RT3E_42
L_1994: BX = 2
L_1997: LOCATE ARGS(), BX  ' RT3E_44
L_199A: GOSUB L_20DD
L_199D: GOSUB L_13DC
L_19A0: DI = &H3ACC
L_19A3: SI = &H3AB8
L_19A6: FAC! = N_3AB8! - N_3ACC!  ' RT3F_97
L_19A9: DI = &HA9FA
L_19AC: FAC! = FAC! * N_A9FA!  ' RT3F_91
L_19AF: DI = &H3AD4
L_19B2: FAC! = FAC! - N_3AD4!  ' RT3F_99
L_19B5: DI = &H3AC0
L_19B8: FAC! = FAC! + N_3AC0!  ' RT3F_81
L_19BB: DI = &HA9F6
L_19BE: N_A9F6! = FAC!: SI = &H001A  ' RT3F_7D
L_19C1: SI = DI
L_19C3: DI = &HAC54
L_19C6: N_AC54! = N_A9F6!  ' RT3F_7B
L_19C9: SI = DI
L_19CB: DI = &HAA12
L_19CE: CompareLeft! = N_AC54!: CompareRight! = N_AA12!  ' RT3F_9F
L_19D1: IF CompareLeft! > CompareRight! THEN GOTO L_19D6  ' flags from L_19CE
L_19D3: GOTO L_19DB
L_19D6: SWAP DI, SI
L_19D8: N(DI) = N(SI)  ' RT3F_7B
L_19DB: SI = &H4F6C
L_19DE: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_19E1: GOTO L_1BAD
L_19E4: DI = &HA6E4
L_19E7: SI = &HA66E
L_19EA: N_A6E4! = N_A66E!  ' RT3F_7B
L_19ED: DI = &HA6E8
L_19F0: BX = SI
L_19F2: SI = &HA9FE
L_19F5: N_A6E8! = N_A9FE!  ' RT3F_7B
L_19F8: GOSUB L_0797
L_19FB: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_19FE: IF CompareLeft! <> CompareRight! THEN GOTO L_1A03  ' flags from L_19FB
L_1A00: GOTO L_1BA4
L_1A03: GOSUB L_2352
L_1A06: DI = &HA6E4
L_1A09: SI = &HA864
L_1A0C: N_A6E4! = N_A864!  ' RT3F_7B
L_1A0F: DI = &HA6E8
L_1A12: SI = &HA9FE
L_1A15: N_A6E8! = N_A9FE!  ' RT3F_7B
L_1A18: GOSUB L_0797
L_1A1B: DI = &HAC66
L_1A1E: N_AC66! = FAC!: SI = &H001A  ' RT3F_7D
L_1A21: BX = &H11
L_1A24: ARGPUSH BX  ' RT3E_42
L_1A27: BX = 2
L_1A2A: LOCATE ARGS(), BX  ' RT3E_44
L_1A2D: ' PRINT statement begins (screen) ; RT3F_BC
L_1A30: SI = DI
L_1A32: BX = CINT(N(SI))  ' RT3F_75
L_1A35: BX = BX * (2 ^ 1)
L_1A37: BX = BX * (2 ^ 1)
L_1A39: DX = BX
L_1A3B: BX = BX + &H42AC
L_1A3F: PRINT S(BX);  ' RT3F_6A
L_1A42: BX = &HAC6A
L_1A45: PRINT S_AC6A$;  ' RT3F_6A
L_1A48: SI = &HA9FE
L_1A4B: BX = CINT(N_A9FE!)  ' RT3F_75
L_1A4E: BX = BX * (2 ^ 1)
L_1A50: BX = BX * (2 ^ 1)
L_1A52: BX = BX + &H4288
L_1A56: PRINT S(BX);  ' RT3F_6A
L_1A59: BX = &HAC58
L_1A5C: PRINT S_AC58$  ' RT3F_6E; H newline item, ledger correction
L_1A5F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1A62: DX = DX + &H51F6
L_1A66: SI = DX
L_1A68: DI = &HAC54
L_1A6B: FAC! = N(SI) * N_AC54!  ' RT3F_8F
L_1A6E: DI = &HAC70
L_1A71: FAC! = FAC! / N_AC70!  ' RT3F_89
L_1A74: BX = &H1A
L_1A77: FAC! = INT(FAC!)  ' RT3D_03
L_1A7A: DI = &HAA4C
L_1A7D: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_1A80: BX = &H12
L_1A83: ARGPUSH BX  ' RT3E_42
L_1A86: BX = 2
L_1A89: LOCATE ARGS(), BX  ' RT3E_44
L_1A8C: ' PRINT statement begins (screen) ; RT3F_BC
L_1A8F: BX = &HAA4C
L_1A92: PRINT N_AA4C!;  ' RT3F_67; H expanded ledger
L_1A95: BX = &HAC74
L_1A98: PRINT S_AC74$  ' RT3F_6E; H newline item, ledger correction
L_1A9B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1A9E: GOSUB L_1E98
L_1AA1: FAC! = RND  ' RT3D_34
L_1AA4: DI = &HA6EC
L_1AA7: FAC! = FAC! * N_A6EC!  ' RT3F_91
L_1AAA: DI = &HAC66
L_1AAD: SI = &HA9A4
L_1AB0: T_00! = FAC!  ' RT3F_71; inline=&H80
L_1AB4: FAC! = N(SI) - N(DI)  ' RT3F_97
L_1AB7: BX = DI
L_1AB9: CompareLeft! = T_00!: CompareRight! = FAC!  ' RT3F_A5; inline=&H80
L_1ABD: DX = 0
L_1AC0: IF CompareLeft! >= CompareRight! THEN GOTO L_1AC3  ' flags from L_1AB9
L_1AC2: DX = DX - 1
L_1AC3: SI = BX
L_1AC5: DI = &HA66A
L_1AC8: CompareLeft! = N(SI): CompareRight! = N_A66A!  ' RT3F_9F
L_1ACB: CX = 0
L_1ACE: IF CompareLeft! >= CompareRight! THEN GOTO L_1AD1  ' flags from L_1AC8
L_1AD0: CX = CX - 1
L_1AD1: CX = CX AND DX
L_1AD3: CompareLeft% = CX: CompareRight% = 0
L_1AD5: IF CompareLeft% <> CompareRight% THEN GOTO L_1ADA  ' flags from L_1AD3
L_1AD7: GOTO L_1B4B
L_1ADA: BX = &H14
L_1ADD: ARGPUSH BX  ' RT3E_42
L_1AE0: BX = 2
L_1AE3: LOCATE ARGS(), BX  ' RT3E_44
L_1AE6: ' PRINT statement begins (screen) ; RT3F_BC
L_1AE9: DX = BX
L_1AEB: BX = &HAC86
L_1AEE: PRINT S_AC86$  ' RT3F_6E; H newline item, ledger correction
L_1AF1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1AF4: BX = &H15
L_1AF7: ARGPUSH BX  ' RT3E_42
L_1AFA: BX = DX
L_1AFC: LOCATE ARGS(), BX  ' RT3E_44
L_1AFF: ' PRINT statement begins (screen) ; RT3F_BC
L_1B02: BX = &HACA6
L_1B05: PRINT S_ACA6$;  ' RT3F_6A
L_1B08: DI = &H4F6C
L_1B0B: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_1B0E: T_01! = FAC!  ' RT3F_71; inline=&H81
L_1B12: BX = CINT(FAC!)  ' RT3F_77
L_1B15: BX = BX * (2 ^ 1)
L_1B17: BX = BX * (2 ^ 1)
L_1B19: BX = BX + &H42AC
L_1B1D: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_1B20: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1B23: DI = &HA6F8
L_1B26: SI = &HA864
L_1B29: N_A6F8! = N_A864!  ' RT3F_7B
L_1B2C: DI = &HA6FC
L_1B2F: SI = &HA9FE
L_1B32: N_A6FC! = N_A9FE!  ' RT3F_7B
L_1B35: GOSUB L_07C9
L_1B38: BX = CINT(FAC!)  ' RT3F_77
L_1B3B: DI = BX
L_1B3D: DI = DI * (2 ^ 1)
L_1B3F: DI = DI * (2 ^ 1)
L_1B41: DI = DI + &H1850
L_1B45: SI = &HA884
L_1B48: N(DI) = N_A884!  ' RT3F_7B
L_1B4B: BX = &H18
L_1B4E: ARGPUSH BX  ' RT3E_42
L_1B51: BX = 2
L_1B54: LOCATE ARGS(), BX  ' RT3E_44
L_1B57: GOSUB L_20DD
L_1B5A: DI = &HA6F8
L_1B5D: SI = &HA854
L_1B60: N_A6F8! = N_A854!  ' RT3F_7B
L_1B63: DI = &HA6FC
L_1B66: BX = SI
L_1B68: SI = &HA9FE
L_1B6B: N_A6FC! = N_A9FE!  ' RT3F_7B
L_1B6E: GOSUB L_07C9
L_1B71: BX = CINT(FAC!)  ' RT3F_77
L_1B74: DI = BX
L_1B76: DI = DI * (2 ^ 1)
L_1B78: DI = DI * (2 ^ 1)
L_1B7A: DI = DI + &H1850
L_1B7E: BX = DI
L_1B80: DI = &HA6E4
L_1B83: SI = &HA854
L_1B86: N_A6E4! = N_A854!  ' RT3F_7B
L_1B89: DI = &HA6E8
L_1B8C: SI = &HA9FE
L_1B8F: N_A6E8! = N_A9FE!  ' RT3F_7B
L_1B92: WORD(BP - 6) = BX
L_1B95: GOSUB L_0797
L_1B98: DI = &H4F6C
L_1B9B: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_1B9E: DI = WORD(BP - 6)
L_1BA1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1BA4: DI = &H4F6C
L_1BA7: SI = &HA9FE
L_1BAA: FAC! = N_A9FE! + N_4F6C!  ' RT3F_7F
L_1BAD: DI = &HA9FE
L_1BB0: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_1BB3: SI = DI
L_1BB5: DI = &HA5CC
L_1BB8: CompareLeft! = N_A9FE!: CompareRight! = N_A5CC!  ' RT3F_9F
L_1BBB: IF CompareLeft! > CompareRight! THEN GOTO L_1BC0  ' flags from L_1BB8
L_1BBD: GOTO L_19E4
L_1BC0: DI = &HA5C4
L_1BC3: SI = &HABFC
L_1BC6: N_A5C4! = N_ABFC!  ' RT3F_7B
L_1BC9: DI = &H3ACC
L_1BCC: SI = &H3AB8
L_1BCF: N_3ACC! = N_3AB8!  ' RT3F_7B
L_1BD2: DI = &H3AD4
L_1BD5: SI = &H3AC0
L_1BD8: N_3AD4! = N_3AC0!  ' RT3F_7B
L_1BDB: DI = &H1D30
L_1BDE: SI = &HACB4
L_1BE1: N_1D30! = N_ACB4!  ' RT3F_7B
L_1BE4: DI = &H4F6C
L_1BE7: SI = &HA5C4
L_1BEA: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_1BED: DI = &HA5C4
L_1BF0: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_1BF3: SI = DI
L_1BF5: DI = &HA9D8
L_1BF8: CompareLeft! = N_A5C4!: CompareRight! = N_A9D8!  ' RT3F_9F
L_1BFB: IF CompareLeft! > CompareRight! THEN GOTO L_1C00  ' flags from L_1BF8
L_1BFD: GOTO L_18FA

```

### Starport overview and selection

```basic
L_1C00: GOSUB L_13DC
L_1C03: GOSUB L_646D
L_1C06: GOTO L_234F
L_1C09: BX = &HFFFF
L_1C0C: CLS BX  ' RT3E_32
L_1C0F: BX = 0
L_1C11: KEY BX  ' RT3E_3C
L_1C14: BX = 1
L_1C17: DX = 2
L_1C1A: CX = 0
L_1C1C: AX = CX
L_1C1E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1C21: BX = &H13E
L_1C24: DX = &HC5
L_1C27: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1C2A: DX = AX
L_1C2C: BX = &HFFFF
L_1C2F: CX = BX
L_1C31: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1C34: BX = 5
L_1C37: DX = &H75
L_1C3A: CX = 0
L_1C3C: AX = CX
L_1C3E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1C41: BX = &H13A
L_1C44: DX = &HC2
L_1C47: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1C4A: DX = AX
L_1C4C: BX = &HFFFF
L_1C4F: CX = BX
L_1C51: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1C54: BX = 2
L_1C57: ARGPUSH BX  ' RT3E_42
L_1C5A: BX = 7
L_1C5D: LOCATE ARGS(), BX  ' RT3E_44
L_1C60: ' PRINT statement begins (screen) ; RT3F_BC
L_1C63: BX = &HACB8
L_1C66: PRINT S_ACB8$;  ' RT3F_6A
L_1C69: SI = &HA4E4
L_1C6C: BX = CINT(N_A4E4!)  ' RT3F_75
L_1C6F: BX = BX * (2 ^ 1)
L_1C71: BX = BX * (2 ^ 1)
L_1C73: BX = BX + &HA6A6
L_1C77: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_1C7A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1C7D: BX = &H30
L_1C80: DX = 8
L_1C83: CX = 0
L_1C85: AX = CX
L_1C87: Get1X! = COORD(BX,CX): Get1Y! = COORD(DX,AX)  ' RT3E_87
L_1C8A: BX = &HDC
L_1C8D: DX = &HF
L_1C90: Get2X! = COORD(BX,CX): Get2Y! = COORD(DX,AX)  ' RT3E_88
L_1C93: BX = &H4926
L_1C96: DX = &H646
L_1C99: GET (Get1X!,Get1Y!)-(Get2X!,Get2Y!), MEMORY(BX), CAPACITY(DX)  ' RT3E_3A
L_1C9C: BX = 5
L_1C9F: DX = BX
L_1CA1: CX = 0
L_1CA3: AX = CX
L_1CA5: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1CA8: BX = &HE2
L_1CAB: DX = &H72
L_1CAE: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1CB1: DX = AX
L_1CB3: BX = &HFFFF
L_1CB6: CX = BX
L_1CB8: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1CBB: CX = AX
L_1CBD: BX = 5
L_1CC0: DX = &H11
L_1CC3: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1CC6: BX = &HE2
L_1CC9: DX = 6
L_1CCC: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1CCF: BX = &HFFFF
L_1CD2: DX = 1
L_1CD5: CX = BX
L_1CD7: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1CDA: BX = &HE6
L_1CDD: DX = 5
L_1CE0: CX = 0
L_1CE2: AX = CX
L_1CE4: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1CE7: BX = &H13A
L_1CEA: DX = &H1B
L_1CED: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1CF0: DX = AX
L_1CF2: BX = &HFFFF
L_1CF5: CX = BX
L_1CF7: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1CFA: CX = AX
L_1CFC: BX = &HE7
L_1CFF: DX = 6
L_1D02: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1D05: BX = &H139
L_1D08: DX = &H1A
L_1D0B: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1D0E: DX = AX
L_1D10: BX = &HFFFF
L_1D13: CX = BX
L_1D15: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1D18: BX = &HE6
L_1D1B: DX = &H1E
L_1D1E: CX = 0
L_1D20: AX = CX
L_1D22: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1D25: BX = &H13A
L_1D28: DX = &H72
L_1D2B: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1D2E: DX = AX
L_1D30: BX = &HFFFF
L_1D33: CX = BX
L_1D35: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1D38: BX = &HE8
L_1D3B: DX = 7
L_1D3E: CX = 0
L_1D40: AX = CX
L_1D42: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1D45: BX = &H40F4
L_1D48: DX = 4
L_1D4B: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1D4E: BX = &H30
L_1D51: DX = 8
L_1D54: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1D57: BX = &H4926
L_1D5A: DX = 2
L_1D5D: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1D60: BX = 2
L_1D63: DX = 3
L_1D66: CX = 0
L_1D68: AX = CX
L_1D6A: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1D6D: BX = &H13D
L_1D70: DX = 4
L_1D73: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1D76: BX = 1
L_1D79: DX = 1
L_1D7C: CX = &HFFFF
L_1D7F: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1D82: CX = AX
L_1D84: BX = &HE6
L_1D87: DX = &H1C
L_1D8A: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1D8D: BX = &H13A
L_1D90: DX = &H1D
L_1D93: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1D96: BX = 1
L_1D99: DX = 1
L_1D9C: CX = &HFFFF
L_1D9F: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1DA2: CX = AX
L_1DA4: BX = 2
L_1DA7: DX = &H73
L_1DAA: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1DAD: BX = &H13D
L_1DB0: DX = &H74
L_1DB3: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1DB6: BX = 1
L_1DB9: DX = 1
L_1DBC: CX = &HFFFF
L_1DBF: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1DC2: BX = 2
L_1DC5: DX = &HC3
L_1DC8: CX = 0
L_1DCA: AX = CX
L_1DCC: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1DCF: BX = &H13D
L_1DD2: DX = &HC4
L_1DD5: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1DD8: BX = 1
L_1DDB: DX = 1
L_1DDE: CX = &HFFFF
L_1DE1: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1DE4: BX = 2
L_1DE7: DX = 5
L_1DEA: CX = 0
L_1DEC: AX = CX
L_1DEE: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1DF1: BX = 4
L_1DF4: DX = &HC2
L_1DF7: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1DFA: BX = 1
L_1DFD: DX = 1
L_1E00: CX = &HFFFF
L_1E03: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1E06: CX = AX
L_1E08: BX = &HE3
L_1E0B: DX = 5
L_1E0E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1E11: BX = &HE5
L_1E14: DX = &H72
L_1E17: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1E1A: BX = 1
L_1E1D: DX = 1
L_1E20: CX = &HFFFF
L_1E23: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1E26: CX = AX
L_1E28: BX = &H13B
L_1E2B: DX = 5
L_1E2E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_1E31: BX = &H13D
L_1E34: DX = &HC2
L_1E37: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_1E3A: BX = 1
L_1E3D: DX = 1
L_1E40: CX = &HFFFF
L_1E43: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_1E46: GOSUB L_646D
L_1E49: RETURN
L_1E4A: DI = &HA6E0
L_1E4D: SI = &H19B0
L_1E50: FAC! = N_19B0! * N_A6E0!  ' RT3F_8F
L_1E53: DI = &HACC6
L_1E56: N_ACC6! = FAC!: SI = &H001A  ' RT3F_7D
L_1E59: SI = &H4F6C
L_1E5C: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_1E5F: GOTO L_1E6B
L_1E62: DI = &H4F6C
L_1E65: SI = &HACCA
L_1E68: FAC! = N_ACCA! + N_4F6C!  ' RT3F_7F
L_1E6B: DI = &HACCA
L_1E6E: N_ACCA! = FAC!: SI = &H001A  ' RT3F_7D
L_1E71: SI = DI
L_1E73: DI = &HACC6
L_1E76: CompareLeft! = N_ACCA!: CompareRight! = N_ACC6!  ' RT3F_9F
L_1E79: IF CompareLeft! <= CompareRight! THEN GOTO L_1E62  ' flags from L_1E76
L_1E7B: RETURN
L_1E7C: BX = &H18
L_1E7F: ARGPUSH BX  ' RT3E_42
L_1E82: BX = 2
L_1E85: LOCATE ARGS(), BX  ' RT3E_44
L_1E88: ' PRINT statement begins (screen) ; RT3F_BC
L_1E8B: BX = &HACCE
L_1E8E: PRINT S_ACCE$;  ' RT3F_6A
L_1E91: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1E94: GOSUB L_22C4
L_1E97: RETURN
L_1E98: DI = &HA708
L_1E9B: SI = &H1988
L_1E9E: FAC! = N_1988! * N_A708!  ' RT3F_8F
L_1EA1: DI = &H198C
L_1EA4: FAC! = FAC! + N_198C!  ' RT3F_81
L_1EA7: DI = &HAA4C
L_1EAA: FAC! = FAC! + N_AA4C!  ' RT3F_81
L_1EAD: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1EB0: SI = DI
L_1EB2: DI = &HACE0
L_1EB5: CompareLeft! = N(SI): CompareRight! = N_ACE0!  ' RT3F_9F
L_1EB8: IF CompareLeft! > CompareRight! THEN GOTO L_1EBD  ' flags from L_1EB5
L_1EBA: GOTO L_1EC2
L_1EBD: SWAP DI, SI
L_1EBF: N(DI) = N(SI)  ' RT3F_7B
L_1EC2: DI = &HA708
L_1EC5: SI = &HAA4C
L_1EC8: FAC! = N_AA4C! / N_A708!  ' RT3F_87
L_1ECB: BX = &H1A
L_1ECE: FAC! = INT(FAC!)  ' RT3D_03
L_1ED1: BX = DI
L_1ED3: DI = &HACE4
L_1ED6: DX = SI
L_1ED8: N_ACE4! = FAC!: SI = &H001A  ' RT3F_7D
L_1EDB: SI = DI
L_1EDD: DI = &H1988
L_1EE0: N_1988! = N_ACE4!  ' RT3F_7B
L_1EE3: SWAP BX, DI
L_1EE5: SWAP BX, SI
L_1EE7: FAC! = N_1988! * N(DI)  ' RT3F_8F
L_1EEA: SI = DX
L_1EEC: FAC! = N(SI) - FAC!  ' RT3F_9B
L_1EEF: DI = BX
L_1EF1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1EF4: SI = BX
L_1EF6: DI = &H198C
L_1EF9: N_198C! = N(SI)  ' RT3F_7B
L_1EFC: RETURN
L_1EFD: BX = &HE8
L_1F00: DX = &H20
L_1F03: CX = 0
L_1F05: AX = CX
L_1F07: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_1F0A: BX = &H4926
L_1F0D: DX = 3
L_1F10: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_1F13: RETURN
L_1F14: DI = &HAA2C
L_1F17: SI = &HACE8
L_1F1A: N_AA2C! = N_ACE8!  ' RT3F_7B
L_1F1D: GOSUB L_2352
L_1F20: BX = &H14
L_1F23: ARGPUSH BX  ' RT3E_42
L_1F26: BX = 2
L_1F29: LOCATE ARGS(), BX  ' RT3E_44
L_1F2C: SI = &H4F6C
L_1F2F: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_1F32: GOTO L_1F67
L_1F35: ' Alignment NOP
L_1F36: DI = &HA6E4
L_1F39: SI = &HA66E
L_1F3C: N_A6E4! = N_A66E!  ' RT3F_7B
L_1F3F: DI = &HA6E8
L_1F42: BX = SI
L_1F44: SI = &HA5C4
L_1F47: N_A6E8! = N_A5C4!  ' RT3F_7B
L_1F4A: GOSUB L_0797
L_1F4D: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_1F50: IF CompareLeft! > CompareRight! THEN GOTO L_1F55  ' flags from L_1F4D
L_1F52: GOTO L_1F5E
L_1F55: DI = &HAA2C
L_1F58: SI = &H4F6C
L_1F5B: N_AA2C! = N_4F6C!  ' RT3F_7B
L_1F5E: DI = &H4F6C
L_1F61: SI = &HA5C4
L_1F64: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_1F67: DI = &HA5C4
L_1F6A: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_1F6D: SI = DI
L_1F6F: DI = &HA5CC
L_1F72: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_1F75: IF CompareLeft! <= CompareRight! THEN GOTO L_1F36  ' flags from L_1F72
L_1F77: SI = &HAA2C
L_1F7A: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_1F7D: IF CompareLeft! = CompareRight! THEN GOTO L_1F82  ' flags from L_1F7A
L_1F7F: GOTO L_1F9D
L_1F82: ' PRINT statement begins (screen) ; RT3F_BC
L_1F85: BX = &HACEC
L_1F88: PRINT S_ACEC$  ' RT3F_6E; H newline item, ledger correction
L_1F8B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1F8E: DI = &HA9FE
L_1F91: SI = &HA66E
L_1F94: N_A9FE! = N_A66E!  ' RT3F_7B
L_1F97: GOSUB L_20B6
L_1F9A: GOTO L_207A
L_1F9D: ' PRINT statement begins (screen) ; RT3F_BC
L_1FA0: BX = &HAB72
L_1FA3: PRINT S_AB72$;  ' RT3F_6A
L_1FA6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_1FA9: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_1FAC: DX = &HAD12
L_1FAF: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_1FB2: AX = DX
L_1FB4: BX = &H4F8A
L_1FB7: CompareLeft$ = S(AX): CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_1FBA: IF CompareLeft$ = CompareRight$ THEN GOTO L_1FA9  ' flags from L_1FB7
L_1FBC: BX = &HAD12
L_1FBF: BX = ASC(S_AD12$)  ' RT3F_BB
L_1FC2: FAC! = CSNG(BX)  ' RT3F_57
L_1FC5: DI = &HA5C4
L_1FC8: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_1FCB: SI = DI
L_1FCD: DI = &HA66A
L_1FD0: CompareLeft! = N_A5C4!: CompareRight! = N_A66A!  ' RT3F_9F
L_1FD3: IF CompareLeft! = CompareRight! THEN GOTO L_1FD8  ' flags from L_1FD0
L_1FD5: GOTO L_1FE4
L_1FD8: DI = &HA9FE
L_1FDB: SI = &HAD16
L_1FDE: N_A9FE! = N_AD16!  ' RT3F_7B
L_1FE1: GOTO L_207A
L_1FE4: DI = &HAD1A
L_1FE7: SI = &HA5C4
L_1FEA: CompareLeft! = N_A5C4!: CompareRight! = N_AD1A!  ' RT3F_9F
L_1FED: BX = 0
L_1FF0: IF CompareLeft! <> CompareRight! THEN GOTO L_1FF3  ' flags from L_1FEA
L_1FF2: BX = BX - 1
L_1FF3: DI = &HAD1E
L_1FF6: CompareLeft! = N(SI): CompareRight! = N_AD1E!  ' RT3F_9F
L_1FF9: DX = 0
L_1FFC: IF CompareLeft! <> CompareRight! THEN GOTO L_1FFF  ' flags from L_1FF6
L_1FFE: DX = DX - 1
L_1FFF: DX = DX OR BX
L_2001: CompareLeft% = DX: CompareRight% = 0
L_2003: IF CompareLeft% <> CompareRight% THEN GOTO L_2008  ' flags from L_2001
L_2005: GOTO L_2014
L_2008: DI = &HA9FE
L_200B: SI = &H4F6C
L_200E: N_A9FE! = N_4F6C!  ' RT3F_7B
L_2011: GOTO L_207A
L_2014: DI = &HAD22
L_2017: SI = &HA5C4
L_201A: CompareLeft! = N_A5C4!: CompareRight! = N_AD22!  ' RT3F_9F
L_201D: BX = 0
L_2020: IF CompareLeft! <> CompareRight! THEN GOTO L_2023  ' flags from L_201A
L_2022: BX = BX - 1
L_2023: DI = &HA68A
L_2026: CompareLeft! = N(SI): CompareRight! = N_A68A!  ' RT3F_9F
L_2029: DX = 0
L_202C: IF CompareLeft! <> CompareRight! THEN GOTO L_202F  ' flags from L_2026
L_202E: DX = DX - 1
L_202F: DX = DX OR BX
L_2031: CompareLeft% = DX: CompareRight% = 0
L_2033: IF CompareLeft% <> CompareRight% THEN GOTO L_2038  ' flags from L_2031
L_2035: GOTO L_2044
L_2038: DI = &HA9FE
L_203B: SI = &H4F94
L_203E: N_A9FE! = N_4F94!  ' RT3F_7B
L_2041: GOTO L_207A
L_2044: DI = &HA870
L_2047: SI = &HA5C4
L_204A: CompareLeft! = N_A5C4!: CompareRight! = N_A870!  ' RT3F_9F
L_204D: BX = 0
L_2050: IF CompareLeft! <= CompareRight! THEN GOTO L_2053  ' flags from L_204A
L_2052: BX = BX - 1
L_2053: DI = &HAD26
L_2056: CompareLeft! = N(SI): CompareRight! = N_AD26!  ' RT3F_9F
L_2059: DX = 0
L_205C: IF CompareLeft! >= CompareRight! THEN GOTO L_205F  ' flags from L_2056
L_205E: DX = DX - 1
L_205F: DX = DX AND BX
L_2061: CompareLeft% = DX: CompareRight% = 0
L_2063: IF CompareLeft% <> CompareRight% THEN GOTO L_2068  ' flags from L_2061
L_2065: GOTO L_2077
L_2068: DI = &HAD2A
L_206B: FAC! = N(SI) + N_AD2A!  ' RT3F_7F
L_206E: DI = &HA9FE
L_2071: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_2074: GOTO L_207A
L_2077: GOTO L_1FA9
L_207A: SI = &HA9FE
L_207D: CompareLeft! = N_A9FE!: CompareRight! = 0  ' RT3F_A7
L_2080: BX = 0
L_2083: IF CompareLeft! <> CompareRight! THEN GOTO L_2086  ' flags from L_207D
L_2085: BX = BX - 1
L_2086: DI = &HA6E4
L_2089: DX = SI
L_208B: SI = &HAD2E
L_208E: N_A6E4! = N_AD2E!  ' RT3F_7B
L_2091: SWAP DX, SI
L_2093: DI = &HA6E8
L_2096: N_A6E8! = N(SI)  ' RT3F_7B
L_2099: WORD(BP - 6) = BX
L_209C: GOSUB L_0797
L_209F: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_20A2: BX = 0
L_20A5: IF CompareLeft! <= CompareRight! THEN GOTO L_20A8  ' flags from L_209F
L_20A7: BX = BX - 1
L_20A8: BX = BX OR WORD(BP - 6)
L_20AB: CompareLeft% = BX: CompareRight% = 0
L_20AD: IF CompareLeft% <> CompareRight% THEN GOTO L_20B2  ' flags from L_20AB
L_20AF: GOTO L_20B3
L_20B2: RETURN
L_20B3: GOTO L_1FA9
L_20B6: SI = &H4F6C
L_20B9: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_20BC: GOTO L_20CC
L_20BF: ' Alignment NOP
L_20C0: GOSUB L_1E4A
L_20C3: DI = &H4F6C
L_20C6: SI = &HAD32
L_20C9: FAC! = N_AD32! + N_4F6C!  ' RT3F_7F
L_20CC: DI = &HAD32
L_20CF: N_AD32! = FAC!: SI = &H001A  ' RT3F_7D
L_20D2: SI = DI
L_20D4: DI = &HA682
L_20D7: CompareLeft! = N_AD32!: CompareRight! = N_A682!  ' RT3F_9F
L_20DA: IF CompareLeft! <= CompareRight! THEN GOTO L_20C0  ' flags from L_20D7
L_20DC: RETURN
L_20DD: ' PRINT statement begins (screen) ; RT3F_BC
L_20E0: BX = &HAD36
L_20E3: PRINT S_AD36$;  ' RT3F_6A
L_20E6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_20E9: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_20EC: DX = &HAD12
L_20EF: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_20F2: AX = DX
L_20F4: BX = &H4F8A
L_20F7: CompareLeft$ = S(AX): CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_20FA: IF CompareLeft$ = CompareRight$ THEN GOTO L_20E9  ' flags from L_20F7
L_20FC: BX = &HD
L_20FF: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05

```

### Main menu and fueling

```basic
L_2102: AX = BX
L_2104: BX = &HAD12
L_2107: CompareLeft$ = S(AX): CompareRight$ = S_AD12$  ' RT3F_62; H string compare from 9E1F..9E49
L_210A: IF CompareLeft$ <> CompareRight$ THEN GOTO L_20E9  ' flags from L_2107
L_210C: RETURN
L_210D: GOSUB L_2352
L_2110: BX = &H10
L_2113: ARGPUSH BX  ' RT3E_42
L_2116: BX = &HB
L_2119: LOCATE ARGS(), BX  ' RT3E_44
L_211C: ' PRINT statement begins (screen) ; RT3F_BC
L_211F: BX = &HAD4A
L_2122: PRINT S_AD4A$  ' RT3F_6E; H newline item, ledger correction
L_2125: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2128: BX = &H11
L_212B: ARGPUSH BX  ' RT3E_42
L_212E: DX = BX
L_2130: BX = 2
L_2133: LOCATE ARGS(), BX  ' RT3E_44
L_2136: ' PRINT statement begins (screen) ; RT3F_BC
L_2139: CX = BX
L_213B: BX = &HAD58
L_213E: PRINT S_AD58$  ' RT3F_6E; H newline item, ledger correction
L_2141: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2144: BX = DX
L_2146: ARGPUSH BX  ' RT3E_42
L_2149: BX = &H14
L_214C: LOCATE ARGS(), BX  ' RT3E_44
L_214F: ' PRINT statement begins (screen) ; RT3F_BC
L_2152: DX = BX
L_2154: BX = &HAD68
L_2157: PRINT S_AD68$  ' RT3F_6E; H newline item, ledger correction
L_215A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_215D: BX = &H12
L_2160: ARGPUSH BX  ' RT3E_42
L_2163: SWAP CX, BX
L_2165: LOCATE ARGS(), BX  ' RT3E_44
L_2168: ' PRINT statement begins (screen) ; RT3F_BC
L_216B: AX = BX
L_216D: BX = &HAD78
L_2170: PRINT S_AD78$  ' RT3F_6E; H newline item, ledger correction
L_2173: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2176: BX = CX
L_2178: ARGPUSH BX  ' RT3E_42
L_217B: BX = DX
L_217D: LOCATE ARGS(), BX  ' RT3E_44
L_2180: ' PRINT statement begins (screen) ; RT3F_BC
L_2183: BX = &HAD82
L_2186: PRINT S_AD82$  ' RT3F_6E; H newline item, ledger correction
L_2189: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_218C: BX = &H13
L_218F: ARGPUSH BX  ' RT3E_42
L_2192: SWAP BX, AX
L_2193: LOCATE ARGS(), BX  ' RT3E_44
L_2196: ' PRINT statement begins (screen) ; RT3F_BC
L_2199: BX = &HAD94
L_219C: PRINT S_AD94$  ' RT3F_6E; H newline item, ledger correction
L_219F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_21A2: BX = AX
L_21A4: ARGPUSH BX  ' RT3E_42
L_21A7: BX = DX
L_21A9: LOCATE ARGS(), BX  ' RT3E_44
L_21AC: ' PRINT statement begins (screen) ; RT3F_BC
L_21AF: BX = &HAD9E
L_21B2: PRINT S_AD9E$  ' RT3F_6E; H newline item, ledger correction
L_21B5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_21B8: BX = &H14
L_21BB: ARGPUSH BX  ' RT3E_42
L_21BE: DX = BX
L_21C0: BX = 2
L_21C3: LOCATE ARGS(), BX  ' RT3E_44
L_21C6: ' PRINT statement begins (screen) ; RT3F_BC
L_21C9: CX = BX
L_21CB: BX = &HADAC
L_21CE: PRINT S_ADAC$  ' RT3F_6E; H newline item, ledger correction
L_21D1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_21D4: BX = DX
L_21D6: ARGPUSH BX  ' RT3E_42
L_21D9: LOCATE ARGS(), BX  ' RT3E_44
L_21DC: ' PRINT statement begins (screen) ; RT3F_BC
L_21DF: BX = &HADBA
L_21E2: PRINT S_ADBA$  ' RT3F_6E; H newline item, ledger correction
L_21E5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_21E8: BX = &H15
L_21EB: ARGPUSH BX  ' RT3E_42
L_21EE: SWAP CX, BX
L_21F0: LOCATE ARGS(), BX  ' RT3E_44
L_21F3: ' PRINT statement begins (screen) ; RT3F_BC
L_21F6: AX = BX
L_21F8: BX = &HADC8
L_21FB: PRINT S_ADC8$  ' RT3F_6E; H newline item, ledger correction
L_21FE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2201: BX = CX
L_2203: ARGPUSH BX  ' RT3E_42
L_2206: BX = DX
L_2208: LOCATE ARGS(), BX  ' RT3E_44
L_220B: ' PRINT statement begins (screen) ; RT3F_BC
L_220E: BX = &HADD6
L_2211: PRINT S_ADD6$  ' RT3F_6E; H newline item, ledger correction
L_2214: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2217: BX = &H16
L_221A: ARGPUSH BX  ' RT3E_42
L_221D: SWAP BX, AX
L_221E: LOCATE ARGS(), BX  ' RT3E_44
L_2221: ' PRINT statement begins (screen) ; RT3F_BC
L_2224: BX = &HADE2
L_2227: PRINT S_ADE2$  ' RT3F_6E; H newline item, ledger correction
L_222A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_222D: BX = AX
L_222F: ARGPUSH BX  ' RT3E_42
L_2232: BX = DX
L_2234: LOCATE ARGS(), BX  ' RT3E_44
L_2237: ' PRINT statement begins (screen) ; RT3F_BC
L_223A: BX = &HADEC
L_223D: PRINT S_ADEC$  ' RT3F_6E; H newline item, ledger correction
L_2240: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2243: BX = &H17
L_2246: ARGPUSH BX  ' RT3E_42
L_2249: BX = DX
L_224B: LOCATE ARGS(), BX  ' RT3E_44
L_224E: ' PRINT statement begins (screen) ; RT3F_BC
L_2251: BX = &HADFA
L_2254: PRINT S_ADFA$  ' RT3F_6E; H newline item, ledger correction
L_2257: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_225A: DI = &HAE0A
L_225D: SI = &H4F6C
L_2260: N_AE0A! = N_4F6C!  ' RT3F_7B
L_2263: DI = &HAE0E
L_2266: SI = &HAE12
L_2269: N_AE0E! = N_AE12!  ' RT3F_7B
L_226C: GOSUB L_1E7C
L_226F: SI = &HAE16
L_2272: CompareLeft! = N_AE16!: CompareRight! = 0  ' RT3F_A7
L_2275: IF CompareLeft! < CompareRight! THEN GOTO L_225A  ' flags from L_2272
L_2277: SI = &HAE16
L_227A: BX = CINT(N_AE16!)  ' RT3F_75
L_227D: ON BX GOTO L_543C, L_37D0, L_2BB3, L_667D, L_7C01, L_2396, L_9AA7, L_7515, L_83FC, L_225A, L_9F45, L_9D9C, L_6E43, L_225A, L_225A, L_225A, L_225A, L_225A, L_225A, L_A8A7, L_225A, L_225A, L_225A, L_225A, L_225A, L_225A  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_22B5: DI = &H3AB8
L_22B8: SI = &HAE1A
L_22BB: N_3AB8! = N_AE1A!  ' RT3F_7B
L_22BE: GOSUB L_2352
L_22C1: GOTO L_10CF
L_22C4: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_22C7: DX = &HAD12
L_22CA: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_22CD: AX = DX
L_22CF: BX = &H4F8A
L_22D2: CompareLeft$ = S(AX): CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_22D5: IF CompareLeft$ = CompareRight$ THEN GOTO L_22C4  ' flags from L_22D2
L_22D7: BX = &HAD12
L_22DA: BX = ASC(S_AD12$)  ' RT3F_BB
L_22DD: FAC! = CSNG(BX)  ' RT3F_57
L_22E0: DI = &HAE16
L_22E3: N_AE16! = FAC!: SI = &H001A  ' RT3F_7D
L_22E6: SI = DI
L_22E8: DI = &HAE1E
L_22EB: CompareLeft! = N_AE16!: CompareRight! = N_AE1E!  ' RT3F_9F
L_22EE: IF CompareLeft! > CompareRight! THEN GOTO L_22F3  ' flags from L_22EB
L_22F0: GOTO L_22FE
L_22F3: DI = &HAE22
L_22F6: FAC! = N(SI) + N_AE22!  ' RT3F_7F
L_22F9: DI = SI
L_22FB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_22FE: DI = &HAE2A
L_2301: SI = &HAE16
L_2304: FAC! = N_AE16! + N_AE2A!  ' RT3F_7F
L_2307: DI = SI
L_2309: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_230C: SI = DI
L_230E: DI = &HAE22
L_2311: CompareLeft! = N(SI): CompareRight! = N_AE22!  ' RT3F_9F
L_2314: BX = 0
L_2317: IF CompareLeft! <> CompareRight! THEN GOTO L_231A  ' flags from L_2311
L_2319: BX = BX - 1
L_231A: DI = &HAE2E
L_231D: CompareLeft! = N(SI): CompareRight! = N_AE2E!  ' RT3F_9F
L_2320: DX = 0
L_2323: IF CompareLeft! <> CompareRight! THEN GOTO L_2326  ' flags from L_231D
L_2325: DX = DX - 1
L_2326: DX = DX OR BX
L_2328: DI = &HAE26
L_232B: CompareLeft! = N(SI): CompareRight! = N_AE26!  ' RT3F_9F
L_232E: BX = 0
L_2331: IF CompareLeft! < CompareRight! THEN GOTO L_2334  ' flags from L_232B
L_2333: BX = BX - 1
L_2334: DI = &HAE0E
L_2337: CompareLeft! = N(SI): CompareRight! = N_AE0E!  ' RT3F_9F
L_233A: CX = 0
L_233D: IF CompareLeft! > CompareRight! THEN GOTO L_2340  ' flags from L_2337
L_233F: CX = CX - 1
L_2340: CX = CX AND BX
L_2342: CX = CX OR DX
L_2344: CompareLeft% = CX: CompareRight% = 0
L_2346: IF CompareLeft% <> CompareRight% THEN GOTO L_234B  ' flags from L_2344
L_2348: GOTO L_234C
L_234B: RETURN
L_234C: GOTO L_22C4
L_234F: GOTO L_210D
L_2352: BX = 7
L_2355: DX = &H77
L_2358: CX = 0
L_235A: AX = CX
L_235C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_235F: BX = &H138
L_2362: DX = &HC0
L_2365: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2368: BX = 0
L_236A: DX = 1
L_236D: CX = &HFFFF
L_2370: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2373: RETURN
L_2374: BX = 7
L_2377: DX = &H80
L_237A: CX = 0
L_237C: AX = CX
L_237E: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2381: BX = &H138
L_2384: DX = &HC0
L_2387: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_238A: BX = 0
L_238C: DX = 1
L_238F: CX = &HFFFF
L_2392: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2395: RETURN
L_2396: GOSUB L_2352
L_2399: SI = &H18FC
L_239C: CompareLeft! = N_18FC!: CompareRight! = 0  ' RT3F_A7
L_239F: IF CompareLeft! = CompareRight! THEN GOTO L_23A4  ' flags from L_239C
L_23A1: GOTO L_23A9
L_23A4: BEEP  ' RT3E_2B
L_23A7: GOTO L_234F
L_23A9: BX = &H12
L_23AC: ARGPUSH BX  ' RT3E_42
L_23AF: BX = &H488C
L_23B2: DX = BX
L_23B4: BX = LEN(S_488C$)  ' RT3F_BA
L_23B7: FAC! = CSNG(BX)  ' RT3F_57
L_23BA: DI = &HA70C
L_23BD: FAC! = FAC! * N_A70C!  ' RT3F_91
L_23C0: SI = &HAE44
L_23C3: FAC! = N_AE44! - FAC!  ' RT3F_9B
L_23C6: BX = CINT(FAC!)  ' RT3F_77
L_23C9: LOCATE ARGS(), BX  ' RT3E_44
L_23CC: ' PRINT statement begins (screen) ; RT3F_BC
L_23CF: BX = &HAE32
L_23D2: PRINT S_AE32$;  ' RT3F_6A
L_23D5: BX = DX
L_23D7: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_23DA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_23DD: DI = &H1920
L_23E0: SI = &H3AB0
L_23E3: FAC! = N_3AB0! / N_1920!  ' RT3F_87
L_23E6: BX = DI
L_23E8: DI = &HA9B8
L_23EB: DX = SI
L_23ED: FAC! = FAC! * N_A9B8!  ' RT3F_91
L_23F0: DI = &HAC70
L_23F3: FAC! = FAC! + N_AC70!  ' RT3F_81
L_23F6: DI = &HAE48
L_23F9: N_AE48! = FAC!: SI = &H001A  ' RT3F_7D
L_23FC: DI = DX
L_23FE: SI = BX
L_2400: N(DI) = N(SI)  ' RT3F_7B
L_2403: BX = &H12
L_2406: DX = &H98
L_2409: CX = 0
L_240B: AX = CX
L_240D: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_2410: BX = &H12F
L_2413: DX = &HB0
L_2416: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2419: BX = &HFFFF
L_241C: DX = 1
L_241F: CX = BX
L_2421: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2424: CX = AX
L_2426: BX = &H1E
L_2429: DX = &HA0
L_242C: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_242F: BX = &H122
L_2432: DX = &HA8
L_2435: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2438: BX = 0
L_243A: DX = 1
L_243D: CX = &HFFFF
L_2440: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2443: CX = AX
L_2445: BX = &H1E
L_2448: DX = &HA0
L_244B: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_244E: BX = &HAE48
L_2451: DX = &HA8
L_2454: CX = &HFFFF
L_2457: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_245A: BX = 2
L_245D: DX = 1
L_2460: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_2463: GOSUB L_1E4A
L_2466: DI = &HA70C
L_2469: SI = &HAE48
L_246C: FAC! = N_AE48! * N_A70C!  ' RT3F_8F
L_246F: BX = &H1A
L_2472: FAC! = INT(FAC!)  ' RT3D_03
L_2475: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_2479: GOTO L_24D2
L_247C: BX = &HAE48
L_247F: DX = &HA0
L_2482: CX = &HFFFF
L_2485: AX = 0
L_2487: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_248A: BX = &HA5C4
L_248D: DX = &HA8
L_2490: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_2493: AX = BX
L_2495: BX = 2
L_2498: DX = 1
L_249B: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_249E: DI = &H19C4
L_24A1: SI = &H4F6C
L_24A4: FAC! = N_4F6C! - N_19C4!  ' RT3F_97
L_24A7: DI = &HAB94
L_24AA: FAC! = FAC! * N_AB94!  ' RT3F_91
L_24AD: SI = AX
L_24AF: DI = &HA686
L_24B2: T_00! = FAC!  ' RT3F_71; inline=&H80
L_24B6: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_24B9: BX = CINT(FAC!)  ' RT3F_77
L_24BC: DX = &HA87C
L_24BF: SoundFreq% = BX: SoundDuration! = N_A87C!  ' RT3E_5E
L_24C2: BX = CX
L_24C4: DX = CX
L_24C6: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_24C9: DI = &H4F94
L_24CC: SI = &HA5C4
L_24CF: FAC! = N_A5C4! + N_4F94!  ' RT3F_7F
L_24D2: DI = &HA5C4
L_24D5: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_24D8: SI = DI
L_24DA: DI = &HAE4C
L_24DD: CompareLeft! = N_A5C4!: CompareRight! = N_AE4C!  ' RT3F_9F
L_24E0: IF CompareLeft! <= CompareRight! THEN GOTO L_247C  ' flags from L_24DD
L_24E2: GOSUB L_20B6
L_24E5: GOSUB L_2352
L_24E8: GOTO L_234F
L_24EB: DI = &HAE50
L_24EE: SI = &HAE54
L_24F1: N_AE50! = N_AE54!  ' RT3F_7B
L_24F4: BX = 0
L_24F6: BX = POS(BX)  ' RT3D_21
L_24F9: FAC! = CSNG(BX)  ' RT3F_57
L_24FC: DI = &HAE58
L_24FF: N_AE58! = FAC!: SI = &H001A  ' RT3F_7D

```

### Input and transaction helpers

```basic
L_2502: BX = CSRLIN  ' RT3D_25
L_2505: FAC! = CSNG(BX)  ' RT3F_57
L_2508: DI = &HAE5C
L_250B: N_AE5C! = FAC!: SI = &H001A  ' RT3F_7D
L_250E: BX = &H4F8A
L_2511: DX = &HAD12
L_2514: S_AD12$ = S_4F8A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2517: SI = &HAE5C
L_251A: BX = CINT(N_AE5C!)  ' RT3F_75
L_251D: ARGPUSH BX  ' RT3E_42
L_2520: SI = &HAE58
L_2523: BX = CINT(N_AE58!)  ' RT3F_75
L_2526: ARGPUSH BX  ' RT3E_42
L_2529: BX = 1
L_252C: ARGPUSH BX  ' RT3E_42
L_252F: BX = 0
L_2531: ARGPUSH BX  ' RT3E_42
L_2534: BX = 7
L_2537: LOCATE ARGS(), BX  ' RT3E_44
L_253A: ' PRINT statement begins (screen) ; RT3F_BC
L_253D: BX = &HAD12
L_2540: PRINT S_AD12$;  ' RT3F_6A
L_2543: BX = &HAC6A
L_2546: PRINT S_AC6A$;  ' RT3F_6A
L_2549: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_254C: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_254F: DX = &HAE60
L_2552: S_AE60$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2555: AX = DX
L_2557: BX = &H4F8A
L_255A: CompareLeft$ = S(AX): CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_255D: IF CompareLeft$ = CompareRight$ THEN GOTO L_254C  ' flags from L_255A
L_255F: BX = &HAE60
L_2562: BX = ASC(S_AE60$)  ' RT3F_BB
L_2565: FAC! = CSNG(BX)  ' RT3F_57
L_2568: DI = &HA5C4
L_256B: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_256E: SI = DI
L_2570: DI = &HA66A
L_2573: CompareLeft! = N_A5C4!: CompareRight! = N_A66A!  ' RT3F_9F
L_2576: IF CompareLeft! <> CompareRight! THEN GOTO L_257B  ' flags from L_2573
L_2578: GOTO L_263A
L_257B: DI = &HA5CC
L_257E: SI = &HA5C4
L_2581: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_2584: BX = 0
L_2587: IF CompareLeft! <> CompareRight! THEN GOTO L_258A  ' flags from L_2581
L_2589: BX = BX - 1
L_258A: DX = BX
L_258C: BX = &HAD12
L_258F: CX = BX
L_2591: BX = LEN(S_AD12$)  ' RT3F_BA
L_2594: BX = BX OR BX
L_2596: AX = 0
L_2599: IF (ZF OR SF <> OF) THEN GOTO L_259C  ' flags from L_2594
L_259B: AX = AX - 1
L_259C: AX = AX AND DX
L_259E: CompareLeft% = AX: CompareRight% = 0
L_25A0: IF CompareLeft% <> CompareRight% THEN GOTO L_25A5  ' flags from L_259E
L_25A2: GOTO L_25BC
L_25A5: BX = CX
L_25A7: BX = LEN(S(BX))  ' RT3F_BA
L_25AA: BX = BX - 1
L_25AB: SWAP CX, BX
L_25AD: DX = CX
L_25AF: AX = BX
L_25B1: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_25B4: DX = AX
L_25B6: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_25B9: GOTO L_2517
L_25BC: DI = &HAE54
L_25BF: SI = &HAE50
L_25C2: CompareLeft! = N_AE50!: CompareRight! = N_AE54!  ' RT3F_9F
L_25C5: BX = 0
L_25C8: IF CompareLeft! <> CompareRight! THEN GOTO L_25CB  ' flags from L_25C2
L_25CA: BX = BX - 1
L_25CB: DI = &HA870
L_25CE: SI = &HA5C4
L_25D1: CompareLeft! = N_A5C4!: CompareRight! = N_A870!  ' RT3F_9F
L_25D4: DX = 0
L_25D7: IF CompareLeft! >= CompareRight! THEN GOTO L_25DA  ' flags from L_25D1
L_25D9: DX = DX - 1
L_25DA: DI = &HAE64
L_25DD: CompareLeft! = N(SI): CompareRight! = N_AE64!  ' RT3F_9F
L_25E0: CX = 0
L_25E3: IF CompareLeft! <= CompareRight! THEN GOTO L_25E6  ' flags from L_25DD
L_25E5: CX = CX - 1
L_25E6: CX = CX OR DX
L_25E8: CX = CX AND BX
L_25EA: CompareLeft% = CX: CompareRight% = 0
L_25EC: IF CompareLeft% = CompareRight% THEN GOTO L_25F1  ' flags from L_25EA
L_25EE: GOTO L_2517
L_25F1: DI = &HAE68
L_25F4: SI = &HA5C4
L_25F7: CompareLeft! = N_A5C4!: CompareRight! = N_AE68!  ' RT3F_9F
L_25FA: BX = 0
L_25FD: IF CompareLeft! >= CompareRight! THEN GOTO L_2600  ' flags from L_25F7
L_25FF: BX = BX - 1
L_2600: DI = &HAE6C
L_2603: CompareLeft! = N(SI): CompareRight! = N_AE6C!  ' RT3F_9F
L_2606: DX = 0
L_2609: IF CompareLeft! <= CompareRight! THEN GOTO L_260C  ' flags from L_2603
L_260B: DX = DX - 1
L_260C: DX = DX OR BX
L_260E: CompareLeft% = DX: CompareRight% = 0
L_2610: IF CompareLeft% = CompareRight% THEN GOTO L_2615  ' flags from L_260E
L_2612: GOTO L_254C
L_2615: BX = &HAD12
L_2618: BX = LEN(S_AD12$)  ' RT3F_BA
L_261B: FAC! = CSNG(BX)  ' RT3F_57
L_261E: DI = &HAE50
L_2621: CompareLeft! = FAC!: CompareRight! = N_AE50!  ' RT3F_A1
L_2624: IF CompareLeft! < CompareRight! THEN GOTO L_2629  ' flags from L_2621
L_2626: GOTO L_254C
L_2629: BX = &HAE60
L_262C: AX = &HAD12
L_262F: BX = TEMP_DESC(S_AD12$ + S_AE60$)  ' BX receives a temporary descriptor  ' RT3F_55
L_2632: DX = AX
L_2634: S(DX) = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2637: GOTO L_2517
L_263A: BX = &HAD12
L_263D: DAC# = VAL(S_AD12$)  ' RT3D_13
L_2640: BX = CINT(DAC#)  ' RT3F_78
L_2643: AX = BX
L_2645: WORD(&HAE70) = AX
L_2648: RETURN
L_2649: GOSUB L_2352
L_264C: BX = &H14
L_264F: ARGPUSH BX  ' RT3E_42
L_2652: BX = 2
L_2655: LOCATE ARGS(), BX  ' RT3E_44
L_2658: ' PRINT statement begins (screen) ; RT3F_BC
L_265B: BX = &HAE72
L_265E: PRINT S_AE72$  ' RT3F_6E; H newline item, ledger correction
L_2661: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2664: GOSUB L_20B6
L_2667: RETURN
L_2668: GOSUB L_2352
L_266B: BX = &H14
L_266E: ARGPUSH BX  ' RT3E_42
L_2671: BX = 2
L_2674: LOCATE ARGS(), BX  ' RT3E_44
L_2677: ' PRINT statement begins (screen) ; RT3F_BC
L_267A: BX = &HAE96
L_267D: PRINT S_AE96$  ' RT3F_6E; H newline item, ledger correction
L_2680: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2683: GOSUB L_20B6
L_2686: RETURN
L_2687: GOSUB L_2352
L_268A: BX = &H14
L_268D: ARGPUSH BX  ' RT3E_42
L_2690: BX = 2
L_2693: LOCATE ARGS(), BX  ' RT3E_44
L_2696: ' PRINT statement begins (screen) ; RT3F_BC
L_2699: BX = &HAEB8
L_269C: PRINT S_AEB8$  ' RT3F_6E; H newline item, ledger correction
L_269F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_26A2: GOSUB L_20B6
L_26A5: RETURN
L_26A6: DI = &HA6F8
L_26A9: SI = &HA97C
L_26AC: N_A6F8! = N_A97C!  ' RT3F_7B
L_26AF: BX = DI
L_26B1: DI = &HA6FC
L_26B4: SI = &HA9FE
L_26B7: N_A6FC! = N_A9FE!  ' RT3F_7B
L_26BA: GOSUB L_07C9
L_26BD: BX = CINT(FAC!)  ' RT3F_77
L_26C0: DI = BX
L_26C2: DI = DI * (2 ^ 1)
L_26C4: DI = DI * (2 ^ 1)
L_26C6: DI = DI + &H1850
L_26CA: BX = DI
L_26CC: DI = &HA6E4
L_26CF: SI = &HA66E
L_26D2: N_A6E4! = N_A66E!  ' RT3F_7B
L_26D5: DX = DI
L_26D7: DI = &HA6E8
L_26DA: SI = &HA9FE
L_26DD: N_A6E8! = N_A9FE!  ' RT3F_7B
L_26E0: WORD(BP - 6) = BX
L_26E3: GOSUB L_0797
L_26E6: DI = &HA6E4
L_26E9: SI = &HA676
L_26EC: N_A6E4! = N_A676!  ' RT3F_7B
L_26EF: BX = DI
L_26F1: DI = &HA6E8
L_26F4: SI = &HA9FE
L_26F7: N_A6E8! = N_A9FE!  ' RT3F_7B
L_26FA: T_00! = FAC!  ' RT3F_71; inline=&H80
L_26FE: GOSUB L_0797
L_2701: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_2705: DI = &HAECE
L_2708: FAC! = FAC! * N_AECE!  ' RT3F_91
L_270B: DI = &HAED2
L_270E: FAC! = FAC! + N_AED2!  ' RT3F_81
L_2711: BX = &H1A
L_2714: FAC! = INT(FAC!)  ' RT3D_03
L_2717: DI = WORD(BP - 6)
L_271A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_271D: DI = &HA6F8
L_2720: SI = &HA686
L_2723: N_A6F8! = N_A686!  ' RT3F_7B
L_2726: BX = DI
L_2728: DI = &HA6FC
L_272B: SI = &HA9FE
L_272E: N_A6FC! = N_A9FE!  ' RT3F_7B
L_2731: GOSUB L_07C9
L_2734: BX = CINT(FAC!)  ' RT3F_77
L_2737: DI = BX
L_2739: DI = DI * (2 ^ 1)
L_273B: DI = DI * (2 ^ 1)
L_273D: DI = DI + &H1850
L_2741: BX = DI
L_2743: DI = &HA6E4
L_2746: SI = &H4F94
L_2749: N_A6E4! = N_4F94!  ' RT3F_7B
L_274C: DX = DI
L_274E: DI = &HA6E8
L_2751: SI = &HA9FE
L_2754: N_A6E8! = N_A9FE!  ' RT3F_7B
L_2757: WORD(BP - 8) = BX
L_275A: GOSUB L_0797
L_275D: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_2761: DI = &HA6E4
L_2764: SI = &HA5C0
L_2767: N_A6E4! = N_A5C0!  ' RT3F_7B
L_276A: BX = DI
L_276C: DI = &HA6E8
L_276F: SI = &HA9FE
L_2772: N_A6E8! = N_A9FE!  ' RT3F_7B
L_2775: T_01! = FAC!  ' RT3F_71; inline=&H81
L_2779: GOSUB L_0797
L_277C: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_2780: DI = &HA696
L_2783: FAC! = FAC! / N_A696!  ' RT3F_89
L_2786: DI = &HAED6
L_2789: FAC! = FAC! + N_AED6!  ' RT3F_81
L_278C: BX = &H1A
L_278F: FAC! = INT(FAC!)  ' RT3D_03
L_2792: BX = DI
L_2794: DI = WORD(BP - 8)
L_2797: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_279A: DI = &HA6F8
L_279D: SI = &HA5EE
L_27A0: N_A6F8! = N_A5EE!  ' RT3F_7B
L_27A3: DI = &HA6FC
L_27A6: SI = &HA9FE
L_27A9: N_A6FC! = N_A9FE!  ' RT3F_7B
L_27AC: GOSUB L_07C9
L_27AF: BX = CINT(FAC!)  ' RT3F_77
L_27B2: DI = BX
L_27B4: DI = DI * (2 ^ 1)
L_27B6: DI = DI * (2 ^ 1)
L_27B8: DI = DI + &H1850
L_27BC: BX = DI
L_27BE: DI = &HA6E4
L_27C1: SI = &H4F6C
L_27C4: N_A6E4! = N_4F6C!  ' RT3F_7B
L_27C7: DI = &HA6E8
L_27CA: SI = &HA9FE
L_27CD: N_A6E8! = N_A9FE!  ' RT3F_7B
L_27D0: WORD(BP - &HA) = BX
L_27D3: GOSUB L_0797
L_27D6: DI = &HA70C
L_27D9: FAC! = FAC! * N_A70C!  ' RT3F_91
L_27DC: DI = &HAED6
L_27DF: FAC! = FAC! + N_AED6!  ' RT3F_81
L_27E2: BX = &H1A
L_27E5: FAC! = INT(FAC!)  ' RT3D_03
L_27E8: DI = WORD(BP - &HA)
L_27EB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_27EE: DI = &HA6F8
L_27F1: SI = &HA66A
L_27F4: N_A6F8! = N_A66A!  ' RT3F_7B
L_27F7: BX = DI
L_27F9: DI = &HA6FC
L_27FC: SI = &HA9FE
L_27FF: N_A6FC! = N_A9FE!  ' RT3F_7B
L_2802: GOSUB L_07C9
L_2805: BX = CINT(FAC!)  ' RT3F_77
L_2808: DI = BX
L_280A: DI = DI * (2 ^ 1)
L_280C: DI = DI * (2 ^ 1)
L_280E: DI = DI + &H1850
L_2812: BX = DI
L_2814: DI = &HA6E4
L_2817: SI = &HAD16
L_281A: N_A6E4! = N_AD16!  ' RT3F_7B
L_281D: DX = DI
L_281F: DI = &HA6E8
L_2822: SI = &HA9FE
L_2825: N_A6E8! = N_A9FE!  ' RT3F_7B
L_2828: WORD(BP - 6) = BX
L_282B: GOSUB L_0797
L_282E: DI = &HAECE
L_2831: FAC! = FAC! * N_AECE!  ' RT3F_91
L_2834: DI = &HA5CC
L_2837: FAC! = FAC! + N_A5CC!  ' RT3F_81
L_283A: BX = &H1A
L_283D: FAC! = INT(FAC!)  ' RT3D_03
L_2840: DI = WORD(BP - 6)
L_2843: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2846: DI = &HA6F8
L_2849: SI = &HA840
L_284C: N_A6F8! = N_A840!  ' RT3F_7B
L_284F: DI = &HA6FC
L_2852: SI = &HA9FE
L_2855: N_A6FC! = N_A9FE!  ' RT3F_7B
L_2858: GOSUB L_07C9
L_285B: BX = CINT(FAC!)  ' RT3F_77
L_285E: DI = BX
L_2860: DI = DI * (2 ^ 1)
L_2862: DI = DI * (2 ^ 1)
L_2864: DI = DI + &H1850
L_2868: BX = DI
L_286A: DI = &HA6E4
L_286D: SI = &HA874
L_2870: N_A6E4! = N_A874!  ' RT3F_7B
L_2873: DX = DI
L_2875: DI = &HA6E8
L_2878: SI = &HA9FE
L_287B: N_A6E8! = N_A9FE!  ' RT3F_7B
L_287E: WORD(BP - 8) = BX
L_2881: GOSUB L_0797
L_2884: DI = &HA6E4
L_2887: SI = &H4F6C
L_288A: N_A6E4! = N_4F6C!  ' RT3F_7B
L_288D: DI = &HA6E8
L_2890: SI = &HA9FE
L_2893: N_A6E8! = N_A9FE!  ' RT3F_7B
L_2896: T_00! = FAC!  ' RT3F_71; inline=&H80
L_289A: GOSUB L_0797
L_289D: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_28A1: DI = &HA9A4
L_28A4: FAC! = FAC! / N_A9A4!  ' RT3F_89
L_28A7: DI = &HA672
L_28AA: FAC! = FAC! + N_A672!  ' RT3F_81
L_28AD: BX = &H1A
L_28B0: FAC! = INT(FAC!)  ' RT3D_03
L_28B3: DI = WORD(BP - 8)
L_28B6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_28B9: RETURN
L_28BA: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_28BD: DX = &HAD12
L_28C0: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_28C3: AX = DX
L_28C5: BX = &HAEDA
L_28C8: CompareLeft$ = S(AX): CompareRight$ = S_AEDA$  ' RT3F_62; H string compare from 9E1F..9E49
L_28CB: CX = 0
L_28CE: IF CompareLeft$ <> CompareRight$ THEN GOTO L_28D1  ' flags from L_28C8
L_28D0: CX = CX - 1
L_28D1: BX = &HAEE0
L_28D4: CompareLeft$ = S(AX): CompareRight$ = S_AEE0$  ' RT3F_62; H string compare from 9E1F..9E49
L_28D7: DX = 0
L_28DA: IF CompareLeft$ <> CompareRight$ THEN GOTO L_28DD  ' flags from L_28D4
L_28DC: DX = DX - 1
L_28DD: DX = DX OR CX
L_28DF: CompareLeft% = DX: CompareRight% = 0
L_28E1: IF CompareLeft% <> CompareRight% THEN GOTO L_28E6  ' flags from L_28DF
L_28E3: GOTO L_28F0
L_28E6: DI = &HA838
L_28E9: SI = &H4F6C
L_28EC: N_A838! = N_4F6C!  ' RT3F_7B
L_28EF: RETURN
L_28F0: BX = &HAEE6
L_28F3: AX = &HAD12
L_28F6: CompareLeft$ = S_AD12$: CompareRight$ = S_AEE6$  ' RT3F_62; H string compare from 9E1F..9E49
L_28F9: DX = 0
L_28FC: IF CompareLeft$ <> CompareRight$ THEN GOTO L_28FF  ' flags from L_28F6
L_28FE: DX = DX - 1
L_28FF: BX = &HAEEC
L_2902: CompareLeft$ = S(AX): CompareRight$ = S_AEEC$  ' RT3F_62; H string compare from 9E1F..9E49
L_2905: CX = 0
L_2908: IF CompareLeft$ <> CompareRight$ THEN GOTO L_290B  ' flags from L_2902
L_290A: CX = CX - 1
L_290B: CX = CX OR DX
L_290D: CompareLeft% = CX: CompareRight% = 0
L_290F: IF CompareLeft% <> CompareRight% THEN GOTO L_2914  ' flags from L_290D
L_2911: GOTO L_291E
L_2914: DI = &HA838
L_2917: SI = &HA66E
L_291A: N_A838! = N_A66E!  ' RT3F_7B
L_291D: RETURN
L_291E: GOTO L_28BA
L_2920: GOSUB L_2352
L_2923: BX = &H14
L_2926: ARGPUSH BX  ' RT3E_42
L_2929: BX = 2
L_292C: LOCATE ARGS(), BX  ' RT3E_44
L_292F: ' PRINT statement begins (screen) ; RT3F_BC
L_2932: SI = &HA9FE
L_2935: BX = CINT(N_A9FE!)  ' RT3F_75
L_2938: BX = BX * (2 ^ 1)
L_293A: BX = BX * (2 ^ 1)
L_293C: BX = BX + &H4288
L_2940: PRINT S(BX);  ' RT3F_6A
L_2943: BX = &HAEF2
L_2946: PRINT S_AEF2$  ' RT3F_6E; H newline item, ledger correction
L_2949: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_294C: GOSUB L_20B6
L_294F: RETURN
L_2950: DI = &HAE50
L_2953: SI = &HA5C0
L_2956: N_AE50! = N_A5C0!  ' RT3F_7B
L_2959: ' PRINT statement begins (screen) ; RT3F_BC
L_295C: BX = &HAF00
L_295F: PRINT S_AF00$;  ' RT3F_6A
L_2962: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2965: BX = 0
L_2967: BX = POS(BX)  ' RT3D_21
L_296A: FAC! = CSNG(BX)  ' RT3F_57
L_296D: DI = &HAF0E
L_2970: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_2973: ARGPUSH OMITTED  ' RT3E_43
L_2976: SI = &HAF0E
L_2979: BX = CINT(N_AF0E!)  ' RT3F_75
L_297C: LOCATE ARGS(), BX  ' RT3E_44
L_297F: GOSUB L_24F4
L_2982: DI = &HA838
L_2985: SI = &HA874
L_2988: N_A838! = N_A874!  ' RT3F_7B
L_298B: BX = &HAF12
L_298E: AX = &HAD12
L_2991: CompareLeft$ = S_AD12$: CompareRight$ = S_AF12$  ' RT3F_62; H string compare from 9E1F..9E49
L_2994: DX = 0
L_2997: IF CompareLeft$ <> CompareRight$ THEN GOTO L_299A  ' flags from L_2991
L_2999: DX = DX - 1
L_299A: BX = &HAF1A
L_299D: CompareLeft$ = S(AX): CompareRight$ = S_AF1A$  ' RT3F_62; H string compare from 9E1F..9E49
L_29A0: CX = 0
L_29A3: IF CompareLeft$ <> CompareRight$ THEN GOTO L_29A6  ' flags from L_299D
L_29A5: CX = CX - 1
L_29A6: CX = CX OR DX
L_29A8: CompareLeft% = CX: CompareRight% = 0
L_29AA: IF CompareLeft% <> CompareRight% THEN GOTO L_29AF  ' flags from L_29A8
L_29AC: GOTO L_29B8
L_29AF: SI = &H4F6C
L_29B2: N(DI) = N_4F6C!  ' RT3F_7B
L_29B5: GOTO L_29F7
L_29B8: BX = &HAF22
L_29BB: AX = &HAD12
L_29BE: CompareLeft$ = S_AD12$: CompareRight$ = S_AF22$  ' RT3F_62; H string compare from 9E1F..9E49
L_29C1: DX = 0
L_29C4: IF CompareLeft$ = CompareRight$ THEN GOTO L_29C7  ' flags from L_29BE
L_29C6: DX = DX - 1
L_29C7: BX = &HAF28
L_29CA: CompareLeft$ = S(AX): CompareRight$ = S_AF28$  ' RT3F_62; H string compare from 9E1F..9E49
L_29CD: CX = 0
L_29D0: IF CompareLeft$ = CompareRight$ THEN GOTO L_29D3  ' flags from L_29CA
L_29D2: CX = CX - 1
L_29D3: CX = CX AND DX
L_29D5: CompareLeft% = CX: CompareRight% = 0
L_29D7: IF CompareLeft% <> CompareRight% THEN GOTO L_29DC  ' flags from L_29D5
L_29D9: GOTO L_29F7
L_29DC: ARGPUSH OMITTED  ' RT3E_43
L_29DF: SI = &HAF0E
L_29E2: BX = CINT(N_AF0E!)  ' RT3F_75
L_29E5: LOCATE ARGS(), BX  ' RT3E_44
L_29E8: ' PRINT statement begins (screen) ; RT3F_BC
L_29EB: BX = &HAF2E
L_29EE: PRINT S_AF2E$;  ' RT3F_6A
L_29F1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_29F4: GOTO L_2973
L_29F7: RETURN
L_29F8: SI = &HAF36
L_29FB: BX = CINT(N_AF36!)  ' RT3F_75
L_29FE: SI = BX
L_2A00: SI = SI * (2 ^ 1)
L_2A02: SI = SI * (2 ^ 1)
L_2A04: SI = SI + &H52DE
L_2A08: DI = &HAF3A
L_2A0B: N_AF3A! = N(SI)  ' RT3F_7B
L_2A0E: DX = DI
L_2A10: DI = &H18A0
L_2A13: SI = &H4F6C
L_2A16: N_18A0! = N_4F6C!  ' RT3F_7B
L_2A19: DI = SI
L_2A1B: SWAP DX, SI
L_2A1D: CompareLeft! = N_AF3A!: CompareRight! = N_4F6C!  ' RT3F_9F
L_2A20: CX = 0
L_2A23: IF CompareLeft! <= CompareRight! THEN GOTO L_2A26  ' flags from L_2A1D
L_2A25: CX = CX - 1
L_2A26: CompareLeft% = CX: CompareRight% = 0
L_2A28: IF CompareLeft% >= CompareRight% THEN GOTO L_2A2C  ' flags from L_2A26
L_2A2A: CX = -CX
L_2A2C: SWAP CX, BX
L_2A2E: FAC! = CSNG(BX)  ' RT3F_57
L_2A31: DI = &H18A4
L_2A34: BX = SI
L_2A36: N_18A4! = FAC!: SI = &H001A  ' RT3F_7D
L_2A39: SI = BX
L_2A3B: DI = &H4F94
L_2A3E: CompareLeft! = N(SI): CompareRight! = N_4F94!  ' RT3F_9F
L_2A41: DX = 0
L_2A44: IF CompareLeft! <= CompareRight! THEN GOTO L_2A47  ' flags from L_2A3E
L_2A46: DX = DX - 1
L_2A47: CompareLeft% = DX: CompareRight% = 0
L_2A49: IF CompareLeft% >= CompareRight% THEN GOTO L_2A4D  ' flags from L_2A47
L_2A4B: DX = -DX
L_2A4D: BX = DX
L_2A4F: FAC! = CSNG(BX)  ' RT3F_57
L_2A52: DI = &H18A8
L_2A55: N_18A8! = FAC!: SI = &H001A  ' RT3F_7D
L_2A58: BX = CX
L_2A5A: CX = CX + 9
L_2A5D: SI = CX
L_2A5F: SI = SI * (2 ^ 1)
L_2A61: SI = SI * (2 ^ 1)
L_2A63: SI = SI + &H52DE
L_2A67: DX = BX
L_2A69: BX = BX + &H24
L_2A6C: DI = BX
L_2A6E: DI = DI * (2 ^ 1)
L_2A70: DI = DI * (2 ^ 1)
L_2A72: DI = DI + &H52DE
L_2A76: SWAP DI, SI
L_2A78: BX = DX
L_2A7A: DX = DX + &H5A
L_2A7D: CX = DI
L_2A7F: DI = DX
L_2A81: DI = DI * (2 ^ 1)
L_2A83: DI = DI * (2 ^ 1)
L_2A85: DI = DI + &H52DE
L_2A89: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_2A8C: SI = CX
L_2A8E: FAC! = N(SI) - FAC!  ' RT3F_9B
L_2A91: DX = BX
L_2A93: BX = &H1A
L_2A96: FAC! = INT(FAC!)  ' RT3D_03
L_2A99: DI = &H1904
L_2A9C: N_1904! = FAC!: SI = &H001A  ' RT3F_7D
L_2A9F: DX = DX + &H12
L_2AA2: SI = DX
L_2AA4: SI = SI * (2 ^ 1)
L_2AA6: SI = SI * (2 ^ 1)
L_2AA8: SI = SI + &H52DE
L_2AAC: DI = &H1908
L_2AAF: N_1908! = N(SI)  ' RT3F_7B
L_2AB2: DI = &H3AB0
L_2AB5: SI = &HA66E
L_2AB8: N_3AB0! = N_A66E!  ' RT3F_7B
L_2ABB: SI = &HAF36
L_2ABE: BX = SI
L_2AC0: DX = BX
L_2AC2: BX = CINT(N_AF36!)  ' RT3F_75
L_2AC5: SI = BX
L_2AC7: SI = SI + &H24
L_2ACA: SI = SI * (2 ^ 1)
L_2ACC: SI = SI * (2 ^ 1)
L_2ACE: SI = SI + &H52DE
L_2AD2: DI = &H192C
L_2AD5: N_192C! = N(SI)  ' RT3F_7B
L_2AD8: CX = BX
L_2ADA: BX = BX + &H2D
L_2ADD: SI = BX
L_2ADF: SI = SI * (2 ^ 1)
L_2AE1: SI = SI * (2 ^ 1)
L_2AE3: SI = SI + &H52DE
L_2AE7: DI = &H191C
L_2AEA: N_191C! = N(SI)  ' RT3F_7B
L_2AED: SI = DX
L_2AEF: DI = &H4F6C
L_2AF2: FAC! = N_AF36! + N_4F6C!  ' RT3F_7F
L_2AF5: BX = DI
L_2AF7: DI = &H18FC
L_2AFA: N_18FC! = FAC!: SI = &H001A  ' RT3F_7D
L_2AFD: DX = CX
L_2AFF: CX = CX + &H36

```

### Returns Department and selling

```basic
L_2B02: SI = CX
L_2B04: SI = SI * (2 ^ 1)
L_2B06: SI = SI * (2 ^ 1)
L_2B08: SI = SI + &H52DE
L_2B0C: DI = &H18C4
L_2B0F: N_18C4! = N(SI)  ' RT3F_7B
L_2B12: CX = DX
L_2B14: DX = DX + &H48
L_2B17: SI = DX
L_2B19: SI = SI * (2 ^ 1)
L_2B1B: SI = SI * (2 ^ 1)
L_2B1D: SI = SI + &H52DE
L_2B21: DI = &H1900
L_2B24: N_1900! = N(SI)  ' RT3F_7B
L_2B27: DX = CX
L_2B29: CX = CX + &H5A
L_2B2C: DI = CX
L_2B2E: DI = DI * (2 ^ 1)
L_2B30: DI = DI * (2 ^ 1)
L_2B32: DI = DI + &H52DE
L_2B36: SI = BX
L_2B38: FAC! = N(SI) / N(DI)  ' RT3F_87
L_2B3B: BX = &H1A
L_2B3E: FAC! = INT(FAC!)  ' RT3D_03
L_2B41: DI = &H1924
L_2B44: N_1924! = FAC!: SI = &H001A  ' RT3F_7D
L_2B47: BX = DX
L_2B49: DX = DX + &H63
L_2B4C: SI = DX
L_2B4E: SI = SI * (2 ^ 1)
L_2B50: SI = SI * (2 ^ 1)
L_2B52: SI = SI + &H52DE
L_2B56: DI = &H1920
L_2B59: N_1920! = N(SI)  ' RT3F_7B
L_2B5C: BX = BX + &H6C
L_2B5F: SI = BX
L_2B61: SI = SI * (2 ^ 1)
L_2B63: SI = SI * (2 ^ 1)
L_2B65: SI = SI + &H52DE
L_2B69: DI = &H18C0
L_2B6C: N_18C0! = N(SI)  ' RT3F_7B
L_2B6F: SI = &HA66E
L_2B72: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_2B75: GOTO L_2B99
L_2B78: SI = &HA5C4
L_2B7B: BX = SI
L_2B7D: DX = BX
L_2B7F: BX = CINT(N_A5C4!)  ' RT3F_75
L_2B82: DI = BX
L_2B84: DI = DI * (2 ^ 1)
L_2B86: DI = DI * (2 ^ 1)
L_2B88: DI = DI + &H1850
L_2B8C: SI = &H4F6C
L_2B8F: N(DI) = N_4F6C!  ' RT3F_7B
L_2B92: DI = SI
L_2B94: SWAP DX, SI
L_2B96: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_2B99: DI = &HA5C4
L_2B9C: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_2B9F: SI = DI
L_2BA1: DI = &HA696
L_2BA4: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_2BA7: IF CompareLeft! <= CompareRight! THEN GOTO L_2B78  ' flags from L_2BA4
L_2BA9: DI = &H189C
L_2BAC: SI = &H4F6C
L_2BAF: N_189C! = N_4F6C!  ' RT3F_7B
L_2BB2: RETURN
L_2BB3: GOSUB L_2352
L_2BB6: BX = &H10
L_2BB9: ARGPUSH BX  ' RT3E_42
L_2BBC: BX = 6
L_2BBF: LOCATE ARGS(), BX  ' RT3E_44
L_2BC2: ' PRINT statement begins (screen) ; RT3F_BC
L_2BC5: BX = &HAF3E
L_2BC8: PRINT S_AF3E$  ' RT3F_6E; H newline item, ledger correction
L_2BCB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2BCE: BX = &H12
L_2BD1: ARGPUSH BX  ' RT3E_42
L_2BD4: BX = 2
L_2BD7: LOCATE ARGS(), BX  ' RT3E_44
L_2BDA: ' PRINT statement begins (screen) ; RT3F_BC
L_2BDD: DX = BX
L_2BDF: BX = &HAF54
L_2BE2: PRINT S_AF54$  ' RT3F_6E; H newline item, ledger correction
L_2BE5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2BE8: BX = &H13
L_2BEB: ARGPUSH BX  ' RT3E_42
L_2BEE: BX = DX
L_2BF0: LOCATE ARGS(), BX  ' RT3E_44
L_2BF3: ' PRINT statement begins (screen) ; RT3F_BC
L_2BF6: BX = &HAF72
L_2BF9: PRINT S_AF72$  ' RT3F_6E; H newline item, ledger correction
L_2BFC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2BFF: DI = &HAE0E
L_2C02: SI = &HA682
L_2C05: N_AE0E! = N_A682!  ' RT3F_7B
L_2C08: BX = &H14
L_2C0B: ARGPUSH BX  ' RT3E_42
L_2C0E: BX = 2
L_2C11: LOCATE ARGS(), BX  ' RT3E_44
L_2C14: ' PRINT statement begins (screen) ; RT3F_BC
L_2C17: DX = BX
L_2C19: BX = &HAF8C
L_2C1C: PRINT S_AF8C$  ' RT3F_6E; H newline item, ledger correction
L_2C1F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2C22: BX = &H15
L_2C25: ARGPUSH BX  ' RT3E_42
L_2C28: BX = DX
L_2C2A: LOCATE ARGS(), BX  ' RT3E_44
L_2C2D: ' PRINT statement begins (screen) ; RT3F_BC
L_2C30: BX = &HAF9C
L_2C33: PRINT S_AF9C$  ' RT3F_6E; H newline item, ledger correction
L_2C36: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2C39: BX = &H16
L_2C3C: ARGPUSH BX  ' RT3E_42
L_2C3F: BX = DX
L_2C41: LOCATE ARGS(), BX  ' RT3E_44
L_2C44: ' PRINT statement begins (screen) ; RT3F_BC
L_2C47: BX = &HAFAC
L_2C4A: PRINT S_AFAC$  ' RT3F_6E; H newline item, ledger correction
L_2C4D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2C50: GOSUB L_1E7C
L_2C53: DI = &HAE22
L_2C56: SI = &HAE16
L_2C59: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_2C5C: IF CompareLeft! = CompareRight! THEN GOTO L_2C50  ' flags from L_2C59
L_2C5E: DI = &HAE2E
L_2C61: SI = &HAE16
L_2C64: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_2C67: IF CompareLeft! <> CompareRight! THEN GOTO L_2C6C  ' flags from L_2C64
L_2C69: GOTO L_2C80
L_2C6C: SI = &HAE16
L_2C6F: BX = CINT(N_AE16!)  ' RT3F_75
L_2C72: ON BX GOTO L_2C86, L_2F07, L_3223, L_3503, L_7989  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_2C80: GOSUB L_2352
L_2C83: GOTO L_234F
L_2C86: GOSUB L_2352
L_2C89: GOSUB L_2EA5
L_2C8C: DI = &HAFC4
L_2C8F: SI = &HAFCC
L_2C92: N_AFC4! = N_AFCC!  ' RT3F_7B
L_2C95: DI = &HAFC8
L_2C98: N_AFC8! = N_AFCC!  ' RT3F_7B
L_2C9B: DI = &HAA30
L_2C9E: SI = &HAA34
L_2CA1: N_AA30! = N_AA34!  ' RT3F_7B
L_2CA4: SI = &HAFD0
L_2CA7: FAC! = N_AFD0!: DI = &H001E  ' RT3F_6F
L_2CAA: GOTO L_2D28
L_2CAD: ' Alignment NOP
L_2CAE: SI = &HAFD4
L_2CB1: BX = SI
L_2CB3: DX = BX
L_2CB5: BX = CINT(N_AFD4!)  ' RT3F_75
L_2CB8: SI = BX
L_2CBA: SI = SI * (2 ^ 1)
L_2CBC: SI = SI * (2 ^ 1)
L_2CBE: SI = SI + &H1850
L_2CC2: DI = &HA844
L_2CC5: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_2CC8: DI = &HA5C4
L_2CCB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_2CCE: SI = DI
L_2CD0: CompareLeft! = N_A5C4!: CompareRight! = 0  ' RT3F_A7
L_2CD3: IF CompareLeft! >= CompareRight! THEN GOTO L_2CD8  ' flags from L_2CD0
L_2CD5: GOTO L_2D1F
L_2CD8: BX = CINT(N(SI))  ' RT3F_75
L_2CDB: CX = BX
L_2CDD: BX = BX * (2 ^ 1)
L_2CDF: BX = BX * (2 ^ 1)
L_2CE1: BX = BX + &H43F4
L_2CE5: AX = DX
L_2CE7: DX = &HAD12
L_2CEA: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2CED: SI = AX
L_2CEF: DI = &HA854
L_2CF2: FAC! = N(SI) + N_A854!  ' RT3F_7F
L_2CF5: BX = CINT(FAC!)  ' RT3F_77
L_2CF8: SI = BX
L_2CFA: SI = SI * (2 ^ 1)
L_2CFC: SI = SI * (2 ^ 1)
L_2CFE: SI = SI + &H1850
L_2D02: DI = &HAFD8
L_2D05: N_AFD8! = N(SI)  ' RT3F_7B
L_2D08: CX = CX + &H1E6
L_2D0C: SI = CX
L_2D0E: SI = SI * (2 ^ 1)
L_2D10: SI = SI * (2 ^ 1)
L_2D12: SI = SI + &H586E
L_2D16: DI = &HAFDC
L_2D19: N_AFDC! = N(SI)  ' RT3F_7B
L_2D1C: GOSUB L_32D4
L_2D1F: DI = &HA840
L_2D22: SI = &HAFD4
L_2D25: FAC! = N_AFD4! + N_A840!  ' RT3F_7F
L_2D28: DI = &HAFD4
L_2D2B: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_2D2E: SI = DI
L_2D30: DI = &HAFE0
L_2D33: CompareLeft! = N_AFD4!: CompareRight! = N_AFE0!  ' RT3F_9F
L_2D36: IF CompareLeft! > CompareRight! THEN GOTO L_2D3B  ' flags from L_2D33
L_2D38: GOTO L_2CAE
L_2D3B: DI = &HAFE4
L_2D3E: SI = &HAFD4
L_2D41: CompareLeft! = N_AFD4!: CompareRight! = N_AFE4!  ' RT3F_9F
L_2D44: IF CompareLeft! <= CompareRight! THEN GOTO L_2D49  ' flags from L_2D41
L_2D46: GOTO L_2BB3
L_2D49: SI = &HAFE8
L_2D4C: FAC! = N_AFE8!: DI = &H001E  ' RT3F_6F
L_2D4F: GOTO L_2DD2
L_2D52: SI = &HAFD4
L_2D55: BX = SI
L_2D57: DX = BX
L_2D59: BX = CINT(N_AFD4!)  ' RT3F_75
L_2D5C: SI = BX
L_2D5E: SI = SI * (2 ^ 1)
L_2D60: SI = SI * (2 ^ 1)
L_2D62: SI = SI + &H1850
L_2D66: DI = &HA844
L_2D69: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_2D6C: DI = &HA5C4
L_2D6F: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_2D72: SI = DI
L_2D74: CompareLeft! = N_A5C4!: CompareRight! = 0  ' RT3F_A7
L_2D77: IF CompareLeft! >= CompareRight! THEN GOTO L_2D7C  ' flags from L_2D74
L_2D79: GOTO L_2DC9
L_2D7C: BX = CINT(N(SI))  ' RT3F_75
L_2D7F: CX = BX
L_2D81: BX = BX * (2 ^ 1)
L_2D83: BX = BX * (2 ^ 1)
L_2D85: BX = BX + &H43F4
L_2D89: AX = &HAFEC
L_2D8C: BX = TEMP_DESC(S_AFEC$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_2D8F: AX = DX
L_2D91: DX = &HAD12
L_2D94: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2D97: SI = AX
L_2D99: DI = &H4F94
L_2D9C: FAC! = N(SI) + N_4F94!  ' RT3F_7F
L_2D9F: BX = CINT(FAC!)  ' RT3F_77
L_2DA2: SI = BX
L_2DA4: SI = SI * (2 ^ 1)
L_2DA6: SI = SI * (2 ^ 1)
L_2DA8: SI = SI + &H1850
L_2DAC: DI = &HAFD8
L_2DAF: N_AFD8! = N(SI)  ' RT3F_7B
L_2DB2: CX = CX + &H17A
L_2DB6: SI = CX
L_2DB8: SI = SI * (2 ^ 1)
L_2DBA: SI = SI * (2 ^ 1)
L_2DBC: SI = SI + &H586E
L_2DC0: DI = &HAFDC
L_2DC3: N_AFDC! = N(SI)  ' RT3F_7B
L_2DC6: GOSUB L_32D4
L_2DC9: DI = &HA5C0
L_2DCC: SI = &HAFD4
L_2DCF: FAC! = N_AFD4! + N_A5C0!  ' RT3F_7F
L_2DD2: DI = &HAFD4
L_2DD5: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_2DD8: SI = DI
L_2DDA: DI = &HAFFA
L_2DDD: CompareLeft! = N_AFD4!: CompareRight! = N_AFFA!  ' RT3F_9F
L_2DE0: IF CompareLeft! > CompareRight! THEN GOTO L_2DE5  ' flags from L_2DDD
L_2DE2: GOTO L_2D52
L_2DE5: DI = &HAFE4
L_2DE8: SI = &HAFD4
L_2DEB: CompareLeft! = N_AFD4!: CompareRight! = N_AFE4!  ' RT3F_9F
L_2DEE: IF CompareLeft! <= CompareRight! THEN GOTO L_2DF3  ' flags from L_2DEB
L_2DF0: GOTO L_2BB3
L_2DF3: SI = &HAFFE
L_2DF6: FAC! = N_AFFE!: DI = &H001E  ' RT3F_6F
L_2DF9: GOTO L_2E75
L_2DFC: SI = &HAFD4
L_2DFF: BX = SI
L_2E01: DX = BX
L_2E03: BX = CINT(N_AFD4!)  ' RT3F_75
L_2E06: SI = BX
L_2E08: SI = SI * (2 ^ 1)
L_2E0A: SI = SI * (2 ^ 1)
L_2E0C: SI = SI + &H1850
L_2E10: DI = &HA844
L_2E13: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_2E16: DI = &HA5C4
L_2E19: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_2E1C: SI = DI
L_2E1E: CompareLeft! = N_A5C4!: CompareRight! = 0  ' RT3F_A7
L_2E21: IF CompareLeft! >= CompareRight! THEN GOTO L_2E26  ' flags from L_2E1E
L_2E23: GOTO L_2E6C
L_2E26: BX = CINT(N(SI))  ' RT3F_75
L_2E29: CX = BX
L_2E2B: BX = BX * (2 ^ 1)
L_2E2D: BX = BX * (2 ^ 1)
L_2E2F: BX = BX + &H4534
L_2E33: AX = DX
L_2E35: DX = &HAD12
L_2E38: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2E3B: SI = AX
L_2E3D: DI = &H4F94
L_2E40: FAC! = N(SI) + N_4F94!  ' RT3F_7F
L_2E43: BX = CINT(FAC!)  ' RT3F_77
L_2E46: SI = BX
L_2E48: SI = SI * (2 ^ 1)
L_2E4A: SI = SI * (2 ^ 1)
L_2E4C: SI = SI + &H1850
L_2E50: DI = &HAFD8
L_2E53: N_AFD8! = N(SI)  ' RT3F_7B
L_2E56: CX = CX + &HB
L_2E59: SI = CX
L_2E5B: SI = SI * (2 ^ 1)
L_2E5D: SI = SI * (2 ^ 1)
L_2E5F: SI = SI + &H63C6
L_2E63: DI = &HAFDC
L_2E66: N_AFDC! = N(SI)  ' RT3F_7B
L_2E69: GOSUB L_32D4
L_2E6C: DI = &HA5C0
L_2E6F: SI = &HAFD4
L_2E72: FAC! = N_AFD4! + N_A5C0!  ' RT3F_7F
L_2E75: DI = &HAFD4
L_2E78: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_2E7B: SI = DI
L_2E7D: DI = &HB002
L_2E80: CompareLeft! = N_AFD4!: CompareRight! = N_B002!  ' RT3F_9F
L_2E83: IF CompareLeft! > CompareRight! THEN GOTO L_2E88  ' flags from L_2E80
L_2E85: GOTO L_2DFC
L_2E88: DI = &HAFE4
L_2E8B: SI = &HAFD4
L_2E8E: CompareLeft! = N_AFD4!: CompareRight! = N_AFE4!  ' RT3F_9F
L_2E91: IF CompareLeft! <= CompareRight! THEN GOTO L_2E96  ' flags from L_2E8E
L_2E93: GOTO L_2BB3
L_2E96: DI = &HAFC4
L_2E99: SI = &HA68A
L_2E9C: N_AFC4! = N_A68A!  ' RT3F_7B
L_2E9F: GOSUB L_32D4
L_2EA2: GOTO L_2BB3
L_2EA5: BX = &H10
L_2EA8: ARGPUSH BX  ' RT3E_42
L_2EAB: BX = 2
L_2EAE: LOCATE ARGS(), BX  ' RT3E_44
L_2EB1: ' PRINT statement begins (screen) ; RT3F_BC
L_2EB4: BX = &HB006
L_2EB7: PRINT S_B006$;  ' RT3F_6A
L_2EBA: DI = &HA704
L_2EBD: SI = &HB028
L_2EC0: N_A704! = N_B028!  ' RT3F_7B
L_2EC3: GOSUB L_07E8
L_2EC6: BX = &H1A
L_2EC9: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_2ECC: BX = &HB01C
L_2ECF: PRINT S_B01C$  ' RT3F_6E; H newline item, ledger correction
L_2ED2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2ED5: RETURN
L_2ED6: BX = &H10
L_2ED9: ARGPUSH BX  ' RT3E_42
L_2EDC: BX = 2
L_2EDF: LOCATE ARGS(), BX  ' RT3E_44
L_2EE2: ' PRINT statement begins (screen) ; RT3F_BC
L_2EE5: BX = &HB02C
L_2EE8: PRINT S_B02C$;  ' RT3F_6A
L_2EEB: DI = &HA704
L_2EEE: SI = &HB028
L_2EF1: N_A704! = N_B028!  ' RT3F_7B
L_2EF4: GOSUB L_07E8
L_2EF7: BX = &H1A
L_2EFA: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_2EFD: BX = &HB044
L_2F00: PRINT S_B044$  ' RT3F_6E; H newline item, ledger correction
L_2F03: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_2F06: RETURN
L_2F07: GOSUB L_2352
L_2F0A: GOSUB L_2ED6
L_2F0D: DI = &HAFC4
L_2F10: SI = &HA844
L_2F13: N_AFC4! = N_A844!  ' RT3F_7B
L_2F16: DI = &HAFC8
L_2F19: SI = &HB050
L_2F1C: N_AFC8! = N_B050!  ' RT3F_7B
L_2F1F: DI = &HAFD4
L_2F22: SI = &HAA12
L_2F25: N_AFD4! = N_AA12!  ' RT3F_7B
L_2F28: SI = DI
L_2F2A: BX = CINT(N_AFD4!)  ' RT3F_75
L_2F2D: SI = BX
L_2F2F: SI = SI * (2 ^ 1)
L_2F31: SI = SI * (2 ^ 1)
L_2F33: SI = SI + &H1850
L_2F37: DI = &HA844
L_2F3A: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_2F3D: DI = &HA5C4
L_2F40: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_2F43: BX = DI
L_2F45: DI = &HAA30
L_2F48: SI = &HB054
L_2F4B: N_AA30! = N_B054!  ' RT3F_7B
L_2F4E: SI = BX
L_2F50: CompareLeft! = N_A5C4!: CompareRight! = 0  ' RT3F_A7
L_2F53: IF CompareLeft! >= CompareRight! THEN GOTO L_2F58  ' flags from L_2F50
L_2F55: GOTO L_2F83
L_2F58: BX = CINT(N(SI))  ' RT3F_75
L_2F5B: DX = BX
L_2F5D: BX = BX * (2 ^ 1)
L_2F5F: BX = BX * (2 ^ 1)
L_2F61: BX = BX + &H4384
L_2F65: CX = DX
L_2F67: DX = &HAD12
L_2F6A: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2F6D: CX = CX + 3
L_2F70: SI = CX
L_2F72: SI = SI * (2 ^ 1)
L_2F74: SI = SI * (2 ^ 1)
L_2F76: SI = SI + &H552A
L_2F7A: DI = &HAFDC
L_2F7D: N_AFDC! = N(SI)  ' RT3F_7B
L_2F80: GOSUB L_32D4
L_2F83: DI = &HAFD4
L_2F86: SI = &HB058
L_2F89: N_AFD4! = N_B058!  ' RT3F_7B
L_2F8C: SI = DI
L_2F8E: BX = CINT(N_AFD4!)  ' RT3F_75
L_2F91: SI = BX
L_2F93: SI = SI * (2 ^ 1)
L_2F95: SI = SI * (2 ^ 1)
L_2F97: SI = SI + &H1850
L_2F9B: DI = &HA844
L_2F9E: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_2FA1: DI = &HA5C4
L_2FA4: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_2FA7: BX = DI
L_2FA9: DI = &HAA30
L_2FAC: SI = &HB05C
L_2FAF: N_AA30! = N_B05C!  ' RT3F_7B
L_2FB2: SI = BX
L_2FB4: CompareLeft! = N_A5C4!: CompareRight! = 0  ' RT3F_A7
L_2FB7: IF CompareLeft! >= CompareRight! THEN GOTO L_2FBC  ' flags from L_2FB4
L_2FB9: GOTO L_2FE7
L_2FBC: BX = CINT(N(SI))  ' RT3F_75
L_2FBF: DX = BX
L_2FC1: BX = BX * (2 ^ 1)
L_2FC3: BX = BX * (2 ^ 1)
L_2FC5: BX = BX + &H4370
L_2FC9: CX = DX
L_2FCB: DX = &HAD12
L_2FCE: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_2FD1: CX = CX + 5
L_2FD4: SI = CX
L_2FD6: SI = SI * (2 ^ 1)
L_2FD8: SI = SI * (2 ^ 1)
L_2FDA: SI = SI + &H54EE
L_2FDE: DI = &HAFDC
L_2FE1: N_AFDC! = N(SI)  ' RT3F_7B
L_2FE4: GOSUB L_32D4
L_2FE7: SI = &HB060
L_2FEA: FAC! = N_B060!: DI = &H001E  ' RT3F_6F
L_2FED: GOTO L_3091
L_2FF0: SI = &HAFD4
L_2FF3: BX = SI
L_2FF5: DX = BX
L_2FF7: BX = CINT(N_AFD4!)  ' RT3F_75
L_2FFA: SI = BX
L_2FFC: SI = SI * (2 ^ 1)
L_2FFE: SI = SI * (2 ^ 1)
L_3000: SI = SI + &H1850
L_3004: DI = &HA844
L_3007: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_300A: DI = &HA5C4
L_300D: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_3010: SI = DX
L_3012: BX = DI
L_3014: DI = &HA5C0
L_3017: FAC! = N(SI) / N_A5C0!  ' RT3F_87
L_301A: DI = &HB06E
L_301D: FAC! = FAC! + N_B06E!  ' RT3F_81
L_3020: DX = BX
L_3022: BX = &H1A
L_3025: FAC! = INT(FAC!)  ' RT3D_03
L_3028: DI = &HAA30
L_302B: N_AA30! = FAC!: SI = &H001A  ' RT3F_7D
L_302E: SI = DX
L_3030: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3033: IF CompareLeft! >= CompareRight! THEN GOTO L_3038  ' flags from L_3030
L_3035: GOTO L_3088
L_3038: SWAP DI, SI
L_303A: DI = &HB072
L_303D: FAC! = N(SI) + N_B072!  ' RT3F_7F
L_3040: BX = &H1A
L_3043: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_3046: AX = &HB064
L_3049: BX = TEMP_DESC(S_B064$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_304C: AX = BX
L_304E: BX = &HB076
L_3051: BX = TEMP_DESC(S(AX) + S_B076$)  ' BX receives a temporary descriptor  ' RT3F_55
L_3054: SI = DX
L_3056: CX = BX
L_3058: BX = CINT(N(SI))  ' RT3F_75
L_305B: DX = BX
L_305D: BX = BX * (2 ^ 1)
L_305F: BX = BX * (2 ^ 1)
L_3061: BX = BX + &H435C
L_3065: AX = CX
L_3067: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_306A: CX = DX
L_306C: DX = &HAD12
L_306F: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_3072: CX = CX + 5
L_3075: SI = CX
L_3077: SI = SI * (2 ^ 1)
L_3079: SI = SI * (2 ^ 1)
L_307B: SI = SI + &H54B2
L_307F: DI = &HAFDC
L_3082: N_AFDC! = N(SI)  ' RT3F_7B
L_3085: GOSUB L_32D4
L_3088: DI = &HA5C0
L_308B: SI = &HAFD4
L_308E: FAC! = N_AFD4! + N_A5C0!  ' RT3F_7F
L_3091: DI = &HAFD4
L_3094: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_3097: SI = DI
L_3099: DI = &HB07C
L_309C: CompareLeft! = N_AFD4!: CompareRight! = N_B07C!  ' RT3F_9F
L_309F: IF CompareLeft! > CompareRight! THEN GOTO L_30A4  ' flags from L_309C
L_30A1: GOTO L_2FF0
L_30A4: DI = &HAFE4
L_30A7: SI = &HAFD4
L_30AA: CompareLeft! = N_AFD4!: CompareRight! = N_AFE4!  ' RT3F_9F
L_30AD: IF CompareLeft! <= CompareRight! THEN GOTO L_30B2  ' flags from L_30AA
L_30AF: GOTO L_2BB3
L_30B2: SI = &HB080
L_30B5: FAC! = N_B080!: DI = &H001E  ' RT3F_6F
L_30B8: GOTO L_315D
L_30BB: ' Alignment NOP
L_30BC: SI = &HAFD4
L_30BF: BX = SI
L_30C1: DX = BX
L_30C3: BX = CINT(N_AFD4!)  ' RT3F_75
L_30C6: SI = BX
L_30C8: SI = SI * (2 ^ 1)
L_30CA: SI = SI * (2 ^ 1)
L_30CC: SI = SI + &H1850
L_30D0: DI = &HA844
L_30D3: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_30D6: DI = &HA5C4
L_30D9: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_30DC: SI = DX
L_30DE: BX = DI
L_30E0: DI = &HA850
L_30E3: FAC! = N(SI) / N_A850!  ' RT3F_87
L_30E6: DI = &HB084
L_30E9: FAC! = FAC! + N_B084!  ' RT3F_81
L_30EC: DX = BX
L_30EE: BX = &H1A
L_30F1: FAC! = INT(FAC!)  ' RT3D_03
L_30F4: DI = &HAA30
L_30F7: N_AA30! = FAC!: SI = &H001A  ' RT3F_7D
L_30FA: SI = DX
L_30FC: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_30FF: IF CompareLeft! >= CompareRight! THEN GOTO L_3104  ' flags from L_30FC
L_3101: GOTO L_3154
L_3104: SWAP DI, SI
L_3106: DI = &HA9A8
L_3109: FAC! = N(SI) + N_A9A8!  ' RT3F_7F
L_310C: BX = &H1A
L_310F: BX = TEMP_DESC(STR$(FAC!))  ' BX receives a temporary descriptor  ' RT3D_11
L_3112: AX = &HB088
L_3115: BX = TEMP_DESC(S_B088$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_3118: AX = BX
L_311A: BX = &HB076
L_311D: BX = TEMP_DESC(S(AX) + S_B076$)  ' BX receives a temporary descriptor  ' RT3F_55
L_3120: SI = DX
L_3122: CX = BX
L_3124: BX = CINT(N(SI))  ' RT3F_75
L_3127: DX = BX
L_3129: BX = BX * (2 ^ 1)
L_312B: BX = BX * (2 ^ 1)
L_312D: BX = BX + &H4390
L_3131: AX = CX
L_3133: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_3136: CX = DX
L_3138: DX = &HAD12
L_313B: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_313E: CX = CX + &H64
L_3141: SI = CX
L_3143: SI = SI * (2 ^ 1)
L_3145: SI = SI * (2 ^ 1)
L_3147: SI = SI + &H554E
L_314B: DI = &HAFDC
L_314E: N_AFDC! = N(SI)  ' RT3F_7B
L_3151: GOSUB L_32D4
L_3154: DI = &HA850
L_3157: SI = &HAFD4
L_315A: FAC! = N_AFD4! + N_A850!  ' RT3F_7F
L_315D: DI = &HAFD4
L_3160: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_3163: SI = DI
L_3165: DI = &HB090
L_3168: CompareLeft! = N_AFD4!: CompareRight! = N_B090!  ' RT3F_9F
L_316B: IF CompareLeft! > CompareRight! THEN GOTO L_3170  ' flags from L_3168
L_316D: GOTO L_30BC
L_3170: DI = &HAFE4
L_3173: SI = &HAFD4
L_3176: CompareLeft! = N_AFD4!: CompareRight! = N_AFE4!  ' RT3F_9F
L_3179: IF CompareLeft! <= CompareRight! THEN GOTO L_317E  ' flags from L_3176
L_317B: GOTO L_2BB3
L_317E: SI = &HB094
L_3181: FAC! = N_B094!: DI = &H001E  ' RT3F_6F
L_3184: GOTO L_31F6
L_3187: ' Alignment NOP
L_3188: SI = &HAFD4
L_318B: BX = SI
L_318D: DX = BX
L_318F: BX = CINT(N_AFD4!)  ' RT3F_75
L_3192: SI = BX
L_3194: SI = SI * (2 ^ 1)
L_3196: SI = SI * (2 ^ 1)
L_3198: SI = SI + &H1850
L_319C: DI = &HA844
L_319F: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_31A2: DI = &HA5C4
L_31A5: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_31A8: SI = DX
L_31AA: BX = DI
L_31AC: DI = &HAA30
L_31AF: N_AA30! = N(SI)  ' RT3F_7B
L_31B2: SI = BX
L_31B4: CompareLeft! = N_A5C4!: CompareRight! = 0  ' RT3F_A7
L_31B7: IF CompareLeft! >= CompareRight! THEN GOTO L_31BC  ' flags from L_31B4
L_31B9: GOTO L_31ED
L_31BC: BX = CINT(N(SI))  ' RT3F_75
L_31BF: DX = BX
L_31C1: BX = BX * (2 ^ 1)
L_31C3: BX = BX * (2 ^ 1)
L_31C5: BX = BX + &H4390
L_31C9: AX = &HB098
L_31CC: BX = TEMP_DESC(S_B098$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_31CF: CX = DX
L_31D1: DX = &HAD12
L_31D4: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_31D7: CX = CX + &H7D
L_31DA: SI = CX
L_31DC: SI = SI * (2 ^ 1)
L_31DE: SI = SI * (2 ^ 1)
L_31E0: SI = SI + &H554E
L_31E4: DI = &HAFDC
L_31E7: N_AFDC! = N(SI)  ' RT3F_7B
L_31EA: GOSUB L_32D4
L_31ED: DI = &H4F6C
L_31F0: SI = &HAFD4
L_31F3: FAC! = N_AFD4! + N_4F6C!  ' RT3F_7F
L_31F6: DI = &HAFD4
L_31F9: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_31FC: SI = DI
L_31FE: DI = &HB0A6
L_3201: CompareLeft! = N_AFD4!: CompareRight! = N_B0A6!  ' RT3F_9F
L_3204: IF CompareLeft! <= CompareRight! THEN GOTO L_3188  ' flags from L_3201
L_3206: DI = &HAFE4
L_3209: SI = &HAFD4
L_320C: CompareLeft! = N_AFD4!: CompareRight! = N_AFE4!  ' RT3F_9F
L_320F: IF CompareLeft! <= CompareRight! THEN GOTO L_3214  ' flags from L_320C
L_3211: GOTO L_2BB3
L_3214: DI = &HAFC4
L_3217: SI = &HA68A
L_321A: N_AFC4! = N_A68A!  ' RT3F_7B
L_321D: GOSUB L_32D4
L_3220: GOTO L_2BB3
L_3223: GOSUB L_2352
L_3226: GOSUB L_2ED6
L_3229: DI = &HAFC4
L_322C: SI = &HA844
L_322F: N_AFC4! = N_A844!  ' RT3F_7B
L_3232: DI = &HAFC8
L_3235: SI = &HB050
L_3238: N_AFC8! = N_B050!  ' RT3F_7B
L_323B: SI = &HA83C
L_323E: FAC! = N_A83C!: DI = &H001E  ' RT3F_6F
L_3241: GOTO L_32A7
L_3244: SI = &HAFD4
L_3247: BX = SI
L_3249: DX = BX
L_324B: BX = CINT(N_AFD4!)  ' RT3F_75
L_324E: SI = BX
L_3250: SI = SI * (2 ^ 1)
L_3252: SI = SI * (2 ^ 1)
L_3254: SI = SI + &H1850
L_3258: DI = &HA5C4
L_325B: N_A5C4! = N(SI)  ' RT3F_7B
L_325E: SI = DX
L_3260: BX = DI
L_3262: DI = &HAA30
L_3265: N_AA30! = N_AFD4!  ' RT3F_7B
L_3268: SWAP BX, SI
L_326A: CompareLeft! = N_A5C4!: CompareRight! = 0  ' RT3F_A7
L_326D: IF CompareLeft! <> CompareRight! THEN GOTO L_3272  ' flags from L_326A
L_326F: GOTO L_329E
L_3272: SI = DX
L_3274: DI = &HB0AA
L_3277: FAC! = N(SI) + N_B0AA!  ' RT3F_7F
L_327A: BX = CINT(FAC!)  ' RT3F_77
L_327D: BX = BX * (2 ^ 1)
L_327F: BX = BX * (2 ^ 1)
L_3281: DX = BX
L_3283: BX = BX + &H4560
L_3287: CX = DX
L_3289: DX = &HAD12
L_328C: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_328F: CX = CX + &H641E
L_3293: SI = CX
L_3295: DI = &HAFDC
L_3298: N_AFDC! = N(SI)  ' RT3F_7B
L_329B: GOSUB L_32D4
L_329E: DI = &H4F6C
L_32A1: SI = &HAFD4
L_32A4: FAC! = N_AFD4! + N_4F6C!  ' RT3F_7F
L_32A7: DI = &HAFD4
L_32AA: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_32AD: SI = DI
L_32AF: DI = &HB0AE
L_32B2: CompareLeft! = N_AFD4!: CompareRight! = N_B0AE!  ' RT3F_9F
L_32B5: IF CompareLeft! <= CompareRight! THEN GOTO L_3244  ' flags from L_32B2
L_32B7: DI = &HAFE4
L_32BA: SI = &HAFD4
L_32BD: CompareLeft! = N_AFD4!: CompareRight! = N_AFE4!  ' RT3F_9F
L_32C0: IF CompareLeft! <= CompareRight! THEN GOTO L_32C5  ' flags from L_32BD
L_32C2: GOTO L_2BB3
L_32C5: DI = &HAFC4
L_32C8: SI = &HA68A
L_32CB: N_AFC4! = N_A68A!  ' RT3F_7B
L_32CE: GOSUB L_32D4
L_32D1: GOTO L_2BB3
L_32D4: SI = &HAFC4
L_32D7: CompareLeft! = N_AFC4!: CompareRight! = 0  ' RT3F_A7
L_32DA: IF CompareLeft! <= CompareRight! THEN GOTO L_32DF  ' flags from L_32D7
L_32DC: GOTO L_33E9
L_32DF: DI = &HB0B2
L_32E2: SI = &HB028
L_32E5: N_B0B2! = N_B028!  ' RT3F_7B
L_32E8: DI = &H4F6C
L_32EB: SI = &HAFC8
L_32EE: FAC! = N_AFC8! + N_4F6C!  ' RT3F_7F
L_32F1: DI = SI
L_32F3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_32F6: SI = DI
L_32F8: DI = &HA97C
L_32FB: FAC! = N(SI) + N_A97C!  ' RT3F_7F
L_32FE: BX = SI
L_3300: DX = BX
L_3302: BX = CINT(FAC!)  ' RT3F_77
L_3305: ARGPUSH BX  ' RT3E_42
L_3308: BX = 2
L_330B: LOCATE ARGS(), BX  ' RT3E_44
L_330E: ' PRINT statement begins (screen) ; RT3F_BC
L_3311: SI = DX
L_3313: DI = &HB0B6
L_3316: FAC! = N(SI) + N_B0B6!  ' RT3F_7F
L_3319: BX = CINT(FAC!)  ' RT3F_77
L_331C: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_331F: PRINT S(BX);  ' RT3F_6A
L_3322: BX = &HA63C
L_3325: PRINT S_A63C$;  ' RT3F_6A
L_3328: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_332B: SI = &HAFC4
L_332E: CompareLeft! = N_AFC4!: CompareRight! = 0  ' RT3F_A7
L_3331: IF CompareLeft! < CompareRight! THEN GOTO L_3336  ' flags from L_332E
L_3333: GOTO L_334B
L_3336: ' PRINT statement begins (screen) ; RT3F_BC
L_3339: BX = &HAD12
L_333C: DX = &H24
L_333F: BX = TEMP_DESC(LEFT$(S_AD12$, DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_3342: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_3345: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3348: GOTO L_3392
L_334B: ' PRINT statement begins (screen) ; RT3F_BC
L_334E: SI = &HAFD8
L_3351: BX = CINT(N_AFD8!)  ' RT3F_75
L_3354: BX = BX * (2 ^ 1)
L_3356: BX = BX * (2 ^ 1)
L_3358: BX = BX + &HA590
L_335C: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_335F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3362: DI = &HA97C
L_3365: SI = &HAFC8
L_3368: FAC! = N_AFC8! + N_A97C!  ' RT3F_7F
L_336B: BX = CINT(FAC!)  ' RT3F_77
L_336E: ARGPUSH BX  ' RT3E_42
L_3371: BX = 7
L_3374: LOCATE ARGS(), BX  ' RT3E_44
L_3377: ' PRINT statement begins (screen) ; RT3F_BC
L_337A: BX = &HAD12
L_337D: DX = &H21
L_3380: BX = TEMP_DESC(LEFT$(S_AD12$, DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_3383: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_3386: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3389: DI = &HB0B2
L_338C: SI = &H4F6C
L_338F: N_B0B2! = N_4F6C!  ' RT3F_7B
L_3392: SI = &HAFC8
L_3395: BX = CINT(N_AFC8!)  ' RT3F_75
L_3398: DI = BX
L_339A: DI = DI * (2 ^ 1)
L_339C: DI = DI * (2 ^ 1)
L_339E: BX = DI
L_33A0: DI = DI + &HA50C
L_33A4: SI = &HAFD4
L_33A7: N(DI) = N_AFD4!  ' RT3F_7B
L_33AA: DX = BX
L_33AC: BX = BX + &HA538
L_33B0: DI = BX
L_33B2: SI = &HAFDC
L_33B5: N(DI) = N_AFDC!  ' RT3F_7B
L_33B8: DX = DX + &HA564
L_33BC: DI = DX
L_33BE: SI = &HAA30
L_33C1: N(DI) = N_AA30!  ' RT3F_7B
L_33C4: DI = &HA696
L_33C7: SI = &HAFC8
L_33CA: CompareLeft! = N_AFC8!: CompareRight! = N_A696!  ' RT3F_9F
L_33CD: BX = 0
L_33D0: IF CompareLeft! = CompareRight! THEN GOTO L_33D3  ' flags from L_33CA
L_33D2: BX = BX - 1
L_33D3: SI = &HAFC4
L_33D6: CompareLeft! = N_AFC4!: CompareRight! = 0  ' RT3F_A7
L_33D9: DX = 0
L_33DC: IF CompareLeft! > CompareRight! THEN GOTO L_33DF  ' flags from L_33D6
L_33DE: DX = DX - 1
L_33DF: DX = DX AND BX
L_33E1: CompareLeft% = DX: CompareRight% = 0
L_33E3: IF CompareLeft% <> CompareRight% THEN GOTO L_33E8  ' flags from L_33E1
L_33E5: GOTO L_33E9
L_33E8: RETURN
L_33E9: DI = &HAE0E
L_33EC: SI = &HAFC8
L_33EF: N_AE0E! = N_AFC8!  ' RT3F_7B
L_33F2: BX = &H18
L_33F5: ARGPUSH BX  ' RT3E_42
L_33F8: BX = 2
L_33FB: LOCATE ARGS(), BX  ' RT3E_44
L_33FE: ' PRINT statement begins (screen) ; RT3F_BC
L_3401: BX = &HB0BA
L_3404: PRINT S_B0BA$;  ' RT3F_6A
L_3407: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_340A: SI = &HAFC4
L_340D: CompareLeft! = N_AFC4!: CompareRight! = 0  ' RT3F_A7
L_3410: IF CompareLeft! <= CompareRight! THEN GOTO L_3415  ' flags from L_340D
L_3412: GOTO L_3421
L_3415: ' PRINT statement begins (screen) ; RT3F_BC
L_3418: BX = &HB0D2
L_341B: PRINT S_B0D2$;  ' RT3F_6A
L_341E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3421: GOSUB L_22C4
L_3424: DI = &HAE2E
L_3427: SI = &HAE16
L_342A: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_342D: IF CompareLeft! = CompareRight! THEN GOTO L_3432  ' flags from L_342A
L_342F: GOTO L_343C
L_3432: DI = &HAFD4
L_3435: SI = &HB0EA
L_3438: N_AFD4! = N_B0EA!  ' RT3F_7B
L_343B: RETURN
L_343C: DI = &HAE22
L_343F: SI = &HAE16
L_3442: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_3445: IF CompareLeft! = CompareRight! THEN GOTO L_344A  ' flags from L_3442
L_3447: GOTO L_3457
L_344A: DI = &HAFC8
L_344D: SI = &HB050
L_3450: N_AFC8! = N_B050!  ' RT3F_7B
L_3453: GOSUB L_2374
L_3456: RETURN
L_3457: SI = &HAE16
L_345A: BX = CINT(N_AE16!)  ' RT3F_75
L_345D: SI = BX
L_345F: SI = SI * (2 ^ 1)
L_3461: SI = SI * (2 ^ 1)
L_3463: SI = SI + &HA50C
L_3467: BX = CINT(N(SI))  ' RT3F_75
L_346A: SI = BX
L_346C: SI = SI * (2 ^ 1)
L_346E: SI = SI * (2 ^ 1)
L_3470: SI = SI + &H1850
L_3474: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3477: IF CompareLeft! = CompareRight! THEN GOTO L_3421  ' flags from L_3474
L_3479: SI = &HAE16
L_347C: BX = CINT(N_AE16!)  ' RT3F_75
L_347F: SI = BX
L_3481: SI = SI * (2 ^ 1)
L_3483: SI = SI * (2 ^ 1)
L_3485: BX = SI
L_3487: SI = SI + &HA50C
L_348B: DX = BX
L_348D: BX = CINT(N(SI))  ' RT3F_75
L_3490: DI = BX
L_3492: DI = DI * (2 ^ 1)
L_3494: DI = DI * (2 ^ 1)
L_3496: DI = DI + &H1850
L_349A: SI = &HB050
L_349D: N(DI) = N_B050!  ' RT3F_7B
L_34A0: BX = DX
L_34A2: DX = DX + &HA564
L_34A6: SWAP DX, SI
L_34A8: CX = BX
L_34AA: BX = CINT(N(SI))  ' RT3F_75
L_34AD: DI = BX
L_34AF: DI = DI * (2 ^ 1)
L_34B1: DI = DI * (2 ^ 1)
L_34B3: DI = DI + &H1850
L_34B7: SI = DX
L_34B9: N(DI) = N_B050!  ' RT3F_7B
L_34BC: CX = CX + &HA538
L_34C0: SI = CX
L_34C2: DI = &HAA4C
L_34C5: N_AA4C! = N(SI)  ' RT3F_7B
L_34C8: GOSUB L_1E98
L_34CB: DI = &HA97C
L_34CE: SI = &HAE16
L_34D1: FAC! = N_AE16! + N_A97C!  ' RT3F_7F
L_34D4: BX = CINT(FAC!)  ' RT3F_77
L_34D7: ARGPUSH BX  ' RT3E_42
L_34DA: BX = 2
L_34DD: LOCATE ARGS(), BX  ' RT3E_44
L_34E0: ' PRINT statement begins (screen) ; RT3F_BC
L_34E3: BX = &H26
L_34E6: PRINT SPC(BX);  ' RT3F_35; M ledger
L_34E9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_34EC: SI = &HB0B2
L_34EF: CompareLeft! = N_B0B2!: CompareRight! = 0  ' RT3F_A7
L_34F2: IF CompareLeft! = CompareRight! THEN GOTO L_34F7  ' flags from L_34EF
L_34F4: GOTO L_34FD
L_34F7: GOSUB L_2ED6
L_34FA: GOTO L_3500
L_34FD: GOSUB L_2EA5

```

### Ship sale and Arsenal

```basic
L_3500: GOTO L_3421
L_3503: SI = &H18FC
L_3506: CompareLeft! = N_18FC!: CompareRight! = 0  ' RT3F_A7
L_3509: IF CompareLeft! = CompareRight! THEN GOTO L_350E  ' flags from L_3506
L_350B: GOTO L_352F
L_350E: GOSUB L_2352
L_3511: BX = &H14
L_3514: ARGPUSH BX  ' RT3E_42
L_3517: BX = 2
L_351A: LOCATE ARGS(), BX  ' RT3E_44
L_351D: ' PRINT statement begins (screen) ; RT3F_BC
L_3520: BX = &HB0EE
L_3523: PRINT S_B0EE$  ' RT3F_6E; H newline item, ledger correction
L_3526: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3529: GOSUB L_20B6
L_352C: GOTO L_2BB3
L_352F: GOSUB L_2352
L_3532: BX = &H11
L_3535: ARGPUSH BX  ' RT3E_42
L_3538: BX = 2
L_353B: LOCATE ARGS(), BX  ' RT3E_44
L_353E: ' PRINT statement begins (screen) ; RT3F_BC
L_3541: DX = BX
L_3543: BX = &HB106
L_3546: PRINT S_B106$  ' RT3F_6E; H newline item, ledger correction
L_3549: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_354C: BX = &H12
L_354F: ARGPUSH BX  ' RT3E_42
L_3552: BX = DX
L_3554: LOCATE ARGS(), BX  ' RT3E_44
L_3557: ' PRINT statement begins (screen) ; RT3F_BC
L_355A: BX = &HB130
L_355D: PRINT S_B130$  ' RT3F_6E; H newline item, ledger correction
L_3560: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3563: BX = &H13
L_3566: ARGPUSH BX  ' RT3E_42
L_3569: BX = 2
L_356C: LOCATE ARGS(), BX  ' RT3E_44
L_356F: ' PRINT statement begins (screen) ; RT3F_BC
L_3572: DX = BX
L_3574: BX = &HB152
L_3577: PRINT S_B152$  ' RT3F_6E; H newline item, ledger correction
L_357A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_357D: BX = &H14
L_3580: ARGPUSH BX  ' RT3E_42
L_3583: BX = DX
L_3585: LOCATE ARGS(), BX  ' RT3E_44
L_3588: ' PRINT statement begins (screen) ; RT3F_BC
L_358B: BX = &HB17A
L_358E: PRINT S_B17A$  ' RT3F_6E; H newline item, ledger correction
L_3591: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3594: BX = &H16
L_3597: ARGPUSH BX  ' RT3E_42
L_359A: BX = 2
L_359D: LOCATE ARGS(), BX  ' RT3E_44
L_35A0: ' PRINT statement begins (screen) ; RT3F_BC
L_35A3: DX = BX
L_35A5: BX = &HB18E
L_35A8: PRINT S_B18E$  ' RT3F_6E; H newline item, ledger correction
L_35AB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_35AE: BX = &H17
L_35B1: ARGPUSH BX  ' RT3E_42
L_35B4: BX = DX
L_35B6: LOCATE ARGS(), BX  ' RT3E_44
L_35B9: ' PRINT statement begins (screen) ; RT3F_BC
L_35BC: BX = &HB1B0
L_35BF: PRINT S_B1B0$;  ' RT3F_6A
L_35C2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_35C5: GOSUB L_2950
L_35C8: SI = &HA838
L_35CB: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_35CE: IF CompareLeft! <> CompareRight! THEN GOTO L_35D3  ' flags from L_35CB
L_35D0: GOTO L_2BB3
L_35D3: DI = &HA844
L_35D6: SI = &H18FC
L_35D9: FAC! = N_18FC! + N_A844!  ' RT3F_7F
L_35DC: BX = CINT(FAC!)  ' RT3F_77
L_35DF: SI = BX
L_35E1: SI = SI + &H1B
L_35E4: SI = SI * (2 ^ 1)
L_35E6: SI = SI * (2 ^ 1)
L_35E8: SI = SI + &H52DE
L_35EC: DI = &HB1C0
L_35EF: N_B1C0! = N(SI)  ' RT3F_7B
L_35F2: DI = &HAA4C
L_35F5: SI = &HB050
L_35F8: N_AA4C! = N_B050!  ' RT3F_7B
L_35FB: SI = &H1940
L_35FE: CompareLeft! = N_1940!: CompareRight! = 0  ' RT3F_A7
L_3601: IF CompareLeft! > CompareRight! THEN GOTO L_3606  ' flags from L_35FE
L_3603: GOTO L_3628
L_3606: DI = &HA844
L_3609: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_360C: BX = CINT(FAC!)  ' RT3F_77
L_360F: SI = BX
L_3611: SI = SI + 3
L_3614: SI = SI * (2 ^ 1)
L_3616: SI = SI * (2 ^ 1)
L_3618: SI = SI + &H552A
L_361C: DI = &HB1C4
L_361F: FAC! = N(SI) * N_B1C4!  ' RT3F_8F
L_3622: DI = &HAA4C
L_3625: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_3628: SI = &H194C
L_362B: CompareLeft! = N_194C!: CompareRight! = 0  ' RT3F_A7
L_362E: IF CompareLeft! > CompareRight! THEN GOTO L_3633  ' flags from L_362B
L_3630: GOTO L_365A
L_3633: DI = &HA844
L_3636: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_3639: BX = CINT(FAC!)  ' RT3F_77
L_363C: SI = BX
L_363E: SI = SI + 5
L_3641: SI = SI * (2 ^ 1)
L_3643: SI = SI * (2 ^ 1)
L_3645: SI = SI + &H54EE
L_3649: DI = &HB1C8
L_364C: FAC! = N(SI) * N_B1C8!  ' RT3F_8F
L_364F: SI = &HAA4C
L_3652: FAC! = N_AA4C! - FAC!  ' RT3F_9B
L_3655: DI = SI
L_3657: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_365A: SI = &HB060
L_365D: FAC! = N_B060!: DI = &H001E  ' RT3F_6F
L_3660: GOTO L_36AC
L_3663: ' Alignment NOP
L_3664: SI = &HAFD4
L_3667: BX = CINT(N_AFD4!)  ' RT3F_75
L_366A: SI = BX
L_366C: SI = SI * (2 ^ 1)
L_366E: SI = SI * (2 ^ 1)
L_3670: SI = SI + &H1850
L_3674: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3677: IF CompareLeft! > CompareRight! THEN GOTO L_367C  ' flags from L_3674
L_3679: GOTO L_36A3
L_367C: DI = &HA844
L_367F: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_3682: BX = CINT(FAC!)  ' RT3F_77
L_3685: SI = BX
L_3687: SI = SI + 5
L_368A: SI = SI * (2 ^ 1)
L_368C: SI = SI * (2 ^ 1)
L_368E: SI = SI + &H54B2
L_3692: DI = &HB1C8
L_3695: FAC! = N(SI) * N_B1C8!  ' RT3F_8F
L_3698: SI = &HAA4C
L_369B: FAC! = N_AA4C! - FAC!  ' RT3F_9B
L_369E: DI = SI
L_36A0: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_36A3: DI = &HA5C0
L_36A6: SI = &HAFD4
L_36A9: FAC! = N_AFD4! + N_A5C0!  ' RT3F_7F
L_36AC: DI = &HAFD4
L_36AF: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_36B2: SI = DI
L_36B4: DI = &HB07C
L_36B7: CompareLeft! = N_AFD4!: CompareRight! = N_B07C!  ' RT3F_9F
L_36BA: IF CompareLeft! <= CompareRight! THEN GOTO L_3664  ' flags from L_36B7
L_36BC: SI = &HB080
L_36BF: FAC! = N_B080!: DI = &H001E  ' RT3F_6F
L_36C2: GOTO L_370E
L_36C5: ' Alignment NOP
L_36C6: SI = &HAFD4
L_36C9: BX = CINT(N_AFD4!)  ' RT3F_75
L_36CC: SI = BX
L_36CE: SI = SI * (2 ^ 1)
L_36D0: SI = SI * (2 ^ 1)
L_36D2: SI = SI + &H1850
L_36D6: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_36D9: IF CompareLeft! > CompareRight! THEN GOTO L_36DE  ' flags from L_36D6
L_36DB: GOTO L_3705
L_36DE: DI = &HA844
L_36E1: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_36E4: BX = CINT(FAC!)  ' RT3F_77
L_36E7: SI = BX
L_36E9: SI = SI + &H64
L_36EC: SI = SI * (2 ^ 1)
L_36EE: SI = SI * (2 ^ 1)
L_36F0: SI = SI + &H554E
L_36F4: DI = &HB1C8
L_36F7: FAC! = N(SI) * N_B1C8!  ' RT3F_8F
L_36FA: SI = &HAA4C
L_36FD: FAC! = N_AA4C! - FAC!  ' RT3F_9B
L_3700: DI = SI
L_3702: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3705: DI = &HA850
L_3708: SI = &HAFD4
L_370B: FAC! = N_AFD4! + N_A850!  ' RT3F_7F
L_370E: DI = &HAFD4
L_3711: N_AFD4! = FAC!: SI = &H001A  ' RT3F_7D
L_3714: SI = DI
L_3716: DI = &HB090
L_3719: CompareLeft! = N_AFD4!: CompareRight! = N_B090!  ' RT3F_9F
L_371C: IF CompareLeft! <= CompareRight! THEN GOTO L_36C6  ' flags from L_3719
L_371E: GOSUB L_2352
L_3721: BX = &H11
L_3724: ARGPUSH BX  ' RT3E_42
L_3727: BX = 2
L_372A: LOCATE ARGS(), BX  ' RT3E_44
L_372D: ' PRINT statement begins (screen) ; RT3F_BC
L_3730: BX = &HB1CC
L_3733: PRINT S_B1CC$;  ' RT3F_6A
L_3736: BX = &HB1C0
L_3739: PRINT N_B1C0!;  ' RT3F_67; H expanded ledger
L_373C: BX = &HB1E4
L_373F: PRINT S_B1E4$  ' RT3F_6E; H newline item, ledger correction
L_3742: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3745: BX = &H13
L_3748: ARGPUSH BX  ' RT3E_42
L_374B: BX = 2
L_374E: LOCATE ARGS(), BX  ' RT3E_44
L_3751: ' PRINT statement begins (screen) ; RT3F_BC
L_3754: BX = &HB1F0
L_3757: PRINT S_B1F0$;  ' RT3F_6A
L_375A: BX = &HAA4C
L_375D: PRINT N_AA4C!;  ' RT3F_67; H expanded ledger
L_3760: BX = &HB208
L_3763: PRINT S_B208$  ' RT3F_6E; H newline item, ledger correction
L_3766: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3769: DI = &HAA4C
L_376C: SI = &HB1C0
L_376F: FAC! = N_B1C0! + N_AA4C!  ' RT3F_7F
L_3772: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3775: SI = DI
L_3777: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_377A: IF CompareLeft! < CompareRight! THEN GOTO L_377F  ' flags from L_3777
L_377C: GOTO L_3788
L_377F: SI = &HB050
L_3782: N(DI) = N_B050!  ' RT3F_7B
L_3785: GOSUB L_1E98
L_3788: BX = &H15
L_378B: ARGPUSH BX  ' RT3E_42
L_378E: BX = 2
L_3791: LOCATE ARGS(), BX  ' RT3E_44
L_3794: ' PRINT statement begins (screen) ; RT3F_BC
L_3797: BX = &HB214
L_379A: PRINT S_B214$;  ' RT3F_6A
L_379D: BX = &HAA4C
L_37A0: PRINT N_AA4C!;  ' RT3F_67; H expanded ledger
L_37A3: BX = &HB22C
L_37A6: PRINT S_B22C$  ' RT3F_6E; H newline item, ledger correction
L_37A9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_37AC: DI = &H18FC
L_37AF: SI = &HB050
L_37B2: N_18FC! = N_B050!  ' RT3F_7B
L_37B5: DI = &H192C
L_37B8: N_192C! = N_B050!  ' RT3F_7B
L_37BB: BX = &H18
L_37BE: ARGPUSH BX  ' RT3E_42
L_37C1: BX = &HE
L_37C4: LOCATE ARGS(), BX  ' RT3E_44
L_37C7: GOSUB L_1E98
L_37CA: GOSUB L_20DD
L_37CD: GOTO L_2BB3
L_37D0: GOSUB L_2352
L_37D3: BX = &H10
L_37D6: ARGPUSH BX  ' RT3E_42
L_37D9: BX = 8
L_37DC: LOCATE ARGS(), BX  ' RT3E_44
L_37DF: ' PRINT statement begins (screen) ; RT3F_BC
L_37E2: BX = &HB238
L_37E5: PRINT S_B238$  ' RT3F_6E; H newline item, ledger correction
L_37E8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_37EB: BX = &H13
L_37EE: ARGPUSH BX  ' RT3E_42
L_37F1: BX = 2
L_37F4: LOCATE ARGS(), BX  ' RT3E_44
L_37F7: ' PRINT statement begins (screen) ; RT3F_BC
L_37FA: DX = BX
L_37FC: BX = &HB244
L_37FF: PRINT S_B244$  ' RT3F_6E; H newline item, ledger correction
L_3802: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3805: BX = &H14
L_3808: ARGPUSH BX  ' RT3E_42
L_380B: BX = DX
L_380D: LOCATE ARGS(), BX  ' RT3E_44
L_3810: ' PRINT statement begins (screen) ; RT3F_BC
L_3813: BX = &HB260
L_3816: PRINT S_B260$  ' RT3F_6E; H newline item, ledger correction
L_3819: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_381C: BX = &H15
L_381F: ARGPUSH BX  ' RT3E_42
L_3822: BX = DX
L_3824: LOCATE ARGS(), BX  ' RT3E_44
L_3827: ' PRINT statement begins (screen) ; RT3F_BC
L_382A: BX = &HB27A
L_382D: PRINT S_B27A$  ' RT3F_6E; H newline item, ledger correction
L_3830: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3833: DI = &HAE26
L_3836: SI = &H4F6C
L_3839: N_AE26! = N_4F6C!  ' RT3F_7B
L_383C: DI = &HAE0E
L_383F: SI = &HA5C0
L_3842: N_AE0E! = N_A5C0!  ' RT3F_7B
L_3845: GOSUB L_1E7C
L_3848: DI = &HAE22
L_384B: SI = &HAE16
L_384E: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_3851: IF CompareLeft! = CompareRight! THEN GOTO L_3833  ' flags from L_384E
L_3853: DI = &HAE2E
L_3856: SI = &HAE16
L_3859: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_385C: IF CompareLeft! <> CompareRight! THEN GOTO L_3861  ' flags from L_3859
L_385E: GOTO L_234F
L_3861: GOSUB L_2352
L_3864: SI = &HAE16
L_3867: BX = CINT(N_AE16!)  ' RT3F_75
L_386A: ON BX GOTO L_3874, L_4771, L_5198  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_3874: BX = &HB288
L_3877: DX = &HAB72
L_387A: S_AB72$ = S_B288$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_387D: GOSUB L_1F14
L_3880: SI = &HA9FE
L_3883: CompareLeft! = N_A9FE!: CompareRight! = 0  ' RT3F_A7
L_3886: IF CompareLeft! <> CompareRight! THEN GOTO L_388B  ' flags from L_3883
L_3888: GOTO L_37D0
L_388B: GOSUB L_2352
L_388E: GOSUB L_4134
L_3891: BX = &H13
L_3894: ARGPUSH BX  ' RT3E_42
L_3897: BX = 2
L_389A: LOCATE ARGS(), BX  ' RT3E_44
L_389D: ' PRINT statement begins (screen) ; RT3F_BC
L_38A0: DX = BX
L_38A2: BX = &HB29A
L_38A5: PRINT S_B29A$  ' RT3F_6E; H newline item, ledger correction
L_38A8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_38AB: BX = &H14
L_38AE: ARGPUSH BX  ' RT3E_42
L_38B1: BX = DX
L_38B3: LOCATE ARGS(), BX  ' RT3E_44
L_38B6: ' PRINT statement begins (screen) ; RT3F_BC
L_38B9: BX = &HB2AE
L_38BC: PRINT S_B2AE$  ' RT3F_6E; H newline item, ledger correction
L_38BF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_38C2: BX = &H15
L_38C5: ARGPUSH BX  ' RT3E_42
L_38C8: BX = DX
L_38CA: LOCATE ARGS(), BX  ' RT3E_44
L_38CD: ' PRINT statement begins (screen) ; RT3F_BC
L_38D0: BX = &HB2B8
L_38D3: PRINT S_B2B8$  ' RT3F_6E; H newline item, ledger correction
L_38D6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_38D9: BX = &H13
L_38DC: ARGPUSH BX  ' RT3E_42
L_38DF: BX = &H14
L_38E2: LOCATE ARGS(), BX  ' RT3E_44
L_38E5: ' PRINT statement begins (screen) ; RT3F_BC
L_38E8: DX = BX
L_38EA: BX = &HB2CA
L_38ED: PRINT S_B2CA$  ' RT3F_6E; H newline item, ledger correction
L_38F0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_38F3: BX = DX
L_38F5: ARGPUSH BX  ' RT3E_42
L_38F8: LOCATE ARGS(), BX  ' RT3E_44
L_38FB: ' PRINT statement begins (screen) ; RT3F_BC
L_38FE: BX = &HB2E2
L_3901: PRINT S_B2E2$  ' RT3F_6E; H newline item, ledger correction
L_3904: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3907: BX = &H15
L_390A: ARGPUSH BX  ' RT3E_42
L_390D: BX = DX
L_390F: LOCATE ARGS(), BX  ' RT3E_44
L_3912: ' PRINT statement begins (screen) ; RT3F_BC
L_3915: BX = &HB2EE
L_3918: PRINT S_B2EE$  ' RT3F_6E; H newline item, ledger correction
L_391B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_391E: DI = &HAE0E
L_3921: SI = &HA696
L_3924: N_AE0E! = N_A696!  ' RT3F_7B
L_3927: GOSUB L_1E7C
L_392A: DI = &HAE22
L_392D: SI = &HAE16
L_3930: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_3933: IF CompareLeft! = CompareRight! THEN GOTO L_391E  ' flags from L_3930
L_3935: DI = &HAE2E
L_3938: SI = &HAE16
L_393B: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_393E: IF CompareLeft! <> CompareRight! THEN GOTO L_3943  ' flags from L_393B
L_3940: GOTO L_3874
L_3943: SI = &HAE16
L_3946: BX = CINT(N_AE16!)  ' RT3F_75
L_3949: ON BX GOTO L_3959, L_3F25, L_4190, L_4313, L_446A, L_45F0  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_3959: DI = &HB302
L_395C: SI = &HA874
L_395F: N_B302! = N_A874!  ' RT3F_7B
L_3962: DI = &HAA2C
L_3965: N_AA2C! = N_A874!  ' RT3F_7B
L_3968: SI = &HAFD0
L_396B: FAC! = N_AFD0!: DI = &H001E  ' RT3F_6F
L_396E: GOTO L_3A14
L_3971: ' Alignment NOP
L_3972: SI = &HA5C4
L_3975: BX = SI
L_3977: DX = BX
L_3979: BX = CINT(N_A5C4!)  ' RT3F_75
L_397C: SI = BX
L_397E: SI = SI * (2 ^ 1)
L_3980: SI = SI * (2 ^ 1)
L_3982: SI = SI + &H1850
L_3986: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3989: BX = 0
L_398C: IF CompareLeft! <> CompareRight! THEN GOTO L_398F  ' flags from L_3986
L_398E: BX = BX - 1
L_398F: SI = &HAA2C
L_3992: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_3995: CX = 0
L_3998: IF CompareLeft! <> CompareRight! THEN GOTO L_399B  ' flags from L_3992
L_399A: CX = CX - 1
L_399B: CX = CX AND BX
L_399D: CompareLeft% = CX: CompareRight% = 0
L_399F: IF CompareLeft% <> CompareRight% THEN GOTO L_39A4  ' flags from L_399D
L_39A1: GOTO L_39B4
L_39A4: SWAP DX, SI
L_39A6: DI = &HB306
L_39A9: N_B306! = N(SI)  ' RT3F_7B
L_39AC: DI = DX
L_39AE: SI = &H4F6C
L_39B1: N(DI) = N_4F6C!  ' RT3F_7B
L_39B4: SI = &HA5C4
L_39B7: BX = SI
L_39B9: DX = BX
L_39BB: BX = CINT(N_A5C4!)  ' RT3F_75
L_39BE: SI = BX
L_39C0: SI = SI * (2 ^ 1)
L_39C2: SI = SI * (2 ^ 1)
L_39C4: SI = SI + &H1850
L_39C8: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_39CB: BX = 0
L_39CE: IF CompareLeft! <= CompareRight! THEN GOTO L_39D1  ' flags from L_39C8
L_39D0: BX = BX - 1
L_39D1: SI = DX
L_39D3: DI = &HA854
L_39D6: FAC! = N(SI) + N_A854!  ' RT3F_7F
L_39D9: DX = BX
L_39DB: BX = CINT(FAC!)  ' RT3F_77
L_39DE: SI = BX
L_39E0: SI = SI * (2 ^ 1)
L_39E2: SI = SI * (2 ^ 1)
L_39E4: SI = SI + &H1850
L_39E8: DI = &HA9FE
L_39EB: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_39EE: BX = 0
L_39F1: IF CompareLeft! <> CompareRight! THEN GOTO L_39F4  ' flags from L_39EB
L_39F3: BX = BX - 1
L_39F4: BX = BX AND DX
L_39F6: CompareLeft% = BX: CompareRight% = 0
L_39F8: IF CompareLeft% <> CompareRight% THEN GOTO L_39FD  ' flags from L_39F6
L_39FA: GOTO L_3A0B
L_39FD: DI = &H4F6C
L_3A00: SI = &HB302
L_3A03: FAC! = N_B302! + N_4F6C!  ' RT3F_7F
L_3A06: DI = SI
L_3A08: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3A0B: DI = &HA840
L_3A0E: SI = &HA5C4
L_3A11: FAC! = N_A5C4! + N_A840!  ' RT3F_7F
L_3A14: DI = &HA5C4
L_3A17: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_3A1A: SI = DI
L_3A1C: DI = &HAFE0
L_3A1F: CompareLeft! = N_A5C4!: CompareRight! = N_AFE0!  ' RT3F_9F
L_3A22: IF CompareLeft! > CompareRight! THEN GOTO L_3A27  ' flags from L_3A1F
L_3A24: GOTO L_3972
L_3A27: SI = &HAA2C
L_3A2A: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_3A2D: IF CompareLeft! = CompareRight! THEN GOTO L_3A32  ' flags from L_3A2A
L_3A2F: GOTO L_3A38
L_3A32: GOSUB L_2649
L_3A35: GOTO L_388B
L_3A38: DI = &HA854
L_3A3B: SI = &HB302
L_3A3E: CompareLeft! = N_B302!: CompareRight! = N_A854!  ' RT3F_9F
L_3A41: IF CompareLeft! > CompareRight! THEN GOTO L_3A46  ' flags from L_3A3E
L_3A43: GOTO L_3A4C
L_3A46: GOSUB L_2668
L_3A49: GOTO L_388B
L_3A4C: GOSUB L_2352
L_3A4F: BX = &H10
L_3A52: ARGPUSH BX  ' RT3E_42
L_3A55: BX = 2
L_3A58: LOCATE ARGS(), BX  ' RT3E_44
L_3A5B: ' PRINT statement begins (screen) ; RT3F_BC
L_3A5E: BX = &HB30A
L_3A61: PRINT S_B30A$;  ' RT3F_6A
L_3A64: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3A67: ARGPUSH OMITTED  ' RT3E_43
L_3A6A: BX = &H1C
L_3A6D: LOCATE ARGS(), BX  ' RT3E_44
L_3A70: ' PRINT statement begins (screen) ; RT3F_BC
L_3A73: DX = BX
L_3A75: BX = &HB31C
L_3A78: PRINT S_B31C$  ' RT3F_6E; H newline item, ledger correction
L_3A7B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3A7E: BX = &H11
L_3A81: ARGPUSH BX  ' RT3E_42
L_3A84: BX = &H16
L_3A87: LOCATE ARGS(), BX  ' RT3E_44
L_3A8A: ' PRINT statement begins (screen) ; RT3F_BC
L_3A8D: BX = &HB32A
L_3A90: PRINT S_B32A$  ' RT3F_6E; H newline item, ledger correction
L_3A93: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3A96: BX = &H12
L_3A99: ARGPUSH BX  ' RT3E_42
L_3A9C: BX = 9
L_3A9F: LOCATE ARGS(), BX  ' RT3E_44
L_3AA2: ' PRINT statement begins (screen) ; RT3F_BC
L_3AA5: BX = &HB33C
L_3AA8: PRINT S_B33C$  ' RT3F_6E; H newline item, ledger correction
L_3AAB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3AAE: BX = &H13
L_3AB1: ARGPUSH BX  ' RT3E_42
L_3AB4: BX = 3
L_3AB7: LOCATE ARGS(), BX  ' RT3E_44
L_3ABA: ' PRINT statement begins (screen) ; RT3F_BC
L_3ABD: BX = &HB35C
L_3AC0: PRINT S_B35C$;  ' RT3F_6A
L_3AC3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3AC6: ARGPUSH OMITTED  ' RT3E_43
L_3AC9: BX = DX
L_3ACB: LOCATE ARGS(), BX  ' RT3E_44
L_3ACE: ' PRINT statement begins (screen) ; RT3F_BC
L_3AD1: BX = &HB370
L_3AD4: PRINT S_B370$  ' RT3F_6E; H newline item, ledger correction
L_3AD7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3ADA: BX = &H40
L_3ADD: DX = &H8B
L_3AE0: CX = 0
L_3AE2: AX = CX
L_3AE4: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_3AE7: DX = &HAB
L_3AEA: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_3AED: BX = &HFFFF
L_3AF0: DX = BX
L_3AF2: CX = DX
L_3AF4: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_3AF7: CX = AX
L_3AF9: BX = &HD8
L_3AFC: DX = &H7B
L_3AFF: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_3B02: DX = &H93
L_3B05: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_3B08: BX = &HFFFF
L_3B0B: DX = BX
L_3B0D: CX = DX
L_3B0F: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_3B12: CX = AX
L_3B14: BX = &H3A
L_3B17: DX = &H93
L_3B1A: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_3B1D: BX = &H40
L_3B20: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_3B23: BX = &HFFFF
L_3B26: DX = BX
L_3B28: CX = DX
L_3B2A: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_3B2D: CX = AX
L_3B2F: BX = &HD2
L_3B32: DX = &H83
L_3B35: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_3B38: BX = &HD8
L_3B3B: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_3B3E: BX = &HFFFF
L_3B41: DX = BX
L_3B43: CX = DX
L_3B45: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_3B48: BX = &H14
L_3B4B: ARGPUSH BX  ' RT3E_42
L_3B4E: BX = 2
L_3B51: LOCATE ARGS(), BX  ' RT3E_44
L_3B54: ' PRINT statement begins (screen) ; RT3F_BC
L_3B57: BX = &HB37C
L_3B5A: PRINT S_B37C$  ' RT3F_6E; H newline item, ledger correction
L_3B5D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3B60: BX = &H15
L_3B63: ARGPUSH BX  ' RT3E_42
L_3B66: DX = BX
L_3B68: BX = &HA
L_3B6B: LOCATE ARGS(), BX  ' RT3E_44
L_3B6E: ' PRINT statement begins (screen) ; RT3F_BC
L_3B71: BX = &HB392
L_3B74: PRINT S_B392$  ' RT3F_6E; H newline item, ledger correction
L_3B77: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3B7A: BX = &H16
L_3B7D: ARGPUSH BX  ' RT3E_42
L_3B80: BX = 9
L_3B83: LOCATE ARGS(), BX  ' RT3E_44
L_3B86: ' PRINT statement begins (screen) ; RT3F_BC
L_3B89: BX = &HB3B4
L_3B8C: PRINT S_B3B4$  ' RT3F_6E; H newline item, ledger correction
L_3B8F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3B92: BX = &H17
L_3B95: ARGPUSH BX  ' RT3E_42
L_3B98: BX = DX
L_3B9A: LOCATE ARGS(), BX  ' RT3E_44
L_3B9D: ' PRINT statement begins (screen) ; RT3F_BC
L_3BA0: BX = &HB3C2
L_3BA3: PRINT S_B3C2$  ' RT3F_6E; H newline item, ledger correction
L_3BA6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3BA9: BX = &H40
L_3BAC: DX = &H8B
L_3BAF: CX = 0
L_3BB1: AX = CX
L_3BB3: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_3BB6: DX = &HAB
L_3BB9: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_3BBC: BX = &HFFFF
L_3BBF: DX = BX
L_3BC1: CX = DX
L_3BC3: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_3BC6: DI = &HAE0E
L_3BC9: SI = &HA840
L_3BCC: N_AE0E! = N_A840!  ' RT3F_7B
L_3BCF: GOSUB L_1E7C
L_3BD2: DI = &HAE22
L_3BD5: SI = &HAE16
L_3BD8: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_3BDB: IF CompareLeft! = CompareRight! THEN GOTO L_3BC6  ' flags from L_3BD8
L_3BDD: DI = &HAE2E
L_3BE0: SI = &HAE16
L_3BE3: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_3BE6: IF CompareLeft! <> CompareRight! THEN GOTO L_3BEB  ' flags from L_3BE3
L_3BE8: GOTO L_388B
L_3BEB: DI = &HB3E4
L_3BEE: SI = &HA682
L_3BF1: N_B3E4! = N_A682!  ' RT3F_7B
L_3BF4: BX = &HB3DA
L_3BF7: DX = &HB3E8
L_3BFA: S_B3E8$ = S_B3DA$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_3BFD: DI = &H4F6C
L_3C00: SI = &HAE16
L_3C03: CompareLeft! = N_AE16!: CompareRight! = N_4F6C!  ' RT3F_9F
L_3C06: IF CompareLeft! = CompareRight! THEN GOTO L_3C0B  ' flags from L_3C03
L_3C08: GOTO L_3C20
L_3C0B: DI = &HB3EC
L_3C0E: SI = &HA66E
L_3C11: N_B3EC! = N_A66E!  ' RT3F_7B
L_3C14: DI = &HB3F0
L_3C17: SI = &HA67E
L_3C1A: N_B3F0! = N_A67E!  ' RT3F_7B
L_3C1D: GOTO L_3C5E
L_3C20: DI = &HA848
L_3C23: SI = &HAE16
L_3C26: FAC! = N_AE16! + N_A848!  ' RT3F_7F
L_3C29: BX = SI
L_3C2B: DX = BX
L_3C2D: BX = CINT(FAC!)  ' RT3F_77
L_3C30: DI = BX
L_3C32: DI = DI * (2 ^ 1)
L_3C34: BX = WORD(DI - &H5A2A)
L_3C38: FAC! = CSNG(BX)  ' RT3F_57
L_3C3B: DI = &HB3EC
L_3C3E: N_B3EC! = FAC!: SI = &H001A  ' RT3F_7D
L_3C41: SI = DX
L_3C43: DI = &HA844
L_3C46: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_3C49: BX = CINT(FAC!)  ' RT3F_77
L_3C4C: DI = BX
L_3C4E: DI = DI * (2 ^ 1)
L_3C50: BX = WORD(DI - &H5A2A)
L_3C54: BX = BX - 1
L_3C55: FAC! = CSNG(BX)  ' RT3F_57
L_3C58: DI = &HB3F0
L_3C5B: N_B3F0! = FAC!: SI = &H001A  ' RT3F_7D
L_3C5E: GOSUB L_A1D8
L_3C61: DI = &HA844
L_3C64: SI = &HAE16
L_3C67: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_3C6A: BX = CINT(FAC!)  ' RT3F_77
L_3C6D: AX = BX
L_3C6F: WORD(&HAE70) = AX
L_3C72: AX = AX OR AX
L_3C74: IF (SF = OF) THEN GOTO L_3C79  ' flags from L_3C72
L_3C76: GOTO L_3959
L_3C79: SI = WORD(&HAE70)
L_3C7D: SI = SI + &H1E6
L_3C81: SI = SI * (2 ^ 1)
L_3C83: SI = SI * (2 ^ 1)
L_3C85: SI = SI + &H586E
L_3C89: DI = &HA6D4
L_3C8C: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_3C8F: DI = &HB3F4
L_3C92: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_3C95: BX = DI
L_3C97: DI = &HA704
L_3C9A: SI = &HB050
L_3C9D: N_A704! = N_B050!  ' RT3F_7B
L_3CA0: GOSUB L_07E8
L_3CA3: DI = &HB3F4
L_3CA6: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_3CA9: IF CompareLeft! < CompareRight! THEN GOTO L_3CAE  ' flags from L_3CA6
L_3CAB: GOTO L_3CB4
L_3CAE: GOSUB L_2687
L_3CB1: GOTO L_3959
L_3CB4: GOSUB L_2352
L_3CB7: BX = &H14
L_3CBA: ARGPUSH BX  ' RT3E_42
L_3CBD: BX = 2
L_3CC0: LOCATE ARGS(), BX  ' RT3E_44
L_3CC3: ' PRINT statement begins (screen) ; RT3F_BC
L_3CC6: BX = WORD(&HAE70)
L_3CCA: DX = BX
L_3CCC: BX = BX * (2 ^ 1)
L_3CCE: BX = BX * (2 ^ 1)
L_3CD0: CX = BX
L_3CD2: BX = BX + &H43F4
L_3CD6: AX = DX
L_3CD8: DX = &H26
L_3CDB: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_3CDE: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_3CE1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3CE4: SI = &HB306
L_3CE7: BX = SI
L_3CE9: DX = BX
L_3CEB: BX = CINT(N_B306!)  ' RT3F_75
L_3CEE: DI = BX
L_3CF0: DI = DI * (2 ^ 1)
L_3CF2: DI = DI * (2 ^ 1)
L_3CF4: DI = DI + &H1850
L_3CF8: BX = AX
L_3CFA: AX = AX + 1
L_3CFB: SWAP BX, AX
L_3CFC: FAC! = CSNG(BX)  ' RT3F_57
L_3CFF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3D02: SI = DX
L_3D04: DI = &HA854
L_3D07: FAC! = N(SI) + N_A854!  ' RT3F_7F
L_3D0A: BX = CINT(FAC!)  ' RT3F_77
L_3D0D: DI = BX
L_3D0F: DI = DI * (2 ^ 1)
L_3D11: DI = DI * (2 ^ 1)
L_3D13: DI = DI + &H1850
L_3D17: SI = &HA9FE
L_3D1A: N(DI) = N_A9FE!  ' RT3F_7B
L_3D1D: SI = DX
L_3D1F: DI = &H4F6C
L_3D22: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_3D25: BX = CINT(FAC!)  ' RT3F_77
L_3D28: DI = BX
L_3D2A: DI = DI * (2 ^ 1)
L_3D2C: DI = DI * (2 ^ 1)
L_3D2E: DI = DI + &H1850
L_3D32: CX = CX + &H586E
L_3D36: SI = CX
L_3D38: N(DI) = N(SI)  ' RT3F_7B
L_3D3B: SI = DX
L_3D3D: DI = &HA676
L_3D40: FAC! = N(SI) + N_A676!  ' RT3F_7F
L_3D43: BX = CINT(FAC!)  ' RT3F_77
L_3D46: DI = BX
L_3D48: DI = DI * (2 ^ 1)
L_3D4A: DI = DI * (2 ^ 1)
L_3D4C: DI = DI + &H1850
L_3D50: BX = AX
L_3D52: AX = AX + &H6C
L_3D55: SI = AX
L_3D57: SI = SI * (2 ^ 1)
L_3D59: SI = SI * (2 ^ 1)
L_3D5B: SI = SI + &H586E
L_3D5F: N(DI) = N(SI)  ' RT3F_7B
L_3D62: SI = DX
L_3D64: CX = DI
L_3D66: DI = &HA5C0
L_3D69: FAC! = N(SI) + N_A5C0!  ' RT3F_7F
L_3D6C: AX = BX
L_3D6E: BX = CINT(FAC!)  ' RT3F_77
L_3D71: DI = BX
L_3D73: DI = DI * (2 ^ 1)
L_3D75: DI = DI * (2 ^ 1)
L_3D77: DI = DI + &H1850
L_3D7B: SI = CX
L_3D7D: N(DI) = N(SI)  ' RT3F_7B
L_3D80: SI = DX
L_3D82: DI = &H4F94
L_3D85: FAC! = N(SI) + N_4F94!  ' RT3F_7F
L_3D88: BX = CINT(FAC!)  ' RT3F_77
L_3D8B: DI = BX
L_3D8D: DI = DI * (2 ^ 1)
L_3D8F: DI = DI * (2 ^ 1)
L_3D91: DI = DI + &H1850
L_3D95: AX = AX + &H36
L_3D98: SI = AX
L_3D9A: SI = SI * (2 ^ 1)
L_3D9C: SI = SI * (2 ^ 1)
L_3D9E: SI = SI + &H586E
L_3DA2: N(DI) = N(SI)  ' RT3F_7B
L_3DA5: DI = &HA682
L_3DA8: SI = &HB306
L_3DAB: FAC! = N_B306! + N_A682!  ' RT3F_7F
L_3DAE: BX = SI
L_3DB0: DX = BX
L_3DB2: BX = CINT(FAC!)  ' RT3F_77
L_3DB5: DI = BX
L_3DB7: DI = DI * (2 ^ 1)
L_3DB9: DI = DI * (2 ^ 1)
L_3DBB: DI = DI + &H1850
L_3DBF: SI = WORD(&HAE70)
L_3DC3: BX = SI
L_3DC5: SI = SI + &HA2
L_3DC9: SI = SI * (2 ^ 1)
L_3DCB: SI = SI * (2 ^ 1)
L_3DCD: SI = SI + &H586E
L_3DD1: CX = DI
L_3DD3: DI = &HA686
L_3DD6: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_3DD9: DI = CX
L_3DDB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3DDE: SI = DX
L_3DE0: DI = &HA696
L_3DE3: FAC! = N(SI) + N_A696!  ' RT3F_7F
L_3DE6: CX = BX
L_3DE8: BX = CINT(FAC!)  ' RT3F_77
L_3DEB: DI = BX
L_3DED: DI = DI * (2 ^ 1)
L_3DEF: DI = DI * (2 ^ 1)
L_3DF1: DI = DI + &H1850
L_3DF5: BX = CX
L_3DF7: CX = CX + &H10E
L_3DFB: SI = CX
L_3DFD: SI = SI * (2 ^ 1)
L_3DFF: SI = SI * (2 ^ 1)
L_3E01: SI = SI + &H586E
L_3E05: N(DI) = N(SI)  ' RT3F_7B
L_3E08: SI = DX
L_3E0A: DI = &HA850
L_3E0D: FAC! = N(SI) + N_A850!  ' RT3F_7F
L_3E10: CX = BX
L_3E12: BX = CINT(FAC!)  ' RT3F_77
L_3E15: DI = BX
L_3E17: DI = DI * (2 ^ 1)
L_3E19: DI = DI * (2 ^ 1)
L_3E1B: DI = DI + &H1850
L_3E1F: BX = CX
L_3E21: CX = CX + &H1B0
L_3E25: SI = CX
L_3E27: SI = SI * (2 ^ 1)
L_3E29: SI = SI * (2 ^ 1)
L_3E2B: SI = SI + &H586E
L_3E2F: N(DI) = N(SI)  ' RT3F_7B
L_3E32: SI = DX
L_3E34: DI = &HA5CC
L_3E37: FAC! = N(SI) + N_A5CC!  ' RT3F_7F
L_3E3A: DX = BX
L_3E3C: BX = CINT(FAC!)  ' RT3F_77
L_3E3F: DI = BX
L_3E41: DI = DI * (2 ^ 1)
L_3E43: DI = DI * (2 ^ 1)
L_3E45: DI = DI + &H1850
L_3E49: DX = DX + &H21C
L_3E4D: SI = DX
L_3E4F: SI = SI * (2 ^ 1)
L_3E51: SI = SI * (2 ^ 1)
L_3E53: SI = SI + &H586E
L_3E57: N(DI) = N(SI)  ' RT3F_7B
L_3E5A: SI = &HB3F4
L_3E5D: FAC! = -N_B3F4!  ' RT3F_AF
L_3E60: DI = &HAA4C
L_3E63: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_3E66: GOSUB L_1E98
L_3E69: GOSUB L_20B6
L_3E6C: DI = &HA686
L_3E6F: SI = &HB306
L_3E72: FAC! = N_B306! + N_A686!  ' RT3F_7F
L_3E75: BX = SI
L_3E77: DX = BX
L_3E79: BX = CINT(FAC!)  ' RT3F_77
L_3E7C: DI = BX
L_3E7E: DI = DI * (2 ^ 1)
L_3E80: DI = DI * (2 ^ 1)
L_3E82: DI = DI + &H1850
L_3E86: SI = WORD(&HAE70)
L_3E8A: BX = SI
L_3E8C: SI = SI + &HD8
L_3E90: SI = SI * (2 ^ 1)
L_3E92: SI = SI * (2 ^ 1)
L_3E94: SI = SI + &H586E
L_3E98: N(DI) = N(SI)  ' RT3F_7B
L_3E9B: SI = DX
L_3E9D: DI = &HA5EE
L_3EA0: FAC! = N(SI) + N_A5EE!  ' RT3F_7F
L_3EA3: CX = BX
L_3EA5: BX = CINT(FAC!)  ' RT3F_77
L_3EA8: DI = BX
L_3EAA: DI = DI * (2 ^ 1)
L_3EAC: DI = DI * (2 ^ 1)
L_3EAE: DI = DI + &H1850
L_3EB2: CX = CX + &H252
L_3EB6: SI = CX
L_3EB8: SI = SI * (2 ^ 1)
L_3EBA: SI = SI * (2 ^ 1)
L_3EBC: SI = SI + &H586E
L_3EC0: N(DI) = N(SI)  ' RT3F_7B
L_3EC3: DI = &HA6E4
L_3EC6: SI = &HAE68
L_3EC9: N_A6E4! = N_AE68!  ' RT3F_7B
L_3ECC: DI = &HA6E8
L_3ECF: BX = SI
L_3ED1: SI = &HA9FE
L_3ED4: N_A6E8! = N_A9FE!  ' RT3F_7B
L_3ED7: GOSUB L_0797
L_3EDA: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_3EDD: IF CompareLeft! = CompareRight! THEN GOTO L_3EE2  ' flags from L_3EDA
L_3EDF: GOTO L_3F22
L_3EE2: DI = &HA6F8
L_3EE5: SI = &HAE68
L_3EE8: N_A6F8! = N_AE68!  ' RT3F_7B
L_3EEB: DI = &HA6FC
L_3EEE: SI = &HA9FE
L_3EF1: N_A6FC! = N_A9FE!  ' RT3F_7B
L_3EF4: GOSUB L_07C9
L_3EF7: BX = CINT(FAC!)  ' RT3F_77
L_3EFA: DI = BX
L_3EFC: DI = DI * (2 ^ 1)
L_3EFE: DI = DI * (2 ^ 1)

```

### Personal-equipment purchasing

```basic
L_3F00: DI = DI + &H1850
L_3F04: BX = DI
L_3F06: DI = &HB3F8
L_3F09: SI = &HB306
L_3F0C: FAC! = N_B306! + N_B3F8!  ' RT3F_7F
L_3F0F: DI = &HA840
L_3F12: FAC! = FAC! / N_A840!  ' RT3F_89
L_3F15: DX = BX
L_3F17: BX = &H1A
L_3F1A: FAC! = INT(FAC!)  ' RT3D_03
L_3F1D: DI = DX
L_3F1F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3F22: GOTO L_3943
L_3F25: DI = &HB3FC
L_3F28: SI = &H4F6C
L_3F2B: N_B3FC! = N_4F6C!  ' RT3F_7B
L_3F2E: DI = &HB400
L_3F31: SI = &H4F6C
L_3F34: N_B400! = N_4F6C!  ' RT3F_7B
L_3F37: SI = &HAFE8
L_3F3A: FAC! = N_AFE8!: DI = &H001E  ' RT3F_6F
L_3F3D: GOTO L_3F75
L_3F40: SI = &HA5C4
L_3F43: BX = SI
L_3F45: DX = BX
L_3F47: BX = CINT(N_A5C4!)  ' RT3F_75
L_3F4A: SI = BX
L_3F4C: SI = SI * (2 ^ 1)
L_3F4E: SI = SI * (2 ^ 1)
L_3F50: SI = SI + &H1850
L_3F54: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3F57: IF CompareLeft! = CompareRight! THEN GOTO L_3F5C  ' flags from L_3F54
L_3F59: GOTO L_3F6C
L_3F5C: SI = DX
L_3F5E: DI = &HB306
L_3F61: N_B306! = N(SI)  ' RT3F_7B
L_3F64: DI = DX
L_3F66: SI = &HB404
L_3F69: N(DI) = N_B404!  ' RT3F_7B
L_3F6C: DI = &HA5C0
L_3F6F: SI = &HA5C4
L_3F72: FAC! = N_A5C4! + N_A5C0!  ' RT3F_7F
L_3F75: DI = &HA5C4
L_3F78: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_3F7B: SI = DI
L_3F7D: DI = &HAFFA
L_3F80: CompareLeft! = N_A5C4!: CompareRight! = N_AFFA!  ' RT3F_9F
L_3F83: IF CompareLeft! <= CompareRight! THEN GOTO L_3F40  ' flags from L_3F80
L_3F85: DI = &HB408
L_3F88: SI = &HA5C4
L_3F8B: CompareLeft! = N_A5C4!: CompareRight! = N_B408!  ' RT3F_9F
L_3F8E: IF CompareLeft! < CompareRight! THEN GOTO L_3F93  ' flags from L_3F8B
L_3F90: GOTO L_3F99
L_3F93: GOSUB L_2649
L_3F96: GOTO L_388B
L_3F99: SI = &HB3FC
L_3F9C: BX = BASIC_BOOL(N_B3FC! <> 0)  ' RT3F_1D
L_3F9F: CompareLeft% = BX: CompareRight% = 0
L_3FA1: IF CompareLeft% <> CompareRight% THEN GOTO L_3FA6  ' flags from L_3F9F
L_3FA3: GOTO L_3FAC
L_3FA6: GOSUB L_A596
L_3FA9: GOTO L_3FAF
L_3FAC: GOSUB L_A68C
L_3FAF: DI = &HB43C
L_3FB2: SI = &HB438
L_3FB5: FAC! = N_B438! + N_B43C!  ' RT3F_7F
L_3FB8: DI = &HAE0E
L_3FBB: N_AE0E! = FAC!: SI = &H001A  ' RT3F_7D
L_3FBE: BX = &H18
L_3FC1: ARGPUSH BX  ' RT3E_42
L_3FC4: BX = 2
L_3FC7: LOCATE ARGS(), BX  ' RT3E_44
L_3FCA: ' PRINT statement begins (screen) ; RT3F_BC
L_3FCD: BX = &HB40C
L_3FD0: PRINT S_B40C$;  ' RT3F_6A
L_3FD3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3FD6: SI = DI
L_3FD8: DI = &HA676
L_3FDB: CompareLeft! = N(SI): CompareRight! = N_A676!  ' RT3F_9F
L_3FDE: IF CompareLeft! > CompareRight! THEN GOTO L_3FE3  ' flags from L_3FDB
L_3FE0: GOTO L_3FEF
L_3FE3: ' PRINT statement begins (screen) ; RT3F_BC
L_3FE6: BX = &HB424
L_3FE9: PRINT S_B424$;  ' RT3F_6A
L_3FEC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_3FEF: GOSUB L_22C4
L_3FF2: DI = &HAE2E
L_3FF5: SI = &HAE16
L_3FF8: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_3FFB: IF CompareLeft! <> CompareRight! THEN GOTO L_4000  ' flags from L_3FF8
L_3FFD: GOTO L_388B
L_4000: DI = &HAE22
L_4003: SI = &HAE16
L_4006: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_4009: IF CompareLeft! = CompareRight! THEN GOTO L_400E  ' flags from L_4006
L_400B: GOTO L_402A
L_400E: DI = &HB3FC
L_4011: SI = &H4F6C
L_4014: N_B3FC! = N_4F6C!  ' RT3F_7B
L_4017: DI = &HB440
L_401A: SI = &HAF0E
L_401D: CompareLeft! = N_AF0E!: CompareRight! = N_B440!  ' RT3F_9F
L_4020: IF CompareLeft! <= CompareRight! THEN GOTO L_4025  ' flags from L_401D
L_4022: GOTO L_3F99
L_4025: GOSUB L_A68C
L_4028: GOTO L_3FAF
L_402A: DI = &HB444
L_402D: SI = &HAE16
L_4030: FAC! = N_AE16! + N_B444!  ' RT3F_7F
L_4033: BX = CINT(FAC!)  ' RT3F_77
L_4036: SI = BX
L_4038: SI = SI * (2 ^ 1)
L_403A: SI = SI * (2 ^ 1)
L_403C: SI = SI + &H1850
L_4040: BX = CINT(N(SI))  ' RT3F_75
L_4043: AX = BX
L_4045: WORD(&HAE70) = AX
L_4048: AX = AX + &H17A
L_404B: SI = AX
L_404D: SI = SI * (2 ^ 1)
L_404F: SI = SI * (2 ^ 1)
L_4051: SI = SI + &H586E
L_4055: DI = &HA6D4
L_4058: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_405B: DI = &HB3F4
L_405E: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_4061: BX = DI
L_4063: DI = &HA704
L_4066: SI = &HB448
L_4069: N_A704! = N_B448!  ' RT3F_7B
L_406C: GOSUB L_07E8
L_406F: DI = &HB3F4
L_4072: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_4075: IF CompareLeft! < CompareRight! THEN GOTO L_407A  ' flags from L_4072
L_4077: GOTO L_4080
L_407A: GOSUB L_2687
L_407D: GOTO L_3F25
L_4080: SI = &HB306
L_4083: BX = SI
L_4085: DX = BX
L_4087: BX = CINT(N_B306!)  ' RT3F_75
L_408A: DI = BX
L_408C: DI = DI * (2 ^ 1)
L_408E: DI = DI * (2 ^ 1)
L_4090: DI = DI + &H1850
L_4094: BX = WORD(&HAE70)
L_4098: CX = BX
L_409A: BX = BX + 1
L_409B: FAC! = CSNG(BX)  ' RT3F_57
L_409E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_40A1: SI = DX
L_40A3: DI = &H4F6C
L_40A6: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_40A9: BX = CINT(FAC!)  ' RT3F_77
L_40AC: SI = BX
L_40AE: SI = SI * (2 ^ 1)
L_40B0: SI = SI * (2 ^ 1)
L_40B2: SI = SI + &H1850
L_40B6: SWAP SI, DI
L_40B8: BX = CX
L_40BA: CX = CX + &H144
L_40BE: AX = DI
L_40C0: DI = CX
L_40C2: DI = DI * (2 ^ 1)
L_40C4: DI = DI * (2 ^ 1)
L_40C6: DI = DI + &H586E
L_40CA: SWAP DI, SI
L_40CC: CX = DI
L_40CE: DI = &HA686
L_40D1: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_40D4: DI = AX
L_40D6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_40D9: SI = DX
L_40DB: DI = &H4F94
L_40DE: FAC! = N(SI) + N_4F94!  ' RT3F_7F
L_40E1: DX = BX
L_40E3: BX = CINT(FAC!)  ' RT3F_77
L_40E6: DI = BX
L_40E8: DI = DI * (2 ^ 1)
L_40EA: DI = DI * (2 ^ 1)
L_40EC: DI = DI + &H1850
L_40F0: SI = &HA9FE
L_40F3: N(DI) = N_A9FE!  ' RT3F_7B
L_40F6: DX = DX + &H1F5
L_40FA: DI = DX
L_40FC: DI = DI * (2 ^ 1)
L_40FE: DI = DI * (2 ^ 1)
L_4100: DI = DI + &H1850
L_4104: SWAP CX, DI
L_4106: SI = CX
L_4108: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_410B: DI = CX
L_410D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4110: SI = &HB3F4
L_4113: FAC! = -N_B3F4!  ' RT3F_AF
L_4116: DI = &HAA4C
L_4119: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_411C: GOSUB L_1E98
L_411F: DI = &HAF0E
L_4122: SI = &HB44C
L_4125: N_AF0E! = N_B44C!  ' RT3F_7B
L_4128: DI = &HB3FC
L_412B: SI = &HB050
L_412E: N_B3FC! = N_B050!  ' RT3F_7B
L_4131: GOTO L_3F2E
L_4134: BX = &H10
L_4137: ARGPUSH BX  ' RT3E_42
L_413A: DX = BX
L_413C: BX = 2
L_413F: LOCATE ARGS(), BX  ' RT3E_44
L_4142: ' PRINT statement begins (screen) ; RT3F_BC
L_4145: CX = BX
L_4147: BX = &H26
L_414A: PRINT SPC(BX);  ' RT3F_35; M ledger
L_414D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4150: BX = DX
L_4152: ARGPUSH BX  ' RT3E_42
L_4155: BX = CX
L_4157: LOCATE ARGS(), BX  ' RT3E_44
L_415A: ' PRINT statement begins (screen) ; RT3F_BC
L_415D: SI = &HA9FE
L_4160: BX = CINT(N_A9FE!)  ' RT3F_75
L_4163: BX = BX * (2 ^ 1)
L_4165: BX = BX * (2 ^ 1)
L_4167: BX = BX + &H4288
L_416B: PRINT S(BX);  ' RT3F_6A
L_416E: BX = &HB450
L_4171: PRINT S_B450$;  ' RT3F_6A
L_4174: DI = &HA704
L_4177: SI = &HB050
L_417A: N_A704! = N_B050!  ' RT3F_7B
L_417D: GOSUB L_07E8
L_4180: BX = &H1A
L_4183: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_4186: BX = &HB460
L_4189: PRINT S_B460$  ' RT3F_6E; H newline item, ledger correction
L_418C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_418F: RETURN
L_4190: DI = &HB3E4
L_4193: SI = &HA696
L_4196: N_B3E4! = N_A696!  ' RT3F_7B
L_4199: DI = &HB3EC
L_419C: SI = &HA874
L_419F: N_B3EC! = N_A874!  ' RT3F_7B
L_41A2: DI = &HB3F0
L_41A5: SI = &HA682
L_41A8: N_B3F0! = N_A682!  ' RT3F_7B
L_41AB: BX = &HB46C
L_41AE: DX = &HB3E8
L_41B1: S_B3E8$ = S_B46C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_41B4: GOSUB L_A1D8
L_41B7: DI = &HA844
L_41BA: SI = &HAE16
L_41BD: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_41C0: BX = CINT(FAC!)  ' RT3F_77
L_41C3: AX = BX
L_41C5: WORD(&HAE70) = AX
L_41C8: AX = AX OR AX
L_41CA: IF (SF = OF) THEN GOTO L_41CF  ' flags from L_41C8
L_41CC: GOTO L_388B
L_41CF: CompareLeft% = WORD(&HAE70): CompareRight% = 5
L_41D4: BX = 0
L_41D7: IF CompareLeft% <> CompareRight% THEN GOTO L_41DA  ' flags from L_41CF
L_41D9: BX = BX - 1
L_41DA: DI = &HA6E4
L_41DD: SI = &HA868
L_41E0: N_A6E4! = N_A868!  ' RT3F_7B
L_41E3: DI = &HA6E8
L_41E6: SI = &HA9FE
L_41E9: N_A6E8! = N_A9FE!  ' RT3F_7B
L_41EC: WORD(BP - 6) = BX
L_41EF: GOSUB L_0797
L_41F2: DI = &HA5C0
L_41F5: CompareLeft! = FAC!: CompareRight! = N_A5C0!  ' RT3F_A1
L_41F8: BX = 0
L_41FB: IF CompareLeft! >= CompareRight! THEN GOTO L_41FE  ' flags from L_41F5
L_41FD: BX = BX - 1
L_41FE: BX = BX AND WORD(BP - 6)
L_4201: CompareLeft% = BX: CompareRight% = 0
L_4203: IF CompareLeft% <> CompareRight% THEN GOTO L_4208  ' flags from L_4201
L_4205: GOTO L_420D
L_4208: BEEP  ' RT3E_2B
L_420B: GOTO L_4190
L_420D: GOSUB L_2352
L_4210: BX = &H14
L_4213: ARGPUSH BX  ' RT3E_42
L_4216: BX = 2
L_4219: LOCATE ARGS(), BX  ' RT3E_44
L_421C: ' PRINT statement begins (screen) ; RT3F_BC
L_421F: BX = WORD(&HAE70)
L_4223: BX = BX * (2 ^ 1)
L_4225: BX = BX * (2 ^ 1)
L_4227: BX = BX + &H44CC
L_422B: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_422E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4231: DI = &HA6F8
L_4234: SI = &HB47C
L_4237: N_A6F8! = N_B47C!  ' RT3F_7B
L_423A: BX = DI
L_423C: DI = &HA6FC
L_423F: SI = &HA9FE
L_4242: N_A6FC! = N_A9FE!  ' RT3F_7B
L_4245: GOSUB L_07C9
L_4248: BX = CINT(FAC!)  ' RT3F_77
L_424B: DI = BX
L_424D: DI = DI * (2 ^ 1)
L_424F: DI = DI * (2 ^ 1)
L_4251: DI = DI + &H1850
L_4255: SI = WORD(&HAE70)
L_4259: BX = SI
L_425B: SI = SI + 6
L_425E: SI = SI * (2 ^ 1)
L_4260: SI = SI * (2 ^ 1)
L_4262: SI = SI + &H628E
L_4266: DX = DI
L_4268: DI = &HA686
L_426B: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_426E: DI = DX
L_4270: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4273: DI = &HA6F8
L_4276: SI = &HB480
L_4279: N_A6F8! = N_B480!  ' RT3F_7B
L_427C: DX = DI
L_427E: DI = &HA6FC
L_4281: SI = &HA9FE
L_4284: N_A6FC! = N_A9FE!  ' RT3F_7B
L_4287: WORD(BP - 6) = BX
L_428A: GOSUB L_07C9
L_428D: BX = CINT(FAC!)  ' RT3F_77
L_4290: DI = BX
L_4292: DI = DI * (2 ^ 1)
L_4294: DI = DI * (2 ^ 1)
L_4296: DI = DI + &H1850
L_429A: SI = WORD(BP - 6)
L_429D: BX = SI
L_429F: SI = SI * (2 ^ 1)
L_42A1: SI = SI * (2 ^ 1)
L_42A3: SI = SI + &H628E
L_42A7: N(DI) = N(SI)  ' RT3F_7B
L_42AA: DI = &HA6F8
L_42AD: SI = &HB484
L_42B0: N_A6F8! = N_B484!  ' RT3F_7B
L_42B3: DX = DI
L_42B5: DI = &HA6FC
L_42B8: SI = &HA9FE
L_42BB: N_A6FC! = N_A9FE!  ' RT3F_7B
L_42BE: GOSUB L_07C9
L_42C1: BX = CINT(FAC!)  ' RT3F_77
L_42C4: DI = BX
L_42C6: DI = DI * (2 ^ 1)
L_42C8: DI = DI * (2 ^ 1)
L_42CA: DI = DI + &H1850
L_42CE: BX = WORD(BP - 6)
L_42D1: DX = BX
L_42D3: BX = BX + 1
L_42D4: FAC! = CSNG(BX)  ' RT3F_57
L_42D7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_42DA: DI = &HA6F8
L_42DD: SI = &HA5C8
L_42E0: N_A6F8! = N_A5C8!  ' RT3F_7B
L_42E3: DI = &HA6FC
L_42E6: SI = &HA9FE
L_42E9: N_A6FC! = N_A9FE!  ' RT3F_7B
L_42EC: GOSUB L_07C9
L_42EF: BX = CINT(FAC!)  ' RT3F_77
L_42F2: DI = BX
L_42F4: DI = DI * (2 ^ 1)
L_42F6: DI = DI * (2 ^ 1)
L_42F8: DI = DI + &H1850
L_42FC: SI = WORD(BP - 6)
L_42FF: SI = SI + &HC
L_4302: SI = SI * (2 ^ 1)
L_4304: SI = SI * (2 ^ 1)
L_4306: SI = SI + &H628E
L_430A: N(DI) = N(SI)  ' RT3F_7B
L_430D: GOSUB L_20B6
L_4310: GOTO L_388B
L_4313: DI = &HB3E4
L_4316: SI = &HA850
L_4319: N_B3E4! = N_A850!  ' RT3F_7B
L_431C: DI = &HB3EC
L_431F: SI = &HB488
L_4322: N_B3EC! = N_B488!  ' RT3F_7B
L_4325: DI = &HB3F0
L_4328: SI = &HA5C0
L_432B: N_B3F0! = N_A5C0!  ' RT3F_7B
L_432E: BX = &HB48C
L_4331: DX = &HB3E8
L_4334: S_B3E8$ = S_B48C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_4337: GOSUB L_A1D8
L_433A: DI = &HA844
L_433D: SI = &HAE16
L_4340: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_4343: BX = CINT(FAC!)  ' RT3F_77
L_4346: AX = BX
L_4348: WORD(&HAE70) = AX
L_434B: AX = AX OR AX
L_434D: IF (SF = OF) THEN GOTO L_4352  ' flags from L_434B
L_434F: GOTO L_388B
L_4352: SI = WORD(&HAE70)
L_4356: SI = SI + 4
L_4359: SI = SI * (2 ^ 1)
L_435B: SI = SI * (2 ^ 1)
L_435D: SI = SI + &H62D6
L_4361: DI = &HA6D4
L_4364: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_4367: DI = &HB3F4
L_436A: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_436D: BX = DI
L_436F: DI = &HA704
L_4372: SI = &HB050
L_4375: N_A704! = N_B050!  ' RT3F_7B
L_4378: GOSUB L_07E8
L_437B: DI = &HB3F4
L_437E: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_4381: IF CompareLeft! < CompareRight! THEN GOTO L_4386  ' flags from L_437E
L_4383: GOTO L_438C
L_4386: GOSUB L_2687
L_4389: GOTO L_388B
L_438C: GOSUB L_2352
L_438F: BX = &H14
L_4392: ARGPUSH BX  ' RT3E_42
L_4395: BX = 2
L_4398: LOCATE ARGS(), BX  ' RT3E_44
L_439B: ' PRINT statement begins (screen) ; RT3F_BC
L_439E: BX = WORD(&HAE70)
L_43A2: DX = BX
L_43A4: BX = BX * (2 ^ 1)
L_43A6: BX = BX * (2 ^ 1)
L_43A8: CX = BX
L_43AA: BX = BX + &H44E4
L_43AE: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_43B1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_43B4: DI = &HA6F8
L_43B7: SI = &HB494
L_43BA: N_A6F8! = N_B494!  ' RT3F_7B
L_43BD: BX = DI
L_43BF: DI = &HA6FC
L_43C2: SI = &HA9FE
L_43C5: N_A6FC! = N_A9FE!  ' RT3F_7B
L_43C8: WORD(BP - 6) = DX
L_43CB: WORD(BP - 8) = CX
L_43CE: GOSUB L_07C9
L_43D1: BX = CINT(FAC!)  ' RT3F_77
L_43D4: DI = BX
L_43D6: DI = DI * (2 ^ 1)
L_43D8: DI = DI * (2 ^ 1)
L_43DA: DI = DI + &H1850
L_43DE: BX = WORD(BP - 6)
L_43E1: DX = BX
L_43E3: BX = BX + 1
L_43E4: FAC! = CSNG(BX)  ' RT3F_57
L_43E7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_43EA: DI = &HA6F8
L_43ED: SI = &HB498
L_43F0: N_A6F8! = N_B498!  ' RT3F_7B
L_43F3: BX = DI
L_43F5: DI = &HA6FC
L_43F8: SI = &HA9FE
L_43FB: N_A6FC! = N_A9FE!  ' RT3F_7B
L_43FE: GOSUB L_07C9
L_4401: BX = CINT(FAC!)  ' RT3F_77
L_4404: DI = BX
L_4406: DI = DI * (2 ^ 1)
L_4408: DI = DI * (2 ^ 1)
L_440A: DI = DI + &H1850
L_440E: SI = WORD(BP - 8)
L_4411: SI = SI + &H62D6
L_4415: BX = DI
L_4417: DI = &HA686
L_441A: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_441D: DI = BX
L_441F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4422: DI = &HA6F8
L_4425: SI = &HB49C
L_4428: N_A6F8! = N_B49C!  ' RT3F_7B
L_442B: DI = &HA6FC
L_442E: SI = &HA9FE
L_4431: N_A6FC! = N_A9FE!  ' RT3F_7B
L_4434: GOSUB L_07C9
L_4437: BX = CINT(FAC!)  ' RT3F_77
L_443A: DI = BX
L_443C: DI = DI * (2 ^ 1)
L_443E: DI = DI * (2 ^ 1)
L_4440: DI = DI + &H1850
L_4444: SI = WORD(BP - 6)
L_4447: SI = SI + 8
L_444A: SI = SI * (2 ^ 1)
L_444C: SI = SI * (2 ^ 1)
L_444E: SI = SI + &H62D6
L_4452: N(DI) = N(SI)  ' RT3F_7B
L_4455: SI = &HB3F4
L_4458: FAC! = -N_B3F4!  ' RT3F_AF
L_445B: DI = &HAA4C
L_445E: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_4461: GOSUB L_1E98
L_4464: GOSUB L_20B6
L_4467: GOTO L_388B
L_446A: DI = &HB3E4
L_446D: SI = &HA5CC
L_4470: N_B3E4! = N_A5CC!  ' RT3F_7B
L_4473: DI = &HB3EC
L_4476: SI = &HA66E
L_4479: N_B3EC! = N_A66E!  ' RT3F_7B
L_447C: DI = &HB3F0
L_447F: SI = &HA672
L_4482: N_B3F0! = N_A672!  ' RT3F_7B
L_4485: BX = &HB4A0
L_4488: DX = &HB3E8
L_448B: S_B3E8$ = S_B4A0$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_448E: GOSUB L_A1D8
L_4491: DI = &HA844
L_4494: SI = &HAE16
L_4497: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_449A: BX = CINT(FAC!)  ' RT3F_77
L_449D: AX = BX
L_449F: WORD(&HAE70) = AX
L_44A2: AX = AX OR AX
L_44A4: IF (SF = OF) THEN GOTO L_44A9  ' flags from L_44A2
L_44A6: GOTO L_388B
L_44A9: SI = WORD(&HAE70)
L_44AD: SI = SI + &H10
L_44B0: SI = SI * (2 ^ 1)
L_44B2: SI = SI * (2 ^ 1)
L_44B4: SI = SI + &H6306
L_44B8: DI = &HA6D4
L_44BB: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_44BE: DI = &HB3F4
L_44C1: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_44C4: BX = DI
L_44C6: DI = &HA704
L_44C9: SI = &HB050
L_44CC: N_A704! = N_B050!  ' RT3F_7B
L_44CF: GOSUB L_07E8
L_44D2: DI = &HB3F4
L_44D5: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_44D8: IF CompareLeft! < CompareRight! THEN GOTO L_44DD  ' flags from L_44D5
L_44DA: GOTO L_44E3
L_44DD: GOSUB L_2687
L_44E0: GOTO L_388B
L_44E3: GOSUB L_2352
L_44E6: BX = &H14
L_44E9: ARGPUSH BX  ' RT3E_42
L_44EC: BX = 2
L_44EF: LOCATE ARGS(), BX  ' RT3E_44
L_44F2: ' PRINT statement begins (screen) ; RT3F_BC
L_44F5: BX = WORD(&HAE70)
L_44F9: DX = BX
L_44FB: BX = BX * (2 ^ 1)
L_44FD: BX = BX * (2 ^ 1)
L_44FF: CX = BX
L_4501: BX = BX + &H44F4
L_4505: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_4508: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_450B: DI = &HA6F8
L_450E: SI = &HB4A8
L_4511: N_A6F8! = N_B4A8!  ' RT3F_7B
L_4514: BX = DI
L_4516: DI = &HA6FC
L_4519: SI = &HA9FE
L_451C: N_A6FC! = N_A9FE!  ' RT3F_7B
L_451F: WORD(BP - 6) = DX
L_4522: WORD(BP - 8) = CX
L_4525: GOSUB L_07C9
L_4528: BX = CINT(FAC!)  ' RT3F_77
L_452B: DI = BX
L_452D: DI = DI * (2 ^ 1)
L_452F: DI = DI * (2 ^ 1)
L_4531: DI = DI + &H1850
L_4535: BX = WORD(BP - 6)
L_4538: DX = BX
L_453A: BX = BX + 1
L_453B: FAC! = CSNG(BX)  ' RT3F_57
L_453E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4541: DI = &HA6F8
L_4544: SI = &HA870
L_4547: N_A6F8! = N_A870!  ' RT3F_7B
L_454A: BX = DI
L_454C: DI = &HA6FC
L_454F: SI = &HA9FE
L_4552: N_A6FC! = N_A9FE!  ' RT3F_7B
L_4555: GOSUB L_07C9
L_4558: BX = CINT(FAC!)  ' RT3F_77
L_455B: DI = BX
L_455D: DI = DI * (2 ^ 1)
L_455F: DI = DI * (2 ^ 1)
L_4561: DI = DI + &H1850
L_4565: SI = WORD(BP - 8)
L_4568: SI = SI + &H6306
L_456C: N(DI) = N(SI)  ' RT3F_7B
L_456F: DI = &HA6F8
L_4572: BX = SI
L_4574: SI = &HA68E
L_4577: N_A6F8! = N_A68E!  ' RT3F_7B
L_457A: DX = DI
L_457C: DI = &HA6FC
L_457F: SI = &HA9FE
L_4582: N_A6FC! = N_A9FE!  ' RT3F_7B
L_4585: WORD(BP - &HA) = BX
L_4588: GOSUB L_07C9
L_458B: BX = CINT(FAC!)  ' RT3F_77
L_458E: DI = BX
L_4590: DI = DI * (2 ^ 1)
L_4592: DI = DI * (2 ^ 1)
L_4594: DI = DI + &H1850
L_4598: SI = WORD(BP - &HA)
L_459B: N(DI) = N(SI)  ' RT3F_7B
L_459E: DI = &HA6F8
L_45A1: SI = &HB4AC
L_45A4: N_A6F8! = N_B4AC!  ' RT3F_7B
L_45A7: DI = &HA6FC
L_45AA: SI = &HA9FE
L_45AD: N_A6FC! = N_A9FE!  ' RT3F_7B
L_45B0: GOSUB L_07C9
L_45B3: BX = CINT(FAC!)  ' RT3F_77
L_45B6: DI = BX
L_45B8: DI = DI * (2 ^ 1)
L_45BA: DI = DI * (2 ^ 1)
L_45BC: DI = DI + &H1850
L_45C0: SI = WORD(BP - 6)
L_45C3: SI = SI + &H20
L_45C6: SI = SI * (2 ^ 1)
L_45C8: SI = SI * (2 ^ 1)
L_45CA: SI = SI + &H6306
L_45CE: BX = DI
L_45D0: DI = &HA686
L_45D3: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_45D6: DI = BX
L_45D8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_45DB: SI = &HB3F4
L_45DE: FAC! = -N_B3F4!  ' RT3F_AF
L_45E1: DI = &HAA4C
L_45E4: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_45E7: GOSUB L_1E98
L_45EA: GOSUB L_20B6
L_45ED: GOTO L_388B
L_45F0: SI = &HAFFE
L_45F3: FAC! = N_AFFE!: DI = &H001E  ' RT3F_6F
L_45F6: GOTO L_462F
L_45F9: ' Alignment NOP
L_45FA: SI = &HA5C4
L_45FD: BX = SI
L_45FF: DX = BX
L_4601: BX = CINT(N_A5C4!)  ' RT3F_75
L_4604: SI = BX
L_4606: SI = SI * (2 ^ 1)
L_4608: SI = SI * (2 ^ 1)
L_460A: SI = SI + &H1850
L_460E: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4611: IF CompareLeft! = CompareRight! THEN GOTO L_4616  ' flags from L_460E
L_4613: GOTO L_4626
L_4616: SI = DX
L_4618: DI = &HB306
L_461B: N_B306! = N(SI)  ' RT3F_7B
L_461E: DI = DX
L_4620: SI = &HB4B0
L_4623: N(DI) = N_B4B0!  ' RT3F_7B
L_4626: DI = &HA5C0
L_4629: SI = &HA5C4
L_462C: FAC! = N_A5C4! + N_A5C0!  ' RT3F_7F
L_462F: DI = &HA5C4
L_4632: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_4635: SI = DI
L_4637: DI = &HB002
L_463A: CompareLeft! = N_A5C4!: CompareRight! = N_B002!  ' RT3F_9F
L_463D: IF CompareLeft! <= CompareRight! THEN GOTO L_45FA  ' flags from L_463A
L_463F: DI = &HB4B4
L_4642: SI = &HA5C4
L_4645: CompareLeft! = N_A5C4!: CompareRight! = N_B4B4!  ' RT3F_9F
L_4648: IF CompareLeft! < CompareRight! THEN GOTO L_464D  ' flags from L_4645
L_464A: GOTO L_4653
L_464D: GOSUB L_2649
L_4650: GOTO L_388B
L_4653: DI = &HB3E4
L_4656: SI = &HA854
L_4659: N_B3E4! = N_A854!  ' RT3F_7B
L_465C: DI = &HB3EC
L_465F: SI = &HB4B8
L_4662: N_B3EC! = N_B4B8!  ' RT3F_7B
L_4665: DI = &HB3F0
L_4668: SI = &HA686
L_466B: N_B3F0! = N_A686!  ' RT3F_7B
L_466E: BX = &HB48C
L_4671: DX = &HB3E8
L_4674: S_B3E8$ = S_B48C$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_4677: GOSUB L_A1D8
L_467A: DI = &HA844
L_467D: SI = &HAE16
L_4680: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_4683: BX = CINT(FAC!)  ' RT3F_77
L_4686: AX = BX
L_4688: WORD(&HAE70) = AX
L_468B: AX = AX OR AX
L_468D: IF (SF = OF) THEN GOTO L_4692  ' flags from L_468B
L_468F: GOTO L_388B
L_4692: SI = WORD(&HAE70)
L_4696: SI = SI + &HB
L_4699: SI = SI * (2 ^ 1)
L_469B: SI = SI * (2 ^ 1)
L_469D: SI = SI + &H63C6
L_46A1: DI = &HA6D4
L_46A4: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_46A7: DI = &HB3F4
L_46AA: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_46AD: BX = DI
L_46AF: DI = &HA704
L_46B2: SI = &HB050
L_46B5: N_A704! = N_B050!  ' RT3F_7B
L_46B8: GOSUB L_07E8
L_46BB: DI = &HB3F4
L_46BE: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_46C1: IF CompareLeft! < CompareRight! THEN GOTO L_46C6  ' flags from L_46BE
L_46C3: GOTO L_46CC
L_46C6: GOSUB L_2687
L_46C9: GOTO L_388B
L_46CC: GOSUB L_2352
L_46CF: BX = &H14
L_46D2: ARGPUSH BX  ' RT3E_42
L_46D5: BX = 2
L_46D8: LOCATE ARGS(), BX  ' RT3E_44
L_46DB: ' PRINT statement begins (screen) ; RT3F_BC
L_46DE: BX = WORD(&HAE70)
L_46E2: DX = BX
L_46E4: BX = BX * (2 ^ 1)
L_46E6: BX = BX * (2 ^ 1)
L_46E8: CX = BX
L_46EA: BX = BX + &H4534
L_46EE: AX = DX
L_46F0: DX = &H26
L_46F3: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_46F6: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_46F9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_46FC: SI = &HB306
L_46FF: BX = SI

```

### Ship-equipment purchasing

```basic
L_4701: DX = BX
L_4703: BX = CINT(N_B306!)  ' RT3F_75
L_4706: DI = BX
L_4708: DI = DI * (2 ^ 1)
L_470A: DI = DI * (2 ^ 1)
L_470C: DI = DI + &H1850
L_4710: AX = AX + 1
L_4711: BX = AX
L_4713: FAC! = CSNG(BX)  ' RT3F_57
L_4716: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4719: SI = DX
L_471B: DI = &H4F6C
L_471E: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_4721: BX = CINT(FAC!)  ' RT3F_77
L_4724: DI = BX
L_4726: DI = DI * (2 ^ 1)
L_4728: DI = DI * (2 ^ 1)
L_472A: DI = DI + &H1850
L_472E: CX = CX + &H63C6
L_4732: SI = CX
L_4734: BX = DI
L_4736: DI = &HA686
L_4739: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_473C: DI = BX
L_473E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4741: SI = DX
L_4743: DI = &H4F94
L_4746: FAC! = N(SI) + N_4F94!  ' RT3F_7F
L_4749: BX = CINT(FAC!)  ' RT3F_77
L_474C: DI = BX
L_474E: DI = DI * (2 ^ 1)
L_4750: DI = DI * (2 ^ 1)
L_4752: DI = DI + &H1850
L_4756: SI = &HA9FE
L_4759: N(DI) = N_A9FE!  ' RT3F_7B
L_475C: SI = &HB3F4
L_475F: FAC! = -N_B3F4!  ' RT3F_AF
L_4762: DI = &HAA4C
L_4765: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_4768: GOSUB L_1E98
L_476B: GOSUB L_20B6
L_476E: GOTO L_388B
L_4771: DI = &HA9FE
L_4774: SI = &HB050
L_4777: N_A9FE! = N_B050!  ' RT3F_7B
L_477A: GOSUB L_2352
L_477D: GOSUB L_4134
L_4780: BX = &H11
L_4783: ARGPUSH BX  ' RT3E_42
L_4786: BX = 2
L_4789: LOCATE ARGS(), BX  ' RT3E_44
L_478C: ' PRINT statement begins (screen) ; RT3F_BC
L_478F: DX = BX
L_4791: BX = &HB4BC
L_4794: PRINT S_B4BC$  ' RT3F_6E; H newline item, ledger correction
L_4797: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_479A: ARGPUSH OMITTED  ' RT3E_43
L_479D: BX = DX
L_479F: LOCATE ARGS(), BX  ' RT3E_44
L_47A2: ' PRINT statement begins (screen) ; RT3F_BC
L_47A5: BX = &HB4CC
L_47A8: PRINT S_B4CC$  ' RT3F_6E; H newline item, ledger correction
L_47AB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_47AE: ARGPUSH OMITTED  ' RT3E_43
L_47B1: BX = DX
L_47B3: LOCATE ARGS(), BX  ' RT3E_44
L_47B6: ' PRINT statement begins (screen) ; RT3F_BC
L_47B9: BX = &HB4E8
L_47BC: PRINT S_B4E8$  ' RT3F_6E; H newline item, ledger correction
L_47BF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_47C2: ARGPUSH OMITTED  ' RT3E_43
L_47C5: BX = 2
L_47C8: LOCATE ARGS(), BX  ' RT3E_44
L_47CB: ' PRINT statement begins (screen) ; RT3F_BC
L_47CE: DX = BX
L_47D0: BX = &HB4F6
L_47D3: PRINT S_B4F6$  ' RT3F_6E; H newline item, ledger correction
L_47D6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_47D9: ARGPUSH OMITTED  ' RT3E_43
L_47DC: BX = DX
L_47DE: LOCATE ARGS(), BX  ' RT3E_44
L_47E1: ' PRINT statement begins (screen) ; RT3F_BC
L_47E4: BX = &HB50C
L_47E7: PRINT S_B50C$  ' RT3F_6E; H newline item, ledger correction
L_47EA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_47ED: ARGPUSH OMITTED  ' RT3E_43
L_47F0: BX = DX
L_47F2: LOCATE ARGS(), BX  ' RT3E_44
L_47F5: ' PRINT statement begins (screen) ; RT3F_BC
L_47F8: BX = &HB520
L_47FB: PRINT S_B520$  ' RT3F_6E; H newline item, ledger correction
L_47FE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4801: DI = &HAE0E
L_4804: SI = &HA696
L_4807: N_AE0E! = N_A696!  ' RT3F_7B
L_480A: GOSUB L_1E7C
L_480D: DI = &HAE22
L_4810: SI = &HAE16
L_4813: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_4816: IF CompareLeft! = CompareRight! THEN GOTO L_4801  ' flags from L_4813
L_4818: DI = &HAE2E
L_481B: SI = &HAE16
L_481E: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_4821: IF CompareLeft! <> CompareRight! THEN GOTO L_4826  ' flags from L_481E
L_4823: GOTO L_37D0
L_4826: SI = &HAE16
L_4829: BX = CINT(N_AE16!)  ' RT3F_75
L_482C: ON BX GOTO L_483C, L_4AA8, L_4C7C, L_4DFE, L_4F01, L_5004  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_483C: GOSUB L_2352
L_483F: GOSUB L_9FED
L_4842: BX = &H18
L_4845: ARGPUSH BX  ' RT3E_42
L_4848: BX = 2
L_484B: LOCATE ARGS(), BX  ' RT3E_44
L_484E: ' PRINT statement begins (screen) ; RT3F_BC
L_4851: BX = &HB52C
L_4854: PRINT S_B52C$;  ' RT3F_6A
L_4857: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_485A: GOSUB L_A422
L_485D: CompareLeft% = WORD(&HAE70): CompareRight% = 0
L_4862: IF CompareLeft% <> CompareRight% THEN GOTO L_4867  ' flags from L_485D
L_4864: GOTO L_4771
L_4867: CompareLeft% = WORD(&HAE70): CompareRight% = 1
L_486C: BX = 0
L_486F: IF CompareLeft% >= CompareRight% THEN GOTO L_4872  ' flags from L_4867
L_4871: BX = BX - 1
L_4872: CompareLeft% = WORD(&HAE70): CompareRight% = 6
L_4877: DX = 0
L_487A: IF CompareLeft% <= CompareRight% THEN GOTO L_487D  ' flags from L_4872
L_487C: DX = DX - 1
L_487D: DX = DX OR BX
L_487F: CompareLeft% = DX: CompareRight% = 0
L_4881: IF CompareLeft% <> CompareRight% THEN GOTO L_485A  ' flags from L_487F
L_4883: AX = 7
L_4886: DX:AX = SIGNED16(AX) * SIGNED16(WORD(&HAE70))
L_488A: AX = AX + &H2AB
L_488D: BX = AX
L_488F: FAC! = CSNG(BX)  ' RT3F_57
L_4892: DI = &HAF0E
L_4895: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_4898: SI = DI
L_489A: BX = CINT(N_AF0E!)  ' RT3F_75
L_489D: SI = BX
L_489F: SI = SI * (2 ^ 1)
L_48A1: SI = SI * (2 ^ 1)
L_48A3: SI = SI + &H1850
L_48A7: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_48AA: IF CompareLeft! > CompareRight! THEN GOTO L_48AF  ' flags from L_48A7
L_48AC: GOTO L_48B5
L_48AF: GOSUB L_4A83
L_48B2: GOTO L_4771
L_48B5: DI = &HB3E4
L_48B8: SI = &H4F6C
L_48BB: N_B3E4! = N_4F6C!  ' RT3F_7B
L_48BE: DI = &HB3EC
L_48C1: SI = &HA66E
L_48C4: N_B3EC! = N_A66E!  ' RT3F_7B
L_48C7: DI = &HB3F0
L_48CA: SI = &HA67A
L_48CD: N_B3F0! = N_A67A!  ' RT3F_7B
L_48D0: BX = &HB554
L_48D3: DX = &HB3E8
L_48D6: S_B3E8$ = S_B554$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_48D9: GOSUB L_A1D8
L_48DC: DI = &HA844
L_48DF: SI = &HAE16
L_48E2: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_48E5: DI = &HB564
L_48E8: N_B564! = FAC!: SI = &H001A  ' RT3F_7D
L_48EB: SI = DI
L_48ED: CompareLeft! = N_B564!: CompareRight! = 0  ' RT3F_A7
L_48F0: IF CompareLeft! >= CompareRight! THEN GOTO L_48F5  ' flags from L_48ED
L_48F2: GOTO L_4771
L_48F5: SI = &HB564
L_48F8: BX = CINT(N_B564!)  ' RT3F_75
L_48FB: SI = BX
L_48FD: SI = SI + &H64
L_4900: SI = SI * (2 ^ 1)
L_4902: SI = SI * (2 ^ 1)
L_4904: SI = SI + &H554E
L_4908: DI = &HA6D4
L_490B: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_490E: DI = &HB3F4
L_4911: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_4914: BX = DI
L_4916: DI = &HA704
L_4919: SI = &HB050
L_491C: N_A704! = N_B050!  ' RT3F_7B
L_491F: GOSUB L_07E8
L_4922: DI = &HB3F4
L_4925: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_4928: IF CompareLeft! < CompareRight! THEN GOTO L_492D  ' flags from L_4925
L_492A: GOTO L_4933
L_492D: GOSUB L_2687
L_4930: GOTO L_4771
L_4933: AX = 7
L_4936: DX:AX = SIGNED16(AX) * SIGNED16(WORD(&HAE70))
L_493A: AX = AX + &H2AB
L_493D: BX = AX
L_493F: FAC! = CSNG(BX)  ' RT3F_57
L_4942: DI = &HAF0E
L_4945: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_4948: SI = &HAF0E
L_494B: BX = SI
L_494D: DX = BX
L_494F: BX = CINT(N_AF0E!)  ' RT3F_75
L_4952: DI = BX
L_4954: DI = DI * (2 ^ 1)
L_4956: DI = DI * (2 ^ 1)
L_4958: DI = DI + &H1850
L_495C: BX = DI
L_495E: DI = &H4F6C
L_4961: SI = &HB564
L_4964: FAC! = N_B564! + N_4F6C!  ' RT3F_7F
L_4967: SWAP BX, DI
L_4969: CX = SI
L_496B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_496E: DI = BX
L_4970: SI = DX
L_4972: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_4975: BX = CINT(FAC!)  ' RT3F_77
L_4978: DI = BX
L_497A: DI = DI * (2 ^ 1)
L_497C: DI = DI * (2 ^ 1)
L_497E: DI = DI + &H1850
L_4982: SI = CX
L_4984: BX = CINT(N(SI))  ' RT3F_75
L_4987: SI = BX
L_4989: SI = SI * (2 ^ 1)
L_498B: SI = SI * (2 ^ 1)
L_498D: SI = SI + &H554E
L_4991: N(DI) = N(SI)  ' RT3F_7B
L_4994: SI = DX
L_4996: DI = &H4F94
L_4999: FAC! = N(SI) + N_4F94!  ' RT3F_7F
L_499C: CX = BX
L_499E: BX = CINT(FAC!)  ' RT3F_77
L_49A1: DI = BX
L_49A3: DI = DI * (2 ^ 1)
L_49A5: DI = DI * (2 ^ 1)
L_49A7: DI = DI + &H1850
L_49AB: BX = CX
L_49AD: CX = CX + &H32
L_49B0: SI = CX
L_49B2: SI = SI * (2 ^ 1)
L_49B4: SI = SI * (2 ^ 1)
L_49B6: SI = SI + &H554E
L_49BA: N(DI) = N(SI)  ' RT3F_7B
L_49BD: SI = DX
L_49BF: CX = DI
L_49C1: DI = &HA5C0
L_49C4: FAC! = N(SI) + N_A5C0!  ' RT3F_7F
L_49C7: AX = BX
L_49C9: BX = CINT(FAC!)  ' RT3F_77
L_49CC: DI = BX
L_49CE: DI = DI * (2 ^ 1)
L_49D0: DI = DI * (2 ^ 1)
L_49D2: DI = DI + &H1850
L_49D6: BX = AX
L_49D8: AX = AX + &H4B
L_49DB: SI = AX
L_49DD: SI = SI * (2 ^ 1)
L_49DF: SI = SI * (2 ^ 1)
L_49E1: SI = SI + &H554E
L_49E5: AX = DI
L_49E7: DI = &HA686
L_49EA: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_49ED: DI = AX
L_49EF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_49F2: SI = DX
L_49F4: DI = &HA676
L_49F7: FAC! = N(SI) + N_A676!  ' RT3F_7F
L_49FA: AX = BX
L_49FC: BX = CINT(FAC!)  ' RT3F_77
L_49FF: DI = BX
L_4A01: DI = DI * (2 ^ 1)
L_4A03: DI = DI * (2 ^ 1)
L_4A05: DI = DI + &H1850
L_4A09: BX = AX
L_4A0B: AX = AX + &HAF
L_4A0E: SI = AX
L_4A10: SI = SI * (2 ^ 1)
L_4A12: SI = SI * (2 ^ 1)
L_4A14: SI = SI + &H554E
L_4A18: N(DI) = N(SI)  ' RT3F_7B
L_4A1B: SI = DX
L_4A1D: DI = &HA682
L_4A20: FAC! = N(SI) + N_A682!  ' RT3F_7F
L_4A23: AX = BX
L_4A25: BX = CINT(FAC!)  ' RT3F_77
L_4A28: DI = BX
L_4A2A: DI = DI * (2 ^ 1)
L_4A2C: DI = DI * (2 ^ 1)
L_4A2E: DI = DI + &H1850
L_4A32: SI = CX
L_4A34: N(DI) = N(SI)  ' RT3F_7B
L_4A37: SI = DX
L_4A39: DI = &HA696
L_4A3C: FAC! = N(SI) + N_A696!  ' RT3F_7F
L_4A3F: BX = CINT(FAC!)  ' RT3F_77
L_4A42: DI = BX
L_4A44: DI = DI * (2 ^ 1)
L_4A46: DI = DI * (2 ^ 1)
L_4A48: DI = DI + &H1850
L_4A4C: AX = AX + &H19
L_4A4F: SI = AX
L_4A51: SI = SI * (2 ^ 1)
L_4A53: SI = SI * (2 ^ 1)
L_4A55: SI = SI + &H554E
L_4A59: N(DI) = N(SI)  ' RT3F_7B
L_4A5C: SI = &HB3F4
L_4A5F: FAC! = -N_B3F4!  ' RT3F_AF
L_4A62: DI = &HAA4C
L_4A65: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_4A68: GOSUB L_1E98
L_4A6B: DI = WORD(&HAE70)
L_4A6F: DI = DI + &HA
L_4A72: DI = DI * (2 ^ 1)
L_4A74: DI = DI * (2 ^ 1)
L_4A76: DI = DI + &H1850
L_4A7A: SI = &H4F6C
L_4A7D: N(DI) = N_4F6C!  ' RT3F_7B
L_4A80: GOTO L_483C
L_4A83: GOSUB L_2352
L_4A86: BX = &H14
L_4A89: ARGPUSH BX  ' RT3E_42
L_4A8C: BX = 2
L_4A8F: LOCATE ARGS(), BX  ' RT3E_44
L_4A92: ' PRINT statement begins (screen) ; RT3F_BC
L_4A95: BX = &HB568
L_4A98: PRINT S_B568$  ' RT3F_6E; H newline item, ledger correction
L_4A9B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4A9E: GOSUB L_20B6
L_4AA1: RETURN
L_4AA2: GOSUB L_A0A3
L_4AA5: GOTO L_4AAB
L_4AA8: GOSUB L_9FED
L_4AAB: BX = &H18
L_4AAE: ARGPUSH BX  ' RT3E_42
L_4AB1: BX = 2
L_4AB4: LOCATE ARGS(), BX  ' RT3E_44
L_4AB7: ' PRINT statement begins (screen) ; RT3F_BC
L_4ABA: BX = &HB580
L_4ABD: PRINT S_B580$;  ' RT3F_6A
L_4AC0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4AC3: GOSUB L_A422
L_4AC6: CompareLeft% = WORD(&HAE70): CompareRight% = 0
L_4ACB: IF CompareLeft% <> CompareRight% THEN GOTO L_4AD0  ' flags from L_4AC6
L_4ACD: GOTO L_4771
L_4AD0: CompareLeft% = WORD(&HAE70): CompareRight% = 1
L_4AD5: BX = 0
L_4AD8: IF CompareLeft% >= CompareRight% THEN GOTO L_4ADB  ' flags from L_4AD0
L_4ADA: BX = BX - 1
L_4ADB: CompareLeft% = WORD(&HAE70): CompareRight% = 6
L_4AE0: DX = 0
L_4AE3: IF CompareLeft% <= CompareRight% THEN GOTO L_4AE6  ' flags from L_4ADB
L_4AE5: DX = DX - 1
L_4AE6: DX = DX OR BX
L_4AE8: CompareLeft% = DX: CompareRight% = 0
L_4AEA: IF CompareLeft% <> CompareRight% THEN GOTO L_4AAB  ' flags from L_4AE8
L_4AEC: AX = 7
L_4AEF: DX:AX = SIGNED16(AX) * SIGNED16(WORD(&HAE70))
L_4AF3: SI = AX
L_4AF5: SI = SI + &H2AB
L_4AF9: SI = SI * (2 ^ 1)
L_4AFB: SI = SI * (2 ^ 1)
L_4AFD: SI = SI + &H1850
L_4B01: DI = &HAF0E
L_4B04: N_AF0E! = N(SI)  ' RT3F_7B
L_4B07: SI = DI
L_4B09: DI = &H4F6C
L_4B0C: CompareLeft! = N_AF0E!: CompareRight! = N_4F6C!  ' RT3F_9F
L_4B0F: BX = 0
L_4B12: IF CompareLeft! >= CompareRight! THEN GOTO L_4B15  ' flags from L_4B0C
L_4B14: BX = BX - 1
L_4B15: DI = &HAE44
L_4B18: CompareLeft! = N(SI): CompareRight! = N_AE44!  ' RT3F_9F
L_4B1B: DX = 0
L_4B1E: IF CompareLeft! <= CompareRight! THEN GOTO L_4B21  ' flags from L_4B18
L_4B20: DX = DX - 1
L_4B21: DX = DX OR BX
L_4B23: CompareLeft% = DX: CompareRight% = 0
L_4B25: IF CompareLeft% <> CompareRight% THEN GOTO L_4B2A  ' flags from L_4B23
L_4B27: GOTO L_4B30
L_4B2A: BEEP  ' RT3E_2B
L_4B2D: GOTO L_4771
L_4B30: DI = &HAA2C
L_4B33: SI = &HA66E
L_4B36: N_AA2C! = N_A66E!  ' RT3F_7B
L_4B39: SI = &HB094
L_4B3C: FAC! = N_B094!: DI = &H001E  ' RT3F_6F
L_4B3F: GOTO L_4B80
L_4B42: SI = &HA5C4
L_4B45: BX = SI
L_4B47: DX = BX
L_4B49: BX = CINT(N_A5C4!)  ' RT3F_75
L_4B4C: SI = BX
L_4B4E: SI = SI * (2 ^ 1)
L_4B50: SI = SI * (2 ^ 1)
L_4B52: SI = SI + &H1850
L_4B56: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4B59: IF CompareLeft! = CompareRight! THEN GOTO L_4B5E  ' flags from L_4B56
L_4B5B: GOTO L_4B77
L_4B5E: SI = DX
L_4B60: DI = &HB5A2
L_4B63: N_B5A2! = N(SI)  ' RT3F_7B
L_4B66: DI = &HAA2C
L_4B69: SI = &H4F6C
L_4B6C: N_AA2C! = N_4F6C!  ' RT3F_7B
L_4B6F: DI = DX
L_4B71: SI = &HB0A6
L_4B74: N(DI) = N_B0A6!  ' RT3F_7B
L_4B77: DI = &H4F6C
L_4B7A: SI = &HA5C4
L_4B7D: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_4B80: DI = &HA5C4
L_4B83: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_4B86: SI = DI
L_4B88: DI = &HB0A6
L_4B8B: CompareLeft! = N_A5C4!: CompareRight! = N_B0A6!  ' RT3F_9F
L_4B8E: IF CompareLeft! <= CompareRight! THEN GOTO L_4B42  ' flags from L_4B8B
L_4B90: SI = &HAA2C
L_4B93: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_4B96: IF CompareLeft! = CompareRight! THEN GOTO L_4B9B  ' flags from L_4B93
L_4B98: GOTO L_4BA1
L_4B9B: GOSUB L_2649
L_4B9E: GOTO L_4771
L_4BA1: DI = &HA844
L_4BA4: SI = &HAF0E
L_4BA7: FAC! = N_AF0E! + N_A844!  ' RT3F_7F
L_4BAA: DI = SI
L_4BAC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4BAF: SI = DI
L_4BB1: BX = CINT(N(SI))  ' RT3F_75
L_4BB4: SI = BX
L_4BB6: SI = SI + &H7D
L_4BB9: SI = SI * (2 ^ 1)
L_4BBB: SI = SI * (2 ^ 1)
L_4BBD: SI = SI + &H554E
L_4BC1: DI = &HA6D4
L_4BC4: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_4BC7: DI = &HB3F4
L_4BCA: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_4BCD: BX = DI
L_4BCF: DI = &HA704
L_4BD2: SI = &HB050
L_4BD5: N_A704! = N_B050!  ' RT3F_7B
L_4BD8: GOSUB L_07E8
L_4BDB: DI = &HB3F4
L_4BDE: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_4BE1: IF CompareLeft! < CompareRight! THEN GOTO L_4BE6  ' flags from L_4BDE
L_4BE3: GOTO L_4BEC
L_4BE6: GOSUB L_2687
L_4BE9: GOTO L_4771
L_4BEC: SI = &HB5A2
L_4BEF: BX = SI
L_4BF1: DX = BX
L_4BF3: BX = CINT(N_B5A2!)  ' RT3F_75
L_4BF6: DI = BX
L_4BF8: DI = DI * (2 ^ 1)
L_4BFA: DI = DI * (2 ^ 1)
L_4BFC: DI = DI + &H1850
L_4C00: BX = DI
L_4C02: DI = &H4F6C
L_4C05: SI = &HAF0E
L_4C08: FAC! = N_AF0E! + N_4F6C!  ' RT3F_7F
L_4C0B: DI = BX
L_4C0D: CX = SI
L_4C0F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4C12: SI = DX
L_4C14: DI = &HAC70
L_4C17: FAC! = N(SI) + N_AC70!  ' RT3F_7F
L_4C1A: BX = CINT(FAC!)  ' RT3F_77
L_4C1D: DI = BX
L_4C1F: DI = DI * (2 ^ 1)
L_4C21: DI = DI * (2 ^ 1)
L_4C23: DI = DI + &H1850
L_4C27: SI = CX
L_4C29: BX = CINT(N(SI))  ' RT3F_75
L_4C2C: SI = BX
L_4C2E: SI = SI + &H96
L_4C32: SI = SI * (2 ^ 1)
L_4C34: SI = SI * (2 ^ 1)
L_4C36: SI = SI + &H554E
L_4C3A: BX = DI
L_4C3C: DI = &HA686
L_4C3F: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_4C42: DI = BX
L_4C44: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4C47: SI = &HB3F4
L_4C4A: FAC! = -N_B3F4!  ' RT3F_AF
L_4C4D: DI = &HAA4C
L_4C50: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_4C53: GOSUB L_1E98
L_4C56: DI = &HB5A6
L_4C59: SI = &HAF0E
L_4C5C: FAC! = N_AF0E! + N_B5A6!  ' RT3F_7F
L_4C5F: BX = CINT(FAC!)  ' RT3F_77
L_4C62: DI = BX
L_4C64: DI = DI * (2 ^ 1)
L_4C66: DI = DI * (2 ^ 1)
L_4C68: DI = DI + &H1850
L_4C6C: SI = DI
L_4C6E: DI = &H4F6C
L_4C71: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_4C74: DI = SI
L_4C76: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4C79: GOTO L_4AA2
L_4C7C: GOSUB L_A444
L_4C7F: BX = &H18
L_4C82: ARGPUSH BX  ' RT3E_42
L_4C85: BX = 2
L_4C88: LOCATE ARGS(), BX  ' RT3E_44
L_4C8B: ' PRINT statement begins (screen) ; RT3F_BC
L_4C8E: BX = &HB5AA
L_4C91: PRINT S_B5AA$;  ' RT3F_6A
L_4C94: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4C97: GOSUB L_A422
L_4C9A: CompareLeft% = WORD(&HAE70): CompareRight% = 1
L_4C9F: IF CompareLeft% >= CompareRight% THEN GOTO L_4CA4  ' flags from L_4C9A
L_4CA1: GOTO L_4771
L_4CA4: CompareLeft% = WORD(&HAE70): CompareRight% = 4
L_4CA9: IF CompareLeft% > CompareRight% THEN GOTO L_4C7F  ' flags from L_4CA4
L_4CAB: AX = 3
L_4CAE: DX:AX = SIGNED16(AX) * SIGNED16(WORD(&HAE70))
L_4CB2: SI = AX
L_4CB4: SI = SI + &H3F
L_4CB7: SI = SI * (2 ^ 1)
L_4CB9: SI = SI * (2 ^ 1)
L_4CBB: SI = SI + &H1850
L_4CBF: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4CC2: IF CompareLeft! > CompareRight! THEN GOTO L_4CC7  ' flags from L_4CBF
L_4CC4: GOTO L_4CCD
L_4CC7: GOSUB L_4A83
L_4CCA: GOTO L_4771
L_4CCD: DI = &HB3E4
L_4CD0: SI = &H4F94
L_4CD3: N_B3E4! = N_4F94!  ' RT3F_7B
L_4CD6: DI = &HB3EC
L_4CD9: SI = &HA66E
L_4CDC: N_B3EC! = N_A66E!  ' RT3F_7B
L_4CDF: DI = &HB3F0
L_4CE2: SI = &HA676
L_4CE5: N_B3F0! = N_A676!  ' RT3F_7B
L_4CE8: BX = &HB5C4
L_4CEB: DX = &HB3E8
L_4CEE: S_B3E8$ = S_B5C4$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_4CF1: GOSUB L_A1D8
L_4CF4: DI = &HA844
L_4CF7: SI = &HAE16
L_4CFA: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_4CFD: BX = CINT(FAC!)  ' RT3F_77
L_4D00: AX = BX
L_4D02: WORD(&HB5CE) = AX
L_4D05: AX = AX OR AX
L_4D07: IF (SF = OF) THEN GOTO L_4D0C  ' flags from L_4D05
L_4D09: GOTO L_4771
L_4D0C: AX = 3
L_4D0F: DX:AX = SIGNED16(AX) * SIGNED16(WORD(&HAE70))
L_4D13: AX = AX + &H3F
L_4D16: BX = AX
L_4D18: FAC! = CSNG(BX)  ' RT3F_57
L_4D1B: DI = &HAF0E
L_4D1E: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_4D21: SI = WORD(&HB5CE)
L_4D25: SI = SI + 5
L_4D28: SI = SI * (2 ^ 1)
L_4D2A: SI = SI * (2 ^ 1)
L_4D2C: SI = SI + &H54B2
L_4D30: DI = &HA6D4
L_4D33: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_4D36: DI = &HB3F4
L_4D39: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_4D3C: BX = DI
L_4D3E: DI = &HA704
L_4D41: SI = &HB050
L_4D44: N_A704! = N_B050!  ' RT3F_7B
L_4D47: GOSUB L_07E8
L_4D4A: DI = &HB3F4
L_4D4D: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_4D50: IF CompareLeft! < CompareRight! THEN GOTO L_4D55  ' flags from L_4D4D
L_4D52: GOTO L_4D5B
L_4D55: GOSUB L_2687
L_4D58: GOTO L_4771
L_4D5B: SI = &HAF0E
L_4D5E: BX = SI
L_4D60: DX = BX
L_4D62: BX = CINT(N_AF0E!)  ' RT3F_75
L_4D65: DI = BX
L_4D67: DI = DI * (2 ^ 1)
L_4D69: DI = DI * (2 ^ 1)
L_4D6B: DI = DI + &H1850
L_4D6F: BX = WORD(&HB5CE)
L_4D73: CX = BX
L_4D75: BX = BX + 1
L_4D76: FAC! = CSNG(BX)  ' RT3F_57
L_4D79: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4D7C: SI = DX
L_4D7E: DI = &H4F6C
L_4D81: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_4D84: BX = CINT(FAC!)  ' RT3F_77
L_4D87: SI = BX
L_4D89: SI = SI * (2 ^ 1)
L_4D8B: SI = SI * (2 ^ 1)
L_4D8D: SI = SI + &H1850
L_4D91: SWAP SI, DI
L_4D93: BX = CX
L_4D95: CX = CX + &HA
L_4D98: AX = DI
L_4D9A: DI = CX
L_4D9C: DI = DI * (2 ^ 1)
L_4D9E: DI = DI * (2 ^ 1)
L_4DA0: DI = DI + &H54B2
L_4DA4: SWAP DI, SI
L_4DA6: SWAP DI, AX
L_4DA7: N(DI) = N(SI)  ' RT3F_7B
L_4DAA: SI = DX
L_4DAC: DI = &H4F94
L_4DAF: FAC! = N(SI) + N_4F94!  ' RT3F_7F
L_4DB2: DX = BX
L_4DB4: BX = CINT(FAC!)  ' RT3F_77
L_4DB7: DI = BX
L_4DB9: DI = DI * (2 ^ 1)
L_4DBB: DI = DI * (2 ^ 1)
L_4DBD: DI = DI + &H1850
L_4DC1: SI = DX
L_4DC3: SI = SI * (2 ^ 1)
L_4DC5: SI = SI * (2 ^ 1)
L_4DC7: SI = SI + &H54B2
L_4DCB: BX = DI
L_4DCD: DI = &HA686
L_4DD0: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_4DD3: DI = BX
L_4DD5: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4DD8: DI = WORD(&HAE70)
L_4DDC: DI = DI + 6
L_4DDF: DI = DI * (2 ^ 1)
L_4DE1: DI = DI * (2 ^ 1)
L_4DE3: DI = DI + &H1850
L_4DE7: SI = AX
L_4DE9: N(DI) = N(SI)  ' RT3F_7B
L_4DEC: SI = &HB3F4
L_4DEF: FAC! = -N_B3F4!  ' RT3F_AF
L_4DF2: DI = &HAA4C
L_4DF5: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_4DF8: GOSUB L_1E98
L_4DFB: GOTO L_4C7C
L_4DFE: SI = &H194C
L_4E01: CompareLeft! = N_194C!: CompareRight! = 0  ' RT3F_A7
L_4E04: IF CompareLeft! > CompareRight! THEN GOTO L_4E09  ' flags from L_4E01
L_4E06: GOTO L_4E0F
L_4E09: GOSUB L_4A83
L_4E0C: GOTO L_4771
L_4E0F: DI = &HB3E4
L_4E12: SI = &HA5C0
L_4E15: N_B3E4! = N_A5C0!  ' RT3F_7B
L_4E18: DI = &HB3EC
L_4E1B: SI = &HA874
L_4E1E: N_B3EC! = N_A874!  ' RT3F_7B
L_4E21: DI = &HB3F0
L_4E24: SI = &HA676
L_4E27: N_B3F0! = N_A676!  ' RT3F_7B
L_4E2A: BX = &HB5D0
L_4E2D: DX = &HB3E8
L_4E30: S_B3E8$ = S_B5D0$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_4E33: GOSUB L_A1D8
L_4E36: DI = &HA844
L_4E39: SI = &HAE16
L_4E3C: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_4E3F: BX = CINT(FAC!)  ' RT3F_77
L_4E42: AX = BX
L_4E44: WORD(&HAE70) = AX
L_4E47: AX = AX OR AX
L_4E49: IF (SF = OF) THEN GOTO L_4E4E  ' flags from L_4E47
L_4E4B: GOTO L_4771
L_4E4E: SI = WORD(&HAE70)
L_4E52: SI = SI + 5
L_4E55: SI = SI * (2 ^ 1)
L_4E57: SI = SI * (2 ^ 1)
L_4E59: SI = SI + &H54EE
L_4E5D: DI = &HA6D4
L_4E60: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_4E63: DI = &HB3F4
L_4E66: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_4E69: BX = DI
L_4E6B: DI = &HA704
L_4E6E: SI = &HB050
L_4E71: N_A704! = N_B050!  ' RT3F_7B
L_4E74: GOSUB L_07E8
L_4E77: DI = &HB3F4
L_4E7A: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_4E7D: IF CompareLeft! < CompareRight! THEN GOTO L_4E82  ' flags from L_4E7A
L_4E7F: GOTO L_4E88
L_4E82: GOSUB L_2687
L_4E85: GOTO L_4771
L_4E88: GOSUB L_2352
L_4E8B: BX = &H14
L_4E8E: ARGPUSH BX  ' RT3E_42
L_4E91: BX = 2
L_4E94: LOCATE ARGS(), BX  ' RT3E_44
L_4E97: ' PRINT statement begins (screen) ; RT3F_BC
L_4E9A: BX = WORD(&HAE70)
L_4E9E: DX = BX
L_4EA0: BX = BX * (2 ^ 1)
L_4EA2: BX = BX * (2 ^ 1)
L_4EA4: CX = BX
L_4EA6: BX = BX + &H4370
L_4EAA: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_4EAD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4EB0: BX = DX
L_4EB2: DX = DX + 1
L_4EB3: SWAP DX, BX
L_4EB5: FAC! = CSNG(BX)  ' RT3F_57
L_4EB8: DI = &H194C
L_4EBB: N_194C! = FAC!: SI = &H001A  ' RT3F_7D
L_4EBE: DX = DX + &HA
L_4EC1: SI = DX
L_4EC3: SI = SI * (2 ^ 1)
L_4EC5: SI = SI * (2 ^ 1)
L_4EC7: SI = SI + &H54EE
L_4ECB: DI = &H1950
L_4ECE: N_1950! = N(SI)  ' RT3F_7B
L_4ED1: DI = &H1894
L_4ED4: SI = &H4F6C
L_4ED7: N_1894! = N_4F6C!  ' RT3F_7B
L_4EDA: CX = CX + &H54EE
L_4EDE: SI = CX
L_4EE0: DI = &HA686
L_4EE3: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_4EE6: DI = &H1954
L_4EE9: N_1954! = FAC!: SI = &H001A  ' RT3F_7D
L_4EEC: SI = &HB3F4
L_4EEF: FAC! = -N_B3F4!  ' RT3F_AF
L_4EF2: DI = &HAA4C
L_4EF5: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_4EF8: GOSUB L_1E98
L_4EFB: GOSUB L_20B6
L_4EFE: GOTO L_4771
L_4F01: SI = &H1940
L_4F04: CompareLeft! = N_1940!: CompareRight! = 0  ' RT3F_A7
L_4F07: IF CompareLeft! > CompareRight! THEN GOTO L_4F0C  ' flags from L_4F04
L_4F09: GOTO L_4F12
L_4F0C: GOSUB L_4A83
L_4F0F: GOTO L_4771
L_4F12: DI = &HB3E4
L_4F15: SI = &HA676
L_4F18: N_B3E4! = N_A676!  ' RT3F_7B
L_4F1B: DI = &HB3EC
L_4F1E: SI = &HA66E
L_4F21: N_B3EC! = N_A66E!  ' RT3F_7B
L_4F24: DI = &HB3F0
L_4F27: SI = &H4F94
L_4F2A: N_B3F0! = N_4F94!  ' RT3F_7B
L_4F2D: BX = &HB5E0
L_4F30: DX = &HB3E8
L_4F33: S_B3E8$ = S_B5E0$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_4F36: GOSUB L_A1D8
L_4F39: DI = &HA844
L_4F3C: SI = &HAE16
L_4F3F: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_4F42: BX = CINT(FAC!)  ' RT3F_77
L_4F45: AX = BX
L_4F47: WORD(&HAE70) = AX
L_4F4A: AX = AX OR AX
L_4F4C: IF (SF = OF) THEN GOTO L_4F51  ' flags from L_4F4A
L_4F4E: GOTO L_4771
L_4F51: SI = WORD(&HAE70)
L_4F55: SI = SI + 3
L_4F58: SI = SI * (2 ^ 1)
L_4F5A: SI = SI * (2 ^ 1)
L_4F5C: SI = SI + &H552A
L_4F60: DI = &HA6D4
L_4F63: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_4F66: DI = &HB3F4
L_4F69: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_4F6C: BX = DI
L_4F6E: DI = &HA704
L_4F71: SI = &HB050
L_4F74: N_A704! = N_B050!  ' RT3F_7B
L_4F77: GOSUB L_07E8
L_4F7A: DI = &HB3F4
L_4F7D: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_4F80: IF CompareLeft! < CompareRight! THEN GOTO L_4F85  ' flags from L_4F7D
L_4F82: GOTO L_4F8B
L_4F85: GOSUB L_2687
L_4F88: GOTO L_4771
L_4F8B: GOSUB L_2352
L_4F8E: BX = &H14
L_4F91: ARGPUSH BX  ' RT3E_42
L_4F94: BX = 2
L_4F97: LOCATE ARGS(), BX  ' RT3E_44
L_4F9A: ' PRINT statement begins (screen) ; RT3F_BC
L_4F9D: BX = WORD(&HAE70)
L_4FA1: DX = BX
L_4FA3: BX = BX * (2 ^ 1)
L_4FA5: BX = BX * (2 ^ 1)
L_4FA7: CX = BX
L_4FA9: BX = BX + &H4384
L_4FAD: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_4FB0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_4FB3: BX = DX
L_4FB5: DX = DX + 1
L_4FB6: SWAP DX, BX
L_4FB8: FAC! = CSNG(BX)  ' RT3F_57
L_4FBB: DI = &H1940
L_4FBE: N_1940! = FAC!: SI = &H001A  ' RT3F_7D
L_4FC1: DX = DX + 6
L_4FC4: SI = DX
L_4FC6: SI = SI * (2 ^ 1)
L_4FC8: SI = SI * (2 ^ 1)
L_4FCA: SI = SI + &H552A
L_4FCE: DI = &H1944
L_4FD1: N_1944! = N(SI)  ' RT3F_7B
L_4FD4: DI = &H1898
L_4FD7: SI = &H4F6C
L_4FDA: N_1898! = N_4F6C!  ' RT3F_7B
L_4FDD: CX = CX + &H552A
L_4FE1: SI = CX
L_4FE3: DI = &HA686
L_4FE6: FAC! = N(SI) * N_A686!  ' RT3F_8F
L_4FE9: DI = &H1948
L_4FEC: N_1948! = FAC!: SI = &H001A  ' RT3F_7D
L_4FEF: SI = &HB3F4
L_4FF2: FAC! = -N_B3F4!  ' RT3F_AF
L_4FF5: DI = &HAA4C
L_4FF8: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_4FFB: GOSUB L_1E98
L_4FFE: GOSUB L_20B6
L_5001: GOTO L_4771
L_5004: GOSUB L_2374
L_5007: BX = &H12
L_500A: ARGPUSH BX  ' RT3E_42
L_500D: BX = 2
L_5010: LOCATE ARGS(), BX  ' RT3E_44
L_5013: DI = &HA844
L_5016: SI = &H18FC
L_5019: FAC! = N_18FC! + N_A844!  ' RT3F_7F
L_501C: DI = &HAF3A
L_501F: N_AF3A! = FAC!: SI = &H001A  ' RT3F_7D
L_5022: SI = DI
L_5024: CompareLeft! = N_AF3A!: CompareRight! = 0  ' RT3F_A7
L_5027: IF CompareLeft! < CompareRight! THEN GOTO L_502C  ' flags from L_5024
L_5029: GOTO L_503E
L_502C: ' PRINT statement begins (screen) ; RT3F_BC
L_502F: BX = &HB5F2
L_5032: PRINT S_B5F2$  ' RT3F_6E; H newline item, ledger correction
L_5035: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5038: GOSUB L_20B6
L_503B: GOSUB L_4771
L_503E: ' PRINT statement begins (screen) ; RT3F_BC
L_5041: BX = &HB610
L_5044: PRINT S_B610$;  ' RT3F_6A
L_5047: BX = &H192C
L_504A: PRINT N_192C!  ' RT3F_6B
L_504D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5050: BX = &H13
L_5053: ARGPUSH BX  ' RT3E_42
L_5056: BX = 2
L_5059: LOCATE ARGS(), BX  ' RT3E_44
L_505C: ' PRINT statement begins (screen) ; RT3F_BC
L_505F: DX = BX
L_5061: BX = &HB62A
L_5064: PRINT S_B62A$;  ' RT3F_6A
L_5067: SI = &HAF3A
L_506A: BX = CINT(N_AF3A!)  ' RT3F_75
L_506D: CX = BX
L_506F: BX = BX + &H51
L_5072: BX = BX * (2 ^ 1)
L_5074: BX = BX * (2 ^ 1)
L_5076: BX = BX + &H52DE
L_507A: PRINT N(BX)  ' RT3F_6B
L_507D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5080: BX = &H14
L_5083: ARGPUSH BX  ' RT3E_42
L_5086: BX = DX
L_5088: LOCATE ARGS(), BX  ' RT3E_44
L_508B: ' PRINT statement begins (screen) ; RT3F_BC
L_508E: BX = &HB644
L_5091: PRINT S_B644$;  ' RT3F_6A
L_5094: CX = CX + &H5A
L_5097: DI = CX
L_5099: DI = DI * (2 ^ 1)
L_509B: DI = DI * (2 ^ 1)
L_509D: DI = DI + &H52DE
L_50A1: SI = &H4F6C
L_50A4: FAC! = N_4F6C! / N(DI)  ' RT3F_87
L_50A7: BX = &H1A
L_50AA: FAC! = INT(FAC!)  ' RT3D_03
L_50AD: BX = &H1A
L_50B0: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_50B3: BX = &HB65A
L_50B6: PRINT S_B65A$  ' RT3F_6E; H newline item, ledger correction
L_50B9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_50BC: DI = &H192C
L_50BF: SI = &HAC50
L_50C2: FAC! = N_AC50! - N_192C!  ' RT3F_97
L_50C5: DI = &HB688
L_50C8: N_B688! = FAC!: SI = &H001A  ' RT3F_7D
L_50CB: BX = &H15
L_50CE: ARGPUSH BX  ' RT3E_42
L_50D1: BX = 2
L_50D4: LOCATE ARGS(), BX  ' RT3E_44
L_50D7: ' PRINT statement begins (screen) ; RT3F_BC
L_50DA: BX = &HB664
L_50DD: PRINT S_B664$;  ' RT3F_6A
L_50E0: BX = DI
L_50E2: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_50E5: BX = &HB678
L_50E8: PRINT S_B678$  ' RT3F_6E; H newline item, ledger correction
L_50EB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_50EE: BX = &H18
L_50F1: ARGPUSH BX  ' RT3E_42
L_50F4: BX = 2
L_50F7: LOCATE ARGS(), BX  ' RT3E_44
L_50FA: ' PRINT statement begins (screen) ; RT3F_BC
L_50FD: BX = &HB68C

```

### Ship browsing and buying

```basic
L_5100: PRINT S_B68C$;  ' RT3F_6A
L_5103: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5106: GOSUB L_24EB
L_5109: CompareLeft% = WORD(&HAE70): CompareRight% = 1
L_510E: IF CompareLeft% >= CompareRight% THEN GOTO L_5113  ' flags from L_5109
L_5110: GOTO L_4771
L_5113: BX = WORD(&HAE70)
L_5117: FAC! = CSNG(BX)  ' RT3F_57
L_511A: DI = &HB688
L_511D: CompareLeft! = FAC!: CompareRight! = N_B688!  ' RT3F_A1
L_5120: IF CompareLeft! > CompareRight! THEN GOTO L_5125  ' flags from L_511D
L_5122: GOTO L_512F
L_5125: SI = DI
L_5127: BX = CINT(N(SI))  ' RT3F_75
L_512A: AX = BX
L_512C: WORD(&HAE70) = AX
L_512F: SI = &HAF3A
L_5132: BX = CINT(N_AF3A!)  ' RT3F_75
L_5135: SI = BX
L_5137: SI = SI + &H51
L_513A: SI = SI * (2 ^ 1)
L_513C: SI = SI * (2 ^ 1)
L_513E: SI = SI + &H52DE
L_5142: BX = WORD(&HAE70)
L_5146: FAC! = CSNG(BX)  ' RT3F_57
L_5149: FAC! = N(SI) * FAC!  ' RT3F_93
L_514C: DI = &HB3F4
L_514F: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_5152: BX = DI
L_5154: DI = &HA704
L_5157: SI = &HB6A6
L_515A: N_A704! = N_B6A6!  ' RT3F_7B
L_515D: GOSUB L_07E8
L_5160: DI = &HB3F4
L_5163: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_5166: IF CompareLeft! < CompareRight! THEN GOTO L_516B  ' flags from L_5163
L_5168: GOTO L_5171
L_516B: GOSUB L_2687
L_516E: GOTO L_4771
L_5171: BX = WORD(&HAE70)
L_5175: FAC! = CSNG(BX)  ' RT3F_57
L_5178: SI = &H192C
L_517B: FAC! = N_192C! + FAC!  ' RT3F_83
L_517E: DI = SI
L_5180: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5183: SI = &HB3F4
L_5186: FAC! = -N_B3F4!  ' RT3F_AF
L_5189: DI = &HAA4C
L_518C: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_518F: GOSUB L_1E98
L_5192: GOSUB L_20B6
L_5195: GOTO L_4771
L_5198: DI = &HA9FE
L_519B: SI = &HB050
L_519E: N_A9FE! = N_B050!  ' RT3F_7B
L_51A1: DI = &HAF36
L_51A4: N_AF36! = N_B050!  ' RT3F_7B
L_51A7: GOSUB L_1EFD
L_51AA: GOSUB L_2374
L_51AD: GOSUB L_4134
L_51B0: BX = &H12
L_51B3: ARGPUSH BX  ' RT3E_42
L_51B6: BX = 2
L_51B9: LOCATE ARGS(), BX  ' RT3E_44
L_51BC: SI = &HAF36
L_51BF: BX = CINT(N_AF36!)  ' RT3F_75
L_51C2: SI = BX
L_51C4: SI = SI + &H36
L_51C7: SI = SI * (2 ^ 1)
L_51C9: SI = SI * (2 ^ 1)
L_51CB: SI = SI + &H52DE
L_51CF: DI = &HAF3A
L_51D2: N_AF3A! = N(SI)  ' RT3F_7B
L_51D5: ' PRINT statement begins (screen) ; RT3F_BC
L_51D8: BX = BX * (2 ^ 1)
L_51DA: BX = BX * (2 ^ 1)
L_51DC: BX = BX + &H4324
L_51E0: PRINT S(BX);  ' RT3F_6A
L_51E3: BX = &HB6AA
L_51E6: PRINT S_B6AA$;  ' RT3F_6A
L_51E9: SI = DI
L_51EB: BX = CINT(N(SI))  ' RT3F_75
L_51EE: BX = BX * (2 ^ 1)
L_51F0: BX = BX * (2 ^ 1)
L_51F2: BX = BX + &H4348
L_51F6: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_51F9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_51FC: SI = &HAF36
L_51FF: BX = CINT(N_AF36!)  ' RT3F_75
L_5202: SI = BX
L_5204: SI = SI + &H1B
L_5207: SI = SI * (2 ^ 1)
L_5209: SI = SI * (2 ^ 1)
L_520B: SI = SI + &H52DE
L_520F: DI = &HA6D4
L_5212: FAC! = N(SI) * N_A6D4!  ' RT3F_8F
L_5215: DI = &HB3F4
L_5218: N_B3F4! = FAC!: SI = &H001A  ' RT3F_7D
L_521B: BX = &H14
L_521E: ARGPUSH BX  ' RT3E_42
L_5221: BX = 2
L_5224: LOCATE ARGS(), BX  ' RT3E_44
L_5227: ' PRINT statement begins (screen) ; RT3F_BC
L_522A: BX = &HB6B6
L_522D: PRINT S_B6B6$;  ' RT3F_6A
L_5230: BX = DI
L_5232: FAC! = INT(N(BX))  ' RT3D_03
L_5235: BX = &H1A
L_5238: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_523B: BX = &HB6C0
L_523E: PRINT S_B6C0$  ' RT3F_6E; H newline item, ledger correction
L_5241: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5244: BX = &H17
L_5247: ARGPUSH BX  ' RT3E_42
L_524A: BX = 2
L_524D: LOCATE ARGS(), BX  ' RT3E_44
L_5250: ' PRINT statement begins (screen) ; RT3F_BC
L_5253: DX = BX
L_5255: BX = &HB6CC
L_5258: PRINT S_B6CC$  ' RT3F_6E; H newline item, ledger correction
L_525B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_525E: BX = &H18
L_5261: ARGPUSH BX  ' RT3E_42
L_5264: BX = DX
L_5266: LOCATE ARGS(), BX  ' RT3E_44
L_5269: ' PRINT statement begins (screen) ; RT3F_BC
L_526C: BX = &HB6EA
L_526F: PRINT S_B6EA$;  ' RT3F_6A
L_5272: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5275: GOSUB L_541A
L_5278: BX = 6
L_527B: ARGPUSH BX  ' RT3E_42
L_527E: SI = &HAF36
L_5281: BX = CINT(N_AF36!)  ' RT3F_75
L_5284: BX = BX * (2 ^ 1)
L_5286: BX = BX * (2 ^ 1)
L_5288: BX = BX + &H4324
L_528C: DX = BX
L_528E: BX = LEN(S(BX))  ' RT3F_BA
L_5291: FAC! = CSNG(BX)  ' RT3F_57
L_5294: DI = &HA70C
L_5297: FAC! = FAC! * N_A70C!  ' RT3F_91
L_529A: SI = &HA868
L_529D: FAC! = N_A868! - FAC!  ' RT3F_9B
L_52A0: BX = &H1A
L_52A3: FAC! = INT(FAC!)  ' RT3D_03
L_52A6: BX = CINT(FAC!)  ' RT3F_77
L_52A9: LOCATE ARGS(), BX  ' RT3E_44
L_52AC: ' PRINT statement begins (screen) ; RT3F_BC
L_52AF: BX = DX
L_52B1: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_52B4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_52B7: SI = &HAF3A
L_52BA: CompareLeft! = N_AF3A!: CompareRight! = 0  ' RT3F_A7
L_52BD: IF CompareLeft! = CompareRight! THEN GOTO L_52C2  ' flags from L_52BA
L_52BF: GOTO L_52DB
L_52C2: BX = &H105
L_52C5: DX = &H4A
L_52C8: CX = 0
L_52CA: AX = CX
L_52CC: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_52CF: BX = &H4F9E
L_52D2: DX = 4
L_52D5: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_52D8: GOTO L_533F
L_52DB: DI = &H4F6C
L_52DE: SI = &HAF3A
L_52E1: CompareLeft! = N_AF3A!: CompareRight! = N_4F6C!  ' RT3F_9F
L_52E4: IF CompareLeft! = CompareRight! THEN GOTO L_52E9  ' flags from L_52E1
L_52E6: GOTO L_5302
L_52E9: BX = &H105
L_52EC: DX = &H4A
L_52EF: CX = 0
L_52F1: AX = CX
L_52F3: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_52F6: BX = &H5034
L_52F9: DX = 4
L_52FC: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_52FF: GOTO L_533F
L_5302: DI = &H4F94
L_5305: SI = &HAF3A
L_5308: CompareLeft! = N_AF3A!: CompareRight! = N_4F94!  ' RT3F_9F
L_530B: IF CompareLeft! = CompareRight! THEN GOTO L_5310  ' flags from L_5308
L_530D: GOTO L_5329
L_5310: BX = &H105
L_5313: DX = &H4A
L_5316: CX = 0
L_5318: AX = CX
L_531A: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_531D: BX = &H50CA
L_5320: DX = 4
L_5323: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_5326: GOTO L_533F
L_5329: BX = &H105
L_532C: DX = &H4A
L_532F: CX = 0
L_5331: AX = CX
L_5333: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_5336: BX = &H5160
L_5339: DX = 4
L_533C: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_533F: DI = &HAE0E
L_5342: SI = &H4F94
L_5345: N_AE0E! = N_4F94!  ' RT3F_7B
L_5348: GOSUB L_22C4
L_534B: DI = &H4F6C
L_534E: SI = &HAE16
L_5351: CompareLeft! = N_AE16!: CompareRight! = N_4F6C!  ' RT3F_9F
L_5354: IF CompareLeft! = CompareRight! THEN GOTO L_533F  ' flags from L_5351
L_5356: DI = &HAE2E
L_5359: SI = &HAE16
L_535C: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_535F: IF CompareLeft! = CompareRight! THEN GOTO L_5364  ' flags from L_535C
L_5361: GOTO L_536D
L_5364: GOSUB L_541A
L_5367: GOSUB L_1EFD
L_536A: GOTO L_37D0
L_536D: DI = &H4F94
L_5370: SI = &HAE16
L_5373: CompareLeft! = N_AE16!: CompareRight! = N_4F94!  ' RT3F_9F
L_5376: IF CompareLeft! <> CompareRight! THEN GOTO L_537B  ' flags from L_5373
L_5378: GOTO L_53A1
L_537B: DI = &H4F6C
L_537E: SI = &HAF36
L_5381: FAC! = N_AF36! + N_4F6C!  ' RT3F_7F
L_5384: DI = SI
L_5386: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5389: SI = DI
L_538B: DI = &HA5CC
L_538E: CompareLeft! = N(SI): CompareRight! = N_A5CC!  ' RT3F_9F
L_5391: IF CompareLeft! > CompareRight! THEN GOTO L_5396  ' flags from L_538E
L_5393: GOTO L_539E
L_5396: DI = SI
L_5398: SI = &HA66E
L_539B: N(DI) = N_A66E!  ' RT3F_7B
L_539E: GOTO L_51AA
L_53A1: SI = &H18FC
L_53A4: CompareLeft! = N_18FC!: CompareRight! = 0  ' RT3F_A7
L_53A7: IF CompareLeft! > CompareRight! THEN GOTO L_53AC  ' flags from L_53A4
L_53A9: GOTO L_53B8
L_53AC: GOSUB L_4A83
L_53AF: GOSUB L_541A
L_53B2: GOSUB L_1EFD
L_53B5: GOTO L_37D0
L_53B8: DI = &HA704
L_53BB: SI = &HA66E
L_53BE: N_A704! = N_A66E!  ' RT3F_7B
L_53C1: GOSUB L_07E8
L_53C4: DI = &HB3F4
L_53C7: CompareLeft! = FAC!: CompareRight! = N_B3F4!  ' RT3F_A1
L_53CA: IF CompareLeft! < CompareRight! THEN GOTO L_53CF  ' flags from L_53C7
L_53CC: GOTO L_53D5
L_53CF: GOSUB L_2687
L_53D2: GOTO L_51AA
L_53D5: GOSUB L_29F8
L_53D8: GOSUB L_541A
L_53DB: SI = &HB3F4
L_53DE: FAC! = -N_B3F4!  ' RT3F_AF
L_53E1: DI = &HAA4C
L_53E4: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_53E7: GOSUB L_1E98
L_53EA: BX = &H4F8A
L_53ED: DX = &H488C
L_53F0: S_488C$ = S_4F8A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_53F3: GOSUB L_2352
L_53F6: BX = &H14
L_53F9: ARGPUSH BX  ' RT3E_42
L_53FC: BX = 2
L_53FF: LOCATE ARGS(), BX  ' RT3E_44

```

### Recruitment and personnel

```basic
L_5402: ' PRINT statement begins (screen) ; RT3F_BC
L_5405: BX = &HB70C
L_5408: PRINT S_B70C$  ' RT3F_6E; H newline item, ledger correction
L_540B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_540E: GOSUB L_20B6
L_5411: GOSUB L_20B6
L_5414: GOSUB L_1EFD
L_5417: GOTO L_37D0
L_541A: BX = &HE8
L_541D: DX = &H20
L_5420: CX = 0
L_5422: AX = CX
L_5424: Line1X! = COORD(BX,CX): Line1Y! = COORD(DX,AX)  ' RT3E_84
L_5427: BX = &H138
L_542A: DX = &H70
L_542D: Line2X! = COORD(BX,CX): Line2Y! = COORD(DX,AX)  ' RT3E_85
L_5430: BX = 0
L_5432: DX = 1
L_5435: CX = &HFFFF
L_5438: LINE (Line1X!,Line1Y!)-(Line2X!,Line2Y!), BX, BOXMODE(DX), CX  ' RT3E_86
L_543B: RETURN
L_543C: GOSUB L_2352
L_543F: GOSUB L_646D
L_5442: BX = &H10
L_5445: ARGPUSH BX  ' RT3E_42
L_5448: BX = 6
L_544B: LOCATE ARGS(), BX  ' RT3E_44
L_544E: ' PRINT statement begins (screen) ; RT3F_BC
L_5451: BX = &HB72A
L_5454: PRINT S_B72A$  ' RT3F_6E; H newline item, ledger correction
L_5457: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_545A: BX = &H13
L_545D: ARGPUSH BX  ' RT3E_42
L_5460: BX = 2
L_5463: LOCATE ARGS(), BX  ' RT3E_44
L_5466: ' PRINT statement begins (screen) ; RT3F_BC
L_5469: DX = BX
L_546B: BX = &HB740
L_546E: PRINT S_B740$  ' RT3F_6E; H newline item, ledger correction
L_5471: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5474: BX = &H14
L_5477: ARGPUSH BX  ' RT3E_42
L_547A: BX = DX
L_547C: LOCATE ARGS(), BX  ' RT3E_44
L_547F: ' PRINT statement begins (screen) ; RT3F_BC
L_5482: BX = &HB75E
L_5485: PRINT S_B75E$  ' RT3F_6E; H newline item, ledger correction
L_5488: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_548B: BX = &H15
L_548E: ARGPUSH BX  ' RT3E_42
L_5491: BX = DX
L_5493: LOCATE ARGS(), BX  ' RT3E_44
L_5496: ' PRINT statement begins (screen) ; RT3F_BC
L_5499: BX = &HB784
L_549C: PRINT S_B784$  ' RT3F_6E; H newline item, ledger correction
L_549F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_54A2: DI = &HAE0E
L_54A5: SI = &HA5C0
L_54A8: N_AE0E! = N_A5C0!  ' RT3F_7B
L_54AB: GOSUB L_1E7C
L_54AE: DI = &HAE22
L_54B1: SI = &HAE16
L_54B4: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_54B7: IF CompareLeft! = CompareRight! THEN GOTO L_54A2  ' flags from L_54B4
L_54B9: DI = &HAE2E
L_54BC: SI = &HAE16
L_54BF: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_54C2: IF CompareLeft! <> CompareRight! THEN GOTO L_54C7  ' flags from L_54BF
L_54C4: GOTO L_234F
L_54C7: SI = &HAE16
L_54CA: BX = CINT(N_AE16!)  ' RT3F_75
L_54CD: ON BX GOTO L_557E, L_54D7, L_627F  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_54D7: BX = &HB79A
L_54DA: DX = &HAB72
L_54DD: S_AB72$ = S_B79A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_54E0: GOSUB L_1F14
L_54E3: SI = &HA9FE
L_54E6: CompareLeft! = N_A9FE!: CompareRight! = 0  ' RT3F_A7
L_54E9: IF CompareLeft! <> CompareRight! THEN GOTO L_54EE  ' flags from L_54E6
L_54EB: GOTO L_543C
L_54EE: GOSUB L_2352
L_54F1: BX = &H13
L_54F4: ARGPUSH BX  ' RT3E_42
L_54F7: BX = 2
L_54FA: LOCATE ARGS(), BX  ' RT3E_44
L_54FD: ' PRINT statement begins (screen) ; RT3F_BC
L_5500: DX = BX
L_5502: BX = &HB7BA
L_5505: PRINT S_B7BA$;  ' RT3F_6A
L_5508: SI = &HA9FE
L_550B: BX = CINT(N_A9FE!)  ' RT3F_75
L_550E: BX = BX * (2 ^ 1)
L_5510: BX = BX * (2 ^ 1)
L_5512: BX = BX + &H4288
L_5516: PRINT S(BX);  ' RT3F_6A
L_5519: BX = &HB7C6
L_551C: PRINT S_B7C6$  ' RT3F_6E; H newline item, ledger correction
L_551F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5522: BX = &H14
L_5525: ARGPUSH BX  ' RT3E_42
L_5528: BX = DX
L_552A: LOCATE ARGS(), BX  ' RT3E_44
L_552D: GOSUB L_2950
L_5530: SI = &HA838
L_5533: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_5536: IF CompareLeft! <> CompareRight! THEN GOTO L_553B  ' flags from L_5533
L_5538: GOTO L_543C
L_553B: DI = &HA6F8
L_553E: SI = &HAFCC
L_5541: N_A6F8! = N_AFCC!  ' RT3F_7B
L_5544: DI = &HA6FC
L_5547: BX = SI
L_5549: SI = &HA9FE
L_554C: N_A6FC! = N_A9FE!  ' RT3F_7B
L_554F: GOSUB L_07C9
L_5552: BX = CINT(FAC!)  ' RT3F_77
L_5555: DI = BX
L_5557: DI = DI * (2 ^ 1)
L_5559: DI = DI * (2 ^ 1)
L_555B: DI = DI + &H1850
L_555F: SI = &HAFCC
L_5562: N(DI) = N_AFCC!  ' RT3F_7B
L_5565: SI = &HA9FE
L_5568: BX = CINT(N_A9FE!)  ' RT3F_75
L_556B: BX = BX * (2 ^ 1)
L_556D: BX = BX * (2 ^ 1)
L_556F: BX = BX + &H4288
L_5573: DX = BX
L_5575: BX = &H4F8A
L_5578: S(DX) = S_4F8A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_557B: GOTO L_543C
L_557E: DI = &HAA2C
L_5581: SI = &HA66E
L_5584: N_AA2C! = N_A66E!  ' RT3F_7B
L_5587: DI = &HB7D8
L_558A: SI = &H4F6C
L_558D: N_B7D8! = N_4F6C!  ' RT3F_7B
L_5590: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_5593: GOTO L_563E
L_5596: DI = &HA6E4
L_5599: SI = &HA66E
L_559C: N_A6E4! = N_A66E!  ' RT3F_7B
L_559F: DI = &HA6E8
L_55A2: BX = SI
L_55A4: SI = &HA5C4
L_55A7: N_A6E8! = N_A5C4!  ' RT3F_7B
L_55AA: GOSUB L_0797
L_55AD: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_55B0: BX = 0
L_55B3: IF CompareLeft! <> CompareRight! THEN GOTO L_55B6  ' flags from L_55AD
L_55B5: BX = BX - 1
L_55B6: SI = &HAA2C
L_55B9: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_55BC: DX = 0
L_55BF: IF CompareLeft! <> CompareRight! THEN GOTO L_55C2  ' flags from L_55B9
L_55C1: DX = DX - 1
L_55C2: DX = DX AND BX
L_55C4: CompareLeft% = DX: CompareRight% = 0
L_55C6: IF CompareLeft% <> CompareRight% THEN GOTO L_55CB  ' flags from L_55C4
L_55C8: GOTO L_55DC
L_55CB: DI = SI
L_55CD: SI = &H4F6C
L_55D0: N(DI) = N_4F6C!  ' RT3F_7B
L_55D3: DI = &HA9FE
L_55D6: SI = &HA5C4
L_55D9: N_A9FE! = N_A5C4!  ' RT3F_7B
L_55DC: DI = &HA6E4
L_55DF: SI = &HA66E
L_55E2: N_A6E4! = N_A66E!  ' RT3F_7B
L_55E5: BX = DI
L_55E7: DI = &HA6E8
L_55EA: DX = SI
L_55EC: SI = &HA5C4
L_55EF: N_A6E8! = N_A5C4!  ' RT3F_7B
L_55F2: GOSUB L_0797
L_55F5: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_55F8: BX = 0
L_55FB: IF CompareLeft! <= CompareRight! THEN GOTO L_55FE  ' flags from L_55F5
L_55FD: BX = BX - 1
L_55FE: DI = &HA6E4
L_5601: SI = &HA868
L_5604: N_A6E4! = N_A868!  ' RT3F_7B
L_5607: DI = &HA6E8
L_560A: SI = &HA5C4
L_560D: N_A6E8! = N_A5C4!  ' RT3F_7B
L_5610: WORD(BP - 6) = BX
L_5613: GOSUB L_0797
L_5616: DI = &HA5C0
L_5619: CompareLeft! = FAC!: CompareRight! = N_A5C0!  ' RT3F_A1
L_561C: BX = 0
L_561F: IF CompareLeft! <> CompareRight! THEN GOTO L_5622  ' flags from L_5619
L_5621: BX = BX - 1
L_5622: BX = BX AND WORD(BP - 6)
L_5625: CompareLeft% = BX: CompareRight% = 0
L_5627: IF CompareLeft% <> CompareRight% THEN GOTO L_562C  ' flags from L_5625
L_5629: GOTO L_5635
L_562C: DI = &HB7D8
L_562F: SI = &HA874
L_5632: N_B7D8! = N_A874!  ' RT3F_7B
L_5635: DI = &H4F6C
L_5638: SI = &HA5C4
L_563B: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_563E: DI = &HA5C4
L_5641: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_5644: SI = DI
L_5646: DI = &HA5CC
L_5649: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_564C: IF CompareLeft! > CompareRight! THEN GOTO L_5651  ' flags from L_5649
L_564E: GOTO L_5596
L_5651: SI = &HAA2C
L_5654: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_5657: IF CompareLeft! = CompareRight! THEN GOTO L_565C  ' flags from L_5654
L_5659: GOTO L_5662
L_565C: GOSUB L_2649
L_565F: GOTO L_543C
L_5662: GOSUB L_2352
L_5665: BX = &H10
L_5668: ARGPUSH BX  ' RT3E_42
L_566B: BX = &HA
L_566E: LOCATE ARGS(), BX  ' RT3E_44
L_5671: SI = &HA66E
L_5674: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_5677: GOTO L_56F4
L_567A: DI = &HA6F8
L_567D: SI = &HA5C4
L_5680: N_A6F8! = N_A5C4!  ' RT3F_7B
L_5683: DI = &HA6FC
L_5686: BX = SI
L_5688: SI = &HA9FE
L_568B: N_A6FC! = N_A9FE!  ' RT3F_7B
L_568E: GOSUB L_07C9
L_5691: BX = CINT(FAC!)  ' RT3F_77
L_5694: DI = BX
L_5696: DI = DI * (2 ^ 1)
L_5698: DI = DI * (2 ^ 1)
L_569A: DI = DI + &H1850
L_569E: FAC! = RND  ' RT3D_34
L_56A1: BX = DI
L_56A3: DI = &HA5C0
L_56A6: FAC! = FAC! * N_A5C0!  ' RT3F_91
L_56A9: DX = BX
L_56AB: BX = &H1A
L_56AE: FAC! = INT(FAC!)  ' RT3D_03
L_56B1: T_00! = FAC!  ' RT3F_71; inline=&H80
L_56B5: FAC! = RND  ' RT3D_34
L_56B8: DI = &HA686
L_56BB: FAC! = FAC! * N_A686!  ' RT3F_91
L_56BE: BX = &H1A
L_56C1: FAC! = INT(FAC!)  ' RT3D_03
L_56C4: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_56C8: T_01! = FAC!  ' RT3F_71; inline=&H81
L_56CC: FAC! = RND  ' RT3D_34
L_56CF: DI = &HAC70
L_56D2: FAC! = FAC! * N_AC70!  ' RT3F_91
L_56D5: BX = &H1A
L_56D8: FAC! = INT(FAC!)  ' RT3D_03
L_56DB: BX = DI
L_56DD: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_56E1: DI = BX
L_56E3: FAC! = FAC! + N(DI)  ' RT3F_81
L_56E6: DI = DX
L_56E8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_56EB: DI = &H4F6C
L_56EE: SI = &HA5C4
L_56F1: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_56F4: DI = &HA5C4
L_56F7: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_56FA: SI = DI
L_56FC: DI = &HA696
L_56FF: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_5702: IF CompareLeft! > CompareRight! THEN GOTO L_5707  ' flags from L_56FF
L_5704: GOTO L_567A
L_5707: DI = &HA6F8
L_570A: SI = &HA682
L_570D: N_A6F8! = N_A682!  ' RT3F_7B
L_5710: BX = DI
L_5712: DI = &HA6FC
L_5715: DX = SI
L_5717: SI = &HA9FE
L_571A: N_A6FC! = N_A9FE!  ' RT3F_7B
L_571D: GOSUB L_07C9
L_5720: BX = CINT(FAC!)  ' RT3F_77
L_5723: DI = BX
L_5725: DI = DI * (2 ^ 1)
L_5727: DI = DI * (2 ^ 1)
L_5729: DI = DI + &H1850
L_572D: FAC! = RND  ' RT3D_34
L_5730: BX = DI
L_5732: DI = &HA85C
L_5735: FAC! = FAC! * N_A85C!  ' RT3F_91
L_5738: DX = BX
L_573A: BX = &H1A
L_573D: FAC! = INT(FAC!)  ' RT3D_03
L_5740: SWAP DX, DI
L_5742: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5745: FAC! = RND  ' RT3D_34
L_5748: DI = &HB7DC
L_574B: CompareLeft! = FAC!: CompareRight! = N_B7DC!  ' RT3F_A1
L_574E: BX = 0
L_5751: IF CompareLeft! >= CompareRight! THEN GOTO L_5754  ' flags from L_574B
L_5753: BX = BX - 1
L_5754: SI = &HB7D8
L_5757: CX = BX
L_5759: BX = CINT(N_B7D8!)  ' RT3F_75
L_575C: BX = BX AND CX
L_575E: CompareLeft% = BX: CompareRight% = 0
L_5760: IF CompareLeft% <> CompareRight% THEN GOTO L_5765  ' flags from L_575E
L_5762: GOTO L_57A5
L_5765: DI = &HA6F8
L_5768: SI = &HA682
L_576B: N_A6F8! = N_A682!  ' RT3F_7B
L_576E: DI = &HA6FC
L_5771: SI = &HA9FE
L_5774: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5777: GOSUB L_07C9
L_577A: BX = CINT(FAC!)  ' RT3F_77
L_577D: DI = BX
L_577F: DI = DI * (2 ^ 1)
L_5781: DI = DI * (2 ^ 1)
L_5783: DI = DI + &H1850
L_5787: FAC! = RND  ' RT3D_34
L_578A: BX = DI
L_578C: DI = &HA5C0
L_578F: FAC! = FAC! * N_A5C0!  ' RT3F_91
L_5792: DI = &HA85C
L_5795: FAC! = FAC! + N_A85C!  ' RT3F_81
L_5798: DX = BX
L_579A: BX = &H1A
L_579D: FAC! = INT(FAC!)  ' RT3D_03
L_57A0: DI = DX
L_57A2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_57A5: SI = &HA66E
L_57A8: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_57AB: GOTO L_5814
L_57AE: DI = &HA97C
L_57B1: SI = &HA5C4
L_57B4: FAC! = N_A5C4! + N_A97C!  ' RT3F_7F
L_57B7: BX = SI
L_57B9: DX = BX
L_57BB: BX = CINT(FAC!)  ' RT3F_77
L_57BE: ARGPUSH BX  ' RT3E_42
L_57C1: BX = 9
L_57C4: LOCATE ARGS(), BX  ' RT3E_44
L_57C7: ' PRINT statement begins (screen) ; RT3F_BC
L_57CA: SI = DX
L_57CC: BX = CINT(N(SI))  ' RT3F_75
L_57CF: BX = BX * (2 ^ 1)
L_57D1: BX = BX * (2 ^ 1)
L_57D3: BX = BX + &H4870
L_57D7: AX = &HB7E0
L_57DA: BX = TEMP_DESC(S_B7E0$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_57DD: CX = DX
L_57DF: DX = &HD
L_57E2: BX = TEMP_DESC(RIGHT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0C
L_57E5: PRINT S(BX);  ' RT3F_6A
L_57E8: BX = &HAC6A
L_57EB: PRINT S_AC6A$;  ' RT3F_6A
L_57EE: SI = CX
L_57F0: DI = &HA6E4
L_57F3: N_A6E4! = N(SI)  ' RT3F_7B
L_57F6: DI = &HA6E8
L_57F9: SI = &HA9FE
L_57FC: N_A6E8! = N_A9FE!  ' RT3F_7B
L_57FF: GOSUB L_0797
L_5802: BX = &H1A
L_5805: PRINT FAC!  ' RT3F_6B
L_5808: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_580B: DI = &H4F6C
L_580E: SI = &HA5C4
L_5811: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_5814: DI = &HA5C4
L_5817: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_581A: SI = DI
L_581C: DI = &HA696
L_581F: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_5822: IF CompareLeft! <= CompareRight! THEN GOTO L_57AE  ' flags from L_581F
L_5824: DI = &HA6F8
L_5827: SI = &HA68A
L_582A: N_A6F8! = N_A68A!  ' RT3F_7B
L_582D: BX = DI
L_582F: DI = &HA6FC
L_5832: SI = &HA9FE
L_5835: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5838: GOSUB L_07C9
L_583B: DI = &HB7EE
L_583E: N_B7EE! = FAC!: SI = &H001A  ' RT3F_7D
L_5841: DI = &HA6F8
L_5844: SI = &HA850
L_5847: N_A6F8! = N_A850!  ' RT3F_7B
L_584A: DI = &HA6FC
L_584D: SI = &HA9FE
L_5850: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5853: GOSUB L_07C9
L_5856: GOTO L_587C
L_5859: ' Alignment NOP
L_585A: SI = &HA5C4
L_585D: BX = SI
L_585F: DX = BX
L_5861: BX = CINT(N_A5C4!)  ' RT3F_75
L_5864: DI = BX
L_5866: DI = DI * (2 ^ 1)
L_5868: DI = DI * (2 ^ 1)
L_586A: DI = DI + &H1850
L_586E: SI = &HB488
L_5871: N(DI) = N_B488!  ' RT3F_7B
L_5874: SI = DX
L_5876: DI = &H4F6C
L_5879: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_587C: DI = &HA5C4
L_587F: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_5882: SI = DI
L_5884: DI = &HB7EE
L_5887: CompareLeft! = N_A5C4!: CompareRight! = N_B7EE!  ' RT3F_9F
L_588A: IF CompareLeft! <= CompareRight! THEN GOTO L_585A  ' flags from L_5887
L_588C: BX = &H18
L_588F: ARGPUSH BX  ' RT3E_42
L_5892: BX = 2
L_5895: LOCATE ARGS(), BX  ' RT3E_44
L_5898: ' PRINT statement begins (screen) ; RT3F_BC
L_589B: BX = &HB7F2
L_589E: PRINT S_B7F2$;  ' RT3F_6A
L_58A1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_58A4: GOSUB L_28BA
L_58A7: SI = &HA838
L_58AA: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_58AD: IF CompareLeft! = CompareRight! THEN GOTO L_58B2  ' flags from L_58AA
L_58AF: GOTO L_58DF
L_58B2: DI = &HA6F8
L_58B5: SI = &HB488
L_58B8: N_A6F8! = N_B488!  ' RT3F_7B
L_58BB: DI = &HA6FC
L_58BE: BX = SI
L_58C0: SI = &HA9FE
L_58C3: N_A6FC! = N_A9FE!  ' RT3F_7B
L_58C6: GOSUB L_07C9
L_58C9: BX = CINT(FAC!)  ' RT3F_77
L_58CC: DI = BX
L_58CE: DI = DI * (2 ^ 1)
L_58D0: DI = DI * (2 ^ 1)
L_58D2: DI = DI + &H1850
L_58D6: SI = &HB488
L_58D9: N(DI) = N_B488!  ' RT3F_7B
L_58DC: GOTO L_543C
L_58DF: DI = &HA6F8
L_58E2: SI = &HAA0A
L_58E5: N_A6F8! = N_AA0A!  ' RT3F_7B
L_58E8: BX = DI
L_58EA: DI = &HA6FC
L_58ED: SI = &HA9FE
L_58F0: N_A6FC! = N_A9FE!  ' RT3F_7B
L_58F3: GOSUB L_07C9
L_58F6: BX = CINT(FAC!)  ' RT3F_77
L_58F9: DI = BX
L_58FB: DI = DI * (2 ^ 1)
L_58FD: DI = DI * (2 ^ 1)
L_58FF: DI = DI + &H1850

```

### Basic training and character progression

```basic
L_5903: SI = &HB814
L_5906: N(DI) = N_B814!  ' RT3F_7B
L_5909: DI = &HA6F8
L_590C: SI = &HA86C
L_590F: N_A6F8! = N_A86C!  ' RT3F_7B
L_5912: BX = DI
L_5914: DI = &HA6FC
L_5917: SI = &HA9FE
L_591A: N_A6FC! = N_A9FE!  ' RT3F_7B
L_591D: GOSUB L_07C9
L_5920: BX = CINT(FAC!)  ' RT3F_77
L_5923: DI = BX
L_5925: DI = DI * (2 ^ 1)
L_5927: DI = DI * (2 ^ 1)
L_5929: DI = DI + &H1850
L_592D: SI = &H4F6C
L_5930: N(DI) = N_4F6C!  ' RT3F_7B
L_5933: DI = &HA6F8
L_5936: BX = SI
L_5938: SI = &HA864
L_593B: N_A6F8! = N_A864!  ' RT3F_7B
L_593E: DI = &HA6FC
L_5941: SI = &HA9FE
L_5944: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5947: GOSUB L_07C9
L_594A: BX = CINT(FAC!)  ' RT3F_77
L_594D: DI = BX
L_594F: DI = DI * (2 ^ 1)
L_5951: DI = DI * (2 ^ 1)
L_5953: DI = DI + &H1850
L_5957: SI = &H4F6C
L_595A: N(DI) = N_4F6C!  ' RT3F_7B
L_595D: GOSUB L_2352
L_5960: SI = &HA66E
L_5963: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_5966: GOTO L_59B8
L_5969: ' Alignment NOP
L_596A: DI = &HA97C
L_596D: SI = &HA5C4
L_5970: FAC! = N_A5C4! + N_A97C!  ' RT3F_7F
L_5973: BX = SI
L_5975: DX = BX
L_5977: BX = CINT(FAC!)  ' RT3F_77
L_597A: ARGPUSH BX  ' RT3E_42
L_597D: BX = 2
L_5980: LOCATE ARGS(), BX  ' RT3E_44
L_5983: ' PRINT statement begins (screen) ; RT3F_BC
L_5986: SI = DX
L_5988: DI = &HB818
L_598B: FAC! = N(SI) + N_B818!  ' RT3F_7F
L_598E: BX = CINT(FAC!)  ' RT3F_77
L_5991: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_5994: PRINT S(BX);  ' RT3F_6A
L_5997: BX = &HA63C
L_599A: PRINT S_A63C$;  ' RT3F_6A
L_599D: SI = DX
L_599F: BX = CINT(N(SI))  ' RT3F_75
L_59A2: BX = BX * (2 ^ 1)
L_59A4: BX = BX * (2 ^ 1)
L_59A6: BX = BX + &HA5F2
L_59AA: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_59AD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_59B0: SI = DX
L_59B2: DI = &H4F6C
L_59B5: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_59B8: DI = &HA5C4
L_59BB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_59BE: SI = DI
L_59C0: DI = &H4F94
L_59C3: CompareLeft! = N_A5C4!: CompareRight! = N_4F94!  ' RT3F_9F
L_59C6: IF CompareLeft! <= CompareRight! THEN GOTO L_596A  ' flags from L_59C3
L_59C8: DI = &HAE0E
L_59CB: SI = &HA5C0
L_59CE: N_AE0E! = N_A5C0!  ' RT3F_7B
L_59D1: BX = DI
L_59D3: DI = &HA6E4
L_59D6: SI = &HA682
L_59D9: N_A6E4! = N_A682!  ' RT3F_7B
L_59DC: DI = &HA6E8
L_59DF: SI = &HA9FE
L_59E2: N_A6E8! = N_A9FE!  ' RT3F_7B
L_59E5: GOSUB L_0797
L_59E8: DI = &HA85C
L_59EB: CompareLeft! = FAC!: CompareRight! = N_A85C!  ' RT3F_A1
L_59EE: IF CompareLeft! > CompareRight! THEN GOTO L_59F3  ' flags from L_59EB
L_59F0: GOTO L_5A14
L_59F3: BX = &H13
L_59F6: ARGPUSH BX  ' RT3E_42
L_59F9: BX = 2
L_59FC: LOCATE ARGS(), BX  ' RT3E_44
L_59FF: ' PRINT statement begins (screen) ; RT3F_BC
L_5A02: BX = &HB81C
L_5A05: PRINT S_B81C$  ' RT3F_6E; H newline item, ledger correction
L_5A08: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5A0B: DI = &HAE0E
L_5A0E: SI = &HA676
L_5A11: N_AE0E! = N_A676!  ' RT3F_7B
L_5A14: GOSUB L_1E7C
L_5A17: SI = &HAE16
L_5A1A: CompareLeft! = N_AE16!: CompareRight! = 0  ' RT3F_A7
L_5A1D: IF CompareLeft! >= CompareRight! THEN GOTO L_5A22  ' flags from L_5A1A
L_5A1F: GOTO L_595D
L_5A22: GOSUB L_2352
L_5A25: BX = &H14
L_5A28: ARGPUSH BX  ' RT3E_42
L_5A2B: BX = &H10
L_5A2E: LOCATE ARGS(), BX  ' RT3E_44
L_5A31: ' PRINT statement begins (screen) ; RT3F_BC
L_5A34: DI = &HA844
L_5A37: SI = &HAE16
L_5A3A: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_5A3D: BX = CINT(FAC!)  ' RT3F_77
L_5A40: BX = BX * (2 ^ 1)
L_5A42: BX = BX * (2 ^ 1)
L_5A44: BX = BX + &HA5F2
L_5A48: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_5A4B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5A4E: GOSUB L_20B6
L_5A51: DI = &HA6F8
L_5A54: SI = &HA868
L_5A57: N_A6F8! = N_A868!  ' RT3F_7B
L_5A5A: DI = &HA6FC
L_5A5D: SI = &HA9FE
L_5A60: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5A63: GOSUB L_07C9
L_5A66: BX = CINT(FAC!)  ' RT3F_77
L_5A69: DI = BX
L_5A6B: DI = DI * (2 ^ 1)
L_5A6D: DI = DI * (2 ^ 1)
L_5A6F: DI = DI + &H1850
L_5A73: BX = DI
L_5A75: DI = &HA844
L_5A78: SI = &HAE16
L_5A7B: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_5A7E: DI = BX
L_5A80: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5A83: DI = &HB828
L_5A86: N_B828! = FAC!: SI = &H001A  ' RT3F_7D
L_5A89: DI = &HB82C
L_5A8C: SI = &HA66E
L_5A8F: N_B82C! = N_A66E!  ' RT3F_7B
L_5A92: SI = &H4F6C
L_5A95: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_5A98: GOTO L_61DC
L_5A9B: ' Alignment NOP
L_5A9C: GOSUB L_2352
L_5A9F: BX = &H10
L_5AA2: ARGPUSH BX  ' RT3E_42
L_5AA5: BX = &HA
L_5AA8: LOCATE ARGS(), BX  ' RT3E_44
L_5AAB: ' PRINT statement begins (screen) ; RT3F_BC
L_5AAE: BX = &HB830
L_5AB1: PRINT S_B830$;  ' RT3F_6A
L_5AB4: BX = &HB848
L_5AB7: PRINT N_B848!  ' RT3F_6B
L_5ABA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5ABD: SI = &H4F6C
L_5AC0: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_5AC3: GOTO L_5BFB
L_5AC6: DI = &HA696
L_5AC9: SI = &HA5C4
L_5ACC: FAC! = N_A5C4! / N_A696!  ' RT3F_87
L_5ACF: BX = &H1A
L_5AD2: FAC! = INT(FAC!)  ' RT3D_03
L_5AD5: DI = &HA858
L_5AD8: BX = SI
L_5ADA: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_5ADD: SI = DI
L_5ADF: DI = &HA682
L_5AE2: FAC! = N_A858! * N_A682!  ' RT3F_8F
L_5AE5: DX = SI
L_5AE7: SI = &HB05C
L_5AEA: FAC! = N_B05C! - FAC!  ' RT3F_9B
L_5AED: DI = BX
L_5AEF: FAC! = FAC! + N(DI)  ' RT3F_81
L_5AF2: BX = CINT(FAC!)  ' RT3F_77
L_5AF5: ARGPUSH BX  ' RT3E_42
L_5AF8: SI = DX
L_5AFA: BX = DI
L_5AFC: DI = &HB054
L_5AFF: FAC! = N(SI) * N_B054!  ' RT3F_8F
L_5B02: DI = &H4F94
L_5B05: FAC! = FAC! + N_4F94!  ' RT3F_81
L_5B08: DX = BX
L_5B0A: BX = CINT(FAC!)  ' RT3F_77
L_5B0D: LOCATE ARGS(), BX  ' RT3E_44
L_5B10: SI = &HB828
L_5B13: BX = CINT(N_B828!)  ' RT3F_75
L_5B16: SI = BX
L_5B18: SWAP DX, SI
L_5B1A: BX = CINT(N(SI))  ' RT3F_75
L_5B1D: BX = BX * (2 ^ 1)
L_5B1F: BX = BX * (2 ^ 1)
L_5B21: BX = BX + DX
L_5B23: SI = BX
L_5B25: SI = SI * (2 ^ 1)
L_5B27: SI = SI * (2 ^ 1)
L_5B29: SI = SI + &H522E
L_5B2D: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5B30: BX = 0
L_5B33: IF CompareLeft! <> CompareRight! THEN GOTO L_5B36  ' flags from L_5B2D
L_5B35: BX = BX - 1
L_5B36: DX = DI
L_5B38: DI = &HA66A
L_5B3B: CompareLeft! = N(SI): CompareRight! = N_A66A!  ' RT3F_9F
L_5B3E: CX = 0
L_5B41: IF CompareLeft! <> CompareRight! THEN GOTO L_5B44  ' flags from L_5B3B
L_5B43: CX = CX - 1
L_5B44: AX = DI
L_5B46: DI = &H4F6C
L_5B49: WORD(BP - 6) = SI
L_5B4C: SI = &HB82C
L_5B4F: CompareLeft! = N_B82C!: CompareRight! = N_4F6C!  ' RT3F_9F
L_5B52: WORD(BP - 8) = BX
L_5B55: BX = 0
L_5B58: IF CompareLeft! <= CompareRight! THEN GOTO L_5B5B  ' flags from L_5B4F
L_5B5A: BX = BX - 1
L_5B5B: BX = BX AND CX
L_5B5D: BX = BX OR WORD(BP - 8)
L_5B60: DI = AX
L_5B62: SI = WORD(BP - 6)
L_5B65: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_5B68: CX = 0
L_5B6B: IF CompareLeft! >= CompareRight! THEN GOTO L_5B6E  ' flags from L_5B65
L_5B6D: CX = CX - 1
L_5B6E: DI = &HA97C
L_5B71: FAC! = N(SI) + N_A97C!  ' RT3F_7F
L_5B74: DI = &HA6E4
L_5B77: N_A6E4! = FAC!: SI = &H001A  ' RT3F_7D
L_5B7A: DI = &HA6E8
L_5B7D: SI = &HA9FE
L_5B80: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5B83: WORD(BP - &HA) = BX
L_5B86: WORD(BP - &HC) = CX
L_5B89: GOSUB L_0797
L_5B8C: DI = &H4F94
L_5B8F: CompareLeft! = FAC!: CompareRight! = N_4F94!  ' RT3F_A1
L_5B92: BX = 0
L_5B95: IF CompareLeft! <= CompareRight! THEN GOTO L_5B98  ' flags from L_5B8F
L_5B97: BX = BX - 1
L_5B98: BX = BX AND WORD(BP - &HC)
L_5B9B: BX = BX OR WORD(BP - &HA)
L_5B9E: CompareLeft% = BX: CompareRight% = 0
L_5BA0: IF CompareLeft% = CompareRight% THEN GOTO L_5BA5  ' flags from L_5B9E
L_5BA2: GOTO L_5BF2
L_5BA5: ' PRINT statement begins (screen) ; RT3F_BC
L_5BA8: DI = &HB0B6
L_5BAB: SI = &HA5C4
L_5BAE: FAC! = N_A5C4! + N_B0B6!  ' RT3F_7F
L_5BB1: BX = SI
L_5BB3: DX = BX
L_5BB5: BX = CINT(FAC!)  ' RT3F_77
L_5BB8: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_5BBB: PRINT S(BX);  ' RT3F_6A
L_5BBE: BX = &HA63C
L_5BC1: PRINT S_A63C$;  ' RT3F_6A
L_5BC4: SI = &HB828
L_5BC7: BX = CINT(N_B828!)  ' RT3F_75
L_5BCA: SI = BX
L_5BCC: SWAP DX, SI
L_5BCE: BX = CINT(N(SI))  ' RT3F_75
L_5BD1: BX = BX * (2 ^ 1)
L_5BD3: BX = BX * (2 ^ 1)
L_5BD5: BX = BX + DX
L_5BD7: SI = BX
L_5BD9: SI = SI * (2 ^ 1)
L_5BDB: SI = SI * (2 ^ 1)
L_5BDD: SI = SI + &H522E
L_5BE1: BX = CINT(N(SI))  ' RT3F_75
L_5BE4: BX = BX * (2 ^ 1)
L_5BE6: BX = BX * (2 ^ 1)
L_5BE8: BX = BX + &H42E4
L_5BEC: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_5BEF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5BF2: DI = &H4F6C
L_5BF5: SI = &HA5C4
L_5BF8: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_5BFB: DI = &HA5C4
L_5BFE: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_5C01: SI = DI
L_5C03: DI = &HA686
L_5C06: CompareLeft! = N_A5C4!: CompareRight! = N_A686!  ' RT3F_9F
L_5C09: IF CompareLeft! > CompareRight! THEN GOTO L_5C0E  ' flags from L_5C06
L_5C0B: GOTO L_5AC6
L_5C0E: DI = &HAE0E
L_5C11: SI = &HA686
L_5C14: N_AE0E! = N_A686!  ' RT3F_7B
L_5C17: GOSUB L_1E7C
L_5C1A: SI = &HAE16
L_5C1D: CompareLeft! = N_AE16!: CompareRight! = 0  ' RT3F_A7
L_5C20: IF CompareLeft! < CompareRight! THEN GOTO L_5C17  ' flags from L_5C1D
L_5C22: SI = &HB828
L_5C25: BX = CINT(N_B828!)  ' RT3F_75
L_5C28: SI = BX
L_5C2A: SI = &HAE16
L_5C2D: DX = BX
L_5C2F: BX = CINT(N_AE16!)  ' RT3F_75
L_5C32: BX = BX * (2 ^ 1)
L_5C34: BX = BX * (2 ^ 1)
L_5C36: BX = BX + DX
L_5C38: SI = BX
L_5C3A: SI = SI * (2 ^ 1)
L_5C3C: SI = SI * (2 ^ 1)
L_5C3E: SI = SI + &H522E
L_5C42: DI = &HB84C
L_5C45: N_B84C! = N(SI)  ' RT3F_7B
L_5C48: SI = DI
L_5C4A: CompareLeft! = N_B84C!: CompareRight! = 0  ' RT3F_A7
L_5C4D: BX = 0
L_5C50: IF CompareLeft! <> CompareRight! THEN GOTO L_5C53  ' flags from L_5C4A
L_5C52: BX = BX - 1
L_5C53: DI = &HA66A
L_5C56: CompareLeft! = N(SI): CompareRight! = N_A66A!  ' RT3F_9F
L_5C59: DX = 0
L_5C5C: IF CompareLeft! <> CompareRight! THEN GOTO L_5C5F  ' flags from L_5C56
L_5C5E: DX = DX - 1
L_5C5F: CX = DI
L_5C61: DI = &H4F6C
L_5C64: AX = SI
L_5C66: SI = &HB82C
L_5C69: CompareLeft! = N_B82C!: CompareRight! = N_4F6C!  ' RT3F_9F
L_5C6C: WORD(BP - 6) = BX
L_5C6F: BX = 0
L_5C72: IF CompareLeft! <= CompareRight! THEN GOTO L_5C75  ' flags from L_5C69
L_5C74: BX = BX - 1
L_5C75: BX = BX AND DX
L_5C77: BX = BX OR WORD(BP - 6)
L_5C7A: DI = CX
L_5C7C: SI = AX
L_5C7E: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_5C81: DX = 0
L_5C84: IF CompareLeft! >= CompareRight! THEN GOTO L_5C87  ' flags from L_5C7E
L_5C86: DX = DX - 1
L_5C87: DI = &HA97C
L_5C8A: FAC! = N(SI) + N_A97C!  ' RT3F_7F
L_5C8D: DI = &HA6E4
L_5C90: N_A6E4! = FAC!: SI = &H001A  ' RT3F_7D
L_5C93: DI = &HA6E8
L_5C96: SI = &HA9FE
L_5C99: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5C9C: WORD(BP - 8) = BX
L_5C9F: WORD(BP - &HA) = DX
L_5CA2: GOSUB L_0797
L_5CA5: DI = &H4F94
L_5CA8: CompareLeft! = FAC!: CompareRight! = N_4F94!  ' RT3F_A1
L_5CAB: BX = 0
L_5CAE: IF CompareLeft! <= CompareRight! THEN GOTO L_5CB1  ' flags from L_5CA8
L_5CB0: BX = BX - 1
L_5CB1: BX = BX AND WORD(BP - &HA)
L_5CB4: BX = BX OR WORD(BP - 8)
L_5CB7: CompareLeft% = BX: CompareRight% = 0
L_5CB9: IF CompareLeft% = CompareRight% THEN GOTO L_5CBE  ' flags from L_5CB7
L_5CBB: GOTO L_5C17
L_5CBE: GOSUB L_2352
L_5CC1: FAC! = RND  ' RT3D_34
L_5CC4: DI = &HB868
L_5CC7: CompareLeft! = FAC!: CompareRight! = N_B868!  ' RT3F_A1
L_5CCA: IF CompareLeft! > CompareRight! THEN GOTO L_5CCF  ' flags from L_5CC7
L_5CCC: GOTO L_5D1E
L_5CCF: BX = &H11
L_5CD2: ARGPUSH BX  ' RT3E_42
L_5CD5: BX = 2
L_5CD8: LOCATE ARGS(), BX  ' RT3E_44
L_5CDB: ' PRINT statement begins (screen) ; RT3F_BC
L_5CDE: BX = &HB850
L_5CE1: PRINT S_B850$  ' RT3F_6E; H newline item, ledger correction
L_5CE4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5CE7: FAC! = RND  ' RT3D_34
L_5CEA: DI = &HA70C
L_5CED: CompareLeft! = FAC!: CompareRight! = N_A70C!  ' RT3F_A1
L_5CF0: IF CompareLeft! < CompareRight! THEN GOTO L_5CF5  ' flags from L_5CED
L_5CF2: GOTO L_5D01
L_5CF5: DI = &HB84C
L_5CF8: SI = &HA66E
L_5CFB: N_B84C! = N_A66E!  ' RT3F_7B
L_5CFE: GOTO L_5D1E
L_5D01: FAC! = RND  ' RT3D_34
L_5D04: FAC! = FAC! * 2 ^ (1)  ' RT3F_AD; inline=&H01
L_5D08: DI = &H4F6C
L_5D0B: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_5D0E: BX = &H1A
L_5D11: FAC! = INT(FAC!)  ' RT3D_03
L_5D14: FAC! = FAC! * 2 ^ (2)  ' RT3F_AD; inline=&H02
L_5D18: DI = &HB84C
L_5D1B: N_B84C! = FAC!: SI = &H001A  ' RT3F_7D
L_5D1E: BX = &H13
L_5D21: ARGPUSH BX  ' RT3E_42
L_5D24: BX = 2
L_5D27: LOCATE ARGS(), BX  ' RT3E_44
L_5D2A: ' PRINT statement begins (screen) ; RT3F_BC
L_5D2D: BX = &HB86C
L_5D30: PRINT S_B86C$;  ' RT3F_6A
L_5D33: SI = &HB84C
L_5D36: BX = CINT(N_B84C!)  ' RT3F_75
L_5D39: BX = BX * (2 ^ 1)
L_5D3B: BX = BX * (2 ^ 1)
L_5D3D: BX = BX + &H42E4
L_5D41: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_5D44: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5D47: GOSUB L_20B6
L_5D4A: SI = &HB84C
L_5D4D: CompareLeft! = N_B84C!: CompareRight! = 0  ' RT3F_A7
L_5D50: IF CompareLeft! <> CompareRight! THEN GOTO L_5D55  ' flags from L_5D4D
L_5D52: GOTO L_61CD
L_5D55: DI = &HA672
L_5D58: SI = &HB84C
L_5D5B: CompareLeft! = N_B84C!: CompareRight! = N_A672!  ' RT3F_9F
L_5D5E: IF CompareLeft! = CompareRight! THEN GOTO L_5D63  ' flags from L_5D5B
L_5D60: GOTO L_5EAF
L_5D63: DI = &HA6F8
L_5D66: SI = &HA676
L_5D69: N_A6F8! = N_A676!  ' RT3F_7B
L_5D6C: BX = DI
L_5D6E: DI = &HA6FC
L_5D71: DX = SI
L_5D73: SI = &HA9FE
L_5D76: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5D79: GOSUB L_07C9
L_5D7C: BX = CINT(FAC!)  ' RT3F_77
L_5D7F: DI = BX
L_5D81: DI = DI * (2 ^ 1)
L_5D83: DI = DI * (2 ^ 1)
L_5D85: DI = DI + &H1850
L_5D89: BX = DI
L_5D8B: DI = &HA6E4
L_5D8E: SI = &HA676
L_5D91: N_A6E4! = N_A676!  ' RT3F_7B
L_5D94: DX = DI
L_5D96: DI = &HA6E8
L_5D99: CX = SI
L_5D9B: SI = &HA9FE
L_5D9E: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5DA1: WORD(BP - 6) = BX
L_5DA4: GOSUB L_0797
L_5DA7: T_00! = FAC!  ' RT3F_71; inline=&H80
L_5DAB: FAC! = RND  ' RT3D_34
L_5DAE: DI = &HA682
L_5DB1: FAC! = FAC! * N_A682!  ' RT3F_91
L_5DB4: BX = &H1A
L_5DB7: FAC! = INT(FAC!)  ' RT3D_03
L_5DBA: BX = DI
L_5DBC: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_5DC0: DI = &HA5C0
L_5DC3: FAC! = FAC! + N_A5C0!  ' RT3F_81
L_5DC6: DX = DI
L_5DC8: DI = WORD(BP - 6)
L_5DCB: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5DCE: DI = &HA6F8
L_5DD1: SI = &HA984
L_5DD4: N_A6F8! = N_A984!  ' RT3F_7B
L_5DD7: DI = &HA6FC
L_5DDA: CX = SI
L_5DDC: SI = &HA9FE
L_5DDF: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5DE2: GOSUB L_07C9
L_5DE5: BX = CINT(FAC!)  ' RT3F_77
L_5DE8: DI = BX
L_5DEA: DI = DI * (2 ^ 1)
L_5DEC: DI = DI * (2 ^ 1)
L_5DEE: DI = DI + &H1850
L_5DF2: BX = DI
L_5DF4: DI = &HA6E4
L_5DF7: SI = &HA984
L_5DFA: N_A6E4! = N_A984!  ' RT3F_7B
L_5DFD: DX = DI
L_5DFF: DI = &HA6E8
L_5E02: CX = SI
L_5E04: SI = &HA9FE
L_5E07: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5E0A: WORD(BP - 8) = BX
L_5E0D: GOSUB L_0797
L_5E10: T_01! = FAC!  ' RT3F_71; inline=&H81
L_5E14: FAC! = RND  ' RT3D_34
L_5E17: DI = &HA682
L_5E1A: FAC! = FAC! * N_A682!  ' RT3F_91
L_5E1D: BX = &H1A
L_5E20: FAC! = INT(FAC!)  ' RT3D_03
L_5E23: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_5E27: DI = &HA5C0
L_5E2A: FAC! = FAC! + N_A5C0!  ' RT3F_81
L_5E2D: DI = WORD(BP - 8)
L_5E30: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5E33: BX = &H15
L_5E36: ARGPUSH BX  ' RT3E_42
L_5E39: BX = 2
L_5E3C: LOCATE ARGS(), BX  ' RT3E_44
L_5E3F: ' PRINT statement begins (screen) ; RT3F_BC
L_5E42: DX = BX
L_5E44: BX = &H4870
L_5E47: PRINT S_4870$;  ' RT3F_6A
L_5E4A: BX = &HB882
L_5E4D: PRINT S_B882$;  ' RT3F_6A
L_5E50: DI = &HA6E4
L_5E53: SI = &HA984
L_5E56: N_A6E4! = N_A984!  ' RT3F_7B
L_5E59: CX = DI
L_5E5B: DI = &HA6E8
L_5E5E: SI = &HA9FE
L_5E61: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5E64: GOSUB L_0797
L_5E67: BX = &H1A
L_5E6A: PRINT FAC!  ' RT3F_6B
L_5E6D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5E70: BX = &H16
L_5E73: ARGPUSH BX  ' RT3E_42
L_5E76: BX = 2
L_5E79: LOCATE ARGS(), BX  ' RT3E_44
L_5E7C: ' PRINT statement begins (screen) ; RT3F_BC
L_5E7F: BX = &H4880
L_5E82: PRINT S_4880$;  ' RT3F_6A
L_5E85: BX = &HB882
L_5E88: PRINT S_B882$;  ' RT3F_6A
L_5E8B: DI = &HA6E4
L_5E8E: SI = &HA676
L_5E91: N_A6E4! = N_A676!  ' RT3F_7B
L_5E94: DI = &HA6E8
L_5E97: SI = &HA9FE
L_5E9A: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5E9D: GOSUB L_0797
L_5EA0: BX = &H1A
L_5EA3: PRINT FAC!  ' RT3F_6B
L_5EA6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5EA9: GOSUB L_20B6
L_5EAC: GOSUB L_20B6
L_5EAF: DI = &HAE44
L_5EB2: SI = &HB84C
L_5EB5: CompareLeft! = N_B84C!: CompareRight! = N_AE44!  ' RT3F_9F
L_5EB8: IF CompareLeft! = CompareRight! THEN GOTO L_5EBD  ' flags from L_5EB5
L_5EBA: GOTO L_600A
L_5EBD: DI = &HA6F8
L_5EC0: SI = &H4F6C
L_5EC3: N_A6F8! = N_4F6C!  ' RT3F_7B
L_5EC6: BX = DI
L_5EC8: DI = &HA6FC
L_5ECB: DX = SI
L_5ECD: SI = &HA9FE
L_5ED0: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5ED3: GOSUB L_07C9
L_5ED6: BX = CINT(FAC!)  ' RT3F_77
L_5ED9: DI = BX
L_5EDB: DI = DI * (2 ^ 1)
L_5EDD: DI = DI * (2 ^ 1)
L_5EDF: DI = DI + &H1850
L_5EE3: BX = DI
L_5EE5: DI = &HA6E4
L_5EE8: SI = &H4F6C
L_5EEB: N_A6E4! = N_4F6C!  ' RT3F_7B
L_5EEE: DX = DI
L_5EF0: DI = &HA6E8
L_5EF3: CX = SI
L_5EF5: SI = &HA9FE
L_5EF8: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5EFB: WORD(BP - 6) = BX
L_5EFE: GOSUB L_0797
L_5F01: T_00! = FAC!  ' RT3F_71; inline=&H80
L_5F05: FAC! = RND  ' RT3D_34
L_5F08: DI = &HA682
L_5F0B: FAC! = FAC! * N_A682!  ' RT3F_91
L_5F0E: BX = &H1A
L_5F11: FAC! = INT(FAC!)  ' RT3D_03
L_5F14: BX = DI
L_5F16: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_5F1A: DI = &H4F94
L_5F1D: FAC! = FAC! + N_4F94!  ' RT3F_81
L_5F20: DX = DI
L_5F22: DI = WORD(BP - 6)
L_5F25: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5F28: SI = DX
L_5F2A: DI = &HA6F8
L_5F2D: N_A6F8! = N(SI)  ' RT3F_7B
L_5F30: DI = &HA6FC
L_5F33: SI = &HA9FE
L_5F36: N_A6FC! = N_A9FE!  ' RT3F_7B
L_5F39: GOSUB L_07C9
L_5F3C: BX = CINT(FAC!)  ' RT3F_77
L_5F3F: DI = BX
L_5F41: DI = DI * (2 ^ 1)
L_5F43: DI = DI * (2 ^ 1)
L_5F45: DI = DI + &H1850
L_5F49: BX = DI
L_5F4B: DI = &HA6E4
L_5F4E: SI = &H4F94
L_5F51: N_A6E4! = N_4F94!  ' RT3F_7B
L_5F54: DX = DI
L_5F56: DI = &HA6E8
L_5F59: CX = SI
L_5F5B: SI = &HA9FE
L_5F5E: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5F61: WORD(BP - 8) = BX
L_5F64: GOSUB L_0797
L_5F67: T_01! = FAC!  ' RT3F_71; inline=&H81
L_5F6B: FAC! = RND  ' RT3D_34
L_5F6E: DI = &HA682
L_5F71: FAC! = FAC! * N_A682!  ' RT3F_91
L_5F74: BX = &H1A
L_5F77: FAC! = INT(FAC!)  ' RT3D_03
L_5F7A: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_5F7E: DI = &H4F94
L_5F81: FAC! = FAC! + N_4F94!  ' RT3F_81
L_5F84: BX = DI
L_5F86: DI = WORD(BP - 8)
L_5F89: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5F8C: DX = BX
L_5F8E: BX = &H15
L_5F91: ARGPUSH BX  ' RT3E_42
L_5F94: BX = 2
L_5F97: LOCATE ARGS(), BX  ' RT3E_44
L_5F9A: ' PRINT statement begins (screen) ; RT3F_BC
L_5F9D: CX = BX
L_5F9F: BX = &H4874
L_5FA2: PRINT S_4874$;  ' RT3F_6A
L_5FA5: BX = &HB882
L_5FA8: PRINT S_B882$;  ' RT3F_6A
L_5FAB: DI = &HA6E4
L_5FAE: SI = &H4F6C
L_5FB1: N_A6E4! = N_4F6C!  ' RT3F_7B
L_5FB4: AX = DI
L_5FB6: DI = &HA6E8
L_5FB9: SI = &HA9FE
L_5FBC: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5FBF: GOSUB L_0797
L_5FC2: BX = &H1A
L_5FC5: PRINT FAC!  ' RT3F_6B
L_5FC8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_5FCB: BX = &H16
L_5FCE: ARGPUSH BX  ' RT3E_42
L_5FD1: BX = 2
L_5FD4: LOCATE ARGS(), BX  ' RT3E_44
L_5FD7: ' PRINT statement begins (screen) ; RT3F_BC
L_5FDA: BX = &H4878
L_5FDD: PRINT S_4878$;  ' RT3F_6A
L_5FE0: BX = &HB882
L_5FE3: PRINT S_B882$;  ' RT3F_6A
L_5FE6: DI = &HA6E4
L_5FE9: SI = &H4F94
L_5FEC: N_A6E4! = N_4F94!  ' RT3F_7B
L_5FEF: DI = &HA6E8
L_5FF2: SI = &HA9FE
L_5FF5: N_A6E8! = N_A9FE!  ' RT3F_7B
L_5FF8: GOSUB L_0797
L_5FFB: BX = &H1A
L_5FFE: PRINT FAC!  ' RT3F_6B
L_6001: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6004: GOSUB L_20B6
L_6007: GOSUB L_20B6
L_600A: DI = &HA840
L_600D: SI = &HB84C
L_6010: CompareLeft! = N_B84C!: CompareRight! = N_A840!  ' RT3F_9F
L_6013: IF CompareLeft! <= CompareRight! THEN GOTO L_6018  ' flags from L_6010
L_6015: GOTO L_6102
L_6018: DI = &HA97C
L_601B: SI = &HB84C
L_601E: FAC! = N_B84C! + N_A97C!  ' RT3F_7F
L_6021: DI = &HA6E4
L_6024: N_A6E4! = FAC!: SI = &H001A  ' RT3F_7D
L_6027: BX = DI
L_6029: DI = &HA6E8
L_602C: SI = &HA9FE
L_602F: N_A6E8! = N_A9FE!  ' RT3F_7B
L_6032: GOSUB L_0797
L_6035: DI = &HB88A
L_6038: N_B88A! = FAC!: SI = &H001A  ' RT3F_7D
L_603B: FAC! = RND  ' RT3D_34
L_603E: BX = DI
L_6040: DI = &HA988
L_6043: FAC! = FAC! * N_A988!  ' RT3F_91
L_6046: DI = &HA6E4
L_6049: SI = &HA696
L_604C: N_A6E4! = N_A696!  ' RT3F_7B
L_604F: DI = &HA6E8
L_6052: SI = &HA9FE
L_6055: N_A6E8! = N_A9FE!  ' RT3F_7B
L_6058: T_00! = FAC!  ' RT3F_71; inline=&H80
L_605C: GOSUB L_0797
L_605F: CompareLeft! = T_00!: CompareRight! = FAC!  ' RT3F_A5; inline=&H80
L_6063: BX = 0
L_6066: IF CompareLeft! >= CompareRight! THEN GOTO L_6069  ' flags from L_605F
L_6068: BX = BX - 1
L_6069: CompareLeft% = BX: CompareRight% = 0
L_606B: IF CompareLeft% >= CompareRight% THEN GOTO L_606F  ' flags from L_6069
L_606D: BX = -BX
L_606F: FAC! = CSNG(BX)  ' RT3F_57
L_6072: DI = &HB88A
L_6075: FAC! = FAC! + N_B88A!  ' RT3F_81
L_6078: BX = DI
L_607A: DI = &H4F6C
L_607D: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_6080: DI = BX
L_6082: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6085: SI = BX
L_6087: DI = &HA5C0
L_608A: CompareLeft! = N(SI): CompareRight! = N_A5C0!  ' RT3F_9F
L_608D: IF CompareLeft! > CompareRight! THEN GOTO L_6092  ' flags from L_608A
L_608F: GOTO L_6097
L_6092: SWAP SI, DI
L_6094: N(DI) = N(SI)  ' RT3F_7B
L_6097: DI = &HA97C
L_609A: SI = &HB84C
L_609D: FAC! = N_B84C! + N_A97C!  ' RT3F_7F
L_60A0: DI = &HA6F8
L_60A3: BX = SI
L_60A5: N_A6F8! = FAC!: SI = &H001A  ' RT3F_7D
L_60A8: DI = &HA6FC
L_60AB: SI = &HA9FE
L_60AE: N_A6FC! = N_A9FE!  ' RT3F_7B
L_60B1: GOSUB L_07C9
L_60B4: BX = CINT(FAC!)  ' RT3F_77
L_60B7: DI = BX
L_60B9: DI = DI * (2 ^ 1)
L_60BB: DI = DI * (2 ^ 1)
L_60BD: DI = DI + &H1850
L_60C1: SI = &HB88A
L_60C4: N(DI) = N_B88A!  ' RT3F_7B
L_60C7: BX = &H15
L_60CA: ARGPUSH BX  ' RT3E_42
L_60CD: BX = 2
L_60D0: LOCATE ARGS(), BX  ' RT3E_44
L_60D3: ' PRINT statement begins (screen) ; RT3F_BC
L_60D6: BX = &HB88E
L_60D9: PRINT S_B88E$;  ' RT3F_6A
L_60DC: BX = SI
L_60DE: SI = &HB84C
L_60E1: DX = BX
L_60E3: BX = CINT(N_B84C!)  ' RT3F_75
L_60E6: BX = BX * (2 ^ 1)
L_60E8: BX = BX * (2 ^ 1)
L_60EA: BX = BX + &H42E4
L_60EE: PRINT S(BX);  ' RT3F_6A
L_60F1: BX = &HB89C
L_60F4: PRINT S_B89C$;  ' RT3F_6A
L_60F7: BX = DX
L_60F9: PRINT N(BX)  ' RT3F_6B
L_60FC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_60FF: GOSUB L_20B6
L_6102: DI = &HA66A
L_6105: SI = &HB84C
L_6108: CompareLeft! = N_B84C!: CompareRight! = N_A66A!  ' RT3F_9F
L_610B: BX = 0
L_610E: IF CompareLeft! <> CompareRight! THEN GOTO L_6111  ' flags from L_6108
L_6110: BX = BX - 1
L_6111: FAC! = RND  ' RT3D_34
L_6114: DI = &HB8BE
L_6117: CompareLeft! = FAC!: CompareRight! = N_B8BE!  ' RT3F_A1
L_611A: DX = 0
L_611D: IF CompareLeft! <= CompareRight! THEN GOTO L_6120  ' flags from L_6117
L_611F: DX = DX - 1
L_6120: DX = DX OR BX
L_6122: CompareLeft% = DX: CompareRight% = 0
L_6124: IF CompareLeft% <> CompareRight% THEN GOTO L_6129  ' flags from L_6122
L_6126: GOTO L_61CD
L_6129: DI = &HA6F8
L_612C: SI = &HA864
L_612F: N_A6F8! = N_A864!  ' RT3F_7B
L_6132: DI = &HA6FC
L_6135: DX = SI
L_6137: SI = &HA9FE
L_613A: N_A6FC! = N_A9FE!  ' RT3F_7B
L_613D: WORD(BP - 6) = BX
L_6140: GOSUB L_07C9
L_6143: BX = CINT(FAC!)  ' RT3F_77
L_6146: DI = BX
L_6148: DI = DI * (2 ^ 1)
L_614A: DI = DI * (2 ^ 1)
L_614C: DI = DI + &H1850
L_6150: BX = DI
L_6152: DI = &HA6E4
L_6155: SI = &HA864
L_6158: N_A6E4! = N_A864!  ' RT3F_7B
L_615B: DX = DI
L_615D: DI = &HA6E8
L_6160: CX = SI
L_6162: SI = &HA9FE
L_6165: N_A6E8! = N_A9FE!  ' RT3F_7B
L_6168: WORD(BP - 8) = BX
L_616B: GOSUB L_0797
L_616E: DI = &H4F6C
L_6171: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_6174: DI = WORD(BP - 8)
L_6177: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_617A: BX = WORD(BP - 6)
L_617D: CompareLeft% = BX: CompareRight% = 0
L_617F: IF CompareLeft% >= CompareRight% THEN GOTO L_6183  ' flags from L_617D
L_6181: BX = -BX
L_6183: FAC! = CSNG(BX)  ' RT3F_57
L_6186: DI = &HB82C
L_6189: FAC! = FAC! + N_B82C!  ' RT3F_81
L_618C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_618F: BX = &H17
L_6192: ARGPUSH BX  ' RT3E_42
L_6195: BX = 2
L_6198: LOCATE ARGS(), BX  ' RT3E_44
L_619B: ' PRINT statement begins (screen) ; RT3F_BC
L_619E: BX = &HB8A6
L_61A1: PRINT S_B8A6$;  ' RT3F_6A
L_61A4: DI = &HA6E4
L_61A7: SI = &HA864
L_61AA: N_A6E4! = N_A864!  ' RT3F_7B
L_61AD: DI = &HA6E8
L_61B0: SI = &HA9FE
L_61B3: N_A6E8! = N_A9FE!  ' RT3F_7B
L_61B6: GOSUB L_0797
L_61B9: BX = CINT(FAC!)  ' RT3F_77
L_61BC: BX = BX * (2 ^ 1)
L_61BE: BX = BX * (2 ^ 1)
L_61C0: BX = BX + &H42AC
L_61C4: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_61C7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_61CA: GOSUB L_20B6
L_61CD: GOSUB L_20B6
L_61D0: GOSUB L_20B6
L_61D3: DI = &H4F6C
L_61D6: SI = &HB848
L_61D9: FAC! = N_B848! + N_4F6C!  ' RT3F_7F
L_61DC: DI = &HB848
L_61DF: N_B848! = FAC!: SI = &H001A  ' RT3F_7D
L_61E2: SI = DI
L_61E4: DI = &HA5CC
L_61E7: CompareLeft! = N_B848!: CompareRight! = N_A5CC!  ' RT3F_9F
L_61EA: IF CompareLeft! > CompareRight! THEN GOTO L_61EF  ' flags from L_61E7
L_61EC: GOTO L_5A9C
L_61EF: GOSUB L_26A6
L_61F2: DI = &HA6F8
L_61F5: SI = &HA672
L_61F8: N_A6F8! = N_A672!  ' RT3F_7B
L_61FB: DI = &HA6FC
L_61FE: SI = &HA9FE
L_6201: N_A6FC! = N_A9FE!  ' RT3F_7B
L_6204: GOSUB L_07C9
L_6207: BX = CINT(FAC!)  ' RT3F_77
L_620A: DI = BX
L_620C: DI = DI * (2 ^ 1)
L_620E: DI = DI * (2 ^ 1)
L_6210: DI = DI + &H1850
L_6214: BX = DI
L_6216: DI = &HA6E4
L_6219: SI = &HA97C
L_621C: N_A6E4! = N_A97C!  ' RT3F_7B
L_621F: DI = &HA6E8
L_6222: SI = &HA9FE
L_6225: N_A6E8! = N_A9FE!  ' RT3F_7B
L_6228: WORD(BP - 6) = BX
L_622B: GOSUB L_0797
L_622E: DI = WORD(BP - 6)
L_6231: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6234: GOSUB L_2352
L_6237: BX = &H14
L_623A: ARGPUSH BX  ' RT3E_42
L_623D: BX = 2
L_6240: LOCATE ARGS(), BX  ' RT3E_44
L_6243: ' PRINT statement begins (screen) ; RT3F_BC
L_6246: BX = &HB8C2
L_6249: PRINT S_B8C2$;  ' RT3F_6A
L_624C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_624F: DI = &HAE50
L_6252: SI = &HA5CC
L_6255: N_AE50! = N_A5CC!  ' RT3F_7B
L_6258: GOSUB L_24F4
L_625B: BX = &HAD12
L_625E: BX = LEN(S_AD12$)  ' RT3F_BA
L_6261: CompareLeft% = BX: CompareRight% = 1
L_6264: IF CompareLeft% < CompareRight% THEN GOTO L_6234  ' flags from L_6261
L_6266: SI = &HA9FE
L_6269: BX = CINT(N_A9FE!)  ' RT3F_75
L_626C: BX = BX * (2 ^ 1)
L_626E: BX = BX * (2 ^ 1)
L_6270: BX = BX + &H4288
L_6274: DX = BX
L_6276: BX = &HAD12
L_6279: S(DX) = S_AD12$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_627C: GOTO L_543C
L_627F: BX = &HB8D2
L_6282: DX = &HAB72
L_6285: S_AB72$ = S_B8D2$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_6288: GOSUB L_1F14
L_628B: SI = &HA9FE
L_628E: CompareLeft! = N_A9FE!: CompareRight! = 0  ' RT3F_A7
L_6291: IF CompareLeft! <> CompareRight! THEN GOTO L_6296  ' flags from L_628E
L_6293: GOTO L_543C
L_6296: DI = &HAB7A
L_6299: SI = &HA9FE
L_629C: N_AB7A! = N_A9FE!  ' RT3F_7B
L_629F: BX = &HB8F0
L_62A2: DX = &HAB72
L_62A5: S_AB72$ = S_B8F0$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_62A8: GOSUB L_1F14
L_62AB: SI = &HA9FE
L_62AE: CompareLeft! = N_A9FE!: CompareRight! = 0  ' RT3F_A7
L_62B1: IF CompareLeft! <> CompareRight! THEN GOTO L_62B6  ' flags from L_62AE
L_62B3: GOTO L_543C
L_62B6: DI = &HA6F8
L_62B9: SI = &HA66E
L_62BC: N_A6F8! = N_A66E!  ' RT3F_7B
L_62BF: BX = DI
L_62C1: DI = &HA6FC
L_62C4: DX = SI
L_62C6: SI = &HAB7A
L_62C9: N_A6FC! = N_AB7A!  ' RT3F_7B
L_62CC: GOSUB L_07C9
L_62CF: DI = &HA6F8
L_62D2: SI = &HA66E
L_62D5: N_A6F8! = N_A66E!  ' RT3F_7B
L_62D8: BX = DI
L_62DA: DI = &HA6FC
L_62DD: SI = &HA9FE
L_62E0: N_A6FC! = N_A9FE!  ' RT3F_7B
L_62E3: T_00! = FAC!  ' RT3F_71; inline=&H80
L_62E7: GOSUB L_07C9
L_62EA: FAC! = T_00! - FAC!  ' RT3F_9D; inline=&H80
L_62EE: DI = &HB904
L_62F1: N_B904! = FAC!: SI = &H001A  ' RT3F_7D
L_62F4: DI = &HA6F8
L_62F7: SI = &HA68A
L_62FA: N_A6F8! = N_A68A!  ' RT3F_7B
L_62FD: BX = DI
L_62FF: DI = &HA6FC
L_6302: SI = &HAB7A
L_6305: N_A6FC! = N_AB7A!  ' RT3F_7B
L_6308: GOSUB L_07C9
L_630B: DI = &HB908
L_630E: N_B908! = FAC!: SI = &H001A  ' RT3F_7D
L_6311: DI = &HA6F8
L_6314: SI = &HB028
L_6317: N_A6F8! = N_B028!  ' RT3F_7B
L_631A: DI = &HA6FC
L_631D: SI = &HAB7A
L_6320: N_A6FC! = N_AB7A!  ' RT3F_7B
L_6323: GOSUB L_07C9
L_6326: GOTO L_6364
L_6329: ' Alignment NOP
L_632A: DI = &HB904
L_632D: SI = &HA858
L_6330: FAC! = N_A858! - N_B904!  ' RT3F_97
L_6333: BX = SI
L_6335: DX = BX
L_6337: BX = CINT(FAC!)  ' RT3F_77
L_633A: SI = BX
L_633C: SI = SI * (2 ^ 1)
L_633E: SI = SI * (2 ^ 1)
L_6340: SI = SI + &H1850
L_6344: SWAP DX, SI
L_6346: BX = SI
L_6348: CX = BX
L_634A: BX = CINT(N(SI))  ' RT3F_75
L_634D: DI = BX
L_634F: DI = DI * (2 ^ 1)
L_6351: DI = DI * (2 ^ 1)
L_6353: DI = DI + &H1850
L_6357: SI = DX
L_6359: SWAP N(SI), N(DI)  ' RT3F_11
L_635C: SI = CX
L_635E: DI = &H4F6C
L_6361: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_6364: DI = &HA858
L_6367: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_636A: SI = DI
L_636C: DI = &HB908
L_636F: CompareLeft! = N_A858!: CompareRight! = N_B908!  ' RT3F_9F
L_6372: IF CompareLeft! <= CompareRight! THEN GOTO L_632A  ' flags from L_636F
L_6374: SI = &HA9FE
L_6377: BX = CINT(N_A9FE!)  ' RT3F_75
L_637A: SI = BX
L_637C: SI = SI * (2 ^ 1)
L_637E: SI = SI * (2 ^ 1)
L_6380: SI = SI + &H4288
L_6384: BX = SI
L_6386: SI = &HAB7A
L_6389: DX = BX
L_638B: BX = CINT(N_AB7A!)  ' RT3F_75
L_638E: DI = BX
L_6390: DI = DI * (2 ^ 1)
L_6392: DI = DI * (2 ^ 1)
L_6394: DI = DI + &H4288
L_6398: SI = DX
L_639A: SWAP S(SI), S(DI)  ' RT3F_14
L_639D: DI = &HA9FE
L_63A0: SI = &HAB7A
L_63A3: FAC! = N_AB7A! + N_A9FE!  ' RT3F_7F
L_63A6: DI = &HACE4
L_63A9: N_ACE4! = FAC!: SI = &H001A  ' RT3F_7D
L_63AC: SI = &HB90C
L_63AF: FAC! = N_B90C!: DI = &H001E  ' RT3F_6F
L_63B2: GOTO L_63C2
L_63B5: ' Alignment NOP
L_63B6: GOSUB L_6421
L_63B9: DI = &HA840
L_63BC: SI = &HA5C4
L_63BF: FAC! = N_A5C4! + N_A840!  ' RT3F_7F
L_63C2: DI = &HA5C4
L_63C5: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_63C8: SI = DI
L_63CA: DI = &HB910
L_63CD: CompareLeft! = N_A5C4!: CompareRight! = N_B910!  ' RT3F_9F
L_63D0: IF CompareLeft! <= CompareRight! THEN GOTO L_63B6  ' flags from L_63CD
L_63D2: SI = &HB914
L_63D5: FAC! = N_B914!: DI = &H001E  ' RT3F_6F
L_63D8: GOTO L_63E8
L_63DB: ' Alignment NOP
L_63DC: GOSUB L_6421
L_63DF: DI = &HA5C0
L_63E2: SI = &HA5C4
L_63E5: FAC! = N_A5C4! + N_A5C0!  ' RT3F_7F
L_63E8: DI = &HA5C4
L_63EB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_63EE: SI = DI
L_63F0: DI = &HB918
L_63F3: CompareLeft! = N_A5C4!: CompareRight! = N_B918!  ' RT3F_9F
L_63F6: IF CompareLeft! <= CompareRight! THEN GOTO L_63DC  ' flags from L_63F3
L_63F8: SI = &HB91C
L_63FB: FAC! = N_B91C!: DI = &H001E  ' RT3F_6F
L_63FE: GOTO L_640E

```

### Squad list and positions

```basic
L_6401: ' Alignment NOP
L_6402: GOSUB L_6421
L_6405: DI = &HA5C0
L_6408: SI = &HA5C4
L_640B: FAC! = N_A5C4! + N_A5C0!  ' RT3F_7F
L_640E: DI = &HA5C4
L_6411: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_6414: SI = DI
L_6416: DI = &HB920
L_6419: CompareLeft! = N_A5C4!: CompareRight! = N_B920!  ' RT3F_9F
L_641C: IF CompareLeft! <= CompareRight! THEN GOTO L_6402  ' flags from L_6419
L_641E: GOTO L_543C
L_6421: SI = &HA5C4
L_6424: BX = CINT(N_A5C4!)  ' RT3F_75
L_6427: SI = BX
L_6429: SI = SI * (2 ^ 1)
L_642B: SI = SI * (2 ^ 1)
L_642D: SI = SI + &H1850
L_6431: DI = &HAB7A
L_6434: CompareLeft! = N(SI): CompareRight! = N_AB7A!  ' RT3F_9F
L_6437: BX = 0
L_643A: IF CompareLeft! = CompareRight! THEN GOTO L_643D  ' flags from L_6434
L_643C: BX = BX - 1
L_643D: DI = &HA9FE
L_6440: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_6443: DX = 0
L_6446: IF CompareLeft! = CompareRight! THEN GOTO L_6449  ' flags from L_6440
L_6448: DX = DX - 1
L_6449: DX = DX AND BX
L_644B: CompareLeft% = DX: CompareRight% = 0
L_644D: IF CompareLeft% <> CompareRight% THEN GOTO L_6452  ' flags from L_644B
L_644F: GOTO L_6453
L_6452: RETURN
L_6453: SI = &HA5C4
L_6456: BX = CINT(N_A5C4!)  ' RT3F_75
L_6459: DI = BX
L_645B: DI = DI * (2 ^ 1)
L_645D: DI = DI * (2 ^ 1)
L_645F: DI = DI + &H1850
L_6463: SI = &HACE4
L_6466: FAC! = N_ACE4! - N(DI)  ' RT3F_97
L_6469: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_646C: RETURN
L_646D: BX = 4
L_6470: ARGPUSH BX  ' RT3E_42
L_6473: DX = BX
L_6475: BX = 6
L_6478: LOCATE ARGS(), BX  ' RT3E_44
L_647B: ' PRINT statement begins (screen) ; RT3F_BC
L_647E: BX = &HB92E
L_6481: PRINT S_B92E$  ' RT3F_6E; H newline item, ledger correction
L_6484: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6487: BX = DX
L_6489: ARGPUSH BX  ' RT3E_42
L_648C: BX = &HF
L_648F: LOCATE ARGS(), BX  ' RT3E_44
L_6492: ' PRINT statement begins (screen) ; RT3F_BC
L_6495: BX = &HB936
L_6498: PRINT S_B936$  ' RT3F_6E; H newline item, ledger correction
L_649B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_649E: BX = DX
L_64A0: ARGPUSH BX  ' RT3E_42
L_64A3: BX = &H18
L_64A6: LOCATE ARGS(), BX  ' RT3E_44
L_64A9: ' PRINT statement begins (screen) ; RT3F_BC
L_64AC: BX = &HB924
L_64AF: PRINT S_B924$  ' RT3F_6E; H newline item, ledger correction
L_64B2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_64B5: SI = &H4F6C
L_64B8: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_64BB: GOTO L_6669
L_64BE: DI = &HA682
L_64C1: SI = &HA5C4
L_64C4: FAC! = N_A5C4! + N_A682!  ' RT3F_7F
L_64C7: BX = SI
L_64C9: DX = BX
L_64CB: BX = CINT(FAC!)  ' RT3F_77
L_64CE: ARGPUSH BX  ' RT3E_42
L_64D1: BX = 2
L_64D4: LOCATE ARGS(), BX  ' RT3E_44
L_64D7: DI = &HA6E4
L_64DA: SI = &HA864
L_64DD: N_A6E4! = N_A864!  ' RT3F_7B
L_64E0: SI = DX
L_64E2: DI = &HA6E8
L_64E5: N_A6E8! = N(SI)  ' RT3F_7B
L_64E8: GOSUB L_0797
L_64EB: BX = CINT(FAC!)  ' RT3F_77
L_64EE: BX = BX * (2 ^ 1)
L_64F0: BX = BX * (2 ^ 1)
L_64F2: BX = BX + &H42AC
L_64F6: DX = &HA
L_64F9: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_64FC: DX = &HB93E
L_64FF: S_B93E$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_6502: DI = &HA6E4
L_6505: SI = &HA868
L_6508: N_A6E4! = N_A868!  ' RT3F_7B
L_650B: BX = DI
L_650D: DI = &HA6E8
L_6510: SI = &HA5C4
L_6513: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6516: GOSUB L_0797
L_6519: BX = CINT(FAC!)  ' RT3F_77
L_651C: BX = BX * (2 ^ 1)
L_651E: BX = BX * (2 ^ 1)
L_6520: BX = BX + &HA5F2
L_6524: DX = 3
L_6527: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_652A: DX = &HB942
L_652D: S_B942$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_6530: DI = &HA6E4
L_6533: SI = &HA672
L_6536: N_A6E4! = N_A672!  ' RT3F_7B
L_6539: BX = DI
L_653B: DI = &HA6E8
L_653E: SI = &HA5C4
L_6541: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6544: GOSUB L_0797
L_6547: DI = &HA6E4
L_654A: SI = &HA97C
L_654D: N_A6E4! = N_A97C!  ' RT3F_7B
L_6550: DI = &HA6E8
L_6553: SI = &HA5C4
L_6556: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6559: T_00! = FAC!  ' RT3F_71; inline=&H80
L_655D: GOSUB L_0797
L_6560: CompareLeft! = T_00!: CompareRight! = FAC!  ' RT3F_A5; inline=&H80
L_6564: IF CompareLeft! < CompareRight! THEN GOTO L_6569  ' flags from L_6560
L_6566: GOTO L_6572
L_6569: BX = &HB946
L_656C: DX = &HB942
L_656F: S_B942$ = S_B946$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_6572: DI = &HA6E4
L_6575: SI = &HA86C
L_6578: N_A6E4! = N_A86C!  ' RT3F_7B
L_657B: BX = DI
L_657D: DI = &HA6E8
L_6580: DX = SI
L_6582: SI = &HA5C4
L_6585: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6588: GOSUB L_0797
L_658B: DI = &H4F6C
L_658E: CompareLeft! = FAC!: CompareRight! = N_4F6C!  ' RT3F_A1
L_6591: IF CompareLeft! <> CompareRight! THEN GOTO L_6596  ' flags from L_658E
L_6593: GOTO L_65BC
L_6596: DI = &HA6E4
L_6599: SI = &HA86C
L_659C: N_A6E4! = N_A86C!  ' RT3F_7B
L_659F: DI = &HA6E8
L_65A2: SI = &HA5C4
L_65A5: N_A6E8! = N_A5C4!  ' RT3F_7B
L_65A8: GOSUB L_0797
L_65AB: BX = CINT(FAC!)  ' RT3F_77
L_65AE: BX = BX * (2 ^ 1)
L_65B0: BX = BX * (2 ^ 1)
L_65B2: BX = BX + &HA4E8
L_65B6: DX = &HB942
L_65B9: S_B942$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_65BC: ' PRINT statement begins (screen) ; RT3F_BC
L_65BF: SI = &HA5C4
L_65C2: BX = SI
L_65C4: DX = BX
L_65C6: BX = CINT(N_A5C4!)  ' RT3F_75
L_65C9: BX = BX * (2 ^ 1)
L_65CB: BX = BX * (2 ^ 1)
L_65CD: BX = BX + &HA590
L_65D1: PRINT S(BX);  ' RT3F_6A
L_65D4: BX = &HB94E
L_65D7: PRINT S_B94E$;  ' RT3F_6A
L_65DA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_65DD: DI = &HA6E4
L_65E0: SI = &HAA44
L_65E3: N_A6E4! = N_AA44!  ' RT3F_7B
L_65E6: SWAP DX, SI
L_65E8: DI = &HA6E8
L_65EB: N_A6E8! = N(SI)  ' RT3F_7B
L_65EE: GOSUB L_0797
L_65F1: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_65F4: IF CompareLeft! = CompareRight! THEN GOTO L_65F9  ' flags from L_65F1
L_65F6: GOTO L_6608
L_65F9: ' PRINT statement begins (screen) ; RT3F_BC
L_65FC: BX = &H19
L_65FF: PRINT SPC(BX);  ' RT3F_35; M ledger
L_6602: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6605: GOTO L_6660
L_6608: ' PRINT statement begins (screen) ; RT3F_BC
L_660B: BX = &HB93E
L_660E: AX = &HB954
L_6611: BX = TEMP_DESC(S_B954$ + S_B93E$)  ' BX receives a temporary descriptor  ' RT3F_55
L_6614: DX = &HA
L_6617: BX = TEMP_DESC(RIGHT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0C
L_661A: PRINT S(BX);  ' RT3F_6A
L_661D: BX = &HAC6A
L_6620: PRINT S_AC6A$;  ' RT3F_6A
L_6623: SI = &HA5C4
L_6626: DX = BX
L_6628: BX = CINT(N_A5C4!)  ' RT3F_75
L_662B: BX = BX * (2 ^ 1)
L_662D: BX = BX * (2 ^ 1)
L_662F: BX = BX + &H4288
L_6633: CX = BX
L_6635: BX = 9
L_6638: AX = BX
L_663A: BX = TEMP_DESC(SPACE$(BX))  ' RT3D_0D
L_663D: SWAP CX, AX
L_663E: BX = TEMP_DESC(S(AX) + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_6641: SWAP CX, DX
L_6643: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_6646: PRINT S(BX);  ' RT3F_6A
L_6649: BX = CX
L_664B: PRINT S(BX);  ' RT3F_6A
L_664E: AX = &HB942
L_6651: BX = TEMP_DESC(S_B942$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_6654: DX = 4
L_6657: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_665A: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_665D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6660: DI = &H4F6C
L_6663: SI = &HA5C4
L_6666: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_6669: DI = &HA5C4
L_666C: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_666F: SI = DI
L_6671: DI = &HA5CC
L_6674: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_6677: IF CompareLeft! > CompareRight! THEN GOTO L_667C  ' flags from L_6674
L_6679: GOTO L_64BE
L_667C: RETURN
L_667D: DI = &HA9FE
L_6680: SI = &H4F6C
L_6683: N_A9FE! = N_4F6C!  ' RT3F_7B
L_6686: SI = &H4F6C
L_6689: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_668C: GOTO L_670B
L_668F: ' Alignment NOP
L_6690: DI = &HA6E4
L_6693: SI = &HA86C
L_6696: N_A6E4! = N_A86C!  ' RT3F_7B
L_6699: BX = DI
L_669B: DI = &HA6E8
L_669E: SI = &HA5C4
L_66A1: N_A6E8! = N_A5C4!  ' RT3F_7B
L_66A4: GOSUB L_0797
L_66A7: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_66AA: BX = 0
L_66AD: IF CompareLeft! <= CompareRight! THEN GOTO L_66B0  ' flags from L_66A7
L_66AF: BX = BX - 1
L_66B0: DI = &HA6E4
L_66B3: SI = &HAE12
L_66B6: N_A6E4! = N_AE12!  ' RT3F_7B
L_66B9: DX = DI
L_66BB: DI = &HA6E8
L_66BE: CX = SI
L_66C0: SI = &HA5C4
L_66C3: N_A6E8! = N_A5C4!  ' RT3F_7B
L_66C6: WORD(BP - 6) = BX
L_66C9: GOSUB L_0797
L_66CC: DI = &HA6E4
L_66CF: SI = &HAE12
L_66D2: N_A6E4! = N_AE12!  ' RT3F_7B
L_66D5: DI = &HA6E8
L_66D8: SI = &HA9FE
L_66DB: N_A6E8! = N_A9FE!  ' RT3F_7B
L_66DE: T_00! = FAC!  ' RT3F_71; inline=&H80
L_66E2: GOSUB L_0797
L_66E5: CompareLeft! = T_00!: CompareRight! = FAC!  ' RT3F_A5; inline=&H80
L_66E9: BX = 0
L_66EC: IF CompareLeft! < CompareRight! THEN GOTO L_66EF  ' flags from L_66E5
L_66EE: BX = BX - 1
L_66EF: BX = BX AND WORD(BP - 6)
L_66F2: CompareLeft% = BX: CompareRight% = 0
L_66F4: IF CompareLeft% <> CompareRight% THEN GOTO L_66F9  ' flags from L_66F2
L_66F6: GOTO L_6702
L_66F9: DI = &HA9FE
L_66FC: SI = &HA5C4
L_66FF: N_A9FE! = N_A5C4!  ' RT3F_7B

```

### Dry dock and repairs

```basic
L_6702: DI = &H4F6C
L_6705: SI = &HA5C4
L_6708: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_670B: DI = &HA5C4
L_670E: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_6711: SI = DI
L_6713: DI = &HA5CC
L_6716: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_6719: IF CompareLeft! > CompareRight! THEN GOTO L_671E  ' flags from L_6716
L_671B: GOTO L_6690
L_671E: DI = &HA6E4
L_6721: SI = &HAE12
L_6724: N_A6E4! = N_AE12!  ' RT3F_7B
L_6727: BX = DI
L_6729: DI = &HA6E8
L_672C: SI = &HA9FE
L_672F: N_A6E8! = N_A9FE!  ' RT3F_7B
L_6732: GOSUB L_0797
L_6735: DI = &HA686
L_6738: FAC! = FAC! * N_A686!  ' RT3F_91
L_673B: DI = &HA868
L_673E: FAC! = FAC! + N_A868!  ' RT3F_81
L_6741: DI = &HB95E
L_6744: N_B95E! = FAC!: SI = &H001A  ' RT3F_7D
L_6747: BX = DI
L_6749: DI = &HA6E4
L_674C: SI = &HA86C
L_674F: N_A6E4! = N_A86C!  ' RT3F_7B
L_6752: DI = &HA6E8
L_6755: SI = &HA9FE
L_6758: N_A6E8! = N_A9FE!  ' RT3F_7B
L_675B: GOSUB L_0797
L_675E: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_6761: IF CompareLeft! = CompareRight! THEN GOTO L_6766  ' flags from L_675E
L_6763: GOTO L_676F
L_6766: DI = &HB95E
L_6769: SI = &HAA44
L_676C: N_B95E! = N_AA44!  ' RT3F_7B
L_676F: GOSUB L_2352
L_6772: BX = &H10
L_6775: ARGPUSH BX  ' RT3E_42
L_6778: BX = 6
L_677B: LOCATE ARGS(), BX  ' RT3E_44
L_677E: ' PRINT statement begins (screen) ; RT3F_BC
L_6781: SI = &HA9FE
L_6784: BX = CINT(N_A9FE!)  ' RT3F_75
L_6787: BX = BX * (2 ^ 1)
L_6789: BX = BX * (2 ^ 1)
L_678B: BX = BX + &H4288
L_678F: PRINT S(BX);  ' RT3F_6A
L_6792: BX = &HB962
L_6795: PRINT S_B962$  ' RT3F_6E; H newline item, ledger correction
L_6798: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_679B: BX = &H13
L_679E: ARGPUSH BX  ' RT3E_42
L_67A1: BX = 2
L_67A4: LOCATE ARGS(), BX  ' RT3E_44
L_67A7: ' PRINT statement begins (screen) ; RT3F_BC
L_67AA: DX = BX
L_67AC: BX = &HB972
L_67AF: PRINT S_B972$  ' RT3F_6E; H newline item, ledger correction
L_67B2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_67B5: BX = &H14
L_67B8: ARGPUSH BX  ' RT3E_42
L_67BB: BX = DX
L_67BD: LOCATE ARGS(), BX  ' RT3E_44
L_67C0: ' PRINT statement begins (screen) ; RT3F_BC
L_67C3: BX = &HB98E
L_67C6: PRINT S_B98E$  ' RT3F_6E; H newline item, ledger correction
L_67C9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_67CC: BX = &H15
L_67CF: ARGPUSH BX  ' RT3E_42
L_67D2: BX = DX
L_67D4: LOCATE ARGS(), BX  ' RT3E_44
L_67D7: ' PRINT statement begins (screen) ; RT3F_BC
L_67DA: BX = &HB9B2
L_67DD: PRINT S_B9B2$  ' RT3F_6E; H newline item, ledger correction
L_67E0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_67E3: DI = &HAE0E
L_67E6: SI = &HA5C0
L_67E9: N_AE0E! = N_A5C0!  ' RT3F_7B
L_67EC: GOSUB L_1E7C
L_67EF: DI = &HAE22
L_67F2: SI = &HAE16
L_67F5: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_67F8: IF CompareLeft! = CompareRight! THEN GOTO L_67E3  ' flags from L_67F5
L_67FA: DI = &HAE2E
L_67FD: SI = &HAE16
L_6800: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_6803: IF CompareLeft! <> CompareRight! THEN GOTO L_6808  ' flags from L_6800
L_6805: GOTO L_234F
L_6808: DI = &H4F94
L_680B: SI = &HAE16
L_680E: CompareLeft! = N_AE16!: CompareRight! = N_4F94!  ' RT3F_9F
L_6811: IF CompareLeft! <> CompareRight! THEN GOTO L_6816  ' flags from L_680E
L_6813: GOTO L_6A99
L_6816: GOSUB L_2352
L_6819: SI = &H18FC
L_681C: CompareLeft! = N_18FC!: CompareRight! = 0  ' RT3F_A7
L_681F: IF CompareLeft! <> CompareRight! THEN GOTO L_6824  ' flags from L_681C
L_6821: GOTO L_667D
L_6824: DI = &HA5C0
L_6827: SI = &HAE16
L_682A: CompareLeft! = N_AE16!: CompareRight! = N_A5C0!  ' RT3F_9F
L_682D: IF CompareLeft! <> CompareRight! THEN GOTO L_6832  ' flags from L_682A
L_682F: GOTO L_6DCC
L_6832: SI = &HA66E
L_6835: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_6838: GOTO L_68FB
L_683B: ' Alignment NOP
L_683C: DI = &HAED2
L_683F: SI = &HA5C4
L_6842: FAC! = N_A5C4! * N_AED2!  ' RT3F_8F
L_6845: BX = &H1A
L_6848: FAC! = INT(FAC!)  ' RT3D_03
L_684B: DI = &HA858
L_684E: BX = SI
L_6850: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_6853: SI = DI
L_6855: FAC! = N_A858! * 2 ^ (3)  ' RT3F_AB; inline=&H03
L_6859: SI = &HA97C
L_685C: DX = DI
L_685E: FAC! = N_A97C! - FAC!  ' RT3F_9B
L_6861: DI = BX
L_6863: FAC! = FAC! + N(DI)  ' RT3F_81
L_6866: BX = CINT(FAC!)  ' RT3F_77
L_6869: ARGPUSH BX  ' RT3E_42
L_686C: SI = DX
L_686E: BX = DI
L_6870: DI = &HA66A
L_6873: FAC! = N(SI) * N_A66A!  ' RT3F_8F
L_6876: DI = &H4F94
L_6879: FAC! = FAC! + N_4F94!  ' RT3F_81
L_687C: DX = BX
L_687E: BX = CINT(FAC!)  ' RT3F_77
L_6881: LOCATE ARGS(), BX  ' RT3E_44
L_6884: ' PRINT statement begins (screen) ; RT3F_BC
L_6887: SI = DX
L_6889: DI = &HB818
L_688C: FAC! = N(SI) + N_B818!  ' RT3F_7F
L_688F: BX = CINT(FAC!)  ' RT3F_77
L_6892: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_6895: PRINT S(BX);  ' RT3F_6A
L_6898: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_689B: SI = DX
L_689D: BX = CINT(N(SI))  ' RT3F_75
L_68A0: SI = BX
L_68A2: SI = SI * (2 ^ 1)
L_68A4: SI = SI * (2 ^ 1)
L_68A6: SI = SI + &H1850
L_68AA: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_68AD: IF CompareLeft! = CompareRight! THEN GOTO L_68B2  ' flags from L_68AA
L_68AF: GOTO L_68C1
L_68B2: ' PRINT statement begins (screen) ; RT3F_BC
L_68B5: BX = &HB9CE
L_68B8: PRINT S_B9CE$  ' RT3F_6E; H newline item, ledger correction
L_68BB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_68BE: GOTO L_68F2
L_68C1: ' PRINT statement begins (screen) ; RT3F_BC
L_68C4: SI = &HA5C4
L_68C7: BX = CINT(N_A5C4!)  ' RT3F_75
L_68CA: SI = BX
L_68CC: SI = SI * (2 ^ 1)
L_68CE: SI = SI * (2 ^ 1)
L_68D0: BX = SI
L_68D2: SI = SI + &H1850
L_68D6: DX = BX
L_68D8: BX = CINT(N(SI))  ' RT3F_75
L_68DB: BX = BX * (2 ^ 1)
L_68DD: BX = BX * (2 ^ 1)
L_68DF: BX = BX + &HA62C
L_68E3: PRINT S(BX);  ' RT3F_6A
L_68E6: DX = DX + &H4814
L_68EA: BX = DX
L_68EC: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_68EF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_68F2: DI = &H4F6C
L_68F5: SI = &HA5C4
L_68F8: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_68FB: DI = &HA5C4
L_68FE: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_6901: SI = DI
L_6903: DI = &HA692
L_6906: CompareLeft! = N_A5C4!: CompareRight! = N_A692!  ' RT3F_9F
L_6909: IF CompareLeft! > CompareRight! THEN GOTO L_690E  ' flags from L_6906
L_690B: GOTO L_683C
L_690E: BX = &H18
L_6911: ARGPUSH BX  ' RT3E_42
L_6914: BX = 2
L_6917: LOCATE ARGS(), BX  ' RT3E_44
L_691A: ' PRINT statement begins (screen) ; RT3F_BC
L_691D: BX = &HB9DE
L_6920: PRINT S_B9DE$;  ' RT3F_6A
L_6923: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6926: DI = &HAE0E
L_6929: SI = &HBA08
L_692C: N_AE0E! = N_BA08!  ' RT3F_7B
L_692F: GOSUB L_22C4
L_6932: DI = &HAE22
L_6935: SI = &HAE16
L_6938: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_693B: IF CompareLeft! = CompareRight! THEN GOTO L_692F  ' flags from L_6938
L_693D: DI = &HAE2E
L_6940: SI = &HAE16
L_6943: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_6946: IF CompareLeft! <> CompareRight! THEN GOTO L_694B  ' flags from L_6943
L_6948: GOTO L_667D
L_694B: DI = &HA844
L_694E: SI = &HAE16
L_6951: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_6954: DI = SI
L_6956: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6959: SI = DI
L_695B: BX = CINT(N(SI))  ' RT3F_75
L_695E: SI = BX
L_6960: SI = SI * (2 ^ 1)
L_6962: SI = SI * (2 ^ 1)
L_6964: SI = SI + &H1850
L_6968: DI = &H4F6C
L_696B: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_696E: BX = CINT(FAC!)  ' RT3F_77
L_6971: ON BX GOTO L_692F, L_692F, L_69C2, L_697D  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_697D: GOSUB L_6A5A
L_6980: DI = &HA704
L_6983: SI = &HA66E
L_6986: N_A704! = N_A66E!  ' RT3F_7B
L_6989: GOSUB L_07E8
L_698C: DI = &HBA0C
L_698F: CompareLeft! = FAC!: CompareRight! = N_BA0C!  ' RT3F_A1
L_6992: IF CompareLeft! < CompareRight! THEN GOTO L_6997  ' flags from L_698F
L_6994: GOTO L_699D
L_6997: GOSUB L_2687
L_699A: GOTO L_6816
L_699D: DI = &HAA4C
L_69A0: SI = &HBA10
L_69A3: N_AA4C! = N_BA10!  ' RT3F_7B
L_69A6: GOSUB L_1E98
L_69A9: SI = &HAE16
L_69AC: BX = CINT(N_AE16!)  ' RT3F_75
L_69AF: DI = BX
L_69B1: DI = DI * (2 ^ 1)
L_69B3: DI = DI * (2 ^ 1)
L_69B5: DI = DI + &H1850
L_69B9: SI = &H4F6C
L_69BC: N(DI) = N_4F6C!  ' RT3F_7B
L_69BF: GOTO L_6832
L_69C2: GOSUB L_6A5A
L_69C5: BX = &H18
L_69C8: ARGPUSH BX  ' RT3E_42
L_69CB: DX = BX
L_69CD: BX = 2
L_69D0: LOCATE ARGS(), BX  ' RT3E_44
L_69D3: ' PRINT statement begins (screen) ; RT3F_BC
L_69D6: BX = &H26
L_69D9: PRINT SPC(BX);  ' RT3F_35; M ledger
L_69DC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_69DF: FAC! = RND  ' RT3D_34
L_69E2: DI = &HA6EC
L_69E5: FAC! = FAC! * N_A6EC!  ' RT3F_91
L_69E8: DI = &HB95E
L_69EB: CompareLeft! = FAC!: CompareRight! = N_B95E!  ' RT3F_A1
L_69EE: IF CompareLeft! < CompareRight! THEN GOTO L_69F3  ' flags from L_69EB
L_69F0: GOTO L_6A26
L_69F3: BX = DX
L_69F5: ARGPUSH BX  ' RT3E_42
L_69F8: BX = &HA
L_69FB: LOCATE ARGS(), BX  ' RT3E_44
L_69FE: ' PRINT statement begins (screen) ; RT3F_BC
L_6A01: BX = &HBA14
L_6A04: PRINT S_BA14$;  ' RT3F_6A
L_6A07: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6A0A: GOSUB L_20B6
L_6A0D: SI = &HAE16
L_6A10: BX = CINT(N_AE16!)  ' RT3F_75
L_6A13: DI = BX
L_6A15: DI = DI * (2 ^ 1)
L_6A17: DI = DI * (2 ^ 1)
L_6A19: DI = DI + &H1850
L_6A1D: SI = &H4F6C
L_6A20: N(DI) = N_4F6C!  ' RT3F_7B
L_6A23: GOTO L_6832
L_6A26: BX = &H18
L_6A29: ARGPUSH BX  ' RT3E_42
L_6A2C: BX = &HA
L_6A2F: LOCATE ARGS(), BX  ' RT3E_44
L_6A32: ' PRINT statement begins (screen) ; RT3F_BC
L_6A35: BX = &HBA22
L_6A38: PRINT S_BA22$;  ' RT3F_6A
L_6A3B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6A3E: GOSUB L_20B6
L_6A41: SI = &HAE16
L_6A44: BX = CINT(N_AE16!)  ' RT3F_75
L_6A47: DI = BX
L_6A49: DI = DI * (2 ^ 1)
L_6A4B: DI = DI * (2 ^ 1)
L_6A4D: DI = DI + &H1850
L_6A51: SI = &HA5C0
L_6A54: N(DI) = N_A5C0!  ' RT3F_7B
L_6A57: GOTO L_6832
L_6A5A: FAC! = RND  ' RT3D_34
L_6A5D: T_00! = FAC!  ' RT3F_71; inline=&H80
L_6A61: FAC! = RND  ' RT3D_34
L_6A64: FAC! = T_00! * FAC!  ' RT3F_95; inline=&H80
L_6A68: DI = &HA6EC
L_6A6B: FAC! = FAC! * N_A6EC!  ' RT3F_91
L_6A6E: DI = &HA9F6
L_6A71: N_A9F6! = FAC!: SI = &H001A  ' RT3F_7D
L_6A74: GOSUB L_6A78
L_6A77: RETURN
L_6A78: DI = &HBA2E
L_6A7B: SI = &HA9F6
L_6A7E: CompareLeft! = N_A9F6!: CompareRight! = N_BA2E!  ' RT3F_9F
L_6A81: IF CompareLeft! > CompareRight! THEN GOTO L_6A86  ' flags from L_6A7E
L_6A83: GOTO L_6A89
L_6A86: N(DI) = N(SI)  ' RT3F_7B
L_6A89: RETURN
L_6A8A: DI = &HA9F6
L_6A8D: SI = &HBA32
L_6A90: FAC! = N_BA32! + N_A9F6!  ' RT3F_7F
L_6A93: DI = SI
L_6A95: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6A98: RETURN
L_6A99: GOSUB L_2352
L_6A9C: DI = &HAB7A
L_6A9F: SI = &HA66E
L_6AA2: N_AB7A! = N_A66E!  ' RT3F_7B
L_6AA5: DI = &HA858
L_6AA8: N_A858! = N_A66E!  ' RT3F_7B
L_6AAB: SI = &H4F6C
L_6AAE: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_6AB1: GOTO L_6BE3
L_6AB4: DI = &HA6E4
L_6AB7: SI = &HA68E
L_6ABA: N_A6E4! = N_A68E!  ' RT3F_7B
L_6ABD: BX = DI
L_6ABF: DI = &HA6E8
L_6AC2: DX = SI
L_6AC4: SI = &HA5C4
L_6AC7: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6ACA: GOSUB L_0797
L_6ACD: DI = &HA6E4
L_6AD0: SI = &HA870
L_6AD3: N_A6E4! = N_A870!  ' RT3F_7B
L_6AD6: BX = DI
L_6AD8: DI = &HA6E8
L_6ADB: DX = SI
L_6ADD: SI = &HA5C4
L_6AE0: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6AE3: T_00! = FAC!  ' RT3F_71; inline=&H80
L_6AE7: GOSUB L_0797
L_6AEA: CompareLeft! = T_00!: CompareRight! = FAC!  ' RT3F_A5; inline=&H80
L_6AEE: BX = 0
L_6AF1: IF CompareLeft! = CompareRight! THEN GOTO L_6AF4  ' flags from L_6AEA
L_6AF3: BX = BX - 1
L_6AF4: FAC! = CSNG(BX)  ' RT3F_57
L_6AF7: SI = &HAB7A
L_6AFA: FAC! = N_AB7A! - FAC!  ' RT3F_9B
L_6AFD: DI = SI
L_6AFF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6B02: DI = &HA6E4
L_6B05: SI = &HAD26
L_6B08: N_A6E4! = N_AD26!  ' RT3F_7B
L_6B0B: BX = DI
L_6B0D: DI = &HA6E8
L_6B10: DX = SI
L_6B12: SI = &HA5C4
L_6B15: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6B18: GOSUB L_0797
L_6B1B: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_6B1E: AX = 0
L_6B21: IF CompareLeft! <= CompareRight! THEN GOTO L_6B24  ' flags from L_6B1B
L_6B23: AX = AX - 1
L_6B24: DI = &HA6E4
L_6B27: SI = &HAD26
L_6B2A: N_A6E4! = N_AD26!  ' RT3F_7B
L_6B2D: BX = DI
L_6B2F: DI = &HA6E8
L_6B32: SI = &HA5C4
L_6B35: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6B38: WORD(BP - 6) = AX
L_6B3B: GOSUB L_0797
L_6B3E: DI = &HA6E4
L_6B41: SI = &HA870
L_6B44: N_A6E4! = N_A870!  ' RT3F_7B
L_6B47: BX = DI
L_6B49: DI = &HA6E8
L_6B4C: DX = SI
L_6B4E: SI = &HA5C4
L_6B51: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6B54: T_01! = FAC!  ' RT3F_71; inline=&H81
L_6B58: GOSUB L_0797
L_6B5B: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_6B5F: DI = &HA6E4
L_6B62: SI = &HA68E
L_6B65: N_A6E4! = N_A68E!  ' RT3F_7B
L_6B68: BX = DI
L_6B6A: DI = &HA6E8
L_6B6D: DX = SI
L_6B6F: SI = &HA5C4
L_6B72: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6B75: T_02! = FAC!  ' RT3F_71; inline=&H82
L_6B79: GOSUB L_0797
L_6B7C: CompareLeft! = T_02!: CompareRight! = FAC!  ' RT3F_A5; inline=&H82
L_6B80: BX = 0
L_6B83: IF CompareLeft! <> CompareRight! THEN GOTO L_6B86  ' flags from L_6B7C
L_6B85: BX = BX - 1
L_6B86: SWAP BX, AX
L_6B87: DX:AX = SIGNED16(AX) * SIGNED16(WORD(BP - 6))
L_6B8A: BX = AX
L_6B8C: FAC! = CSNG(BX)  ' RT3F_57
L_6B8F: DI = &HA858
L_6B92: FAC! = FAC! + N_A858!  ' RT3F_81
L_6B95: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6B98: DI = &HA6F8
L_6B9B: SI = &HA870
L_6B9E: N_A6F8! = N_A870!  ' RT3F_7B
L_6BA1: DI = &HA6FC
L_6BA4: SI = &HA5C4
L_6BA7: N_A6FC! = N_A5C4!  ' RT3F_7B
L_6BAA: GOSUB L_07C9
L_6BAD: BX = CINT(FAC!)  ' RT3F_77
L_6BB0: DI = BX
L_6BB2: DI = DI * (2 ^ 1)
L_6BB4: DI = DI * (2 ^ 1)
L_6BB6: DI = DI + &H1850
L_6BBA: BX = DI
L_6BBC: DI = &HA6E4
L_6BBF: SI = &HA68E
L_6BC2: N_A6E4! = N_A68E!  ' RT3F_7B
L_6BC5: DI = &HA6E8
L_6BC8: SI = &HA5C4
L_6BCB: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6BCE: WORD(BP - 8) = BX
L_6BD1: GOSUB L_0797
L_6BD4: DI = WORD(BP - 8)
L_6BD7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6BDA: DI = &H4F6C
L_6BDD: SI = &HA5C4
L_6BE0: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_6BE3: DI = &HA5C4
L_6BE6: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_6BE9: SI = DI
L_6BEB: DI = &HA5CC
L_6BEE: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_6BF1: IF CompareLeft! > CompareRight! THEN GOTO L_6BF6  ' flags from L_6BEE
L_6BF3: GOTO L_6AB4
L_6BF6: SI = &HAFD0
L_6BF9: FAC! = N_AFD0!: DI = &H001E  ' RT3F_6F
L_6BFC: GOTO L_6C85
L_6BFF: ' Alignment NOP
L_6C00: SI = &HA5C4
L_6C03: BX = SI
L_6C05: DX = BX
L_6C07: BX = CINT(N_A5C4!)  ' RT3F_75
L_6C0A: SI = BX
L_6C0C: SI = SI * (2 ^ 1)
L_6C0E: SI = SI * (2 ^ 1)
L_6C10: SI = SI + &H1850
L_6C14: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_6C17: BX = 0
L_6C1A: IF CompareLeft! <= CompareRight! THEN GOTO L_6C1D  ' flags from L_6C14
L_6C1C: BX = BX - 1
L_6C1D: SI = DX
L_6C1F: DI = &HA5C0
L_6C22: FAC! = N(SI) + N_A5C0!  ' RT3F_7F
L_6C25: DX = BX
L_6C27: BX = CINT(FAC!)  ' RT3F_77
L_6C2A: SI = BX
L_6C2C: SI = SI * (2 ^ 1)
L_6C2E: SI = SI * (2 ^ 1)
L_6C30: SI = SI + &H1850
L_6C34: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_6C37: BX = 0
L_6C3A: IF CompareLeft! >= CompareRight! THEN GOTO L_6C3D  ' flags from L_6C34
L_6C3C: BX = BX - 1
L_6C3D: BX = BX AND DX
L_6C3F: CompareLeft% = BX: CompareRight% = 0
L_6C41: IF CompareLeft% <> CompareRight% THEN GOTO L_6C46  ' flags from L_6C3F
L_6C43: GOTO L_6C7C
L_6C46: DI = &H4F6C
L_6C49: BX = SI
L_6C4B: SI = &HAB7A
L_6C4E: FAC! = N_AB7A! + N_4F6C!  ' RT3F_7F
L_6C51: DI = SI
L_6C53: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6C56: SI = BX
L_6C58: DI = &HA848
L_6C5B: CompareLeft! = N(SI): CompareRight! = N_A848!  ' RT3F_9F
L_6C5E: DX = 0
L_6C61: IF CompareLeft! <> CompareRight! THEN GOTO L_6C64  ' flags from L_6C5B
L_6C63: DX = DX - 1
L_6C64: SWAP DX, BX
L_6C66: FAC! = CSNG(BX)  ' RT3F_57
L_6C69: SI = &HA858
L_6C6C: FAC! = N_A858! - FAC!  ' RT3F_9B
L_6C6F: DI = SI
L_6C71: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6C74: DI = DX
L_6C76: SI = &HA874
L_6C79: N(DI) = N_A874!  ' RT3F_7B
L_6C7C: DI = &HA840
L_6C7F: SI = &HA5C4
L_6C82: FAC! = N_A5C4! + N_A840!  ' RT3F_7F
L_6C85: DI = &HA5C4
L_6C88: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_6C8B: SI = DI
L_6C8D: DI = &HAFE0
L_6C90: CompareLeft! = N_A5C4!: CompareRight! = N_AFE0!  ' RT3F_9F
L_6C93: IF CompareLeft! > CompareRight! THEN GOTO L_6C98  ' flags from L_6C90
L_6C95: GOTO L_6C00
L_6C98: DI = &HBA36
L_6C9B: SI = &HAB7A
L_6C9E: N_BA36! = N_AB7A!  ' RT3F_7B
L_6CA1: DI = &H4F6C
L_6CA4: SI = &HA858
L_6CA7: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_6CAA: GOTO L_6CDA
L_6CAD: ' Alignment NOP
L_6CAE: FAC! = RND  ' RT3D_34
L_6CB1: DI = &HA6EC
L_6CB4: FAC! = FAC! * N_A6EC!  ' RT3F_91
L_6CB7: DI = &HB95E
L_6CBA: CompareLeft! = FAC!: CompareRight! = N_B95E!  ' RT3F_A1
L_6CBD: BX = 0
L_6CC0: IF CompareLeft! >= CompareRight! THEN GOTO L_6CC3  ' flags from L_6CBA
L_6CC2: BX = BX - 1
L_6CC3: FAC! = CSNG(BX)  ' RT3F_57
L_6CC6: SI = &HA858
L_6CC9: FAC! = N_A858! - FAC!  ' RT3F_9B
L_6CCC: DI = SI
L_6CCE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6CD1: DI = &H4F6C
L_6CD4: SI = &HA5C4
L_6CD7: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_6CDA: DI = &HA5C4
L_6CDD: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_6CE0: SI = DI
L_6CE2: DI = &HBA36
L_6CE5: CompareLeft! = N_A5C4!: CompareRight! = N_BA36!  ' RT3F_9F
L_6CE8: IF CompareLeft! <= CompareRight! THEN GOTO L_6CAE  ' flags from L_6CE5
L_6CEA: DI = &HA83C
L_6CED: SI = &HA858
L_6CF0: FAC! = N_A858! * N_A83C!  ' RT3F_8F
L_6CF3: DI = &HAA4C
L_6CF6: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_6CF9: BX = DI
L_6CFB: DI = &HA704
L_6CFE: SI = &HA860
L_6D01: N_A704! = N_A860!  ' RT3F_7B
L_6D04: GOSUB L_07E8
L_6D07: DI = &HAA4C
L_6D0A: CompareLeft! = FAC!: CompareRight! = N_AA4C!  ' RT3F_A1
L_6D0D: IF CompareLeft! < CompareRight! THEN GOTO L_6D12  ' flags from L_6D0A
L_6D0F: GOTO L_6D26
L_6D12: BX = DI
L_6D14: DI = &HA704
L_6D17: SI = &HA860
L_6D1A: N_A704! = N_A860!  ' RT3F_7B
L_6D1D: GOSUB L_07E8
L_6D20: DI = &HAA4C
L_6D23: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_6D26: BX = &H11
L_6D29: ARGPUSH BX  ' RT3E_42
L_6D2C: BX = 2
L_6D2F: LOCATE ARGS(), BX  ' RT3E_44
L_6D32: ' PRINT statement begins (screen) ; RT3F_BC
L_6D35: SI = &HA9FE
L_6D38: DX = BX
L_6D3A: BX = CINT(N_A9FE!)  ' RT3F_75
L_6D3D: BX = BX * (2 ^ 1)
L_6D3F: BX = BX * (2 ^ 1)
L_6D41: BX = BX + &H4288
L_6D45: PRINT S(BX);  ' RT3F_6A
L_6D48: BX = &HBA3A
L_6D4B: PRINT S_BA3A$;  ' RT3F_6A
L_6D4E: DI = &HA858
L_6D51: SI = &HAB7A
L_6D54: FAC! = N_AB7A! - N_A858!  ' RT3F_97
L_6D57: BX = &H1A
L_6D5A: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_6D5D: BX = &HBA44
L_6D60: PRINT S_BA44$  ' RT3F_6E; H newline item, ledger correction
L_6D63: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6D66: BX = &H13
L_6D69: ARGPUSH BX  ' RT3E_42
L_6D6C: BX = DX
L_6D6E: LOCATE ARGS(), BX  ' RT3E_44
L_6D71: ' PRINT statement begins (screen) ; RT3F_BC
L_6D74: BX = &HBA50
L_6D77: PRINT S_BA50$;  ' RT3F_6A
L_6D7A: BX = DI
L_6D7C: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_6D7F: BX = &HBA64
L_6D82: PRINT S_BA64$  ' RT3F_6E; H newline item, ledger correction
L_6D85: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6D88: BX = &H15
L_6D8B: ARGPUSH BX  ' RT3E_42
L_6D8E: BX = DX
L_6D90: LOCATE ARGS(), BX  ' RT3E_44
L_6D93: ' PRINT statement begins (screen) ; RT3F_BC
L_6D96: BX = &HBA70
L_6D99: PRINT S_BA70$;  ' RT3F_6A
L_6D9C: BX = &HAA4C
L_6D9F: PRINT N_AA4C!;  ' RT3F_67; H expanded ledger
L_6DA2: DX = BX
L_6DA4: BX = &HBA80
L_6DA7: PRINT S_BA80$  ' RT3F_6E; H newline item, ledger correction
L_6DAA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6DAD: SI = DX
L_6DAF: FAC! = -N(SI)  ' RT3F_AF
L_6DB2: DI = DX
L_6DB4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6DB7: GOSUB L_1E98
L_6DBA: BX = &H18
L_6DBD: ARGPUSH BX  ' RT3E_42
L_6DC0: BX = 2
L_6DC3: LOCATE ARGS(), BX  ' RT3E_44
L_6DC6: GOSUB L_20DD
L_6DC9: GOTO L_6686
L_6DCC: GOSUB L_2352
L_6DCF: BX = &H12
L_6DD2: ARGPUSH BX  ' RT3E_42
L_6DD5: BX = 2
L_6DD8: LOCATE ARGS(), BX  ' RT3E_44
L_6DDB: ' PRINT statement begins (screen) ; RT3F_BC
L_6DDE: BX = &HBA8C
L_6DE1: PRINT S_BA8C$;  ' RT3F_6A
L_6DE4: BX = &H192C
L_6DE7: PRINT N_192C!;  ' RT3F_67; H expanded ledger
L_6DEA: BX = &HBA9E
L_6DED: PRINT S_BA9E$  ' RT3F_6E; H newline item, ledger correction
L_6DF0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6DF3: BX = &H14
L_6DF6: ARGPUSH BX  ' RT3E_42
L_6DF9: BX = 2
L_6DFC: LOCATE ARGS(), BX  ' RT3E_44
L_6DFF: ' PRINT statement begins (screen) ; RT3F_BC

```

### Sickbay and clones

```basic
L_6E02: BX = &HBAAE
L_6E05: PRINT S_BAAE$;  ' RT3F_6A
L_6E08: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6E0B: GOSUB L_24EB
L_6E0E: BX = WORD(&HAE70)
L_6E12: FAC! = CSNG(BX)  ' RT3F_57
L_6E15: SI = &H192C
L_6E18: FAC! = N_192C! - FAC!  ' RT3F_9B
L_6E1B: DI = &HAB7A
L_6E1E: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_6E21: SI = DI
L_6E23: CompareLeft! = N_AB7A!: CompareRight! = 0  ' RT3F_A7
L_6E26: IF CompareLeft! < CompareRight! THEN GOTO L_6E2B  ' flags from L_6E23
L_6E28: GOTO L_6E31
L_6E2B: SI = &HB050
L_6E2E: N(DI) = N_B050!  ' RT3F_7B
L_6E31: BX = &HAB7A
L_6E34: FAC! = INT(N_AB7A!)  ' RT3D_03
L_6E37: DI = &H192C
L_6E3A: N_192C! = FAC!: SI = &H001A  ' RT3F_7D
L_6E3D: GOSUB L_20B6
L_6E40: GOTO L_667D
L_6E43: GOSUB L_2352
L_6E46: GOSUB L_646D
L_6E49: BX = &H10
L_6E4C: ARGPUSH BX  ' RT3E_42
L_6E4F: BX = 8
L_6E52: LOCATE ARGS(), BX  ' RT3E_44
L_6E55: ' PRINT statement begins (screen) ; RT3F_BC
L_6E58: BX = &HBAC4
L_6E5B: PRINT S_BAC4$  ' RT3F_6E; H newline item, ledger correction
L_6E5E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6E61: BX = &H12
L_6E64: ARGPUSH BX  ' RT3E_42
L_6E67: BX = 2
L_6E6A: LOCATE ARGS(), BX  ' RT3E_44
L_6E6D: ' PRINT statement begins (screen) ; RT3F_BC
L_6E70: DX = BX
L_6E72: BX = &HBAD0
L_6E75: PRINT S_BAD0$  ' RT3F_6E; H newline item, ledger correction
L_6E78: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6E7B: BX = &H13
L_6E7E: ARGPUSH BX  ' RT3E_42
L_6E81: BX = DX
L_6E83: LOCATE ARGS(), BX  ' RT3E_44
L_6E86: ' PRINT statement begins (screen) ; RT3F_BC
L_6E89: BX = &HBAE2
L_6E8C: PRINT S_BAE2$  ' RT3F_6E; H newline item, ledger correction
L_6E8F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6E92: BX = &H14
L_6E95: ARGPUSH BX  ' RT3E_42
L_6E98: BX = DX
L_6E9A: LOCATE ARGS(), BX  ' RT3E_44
L_6E9D: ' PRINT statement begins (screen) ; RT3F_BC
L_6EA0: BX = &HBAF8
L_6EA3: PRINT S_BAF8$  ' RT3F_6E; H newline item, ledger correction
L_6EA6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6EA9: BX = &H15
L_6EAC: ARGPUSH BX  ' RT3E_42
L_6EAF: BX = DX
L_6EB1: LOCATE ARGS(), BX  ' RT3E_44
L_6EB4: ' PRINT statement begins (screen) ; RT3F_BC
L_6EB7: BX = &HBB08
L_6EBA: PRINT S_BB08$  ' RT3F_6E; H newline item, ledger correction
L_6EBD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6EC0: DI = &HAE0E
L_6EC3: SI = &HA676
L_6EC6: N_AE0E! = N_A676!  ' RT3F_7B
L_6EC9: GOSUB L_1E7C
L_6ECC: DI = &HAE2E
L_6ECF: SI = &HAE16
L_6ED2: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_6ED5: IF CompareLeft! <> CompareRight! THEN GOTO L_6EDA  ' flags from L_6ED2
L_6ED7: GOTO L_234F
L_6EDA: DI = &HAE22
L_6EDD: SI = &HAE16
L_6EE0: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_6EE3: IF CompareLeft! = CompareRight! THEN GOTO L_6EC9  ' flags from L_6EE0
L_6EE5: SI = &HAE16
L_6EE8: BX = CINT(N_AE16!)  ' RT3F_75
L_6EEB: ON BX GOTO L_6EF7, L_7058, L_71E0, L_72FC  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_6EF7: GOSUB L_2352
L_6EFA: SI = &H4F6C
L_6EFD: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_6F00: GOTO L_7033
L_6F03: ' Alignment NOP
L_6F04: DI = &HA672
L_6F07: SI = &HA5C4
L_6F0A: FAC! = N_A5C4! + N_A672!  ' RT3F_7F
L_6F0D: BX = DI
L_6F0F: DI = &HA858
L_6F12: DX = SI
L_6F14: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_6F17: SI = DI
L_6F19: CX = BX
L_6F1B: BX = CINT(N_A858!)  ' RT3F_75
L_6F1E: ARGPUSH BX  ' RT3E_42
L_6F21: AX = BX
L_6F23: BX = 2
L_6F26: LOCATE ARGS(), BX  ' RT3E_44
L_6F29: DI = &HA6E4
L_6F2C: SI = &HBB24
L_6F2F: N_A6E4! = N_BB24!  ' RT3F_7B
L_6F32: SWAP DX, SI
L_6F34: BX = DI
L_6F36: DI = &HA6E8
L_6F39: N_A6E8! = N(SI)  ' RT3F_7B
L_6F3C: WORD(BP - 6) = AX
L_6F3F: GOSUB L_0797
L_6F42: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_6F45: IF CompareLeft! > CompareRight! THEN GOTO L_6F4A  ' flags from L_6F42
L_6F47: GOTO L_702A
L_6F4A: ' PRINT statement begins (screen) ; RT3F_BC
L_6F4D: SI = &HA5C4
L_6F50: BX = SI
L_6F52: DX = BX
L_6F54: BX = CINT(N_A5C4!)  ' RT3F_75
L_6F57: BX = BX * (2 ^ 1)
L_6F59: BX = BX * (2 ^ 1)
L_6F5B: BX = BX + &H4288
L_6F5F: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_6F62: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6F65: BX = WORD(BP - 6)
L_6F68: ARGPUSH BX  ' RT3E_42
L_6F6B: CX = BX
L_6F6D: BX = &HD
L_6F70: LOCATE ARGS(), BX  ' RT3E_44
L_6F73: ' PRINT statement begins (screen) ; RT3F_BC
L_6F76: BX = &HBB28
L_6F79: PRINT S_BB28$;  ' RT3F_6A
L_6F7C: DI = &HA6E4
L_6F7F: SI = &HA672
L_6F82: N_A6E4! = N_A672!  ' RT3F_7B
L_6F85: SI = DX
L_6F87: BX = DI
L_6F89: DI = &HA6E8
L_6F8C: N_A6E8! = N(SI)  ' RT3F_7B
L_6F8F: GOSUB L_0797
L_6F92: BX = &H1A
L_6F95: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_6F98: BX = &HBB2E
L_6F9B: PRINT S_BB2E$;  ' RT3F_6A
L_6F9E: DI = &HA6E4
L_6FA1: SI = &HA97C
L_6FA4: N_A6E4! = N_A97C!  ' RT3F_7B
L_6FA7: BX = DI
L_6FA9: DI = &HA6E8
L_6FAC: SI = &HA5C4
L_6FAF: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6FB2: GOSUB L_0797
L_6FB5: BX = &H1A
L_6FB8: PRINT FAC!  ' RT3F_6B
L_6FBB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6FBE: BX = WORD(BP - 6)
L_6FC1: ARGPUSH BX  ' RT3E_42
L_6FC4: DX = BX
L_6FC6: BX = &H18
L_6FC9: LOCATE ARGS(), BX  ' RT3E_44
L_6FCC: ' PRINT statement begins (screen) ; RT3F_BC
L_6FCF: DI = &HA6E4
L_6FD2: SI = &HA86C
L_6FD5: N_A6E4! = N_A86C!  ' RT3F_7B
L_6FD8: BX = DI
L_6FDA: DI = &HA6E8
L_6FDD: SI = &HA5C4
L_6FE0: N_A6E8! = N_A5C4!  ' RT3F_7B
L_6FE3: GOSUB L_0797
L_6FE6: BX = CINT(FAC!)  ' RT3F_77
L_6FE9: BX = BX * (2 ^ 1)
L_6FEB: BX = BX * (2 ^ 1)
L_6FED: BX = BX + &HA4E8
L_6FF1: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_6FF4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_6FF7: BX = WORD(BP - 6)
L_6FFA: ARGPUSH BX  ' RT3E_42
L_6FFD: BX = &H1E
L_7000: LOCATE ARGS(), BX  ' RT3E_44
L_7003: ' PRINT statement begins (screen) ; RT3F_BC
L_7006: BX = &HBB18
L_7009: PRINT S_BB18$;  ' RT3F_6A
L_700C: DI = &HA6E4
L_700F: SI = &HA85C
L_7012: N_A6E4! = N_A85C!  ' RT3F_7B
L_7015: DI = &HA6E8
L_7018: SI = &HA5C4
L_701B: N_A6E8! = N_A5C4!  ' RT3F_7B
L_701E: GOSUB L_0797
L_7021: BX = &H1A
L_7024: PRINT FAC!  ' RT3F_6B
L_7027: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_702A: DI = &H4F6C
L_702D: SI = &HA5C4
L_7030: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_7033: DI = &HA5C4
L_7036: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7039: SI = DI
L_703B: DI = &HA5CC
L_703E: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_7041: IF CompareLeft! > CompareRight! THEN GOTO L_7046  ' flags from L_703E
L_7043: GOTO L_6F04
L_7046: BX = &H18
L_7049: ARGPUSH BX  ' RT3E_42
L_704C: BX = &HA
L_704F: LOCATE ARGS(), BX  ' RT3E_44
L_7052: GOSUB L_20DD
L_7055: GOTO L_6E43
L_7058: GOSUB L_2352
L_705B: BX = &H14
L_705E: ARGPUSH BX  ' RT3E_42
L_7061: BX = 2
L_7064: LOCATE ARGS(), BX  ' RT3E_44
L_7067: DI = &HBB34
L_706A: SI = &HA66E
L_706D: N_BB34! = N_A66E!  ' RT3F_7B
L_7070: SI = &H4F6C
L_7073: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_7076: GOTO L_719C
L_7079: ' Alignment NOP
L_707A: DI = &HA6E4
L_707D: SI = &HA86C
L_7080: N_A6E4! = N_A86C!  ' RT3F_7B
L_7083: DI = &HA6E8
L_7086: SI = &HA5C4
L_7089: N_A6E8! = N_A5C4!  ' RT3F_7B
L_708C: GOSUB L_0797
L_708F: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_7092: IF CompareLeft! <> CompareRight! THEN GOTO L_7097  ' flags from L_708F
L_7094: GOTO L_7193
L_7097: FAC! = RND  ' RT3D_34
L_709A: T_00! = FAC!  ' RT3F_71; inline=&H80
L_709E: FAC! = RND  ' RT3D_34
L_70A1: FAC! = T_00! * FAC!  ' RT3F_95; inline=&H80
L_70A5: DI = &HA6E4
L_70A8: SI = &HA97C
L_70AB: N_A6E4! = N_A97C!  ' RT3F_7B
L_70AE: BX = DI
L_70B0: DI = &HA6E8
L_70B3: DX = SI
L_70B5: SI = &HA5C4
L_70B8: N_A6E8! = N_A5C4!  ' RT3F_7B
L_70BB: T_01! = FAC!  ' RT3F_71; inline=&H81
L_70BF: GOSUB L_0797
L_70C2: DI = &HA6E4
L_70C5: SI = &HA672
L_70C8: N_A6E4! = N_A672!  ' RT3F_7B
L_70CB: BX = DI
L_70CD: DI = &HA6E8
L_70D0: DX = SI
L_70D2: SI = &HA5C4
L_70D5: N_A6E8! = N_A5C4!  ' RT3F_7B
L_70D8: T_02! = FAC!  ' RT3F_71; inline=&H82
L_70DC: GOSUB L_0797
L_70DF: FAC! = T_02! - FAC!  ' RT3F_9D; inline=&H82
L_70E3: FAC! = T_01! * FAC!  ' RT3F_95; inline=&H81
L_70E7: DI = &HA9F6
L_70EA: N_A9F6! = FAC!: SI = &H001A  ' RT3F_7D
L_70ED: DI = &HA6F8
L_70F0: SI = &HA672
L_70F3: N_A6F8! = N_A672!  ' RT3F_7B
L_70F6: DI = &HA6FC
L_70F9: SI = &HA5C4
L_70FC: N_A6FC! = N_A5C4!  ' RT3F_7B
L_70FF: GOSUB L_07C9
L_7102: BX = CINT(FAC!)  ' RT3F_77
L_7105: DI = BX
L_7107: DI = DI * (2 ^ 1)
L_7109: DI = DI * (2 ^ 1)
L_710B: DI = DI + &H1850
L_710F: BX = DI
L_7111: DI = &HA6E4
L_7114: SI = &HA97C
L_7117: N_A6E4! = N_A97C!  ' RT3F_7B
L_711A: DI = &HA6E8
L_711D: SI = &HA5C4
L_7120: N_A6E8! = N_A5C4!  ' RT3F_7B
L_7123: WORD(BP - 6) = BX
L_7126: GOSUB L_0797
L_7129: DI = WORD(BP - 6)
L_712C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_712F: DI = &HA6E4
L_7132: SI = &HA86C
L_7135: N_A6E4! = N_A86C!  ' RT3F_7B
L_7138: DI = &HA6E8
L_713B: BX = SI
L_713D: SI = &HA5C4
L_7140: N_A6E8! = N_A5C4!  ' RT3F_7B
L_7143: GOSUB L_0797
L_7146: DI = &H4F94
L_7149: CompareLeft! = FAC!: CompareRight! = N_4F94!  ' RT3F_A1
L_714C: IF CompareLeft! = CompareRight! THEN GOTO L_7151  ' flags from L_7149
L_714E: GOTO L_7182
L_7151: DI = &HA9F6
L_7154: SI = &HA85C
L_7157: N_A9F6! = N_A85C!  ' RT3F_7B
L_715A: DI = &HA6F8
L_715D: SI = &HA86C
L_7160: N_A6F8! = N_A86C!  ' RT3F_7B
L_7163: DI = &HA6FC
L_7166: SI = &HA5C4
L_7169: N_A6FC! = N_A5C4!  ' RT3F_7B
L_716C: GOSUB L_07C9
L_716F: BX = CINT(FAC!)  ' RT3F_77
L_7172: DI = BX
L_7174: DI = DI * (2 ^ 1)
L_7176: DI = DI * (2 ^ 1)
L_7178: DI = DI + &H1850
L_717C: SI = &H4F6C
L_717F: N(DI) = N_4F6C!  ' RT3F_7B
L_7182: DI = &HBB34
L_7185: SI = &HA9F6
L_7188: CompareLeft! = N_A9F6!: CompareRight! = N_BB34!  ' RT3F_9F
L_718B: IF CompareLeft! > CompareRight! THEN GOTO L_7190  ' flags from L_7188
L_718D: GOTO L_7193
L_7190: N(DI) = N(SI)  ' RT3F_7B
L_7193: DI = &H4F6C
L_7196: SI = &HA5C4
L_7199: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_719C: DI = &HA5C4
L_719F: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_71A2: SI = DI
L_71A4: DI = &HA5CC
L_71A7: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_71AA: IF CompareLeft! > CompareRight! THEN GOTO L_71AF  ' flags from L_71A7
L_71AC: GOTO L_707A
L_71AF: ' PRINT statement begins (screen) ; RT3F_BC
L_71B2: BX = &HBB38
L_71B5: PRINT S_BB38$;  ' RT3F_6A
L_71B8: BX = &HBB34
L_71BB: FAC! = INT(N_BB34!)  ' RT3D_03
L_71BE: DX = BX
L_71C0: BX = &H1A
L_71C3: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_71C6: BX = &HBB4C
L_71C9: PRINT S_BB4C$  ' RT3F_6E; H newline item, ledger correction
L_71CC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_71CF: SI = DX
L_71D1: DI = &HA9F6
L_71D4: N_A9F6! = N(SI)  ' RT3F_7B
L_71D7: GOSUB L_6A78
L_71DA: GOSUB L_20B6
L_71DD: GOTO L_6E43
L_71E0: BX = &HBB56
L_71E3: DX = &HAB72
L_71E6: S_AB72$ = S_BB56$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_71E9: GOSUB L_1F14
L_71EC: SI = &HA9FE
L_71EF: CompareLeft! = N_A9FE!: CompareRight! = 0  ' RT3F_A7
L_71F2: IF CompareLeft! <> CompareRight! THEN GOTO L_71F7  ' flags from L_71EF
L_71F4: GOTO L_6E43
L_71F7: DI = &HA6E4
L_71FA: SI = &HA86C
L_71FD: N_A6E4! = N_A86C!  ' RT3F_7B
L_7200: DI = &HA6E8
L_7203: SI = &HA9FE
L_7206: N_A6E8! = N_A9FE!  ' RT3F_7B
L_7209: GOSUB L_0797
L_720C: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_720F: BX = 0
L_7212: IF CompareLeft! <> CompareRight! THEN GOTO L_7215  ' flags from L_720C
L_7214: BX = BX - 1
L_7215: FAC! = CSNG(BX)  ' RT3F_57
L_7218: DI = &HBB68
L_721B: FAC! = FAC! * N_BB68!  ' RT3F_91
L_721E: SI = &HA708
L_7221: FAC! = N_A708! - FAC!  ' RT3F_9B
L_7224: DI = &HBB64
L_7227: N_BB64! = FAC!: SI = &H001A  ' RT3F_7D
L_722A: BX = DI
L_722C: DI = &HA704
L_722F: SI = &HAA44
L_7232: N_A704! = N_AA44!  ' RT3F_7B
L_7235: GOSUB L_07E8
L_7238: DI = &HBB64
L_723B: CompareLeft! = FAC!: CompareRight! = N_BB64!  ' RT3F_A1
L_723E: IF CompareLeft! < CompareRight! THEN GOTO L_7243  ' flags from L_723B
L_7240: GOTO L_7249
L_7243: GOSUB L_2687
L_7246: GOTO L_6E43
L_7249: SI = &HBB64
L_724C: FAC! = -N_BB64!  ' RT3F_AF
L_724F: DI = &HAA4C
L_7252: N_AA4C! = FAC!: SI = &H001A  ' RT3F_7D
L_7255: GOSUB L_1E98
L_7258: DI = &HA6F8
L_725B: SI = &HA85C
L_725E: N_A6F8! = N_A85C!  ' RT3F_7B
L_7261: DI = &HA6FC
L_7264: BX = SI
L_7266: SI = &HA9FE
L_7269: N_A6FC! = N_A9FE!  ' RT3F_7B
L_726C: GOSUB L_07C9
L_726F: BX = CINT(FAC!)  ' RT3F_77
L_7272: DI = BX
L_7274: DI = DI * (2 ^ 1)
L_7276: DI = DI * (2 ^ 1)
L_7278: DI = DI + &H1850
L_727C: BX = DI
L_727E: DI = &HA6E4
L_7281: SI = &HA85C
L_7284: N_A6E4! = N_A85C!  ' RT3F_7B
L_7287: DX = DI
L_7289: DI = &HA6E8
L_728C: CX = SI
L_728E: SI = &HA9FE
L_7291: N_A6E8! = N_A9FE!  ' RT3F_7B
L_7294: WORD(BP - 6) = BX
L_7297: GOSUB L_0797
L_729A: DI = &HA6E4
L_729D: SI = &HA85C
L_72A0: N_A6E4! = N_A85C!  ' RT3F_7B
L_72A3: DI = &HA6E8
L_72A6: SI = &HA9FE
L_72A9: N_A6E8! = N_A9FE!  ' RT3F_7B
L_72AC: T_00! = FAC!  ' RT3F_71; inline=&H80
L_72B0: GOSUB L_0797
L_72B3: DI = &HA854
L_72B6: CompareLeft! = FAC!: CompareRight! = N_A854!  ' RT3F_A1
L_72B9: BX = 0
L_72BC: IF CompareLeft! >= CompareRight! THEN GOTO L_72BF  ' flags from L_72B6
L_72BE: BX = BX - 1
L_72BF: FAC! = CSNG(BX)  ' RT3F_57
L_72C2: FAC! = T_00! - FAC!  ' RT3F_9D; inline=&H80
L_72C6: DI = WORD(BP - 6)
L_72C9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_72CC: GOSUB L_2352
L_72CF: BX = &H14
L_72D2: ARGPUSH BX  ' RT3E_42
L_72D5: BX = 2
L_72D8: LOCATE ARGS(), BX  ' RT3E_44
L_72DB: ' PRINT statement begins (screen) ; RT3F_BC
L_72DE: BX = &HBB6C
L_72E1: PRINT S_BB6C$;  ' RT3F_6A
L_72E4: BX = &HBB64
L_72E7: PRINT N_BB64!;  ' RT3F_67; H expanded ledger
L_72EA: BX = &HBB7C
L_72ED: PRINT S_BB7C$  ' RT3F_6E; H newline item, ledger correction
L_72F0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_72F3: GOSUB L_20B6
L_72F6: GOSUB L_20B6
L_72F9: GOTO L_6E43
L_72FC: DI = &HAA2C
L_72FF: SI = &HA66E
L_7302: N_AA2C! = N_A66E!  ' RT3F_7B
L_7305: SI = &H4F6C
L_7308: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_730B: GOTO L_74D6
L_730E: DI = &HA6E4
L_7311: SI = &HA86C
L_7314: N_A6E4! = N_A86C!  ' RT3F_7B
L_7317: BX = DI
L_7319: DI = &HA6E8
L_731C: SI = &HA5C4
L_731F: N_A6E8! = N_A5C4!  ' RT3F_7B
L_7322: GOSUB L_0797
L_7325: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_7328: BX = 0
L_732B: IF CompareLeft! = CompareRight! THEN GOTO L_732E  ' flags from L_7325
L_732D: BX = BX - 1
L_732E: DI = &HA6E4
L_7331: SI = &HA85C
L_7334: N_A6E4! = N_A85C!  ' RT3F_7B
L_7337: DX = DI
L_7339: DI = &HA6E8
L_733C: SI = &HA5C4
L_733F: N_A6E8! = N_A5C4!  ' RT3F_7B
L_7342: WORD(BP - 6) = BX
L_7345: GOSUB L_0797
L_7348: DI = &H4F6C
L_734B: CompareLeft! = FAC!: CompareRight! = N_4F6C!  ' RT3F_A1
L_734E: BX = 0
L_7351: IF CompareLeft! >= CompareRight! THEN GOTO L_7354  ' flags from L_734B
L_7353: BX = BX - 1
L_7354: BX = BX OR WORD(BP - 6)
L_7357: DX = DI
L_7359: DI = &HA6E4
L_735C: SI = &HA66E
L_735F: N_A6E4! = N_A66E!  ' RT3F_7B
L_7362: DI = &HA6E8
L_7365: SI = &HA5C4
L_7368: N_A6E8! = N_A5C4!  ' RT3F_7B
L_736B: WORD(BP - 8) = BX
L_736E: GOSUB L_0797
L_7371: DI = &H4F6C
L_7374: CompareLeft! = FAC!: CompareRight! = N_4F6C!  ' RT3F_A1
L_7377: BX = 0
L_737A: IF CompareLeft! >= CompareRight! THEN GOTO L_737D  ' flags from L_7374
L_737C: BX = BX - 1
L_737D: BX = BX OR WORD(BP - 8)
L_7380: CompareLeft% = BX: CompareRight% = 0
L_7382: IF CompareLeft% = CompareRight% THEN GOTO L_7387  ' flags from L_7380
L_7384: GOTO L_74CD
L_7387: DI = &HAA2C
L_738A: SI = &H4F6C
L_738D: N_AA2C! = N_4F6C!  ' RT3F_7B
L_7390: DI = &HA6F8
L_7393: SI = &HA85C
L_7396: N_A6F8! = N_A85C!  ' RT3F_7B
L_7399: DI = &HA6FC
L_739C: BX = SI
L_739E: SI = &HA5C4
L_73A1: N_A6FC! = N_A5C4!  ' RT3F_7B
L_73A4: GOSUB L_07C9
L_73A7: BX = CINT(FAC!)  ' RT3F_77
L_73AA: DI = BX
L_73AC: DI = DI * (2 ^ 1)
L_73AE: DI = DI * (2 ^ 1)
L_73B0: DI = DI + &H1850
L_73B4: BX = DI
L_73B6: DI = &HA6E4
L_73B9: SI = &HA85C
L_73BC: N_A6E4! = N_A85C!  ' RT3F_7B
L_73BF: DI = &HA6E8
L_73C2: SI = &HA5C4
L_73C5: N_A6E8! = N_A5C4!  ' RT3F_7B
L_73C8: WORD(BP - 6) = BX
L_73CB: GOSUB L_0797
L_73CE: DI = &HA844
L_73D1: FAC! = FAC! + N_A844!  ' RT3F_81
L_73D4: DI = WORD(BP - 6)
L_73D7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_73DA: SI = &HB050
L_73DD: FAC! = N_B050!: DI = &H001E  ' RT3F_6F
L_73E0: GOTO L_7457
L_73E3: ' Alignment NOP
L_73E4: DI = &HA6F8
L_73E7: SI = &HA858
L_73EA: N_A6F8! = N_A858!  ' RT3F_7B
L_73ED: DI = &HA6FC
L_73F0: BX = SI
L_73F2: SI = &HA5C4
L_73F5: N_A6FC! = N_A5C4!  ' RT3F_7B
L_73F8: GOSUB L_07C9
L_73FB: BX = CINT(FAC!)  ' RT3F_77
L_73FE: DI = BX
L_7400: DI = DI * (2 ^ 1)
L_7402: DI = DI * (2 ^ 1)
L_7404: DI = DI + &H1850
L_7408: FAC! = RND  ' RT3D_34
L_740B: BX = DI
L_740D: DI = &HA6F4
L_7410: FAC! = FAC! * N_A6F4!  ' RT3F_91
L_7413: DI = &HBB88
L_7416: FAC! = FAC! + N_BB88!  ' RT3F_81
L_7419: DI = &HA6E4
L_741C: SI = &HA858
L_741F: N_A6E4! = N_A858!  ' RT3F_7B
L_7422: DI = &HA6E8
L_7425: DX = SI
L_7427: SI = &HA5C4
L_742A: N_A6E8! = N_A5C4!  ' RT3F_7B
L_742D: T_00! = FAC!  ' RT3F_71; inline=&H80
L_7431: WORD(BP - 6) = BX
L_7434: GOSUB L_0797
L_7437: FAC! = T_00! * FAC!  ' RT3F_95; inline=&H80
L_743B: DI = &H4F6C
L_743E: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_7441: BX = &H1A
L_7444: FAC! = INT(FAC!)  ' RT3D_03
L_7447: BX = DI
L_7449: DI = WORD(BP - 6)
L_744C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_744F: DI = BX
L_7451: SI = &HA858
L_7454: FAC! = N_A858! + N(DI)  ' RT3F_7F
L_7457: DI = &HA858
L_745A: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_745D: SI = DI
L_745F: DI = &HA696
L_7462: CompareLeft! = N_A858!: CompareRight! = N_A696!  ' RT3F_9F
L_7465: IF CompareLeft! > CompareRight! THEN GOTO L_746A  ' flags from L_7462
L_7467: GOTO L_73E4
L_746A: DI = &HA6F8
L_746D: SI = &HA86C
L_7470: N_A6F8! = N_A86C!  ' RT3F_7B
L_7473: DI = &HA6FC
L_7476: SI = &HA5C4
L_7479: N_A6FC! = N_A5C4!  ' RT3F_7B
L_747C: GOSUB L_07C9
L_747F: BX = CINT(FAC!)  ' RT3F_77
L_7482: DI = BX
L_7484: DI = DI * (2 ^ 1)
L_7486: DI = DI * (2 ^ 1)
L_7488: DI = DI + &H1850
L_748C: SI = &H4F6C
L_748F: N(DI) = N_4F6C!  ' RT3F_7B
L_7492: GOSUB L_2352
L_7495: BX = &H14
L_7498: ARGPUSH BX  ' RT3E_42
L_749B: BX = 2
L_749E: LOCATE ARGS(), BX  ' RT3E_44
L_74A1: ' PRINT statement begins (screen) ; RT3F_BC
L_74A4: SI = &HA5C4
L_74A7: BX = CINT(N_A5C4!)  ' RT3F_75
L_74AA: BX = BX * (2 ^ 1)
L_74AC: BX = BX * (2 ^ 1)
L_74AE: BX = BX + &H4288
L_74B2: PRINT S(BX);  ' RT3F_6A
L_74B5: BX = &HBB8C
L_74B8: PRINT S_BB8C$  ' RT3F_6E; H newline item, ledger correction
L_74BB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_74BE: GOSUB L_20B6
L_74C1: DI = &HA9FE
L_74C4: SI = &HA5C4
L_74C7: N_A9FE! = N_A5C4!  ' RT3F_7B
L_74CA: GOSUB L_26A6
L_74CD: DI = &H4F6C
L_74D0: SI = &HA5C4
L_74D3: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_74D6: DI = &HA5C4
L_74D9: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_74DC: SI = DI
L_74DE: DI = &HA5CC
L_74E1: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_74E4: IF CompareLeft! > CompareRight! THEN GOTO L_74E9  ' flags from L_74E1
L_74E6: GOTO L_730E
L_74E9: SI = &HAA2C
L_74EC: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_74EF: IF CompareLeft! = CompareRight! THEN GOTO L_74F4  ' flags from L_74EC
L_74F1: GOTO L_7512
L_74F4: GOSUB L_2352
L_74F7: BX = &H14
L_74FA: ARGPUSH BX  ' RT3E_42
L_74FD: BX = 2

```

### Headquarters and missions

```basic
L_7500: LOCATE ARGS(), BX  ' RT3E_44
L_7503: ' PRINT statement begins (screen) ; RT3F_BC
L_7506: BX = &HBB9C
L_7509: PRINT S_BB9C$  ' RT3F_6E; H newline item, ledger correction
L_750C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_750F: GOSUB L_20B6
L_7512: GOTO L_6E43
L_7515: GOSUB L_2352
L_7518: BX = &H10
L_751B: ARGPUSH BX  ' RT3E_42
L_751E: BX = &HE
L_7521: LOCATE ARGS(), BX  ' RT3E_44
L_7524: ' PRINT statement begins (screen) ; RT3F_BC
L_7527: BX = &HBBAC
L_752A: PRINT S_BBAC$  ' RT3F_6E; H newline item, ledger correction
L_752D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7530: BX = &H14
L_7533: ARGPUSH BX  ' RT3E_42
L_7536: BX = 2
L_7539: LOCATE ARGS(), BX  ' RT3E_44
L_753C: DI = &HAA2C
L_753F: SI = &HA66E
L_7542: N_AA2C! = N_A66E!  ' RT3F_7B
L_7545: SI = &HA9D0
L_7548: FAC! = N_A9D0!: DI = &H001E  ' RT3F_6F
L_754B: GOTO L_75B8
L_754E: SI = &HA5C4
L_7551: BX = SI
L_7553: DX = BX
L_7555: BX = CINT(N_A5C4!)  ' RT3F_75
L_7558: SI = BX
L_755A: SI = SI * (2 ^ 1)
L_755C: SI = SI * (2 ^ 1)
L_755E: SI = SI + &H1850
L_7562: DI = &H4F6C
L_7565: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_7568: IF CompareLeft! = CompareRight! THEN GOTO L_756D  ' flags from L_7565
L_756A: GOTO L_7586
L_756D: SI = DX
L_756F: DI = &HBBBC
L_7572: FAC! = N(SI) + N_BBBC!  ' RT3F_7F
L_7575: DI = &HAA2C
L_7578: N_AA2C! = FAC!: SI = &H001A  ' RT3F_7D
L_757B: DI = DX
L_757D: SI = &HA9D8
L_7580: N(DI) = N_A9D8!  ' RT3F_7B
L_7583: GOTO L_75AF
L_7586: SI = &HA5C4
L_7589: BX = CINT(N_A5C4!)  ' RT3F_75
L_758C: SI = BX
L_758E: SI = SI * (2 ^ 1)
L_7590: SI = SI * (2 ^ 1)
L_7592: SI = SI + &H1850
L_7596: DI = &H4F6C
L_7599: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_759C: IF CompareLeft! > CompareRight! THEN GOTO L_75A1  ' flags from L_7599
L_759E: GOTO L_75AF
L_75A1: DI = &HA844
L_75A4: SI = &HAA2C
L_75A7: FAC! = N_AA2C! + N_A844!  ' RT3F_7F
L_75AA: DI = SI
L_75AC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_75AF: DI = &H4F6C
L_75B2: SI = &HA5C4
L_75B5: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_75B8: DI = &HA5C4
L_75BB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_75BE: SI = DI
L_75C0: DI = &HA9D8
L_75C3: CompareLeft! = N_A5C4!: CompareRight! = N_A9D8!  ' RT3F_9F
L_75C6: IF CompareLeft! <= CompareRight! THEN GOTO L_754E  ' flags from L_75C3
L_75C8: SI = &HAA2C
L_75CB: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_75CE: IF CompareLeft! > CompareRight! THEN GOTO L_75D3  ' flags from L_75CB
L_75D0: GOTO L_775E
L_75D3: DI = &HA844
L_75D6: SI = &HAA2C
L_75D9: FAC! = N_AA2C! + N_A844!  ' RT3F_7F
L_75DC: DI = SI
L_75DE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_75E1: ' PRINT statement begins (screen) ; RT3F_BC
L_75E4: BX = &HBBC0
L_75E7: PRINT S_BBC0$  ' RT3F_6E; H newline item, ledger correction
L_75EA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_75ED: BX = &H15
L_75F0: ARGPUSH BX  ' RT3E_42
L_75F3: BX = 2
L_75F6: LOCATE ARGS(), BX  ' RT3E_44
L_75F9: ' PRINT statement begins (screen) ; RT3F_BC
L_75FC: BX = &HBBDE
L_75FF: PRINT S_BBDE$;  ' RT3F_6A
L_7602: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7605: GOSUB L_28BA
L_7608: SI = &HA838
L_760B: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_760E: IF CompareLeft! <> CompareRight! THEN GOTO L_7613  ' flags from L_760B
L_7610: GOTO L_234F
L_7613: BX = 0
L_7615: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_7618: DX = BX
L_761A: BX = &HBBF0
L_761D: AX = &H4F78
L_7620: BX = TEMP_DESC(S_4F78$ + S_BBF0$)  ' BX receives a temporary descriptor  ' RT3F_55
L_7623: SWAP BX, DX
L_7625: CX = BX
L_7627: BX = 1
L_762A: OPEN S(DX) FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_762D: DI = &HBBFC
L_7630: SI = &HAA2C
L_7633: N_BBFC! = N_AA2C!  ' RT3F_7B
L_7636: SI = &HA66E
L_7639: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_763C: GOTO L_76A3
L_763F: ' Alignment NOP
L_7640: BX = 1
L_7643: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_7646: InputTypes = [4, 4]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_764C: BX = &HBC00
L_764F: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_7652: BX = &HBC04
L_7655: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_7658: SI = &HBC08
L_765B: FAC! = N_BC08!: DI = &H001E  ' RT3F_6F
L_765E: GOTO L_768A
L_7661: ' Alignment NOP
L_7662: BX = 1
L_7665: InputSource = FILE(BX): InputFile% = BX  ' begin INPUT #InputFile%  ' RT3F_B6
L_7668: InputTypes = [2]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_766D: SI = &HA858
L_7670: BX = SI
L_7672: DX = BX
L_7674: BX = CINT(N_A858!)  ' RT3F_75
L_7677: BX = BX * (2 ^ 1)
L_7679: BX = BX * (2 ^ 1)
L_767B: BX = BX + &H1850
L_767F: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_7682: SI = DX
L_7684: DI = &H4F6C
L_7687: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_768A: DI = &HA858
L_768D: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_7690: SI = DI
L_7692: DI = &HBC0C
L_7695: CompareLeft! = N_A858!: CompareRight! = N_BC0C!  ' RT3F_9F
L_7698: IF CompareLeft! <= CompareRight! THEN GOTO L_7662  ' flags from L_7695
L_769A: DI = &H4F6C
L_769D: SI = &HA5C4
L_76A0: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_76A3: DI = &HA5C4
L_76A6: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_76A9: SI = DI
L_76AB: DI = &HBBFC
L_76AE: CompareLeft! = N_A5C4!: CompareRight! = N_BBFC!  ' RT3F_9F
L_76B1: IF CompareLeft! <= CompareRight! THEN GOTO L_7640  ' flags from L_76AE
L_76B3: DI = &H3BA4
L_76B6: SI = &H3B50
L_76B9: N_3BA4! = N_3B50!  ' RT3F_7B
L_76BC: DI = &H3BA8
L_76BF: SI = &H3B40
L_76C2: N_3BA8! = N_3B40!  ' RT3F_7B
L_76C5: BX = 1
L_76C8: CLOSE #BX  ' RT3E_21
L_76CB: GOSUB L_2352
L_76CE: SI = &HA66E
L_76D1: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_76D4: GOTO L_771D
L_76D7: ' Alignment NOP
L_76D8: DI = &HA97C
L_76DB: SI = &HA5C4
L_76DE: FAC! = N_A5C4! + N_A97C!  ' RT3F_7F
L_76E1: BX = SI
L_76E3: DX = BX
L_76E5: BX = CINT(FAC!)  ' RT3F_77
L_76E8: ARGPUSH BX  ' RT3E_42
L_76EB: BX = 2
L_76EE: LOCATE ARGS(), BX  ' RT3E_44
L_76F1: ' PRINT statement begins (screen) ; RT3F_BC
L_76F4: SI = DX
L_76F6: DI = &HA864
L_76F9: FAC! = N(SI) * N_A864!  ' RT3F_8F
L_76FC: DI = &H4F6C
L_76FF: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_7702: BX = CINT(FAC!)  ' RT3F_77
L_7705: SWAP BX, DX
L_7707: AX = BX
L_7709: BX = &HBC00
L_770C: CX = &H22
L_770F: BX = TEMP_DESC(MID$(S_BC00$, DX, CX))  ' BX receives a temporary descriptor  ' RT3D_0A
L_7712: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_7715: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7718: SI = AX
L_771A: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_771D: DI = &HA5C4
L_7720: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7723: SI = DI
L_7725: DI = &HA682
L_7728: CompareLeft! = N_A5C4!: CompareRight! = N_A682!  ' RT3F_9F
L_772B: IF CompareLeft! <= CompareRight! THEN GOTO L_76D8  ' flags from L_7728
L_772D: BX = &H18
L_7730: ARGPUSH BX  ' RT3E_42
L_7733: BX = 2
L_7736: LOCATE ARGS(), BX  ' RT3E_44
L_7739: GOSUB L_20DD
L_773C: BX = &H4F8A
L_773F: AX = &HBC04
L_7742: CompareLeft$ = S_BC04$: CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_7745: IF CompareLeft$ <> CompareRight$ THEN GOTO L_774A  ' flags from L_7742
L_7747: GOTO L_234F
L_774A: BX = &HBC04
L_774D: DX = &HBC00
L_7750: S_BC00$ = S_BC04$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_7753: DX = BX
L_7755: BX = &H4F8A
L_7758: S(DX) = S_4F8A$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_775B: GOTO L_76CB
L_775E: SI = &HAA2C
L_7761: FAC! = -N_AA2C!  ' RT3F_AF
L_7764: DI = SI
L_7766: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7769: SI = DI
L_776B: DI = &HB05C
L_776E: CompareLeft! = N(SI): CompareRight! = N_B05C!  ' RT3F_9F
L_7771: IF CompareLeft! >= CompareRight! THEN GOTO L_7776  ' flags from L_776E
L_7773: GOTO L_7785
L_7776: ' PRINT statement begins (screen) ; RT3F_BC
L_7779: BX = &HBC10
L_777C: PRINT S_BC10$  ' RT3F_6E; H newline item, ledger correction
L_777F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7782: GOTO L_779A
L_7785: ' PRINT statement begins (screen) ; RT3F_BC
L_7788: BX = &HBC38
L_778B: PRINT S_BC38$  ' RT3F_6E; H newline item, ledger correction
L_778E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7791: DI = &H3BB0
L_7794: SI = &HBC54
L_7797: N_3BB0! = N_BC54!  ' RT3F_7B
L_779A: GOSUB L_20B6
L_779D: GOSUB L_20B6
L_77A0: DI = &HB05C
L_77A3: SI = &HAA2C
L_77A6: CompareLeft! = N_AA2C!: CompareRight! = N_B05C!  ' RT3F_9F
L_77A9: IF CompareLeft! <> CompareRight! THEN GOTO L_77AE  ' flags from L_77A6
L_77AB: GOTO L_234F
L_77AE: DI = &HA5C0
L_77B1: SI = &HAA2C
L_77B4: FAC! = N_AA2C! * N_A5C0!  ' RT3F_8F
L_77B7: T_00! = FAC!  ' RT3F_71; inline=&H80
L_77BB: FAC! = RND  ' RT3D_34
L_77BE: BX = SI
L_77C0: FAC! = FAC! * N(DI)  ' RT3F_91
L_77C3: DX = BX
L_77C5: BX = &H1A
L_77C8: FAC! = INT(FAC!)  ' RT3D_03
L_77CB: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_77CF: DI = DX
L_77D1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_77D4: SI = DX
L_77D6: DI = &HA68E
L_77D9: CompareLeft! = N(SI): CompareRight! = N_A68E!  ' RT3F_9F
L_77DC: IF CompareLeft! > CompareRight! THEN GOTO L_77E1  ' flags from L_77D9
L_77DE: GOTO L_77E6
L_77E1: SWAP SI, DI
L_77E3: N(DI) = N(SI)  ' RT3F_7B
L_77E6: DI = &HA9D0
L_77E9: SI = &HAA2C
L_77EC: FAC! = N_AA2C! + N_A9D0!  ' RT3F_7F
L_77EF: BX = CINT(FAC!)  ' RT3F_77
L_77F2: DI = BX
L_77F4: DI = DI * (2 ^ 1)
L_77F6: DI = DI * (2 ^ 1)
L_77F8: DI = DI + &H1850
L_77FC: SI = &H4F6C
L_77FF: N(DI) = N_4F6C!  ' RT3F_7B
L_7802: GOTO L_7613
L_7805: GOSUB L_2352
L_7808: BX = &H14
L_780B: ARGPUSH BX  ' RT3E_42
L_780E: BX = 2
L_7811: LOCATE ARGS(), BX  ' RT3E_44
L_7814: BX = &HBC58
L_7817: InputSource = KEYBOARD: InputPrompt$ = S_BC58$: InputFlags% = 0  ' RT3F_B5; inline=&H00
L_781B: InputTypes = [2]: INPUT CURRENT_SOURCE(InputSource,InputPrompt$,InputFlags%), BUFFER(InputTypes)  ' parse typed items; B8 stores destinations  ' RT3F_B7
L_7820: BX = &HAA2C
L_7823: INPUT_NEXT MEMORY(BX)  ' store next parsed typed item; final store restores continuation  ' RT3F_B8
L_7826: SI = BX
L_7828: DI = &H4F6C
L_782B: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_782E: DX = 0
L_7831: IF CompareLeft! >= CompareRight! THEN GOTO L_7834  ' flags from L_782B
L_7833: DX = DX - 1
L_7834: DI = &HA85C
L_7837: CompareLeft! = N(SI): CompareRight! = N_A85C!  ' RT3F_9F
L_783A: CX = 0
L_783D: IF CompareLeft! <= CompareRight! THEN GOTO L_7840  ' flags from L_7837
L_783F: CX = CX - 1
L_7840: CX = CX OR DX
L_7842: CompareLeft% = CX: CompareRight% = 0
L_7844: IF CompareLeft% = CompareRight% THEN GOTO L_7849  ' flags from L_7842
L_7846: GOTO L_234F
L_7849: DI = &HA844
L_784C: SI = &HAA2C
L_784F: FAC! = N_AA2C! + N_A844!  ' RT3F_7F
L_7852: DI = SI
L_7854: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7857: GOSUB L_2352
L_785A: BX = &H14
L_785D: ARGPUSH BX  ' RT3E_42
L_7860: BX = 2
L_7863: LOCATE ARGS(), BX  ' RT3E_44
L_7866: DI = &HA9D0
L_7869: SI = &HAA2C
L_786C: FAC! = N_AA2C! + N_A9D0!  ' RT3F_7F
L_786F: BX = CINT(FAC!)  ' RT3F_77
L_7872: SI = BX
L_7874: SI = SI * (2 ^ 1)
L_7876: SI = SI * (2 ^ 1)
L_7878: SI = SI + &H1850
L_787C: DI = &H4F6C
L_787F: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_7882: IF CompareLeft! > CompareRight! THEN GOTO L_7887  ' flags from L_787F
L_7884: GOTO L_78A1
L_7887: ' PRINT statement begins (screen) ; RT3F_BC
L_788A: BX = &HBC76
L_788D: PRINT S_BC76$;  ' RT3F_6A
L_7890: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7893: GOSUB L_28BA
L_7896: SI = &HA838
L_7899: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_789C: IF CompareLeft! <> CompareRight! THEN GOTO L_78A1  ' flags from L_7899
L_789E: GOTO L_234F
L_78A1: DI = &HA9D0
L_78A4: SI = &HAA2C
L_78A7: FAC! = N_AA2C! + N_A9D0!  ' RT3F_7F
L_78AA: BX = CINT(FAC!)  ' RT3F_77
L_78AD: SI = BX
L_78AF: SI = SI * (2 ^ 1)
L_78B1: SI = SI * (2 ^ 1)
L_78B3: SI = SI + &H1850
L_78B7: DI = &H4F6C
L_78BA: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_78BD: IF CompareLeft! = CompareRight! THEN GOTO L_78C2  ' flags from L_78BA
L_78BF: GOTO L_78D4
L_78C2: ' PRINT statement begins (screen) ; RT3F_BC
L_78C5: BX = &HBC9E
L_78C8: PRINT S_BC9E$  ' RT3F_6E; H newline item, ledger correction
L_78CB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_78CE: GOSUB L_20B6
L_78D1: GOSUB L_20B6
L_78D4: SI = &HA9D0
L_78D7: FAC! = N_A9D0!: DI = &H001E  ' RT3F_6F
L_78DA: GOTO L_790A
L_78DD: ' Alignment NOP
L_78DE: SI = &HA858
L_78E1: BX = CINT(N_A858!)  ' RT3F_75
L_78E4: SI = BX
L_78E6: SI = SI * (2 ^ 1)
L_78E8: SI = SI * (2 ^ 1)
L_78EA: SI = SI + &H1850
L_78EE: DI = &H4F6C
L_78F1: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_78F4: IF CompareLeft! = CompareRight! THEN GOTO L_78F9  ' flags from L_78F1
L_78F6: GOTO L_7901
L_78F9: DI = SI
L_78FB: SI = &HA66E
L_78FE: N(DI) = N_A66E!  ' RT3F_7B

```

### Bankruptcy and post-mission training

```basic
L_7901: DI = &H4F6C
L_7904: SI = &HA858
L_7907: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_790A: DI = &HA858
L_790D: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_7910: SI = DI
L_7912: DI = &HA9D8
L_7915: CompareLeft! = N_A858!: CompareRight! = N_A9D8!  ' RT3F_9F
L_7918: IF CompareLeft! <= CompareRight! THEN GOTO L_78DE  ' flags from L_7915
L_791A: DI = &HA9D0
L_791D: SI = &HAA2C
L_7920: FAC! = N_AA2C! + N_A9D0!  ' RT3F_7F
L_7923: BX = CINT(FAC!)  ' RT3F_77
L_7926: DI = BX
L_7928: DI = DI * (2 ^ 1)
L_792A: DI = DI * (2 ^ 1)
L_792C: DI = DI + &H1850
L_7930: SI = &H4F6C
L_7933: N(DI) = N_4F6C!  ' RT3F_7B
L_7936: GOTO L_7613
L_7939: SI = &H4F6C
L_793C: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_793F: GOTO L_7973
L_7942: DI = &HA6F8
L_7945: SI = &HBCBA
L_7948: N_A6F8! = N_BCBA!  ' RT3F_7B
L_794B: DI = &HA6FC
L_794E: SI = &HA9FE
L_7951: N_A6FC! = N_A9FE!  ' RT3F_7B
L_7954: GOSUB L_07C9
L_7957: BX = CINT(FAC!)  ' RT3F_77
L_795A: DI = BX
L_795C: DI = DI * (2 ^ 1)
L_795E: DI = DI * (2 ^ 1)
L_7960: DI = DI + &H1850
L_7964: SI = &HBCBE
L_7967: N(DI) = N_BCBE!  ' RT3F_7B
L_796A: DI = &H4F6C
L_796D: SI = &HA9FE
L_7970: FAC! = N_A9FE! + N_4F6C!  ' RT3F_7F
L_7973: DI = &HA9FE
L_7976: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_7979: SI = DI
L_797B: DI = &HA5CC
L_797E: CompareLeft! = N_A9FE!: CompareRight! = N_A5CC!  ' RT3F_9F
L_7981: IF CompareLeft! <= CompareRight! THEN GOTO L_7942  ' flags from L_797E
L_7983: GOSUB L_A932
L_7986: GOTO L_210D
L_7989: GOSUB L_2352
L_798C: BX = &H13
L_798F: ARGPUSH BX  ' RT3E_42
L_7992: BX = 2
L_7995: LOCATE ARGS(), BX  ' RT3E_44
L_7998: ' PRINT statement begins (screen) ; RT3F_BC
L_799B: DX = BX
L_799D: BX = &HBCC2
L_79A0: PRINT S_BCC2$  ' RT3F_6E; H newline item, ledger correction
L_79A3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_79A6: BX = &H14
L_79A9: ARGPUSH BX  ' RT3E_42
L_79AC: BX = DX
L_79AE: LOCATE ARGS(), BX  ' RT3E_44
L_79B1: GOSUB L_2950
L_79B4: SI = &HA838
L_79B7: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_79BA: IF CompareLeft! <> CompareRight! THEN GOTO L_79BF  ' flags from L_79B7
L_79BC: GOTO L_2BB3
L_79BF: GOSUB L_2352
L_79C2: BX = &H14
L_79C5: ARGPUSH BX  ' RT3E_42
L_79C8: BX = 2
L_79CB: LOCATE ARGS(), BX  ' RT3E_44
L_79CE: ' PRINT statement begins (screen) ; RT3F_BC
L_79D1: BX = &HBCE8
L_79D4: PRINT S_BCE8$  ' RT3F_6E; H newline item, ledger correction
L_79D7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_79DA: SI = &H4F6C
L_79DD: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_79E0: GOTO L_7AA7
L_79E3: ' Alignment NOP
L_79E4: DI = &HA6F8
L_79E7: SI = &HA85C
L_79EA: N_A6F8! = N_A85C!  ' RT3F_7B
L_79ED: BX = DI
L_79EF: DI = &HA6FC
L_79F2: SI = &HA5C4
L_79F5: N_A6FC! = N_A5C4!  ' RT3F_7B
L_79F8: GOSUB L_07C9
L_79FB: DI = &HBD0C
L_79FE: N_BD0C! = FAC!: SI = &H001A  ' RT3F_7D
L_7A01: DI = &HA6F8
L_7A04: SI = &HB494
L_7A07: N_A6F8! = N_B494!  ' RT3F_7B
L_7A0A: DI = &HA6FC
L_7A0D: SI = &HA5C4
L_7A10: N_A6FC! = N_A5C4!  ' RT3F_7B
L_7A13: GOSUB L_07C9
L_7A16: GOTO L_7A3C
L_7A19: ' Alignment NOP
L_7A1A: SI = &HA858
L_7A1D: BX = SI
L_7A1F: DX = BX
L_7A21: BX = CINT(N_A858!)  ' RT3F_75
L_7A24: DI = BX
L_7A26: DI = DI * (2 ^ 1)
L_7A28: DI = DI * (2 ^ 1)
L_7A2A: DI = DI + &H1850
L_7A2E: SI = &HBD10
L_7A31: N(DI) = N_BD10!  ' RT3F_7B
L_7A34: SI = DX
L_7A36: DI = &H4F6C
L_7A39: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_7A3C: DI = &HA858
L_7A3F: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_7A42: SI = DI
L_7A44: DI = &HBD0C
L_7A47: CompareLeft! = N_A858!: CompareRight! = N_BD0C!  ' RT3F_9F
L_7A4A: IF CompareLeft! <= CompareRight! THEN GOTO L_7A1A  ' flags from L_7A47
L_7A4C: DI = &HA6F8
L_7A4F: SI = &HB484
L_7A52: N_A6F8! = N_B484!  ' RT3F_7B
L_7A55: BX = DI
L_7A57: DI = &HA6FC
L_7A5A: SI = &HA5C4
L_7A5D: N_A6FC! = N_A5C4!  ' RT3F_7B
L_7A60: GOSUB L_07C9
L_7A63: BX = CINT(FAC!)  ' RT3F_77
L_7A66: DI = BX
L_7A68: DI = DI * (2 ^ 1)
L_7A6A: DI = DI * (2 ^ 1)
L_7A6C: DI = DI + &H1850
L_7A70: SI = &HBD14
L_7A73: N(DI) = N_BD14!  ' RT3F_7B
L_7A76: DI = &HA6F8
L_7A79: SI = &HB4AC
L_7A7C: N_A6F8! = N_B4AC!  ' RT3F_7B
L_7A7F: DI = &HA6FC
L_7A82: SI = &HA5C4
L_7A85: N_A6FC! = N_A5C4!  ' RT3F_7B
L_7A88: GOSUB L_07C9
L_7A8B: BX = CINT(FAC!)  ' RT3F_77
L_7A8E: DI = BX
L_7A90: DI = DI * (2 ^ 1)
L_7A92: DI = DI * (2 ^ 1)
L_7A94: DI = DI + &H1850
L_7A98: SI = &HBD18
L_7A9B: N(DI) = N_BD18!  ' RT3F_7B
L_7A9E: DI = &H4F6C
L_7AA1: SI = &HA5C4
L_7AA4: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_7AA7: DI = &HA5C4
L_7AAA: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7AAD: SI = DI
L_7AAF: DI = &HA5CC
L_7AB2: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_7AB5: IF CompareLeft! > CompareRight! THEN GOTO L_7ABA  ' flags from L_7AB2
L_7AB7: GOTO L_79E4
L_7ABA: SI = &HAFD0
L_7ABD: FAC! = N_AFD0!: DI = &H001E  ' RT3F_6F
L_7AC0: GOTO L_7AE6
L_7AC3: ' Alignment NOP
L_7AC4: SI = &HA5C4
L_7AC7: BX = SI
L_7AC9: DX = BX
L_7ACB: BX = CINT(N_A5C4!)  ' RT3F_75
L_7ACE: DI = BX
L_7AD0: DI = DI * (2 ^ 1)
L_7AD2: DI = DI * (2 ^ 1)
L_7AD4: DI = DI + &H1850
L_7AD8: SI = &HA860
L_7ADB: N(DI) = N_A860!  ' RT3F_7B
L_7ADE: SI = DX
L_7AE0: DI = &H4F6C
L_7AE3: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_7AE6: DI = &HA5C4
L_7AE9: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7AEC: SI = DI
L_7AEE: DI = &HB920
L_7AF1: CompareLeft! = N_A5C4!: CompareRight! = N_B920!  ' RT3F_9F
L_7AF4: IF CompareLeft! <= CompareRight! THEN GOTO L_7AC4  ' flags from L_7AF1
L_7AF6: SI = &HAD26
L_7AF9: FAC! = N_AD26!: DI = &H001E  ' RT3F_6F
L_7AFC: GOTO L_7B22
L_7AFF: ' Alignment NOP
L_7B00: SI = &HA5C4
L_7B03: BX = SI
L_7B05: DX = BX
L_7B07: BX = CINT(N_A5C4!)  ' RT3F_75
L_7B0A: DI = BX
L_7B0C: DI = DI * (2 ^ 1)
L_7B0E: DI = DI * (2 ^ 1)
L_7B10: DI = DI + &H1850
L_7B14: SI = &HA9D4
L_7B17: N(DI) = N_A9D4!  ' RT3F_7B
L_7B1A: SI = DX
L_7B1C: DI = &H4F6C
L_7B1F: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_7B22: DI = &HA5C4
L_7B25: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7B28: SI = DI
L_7B2A: DI = &HAD1A
L_7B2D: CompareLeft! = N_A5C4!: CompareRight! = N_AD1A!  ' RT3F_9F
L_7B30: IF CompareLeft! <= CompareRight! THEN GOTO L_7B00  ' flags from L_7B2D
L_7B32: SI = &HB094
L_7B35: FAC! = N_B094!: DI = &H001E  ' RT3F_6F
L_7B38: GOTO L_7B5E
L_7B3B: ' Alignment NOP
L_7B3C: SI = &HA5C4
L_7B3F: BX = SI
L_7B41: DX = BX
L_7B43: BX = CINT(N_A5C4!)  ' RT3F_75
L_7B46: DI = BX
L_7B48: DI = DI * (2 ^ 1)
L_7B4A: DI = DI * (2 ^ 1)
L_7B4C: DI = DI + &H1850
L_7B50: SI = &HBD1C
L_7B53: N(DI) = N_BD1C!  ' RT3F_7B
L_7B56: SI = DX
L_7B58: DI = &H4F6C
L_7B5B: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_7B5E: DI = &HA5C4
L_7B61: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7B64: SI = DI
L_7B66: DI = &HBD20
L_7B69: CompareLeft! = N_A5C4!: CompareRight! = N_BD20!  ' RT3F_9F
L_7B6C: IF CompareLeft! <= CompareRight! THEN GOTO L_7B3C  ' flags from L_7B69
L_7B6E: SI = &HAFFE
L_7B71: FAC! = N_AFFE!: DI = &H001E  ' RT3F_6F
L_7B74: GOTO L_7B9A
L_7B77: ' Alignment NOP
L_7B78: SI = &HA5C4
L_7B7B: BX = SI
L_7B7D: DX = BX
L_7B7F: BX = CINT(N_A5C4!)  ' RT3F_75
L_7B82: DI = BX
L_7B84: DI = DI * (2 ^ 1)
L_7B86: DI = DI * (2 ^ 1)
L_7B88: DI = DI + &H1850
L_7B8C: SI = &HBD24
L_7B8F: N(DI) = N_BD24!  ' RT3F_7B
L_7B92: SI = DX
L_7B94: DI = &H4F6C
L_7B97: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_7B9A: DI = &HA5C4
L_7B9D: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7BA0: SI = DI
L_7BA2: DI = &HB918
L_7BA5: CompareLeft! = N_A5C4!: CompareRight! = N_B918!  ' RT3F_9F
L_7BA8: IF CompareLeft! <= CompareRight! THEN GOTO L_7B78  ' flags from L_7BA5
L_7BAA: SI = &HB080
L_7BAD: FAC! = N_B080!: DI = &H001E  ' RT3F_6F
L_7BB0: GOTO L_7BD6
L_7BB3: ' Alignment NOP
L_7BB4: SI = &HA5C4
L_7BB7: BX = SI
L_7BB9: DX = BX
L_7BBB: BX = CINT(N_A5C4!)  ' RT3F_75
L_7BBE: DI = BX
L_7BC0: DI = DI * (2 ^ 1)
L_7BC2: DI = DI * (2 ^ 1)
L_7BC4: DI = DI + &H1850
L_7BC8: SI = &HBD28
L_7BCB: N(DI) = N_BD28!  ' RT3F_7B
L_7BCE: SI = DX
L_7BD0: DI = &H4F6C
L_7BD3: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_7BD6: DI = &HA5C4
L_7BD9: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7BDC: SI = DI
L_7BDE: DI = &HBD2C
L_7BE1: CompareLeft! = N_A5C4!: CompareRight! = N_BD2C!  ' RT3F_9F
L_7BE4: IF CompareLeft! <= CompareRight! THEN GOTO L_7BB4  ' flags from L_7BE1
L_7BE6: DI = &H18FC
L_7BE9: SI = &HBD30
L_7BEC: N_18FC! = N_BD30!  ' RT3F_7B
L_7BEF: DI = &HAA4C
L_7BF2: SI = &HBD34
L_7BF5: N_AA4C! = N_BD34!  ' RT3F_7B
L_7BF8: GOSUB L_1E98
L_7BFB: GOSUB L_20B6
L_7BFE: GOTO L_2BB3
L_7C01: GOSUB L_2352
L_7C04: DI = &HAA2C
L_7C07: SI = &HA66E
L_7C0A: N_AA2C! = N_A66E!  ' RT3F_7B
L_7C0D: SI = &H4F6C
L_7C10: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_7C13: GOTO L_83E3
L_7C16: DI = &HA6E4
L_7C19: SI = &HA86C
L_7C1C: N_A6E4! = N_A86C!  ' RT3F_7B
L_7C1F: DI = &HA6E8
L_7C22: SI = &HA9FE
L_7C25: N_A6E8! = N_A9FE!  ' RT3F_7B
L_7C28: GOSUB L_0797
L_7C2B: DI = &H4F6C
L_7C2E: CompareLeft! = FAC!: CompareRight! = N_4F6C!  ' RT3F_A1
L_7C31: IF CompareLeft! = CompareRight! THEN GOTO L_7C36  ' flags from L_7C2E
L_7C33: GOTO L_83DA
L_7C36: GOSUB L_2352
L_7C39: BX = &H11
L_7C3C: ARGPUSH BX  ' RT3E_42
L_7C3F: BX = 2
L_7C42: LOCATE ARGS(), BX  ' RT3E_44
L_7C45: ' PRINT statement begins (screen) ; RT3F_BC
L_7C48: SI = &HA9FE
L_7C4B: DX = SI
L_7C4D: CX = BX
L_7C4F: BX = CINT(N_A9FE!)  ' RT3F_75
L_7C52: BX = BX * (2 ^ 1)
L_7C54: BX = BX * (2 ^ 1)
L_7C56: BX = BX + &H4288
L_7C5A: PRINT S(BX);  ' RT3F_6A
L_7C5D: AX = BX
L_7C5F: BX = &HBD9C
L_7C62: PRINT S_BD9C$;  ' RT3F_6A
L_7C65: DI = &HA6E4
L_7C68: SI = &HA854
L_7C6B: N_A6E4! = N_A854!  ' RT3F_7B
L_7C6E: SI = DX
L_7C70: DI = &HA6E8
L_7C73: N_A6E8! = N(SI)  ' RT3F_7B
L_7C76: WORD(BP - 6) = AX
L_7C79: GOSUB L_0797
L_7C7C: BX = &H1A
L_7C7F: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_7C82: BX = &HBD38
L_7C85: PRINT S_BD38$  ' RT3F_6E; H newline item, ledger correction
L_7C88: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7C8B: BX = &H13
L_7C8E: ARGPUSH BX  ' RT3E_42
L_7C91: BX = 2
L_7C94: LOCATE ARGS(), BX  ' RT3E_44
L_7C97: ' PRINT statement begins (screen) ; RT3F_BC
L_7C9A: DX = BX
L_7C9C: BX = &HBD52
L_7C9F: PRINT S_BD52$  ' RT3F_6E; H newline item, ledger correction
L_7CA2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7CA5: BX = &H14
L_7CA8: ARGPUSH BX  ' RT3E_42
L_7CAB: BX = DX
L_7CAD: LOCATE ARGS(), BX  ' RT3E_44
L_7CB0: ' PRINT statement begins (screen) ; RT3F_BC
L_7CB3: BX = &HBD66
L_7CB6: PRINT S_BD66$  ' RT3F_6E; H newline item, ledger correction
L_7CB9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7CBC: BX = &H15
L_7CBF: ARGPUSH BX  ' RT3E_42
L_7CC2: BX = DX
L_7CC4: LOCATE ARGS(), BX  ' RT3E_44
L_7CC7: ' PRINT statement begins (screen) ; RT3F_BC
L_7CCA: BX = &HBD8E
L_7CCD: PRINT S_BD8E$;  ' RT3F_6A
L_7CD0: BX = WORD(BP - 6)
L_7CD3: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_7CD6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7CD9: DI = &HAE0E
L_7CDC: SI = &HA5C0
L_7CDF: N_AE0E! = N_A5C0!  ' RT3F_7B
L_7CE2: DI = &HA6E4
L_7CE5: SI = &HA854
L_7CE8: N_A6E4! = N_A854!  ' RT3F_7B
L_7CEB: DI = &HA6E8
L_7CEE: SI = &HA9FE
L_7CF1: N_A6E8! = N_A9FE!  ' RT3F_7B
L_7CF4: GOSUB L_0797
L_7CF7: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_7CFA: IF CompareLeft! > CompareRight! THEN GOTO L_7CFF  ' flags from L_7CF7
L_7CFC: GOTO L_7D20
L_7CFF: BX = &H16
L_7D02: ARGPUSH BX  ' RT3E_42
L_7D05: BX = 2
L_7D08: LOCATE ARGS(), BX  ' RT3E_44
L_7D0B: ' PRINT statement begins (screen) ; RT3F_BC
L_7D0E: BX = &HBDA4
L_7D11: PRINT S_BDA4$  ' RT3F_6E; H newline item, ledger correction
L_7D14: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7D17: DI = &HAE0E
L_7D1A: SI = &HA676
L_7D1D: N_AE0E! = N_A676!  ' RT3F_7B
L_7D20: GOSUB L_1E7C
L_7D23: SI = &HAE16
L_7D26: CompareLeft! = N_AE16!: CompareRight! = 0  ' RT3F_A7
L_7D29: IF CompareLeft! >= CompareRight! THEN GOTO L_7D2E  ' flags from L_7D26
L_7D2B: GOTO L_83F6
L_7D2E: SI = &HAE16
L_7D31: BX = CINT(N_AE16!)  ' RT3F_75
L_7D34: ON BX GOTO L_83DA, L_7D40, L_7DDF, L_7DE5  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_7D40: DI = &HA704
L_7D43: SI = &HBDBE
L_7D46: N_A704! = N_BDBE!  ' RT3F_7B
L_7D49: GOSUB L_07E8
L_7D4C: DI = &HBDC2
L_7D4F: CompareLeft! = FAC!: CompareRight! = N_BDC2!  ' RT3F_A1
L_7D52: IF CompareLeft! < CompareRight! THEN GOTO L_7D57  ' flags from L_7D4F
L_7D54: GOTO L_7D5D
L_7D57: GOSUB L_2687
L_7D5A: GOTO L_7C36
L_7D5D: GOSUB L_2352
L_7D60: BX = &H14
L_7D63: ARGPUSH BX  ' RT3E_42
L_7D66: BX = 2
L_7D69: LOCATE ARGS(), BX  ' RT3E_44
L_7D6C: ' PRINT statement begins (screen) ; RT3F_BC
L_7D6F: BX = &HBDC6
L_7D72: PRINT S_BDC6$;  ' RT3F_6A
L_7D75: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7D78: GOSUB L_28BA
L_7D7B: SI = &HA838
L_7D7E: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_7D81: IF CompareLeft! <> CompareRight! THEN GOTO L_7D86  ' flags from L_7D7E
L_7D83: GOTO L_7C36
L_7D86: DI = &HAA4C
L_7D89: SI = &HBDDE
L_7D8C: N_AA4C! = N_BDDE!  ' RT3F_7B
L_7D8F: GOSUB L_1E98
L_7D92: DI = &HA6F8
L_7D95: SI = &HA854
L_7D98: N_A6F8! = N_A854!  ' RT3F_7B
L_7D9B: DI = &HA6FC
L_7D9E: BX = SI
L_7DA0: SI = &HA9FE
L_7DA3: N_A6FC! = N_A9FE!  ' RT3F_7B
L_7DA6: GOSUB L_07C9
L_7DA9: BX = CINT(FAC!)  ' RT3F_77
L_7DAC: DI = BX
L_7DAE: DI = DI * (2 ^ 1)
L_7DB0: DI = DI * (2 ^ 1)
L_7DB2: DI = DI + &H1850
L_7DB6: BX = DI
L_7DB8: DI = &HA6E4
L_7DBB: SI = &HA854
L_7DBE: N_A6E4! = N_A854!  ' RT3F_7B
L_7DC1: DI = &HA6E8
L_7DC4: SI = &HA9FE
L_7DC7: N_A6E8! = N_A9FE!  ' RT3F_7B
L_7DCA: WORD(BP - 6) = BX
L_7DCD: GOSUB L_0797
L_7DD0: DI = &H4F6C
L_7DD3: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_7DD6: DI = WORD(BP - 6)
L_7DD9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7DDC: GOTO L_7C36
L_7DDF: GOSUB L_84CB
L_7DE2: GOTO L_7C36
L_7DE5: DI = &HA9F6
L_7DE8: SI = &HA5C0
L_7DEB: N_A9F6! = N_A5C0!  ' RT3F_7B
L_7DEE: GOSUB L_6A8A
L_7DF1: GOSUB L_2352
L_7DF4: BX = &H10
L_7DF7: ARGPUSH BX  ' RT3E_42
L_7DFA: BX = 5
L_7DFD: LOCATE ARGS(), BX  ' RT3E_44
L_7E00: ' PRINT statement begins (screen) ; RT3F_BC
L_7E03: BX = &HBDE2
L_7E06: PRINT S_BDE2$;  ' RT3F_6A
L_7E09: SI = &HA9FE
L_7E0C: BX = SI
L_7E0E: DX = BX
L_7E10: BX = CINT(N_A9FE!)  ' RT3F_75
L_7E13: BX = BX * (2 ^ 1)
L_7E15: BX = BX * (2 ^ 1)
L_7E17: BX = BX + &H4288
L_7E1B: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_7E1E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7E21: DI = &HA6F8
L_7E24: SI = &HA854
L_7E27: N_A6F8! = N_A854!  ' RT3F_7B
L_7E2A: SWAP DX, SI
L_7E2C: DI = &HA6FC
L_7E2F: N_A6FC! = N(SI)  ' RT3F_7B
L_7E32: GOSUB L_07C9
L_7E35: BX = CINT(FAC!)  ' RT3F_77
L_7E38: DI = BX
L_7E3A: DI = DI * (2 ^ 1)
L_7E3C: DI = DI * (2 ^ 1)
L_7E3E: DI = DI + &H1850
L_7E42: BX = DI
L_7E44: DI = &HA6E4
L_7E47: SI = &HA854
L_7E4A: N_A6E4! = N_A854!  ' RT3F_7B
L_7E4D: DI = &HA6E8
L_7E50: SI = &HA9FE
L_7E53: N_A6E8! = N_A9FE!  ' RT3F_7B
L_7E56: WORD(BP - 6) = BX
L_7E59: GOSUB L_0797
L_7E5C: DI = &HA844
L_7E5F: FAC! = FAC! + N_A844!  ' RT3F_81
L_7E62: DI = WORD(BP - 6)
L_7E65: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7E68: SI = &HA66E
L_7E6B: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_7E6E: GOTO L_7EEC
L_7E71: ' Alignment NOP
L_7E72: DI = &HAECE
L_7E75: SI = &HA5C4
L_7E78: FAC! = N_A5C4! * N_AECE!  ' RT3F_8F
L_7E7B: BX = &H1A
L_7E7E: FAC! = INT(FAC!)  ' RT3D_03
L_7E81: DI = &HAB7A
L_7E84: BX = SI
L_7E86: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_7E89: SI = DI
L_7E8B: FAC! = N_AB7A! * 2 ^ (2)  ' RT3F_AB; inline=&H02
L_7E8F: SI = &HB054
L_7E92: DX = DI
L_7E94: FAC! = N_B054! - FAC!  ' RT3F_9B
L_7E97: DI = BX
L_7E99: CX = SI
L_7E9B: FAC! = FAC! + N(DI)  ' RT3F_81
L_7E9E: BX = CINT(FAC!)  ' RT3F_77
L_7EA1: ARGPUSH BX  ' RT3E_42
L_7EA4: SWAP CX, DI
L_7EA6: SI = DX
L_7EA8: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_7EAB: DI = &H4F94
L_7EAE: FAC! = FAC! + N_4F94!  ' RT3F_81
L_7EB1: BX = CINT(FAC!)  ' RT3F_77
L_7EB4: LOCATE ARGS(), BX  ' RT3E_44
L_7EB7: ' PRINT statement begins (screen) ; RT3F_BC
L_7EBA: SI = CX
L_7EBC: DI = &HB818
L_7EBF: FAC! = N(SI) + N_B818!  ' RT3F_7F
L_7EC2: BX = CINT(FAC!)  ' RT3F_77
L_7EC5: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_7EC8: PRINT S(BX);  ' RT3F_6A
L_7ECB: BX = &HA63C
L_7ECE: PRINT S_A63C$;  ' RT3F_6A
L_7ED1: SI = CX
L_7ED3: BX = CINT(N(SI))  ' RT3F_75
L_7ED6: BX = BX * (2 ^ 1)
L_7ED8: BX = BX * (2 ^ 1)
L_7EDA: BX = BX + &H4870
L_7EDE: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_7EE1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_7EE4: SI = CX
L_7EE6: DI = &H4F6C
L_7EE9: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_7EEC: DI = &HA5C4
L_7EEF: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_7EF2: SI = DI
L_7EF4: DI = &HA696
L_7EF7: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_7EFA: IF CompareLeft! > CompareRight! THEN GOTO L_7EFF  ' flags from L_7EF7
L_7EFC: GOTO L_7E72
L_7EFF: DI = &HAE0E
L_7F02: SI = &HA850
L_7F05: N_AE0E! = N_A850!  ' RT3F_7B
L_7F08: GOSUB L_1E7C
L_7F0B: SI = &HAE16
L_7F0E: CompareLeft! = N_AE16!: CompareRight! = 0  ' RT3F_A7
L_7F11: IF CompareLeft! < CompareRight! THEN GOTO L_7F08  ' flags from L_7F0E
L_7F13: DI = &HA844
L_7F16: SI = &HAE16
L_7F19: FAC! = N_AE16! + N_A844!  ' RT3F_7F
L_7F1C: DI = SI
L_7F1E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7F21: SI = DI
L_7F23: DI = &HA6E4
L_7F26: N_A6E4! = N(SI)  ' RT3F_7B
L_7F29: DI = &HA6E8
L_7F2C: BX = SI
L_7F2E: SI = &HA9FE
L_7F31: N_A6E8! = N_A9FE!  ' RT3F_7B
L_7F34: GOSUB L_0797
L_7F37: DI = &HAB7A
L_7F3A: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_7F3D: BX = DI
L_7F3F: DI = &HA682
L_7F42: SI = &HAE16
L_7F45: CompareLeft! = N_AE16!: CompareRight! = N_A682!  ' RT3F_9F
L_7F48: IF CompareLeft! = CompareRight! THEN GOTO L_7F4D  ' flags from L_7F45
L_7F4A: GOTO L_7FAB
L_7F4D: SI = BX
L_7F4F: DI = &HA85C
L_7F52: CompareLeft! = N(SI): CompareRight! = N_A85C!  ' RT3F_9F
L_7F55: DX = 0
L_7F58: IF CompareLeft! >= CompareRight! THEN GOTO L_7F5B  ' flags from L_7F52
L_7F5A: DX = DX - 1
L_7F5B: DI = &HA68A
L_7F5E: CompareLeft! = N(SI): CompareRight! = N_A68A!  ' RT3F_9F
L_7F61: CX = 0
L_7F64: IF CompareLeft! <= CompareRight! THEN GOTO L_7F67  ' flags from L_7F5E
L_7F66: CX = CX - 1
L_7F67: CX = CX OR DX
L_7F69: CompareLeft% = CX: CompareRight% = 0
L_7F6B: IF CompareLeft% <> CompareRight% THEN GOTO L_7F70  ' flags from L_7F69
L_7F6D: GOTO L_7F75
L_7F70: BEEP  ' RT3E_2B
L_7F73: GOTO L_7F08
L_7F75: FAC! = RND  ' RT3D_34
L_7F78: DI = &HBE00
L_7F7B: FAC! = FAC! * N_BE00!  ' RT3F_91
L_7F7E: DI = &HAB7A
L_7F81: FAC! = FAC! + N_AB7A!  ' RT3F_81
L_7F84: BX = DI
L_7F86: DI = &H4F94
L_7F89: FAC! = FAC! + N_4F94!  ' RT3F_81
L_7F8C: DX = BX
L_7F8E: BX = &H1A
L_7F91: FAC! = INT(FAC!)  ' RT3D_03
L_7F94: DI = DX
L_7F96: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7F99: SI = DX
L_7F9B: DI = &HA6EC
L_7F9E: CompareLeft! = N(SI): CompareRight! = N_A6EC!  ' RT3F_9F
L_7FA1: IF CompareLeft! > CompareRight! THEN GOTO L_7FA6  ' flags from L_7F9E
L_7FA3: GOTO L_7FAB
L_7FA6: SWAP SI, DI
L_7FA8: N(DI) = N(SI)  ' RT3F_7B
L_7FAB: DI = &HA682
L_7FAE: SI = &HAE16
L_7FB1: CompareLeft! = N_AE16!: CompareRight! = N_A682!  ' RT3F_9F
L_7FB4: IF CompareLeft! <> CompareRight! THEN GOTO L_7FB9  ' flags from L_7FB1
L_7FB6: GOTO L_8007
L_7FB9: FAC! = RND  ' RT3D_34
L_7FBC: DI = &HA5C0
L_7FBF: FAC! = FAC! * N_A5C0!  ' RT3F_91
L_7FC2: BX = &H1A
L_7FC5: FAC! = INT(FAC!)  ' RT3D_03
L_7FC8: BX = DI
L_7FCA: DI = &HAB7A
L_7FCD: FAC! = FAC! + N_AB7A!  ' RT3F_81
L_7FD0: DX = DI
L_7FD2: DI = &H4F94
L_7FD5: FAC! = FAC! + N_4F94!  ' RT3F_81
L_7FD8: DI = DX
L_7FDA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_7FDD: SI = DX
L_7FDF: DI = &HA6EC
L_7FE2: CompareLeft! = N(SI): CompareRight! = N_A6EC!  ' RT3F_9F
L_7FE5: IF CompareLeft! < CompareRight! THEN GOTO L_7FEA  ' flags from L_7FE2
L_7FE7: GOTO L_8007
L_7FEA: FAC! = RND  ' RT3D_34
L_7FED: DI = BX
L_7FEF: FAC! = FAC! * N(DI)  ' RT3F_91
L_7FF2: BX = &H1A
L_7FF5: FAC! = INT(FAC!)  ' RT3D_03
L_7FF8: SWAP DX, DI
L_7FFA: FAC! = FAC! + N(DI)  ' RT3F_81
L_7FFD: SWAP DX, DI
L_7FFF: FAC! = FAC! + N(DI)  ' RT3F_81
L_8002: DI = DX
L_8004: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8007: GOSUB L_2374
L_800A: BX = &H14
L_800D: ARGPUSH BX  ' RT3E_42
L_8010: BX = 2
L_8013: LOCATE ARGS(), BX  ' RT3E_44
L_8016: ' PRINT statement begins (screen) ; RT3F_BC
L_8019: SI = &HAE16
L_801C: BX = CINT(N_AE16!)  ' RT3F_75
L_801F: BX = BX * (2 ^ 1)
L_8021: BX = BX * (2 ^ 1)
L_8023: BX = BX + &H4870
L_8027: PRINT S(BX);  ' RT3F_6A
L_802A: BX = &HBE04
L_802D: PRINT S_BE04$;  ' RT3F_6A
L_8030: BX = &HAB7A
L_8033: FAC! = INT(N_AB7A!)  ' RT3D_03
L_8036: BX = &H1A
L_8039: PRINT FAC!  ' RT3F_6B
L_803C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_803F: GOSUB L_20B6
L_8042: DI = &HA6F8
L_8045: SI = &HAE16
L_8048: N_A6F8! = N_AE16!  ' RT3F_7B
L_804B: DI = &HA6FC
L_804E: SI = &HA9FE
L_8051: N_A6FC! = N_A9FE!  ' RT3F_7B
L_8054: GOSUB L_07C9
L_8057: BX = CINT(FAC!)  ' RT3F_77
L_805A: DI = BX
L_805C: DI = DI * (2 ^ 1)
L_805E: DI = DI * (2 ^ 1)
L_8060: DI = DI + &H1850
L_8064: SI = &HAB7A
L_8067: N(DI) = N_AB7A!  ' RT3F_7B
L_806A: GOSUB L_2374
L_806D: SI = &HA66E
L_8070: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_8073: GOTO L_81A5
L_8076: DI = &HA696
L_8079: SI = &HA5C4
L_807C: FAC! = N_A5C4! / N_A696!  ' RT3F_87
L_807F: BX = &H1A
L_8082: FAC! = INT(FAC!)  ' RT3D_03
L_8085: BX = DI
L_8087: DI = &HAB7A
L_808A: DX = SI
L_808C: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_808F: SWAP BX, DI
L_8091: SI = BX
L_8093: FAC! = N_AB7A! * N(DI)  ' RT3F_8F
L_8096: SI = &HB05C
L_8099: FAC! = N_B05C! - FAC!  ' RT3F_9B
L_809C: DI = DX
L_809E: CX = SI
L_80A0: FAC! = FAC! + N(DI)  ' RT3F_81
L_80A3: AX = BX
L_80A5: BX = CINT(FAC!)  ' RT3F_77
L_80A8: ARGPUSH BX  ' RT3E_42
L_80AB: SI = AX
L_80AD: DI = &HBE10
L_80B0: FAC! = N(SI) * N_BE10!  ' RT3F_8F
L_80B3: DI = &H4F94
L_80B6: T_00! = FAC!  ' RT3F_71; inline=&H80
L_80BA: FAC! = FAC! + N(DI)  ' RT3F_81
L_80BD: BX = CINT(FAC!)  ' RT3F_77
L_80C0: LOCATE ARGS(), BX  ' RT3E_44
L_80C3: ' PRINT statement begins (screen) ; RT3F_BC
L_80C6: SI = DX
L_80C8: DI = &HB818
L_80CB: FAC! = N(SI) + N_B818!  ' RT3F_7F
L_80CE: BX = CINT(FAC!)  ' RT3F_77
L_80D1: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_80D4: PRINT S(BX);  ' RT3F_6A
L_80D7: BX = &HA63C
L_80DA: PRINT S_A63C$;  ' RT3F_6A
L_80DD: SI = DX
L_80DF: DI = &H4F6C
L_80E2: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_80E5: BX = CINT(FAC!)  ' RT3F_77
L_80E8: BX = BX * (2 ^ 1)
L_80EA: BX = BX * (2 ^ 1)
L_80EC: BX = BX + &H42E4
L_80F0: DX = &HD
L_80F3: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_80F6: PRINT S(BX);  ' RT3F_6A
L_80F9: BX = 0
L_80FB: BX = POS(BX)  ' RT3D_21
L_80FE: BX = BX - &H11
L_8101: BX = -BX
L_8103: FAC! = CSNG(BX)  ' RT3F_57
L_8106: DI = &HA87C
L_8109: FAC! = FAC! + N_A87C!  ' RT3F_81
L_810C: BX = CINT(FAC!)  ' RT3F_77
L_810F: DX = &HBE14
L_8112: BX = TEMP_DESC(STRING$(BX, S_BE14$))  ' RT3D_0F
L_8115: PRINT S(BX);  ' RT3F_6A
L_8118: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_811B: DI = CX
L_811D: SI = &HA5C4
L_8120: FAC! = N_A5C4! + N(DI)  ' RT3F_7F
L_8123: DI = &HA6F8
L_8126: N_A6F8! = FAC!: SI = &H001A  ' RT3F_7D
L_8129: DI = &HA6FC
L_812C: SI = &HA9FE
L_812F: N_A6FC! = N_A9FE!  ' RT3F_7B
L_8132: GOSUB L_07C9
L_8135: BX = CINT(FAC!)  ' RT3F_77
L_8138: SI = BX
L_813A: SI = SI * (2 ^ 1)
L_813C: SI = SI * (2 ^ 1)
L_813E: SI = SI + &H1850
L_8142: DI = &HAB7A
L_8145: N_AB7A! = N(SI)  ' RT3F_7B
L_8148: BX = DI
L_814A: FAC! = INT(N_AB7A!)  ' RT3D_03
L_814D: SI = BX
L_814F: FAC! = N(SI) - FAC!  ' RT3F_9B
L_8152: DI = &HA6F4
L_8155: CompareLeft! = FAC!: CompareRight! = N_A6F4!  ' RT3F_A1
L_8158: DX = 0
L_815B: IF CompareLeft! >= CompareRight! THEN GOTO L_815E  ' flags from L_8155
L_815D: DX = DX - 1
L_815E: CompareLeft% = DX: CompareRight% = 0
L_8160: IF CompareLeft% >= CompareRight% THEN GOTO L_8164  ' flags from L_815E
L_8162: DX = -DX
L_8164: CompareLeft% = DX: CompareRight% = 0
L_8166: IF CompareLeft% <> CompareRight% THEN GOTO L_816B  ' flags from L_8164
L_8168: GOTO L_818D
L_816B: ' PRINT statement begins (screen) ; RT3F_BC
L_816E: DX = BX
L_8170: BX = &HBE1A
L_8173: PRINT S_BE1A$;  ' RT3F_6A
L_8176: SI = DX
L_8178: DI = &HA870
L_817B: FAC! = N(SI) + N_A870!  ' RT3F_7F
L_817E: BX = CINT(FAC!)  ' RT3F_77
L_8181: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_8184: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8187: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_818A: GOTO L_819C
L_818D: BX = &HBE20
L_8190: PRINT USING S_BE20$;  ' RT3F_BD
L_8193: BX = &HAB7A
L_8196: PRINT N_AB7A!  ' RT3F_6B
L_8199: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_819C: DI = &H4F6C
L_819F: SI = &HA5C4
L_81A2: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_81A5: DI = &HA5C4
L_81A8: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_81AB: SI = DI
L_81AD: DI = &HA5EE
L_81B0: CompareLeft! = N_A5C4!: CompareRight! = N_A5EE!  ' RT3F_9F
L_81B3: IF CompareLeft! > CompareRight! THEN GOTO L_81B8  ' flags from L_81B0
L_81B5: GOTO L_8076
L_81B8: DI = &HAE0E
L_81BB: SI = &HA840
L_81BE: N_AE0E! = N_A840!  ' RT3F_7B
L_81C1: BX = &H18
L_81C4: ARGPUSH BX  ' RT3E_42
L_81C7: BX = 2
L_81CA: LOCATE ARGS(), BX  ' RT3E_44
L_81CD: ' PRINT statement begins (screen) ; RT3F_BC
L_81D0: BX = &HBE28
L_81D3: PRINT S_BE28$;  ' RT3F_6A
L_81D6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_81D9: GOSUB L_22C4
L_81DC: SI = &HAE16
L_81DF: CompareLeft! = N_AE16!: CompareRight! = 0  ' RT3F_A7
L_81E2: IF CompareLeft! < CompareRight! THEN GOTO L_81C1  ' flags from L_81DF
L_81E4: DI = &HAA2C
L_81E7: SI = &HA66E
L_81EA: N_AA2C! = N_A66E!  ' RT3F_7B
L_81ED: DI = &HA6E4
L_81F0: SI = &HA868
L_81F3: N_A6E4! = N_A868!  ' RT3F_7B
L_81F6: DI = &HA6E8
L_81F9: SI = &HA9FE
L_81FC: N_A6E8! = N_A9FE!  ' RT3F_7B
L_81FF: GOSUB L_0797
L_8202: DI = &HBE46
L_8205: N_BE46! = FAC!: SI = &H001A  ' RT3F_7D
L_8208: SI = &HBE4A
L_820B: FAC! = N_BE4A!: DI = &H001E  ' RT3F_6F
L_820E: GOTO L_824F
L_8211: ' Alignment NOP
L_8212: SI = &HBE46
L_8215: BX = CINT(N_BE46!)  ' RT3F_75
L_8218: SI = BX
L_821A: SI = &HA5C4
L_821D: DX = BX
L_821F: BX = CINT(N_A5C4!)  ' RT3F_75
L_8222: BX = BX * (2 ^ 1)
L_8224: BX = BX * (2 ^ 1)
L_8226: BX = BX + DX
L_8228: SI = BX
L_822A: SI = SI * (2 ^ 1)
L_822C: SI = SI * (2 ^ 1)
L_822E: SI = SI + &H522E
L_8232: DI = &HAE16
L_8235: CompareLeft! = N(SI): CompareRight! = N_AE16!  ' RT3F_9F
L_8238: IF CompareLeft! = CompareRight! THEN GOTO L_823D  ' flags from L_8235
L_823A: GOTO L_8246
L_823D: DI = &HAA2C
L_8240: SI = &H4F6C
L_8243: N_AA2C! = N_4F6C!  ' RT3F_7B
L_8246: DI = &H4F6C
L_8249: SI = &HA5C4
L_824C: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_824F: DI = &HA5C4
L_8252: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_8255: SI = DI
L_8257: DI = &HA686
L_825A: CompareLeft! = N_A5C4!: CompareRight! = N_A686!  ' RT3F_9F
L_825D: IF CompareLeft! <= CompareRight! THEN GOTO L_8212  ' flags from L_825A
L_825F: BX = &H14
L_8262: ARGPUSH BX  ' RT3E_42
L_8265: BX = 2
L_8268: LOCATE ARGS(), BX  ' RT3E_44
L_826B: DI = &HA97C
L_826E: SI = &HAE16
L_8271: FAC! = N_AE16! + N_A97C!  ' RT3F_7F
L_8274: DI = &HA6F8
L_8277: N_A6F8! = FAC!: SI = &H001A  ' RT3F_7D
L_827A: DI = &HA6FC
L_827D: SI = &HA9FE
L_8280: N_A6FC! = N_A9FE!  ' RT3F_7B
L_8283: GOSUB L_07C9
L_8286: BX = CINT(FAC!)  ' RT3F_77
L_8289: SI = BX
L_828B: SI = SI * (2 ^ 1)
L_828D: SI = SI * (2 ^ 1)
L_828F: SI = SI + &H1850
L_8293: DI = &HAB7A
L_8296: N_AB7A! = N(SI)  ' RT3F_7B
L_8299: SI = &HAA2C
L_829C: CompareLeft! = N_AA2C!: CompareRight! = 0  ' RT3F_A7
L_829F: IF CompareLeft! = CompareRight! THEN GOTO L_82A4  ' flags from L_829C
L_82A1: GOTO L_82AA
L_82A4: BEEP  ' RT3E_2B
L_82A7: GOTO L_81C1
L_82AA: GOSUB L_2374
L_82AD: FAC! = RND  ' RT3D_34
L_82B0: DI = &HA988
L_82B3: FAC! = FAC! * N_A988!  ' RT3F_91
L_82B6: DI = &HA6E4
L_82B9: SI = &HA696
L_82BC: N_A6E4! = N_A696!  ' RT3F_7B
L_82BF: DI = &HA6E8
L_82C2: SI = &HA9FE
L_82C5: N_A6E8! = N_A9FE!  ' RT3F_7B
L_82C8: T_00! = FAC!  ' RT3F_71; inline=&H80
L_82CC: GOSUB L_0797
L_82CF: CompareLeft! = T_00!: CompareRight! = FAC!  ' RT3F_A5; inline=&H80
L_82D3: BX = 0
L_82D6: IF CompareLeft! >= CompareRight! THEN GOTO L_82D9  ' flags from L_82CF
L_82D8: BX = BX - 1
L_82D9: BX = BX - 1
L_82DA: BX = -BX
L_82DC: FAC! = CSNG(BX)  ' RT3F_57
L_82DF: DI = &HBE4E
L_82E2: N_BE4E! = FAC!: SI = &H001A  ' RT3F_7D
L_82E5: BX = DI
L_82E7: DI = &H4F94
L_82EA: SI = &HAB7A
L_82ED: CompareLeft! = N_AB7A!: CompareRight! = N_4F94!  ' RT3F_9F
L_82F0: IF CompareLeft! > CompareRight! THEN GOTO L_82F5  ' flags from L_82ED
L_82F2: GOTO L_831E
L_82F5: SWAP BX, SI
L_82F7: DI = &HA70C
L_82FA: FAC! = N(SI) * N_A70C!  ' RT3F_8F
L_82FD: DI = SI
L_82FF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8302: SI = BX
L_8304: DX = DI
L_8306: DI = &HA682
L_8309: CompareLeft! = N(SI): CompareRight! = N_A682!  ' RT3F_9F
L_830C: IF CompareLeft! > CompareRight! THEN GOTO L_8311  ' flags from L_8309
L_830E: GOTO L_831E
L_8311: SI = DX
L_8313: DI = &HBE52
L_8316: FAC! = N(SI) * N_BE52!  ' RT3F_8F
L_8319: DI = DX
L_831B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_831E: DI = &HBE4E
L_8321: SI = &HAB7A
L_8324: FAC! = N_AB7A! + N_BE4E!  ' RT3F_7F
L_8327: DI = SI
L_8329: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_832C: SI = DI
L_832E: DI = &HA5CC
L_8331: CompareLeft! = N(SI): CompareRight! = N_A5CC!  ' RT3F_9F
L_8334: IF CompareLeft! > CompareRight! THEN GOTO L_8339  ' flags from L_8331
L_8336: GOTO L_833E
L_8339: SWAP DI, SI
L_833B: N(DI) = N(SI)  ' RT3F_7B
L_833E: ' PRINT statement begins (screen) ; RT3F_BC
L_8341: BX = &HBE56
L_8344: PRINT S_BE56$;  ' RT3F_6A
L_8347: SI = &HAE16
L_834A: BX = CINT(N_AE16!)  ' RT3F_75
L_834D: BX = BX * (2 ^ 1)
L_834F: BX = BX * (2 ^ 1)
L_8351: BX = BX + &H42E4
L_8355: PRINT S(BX);  ' RT3F_6A
L_8358: BX = &HBE64
L_835B: PRINT S_BE64$;  ' RT3F_6A
L_835E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8361: BX = &HAB7A
L_8364: FAC! = INT(N_AB7A!)  ' RT3D_03
L_8367: SI = BX
L_8369: FAC! = N(SI) - FAC!  ' RT3F_9B
L_836C: DI = &HA6F4
L_836F: CompareLeft! = FAC!: CompareRight! = N_A6F4!  ' RT3F_A1
L_8372: DX = 0
L_8375: IF CompareLeft! >= CompareRight! THEN GOTO L_8378  ' flags from L_836F
L_8377: DX = DX - 1
L_8378: CompareLeft% = DX: CompareRight% = 0
L_837A: IF CompareLeft% >= CompareRight% THEN GOTO L_837E  ' flags from L_8378
L_837C: DX = -DX
L_837E: CompareLeft% = DX: CompareRight% = 0
L_8380: IF CompareLeft% <> CompareRight% THEN GOTO L_8385  ' flags from L_837E
L_8382: GOTO L_8397
L_8385: ' PRINT statement begins (screen) ; RT3F_BC
L_8388: FAC! = INT(N(BX))  ' RT3D_03
L_838B: BX = &H1A
L_838E: PRINT FAC!  ' RT3F_6B
L_8391: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8394: GOTO L_83A6
L_8397: BX = &HBE20
L_839A: PRINT USING S_BE20$;  ' RT3F_BD
L_839D: BX = &HAB7A
L_83A0: PRINT N_AB7A!  ' RT3F_6B
L_83A3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_83A6: DI = &HA97C
L_83A9: SI = &HAE16
L_83AC: FAC! = N_AE16! + N_A97C!  ' RT3F_7F
L_83AF: DI = &HA6F8
L_83B2: N_A6F8! = FAC!: SI = &H001A  ' RT3F_7D
L_83B5: DI = &HA6FC
L_83B8: SI = &HA9FE
L_83BB: N_A6FC! = N_A9FE!  ' RT3F_7B
L_83BE: GOSUB L_07C9
L_83C1: BX = CINT(FAC!)  ' RT3F_77
L_83C4: DI = BX
L_83C6: DI = DI * (2 ^ 1)
L_83C8: DI = DI * (2 ^ 1)
L_83CA: DI = DI + &H1850
L_83CE: SI = &HAB7A
L_83D1: N(DI) = N_AB7A!  ' RT3F_7B
L_83D4: GOSUB L_20B6
L_83D7: GOSUB L_26A6
L_83DA: DI = &H4F6C
L_83DD: SI = &HA9FE
L_83E0: FAC! = N_A9FE! + N_4F6C!  ' RT3F_7F
L_83E3: DI = &HA9FE
L_83E6: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_83E9: SI = DI
L_83EB: DI = &HA5CC
L_83EE: CompareLeft! = N_A9FE!: CompareRight! = N_A5CC!  ' RT3F_9F
L_83F1: IF CompareLeft! > CompareRight! THEN GOTO L_83F6  ' flags from L_83EE
L_83F3: GOTO L_7C16
L_83F6: GOSUB L_646D
L_83F9: GOTO L_234F
L_83FC: GOSUB L_2352
L_83FF: BX = &H10

```

### Inspection and squad statistics

```basic
L_8402: ARGPUSH BX  ' RT3E_42
L_8405: BX = 2
L_8408: LOCATE ARGS(), BX  ' RT3E_44
L_840B: ' PRINT statement begins (screen) ; RT3F_BC
L_840E: DX = BX
L_8410: BX = &HBE70
L_8413: PRINT S_BE70$  ' RT3F_6E; H newline item, ledger correction
L_8416: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8419: BX = &H11
L_841C: ARGPUSH BX  ' RT3E_42
L_841F: BX = DX
L_8421: LOCATE ARGS(), BX  ' RT3E_44
L_8424: ' PRINT statement begins (screen) ; RT3F_BC
L_8427: BX = &HBE82
L_842A: PRINT S_BE82$  ' RT3F_6E; H newline item, ledger correction
L_842D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8430: BX = &H12
L_8433: ARGPUSH BX  ' RT3E_42
L_8436: BX = DX
L_8438: LOCATE ARGS(), BX  ' RT3E_44
L_843B: ' PRINT statement begins (screen) ; RT3F_BC
L_843E: BX = &HBE96
L_8441: PRINT S_BE96$  ' RT3F_6E; H newline item, ledger correction
L_8444: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8447: BX = &H13
L_844A: ARGPUSH BX  ' RT3E_42
L_844D: BX = DX
L_844F: LOCATE ARGS(), BX  ' RT3E_44
L_8452: ' PRINT statement begins (screen) ; RT3F_BC
L_8455: BX = &HBEA6
L_8458: PRINT S_BEA6$  ' RT3F_6E; H newline item, ledger correction
L_845B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_845E: BX = &H14
L_8461: ARGPUSH BX  ' RT3E_42
L_8464: BX = DX
L_8466: LOCATE ARGS(), BX  ' RT3E_44
L_8469: ' PRINT statement begins (screen) ; RT3F_BC
L_846C: BX = &HBEBA
L_846F: PRINT S_BEBA$  ' RT3F_6E; H newline item, ledger correction
L_8472: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8475: DI = &HAE0E
L_8478: SI = &HA682
L_847B: N_AE0E! = N_A682!  ' RT3F_7B
L_847E: GOSUB L_1E7C
L_8481: DI = &HAE22
L_8484: SI = &HAE16
L_8487: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_848A: IF CompareLeft! = CompareRight! THEN GOTO L_8475  ' flags from L_8487
L_848C: DI = &HAE2E
L_848F: SI = &HAE16
L_8492: CompareLeft! = N_AE16!: CompareRight! = N_AE2E!  ' RT3F_9F
L_8495: IF CompareLeft! <> CompareRight! THEN GOTO L_849A  ' flags from L_8492
L_8497: GOTO L_234F
L_849A: SI = &HAE16
L_849D: BX = CINT(N_AE16!)  ' RT3F_75
L_84A0: ON BX GOTO L_8D47, L_84AE, L_91AD, L_98A8, L_9992  ' RT3F_5E; H ledger; raw payload in dispatch evidence
L_84AE: BX = &HBED4
L_84B1: DX = &HAB72
L_84B4: S_AB72$ = S_BED4$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_84B7: GOSUB L_1F14
L_84BA: SI = &HA9FE
L_84BD: CompareLeft! = N_A9FE!: CompareRight! = 0  ' RT3F_A7
L_84C0: IF CompareLeft! <> CompareRight! THEN GOTO L_84C5  ' flags from L_84BD
L_84C2: GOTO L_83FC
L_84C5: GOSUB L_84CB
L_84C8: GOTO L_84AE
L_84CA: RETURN
L_84CB: GOSUB L_2352
L_84CE: BX = &H10
L_84D1: ARGPUSH BX  ' RT3E_42
L_84D4: BX = 2
L_84D7: LOCATE ARGS(), BX  ' RT3E_44
L_84DA: DI = &HA6F8
L_84DD: SI = &HAFCC
L_84E0: N_A6F8! = N_AFCC!  ' RT3F_7B
L_84E3: DI = &HA6FC
L_84E6: SI = &HA9FE
L_84E9: N_A6FC! = N_A9FE!  ' RT3F_7B
L_84EC: GOSUB L_07C9
L_84EF: DI = &HB88A
L_84F2: N_B88A! = FAC!: SI = &H001A  ' RT3F_7D
L_84F5: ' PRINT statement begins (screen) ; RT3F_BC
L_84F8: SI = DI
L_84FA: DI = &HA864
L_84FD: FAC! = N(SI) + N_A864!  ' RT3F_7F
L_8500: BX = SI
L_8502: DX = BX
L_8504: BX = CINT(FAC!)  ' RT3F_77
L_8507: SI = BX
L_8509: SI = SI * (2 ^ 1)
L_850B: SI = SI * (2 ^ 1)
L_850D: SI = SI + &H1850
L_8511: BX = CINT(N(SI))  ' RT3F_75
L_8514: BX = BX * (2 ^ 1)
L_8516: BX = BX * (2 ^ 1)
L_8518: BX = BX + &H42AC
L_851C: PRINT S(BX);  ' RT3F_6A
L_851F: BX = &HAC6A
L_8522: PRINT S_AC6A$;  ' RT3F_6A
L_8525: SI = &HA9FE
L_8528: BX = CINT(N_A9FE!)  ' RT3F_75
L_852B: BX = BX * (2 ^ 1)
L_852D: BX = BX * (2 ^ 1)
L_852F: BX = BX + &H4288
L_8533: PRINT S(BX);  ' RT3F_6A
L_8536: BX = &HAF2E
L_8539: PRINT S_AF2E$;  ' RT3F_6A
L_853C: SI = DX
L_853E: DI = &HA868
L_8541: FAC! = N(SI) + N_A868!  ' RT3F_7F
L_8544: BX = CINT(FAC!)  ' RT3F_77
L_8547: SI = BX
L_8549: SI = SI * (2 ^ 1)
L_854B: SI = SI * (2 ^ 1)
L_854D: SI = SI + &H1850
L_8551: BX = CINT(N(SI))  ' RT3F_75
L_8554: BX = BX * (2 ^ 1)
L_8556: BX = BX * (2 ^ 1)
L_8558: BX = BX + &HA5F2
L_855C: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_855F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8562: BX = &H11
L_8565: ARGPUSH BX  ' RT3E_42
L_8568: BX = 2
L_856B: LOCATE ARGS(), BX  ' RT3E_44
L_856E: DI = &HAA0A
L_8571: SI = &HB88A
L_8574: FAC! = N_B88A! + N_AA0A!  ' RT3F_7F
L_8577: BX = SI
L_8579: DX = BX
L_857B: BX = CINT(FAC!)  ' RT3F_77
L_857E: SI = BX
L_8580: SI = SI * (2 ^ 1)
L_8582: SI = SI * (2 ^ 1)
L_8584: SI = SI + &H1850
L_8588: DI = &HAA0E
L_858B: FAC! = N(SI) * N_AA0E!  ' RT3F_8F
L_858E: DI = &HBEF0
L_8591: N_BEF0! = FAC!: SI = &H001A  ' RT3F_7D
L_8594: ' PRINT statement begins (screen) ; RT3F_BC
L_8597: BX = DI
L_8599: FAC! = INT(N(BX))  ' RT3D_03
L_859C: BX = &H1A
L_859F: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_85A2: BX = &HBEF4
L_85A5: PRINT S_BEF4$;  ' RT3F_6A
L_85A8: BX = DI
L_85AA: FAC! = INT(N(BX))  ' RT3D_03
L_85AD: SI = BX
L_85AF: FAC! = N(SI) - FAC!  ' RT3F_9B
L_85B2: DI = &HA840
L_85B5: FAC! = FAC! * N_A840!  ' RT3F_91
L_85B8: BX = &H1A
L_85BB: FAC! = INT(FAC!)  ' RT3D_03
L_85BE: BX = &H1A
L_85C1: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_85C4: BX = &HBEE4
L_85C7: PRINT S_BEE4$;  ' RT3F_6A
L_85CA: SI = DX
L_85CC: DI = &HA672
L_85CF: FAC! = N(SI) + N_A672!  ' RT3F_7F
L_85D2: BX = CINT(FAC!)  ' RT3F_77
L_85D5: BX = BX * (2 ^ 1)
L_85D7: BX = BX * (2 ^ 1)
L_85D9: BX = BX + &H1850
L_85DD: FAC! = INT(N(BX))  ' RT3D_03
L_85E0: BX = &H1A
L_85E3: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_85E6: BX = &HBB2E
L_85E9: PRINT S_BB2E$;  ' RT3F_6A
L_85EC: SI = DX
L_85EE: DI = &HA97C
L_85F1: FAC! = N(SI) + N_A97C!  ' RT3F_7F
L_85F4: BX = CINT(FAC!)  ' RT3F_77
L_85F7: BX = BX * (2 ^ 1)
L_85F9: BX = BX * (2 ^ 1)
L_85FB: BX = BX + &H1850
L_85FF: FAC! = INT(N(BX))  ' RT3D_03
L_8602: BX = &H1A
L_8605: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_8608: BX = &HAF2E
L_860B: PRINT S_AF2E$;  ' RT3F_6A
L_860E: SI = DX
L_8610: DI = &HA86C
L_8613: FAC! = N(SI) + N_A86C!  ' RT3F_7F
L_8616: BX = CINT(FAC!)  ' RT3F_77
L_8619: SI = BX
L_861B: SI = SI * (2 ^ 1)
L_861D: SI = SI * (2 ^ 1)
L_861F: SI = SI + &H1850
L_8623: BX = CINT(N(SI))  ' RT3F_75
L_8626: BX = BX * (2 ^ 1)
L_8628: BX = BX * (2 ^ 1)
L_862A: BX = BX + &HA4E8
L_862E: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8631: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8634: SI = &HA66E
L_8637: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_863A: GOTO L_86F2
L_863D: ' Alignment NOP
L_863E: DI = &HAECE
L_8641: SI = &HA5C4
L_8644: FAC! = N_A5C4! * N_AECE!  ' RT3F_8F
L_8647: BX = &H1A
L_864A: FAC! = INT(FAC!)  ' RT3D_03
L_864D: DI = &HAB7A
L_8650: BX = SI
L_8652: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_8655: SI = DI
L_8657: FAC! = N_AB7A! * 2 ^ (2)  ' RT3F_AB; inline=&H02
L_865B: SI = &HBE10
L_865E: DX = DI
L_8660: FAC! = N_BE10! - FAC!  ' RT3F_9B
L_8663: DI = BX
L_8665: CX = SI
L_8667: FAC! = FAC! + N(DI)  ' RT3F_81
L_866A: BX = CINT(FAC!)  ' RT3F_77
L_866D: ARGPUSH BX  ' RT3E_42
L_8670: SWAP CX, DI
L_8672: SI = DX
L_8674: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_8677: DI = &H4F94
L_867A: FAC! = FAC! + N_4F94!  ' RT3F_81
L_867D: BX = CINT(FAC!)  ' RT3F_77
L_8680: LOCATE ARGS(), BX  ' RT3E_44
L_8683: ' PRINT statement begins (screen) ; RT3F_BC
L_8686: SI = CX
L_8688: BX = CINT(N(SI))  ' RT3F_75
L_868B: BX = BX * (2 ^ 1)
L_868D: BX = BX * (2 ^ 1)
L_868F: BX = BX + &H4870
L_8693: PRINT S(BX);  ' RT3F_6A
L_8696: SI = CX
L_8698: DI = &HB88A
L_869B: FAC! = N(SI) + N_B88A!  ' RT3F_7F
L_869E: DX = BX
L_86A0: BX = CINT(FAC!)  ' RT3F_77
L_86A3: BX = BX * (2 ^ 1)
L_86A5: BX = BX * (2 ^ 1)
L_86A7: BX = BX + &H1850
L_86AB: AX = BX
L_86AD: BX = TEMP_DESC(STR$(N(BX)))  ' BX receives a temporary descriptor  ' RT3D_11
L_86B0: BX = LEN(S(BX))  ' RT3F_BA
L_86B3: WORD(BP - 6) = DX
L_86B6: DX = &H12
L_86B9: DX = DX - BX
L_86BB: BX = WORD(BP - 6)
L_86BE: BX = LEN(S(BX))  ' RT3F_BA
L_86C1: DX = DX - BX
L_86C3: BX = DX
L_86C5: DX = &HBE14
L_86C8: BX = TEMP_DESC(STRING$(BX, S_BE14$))  ' RT3D_0F
L_86CB: PRINT S(BX);  ' RT3F_6A
L_86CE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_86D1: ' PRINT statement begins (screen) ; RT3F_BC
L_86D4: BX = AX
L_86D6: BX = TEMP_DESC(STR$(N(BX)))  ' BX receives a temporary descriptor  ' RT3D_11
L_86D9: DX = 2
L_86DC: AX = CX
L_86DE: CX = 3
L_86E1: BX = TEMP_DESC(MID$(S(BX), DX, CX))  ' BX receives a temporary descriptor  ' RT3D_0A
L_86E4: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_86E7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_86EA: SI = AX
L_86EC: DI = &H4F6C
L_86EF: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_86F2: DI = &HA5C4
L_86F5: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_86F8: SI = DI
L_86FA: DI = &HA696
L_86FD: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_8700: IF CompareLeft! > CompareRight! THEN GOTO L_8705  ' flags from L_86FD
L_8702: GOTO L_863E
L_8705: GOSUB L_9296
L_8708: GOSUB L_A882
L_870B: DI = &HBEFA
L_870E: SI = &HAE16
L_8711: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_8714: IF CompareLeft! >= CompareRight! THEN GOTO L_8719  ' flags from L_8711
L_8716: GOTO L_84CA
L_8719: GOSUB L_2374
L_871C: BX = &H12
L_871F: ARGPUSH BX  ' RT3E_42
L_8722: BX = 2
L_8725: LOCATE ARGS(), BX  ' RT3E_44
L_8728: ' PRINT statement begins (screen) ; RT3F_BC
L_872B: DX = BX
L_872D: BX = &HBEFE
L_8730: PRINT S_BEFE$;  ' RT3F_6A
L_8733: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8736: BX = &HBF3A
L_8739: PRINT USING S_BF3A$;  ' RT3F_BD
L_873C: DI = &HA686
L_873F: SI = &HB88A
L_8742: FAC! = N_B88A! + N_A686!  ' RT3F_7F
L_8745: CX = SI
L_8747: AX = BX
L_8749: BX = CINT(FAC!)  ' RT3F_77
L_874C: BX = BX * (2 ^ 1)
L_874E: BX = BX * (2 ^ 1)
L_8750: BX = BX + &H1850
L_8754: PRINT N(BX)  ' RT3F_6B
L_8757: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_875A: BX = &H13
L_875D: ARGPUSH BX  ' RT3E_42
L_8760: BX = DX
L_8762: LOCATE ARGS(), BX  ' RT3E_44
L_8765: ' PRINT statement begins (screen) ; RT3F_BC
L_8768: BX = &HBF12
L_876B: PRINT S_BF12$;  ' RT3F_6A
L_876E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8771: BX = AX
L_8773: PRINT USING S(BX);  ' RT3F_BD
L_8776: SI = CX
L_8778: DI = &HA5EE
L_877B: FAC! = N(SI) + N_A5EE!  ' RT3F_7F
L_877E: BX = CINT(FAC!)  ' RT3F_77
L_8781: BX = BX * (2 ^ 1)
L_8783: BX = BX * (2 ^ 1)
L_8785: BX = BX + &H1850
L_8789: PRINT N(BX)  ' RT3F_6B
L_878C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_878F: BX = &H14
L_8792: ARGPUSH BX  ' RT3E_42
L_8795: BX = DX
L_8797: LOCATE ARGS(), BX  ' RT3E_44
L_879A: ' PRINT statement begins (screen) ; RT3F_BC
L_879D: BX = &HBF26
L_87A0: PRINT S_BF26$;  ' RT3F_6A
L_87A3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_87A6: BX = &H4F70
L_87A9: PRINT USING S_4F70$;  ' RT3F_BD
L_87AC: SI = CX
L_87AE: DI = &HA66A
L_87B1: FAC! = N(SI) + N_A66A!  ' RT3F_7F
L_87B4: BX = CINT(FAC!)  ' RT3F_77
L_87B7: BX = BX * (2 ^ 1)
L_87B9: BX = BX * (2 ^ 1)
L_87BB: BX = BX + &H1850
L_87BF: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_87C2: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_87C5: ' PRINT statement begins (screen) ; RT3F_BC
L_87C8: BX = &HBF42
L_87CB: PRINT S_BF42$  ' RT3F_6E; H newline item, ledger correction
L_87CE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_87D1: BX = &H12
L_87D4: ARGPUSH BX  ' RT3E_42
L_87D7: BX = &H18
L_87DA: LOCATE ARGS(), BX  ' RT3E_44
L_87DD: DI = &HA868
L_87E0: SI = &HB88A
L_87E3: FAC! = N_B88A! + N_A868!  ' RT3F_7F
L_87E6: BX = CINT(FAC!)  ' RT3F_77
L_87E9: SI = BX
L_87EB: SI = SI * (2 ^ 1)
L_87ED: SI = SI * (2 ^ 1)
L_87EF: SI = SI + &H1850
L_87F3: DI = &HA5C0
L_87F6: CompareLeft! = N(SI): CompareRight! = N_A5C0!  ' RT3F_9F
L_87F9: IF CompareLeft! < CompareRight! THEN GOTO L_87FE  ' flags from L_87F6
L_87FB: GOTO L_880D
L_87FE: ' PRINT statement begins (screen) ; RT3F_BC
L_8801: BX = &HBF4A
L_8804: PRINT S_BF4A$  ' RT3F_6E; H newline item, ledger correction
L_8807: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_880A: GOTO L_8819
L_880D: ' PRINT statement begins (screen) ; RT3F_BC
L_8810: BX = &HBF58
L_8813: PRINT S_BF58$  ' RT3F_6E; H newline item, ledger correction
L_8816: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8819: DI = &HBF82
L_881C: SI = &HB88A
L_881F: FAC! = N_B88A! + N_BF82!  ' RT3F_7F
L_8822: BX = CINT(FAC!)  ' RT3F_77
L_8825: SI = BX
L_8827: SI = SI * (2 ^ 1)
L_8829: SI = SI * (2 ^ 1)
L_882B: SI = SI + &H1850
L_882F: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_8832: IF CompareLeft! > CompareRight! THEN GOTO L_8837  ' flags from L_882F
L_8834: GOTO L_886D
L_8837: BX = &H13
L_883A: ARGPUSH BX  ' RT3E_42
L_883D: BX = &H19
L_8840: LOCATE ARGS(), BX  ' RT3E_44
L_8843: ' PRINT statement begins (screen) ; RT3F_BC
L_8846: DX = BX
L_8848: BX = &HBF6A
L_884B: PRINT S_BF6A$;  ' RT3F_6A
L_884E: BX = SI
L_8850: PRINT N(BX)  ' RT3F_6B
L_8853: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8856: BX = &H14
L_8859: ARGPUSH BX  ' RT3E_42
L_885C: BX = DX
L_885E: LOCATE ARGS(), BX  ' RT3E_44
L_8861: ' PRINT statement begins (screen) ; RT3F_BC
L_8864: BX = &HBF74
L_8867: PRINT S_BF74$  ' RT3F_6E; H newline item, ledger correction
L_886A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_886D: DI = &HBF82
L_8870: SI = &HB88A
L_8873: FAC! = N_B88A! + N_BF82!  ' RT3F_7F
L_8876: BX = CINT(FAC!)  ' RT3F_77
L_8879: SI = BX
L_887B: SI = SI * (2 ^ 1)
L_887D: SI = SI * (2 ^ 1)
L_887F: SI = SI + &H1850
L_8883: DI = &H4F94
L_8886: CompareLeft! = N(SI): CompareRight! = N_4F94!  ' RT3F_9F
L_8889: IF CompareLeft! > CompareRight! THEN GOTO L_888E  ' flags from L_8886
L_888B: GOTO L_88A6
L_888E: BX = &H15
L_8891: ARGPUSH BX  ' RT3E_42
L_8894: BX = &H19
L_8897: LOCATE ARGS(), BX  ' RT3E_44
L_889A: ' PRINT statement begins (screen) ; RT3F_BC
L_889D: BX = &HBF86
L_88A0: PRINT S_BF86$  ' RT3F_6E; H newline item, ledger correction
L_88A3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_88A6: DI = &HBF82
L_88A9: SI = &HB88A
L_88AC: FAC! = N_B88A! + N_BF82!  ' RT3F_7F
L_88AF: BX = CINT(FAC!)  ' RT3F_77
L_88B2: SI = BX
L_88B4: SI = SI * (2 ^ 1)
L_88B6: SI = SI * (2 ^ 1)
L_88B8: SI = SI + &H1850
L_88BC: DI = &HA676
L_88BF: CompareLeft! = N(SI): CompareRight! = N_A676!  ' RT3F_9F
L_88C2: IF CompareLeft! > CompareRight! THEN GOTO L_88C7  ' flags from L_88BF
L_88C4: GOTO L_88DF
L_88C7: BX = &H16
L_88CA: ARGPUSH BX  ' RT3E_42
L_88CD: BX = &H19
L_88D0: LOCATE ARGS(), BX  ' RT3E_44
L_88D3: ' PRINT statement begins (screen) ; RT3F_BC
L_88D6: BX = &HBF98
L_88D9: PRINT S_BF98$;  ' RT3F_6A
L_88DC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_88DF: DI = &HBF82
L_88E2: SI = &HB88A
L_88E5: FAC! = N_B88A! + N_BF82!  ' RT3F_7F
L_88E8: BX = CINT(FAC!)  ' RT3F_77
L_88EB: SI = BX
L_88ED: SI = SI * (2 ^ 1)
L_88EF: SI = SI * (2 ^ 1)
L_88F1: SI = SI + &H1850
L_88F5: DI = &HA696
L_88F8: CompareLeft! = N(SI): CompareRight! = N_A696!  ' RT3F_9F
L_88FB: IF CompareLeft! > CompareRight! THEN GOTO L_8900  ' flags from L_88F8
L_88FD: GOTO L_890C
L_8900: ' PRINT statement begins (screen) ; RT3F_BC
L_8903: BX = &HBFA4
L_8906: PRINT S_BFA4$  ' RT3F_6E; H newline item, ledger correction
L_8909: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_890C: DI = &HBF82
L_890F: SI = &HB88A
L_8912: FAC! = N_B88A! + N_BF82!  ' RT3F_7F
L_8915: BX = CINT(FAC!)  ' RT3F_77
L_8918: SI = BX
L_891A: SI = SI * (2 ^ 1)
L_891C: SI = SI * (2 ^ 1)
L_891E: SI = SI + &H1850
L_8922: DI = &HA850
L_8925: CompareLeft! = N(SI): CompareRight! = N_A850!  ' RT3F_9F
L_8928: IF CompareLeft! > CompareRight! THEN GOTO L_892D  ' flags from L_8925
L_892A: GOTO L_8945
L_892D: BX = &H17
L_8930: ARGPUSH BX  ' RT3E_42
L_8933: BX = &H19
L_8936: LOCATE ARGS(), BX  ' RT3E_44
L_8939: ' PRINT statement begins (screen) ; RT3F_BC
L_893C: BX = &HBFAE
L_893F: PRINT S_BFAE$  ' RT3F_6E; H newline item, ledger correction
L_8942: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8945: BX = &H15
L_8948: ARGPUSH BX  ' RT3E_42
L_894B: BX = 2
L_894E: LOCATE ARGS(), BX  ' RT3E_44
L_8951: ' PRINT statement begins (screen) ; RT3F_BC
L_8954: DX = BX
L_8956: BX = &HBFC0
L_8959: PRINT S_BFC0$;  ' RT3F_6A
L_895C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_895F: BX = &H4F70
L_8962: PRINT USING S_4F70$;  ' RT3F_BD
L_8965: DI = &HAE44
L_8968: SI = &HB88A
L_896B: FAC! = N_B88A! + N_AE44!  ' RT3F_7F
L_896E: CX = SI
L_8970: AX = BX
L_8972: BX = CINT(FAC!)  ' RT3F_77
L_8975: BX = BX * (2 ^ 1)
L_8977: BX = BX * (2 ^ 1)
L_8979: BX = BX + &H1850
L_897D: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_8980: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8983: ' PRINT statement begins (screen) ; RT3F_BC
L_8986: BX = &HBF42
L_8989: PRINT S_BF42$  ' RT3F_6E; H newline item, ledger correction
L_898C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_898F: BX = &H16
L_8992: ARGPUSH BX  ' RT3E_42
L_8995: BX = DX
L_8997: LOCATE ARGS(), BX  ' RT3E_44
L_899A: ' PRINT statement begins (screen) ; RT3F_BC
L_899D: BX = &HBFD4
L_89A0: PRINT S_BFD4$;  ' RT3F_6A
L_89A3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_89A6: BX = AX
L_89A8: PRINT USING S(BX);  ' RT3F_BD
L_89AB: SI = CX
L_89AD: DI = &HA840
L_89B0: FAC! = N(SI) + N_A840!  ' RT3F_7F
L_89B3: BX = CINT(FAC!)  ' RT3F_77
L_89B6: BX = BX * (2 ^ 1)
L_89B8: BX = BX * (2 ^ 1)
L_89BA: BX = BX + &H1850
L_89BE: PRINT N(BX)  ' RT3F_6B
L_89C1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_89C4: BX = &H17
L_89C7: ARGPUSH BX  ' RT3E_42
L_89CA: BX = DX
L_89CC: LOCATE ARGS(), BX  ' RT3E_44
L_89CF: ' PRINT statement begins (screen) ; RT3F_BC
L_89D2: BX = &HBFE8
L_89D5: PRINT S_BFE8$;  ' RT3F_6A
L_89D8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_89DB: BX = AX
L_89DD: PRINT USING S(BX);  ' RT3F_BD
L_89E0: SI = CX
L_89E2: DI = &HA5CC
L_89E5: FAC! = N(SI) + N_A5CC!  ' RT3F_7F
L_89E8: BX = CINT(FAC!)  ' RT3F_77
L_89EB: BX = BX * (2 ^ 1)
L_89ED: BX = BX * (2 ^ 1)
L_89EF: BX = BX + &H1850
L_89F3: PRINT N(BX)  ' RT3F_6B
L_89F6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_89F9: GOSUB L_A882
L_89FC: DI = &HBEFA
L_89FF: SI = &HAE16
L_8A02: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_8A05: IF CompareLeft! >= CompareRight! THEN GOTO L_8A0A  ' flags from L_8A02
L_8A07: GOTO L_84CA
L_8A0A: GOSUB L_2374
L_8A0D: SI = &HA66E
L_8A10: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_8A13: GOTO L_8ABF
L_8A16: DI = &HA696
L_8A19: SI = &HA5C4
L_8A1C: FAC! = N_A5C4! / N_A696!  ' RT3F_87
L_8A1F: BX = &H1A
L_8A22: FAC! = INT(FAC!)  ' RT3D_03
L_8A25: BX = DI
L_8A27: DI = &HAB7A
L_8A2A: DX = SI
L_8A2C: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_8A2F: SWAP BX, DI
L_8A31: SI = BX
L_8A33: FAC! = N_AB7A! * N(DI)  ' RT3F_8F
L_8A36: SI = &HB054
L_8A39: FAC! = N_B054! - FAC!  ' RT3F_9B
L_8A3C: DI = DX
L_8A3E: FAC! = FAC! + N(DI)  ' RT3F_81
L_8A41: CX = BX
L_8A43: BX = CINT(FAC!)  ' RT3F_77
L_8A46: ARGPUSH BX  ' RT3E_42
L_8A49: SI = CX
L_8A4B: DI = &HA9A4
L_8A4E: FAC! = N(SI) * N_A9A4!  ' RT3F_8F
L_8A51: DI = &H4F94
L_8A54: FAC! = FAC! + N_4F94!  ' RT3F_81
L_8A57: BX = CINT(FAC!)  ' RT3F_77
L_8A5A: LOCATE ARGS(), BX  ' RT3E_44
L_8A5D: ' PRINT statement begins (screen) ; RT3F_BC
L_8A60: SI = DX
L_8A62: DI = &H4F6C
L_8A65: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_8A68: T_00! = FAC!  ' RT3F_71; inline=&H80
L_8A6C: BX = CINT(FAC!)  ' RT3F_77
L_8A6F: BX = BX * (2 ^ 1)
L_8A71: BX = BX * (2 ^ 1)
L_8A73: BX = BX + &H42E4
L_8A77: PRINT S(BX);  ' RT3F_6A
L_8A7A: BX = LEN(S(BX))  ' RT3F_BA
L_8A7D: BX = BX - &H11
L_8A80: BX = -BX
L_8A82: CX = DX
L_8A84: DX = &HBE14
L_8A87: BX = TEMP_DESC(STRING$(BX, S_BE14$))  ' RT3D_0F
L_8A8A: PRINT S(BX);  ' RT3F_6A
L_8A8D: SI = CX
L_8A8F: DI = &HB05C
L_8A92: FAC! = N(SI) + N_B05C!  ' RT3F_7F
L_8A95: DI = &HA6E4
L_8A98: N_A6E4! = FAC!: SI = &H001A  ' RT3F_7D
L_8A9B: DI = &HA6E8
L_8A9E: SI = &HA9FE
L_8AA1: N_A6E8! = N_A9FE!  ' RT3F_7B
L_8AA4: GOSUB L_0797
L_8AA7: DI = &HA870
L_8AAA: FAC! = FAC! + N_A870!  ' RT3F_81
L_8AAD: BX = CINT(FAC!)  ' RT3F_77
L_8AB0: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_8AB3: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8AB6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8AB9: SI = &HA87C
L_8ABC: FAC! = N_A87C!: DI = &H001E  ' RT3F_6F
L_8ABF: DI = &HA5C4
L_8AC2: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_8AC5: SI = DI
L_8AC7: DI = &HA5EE
L_8ACA: CompareLeft! = N_A5C4!: CompareRight! = N_A5EE!  ' RT3F_9F
L_8ACD: IF CompareLeft! > CompareRight! THEN GOTO L_8AD2  ' flags from L_8ACA
L_8ACF: GOTO L_8A16
L_8AD2: GOSUB L_A882
L_8AD5: DI = &HBEFA
L_8AD8: SI = &HAE16
L_8ADB: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_8ADE: IF CompareLeft! >= CompareRight! THEN GOTO L_8AE3  ' flags from L_8ADB
L_8AE0: GOTO L_84CA
L_8AE3: GOSUB L_2374
L_8AE6: BX = &H12
L_8AE9: ARGPUSH BX  ' RT3E_42
L_8AEC: BX = 2
L_8AEF: LOCATE ARGS(), BX  ' RT3E_44
L_8AF2: ' PRINT statement begins (screen) ; RT3F_BC
L_8AF5: DX = BX
L_8AF7: BX = &HBFFC
L_8AFA: PRINT S_BFFC$;  ' RT3F_6A
L_8AFD: DI = &HA870
L_8B00: SI = &HB88A
L_8B03: FAC! = N_B88A! + N_A870!  ' RT3F_7F
L_8B06: BX = SI
L_8B08: CX = BX
L_8B0A: BX = CINT(FAC!)  ' RT3F_77
L_8B0D: BX = BX * (2 ^ 1)
L_8B0F: BX = BX * (2 ^ 1)
L_8B11: BX = BX + &H1850
L_8B15: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_8B18: BX = &HBB2E
L_8B1B: PRINT S_BB2E$;  ' RT3F_6A
L_8B1E: SI = CX
L_8B20: DI = &HA68E
L_8B23: FAC! = N(SI) + N_A68E!  ' RT3F_7F
L_8B26: BX = CINT(FAC!)  ' RT3F_77
L_8B29: BX = BX * (2 ^ 1)
L_8B2B: BX = BX * (2 ^ 1)
L_8B2D: BX = BX + &H1850
L_8B31: PRINT N(BX)  ' RT3F_6B
L_8B34: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8B37: BX = &H13
L_8B3A: ARGPUSH BX  ' RT3E_42
L_8B3D: BX = DX
L_8B3F: LOCATE ARGS(), BX  ' RT3E_44
L_8B42: ' PRINT statement begins (screen) ; RT3F_BC
L_8B45: BX = &HC014
L_8B48: PRINT S_C014$;  ' RT3F_6A
L_8B4B: SI = CX
L_8B4D: DI = &HB49C
L_8B50: FAC! = N(SI) + N_B49C!  ' RT3F_7F
L_8B53: BX = CINT(FAC!)  ' RT3F_77
L_8B56: BX = BX * (2 ^ 1)
L_8B58: BX = BX * (2 ^ 1)
L_8B5A: BX = BX + &H1850
L_8B5E: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_8B61: BX = &HC05C
L_8B64: PRINT S_C05C$  ' RT3F_6E; H newline item, ledger correction
L_8B67: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8B6A: BX = &H14
L_8B6D: ARGPUSH BX  ' RT3E_42
L_8B70: BX = DX
L_8B72: LOCATE ARGS(), BX  ' RT3E_44
L_8B75: ' PRINT statement begins (screen) ; RT3F_BC
L_8B78: BX = &HC02C
L_8B7B: PRINT S_C02C$;  ' RT3F_6A
L_8B7E: SI = CX
L_8B80: DI = &HA85C
L_8B83: FAC! = N(SI) + N_A85C!  ' RT3F_7F
L_8B86: BX = CINT(FAC!)  ' RT3F_77
L_8B89: BX = BX * (2 ^ 1)
L_8B8B: BX = BX * (2 ^ 1)
L_8B8D: BX = BX + &H1850
L_8B91: PRINT N(BX)  ' RT3F_6B
L_8B94: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8B97: BX = &H15
L_8B9A: ARGPUSH BX  ' RT3E_42
L_8B9D: BX = DX
L_8B9F: LOCATE ARGS(), BX  ' RT3E_44
L_8BA2: ' PRINT statement begins (screen) ; RT3F_BC
L_8BA5: BX = &HC044
L_8BA8: PRINT S_C044$;  ' RT3F_6A
L_8BAB: SI = CX
L_8BAD: DI = &HB480
L_8BB0: FAC! = N(SI) + N_B480!  ' RT3F_7F
L_8BB3: BX = CINT(FAC!)  ' RT3F_77
L_8BB6: BX = BX * (2 ^ 1)
L_8BB8: BX = BX * (2 ^ 1)
L_8BBA: BX = BX + &H1850
L_8BBE: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_8BC1: BX = &HC062
L_8BC4: PRINT S_C062$  ' RT3F_6E; H newline item, ledger correction
L_8BC7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8BCA: GOSUB L_A882
L_8BCD: DI = &HBEFA
L_8BD0: SI = &HAE16
L_8BD3: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_8BD6: IF CompareLeft! >= CompareRight! THEN GOTO L_8BDB  ' flags from L_8BD3
L_8BD8: GOTO L_84CA
L_8BDB: GOSUB L_2374
L_8BDE: DI = &HA5C4
L_8BE1: SI = &HA844
L_8BE4: N_A5C4! = N_A844!  ' RT3F_7B
L_8BE7: SI = &HAFFE
L_8BEA: FAC! = N_AFFE!: DI = &H001E  ' RT3F_6F
L_8BED: GOTO L_8CC9
L_8BF0: DI = &H4F94
L_8BF3: SI = &HAF0E
L_8BF6: FAC! = N_AF0E! + N_4F94!  ' RT3F_7F
L_8BF9: BX = SI
L_8BFB: DX = BX
L_8BFD: BX = CINT(FAC!)  ' RT3F_77
L_8C00: SI = BX
L_8C02: SI = SI * (2 ^ 1)
L_8C04: SI = SI * (2 ^ 1)
L_8C06: SI = SI + &H1850
L_8C0A: BX = DI
L_8C0C: DI = &HA9FE
L_8C0F: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_8C12: CX = 0
L_8C15: IF CompareLeft! <> CompareRight! THEN GOTO L_8C18  ' flags from L_8C0F
L_8C17: CX = CX - 1
L_8C18: SI = DX
L_8C1A: AX = BX
L_8C1C: BX = CINT(N(SI))  ' RT3F_75
L_8C1F: SI = BX
L_8C21: SI = SI * (2 ^ 1)
L_8C23: SI = SI * (2 ^ 1)
L_8C25: SI = SI + &H1850
L_8C29: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_8C2C: BX = 0
L_8C2F: IF CompareLeft! <= CompareRight! THEN GOTO L_8C32  ' flags from L_8C29
L_8C31: BX = BX - 1
L_8C32: BX = BX AND CX
L_8C34: DI = &HA66A
L_8C37: DX = SI
L_8C39: SI = &HA5C4
L_8C3C: CompareLeft! = N_A5C4!: CompareRight! = N_A66A!  ' RT3F_9F
L_8C3F: CX = 0
L_8C42: IF CompareLeft! >= CompareRight! THEN GOTO L_8C45  ' flags from L_8C3C
L_8C44: CX = CX - 1
L_8C45: CX = CX AND BX
L_8C47: CompareLeft% = CX: CompareRight% = 0
L_8C49: IF CompareLeft% <> CompareRight% THEN GOTO L_8C4E  ' flags from L_8C47
L_8C4B: GOTO L_8CC0
L_8C4E: DI = &H4F6C
L_8C51: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_8C54: DI = SI
L_8C56: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_8C59: SI = DI
L_8C5B: DI = &HA850
L_8C5E: FAC! = N(SI) / N_A850!  ' RT3F_87
L_8C61: BX = &H1A
L_8C64: FAC! = INT(FAC!)  ' RT3D_03
L_8C67: BX = DI
L_8C69: DI = &HAB7A
L_8C6C: CX = SI
L_8C6E: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_8C71: SWAP BX, DI
L_8C73: SI = BX
L_8C75: FAC! = N_AB7A! * N(DI)  ' RT3F_8F
L_8C78: SI = &HB05C
L_8C7B: FAC! = N_B05C! - FAC!  ' RT3F_9B
L_8C7E: DI = CX
L_8C80: FAC! = FAC! + N(DI)  ' RT3F_81
L_8C83: CX = BX
L_8C85: BX = CINT(FAC!)  ' RT3F_77
L_8C88: ARGPUSH BX  ' RT3E_42
L_8C8B: SI = CX
L_8C8D: DI = &HBE10
L_8C90: FAC! = N(SI) * N_BE10!  ' RT3F_8F
L_8C93: DI = AX
L_8C95: FAC! = FAC! + N(DI)  ' RT3F_81
L_8C98: BX = CINT(FAC!)  ' RT3F_77
L_8C9B: LOCATE ARGS(), BX  ' RT3E_44
L_8C9E: ' PRINT statement begins (screen) ; RT3F_BC
L_8CA1: SI = DX
L_8CA3: DI = &HA844
L_8CA6: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_8CA9: BX = CINT(FAC!)  ' RT3F_77
L_8CAC: BX = BX * (2 ^ 1)
L_8CAE: BX = BX * (2 ^ 1)
L_8CB0: BX = BX + &H4534
L_8CB4: DX = &H12
L_8CB7: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_8CBA: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8CBD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8CC0: DI = &HA5C0
L_8CC3: SI = &HAF0E
L_8CC6: FAC! = N_AF0E! + N_A5C0!  ' RT3F_7F
L_8CC9: DI = &HAF0E
L_8CCC: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_8CCF: SI = DI
L_8CD1: DI = &HB002
L_8CD4: CompareLeft! = N_AF0E!: CompareRight! = N_B002!  ' RT3F_9F
L_8CD7: IF CompareLeft! > CompareRight! THEN GOTO L_8CDC  ' flags from L_8CD4
L_8CD9: GOTO L_8BF0
L_8CDC: DI = &HA844
L_8CDF: SI = &HA5C4
L_8CE2: CompareLeft! = N_A5C4!: CompareRight! = N_A844!  ' RT3F_9F
L_8CE5: IF CompareLeft! > CompareRight! THEN GOTO L_8CEA  ' flags from L_8CE2
L_8CE7: GOTO L_8CFB
L_8CEA: GOSUB L_A882
L_8CED: DI = &HBEFA
L_8CF0: SI = &HAE16
L_8CF3: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_8CF6: IF CompareLeft! >= CompareRight! THEN GOTO L_8CFB  ' flags from L_8CF3
L_8CF8: GOTO L_84CA
L_8CFB: DI = &HB400
L_8CFE: SI = &HC06A

```

### Ship status

```basic
L_8D01: N_B400! = N_C06A!  ' RT3F_7B
L_8D04: GOSUB L_A596
L_8D07: GOSUB L_A882
L_8D0A: DI = &HBEFA
L_8D0D: SI = &HAE16
L_8D10: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_8D13: BX = 0
L_8D16: IF CompareLeft! >= CompareRight! THEN GOTO L_8D19  ' flags from L_8D10
L_8D18: BX = BX - 1
L_8D19: DI = &HB440
L_8D1C: SI = &HAF0E
L_8D1F: CompareLeft! = N_AF0E!: CompareRight! = N_B440!  ' RT3F_9F
L_8D22: DX = 0
L_8D25: IF CompareLeft! <= CompareRight! THEN GOTO L_8D28  ' flags from L_8D1F
L_8D27: DX = DX - 1
L_8D28: DX = DX OR BX
L_8D2A: CompareLeft% = DX: CompareRight% = 0
L_8D2C: IF CompareLeft% = CompareRight% THEN GOTO L_8D31  ' flags from L_8D2A
L_8D2E: GOTO L_84CA
L_8D31: GOSUB L_2374
L_8D34: GOSUB L_A68C
L_8D37: DI = &HB054
L_8D3A: SI = &HB438
L_8D3D: CompareLeft! = N_B438!: CompareRight! = N_B054!  ' RT3F_9F
L_8D40: IF CompareLeft! <> CompareRight! THEN GOTO L_8D45  ' flags from L_8D3D
L_8D42: GOTO L_84CA
L_8D45: GOTO L_8D07
L_8D47: DI = &H4F6C
L_8D4A: SI = &H18FC
L_8D4D: CompareLeft! = N_18FC!: CompareRight! = N_4F6C!  ' RT3F_9F
L_8D50: IF CompareLeft! < CompareRight! THEN GOTO L_8D55  ' flags from L_8D4D
L_8D52: GOTO L_8D76
L_8D55: GOSUB L_2352
L_8D58: BX = &H14
L_8D5B: ARGPUSH BX  ' RT3E_42
L_8D5E: BX = 2
L_8D61: LOCATE ARGS(), BX  ' RT3E_44
L_8D64: ' PRINT statement begins (screen) ; RT3F_BC
L_8D67: BX = &HC06E
L_8D6A: PRINT S_C06E$  ' RT3F_6E; H newline item, ledger correction
L_8D6D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8D70: GOSUB L_20B6
L_8D73: GOTO L_83FC
L_8D76: GOSUB L_2352
L_8D79: BX = &H10
L_8D7C: ARGPUSH BX  ' RT3E_42
L_8D7F: BX = 2
L_8D82: LOCATE ARGS(), BX  ' RT3E_44
L_8D85: ' PRINT statement begins (screen) ; RT3F_BC
L_8D88: DX = BX
L_8D8A: BX = &HC0A4
L_8D8D: PRINT S_C0A4$;  ' RT3F_6A
L_8D90: BX = &H488C
L_8D93: PRINT S_488C$;  ' RT3F_6A
L_8D96: BX = &HC086
L_8D99: PRINT S_C086$  ' RT3F_6E; H newline item, ledger correction
L_8D9C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8D9F: BX = &H11
L_8DA2: ARGPUSH BX  ' RT3E_42
L_8DA5: BX = DX
L_8DA7: LOCATE ARGS(), BX  ' RT3E_44
L_8DAA: ' PRINT statement begins (screen) ; RT3F_BC
L_8DAD: DI = &HA844
L_8DB0: SI = &H18FC
L_8DB3: FAC! = N_18FC! + N_A844!  ' RT3F_7F
L_8DB6: BX = CINT(FAC!)  ' RT3F_77
L_8DB9: BX = BX * (2 ^ 1)
L_8DBB: BX = BX * (2 ^ 1)
L_8DBD: BX = BX + &H4324
L_8DC1: PRINT S(BX);  ' RT3F_6A
L_8DC4: BX = &HC098
L_8DC7: PRINT S_C098$;  ' RT3F_6A
L_8DCA: SI = &H18C4
L_8DCD: BX = CINT(N_18C4!)  ' RT3F_75
L_8DD0: BX = BX * (2 ^ 1)
L_8DD2: BX = BX * (2 ^ 1)
L_8DD4: BX = BX + &H4348
L_8DD8: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8DDB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8DDE: GOSUB L_965F
L_8DE1: BX = &H13
L_8DE4: ARGPUSH BX  ' RT3E_42
L_8DE7: BX = 2
L_8DEA: LOCATE ARGS(), BX  ' RT3E_44
L_8DED: ' PRINT statement begins (screen) ; RT3F_BC
L_8DF0: DX = BX
L_8DF2: BX = &HC0AC
L_8DF5: PRINT S_C0AC$;  ' RT3F_6A
L_8DF8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8DFB: BX = &H4F74
L_8DFE: PRINT USING S_4F74$;  ' RT3F_BD
L_8E01: CX = BX
L_8E03: BX = &H1904
L_8E06: PRINT N_1904!;  ' RT3F_67; H expanded ledger
L_8E09: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E0C: ' PRINT statement begins (screen) ; RT3F_BC
L_8E0F: BX = &HC0E2
L_8E12: PRINT S_C0E2$  ' RT3F_6E; H newline item, ledger correction
L_8E15: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E18: AX = BX
L_8E1A: BX = &H14
L_8E1D: ARGPUSH BX  ' RT3E_42
L_8E20: BX = DX
L_8E22: LOCATE ARGS(), BX  ' RT3E_44
L_8E25: ' PRINT statement begins (screen) ; RT3F_BC
L_8E28: BX = &HC0BE
L_8E2B: PRINT S_C0BE$;  ' RT3F_6A
L_8E2E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E31: BX = CX
L_8E33: PRINT USING S(BX);  ' RT3F_BD
L_8E36: DI = &HA686
L_8E39: SI = &H1910
L_8E3C: FAC! = N_1910! / N_A686!  ' RT3F_87
L_8E3F: BX = &H1A
L_8E42: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_8E45: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E48: ' PRINT statement begins (screen) ; RT3F_BC
L_8E4B: BX = AX
L_8E4D: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8E50: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E53: BX = &H15
L_8E56: ARGPUSH BX  ' RT3E_42
L_8E59: BX = DX
L_8E5B: LOCATE ARGS(), BX  ' RT3E_44
L_8E5E: ' PRINT statement begins (screen) ; RT3F_BC
L_8E61: BX = &HC0D0
L_8E64: PRINT S_C0D0$;  ' RT3F_6A
L_8E67: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E6A: BX = CX
L_8E6C: PRINT USING S(BX);  ' RT3F_BD
L_8E6F: SI = &H1918
L_8E72: FAC! = N_1918! / N(DI)  ' RT3F_87
L_8E75: BX = &H1A
L_8E78: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_8E7B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E7E: ' PRINT statement begins (screen) ; RT3F_BC
L_8E81: BX = AX
L_8E83: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8E86: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8E89: BX = &H16
L_8E8C: ARGPUSH BX  ' RT3E_42
L_8E8F: BX = 2
L_8E92: LOCATE ARGS(), BX  ' RT3E_44
L_8E95: ' PRINT statement begins (screen) ; RT3F_BC
L_8E98: BX = &HC0EA
L_8E9B: PRINT S_C0EA$;  ' RT3F_6A
L_8E9E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8EA1: BX = &H4F74
L_8EA4: PRINT USING S_4F74$;  ' RT3F_BD
L_8EA7: BX = &H1908
L_8EAA: PRINT N_1908!;  ' RT3F_67; H expanded ledger
L_8EAD: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8EB0: ' PRINT statement begins (screen) ; RT3F_BC
L_8EB3: BX = &HC0E2
L_8EB6: PRINT S_C0E2$  ' RT3F_6E; H newline item, ledger correction
L_8EB9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8EBC: BX = &H13
L_8EBF: ARGPUSH BX  ' RT3E_42
L_8EC2: DX = BX
L_8EC4: BX = &H19
L_8EC7: LOCATE ARGS(), BX  ' RT3E_44
L_8ECA: ' PRINT statement begins (screen) ; RT3F_BC
L_8ECD: CX = BX
L_8ECF: BX = &HC0FC
L_8ED2: PRINT S_C0FC$;  ' RT3F_6A
L_8ED5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8ED8: BX = DX
L_8EDA: ARGPUSH BX  ' RT3E_42
L_8EDD: BX = &H192C
L_8EE0: DX = BX
L_8EE2: BX = TEMP_DESC(STR$(N_192C!))  ' BX receives a temporary descriptor  ' RT3D_11
L_8EE5: BX = LEN(S(BX))  ' RT3F_BA
L_8EE8: BX = BX - &H29
L_8EEB: BX = -BX
L_8EED: LOCATE ARGS(), BX  ' RT3E_44
L_8EF0: ' PRINT statement begins (screen) ; RT3F_BC
L_8EF3: BX = DX
L_8EF5: BX = TEMP_DESC(STR$(N(BX)))  ' BX receives a temporary descriptor  ' RT3D_11
L_8EF8: BX = LEN(S(BX))  ' RT3F_BA
L_8EFB: BX = BX - 1
L_8EFC: SWAP DX, BX
L_8EFE: BX = TEMP_DESC(STR$(N(BX)))  ' BX receives a temporary descriptor  ' RT3D_11
L_8F01: BX = TEMP_DESC(RIGHT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0C
L_8F04: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_8F07: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F0A: BX = &H17
L_8F0D: ARGPUSH BX  ' RT3E_42
L_8F10: BX = 2
L_8F13: LOCATE ARGS(), BX  ' RT3E_44
L_8F16: ' PRINT statement begins (screen) ; RT3F_BC
L_8F19: BX = &HC10E
L_8F1C: PRINT S_C10E$;  ' RT3F_6A
L_8F1F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F22: BX = &HC120
L_8F25: PRINT USING S_C120$;  ' RT3F_BD
L_8F28: DI = &HA704
L_8F2B: SI = &HA984
L_8F2E: N_A704! = N_A984!  ' RT3F_7B
L_8F31: GOSUB L_07E8
L_8F34: BX = &H1A
L_8F37: PRINT FAC!  ' RT3F_6B
L_8F3A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F3D: BX = &H14
L_8F40: ARGPUSH BX  ' RT3E_42
L_8F43: BX = &H19
L_8F46: LOCATE ARGS(), BX  ' RT3E_44
L_8F49: ' PRINT statement begins (screen) ; RT3F_BC
L_8F4C: BX = &HC12C
L_8F4F: PRINT S_C12C$;  ' RT3F_6A
L_8F52: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F55: BX = &HBF3A
L_8F58: PRINT USING S_BF3A$;  ' RT3F_BD
L_8F5B: BX = &H191C
L_8F5E: PRINT N_191C!;  ' RT3F_67; H expanded ledger
L_8F61: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F64: ' PRINT statement begins (screen) ; RT3F_BC
L_8F67: BX = &HC05C
L_8F6A: PRINT S_C05C$  ' RT3F_6E; H newline item, ledger correction
L_8F6D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F70: BX = &H15
L_8F73: ARGPUSH BX  ' RT3E_42
L_8F76: BX = &H19
L_8F79: LOCATE ARGS(), BX  ' RT3E_44
L_8F7C: ' PRINT statement begins (screen) ; RT3F_BC
L_8F7F: BX = &HC13C
L_8F82: PRINT S_C13C$;  ' RT3F_6A
L_8F85: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F88: BX = &HA648
L_8F8B: PRINT USING S_A648$;  ' RT3F_BD
L_8F8E: BX = &HC14E
L_8F91: PRINT N_C14E!  ' RT3F_6B
L_8F94: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8F97: BX = &H16
L_8F9A: ARGPUSH BX  ' RT3E_42
L_8F9D: BX = &H19
L_8FA0: LOCATE ARGS(), BX  ' RT3E_44
L_8FA3: ' PRINT statement begins (screen) ; RT3F_BC
L_8FA6: BX = &HC152
L_8FA9: PRINT S_C152$;  ' RT3F_6A
L_8FAC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8FAF: BX = &HA648
L_8FB2: PRINT USING S_A648$;  ' RT3F_BD
L_8FB5: BX = &H1998
L_8FB8: PRINT N_1998!  ' RT3F_6B
L_8FBB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_8FBE: BX = &H18
L_8FC1: ARGPUSH BX  ' RT3E_42
L_8FC4: BX = &HC
L_8FC7: LOCATE ARGS(), BX  ' RT3E_44
L_8FCA: GOSUB L_A882
L_8FCD: DI = &HBEFA
L_8FD0: SI = &HAE16
L_8FD3: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_8FD6: IF CompareLeft! >= CompareRight! THEN GOTO L_8FDB  ' flags from L_8FD3
L_8FD8: GOTO L_83FC
L_8FDB: GOSUB L_2374
L_8FDE: SI = &HA66E
L_8FE1: FAC! = N_A66E!: DI = &H001E  ' RT3F_6F
L_8FE4: GOTO L_9096
L_8FE7: ' Alignment NOP
L_8FE8: DI = &HA696
L_8FEB: SI = &HA5C4
L_8FEE: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_8FF1: AX = 0
L_8FF4: IF CompareLeft! <= CompareRight! THEN GOTO L_8FF7  ' flags from L_8FEE
L_8FF6: AX = AX - 1
L_8FF7: BX = &HC
L_8FFA: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_8FFC: BX = AX
L_8FFE: FAC! = CSNG(BX)  ' RT3F_57
L_9001: BX = DI
L_9003: FAC! = N(SI) - FAC!  ' RT3F_9B
L_9006: DI = &HA858
L_9009: DX = SI
L_900B: N_A858! = FAC!: SI = &H001A  ' RT3F_7D
L_900E: SWAP BX, DI
L_9010: SI = DX
L_9012: FAC! = N(SI) / N(DI)  ' RT3F_87
L_9015: CX = BX
L_9017: BX = &H1A
L_901A: FAC! = INT(FAC!)  ' RT3D_03
L_901D: BX = DI
L_901F: DI = &HAB7A
L_9022: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_9025: SI = CX
L_9027: AX = BX
L_9029: BX = CINT(N(SI))  ' RT3F_75
L_902C: SI = BX
L_902E: SI = SI * (2 ^ 1)
L_9030: SI = SI * (2 ^ 1)
L_9032: BX = SI
L_9034: SI = SI + &H1850
L_9038: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_903B: IF CompareLeft! > CompareRight! THEN GOTO L_9040  ' flags from L_9038
L_903D: GOTO L_908D
L_9040: SWAP DI, AX
L_9041: SWAP SI, AX
L_9042: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_9045: CX = SI
L_9047: SI = &HB05C
L_904A: FAC! = N_B05C! - FAC!  ' RT3F_9B
L_904D: DI = DX
L_904F: FAC! = FAC! + N(DI)  ' RT3F_81
L_9052: DX = BX
L_9054: BX = CINT(FAC!)  ' RT3F_77
L_9057: ARGPUSH BX  ' RT3E_42
L_905A: SI = CX
L_905C: DI = &HBE10
L_905F: FAC! = N(SI) * N_BE10!  ' RT3F_8F
L_9062: DI = &H4F94
L_9065: FAC! = FAC! + N_4F94!  ' RT3F_81
L_9068: BX = CINT(FAC!)  ' RT3F_77
L_906B: LOCATE ARGS(), BX  ' RT3E_44
L_906E: ' PRINT statement begins (screen) ; RT3F_BC
L_9071: SI = AX
L_9073: BX = CINT(N(SI))  ' RT3F_75
L_9076: BX = BX * (2 ^ 1)
L_9078: BX = BX * (2 ^ 1)
L_907A: BX = BX + &HA62C
L_907E: PRINT S(BX);  ' RT3F_6A
L_9081: DX = DX + &H4814
L_9085: BX = DX
L_9087: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_908A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_908D: DI = &H4F6C
L_9090: SI = &HA5C4
L_9093: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_9096: DI = &HA5C4
L_9099: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_909C: SI = DI
L_909E: DI = &HA686
L_90A1: CompareLeft! = N_A5C4!: CompareRight! = N_A686!  ' RT3F_9F
L_90A4: IF CompareLeft! > CompareRight! THEN GOTO L_90A9  ' flags from L_90A1
L_90A6: GOTO L_8FE8
L_90A9: BX = &H17
L_90AC: ARGPUSH BX  ' RT3E_42
L_90AF: BX = 2
L_90B2: LOCATE ARGS(), BX  ' RT3E_44
L_90B5: ' PRINT statement begins (screen) ; RT3F_BC
L_90B8: BX = &HC164
L_90BB: PRINT S_C164$  ' RT3F_6E; H newline item, ledger correction
L_90BE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_90C1: BX = &H18
L_90C4: ARGPUSH BX  ' RT3E_42
L_90C7: BX = &HC
L_90CA: LOCATE ARGS(), BX  ' RT3E_44
L_90CD: GOSUB L_A882
L_90D0: DI = &HBEFA
L_90D3: SI = &HAE16
L_90D6: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_90D9: IF CompareLeft! >= CompareRight! THEN GOTO L_90DE  ' flags from L_90D6
L_90DB: GOTO L_83FC
L_90DE: GOSUB L_9FED
L_90E1: GOSUB L_A882
L_90E4: DI = &HBEFA
L_90E7: SI = &HAE16
L_90EA: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F
L_90ED: IF CompareLeft! >= CompareRight! THEN GOTO L_90F2  ' flags from L_90EA
L_90EF: GOTO L_83FC
L_90F2: GOSUB L_A444
L_90F5: GOSUB L_A882
L_90F8: DI = &HBEFA
L_90FB: SI = &HAE16
L_90FE: CompareLeft! = N_AE16!: CompareRight! = N_BEFA!  ' RT3F_9F

```

### Cargo, espionage and miscellaneous lists

```basic
L_9101: IF CompareLeft! >= CompareRight! THEN GOTO L_9106  ' flags from L_90FE
L_9103: GOTO L_83FC
L_9106: GOSUB L_2352
L_9109: BX = &H12
L_910C: ARGPUSH BX  ' RT3E_42
L_910F: BX = 2
L_9112: LOCATE ARGS(), BX  ' RT3E_44
L_9115: ' PRINT statement begins (screen) ; RT3F_BC
L_9118: BX = &HC18E
L_911B: PRINT S_C18E$;  ' RT3F_6A
L_911E: DI = &H4F6C
L_9121: SI = &H1898
L_9124: CompareLeft! = N_1898!: CompareRight! = N_4F6C!  ' RT3F_9F
L_9127: AX = 0
L_912A: IF CompareLeft! <= CompareRight! THEN GOTO L_912D  ' flags from L_9124
L_912C: AX = AX - 1
L_912D: BX = &HA
L_9130: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_9132: BX = &H20
L_9135: BX = BX - AX
L_9137: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_913A: PRINT S(BX);  ' RT3F_6A
L_913D: SI = &H1940
L_9140: FAC! = SGN(N_1940!)  ' RT3F_2F
L_9143: SI = &H1944
L_9146: FAC! = N_1944! * FAC!  ' RT3F_93
L_9149: BX = &H1A
L_914C: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_914F: BX = &HC05C
L_9152: PRINT S_C05C$  ' RT3F_6E; H newline item, ledger correction
L_9155: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9158: BX = &H15
L_915B: ARGPUSH BX  ' RT3E_42
L_915E: BX = 2
L_9161: LOCATE ARGS(), BX  ' RT3E_44
L_9164: ' PRINT statement begins (screen) ; RT3F_BC
L_9167: BX = &HC1A8
L_916A: PRINT S_C1A8$;  ' RT3F_6A
L_916D: DI = &H4F6C
L_9170: SI = &H1894
L_9173: CompareLeft! = N_1894!: CompareRight! = N_4F6C!  ' RT3F_9F
L_9176: AX = 0
L_9179: IF CompareLeft! <= CompareRight! THEN GOTO L_917C  ' flags from L_9173
L_917B: AX = AX - 1
L_917C: BX = &HA
L_917F: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_9181: BX = &H20
L_9184: BX = BX - AX
L_9186: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_9189: PRINT S(BX);  ' RT3F_6A
L_918C: SI = &H194C
L_918F: FAC! = SGN(N_194C!)  ' RT3F_2F
L_9192: SI = &H1950
L_9195: FAC! = N_1950! * FAC!  ' RT3F_93
L_9198: BX = &H1A
L_919B: PRINT FAC!;  ' RT3F_67; H expanded ledger
L_919E: BX = &HC05C
L_91A1: PRINT S_C05C$  ' RT3F_6E; H newline item, ledger correction
L_91A4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_91A7: GOSUB L_A882
L_91AA: GOTO L_83FC
L_91AD: GOSUB L_2352
L_91B0: BX = &H10
L_91B3: ARGPUSH BX  ' RT3E_42
L_91B6: BX = &HF
L_91B9: LOCATE ARGS(), BX  ' RT3E_44
L_91BC: ' PRINT statement begins (screen) ; RT3F_BC
L_91BF: BX = &HC1C2
L_91C2: PRINT S_C1C2$  ' RT3F_6E; H newline item, ledger correction
L_91C5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_91C8: DI = &HA858
L_91CB: SI = &HA66E
L_91CE: N_A858! = N_A66E!  ' RT3F_7B
L_91D1: SI = &HA83C
L_91D4: FAC! = N_A83C!: DI = &H001E  ' RT3F_6F
L_91D7: GOTO L_9263
L_91DA: SI = &HA5C4
L_91DD: BX = CINT(N_A5C4!)  ' RT3F_75
L_91E0: SI = BX
L_91E2: SI = SI * (2 ^ 1)
L_91E4: SI = SI * (2 ^ 1)
L_91E6: SI = SI + &H1850
L_91EA: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_91ED: IF CompareLeft! <> CompareRight! THEN GOTO L_91F2  ' flags from L_91EA
L_91EF: GOTO L_925A
L_91F2: DI = &H4F6C
L_91F5: SI = &HA858
L_91F8: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_91FB: DI = SI
L_91FD: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9200: SI = DI
L_9202: DI = &HB05C
L_9205: FAC! = N(SI) + N_B05C!  ' RT3F_7F
L_9208: BX = CINT(FAC!)  ' RT3F_77
L_920B: ARGPUSH BX  ' RT3E_42
L_920E: BX = 2
L_9211: LOCATE ARGS(), BX  ' RT3E_44
L_9214: ' PRINT statement begins (screen) ; RT3F_BC
L_9217: DI = &HB0AA
L_921A: SI = &HA5C4
L_921D: FAC! = N_A5C4! + N_B0AA!  ' RT3F_7F
L_9220: BX = CINT(FAC!)  ' RT3F_77
L_9223: BX = BX * (2 ^ 1)
L_9225: BX = BX * (2 ^ 1)
L_9227: BX = BX + &H4560
L_922B: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_922E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9231: DI = &HA682
L_9234: SI = &HA858
L_9237: CompareLeft! = N_A858!: CompareRight! = N_A682!  ' RT3F_9F
L_923A: IF CompareLeft! = CompareRight! THEN GOTO L_923F  ' flags from L_9237
L_923C: GOTO L_925A
L_923F: BX = &H18
L_9242: ARGPUSH BX  ' RT3E_42
L_9245: BX = &HC
L_9248: LOCATE ARGS(), BX  ' RT3E_44
L_924B: GOSUB L_20DD
L_924E: GOSUB L_2374
L_9251: DI = &HA858
L_9254: SI = &HA844
L_9257: N_A858! = N_A844!  ' RT3F_7B
L_925A: DI = &H4F6C
L_925D: SI = &HA5C4
L_9260: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_9263: DI = &HA5C4
L_9266: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_9269: SI = DI
L_926B: DI = &HB0AE
L_926E: CompareLeft! = N_A5C4!: CompareRight! = N_B0AE!  ' RT3F_9F
L_9271: IF CompareLeft! > CompareRight! THEN GOTO L_9276  ' flags from L_926E
L_9273: GOTO L_91DA
L_9276: DI = &HA844
L_9279: SI = &HA858
L_927C: CompareLeft! = N_A858!: CompareRight! = N_A844!  ' RT3F_9F
L_927F: IF CompareLeft! > CompareRight! THEN GOTO L_9284  ' flags from L_927C
L_9281: GOTO L_9293
L_9284: BX = &H18
L_9287: ARGPUSH BX  ' RT3E_42
L_928A: BX = &HC
L_928D: LOCATE ARGS(), BX  ' RT3E_44
L_9290: GOSUB L_20DD
L_9293: GOTO L_83FC
L_9296: DI = &HAB76
L_9299: SI = &HB050
L_929C: N_AB76! = N_B050!  ' RT3F_7B
L_929F: DI = &HA6F8
L_92A2: N_A6F8! = N_B050!  ' RT3F_7B
L_92A5: DI = &HA6FC
L_92A8: SI = &HA9FE
L_92AB: N_A6FC! = N_A9FE!  ' RT3F_7B
L_92AE: GOSUB L_07C9
L_92B1: DI = &HB88A
L_92B4: N_B88A! = FAC!: SI = &H001A  ' RT3F_7D
L_92B7: SI = DI
L_92B9: DI = &HC1D0
L_92BC: FAC! = N_B88A! + N_C1D0!  ' RT3F_7F
L_92BF: BX = SI
L_92C1: DX = BX
L_92C3: BX = CINT(FAC!)  ' RT3F_77
L_92C6: DI = BX
L_92C8: DI = DI * (2 ^ 1)
L_92CA: DI = DI * (2 ^ 1)
L_92CC: DI = DI + &H1850
L_92D0: SI = DX
L_92D2: BX = DI
L_92D4: DI = &HB498
L_92D7: FAC! = N(SI) + N_B498!  ' RT3F_7F
L_92DA: CX = BX
L_92DC: BX = CINT(FAC!)  ' RT3F_77
L_92DF: SI = BX
L_92E1: SI = SI * (2 ^ 1)
L_92E3: SI = SI * (2 ^ 1)
L_92E5: SI = SI + &H1850
L_92E9: SWAP DX, SI
L_92EB: DI = &HB494
L_92EE: FAC! = N(SI) + N_B494!  ' RT3F_7F
L_92F1: BX = SI
L_92F3: AX = BX
L_92F5: BX = CINT(FAC!)  ' RT3F_77
L_92F8: SI = BX
L_92FA: SI = SI * (2 ^ 1)
L_92FC: SI = SI * (2 ^ 1)
L_92FE: SI = SI + &H1850
L_9302: FAC! = SGN(N(SI))  ' RT3F_2F
L_9305: SI = DX
L_9307: FAC! = N(SI) * FAC!  ' RT3F_93
L_930A: SI = AX
L_930C: DI = &HB47C
L_930F: T_00! = FAC!  ' RT3F_71; inline=&H80
L_9313: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9316: BX = CINT(FAC!)  ' RT3F_77
L_9319: SI = BX
L_931B: SI = SI * (2 ^ 1)
L_931D: SI = SI * (2 ^ 1)
L_931F: SI = SI + &H1850
L_9323: SWAP SI, AX
L_9324: DI = &HB484
L_9327: FAC! = N(SI) + N_B484!  ' RT3F_7F
L_932A: BX = SI
L_932C: DX = BX
L_932E: BX = CINT(FAC!)  ' RT3F_77
L_9331: SI = BX
L_9333: SI = SI * (2 ^ 1)
L_9335: SI = SI * (2 ^ 1)
L_9337: SI = SI + &H1850
L_933B: FAC! = SGN(N(SI))  ' RT3F_2F
L_933E: SI = AX
L_9340: FAC! = N(SI) * FAC!  ' RT3F_93
L_9343: FAC! = T_00! + FAC!  ' RT3F_85; inline=&H80
L_9347: SI = DX
L_9349: DI = &HB4AC
L_934C: T_01! = FAC!  ' RT3F_71; inline=&H81
L_9350: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9353: BX = CINT(FAC!)  ' RT3F_77
L_9356: SI = BX
L_9358: SI = SI * (2 ^ 1)
L_935A: SI = SI * (2 ^ 1)
L_935C: SI = SI + &H1850
L_9360: SWAP DX, SI
L_9362: DI = &HB4A8
L_9365: FAC! = N(SI) + N_B4A8!  ' RT3F_7F
L_9368: BX = CINT(FAC!)  ' RT3F_77
L_936B: SI = BX
L_936D: SI = SI * (2 ^ 1)
L_936F: SI = SI * (2 ^ 1)
L_9371: SI = SI + &H1850
L_9375: FAC! = SGN(N(SI))  ' RT3F_2F
L_9378: SI = DX
L_937A: FAC! = N(SI) * FAC!  ' RT3F_93
L_937D: FAC! = T_01! + FAC!  ' RT3F_85; inline=&H81
L_9381: DI = CX
L_9383: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9386: SI = &HAFD0
L_9389: FAC! = N_AFD0!: DI = &H001E  ' RT3F_6F
L_938C: GOTO L_9405
L_938F: ' Alignment NOP
L_9390: DI = &HA854
L_9393: SI = &HA5C4
L_9396: FAC! = N_A5C4! + N_A854!  ' RT3F_7F
L_9399: BX = SI
L_939B: DX = BX
L_939D: BX = CINT(FAC!)  ' RT3F_77
L_93A0: SI = BX
L_93A2: SI = SI * (2 ^ 1)
L_93A4: SI = SI * (2 ^ 1)
L_93A6: SI = SI + &H1850
L_93AA: DI = &HA9FE
L_93AD: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_93B0: BX = 0
L_93B3: IF CompareLeft! <> CompareRight! THEN GOTO L_93B6  ' flags from L_93AD
L_93B5: BX = BX - 1
L_93B6: FAC! = CSNG(BX)  ' RT3F_57
L_93B9: SI = DX
L_93BB: T_00! = FAC!  ' RT3F_71; inline=&H80
L_93BF: BX = CINT(N(SI))  ' RT3F_75
L_93C2: SI = BX
L_93C4: SI = SI * (2 ^ 1)
L_93C6: SI = SI * (2 ^ 1)
L_93C8: SI = SI + &H1850
L_93CC: FAC! = SGN(N(SI))  ' RT3F_2F
L_93CF: FAC! = T_00! * FAC!  ' RT3F_95; inline=&H80
L_93D3: SI = DX
L_93D5: DI = &HA682
L_93D8: T_01! = FAC!  ' RT3F_71; inline=&H81
L_93DC: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_93DF: BX = CINT(FAC!)  ' RT3F_77
L_93E2: DI = BX
L_93E4: DI = DI * (2 ^ 1)
L_93E6: DI = DI * (2 ^ 1)
L_93E8: DI = DI + &H1850
L_93EC: SI = &HA884
L_93EF: FAC! = N_A884! * N(DI)  ' RT3F_8F
L_93F2: SI = &HAB76
L_93F5: FAC! = N_AB76! - FAC!  ' RT3F_9B
L_93F8: DI = SI
L_93FA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_93FD: SI = DX
L_93FF: DI = &HA840
L_9402: FAC! = N(SI) + N_A840!  ' RT3F_7F
L_9405: DI = &HA5C4
L_9408: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_940B: SI = DI
L_940D: DI = &HAFE0
L_9410: CompareLeft! = N_A5C4!: CompareRight! = N_AFE0!  ' RT3F_9F
L_9413: IF CompareLeft! > CompareRight! THEN GOTO L_9418  ' flags from L_9410
L_9415: GOTO L_9390
L_9418: SI = &HAFE8
L_941B: FAC! = N_AFE8!: DI = &H001E  ' RT3F_6F
L_941E: GOTO L_9497
L_9421: ' Alignment NOP
L_9422: DI = &H4F94
L_9425: SI = &HA5C4
L_9428: FAC! = N_A5C4! + N_4F94!  ' RT3F_7F
L_942B: BX = SI
L_942D: DX = BX
L_942F: BX = CINT(FAC!)  ' RT3F_77
L_9432: SI = BX
L_9434: SI = SI * (2 ^ 1)
L_9436: SI = SI * (2 ^ 1)
L_9438: SI = SI + &H1850
L_943C: DI = &HA9FE
L_943F: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_9442: BX = 0
L_9445: IF CompareLeft! <> CompareRight! THEN GOTO L_9448  ' flags from L_943F
L_9447: BX = BX - 1
L_9448: FAC! = CSNG(BX)  ' RT3F_57
L_944B: SI = DX
L_944D: T_00! = FAC!  ' RT3F_71; inline=&H80
L_9451: BX = CINT(N(SI))  ' RT3F_75
L_9454: SI = BX
L_9456: SI = SI * (2 ^ 1)
L_9458: SI = SI * (2 ^ 1)
L_945A: SI = SI + &H1850
L_945E: FAC! = SGN(N(SI))  ' RT3F_2F
L_9461: FAC! = T_00! * FAC!  ' RT3F_95; inline=&H80
L_9465: SI = DX
L_9467: DI = &H4F6C
L_946A: T_01! = FAC!  ' RT3F_71; inline=&H81
L_946E: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9471: BX = CINT(FAC!)  ' RT3F_77
L_9474: DI = BX
L_9476: DI = DI * (2 ^ 1)
L_9478: DI = DI * (2 ^ 1)
L_947A: DI = DI + &H1850
L_947E: SI = &HA884
L_9481: FAC! = N_A884! * N(DI)  ' RT3F_8F
L_9484: SI = &HAB76
L_9487: FAC! = N_AB76! - FAC!  ' RT3F_9B
L_948A: DI = SI
L_948C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_948F: SI = DX
L_9491: DI = &HA5C0
L_9494: FAC! = N(SI) + N_A5C0!  ' RT3F_7F
L_9497: DI = &HA5C4
L_949A: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_949D: SI = DI
L_949F: DI = &HAFFA
L_94A2: CompareLeft! = N_A5C4!: CompareRight! = N_AFFA!  ' RT3F_9F
L_94A5: IF CompareLeft! > CompareRight! THEN GOTO L_94AA  ' flags from L_94A2
L_94A7: GOTO L_9422
L_94AA: SI = &HAFFE
L_94AD: FAC! = N_AFFE!: DI = &H001E  ' RT3F_6F
L_94B0: GOTO L_9529
L_94B3: ' Alignment NOP
L_94B4: DI = &H4F94
L_94B7: SI = &HA5C4
L_94BA: FAC! = N_A5C4! + N_4F94!  ' RT3F_7F
L_94BD: BX = SI
L_94BF: DX = BX
L_94C1: BX = CINT(FAC!)  ' RT3F_77
L_94C4: SI = BX
L_94C6: SI = SI * (2 ^ 1)
L_94C8: SI = SI * (2 ^ 1)
L_94CA: SI = SI + &H1850
L_94CE: DI = &HA9FE
L_94D1: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_94D4: BX = 0
L_94D7: IF CompareLeft! <> CompareRight! THEN GOTO L_94DA  ' flags from L_94D1
L_94D9: BX = BX - 1
L_94DA: FAC! = CSNG(BX)  ' RT3F_57
L_94DD: SI = DX
L_94DF: T_00! = FAC!  ' RT3F_71; inline=&H80
L_94E3: BX = CINT(N(SI))  ' RT3F_75
L_94E6: SI = BX
L_94E8: SI = SI * (2 ^ 1)
L_94EA: SI = SI * (2 ^ 1)
L_94EC: SI = SI + &H1850
L_94F0: FAC! = SGN(N(SI))  ' RT3F_2F
L_94F3: FAC! = T_00! * FAC!  ' RT3F_95; inline=&H80
L_94F7: SI = DX
L_94F9: DI = &H4F6C
L_94FC: T_01! = FAC!  ' RT3F_71; inline=&H81
L_9500: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_9503: BX = CINT(FAC!)  ' RT3F_77
L_9506: DI = BX
L_9508: DI = DI * (2 ^ 1)
L_950A: DI = DI * (2 ^ 1)
L_950C: DI = DI + &H1850
L_9510: SI = &HA884
L_9513: FAC! = N_A884! * N(DI)  ' RT3F_8F
L_9516: SI = &HAB76
L_9519: FAC! = N_AB76! - FAC!  ' RT3F_9B
L_951C: DI = SI
L_951E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9521: SI = DX
L_9523: DI = &HA5C0
L_9526: FAC! = N(SI) + N_A5C0!  ' RT3F_7F
L_9529: DI = &HA5C4
L_952C: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_952F: SI = DI
L_9531: DI = &HB002
L_9534: CompareLeft! = N_A5C4!: CompareRight! = N_B002!  ' RT3F_9F
L_9537: IF CompareLeft! > CompareRight! THEN GOTO L_953C  ' flags from L_9534
L_9539: GOTO L_94B4
L_953C: DI = &HAE44
L_953F: SI = &HB88A
L_9542: FAC! = N_B88A! + N_AE44!  ' RT3F_7F
L_9545: BX = SI
L_9547: DX = BX
L_9549: BX = CINT(FAC!)  ' RT3F_77
L_954C: DI = BX
L_954E: DI = DI * (2 ^ 1)
L_9550: DI = DI * (2 ^ 1)
L_9552: DI = DI + &H1850
L_9556: SI = DX
L_9558: BX = DI
L_955A: DI = &HC1D0
L_955D: FAC! = N(SI) + N_C1D0!  ' RT3F_7F
L_9560: DX = BX
L_9562: BX = CINT(FAC!)  ' RT3F_77
L_9565: SI = BX
L_9567: SI = SI * (2 ^ 1)
L_9569: SI = SI * (2 ^ 1)
L_956B: SI = SI + &H1850
L_956F: DI = &HAB76
L_9572: FAC! = N(SI) + N_AB76!  ' RT3F_7F
L_9575: DI = &HA686
L_9578: FAC! = FAC! / N_A686!  ' RT3F_89
L_957B: BX = &H1A
L_957E: FAC! = INT(FAC!)  ' RT3D_03
L_9581: DI = DX
L_9583: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9586: DI = &HAE44
L_9589: SI = &HB88A
L_958C: FAC! = N_B88A! + N_AE44!  ' RT3F_7F
L_958F: BX = SI
L_9591: DX = BX
L_9593: BX = CINT(FAC!)  ' RT3F_77
L_9596: SI = BX
L_9598: SI = SI * (2 ^ 1)
L_959A: SI = SI * (2 ^ 1)
L_959C: SI = SI + &H1850
L_95A0: SWAP DX, SI
L_95A2: DI = &HA66A
L_95A5: FAC! = N(SI) + N_A66A!  ' RT3F_7F
L_95A8: BX = SI
L_95AA: CX = BX
L_95AC: BX = CINT(FAC!)  ' RT3F_77
L_95AF: DI = BX
L_95B1: DI = DI * (2 ^ 1)
L_95B3: DI = DI * (2 ^ 1)
L_95B5: DI = DI + &H1850
L_95B9: SI = DX
L_95BB: FAC! = N(SI) / N(DI)  ' RT3F_87
L_95BE: SI = &H4F94
L_95C1: FAC! = N_4F94! - FAC!  ' RT3F_9B
L_95C4: DI = &HAB7A
L_95C7: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_95CA: SI = CX
L_95CC: BX = DI
L_95CE: DI = &HA840
L_95D1: FAC! = N(SI) + N_A840!  ' RT3F_7F
L_95D4: DX = BX
L_95D6: BX = CINT(FAC!)  ' RT3F_77
L_95D9: SI = BX
L_95DB: SI = SI * (2 ^ 1)
L_95DD: SI = SI * (2 ^ 1)
L_95DF: SI = SI + &H1850
L_95E3: DI = DX
L_95E5: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_95E8: DI = &HA70C
L_95EB: FAC! = FAC! + N_A70C!  ' RT3F_81
L_95EE: BX = &H1A
L_95F1: FAC! = INT(FAC!)  ' RT3D_03
L_95F4: DI = DX
L_95F6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_95F9: SI = DX
L_95FB: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_95FE: IF CompareLeft! < CompareRight! THEN GOTO L_9603  ' flags from L_95FB
L_9600: GOTO L_960C
L_9603: SI = &HA874
L_9606: N(DI) = N_A874!  ' RT3F_7B
L_9609: GOTO L_9630
L_960C: DI = &HA840
L_960F: SI = &HB88A
L_9612: FAC! = N_B88A! + N_A840!  ' RT3F_7F
L_9615: BX = CINT(FAC!)  ' RT3F_77
L_9618: SI = BX
L_961A: SI = SI * (2 ^ 1)
L_961C: SI = SI * (2 ^ 1)
L_961E: SI = SI + &H1850
L_9622: DI = &HAB7A
L_9625: CompareLeft! = N(SI): CompareRight! = N_AB7A!  ' RT3F_9F
L_9628: IF CompareLeft! < CompareRight! THEN GOTO L_962D  ' flags from L_9625
L_962A: GOTO L_9630
L_962D: N(DI) = N(SI)  ' RT3F_7B
L_9630: DI = &HA5CC
L_9633: SI = &HB88A
L_9636: FAC! = N_B88A! + N_A5CC!  ' RT3F_7F
L_9639: BX = CINT(FAC!)  ' RT3F_77
L_963C: DI = BX
L_963E: DI = DI * (2 ^ 1)
L_9640: DI = DI * (2 ^ 1)
L_9642: DI = DI + &H1850
L_9646: BX = DI
L_9648: DI = &HA70C
L_964B: SI = &HAB7A
L_964E: FAC! = N_AB7A! + N_A70C!  ' RT3F_7F
L_9651: DX = BX
L_9653: BX = &H1A
L_9656: FAC! = INT(FAC!)  ' RT3D_03
L_9659: DI = DX
L_965B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_965E: RETURN
L_965F: DI = &HAB76
L_9662: SI = &HA874
L_9665: N_AB76! = N_A874!  ' RT3F_7B
L_9668: SI = &HAA12
L_966B: FAC! = N_AA12!: DI = &H001E  ' RT3F_6F
L_966E: GOTO L_96B8
L_9671: ' Alignment NOP
L_9672: DI = &H4F94
L_9675: SI = &HA5C4
L_9678: FAC! = N_A5C4! + N_4F94!  ' RT3F_7F
L_967B: BX = SI
L_967D: DX = BX
L_967F: BX = CINT(FAC!)  ' RT3F_77
L_9682: SI = BX
L_9684: SI = SI * (2 ^ 1)
L_9686: SI = SI * (2 ^ 1)
L_9688: SI = SI + &H1850
L_968C: SWAP DX, SI
L_968E: BX = SI
L_9690: CX = BX
L_9692: BX = CINT(N(SI))  ' RT3F_75
L_9695: SI = BX
L_9697: SI = SI * (2 ^ 1)
L_9699: SI = SI * (2 ^ 1)
L_969B: SI = SI + &H1850
L_969F: FAC! = SGN(N(SI))  ' RT3F_2F
L_96A2: SI = DX
L_96A4: FAC! = N(SI) * FAC!  ' RT3F_93
L_96A7: DI = &HAB76
L_96AA: FAC! = FAC! + N_AB76!  ' RT3F_81
L_96AD: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_96B0: SI = CX
L_96B2: DI = &HA5C0
L_96B5: FAC! = N(SI) + N_A5C0!  ' RT3F_7F
L_96B8: DI = &HA5C4
L_96BB: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_96BE: SI = DI
L_96C0: DI = &HB07C
L_96C3: CompareLeft! = N_A5C4!: CompareRight! = N_B07C!  ' RT3F_9F
L_96C6: IF CompareLeft! <= CompareRight! THEN GOTO L_9672  ' flags from L_96C3
L_96C8: DI = &H1924
L_96CB: SI = &H192C
L_96CE: FAC! = N_192C! / N_1924!  ' RT3F_87
L_96D1: DI = &HA686
L_96D4: FAC! = FAC! * N_A686!  ' RT3F_91
L_96D7: DI = &HAB76
L_96DA: FAC! = FAC! + N_AB76!  ' RT3F_81
L_96DD: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_96E0: SI = &HB094
L_96E3: FAC! = N_B094!: DI = &H001E  ' RT3F_6F
L_96E6: GOTO L_9730
L_96E9: ' Alignment NOP
L_96EA: DI = &HAC70
L_96ED: SI = &HA5C4
L_96F0: FAC! = N_A5C4! + N_AC70!  ' RT3F_7F
L_96F3: BX = SI
L_96F5: DX = BX
L_96F7: BX = CINT(FAC!)  ' RT3F_77
L_96FA: SI = BX
L_96FC: SI = SI * (2 ^ 1)
L_96FE: SI = SI * (2 ^ 1)
L_9700: SI = SI + &H1850
L_9704: SWAP DX, SI
L_9706: BX = SI
L_9708: CX = BX
L_970A: BX = CINT(N(SI))  ' RT3F_75
L_970D: SI = BX
L_970F: SI = SI * (2 ^ 1)
L_9711: SI = SI * (2 ^ 1)
L_9713: SI = SI + &H1850
L_9717: FAC! = SGN(N(SI))  ' RT3F_2F
L_971A: SI = DX
L_971C: FAC! = N(SI) * FAC!  ' RT3F_93
L_971F: DI = &HAB76
L_9722: FAC! = FAC! + N_AB76!  ' RT3F_81
L_9725: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9728: SI = CX
L_972A: DI = &H4F6C
L_972D: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_9730: DI = &HA5C4
L_9733: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_9736: SI = DI
L_9738: DI = &HB0A6
L_973B: CompareLeft! = N_A5C4!: CompareRight! = N_B0A6!  ' RT3F_9F
L_973E: IF CompareLeft! <= CompareRight! THEN GOTO L_96EA  ' flags from L_973B
L_9740: SI = &HB080
L_9743: FAC! = N_B080!: DI = &H001E  ' RT3F_6F
L_9746: GOTO L_9790
L_9749: ' Alignment NOP
L_974A: DI = &HA5C0
L_974D: SI = &HA5C4
L_9750: FAC! = N_A5C4! + N_A5C0!  ' RT3F_7F
L_9753: BX = SI
L_9755: DX = BX
L_9757: BX = CINT(FAC!)  ' RT3F_77
L_975A: SI = BX
L_975C: SI = SI * (2 ^ 1)
L_975E: SI = SI * (2 ^ 1)
L_9760: SI = SI + &H1850
L_9764: SWAP DX, SI
L_9766: BX = SI
L_9768: CX = BX
L_976A: BX = CINT(N(SI))  ' RT3F_75
L_976D: SI = BX
L_976F: SI = SI * (2 ^ 1)
L_9771: SI = SI * (2 ^ 1)
L_9773: SI = SI + &H1850
L_9777: FAC! = SGN(N(SI))  ' RT3F_2F
L_977A: SI = DX
L_977C: FAC! = N(SI) * FAC!  ' RT3F_93
L_977F: DI = &HAB76
L_9782: FAC! = FAC! + N_AB76!  ' RT3F_81
L_9785: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9788: SI = CX
L_978A: DI = &HA850
L_978D: FAC! = N(SI) + N_A850!  ' RT3F_7F
L_9790: DI = &HA5C4
L_9793: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_9796: SI = DI
L_9798: DI = &HB090
L_979B: CompareLeft! = N_A5C4!: CompareRight! = N_B090!  ' RT3F_9F
L_979E: IF CompareLeft! <= CompareRight! THEN GOTO L_974A  ' flags from L_979B
L_97A0: DI = &HC1D4
L_97A3: SI = &HAB76
L_97A6: CompareLeft! = N_AB76!: CompareRight! = N_C1D4!  ' RT3F_9F
L_97A9: IF CompareLeft! > CompareRight! THEN GOTO L_97AE  ' flags from L_97A6
L_97AB: GOTO L_97B3
L_97AE: SWAP DI, SI
L_97B0: N(DI) = N(SI)  ' RT3F_7B
L_97B3: DI = &H4F6C
L_97B6: SI = &H1894
L_97B9: CompareLeft! = N_1894!: CompareRight! = N_4F6C!  ' RT3F_9F
L_97BC: BX = 0
L_97BF: IF CompareLeft! <> CompareRight! THEN GOTO L_97C2  ' flags from L_97B9
L_97C1: BX = BX - 1
L_97C2: CompareLeft% = BX: CompareRight% = 0
L_97C4: IF CompareLeft% >= CompareRight% THEN GOTO L_97C8  ' flags from L_97C2
L_97C6: BX = -BX
L_97C8: FAC! = CSNG(BX)  ' RT3F_57
L_97CB: SI = &H194C
L_97CE: FAC! = N_194C! * FAC!  ' RT3F_93
L_97D1: DI = &HC14E
L_97D4: N_C14E! = FAC!: SI = &H001A  ' RT3F_7D
L_97D7: SI = DI
L_97D9: DI = &H4F94
L_97DC: CompareLeft! = N_C14E!: CompareRight! = N_4F94!  ' RT3F_9F
L_97DF: BX = 0
L_97E2: IF CompareLeft! <= CompareRight! THEN GOTO L_97E5  ' flags from L_97DC
L_97E4: BX = BX - 1
L_97E5: FAC! = CSNG(BX)  ' RT3F_57
L_97E8: BX = SI
L_97EA: SI = &H1900
L_97ED: FAC! = N_1900! - FAC!  ' RT3F_9B
L_97F0: SI = BX
L_97F2: DI = &HA676
L_97F5: T_00! = FAC!  ' RT3F_71; inline=&H80
L_97F9: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_97FC: DX = 0
L_97FF: IF CompareLeft! <= CompareRight! THEN GOTO L_9802  ' flags from L_97F9
L_9801: DX = DX - 1
L_9802: SWAP DX, BX
L_9804: FAC! = CSNG(BX)  ' RT3F_57
L_9807: FAC! = T_00! - FAC!  ' RT3F_9D; inline=&H80
L_980B: DI = DX
L_980D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9810: BX = &HAB76
L_9813: FAC! = INT(N_AB76!)  ' RT3D_03
L_9816: DI = &H1910
L_9819: N_1910! = FAC!: SI = &H001A  ' RT3F_7D
L_981C: BX = DI
L_981E: DI = &HA686
L_9821: SI = &H1904
L_9824: FAC! = N_1904! * N_A686!  ' RT3F_8F
L_9827: SWAP BX, SI
L_9829: FAC! = N(SI) + FAC!  ' RT3F_83
L_982C: DI = &H1918
L_982F: DX = SI
L_9831: N_1918! = FAC!: SI = &H001A  ' RT3F_7D
L_9834: DI = BX
L_9836: SI = &H1908
L_9839: FAC! = N_1908! - N(DI)  ' RT3F_97
L_983C: SI = DX
L_983E: FAC! = N(SI) / FAC!  ' RT3F_8B
L_9841: DI = &HA6F4
L_9844: FAC! = FAC! * N_A6F4!  ' RT3F_91
L_9847: SI = &H4F94
L_984A: FAC! = N_4F94! - FAC!  ' RT3F_9B
L_984D: DI = &HC14E
L_9850: FAC! = FAC! * N_C14E!  ' RT3F_91
L_9853: DI = &HAB7A
L_9856: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_9859: SI = DI
L_985B: CompareLeft! = N_AB7A!: CompareRight! = 0  ' RT3F_A7
L_985E: IF CompareLeft! < CompareRight! THEN GOTO L_9863  ' flags from L_985B
L_9860: GOTO L_986C
L_9863: SI = &HA66E
L_9866: N(DI) = N_A66E!  ' RT3F_7B
L_9869: GOTO L_987F
L_986C: DI = &HC14E
L_986F: SI = &HAB7A
L_9872: CompareLeft! = N_AB7A!: CompareRight! = N_C14E!  ' RT3F_9F
L_9875: IF CompareLeft! > CompareRight! THEN GOTO L_987A  ' flags from L_9872
L_9877: GOTO L_987F
L_987A: SWAP DI, SI
L_987C: N(DI) = N(SI)  ' RT3F_7B
L_987F: DI = &HA696
L_9882: SI = &HAB7A
L_9885: CompareLeft! = N_AB7A!: CompareRight! = N_A696!  ' RT3F_9F
L_9888: IF CompareLeft! > CompareRight! THEN GOTO L_988D  ' flags from L_9885
L_988A: GOTO L_9892
L_988D: SWAP DI, SI
L_988F: N(DI) = N(SI)  ' RT3F_7B
L_9892: DI = &HA70C
L_9895: SI = &HAB7A
L_9898: FAC! = N_AB7A! + N_A70C!  ' RT3F_7F
L_989B: BX = &H1A
L_989E: FAC! = INT(FAC!)  ' RT3D_03
L_98A1: DI = &H1998
L_98A4: N_1998! = FAC!: SI = &H001A  ' RT3F_7D
L_98A7: RETURN
L_98A8: GOSUB L_2352
L_98AB: BX = &H10
L_98AE: ARGPUSH BX  ' RT3E_42
L_98B1: BX = &HD
L_98B4: LOCATE ARGS(), BX  ' RT3E_44
L_98B7: ' PRINT statement begins (screen) ; RT3F_BC
L_98BA: BX = &HC1D8
L_98BD: PRINT S_C1D8$  ' RT3F_6E; H newline item, ledger correction
L_98C0: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_98C3: DI = &HA858
L_98C6: SI = &HA66E
L_98C9: N_A858! = N_A66E!  ' RT3F_7B
L_98CC: SI = &HABF8
L_98CF: FAC! = N_ABF8!: DI = &H001E  ' RT3F_6F
L_98D2: GOTO L_995F
L_98D5: ' Alignment NOP
L_98D6: SI = &HA5C4
L_98D9: BX = CINT(N_A5C4!)  ' RT3F_75
L_98DC: SI = BX
L_98DE: SI = SI * (2 ^ 1)
L_98E0: SI = SI * (2 ^ 1)
L_98E2: SI = SI + &H1850
L_98E6: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_98E9: IF CompareLeft! <> CompareRight! THEN GOTO L_98EE  ' flags from L_98E6
L_98EB: GOTO L_9956
L_98EE: DI = &H4F6C
L_98F1: SI = &HA858
L_98F4: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_98F7: DI = SI
L_98F9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_98FC: SI = DI
L_98FE: DI = &HB05C
L_9901: FAC! = N(SI) + N_B05C!  ' RT3F_7F
L_9904: BX = CINT(FAC!)  ' RT3F_77
L_9907: ARGPUSH BX  ' RT3E_42
L_990A: BX = 2
L_990D: LOCATE ARGS(), BX  ' RT3E_44
L_9910: ' PRINT statement begins (screen) ; RT3F_BC
L_9913: DI = &HAB60
L_9916: SI = &HA5C4
L_9919: FAC! = N_A5C4! + N_AB60!  ' RT3F_7F
L_991C: BX = CINT(FAC!)  ' RT3F_77
L_991F: BX = BX * (2 ^ 1)
L_9921: BX = BX * (2 ^ 1)
L_9923: BX = BX + &H46F0
L_9927: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_992A: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_992D: DI = &HA682
L_9930: SI = &HA858
L_9933: CompareLeft! = N_A858!: CompareRight! = N_A682!  ' RT3F_9F
L_9936: IF CompareLeft! = CompareRight! THEN GOTO L_993B  ' flags from L_9933
L_9938: GOTO L_9956
L_993B: BX = &H18
L_993E: ARGPUSH BX  ' RT3E_42
L_9941: BX = &HC
L_9944: LOCATE ARGS(), BX  ' RT3E_44
L_9947: GOSUB L_20DD
L_994A: GOSUB L_2374
L_994D: DI = &HA858
L_9950: SI = &HA844
L_9953: N_A858! = N_A844!  ' RT3F_7B
L_9956: DI = &H4F6C
L_9959: SI = &HA5C4
L_995C: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_995F: DI = &HA5C4
L_9962: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_9965: SI = DI
L_9967: DI = &HABFC
L_996A: CompareLeft! = N_A5C4!: CompareRight! = N_ABFC!  ' RT3F_9F
L_996D: IF CompareLeft! > CompareRight! THEN GOTO L_9972  ' flags from L_996A
L_996F: GOTO L_98D6
L_9972: DI = &HA844
L_9975: SI = &HA858
L_9978: CompareLeft! = N_A858!: CompareRight! = N_A844!  ' RT3F_9F
L_997B: IF CompareLeft! > CompareRight! THEN GOTO L_9980  ' flags from L_9978
L_997D: GOTO L_998F
L_9980: BX = &H18
L_9983: ARGPUSH BX  ' RT3E_42
L_9986: BX = &HC
L_9989: LOCATE ARGS(), BX  ' RT3E_44
L_998C: GOSUB L_20DD
L_998F: GOTO L_83FC
L_9992: GOSUB L_2352
L_9995: BX = &H10
L_9998: ARGPUSH BX  ' RT3E_42
L_999B: BX = 9
L_999E: LOCATE ARGS(), BX  ' RT3E_44
L_99A1: ' PRINT statement begins (screen) ; RT3F_BC
L_99A4: BX = &HC1EA
L_99A7: PRINT S_C1EA$  ' RT3F_6E; H newline item, ledger correction
L_99AA: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_99AD: DI = &HA858
L_99B0: SI = &HA66E
L_99B3: N_A858! = N_A66E!  ' RT3F_7B
L_99B6: SI = &HA97C
L_99B9: FAC! = N_A97C!: DI = &H001E  ' RT3F_6F
L_99BC: GOTO L_9A74
L_99BF: ' Alignment NOP
L_99C0: DI = &HC202
L_99C3: SI = &HA5C4
L_99C6: FAC! = N_A5C4! + N_C202!  ' RT3F_7F
L_99C9: BX = SI
L_99CB: DX = BX
L_99CD: BX = CINT(FAC!)  ' RT3F_77
L_99D0: SI = BX
L_99D2: SI = SI * (2 ^ 1)
L_99D4: SI = SI * (2 ^ 1)
L_99D6: SI = SI + &H1850
L_99DA: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_99DD: BX = 0
L_99E0: IF CompareLeft! <> CompareRight! THEN GOTO L_99E3  ' flags from L_99DA
L_99E2: BX = BX - 1
L_99E3: SI = DX
L_99E5: CX = BX
L_99E7: BX = CINT(N(SI))  ' RT3F_75
L_99EA: BX = BX * (2 ^ 1)
L_99EC: BX = BX * (2 ^ 1)
L_99EE: BX = BX + &H4560
L_99F2: AX = BX
L_99F4: BX = &H4F8A
L_99F7: CompareLeft$ = S(AX): CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_99FA: DX = 0
L_99FD: IF CompareLeft$ <> CompareRight$ THEN GOTO L_9A00  ' flags from L_99F7
L_99FF: DX = DX - 1

```

### Save game and rule-book challenge

```basic
L_9A00: DX = DX OR CX
L_9A02: CompareLeft% = DX: CompareRight% = 0
L_9A04: IF CompareLeft% = CompareRight% THEN GOTO L_9A09  ' flags from L_9A02
L_9A06: GOTO L_9A6B
L_9A09: DI = &H4F6C
L_9A0C: SI = &HA858
L_9A0F: FAC! = N_A858! + N_4F6C!  ' RT3F_7F
L_9A12: DI = SI
L_9A14: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9A17: SI = DI
L_9A19: DI = &HB05C
L_9A1C: FAC! = N(SI) + N_B05C!  ' RT3F_7F
L_9A1F: BX = CINT(FAC!)  ' RT3F_77
L_9A22: ARGPUSH BX  ' RT3E_42
L_9A25: BX = 2
L_9A28: LOCATE ARGS(), BX  ' RT3E_44
L_9A2B: ' PRINT statement begins (screen) ; RT3F_BC
L_9A2E: SI = &HA5C4
L_9A31: BX = CINT(N_A5C4!)  ' RT3F_75
L_9A34: BX = BX * (2 ^ 1)
L_9A36: BX = BX * (2 ^ 1)
L_9A38: BX = BX + &H4560
L_9A3C: PRINT S(BX)  ' RT3F_6E; H newline item, ledger correction
L_9A3F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9A42: DI = &HA682
L_9A45: SI = &HA858
L_9A48: CompareLeft! = N_A858!: CompareRight! = N_A682!  ' RT3F_9F
L_9A4B: IF CompareLeft! = CompareRight! THEN GOTO L_9A50  ' flags from L_9A48
L_9A4D: GOTO L_9A6B
L_9A50: BX = &H18
L_9A53: ARGPUSH BX  ' RT3E_42
L_9A56: BX = &HC
L_9A59: LOCATE ARGS(), BX  ' RT3E_44
L_9A5C: GOSUB L_20DD
L_9A5F: GOSUB L_2374
L_9A62: DI = &HA858
L_9A65: SI = &HA844
L_9A68: N_A858! = N_A844!  ' RT3F_7B
L_9A6B: DI = &H4F6C
L_9A6E: SI = &HA5C4
L_9A71: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_9A74: DI = &HA5C4
L_9A77: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_9A7A: SI = DI
L_9A7C: DI = &HAE68
L_9A7F: CompareLeft! = N_A5C4!: CompareRight! = N_AE68!  ' RT3F_9F
L_9A82: IF CompareLeft! > CompareRight! THEN GOTO L_9A87  ' flags from L_9A7F
L_9A84: GOTO L_99C0
L_9A87: DI = &HA844
L_9A8A: SI = &HA858
L_9A8D: CompareLeft! = N_A858!: CompareRight! = N_A844!  ' RT3F_9F
L_9A90: IF CompareLeft! > CompareRight! THEN GOTO L_9A95  ' flags from L_9A8D
L_9A92: GOTO L_9AA4
L_9A95: BX = &H18
L_9A98: ARGPUSH BX  ' RT3E_42
L_9A9B: BX = &HC
L_9A9E: LOCATE ARGS(), BX  ' RT3E_44
L_9AA1: GOSUB L_20DD
L_9AA4: GOTO L_83FC
L_9AA7: SI = &H3BB4
L_9AAA: BX = BASIC_BOOL(N_3BB4! <> 0)  ' RT3F_1D
L_9AAD: CompareLeft% = BX: CompareRight% = 0
L_9AAF: IF CompareLeft% <> CompareRight% THEN GOTO L_9AB4  ' flags from L_9AAD
L_9AB1: GOTO L_9ABA
L_9AB4: BEEP  ' RT3E_2B
L_9AB7: GOTO L_234F
L_9ABA: DI = &HC206
L_9ABD: SI = &H4F6C
L_9AC0: N_C206! = N_4F6C!  ' RT3F_7B
L_9AC3: GOSUB L_2352
L_9AC6: BX = &H11
L_9AC9: ARGPUSH BX  ' RT3E_42
L_9ACC: BX = &HE
L_9ACF: LOCATE ARGS(), BX  ' RT3E_44
L_9AD2: ' PRINT statement begins (screen) ; RT3F_BC
L_9AD5: BX = &HC20A
L_9AD8: PRINT S_C20A$  ' RT3F_6E; H newline item, ledger correction
L_9ADB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9ADE: FAC! = RND  ' RT3D_34
L_9AE1: DI = &HA686
L_9AE4: FAC! = FAC! * N_A686!  ' RT3F_91
L_9AE7: BX = &H1A
L_9AEA: FAC! = INT(FAC!)  ' RT3D_03
L_9AED: BX = CINT(FAC!)  ' RT3F_77
L_9AF0: AX = BX
L_9AF2: WORD(&HC23C) = AX
L_9AF5: FAC! = RND  ' RT3D_34
L_9AF8: DI = &HA682
L_9AFB: FAC! = FAC! * N_A682!  ' RT3F_91
L_9AFE: BX = &H1A
L_9B01: FAC! = INT(FAC!)  ' RT3D_03
L_9B04: BX = CINT(FAC!)  ' RT3F_77
L_9B07: SWAP BX, AX
L_9B08: WORD(&HC23E) = AX
L_9B0B: DX = AX
L_9B0D: AX = 5
L_9B10: CX = DX
L_9B12: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_9B14: AX = AX + CX
L_9B16: WORD(&HC240) = AX
L_9B19: DX = BX
L_9B1B: BX = &H14
L_9B1E: ARGPUSH BX  ' RT3E_42
L_9B21: BX = 2
L_9B24: LOCATE ARGS(), BX  ' RT3E_44
L_9B27: ' PRINT statement begins (screen) ; RT3F_BC
L_9B2A: BX = &HC21A
L_9B2D: PRINT S_C21A$;  ' RT3F_6A
L_9B30: CX = CX * (2 ^ 1)
L_9B32: CX = CX * (2 ^ 1)
L_9B34: CX = CX + &HA710
L_9B38: BX = CX
L_9B3A: PRINT S(BX);  ' RT3F_6A
L_9B3D: BX = &HC228
L_9B40: PRINT S_C228$;  ' RT3F_6A
L_9B43: DX = DX + 1
L_9B44: BX = DX
L_9B46: PRINT BX  ' RT3F_6D
L_9B49: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9B4C: BX = &H15
L_9B4F: ARGPUSH BX  ' RT3E_42
L_9B52: BX = 2
L_9B55: LOCATE ARGS(), BX  ' RT3E_44
L_9B58: ' PRINT statement begins (screen) ; RT3F_BC
L_9B5B: DX = BX
L_9B5D: BX = &HC242
L_9B60: PRINT S_C242$  ' RT3F_6E; H newline item, ledger correction
L_9B63: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9B66: BX = &H18
L_9B69: ARGPUSH BX  ' RT3E_42
L_9B6C: BX = 3
L_9B6F: LOCATE ARGS(), BX  ' RT3E_44
L_9B72: BX = WORD(&HC240)
L_9B76: BX = BX * (2 ^ 1)
L_9B78: BX = BX * (2 ^ 1)
L_9B7A: BX = BX + &HA728
L_9B7E: BX = LEN(S(BX))  ' RT3F_BA
L_9B81: FAC! = CSNG(BX)  ' RT3F_57
L_9B84: DI = &HAE50
L_9B87: N_AE50! = FAC!: SI = &H001A  ' RT3F_7D
L_9B8A: ' PRINT statement begins (screen) ; RT3F_BC
L_9B8D: SI = DI
L_9B8F: BX = CINT(N(SI))  ' RT3F_75
L_9B92: CX = DX
L_9B94: DX = &H2D
L_9B97: BX = TEMP_DESC(STRING$(BX, DL))  ' RT3D_0E
L_9B9A: PRINT S(BX);  ' RT3F_6A
L_9B9D: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9BA0: BX = &H17
L_9BA3: ARGPUSH BX  ' RT3E_42
L_9BA6: BX = CX
L_9BA8: LOCATE ARGS(), BX  ' RT3E_44
L_9BAB: ' PRINT statement begins (screen) ; RT3F_BC
L_9BAE: BX = &HB94E
L_9BB1: PRINT S_B94E$;  ' RT3F_6A
L_9BB4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9BB7: GOSUB L_24F4
L_9BBA: BX = &HAD12
L_9BBD: BX = LEN(S_AD12$)  ' RT3F_BA
L_9BC0: FAC! = CSNG(BX)  ' RT3F_57
L_9BC3: DI = &HAE50
L_9BC6: CompareLeft! = FAC!: CompareRight! = N_AE50!  ' RT3F_A1
L_9BC9: IF CompareLeft! <> CompareRight! THEN GOTO L_9BCE  ' flags from L_9BC6
L_9BCB: GOTO L_9BDA
L_9BCE: DI = &HAA30
L_9BD1: SI = &HA68A
L_9BD4: N_AA30! = N_A68A!  ' RT3F_7B
L_9BD7: GOTO L_9C78
L_9BDA: DI = &HC258
L_9BDD: SI = &HAE50
L_9BE0: N_C258! = N_AE50!  ' RT3F_7B
L_9BE3: SI = &H4F6C
L_9BE6: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_9BE9: GOTO L_9C65
L_9BEC: SI = &HAA30
L_9BEF: BX = SI
L_9BF1: DX = BX
L_9BF3: BX = CINT(N_AA30!)  ' RT3F_75
L_9BF6: SWAP BX, DX
L_9BF8: AX = BX
L_9BFA: BX = &HAD12
L_9BFD: CX = 1
L_9C00: BX = TEMP_DESC(MID$(S_AD12$, DX, CX))  ' BX receives a temporary descriptor  ' RT3D_0A
L_9C03: BX = ASC(S(BX))  ' RT3F_BB
L_9C06: WORD(BP - 6) = BX
L_9C09: BX = WORD(&HC240)
L_9C0D: BX = BX * (2 ^ 1)
L_9C0F: BX = BX * (2 ^ 1)
L_9C11: BX = BX + &HA728
L_9C15: BX = TEMP_DESC(MID$(S(BX), DX, CX))  ' BX receives a temporary descriptor  ' RT3D_0A
L_9C18: BX = ASC(S(BX))  ' RT3F_BB
L_9C1B: DX = WORD(BP - 6)
L_9C1E: DX = DX - BX
L_9C20: CompareLeft% = DX: CompareRight% = 0
L_9C22: IF CompareLeft% >= CompareRight% THEN GOTO L_9C26  ' flags from L_9C20
L_9C24: DX = -DX
L_9C26: BX = DX
L_9C28: FAC! = CSNG(BX)  ' RT3F_57
L_9C2B: DI = &HC25C
L_9C2E: N_C25C! = FAC!: SI = &H001A  ' RT3F_7D
L_9C31: SI = DI
L_9C33: DI = &H4F6C
L_9C36: CompareLeft! = N_C25C!: CompareRight! = N_4F6C!  ' RT3F_9F
L_9C39: BX = 0
L_9C3C: IF CompareLeft! <= CompareRight! THEN GOTO L_9C3F  ' flags from L_9C36
L_9C3E: BX = BX - 1
L_9C3F: DI = &HAE68
L_9C42: CompareLeft! = N(SI): CompareRight! = N_AE68!  ' RT3F_9F
L_9C45: DX = 0
L_9C48: IF CompareLeft! = CompareRight! THEN GOTO L_9C4B  ' flags from L_9C42
L_9C4A: DX = DX - 1
L_9C4B: DX = DX AND BX
L_9C4D: CompareLeft% = DX: CompareRight% = 0
L_9C4F: IF CompareLeft% <> CompareRight% THEN GOTO L_9C54  ' flags from L_9C4D
L_9C51: GOTO L_9C5C
L_9C54: DI = AX
L_9C56: SI = &HA68A
L_9C59: N(DI) = N_A68A!  ' RT3F_7B
L_9C5C: DI = &H4F6C
L_9C5F: SI = &HAA30
L_9C62: FAC! = N_AA30! + N_4F6C!  ' RT3F_7F
L_9C65: DI = &HAA30
L_9C68: N_AA30! = FAC!: SI = &H001A  ' RT3F_7D
L_9C6B: SI = DI
L_9C6D: DI = &HC258
L_9C70: CompareLeft! = N_AA30!: CompareRight! = N_C258!  ' RT3F_9F
L_9C73: IF CompareLeft! > CompareRight! THEN GOTO L_9C78  ' flags from L_9C70
L_9C75: GOTO L_9BEC
L_9C78: DI = &HB484
L_9C7B: SI = &HAA30
L_9C7E: CompareLeft! = N_AA30!: CompareRight! = N_B484!  ' RT3F_9F
L_9C81: IF CompareLeft! > CompareRight! THEN GOTO L_9C86  ' flags from L_9C7E
L_9C83: GOTO L_9CD5
L_9C86: DI = &H4F6C
L_9C89: SI = &HC206
L_9C8C: FAC! = N_C206! + N_4F6C!  ' RT3F_7F
L_9C8F: DI = SI
L_9C91: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9C94: GOSUB L_2352
L_9C97: BX = &H13
L_9C9A: ARGPUSH BX  ' RT3E_42
L_9C9D: BX = &H11
L_9CA0: LOCATE ARGS(), BX  ' RT3E_44
L_9CA3: ' PRINT statement begins (screen) ; RT3F_BC
L_9CA6: BX = &HC260
L_9CA9: PRINT S_C260$  ' RT3F_6E; H newline item, ledger correction
L_9CAC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9CAF: BEEP  ' RT3E_2B
L_9CB2: GOSUB L_20B6
L_9CB5: GOSUB L_20B6
L_9CB8: DI = &H4F94
L_9CBB: SI = &HC206
L_9CBE: CompareLeft! = N_C206!: CompareRight! = N_4F94!  ' RT3F_9F
L_9CC1: IF CompareLeft! > CompareRight! THEN GOTO L_9CC6  ' flags from L_9CBE
L_9CC3: GOTO L_9CD2
L_9CC6: DI = &H3BB4
L_9CC9: SI = &H4F6C
L_9CCC: N_3BB4! = N_4F6C!  ' RT3F_7B
L_9CCF: GOTO L_234F
L_9CD2: GOTO L_9AC3
L_9CD5: DI = &H3BB4
L_9CD8: SI = &HA66E
L_9CDB: N_3BB4! = N_A66E!  ' RT3F_7B
L_9CDE: BX = &H1850
L_9CE1: FAC! = CSNG(BX)  ' RT3F_57
L_9CE4: BX = &HC26A
L_9CE7: AX = &H4F78
L_9CEA: BX = TEMP_DESC(S_4F78$ + S_C26A$)  ' BX receives a temporary descriptor  ' RT3F_55
L_9CED: CX = &H28A4
L_9CF0: DX = &H1A
L_9CF3: BSAVE S(BX), OFFSET_ARG(DX), LENGTH_ARG(CX)  ' RT3E_1B
L_9CF6: BX = 1
L_9CF9: OpenMode% = BX  ' 0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND  ' RT3E_20
L_9CFC: BX = &HC27A
L_9CFF: AX = &H4F78

```

### Save records, quit and departure

```basic
L_9D02: BX = TEMP_DESC(S_4F78$ + S_C27A$)  ' BX receives a temporary descriptor  ' RT3F_55
L_9D05: DX = BX
L_9D07: BX = 1
L_9D0A: CX = 0
L_9D0C: OPEN S(DX) FOR OPENMODE(OpenMode%) AS #BX LEN=CX  ' RT3E_1E
L_9D0F: BX = 1
L_9D12: PrintDestination = FILE(BX)  ' begin PRINT #BX  ' RT3F_BE
L_9D15: BX = &H488C
L_9D18: PRINT #PrintDestination, S_488C$;  ' RT3F_6A
L_9D1B: BX = &HC286
L_9D1E: PRINT #PrintDestination, S_C286$;  ' RT3F_6A
L_9D21: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9D24: SI = &H4F6C
L_9D27: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_9D2A: GOTO L_9D5A
L_9D2D: ' Alignment NOP
L_9D2E: BX = 1
L_9D31: PrintDestination = FILE(BX)  ' begin PRINT #BX  ' RT3F_BE
L_9D34: SI = &HA5C4
L_9D37: BX = SI
L_9D39: DX = BX
L_9D3B: BX = CINT(N_A5C4!)  ' RT3F_75
L_9D3E: BX = BX * (2 ^ 1)
L_9D40: BX = BX * (2 ^ 1)
L_9D42: BX = BX + &H4288
L_9D46: PRINT #PrintDestination, S(BX);  ' RT3F_6A
L_9D49: BX = &HC286
L_9D4C: PRINT #PrintDestination, S_C286$;  ' RT3F_6A
L_9D4F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9D52: SI = DX
L_9D54: DI = &H4F6C
L_9D57: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_9D5A: DI = &HA5C4
L_9D5D: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_9D60: SI = DI
L_9D62: DI = &HA5CC
L_9D65: CompareLeft! = N_A5C4!: CompareRight! = N_A5CC!  ' RT3F_9F
L_9D68: IF CompareLeft! <= CompareRight! THEN GOTO L_9D2E  ' flags from L_9D65
L_9D6A: BX = 1
L_9D6D: CLOSE #BX  ' RT3E_21
L_9D70: GOSUB L_2352
L_9D73: BX = &H14
L_9D76: ARGPUSH BX  ' RT3E_42
L_9D79: BX = 2
L_9D7C: LOCATE ARGS(), BX  ' RT3E_44
L_9D7F: ' PRINT statement begins (screen) ; RT3F_BC
L_9D82: BX = &HC28C
L_9D85: PRINT S_C28C$  ' RT3F_6E; H newline item, ledger correction
L_9D88: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9D8B: GOSUB L_28BA
L_9D8E: SI = &HA838
L_9D91: CompareLeft! = N_A838!: CompareRight! = 0  ' RT3F_A7
L_9D94: IF CompareLeft! <> CompareRight! THEN GOTO L_9D99  ' flags from L_9D91
L_9D96: GOTO L_234F
L_9D99: END  ' RT3E_01
L_9D9C: GOSUB L_2352
L_9D9F: BX = &H14
L_9DA2: ARGPUSH BX  ' RT3E_42
L_9DA5: BX = 2
L_9DA8: LOCATE ARGS(), BX  ' RT3E_44
L_9DAB: DI = &HA6E4
L_9DAE: SI = &HA66E
L_9DB1: N_A6E4! = N_A66E!  ' RT3F_7B
L_9DB4: BX = DI
L_9DB6: DI = &HA6E8
L_9DB9: DX = SI
L_9DBB: SI = &H4F6C
L_9DBE: N_A6E8! = N_4F6C!  ' RT3F_7B
L_9DC1: GOSUB L_0797
L_9DC4: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_9DC7: BX = 0
L_9DCA: IF CompareLeft! <> CompareRight! THEN GOTO L_9DCD  ' flags from L_9DC4
L_9DCC: BX = BX - 1
L_9DCD: DI = &HA6E4
L_9DD0: SI = &HA86C
L_9DD3: N_A6E4! = N_A86C!  ' RT3F_7B
L_9DD6: DI = &HA6E8
L_9DD9: SI = &H4F6C
L_9DDC: N_A6E8! = N_4F6C!  ' RT3F_7B
L_9DDF: WORD(BP - 6) = BX
L_9DE2: GOSUB L_0797
L_9DE5: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_9DE8: BX = 0
L_9DEB: IF CompareLeft! <> CompareRight! THEN GOTO L_9DEE  ' flags from L_9DE5
L_9DED: BX = BX - 1
L_9DEE: BX = BX OR WORD(BP - 6)
L_9DF1: DI = &H4F6C
L_9DF4: SI = &H3AB0
L_9DF7: CompareLeft! = N_3AB0!: CompareRight! = N_4F6C!  ' RT3F_9F
L_9DFA: DX = 0
L_9DFD: IF CompareLeft! >= CompareRight! THEN GOTO L_9E00  ' flags from L_9DF7
L_9DFF: DX = DX - 1
L_9E00: DX = DX OR BX
L_9E02: SI = &H18FC
L_9E05: CompareLeft! = N_18FC!: CompareRight! = 0  ' RT3F_A7
L_9E08: BX = 0
L_9E0B: IF CompareLeft! <> CompareRight! THEN GOTO L_9E0E  ' flags from L_9E05
L_9E0D: BX = BX - 1
L_9E0E: BX = BX OR DX
L_9E10: CompareLeft% = BX: CompareRight% = 0
L_9E12: IF CompareLeft% <> CompareRight% THEN GOTO L_9E17  ' flags from L_9E10
L_9E14: GOTO L_9E2C
L_9E17: ' PRINT statement begins (screen) ; RT3F_BC
L_9E1A: BX = &HC2A4
L_9E1D: PRINT S_C2A4$  ' RT3F_6E; H newline item, ledger correction
L_9E20: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9E23: GOSUB L_20B6
L_9E26: GOSUB L_20B6
L_9E29: GOTO L_234F
L_9E2C: GOSUB L_965F
L_9E2F: DI = &H4F6C
L_9E32: SI = &H1998
L_9E35: CompareLeft! = N_1998!: CompareRight! = N_4F6C!  ' RT3F_9F
L_9E38: IF CompareLeft! < CompareRight! THEN GOTO L_9E3D  ' flags from L_9E35
L_9E3A: GOTO L_9E52
L_9E3D: ' PRINT statement begins (screen) ; RT3F_BC
L_9E40: BX = &HC2C0
L_9E43: PRINT S_C2C0$  ' RT3F_6E; H newline item, ledger correction
L_9E46: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9E49: GOSUB L_20B6
L_9E4C: GOSUB L_20B6
L_9E4F: GOTO L_234F
L_9E52: ' PRINT statement begins (screen) ; RT3F_BC
L_9E55: BX = &HC2D4
L_9E58: PRINT S_C2D4$  ' RT3F_6E; H newline item, ledger correction
L_9E5B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9E5E: SI = &H4F6C
L_9E61: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_9E64: GOTO L_9EBF
L_9E67: ' Alignment NOP
L_9E68: DI = &HA6F8
L_9E6B: SI = &HC2E8
L_9E6E: N_A6F8! = N_C2E8!  ' RT3F_7B
L_9E71: DI = &HA6FC
L_9E74: SI = &HA9FE
L_9E77: N_A6FC! = N_A9FE!  ' RT3F_7B
L_9E7A: GOSUB L_07C9
L_9E7D: BX = CINT(FAC!)  ' RT3F_77
L_9E80: DI = BX
L_9E82: DI = DI * (2 ^ 1)
L_9E84: DI = DI * (2 ^ 1)
L_9E86: DI = DI + &H1850
L_9E8A: BX = DI
L_9E8C: DI = &HA6E4
L_9E8F: SI = &HA682
L_9E92: N_A6E4! = N_A682!  ' RT3F_7B
L_9E95: DI = &HA6E8
L_9E98: SI = &HA9FE
L_9E9B: N_A6E8! = N_A9FE!  ' RT3F_7B
L_9E9E: WORD(BP - 6) = BX
L_9EA1: GOSUB L_0797
L_9EA4: DI = &HC2EC
L_9EA7: FAC! = FAC! / N_C2EC!  ' RT3F_89
L_9EAA: BX = &H1A
L_9EAD: FAC! = INT(FAC!)  ' RT3D_03
L_9EB0: DI = WORD(BP - 6)
L_9EB3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9EB6: DI = &H4F6C
L_9EB9: SI = &HA9FE
L_9EBC: FAC! = N_A9FE! + N_4F6C!  ' RT3F_7F
L_9EBF: DI = &HA9FE
L_9EC2: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_9EC5: SI = DI
L_9EC7: DI = &HA5CC
L_9ECA: CompareLeft! = N_A9FE!: CompareRight! = N_A5CC!  ' RT3F_9F
L_9ECD: IF CompareLeft! <= CompareRight! THEN GOTO L_9E68  ' flags from L_9ECA
L_9ECF: DI = &H3B1C
L_9ED2: SI = &H4F6C
L_9ED5: N_3B1C! = N_4F6C!  ' RT3F_7B
L_9ED8: DI = &HA9FA
L_9EDB: SI = &H3AB8
L_9EDE: FAC! = N_3AB8! * N_A9FA!  ' RT3F_8F
L_9EE1: BX = DI
L_9EE3: DI = &H3AC0
L_9EE6: DX = SI
L_9EE8: FAC! = FAC! + N_3AC0!  ' RT3F_81
L_9EEB: CX = DI
L_9EED: DI = &HBA2E
L_9EF0: FAC! = FAC! + N_BA2E!  ' RT3F_81
L_9EF3: DI = &HBA32
L_9EF6: FAC! = FAC! + N_BA32!  ' RT3F_81
L_9EF9: DI = &HA9F6
L_9EFC: N_A9F6! = FAC!: SI = &H001A  ' RT3F_7D
L_9EFF: SWAP BX, DI

```

### Ship naming and music

```basic
L_9F01: SI = BX
L_9F03: FAC! = N_A9F6! / N(DI)  ' RT3F_87
L_9F06: BX = &H1A
L_9F09: FAC! = INT(FAC!)  ' RT3D_03
L_9F0C: BX = DI
L_9F0E: DI = &HACE4
L_9F11: AX = SI
L_9F13: N_ACE4! = FAC!: SI = &H001A  ' RT3F_7D
L_9F16: SWAP DX, DI
L_9F18: SI = DX
L_9F1A: N(DI) = N_ACE4!  ' RT3F_7B
L_9F1D: SWAP BX, DI
L_9F1F: SWAP BX, SI
L_9F21: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_9F24: SI = AX
L_9F26: FAC! = N(SI) - FAC!  ' RT3F_9B
L_9F29: DI = DX
L_9F2B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9F2E: FAC! = INT(N(BX))  ' RT3D_03
L_9F31: DI = CX
L_9F33: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_9F36: BX = &HC2F0
L_9F39: AX = &H4F78
L_9F3C: BX = TEMP_DESC(S_4F78$ + S_C2F0$)  ' BX receives a temporary descriptor  ' RT3F_55
L_9F3F: CHAIN S(BX)  ' RT3E_0E; H expanded ledger
L_9F42: END  ' RT3E_01
L_9F45: SI = &H18FC
L_9F48: CompareLeft! = N_18FC!: CompareRight! = 0  ' RT3F_A7
L_9F4B: BX = 0
L_9F4E: IF CompareLeft! <> CompareRight! THEN GOTO L_9F51  ' flags from L_9F48
L_9F50: BX = BX - 1
L_9F51: DX = BX
L_9F53: BX = &H4F8A
L_9F56: AX = &H488C
L_9F59: CompareLeft$ = S_488C$: CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_9F5C: CX = 0
L_9F5F: IF CompareLeft$ = CompareRight$ THEN GOTO L_9F62  ' flags from L_9F59
L_9F61: CX = CX - 1
L_9F62: CX = CX OR DX
L_9F64: CompareLeft% = CX: CompareRight% = 0
L_9F66: IF CompareLeft% = CompareRight% THEN GOTO L_9F6B  ' flags from L_9F64
L_9F68: GOTO L_234F
L_9F6B: GOSUB L_2352
L_9F6E: BX = &H14
L_9F71: ARGPUSH BX  ' RT3E_42
L_9F74: BX = 2
L_9F77: LOCATE ARGS(), BX  ' RT3E_44
L_9F7A: ' PRINT statement begins (screen) ; RT3F_BC
L_9F7D: BX = &HC2FE
L_9F80: PRINT S_C2FE$;  ' RT3F_6A
L_9F83: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9F86: DI = &HAE50
L_9F89: SI = &HA672
L_9F8C: N_AE50! = N_A672!  ' RT3F_7B
L_9F8F: GOSUB L_24F4
L_9F92: BX = &HAD12
L_9F95: DX = &H488C
L_9F98: S_488C$ = S_AD12$  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_9F9B: GOSUB L_2352
L_9F9E: BX = &H13
L_9FA1: ARGPUSH BX  ' RT3E_42
L_9FA4: BX = 2
L_9FA7: LOCATE ARGS(), BX  ' RT3E_44
L_9FAA: ' PRINT statement begins (screen) ; RT3F_BC
L_9FAD: DX = BX
L_9FAF: BX = &HC318
L_9FB2: PRINT S_C318$  ' RT3F_6E; H newline item, ledger correction
L_9FB5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9FB8: BX = &H14
L_9FBB: ARGPUSH BX  ' RT3E_42
L_9FBE: BX = DX
L_9FC0: LOCATE ARGS(), BX  ' RT3E_44
L_9FC3: ' PRINT statement begins (screen) ; RT3F_BC
L_9FC6: BX = &HC0A4
L_9FC9: PRINT S_C0A4$;  ' RT3F_6A
L_9FCC: BX = &H488C
L_9FCF: PRINT S_488C$;  ' RT3F_6A
L_9FD2: BX = &HC33E
L_9FD5: PRINT S_C33E$  ' RT3F_6E; H newline item, ledger correction
L_9FD8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_9FDB: BX = &H491C
L_9FDE: BX = TEMP_DESC(VARPTR$(S_491C$))  ' RT3F_18
L_9FE1: AX = &HC350
L_9FE4: BX = TEMP_DESC(S_C350$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_9FE7: PLAY S(BX)  ' RT3E_51
L_9FEA: GOTO L_234F
L_9FED: GOSUB L_2352
L_9FF0: BX = &H10
L_9FF3: ARGPUSH BX  ' RT3E_42
L_9FF6: BX = 2
L_9FF9: LOCATE ARGS(), BX  ' RT3E_44
L_9FFC: ' PRINT statement begins (screen) ; RT3F_BC
L_9FFF: BX = &HC356

```

### Weapons and shield displays

```basic
L_A002: PRINT S_C356$  ' RT3F_6E; H newline item, ledger correction
L_A005: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A008: SI = &HC370
L_A00B: FAC! = N_C370!: DI = &H001E  ' RT3F_6F
L_A00E: GOTO L_A034
L_A011: ' Alignment NOP
L_A012: SI = &HA5C4
L_A015: BX = SI
L_A017: DX = BX
L_A019: BX = CINT(N_A5C4!)  ' RT3F_75
L_A01C: DI = BX
L_A01E: DI = DI * (2 ^ 1)
L_A020: DI = DI * (2 ^ 1)
L_A022: DI = DI + &H1850
L_A026: SI = &HB6A6
L_A029: N(DI) = N_B6A6!  ' RT3F_7B
L_A02C: SI = DX
L_A02E: DI = &H4F6C
L_A031: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_A034: DI = &HA5C4
L_A037: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_A03A: SI = DI
L_A03C: DI = &HC374
L_A03F: CompareLeft! = N_A5C4!: CompareRight! = N_C374!  ' RT3F_9F
L_A042: IF CompareLeft! <= CompareRight! THEN GOTO L_A012  ' flags from L_A03F
L_A044: SI = &HB094
L_A047: FAC! = N_B094!: DI = &H001E  ' RT3F_6F
L_A04A: GOTO L_A093
L_A04D: ' Alignment NOP
L_A04E: SI = &HA5C4
L_A051: BX = SI
L_A053: DX = BX
L_A055: BX = CINT(N_A5C4!)  ' RT3F_75
L_A058: SI = BX
L_A05A: SI = SI * (2 ^ 1)
L_A05C: SI = SI * (2 ^ 1)
L_A05E: SI = SI + &H1850
L_A062: DI = &HAB7A
L_A065: N_AB7A! = N(SI)  ' RT3F_7B
L_A068: SI = DI
L_A06A: DI = &HC370
L_A06D: FAC! = N_AB7A! + N_C370!  ' RT3F_7F
L_A070: BX = CINT(FAC!)  ' RT3F_77
L_A073: DI = BX
L_A075: DI = DI * (2 ^ 1)
L_A077: DI = DI * (2 ^ 1)
L_A079: DI = DI + &H1850
L_A07D: SI = DI
L_A07F: DI = &H4F6C
L_A082: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_A085: SWAP SI, DI
L_A087: BX = SI
L_A089: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A08C: DI = BX
L_A08E: SI = DX
L_A090: FAC! = N(SI) + N(DI)  ' RT3F_7F
L_A093: DI = &HA5C4
L_A096: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_A099: SI = DI
L_A09B: DI = &HB0A6
L_A09E: CompareLeft! = N_A5C4!: CompareRight! = N_B0A6!  ' RT3F_9F
L_A0A1: IF CompareLeft! <= CompareRight! THEN GOTO L_A04E  ' flags from L_A09E
L_A0A3: SI = &H4F6C
L_A0A6: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_A0A9: GOTO L_A1C4
L_A0AC: DI = &HA97C
L_A0AF: SI = &HA5C4
L_A0B2: FAC! = N_A5C4! + N_A97C!  ' RT3F_7F
L_A0B5: BX = SI
L_A0B7: DX = BX
L_A0B9: BX = CINT(FAC!)  ' RT3F_77
L_A0BC: ARGPUSH BX  ' RT3E_42
L_A0BF: BX = 2
L_A0C2: LOCATE ARGS(), BX  ' RT3E_44
L_A0C5: ' PRINT statement begins (screen) ; RT3F_BC
L_A0C8: SI = DX
L_A0CA: DI = &HA870
L_A0CD: FAC! = N(SI) + N_A870!  ' RT3F_7F
L_A0D0: BX = CINT(FAC!)  ' RT3F_77
L_A0D3: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_A0D6: PRINT S(BX);  ' RT3F_6A
L_A0D9: BX = &HC37C
L_A0DC: PRINT S_C37C$;  ' RT3F_6A
L_A0DF: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A0E2: SI = DX
L_A0E4: DI = &HA850
L_A0E7: FAC! = N(SI) * N_A850!  ' RT3F_8F
L_A0EA: DI = &HC382
L_A0ED: FAC! = FAC! + N_C382!  ' RT3F_81
L_A0F0: DI = &HAF0E
L_A0F3: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_A0F6: SI = DI
L_A0F8: BX = CINT(N_AF0E!)  ' RT3F_75
L_A0FB: SI = BX
L_A0FD: SI = SI * (2 ^ 1)
L_A0FF: SI = SI * (2 ^ 1)
L_A101: SI = SI + &H1850
L_A105: DI = &HC378
L_A108: N_C378! = N(SI)  ' RT3F_7B
L_A10B: SI = DI
L_A10D: DI = &H4F6C
L_A110: CompareLeft! = N_C378!: CompareRight! = N_4F6C!  ' RT3F_9F
L_A113: IF CompareLeft! >= CompareRight! THEN GOTO L_A118  ' flags from L_A110
L_A115: GOTO L_A1BB
L_A118: DI = &HAE44
L_A11B: SI = &HC378
L_A11E: CompareLeft! = N_C378!: CompareRight! = N_AE44!  ' RT3F_9F
L_A121: IF CompareLeft! > CompareRight! THEN GOTO L_A126  ' flags from L_A11E
L_A123: GOTO L_A135
L_A126: ' PRINT statement begins (screen) ; RT3F_BC
L_A129: BX = &HC386
L_A12C: PRINT S_C386$;  ' RT3F_6A
L_A12F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A132: GOTO L_A152
L_A135: ' PRINT statement begins (screen) ; RT3F_BC
L_A138: DI = &HC370
L_A13B: SI = &HC378
L_A13E: FAC! = N_C378! + N_C370!  ' RT3F_7F
L_A141: BX = CINT(FAC!)  ' RT3F_77
L_A144: BX = BX * (2 ^ 1)
L_A146: BX = BX * (2 ^ 1)
L_A148: BX = BX + &H1850
L_A14C: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_A14F: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A152: ARGPUSH OMITTED  ' RT3E_43
L_A155: BX = &HA
L_A158: LOCATE ARGS(), BX  ' RT3E_44
L_A15B: DI = &HA686
L_A15E: SI = &HA5C4
L_A161: FAC! = N_A5C4! + N_A686!  ' RT3F_7F
L_A164: BX = CINT(FAC!)  ' RT3F_77
L_A167: BX = BX * (2 ^ 1)
L_A169: BX = BX * (2 ^ 1)
L_A16B: BX = BX + &H1850
L_A16F: FAC! = INT(N(BX))  ' RT3D_03
L_A172: DI = &H4F6C
L_A175: CompareLeft! = FAC!: CompareRight! = N_4F6C!  ' RT3F_A1
L_A178: IF CompareLeft! <> CompareRight! THEN GOTO L_A17D  ' flags from L_A175
L_A17A: GOTO L_A18C
L_A17D: ' PRINT statement begins (screen) ; RT3F_BC
L_A180: BX = &HA642
L_A183: PRINT S_A642$;  ' RT3F_6A
L_A186: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A189: GOTO L_A198
L_A18C: ' PRINT statement begins (screen) ; RT3F_BC
L_A18F: BX = &HAC6A
L_A192: PRINT S_AC6A$;  ' RT3F_6A
L_A195: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A198: ' PRINT statement begins (screen) ; RT3F_BC
L_A19B: DI = &HA844
L_A19E: SI = &HC378
L_A1A1: FAC! = N_C378! + N_A844!  ' RT3F_7F
L_A1A4: BX = CINT(FAC!)  ' RT3F_77
L_A1A7: BX = BX * (2 ^ 1)
L_A1A9: BX = BX * (2 ^ 1)
L_A1AB: BX = BX + &H4390
L_A1AF: DX = &H1C
L_A1B2: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_A1B5: PRINT S(BX);  ' RT3F_6A
L_A1B8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A1BB: DI = &H4F6C
L_A1BE: SI = &HA5C4
L_A1C1: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_A1C4: DI = &HA5C4
L_A1C7: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_A1CA: SI = DI
L_A1CC: DI = &HA696
L_A1CF: CompareLeft! = N_A5C4!: CompareRight! = N_A696!  ' RT3F_9F
L_A1D2: IF CompareLeft! > CompareRight! THEN GOTO L_A1D7  ' flags from L_A1CF
L_A1D4: GOTO L_A0AC
L_A1D7: RETURN
L_A1D8: DI = &HAF0E
L_A1DB: SI = &HB3EC
L_A1DE: N_AF0E! = N_B3EC!  ' RT3F_7B
L_A1E1: GOSUB L_2352
L_A1E4: DI = &HA696
L_A1E7: SI = &HAF0E
L_A1EA: FAC! = N_AF0E! + N_A696!  ' RT3F_7F
L_A1ED: DI = &HC38C
L_A1F0: N_C38C! = FAC!: SI = &H001A  ' RT3F_7D
L_A1F3: SI = DI
L_A1F5: DI = &HB3F0
L_A1F8: CompareLeft! = N_C38C!: CompareRight! = N_B3F0!  ' RT3F_9F
L_A1FB: IF CompareLeft! > CompareRight! THEN GOTO L_A200  ' flags from L_A1F8
L_A1FD: GOTO L_A205
L_A200: SWAP DI, SI
L_A202: N(DI) = N(SI)  ' RT3F_7B
L_A205: DI = &HC390
L_A208: SI = &HC38C
L_A20B: N_C390! = N_C38C!  ' RT3F_7B
L_A20E: SI = &HAF0E
L_A211: FAC! = N_AF0E!: DI = &H001E  ' RT3F_6F
L_A214: GOTO L_A27E
L_A217: ' Alignment NOP
L_A218: DI = &HAF0E
L_A21B: SI = &HA97C
L_A21E: FAC! = N_A97C! - N_AF0E!  ' RT3F_97
L_A221: BX = DI
L_A223: DI = &HA5C4
L_A226: FAC! = FAC! + N_A5C4!  ' RT3F_81
L_A229: DX = BX
L_A22B: BX = CINT(FAC!)  ' RT3F_77
L_A22E: ARGPUSH BX  ' RT3E_42
L_A231: BX = 2
L_A234: LOCATE ARGS(), BX  ' RT3E_44
L_A237: ' PRINT statement begins (screen) ; RT3F_BC
L_A23A: SWAP DX, DI
L_A23C: SI = &HB818
L_A23F: FAC! = N_B818! - N(DI)  ' RT3F_97
L_A242: DI = DX
L_A244: FAC! = FAC! + N(DI)  ' RT3F_81
L_A247: BX = CINT(FAC!)  ' RT3F_77
L_A24A: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_A24D: PRINT S(BX);  ' RT3F_6A
L_A250: BX = &HA63C
L_A253: PRINT S_A63C$;  ' RT3F_6A
L_A256: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A259: SI = &HB3E4
L_A25C: BX = CINT(N_B3E4!)  ' RT3F_75
L_A25F: ON BX GOSUB L_A332, L_A34A, L_A362, L_A37A, L_A392, L_A3AA, L_A3C2, L_A3DA, L_A3F2  ' RT3F_5D; H ledger; raw payload in dispatch evidence
L_A275: DI = &H4F6C
L_A278: SI = &HA5C4
L_A27B: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_A27E: DI = &HA5C4
L_A281: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_A284: SI = DI
L_A286: DI = &HC390
L_A289: CompareLeft! = N_A5C4!: CompareRight! = N_C390!  ' RT3F_9F
L_A28C: IF CompareLeft! <= CompareRight! THEN GOTO L_A218  ' flags from L_A289
L_A28E: BX = &H18
L_A291: ARGPUSH BX  ' RT3E_42
L_A294: BX = 2
L_A297: LOCATE ARGS(), BX  ' RT3E_44
L_A29A: ' PRINT statement begins (screen) ; RT3F_BC
L_A29D: BX = &HC394
L_A2A0: PRINT S_C394$;  ' RT3F_6A
L_A2A3: BX = &HB3E8
L_A2A6: PRINT S_B3E8$;  ' RT3F_6A
L_A2A9: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A2AC: DI = &HB3F0
L_A2AF: SI = &HC38C
L_A2B2: CompareLeft! = N_C38C!: CompareRight! = N_B3F0!  ' RT3F_9F
L_A2B5: IF CompareLeft! < CompareRight! THEN GOTO L_A2BA  ' flags from L_A2B2
L_A2B7: GOTO L_A2C6
L_A2BA: ' PRINT statement begins (screen) ; RT3F_BC
L_A2BD: BX = &HC3A2
L_A2C0: PRINT S_C3A2$;  ' RT3F_6A
L_A2C3: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A2C6: DI = &HAF0E
L_A2C9: SI = &HC38C
L_A2CC: FAC! = N_C38C! - N_AF0E!  ' RT3F_97
L_A2CF: DI = &H4F6C
L_A2D2: FAC! = FAC! + N_4F6C!  ' RT3F_81
L_A2D5: DI = &HAE0E
L_A2D8: N_AE0E! = FAC!: SI = &H001A  ' RT3F_7D
L_A2DB: GOSUB L_22C4
L_A2DE: DI = &HC3B6
L_A2E1: SI = &HAE16
L_A2E4: CompareLeft! = N_AE16!: CompareRight! = N_C3B6!  ' RT3F_9F
L_A2E7: IF CompareLeft! = CompareRight! THEN GOTO L_A2EC  ' flags from L_A2E4
L_A2E9: GOTO L_A2ED
L_A2EC: RETURN
L_A2ED: DI = &HAE22
L_A2F0: SI = &HAE16
L_A2F3: CompareLeft! = N_AE16!: CompareRight! = N_AE22!  ' RT3F_9F
L_A2F6: IF CompareLeft! = CompareRight! THEN GOTO L_A2FB  ' flags from L_A2F3
L_A2F8: GOTO L_A325
L_A2FB: DI = &H4F6C
L_A2FE: SI = &HC38C
L_A301: FAC! = N_C38C! + N_4F6C!  ' RT3F_7F
L_A304: DI = &HAF0E
L_A307: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_A30A: SI = DI
L_A30C: DI = &HB3F0
L_A30F: CompareLeft! = N_AF0E!: CompareRight! = N_B3F0!  ' RT3F_9F
L_A312: IF CompareLeft! > CompareRight! THEN GOTO L_A317  ' flags from L_A30F
L_A314: GOTO L_A322
L_A317: DI = SI
L_A319: SI = &HB3EC
L_A31C: N(DI) = N_B3EC!  ' RT3F_7B
L_A31F: GOTO L_A1E1
L_A322: GOTO L_A1E1
L_A325: DI = &HAE16
L_A328: SI = &HAF0E
L_A32B: FAC! = N_AF0E! + N_AE16!  ' RT3F_7F
L_A32E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A331: RETURN
L_A332: ' PRINT statement begins (screen) ; RT3F_BC
L_A335: SI = &HA5C4
L_A338: BX = CINT(N_A5C4!)  ' RT3F_75
L_A33B: BX = BX * (2 ^ 1)
L_A33D: BX = BX * (2 ^ 1)
L_A33F: BX = BX + &H4390
L_A343: PRINT S(BX);  ' RT3F_6A
L_A346: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A349: RETURN
L_A34A: ' PRINT statement begins (screen) ; RT3F_BC
L_A34D: SI = &HA5C4
L_A350: BX = CINT(N_A5C4!)  ' RT3F_75
L_A353: BX = BX * (2 ^ 1)
L_A355: BX = BX * (2 ^ 1)
L_A357: BX = BX + &H435C
L_A35B: PRINT S(BX);  ' RT3F_6A
L_A35E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A361: RETURN
L_A362: ' PRINT statement begins (screen) ; RT3F_BC
L_A365: SI = &HA5C4
L_A368: BX = CINT(N_A5C4!)  ' RT3F_75
L_A36B: BX = BX * (2 ^ 1)
L_A36D: BX = BX * (2 ^ 1)
L_A36F: BX = BX + &H4370
L_A373: PRINT S(BX);  ' RT3F_6A
L_A376: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A379: RETURN
L_A37A: ' PRINT statement begins (screen) ; RT3F_BC
L_A37D: SI = &HA5C4
L_A380: BX = CINT(N_A5C4!)  ' RT3F_75
L_A383: BX = BX * (2 ^ 1)
L_A385: BX = BX * (2 ^ 1)
L_A387: BX = BX + &H4384
L_A38B: PRINT S(BX);  ' RT3F_6A
L_A38E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A391: RETURN
L_A392: ' PRINT statement begins (screen) ; RT3F_BC
L_A395: SI = &HA5C4
L_A398: BX = CINT(N_A5C4!)  ' RT3F_75
L_A39B: BX = BX * (2 ^ 1)
L_A39D: BX = BX * (2 ^ 1)
L_A39F: BX = BX + &H43F4
L_A3A3: PRINT S(BX);  ' RT3F_6A
L_A3A6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A3A9: RETURN
L_A3AA: ' PRINT statement begins (screen) ; RT3F_BC
L_A3AD: SI = &HA5C4
L_A3B0: BX = CINT(N_A5C4!)  ' RT3F_75
L_A3B3: BX = BX * (2 ^ 1)
L_A3B5: BX = BX * (2 ^ 1)
L_A3B7: BX = BX + &H44CC
L_A3BB: PRINT S(BX);  ' RT3F_6A
L_A3BE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A3C1: RETURN
L_A3C2: ' PRINT statement begins (screen) ; RT3F_BC
L_A3C5: SI = &HA5C4
L_A3C8: BX = CINT(N_A5C4!)  ' RT3F_75
L_A3CB: BX = BX * (2 ^ 1)
L_A3CD: BX = BX * (2 ^ 1)
L_A3CF: BX = BX + &H44E4
L_A3D3: PRINT S(BX);  ' RT3F_6A
L_A3D6: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A3D9: RETURN
L_A3DA: ' PRINT statement begins (screen) ; RT3F_BC
L_A3DD: SI = &HA5C4
L_A3E0: BX = CINT(N_A5C4!)  ' RT3F_75
L_A3E3: BX = BX * (2 ^ 1)
L_A3E5: BX = BX * (2 ^ 1)
L_A3E7: BX = BX + &H44F4
L_A3EB: PRINT S(BX);  ' RT3F_6A
L_A3EE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A3F1: RETURN
L_A3F2: ' PRINT statement begins (screen) ; RT3F_BC
L_A3F5: SI = &HA5C4
L_A3F8: BX = CINT(N_A5C4!)  ' RT3F_75
L_A3FB: BX = BX * (2 ^ 1)
L_A3FD: BX = BX * (2 ^ 1)
L_A3FF: BX = BX + &H4534
L_A403: PRINT S(BX);  ' RT3F_6A
L_A406: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A409: RETURN
L_A40A: ' PRINT statement begins (screen) ; RT3F_BC
L_A40D: SI = &HA5C4
L_A410: BX = CINT(N_A5C4!)  ' RT3F_75
L_A413: BX = BX * (2 ^ 1)
L_A415: BX = BX * (2 ^ 1)
L_A417: BX = BX + &H4534
L_A41B: PRINT S(BX);  ' RT3F_6A
L_A41E: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A421: RETURN
L_A422: BX = TEMP_DESC(INKEY$)  ' BX receives a temporary descriptor  ' RT3D_06
L_A425: DX = &HAD12
L_A428: S_AD12$ = S(BX)  ' RT3F_61; H corrected ledger direction, runtime 9DC4..9DD0
L_A42B: AX = DX
L_A42D: BX = &H4F8A
L_A430: CompareLeft$ = S(AX): CompareRight$ = S_4F8A$  ' RT3F_62; H string compare from 9E1F..9E49
L_A433: IF CompareLeft$ = CompareRight$ THEN GOTO L_A422  ' flags from L_A430
L_A435: BX = &HAD12
L_A438: DAC# = VAL(S_AD12$)  ' RT3D_13
L_A43B: BX = CINT(DAC#)  ' RT3F_78
L_A43E: AX = BX
L_A440: WORD(&HAE70) = AX
L_A443: RETURN
L_A444: GOSUB L_2352
L_A447: BX = &H10
L_A44A: ARGPUSH BX  ' RT3E_42
L_A44D: BX = 2
L_A450: LOCATE ARGS(), BX  ' RT3E_44
L_A453: ' PRINT statement begins (screen) ; RT3F_BC
L_A456: BX = &HC3BA
L_A459: PRINT S_C3BA$;  ' RT3F_6A
L_A45C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A45F: ARGPUSH OMITTED  ' RT3E_43
L_A462: BX = &H18
L_A465: LOCATE ARGS(), BX  ' RT3E_44
L_A468: ' PRINT statement begins (screen) ; RT3F_BC
L_A46B: BX = &HC3C8
L_A46E: PRINT S_C3C8$  ' RT3F_6E; H newline item, ledger correction
L_A471: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A474: SI = &H4F6C
L_A477: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_A47A: GOTO L_A582
L_A47D: ' Alignment NOP
L_A47E: DI = &HB05C
L_A481: SI = &HA5C4
L_A484: FAC! = N_A5C4! + N_B05C!  ' RT3F_7F
L_A487: BX = SI
L_A489: DX = BX
L_A48B: BX = CINT(FAC!)  ' RT3F_77
L_A48E: ARGPUSH BX  ' RT3E_42
L_A491: BX = 2
L_A494: LOCATE ARGS(), BX  ' RT3E_44
L_A497: ' PRINT statement begins (screen) ; RT3F_BC
L_A49A: SI = DX
L_A49C: DI = &HA870
L_A49F: FAC! = N(SI) + N_A870!  ' RT3F_7F
L_A4A2: BX = CINT(FAC!)  ' RT3F_77
L_A4A5: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_A4A8: PRINT S(BX);  ' RT3F_6A
L_A4AB: BX = &HC37C
L_A4AE: PRINT S_C37C$;  ' RT3F_6A
L_A4B1: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A4B4: SI = DX
L_A4B6: DI = &HA5C0
L_A4B9: FAC! = N(SI) * N_A5C0!  ' RT3F_8F
L_A4BC: DI = &HB058
L_A4BF: FAC! = FAC! + N_B058!  ' RT3F_81
L_A4C2: DI = &HAF0E
L_A4C5: N_AF0E! = FAC!: SI = &H001A  ' RT3F_7D
L_A4C8: SI = DI
L_A4CA: BX = CINT(N_AF0E!)  ' RT3F_75
L_A4CD: SI = BX
L_A4CF: SI = SI * (2 ^ 1)
L_A4D1: SI = SI * (2 ^ 1)
L_A4D3: SI = SI + &H1850
L_A4D7: DI = &H4F6C
L_A4DA: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_A4DD: IF CompareLeft! >= CompareRight! THEN GOTO L_A4E2  ' flags from L_A4DA
L_A4DF: GOTO L_A579
L_A4E2: DI = &HA696
L_A4E5: SI = &HA5C4
L_A4E8: FAC! = N_A5C4! + N_A696!  ' RT3F_7F
L_A4EB: BX = CINT(FAC!)  ' RT3F_77
L_A4EE: SI = BX
L_A4F0: SI = SI * (2 ^ 1)
L_A4F2: SI = SI * (2 ^ 1)
L_A4F4: SI = SI + &H1850
L_A4F8: DI = &H4F6C
L_A4FB: CompareLeft! = N(SI): CompareRight! = N_4F6C!  ' RT3F_9F
L_A4FE: IF CompareLeft! = CompareRight! THEN GOTO L_A503  ' flags from L_A4FB
L_A500: GOTO L_A512
L_A503: ' PRINT statement begins (screen) ; RT3F_BC
L_A506: BX = &HAC6A
L_A509: PRINT S_AC6A$;  ' RT3F_6A
L_A50C: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A50F: GOTO L_A51E
L_A512: ' PRINT statement begins (screen) ; RT3F_BC
L_A515: BX = &HA642
L_A518: PRINT S_A642$;  ' RT3F_6A
L_A51B: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A51E: ' PRINT statement begins (screen) ; RT3F_BC
L_A521: SI = &HAF0E
L_A524: BX = SI
L_A526: DX = BX
L_A528: BX = CINT(N_AF0E!)  ' RT3F_75
L_A52B: SI = BX
L_A52D: SI = SI * (2 ^ 1)
L_A52F: SI = SI * (2 ^ 1)
L_A531: SI = SI + &H1850
L_A535: DI = &HA844
L_A538: FAC! = N(SI) + N_A844!  ' RT3F_7F
L_A53B: BX = CINT(FAC!)  ' RT3F_77
L_A53E: BX = BX * (2 ^ 1)
L_A540: BX = BX * (2 ^ 1)
L_A542: BX = BX + &H435C
L_A546: CX = DX
L_A548: DX = &H12
L_A54B: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_A54E: PRINT S(BX);  ' RT3F_6A
L_A551: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A554: ARGPUSH OMITTED  ' RT3E_43
L_A557: BX = &H18
L_A55A: LOCATE ARGS(), BX  ' RT3E_44
L_A55D: ' PRINT statement begins (screen) ; RT3F_BC
L_A560: SI = CX
L_A562: DI = &H4F6C
L_A565: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_A568: BX = CINT(FAC!)  ' RT3F_77
L_A56B: BX = BX * (2 ^ 1)
L_A56D: BX = BX * (2 ^ 1)
L_A56F: BX = BX + &H1850
L_A573: PRINT N(BX)  ' RT3F_6B
L_A576: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A579: DI = &H4F6C
L_A57C: SI = &HA5C4
L_A57F: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_A582: DI = &HA5C4
L_A585: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_A588: SI = DI
L_A58A: DI = &HA676
L_A58D: CompareLeft! = N_A5C4!: CompareRight! = N_A676!  ' RT3F_9F
L_A590: IF CompareLeft! > CompareRight! THEN GOTO L_A595  ' flags from L_A58D
L_A592: GOTO L_A47E
L_A595: RETURN
L_A596: GOSUB L_2352
L_A599: BX = &H10
L_A59C: ARGPUSH BX  ' RT3E_42
L_A59F: BX = 2
L_A5A2: LOCATE ARGS(), BX  ' RT3E_44
L_A5A5: ' PRINT statement begins (screen) ; RT3F_BC
L_A5A8: BX = &HC3D2
L_A5AB: PRINT S_C3D2$;  ' RT3F_6A
L_A5AE: SI = &HA9FE
L_A5B1: BX = CINT(N_A9FE!)  ' RT3F_75
L_A5B4: BX = BX * (2 ^ 1)
L_A5B6: BX = BX * (2 ^ 1)
L_A5B8: BX = BX + &H4288
L_A5BC: PRINT S(BX);  ' RT3F_6A
L_A5BF: BX = &HC3E2
L_A5C2: PRINT S_C3E2$  ' RT3F_6E; H newline item, ledger correction
L_A5C5: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A5C8: SI = &HB5A6
L_A5CB: FAC! = N_B5A6!: DI = &H001E  ' RT3F_6F
L_A5CE: GOTO L_A5F4
L_A5D1: ' Alignment NOP
L_A5D2: SI = &HA5C4
L_A5D5: BX = SI
L_A5D7: DX = BX
L_A5D9: BX = CINT(N_A5C4!)  ' RT3F_75
L_A5DC: DI = BX
L_A5DE: DI = DI * (2 ^ 1)
L_A5E0: DI = DI * (2 ^ 1)
L_A5E2: DI = DI + &H1850
L_A5E6: SI = &HB6A6
L_A5E9: N(DI) = N_B6A6!  ' RT3F_7B
L_A5EC: SI = DX
L_A5EE: DI = &H4F6C
L_A5F1: FAC! = N_A5C4! + N_4F6C!  ' RT3F_7F
L_A5F4: DI = &HA5C4
L_A5F7: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_A5FA: SI = DI
L_A5FC: DI = &HC3F0
L_A5FF: CompareLeft! = N_A5C4!: CompareRight! = N_C3F0!  ' RT3F_9F
L_A602: IF CompareLeft! <= CompareRight! THEN GOTO L_A5D2  ' flags from L_A5FF
L_A604: SI = &HAFE8
L_A607: FAC! = N_AFE8!: DI = &H001E  ' RT3F_6F
L_A60A: GOTO L_A673
L_A60D: ' Alignment NOP
L_A60E: DI = &H4F94
L_A611: SI = &HA5C4
L_A614: FAC! = N_A5C4! + N_4F94!  ' RT3F_7F
L_A617: BX = SI
L_A619: DX = BX
L_A61B: BX = CINT(FAC!)  ' RT3F_77
L_A61E: SI = BX
L_A620: SI = SI * (2 ^ 1)
L_A622: SI = SI * (2 ^ 1)
L_A624: SI = SI + &H1850
L_A628: DI = &HA9FE
L_A62B: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_A62E: IF CompareLeft! = CompareRight! THEN GOTO L_A633  ' flags from L_A62B
L_A630: GOTO L_A66A
L_A633: SI = DX
L_A635: BX = CINT(N(SI))  ' RT3F_75
L_A638: SI = BX
L_A63A: SI = SI * (2 ^ 1)
L_A63C: SI = SI * (2 ^ 1)
L_A63E: SI = SI + &H1850
L_A642: DI = &HC370
L_A645: FAC! = N(SI) + N_C370!  ' RT3F_7F
L_A648: DI = &HAB7A
L_A64B: N_AB7A! = FAC!: SI = &H001A  ' RT3F_7D
L_A64E: SI = DI
L_A650: BX = CINT(N_AB7A!)  ' RT3F_75
L_A653: DI = BX
L_A655: DI = DI * (2 ^ 1)
L_A657: DI = DI * (2 ^ 1)
L_A659: DI = DI + &H1850
L_A65D: SI = DI
L_A65F: DI = &H4F6C
L_A662: FAC! = N(SI) + N_4F6C!  ' RT3F_7F
L_A665: DI = SI
L_A667: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A66A: DI = &HA5C0
L_A66D: SI = &HA5C4
L_A670: FAC! = N_A5C4! + N_A5C0!  ' RT3F_7F
L_A673: DI = &HA5C4
L_A676: N_A5C4! = FAC!: SI = &H001A  ' RT3F_7D
L_A679: SI = DI
L_A67B: DI = &HAFFA
L_A67E: CompareLeft! = N_A5C4!: CompareRight! = N_AFFA!  ' RT3F_9F
L_A681: IF CompareLeft! <= CompareRight! THEN GOTO L_A60E  ' flags from L_A67E
L_A683: DI = &HAF0E
L_A686: SI = &HAFD0
L_A689: N_AF0E! = N_AFD0!  ' RT3F_7B
L_A68C: DI = &HB44C
L_A68F: SI = &HAF0E
L_A692: N_B44C! = N_AF0E!  ' RT3F_7B
L_A695: DI = &HB438
L_A698: SI = &HB054
L_A69B: N_B438! = N_B054!  ' RT3F_7B
L_A69E: SI = &HB3FC
L_A6A1: BX = BASIC_BOOL(N_B3FC! <> 0)  ' RT3F_1D
L_A6A4: CompareLeft% = BX: CompareRight% = 0
L_A6A6: IF CompareLeft% <> CompareRight% THEN GOTO L_A6AB  ' flags from L_A6A4
L_A6A8: GOTO L_A6AE
L_A6AB: GOSUB L_2374
L_A6AE: SI = &HAF0E
L_A6B1: BX = SI
L_A6B3: DX = BX
L_A6B5: BX = CINT(N_AF0E!)  ' RT3F_75
L_A6B8: SI = BX
L_A6BA: SI = SI * (2 ^ 1)
L_A6BC: SI = SI * (2 ^ 1)
L_A6BE: SI = SI + &H1850
L_A6C2: DI = &HC3F4
L_A6C5: N_C3F4! = N(SI)  ' RT3F_7B
L_A6C8: SI = DI
L_A6CA: DI = &H4F6C
L_A6CD: CompareLeft! = N_C3F4!: CompareRight! = N_4F6C!  ' RT3F_9F
L_A6D0: BX = 0
L_A6D3: IF CompareLeft! >= CompareRight! THEN GOTO L_A6D6  ' flags from L_A6CD
L_A6D5: BX = BX - 1
L_A6D6: SI = DX
L_A6D8: DI = &HA854
L_A6DB: FAC! = N(SI) + N_A854!  ' RT3F_7F
L_A6DE: CX = BX
L_A6E0: BX = CINT(FAC!)  ' RT3F_77
L_A6E3: SI = BX
L_A6E5: SI = SI * (2 ^ 1)
L_A6E7: SI = SI * (2 ^ 1)
L_A6E9: SI = SI + &H1850
L_A6ED: DI = &HA9FE
L_A6F0: CompareLeft! = N(SI): CompareRight! = N_A9FE!  ' RT3F_9F
L_A6F3: BX = 0
L_A6F6: IF CompareLeft! = CompareRight! THEN GOTO L_A6F9  ' flags from L_A6F0
L_A6F8: BX = BX - 1
L_A6F9: BX = BX OR CX
L_A6FB: CompareLeft% = BX: CompareRight% = 0
L_A6FD: IF CompareLeft% <> CompareRight% THEN GOTO L_A702  ' flags from L_A6FB
L_A6FF: GOTO L_A71E
L_A702: SI = DX
L_A704: DI = &HA840
L_A707: FAC! = N(SI) + N_A840!  ' RT3F_7F
L_A70A: DI = DX
L_A70C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A70F: SI = DX
L_A711: DI = &HB440
L_A714: CompareLeft! = N(SI): CompareRight! = N_B440!  ' RT3F_9F
L_A717: IF CompareLeft! <= CompareRight! THEN GOTO L_A71C  ' flags from L_A714
L_A719: GOTO L_A82A
L_A71C: GOTO L_A6AE
L_A71E: SI = &HB438
L_A721: BX = SI
L_A723: DX = BX
L_A725: BX = CINT(N_B438!)  ' RT3F_75
L_A728: ARGPUSH BX  ' RT3E_42
L_A72B: BX = 2
L_A72E: LOCATE ARGS(), BX  ' RT3E_44
L_A731: SI = &HB400
L_A734: BX = BASIC_BOOL(N_B400! <> 0)  ' RT3F_1D
L_A737: CompareLeft% = BX: CompareRight% = 0
L_A739: IF CompareLeft% <> CompareRight% THEN GOTO L_A73E  ' flags from L_A737
L_A73B: GOTO L_A75B
L_A73E: ' PRINT statement begins (screen) ; RT3F_BC
L_A741: SI = DX
L_A743: DI = &HB4A8
L_A746: FAC! = N(SI) + N_B4A8!  ' RT3F_7F
L_A749: BX = CINT(FAC!)  ' RT3F_77
L_A74C: BX = TEMP_DESC(CHR$(BX))  ' BX receives a temporary descriptor  ' RT3D_05
L_A74F: PRINT S(BX);  ' RT3F_6A
L_A752: BX = &HC37C
L_A755: PRINT S_C37C$;  ' RT3F_6A
L_A758: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A75B: ' PRINT statement begins (screen) ; RT3F_BC
L_A75E: DI = &HC370
L_A761: SI = &HC3F4
L_A764: FAC! = N_C3F4! + N_C370!  ' RT3F_7F
L_A767: BX = CINT(FAC!)  ' RT3F_77
L_A76A: BX = BX * (2 ^ 1)
L_A76C: BX = BX * (2 ^ 1)
L_A76E: BX = BX + &H1850
L_A772: PRINT N(BX);  ' RT3F_67; H expanded ledger
L_A775: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A778: ARGPUSH OMITTED  ' RT3E_43
L_A77B: BX = 9
L_A77E: LOCATE ARGS(), BX  ' RT3E_44
L_A781: DI = &HA5C0
L_A784: SI = &HAF0E
L_A787: FAC! = N_AF0E! + N_A5C0!  ' RT3F_7F
L_A78A: BX = CINT(FAC!)  ' RT3F_77
L_A78D: SI = BX
L_A78F: SI = SI * (2 ^ 1)
L_A791: SI = SI * (2 ^ 1)
L_A793: SI = SI + &H1850
L_A797: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_A79A: IF CompareLeft! < CompareRight! THEN GOTO L_A79F  ' flags from L_A797
L_A79C: GOTO L_A7AE
L_A79F: ' PRINT statement begins (screen) ; RT3F_BC
L_A7A2: BX = &HA642
L_A7A5: PRINT S_A642$;  ' RT3F_6A
L_A7A8: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A7AB: GOTO L_A7BA
L_A7AE: ' PRINT statement begins (screen) ; RT3F_BC
L_A7B1: BX = &HAC6A
L_A7B4: PRINT S_AC6A$;  ' RT3F_6A
L_A7B7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A7BA: ' PRINT statement begins (screen) ; RT3F_BC
L_A7BD: DI = &HA844
L_A7C0: SI = &HC3F4
L_A7C3: FAC! = N_C3F4! + N_A844!  ' RT3F_7F
L_A7C6: T_00! = FAC!  ' RT3F_71; inline=&H80
L_A7CA: BX = CINT(FAC!)  ' RT3F_77
L_A7CD: BX = BX * (2 ^ 1)
L_A7CF: BX = BX * (2 ^ 1)
L_A7D1: BX = BX + &H43F4
L_A7D5: DX = &H1E
L_A7D8: BX = TEMP_DESC(LEFT$(S(BX), DX))  ' BX receives a temporary descriptor  ' RT3D_0B
L_A7DB: PRINT S(BX);  ' RT3F_6A
L_A7DE: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A7E1: DI = &H4F6C
L_A7E4: SI = &HB438
L_A7E7: FAC! = N_B438! + N_4F6C!  ' RT3F_7F
L_A7EA: DI = SI
L_A7EC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A7EF: SI = DI
L_A7F1: DI = &HC3F8
L_A7F4: FAC! = N(SI) + N_C3F8!  ' RT3F_7F
L_A7F7: BX = SI
L_A7F9: DX = BX
L_A7FB: BX = CINT(FAC!)  ' RT3F_77
L_A7FE: DI = BX

```

### Delay and award helpers

```basic
L_A800: DI = DI * (2 ^ 1)
L_A802: DI = DI * (2 ^ 1)
L_A804: DI = DI + &H1850
L_A808: SI = &HA87C
L_A80B: N(DI) = N_A87C!  ' RT3F_7B
L_A80E: DI = &HA840
L_A811: SI = &HAF0E
L_A814: FAC! = N_AF0E! + N_A840!  ' RT3F_7F
L_A817: DI = SI
L_A819: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_A81C: SI = DX
L_A81E: DI = &HBA08
L_A821: CompareLeft! = N(SI): CompareRight! = N_BA08!  ' RT3F_9F
L_A824: IF CompareLeft! >= CompareRight! THEN GOTO L_A829  ' flags from L_A821
L_A826: GOTO L_A6AE
L_A829: RETURN
L_A82A: DI = &HB054
L_A82D: SI = &HB438
L_A830: CompareLeft! = N_B438!: CompareRight! = N_B054!  ' RT3F_9F
L_A833: BX = 0
L_A836: IF CompareLeft! <= CompareRight! THEN GOTO L_A839  ' flags from L_A830
L_A838: BX = BX - 1
L_A839: SI = &HB400
L_A83C: CompareLeft! = N_B400!: CompareRight! = 0  ' RT3F_A7
L_A83F: DX = 0
L_A842: IF CompareLeft! <> CompareRight! THEN GOTO L_A845  ' flags from L_A83C
L_A844: DX = DX - 1
L_A845: DX = DX OR BX
L_A847: CompareLeft% = DX: CompareRight% = 0
L_A849: IF CompareLeft% <> CompareRight% THEN GOTO L_A84E  ' flags from L_A847
L_A84B: GOTO L_A84F
L_A84E: RETURN
L_A84F: DI = &HAFD0
L_A852: SI = &HB44C
L_A855: CompareLeft! = N_B44C!: CompareRight! = N_AFD0!  ' RT3F_9F
L_A858: IF CompareLeft! = CompareRight! THEN GOTO L_A85D  ' flags from L_A855
L_A85A: GOTO L_A876
L_A85D: BX = &H14
L_A860: ARGPUSH BX  ' RT3E_42
L_A863: BX = &HF
L_A866: LOCATE ARGS(), BX  ' RT3E_44
L_A869: ' PRINT statement begins (screen) ; RT3F_BC
L_A86C: BX = &HC3FC
L_A86F: PRINT S_C3FC$  ' RT3F_6E; H newline item, ledger correction
L_A872: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A875: RETURN
L_A876: DI = &HAF0E
L_A879: SI = &HAFD0
L_A87C: N_AF0E! = N_AFD0!  ' RT3F_7B
L_A87F: GOTO L_A68C
L_A882: BX = &H18
L_A885: ARGPUSH BX  ' RT3E_42
L_A888: BX = &HE
L_A88B: LOCATE ARGS(), BX  ' RT3E_44
L_A88E: ' PRINT statement begins (screen) ; RT3F_BC
L_A891: BX = &HC40A
L_A894: PRINT S_C40A$;  ' RT3F_6A
L_A897: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A89A: DI = &HAE0E
L_A89D: SI = &HA860
L_A8A0: N_AE0E! = N_A860!  ' RT3F_7B
L_A8A3: GOSUB L_22C4
L_A8A6: RETURN
L_A8A7: GOSUB L_2352
L_A8AA: BX = &H12
L_A8AD: ARGPUSH BX  ' RT3E_42
L_A8B0: BX = 2
L_A8B3: LOCATE ARGS(), BX  ' RT3E_44
L_A8B6: ' PRINT statement begins (screen) ; RT3F_BC
L_A8B9: DX = BX
L_A8BB: BX = &HC41C
L_A8BE: PRINT S_C41C$;  ' RT3F_6A
L_A8C1: BX = &H19A8
L_A8C4: PRINT N_19A8!  ' RT3F_6B
L_A8C7: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A8CA: BX = &H14
L_A8CD: ARGPUSH BX  ' RT3E_42
L_A8D0: BX = DX
L_A8D2: LOCATE ARGS(), BX  ' RT3E_44
L_A8D5: ' PRINT statement begins (screen) ; RT3F_BC
L_A8D8: BX = &HC436
L_A8DB: PRINT S_C436$;  ' RT3F_6A
L_A8DE: BX = &H19B0
L_A8E1: PRINT N_19B0!  ' RT3F_6B
L_A8E4: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A8E7: BX = &H16
L_A8EA: ARGPUSH BX  ' RT3E_42
L_A8ED: BX = DX
L_A8EF: LOCATE ARGS(), BX  ' RT3E_44
L_A8F2: ' PRINT statement begins (screen) ; RT3F_BC
L_A8F5: BX = &HC450
L_A8F8: PRINT S_C450$;  ' RT3F_6A
L_A8FB: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A8FE: GOSUB L_24EB
L_A901: CompareLeft% = WORD(&HAE70): CompareRight% = 1
L_A906: IF CompareLeft% < CompareRight% THEN GOTO L_A90B  ' flags from L_A901
L_A908: GOTO L_A911
L_A90B: WORD(&HAE70) = 1
L_A911: CompareLeft% = WORD(&HAE70): CompareRight% = &H270F
L_A917: IF CompareLeft% > CompareRight% THEN GOTO L_A91C  ' flags from L_A911
L_A919: GOTO L_A922
L_A91C: WORD(&HAE70) = &H270F
L_A922: BX = WORD(&HAE70)
L_A926: FAC! = CSNG(BX)  ' RT3F_57
L_A929: DI = &H19B0
L_A92C: N_19B0! = FAC!: SI = &H001A  ' RT3F_7D
L_A92F: GOTO L_210D
L_A932: BX = &H65AE
L_A935: FAC! = CSNG(BX)  ' RT3F_57
L_A938: BX = &HC46E
L_A93B: DX = &H1A
L_A93E: BLOAD S_C46E$, N(DX)  ' RT3E_1A; H expanded ledger; N(&H001A)=FAC!
L_A941: SI = &H4F6C
L_A944: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_A947: GOTO L_AC1D
L_A94A: DI = &HA6E4
L_A94D: SI = &HA66E
L_A950: N_A6E4! = N_A66E!  ' RT3F_7B
L_A953: BX = DI
L_A955: DI = &HA6E8
L_A958: SI = &HA9FE
L_A95B: N_A6E8! = N_A9FE!  ' RT3F_7B
L_A95E: GOSUB L_0797
L_A961: DI = &H4F6C
L_A964: CompareLeft! = FAC!: CompareRight! = N_4F6C!  ' RT3F_A1
L_A967: BX = 0
L_A96A: IF CompareLeft! >= CompareRight! THEN GOTO L_A96D  ' flags from L_A964
L_A96C: BX = BX - 1
L_A96D: DI = &HA6E4
L_A970: SI = &HBCBA
L_A973: N_A6E4! = N_BCBA!  ' RT3F_7B
L_A976: DI = &HA6E8
L_A979: SI = &HA9FE
L_A97C: N_A6E8! = N_A9FE!  ' RT3F_7B
L_A97F: WORD(BP - 6) = BX
L_A982: GOSUB L_0797
L_A985: CompareLeft! = FAC!: CompareRight! = 0  ' RT3F_A9
L_A988: BX = 0
L_A98B: IF CompareLeft! <= CompareRight! THEN GOTO L_A98E  ' flags from L_A985
L_A98D: BX = BX - 1
L_A98E: BX = BX OR WORD(BP - 6)
L_A991: CompareLeft% = BX: CompareRight% = 0
L_A993: IF CompareLeft% = CompareRight% THEN GOTO L_A998  ' flags from L_A991
L_A995: GOTO L_AC14
L_A998: GOSUB L_541A
L_A99B: GOSUB L_2352
L_A99E: DI = &HA6F8
L_A9A1: SI = &HBCBA
L_A9A4: N_A6F8! = N_BCBA!  ' RT3F_7B
L_A9A7: DI = &HA6FC
L_A9AA: SI = &HA9FE
L_A9AD: N_A6FC! = N_A9FE!  ' RT3F_7B
L_A9B0: GOSUB L_07C9
L_A9B3: BX = CINT(FAC!)  ' RT3F_77
L_A9B6: DI = BX
L_A9B8: DI = DI * (2 ^ 1)
L_A9BA: DI = DI * (2 ^ 1)
L_A9BC: DI = DI + &H1850
L_A9C0: SI = &H4F6C
L_A9C3: N(DI) = N_4F6C!  ' RT3F_7B
L_A9C6: BX = &H12
L_A9C9: ARGPUSH BX  ' RT3E_42
L_A9CC: BX = 4
L_A9CF: LOCATE ARGS(), BX  ' RT3E_44
L_A9D2: ' PRINT statement begins (screen) ; RT3F_BC
L_A9D5: SI = &HA9FE
L_A9D8: BX = CINT(N_A9FE!)  ' RT3F_75
L_A9DB: BX = BX * (2 ^ 1)
L_A9DD: BX = BX * (2 ^ 1)
L_A9DF: BX = BX + &H4288
L_A9E3: PRINT S(BX);  ' RT3F_6A
L_A9E6: BX = &HC476
L_A9E9: PRINT S_C476$  ' RT3F_6E; H newline item, ledger correction
L_A9EC: ' End PRINT statement / flush (RT-specific trailing spacing retained) ; RT3E_79
L_A9EF: GOSUB L_ACA4
L_A9F2: DI = &HC496
L_A9F5: SI = &HA848
L_A9F8: N_C496! = N_A848!  ' RT3F_7B
L_A9FB: SI = &HC49A
L_A9FE: FAC! = N_C49A!: DI = &H001E  ' RT3F_6F
L_AA01: GOTO L_AA5C
L_AA04: BX = &H120
L_AA07: DX = &HC49E
L_AA0A: CX = 0
L_AA0C: AX = &HFFFF
L_AA0F: GfxX! = COORD(BX,CX): GfxY! = COORD(DX,AX): CircleFlags% = 0  ' RT3E_8D
L_AA12: BX = AX
L_AA14: PSET (GfxX!,GfxY!), BX  ' RT3E_8B; M ledger
L_AA17: SI = DX
L_AA19: DI = &HA6EC
L_AA1C: FAC! = N(SI) / N_A6EC!  ' RT3F_87
L_AA1F: SI = &HC4A2
L_AA22: FAC! = N_C4A2! - FAC!  ' RT3F_9B
L_AA25: SI = DX
L_AA27: DI = &HA5C0
L_AA2A: T_00! = FAC!  ' RT3F_71; inline=&H80
L_AA2E: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_AA31: BX = CINT(FAC!)  ' RT3F_77
L_AA34: DX = &HA87C
L_AA37: SoundFreq% = BX: SoundDuration! = N_A87C!  ' RT3E_5E
L_AA3A: BX = AX
L_AA3C: DX = AX
L_AA3E: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_AA41: BX = &H120
L_AA44: DX = &HC49E
L_AA47: CX = 0
L_AA49: AX = &HFFFF
L_AA4C: GfxX! = COORD(BX,CX): GfxY! = COORD(DX,AX): CircleFlags% = 0  ' RT3E_8D
L_AA4F: BX = AX
L_AA51: PRESET (GfxX!,GfxY!), BX  ' RT3E_8A; M ledger
L_AA54: SI = DX
L_AA56: DI = &HC496
L_AA59: FAC! = N(SI) + N_C496!  ' RT3F_7F
L_AA5C: DI = &HC49E
L_AA5F: N_C49E! = FAC!: SI = &H001A  ' RT3F_7D
L_AA62: SI = &HC496
L_AA65: CompareLeft! = N_C496!: CompareRight! = 0  ' RT3F_A7
L_AA68: IF CompareLeft! < CompareRight! THEN GOTO L_AA6D  ' flags from L_AA65
L_AA6A: GOTO L_AA7A
L_AA6D: SI = DI
L_AA6F: DI = &HC4A6
L_AA72: CompareLeft! = N(SI): CompareRight! = N_C4A6!  ' RT3F_9F
L_AA75: IF CompareLeft! >= CompareRight! THEN GOTO L_AA04  ' flags from L_AA72
L_AA77: GOTO L_AA88
L_AA7A: DI = &HC4A6
L_AA7D: SI = &HC49E
L_AA80: CompareLeft! = N_C49E!: CompareRight! = N_C4A6!  ' RT3F_9F
L_AA83: IF CompareLeft! > CompareRight! THEN GOTO L_AA88  ' flags from L_AA80
L_AA85: GOTO L_AA04
L_AA88: BX = &H11D
L_AA8B: DX = &H45
L_AA8E: CX = 0
L_AA90: AX = CX
L_AA92: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AA95: BX = &H65AE
L_AA98: DX = 4
L_AA9B: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AA9E: GOSUB L_AC43
L_AAA1: BX = &HF7
L_AAA4: DX = &H36
L_AAA7: CX = 0
L_AAA9: AX = CX
L_AAAB: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AAAE: BX = &H65C4
L_AAB1: DX = 3
L_AAB4: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AAB7: GOSUB L_AC43
L_AABA: BX = &HF0
L_AABD: DX = &H2D
L_AAC0: CX = 0
L_AAC2: AX = CX
L_AAC4: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AAC7: BX = &H675E
L_AACA: DX = 3
L_AACD: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AAD0: GOSUB L_AC43
L_AAD3: BX = &HED
L_AAD6: DX = &H23
L_AAD9: CX = 0
L_AADB: AX = CX
L_AADD: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AAE0: BX = &H6A60
L_AAE3: DX = 3
L_AAE6: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AAE9: GOSUB L_AC43
L_AAEC: BX = &H101
L_AAEF: DX = &H20
L_AAF2: CX = 0
L_AAF4: AX = CX
L_AAF6: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AAF9: BX = &H6FBC
L_AAFC: DX = 3
L_AAFF: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AB02: GOSUB L_AC43
L_AB05: BX = &HE8
L_AB08: DX = &H20
L_AB0B: CX = 0
L_AB0D: AX = CX
L_AB0F: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AB12: BX = &H7420
L_AB15: DX = 3
L_AB18: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AB1B: GOSUB L_AC43
L_AB1E: BX = &HE8
L_AB21: DX = &H20
L_AB24: CX = 0
L_AB26: AX = CX
L_AB28: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AB2B: BX = &H76AC
L_AB2E: DX = 3
L_AB31: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AB34: GOSUB L_AC43
L_AB37: BX = &HE8
L_AB3A: DX = &H20
L_AB3D: CX = 0
L_AB3F: AX = CX
L_AB41: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AB44: BX = &H7CF0
L_AB47: DX = 3
L_AB4A: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AB4D: GOSUB L_AC43
L_AB50: BX = &HE8
L_AB53: DX = &H20
L_AB56: CX = 0
L_AB58: AX = CX
L_AB5A: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AB5D: BX = &H8320
L_AB60: DX = 3
L_AB63: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AB66: GOSUB L_AC43
L_AB69: BX = &HE8
L_AB6C: DX = &H20
L_AB6F: CX = 0
L_AB71: AX = CX
L_AB73: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AB76: BX = &H8964
L_AB79: DX = 3
L_AB7C: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AB7F: GOSUB L_AC43
L_AB82: BX = &HE8
L_AB85: DX = &H20
L_AB88: CX = 0
L_AB8A: AX = CX
L_AB8C: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_AB8F: BX = &H8F1C
L_AB92: DX = 3
L_AB95: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AB98: GOSUB L_AC43
L_AB9B: GOSUB L_541A
L_AB9E: GOSUB L_AC86
L_ABA1: GOSUB L_AC86
L_ABA4: BX = &HF4
L_ABA7: DX = &H21
L_ABAA: CX = 0
L_ABAC: AX = CX
L_ABAE: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_ABB1: BX = &H94E8
L_ABB4: DX = 4
L_ABB7: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_ABBA: GOSUB L_AC86
L_ABBD: BX = &HF4
L_ABC0: DX = &H23
L_ABC3: CX = 0
L_ABC5: AX = CX
L_ABC7: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_ABCA: BX = &H9906
L_ABCD: DX = 3
L_ABD0: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_ABD3: GOSUB L_AC86
L_ABD6: BX = &HF4
L_ABD9: DX = &H21
L_ABDC: CX = 0
L_ABDE: AX = CX
L_ABE0: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_ABE3: BX = &H9CFA
L_ABE6: DX = 3
L_ABE9: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_ABEC: GOSUB L_AC86
L_ABEF: BX = &HF6
L_ABF2: DX = &H21
L_ABF5: CX = 0
L_ABF7: AX = CX
L_ABF9: PutX! = COORD(BX,CX): PutY! = COORD(DX,AX)  ' RT3E_89; H coordinate flags: -1 pointer, 0 integer
L_ABFC: BX = &HA0B4
L_ABFF: DX = 3

```

### Final calculations and timer

```basic
L_AC02: PUT (PutX!, PutY!), MEMORY(BX), ACTION(DX)  ' RT3E_58; H ABI; action enumeration M, DH selects far-array descriptor
L_AC05: BX = &H16
L_AC08: ARGPUSH BX  ' RT3E_42
L_AC0B: BX = &HD
L_AC0E: LOCATE ARGS(), BX  ' RT3E_44
L_AC11: GOSUB L_20DD
L_AC14: DI = &H4F6C
L_AC17: SI = &HA9FE
L_AC1A: FAC! = N_A9FE! + N_4F6C!  ' RT3F_7F
L_AC1D: DI = &HA9FE
L_AC20: N_A9FE! = FAC!: SI = &H001A  ' RT3F_7D
L_AC23: SI = DI
L_AC25: DI = &HA5CC
L_AC28: CompareLeft! = N_A9FE!: CompareRight! = N_A5CC!  ' RT3F_9F
L_AC2B: IF CompareLeft! > CompareRight! THEN GOTO L_AC30  ' flags from L_AC28
L_AC2D: GOTO L_A94A
L_AC30: BX = &H491C
L_AC33: BX = TEMP_DESC(VARPTR$(S_491C$))  ' RT3F_18
L_AC36: AX = &HC350
L_AC39: BX = TEMP_DESC(S_C350$ + S(BX))  ' BX receives a temporary descriptor  ' RT3F_55
L_AC3C: PLAY S(BX)  ' RT3E_51
L_AC3F: GOSUB L_1EFD
L_AC42: RETURN
L_AC43: SI = &H4F6C
L_AC46: FAC! = N_4F6C!: DI = &H001E  ' RT3F_6F
L_AC49: GOTO L_AC75
L_AC4C: FAC! = RND  ' RT3D_34
L_AC4F: DI = &HC4AA
L_AC52: FAC! = FAC! * N_C4AA!  ' RT3F_91
L_AC55: DI = &HC4AE
L_AC58: FAC! = FAC! + N_C4AE!  ' RT3F_81
L_AC5B: BX = CINT(FAC!)  ' RT3F_77
L_AC5E: DX = &HC4B2
L_AC61: SoundFreq% = BX: SoundDuration! = N_C4B2!  ' RT3E_5E
L_AC64: BX = &HFFFF
L_AC67: DX = BX
L_AC69: SOUND SoundFreq%, SoundDuration!, DX, BX  ' RT3E_5F
L_AC6C: DI = &H4F6C
L_AC6F: SI = &HC25C
L_AC72: FAC! = N_C25C! + N_4F6C!  ' RT3F_7F
L_AC75: DI = &HC25C
L_AC78: N_C25C! = FAC!: SI = &H001A  ' RT3F_7D
L_AC7B: SI = DI
L_AC7D: DI = &HA5CC
L_AC80: CompareLeft! = N_C25C!: CompareRight! = N_A5CC!  ' RT3F_9F
L_AC83: IF CompareLeft! <= CompareRight! THEN GOTO L_AC4C  ' flags from L_AC80
L_AC85: RETURN
L_AC86: FAC! = TIMER  ' RT3D_43
L_AC89: DI = &HC4B6
L_AC8C: N_C4B6! = FAC!: SI = &H001A  ' RT3F_7D
L_AC8F: FAC! = TIMER  ' RT3D_43
L_AC92: SI = &HC4B6
L_AC95: FAC! = N_C4B6! - FAC!  ' RT3F_9B
L_AC98: FAC! = ABS(FAC!)  ' RT3F_2D
L_AC9B: DI = &HC4BA
L_AC9E: CompareLeft! = FAC!: CompareRight! = N_C4BA!  ' RT3F_A1
L_ACA1: IF CompareLeft! < CompareRight! THEN GOTO L_AC8F  ' flags from L_AC9E
L_ACA3: RETURN
L_ACA4: FAC! = TIMER  ' RT3D_43
L_ACA7: DI = &HC4B6
L_ACAA: N_C4B6! = FAC!: SI = &H001A  ' RT3F_7D
L_ACAD: FAC! = TIMER  ' RT3D_43
L_ACB0: SI = &HC4B6
L_ACB3: FAC! = N_C4B6! - FAC!  ' RT3F_9B
L_ACB6: FAC! = ABS(FAC!)  ' RT3F_2D
L_ACB9: DI = &H4F94
L_ACBC: CompareLeft! = FAC!: CompareRight! = N_4F94!  ' RT3F_A1
L_ACBF: IF CompareLeft! < CompareRight! THEN GOTO L_ACAD  ' flags from L_ACBC
L_ACC1: RETURN
L_ACC2: IF ERROR_ACTIVE THEN ERROR 19 ELSE END  ' RT3E_02

```

### Unclassified trailing bytes

```basic
L_ACC5: ' Unclassified bytes after logical code end (not decoded as game logic): be 84 a9 cd 3f 7b e8 e0 5d bb 1a

```

## Inline dispatch evidence

The ON statements above use listing labels; these raw payloads preserve the CS-offset source words and allow independent checking of the &H0010 conversion and post-table return address.

| Call | Runtime | Payload bytes (after opcode) | Position after payload |
|---|---|---|---|
| L_227D | RT3F_5E | `1a 2c 54 c0 37 a3 2b 6d 66 f1 7b 86 23 97 9a 05 75 ec 83 4a 22 35 9f 8c 9d 33 6e 4a 22 4a 22 4a 22 4a 22 4a 22 4a 22 97 a8 4a 22 4a 22 4a 22 4a 22 4a 22 4a 22` | L_22B5 |
| L_2C72 | RT3F_5E | `05 76 2c f7 2e 13 32 f3 34 79 79` | L_2C80 |
| L_386A | RT3F_5E | `03 64 38 61 47 88 51` | L_3874 |
| L_3949 | RT3F_5E | `06 49 39 15 3f 80 41 03 43 5a 44 e0 45` | L_3959 |
| L_482C | RT3F_5E | `06 2c 48 98 4a 6c 4c ee 4d f1 4e f4 4f` | L_483C |
| L_54CD | RT3F_5E | `03 6e 55 c7 54 6f 62` | L_54D7 |
| L_6971 | RT3F_5E | `04 1f 69 1f 69 b2 69 6d 69` | L_697D |
| L_6EEB | RT3F_5E | `04 e7 6e 48 70 d0 71 ec 72` | L_6EF7 |
| L_7D34 | RT3F_5E | `04 ca 83 30 7d cf 7d d5 7d` | L_7D40 |
| L_84A0 | RT3F_5E | `05 37 8d 9e 84 9d 91 98 98 82 99` | L_84AE |
| L_A25F | RT3F_5D | `09 22 a3 3a a3 52 a3 6a a3 82 a3 9a a3 b2 a3 ca a3 e2 a3` | L_A275 |

Recovered coverage: 15824 instruction/data records, 5374 runtime sites, 108 distinct runtime IDs, 0 unresolved sites in 0 IDs. Every byte 0040..ACCF is accounted for as an instruction, inline payload or explicitly unclassified tail bytes; every explicit branch and mapped dispatch destination is an instruction boundary. Inline payloads: 127 sites. Structural checks validate unique labels, branch/table boundaries, runtime provenance and exact unresolved-call inventory. No DOSBox behavior or independent semantic verification is claimed.

## Unknowns

Counts are static call sites in 0040..ACCF, excluding the unclassified tail; no runtime loop multiplier. The corrected byte walk is authoritative for these counts, rather than the original listing footer. Every unresolved call below retains all six live register arguments plus any inline payload in the transcription.

| Runtime | Count | First offsets (all sites in transcription) |
|---|---:|---|
| None | 0 | All 108 runtime identities rendered from the expanded ledger |

No runtime-call identities remain unresolved after applying the current ledger. This is not a decode-gate claim. Remaining unknowns include runtime clobbers not fully modeled by this semantic transcription; exact array bounds/record-field meanings and DATA-to-array mappings; personnel/item/ship/mission field identities; units and interpretation of transaction/progression formulas beyond their named arithmetic; complete bounds/error behavior for statements; M-confidence PUT action enumeration, exponentiation and SPC details; and the unclassified tail at ACC5..ACCF. Numeric formulas are preserved rather than assigned unsupported gameplay names.

## Variables

Address identities are H. Names remain address-based unless a literal directly identifies their content. MBF operand types are H where a known numeric runtime consumes them; string identities are H from the literal table, with PRINT typing H from the updated ledger. Multiple roles at one address are retained rather than silently reconciled.

| DS address | Type | Draft name | Evidence |
|---|---|---|---|
| &H001A | MBF single | N_001A! | 07C2; 07E1; 0800; 0E80; 107A … |
| &H1890 | MBF single | N_1890! | 0976 |
| &H1894 | MBF single | N_1894! | 4ED7; 9173; 97B9 |
| &H1898 | MBF single | N_1898! | 4FDA; 9124 |
| &H189C | MBF single | N_189C! | 2BAF |
| &H18A0 | MBF single | N_18A0! | 2A16 |
| &H18A4 | MBF single | N_18A4! | 2A36 |
| &H18A8 | MBF single | N_18A8! | 2A55 |
| &H18C0 | MBF single | N_18C0! | 2B6C |
| &H18C4 | MBF single | N_18C4! | 2B0F; 8DCD |
| &H18FC | MBF single | N_18FC! | 08B0; 239C; 2AFA; 3506; 35D9 … |
| &H1900 | MBF single | N_1900! | 0D95; 2B24; 97ED |
| &H1904 | MBF single | N_1904! | 0D8C; 2A9C; 8E06; 9824 |
| &H1908 | MBF single | N_1908! | 0D83; 2AAF; 8EAA; 9839 |
| &H1910 | MBF single | N_1910! | 8E3C; 9819 |
| &H1918 | MBF single | N_1918! | 8E72; 9831 |
| &H191C | MBF single | N_191C! | 2AEA; 8F5E |
| &H1920 | MBF single | N_1920! | 08A7; 23E3; 2B59 |
| &H1924 | MBF single | N_1924! | 0DA7; 2B44; 96CE |
| &H192C | MBF single | N_192C! | 0D9E; 2AD5; 37B8; 504A; 50C2 … |
| &H1940 | MBF single | N_1940! | 093D; 35FE; 4F04; 4FBE; 9140 |
| &H1944 | MBF single | N_1944! | 4FD1; 9146 |
| &H1948 | MBF single | N_1948! | 4FEC |
| &H194C | MBF single | N_194C! | 0948; 362B; 4E01; 4EBB; 918F … |
| &H1950 | MBF single | N_1950! | 4ECE; 9195 |
| &H1954 | MBF single | N_1954! | 4EE9 |
| &H1964 | MBF single | N_1964! | 0950 |
| &H1970 | MBF single | N_1970! | 0959 |
| &H1988 | MBF single | N_1988! | 07EE; 1069; 1E9E; 1EE0; 1EE7 |
| &H198C | MBF single | N_198C! | 07F4; 1EA4; 1EF9 |
| &H1998 | MBF single | N_1998! | 8FB8; 98A4; 9E35 |
| &H19A4 | MBF single | N_19A4! | 0093; 00AA |
| &H19A8 | MBF single | N_19A8! | 00CB; A8C4 |
| &H19B0 | MBF single | N_19B0! | 00BE; 1E50; A8E1; A92C |
| &H19B4 | MBF single | N_19B4! | 0055 |
| &H19C4 | MBF single | N_19C4! | 1071; 24A4 |
| &H1A04 | MBF single | N_1A04! | 105E |
| &H1A08 | MBF single | N_1A08! | 0C6B |
| &H1A14 | MBF single | N_1A14! | 0C71 |
| &H1A20 | MBF single | N_1A20! | 0C77 |
| &H1A2C | MBF single | N_1A2C! | 0C7D |
| &H1AC8 | MBF single | N_1AC8! | 1055 |
| &H1AD8 | MBF single | N_1AD8! | 0F43 |
| &H1B44 | MBF single | N_1B44! | 0F49 |
| &H1D2C | MBF single | N_1D2C! | 0F3A; 178A; 17B4; 1816 |
| &H1D30 | MBF single | N_1D30! | 1BE1 |
| &H1D38 | MBF single | N_1D38! | 0F31; 177C; 178A; 1844 |
| &H1DA0 | MBF single | N_1DA0! | 097E |
| &H1E14 | MBF single | N_1E14! | 0987 |
| &H1E90 | MBF single | N_1E90! | 0990 |
| &H201C | MBF single | N_201C! | 0998 |
| &H2318 | MBF single | N_2318! | 0962 |
| &H23A4 | MBF single | N_23A4! | 096B |
| &H24D0 | MBF single | N_24D0! | 08B9 |
| &H24DC | MBF single | N_24DC! | 08C2 |
| &H24F4 | MBF single | N_24F4! | 08CB |
| &H2500 | MBF single | N_2500! | 08D4 |
| &H250C | MBF single | N_250C! | 08DD |
| &H2524 | MBF single | N_2524! | 08E6 |
| &H2958 | MBF single | N_2958! | 08EF |
| &H2980 | MBF single | N_2980! | 08F8 |
| &H2984 | MBF single | N_2984! | 0901 |
| &H2E18 | MBF single | N_2E18! | 0919 |
| &H2E20 | MBF single | N_2E20! | 0922 |
| &H2E24 | MBF single | N_2E24! | 090A |
| &H2E2C | MBF single | N_2E2C! | 0913 |
| &H3150 | MBF single | N_3150! | 0A10 |
| &H3AB0 | MBF single | N_3AB0! | 23E3; 2AB8; 9DF7 |
| &H3AB8 | MBF single | N_3AB8! | 0DFB; 10D5; 19A6; 1BCF; 22BB … |
| &H3AC0 | MBF single | N_3AC0! | 0E04; 10ED; 19B8; 1BD8; 9EE8 |
| &H3ACC | MBF single | N_3ACC! | 19A6; 1BCF |
| &H3AD4 | MBF single | N_3AD4! | 19B2; 1BD8 |
| &H3AD8 | MBF single | N_3AD8! | 10D5 |
| &H3AE0 | MBF single | N_3AE0! | 10E5 |
| &H3AE8 | MBF single | N_3AE8! | 0106 |
| &H3B1C | MBF single | N_3B1C! | 9ED5 |
| &H3B40 | MBF single | N_3B40! | 10CC; 76C2 |
| &H3B50 | MBF single | N_3B50! | 10C3; 76B9 |
| &H3BA4 | MBF single | N_3BA4! | 10C3; 76B9 |
| &H3BA8 | MBF single | N_3BA8! | 10CC; 76C2 |
| &H3BB0 | MBF single | N_3BB0! | 7797 |
| &H3BB4 | MBF single | N_3BB4! | 9AAA; 9CCC; 9CDB |
| &H3C40 | MBF single | N_3C40! | 092B |
| &H40E4 | MBF single | N_40E4! | 0934 |
| &H4870 | string descriptor | S_4870$ | 5E47 |
| &H4874 | string descriptor | S_4874$ | 5FA2 |
| &H4878 | string descriptor | S_4878$ | 5FDD |
| &H4880 | string descriptor | S_4880$ | 5E82 |
| &H488C | string descriptor | S_488C$ | 23B4; 53F0; 8D93; 9D18; 9F59 … |
| &H4896 | string descriptor | S_4896$ | MODULE_CONSTANTS literal 'MNT150O2F6F16F6B-3B-2B-8>C8<B-8>C8D3F3 O2F6F16F6B-3B-2>C10D8F10B-8A-2P8 O2F6F16F6B-2B-8>C8<F8>C8D3D3 O2>F6D16<B-6G3>E-4C8<B-8A3B-1'; 0046 |
| &H491C | string descriptor | S_491C$ | 0046; 9FDE; AC33 |
| &H4920 | string descriptor | S_4920$ | MODULE_CONSTANTS literal 'MF'; 004C |
| &H4F6C | MBF single | N_4F6C! | 0055; 0093; 00E9; 016C; 018B … |
| &H4F6C | MBF single constant | N_4F6C! | MODULE_CONSTANTS = 1 |
| &H4F70 | string descriptor | S_4F70$ | 0078; 87A9; 8962 |
| &H4F74 | string descriptor | S_4F74$ | 0081; 8DFE; 8EA4 |
| &H4F78 | string descriptor | S_4F78$ | 008A; 00B8; 00DA; 0209; 108C … |
| &H4F7C | string descriptor | S_4F7C$ | MODULE_CONSTANTS literal '##'; 0078 |
| &H4F82 | string descriptor | S_4F82$ | MODULE_CONSTANTS literal '###'; 0081 |
| &H4F8A | string descriptor | S_4F8A$ | MODULE_CONSTANTS literal ''; 008A; 1FB7; 20F7; 22D2 … |
| &H4F8E | string descriptor | S_4F8E$ | MODULE_CONSTANTS literal 'A:'; 009E |
| &H4F94 | MBF single | N_4F94! | 00AA; 0405; 08E6; 093D; 0950 … |
| &H4F94 | MBF single constant | N_4F94! | MODULE_CONSTANTS = 2 |
| &H4F98 | string descriptor | S_4F98$ | MODULE_CONSTANTS literal 'B:'; 00B8 |
| &HA4C4 | string descriptor | S_A4C4$ | MODULE_CONSTANTS literal 'SHIPPICS.BAS'; 00DA |
| &HA4D4 | string descriptor | S_A4D4$ | MODULE_CONSTANTS literal 'CHARINFO'; 00FD |
| &HA4E0 | MBF single | N_A4E0! | 00E9; 0215; 086D |
| &HA4E4 | MBF single | N_A4E4! | 0106; 0781; 1C6C |
| &HA4E8 | string descriptor | S_A4E8$ | 010F |
| &HA4EC | string descriptor | S_A4EC$ | 0118 |
| &HA4F0 | string descriptor | S_A4F0$ | 0121 |
| &HA4F4 | string descriptor | S_A4F4$ | MODULE_CONSTANTS literal 'Dead'; 010F |
| &HA4FC | string descriptor | S_A4FC$ | MODULE_CONSTANTS literal 'Okay'; 0118 |
| &HA504 | string descriptor | S_A504$ | MODULE_CONSTANTS literal 'Rad'; 0121 |
| &HA590 | string descriptor | S_A590$ | 0185 |
| &HA594 | string descriptor | S_A594$ | 012A |
| &HA598 | string descriptor | S_A598$ | 0133 |
| &HA5B4 | string descriptor | S_A5B4$ | MODULE_CONSTANTS literal 'P'; 012A |
| &HA5BA | string descriptor | S_A5BA$ | MODULE_CONSTANTS literal 'C'; 0133 |
| &HA5C0 | MBF single | N_A5C0! | 0139; 033F; 050D; 08CB; 090A … |
| &HA5C0 | MBF single constant | N_A5C0! | MODULE_CONSTANTS = 3 |
| &HA5C4 | MBF single | N_A5C4! | 0147; 0157; 0172; 017A; 0199 … |
| &HA5C8 | MBF single | N_A5C8! | 0157; 42E0 |
| &HA5C8 | MBF single constant | N_A5C8! | MODULE_CONSTANTS = 46 |
| &HA5CC | MBF single | N_A5CC! | 017A; 02FD; 0743; 08D4; 0901 … |
| &HA5CC | MBF single constant | N_A5CC! | MODULE_CONSTANTS = 8 |
| &HA5D0 | string descriptor | S_A5D0$ | MODULE_CONSTANTS literal 'SH'; 0185 |
| &HA5EE | MBF single | N_A5EE! | 01B8; 096B; 097E; 27A0; 3EA0 … |
| &HA5EE | MBF single constant | N_A5EE! | MODULE_CONSTANTS = 11 |
| &HA5F2 | string descriptor | S_A5F2$ | 01C4 |
| &HA5F6 | string descriptor | S_A5F6$ | 01CD |
| &HA5FA | string descriptor | S_A5FA$ | 01D6 |
| &HA5FE | string descriptor | S_A5FE$ | 01DF |
| &HA602 | string descriptor | S_A602$ | MODULE_CONSTANTS literal 'Marine'; 01C4 |
| &HA60C | string descriptor | S_A60C$ | MODULE_CONSTANTS literal 'Pilot'; 01CD |
| &HA616 | string descriptor | S_A616$ | MODULE_CONSTANTS literal 'Soldier'; 01D6 |
| &HA622 | string descriptor | S_A622$ | MODULE_CONSTANTS literal 'Esper'; 01DF |
| &HA630 | string descriptor | S_A630$ | 01E8 |
| &HA634 | string descriptor | S_A634$ | 01F1 |
| &HA638 | string descriptor | S_A638$ | 01FA |
| &HA63C | string descriptor | S_A63C$ | MODULE_CONSTANTS literal '-'; 01E8; 3325; 599A; 5BC1 … |
| &HA642 | string descriptor | S_A642$ | MODULE_CONSTANTS literal '*'; 01F1; A183; A518; A7A5 |
| &HA648 | string descriptor | S_A648$ | MODULE_CONSTANTS literal '#'; 01FA; 8F8B; 8FB2 |
| &HA64E | string descriptor | S_A64E$ | MODULE_CONSTANTS literal 'INFO.BAS'; 0209 |
| &HA65A | string descriptor | S_A65A$ | MODULE_CONSTANTS literal 'LOGO'; 0229 |
| &HA662 | string descriptor | S_A662$ | MODULE_CONSTANTS literal 'NAME'; 0239 |
| &HA66A | MBF single | N_A66A! | 0279; 0B67; 0CE6; 0DBA; 1AC8 … |
| &HA66A | MBF single constant | N_A66A! | MODULE_CONSTANTS = 13 |
| &HA66E | MBF single | N_A66E! | 0281; 02C3; 0305; 0347; 0389 … |
| &HA66E | MBF single constant | N_A66E! | MODULE_CONSTANTS = 0 |
| &HA672 | MBF single | N_A672! | 02BB; 054F; 0C02; 0DA7; 28AA … |
| &HA672 | MBF single constant | N_A672! | MODULE_CONSTANTS = 15 |
| &HA676 | MBF single | N_A676! | 0381; 03C3; 26EC; 3D40; 3FDB … |
| &HA676 | MBF single constant | N_A676! | MODULE_CONSTANTS = 4 |
| &HA67A | MBF single | N_A67A! | 0447; 48CD |
| &HA67A | MBF single constant | N_A67A! | MODULE_CONSTANTS = 24 |
| &HA67E | MBF single | N_A67E! | 0489; 3C1A |
| &HA67E | MBF single constant | N_A67E! | MODULE_CONSTANTS = 53 |
| &HA682 | MBF single | N_A682! | 04CB; 0913; 0919; 0B25; 0B51 … |
| &HA682 | MBF single constant | N_A682! | MODULE_CONSTANTS = 5 |
| &HA686 | MBF single | N_A686! | 0591; 0B3B; 0D0A; 0F3A; 1513 … |
| &HA686 | MBF single constant | N_A686! | MODULE_CONSTANTS = 10 |
| &HA68A | MBF single | N_A68A! | 05D3; 2026; 2E9C; 321A; 32CB … |
| &HA68A | MBF single constant | N_A68A! | MODULE_CONSTANTS = 99 |
| &HA68E | MBF single | N_A68E! | 0615; 0836; 0B44; 0B9A; 180B … |
| &HA68E | MBF single constant | N_A68E! | MODULE_CONSTANTS = 49 |
| &HA692 | MBF single | N_A692! | 0657; 0699; 0B0D; 0E2C; 0EC6 … |
| &HA692 | MBF single constant | N_A692! | MODULE_CONSTANTS = 22 |
| &HA696 | MBF single | N_A696! | 06DB; 09EC; 0CBD; 2783; 2BA4 … |
| &HA696 | MBF single constant | N_A696! | MODULE_CONSTANTS = 6 |
| &HA69A | string descriptor | S_A69A$ | MODULE_CONSTANTS literal 'CHARNAME'; 06F3 |
| &HA6A6 | string descriptor | S_A6A6$ | 0754 |
| &HA6AA | string descriptor | S_A6AA$ | 075D |
| &HA6AE | string descriptor | S_A6AE$ | 0766 |
| &HA6B2 | MBF single | N_A6B2! | 076F |
| &HA6B6 | MBF single | N_A6B6! | 0775 |
| &HA6BA | MBF single | N_A6BA! | 077B |
| &HA6BE | string descriptor | S_A6BE$ | MODULE_CONSTANTS literal 'EARTH'; 0754 |
| &HA6C8 | string descriptor | S_A6C8$ | MODULE_CONSTANTS literal 'SOLONOR'; 075D |
| &HA6D4 | MBF single | N_A6D4! | 0791; 3C8C; 4058; 4364; 44BB … |
| &HA6D8 | string descriptor | S_A6D8$ | MODULE_CONSTANTS literal 'LUNA'; 0766 |
| &HA6E0 | MBF single | N_A6E0! | 076F; 0775; 077B; 1E50 |
| &HA6E0 | MBF single constant | N_A6E0! | MODULE_CONSTANTS = 1.2 |
| &HA6E4 | MBF single | N_A6E4! | 07A3; 0C29; 1116; 1135; 1187 … |
| &HA6E8 | MBF single | N_A6E8! | 079D; 0C32; 1121; 1140; 1190 … |
| &HA6EC | MBF single | N_A6EC! | 079D; 07CF; 0BF4; 0D9E; 11DF … |
| &HA6EC | MBF single constant | N_A6EC! | MODULE_CONSTANTS = 100 |
| &HA6F0 | MBF single | N_A6F0! | 07A9 |
| &HA6F0 | MBF single constant | N_A6F0! | MODULE_CONSTANTS = 1300 |
| &HA6F4 | MBF single | N_A6F4! | 07BC; 7410; 8155; 836F; 9844 |
| &HA6F4 | MBF single constant | N_A6F4! | MODULE_CONSTANTS = 0.1 |
| &HA6F8 | MBF single | N_A6F8! | 07D5; 09B4; 0A22; 0A5C; 0A8A … |
| &HA6FC | MBF single | N_A6FC! | 07CF; 09BF; 0A2D; 0A67; 0A93 … |
| &HA700 | MBF single | N_A700! | 07DB |
| &HA700 | MBF single constant | N_A700! | MODULE_CONSTANTS = 1300.5 |
| &HA704 | MBF single | N_A704! | 2EC0; 2EF1; 3C9D; 4069; 417A … |
| &HA708 | MBF single | N_A708! | 07EE; 1E9E; 1EC8; 7221 |
| &HA708 | MBF single constant | N_A708! | MODULE_CONSTANTS = 30000 |
| &HA70C | MBF single | N_A70C! | 07FA; 168B; 23BD; 246C; 27D9 … |
| &HA70C | MBF single constant | N_A70C! | MODULE_CONSTANTS = 0.5 |
| &HA710 | string descriptor | S_A710$ | 0841 |
| &HA714 | string descriptor | S_A714$ | 084A |
| &HA718 | string descriptor | S_A718$ | 0853 |
| &HA71C | string descriptor | S_A71C$ | 085C |
| &HA720 | string descriptor | S_A720$ | 0865 |
| &HA7F0 | string descriptor | S_A7F0$ | MODULE_CONSTANTS literal 'first'; 0841 |
| &HA7FA | string descriptor | S_A7FA$ | MODULE_CONSTANTS literal 'second'; 084A |
| &HA804 | string descriptor | S_A804$ | MODULE_CONSTANTS literal 'third'; 0853 |
| &HA80E | string descriptor | S_A80E$ | MODULE_CONSTANTS literal 'sixth'; 085C |
| &HA818 | string descriptor | S_A818$ | MODULE_CONSTANTS literal 'seventh'; 0865 |
| &HA824 | string descriptor | S_A824$ | MODULE_CONSTANTS literal 'Change things? '; 088A |
| &HA838 | MBF single | N_A838! | 0896; 28EC; 291A; 2988; 35CB … |
| &HA83C | MBF single | N_A83C! | 08A7; 323E; 6CF0; 91D4 |
| &HA83C | MBF single constant | N_A83C! | MODULE_CONSTANTS = 400 |
| &HA840 | MBF single | N_A840! | 08B9; 0962; 0A48; 0CA9; 284C … |
| &HA840 | MBF single constant | N_A840! | MODULE_CONSTANTS = 12 |
| &HA844 | MBF single | N_A844! | 08C2; 109C; 1263; 2CC5; 2D69 … |
| &HA844 | MBF single constant | N_A844! | MODULE_CONSTANTS = -1 |
| &HA848 | MBF single | N_A848! | 08DD; 3C26; 6C5B; A9F8 |
| &HA848 | MBF single constant | N_A848! | MODULE_CONSTANTS = -2 |
| &HA84C | MBF single | N_A84C! | 08EF |
| &HA84C | MBF single constant | N_A84C! | MODULE_CONSTANTS = 21 |
| &HA850 | MBF single | N_A850! | 0922; 0BB9; 0F73; 30E3; 315A … |
| &HA850 | MBF single constant | N_A850! | MODULE_CONSTANTS = 7 |
| &HA854 | MBF single | N_A854! | 0934; 0C86; 0CB2; 0CD3; 1697 … |
| &HA854 | MBF single constant | N_A854! | MODULE_CONSTANTS = 9 |
| &HA858 | MBF single | N_A858! | 09B4; 09DE; 09E4; 09EC; 123C … |
| &HA85C | MBF single | N_A85C! | 09D5; 17A6; 5735; 5795; 59EB … |
| &HA85C | MBF single constant | N_A85C! | MODULE_CONSTANTS = 50 |
| &HA860 | MBF single | N_A860! | 0A10; 6D01; 6D1A; 7ADB; A8A0 |
| &HA860 | MBF single constant | N_A860! | MODULE_CONSTANTS = 0 |
| &HA864 | MBF single | N_A864! | 0A22; 1A0C; 1B29; 593B; 612F … |
| &HA864 | MBF single constant | N_A864! | MODULE_CONSTANTS = 34 |
| &HA868 | MBF single | N_A868! | 0A5C; 0D5B; 41E0; 529D; 5604 … |
| &HA868 | MBF single constant | N_A868! | MODULE_CONSTANTS = 35 |
| &HA86C | MBF single | N_A86C! | 0A8A; 1335; 590F; 6578; 659C … |
| &HA86C | MBF single constant | N_A86C! | MODULE_CONSTANTS = 31 |
| &HA870 | MBF single | N_A870! | 0B18; 0B70; 204A; 25D1; 4547 … |
| &HA870 | MBF single constant | N_A870! | MODULE_CONSTANTS = 48 |
| &HA874 | MBF single | N_A874! | 0B7B; 2870; 2988; 395F; 3965 … |
| &HA874 | MBF single constant | N_A874! | MODULE_CONSTANTS = 0 |
| &HA878 | MBF single | N_A878! | 0BA3 |
| &HA878 | MBF single constant | N_A878! | MODULE_CONSTANTS = 0 |
| &HA87C | MBF single | N_A87C! | 1763; 24BF; 8109; 8ABC; A80B … |
| &HA884 | MBF single | N_A884! | 1B48; 93EF; 9481; 9513 |
| &HA97C | MBF single | N_A97C! | 0BCC; 0C29; 26AC; 32FB; 3368 … |
| &HA97C | MBF single constant | N_A97C! | MODULE_CONSTANTS = 16 |
| &HA980 | MBF single | N_A980! | 0D52 |
| &HA980 | MBF single constant | N_A980! | MODULE_CONSTANTS = 70 |
| &HA984 | MBF single | N_A984! | 0D7A; 188E; 5DD4; 5DFA; 5E56 … |
| &HA984 | MBF single constant | N_A984! | MODULE_CONSTANTS = 0 |
| &HA988 | MBF single | N_A988! | 0D83; 6043; 82B3 |
| &HA988 | MBF single constant | N_A988! | MODULE_CONSTANTS = 300 |
| &HA98C | MBF single | N_A98C! | 0D8C; 1535 |
| &HA98C | MBF single constant | N_A98C! | MODULE_CONSTANTS = 200 |
| &HA990 | MBF single | N_A990! | 0DFB |
| &HA990 | MBF single constant | N_A990! | MODULE_CONSTANTS = 72 |
| &HA994 | MBF single | N_A994! | 0E04 |
| &HA994 | MBF single constant | N_A994! | MODULE_CONSTANTS = 123 |
| &HA998 | MBF single | N_A998! | 0E0A; 184A |
| &HA998 | MBF single constant | N_A998! | MODULE_CONSTANTS = 320 |
| &HA99C | MBF single | N_A99C! | 0E47; 18A4 |
| &HA99C | MBF single constant | N_A99C! | MODULE_CONSTANTS = 329 |
| &HA9A0 | MBF single | N_A9A0! | 0E4F |
| &HA9A0 | MBF single constant | N_A9A0! | MODULE_CONSTANTS = 330 |
| &HA9A4 | MBF single | N_A9A4! | 0E72; 0F31; 1624; 28A4; 8A4E |
| &HA9A4 | MBF single constant | N_A9A4! | MODULE_CONSTANTS = 20 |
| &HA9A8 | MBF single | N_A9A8! | 0E78; 3109 |
| &HA9A8 | MBF single constant | N_A9A8! | MODULE_CONSTANTS = -10 |
| &HA9AC | MBF single | N_A9AC! | 0E9B |
| &HA9AC | MBF single constant | N_A9AC! | MODULE_CONSTANTS = 339 |
| &HA9B0 | MBF single | N_A9B0! | 0EA3; 1655 |
| &HA9B0 | MBF single constant | N_A9B0! | MODULE_CONSTANTS = 210 |
| &HA9B4 | MBF single | N_A9B4! | 0EE1 |
| &HA9B4 | MBF single constant | N_A9B4! | MODULE_CONSTANTS = 259 |
| &HA9B8 | MBF single | N_A9B8! | 0EE9; 1636; 23ED |
| &HA9B8 | MBF single constant | N_A9B8! | MODULE_CONSTANTS = 260 |
| &HA9BC | MBF single | N_A9BC! | 0F0B |
| &HA9BC | MBF single constant | N_A9BC! | MODULE_CONSTANTS = -260 |
| &HA9C0 | MBF single | N_A9C0! | 0F26 |
| &HA9C0 | MBF single constant | N_A9C0! | MODULE_CONSTANTS = 309 |
| &HA9C4 | MBF single | N_A9C4! | 0F9B |
| &HA9C4 | MBF single constant | N_A9C4! | MODULE_CONSTANTS = 665 |
| &HA9C8 | MBF single | N_A9C8! | 0FA1 |
| &HA9C8 | MBF single constant | N_A9C8! | MODULE_CONSTANTS = 742 |
| &HA9CC | MBF single | N_A9CC! | 0FD4 |
| &HA9CC | MBF single constant | N_A9CC! | MODULE_CONSTANTS = 758 |
| &HA9D0 | MBF single | N_A9D0! | 0FDC; 1017; 18F4; 7548; 77EC … |
| &HA9D0 | MBF single constant | N_A9D0! | MODULE_CONSTANTS = 110 |
| &HA9D4 | MBF single | N_A9D4! | 0FF9; 7B17 |
| &HA9D4 | MBF single constant | N_A9D4! | MODULE_CONSTANTS = 0 |
| &HA9D8 | MBF single | N_A9D8! | 100F; 1BF8; 7580; 75C3; 7915 |
| &HA9D8 | MBF single constant | N_A9D8! | MODULE_CONSTANTS = 159 |
| &HA9DC | MBF single | N_A9DC! | 104A |
| &HA9DC | MBF single constant | N_A9DC! | MODULE_CONSTANTS = 158 |
| &HA9E0 | MBF single | N_A9E0! | 1069 |
| &HA9E0 | MBF single constant | N_A9E0! | MODULE_CONSTANTS = 22222 |
| &HA9E4 | string descriptor | S_A9E4$ | MODULE_CONSTANTS literal 'SPPIC'; 108C |
| &HA9EE | string descriptor | S_A9EE$ | MODULE_CONSTANTS literal '.BAS'; 10B1 |
| &HA9F6 | MBF single | N_A9F6! | 10F5; 19BE; 19C6; 6A71; 6A7E … |
| &HA9FA | MBF single | N_A9FA! | 10DF; 19AC; 9EDE |
| &HA9FA | MBF single constant | N_A9FA! | MODULE_CONSTANTS = 365 |
| &HA9FE | MBF single | N_A9FE! | 1121; 1140; 1190; 11BE; 1210 … |
| &HAA02 | MBF single | N_AA02! | 115A; 1162; 13B7 |
| &HAA06 | MBF single | N_AA06! | 116E; 1176; 119C; 11D4 |
| &HAA0A | MBF single | N_AA0A! | 1135; 1398; 58E5; 8574 |
| &HAA0A | MBF single constant | N_AA0A! | MODULE_CONSTANTS = 29 |
| &HAA0E | MBF single | N_AA0E! | 1162; 858B |
| &HAA0E | MBF single constant | N_AA0E! | MODULE_CONSTANTS = 0.00547945 |
| &HAA12 | MBF single | N_AA12! | 1176; 19CE; 2F25; 966B |
| &HAA12 | MBF single constant | N_AA12! | MODULE_CONSTANTS = 60 |
| &HAA16 | MBF single | N_AA16! | 1187; 11B5 |
| &HAA16 | MBF single constant | N_AA16! | MODULE_CONSTANTS = 36 |
| &HAA1A | MBF single | N_AA1A! | 11EF |
| &HAA1A | MBF single constant | N_AA1A! | MODULE_CONSTANTS = -236 |
| &HAA1E | string descriptor | S_AA1E$ | MODULE_CONSTANTS literal ' has aged.'; 1221 |
| &HAA2C | MBF single | N_AA2C! | 122D; 1280; 12DA; 1F1A; 1F5B … |
| &HAA30 | MBF single | N_AA30! | 1269; 1271; 12B2; 2CA1; 2F4B … |
| &HAA34 | MBF single | N_AA34! | 132A; 2CA1 |
| &HAA34 | MBF single constant | N_AA34! | MODULE_CONSTANTS = 28 |
| &HAA38 | string descriptor | S_AA38$ | MODULE_CONSTANTS literal ' is dead'; 137A |
| &HAA44 | MBF single | N_AA44! | 1354; 65E3; 676C; 7232 |
| &HAA44 | MBF single constant | N_AA44! | MODULE_CONSTANTS = 0 |
| &HAA48 | MBF single | N_AA48! | 13E2; 1428; 14FE |
| &HAA4C | MBF single | N_AA4C! | 143A; 14BE; 1543; 1763; 194C … |
| &HAA50 | MBF single | N_AA50! | 142E |
| &HAA50 | MBF single constant | N_AA50! | MODULE_CONSTANTS = 20000 |
| &HAA54 | MBF single | N_AA54! | 1434 |
| &HAA54 | MBF single constant | N_AA54! | MODULE_CONSTANTS = -1.98e+06 |
| &HAA58 | MBF single | N_AA58! | 1442; 14F0 |
| &HAA58 | MBF single constant | N_AA58! | MODULE_CONSTANTS = 109 |
| &HAA5C | string descriptor | S_AA5C$ | MODULE_CONSTANTS literal 'Your performance on this last mission'; 145C |
| &HAA86 | string descriptor | S_AA86$ | MODULE_CONSTANTS literal 'was so outstanding you made every'; 1470 |
| &HAAAC | string descriptor | S_AAAC$ | MODULE_CONSTANTS literal 'headline in the traingle.'; 1487 |
| &HAACA | string descriptor | S_AACA$ | MODULE_CONSTANTS literal 'You have earned a special bonus'; 14A1 |
| &HAAEE | string descriptor | S_AAEE$ | MODULE_CONSTANTS literal 'credits.'; 14C4 |
| &HAAFA | string descriptor | S_AAFA$ | MODULE_CONSTANTS literal 'of'; 14B8 |
| &HAB00 | MBF single | N_AB00! | 14FE |
| &HAB00 | MBF single constant | N_AB00! | MODULE_CONSTANTS = 108 |
| &HAB04 | string descriptor | S_AB04$ | MODULE_CONSTANTS literal 'You found a valuable item,'; 155A |
| &HAB22 | string descriptor | S_AB22$ | MODULE_CONSTANTS literal 'analysis reveals it to be:'; 1571 |
| &HAB40 | string descriptor | S_AB40$ | MODULE_CONSTANTS literal 'You recieve'; 15B1 |
| &HAB50 | string descriptor | S_AB50$ | MODULE_CONSTANTS literal 'credits.'; 15BC |
| &HAB5C | MBF single | N_AB5C! | 152F |
| &HAB5C | MBF single constant | N_AB5C! | MODULE_CONSTANTS = 1.7 |
| &HAB60 | MBF single | N_AB60! | 158C; 9919 |
| &HAB60 | MBF single constant | N_AB60! | MODULE_CONSTANTS = -160 |
| &HAB64 | string descriptor | S_AB64$ | MODULE_CONSTANTS literal 'towing'; 15E4 |
| &HAB6E | MBF single | N_AB6E! | 15DB; 1624; 16A5; 1747 |
| &HAB72 | string descriptor | S_AB72$ | 15E4; 162D; 16D0; 1FA3; 387A … |
| &HAB76 | MBF single | N_AB76! | 1603; 164D; 1674; 1677; 171B … |
| &HAB7A | MBF single | N_AB7A! | 1618; 1668; 168B; 16ED; 629C … |
| &HAB7E | string descriptor | S_AB7E$ | MODULE_CONSTANTS literal 'defeating'; 162D |
| &HAB8C | MBF single | N_AB8C! | 1674; 1747 |
| &HAB90 | MBF single | N_AB90! | 1682 |
| &HAB90 | MBF single constant | N_AB90! | MODULE_CONSTANTS = 0 |
| &HAB94 | MBF single | N_AB94! | 16A5; 24AA |
| &HAB94 | MBF single constant | N_AB94! | MODULE_CONSTANTS = 0.2 |
| &HAB98 | string descriptor | S_AB98$ | MODULE_CONSTANTS literal 'As a reward for '; 16CA |
| &HABAC | string descriptor | S_ABAC$ | MODULE_CONSTANTS literal ' ship'; 16FE |
| &HABB6 | string descriptor | S_ABB6$ | MODULE_CONSTANTS literal 'weighing'; 1715 |
| &HABC2 | string descriptor | S_ABC2$ | MODULE_CONSTANTS literal 'you receive'; 173E |
| &HABD2 | string descriptor | S_ABD2$ | MODULE_CONSTANTS literal 'credits.'; 1757 |
| &HABDE | string descriptor | S_ABDE$ | MODULE_CONSTANTS literal 'a '; 16E7 |
| &HABE4 | string descriptor | S_ABE4$ | MODULE_CONSTANTS literal 'tons'; 1727 |
| &HABEC | MBF single | N_ABEC! | 1796; 179B; 17B4; 17EE |
| &HABF0 | MBF single | N_ABF0! | 17C1; 17E3 |
| &HABF4 | MBF single | N_ABF4! | 1816; 1839 |
| &HABF8 | MBF single | N_ABF8! | 18AC; 98CF |
| &HABF8 | MBF single constant | N_ABF8! | MODULE_CONSTANTS = 160 |
| &HABFC | MBF single | N_ABFC! | 18EC; 1BC6; 996A |
| &HABFC | MBF single constant | N_ABFC! | MODULE_CONSTANTS = 209 |
| &HAC00 | string descriptor | S_AC00$ | MODULE_CONSTANTS literal 'Congratulations for completing your'; 1963 |
| &HAC28 | string descriptor | S_AC28$ | MODULE_CONSTANTS literal 'mission you receive'; 197A |
| &HAC40 | string descriptor | S_AC40$ | MODULE_CONSTANTS literal 'credits.'; 1985 |
| &HAC4C | MBF single | N_AC4C! | 1934 |
| &HAC4C | MBF single constant | N_AC4C! | MODULE_CONSTANTS = -107 |
| &HAC50 | MBF single | N_AC50! | 1946; 50C2 |
| &HAC50 | MBF single constant | N_AC50! | MODULE_CONSTANTS = 1000 |
| &HAC54 | MBF single | N_AC54! | 19C6; 19CE; 1A6B |
| &HAC58 | string descriptor | S_AC58$ | MODULE_CONSTANTS literal ' receives'; 1A5C |
| &HAC66 | MBF single | N_AC66! | 1A1E |
| &HAC6A | string descriptor | S_AC6A$ | MODULE_CONSTANTS literal ' '; 1A45; 2546; 57EB; 6620 … |
| &HAC70 | MBF single | N_AC70! | 1A71; 23F3; 4C17; 56D2; 96F0 |
| &HAC70 | MBF single constant | N_AC70! | MODULE_CONSTANTS = 30 |
| &HAC74 | string descriptor | S_AC74$ | MODULE_CONSTANTS literal 'credits in pay'; 1A98 |
| &HAC86 | string descriptor | S_AC86$ | MODULE_CONSTANTS literal 'Your promotion came through'; 1AEE |
| &HACA6 | string descriptor | S_ACA6$ | MODULE_CONSTANTS literal 'You are a '; 1B05 |
| &HACB4 | MBF single | N_ACB4! | 1BE1 |
| &HACB4 | MBF single constant | N_ACB4! | MODULE_CONSTANTS = 0 |
| &HACB8 | string descriptor | S_ACB8$ | MODULE_CONSTANTS literal 'STARPORT '; 1C66 |
| &HACC6 | MBF single | N_ACC6! | 1E56; 1E76 |
| &HACCA | MBF single | N_ACCA! | 1E68; 1E6E; 1E76 |
| &HACCE | string descriptor | S_ACCE$ | MODULE_CONSTANTS literal 'Select Option'; 1E8E |
| &HACE0 | MBF single | N_ACE0! | 1EB5 |
| &HACE0 | MBF single constant | N_ACE0! | MODULE_CONSTANTS = 1e+07 |
| &HACE4 | MBF single | N_ACE4! | 1ED8; 1EE0; 63A9; 6466; 9F13 … |
| &HACE8 | MBF single | N_ACE8! | 1F1A |
| &HACE8 | MBF single constant | N_ACE8! | MODULE_CONSTANTS = 0 |
| &HACEC | string descriptor | S_ACEC$ | MODULE_CONSTANTS literal 'There are no squad members present'; 1F88 |
| &HAD12 | string descriptor | S_AD12$ | 1FAF; 1FBF; 20EF; 2107; 22CA … |
| &HAD16 | MBF single | N_AD16! | 1FDE; 281A |
| &HAD16 | MBF single constant | N_AD16! | MODULE_CONSTANTS = 0 |
| &HAD1A | MBF single | N_AD1A! | 1FEA; 7B2D |
| &HAD1A | MBF single constant | N_AD1A! | MODULE_CONSTANTS = 80 |
| &HAD1E | MBF single | N_AD1E! | 1FF6 |
| &HAD1E | MBF single constant | N_AD1E! | MODULE_CONSTANTS = 112 |
| &HAD22 | MBF single | N_AD22! | 201A |
| &HAD22 | MBF single constant | N_AD22! | MODULE_CONSTANTS = 67 |
| &HAD26 | MBF single | N_AD26! | 2056; 6B08; 6B2A; 7AF9 |
| &HAD26 | MBF single constant | N_AD26! | MODULE_CONSTANTS = 55 |
| &HAD2A | MBF single | N_AD2A! | 206B |
| &HAD2A | MBF single constant | N_AD2A! | MODULE_CONSTANTS = -46 |
| &HAD2E | MBF single | N_AD2E! | 208E |
| &HAD2E | MBF single constant | N_AD2E! | MODULE_CONSTANTS = 0 |
| &HAD32 | MBF single | N_AD32! | 20C9; 20CF; 20D7 |
| &HAD36 | string descriptor | S_AD36$ | MODULE_CONSTANTS literal 'Press ENTER Key'; 20E3 |
| &HAD4A | string descriptor | S_AD4A$ | MODULE_CONSTANTS literal 'Main Menu'; 2122 |
| &HAD58 | string descriptor | S_AD58$ | MODULE_CONSTANTS literal 'A-Personnel'; 213E |
| &HAD68 | string descriptor | S_AD68$ | MODULE_CONSTANTS literal 'G-Game Save'; 2157 |
| &HAD78 | string descriptor | S_AD78$ | MODULE_CONSTANTS literal 'B-Buy'; 2170 |
| &HAD82 | string descriptor | S_AD82$ | MODULE_CONSTANTS literal 'H-Headquarters'; 2186 |
| &HAD94 | string descriptor | S_AD94$ | MODULE_CONSTANTS literal 'C-Sell'; 219C |
| &HAD9E | string descriptor | S_AD9E$ | MODULE_CONSTANTS literal 'I-Inspect'; 21B2 |
| &HADAC | string descriptor | S_ADAC$ | MODULE_CONSTANTS literal 'D-Dry Dock'; 21CE |
| &HADBA | string descriptor | S_ADBA$ | MODULE_CONSTANTS literal 'K-Christen'; 21E2 |
| &HADC8 | string descriptor | S_ADC8$ | MODULE_CONSTANTS literal 'E-Training'; 21FB |
| &HADD6 | string descriptor | S_ADD6$ | MODULE_CONSTANTS literal 'L-Leave'; 2211 |
| &HADE2 | string descriptor | S_ADE2$ | MODULE_CONSTANTS literal 'F-Fuel'; 2227 |
| &HADEC | string descriptor | S_ADEC$ | MODULE_CONSTANTS literal 'M-Medical'; 223D |
| &HADFA | string descriptor | S_ADFA$ | MODULE_CONSTANTS literal 'T-Time Delay'; 2254 |
| &HAE0A | MBF single | N_AE0A! | 2260 |
| &HAE0E | MBF single | N_AE0E! | 2269; 2337; 2C05; 33EF; 3842 … |
| &HAE12 | MBF single | N_AE12! | 2269; 66B6; 66D2; 6724 |
| &HAE12 | MBF single constant | N_AE12! | MODULE_CONSTANTS = 26 |
| &HAE16 | MBF single | N_AE16! | 2272; 227A; 22E3; 22EB; 2304 … |
| &HAE1A | MBF single | N_AE1A! | 22BB |
| &HAE1A | MBF single constant | N_AE1A! | MODULE_CONSTANTS = 74 |
| &HAE1E | MBF single | N_AE1E! | 22EB |
| &HAE1E | MBF single constant | N_AE1E! | MODULE_CONSTANTS = 95 |
| &HAE22 | MBF single | N_AE22! | 22F6; 2311; 2C59; 3442; 384E … |
| &HAE22 | MBF single constant | N_AE22! | MODULE_CONSTANTS = -32 |
| &HAE26 | MBF single | N_AE26! | 232B; 3839 |
| &HAE2A | MBF single | N_AE2A! | 2304 |
| &HAE2A | MBF single constant | N_AE2A! | MODULE_CONSTANTS = -64 |
| &HAE2E | MBF single | N_AE2E! | 231D; 2C64; 342A; 3859; 393B … |
| &HAE2E | MBF single constant | N_AE2E! | MODULE_CONSTANTS = -51 |
| &HAE32 | string descriptor | S_AE32$ | MODULE_CONSTANTS literal 'Refueling ISS '; 23D2 |
| &HAE44 | MBF single | N_AE44! | 23C3; 4B18; 5EB5; 896B; 9542 … |
| &HAE44 | MBF single constant | N_AE44! | MODULE_CONSTANTS = 14 |
| &HAE48 | MBF single | N_AE48! | 23F9; 246C |
| &HAE4C | MBF single | N_AE4C! | 24DD |
| &HAE4C | MBF single constant | N_AE4C! | MODULE_CONSTANTS = 290 |
| &HAE50 | MBF single | N_AE50! | 24F1; 25C2; 2621; 2956; 6255 … |
| &HAE54 | MBF single | N_AE54! | 24F1; 25C2 |
| &HAE54 | MBF single constant | N_AE54! | MODULE_CONSTANTS = 3.9 |
| &HAE58 | MBF single | N_AE58! | 24FF; 2523 |
| &HAE5C | MBF single | N_AE5C! | 250B; 251A |
| &HAE60 | string descriptor | S_AE60$ | 2552; 2562; 262F |
| &HAE64 | MBF single | N_AE64! | 25DD |
| &HAE64 | MBF single constant | N_AE64! | MODULE_CONSTANTS = 57 |
| &HAE68 | MBF single | N_AE68! | 25F7; 3EC9; 3EE8; 9A7F; 9C42 |
| &HAE68 | MBF single constant | N_AE68! | MODULE_CONSTANTS = 32 |
| &HAE6C | MBF single | N_AE6C! | 2603 |
| &HAE6C | MBF single constant | N_AE6C! | MODULE_CONSTANTS = 126 |
| &HAE72 | string descriptor | S_AE72$ | MODULE_CONSTANTS literal 'No More Of That Allowed Onboard'; 265E |
| &HAE96 | string descriptor | S_AE96$ | MODULE_CONSTANTS literal 'Can Not Carry Anymore Of That'; 267D |
| &HAEB8 | string descriptor | S_AEB8$ | MODULE_CONSTANTS literal 'Can Not Afford It'; 269C |
| &HAECE | MBF single | N_AECE! | 2708; 2831; 7E78; 8644 |
| &HAECE | MBF single constant | N_AECE! | MODULE_CONSTANTS = 0.25 |
| &HAED2 | MBF single | N_AED2! | 270E; 6842 |
| &HAED2 | MBF single constant | N_AED2! | MODULE_CONSTANTS = 0.125 |
| &HAED6 | MBF single | N_AED6! | 2789; 27DF |
| &HAED6 | MBF single constant | N_AED6! | MODULE_CONSTANTS = -25 |
| &HAEDA | string descriptor | S_AEDA$ | MODULE_CONSTANTS literal 'y'; 28C8 |
| &HAEE0 | string descriptor | S_AEE0$ | MODULE_CONSTANTS literal 'Y'; 28D4 |
| &HAEE6 | string descriptor | S_AEE6$ | MODULE_CONSTANTS literal 'n'; 28F6 |
| &HAEEC | string descriptor | S_AEEC$ | MODULE_CONSTANTS literal 'N'; 2902 |
| &HAEF2 | string descriptor | S_AEF2$ | MODULE_CONSTANTS literal ' is dead.'; 2946 |
| &HAF00 | string descriptor | S_AF00$ | MODULE_CONSTANTS literal '(yes/no) '; 295F |
| &HAF0E | MBF single | N_AF0E! | 2970; 2979; 29E2; 401D; 4125 … |
| &HAF12 | string descriptor | S_AF12$ | MODULE_CONSTANTS literal 'yes'; 2991 |
| &HAF1A | string descriptor | S_AF1A$ | MODULE_CONSTANTS literal 'YES'; 299D |
| &HAF22 | string descriptor | S_AF22$ | MODULE_CONSTANTS literal 'NO'; 29BE |
| &HAF28 | string descriptor | S_AF28$ | MODULE_CONSTANTS literal 'no'; 29CA |
| &HAF2E | string descriptor | S_AF2E$ | MODULE_CONSTANTS literal '   '; 29EE; 8539; 860B |
| &HAF36 | MBF single | N_AF36! | 29FB; 2AC2; 2AF2; 51A4; 51BF … |
| &HAF3A | MBF single | N_AF3A! | 2A0B; 2A1D; 501F; 5024; 506A … |
| &HAF3E | string descriptor | S_AF3E$ | MODULE_CONSTANTS literal 'Returns Department'; 2BC8 |
| &HAF54 | string descriptor | S_AF54$ | MODULE_CONSTANTS literal 'A-Sell Personal Equipment'; 2BE2 |
| &HAF72 | string descriptor | S_AF72$ | MODULE_CONSTANTS literal 'B-Sell Ships Equipment'; 2BF9 |
| &HAF8C | string descriptor | S_AF8C$ | MODULE_CONSTANTS literal 'C-Sell Cargo'; 2C1C |
| &HAF9C | string descriptor | S_AF9C$ | MODULE_CONSTANTS literal 'D-Sell Ship'; 2C33 |
| &HAFAC | string descriptor | S_AFAC$ | MODULE_CONSTANTS literal 'E-Declare Bankrupcy'; 2C4A |
| &HAFC4 | MBF single | N_AFC4! | 2C92; 2E9C; 2F13; 321A; 322F … |
| &HAFC8 | MBF single | N_AFC8! | 2C98; 2F1C; 3238; 32EE; 3368 … |
| &HAFCC | MBF single | N_AFCC! | 2C92; 2C98; 5541; 5562; 84E0 |
| &HAFCC | MBF single constant | N_AFCC! | MODULE_CONSTANTS = 0 |
| &HAFD0 | MBF single | N_AFD0! | 2CA7; 396B; 6BF9; 7ABD; 9389 … |
| &HAFD0 | MBF single constant | N_AFD0! | MODULE_CONSTANTS = 800 |
| &HAFD4 | MBF single | N_AFD4! | 2CB5; 2D25; 2D2B; 2D33; 2D41 … |
| &HAFD8 | MBF single | N_AFD8! | 2D05; 2DAF; 2E53; 3351 |
| &HAFDC | MBF single | N_AFDC! | 2D19; 2DC3; 2E66; 2F7D; 2FE1 … |
| &HAFE0 | MBF single | N_AFE0! | 2D33; 3A1F; 6C90; 9410 |
| &HAFE0 | MBF single constant | N_AFE0! | MODULE_CONSTANTS = 1088 |
| &HAFE4 | MBF single | N_AFE4! | 2D41; 2DEB; 2E8E; 30AA; 3176 … |
| &HAFE4 | MBF single constant | N_AFE4! | MODULE_CONSTANTS = 8888 |
| &HAFE8 | MBF single | N_AFE8! | 2D4C; 3F3A; 941B; A607 |
| &HAFE8 | MBF single constant | N_AFE8! | MODULE_CONSTANTS = 1100 |
| &HAFEC | string descriptor | S_AFEC$ | MODULE_CONSTANTS literal 'Ammo for '; 2D8C |
| &HAFFA | MBF single | N_AFFA! | 2DDD; 3F80; 94A2; A67E |
| &HAFFA | MBF single constant | N_AFFA! | MODULE_CONSTANTS = 1397 |
| &HAFFE | MBF single | N_AFFE! | 2DF6; 45F3; 7B71; 8BEA; 94AD |
| &HAFFE | MBF single constant | N_AFFE! | MODULE_CONSTANTS = 2300 |
| &HB002 | MBF single | N_B002! | 2E80; 463A; 8CD4; 9534 |
| &HB002 | MBF single constant | N_B002! | MODULE_CONSTANTS = 2597 |
| &HB006 | string descriptor | S_B006$ | MODULE_CONSTANTS literal 'Owner    Item    '; 2EB7 |
| &HB01C | string descriptor | S_B01C$ | MODULE_CONSTANTS literal 'credits'; 2ECF |
| &HB028 | MBF single | N_B028! | 2EC0; 2EF1; 32E5; 6317 |
| &HB028 | MBF single constant | N_B028! | MODULE_CONSTANTS = 0 |
| &HB02C | string descriptor | S_B02C$ | MODULE_CONSTANTS literal 'Selling Equipment  '; 2EE8 |
| &HB044 | string descriptor | S_B044$ | MODULE_CONSTANTS literal 'credits'; 2F00 |
| &HB050 | MBF single | N_B050! | 2F1C; 3238; 3450; 349D; 34B9 … |
| &HB050 | MBF single constant | N_B050! | MODULE_CONSTANTS = 0 |
| &HB054 | MBF single | N_B054! | 2F4B; 5AFF; 7E94; 8A39; 8D3D … |
| &HB054 | MBF single constant | N_B054! | MODULE_CONSTANTS = 18 |
| &HB058 | MBF single | N_B058! | 2F89; A4BF |
| &HB058 | MBF single constant | N_B058! | MODULE_CONSTANTS = 63 |
| &HB05C | MBF single | N_B05C! | 2FAF; 5AEA; 776E; 77A6; 8099 … |
| &HB05C | MBF single constant | N_B05C! | MODULE_CONSTANTS = 17 |
| &HB060 | MBF single | N_B060! | 2FEA; 365D |
| &HB060 | MBF single constant | N_B060! | MODULE_CONSTANTS = 66 |
| &HB064 | string descriptor | S_B064$ | MODULE_CONSTANTS literal 'SHIELD'; 3049 |
| &HB06E | MBF single | N_B06E! | 301D |
| &HB06E | MBF single constant | N_B06E! | MODULE_CONSTANTS = -15 |
| &HB072 | MBF single | N_B072! | 303D |
| &HB072 | MBF single constant | N_B072! | MODULE_CONSTANTS = -6 |
| &HB076 | string descriptor | S_B076$ | MODULE_CONSTANTS literal '  '; 3051; 311D |
| &HB07C | MBF single | N_B07C! | 309C; 36B7; 96C3 |
| &HB07C | MBF single constant | N_B07C! | MODULE_CONSTANTS = 75 |
| &HB080 | MBF single | N_B080! | 30B5; 36BF; 7BAD; 9743 |
| &HB080 | MBF single constant | N_B080! | MODULE_CONSTANTS = 690 |
| &HB084 | MBF single | N_B084! | 30E9 |
| &HB084 | MBF single constant | N_B084! | MODULE_CONSTANTS = -87 |
| &HB088 | string descriptor | S_B088$ | MODULE_CONSTANTS literal 'GUN'; 3115 |
| &HB090 | MBF single | N_B090! | 3168; 3719; 979B |
| &HB090 | MBF single constant | N_B090! | MODULE_CONSTANTS = 725 |
| &HB094 | MBF single | N_B094! | 3181; 4B3C; 7B35; 96E3; A047 |
| &HB094 | MBF single constant | N_B094! | MODULE_CONSTANTS = 340 |
| &HB098 | string descriptor | S_B098$ | MODULE_CONSTANTS literal 'Ammo for '; 31CC |
| &HB0A6 | MBF single | N_B0A6! | 3201; 4B74; 4B8B; 973B; A09E |
| &HB0A6 | MBF single constant | N_B0A6! | MODULE_CONSTANTS = 369 |
| &HB0AA | MBF single | N_B0AA! | 3277; 921D |
| &HB0AA | MBF single constant | N_B0AA! | MODULE_CONSTANTS = -400 |
| &HB0AE | MBF single | N_B0AE! | 32B2; 926E |
| &HB0AE | MBF single constant | N_B0AE! | MODULE_CONSTANTS = 499 |
| &HB0B2 | MBF single | N_B0B2! | 32E5; 338F; 34EF |
| &HB0B6 | MBF single | N_B0B6! | 3316; 5BAE |
| &HB0B6 | MBF single constant | N_B0B6! | MODULE_CONSTANTS = 64 |
| &HB0BA | string descriptor | S_B0BA$ | MODULE_CONSTANTS literal 'Select item to sell'; 3404 |
| &HB0D2 | string descriptor | S_B0D2$ | MODULE_CONSTANTS literal ', SPACEBAR for more'; 341B |
| &HB0EA | MBF single | N_B0EA! | 3438 |
| &HB0EA | MBF single constant | N_B0EA! | MODULE_CONSTANTS = 9999 |
| &HB0EE | string descriptor | S_B0EE$ | MODULE_CONSTANTS literal 'You do not have one'; 3523 |
| &HB106 | string descriptor | S_B106$ | MODULE_CONSTANTS literal 'The reinstallation fee on ships guns,'; 3546 |
| &HB130 | string descriptor | S_B130$ | MODULE_CONSTANTS literal 'shields, etc.  is 15% of cost.'; 355D |
| &HB152 | string descriptor | S_B152$ | MODULE_CONSTANTS literal 'There is no credit or reinstalation'; 3577 |
| &HB17A | string descriptor | S_B17A$ | MODULE_CONSTANTS literal 'for ships armor.'; 358E |
| &HB18E | string descriptor | S_B18E$ | MODULE_CONSTANTS literal 'Are you sure you want to sell'; 35A8 |
| &HB1B0 | string descriptor | S_B1B0$ | MODULE_CONSTANTS literal 'your ship? '; 35BF |
| &HB1C0 | MBF single | N_B1C0! | 35EF; 3739; 376F |
| &HB1C4 | MBF single | N_B1C4! | 361F |
| &HB1C4 | MBF single constant | N_B1C4! | MODULE_CONSTANTS = -0.15 |
| &HB1C8 | MBF single | N_B1C8! | 364C; 3695; 36F7 |
| &HB1C8 | MBF single constant | N_B1C8! | MODULE_CONSTANTS = 0.15 |
| &HB1CC | string descriptor | S_B1CC$ | MODULE_CONSTANTS literal 'Received for ship   '; 3733 |
| &HB1E4 | string descriptor | S_B1E4$ | MODULE_CONSTANTS literal 'credits'; 373F |
| &HB1F0 | string descriptor | S_B1F0$ | MODULE_CONSTANTS literal 'Reinstallation fees '; 3757 |
| &HB208 | string descriptor | S_B208$ | MODULE_CONSTANTS literal 'credits'; 3763 |
| &HB214 | string descriptor | S_B214$ | MODULE_CONSTANTS literal 'Total received      '; 379A |
| &HB22C | string descriptor | S_B22C$ | MODULE_CONSTANTS literal 'credits'; 37A6 |
| &HB238 | string descriptor | S_B238$ | MODULE_CONSTANTS literal 'Arsenal'; 37E5 |
| &HB244 | string descriptor | S_B244$ | MODULE_CONSTANTS literal 'A-Buy Personal Equipment'; 37FF |
| &HB260 | string descriptor | S_B260$ | MODULE_CONSTANTS literal 'B-Buy Ships Equipment'; 3816 |
| &HB27A | string descriptor | S_B27A$ | MODULE_CONSTANTS literal 'C-Buy Ship'; 382D |
| &HB288 | string descriptor | S_B288$ | MODULE_CONSTANTS literal 'Who Will Buy?'; 387A |
| &HB29A | string descriptor | S_B29A$ | MODULE_CONSTANTS literal 'A-Regular Weapon'; 38A5 |
| &HB2AE | string descriptor | S_B2AE$ | MODULE_CONSTANTS literal 'B-Ammo'; 38BC |
| &HB2B8 | string descriptor | S_B2B8$ | MODULE_CONSTANTS literal 'C-Hand Weapon'; 38D3 |
| &HB2CA | string descriptor | S_B2CA$ | MODULE_CONSTANTS literal 'D-Sighting Hardware'; 38ED |
| &HB2E2 | string descriptor | S_B2E2$ | MODULE_CONSTANTS literal 'E-Armor'; 3901 |
| &HB2EE | string descriptor | S_B2EE$ | MODULE_CONSTANTS literal 'F-Miscellaneous'; 3918 |
| &HB302 | MBF single | N_B302! | 395F; 3A03; 3A3E |
| &HB306 | MBF single | N_B306! | 39A9; 3CEB; 3DAB; 3E72; 3F0C … |
| &HB30A | string descriptor | S_B30A$ | MODULE_CONSTANTS literal 'A-ALL WEAPONS'; 3A61 |
| &HB31C | string descriptor | S_B31C$ | MODULE_CONSTANTS literal '-G-Bullet'; 3A78 |
| &HB32A | string descriptor | S_B32A$ | MODULE_CONSTANTS literal 'HEAVY  H-Flame'; 3A90 |
| &HB33C | string descriptor | S_B33C$ | MODULE_CONSTANTS literal '-B-Bullet   WEAPONS I-Rocket'; 3AA8 |
| &HB35C | string descriptor | S_B35C$ | MODULE_CONSTANTS literal 'LIGHT  C-Needler'; 3AC0 |
| &HB370 | string descriptor | S_B370$ | MODULE_CONSTANTS literal '-J-Laser'; 3AD4 |
| &HB37C | string descriptor | S_B37C$ | MODULE_CONSTANTS literal 'WEAPONS D-Electric'; 3B5A |
| &HB392 | string descriptor | S_B392$ | MODULE_CONSTANTS literal 'E-Ion      K-CHEMICAL WEAPONS'; 3B74 |
| &HB3B4 | string descriptor | S_B3B4$ | MODULE_CONSTANTS literal '-F-Gernade'; 3B8C |
| &HB3C2 | string descriptor | S_B3C2$ | MODULE_CONSTANTS literal 'L-EXPLOSIVE WEAPONS'; 3BA3 |
| &HB3DA | string descriptor | S_B3DA$ | MODULE_CONSTANTS literal 'Weapon'; 3BFA |
| &HB3E4 | MBF single | N_B3E4! | 3BF1; 4196; 4319; 4470; 4659 … |
| &HB3E8 | string descriptor | S_B3E8$ | 3BFA; 41B1; 4334; 448B; 4674 … |
| &HB3EC | MBF single | N_B3EC! | 3C11; 3C3E; 419F; 4322; 4479 … |
| &HB3F0 | MBF single | N_B3F0! | 3C1A; 3C5B; 41A8; 432B; 4482 … |
| &HB3F4 | MBF single | N_B3F4! | 3C92; 3CA6; 3E5D; 405E; 4072 … |
| &HB3F8 | MBF single | N_B3F8! | 3F0C |
| &HB3F8 | MBF single constant | N_B3F8! | MODULE_CONSTANTS = -787 |
| &HB3FC | MBF single | N_B3FC! | 3F2B; 3F9C; 4014; 412E; A6A1 |
| &HB400 | MBF single | N_B400! | 3F34; 8D01; A734; A83C |
| &HB404 | MBF single | N_B404! | 3F69 |
| &HB404 | MBF single constant | N_B404! | MODULE_CONSTANTS = 1999 |
| &HB408 | MBF single | N_B408! | 3F8B |
| &HB408 | MBF single constant | N_B408! | MODULE_CONSTANTS = 1888 |
| &HB40C | string descriptor | S_B40C$ | MODULE_CONSTANTS literal 'Ammo for which gun?'; 3FD0 |
| &HB424 | string descriptor | S_B424$ | MODULE_CONSTANTS literal ', SPACE for more'; 3FE9 |
| &HB438 | MBF single | N_B438! | 3FB5; 8D3D; A69B; A725; A7E7 … |
| &HB43C | MBF single | N_B43C! | 3FB5 |
| &HB43C | MBF single constant | N_B43C! | MODULE_CONSTANTS = -18 |
| &HB440 | MBF single | N_B440! | 401D; 8D1F; A714 |
| &HB440 | MBF single constant | N_B440! | MODULE_CONSTANTS = 1090 |
| &HB444 | MBF single | N_B444! | 4030 |
| &HB444 | MBF single constant | N_B444! | MODULE_CONSTANTS = 559 |
| &HB448 | MBF single | N_B448! | 4069 |
| &HB448 | MBF single constant | N_B448! | MODULE_CONSTANTS = 0 |
| &HB44C | MBF single | N_B44C! | 4125; A692; A855 |
| &HB450 | string descriptor | S_B450$ | MODULE_CONSTANTS literal ' Buying With'; 4171 |
| &HB460 | string descriptor | S_B460$ | MODULE_CONSTANTS literal 'Credits'; 4189 |
| &HB46C | string descriptor | S_B46C$ | MODULE_CONSTANTS literal 'Hand Weapon'; 41B1 |
| &HB47C | MBF single | N_B47C! | 4237 |
| &HB47C | MBF single constant | N_B47C! | MODULE_CONSTANTS = 44 |
| &HB480 | MBF single | N_B480! | 4279; 8BB0 |
| &HB480 | MBF single constant | N_B480! | MODULE_CONSTANTS = 45 |
| &HB484 | MBF single | N_B484! | 42B0; 7A52; 9327; 9C7E |
| &HB484 | MBF single constant | N_B484! | MODULE_CONSTANTS = 90 |
| &HB488 | MBF single | N_B488! | 4322; 5871; 58B8; 58D9 |
| &HB488 | MBF single constant | N_B488! | MODULE_CONSTANTS = 0 |
| &HB48C | string descriptor | S_B48C$ | MODULE_CONSTANTS literal 'Unit'; 4334; 4674 |
| &HB494 | MBF single | N_B494! | 43BA; 7A07; 92EE |
| &HB494 | MBF single constant | N_B494! | MODULE_CONSTANTS = 41 |
| &HB498 | MBF single | N_B498! | 43F0; 92D7 |
| &HB498 | MBF single constant | N_B498! | MODULE_CONSTANTS = 42 |
| &HB49C | MBF single | N_B49C! | 4428; 8B50 |
| &HB49C | MBF single constant | N_B49C! | MODULE_CONSTANTS = 43 |
| &HB4A0 | string descriptor | S_B4A0$ | MODULE_CONSTANTS literal 'Suit'; 448B |
| &HB4A8 | MBF single | N_B4A8! | 4511; 9365; A746 |
| &HB4A8 | MBF single constant | N_B4A8! | MODULE_CONSTANTS = 47 |
| &HB4AC | MBF single | N_B4AC! | 45A4; 7A7C |
| &HB4AC | MBF single constant | N_B4AC! | MODULE_CONSTANTS = 91 |
| &HB4B0 | MBF single | N_B4B0! | 4623 |
| &HB4B0 | MBF single constant | N_B4B0! | MODULE_CONSTANTS = 2999 |
| &HB4B4 | MBF single | N_B4B4! | 4645 |
| &HB4B4 | MBF single constant | N_B4B4! | MODULE_CONSTANTS = 2888 |
| &HB4B8 | MBF single | N_B4B8! | 4662 |
| &HB4B8 | MBF single constant | N_B4B8! | MODULE_CONSTANTS = 0 |
| &HB4BC | string descriptor | S_B4BC$ | MODULE_CONSTANTS literal 'A-Ships Guns'; 4794 |
| &HB4CC | string descriptor | S_B4CC$ | MODULE_CONSTANTS literal 'B-Ammo For Missle Weapon'; 47A8 |
| &HB4E8 | string descriptor | S_B4E8$ | MODULE_CONSTANTS literal 'C-Shields'; 47BC |
| &HB4F6 | string descriptor | S_B4F6$ | MODULE_CONSTANTS literal 'D-Defense Hardware'; 47D3 |
| &HB50C | string descriptor | S_B50C$ | MODULE_CONSTANTS literal 'E-Missle Killers'; 47E7 |
| &HB520 | string descriptor | S_B520$ | MODULE_CONSTANTS literal 'F-Armor'; 47FB |
| &HB52C | string descriptor | S_B52C$ | MODULE_CONSTANTS literal 'Buy weapon for which position? (1-6)'; 4854 |
| &HB554 | string descriptor | S_B554$ | MODULE_CONSTANTS literal 'Ship Weapon'; 48D6 |
| &HB564 | MBF single | N_B564! | 48E8; 48ED; 48F8; 4964 |
| &HB568 | string descriptor | S_B568$ | MODULE_CONSTANTS literal 'You Already Have One'; 4A98 |
| &HB580 | string descriptor | S_B580$ | MODULE_CONSTANTS literal 'Buy ammo for which gun? (1-6)'; 4ABD |
| &HB5A2 | MBF single | N_B5A2! | 4B63; 4BF3 |
| &HB5A6 | MBF single | N_B5A6! | 4C5C; A5CB |
| &HB5A6 | MBF single constant | N_B5A6! | MODULE_CONSTANTS = 501 |
| &HB5AA | string descriptor | S_B5AA$ | MODULE_CONSTANTS literal 'Which position? (1-4)'; 4C91 |
| &HB5C4 | string descriptor | S_B5C4$ | MODULE_CONSTANTS literal 'Shield'; 4CEE |
| &HB5D0 | string descriptor | S_B5D0$ | MODULE_CONSTANTS literal 'Defense Unit'; 4E30 |
| &HB5E0 | string descriptor | S_B5E0$ | MODULE_CONSTANTS literal 'Missle Killer'; 4F33 |
| &HB5F2 | string descriptor | S_B5F2$ | MODULE_CONSTANTS literal 'You Must Have A Ship First'; 5032 |
| &HB610 | string descriptor | S_B610$ | MODULE_CONSTANTS literal 'Current armor points:'; 5044 |
| &HB62A | string descriptor | S_B62A$ | MODULE_CONSTANTS literal 'Armor cost per point:'; 5064 |
| &HB644 | string descriptor | S_B644$ | MODULE_CONSTANTS literal 'A ton of armor is'; 5091 |
| &HB65A | string descriptor | S_B65A$ | MODULE_CONSTANTS literal 'points'; 50B6 |
| &HB664 | string descriptor | S_B664$ | MODULE_CONSTANTS literal 'You are allowed'; 50DD |
| &HB678 | string descriptor | S_B678$ | MODULE_CONSTANTS literal 'more points'; 50E8 |
| &HB688 | MBF single | N_B688! | 50C8; 511D |
| &HB68C | string descriptor | S_B68C$ | MODULE_CONSTANTS literal 'Buy how many points? '; 5100 |
| &HB6A6 | MBF single | N_B6A6! | 515A; A029; A5E9 |
| &HB6A6 | MBF single constant | N_B6A6! | MODULE_CONSTANTS = 0 |
| &HB6AA | string descriptor | S_B6AA$ | MODULE_CONSTANTS literal ' Class '; 51E6 |
| &HB6B6 | string descriptor | S_B6B6$ | MODULE_CONSTANTS literal 'Price:'; 522D |
| &HB6C0 | string descriptor | S_B6C0$ | MODULE_CONSTANTS literal 'Credits'; 523E |
| &HB6CC | string descriptor | S_B6CC$ | MODULE_CONSTANTS literal 'SPACEBAR to see more ships'; 5258 |
| &HB6EA | string descriptor | S_B6EA$ | MODULE_CONSTANTS literal 'B-Buy the Ship, ENTER to Exit'; 526F |
| &HB70C | string descriptor | S_B70C$ | MODULE_CONSTANTS literal 'You May Christen Your Ship'; 5408 |
| &HB72A | string descriptor | S_B72A$ | MODULE_CONSTANTS literal 'Recruitment Office'; 5454 |
| &HB740 | string descriptor | S_B740$ | MODULE_CONSTANTS literal 'A-Recruit New Squad Member'; 546E |
| &HB75E | string descriptor | S_B75E$ | MODULE_CONSTANTS literal 'B-Dismiss Squad Member Permanently'; 5485 |
| &HB784 | string descriptor | S_B784$ | MODULE_CONSTANTS literal 'C-Change Positions'; 549C |
| &HB79A | string descriptor | S_B79A$ | MODULE_CONSTANTS literal 'Dismiss Which Squad Member?'; 54DD |
| &HB7BA | string descriptor | S_B7BA$ | MODULE_CONSTANTS literal 'Dismiss '; 5505 |
| &HB7C6 | string descriptor | S_B7C6$ | MODULE_CONSTANTS literal ' permanently?'; 551C |
| &HB7D8 | MBF single | N_B7D8! | 558D; 5632; 5759 |
| &HB7DC | MBF single | N_B7DC! | 574B |
| &HB7DC | MBF single constant | N_B7DC! | MODULE_CONSTANTS = 0.05 |
| &HB7E0 | string descriptor | S_B7E0$ | MODULE_CONSTANTS literal '         '; 57DA |
| &HB7EE | MBF single | N_B7EE! | 583E; 5887 |
| &HB7F2 | string descriptor | S_B7F2$ | MODULE_CONSTANTS literal 'Keep this squad member? (y/n)'; 589E |
| &HB814 | MBF single | N_B814! | 5906 |
| &HB814 | MBF single constant | N_B814! | MODULE_CONSTANTS = 5110 |
| &HB818 | MBF single | N_B818! | 598B; 688C; 7EBF; 80CB; A23F |
| &HB818 | MBF single constant | N_B818! | MODULE_CONSTANTS = 65 |
| &HB81C | string descriptor | S_B81C$ | MODULE_CONSTANTS literal 'D-Esper'; 5A05 |
| &HB828 | MBF single | N_B828! | 5A86; 5B13; 5BC7; 5C25 |
| &HB82C | MBF single | N_B82C! | 5A8F; 5B4F; 5C69; 6189 |
| &HB830 | string descriptor | S_B830$ | MODULE_CONSTANTS literal 'Basic Training Year'; 5AB1 |
| &HB848 | MBF single | N_B848! | 5AB7; 61D9; 61DF; 61E7 |
| &HB84C | MBF single | N_B84C! | 5C45; 5C4A; 5CFB; 5D1B; 5D36 … |
| &HB850 | string descriptor | S_B850$ | MODULE_CONSTANTS literal 'You did not make it'; 5CE1 |
| &HB868 | MBF single | N_B868! | 5CC7 |
| &HB868 | MBF single constant | N_B868! | MODULE_CONSTANTS = 0.8 |
| &HB86C | string descriptor | S_B86C$ | MODULE_CONSTANTS literal 'Your assignment: '; 5D30 |
| &HB882 | string descriptor | S_B882$ | MODULE_CONSTANTS literal ' is'; 5E4D; 5E88; 5FA8; 5FE3 |
| &HB88A | MBF single | N_B88A! | 6038; 6075; 60C4; 84F2; 8574 … |
| &HB88E | string descriptor | S_B88E$ | MODULE_CONSTANTS literal 'You reach '; 60D9 |
| &HB89C | string descriptor | S_B89C$ | MODULE_CONSTANTS literal ' level'; 60F4 |
| &HB8A6 | string descriptor | S_B8A6$ | MODULE_CONSTANTS literal 'You are promoted to '; 61A1 |
| &HB8BE | MBF single | N_B8BE! | 6117 |
| &HB8BE | MBF single constant | N_B8BE! | MODULE_CONSTANTS = 0.93 |
| &HB8C2 | string descriptor | S_B8C2$ | MODULE_CONSTANTS literal 'Input Name: '; 6249 |
| &HB8D2 | string descriptor | S_B8D2$ | MODULE_CONSTANTS literal 'Who will change positions?'; 6285 |
| &HB8F0 | string descriptor | S_B8F0$ | MODULE_CONSTANTS literal 'Change with who?'; 62A5 |
| &HB904 | MBF single | N_B904! | 62F1; 6330 |
| &HB908 | MBF single | N_B908! | 630E; 636F |
| &HB90C | MBF single | N_B90C! | 63AF |
| &HB90C | MBF single constant | N_B90C! | MODULE_CONSTANTS = 809 |
| &HB910 | MBF single | N_B910! | 63CD |
| &HB910 | MBF single constant | N_B910! | MODULE_CONSTANTS = 1097 |
| &HB914 | MBF single | N_B914! | 63D5 |
| &HB914 | MBF single constant | N_B914! | MODULE_CONSTANTS = 2302 |
| &HB918 | MBF single | N_B918! | 63F3; 7BA5 |
| &HB918 | MBF single constant | N_B918! | MODULE_CONSTANTS = 2599 |
| &HB91C | MBF single | N_B91C! | 63FB |
| &HB91C | MBF single constant | N_B91C! | MODULE_CONSTANTS = 1102 |
| &HB920 | MBF single | N_B920! | 6419; 7AF1 |
| &HB920 | MBF single constant | N_B920! | MODULE_CONSTANTS = 1399 |
| &HB924 | string descriptor | S_B924$ | MODULE_CONSTANTS literal 'Class'; 64AF |
| &HB92E | string descriptor | S_B92E$ | MODULE_CONSTANTS literal 'Rank'; 6481 |
| &HB936 | string descriptor | S_B936$ | MODULE_CONSTANTS literal 'Name'; 6498 |
| &HB93E | string descriptor | S_B93E$ | 64FF; 6611 |
| &HB942 | string descriptor | S_B942$ | 652D; 656F; 65B9; 6651 |
| &HB946 | string descriptor | S_B946$ | MODULE_CONSTANTS literal 'Injr'; 656F |
| &HB94E | string descriptor | S_B94E$ | MODULE_CONSTANTS literal '>'; 65D7; 9BB1 |
| &HB954 | string descriptor | S_B954$ | MODULE_CONSTANTS literal '     '; 6611 |
| &HB95E | MBF single | N_B95E! | 6744; 676C; 69EB; 6CBA |
| &HB962 | string descriptor | S_B962$ | MODULE_CONSTANTS literal ' In Dry Dock'; 6795 |
| &HB972 | string descriptor | S_B972$ | MODULE_CONSTANTS literal 'A-Repair Ships Equipment'; 67AF |
| &HB98E | string descriptor | S_B98E$ | MODULE_CONSTANTS literal 'B-Repair All Personal Equipment'; 67C6 |
| &HB9B2 | string descriptor | S_B9B2$ | MODULE_CONSTANTS literal 'C-Remove Armor From Ship'; 67DD |
| &HB9CE | string descriptor | S_B9CE$ | MODULE_CONSTANTS literal '-----------'; 68B8 |
| &HB9DE | string descriptor | S_B9DE$ | MODULE_CONSTANTS literal 'Repair What?  *-Broken  #-4000 to fix'; 6920 |
| &HBA08 | MBF single | N_BA08! | 692C; A821 |
| &HBA08 | MBF single constant | N_BA08! | MODULE_CONSTANTS = 23 |
| &HBA0C | MBF single | N_BA0C! | 698F |
| &HBA0C | MBF single constant | N_BA0C! | MODULE_CONSTANTS = 4000 |
| &HBA10 | MBF single | N_BA10! | 69A3 |
| &HBA10 | MBF single constant | N_BA10! | MODULE_CONSTANTS = -4000 |
| &HBA14 | string descriptor | S_BA14$ | MODULE_CONSTANTS literal 'Sucessful'; 6A04 |
| &HBA22 | string descriptor | S_BA22$ | MODULE_CONSTANTS literal 'Failure'; 6A38 |
| &HBA2E | MBF single | N_BA2E! | 6A7E; 9EF0 |
| &HBA32 | MBF single | N_BA32! | 6A90; 9EF6 |
| &HBA36 | MBF single | N_BA36! | 6C9E; 6CE5 |
| &HBA3A | string descriptor | S_BA3A$ | MODULE_CONSTANTS literal ' makes'; 6D4B |
| &HBA44 | string descriptor | S_BA44$ | MODULE_CONSTANTS literal 'repairs'; 6D60 |
| &HBA50 | string descriptor | S_BA50$ | MODULE_CONSTANTS literal 'Technicians make'; 6D77 |
| &HBA64 | string descriptor | S_BA64$ | MODULE_CONSTANTS literal 'repairs'; 6D82 |
| &HBA70 | string descriptor | S_BA70$ | MODULE_CONSTANTS literal 'Total cost:'; 6D99 |
| &HBA80 | string descriptor | S_BA80$ | MODULE_CONSTANTS literal 'credits'; 6DA7 |
| &HBA8C | string descriptor | S_BA8C$ | MODULE_CONSTANTS literal 'Your ship has'; 6DE1 |
| &HBA9E | string descriptor | S_BA9E$ | MODULE_CONSTANTS literal 'armor points'; 6DED |
| &HBAAE | string descriptor | S_BAAE$ | MODULE_CONSTANTS literal 'Remove how many? '; 6E05 |
| &HBAC4 | string descriptor | S_BAC4$ | MODULE_CONSTANTS literal 'Sickbay'; 6E5B |
| &HBAD0 | string descriptor | S_BAD0$ | MODULE_CONSTANTS literal 'A-Squad Health'; 6E75 |
| &HBAE2 | string descriptor | S_BAE2$ | MODULE_CONSTANTS literal 'B-Rest In Sickbay'; 6E8C |
| &HBAF8 | string descriptor | S_BAF8$ | MODULE_CONSTANTS literal 'C-Make Clone'; 6EA3 |
| &HBB08 | string descriptor | S_BB08$ | MODULE_CONSTANTS literal 'D-Use Clone'; 6EBA |
| &HBB18 | string descriptor | S_BB18$ | MODULE_CONSTANTS literal 'Clones:'; 7009 |
| &HBB24 | MBF single | N_BB24! | 6F2F |
| &HBB24 | MBF single constant | N_BB24! | MODULE_CONSTANTS = 0 |
| &HBB28 | string descriptor | S_BB28$ | MODULE_CONSTANTS literal 'HP'; 6F79 |
| &HBB2E | string descriptor | S_BB2E$ | MODULE_CONSTANTS literal '/'; 6F9B; 85E9; 8B1B |
| &HBB34 | MBF single | N_BB34! | 706D; 7188; 71BB |
| &HBB38 | string descriptor | S_BB38$ | MODULE_CONSTANTS literal 'Squad rests for'; 71B5 |
| &HBB4C | string descriptor | S_BB4C$ | MODULE_CONSTANTS literal ' days'; 71C9 |
| &HBB56 | string descriptor | S_BB56$ | MODULE_CONSTANTS literal 'Clone who?'; 71E6 |
| &HBB64 | MBF single | N_BB64! | 7227; 723B; 724C; 72E7 |
| &HBB68 | MBF single | N_BB68! | 721B |
| &HBB68 | MBF single constant | N_BB68! | MODULE_CONSTANTS = 70000 |
| &HBB6C | string descriptor | S_BB6C$ | MODULE_CONSTANTS literal 'Total cost:'; 72E1 |
| &HBB7C | string descriptor | S_BB7C$ | MODULE_CONSTANTS literal 'credits'; 72ED |
| &HBB88 | MBF single | N_BB88! | 7416 |
| &HBB88 | MBF single constant | N_BB88! | MODULE_CONSTANTS = 0.9 |
| &HBB8C | string descriptor | S_BB8C$ | MODULE_CONSTANTS literal ' is replaced'; 74B8 |
| &HBB9C | string descriptor | S_BB9C$ | MODULE_CONSTANTS literal 'Not possible'; 7509 |
| &HBBAC | string descriptor | S_BBAC$ | MODULE_CONSTANTS literal 'Headquarters'; 752A |
| &HBBBC | MBF single | N_BBBC! | 7572 |
| &HBBBC | MBF single constant | N_BBBC! | MODULE_CONSTANTS = -109 |
| &HBBC0 | string descriptor | S_BBC0$ | MODULE_CONSTANTS literal 'Do you wish to review your'; 75E7 |
| &HBBDE | string descriptor | S_BBDE$ | MODULE_CONSTANTS literal 'mission? (y/n)'; 75FF |
| &HBBF0 | string descriptor | S_BBF0$ | MODULE_CONSTANTS literal 'MISSION'; 7620 |
| &HBBFC | MBF single | N_BBFC! | 7633; 76AE |
| &HBC00 | string descriptor | S_BC00$ | 770F; 7750 |
| &HBC04 | string descriptor | S_BC04$ | 7742; 7750 |
| &HBC08 | MBF single | N_BC08! | 765B |
| &HBC08 | MBF single constant | N_BC08! | MODULE_CONSTANTS = 2230 |
| &HBC0C | MBF single | N_BC0C! | 7695 |
| &HBC0C | MBF single constant | N_BC0C! | MODULE_CONSTANTS = 2244 |
| &HBC10 | string descriptor | S_BC10$ | MODULE_CONSTANTS literal 'You have completed your last mission'; 777C |
| &HBC38 | string descriptor | S_BC38$ | MODULE_CONSTANTS literal 'Here is your new mission'; 778B |
| &HBC54 | MBF single | N_BC54! | 7797 |
| &HBC54 | MBF single constant | N_BC54! | MODULE_CONSTANTS = 0 |
| &HBC58 | string descriptor | S_BC58$ | MODULE_CONSTANTS literal 'TRY WHICH MISSION (1-50)?'; 7817 |
| &HBC76 | string descriptor | S_BC76$ | MODULE_CONSTANTS literal 'YOU FINISHED THAT ONE. TRY IT AGAIN?'; 788D |
| &HBC9E | string descriptor | S_BC9E$ | MODULE_CONSTANTS literal 'YOU ARE ON THAT MISSION.'; 78C8 |
| &HBCBA | MBF single | N_BCBA! | 7948; A973; A9A4 |
| &HBCBA | MBF single constant | N_BCBA! | MODULE_CONSTANTS = 59 |
| &HBCBE | MBF single | N_BCBE! | 7967 |
| &HBCBE | MBF single constant | N_BCBE! | MODULE_CONSTANTS = 0 |
| &HBCC2 | string descriptor | S_BCC2$ | MODULE_CONSTANTS literal 'Do you wish to declare bankrupcy?'; 79A0 |
| &HBCE8 | string descriptor | S_BCE8$ | MODULE_CONSTANTS literal 'High Command is very disapointed'; 79D4 |
| &HBD0C | MBF single | N_BD0C! | 79FE; 7A47 |
| &HBD10 | MBF single | N_BD10! | 7A31 |
| &HBD10 | MBF single constant | N_BD10! | MODULE_CONSTANTS = 0 |
| &HBD14 | MBF single | N_BD14! | 7A73 |
| &HBD14 | MBF single constant | N_BD14! | MODULE_CONSTANTS = 0 |
| &HBD18 | MBF single | N_BD18! | 7A9B |
| &HBD18 | MBF single constant | N_BD18! | MODULE_CONSTANTS = 0 |
| &HBD1C | MBF single | N_BD1C! | 7B53 |
| &HBD1C | MBF single constant | N_BD1C! | MODULE_CONSTANTS = 0 |
| &HBD20 | MBF single | N_BD20! | 7B69 |
| &HBD20 | MBF single constant | N_BD20! | MODULE_CONSTANTS = 449 |
| &HBD24 | MBF single | N_BD24! | 7B8F |
| &HBD24 | MBF single constant | N_BD24! | MODULE_CONSTANTS = 0 |
| &HBD28 | MBF single | N_BD28! | 7BCB |
| &HBD28 | MBF single constant | N_BD28! | MODULE_CONSTANTS = 0 |
| &HBD2C | MBF single | N_BD2C! | 7BE1 |
| &HBD2C | MBF single constant | N_BD2C! | MODULE_CONSTANTS = 731 |
| &HBD30 | MBF single | N_BD30! | 7BEC |
| &HBD30 | MBF single constant | N_BD30! | MODULE_CONSTANTS = 0 |
| &HBD34 | MBF single | N_BD34! | 7BF5 |
| &HBD34 | MBF single constant | N_BD34! | MODULE_CONSTANTS = 90000 |
| &HBD38 | string descriptor | S_BD38$ | MODULE_CONSTANTS literal 'training sessions due'; 7C85 |
| &HBD52 | string descriptor | S_BD52$ | MODULE_CONSTANTS literal 'A-Next character'; 7C9F |
| &HBD66 | string descriptor | S_BD66$ | MODULE_CONSTANTS literal 'B-Buy training session (200,000 cr)'; 7CB6 |
| &HBD8E | string descriptor | S_BD8E$ | MODULE_CONSTANTS literal 'C-Inspect '; 7CCD |
| &HBD9C | string descriptor | S_BD9C$ | MODULE_CONSTANTS literal ' has'; 7C62 |
| &HBDA4 | string descriptor | S_BDA4$ | MODULE_CONSTANTS literal 'D-Use training session'; 7D11 |
| &HBDBE | MBF single | N_BDBE! | 7D46 |
| &HBDBE | MBF single constant | N_BDBE! | MODULE_CONSTANTS = 0 |
| &HBDC2 | MBF single | N_BDC2! | 7D4F |
| &HBDC2 | MBF single constant | N_BDC2! | MODULE_CONSTANTS = 200000 |
| &HBDC6 | string descriptor | S_BDC6$ | MODULE_CONSTANTS literal 'Are you sure? (Y/N)'; 7D72 |
| &HBDDE | MBF single | N_BDDE! | 7D8C |
| &HBDDE | MBF single constant | N_BDDE! | MODULE_CONSTANTS = -200000 |
| &HBDE2 | string descriptor | S_BDE2$ | MODULE_CONSTANTS literal 'Post Mission Training For '; 7E06 |
| &HBE00 | MBF single | N_BE00! | 7F7B |
| &HBE00 | MBF single constant | N_BE00! | MODULE_CONSTANTS = 3.3 |
| &HBE04 | string descriptor | S_BE04$ | MODULE_CONSTANTS literal ' goes to'; 802D |
| &HBE10 | MBF single | N_BE10! | 80B0; 8660; 8C90; 905F |
| &HBE10 | MBF single constant | N_BE10! | MODULE_CONSTANTS = 19 |
| &HBE14 | string descriptor | S_BE14$ | MODULE_CONSTANTS literal '.'; 8112; 86C8; 8A87 |
| &HBE1A | string descriptor | S_BE1A$ | MODULE_CONSTANTS literal '..'; 8173 |
| &HBE20 | string descriptor | S_BE20$ | MODULE_CONSTANTS literal '#.#'; 8190; 839A |
| &HBE28 | string descriptor | S_BE28$ | MODULE_CONSTANTS literal 'Select Valid Training Area'; 81D3 |
| &HBE46 | MBF single | N_BE46! | 8205; 8215 |
| &HBE4A | MBF single | N_BE4A! | 820B |
| &HBE4A | MBF single constant | N_BE4A! | MODULE_CONSTANTS = 0 |
| &HBE4E | MBF single | N_BE4E! | 82E2; 8324 |
| &HBE52 | MBF single | N_BE52! | 8316 |
| &HBE52 | MBF single constant | N_BE52! | MODULE_CONSTANTS = 0.667 |
| &HBE56 | string descriptor | S_BE56$ | MODULE_CONSTANTS literal 'You reach '; 8344 |
| &HBE64 | string descriptor | S_BE64$ | MODULE_CONSTANTS literal ' level '; 835B |
| &HBE70 | string descriptor | S_BE70$ | MODULE_CONSTANTS literal 'A-Inspect Ship'; 8413 |
| &HBE82 | string descriptor | S_BE82$ | MODULE_CONSTANTS literal 'B-Inspect Squad'; 842A |
| &HBE96 | string descriptor | S_BE96$ | MODULE_CONSTANTS literal 'C-Cargo List'; 8441 |
| &HBEA6 | string descriptor | S_BEA6$ | MODULE_CONSTANTS literal 'D-Espionage List'; 8458 |
| &HBEBA | string descriptor | S_BEBA$ | MODULE_CONSTANTS literal 'E-Miscellaneous Items'; 846F |
| &HBED4 | string descriptor | S_BED4$ | MODULE_CONSTANTS literal 'Inspect Who?'; 84B4 |
| &HBEE4 | string descriptor | S_BEE4$ | MODULE_CONSTANTS literal 'mo   HP'; 85C7 |
| &HBEF0 | MBF single | N_BEF0! | 8591 |
| &HBEF4 | string descriptor | S_BEF4$ | MODULE_CONSTANTS literal 'yr'; 85A5 |
| &HBEFA | MBF single | N_BEFA! | 8711; 8A02; 8ADB; 8BD3; 8CF3 … |
| &HBEFA | MBF single constant | N_BEFA! | MODULE_CONSTANTS = -40 |
| &HBEFE | string descriptor | S_BEFE$ | MODULE_CONSTANTS literal 'To Hit Bonus...'; 8730 |
| &HBF12 | string descriptor | S_BF12$ | MODULE_CONSTANTS literal 'Defense Bonus..'; 876B |
| &HBF26 | string descriptor | S_BF26$ | MODULE_CONSTANTS literal 'Max. Carried...'; 87A0 |
| &HBF3A | string descriptor | S_BF3A$ | MODULE_CONSTANTS literal '+##'; 8739; 8F58 |
| &HBF42 | string descriptor | S_BF42$ | MODULE_CONSTANTS literal ' kg'; 87CB; 8989 |
| &HBF4A | string descriptor | S_BF4A$ | MODULE_CONSTANTS literal 'Non-Esper'; 8804 |
| &HBF58 | string descriptor | S_BF58$ | MODULE_CONSTANTS literal 'Esper Ability'; 8813 |
| &HBF6A | string descriptor | S_BF6A$ | MODULE_CONSTANTS literal 'Level'; 884B |
| &HBF74 | string descriptor | S_BF74$ | MODULE_CONSTANTS literal 'Mindshock'; 8867 |
| &HBF82 | MBF single | N_BF82! | 881F; 8873; 88AC; 88E5; 8912 |
| &HBF82 | MBF single constant | N_BF82! | MODULE_CONSTANTS = 27 |
| &HBF86 | string descriptor | S_BF86$ | MODULE_CONSTANTS literal 'Communications'; 88A0 |
| &HBF98 | string descriptor | S_BF98$ | MODULE_CONSTANTS literal 'Healing'; 88D9 |
| &HBFA4 | string descriptor | S_BFA4$ | MODULE_CONSTANTS literal ' ,View'; 8906 |
| &HBFAE | string descriptor | S_BFAE$ | MODULE_CONSTANTS literal 'Psychic Scream'; 893F |
| &HBFC0 | string descriptor | S_BFC0$ | MODULE_CONSTANTS literal 'Weight Carried.'; 8959 |
| &HBFD4 | string descriptor | S_BFD4$ | MODULE_CONSTANTS literal 'Max. Movement..'; 89A0 |
| &HBFE8 | string descriptor | S_BFE8$ | MODULE_CONSTANTS literal 'Movement.......'; 89D5 |
| &HBFFC | string descriptor | S_BFFC$ | MODULE_CONSTANTS literal 'Armor..............'; 8AFA |
| &HC014 | string descriptor | S_C014$ | MODULE_CONSTANTS literal 'Sighting Hardware..'; 8B48 |
| &HC02C | string descriptor | S_C02C$ | MODULE_CONSTANTS literal 'Clones.............'; 8B7B |
| &HC044 | string descriptor | S_C044$ | MODULE_CONSTANTS literal 'Hand Weapon........'; 8BA8 |
| &HC05C | string descriptor | S_C05C$ | MODULE_CONSTANTS literal '%'; 8B64; 8F6A; 9152; 91A1 |
| &HC062 | string descriptor | S_C062$ | MODULE_CONSTANTS literal 'pts'; 8BC4 |
| &HC06A | MBF single | N_C06A! | 8D01 |
| &HC06A | MBF single constant | N_C06A! | MODULE_CONSTANTS = 0 |
| &HC06E | string descriptor | S_C06E$ | MODULE_CONSTANTS literal 'You do not have one'; 8D6A |
| &HC086 | string descriptor | S_C086$ | MODULE_CONSTANTS literal ' Status Report'; 8D99 |
| &HC098 | string descriptor | S_C098$ | MODULE_CONSTANTS literal ' Class '; 8DC7 |
| &HC0A4 | string descriptor | S_C0A4$ | MODULE_CONSTANTS literal 'ISS '; 8D8D; 9FC9 |
| &HC0AC | string descriptor | S_C0AC$ | MODULE_CONSTANTS literal 'Base Weight...'; 8DF5 |
| &HC0BE | string descriptor | S_C0BE$ | MODULE_CONSTANTS literal 'Cargo Weight..'; 8E2B |
| &HC0D0 | string descriptor | S_C0D0$ | MODULE_CONSTANTS literal 'Total Weight..'; 8E64 |
| &HC0E2 | string descriptor | S_C0E2$ | MODULE_CONSTANTS literal ' tns'; 8E12; 8EB6 |
| &HC0EA | string descriptor | S_C0EA$ | MODULE_CONSTANTS literal 'Max. Weight...'; 8E9B |
| &HC0FC | string descriptor | S_C0FC$ | MODULE_CONSTANTS literal 'Armor.........'; 8ED2 |
| &HC10E | string descriptor | S_C10E$ | MODULE_CONSTANTS literal 'Credits.......'; 8F1C |
| &HC120 | string descriptor | S_C120$ | MODULE_CONSTANTS literal '#######'; 8F25 |
| &HC12C | string descriptor | S_C12C$ | MODULE_CONSTANTS literal 'Defense....'; 8F4F |
| &HC13C | string descriptor | S_C13C$ | MODULE_CONSTANTS literal 'Max. Move.....'; 8F82 |
| &HC14E | MBF single | N_C14E! | 8F91; 97D4; 97DC; 9850; 9872 |
| &HC152 | string descriptor | S_C152$ | MODULE_CONSTANTS literal 'Cur. Move.....'; 8FA9 |
| &HC164 | string descriptor | S_C164$ | MODULE_CONSTANTS literal '(-) okay  (*) broken  (#) 4000 to fix'; 90BB |
| &HC18E | string descriptor | S_C18E$ | MODULE_CONSTANTS literal 'Missle Killer.........'; 911B |
| &HC1A8 | string descriptor | S_C1A8$ | MODULE_CONSTANTS literal 'Defense Hardware......'; 916A |
| &HC1C2 | string descriptor | S_C1C2$ | MODULE_CONSTANTS literal 'Cargo List'; 91C2 |
| &HC1D0 | MBF single | N_C1D0! | 92BC; 955D |
| &HC1D0 | MBF single constant | N_C1D0! | MODULE_CONSTANTS = 39 |
| &HC1D4 | MBF single | N_C1D4! | 97A6 |
| &HC1D4 | MBF single constant | N_C1D4! | MODULE_CONSTANTS = 32000 |
| &HC1D8 | string descriptor | S_C1D8$ | MODULE_CONSTANTS literal 'Espionage List'; 98BD |
| &HC1EA | string descriptor | S_C1EA$ | MODULE_CONSTANTS literal 'Miscellaneous Items'; 99A7 |
| &HC202 | MBF single | N_C202! | 99C6 |
| &HC202 | MBF single constant | N_C202! | MODULE_CONSTANTS = 726 |
| &HC206 | MBF single | N_C206! | 9AC0; 9C8C; 9CBE |
| &HC20A | string descriptor | S_C20A$ | MODULE_CONSTANTS literal 'Saving game.'; 9AD8 |
| &HC21A | string descriptor | S_C21A$ | MODULE_CONSTANTS literal 'Type the '; 9B2D |
| &HC228 | string descriptor | S_C228$ | MODULE_CONSTANTS literal ' word in section'; 9B40 |
| &HC242 | string descriptor | S_C242$ | MODULE_CONSTANTS literal 'of the rule book.'; 9B60 |
| &HC258 | MBF single | N_C258! | 9BE0; 9C70 |
| &HC25C | MBF single | N_C25C! | 9C2E; 9C36; AC72; AC78; AC80 |
| &HC260 | string descriptor | S_C260$ | MODULE_CONSTANTS literal 'Wrong!'; 9CA9 |
| &HC26A | string descriptor | S_C26A$ | MODULE_CONSTANTS literal 'CHARINFO.BAS'; 9CEA |
| &HC27A | string descriptor | S_C27A$ | MODULE_CONSTANTS literal 'CHARNAME'; 9D02 |
| &HC286 | string descriptor | S_C286$ | MODULE_CONSTANTS literal ','; 9D1E; 9D4C |
| &HC28C | string descriptor | S_C28C$ | MODULE_CONSTANTS literal 'Quit the game? (Y/N)'; 9D85 |
| &HC2A4 | string descriptor | S_C2A4$ | MODULE_CONSTANTS literal 'Pilot or ship not ready'; 9E1D |
| &HC2C0 | string descriptor | S_C2C0$ | MODULE_CONSTANTS literal 'Ship overloaded'; 9E43 |
| &HC2D4 | string descriptor | S_C2D4$ | MODULE_CONSTANTS literal 'Leaving starport'; 9E58 |
| &HC2E8 | MBF single | N_C2E8! | 9E6E |
| &HC2E8 | MBF single constant | N_C2E8! | MODULE_CONSTANTS = 54 |
| &HC2EC | MBF single | N_C2EC! | 9EA7 |
| &HC2EC | MBF single constant | N_C2EC! | MODULE_CONSTANTS = 25 |
| &HC2F0 | string descriptor | S_C2F0$ | MODULE_CONSTANTS literal 'SPACE.STR'; 9F3C |
| &HC2FE | string descriptor | S_C2FE$ | MODULE_CONSTANTS literal 'Input ship name: ISS '; 9F80 |
| &HC318 | string descriptor | S_C318$ | MODULE_CONSTANTS literal 'Star Command welcomes the new ship'; 9FB2 |
| &HC33E | string descriptor | S_C33E$ | MODULE_CONSTANTS literal ' to the fleet.'; 9FD5 |
| &HC350 | string descriptor | S_C350$ | MODULE_CONSTANTS literal 'X'; 9FE4; AC39 |
| &HC356 | string descriptor | S_C356$ | MODULE_CONSTANTS literal "#  Ammo    Ship's Guns"; A002 |
| &HC370 | MBF single | N_C370! | A00B; A06D; A13E; A645; A764 |
| &HC370 | MBF single constant | N_C370! | MODULE_CONSTANTS = 500 |
| &HC374 | MBF single | N_C374! | A03F |
| &HC374 | MBF single constant | N_C374! | MODULE_CONSTANTS = 514 |
| &HC378 | MBF single | N_C378! | A108; A110; A11E; A13E; A1A1 |
| &HC37C | string descriptor | S_C37C$ | MODULE_CONSTANTS literal '> '; A0DC; A4AE; A755 |
| &HC382 | MBF single | N_C382! | A0ED |
| &HC382 | MBF single constant | N_C382! | MODULE_CONSTANTS = 683 |
| &HC386 | string descriptor | S_C386$ | MODULE_CONSTANTS literal ' -'; A12C |
| &HC38C | MBF single | N_C38C! | A1F0; A1F8; A20B; A2B2; A2CC … |
| &HC390 | MBF single | N_C390! | A20B; A289 |
| &HC394 | string descriptor | S_C394$ | MODULE_CONSTANTS literal 'Select A '; A2A0 |
| &HC3A2 | string descriptor | S_C3A2$ | MODULE_CONSTANTS literal ', SPACE for more'; A2C0 |
| &HC3B6 | MBF single | N_C3B6! | A2E4 |
| &HC3B6 | MBF single constant | N_C3B6! | MODULE_CONSTANTS = -57 |
| &HC3BA | string descriptor | S_C3BA$ | MODULE_CONSTANTS literal '#   Shield'; A459 |
| &HC3C8 | string descriptor | S_C3C8$ | MODULE_CONSTANTS literal 'Value'; A46E |
| &HC3D2 | string descriptor | S_C3D2$ | MODULE_CONSTANTS literal ' Reloads   '; A5AB |
| &HC3E2 | string descriptor | S_C3E2$ | MODULE_CONSTANTS literal "'s weapons"; A5C2 |
| &HC3F0 | MBF single | N_C3F0! | A5FF |
| &HC3F0 | MBF single constant | N_C3F0! | MODULE_CONSTANTS = 554 |
| &HC3F4 | MBF single | N_C3F4! | A6C5; A6CD; A764; A7C3 |
| &HC3F8 | MBF single | N_C3F8! | A7F4 |
| &HC3F8 | MBF single constant | N_C3F8! | MODULE_CONSTANTS = 541 |
| &HC3FC | string descriptor | S_C3FC$ | MODULE_CONSTANTS literal 'No Weapons'; A86F |
| &HC40A | string descriptor | S_C40A$ | MODULE_CONSTANTS literal 'Press SPACEBAR'; A894 |
| &HC41C | string descriptor | S_C41C$ | MODULE_CONSTANTS literal 'Standard Delay Factor:'; A8BE |
| &HC436 | string descriptor | S_C436$ | MODULE_CONSTANTS literal 'Current Delay Factor:'; A8DB |
| &HC450 | string descriptor | S_C450$ | MODULE_CONSTANTS literal 'New Delay Factor (1-9999):'; A8F8 |
| &HC46E | string descriptor | S_C46E$ | MODULE_CONSTANTS literal 'fire'; A93E |
| &HC476 | string descriptor | S_C476$ | MODULE_CONSTANTS literal ' receives a medal of honor!'; A9E9 |
| &HC496 | MBF single | N_C496! | A9F8; AA59; AA65 |
| &HC49A | MBF single | N_C49A! | A9FE |
| &HC49A | MBF single constant | N_C49A! | MODULE_CONSTANTS = 111 |
| &HC49E | MBF single | N_C49E! | AA5F; AA80 |
| &HC4A2 | MBF single | N_C4A2! | AA22 |
| &HC4A2 | MBF single constant | N_C4A2! | MODULE_CONSTANTS = 1.6 |
| &HC4A6 | MBF single | N_C4A6! | AA72; AA80 |
| &HC4A6 | MBF single constant | N_C4A6! | MODULE_CONSTANTS = 73 |
| &HC4AA | MBF single | N_C4AA! | AC52 |
| &HC4AA | MBF single constant | N_C4AA! | MODULE_CONSTANTS = 71 |
| &HC4AE | MBF single | N_C4AE! | AC58 |
| &HC4AE | MBF single constant | N_C4AE! | MODULE_CONSTANTS = 37 |
| &HC4B2 | MBF single | N_C4B2! | AC61 |
| &HC4B2 | MBF single constant | N_C4B2! | MODULE_CONSTANTS = 0.1251 |
| &HC4B6 | MBF single | N_C4B6! | AC8C; AC95; ACAA; ACB3 |
| &HC4BA | MBF single | N_C4BA! | AC9E |
| &HC4BA | MBF single constant | N_C4BA! | MODULE_CONSTANTS = 0.3 |

T_nn! temporary slots are addressed through the runtime base and the inline selector; they have no fixed game-variable DS address. InputFile%, InputTypes, BUFFER and INPUT_NEXT are explanatory representations of the runtime's input state. ARGS(), COORD(), ACTION(), BOXMODE(), CAPACITY(), TEMP_DESC(), OPENMODE() and BASIC_BOOL() are semantic helpers defined above; BASIC_BOOL returns -1 or 0. SoundFreq%/SoundDuration!, Line1/2X!/Y!, Get1/2X!/Y! and CircleStart!/End!/Aspect! hold the pending statement arguments, with omissions/defaults governed by the original runtime flags.

FAC! is DS:001A (H ledger). AX/BX/CX/DX/SI/DI and BP are compiler/runtime registers; DX:AX is the IMUL product pair. CompareLeft!/Right!, CompareLeft$/Right$, CompareLeft%/Right%, LocateRow%, PutX%/PutY%/PutXFlag%/PutYFlag% are explanatory temporaries, not original game variables. BYTE/WORD preserve memory width and the original BP-relative workspace.

Examples of address-backed roles: DS:491C is a writable music-string descriptor (M role: initial literal assignment at 0040..0046 and later playback helper). DS:4896 is the initial music literal (H identity). Filename-prefix/string-building roles are retained as their actual descriptor expressions at each concatenation rather than globally renamed. Shared DS:19B4 controls the observed SCREEN 1 branch (H comparison and runtime evidence); its full cross-module value convention remains address-named.

Resources include NPC/item/mission/personnel data and saved-game names; their literal descriptors identify filenames, not complete record schemas. BP-relative words and numeric/string arrays retain WORD/N/S expressions and the source address arithmetic. Temporary strings return a descriptor address in BX, represented by TEMP_DESC. InputPrompt$/InputFlags%/InputSource represent the pending keyboard/file input state; PrintDestination captures PRINT-file output. OFFSET_ARG/LENGTH_ARG retain BSAVE's raw register arguments. Original runtime helper side effects and error handling must be preserved by the verifying lane.

