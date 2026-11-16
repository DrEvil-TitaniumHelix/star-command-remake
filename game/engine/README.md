# game/engine — API for the module lanes (owner: build-engine)

Vanilla ES modules, no bundler. Serve `game/` over HTTP (`python -I tools/serve.py`, http://localhost:8088/). A module file exports `default async function (E, opts)`; `index.html` boots the engine and calls `modules/startup.js`.

For starting, playing, updates and save backups, use the [player guide](../README.md) and [installation guide](../../README.md#play). This page describes the engine API. Windows players can use the supplied launcher without installing Python or Chrome.

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
| `FOR I = 1 TO n: NEXT` delay loop | `await E.timer.delayLoop(n)` | n / (stdDelay * 7.7) seconds before the speed setting; `E.timer.stdDelay` = 188 |
| `PLAY s$` / `PLAY "X"+VARPTR$(s$)` | `E.audio.play(s)` / `E.audio.play('X' + s)` | MB: returns at once (promise resolves when the 32-note buffer has room); MF: promise resolves when played |
| `PLAY(0)` | `E.audio.queue()` | notes/pauses still queued |
| `SOUND f, ticks` / `BEEP` | `E.audio.sound(f, ticks)` / `E.audio.beep()` | ticks 0 = stop and empty the queue; MF: the promise resolves once the tones before it have played (it does not wait for its own tone - the next SOUND does) |
| `G!(i)` / `A(i)` | `E.state.G[i]` | Float32Array(2601) |
| named COMMON scalar | `E.state.v.Fuel`, `E.state.v.EntryMode` ... | 68 names from CROSSREF §2.2 (`assets/gmap.json` "scalars", `!` dropped) |
| crew field | `E.state.crew(m, f)` / `setCrew(m, f, x)` | G!(1300 + 100m + f) |
| COMMON string array | `E.state.str('Rank$')` | JS array, created on first use, survives CHAIN; names as CROSSREF §2.4 |
| `BLOAD "CHARINFO", &H1850` | `await E.state.load('CHARINFO.BAS')` | MBF -> single |
| `BSAVE "CHARINFO", &H1850, 10404` | `E.state.save()` | byte-faithful (unchanged elements keep their loaded bytes) |
| prepared save game (`?save=<name>[&force=1]`) | `await applySaveParam(E.files, params, { onDone, ask })` (`saves.js`) | without `force`, keeps an existing save; the page supplies `ask` to confirm replacement when `force=1`; both prepared files are fetched before resetting current files, then `force` is dropped from the address |
| `OPEN f$ FOR INPUT AS #1` + `INPUT #1` / `LINE INPUT #1` / `EOF(1)` | `const f = await E.data.open('ENCLIST'); f.str(); f.num(); f.line(); f.eof()` | BASIC INPUT # field rules |
| NAME / CHARNAME reads | `await E.data.nameFields()` (up to 375 fields, stops at EOF) / `await E.data.charName()` (9: ship, crew 1..8) | game-written CHARNAME preferred |
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
| SCREEN 1 default palette (SC-2 + addendum) | automatic | palette 1 = EGA 0/3/5/7 (colour 3 light grey), palette 0 = 0/2/4/6, as on the original's EGA; after the first SCREEN 7 (PLBATTLE) of the session both switch to high intensity (colour 3 = 15 white) for the rest of the session, as the original does. Session state `E.fb.ega7Seen`: kept across CHAIN, not saved, false on a fresh start. Module PALETTE remaps apply on top either way |
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

**v1.1 mouse (`pointer.js`, `attachPointer(E, canvas)` at boot).** Click a printed menu label (`X-Label`, either case), a crew/item selector (`X>Name`, `X)Name`, `#n`), a Y/N letter, an ENTER / SPACE / F-key word, or an arm of a drawn arrow cross (SPACESH[15], INSH[64], PLBTSH[8]) to send the same key as the keyboard. Click a map cell (INSIDE map, SPACE long range / sector / system, PLBATTLE grid) to take one arrow step toward it (horizontal first; the cursor's own cell does nothing); in IN-10 click just above/below the current option to step, then ENTER to accept. The cursor becomes a pointer over targets. Every click goes through `input.device(code)` (so module logic is untouched); while the Esc overlay is open clicks go only to `input.modal.click(x, y)`. Regions are derived from the current screen on every event: `E.pointer.regions()` / `window.__clickRegions()` return `{key, x, y, w, h, kind}` in logical pixels (the shared source for v1.2's control overlay and tooltips). Map providers read the running module through `E.moduleInstance` (set by the generated SPACE/SPBATTLE/PLBATTLE entry, space/bas2js.py) and INSIDE's `E.commonScalars`. No framebuffer drawing. Tests: `node game/engine/pointer.test.mjs`; click = key matrix: `node acceptance/ref/scripts/click_check.mjs <outDir> <id>...` (server tools/serve.py 8094).

**Esc menu (`overlay.js`, `installEscape(E)`).** Device keys and pointer clicks go to `E.input.modal` while it is set. Otherwise Esc opens the menu. Programmatic `E.input.push` bypasses device routing. The menu offers Resume, Save & Quit, Quit without saving, Settings and, when enabled, Load. Timer waits and audio pause while the menu is open; opening Settings resumes play. Quit and Load ask before discarding changed progress. Save & Quit away from a starport explains that play resumes from the last starport save and asks before proceeding. At the starport main menu it captures current state; other starport screens use the last main-menu checkpoint or arrival; elsewhere it uses the last departure checkpoint or existing save, rolling back later location writes. A save failure keeps the game open with an error. If the browser refuses to close the window, the page offers a return to the title. Tests: `node game/engine/overlay.test.mjs`.

**Control help and Plus (`help.js`, `plus.js`).** F1 opens or focuses the separate Star Command Plus window on its Help tab. The question-mark button does the same when `controlOverlay` is enabled; keyboard F1 remains available when it is off. Help uses `E.pointer.regions()`, printed labels and screen-specific supplements. Plus also has Settings and Log book tabs; Manual appears only when its data is available. The game keeps running. Close Plus through its own window controls, not a promised F1 toggle. When a separate window cannot open, `settings-panel.js` provides Help and Settings on the game page; the in-game Log book button remains available. Esc closes the fallback panel when it has focus. `E.help` exposes `open`, `close`, `toggle`, `isOpen`, `lines` and `sections`; `isOpen` tracks the fallback Help panel, not the separate window. Tests: `node game/engine/help.test.mjs`, `node game/engine/plus.test.mjs`.

**v1.2 item tooltips (`tooltip.js`, `installTooltips(E, canvas)`; data `assets/data/items.json` from `python -I tools/items.py`).** Hover a printed item name (STARPORT buy/sell/inspect lists and ship browser, SPACE/INSIDE inspect and equip, PLBATTLE weapon switch) or a populated crew row to see its decoded stats and cost: 152 records (guns, squad weapons, hand weapons, armor suits, shields, defense hardware, missile killers, sighting units, misc items, ships, pay per rank) built from INFO.BAS + NAME, every field with its decode source in `src`; STARPORT purchase prices include the starport's x1.2 (STARPORT 076F-0791), other contexts label the base price; columns the decode does not explain are not shown. Recognition matches the screen text per screen (names as the screen truncates them); an ambiguous match shows nothing. `E.tooltips.at(lx, ly)`. Switch `itemTooltips`. Tests: `node game/engine/tooltip.test.mjs` (`--shots` with tools/serve.py 8094).

**Settings (`settings.js`, `settings-panel.js`, `plus.js`).** Esc -> T-Settings opens Plus. Controls are native checkboxes: click, or Tab and Space, rather than letter shortcuts. Sound, Music and Sound effects are separate switches. The pause menu cannot be disabled; F1 still opens Help. Values are stored in localStorage under `starcommand:settings`. Features ask `E.settings.on(name)` when they act. `noChallenge` off restores the rule-book question. A `?protection=1` session override wins initially; changing that setting clears the override. Device hotkeys use `E.input.hotkeys` (code -> `{run, enabled}`); F2 cycles speed. Tests: `node game/engine/settings.test.mjs`, `node game/engine/settings-panel.test.mjs`.

**v1.3 save slots (`slots.js`; the `saves.js` `?save=<name>` loader unchanged).** With `saveSlots` on, Esc `S` asks for a named slot (new or overwrite; names validated before any write), Esc `L` loads one, and `1-Play` on the title menu offers the picker once per visit (`Continue current disk` = the original save). Each slot = CHARINFO.BAS + CHARNAME + every IN-n/INMAP-n + LOGBOOK, compact base64 records in localStorage (`starcommand:slots:v1` index), a clear message when storage is full. Autosave = the STARPORT arrival checkpoint, replaced at every arrival (never from `?screen=` dev jumps). Loading restarts at STARCOMM without a page reload.

**Veteran crew (`saves.js`, `byoc/convert/veteran.js`).** Import prepares eight veterans, a fully fitted Warrior-class ship and the first mission, docked at the starport main menu. The veteran launcher opens `http://127.0.0.1:8088/index.html?save=veteran`, without `force`; an existing save is kept. Its address uses separate storage from regular play at localhost. To replace a current game, open Settings, click Load veteran crew, then Load or Cancel in the confirmation. Loading resets current crew and saved location files, preserves separately named slots and reloads the page. A manually supplied `force=1` URL asks Y/N before replacing an existing save, and the page then removes that parameter. Tests: `node game/engine/saves.test.mjs`.

**Crew panel and log book (`panels.js`, installed from index.html).** The panel uses spare width beside the picture in SPACE, INSIDE and PLBATTLE and is hidden without room. It shows health, weapons, ammunition and reloads; ground-battle stamina; fuel, armor and ship systems in space. The Log book is available through Plus or its corner button, with whole-number display. Entries include briefings, arrivals, battles, credits, deaths and medals. A confirmed new game clears its in-memory entries. Save & Quit and named-slot snapshots carry the log book; the native starport save does not call its persistence method. Switches: `crewPanel`, `logBook`.

**v1.3 combat aids (`combat.js`).** Enemy tooltips (PLBATTLE group letters / enemy-grid sprites / target letters, SPBATTLE ships): HP or hull, armor, weapon, range, tactic, count alive. In the PLBATTLE command phase, hover the lower-right corner for `Range` (each member's reach as Groups In Range computes it, 0575B: A within reach, a within twice) and `Hit preview` (hit chance, expected hits and damage for the selected command and target from the decoded formulas, PLBATTLE 06864.. / SPBATTLE 056FF..). Read-only. Switches `enemyTooltips`, `rangeOverlay`, `hitPreview`.

**Manual, speed, markers and hints (`manual.js`, `speed.js`, `marker.js`, `hints.js`).** Manual data is not shipped in the public build, so its button, tab and setting are hidden. With data present, the in-game viewer offers a screen selector and page buttons. F2 or Speed cycles normal / fast / fastest by scaling empty-loop delays by 1, 4 or 16; random rolls and TIMER waits are unchanged. Yellow boxes mark unfinished mission sectors on the galaxy and long-range maps. Bright squad marker highlights the squad inside a station or base. Hints show control reminders beneath the picture when space permits. Switches: `manual`, `speed`, `missionMarker`, `squadMarker`, `hints`.

Key codes (`input.js` `KEY`): `'\r'` ENTER, `'\x1b'` ESC, `'\b'` BACKSPACE, `' '` SPACE, arrows `'\0H'` up, `'\0P'` down, `'\0K'` left, `'\0M'` right (= `CHR$(0)+CHR$(scan)`), letters as typed (compare case-insensitively where the original does).

BASIC functions (`basic.js`): `str$`, `printNum`, `cint` (half away from zero, as the runtime's CINT A915: CINT(2.5) = 3, CINT(-2.5) = -3), `int`, `fix`, `sgn`, `val`, `left$`, `right$`, `mid$`, `space$`, `string$`, `chr$`, `asc`, `using`.

