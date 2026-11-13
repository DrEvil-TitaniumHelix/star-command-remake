# The four .STR files: floppy disk-swap stubs (compiled QuickBASIC 3.00 modules)

Lane: data. Originals: `re-targets/starcommand/starcoma/{SPACE,STARPORT,INSIDE,PLBATTLE}.STR`, read 2026-10-15. Listings: `decode/data/str/<NAME>_STR.lst` (made with `decode/tools/qbdis.py`, which accepts them unchanged). Constants: `decode/data/MODULE_CONSTANTS.md` (sections `SPACE.STR` etc.).

## What they are

They are **not** data files. Each is a complete MZ executable with the same layout as the game modules:

| file | size | MZ header evidence (offset 0) | module header (lm 0x00) | source name (NAME block) | code bytes |
|---|---|---|---|---|---|
| SPACE.STR | 4000 | `4d 5a b0 00 08 00 07 00 20 00 00 00 ff ff 3b 00 e7 0b` (e_cparhdr=0x20, 7 relocs, ss=cs=0x3B, sp=0xBE7 same as the modules) | `15 00 12 00 1e 01 ... 62 7a 53 50 41 43 45 20 20 20` = 'bz' + "SPACE   " | `SPACE.35` | 0x11E |
| STARPORT.STR | 3936 | `4d 5a d0 00 08 00 07 00 20 00 00 00 ff ff 37 00` | 'bz' + "STARPORT" | `STARPORT.35` | 0xF0 |
| INSIDE.STR | 3872 | `4d 5a 90 00 08 00 07 00 20 00 00 00 ff ff 33 00` | 'bz' + "INSIDE  " | `INSIDE.35` | (see listing) |
| PLBATTLE.STR | 3872 | `4d 5a 90 00 08 00 07 00 20 00 00 00 ff ff 33 00` | 'bz' + "PLBATTLE" | `PLBATTLE.35` | (see listing) |

