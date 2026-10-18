# STARTUP.BAK — title, attract loop and main menu (BASIC-style pseudocode)

Lane mod-startup, 2026-10-15. Evidence: `decode/listings/STARTUP.lst` (regenerated after rt-naming; 1400 instructions, 59 distinct runtime calls, all named), `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` (STARTUP section: 34 string literals, 27 numeric constants, no LINES table), `decode/data/DATA_FILES.md` (NAME, CHARNAME), `decode/data/SPRITES.md` (TITLE.BAS, LOGO.BAS). Every statement was re-derived from the listing bytes; the codex draft (`STARTUP.draft.md`) was used only as a scaffold and its register-level lines were not carried over.

Conventions: `L_xxxx:` = listing offset of the statement's first instruction (labels are given for every jump/call target and for the start of each statement group). `A(n)` = element n of the 2601-single COMMON array at DS 0x1850 (CHARINFO.BAS save array; element n at 0x1850 + 4n; the data lane uses the same `A(n)` names). Names other than `A(n)` are inferred and carry the DS address as `'was 0xXXXX`; evidence is in the Variables table. Numeric constants are substituted from the INIT table (e.g. 0xD2FC = 13). FOR loops are reconstructed from the compiler's pattern `init; store I; cmp I,limit; jbe body ... I=I+1`.

Code range: 0x40..0xEF4. Bytes 0xEF5..0xEFF (`inc dx; nop; nop; mov bx,dx; RT3E_44; nop; nop; int 16h`) are unreachable leftovers before the block-A data at 0xF00 and are not claimed as code.

## Flow summary

1. 0040: copy the tune literal into Tune$, start background music mode (`PLAY "MBMLT126"`), derive SoundOn from SoundOff!, feed the music queue, SCREEN 1 / CLS / KEY OFF, EGA palette if UseEGA!=1.
2. 00AD: BLOAD "title" to &H4964 and PUT the 320x200 title picture; read the NAME table (18 string arrays) and CHARNAME (crew names) from the two text files; BLOAD "LOGO" to &H40F4; fill the three option-text arrays.
3. 0660: attract loop: wait up to 100 x 2.4 s on the title (any key skips), then cycle four animation frames from TITLE.BAS over the picture with 2.4 s pauses, redraw the picture, repeat; any key -> menu.
4. 07FE: menu screen: double frame, filled title bar with the LOGO sprite, PAINT the frame, menu text, Microsoft notice, one-time CPU speed calibration, then `ON VAL(INKEY$) GOTO` for keys 1..5.
5. Key 1: store drive/speed settings into A(84..92), wait for the music queue to drain, CHAIN "STARPORT". Key 2: two Y/N confirmations, then reset the save (names, A() array, defaults) and redraw the menu. Keys 3/4/5 toggle drive type, sound, adapter.

## Pseudocode

```basic
L_0040: Tune$ = "O1 E3>D+8E4<B4>C4<G+4 A4 E4 O1F3> E8D4< F4F+3>E8D4<F+4G3> F8E4< G4G+3>F8E4< B4 O2C4<A4> C4 E4 A3P64<A8P64A4>C4< B4G+4>F4E4< A4 E4P64 E3 A8P64 A4 E4P64 E3G+8A4>C4< B4E4< A2 P1"
        '0040 SASSIGN s$[0x4948] <- literal 0x4896 (174 chars)            'Tune$ was 0x4948
