# START.BAT

Lane: data. Evidence: `re-targets/starcommand/starcoma/START.BAT`, 10 bytes, read 2026-10-15.

| offset | bytes | text |
|---|---|---|
| 0x00 | `53 54 41 52 43 4f 4d 4d 0d 0a` | `STARCOMM` CR LF |

One line, no `@echo off`, no parameters: it runs `STARCOMM.EXE` (the 288-byte launcher module). STARCOMM in turn BLOADs `CHARINFO.BAS` to DS:0x1850 (listing 0x78..0x84, literal 0x40FA) and CHAINs to `STARTUP` (listing 0x11F: `mov bx,0x4112; RT3E_0E`, literal 0x4112 = "STARTUP"). The DOS-side start sequence is therefore START.BAT -> STARCOMM.EXE -> (BRUN30.EXE loaded by the stub) -> STARTUP.EXE.

Other executables in the directory that are **not** part of the START.BAT chain (identified by size and content only, not decoded by this lane):

| file | size | identification | evidence |
|---|---|---|---|
| COLOR.EXE | 3440 | tiny QuickBASIC 3 module (same loader stub, 'bz' header) | not inspected beyond size; **unknown purpose** (likely sets the colour/adapter choice stored in CHARINFO) |
| FIXIT.EXE | 3856 | tiny QuickBASIC 3 module | **unknown purpose** |
| DEMO.EXE | 13728 | QuickBASIC 3 module; DEMOSH.BAS is BSAVE'd from segment 0x0652 offset 0x1446 (its data area), 6 frames of 88x56 | demo/attract program; **not decoded** |