The tail of each file (lm 0x3B0.. in SPACE.STR) is the standard BRUN30 loader stub ("Must be a QuickBASIC 2.00 compiled module", "BRUN30.EXE"), byte-identical to the one in the game modules. The code is compiled with the 5-byte call form (`cd 3f 59 90 90`: INT + inline byte + two NOPs, so the runtime can patch the site into a far call) and with a per-statement `RT3F_59` call that the big modules do not have (line-number tracking for error messages; naming is lane rt-naming's).

They are reached by name: SPACE.EXE holds the literals "STARPORT.STR" (0xB04A), "INSIDE.STR" (0xB0BE, 0xB87E), "PLBATTLE.STR" (0xB9CC); STARPORT.EXE "SPACE.STR" (0xC2F0); INSIDE.EXE "SPACE.STR" (0x8AC4, 0x8FA8); PLBATTLE.EXE "SPACE.STR" (0xCDF4); SPBATTLE.EXE "PLBATTLE.STR" (0xA3C2); each is passed to RT3E_0E (CHAIN) after `drive$ + name$` concatenation (RT3F_55). The same modules also hold the plain ".EXE" names (SPACE "SPBATTLE.EXE", INSIDE "PLBATTLE.EXE", PLBATTLE "INSIDE.EXE", SPBATTLE "SPACE.EXE"), i.e. module pairs that live on the same floppy chain directly, pairs on different floppies chain through the .STR stub.

## Program (SPACE.STR; the other three differ only in the disk letter, the comparison constant and the target name)

Reconstructed from `decode/data/str/SPACE_STR.lst` and the LINES table (listing address : line = 00040:1, 00045:3, 0004A:10, 0010F:100, 0009A:10, 0009D:10, 000B8:20, 0011C:300, 000C5:30, 000D2:30, 000E2:30, 000F4:40). Element indices are the pushed constants (0x54 = 84, 0x5C = 92) of the 2601-element (51x51) single array at DS:0x1850 (inline bytes after RT3F_01: `04 02 29 0a` = element size 4, 2 dims?, count 0x0A29 = 2601); whether the game addresses it as A(1,33)/A(33,1) etc. is for the pseudocode lanes.

```
1   REM / COMMON declarations (no code; three RT3F_59 line markers at 0x40, 0x45, 0x4A)
3
10  IF A(84) = 0 OR A(92) = 2 THEN 100 ELSE A(92) = 2
       ' 0x4F..0x97: push 84; RT3F_01; si=ax+0x1850; RT3F_A7 (FTEST) -> bx = (A(84)=0)
       '             push 92; RT3F_01; di=0x4896 (constant 2.0); RT3F_9F (FCMP) -> dx = (A(92)=2)
       '             or dx,bx -> jne 0x97 (jmp 0x10F = line 100)
       ' 0x9D..0xB3: A(92) = 2.0  (RT3F_7B copies 0x4896 -> element)
20  ON ERROR GOTO 300                 ' 0xBD: mov dx,0x10C; RT3F_02  (0x10C+0x10 = 0x11C = line 300)
30  <RT3E_32 bx=-1: screen/colour reset, name unknown>
    LOCATE 12, 2 : PRINT "Insert disk B in drive A and press a key"
       ' 0xD2..0xEF: RT3E_42 bx=12; RT3E_44 bx=2; RT3F_BC; mov bx,0x489A (descriptor of the literal); RT3F_6E; RT3E_79
    DO: K$ = INKEY$: LOOP WHILE K$ = ""  ' 0xF4..0x10D: RT3D_06 -> bx; mov ax,bx; mov bx,0x48C6 (""); RT3F_62; je -> loop
100 RUN "SPACE.EXE"                   ' 0x114: mov bx,0x48CA ("SPACE.EXE"); RT3E_0E
300 RESUME 30                         ' 0x121: mov bx,0xB5; RT3F_09 (0xB5+0x10 = 0xC5 = line 30); then RT3E_02 = END
```

Per-file differences (from MODULE_CONSTANTS.md):

| file | prompt | compare/assign constant (DS 0x4896) | target |
|---|---|---|---|
| SPACE.STR | "Insert disk B in drive A and press a key" | 2.0 (`00 00 00 82`) | "SPACE.EXE" |
| STARPORT.STR | "Insert disk A in drive A and press a key" | 0.0 (`00 00 00 00`) | "STARPORT.EXE" |
| INSIDE.STR | "Insert disk B in drive A and press a key" | (no numeric constant: compares with the same literal-free path, see listing) | "INSIDE.EXE" |
| PLBATTLE.STR | "Insert disk B in drive A and press a key" | (as INSIDE) | "PLBATTLE.EXE" |

Reading: A(84) is the drive configuration chosen in STARTUP ("Hard Disk Drive" / "One Floppy Disk Drive" / "Two Floppy Disk Drives" literals at STARTUP 0xD358/0xD372/0xD38C): 0 = no swapping needed. A(92) records which disk is currently in drive A (0 = disk A with STARPORT, 2 = disk B with SPACE/INSIDE/PLBATTLE). The shipped CHARINFO.BAS has A(84) = 1.0 (file offset 7+84*4 = 0x157: `00 00 00 81`), i.e. the "one floppy" configuration, so the stubs do prompt on the shipped save. Confidence M (consistent across all four stubs and the STARTUP literals; the exact array indexing is unverified).

## Observations for other lanes

- RT3F_6E prints a **string literal** here (BX = descriptor 0x489A of "Insert disk ..."), contradicting the ledger's `PRINT single var [BX]`; RT3D_06 behaves as INKEY$ (result descriptor in BX), RT3F_62 as string compare (AX vs BX), RT3F_09 as RESUME <line offset>, RT3E_02 as END, RT3F_01 as array element address (pushed index + 4 inline bytes), RT3F_59 as statement/line marker. All L/M, from this stub only; for lane rt-naming.
- Nothing in the .STR files is needed by the HTML5 reproduction (no floppies); the chain graph is the only behaviour to keep: X.STR = "go to X.EXE".
