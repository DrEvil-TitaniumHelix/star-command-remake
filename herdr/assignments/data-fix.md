# Lane: data-fix (Opus) — two small evidence follow-ups from phase-1 lanes

Read FOREMAN.md first (evidence rule: every claim has provenance; no invented names).

1. `decode/data/SPRITES.md`, row TITLE.BAS: the bytes after the 320x200 picture are NOT stale. Lane mod-startup proved that STARTUP PUTs four GET arrays at DS 0x87E8 / 0x9BD8 / 0xADDA / 0xBF7A as attract-loop animation frames (see `decode/pseudo/STARTUP.bas.md` and the STATUS.md mod-startup block). Parse those four arrays with the existing tools in `decode/data/tools/` (bsave.py / gen_sprites.py; .BAS banks are CGA 2bpp), add them to the TITLE.BAS row and to `decode/data/sprites_index.tsv`, render them to `decode/data/png/` like the other banks, and note the evidence (STARTUP listing offsets of the PUT calls).
2. `decode/brun30/RT_LEDGER.md`: `decode/brun30/RT_REVIEW.md` (GLM review, 137 AGREE) suggests confidence upgrades for 6 rows and two evidence-detail corrections (3E_8A/8B default mechanism; 3D_44 deref location 6A36 inside 69FC). Apply only what the review's quoted bytes support; keep the ledger format; do not rename anything. If `decode/brun30/rt_names.json` is unaffected, do not touch the listings.

Do not edit files owned by running lanes (decode/pseudo/SPACE*, decode/pseudo/INSIDE*, decode/pseudo/tools/*). Commit only your files (`git add decode/data decode/brun30/RT_LEDGER.md STATUS.md && git commit -m "data-fix: ..."`); 5-line DONE block at the top of STATUS.md.
