# Star Command sprite banks (.BAS / .EGA BSAVE files): format, evidence, inventory

Lane: data. Originals: `re-targets/starcommand/starcoma/*.BAS, *.EGA` (read 2026-10-15, never modified). Tools: `decode/data/tools/bsave.py` (parser + PNG writer, pure python/zlib), `render_all.py` (inventory + all PNGs + contact sheets), `gen_sprites.py` (this file). Index: `decode/data/sprites_index.tsv`.

## 1. Container: BSAVE image

| field | size | evidence | meaning |
|---|---|---|---|
| magic | 1 | every file starts with `fd` (BIGSH-1.EGA offset 0: `fd 6d 35 56 18 b2 13`) | BSAVE signature |
| segment | u16 | BIGSH-1.EGA `6d 35` = 0x356D; MAP-1.BAS `70 0b` = 0x0B70; CHARINFO.BAS `73 0b` | DS segment of the program that BSAVEd (several different tools/program builds: 0x356D, 0x0B70, 0x0B73, 0x066F, 0x06E8, 0x068F, 0x0652, 0x06B0, 0x06C4, 0x47B2) - irrelevant for loading |
| offset | u16 | BIGSH-1.EGA `56 18` = 0x1856; CHARINFO.BAS `50 18` = 0x1850 (= COMMON start, see MODULE_CONSTANTS.md) | DS offset of the array when BSAVEd; BLOAD ignores it when the game gives its own offset (every BLOAD in the listings passes an explicit offset) |
| length | u16 | BIGSH-1.EGA `b2 13` = 5042; file size 5050 = 7 + 5042 + 1 | number of body bytes = the DIM'd size of the BASIC array, **not** the size of the picture(s) inside |
| body | length | | one or more GET arrays (section 2) at author-chosen offsets, then stale memory |
| trailer | 1 | last byte of every one of the 94 files is `1a` (TITLE.BAS 0x8989, TR-1.EGA 0x217, CHARINFO.BAS 0x28AB) | Ctrl-Z written by BSAVE; not part of the data |

## 2. GET array format (what PUT consumes)

Header `w u16` (width in **bits per plane**), `h u16` (rows), then `h` rows. Row size and pixel packing depend on the SCREEN mode the array was GET in:

| mode | row bytes | pixel packing | evidence |
|---|---|---|---|
| SCREEN 1 (320x200, 4 colours) = all `.BAS` pictures | (w+7)/8, one plane | 2 bits per pixel, MSB first (pixel 0 = bits 7-6), pixel width = w/2 | BIGSH-1.BAS header `b0 00 38 00` = w 176 bits, h 56 -> 88 px (same width as the EGA twin) and 22*56+4 = 1236 bytes; MAP-1.BAS `00 01 80 00` = 256 bits -> 128 px, 32*128+4 = 4100 = BSAVE len exactly; ENSHP-1.BAS 8 x 148 = 1184 = len exactly; TITLE.BAS `80 02 c8 00` = 640 bits -> 320 px x 200 rows = full SCREEN 1; renders are recognisable pictures (title screen text, ships, maps) |
| SCREEN 7 (320x200, 16 colours EGA) = all `.EGA` files | 4 x (w+7)/8: **for each row, plane 0, plane 1, plane 2, plane 3** | 1 bit per pixel per plane; colour = plane0 (blue) bit0 + plane1 (green) bit1 + plane2 (red) bit2 + plane3 (intensity) bit3 | BIGSH-1.EGA `58 00 38 00` = 88 bits, 56 rows, 11*4*56+4 = 2468; TR-1.EGA 4 x 132 = 528 = len exactly; PLBTSH.EGA 18 arrays sum to 3560 = len exactly. Plane layout/order chosen by rendering the four hypotheses of BIGSH-1.EGA (`decode/data/png/hypothesis/BIGSH-1_EGA_0_{BGRI,IRGB}_{row,plane}.png`): row-interleaved planes give a coherent picture, plane-major gives noise; B,G,R,I order gives a green creature / brown rock / white bone / black background, I,R,G,B gives a red creature on a blue floor. B,G,R,I is the EGA hardware plane order and the natural colouring -> chosen, confidence M (visual) |