L_0049: PLAY "MBMLT126"                     ' music background, legato, tempo 126
L_004F: SoundOn = INT(1 - SoundOff!)            '004F FSUB [495C=1]-[19C4]; INT; store 0x4958   'SoundOn was 0x4958; SoundOff!=1 means "Sound Off"
L_0064: IF SoundOn <> 0 THEN GOSUB L_0E7F   '0066 BOOL [4958]; jne 0070 -> call 0E7F (FeedMusic)
L_0073: MaxDrive = 1                        'FMOV [4960] <- 1                                'MaxDrive was 0x4960 (only written here)
L_007C: SCREEN 1
L_0082: CLS
L_0088: KEY OFF
L_008D: IF UseEGA! = 1 THEN PALETTE 1, 9: PALETTE 2, 4     '008D FCMP [19B4]?1; je 009B      (UseEGA! set by STARCOMM)
L_00AD: BLOAD "title", &H4964               'CSNG(&H4964)->FAC; bx="title"(0xD2E6); dx=1A    'TITLE.BAS: picture at 0x4964 + 4 frames
L_00BC: PUT (0, 0), TitlePic, XOR           'coords 0,0 (ints); bx=0x4964; dl=4 (verb table: 4 = XOR)
L_00D0: IF SoundOn <> 0 THEN GOSUB L_0E7F
L_00E0: OPEN "NAME" FOR INPUT AS #1         '00E0 mode 0 (INPUT); cx=0; bx=1; dx="NAME"(0xD2F0)
L_00F0: FOR I = 1 TO 13: INPUT #1, Rank$(I): NEXT I            'I was 0xD2F8; array 0x42AC (14 elems)   NAME fields 0..12
L_0132: FOR I = 0 TO 15: INPUT #1, Skill$(I): NEXT I           'array 0x42E4 (16)
L_0174: FOR I = 0 TO 8:  INPUT #1, ShipClassName$(I): NEXT I           'array 0x4324 (9) (was N4324$)
L_01B6: FOR I = 0 TO 3:  INPUT #1, ShipSize$(I): NEXT I           'array 0x4348 (5) (was N4348$)
L_01F8: FOR I = 0 TO 4:  INPUT #1, ShieldName$(I): NEXT I           'array 0x435C (5) (was N435C$)
L_023A: FOR I = 0 TO 4:  INPUT #1, DefHwName$(I): NEXT I           'array 0x4370 (5) (was N4370$)
L_027C: FOR I = 0 TO 2:  INPUT #1, MissileKillerName$(I): NEXT I           'array 0x4384 (3) (was N4384$)
L_02BE: FOR I = 0 TO 24: INPUT #1, GunName$(I): NEXT I           'array 0x4390 (25) (was N4390$)
L_0300: FOR I = 0 TO 53: INPUT #1, WeaponName$(I): NEXT I           'array 0x43F4 (54) (was N43F4$)
L_0342: FOR I = 0 TO 5:  INPUT #1, HandWeaponName$(I): NEXT I           'array 0x44CC (6) (was N44CC$)
L_0384: FOR I = 0 TO 3:  INPUT #1, SightingName$(I): NEXT I           'array 0x44E4 (4) (was N44E4$)
L_03C6: FOR I = 0 TO 15: INPUT #1, ArmorSuitName$(I): NEXT I           'array 0x44F4 (16) (was N44F4$)
L_0408: FOR I = 0 TO 10: INPUT #1, MiscItemName$(I): NEXT I           'array 0x4534 (11) (was N4534$)
L_044A: FOR I = 0 TO 99: INPUT #1, ItemName$(I): NEXT I           'array 0x4560 (100) (was N4560$)
L_048C: FOR I = 0 TO 49: INPUT #1, FindName$(I): NEXT I           'array 0x46F0 (50) (was N46F0$)
L_04CE: FOR I = 0 TO 22: INPUT #1, ShipType$(I): NEXT I           'array 0x47B8 (23) (was N47B8$)
L_0510: FOR I = 0 TO 22: INPUT #1, EquipName$(I): NEXT I           'array 0x4814 (23) (was N4814$)
L_0552: FOR I = 0 TO 6:  INPUT #1, AttrName$(I): NEXT I           'array 0x4870 (7) (was N4870$)
        ' each loop: FLOAD start -> store I(0xD2F8); FCMP I ? limit; jbe body; body = INPUT #1 (RT3F_B6 1; B7 n=1 type 04 = string;
        ' B8 -> [base + 4*CINT(I)]); I = I + 1. Limits are the INIT constants 13,15,8,3,4,4,2,24,53,5,3,15,10,99,49,22,22,6.
        ' The first loop starts at 1 (00F0 loads 0x495C = 1), all others at 0 (0xD300). 374 fields read of the 378 in NAME (verify lane recount).
L_0594: CLOSE #1
L_059A: OPEN "CHARNAME" FOR INPUT AS #1     'dx = "CHARNAME" (0xD338)
L_05AA: INPUT #1, ShipName$                 'B8 -> 0x488C                                     'ShipName$ was 0x488C (was CharName$)
L_05BB: FOR I = 1 TO 8: INPUT #1, CrewName$(I): NEXT I             'array 0x4288 (9), fields 1..8 of CHARNAME (was Crew$)
L_05FC: CLOSE #1
L_0602: BLOAD "LOGO", &H40F4                'CSNG(&H40F4); bx="LOGO"(0xD344); LOGO.BAS 81x19 CGA sprite -> array 0x40F4
L_0611: IF SoundOn <> 0 THEN GOSUB L_0E7F
L_0621: DriveName$(0) = "Hard Disk Drive       "       'SASSIGN 0xD34C <- 0xD358
        DriveName$(1) = "One Floppy Disk Drive "       '0xD350 <- 0xD372
        DriveName$(2) = "Two Floppy Disk Drives"       '0xD354 <- 0xD38C
        Adapter$(0)   = "Color Graphic Adaptor    "    '0xD3A6 <- 0xD3AE
        Adapter$(1)   = "Enhanced Graphics Adaptor"    '0xD3AA <- 0xD3CC
        SoundText$(0) = "Sound On "                    '0xD3EA <- 0xD3F2
        SoundText$(1) = "Sound Off"                    '0xD3EE <- 0xD400
