# STARTUP screens (what the player sees, in order)

Lane mod-startup, 2026-10-15. Derived from `STARTUP.bas.md` (labels refer to it) and the data lane's sprite/text findings. Mode: SCREEN 1 (320x200, 4 colours) with `COLOR 0,1` set by STARCOMM; on EGA hardware with EGA chosen, `PALETTE 1,9: PALETTE 2,4` (otherwise CGA palette 1: cyan/magenta/white; with the toggle, `PALETTE 1,3: PALETTE 2,5`). Text coordinates are LOCATE row, column (1-based, 40 columns).

## Screen 0: STARCOMM launcher (no visible content)

- `SCREEN 1: COLOR 0,1: CLS`, key line off, loads CHARINFO.BAS, probes EGA with PALETTE, chains to STARTUP. Nothing is drawn.

## Screen 1: Title picture (attract mode)

| item | detail | evidence |
|---|---|---|
| picture | `PUT (0,0), TitlePic` = TITLE.BAS 320x200 CGA picture ("STAR COMMAND / By Winston Douglas Wood And Eric Liebenau" per SPRITES.md), drawn once with XOR onto the cleared screen | L_00AD/L_00BC |
| music | background tune starts (`PLAY "MBMLT126"` + 3-char slices of the 174-char tune via `PLAY "X"+VARPTR$`) once `TunePlaying` is set at L_06BC, i.e. after the first delay phase; music only if the saved SoundOff! is 0 (Sound On) | L_0049, L_0E7F |
| phase 1 | up to 100 waits of 2.4 s (about 4 minutes) on the still picture | L_0673 |
| phase 2 (loop) | `PUT (28,54), Frame1, PSET` -> 2.4 s -> `PUT (48,58), Frame2, PSET` -> 2.4 s -> `PUT (48,58), Frame3, PSET` -> 2.4 s -> `PUT (44,48), Frame4, PSET` -> 3 x 2.4 s -> `PUT (0,0), TitlePic, PSET` (restore) -> repeat. Frame1..4 are the four GET arrays stored after the picture in TITLE.BAS (DS 0x87E8, 0x9BD8, 0xADDA, 0xBF7A) | L_06BC..L_07AA |
| keys | any key (INKEY$ <> "") at any wait point ends the attract mode | L_0663, L_07D8, the `IF KeyHit` tests |
| transition | -> Screen 2 (menu) at L_07FE | |

## Screen 2: Main menu

Drawn by L_07FE..L_09EC after `CLS`:

| element | statement |
|---|---|
| outer double frame | `LINE (0,1)-(319,198),,B` and `LINE (1,2)-(318,197),,B` |
| inner double frame | `LINE (5,29)-(314,194),,B` and `LINE (6,30)-(313,193),,B` |
| title bar | `LINE (5,5)-(314,26),,BF` (filled, default colour 3) with `PUT (120,7), Logo, PSET` (LOGO.BAS 81x19 "STAR COMMAND" block letters) |
| frame fill | `PAINT (3,3), 2, 3` fills the band between the two frame pairs in colour 2 |
| menu window | `LINE (7,31)-(312,192), 0, BF` (black) before every redraw (L_0A34) |

Text (row, col):

| row | col | text |
|---|---|---|
| 5 | 2 | `Version 1.0                    3/18/88` |
| 6 | 2 | `copyright 1988 by Winston Douglas Wood` |
| 13 | 8 | `1-Play Star Command` |
| 14 | 8 | `2-Begin New Game` |
| 15 | 8 | `3-` + DriveName$(DriveSel): `Hard Disk Drive       ` / `One Floppy Disk Drive ` / `Two Floppy Disk Drives` |
| 16 | 8 | `4-` + SoundText$(SoundOff!): `Sound On ` / `Sound Off` |
| 17 | 8 | `5-` + Adapter$(UseEGA!): `Color Graphic Adaptor    ` / `Enhanced Graphics Adaptor` — printed only when A(90)=1 (EGA detected) |
| 23 | 2 | ` portions of this product copyrighted` |
| 24 | 2 | ` by Microsoft Corporation   1982-1987` (printed with `;`, no newline) |

Behaviour:

- First time on this screen, if `Speed < 1`, the CPU calibration loop runs for about one second (L_0A56) before keys are accepted.
- Keys are read with `VAL(INKEY$)` and dispatched with `ON ... GOTO` (L_0A11); non-digit keys do nothing. Background music keeps being fed while idle.
- `1`: writes A(84)=DriveSel, DriveCfg!=0, StdDelay!=Speed, A(87)=0, A(92)=0, waits for the music queue to empty or drop by more than 2 notes, then `CHAIN "STARPORT"` -> STARPORT module.
- `2`: -> Screen 3.
- `3`: toggles DriveSel between 0 and 1 and reprints row 15 at column 10 (`LOCATE 15,10: PRINT DriveName$(...)`). With MaxDrive = 1 the "Two Floppy Disk Drives" text is unreachable from the menu.
- `4`: toggles SoundOff! and SoundOn, reprints row 16 col 10; when turning sound on it restarts the tune (TunePos = 0, feed), when turning it off it issues `SOUND 99,0`.
- `5` (only if EGA detected): toggles UseEGA!, reprints row 17 col 10, stores A(91) = ABS(UseEGA! <> A(90)), and applies `PALETTE 1, UseEGA!*6+3: PALETTE 2, 5-UseEGA!` (CGA: 3/5, EGA: 9/4).

## Screen 3: New-game confirmation (inside the menu window)

Sequence (each step clears the menu window with `LINE (7,31)-(312,192),0,BF`; the frame, title bar and logo stay):

1. Row 13 col 2 `Starting a new game will erase your`, row 14 col 2 `old characters. Start a new game?(Y/N)`. Keys: `y`/`Y` -> step 2; `n`/`N` -> back to the menu text (L_08D3). Other keys ignored (music keeps playing).
2. Row 13 col 2 `Are you sure you want to start a new`, row 14 col 2 `game? (Y/N)`. Same keys; N -> menu.
3. Row 14 col 3 `Starting a new game. Please wait.` while CrewName$(0..8) and ShipName$ are emptied, all 2601 A() elements are zeroed, UseEGA!/A(90) restored, defaults CreditsHi!=3, CreditsLo!=5000, A(83)=27, ChainArg!=2, SectorX!=28, SectorY!=2, CursorCol!=7, CursorRow!=7, SysCurX!=6, SysCurY!=6 written, palette re-applied if EGA, SoundOn=1, music fed. Then the menu text is redrawn (Screen 2). Note: the new save is not written to disk here (no BSAVE/OPEN FOR OUTPUT in STARTUP); the game modules write CHARINFO.BAS/CHARNAME later.

## Transitions summary

STARCOMM -> STARTUP (CHAIN) -> [attract: title picture <-> animation frames] -any key-> menu -> `1` -> STARPORT (CHAIN). Menu `2` -> confirmations -> menu. `3`/`4`/`5` stay on the menu.