Pixel aspect: both modes are 320x200 on a 4:3 display (pixels 1.2x taller than wide). Colours: SCREEN 1 uses CGA palette 1 by default (0 = background/black, 1 = cyan, 2 = magenta, 3 = white) - the PNGs use that palette; the game may select palette 0 (green/red/yellow) with `COLOR` at run time (**not verified by this lane**; the pseudocode lanes will see the COLOR/PALETTE calls). SCREEN 7 colours are the 16 standard EGA colours (PNG palette: 0 black, 1 blue 00A, 2 green 0A0, 3 cyan 0AA, 4 red A00, 5 magenta A0A, 6 brown A50, 7 light grey AAA, 8 dark grey 555, 9..15 bright).

## 3. Which screen mode the game really uses (evidence against the 640x200 assumption in FOREMAN.md)

The screen-mode runtime call is RT3E_5B with the mode in BX (naming inferred from usage; lane rt-naming to confirm): STARTUP listing 0x7C `mov bx,1; RT3E_5B`, SPACE 0x1037 `mov bx,1`, STARPORT 0x5D `mov bx,1`, INSIDE `mov bx,1`, **PLBATTLE 0x6F `mov bx,7`** (inside an IF: `je 0x6f / jmp 0x75`), SPBATTLE has no RT3E_5B call (inherits the mode through CHAIN). So: every screen is **SCREEN 1 (320x200, 4 colours)** and only the ground-combat module switches to **SCREEN 7 (320x200, 16 colours)** when an EGA is present (the only module with ".EGA" literals). No 640-pixel mode is used anywhere; the sprite geometry agrees (BIGSH 88x56 in both builds, TITLE.BAS 320x200). The reproduction engine should be 320x200 with a 4-colour CGA palette plus a 16-colour mode for PLBATTLE. Flagged in STATUS.md for the Foreman.

## 4. File-name rules (for the loader map below)

- BLOAD with a name without extension gets ".BAS" (runtime default): "title", "CHARINFO", "fire", "LOGO" exist only as .BAS/.EGA files.
- Numbered banks are built by concatenation (RT3F_55) from the stem literal, "-" (or STR$ of a negative number), the number and ".BAS"/".EGA"; see DATA_FILES.md section C and MODULE_CONSTANTS.md for every literal address.
- The `.BAS` and `.EGA` twins of a bank are BSAVEs of the same DIM'd integer buffer in the CGA and EGA builds: sprite n sits at the **same byte offset** in both (TR-x: 7, 139, 271, 403; PLBTSH: 7, 139, ..., 3435), so a CGA 16x16 array (68 bytes) is followed by 64 unused bytes inside its 132-byte EGA-sized slot. The renderer uses the .EGA twin's offsets for those .BAS files.
- Files whose BSAVE length exceeds the pictures (FIRE, DEMOSH, some BIGSH-n.EGA tails, ...) may carry stale memory after the last indexed array; nothing in it is referenced (the module PUTs name the array base addresses, see the pseudocode lanes). Exceptions found later: BIGSH-n.BAS/.EGA hold animation frames at fixed slots (verify lane, PLBATTLE 9CE4/9F34; see the BIGSH rows), INSH.BAS holds 67 arrays after 64 passability words; and lane mod-startup found that TITLE.BAS is **not** stale after the picture: it holds four more GET arrays (attract-loop animation frames) that fill the BSAVE length exactly (see the TITLE.BAS row).

## 5. Open items / unknowns

- PUT action mode: RT3E_58 takes DX = 3 or 4 (STARTUP 0xCD `mov dx,4` for the title screen). Which of PSET/PRESET/AND/OR/XOR each number means is **unknown** (lane rt-naming).
- CGA palette selection and the EGA palette remapping (if any) - unknown until the COLOR/PALETTE runtime calls are named.
- Exact sprite meaning per index inside SPACESH/SPBTSH/PLBTSH (which index is "planet type 3") is only known from the PUT call sites; the inventory below gives sizes and a visual description.
- GAL.BAS is referenced by no module literal; DEMOSH.BAS belongs to DEMO.EXE.