L_0660: GOSUB L_07F4                        'TimerMark = TIMER
L_0663: IF INKEY$ <> "" THEN GOTO L_07FE    '0663 INKEY$; SCMP ? ""(0xD40E); je 0673 else jmp 07FE
L_0673: FOR J = 1 TO 100                    'J was 0xD416; limit 0xD41E = 100
L_067C:   GOSUB L_07AD                      'wait 2.4 s, feeding music; KeyHit = (INKEY$ <> "")
          IF KeyHit <> 0 THEN J = 199       '067F BOOL [D412]; 068C FMOV [D416] <- 199 (0xD41A)
        NEXT J                              '0695 J = J + 1; 06A6 FCMP J ? 100; jbe 067C
L_06AE: IF J > 150 THEN GOTO L_07FE         '06AE FCMP J ? 150 (0xD422); jbe 06BC else jmp 07FE
L_06BC: TunePlaying = 1                     'FMOV [D426] <- 1                                 'TunePlaying was 0xD426; FeedMusic returns at once while 0
L_06C5: PUT (28, 54), Frame1, PSET          'bx=0x87E8, dl=3 (verb 3 = PSET)
L_06DB: GOSUB L_07AD: IF KeyHit <> 0 THEN GOTO L_07FE
L_06EB: PUT (48, 58), Frame2, PSET          'bx=0x9BD8
L_0701: GOSUB L_07AD: IF KeyHit <> 0 THEN GOTO L_07FE
L_0711: PUT (48, 58), Frame3, PSET          'bx=0xADDA
L_0727: GOSUB L_07AD: IF KeyHit <> 0 THEN GOTO L_07FE
L_0737: PUT (44, 48), Frame4, PSET          'bx=0xBF7A
L_074D: FOR J = 1 TO 3
L_0756:   GOSUB L_07AD: IF KeyHit <> 0 THEN J = 99     '0766 FMOV [D416] <- 99 (0xD328)
        NEXT J                              '0778 store; 0783 FCMP J ? 3 (0xD30C)
L_0788: IF J > 50 THEN GOTO L_07FE          'FCMP J ? 50 (0xD42A)
L_0796: PUT (0, 0), TitlePic, PSET          'bx=0x4964, dl=3: restore the picture over the frames
L_07AA: GOTO L_06BC

' ---- subroutine: wait 2.4 s since TimerMark (feeding the music), then sample the keyboard ----
L_07AD: IF ABS(TIMER - TimerMark) < 2.4 THEN            '07AD TIMER; FSUB FAC-[D42E]; ABS; FCMP FAC?[D432=2.4]; jb 07C4
L_07C4:    IF SoundOn <> 0 THEN GOSUB L_0E7F
           GOTO L_07AD                                  '07D4/07D6 jmp 07AD
        END IF
L_07D8: KeyHit = (INKEY$ <> "")             '07D8 INKEY$; SCMP ? ""; dx=0; je -> 0 else dx=-1; CSNG -> [D412]   'KeyHit was 0xD412 (-1 = a key was pressed)
L_07F4: TimerMark = TIMER                   'also entered directly by GOSUB L_07F4 at 0660       'TimerMark was 0xD42E
L_07FD: RETURN

