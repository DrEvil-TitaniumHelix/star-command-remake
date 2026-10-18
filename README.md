# Star Command (SSI, 1988) in the browser

A faithful rebuild of **Star Command** (Strategic Simulations, Inc., 1988; written by Winston Douglas Wood) that runs in
a web browser. It was made from a full decode of the original QuickBASIC 3 program: every module of the original was
turned into readable pseudocode, verified, and translated into a JavaScript engine. Status: **alpha (v0.1.0-alpha)**,
ready for community testing.

**Bring your own copy.** This repository contains none of the game's files: no program, data, graphics or sound. You
need your own copy of Star Command; the browser checks it and builds the game from it on your machine. The engine was
built from an analysis of the original program, not clean-room; all rights to Star Command stay with its author and
publisher.

- [Play](#play) · [Modify](#modify) · [Decode](#decode) · [Credits and licence](#credits-and-licence)

## Play

### What you need
- **Your own Star Command folder** (the `STARCOMA` folder of the original release: `STARCOMM.EXE`, `BRUN30.EXE`, the
  `.EXE` modules, the `.BAS` / `.EGA` sprite banks and the data files). The importer knows exactly one release
  (`docs/byoc/manifest.json`: 123 files, 115 required, checked by size and SHA-256). Other releases are untested; if
  yours is refused, please open an issue with the importer's list of mismatched files (names only, never the files).
- A current **Chrome or Edge** (tested in Chrome). Other browsers may work through the folder or .zip fallback.
- **Python 3** for the small local web server (or any static web server). The game cannot run from a double-clicked
  `index.html`, because browsers block ES modules on `file://`.

### Start
1. Get the game: `git clone https://github.com/DrEvil-TitaniumHelix/star-command-remake`, or download the release zip
   from the repository's *Releases* page and unpack it.
2. In that folder, start the server: `python -I tools/serve.py 8088` (it prints `serving ... at http://localhost:8088/`;
   leave it open while you play).
3. Open **http://localhost:8088/index.html** in Chrome. Press **F11** for fullscreen.
4. **First start only:** the import page says *"Star Command needs your copy of the game"*. Choose your `STARCOMA`
   folder (*Choose folder*, the alternative picker, or drop a .zip of the folder). The files are checked, converted in
   the browser (a few seconds) and stored; then *Play Star Command*. From then on the game starts directly.

On Windows, `Play Star Command.cmd` does steps 2 and 3 for you (it expects `python` on the PATH and Chrome in its usual
place). `Play Star Command (Veteran Crew).cmd` starts a ready-made strong crew in a separate browser storage.

### Where your saves live
Everything stays **in your browser**, for the address you use (`localhost:8088`): your imported copy (converted, in the
browser's private file storage), the game's original save file `CHARINFO.BAS`, save slots, autosave and log book.
Nothing is uploaded. You lose them if you clear the site data for `localhost`, play in a private window, or use a
different port, so always use the same address.

### Controls
Keyboard, mouse and gamepad work at the same time; **F1** (gamepad *View / Back*) shows the keys the current screen
accepts.
- **Keyboard** as in the original: the letters shown in menus, **Y / N**, **Enter**, **Space**, digits **1-6** for crew
  pickers, **arrow keys** to move. Extra: **Esc** = pause menu (save & quit, load, settings), **F1** = help, **F2** = game
  speed.
- **Mouse**: click any key the screen shows, click a map spot to move towards it, wheel to zoom maps, tooltips on items
  and enemies.
- **Gamepad** (standard layout): d-pad / left stick = arrows, **LB / RB** move a box over the letter menu, **A** = choose /
  Enter, **B** = No or the pause menu, **X** = Space, **Y** = Yes, **Start** = pause menu. Crew pickers and typed answers
  need a keyboard or the mouse.

All additions to the 1988 game (mouse, pause menu, help, zoom, tooltips, save slots, crew panel, log book, combat aids,
speed, mission marker) can be switched off one by one in **Esc, T-Settings**; **Classic mode** switches them all off
for the original game as the acceptance screens checked it. The full player guide is [game/README.md](game/README.md).

### Known alpha limitations
- The **Manual** button is off: the rule book is not distributed with this repository.
- Two behaviours still wait for a check against the real game (`game/README.md`, *Known gaps*): the esper **V-View**
  inside a station (D-IN-3) and single-shield facing in ship battles (D-MX-2). Ground-battle beam flashes follow the
  program but were not compared with a DOSBox picture.
- The floppy "insert disk" prompts are not shown (the port behaves like a hard-disk install).
- Colours: text is light grey until your first ground battle and white afterwards, as on an EGA original.

### Report a problem
Open an issue in this repository (templates are provided): name the **screen** (what it shows, or its id from
`ACCEPTANCE.md` such as `SP-04`), attach your save if you can (Esc menu, or the browser storage export), and say which
**browser** and version. If you find that the original game does the same thing, say so: such reports get the
"original did this too" label and are just as useful.

## Modify

- **Engine** (`game/engine/`): display, input, the QuickBASIC runtime semantics (`basic.js`, number formatting
  transcribed from the BRUN30 runtime), files, overlays and every addition. Hand-written modules: `game/modules/`.
- **Game logic**: the original's program modules (SPACE, INSIDE, STARPORT, SPBATTLE, PLBATTLE) are translated **in your
  browser** from your own copy at import, by the translators in `game/byoc/` (`qbdis.js` disassembler, `qb2bas.js`
  pseudocode renderer, `bas2js.js` JavaScript generator) with the names and annotations of this repository. The result
  is readable JavaScript with the original offsets as labels, stored in the browser.
- **Change a rule or a screen**: a module file placed in `game/modules/` is served before the imported one (service
  worker `game/byoc-sw.js`: network first, the imported copy only when the file is absent). To get the generated
  modules as files, run `python -I tools/byoc/rebuild_all.py --originals <your STARCOMA folder> --out <dir> --keep`:
  it writes `space.js`, `starport.js` (= `starport/flow.js`), `inside.js`, `spbattle.js`, `plbattle.js` and the
  `*.banks.js` files to `<dir>/js/` (lines `BUILT`). Copy the one you want to its path under `game/modules/`, edit,
  reload. Engine-level changes are ordinary edits in `game/engine/`.
- **Acceptance**: `ACCEPTANCE.md` lists 90 screens; each has a build check and an independent review (90/90 pass). 64
  were compared pixel by pixel with the original running in DOSBox-X: 62 match apart from test data (crew names,
  dice rolls), none differ, 2 cannot be shown in the original. Tools: `acceptance/` (screenshot driver
  `acceptance/ref/scripts/shoot_all.mjs`, comparer `compare.py`, verdict files). Screenshots are not committed (they
  show the original's art); you regenerate them from your own copy. Engine unit tests: `node game/engine/*.test.mjs`.
- Developer jump to one screen: `index.html?screen=SP-04` (ids in `decode/pseudo/SCREENS_INDEX.md`).

## Decode

- `decode/pseudo/` — the decoded program: one BASIC-style pseudocode file per original module (`<MODULE>.bas.md`), its
  screens (`_SCREENS.md`), names and the independent verification reports (`_VERIFY.md`, `_GLMVERIFY.md`).
- `decode/brun30/` — the QuickBASIC 3 runtime, named once: ledger of the 140 routines the game uses, review, the
  number-output and CIRCLE algorithms.
- `decode/data/` — data-format specs (sprite banks, data files, module constants as offsets).
- `DECODE_GATE.md` — the gate that had to be met (with evidence) before building; `BUILD_PLAN.md`; `docs/BYOC.md`,
  `docs/byoc/` — how the public tree stays free of original bytes (path policy, leak scan, B6/B7 reports).
- Evidence rules: every claim cites a module and offset or is marked unknown; quoted game text is short and serves as
  evidence. The working logs (`FOREMAN.md`, `STATUS.md`, `RULINGS.md`, `herdr/`) are kept as the record of how the
  decode was run.

Built with **Remaster DOS Games** (https://github.com/DrEvil-TitaniumHelix/remaster-dos-games), method version
v0.1.0: the method, tools and templates this decode followed.

## Credits and licence

- **Star Command** © 1988 Strategic Simulations, Inc. (SSI); game by Winston Douglas Wood. All rights to the game stay
  with its author and publisher. This project is not affiliated with or endorsed by them.
- Rebuild, decode and tools: **DrEvil** (DrEvil and Titanium Helix LLC).
- Code: MIT ([LICENSE-MIT](LICENSE-MIT)); documentation: CC BY 4.0 ([LICENSE-DOCS](LICENSE-DOCS)); see [LICENSE](LICENSE).
- Bring your own copy: this repository contains no original game files; the engine was derived from analysis of the
  original program, not clean-room.

Disclaimer: all or part of this repository may have been written or edited by super intelligence
