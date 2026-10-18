# STARTUP — verification (lane verify, Opus, 2026-10-15)

Inputs: `decode/pseudo/STARTUP.bas.md` and `STARTUP_SCREENS.md` (lane mod-startup), `decode/listings/STARTUP.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` (STARTUP: 34 literals, 27 constants), `decode/data/DATA_FILES.md`.

**Sample:** none. The pseudocode block is about 215 lines (under 300), so every labelled statement was checked: 167 of 167 (no seed needed). Method: I read the whole listing 0x40..0xEF4 and derived each statement from the bytes, the ledger and the INIT constants first. Only then did I compare it with the pseudocode text. Special sites, all checked: OPEN 0x00E0 / 0x059A, all 20 INPUT #1 sites, BLOAD 0x00AD / 0x0602, ON GOTO 0x0A11, CHAIN 0x0AFF.

## Summary

- 167 statements: **166 AGREE, 1 DISAGREE (0x07D8, sign of the KeyHit expression, behaviour unaffected), 0 UNSURE**.
- Two side findings outside the statement lines: a comment says 375 NAME fields are read, but the 18 loops read **374**; and STARTUP_SCREENS.md truncates the title credit to "Liebenau". Everything else checked out: variables (every row of the Variables table has listing support), screen text (all 21 printed literals match the string table), and the 18 NAME array sizes (each base + 4·size equals the next base).
- Fix requests: one for 0x07D8 and one for the 375 → 374 comment (see STATUS.md). The SCREENS nit is cosmetic.

## Disagreements

1. **0x07D8** `KeyHit = -(INKEY$ <> "")`: the bytes `ba 00 00 / 74 01 / 4a` give dx = -1 when INKEY$ <> "", then CSNG and store, so KeyHit = -1 on a key. In BASIC, `(INKEY$ <> "")` already evaluates to -1, so the unary minus makes the rendered expression +1. Correct rendering: `KeyHit = (INKEY$ <> "")`. The line's own comment ("-1 = a key was pressed") is right. KeyHit is only read through BOOL (nonzero test), so game behaviour is unchanged.
2. **Comment after L_0552** "375 fields read of the 378 in NAME". The loop counts are 13+16+9+4+5+5+3+25+54+6+4+16+11+100+50+23+23+7 = **374**: the first loop runs 1..13 (13 fields), and all others run 0..limit. The limits quoted in that comment (13,15,8,...,6) are correct; only the total is off by one.

Side note, not counted: STARTUP_SCREENS.md Screen 1 quotes the credit as "Eric Liebenau". SPRITES.md and the render read "Liebenauer".

## Variable evidence spot-check

Xrefs (grep of the DS address in the listing) agree with the Variables table. MaxDrive 0x4960: written 0073, read 0D38 only. TunePlaying 0xD426: written 06BC, read 0E8D. Speed 0xD520: 09F2 / 0A76 / 0AAB. AdapterPref A(91) 0x19BC: written 0E3F only. DriveSel 0xD436: 08CA / 094C / 0A97 / 0D32. TunePos 0xD724: 0DCC / 0EA6 / 0ED1. SaveEGA 0xD5F0: 0BEF / 0C52. SoundOn 0x4958: computed 005E, toggled 0D93, set 0CAA, tested elsewhere.

The string type of the INPUT targets (B7 type byte 04) is proven for 0x4288 and 0x488C, because both receive SASSIGN "" at 0BB2 / 0BE6. The other 17 NAME arrays use the same type byte 04, so string type for them is consistent. A(n) indices: (addr - 0x1850)/4 rechecked for 78, 79, 83, 84..93, 2214, 2216..2221.

The array sizes N4324$..N4870$ match the gaps between bases. Their semantic names stay L, as the module lane says.

## Screens check

All texts in STARTUP_SCREENS.md are byte-equal to the MODULE_CONSTANTS literals (Version, copyright, 1-/2-/3-/4-/5-, the drive/adapter/sound strings with their trailing spaces, the Microsoft notice, the four new-game prompts). The LOCATE rows and columns match the ARGPUSH/LOCATE pairs (5,2 / 6,2 / 13..17,8 / 23,2 / 24,2 / 13,2 / 14,2 / 14,3 / 15..17,10). The geometry matches the LINE, PUT and PAINT operands in the table below.