' ---- menu screen ----
L_07FE: CLS
L_0804: LINE (0, 1)-(319, 198), , B         '0804 (0,1); 0810 (319,198); 081B color -1, dx=0 -> B, style -1
L_0823: LINE (1, 2)-(318, 197), , B
L_0841: LINE (5, 29)-(314, 194), , B
L_0861: LINE (6, 30)-(313, 193), , B
L_087F: LINE (5, 5)-(314, 26), , BF         '0894 color -1, dx=1 -> BF (filled title bar in the default colour 3)
L_089F: PUT (120, 7), Logo, PSET            'bx=0x40F4 (LOGO 81x19), dl=3
L_08B5: PAINT (3, 3), 2, 3                  '08BE coords (3,3) via RT3E_8D; bx=2 paint colour, dx=3 border -> fills the frame band between the two box pairs
L_08CA: DriveSel = A(84)                    'FMOV [D436] <- [19A0]                           'DriveSel was 0xD436 (0 hard disk, 1 one floppy, 2 two floppies)
L_08D3: GOSUB L_0A34                        'clear the menu window (LINE (7,31)-(312,192),0,BF)
L_08D6: LOCATE 5, 2:  PRINT "Version 1.0                    3/18/88"
L_08F0: LOCATE 6, 2:  PRINT "copyright 1988 by Winston Douglas Wood"
L_0907: LOCATE 13, 8: PRINT "1-Play Star Command"
L_0921: LOCATE 14, 8: PRINT "2-Begin New Game"
L_0938: LOCATE 15, 8: PRINT "3-"; DriveName$(CINT(DriveSel))          '0949 6A "3-"; 095A 6E s$[0xD34C + 4*CINT(D436)] + NL
L_0960: LOCATE 16, 8: PRINT "4-"; SoundText$(CINT(SoundOff!))             '0xD3EA + 4*CINT([19C4])
L_0988: IF A(90) = 1 THEN LOCATE 17, 8: PRINT "5-"; Adapter$(CINT(UseEGA!))   '0988 FCMP [19B8]?1; je 0996; 0xD3A6 + 4*CINT([19B4])
L_09BE: LOCATE 23, 2: PRINT " portions of this product copyrighted"
L_09D8: LOCATE 24, 2: PRINT " by Microsoft Corporation   1982-1987";   '09E9 RT3F_6A = trailing semicolon (no scroll on row 24)
L_09EF: IF Speed < 1 THEN GOSUB L_0A56       '09EF FCMP [D520]?1; jb 09FD    'Speed was 0xD520: CPU calibration, done once
L_0A00: Choice = VAL(INKEY$)                 '0A00 INKEY$; VAL -> DAC; CSNG -> [D524]          'Choice was 0xD524
L_0A11: ON CINT(Choice) GOTO L_0A94, L_0B0A, L_0D2F, L_0D81, L_0DEF     '0A14 RT3F_5E n=5 (table CS offsets +0x10)
L_0A22: IF SoundOn <> 0 THEN GOSUB L_0E7F
L_0A32: GOTO L_0A00

' ---- subroutine: clear the menu window ----
L_0A34: LINE (7, 31)-(312, 192), 0, BF      '0A4A color 0, dx=1 -> BF, style -1
L_0A55: RETURN

' ---- subroutine: CPU speed calibration (count loop iterations in one TIMER second) ----
L_0A56: TimerMark = TIMER                    '0A56 store [D42E]
L_0A5F: IF TIMER = TimerMark THEN GOTO L_0A56   '0A5F..0A68: loop until the TIMER value changes (align to a tick)
L_0A6A: T1 = TIMER                           'T1 was 0xD528
L_0A73: Speed = Speed + 1                    '0A73 FADD [D520]+1; store [D520]
L_0A83: IF TIMER - T1 < 1 THEN GOTO L_0A73   '0A83 TIMER; FSUB FAC-[D528]; FCMP FAC?1; jb 0A73
L_0A93: RETURN

' ---- key 1: Play Star Command ----
L_0A94: A(84) = DriveSel                     'FMOV [19A0] <- [D436]
L_0A9D: DriveCfg! = 0                            '[19A4] <- 0
L_0AA6: StdDelay! = Speed                        '[19A8] <- [D520]
L_0AB1: A(87) = 0                            '[19AC] <- 0 (si = 0xD300)
L_0AB9: A(92) = 0                            '[19C0] <- 0
L_0ABF: Q0 = PLAY(0)                         '0ABF xor bx,bx; RT3D_44; CSNG -> [D52C]          'Q0 was 0xD52C: notes queued when leaving
L_0ACD: IF PLAY(0) = 0 OR Q0 - PLAY(0) > 2 THEN      '0ACD..0AF8: cx=-1 if PLAY(0)=0; bx=-1 if (Q0 - PLAY(0)) > 2 (0xD314); or bx,cx; jne 0AFF
L_0AFF:    CHAIN "STARPORT"                  'bx = "STARPORT" (0xD530); RT3E_0E
        ELSE
