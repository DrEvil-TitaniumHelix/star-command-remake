# BYOC — "Bring Your Own Copy" design (Star Command, 2026-10-18, Foreman)

**Status: implemented (2026-10-18)**: B3 (translators in JS), B6 (public tree + leak scan, `docs/byoc/B6.md`) and B7 (integration and acceptance from an imported copy, `docs/byoc/B7.md`). Below is the design as written before; SC-3 is answered (A, the owner 2026-10-18): the game and our pseudocode/specs are public; only original bytes and direct extracts are removed. SC-4 = A (new public repo from a filtered clone, private repo untouched) and SC-5 = A (translators ported to JS, modules rebuilt in the browser byte-identical) are answered too.

## 1. Goal

The repository and its history contain **no file from the original game and nothing derived from one**. A player who owns Star Command (1988, SSI) points the game at their own `starcoma` folder once. The browser validates it by hash, converts it, and stores the result locally. From then on the game runs exactly as today.

## 2. What is original or original-derived today

Measured 2026-10-18. The originals are 123 files, 815,526 bytes.

| path | content | kind | size |
|---|---|---|---|
| `game/assets/files/` | 107 byte copies of the game disk (BLOAD banks, text files) | original | 718 KB |
| `game/assets/atlas.png` + `atlas.json` | every sprite of the .EGA/.BAS banks | derived (art) | 120 KB |
| `game/assets/data/*.json` | INFO, ENC*, MISSION, NAME, GALAXY, IN-n, MES-n tables | derived (data) | 649 KB |
| `game/assets/data/manual.json`, `items.json` | manual pages; item stats | derived (manual text, data) | in the line above |
| `game/assets/gmap.json` | names for the COMMON array | own analysis (no game bytes) | 24 KB |
| `game/assets/saves/veteran/` | CHARINFO.BAS built from INFO.json values | derived (data) | 69 KB |
| `game/modules/**` | generated JS: the compiled program transliterated statement by statement, **with every string literal inline** (e.g. `this.print(["A-Up Scan    B-Switch"])`, space.js 01B6C) | derived (code + text) | 1.3 MB |
| `decode/listings/` | disassembly listings with raw bytes | derived | 3.4 MB |
| `decode/brun30/` | BRUN30.EXE runtime disassembly + Ghidra decompilation (Microsoft code) | derived | 1.9 MB |
| `decode/pseudo/` | BASIC pseudocode of all modules, string text included | derived | 4.3 MB |
| `decode/data/png/` | 559 renders of the sprite banks | derived (art) | 1.3 MB |
| `decode/docs/` | the SSI manual (PDF + OCR text) | original (manual) | 6.1 MB |
| `acceptance/ref/`, `acceptance/out/` | screenshots of the original and of the port | derived (art) | 3.1 MB |
| everything else | engine (`game/engine/`), tools, ledgers of names and offsets, plans | own work | |

The font (`font8x8.json`, VileR Oldschool PC Font Pack, CC BY-SA 4.0) is licensed and stays.

**Consequence.** The game cannot become BYOC by moving the asset folder alone. The modules carry the game's text and logic, so they must also be built on the player's machine (tier 3 below).

## 3. Architecture

The repo ships only own work: the engine, an **importer**, and a **recipe**. The recipe holds our analysis (names, offsets, formats, translation rules) and no game bytes.

```
player's starcoma/ ──► importer (browser) ──► validated by SHA-256 manifest
                              │
            ┌─────────────────┼──────────────────────────┐
            ▼                 ▼                          ▼
   tier 1: files + data   tier 2: art              tier 3: code
   byte copies, JSON      atlas.png/.json          module JS from the EXEs
   tables, manual pages   from the .EGA/.BAS       (disassemble -> pseudocode -> JS)
            └─────────────────┴──────────────────────────┘
                              ▼
                 Origin Private File System (OPFS) "sc-assets/<version>/"
                              ▼
            engine loads from OPFS instead of game/assets/ (one base-URL switch)
```

### 3.1 Import (first start)

1. A start page appears when OPFS has no converted assets: "Star Command needs your copy of the game. Choose your STARCOMA folder." It uses `showDirectoryPicker()` (Chrome, read-only). Fallbacks are `<input type=file webkitdirectory>` and a .zip drop.
2. **Validation.** `docs/byoc/manifest.json` lists the 123 file names, sizes and SHA-256 hashes of the known release; hashes are not game content. Every required file must match. The extras COLOR.EXE, DEMO.EXE and FIXIT.EXE are optional. A mismatch names the file and the expected size. Other releases of the game can be added later as further manifests.
3. **Conversion** runs in a Web Worker with a progress bar. The steps are the three tiers below.
4. Output goes to OPFS under `sc-assets/<manifest-version>/` with a `done` marker and the recipe version. A new recipe version triggers re-conversion on the next start; the save games are untouched.
5. The engine gets one switch: `assetsBase` = OPFS URL (via `URL.createObjectURL` per file, or a service worker that serves OPFS paths). `files.js`, `data.js` and `sprites.js` already take a `base`, so nothing else changes.

### 3.2 Tier 1 — files and data

These are ports of `tools/convert_data.py`, `tools/items.py` and `tools/manual_pages.py` to JS. The formats are already specified in `decode/data/DATA_FILES.md`, and the BASIC `INPUT #` reader exists in `game/engine/data.js`.

