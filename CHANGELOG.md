# Changelog

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