L_0B08:    GOTO L_0ACD                       'let the background music drain a little before chaining
        END IF
L_0B05: GOTO L_0B0A                          'compiler fallthrough after CHAIN (unreachable)

' ---- key 2: Begin New Game ----
L_0B0A: GOSUB L_0A34
L_0B0D: LOCATE 13, 2: PRINT "Starting a new game will erase your"
L_0B27: LOCATE 14, 2: PRINT "old characters. Start a new game?(Y/N)"
L_0B3E: GOSUB L_0CB9                         'YesNo = 1 for Y/y, 0 for N/n
L_0B41: IF YesNo = 0 THEN GOTO L_08D3        '0B44 FTEST [D58E]; jne 0B4C else jmp 08D3
L_0B4C: GOSUB L_0A34
L_0B4F: LOCATE 13, 2: PRINT "Are you sure you want to start a new"
L_0B69: LOCATE 14, 2: PRINT "game? (Y/N)"
L_0B80: GOSUB L_0CB9
L_0B83: IF YesNo = 0 THEN GOTO L_08D3
L_0B8E: GOSUB L_0A34
L_0B91: LOCATE 14, 3: PRINT "Starting a new game. Please wait."
L_0BA9: FOR I = 0 TO 8: CrewName$(I) = "": NEXT I            '0BB2 SASSIGN s$[0x4288 + 4*CINT(I)] <- ""(0xD40E); limit 0xD308 = 8 (was Crew$)
L_0BE6: ShipName$ = ""                                   'SASSIGN [488C] <- 0xD40E (was CharName$)
L_0BEF: SaveEGA = A(90)                                  'FMOV [D5F0] <- [19B8]                   'SaveEGA was 0xD5F0
L_0BF8: FOR I = 0 TO 2600: A(I) = 0: NEXT I              '0C02 di = 0x1850 + 4*CINT(I); FMOV <- 0; limit 0xD5F4 = 2600
L_0C34: CreditsHi! = 3                                        '[1988] <- 0xD30C
L_0C3D: CreditsLo! = 5000                                     '[198C] <- 0xD5F8
L_0C46: A(83) = 27                                       '[199C] <- 0xD5FC
L_0C4F: UseEGA! = SaveEGA                                  '[19B4] <- [D5F0]
L_0C58: A(90) = SaveEGA                                  '[19B8] <- [D5F0]
L_0C60: ChainArg! = 2                                      '[3AE8] <- 0xD314
L_0C69: SectorX! = 28                                     '[3AF0] <- 0xD600
L_0C74: SectorY! = 2                                      '[3AF4] <- 0xD314
L_0C7C: CursorCol! = 7                                      '[3AF8] <- 0xD604
L_0C85: CursorRow! = 7                                      '[3AFC] <- 0xD604
L_0C8B: SysCurX! = 6                                      '[3B00] <- 0xD334
L_0C94: SysCurY! = 6                                      '[3B04] <- 0xD334
L_0C9A: IF A(90) = 1 THEN GOSUB L_0E4B                   '0C9A si = bx = 0x19B8; FCMP ? 1; je 0CA7 -> palette
L_0CAA: SoundOn = 1                                      '[4958] <- 1
L_0CB3: GOSUB L_0E7F
L_0CB6: GOTO L_08D3

' ---- subroutine: Y/N prompt ----
L_0CB9: YesNo = 0                            'FMOV [D58E] <- 0                                 'YesNo was 0xD58E
L_0CC2: K$ = INKEY$                          'INKEY$ -> SASSIGN [D608]                          'K$ was 0xD608
L_0CCB: IF K$ = "n" OR K$ = "N" THEN RETURN  '0CD0/0CDC SCMP; cx/dx = -1 if equal; or; jne 0CEE (ret)
L_0CEF: IF K$ = "y" OR K$ = "Y" THEN YesNo = 1: RETURN    '0D13 FMOV [D58E] <- 1; ret
L_0D1D: IF SoundOn <> 0 THEN GOSUB L_0E7F
L_0D2D: GOTO L_0CB9

' ---- key 3: cycle drive type ----
L_0D2F: DriveSel = (DriveSel + 1) * ABS(DriveSel < MaxDrive)
        '0D2F FADD [D436]+1 -> T0 (RT3F_71 #80); FCMP [D436]?[4960]; bx=-1 if below; neg (ABS); CSNG; FMUL T0*FAC; store [D436]
        'with MaxDrive = 1 this toggles 0 <-> 1 only; DriveName$(2) "Two Floppy Disk Drives" is never reached from the menu