## Verdict table

Bytes = the first instruction of the statement. The "pseudocode" column is the statement text without its comment.

| offset | bytes | my derivation (listing + ledger + INIT constants) | pseudocode | verdict | note |
|---|---|---|---|---|---|
| 0040 | `bb 96 48` | SASSIGN [4948]<-lit 0x4896 (174-char tune) | `Tune$ = "O1 E3>D+8E4<B4>C4<G+4 A4 E4 O1F3> E8D4< F4F+3>E8D4<F+4G3> F8E4< G4G+3>F8E4< B4 O2C4<A4> C4 E4 A3P64<A8P64A4>C4< B4G+4>F4E4< A4 E4P64 E3 A8P64 A4 E4P64 E3G+8A4>C4< B4E4< A2 P1"` | AGREE |  |
| 0049 | `bb 4c 49` | PLAY lit 0x494C "MBMLT126" | `PLAY "MBMLT126"` | AGREE |  |
| 004F | `bf c4 19` | FSUB [495C]=1 - [19C4]=A(93); INT; FSTORE [4958] | `SoundOn = INT(1 - A(93))` | AGREE |  |
| 0064 | `8b f7` | BOOL [4958]; jne -> call 0E7F | `IF SoundOn <> 0 THEN GOSUB L_0E7F` | AGREE |  |
| 0073 | `bf 60 49` | FMOV [4960]<-[495C]=1 (only other xref 0D38 = read) | `MaxDrive = 1` | AGREE |  |
| 007C | `bb 01 00` | bx=1; RT3E_5B = SCREEN 1 | `SCREEN 1` | AGREE |  |
| 0082 | `bb ff ff` | bx=-1; RT3E_32 = CLS | `CLS` | AGREE |  |
| 0088 | `33 db` | bx=0; RT3E_3C = KEY OFF | `KEY OFF` | AGREE |  |
| 008D | `bf 5c 49` | FCMP [19B4]=A(89) ? 1; je 009B: PALETTE 1,9 / 2,4; else jmp 00AD | `IF A(89) = 1 THEN PALETTE 1, 9: PALETTE 2, 4` | AGREE |  |
| 00AD | `bb 64 49` | CSNG 0x4964 -> FAC; bx=lit "title"; dx=1A; RT3E_1A BLOAD | `BLOAD "title", &H4964` | AGREE |  |
| 00BC | `33 db` | coord (0,0) ints; bx=4964; dl=4 -> PUT verb 4 = XOR | `PUT (0, 0), TitlePic, XOR` | AGREE |  |
| 00D0 | `be 58 49` | BOOL [4958]; call 0E7F | `IF SoundOn <> 0 THEN GOSUB L_0E7F` | AGREE |  |
| 00E0 | `33 db` | RT3E_20 bl=0 (INPUT); cx=0; bx=#1; dx=lit "NAME"; RT3E_1E | `OPEN "NAME" FOR INPUT AS #1` | AGREE |  |
| 00F0 | `be 5c 49` | FLOAD 1; I=[D2F8]; FCMP I?13; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x42AC+4*CINT(I)]; I=I+1 | `FOR I = 1 TO 13: INPUT #1, Rank$(I): NEXT I` | AGREE |  |
| 0132 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?15; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x42E4+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 15: INPUT #1, Skill$(I): NEXT I` | AGREE |  |
| 0174 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?8; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4324+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 8:  INPUT #1, N4324$(I): NEXT I` | AGREE |  |
| 01B6 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?3; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4348+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 3:  INPUT #1, N4348$(I): NEXT I` | AGREE |  |
| 01F8 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?4; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x435C+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 4:  INPUT #1, N435C$(I): NEXT I` | AGREE |  |
| 023A | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?4; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4370+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 4:  INPUT #1, N4370$(I): NEXT I` | AGREE |  |
| 027C | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?2; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4384+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 2:  INPUT #1, N4384$(I): NEXT I` | AGREE |  |
| 02BE | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?24; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4390+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 24: INPUT #1, N4390$(I): NEXT I` | AGREE |  |
| 0300 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?53; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x43F4+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 53: INPUT #1, N43F4$(I): NEXT I` | AGREE |  |
| 0342 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?5; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x44CC+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 5:  INPUT #1, N44CC$(I): NEXT I` | AGREE |  |
| 0384 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?3; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x44E4+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 3:  INPUT #1, N44E4$(I): NEXT I` | AGREE |  |
| 03C6 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?15; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x44F4+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 15: INPUT #1, N44F4$(I): NEXT I` | AGREE |  |
| 0408 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?10; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4534+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 10: INPUT #1, N4534$(I): NEXT I` | AGREE |  |
| 044A | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?99; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4560+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 99: INPUT #1, N4560$(I): NEXT I` | AGREE |  |
| 048C | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?49; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x46F0+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 49: INPUT #1, N46F0$(I): NEXT I` | AGREE |  |
| 04CE | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?22; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x47B8+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 22: INPUT #1, N47B8$(I): NEXT I` | AGREE |  |
| 0510 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?22; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4814+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 22: INPUT #1, N4814$(I): NEXT I` | AGREE |  |
| 0552 | `be 00 d3` | FLOAD 0; I=[D2F8]; FCMP I?6; jbe body: INPUT #1 (B6 1, B7 n=1 type 04), B8 -> [0x4870+4*CINT(I)]; I=I+1 | `FOR I = 0 TO 6:  INPUT #1, N4870$(I): NEXT I` | AGREE |  |
| 0594 | `bb 01 00` | bx=1; RT3E_21 CLOSE #1 | `CLOSE #1` | AGREE |  |
| 059A | `33 db` | mode 0 INPUT; bx=1; dx=lit "CHARNAME"; OPEN | `OPEN "CHARNAME" FOR INPUT AS #1` | AGREE |  |
| 05AA | `bb 01 00` | INPUT #1 type 04 -> B8 [488C] (488C later gets SASSIGN "" at 0BE6, so it is a string) | `INPUT #1, CharName$` | AGREE |  |
| 05BB | `be 5c 49` | FOR I=1 TO 8 (FLOAD 1, limit D308=8): INPUT #1 -> [0x4288+4*CINT(I)] | `FOR I = 1 TO 8: INPUT #1, Crew$(I): NEXT I` | AGREE |  |
| 05FC | `bb 01 00` | CLOSE #1 | `CLOSE #1` | AGREE |  |
| 0602 | `bb f4 40` | CSNG 0x40F4; bx=lit "LOGO"; BLOAD | `BLOAD "LOGO", &H40F4` | AGREE |  |
| 0611 | `be 58 49` | BOOL [4958]; call 0E7F | `IF SoundOn <> 0 THEN GOSUB L_0E7F` | AGREE |  |
| 0621 | `bb 58 d3` | 7 x SASSIGN: D34C/D350/D354 <- drive lits, D3A6/D3AA <- adapter lits, D3EA/D3EE <- sound lits | `DriveName$(0) = "Hard Disk Drive       "` | AGREE |  |
| 0660 | `e8 91 01` | call 07F4 (TimerMark = TIMER; ret) | `GOSUB L_07F4` | AGREE |  |
| 0663 | `cd 3d 06` | INKEY$ SCMP ""; je 0673 else jmp 07FE | `IF INKEY$ <> "" THEN GOTO L_07FE` | AGREE |  |
| 0673 | `be 5c 49` | FLOAD 1 -> J [D416]; limit D41E=100; NEXT at 0695..06AC | `FOR J = 1 TO 100` | AGREE |  |
| 067C | `e8 2e 01` | call 07AD; BOOL [D412]; jne -> FMOV [D416]<-[D41A]=199 | `GOSUB L_07AD` | AGREE |  |
| 06AE | `bf 22 d4` | FCMP J ? [D422]=150; jbe 06BC else jmp 07FE | `IF J > 150 THEN GOTO L_07FE` | AGREE |  |
| 06BC | `bf 26 d4` | FMOV [D426]<-1 | `TunePlaying = 1` | AGREE |  |
| 06C5 | `bb 1c 00` | coord (0x1C,0x36)=(28,54); bx=87E8; dl=3 PSET | `PUT (28, 54), Frame1, PSET` | AGREE |  |
| 06DB | `e8 cf 00` | call 07AD; BOOL [D412]; je 06EB else jmp 07FE | `GOSUB L_07AD: IF KeyHit <> 0 THEN GOTO L_07FE` | AGREE |  |
| 06EB | `bb 30 00` | coord (0x30,0x3A)=(48,58); bx=9BD8; dl=3 | `PUT (48, 58), Frame2, PSET` | AGREE |  |
| 0701 | `e8 a9 00` | call 07AD; BOOL; jmp 07FE if set | `GOSUB L_07AD: IF KeyHit <> 0 THEN GOTO L_07FE` | AGREE |  |
| 0711 | `bb 30 00` | coord (48,58); bx=ADDA; dl=3 | `PUT (48, 58), Frame3, PSET` | AGREE |  |
| 0727 | `e8 83 00` | call 07AD; BOOL; jmp 07FE if set | `GOSUB L_07AD: IF KeyHit <> 0 THEN GOTO L_07FE` | AGREE |  |
| 0737 | `bb 2c 00` | coord (0x2C,0x30)=(44,48); bx=BF7A; dl=3 | `PUT (44, 48), Frame4, PSET` | AGREE |  |
| 074D | `be 5c 49` | FLOAD 1 -> J; limit D30C=3 | `FOR J = 1 TO 3` | AGREE |  |
| 0756 | `e8 54 00` | call 07AD; BOOL [D412]; jne -> J <- [D328]=99 | `GOSUB L_07AD: IF KeyHit <> 0 THEN J = 99` | AGREE |  |
| 0788 | `bf 2a d4` | FCMP J ? [D42A]=50; jbe 0796 else jmp 07FE | `IF J > 50 THEN GOTO L_07FE` | AGREE |  |
| 0796 | `33 db` | coord (0,0); bx=4964; dl=3 PSET | `PUT (0, 0), TitlePic, PSET` | AGREE |  |
| 07AA | `e9 0f ff` | jmp 06BC | `GOTO L_06BC` | AGREE |  |
| 07AD | `cd 3d 43` | TIMER; FSUB FAC-[D42E]; ABS; FCMP FAC?[D432]=2.4; jb 07C4 else 07D8 | `IF ABS(TIMER - TimerMark) < 2.4 THEN` | AGREE |  |
| 07C4 | `be 58 49` | BOOL [4958] -> call 0E7F; jmp 07AD (both paths) | `IF SoundOn <> 0 THEN GOSUB L_0E7F` | AGREE |  |
| 07D8 | `cd 3d 06` | INKEY$ SCMP ""; dx=0, je skip, else dec dx -> -1; CSNG; FSTORE [D412]. Stored value is -1 on a key, i.e. KeyHit = (INKEY$ <> ""); -(INKEY$ <> "") would be +1 | `KeyHit = -(INKEY$ <> "")` | DISAGREE | sign of the BASIC expression is wrong (its own comment "-1 = a key was pressed" is right); KeyHit is only tested with BOOL, so behaviour is unaffected |
| 07F4 | `cd 3d 43` | TIMER; FSTORE [D42E] | `TimerMark = TIMER` | AGREE |  |
| 07FD | `c3` | ret | `RETURN` | AGREE |  |
| 07FE | `bb ff ff` | bx=-1 CLS | `CLS` | AGREE |  |
| 0804 | `33 db` | (0,1)-(0x13F,0xC6)=(319,198); dx=ax=0 -> B; bx=-1 colour default; cx=-1 style | `LINE (0, 1)-(319, 198), , B` | AGREE |  |
| 0823 | `8b c8` | (1,2)-(318,197) B | `LINE (1, 2)-(318, 197), , B` | AGREE |  |
| 0841 | `bb 05 00` | (5,0x1D=29)-(314,194) B | `LINE (5, 29)-(314, 194), , B` | AGREE |  |
| 0861 | `8b c8` | (6,30)-(313,193) B | `LINE (6, 30)-(313, 193), , B` | AGREE |  |
| 087F | `bb 05 00` | (5,5)-(314,0x1A=26); bx=-1, dx=1 -> BF | `LINE (5, 5)-(314, 26), , BF` | AGREE |  |
| 089F | `bb 78 00` | coord (0x78=120,7); bx=40F4; dl=3 | `PUT (120, 7), Logo, PSET` | AGREE |  |
| 08B5 | `bb 03 00` | RT3E_8D (3,3); bx=2 dx=3; PAINT | `PAINT (3, 3), 2, 3` | AGREE |  |
| 08CA | `bf 36 d4` | FMOV [D436]<-[19A0]=A(84) | `DriveSel = A(84)` | AGREE |  |
| 08D3 | `e8 5e 01` | call 0A34 | `GOSUB L_0A34` | AGREE |  |
| 08D6 | `bb 05 00` | ARGPUSH 5; LOCATE exec 2; PRINT lit D43A +NL | `LOCATE 5, 2:  PRINT "Version 1.0                    3/18/88"` | AGREE |  |
| 08F0 | `bb 06 00` | ARGPUSH 6; bx=dx(=2); LOCATE; PRINT lit D464 | `LOCATE 6, 2:  PRINT "copyright 1988 by Winston Douglas Wood"` | AGREE |  |
| 0907 | `bb 0d 00` | LOCATE 13,8; PRINT lit D48E | `LOCATE 13, 8: PRINT "1-Play Star Command"` | AGREE |  |
| 0921 | `bb 0e 00` | LOCATE 14,8 (bx=dx=8); PRINT D4A6 | `LOCATE 14, 8: PRINT "2-Begin New Game"` | AGREE |  |
| 0938 | `bb 0f 00` | LOCATE 15,8; PRINT "3-"; s$[D34C+4*CINT([D436])] +NL | `LOCATE 15, 8: PRINT "3-"; DriveName$(CINT(DriveSel))` | AGREE |  |
| 0960 | `bb 10 00` | LOCATE 16,8; PRINT "4-"; s$[D3EA+4*CINT([19C4])] | `LOCATE 16, 8: PRINT "4-"; SoundText$(CINT(A(93)))` | AGREE |  |
| 0988 | `bf 5c 49` | FCMP [19B8]?1; je 0996: LOCATE 17,8; PRINT "5-"; s$[D3A6+4*CINT([19B4])] | `IF A(90) = 1 THEN LOCATE 17, 8: PRINT "5-"; Adapter$(CINT(A(89)))` | AGREE |  |
| 09BE | `bb 17 00` | LOCATE 0x17=23,2; PRINT D4CC +NL | `LOCATE 23, 2: PRINT " portions of this product copyrighted"` | AGREE |  |
| 09D8 | `bb 18 00` | LOCATE 24,2; PRINT D4F6 with RT3F_6A (;) ; PRINT end | `LOCATE 24, 2: PRINT " by Microsoft Corporation   1982-1987";` | AGREE |  |
| 09EF | `bf 5c 49` | FCMP [D520]?1; jb -> call 0A56 | `IF Speed < 1 THEN GOSUB L_0A56` | AGREE |  |
| 0A00 | `cd 3d 06` | INKEY$; VAL -> DAC; CSNG; FSTORE [D524] | `Choice = VAL(INKEY$)` | AGREE |  |
| 0A11 | `cd 3f 75` | CINT [D524]; RT3F_5E n=5 -> 0A94 0B0A 0D2F 0D81 0DEF | `ON CINT(Choice) GOTO L_0A94, L_0B0A, L_0D2F, L_0D81, L_0DEF` | AGREE |  |
| 0A22 | `be 58 49` | BOOL [4958]; call 0E7F | `IF SoundOn <> 0 THEN GOSUB L_0E7F` | AGREE |  |
| 0A32 | `eb cc` | jmp 0A00 | `GOTO L_0A00` | AGREE |  |
| 0A34 | `bb 07 00` | (7,0x1F=31)-(0x138=312,0xC0=192); bx=0 colour, dx=1 BF, cx=-1 | `LINE (7, 31)-(312, 192), 0, BF` | AGREE |  |
| 0A55 | `c3` | ret | `RETURN` | AGREE |  |
| 0A56 | `cd 3d 43` | TIMER; FSTORE [D42E] | `TimerMark = TIMER` | AGREE |  |
| 0A5F | `cd 3d 43` | TIMER; FCMP FAC?[D42E]; je 0A56 | `IF TIMER = TimerMark THEN GOTO L_0A56` | AGREE |  |
| 0A6A | `cd 3d 43` | TIMER; FSTORE [D528] | `T1 = TIMER` | AGREE |  |
| 0A73 | `bf 5c 49` | FADD [D520]+1; xchg -> FSTORE [D520]; bx=495C | `Speed = Speed + 1` | AGREE |  |
| 0A83 | `cd 3d 43` | TIMER; FSUB FAC-[D528]; FCMP FAC?[495C]=1; jb 0A73 | `IF TIMER - T1 < 1 THEN GOTO L_0A73` | AGREE |  |
| 0A93 | `c3` | ret | `RETURN` | AGREE |  |
| 0A94 | `bf a0 19` | FMOV [19A0]<-[D436] | `A(84) = DriveSel` | AGREE |  |
| 0A9D | `bf a4 19` | FMOV [19A4]<-[D300]=0 | `A(85) = 0` | AGREE |  |
| 0AA6 | `bf a8 19` | bx=si(D300); FMOV [19A8]<-[D520] | `A(86) = Speed` | AGREE |  |
| 0AB1 | `8b f3` | si=bx=D300; FMOV [19AC]<-0 | `A(87) = 0` | AGREE |  |
| 0AB9 | `bf c0 19` | FMOV [19C0]<-0 (si still D300) | `A(92) = 0` | AGREE |  |
| 0ABF | `33 db` | bx=0; RT3D_44 PLAY(0); CSNG; FSTORE [D52C] | `Q0 = PLAY(0)` | AGREE |  |
| 0ACD | `33 db` | cx=-1 if PLAY(0)=0; FAC=[D52C]-CSNG(PLAY(0)); FCMP FAC?[D314]=2; bx=-1 if above; or; jne 0AFF else 0B08 | `IF PLAY(0) = 0 OR Q0 - PLAY(0) > 2 THEN` | AGREE |  |
| 0AFF | `bb 30 d5` | bx=lit "STARPORT"; RT3E_0E CHAIN | `CHAIN "STARPORT"` | AGREE |  |
| 0B08 | `eb c3` | jmp 0ACD | `GOTO L_0ACD` | AGREE |  |
| 0B05 | `e9 02 00` | jmp 0B0A (after CHAIN: unreachable) | `GOTO L_0B0A` | AGREE |  |
| 0B0A | `e8 27 ff` | call 0A34 | `GOSUB L_0A34` | AGREE |  |
| 0B0D | `bb 0d 00` | LOCATE 13,2; PRINT D53C | `LOCATE 13, 2: PRINT "Starting a new game will erase your"` | AGREE |  |
| 0B27 | `bb 0e 00` | LOCATE 14,2; PRINT D564 | `LOCATE 14, 2: PRINT "old characters. Start a new game?(Y/N)"` | AGREE |  |
| 0B3E | `e8 78 01` | call 0CB9 | `GOSUB L_0CB9` | AGREE |  |
| 0B41 | `be 8e d5` | FTEST [D58E]; jne 0B4C else jmp 08D3 | `IF YesNo = 0 THEN GOTO L_08D3` | AGREE |  |
| 0B4C | `e8 e5 fe` | call 0A34 | `GOSUB L_0A34` | AGREE |  |
| 0B4F | `bb 0d 00` | LOCATE 13,2; PRINT D592 | `LOCATE 13, 2: PRINT "Are you sure you want to start a new"` | AGREE |  |
| 0B69 | `bb 0e 00` | LOCATE 14,2; PRINT D5BA | `LOCATE 14, 2: PRINT "game? (Y/N)"` | AGREE |  |
| 0B80 | `e8 36 01` | call 0CB9 | `GOSUB L_0CB9` | AGREE |  |
| 0B83 | `be 8e d5` | FTEST [D58E]; jne 0B8E else jmp 08D3 | `IF YesNo = 0 THEN GOTO L_08D3` | AGREE |  |
| 0B8E | `e8 a3 fe` | call 0A34 | `GOSUB L_0A34` | AGREE |  |
| 0B91 | `bb 0e 00` | LOCATE 14,3; PRINT D5CA | `LOCATE 14, 3: PRINT "Starting a new game. Please wait."` | AGREE |  |
| 0BA9 | `be 00 d3` | FLOAD 0; I; limit D308=8; body SASSIGN [0x4288+4*CINT(I)] <- "" (D40E) | `FOR I = 0 TO 8: Crew$(I) = "": NEXT I` | AGREE |  |
| 0BE6 | `bb 0e d4` | SASSIGN [488C] <- "" | `CharName$ = ""` | AGREE |  |
| 0BEF | `bf f0 d5` | FMOV [D5F0]<-[19B8] | `SaveEGA = A(90)` | AGREE |  |
| 0BF8 | `be 00 d3` | FLOAD 0; limit D5F4=2600; body FMOV [0x1850+4*CINT(I)] <- 0 | `FOR I = 0 TO 2600: A(I) = 0: NEXT I` | AGREE |  |
| 0C34 | `bf 88 19` | FMOV [1988]=A(78) <- [D30C]=3 | `A(78) = 3` | AGREE |  |
| 0C3D | `bf 8c 19` | FMOV [198C]=A(79) <- [D5F8]=5000 | `A(79) = 5000` | AGREE |  |
| 0C46 | `bf 9c 19` | FMOV [199C]=A(83) <- [D5FC]=27 | `A(83) = 27` | AGREE |  |
| 0C4F | `bf b4 19` | FMOV [19B4]=A(89) <- [D5F0] | `A(89) = SaveEGA` | AGREE |  |
| 0C58 | `bf b8 19` | FMOV [19B8]=A(90) <- [D5F0] (si unchanged) | `A(90) = SaveEGA` | AGREE |  |
| 0C60 | `bf e8 3a` | FMOV [3AE8]=A(2214) <- [D314]=2 | `A(2214) = 2` | AGREE |  |
| 0C69 | `bf f0 3a` | dx=si=D314; FMOV [3AF0]=A(2216) <- [D600]=28 | `A(2216) = 28` | AGREE |  |
| 0C74 | `8b f2` | si=dx=D314; FMOV [3AF4]=A(2217) <- 2 | `A(2217) = 2` | AGREE |  |
| 0C7C | `bf f8 3a` | FMOV [3AF8]=A(2218) <- [D604]=7 | `A(2218) = 7` | AGREE |  |
| 0C85 | `bf fc 3a` | FMOV [3AFC]=A(2219) <- 7 (si unchanged) | `A(2219) = 7` | AGREE |  |
| 0C8B | `bf 00 3b` | FMOV [3B00]=A(2220) <- [D334]=6 | `A(2220) = 6` | AGREE |  |
| 0C94 | `bf 04 3b` | FMOV [3B04]=A(2221) <- 6 | `A(2221) = 6` | AGREE |  |
| 0C9A | `8b f3` | si=bx=19B8; FCMP ?1; je -> call 0E4B | `IF A(90) = 1 THEN GOSUB L_0E4B` | AGREE |  |
| 0CAA | `bf 58 49` | FMOV [4958]<-1 | `SoundOn = 1` | AGREE |  |
| 0CB3 | `e8 c9 01` | call 0E7F | `GOSUB L_0E7F` | AGREE |  |
| 0CB6 | `e9 1a fc` | jmp 08D3 | `GOTO L_08D3` | AGREE |  |
| 0CB9 | `bf 8e d5` | FMOV [D58E]<-0 | `YesNo = 0` | AGREE |  |
| 0CC2 | `cd 3d 06` | INKEY$; SASSIGN [D608] | `K$ = INKEY$` | AGREE |  |
| 0CCB | `8b c2` | SCMP K$?"n" cx=-1 if eq; SCMP K$?"N" dx=-1 if eq; or; jne 0CEE ret | `IF K$ = "n" OR K$ = "N" THEN RETURN` | AGREE |  |
| 0CEF | `bb 18 d6` | SCMP "y"/"Y"; or; jne 0D13: FMOV [D58E]<-1; ret | `IF K$ = "y" OR K$ = "Y" THEN YesNo = 1: RETURN` | AGREE |  |
| 0D1D | `be 58 49` | BOOL [4958]; call 0E7F | `IF SoundOn <> 0 THEN GOSUB L_0E7F` | AGREE |  |
| 0D2D | `eb 8a` | jmp 0CB9 | `GOTO L_0CB9` | AGREE |  |
| 0D2F | `bf 5c 49` | FADD [D436]+1 -> T80; FCMP [D436]?[4960]; bx=-1 if below; neg; CSNG; FMUL T80*FAC; FSTORE [D436] | `DriveSel = (DriveSel + 1) * ABS(DriveSel < MaxDrive)` | AGREE |  |
| 0D5C | `bb 0f 00` | LOCATE 15,10; PRINT s$[D34C+4*CINT([D436])] | `LOCATE 15, 10: PRINT DriveName$(CINT(DriveSel))` | AGREE |  |
| 0D7E | `e9 7f fc` | jmp 0A00 | `GOTO L_0A00` | AGREE |  |
| 0D81 | `bf c4 19` | FSUB [495C]-[19C4]; FSTORE [19C4] | `A(93) = 1 - A(93)` | AGREE |  |
| 0D8F | `8b f3` | FSUB [495C]-[4958]; FSTORE [4958] | `SoundOn = 1 - SoundOn` | AGREE |  |
| 0D9E | `bb 10 00` | LOCATE 0x10=16,10; PRINT s$[D3EA+4*CINT([19C4])] | `LOCATE 16, 10: PRINT SoundText$(CINT(A(93)))` | AGREE |  |
| 0DC0 | `87 f9` | FCMP [4958]?[495C]=1; je 0DCC else 0DDB | `IF SoundOn = 1 THEN` | AGREE |  |
| 0DCC | `bf 24 d7` | FMOV [D724]<-0; call 0E7F; jmp 0DEC | `TunePos = 0: GOSUB L_0E7F` | AGREE |  |
| 0DDB | `bb 63 00` | bx=0x63=99; dx=D300 (0); RT3E_5E; bx=dx=-1; RT3E_5F | `SOUND 99, 0` | AGREE |  |
| 0DEC | `e9 11 fc` | jmp 0A00 | `GOTO L_0A00` | AGREE |  |
| 0DEF | `be b8 19` | FTEST [19B8]; jne 0DFA else jmp 0A00 | `IF A(90) = 0 THEN GOTO L_0A00` | AGREE |  |
| 0DFA | `bf b4 19` | FSUB [495C]-[19B4]; FSTORE [19B4] | `A(89) = 1 - A(89)` | AGREE |  |
| 0E06 | `bb 11 00` | LOCATE 0x11=17,10; PRINT s$[D3A6+4*CINT([19B4])] | `LOCATE 17, 10: PRINT Adapter$(CINT(A(89)))` | AGREE |  |
| 0E28 | `8b f7` | FCMP [19B4]?[19B8]; bx=-1 if ne; neg -> 1; CSNG; FSTORE [19BC] | `A(91) = ABS(A(89) <> A(90))` | AGREE |  |
| 0E45 | `e8 03 00` | call 0E4B | `GOSUB L_0E4B` | AGREE |  |
| 0E48 | `e9 b5 fb` | jmp 0A00 | `GOTO L_0A00` | AGREE |  |
| 0E4B | `bf 34 d3` | FMUL [19B4]*[D334]=6; FADD +[D30C]=3; CINT; PALETTE 1,dx | `PALETTE 1, CINT(A(89) * 6 + 3)` | AGREE |  |
| 0E6B | `8b f9` | FSUB [D320]=5 - [19B4]; CINT; PALETTE 2,dx | `PALETTE 2, CINT(5 - A(89))` | AGREE |  |
| 0E7E | `c3` | ret | `RETURN` | AGREE |  |
| 0E7F | `33 db` | PLAY(0); cmp bx,31; dx=-1 if >31 (jle, signed); FTEST [D426]; bx=-1 if zero; or; jne ret | `IF PLAY(0) > 31 OR TunePlaying = 0 THEN RETURN` | AGREE |  |
| 0EA3 | `bf 5c 49` | FADD [D724]+1; CINT -> dx; MID$([4948],dx,3); SASSIGN [D728] | `Note$ = MID$(Tune$, CINT(TunePos + 1), 3)` | AGREE |  |
| 0EC0 | `8b da` | VARPTR$([D728]); SCAT lit "X"(D72C)+that; PLAY | `PLAY "X" + VARPTR$(Note$)` | AGREE |  |
| 0ECE | `bf 0c d3` | FADD [D724]+[D30C]=3; FSTORE [D724] | `TunePos = TunePos + 3` | AGREE |  |
| 0EDC | `bb 48 49` | LEN([4948]); CSNG; FCMP FAC?[D724]; jb -> FMOV [D724]<-[D732]=0 | `IF LEN(Tune$) < TunePos THEN TunePos = 0` | AGREE |  |
| 0EF3 | `eb 8a` | jmp 0E7F | `GOTO L_0E7F` | AGREE |  |
