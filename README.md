# Star Command (SSI, 1988) in the browser

A faithful rebuild of **Star Command** (Strategic Simulations, Inc., 1988; written by Winston Douglas Wood) that runs in
a web browser. It was made from a decode of the original QuickBASIC 3 program: its seven main modules were
turned into readable pseudocode, reviewed, and translated into a JavaScript engine. Status: **beta (v0.1.5-beta)**,
ready for community testing.

**Bring your own copy.** This repository contains none of the game's files: no program, data, graphics or sound. You
need your own copy of Star Command; the browser checks it and builds the game from it on your machine. The engine was
built from an analysis of the original program, not clean-room; all rights to Star Command stay with its author and
publisher.

- [Play](#play) · [Modify](#modify) · [Decode](#decode) · [Credits and licence](#credits-and-licence)

## Play

### What you need
- **Your own original Star Command game folder**, or a ZIP containing it. Versions **1.0 and 1.2** are supported.
  The importer checks the game files and reports the version it recognises. If your copy is refused, include the
  displayed problem text in an issue; do not upload the original game files.
- A current **Chrome or Edge** (tested in Chrome). Other browsers need the same local storage features; choosing
  a ZIP instead of a folder does not remove that requirement.
- **Windows:** the launchers use built-in Windows PowerShell and Microsoft Edge, or Chrome when installed. Python is
  optional. On other systems, use **Python 3** or any static web server; browsers block ES modules on `file://`.

### Start
1. Download the release ZIP from this repository's **Releases** page and unpack it.
2. **On Windows, double-click `StarCommand.exe`.** Python and Chrome are optional: the launcher can use
   Windows PowerShell and Microsoft Edge. The game opens in a normal, resizable window. **F11** switches fullscreen
   on or off if you want it.
3. On the first start, choose the folder containing your original game, or drop a ZIP of that folder on the import
   page. Wait while the game is checked and prepared; it opens automatically, or choose **Play Star Command**.
   The time depends on your computer and how quickly the files can be read; keep the page open until it finishes.
4. On later starts, use the same launcher and browser to return to your imported game and saves.

`StarCommand.exe` uses a separate browser profile in `recomp-profile` inside the installation, remembers its local
address and stops its server when the game closes. The alternative `Play Star Command.cmd` uses
`http://localhost:8088/index.html` in the browser's normal profile. `Play Star Command (Veteran Crew).cmd` uses
`http://127.0.0.1:8088/index.html?save=veteran`, a separate save address, and keeps an existing save.
For the command-script launchers, the background server stops about 10 seconds after the last game window closes,
or after two minutes if no game window appears. Save at a starport with **Esc, S-Save & Quit** before closing;
away from a starport, Save & Quit returns to your last starport save.

In **RecompLauncher**, select your original game folder and press **Play**. It uses a separate browser profile inside
the installation, shared with `StarCommand.exe`, and stops its server when the game closes. It reuses a ready import;
the original folder is needed for a new import. Selecting a different folder offers a choice of copies. After the
first launch it keeps the same saved address; if another program uses that address's port, close that program and
retry. Launch failures display a reason.

**Other systems, or a manual start:** install Python 3, open a terminal in the unpacked project folder and run
`python -I tools/serve.py 8088`. Leave it running and open **http://localhost:8088/index.html** in Chrome or Edge.
After saving and closing the game, press **Ctrl+C** in the terminal to stop the server. Opening the game page directly
from the file manager does not work.

### Updating

When an update changes how the game is prepared, an intact imported copy is prepared again automatically from the
original files already stored in the browser. Wait for completion, then choose **Play Star Command** if it does not
open automatically. Your saved games are stored separately and this preparation does not replace them.

Choose the original folder again if the browser no longer has a complete imported copy, such as after interrupted
preparation, or the stored files fail their checks. Clearing site data or changing browser, profile or address can
also make the stored copy unavailable.
Keep the browser data when replacing the installed program; for `StarCommand.exe` or RecompLauncher, keep the
`recomp-profile` folder too.

### Where your saves live
Your imported copy, saved game, named slots, autosave, saved log book and settings live in the browser profile used
for that game address. The two command-script launchers use separate storage. `StarCommand.exe` and RecompLauncher
share storage when run from the same installation. Changing browser, profile or address shows different storage;
it does not move or erase the old save. Return to the original browser and address to find it. Clearing that site's
data deletes its import and saves; private browsing does not
keep them after the private session ends.

**Importing happens on this computer and does not upload your files.** If you enable **RecompLauncher cloud backups**,
the launcher can upload the game's browser-data backups, including saved progress and stored imported game data.
Those backups are separate from the local import process.

### Backups and removing the game

The game has no save-export button. Named slots live in the same browser storage as the current save; they are not
separate backups. Before deleting anything you want to keep, save, close the game and all windows of its browser,
then back up that browser's complete data folder. For `StarCommand.exe` or RecompLauncher, copy the whole
`recomp-profile` folder from the installation to a safe place, including its saved address. Keep your original
game folder separately.

- **Command-script launchers or manual browser play:** deleting the unpacked game folder leaves
  imports and saves in the normal browser profile. To remove those too, use that browser's site-data settings for
  the game's address. Check both `localhost` and `127.0.0.1` if you used both launchers; other local applications may
  use those hosts too, so check what the browser is about to remove.
- **`StarCommand.exe` or RecompLauncher:** removing only the RecompLauncher library entry can leave the installation.
  Deleting the installation folder also removes the separate browser profile inside it, including its imports and
  saves. Back it up first.
- Local backups stored elsewhere, cloud backups and a separate original game folder remain. Manage those separately
  if you also want to remove them.

### Controls
With the helpers enabled, keyboard and mouse work at the same time; **F1** opens
Star Command Plus; its Help tab shows the keys the current screen accepts.
- **Keyboard** as in the original: the letters shown in menus, **Y / N**, **Enter**, **Space**, digits **1-6** for crew
  pickers, **arrow keys** to move. Extra: **Esc** = pause menu (save & quit, load, settings), **F1** = Star Command Plus, **F2** = game
  speed.
- **Mouse**: click recognised menu choices, click a map spot to move towards it, tooltips on items
  and enemies.

**Esc, T-Settings** opens the **Star Command Plus** window. Use its checkboxes to switch helpers on or off; Sound,
Music and Sound effects have separate switches. The pause menu and keyboard **F1** remain available. Plus also has
Crew, Help and Log book tabs, and F1 reopens it on the tab you used last. The game keeps running while Plus is open; use the pause menu when you need to pause.
The full player guide is [game/README.md](game/README.md).

### Known beta limitations
- The **Manual** button and tab are hidden: the rule book is not distributed with this repository.
- Two behaviours still wait for a check against the real game ([player guide](game/README.md#known-gaps)): the esper
  **V-View** inside a station and single-shield facing in ship battles. Ground-battle beam flashes follow the
  program but were not compared with a DOSBox picture.
- The floppy "insert disk" prompts are not shown (the port behaves like a hard-disk install).
- Colours: text is light grey until your first ground battle and white afterwards, as on an EGA original.

### Report a problem
Open an issue in this repository (templates are provided): describe the **screen**, what you did and what happened,
and say which **browser** and version you use. The Esc menu saves inside the browser; it cannot export an attachment.
If you find that the original game does the same thing, say so: such reports get the
"original did this too" label and are just as useful.

## Modify

- **Engine** (`game/engine/`): display, input, the QuickBASIC runtime semantics (`basic.js`, number formatting
  transcribed from the BRUN30 runtime), files, overlays and every addition. Hand-written modules: `game/modules/`.
- **Game logic**: the original's program modules (SPACE, INSIDE, STARPORT, SPBATTLE, PLBATTLE) are translated **in your
  browser** from your own copy at import, by the translators in `game/byoc/` (`qbdis.js` disassembler, `qb2bas.js`
  pseudocode renderer, `bas2js.js` JavaScript generator) with the names and annotations of this repository. The result
  is readable JavaScript with the original offsets as labels, stored in the browser.
- **Change a rule or a screen**: use a source checkout for the tools below. Disk-based builds load module files from
  `game/modules/`. Imported play with `?assets=opfs` prefers the copy stored in the browser, even if a module exists
  on the server; changing only the server file will not override it. Re-import to apply translator changes to an
  imported game. To inspect generated
  modules as files, run `python -I tools/byoc/rebuild_all.py --originals <your STARCOMA folder> --out <dir> --keep`:
  it writes `space.js`, `starport.js` (= `starport/flow.js`), `inside.js`, `spbattle.js`, `plbattle.js` and the
  `*.banks.js` files to `<dir>/js/` (lines `BUILT` for files absent from the checkout). It also compares decoded files;
  `DIFFER` lines and exit code 1 can occur even when the modules were written. A disk-based development build also
  needs its generated assets. Engine-level changes are ordinary edits in `game/engine/`.
- **Acceptance**: `ACCEPTANCE.md` lists 90 screens; each has a build check and an independent review (90/90 pass).
  Of 64 reference cases checked against the original running in DOSBox-X, 62 match apart from test data (crew names,
  dice rolls), none differ, 2 were not reached with the reference save. Tools: `acceptance/` (screenshot driver
  `acceptance/ref/scripts/shoot_all.mjs`, comparer `acceptance/ref/scripts/compare.py`, verdict files). Screenshots
  are not committed (they show the original's art); you regenerate them from your own copy. Run each
  `game/engine/*.test.mjs` file separately with Node; asset-dependent tests also need the generated files from your
  own copy. `game/engine/misc.test.mjs`
  additionally needs the omitted manual data.
- Developer jump to one screen: `index.html?screen=SP-04` (ids in `decode/pseudo/SCREENS_INDEX.md`).

## Decode

- `decode/pseudo/` — the decoded program: seven BASIC-style pseudocode files (`<MODULE>.bas.md`), screen notes
  (`*_SCREENS.md`), names and the independent verification reports (`*_VERIFY.md`, `*_GLMVERIFY.md`).
- `decode/brun30/` — the QuickBASIC 3 runtime, named once: ledger of the routines the game uses, review, the
  number-output and CIRCLE algorithms.
- `decode/data/` — data-format specs (sprite banks, data files, module constants as offsets).
- `docs/BYOC.md`, `docs/byoc/` — how the public tree stays free of original bytes (path policy, leak scan, B6/B7 reports).
- Evidence rules: every claim cites a module and offset or is marked unknown; quoted game text is short and serves as
  evidence.

## Credits and licence

- **Star Command** © 1988 Strategic Simulations, Inc. (SSI); game by Winston Douglas Wood. All rights to the game stay
  with its author and publisher. This project is not affiliated with or endorsed by them.
- Rebuild, decode and tools: **DrEvil** (DrEvil and Titanium Helix LLC).
- Code: MIT ([LICENSE-MIT](LICENSE-MIT)); documentation: CC BY 4.0 ([LICENSE-DOCS](LICENSE-DOCS)); see [LICENSE](LICENSE).
- Bring your own copy: this repository contains no original game files; the engine was derived from analysis of the
  original program, not clean-room.

Disclaimer: all or part of this repository may have been written or edited by super intelligence