L_0D5C: LOCATE 15, 10: PRINT DriveName$(CINT(DriveSel))
L_0D7E: GOTO L_0A00

' ---- key 4: toggle sound ----
L_0D81: SoundOff! = 1 - SoundOff!                    'FSUB [495C]-[19C4] -> [19C4]
L_0D8F: SoundOn = 1 - SoundOn                'FSUB [495C]-[4958] -> [4958]
L_0D9E: LOCATE 16, 10: PRINT SoundText$(CINT(SoundOff!))
L_0DC0: IF SoundOn = 1 THEN                  '0DC4 FCMP [4958]?1; je 0DCC
L_0DCC:    TunePos = 0: GOSUB L_0E7F          'FMOV [D724] <- 0; call 0E7F      'TunePos was 0xD724
        ELSE
L_0DDB:    SOUND 99, 0                        'bx=99 (0x63), dx -> 0xD300 (0); RT3E_5F vol/voice omitted: silences the queue
        END IF
L_0DEC: GOTO L_0A00

' ---- key 5: toggle adapter (only when EGA detected) ----
L_0DEF: IF A(90) = 0 THEN GOTO L_0A00        'FTEST [19B8]; jne 0DFA else jmp 0A00
L_0DFA: UseEGA! = 1 - UseEGA!                    'FSUB [495C]-[19B4] -> [19B4]
L_0E06: LOCATE 17, 10: PRINT Adapter$(CINT(UseEGA!))
L_0E28: A(91) = ABS(UseEGA! <> A(90))          '0E2D FCMP [19B4]?[19B8]; bx=-1 if not equal; neg; CSNG -> [19BC]  (1 = player chose the non-detected adapter)
L_0E45: GOSUB L_0E4B
L_0E48: GOTO L_0A00

' ---- subroutine: palette for the chosen adapter ----
L_0E4B: PALETTE 1, CINT(UseEGA! * 6 + 3)       '0E51 FMUL [19B4]*[D334=6]; FADD +[D30C=3]; CINT; PALETTE 1,dx   -> 3 (CGA) / 9 (EGA)
L_0E6B: PALETTE 2, CINT(5 - UseEGA!)           '0E70 FSUB [D320=5]-[19B4]; CINT; PALETTE 2,dx                   -> 5 (CGA) / 4 (EGA)
L_0E7E: RETURN

' ---- subroutine: feed the background music queue, 3 tune characters at a time ----
L_0E7F: IF PLAY(0) > 31 OR TunePlaying = 0 THEN RETURN
        '0E7F xor bx,bx; RT3D_44 (PLAY(0) = notes still queued); cmp bx,31; dx=-1 if above; FTEST [D426]; bx=-1 if zero; or; jne 0EA2 (ret)
