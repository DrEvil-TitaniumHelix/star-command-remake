# decode/data - data-format lane deliverables

- `SPRITES.md` - BSAVE/GET-array format (evidence, plane-order test), SCREEN-mode finding, per-file inventory of the 94 .BAS/.EGA files with loader map. Index: `sprites_index.tsv`.
- `png/<FILE>_<n>.png` - every sprite/picture array rendered 1:1 (CGA palette 1 / EGA 16 colours); `png/sheets/<FILE>.png` - one contact sheet per file (2x); `png/hypothesis/` - the four BIGSH-1.EGA plane-layout renders used to pick the format.
- `MODULE_CONSTANTS.md` - compiled-module layout after the code (blocks), every string literal / numeric constant with its DS address, DATA statements, line-number tables, COMMON array descriptors, for all 7 modules and the 4 .STR stubs.
- `STR_FILES.md` - the .STR files are compiled disk-swap stubs; listings in `str/`.
- `DATA_FILES.md` - sequential text files (ENCINFO, ENCLIST, ENCTABLE, MES-n, MISSION, NAME, CHARNAME) and BSAVE'd numeric arrays (CHARINFO, GALAXY, INFO, INSH, IN-n).
- `BAT.md` - START.BAT and the other executables.
- `tools/` - `bsave.py`, `render_all.py`, `modconst.py`, `gen_constants.py`, `gen_sprites.py` (+ `_<MOD>.json` parser output, `layout_section.md`, `sprites_header.md` prose).

Regenerate everything: `python decode/data/tools/render_all.py > decode/data/sprites_index.tsv; python decode/data/tools/gen_sprites.py; for m in ...: python decode/data/tools/modconst.py <orig>/$m.EXE --json decode/data/tools/_$m.json; python decode/data/tools/gen_constants.py`.
