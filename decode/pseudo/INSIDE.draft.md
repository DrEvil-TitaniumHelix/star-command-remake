# INSIDE — first-draft BASIC-style pseudocode

Evidence: `decode/listings/INSIDE.lst` (including its recorded bytes), `decode/data/MODULE_CONSTANTS.md` / INSIDE.EXE, `decode/brun30/RT_LEDGER.md`, and the specific `decode/brun30/rt_asm.txt` bodies cited below, read 2026-10-15. This draft is for module-lane verification; unresolved semantics remain explicit.

Only this file is the lane output. The assignment's STATUS.md append is omitted to honor the user's explicit one-file scope.

## Conventions and evidence

- `L_0040:` is a load-module/listing offset. Near CALL/RET become GOSUB/RETURN; direct jumps become GOTO. Every recovered instruction has a label, so compiler register calculations and branch joins remain reviewable.
- `N_AAAA!` is a four-byte MBF single at DS:AAAA; `S_AAAA$` is a string descriptor there. `N(expr)`, `S(expr)`, `BYTE(expr)`, `WORD(expr)`, and `MEMORY(expr)` retain computed addresses and untyped graphics buffers. FAC! aliases N_001A!. Register symbols are 16-bit compiler temporaries, not invented game variables.
- All unqualified address identities and FMOV/FSTORE/FLOAD, CINT/CSNG, FCMP/FTEST, FMUL meanings are H from the ledger. The BASIC text expresses the runtime's main operation; its original register clobbers and flags still apply, identified by the RT comment. This is semantic pseudocode, not executable BASIC. Constant propagation stops at branch targets and calls except the few preserved-register bodies directly inspected.
- Integer calculations wrap to 16 bits. CompareLeft/Right are explanatory snapshots of the operands at the producing call. ZF/CF/SF/OF refer to the original producer's CPU flags, including unresolved runtime calls; they are never guessed from a stale floating comparison. AND reg,reg is a zero test, not an assignment.
- LOCATE row capture is H; PUT and coordinate flags are M. MODE(3)/MODE(4) remain raw. SCREEN, palette, sound, file I/O and input calls without adequate ledger evidence stay explicit RT calls.
- RT3F_61 is rendered **S(DX) = S(BX)** (M): 9DC4 exchanges DX/BX; 9DCB..9DD0 sets DI to entry DX, SI to entry BX and copies two words. This contradicts the ledger's current direction. INSIDE 0040..008F independently supports the correction: a literal source feeds a writable descriptor. Helper side effects still require the runtime lane's confirmation.
- RT3F_62 is a string comparison (H body 9E1F..9E49): entry AX/BX identify descriptors; comparison runs AX string versus BX string and preserves the resulting flags. Other ABI side effects are retained implicitly by the RT tag.
- RT3F_6E is rendered as a string PRINT item (M), contrary to its current ledger name: body 99C7 calls 99CC with inline 03 02; 99DC tests type 03 and branches to the string path. Its use with INSIDE's literal descriptors is independent evidence. RT3F_6A has 03 01 (99B3..99B7). Their second-byte formatting distinction is **unknown**; semicolons below group items, not a claim that both variants emit identical spacing/newlines. End-of-statement 3E_79 is rendered as a flush marker without assuming an extra newline.
- BLOAD/CHAIN are M from the data lane's filename/usage evidence and the current game-side patterns; destination offsets and dynamic filenames remain explicit. RT3F_55 concatenation is not promoted to a fully specified statement because its result ABI is unproven here.

## Instruction boundaries and inline data

The supplied linear listing mistakes embedded data for x86 instructions. The draft reconstructs its exact byte stream and decodes in 16-bit mode, advancing over these evidenced inline arguments:

| Family | Inline bytes | Evidence / confidence |
|---|---|---|
| 3F_71/85/95/9D | one selector | H ledger |
| 3F_A5 / 3F_8D | one selector | H consumption: bodies A831/B525 call 1EC3, as the ledger's selector family; selector operation stays unknown |
| 3F_AB / 3F_AD | one byte | H consumption: AC6E..AC82 pops caller return, LODSB, pushes advanced return; byte meaning unknown |
| 3F_B7 | count followed by count type bytes | M schema: C529..C557 reads count/type and saves advanced continuation; seven 01 04 sites plus one 03 04 04 04 site align the following code |
| 3F_5E | count followed by count little-endian target words | H schema: 950B..953E reads count, doubles it, advances continuation, and selects a target |

Dispatch words use runtime CS offsets; adding &H0010 maps them to this listing (M: every recovered table destination aligns with a decoded instruction). Calls retain raw table bytes and explicit mapped labels, rather than claiming fully verified ON GOTO error/default semantics. The body shows one-based BX selection and fallthrough for low-byte indices beyond the count; the high-byte path at 953F remains unknown.

Metadata block 16 starts at &H71F0 (MODULE_CONSTANTS load offset). It is excluded from pseudocode and counts. The thirteen-byte tail &H71E3..71EF follows the terminal GOTO at 71E0 and has no explicit incoming edge; it is retained below as an unclassified code-like tail, not claimed as a reachable game path. The malformed/empty source-line table is not used to invent BASIC line numbers.

## Flows and screens

These are evidence-backed content groups, not a claim that each group is a separate graphics mode or standalone screen. Exact paths, coordinates, conditional items and calls are in the offset transcription.

| Evidence offsets | Content / flow | Confidence |
|---|---|---|
| 0040..0302 | Drive-prefix/environment labels; INSH.BAS and conditional CHARINFO/LOGO loading; NAME/CHARNAME file loops | M literals and call patterns |
| 0359, 038B, 03C9, 03F0, 0409 | Frequently called data/index helpers; keep address names because field meanings are incomplete | H call targets, unknown formulas where RT calls remain |
| 0435..0458 | “Change things?” confirmation | H literal / control flow |
| 08AE..0B9F | Unbreathable atmosphere, squad oxygen inventory, continue Y/N; SPACE.STR return | H strings, M transition |
| 1079..12BB | Option prompt, selection marker, “Press ENTER” helper | H strings |
| 241F..24F1; dispatch 2608 | Exploration command panel: change weapon, equip, fix, switch, inspect, medical, reload, search, delay, use/view | H displayed command text, M dispatch mapping |
| 29F3..2DDD | Radiation/poison/explosive traps; detect, disarm, success/failure prompts | H literals, outcome formulas unknown |
| 2FA1..3489 | Vault door menu: leave, torch, fire, lock pick; missing equipment/ammunition; door-open feedback | H literals |
| 3503..3534 | Exit confirmation; following transition shown in code | H text |
| 3B9F..3C39 | Repair summary and repair kits consumed | H strings, field quantities as in code |
| 3C6D..41A9 | Squad-health/healing menu, member health table, medkit/fully-healed messages | H strings |
| 4236..4ACE | Character inspection: age, HP, combat bonuses, weight, movement, Esper abilities, armor/weapons | H strings, unknown stat-field semantics |
| 4FB4..52CC | Equipment list, ammunition/owner change and paging prompts | H strings |
| 5516..5732 | View ability and “Beings!” / “No Life” result | H strings |
| 5A66..5D63 | Weapon selection and reload feedback | H strings |
| 5F2D..6069 | Search and motion/radiation detector activation | H strings |
| 62AF..637F | Member damage/death and all-dead feedback | H strings |
| 659A..666A | Enemy confrontation, surprise messages, battle handoff and spacebar prompt | H strings, M handoff |
| 68A9..6928 | Standard/current/new delay (1–9999) | H strings |
| 69A2..6BE8 | Arrow-key option selection, one-word command input, unrecognized command | H strings, input routine details unresolved |
| 6CF6..71E0 | 27-way interaction dispatch; amount entry and outcome messages | H table shape and literals; interaction meanings incomplete |

## Collapsed BASIC display patterns

These straightforward sequences provide the requested statement-level view. They are repeated in the complete transcription with register effects retained. String names refer to the literal table under Variables.

```basic
L_0435: LOCATE 20, 2: PRINT S_8876$  ' bytes 0435..044C; 'Change things? '
L_1067: LOCATE 24, 2: PRINT S_8BA4$  ' bytes 1067..107E; 'Select Option'
L_2F8F: LOCATE 15, 26: PRINT S_8E80$  ' bytes 2F8F..2FA6; 'A Vault Door'
L_30BB: LOCATE 19, 26: PRINT S_8ECE$  ' bytes 30BB..30D2; 'No Torches'
L_3275: LOCATE 19, 26: PRINT S_8F0C$  ' bytes 3275..328C; 'Not Armed'
L_32B7: LOCATE 19, 26: PRINT S_8F1A$  ' bytes 32B7..32CE; 'Out Of Ammo'
L_3477: LOCATE 19, 26: PRINT S_8F68$  ' bytes 3477..348E; 'Door Opened'
L_34F1: LOCATE 17, 29: PRINT S_8F7C$  ' bytes 34F1..3508; 'The Exit'
L_4117: LOCATE 22, 26: PRINT S_9112$  ' bytes 4117..412E; 'Medkit used up'
L_45BE: LOCATE 22, 3: PRINT S_9236$  ' bytes 45BE..45D5; 'Mindshock'
L_45F7: LOCATE 22, 14: PRINT S_9244$  ' bytes 45F7..460E; 'Communicate'
L_4630: LOCATE 23, 3: PRINT S_9254$  ' bytes 4630..4647; 'Heal'
L_4669: LOCATE 23, 9: PRINT S_925C$  ' bytes 4669..4680; 'View'
L_46A2: LOCATE 23, 15: PRINT S_9264$  ' bytes 46A2..46B9; 'Psy Scream'
L_4990: LOCATE 4, 2: PRINT S_92DC$  ' bytes 4990..49A7; 'Rlds    Weapons'
L_4FA2: LOCATE 2, 10: PRINT S_933C$  ' bytes 4FA2..4FB9; 'EQUIPING'
L_5D51: LOCATE 19, 28: PRINT S_9490$  ' bytes 5D51..5D68; 'Reloading'
L_6057: LOCATE 23, 26: PRINT S_9516$  ' bytes 6057..606E; 'You Have None'
L_636D: LOCATE 13, 5: PRINT S_954A$  ' bytes 636D..6384; 'You Are All Dead'
L_65D4: LOCATE 19, 26: PRINT S_95C2$  ' bytes 65D4..65EB; 'enemies'
L_65FB: LOCATE 19, 26: PRINT S_95DA$  ' bytes 65FB..6612; 'surprise you'
L_6658: LOCATE 24, 6: PRINT S_95FA$  ' bytes 6658..666F; 'Press SPACEBAR'
L_6F60: LOCATE 15, 2: PRINT S_970A$  ' bytes 6F60..6F77; 'Nothing unusual happens'
L_6F87: LOCATE 15, 2: PRINT S_9726$  ' bytes 6F87..6F9E; 'Not valid or possible  '
L_6FAE: LOCATE 15, 2: PRINT S_9742$  ' bytes 6FAE..6FC5; 'What?                  '
L_706C: LOCATE 13, 2: PRINT S_975E$  ' bytes 706C..7083; 'Enter Amount:'

```

## Complete offset transcription

### Entry and loading

```basic
L_0040: BX = &H8278
L_0043: DX = &H8274
L_0046: S_8274$ = S_8278$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_0049: DI = &H827C
L_004C: SI = &H19A4
L_004F: CompareLeft! = N_19A4!: CompareRight! = N_827C!  ' RT3F_9F
L_0052: IF CompareLeft! = CompareRight! THEN GOTO L_0057  ' flags from L_004F
L_0054: GOTO L_0060
L_0057: BX = &H8280
L_005A: S(DX) = S_8280$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_005D: GOTO L_0077
L_0060: DI = &H8286
L_0063: SI = &H19A4
L_0066: CompareLeft! = N_19A4!: CompareRight! = N_8286!  ' RT3F_9F
L_0069: IF CompareLeft! = CompareRight! THEN GOTO L_006E  ' flags from L_0066
L_006B: GOTO L_0077
L_006E: BX = &H828A
L_0071: DX = &H8274
L_0074: S_8274$ = S_828A$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_0077: BX = &H829C
L_007A: DX = &H8290
L_007D: S_8290$ = S_829C$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_0080: BX = &H82AE
L_0083: DX = &H8294
L_0086: S_8294$ = S_82AE$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_0089: BX = &H82C0
L_008C: DX = &H8298
L_008F: S_8298$ = S_82C0$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_0092: DI = &H19C4
L_0095: SI = &H827C
L_0098: RT3F_97(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H827C, DI=&H19C4)  ' RT3F_97
L_009B: DI = &H82D2
L_009E: N_82D2! = FAC!: SI = &H001A  ' RT3F_7D
L_00A1: BX = &H82D6
L_00A4: FAC! = CSNG(BX)  ' RT3F_57
L_00A7: BX = &H87A2
L_00AA: AX = &H8274
L_00AD: RT3F_55(AX=&H8274, BX=&H87A2, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_00B0: DX = &H1A
L_00B3: BLOAD S(BX), N(DX)  ' RT3E_1A; M data-lane BLOAD; N(&H001A)=FAC!
L_00B6: SI = &H87AE
L_00B9: CompareLeft! = N_87AE!: CompareRight! = 0  ' RT3F_A7
L_00BC: IF CompareLeft! <> CompareRight! THEN GOTO L_00C1  ' flags from L_00B9
L_00BE: GOTO L_00D0
L_00C1: BX = &H1850
L_00C4: FAC! = CSNG(BX)  ' RT3F_57
L_00C7: BX = &H87B2
L_00CA: DX = &H1A
L_00CD: BLOAD S_87B2$, N(DX)  ' RT3E_1A; M data-lane BLOAD; N(&H001A)=FAC!
L_00D0: BX = &H87CA
L_00D3: DX = &H87BE
L_00D6: S_87BE$ = S_87CA$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_00D9: BX = &H87D2
L_00DC: DX = &H87C2
L_00DF: S_87C2$ = S_87D2$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_00E2: BX = &H87DA
L_00E5: DX = &H87C6
L_00E8: S_87C6$ = S_87DA$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_00EB: SI = &H87AE
L_00EE: CompareLeft! = N_87AE!: CompareRight! = 0  ' RT3F_A7
L_00F1: IF CompareLeft! <> CompareRight! THEN GOTO L_00F6  ' flags from L_00EE
L_00F3: GOTO L_0303
L_00F6: BX = &H40F4
L_00F9: FAC! = CSNG(BX)  ' RT3F_57
L_00FC: BX = &H87E2
L_00FF: DX = &H1A
L_0102: BLOAD S_87E2$, N(DX)  ' RT3E_1A; M data-lane BLOAD; N(&H001A)=FAC!
L_0105: BX = 0
L_0107: RT3E_20(AX=AX, BX=0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_20
L_010A: CX = BX
L_010C: BX = 1
L_010F: DX = &H87EA
L_0112: RT3E_1E(AX=AX, BX=1, CX=CX, DX=&H87EA, SI=SI, DI=DI)  ' RT3E_1E
L_0115: SI = &H827C
L_0118: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_011B: GOTO L_0146
L_011E: BX = 1
L_0121: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_0124: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04])  ' RT3F_B7
L_0129: SI = &H87F2
L_012C: BX = SI
L_012E: DX = BX
L_0130: BX = CINT(N_87F2!)  ' RT3F_75
L_0133: BX = BX * (2 ^ 1)
L_0135: BX = BX * (2 ^ 1)
L_0137: BX = BX + &H42AC
L_013B: RT3F_B8(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=DI)  ' RT3F_B8
L_013E: SI = DX
L_0140: DI = &H827C
L_0143: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_0146: DI = &H87F2
L_0149: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_014C: SI = DI
L_014E: DI = &H87F6
L_0151: CompareLeft! = N_87F2!: CompareRight! = N_87F6!  ' RT3F_9F
L_0154: IF CompareLeft! <= CompareRight! THEN GOTO L_011E  ' flags from L_0151
L_0156: SI = &H87FA
L_0159: FAC! = N_87FA!: DI = &H001E  ' RT3F_6F
L_015C: GOTO L_0188
L_015F: ' Alignment NOP
L_0160: BX = 1
L_0163: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_0166: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04])  ' RT3F_B7
L_016B: SI = &H87F2
L_016E: BX = SI
L_0170: DX = BX
L_0172: BX = CINT(N_87F2!)  ' RT3F_75
L_0175: BX = BX * (2 ^ 1)
L_0177: BX = BX * (2 ^ 1)
L_0179: BX = BX + &H42E4
L_017D: RT3F_B8(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=DI)  ' RT3F_B8
L_0180: SI = DX
L_0182: DI = &H827C
L_0185: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_0188: DI = &H87F2
L_018B: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_018E: SI = DI
L_0190: DI = &H87FE
L_0193: CompareLeft! = N_87F2!: CompareRight! = N_87FE!  ' RT3F_9F
L_0196: IF CompareLeft! <= CompareRight! THEN GOTO L_0160  ' flags from L_0193
L_0198: SI = &H87FA
L_019B: FAC! = N_87FA!: DI = &H001E  ' RT3F_6F
L_019E: GOTO L_01BC
L_01A1: ' Alignment NOP
L_01A2: BX = 1
L_01A5: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_01A8: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04])  ' RT3F_B7
L_01AD: BX = &H8802
L_01B0: RT3F_B8(AX=AX, BX=&H8802, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B8
L_01B3: DI = &H827C
L_01B6: SI = &H87F2
L_01B9: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_01BC: DI = &H87F2
L_01BF: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_01C2: SI = DI
L_01C4: DI = &H8806
L_01C7: CompareLeft! = N_87F2!: CompareRight! = N_8806!  ' RT3F_9F
L_01CA: IF CompareLeft! <= CompareRight! THEN GOTO L_01A2  ' flags from L_01C7
L_01CC: SI = &H87FA
L_01CF: FAC! = N_87FA!: DI = &H001E  ' RT3F_6F
L_01D2: GOTO L_01FE
L_01D5: ' Alignment NOP
L_01D6: BX = 1
L_01D9: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_01DC: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04])  ' RT3F_B7
L_01E1: SI = &H87F2
L_01E4: BX = SI
L_01E6: DX = BX
L_01E8: BX = CINT(N_87F2!)  ' RT3F_75
L_01EB: BX = BX * (2 ^ 1)
L_01ED: BX = BX * (2 ^ 1)
L_01EF: BX = BX + &H4534
L_01F3: RT3F_B8(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=DI)  ' RT3F_B8
L_01F6: SI = DX
L_01F8: DI = &H827C
L_01FB: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_01FE: DI = &H87F2
L_0201: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_0204: SI = DI
L_0206: DI = &H880A
L_0209: CompareLeft! = N_87F2!: CompareRight! = N_880A!  ' RT3F_9F
L_020C: IF CompareLeft! <= CompareRight! THEN GOTO L_01D6  ' flags from L_0209
L_020E: SI = &H827C
L_0211: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_0214: GOTO L_0232
L_0217: ' Alignment NOP
L_0218: BX = 1
L_021B: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_021E: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04])  ' RT3F_B7
L_0223: BX = &H8802
L_0226: RT3F_B8(AX=AX, BX=&H8802, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B8
L_0229: DI = &H827C
L_022C: SI = &H87F2
L_022F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_0232: DI = &H87F2
L_0235: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_0238: SI = DI
L_023A: DI = &H880E
L_023D: CompareLeft! = N_87F2!: CompareRight! = N_880E!  ' RT3F_9F
L_0240: IF CompareLeft! <= CompareRight! THEN GOTO L_0218  ' flags from L_023D
L_0242: SI = &H87FA
L_0245: FAC! = N_87FA!: DI = &H001E  ' RT3F_6F
L_0248: GOTO L_0274
L_024B: ' Alignment NOP
L_024C: BX = 1
L_024F: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_0252: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04])  ' RT3F_B7
L_0257: SI = &H87F2
L_025A: BX = SI
L_025C: DX = BX
L_025E: BX = CINT(N_87F2!)  ' RT3F_75
L_0261: BX = BX * (2 ^ 1)
L_0263: BX = BX * (2 ^ 1)
L_0265: BX = BX + &H4870
L_0269: RT3F_B8(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=DI)  ' RT3F_B8
L_026C: SI = DX
L_026E: DI = &H827C
L_0271: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_0274: DI = &H87F2
L_0277: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_027A: SI = DI
L_027C: DI = &H8812
L_027F: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_0282: IF CompareLeft! <= CompareRight! THEN GOTO L_024C  ' flags from L_027F
L_0284: BX = 1
L_0287: RT3E_21(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_21
L_028A: BX = 0
L_028C: RT3E_20(AX=AX, BX=0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_20
L_028F: CX = BX
L_0291: BX = 1
L_0294: DX = &H8816
L_0297: RT3E_1E(AX=AX, BX=1, CX=CX, DX=&H8816, SI=SI, DI=DI)  ' RT3E_1E
L_029A: BX = 1
L_029D: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_02A0: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04, &H04, &H04])  ' RT3F_B7
L_02A7: BX = &H488C
L_02AA: RT3F_B8(AX=AX, BX=&H488C, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B8
L_02AD: BX = &H8822
L_02B0: RT3F_B8(AX=AX, BX=&H8822, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B8
L_02B3: BX = &H8826
L_02B6: RT3F_B8(AX=AX, BX=&H8826, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B8
L_02B9: SI = &H827C
L_02BC: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_02BF: GOTO L_02EA
L_02C2: BX = 1
L_02C5: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_02C8: RT3F_B7(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTypes=[&H04])  ' RT3F_B7
L_02CD: SI = &H87F2
L_02D0: BX = SI
L_02D2: DX = BX
L_02D4: BX = CINT(N_87F2!)  ' RT3F_75
L_02D7: BX = BX * (2 ^ 1)
L_02D9: BX = BX * (2 ^ 1)
L_02DB: BX = BX + &H4288
L_02DF: RT3F_B8(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=DI)  ' RT3F_B8
L_02E2: SI = DX
L_02E4: DI = &H827C
L_02E7: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_02EA: DI = &H87F2
L_02ED: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_02F0: SI = DI
L_02F2: DI = &H8812
L_02F5: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_02F8: IF CompareLeft! <= CompareRight! THEN GOTO L_02C2  ' flags from L_02F5
L_02FA: BX = 1
L_02FD: RT3E_21(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_21
L_0300: GOTO L_0356
L_0303: SI = &H827C
L_0306: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_0309: GOTO L_0346
L_030C: DI = &H8286
L_030F: SI = &H87F2
L_0312: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8286)  ' RT3F_7F
L_0315: BX = SI
L_0317: DX = BX
L_0319: BX = CINT(FAC!)  ' RT3F_77
L_031C: SI = BX
L_031E: SI = SI * (2 ^ 1)
L_0320: SI = SI * (2 ^ 1)
L_0322: SI = SI + &H4288
L_0326: SWAP DX, SI
L_0328: BX = SI
L_032A: CX = BX
L_032C: BX = CINT(N(SI))  ' RT3F_75
L_032F: DI = BX
L_0331: DI = DI * (2 ^ 1)
L_0333: DI = DI * (2 ^ 1)
L_0335: DI = DI + &H4288
L_0339: SI = DX
L_033B: RT3F_14(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_14
L_033E: SI = CX
L_0340: DI = &H827C
L_0343: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_0346: DI = &H87F2
L_0349: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_034C: SI = DI
L_034E: DI = &H8812
L_0351: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_0354: IF CompareLeft! <= CompareRight! THEN GOTO L_030C  ' flags from L_0351
L_0356: GOTO L_0388

```

### Data/index helpers

```basic
L_0359: DI = &H8832
L_035C: SI = &H882E
L_035F: FAC! = N_882E! * N_8832!  ' RT3F_8F
L_0362: DI = &H882A
L_0365: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H882A)  ' RT3F_81
L_0368: DI = &H8836
L_036B: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8836)  ' RT3F_81
L_036E: BX = CINT(FAC!)  ' RT3F_77
L_0371: SI = BX
L_0373: SI = SI * (2 ^ 1)
L_0375: SI = SI * (2 ^ 1)
L_0377: SI = SI + &H1850
L_037B: DI = &H883A
L_037E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H883A)  ' RT3F_7F
L_0381: BX = &H1A
L_0384: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_0387: RETURN
L_0388: GOTO L_03A7
L_038B: DI = &H8832
L_038E: SI = &H8842
L_0391: FAC! = N_8842! * N_8832!  ' RT3F_8F
L_0394: DI = &H883E
L_0397: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H883E)  ' RT3F_81
L_039A: DI = &H8846
L_039D: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8846)  ' RT3F_81
L_03A0: BX = &H1A
L_03A3: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_03A6: RETURN
L_03A7: GOTO L_03C6
L_03AA: DI = &H884E
L_03AD: SI = &H1988
L_03B0: FAC! = N_1988! * N_884E!  ' RT3F_8F
L_03B3: DI = &H198C
L_03B6: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H198C)  ' RT3F_81
L_03B9: DI = &H8852
L_03BC: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8852)  ' RT3F_81
L_03BF: BX = &H1A
L_03C2: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_03C5: RETURN
L_03C6: GOTO L_03ED
L_03C9: DI = &H885E
L_03CC: SI = &H8856
L_03CF: FAC! = N_8856! * N_885E!  ' RT3F_8F
L_03D2: DI = &H885A
L_03D5: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H885A)  ' RT3F_81
L_03D8: DI = &H8862
L_03DB: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8862)  ' RT3F_81
L_03DE: BX = CINT(FAC!)  ' RT3F_77
L_03E1: DI = BX
L_03E3: DI = DI * (2 ^ 1)
L_03E5: BX = WORD(DI + &H48B0)
L_03E9: FAC! = CSNG(BX)  ' RT3F_57
L_03EC: RETURN
L_03ED: GOTO L_0406
L_03F0: DI = &H885E
L_03F3: SI = &H8866
L_03F6: FAC! = N_8866! * N_885E!  ' RT3F_8F
L_03F9: DI = &H886A
L_03FC: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H886A)  ' RT3F_81
L_03FF: DI = &H8862
L_0402: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8862)  ' RT3F_81
L_0405: RETURN
L_0406: GOTO L_0427
L_0409: DI = &H8872
L_040C: SI = &H48A4
L_040F: FAC! = N_48A4! * N_8872!  ' RT3F_8F
L_0412: DI = &H48A0
L_0415: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H48A0)  ' RT3F_81
L_0418: BX = CINT(FAC!)  ' RT3F_77
L_041B: DI = BX
L_041D: DI = DI * (2 ^ 1)
L_041F: BX = WORD(DI + &H48B0)
L_0423: FAC! = CSNG(BX)  ' RT3F_57
L_0426: RETURN

```

### Entry confirmations and preparation

```basic
L_0427: SI = &H87AE
L_042A: CompareLeft! = N_87AE!: CompareRight! = 0  ' RT3F_A7
L_042D: IF CompareLeft! <> CompareRight! THEN GOTO L_0432  ' flags from L_042A
L_042F: GOTO L_068E
L_0432: GOSUB L_14CA
L_0435: BX = &H14
L_0438: LocateRow% = BX  ' RT3E_42
L_043B: BX = 2
L_043E: LOCATE LocateRow%, BX  ' RT3E_44
L_0441: ' PRINT statement begins
L_0444: BX = &H8876
L_0447: PRINT S_8876$;  ' RT3F_6A; separator/format variant retained by RT tag
L_044A: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_044D: GOSUB L_1ABD
L_0450: SI = &H888A
L_0453: CompareLeft! = N_888A!: CompareRight! = 0  ' RT3F_A7
L_0456: IF CompareLeft! <> CompareRight! THEN GOTO L_045B  ' flags from L_0453
L_0458: GOTO L_068E
L_045B: DI = &H883E
L_045E: SI = &H888E
L_0461: N_883E! = N_888E!  ' RT3F_7B
L_0464: BX = DI
L_0466: DI = &H8842
L_0469: SI = &H8892
L_046C: N_8842! = N_8892!  ' RT3F_7B
L_046F: GOSUB L_038B
L_0472: BX = CINT(FAC!)  ' RT3F_77
L_0475: DI = BX
L_0477: DI = DI * (2 ^ 1)
L_0479: DI = DI * (2 ^ 1)
L_047B: DI = DI + &H1850
L_047F: SI = &H827C
L_0482: N(DI) = N_827C!  ' RT3F_7B
L_0485: DI = &H883E
L_0488: SI = &H8896
L_048B: N_883E! = N_8896!  ' RT3F_7B
L_048E: DI = &H8842
L_0491: SI = &H889A
L_0494: N_8842! = N_889A!  ' RT3F_7B
L_0497: GOSUB L_038B
L_049A: BX = CINT(FAC!)  ' RT3F_77
L_049D: DI = BX
L_049F: DI = DI * (2 ^ 1)
L_04A1: DI = DI * (2 ^ 1)
L_04A3: DI = DI + &H1850
L_04A7: SI = &H889E
L_04AA: N(DI) = N_889E!  ' RT3F_7B
L_04AD: SI = &H88A2
L_04B0: FAC! = N_88A2!: DI = &H001E  ' RT3F_6F
L_04B3: GOTO L_0537
L_04B6: SI = &H87F2
L_04B9: BX = SI
L_04BB: DX = BX
L_04BD: BX = CINT(N_87F2!)  ' RT3F_75
L_04C0: DI = BX
L_04C2: DI = DI * (2 ^ 1)
L_04C4: DI = DI * (2 ^ 1)
L_04C6: DI = DI + &H1850
L_04CA: SI = &H88A6
L_04CD: N(DI) = N_88A6!  ' RT3F_7B
L_04D0: SWAP DX, SI
L_04D2: DI = &H8286
L_04D5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H88A6, SI=&H87F2, DI=&H8286)  ' RT3F_7F
L_04D8: BX = CINT(FAC!)  ' RT3F_77
L_04DB: DI = BX
L_04DD: DI = DI * (2 ^ 1)
L_04DF: DI = DI * (2 ^ 1)
L_04E1: DI = DI + &H1850
L_04E5: SI = &H88AA
L_04E8: N(DI) = N_88AA!  ' RT3F_7B
L_04EB: SWAP DX, SI
L_04ED: DI = &H827C
L_04F0: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H88AA, SI=SI, DI=&H827C)  ' RT3F_7F
L_04F3: SWAP SI, DI
L_04F5: BX = SI
L_04F7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_04FA: SI = DI
L_04FC: DI = &H885E
L_04FF: CompareLeft! = N(SI): CompareRight! = N_885E!  ' RT3F_9F
L_0502: IF CompareLeft! > CompareRight! THEN GOTO L_0507  ' flags from L_04FF
L_0504: GOTO L_052E
L_0507: DI = SI
L_0509: SWAP BX, SI
L_050B: N(DI) = N(SI)  ' RT3F_7B
L_050E: DI = SI
L_0510: SWAP DX, SI
L_0512: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_0515: SWAP SI, DI
L_0517: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_051A: SI = DI
L_051C: DI = &H88AE
L_051F: CompareLeft! = N(SI): CompareRight! = N_88AE!  ' RT3F_9F
L_0522: IF CompareLeft! > CompareRight! THEN GOTO L_0527  ' flags from L_051F
L_0524: GOTO L_052E
L_0527: DI = SI
L_0529: SWAP DX, SI
L_052B: N(DI) = N(SI)  ' RT3F_7B
L_052E: DI = &H88B2
L_0531: SI = &H87F2
L_0534: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88B2)  ' RT3F_7F
L_0537: DI = &H87F2
L_053A: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_053D: SI = DI
L_053F: DI = &H88B6
L_0542: CompareLeft! = N_87F2!: CompareRight! = N_88B6!  ' RT3F_9F
L_0545: IF CompareLeft! > CompareRight! THEN GOTO L_054A  ' flags from L_0542
L_0547: GOTO L_04B6
L_054A: SI = &H827C
L_054D: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_0550: GOTO L_0629
L_0553: ' Alignment NOP
L_0554: DI = &H883E
L_0557: SI = &H87FE
L_055A: N_883E! = N_87FE!  ' RT3F_7B
L_055D: BX = DI
L_055F: DI = &H8842
L_0562: SI = &H87F2
L_0565: N_8842! = N_87F2!  ' RT3F_7B
L_0568: GOSUB L_038B
L_056B: BX = CINT(FAC!)  ' RT3F_77
L_056E: DI = BX
L_0570: DI = DI * (2 ^ 1)
L_0572: DI = DI * (2 ^ 1)
L_0574: DI = DI + &H1850
L_0578: BX = DI
L_057A: DI = &H882A
L_057D: SI = &H88BA
L_0580: N_882A! = N_88BA!  ' RT3F_7B
L_0583: DI = &H882E
L_0586: SI = &H87F2
L_0589: N_882E! = N_87F2!  ' RT3F_7B
L_058C: WORD(BP - 6) = BX
L_058F: GOSUB L_0359
L_0592: DI = &H88BE
L_0595: FAC! = FAC! * N_88BE!  ' RT3F_91
L_0598: BX = &H1A
L_059B: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_059E: DI = WORD(BP - 6)
L_05A1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_05A4: DI = &H883E
L_05A7: SI = &H88C2
L_05AA: N_883E! = N_88C2!  ' RT3F_7B
L_05AD: BX = DI
L_05AF: DI = &H8842
L_05B2: SI = &H87F2
L_05B5: N_8842! = N_87F2!  ' RT3F_7B
L_05B8: GOSUB L_038B
L_05BB: BX = CINT(FAC!)  ' RT3F_77
L_05BE: DI = BX
L_05C0: DI = DI * (2 ^ 1)
L_05C2: DI = DI * (2 ^ 1)
L_05C4: DI = DI + &H1850
L_05C8: SI = &H88B2
L_05CB: N(DI) = N_88B2!  ' RT3F_7B
L_05CE: DI = &H883E
L_05D1: SI = &H88C6
L_05D4: N_883E! = N_88C6!  ' RT3F_7B
L_05D7: BX = DI
L_05D9: DI = &H8842
L_05DC: SI = &H87F2
L_05DF: N_8842! = N_87F2!  ' RT3F_7B
L_05E2: GOSUB L_038B
L_05E5: BX = CINT(FAC!)  ' RT3F_77
L_05E8: DI = BX
L_05EA: DI = DI * (2 ^ 1)
L_05EC: DI = DI * (2 ^ 1)
L_05EE: DI = DI + &H1850
L_05F2: SI = &H88AE
L_05F5: N(DI) = N_88AE!  ' RT3F_7B
L_05F8: DI = &H883E
L_05FB: SI = &H88CA
L_05FE: N_883E! = N_88CA!  ' RT3F_7B
L_0601: DI = &H8842
L_0604: SI = &H87F2
L_0607: N_8842! = N_87F2!  ' RT3F_7B
L_060A: GOSUB L_038B
L_060D: BX = CINT(FAC!)  ' RT3F_77
L_0610: DI = BX
L_0612: DI = DI * (2 ^ 1)
L_0614: DI = DI * (2 ^ 1)
L_0616: DI = DI + &H1850
L_061A: SI = &H8286
L_061D: N(DI) = N_8286!  ' RT3F_7B
L_0620: DI = &H827C
L_0623: SI = &H87F2
L_0626: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_0629: DI = &H87F2
L_062C: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_062F: SI = DI
L_0631: DI = &H8812
L_0634: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_0637: IF CompareLeft! > CompareRight! THEN GOTO L_063C  ' flags from L_0634
L_0639: GOTO L_0554
L_063C: DI = &H883E
L_063F: SI = &H87FA
L_0642: N_883E! = N_87FA!  ' RT3F_7B
L_0645: BX = DI
L_0647: DI = &H8842
L_064A: SI = &H889E
L_064D: N_8842! = N_889E!  ' RT3F_7B
L_0650: GOSUB L_038B
L_0653: BX = CINT(FAC!)  ' RT3F_77
L_0656: DI = BX
L_0658: DI = DI * (2 ^ 1)
L_065A: DI = DI * (2 ^ 1)
L_065C: DI = DI + &H1850
L_0660: SI = &H88CE
L_0663: N(DI) = N_88CE!  ' RT3F_7B
L_0666: DI = &H883E
L_0669: SI = &H827C
L_066C: N_883E! = N_827C!  ' RT3F_7B
L_066F: DI = &H8842
L_0672: SI = &H889E
L_0675: N_8842! = N_889E!  ' RT3F_7B
L_0678: GOSUB L_038B
L_067B: BX = CINT(FAC!)  ' RT3F_77
L_067E: DI = BX
L_0680: DI = DI * (2 ^ 1)
L_0682: DI = DI * (2 ^ 1)
L_0684: DI = DI + &H1850
L_0688: SI = &H88D2
L_068B: N(DI) = N_88D2!  ' RT3F_7B
L_068E: RT3D_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_43
L_0691: BX = &H1A
L_0694: RT3E_09(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_09
L_0697: GOSUB L_0DEE
L_069A: DI = &H889E
L_069D: SI = &H3AF0
L_06A0: CompareLeft! = N_3AF0!: CompareRight! = N_889E!  ' RT3F_9F
L_06A3: IF CompareLeft! <= CompareRight! THEN GOTO L_06A8  ' flags from L_06A0
L_06A5: GOTO L_06CF
L_06A8: DI = &H88D6
L_06AB: SI = &H88E2
L_06AE: N_88D6! = N_88E2!  ' RT3F_7B
L_06B1: DI = &H88DA
L_06B4: SI = &H88E6
L_06B7: N_88DA! = N_88E6!  ' RT3F_7B
L_06BA: DI = &H88DE
L_06BD: SI = &H88EA
L_06C0: N_88DE! = N_88EA!  ' RT3F_7B
L_06C3: DI = &H3B78
L_06C6: SI = &H880A
L_06C9: N_3B78! = N_880A!  ' RT3F_7B
L_06CC: GOTO L_07D0
L_06CF: DI = &H8812
L_06D2: SI = &H3AF0
L_06D5: CompareLeft! = N_3AF0!: CompareRight! = N_8812!  ' RT3F_9F
L_06D8: IF CompareLeft! <= CompareRight! THEN GOTO L_06DD  ' flags from L_06D5
L_06DA: GOTO L_06FB
L_06DD: DI = &H88D6
L_06E0: SI = &H88D2
L_06E3: N_88D6! = N_88D2!  ' RT3F_7B
L_06E6: DI = &H88DA
L_06E9: SI = &H88EE
L_06EC: N_88DA! = N_88EE!  ' RT3F_7B
L_06EF: DI = &H88DE
L_06F2: SI = &H88F2
L_06F5: N_88DE! = N_88F2!  ' RT3F_7B
L_06F8: GOTO L_07D0
L_06FB: DI = &H880A
L_06FE: SI = &H3AF0
L_0701: CompareLeft! = N_3AF0!: CompareRight! = N_880A!  ' RT3F_9F
L_0704: IF CompareLeft! <= CompareRight! THEN GOTO L_0709  ' flags from L_0701
L_0706: GOTO L_0727
L_0709: DI = &H88D6
L_070C: SI = &H889E
L_070F: N_88D6! = N_889E!  ' RT3F_7B
L_0712: DI = &H88DA
L_0715: SI = &H88F6
L_0718: N_88DA! = N_88F6!  ' RT3F_7B
L_071B: DI = &H88DE
L_071E: SI = &H88FA
L_0721: N_88DE! = N_88FA!  ' RT3F_7B
L_0724: GOTO L_07D0
L_0727: DI = &H88FE
L_072A: SI = &H3AF0
L_072D: CompareLeft! = N_3AF0!: CompareRight! = N_88FE!  ' RT3F_9F
L_0730: IF CompareLeft! <= CompareRight! THEN GOTO L_0735  ' flags from L_072D
L_0732: GOTO L_0754
L_0735: DI = &H88D6
L_0738: SI = &H88B2
L_073B: N_88D6! = N_88B2!  ' RT3F_7B
L_073E: DI = &H88DA
L_0741: BX = SI
L_0743: SI = &H88E2
L_0746: N_88DA! = N_88E2!  ' RT3F_7B
L_0749: SI = BX
L_074B: DI = &H88DE
L_074E: N_88DE! = N_88B2!  ' RT3F_7B
L_0751: GOTO L_07D0
L_0754: DI = &H88EE
L_0757: SI = &H3AF0
L_075A: CompareLeft! = N_3AF0!: CompareRight! = N_88EE!  ' RT3F_9F
L_075D: IF CompareLeft! <= CompareRight! THEN GOTO L_0762  ' flags from L_075A
L_075F: GOTO L_0780
L_0762: DI = &H88D6
L_0765: SI = &H8812
L_0768: N_88D6! = N_8812!  ' RT3F_7B
L_076B: DI = &H88DA
L_076E: SI = &H88B2
L_0771: N_88DA! = N_88B2!  ' RT3F_7B
L_0774: DI = &H88DE
L_0777: SI = &H88AE
L_077A: N_88DE! = N_88AE!  ' RT3F_7B
L_077D: GOTO L_07D0
L_0780: DI = &H8902
L_0783: SI = &H3AF0
L_0786: CompareLeft! = N_3AF0!: CompareRight! = N_8902!  ' RT3F_9F
L_0789: IF CompareLeft! <= CompareRight! THEN GOTO L_078E  ' flags from L_0786
L_078B: GOTO L_07B5
L_078E: DI = &H88D6
L_0791: SI = &H827C
L_0794: N_88D6! = N_827C!  ' RT3F_7B
L_0797: DI = &H88DA
L_079A: SI = &H88EE
L_079D: N_88DA! = N_88EE!  ' RT3F_7B
L_07A0: DI = &H88DE
L_07A3: SI = &H88AE
L_07A6: N_88DE! = N_88AE!  ' RT3F_7B
L_07A9: DI = &H3B78
L_07AC: SI = &H880A
L_07AF: N_3B78! = N_880A!  ' RT3F_7B
L_07B2: GOTO L_07D0
L_07B5: DI = &H88D6
L_07B8: SI = &H8286
L_07BB: N_88D6! = N_8286!  ' RT3F_7B
L_07BE: DI = &H88DA
L_07C1: SI = &H8906
L_07C4: N_88DA! = N_8906!  ' RT3F_7B
L_07C7: DI = &H88DE
L_07CA: SI = &H890A
L_07CD: N_88DE! = N_890A!  ' RT3F_7B
L_07D0: DI = &H827C
L_07D3: SI = &H87AE
L_07D6: CompareLeft! = N_87AE!: CompareRight! = N_827C!  ' RT3F_9F
L_07D9: IF CompareLeft! = CompareRight! THEN GOTO L_07DE  ' flags from L_07D6
L_07DB: GOTO L_07F9
L_07DE: DI = &H88D6
L_07E1: SI = &H8812
L_07E4: N_88D6! = N_8812!  ' RT3F_7B
L_07E7: DI = &H88DA
L_07EA: SI = &H88B2
L_07ED: N_88DA! = N_88B2!  ' RT3F_7B
L_07F0: DI = &H88DE
L_07F3: SI = &H88AE
L_07F6: N_88DE! = N_88AE!  ' RT3F_7B
L_07F9: DI = &H827C
L_07FC: SI = &H87AE
L_07FF: CompareLeft! = N_87AE!: CompareRight! = N_827C!  ' RT3F_9F
L_0802: BX = 0
L_0805: IF CompareLeft! <> CompareRight! THEN GOTO L_0808  ' flags from L_07FF
L_0807: BX = BX - 1
L_0808: SI = &H3B8C
L_080B: CompareLeft! = N_3B8C!: CompareRight! = 0  ' RT3F_A7
L_080E: DX = 0
L_0811: IF CompareLeft! <> CompareRight! THEN GOTO L_0814  ' flags from L_080B
L_0813: DX = DX - 1
L_0814: DX = DX OR BX
L_0816: CompareLeft% = DX: CompareRight% = 0
L_0818: IF CompareLeft% <> CompareRight% THEN GOTO L_081D  ' flags from L_0816
L_081A: GOTO L_0823
L_081D: GOSUB L_63F9
L_0820: GOTO L_0829
L_0823: GOSUB L_6473
L_0826: GOSUB L_13E5
L_0829: DI = &H88B2
L_082C: SI = &H88D6
L_082F: CompareLeft! = N_88D6!: CompareRight! = N_88B2!  ' RT3F_9F
L_0832: BX = 0
L_0835: IF CompareLeft! <> CompareRight! THEN GOTO L_0838  ' flags from L_082F
L_0837: BX = BX - 1
L_0838: DI = &H8812
L_083B: CompareLeft! = N(SI): CompareRight! = N_8812!  ' RT3F_9F
L_083E: DX = 0
L_0841: IF CompareLeft! <> CompareRight! THEN GOTO L_0844  ' flags from L_083B
L_0843: DX = DX - 1
L_0844: DX = DX OR BX
L_0846: SI = &H87AE
L_0849: CompareLeft! = N_87AE!: CompareRight! = 0  ' RT3F_A7
L_084C: BX = 0
L_084F: IF CompareLeft! <> CompareRight! THEN GOTO L_0852  ' flags from L_0849
L_0851: BX = BX - 1
L_0852: BX = BX AND DX
L_0854: CompareLeft% = BX: CompareRight% = 0
L_0856: IF CompareLeft% <> CompareRight% THEN GOTO L_085B  ' flags from L_0854
L_0858: GOTO L_0867
L_085B: DI = &H3B80
L_085E: SI = &H890E
L_0861: N_3B80! = N_890E!  ' RT3F_7B
L_0864: GOTO L_0870
L_0867: DI = &H3B80
L_086A: SI = &H827C
L_086D: N_3B80! = N_827C!  ' RT3F_7B
L_0870: DI = &H827C
L_0873: SI = &H3B80
L_0876: CompareLeft! = N_3B80!: CompareRight! = N_827C!  ' RT3F_9F
L_0879: BX = 0
L_087C: IF CompareLeft! <> CompareRight! THEN GOTO L_087F  ' flags from L_0876
L_087E: BX = BX - 1
L_087F: SI = &H3B8C
L_0882: CompareLeft! = N_3B8C!: CompareRight! = 0  ' RT3F_A7
L_0885: DX = 0
L_0888: IF CompareLeft! = CompareRight! THEN GOTO L_088B  ' flags from L_0882
L_088A: DX = DX - 1
L_088B: DX = DX OR BX
L_088D: CompareLeft% = DX: CompareRight% = 0
L_088F: IF CompareLeft% = CompareRight% THEN GOTO L_0894  ' flags from L_088D
L_0891: GOTO L_0CDF
L_0894: GOSUB L_13C5
L_0897: GOSUB L_1378
L_089A: BX = 4
L_089D: LocateRow% = BX  ' RT3E_42
L_08A0: BX = 2
L_08A3: LOCATE LocateRow%, BX  ' RT3E_44
L_08A6: ' PRINT statement begins
L_08A9: DX = BX
L_08AB: BX = &H8912
L_08AE: PRINT S_8912$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_08B1: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_08B4: BX = 0xA
L_08B7: LocateRow% = BX  ' RT3E_42
L_08BA: BX = DX
L_08BC: LOCATE LocateRow%, BX  ' RT3E_44
L_08BF: ' PRINT statement begins
L_08C2: BX = &H892E
L_08C5: PRINT S_892E$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_08C8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_08CB: BX = 0xB
L_08CE: LocateRow% = BX  ' RT3E_42
L_08D1: BX = DX
L_08D3: LOCATE LocateRow%, BX  ' RT3E_44
L_08D6: ' PRINT statement begins
L_08D9: BX = &H8944
L_08DC: PRINT S_8944$;  ' RT3F_6A; separator/format variant retained by RT tag
L_08DF: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_08E2: SI = &H827C
L_08E5: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_08E8: GOTO L_08F8
L_08EB: ' Alignment NOP
L_08EC: GOSUB L_0C62
L_08EF: DI = &H827C
L_08F2: SI = &H87F2
L_08F5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_08F8: DI = &H87F2
L_08FB: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_08FE: SI = DI
L_0900: DI = &H8812
L_0903: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_0906: IF CompareLeft! <= CompareRight! THEN GOTO L_08EC  ' flags from L_0903
L_0908: SI = &H88A2
L_090B: FAC! = N_88A2!: DI = &H001E  ' RT3F_6F
L_090E: GOTO L_0A13
L_0911: ' Alignment NOP
L_0912: DI = &H8286
L_0915: SI = &H8950
L_0918: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8950, DI=&H8286)  ' RT3F_7F
L_091B: BX = CINT(FAC!)  ' RT3F_77
L_091E: SI = BX
L_0920: SI = SI * (2 ^ 1)
L_0922: SI = SI * (2 ^ 1)
L_0924: SI = SI + &H1850
L_0928: DI = &H8954
L_092B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8954)  ' RT3F_7F
L_092E: DI = &H87F2
L_0931: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_0934: SI = DI
L_0936: DI = &H827C
L_0939: CompareLeft! = N_87F2!: CompareRight! = N_827C!  ' RT3F_9F
L_093C: IF CompareLeft! >= CompareRight! THEN GOTO L_0941  ' flags from L_0939
L_093E: GOTO L_0A0A
L_0941: SI = &H8950
L_0944: BX = CINT(N_8950!)  ' RT3F_75
L_0947: SI = BX
L_0949: SI = SI * (2 ^ 1)
L_094B: SI = SI * (2 ^ 1)
L_094D: SI = SI + &H1850
L_0951: DI = &H880A
L_0954: CompareLeft! = N(SI): CompareRight! = N_880A!  ' RT3F_9F
L_0957: IF CompareLeft! = CompareRight! THEN GOTO L_095C  ' flags from L_0954
L_0959: GOTO L_0984
L_095C: DI = &H883E
L_095F: SI = &H8958
L_0962: N_883E! = N_8958!  ' RT3F_7B
L_0965: DI = &H8842
L_0968: SI = &H87F2
L_096B: N_8842! = N_87F2!  ' RT3F_7B
L_096E: GOSUB L_038B
L_0971: BX = CINT(FAC!)  ' RT3F_77
L_0974: DI = BX
L_0976: DI = DI * (2 ^ 1)
L_0978: DI = DI * (2 ^ 1)
L_097A: DI = DI + &H1850
L_097E: SI = &H827C
L_0981: N(DI) = N_827C!  ' RT3F_7B
L_0984: SI = &H8950
L_0987: BX = CINT(N_8950!)  ' RT3F_75
L_098A: SI = BX
L_098C: SI = SI * (2 ^ 1)
L_098E: SI = SI * (2 ^ 1)
L_0990: SI = SI + &H1850
L_0994: DI = &H88AE
L_0997: CompareLeft! = N(SI): CompareRight! = N_88AE!  ' RT3F_9F
L_099A: IF CompareLeft! = CompareRight! THEN GOTO L_099F  ' flags from L_0997
L_099C: GOTO L_09C7
L_099F: DI = &H883E
L_09A2: SI = &H895C
L_09A5: N_883E! = N_895C!  ' RT3F_7B
L_09A8: DI = &H8842
L_09AB: SI = &H87F2
L_09AE: N_8842! = N_87F2!  ' RT3F_7B
L_09B1: GOSUB L_038B
L_09B4: BX = CINT(FAC!)  ' RT3F_77
L_09B7: DI = BX
L_09B9: DI = DI * (2 ^ 1)
L_09BB: DI = DI * (2 ^ 1)
L_09BD: DI = DI + &H1850
L_09C1: SI = &H827C
L_09C4: N(DI) = N_827C!  ' RT3F_7B
L_09C7: SI = &H8950
L_09CA: BX = CINT(N_8950!)  ' RT3F_75
L_09CD: SI = BX
L_09CF: SI = SI * (2 ^ 1)
L_09D1: SI = SI * (2 ^ 1)
L_09D3: SI = SI + &H1850
L_09D7: DI = &H8906
L_09DA: CompareLeft! = N(SI): CompareRight! = N_8906!  ' RT3F_9F
L_09DD: IF CompareLeft! = CompareRight! THEN GOTO L_09E2  ' flags from L_09DA
L_09DF: GOTO L_0A0A
L_09E2: DI = &H883E
L_09E5: SI = &H8960
L_09E8: N_883E! = N_8960!  ' RT3F_7B
L_09EB: DI = &H8842
L_09EE: SI = &H87F2
L_09F1: N_8842! = N_87F2!  ' RT3F_7B
L_09F4: GOSUB L_038B
L_09F7: BX = CINT(FAC!)  ' RT3F_77
L_09FA: DI = BX
L_09FC: DI = DI * (2 ^ 1)
L_09FE: DI = DI * (2 ^ 1)
L_0A00: DI = DI + &H1850
L_0A04: SI = &H827C
L_0A07: N(DI) = N_827C!  ' RT3F_7B
L_0A0A: DI = &H88B2
L_0A0D: SI = &H8950
L_0A10: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8950, DI=&H88B2)  ' RT3F_7F
L_0A13: DI = &H8950
L_0A16: N_8950! = FAC!: SI = &H001A  ' RT3F_7D
L_0A19: SI = DI
L_0A1B: DI = &H88B6
L_0A1E: CompareLeft! = N_8950!: CompareRight! = N_88B6!  ' RT3F_9F
L_0A21: IF CompareLeft! > CompareRight! THEN GOTO L_0A26  ' flags from L_0A1E
L_0A23: GOTO L_0912
L_0A26: DI = &H8964
L_0A29: SI = &H87FA
L_0A2C: N_8964! = N_87FA!  ' RT3F_7B
L_0A2F: SI = &H827C
L_0A32: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_0A35: GOTO L_0B19
L_0A38: DI = &H882A
L_0A3B: SI = &H888E
L_0A3E: N_882A! = N_888E!  ' RT3F_7B
L_0A41: BX = DI
L_0A43: DI = &H882E
L_0A46: SI = &H87F2
L_0A49: N_882E! = N_87F2!  ' RT3F_7B
L_0A4C: GOSUB L_0359
L_0A4F: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_0A52: IF (NOT CF AND NOT ZF) THEN GOTO L_0A57  ' flags from L_0A4F
L_0A54: GOTO L_0B10
L_0A57: DI = &H882A
L_0A5A: SI = &H8958
L_0A5D: N_882A! = N_8958!  ' RT3F_7B
L_0A60: BX = DI
L_0A62: DI = &H882E
L_0A65: SI = &H87F2
L_0A68: N_882E! = N_87F2!  ' RT3F_7B
L_0A6B: GOSUB L_0359
L_0A6E: DI = &H882A
L_0A71: SI = &H895C
L_0A74: N_882A! = N_895C!  ' RT3F_7B
L_0A77: BX = DI
L_0A79: DI = &H882E
L_0A7C: SI = &H87F2
L_0A7F: N_882E! = N_87F2!  ' RT3F_7B
L_0A82: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=DX, SI=&H87F2, DI=&H882E, inline=&H80)  ' RT3F_71
L_0A86: GOSUB L_0359
L_0A89: RT3F_95(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_95
L_0A8D: DI = &H882A
L_0A90: SI = &H8960
L_0A93: N_882A! = N_8960!  ' RT3F_7B
L_0A96: DI = &H882E
L_0A99: SI = &H87F2
L_0A9C: N_882E! = N_87F2!  ' RT3F_7B
L_0A9F: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H882E, inline=&H81)  ' RT3F_71
L_0AA3: GOSUB L_0359
L_0AA6: RT3F_95(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H81)  ' RT3F_95
L_0AAA: DI = &H8A68
L_0AAD: N_8A68! = FAC!: SI = &H001A  ' RT3F_7D
L_0AB0: GOSUB L_0C62
L_0AB3: DI = &H883E
L_0AB6: SI = &H8960
L_0AB9: N_883E! = N_8960!  ' RT3F_7B
L_0ABC: DI = &H8842
L_0ABF: SI = &H87F2
L_0AC2: N_8842! = N_87F2!  ' RT3F_7B
L_0AC5: GOSUB L_038B
L_0AC8: BX = CINT(FAC!)  ' RT3F_77
L_0ACB: DI = BX
L_0ACD: DI = DI * (2 ^ 1)
L_0ACF: DI = DI * (2 ^ 1)
L_0AD1: DI = DI + &H1850
L_0AD5: SI = &H8A68
L_0AD8: N(DI) = N_8A68!  ' RT3F_7B
L_0ADB: DI = &H827C
L_0ADE: CompareLeft! = N_8A68!: CompareRight! = N_827C!  ' RT3F_9F
L_0AE1: IF CompareLeft! = CompareRight! THEN GOTO L_0AE6  ' flags from L_0ADE
L_0AE3: GOTO L_0B07
L_0AE6: ' PRINT statement begins
L_0AE9: DI = &H8A6C
L_0AEC: SI = &H87F2
L_0AEF: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8A6C)  ' RT3F_7F
L_0AF2: BX = CINT(FAC!)  ' RT3F_77
L_0AF5: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_0AF8: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_0AFB: BX = &H8A70
L_0AFE: PRINT S_8A70$;  ' RT3F_6A; separator/format variant retained by RT tag
L_0B01: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_0B04: GOTO L_0B10
L_0B07: DI = &H8964
L_0B0A: SI = &H827C
L_0B0D: N_8964! = N_827C!  ' RT3F_7B
L_0B10: DI = &H827C
L_0B13: SI = &H87F2
L_0B16: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_0B19: DI = &H87F2
L_0B1C: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_0B1F: SI = DI
L_0B21: DI = &H8812
L_0B24: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_0B27: IF CompareLeft! > CompareRight! THEN GOTO L_0B2C  ' flags from L_0B24
L_0B29: GOTO L_0A38
L_0B2C: SI = &H8964
L_0B2F: CompareLeft! = N_8964!: CompareRight! = 0  ' RT3F_A7
L_0B32: IF CompareLeft! = CompareRight! THEN GOTO L_0B37  ' flags from L_0B2F
L_0B34: GOTO L_0B43
L_0B37: GOSUB L_128E
L_0B3A: GOSUB L_128E
L_0B3D: GOSUB L_13E5
L_0B40: GOTO L_0CDF
L_0B43: BX = &H10
L_0B46: LocateRow% = BX  ' RT3E_42
L_0B49: BX = 2
L_0B4C: LOCATE LocateRow%, BX  ' RT3E_44
L_0B4F: ' PRINT statement begins
L_0B52: DX = BX
L_0B54: BX = &H8A76
L_0B57: PRINT S_8A76$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_0B5A: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_0B5D: BX = &H11
L_0B60: LocateRow% = BX  ' RT3E_42
L_0B63: BX = DX
L_0B65: LOCATE LocateRow%, BX  ' RT3E_44
L_0B68: ' PRINT statement begins
L_0B6B: BX = &H8A92
L_0B6E: PRINT S_8A92$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_0B71: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_0B74: BX = &H12
L_0B77: LocateRow% = BX  ' RT3E_42
L_0B7A: BX = DX
L_0B7C: LOCATE LocateRow%, BX  ' RT3E_44
L_0B7F: ' PRINT statement begins
L_0B82: BX = &H8AAC
L_0B85: PRINT S_8AAC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_0B88: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_0B8B: GOSUB L_1ABD
L_0B8E: SI = &H888A
L_0B91: CompareLeft! = N_888A!: CompareRight! = 0  ' RT3F_A7
L_0B94: IF CompareLeft! = CompareRight! THEN GOTO L_0B99  ' flags from L_0B91
L_0B96: GOTO L_0BA2
L_0B99: GOSUB L_4F07
L_0B9C: BX = &H8AC4
L_0B9F: CHAIN S_8AC4$  ' RT3E_0E; M data-lane filename evidence
L_0BA2: GOSUB L_1378
L_0BA5: BX = 9
L_0BA8: LocateRow% = BX  ' RT3E_42
L_0BAB: BX = 4
L_0BAE: LOCATE LocateRow%, BX  ' RT3E_44
L_0BB1: SI = &H827C
L_0BB4: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_0BB7: GOTO L_0C40
L_0BBA: DI = &H882A
L_0BBD: SI = &H8960
L_0BC0: N_882A! = N_8960!  ' RT3F_7B
L_0BC3: BX = DI
L_0BC5: DI = &H882E
L_0BC8: SI = &H8AD2
L_0BCB: N_882E! = N_8AD2!  ' RT3F_7B
L_0BCE: GOSUB L_0359
L_0BD1: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_0BD4: BX = 0
L_0BD7: IF NOT ZF THEN GOTO L_0BDA  ' flags from L_0BD1
L_0BD9: BX = BX - 1
L_0BDA: DI = &H882A
L_0BDD: SI = &H888E
L_0BE0: N_882A! = N_888E!  ' RT3F_7B
L_0BE3: DI = &H882E
L_0BE6: SI = &H8AD2
L_0BE9: N_882E! = N_8AD2!  ' RT3F_7B
L_0BEC: WORD(BP - 6) = BX
L_0BEF: GOSUB L_0359
L_0BF2: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_0BF5: BX = 0
L_0BF8: IF (CF OR ZF) THEN GOTO L_0BFB  ' flags from L_0BF2
L_0BFA: BX = BX - 1
L_0BFB: BX = BX AND WORD(BP - 6)
L_0BFE: CompareLeft% = BX: CompareRight% = 0
L_0C00: IF CompareLeft% <> CompareRight% THEN GOTO L_0C05  ' flags from L_0BFE
L_0C02: GOTO L_0C37
L_0C05: RT3E_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_43
L_0C08: BX = 4
L_0C0B: LOCATE LocateRow%, BX  ' RT3E_44
L_0C0E: ' PRINT statement begins
L_0C11: SI = &H8AD2
L_0C14: BX = CINT(N_8AD2!)  ' RT3F_75
L_0C17: BX = BX * (2 ^ 1)
L_0C19: BX = BX * (2 ^ 1)
L_0C1B: BX = BX + &H4288
L_0C1F: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_0C22: BX = &H8A70
L_0C25: PRINT S_8A70$;  ' RT3F_6A; separator/format variant retained by RT tag
L_0C28: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_0C2B: DI = &H8AD6
L_0C2E: SI = &H8ADA
L_0C31: N_8AD6! = N_8ADA!  ' RT3F_7B
L_0C34: GOSUB L_6217
L_0C37: DI = &H827C
L_0C3A: SI = &H8AD2
L_0C3D: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H827C)  ' RT3F_7F
L_0C40: DI = &H8AD2
L_0C43: N_8AD2! = FAC!: SI = &H001A  ' RT3F_7D
L_0C46: SI = DI
L_0C48: DI = &H8812
L_0C4B: CompareLeft! = N_8AD2!: CompareRight! = N_8812!  ' RT3F_9F
L_0C4E: IF CompareLeft! > CompareRight! THEN GOTO L_0C53  ' flags from L_0C4B
L_0C50: GOTO L_0BBA
L_0C53: GOSUB L_128E
L_0C56: GOSUB L_128E
L_0C59: GOSUB L_128E
L_0C5C: GOSUB L_13E5
L_0C5F: GOTO L_0CDF
L_0C62: DI = &H883E
L_0C65: SI = &H8958
L_0C68: N_883E! = N_8958!  ' RT3F_7B
L_0C6B: BX = DI
L_0C6D: DI = &H8842
L_0C70: SI = &H87F2
L_0C73: N_8842! = N_87F2!  ' RT3F_7B
L_0C76: GOSUB L_038B
L_0C79: BX = CINT(FAC!)  ' RT3F_77
L_0C7C: DI = BX
L_0C7E: DI = DI * (2 ^ 1)
L_0C80: DI = DI * (2 ^ 1)
L_0C82: DI = DI + &H1850
L_0C86: SI = &H8ADE
L_0C89: N(DI) = N_8ADE!  ' RT3F_7B
L_0C8C: DI = &H883E
L_0C8F: SI = &H895C
L_0C92: N_883E! = N_895C!  ' RT3F_7B
L_0C95: BX = DI
L_0C97: DI = &H8842
L_0C9A: SI = &H87F2
L_0C9D: N_8842! = N_87F2!  ' RT3F_7B
L_0CA0: GOSUB L_038B
L_0CA3: BX = CINT(FAC!)  ' RT3F_77
L_0CA6: DI = BX
L_0CA8: DI = DI * (2 ^ 1)
L_0CAA: DI = DI * (2 ^ 1)
L_0CAC: DI = DI + &H1850
L_0CB0: SI = &H8AE2
L_0CB3: N(DI) = N_8AE2!  ' RT3F_7B
L_0CB6: DI = &H883E
L_0CB9: SI = &H8960
L_0CBC: N_883E! = N_8960!  ' RT3F_7B
L_0CBF: DI = &H8842
L_0CC2: SI = &H87F2
L_0CC5: N_8842! = N_87F2!  ' RT3F_7B
L_0CC8: GOSUB L_038B
L_0CCB: BX = CINT(FAC!)  ' RT3F_77
L_0CCE: DI = BX
L_0CD0: DI = DI * (2 ^ 1)
L_0CD2: DI = DI * (2 ^ 1)
L_0CD4: DI = DI + &H1850
L_0CD8: SI = &H8AE6
L_0CDB: N(DI) = N_8AE6!  ' RT3F_7B
L_0CDE: RETURN
L_0CDF: SI = &H87FA
L_0CE2: FAC! = N_87FA!: DI = &H001E  ' RT3F_6F
L_0CE5: GOTO L_0D03
L_0CE8: SI = &H87F2
L_0CEB: BX = SI
L_0CED: DX = BX
L_0CEF: BX = CINT(N_87F2!)  ' RT3F_75
L_0CF2: BX = BX * (2 ^ 1)
L_0CF4: BX = BX + &H8AEA
L_0CF8: RT3F_0F(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=DI)  ' RT3F_0F
L_0CFB: SI = DX
L_0CFD: DI = &H827C
L_0D00: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_0D03: DI = &H87F2
L_0D06: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_0D09: SI = DI
L_0D0B: DI = &H8B20
L_0D0E: CompareLeft! = N_87F2!: CompareRight! = N_8B20!  ' RT3F_9F
L_0D11: IF CompareLeft! <= CompareRight! THEN GOTO L_0CE8  ' flags from L_0D0E
L_0D13: ' Alignment NOP
L_0D14: SI = &H3B8C
L_0D17: CompareLeft! = N_3B8C!: CompareRight! = 0  ' RT3F_A7
L_0D1A: IF CompareLeft! = CompareRight! THEN GOTO L_0D1F  ' flags from L_0D17
L_0D1C: GOTO L_0D40
L_0D1F: DI = &H48A0
L_0D22: SI = &H88DA
L_0D25: N_48A0! = N_88DA!  ' RT3F_7B
L_0D28: DI = &H48A8
L_0D2B: N_48A8! = N_88DA!  ' RT3F_7B
L_0D2E: DI = &H48A4
L_0D31: SI = &H88DE
L_0D34: N_48A4! = N_88DE!  ' RT3F_7B
L_0D37: DI = &H48AC
L_0D3A: N_48AC! = N_88DE!  ' RT3F_7B
L_0D3D: GOTO L_0DAA
L_0D40: DI = &H3B8C
L_0D43: SI = &H87FA
L_0D46: N_3B8C! = N_87FA!  ' RT3F_7B
L_0D49: DI = SI
L_0D4B: SI = &H3B88
L_0D4E: CompareLeft! = N_3B88!: CompareRight! = N_87FA!  ' RT3F_9F
L_0D51: IF CompareLeft! = CompareRight! THEN GOTO L_0D56  ' flags from L_0D4E
L_0D53: GOTO L_0D6B
L_0D56: DI = &H48A0
L_0D59: SI = &H48A8
L_0D5C: N_48A0! = N_48A8!  ' RT3F_7B
L_0D5F: DI = &H48A4
L_0D62: SI = &H48AC
L_0D65: N_48A4! = N_48AC!  ' RT3F_7B
L_0D68: GOTO L_0DAA
L_0D6B: DI = &H886E
L_0D6E: SI = &H87FA
L_0D71: N_886E! = N_87FA!  ' RT3F_7B
L_0D74: GOSUB L_0409
L_0D77: DI = &H8B28
L_0D7A: FAC! = FAC! * N_8B28!  ' RT3F_91
L_0D7D: BX = &H1A
L_0D80: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_0D83: DI = &H8B24
L_0D86: N_8B24! = FAC!: SI = &H001A  ' RT3F_7D
L_0D89: SI = DI
L_0D8B: DI = &H8866
L_0D8E: N_8866! = N_8B24!  ' RT3F_7B
L_0D91: DI = &H886A
L_0D94: SI = &H827C
L_0D97: N_886A! = N_827C!  ' RT3F_7B
L_0D9A: GOSUB L_03F0
L_0D9D: BX = CINT(FAC!)  ' RT3F_77
L_0DA0: DI = BX
L_0DA2: DI = DI * (2 ^ 1)
L_0DA4: WORD(DI + &H48B0) = 0xFFFF
L_0DAA: SI = &H827C
L_0DAD: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_0DB0: GOTO L_0DD1
L_0DB3: ' Alignment NOP
L_0DB4: SI = &H87F2
L_0DB7: BX = SI
L_0DB9: DX = BX
L_0DBB: BX = CINT(N_87F2!)  ' RT3F_75
L_0DBE: BX = BX * (2 ^ 1)
L_0DC0: BX = BX * (2 ^ 1)
L_0DC2: BX = BX + &H8B2C
L_0DC6: RT3F_10(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=DI)  ' RT3F_10
L_0DC9: SI = DX
L_0DCB: DI = &H827C
L_0DCE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_0DD1: DI = &H87F2
L_0DD4: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_0DD7: SI = DI
L_0DD9: DI = &H8B88
L_0DDC: CompareLeft! = N_87F2!: CompareRight! = N_8B88!  ' RT3F_9F
L_0DDF: IF CompareLeft! <= CompareRight! THEN GOTO L_0DB4  ' flags from L_0DDC
L_0DE1: ' Alignment NOP
L_0DE2: DI = &H8B8C
L_0DE5: SI = &H8B90
L_0DE8: N_8B8C! = N_8B90!  ' RT3F_7B
L_0DEB: GOTO L_2408
L_0DEE: BX = 0xFFFF
L_0DF1: RT3E_32(AX=AX, BX=&HFFFF, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_32
L_0DF4: BX = 1
L_0DF7: RT3E_5B(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_5B
L_0DFA: DI = &H827C
L_0DFD: SI = &H19B4
L_0E00: CompareLeft! = N_19B4!: CompareRight! = N_827C!  ' RT3F_9F
L_0E03: IF CompareLeft! = CompareRight! THEN GOTO L_0E08  ' flags from L_0E00
L_0E05: GOTO L_0E19
L_0E08: DX = 2
L_0E0B: RT3E_4A(AX=AX, BX=BX, CX=CX, DX=2, SI=SI, DI=DI)  ' RT3E_4A
L_0E0E: BX = DX
L_0E10: DX = 6
L_0E13: RT3E_4A(AX=AX, BX=BX, CX=CX, DX=6, SI=SI, DI=DI)  ' RT3E_4A
L_0E16: GOTO L_0E24
L_0E19: BX = 0
L_0E1B: RT3E_33(AX=AX, BX=0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_33
L_0E1E: BX = 1
L_0E21: RT3E_35(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_35
L_0E24: BX = 3
L_0E27: DX = BX
L_0E29: CX = 0
L_0E2B: AX = CX
L_0E2D: RT3E_84(AX=0, BX=3, CX=0, DX=3, SI=SI, DI=DI)  ' RT3E_84
L_0E30: BX = &H13D
L_0E33: DX = 0xC3
L_0E36: RT3E_85(AX=AX, BX=&H013D, CX=CX, DX=&H00C3, SI=SI, DI=DI)  ' RT3E_85
L_0E39: DX = AX
L_0E3B: BX = 0xFFFF
L_0E3E: CX = BX
L_0E40: RT3E_86(AX=AX, BX=&HFFFF, CX=&HFFFF, DX=DX, SI=SI, DI=DI)  ' RT3E_86
L_0E43: BX = 7
L_0E46: DX = 6
L_0E49: CX = 0
L_0E4B: AX = CX
L_0E4D: RT3E_84(AX=0, BX=7, CX=0, DX=6, SI=SI, DI=DI)  ' RT3E_84
L_0E50: BX = 0xC1
L_0E53: DX = 0xC0
L_0E56: RT3E_85(AX=AX, BX=&H00C1, CX=CX, DX=&H00C0, SI=SI, DI=DI)  ' RT3E_85
L_0E59: DX = AX
L_0E5B: BX = 0xFFFF
L_0E5E: CX = BX
L_0E60: RT3E_86(AX=AX, BX=&HFFFF, CX=&HFFFF, DX=DX, SI=SI, DI=DI)  ' RT3E_86
L_0E63: BX = 0xC5
L_0E66: DX = 6
L_0E69: CX = 0
L_0E6B: AX = CX
L_0E6D: RT3E_84(AX=0, BX=&H00C5, CX=0, DX=6, SI=SI, DI=DI)  ' RT3E_84
L_0E70: BX = &H139
L_0E73: DX = &H1A
L_0E76: RT3E_85(AX=AX, BX=&H0139, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_85
L_0E79: BX = 0xFFFF
L_0E7C: DX = 1
L_0E7F: CX = BX
L_0E81: RT3E_86(AX=AX, BX=&HFFFF, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0E84: CX = AX
L_0E86: BX = 0xD8
L_0E89: DX = 7
L_0E8C: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_0E8F: BX = &H40F4
L_0E92: DX = 3
L_0E95: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_0E98: BX = 0xC5
L_0E9B: DX = &H1D
L_0E9E: CX = 0
L_0EA0: AX = CX
L_0EA2: RT3E_84(AX=0, BX=&H00C5, CX=0, DX=&H001D, SI=SI, DI=DI)  ' RT3E_84
L_0EA5: BX = &H139
L_0EA8: DX = &H59
L_0EAB: RT3E_85(AX=AX, BX=&H0139, CX=CX, DX=&H0059, SI=SI, DI=DI)  ' RT3E_85
L_0EAE: DX = AX
L_0EB0: BX = 0xFFFF
L_0EB3: CX = BX
L_0EB5: RT3E_86(AX=AX, BX=&HFFFF, CX=&HFFFF, DX=DX, SI=SI, DI=DI)  ' RT3E_86
L_0EB8: BX = 0xC5
L_0EBB: DX = &H5C
L_0EBE: CX = 0
L_0EC0: AX = CX
L_0EC2: RT3E_84(AX=0, BX=&H00C5, CX=0, DX=&H005C, SI=SI, DI=DI)  ' RT3E_84
L_0EC5: BX = &H139
L_0EC8: DX = &H69
L_0ECB: RT3E_85(AX=AX, BX=&H0139, CX=CX, DX=&H0069, SI=SI, DI=DI)  ' RT3E_85
L_0ECE: DX = AX
L_0ED0: BX = 0xFFFF
L_0ED3: CX = BX
L_0ED5: RT3E_86(AX=AX, BX=&HFFFF, CX=&HFFFF, DX=DX, SI=SI, DI=DI)  ' RT3E_86
L_0ED8: BX = 0xC5
L_0EDB: DX = &H6C
L_0EDE: CX = 0
L_0EE0: AX = CX
L_0EE2: RT3E_84(AX=0, BX=&H00C5, CX=0, DX=&H006C, SI=SI, DI=DI)  ' RT3E_84
L_0EE5: BX = &H139
L_0EE8: DX = 0xC0
L_0EEB: RT3E_85(AX=AX, BX=&H0139, CX=CX, DX=&H00C0, SI=SI, DI=DI)  ' RT3E_85
L_0EEE: DX = AX
L_0EF0: BX = 0xFFFF
L_0EF3: CX = BX
L_0EF5: RT3E_86(AX=AX, BX=&HFFFF, CX=&HFFFF, DX=DX, SI=SI, DI=DI)  ' RT3E_86
L_0EF8: BX = 4
L_0EFB: DX = BX
L_0EFD: CX = 0
L_0EFF: AX = CX
L_0F01: RT3E_84(AX=0, BX=4, CX=0, DX=4, SI=SI, DI=DI)  ' RT3E_84
L_0F04: BX = &H13C
L_0F07: DX = 5
L_0F0A: RT3E_85(AX=AX, BX=&H013C, CX=CX, DX=5, SI=SI, DI=DI)  ' RT3E_85
L_0F0D: BX = 2
L_0F10: DX = 1
L_0F13: CX = 0xFFFF
L_0F16: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0F19: CX = AX
L_0F1B: BX = 4
L_0F1E: DX = 0xC1
L_0F21: RT3E_84(AX=AX, BX=4, CX=CX, DX=&H00C1, SI=SI, DI=DI)  ' RT3E_84
L_0F24: BX = &H13C
L_0F27: DX = 0xC2
L_0F2A: RT3E_85(AX=AX, BX=&H013C, CX=CX, DX=&H00C2, SI=SI, DI=DI)  ' RT3E_85
L_0F2D: BX = 2
L_0F30: DX = 1
L_0F33: CX = 0xFFFF
L_0F36: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0F39: CX = AX
L_0F3B: BX = 0xC5
L_0F3E: DX = &H1B
L_0F41: RT3E_84(AX=AX, BX=&H00C5, CX=CX, DX=&H001B, SI=SI, DI=DI)  ' RT3E_84
L_0F44: BX = &H139
L_0F47: DX = &H1C
L_0F4A: RT3E_85(AX=AX, BX=&H0139, CX=CX, DX=&H001C, SI=SI, DI=DI)  ' RT3E_85
L_0F4D: BX = 2
L_0F50: DX = 1
L_0F53: CX = 0xFFFF
L_0F56: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0F59: CX = AX
L_0F5B: BX = 0xC5
L_0F5E: DX = &H5A
L_0F61: RT3E_84(AX=AX, BX=&H00C5, CX=CX, DX=&H005A, SI=SI, DI=DI)  ' RT3E_84
L_0F64: BX = &H139
L_0F67: DX = &H5B
L_0F6A: RT3E_85(AX=AX, BX=&H0139, CX=CX, DX=&H005B, SI=SI, DI=DI)  ' RT3E_85
L_0F6D: BX = 2
L_0F70: DX = 1
L_0F73: CX = 0xFFFF
L_0F76: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0F79: CX = AX
L_0F7B: BX = 0xC5
L_0F7E: DX = &H6A
L_0F81: RT3E_84(AX=AX, BX=&H00C5, CX=CX, DX=&H006A, SI=SI, DI=DI)  ' RT3E_84
L_0F84: BX = &H139
L_0F87: DX = &H6B
L_0F8A: RT3E_85(AX=AX, BX=&H0139, CX=CX, DX=&H006B, SI=SI, DI=DI)  ' RT3E_85
L_0F8D: BX = 2
L_0F90: DX = 1
L_0F93: CX = 0xFFFF
L_0F96: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0F99: BX = 4
L_0F9C: DX = 6
L_0F9F: CX = 0
L_0FA1: AX = CX
L_0FA3: RT3E_84(AX=0, BX=4, CX=0, DX=6, SI=SI, DI=DI)  ' RT3E_84
L_0FA6: BX = DX
L_0FA8: DX = 0xC0
L_0FAB: RT3E_85(AX=AX, BX=BX, CX=CX, DX=&H00C0, SI=SI, DI=DI)  ' RT3E_85
L_0FAE: BX = 2
L_0FB1: DX = 1
L_0FB4: CX = 0xFFFF
L_0FB7: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0FBA: CX = AX
L_0FBC: BX = 0xC2
L_0FBF: DX = 6
L_0FC2: RT3E_84(AX=AX, BX=&H00C2, CX=CX, DX=6, SI=SI, DI=DI)  ' RT3E_84
L_0FC5: BX = 0xC4
L_0FC8: DX = 0xC0
L_0FCB: RT3E_85(AX=AX, BX=&H00C4, CX=CX, DX=&H00C0, SI=SI, DI=DI)  ' RT3E_85
L_0FCE: BX = 2
L_0FD1: DX = 1
L_0FD4: CX = 0xFFFF
L_0FD7: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0FDA: CX = AX
L_0FDC: BX = &H13A
L_0FDF: DX = 6
L_0FE2: RT3E_84(AX=AX, BX=&H013A, CX=CX, DX=6, SI=SI, DI=DI)  ' RT3E_84
L_0FE5: BX = &H13C
L_0FE8: DX = 0xC0
L_0FEB: RT3E_85(AX=AX, BX=&H013C, CX=CX, DX=&H00C0, SI=SI, DI=DI)  ' RT3E_85
L_0FEE: BX = 2
L_0FF1: DX = 1
L_0FF4: CX = 0xFFFF
L_0FF7: RT3E_86(AX=AX, BX=2, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_0FFA: RETURN
L_0FFB: GOSUB L_60BE
L_0FFE: DI = &H8B98

```

### Selection and display helpers

```basic
L_1001: SI = &H19B0
L_1004: FAC! = N_19B0! * N_8B98!  ' RT3F_8F
L_1007: DI = &H8B94
L_100A: N_8B94! = FAC!: SI = &H001A  ' RT3F_7D
L_100D: SI = &H827C
L_1010: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_1013: GOTO L_101F
L_1016: DI = &H827C
L_1019: SI = &H8B9C
L_101C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8B9C, DI=&H827C)  ' RT3F_7F
L_101F: DI = &H8B9C
L_1022: N_8B9C! = FAC!: SI = &H001A  ' RT3F_7D
L_1025: SI = DI
L_1027: DI = &H8B94
L_102A: CompareLeft! = N_8B9C!: CompareRight! = N_8B94!  ' RT3F_9F
L_102D: IF CompareLeft! <= CompareRight! THEN GOTO L_1016  ' flags from L_102A
L_102F: GOSUB L_60BE
L_1032: DI = &H8852
L_1035: SI = &H19B0
L_1038: FAC! = N_19B0! * N_8852!  ' RT3F_8F
L_103B: DI = &H8BA0
L_103E: N_8BA0! = FAC!: SI = &H001A  ' RT3F_7D
L_1041: SI = &H827C
L_1044: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_1047: GOTO L_1053
L_104A: DI = &H827C
L_104D: SI = &H8B9C
L_1050: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8B9C, DI=&H827C)  ' RT3F_7F
L_1053: DI = &H8B9C
L_1056: N_8B9C! = FAC!: SI = &H001A  ' RT3F_7D
L_1059: SI = DI
L_105B: DI = &H8BA0
L_105E: CompareLeft! = N_8B9C!: CompareRight! = N_8BA0!  ' RT3F_9F
L_1061: IF CompareLeft! <= CompareRight! THEN GOTO L_104A  ' flags from L_105E
L_1063: GOSUB L_60BE
L_1066: RETURN
L_1067: BX = &H18
L_106A: LocateRow% = BX  ' RT3E_42
L_106D: BX = 2
L_1070: LOCATE LocateRow%, BX  ' RT3E_44
L_1073: ' PRINT statement begins
L_1076: BX = &H8BA4
L_1079: PRINT S_8BA4$;  ' RT3F_6A; separator/format variant retained by RT tag
L_107C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_107F: GOSUB L_12E9
L_1082: RETURN
L_1083: DI = &H884E
L_1086: SI = &H1988
L_1089: FAC! = N_1988! * N_884E!  ' RT3F_8F
L_108C: DI = &H198C
L_108F: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H198C)  ' RT3F_81
L_1092: DI = &H8BB6
L_1095: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8BB6)  ' RT3F_81
L_1098: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_109B: SI = DI
L_109D: DI = &H8BBA
L_10A0: CompareLeft! = N(SI): CompareRight! = N_8BBA!  ' RT3F_9F
L_10A3: IF CompareLeft! > CompareRight! THEN GOTO L_10A8  ' flags from L_10A0
L_10A5: GOTO L_10AD
L_10A8: SWAP DI, SI
L_10AA: N(DI) = N(SI)  ' RT3F_7B
L_10AD: DI = &H884E
L_10B0: SI = &H8BB6
L_10B3: RT3F_87(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8BB6, DI=&H884E)  ' RT3F_87
L_10B6: BX = DI
L_10B8: DI = &H1988
L_10BB: DX = SI
L_10BD: N_1988! = FAC!: SI = &H001A  ' RT3F_7D
L_10C0: SWAP BX, DI
L_10C2: SI = BX
L_10C4: FAC! = N_1988! * N(DI)  ' RT3F_8F
L_10C7: SI = DX
L_10C9: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_9B
L_10CC: DI = &H198C
L_10CF: N_198C! = FAC!: SI = &H001A  ' RT3F_7D
L_10D2: RETURN
L_10D3: GOSUB L_14CA
L_10D6: SI = &H827C
L_10D9: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_10DC: GOTO L_117C
L_10DF: ' Alignment NOP
L_10E0: DI = &H882A
L_10E3: SI = &H87FA
L_10E6: N_882A! = N_87FA!  ' RT3F_7B
L_10E9: BX = DI
L_10EB: DI = &H882E
L_10EE: DX = SI
L_10F0: SI = &H87F2
L_10F3: N_882E! = N_87F2!  ' RT3F_7B
L_10F6: GOSUB L_0359
L_10F9: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_10FC: BX = 0
L_10FF: IF (CF OR ZF) THEN GOTO L_1102  ' flags from L_10F9
L_1101: BX = BX - 1
L_1102: DI = &H882A
L_1105: SI = &H888E
L_1108: N_882A! = N_888E!  ' RT3F_7B
L_110B: DI = &H882E
L_110E: SI = &H87F2
L_1111: N_882E! = N_87F2!  ' RT3F_7B
L_1114: WORD(BP - 6) = BX
L_1117: GOSUB L_0359
L_111A: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_111D: BX = 0
L_1120: IF (CF OR ZF) THEN GOTO L_1123  ' flags from L_111A
L_1122: BX = BX - 1
L_1123: BX = BX AND WORD(BP - 6)
L_1126: CompareLeft% = BX: CompareRight% = 0
L_1128: IF CompareLeft% <> CompareRight% THEN GOTO L_112D  ' flags from L_1126
L_112A: GOTO L_1173
L_112D: DI = &H88FE
L_1130: SI = &H87F2
L_1133: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88FE)  ' RT3F_7F
L_1136: BX = SI
L_1138: DX = BX
L_113A: BX = CINT(FAC!)  ' RT3F_77
L_113D: LocateRow% = BX  ' RT3E_42
L_1140: BX = &H1A
L_1143: LOCATE LocateRow%, BX  ' RT3E_44
L_1146: ' PRINT statement begins
L_1149: SI = DX
L_114B: DI = &H8A6C
L_114E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8A6C)  ' RT3F_7F
L_1151: BX = CINT(FAC!)  ' RT3F_77
L_1154: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_1157: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_115A: BX = &H8BBE
L_115D: PRINT S_8BBE$;  ' RT3F_6A; separator/format variant retained by RT tag
L_1160: SI = DX
L_1162: BX = CINT(N(SI))  ' RT3F_75
L_1165: BX = BX * (2 ^ 1)
L_1167: BX = BX * (2 ^ 1)
L_1169: BX = BX + &H4288
L_116D: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_1170: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_1173: DI = &H827C
L_1176: SI = &H87F2
L_1179: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_117C: DI = &H87F2
L_117F: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_1182: SI = DI
L_1184: DI = &H8812
L_1187: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_118A: IF CompareLeft! > CompareRight! THEN GOTO L_118F  ' flags from L_1187
L_118C: GOTO L_10E0
L_118F: BX = &H16
L_1192: LocateRow% = BX  ' RT3E_42
L_1195: BX = &H1A
L_1198: LOCATE LocateRow%, BX  ' RT3E_44
L_119B: ' PRINT statement begins
L_119E: BX = &H8BC4
L_11A1: PRINT S_8BC4$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_11A4: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_11A7: RT3D_06(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_06
L_11AA: DX = &H8802
L_11AD: S_8802$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_11B0: GOSUB L_60BE
L_11B3: BX = &H8278
L_11B6: AX = &H8802
L_11B9: CompareLeft$ = S_8802$: CompareRight$ = S_8278$  ' RT3F_62; H string compare from 9E1F..9E49
L_11BC: IF CompareLeft$ = CompareRight$ THEN GOTO L_11A7  ' flags from L_11B9
L_11BE: BX = &H8802
L_11C1: RT3F_BB(AX=AX, BX=&H8802, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BB
L_11C4: FAC! = CSNG(BX)  ' RT3F_57
L_11C7: DI = &H87F2
L_11CA: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_11CD: SI = DI
L_11CF: DI = &H87F6
L_11D2: CompareLeft! = N_87F2!: CompareRight! = N_87F6!  ' RT3F_9F
L_11D5: IF CompareLeft! = CompareRight! THEN GOTO L_11DA  ' flags from L_11D2
L_11D7: GOTO L_11E6
L_11DA: DI = &H8AD2
L_11DD: SI = &H8BC8
L_11E0: N_8AD2! = N_8BC8!  ' RT3F_7B
L_11E3: GOTO L_121B
L_11E6: DI = &H8A6C
L_11E9: SI = &H87F2
L_11EC: CompareLeft! = N_87F2!: CompareRight! = N_8A6C!  ' RT3F_9F
L_11EF: BX = 0
L_11F2: IF CompareLeft! <= CompareRight! THEN GOTO L_11F5  ' flags from L_11EC
L_11F4: BX = BX - 1
L_11F5: DI = &H8BCC
L_11F8: CompareLeft! = N(SI): CompareRight! = N_8BCC!  ' RT3F_9F
L_11FB: DX = 0
L_11FE: IF CompareLeft! >= CompareRight! THEN GOTO L_1201  ' flags from L_11F8
L_1200: DX = DX - 1
L_1201: DX = DX AND BX
L_1203: CompareLeft% = DX: CompareRight% = 0
L_1205: IF CompareLeft% <> CompareRight% THEN GOTO L_120A  ' flags from L_1203
L_1207: GOTO L_1219
L_120A: DI = &H8BD0
L_120D: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8BD0)  ' RT3F_7F
L_1210: DI = &H8AD2
L_1213: N_8AD2! = FAC!: SI = &H001A  ' RT3F_7D
L_1216: GOTO L_121B
L_1219: GOTO L_11A7
L_121B: SI = &H8AD2
L_121E: CompareLeft! = N_8AD2!: CompareRight! = 0  ' RT3F_A7
L_1221: BX = 0
L_1224: IF CompareLeft! <> CompareRight! THEN GOTO L_1227  ' flags from L_121E
L_1226: BX = BX - 1
L_1227: DI = &H882A
L_122A: DX = SI
L_122C: SI = &H8BD8
L_122F: N_882A! = N_8BD8!  ' RT3F_7B
L_1232: SWAP DX, SI
L_1234: CX = DI
L_1236: DI = &H882E
L_1239: N_882E! = N(SI)  ' RT3F_7B
L_123C: WORD(BP - 6) = BX
L_123F: GOSUB L_0359
L_1242: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_1245: BX = 0
L_1248: IF (CF OR ZF) THEN GOTO L_124B  ' flags from L_1242
L_124A: BX = BX - 1
L_124B: DI = &H882A
L_124E: SI = &H888E
L_1251: N_882A! = N_888E!  ' RT3F_7B
L_1254: DI = &H882E
L_1257: SI = &H8AD2
L_125A: N_882E! = N_8AD2!  ' RT3F_7B
L_125D: WORD(BP - 8) = BX
L_1260: GOSUB L_0359
L_1263: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_1266: BX = 0
L_1269: IF (CF OR ZF) THEN GOTO L_126C  ' flags from L_1263
L_126B: BX = BX - 1
L_126C: BX = BX AND WORD(BP - 8)
L_126F: BX = BX OR WORD(BP - 6)
L_1272: DI = &H827C
L_1275: SI = &H8BD4
L_1278: CompareLeft! = N_8BD4!: CompareRight! = N_827C!  ' RT3F_9F
L_127B: DX = 0
L_127E: IF CompareLeft! <> CompareRight! THEN GOTO L_1281  ' flags from L_1278
L_1280: DX = DX - 1
L_1281: DX = DX OR BX
L_1283: CompareLeft% = DX: CompareRight% = 0
L_1285: IF CompareLeft% <> CompareRight% THEN GOTO L_128A  ' flags from L_1283
L_1287: GOTO L_128B
L_128A: RETURN
L_128B: GOTO L_11A7
L_128E: SI = &H827C
L_1291: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_1294: GOTO L_12A4
L_1297: ' Alignment NOP
L_1298: GOSUB L_0FFB
L_129B: DI = &H827C
L_129E: SI = &H8BDC
L_12A1: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8BDC, DI=&H827C)  ' RT3F_7F
L_12A4: DI = &H8BDC
L_12A7: N_8BDC! = FAC!: SI = &H001A  ' RT3F_7D
L_12AA: SI = DI
L_12AC: DI = &H889E
L_12AF: CompareLeft! = N_8BDC!: CompareRight! = N_889E!  ' RT3F_9F
L_12B2: IF CompareLeft! <= CompareRight! THEN GOTO L_1298  ' flags from L_12AF
L_12B4: RETURN
L_12B5: ' PRINT statement begins
L_12B8: BX = &H8BE0
L_12BB: PRINT S_8BE0$;  ' RT3F_6A; separator/format variant retained by RT tag
L_12BE: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_12C1: RT3D_06(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_06
L_12C4: DX = &H8802
L_12C7: S_8802$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_12CA: GOSUB L_60BE
L_12CD: BX = &H8278
L_12D0: AX = &H8802
L_12D3: CompareLeft$ = S_8802$: CompareRight$ = S_8278$  ' RT3F_62; H string compare from 9E1F..9E49
L_12D6: IF CompareLeft$ = CompareRight$ THEN GOTO L_12C1  ' flags from L_12D3
L_12D8: BX = 0xD
L_12DB: RT3D_05(AX=AX, BX=&H000D, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_12DE: AX = BX
L_12E0: BX = &H8802
L_12E3: CompareLeft$ = S(AX): CompareRight$ = S_8802$  ' RT3F_62; H string compare from 9E1F..9E49
L_12E6: IF CompareLeft$ <> CompareRight$ THEN GOTO L_12C1  ' flags from L_12E3
L_12E8: RETURN
L_12E9: RT3D_06(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_06
L_12EC: DX = &H8802
L_12EF: S_8802$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_12F2: GOSUB L_60BE
L_12F5: BX = &H8278
L_12F8: AX = &H8802
L_12FB: CompareLeft$ = S_8802$: CompareRight$ = S_8278$  ' RT3F_62; H string compare from 9E1F..9E49
L_12FE: IF CompareLeft$ = CompareRight$ THEN GOTO L_12E9  ' flags from L_12FB
L_1300: BX = &H8802
L_1303: RT3F_BB(AX=AX, BX=&H8802, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BB
L_1306: FAC! = CSNG(BX)  ' RT3F_57
L_1309: DI = &H8BF0
L_130C: N_8BF0! = FAC!: SI = &H001A  ' RT3F_7D
L_130F: SI = DI
L_1311: DI = &H8BF4
L_1314: CompareLeft! = N_8BF0!: CompareRight! = N_8BF4!  ' RT3F_9F
L_1317: IF CompareLeft! > CompareRight! THEN GOTO L_131C  ' flags from L_1314
L_1319: GOTO L_1327
L_131C: DI = &H8BF8
L_131F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8BF8)  ' RT3F_7F
L_1322: DI = SI
L_1324: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1327: DI = &H8C04
L_132A: SI = &H8BF0
L_132D: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8BF0, DI=&H8C04)  ' RT3F_7F
L_1330: DI = SI
L_1332: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1335: SI = DI
L_1337: DI = &H8BF8
L_133A: CompareLeft! = N(SI): CompareRight! = N_8BF8!  ' RT3F_9F
L_133D: BX = 0
L_1340: IF CompareLeft! <> CompareRight! THEN GOTO L_1343  ' flags from L_133A
L_1342: BX = BX - 1
L_1343: DI = &H8C08
L_1346: CompareLeft! = N(SI): CompareRight! = N_8C08!  ' RT3F_9F
L_1349: DX = 0
L_134C: IF CompareLeft! <> CompareRight! THEN GOTO L_134F  ' flags from L_1346
L_134E: DX = DX - 1
L_134F: DX = DX OR BX
L_1351: DI = &H8BFC
L_1354: CompareLeft! = N(SI): CompareRight! = N_8BFC!  ' RT3F_9F
L_1357: BX = 0
L_135A: IF CompareLeft! < CompareRight! THEN GOTO L_135D  ' flags from L_1354
L_135C: BX = BX - 1
L_135D: DI = &H8C00
L_1360: CompareLeft! = N(SI): CompareRight! = N_8C00!  ' RT3F_9F
L_1363: CX = 0
L_1366: IF CompareLeft! > CompareRight! THEN GOTO L_1369  ' flags from L_1360
L_1368: CX = CX - 1
L_1369: CX = CX AND BX
L_136B: CX = CX OR DX
L_136D: CompareLeft% = CX: CompareRight% = 0
L_136F: IF CompareLeft% <> CompareRight% THEN GOTO L_1374  ' flags from L_136D
L_1371: GOTO L_1375
L_1374: RETURN
L_1375: GOTO L_12E9
L_1378: DI = &H8C0C
L_137B: SI = &H827C
L_137E: N_8C0C! = N_827C!  ' RT3F_7B
L_1381: BX = 8
L_1384: DX = 7
L_1387: CX = 0
L_1389: AX = CX
L_138B: RT3E_84(AX=0, BX=8, CX=0, DX=7, SI=&H827C, DI=&H8C0C)  ' RT3E_84
L_138E: BX = 0xC0
L_1391: DX = 0xBF
L_1394: RT3E_85(AX=AX, BX=&H00C0, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_1397: BX = 0
L_1399: DX = 1
L_139C: CX = 0xFFFF
L_139F: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_13A2: RETURN
L_13A3: BX = 8
L_13A6: DX = &H10
L_13A9: CX = 0
L_13AB: AX = CX
L_13AD: RT3E_84(AX=0, BX=8, CX=0, DX=&H0010, SI=SI, DI=DI)  ' RT3E_84
L_13B0: BX = 0xC0
L_13B3: DX = 0xBF
L_13B6: RT3E_85(AX=AX, BX=&H00C0, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_13B9: BX = 0
L_13BB: DX = 1
L_13BE: CX = 0xFFFF
L_13C1: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_13C4: RETURN
L_13C5: BX = 8
L_13C8: DX = 7
L_13CB: CX = 0
L_13CD: AX = CX
L_13CF: RT3E_87(AX=0, BX=8, CX=0, DX=7, SI=SI, DI=DI)  ' RT3E_87
L_13D2: BX = 0xC0
L_13D5: DX = 0xBF
L_13D8: RT3E_88(AX=AX, BX=&H00C0, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_88
L_13DB: BX = &H5E2E
L_13DE: DX = &H21FC
L_13E1: RT3E_3A(AX=AX, BX=&H5E2E, CX=CX, DX=&H21FC, SI=SI, DI=DI)  ' RT3E_3A
L_13E4: RETURN
L_13E5: DI = &H8C0C
L_13E8: SI = &H87FA
L_13EB: N_8C0C! = N_87FA!  ' RT3F_7B
L_13EE: BX = 8
L_13F1: DX = 7
L_13F4: CX = 0
L_13F6: AX = CX
L_13F8: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_13FB: BX = &H5E2E
L_13FE: DX = 3
L_1401: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1404: RETURN
L_1405: RT3D_06(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_06
L_1408: DX = &H8802
L_140B: S_8802$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_140E: GOSUB L_60BE
L_1411: BX = &H8278
L_1414: AX = &H8802
L_1417: CompareLeft$ = S_8802$: CompareRight$ = S_8278$  ' RT3F_62; H string compare from 9E1F..9E49
L_141A: IF CompareLeft$ = CompareRight$ THEN GOTO L_1405  ' flags from L_1417
L_141C: BX = &H8802
L_141F: DX = BX
L_1421: RT3F_BA(AX=AX, BX=&H8802, CX=CX, DX=&H8802, SI=SI, DI=DI)  ' RT3F_BA
L_1424: CompareLeft% = BX: CompareRight% = 1
L_1427: IF CompareLeft% > CompareRight% THEN GOTO L_142C  ' flags from L_1424
L_1429: GOTO L_1464
L_142C: BX = DX
L_142E: DX = 1
L_1431: RT3D_0C(AX=AX, BX=BX, CX=CX, DX=1, SI=SI, DI=DI)  ' RT3D_0C
L_1434: RT3F_BB(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BB
L_1437: BX = BX + -&H46
L_143A: FAC! = CSNG(BX)  ' RT3F_57
L_143D: DI = &H8BF0
L_1440: N_8BF0! = FAC!: SI = &H001A  ' RT3F_7D
L_1443: SI = DI
L_1445: DI = &H827C
L_1448: CompareLeft! = N_8BF0!: CompareRight! = N_827C!  ' RT3F_9F
L_144B: BX = 0
L_144E: IF CompareLeft! >= CompareRight! THEN GOTO L_1451  ' flags from L_1448
L_1450: BX = BX - 1
L_1451: DI = &H885E
L_1454: CompareLeft! = N(SI): CompareRight! = N_885E!  ' RT3F_9F
L_1457: DX = 0
L_145A: IF CompareLeft! <= CompareRight! THEN GOTO L_145D  ' flags from L_1454
L_145C: DX = DX - 1
L_145D: DX = DX OR BX
L_145F: CompareLeft% = DX: CompareRight% = 0
L_1461: IF CompareLeft% <> CompareRight% THEN GOTO L_1405  ' flags from L_145F
L_1463: RETURN
L_1464: BX = &H8802
L_1467: RT3F_BB(AX=AX, BX=&H8802, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BB
L_146A: BX = BX + -&H35
L_146D: FAC! = CSNG(BX)  ' RT3F_57
L_1470: DI = &H8BF0
L_1473: N_8BF0! = FAC!: SI = &H001A  ' RT3F_7D
L_1476: SI = DI
L_1478: DI = &H8C10
L_147B: CompareLeft! = N_8BF0!: CompareRight! = N_8C10!  ' RT3F_9F
L_147E: IF CompareLeft! > CompareRight! THEN GOTO L_1483  ' flags from L_147B
L_1480: GOTO L_148E
L_1483: DI = &H8BF8
L_1486: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8BF8)  ' RT3F_7F
L_1489: DI = SI
L_148B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_148E: DI = &H8C14
L_1491: SI = &H8BF0
L_1494: CompareLeft! = N_8BF0!: CompareRight! = N_8C14!  ' RT3F_9F
L_1497: IF CompareLeft! = CompareRight! THEN GOTO L_149C  ' flags from L_1494
L_1499: GOTO L_14A5
L_149C: DI = SI
L_149E: SI = &H8872
L_14A1: N(DI) = N_8872!  ' RT3F_7B
L_14A4: RETURN
L_14A5: DI = &H8C18
L_14A8: SI = &H8BF0
L_14AB: CompareLeft! = N_8BF0!: CompareRight! = N_8C18!  ' RT3F_9F
L_14AE: BX = 0
L_14B1: IF CompareLeft! >= CompareRight! THEN GOTO L_14B4  ' flags from L_14AB
L_14B3: BX = BX - 1
L_14B4: DI = &H8872
L_14B7: CompareLeft! = N(SI): CompareRight! = N_8872!  ' RT3F_9F
L_14BA: DX = 0
L_14BD: IF CompareLeft! <= CompareRight! THEN GOTO L_14C0  ' flags from L_14B7
L_14BF: DX = DX - 1
L_14C0: DX = DX OR BX
L_14C2: CompareLeft% = DX: CompareRight% = 0
L_14C4: IF CompareLeft% = CompareRight% THEN GOTO L_14C9  ' flags from L_14C2
L_14C6: GOTO L_1405
L_14C9: RETURN
L_14CA: BX = 0xC8
L_14CD: DX = &H6E
L_14D0: CX = 0
L_14D2: AX = CX
L_14D4: RT3E_84(AX=0, BX=&H00C8, CX=0, DX=&H006E, SI=SI, DI=DI)  ' RT3E_84
L_14D7: BX = &H137
L_14DA: DX = 0xBF
L_14DD: RT3E_85(AX=AX, BX=&H0137, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_14E0: BX = 0
L_14E2: DX = 1
L_14E5: CX = 0xFFFF
L_14E8: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_14EB: RETURN
L_14EC: BX = 0xC8
L_14EF: DX = &H1F
L_14F2: CX = 0
L_14F4: AX = CX
L_14F6: RT3E_84(AX=0, BX=&H00C8, CX=0, DX=&H001F, SI=SI, DI=DI)  ' RT3E_84
L_14F9: BX = &H137
L_14FC: DX = &H57
L_14FF: RT3E_85(AX=AX, BX=&H0137, CX=CX, DX=&H0057, SI=SI, DI=DI)  ' RT3E_85
L_1502: BX = 0
L_1504: DX = 1
L_1507: CX = 0xFFFF
L_150A: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_150D: RETURN
L_150E: BX = 0xC8
L_1511: DX = &H80
L_1514: CX = 0
L_1516: AX = CX
L_1518: RT3E_84(AX=0, BX=&H00C8, CX=0, DX=&H0080, SI=SI, DI=DI)  ' RT3E_84
L_151B: BX = &H137
L_151E: DX = 0xBF
L_1521: RT3E_85(AX=AX, BX=&H0137, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_1524: BX = 0
L_1526: DX = 1
L_1529: CX = 0xFFFF
L_152C: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_152F: RETURN
L_1530: BX = 8
L_1533: DX = 7
L_1536: CX = 0
L_1538: AX = CX
L_153A: RT3E_84(AX=0, BX=8, CX=0, DX=7, SI=SI, DI=DI)  ' RT3E_84
L_153D: BX = 0xC0
L_1540: DX = 0xBF
L_1543: RT3E_85(AX=AX, BX=&H00C0, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_1546: BX = 0
L_1548: DX = 1
L_154B: CX = 0xFFFF
L_154E: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_1551: RETURN
L_1552: BX = 8
L_1555: DX = &H10
L_1558: CX = 0
L_155A: AX = CX
L_155C: RT3E_84(AX=0, BX=8, CX=0, DX=&H0010, SI=SI, DI=DI)  ' RT3E_84
L_155F: BX = 0xC0
L_1562: DX = 0xBF
L_1565: RT3E_85(AX=AX, BX=&H00C0, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_1568: BX = 0
L_156A: DX = 1
L_156D: CX = 0xFFFF
L_1570: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_1573: RETURN
L_1574: DI = &H8C1C
L_1577: SI = &H88E2
L_157A: N_8C1C! = N_88E2!  ' RT3F_7B
L_157D: BX = 0
L_157F: RT3D_21(AX=AX, BX=0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_21
L_1582: FAC! = CSNG(BX)  ' RT3F_57
L_1585: DI = &H8C20
L_1588: N_8C20! = FAC!: SI = &H001A  ' RT3F_7D
L_158B: RT3D_25(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H001A, DI=&H8C20)  ' RT3D_25
L_158E: FAC! = CSNG(BX)  ' RT3F_57
L_1591: DI = &H8C24
L_1594: N_8C24! = FAC!: SI = &H001A  ' RT3F_7D
L_1597: BX = &H8278
L_159A: DX = &H8802
L_159D: S_8802$ = S_8278$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_15A0: SI = &H8C24
L_15A3: BX = CINT(N_8C24!)  ' RT3F_75
L_15A6: LocateRow% = BX  ' RT3E_42
L_15A9: SI = &H8C20
L_15AC: BX = CINT(N_8C20!)  ' RT3F_75
L_15AF: LocateRow% = BX  ' RT3E_42
L_15B2: BX = 1
L_15B5: LocateRow% = BX  ' RT3E_42
L_15B8: BX = 0
L_15BA: LocateRow% = BX  ' RT3E_42
L_15BD: BX = 7
L_15C0: LOCATE LocateRow%, BX  ' RT3E_44
L_15C3: ' PRINT statement begins
L_15C6: BX = &H8802
L_15C9: PRINT S_8802$;  ' RT3F_6A; separator/format variant retained by RT tag
L_15CC: BX = &H8A70
L_15CF: PRINT S_8A70$;  ' RT3F_6A; separator/format variant retained by RT tag
L_15D2: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_15D5: RT3D_06(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_06
L_15D8: DX = &H8C28
L_15DB: S_8C28$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_15DE: AX = DX
L_15E0: BX = &H8278
L_15E3: CompareLeft$ = S(AX): CompareRight$ = S_8278$  ' RT3F_62; H string compare from 9E1F..9E49
L_15E6: IF CompareLeft$ = CompareRight$ THEN GOTO L_15D5  ' flags from L_15E3
L_15E8: BX = &H8C28
L_15EB: RT3F_BB(AX=AX, BX=&H8C28, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BB
L_15EE: FAC! = CSNG(BX)  ' RT3F_57
L_15F1: DI = &H87F2
L_15F4: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_15F7: SI = DI
L_15F9: DI = &H87F6
L_15FC: CompareLeft! = N_87F2!: CompareRight! = N_87F6!  ' RT3F_9F
L_15FF: IF CompareLeft! <> CompareRight! THEN GOTO L_1604  ' flags from L_15FC
L_1601: GOTO L_16F8
L_1604: DI = &H88AE
L_1607: SI = &H87F2
L_160A: CompareLeft! = N_87F2!: CompareRight! = N_88AE!  ' RT3F_9F
L_160D: BX = 0
L_1610: IF CompareLeft! <> CompareRight! THEN GOTO L_1613  ' flags from L_160A
L_1612: BX = BX - 1
L_1613: DX = BX
L_1615: BX = &H8802
L_1618: CX = BX
L_161A: RT3F_BA(AX=AX, BX=&H8802, CX=&H8802, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_161D: BX = BX OR BX
L_161F: AX = 0
L_1622: IF (ZF OR SF <> OF) THEN GOTO L_1625  ' flags from L_161D
L_1624: AX = AX - 1
L_1625: AX = AX AND DX
L_1627: CompareLeft% = AX: CompareRight% = 0
L_1629: IF CompareLeft% <> CompareRight% THEN GOTO L_162E  ' flags from L_1627
L_162B: GOTO L_1645
L_162E: BX = CX
L_1630: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_1633: BX = BX - 1
L_1634: SWAP CX, BX
L_1636: DX = CX
L_1638: AX = BX
L_163A: RT3D_0B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_0B
L_163D: DX = AX
L_163F: S(DX) = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_1642: GOTO L_15A0
L_1645: DI = &H88E2
L_1648: SI = &H8C1C
L_164B: CompareLeft! = N_8C1C!: CompareRight! = N_88E2!  ' RT3F_9F
L_164E: BX = 0
L_1651: IF CompareLeft! <> CompareRight! THEN GOTO L_1654  ' flags from L_164B
L_1653: BX = BX - 1
L_1654: DI = &H8A6C
L_1657: SI = &H87F2
L_165A: CompareLeft! = N_87F2!: CompareRight! = N_8A6C!  ' RT3F_9F
L_165D: DX = 0
L_1660: IF CompareLeft! >= CompareRight! THEN GOTO L_1663  ' flags from L_165A
L_1662: DX = DX - 1
L_1663: DI = &H8C2C
L_1666: CompareLeft! = N(SI): CompareRight! = N_8C2C!  ' RT3F_9F
L_1669: CX = 0
L_166C: IF CompareLeft! <= CompareRight! THEN GOTO L_166F  ' flags from L_1666
L_166E: CX = CX - 1
L_166F: CX = CX OR DX
L_1671: CX = CX AND BX
L_1673: CompareLeft% = CX: CompareRight% = 0
L_1675: IF CompareLeft% = CompareRight% THEN GOTO L_167A  ' flags from L_1673
L_1677: GOTO L_15A0
L_167A: DI = &H8C30
L_167D: SI = &H87F2
L_1680: CompareLeft! = N_87F2!: CompareRight! = N_8C30!  ' RT3F_9F
L_1683: BX = 0
L_1686: IF CompareLeft! >= CompareRight! THEN GOTO L_1689  ' flags from L_1680
L_1688: BX = BX - 1
L_1689: DI = &H8C34
L_168C: CompareLeft! = N(SI): CompareRight! = N_8C34!  ' RT3F_9F
L_168F: DX = 0
L_1692: IF CompareLeft! <= CompareRight! THEN GOTO L_1695  ' flags from L_168C
L_1694: DX = DX - 1
L_1695: DX = DX OR BX
L_1697: CompareLeft% = DX: CompareRight% = 0
L_1699: IF CompareLeft% = CompareRight% THEN GOTO L_169E  ' flags from L_1697
L_169B: GOTO L_15D5
L_169E: DI = &H8C38
L_16A1: SI = &H87F2
L_16A4: CompareLeft! = N_87F2!: CompareRight! = N_8C38!  ' RT3F_9F
L_16A7: BX = 0
L_16AA: IF CompareLeft! <= CompareRight! THEN GOTO L_16AD  ' flags from L_16A4
L_16AC: BX = BX - 1
L_16AD: DI = &H88CE
L_16B0: CompareLeft! = N(SI): CompareRight! = N_88CE!  ' RT3F_9F
L_16B3: DX = 0
L_16B6: IF CompareLeft! >= CompareRight! THEN GOTO L_16B9  ' flags from L_16B0
L_16B8: DX = DX - 1
L_16B9: DX = DX AND BX
L_16BB: CompareLeft% = DX: CompareRight% = 0
L_16BD: IF CompareLeft% <> CompareRight% THEN GOTO L_16C2  ' flags from L_16BB
L_16BF: GOTO L_16CD
L_16C2: DI = &H8BF8
L_16C5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8BF8)  ' RT3F_7F
L_16C8: DI = SI
L_16CA: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_16CD: BX = &H8802
L_16D0: RT3F_BA(AX=AX, BX=&H8802, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_16D3: FAC! = CSNG(BX)  ' RT3F_57
L_16D6: DI = &H8C1C
L_16D9: CompareLeft! = FAC!: CompareRight! = N_8C1C!  ' RT3F_A1
L_16DC: IF CompareLeft! < CompareRight! THEN GOTO L_16E1  ' flags from L_16D9
L_16DE: GOTO L_15D5
L_16E1: SI = &H87F2
L_16E4: BX = CINT(N_87F2!)  ' RT3F_75
L_16E7: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=DI)  ' RT3D_05
L_16EA: AX = &H8802
L_16ED: RT3F_55(AX=&H8802, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_16F0: DX = AX
L_16F2: S(DX) = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_16F5: GOTO L_15A0
L_16F8: BX = &H8802
L_16FB: RT3D_13(AX=AX, BX=&H8802, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_13
L_16FE: RT3F_78(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_78
L_1701: AX = BX
L_1703: WORD(&H8C3C) = AX
L_1706: RETURN
L_1707: DI = &H8A68
L_170A: SI = &H890E
L_170D: N_8A68! = N_890E!  ' RT3F_7B
L_1710: SI = &H88A2
L_1713: FAC! = N_88A2!: DI = &H001E  ' RT3F_6F
L_1716: GOTO L_1795
L_1719: ' Alignment NOP
L_171A: SI = &H87F2
L_171D: BX = SI
L_171F: DX = BX
L_1721: BX = CINT(N_87F2!)  ' RT3F_75
L_1724: SI = BX
L_1726: SI = SI * (2 ^ 1)
L_1728: SI = SI * (2 ^ 1)
L_172A: SI = SI + &H1850
L_172E: DI = &H8C3E
L_1731: CompareLeft! = N(SI): CompareRight! = N_8C3E!  ' RT3F_9F
L_1734: BX = 0
L_1737: IF CompareLeft! <> CompareRight! THEN GOTO L_173A  ' flags from L_1731
L_1739: BX = BX - 1
L_173A: SI = DX
L_173C: DI = &H8286
L_173F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8286)  ' RT3F_7F
L_1742: CX = BX
L_1744: BX = CINT(FAC!)  ' RT3F_77
L_1747: SI = BX
L_1749: SI = SI * (2 ^ 1)
L_174B: SI = SI * (2 ^ 1)
L_174D: SI = SI + &H1850
L_1751: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_1754: BX = 0
L_1757: IF CompareLeft! <= CompareRight! THEN GOTO L_175A  ' flags from L_1751
L_1759: BX = BX - 1
L_175A: BX = BX AND CX
L_175C: CompareLeft% = BX: CompareRight% = 0
L_175E: IF CompareLeft% <> CompareRight% THEN GOTO L_1763  ' flags from L_175C
L_1760: GOTO L_178C
L_1763: SWAP DX, SI
L_1765: DI = &H8C42
L_1768: N_8C42! = N(SI)  ' RT3F_7B
L_176B: DI = &H8A68
L_176E: BX = SI
L_1770: SI = &H827C
L_1773: N_8A68! = N_827C!  ' RT3F_7B
L_1776: SI = DX
L_1778: DI = &H8954
L_177B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8954)  ' RT3F_7F
L_177E: DI = &H8C46
L_1781: N_8C46! = FAC!: SI = &H001A  ' RT3F_7D
L_1784: DI = BX
L_1786: SI = &H8C4A
L_1789: N(DI) = N_8C4A!  ' RT3F_7B
L_178C: DI = &H88B2
L_178F: SI = &H87F2
L_1792: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88B2)  ' RT3F_7F
L_1795: DI = &H87F2
L_1798: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_179B: SI = DI
L_179D: DI = &H88B6
L_17A0: CompareLeft! = N_87F2!: CompareRight! = N_88B6!  ' RT3F_9F
L_17A3: IF CompareLeft! > CompareRight! THEN GOTO L_17A8  ' flags from L_17A0
L_17A5: GOTO L_171A
L_17A8: RETURN
L_17A9: DI = &H883E
L_17AC: SI = &H88BA
L_17AF: N_883E! = N_88BA!  ' RT3F_7B
L_17B2: BX = DI
L_17B4: DI = &H8842
L_17B7: SI = &H8AD2
L_17BA: N_8842! = N_8AD2!  ' RT3F_7B
L_17BD: GOSUB L_038B
L_17C0: BX = CINT(FAC!)  ' RT3F_77
L_17C3: DI = BX
L_17C5: DI = DI * (2 ^ 1)
L_17C7: DI = DI * (2 ^ 1)
L_17C9: DI = DI + &H1850
L_17CD: BX = DI
L_17CF: DI = &H882A
L_17D2: SI = &H87FA
L_17D5: N_882A! = N_87FA!  ' RT3F_7B
L_17D8: DX = DI
L_17DA: DI = &H882E
L_17DD: SI = &H8AD2
L_17E0: N_882E! = N_8AD2!  ' RT3F_7B
L_17E3: WORD(BP - 6) = BX
L_17E6: GOSUB L_0359
L_17E9: DI = &H882A
L_17EC: SI = &H88E2
L_17EF: N_882A! = N_88E2!  ' RT3F_7B
L_17F2: BX = DI
L_17F4: DI = &H882E
L_17F7: SI = &H8AD2
L_17FA: N_882E! = N_8AD2!  ' RT3F_7B
L_17FD: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=DX, SI=&H8AD2, DI=&H882E, inline=&H80)  ' RT3F_71
L_1801: GOSUB L_0359
L_1804: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_85
L_1808: DI = &H8C4E
L_180B: FAC! = FAC! * N_8C4E!  ' RT3F_91
L_180E: DI = WORD(BP - 6)
L_1811: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1814: DI = &H883E
L_1817: SI = &H880A
L_181A: N_883E! = N_880A!  ' RT3F_7B
L_181D: BX = DI
L_181F: DI = &H8842
L_1822: SI = &H8AD2
L_1825: N_8842! = N_8AD2!  ' RT3F_7B
L_1828: GOSUB L_038B
L_182B: BX = CINT(FAC!)  ' RT3F_77
L_182E: DI = BX
L_1830: DI = DI * (2 ^ 1)
L_1832: DI = DI * (2 ^ 1)
L_1834: DI = DI + &H1850
L_1838: BX = DI
L_183A: DI = &H882A
L_183D: SI = &H8286
L_1840: N_882A! = N_8286!  ' RT3F_7B
L_1843: DX = DI
L_1845: DI = &H882E
L_1848: SI = &H8AD2
L_184B: N_882E! = N_8AD2!  ' RT3F_7B
L_184E: WORD(BP - 8) = BX
L_1851: GOSUB L_0359
L_1854: RT3F_AD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H01)  ' RT3F_AD
L_1858: DI = &H882A
L_185B: SI = &H88B2
L_185E: N_882A! = N_88B2!  ' RT3F_7B
L_1861: BX = DI
L_1863: DI = &H882E
L_1866: SI = &H8AD2
L_1869: N_882E! = N_8AD2!  ' RT3F_7B
L_186C: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=DX, SI=&H8AD2, DI=&H882E, inline=&H81)  ' RT3F_71
L_1870: GOSUB L_0359
L_1873: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H81)  ' RT3F_85
L_1877: DI = &H8812
L_187A: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8812)  ' RT3F_89
L_187D: DI = &H8C52
L_1880: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C52)  ' RT3F_81
L_1883: BX = DI
L_1885: DI = WORD(BP - 8)
L_1888: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_188B: DI = &H883E
L_188E: SI = &H885E
L_1891: N_883E! = N_885E!  ' RT3F_7B
L_1894: DI = &H8842
L_1897: SI = &H8AD2
L_189A: N_8842! = N_8AD2!  ' RT3F_7B
L_189D: GOSUB L_038B
L_18A0: BX = CINT(FAC!)  ' RT3F_77
L_18A3: DI = BX
L_18A5: DI = DI * (2 ^ 1)
L_18A7: DI = DI * (2 ^ 1)
L_18A9: DI = DI + &H1850
L_18AD: BX = DI
L_18AF: DI = &H882A
L_18B2: SI = &H827C
L_18B5: N_882A! = N_827C!  ' RT3F_7B
L_18B8: DI = &H882E
L_18BB: SI = &H8AD2
L_18BE: N_882E! = N_8AD2!  ' RT3F_7B
L_18C1: WORD(BP - 0xA) = BX
L_18C4: GOSUB L_0359
L_18C7: DI = &H8852
L_18CA: FAC! = FAC! * N_8852!  ' RT3F_91
L_18CD: DI = &H8C52
L_18D0: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C52)  ' RT3F_81
L_18D3: DI = WORD(BP - 0xA)
L_18D6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_18D9: DI = &H883E
L_18DC: SI = &H87F6
L_18DF: N_883E! = N_87F6!  ' RT3F_7B
L_18E2: BX = DI
L_18E4: DI = &H8842
L_18E7: SI = &H8AD2
L_18EA: N_8842! = N_8AD2!  ' RT3F_7B
L_18ED: GOSUB L_038B
L_18F0: BX = CINT(FAC!)  ' RT3F_77
L_18F3: DI = BX
L_18F5: DI = DI * (2 ^ 1)
L_18F7: DI = DI * (2 ^ 1)
L_18F9: DI = DI + &H1850
L_18FD: BX = DI
L_18FF: DI = &H882A
L_1902: SI = &H8BC8
L_1905: N_882A! = N_8BC8!  ' RT3F_7B
L_1908: DX = DI
L_190A: DI = &H882E
L_190D: SI = &H8AD2
L_1910: N_882E! = N_8AD2!  ' RT3F_7B
L_1913: WORD(BP - 6) = BX
L_1916: GOSUB L_0359
L_1919: DI = &H88B2
L_191C: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88B2)  ' RT3F_89
L_191F: DI = &H880A
L_1922: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H880A)  ' RT3F_81
L_1925: DI = WORD(BP - 6)
L_1928: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_192B: DI = &H883E
L_192E: SI = &H8C18
L_1931: N_883E! = N_8C18!  ' RT3F_7B
L_1934: DI = &H8842
L_1937: SI = &H8AD2
L_193A: N_8842! = N_8AD2!  ' RT3F_7B
L_193D: GOSUB L_038B
L_1940: BX = CINT(FAC!)  ' RT3F_77
L_1943: DI = BX
L_1945: DI = DI * (2 ^ 1)
L_1947: DI = DI * (2 ^ 1)
L_1949: DI = DI + &H1850
L_194D: BX = DI
L_194F: DI = &H882A
L_1952: SI = &H890E
L_1955: N_882A! = N_890E!  ' RT3F_7B
L_1958: DX = DI
L_195A: DI = &H882E
L_195D: SI = &H8AD2
L_1960: N_882E! = N_8AD2!  ' RT3F_7B
L_1963: WORD(BP - 8) = BX
L_1966: GOSUB L_0359
L_1969: DI = &H882A
L_196C: SI = &H827C
L_196F: N_882A! = N_827C!  ' RT3F_7B
L_1972: DI = &H882E
L_1975: SI = &H8AD2
L_1978: N_882E! = N_8AD2!  ' RT3F_7B
L_197B: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H882E, inline=&H80)  ' RT3F_71
L_197F: GOSUB L_0359
L_1982: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_85
L_1986: DI = &H8C56
L_1989: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C56)  ' RT3F_89
L_198C: DI = &H87FE
L_198F: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H87FE)  ' RT3F_81
L_1992: DI = WORD(BP - 8)
L_1995: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1998: DI = &H882A
L_199B: SI = &H88C6
L_199E: N_882A! = N_88C6!  ' RT3F_7B
L_19A1: DI = &H882E
L_19A4: SI = &H8AD2
L_19A7: N_882E! = N_8AD2!  ' RT3F_7B
L_19AA: GOSUB L_0359
L_19AD: DI = &H8C5A
L_19B0: N_8C5A! = FAC!: SI = &H001A  ' RT3F_7D
L_19B3: BX = DI
L_19B5: DI = &H883E
L_19B8: SI = &H8C5E
L_19BB: N_883E! = N_8C5E!  ' RT3F_7B
L_19BE: DX = DI
L_19C0: DI = &H8842
L_19C3: SI = &H8AD2
L_19C6: N_8842! = N_8AD2!  ' RT3F_7B
L_19C9: GOSUB L_038B
L_19CC: BX = CINT(FAC!)  ' RT3F_77
L_19CF: DI = BX
L_19D1: DI = DI * (2 ^ 1)
L_19D3: DI = DI * (2 ^ 1)
L_19D5: DI = DI + &H1850
L_19D9: BX = DI
L_19DB: DI = &H87FE
L_19DE: SI = &H8C5A
L_19E1: FAC! = N_8C5A! * N_87FE!  ' RT3F_8F
L_19E4: DI = BX
L_19E6: DX = SI
L_19E8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_19EB: DI = &H883E
L_19EE: SI = &H8C62
L_19F1: N_883E! = N_8C62!  ' RT3F_7B
L_19F4: BX = DI
L_19F6: DI = &H8842
L_19F9: SI = &H8AD2
L_19FC: N_8842! = N_8AD2!  ' RT3F_7B
L_19FF: GOSUB L_038B
L_1A02: BX = CINT(FAC!)  ' RT3F_77
L_1A05: DI = BX
L_1A07: DI = DI * (2 ^ 1)
L_1A09: DI = DI * (2 ^ 1)
L_1A0B: DI = DI + &H1850
L_1A0F: BX = DI
L_1A11: DI = &H8286
L_1A14: SI = &H8C5A
L_1A17: CompareLeft! = N_8C5A!: CompareRight! = N_8286!  ' RT3F_9F
L_1A1A: DX = 0
L_1A1D: IF CompareLeft! <= CompareRight! THEN GOTO L_1A20  ' flags from L_1A17
L_1A1F: DX = DX - 1
L_1A20: CompareLeft% = DX: CompareRight% = 0
L_1A22: IF CompareLeft% >= CompareRight% THEN GOTO L_1A26  ' flags from L_1A20
L_1A24: DX = -DX
L_1A26: SWAP DX, BX
L_1A28: FAC! = CSNG(BX)  ' RT3F_57
L_1A2B: DI = DX
L_1A2D: BX = SI
L_1A2F: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1A32: DI = &H883E
L_1A35: SI = &H8C66
L_1A38: N_883E! = N_8C66!  ' RT3F_7B
L_1A3B: DX = DI
L_1A3D: DI = &H8842
L_1A40: SI = &H8AD2
L_1A43: N_8842! = N_8AD2!  ' RT3F_7B
L_1A46: GOSUB L_038B
L_1A49: BX = CINT(FAC!)  ' RT3F_77
L_1A4C: DI = BX
L_1A4E: DI = DI * (2 ^ 1)
L_1A50: DI = DI * (2 ^ 1)
L_1A52: DI = DI + &H1850
L_1A56: BX = DI
L_1A58: DI = &H88E2
L_1A5B: SI = &H8C5A
L_1A5E: CompareLeft! = N_8C5A!: CompareRight! = N_88E2!  ' RT3F_9F
L_1A61: DX = 0
L_1A64: IF CompareLeft! <= CompareRight! THEN GOTO L_1A67  ' flags from L_1A5E
L_1A66: DX = DX - 1
L_1A67: CompareLeft% = DX: CompareRight% = 0
L_1A69: IF CompareLeft% >= CompareRight% THEN GOTO L_1A6D  ' flags from L_1A67
L_1A6B: DX = -DX
L_1A6D: SWAP DX, BX
L_1A6F: FAC! = CSNG(BX)  ' RT3F_57
L_1A72: DI = DX
L_1A74: BX = SI
L_1A76: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1A79: DI = &H883E
L_1A7C: SI = &H88CA
L_1A7F: N_883E! = N_88CA!  ' RT3F_7B
L_1A82: DI = &H8842
L_1A85: SI = &H8AD2
L_1A88: N_8842! = N_8AD2!  ' RT3F_7B
L_1A8B: GOSUB L_038B
L_1A8E: BX = CINT(FAC!)  ' RT3F_77
L_1A91: DI = BX
L_1A93: DI = DI * (2 ^ 1)
L_1A95: DI = DI * (2 ^ 1)
L_1A97: DI = DI + &H1850
L_1A9B: BX = DI
L_1A9D: DI = &H889E
L_1AA0: SI = &H8C5A
L_1AA3: CompareLeft! = N_8C5A!: CompareRight! = N_889E!  ' RT3F_9F
L_1AA6: DX = 0
L_1AA9: IF CompareLeft! <= CompareRight! THEN GOTO L_1AAC  ' flags from L_1AA3
L_1AAB: DX = DX - 1
L_1AAC: CompareLeft% = DX: CompareRight% = 0
L_1AAE: IF CompareLeft% >= CompareRight% THEN GOTO L_1AB2  ' flags from L_1AAC
L_1AB0: DX = -DX
L_1AB2: SWAP DX, BX
L_1AB4: FAC! = CSNG(BX)  ' RT3F_57
L_1AB7: DI = DX
L_1AB9: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1ABC: RETURN
L_1ABD: RT3D_06(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_06
L_1AC0: DX = &H8802
L_1AC3: S_8802$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_1AC6: AX = DX
L_1AC8: BX = &H8C6A
L_1ACB: CompareLeft$ = S(AX): CompareRight$ = S_8C6A$  ' RT3F_62; H string compare from 9E1F..9E49
L_1ACE: CX = 0
L_1AD1: IF CompareLeft$ <> CompareRight$ THEN GOTO L_1AD4  ' flags from L_1ACB
L_1AD3: CX = CX - 1
L_1AD4: BX = &H8C70
L_1AD7: CompareLeft$ = S(AX): CompareRight$ = S_8C70$  ' RT3F_62; H string compare from 9E1F..9E49
L_1ADA: DX = 0
L_1ADD: IF CompareLeft$ <> CompareRight$ THEN GOTO L_1AE0  ' flags from L_1AD7
L_1ADF: DX = DX - 1
L_1AE0: DX = DX OR CX
L_1AE2: CompareLeft% = DX: CompareRight% = 0
L_1AE4: IF CompareLeft% <> CompareRight% THEN GOTO L_1AE9  ' flags from L_1AE2
L_1AE6: GOTO L_1AF3
L_1AE9: DI = &H888A
L_1AEC: SI = &H827C
L_1AEF: N_888A! = N_827C!  ' RT3F_7B
L_1AF2: RETURN
L_1AF3: BX = &H8C76
L_1AF6: AX = &H8802
L_1AF9: CompareLeft$ = S_8802$: CompareRight$ = S_8C76$  ' RT3F_62; H string compare from 9E1F..9E49
L_1AFC: DX = 0
L_1AFF: IF CompareLeft$ <> CompareRight$ THEN GOTO L_1B02  ' flags from L_1AF9
L_1B01: DX = DX - 1
L_1B02: BX = &H8C7C
L_1B05: CompareLeft$ = S(AX): CompareRight$ = S_8C7C$  ' RT3F_62; H string compare from 9E1F..9E49
L_1B08: CX = 0
L_1B0B: IF CompareLeft$ <> CompareRight$ THEN GOTO L_1B0E  ' flags from L_1B05
L_1B0D: CX = CX - 1
L_1B0E: CX = CX OR DX
L_1B10: CompareLeft% = CX: CompareRight% = 0
L_1B12: IF CompareLeft% <> CompareRight% THEN GOTO L_1B17  ' flags from L_1B10
L_1B14: GOTO L_1B21
L_1B17: DI = &H888A
L_1B1A: SI = &H87FA
L_1B1D: N_888A! = N_87FA!  ' RT3F_7B
L_1B20: RETURN
L_1B21: GOTO L_1ABD
L_1B23: DI = &H8856
L_1B26: SI = &H8C82
L_1B29: N_8856! = N_8C82!  ' RT3F_7B
L_1B2C: BX = DI
L_1B2E: DI = &H885A
L_1B31: DX = SI
L_1B33: SI = &H88D2
L_1B36: N_885A! = N_88D2!  ' RT3F_7B
L_1B39: GOSUB L_03C9
L_1B3C: DI = &H8C86
L_1B3F: N_8C86! = FAC!: SI = &H001A  ' RT3F_7D
L_1B42: BX = DI
L_1B44: DI = &H8856
L_1B47: SI = &H8C82
L_1B4A: N_8856! = N_8C82!  ' RT3F_7B
L_1B4D: DX = DI
L_1B4F: DI = &H885A
L_1B52: CX = SI
L_1B54: SI = &H88AE
L_1B57: N_885A! = N_88AE!  ' RT3F_7B
L_1B5A: GOSUB L_03C9
L_1B5D: DI = &H8C8A
L_1B60: N_8C8A! = FAC!: SI = &H001A  ' RT3F_7D
L_1B63: SI = DI
L_1B65: DI = &H8872
L_1B68: FAC! = N_8C8A! * N_8872!  ' RT3F_8F
L_1B6B: DI = &H8C86
L_1B6E: BX = SI
L_1B70: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C86)  ' RT3F_81
L_1B73: DX = DI
L_1B75: DI = &H8C8E
L_1B78: N_8C8E! = FAC!: SI = &H001A  ' RT3F_7D
L_1B7B: DI = &H8856
L_1B7E: SI = &H8C82
L_1B81: N_8856! = N_8C82!  ' RT3F_7B
L_1B84: DI = &H885A
L_1B87: SI = &H8906
L_1B8A: N_885A! = N_8906!  ' RT3F_7B
L_1B8D: GOSUB L_03C9
L_1B90: DI = &H8C92
L_1B93: N_8C92! = FAC!: SI = &H001A  ' RT3F_7D
L_1B96: SI = &H8CA2
L_1B99: RT3F_97(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CA2, DI=&H8C92)  ' RT3F_97
L_1B9C: DI = &H8C86
L_1B9F: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C86)  ' RT3F_81
L_1BA2: BX = DI
L_1BA4: DI = &H8C96
L_1BA7: N_8C96! = FAC!: SI = &H001A  ' RT3F_7D
L_1BAA: SI = BX
L_1BAC: DI = &H889E
L_1BAF: FAC! = N(SI) * N_889E!  ' RT3F_8F
L_1BB2: BX = DI
L_1BB4: DI = &H88AE
L_1BB7: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88AE)  ' RT3F_81
L_1BBA: DI = &H8C9A
L_1BBD: N_8C9A! = FAC!: SI = &H001A  ' RT3F_7D
L_1BC0: DI = BX
L_1BC2: SI = &H8C8A
L_1BC5: FAC! = N_8C8A! * N(DI)  ' RT3F_8F
L_1BC8: DI = &H88D2
L_1BCB: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88D2)  ' RT3F_81
L_1BCE: DI = &H8C9E
L_1BD1: N_8C9E! = FAC!: SI = &H001A  ' RT3F_7D
L_1BD4: DI = &H8856
L_1BD7: SI = &H8C82
L_1BDA: N_8856! = N_8C82!  ' RT3F_7B
L_1BDD: DI = &H885A
L_1BE0: SI = &H880A
L_1BE3: N_885A! = N_880A!  ' RT3F_7B
L_1BE6: GOSUB L_03C9
L_1BE9: DI = &H8CA6
L_1BEC: N_8CA6! = FAC!: SI = &H001A  ' RT3F_7D
L_1BEF: SI = &H8C8A
L_1BF2: FAC! = N_8C8A!: DI = &H001E  ' RT3F_6F
L_1BF5: GOTO L_1CB4
L_1BF8: DI = &H8CAA
L_1BFB: SI = &H8C9A
L_1BFE: N_8CAA! = N_8C9A!  ' RT3F_7B
L_1C01: DI = &H8CAE
L_1C04: SI = &H8C92
L_1C07: N_8CAE! = N_8C92!  ' RT3F_7B
L_1C0A: SI = &H8C86
L_1C0D: FAC! = N_8C86!: DI = &H001E  ' RT3F_6F
L_1C10: GOTO L_1C7F
L_1C13: ' Alignment NOP
L_1C14: SI = &H8C8E
L_1C17: BX = CINT(N_8C8E!)  ' RT3F_75
L_1C1A: DI = BX
L_1C1C: DI = DI * (2 ^ 1)
L_1C1E: BX = WORD(DI + &H48B0)
L_1C22: FAC! = CSNG(BX)  ' RT3F_57
L_1C25: DI = &H8B28
L_1C28: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B28, inline=&H80)  ' RT3F_71
L_1C2C: FAC! = FAC! * N(DI)  ' RT3F_91
L_1C2F: BX = &H1A
L_1C32: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_1C35: DI = &H8CB2
L_1C38: N_8CB2! = FAC!: SI = &H001A  ' RT3F_7D
L_1C3B: SI = DI
L_1C3D: DI = &H8C82
L_1C40: CompareLeft! = N_8CB2!: CompareRight! = N_8C82!  ' RT3F_9F
L_1C43: IF CompareLeft! = CompareRight! THEN GOTO L_1C48  ' flags from L_1C40
L_1C45: GOTO L_1C59
L_1C48: RT3F_AB(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H06)  ' RT3F_AB
L_1C4C: RT3F_9D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_9D
L_1C50: DI = &H8CB6
L_1C53: N_8CB6! = FAC!: SI = &H001A  ' RT3F_7D
L_1C56: GOSUB L_1CEA
L_1C59: DI = &H827C
L_1C5C: SI = &H8C8E
L_1C5F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C8E, DI=&H827C)  ' RT3F_7F
L_1C62: SWAP SI, DI
L_1C64: BX = SI
L_1C66: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1C69: DI = &H889E
L_1C6C: SI = &H8CAA
L_1C6F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CAA, DI=&H889E)  ' RT3F_7F
L_1C72: DI = SI
L_1C74: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1C77: DI = BX
L_1C79: SI = &H8C20
L_1C7C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C20, DI=DI)  ' RT3F_7F
L_1C7F: DI = &H8C20
L_1C82: N_8C20! = FAC!: SI = &H001A  ' RT3F_7D
L_1C85: SI = DI
L_1C87: DI = &H8CAE
L_1C8A: CompareLeft! = N_8C20!: CompareRight! = N_8CAE!  ' RT3F_9F
L_1C8D: IF CompareLeft! <= CompareRight! THEN GOTO L_1C14  ' flags from L_1C8A
L_1C8F: DI = &H8C96
L_1C92: SI = &H8C8E
L_1C95: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C8E, DI=&H8C96)  ' RT3F_7F
L_1C98: DI = SI
L_1C9A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1C9D: DI = &H889E
L_1CA0: SI = &H8C9E
L_1CA3: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C9E, DI=&H889E)  ' RT3F_7F
L_1CA6: DI = SI
L_1CA8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_1CAB: DI = &H827C
L_1CAE: SI = &H8C24
L_1CB1: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C24, DI=&H827C)  ' RT3F_7F
L_1CB4: DI = &H8C24
L_1CB7: N_8C24! = FAC!: SI = &H001A  ' RT3F_7D
L_1CBA: SI = DI
L_1CBC: DI = &H8CA6
L_1CBF: CompareLeft! = N_8C24!: CompareRight! = N_8CA6!  ' RT3F_9F
L_1CC2: IF CompareLeft! > CompareRight! THEN GOTO L_1CC7  ' flags from L_1CBF
L_1CC4: GOTO L_1BF8
L_1CC7: DI = &H8866
L_1CCA: SI = &H8C82
L_1CCD: N_8866! = N_8C82!  ' RT3F_7B
L_1CD0: DI = &H886A
L_1CD3: SI = &H889E
L_1CD6: N_886A! = N_889E!  ' RT3F_7B
L_1CD9: GOSUB L_03F0
L_1CDC: BX = CINT(FAC!)  ' RT3F_77
L_1CDF: DI = BX
L_1CE1: DI = DI * (2 ^ 1)
L_1CE3: WORD(DI + &H48B0) = 1
L_1CE9: RETURN
L_1CEA: DI = &H8CC2
L_1CED: SI = &H8CB6
L_1CF0: FAC! = N_8CB6! * N_8CC2!  ' RT3F_8F
L_1CF3: BX = &H1A
L_1CF6: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_1CF9: DI = &H8CBA
L_1CFC: BX = SI
L_1CFE: N_8CBA! = FAC!: SI = &H001A  ' RT3F_7D

```

### Tile/sprite dispatch region

```basic
L_1D01: SI = DI
L_1D03: RT3F_AB(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBA, DI=&H8CBA, inline=&H03)  ' RT3F_AB
L_1D07: SI = BX
L_1D09: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_9B
L_1D0C: DI = &H827C
L_1D0F: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_1D12: DI = &H8CBE
L_1D15: N_8CBE! = FAC!: SI = &H001A  ' RT3F_7D
L_1D18: DI = &H827C
L_1D1B: SI = &H8CBA
L_1D1E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBA, DI=&H827C)  ' RT3F_7F
L_1D21: BX = CINT(FAC!)  ' RT3F_77
L_1D24: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTable=[L_1D38, L_1E12, L_1EEC, L_1FC6, L_20A0, L_217A, L_2254, L_232E])  ' RT3F_5E
L_1D38: SI = &H8CBE
L_1D3B: BX = CINT(N_8CBE!)  ' RT3F_75
L_1D3E: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_1D52, L_1D6A, L_1D82, L_1D9A, L_1DB2, L_1DCA, L_1DE2, L_1DFA])  ' RT3F_5E
L_1D52: BX = &H8CAA
L_1D55: DX = &H8C9E
L_1D58: CX = 0xFFFF
L_1D5B: AX = CX
L_1D5D: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1D60: BX = &H8356
L_1D63: DX = 3
L_1D66: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1D69: RETURN
L_1D6A: BX = &H8CAA
L_1D6D: DX = &H8C9E
L_1D70: CX = 0xFFFF
L_1D73: AX = CX
L_1D75: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1D78: BX = &H8364
L_1D7B: DX = 3
L_1D7E: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1D81: RETURN
L_1D82: BX = &H8CAA
L_1D85: DX = &H8C9E
L_1D88: CX = 0xFFFF
L_1D8B: AX = CX
L_1D8D: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1D90: BX = &H8372
L_1D93: DX = 3
L_1D96: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1D99: RETURN
L_1D9A: BX = &H8CAA
L_1D9D: DX = &H8C9E
L_1DA0: CX = 0xFFFF
L_1DA3: AX = CX
L_1DA5: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1DA8: BX = &H8380
L_1DAB: DX = 3
L_1DAE: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1DB1: RETURN
L_1DB2: BX = &H8CAA
L_1DB5: DX = &H8C9E
L_1DB8: CX = 0xFFFF
L_1DBB: AX = CX
L_1DBD: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1DC0: BX = &H838E
L_1DC3: DX = 3
L_1DC6: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1DC9: RETURN
L_1DCA: BX = &H8CAA
L_1DCD: DX = &H8C9E
L_1DD0: CX = 0xFFFF
L_1DD3: AX = CX
L_1DD5: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1DD8: BX = &H839C
L_1DDB: DX = 3
L_1DDE: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1DE1: RETURN
L_1DE2: BX = &H8CAA
L_1DE5: DX = &H8C9E
L_1DE8: CX = 0xFFFF
L_1DEB: AX = CX
L_1DED: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1DF0: BX = &H83AA
L_1DF3: DX = 3
L_1DF6: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1DF9: RETURN
L_1DFA: BX = &H8CAA
L_1DFD: DX = &H8C9E
L_1E00: CX = 0xFFFF
L_1E03: AX = CX
L_1E05: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1E08: BX = &H83B8
L_1E0B: DX = 3
L_1E0E: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1E11: RETURN
L_1E12: SI = &H8CBE
L_1E15: BX = CINT(N_8CBE!)  ' RT3F_75
L_1E18: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_1E2C, L_1E44, L_1E5C, L_1E74, L_1E8C, L_1EA4, L_1EBC, L_1ED4])  ' RT3F_5E
L_1E2C: BX = &H8CAA
L_1E2F: DX = &H8C9E
L_1E32: CX = 0xFFFF
L_1E35: AX = CX
L_1E37: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1E3A: BX = &H83C6
L_1E3D: DX = 3
L_1E40: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1E43: RETURN
L_1E44: BX = &H8CAA
L_1E47: DX = &H8C9E
L_1E4A: CX = 0xFFFF
L_1E4D: AX = CX
L_1E4F: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1E52: BX = &H83D4
L_1E55: DX = 3
L_1E58: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1E5B: RETURN
L_1E5C: BX = &H8CAA
L_1E5F: DX = &H8C9E
L_1E62: CX = 0xFFFF
L_1E65: AX = CX
L_1E67: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1E6A: BX = &H83E2
L_1E6D: DX = 3
L_1E70: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1E73: RETURN
L_1E74: BX = &H8CAA
L_1E77: DX = &H8C9E
L_1E7A: CX = 0xFFFF
L_1E7D: AX = CX
L_1E7F: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1E82: BX = &H83F0
L_1E85: DX = 3
L_1E88: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1E8B: RETURN
L_1E8C: BX = &H8CAA
L_1E8F: DX = &H8C9E
L_1E92: CX = 0xFFFF
L_1E95: AX = CX
L_1E97: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1E9A: BX = &H83FE
L_1E9D: DX = 3
L_1EA0: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1EA3: RETURN
L_1EA4: BX = &H8CAA
L_1EA7: DX = &H8C9E
L_1EAA: CX = 0xFFFF
L_1EAD: AX = CX
L_1EAF: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1EB2: BX = &H840C
L_1EB5: DX = 3
L_1EB8: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1EBB: RETURN
L_1EBC: BX = &H8CAA
L_1EBF: DX = &H8C9E
L_1EC2: CX = 0xFFFF
L_1EC5: AX = CX
L_1EC7: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1ECA: BX = &H841A
L_1ECD: DX = 3
L_1ED0: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1ED3: RETURN
L_1ED4: BX = &H8CAA
L_1ED7: DX = &H8C9E
L_1EDA: CX = 0xFFFF
L_1EDD: AX = CX
L_1EDF: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1EE2: BX = &H8428
L_1EE5: DX = 3
L_1EE8: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1EEB: RETURN
L_1EEC: SI = &H8CBE
L_1EEF: BX = CINT(N_8CBE!)  ' RT3F_75
L_1EF2: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_1F06, L_1F1E, L_1F36, L_1F4E, L_1F66, L_1F7E, L_1F96, L_1FAE])  ' RT3F_5E
L_1F06: BX = &H8CAA
L_1F09: DX = &H8C9E
L_1F0C: CX = 0xFFFF
L_1F0F: AX = CX
L_1F11: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1F14: BX = &H8436
L_1F17: DX = 3
L_1F1A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1F1D: RETURN
L_1F1E: BX = &H8CAA
L_1F21: DX = &H8C9E
L_1F24: CX = 0xFFFF
L_1F27: AX = CX
L_1F29: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1F2C: BX = &H8444
L_1F2F: DX = 3
L_1F32: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1F35: RETURN
L_1F36: BX = &H8CAA
L_1F39: DX = &H8C9E
L_1F3C: CX = 0xFFFF
L_1F3F: AX = CX
L_1F41: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1F44: BX = &H8452
L_1F47: DX = 3
L_1F4A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1F4D: RETURN
L_1F4E: BX = &H8CAA
L_1F51: DX = &H8C9E
L_1F54: CX = 0xFFFF
L_1F57: AX = CX
L_1F59: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1F5C: BX = &H8460
L_1F5F: DX = 3
L_1F62: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1F65: RETURN
L_1F66: BX = &H8CAA
L_1F69: DX = &H8C9E
L_1F6C: CX = 0xFFFF
L_1F6F: AX = CX
L_1F71: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1F74: BX = &H846E
L_1F77: DX = 3
L_1F7A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1F7D: RETURN
L_1F7E: BX = &H8CAA
L_1F81: DX = &H8C9E
L_1F84: CX = 0xFFFF
L_1F87: AX = CX
L_1F89: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1F8C: BX = &H847C
L_1F8F: DX = 3
L_1F92: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1F95: RETURN
L_1F96: BX = &H8CAA
L_1F99: DX = &H8C9E
L_1F9C: CX = 0xFFFF
L_1F9F: AX = CX
L_1FA1: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1FA4: BX = &H848A
L_1FA7: DX = 3
L_1FAA: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1FAD: RETURN
L_1FAE: BX = &H8CAA
L_1FB1: DX = &H8C9E
L_1FB4: CX = 0xFFFF
L_1FB7: AX = CX
L_1FB9: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1FBC: BX = &H8498
L_1FBF: DX = 3
L_1FC2: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1FC5: RETURN
L_1FC6: SI = &H8CBE
L_1FC9: BX = CINT(N_8CBE!)  ' RT3F_75
L_1FCC: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_1FE0, L_1FF8, L_2010, L_2028, L_2040, L_2058, L_2070, L_2088])  ' RT3F_5E
L_1FE0: BX = &H8CAA
L_1FE3: DX = &H8C9E
L_1FE6: CX = 0xFFFF
L_1FE9: AX = CX
L_1FEB: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_1FEE: BX = &H84A6
L_1FF1: DX = 3
L_1FF4: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_1FF7: RETURN
L_1FF8: BX = &H8CAA
L_1FFB: DX = &H8C9E
L_1FFE: CX = 0xFFFF
L_2001: AX = CX
L_2003: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2006: BX = &H84B4
L_2009: DX = 3
L_200C: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_200F: RETURN
L_2010: BX = &H8CAA
L_2013: DX = &H8C9E
L_2016: CX = 0xFFFF
L_2019: AX = CX
L_201B: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_201E: BX = &H84C2
L_2021: DX = 3
L_2024: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2027: RETURN
L_2028: BX = &H8CAA
L_202B: DX = &H8C9E
L_202E: CX = 0xFFFF
L_2031: AX = CX
L_2033: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2036: BX = &H84D0
L_2039: DX = 3
L_203C: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_203F: RETURN
L_2040: BX = &H8CAA
L_2043: DX = &H8C9E
L_2046: CX = 0xFFFF
L_2049: AX = CX
L_204B: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_204E: BX = &H84DE
L_2051: DX = 3
L_2054: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2057: RETURN
L_2058: BX = &H8CAA
L_205B: DX = &H8C9E
L_205E: CX = 0xFFFF
L_2061: AX = CX
L_2063: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2066: BX = &H84EC
L_2069: DX = 3
L_206C: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_206F: RETURN
L_2070: BX = &H8CAA
L_2073: DX = &H8C9E
L_2076: CX = 0xFFFF
L_2079: AX = CX
L_207B: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_207E: BX = &H84FA
L_2081: DX = 3
L_2084: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2087: RETURN
L_2088: BX = &H8CAA
L_208B: DX = &H8C9E
L_208E: CX = 0xFFFF
L_2091: AX = CX
L_2093: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2096: BX = &H8508
L_2099: DX = 3
L_209C: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_209F: RETURN
L_20A0: SI = &H8CBE
L_20A3: BX = CINT(N_8CBE!)  ' RT3F_75
L_20A6: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_20BA, L_20D2, L_20EA, L_2102, L_211A, L_2132, L_214A, L_2162])  ' RT3F_5E
L_20BA: BX = &H8CAA
L_20BD: DX = &H8C9E
L_20C0: CX = 0xFFFF
L_20C3: AX = CX
L_20C5: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_20C8: BX = &H8516
L_20CB: DX = 3
L_20CE: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_20D1: RETURN
L_20D2: BX = &H8CAA
L_20D5: DX = &H8C9E
L_20D8: CX = 0xFFFF
L_20DB: AX = CX
L_20DD: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_20E0: BX = &H8524
L_20E3: DX = 3
L_20E6: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_20E9: RETURN
L_20EA: BX = &H8CAA
L_20ED: DX = &H8C9E
L_20F0: CX = 0xFFFF
L_20F3: AX = CX
L_20F5: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_20F8: BX = &H8532
L_20FB: DX = 3
L_20FE: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2101: RETURN
L_2102: BX = &H8CAA
L_2105: DX = &H8C9E
L_2108: CX = 0xFFFF
L_210B: AX = CX
L_210D: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2110: BX = &H8540
L_2113: DX = 3
L_2116: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2119: RETURN
L_211A: BX = &H8CAA
L_211D: DX = &H8C9E
L_2120: CX = 0xFFFF
L_2123: AX = CX
L_2125: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2128: BX = &H854E
L_212B: DX = 3
L_212E: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2131: RETURN
L_2132: BX = &H8CAA
L_2135: DX = &H8C9E
L_2138: CX = 0xFFFF
L_213B: AX = CX
L_213D: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2140: BX = &H855C
L_2143: DX = 3
L_2146: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2149: RETURN
L_214A: BX = &H8CAA
L_214D: DX = &H8C9E
L_2150: CX = 0xFFFF
L_2153: AX = CX
L_2155: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2158: BX = &H856A
L_215B: DX = 3
L_215E: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2161: RETURN
L_2162: BX = &H8CAA
L_2165: DX = &H8C9E
L_2168: CX = 0xFFFF
L_216B: AX = CX
L_216D: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2170: BX = &H8578
L_2173: DX = 3
L_2176: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2179: RETURN
L_217A: SI = &H8CBE
L_217D: BX = CINT(N_8CBE!)  ' RT3F_75
L_2180: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_2194, L_21AC, L_21C4, L_21DC, L_21F4, L_220C, L_2224, L_223C])  ' RT3F_5E
L_2194: BX = &H8CAA
L_2197: DX = &H8C9E
L_219A: CX = 0xFFFF
L_219D: AX = CX
L_219F: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_21A2: BX = &H8586
L_21A5: DX = 3
L_21A8: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_21AB: RETURN
L_21AC: BX = &H8CAA
L_21AF: DX = &H8C9E
L_21B2: CX = 0xFFFF
L_21B5: AX = CX
L_21B7: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_21BA: BX = &H8594
L_21BD: DX = 3
L_21C0: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_21C3: RETURN
L_21C4: BX = &H8CAA
L_21C7: DX = &H8C9E
L_21CA: CX = 0xFFFF
L_21CD: AX = CX
L_21CF: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_21D2: BX = &H85A2
L_21D5: DX = 3
L_21D8: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_21DB: RETURN
L_21DC: BX = &H8CAA
L_21DF: DX = &H8C9E
L_21E2: CX = 0xFFFF
L_21E5: AX = CX
L_21E7: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_21EA: BX = &H85B0
L_21ED: DX = 3
L_21F0: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_21F3: RETURN
L_21F4: BX = &H8CAA
L_21F7: DX = &H8C9E
L_21FA: CX = 0xFFFF
L_21FD: AX = CX
L_21FF: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2202: BX = &H85BE
L_2205: DX = 3
L_2208: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_220B: RETURN
L_220C: BX = &H8CAA
L_220F: DX = &H8C9E
L_2212: CX = 0xFFFF
L_2215: AX = CX
L_2217: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_221A: BX = &H85CC
L_221D: DX = 3
L_2220: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2223: RETURN
L_2224: BX = &H8CAA
L_2227: DX = &H8C9E
L_222A: CX = 0xFFFF
L_222D: AX = CX
L_222F: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2232: BX = &H85DA
L_2235: DX = 3
L_2238: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_223B: RETURN
L_223C: BX = &H8CAA
L_223F: DX = &H8C9E
L_2242: CX = 0xFFFF
L_2245: AX = CX
L_2247: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_224A: BX = &H85E8
L_224D: DX = 3
L_2250: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2253: RETURN
L_2254: SI = &H8CBE
L_2257: BX = CINT(N_8CBE!)  ' RT3F_75
L_225A: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_226E, L_2286, L_229E, L_22B6, L_22CE, L_22E6, L_22FE, L_2316])  ' RT3F_5E
L_226E: BX = &H8CAA
L_2271: DX = &H8C9E
L_2274: CX = 0xFFFF
L_2277: AX = CX
L_2279: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_227C: BX = &H85F6
L_227F: DX = 3
L_2282: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2285: RETURN
L_2286: BX = &H8CAA
L_2289: DX = &H8C9E
L_228C: CX = 0xFFFF
L_228F: AX = CX
L_2291: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2294: BX = &H8604
L_2297: DX = 3
L_229A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_229D: RETURN
L_229E: BX = &H8CAA
L_22A1: DX = &H8C9E
L_22A4: CX = 0xFFFF
L_22A7: AX = CX
L_22A9: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_22AC: BX = &H8612
L_22AF: DX = 3
L_22B2: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_22B5: RETURN
L_22B6: BX = &H8CAA
L_22B9: DX = &H8C9E
L_22BC: CX = 0xFFFF
L_22BF: AX = CX
L_22C1: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_22C4: BX = &H8620
L_22C7: DX = 3
L_22CA: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_22CD: RETURN
L_22CE: BX = &H8CAA
L_22D1: DX = &H8C9E
L_22D4: CX = 0xFFFF
L_22D7: AX = CX
L_22D9: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_22DC: BX = &H862E
L_22DF: DX = 3
L_22E2: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_22E5: RETURN
L_22E6: BX = &H8CAA
L_22E9: DX = &H8C9E
L_22EC: CX = 0xFFFF
L_22EF: AX = CX
L_22F1: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_22F4: BX = &H863C
L_22F7: DX = 3
L_22FA: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_22FD: RETURN
L_22FE: BX = &H8CAA
L_2301: DX = &H8C9E
L_2304: CX = 0xFFFF
L_2307: AX = CX
L_2309: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_230C: BX = &H864A
L_230F: DX = 3
L_2312: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2315: RETURN
L_2316: BX = &H8CAA
L_2319: DX = &H8C9E
L_231C: CX = 0xFFFF
L_231F: AX = CX
L_2321: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2324: BX = &H8658
L_2327: DX = 3
L_232A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_232D: RETURN
L_232E: SI = &H8CBE
L_2331: BX = CINT(N_8CBE!)  ' RT3F_75
L_2334: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8CBE, DI=DI, inlineTable=[L_2348, L_2360, L_2378, L_2390, L_23A8, L_23C0, L_23D8, L_23F0])  ' RT3F_5E
L_2348: BX = &H8CAA
L_234B: DX = &H8C9E
L_234E: CX = 0xFFFF
L_2351: AX = CX
L_2353: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2356: BX = &H8666
L_2359: DX = 3
L_235C: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_235F: RETURN
L_2360: BX = &H8CAA
L_2363: DX = &H8C9E
L_2366: CX = 0xFFFF
L_2369: AX = CX
L_236B: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_236E: BX = &H8674
L_2371: DX = 3
L_2374: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2377: RETURN
L_2378: BX = &H8CAA
L_237B: DX = &H8C9E
L_237E: CX = 0xFFFF
L_2381: AX = CX
L_2383: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2386: BX = &H8682
L_2389: DX = 3
L_238C: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_238F: RETURN
L_2390: BX = &H8CAA
L_2393: DX = &H8C9E
L_2396: CX = 0xFFFF
L_2399: AX = CX
L_239B: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_239E: BX = &H8690
L_23A1: DX = 3
L_23A4: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_23A7: RETURN
L_23A8: BX = &H8CAA
L_23AB: DX = &H8C9E
L_23AE: CX = 0xFFFF
L_23B1: AX = CX
L_23B3: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_23B6: BX = &H869E
L_23B9: DX = 3
L_23BC: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_23BF: RETURN
L_23C0: BX = &H8CAA
L_23C3: DX = &H8C9E
L_23C6: CX = 0xFFFF
L_23C9: AX = CX
L_23CB: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_23CE: BX = &H86AC
L_23D1: DX = 3
L_23D4: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_23D7: RETURN
L_23D8: BX = &H8CAA
L_23DB: DX = &H8C9E
L_23DE: CX = 0xFFFF
L_23E1: AX = CX
L_23E3: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_23E6: BX = &H86BA
L_23E9: DX = 3
L_23EC: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_23EF: RETURN
L_23F0: BX = &H8CAA
L_23F3: DX = &H8C9E
L_23F6: CX = 0xFFFF
L_23F9: AX = CX
L_23FB: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_23FE: BX = &H86C8

```

### Exploration commands

```basic
L_2401: DX = 3
L_2404: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_2407: RETURN
L_2408: GOSUB L_14CA
L_240B: BX = 0xF
L_240E: LocateRow% = BX  ' RT3E_42
L_2411: BX = &H1A
L_2414: LOCATE LocateRow%, BX  ' RT3E_44
L_2417: ' PRINT statement begins
L_241A: DX = BX
L_241C: BX = &H8CC6
L_241F: PRINT S_8CC6$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2422: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2425: BX = &H10
L_2428: LocateRow% = BX  ' RT3E_42
L_242B: BX = DX
L_242D: LOCATE LocateRow%, BX  ' RT3E_44
L_2430: ' PRINT statement begins
L_2433: BX = &H8CD8
L_2436: PRINT S_8CD8$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2439: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_243C: BX = &H11
L_243F: LocateRow% = BX  ' RT3E_42
L_2442: BX = DX
L_2444: LOCATE LocateRow%, BX  ' RT3E_44
L_2447: ' PRINT statement begins
L_244A: BX = &H8CE4
L_244D: PRINT S_8CE4$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2450: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2453: BX = &H12
L_2456: LocateRow% = BX  ' RT3E_42
L_2459: BX = DX
L_245B: LOCATE LocateRow%, BX  ' RT3E_44
L_245E: ' PRINT statement begins
L_2461: BX = &H8CF4
L_2464: PRINT S_8CF4$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2467: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_246A: BX = &H13
L_246D: LocateRow% = BX  ' RT3E_42
L_2470: BX = DX
L_2472: LOCATE LocateRow%, BX  ' RT3E_44
L_2475: ' PRINT statement begins
L_2478: BX = &H8D00
L_247B: PRINT S_8D00$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_247E: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2481: BX = &H14
L_2484: LocateRow% = BX  ' RT3E_42
L_2487: BX = DX
L_2489: LOCATE LocateRow%, BX  ' RT3E_44
L_248C: ' PRINT statement begins
L_248F: BX = &H8D0E
L_2492: PRINT S_8D0E$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2495: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2498: BX = &H15
L_249B: LocateRow% = BX  ' RT3E_42
L_249E: BX = DX
L_24A0: LOCATE LocateRow%, BX  ' RT3E_44
L_24A3: ' PRINT statement begins
L_24A6: BX = &H8D1C
L_24A9: PRINT S_8D1C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_24AC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_24AF: BX = &H16
L_24B2: LocateRow% = BX  ' RT3E_42
L_24B5: BX = &H1A
L_24B8: LOCATE LocateRow%, BX  ' RT3E_44
L_24BB: ' PRINT statement begins
L_24BE: DX = BX
L_24C0: BX = &H8D28
L_24C3: PRINT S_8D28$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_24C6: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_24C9: BX = &H17
L_24CC: LocateRow% = BX  ' RT3E_42
L_24CF: BX = DX
L_24D1: LOCATE LocateRow%, BX  ' RT3E_44
L_24D4: ' PRINT statement begins
L_24D7: BX = &H8D34
L_24DA: PRINT S_8D34$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_24DD: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_24E0: BX = &H18
L_24E3: LocateRow% = BX  ' RT3E_42
L_24E6: BX = DX
L_24E8: LOCATE LocateRow%, BX  ' RT3E_44
L_24EB: ' PRINT statement begins
L_24EE: BX = &H8D44
L_24F1: PRINT S_8D44$;  ' RT3F_6A; separator/format variant retained by RT tag
L_24F4: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_24F7: BX = &H118
L_24FA: DX = &H90
L_24FD: CX = 0
L_24FF: AX = CX
L_2501: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_2504: BX = &H86D6
L_2507: DX = 4
L_250A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_250D: DI = &H886E
L_2510: SI = &H87FA
L_2513: N_886E! = N_87FA!  ' RT3F_7B
L_2516: GOSUB L_0409
L_2519: DI = &H8B28
L_251C: FAC! = FAC! * N_8B28!  ' RT3F_91
L_251F: BX = &H1A
L_2522: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_2525: DI = &H8B24
L_2528: N_8B24! = FAC!: SI = &H001A  ' RT3F_7D
L_252B: DI = &H8B8C
L_252E: SI = &H8B24
L_2531: CompareLeft! = N_8B24!: CompareRight! = N_8B8C!  ' RT3F_9F
L_2534: IF CompareLeft! = CompareRight! THEN GOTO L_2539  ' flags from L_2531
L_2536: GOTO L_2650
L_2539: DI = &H886E
L_253C: SI = &H87FA
L_253F: N_886E! = N_87FA!  ' RT3F_7B
L_2542: GOSUB L_0409
L_2545: SI = &H8B24
L_2548: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8B24, DI=DI, inline=&H80)  ' RT3F_71
L_254C: RT3F_AB(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H06)  ' RT3F_AB
L_2550: RT3F_9D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_9D
L_2554: BX = CINT(FAC!)  ' RT3F_77
L_2557: DI = BX
L_2559: DI = DI * (2 ^ 1)
L_255B: BX = WORD(DI - &H7D2A)
L_255F: FAC! = CSNG(BX)  ' RT3F_57
L_2562: DI = &H8D56
L_2565: N_8D56! = FAC!: SI = &H001A  ' RT3F_7D
L_2568: SI = DI
L_256A: DI = &H8ADA
L_256D: CompareLeft! = N_8D56!: CompareRight! = N_8ADA!  ' RT3F_9F
L_2570: BX = 0
L_2573: IF CompareLeft! <= CompareRight! THEN GOTO L_2576  ' flags from L_256D
L_2575: BX = BX - 1
L_2576: FAC! = CSNG(BX)  ' RT3F_57
L_2579: DI = &H8D5A
L_257C: BX = SI
L_257E: N_8D5A! = FAC!: SI = &H001A  ' RT3F_7D
L_2581: SI = DI
L_2583: DI = &H8D6A
L_2586: FAC! = N_8D5A! * N_8D6A!  ' RT3F_8F
L_2589: DI = BX
L_258B: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_81
L_258E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2591: SI = BX
L_2593: DI = &H8D6E
L_2596: CompareLeft! = N(SI): CompareRight! = N_8D6E!  ' RT3F_9F
L_2599: DX = 0
L_259C: IF CompareLeft! <= CompareRight! THEN GOTO L_259F  ' flags from L_2596
L_259E: DX = DX - 1
L_259F: SWAP DX, BX
L_25A1: FAC! = CSNG(BX)  ' RT3F_57
L_25A4: DI = &H8D5E
L_25A7: N_8D5E! = FAC!: SI = &H001A  ' RT3F_7D
L_25AA: SI = DI
L_25AC: DI = &H8832
L_25AF: FAC! = N_8D5E! * N_8832!  ' RT3F_8F
L_25B2: DI = DX
L_25B4: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_81
L_25B7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_25BA: SI = DX
L_25BC: DI = &H8906
L_25BF: CompareLeft! = N(SI): CompareRight! = N_8906!  ' RT3F_9F
L_25C2: BX = 0
L_25C5: IF CompareLeft! <= CompareRight! THEN GOTO L_25C8  ' flags from L_25BF
L_25C7: BX = BX - 1
L_25C8: FAC! = CSNG(BX)  ' RT3F_57
L_25CB: DI = &H8D62
L_25CE: N_8D62! = FAC!: SI = &H001A  ' RT3F_7D
L_25D1: SI = DI
L_25D3: DI = &H880A
L_25D6: FAC! = N_8D62! * N_880A!  ' RT3F_8F
L_25D9: DI = DX
L_25DB: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_81
L_25DE: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_25E1: BX = 0
L_25E4: IF (CF OR ZF) THEN GOTO L_25E7  ' flags from L_25DE
L_25E6: BX = BX - 1
L_25E7: FAC! = CSNG(BX)  ' RT3F_57
L_25EA: DI = &H8D66
L_25ED: N_8D66! = FAC!: SI = &H001A  ' RT3F_7D
L_25F0: DI = &H8D72
L_25F3: SI = &H8AE6
L_25F6: N_8D72! = N_8AE6!  ' RT3F_7B
L_25F9: DI = &H8D76
L_25FC: N_8D76! = N_8AE6!  ' RT3F_7B
L_25FF: GOSUB L_1405
L_2602: SI = &H8BF0
L_2605: BX = CINT(N_8BF0!)  ' RT3F_75
L_2608: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8BF0, DI=DI, inlineTable=[L_25F0, L_2830, L_25F0, L_25F0, L_2866, L_25F0, L_289C, L_25F0, L_25F0, L_28D2, L_25F0, L_25F0, L_25F0, L_597C, L_25F0, L_4F7E, L_37C3, L_35C0, L_25F0, L_41B8, L_25F0, L_25F0, L_25F0, L_3C56, L_25F0, L_25F0, L_25F0, L_25F0, L_5D4E, L_5EF1, L_6892, L_5F6A, L_53DA])  ' RT3F_5E
L_264E: GOTO L_25F0
L_2650: DI = &H8A68
L_2653: SI = &H8ADE
L_2656: N_8A68! = N_8ADE!  ' RT3F_7B
L_2659: DI = &H886E
L_265C: N_886E! = N_8ADE!  ' RT3F_7B
L_265F: GOSUB L_0409
L_2662: DI = &H8B28
L_2665: FAC! = FAC! * N_8B28!  ' RT3F_91
L_2668: BX = &H1A
L_266B: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_266E: DI = &H8B24
L_2671: N_8B24! = FAC!: SI = &H001A  ' RT3F_7D
L_2674: BX = 0xD
L_2677: LocateRow% = BX  ' RT3E_42
L_267A: BX = &H1A
L_267D: LOCATE LocateRow%, BX  ' RT3E_44
L_2680: ' PRINT statement begins
L_2683: SI = DI
L_2685: DI = &H8856
L_2688: N_8856! = N(SI)  ' RT3F_7B
L_268B: DI = &H885A
L_268E: SI = &H88E2
L_2691: N_885A! = N_88E2!  ' RT3F_7B
L_2694: GOSUB L_03C9
L_2697: BX = CINT(FAC!)  ' RT3F_77
L_269A: BX = BX * (2 ^ 1)
L_269C: BX = BX * (2 ^ 1)
L_269E: BX = BX + &H8290
L_26A2: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_26A5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_26A8: GOSUB L_14EC
L_26AB: DI = &H8B8C
L_26AE: SI = &H8B24
L_26B1: N_8B8C! = N_8B24!  ' RT3F_7B
L_26B4: DI = &H8856
L_26B7: SI = &H8B24
L_26BA: N_8856! = N_8B24!  ' RT3F_7B
L_26BD: DI = &H885A
L_26C0: SI = &H88B2
L_26C3: N_885A! = N_88B2!  ' RT3F_7B
L_26C6: GOSUB L_03C9
L_26C9: BX = CINT(FAC!)  ' RT3F_77
L_26CC: BX = BX * (2 ^ 1)
L_26CE: BX = BX * (2 ^ 1)
L_26D0: BX = BX + &H8030
L_26D4: DX = &H8802
L_26D7: S_8802$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_26DA: BX = DX
L_26DC: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_26DF: BX = BX + 0xD
L_26E2: FAC! = CSNG(BX)  ' RT3F_57
L_26E5: DI = &H890A
L_26E8: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H890A)  ' RT3F_89
L_26EB: BX = &H1A
L_26EE: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_26F1: SI = &H88AE
L_26F4: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88AE, DI=DI)  ' RT3F_9B
L_26F7: DI = &H8D7A
L_26FA: N_8D7A! = FAC!: SI = &H001A  ' RT3F_7D
L_26FD: BX = DX
L_26FF: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H001A, DI=&H8D7A)  ' RT3F_BA
L_2702: FAC! = CSNG(BX)  ' RT3F_57
L_2705: DI = &H88FE
L_2708: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88FE)  ' RT3F_89
L_270B: DI = &H8D7E
L_270E: N_8D7E! = FAC!: SI = &H001A  ' RT3F_7D
L_2711: SI = &H8D82
L_2714: FAC! = N_8D82!: DI = &H001E  ' RT3F_6F
L_2717: GOTO L_275F
L_271A: DI = &H87F2
L_271D: SI = &H8D7A
L_2720: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D7A, DI=&H87F2)  ' RT3F_7F
L_2723: BX = CINT(FAC!)  ' RT3F_77
L_2726: LocateRow% = BX  ' RT3E_42
L_2729: BX = &H1A
L_272C: LOCATE LocateRow%, BX  ' RT3E_44
L_272F: ' PRINT statement begins
L_2732: SI = DI
L_2734: DI = &H88FE
L_2737: FAC! = N(SI) * N_88FE!  ' RT3F_8F
L_273A: DI = &H827C
L_273D: BX = SI
L_273F: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_2742: DX = BX
L_2744: BX = CINT(FAC!)  ' RT3F_77
L_2747: SWAP BX, DX
L_2749: AX = BX
L_274B: BX = &H8802
L_274E: CX = 0xE
L_2751: RT3D_0A(AX=AX, BX=&H8802, CX=&H000E, DX=DX, SI=SI, DI=DI)  ' RT3D_0A
L_2754: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2757: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_275A: SI = AX
L_275C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_275F: DI = &H87F2
L_2762: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_2765: SI = DI
L_2767: DI = &H8D7E
L_276A: CompareLeft! = N_87F2!: CompareRight! = N_8D7E!  ' RT3F_9F
L_276D: IF CompareLeft! <= CompareRight! THEN GOTO L_271A  ' flags from L_276A
L_276F: DI = &H8856
L_2772: SI = &H8B24
L_2775: N_8856! = N_8B24!  ' RT3F_7B
L_2778: DI = &H885A
L_277B: BX = SI
L_277D: SI = &H889E
L_2780: N_885A! = N_889E!  ' RT3F_7B
L_2783: GOSUB L_03C9
L_2786: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_2789: IF ZF THEN GOTO L_278E  ' flags from L_2786
L_278B: GOTO L_279A
L_278E: DI = &H8C82
L_2791: SI = &H8B24
L_2794: N_8C82! = N_8B24!  ' RT3F_7B
L_2797: GOSUB L_1B23
L_279A: DI = &H8856
L_279D: SI = &H8B24
L_27A0: N_8856! = N_8B24!  ' RT3F_7B
L_27A3: DI = &H885A
L_27A6: SI = &H827C
L_27A9: N_885A! = N_827C!  ' RT3F_7B
L_27AC: GOSUB L_03C9
L_27AF: DI = &H8D86
L_27B2: N_8D86! = FAC!: SI = &H001A  ' RT3F_7D
L_27B5: SI = DI
L_27B7: DI = &H8B90
L_27BA: CompareLeft! = N_8D86!: CompareRight! = N_8B90!  ' RT3F_9F
L_27BD: IF CompareLeft! > CompareRight! THEN GOTO L_27C2  ' flags from L_27BA
L_27BF: GOTO L_27D0
L_27C2: SI = &H87AE
L_27C5: CompareLeft! = N_87AE!: CompareRight! = 0  ' RT3F_A7
L_27C8: IF CompareLeft! <> CompareRight! THEN GOTO L_27CD  ' flags from L_27C5
L_27CA: GOTO L_64E4
L_27CD: RT3E_2B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_2B
L_27D0: DI = &H8856
L_27D3: SI = &H8B24
L_27D6: N_8856! = N_8B24!  ' RT3F_7B
L_27D9: DI = &H885A
L_27DC: SI = &H8286
L_27DF: N_885A! = N_8286!  ' RT3F_7B
L_27E2: GOSUB L_03C9
L_27E5: DI = &H8D8A
L_27E8: N_8D8A! = FAC!: SI = &H001A  ' RT3F_7D
L_27EB: SI = DI
L_27ED: CompareLeft! = N_8D8A!: CompareRight! = 0  ' RT3F_A7
L_27F0: IF CompareLeft! <> CompareRight! THEN GOTO L_27F5  ' flags from L_27ED
L_27F2: GOTO L_34C5
L_27F5: SI = &H8D8A
L_27F8: CompareLeft! = N_8D8A!: CompareRight! = 0  ' RT3F_A7
L_27FB: IF CompareLeft! < CompareRight! THEN GOTO L_2800  ' flags from L_27F8
L_27FD: GOTO L_2822
L_2800: DI = &H8866
L_2803: SI = &H8B24
L_2806: N_8866! = N_8B24!  ' RT3F_7B
L_2809: DI = &H886A
L_280C: SI = &H8286
L_280F: N_886A! = N_8286!  ' RT3F_7B
L_2812: GOSUB L_03F0
L_2815: BX = CINT(FAC!)  ' RT3F_77
L_2818: DI = BX
L_281A: DI = DI * (2 ^ 1)
L_281C: WORD(DI + &H48B0) = 0
L_2822: SI = &H8D8A
L_2825: RT3F_2B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D8A, DI=DI)  ' RT3F_2B
L_2828: DI = SI
L_282A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_282D: GOTO L_6BF2
L_2830: SI = &H8D5E
L_2833: RT3F_1D(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D5E, DI=DI)  ' RT3F_1D
L_2836: CompareLeft% = BX: CompareRight% = 0
L_2838: IF CompareLeft% <> CompareRight% THEN GOTO L_283D  ' flags from L_2836
L_283A: GOTO L_285A
L_283D: DI = &H88D2
L_2840: SI = &H82D2
L_2843: FAC! = N_82D2! * N_88D2!  ' RT3F_8F
L_2846: BX = &H384
L_2849: DX = &H1A
L_284C: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_284F: BX = 0xFFFF
L_2852: DX = BX
L_2854: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_2857: GOTO L_25F0
L_285A: DI = &H8D76
L_285D: SI = &H8B90
L_2860: N_8D76! = N_8B90!  ' RT3F_7B
L_2863: GOTO L_2905
L_2866: SI = &H8D66
L_2869: RT3F_1D(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D66, DI=DI)  ' RT3F_1D
L_286C: CompareLeft% = BX: CompareRight% = 0
L_286E: IF CompareLeft% <> CompareRight% THEN GOTO L_2873  ' flags from L_286C
L_2870: GOTO L_2890
L_2873: DI = &H88D2
L_2876: SI = &H82D2
L_2879: FAC! = N_82D2! * N_88D2!  ' RT3F_8F
L_287C: BX = &H384
L_287F: DX = &H1A
L_2882: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_2885: BX = 0xFFFF
L_2888: DX = BX
L_288A: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_288D: GOTO L_25F0
L_2890: DI = &H8D72
L_2893: SI = &H8B90
L_2896: N_8D72! = N_8B90!  ' RT3F_7B
L_2899: GOTO L_2905
L_289C: SI = &H8D62
L_289F: RT3F_1D(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D62, DI=DI)  ' RT3F_1D
L_28A2: CompareLeft% = BX: CompareRight% = 0
L_28A4: IF CompareLeft% <> CompareRight% THEN GOTO L_28A9  ' flags from L_28A2
L_28A6: GOTO L_28C6
L_28A9: DI = &H88D2
L_28AC: SI = &H82D2
L_28AF: FAC! = N_82D2! * N_88D2!  ' RT3F_8F
L_28B2: BX = &H384
L_28B5: DX = &H1A
L_28B8: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_28BB: BX = 0xFFFF
L_28BE: DX = BX
L_28C0: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_28C3: GOTO L_25F0
L_28C6: DI = &H8D72
L_28C9: SI = &H827C
L_28CC: N_8D72! = N_827C!  ' RT3F_7B
L_28CF: GOTO L_2905
L_28D2: SI = &H8D5A
L_28D5: RT3F_1D(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D5A, DI=DI)  ' RT3F_1D
L_28D8: CompareLeft% = BX: CompareRight% = 0
L_28DA: IF CompareLeft% <> CompareRight% THEN GOTO L_28DF  ' flags from L_28D8
L_28DC: GOTO L_28FC
L_28DF: DI = &H88D2
L_28E2: SI = &H82D2
L_28E5: FAC! = N_82D2! * N_88D2!  ' RT3F_8F
L_28E8: BX = &H384
L_28EB: DX = &H1A
L_28EE: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_28F1: BX = 0xFFFF
L_28F4: DX = BX
L_28F6: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_28F9: GOTO L_25F0
L_28FC: DI = &H8D76
L_28FF: SI = &H827C

```

### Traps

```basic
L_2902: N_8D76! = N_827C!  ' RT3F_7B
L_2905: DI = &H8D72
L_2908: SI = &H48A0
L_290B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A0, DI=&H8D72)  ' RT3F_7F
L_290E: DI = SI
L_2910: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2913: DI = &H8D76
L_2916: SI = &H48A4
L_2919: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A4, DI=&H8D76)  ' RT3F_7F
L_291C: DI = SI
L_291E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_2921: DI = &H886E
L_2924: SI = &H87FA
L_2927: N_886E! = N_87FA!  ' RT3F_7B
L_292A: GOSUB L_0409
L_292D: DI = &H8B28
L_2930: FAC! = FAC! * N_8B28!  ' RT3F_91
L_2933: BX = &H1A
L_2936: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_2939: DI = &H8D8E
L_293C: N_8D8E! = FAC!: SI = &H001A  ' RT3F_7D
L_293F: BX = DI
L_2941: DI = &H886E
L_2944: SI = &H87FA
L_2947: N_886E! = N_87FA!  ' RT3F_7B
L_294A: GOSUB L_0409
L_294D: SI = &H8D8E
L_2950: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D8E, DI=DI, inline=&H80)  ' RT3F_71
L_2954: RT3F_AB(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H06)  ' RT3F_AB
L_2958: RT3F_9D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_9D
L_295C: DI = &H8D92
L_295F: N_8D92! = FAC!: SI = &H001A  ' RT3F_7D
L_2962: DI = &H8CA2
L_2965: SI = &H8D92
L_2968: CompareLeft! = N_8D92!: CompareRight! = N_8CA2!  ' RT3F_9F
L_296B: BX = 0
L_296E: IF CompareLeft! >= CompareRight! THEN GOTO L_2971  ' flags from L_2968
L_2970: BX = BX - 1
L_2971: DI = &H8960
L_2974: CompareLeft! = N(SI): CompareRight! = N_8960!  ' RT3F_9F
L_2977: DX = 0
L_297A: IF CompareLeft! <= CompareRight! THEN GOTO L_297D  ' flags from L_2974
L_297C: DX = DX - 1
L_297D: DX = DX OR BX
L_297F: CompareLeft% = DX: CompareRight% = 0
L_2981: IF CompareLeft% = CompareRight% THEN GOTO L_2986  ' flags from L_297F
L_2983: GOTO L_2F18
L_2986: GOSUB L_6169
L_2989: DI = &H8856
L_298C: SI = &H8D8E
L_298F: N_8856! = N_8D8E!  ' RT3F_7B
L_2992: DI = &H885A
L_2995: SI = &H8AE6
L_2998: N_885A! = N_8AE6!  ' RT3F_7B
L_299B: GOSUB L_03C9
L_299E: DI = &H8D96
L_29A1: N_8D96! = FAC!: SI = &H001A  ' RT3F_7D
L_29A4: SI = DI
L_29A6: DI = &H827C
L_29A9: CompareLeft! = N_8D96!: CompareRight! = N_827C!  ' RT3F_9F
L_29AC: IF CompareLeft! >= CompareRight! THEN GOTO L_29B1  ' flags from L_29A9
L_29AE: GOTO L_2F18
L_29B1: DI = &H8A68
L_29B4: SI = &H87FA
L_29B7: N_8A68! = N_87FA!  ' RT3F_7B
L_29BA: GOSUB L_14CA
L_29BD: DI = &H88E2
L_29C0: SI = &H8D96
L_29C3: CompareLeft! = N_8D96!: CompareRight! = N_88E2!  ' RT3F_9F
L_29C6: IF CompareLeft! < CompareRight! THEN GOTO L_29CB  ' flags from L_29C3
L_29C8: GOTO L_2A9B
L_29CB: SI = &H4890
L_29CE: CompareLeft! = N_4890!: CompareRight! = 0  ' RT3F_A7
L_29D1: IF CompareLeft! <> CompareRight! THEN GOTO L_29D6  ' flags from L_29CE
L_29D3: GOTO L_2A98
L_29D6: DI = &H8A68
L_29D9: SI = &H827C
L_29DC: N_8A68! = N_827C!  ' RT3F_7B
L_29DF: BX = 0xF
L_29E2: LocateRow% = BX  ' RT3E_42
L_29E5: BX = &H1A
L_29E8: LOCATE LocateRow%, BX  ' RT3E_44
L_29EB: ' PRINT statement begins
L_29EE: DX = BX
L_29F0: BX = &H8D9A
L_29F3: PRINT S_8D9A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_29F6: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_29F9: BX = &H10
L_29FC: LocateRow% = BX  ' RT3E_42
L_29FF: BX = DX
L_2A01: LOCATE LocateRow%, BX  ' RT3E_44
L_2A04: ' PRINT statement begins
L_2A07: BX = &H8DAC
L_2A0A: PRINT S_8DAC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2A0D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2A10: DI = &H8DBA
L_2A13: BX = SI
L_2A15: SI = &H8DBE
L_2A18: N_8DBA! = N_8DBE!  ' RT3F_7B
L_2A1B: SI = BX
L_2A1D: FAC! = N(SI): DI = &H001E  ' RT3F_6F
L_2A20: GOTO L_2A7C
L_2A23: ' Alignment NOP
L_2A24: SI = &H827C
L_2A27: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_2A2A: GOTO L_2A3A
L_2A2D: ' Alignment NOP
L_2A2E: GOSUB L_5829
L_2A31: DI = &H827C
L_2A34: SI = &H8DBE
L_2A37: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8DBE, DI=&H827C)  ' RT3F_7F
L_2A3A: DI = &H8DBE
L_2A3D: N_8DBE! = FAC!: SI = &H001A  ' RT3F_7D
L_2A40: SI = DI
L_2A42: DI = &H88F6
L_2A45: CompareLeft! = N_8DBE!: CompareRight! = N_88F6!  ' RT3F_9F
L_2A48: IF CompareLeft! <= CompareRight! THEN GOTO L_2A2E  ' flags from L_2A45
L_2A4A: BX = &H22B
L_2A4D: DX = &H82D2
L_2A50: RT3E_5E(AX=AX, BX=&H022B, CX=CX, DX=&H82D2, SI=SI, DI=DI)  ' RT3E_5E
L_2A53: BX = 0xFFFF
L_2A56: DX = BX
L_2A58: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_2A5B: SI = &H82D2
L_2A5E: RT3F_AB(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H82D2, DI=DI, inline=&H01)  ' RT3F_AB
L_2A62: BX = &H4D2
L_2A65: DX = &H1A
L_2A68: RT3E_5E(AX=AX, BX=&H04D2, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_2A6B: BX = 0xFFFF
L_2A6E: DX = BX
L_2A70: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_2A73: DI = &H827C
L_2A76: SI = &H87F2
L_2A79: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_2A7C: DI = &H87F2
L_2A7F: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_2A82: SI = DI
L_2A84: DI = &H88AE
L_2A87: CompareLeft! = N_87F2!: CompareRight! = N_88AE!  ' RT3F_9F
L_2A8A: IF CompareLeft! <= CompareRight! THEN GOTO L_2A24  ' flags from L_2A87
L_2A8C: DI = &H8DBE
L_2A8F: SI = &H8DBA
L_2A92: N_8DBE! = N_8DBA!  ' RT3F_7B
L_2A95: GOTO L_2B7F
L_2A98: GOTO L_2C63
L_2A9B: SI = &H827C
L_2A9E: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_2AA1: GOTO L_2B61
L_2AA4: DI = &H882A
L_2AA7: SI = &H888E
L_2AAA: N_882A! = N_888E!  ' RT3F_7B
L_2AAD: BX = DI
L_2AAF: DI = &H882E
L_2AB2: SI = &H8AD2
L_2AB5: N_882E! = N_8AD2!  ' RT3F_7B
L_2AB8: GOSUB L_0359
L_2ABB: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_2ABE: BX = 0
L_2AC1: IF (CF OR ZF) THEN GOTO L_2AC4  ' flags from L_2ABB
L_2AC3: BX = BX - 1
L_2AC4: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_2AC7: DI = &H8832
L_2ACA: FAC! = FAC! * N_8832!  ' RT3F_91
L_2ACD: DI = &H882A
L_2AD0: SI = &H8DD2
L_2AD3: N_882A! = N_8DD2!  ' RT3F_7B
L_2AD6: DI = &H882E
L_2AD9: SI = &H8AD2
L_2ADC: N_882E! = N_8AD2!  ' RT3F_7B
L_2ADF: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H882E, inline=&H80)  ' RT3F_71
L_2AE3: WORD(BP - 6) = BX
L_2AE6: GOSUB L_0359
L_2AE9: DI = &H880A
L_2AEC: FAC! = FAC! * N_880A!  ' RT3F_91
L_2AEF: DI = &H889E
L_2AF2: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H889E)  ' RT3F_81
L_2AF5: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_A5
L_2AF9: BX = 0
L_2AFC: IF NOT CF THEN GOTO L_2AFF  ' flags from L_2AF5
L_2AFE: BX = BX - 1
L_2AFF: BX = BX AND WORD(BP - 6)
L_2B02: CompareLeft% = BX: CompareRight% = 0
L_2B04: IF CompareLeft% <> CompareRight% THEN GOTO L_2B09  ' flags from L_2B02
L_2B06: GOTO L_2B58
L_2B09: DI = &H8A68
L_2B0C: SI = &H827C
L_2B0F: N_8A68! = N_827C!  ' RT3F_7B
L_2B12: BX = 0xF
L_2B15: LocateRow% = BX  ' RT3E_42
L_2B18: BX = &H1A
L_2B1B: LOCATE LocateRow%, BX  ' RT3E_44
L_2B1E: ' PRINT statement begins
L_2B21: SI = &H8AD2
L_2B24: DX = SI
L_2B26: CX = BX
L_2B28: BX = CINT(N_8AD2!)  ' RT3F_75
L_2B2B: BX = BX * (2 ^ 1)
L_2B2D: BX = BX * (2 ^ 1)
L_2B2F: BX = BX + &H4288
L_2B33: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2B36: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2B39: BX = &H10
L_2B3C: LocateRow% = BX  ' RT3E_42
L_2B3F: BX = CX
L_2B41: LOCATE LocateRow%, BX  ' RT3E_44
L_2B44: ' PRINT statement begins
L_2B47: BX = &H8DC2
L_2B4A: PRINT S_8DC2$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2B4D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2B50: DI = DX
L_2B52: SI = &H88D2
L_2B55: N(DI) = N_88D2!  ' RT3F_7B
L_2B58: DI = &H827C
L_2B5B: SI = &H8AD2
L_2B5E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H827C)  ' RT3F_7F
L_2B61: DI = &H8AD2
L_2B64: N_8AD2! = FAC!: SI = &H001A  ' RT3F_7D
L_2B67: SI = DI
L_2B69: DI = &H8812
L_2B6C: CompareLeft! = N_8AD2!: CompareRight! = N_8812!  ' RT3F_9F
L_2B6F: IF CompareLeft! > CompareRight! THEN GOTO L_2B74  ' flags from L_2B6C
L_2B71: GOTO L_2AA4
L_2B74: SI = &H8A68
L_2B77: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_2B7A: IF CompareLeft! <> CompareRight! THEN GOTO L_2B7F  ' flags from L_2B77
L_2B7C: GOTO L_2C63
L_2B7F: BX = &H13
L_2B82: LocateRow% = BX  ' RT3E_42
L_2B85: BX = &H1A
L_2B88: LOCATE LocateRow%, BX  ' RT3E_44
L_2B8B: ' PRINT statement begins
L_2B8E: DX = BX
L_2B90: BX = &H8DD6
L_2B93: PRINT S_8DD6$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2B96: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2B99: BX = &H14
L_2B9C: LocateRow% = BX  ' RT3E_42
L_2B9F: BX = DX
L_2BA1: LOCATE LocateRow%, BX  ' RT3E_44
L_2BA4: ' PRINT statement begins
L_2BA7: SI = &H8E04
L_2BAA: BX = CINT(N_8E04!)  ' RT3F_75
L_2BAD: BX = BX * (2 ^ 1)
L_2BAF: BX = BX * (2 ^ 1)
L_2BB1: BX = BX + &H4288
L_2BB5: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_2BB8: BX = &H8DE8
L_2BBB: PRINT S_8DE8$;  ' RT3F_6A; separator/format variant retained by RT tag
L_2BBE: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2BC1: BX = &H15
L_2BC4: LocateRow% = BX  ' RT3E_42
L_2BC7: BX = DX
L_2BC9: LOCATE LocateRow%, BX  ' RT3E_44
L_2BCC: ' PRINT statement begins
L_2BCF: BX = &H8DF2
L_2BD2: PRINT S_8DF2$;  ' RT3F_6A; separator/format variant retained by RT tag
L_2BD5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2BD8: GOSUB L_1ABD
L_2BDB: SI = &H888A
L_2BDE: CompareLeft! = N_888A!: CompareRight! = 0  ' RT3F_A7
L_2BE1: IF CompareLeft! = CompareRight! THEN GOTO L_2BE6  ' flags from L_2BDE
L_2BE3: GOTO L_2BFB
L_2BE6: DI = &H48A0
L_2BE9: SI = &H48A8
L_2BEC: N_48A0! = N_48A8!  ' RT3F_7B
L_2BEF: DI = &H48A4
L_2BF2: SI = &H48AC
L_2BF5: N_48A4! = N_48AC!  ' RT3F_7B
L_2BF8: GOTO L_2408
L_2BFB: DI = &H880A
L_2BFE: SI = &H8E08
L_2C01: FAC! = N_8E08! * N_880A!  ' RT3F_8F
L_2C04: DI = &H87FE
L_2C07: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H87FE)  ' RT3F_81
L_2C0A: DI = &H8E0C
L_2C0D: N_8E0C! = FAC!: SI = &H001A  ' RT3F_7D
L_2C10: SI = DI
L_2C12: DI = &H8E10
L_2C15: CompareLeft! = N_8E0C!: CompareRight! = N_8E10!  ' RT3F_9F
L_2C18: IF CompareLeft! > CompareRight! THEN GOTO L_2C1D  ' flags from L_2C15
L_2C1A: GOTO L_2C22
L_2C1D: SWAP DI, SI
L_2C1F: N(DI) = N(SI)  ' RT3F_7B
L_2C22: BX = &H17
L_2C25: LocateRow% = BX  ' RT3E_42
L_2C28: BX = &H1A
L_2C2B: LOCATE LocateRow%, BX  ' RT3E_44
L_2C2E: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_2C31: DI = &H8832
L_2C34: FAC! = FAC! * N_8832!  ' RT3F_91
L_2C37: DI = &H8E0C
L_2C3A: CompareLeft! = FAC!: CompareRight! = N_8E0C!  ' RT3F_A1
L_2C3D: IF CompareLeft! < CompareRight! THEN GOTO L_2C42  ' flags from L_2C3A
L_2C3F: GOTO L_2C54
L_2C42: ' PRINT statement begins
L_2C45: BX = &H8E14
L_2C48: PRINT S_8E14$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2C4B: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2C4E: GOSUB L_128E
L_2C51: GOTO L_2EE1
L_2C54: ' PRINT statement begins
L_2C57: BX = &H8E24
L_2C5A: PRINT S_8E24$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2C5D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2C60: GOSUB L_128E
L_2C63: GOSUB L_14CA
L_2C66: BX = 0xF
L_2C69: LocateRow% = BX  ' RT3E_42
L_2C6C: BX = &H1A
L_2C6F: LOCATE LocateRow%, BX  ' RT3E_44
L_2C72: DI = &H8E30
L_2C75: SI = &H8D96
L_2C78: FAC! = N_8D96! * N_8E30!  ' RT3F_8F
L_2C7B: BX = &H1A
L_2C7E: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_2C81: DI = &H827C
L_2C84: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_2C87: BX = CINT(FAC!)  ' RT3F_77
L_2C8A: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTable=[L_2C92, L_2DD7])  ' RT3F_5E
L_2C92: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_2C95: DI = &H8812
L_2C98: FAC! = FAC! * N_8812!  ' RT3F_91
L_2C9B: DI = &H827C
L_2C9E: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_2CA1: BX = &H1A
L_2CA4: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_2CA7: DI = &H8E46
L_2CAA: N_8E46! = FAC!: SI = &H001A  ' RT3F_7D
L_2CAD: ' PRINT statement begins
L_2CB0: BX = &H8E34
L_2CB3: PRINT S_8E34$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2CB6: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2CB9: DI = &H890A
L_2CBC: SI = &H82D2
L_2CBF: FAC! = N_82D2! * N_890A!  ' RT3F_8F
L_2CC2: BX = &H384
L_2CC5: DX = &H1A
L_2CC8: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_2CCB: BX = 0xFFFF
L_2CCE: DX = BX
L_2CD0: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_2CD3: SI = &H827C
L_2CD6: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_2CD9: GOTO L_2DC1
L_2CDC: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_2CDF: DI = &H8832
L_2CE2: FAC! = FAC! * N_8832!  ' RT3F_91
L_2CE5: DI = &H8B90
L_2CE8: SI = &H8D96
L_2CEB: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D96, DI=&H8B90, inline=&H80)  ' RT3F_71
L_2CEF: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_2CF2: SI = &H8286
L_2CF5: RT3F_27(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8286, DI=DI)  ' RT3F_27
L_2CF8: DI = &H87F6
L_2CFB: BX = SI
L_2CFD: FAC! = FAC! * N_87F6!  ' RT3F_91
L_2D00: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_A5
L_2D04: DX = 0
L_2D07: IF NOT CF THEN GOTO L_2D0A  ' flags from L_2D00
L_2D09: DX = DX - 1
L_2D0A: DI = &H8E46
L_2D0D: SI = &H8AD2
L_2D10: CompareLeft! = N_8AD2!: CompareRight! = N_8E46!  ' RT3F_9F
L_2D13: CX = 0
L_2D16: IF CompareLeft! <> CompareRight! THEN GOTO L_2D19  ' flags from L_2D10
L_2D18: CX = CX - 1
L_2D19: CX = CX OR DX
L_2D1B: DI = &H882A
L_2D1E: DX = SI
L_2D20: SI = &H888E
L_2D23: N_882A! = N_888E!  ' RT3F_7B
L_2D26: SWAP DX, SI
L_2D28: DI = &H882E
L_2D2B: N_882E! = N(SI)  ' RT3F_7B
L_2D2E: WORD(BP - 6) = CX
L_2D31: GOSUB L_0359
L_2D34: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_2D37: BX = 0
L_2D3A: IF (CF OR ZF) THEN GOTO L_2D3D  ' flags from L_2D34
L_2D3C: BX = BX - 1
L_2D3D: BX = BX AND WORD(BP - 6)
L_2D40: CompareLeft% = BX: CompareRight% = 0
L_2D42: IF CompareLeft% <> CompareRight% THEN GOTO L_2D47  ' flags from L_2D40
L_2D44: GOTO L_2DB8
L_2D47: BX = &H13
L_2D4A: LocateRow% = BX  ' RT3E_42
L_2D4D: BX = &H1A
L_2D50: LOCATE LocateRow%, BX  ' RT3E_44
L_2D53: ' PRINT statement begins
L_2D56: SI = &H8AD2
L_2D59: DX = SI
L_2D5B: CX = BX
L_2D5D: BX = CINT(N_8AD2!)  ' RT3F_75
L_2D60: BX = BX * (2 ^ 1)
L_2D62: BX = BX * (2 ^ 1)
L_2D64: BX = BX + &H4288
L_2D68: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2D6B: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2D6E: BX = &H14
L_2D71: LocateRow% = BX  ' RT3E_42
L_2D74: BX = CX
L_2D76: LOCATE LocateRow%, BX  ' RT3E_44
L_2D79: ' PRINT statement begins
L_2D7C: BX = &H8E4A
L_2D7F: PRINT S_8E4A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2D82: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2D85: DI = &H883E
L_2D88: SI = &H888E
L_2D8B: N_883E! = N_888E!  ' RT3F_7B
L_2D8E: SI = DX
L_2D90: DI = &H8842
L_2D93: N_8842! = N(SI)  ' RT3F_7B
L_2D96: GOSUB L_038B
L_2D99: BX = CINT(FAC!)  ' RT3F_77
L_2D9C: DI = BX
L_2D9E: DI = DI * (2 ^ 1)
L_2DA0: DI = DI * (2 ^ 1)
L_2DA2: DI = DI + &H1850
L_2DA6: SI = &H8286
L_2DA9: N(DI) = N_8286!  ' RT3F_7B
L_2DAC: GOSUB L_128E
L_2DAF: GOSUB L_128E
L_2DB2: GOSUB L_128E
L_2DB5: GOSUB L_14CA
L_2DB8: DI = &H827C
L_2DBB: SI = &H8AD2
L_2DBE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H827C)  ' RT3F_7F
L_2DC1: DI = &H8AD2
L_2DC4: N_8AD2! = FAC!: SI = &H001A  ' RT3F_7D
L_2DC7: SI = DI
L_2DC9: DI = &H8812
L_2DCC: CompareLeft! = N_8AD2!: CompareRight! = N_8812!  ' RT3F_9F
L_2DCF: IF CompareLeft! > CompareRight! THEN GOTO L_2DD4  ' flags from L_2DCC
L_2DD1: GOTO L_2CDC
L_2DD4: GOTO L_2EE1
L_2DD7: ' PRINT statement begins
L_2DDA: BX = &H8E5A
L_2DDD: PRINT S_8E5A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2DE0: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2DE3: DI = &H890A
L_2DE6: SI = &H82D2
L_2DE9: FAC! = N_82D2! * N_890A!  ' RT3F_8F
L_2DEC: BX = &H384
L_2DEF: DX = &H1A
L_2DF2: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_2DF5: BX = 0xFFFF
L_2DF8: DX = BX
L_2DFA: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_2DFD: SI = &H827C
L_2E00: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_2E03: GOTO L_2ECB
L_2E06: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_2E09: DI = &H8E6C
L_2E0C: FAC! = FAC! * N_8E6C!  ' RT3F_91
L_2E0F: DI = &H882A
L_2E12: SI = &H827C
L_2E15: N_882A! = N_827C!  ' RT3F_7B
L_2E18: BX = DI
L_2E1A: DI = &H882E
L_2E1D: SI = &H8AD2
L_2E20: N_882E! = N_8AD2!  ' RT3F_7B
L_2E23: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=DX, SI=&H8AD2, DI=&H882E, inline=&H80)  ' RT3F_71
L_2E27: GOSUB L_0359
L_2E2A: DI = &H8E70
L_2E2D: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8E70)  ' RT3F_81
L_2E30: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_A5
L_2E34: BX = 0
L_2E37: IF (CF OR ZF) THEN GOTO L_2E3A  ' flags from L_2E30
L_2E39: BX = BX - 1
L_2E3A: DI = &H882A
L_2E3D: SI = &H888E
L_2E40: N_882A! = N_888E!  ' RT3F_7B
L_2E43: DI = &H882E
L_2E46: SI = &H8AD2
L_2E49: N_882E! = N_8AD2!  ' RT3F_7B
L_2E4C: WORD(BP - 6) = BX
L_2E4F: GOSUB L_0359
L_2E52: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_2E55: BX = 0
L_2E58: IF (CF OR ZF) THEN GOTO L_2E5B  ' flags from L_2E52
L_2E5A: BX = BX - 1
L_2E5B: BX = BX AND WORD(BP - 6)
L_2E5E: CompareLeft% = BX: CompareRight% = 0
L_2E60: IF CompareLeft% <> CompareRight% THEN GOTO L_2E65  ' flags from L_2E5E
L_2E62: GOTO L_2EC2
L_2E65: BX = &H13
L_2E68: LocateRow% = BX  ' RT3E_42
L_2E6B: BX = &H1A
L_2E6E: LOCATE LocateRow%, BX  ' RT3E_44
L_2E71: ' PRINT statement begins
L_2E74: SI = &H8AD2
L_2E77: DX = BX
L_2E79: BX = CINT(N_8AD2!)  ' RT3F_75
L_2E7C: BX = BX * (2 ^ 1)
L_2E7E: BX = BX * (2 ^ 1)
L_2E80: BX = BX + &H4288
L_2E84: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2E87: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2E8A: BX = &H14
L_2E8D: LocateRow% = BX  ' RT3E_42
L_2E90: BX = DX
L_2E92: LOCATE LocateRow%, BX  ' RT3E_44
L_2E95: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_2E98: DI = &H8D96
L_2E9B: FAC! = FAC! * N_8D96!  ' RT3F_91
L_2E9E: FAC! = FAC! * N(DI)  ' RT3F_91
L_2EA1: DI = &H8906
L_2EA4: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8906)  ' RT3F_81
L_2EA7: BX = &H1A
L_2EAA: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_2EAD: DI = &H8AD6
L_2EB0: N_8AD6! = FAC!: SI = &H001A  ' RT3F_7D
L_2EB3: GOSUB L_6217
L_2EB6: GOSUB L_128E
L_2EB9: GOSUB L_128E
L_2EBC: GOSUB L_128E
L_2EBF: GOSUB L_14CA
L_2EC2: DI = &H827C
L_2EC5: SI = &H8AD2
L_2EC8: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H827C)  ' RT3F_7F
L_2ECB: DI = &H8AD2
L_2ECE: N_8AD2! = FAC!: SI = &H001A  ' RT3F_7D
L_2ED1: SI = DI
L_2ED3: DI = &H8812
L_2ED6: CompareLeft! = N_8AD2!: CompareRight! = N_8812!  ' RT3F_9F
L_2ED9: IF CompareLeft! > CompareRight! THEN GOTO L_2EDE  ' flags from L_2ED6
L_2EDB: GOTO L_2E06
L_2EDE: GOTO L_2EE1
L_2EE1: DI = &H8866
L_2EE4: SI = &H8D8E
L_2EE7: N_8866! = N_8D8E!  ' RT3F_7B
L_2EEA: DI = &H886A
L_2EED: SI = &H88F2
L_2EF0: N_886A! = N_88F2!  ' RT3F_7B
L_2EF3: GOSUB L_03F0
L_2EF6: BX = CINT(FAC!)  ' RT3F_77
L_2EF9: DI = BX
L_2EFB: DI = DI * (2 ^ 1)
L_2EFD: WORD(DI + &H48B0) = 0

```

### Vault door

```basic
L_2F03: DI = &H48A8
L_2F06: SI = &H48A0
L_2F09: N_48A8! = N_48A0!  ' RT3F_7B
L_2F0C: DI = &H48AC
L_2F0F: SI = &H48A4
L_2F12: N_48AC! = N_48A4!  ' RT3F_7B
L_2F15: GOTO L_2408
L_2F18: DI = &H8E74
L_2F1B: SI = &H8D92
L_2F1E: CompareLeft! = N_8D92!: CompareRight! = N_8E74!  ' RT3F_9F
L_2F21: BX = 0
L_2F24: IF CompareLeft! >= CompareRight! THEN GOTO L_2F27  ' flags from L_2F1E
L_2F26: BX = BX - 1
L_2F27: DI = &H88C2
L_2F2A: CompareLeft! = N(SI): CompareRight! = N_88C2!  ' RT3F_9F
L_2F2D: DX = 0
L_2F30: IF CompareLeft! <= CompareRight! THEN GOTO L_2F33  ' flags from L_2F2A
L_2F32: DX = DX - 1
L_2F33: DX = DX OR BX
L_2F35: CompareLeft% = DX: CompareRight% = 0
L_2F37: IF CompareLeft% = CompareRight% THEN GOTO L_2F3C  ' flags from L_2F35
L_2F39: GOTO L_34B7
L_2F3C: DI = &H8856
L_2F3F: SI = &H8D8E
L_2F42: N_8856! = N_8D8E!  ' RT3F_7B
L_2F45: BX = DI
L_2F47: DI = &H885A
L_2F4A: DX = SI
L_2F4C: SI = &H8812
L_2F4F: N_885A! = N_8812!  ' RT3F_7B
L_2F52: GOSUB L_03C9
L_2F55: RT3F_2D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2D
L_2F58: DI = &H8E78
L_2F5B: N_8E78! = FAC!: SI = &H001A  ' RT3F_7D
L_2F5E: BX = DI
L_2F60: DI = &H8856
L_2F63: SI = &H8D8E
L_2F66: N_8856! = N_8D8E!  ' RT3F_7B
L_2F69: DI = &H885A
L_2F6C: SI = &H8812
L_2F6F: N_885A! = N_8812!  ' RT3F_7B
L_2F72: GOSUB L_03C9
L_2F75: RT3F_31(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_31
L_2F78: DI = &H8E7C
L_2F7B: N_8E7C! = FAC!: SI = &H001A  ' RT3F_7D
L_2F7E: DI = &H827C
L_2F81: SI = &H8E78
L_2F84: CompareLeft! = N_8E78!: CompareRight! = N_827C!  ' RT3F_9F
L_2F87: IF CompareLeft! >= CompareRight! THEN GOTO L_2F8C  ' flags from L_2F84
L_2F89: GOTO L_34B7
L_2F8C: GOSUB L_14CA
L_2F8F: BX = 0xF
L_2F92: LocateRow% = BX  ' RT3E_42
L_2F95: BX = &H1A
L_2F98: LOCATE LocateRow%, BX  ' RT3E_44
L_2F9B: ' PRINT statement begins
L_2F9E: BX = &H8E80
L_2FA1: PRINT S_8E80$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2FA4: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2FA7: GOSUB L_3452
L_2FAA: BX = &H13
L_2FAD: LocateRow% = BX  ' RT3E_42
L_2FB0: BX = &H1A
L_2FB3: LOCATE LocateRow%, BX  ' RT3E_44
L_2FB6: ' PRINT statement begins
L_2FB9: DX = BX
L_2FBB: BX = &H8E90
L_2FBE: PRINT S_8E90$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2FC1: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2FC4: BX = &H14
L_2FC7: LocateRow% = BX  ' RT3E_42
L_2FCA: BX = DX
L_2FCC: LOCATE LocateRow%, BX  ' RT3E_44
L_2FCF: ' PRINT statement begins
L_2FD2: BX = &H8E9C
L_2FD5: PRINT S_8E9C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2FD8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2FDB: BX = &H15
L_2FDE: LocateRow% = BX  ' RT3E_42
L_2FE1: BX = DX
L_2FE3: LOCATE LocateRow%, BX  ' RT3E_44
L_2FE6: ' PRINT statement begins
L_2FE9: BX = &H8EAC
L_2FEC: PRINT S_8EAC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_2FEF: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_2FF2: BX = &H16
L_2FF5: LocateRow% = BX  ' RT3E_42
L_2FF8: BX = DX
L_2FFA: LOCATE LocateRow%, BX  ' RT3E_44
L_2FFD: ' PRINT statement begins
L_3000: BX = &H8EBE
L_3003: PRINT S_8EBE$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3006: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3009: DI = &H8C00
L_300C: SI = &H88E2
L_300F: N_8C00! = N_88E2!  ' RT3F_7B
L_3012: DI = &H8BFC
L_3015: SI = &H827C
L_3018: N_8BFC! = N_827C!  ' RT3F_7B
L_301B: GOSUB L_12E9
L_301E: SI = &H8BF0
L_3021: CompareLeft! = N_8BF0!: CompareRight! = 0  ' RT3F_A7
L_3024: IF CompareLeft! < CompareRight! THEN GOTO L_3029  ' flags from L_3021
L_3026: GOTO L_3031
L_3029: DI = SI
L_302B: SI = &H827C
L_302E: N(DI) = N_827C!  ' RT3F_7B
L_3031: SI = &H8BF0
L_3034: BX = CINT(N_8BF0!)  ' RT3F_75
L_3037: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8BF0, DI=DI, inlineTable=[L_3043, L_308A, L_31EF, L_338D])  ' RT3F_5E
L_3043: DI = &H8E7C
L_3046: SI = &H8E78
L_3049: FAC! = N_8E78! * N_8E7C!  ' RT3F_8F
L_304C: BX = CINT(FAC!)  ' RT3F_77
L_304F: DI = &H8866
L_3052: SI = &H8D8E
L_3055: N_8866! = N_8D8E!  ' RT3F_7B
L_3058: DI = &H886A
L_305B: SI = &H8812
L_305E: N_886A! = N_8812!  ' RT3F_7B
L_3061: WORD(BP - 6) = BX
L_3064: GOSUB L_03F0
L_3067: BX = CINT(FAC!)  ' RT3F_77
L_306A: DI = BX
L_306C: DI = DI * (2 ^ 1)
L_306E: BX = WORD(BP - 6)
L_3071: WORD(DI + &H48B0) = BX
L_3075: DI = &H48A0
L_3078: SI = &H48A8
L_307B: N_48A0! = N_48A8!  ' RT3F_7B
L_307E: DI = &H48A4
L_3081: SI = &H48AC
L_3084: N_48A4! = N_48AC!  ' RT3F_7B
L_3087: GOTO L_2408
L_308A: GOSUB L_14CA
L_308D: DI = &H8C3E
L_3090: SI = &H8812
L_3093: N_8C3E! = N_8812!  ' RT3F_7B
L_3096: GOSUB L_1707
L_3099: SI = &H8A68
L_309C: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_309F: IF CompareLeft! = CompareRight! THEN GOTO L_30A4  ' flags from L_309C
L_30A1: GOTO L_30D9
L_30A4: DI = &H8C3E
L_30A7: SI = &H889E
L_30AA: N_8C3E! = N_889E!  ' RT3F_7B
L_30AD: GOSUB L_1707
L_30B0: SI = &H8A68
L_30B3: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_30B6: IF CompareLeft! = CompareRight! THEN GOTO L_30BB  ' flags from L_30B3
L_30B8: GOTO L_30D9
L_30BB: BX = &H13
L_30BE: LocateRow% = BX  ' RT3E_42
L_30C1: BX = &H1A
L_30C4: LOCATE LocateRow%, BX  ' RT3E_44
L_30C7: ' PRINT statement begins
L_30CA: BX = &H8ECE
L_30CD: PRINT S_8ECE$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_30D0: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_30D3: GOSUB L_128E
L_30D6: GOTO L_2F8C
L_30D9: BX = &H13
L_30DC: LocateRow% = BX  ' RT3E_42
L_30DF: BX = &H1A
L_30E2: LOCATE LocateRow%, BX  ' RT3E_44
L_30E5: ' PRINT statement begins
L_30E8: SI = &H8C46
L_30EB: DX = BX
L_30ED: BX = CINT(N_8C46!)  ' RT3F_75
L_30F0: BX = BX * (2 ^ 1)
L_30F2: BX = BX * (2 ^ 1)
L_30F4: BX = BX + &H4288
L_30F8: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_30FB: BX = &H8EDC
L_30FE: PRINT S_8EDC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3101: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3104: BX = &H14
L_3107: LocateRow% = BX  ' RT3E_42
L_310A: BX = DX
L_310C: LOCATE LocateRow%, BX  ' RT3E_44
L_310F: ' PRINT statement begins
L_3112: DI = &H8B90
L_3115: SI = &H8C3E
L_3118: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C3E, DI=&H8B90)  ' RT3F_7F
L_311B: BX = CINT(FAC!)  ' RT3F_77
L_311E: BX = BX * (2 ^ 1)
L_3120: BX = BX * (2 ^ 1)
L_3122: BX = BX + &H4534
L_3126: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3129: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_312C: DI = &H8EE6
L_312F: SI = &H82D2
L_3132: FAC! = N_82D2! * N_8EE6!  ' RT3F_8F
L_3135: BX = &H115C
L_3138: DX = &H1A
L_313B: RT3E_5E(AX=AX, BX=&H115C, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_313E: BX = 0xFFFF
L_3141: DX = BX
L_3143: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_3146: DI = &H8EEA
L_3149: SI = &H82D2
L_314C: FAC! = N_82D2! * N_8EEA!  ' RT3F_8F
L_314F: BX = &H15B3
L_3152: DX = &H1A
L_3155: RT3E_5E(AX=AX, BX=&H15B3, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_3158: BX = 0xFFFF
L_315B: DX = BX
L_315D: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_3160: DI = &H87FE
L_3163: SI = &H8C3E
L_3166: FAC! = N_8C3E! * N_87FE!  ' RT3F_8F
L_3169: SI = &H8E78
L_316C: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8E78, DI=DI)  ' RT3F_9B
L_316F: DI = &H88F6
L_3172: BX = SI
L_3174: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88F6)  ' RT3F_81
L_3177: DI = BX
L_3179: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_317C: SI = BX
L_317E: DI = &H827C
L_3181: CompareLeft! = N(SI): CompareRight! = N_827C!  ' RT3F_9F
L_3184: IF CompareLeft! >= CompareRight! THEN GOTO L_3189  ' flags from L_3181
L_3186: GOTO L_3471
L_3189: GOSUB L_3452
L_318C: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_318F: DI = &H87FE
L_3192: FAC! = FAC! * N_87FE!  ' RT3F_91
L_3195: DI = &H88FE
L_3198: CompareLeft! = FAC!: CompareRight! = N_88FE!  ' RT3F_A1
L_319B: IF CompareLeft! < CompareRight! THEN GOTO L_312C  ' flags from L_3198
L_319D: SI = &H8C42
L_31A0: BX = SI
L_31A2: DX = BX
L_31A4: BX = CINT(N_8C42!)  ' RT3F_75
L_31A7: DI = BX
L_31A9: DI = DI * (2 ^ 1)
L_31AB: DI = DI * (2 ^ 1)
L_31AD: DI = DI + &H1850
L_31B1: SI = &H8AE2
L_31B4: N(DI) = N_8AE2!  ' RT3F_7B
L_31B7: SI = DX
L_31B9: DI = &H827C
L_31BC: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H8C42, SI=&H8C42, DI=&H827C)  ' RT3F_7F
L_31BF: BX = CINT(FAC!)  ' RT3F_77
L_31C2: DI = BX
L_31C4: DI = DI * (2 ^ 1)
L_31C6: DI = DI * (2 ^ 1)
L_31C8: DI = DI + &H1850
L_31CC: SI = &H87FA
L_31CF: N(DI) = N_87FA!  ' RT3F_7B
L_31D2: SWAP DX, SI
L_31D4: DI = &H8286
L_31D7: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H87FA, SI=SI, DI=&H8286)  ' RT3F_7F
L_31DA: BX = CINT(FAC!)  ' RT3F_77
L_31DD: DI = BX
L_31DF: DI = DI * (2 ^ 1)
L_31E1: DI = DI * (2 ^ 1)
L_31E3: DI = DI + &H1850
L_31E7: SI = DX
L_31E9: N(DI) = N(SI)  ' RT3F_7B
L_31EC: GOTO L_2F8C
L_31EF: BX = &H8EEE
L_31F2: DX = &H8BC4
L_31F5: S_8BC4$ = S_8EEE$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_31F8: GOSUB L_10D3
L_31FB: GOSUB L_14CA
L_31FE: SI = &H8AD2
L_3201: CompareLeft! = N_8AD2!: CompareRight! = 0  ' RT3F_A7
L_3204: IF CompareLeft! <> CompareRight! THEN GOTO L_3209  ' flags from L_3201
L_3206: GOTO L_2F8C
L_3209: DI = &H882A
L_320C: SI = &H8C30
L_320F: N_882A! = N_8C30!  ' RT3F_7B
L_3212: DI = &H882E
L_3215: SI = &H8AD2
L_3218: N_882E! = N_8AD2!  ' RT3F_7B
L_321B: GOSUB L_0359
L_321E: DI = &H8C18
L_3221: FAC! = FAC! * N_8C18!  ' RT3F_91
L_3224: DI = &H8F04
L_3227: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8F04)  ' RT3F_81
L_322A: DI = &H8F00
L_322D: N_8F00! = FAC!: SI = &H001A  ' RT3F_7D
L_3230: SI = DI
L_3232: DI = &H8F08
L_3235: CompareLeft! = N_8F00!: CompareRight! = N_8F08!  ' RT3F_9F
L_3238: BX = 0
L_323B: IF CompareLeft! >= CompareRight! THEN GOTO L_323E  ' flags from L_3235
L_323D: BX = BX - 1
L_323E: DI = &H8906
L_3241: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8906)  ' RT3F_7F
L_3244: DX = BX
L_3246: BX = CINT(FAC!)  ' RT3F_77
L_3249: SI = BX
L_324B: SI = SI * (2 ^ 1)
L_324D: SI = SI * (2 ^ 1)
L_324F: SI = SI + &H1850
L_3253: DI = &H8286
L_3256: BX = SI
L_3258: SI = &H8AD2
L_325B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H8286)  ' RT3F_7F
L_325E: SI = BX
L_3260: RT3F_A3(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A3
L_3263: CX = 0
L_3266: IF ZF THEN GOTO L_3269  ' flags from L_3260
L_3268: CX = CX - 1
L_3269: CX = CX OR DX
L_326B: CompareLeft% = CX: CompareRight% = 0
L_326D: IF CompareLeft% <> CompareRight% THEN GOTO L_3272  ' flags from L_326B
L_326F: GOTO L_3293
L_3272: GOSUB L_14CA
L_3275: BX = &H13
L_3278: LocateRow% = BX  ' RT3E_42
L_327B: BX = &H1A
L_327E: LOCATE LocateRow%, BX  ' RT3E_44
L_3281: ' PRINT statement begins
L_3284: BX = &H8F0C
L_3287: PRINT S_8F0C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_328A: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_328D: GOSUB L_128E
L_3290: GOTO L_2F8C
L_3293: DI = &H88B2
L_3296: SI = &H8F00
L_3299: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8F00, DI=&H88B2)  ' RT3F_7F
L_329C: BX = CINT(FAC!)  ' RT3F_77
L_329F: SI = BX
L_32A1: SI = SI * (2 ^ 1)
L_32A3: SI = SI * (2 ^ 1)
L_32A5: SI = SI + &H1850
L_32A9: DI = &H827C
L_32AC: CompareLeft! = N(SI): CompareRight! = N_827C!  ' RT3F_9F
L_32AF: IF CompareLeft! < CompareRight! THEN GOTO L_32B4  ' flags from L_32AC
L_32B1: GOTO L_32D5
L_32B4: GOSUB L_14CA
L_32B7: BX = &H13
L_32BA: LocateRow% = BX  ' RT3E_42
L_32BD: BX = &H1A
L_32C0: LOCATE LocateRow%, BX  ' RT3E_44
L_32C3: ' PRINT statement begins
L_32C6: BX = &H8F1A
L_32C9: PRINT S_8F1A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_32CC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_32CF: GOSUB L_128E
L_32D2: GOTO L_2F8C
L_32D5: DI = &H8EEA
L_32D8: SI = &H82D2
L_32DB: FAC! = N_82D2! * N_8EEA!  ' RT3F_8F
L_32DE: BX = &H15B3
L_32E1: DX = &H1A
L_32E4: RT3E_5E(AX=AX, BX=&H15B3, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_32E7: BX = 0xFFFF
L_32EA: DX = BX
L_32EC: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_32EF: DI = &H8F2A
L_32F2: SI = &H82D2
L_32F5: FAC! = N_82D2! * N_8F2A!  ' RT3F_8F
L_32F8: BX = &H457
L_32FB: DX = &H1A
L_32FE: RT3E_5E(AX=AX, BX=&H0457, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_3301: BX = 0xFFFF
L_3304: DX = BX
L_3306: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_3309: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_330C: DI = &H8852
L_330F: RT3F_25(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8852)  ' RT3F_25
L_3312: DI = &H827C
L_3315: SI = &H8F00
L_3318: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8F00, DI=&H827C, inline=&H80)  ' RT3F_71
L_331C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_331F: BX = CINT(FAC!)  ' RT3F_77
L_3322: SI = BX
L_3324: SI = SI * (2 ^ 1)
L_3326: SI = SI * (2 ^ 1)
L_3328: SI = SI + &H1850
L_332C: SWAP SI, DI
L_332E: BX = SI
L_3330: SI = &H8968
L_3333: FAC! = N_8968! * N(DI)  ' RT3F_8F
L_3336: DI = BX
L_3338: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_81
L_333B: BX = &H1A
L_333E: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_3341: SI = &H8E78
L_3344: BX = DI
L_3346: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8E78, DI=DI)  ' RT3F_9B
L_3349: DI = SI
L_334B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_334E: SWAP BX, DI
L_3350: SI = BX
L_3352: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_3355: IF CompareLeft! >= CompareRight! THEN GOTO L_335A  ' flags from L_3352
L_3357: GOTO L_3471
L_335A: GOSUB L_3452
L_335D: DI = &H88B2
L_3360: SI = &H8F00
L_3363: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8F00, DI=&H88B2)  ' RT3F_7F
L_3366: BX = CINT(FAC!)  ' RT3F_77
L_3369: DI = BX
L_336B: DI = DI * (2 ^ 1)
L_336D: DI = DI * (2 ^ 1)
L_336F: DI = DI + &H1850
L_3373: SI = DI
L_3375: DI = &H8B90
L_3378: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B90)  ' RT3F_7F
L_337B: DI = SI
L_337D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3380: SI = DI
L_3382: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_3385: IF CompareLeft! <= CompareRight! THEN GOTO L_338A  ' flags from L_3382
L_3387: GOTO L_32D5
L_338A: GOTO L_2F8C
L_338D: DI = &H8C3E
L_3390: SI = &H88D2
L_3393: N_8C3E! = N_88D2!  ' RT3F_7B
L_3396: GOSUB L_1707
L_3399: GOSUB L_14CA
L_339C: BX = &H12
L_339F: LocateRow% = BX  ' RT3E_42
L_33A2: BX = &H1A
L_33A5: LOCATE LocateRow%, BX  ' RT3E_44
L_33A8: SI = &H8A68
L_33AB: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_33AE: IF CompareLeft! = CompareRight! THEN GOTO L_33B3  ' flags from L_33AB
L_33B0: GOTO L_33C5
L_33B3: ' PRINT statement begins
L_33B6: BX = &H8F2E
L_33B9: PRINT S_8F2E$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_33BC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_33BF: GOSUB L_128E
L_33C2: GOTO L_2F8C
L_33C5: GOSUB L_6169
L_33C8: DI = &H889E
L_33CB: SI = &H8E08
L_33CE: FAC! = N_8E08! * N_889E!  ' RT3F_8F
L_33D1: DI = &H8C56
L_33D4: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C56)  ' RT3F_81
L_33D7: DI = &H8F3E
L_33DA: N_8F3E! = FAC!: SI = &H001A  ' RT3F_7D
L_33DD: SI = &H8E7C
L_33E0: CompareLeft! = N_8E7C!: CompareRight! = 0  ' RT3F_A7
L_33E3: IF CompareLeft! < CompareRight! THEN GOTO L_33E8  ' flags from L_33E0
L_33E5: GOTO L_33F1
L_33E8: DI = &H8F3E
L_33EB: SI = &H8AE6
L_33EE: N_8F3E! = N_8AE6!  ' RT3F_7B
L_33F1: ' PRINT statement begins
L_33F4: SI = &H8E04
L_33F7: BX = CINT(N_8E04!)  ' RT3F_75
L_33FA: BX = BX * (2 ^ 1)
L_33FC: BX = BX * (2 ^ 1)
L_33FE: BX = BX + &H4288
L_3402: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3405: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3408: BX = &H13
L_340B: LocateRow% = BX  ' RT3E_42
L_340E: BX = &H1A
L_3411: LOCATE LocateRow%, BX  ' RT3E_44
L_3414: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_3417: DI = &H8832
L_341A: FAC! = FAC! * N_8832!  ' RT3F_91
L_341D: DI = &H8F3E
L_3420: CompareLeft! = FAC!: CompareRight! = N_8F3E!  ' RT3F_A1
L_3423: IF CompareLeft! < CompareRight! THEN GOTO L_3428  ' flags from L_3420
L_3425: GOTO L_3437
L_3428: ' PRINT statement begins
L_342B: BX = &H8F42
L_342E: PRINT S_8F42$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3431: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3434: GOTO L_3471
L_3437: ' PRINT statement begins
L_343A: BX = &H8F54
L_343D: PRINT S_8F54$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3440: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3443: DI = &H8E7C
L_3446: SI = &H8B90
L_3449: N_8E7C! = N_8B90!  ' RT3F_7B
L_344C: GOSUB L_128E
L_344F: GOTO L_2F8C
L_3452: BX = &H10
L_3455: LocateRow% = BX  ' RT3E_42
L_3458: BX = &H1A
L_345B: LOCATE LocateRow%, BX  ' RT3E_44
L_345E: ' PRINT statement begins
L_3461: BX = &H8E78
L_3464: PRINT N_8E78!;  ' RT3F_67; M ledger
L_3467: BX = &H8F5E
L_346A: PRINT S_8F5E$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_346D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3470: RETURN
L_3471: GOSUB L_128E
L_3474: GOSUB L_14CA
L_3477: BX = &H13
L_347A: LocateRow% = BX  ' RT3E_42
L_347D: BX = &H1A
L_3480: LOCATE LocateRow%, BX  ' RT3E_44
L_3483: ' PRINT statement begins
L_3486: BX = &H8F68
L_3489: PRINT S_8F68$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_348C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_348F: GOSUB L_128E
L_3492: DI = &H8866
L_3495: SI = &H8D8E
L_3498: N_8866! = N_8D8E!  ' RT3F_7B
L_349B: DI = &H886A
L_349E: SI = &H8812
L_34A1: N_886A! = N_8812!  ' RT3F_7B
L_34A4: GOSUB L_03F0
L_34A7: BX = CINT(FAC!)  ' RT3F_77
L_34AA: DI = BX
L_34AC: DI = DI * (2 ^ 1)
L_34AE: WORD(DI + &H48B0) = 0
L_34B4: GOTO L_2408
L_34B7: DI = &H8D8E
L_34BA: SI = &H8B24
L_34BD: CompareLeft! = N_8B24!: CompareRight! = N_8D8E!  ' RT3F_9F
L_34C0: IF CompareLeft! = CompareRight! THEN GOTO L_34C5  ' flags from L_34BD
L_34C2: GOTO L_2650
L_34C5: DI = &H48A8
L_34C8: SI = &H48A0
L_34CB: N_48A8! = N_48A0!  ' RT3F_7B
L_34CE: DI = &H48AC
L_34D1: SI = &H48A4
L_34D4: N_48AC! = N_48A4!  ' RT3F_7B
L_34D7: DI = &H8B8C
L_34DA: SI = &H8B24
L_34DD: N_8B8C! = N_8B24!  ' RT3F_7B
L_34E0: DI = &H8F78
L_34E3: SI = &H8D92
L_34E6: CompareLeft! = N_8D92!: CompareRight! = N_8F78!  ' RT3F_9F
L_34E9: IF CompareLeft! = CompareRight! THEN GOTO L_34EE  ' flags from L_34E6
L_34EB: GOTO L_355A
L_34EE: GOSUB L_14CA
L_34F1: BX = &H11
L_34F4: LocateRow% = BX  ' RT3E_42
L_34F7: BX = &H1D
L_34FA: LOCATE LocateRow%, BX  ' RT3E_44
L_34FD: ' PRINT statement begins

```

### Exit and squad switching

```basic
L_3500: BX = &H8F7C
L_3503: PRINT S_8F7C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3506: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3509: BX = &H14
L_350C: LocateRow% = BX  ' RT3E_42
L_350F: BX = &H1A
L_3512: LOCATE LocateRow%, BX  ' RT3E_44
L_3515: ' PRINT statement begins
L_3518: DX = BX
L_351A: BX = &H8F88
L_351D: PRINT S_8F88$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3520: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3523: BX = &H15
L_3526: LocateRow% = BX  ' RT3E_42
L_3529: BX = DX
L_352B: LOCATE LocateRow%, BX  ' RT3E_44
L_352E: ' PRINT statement begins
L_3531: BX = &H8F9A
L_3534: PRINT S_8F9A$;  ' RT3F_6A; separator/format variant retained by RT tag
L_3537: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_353A: GOSUB L_1ABD
L_353D: SI = &H888A
L_3540: CompareLeft! = N_888A!: CompareRight! = 0  ' RT3F_A7
L_3543: IF CompareLeft! <> CompareRight! THEN GOTO L_3548  ' flags from L_3540
L_3545: GOTO L_2408
L_3548: GOSUB L_4F07
L_354B: GOSUB L_6387
L_354E: BX = &H8FA8
L_3551: AX = &H8274
L_3554: RT3F_55(AX=&H8274, BX=&H8FA8, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_3557: CHAIN S(BX)  ' RT3E_0E; M data-lane filename evidence
L_355A: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_355D: DI = &H8FB6
L_3560: CompareLeft! = FAC!: CompareRight! = N_8FB6!  ' RT3F_A1
L_3563: BX = 0
L_3566: IF CompareLeft! >= CompareRight! THEN GOTO L_3569  ' flags from L_3560
L_3568: BX = BX - 1
L_3569: DI = &H827C
L_356C: SI = &H87AE
L_356F: CompareLeft! = N_87AE!: CompareRight! = N_827C!  ' RT3F_9F
L_3572: DX = 0
L_3575: IF CompareLeft! <> CompareRight! THEN GOTO L_3578  ' flags from L_356F
L_3577: DX = DX - 1
L_3578: DX = DX OR BX
L_357A: CompareLeft% = DX: CompareRight% = 0
L_357C: IF CompareLeft% = CompareRight% THEN GOTO L_3581  ' flags from L_357A
L_357E: GOTO L_2539
L_3581: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_3584: RT3F_AD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H01)  ' RT3F_AD
L_3588: BX = &H1A
L_358B: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_358E: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_3592: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_3595: RT3F_AD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H01)  ' RT3F_AD
L_3599: DI = &H8FBA
L_359C: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8FBA)  ' RT3F_81
L_359F: BX = &H1A
L_35A2: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_35A5: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_85
L_35A9: BX = CINT(FAC!)  ' RT3F_77
L_35AC: DI = BX
L_35AE: DI = DI * (2 ^ 1)
L_35B0: BX = WORD(DI + &H48B0)
L_35B4: FAC! = CSNG(BX)  ' RT3F_57
L_35B7: DI = &H8D86
L_35BA: N_8D86! = FAC!: SI = &H001A  ' RT3F_7D
L_35BD: GOTO L_64E4
L_35C0: DI = &H8BD4
L_35C3: SI = &H827C
L_35C6: N_8BD4! = N_827C!  ' RT3F_7B
L_35C9: BX = &H8FBE
L_35CC: DX = &H8BC4
L_35CF: S_8BC4$ = S_8FBE$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_35D2: GOSUB L_10D3
L_35D5: SI = &H8AD2
L_35D8: CompareLeft! = N_8AD2!: CompareRight! = 0  ' RT3F_A7
L_35DB: IF CompareLeft! <> CompareRight! THEN GOTO L_35E0  ' flags from L_35D8
L_35DD: GOTO L_37B7
L_35E0: DI = &H8FDC
L_35E3: SI = &H8AD2
L_35E6: N_8FDC! = N_8AD2!  ' RT3F_7B
L_35E9: BX = &H8FCE
L_35EC: DX = &H8BC4
L_35EF: S_8BC4$ = S_8FCE$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_35F2: GOSUB L_10D3
L_35F5: SI = &H8AD2
L_35F8: CompareLeft! = N_8AD2!: CompareRight! = 0  ' RT3F_A7
L_35FB: IF CompareLeft! <> CompareRight! THEN GOTO L_3600  ' flags from L_35F8
L_35FD: GOTO L_37B7
L_3600: DI = &H883E
L_3603: SI = &H87FA
L_3606: N_883E! = N_87FA!  ' RT3F_7B
L_3609: BX = DI
L_360B: DI = &H8842
L_360E: DX = SI
L_3610: SI = &H8FDC
L_3613: N_8842! = N_8FDC!  ' RT3F_7B
L_3616: GOSUB L_038B
L_3619: DI = &H883E
L_361C: SI = &H87FA
L_361F: N_883E! = N_87FA!  ' RT3F_7B
L_3622: BX = DI
L_3624: DI = &H8842
L_3627: SI = &H8AD2
L_362A: N_8842! = N_8AD2!  ' RT3F_7B
L_362D: RT3F_71(AX=AX, BX=&H883E, CX=CX, DX=DX, SI=&H8AD2, DI=&H8842, inline=&H80)  ' RT3F_71
L_3631: GOSUB L_038B
L_3634: RT3F_9D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_9D
L_3638: DI = &H8FE0
L_363B: N_8FE0! = FAC!: SI = &H001A  ' RT3F_7D
L_363E: DI = &H883E
L_3641: SI = &H8D6E
L_3644: N_883E! = N_8D6E!  ' RT3F_7B
L_3647: BX = DI
L_3649: DI = &H8842
L_364C: SI = &H8FDC
L_364F: N_8842! = N_8FDC!  ' RT3F_7B
L_3652: GOSUB L_038B
L_3655: DI = &H8FE4
L_3658: N_8FE4! = FAC!: SI = &H001A  ' RT3F_7D
L_365B: DI = &H883E
L_365E: SI = &H8FE8
L_3661: N_883E! = N_8FE8!  ' RT3F_7B
L_3664: DI = &H8842
L_3667: SI = &H8FDC
L_366A: N_8842! = N_8FDC!  ' RT3F_7B
L_366D: GOSUB L_038B
L_3670: GOTO L_36AE
L_3673: ' Alignment NOP
L_3674: DI = &H8FE0
L_3677: SI = &H8FEC
L_367A: RT3F_97(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FEC, DI=&H8FE0)  ' RT3F_97
L_367D: BX = SI
L_367F: DX = BX
L_3681: BX = CINT(FAC!)  ' RT3F_77
L_3684: SI = BX
L_3686: SI = SI * (2 ^ 1)
L_3688: SI = SI * (2 ^ 1)
L_368A: SI = SI + &H1850
L_368E: SWAP DX, SI
L_3690: BX = SI
L_3692: CX = BX
L_3694: BX = CINT(N(SI))  ' RT3F_75
L_3697: DI = BX
L_3699: DI = DI * (2 ^ 1)
L_369B: DI = DI * (2 ^ 1)
L_369D: DI = DI + &H1850
L_36A1: SI = DX
L_36A3: RT3F_11(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_11
L_36A6: SI = CX
L_36A8: DI = &H827C
L_36AB: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_36AE: DI = &H8FEC
L_36B1: N_8FEC! = FAC!: SI = &H001A  ' RT3F_7D
L_36B4: SI = DI
L_36B6: DI = &H8FE4
L_36B9: CompareLeft! = N_8FEC!: CompareRight! = N_8FE4!  ' RT3F_9F
L_36BC: IF CompareLeft! <= CompareRight! THEN GOTO L_3674  ' flags from L_36B9
L_36BE: SI = &H8AD2
L_36C1: BX = CINT(N_8AD2!)  ' RT3F_75
L_36C4: SI = BX
L_36C6: SI = SI * (2 ^ 1)
L_36C8: SI = SI * (2 ^ 1)
L_36CA: SI = SI + &H4288
L_36CE: BX = SI
L_36D0: SI = &H8FDC
L_36D3: DX = BX
L_36D5: BX = CINT(N_8FDC!)  ' RT3F_75
L_36D8: DI = BX
L_36DA: DI = DI * (2 ^ 1)
L_36DC: DI = DI * (2 ^ 1)
L_36DE: DI = DI + &H4288
L_36E2: SI = DX
L_36E4: RT3F_14(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_14
L_36E7: DI = &H8AD2
L_36EA: SI = &H8FDC
L_36ED: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FDC, DI=&H8AD2)  ' RT3F_7F
L_36F0: DI = &H8FF0
L_36F3: N_8FF0! = FAC!: SI = &H001A  ' RT3F_7D
L_36F6: SI = &H8FF4
L_36F9: FAC! = N_8FF4!: DI = &H001E  ' RT3F_6F
L_36FC: GOTO L_370C
L_36FF: ' Alignment NOP

```

### Repairs

```basic
L_3700: GOSUB L_376B
L_3703: DI = &H8C18
L_3706: SI = &H87F2
L_3709: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8C18)  ' RT3F_7F
L_370C: DI = &H87F2
L_370F: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_3712: SI = DI
L_3714: DI = &H8FF8
L_3717: CompareLeft! = N_87F2!: CompareRight! = N_8FF8!  ' RT3F_9F
L_371A: IF CompareLeft! <= CompareRight! THEN GOTO L_3700  ' flags from L_3717
L_371C: SI = &H8FFC
L_371F: FAC! = N_8FFC!: DI = &H001E  ' RT3F_6F
L_3722: GOTO L_3732
L_3725: ' Alignment NOP
L_3726: GOSUB L_376B
L_3729: DI = &H88B2
L_372C: SI = &H87F2
L_372F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88B2)  ' RT3F_7F
L_3732: DI = &H87F2
L_3735: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_3738: SI = DI
L_373A: DI = &H9000
L_373D: CompareLeft! = N_87F2!: CompareRight! = N_9000!  ' RT3F_9F
L_3740: IF CompareLeft! <= CompareRight! THEN GOTO L_3726  ' flags from L_373D
L_3742: SI = &H9004
L_3745: FAC! = N_9004!: DI = &H001E  ' RT3F_6F
L_3748: GOTO L_3758
L_374B: ' Alignment NOP
L_374C: GOSUB L_376B
L_374F: DI = &H88B2
L_3752: SI = &H87F2
L_3755: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88B2)  ' RT3F_7F
L_3758: DI = &H87F2
L_375B: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_375E: SI = DI
L_3760: DI = &H9008
L_3763: CompareLeft! = N_87F2!: CompareRight! = N_9008!  ' RT3F_9F
L_3766: IF CompareLeft! <= CompareRight! THEN GOTO L_374C  ' flags from L_3763
L_3768: GOTO L_37B7
L_376B: SI = &H87F2
L_376E: BX = CINT(N_87F2!)  ' RT3F_75
L_3771: SI = BX
L_3773: SI = SI * (2 ^ 1)
L_3775: SI = SI * (2 ^ 1)
L_3777: SI = SI + &H1850
L_377B: DI = &H8FDC
L_377E: CompareLeft! = N(SI): CompareRight! = N_8FDC!  ' RT3F_9F
L_3781: BX = 0
L_3784: IF CompareLeft! = CompareRight! THEN GOTO L_3787  ' flags from L_377E
L_3786: BX = BX - 1
L_3787: DI = &H8AD2
L_378A: CompareLeft! = N(SI): CompareRight! = N_8AD2!  ' RT3F_9F
L_378D: DX = 0
L_3790: IF CompareLeft! = CompareRight! THEN GOTO L_3793  ' flags from L_378A
L_3792: DX = DX - 1
L_3793: DX = DX AND BX
L_3795: CompareLeft% = DX: CompareRight% = 0
L_3797: IF CompareLeft% <> CompareRight% THEN GOTO L_379C  ' flags from L_3795
L_3799: GOTO L_379D
L_379C: RETURN
L_379D: SI = &H87F2
L_37A0: BX = CINT(N_87F2!)  ' RT3F_75
L_37A3: DI = BX
L_37A5: DI = DI * (2 ^ 1)
L_37A7: DI = DI * (2 ^ 1)
L_37A9: DI = DI + &H1850
L_37AD: SI = &H8FF0
L_37B0: RT3F_97(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FF0, DI=DI)  ' RT3F_97
L_37B3: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_37B6: RETURN
L_37B7: DI = &H8BD4
L_37BA: SI = &H900C
L_37BD: N_8BD4! = N_900C!  ' RT3F_7B
L_37C0: GOTO L_2408
L_37C3: DI = &H9010
L_37C6: SI = &H87FA
L_37C9: N_9010! = N_87FA!  ' RT3F_7B
L_37CC: DI = &H8AD2
L_37CF: SI = &H827C
L_37D2: N_8AD2! = N_827C!  ' RT3F_7B
L_37D5: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_37D8: GOTO L_385E
L_37DB: ' Alignment NOP
L_37DC: DI = &H882A
L_37DF: SI = &H888E
L_37E2: N_882A! = N_888E!  ' RT3F_7B
L_37E5: BX = DI
L_37E7: DI = &H882E
L_37EA: SI = &H87F2
L_37ED: N_882E! = N_87F2!  ' RT3F_7B
L_37F0: GOSUB L_0359
L_37F3: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_37F6: BX = 0
L_37F9: IF (CF OR ZF) THEN GOTO L_37FC  ' flags from L_37F3
L_37FB: BX = BX - 1
L_37FC: DI = &H882A
L_37FF: SI = &H8B20
L_3802: N_882A! = N_8B20!  ' RT3F_7B
L_3805: DX = DI
L_3807: DI = &H882E
L_380A: CX = SI
L_380C: SI = &H87F2
L_380F: N_882E! = N_87F2!  ' RT3F_7B
L_3812: WORD(BP - 6) = BX
L_3815: GOSUB L_0359
L_3818: DI = &H9010
L_381B: CompareLeft! = FAC!: CompareRight! = N_9010!  ' RT3F_A1
L_381E: BX = 0
L_3821: IF CompareLeft! < CompareRight! THEN GOTO L_3824  ' flags from L_381B
L_3823: BX = BX - 1
L_3824: BX = BX AND WORD(BP - 6)
L_3827: CompareLeft% = BX: CompareRight% = 0
L_3829: IF CompareLeft% <> CompareRight% THEN GOTO L_382E  ' flags from L_3827
L_382B: GOTO L_3855
L_382E: BX = DI
L_3830: DI = &H8AD2
L_3833: SI = &H87F2
L_3836: N_8AD2! = N_87F2!  ' RT3F_7B
L_3839: DI = &H882A
L_383C: DX = SI
L_383E: SI = &H8B20
L_3841: N_882A! = N_8B20!  ' RT3F_7B
L_3844: SI = DX
L_3846: DI = &H882E
L_3849: N_882E! = N_87F2!  ' RT3F_7B
L_384C: GOSUB L_0359
L_384F: DI = &H9010
L_3852: N_9010! = FAC!: SI = &H001A  ' RT3F_7D
L_3855: DI = &H827C
L_3858: SI = &H87F2
L_385B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_385E: DI = &H87F2
L_3861: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_3864: SI = DI
L_3866: DI = &H8812
L_3869: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_386C: IF CompareLeft! > CompareRight! THEN GOTO L_3871  ' flags from L_3869
L_386E: GOTO L_37DC
L_3871: GOSUB L_14CA
L_3874: DI = &H8C3E
L_3877: SI = &H8286
L_387A: N_8C3E! = N_8286!  ' RT3F_7B
L_387D: DI = &H8FDC
L_3880: SI = &H87FA
L_3883: N_8FDC! = N_87FA!  ' RT3F_7B
L_3886: DI = &H8FEC
L_3889: N_8FEC! = N_87FA!  ' RT3F_7B
L_388C: GOSUB L_1707
L_388F: DI = &H88C2
L_3892: SI = &H8A68
L_3895: FAC! = N_8A68! * N_88C2!  ' RT3F_8F
L_3898: DI = &H880A
L_389B: SI = &H9010
L_389E: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9010, DI=&H880A, inline=&H80)  ' RT3F_71
L_38A2: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_38A5: BX = SI
L_38A7: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_85
L_38AB: DI = BX
L_38AD: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_38B0: SI = &H827C
L_38B3: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_38B6: GOTO L_3A54
L_38B9: ' Alignment NOP
L_38BA: DI = &H882A
L_38BD: SI = &H9014
L_38C0: N_882A! = N_9014!  ' RT3F_7B
L_38C3: BX = DI
L_38C5: DI = &H882E
L_38C8: DX = SI
L_38CA: SI = &H87F2
L_38CD: N_882E! = N_87F2!  ' RT3F_7B
L_38D0: GOSUB L_0359
L_38D3: DI = &H882A
L_38D6: SI = &H8A6C
L_38D9: N_882A! = N_8A6C!  ' RT3F_7B
L_38DC: BX = DI
L_38DE: DI = &H882E
L_38E1: DX = SI
L_38E3: SI = &H87F2
L_38E6: N_882E! = N_87F2!  ' RT3F_7B
L_38E9: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=&H8A6C, SI=&H87F2, DI=&H882E, inline=&H80)  ' RT3F_71
L_38ED: GOSUB L_0359
L_38F0: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_A5
L_38F4: BX = 0
L_38F7: IF NOT ZF THEN GOTO L_38FA  ' flags from L_38F0
L_38F9: BX = BX - 1
L_38FA: DI = &H882A
L_38FD: SI = &H8A6C
L_3900: N_882A! = N_8A6C!  ' RT3F_7B
L_3903: DX = DI
L_3905: DI = &H882E
L_3908: SI = &H87F2
L_390B: N_882E! = N_87F2!  ' RT3F_7B
L_390E: WORD(BP - 6) = BX
L_3911: GOSUB L_0359
L_3914: DI = &H882A
L_3917: SI = &H8BCC
L_391A: N_882A! = N_8BCC!  ' RT3F_7B
L_391D: BX = DI
L_391F: DI = &H882E
L_3922: SI = &H87F2
L_3925: N_882E! = N_87F2!  ' RT3F_7B
L_3928: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=DX, SI=&H87F2, DI=&H882E, inline=&H81)  ' RT3F_71
L_392C: GOSUB L_0359
L_392F: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H81)  ' RT3F_85
L_3933: DI = &H882A
L_3936: SI = &H9014
L_3939: N_882A! = N_9014!  ' RT3F_7B
L_393C: DI = &H882E
L_393F: SI = &H87F2
L_3942: N_882E! = N_87F2!  ' RT3F_7B
L_3945: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H882E, inline=&H82)  ' RT3F_71
L_3949: GOSUB L_0359
L_394C: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H82)  ' RT3F_A5
L_3950: BX = 0
L_3953: IF NOT ZF THEN GOTO L_3956  ' flags from L_394C
L_3955: BX = BX - 1
L_3956: BX = BX OR WORD(BP - 6)
L_3959: CompareLeft% = BX: CompareRight% = 0
L_395B: IF CompareLeft% = CompareRight% THEN GOTO L_3960  ' flags from L_3959
L_395D: GOTO L_3A4B
L_3960: DI = &H883E
L_3963: SI = &H8BCC
L_3966: N_883E! = N_8BCC!  ' RT3F_7B
L_3969: BX = DI
L_396B: DI = &H8842
L_396E: SI = &H87F2
L_3971: N_8842! = N_87F2!  ' RT3F_7B
L_3974: GOSUB L_038B
L_3977: BX = CINT(FAC!)  ' RT3F_77
L_397A: DI = BX
L_397C: DI = DI * (2 ^ 1)
L_397E: DI = DI * (2 ^ 1)
L_3980: DI = DI + &H1850
L_3984: BX = DI
L_3986: DI = &H882A
L_3989: SI = &H9014
L_398C: N_882A! = N_9014!  ' RT3F_7B
L_398F: DX = DI
L_3991: DI = &H882E
L_3994: CX = SI
L_3996: SI = &H87F2
L_3999: N_882E! = N_87F2!  ' RT3F_7B
L_399C: WORD(BP - 6) = BX
L_399F: GOSUB L_0359
L_39A2: DI = &H882A
L_39A5: SI = &H8A6C
L_39A8: N_882A! = N_8A6C!  ' RT3F_7B
L_39AB: BX = DI
L_39AD: DI = &H882E
L_39B0: DX = SI
L_39B2: SI = &H87F2
L_39B5: N_882E! = N_87F2!  ' RT3F_7B
L_39B8: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=&H8A6C, SI=&H87F2, DI=&H882E, inline=&H80)  ' RT3F_71
L_39BC: GOSUB L_0359
L_39BF: RT3F_9D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_9D
L_39C3: DI = WORD(BP - 6)
L_39C6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_39C9: DI = &H8C18
L_39CC: SI = &H9018
L_39CF: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9018, DI=&H8C18)  ' RT3F_7F
L_39D2: DI = SI
L_39D4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_39D7: DI = &H827C
L_39DA: SI = &H8FEC
L_39DD: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FEC, DI=&H827C)  ' RT3F_7F
L_39E0: SWAP SI, DI
L_39E2: BX = SI
L_39E4: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_39E7: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H001A, DI=DI)  ' RT3D_34
L_39EA: DI = &H8832
L_39ED: FAC! = FAC! * N_8832!  ' RT3F_91
L_39F0: DI = &H9010
L_39F3: CompareLeft! = FAC!: CompareRight! = N_9010!  ' RT3F_A1
L_39F6: IF CompareLeft! < CompareRight! THEN GOTO L_39FB  ' flags from L_39F3
L_39F8: GOTO L_3A4B
L_39FB: DI = &H883E
L_39FE: SI = &H8A6C
L_3A01: N_883E! = N_8A6C!  ' RT3F_7B
L_3A04: DI = &H8842
L_3A07: SI = &H87F2
L_3A0A: N_8842! = N_87F2!  ' RT3F_7B
L_3A0D: GOSUB L_038B
L_3A10: BX = CINT(FAC!)  ' RT3F_77
L_3A13: DI = BX
L_3A15: DI = DI * (2 ^ 1)
L_3A17: DI = DI * (2 ^ 1)
L_3A19: DI = DI + &H1850
L_3A1D: BX = DI
L_3A1F: DI = &H882A
L_3A22: SI = &H9014
L_3A25: N_882A! = N_9014!  ' RT3F_7B
L_3A28: DI = &H882E
L_3A2B: SI = &H87F2
L_3A2E: N_882E! = N_87F2!  ' RT3F_7B
L_3A31: WORD(BP - 8) = BX
L_3A34: GOSUB L_0359
L_3A37: DI = WORD(BP - 8)
L_3A3A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3A3D: DI = &H827C
L_3A40: SI = &H8FDC
L_3A43: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FDC, DI=&H827C)  ' RT3F_7F
L_3A46: DI = SI
L_3A48: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3A4B: DI = &H827C
L_3A4E: SI = &H87F2
L_3A51: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_3A54: DI = &H87F2
L_3A57: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_3A5A: SI = DI
L_3A5C: DI = &H8812
L_3A5F: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_3A62: IF CompareLeft! > CompareRight! THEN GOTO L_3A67  ' flags from L_3A5F
L_3A64: GOTO L_38BA
L_3A67: SI = &H8F08
L_3A6A: FAC! = N_8F08!: DI = &H001E  ' RT3F_6F
L_3A6D: GOTO L_3B1C
L_3A70: SI = &H87F2
L_3A73: BX = SI
L_3A75: DX = BX
L_3A77: BX = CINT(N_87F2!)  ' RT3F_75
L_3A7A: SI = BX
L_3A7C: SI = SI * (2 ^ 1)
L_3A7E: SI = SI * (2 ^ 1)
L_3A80: SI = SI + &H1850
L_3A84: DI = &H827C
L_3A87: CompareLeft! = N(SI): CompareRight! = N_827C!  ' RT3F_9F
L_3A8A: BX = 0
L_3A8D: IF CompareLeft! >= CompareRight! THEN GOTO L_3A90  ' flags from L_3A87
L_3A8F: BX = BX - 1
L_3A90: SI = DX
L_3A92: DI = &H88B2
L_3A95: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88B2)  ' RT3F_7F
L_3A98: DX = BX
L_3A9A: BX = CINT(FAC!)  ' RT3F_77
L_3A9D: SI = BX
L_3A9F: SI = SI * (2 ^ 1)
L_3AA1: SI = SI * (2 ^ 1)
L_3AA3: SI = SI + &H1850
L_3AA7: DI = &H8B90
L_3AAA: CompareLeft! = N(SI): CompareRight! = N_8B90!  ' RT3F_9F
L_3AAD: BX = 0
L_3AB0: IF CompareLeft! = CompareRight! THEN GOTO L_3AB3  ' flags from L_3AAA
L_3AB2: BX = BX - 1
L_3AB3: BX = BX OR DX
L_3AB5: CompareLeft% = BX: CompareRight% = 0
L_3AB7: IF CompareLeft% = CompareRight% THEN GOTO L_3ABC  ' flags from L_3AB5
L_3AB9: GOTO L_3B13
L_3ABC: DI = &H88B2
L_3ABF: SI = &H87F2
L_3AC2: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88B2)  ' RT3F_7F
L_3AC5: BX = CINT(FAC!)  ' RT3F_77
L_3AC8: DI = BX
L_3ACA: DI = DI * (2 ^ 1)
L_3ACC: DI = DI * (2 ^ 1)
L_3ACE: DI = DI + &H1850
L_3AD2: SI = &H8954
L_3AD5: N(DI) = N_8954!  ' RT3F_7B
L_3AD8: BX = DI
L_3ADA: DI = &H827C
L_3ADD: SI = &H8FEC
L_3AE0: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FEC, DI=&H827C)  ' RT3F_7F
L_3AE3: SWAP SI, DI
L_3AE5: DX = SI
L_3AE7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3AEA: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H001A, DI=DI)  ' RT3D_34
L_3AED: DI = &H8832
L_3AF0: FAC! = FAC! * N_8832!  ' RT3F_91
L_3AF3: DI = &H9010
L_3AF6: CompareLeft! = FAC!: CompareRight! = N_9010!  ' RT3F_A1
L_3AF9: IF CompareLeft! < CompareRight! THEN GOTO L_3AFE  ' flags from L_3AF6
L_3AFB: GOTO L_3B13
L_3AFE: DI = BX
L_3B00: SI = &H890E
L_3B03: N(DI) = N_890E!  ' RT3F_7B
L_3B06: DI = DX
L_3B08: SI = &H8FDC
L_3B0B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FDC, DI=DI)  ' RT3F_7F
L_3B0E: DI = SI
L_3B10: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3B13: DI = &H8C18
L_3B16: SI = &H87F2
L_3B19: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8C18)  ' RT3F_7F
L_3B1C: DI = &H87F2
L_3B1F: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_3B22: SI = DI
L_3B24: DI = &H901C
L_3B27: CompareLeft! = N_87F2!: CompareRight! = N_901C!  ' RT3F_9F
L_3B2A: IF CompareLeft! > CompareRight! THEN GOTO L_3B2F  ' flags from L_3B27
L_3B2C: GOTO L_3A70
L_3B2F: DI = &H9020
L_3B32: SI = &H9024
L_3B35: N_9020! = N_9024!  ' RT3F_7B
L_3B38: BX = DI
L_3B3A: DI = &H827C
L_3B3D: SI = &H8A68
L_3B40: CompareLeft! = N_8A68!: CompareRight! = N_827C!  ' RT3F_9F
L_3B43: DX = 0
L_3B46: IF CompareLeft! <> CompareRight! THEN GOTO L_3B49  ' flags from L_3B40
L_3B48: DX = DX - 1
L_3B49: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_3B4C: CX = DI
L_3B4E: DI = &H8FDC
L_3B51: SI = &H8EEA
L_3B54: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8EEA, DI=&H8FDC, inline=&H80)  ' RT3F_71
L_3B58: RT3F_23(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_23
L_3B5B: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_A5
L_3B5F: AX = 0
L_3B62: IF (CF OR ZF) THEN GOTO L_3B65  ' flags from L_3B5B
L_3B64: AX = AX - 1
L_3B65: AX = AX AND DX
L_3B67: CompareLeft% = AX: CompareRight% = 0
L_3B69: IF CompareLeft% <> CompareRight% THEN GOTO L_3B6E  ' flags from L_3B67
L_3B6B: GOTO L_3B8B
L_3B6E: DI = BX
L_3B70: SI = CX
L_3B72: N(DI) = N(SI)  ' RT3F_7B
L_3B75: SI = &H8C42
L_3B78: BX = CINT(N_8C42!)  ' RT3F_75
L_3B7B: DI = BX
L_3B7D: DI = DI * (2 ^ 1)
L_3B7F: DI = DI * (2 ^ 1)
L_3B81: DI = DI + &H1850
L_3B85: SI = &H87FA
L_3B88: N(DI) = N_87FA!  ' RT3F_7B
L_3B8B: BX = 0xF
L_3B8E: LocateRow% = BX  ' RT3E_42
L_3B91: BX = &H1A
L_3B94: LOCATE LocateRow%, BX  ' RT3E_44
L_3B97: ' PRINT statement begins
L_3B9A: DX = BX
L_3B9C: BX = &H9028
L_3B9F: PRINT S_9028$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3BA2: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3BA5: BX = &H10
L_3BA8: LocateRow% = BX  ' RT3E_42
L_3BAB: BX = DX
L_3BAD: LOCATE LocateRow%, BX  ' RT3E_44
L_3BB0: ' PRINT statement begins
L_3BB3: SI = &H8AD2
L_3BB6: BX = CINT(N_8AD2!)  ' RT3F_75
L_3BB9: BX = BX * (2 ^ 1)
L_3BBB: BX = BX * (2 ^ 1)
L_3BBD: BX = BX + &H4288
L_3BC1: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_3BC4: BX = &H9076
L_3BC7: PRINT S_9076$;  ' RT3F_6A; separator/format variant retained by RT tag
L_3BCA: BX = &H8FDC
L_3BCD: RT3F_6B(AX=AX, BX=&H8FDC, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_3BD0: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3BD3: CX = BX
L_3BD5: BX = &H12
L_3BD8: LocateRow% = BX  ' RT3E_42
L_3BDB: BX = DX
L_3BDD: LOCATE LocateRow%, BX  ' RT3E_44
L_3BE0: ' PRINT statement begins
L_3BE3: BX = &H903A
L_3BE6: PRINT S_903A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3BE9: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3BEC: BX = &H13
L_3BEF: LocateRow% = BX  ' RT3E_42
L_3BF2: BX = DX
L_3BF4: LOCATE LocateRow%, BX  ' RT3E_44
L_3BF7: ' PRINT statement begins
L_3BFA: BX = &H904C
L_3BFD: PRINT S_904C$;  ' RT3F_6A; separator/format variant retained by RT tag

```

### Medical

```basic
L_3C00: DI = CX
L_3C02: SI = &H8FEC
L_3C05: RT3F_97(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FEC, DI=DI)  ' RT3F_97
L_3C08: BX = &H1A
L_3C0B: RT3F_6B(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_3C0E: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3C11: BX = &H15
L_3C14: LocateRow% = BX  ' RT3E_42
L_3C17: BX = DX
L_3C19: LOCATE LocateRow%, BX  ' RT3E_44
L_3C1C: ' PRINT statement begins
L_3C1F: BX = &H905A
L_3C22: PRINT S_905A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3C25: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3C28: BX = &H16
L_3C2B: LocateRow% = BX  ' RT3E_42
L_3C2E: BX = DX
L_3C30: LOCATE LocateRow%, BX  ' RT3E_44
L_3C33: ' PRINT statement begins
L_3C36: BX = &H906A
L_3C39: PRINT S_906A$;  ' RT3F_6A; separator/format variant retained by RT tag
L_3C3C: BX = &H9020
L_3C3F: RT3F_6B(AX=AX, BX=&H9020, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_3C42: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3C45: BX = &H18
L_3C48: LocateRow% = BX  ' RT3E_42
L_3C4B: BX = DX
L_3C4D: LOCATE LocateRow%, BX  ' RT3E_44
L_3C50: GOSUB L_12B5
L_3C53: GOTO L_2408
L_3C56: GOSUB L_14CA
L_3C59: BX = 0xF
L_3C5C: LocateRow% = BX  ' RT3E_42
L_3C5F: BX = &H1A
L_3C62: LOCATE LocateRow%, BX  ' RT3E_44
L_3C65: ' PRINT statement begins
L_3C68: DX = BX
L_3C6A: BX = &H907C
L_3C6D: PRINT S_907C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3C70: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3C73: BX = &H10
L_3C76: LocateRow% = BX  ' RT3E_42
L_3C79: BX = DX
L_3C7B: LOCATE LocateRow%, BX  ' RT3E_44
L_3C7E: ' PRINT statement begins
L_3C81: BX = &H908E
L_3C84: PRINT S_908E$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3C87: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3C8A: DI = &H8BFC
L_3C8D: SI = &H827C
L_3C90: N_8BFC! = N_827C!  ' RT3F_7B
L_3C93: DI = &H8C00
L_3C96: SI = &H8286
L_3C99: N_8C00! = N_8286!  ' RT3F_7B
L_3C9C: GOSUB L_12E9
L_3C9F: DI = &H8C08
L_3CA2: SI = &H8BF0
L_3CA5: CompareLeft! = N_8BF0!: CompareRight! = N_8C08!  ' RT3F_9F
L_3CA8: IF CompareLeft! <> CompareRight! THEN GOTO L_3CAD  ' flags from L_3CA5
L_3CAA: GOTO L_2408
L_3CAD: DI = &H8BF8
L_3CB0: SI = &H8BF0
L_3CB3: CompareLeft! = N_8BF0!: CompareRight! = N_8BF8!  ' RT3F_9F
L_3CB6: IF CompareLeft! = CompareRight! THEN GOTO L_3C9C  ' flags from L_3CB3
L_3CB8: DI = &H8286
L_3CBB: SI = &H8BF0
L_3CBE: CompareLeft! = N_8BF0!: CompareRight! = N_8286!  ' RT3F_9F
L_3CC1: IF CompareLeft! <> CompareRight! THEN GOTO L_3CC6  ' flags from L_3CBE
L_3CC3: GOTO L_3E59
L_3CC6: GOSUB L_14CA
L_3CC9: GOSUB L_13C5
L_3CCC: GOSUB L_1378
L_3CCF: BX = 5
L_3CD2: LocateRow% = BX  ' RT3E_42
L_3CD5: BX = 8
L_3CD8: LOCATE LocateRow%, BX  ' RT3E_44
L_3CDB: ' PRINT statement begins
L_3CDE: DX = BX
L_3CE0: BX = &H90A0
L_3CE3: PRINT S_90A0$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3CE6: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3CE9: BX = DX
L_3CEB: LocateRow% = BX  ' RT3E_42
L_3CEE: BX = 4
L_3CF1: LOCATE LocateRow%, BX  ' RT3E_44
L_3CF4: ' PRINT statement begins
L_3CF7: BX = &H90BC
L_3CFA: PRINT S_90BC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3CFD: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3D00: BX = DX
L_3D02: LocateRow% = BX  ' RT3E_42
L_3D05: BX = 0xD
L_3D08: LOCATE LocateRow%, BX  ' RT3E_44
L_3D0B: ' PRINT statement begins
L_3D0E: BX = &H90B0
L_3D11: PRINT S_90B0$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3D14: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3D17: SI = &H827C
L_3D1A: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_3D1D: GOTO L_3E31
L_3D20: DI = &H88AE
L_3D23: SI = &H87F2
L_3D26: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88AE)  ' RT3F_7F
L_3D29: BX = SI
L_3D2B: DX = BX
L_3D2D: BX = CINT(FAC!)  ' RT3F_77
L_3D30: LocateRow% = BX  ' RT3E_42
L_3D33: BX = 2
L_3D36: LOCATE LocateRow%, BX  ' RT3E_44
L_3D39: DI = &H882A
L_3D3C: SI = &H87FA
L_3D3F: N_882A! = N_87FA!  ' RT3F_7B
L_3D42: SWAP DX, SI
L_3D44: BX = DI
L_3D46: DI = &H882E
L_3D49: N_882E! = N(SI)  ' RT3F_7B
L_3D4C: GOSUB L_0359
L_3D4F: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_3D52: IF (NOT CF AND NOT ZF) THEN GOTO L_3D57  ' flags from L_3D4F
L_3D54: GOTO L_3DDE
L_3D57: ' PRINT statement begins
L_3D5A: DI = &H8A6C
L_3D5D: SI = &H87F2
L_3D60: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8A6C)  ' RT3F_7F
L_3D63: BX = SI
L_3D65: DX = BX
L_3D67: BX = CINT(FAC!)  ' RT3F_77
L_3D6A: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_3D6D: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_3D70: BX = &H8BBE
L_3D73: PRINT S_8BBE$;  ' RT3F_6A; separator/format variant retained by RT tag
L_3D76: SI = DX
L_3D78: BX = CINT(N(SI))  ' RT3F_75
L_3D7B: BX = BX * (2 ^ 1)
L_3D7D: BX = BX * (2 ^ 1)
L_3D7F: BX = BX + &H4288
L_3D83: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_3D86: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3D89: RT3E_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_43
L_3D8C: BX = 0xC
L_3D8F: LOCATE LocateRow%, BX  ' RT3E_44
L_3D92: ' PRINT statement begins
L_3D95: DI = &H882A
L_3D98: SI = &H87FE
L_3D9B: N_882A! = N_87FE!  ' RT3F_7B
L_3D9E: SI = DX
L_3DA0: BX = DI
L_3DA2: DI = &H882E
L_3DA5: N_882E! = N(SI)  ' RT3F_7B
L_3DA8: GOSUB L_0359
L_3DAB: BX = &H1A
L_3DAE: PRINT FAC!;  ' RT3F_67; M ledger
L_3DB1: BX = &H90C4
L_3DB4: PRINT S_90C4$;  ' RT3F_6A; separator/format variant retained by RT tag
L_3DB7: DI = &H882A
L_3DBA: SI = &H88BA
L_3DBD: N_882A! = N_88BA!  ' RT3F_7B
L_3DC0: DI = &H882E
L_3DC3: SI = &H87F2
L_3DC6: N_882E! = N_87F2!  ' RT3F_7B
L_3DC9: GOSUB L_0359
L_3DCC: BX = &H1A
L_3DCF: PRINT FAC!;  ' RT3F_67; M ledger
L_3DD2: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3DD5: RT3E_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_43
L_3DD8: BX = &H15
L_3DDB: LOCATE LocateRow%, BX  ' RT3E_44
L_3DDE: DI = &H882A
L_3DE1: SI = &H87FA
L_3DE4: N_882A! = N_87FA!  ' RT3F_7B
L_3DE7: BX = DI
L_3DE9: DI = &H882E
L_3DEC: DX = SI
L_3DEE: SI = &H87F2
L_3DF1: N_882E! = N_87F2!  ' RT3F_7B
L_3DF4: GOSUB L_0359
L_3DF7: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_3DFA: IF (NOT CF AND NOT ZF) THEN GOTO L_3DFF  ' flags from L_3DF7
L_3DFC: GOTO L_3E28
L_3DFF: ' PRINT statement begins
L_3E02: DI = &H882A
L_3E05: SI = &H888E
L_3E08: N_882A! = N_888E!  ' RT3F_7B
L_3E0B: DI = &H882E
L_3E0E: SI = &H87F2
L_3E11: N_882E! = N_87F2!  ' RT3F_7B
L_3E14: GOSUB L_0359
L_3E17: BX = CINT(FAC!)  ' RT3F_77
L_3E1A: BX = BX * (2 ^ 1)
L_3E1C: BX = BX * (2 ^ 1)
L_3E1E: BX = BX + &H87BE
L_3E22: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3E25: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3E28: DI = &H827C
L_3E2B: SI = &H87F2
L_3E2E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_3E31: DI = &H87F2
L_3E34: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_3E37: SI = DI
L_3E39: DI = &H8812
L_3E3C: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_3E3F: IF CompareLeft! > CompareRight! THEN GOTO L_3E44  ' flags from L_3E3C
L_3E41: GOTO L_3D20
L_3E44: BX = &H18
L_3E47: LocateRow% = BX  ' RT3E_42
L_3E4A: BX = 8
L_3E4D: LOCATE LocateRow%, BX  ' RT3E_44
L_3E50: GOSUB L_12B5
L_3E53: GOSUB L_13E5
L_3E56: GOTO L_3C56
L_3E59: DI = &H8AD2
L_3E5C: SI = &H827C
L_3E5F: N_8AD2! = N_827C!  ' RT3F_7B
L_3E62: DI = &H90CA
L_3E65: BX = SI
L_3E67: SI = &H87FA
L_3E6A: N_90CA! = N_87FA!  ' RT3F_7B
L_3E6D: SI = BX
L_3E6F: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_3E72: GOTO L_3EF8
L_3E75: ' Alignment NOP
L_3E76: DI = &H882A
L_3E79: SI = &H888E
L_3E7C: N_882A! = N_888E!  ' RT3F_7B
L_3E7F: BX = DI
L_3E81: DI = &H882E
L_3E84: SI = &H87F2
L_3E87: N_882E! = N_87F2!  ' RT3F_7B
L_3E8A: GOSUB L_0359
L_3E8D: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_3E90: BX = 0
L_3E93: IF (CF OR ZF) THEN GOTO L_3E96  ' flags from L_3E8D
L_3E95: BX = BX - 1
L_3E96: DI = &H882A
L_3E99: SI = &H8C56
L_3E9C: N_882A! = N_8C56!  ' RT3F_7B
L_3E9F: DX = DI
L_3EA1: DI = &H882E
L_3EA4: CX = SI
L_3EA6: SI = &H87F2
L_3EA9: N_882E! = N_87F2!  ' RT3F_7B
L_3EAC: WORD(BP - 6) = BX
L_3EAF: GOSUB L_0359
L_3EB2: DI = &H90CA
L_3EB5: CompareLeft! = FAC!: CompareRight! = N_90CA!  ' RT3F_A1
L_3EB8: BX = 0
L_3EBB: IF CompareLeft! < CompareRight! THEN GOTO L_3EBE  ' flags from L_3EB5
L_3EBD: BX = BX - 1
L_3EBE: BX = BX AND WORD(BP - 6)
L_3EC1: CompareLeft% = BX: CompareRight% = 0
L_3EC3: IF CompareLeft% <> CompareRight% THEN GOTO L_3EC8  ' flags from L_3EC1
L_3EC5: GOTO L_3EEF
L_3EC8: BX = DI
L_3ECA: DI = &H8AD2
L_3ECD: SI = &H87F2
L_3ED0: N_8AD2! = N_87F2!  ' RT3F_7B
L_3ED3: DI = &H882A
L_3ED6: DX = SI
L_3ED8: SI = &H8C56
L_3EDB: N_882A! = N_8C56!  ' RT3F_7B
L_3EDE: SI = DX
L_3EE0: DI = &H882E
L_3EE3: N_882E! = N_87F2!  ' RT3F_7B
L_3EE6: GOSUB L_0359
L_3EE9: DI = &H90CA
L_3EEC: N_90CA! = FAC!: SI = &H001A  ' RT3F_7D
L_3EEF: DI = &H827C
L_3EF2: SI = &H87F2
L_3EF5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_3EF8: DI = &H87F2
L_3EFB: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_3EFE: SI = DI
L_3F00: DI = &H8812
L_3F03: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_3F06: IF CompareLeft! > CompareRight! THEN GOTO L_3F0B  ' flags from L_3F03
L_3F08: GOTO L_3E76
L_3F0B: GOSUB L_14CA
L_3F0E: BX = 0xF
L_3F11: LocateRow% = BX  ' RT3E_42
L_3F14: BX = &H1A
L_3F17: LOCATE LocateRow%, BX  ' RT3E_44
L_3F1A: ' PRINT statement begins
L_3F1D: SI = &H8AD2
L_3F20: DX = BX
L_3F22: BX = CINT(N_8AD2!)  ' RT3F_75
L_3F25: BX = BX * (2 ^ 1)
L_3F27: BX = BX * (2 ^ 1)
L_3F29: BX = BX + &H4288
L_3F2D: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3F30: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3F33: BX = &H10
L_3F36: LocateRow% = BX  ' RT3E_42
L_3F39: BX = DX
L_3F3B: LOCATE LocateRow%, BX  ' RT3E_44
L_3F3E: ' PRINT statement begins
L_3F41: BX = &H90CE
L_3F44: PRINT S_90CE$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_3F47: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_3F4A: DI = &H8964
L_3F4D: SI = &H87FA
L_3F50: N_8964! = N_87FA!  ' RT3F_7B
L_3F53: SI = &H827C
L_3F56: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_3F59: GOTO L_415D
L_3F5C: DI = &H882A
L_3F5F: SI = &H87FE
L_3F62: N_882A! = N_87FE!  ' RT3F_7B
L_3F65: BX = DI
L_3F67: DI = &H882E
L_3F6A: SI = &H8950
L_3F6D: N_882E! = N_8950!  ' RT3F_7B
L_3F70: GOSUB L_0359
L_3F73: DI = &H882A
L_3F76: SI = &H88BA
L_3F79: N_882A! = N_88BA!  ' RT3F_7B
L_3F7C: BX = DI
L_3F7E: DI = &H882E
L_3F81: SI = &H8950
L_3F84: N_882E! = N_8950!  ' RT3F_7B
L_3F87: RT3F_71(AX=AX, BX=&H882A, CX=CX, DX=DX, SI=&H8950, DI=&H882E, inline=&H80)  ' RT3F_71
L_3F8B: GOSUB L_0359
L_3F8E: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_A5
L_3F92: BX = 0
L_3F95: IF CF THEN GOTO L_3F98  ' flags from L_3F8E
L_3F97: BX = BX - 1
L_3F98: DI = &H882A
L_3F9B: SI = &H888E
L_3F9E: N_882A! = N_888E!  ' RT3F_7B
L_3FA1: DI = &H882E
L_3FA4: SI = &H8950
L_3FA7: N_882E! = N_8950!  ' RT3F_7B
L_3FAA: WORD(BP - 6) = BX
L_3FAD: GOSUB L_0359
L_3FB0: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_3FB3: BX = 0
L_3FB6: IF NOT ZF THEN GOTO L_3FB9  ' flags from L_3FB0
L_3FB8: BX = BX - 1
L_3FB9: BX = BX OR WORD(BP - 6)
L_3FBC: CompareLeft% = BX: CompareRight% = 0
L_3FBE: IF CompareLeft% = CompareRight% THEN GOTO L_3FC3  ' flags from L_3FBC
L_3FC0: GOTO L_4154
L_3FC3: DI = &H8964
L_3FC6: SI = &H827C
L_3FC9: N_8964! = N_827C!  ' RT3F_7B
L_3FCC: DI = &H8C3E
L_3FCF: N_8C3E! = N_827C!  ' RT3F_7B
L_3FD2: GOSUB L_1707
L_3FD5: DI = &H8A68
L_3FD8: SI = &H90CA
L_3FDB: FAC! = N_90CA! * N_8A68!  ' RT3F_8F
L_3FDE: DI = &H880A
L_3FE1: BX = SI
L_3FE3: FAC! = FAC! * N_880A!  ' RT3F_91
L_3FE6: DI = BX
L_3FE8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_3FEB: GOSUB L_150E
L_3FEE: BX = &H13
L_3FF1: LocateRow% = BX  ' RT3E_42
L_3FF4: BX = &H1A
L_3FF7: LOCATE LocateRow%, BX  ' RT3E_44
L_3FFA: ' PRINT statement begins
L_3FFD: SI = &H8950
L_4000: DX = BX
L_4002: BX = CINT(N_8950!)  ' RT3F_75
L_4005: BX = BX * (2 ^ 1)
L_4007: BX = BX * (2 ^ 1)
L_4009: BX = BX + &H4288
L_400D: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_4010: BX = &H90EA
L_4013: PRINT S_90EA$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4016: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4019: BX = &H14
L_401C: LocateRow% = BX  ' RT3E_42
L_401F: BX = DX
L_4021: LOCATE LocateRow%, BX  ' RT3E_44
L_4024: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_4027: DI = &H8832
L_402A: FAC! = FAC! * N_8832!  ' RT3F_91
L_402D: DI = &H90CA
L_4030: CompareLeft! = FAC!: CompareRight! = N_90CA!  ' RT3F_A1
L_4033: IF CompareLeft! > CompareRight! THEN GOTO L_4038  ' flags from L_4030
L_4035: GOTO L_4047
L_4038: ' PRINT statement begins
L_403B: BX = &H90DC
L_403E: PRINT S_90DC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4041: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4044: GOTO L_4145
L_4047: DI = &H882A
L_404A: SI = &H87FE
L_404D: N_882A! = N_87FE!  ' RT3F_7B
L_4050: BX = DI
L_4052: DI = &H882E
L_4055: SI = &H8950
L_4058: N_882E! = N_8950!  ' RT3F_7B
L_405B: GOSUB L_0359
L_405E: DI = &H88E2
L_4061: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88E2)  ' RT3F_81
L_4064: DI = &H8FDC
L_4067: N_8FDC! = FAC!: SI = &H001A  ' RT3F_7D
L_406A: BX = DI
L_406C: DI = &H882A
L_406F: SI = &H88BA
L_4072: N_882A! = N_88BA!  ' RT3F_7B
L_4075: DX = DI
L_4077: DI = &H882E
L_407A: CX = SI
L_407C: SI = &H8950
L_407F: N_882E! = N_8950!  ' RT3F_7B
L_4082: GOSUB L_0359
L_4085: DI = &H8FDC
L_4088: CompareLeft! = FAC!: CompareRight! = N_8FDC!  ' RT3F_A1
L_408B: IF CompareLeft! <= CompareRight! THEN GOTO L_4090  ' flags from L_4088
L_408D: GOTO L_40BC
L_4090: BX = DI
L_4092: DI = &H882A
L_4095: SI = &H88BA
L_4098: N_882A! = N_88BA!  ' RT3F_7B
L_409B: DI = &H882E
L_409E: SI = &H8950
L_40A1: N_882E! = N_8950!  ' RT3F_7B
L_40A4: GOSUB L_0359
L_40A7: DI = &H8FDC
L_40AA: N_8FDC! = FAC!: SI = &H001A  ' RT3F_7D
L_40AD: ' PRINT statement begins
L_40B0: BX = &H90F2
L_40B3: PRINT S_90F2$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_40B6: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_40B9: GOTO L_40C8
L_40BC: ' PRINT statement begins
L_40BF: BX = &H9102
L_40C2: PRINT S_9102$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_40C5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_40C8: DI = &H883E
L_40CB: SI = &H87FE
L_40CE: N_883E! = N_87FE!  ' RT3F_7B
L_40D1: DI = &H8842
L_40D4: SI = &H8950
L_40D7: N_8842! = N_8950!  ' RT3F_7B
L_40DA: GOSUB L_038B
L_40DD: BX = CINT(FAC!)  ' RT3F_77
L_40E0: DI = BX
L_40E2: DI = DI * (2 ^ 1)
L_40E4: DI = DI * (2 ^ 1)
L_40E6: DI = DI + &H1850
L_40EA: SI = &H8FDC
L_40ED: N(DI) = N_8FDC!  ' RT3F_7B
L_40F0: DI = &H827C
L_40F3: SI = &H8A68
L_40F6: CompareLeft! = N_8A68!: CompareRight! = N_827C!  ' RT3F_9F
L_40F9: BX = 0
L_40FC: IF CompareLeft! <> CompareRight! THEN GOTO L_40FF  ' flags from L_40F6
L_40FE: BX = BX - 1
L_40FF: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_4102: DI = &H88BE
L_4105: CompareLeft! = FAC!: CompareRight! = N_88BE!  ' RT3F_A1
L_4108: DX = 0
L_410B: IF CompareLeft! <= CompareRight! THEN GOTO L_410E  ' flags from L_4105
L_410D: DX = DX - 1
L_410E: DX = DX AND BX
L_4110: CompareLeft% = DX: CompareRight% = 0
L_4112: IF CompareLeft% <> CompareRight% THEN GOTO L_4117  ' flags from L_4110
L_4114: GOTO L_4145
L_4117: BX = &H16
L_411A: LocateRow% = BX  ' RT3E_42
L_411D: BX = &H1A
L_4120: LOCATE LocateRow%, BX  ' RT3E_44
L_4123: ' PRINT statement begins
L_4126: BX = &H9112
L_4129: PRINT S_9112$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_412C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_412F: SI = &H8C42
L_4132: BX = CINT(N_8C42!)  ' RT3F_75
L_4135: DI = BX
L_4137: DI = DI * (2 ^ 1)
L_4139: DI = DI * (2 ^ 1)
L_413B: DI = DI + &H1850
L_413F: SI = &H87FA
L_4142: N(DI) = N_87FA!  ' RT3F_7B
L_4145: BX = &H18
L_4148: LocateRow% = BX  ' RT3E_42
L_414B: BX = &H1A
L_414E: LOCATE LocateRow%, BX  ' RT3E_44
L_4151: GOSUB L_12B5
L_4154: DI = &H827C
L_4157: SI = &H8950
L_415A: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8950, DI=&H827C)  ' RT3F_7F
L_415D: DI = &H8950
L_4160: N_8950! = FAC!: SI = &H001A  ' RT3F_7D
L_4163: SI = DI
L_4165: DI = &H8812
L_4168: CompareLeft! = N_8950!: CompareRight! = N_8812!  ' RT3F_9F
L_416B: IF CompareLeft! > CompareRight! THEN GOTO L_4170  ' flags from L_4168
L_416D: GOTO L_3F5C
L_4170: SI = &H8964
L_4173: CompareLeft! = N_8964!: CompareRight! = 0  ' RT3F_A7
L_4176: IF CompareLeft! = CompareRight! THEN GOTO L_417B  ' flags from L_4173
L_4178: GOTO L_41B5
L_417B: GOSUB L_150E
L_417E: BX = &H14
L_4181: LocateRow% = BX  ' RT3E_42
L_4184: BX = &H1A
L_4187: LOCATE LocateRow%, BX  ' RT3E_44
L_418A: ' PRINT statement begins
L_418D: DX = BX
L_418F: BX = &H9124
L_4192: PRINT S_9124$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4195: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4198: BX = &H15
L_419B: LocateRow% = BX  ' RT3E_42
L_419E: BX = DX
L_41A0: LOCATE LocateRow%, BX  ' RT3E_44
L_41A3: ' PRINT statement begins
L_41A6: BX = &H9130
L_41A9: PRINT S_9130$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_41AC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_41AF: GOSUB L_128E
L_41B2: GOTO L_3C56
L_41B5: GOTO L_3C56
L_41B8: GOSUB L_13C5
L_41BB: BX = &H9140
L_41BE: DX = &H8BC4
L_41C1: S_8BC4$ = S_9140$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_41C4: GOSUB L_10D3
L_41C7: SI = &H8AD2
L_41CA: CompareLeft! = N_8AD2!: CompareRight! = 0  ' RT3F_A7
L_41CD: IF CompareLeft! = CompareRight! THEN GOTO L_41D2  ' flags from L_41CA
L_41CF: GOTO L_41D8
L_41D2: GOSUB L_13E5
L_41D5: GOTO L_2408
L_41D8: GOSUB L_14CA
L_41DB: GOSUB L_1378
L_41DE: BX = 2
L_41E1: LocateRow% = BX  ' RT3E_42
L_41E4: DX = BX
L_41E6: BX = 3
L_41E9: LOCATE LocateRow%, BX  ' RT3E_44
L_41EC: DI = &H883E
L_41EF: SI = &H87FA
L_41F2: N_883E! = N_87FA!  ' RT3F_7B
L_41F5: DI = &H8842
L_41F8: SI = &H8AD2
L_41FB: N_8842! = N_8AD2!  ' RT3F_7B
L_41FE: GOSUB L_038B

```

### Inspection

```basic
L_4201: DI = &H9150
L_4204: N_9150! = FAC!: SI = &H001A  ' RT3F_7D
L_4207: ' PRINT statement begins
L_420A: SI = DI
L_420C: DI = &H8E74
L_420F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8E74)  ' RT3F_7F
L_4212: BX = CINT(FAC!)  ' RT3F_77
L_4215: SI = BX
L_4217: SI = SI * (2 ^ 1)
L_4219: SI = SI * (2 ^ 1)
L_421B: SI = SI + &H1850
L_421F: BX = CINT(N(SI))  ' RT3F_75
L_4222: BX = BX * (2 ^ 1)
L_4224: BX = BX * (2 ^ 1)
L_4226: BX = BX + &H42AC
L_422A: DX = 0xC
L_422D: RT3D_0B(AX=AX, BX=BX, CX=CX, DX=&H000C, SI=SI, DI=DI)  ' RT3D_0B
L_4230: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_4233: BX = &H8A70
L_4236: PRINT S_8A70$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4239: SI = &H8AD2
L_423C: BX = CINT(N_8AD2!)  ' RT3F_75
L_423F: BX = BX * (2 ^ 1)
L_4241: BX = BX * (2 ^ 1)
L_4243: BX = BX + &H4288
L_4247: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_424A: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_424D: BX = 4
L_4250: LocateRow% = BX  ' RT3E_42
L_4253: BX = 2
L_4256: LOCATE LocateRow%, BX  ' RT3E_44
L_4259: DI = &H9164
L_425C: SI = &H9150
L_425F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H9164)  ' RT3F_7F
L_4262: BX = SI
L_4264: DX = BX
L_4266: BX = CINT(FAC!)  ' RT3F_77
L_4269: SI = BX
L_426B: SI = SI * (2 ^ 1)
L_426D: SI = SI * (2 ^ 1)
L_426F: SI = SI + &H1850
L_4273: DI = &H9168
L_4276: FAC! = N(SI) * N_9168!  ' RT3F_8F
L_4279: DI = &H9160
L_427C: N_9160! = FAC!: SI = &H001A  ' RT3F_7D
L_427F: ' PRINT statement begins
L_4282: BX = DI
L_4284: RT3D_03(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_4287: BX = &H1A
L_428A: PRINT FAC!;  ' RT3F_67; M ledger
L_428D: BX = &H9154
L_4290: PRINT S_9154$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4293: SI = DX
L_4295: DI = &H888E
L_4298: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H888E)  ' RT3F_7F
L_429B: BX = CINT(FAC!)  ' RT3F_77
L_429E: SI = BX
L_42A0: SI = SI * (2 ^ 1)
L_42A2: SI = SI * (2 ^ 1)
L_42A4: SI = SI + &H1850
L_42A8: BX = CINT(N(SI))  ' RT3F_75
L_42AB: BX = BX * (2 ^ 1)
L_42AD: BX = BX * (2 ^ 1)
L_42AF: BX = BX + &H87BE
L_42B3: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_42B6: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_42B9: BX = 5
L_42BC: LocateRow% = BX  ' RT3E_42
L_42BF: BX = 0xE
L_42C2: LOCATE LocateRow%, BX  ' RT3E_44
L_42C5: ' PRINT statement begins
L_42C8: BX = &H916C
L_42CB: PRINT S_916C$;  ' RT3F_6A; separator/format variant retained by RT tag
L_42CE: SI = DX
L_42D0: DI = &H87FE
L_42D3: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H87FE)  ' RT3F_7F
L_42D6: BX = CINT(FAC!)  ' RT3F_77
L_42D9: BX = BX * (2 ^ 1)
L_42DB: BX = BX * (2 ^ 1)
L_42DD: BX = BX + &H1850
L_42E1: RT3D_03(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_42E4: BX = &H1A
L_42E7: PRINT FAC!;  ' RT3F_67; M ledger
L_42EA: BX = &H90C4
L_42ED: PRINT S_90C4$;  ' RT3F_6A; separator/format variant retained by RT tag
L_42F0: SI = DX
L_42F2: DI = &H88BA
L_42F5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88BA)  ' RT3F_7F
L_42F8: BX = CINT(FAC!)  ' RT3F_77
L_42FB: BX = BX * (2 ^ 1)
L_42FD: BX = BX * (2 ^ 1)
L_42FF: BX = BX + &H1850
L_4303: RT3D_03(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_4306: BX = &H1A
L_4309: RT3F_6B(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_430C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_430F: SI = &H87FA
L_4312: FAC! = N_87FA!: DI = &H001E  ' RT3F_6F
L_4315: GOTO L_4398
L_4318: DI = &H8812
L_431B: SI = &H87F2
L_431E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8812)  ' RT3F_7F
L_4321: BX = SI
L_4323: DX = BX
L_4325: BX = CINT(FAC!)  ' RT3F_77
L_4328: LocateRow% = BX  ' RT3E_42
L_432B: BX = 2
L_432E: LOCATE LocateRow%, BX  ' RT3E_44
L_4331: ' PRINT statement begins
L_4334: SI = DX
L_4336: CX = BX
L_4338: BX = CINT(N(SI))  ' RT3F_75
L_433B: BX = BX * (2 ^ 1)
L_433D: BX = BX * (2 ^ 1)
L_433F: BX = BX + &H4870
L_4343: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_4346: SI = DX
L_4348: DI = &H9150
L_434B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9150)  ' RT3F_7F
L_434E: AX = BX
L_4350: BX = CINT(FAC!)  ' RT3F_77
L_4353: BX = BX * (2 ^ 1)
L_4355: BX = BX * (2 ^ 1)
L_4357: BX = BX + &H1850
L_435B: WORD(BP - 6) = BX
L_435E: RT3D_11(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_11
L_4361: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_4364: DX = &H13
L_4367: DX = DX - BX
L_4369: BX = AX
L_436B: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_436E: DX = DX - BX
L_4370: BX = DX
L_4372: DX = &H9172
L_4375: RT3D_0F(AX=AX, BX=BX, CX=CX, DX=&H9172, SI=SI, DI=DI)  ' RT3D_0F
L_4378: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_437B: BX = WORD(BP - 6)
L_437E: RT3D_11(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_11
L_4381: DX = CX
L_4383: CX = 3
L_4386: RT3D_0A(AX=AX, BX=BX, CX=3, DX=DX, SI=SI, DI=DI)  ' RT3D_0A
L_4389: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_438C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_438F: DI = &H827C
L_4392: SI = &H87F2
L_4395: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_4398: DI = &H87F2
L_439B: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_439E: SI = DI
L_43A0: DI = &H8812
L_43A3: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_43A6: IF CompareLeft! > CompareRight! THEN GOTO L_43AB  ' flags from L_43A3
L_43A8: GOTO L_4318
L_43AB: GOSUB L_4B30
L_43AE: BX = 0xE
L_43B1: LocateRow% = BX  ' RT3E_42
L_43B4: BX = 2
L_43B7: LOCATE LocateRow%, BX  ' RT3E_44
L_43BA: ' PRINT statement begins
L_43BD: DX = BX
L_43BF: BX = &H9178
L_43C2: PRINT S_9178$;  ' RT3F_6A; separator/format variant retained by RT tag
L_43C5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_43C8: BX = &H91B4
L_43CB: RT3F_BD(AX=AX, BX=&H91B4, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_43CE: DI = &H880A
L_43D1: SI = &H9150
L_43D4: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H880A)  ' RT3F_7F
L_43D7: CX = SI
L_43D9: AX = BX
L_43DB: BX = CINT(FAC!)  ' RT3F_77
L_43DE: BX = BX * (2 ^ 1)
L_43E0: BX = BX * (2 ^ 1)
L_43E2: BX = BX + &H1850
L_43E6: PRINT N(BX);  ' RT3F_67; M ledger
L_43E9: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_43EC: ' PRINT statement begins
L_43EF: BX = &H91BC
L_43F2: PRINT S_91BC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_43F5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_43F8: BX = 0xF
L_43FB: LocateRow% = BX  ' RT3E_42
L_43FE: BX = DX
L_4400: LOCATE LocateRow%, BX  ' RT3E_44
L_4403: ' PRINT statement begins
L_4406: BX = &H918C
L_4409: PRINT S_918C$;  ' RT3F_6A; separator/format variant retained by RT tag
L_440C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_440F: BX = AX
L_4411: RT3F_BD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_4414: SI = CX
L_4416: DI = &H885E
L_4419: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H885E)  ' RT3F_7F
L_441C: BX = CINT(FAC!)  ' RT3F_77
L_441F: BX = BX * (2 ^ 1)
L_4421: BX = BX * (2 ^ 1)
L_4423: BX = BX + &H1850
L_4427: PRINT N(BX);  ' RT3F_67; M ledger
L_442A: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_442D: ' PRINT statement begins
L_4430: BX = &H91BC
L_4433: PRINT S_91BC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4436: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4439: BX = &H10
L_443C: LocateRow% = BX  ' RT3E_42
L_443F: BX = DX
L_4441: LOCATE LocateRow%, BX  ' RT3E_44
L_4444: ' PRINT statement begins
L_4447: BX = &H91A0
L_444A: PRINT S_91A0$;  ' RT3F_6A; separator/format variant retained by RT tag
L_444D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4450: BX = &H91C2
L_4453: RT3F_BD(AX=AX, BX=&H91C2, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_4456: SI = CX
L_4458: DI = &H87F6
L_445B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H87F6)  ' RT3F_7F
L_445E: BX = CINT(FAC!)  ' RT3F_77
L_4461: BX = BX * (2 ^ 1)
L_4463: BX = BX * (2 ^ 1)
L_4465: BX = BX + &H1850
L_4469: PRINT N(BX);  ' RT3F_67; M ledger
L_446C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_446F: ' PRINT statement begins
L_4472: BX = &H91C8
L_4475: PRINT S_91C8$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4478: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_447B: BX = &H11
L_447E: LocateRow% = BX  ' RT3E_42
L_4481: BX = 2
L_4484: LOCATE LocateRow%, BX  ' RT3E_44
L_4487: ' PRINT statement begins
L_448A: DX = BX
L_448C: BX = &H91D0
L_448F: PRINT S_91D0$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4492: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4495: BX = &H91C2
L_4498: RT3F_BD(AX=AX, BX=&H91C2, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_449B: DI = &H88FE
L_449E: SI = &H9150
L_44A1: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88FE)  ' RT3F_7F
L_44A4: CX = SI
L_44A6: AX = BX
L_44A8: BX = CINT(FAC!)  ' RT3F_77
L_44AB: BX = BX * (2 ^ 1)
L_44AD: BX = BX * (2 ^ 1)
L_44AF: BX = BX + &H1850
L_44B3: RT3D_03(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_44B6: BX = &H1A
L_44B9: PRINT FAC!;  ' RT3F_67; M ledger
L_44BC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_44BF: ' PRINT statement begins
L_44C2: BX = &H91C8
L_44C5: PRINT S_91C8$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_44C8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_44CB: BX = &H12
L_44CE: LocateRow% = BX  ' RT3E_42
L_44D1: BX = DX
L_44D3: LOCATE LocateRow%, BX  ' RT3E_44
L_44D6: ' PRINT statement begins
L_44D9: BX = &H91E4
L_44DC: PRINT S_91E4$;  ' RT3F_6A; separator/format variant retained by RT tag
L_44DF: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_44E2: BX = AX
L_44E4: RT3F_BD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_44E7: SI = CX
L_44E9: DI = &H8C18
L_44EC: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C18)  ' RT3F_7F
L_44EF: BX = CINT(FAC!)  ' RT3F_77
L_44F2: BX = BX * (2 ^ 1)
L_44F4: BX = BX * (2 ^ 1)
L_44F6: BX = BX + &H1850
L_44FA: RT3F_6B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_44FD: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4500: BX = &H13
L_4503: LocateRow% = BX  ' RT3E_42
L_4506: BX = DX
L_4508: LOCATE LocateRow%, BX  ' RT3E_44
L_450B: ' PRINT statement begins
L_450E: BX = &H91F8
L_4511: PRINT S_91F8$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4514: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4517: BX = AX
L_4519: RT3F_BD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_451C: SI = CX
L_451E: DI = &H88AE
L_4521: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88AE)  ' RT3F_7F
L_4524: BX = CINT(FAC!)  ' RT3F_77
L_4527: BX = BX * (2 ^ 1)
L_4529: BX = BX * (2 ^ 1)
L_452B: BX = BX + &H1850
L_452F: RT3F_6B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_4532: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4535: BX = &H15
L_4538: LocateRow% = BX  ' RT3E_42
L_453B: BX = 2
L_453E: LOCATE LocateRow%, BX  ' RT3E_44
L_4541: DI = &H88C2
L_4544: SI = &H9150
L_4547: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88C2)  ' RT3F_7F
L_454A: BX = CINT(FAC!)  ' RT3F_77
L_454D: SI = BX
L_454F: SI = SI * (2 ^ 1)
L_4551: SI = SI * (2 ^ 1)
L_4553: SI = SI + &H1850
L_4557: DI = &H88B2
L_455A: CompareLeft! = N(SI): CompareRight! = N_88B2!  ' RT3F_9F
L_455D: IF CompareLeft! < CompareRight! THEN GOTO L_4562  ' flags from L_455A
L_455F: GOTO L_4571
L_4562: ' PRINT statement begins
L_4565: BX = &H920C
L_4568: PRINT S_920C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_456B: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_456E: GOTO L_457D
L_4571: ' PRINT statement begins
L_4574: BX = &H921A
L_4577: PRINT S_921A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_457A: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_457D: DI = &H88C6
L_4580: SI = &H9150
L_4583: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88C6)  ' RT3F_7F
L_4586: BX = CINT(FAC!)  ' RT3F_77
L_4589: SI = BX
L_458B: SI = SI * (2 ^ 1)
L_458D: SI = SI * (2 ^ 1)
L_458F: SI = SI + &H1850
L_4593: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4596: IF CompareLeft! > CompareRight! THEN GOTO L_459B  ' flags from L_4593
L_4598: GOTO L_45D6
L_459B: BX = &H15
L_459E: LocateRow% = BX  ' RT3E_42
L_45A1: BX = &H11
L_45A4: LOCATE LocateRow%, BX  ' RT3E_44
L_45A7: ' PRINT statement begins
L_45AA: BX = &H922C
L_45AD: PRINT S_922C$;  ' RT3F_6A; separator/format variant retained by RT tag
L_45B0: BX = SI
L_45B2: RT3D_03(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_45B5: BX = &H1A
L_45B8: RT3F_6B(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_45BB: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_45BE: BX = &H16
L_45C1: LocateRow% = BX  ' RT3E_42
L_45C4: BX = 3
L_45C7: LOCATE LocateRow%, BX  ' RT3E_44
L_45CA: ' PRINT statement begins
L_45CD: BX = &H9236
L_45D0: PRINT S_9236$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_45D3: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_45D6: DI = &H88C6
L_45D9: SI = &H9150
L_45DC: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88C6)  ' RT3F_7F
L_45DF: BX = CINT(FAC!)  ' RT3F_77
L_45E2: SI = BX
L_45E4: SI = SI * (2 ^ 1)
L_45E6: SI = SI * (2 ^ 1)
L_45E8: SI = SI + &H1850
L_45EC: DI = &H8286
L_45EF: CompareLeft! = N(SI): CompareRight! = N_8286!  ' RT3F_9F
L_45F2: IF CompareLeft! > CompareRight! THEN GOTO L_45F7  ' flags from L_45EF
L_45F4: GOTO L_460F
L_45F7: BX = &H16
L_45FA: LocateRow% = BX  ' RT3E_42
L_45FD: BX = 0xE
L_4600: LOCATE LocateRow%, BX  ' RT3E_44
L_4603: ' PRINT statement begins
L_4606: BX = &H9244
L_4609: PRINT S_9244$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_460C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_460F: DI = &H88C6
L_4612: SI = &H9150
L_4615: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88C6)  ' RT3F_7F
L_4618: BX = CINT(FAC!)  ' RT3F_77
L_461B: SI = BX
L_461D: SI = SI * (2 ^ 1)
L_461F: SI = SI * (2 ^ 1)
L_4621: SI = SI + &H1850
L_4625: DI = &H88E2
L_4628: CompareLeft! = N(SI): CompareRight! = N_88E2!  ' RT3F_9F
L_462B: IF CompareLeft! > CompareRight! THEN GOTO L_4630  ' flags from L_4628
L_462D: GOTO L_4648
L_4630: BX = &H17
L_4633: LocateRow% = BX  ' RT3E_42
L_4636: BX = 3
L_4639: LOCATE LocateRow%, BX  ' RT3E_44
L_463C: ' PRINT statement begins
L_463F: BX = &H9254
L_4642: PRINT S_9254$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4645: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4648: DI = &H88C6
L_464B: SI = &H9150
L_464E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88C6)  ' RT3F_7F
L_4651: BX = CINT(FAC!)  ' RT3F_77
L_4654: SI = BX
L_4656: SI = SI * (2 ^ 1)
L_4658: SI = SI * (2 ^ 1)
L_465A: SI = SI + &H1850
L_465E: DI = &H8812
L_4661: CompareLeft! = N(SI): CompareRight! = N_8812!  ' RT3F_9F
L_4664: IF CompareLeft! > CompareRight! THEN GOTO L_4669  ' flags from L_4661
L_4666: GOTO L_4681
L_4669: BX = &H17
L_466C: LocateRow% = BX  ' RT3E_42
L_466F: BX = 9
L_4672: LOCATE LocateRow%, BX  ' RT3E_44
L_4675: ' PRINT statement begins
L_4678: BX = &H925C
L_467B: PRINT S_925C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_467E: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4681: DI = &H88C6
L_4684: SI = &H9150
L_4687: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88C6)  ' RT3F_7F
L_468A: BX = CINT(FAC!)  ' RT3F_77
L_468D: SI = BX
L_468F: SI = SI * (2 ^ 1)
L_4691: SI = SI * (2 ^ 1)
L_4693: SI = SI + &H1850
L_4697: DI = &H88D2
L_469A: CompareLeft! = N(SI): CompareRight! = N_88D2!  ' RT3F_9F
L_469D: IF CompareLeft! > CompareRight! THEN GOTO L_46A2  ' flags from L_469A
L_469F: GOTO L_46BA
L_46A2: BX = &H17
L_46A5: LocateRow% = BX  ' RT3E_42
L_46A8: BX = 0xF
L_46AB: LOCATE LocateRow%, BX  ' RT3E_44
L_46AE: ' PRINT statement begins
L_46B1: BX = &H9264
L_46B4: PRINT S_9264$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_46B7: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_46BA: GOSUB L_6658
L_46BD: DI = &H8C14
L_46C0: SI = &H8BF0
L_46C3: CompareLeft! = N_8BF0!: CompareRight! = N_8C14!  ' RT3F_9F
L_46C6: IF CompareLeft! >= CompareRight! THEN GOTO L_46CB  ' flags from L_46C3
L_46C8: GOTO L_4B2A
L_46CB: GOSUB L_13A3
L_46CE: SI = &H87FA
L_46D1: FAC! = N_87FA!: DI = &H001E  ' RT3F_6F
L_46D4: GOTO L_475C
L_46D7: ' Alignment NOP
L_46D8: DI = &H88D2
L_46DB: SI = &H87F2
L_46DE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88D2)  ' RT3F_7F
L_46E1: BX = SI
L_46E3: DX = BX
L_46E5: BX = CINT(FAC!)  ' RT3F_77
L_46E8: LocateRow% = BX  ' RT3E_42
L_46EB: BX = 2
L_46EE: LOCATE LocateRow%, BX  ' RT3E_44
L_46F1: ' PRINT statement begins
L_46F4: SI = DX
L_46F6: DI = &H827C
L_46F9: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_46FC: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_4700: BX = CINT(FAC!)  ' RT3F_77
L_4703: BX = BX * (2 ^ 1)
L_4705: BX = BX * (2 ^ 1)
L_4707: BX = BX + &H42E4
L_470B: CX = DX
L_470D: DX = &H14
L_4710: RT3D_0B(AX=AX, BX=BX, CX=CX, DX=&H0014, SI=SI, DI=DI)  ' RT3D_0B
L_4713: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_4716: BX = 0
L_4718: RT3D_21(AX=AX, BX=0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_21
L_471B: BX = BX - &H17
L_471E: BX = -BX
L_4720: DX = &H9172
L_4723: RT3D_0F(AX=AX, BX=BX, CX=CX, DX=&H9172, SI=SI, DI=DI)  ' RT3D_0F
L_4726: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_4729: DI = CX
L_472B: SI = &H9150
L_472E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=DI)  ' RT3F_7F
L_4731: DI = &H88E6
L_4734: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88E6)  ' RT3F_81
L_4737: BX = CINT(FAC!)  ' RT3F_77
L_473A: SI = BX
L_473C: SI = SI * (2 ^ 1)
L_473E: SI = SI * (2 ^ 1)
L_4740: SI = SI + &H1850
L_4744: DI = &H8A6C
L_4747: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8A6C)  ' RT3F_7F
L_474A: BX = CINT(FAC!)  ' RT3F_77
L_474D: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_4750: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4753: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4756: SI = &H8968
L_4759: FAC! = N_8968!: DI = &H001E  ' RT3F_6F
L_475C: DI = &H87F2
L_475F: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_4762: SI = DI
L_4764: DI = &H885E
L_4767: CompareLeft! = N_87F2!: CompareRight! = N_885E!  ' RT3F_9F
L_476A: IF CompareLeft! > CompareRight! THEN GOTO L_476F  ' flags from L_4767
L_476C: GOTO L_46D8
L_476F: GOSUB L_6658
L_4772: DI = &H8C14
L_4775: SI = &H8BF0
L_4778: CompareLeft! = N_8BF0!: CompareRight! = N_8C14!  ' RT3F_9F
L_477B: IF CompareLeft! >= CompareRight! THEN GOTO L_4780  ' flags from L_4778
L_477D: GOTO L_4B2A
L_4780: GOSUB L_13A3
L_4783: BX = 4
L_4786: LocateRow% = BX  ' RT3E_42
L_4789: BX = 2
L_478C: LOCATE LocateRow%, BX  ' RT3E_44
L_478F: ' PRINT statement begins
L_4792: DX = BX
L_4794: BX = &H9272
L_4797: PRINT S_9272$;  ' RT3F_6A; separator/format variant retained by RT tag
L_479A: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_479D: BX = &H91C2
L_47A0: RT3F_BD(AX=AX, BX=&H91C2, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_47A3: DI = &H8A6C
L_47A6: SI = &H9150
L_47A9: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H8A6C)  ' RT3F_7F
L_47AC: CX = SI
L_47AE: AX = BX
L_47B0: BX = CINT(FAC!)  ' RT3F_77
L_47B3: BX = BX * (2 ^ 1)
L_47B5: BX = BX * (2 ^ 1)
L_47B7: BX = BX + &H1850
L_47BB: PRINT N(BX);  ' RT3F_67; M ledger
L_47BE: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_47C1: ' PRINT statement begins
L_47C4: BX = &H90C4
L_47C7: PRINT S_90C4$;  ' RT3F_6A; separator/format variant retained by RT tag
L_47CA: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_47CD: BX = AX
L_47CF: RT3F_BD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_47D2: SI = CX
L_47D4: DI = &H9014
L_47D7: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9014)  ' RT3F_7F
L_47DA: BX = CINT(FAC!)  ' RT3F_77
L_47DD: BX = BX * (2 ^ 1)
L_47DF: BX = BX * (2 ^ 1)
L_47E1: BX = BX + &H1850
L_47E5: RT3F_6B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_47E8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_47EB: BX = 5
L_47EE: LocateRow% = BX  ' RT3E_42
L_47F1: BX = DX
L_47F3: LOCATE LocateRow%, BX  ' RT3E_44
L_47F6: ' PRINT statement begins
L_47F9: BX = &H9288
L_47FC: PRINT S_9288$;  ' RT3F_6A; separator/format variant retained by RT tag
L_47FF: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4802: BX = AX
L_4804: RT3F_BD(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_4807: SI = CX
L_4809: DI = &H8C10
L_480C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C10)  ' RT3F_7F
L_480F: BX = CINT(FAC!)  ' RT3F_77
L_4812: BX = BX * (2 ^ 1)
L_4814: BX = BX * (2 ^ 1)
L_4816: BX = BX + &H1850
L_481A: PRINT N(BX);  ' RT3F_67; M ledger
L_481D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4820: ' PRINT statement begins
L_4823: BX = &H91BC
L_4826: PRINT S_91BC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4829: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_482C: BX = 6
L_482F: LocateRow% = BX  ' RT3E_42
L_4832: BX = 2
L_4835: LOCATE LocateRow%, BX  ' RT3E_44
L_4838: ' PRINT statement begins
L_483B: DX = BX
L_483D: BX = &H929E
L_4840: PRINT S_929E$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4843: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4846: BX = &H92CA
L_4849: RT3F_BD(AX=AX, BX=&H92CA, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_484C: DI = &H8E70
L_484F: SI = &H9150
L_4852: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H8E70)  ' RT3F_7F
L_4855: BX = SI
L_4857: CX = BX
L_4859: BX = CINT(FAC!)  ' RT3F_77
L_485C: BX = BX * (2 ^ 1)
L_485E: BX = BX * (2 ^ 1)
L_4860: BX = BX + &H1850
L_4864: RT3F_6B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_4867: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_486A: BX = 7
L_486D: LocateRow% = BX  ' RT3E_42
L_4870: BX = DX
L_4872: LOCATE LocateRow%, BX  ' RT3E_44
L_4875: ' PRINT statement begins
L_4878: BX = &H92B4
L_487B: PRINT S_92B4$;  ' RT3F_6A; separator/format variant retained by RT tag
L_487E: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4881: BX = &H91C2
L_4884: RT3F_BD(AX=AX, BX=&H91C2, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BD
L_4887: SI = CX
L_4889: DI = &H92D0
L_488C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H92D0)  ' RT3F_7F
L_488F: BX = CINT(FAC!)  ' RT3F_77
L_4892: BX = BX * (2 ^ 1)
L_4894: BX = BX * (2 ^ 1)
L_4896: BX = BX + &H1850
L_489A: PRINT N(BX);  ' RT3F_67; M ledger
L_489D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_48A0: ' PRINT statement begins
L_48A3: BX = &H92D4
L_48A6: PRINT S_92D4$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_48A9: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_48AC: DI = &H87F2
L_48AF: SI = &H890E
L_48B2: N_87F2! = N_890E!  ' RT3F_7B
L_48B5: SI = &H88A2
L_48B8: FAC! = N_88A2!: DI = &H001E  ' RT3F_6F
L_48BB: GOTO L_4969
L_48BE: DI = &H8286
L_48C1: SI = &H8C42
L_48C4: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C42, DI=&H8286)  ' RT3F_7F
L_48C7: BX = SI
L_48C9: DX = BX
L_48CB: BX = CINT(FAC!)  ' RT3F_77
L_48CE: SI = BX
L_48D0: SI = SI * (2 ^ 1)
L_48D2: SI = SI * (2 ^ 1)
L_48D4: SI = SI + &H1850
L_48D8: BX = SI
L_48DA: SI = &H8AD2
L_48DD: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=DI)  ' RT3F_7F
L_48E0: SI = BX
L_48E2: RT3F_A3(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A3
L_48E5: CX = 0
L_48E8: IF NOT ZF THEN GOTO L_48EB  ' flags from L_48E2
L_48EA: CX = CX - 1
L_48EB: SI = DX
L_48ED: BX = CINT(N(SI))  ' RT3F_75
L_48F0: SI = BX
L_48F2: SI = SI * (2 ^ 1)
L_48F4: SI = SI * (2 ^ 1)
L_48F6: SI = SI + &H1850
L_48FA: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_48FD: BX = 0
L_4900: IF CompareLeft! <= CompareRight! THEN GOTO L_4903  ' flags from L_48FA
L_4902: BX = BX - 1
L_4903: BX = BX AND CX
L_4905: DI = &H87FE
L_4908: DX = SI
L_490A: SI = &H87F2
L_490D: CompareLeft! = N_87F2!: CompareRight! = N_87FE!  ' RT3F_9F
L_4910: CX = 0
L_4913: IF CompareLeft! >= CompareRight! THEN GOTO L_4916  ' flags from L_490D
L_4915: CX = CX - 1
L_4916: CX = CX AND BX
L_4918: CompareLeft% = CX: CompareRight% = 0
L_491A: IF CompareLeft% <> CompareRight% THEN GOTO L_491F  ' flags from L_4918
L_491C: GOTO L_4960
L_491F: DI = &H827C
L_4922: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_4925: DI = SI
L_4927: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_492A: SI = DI
L_492C: DI = &H88AE
L_492F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88AE)  ' RT3F_7F
L_4932: BX = CINT(FAC!)  ' RT3F_77
L_4935: LocateRow% = BX  ' RT3E_42
L_4938: BX = 2
L_493B: LOCATE LocateRow%, BX  ' RT3E_44
L_493E: ' PRINT statement begins
L_4941: SI = DX
L_4943: DI = &H8B90
L_4946: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B90)  ' RT3F_7F
L_4949: BX = CINT(FAC!)  ' RT3F_77
L_494C: BX = BX * (2 ^ 1)
L_494E: BX = BX * (2 ^ 1)
L_4950: BX = BX + &H4534
L_4954: DX = &H17
L_4957: RT3D_0B(AX=AX, BX=BX, CX=CX, DX=&H0017, SI=SI, DI=DI)  ' RT3D_0B
L_495A: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_495D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4960: DI = &H88B2
L_4963: SI = &H8C42
L_4966: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C42, DI=&H88B2)  ' RT3F_7F
L_4969: DI = &H8C42
L_496C: N_8C42! = FAC!: SI = &H001A  ' RT3F_7D
L_496F: SI = DI
L_4971: DI = &H88B6
L_4974: CompareLeft! = N_8C42!: CompareRight! = N_88B6!  ' RT3F_9F
L_4977: IF CompareLeft! > CompareRight! THEN GOTO L_497C  ' flags from L_4974
L_4979: GOTO L_48BE
L_497C: GOSUB L_6658
L_497F: DI = &H8C14
L_4982: SI = &H8BF0
L_4985: CompareLeft! = N_8BF0!: CompareRight! = N_8C14!  ' RT3F_9F
L_4988: IF CompareLeft! >= CompareRight! THEN GOTO L_498D  ' flags from L_4985
L_498A: GOTO L_4B2A
L_498D: GOSUB L_13A3
L_4990: BX = 4
L_4993: LocateRow% = BX  ' RT3E_42
L_4996: BX = 2
L_4999: LOCATE LocateRow%, BX  ' RT3E_44
L_499C: ' PRINT statement begins
L_499F: BX = &H92DC
L_49A2: PRINT S_92DC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_49A5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_49A8: GOSUB L_667D
L_49AB: DI = &H8C42
L_49AE: SI = &H8F08
L_49B1: N_8C42! = N_8F08!  ' RT3F_7B
L_49B4: DI = &H92F0
L_49B7: SI = &H88E2
L_49BA: N_92F0! = N_88E2!  ' RT3F_7B
L_49BD: SI = &H8C42
L_49C0: BX = SI
L_49C2: DX = BX
L_49C4: BX = CINT(N_8C42!)  ' RT3F_75
L_49C7: SI = BX
L_49C9: SI = SI * (2 ^ 1)
L_49CB: SI = SI * (2 ^ 1)
L_49CD: SI = SI + &H1850
L_49D1: DI = &H92F4
L_49D4: N_92F4! = N(SI)  ' RT3F_7B
L_49D7: SI = DI
L_49D9: DI = &H827C
L_49DC: CompareLeft! = N_92F4!: CompareRight! = N_827C!  ' RT3F_9F
L_49DF: BX = 0
L_49E2: IF CompareLeft! >= CompareRight! THEN GOTO L_49E5  ' flags from L_49DC
L_49E4: BX = BX - 1
L_49E5: SI = DX
L_49E7: DI = &H8906
L_49EA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8906)  ' RT3F_7F
L_49ED: CX = BX
L_49EF: BX = CINT(FAC!)  ' RT3F_77
L_49F2: SI = BX
L_49F4: SI = SI * (2 ^ 1)
L_49F6: SI = SI * (2 ^ 1)
L_49F8: SI = SI + &H1850
L_49FC: DI = &H8286
L_49FF: BX = SI
L_4A01: SI = &H8AD2
L_4A04: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H8286)  ' RT3F_7F
L_4A07: SI = BX
L_4A09: RT3F_A3(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A3
L_4A0C: AX = 0
L_4A0F: IF ZF THEN GOTO L_4A12  ' flags from L_4A09
L_4A11: AX = AX - 1
L_4A12: AX = AX OR CX
L_4A14: CompareLeft% = AX: CompareRight% = 0
L_4A16: IF CompareLeft% <> CompareRight% THEN GOTO L_4A1B  ' flags from L_4A14
L_4A18: GOTO L_4A37
L_4A1B: SI = DX
L_4A1D: DI = &H8C18
L_4A20: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C18)  ' RT3F_7F
L_4A23: DI = DX
L_4A25: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4A28: SI = DX
L_4A2A: DI = &H92F8
L_4A2D: CompareLeft! = N(SI): CompareRight! = N_92F8!  ' RT3F_9F
L_4A30: IF CompareLeft! <= CompareRight! THEN GOTO L_4A35  ' flags from L_4A2D
L_4A32: GOTO L_4B27
L_4A35: GOTO L_49BD
L_4A37: DI = &H827C
L_4A3A: SI = &H92F0
L_4A3D: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H92F0, DI=&H827C)  ' RT3F_7F
L_4A40: BX = CINT(FAC!)  ' RT3F_77
L_4A43: LocateRow% = BX  ' RT3E_42
L_4A46: BX = 4
L_4A49: LOCATE LocateRow%, BX  ' RT3E_44
L_4A4C: DI = &H92FC
L_4A4F: SI = &H92F4
L_4A52: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H92F4, DI=&H92FC)  ' RT3F_7F
L_4A55: BX = CINT(FAC!)  ' RT3F_77
L_4A58: SI = BX
L_4A5A: SI = SI * (2 ^ 1)
L_4A5C: SI = SI * (2 ^ 1)
L_4A5E: SI = SI + &H1850
L_4A62: DI = &H88A6
L_4A65: N_88A6! = N(SI)  ' RT3F_7B
L_4A68: SI = DI
L_4A6A: DI = &H8906
L_4A6D: CompareLeft! = N_88A6!: CompareRight! = N_8906!  ' RT3F_9F
L_4A70: IF CompareLeft! > CompareRight! THEN GOTO L_4A75  ' flags from L_4A6D
L_4A72: GOTO L_4A7D
L_4A75: DI = SI
L_4A77: SI = &H88F2
L_4A7A: N(DI) = N_88F2!  ' RT3F_7B
L_4A7D: ' PRINT statement begins
L_4A80: DI = &H8A6C
L_4A83: SI = &H88A6
L_4A86: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88A6, DI=&H8A6C)  ' RT3F_7F
L_4A89: BX = CINT(FAC!)  ' RT3F_77
L_4A8C: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_4A8F: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_4A92: BX = &H9300
L_4A95: PRINT S_9300$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4A98: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4A9B: DI = &H88B2
L_4A9E: SI = &H8C42
L_4AA1: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C42, DI=&H88B2)  ' RT3F_7F
L_4AA4: BX = CINT(FAC!)  ' RT3F_77
L_4AA7: SI = BX
L_4AA9: SI = SI * (2 ^ 1)
L_4AAB: SI = SI * (2 ^ 1)
L_4AAD: SI = SI + &H1850
L_4AB1: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4AB4: IF CompareLeft! < CompareRight! THEN GOTO L_4AB9  ' flags from L_4AB1
L_4AB6: GOTO L_4AC8
L_4AB9: ' PRINT statement begins
L_4ABC: BX = &H9306
L_4ABF: PRINT S_9306$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4AC2: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4AC5: GOTO L_4AD4
L_4AC8: ' PRINT statement begins
L_4ACB: BX = &H8A70
L_4ACE: PRINT S_8A70$;  ' RT3F_6A; separator/format variant retained by RT tag
L_4AD1: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4AD4: DI = &H8B90
L_4AD7: SI = &H92F4
L_4ADA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H92F4, DI=&H8B90)  ' RT3F_7F
L_4ADD: BX = CINT(FAC!)  ' RT3F_77
L_4AE0: BX = BX * (2 ^ 1)
L_4AE2: BX = BX * (2 ^ 1)
L_4AE4: BX = BX + &H43F4
L_4AE8: DX = &H930C
L_4AEB: S_930C$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_4AEE: GOSUB L_673F
L_4AF1: DI = &H8C18
L_4AF4: SI = &H8C42
L_4AF7: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C42, DI=&H8C18)  ' RT3F_7F
L_4AFA: DI = SI
L_4AFC: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4AFF: BX = DI
L_4B01: DI = &H8896
L_4B04: SI = &H92F0
L_4B07: CompareLeft! = N_92F0!: CompareRight! = N_8896!  ' RT3F_9F
L_4B0A: DX = 0
L_4B0D: IF CompareLeft! >= CompareRight! THEN GOTO L_4B10  ' flags from L_4B07
L_4B0F: DX = DX - 1
L_4B10: SI = BX
L_4B12: DI = &H92F8
L_4B15: CompareLeft! = N(SI): CompareRight! = N_92F8!  ' RT3F_9F
L_4B18: CX = 0
L_4B1B: IF CompareLeft! >= CompareRight! THEN GOTO L_4B1E  ' flags from L_4B15
L_4B1D: CX = CX - 1
L_4B1E: CX = CX AND DX
L_4B20: CompareLeft% = CX: CompareRight% = 0
L_4B22: IF CompareLeft% = CompareRight% THEN GOTO L_4B27  ' flags from L_4B20
L_4B24: GOTO L_49BD
L_4B27: GOSUB L_6658
L_4B2A: GOSUB L_1378
L_4B2D: GOTO L_41BB
L_4B30: DI = &H9310
L_4B33: SI = &H87FA
L_4B36: N_9310! = N_87FA!  ' RT3F_7B
L_4B39: DI = &H883E
L_4B3C: N_883E! = N_87FA!  ' RT3F_7B
L_4B3F: DI = &H8842
L_4B42: SI = &H8AD2
L_4B45: N_8842! = N_8AD2!  ' RT3F_7B
L_4B48: GOSUB L_038B
L_4B4B: DI = &H9150
L_4B4E: N_9150! = FAC!: SI = &H001A  ' RT3F_7D
L_4B51: SI = DI
L_4B53: DI = &H9314
L_4B56: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H9314)  ' RT3F_7F
L_4B59: BX = SI
L_4B5B: DX = BX
L_4B5D: BX = CINT(FAC!)  ' RT3F_77
L_4B60: DI = BX
L_4B62: DI = DI * (2 ^ 1)
L_4B64: DI = DI * (2 ^ 1)
L_4B66: DI = DI + &H1850
L_4B6A: SI = DX
L_4B6C: BX = DI
L_4B6E: DI = &H9318
L_4B71: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9318)  ' RT3F_7F
L_4B74: CX = BX
L_4B76: BX = CINT(FAC!)  ' RT3F_77
L_4B79: SI = BX
L_4B7B: SI = SI * (2 ^ 1)
L_4B7D: SI = SI * (2 ^ 1)
L_4B7F: SI = SI + &H1850
L_4B83: SWAP DX, SI
L_4B85: DI = &H8F78
L_4B88: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8F78)  ' RT3F_7F
L_4B8B: BX = SI
L_4B8D: AX = BX
L_4B8F: BX = CINT(FAC!)  ' RT3F_77
L_4B92: SI = BX
L_4B94: SI = SI * (2 ^ 1)
L_4B96: SI = SI * (2 ^ 1)
L_4B98: SI = SI + &H1850
L_4B9C: RT3F_2F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2F
L_4B9F: SI = DX
L_4BA1: RT3F_93(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_93
L_4BA4: SI = AX
L_4BA6: DI = &H931C
L_4BA9: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H931C, inline=&H80)  ' RT3F_71
L_4BAD: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_4BB0: BX = CINT(FAC!)  ' RT3F_77
L_4BB3: SI = BX
L_4BB5: SI = SI * (2 ^ 1)
L_4BB7: SI = SI * (2 ^ 1)
L_4BB9: SI = SI + &H1850
L_4BBD: SWAP SI, AX
L_4BBE: DI = &H8E10
L_4BC1: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8E10)  ' RT3F_7F
L_4BC4: BX = SI
L_4BC6: DX = BX
L_4BC8: BX = CINT(FAC!)  ' RT3F_77
L_4BCB: SI = BX
L_4BCD: SI = SI * (2 ^ 1)
L_4BCF: SI = SI * (2 ^ 1)
L_4BD1: SI = SI + &H1850
L_4BD5: RT3F_2F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2F
L_4BD8: SI = AX
L_4BDA: RT3F_93(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_93
L_4BDD: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_85
L_4BE1: SI = DX
L_4BE3: DI = &H9320
L_4BE6: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9320, inline=&H81)  ' RT3F_71
L_4BEA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_4BED: BX = CINT(FAC!)  ' RT3F_77
L_4BF0: SI = BX
L_4BF2: SI = SI * (2 ^ 1)
L_4BF4: SI = SI * (2 ^ 1)
L_4BF6: SI = SI + &H1850
L_4BFA: SWAP DX, SI
L_4BFC: DI = &H9324
L_4BFF: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9324)  ' RT3F_7F
L_4C02: BX = CINT(FAC!)  ' RT3F_77
L_4C05: SI = BX
L_4C07: SI = SI * (2 ^ 1)
L_4C09: SI = SI * (2 ^ 1)
L_4C0B: SI = SI + &H1850
L_4C0F: RT3F_2F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2F
L_4C12: SI = DX
L_4C14: RT3F_93(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_93
L_4C17: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H81)  ' RT3F_85
L_4C1B: DI = CX
L_4C1D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4C20: DI = &H8286
L_4C23: SI = &H8AD2
L_4C26: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H8286)  ' RT3F_7F
L_4C29: DI = &H9328
L_4C2C: N_9328! = FAC!: SI = &H001A  ' RT3F_7D
L_4C2F: SI = &H8F08
L_4C32: FAC! = N_8F08!: DI = &H001E  ' RT3F_6F
L_4C35: GOTO L_4CAD
L_4C38: DI = &H8906
L_4C3B: SI = &H87F2
L_4C3E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8906)  ' RT3F_7F
L_4C41: BX = SI
L_4C43: DX = BX
L_4C45: BX = CINT(FAC!)  ' RT3F_77
L_4C48: SI = BX
L_4C4A: SI = SI * (2 ^ 1)
L_4C4C: SI = SI * (2 ^ 1)
L_4C4E: SI = SI + &H1850
L_4C52: DI = &H9328
L_4C55: CompareLeft! = N(SI): CompareRight! = N_9328!  ' RT3F_9F
L_4C58: BX = 0
L_4C5B: IF CompareLeft! <> CompareRight! THEN GOTO L_4C5E  ' flags from L_4C55
L_4C5D: BX = BX - 1
L_4C5E: FAC! = CSNG(BX)  ' RT3F_57
L_4C61: SI = DX
L_4C63: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_4C67: BX = CINT(N(SI))  ' RT3F_75
L_4C6A: SI = BX
L_4C6C: SI = SI * (2 ^ 1)
L_4C6E: SI = SI * (2 ^ 1)
L_4C70: SI = SI + &H1850
L_4C74: RT3F_2F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2F
L_4C77: RT3F_95(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_95
L_4C7B: SI = DX
L_4C7D: DI = &H889E
L_4C80: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H889E, inline=&H81)  ' RT3F_71
L_4C84: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_4C87: BX = CINT(FAC!)  ' RT3F_77
L_4C8A: DI = BX
L_4C8C: DI = DI * (2 ^ 1)
L_4C8E: DI = DI * (2 ^ 1)
L_4C90: DI = DI + &H1850
L_4C94: SI = &H8970
L_4C97: FAC! = N_8970! * N(DI)  ' RT3F_8F
L_4C9A: SI = &H9310
L_4C9D: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9310, DI=DI)  ' RT3F_9B
L_4CA0: DI = SI
L_4CA2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4CA5: SI = DX
L_4CA7: DI = &H8C18
L_4CAA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C18)  ' RT3F_7F
L_4CAD: DI = &H87F2
L_4CB0: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_4CB3: SI = DI
L_4CB5: DI = &H901C
L_4CB8: CompareLeft! = N_87F2!: CompareRight! = N_901C!  ' RT3F_9F
L_4CBB: IF CompareLeft! > CompareRight! THEN GOTO L_4CC0  ' flags from L_4CB8
L_4CBD: GOTO L_4C38
L_4CC0: SI = &H932C
L_4CC3: FAC! = N_932C!: DI = &H001E  ' RT3F_6F
L_4CC6: GOTO L_4D3F
L_4CC9: ' Alignment NOP
L_4CCA: DI = &H8286
L_4CCD: SI = &H87F2
L_4CD0: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8286)  ' RT3F_7F
L_4CD3: BX = SI
L_4CD5: DX = BX
L_4CD7: BX = CINT(FAC!)  ' RT3F_77
L_4CDA: SI = BX
L_4CDC: SI = SI * (2 ^ 1)
L_4CDE: SI = SI * (2 ^ 1)
L_4CE0: SI = SI + &H1850
L_4CE4: DI = &H9328
L_4CE7: CompareLeft! = N(SI): CompareRight! = N_9328!  ' RT3F_9F
L_4CEA: BX = 0
L_4CED: IF CompareLeft! <> CompareRight! THEN GOTO L_4CF0  ' flags from L_4CE7
L_4CEF: BX = BX - 1
L_4CF0: FAC! = CSNG(BX)  ' RT3F_57
L_4CF3: SI = DX
L_4CF5: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_4CF9: BX = CINT(N(SI))  ' RT3F_75
L_4CFC: SI = BX
L_4CFE: SI = SI * (2 ^ 1)
L_4D00: SI = SI * (2 ^ 1)
L_4D02: SI = SI + &H1850
L_4D06: RT3F_2F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2F
L_4D09: RT3F_95(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_95
L_4D0D: SI = DX
L_4D0F: DI = &H827C
L_4D12: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C, inline=&H81)  ' RT3F_71
L_4D16: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_4D19: BX = CINT(FAC!)  ' RT3F_77
L_4D1C: DI = BX
L_4D1E: DI = DI * (2 ^ 1)
L_4D20: DI = DI * (2 ^ 1)
L_4D22: DI = DI + &H1850
L_4D26: SI = &H8970
L_4D29: FAC! = N_8970! * N(DI)  ' RT3F_8F
L_4D2C: SI = &H9310
L_4D2F: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9310, DI=DI)  ' RT3F_9B
L_4D32: DI = SI
L_4D34: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4D37: SI = DX
L_4D39: DI = &H88B2
L_4D3C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88B2)  ' RT3F_7F
L_4D3F: DI = &H87F2
L_4D42: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_4D45: SI = DI
L_4D47: DI = &H9330
L_4D4A: CompareLeft! = N_87F2!: CompareRight! = N_9330!  ' RT3F_9F
L_4D4D: IF CompareLeft! > CompareRight! THEN GOTO L_4D52  ' flags from L_4D4A
L_4D4F: GOTO L_4CCA
L_4D52: SI = &H88A2
L_4D55: FAC! = N_88A2!: DI = &H001E  ' RT3F_6F
L_4D58: GOTO L_4DD1
L_4D5B: ' Alignment NOP
L_4D5C: DI = &H8286
L_4D5F: SI = &H87F2
L_4D62: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8286)  ' RT3F_7F
L_4D65: BX = SI
L_4D67: DX = BX
L_4D69: BX = CINT(FAC!)  ' RT3F_77
L_4D6C: SI = BX
L_4D6E: SI = SI * (2 ^ 1)
L_4D70: SI = SI * (2 ^ 1)
L_4D72: SI = SI + &H1850
L_4D76: DI = &H9328
L_4D79: CompareLeft! = N(SI): CompareRight! = N_9328!  ' RT3F_9F
L_4D7C: BX = 0
L_4D7F: IF CompareLeft! <> CompareRight! THEN GOTO L_4D82  ' flags from L_4D79
L_4D81: BX = BX - 1
L_4D82: FAC! = CSNG(BX)  ' RT3F_57
L_4D85: SI = DX
L_4D87: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_4D8B: BX = CINT(N(SI))  ' RT3F_75
L_4D8E: SI = BX
L_4D90: SI = SI * (2 ^ 1)
L_4D92: SI = SI * (2 ^ 1)
L_4D94: SI = SI + &H1850
L_4D98: RT3F_2F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2F
L_4D9B: RT3F_95(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_95
L_4D9F: SI = DX
L_4DA1: DI = &H827C
L_4DA4: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C, inline=&H81)  ' RT3F_71
L_4DA8: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_4DAB: BX = CINT(FAC!)  ' RT3F_77
L_4DAE: DI = BX
L_4DB0: DI = DI * (2 ^ 1)
L_4DB2: DI = DI * (2 ^ 1)
L_4DB4: DI = DI + &H1850
L_4DB8: SI = &H8970
L_4DBB: FAC! = N_8970! * N(DI)  ' RT3F_8F
L_4DBE: SI = &H9310
L_4DC1: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9310, DI=DI)  ' RT3F_9B
L_4DC4: DI = SI
L_4DC6: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4DC9: SI = DX
L_4DCB: DI = &H88B2
L_4DCE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88B2)  ' RT3F_7F
L_4DD1: DI = &H87F2
L_4DD4: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_4DD7: SI = DI
L_4DD9: DI = &H88B6
L_4DDC: CompareLeft! = N_87F2!: CompareRight! = N_88B6!  ' RT3F_9F
L_4DDF: IF CompareLeft! > CompareRight! THEN GOTO L_4DE4  ' flags from L_4DDC
L_4DE1: GOTO L_4D5C
L_4DE4: DI = &H88FE
L_4DE7: SI = &H9150
L_4DEA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88FE)  ' RT3F_7F
L_4DED: BX = SI
L_4DEF: DX = BX
L_4DF1: BX = CINT(FAC!)  ' RT3F_77
L_4DF4: DI = BX
L_4DF6: DI = DI * (2 ^ 1)
L_4DF8: DI = DI * (2 ^ 1)
L_4DFA: DI = DI + &H1850
L_4DFE: SI = DX

```

### Equipment

```basic
L_4E00: BX = DI
L_4E02: DI = &H9314
L_4E05: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9314)  ' RT3F_7F
L_4E08: DX = BX
L_4E0A: BX = CINT(FAC!)  ' RT3F_77
L_4E0D: SI = BX
L_4E0F: SI = SI * (2 ^ 1)
L_4E11: SI = SI * (2 ^ 1)
L_4E13: SI = SI + &H1850
L_4E17: DI = &H9310
L_4E1A: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9310)  ' RT3F_7F
L_4E1D: DI = &H880A
L_4E20: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H880A)  ' RT3F_89
L_4E23: BX = &H1A
L_4E26: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_4E29: DI = DX
L_4E2B: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4E2E: DI = &H88FE
L_4E31: SI = &H9150
L_4E34: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88FE)  ' RT3F_7F
L_4E37: BX = SI
L_4E39: DX = BX
L_4E3B: BX = CINT(FAC!)  ' RT3F_77
L_4E3E: SI = BX
L_4E40: SI = SI * (2 ^ 1)
L_4E42: SI = SI * (2 ^ 1)
L_4E44: SI = SI + &H1850
L_4E48: SWAP DX, SI
L_4E4A: DI = &H87F6
L_4E4D: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H87F6)  ' RT3F_7F
L_4E50: BX = SI
L_4E52: CX = BX
L_4E54: BX = CINT(FAC!)  ' RT3F_77
L_4E57: DI = BX
L_4E59: DI = DI * (2 ^ 1)
L_4E5B: DI = DI * (2 ^ 1)
L_4E5D: DI = DI + &H1850
L_4E61: SI = DX
L_4E63: RT3F_87(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_87
L_4E66: SI = &H8286
L_4E69: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8286, DI=DI)  ' RT3F_9B
L_4E6C: DI = &H8FDC
L_4E6F: N_8FDC! = FAC!: SI = &H001A  ' RT3F_7D
L_4E72: SI = CX
L_4E74: BX = DI
L_4E76: DI = &H8C18
L_4E79: RT3F_7F(AX=AX, BX=&H8FDC, CX=CX, DX=DX, SI=SI, DI=&H8C18)  ' RT3F_7F
L_4E7C: DX = BX
L_4E7E: BX = CINT(FAC!)  ' RT3F_77
L_4E81: SI = BX
L_4E83: SI = SI * (2 ^ 1)
L_4E85: SI = SI * (2 ^ 1)
L_4E87: SI = SI + &H1850
L_4E8B: DI = DX
L_4E8D: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_4E90: DI = &H8852
L_4E93: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8852)  ' RT3F_81
L_4E96: BX = &H1A
L_4E99: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_4E9C: DI = DX
L_4E9E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4EA1: SI = DX
L_4EA3: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4EA6: IF CompareLeft! < CompareRight! THEN GOTO L_4EAB  ' flags from L_4EA3
L_4EA8: GOTO L_4EB4
L_4EAB: SI = &H890E
L_4EAE: N(DI) = N_890E!  ' RT3F_7B
L_4EB1: GOTO L_4ED8
L_4EB4: DI = &H8C18
L_4EB7: SI = &H9150
L_4EBA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H8C18)  ' RT3F_7F
L_4EBD: BX = CINT(FAC!)  ' RT3F_77
L_4EC0: SI = BX
L_4EC2: SI = SI * (2 ^ 1)
L_4EC4: SI = SI * (2 ^ 1)
L_4EC6: SI = SI + &H1850
L_4ECA: DI = &H8FDC
L_4ECD: CompareLeft! = N(SI): CompareRight! = N_8FDC!  ' RT3F_9F
L_4ED0: IF CompareLeft! < CompareRight! THEN GOTO L_4ED5  ' flags from L_4ECD
L_4ED2: GOTO L_4ED8
L_4ED5: N(DI) = N(SI)  ' RT3F_7B
L_4ED8: DI = &H88AE
L_4EDB: SI = &H9150
L_4EDE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9150, DI=&H88AE)  ' RT3F_7F
L_4EE1: BX = CINT(FAC!)  ' RT3F_77
L_4EE4: DI = BX
L_4EE6: DI = DI * (2 ^ 1)
L_4EE8: DI = DI * (2 ^ 1)
L_4EEA: DI = DI + &H1850
L_4EEE: BX = DI
L_4EF0: DI = &H8852
L_4EF3: SI = &H8FDC
L_4EF6: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FDC, DI=&H8852)  ' RT3F_7F
L_4EF9: DX = BX
L_4EFB: BX = &H1A
L_4EFE: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_4F01: DI = DX
L_4F03: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_4F06: RETURN
L_4F07: DI = &H9334
L_4F0A: SI = &H8B90
L_4F0D: N_9334! = N_8B90!  ' RT3F_7B
L_4F10: SI = &H8812
L_4F13: FAC! = N_8812!: DI = &H001E  ' RT3F_6F
L_4F16: GOTO L_4F54
L_4F19: ' Alignment NOP
L_4F1A: DI = &H8286
L_4F1D: SI = &H87F2
L_4F20: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8286)  ' RT3F_7F
L_4F23: BX = SI
L_4F25: DX = BX
L_4F27: BX = CINT(FAC!)  ' RT3F_77
L_4F2A: SI = BX
L_4F2C: SI = SI * (2 ^ 1)
L_4F2E: SI = SI * (2 ^ 1)
L_4F30: SI = SI + &H4288
L_4F34: SWAP DX, SI
L_4F36: BX = SI
L_4F38: CX = BX
L_4F3A: BX = CINT(N(SI))  ' RT3F_75
L_4F3D: DI = BX
L_4F3F: DI = DI * (2 ^ 1)
L_4F41: DI = DI * (2 ^ 1)
L_4F43: DI = DI + &H4288
L_4F47: SI = DX
L_4F49: RT3F_14(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_14
L_4F4C: SI = CX
L_4F4E: DI = &H9334
L_4F51: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9334)  ' RT3F_7F
L_4F54: DI = &H87F2
L_4F57: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_4F5A: SI = &H9334
L_4F5D: CompareLeft! = N_9334!: CompareRight! = 0  ' RT3F_A7
L_4F60: IF CompareLeft! < CompareRight! THEN GOTO L_4F65  ' flags from L_4F5D
L_4F62: GOTO L_4F72
L_4F65: SI = DI
L_4F67: DI = &H827C
L_4F6A: CompareLeft! = N(SI): CompareRight! = N_827C!  ' RT3F_9F
L_4F6D: IF CompareLeft! >= CompareRight! THEN GOTO L_4F1A  ' flags from L_4F6A
L_4F6F: GOTO L_4F7D
L_4F72: DI = &H827C
L_4F75: SI = &H87F2
L_4F78: CompareLeft! = N_87F2!: CompareRight! = N_827C!  ' RT3F_9F
L_4F7B: IF CompareLeft! <= CompareRight! THEN GOTO L_4F1A  ' flags from L_4F78
L_4F7D: RETURN
L_4F7E: DI = &H92F0
L_4F81: SI = &H88B2
L_4F84: N_92F0! = N_88B2!  ' RT3F_7B
L_4F87: DI = &H8A68
L_4F8A: SI = &H890E
L_4F8D: N_8A68! = N_890E!  ' RT3F_7B
L_4F90: DI = &H9338
L_4F93: SI = &H8B90
L_4F96: N_9338! = N_8B90!  ' RT3F_7B
L_4F99: GOSUB L_13C5
L_4F9C: GOSUB L_1378
L_4F9F: GOSUB L_1378
L_4FA2: BX = 2
L_4FA5: LocateRow% = BX  ' RT3E_42
L_4FA8: BX = 0xA
L_4FAB: LOCATE LocateRow%, BX  ' RT3E_44
L_4FAE: ' PRINT statement begins
L_4FB1: BX = &H933C
L_4FB4: PRINT S_933C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_4FB7: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_4FBA: SI = &H8F08
L_4FBD: FAC! = N_8F08!: DI = &H001E  ' RT3F_6F
L_4FC0: GOTO L_503F
L_4FC3: ' Alignment NOP
L_4FC4: SI = &H8C42
L_4FC7: BX = SI
L_4FC9: DX = BX
L_4FCB: BX = CINT(N_8C42!)  ' RT3F_75
L_4FCE: SI = BX
L_4FD0: SI = SI * (2 ^ 1)
L_4FD2: SI = SI * (2 ^ 1)
L_4FD4: SI = SI + &H1850
L_4FD8: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_4FDB: BX = 0
L_4FDE: IF CompareLeft! <= CompareRight! THEN GOTO L_4FE1  ' flags from L_4FD8
L_4FE0: BX = BX - 1
L_4FE1: SWAP DX, SI
L_4FE3: DI = &H8906
L_4FE6: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8906)  ' RT3F_7F
L_4FE9: CX = BX
L_4FEB: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_4FEF: BX = CINT(FAC!)  ' RT3F_77
L_4FF2: SI = BX
L_4FF4: SI = SI * (2 ^ 1)
L_4FF6: SI = SI * (2 ^ 1)
L_4FF8: SI = SI + &H1850
L_4FFC: DI = &H8286
L_4FFF: CompareLeft! = N(SI): CompareRight! = N_8286!  ' RT3F_9F
L_5002: BX = 0
L_5005: IF CompareLeft! <= CompareRight! THEN GOTO L_5008  ' flags from L_4FFF
L_5007: BX = BX - 1
L_5008: BX = BX AND CX
L_500A: CompareLeft% = BX: CompareRight% = 0
L_500C: IF CompareLeft% <> CompareRight% THEN GOTO L_5011  ' flags from L_500A
L_500E: GOTO L_5036
L_5011: SI = DX
L_5013: DI = &H8B90
L_5016: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B90)  ' RT3F_7F
L_5019: BX = CINT(FAC!)  ' RT3F_77
L_501C: BX = BX * (2 ^ 1)
L_501E: BX = BX * (2 ^ 1)
L_5020: BX = BX + &H43F4
L_5024: DX = &H930C
L_5027: S_930C$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_502A: DI = &H9348
L_502D: SI = &H8968
L_5030: N_9348! = N_8968!  ' RT3F_7B
L_5033: GOSUB L_51BA
L_5036: DI = &H8C18
L_5039: SI = &H8C42
L_503C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C42, DI=&H8C18)  ' RT3F_7F
L_503F: DI = &H8C42
L_5042: N_8C42! = FAC!: SI = &H001A  ' RT3F_7D
L_5045: SI = DI
L_5047: DI = &H901C
L_504A: CompareLeft! = N_8C42!: CompareRight! = N_901C!  ' RT3F_9F
L_504D: IF CompareLeft! > CompareRight! THEN GOTO L_5052  ' flags from L_504A
L_504F: GOTO L_4FC4
L_5052: DI = &H934C
L_5055: SI = &H8C42
L_5058: CompareLeft! = N_8C42!: CompareRight! = N_934C!  ' RT3F_9F
L_505B: IF CompareLeft! <= CompareRight! THEN GOTO L_5060  ' flags from L_5058
L_505D: GOTO L_53D4
L_5060: SI = &H932C
L_5063: FAC! = N_932C!: DI = &H001E  ' RT3F_6F
L_5066: GOTO L_50E8
L_5069: ' Alignment NOP
L_506A: SI = &H8C42
L_506D: BX = SI
L_506F: DX = BX
L_5071: BX = CINT(N_8C42!)  ' RT3F_75
L_5074: SI = BX
L_5076: SI = SI * (2 ^ 1)
L_5078: SI = SI * (2 ^ 1)
L_507A: SI = SI + &H1850
L_507E: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5081: BX = 0
L_5084: IF CompareLeft! <= CompareRight! THEN GOTO L_5087  ' flags from L_507E
L_5086: BX = BX - 1
L_5087: SWAP DX, SI
L_5089: DI = &H8286
L_508C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8286)  ' RT3F_7F
L_508F: CX = BX
L_5091: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_5095: BX = CINT(FAC!)  ' RT3F_77
L_5098: SI = BX
L_509A: SI = SI * (2 ^ 1)
L_509C: SI = SI * (2 ^ 1)
L_509E: SI = SI + &H1850
L_50A2: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_50A5: BX = 0
L_50A8: IF CompareLeft! <= CompareRight! THEN GOTO L_50AB  ' flags from L_50A2
L_50AA: BX = BX - 1
L_50AB: BX = BX AND CX
L_50AD: CompareLeft% = BX: CompareRight% = 0
L_50AF: IF CompareLeft% <> CompareRight% THEN GOTO L_50B4  ' flags from L_50AD
L_50B1: GOTO L_50DF
L_50B4: SI = DX
L_50B6: DI = &H8B90
L_50B9: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B90)  ' RT3F_7F
L_50BC: BX = CINT(FAC!)  ' RT3F_77
L_50BF: BX = BX * (2 ^ 1)
L_50C1: BX = BX * (2 ^ 1)
L_50C3: BX = BX + &H43F4
L_50C7: AX = &H9350
L_50CA: RT3F_55(AX=&H9350, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_50CD: DX = &H930C
L_50D0: S_930C$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_50D3: DI = &H9348
L_50D6: SI = &H8968
L_50D9: N_9348! = N_8968!  ' RT3F_7B
L_50DC: GOSUB L_51BA
L_50DF: DI = &H88B2
L_50E2: SI = &H8C42
L_50E5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C42, DI=&H88B2)  ' RT3F_7F
L_50E8: DI = &H8C42
L_50EB: N_8C42! = FAC!: SI = &H001A  ' RT3F_7D
L_50EE: SI = DI
L_50F0: DI = &H9330
L_50F3: CompareLeft! = N_8C42!: CompareRight! = N_9330!  ' RT3F_9F
L_50F6: IF CompareLeft! > CompareRight! THEN GOTO L_50FB  ' flags from L_50F3
L_50F8: GOTO L_506A
L_50FB: DI = &H934C
L_50FE: SI = &H8C42
L_5101: CompareLeft! = N_8C42!: CompareRight! = N_934C!  ' RT3F_9F
L_5104: IF CompareLeft! <= CompareRight! THEN GOTO L_5109  ' flags from L_5101
L_5106: GOTO L_53D4
L_5109: SI = &H88A2
L_510C: FAC! = N_88A2!: DI = &H001E  ' RT3F_6F
L_510F: GOTO L_518A
L_5112: SI = &H8C42
L_5115: BX = SI
L_5117: DX = BX
L_5119: BX = CINT(N_8C42!)  ' RT3F_75
L_511C: SI = BX
L_511E: SI = SI * (2 ^ 1)
L_5120: SI = SI * (2 ^ 1)
L_5122: SI = SI + &H1850
L_5126: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5129: BX = 0
L_512C: IF CompareLeft! <= CompareRight! THEN GOTO L_512F  ' flags from L_5126
L_512E: BX = BX - 1
L_512F: SWAP DX, SI
L_5131: DI = &H8286
L_5134: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8286)  ' RT3F_7F
L_5137: CX = BX
L_5139: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_71
L_513D: BX = CINT(FAC!)  ' RT3F_77
L_5140: SI = BX
L_5142: SI = SI * (2 ^ 1)
L_5144: SI = SI * (2 ^ 1)
L_5146: SI = SI + &H1850
L_514A: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_514D: BX = 0
L_5150: IF CompareLeft! <= CompareRight! THEN GOTO L_5153  ' flags from L_514A
L_5152: BX = BX - 1
L_5153: BX = BX AND CX
L_5155: CompareLeft% = BX: CompareRight% = 0
L_5157: IF CompareLeft% <> CompareRight% THEN GOTO L_515C  ' flags from L_5155
L_5159: GOTO L_5181
L_515C: SI = DX
L_515E: DI = &H8B90
L_5161: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B90)  ' RT3F_7F
L_5164: BX = CINT(FAC!)  ' RT3F_77
L_5167: BX = BX * (2 ^ 1)
L_5169: BX = BX * (2 ^ 1)
L_516B: BX = BX + &H4534
L_516F: DX = &H930C
L_5172: S_930C$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_5175: DI = &H9348
L_5178: SI = &H8968
L_517B: N_9348! = N_8968!  ' RT3F_7B
L_517E: GOSUB L_51BA
L_5181: DI = &H88B2
L_5184: SI = &H8C42
L_5187: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C42, DI=&H88B2)  ' RT3F_7F
L_518A: DI = &H8C42
L_518D: N_8C42! = FAC!: SI = &H001A  ' RT3F_7D
L_5190: SI = DI
L_5192: DI = &H88B6
L_5195: CompareLeft! = N_8C42!: CompareRight! = N_88B6!  ' RT3F_9F
L_5198: IF CompareLeft! > CompareRight! THEN GOTO L_519D  ' flags from L_5195
L_519A: GOTO L_5112
L_519D: DI = &H934C
L_51A0: SI = &H8C42
L_51A3: CompareLeft! = N_8C42!: CompareRight! = N_934C!  ' RT3F_9F
L_51A6: IF CompareLeft! <= CompareRight! THEN GOTO L_51AB  ' flags from L_51A3
L_51A8: GOTO L_53D4
L_51AB: DI = &H8A68
L_51AE: SI = &H827C
L_51B1: N_8A68! = N_827C!  ' RT3F_7B
L_51B4: GOSUB L_51BA
L_51B7: GOTO L_53D4
L_51BA: SI = &H8A68
L_51BD: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_51C0: IF CompareLeft! <= CompareRight! THEN GOTO L_51C5  ' flags from L_51BD
L_51C2: GOTO L_5270
L_51C5: DI = &H827C
L_51C8: SI = &H9338
L_51CB: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9338, DI=&H827C)  ' RT3F_7F
L_51CE: SWAP SI, DI
L_51D0: BX = SI
L_51D2: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_51D5: SI = DI
L_51D7: DI = &H92FC
L_51DA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H92FC)  ' RT3F_7F
L_51DD: DX = SI
L_51DF: CX = BX
L_51E1: BX = CINT(FAC!)  ' RT3F_77
L_51E4: DI = BX
L_51E6: DI = DI * (2 ^ 1)
L_51E8: DI = DI * (2 ^ 1)
L_51EA: DI = DI + &H1850
L_51EE: SWAP CX, DI
L_51F0: SI = &H92F0
L_51F3: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H92F0, DI=DI)  ' RT3F_7F
L_51F6: DI = CX
L_51F8: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_51FB: BX = CINT(FAC!)  ' RT3F_77
L_51FE: LocateRow% = BX  ' RT3E_42
L_5201: BX = 2
L_5204: LOCATE LocateRow%, BX  ' RT3E_44
L_5207: ' PRINT statement begins
L_520A: SI = DX
L_520C: DI = &H935E
L_520F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H935E)  ' RT3F_7F
L_5212: BX = CINT(FAC!)  ' RT3F_77
L_5215: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_5218: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_521B: BX = &H9362
L_521E: PRINT S_9362$;  ' RT3F_6A; separator/format variant retained by RT tag
L_5221: SI = &H9348
L_5224: BX = CINT(N_9348!)  ' RT3F_75
L_5227: SI = BX
L_5229: SI = SI * (2 ^ 1)
L_522B: SI = SI * (2 ^ 1)
L_522D: SI = SI + &H1850
L_5231: DI = &H9368
L_5234: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9368)  ' RT3F_7F
L_5237: BX = CINT(FAC!)  ' RT3F_77
L_523A: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_523D: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5240: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5243: SI = DX
L_5245: DI = &H88E2
L_5248: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88E2)  ' RT3F_7F
L_524B: BX = CINT(FAC!)  ' RT3F_77
L_524E: LocateRow% = BX  ' RT3E_42
L_5251: BX = 7
L_5254: LOCATE LocateRow%, BX  ' RT3E_44
L_5257: GOSUB L_673F
L_525A: SI = &H9338
L_525D: BX = CINT(N_9338!)  ' RT3F_75
L_5260: DI = BX
L_5262: DI = DI * (2 ^ 1)
L_5264: DI = DI * (2 ^ 1)
L_5266: DI = DI + &H81C4
L_526A: SI = &H9348
L_526D: N(DI) = N_9348!  ' RT3F_7B
L_5270: SI = &H8A68
L_5273: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_5276: BX = 0
L_5279: IF CompareLeft! <> CompareRight! THEN GOTO L_527C  ' flags from L_5273
L_527B: BX = BX - 1
L_527C: DI = &H936C
L_527F: SI = &H92F0
L_5282: CompareLeft! = N_92F0!: CompareRight! = N_936C!  ' RT3F_9F
L_5285: DX = 0
L_5288: IF CompareLeft! >= CompareRight! THEN GOTO L_528B  ' flags from L_5282
L_528A: DX = DX - 1
L_528B: DX = DX AND BX
L_528D: CompareLeft% = DX: CompareRight% = 0
L_528F: IF CompareLeft% <> CompareRight% THEN GOTO L_5294  ' flags from L_528D
L_5291: GOTO L_5295
L_5294: RETURN
L_5295: SI = &H9338
L_5298: CompareLeft! = N_9338!: CompareRight! = 0  ' RT3F_A7
L_529B: IF CompareLeft! < CompareRight! THEN GOTO L_52A0  ' flags from L_5298
L_529D: GOTO L_52A1
L_52A0: RETURN
L_52A1: BX = &H17
L_52A4: LocateRow% = BX  ' RT3E_42
L_52A7: BX = 2
L_52AA: LOCATE LocateRow%, BX  ' RT3E_44
L_52AD: ' PRINT statement begins
L_52B0: DX = BX
L_52B2: BX = &H9370
L_52B5: PRINT S_9370$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_52B8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_52BB: BX = &H18
L_52BE: LocateRow% = BX  ' RT3E_42
L_52C1: BX = DX
L_52C3: LOCATE LocateRow%, BX  ' RT3E_44
L_52C6: ' PRINT statement begins
L_52C9: BX = &H9386
L_52CC: PRINT S_9386$;  ' RT3F_6A; separator/format variant retained by RT tag
L_52CF: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_52D2: DI = &H8BFC
L_52D5: SI = &H827C
L_52D8: N_8BFC! = N_827C!  ' RT3F_7B
L_52DB: DI = SI
L_52DD: SI = &H9338
L_52E0: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9338, DI=&H827C)  ' RT3F_7F
L_52E3: DI = &H8C00
L_52E6: N_8C00! = FAC!: SI = &H001A  ' RT3F_7D
L_52E9: GOSUB L_12E9
L_52EC: DI = &H8C08
L_52EF: SI = &H8BF0
L_52F2: CompareLeft! = N_8BF0!: CompareRight! = N_8C08!  ' RT3F_9F
L_52F5: IF CompareLeft! = CompareRight! THEN GOTO L_52FA  ' flags from L_52F2
L_52F7: GOTO L_5304
L_52FA: DI = &H8C42
L_52FD: SI = &H939E
L_5300: N_8C42! = N_939E!  ' RT3F_7B
L_5303: RETURN
L_5304: DI = &H8BF8
L_5307: SI = &H8BF0
L_530A: CompareLeft! = N_8BF0!: CompareRight! = N_8BF8!  ' RT3F_9F
L_530D: IF CompareLeft! = CompareRight! THEN GOTO L_5312  ' flags from L_530A
L_530F: GOTO L_5328
L_5312: DI = &H9338
L_5315: SI = &H8B90
L_5318: N_9338! = N_8B90!  ' RT3F_7B
L_531B: DI = &H92F0
L_531E: SI = &H88B2
L_5321: N_92F0! = N_88B2!  ' RT3F_7B
L_5324: GOSUB L_1552
L_5327: RETURN
L_5328: DI = &H8B90
L_532B: SI = &H8BF0
L_532E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8BF0, DI=&H8B90)  ' RT3F_7F
L_5331: BX = CINT(FAC!)  ' RT3F_77
L_5334: SI = BX
L_5336: SI = SI * (2 ^ 1)
L_5338: SI = SI * (2 ^ 1)
L_533A: SI = SI + &H81C4
L_533E: BX = CINT(N(SI))  ' RT3F_75
L_5341: SI = BX
L_5343: SI = SI * (2 ^ 1)
L_5345: SI = SI * (2 ^ 1)
L_5347: SI = SI + &H1850
L_534B: DI = &H827C
L_534E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_5351: DI = &H8FDC
L_5354: N_8FDC! = FAC!: SI = &H001A  ' RT3F_7D
L_5357: SI = DI
L_5359: DI = &H88AE
L_535C: CompareLeft! = N_8FDC!: CompareRight! = N_88AE!  ' RT3F_9F
L_535F: IF CompareLeft! > CompareRight! THEN GOTO L_5364  ' flags from L_535C
L_5361: GOTO L_536C
L_5364: DI = SI
L_5366: SI = &H88B2
L_5369: N(DI) = N_88B2!  ' RT3F_7B
L_536C: DI = &H8B90
L_536F: SI = &H8BF0
L_5372: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8BF0, DI=&H8B90)  ' RT3F_7F
L_5375: BX = SI
L_5377: DX = BX
L_5379: BX = CINT(FAC!)  ' RT3F_77
L_537C: SI = BX
L_537E: SI = SI * (2 ^ 1)
L_5380: SI = SI * (2 ^ 1)
L_5382: SI = SI + &H81C4
L_5386: BX = CINT(N(SI))  ' RT3F_75
L_5389: DI = BX
L_538B: DI = DI * (2 ^ 1)
L_538D: DI = DI * (2 ^ 1)
L_538F: DI = DI + &H1850
L_5393: SI = &H8FDC
L_5396: N(DI) = N_8FDC!  ' RT3F_7B
L_5399: SWAP DX, SI
L_539B: DI = &H93A2
L_539E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H8FDC, SI=SI, DI=&H93A2)  ' RT3F_7F
L_53A1: BX = CINT(FAC!)  ' RT3F_77
L_53A4: SI = BX
L_53A6: SI = SI * (2 ^ 1)
L_53A8: SI = SI * (2 ^ 1)
L_53AA: SI = SI + &H1850
L_53AE: BX = CINT(N(SI))  ' RT3F_75
L_53B1: LocateRow% = BX  ' RT3E_42
L_53B4: BX = 4
L_53B7: LOCATE LocateRow%, BX  ' RT3E_44
L_53BA: ' PRINT statement begins
L_53BD: SI = DX
L_53BF: DI = &H9368
L_53C2: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9368)  ' RT3F_7F
L_53C5: BX = CINT(FAC!)  ' RT3F_77
L_53C8: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_53CB: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_53CE: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_53D1: GOTO L_52D2
L_53D4: GOSUB L_13E5
L_53D7: GOTO L_2408
L_53DA: DI = &H8A68
L_53DD: SI = &H87FA
L_53E0: N_8A68! = N_87FA!  ' RT3F_7B
L_53E3: SI = &H827C
L_53E6: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_53E9: GOTO L_54A2
L_53EC: DI = &H882A
L_53EF: SI = &H88C6
L_53F2: N_882A! = N_88C6!  ' RT3F_7B
L_53F5: BX = DI
L_53F7: DI = &H882E
L_53FA: SI = &H87F2
L_53FD: N_882E! = N_87F2!  ' RT3F_7B

```

### View and utility actions

```basic
L_5400: GOSUB L_0359
L_5403: DI = &H8812
L_5406: CompareLeft! = FAC!: CompareRight! = N_8812!  ' RT3F_A1
L_5409: BX = 0
L_540C: IF CompareLeft! <= CompareRight! THEN GOTO L_540F  ' flags from L_5406
L_540E: BX = BX - 1
L_540F: DI = &H882A
L_5412: SI = &H88CA
L_5415: N_882A! = N_88CA!  ' RT3F_7B
L_5418: DX = DI
L_541A: DI = &H882E
L_541D: CX = SI
L_541F: SI = &H87F2
L_5422: N_882E! = N_87F2!  ' RT3F_7B
L_5425: WORD(BP - 6) = BX
L_5428: GOSUB L_0359
L_542B: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_542E: BX = 0
L_5431: IF (CF OR ZF) THEN GOTO L_5434  ' flags from L_542B
L_5433: BX = BX - 1
L_5434: BX = BX AND WORD(BP - 6)
L_5437: CompareLeft% = BX: CompareRight% = 0
L_5439: IF CompareLeft% <> CompareRight% THEN GOTO L_543E  ' flags from L_5437
L_543B: GOTO L_5499
L_543E: DI = &H8A68
L_5441: SI = &H87F2
L_5444: N_8A68! = N_87F2!  ' RT3F_7B
L_5447: DI = &H883E
L_544A: BX = SI
L_544C: SI = &H88CA
L_544F: N_883E! = N_88CA!  ' RT3F_7B
L_5452: SWAP BX, SI
L_5454: DI = &H8842
L_5457: N_8842! = N_87F2!  ' RT3F_7B
L_545A: GOSUB L_038B
L_545D: BX = CINT(FAC!)  ' RT3F_77
L_5460: DI = BX
L_5462: DI = DI * (2 ^ 1)
L_5464: DI = DI * (2 ^ 1)
L_5466: DI = DI + &H1850
L_546A: BX = DI
L_546C: DI = &H882A
L_546F: SI = &H88CA
L_5472: N_882A! = N_88CA!  ' RT3F_7B
L_5475: DI = &H882E
L_5478: SI = &H87F2
L_547B: N_882E! = N_87F2!  ' RT3F_7B
L_547E: WORD(BP - 8) = BX
L_5481: GOSUB L_0359
L_5484: DI = &H8B90
L_5487: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B90)  ' RT3F_81
L_548A: DI = WORD(BP - 8)
L_548D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5490: DI = &H87F2
L_5493: SI = &H8906
L_5496: N_87F2! = N_8906!  ' RT3F_7B
L_5499: DI = &H827C
L_549C: SI = &H87F2
L_549F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_54A2: DI = &H87F2
L_54A5: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_54A8: SI = DI
L_54AA: DI = &H8812
L_54AD: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_54B0: IF CompareLeft! > CompareRight! THEN GOTO L_54B5  ' flags from L_54AD
L_54B2: GOTO L_53EC
L_54B5: SI = &H8A68
L_54B8: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_54BB: IF CompareLeft! = CompareRight! THEN GOTO L_54C0  ' flags from L_54B8
L_54BD: GOTO L_54DD
L_54C0: DI = &H88D2
L_54C3: SI = &H82D2
L_54C6: FAC! = N_82D2! * N_88D2!  ' RT3F_8F
L_54C9: BX = &H384
L_54CC: DX = &H1A
L_54CF: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_54D2: BX = 0xFFFF
L_54D5: DX = BX
L_54D7: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_54DA: GOTO L_2408
L_54DD: GOSUB L_14CA
L_54E0: BX = &H10
L_54E3: LocateRow% = BX  ' RT3E_42
L_54E6: BX = &H1D
L_54E9: LOCATE LocateRow%, BX  ' RT3E_44
L_54EC: ' PRINT statement begins
L_54EF: SI = &H8A68
L_54F2: DX = BX
L_54F4: BX = CINT(N_8A68!)  ' RT3F_75
L_54F7: BX = BX * (2 ^ 1)
L_54F9: BX = BX * (2 ^ 1)
L_54FB: BX = BX + &H4288
L_54FF: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5502: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5505: BX = &H11
L_5508: LocateRow% = BX  ' RT3E_42
L_550B: BX = DX
L_550D: LOCATE LocateRow%, BX  ' RT3E_44
L_5510: ' PRINT statement begins
L_5513: BX = &H93A6
L_5516: PRINT S_93A6$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5519: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_551C: GOSUB L_13C5
L_551F: SI = &H827C
L_5522: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_5525: GOTO L_555F
L_5528: DI = &H82D2
L_552B: SI = &H8950
L_552E: FAC! = N_8950! * N_82D2!  ' RT3F_8F
L_5531: DI = &H889E
L_5534: BX = SI
L_5536: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H889E)  ' RT3F_89
L_5539: SI = BX
L_553B: DI = &H8D6A
L_553E: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8D6A, inline=&H80)  ' RT3F_71
L_5542: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_5545: BX = CINT(FAC!)  ' RT3F_77
L_5548: DX = &H8968
L_554B: RT3E_5E(AX=AX, BX=BX, CX=CX, DX=&H8968, SI=SI, DI=DI)  ' RT3E_5E
L_554E: BX = 0xFFFF
L_5551: DX = BX
L_5553: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_5556: DI = &H827C
L_5559: SI = &H8950
L_555C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8950, DI=&H827C)  ' RT3F_7F
L_555F: DI = &H8950
L_5562: N_8950! = FAC!: SI = &H001A  ' RT3F_7D
L_5565: SI = DI
L_5567: DI = &H880A
L_556A: CompareLeft! = N_8950!: CompareRight! = N_880A!  ' RT3F_9F
L_556D: IF CompareLeft! <= CompareRight! THEN GOTO L_5528  ' flags from L_556A
L_556F: BX = 8
L_5572: DX = 7
L_5575: CX = 0
L_5577: AX = CX
L_5579: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_557C: BX = &H5E2E
L_557F: DX = 2
L_5582: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_5585: GOSUB L_13E5
L_5588: DI = &H8954
L_558B: SI = &H48A0
L_558E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A0, DI=&H8954)  ' RT3F_7F
L_5591: DI = &H93B2
L_5594: N_93B2! = FAC!: SI = &H001A  ' RT3F_7D
L_5597: SI = DI
L_5599: CompareLeft! = N_93B2!: CompareRight! = 0  ' RT3F_A7
L_559C: IF CompareLeft! < CompareRight! THEN GOTO L_55A1  ' flags from L_5599
L_559E: GOTO L_55A7
L_55A1: SI = &H93B6
L_55A4: N(DI) = N_93B6!  ' RT3F_7B
L_55A7: DI = &H8286
L_55AA: SI = &H48A0
L_55AD: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A0, DI=&H8286)  ' RT3F_7F
L_55B0: DI = &H93BA
L_55B3: N_93BA! = FAC!: SI = &H001A  ' RT3F_7D
L_55B6: SI = DI
L_55B8: DI = &H8CA2
L_55BB: CompareLeft! = N_93BA!: CompareRight! = N_8CA2!  ' RT3F_9F
L_55BE: IF CompareLeft! > CompareRight! THEN GOTO L_55C3  ' flags from L_55BB
L_55C0: GOTO L_55C8
L_55C3: SWAP DI, SI
L_55C5: N(DI) = N(SI)  ' RT3F_7B
L_55C8: DI = &H8954
L_55CB: SI = &H48A4
L_55CE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A4, DI=&H8954)  ' RT3F_7F
L_55D1: DI = &H93BE
L_55D4: N_93BE! = FAC!: SI = &H001A  ' RT3F_7D
L_55D7: SI = DI
L_55D9: CompareLeft! = N_93BE!: CompareRight! = 0  ' RT3F_A7
L_55DC: IF CompareLeft! < CompareRight! THEN GOTO L_55E1  ' flags from L_55D9
L_55DE: GOTO L_55E7
L_55E1: SI = &H93B6
L_55E4: N(DI) = N_93B6!  ' RT3F_7B
L_55E7: DI = &H8286
L_55EA: SI = &H48A4
L_55ED: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A4, DI=&H8286)  ' RT3F_7F
L_55F0: DI = &H93C2
L_55F3: N_93C2! = FAC!: SI = &H001A  ' RT3F_7D
L_55F6: SI = DI
L_55F8: DI = &H8CA2
L_55FB: CompareLeft! = N_93C2!: CompareRight! = N_8CA2!  ' RT3F_9F
L_55FE: IF CompareLeft! > CompareRight! THEN GOTO L_5603  ' flags from L_55FB
L_5600: GOTO L_5608
L_5603: SWAP DI, SI
L_5605: N(DI) = N(SI)  ' RT3F_7B
L_5608: DI = &H8A68
L_560B: SI = &H87FA
L_560E: N_8A68! = N_87FA!  ' RT3F_7B
L_5611: DI = &H93C6
L_5614: SI = &H93BA
L_5617: N_93C6! = N_93BA!  ' RT3F_7B
L_561A: SI = &H93B2
L_561D: FAC! = N_93B2!: DI = &H001E  ' RT3F_6F
L_5620: GOTO L_56F1
L_5623: ' Alignment NOP
L_5624: DI = &H93CA
L_5627: SI = &H93C2
L_562A: N_93CA! = N_93C2!  ' RT3F_7B
L_562D: SI = &H93BE
L_5630: FAC! = N_93BE!: DI = &H001E  ' RT3F_6F
L_5633: GOTO L_56D5
L_5636: DI = &H8872
L_5639: SI = &H8FEC
L_563C: FAC! = N_8FEC! * N_8872!  ' RT3F_8F
L_563F: DI = &H87F2
L_5642: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H87F2)  ' RT3F_81
L_5645: BX = CINT(FAC!)  ' RT3F_77
L_5648: DI = BX
L_564A: DI = DI * (2 ^ 1)
L_564C: BX = WORD(DI + &H48B0)
L_5650: FAC! = CSNG(BX)  ' RT3F_57
L_5653: DI = &H8B28
L_5656: FAC! = FAC! * N_8B28!  ' RT3F_91
L_5659: BX = &H1A
L_565C: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_565F: DI = &H93CE
L_5662: N_93CE! = FAC!: SI = &H001A  ' RT3F_7D
L_5665: SI = DI
L_5667: DI = &H8856
L_566A: N_8856! = N_93CE!  ' RT3F_7B
L_566D: DI = &H885A
L_5670: SI = &H827C
L_5673: N_885A! = N_827C!  ' RT3F_7B
L_5676: GOSUB L_03C9
L_5679: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_567C: IF (NOT CF AND NOT ZF) THEN GOTO L_5681  ' flags from L_5679
L_567E: GOTO L_568A
L_5681: DI = &H8A68
L_5684: SI = &H827C
L_5687: N_8A68! = N_827C!  ' RT3F_7B
L_568A: SI = &H93CE
L_568D: CompareLeft! = N_93CE!: CompareRight! = 0  ' RT3F_A7
L_5690: BX = 0
L_5693: IF CompareLeft! <= CompareRight! THEN GOTO L_5696  ' flags from L_568D
L_5695: BX = BX - 1
L_5696: DI = &H8856
L_5699: N_8856! = N(SI)  ' RT3F_7B
L_569C: DI = &H885A
L_569F: DX = SI
L_56A1: SI = &H889E
L_56A4: N_885A! = N_889E!  ' RT3F_7B
L_56A7: WORD(BP - 6) = BX
L_56AA: GOSUB L_03C9
L_56AD: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_56B0: BX = 0
L_56B3: IF NOT ZF THEN GOTO L_56B6  ' flags from L_56AD
L_56B5: BX = BX - 1
L_56B6: BX = BX AND WORD(BP - 6)
L_56B9: CompareLeft% = BX: CompareRight% = 0
L_56BB: IF CompareLeft% <> CompareRight% THEN GOTO L_56C0  ' flags from L_56B9
L_56BD: GOTO L_56CC
L_56C0: DI = &H8C82
L_56C3: SI = &H93CE
L_56C6: N_8C82! = N_93CE!  ' RT3F_7B
L_56C9: GOSUB L_1B23
L_56CC: DI = &H827C
L_56CF: SI = &H8FEC
L_56D2: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FEC, DI=&H827C)  ' RT3F_7F
L_56D5: DI = &H8FEC
L_56D8: N_8FEC! = FAC!: SI = &H001A  ' RT3F_7D
L_56DB: SI = DI
L_56DD: DI = &H93CA
L_56E0: CompareLeft! = N_8FEC!: CompareRight! = N_93CA!  ' RT3F_9F
L_56E3: IF CompareLeft! > CompareRight! THEN GOTO L_56E8  ' flags from L_56E0
L_56E5: GOTO L_5636
L_56E8: DI = &H827C
L_56EB: SI = &H87F2
L_56EE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_56F1: DI = &H87F2
L_56F4: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_56F7: SI = DI
L_56F9: DI = &H93C6
L_56FC: CompareLeft! = N_87F2!: CompareRight! = N_93C6!  ' RT3F_9F
L_56FF: IF CompareLeft! > CompareRight! THEN GOTO L_5704  ' flags from L_56FC
L_5701: GOTO L_5624
L_5704: BX = &H14
L_5707: LocateRow% = BX  ' RT3E_42
L_570A: BX = &H1D
L_570D: LOCATE LocateRow%, BX  ' RT3E_44
L_5710: SI = &H8A68
L_5713: RT3F_1D(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8A68, DI=DI)  ' RT3F_1D
L_5716: CompareLeft% = BX: CompareRight% = 0
L_5718: IF CompareLeft% <> CompareRight% THEN GOTO L_571D  ' flags from L_5716
L_571A: GOTO L_572C
L_571D: ' PRINT statement begins
L_5720: BX = &H93D2
L_5723: PRINT S_93D2$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5726: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5729: GOTO L_5738
L_572C: ' PRINT statement begins
L_572F: BX = &H93DE
L_5732: PRINT S_93DE$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5735: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5738: GOSUB L_128E
L_573B: GOSUB L_128E
L_573E: GOSUB L_128E
L_5741: GOTO L_2408
L_5744: RT3D_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_43
L_5747: DI = &H93EA
L_574A: RT3F_99(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H93EA)  ' RT3F_99
L_574D: RT3F_2D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2D
L_5750: DI = &H93EE
L_5753: CompareLeft! = FAC!: CompareRight! = N_93EE!  ' RT3F_A1
L_5756: IF CompareLeft! < CompareRight! THEN GOTO L_575B  ' flags from L_5753
L_5758: GOTO L_575C
L_575B: RETURN
L_575C: SI = &H8DBE
L_575F: CompareLeft! = N_8DBE!: CompareRight! = 0  ' RT3F_A7
L_5762: IF CompareLeft! > CompareRight! THEN GOTO L_5767  ' flags from L_575F
L_5764: GOTO L_576A
L_5767: GOSUB L_5829
L_576A: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_576D: DI = &H93F2
L_5770: CompareLeft! = FAC!: CompareRight! = N_93F2!  ' RT3F_A1
L_5773: BX = 0
L_5776: IF CompareLeft! >= CompareRight! THEN GOTO L_5779  ' flags from L_5770
L_5778: BX = BX - 1
L_5779: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_577C: DI = &H93F6
L_577F: CompareLeft! = FAC!: CompareRight! = N_93F6!  ' RT3F_A1
L_5782: DX = 0
L_5785: IF CompareLeft! <= CompareRight! THEN GOTO L_5788  ' flags from L_577F
L_5787: DX = DX - 1
L_5788: DX = DX AND BX
L_578A: CompareLeft% = DX: CompareRight% = 0
L_578C: IF CompareLeft% <> CompareRight% THEN GOTO L_5791  ' flags from L_578A
L_578E: GOTO L_57F1
L_5791: DI = &H4890
L_5794: SI = &H93FA
L_5797: N_4890! = N_93FA!  ' RT3F_7B
L_579A: BX = SI
L_579C: SI = &H4894
L_579F: DX = SI
L_57A1: CX = BX
L_57A3: BX = CINT(N_4894!)  ' RT3F_75
L_57A6: DI = BX
L_57A8: DI = DI * (2 ^ 1)
L_57AA: DI = DI * (2 ^ 1)
L_57AC: DI = DI + &H1850
L_57B0: SI = CX
L_57B2: N(DI) = N_93FA!  ' RT3F_7B
L_57B5: SI = DX
L_57B7: DI = &H827C
L_57BA: RT3F_7F(AX=AX, BX=BX, CX=&H93FA, DX=&H4894, SI=&H4894, DI=&H827C)  ' RT3F_7F
L_57BD: BX = CINT(FAC!)  ' RT3F_77
L_57C0: DI = BX
L_57C2: DI = DI * (2 ^ 1)
L_57C4: DI = DI * (2 ^ 1)
L_57C6: DI = DI + &H1850
L_57CA: SI = &H87FA
L_57CD: N(DI) = N_87FA!  ' RT3F_7B
L_57D0: SWAP DX, SI
L_57D2: DI = &H8286
L_57D5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H87FA, SI=SI, DI=&H8286)  ' RT3F_7F
L_57D8: BX = CINT(FAC!)  ' RT3F_77
L_57DB: DI = BX
L_57DD: DI = DI * (2 ^ 1)
L_57DF: DI = DI * (2 ^ 1)
L_57E1: DI = DI + &H1850
L_57E5: SI = DX
L_57E7: N(DI) = N(SI)  ' RT3F_7B
L_57EA: DI = &H8DBE
L_57ED: N_8DBE! = N(SI)  ' RT3F_7B
L_57F0: RETURN
L_57F1: RT3D_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_43
L_57F4: DI = &H93EA
L_57F7: N_93EA! = FAC!: SI = &H001A  ' RT3F_7D
L_57FA: DI = &H93FE
L_57FD: SI = &H8DBE
L_5800: CompareLeft! = N_8DBE!: CompareRight! = N_93FE!  ' RT3F_9F
L_5803: AX = 0
L_5806: IF CompareLeft! <= CompareRight! THEN GOTO L_5809  ' flags from L_5800
L_5808: AX = AX - 1
L_5809: BX = &H19
L_580C: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_580E: BX = AX
L_5810: FAC! = CSNG(BX)  ' RT3F_57
L_5813: DI = SI
L_5815: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_81
L_5818: BX = DI
L_581A: DI = &H827C
L_581D: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_5820: DI = BX
L_5822: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5825: GOSUB L_5829
L_5828: RETURN
L_5829: SI = &H8DBE
L_582C: RT3F_AB(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8DBE, DI=DI, inline=&H03)  ' RT3F_AB
L_5830: DI = &H9402
L_5833: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9402)  ' RT3F_81
L_5836: DX = 1
L_5839: CX = 0xFFFF
L_583C: AX = 0
L_583E: BX = &H1A
L_5841: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_5844: BX = &H8792
L_5847: DX = 4
L_584A: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_584D: DX = 0xC0
L_5850: BX = &H1A
L_5853: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_5856: BX = &H8792
L_5859: DX = 4
L_585C: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_585F: RETURN
L_5860: RT3D_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_43
L_5863: DI = &H9406
L_5866: RT3F_99(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9406)  ' RT3F_99
L_5869: RT3F_2D(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2D
L_586C: DI = &H940A
L_586F: CompareLeft! = FAC!: CompareRight! = N_940A!  ' RT3F_A1
L_5872: IF CompareLeft! < CompareRight! THEN GOTO L_5877  ' flags from L_586F
L_5874: GOTO L_5878
L_5877: RETURN
L_5878: SI = &H940E
L_587B: CompareLeft! = N_940E!: CompareRight! = 0  ' RT3F_A7
L_587E: IF CompareLeft! > CompareRight! THEN GOTO L_5883  ' flags from L_587B
L_5880: GOTO L_5886
L_5883: GOSUB L_5945
L_5886: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_5889: DI = &H93F2
L_588C: CompareLeft! = FAC!: CompareRight! = N_93F2!  ' RT3F_A1
L_588F: BX = 0
L_5892: IF CompareLeft! >= CompareRight! THEN GOTO L_5895  ' flags from L_588C
L_5894: BX = BX - 1
L_5895: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_5898: DI = &H93F6
L_589B: CompareLeft! = FAC!: CompareRight! = N_93F6!  ' RT3F_A1
L_589E: DX = 0
L_58A1: IF CompareLeft! <= CompareRight! THEN GOTO L_58A4  ' flags from L_589B
L_58A3: DX = DX - 1
L_58A4: DX = DX AND BX
L_58A6: CompareLeft% = DX: CompareRight% = 0
L_58A8: IF CompareLeft% <> CompareRight% THEN GOTO L_58AD  ' flags from L_58A6
L_58AA: GOTO L_590D
L_58AD: DI = &H4898
L_58B0: SI = &H93FA
L_58B3: N_4898! = N_93FA!  ' RT3F_7B
L_58B6: BX = SI
L_58B8: SI = &H489C
L_58BB: DX = SI
L_58BD: CX = BX
L_58BF: BX = CINT(N_489C!)  ' RT3F_75
L_58C2: DI = BX
L_58C4: DI = DI * (2 ^ 1)
L_58C6: DI = DI * (2 ^ 1)
L_58C8: DI = DI + &H1850
L_58CC: SI = CX
L_58CE: N(DI) = N_93FA!  ' RT3F_7B
L_58D1: SI = DX
L_58D3: DI = &H827C
L_58D6: RT3F_7F(AX=AX, BX=BX, CX=&H93FA, DX=&H489C, SI=&H489C, DI=&H827C)  ' RT3F_7F
L_58D9: BX = CINT(FAC!)  ' RT3F_77
L_58DC: DI = BX
L_58DE: DI = DI * (2 ^ 1)
L_58E0: DI = DI * (2 ^ 1)
L_58E2: DI = DI + &H1850
L_58E6: SI = &H87FA
L_58E9: N(DI) = N_87FA!  ' RT3F_7B
L_58EC: SWAP DX, SI
L_58EE: DI = &H8286
L_58F1: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H87FA, SI=SI, DI=&H8286)  ' RT3F_7F
L_58F4: BX = CINT(FAC!)  ' RT3F_77
L_58F7: DI = BX
L_58F9: DI = DI * (2 ^ 1)
L_58FB: DI = DI * (2 ^ 1)
L_58FD: DI = DI + &H1850

```

### Weapons

```basic
L_5901: SI = DX
L_5903: N(DI) = N(SI)  ' RT3F_7B
L_5906: DI = &H940E
L_5909: N_940E! = N(SI)  ' RT3F_7B
L_590C: RETURN
L_590D: RT3D_43(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_43
L_5910: DI = &H9406
L_5913: N_9406! = FAC!: SI = &H001A  ' RT3F_7D
L_5916: DI = &H93FE
L_5919: SI = &H940E
L_591C: CompareLeft! = N_940E!: CompareRight! = N_93FE!  ' RT3F_9F
L_591F: AX = 0
L_5922: IF CompareLeft! <= CompareRight! THEN GOTO L_5925  ' flags from L_591C
L_5924: AX = AX - 1
L_5925: BX = &H19
L_5928: DX:AX = SIGNED16(AX) * SIGNED16(BX)
L_592A: BX = AX
L_592C: FAC! = CSNG(BX)  ' RT3F_57
L_592F: DI = SI
L_5931: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_81
L_5934: BX = DI
L_5936: DI = &H827C
L_5939: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_593C: DI = BX
L_593E: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5941: GOSUB L_5945
L_5944: RETURN
L_5945: SI = &H940E
L_5948: RT3F_AB(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H940E, DI=DI, inline=&H03)  ' RT3F_AB
L_594C: DI = &H9402
L_594F: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9402)  ' RT3F_81
L_5952: BX = 1
L_5955: CX = 0
L_5957: AX = 0xFFFF
L_595A: DX = &H1A
L_595D: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_5960: BX = &H8782
L_5963: DX = 4
L_5966: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_5969: BX = 0xC1
L_596C: DX = &H1A
L_596F: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_5972: BX = &H8782
L_5975: DX = 4
L_5978: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_597B: RETURN
L_597C: GOSUB L_13C5
L_597F: BX = &H9412
L_5982: DX = &H8BC4
L_5985: S_8BC4$ = S_9412$  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_5988: GOSUB L_10D3
L_598B: GOSUB L_14CA
L_598E: SI = &H8AD2
L_5991: CompareLeft! = N_8AD2!: CompareRight! = 0  ' RT3F_A7
L_5994: IF CompareLeft! = CompareRight! THEN GOTO L_5999  ' flags from L_5991
L_5996: GOTO L_599F
L_5999: GOSUB L_13E5
L_599C: GOTO L_2408
L_599F: GOSUB L_1378
L_59A2: GOSUB L_667D
L_59A5: DI = &H8F00
L_59A8: SI = &H8F04
L_59AB: N_8F00! = N_8F04!  ' RT3F_7B
L_59AE: BX = DI
L_59B0: DI = &H882A
L_59B3: DX = SI
L_59B5: SI = &H8C30
L_59B8: N_882A! = N_8C30!  ' RT3F_7B
L_59BB: DI = &H882E
L_59BE: SI = &H8AD2
L_59C1: N_882E! = N_8AD2!  ' RT3F_7B
L_59C4: GOSUB L_0359
L_59C7: DI = &H9424
L_59CA: N_9424! = FAC!: SI = &H001A  ' RT3F_7D
L_59CD: SI = DI
L_59CF: CompareLeft! = N_9424!: CompareRight! = 0  ' RT3F_A7
L_59D2: IF CompareLeft! > CompareRight! THEN GOTO L_59D7  ' flags from L_59CF
L_59D4: GOTO L_5A41
L_59D7: DI = &H8C18
L_59DA: FAC! = N(SI) * N_8C18!  ' RT3F_8F
L_59DD: DI = &H8F04
L_59E0: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8F04)  ' RT3F_81
L_59E3: DI = &H9428
L_59E6: N_9428! = FAC!: SI = &H001A  ' RT3F_7D
L_59E9: SI = DI
L_59EB: BX = CINT(N_9428!)  ' RT3F_75
L_59EE: SI = BX
L_59F0: SI = SI * (2 ^ 1)
L_59F2: SI = SI * (2 ^ 1)
L_59F4: SI = SI + &H1850
L_59F8: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_59FB: BX = 0
L_59FE: IF CompareLeft! <= CompareRight! THEN GOTO L_5A01  ' flags from L_59F8
L_5A00: BX = BX - 1
L_5A01: SI = DI
L_5A03: DI = &H8906
L_5A06: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8906)  ' RT3F_7F
L_5A09: DX = SI
L_5A0B: CX = BX
L_5A0D: BX = CINT(FAC!)  ' RT3F_77
L_5A10: SI = BX
L_5A12: SI = SI * (2 ^ 1)
L_5A14: SI = SI * (2 ^ 1)
L_5A16: SI = SI + &H1850
L_5A1A: DI = &H8286
L_5A1D: BX = SI
L_5A1F: SI = &H8AD2
L_5A22: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H8286)  ' RT3F_7F
L_5A25: SI = BX
L_5A27: RT3F_A3(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A3
L_5A2A: AX = 0
L_5A2D: IF NOT ZF THEN GOTO L_5A30  ' flags from L_5A27
L_5A2F: AX = AX - 1
L_5A30: AX = AX AND CX
L_5A32: CompareLeft% = AX: CompareRight% = 0
L_5A34: IF CompareLeft% <> CompareRight% THEN GOTO L_5A39  ' flags from L_5A32
L_5A36: GOTO L_5A41
L_5A39: SI = DX
L_5A3B: DI = &H8F00
L_5A3E: N_8F00! = N(SI)  ' RT3F_7B
L_5A41: BX = 6
L_5A44: LocateRow% = BX  ' RT3E_42
L_5A47: BX = 2
L_5A4A: LOCATE LocateRow%, BX  ' RT3E_44
L_5A4D: ' PRINT statement begins
L_5A50: SI = &H8AD2
L_5A53: DX = BX
L_5A55: BX = CINT(N_8AD2!)  ' RT3F_75
L_5A58: BX = BX * (2 ^ 1)
L_5A5A: BX = BX * (2 ^ 1)
L_5A5C: BX = BX + &H4288
L_5A60: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_5A63: BX = &H942C
L_5A66: PRINT S_942C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5A69: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5A6C: BX = 8
L_5A6F: LocateRow% = BX  ' RT3E_42
L_5A72: BX = DX
L_5A74: LOCATE LocateRow%, BX  ' RT3E_44
L_5A77: GOSUB L_5C12
L_5A7A: BX = 0xE
L_5A7D: LocateRow% = BX  ' RT3E_42
L_5A80: BX = 2
L_5A83: LOCATE LocateRow%, BX  ' RT3E_44
L_5A86: ' PRINT statement begins
L_5A89: DX = BX
L_5A8B: BX = &H943A
L_5A8E: PRINT S_943A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5A91: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5A94: BX = 0xF
L_5A97: LocateRow% = BX  ' RT3E_42
L_5A9A: BX = DX
L_5A9C: LOCATE LocateRow%, BX  ' RT3E_44
L_5A9F: ' PRINT statement begins
L_5AA2: BX = &H9454
L_5AA5: PRINT S_9454$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5AA8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5AAB: BX = &H12
L_5AAE: LocateRow% = BX  ' RT3E_42
L_5AB1: DX = BX
L_5AB3: BX = 2
L_5AB6: LOCATE LocateRow%, BX  ' RT3E_44
L_5AB9: ' PRINT statement begins
L_5ABC: CX = BX
L_5ABE: BX = &H17
L_5AC1: RT3F_35(AX=AX, BX=&H0017, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_35
L_5AC4: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5AC7: AX = BX
L_5AC9: BX = &H13
L_5ACC: LocateRow% = BX  ' RT3E_42
L_5ACF: BX = CX
L_5AD1: LOCATE LocateRow%, BX  ' RT3E_44
L_5AD4: ' PRINT statement begins
L_5AD7: SWAP BX, AX
L_5AD8: RT3F_35(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_35
L_5ADB: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5ADE: BX = DX
L_5AE0: LocateRow% = BX  ' RT3E_42
L_5AE3: BX = AX
L_5AE5: LOCATE LocateRow%, BX  ' RT3E_44
L_5AE8: GOSUB L_5C12
L_5AEB: DI = &H8C00
L_5AEE: SI = &H87FA
L_5AF1: N_8C00! = N_87FA!  ' RT3F_7B
L_5AF4: GOSUB L_12E9
L_5AF7: DI = &H8C08
L_5AFA: SI = &H8BF0
L_5AFD: CompareLeft! = N_8BF0!: CompareRight! = N_8C08!  ' RT3F_9F
L_5B00: IF CompareLeft! <> CompareRight! THEN GOTO L_5B05  ' flags from L_5AFD
L_5B02: GOTO L_5B80
L_5B05: DI = &H8C18
L_5B08: SI = &H8F00
L_5B0B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8F00, DI=&H8C18)  ' RT3F_7F
L_5B0E: DI = SI
L_5B10: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5B13: SI = DI
L_5B15: DI = &H92F8
L_5B18: CompareLeft! = N(SI): CompareRight! = N_92F8!  ' RT3F_9F
L_5B1B: IF CompareLeft! > CompareRight! THEN GOTO L_5B20  ' flags from L_5B18
L_5B1D: GOTO L_5B2A
L_5B20: DI = SI
L_5B22: SI = &H8F04
L_5B25: N(DI) = N_8F04!  ' RT3F_7B
L_5B28: GOTO L_5AAB
L_5B2A: SI = &H8F00
L_5B2D: BX = SI
L_5B2F: DX = BX
L_5B31: BX = CINT(N_8F00!)  ' RT3F_75
L_5B34: SI = BX
L_5B36: SI = SI * (2 ^ 1)
L_5B38: SI = SI * (2 ^ 1)
L_5B3A: SI = SI + &H1850
L_5B3E: DI = &H827C
L_5B41: CompareLeft! = N(SI): CompareRight! = N_827C!  ' RT3F_9F
L_5B44: BX = 0
L_5B47: IF CompareLeft! >= CompareRight! THEN GOTO L_5B4A  ' flags from L_5B41
L_5B49: BX = BX - 1
L_5B4A: SI = DX
L_5B4C: DI = &H8906
L_5B4F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8906)  ' RT3F_7F
L_5B52: DX = BX
L_5B54: BX = CINT(FAC!)  ' RT3F_77
L_5B57: SI = BX
L_5B59: SI = SI * (2 ^ 1)
L_5B5B: SI = SI * (2 ^ 1)
L_5B5D: SI = SI + &H1850
L_5B61: DI = &H8286
L_5B64: BX = SI
L_5B66: SI = &H8AD2
L_5B69: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H8286)  ' RT3F_7F
L_5B6C: SI = BX
L_5B6E: RT3F_A3(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A3
L_5B71: CX = 0
L_5B74: IF ZF THEN GOTO L_5B77  ' flags from L_5B6E
L_5B76: CX = CX - 1
L_5B77: CX = CX OR DX
L_5B79: CompareLeft% = CX: CompareRight% = 0
L_5B7B: IF CompareLeft% <> CompareRight% THEN GOTO L_5B05  ' flags from L_5B79
L_5B7D: GOTO L_5AAB
L_5B80: DI = &H883E
L_5B83: SI = &H8C30
L_5B86: N_883E! = N_8C30!  ' RT3F_7B
L_5B89: BX = DI
L_5B8B: DI = &H8842
L_5B8E: DX = SI
L_5B90: SI = &H8AD2
L_5B93: N_8842! = N_8AD2!  ' RT3F_7B
L_5B96: GOSUB L_038B
L_5B99: BX = CINT(FAC!)  ' RT3F_77
L_5B9C: DI = BX
L_5B9E: DI = DI * (2 ^ 1)
L_5BA0: DI = DI * (2 ^ 1)
L_5BA2: DI = DI + &H1850
L_5BA6: BX = DI
L_5BA8: DI = &H9468
L_5BAB: SI = &H8F00
L_5BAE: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8F00, DI=&H9468)  ' RT3F_7F
L_5BB1: DI = &H8C18
L_5BB4: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8C18)  ' RT3F_89
L_5BB7: DX = BX
L_5BB9: BX = &H1A
L_5BBC: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_5BBF: DI = DX
L_5BC1: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_5BC4: DI = &H882A
L_5BC7: SI = &H8C30
L_5BCA: N_882A! = N_8C30!  ' RT3F_7B
L_5BCD: DI = &H882E
L_5BD0: SI = &H8AD2
L_5BD3: N_882E! = N_8AD2!  ' RT3F_7B
L_5BD6: GOSUB L_0359
L_5BD9: DI = &H9424
L_5BDC: CompareLeft! = FAC!: CompareRight! = N_9424!  ' RT3F_A1
L_5BDF: IF CompareLeft! <> CompareRight! THEN GOTO L_5BE4  ' flags from L_5BDC
L_5BE1: GOTO L_5C0C
L_5BE4: DI = &H883E
L_5BE7: SI = &H8872
L_5BEA: N_883E! = N_8872!  ' RT3F_7B
L_5BED: DI = &H8842
L_5BF0: SI = &H8AD2
L_5BF3: N_8842! = N_8AD2!  ' RT3F_7B
L_5BF6: GOSUB L_038B
L_5BF9: BX = CINT(FAC!)  ' RT3F_77
L_5BFC: DI = BX
L_5BFE: DI = DI * (2 ^ 1)
L_5C00: DI = DI * (2 ^ 1)
L_5C02: DI = DI + &H1850
L_5C06: SI = &H88B2
L_5C09: N(DI) = N_88B2!  ' RT3F_7B
L_5C0C: GOSUB L_1378
L_5C0F: GOTO L_597F
L_5C12: DI = &H8F04
L_5C15: SI = &H8F00
L_5C18: CompareLeft! = N_8F00!: CompareRight! = N_8F04!  ' RT3F_9F
L_5C1B: IF CompareLeft! = CompareRight! THEN GOTO L_5C20  ' flags from L_5C18
L_5C1D: GOTO L_5C2D
L_5C20: ' PRINT statement begins
L_5C23: BX = &H946C
L_5C26: PRINT S_946C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5C29: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5C2C: RETURN
L_5C2D: RT3D_25(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_25
L_5C30: BX = BX - 1
L_5C31: FAC! = CSNG(BX)  ' RT3F_57
L_5C34: DI = &H92F0
L_5C37: N_92F0! = FAC!: SI = &H001A  ' RT3F_7D
L_5C3A: DI = &H88B2
L_5C3D: SI = &H8F00
L_5C40: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8F00, DI=&H88B2)  ' RT3F_7F
L_5C43: BX = CINT(FAC!)  ' RT3F_77
L_5C46: SI = BX
L_5C48: SI = SI * (2 ^ 1)
L_5C4A: SI = SI * (2 ^ 1)
L_5C4C: SI = SI + &H1850
L_5C50: DI = &H947C
L_5C53: N_947C! = N(SI)  ' RT3F_7B
L_5C56: SI = DI
L_5C58: CompareLeft! = N_947C!: CompareRight! = 0  ' RT3F_A7
L_5C5B: IF CompareLeft! < CompareRight! THEN GOTO L_5C60  ' flags from L_5C58
L_5C5D: GOTO L_5C69
L_5C60: SI = &H890E
L_5C63: N(DI) = N_890E!  ' RT3F_7B
L_5C66: GOTO L_5C7C
L_5C69: DI = &H8906
L_5C6C: SI = &H947C
L_5C6F: CompareLeft! = N_947C!: CompareRight! = N_8906!  ' RT3F_9F
L_5C72: IF CompareLeft! > CompareRight! THEN GOTO L_5C77  ' flags from L_5C6F
L_5C74: GOTO L_5C7C
L_5C77: SWAP DI, SI
L_5C79: N(DI) = N(SI)  ' RT3F_7B
L_5C7C: SI = &H8F00
L_5C7F: BX = CINT(N_8F00!)  ' RT3F_75
L_5C82: SI = BX
L_5C84: SI = SI * (2 ^ 1)
L_5C86: SI = SI * (2 ^ 1)
L_5C88: SI = SI + &H1850
L_5C8C: DI = &H92FC
L_5C8F: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H92FC)  ' RT3F_7F
L_5C92: BX = CINT(FAC!)  ' RT3F_77
L_5C95: SI = BX
L_5C97: SI = SI * (2 ^ 1)
L_5C99: SI = SI * (2 ^ 1)
L_5C9B: SI = SI + &H1850
L_5C9F: DI = &H9480
L_5CA2: N_9480! = N(SI)  ' RT3F_7B
L_5CA5: SI = DI
L_5CA7: DI = &H8906
L_5CAA: CompareLeft! = N_9480!: CompareRight! = N_8906!  ' RT3F_9F
L_5CAD: IF CompareLeft! > CompareRight! THEN GOTO L_5CB2  ' flags from L_5CAA
L_5CAF: GOTO L_5CB7
L_5CB2: SWAP DI, SI
L_5CB4: N(DI) = N(SI)  ' RT3F_7B
L_5CB7: ' PRINT statement begins
L_5CBA: BX = &H9484
L_5CBD: PRINT S_9484$;  ' RT3F_6A; separator/format variant retained by RT tag
L_5CC0: DI = &H8A6C
L_5CC3: SI = &H947C
L_5CC6: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H947C, DI=&H8A6C)  ' RT3F_7F
L_5CC9: BX = CINT(FAC!)  ' RT3F_77
L_5CCC: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_5CCF: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_5CD2: BX = &H948A
L_5CD5: PRINT S_948A$;  ' RT3F_6A; separator/format variant retained by RT tag
L_5CD8: SI = &H9480
L_5CDB: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H9480, DI=DI)  ' RT3F_7F
L_5CDE: BX = CINT(FAC!)  ' RT3F_77
L_5CE1: RT3D_05(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_05
L_5CE4: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_5CE7: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5CEA: DI = &H88B2
L_5CED: SI = &H8F00
L_5CF0: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8F00, DI=&H88B2)  ' RT3F_7F
L_5CF3: BX = CINT(FAC!)  ' RT3F_77
L_5CF6: SI = BX
L_5CF8: SI = SI * (2 ^ 1)
L_5CFA: SI = SI * (2 ^ 1)
L_5CFC: SI = SI + &H1850

```

### Reload and search

```basic
L_5D00: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5D03: IF CompareLeft! < CompareRight! THEN GOTO L_5D08  ' flags from L_5D00
L_5D05: GOTO L_5D17
L_5D08: ' PRINT statement begins
L_5D0B: BX = &H9306
L_5D0E: PRINT S_9306$;  ' RT3F_6A; separator/format variant retained by RT tag
L_5D11: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5D14: GOTO L_5D23
L_5D17: ' PRINT statement begins
L_5D1A: BX = &H8A70
L_5D1D: PRINT S_8A70$;  ' RT3F_6A; separator/format variant retained by RT tag
L_5D20: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5D23: SI = &H8F00
L_5D26: BX = CINT(N_8F00!)  ' RT3F_75
L_5D29: SI = BX
L_5D2B: SI = SI * (2 ^ 1)
L_5D2D: SI = SI * (2 ^ 1)
L_5D2F: SI = SI + &H1850
L_5D33: DI = &H8B90
L_5D36: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8B90)  ' RT3F_7F
L_5D39: BX = CINT(FAC!)  ' RT3F_77
L_5D3C: BX = BX * (2 ^ 1)
L_5D3E: BX = BX * (2 ^ 1)
L_5D40: BX = BX + &H43F4
L_5D44: DX = &H930C
L_5D47: S_930C$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_5D4A: GOSUB L_673F
L_5D4D: RETURN
L_5D4E: GOSUB L_14CA
L_5D51: BX = &H13
L_5D54: LocateRow% = BX  ' RT3E_42
L_5D57: BX = &H1C
L_5D5A: LOCATE LocateRow%, BX  ' RT3E_44
L_5D5D: ' PRINT statement begins
L_5D60: BX = &H9490
L_5D63: PRINT S_9490$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5D66: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5D69: SI = &H8F08
L_5D6C: FAC! = N_8F08!: DI = &H001E  ' RT3F_6F
L_5D6F: GOTO L_5DCC
L_5D72: SI = &H87F2
L_5D75: BX = SI
L_5D77: DX = BX
L_5D79: BX = CINT(N_87F2!)  ' RT3F_75
L_5D7C: SI = BX
L_5D7E: SI = SI * (2 ^ 1)
L_5D80: SI = SI * (2 ^ 1)
L_5D82: SI = SI + &H1850
L_5D86: DI = &H9424
L_5D89: N_9424! = N(SI)  ' RT3F_7B
L_5D8C: SI = DI
L_5D8E: CompareLeft! = N_9424!: CompareRight! = 0  ' RT3F_A7
L_5D91: BX = 0
L_5D94: IF CompareLeft! <= CompareRight! THEN GOTO L_5D97  ' flags from L_5D8E
L_5D96: BX = BX - 1
L_5D97: SI = DX
L_5D99: DI = &H88B2
L_5D9C: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88B2)  ' RT3F_7F
L_5D9F: DX = BX
L_5DA1: BX = CINT(FAC!)  ' RT3F_77
L_5DA4: SI = BX
L_5DA6: SI = SI * (2 ^ 1)
L_5DA8: SI = SI * (2 ^ 1)
L_5DAA: SI = SI + &H1850
L_5DAE: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_5DB1: BX = 0
L_5DB4: IF CompareLeft! <> CompareRight! THEN GOTO L_5DB7  ' flags from L_5DAE
L_5DB6: BX = BX - 1
L_5DB7: BX = BX AND DX
L_5DB9: CompareLeft% = BX: CompareRight% = 0
L_5DBB: IF CompareLeft% <> CompareRight% THEN GOTO L_5DC0  ' flags from L_5DB9
L_5DBD: GOTO L_5DC3
L_5DC0: GOSUB L_5DDF
L_5DC3: DI = &H8C18
L_5DC6: SI = &H87F2
L_5DC9: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8C18)  ' RT3F_7F
L_5DCC: DI = &H87F2
L_5DCF: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_5DD2: SI = DI
L_5DD4: DI = &H901C
L_5DD7: CompareLeft! = N_87F2!: CompareRight! = N_901C!  ' RT3F_9F
L_5DDA: IF CompareLeft! <= CompareRight! THEN GOTO L_5D72  ' flags from L_5DD7
L_5DDC: GOTO L_2408
L_5DDF: SI = &H932C
L_5DE2: FAC! = N_932C!: DI = &H001E  ' RT3F_6F
L_5DE5: GOTO L_5EDD
L_5DE8: SI = &H8FEC
L_5DEB: BX = SI
L_5DED: DX = BX
L_5DEF: BX = CINT(N_8FEC!)  ' RT3F_75
L_5DF2: SI = BX
L_5DF4: SI = SI * (2 ^ 1)
L_5DF6: SI = SI * (2 ^ 1)
L_5DF8: SI = SI + &H1850
L_5DFC: DI = &H9424
L_5DFF: CompareLeft! = N(SI): CompareRight! = N_9424!  ' RT3F_9F
L_5E02: BX = 0
L_5E05: IF CompareLeft! <> CompareRight! THEN GOTO L_5E08  ' flags from L_5DFF
L_5E07: BX = BX - 1
L_5E08: SWAP DX, SI
L_5E0A: DI = &H8286
L_5E0D: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8286)  ' RT3F_7F
L_5E10: CX = SI
L_5E12: AX = BX
L_5E14: BX = CINT(FAC!)  ' RT3F_77
L_5E17: SI = BX
L_5E19: SI = SI * (2 ^ 1)
L_5E1B: SI = SI * (2 ^ 1)
L_5E1D: SI = SI + &H1850
L_5E21: CompareLeft! = N(SI): CompareRight! = N(DI)  ' RT3F_9F
L_5E24: BX = 0
L_5E27: IF CompareLeft! <= CompareRight! THEN GOTO L_5E2A  ' flags from L_5E21
L_5E29: BX = BX - 1
L_5E2A: BX = BX AND AX
L_5E2C: CompareLeft% = BX: CompareRight% = 0
L_5E2E: IF CompareLeft% <> CompareRight% THEN GOTO L_5E33  ' flags from L_5E2C
L_5E30: GOTO L_5ED4
L_5E33: DI = DX
L_5E35: BX = SI
L_5E37: SI = &H87FA
L_5E3A: N(DI) = N_87FA!  ' RT3F_7B
L_5E3D: SWAP CX, SI
L_5E3F: DI = &H827C
L_5E42: RT3F_7F(AX=AX, BX=BX, CX=&H87FA, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_5E45: DX = SI
L_5E47: AX = BX
L_5E49: BX = CINT(FAC!)  ' RT3F_77
L_5E4C: DI = BX
L_5E4E: DI = DI * (2 ^ 1)
L_5E50: DI = DI * (2 ^ 1)
L_5E52: DI = DI + &H1850
L_5E56: SI = CX
L_5E58: N(DI) = N(SI)  ' RT3F_7B
L_5E5B: DI = AX
L_5E5D: N(DI) = N(SI)  ' RT3F_7B
L_5E60: DI = DX
L_5E62: SI = &H939E
L_5E65: N(DI) = N_939E!  ' RT3F_7B
L_5E68: DI = &H88B2
L_5E6B: SI = &H87F2
L_5E6E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88B2)  ' RT3F_7F
L_5E71: BX = SI
L_5E73: DX = BX
L_5E75: BX = CINT(FAC!)  ' RT3F_77
L_5E78: DI = BX
L_5E7A: DI = DI * (2 ^ 1)
L_5E7C: DI = DI * (2 ^ 1)
L_5E7E: DI = DI + &H1850
L_5E82: SI = DX
L_5E84: BX = DI
L_5E86: DI = &H88E2
L_5E89: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88E2)  ' RT3F_7F
L_5E8C: DX = BX
L_5E8E: BX = CINT(FAC!)  ' RT3F_77
L_5E91: SI = BX
L_5E93: SI = SI * (2 ^ 1)
L_5E95: SI = SI * (2 ^ 1)
L_5E97: SI = SI + &H1850
L_5E9B: DI = DX
L_5E9D: N(DI) = N(SI)  ' RT3F_7B
L_5EA0: DI = &H949E
L_5EA3: SI = &H82D2
L_5EA6: FAC! = N_82D2! * N_949E!  ' RT3F_8F
L_5EA9: BX = &H1A0A
L_5EAC: DX = &H1A
L_5EAF: RT3E_5E(AX=AX, BX=&H1A0A, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_5EB2: BX = 0xFFFF
L_5EB5: DX = BX
L_5EB7: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_5EBA: DI = &H949E
L_5EBD: SI = &H82D2
L_5EC0: FAC! = N_82D2! * N_949E!  ' RT3F_8F
L_5EC3: BX = &H42
L_5EC6: DX = &H1A
L_5EC9: RT3E_5E(AX=AX, BX=&H0042, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_5ECC: BX = 0xFFFF
L_5ECF: DX = BX
L_5ED1: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_5ED4: DI = &H88B2
L_5ED7: SI = &H8FEC
L_5EDA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8FEC, DI=&H88B2)  ' RT3F_7F
L_5EDD: DI = &H8FEC
L_5EE0: N_8FEC! = FAC!: SI = &H001A  ' RT3F_7D
L_5EE3: SI = DI
L_5EE5: DI = &H9330
L_5EE8: CompareLeft! = N_8FEC!: CompareRight! = N_9330!  ' RT3F_9F
L_5EEB: IF CompareLeft! > CompareRight! THEN GOTO L_5EF0  ' flags from L_5EE8
L_5EED: GOTO L_5DE8
L_5EF0: RETURN
L_5EF1: DI = &H8856
L_5EF4: SI = &H8B24
L_5EF7: N_8856! = N_8B24!  ' RT3F_7B
L_5EFA: DI = &H885A
L_5EFD: SI = &H8286
L_5F00: N_885A! = N_8286!  ' RT3F_7B
L_5F03: GOSUB L_03C9
L_5F06: DI = &H8D8A
L_5F09: N_8D8A! = FAC!: SI = &H001A  ' RT3F_7D
L_5F0C: SI = DI
L_5F0E: CompareLeft! = N_8D8A!: CompareRight! = 0  ' RT3F_A7
L_5F11: IF CompareLeft! = CompareRight! THEN GOTO L_5F16  ' flags from L_5F0E
L_5F13: GOTO L_5F67
L_5F16: GOSUB L_14CA
L_5F19: BX = &H12
L_5F1C: LocateRow% = BX  ' RT3E_42
L_5F1F: BX = &H1D
L_5F22: LOCATE LocateRow%, BX  ' RT3E_44
L_5F25: ' PRINT statement begins
L_5F28: DX = BX
L_5F2A: BX = &H94A2
L_5F2D: PRINT S_94A2$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5F30: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5F33: BX = &H13
L_5F36: LocateRow% = BX  ' RT3E_42
L_5F39: BX = DX
L_5F3B: LOCATE LocateRow%, BX  ' RT3E_44
L_5F3E: ' PRINT statement begins
L_5F41: BX = &H94AE
L_5F44: PRINT S_94AE$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5F47: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5F4A: BX = &H14
L_5F4D: LocateRow% = BX  ' RT3E_42
L_5F50: BX = DX
L_5F52: LOCATE LocateRow%, BX  ' RT3E_44
L_5F55: ' PRINT statement begins
L_5F58: BX = &H94BA
L_5F5B: PRINT S_94BA$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5F5E: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5F61: GOSUB L_128E
L_5F64: GOTO L_2408
L_5F67: GOTO L_6BF2
L_5F6A: GOSUB L_14CA
L_5F6D: BX = 0xF
L_5F70: LocateRow% = BX  ' RT3E_42
L_5F73: BX = &H1A
L_5F76: LOCATE LocateRow%, BX  ' RT3E_44
L_5F79: ' PRINT statement begins
L_5F7C: DX = BX
L_5F7E: BX = &H94C6
L_5F81: PRINT S_94C6$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5F84: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5F87: BX = &H10
L_5F8A: LocateRow% = BX  ' RT3E_42
L_5F8D: BX = &H1C
L_5F90: LOCATE LocateRow%, BX  ' RT3E_44
L_5F93: ' PRINT statement begins
L_5F96: CX = BX
L_5F98: BX = &H94D4
L_5F9B: PRINT S_94D4$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5F9E: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5FA1: BX = &H11
L_5FA4: LocateRow% = BX  ' RT3E_42
L_5FA7: BX = CX
L_5FA9: LOCATE LocateRow%, BX  ' RT3E_44
L_5FAC: ' PRINT statement begins
L_5FAF: BX = &H94DE
L_5FB2: PRINT S_94DE$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5FB5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5FB8: BX = &H13
L_5FBB: LocateRow% = BX  ' RT3E_42
L_5FBE: BX = DX
L_5FC0: LOCATE LocateRow%, BX  ' RT3E_44
L_5FC3: ' PRINT statement begins
L_5FC6: BX = &H94EC
L_5FC9: PRINT S_94EC$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5FCC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5FCF: BX = &H14
L_5FD2: LocateRow% = BX  ' RT3E_42
L_5FD5: BX = CX
L_5FD7: LOCATE LocateRow%, BX  ' RT3E_44
L_5FDA: ' PRINT statement begins
L_5FDD: BX = &H94FA
L_5FE0: PRINT S_94FA$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5FE3: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5FE6: BX = &H15
L_5FE9: LocateRow% = BX  ' RT3E_42
L_5FEC: BX = CX
L_5FEE: LOCATE LocateRow%, BX  ' RT3E_44
L_5FF1: ' PRINT statement begins
L_5FF4: BX = &H9508
L_5FF7: PRINT S_9508$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_5FFA: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_5FFD: DI = &H8BFC
L_6000: SI = &H827C
L_6003: N_8BFC! = N_827C!  ' RT3F_7B
L_6006: DI = &H8C00
L_6009: SI = &H8286
L_600C: N_8C00! = N_8286!  ' RT3F_7B
L_600F: GOSUB L_12E9
L_6012: SI = &H8BF0
L_6015: CompareLeft! = N_8BF0!: CompareRight! = 0  ' RT3F_A7
L_6018: IF CompareLeft! >= CompareRight! THEN GOTO L_601D  ' flags from L_6015
L_601A: GOTO L_2408
L_601D: DI = &H827C
L_6020: SI = &H8BF0
L_6023: CompareLeft! = N_8BF0!: CompareRight! = N_827C!  ' RT3F_9F
L_6026: IF CompareLeft! <> CompareRight! THEN GOTO L_602B  ' flags from L_6023
L_6028: GOTO L_6075
L_602B: DI = &H8C3E
L_602E: SI = &H885E
L_6031: N_8C3E! = N_885E!  ' RT3F_7B
L_6034: GOSUB L_1707
L_6037: SI = &H8A68
L_603A: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_603D: IF CompareLeft! <> CompareRight! THEN GOTO L_6042  ' flags from L_603A
L_603F: GOTO L_6057
L_6042: DI = &H4890
L_6045: SI = &H827C
L_6048: N_4890! = N_827C!  ' RT3F_7B
L_604B: DI = &H4894
L_604E: SI = &H8C42
L_6051: N_4894! = N_8C42!  ' RT3F_7B
L_6054: GOTO L_5F6A
L_6057: BX = &H17
L_605A: LocateRow% = BX  ' RT3E_42
L_605D: BX = &H1A
L_6060: LOCATE LocateRow%, BX  ' RT3E_44
L_6063: ' PRINT statement begins
L_6066: BX = &H9516
L_6069: PRINT S_9516$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_606C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_606F: GOSUB L_128E
L_6072: GOTO L_5F6A
L_6075: DI = &H8C3E
L_6078: SI = &H88E2
L_607B: N_8C3E! = N_88E2!  ' RT3F_7B
L_607E: GOSUB L_1707
L_6081: DI = &H827C
L_6084: SI = &H8A68
L_6087: CompareLeft! = N_8A68!: CompareRight! = N_827C!  ' RT3F_9F
L_608A: IF CompareLeft! <> CompareRight! THEN GOTO L_608F  ' flags from L_6087
L_608C: GOTO L_60A3
L_608F: DI = &H8C3E
L_6092: SI = &H88B2
L_6095: N_8C3E! = N_88B2!  ' RT3F_7B
L_6098: GOSUB L_1707
L_609B: SI = &H8A68
L_609E: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_60A1: IF CompareLeft! = CompareRight! THEN GOTO L_6057  ' flags from L_609E
L_60A3: DI = &H8954
L_60A6: SI = &H8C3E
L_60A9: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8C3E, DI=&H8954)  ' RT3F_7F
L_60AC: DI = &H4898
L_60AF: N_4898! = FAC!: SI = &H001A  ' RT3F_7D
L_60B2: DI = &H489C
L_60B5: SI = &H8C42
L_60B8: N_489C! = N_8C42!  ' RT3F_7B
L_60BB: GOTO L_5F6A
L_60BE: SI = &H4890
L_60C1: RT3F_1D(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H4890, DI=DI)  ' RT3F_1D
L_60C4: CompareLeft% = BX: CompareRight% = 0
L_60C6: IF CompareLeft% <> CompareRight% THEN GOTO L_60CB  ' flags from L_60C4
L_60C8: GOTO L_60CE
L_60CB: GOSUB L_5744
L_60CE: SI = &H8C0C
L_60D1: CompareLeft! = N_8C0C!: CompareRight! = 0  ' RT3F_A7
L_60D4: IF CompareLeft! = CompareRight! THEN GOTO L_60D9  ' flags from L_60D1
L_60D6: GOTO L_6113
L_60D9: DI = &H889E
L_60DC: SI = &H48A4
L_60DF: FAC! = N_48A4! * N_889E!  ' RT3F_8F
L_60E2: BX = DI
L_60E4: DI = &H88D2
L_60E7: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88D2)  ' RT3F_81
L_60EA: DI = BX
L_60EC: SI = &H48A0
L_60EF: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A0, DI=DI, inline=&H80)  ' RT3F_71
L_60F3: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_60F6: DI = &H88AE
L_60F9: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88AE)  ' RT3F_81
L_60FC: CX = 0xFFFF
L_60FF: AX = CX

```

### Damage and environment

```basic
L_6101: BX = &H1A
L_6104: DX = &H8968
L_6107: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_610A: BX = &H85A2
L_610D: DX = 4
L_6110: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_6113: SI = &H4898
L_6116: RT3F_1D(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H4898, DI=DI)  ' RT3F_1D
L_6119: CompareLeft% = BX: CompareRight% = 0
L_611B: IF CompareLeft% <> CompareRight% THEN GOTO L_6120  ' flags from L_6119
L_611D: GOTO L_6123
L_6120: GOSUB L_5860
L_6123: SI = &H8C0C
L_6126: CompareLeft! = N_8C0C!: CompareRight! = 0  ' RT3F_A7
L_6129: IF CompareLeft! = CompareRight! THEN GOTO L_612E  ' flags from L_6126
L_612B: GOTO L_6168
L_612E: DI = &H889E
L_6131: SI = &H48A4
L_6134: FAC! = N_48A4! * N_889E!  ' RT3F_8F
L_6137: BX = DI
L_6139: DI = &H88D2
L_613C: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88D2)  ' RT3F_81
L_613F: DI = BX
L_6141: SI = &H48A0
L_6144: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H48A0, DI=DI, inline=&H80)  ' RT3F_71
L_6148: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_614B: DI = &H88AE
L_614E: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88AE)  ' RT3F_81
L_6151: CX = 0xFFFF
L_6154: AX = CX
L_6156: BX = &H1A
L_6159: DX = &H8968
L_615C: PutX% = BX: PutY% = DX: PutXFlag% = CX: PutYFlag% = AX  ' RT3E_89; M coordinate argument capture
L_615F: BX = &H85A2
L_6162: DX = 4
L_6165: PUT (PutX%, PutY%), MEMORY(BX), MODE(DX)  ' RT3E_58; M, raw coordinate flags and mode must be honored
L_6168: RETURN
L_6169: DI = &H8E08
L_616C: SI = &H8B90
L_616F: N_8E08! = N_8B90!  ' RT3F_7B
L_6172: DI = &H8E04
L_6175: SI = &H827C
L_6178: N_8E04! = N_827C!  ' RT3F_7B
L_617B: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_617E: GOTO L_6203
L_6181: ' Alignment NOP
L_6182: DI = &H882A
L_6185: SI = &H888E
L_6188: N_882A! = N_888E!  ' RT3F_7B
L_618B: BX = DI
L_618D: DI = &H882E
L_6190: SI = &H8AD2
L_6193: N_882E! = N_8AD2!  ' RT3F_7B
L_6196: GOSUB L_0359
L_6199: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_619C: BX = 0
L_619F: IF (CF OR ZF) THEN GOTO L_61A2  ' flags from L_6199
L_61A1: BX = BX - 1
L_61A2: DI = &H882A
L_61A5: SI = &H8DD2
L_61A8: N_882A! = N_8DD2!  ' RT3F_7B
L_61AB: DX = DI
L_61AD: DI = &H882E
L_61B0: CX = SI
L_61B2: SI = &H8AD2
L_61B5: N_882E! = N_8AD2!  ' RT3F_7B
L_61B8: WORD(BP - 6) = BX
L_61BB: GOSUB L_0359
L_61BE: DI = &H8E08
L_61C1: CompareLeft! = FAC!: CompareRight! = N_8E08!  ' RT3F_A1
L_61C4: BX = 0
L_61C7: IF CompareLeft! <= CompareRight! THEN GOTO L_61CA  ' flags from L_61C1
L_61C9: BX = BX - 1
L_61CA: BX = BX AND WORD(BP - 6)
L_61CD: CompareLeft% = BX: CompareRight% = 0
L_61CF: IF CompareLeft% <> CompareRight% THEN GOTO L_61D4  ' flags from L_61CD
L_61D1: GOTO L_61FA
L_61D4: BX = DI
L_61D6: DI = &H882A
L_61D9: SI = &H8DD2
L_61DC: N_882A! = N_8DD2!  ' RT3F_7B
L_61DF: DI = &H882E
L_61E2: SI = &H8AD2
L_61E5: N_882E! = N_8AD2!  ' RT3F_7B
L_61E8: GOSUB L_0359
L_61EB: DI = &H8E08
L_61EE: N_8E08! = FAC!: SI = &H001A  ' RT3F_7D
L_61F1: DI = &H8E04
L_61F4: SI = &H8AD2
L_61F7: N_8E04! = N_8AD2!  ' RT3F_7B
L_61FA: DI = &H827C
L_61FD: SI = &H8AD2
L_6200: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H827C)  ' RT3F_7F
L_6203: DI = &H8AD2
L_6206: N_8AD2! = FAC!: SI = &H001A  ' RT3F_7D
L_6209: SI = DI
L_620B: DI = &H8812
L_620E: CompareLeft! = N_8AD2!: CompareRight! = N_8812!  ' RT3F_9F
L_6211: IF CompareLeft! > CompareRight! THEN GOTO L_6216  ' flags from L_620E
L_6213: GOTO L_6182
L_6216: RETURN
L_6217: DI = &H882A
L_621A: SI = &H87FE
L_621D: N_882A! = N_87FE!  ' RT3F_7B
L_6220: DI = &H882E
L_6223: SI = &H8AD2
L_6226: N_882E! = N_8AD2!  ' RT3F_7B
L_6229: GOSUB L_0359
L_622C: DI = &H8AD6
L_622F: RT3F_99(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8AD6)  ' RT3F_99
L_6232: DI = &H9528
L_6235: N_9528! = FAC!: SI = &H001A  ' RT3F_7D
L_6238: SI = DI
L_623A: DI = &H827C
L_623D: CompareLeft! = N_9528!: CompareRight! = N_827C!  ' RT3F_9F
L_6240: IF CompareLeft! < CompareRight! THEN GOTO L_6245  ' flags from L_623D
L_6242: GOTO L_624D
L_6245: DI = SI
L_6247: SI = &H87FA
L_624A: N(DI) = N_87FA!  ' RT3F_7B
L_624D: DI = &H883E
L_6250: SI = &H87FE
L_6253: N_883E! = N_87FE!  ' RT3F_7B
L_6256: DI = &H8842
L_6259: SI = &H8AD2
L_625C: N_8842! = N_8AD2!  ' RT3F_7B
L_625F: GOSUB L_038B
L_6262: BX = CINT(FAC!)  ' RT3F_77
L_6265: DI = BX
L_6267: DI = DI * (2 ^ 1)
L_6269: DI = DI * (2 ^ 1)
L_626B: DI = DI + &H1850
L_626F: SI = &H9528
L_6272: N(DI) = N_9528!  ' RT3F_7B
L_6275: CompareLeft! = N_9528!: CompareRight! = 0  ' RT3F_A7
L_6278: BX = 0
L_627B: IF CompareLeft! <> CompareRight! THEN GOTO L_627E  ' flags from L_6275
L_627D: BX = BX - 1
L_627E: DI = &H882A
L_6281: SI = &H888E
L_6284: N_882A! = N_888E!  ' RT3F_7B
L_6287: DI = &H882E
L_628A: SI = &H8AD2
L_628D: N_882E! = N_8AD2!  ' RT3F_7B
L_6290: WORD(BP - 6) = BX
L_6293: GOSUB L_0359
L_6296: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_6299: BX = 0
L_629C: IF ZF THEN GOTO L_629F  ' flags from L_6296
L_629E: BX = BX - 1
L_629F: BX = BX AND WORD(BP - 6)
L_62A2: CompareLeft% = BX: CompareRight% = 0
L_62A4: IF CompareLeft% <> CompareRight% THEN GOTO L_62A9  ' flags from L_62A2
L_62A6: GOTO L_62FA
L_62A9: ' PRINT statement begins
L_62AC: BX = &H952C
L_62AF: PRINT S_952C$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_62B2: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_62B5: DI = &H890A
L_62B8: SI = &H82D2
L_62BB: FAC! = N_82D2! * N_890A!  ' RT3F_8F
L_62BE: BX = &H384
L_62C1: DX = &H1A
L_62C4: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_62C7: BX = 0xFFFF
L_62CA: DX = BX
L_62CC: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_62CF: DI = &H883E
L_62D2: SI = &H888E
L_62D5: N_883E! = N_888E!  ' RT3F_7B
L_62D8: DI = &H8842
L_62DB: SI = &H8AD2
L_62DE: N_8842! = N_8AD2!  ' RT3F_7B
L_62E1: GOSUB L_038B
L_62E4: BX = CINT(FAC!)  ' RT3F_77
L_62E7: DI = BX
L_62E9: DI = DI * (2 ^ 1)
L_62EB: DI = DI * (2 ^ 1)
L_62ED: DI = DI + &H1850
L_62F1: SI = &H8892
L_62F4: N(DI) = N_8892!  ' RT3F_7B
L_62F7: GOTO L_6312
L_62FA: ' PRINT statement begins
L_62FD: BX = &H9538
L_6300: PRINT S_9538$;  ' RT3F_6A; separator/format variant retained by RT tag
L_6303: BX = &H8AD6
L_6306: PRINT N_8AD6!;  ' RT3F_67; M ledger
L_6309: BX = &H9542
L_630C: PRINT S_9542$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_630F: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6312: DI = &H8A68
L_6315: SI = &H87FA
L_6318: N_8A68! = N_87FA!  ' RT3F_7B
L_631B: SI = &H827C
L_631E: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_6321: GOTO L_634E
L_6324: DI = &H882A
L_6327: SI = &H888E
L_632A: N_882A! = N_888E!  ' RT3F_7B
L_632D: DI = &H882E
L_6330: SI = &H87F2
L_6333: N_882E! = N_87F2!  ' RT3F_7B
L_6336: GOSUB L_0359
L_6339: RT3F_31(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_31
L_633C: DI = &H8A68
L_633F: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8A68)  ' RT3F_81
L_6342: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6345: DI = &H827C
L_6348: SI = &H87F2
L_634B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_634E: DI = &H87F2
L_6351: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_6354: SI = DI
L_6356: DI = &H8812
L_6359: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_635C: IF CompareLeft! <= CompareRight! THEN GOTO L_6324  ' flags from L_6359
L_635E: SI = &H8A68
L_6361: CompareLeft! = N_8A68!: CompareRight! = 0  ' RT3F_A7
L_6364: IF CompareLeft! <> CompareRight! THEN GOTO L_6369  ' flags from L_6361
L_6366: GOTO L_636A
L_6369: RETURN
L_636A: GOSUB L_1378
L_636D: BX = 0xD
L_6370: LocateRow% = BX  ' RT3E_42
L_6373: BX = 5
L_6376: LOCATE LocateRow%, BX  ' RT3E_44
L_6379: ' PRINT statement begins
L_637C: BX = &H954A
L_637F: PRINT S_954A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6382: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6385: GOTO L_6385
L_6387: BX = &H48B0
L_638A: FAC! = CSNG(BX)  ' RT3F_57
L_638D: BX = &H955E
L_6390: AX = &H8274
L_6393: RT3F_55(AX=&H8274, BX=&H955E, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_6396: SI = &H88D6
L_6399: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88D6, DI=DI, inline=&H80)  ' RT3F_71
L_639D: RT3F_AF(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_AF
L_63A0: DX = BX
L_63A2: BX = &H1A
L_63A5: RT3D_11(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_11
L_63A8: AX = DX
L_63AA: RT3F_55(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_63AD: AX = BX
L_63AF: BX = &H9564
L_63B2: RT3F_55(AX=AX, BX=&H9564, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_63B5: CX = &H157E
L_63B8: DX = &H8968
L_63BB: RT3E_1B(AX=AX, BX=BX, CX=&H157E, DX=&H8968, SI=SI, DI=DI)  ' RT3E_1B
L_63BE: GOSUB L_13C5
L_63C1: BX = &H5E2E
L_63C4: FAC! = CSNG(BX)  ' RT3F_57
L_63C7: BX = &H956C
L_63CA: AX = &H8274
L_63CD: RT3F_55(AX=&H8274, BX=&H956C, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_63D0: SI = &H88D6
L_63D3: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88D6, DI=DI, inline=&H80)  ' RT3F_71
L_63D7: RT3F_AF(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_AF
L_63DA: DX = BX
L_63DC: BX = &H1A
L_63DF: RT3D_11(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_11
L_63E2: AX = DX
L_63E4: RT3F_55(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_63E7: AX = BX
L_63E9: BX = &H9564
L_63EC: RT3F_55(AX=AX, BX=&H9564, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_63EF: CX = &H21FC
L_63F2: DX = &H8968
L_63F5: RT3E_1B(AX=AX, BX=BX, CX=&H21FC, DX=&H8968, SI=SI, DI=DI)  ' RT3E_1B
L_63F8: RETURN
L_63F9: DI = &H4890
L_63FC: SI = &H93B6
L_63FF: N_4890! = N_93B6!  ' RT3F_7B

```

### Maps and encounters

```basic
L_6402: DI = &H4898
L_6405: N_4898! = N_93B6!  ' RT3F_7B
L_6408: BX = &H48B0
L_640B: FAC! = CSNG(BX)  ' RT3F_57
L_640E: BX = &H955E
L_6411: AX = &H8274
L_6414: RT3F_55(AX=&H8274, BX=&H955E, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_6417: SI = &H88D6
L_641A: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88D6, DI=DI, inline=&H80)  ' RT3F_71
L_641E: RT3F_AF(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_AF
L_6421: DX = BX
L_6423: BX = &H1A
L_6426: RT3D_11(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_11
L_6429: AX = DX
L_642B: RT3F_55(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_642E: AX = BX
L_6430: BX = &H9564
L_6433: RT3F_55(AX=AX, BX=&H9564, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_6436: DX = &H8968
L_6439: BLOAD S(BX), N(DX)  ' RT3E_1A; M data-lane BLOAD; N(&H001A)=FAC!
L_643C: BX = &H5E2E
L_643F: FAC! = CSNG(BX)  ' RT3F_57
L_6442: BX = &H9576
L_6445: AX = &H8274
L_6448: RT3F_55(AX=&H8274, BX=&H9576, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_644B: SI = &H88D6
L_644E: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88D6, DI=DI, inline=&H80)  ' RT3F_71
L_6452: RT3F_AF(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_AF
L_6455: DX = BX
L_6457: BX = &H1A
L_645A: RT3D_11(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_11
L_645D: AX = DX
L_645F: RT3F_55(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_6462: AX = BX
L_6464: BX = &H9564
L_6467: RT3F_55(AX=AX, BX=&H9564, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_646A: DX = &H8968
L_646D: BLOAD S(BX), N(DX)  ' RT3E_1A; M data-lane BLOAD; N(&H001A)=FAC!
L_6470: GOSUB L_13E5
L_6473: BX = 0
L_6475: RT3E_20(AX=AX, BX=0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_20
L_6478: DX = BX
L_647A: BX = &H9580
L_647D: AX = &H8274
L_6480: RT3F_55(AX=&H8274, BX=&H9580, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_6483: SI = &H88D6
L_6486: RT3F_AF(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88D6, DI=DI)  ' RT3F_AF
L_6489: CX = BX
L_648B: BX = &H1A
L_648E: RT3D_11(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_11
L_6491: AX = CX
L_6493: RT3F_55(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_6496: SWAP BX, DX
L_6498: CX = BX
L_649A: BX = 1
L_649D: RT3E_1E(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_1E
L_64A0: DI = &H87F2
L_64A3: SI = &H93B6
L_64A6: N_87F2! = N_93B6!  ' RT3F_7B
L_64A9: BX = 1
L_64AC: RT3F_B6(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_B6
L_64AF: SI = &H87F2
L_64B2: BX = CINT(N_87F2!)  ' RT3F_75
L_64B5: BX = BX * (2 ^ 1)
L_64B7: BX = BX * (2 ^ 1)
L_64B9: BX = BX + &H8030
L_64BD: RT3F_5A(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=DI)  ' RT3F_5A
L_64C0: BX = 1
L_64C3: RT3D_2F(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_2F
L_64C6: CompareLeft% = BX: CompareRight% = 0
L_64C8: IF CompareLeft% <> CompareRight% THEN GOTO L_64CD  ' flags from L_64C6
L_64CA: GOTO L_64D4
L_64CD: BX = 1
L_64D0: RT3E_21(AX=AX, BX=1, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_21
L_64D3: RETURN
L_64D4: DI = &H827C
L_64D7: SI = &H87F2
L_64DA: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_64DD: DI = SI
L_64DF: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_64E2: GOTO L_64A9
L_64E4: GOSUB L_13C5
L_64E7: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_64EA: DI = &H8832
L_64ED: FAC! = FAC! * N_8832!  ' RT3F_91
L_64F0: DI = &H8C56
L_64F3: SI = &H4898
L_64F6: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H4898, DI=&H8C56, inline=&H80)  ' RT3F_71
L_64FA: FAC! = N(SI) * N(DI)  ' RT3F_8F
L_64FD: SI = &H8E70
L_6500: BX = DI
L_6502: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8E70, DI=DI)  ' RT3F_9B
L_6505: DI = &H8856
L_6508: SI = &H8B24
L_650B: N_8856! = N_8B24!  ' RT3F_7B
L_650E: DI = &H885A
L_6511: SI = &H88E2
L_6514: N_885A! = N_88E2!  ' RT3F_7B
L_6517: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88E2, DI=&H885A, inline=&H81)  ' RT3F_71
L_651B: GOSUB L_03C9
L_651E: DI = &H8C56
L_6521: FAC! = FAC! * N_8C56!  ' RT3F_91
L_6524: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H81)  ' RT3F_85
L_6528: RT3F_A5(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H80)  ' RT3F_A5
L_652C: BX = 0
L_652F: IF NOT CF THEN GOTO L_6532  ' flags from L_6528
L_6531: BX = BX - 1
L_6532: CompareLeft% = BX: CompareRight% = 0
L_6534: IF CompareLeft% >= CompareRight% THEN GOTO L_6538  ' flags from L_6532
L_6536: BX = -BX
L_6538: BX = BX * (2 ^ 1)
L_653A: FAC! = CSNG(BX)  ' RT3F_57
L_653D: RT3F_71(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H82)  ' RT3F_71
L_6541: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_6544: DI = &H958C
L_6547: FAC! = FAC! * N_958C!  ' RT3F_91
L_654A: BX = &H1A
L_654D: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_6550: RT3F_85(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inline=&H82)  ' RT3F_85
L_6554: DI = &H9588
L_6557: N_9588! = FAC!: SI = &H001A  ' RT3F_7D
L_655A: SI = DI
L_655C: DI = &H88B2
L_655F: CompareLeft! = N_9588!: CompareRight! = N_88B2!  ' RT3F_9F
L_6562: IF CompareLeft! = CompareRight! THEN GOTO L_6567  ' flags from L_655F
L_6564: GOTO L_656F
L_6567: DI = SI
L_6569: SI = &H890E
L_656C: N(DI) = N_890E!  ' RT3F_7B
L_656F: DI = &H3B24
L_6572: SI = &H9588
L_6575: N_3B24! = N_9588!  ' RT3F_7B
L_6578: GOSUB L_14CA
L_657B: BX = &H12
L_657E: LocateRow% = BX  ' RT3E_42
L_6581: BX = &H1A
L_6584: LOCATE LocateRow%, BX  ' RT3E_44
L_6587: SI = &H9588
L_658A: CompareLeft! = N_9588!: CompareRight! = 0  ' RT3F_A7
L_658D: IF CompareLeft! = CompareRight! THEN GOTO L_6592  ' flags from L_658A
L_658F: GOTO L_65BA
L_6592: ' PRINT statement begins
L_6595: DX = BX
L_6597: BX = &H9590
L_659A: PRINT S_9590$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_659D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_65A0: BX = &H13
L_65A3: LocateRow% = BX  ' RT3E_42
L_65A6: BX = DX
L_65A8: LOCATE LocateRow%, BX  ' RT3E_44
L_65AB: ' PRINT statement begins
L_65AE: BX = &H95A2
L_65B1: PRINT S_95A2$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_65B4: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_65B7: GOTO L_6613
L_65BA: DI = &H827C
L_65BD: SI = &H9588
L_65C0: CompareLeft! = N_9588!: CompareRight! = N_827C!  ' RT3F_9F
L_65C3: IF CompareLeft! = CompareRight! THEN GOTO L_65C8  ' flags from L_65C0
L_65C5: GOTO L_65EF
L_65C8: ' PRINT statement begins
L_65CB: BX = &H95B2
L_65CE: PRINT S_95B2$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_65D1: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_65D4: BX = &H13
L_65D7: LocateRow% = BX  ' RT3E_42
L_65DA: BX = &H1A
L_65DD: LOCATE LocateRow%, BX  ' RT3E_44
L_65E0: ' PRINT statement begins
L_65E3: BX = &H95C2
L_65E6: PRINT S_95C2$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_65E9: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_65EC: GOTO L_6613
L_65EF: ' PRINT statement begins
L_65F2: BX = &H95CE
L_65F5: PRINT S_95CE$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_65F8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_65FB: BX = &H13
L_65FE: LocateRow% = BX  ' RT3E_42
L_6601: BX = &H1A
L_6604: LOCATE LocateRow%, BX  ' RT3E_44
L_6607: ' PRINT statement begins
L_660A: BX = &H95DA
L_660D: PRINT S_95DA$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6610: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6613: DI = &H3B8C
L_6616: SI = &H827C
L_6619: N_3B8C! = N_827C!  ' RT3F_7B
L_661C: DI = &H8856
L_661F: SI = &H8B24
L_6622: N_8856! = N_8B24!  ' RT3F_7B
L_6625: DI = &H885A
L_6628: SI = &H88E2
L_662B: N_885A! = N_88E2!  ' RT3F_7B
L_662E: GOSUB L_03C9
L_6631: DI = &H3BA0
L_6634: N_3BA0! = FAC!: SI = &H001A  ' RT3F_7D
L_6637: DI = &H3AE8
L_663A: SI = &H8D86
L_663D: N_3AE8! = N_8D86!  ' RT3F_7B
L_6640: DI = &H3B20
L_6643: SI = &H885E
L_6646: N_3B20! = N_885E!  ' RT3F_7B
L_6649: GOSUB L_4F07
L_664C: BX = &H95EA
L_664F: AX = &H8274
L_6652: RT3F_55(AX=&H8274, BX=&H95EA, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_55
L_6655: CHAIN S(BX)  ' RT3E_0E; M data-lane filename evidence
L_6658: BX = &H18
L_665B: LocateRow% = BX  ' RT3E_42
L_665E: BX = 6
L_6661: LOCATE LocateRow%, BX  ' RT3E_44
L_6664: ' PRINT statement begins
L_6667: BX = &H95FA
L_666A: PRINT S_95FA$;  ' RT3F_6A; separator/format variant retained by RT tag
L_666D: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6670: DI = &H8C00
L_6673: SI = &H87FA
L_6676: N_8C00! = N_87FA!  ' RT3F_7B
L_6679: GOSUB L_12E9
L_667C: RETURN
L_667D: SI = &H960C
L_6680: FAC! = N_960C!: DI = &H001E  ' RT3F_6F
L_6683: GOTO L_66A8
L_6686: SI = &H87F2
L_6689: BX = SI
L_668B: DX = BX
L_668D: BX = CINT(N_87F2!)  ' RT3F_75
L_6690: DI = BX
L_6692: DI = DI * (2 ^ 1)
L_6694: DI = DI * (2 ^ 1)
L_6696: DI = DI + &H1850
L_669A: SI = &H9610
L_669D: N(DI) = N_9610!  ' RT3F_7B
L_66A0: SI = DX
L_66A2: DI = &H827C
L_66A5: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_66A8: DI = &H87F2
L_66AB: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_66AE: SI = DI
L_66B0: DI = &H9614
L_66B3: CompareLeft! = N_87F2!: CompareRight! = N_9614!  ' RT3F_9F
L_66B6: IF CompareLeft! <= CompareRight! THEN GOTO L_6686  ' flags from L_66B3
L_66B8: SI = &H932C
L_66BB: FAC! = N_932C!: DI = &H001E  ' RT3F_6F
L_66BE: GOTO L_672E
L_66C1: ' Alignment NOP
L_66C2: DI = &H8286
L_66C5: SI = &H87F2
L_66C8: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H8286)  ' RT3F_7F
L_66CB: BX = SI
L_66CD: DX = BX
L_66CF: BX = CINT(FAC!)  ' RT3F_77
L_66D2: SI = BX
L_66D4: SI = SI * (2 ^ 1)
L_66D6: SI = SI * (2 ^ 1)
L_66D8: SI = SI + &H1850
L_66DC: BX = SI
L_66DE: SI = &H8AD2
L_66E1: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=DI)  ' RT3F_7F
L_66E4: SI = BX
L_66E6: RT3F_A3(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A3
L_66E9: IF ZF THEN GOTO L_66EE  ' flags from L_66E6
L_66EB: GOTO L_6725
L_66EE: SI = DX
L_66F0: BX = CINT(N(SI))  ' RT3F_75
L_66F3: SI = BX
L_66F5: SI = SI * (2 ^ 1)
L_66F7: SI = SI * (2 ^ 1)
L_66F9: SI = SI + &H1850
L_66FD: DI = &H92FC
L_6700: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H92FC)  ' RT3F_7F
L_6703: DI = &H8FDC
L_6706: N_8FDC! = FAC!: SI = &H001A  ' RT3F_7D
L_6709: SI = DI
L_670B: BX = CINT(N_8FDC!)  ' RT3F_75
L_670E: DI = BX
L_6710: DI = DI * (2 ^ 1)
L_6712: DI = DI * (2 ^ 1)
L_6714: DI = DI + &H1850
L_6718: SI = DI
L_671A: DI = &H827C
L_671D: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_6720: DI = SI
L_6722: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6725: DI = &H88B2
L_6728: SI = &H87F2
L_672B: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H88B2)  ' RT3F_7F
L_672E: DI = &H87F2
L_6731: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_6734: SI = DI
L_6736: DI = &H9330
L_6739: CompareLeft! = N_87F2!: CompareRight! = N_9330!  ' RT3F_9F
L_673C: IF CompareLeft! <= CompareRight! THEN GOTO L_66C2  ' flags from L_6739
L_673E: RETURN
L_673F: DI = &H827C
L_6742: SI = &H92F0
L_6745: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H92F0, DI=&H827C)  ' RT3F_7F
L_6748: SWAP SI, DI
L_674A: BX = SI
L_674C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_674F: CX = BX
L_6751: BX = &H930C
L_6754: DX = &H8A70
L_6757: AX = BX
L_6759: RT3D_09(AX=&H930C, BX=&H930C, CX=CX, DX=&H8A70, SI=&H001A, DI=DI)  ' RT3D_09
L_675C: FAC! = CSNG(BX)  ' RT3F_57
L_675F: DI = &H9618
L_6762: N_9618! = FAC!: SI = &H001A  ' RT3F_7D
L_6765: SWAP CX, DI
L_6767: SI = CX
L_6769: RT3F_7F(AX=AX, BX=BX, CX=&H9618, DX=DX, SI=&H9618, DI=DI)  ' RT3F_7F
L_676C: DI = &H961C
L_676F: N_961C! = FAC!: SI = &H001A  ' RT3F_7D
L_6772: SI = CX
L_6774: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_6777: BX = 0
L_677A: IF CompareLeft! <> CompareRight! THEN GOTO L_677D  ' flags from L_6774
L_677C: BX = BX - 1
L_677D: DI = &H88EE
L_6780: CompareLeft! = N(SI): CompareRight! = N_88EE!  ' RT3F_9F
L_6783: DX = 0
L_6786: IF CompareLeft! <= CompareRight! THEN GOTO L_6789  ' flags from L_6780
L_6788: DX = DX - 1
L_6789: DX = DX OR BX
L_678B: BX = AX
L_678D: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_6790: CompareLeft% = BX: CompareRight% = &H12
L_6793: CX = 0
L_6796: IF CompareLeft% >= CompareRight% THEN GOTO L_6799  ' flags from L_6790
L_6798: CX = CX - 1
L_6799: CX = CX OR DX
L_679B: CompareLeft% = CX: CompareRight% = 0
L_679D: IF CompareLeft% <> CompareRight% THEN GOTO L_67A2  ' flags from L_679B
L_679F: GOTO L_67B8
L_67A2: BX = DI
L_67A4: DI = &H9620
L_67A7: SI = &H88E6
L_67AA: N_9620! = N_88E6!  ' RT3F_7B
L_67AD: SI = BX
L_67AF: DI = &H8D7A
L_67B2: N_8D7A! = N(SI)  ' RT3F_7B
L_67B5: GOTO L_681C
L_67B8: SI = &H961C
L_67BB: BX = SI
L_67BD: DX = BX
L_67BF: BX = CINT(N_961C!)  ' RT3F_75
L_67C2: AX = DX
L_67C4: DX = &H930C
L_67C7: CX = &H8A70
L_67CA: RT3D_08(AX=&H961C, BX=BX, CX=&H8A70, DX=&H930C, SI=&H961C, DI=DI)  ' RT3D_08
L_67CD: FAC! = CSNG(BX)  ' RT3F_57
L_67D0: DI = &H9618
L_67D3: N_9618! = FAC!: SI = &H001A  ' RT3F_7D
L_67D6: SI = DI
L_67D8: CompareLeft! = N_9618!: CompareRight! = 0  ' RT3F_A7
L_67DB: BX = 0
L_67DE: IF CompareLeft! <= CompareRight! THEN GOTO L_67E1  ' flags from L_67D8
L_67E0: BX = BX - 1
L_67E1: DI = &H8DD2
L_67E4: CompareLeft! = N(SI): CompareRight! = N_8DD2!  ' RT3F_9F
L_67E7: DX = 0
L_67EA: IF CompareLeft! >= CompareRight! THEN GOTO L_67ED  ' flags from L_67E4
L_67EC: DX = DX - 1
L_67ED: DX = DX AND BX
L_67EF: CompareLeft% = DX: CompareRight% = 0
L_67F1: IF CompareLeft% <> CompareRight% THEN GOTO L_67F6  ' flags from L_67EF
L_67F3: GOTO L_6803
L_67F6: DI = &H827C
L_67F9: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_67FC: DI = AX
L_67FE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D

```

### Delay and interaction input

```basic
L_6801: GOTO L_67B8
L_6803: DI = &H8954
L_6806: SI = &H961C
L_6809: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H961C, DI=&H8954)  ' RT3F_7F
L_680C: DI = &H9620
L_680F: BX = SI
L_6811: N_9620! = FAC!: SI = &H001A  ' RT3F_7D
L_6814: SI = BX
L_6816: DI = &H8D7A
L_6819: N_8D7A! = N(SI)  ' RT3F_7B
L_681C: SI = &H92F0
L_681F: BX = SI
L_6821: DX = BX
L_6823: BX = CINT(N_92F0!)  ' RT3F_75
L_6826: LocateRow% = BX  ' RT3E_42
L_6829: BX = 8
L_682C: LOCATE LocateRow%, BX  ' RT3E_44
L_682F: ' PRINT statement begins
L_6832: SI = &H9620
L_6835: CX = SI
L_6837: AX = BX
L_6839: BX = CINT(N_9620!)  ' RT3F_75
L_683C: SWAP BX, DX
L_683E: BX = &H930C
L_6841: RT3D_0B(AX=AX, BX=&H930C, CX=&H9620, DX=DX, SI=&H9620, DI=DI)  ' RT3D_0B
L_6844: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6847: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_684A: BX = &H930C
L_684D: DX = BX
L_684F: RT3F_BA(AX=AX, BX=&H930C, CX=CX, DX=&H930C, SI=SI, DI=DI)  ' RT3F_BA
L_6852: FAC! = CSNG(BX)  ' RT3F_57
L_6855: DI = CX
L_6857: CompareLeft! = FAC!: CompareRight! = N(DI)  ' RT3F_A1
L_685A: IF CompareLeft! > CompareRight! THEN GOTO L_685F  ' flags from L_6857
L_685C: GOTO L_6891
L_685F: DI = &H827C
L_6862: SI = &H92F0
L_6865: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H92F0, DI=&H827C)  ' RT3F_7F
L_6868: DI = SI
L_686A: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_686D: SI = DI
L_686F: BX = CINT(N(SI))  ' RT3F_75
L_6872: LocateRow% = BX  ' RT3E_42
L_6875: BX = AX
L_6877: LOCATE LocateRow%, BX  ' RT3E_44
L_687A: ' PRINT statement begins
L_687D: SI = &H8D7A
L_6880: BX = CINT(N_8D7A!)  ' RT3F_75
L_6883: SWAP BX, DX
L_6885: CX = &H11
L_6888: RT3D_0A(AX=AX, BX=BX, CX=&H0011, DX=DX, SI=&H8D7A, DI=DI)  ' RT3D_0A
L_688B: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_688E: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6891: RETURN
L_6892: GOSUB L_14CA
L_6895: BX = &H10
L_6898: LocateRow% = BX  ' RT3E_42
L_689B: BX = &H1A
L_689E: LOCATE LocateRow%, BX  ' RT3E_44
L_68A1: ' PRINT statement begins
L_68A4: DX = BX
L_68A6: BX = &H9624
L_68A9: PRINT S_9624$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_68AC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_68AF: BX = &H11
L_68B2: LocateRow% = BX  ' RT3E_42
L_68B5: BX = DX
L_68B7: LOCATE LocateRow%, BX  ' RT3E_44
L_68BA: ' PRINT statement begins
L_68BD: BX = &H9630
L_68C0: PRINT S_9630$;  ' RT3F_6A; separator/format variant retained by RT tag
L_68C3: BX = &H19A8
L_68C6: RT3F_6B(AX=AX, BX=&H19A8, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_68C9: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_68CC: BX = &H13
L_68CF: LocateRow% = BX  ' RT3E_42
L_68D2: BX = DX
L_68D4: LOCATE LocateRow%, BX  ' RT3E_44
L_68D7: ' PRINT statement begins
L_68DA: BX = &H963A
L_68DD: PRINT S_963A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_68E0: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_68E3: BX = &H14
L_68E6: LocateRow% = BX  ' RT3E_42
L_68E9: BX = DX
L_68EB: LOCATE LocateRow%, BX  ' RT3E_44
L_68EE: ' PRINT statement begins
L_68F1: BX = &H9646
L_68F4: PRINT S_9646$;  ' RT3F_6A; separator/format variant retained by RT tag
L_68F7: BX = &H19B0
L_68FA: RT3F_6B(AX=AX, BX=&H19B0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_6B
L_68FD: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6900: BX = &H16
L_6903: LocateRow% = BX  ' RT3E_42
L_6906: BX = DX
L_6908: LOCATE LocateRow%, BX  ' RT3E_44
L_690B: ' PRINT statement begins
L_690E: BX = &H9650
L_6911: PRINT S_9650$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6914: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6917: BX = &H17
L_691A: LocateRow% = BX  ' RT3E_42
L_691D: BX = DX
L_691F: LOCATE LocateRow%, BX  ' RT3E_44
L_6922: ' PRINT statement begins
L_6925: BX = &H965E
L_6928: PRINT S_965E$;  ' RT3F_6A; separator/format variant retained by RT tag
L_692B: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_692E: GOSUB L_1574
L_6931: CompareLeft% = WORD(&H8C3C): CompareRight% = 1
L_6936: IF CompareLeft% < CompareRight% THEN GOTO L_693B  ' flags from L_6931
L_6938: GOTO L_6941
L_693B: WORD(&H8C3C) = 1
L_6941: CompareLeft% = WORD(&H8C3C): CompareRight% = &H270F
L_6947: IF CompareLeft% > CompareRight% THEN GOTO L_694C  ' flags from L_6941
L_6949: GOTO L_6952
L_694C: WORD(&H8C3C) = &H270F
L_6952: BX = WORD(&H8C3C)
L_6956: FAC! = CSNG(BX)  ' RT3F_57
L_6959: DI = &H19B0
L_695C: N_19B0! = FAC!: SI = &H001A  ' RT3F_7D
L_695F: GOTO L_2408
L_6962: DI = &H827C
L_6965: SI = &H966C
L_6968: CompareLeft! = N_966C!: CompareRight! = N_827C!  ' RT3F_9F
L_696B: IF CompareLeft! < CompareRight! THEN GOTO L_6970  ' flags from L_6968
L_696D: GOTO L_697B
L_6970: DI = SI
L_6972: SI = &H880A
L_6975: N(DI) = N_880A!  ' RT3F_7B
L_6978: GOTO L_698E
L_697B: DI = &H8B88
L_697E: SI = &H966C
L_6981: CompareLeft! = N_966C!: CompareRight! = N_8B88!  ' RT3F_9F
L_6984: IF CompareLeft! > CompareRight! THEN GOTO L_6989  ' flags from L_6981
L_6986: GOTO L_698E
L_6989: SWAP DI, SI
L_698B: N(DI) = N(SI)  ' RT3F_7B
L_698E: BX = &H11
L_6991: LocateRow% = BX  ' RT3E_42
L_6994: BX = 2
L_6997: LOCATE LocateRow%, BX  ' RT3E_44
L_699A: ' PRINT statement begins
L_699D: DX = BX
L_699F: BX = &H9670
L_69A2: PRINT S_9670$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_69A5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_69A8: BX = &H12
L_69AB: LocateRow% = BX  ' RT3E_42
L_69AE: BX = DX
L_69B0: LOCATE LocateRow%, BX  ' RT3E_44
L_69B3: ' PRINT statement begins
L_69B6: BX = &H968A
L_69B9: PRINT S_968A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_69BC: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_69BF: BX = &H14
L_69C2: LocateRow% = BX  ' RT3E_42
L_69C5: BX = 2
L_69C8: LOCATE LocateRow%, BX  ' RT3E_44
L_69CB: ' PRINT statement begins
L_69CE: BX = &H8BBE
L_69D1: PRINT S_8BBE$;  ' RT3F_6A; separator/format variant retained by RT tag
L_69D4: SI = &H966C
L_69D7: BX = CINT(N_966C!)  ' RT3F_75
L_69DA: BX = BX * (2 ^ 1)
L_69DC: BX = BX * (2 ^ 1)
L_69DE: BX = BX + &H8B2C
L_69E2: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_69E5: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_69E8: ' PRINT statement begins
L_69EB: BX = 0
L_69ED: RT3D_21(AX=AX, BX=0, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_21
L_69F0: BX = BX - &H19
L_69F3: BX = -BX
L_69F5: RT3F_35(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_35
L_69F8: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_69FB: GOSUB L_1405
L_69FE: DI = &H8872
L_6A01: SI = &H8BF0
L_6A04: CompareLeft! = N_8BF0!: CompareRight! = N_8872!  ' RT3F_9F
L_6A07: IF CompareLeft! <> CompareRight! THEN GOTO L_6A0C  ' flags from L_6A04
L_6A09: GOTO L_6A9E
L_6A0C: DI = &H8286
L_6A0F: SI = &H8BF0
L_6A12: CompareLeft! = N_8BF0!: CompareRight! = N_8286!  ' RT3F_9F
L_6A15: BX = 0
L_6A18: IF CompareLeft! <> CompareRight! THEN GOTO L_6A1B  ' flags from L_6A12
L_6A1A: BX = BX - 1
L_6A1B: DI = &H88D2
L_6A1E: CompareLeft! = N(SI): CompareRight! = N_88D2!  ' RT3F_9F
L_6A21: DX = 0
L_6A24: IF CompareLeft! <> CompareRight! THEN GOTO L_6A27  ' flags from L_6A1E
L_6A26: DX = DX - 1
L_6A27: DX = DX OR BX
L_6A29: CompareLeft% = DX: CompareRight% = 0
L_6A2B: IF CompareLeft% <> CompareRight% THEN GOTO L_6A30  ' flags from L_6A29
L_6A2D: GOTO L_6A54
L_6A30: DI = &H827C
L_6A33: SI = &H966C
L_6A36: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H966C, DI=&H827C)  ' RT3F_7F
L_6A39: SWAP SI, DI
L_6A3B: BX = SI
L_6A3D: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6A40: SI = DI
L_6A42: DI = &H8B88
L_6A45: CompareLeft! = N(SI): CompareRight! = N_8B88!  ' RT3F_9F
L_6A48: IF CompareLeft! > CompareRight! THEN GOTO L_6A4D  ' flags from L_6A45
L_6A4A: GOTO L_6A54
L_6A4D: DI = SI
L_6A4F: SWAP BX, SI
L_6A51: N(DI) = N(SI)  ' RT3F_7B
L_6A54: DI = &H889E
L_6A57: SI = &H8BF0
L_6A5A: CompareLeft! = N_8BF0!: CompareRight! = N_889E!  ' RT3F_9F
L_6A5D: BX = 0
L_6A60: IF CompareLeft! <> CompareRight! THEN GOTO L_6A63  ' flags from L_6A5A
L_6A62: BX = BX - 1
L_6A63: DI = &H880A
L_6A66: CompareLeft! = N(SI): CompareRight! = N_880A!  ' RT3F_9F
L_6A69: DX = 0
L_6A6C: IF CompareLeft! <> CompareRight! THEN GOTO L_6A6F  ' flags from L_6A66
L_6A6E: DX = DX - 1
L_6A6F: DX = DX OR BX
L_6A71: CompareLeft% = DX: CompareRight% = 0
L_6A73: IF CompareLeft% <> CompareRight% THEN GOTO L_6A78  ' flags from L_6A71
L_6A75: GOTO L_6A9B
L_6A78: DI = &H8B90
L_6A7B: SI = &H966C
L_6A7E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H966C, DI=&H8B90)  ' RT3F_7F
L_6A81: DI = SI
L_6A83: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6A86: SI = DI
L_6A88: DI = &H827C
L_6A8B: CompareLeft! = N(SI): CompareRight! = N_827C!  ' RT3F_9F
L_6A8E: IF CompareLeft! < CompareRight! THEN GOTO L_6A93  ' flags from L_6A8B
L_6A90: GOTO L_6A9B
L_6A93: DI = SI
L_6A95: SI = &H8B88
L_6A98: N(DI) = N_8B88!  ' RT3F_7B
L_6A9B: GOTO L_69BF
L_6A9E: DI = &H8B88
L_6AA1: SI = &H966C
L_6AA4: CompareLeft! = N_966C!: CompareRight! = N_8B88!  ' RT3F_9F
L_6AA7: IF CompareLeft! <> CompareRight! THEN GOTO L_6AAC  ' flags from L_6AA4
L_6AA9: GOTO L_6ACD
L_6AAC: BX = 8
L_6AAF: DX = &H70
L_6AB2: CX = 0
L_6AB4: AX = CX
L_6AB6: RT3E_84(AX=0, BX=8, CX=0, DX=&H0070, SI=SI, DI=DI)  ' RT3E_84
L_6AB9: BX = 0xBF
L_6ABC: DX = BX
L_6ABE: RT3E_85(AX=AX, BX=&H00BF, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_6AC1: BX = 0
L_6AC3: DX = 1
L_6AC6: CX = 0xFFFF
L_6AC9: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_6ACC: RETURN
L_6ACD: BX = &H16
L_6AD0: LocateRow% = BX  ' RT3E_42
L_6AD3: BX = 2
L_6AD6: LOCATE LocateRow%, BX  ' RT3E_44
L_6AD9: ' PRINT statement begins
L_6ADC: DX = BX
L_6ADE: BX = &H96A6
L_6AE1: PRINT S_96A6$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6AE4: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6AE7: BX = &H17
L_6AEA: LocateRow% = BX  ' RT3E_42
L_6AED: BX = DX
L_6AEF: LOCATE LocateRow%, BX  ' RT3E_44
L_6AF2: ' PRINT statement begins
L_6AF5: BX = &H96BE
L_6AF8: PRINT S_96BE$;  ' RT3F_6A; separator/format variant retained by RT tag
L_6AFB: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6AFE: DI = &H8C1C
L_6B01: SI = &H880A
L_6B04: N_8C1C! = N_880A!  ' RT3F_7B
L_6B07: GOSUB L_157D
L_6B0A: BX = &H8802
L_6B0D: DX = 3
L_6B10: RT3D_0B(AX=AX, BX=&H8802, CX=CX, DX=3, SI=SI, DI=DI)  ' RT3D_0B
L_6B13: DX = &H96C6
L_6B16: S_96C6$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_6B19: DI = &H96CA
L_6B1C: SI = &H8B90
L_6B1F: N_96CA! = N_8B90!  ' RT3F_7B
L_6B22: SI = &H8832
L_6B25: FAC! = N_8832!: DI = &H001E  ' RT3F_6F
L_6B28: GOTO L_6B68
L_6B2B: ' Alignment NOP
L_6B2C: SI = &H87F2
L_6B2F: BX = SI
L_6B31: DX = BX
L_6B33: BX = CINT(N_87F2!)  ' RT3F_75
L_6B36: BX = BX * (2 ^ 1)
L_6B38: BX = BX * (2 ^ 1)
L_6B3A: BX = BX + &H8030
L_6B3E: AX = &H96C6
L_6B41: CompareLeft$ = S_96C6$: CompareRight$ = S(BX)  ' RT3F_62; H string compare from 9E1F..9E49
L_6B44: IF CompareLeft$ = CompareRight$ THEN GOTO L_6B49  ' flags from L_6B41
L_6B46: GOTO L_6B5F
L_6B49: SI = DX
L_6B4B: DI = &H8832
L_6B4E: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8832)  ' RT3F_7F
L_6B51: DI = &H966C
L_6B54: N_966C! = FAC!: SI = &H001A  ' RT3F_7D
L_6B57: DI = DX
L_6B59: SI = &H96CE
L_6B5C: N(DI) = N_96CE!  ' RT3F_7B
L_6B5F: DI = &H96CA
L_6B62: SI = &H87F2
L_6B65: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H96CA)  ' RT3F_7F
L_6B68: DI = &H87F2
L_6B6B: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_6B6E: SI = &H96CA
L_6B71: CompareLeft! = N_96CA!: CompareRight! = 0  ' RT3F_A7
L_6B74: IF CompareLeft! < CompareRight! THEN GOTO L_6B79  ' flags from L_6B71
L_6B76: GOTO L_6B83
L_6B79: SI = DI
L_6B7B: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_6B7E: IF CompareLeft! >= CompareRight! THEN GOTO L_6B2C  ' flags from L_6B7B
L_6B80: GOTO L_6B8B
L_6B83: SI = &H87F2
L_6B86: CompareLeft! = N_87F2!: CompareRight! = 0  ' RT3F_A7
L_6B89: IF CompareLeft! <= CompareRight! THEN GOTO L_6B2C  ' flags from L_6B86
L_6B8B: BX = 8
L_6B8E: DX = 0xA8
L_6B91: CX = 0
L_6B93: AX = CX
L_6B95: RT3E_84(AX=0, BX=8, CX=0, DX=&H00A8, SI=SI, DI=DI)  ' RT3E_84
L_6B98: BX = 0xBF
L_6B9B: DX = BX
L_6B9D: RT3E_85(AX=AX, BX=&H00BF, CX=CX, DX=&H00BF, SI=SI, DI=DI)  ' RT3E_85
L_6BA0: BX = 0
L_6BA2: DX = 1
L_6BA5: CX = 0xFFFF
L_6BA8: RT3E_86(AX=AX, BX=0, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_6BAB: DI = &H96D2
L_6BAE: SI = &H87F2
L_6BB1: CompareLeft! = N_87F2!: CompareRight! = N_96D2!  ' RT3F_9F
L_6BB4: IF CompareLeft! >= CompareRight! THEN GOTO L_6BB9  ' flags from L_6BB1
L_6BB6: GOTO L_6BF1
L_6BB9: DI = &H88D2
L_6BBC: SI = &H82D2
L_6BBF: FAC! = N_82D2! * N_88D2!  ' RT3F_8F
L_6BC2: BX = &H384
L_6BC5: DX = &H1A
L_6BC8: RT3E_5E(AX=AX, BX=&H0384, CX=CX, DX=&H001A, SI=SI, DI=DI)  ' RT3E_5E
L_6BCB: BX = 0xFFFF
L_6BCE: DX = BX
L_6BD0: RT3E_5F(AX=AX, BX=&HFFFF, CX=CX, DX=&HFFFF, SI=SI, DI=DI)  ' RT3E_5F
L_6BD3: BX = 0xF
L_6BD6: LocateRow% = BX  ' RT3E_42
L_6BD9: BX = 2
L_6BDC: LOCATE LocateRow%, BX  ' RT3E_44
L_6BDF: GOSUB L_6AAC
L_6BE2: ' PRINT statement begins
L_6BE5: BX = &H96D6
L_6BE8: PRINT S_96D6$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6BEB: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6BEE: GOTO L_6962
L_6BF1: RETURN
L_6BF2: GOSUB L_14CA
L_6BF5: GOSUB L_13C5
L_6BF8: SI = &H8D8A
L_6BFB: BX = SI
L_6BFD: DX = BX
L_6BFF: BX = CINT(N_8D8A!)  ' RT3F_75

```

### Interaction dispatch

```basic
L_6C02: DI = BX
L_6C04: DI = DI * (2 ^ 1)
L_6C06: BX = WORD(DI + &H48B0)
L_6C0A: FAC! = CSNG(BX)  ' RT3F_57
L_6C0D: DI = &H96EE
L_6C10: N_96EE! = FAC!: SI = &H001A  ' RT3F_7D
L_6C13: SI = DX
L_6C15: BX = DI
L_6C17: DI = &H827C
L_6C1A: RT3F_7F(AX=AX, BX=&H96EE, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_7F
L_6C1D: CX = BX
L_6C1F: BX = CINT(FAC!)  ' RT3F_77
L_6C22: DI = BX
L_6C24: DI = DI * (2 ^ 1)
L_6C26: BX = WORD(DI + &H48B0)
L_6C2A: FAC! = CSNG(BX)  ' RT3F_57
L_6C2D: DI = &H96F2
L_6C30: N_96F2! = FAC!: SI = &H001A  ' RT3F_7D
L_6C33: SI = DX
L_6C35: DI = &H8286
L_6C38: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8286)  ' RT3F_7F
L_6C3B: BX = CINT(FAC!)  ' RT3F_77
L_6C3E: DI = BX
L_6C40: DI = DI * (2 ^ 1)
L_6C42: BX = WORD(DI + &H48B0)
L_6C46: FAC! = CSNG(BX)  ' RT3F_57
L_6C49: DI = &H96F6
L_6C4C: N_96F6! = FAC!: SI = &H001A  ' RT3F_7D
L_6C4F: SI = DX
L_6C51: DI = &H88B2
L_6C54: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H88B2)  ' RT3F_7F
L_6C57: BX = CINT(FAC!)  ' RT3F_77
L_6C5A: DI = BX
L_6C5C: DI = DI * (2 ^ 1)
L_6C5E: BX = WORD(DI + &H48B0)
L_6C62: FAC! = CSNG(BX)  ' RT3F_57
L_6C65: DI = &H96FA
L_6C68: N_96FA! = FAC!: SI = &H001A  ' RT3F_7D
L_6C6B: SI = CX
L_6C6D: CompareLeft! = N(SI): CompareRight! = 0  ' RT3F_A7
L_6C70: IF CompareLeft! < CompareRight! THEN GOTO L_6C75  ' flags from L_6C6D
L_6C72: GOTO L_6CC6
L_6C75: RT3F_2B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_2B
L_6C78: BX = CINT(FAC!)  ' RT3F_77
L_6C7B: DI = BX
L_6C7D: DI = DI * (2 ^ 1)
L_6C7F: BX = WORD(DI - &H7516)
L_6C83: BX = BX - 1
L_6C84: FAC! = CSNG(BX)  ' RT3F_57
L_6C87: DI = DX
L_6C89: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_81
L_6C8C: DI = &H96FE
L_6C8F: N_96FE! = FAC!: SI = &H001A  ' RT3F_7D
L_6C92: SI = DX
L_6C94: FAC! = N(SI): DI = &H001E  ' RT3F_6F
L_6C97: GOTO L_6CB6
L_6C9A: SI = &H87F2
L_6C9D: BX = SI
L_6C9F: DX = BX
L_6CA1: BX = CINT(N_87F2!)  ' RT3F_75
L_6CA4: DI = BX
L_6CA6: DI = DI * (2 ^ 1)
L_6CA8: WORD(DI + &H48B0) = 0
L_6CAE: SI = DX
L_6CB0: DI = &H827C
L_6CB3: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=&H87F2, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_6CB6: DI = &H87F2
L_6CB9: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_6CBC: SI = DI
L_6CBE: DI = &H96FE
L_6CC1: CompareLeft! = N_87F2!: CompareRight! = N_96FE!  ' RT3F_9F
L_6CC4: IF CompareLeft! <= CompareRight! THEN GOTO L_6C9A  ' flags from L_6CC1
L_6CC6: SI = &H96EE
L_6CC9: RT3F_2B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H96EE, DI=DI)  ' RT3F_2B
L_6CCC: DI = SI
L_6CCE: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6CD1: SI = DI
L_6CD3: BX = CINT(N(SI))  ' RT3F_75
L_6CD6: DI = BX
L_6CD8: DI = DI * (2 ^ 1)
L_6CDA: BX = WORD(DI - &H7516)
L_6CDE: FAC! = CSNG(BX)  ' RT3F_57
L_6CE1: DI = &H8D8A
L_6CE4: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8D8A)  ' RT3F_81
L_6CE7: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6CEA: DI = &H827C
L_6CED: SI = &H96EE
L_6CF0: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H96EE, DI=&H827C)  ' RT3F_7F
L_6CF3: BX = CINT(FAC!)  ' RT3F_77
L_6CF6: RT3F_5E(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI, inlineTable=[L_6BF8, L_6D30, L_6D59, L_6E46, L_6E5F, L_6E74, L_6E8D, L_6E9C, L_6F2E, L_6F5A, L_6F60, L_6F87, L_6FAE, L_6FD5, L_6FEF, L_6FFB, L_701B, L_7042, L_7069, L_7097, L_70B1, L_70C6, L_70EC, L_70F2, L_70F5, L_71A0, L_71B5])  ' RT3F_5E
L_6D30: DI = &H827C
L_6D33: SI = &H87AE
L_6D36: CompareLeft! = N_87AE!: CompareRight! = N_827C!  ' RT3F_9F
L_6D39: IF CompareLeft! = CompareRight! THEN GOTO L_6D3E  ' flags from L_6D36
L_6D3B: GOTO L_6D44
L_6D3E: RT3E_2B(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3E_2B
L_6D41: GOTO L_70EC
L_6D44: DI = &H8D86
L_6D47: SI = &H96F2
L_6D4A: N_8D86! = N_96F2!  ' RT3F_7B
L_6D4D: DI = &H9588
L_6D50: SI = &H87FA
L_6D53: N_9588! = N_87FA!  ' RT3F_7B
L_6D56: GOSUB L_656F
L_6D59: GOSUB L_1378
L_6D5C: SI = &H96F2
L_6D5F: BX = CINT(N_96F2!)  ' RT3F_75
L_6D62: BX = BX * (2 ^ 1)
L_6D64: BX = BX * (2 ^ 1)
L_6D66: BX = BX + &H8030
L_6D6A: DX = &H8802
L_6D6D: S_8802$ = S(BX)  ' RT3F_61; M corrected direction, runtime 9DC4..9DD0
L_6D70: BX = DX
L_6D72: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_BA
L_6D75: BX = BX + &H16
L_6D78: FAC! = CSNG(BX)  ' RT3F_57
L_6D7B: DI = &H9368
L_6D7E: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H9368)  ' RT3F_89
L_6D81: BX = &H1A
L_6D84: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_6D87: SI = &H88D2
L_6D8A: RT3F_9B(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H88D2, DI=DI)  ' RT3F_9B
L_6D8D: DI = &H8D7A
L_6D90: N_8D7A! = FAC!: SI = &H001A  ' RT3F_7D
L_6D93: BX = DX
L_6D95: RT3F_BA(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H001A, DI=&H8D7A)  ' RT3F_BA
L_6D98: FAC! = CSNG(BX)  ' RT3F_57
L_6D9B: DI = &H8896
L_6D9E: RT3F_89(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H8896)  ' RT3F_89
L_6DA1: DI = &H9702
L_6DA4: N_9702! = FAC!: SI = &H001A  ' RT3F_7D
L_6DA7: SI = &H889A
L_6DAA: FAC! = N_889A!: DI = &H001E  ' RT3F_6F
L_6DAD: GOTO L_6DF5
L_6DB0: DI = &H87F2
L_6DB3: SI = &H8D7A
L_6DB6: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8D7A, DI=&H87F2)  ' RT3F_7F
L_6DB9: BX = CINT(FAC!)  ' RT3F_77
L_6DBC: LocateRow% = BX  ' RT3E_42
L_6DBF: BX = 2
L_6DC2: LOCATE LocateRow%, BX  ' RT3E_44
L_6DC5: ' PRINT statement begins
L_6DC8: SI = DI
L_6DCA: DI = &H8896
L_6DCD: FAC! = N(SI) * N_8896!  ' RT3F_8F
L_6DD0: DI = &H827C
L_6DD3: BX = SI
L_6DD5: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_6DD8: DX = BX
L_6DDA: BX = CINT(FAC!)  ' RT3F_77
L_6DDD: SWAP BX, DX
L_6DDF: AX = BX
L_6DE1: BX = &H8802
L_6DE4: CX = &H17
L_6DE7: RT3D_0A(AX=AX, BX=&H8802, CX=&H0017, DX=DX, SI=SI, DI=DI)  ' RT3D_0A
L_6DEA: PRINT S(BX);  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6DED: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6DF0: SI = AX
L_6DF2: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_7F
L_6DF5: DI = &H87F2
L_6DF8: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_6DFB: SI = DI
L_6DFD: DI = &H9702
L_6E00: CompareLeft! = N_87F2!: CompareRight! = N_9702!  ' RT3F_9F
L_6E03: IF CompareLeft! <= CompareRight! THEN GOTO L_6DB0  ' flags from L_6E00
L_6E05: BX = 8
L_6E08: DX = &H60
L_6E0B: CX = 0
L_6E0D: AX = CX
L_6E0F: RT3E_84(AX=0, BX=8, CX=0, DX=&H0060, SI=SI, DI=DI)  ' RT3E_84
L_6E12: BX = 0xC0
L_6E15: DX = &H61
L_6E18: RT3E_85(AX=AX, BX=&H00C0, CX=CX, DX=&H0061, SI=SI, DI=DI)  ' RT3E_85
L_6E1B: BX = 0xFFFF
L_6E1E: DX = 1
L_6E21: CX = BX
L_6E23: RT3E_86(AX=AX, BX=&HFFFF, CX=&HFFFF, DX=1, SI=SI, DI=DI)  ' RT3E_86
L_6E26: DI = &H8906
L_6E29: SI = &H96EE
L_6E2C: CompareLeft! = N_96EE!: CompareRight! = N_8906!  ' RT3F_9F
L_6E2F: IF CompareLeft! > CompareRight! THEN GOTO L_6E34  ' flags from L_6E2C
L_6E31: GOTO L_6E43
L_6E34: BX = &H13
L_6E37: LocateRow% = BX  ' RT3E_42
L_6E3A: BX = 8
L_6E3D: LOCATE LocateRow%, BX  ' RT3E_44
L_6E40: GOSUB L_12B5
L_6E43: GOTO L_6BF8
L_6E46: SI = &H96F2
L_6E49: BX = CINT(N_96F2!)  ' RT3F_75
L_6E4C: DI = BX
L_6E4E: DI = DI * (2 ^ 1)
L_6E50: DI = DI * (2 ^ 1)
L_6E52: DI = DI + &H1850
L_6E56: SI = &H96F6
L_6E59: N(DI) = N_96F6!  ' RT3F_7B
L_6E5C: GOTO L_6BF8
L_6E5F: DI = &H48A0
L_6E62: SI = &H96F2
L_6E65: N_48A0! = N_96F2!  ' RT3F_7B
L_6E68: DI = &H48A4
L_6E6B: SI = &H96F6
L_6E6E: N_48A4! = N_96F6!  ' RT3F_7B
L_6E71: GOTO L_6BF8
L_6E74: SI = &H96F6
L_6E77: BX = CINT(N_96F6!)  ' RT3F_75
L_6E7A: SI = &H96F2
L_6E7D: DX = BX
L_6E7F: BX = CINT(N_96F2!)  ' RT3F_75
L_6E82: DI = BX
L_6E84: DI = DI * (2 ^ 1)
L_6E86: WORD(DI + &H48B0) = DX
L_6E8A: GOTO L_6BF8
L_6E8D: DI = &H8BB6
L_6E90: SI = &H96F2
L_6E93: N_8BB6! = N_96F2!  ' RT3F_7B
L_6E96: GOSUB L_1083
L_6E99: GOTO L_6BF8
L_6E9C: SI = &H827C
L_6E9F: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_6EA2: GOTO L_6F18
L_6EA5: ' Alignment NOP
L_6EA6: DI = &H882A
L_6EA9: SI = &H888E
L_6EAC: N_882A! = N_888E!  ' RT3F_7B
L_6EAF: BX = DI
L_6EB1: DI = &H882E
L_6EB4: SI = &H87F2
L_6EB7: N_882E! = N_87F2!  ' RT3F_7B
L_6EBA: GOSUB L_0359
L_6EBD: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_6EC0: IF (NOT CF AND NOT ZF) THEN GOTO L_6EC5  ' flags from L_6EBD
L_6EC2: GOTO L_6F0F
L_6EC5: DI = &H883E
L_6EC8: SI = &H96F2
L_6ECB: N_883E! = N_96F2!  ' RT3F_7B
L_6ECE: DI = &H8842
L_6ED1: BX = SI
L_6ED3: SI = &H87F2
L_6ED6: N_8842! = N_87F2!  ' RT3F_7B
L_6ED9: GOSUB L_038B
L_6EDC: BX = CINT(FAC!)  ' RT3F_77
L_6EDF: DI = BX
L_6EE1: DI = DI * (2 ^ 1)
L_6EE3: DI = DI * (2 ^ 1)
L_6EE5: DI = DI + &H1850
L_6EE9: BX = DI
L_6EEB: DI = &H882A
L_6EEE: SI = &H96F2
L_6EF1: N_882A! = N_96F2!  ' RT3F_7B
L_6EF4: DI = &H882E
L_6EF7: SI = &H87F2
L_6EFA: N_882E! = N_87F2!  ' RT3F_7B
L_6EFD: WORD(BP - 6) = BX
L_6F00: GOSUB L_0359
L_6F03: DI = &H96F6
L_6F06: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H96F6)  ' RT3F_81
L_6F09: DI = WORD(BP - 6)
L_6F0C: N(DI) = FAC!: SI = &H001A  ' RT3F_7D
L_6F0F: DI = &H827C
L_6F12: SI = &H87F2
L_6F15: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H87F2, DI=&H827C)  ' RT3F_7F
L_6F18: DI = &H87F2
L_6F1B: N_87F2! = FAC!: SI = &H001A  ' RT3F_7D
L_6F1E: SI = DI
L_6F20: DI = &H8812
L_6F23: CompareLeft! = N_87F2!: CompareRight! = N_8812!  ' RT3F_9F
L_6F26: IF CompareLeft! > CompareRight! THEN GOTO L_6F2B  ' flags from L_6F23
L_6F28: GOTO L_6EA6
L_6F2B: GOTO L_6BF8
L_6F2E: DI = &H9706
L_6F31: SI = &H96F2
L_6F34: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H96F2, DI=&H9706)  ' RT3F_7F
L_6F37: BX = CINT(FAC!)  ' RT3F_77
L_6F3A: SI = BX
L_6F3C: SI = SI * (2 ^ 1)
L_6F3E: SI = SI * (2 ^ 1)
L_6F40: SI = SI + &H1850
L_6F44: DI = &H827C
L_6F47: CompareLeft! = N(SI): CompareRight! = N_827C!  ' RT3F_9F
L_6F4A: IF CompareLeft! = CompareRight! THEN GOTO L_6F4F  ' flags from L_6F47
L_6F4C: GOTO L_6F57
L_6F4F: DI = SI
L_6F51: SI = &H8286
L_6F54: N(DI) = N_8286!  ' RT3F_7B
L_6F57: GOTO L_6BF8
L_6F5A: GOSUB L_6962
L_6F5D: GOTO L_6BF8
L_6F60: BX = 0xF
L_6F63: LocateRow% = BX  ' RT3E_42
L_6F66: BX = 2
L_6F69: LOCATE LocateRow%, BX  ' RT3E_44
L_6F6C: ' PRINT statement begins
L_6F6F: BX = &H970A
L_6F72: PRINT S_970A$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6F75: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6F78: GOSUB L_128E
L_6F7B: DI = &H8D8A
L_6F7E: SI = &H96F2
L_6F81: N_8D8A! = N_96F2!  ' RT3F_7B
L_6F84: GOTO L_6BF8
L_6F87: BX = 0xF
L_6F8A: LocateRow% = BX  ' RT3E_42
L_6F8D: BX = 2
L_6F90: LOCATE LocateRow%, BX  ' RT3E_44
L_6F93: ' PRINT statement begins
L_6F96: BX = &H9726
L_6F99: PRINT S_9726$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6F9C: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6F9F: GOSUB L_128E
L_6FA2: DI = &H8D8A
L_6FA5: SI = &H96F2
L_6FA8: N_8D8A! = N_96F2!  ' RT3F_7B
L_6FAB: GOTO L_6BF8
L_6FAE: BX = 0xF
L_6FB1: LocateRow% = BX  ' RT3E_42
L_6FB4: BX = 2
L_6FB7: LOCATE LocateRow%, BX  ' RT3E_44
L_6FBA: ' PRINT statement begins
L_6FBD: BX = &H9742
L_6FC0: PRINT S_9742$;  ' RT3F_6E; separator/format variant retained by RT tag; M string type 03 at runtime 99CA
L_6FC3: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_6FC6: GOSUB L_128E
L_6FC9: DI = &H8D8A
L_6FCC: SI = &H96F2
L_6FCF: N_8D8A! = N_96F2!  ' RT3F_7B
L_6FD2: GOTO L_6BF8
L_6FD5: DI = &H96F2
L_6FD8: SI = &H966C
L_6FDB: CompareLeft! = N_966C!: CompareRight! = N_96F2!  ' RT3F_9F
L_6FDE: IF CompareLeft! = CompareRight! THEN GOTO L_6FE3  ' flags from L_6FDB
L_6FE0: GOTO L_6FEC
L_6FE3: DI = &H8D8A
L_6FE6: SI = &H96F6
L_6FE9: N_8D8A! = N_96F6!  ' RT3F_7B
L_6FEC: GOTO L_6BF8
L_6FEF: DI = &H8D8A
L_6FF2: SI = &H96F2
L_6FF5: N_8D8A! = N_96F2!  ' RT3F_7B
L_6FF8: GOTO L_6BF8
L_6FFB: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_6FFE: DI = &H8832
L_7001: FAC! = FAC! * N_8832!  ' RT3F_91
L_7004: DI = &H96F2
L_7007: CompareLeft! = FAC!: CompareRight! = N_96F2!  ' RT3F_A1
L_700A: IF CompareLeft! < CompareRight! THEN GOTO L_700F  ' flags from L_7007
L_700C: GOTO L_7018
L_700F: DI = &H8D8A
L_7012: SI = &H96F6
L_7015: N_8D8A! = N_96F6!  ' RT3F_7B
L_7018: GOTO L_6BF8
L_701B: SI = &H96F2
L_701E: BX = CINT(N_96F2!)  ' RT3F_75
L_7021: SI = BX
L_7023: SI = SI * (2 ^ 1)
L_7025: SI = SI * (2 ^ 1)
L_7027: SI = SI + &H1850
L_702B: DI = &H96F6
L_702E: CompareLeft! = N(SI): CompareRight! = N_96F6!  ' RT3F_9F
L_7031: IF CompareLeft! <= CompareRight! THEN GOTO L_7036  ' flags from L_702E
L_7033: GOTO L_703F
L_7036: DI = &H8D8A
L_7039: SI = &H96FA
L_703C: N_8D8A! = N_96FA!  ' RT3F_7B
L_703F: GOTO L_6BF8
L_7042: SI = &H96F2
L_7045: BX = CINT(N_96F2!)  ' RT3F_75
L_7048: SI = BX
L_704A: SI = SI * (2 ^ 1)
L_704C: SI = SI * (2 ^ 1)
L_704E: SI = SI + &H1850
L_7052: DI = &H96F6
L_7055: CompareLeft! = N(SI): CompareRight! = N_96F6!  ' RT3F_9F
L_7058: IF CompareLeft! >= CompareRight! THEN GOTO L_705D  ' flags from L_7055
L_705A: GOTO L_7066
L_705D: DI = &H8D8A
L_7060: SI = &H96FA
L_7063: N_8D8A! = N_96FA!  ' RT3F_7B
L_7066: GOTO L_6BF8
L_7069: GOSUB L_1378
L_706C: BX = 0xD
L_706F: LocateRow% = BX  ' RT3E_42
L_7072: BX = 2
L_7075: LOCATE LocateRow%, BX  ' RT3E_44
L_7078: ' PRINT statement begins
L_707B: BX = &H975E
L_707E: PRINT S_975E$;  ' RT3F_6A; separator/format variant retained by RT tag
L_7081: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_7084: GOSUB L_1574
L_7087: BX = WORD(&H8C3C)
L_708B: FAC! = CSNG(BX)  ' RT3F_57
L_708E: DI = &H9770
L_7091: N_9770! = FAC!: SI = &H001A  ' RT3F_7D
L_7094: GOTO L_6BF8
L_7097: DI = &H96F2
L_709A: SI = &H9770
L_709D: CompareLeft! = N_9770!: CompareRight! = N_96F2!  ' RT3F_9F
L_70A0: IF CompareLeft! >= CompareRight! THEN GOTO L_70A5  ' flags from L_709D
L_70A2: GOTO L_70AE
L_70A5: DI = &H8D8A
L_70A8: SI = &H96F6
L_70AB: N_8D8A! = N_96F6!  ' RT3F_7B
L_70AE: GOTO L_6BF8
L_70B1: DI = &H9770
L_70B4: SI = &H96F2
L_70B7: FAC! = N_96F2! * N_9770!  ' RT3F_8F
L_70BA: DI = &H8BB6
L_70BD: N_8BB6! = FAC!: SI = &H001A  ' RT3F_7D
L_70C0: GOSUB L_1083
L_70C3: GOTO L_6BF8
L_70C6: DI = &H8BB6
L_70C9: SI = &H9774
L_70CC: N_8BB6! = N_9774!  ' RT3F_7B
L_70CF: GOSUB L_1083
L_70D2: DI = &H96F2
L_70D5: SI = &H8BB6
L_70D8: CompareLeft! = N_8BB6!: CompareRight! = N_96F2!  ' RT3F_9F
L_70DB: IF CompareLeft! >= CompareRight! THEN GOTO L_70E0  ' flags from L_70D8
L_70DD: GOTO L_70E9
L_70E0: DI = &H8D8A
L_70E3: SI = &H96F6
L_70E6: N_8D8A! = N_96F6!  ' RT3F_7B
L_70E9: GOTO L_6BF8
L_70EC: GOSUB L_13E5
L_70EF: GOTO L_2408
L_70F2: GOTO L_6D59
L_70F5: GOSUB L_1378
L_70F8: SI = &H827C
L_70FB: FAC! = N_827C!: DI = &H001E  ' RT3F_6F
L_70FE: GOTO L_717B
L_7101: ' Alignment NOP
L_7102: DI = &H882A
L_7105: SI = &H888E
L_7108: N_882A! = N_888E!  ' RT3F_7B
L_710B: DI = &H882E
L_710E: SI = &H8AD2
L_7111: N_882E! = N_8AD2!  ' RT3F_7B
L_7114: GOSUB L_0359
L_7117: RT3F_A9(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3F_A9
L_711A: IF (NOT CF AND NOT ZF) THEN GOTO L_711F  ' flags from L_7117
L_711C: GOTO L_7172
L_711F: DI = &H880A
L_7122: SI = &H8AD2
L_7125: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H880A)  ' RT3F_7F
L_7128: BX = SI
L_712A: DX = BX
L_712C: BX = CINT(FAC!)  ' RT3F_77
L_712F: LocateRow% = BX  ' RT3E_42
L_7132: BX = 2
L_7135: LOCATE LocateRow%, BX  ' RT3E_44
L_7138: ' PRINT statement begins
L_713B: SI = DX
L_713D: BX = CINT(N(SI))  ' RT3F_75
L_7140: BX = BX * (2 ^ 1)
L_7142: BX = BX * (2 ^ 1)
L_7144: BX = BX + &H4288
L_7148: PRINT S(BX);  ' RT3F_6A; separator/format variant retained by RT tag
L_714B: BX = &H8A70
L_714E: PRINT S_8A70$;  ' RT3F_6A; separator/format variant retained by RT tag
L_7151: ' End PRINT statement / flush (RT-specific trailing spacing retained)
L_7154: RT3D_34(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_34
L_7157: DI = &H96F2
L_715A: FAC! = FAC! * N_96F2!  ' RT3F_91
L_715D: DI = &H827C
L_7160: RT3F_81(AX=AX, BX=BX, CX=CX, DX=DX, SI=SI, DI=&H827C)  ' RT3F_81
L_7163: BX = &H1A
L_7166: RT3D_03(AX=AX, BX=&H001A, CX=CX, DX=DX, SI=SI, DI=DI)  ' RT3D_03
L_7169: DI = &H8AD6
L_716C: N_8AD6! = FAC!: SI = &H001A  ' RT3F_7D
L_716F: GOSUB L_6217
L_7172: DI = &H827C
L_7175: SI = &H8AD2
L_7178: RT3F_7F(AX=AX, BX=BX, CX=CX, DX=DX, SI=&H8AD2, DI=&H827C)  ' RT3F_7F
L_717B: DI = &H8AD2
L_717E: N_8AD2! = FAC!: SI = &H001A  ' RT3F_7D
L_7181: SI = DI
L_7183: DI = &H8812
L_7186: CompareLeft! = N_8AD2!: CompareRight! = N_8812!  ' RT3F_9F
L_7189: IF CompareLeft! > CompareRight! THEN GOTO L_718E  ' flags from L_7186
L_718B: GOTO L_7102
L_718E: BX = &H18
L_7191: LocateRow% = BX  ' RT3E_42
L_7194: BX = 6
L_7197: LOCATE LocateRow%, BX  ' RT3E_44
L_719A: GOSUB L_12B5
L_719D: GOTO L_6BF8
L_71A0: DI = &H48A0
L_71A3: SI = &H48A8
L_71A6: N_48A0! = N_48A8!  ' RT3F_7B
L_71A9: DI = &H48A4
L_71AC: SI = &H48AC
L_71AF: N_48A4! = N_48AC!  ' RT3F_7B
L_71B2: GOTO L_6BF8
L_71B5: DI = &H8B8C
L_71B8: SI = &H8B90
L_71BB: N_8B8C! = N_8B90!  ' RT3F_7B
L_71BE: DI = &H8866
L_71C1: SI = &H96F2
L_71C4: N_8866! = N_96F2!  ' RT3F_7B
L_71C7: DI = &H886A
L_71CA: SI = &H889E
L_71CD: N_886A! = N_889E!  ' RT3F_7B
L_71D0: GOSUB L_03F0
L_71D3: BX = CINT(FAC!)  ' RT3F_77
L_71D6: DI = BX
L_71D8: DI = DI * (2 ^ 1)
L_71DA: WORD(DI + &H48B0) = 0
L_71E0: GOTO L_6BF8

```

### Unclassified trailing instructions

```basic
L_71E3: N(DI) = N(SI)  ' RT3F_7B
L_71E6: GOSUB L_0406
L_71E9: BX = CINT(FAC!)  ' RT3F_77
L_71EC: DI = BX
L_71EE: DI = DI * (2 ^ 1)

```

## Inline dispatch evidence

All target lists below are supplied as arguments to unresolved RT3F_5E calls above. Raw word values precede the mapped listing labels so the CS adjustment can be independently checked.

| Call | Payload bytes (after runtime opcode) | Default continuation |
|---|---|---|
| L_1D24 | `08 28 1d 02 1e dc 1e b6 1f 90 20 6a 21 44 22 1e 23` | L_1D38 |
| L_1D3E | `08 42 1d 5a 1d 72 1d 8a 1d a2 1d ba 1d d2 1d ea 1d` | L_1D52 |
| L_1E18 | `08 1c 1e 34 1e 4c 1e 64 1e 7c 1e 94 1e ac 1e c4 1e` | L_1E2C |
| L_1EF2 | `08 f6 1e 0e 1f 26 1f 3e 1f 56 1f 6e 1f 86 1f 9e 1f` | L_1F06 |
| L_1FCC | `08 d0 1f e8 1f 00 20 18 20 30 20 48 20 60 20 78 20` | L_1FE0 |
| L_20A6 | `08 aa 20 c2 20 da 20 f2 20 0a 21 22 21 3a 21 52 21` | L_20BA |
| L_2180 | `08 84 21 9c 21 b4 21 cc 21 e4 21 fc 21 14 22 2c 22` | L_2194 |
| L_225A | `08 5e 22 76 22 8e 22 a6 22 be 22 d6 22 ee 22 06 23` | L_226E |
| L_2334 | `08 38 23 50 23 68 23 80 23 98 23 b0 23 c8 23 e0 23` | L_2348 |
| L_2608 | `21 e0 25 20 28 e0 25 e0 25 56 28 e0 25 8c 28 e0 25 e0 25 c2 28 e0 25 e0 25 e0 25 6c 59 e0 25 6e 4f b3 37 b0 35 e0 25 a8 41 e0 25 e0 25 e0 25 46 3c e0 25 e0 25 e0 25 e0 25 3e 5d e1 5e 82 68 5a 5f ca 53` | L_264E |
| L_2C8A | `02 82 2c c7 2d` | L_2C92 |
| L_3037 | `04 33 30 7a 30 df 31 7d 33` | L_3043 |
| L_6CF6 | `1b e8 6b 20 6d 49 6d 36 6e 4f 6e 64 6e 7d 6e 8c 6e 1e 6f 4a 6f 50 6f 77 6f 9e 6f c5 6f df 6f eb 6f 0b 70 32 70 59 70 87 70 a1 70 b6 70 dc 70 e2 70 e5 70 90 71 a5 71` | L_6D30 |

Recovered coverage: 10409 instructions, 3443 runtime sites, 102 distinct runtime IDs, 821 unresolved sites in 78 IDs. Every byte 0040..71EF is accounted for exactly once as an instruction or inline payload; every explicit branch and mapped dispatch destination is an instruction boundary. Inline payloads: 102 sites. Runtime labels and unresolved-call inventory are cross-checked mechanically. This is structural validation; no DOSBox behavior or independent semantic verification is claimed.

## Unknowns

Counts are static call sites in 0040..71EF after the inline-boundary repairs, including the single 3F_7B in the unclassified tail. They are not execution counts. Each listed call is preserved with all six live register arguments and any inline payload; a numeric argument is substituted only from local register setup. Body-supported partial descriptions do not remove calls from this list.

| Runtime call | Count | First offsets (full sites in transcription) |
|---|---:|---|
| RT3D_03 | 30 | L_0384, L_03A3, L_03C2, L_059B, L_0D80, L_1C32, L_1CF6, L_2522 … |
| RT3D_05 | 12 | L_0AF5, L_1154, L_12DB, L_16E7, L_3D6A, L_474D, L_4A8C, L_5215 … |
| RT3D_06 | 6 | L_11A7, L_12C1, L_12E9, L_1405, L_15D5, L_1ABD |
| RT3D_08 | 1 | L_67CA |
| RT3D_09 | 1 | L_6759 |
| RT3D_0A | 4 | L_2751, L_4386, L_6888, L_6DE7 |
| RT3D_0B | 6 | L_163A, L_422D, L_4710, L_4957, L_6841, L_6B10 |
| RT3D_0C | 1 | L_1431 |
| RT3D_0F | 2 | L_4375, L_4723 |
| RT3D_11 | 7 | L_435E, L_437E, L_63A5, L_63DF, L_6426, L_645A, L_648E |
| RT3D_13 | 1 | L_16FB |
| RT3D_21 | 3 | L_157F, L_4718, L_69ED |
| RT3D_25 | 2 | L_158B, L_5C2D |
| RT3D_2F | 1 | L_64C3 |
| RT3D_34 | 25 | L_2AC4, L_2C2E, L_2C92, L_2CDC, L_2E06, L_2E95, L_318C, L_3309 … |
| RT3D_43 | 5 | L_068E, L_5744, L_57F1, L_5860, L_590D |
| RT3E_09 | 1 | L_0694 |
| RT3E_1B | 2 | L_63BB, L_63F5 |
| RT3E_1E | 3 | L_0112, L_0297, L_649D |
| RT3E_20 | 3 | L_0107, L_028C, L_6475 |
| RT3E_21 | 3 | L_0287, L_02FD, L_64D0 |
| RT3E_2B | 2 | L_27CD, L_6D3E |
| RT3E_32 | 1 | L_0DF1 |
| RT3E_33 | 1 | L_0E1B |
| RT3E_35 | 1 | L_0E21 |
| RT3E_3A | 1 | L_13E1 |
| RT3E_43 | 3 | L_0C05, L_3D89, L_3DD5 |
| RT3E_4A | 2 | L_0E0B, L_0E13 |
| RT3E_5B | 1 | L_0DF7 |
| RT3E_5E | 18 | L_284C, L_2882, L_28B8, L_28EE, L_2A50, L_2A68, L_2CC8, L_2DF2 … |
| RT3E_5F | 18 | L_2854, L_288A, L_28C0, L_28F6, L_2A58, L_2A70, L_2CD0, L_2DFA … |
| RT3E_84 | 24 | L_0E2D, L_0E4D, L_0E6D, L_0EA2, L_0EC2, L_0EE2, L_0F01, L_0F21 … |
| RT3E_85 | 24 | L_0E36, L_0E56, L_0E76, L_0EAB, L_0ECB, L_0EEB, L_0F0A, L_0F2A … |
| RT3E_86 | 24 | L_0E40, L_0E60, L_0E81, L_0EB5, L_0ED5, L_0EF5, L_0F16, L_0F36 … |
| RT3E_87 | 1 | L_13CF |
| RT3E_88 | 1 | L_13D8 |
| RT3F_0F | 1 | L_0CF8 |
| RT3F_10 | 1 | L_0DC6 |
| RT3F_11 | 1 | L_36A3 |
| RT3F_14 | 3 | L_033B, L_36E4, L_4F49 |
| RT3F_1D | 7 | L_2833, L_2869, L_289F, L_28D5, L_5713, L_60C1, L_6116 |
| RT3F_23 | 1 | L_3B58 |
| RT3F_25 | 1 | L_330F |
| RT3F_27 | 1 | L_2CF5 |
| RT3F_2B | 3 | L_2825, L_6C75, L_6CC9 |
| RT3F_2D | 3 | L_2F55, L_574D, L_5869 |
| RT3F_2F | 6 | L_4B9C, L_4BD5, L_4C0F, L_4C74, L_4D06, L_4D98 |
| RT3F_31 | 2 | L_2F75, L_6339 |
| RT3F_35 | 3 | L_5AC1, L_5AD8, L_69F5 |
| RT3F_55 | 19 | L_00AD, L_16ED, L_3554, L_50CA, L_6393, L_63AA, L_63B2, L_63CD … |
| RT3F_5A | 1 | L_64BD |
| RT3F_5E | 13 | L_1D24, L_1D3E, L_1E18, L_1EF2, L_1FCC, L_20A6, L_2180, L_225A … |
| RT3F_6B | 11 | L_3BCD, L_3C0B, L_3C3F, L_4309, L_44FA, L_452F, L_45B8, L_47E5 … |
| RT3F_71 | 43 | L_0A82, L_0A9F, L_17FD, L_186C, L_197B, L_1C28, L_2548, L_2950 … |
| RT3F_78 | 1 | L_16FE |
| RT3F_7F | 238 | L_0143, L_0185, L_01B9, L_01FB, L_022F, L_0271, L_02E7, L_0312 … |
| RT3F_81 | 59 | L_0365, L_036B, L_0397, L_039D, L_03B6, L_03BC, L_03D5, L_03DB … |
| RT3F_85 | 10 | L_1804, L_1873, L_1982, L_35A5, L_38A7, L_392F, L_4BDD, L_4C17 … |
| RT3F_87 | 2 | L_10B3, L_4E63 |
| RT3F_89 | 10 | L_187A, L_191C, L_1989, L_26E8, L_2708, L_4E20, L_5536, L_5BB4 … |
| RT3F_93 | 3 | L_4BA1, L_4BDA, L_4C14 |
| RT3F_95 | 5 | L_0A89, L_0AA6, L_4C77, L_4D09, L_4D9B |
| RT3F_97 | 5 | L_0098, L_1B99, L_367A, L_37B0, L_3C05 |
| RT3F_99 | 3 | L_574A, L_5866, L_622F |
| RT3F_9B | 11 | L_10C9, L_1D09, L_26F4, L_316C, L_3346, L_4C9D, L_4D2F, L_4DC1 … |
| RT3F_9D | 5 | L_1C4C, L_2550, L_2958, L_3634, L_39BF |
| RT3F_A3 | 6 | L_3260, L_48E2, L_4A09, L_5A27, L_5B6E, L_66E6 |
| RT3F_A5 | 8 | L_2AF5, L_2D00, L_2E30, L_38F0, L_394C, L_3B5B, L_3F8E, L_6528 |
| RT3F_A9 | 24 | L_0A4F, L_0BD1, L_0BF2, L_10F9, L_111A, L_1242, L_1263, L_25DE … |
| RT3F_AB | 7 | L_1C48, L_1D03, L_254C, L_2954, L_2A5E, L_582C, L_5948 |
| RT3F_AD | 3 | L_1854, L_3584, L_3595 |
| RT3F_AF | 5 | L_639D, L_63D7, L_641E, L_6452, L_6486 |
| RT3F_B6 | 9 | L_0121, L_0163, L_01A5, L_01D9, L_021B, L_024F, L_029D, L_02C5 … |
| RT3F_B7 | 8 | L_0124, L_0166, L_01A8, L_01DC, L_021E, L_0252, L_02A0, L_02C8 |
| RT3F_B8 | 10 | L_013B, L_017D, L_01B0, L_01F3, L_0226, L_0269, L_02AA, L_02B0 … |
| RT3F_BA | 12 | L_1421, L_161A, L_1630, L_16D0, L_26DC, L_26FF, L_4361, L_436B … |
| RT3F_BB | 5 | L_11C1, L_1303, L_1434, L_1467, L_15EB |
| RT3F_BD | 11 | L_43CB, L_4411, L_4453, L_4498, L_44E4, L_4519, L_47A0, L_47CF … |

Further unknowns: numeric add/subtract variants 3F_7F/81/97/99/9B/9D and selector operations; runtime register clobbers beyond inspected short bodies; graphics coordinate flag encoding and PUT modes; graphics 84/85/86 group semantics; screen/palette exact semantics; file-I/O and input ABI; random/time routines; computed array bounds, record fields, map tile meanings and equipment/stat IDs; B7 type-byte meanings; the 5E high-byte/error/default behavior and final CS mapping confirmation; PRINT item spacing/format differences; trailing code-like bytes at 71E3. No gameplay meaning is assigned solely from an address or an apparent formula.

The original listing's runtime usage footer is not authoritative after correcting inline boundaries: it misses calls swallowed by table misalignment and may count data as instructions. The validation totals below refer to the recovered byte walk.

## Variables

Address identities are H. Address-based names deliberately avoid unsupported game-field names. Types are H only where a known typed runtime operand or data-lane constant table establishes them; literal string identities are H with the PRINT interpretation M as discussed above. A location may appear with multiple types when referenced differently; that is retained as evidence rather than silently reconciled.

| DS address | Type | Draft name | Evidence |
|---|---|---|---|
| &H001A | MBF single | N_001A! | 3DAE; 3DCF; 428A; 42E7; 44B9 |
| &H1988 | MBF single | N_1988! | 03B0; 1089; 10BD; 10C4 |
| &H198C | MBF single | N_198C! | 10CF |
| &H19A4 | MBF single | N_19A4! | 004F; 0066 |
| &H19B0 | MBF single | N_19B0! | 1004; 1038; 695C |
| &H19B4 | MBF single | N_19B4! | 0E00 |
| &H3AE8 | MBF single | N_3AE8! | 663D |
| &H3AF0 | MBF single | N_3AF0! | 06A0; 06D5; 0701; 072D; 075A … |
| &H3B20 | MBF single | N_3B20! | 6646 |
| &H3B24 | MBF single | N_3B24! | 6575 |
| &H3B78 | MBF single | N_3B78! | 06C9; 07AF |
| &H3B80 | MBF single | N_3B80! | 0861; 086D; 0876 |
| &H3B88 | MBF single | N_3B88! | 0D4E |
| &H3B8C | MBF single | N_3B8C! | 080B; 0882; 0D17; 0D46; 6619 |
| &H3BA0 | MBF single | N_3BA0! | 6634 |
| &H4890 | MBF single | N_4890! | 29CE; 5797; 6048; 63FF |
| &H4894 | MBF single | N_4894! | 57A3; 6051 |
| &H4898 | MBF single | N_4898! | 58B3; 60AF; 6405 |
| &H489C | MBF single | N_489C! | 58BF; 60B8 |
| &H48A0 | MBF single | N_48A0! | 0D25; 0D5C; 2BEC; 2F09; 307B … |
| &H48A4 | MBF single | N_48A4! | 040F; 0D34; 0D65; 2BF5; 2F12 … |
| &H48A8 | MBF single | N_48A8! | 0D2B; 0D5C; 2BEC; 2F09; 307B … |
| &H48AC | MBF single | N_48AC! | 0D3A; 0D65; 2BF5; 2F12; 3084 … |
| &H8274 | string descriptor | S_8274$ | 0046; 0074 |
| &H8278 | string descriptor | S_8278$ | MODULE_CONSTANTS literal ''; 0046; 11B9; 12D3; 12FB … |
| &H827C | MBF single | N_827C! | 004F; 0118; 0211; 02BC; 0306 … |
| &H827C | MBF single constant | N_827C! | MODULE_CONSTANTS = 1 |
| &H8280 | string descriptor | S_8280$ | MODULE_CONSTANTS literal 'A:'; 005A |
| &H8286 | MBF single | N_8286! | 0066; 061D; 07BB; 1840; 1A17 … |
| &H8286 | MBF single constant | N_8286! | MODULE_CONSTANTS = 2 |
| &H828A | string descriptor | S_828A$ | MODULE_CONSTANTS literal 'B:'; 0074 |
| &H8290 | string descriptor | S_8290$ | 007D |
| &H8294 | string descriptor | S_8294$ | 0086 |
| &H8298 | string descriptor | S_8298$ | 008F |
| &H829C | string descriptor | S_829C$ | MODULE_CONSTANTS literal '   Enclosed  '; 007D |
| &H82AE | string descriptor | S_82AE$ | MODULE_CONSTANTS literal 'Semi-Enclosed'; 0086 |
| &H82C0 | string descriptor | S_82C0$ | MODULE_CONSTANTS literal '     Open    '; 008F |
| &H82D2 | MBF single | N_82D2! | 009E; 2843; 2879; 28AF; 28E5 … |
| &H87A2 | string descriptor | S_87A2$ | MODULE_CONSTANTS literal 'INSH.BAS' |
| &H87AE | MBF single | N_87AE! | 00B9; 00EE; 042A; 07D6; 07FF … |
| &H87B2 | string descriptor | S_87B2$ | MODULE_CONSTANTS literal 'CHARINFO'; 00CD |
| &H87BE | string descriptor | S_87BE$ | 00D6 |
| &H87C2 | string descriptor | S_87C2$ | 00DF |
| &H87C6 | string descriptor | S_87C6$ | 00E8 |
| &H87CA | string descriptor | S_87CA$ | MODULE_CONSTANTS literal 'Dead'; 00D6 |
| &H87D2 | string descriptor | S_87D2$ | MODULE_CONSTANTS literal 'Okay'; 00DF |
| &H87DA | string descriptor | S_87DA$ | MODULE_CONSTANTS literal 'Rad'; 00E8 |
| &H87E2 | string descriptor | S_87E2$ | MODULE_CONSTANTS literal 'LOGO'; 0102 |
| &H87EA | string descriptor | S_87EA$ | MODULE_CONSTANTS literal 'NAME' |
| &H87F2 | MBF single | N_87F2! | 0130; 0149; 0151; 0172; 018B … |
| &H87F6 | MBF single | N_87F6! | 0151; 11D2; 15FC; 18DF; 2CFD |
| &H87F6 | MBF single constant | N_87F6! | MODULE_CONSTANTS = 13 |
| &H87FA | MBF single | N_87FA! | 0159; 019B; 01CF; 0245; 0642 … |
| &H87FA | MBF single constant | N_87FA! | MODULE_CONSTANTS = 0 |
| &H87FE | MBF single | N_87FE! | 0193; 055A; 19E1; 3166; 3192 … |
| &H87FE | MBF single constant | N_87FE! | MODULE_CONSTANTS = 15 |
| &H8802 | string descriptor | S_8802$ | 11AD; 11B9; 12C7; 12D3; 12E3 … |
| &H8806 | MBF single | N_8806! | 01C7 |
| &H8806 | MBF single constant | N_8806! | MODULE_CONSTANTS = 129 |
| &H880A | MBF single | N_880A! | 0209; 06C9; 0701; 07AF; 0954 … |
| &H880A | MBF single constant | N_880A! | MODULE_CONSTANTS = 10 |
| &H880E | MBF single | N_880E! | 023D |
| &H880E | MBF single constant | N_880E! | MODULE_CONSTANTS = 196 |
| &H8812 | MBF single | N_8812! | 027F; 02F5; 0351; 0634; 06D5 … |
| &H8812 | MBF single constant | N_8812! | MODULE_CONSTANTS = 6 |
| &H8816 | string descriptor | S_8816$ | MODULE_CONSTANTS literal 'CHARNAME' |
| &H882A | MBF single | N_882A! | 0580; 0A3E; 0A5D; 0A74; 0A93 … |
| &H882E | MBF single | N_882E! | 035F; 0589; 0A49; 0A68; 0A7F … |
| &H8832 | MBF single | N_8832! | 035F; 0391; 25AF; 2ACA; 2C34 … |
| &H8832 | MBF single constant | N_8832! | MODULE_CONSTANTS = 100 |
| &H8836 | MBF single constant | N_8836! | MODULE_CONSTANTS = 1500 |
| &H883A | MBF single constant | N_883A! | MODULE_CONSTANTS = 0.1 |
| &H883E | MBF single | N_883E! | 0461; 048B; 055A; 05AA; 05D4 … |
| &H8842 | MBF single | N_8842! | 0391; 046C; 0494; 0565; 05B5 … |
| &H8846 | MBF single constant | N_8846! | MODULE_CONSTANTS = 1500.5 |
| &H884E | MBF single | N_884E! | 03B0; 1089 |
| &H884E | MBF single constant | N_884E! | MODULE_CONSTANTS = 30000 |
| &H8852 | MBF single | N_8852! | 1038; 18CA |
| &H8852 | MBF single constant | N_8852! | MODULE_CONSTANTS = 0.5 |
| &H8856 | MBF single | N_8856! | 03CF; 1B29; 1B4A; 1B81; 1BDA … |
| &H885A | MBF single | N_885A! | 1B36; 1B57; 1B8A; 1BE3; 2691 … |
| &H885E | MBF single | N_885E! | 03CF; 03F6; 04FF; 1454; 1891 … |
| &H885E | MBF single constant | N_885E! | MODULE_CONSTANTS = 11 |
| &H8862 | MBF single constant | N_8862! | MODULE_CONSTANTS = 1369 |
| &H8866 | MBF single | N_8866! | 03F6; 0D8E; 1CCD; 2806; 2EE7 … |
| &H886A | MBF single | N_886A! | 0D97; 1CD6; 280F; 2EF0; 305E … |
| &H886E | MBF single | N_886E! | 0D71; 2513; 253F; 265C; 2927 … |
| &H8872 | MBF single | N_8872! | 040F; 14A1; 14B7; 1B68; 563C … |
| &H8872 | MBF single constant | N_8872! | MODULE_CONSTANTS = 37 |
| &H8876 | string descriptor | S_8876$ | MODULE_CONSTANTS literal 'Change things? '; 0447 |
| &H888A | MBF single | N_888A! | 0453; 0B91; 1AEF; 1B1D; 2BDE … |
| &H888E | MBF single | N_888E! | 0461; 0A3E; 0BE0; 1108; 1251 … |
| &H888E | MBF single constant | N_888E! | MODULE_CONSTANTS = 31 |
| &H8892 | MBF single | N_8892! | 046C; 62F4 |
| &H8892 | MBF single constant | N_8892! | MODULE_CONSTANTS = 0 |
| &H8896 | MBF single | N_8896! | 048B; 4B07; 6DCD |
| &H8896 | MBF single constant | N_8896! | MODULE_CONSTANTS = 23 |
| &H889A | MBF single | N_889A! | 0494; 6DAA |
| &H889A | MBF single constant | N_889A! | MODULE_CONSTANTS = 0 |
| &H889E | MBF single | N_889E! | 04AA; 064D; 0675; 06A0; 070F … |
| &H889E | MBF single constant | N_889E! | MODULE_CONSTANTS = 5 |
| &H88A2 | MBF single | N_88A2! | 04B0; 090B; 1713; 48B8; 4D55 … |
| &H88A2 | MBF single constant | N_88A2! | MODULE_CONSTANTS = 2300 |
| &H88A6 | MBF single | N_88A6! | 04CD; 4A65; 4A6D |
| &H88AA | MBF single | N_88AA! | 04E8 |
| &H88AE | MBF single | N_88AE! | 051F; 05F5; 077A; 07A6; 07F6 … |
| &H88AE | MBF single constant | N_88AE! | MODULE_CONSTANTS = 8 |
| &H88B2 | MBF single | N_88B2! | 05CB; 073B; 074E; 0771; 07ED … |
| &H88B2 | MBF single constant | N_88B2! | MODULE_CONSTANTS = 3 |
| &H88B6 | MBF single | N_88B6! | 0542; 0A1E; 17A0; 4974; 4DDC … |
| &H88B6 | MBF single constant | N_88B6! | MODULE_CONSTANTS = 2597 |
| &H88BA | MBF single | N_88BA! | 0580; 17AF; 3DBD; 3F79; 4072 … |
| &H88BA | MBF single constant | N_88BA! | MODULE_CONSTANTS = 16 |
| &H88BE | MBF single | N_88BE! | 0595; 4105 |
| &H88BE | MBF single constant | N_88BE! | MODULE_CONSTANTS = 0.8 |
| &H88C2 | MBF single | N_88C2! | 05AA; 2F2A; 3895 |
| &H88C2 | MBF single constant | N_88C2! | MODULE_CONSTANTS = 35 |
| &H88C6 | MBF single | N_88C6! | 05D4; 199E; 53F2 |
| &H88C6 | MBF single constant | N_88C6! | MODULE_CONSTANTS = 27 |
| &H88CA | MBF single | N_88CA! | 05FE; 1A7F; 5415; 544F; 5472 |
| &H88CA | MBF single constant | N_88CA! | MODULE_CONSTANTS = 54 |
| &H88CE | MBF single | N_88CE! | 0663; 16B0 |
| &H88CE | MBF single constant | N_88CE! | MODULE_CONSTANTS = 123 |
| &H88D2 | MBF single | N_88D2! | 068B; 06E3; 1B36; 2843; 2879 … |
| &H88D2 | MBF single constant | N_88D2! | MODULE_CONSTANTS = 7 |
| &H88D6 | MBF single | N_88D6! | 06AE; 06E3; 070F; 073B; 0768 … |
| &H88DA | MBF single | N_88DA! | 06B7; 06EC; 0718; 0746; 0771 … |
| &H88DE | MBF single | N_88DE! | 06C0; 06F5; 0721; 074E; 077A … |
| &H88E2 | MBF single | N_88E2! | 06AE; 0746; 157A; 164B; 17EF … |
| &H88E2 | MBF single constant | N_88E2! | MODULE_CONSTANTS = 4 |
| &H88E6 | MBF single | N_88E6! | 06B7; 67AA |
| &H88E6 | MBF single constant | N_88E6! | MODULE_CONSTANTS = 17 |
| &H88EA | MBF single | N_88EA! | 06C0 |
| &H88EA | MBF single constant | N_88EA! | MODULE_CONSTANTS = 0 |
| &H88EE | MBF single | N_88EE! | 06EC; 075A; 079D; 6780 |
| &H88EE | MBF single constant | N_88EE! | MODULE_CONSTANTS = 18 |
| &H88F2 | MBF single | N_88F2! | 06F5; 2EF0; 4A7A |
| &H88F2 | MBF single constant | N_88F2! | MODULE_CONSTANTS = 0 |
| &H88F6 | MBF single | N_88F6! | 0718; 2A45 |
| &H88F6 | MBF single constant | N_88F6! | MODULE_CONSTANTS = 25 |
| &H88FA | MBF single | N_88FA! | 0721 |
| &H88FA | MBF single constant | N_88FA! | MODULE_CONSTANTS = 0 |
| &H88FE | MBF single | N_88FE! | 072D; 2737; 3198 |
| &H88FE | MBF single constant | N_88FE! | MODULE_CONSTANTS = 14 |
| &H8902 | MBF single | N_8902! | 0786 |
| &H8902 | MBF single constant | N_8902! | MODULE_CONSTANTS = 30 |
| &H8906 | MBF single | N_8906! | 07C4; 09DA; 1B8A; 25BF; 4A6D … |
| &H8906 | MBF single constant | N_8906! | MODULE_CONSTANTS = 9 |
| &H890A | MBF single | N_890A! | 07CD; 2CBF; 2DE9; 62BB |
| &H890A | MBF single constant | N_890A! | MODULE_CONSTANTS = 28 |
| &H890E | MBF single | N_890E! | 0861; 170D; 1955; 3B03; 48B2 … |
| &H890E | MBF single constant | N_890E! | MODULE_CONSTANTS = 0 |
| &H8912 | string descriptor | S_8912$ | MODULE_CONSTANTS literal 'Atmosphere Unbreathable'; 08AE |
| &H892E | string descriptor | S_892E$ | MODULE_CONSTANTS literal 'Squad members with'; 08C5 |
| &H8944 | string descriptor | S_8944$ | MODULE_CONSTANTS literal 'oxygen:'; 08DC |
| &H8950 | MBF single | N_8950! | 0944; 0987; 09CA; 0A16; 0A1E … |
| &H8954 | MBF single | N_8954! | 3AD5 |
| &H8954 | MBF single constant | N_8954! | MODULE_CONSTANTS = -2 |
| &H8958 | MBF single | N_8958! | 0962; 0A5D; 0C68 |
| &H8958 | MBF single constant | N_8958! | MODULE_CONSTANTS = 33 |
| &H895C | MBF single | N_895C! | 09A5; 0A74; 0C92 |
| &H895C | MBF single constant | N_895C! | MODULE_CONSTANTS = 56 |
| &H8960 | MBF single | N_8960! | 09E8; 0A93; 0AB9; 0BC0; 0CBC … |
| &H8960 | MBF single constant | N_8960! | MODULE_CONSTANTS = 40 |
| &H8964 | MBF single | N_8964! | 0A2C; 0B0D; 0B2F; 3F50; 3FC9 … |
| &H8968 | MBF single | N_8968! | 3333; 4759; 5030; 50D9; 517B |
| &H8970 | MBF single | N_8970! | 4C97; 4D29; 4DBB |
| &H8A68 | MBF single | N_8A68! | 0AAD; 0AD8; 0ADE; 170D; 1773 … |
| &H8A6C | MBF single | N_8A6C! | 11EC; 165A; 38D9; 3900; 39A8 … |
| &H8A6C | MBF single constant | N_8A6C! | MODULE_CONSTANTS = 48 |
| &H8A70 | string descriptor | S_8A70$ | MODULE_CONSTANTS literal ' '; 0AFE; 0C25; 15CF; 4236 … |
| &H8A76 | string descriptor | S_8A76$ | MODULE_CONSTANTS literal 'Some squad members have'; 0B57 |
| &H8A92 | string descriptor | S_8A92$ | MODULE_CONSTANTS literal 'no oxygen source. Will'; 0B6E |
| &H8AAC | string descriptor | S_8AAC$ | MODULE_CONSTANTS literal 'you continue? (Y/N)'; 0B85 |
| &H8AC4 | string descriptor | S_8AC4$ | MODULE_CONSTANTS literal 'SPACE.STR'; 0B9F |
| &H8AD2 | MBF single | N_8AD2! | 0BCB; 0BE9; 0C14; 0C43; 0C4B … |
| &H8AD6 | MBF single | N_8AD6! | 0C31; 2EB0; 6306; 716C |
| &H8ADA | MBF single | N_8ADA! | 0C31; 256D |
| &H8ADA | MBF single constant | N_8ADA! | MODULE_CONSTANTS = 999 |
| &H8ADE | MBF single | N_8ADE! | 0C89; 2656; 265C |
| &H8ADE | MBF single constant | N_8ADE! | MODULE_CONSTANTS = 0 |
| &H8AE2 | MBF single | N_8AE2! | 0CB3; 31B4 |
| &H8AE2 | MBF single constant | N_8AE2! | MODULE_CONSTANTS = 0 |
| &H8AE6 | MBF single | N_8AE6! | 0CDB; 25F6; 25FC; 2998; 33EE |
| &H8AE6 | MBF single constant | N_8AE6! | MODULE_CONSTANTS = 0 |
| &H8B20 | MBF single | N_8B20! | 0D0E; 3802; 3841 |
| &H8B20 | MBF single constant | N_8B20! | MODULE_CONSTANTS = 26 |
| &H8B24 | MBF single | N_8B24! | 0D86; 0D8E; 2528; 2531; 2671 … |
| &H8B28 | MBF single | N_8B28! | 0D7A; 251C; 2665; 2930; 5656 |
| &H8B28 | MBF single constant | N_8B28! | MODULE_CONSTANTS = 0.015625 |
| &H8B88 | MBF single | N_8B88! | 0DDC; 6981; 6A45; 6A98; 6AA4 |
| &H8B88 | MBF single constant | N_8B88! | MODULE_CONSTANTS = 22 |
| &H8B8C | MBF single | N_8B8C! | 0DE8; 2531; 26B1; 34DD; 71BB |
| &H8B90 | MBF single | N_8B90! | 0DE8; 27BA; 2860; 2896; 3449 … |
| &H8B90 | MBF single constant | N_8B90! | MODULE_CONSTANTS = -1 |
| &H8B94 | MBF single | N_8B94! | 100A; 102A |
| &H8B98 | MBF single | N_8B98! | 1004 |
| &H8B98 | MBF single constant | N_8B98! | MODULE_CONSTANTS = 0.6 |
| &H8B9C | MBF single | N_8B9C! | 1022; 102A; 1056; 105E |
| &H8BA0 | MBF single | N_8BA0! | 103E; 105E |
| &H8BA4 | string descriptor | S_8BA4$ | MODULE_CONSTANTS literal 'Select Option'; 1079 |
| &H8BB6 | MBF single | N_8BB6! | 6E93; 70BD; 70CC; 70D8 |
| &H8BBA | MBF single | N_8BBA! | 10A0 |
| &H8BBA | MBF single constant | N_8BBA! | MODULE_CONSTANTS = 1e+07 |
| &H8BBE | string descriptor | S_8BBE$ | MODULE_CONSTANTS literal '>'; 115D; 3D73; 69D1 |
| &H8BC4 | string descriptor | S_8BC4$ | 11A1; 31F5; 35CF; 35EF; 41C1 … |
| &H8BC8 | MBF single | N_8BC8! | 11E0; 1905 |
| &H8BC8 | MBF single constant | N_8BC8! | MODULE_CONSTANTS = 0 |
| &H8BCC | MBF single | N_8BCC! | 11F8; 391A; 3966 |
| &H8BCC | MBF single constant | N_8BCC! | MODULE_CONSTANTS = 55 |
| &H8BD0 | MBF single constant | N_8BD0! | MODULE_CONSTANTS = -48 |
| &H8BD4 | MBF single | N_8BD4! | 1278; 35C6; 37BD |
| &H8BD8 | MBF single | N_8BD8! | 122F |
| &H8BD8 | MBF single constant | N_8BD8! | MODULE_CONSTANTS = 0 |
| &H8BDC | MBF single | N_8BDC! | 12A7; 12AF |
| &H8BE0 | string descriptor | S_8BE0$ | MODULE_CONSTANTS literal 'Press ENTER'; 12BB |
| &H8BF0 | MBF single | N_8BF0! | 130C; 1314; 1440; 1448; 1473 … |
| &H8BF4 | MBF single | N_8BF4! | 1314 |
| &H8BF4 | MBF single constant | N_8BF4! | MODULE_CONSTANTS = 95 |
| &H8BF8 | MBF single | N_8BF8! | 133A; 3CB3; 530A |
| &H8BF8 | MBF single constant | N_8BF8! | MODULE_CONSTANTS = -32 |
| &H8BFC | MBF single | N_8BFC! | 1354; 3018; 3C90; 52D8; 6003 |
| &H8C00 | MBF single | N_8C00! | 1360; 300F; 3C99; 52E6; 5AF1 … |
| &H8C04 | MBF single constant | N_8C04! | MODULE_CONSTANTS = -64 |
| &H8C08 | MBF single | N_8C08! | 1346; 3CA5; 52F2; 5AFD |
| &H8C08 | MBF single constant | N_8C08! | MODULE_CONSTANTS = -51 |
| &H8C0C | MBF single | N_8C0C! | 137E; 13EB; 60D1; 6126 |
| &H8C10 | MBF single | N_8C10! | 147B |
| &H8C10 | MBF single constant | N_8C10! | MODULE_CONSTANTS = 43 |
| &H8C14 | MBF single | N_8C14! | 1494; 46C3; 4778; 4985 |
| &H8C14 | MBF single constant | N_8C14! | MODULE_CONSTANTS = -40 |
| &H8C18 | MBF single | N_8C18! | 14AB; 1931; 3221; 59DA |
| &H8C18 | MBF single constant | N_8C18! | MODULE_CONSTANTS = 12 |
| &H8C1C | MBF single | N_8C1C! | 157A; 164B; 16D9; 6B04 |
| &H8C20 | MBF single | N_8C20! | 1588; 15AC; 1C82; 1C8A |
| &H8C24 | MBF single | N_8C24! | 1594; 15A3; 1CB7; 1CBF |
| &H8C28 | string descriptor | S_8C28$ | 15DB |
| &H8C2C | MBF single | N_8C2C! | 1666 |
| &H8C2C | MBF single constant | N_8C2C! | MODULE_CONSTANTS = 57 |
| &H8C30 | MBF single | N_8C30! | 1680; 320F; 59B8; 5B86; 5BCA |
| &H8C30 | MBF single constant | N_8C30! | MODULE_CONSTANTS = 32 |
| &H8C34 | MBF single | N_8C34! | 168C |
| &H8C34 | MBF single constant | N_8C34! | MODULE_CONSTANTS = 126 |
| &H8C38 | MBF single | N_8C38! | 16A4 |
| &H8C38 | MBF single constant | N_8C38! | MODULE_CONSTANTS = 96 |
| &H8C3E | MBF single | N_8C3E! | 1731; 3093; 30AA; 3166; 3393 … |
| &H8C42 | MBF single | N_8C42! | 1768; 31A4; 3B78; 4132; 496C … |
| &H8C46 | MBF single | N_8C46! | 1781; 30ED |
| &H8C4A | MBF single | N_8C4A! | 1789 |
| &H8C4A | MBF single constant | N_8C4A! | MODULE_CONSTANTS = 2600 |
| &H8C4E | MBF single | N_8C4E! | 180B |
| &H8C4E | MBF single constant | N_8C4E! | MODULE_CONSTANTS = 0.25 |
| &H8C52 | MBF single constant | N_8C52! | MODULE_CONSTANTS = -25 |
| &H8C56 | MBF single | N_8C56! | 3E9C; 3EDB; 6521 |
| &H8C56 | MBF single constant | N_8C56! | MODULE_CONSTANTS = 20 |
| &H8C5A | MBF single | N_8C5A! | 19B0; 19E1; 1A17; 1A5E; 1AA3 |
| &H8C5E | MBF single | N_8C5E! | 19BB |
| &H8C5E | MBF single constant | N_8C5E! | MODULE_CONSTANTS = 51 |
| &H8C62 | MBF single | N_8C62! | 19F1 |
| &H8C62 | MBF single constant | N_8C62! | MODULE_CONSTANTS = 52 |
| &H8C66 | MBF single | N_8C66! | 1A38 |
| &H8C66 | MBF single constant | N_8C66! | MODULE_CONSTANTS = 53 |
| &H8C6A | string descriptor | S_8C6A$ | MODULE_CONSTANTS literal 'y'; 1ACB |
| &H8C70 | string descriptor | S_8C70$ | MODULE_CONSTANTS literal 'Y'; 1AD7 |
| &H8C76 | string descriptor | S_8C76$ | MODULE_CONSTANTS literal 'n'; 1AF9 |
| &H8C7C | string descriptor | S_8C7C$ | MODULE_CONSTANTS literal 'N'; 1B05 |
| &H8C82 | MBF single | N_8C82! | 1B29; 1B4A; 1B81; 1BDA; 1C40 … |
| &H8C86 | MBF single | N_8C86! | 1B3F; 1C0D |
| &H8C8A | MBF single | N_8C8A! | 1B60; 1B68; 1BC5; 1BF2 |
| &H8C8E | MBF single | N_8C8E! | 1B78; 1C17 |
| &H8C92 | MBF single | N_8C92! | 1B93; 1C07 |
| &H8C96 | MBF single | N_8C96! | 1BA7 |
| &H8C9A | MBF single | N_8C9A! | 1BBD; 1BFE |
| &H8C9E | MBF single | N_8C9E! | 1BD1 |
| &H8CA2 | MBF single | N_8CA2! | 2968; 55BB; 55FB |
| &H8CA2 | MBF single constant | N_8CA2! | MODULE_CONSTANTS = 36 |
| &H8CA6 | MBF single | N_8CA6! | 1BEC; 1CBF |
| &H8CAA | MBF single | N_8CAA! | 1BFE |
| &H8CAE | MBF single | N_8CAE! | 1C07; 1C8A |
| &H8CB2 | MBF single | N_8CB2! | 1C38; 1C40 |
| &H8CB6 | MBF single | N_8CB6! | 1C53; 1CF0 |
| &H8CBA | MBF single | N_8CBA! | 1CFE |
| &H8CBE | MBF single | N_8CBE! | 1D15; 1D3B; 1E15; 1EEF; 1FC9 … |
| &H8CC2 | MBF single | N_8CC2! | 1CF0 |
| &H8CC2 | MBF single constant | N_8CC2! | MODULE_CONSTANTS = 0.125 |
| &H8CC6 | string descriptor | S_8CC6$ | MODULE_CONSTANTS literal 'C-Change Wep.'; 241F |
| &H8CD8 | string descriptor | S_8CD8$ | MODULE_CONSTANTS literal 'E-Equip'; 2436 |
| &H8CE4 | string descriptor | S_8CE4$ | MODULE_CONSTANTS literal 'F-Fix Items'; 244D |
| &H8CF4 | string descriptor | S_8CF4$ | MODULE_CONSTANTS literal 'G-Switch'; 2464 |
| &H8D00 | string descriptor | S_8D00$ | MODULE_CONSTANTS literal 'I-Inspect'; 247B |
| &H8D0E | string descriptor | S_8D0E$ | MODULE_CONSTANTS literal 'M-Medical'; 2492 |
| &H8D1C | string descriptor | S_8D1C$ | MODULE_CONSTANTS literal 'R-Reload'; 24A9 |
| &H8D28 | string descriptor | S_8D28$ | MODULE_CONSTANTS literal 'S-Search'; 24C3 |
| &H8D34 | string descriptor | S_8D34$ | MODULE_CONSTANTS literal 'T-Time Delay'; 24DA |
| &H8D44 | string descriptor | S_8D44$ | MODULE_CONSTANTS literal 'U-Use  V-View'; 24F1 |
| &H8D56 | MBF single | N_8D56! | 2565; 256D |
| &H8D5A | MBF single | N_8D5A! | 257E; 2586 |
| &H8D5E | MBF single | N_8D5E! | 25A7; 25AF |
| &H8D62 | MBF single | N_8D62! | 25CE; 25D6 |
| &H8D66 | MBF single | N_8D66! | 25ED |
| &H8D6A | MBF single | N_8D6A! | 2586 |
| &H8D6A | MBF single constant | N_8D6A! | MODULE_CONSTANTS = 1000 |
| &H8D6E | MBF single | N_8D6E! | 2596; 3644 |
| &H8D6E | MBF single constant | N_8D6E! | MODULE_CONSTANTS = 99 |
| &H8D72 | MBF single | N_8D72! | 25F6; 2896; 28CC |
| &H8D76 | MBF single | N_8D76! | 25FC; 2860; 2902 |
| &H8D7A | MBF single | N_8D7A! | 26FA; 67B2; 6819; 6880; 6D90 |
| &H8D7E | MBF single | N_8D7E! | 270E; 276A |
| &H8D82 | MBF single | N_8D82! | 2714 |
| &H8D86 | MBF single | N_8D86! | 27B2; 27BA; 35BA; 663D; 6D4A |
| &H8D8A | MBF single | N_8D8A! | 27E8; 27ED; 27F8; 5F09; 5F0E … |
| &H8D8E | MBF single | N_8D8E! | 293C; 298F; 2EE7; 2F42; 2F66 … |
| &H8D92 | MBF single | N_8D92! | 295F; 2968; 2F1E; 34E6 |
| &H8D96 | MBF single | N_8D96! | 29A1; 29A9; 29C3; 2C78; 2E9B |
| &H8D9A | string descriptor | S_8D9A$ | MODULE_CONSTANTS literal 'Radiation trap'; 29F3 |
| &H8DAC | string descriptor | S_8DAC$ | MODULE_CONSTANTS literal 'dectected.'; 2A0A |
| &H8DBA | MBF single | N_8DBA! | 2A18; 2A92 |
| &H8DBE | MBF single | N_8DBE! | 2A18; 2A3D; 2A45; 2A92; 575F … |
| &H8DC2 | string descriptor | S_8DC2$ | MODULE_CONSTANTS literal 'sees a trap!'; 2B4A |
| &H8DD2 | MBF single | N_8DD2! | 2AD3; 61A8; 61DC; 67E4 |
| &H8DD2 | MBF single constant | N_8DD2! | MODULE_CONSTANTS = 19 |
| &H8DD6 | string descriptor | S_8DD6$ | MODULE_CONSTANTS literal 'Will you have'; 2B93 |
| &H8DE8 | string descriptor | S_8DE8$ | MODULE_CONSTANTS literal ' dis-'; 2BBB |
| &H8DF2 | string descriptor | S_8DF2$ | MODULE_CONSTANTS literal 'arm it? (Y/N)'; 2BD2 |
| &H8E04 | MBF single | N_8E04! | 2BAA; 33F7; 6178; 61F7 |
| &H8E08 | MBF single | N_8E08! | 2C01; 33CE; 616F; 61C1; 61EE |
| &H8E0C | MBF single | N_8E0C! | 2C0D; 2C15; 2C3A |
| &H8E10 | MBF single | N_8E10! | 2C15 |
| &H8E10 | MBF single constant | N_8E10! | MODULE_CONSTANTS = 90 |
| &H8E14 | string descriptor | S_8E14$ | MODULE_CONSTANTS literal 'Successful!'; 2C48 |
| &H8E24 | string descriptor | S_8E24$ | MODULE_CONSTANTS literal 'Failure!'; 2C5A |
| &H8E30 | MBF single | N_8E30! | 2C78 |
| &H8E30 | MBF single constant | N_8E30! | MODULE_CONSTANTS = 0.322581 |
| &H8E34 | string descriptor | S_8E34$ | MODULE_CONSTANTS literal 'Radiation Trap'; 2CB3 |
| &H8E46 | MBF single | N_8E46! | 2CAA; 2D10 |
| &H8E4A | string descriptor | S_8E4A$ | MODULE_CONSTANTS literal 'is poisoned!'; 2D7F |
| &H8E5A | string descriptor | S_8E5A$ | MODULE_CONSTANTS literal 'Explosive Trap'; 2DDD |
| &H8E6C | MBF single | N_8E6C! | 2E0C |
| &H8E6C | MBF single constant | N_8E6C! | MODULE_CONSTANTS = 200 |
| &H8E70 | MBF single constant | N_8E70! | MODULE_CONSTANTS = 50 |
| &H8E74 | MBF single | N_8E74! | 2F1E |
| &H8E74 | MBF single constant | N_8E74! | MODULE_CONSTANTS = 34 |
| &H8E78 | MBF single | N_8E78! | 2F5B; 2F84; 3049; 3464 |
| &H8E7C | MBF single | N_8E7C! | 2F7B; 3049; 33E0; 3449 |
| &H8E80 | string descriptor | S_8E80$ | MODULE_CONSTANTS literal 'A Vault Door'; 2FA1 |
| &H8E90 | string descriptor | S_8E90$ | MODULE_CONSTANTS literal 'A-Leave'; 2FBE |
| &H8E9C | string descriptor | S_8E9C$ | MODULE_CONSTANTS literal 'B-Use Torch'; 2FD5 |
| &H8EAC | string descriptor | S_8EAC$ | MODULE_CONSTANTS literal 'C-Fire At Door'; 2FEC |
| &H8EBE | string descriptor | S_8EBE$ | MODULE_CONSTANTS literal 'D-Pick Lock'; 3003 |
| &H8ECE | string descriptor | S_8ECE$ | MODULE_CONSTANTS literal 'No Torches'; 30CD |
| &H8EDC | string descriptor | S_8EDC$ | MODULE_CONSTANTS literal ' uses'; 30FE |
| &H8EE6 | MBF single | N_8EE6! | 3132 |
| &H8EE6 | MBF single constant | N_8EE6! | MODULE_CONSTANTS = 1.2 |
| &H8EEA | MBF single | N_8EEA! | 314C; 32DB |
| &H8EEA | MBF single constant | N_8EEA! | MODULE_CONSTANTS = 0.9 |
| &H8EEE | string descriptor | S_8EEE$ | MODULE_CONSTANTS literal 'Who will fire?'; 31F5 |
| &H8F00 | MBF single | N_8F00! | 322D; 3235; 59AB; 5A3E; 5B31 … |
| &H8F04 | MBF single | N_8F04! | 59AB; 5B25; 5C18 |
| &H8F04 | MBF single constant | N_8F04! | MODULE_CONSTANTS = 788 |
| &H8F08 | MBF single | N_8F08! | 3235; 3A6A; 49B1; 4C32; 4FBD … |
| &H8F08 | MBF single constant | N_8F08! | MODULE_CONSTANTS = 800 |
| &H8F0C | string descriptor | S_8F0C$ | MODULE_CONSTANTS literal 'Not Armed'; 3287 |
| &H8F1A | string descriptor | S_8F1A$ | MODULE_CONSTANTS literal 'Out Of Ammo'; 32C9 |
| &H8F2A | MBF single | N_8F2A! | 32F5 |
| &H8F2A | MBF single constant | N_8F2A! | MODULE_CONSTANTS = 1.7 |
| &H8F2E | string descriptor | S_8F2E$ | MODULE_CONSTANTS literal 'No Lock Pick'; 33B9 |
| &H8F3E | MBF single | N_8F3E! | 33DA; 33EE; 3420 |
| &H8F42 | string descriptor | S_8F42$ | MODULE_CONSTANTS literal 'picks the lock'; 342E |
| &H8F54 | string descriptor | S_8F54$ | MODULE_CONSTANTS literal 'fails'; 343D |
| &H8F5E | string descriptor | S_8F5E$ | MODULE_CONSTANTS literal 'pts   '; 346A |
| &H8F68 | string descriptor | S_8F68$ | MODULE_CONSTANTS literal 'Door Opened'; 3489 |
| &H8F78 | MBF single | N_8F78! | 34E6 |
| &H8F78 | MBF single constant | N_8F78! | MODULE_CONSTANTS = 41 |
| &H8F7C | string descriptor | S_8F7C$ | MODULE_CONSTANTS literal 'The Exit'; 3503 |
| &H8F88 | string descriptor | S_8F88$ | MODULE_CONSTANTS literal 'Will you take'; 351D |
| &H8F9A | string descriptor | S_8F9A$ | MODULE_CONSTANTS literal 'it? (Y/N)'; 3534 |
| &H8FA8 | string descriptor | S_8FA8$ | MODULE_CONSTANTS literal 'SPACE.STR' |
| &H8FB6 | MBF single | N_8FB6! | 3560 |
| &H8FB6 | MBF single constant | N_8FB6! | MODULE_CONSTANTS = 0.99 |
| &H8FBA | MBF single constant | N_8FBA! | MODULE_CONSTANTS = 1930 |
| &H8FBE | string descriptor | S_8FBE$ | MODULE_CONSTANTS literal 'Switch who?'; 35CF |
| &H8FCE | string descriptor | S_8FCE$ | MODULE_CONSTANTS literal 'With who?'; 35EF |
| &H8FDC | MBF single | N_8FDC! | 35E6; 3613; 364F; 366A; 36D5 … |
| &H8FE0 | MBF single | N_8FE0! | 363B |
| &H8FE4 | MBF single | N_8FE4! | 3658; 36B9 |
| &H8FE8 | MBF single | N_8FE8! | 3661 |
| &H8FE8 | MBF single constant | N_8FE8! | MODULE_CONSTANTS = 0 |
| &H8FEC | MBF single | N_8FEC! | 36B1; 36B9; 3889; 563C; 56D8 … |
| &H8FF0 | MBF single | N_8FF0! | 36F3 |
| &H8FF4 | MBF single | N_8FF4! | 36F9 |
| &H8FF4 | MBF single constant | N_8FF4! | MODULE_CONSTANTS = 809 |
| &H8FF8 | MBF single | N_8FF8! | 3717 |
| &H8FF8 | MBF single constant | N_8FF8! | MODULE_CONSTANTS = 1097 |
| &H8FFC | MBF single | N_8FFC! | 371F |
| &H8FFC | MBF single constant | N_8FFC! | MODULE_CONSTANTS = 1102 |
| &H9000 | MBF single | N_9000! | 373D |
| &H9000 | MBF single constant | N_9000! | MODULE_CONSTANTS = 1399 |
| &H9004 | MBF single | N_9004! | 3745 |
| &H9004 | MBF single constant | N_9004! | MODULE_CONSTANTS = 2302 |
| &H9008 | MBF single | N_9008! | 3763 |
| &H9008 | MBF single constant | N_9008! | MODULE_CONSTANTS = 2599 |
| &H900C | MBF single | N_900C! | 37BD |
| &H900C | MBF single constant | N_900C! | MODULE_CONSTANTS = 0 |
| &H9010 | MBF single | N_9010! | 37C9; 381B; 3852; 39F3; 3AF6 |
| &H9014 | MBF single | N_9014! | 38C0; 3939; 398C; 3A25 |
| &H9014 | MBF single constant | N_9014! | MODULE_CONSTANTS = 49 |
| &H901C | MBF single | N_901C! | 3B27; 4CB8; 504A; 5DD7 |
| &H901C | MBF single constant | N_901C! | MODULE_CONSTANTS = 1088 |
| &H9020 | MBF single | N_9020! | 3B35 |
| &H9024 | MBF single | N_9024! | 3B35 |
| &H9024 | MBF single constant | N_9024! | MODULE_CONSTANTS = 0 |
| &H9028 | string descriptor | S_9028$ | MODULE_CONSTANTS literal 'Items fixed by'; 3B9F |
| &H903A | string descriptor | S_903A$ | MODULE_CONSTANTS literal 'Items rendered'; 3BE6 |
| &H904C | string descriptor | S_904C$ | MODULE_CONSTANTS literal 'unfixable:'; 3BFD |
| &H905A | string descriptor | S_905A$ | MODULE_CONSTANTS literal 'Repair kits'; 3C22 |
| &H906A | string descriptor | S_906A$ | MODULE_CONSTANTS literal 'used up:'; 3C39 |
| &H9076 | string descriptor | S_9076$ | MODULE_CONSTANTS literal ':'; 3BC7 |
| &H907C | string descriptor | S_907C$ | MODULE_CONSTANTS literal 'A-Squad Health'; 3C6D |
| &H908E | string descriptor | S_908E$ | MODULE_CONSTANTS literal 'B-Heal Member'; 3C84 |
| &H90A0 | string descriptor | S_90A0$ | MODULE_CONSTANTS literal 'Squad Health'; 3CE3 |
| &H90B0 | string descriptor | S_90B0$ | MODULE_CONSTANTS literal 'Hit Pts'; 3D11 |
| &H90BC | string descriptor | S_90BC$ | MODULE_CONSTANTS literal 'Name'; 3CFA |
| &H90C4 | string descriptor | S_90C4$ | MODULE_CONSTANTS literal '/'; 3DB4; 42ED; 47C7 |
| &H90CA | MBF single | N_90CA! | 3E6A; 3EB5; 3EEC; 3FDB; 4030 |
| &H90CE | string descriptor | S_90CE$ | MODULE_CONSTANTS literal 'will heal'; 3F44 |
| &H90DC | string descriptor | S_90DC$ | MODULE_CONSTANTS literal 'not healed'; 403E |
| &H90EA | string descriptor | S_90EA$ | MODULE_CONSTANTS literal ' is'; 4013 |
| &H90F2 | string descriptor | S_90F2$ | MODULE_CONSTANTS literal 'fully healed'; 40B3 |
| &H9102 | string descriptor | S_9102$ | MODULE_CONSTANTS literal 'healed 4 pts'; 40C2 |
| &H9112 | string descriptor | S_9112$ | MODULE_CONSTANTS literal 'Medkit used up'; 4129 |
| &H9124 | string descriptor | S_9124$ | MODULE_CONSTANTS literal 'Squad is'; 4192 |
| &H9130 | string descriptor | S_9130$ | MODULE_CONSTANTS literal 'fully healed'; 41A9 |
| &H9140 | string descriptor | S_9140$ | MODULE_CONSTANTS literal 'Inspect Who?'; 41C1 |
| &H9150 | MBF single | N_9150! | 4204; 4B4E |
| &H9154 | string descriptor | S_9154$ | MODULE_CONSTANTS literal 'years   '; 4290 |
| &H9160 | MBF single | N_9160! | 427C |
| &H9164 | MBF single constant | N_9164! | MODULE_CONSTANTS = 29 |
| &H9168 | MBF single | N_9168! | 4276 |
| &H9168 | MBF single constant | N_9168! | MODULE_CONSTANTS = 0.00547945 |
| &H916C | string descriptor | S_916C$ | MODULE_CONSTANTS literal 'HP'; 42CB |
| &H9172 | string descriptor | S_9172$ | MODULE_CONSTANTS literal '.' |
| &H9178 | string descriptor | S_9178$ | MODULE_CONSTANTS literal 'To Hit Bonus....'; 43C2 |
| &H918C | string descriptor | S_918C$ | MODULE_CONSTANTS literal 'Defence Bonus...'; 4409 |
| &H91A0 | string descriptor | S_91A0$ | MODULE_CONSTANTS literal 'Maximum Weight..'; 444A |
| &H91B4 | string descriptor | S_91B4$ | MODULE_CONSTANTS literal '+##' |
| &H91BC | string descriptor | S_91BC$ | MODULE_CONSTANTS literal '%'; 43F2; 4433; 4826 |
| &H91C2 | string descriptor | S_91C2$ | MODULE_CONSTANTS literal '##' |
| &H91C8 | string descriptor | S_91C8$ | MODULE_CONSTANTS literal ' kg'; 4475; 44C5 |
| &H91D0 | string descriptor | S_91D0$ | MODULE_CONSTANTS literal 'Current Weight..'; 448F |
| &H91E4 | string descriptor | S_91E4$ | MODULE_CONSTANTS literal 'Max Movement....'; 44DC |
| &H91F8 | string descriptor | S_91F8$ | MODULE_CONSTANTS literal 'Cur Movement....'; 4511 |
| &H920C | string descriptor | S_920C$ | MODULE_CONSTANTS literal 'Non-Esper'; 4568 |
| &H921A | string descriptor | S_921A$ | MODULE_CONSTANTS literal 'Esper Ability:'; 4577 |
| &H922C | string descriptor | S_922C$ | MODULE_CONSTANTS literal 'Level'; 45AD |
| &H9236 | string descriptor | S_9236$ | MODULE_CONSTANTS literal 'Mindshock'; 45D0 |
| &H9244 | string descriptor | S_9244$ | MODULE_CONSTANTS literal 'Communicate'; 4609 |
| &H9254 | string descriptor | S_9254$ | MODULE_CONSTANTS literal 'Heal'; 4642 |
| &H925C | string descriptor | S_925C$ | MODULE_CONSTANTS literal 'View'; 467B |
| &H9264 | string descriptor | S_9264$ | MODULE_CONSTANTS literal 'Psy Scream'; 46B4 |
| &H9272 | string descriptor | S_9272$ | MODULE_CONSTANTS literal 'Armor.............'; 4797 |
| &H9288 | string descriptor | S_9288$ | MODULE_CONSTANTS literal 'Sighting Hardware.'; 47FC |
| &H929E | string descriptor | S_929E$ | MODULE_CONSTANTS literal 'Clones............'; 4840 |
| &H92B4 | string descriptor | S_92B4$ | MODULE_CONSTANTS literal 'Hand Weapon.......'; 487B |
| &H92CA | string descriptor | S_92CA$ | MODULE_CONSTANTS literal '#' |
| &H92D0 | MBF single constant | N_92D0! | MODULE_CONSTANTS = 45 |
| &H92D4 | string descriptor | S_92D4$ | MODULE_CONSTANTS literal ' pt'; 48A6 |
| &H92DC | string descriptor | S_92DC$ | MODULE_CONSTANTS literal 'Rlds    Weapons'; 49A2 |
| &H92F0 | MBF single | N_92F0! | 49BA; 4B07; 4F84; 5282; 5321 … |
| &H92F4 | MBF single | N_92F4! | 49D4; 49DC |
| &H92F8 | MBF single | N_92F8! | 4A2D; 4B15; 5B18 |
| &H92F8 | MBF single constant | N_92F8! | MODULE_CONSTANTS = 1090 |
| &H92FC | MBF single constant | N_92FC! | MODULE_CONSTANTS = 500 |
| &H9300 | string descriptor | S_9300$ | MODULE_CONSTANTS literal '  '; 4A95 |
| &H9306 | string descriptor | S_9306$ | MODULE_CONSTANTS literal '*'; 4ABF; 5D0E |
| &H930C | string descriptor | S_930C$ | 4AEB; 5027; 50D0; 5172; 5D47 |
| &H9310 | MBF single | N_9310! | 4B36 |
| &H9314 | MBF single constant | N_9314! | MODULE_CONSTANTS = 39 |
| &H9318 | MBF single constant | N_9318! | MODULE_CONSTANTS = 42 |
| &H931C | MBF single constant | N_931C! | MODULE_CONSTANTS = 44 |
| &H9320 | MBF single constant | N_9320! | MODULE_CONSTANTS = 91 |
| &H9324 | MBF single constant | N_9324! | MODULE_CONSTANTS = 47 |
| &H9328 | MBF single | N_9328! | 4C2C; 4C55; 4CE7; 4D79 |
| &H932C | MBF single | N_932C! | 4CC3; 5063; 5DE2; 66BB |
| &H932C | MBF single constant | N_932C! | MODULE_CONSTANTS = 1100 |
| &H9330 | MBF single | N_9330! | 4D4A; 50F3; 5EE8; 6739 |
| &H9330 | MBF single constant | N_9330! | MODULE_CONSTANTS = 1397 |
| &H9334 | MBF single | N_9334! | 4F0D; 4F5D |
| &H9338 | MBF single | N_9338! | 4F96; 525D; 5298; 5318 |
| &H933C | string descriptor | S_933C$ | MODULE_CONSTANTS literal 'EQUIPING'; 4FB4 |
| &H9348 | MBF single | N_9348! | 5030; 50D9; 517B; 5224; 526D |
| &H934C | MBF single | N_934C! | 5058; 5101; 51A3 |
| &H934C | MBF single constant | N_934C! | MODULE_CONSTANTS = 3333 |
| &H9350 | string descriptor | S_9350$ | MODULE_CONSTANTS literal 'Ammo For ' |
| &H935E | MBF single constant | N_935E! | MODULE_CONSTANTS = 65 |
| &H9362 | string descriptor | S_9362$ | MODULE_CONSTANTS literal '-'; 521E |
| &H9368 | MBF single constant | N_9368! | MODULE_CONSTANTS = 46 |
| &H936C | MBF single | N_936C! | 5282 |
| &H936C | MBF single constant | N_936C! | MODULE_CONSTANTS = 21 |
| &H9370 | string descriptor | S_9370$ | MODULE_CONSTANTS literal 'SPACEBAR for more'; 52B5 |
| &H9386 | string descriptor | S_9386$ | MODULE_CONSTANTS literal 'A-R to change owner'; 52CC |
| &H939E | MBF single | N_939E! | 5300; 5E65 |
| &H939E | MBF single constant | N_939E! | MODULE_CONSTANTS = 9999 |
| &H93A2 | MBF single constant | N_93A2! | MODULE_CONSTANTS = 499 |
| &H93A6 | string descriptor | S_93A6$ | MODULE_CONSTANTS literal 'views...'; 5516 |
| &H93B2 | MBF single | N_93B2! | 5594; 5599; 561D |
| &H93B6 | MBF single | N_93B6! | 55A4; 55E4; 63FF; 6405; 64A6 |
| &H93B6 | MBF single constant | N_93B6! | MODULE_CONSTANTS = 0 |
| &H93BA | MBF single | N_93BA! | 55B3; 55BB; 5617 |
| &H93BE | MBF single | N_93BE! | 55D4; 55D9; 5630 |
| &H93C2 | MBF single | N_93C2! | 55F3; 55FB; 562A |
| &H93C6 | MBF single | N_93C6! | 5617; 56FC |
| &H93CA | MBF single | N_93CA! | 562A; 56E0 |
| &H93CE | MBF single | N_93CE! | 5662; 566A; 568D; 56C6 |
| &H93D2 | string descriptor | S_93D2$ | MODULE_CONSTANTS literal 'Beings!'; 5723 |
| &H93DE | string descriptor | S_93DE$ | MODULE_CONSTANTS literal 'No Life'; 5732 |
| &H93EA | MBF single | N_93EA! | 57F7 |
| &H93EE | MBF single | N_93EE! | 5753 |
| &H93EE | MBF single constant | N_93EE! | MODULE_CONSTANTS = 0.23 |
| &H93F2 | MBF single | N_93F2! | 5770; 588C |
| &H93F2 | MBF single constant | N_93F2! | MODULE_CONSTANTS = 0.005 |
| &H93F6 | MBF single | N_93F6! | 577F; 589B |
| &H93F6 | MBF single constant | N_93F6! | MODULE_CONSTANTS = 0.995 |
| &H93FA | MBF single | N_93FA! | 5797; 57B2; 58B3; 58CE |
| &H93FA | MBF single constant | N_93FA! | MODULE_CONSTANTS = 0 |
| &H93FE | MBF single | N_93FE! | 5800; 591C |
| &H93FE | MBF single constant | N_93FE! | MODULE_CONSTANTS = 24 |
| &H9402 | MBF single constant | N_9402! | MODULE_CONSTANTS = -7 |
| &H9406 | MBF single | N_9406! | 5913 |
| &H940A | MBF single | N_940A! | 586F |
| &H940A | MBF single constant | N_940A! | MODULE_CONSTANTS = 0.07 |
| &H940E | MBF single | N_940E! | 587B; 5909; 591C |
| &H9412 | string descriptor | S_9412$ | MODULE_CONSTANTS literal "Who'll change?"; 5985 |
| &H9424 | MBF single | N_9424! | 59CA; 59CF; 5BDC; 5D89; 5D8E … |
| &H9428 | MBF single | N_9428! | 59E6; 59EB |
| &H942C | string descriptor | S_942C$ | MODULE_CONSTANTS literal ' Is Using:'; 5A66 |
| &H943A | string descriptor | S_943A$ | MODULE_CONSTANTS literal 'SPACE to change weapon'; 5A8E |
| &H9454 | string descriptor | S_9454$ | MODULE_CONSTANTS literal 'ENTER to select'; 5AA5 |
| &H9468 | MBF single constant | N_9468! | MODULE_CONSTANTS = -788 |
| &H946C | string descriptor | S_946C$ | MODULE_CONSTANTS literal 'Hand Weapon'; 5C26 |
| &H947C | MBF single | N_947C! | 5C53; 5C58; 5C6F |
| &H9480 | MBF single | N_9480! | 5CA2; 5CAA |
| &H9484 | string descriptor | S_9484$ | MODULE_CONSTANTS literal 'A'; 5CBD |
| &H948A | string descriptor | S_948A$ | MODULE_CONSTANTS literal ' R'; 5CD5 |
| &H9490 | string descriptor | S_9490$ | MODULE_CONSTANTS literal 'Reloading'; 5D63 |
| &H949E | MBF single | N_949E! | 5EA6; 5EC0 |
| &H949E | MBF single constant | N_949E! | MODULE_CONSTANTS = 0.3 |
| &H94A2 | string descriptor | S_94A2$ | MODULE_CONSTANTS literal 'You Find'; 5F2D |
| &H94AE | string descriptor | S_94AE$ | MODULE_CONSTANTS literal 'Nothing'; 5F44 |
| &H94BA | string descriptor | S_94BA$ | MODULE_CONSTANTS literal 'Unusual'; 5F5B |
| &H94C6 | string descriptor | S_94C6$ | MODULE_CONSTANTS literal 'A-Activate'; 5F81 |
| &H94D4 | string descriptor | S_94D4$ | MODULE_CONSTANTS literal 'Motion'; 5F9B |
| &H94DE | string descriptor | S_94DE$ | MODULE_CONSTANTS literal 'Dectector'; 5FB2 |
| &H94EC | string descriptor | S_94EC$ | MODULE_CONSTANTS literal 'B-Activate'; 5FC9 |
| &H94FA | string descriptor | S_94FA$ | MODULE_CONSTANTS literal 'Radiation'; 5FE0 |
| &H9508 | string descriptor | S_9508$ | MODULE_CONSTANTS literal 'Dectector'; 5FF7 |
| &H9516 | string descriptor | S_9516$ | MODULE_CONSTANTS literal 'You Have None'; 6069 |
| &H9528 | MBF single | N_9528! | 6235; 623D; 6272; 6275 |
| &H952C | string descriptor | S_952C$ | MODULE_CONSTANTS literal 'dies!!!'; 62AF |
| &H9538 | string descriptor | S_9538$ | MODULE_CONSTANTS literal 'takes'; 6300 |
| &H9542 | string descriptor | S_9542$ | MODULE_CONSTANTS literal 'hits'; 630C |
| &H954A | string descriptor | S_954A$ | MODULE_CONSTANTS literal 'You Are All Dead'; 637F |
| &H955E | string descriptor | S_955E$ | MODULE_CONSTANTS literal 'IN' |
| &H9564 | string descriptor | S_9564$ | MODULE_CONSTANTS literal '.BAS' |
| &H956C | string descriptor | S_956C$ | MODULE_CONSTANTS literal 'INMAP' |
| &H9576 | string descriptor | S_9576$ | MODULE_CONSTANTS literal 'INMAP' |
| &H9580 | string descriptor | S_9580$ | MODULE_CONSTANTS literal 'MES' |
| &H9588 | MBF single | N_9588! | 6557; 655F; 6575; 658A; 65C0 … |
| &H958C | MBF single | N_958C! | 6547 |
| &H958C | MBF single constant | N_958C! | MODULE_CONSTANTS = 1.8 |
| &H9590 | string descriptor | S_9590$ | MODULE_CONSTANTS literal 'Confrontation'; 659A |
| &H95A2 | string descriptor | S_95A2$ | MODULE_CONSTANTS literal 'with enemies'; 65B1 |
| &H95B2 | string descriptor | S_95B2$ | MODULE_CONSTANTS literal 'You surprise'; 65CE |
| &H95C2 | string descriptor | S_95C2$ | MODULE_CONSTANTS literal 'enemies'; 65E6 |
| &H95CE | string descriptor | S_95CE$ | MODULE_CONSTANTS literal 'Enemies'; 65F5 |
| &H95DA | string descriptor | S_95DA$ | MODULE_CONSTANTS literal 'surprise you'; 660D |
| &H95EA | string descriptor | S_95EA$ | MODULE_CONSTANTS literal 'PLBATTLE.EXE' |
| &H95FA | string descriptor | S_95FA$ | MODULE_CONSTANTS literal 'Press SPACEBAR'; 666A |
| &H960C | MBF single | N_960C! | 6680 |
| &H960C | MBF single constant | N_960C! | MODULE_CONSTANTS = 501 |
| &H9610 | MBF single | N_9610! | 669D |
| &H9610 | MBF single constant | N_9610! | MODULE_CONSTANTS = 0 |
| &H9614 | MBF single | N_9614! | 66B3 |
| &H9614 | MBF single constant | N_9614! | MODULE_CONSTANTS = 554 |
| &H9618 | MBF single | N_9618! | 6762; 67D3; 67D8 |
| &H961C | MBF single | N_961C! | 676F; 67BF |
| &H9620 | MBF single | N_9620! | 67AA; 6811; 6839 |
| &H9624 | string descriptor | S_9624$ | MODULE_CONSTANTS literal 'Standard'; 68A9 |
| &H9630 | string descriptor | S_9630$ | MODULE_CONSTANTS literal 'Delay:'; 68C0 |
| &H963A | string descriptor | S_963A$ | MODULE_CONSTANTS literal 'Current'; 68DD |
| &H9646 | string descriptor | S_9646$ | MODULE_CONSTANTS literal 'Delay:'; 68F4 |
| &H9650 | string descriptor | S_9650$ | MODULE_CONSTANTS literal 'New Delay'; 6911 |
| &H965E | string descriptor | S_965E$ | MODULE_CONSTANTS literal '(1-9999):'; 6928 |
| &H966C | MBF single | N_966C! | 6968; 6981; 69D7; 6AA4; 6B54 … |
| &H9670 | string descriptor | S_9670$ | MODULE_CONSTANTS literal 'Use arrow keys to pick'; 69A2 |
| &H968A | string descriptor | S_968A$ | MODULE_CONSTANTS literal 'option. ENTER to accept'; 69B9 |
| &H96A6 | string descriptor | S_96A6$ | MODULE_CONSTANTS literal 'Enter a single word'; 6AE1 |
| &H96BE | string descriptor | S_96BE$ | MODULE_CONSTANTS literal '-->'; 6AF8 |
| &H96C6 | string descriptor | S_96C6$ | 6B16; 6B41 |
| &H96CA | MBF single | N_96CA! | 6B1F; 6B71 |
| &H96CE | MBF single | N_96CE! | 6B5C |
| &H96CE | MBF single constant | N_96CE! | MODULE_CONSTANTS = -9 |
| &H96D2 | MBF single | N_96D2! | 6BB1 |
| &H96D2 | MBF single constant | N_96D2! | MODULE_CONSTANTS = -3 |
| &H96D6 | string descriptor | S_96D6$ | MODULE_CONSTANTS literal 'Unrecognized Command'; 6BE8 |
| &H96EE | MBF single | N_96EE! | 6C10; 6E2C |
| &H96F2 | MBF single | N_96F2! | 6C30; 6D4A; 6D5F; 6E49; 6E65 … |
| &H96F6 | MBF single | N_96F6! | 6C4C; 6E59; 6E6E; 6E77; 6FE9 … |
| &H96FA | MBF single | N_96FA! | 6C68; 703C; 7063 |
| &H96FE | MBF single | N_96FE! | 6C8F; 6CC1 |
| &H9702 | MBF single | N_9702! | 6DA4; 6E00 |
| &H9706 | MBF single constant | N_9706! | MODULE_CONSTANTS = 109 |
| &H970A | string descriptor | S_970A$ | MODULE_CONSTANTS literal 'Nothing unusual happens'; 6F72 |
| &H9726 | string descriptor | S_9726$ | MODULE_CONSTANTS literal 'Not valid or possible  '; 6F99 |
| &H9742 | string descriptor | S_9742$ | MODULE_CONSTANTS literal 'What?                  '; 6FC0 |
| &H975E | string descriptor | S_975E$ | MODULE_CONSTANTS literal 'Enter Amount:'; 707E |
| &H9770 | MBF single | N_9770! | 7091; 709D; 70B7 |
| &H9774 | MBF single | N_9774! | 70CC |
| &H9774 | MBF single constant | N_9774! | MODULE_CONSTANTS = 0 |

Register temporaries: AX/BX/CX/DX/SI/DI (16 bits), and CPU flags ZF/CF/SF/OF. Explanatory temporaries: CompareLeft!/Right! (single), CompareLeft$/Right$ (string), CompareLeft%/Right% (word), LocateRow%, PutX%/PutY%/PutXFlag%/PutYFlag%. These are not claimed as original BASIC variables.

Indirect arrays remain address expressions. Examples with direct evidence: string names at &H4288 plus four times an index (0129..013B and 0C25 vicinity); four-byte numeric storage at &H1850 plus four times an index (0472..0482); integer map cells at &H48B0 plus twice an index (0409..0426). The helper near 0409 computes an index involving DS:48A4, constant 37, DS:48A0 and an unresolved arithmetic call; map width/orientation stays unknown. DS:8274 is a filename-prefix descriptor (M: 0040..0074 empty/A:/B: assignments controlled by DS:19A4); the shared numeric control's broader meaning and value conventions remain address-based. DS:8290/94/98 and DS:87BE/C2/C6 are writable environment/status label descriptors (M: direct literal assignments at 0077..008F and 00D0..00E8).

