# Changelog

## v0.1.7-beta — 2026-11-24

**Fixed.** Several virus scanners flagged the v0.1.6 download. The cause was the launcher script deleting its old log
file; it now overwrites the log and deletes nothing. The game itself is unchanged.

**RecompLauncher.**
- Cloud backups hold saved progress and settings only. The imported game data is no longer copied; on another computer
  it is prepared again from the original folder, and saved games are kept.
- The game folder can be passed to `tools\serve.ps1` with `--game <folder>`.
- The README carries the "Get it on RecompLauncher" badge.

**Updating.** Nothing is prepared again; saved games are kept.

## v0.1.6-beta — 2026-11-20

**Fixed.**
- After everyone dies in space ("You Are All Dead" in a ship battle), Load in the Esc menu loads the saved game. In
  v0.1.5 it did nothing and the game had to be quit first.
- Answering Y to "Quit the game?" after G-Game Save ends the game: the window closes, or the picture shows "You can
  close this window." with Enter to play again. Before, the page stayed as it was and took no keys.
- After "Ship is irreparable. The crew starves!" the Esc menu no longer offers Save & Quit; Load and Quit without
  saving remain.
- In a ground fight the range note sits in the top-right box and no longer covers the enemy's name.

**Played through.** Stage 16 was played from the Headquarters briefing to the pay-out, so all seventeen campaign
stages have now been played to their pay-out. Also played to their last page: losing a boarding fight, the life
support failure in space, the stranded ship, a paid Dry Dock repair, and a promotion with its training session.

**RecompLauncher.** The launcher profile was checked against the launcher's current developer guide.
- Launch options a player adds in the launcher no longer move the game to another port and save location.
- In Big Picture mode the game opens full screen.
- Launch failures are written to `logs/launcher.log`, which the launcher attaches to crash reports.
- The game's launcher settings have **Starting crew**: New crew or Veteran crew. The veteran crew has its own save
  address; saved games are kept.
- Looks are switched off for this game, because they cannot reach the browser window it draws in.
- The list of exit codes names only codes the game can return.

**Updating.** Nothing is prepared again; saved games are kept.

## v0.1.5-beta — 2026-11-16

**Fixed.**
- Espers can be recruited: with no esper in the squad, about one candidate in twenty at the Recruitment Office has
  Esper 50 or more, as in the original. In every earlier release no candidate ever did.
- The starport rolls its random numbers as the original does. Recruits, training results and prices no longer repeat
  in a long session, and every roll the original can make can now come up.
- Arithmetic is done in single precision as in the original, so results that sat one off now agree; for example
  the chance of an encounter after a ship battle.
- Bonus numbers on the crew and ship panels show their sign as the original does (` +5%`, ` -3%`).
- Lines and weapon beams are drawn on the same pixels as the original's, with the dash pattern starting at the same
  end.
- The hit sound of two weapon animations in ground combat plays again.
- In a ground fight the Range and Hit preview buttons sit in the top-right box, clear of the game text, and stay in
  place while the pointer rests on them.
- If the browser blocks the Plus window, the panel that opens in its place has the same tabs as Plus, including Crew
  and Log book.
- The Log book shows credits as a whole number after a bought truce.
- The yellow mission marker no longer shows over the computer's kill list or mission text.
- A mission briefing reads "You should go to The Bar".
- Names given to the crew and the ship are never changed by the import's spelling corrections.
- After a G-Switch inside a station the crew panel, the Plus Crew tab and the Log book follow the new crew order.
- Loading a saved game from the Esc menu while the BATTLE REPORT is on screen loads the game.
- After a ship battle the BATTLE REPORT stays on screen long enough to read; a key ends the wait.
- The Log book writes the same sector numbers as the flight display.
- The esper's View command shows the map flash.
- Helper tooltips: an enemy's tooltip names the weapon it fires and shows its health; equipment tooltips work on the
  Equip screens; the weapon price column shows whole numbers, as the original prints prices, on every row; scan
  view letters are drawn only for ships inside the scan window.
