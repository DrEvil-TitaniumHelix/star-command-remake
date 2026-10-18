# game/engine — API for the module lanes (owner: build-engine)

Vanilla ES modules, no bundler. Serve `game/` over HTTP (`python -I tools/serve.py`, http://localhost:8088/). A module file exports `default async function (E, opts)`; `index.html` boots the engine and calls `modules/startup.js`.

```js
import { boot } from './engine/engine.js';
const E = await boot(canvas);
// { fb, display, gfx, text, sprites, atlas, input, screen,          milestone 1
//   files, state, data, audio, timer, chain, run }                 milestone 2
```

Milestones 1 and 2 are done. `node game/engine/engine.test.mjs` runs 13 tests, including the byte-identical CHARINFO.BAS round trip.

## Module contract, CHAIN, dev jumps
- `game/modules/<file>.js` exports `default async function (E, opts)` (or `run`). `opts.module` = module name being entered (`STARCOMM`/`STARTUP` share startup.js), `opts.screen` = dev jump id.
- `E.chain('STARPORT')` = `CHAIN "STARPORT.STR"` / `.EXE` / `RUN` (drive and extension ignored; .STR stubs are skipped, hard-disk configuration). It throws a ChainSignal that unwinds the module; `return E.chain(..)` works too. `E.run('STARCOMM')` (index.html) loads the next module's file and keeps `E.state` (COMMON) intact. Files: STARCOMM/STARTUP -> startup.js, STARPORT -> starport.js, SPACE -> space.js, INSIDE -> inside.js, SPBATTLE -> spbattle.js, PLBATTLE -> plbattle.js.
- `index.html?screen=<id>` starts the module owning the id prefix (CM/SU startup, PT starport, SP space, IN inside, SB spbattle, PB plbattle) with `opts.screen = id`. The module lane implements the jump and its fixture state; fixtures go in `game/fixtures/<id>.json` (owned by the module lane).

## Milestone-2 services
| BASIC | engine | notes |
|---|---|---|
| `TIMER` | `E.timer.now()` | seconds since midnight, BIOS-tick quantised, single |
| busy-wait iteration | `await E.timer.frame()` | setTimeout ~60 Hz (runs headless / in background tabs) |
| wait | `await E.timer.wait(sec)` | |
| `FOR I = 1 TO n: NEXT` delay loop | `await E.timer.delayLoop(n)` | n / (stdDelay * 4) s; `E.timer.stdDelay` = 188 (shipped A(86)); TODO(acceptance) |
| `PLAY s$` / `PLAY "X"+VARPTR$(s$)` | `E.audio.play(s)` / `E.audio.play('X' + s)` | MB: returns at once (promise resolves when the 32-note buffer has room); MF: promise resolves when played |
| `PLAY(0)` | `E.audio.queue()` | notes/pauses still queued |
| `SOUND f, ticks` / `BEEP` | `E.audio.sound(f, ticks)` / `E.audio.beep()` | ticks 0 = stop and empty the queue; MF: the promise resolves once the tones before it have played (it does not wait for its own tone - the next SOUND does) |
| `G!(i)` / `A(i)` | `E.state.G[i]` | Float32Array(2601) |
| named COMMON scalar | `E.state.v.Fuel`, `E.state.v.EntryMode` ... | 68 names from CROSSREF §2.2 (`assets/gmap.json` "scalars", `!` dropped) |
| crew field | `E.state.crew(m, f)` / `setCrew(m, f, x)` | G!(1300 + 100m + f) |
| COMMON string array | `E.state.str('Rank$')` | JS array, created on first use, survives CHAIN; names as CROSSREF §2.4 |
| `BLOAD "CHARINFO", &H1850` | `await E.state.load('CHARINFO.BAS')` | MBF -> single |
| `BSAVE "CHARINFO", &H1850, 10404` | `E.state.save()` | byte-faithful (unchanged elements keep their loaded bytes) |
| prepared save game (`?save=<name>[&force=1]`) | `await applySaveParam(E.files, params, { onDone })` (`saves.js`, lane testsave) | copies `assets/saves/<name>/CHARINFO.BAS` + `CHARNAME` before STARCOMM boots; without `force` only when no save exists, `force=1` = `E.files.reset()` first; index.html then drops `force` from the address |
| `OPEN f$ FOR INPUT AS #1` + `INPUT #1` / `LINE INPUT #1` / `EOF(1)` | `const f = await E.data.open('ENCLIST'); f.str(); f.num(); f.line(); f.eof()` | BASIC INPUT # field rules |
| NAME / CHARNAME reads | `await E.data.nameFields()` (374 fields, stops at EOF) / `await E.data.charName()` (9: ship, crew 1..8) | game-written CHARNAME preferred |
| `OPEN .. FOR OUTPUT` + `PRINT #` / `WRITE #` | `E.data.writeText('CHARNAME', text)` | the module builds the text (CR LF lines); Ctrl-Z appended |
| decoded tables | `await E.data.table('ENCINFO' \| 'ENCLIST' \| 'ENCTABLE' \| 'MISSION' \| 'MES-n' \| 'INFO' \| 'GALAXY' \| 'INSH' \| 'IN-n')` | `assets/data/*.json`, see DATA_FILES.md §D for column meanings |
| sprite-bank BLOAD as memory (MAP-n.BAS pixel words ...) | `await E.files.bload('MAP-3.BAS')` | every bank of sprites_index.tsv is in `assets/files` too (PUT still goes through the atlas) |
| other BLOAD / BSAVE (IN-n.BAS ...) | `await E.files.bload(name)` -> `{seg, off, len, body}` / `E.files.bsave(name, bytes)` | game writes persist in localStorage; `E.files.reset()` = fresh disk |

## BASIC statement -> engine call
| BASIC | engine | notes |
|---|---|---|
| `SCREEN 1` / `SCREEN 7` | `E.screen(1)` / `E.screen(7)` | clears, resets palette, text colours, cursors |
| `PALETTE a, c` | `E.fb.palette(a, c)` | attribute -> EGA colour 0..15 |
| `PALETTE` (reset) | `E.fb.paletteReset()` | |
| SCREEN 1 default palette (rulings SC-2 + addendum) | automatic | palette 1 = EGA 0/3/5/7 (colour 3 light grey), palette 0 = 0/2/4/6, as on the original's EGA; after the first SCREEN 7 (PLBATTLE) of the session both switch to high intensity (colour 3 = 15 white) for the rest of the session, as the original does. Session state `E.fb.ega7Seen`: kept across CHAIN, not saved, false on a fresh start. Module PALETTE remaps apply on top either way |
| module's EGA remap | `E.fb.modulePalette('STARTUP' \| 'SPACE' \| 'INSIDE' ..., useEGA)` | table `MODULE_PALETTE` in display.js (SCREENS_INDEX "Palette per module"); or write the PALETTE calls literally |
| `COLOR bg, pal` (SCREEN 1) / `COLOR fg, bg` (SCREEN 7) | `E.text.color(a, b)` | |
| `CLS` | `E.text.cls()` | |
| `LOCATE r, c` | `E.text.locate(r, c)` | either may be `undefined` (omitted) |
| `LOCATE r, c, cursor, start, stop` | `E.text.locate(r, c); E.text.cursor(cursor, start, stop)` | state only: in SCREEN 1/7 the original shows no cursor (DOSBox reference, qa fix F-3), so nothing is drawn |
| `PRINT s` / `PRINT s;` / `PRINT s,` | `E.text.print(s)` / `E.text.print(s, ';')` / `E.text.print(s, ',')` | numbers get BASIC's sign + trailing space |
| `PRINT "3-"; X$; N;` | `E.text.print(['3-', X$, N], ';')` | array = items joined by `;` |
| `PRINT USING "###"; n` | `E.text.printUsing('###', n)` / `(fmt, [a, b], ';')` | `#`, `##.##` fields; literal text kept |
| `PSET (x,y), c` / `PRESET` | `E.gfx.pset(x, y, c)` / `E.gfx.preset(x, y)` | c omitted = 3 (SCREEN 1) / 15 (SCREEN 7) |
| `POINT(x, y)` | `E.gfx.point(x, y)` | -1 off screen |
| `LINE (a,b)-(c,d), c, B[F], style` | `E.gfx.line(a, b, c, d, col, 'B' \| 'BF' \| '', style)` | col `-1`/undefined = default colour |
| `LINE -(c,d)` | `E.gfx.lineTo(c, d, col, box)` | |
| `PAINT (x,y), p, b` | `E.gfx.paint(x, y, p, b)` | |
| `CIRCLE (x,y), r, c, s, e, asp` | `E.gfx.circle(x, y, r, c, s, e, asp)` | default aspect 5/6; parametric, tune in acceptance |
| `PUT (x,y), Arr, PSET` | `E.sprites.put(x, y, { bank: 'LOGO.BAS', index: 0 }, PSET)` | verbs `OR AND PRESET PSET XOR` exported by sprites.js (also strings 'PSET'); bank = file name, bare stem = `.BAS` |
| `GET (a,b)-(c,d), Buf` | `const buf = E.sprites.get(a, b, c, d)` then `E.sprites.put(x, y, buf, PSET)` | |
| `K$ = INKEY$` | `E.input.inkey()` | `''` when empty |
| wait for a key | `await E.input.key(filter?)` | |
| `INPUT` / `LINE INPUT` | `await E.input.lineInput(E.text, prompt, maxLen)` | |
| mouse (v1.1) | nothing to do in modules | click a visible hotkey text / arrow-cross arm = that key; map cell = one horizontal-first arrow step; Esc overlay items clickable (pointer.js, below) |
| gamepad | nothing to do in modules | d-pad/left stick = arrows, A = ENTER, X = SPACE, Y = "Y", B = "N" on a `(Y/N)` screen else Esc (overlay), Start = Esc (opens the v1.1 overlay below), Back = control help (v1.2); letter menus are detected on screen (`X-Label` items), LB/RB or right stick move a highlight, A types the highlighted key. `E.input.setMenu(items)` still overrides the detection |

**v1.1 mouse (`pointer.js`, `attachPointer(E, canvas)` at boot).** Click a printed menu label (`X-Label`, either case), a crew/item selector (`X>Name`, `X)Name`, `#n`), a Y/N letter, an ENTER / SPACE / F-key word, or an arm of a drawn arrow cross (SPACESH[15], INSH[64], PLBTSH[8]) to send the same key as the keyboard. Click a map cell (INSIDE map, SPACE long range / sector / system, PLBATTLE grid) to take one arrow step toward it (horizontal first; the cursor's own cell does nothing); in IN-10 click just above/below the current option to step, then ENTER to accept. The cursor becomes a pointer over targets. Every click goes through `input.device(code)` (so module logic is untouched); while the Esc overlay is open clicks go only to `input.modal.click(x, y)`. Regions are derived from the current screen on every event: `E.pointer.regions()` / `window.__clickRegions()` return `{key, x, y, w, h, kind}` in logical pixels (the shared source for v1.2's control overlay and tooltips). Map providers read the running module through `E.moduleInstance` (set by the generated SPACE/SPBATTLE/PLBATTLE entry, space/bas2js.py) and INSIDE's `E.commonScalars`. No framebuffer drawing. Tests: `node game/engine/pointer.test.mjs`; click = key matrix: `node acceptance/ref/scripts/click_check.mjs <outDir> <id>...` (server tools/serve.py 8094).

**v1.1 Esc overlay (`overlay.js`, `installEscape(E)`).** Device input is routed by `input.device(k)`: while `E.input.modal` is set every device key (and every click, via pointer.js) goes to it; otherwise a device Esc (keyboard Esc, pad Start, pad B outside a Y/N prompt; pad Back = control help since v1.2) calls `E.input.onDeviceEscape` instead of queueing ESC (no module reads ESC). Keys pushed by code (`E.input.push`: dev jumps, harnesses) bypass both, so acceptance shots never see the overlay. The overlay offers R-Resume / S-Save & Quit / Q-Quit without saving (R, S, Q; arrows + Enter; pad d-pad + A; click); the game is paused while it is open (timer waits gated, TIMER and the audio queue clock frozen, AudioContext suspended). Save & Quit writes the original CHARINFO.BAS + CHARNAME formats: the current state only while STARPORT waits at its main menu (L_210D `Main Menu` + `Select Option` with an empty INKEY$ poll = the native save point); on other starport screens the state as of the last main-menu wait of this visit, or as of arrival (before the arrival rewards, so a load pays them exactly once); elsewhere the state as of the last starport departure (a load always restarts in STARPORT, CROSSREF §1), with IN-n/INMAP-n writes since then rolled back; without a departure checkpoint the last disk save is kept. The overlay states which before the player chooses. Quit calls `window.close()` (Chrome --app) and otherwise shows `You can close this window.` Tests: `node game/engine/overlay.test.mjs` (`--browser` with tools/serve.py 8094).

**v1.2 control help (`help.js`, `installHelp(E)`).** F1, gamepad Back, or the small `?` button in the bottom-right corner of the picture (shown while the mouse is over it) toggles a panel with the controls of the CURRENT screen, rebuilt every frame from the same live regions as the mouse (`E.pointer.regions()` + the printed labels): every hotkey with its label, selectors, prompts, arrows / map movement, plus a small cited per-screen supplement for keys the screen accepts without printing them (STARPORT menus: ENTER/SPACE, SUB_22C4 02346; arrows on every active map/picker; INSIDE picker PgUp/PgDn), then the fixed gamepad, mouse, zoom, Esc and F1 lines. Hidden while the Esc menu is open; pad Back opens the Esc menu instead when help is off. Not modal: the game keeps running and keeps its keys. Drawn with ui.js in `display.overlays` (never the framebuffer). `E.help = { open, close, toggle, isOpen, lines() }`. Switch `controlOverlay` (settings.js; off in Classic mode). Tests: `node game/engine/help.test.mjs`.

**v1.2 map zoom (`zoom.js`, `installZoom(E, canvas)`).** On screens with an active map (a `map` region in `E.pointer.regions()`: SPACE long range / sector / system, INSIDE map, PLBATTLE grid): mouse wheel zooms in/out around the pointer (1, 1.5, 2, 3, 4x, nearest neighbour), right-click zooms out one step (no context menu). Left-click keeps its v1.1 meaning wherever it hits a region (hotkey / arrow / one cursor step; clicks map through `display.viewToLogical`, so the same cell gives the same key at any zoom); a left-click on an unclaimed spot of an active map (map border, the cursor's own cell, blank picture) zooms in one step there. A map counts as active only while its picture is free of prose (pointer.js MAP_PROVIDERS gate, review Z-1: e.g. SPACE EQUIPING list over the map = no map, zoom resets). The context menu is suppressed only while zoom is available. The view resets on SCREEN/CLS, CHAIN, when the map disappears, when the Esc overlay opens, or when the switch is off: acceptance screens are always at zoom 1. Presentation only (`display.setView`); the gamepad menu highlight follows the view. `E.zoom = { level, reset, zoomAt(lx, ly, step) }`. Switch `mapZoom`. Tests: `node game/engine/zoom.test.mjs`.

**v1.2 item tooltips (`tooltip.js`, `installTooltips(E, canvas)`; data `assets/data/items.json` from `python -I tools/items.py`).** Hover a printed item name (STARPORT buy/sell/inspect lists and ship browser, SPACE/INSIDE inspect and equip, PLBATTLE weapon switch) or a populated crew row (gamepad: the highlighted row) to see its decoded stats and cost: 152 records (guns, squad weapons, hand weapons, armor suits, shields, defense hardware, missile killers, sighting units, misc items, ships, pay per rank) built from INFO.BAS + NAME, every field with its decode source in `src`; STARPORT purchase prices include the starport's x1.2 (STARPORT 076F-0791), other contexts label the base price; columns the decode does not explain are not shown. Recognition matches the screen text per screen (names as the screen truncates them); an ambiguous match shows nothing. `E.tooltips.at(lx, ly)`. Switch `itemTooltips`. Tests: `node game/engine/tooltip.test.mjs` (`--shots` with tools/serve.py 8094).

**v1.3 Settings and Classic mode (`settings.js`, `overlay.js`).** Esc -> `T-Settings` lists every post-v1 addition with an on/off switch (arrows + Enter/Space, the shown letters, clicks; Esc/B back) plus `Classic mode`, which turns all of them off (the faithful game; preferences kept for later). `?classic=1` forces Classic for the session (`CLASSIC=1` in acceptance/ref/scripts/shoot_all.mjs / reshoot.sh shoots acceptance that way). Stored in localStorage (`starcommand:settings`, try/catch). Features ask `E.settings.on(name)` when they act. Mouse off stops clicks/hover only (help still lists the keys); `noChallenge` off = the original rule-book challenge; an explicit `E.options.protection` session override (dev jumps, `?protection=1`) wins over both and is never persisted. Device hotkeys for engine features: `E.input.hotkeys` (code -> `{run, enabled}`), only keys no module reads (F2 = speed).

**v1.3 save slots (`slots.js`; the coordinator's `saves.js` `?save=<name>` loader unchanged).** With `saveSlots` on, Esc `S` asks for a named slot (new or overwrite; names validated before any write), Esc `L` loads one, and `1-Play` on the title menu offers the picker once per visit (`Continue current disk` = the original save). Each slot = CHARINFO.BAS + CHARNAME + every IN-n/INMAP-n + LOGBOOK, compact base64 records in localStorage (`starcommand:slots:v1` index), a clear message when storage is full. Autosave = the STARPORT arrival checkpoint, replaced at every arrival (never from `?screen=` dev jumps). Loading restarts at STARCOMM without a page reload. Classic = the single original save.

**Veteran crew (`saves.js`, `assets/saves/veteran/`, generated by `node tools/make_veteran_save.mjs`).** A ready-to-play save: eight veterans with the best personal gear, a fully fitted Warrior-class ship and an active first mission, docked at the starport main menu. `CHARINFO.BAS` = the original BSAVE layout (FD, seg 0xB73, off 0x1850, 10404 bytes = G!(0..2600) as MBF singles, 1A), built with `state.js`; `CHARNAME` = `ShipName$,` + 8 `CrewName$,` + Ctrl-Z, as STARPORT 9D0C-9D6D writes it. Launcher: desktop **Star Command - Veteran Crew** -> `http://127.0.0.1:8088/index.html?save=veteran&force=1` (127.0.0.1 = a separate browser storage from the regular game's localhost save); `force=1` restores the save on every launch (IN-n/INMAP-n forgotten too) and is then dropped from the address, so a reload keeps progress. Esc -> `T-Settings` -> `V-Load veteran crew` asks `Replace the current game with the veteran crew? (Y/N)`; Y = `applySaveParam(E.files, new URLSearchParams('save=veteran&force=1'))`, then a page reload. Tests: `node game/engine/saves.test.mjs`.

**v1.3 crew panel and log book (`panels.js`, installed from index.html).** Crew panel in the spare width beside the integer-scaled picture (SPACE / INSIDE / PLBATTLE; HP, weapon, ammo/reloads, PLBATTLE stamina; SPACE adds fuel, armor, the 23 ship systems); hidden without room. Log book (corner button on hover): briefings verbatim, arrivals, battles with per-battle report numbers, credits, deaths (by crew identity), medals; cleared by a confirmed new game; carried by save checkpoints in memory and written to LOGBOOK only by a real save. Switches `crewPanel`, `logBook`.

**v1.3 combat aids (`combat.js`).** Enemy tooltips (PLBATTLE group letters / enemy-grid sprites / target letters, SPBATTLE ships): HP or hull, armor, weapon, range, tactic, count alive. In the PLBATTLE command phase, hover the lower-right corner for `Range` (each member's reach as Groups In Range computes it, 0575B: A within reach, a within twice) and `Hit preview` (hit chance, expected hits and damage for the selected command and target from the decoded formulas, PLBATTLE 06864.. / SPBATTLE 056FF..). Read-only. Switches `enemyTooltips`, `rangeOverlay`, `hitPreview`.

**v1.3 manual, speed, mission marker (`manual.js` + `assets/data/manual.json` from `tools/manual_pages.py`, `speed.js`, `marker.js`).** Manual button: the rule book pages for the current screen plus the manual-vs-game differences from decode/docs/MANUAL_XCHECK.md (59 rows: "manual says X; the game does Y"). F2 or the Speed button cycles normal / fast / fastest by scaling only the empty FOR/NEXT delay loops (G!(86)/(88), TIMER waits and RND untouched). Yellow boxes mark unfinished mission target sectors on the galaxy / long-range maps (MISSION record, G!(2234..2244) and the mission flags). Corner buttons appear only while the mouse is over the picture. Switches `manual`, `speed`, `missionMarker`.

Key codes (`input.js` `KEY`): `'\r'` ENTER, `'\x1b'` ESC, `'\b'` BACKSPACE, `' '` SPACE, arrows `'\0H'` up, `'\0P'` down, `'\0K'` left, `'\0M'` right (= `CHR$(0)+CHR$(scan)`), letters as typed (compare case-insensitively where the original does).

BASIC functions (`basic.js`): `str$`, `printNum`, `cint` (half away from zero, as the runtime's CINT A915: CINT(2.5) = 3, CINT(-2.5) = -3), `int`, `fix`, `sgn`, `val`, `left$`, `right$`, `mid$`, `space$`, `string$`, `chr$`, `asc`, `using`.

Requests: write `engine request: <what>` at the top of STATUS.md; build-engine answers `engine done`.
