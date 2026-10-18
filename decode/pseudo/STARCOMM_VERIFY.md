# STARCOMM — verification (lane verify, Opus, 2026-10-15)

Inputs: `decode/pseudo/STARCOMM.bas.md` (lane mod-startup), `decode/listings/STARCOMM.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` (STARCOMM section: literals 0x40FA "CHARINFO.BAS", 0x4112 "STARTUP"; constants 0x410A = 0, 0x410E = 1; LINES table).

**Sample:** none. The module has fewer than 300 lines, so every statement was checked (20 of 20; no seed needed). Method: I derived each statement from the listing bytes and the ledger first, then compared it with the pseudocode.

## Summary

- 20 statements: **20 AGREE, 0 DISAGREE, 0 UNSURE**. Special sites (BLOAD 0x78, ON ERROR GOTO 0x90, CHAIN 0x119, RESUME 0x11F) all AGREE.
- Variables: A(89)/A(90)/A(91) = DS 0x19B4/0x19B8/0x19BC = 0x1850 + 4n with n = 89/90/91 (checked). A() = 2601 singles = COMMON length 0x28A4 (checked).
- One wording nit, no fix needed: the pseudocode says bytes 0x128..0x15F are "block A / NAME data". Block 0x16 actually starts at 0x130 (`16 00 01 00 08 00`), so 0x128..0x12F are 8 unreachable pad bytes before it. The code range 0x40..0x127 is correct.

## Verdict table

| offset | bytes | my derivation (listing + ledger) | pseudocode | verdict |
|---|---|---|---|---|
| 0040 | `bb 01 00` | bx=1; RT3E_5B | SCREEN 1 | AGREE |
| 0046 | `8b d3` | dx=bx=1; ARGPUSH 0; xchg -> COLOR exec 1 | COLOR 0, 1 | AGREE |
| 0052 | `8b cb` | bx=-1; RT3E_32 | CLS | AGREE |
| 005A | `87 d9` | bx=cx=1; RT3E_5B | SCREEN 1 | AGREE |
| 005F | `87 da` | ARGPUSH 0; bx=dx=1; COLOR | COLOR 0, 1 | AGREE |
| 0069 | `87 d9` | bx=-1; CLS | CLS | AGREE |
| 006E | `8b d9` | bx=cx=1; SCREEN | SCREEN 1 | AGREE |
| 0073 | `33 db` | bx=0; RT3E_3C | KEY OFF | AGREE |
| 0078 | `bb 50 18` | CSNG 0x1850 -> FAC; bx=0x40FA "CHARINFO.BAS"; dx=1A; RT3E_1A | BLOAD "CHARINFO.BAS", &H1850 | AGREE |
| 0087 | `bf b8 19` | FMOV [19B8] <- [410A]=0 | A(90) = 0 | AGREE |
| 0090 | `ba 0f 01` | dx=0x10F (+0x10 = listing 0x11F = LINES line 100); RT3F_02 | ON ERROR GOTO 100 | AGREE |
| 0096 | `bb 01 00` | PALETTE 1,9 | PALETTE 1, 9 | AGREE |
| 009F | `bb 02 00` | PALETTE 2,4 | PALETTE 2, 4 | AGREE |
| 00A8 | `bf b8 19` | FMOV [19B8] <- [410E]=1 | A(90) = 1 | AGREE |
| 00B1 | `be b8 19` | bx=-1 if A(90)=0; dx=-1 if [19BC]=1; or; jne 00D5 ([19B4]<-0) else 00E1 ([19B4]<-1) | IF A(90) = 0 OR A(91) = 1 THEN A(89) = 0 ELSE A(89) = 1 | AGREE |
| 00EA | `bf 0e 41` | bx=-1 if A(90)=1; dx=-1 if A(89)=0; and; jne 010E: ARGPUSH 0; COLOR 1 | IF A(90) = 1 AND A(89) = 0 THEN COLOR 0, 1 | AGREE |
| 0119 | `bb 12 41` | bx=0x4112 "STARTUP"; RT3E_0E | CHAIN "STARTUP" | AGREE |
| 011F | `bb a1 00` | bx=0xA1 (+0x10 = 0xB1 = line 60); RT3F_09 | RESUME 60 | AGREE |
| 0125 | `cd 3e 02` | RT3E_02 handler-end | END | AGREE |
| 0040..0073 | — | LINES table: lines 10, 15, 20 all map to 0x40 | "line 10, 15: no code emitted" | AGREE |

## Disagreements

None.

## Screens

STARCOMM draws and prints nothing; this matches STARTUP_SCREENS.md "Screen 0". The module's two string literals are file names only.