- After "You Are All Dead" the Esc menu no longer offers Save & Quit; Load and Quit without saving remain.
- On the long-range and galaxy maps the ship's own marker stays visible when the ship is on a mission target.
- The Log book no longer gains a duplicate arrival entry when a saved game is loaded after restarting the browser.
- Spelling in game text: "Inaccessible" in the ground combat briefing, "Impersonate Deity" in the communications menu,
  and "They will both be near the first star" in a mission briefing.

**Removed.** Gamepad support. The game is played with the keyboard and the mouse.

**Played through.** Sixteen of the seventeen campaign stages were played from the Headquarters briefing to the
pay-out on this build, the last stage included. Stage 16 was not played to its end; its rules were compared with the
original's code statement by statement.

**Updating.** Copies already imported are prepared again automatically on first start; saved games are kept.

## v0.1.4-beta — 2026-11-15

**Fixed.**
- Inside stations, the Inspect skills page: every skill level sits in one column and nothing runs over the right-hand
  panels or stays behind on later screens.
- The Esc menu covers the station map; the squad marker no longer shows through it.
- After a ground battle the BATTLE REPORT (credits gained, killed, survived, surrendered) stays on screen long enough to
  read, about as long as four of the game's message pauses; a key pressed once it is up ends the wait.
- The Log book names only crew who died, once each.
- "Corridor" is spelled correctly in station text.
- In ship battles the helper's enemy letters appear on the scan view only, for every ship shown; the visual view shows
  the ships alone.

**Star Command Plus.** F1 opens Star Command Plus on the tab used last. Plus has a new Crew tab with the crew's health
and weapons and, in space, the ship's fuel, armor and systems. The Log book button under the picture is removed; the
log is the Log book tab in Plus. The line under the picture reads "F1 - Plus".

**Updating.** Copies already imported are prepared again automatically on first start; saved games are kept.

**Documentation.** The README was checked against the released build and corrected: `StarCommand.exe` is the Windows
launcher, saving keeps progress at a starport, and the original folder is needed only for a new import.

## v0.1.3-beta — 2026-11-14

**Import.** Version 1.2 of the game (start menu "Version 1.2 5/23/88") is now accepted as well as version 1.0, and the
import page says which one it recognised. Copies that have been played are accepted: saved crews and explored maps
no longer have to match an unplayed release. Readable crew saves can be carried across. Version 1.2 keeps its own
three Healing fixes in ground combat. Preparation happens locally; it does not upload the selected files. Optional
RecompLauncher cloud backups can upload game browser data, including saves and the stored imported copy.

**Starting.** The game opens in a normal window in the middle of the screen, no longer fullscreen (F11 switches
fullscreen on and off). On Windows, double-click **Play Star Command** in the unpacked release. Python and Chrome
are optional: Windows PowerShell and Microsoft Edge can be used instead. RecompLauncher starts the game without a
console window and supplies the selected original folder for the first import; keep that folder available for later
starts too. Closing the game stops its background server. Loading errors now offer a way back to the import page
after any automatic retries.

**Star Command Plus.** F1 help and Settings moved out of the game picture into a separate window in ordinary Windows
style, with tabs Help, Settings and Log book. Help follows the screen the game is on. The game keeps running while it
is open. Settings uses checkboxes selected with the mouse or **Tab** and **Space**. If the browser blocks the window,
Help and Settings open in a movable panel on the page; the in-game Log book button is still available.

