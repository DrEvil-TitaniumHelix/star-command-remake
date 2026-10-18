# STARCOMM.BAS — launcher (BASIC-style pseudocode)

Lane mod-startup, 2026-10-15. Evidence: `decode/listings/STARCOMM.lst` (regenerated after rt-naming), `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` (STARCOMM section: 2 string literals, 2 numeric constants, LINES table). Every line below was re-derived from the listing bytes; the codex draft was only used as a scaffold.

Conventions: `L_xxxx:` = listing (load-module) offset of the first instruction of the statement. Source line numbers come from the LINES block (listing address = table offset + 0x10, see MODULE_CONSTANTS.md). `A(n)` = element n of the 2601-single COMMON array at DS 0x1850 (the CHARINFO.BAS save array, 1-D indexing; element n is at 0x1850 + 4n; if the source declared it `DIM A(50,50)` then A(n) = A(n MOD 51, n \ 51)). Booleans follow the compiler: a comparison produces -1/0 in a register, combined with `or`/`and`, then tested.

Code range: 0x40..0x127. Bytes 0x128..0x15F are the compiler's block A / NAME data (`16 00 01 00 08 00 ...`, "STARCOMM.BAS"), not code; the listing's disassembly of them is noise.

## Pseudocode

```basic
' line 10, 15 : no code emitted (LINES table puts 10, 15 and 20 all at 0x40 -> declarations/COMMON)
L_0040: ' line 20
        SCREEN 1                      ' 0040 mov bx,1; RT3E_5B
        COLOR 0, 1                    ' 0046..004F ARGPUSH 0; COLOR exec 1
        CLS                           ' 0054 CLS -1
        SCREEN 1                      ' 005C
        COLOR 0, 1                    ' 005F..0066
        CLS                           ' 0069..006B
        SCREEN 1                      ' 006E..0070
        KEY OFF                       ' 0073 xor bx,bx; RT3E_3C
L_0078: ' line 25
        BLOAD "CHARINFO.BAS", &H1850  ' CSNG(&H1850)->FAC; bx="CHARINFO.BAS"(0x40FA); dx=1A
L_0087: ' line 30
        A(90) = 0                     ' FMOV [19B8] <- const 0 (0x410A)   : EGA-hardware flag cleared
L_0090: ' line 40
        ON ERROR GOTO 100             ' mov dx,10Fh (CS offset -> listing 0x11F = line 100)
L_0096: ' line 50
        PALETTE 1, 9                  ' fails with an error on CGA -> handler -> RESUME 60 with A(90) still 0
        PALETTE 2, 4
        A(90) = 1                     ' FMOV [19B8] <- 1 (0x410E)         : PALETTE worked -> EGA present
L_00B1: ' line 60
        IF A(90) = 0 OR A(91) = 1 THEN A(89) = 0 ELSE A(89) = 1
        ' 00B1 FTEST A(90): bx=-1 if zero; 00C3 FCMP A(91)?1: dx=-1 if equal; or dx,bx; jne 00D5
        ' 00D5: A(89) <- 0 (0x410A); 00E1: A(89) <- 1 (0x410E)
L_00EA: ' line 65
        IF A(90) = 1 AND A(89) = 0 THEN COLOR 0, 1
        ' 00EA FCMP A(90)?1: bx=-1 if equal; 00FC FTEST A(89): dx=-1 if zero; and dx,bx; jne 010E
        ' 010E: ARGPUSH 0; COLOR exec 1
L_0119: ' line 70
        CHAIN "STARTUP"               ' bx = "STARTUP" (0x4112); RT3E_0E
L_011F: ' line 100 (error handler)
        RESUME 60                     ' mov bx,0A1h (CS offset -> listing 0xB1 = line 60); RT3F_09
L_0125: END                           ' RT3E_02: compiler-emitted end after RESUME ("No RESUME" if reached with an error pending)
```

Reconstructed source (what the compiler output is consistent with):

```basic
20 SCREEN 1: COLOR 0,1: CLS: SCREEN 1: COLOR 0,1: CLS: SCREEN 1: KEY OFF
25 BLOAD "CHARINFO.BAS",&H1850
30 A(90)=0
40 ON ERROR GOTO 100
50 PALETTE 1,9: PALETTE 2,4: A(90)=1
60 IF A(90)=0 OR A(91)=1 THEN A(89)=0 ELSE A(89)=1
65 IF A(90)=1 AND A(89)=0 THEN COLOR 0,1
70 CHAIN "STARTUP"
100 RESUME 60
```

Meaning of the three flags (evidence: STARTUP menu, see STARTUP.bas.md): A(90) = EGA hardware detected (PALETTE succeeded), A(91) = player chose the adapter mode that differs from the detected one (set by STARTUP option 5 as `ABS(A(89) <> A(90))`), A(89) = use EGA palette/mode this session. The whole launcher therefore does: load the save, detect EGA via PALETTE, honour the saved CGA/EGA preference, chain to STARTUP.

## Screens

None. The launcher clears the screen (SCREEN 1 / COLOR 0,1 / CLS, key line off) and chains to STARTUP without printing or drawing anything.

## Variables

| DS address | type | name | evidence |
|---|---|---|---|
| 0x1850 + 4n | single array (COMMON, 2601 elements) | A(n) | BLOAD target of CHARINFO.BAS (10404 bytes = 2601 singles); COMMON descriptor `data 0x1850 flags 0x182 count 2601` (MODULE_CONSTANTS.md) |
| 0x19B4 | single = A(89) | A(89) UseEGA | written 0/1 at 00D5/00E1 from the detect/preference test; STARTUP option 5 prints Adapter$(A(89)) and PALETTEs from it |
| 0x19B8 | single = A(90) | A(90) EGADetected | 0 before PALETTE, 1 after a successful PALETTE 1,9 |
| 0x19BC | single = A(91) | A(91) AdapterPref | read only here; STARTUP writes `ABS(A(89) <> A(90))` at 0E28..0E42 |
| 0x40FA | string literal | "CHARINFO.BAS" | INIT record (MODULE_CONSTANTS.md) |
| 0x4112 | string literal | "STARTUP" | INIT record |
| 0x410A / 0x410E | single constants | 0 / 1 | INIT records |

## Unknowns

None: every runtime call in STARCOMM is rendered (RT3E_5B SCREEN, RT3E_33 ARGPUSH, RT3E_35 COLOR, RT3E_32 CLS, RT3E_3C KEY, RT3F_57 CSNG, RT3E_1A BLOAD, RT3F_7B FMOV, RT3F_02 ON ERROR GOTO, RT3E_4A PALETTE, RT3F_A7 FTEST, RT3F_9F FCMP, RT3E_0E CHAIN, RT3F_09 RESUME, RT3E_02 END). The repeated `SCREEN 1: COLOR 0,1: CLS` in line 20 is what the bytes say (three SCREEN 1 calls at 0043/005C/0070); no explanation for the repetition is claimed.
