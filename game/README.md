# Star Command in the browser

This folder is the playable port of **Star Command** (SSI, 1988). The parts of the original game (title, startup
menu, starport, space travel, stations, ship battles, ground battles) run in the game window, one after the other, as
they did on DOS. The look follows the original EGA screens. Your saved game uses the original save file format.

On top of the 1988 game there are some helpers (mouse, an Esc menu, save slots, a log book and more). They are
listed in [What is new compared with the 1988 game](#what-is-new-compared-with-the-1988-game). **Esc, T-Settings**
opens their switches. The pause menu and keyboard **F1** remain available.

## Starting the game

You need your original Star Command game folder, version **1.0 or 1.2**, and a current Chrome or Edge. Python and
Chrome are optional on Windows: the launcher can use Windows PowerShell and Microsoft Edge.

1. **On Windows, double-click `Play Star Command.cmd`** in the unpacked release. The game opens in a normal,
   resizable window. In RecompLauncher, select your original game folder and press **Play** instead.
2. On first import, choose your original game folder or drop a ZIP containing it on the import page. RecompLauncher
   supplies its selected folder automatically. Wait while the copy is checked and prepared, then choose **Play Star
   Command** if it does not open automatically. Preparation time depends on the computer and the source files.
3. At the title, press **Enter**, then choose **1-Play Star Command** on the startup menu. Use the same
   launcher and browser on later visits so you return to the same saves.
4. **Esc, S-Save & Quit** saves a starport checkpoint and closes the game. Closing the window with **Alt+F4** does
   not save. The Windows launcher's background server stops shortly after the last game window closes.

**F11** switches fullscreen on or off when you want it. The picture grows in whole steps as the window grows, keeping
pixels sharp; unused space stays black or holds the crew panel when there is room.

For other systems or manual server startup, follow the [startup instructions](../README.md#start). For updates,
[an intact stored import is prepared again automatically](../README.md#updating); choosing the original folder again
is a recovery step, not a requirement for every update. RecompLauncher currently also needs its selected original
folder to remain available when starting.

## Controls

Keyboard, mouse and gamepad all work at the same time. Press **F1** (gamepad **View / Back**) during play to open
Star Command Plus; its Help tab shows the keys the current screen accepts.

### Keyboard (as in the original)

Use the original game's keys below. If a screen leaves a key unexplained, **F1** opens Star Command Plus, whose Help tab lists that screen's keys.

| What you see | Press |
|---|---|
| Menus like `A-Up Scan`, `B-Dock With Starport` | the letter (upper or lower case) |
| `(Y/N)` / `(y/n)` questions | **Y** or **N** |
| `Press ENTER Key` | **Enter** |
| `Press SPACEBAR`, `SPACE to change weapon`, `SPACEBAR for more` | **Space** |
| crew pickers `1>name ... 6>name` | the digit **1**-**6** |
| moving the ship, the squad, cursors (the arrow cross on screen) | **arrow keys** |
| typed answers (time delay, names, save slot names) | type, **Backspace** to correct, **Enter** |
| option lists inside stations | **Up** / **Down**, **Enter** |

Extra keys of the port: **Esc** = the Esc menu, **F1** = Star Command Plus, **F2** = game speed.

### Mouse

- **Click recognised choices:** a menu letter (`A-Up Scan`, `G-Game Save` ...), the Y or N of a
  `(Y/N)` question, the word ENTER in `Press ENTER Key`, an arm of the arrow cross on screen, a crew or item number
  when the game asks "who" or "which" (also the `1>name` crew pickers), or the letters of the weapon shop chart.
  A click does exactly what that key does. The pointer turns into a hand over anything clickable.
- **Click a spot on a map** (station map, space maps, ground battlefield) to move one step towards it.
- **Point at things** to see tooltips: shop items and crew rows, enemies in battle.
- **Buttons in the corners** include `?` (Star Command Plus), `Speed`, and in battles `Range` / `Hit preview`.
  Move the mouse over the picture to reveal them. The Manual button is hidden in this public build.
- When you click back into the game after using another window, the first click restores focus; **Click again to
  play** means the next click will act on the game.

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
| **View / Back** (⧉) | Star Command Plus (F1); if the help is switched off, the Esc menu |

**Letter menus with the gamepad:** press **LB** or **RB** until the yellow box is on the item you want, then press
**A**. The box goes away when the menu changes. The d-pad always stays the arrow keys, because some screens (space,
stations, ground battle) use a letter menu and the arrows at the same time. Inside the Esc menu, the d-pad moves the
choice and **A** picks it; **B** goes back. The separate Plus window uses the mouse or keyboard, not these gamepad
menu controls.

**Not possible with the buttons alone** (use a mouse, a USB or Bluetooth keyboard, or the Windows touch keyboard:
an on-screen keyboard):
- crew pickers that show `1>name ... 6>name` (they need the digit, or a mouse click on the name)
- typed answers: the time delay, names, commands typed in station rooms, the name of a new save slot
- the Range and Hit preview buttons and pointing at enemies: use the mouse. The Plus window also has a Log book tab.
  Game speed has **F2**.

## What is new compared with the 1988 game

**Esc**, then **T-Settings** (or gamepad **Start**, then choose `T-Settings`) opens **Star Command Plus**. Choose the
Settings tab and click a checkbox, or use **Tab** to reach it and **Space** to change it. Your choices are remembered.
Helpers start enabled, except that Manual is hidden when its text is unavailable. The pause menu cannot be disabled.

Plus has **Crew**, **Help**, **Settings** and **Log book** tabs; **F1** reopens it on the tab you used last. Close it with its window close button or **Alt+F4** while that
window has focus. The game keeps running while Plus is open; open the Esc menu in the game when you need a pause.
If the browser blocks the separate window, Help and Settings appear in a movable panel on the game page. Close that
panel with its close button or **Esc** while it has focus.

- **Mouse control**: click a recognised choice, or a map spot to move
  there step by step (see *Mouse* above). Turning it off disables these game commands; Plus controls remain usable.
- **Esc menu**: **Esc** (gamepad **Start**, or **B** when no `(Y/N)` question is up) pauses the game and shows
  `R-Resume`, `S-Save & Quit`, `Q-Quit without saving`, `T-Settings` and, with save slots on, `L-Load`. Press the
  letter, use the arrows and **Enter**, the gamepad, or click. This menu is always there.
  - *Save & Quit* at the starport main menu saves the game as it is now. Anywhere else it saves your last safe
    point (arriving at a starport, its main menu, or your last departure from a starport), because the game can
    only continue a save at a starport. The menu tells you which point it will save before you choose.
  - *Quit* asks before discarding changed progress, then closes the game window. If the browser keeps it open, the
    page tells you that you can close it and offers **Enter** to return to the title.
- **Skip rule-book question**: **G-Game Save** at the starport saves at
  once. Off = the original asks for a word from the rule book first.
- **Controls help**: the Plus Help tab shows the current screen's keys and general controls; **F1** opens Plus. The switch
  **Help button (?) and gamepad Back** controls the mouse button and gamepad shortcut; keyboard **F1** still works.
- **Item tooltips**: point at a weapon, armor, equipment, ship or crew row in the shops, inspect
  and equip screens to see its numbers and price (damage, shots, range, weight, armor, monthly pay ...). All
  numbers come from the game's own data; starport prices include the starport's 20 % markup, as the game charges.
- **Named save slots**: **Esc**, **S** lets you save under a name (a new
  slot or one you overwrite) and then quits. **Esc**, **L** loads a slot. On the title menu, **1-Play Star Command**
  lets you pick a slot or continue the normal save. Use **Up** / **Down** and **Enter**, or click the row. An
  **Autosave** slot is written every time you arrive at a starport. Turning this off hides the slots and stops new
  autosaves; it does not delete existing slots.
- **Crew status**: the Plus Crew tab shows the whole crew, and when the window has enough spare space beside the
  picture a panel beside it shows the same: health, weapon, ammo and reloads; stamina in ground battles; fuel, armor and
  the ship's systems in space.
- **Log book**: the Plus Log book tab opens your journal: mission briefings,
  arrivals, battles, credits, deaths and medals. It follows save checkpoints, is written by Save & Quit or a slot
  save, and is cleared when you start a new game.
- **Combat aids** (`Enemy tooltips`, `Range overlay`, `Hit-chance preview`): point at an
  enemy group or ship to see its health, armor, weapon, range, tactic and how many are left. In the ground battle
  command phase, move the mouse to the lower-right corner for `Range` (who can reach whom, by the game's own rule)
  and `Hit preview` (chance to hit, expected hits and damage, from the game's own formulas). They only show
  information; they never change a fight.
- **Manual**: the rule book is not distributed in this public build, so its button, tab and setting are hidden.
- **Speed toggle**: **F2** or the `Speed` corner button cycles normal / fast / fastest.
  It shortens animation delays; it does not change the game's rules or random rolls.
- **Mission-target marker**: yellow boxes on the galaxy and long-range maps mark
  the targets of your unfinished missions.
- **Bright squad marker**: makes your squad easier to find inside a station or base.
- **Hints**: shows control reminders outside the game picture.
- **Sound**, **Music**, **Sound effects**: Sound mutes everything; the other two switches control music and effects
  separately.
- **Load veteran crew**: asks before replacing the current game with a prepared strong crew (see below).

## Saving

- **Saving works as in the original:** at the Starport main menu choose **G-Game Save**. In this port it saves at
  once. With `Skip rule-book question` off the game first asks for a word from the rule book
  ("Type the *n*th word in section *s*"), which is the original copy protection; have the rule book ready then.
- **Other ways to save:** **Esc**, **S-Save & Quit**, named save slots and the autosave at every starport arrival
  (see *What is new*).
- Saves are kept in the **browser profile and game address you use**, including when the game looks like a separate
  Windows application. They survive closing the browser and restarting the computer. Named slots and the saved log
  book are kept there too.
- Space-station visits also remember their explored maps (same storage).
- Until you save, the game uses the save that came with the original disks.
- Clearing the game's site data deletes its saves and import. Private browsing discards them when that private
  session ends. A different browser, profile or address has different saves; return to the original one to find
  your existing game.
- The normal Windows launcher, veteran-crew launcher and RecompLauncher use separate storage. See
  [where saves live](../README.md#where-your-saves-live) and [backups and removal](../README.md#backups-and-removing-the-game)
  before changing installations or deleting anything. There is no in-game save-export button.

### Veteran crew

A ready-to-play save: eight veterans with the best personal gear, a fully fitted Warrior-class ship,
50,000 credits and the first mission active, docked at the starport main menu.

- **Start:** double-click `Play Star Command (Veteran Crew).cmd`,
  then **Enter** at the title and **1-Play Star Command**. It supplies the veteran crew only if that save address has
  no saved game. Later launches keep what you saved.
- The launcher uses `127.0.0.1` instead of `localhost`: a separate browser storage, so the regular game's
  continuing save is separate.
- To start over with veterans in a running game, use **Esc**, **T-Settings**, then the **Load veteran crew** button.
  Choose **Load** in its confirmation to replace the current saved game and explored station maps, or **Cancel** to
  keep them. After loading, the game restarts at the title. Separately named save slots remain available.
- The veteran crew is prepared from your own copy during import.

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
- Using **V-View** with an esper inside a station: after the flash, does the map keep the drawn rooms
  with the "beings" marks? Needs an esper with enough skill in the original.
- Ship battle shields: with only Shield #1 fitted, does fire from straight ahead hit that shield?
- **Ground battle beam weapons:** their flash lines are now drawn dashed, as the original program says; not yet
  compared with a DOSBox picture.

**Colours (what to expect)**
- The port uses the original's EGA colours. Text and frames are **light grey** from the start of a game until your
  first ground battle, and **white** after it for the rest of the session. The original on an EGA does the same.
- Small colour differences to your own DOSBox setup are expected.

**Not in the port on purpose**
- The floppy "Insert disk B in drive A" prompts are not shown. The port behaves like a hard-disk install.