**Changed.**
- Classic mode is removed. The rule-book question on Game Save stays off unless you switch it on in Settings.
- Sound has three switches: Sound (everything), Music, Sound effects.
- Mouse zoom is removed. The picture scales in whole steps as the window grows, with unused space around it.
- When clicking back into the game after using another window, the first click brings the game back ("Click again to
  play"); the next click is the first the game acts on.
- Inside stations the squad has a bright marker (switch: Bright squad marker).
- "Confrontation with enemies" and the enemy's fire results in ship battles stay on screen long enough to read.
- The Log book shows whole numbers. The Manual tab and button are hidden, because no manual text is part of the game.
- Esc closes the Help or Settings panel when it has keyboard focus. The separate Plus window has its own close
  button; **Alt+F4** closes whichever window has focus.
- The veteran-crew launcher keeps an existing save. To replace it, use **Load veteran crew** in Settings and confirm
  with **Load**; **Cancel** keeps the current game.

**Updating.** An intact imported copy is prepared again automatically using the originals already stored in the
browser. Keep the page open until it finishes, then choose **Play Star Command** if needed. Saved games are stored
separately and are kept. Choose the original folder again if the browser no longer has a complete imported copy,
such as after interrupted preparation, or its files fail their checks. Keep the same browser profile and address to
return to your saves.

**Removing the game.** Deleting an unpacked copy leaves normal-browser imports and saves behind. Deleting a
launcher-managed installation also removes its separate browser profile and saves. See
[backups and removal](README.md#backups-and-removing-the-game) before deleting either; the game has no save-export button.

## v0.1.2-beta — 2026-11-13

**Beta.** Same game as v0.1.1-alpha; no gameplay change. Source comments removed and development logs dropped from
the repository. Verified: an imported copy converts to identical files and every checked screen draws the same.

## v0.1.1-alpha — 2026-11-09 (hotfix: black screen on every launch after the first)

**Fixed.** The first launch after importing your copy played; every launch after it showed a black screen (console:
`404 modules/startup/strings.js`, on-screen `module for STARCOMM not built yet`). Cause: the service worker
`game/byoc-sw.js` that serves the converted game modules from the browser's private storage imported its manifest
through a static JSON import. When the browser stopped and restarted the worker between launches, that import graph
failed to re-evaluate, the worker never started, and module requests fell through to the network, where the generated
files do not exist. The worker now reads the manifest with `fetch()` and opens the storage handles itself, with no
static imports. Verified: four consecutive launches from a clean import all play.

**Updating.** The new worker installs itself on your next launch. If that one launch is still black, close the game
and launch once more; your imported copy and saves are kept. Nothing else changed.

## v0.1.0-alpha — 2026-10-18 (first public release)

**What plays.** The whole 1988 game in the browser: title and startup menu, starport (recruiting, training, ships,
equipment, missions, saving), space travel and scans, stations and bases, ship-to-ship battles and ground battles,
with the original save file `CHARINFO.BAS`. Additions, each switchable in Esc → T-Settings, all off in **Classic mode**:
mouse on every hotkey, Esc menu (save & quit, load), F1 controls help, map zoom, item and enemy tooltips, named save
slots and autosave, crew panel, log book, combat aids (range, hit preview), game speed, mission marker, veteran crew.
Keyboard, mouse and gamepad.

**How it was checked.** 90 acceptance screens, each with a build check and an independent review: 90 pass
(`ACCEPTANCE.md`). 64 of them were compared pixel by pixel with the original running in DOSBox-X: 62 match apart from
test data (crew names, dice rolls), none differ, 2 cannot be shown in the original (SP-10, IN-04). Integration runs
RUN-1 and RUN-2 pass; the same opening also passes from an imported copy in a fresh browser profile.

**Known open points.**
- D-IN-3: esper V-View inside a station: whether the map keeps the revealed rooms after the flash (needs a DOSBox check).
- D-MX-2: ship battle with only Shield #1 fitted: whether fire from straight ahead hits that shield (needs a DOSBox check).
- Ground-battle beam flashes are drawn dashed as the program says; not compared with a DOSBox picture.
- The Manual button is off: the rule book is not distributed.
- Floppy "insert disk" prompts are not shown (hard-disk behaviour).

**Bring your own copy.** Needs the `STARCOMA` folder of the original release: 123 files known, 115 required, checked
by size and SHA-256 against `docs/byoc/manifest.json` (release `starcoma-1`; other releases untested). The importer
converts the files and translates the program modules in the browser; nothing is uploaded. Chrome or Edge
recommended; serve with `python -I tools/serve.py 8088`.