The manual pages come from the player's manual only if they supply it. The manual is not in the game folder, so the "Manual on demand" feature then degrades to the "what the game really does" notes, which are our own text. Optionally the player can also pick the manual PDF.

The veteran crew save becomes a recipe: `tools/make_veteran_save.mjs` already writes CHARINFO by replaying STARPORT routines on INFO.json values. The same script runs in the worker against the converted INFO.json.

### 3.3 Tier 2 — art

This is a port of `tools/build_atlas.py` + `decode/data/tools/bsave.py`: BSAVE header, GET arrays, CGA 2bpp and EGA planar formats (SPRITES.md). The atlas layout is deterministic: same packing order as `sprites_index.tsv`, which itself is own work (names and offsets). So `atlas.json` is reproducible bit for bit, and the existing tests can compare it.

### 3.4 Tier 3 — code (the hard part)

Today: `decode/tools/qbdis.py` (EXE -> listing) -> `decode/pseudo/tools/qb2bas.py` (+ `<MOD>_names.json`, `_header.md`) -> `.bas.md` -> `game/modules/*/bas2js.py` -> module JS.

BYOC version: ship the **three translators ported to JS**, plus the **annotations**, and run them on the player's EXEs:

- `qbdis` (MZ parsing, 8086 decode of the compiled-BASIC subset, INT 3D/3E/3F runtime-call tables, inline args): about 1-2 k lines. Runtime names come from `rt_names.json` and `inline_args.json` (own analysis: names, not code).
- `qb2bas` and `bas2js`: today about 3.5 k lines of Python. They are pure text transforms, so the port is mechanical. A diff test proves the JS port reproduces today's `.bas.md` and module JS byte for byte on the developer's machine, where the originals exist.
- **Annotations shipped:** `<MOD>_names.json` (variable and sub names with evidence), the hand-written parts of `_header.md`, `CROSSREF` maps, the per-module devjump fixtures, and the hand-written glue in `game/modules/*/` (devjump.js, banks.js, shoot.mjs). These must be audited for quoted game text; today the `_why` evidence strings quote game strings, and those quotes are replaced by offsets.
- **Strings** never appear in the repo: in generated code they come from the EXE's string-literal init table at import (`len, descriptorAddr, text`, MODULE_CONSTANTS.md format). The JS port emits them straight into the OPFS module file.

The conversion is about 1 s per module in a worker. The result is the same module JS the game runs today, so acceptance carries over: the CI-style check is "OPFS output == today's game/modules output" on a machine with the originals.

### 3.5 What the repo keeps

The repo keeps the engine, the importer, the JS translators, the annotations, the manifests, the tests (comparing hashes, not content), the docs, and the plans and ledgers. The ledgers are audited the same way: they name and locate things, and any quoted original bytes or text are replaced by offsets.

## 4. Repository and history

"Not in history" means rewriting or replacing history. That is destructive, and the repo is currently **private** (GitHub visibility checked 2026-10-18), so nothing has been published.

- **Default plan (SC-4 A):** leave this private repo as the RE workspace. Create a **new public repo** from a filtered copy (`git filter-repo` on a clone, keeping only the own-work paths of section 3.5, plus a fresh tree for the importer). The private repo and its history are untouched; the public one never contained original material.
- Alternative (SC-4 B): rewrite this repo's history in place and force-push. This needs the owner's explicit yes, because it is irreversible for every clone.

The RE workspace (`decode/`, `acceptance/`) is the evidence behind the port. SC-3 decides whether it stays private (default) or is also published in a scrubbed form: listings and pseudocode with bytes and strings replaced by offsets, and no screenshots.

## 4b. Foreman decision (2026-10-18, reversible)
`decode/data/MODULE_CONSTANTS.md` lists every string literal of every module verbatim: a direct extract under SC-3. The public tree gets a variant with offsets and lengths instead of the text. Pseudocode files keep their quotes (SC-3 allows it).

## 5. Work breakdown (when lanes are free)

| step | work | size | model |
|---|---|---|---|
| B1 | manifest + importer page + OPFS store + `assetsBase` switch; tier 1 port (data, files) | M | codex / Opus |
| B2 | tier 2 atlas port + bit-for-bit atlas test | S | codex |
| B3 | tier 3: qbdis, qb2bas, bas2js ported to JS; byte-identical diff test on all 7 modules | L | Fable (disassembler) + codex (text transforms) |
| B4 | audit and scrub annotations, ledgers and glue for quoted game text (strings -> offsets) | M | Opus |
| B5 | veteran save as a recipe in the worker; manual optional import | S | codex |
| B6 | filtered public repo per SC-4 A; a check that greps the public tree for any hash or text of the originals | S | Opus |
| B7 | acceptance: fresh profile, import a real `starcoma`, run RUN-1 and RUN-2, compare shots to `acceptance/out` | M | Opus (one Chrome) |

## 6. Risks

- **Translator port fidelity.** It is mitigated by the byte-identical diff test against today's output; nothing ships until all 7 modules match.
- **OPFS quota and persistence.** About 4 MB, which is small. Call `navigator.storage.persist()`, and re-import if the browser clears it.
- **Other releases** (floppy versions, patched EXEs). They fail validation with a clear message. Adding a release later means a new manifest; its translations are validated the same way.
- **Legal reading.** Whether the shipped engine, translators and annotations are free of derived expression is a judgement for the owner. This design minimises derivation (names, offsets and formats only) but does not settle it.
