# Star Command in the browser

This folder is the playable port of **Star Command** (SSI, 1988). The parts of the original game (title, startup
menu, starport, space travel, stations, ship battles, ground battles) run as web pages, one after the other, as
they did on DOS. The look follows the original EGA screens. Your saved game uses the original save file format.

On top of the 1988 game there are some helpers (mouse, an Esc menu, save slots, a log book and more). They are
listed in [What is new compared with the 1988 game](#what-is-new-compared-with-the-1988-game). Each one can be
switched off, and **Classic mode** switches all of them off at once: then you play the original exactly.

## Starting the game

You need your own copy of the game (the `STARCOMA` folder), Python 3 and Chrome or Edge; see the repository
[README](../README.md#play) for details.

1. **Start the web server.** Open a terminal in the repository folder and type:

   ```
   python -I tools/serve.py 8088
   ```

   It prints `serving ... at http://localhost:8088/`. Leave that window open while you play; closing it stops the game.
   The game cannot be opened by double-clicking `index.html`, because the browser blocks that.

2. **Open the game in Chrome:** go to `http://localhost:8088/index.html`. On the first start the import page asks for
   your `STARCOMA` folder (or a .zip of it); the files are checked by hash, converted and stored in the browser. After
   that the game starts like the original: the title, then the startup menu.

3. **Fullscreen:** press **F11** (again to leave). To stop, close the tab and then the terminal (or **Ctrl+C** in it).

On Windows, double-click **`Play Star Command.cmd`** instead: it starts the server as a minimized window called
**"Star Command server"** (if it is not already running) and opens the game in Chrome as its own fullscreen window.
It expects `python` on the PATH and Chrome in its usual place. Close the game with **Alt+F4** or the Esc menu's
**Save & Quit**; close the minimized server window when you are done (leaving it running does no harm).

The picture grows in whole steps so the pixels stay sharp; on a 1920x1080 screen it is shown at double size
(1280x800). The space beside the picture shows the crew panel (see below) or stays black.

## Controls

Keyboard, mouse and gamepad all work at the same time. Press **F1** (gamepad **View / Back**) at any moment to see
the keys the current screen accepts.

### Keyboard (as in the original)

Everything works with the same keys as on DOS. The screen always shows what you can press.

| What you see | Press |
|---|---|
| Menus like `A-Up Scan`, `B-Dock With Starport` | the letter (upper or lower case) |
| `(Y/N)` / `(y/n)` questions | **Y** or **N** |
| `Press ENTER Key` | **Enter** |
| `Press SPACEBAR`, `SPACE to change weapon`, `SPACEBAR for more` | **Space** |
| crew pickers `1>name ... 6>name` | the digit **1**-**6** |
| moving the ship, the squad, cursors (the arrow cross on screen) | **arrow keys** |
| typed answers (time delay, names, save slot names) | type, **Backspace** to correct, **Enter** |
| room-script option lists inside stations | **Up** / **Down** (**PgUp** / **PgDn**), **Enter** |

Extra keys of the port: **Esc** = the Esc menu, **F1** = controls help, **F2** = game speed.

### Mouse

- **Click anything the game lets you press:** a menu letter (`A-Up Scan`, `G-Game Save` ...), the Y or N of a
  `(Y/N)` question, the word ENTER in `Press ENTER Key`, an arm of the arrow cross on screen, a crew or item number
  when the game asks "who" or "which" (also the `1>name` crew pickers), or the letters of the weapon shop chart.
  A click does exactly what that key does. The pointer turns into a hand over anything clickable.
- **Click a spot on a map** (station map, space maps, ground battlefield) to move one step towards it.
- **Mouse wheel** over a map zooms in; **right-click** zooms out.
- **Point at things** to see tooltips: shop items and crew rows, enemies in battle.
- **Buttons in the corners** (`?` help, `Log book`, `Manual`, `Speed`, and in battles `Range` / `Hit preview`)
  appear only while the mouse is over the picture, so the screen otherwise looks exactly like the original.

### Gamepad (standard layout)

| Gamepad button | Acts as |
|---|---|
| D-pad or left stick | arrow keys (hold to repeat) |
| **LB** / **RB** (or right stick up / down) | move a yellow box over the letter menu on screen (`A-Up Scan`, `B-Dock ...`) |
| **A** | chooses the boxed menu item; with no box: Enter |
| **B** | "N" (no) when the screen asks `(Y/N)`, otherwise opens the Esc menu |
| **X** | Space |
| **Y** | the letter Y (answers "yes") |
| **Start** (≡) | opens the Esc menu |
| **View / Back** (⧉) | controls help (F1); if the help is switched off, the Esc menu |

**Letter menus with the gamepad:** press **LB** or **RB** until the yellow box is on the item you want, then press
**A**. The box goes away when the menu changes. The d-pad always stays the arrow keys, because some screens (space,
stations, ground battle) use a letter menu and the arrows at the same time. Inside the Esc menu and the Settings page
the d-pad moves the choice and **A** picks it; **B** goes back.

**Not possible with the buttons alone** (use a mouse, a USB or Bluetooth keyboard, or the Windows touch keyboard:
an on-screen keyboard):
- crew pickers that show `1>name ... 6>name` (they need the digit, or a mouse click on the name)
- typed answers: the time delay, names, commands typed in station rooms, the name of a new save slot
- the corner buttons (Log book, Manual, Range, Hit preview) and the tooltips: they need the mouse.
  Game speed also has **F2**.

## What is new compared with the 1988 game

All of these are on unless you switch them off. Switch them one by one on the **Settings** page: **Esc**, then
**T-Settings** (or gamepad **Start**, then pick `T-Settings`). The letter in front of each line toggles it; arrows
and **Enter** / **Space** work too; **Esc** or **B** goes back. Your choices are remembered.

- **Classic mode** (Settings, **A**): switches every addition below off and gives you the original game exactly,
  including the rule-book question when saving and the single original save. Your other choices are kept for when
  you switch Classic off again. The address `http://localhost:8088/index.html?classic=1` starts a session in
  Classic mode.
- **Mouse on every hotkey** (Settings **C** `Mouse control`): click any key the screen shows, or a map spot to move
  there step by step (see *Mouse* above). Off = the mouse does nothing in the game.
- **Esc menu**: **Esc** (gamepad **Start**, or **B** when no `(Y/N)` question is up) pauses the game and shows
  `R-Resume`, `S-Save & Quit`, `Q-Quit without saving`, `T-Settings` and, with save slots on, `L-Load`. Press the
  letter, use the arrows and **Enter**, the gamepad, or click. This menu is always there, also in Classic mode.
  - *Save & Quit* at the starport main menu saves the game as it is now. Anywhere else it saves your last safe
    point (arriving at a starport, its main menu, or your last departure from a starport), because the game can
    only continue a save at a starport. The menu tells you which point it will save before you choose.
  - *Quit* closes the game window, or says "You can close this window."
- **No rule-book question** (Settings **D** `Skip rule-book question`): **G-Game Save** at the starport saves at
  once. Off (or Classic mode) = the original asks for a word from the rule book first.
- **Controls help** (Settings **E** `Control overlay (F1)`): **F1**, gamepad **View / Back**, or the small `?` in
  the bottom-right corner lists every key the current screen accepts, plus the gamepad and mouse controls. Press
  **F1** again to close it. The game keeps running behind it.
- **Map zoom** (Settings **F**): on any map (space maps, station map, battlefield) roll the **mouse wheel** to zoom
  in around the pointer (up to 4 times), **right-click** to zoom out, or click an empty spot of the map to zoom in
  there. Clicking keys and map spots still works while zoomed. Leaving the map resets the zoom.
- **Item tooltips** (Settings **P**): point at a weapon, armor, equipment, ship or crew row in the shops, inspect
  and equip screens to see its numbers and price (damage, shots, range, weight, armor, monthly pay ...). All
  numbers come from the game's own data; starport prices include the starport's 20 % markup, as the game charges.
  For crew rows the gamepad works too: point the yellow box at the row.
- **Save slots and autosave** (Settings **L** `Named save slots`): **Esc**, **S** lets you save under a name (a new
  slot or one you overwrite) and then quits. **Esc**, **L** loads a slot. On the title menu, **1-Play Star Command**
  lets you pick a slot or `Continue current disk` (the normal save). An **Autosave** slot is written every time you
  arrive at a starport. Off (or Classic mode) = the one original save only.
- **Crew panel** (Settings **J** `Crew status panel`): when the screen is wider than the picture (as on a 16:9 screen), a
  panel beside it shows the whole crew: health, weapon, ammo and reloads; stamina in ground battles; fuel, armor and
  the ship's systems in space.
- **Log book** (Settings **K**): the `Log book` corner button (mouse over the picture) opens a journal of your game:
  mission briefings word for word, arrivals, battles with their report numbers, credits, deaths and medals. It is
  saved with your game and cleared when you start a new game.
- **Combat aids** (Settings **G** `Enemy tooltips`, **H** `Range overlay`, **I** `Hit-chance preview`): point at an
  enemy group or ship to see its health, armor, weapon, range, tactic and how many are left. In the ground battle
  command phase, move the mouse to the lower-right corner for `Range` (who can reach whom, by the game's own rule)
  and `Hit preview` (chance to hit, expected hits and damage, from the game's own formulas). They only show
  information; they never change a fight.
- **Manual button** (Settings **M** `Manual on demand`): the `Manual` corner button shows the rule-book pages for
  the current screen, and in 60 places where the rule book is wrong, what the game really does. **Not in this
  public build:** the rule book is not distributed, so the button stays off.
- **Game speed** (Settings **N** `Speed toggle`): **F2** or the `Speed` corner button cycles normal / fast / fastest.
  It only shortens the game's waiting pauses; it never changes what happens.
- **Mission marker** (Settings **O** `Mission-target marker`): yellow boxes on the galaxy and long-range maps mark
  the targets of your unfinished missions.
- **Load veteran crew** (Settings **V**): replaces the current game with a ready-made strong crew (see below).

## Saving

- **Saving works as in the original:** at the Starport main menu choose **G-Game Save**. In this port it saves at
  once. In Classic mode (or with `Skip rule-book question` off) the game first asks for a word from the rule book
  ("Type the *n*th word in section *s*"), which is the original copy protection; have the rule book ready then.
- **Other ways to save:** **Esc**, **S-Save & Quit**, named save slots and the autosave at every starport arrival
  (see *What is new*).
- The save is the original `CHARINFO.BAS` file, kept **inside Chrome** for the page `localhost:8088` (browser
  storage). It survives closing Chrome and restarting the computer. Save slots and the log book are kept there too.
- Space-station visits also remember their explored maps (same storage).
- Until you save, the game uses the save that came with the original disks.
- **Things that lose the save:** clearing Chrome's browsing data / site data for `localhost`, playing in an
  Incognito window (nothing is kept), or using a different port number. The storage belongs to
  `localhost:8088`, so always use the same address.

### Veteran crew

A ready-to-play save: eight veterans with the best personal gear, a fully fitted Warrior-class ship (ISS Valkyrie),
50,000 credits and the first mission active, docked at the starport main menu.

- **Start:** double-click `Play Star Command (Veteran Crew).cmd`,
  then any key at the title and **1-Play Star Command**. Manual address:
  `http://127.0.0.1:8088/index.html?save=veteran&force=1`.
- Every launch restores the same fixed starting point (station maps from earlier runs are forgotten too). A page
  reload inside the session keeps what you saved since.
- The launcher uses `127.0.0.1` instead of `localhost`: a separate browser storage, so the regular game's
  continuing save is never touched.
- In a running game: **Esc**, **T-Settings**, **V-Load veteran crew**, answer **Y** to replace the current game
  with the veteran crew (the page reloads; go to the title and choose 1-Play).
- The veteran save is built from your own copy at import (`game/byoc/convert/veteran.js`).

## Developer shortcut: `?screen=<id>`

`http://localhost:8088/index.html?screen=SP-04` jumps straight to one screen instead of playing up to it. The
game loads the original save from your imported copy, a test crew and the original key presses that lead there. Screen ids are the
ones in `decode/pseudo/SCREENS_INDEX.md` and `ACCEPTANCE.md`:

| prefix | part of the game |
|---|---|
| CM, SU | title / startup menu |
| PT | Starport |
| SP | space travel |
| IN | inside a station or base |
| SB | ship-to-ship battle |
| PB | ground battle |

These jumps are for testing. They use a fixed test crew and a fixed random seed, so a game started this way is not
your real save, and it never writes an autosave. Use the plain address to play.

`?demo=1` and `?demo=put` show engine test pictures. `?protection=1` brings back the rule-book question for one
session.

## Known gaps

As of 2026-10-18, from `ACCEPTANCE.md` and `acceptance/DOSBOX_REQUESTS.md`.

**How much is checked against the original**
- **All parts of the game are built and playable**, ship battles and ground battles included.
- **90 screens** are on the check list. Every one has the builder's check and a second reviewer's check, and
  **all 90 pass**.
- The original game was run in DOSBox and photographed screen by screen. In the final comparison (2026-10-18)
  **64 screens** were compared with the port: **62 match**, **none differ**, and 2 could not be shown in the original
  (equipment pages with no items). One difference found on the way was fixed: the planet scan printed the mass
  `.01` as `1E-02`; numbers are now printed exactly as the original program does it.
- More than 13 questions about the original's behaviour were answered with DOSBox, for example that the squad *can*
  leave a room fight through the door (the port now does the same).
- The additions in *What is new* were each checked by an independent reviewer. With them switched off or idle,
  the checked screens look the same as before.

**Still waiting for a comparison with the real DOS game**
- **D-IN-3:** using **V-View** with an esper inside a station: after the flash, does the map keep the drawn rooms
  with the "beings" marks? Needs an esper with enough skill in the original.
- **D-MX-2:** ship battle shields: with only Shield #1 fitted, does fire from straight ahead hit that shield?
- **Ground battle beam weapons:** their flash lines are now drawn dashed, as the original program says; not yet
  compared with a DOSBox picture.

**Colours (what to expect)**
- The port uses the original's EGA colours. Text and frames are **light grey** from the start of a game until your
  first ground battle, and **white** after it for the rest of the session. The original on an EGA does the same.
- Small colour differences to your own DOSBox setup are expected.

**Not in the port on purpose**
- The floppy "Insert disk B in drive A" prompts (ST-01) are not shown. The port behaves like a hard-disk install.
