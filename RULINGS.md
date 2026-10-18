# RULINGS — open questions for the owner (the coordinator relays)

Format: SC-n, one question, options A/B, Foreman recommendation first.

## SC-1 — Display mode of the reproduction (ANSWERED: B, the owner, 2026-10-15)
Evidence (data lane, commit 7e67a4d; decode/data/MODULE_CONSTANTS.md, DATA_FILES.md): every module calls RT3E_5B with BX=1 (= `SCREEN 1`, CGA 320x200, 4 colours) except PLBATTLE, which uses BX=7 (= `SCREEN 7`, EGA 320x200, 16 colours). The .BAS sprite banks are CGA 2-bits-per-pixel, the .EGA banks are 4-plane. The brief's product form says "EGA-faithful 640x200 16-color"; the original game never uses a 640-wide mode.
Question: what should the reproduction render?
- **A (recommended):** follow the evidence: 320x200 CGA 4-colour palette for STARTUP/SPACE/STARPORT/INSIDE/SPBATTLE, 320x200 EGA 16-colour for PLBATTLE, pixel-doubled or scaled 4:3 in the browser. Acceptance stays "identical to DOSBox".
- **B:** keep 640x200 EGA 16-colour as a deliberate enhancement (would not be screen-identical to the original; needs a new acceptance rule).
**Ruling: B.** The reproduction renders 640x200 EGA 16-colour as a deliberate enhancement.
Consequences: (1) build-phase acceptance rule becomes "same content, layout and behaviour per screen; palette/resolution enhanced"; (2) the .EGA sprite banks are the art source, the .BAS/CGA banks are reference only; (3) decode work unchanged.

## SC-2 — SCREEN 1 colour 3: light grey (the original on an EGA) or bright white? (DECIDED A by the Foreman 2026-10-16 07:30; the owner may reverse)
Evidence: every headless DOSBox-X `machine=ega` reference of a SCREEN 1 screen draws attribute 3 (text, frames, lines) as light grey (170,170,170) and contains no white (49 references surveyed, acceptance/DOSBOX_REQUESTS.md "Rulings needed" R-1). The engine mapped palette 1 to the high-intensity EGA set (11/13/15), so all that text is bright white.
- **A (recommended, applied):** match the original's EGA colours: SCREEN 1 palette 1 = EGA 0/3/5/7, palette 0 = 0/2/4/6 (one table in game/engine/display.js; module PALETTE remaps unchanged). The screens then read exactly as on a 1988 EGA, which is what SC-1 = B names as the target.
- **B:** keep bright white as a deliberate enhancement (crisper text); every SCREEN 1 acceptance row keeps a "colour 3 white vs grey" note.
Foreman's reasoning: SC-1 = B allows colour enhancement but names the EGA look as the target; the grey IS the EGA look, and A removes a permanent expected-difference note from 60+ acceptance rows. Reversible in one table.
Addendum (Foreman 2026-10-16 08:10, from dosbox-ref's references): in the original the low-intensity palette holds only until the first SCREEN 7 module (PLBATTLE) has run; from then on attribute 3 is bright white on every SCREEN 1 screen (colours 1/2 keep the module remaps). Decision: emulate exactly that: colour 3 = light grey from game start until the first PLBATTLE, white afterwards for the rest of the session (engine palette state carried across CHAIN, reset on a fresh start). Acceptance references are compared in the matching state.


## SC-3 — BYOC scope: what must be free of original material? (ANSWERED: A, the owner 2026-10-18 via the coordinator)
Context: docs/BYOC.md section 2. The playable game (game/) and the RE workspace (decode/, acceptance/) both contain original or derived material.
- **A (default):** the *distributed game* is BYOC-clean (engine + importer + recipe); the RE workspace stays in the private repo as the evidence.
- **B:** also publish the RE workspace, scrubbed (bytes and game text replaced by offsets, no screenshots, no manual). Costs a large scrub lane.

**Ruling (the owner, 2026-10-18): A.** The distributed game AND our pseudocode/specs are public; only original bytes and direct extracts (byte copies, sprite renders/atlas, converted data tables, manual text, listings' raw bytes) are removed; the RE workspace evidence otherwise stays as is. Consequence for docs/BYOC.md: section 3.5/4 scope = remove originals and direct extracts; decode/pseudo, specs, ledgers stay public.

## SC-4 — How to get original material out of git history (ANSWERED: A, the owner 2026-10-18 via the coordinator)
**Ruling (the owner, 2026-10-18): A.** This private repo stays untouched; the public repo is a NEW repo created from a filtered clone.
- **A (default):** leave this private repo untouched; create a NEW public repo from a filtered clone that never contained original material (docs/BYOC.md section 4). Reversible, nothing destroyed.
- **B:** rewrite this repo's history in place (git filter-repo) and force-push. Irreversible for every clone; the Foreman will not do this without the owner's explicit yes.

## SC-5 — Game code under BYOC (ANSWERED: A, the owner 2026-10-18 via the coordinator)
**Ruling (the owner, 2026-10-18): A.** Ship the translators ported to JS; the browser rebuilds the modules from the player's EXEs at import, byte-identical. All three BYOC rulings answered (A/A/A); implementation starts only when the completion work is done and lanes are free.
The generated modules transliterate the compiled program, with every game string inline.
- **A (default):** ship the translators (disassembler -> pseudocode -> JS) ported to JS plus our annotations; the browser rebuilds the modules from the player's EXEs at import, byte-identical to today's (docs/BYOC.md 3.4). Largest work item (B3), cleanest result.
- **B:** ship today's module logic with the strings and tables stripped out and filled from the player's EXEs at import. Less work, but the shipped code is still a transliteration of the original program.

## SC-6 — Publishing the BYOC public repo (ANSWERED: A for now, the owner 2026-10-18 02:20 via the coordinator)
**Ruling (the owner, 2026-10-18 02:20): A for now.** Prepare the public tree locally only. Publishing happens only after the owner has personally tested both Star Command and Pool of Radiance (later this week); then he answers B with a repo name.
SC-4 = A says the public game lives in a NEW repo made from a filtered clone. Creating and pushing a public GitHub repo publishes everything in it and cannot be fully undone (forks, caches), so it needs the owner's explicit go.
- **A (default):** the Foreman prepares the filtered public tree locally (a filtered clone in a sibling folder, scanned by a check that no original file, hash-matching byte run or game text is in it, and the game rebuilt from an imported copy) and reports it; nothing is created on GitHub until the owner answers B with a repo name.
- **B:** "Publish as <owner>/<name>": the Foreman creates the public repo and pushes the prepared tree after the checks pass.