L_0EA3: Note$ = MID$(Tune$, CINT(TunePos + 1), 3)       '0EA3 FADD [D724]+1; CINT -> dx; MID$(0x4948, dx, 3) -> SASSIGN [D728]   'Note$ was 0xD728
L_0EC0: PLAY "X" + VARPTR$(Note$)                       '0EC2 VARPTR$(0xD728); SCAT "X"(0xD72C) + ...; RT3E_51
L_0ECE: TunePos = TunePos + 3                            'FADD [D724]+[D30C=3] -> [D724]
L_0EDC: IF LEN(Tune$) < TunePos THEN TunePos = 0        '0EDF LEN; CSNG; FCMP FAC?[D724]; jb 0EED -> FMOV [D724] <- 0 (0xD732)
L_0EF3: GOTO L_0E7F
```

## Reconstructed structure notes

- The attract loop timing: `L_07AD` returns only after 2.4 s (TIMER difference, constant 0xD432) have passed since the last mark, so the title picture stays up for up to 100 x 2.4 s = 4 minutes before the four-frame animation starts, and each frame is shown 2.4 s; the picture is restored with `PUT ..., PSET` and the cycle repeats until a key is pressed. Any key (INKEY$ <> "") sets KeyHit, which the FOR loops exit by forcing the counter past its limit (199 / 99).
- `SoundOn` is the complement of the saved `SoundOff!` ("Sound Off" when 1); the music is fed by `L_0E7F` whenever the background queue (`PLAY(0)`) drops to 31 notes or fewer, three characters of the tune per PLAY ("X" + VARPTR$ sub-string execution), wrapping at the end of the 174-char tune.
- `L_0A56` measures CPU speed once (iterations of a FADD loop in one TIMER second) into `Speed` (0xD520) and `L_0A94` passes it to the game modules as `StdDelay!`.
- Key 1 also writes `A(84)` = drive type, `DriveCfg!=0`, `A(87)=0`, `A(92)=0` (the data lane reads A(92) as "which disk is in drive A"), then chains to STARPORT.
- New game (key 2) zeroes all 2601 elements of A(), restores the EGA flags, and seeds `CreditsHi!=3, CreditsLo!=5000, A(83)=27, ChainArg!=2, SectorX!=28, SectorY!=2, CursorCol!=7, CursorRow!=7, SysCurX!=6, SysCurY!=6`. If the source used `DIM A(50,50)`, element 2214 = A(21,43), 2216..2221 = A(23..28,43) (index = row + 51*column). The meaning of these values belongs to the game modules (not derivable here).

## Screens

See `STARTUP_SCREENS.md`.

## Variables

| DS address | type | name used | evidence / confidence |
|---|---|---|---|
| 0x1850 + 4n | single array, COMMON | A(n) | CHARINFO.BAS BLOAD target (STARCOMM), 2601 singles; cleared by the FOR I=0 TO 2600 loop at 0BF8 (H) |
| 0x1988 / 0x198C / 0x199C | A(78) / A(79) / A(83) | CreditsHi! CreditsLo! A(83) | new-game defaults 3 / 5000 / 27: credits = CreditsHi!*30000 + CreditsLo! (SPACE SUB_16A6, crossref); A(83) is not read by any decoded module |
| 0x19A0 | A(84) | A(84) DriveType | copied to/from DriveSel; printed via DriveName$ (H) |
| 0x19A4 / 0x19AC / 0x19C0 | A(85) / A(87) / A(92) | DriveCfg! / - / (disk in drive, .STR stubs) | set to 0 when starting the game (H as stores); DriveCfg! selects the "A:"/"B:" prefix in every module (crossref) |
| 0x19A8 | A(86) | StdDelay! (Speed) | = calibration count (H); the modules' "Standard Delay Factor" (crossref) |
| 0x19B4 | A(89) | UseEGA! | drives PALETTE at 0E4B and the Adapter$ text (H) |
| 0x19B8 | A(90) | EGADetected | gates menu item 5 and the palette GOSUB (H) |
| 0x19BC | A(91) | AdapterPref | written `ABS(A(89) <> A(90))` at 0E28 (H) |
| 0x19C4 | A(93) | SoundOff! | SoundText$(A(93)): 0 "Sound On ", 1 "Sound Off" (H) |
| 0x3AE8, 0x3AF0..0x3B04 | A(2214), A(2216..2221) | ChainArg!, SectorX!/SectorY!/CursorCol!/CursorRow!/SysCurX!/SysCurY! | new-game defaults (H as stores); names per SPACE (crossref) |
| 0x40F4 | integer array (202 x 2 bytes, COMMON) | Logo | BLOAD "LOGO" target, PUT (120,7) (H; LOGO.BAS 81x19 CGA) |
| 0x4288 | string array (9) | CrewName$(0..8) (was Crew$) | INPUT #1 from CHARNAME fields 1..8; cleared on new game (H as I/O, name M) |
| 0x42AC | string array (14) | Rank$(1..13) | first 13 NAME fields; DATA_FILES.md says fields 0..13 are ranks (M) |
| 0x42E4 | string array (16) | Skill$(0..15) | next 16 NAME fields; DATA_FILES.md: 14..28 skills (M) |
| 0x4324 .. 0x4870 | 16 further string arrays (sizes 9,5,5,5,3,25,54,6,4,16,11,100,50,23,23,7) | ShipClassName$, ShipSize$, ShieldName$, DefHwName$, MissileKillerName$, GunName$, WeaponName$, HandWeaponName$, SightingName$, ArmorSuitName$, MiscItemName$, ItemName$, FindName$, ShipType$, EquipName$, AttrName$ (were N4324$ .. N4870$; crossref) | filled from NAME in file order (ship classes, equipment, missiles, guns, systems, attributes per DATA_FILES.md); exact assignment not proven here (L) |
| 0x488C | string | ShipName$ (was CharName$) | first CHARNAME field; cleared on new game (H) |
| 0x4948 | string | Tune$ | receives the 174-char PLAY literal 0x4896 (H) |
| 0x4958 | single | SoundOn | INT(1 - A(93)); toggled with A(93) (H) |
| 0x4960 | single | MaxDrive | set to 1 at 0073, only read in the drive toggle (H) |
| 0x4964 | array (BLOAD target) | TitlePic | BLOAD "title" at &H4964; PUT (0,0) (H; TITLE.BAS 320x200 CGA) |
| 0x87E8 / 0x9BD8 / 0xADDA / 0xBF7A | GET arrays inside the TITLE.BAS BLOAD | Frame1..Frame4 | PUT at (28,54) / (48,58) / (48,58) / (44,48); 0x87E8 = 0x4964 + 16004 = right after the picture, so TITLE.BAS carries four animation frames (sizes 5104, 4610, 4512 and <= 4972 bytes), not stale data (H for the addresses; flagged for the data lane) |
| 0xD2F8 | single | I | FOR loop counter of all INPUT loops and the new-game loops (H) |
| 0xD34C/D350/D354 | string array (3) | DriveName$(0..2) | assigned the three drive literals at 0621 (H) |
| 0xD3A6/D3AA | string array (2) | Adapter$(0..1) | CGA / EGA literals (H) |
| 0xD3EA/D3EE | string array (2) | SoundText$(0..1) | "Sound On " / "Sound Off" (H) |
| 0xD412 | single | KeyHit | -(INKEY$ <> "") set in 07AD (H) |
| 0xD416 | single | J | attract-loop counters (H) |
| 0xD426 | single | TunePlaying | set to 1 at 06BC; gates FeedMusic (H) |
| 0xD42E | single | TimerMark | TIMER sample for the 2.4 s waits and the calibration (H) |
| 0xD436 | single | DriveSel | menu copy of A(84) (H) |
| 0xD520 | single | Speed | calibration loop count (H) |
| 0xD524 | single | Choice | VAL(INKEY$) (H) |
| 0xD528 | single | T1 | TIMER at calibration start (H) |
| 0xD52C | single | Q0 | PLAY(0) at the moment key 1 is pressed (H) |
| 0xD58E | single | YesNo | 0/1 result of the Y/N prompt (H) |
| 0xD5F0 | single | SaveEGA | A(90) saved across the array clear (H) |
| 0xD608 | string | K$ | INKEY$ in the Y/N prompt (H) |
| 0xD724 | single | TunePos | position in Tune$ (H) |
| 0xD728 | string | Note$ | 3-char slice of Tune$ (H) |
| constants | | | 0x495C=1, 0xD2FC=13, 0xD300=0, 0xD304=15, 0xD308=8, 0xD30C=3, 0xD310=4, 0xD314=2, 0xD318=24, 0xD31C=53, 0xD320=5, 0xD324=10, 0xD328=99, 0xD32C=49, 0xD330=22, 0xD334=6, 0xD41A=199, 0xD41E=100, 0xD422=150, 0xD42A=50, 0xD432=2.4, 0xD5F4=2600, 0xD5F8=5000, 0xD5FC=27, 0xD600=28, 0xD604=7, 0xD732=0 (MODULE_CONSTANTS.md INIT records) |

## Unknowns

- No runtime call is left unrendered (59 distinct calls, all in the ledger). Two renderings rest on this lane's new evidence, recorded back into `RT_LEDGER.md`: `RT3E_58` verb numbers (DS tables 0x368/0x372 in BRUN30 map 0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR) and `RT3D_44 = PLAY(n)` (the music-queue test in L_0E7F and the drain loop in L_0ACD only make sense as PLAY(0); the former STICK reading is withdrawn).
- `SOUND 99, 0` at 0DDB: the BASIC statement is certain; that it silences the background queue is the expected QB3 behaviour, not verified in the runtime body.
- The meaning of the new-game seed values and of CreditsHi!, CreditsLo!, A(83), DriveCfg!, A(87), A(2214..2221) is for the game-module lanes.
- Which NAME field groups land in the 16 arrays ShipClassName$..AttrName$ is not pinned beyond file order.
- The `jmp 0xb0a` at 0B05 after CHAIN and the bytes 0xEF5..0xEFF are unreachable; not transcribed as statements.

## RESUME

Nothing left: STARCOMM (0x40..0x127) and STARTUP (0x40..0xEF4) are fully transcribed, screens inventoried, committed in c19a327. Next listing offset if anyone re-checks: STARTUP 0xEF5 = end of code (unreachable leftovers 0xEF5..0xEFF). Open item for the data lane only: TITLE.BAS frames at DS 0x87E8/0x9BD8/0xADDA/0xBF7A.
