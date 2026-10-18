// startup.js — STARCOMM (launcher) + STARTUP (title, attract loop, main menu, new game)
// Screens: CM-01, SU-01, SU-02, SU-03, SU-04, SU-05 (decode/pseudo/SCREENS_INDEX.md)
// Decode sources: decode/pseudo/STARCOMM.bas.md, decode/pseudo/STARTUP.bas.md (verified 166/167 + fixes applied,
// decode/pseudo/STARTUP_VERIFY.md), STARTUP_SCREENS.md, CROSSREF.md §1-2. Comments `// 0A94` = listing offsets.
//
// Written against the engine API of BUILD_PLAN.md §2 BEFORE game/engine/README.md existed.
// Every call whose exact shape is a guess is marked `TODO(api)`; align when build-engine posts milestone 1.
//
// Engine object assumed (TODO(api)): eng = { display, text, sprites, input, audio, state, timer, chain, data }
//   display.screen(mode) / display.palette(attr, colour) / display.line(x1,y1,x2,y2,colour,box) / display.paint(x,y,paint,border)
//   text.locate(row,col) / text.print(...items) with BASIC separators, text.cls(), text.keyOff()
//   sprites.put(bank, index, x, y, verb)            verbs: 'OR' 'AND' 'PRESET' 'PSET' 'XOR'
//   input.inkey() -> '' | key string (non-blocking INKEY$: letters as typed, extended keys as '\0'+chr(code))
//   audio.play(mml) / audio.queue() = PLAY(0)       (MB background queue)
//   timer.now() = TIMER (seconds) / timer.frame() = yield one frame (busy-wait loops become polling loops)
//   state.G = Float32Array(2601) (COMMON A()/G!()) ; state.str(name) -> JS array of the COMMON string array
//   state.load('CHARINFO.BAS') ; data.nameFields() -> NAME as INPUT# fields ; data.charName() -> CHARNAME fields
//   chain('STARTUP' | 'STARPORT')
import { cint } from '../engine/basic.js';
// Game text: every string literal comes from the modules' own INIT tables by DS address (startup/strings.js is generated
// from STARCOMM.EXE / STARTUP.EXE - by the BYOC importer from the player's copy; game/byoc/pipeline.js stringTableJs).
import { STARCOMM as CM, STARTUP as SU } from './startup/strings.js';   // runtime A915: round half away from zero (qa fix, decode/brun30/CIRCLE.md s.2)

// ---- G!() indices used here (A(n) = G!(n) = DS 0x1850 + 4n; names per CROSSREF.md §2.2) ----
const CREDITS_HI = 78, CREDITS_LO = 79, A83 = 83, DRIVE_TYPE = 84 /* A(84) */, DRIVE_CFG = 85, STD_DELAY = 86,
      A87 = 87, USE_EGA = 89, EGA_DETECTED = 90, ADAPTER_PREF = 91, A92 = 92, SOUND_OFF = 93,
      CHAIN_ARG = 2214, SECTOR_X = 2216, SECTOR_Y = 2217, CURSOR_COL = 2218, CURSOR_ROW = 2219,
      SYS_CUR_X = 2220, SYS_CUR_Y = 2221;

// ---- string literals (STARTUP INIT table by descriptor DS address, MODULE_CONSTANTS.public.md)
const TUNE = SU[0x4896];                                       // 174-char MML title tune
const DRIVE_NAME = [SU[0xD358], SU[0xD372], SU[0xD38C]];       // DriveName$(0..2)
const ADAPTER = [SU[0xD3AE], SU[0xD3CC]];                      // Adapter$(0..1)
const SOUND_TEXT = [SU[0xD3F2], SU[0xD400]];                   // SoundText$(0..1)

// NAME file -> COMMON string arrays, in file order (STARTUP 00F0-0594; CROSSREF.md §2.4). [name, first, last]
export const NAME_ARRAYS = [
  ['Rank$', 1, 13], ['Skill$', 0, 15], ['ShipClassName$', 0, 8], ['ShipSize$', 0, 3], ['ShieldName$', 0, 4],
  ['DefHwName$', 0, 4], ['MissileKillerName$', 0, 2], ['GunName$', 0, 24], ['WeaponName$', 0, 53],
  ['HandWeaponName$', 0, 5], ['SightingName$', 0, 3], ['ArmorSuitName$', 0, 15], ['MiscItemName$', 0, 10],
  ['ItemName$', 0, 99], ['FindName$', 0, 49], ['ShipType$', 0, 22], ['EquipName$', 0, 22], ['AttrName$', 0, 6],
]; // 374 fields read (the 375th, an empty trailing field, is never read)

export const screens = ['CM-01', 'SU-01', 'SU-02', 'SU-03', 'SU-04', 'SU-05'];

// ======================================================================== engine adapter (game/engine/README.md, milestone 1)
// The flow below is written against small internal names; this maps them onto the real engine object E.
// Milestone-2 services (audio, state, data, timer, chain) are local stand-ins until build-engine ships them
// (engine requests filed in STATUS.md).
export default async function (E, opts = {}) {
  const eng = makeEng(E);
  const screen = opts.screen ?? (typeof location !== 'undefined' ? new URLSearchParams(location.search).get('screen') : null);
  // CM-01 always runs first (dev jumps too, so the fixture has the launcher's EGA flags); its CHAIN "STARTUP"
  // just falls through to the STARTUP flow below.
  await starcomm({ ...eng, chain: (m) => m });
  return run(eng, { screen: screen === 'CM-01' ? null : screen });
}

export function makeEng(E) {
  const st = E.state ?? stubState();            // TODO(engine M2): E.state (COMMON G!() + string arrays + CHARINFO.BAS)
  return {
    display: {
      screen: (m) => E.screen(m),
      palette: (a, c) => E.fb.palette(a, c),
      line: (x1, y1, x2, y2, c, box) => E.gfx.line(x1, y1, x2, y2, c, box ?? ''),
      paint: (x, y, p, b) => E.gfx.paint(x, y, p, b),
    },
    text: {
      locate: (r, c) => E.text.locate(r, c),
      print: (s, sep) => (sep ? E.text.print(s, sep) : E.text.print(s)),
      cls: () => E.text.cls(),
      color: (a, b) => E.text.color(a, b),
      keyOff: () => {},                         // KEY OFF: row 25 reachable with LOCATE (text.js handles it)
    },
    sprites: { put: (bank, index, x, y, verb) => E.sprites.put(x, y, { bank: bank + '.BAS', index }, verb) },
    input: { inkey: () => E.input.inkey() },
    audio: E.audio ?? stubAudio(),             // TODO(engine M2): PLAY with MB queue + PLAY(0)
    timer: E.timer ?? stubTimer(),             // TODO(engine M2)
    state: st,
    data: E.data ?? stubData(),                // TODO(engine M2): NAME / CHARNAME
    chain: E.chain ?? ((m) => { E.text.locate(25, 1); E.text.print(`CHAIN ${m} (module not built yet)`, ';'); return m; }),
  };
}

function stubTimer() {
  return {
    now: () => performance.now() / 1000,
    frame: () => new Promise((r) => setTimeout(r, 16)),   // one ~60 Hz tick (setTimeout: also runs in background/headless tabs)
  };
}
function stubAudio() {
  // silent queue model: each played chunk adds its note count; notes drain at ~4 per second (tempo 126, L4)
  let q = 0, last = performance.now();
  const drain = () => { const t = performance.now(); q = Math.max(0, q - ((t - last) / 1000) * 4); last = t; };
  return {
    play: (s) => { drain(); if (s.startsWith('X')) q += (s.match(/[A-GP]/gi) || []).length; },
    queue: () => { drain(); return Math.floor(q); },
    sound: () => { q = 0; },
  };
}
function stubState() {
  const G = new Float32Array(2601), strs = {};
  return { G, str: (n) => (strs[n] ??= []), load: async () => {} };   // fixture: fresh save (all zero)
}
function stubData() {
  return { nameFields: async () => new Array(375).fill(''), charName: async () => new Array(10).fill('') };
}

// ======================================================================== STARCOMM (CM-01)
// STARCOMM.bas.md lines 20..100. Nothing is drawn; the program ends in CHAIN "STARTUP".
export async function starcomm(eng) {
  const { display, text, state } = eng, G = state.G;
  // line 20 (0040..0073): SCREEN 1: COLOR 0,1: CLS (x3, as the bytes say) : SCREEN 1 : KEY OFF
  for (let i = 0; i < 2; i++) { display.screen(1); text.color(0, 1); text.cls(); } // TODO(api): text.color
  display.screen(1);
  text.keyOff();
  await state.load(CM[0x40FA]);               // 0078 BLOAD "CHARINFO.BAS", &H1850   TODO(api): async load of the save file
  G[EGA_DETECTED] = 0;                        // 0087 line 30
  // 0090 line 40 ON ERROR GOTO 100; line 50 PALETTE 1,9 : PALETTE 2,4 : A(90) = 1.
  // On CGA the PALETTE statement errors and RESUME 60 skips A(90)=1. The reproduction always has an EGA
  // (BUILD_PLAN §1: 640x200 EGA 16-colour), so the probe succeeds.
  display.palette(1, 9); display.palette(2, 4); // 0096 / 009F
  G[EGA_DETECTED] = 1;                        // 00A8
  // 00B1 line 60
  if (G[EGA_DETECTED] === 0 || G[ADAPTER_PREF] === 1) G[USE_EGA] = 0; else G[USE_EGA] = 1;
  // 00EA line 65
  if (G[EGA_DETECTED] === 1 && G[USE_EGA] === 0) text.color(0, 1);
  return eng.chain(CM[0x4112]);               // 0119 line 70
}

// ======================================================================== STARTUP
export async function run(eng, opts = {}) {
  const m = new Startup(eng);
  return m.main(opts.screen);
}

class Startup {
  constructor(eng) {
    Object.assign(this, eng);
    this.G = eng.state.G;
    // module-local (non-COMMON) variables, names from STARTUP.bas.md ## Variables
    this.tune = '';        // Tune$      0x4948
    this.soundOn = 0;      // SoundOn    0x4958
    this.maxDrive = 0;     // MaxDrive   0x4960
    this.keyHit = 0;       // KeyHit     0xD412 (-1 = key pressed)
    this.j = 0;            // J          0xD416
    this.tunePlaying = 0;  // TunePlaying 0xD426
    this.timerMark = 0;    // TimerMark  0xD42E
    this.driveSel = 0;     // DriveSel   0xD436
    this.speed = 0;        // Speed      0xD520 (0 at module start: compiled code zero-initialises DS)
    this.tunePos = 0;      // TunePos    0xD724
    this.yesNo = 0;        // YesNo      0xD58E
  }

  // ---------------------------------------------------------------- 0040..0660 (SU-01 setup)
  async main(jump) {
    const { G, text, display, sprites, audio, state, data } = this;
    this.tune = TUNE;                                   // 0040
    audio.play(SU[0x494C]);                             // 0049 background, legato, tempo 126
    this.soundOn = Math.trunc(1 - G[SOUND_OFF]);        // 004F SoundOn = INT(1 - SoundOff!)  (INT = floor; values are 0/1)
    if (this.soundOn !== 0) this.feedMusic();           // 0064
    this.maxDrive = 1;                                  // 0073
    display.screen(1);                                  // 007C
    text.cls();                                         // 0082
    text.keyOff();                                      // 0088
    if (G[USE_EGA] === 1) { display.palette(1, 9); display.palette(2, 4); } // 008D
    // 00AD BLOAD "title", &H4964 : the atlas already holds TITLE.BAS[0..4]
    sprites.put('TITLE', 0, 0, 0, 'XOR');               // 00BC PUT (0,0), TitlePic, XOR   (verb 4)
    if (this.soundOn !== 0) this.feedMusic();           // 00D0

    // 00E0..0594 OPEN "NAME" FOR INPUT AS #1 : 18 FOR loops of INPUT #1 : CLOSE #1
    const f = await data.nameFields();                  // TODO(api): NAME as the sequence of INPUT# fields
    let k = 0;
    for (const [name, first, last] of NAME_ARRAYS) {
      const arr = state.str(name);                      // TODO(api)
      for (let i = first; i <= last; i++) arr[i] = f[k++];
    }
    // 059A..05FC OPEN "CHARNAME": INPUT #1, ShipName$ : FOR I = 1 TO 8: INPUT #1, CrewName$(I) : CLOSE #1
    const c = await data.charName();                    // TODO(api): CHARNAME fields (save-file aware: state may own it)
    state.str('ShipName$')[0] = c[0];
    const crew = state.str('CrewName$');
    for (let i = 1; i <= 8; i++) crew[i] = c[i];
    // 0602 BLOAD "LOGO", &H40F4 : LOGO.BAS[0] is in the atlas (COMMON copy, used by SPACE/STARPORT too)
    if (this.soundOn !== 0) this.feedMusic();           // 0611
    // 0621 DriveName$/Adapter$/SoundText$ assignments -> module constants above

    // dev jumps (BUILD_PLAN §4: ?screen=<id> with a fixture G!())
    if (jump === 'SU-02') return this.attract(true);
    if (jump === 'SU-03') return this.menu();
    if (jump === 'SU-04') return this.menu('2');
    if (jump === 'SU-05') return this.menu('1');
    this.markTimer();                                   // 0660 GOSUB L_07F4
    return this.attract(false);
  }

  // ---------------------------------------------------------------- SU-01 / SU-02 attract loop 0663..07AA
  async attract(skipStill) {
    const { sprites, input } = this;
    if (!skipStill) {
      if (input.inkey() !== '') return this.menu();     // 0663 IF INKEY$ <> "" THEN GOTO L_07FE
      for (this.j = 1; this.j <= 100; this.j++) {       // 0673 FOR J = 1 TO 100
        await this.wait24();                            // 067C GOSUB L_07AD
        if (this.keyHit !== 0) this.j = 199;            // 067F
      }                                                 // 0695 NEXT J (J leaves at 101 or 200)
      if (this.j > 150) return this.menu();             // 06AE
    }
    for (;;) {
      this.tunePlaying = 1;                             // 06BC
      sprites.put('TITLE', 1, 28, 54, 'PSET');          // 06C5 Frame1 (200x102)
      await this.wait24(); if (this.keyHit !== 0) return this.menu(); // 06DB
      sprites.put('TITLE', 2, 48, 58, 'PSET');          // 06EB Frame2
      await this.wait24(); if (this.keyHit !== 0) return this.menu(); // 0701
      sprites.put('TITLE', 3, 48, 58, 'PSET');          // 0711 Frame3
      await this.wait24(); if (this.keyHit !== 0) return this.menu(); // 0727
      sprites.put('TITLE', 4, 44, 48, 'PSET');          // 0737 Frame4
      for (this.j = 1; this.j <= 3; this.j++) {         // 074D FOR J = 1 TO 3
        await this.wait24();                            // 0756
        if (this.keyHit !== 0) this.j = 99;
      }
      if (this.j > 50) return this.menu();              // 0788
      sprites.put('TITLE', 0, 0, 0, 'PSET');            // 0796 restore the picture
    }                                                   // 07AA GOTO L_06BC
  }

  // 07AD..07FD: wait until 2.4 s since TimerMark (feeding the music), then sample the keyboard once
  async wait24() {
    const { timer, input } = this;
    while (Math.abs(timer.now() - this.timerMark) < 2.4) { // 07AD ABS(TIMER - TimerMark) < 2.4
      if (this.soundOn !== 0) this.feedMusic();         // 07C4
      await timer.frame();                              // busy loop -> one frame per iteration
    }
    this.keyHit = input.inkey() !== '' ? -1 : 0;        // 07D8 KeyHit = (INKEY$ <> "")
    this.markTimer();                                   // 07F4
  }
  markTimer() { this.timerMark = this.timer.now(); }    // 07F4 TimerMark = TIMER

  // ---------------------------------------------------------------- SU-03 main menu 07FE..0A32
  async menu(devKey) {
    const { G, text, display, sprites, input, timer } = this;
    text.cls();                                          // 07FE
    display.line(0, 1, 319, 198, -1, 'B');               // 0804  colour -1 = default foreground
    display.line(1, 2, 318, 197, -1, 'B');               // 0823
    display.line(5, 29, 314, 194, -1, 'B');              // 0841
    display.line(6, 30, 313, 193, -1, 'B');              // 0861
    display.line(5, 5, 314, 26, -1, 'BF');               // 087F title bar
    sprites.put(SU[0xD344], 0, 120, 7, 'PSET');          // 089F BLOADed as LOGO (0602)
    display.paint(3, 3, 2, 3);                           // 08B5 PAINT (3,3), 2, 3
    this.driveSel = G[DRIVE_TYPE];                       // 08CA DriveSel = A(84)
    for (;;) {                                           // L_08D3 (key 2 returns here)
      this.drawMenu();                                   // 08D3..09EC
      if (this.speed < 1) await this.calibrate();        // 09EF IF Speed < 1 THEN GOSUB L_0A56
      for (;;) {                                         // L_0A00
        const k = devKey ?? input.inkey(); devKey = undefined;
        const choice = cint(basicVal(k));                // 0A00 Choice = VAL(INKEY$)
        // 0A11 ON CINT(Choice) GOTO L_0A94, L_0B0A, L_0D2F, L_0D81, L_0DEF (0 or > 5 falls through)
        if (choice === 1) return this.leave();           // SU-05
        if (choice === 2) { await this.newGame(); break; } // SU-04; both exits GOTO L_08D3
        if (choice === 3) { this.keyDrive(); continue; } // each GOTO L_0A00
        if (choice === 4) { this.keySound(); continue; }
        if (choice === 5) { this.keyAdapter(); continue; }
        if (this.soundOn !== 0) this.feedMusic();        // 0A22
        await timer.frame();                             // 0A32 GOTO L_0A00 (busy loop -> one frame)
      }
    }
  }

  // PRINT convention used below (TODO(api)): text.print(s) = PRINT s (newline); text.print(s, ';') = PRINT s;
  // All items in this module are strings, so `PRINT a; b` is printed as the concatenation a + b.
  drawMenu() {                                            // 08D3..09EC
    const { G, text } = this;
    this.clearWindow();                                   // 08D3 GOSUB L_0A34
    text.locate(5, 2);  text.print(SU[0xD43A]);    // 08D6
    text.locate(6, 2);  text.print(SU[0xD464]);    // 08F0
    text.locate(13, 8); text.print(SU[0xD48E]);                       // 0907
    text.locate(14, 8); text.print(SU[0xD4A6]);                          // 0921
    text.locate(15, 8); text.print(SU[0xD4BA] + DRIVE_NAME[cint(this.driveSel)]);      // 0938
    text.locate(16, 8); text.print(SU[0xD4C0] + SOUND_TEXT[cint(G[SOUND_OFF])]);       // 0960
    if (G[EGA_DETECTED] === 1) { text.locate(17, 8); text.print(SU[0xD4C6] + ADAPTER[cint(G[USE_EGA])]); } // 0988
    text.locate(23, 2); text.print(SU[0xD4CC]);     // 09BE
    text.locate(24, 2); text.print(SU[0xD4F6], ';'); // 09D8 trailing ; (no scroll)
  }
  clearWindow() { this.display.line(7, 31, 312, 192, 0, 'BF'); } // 0A34 LINE (7,31)-(312,192),0,BF

  // 0A56..0A93 CPU speed calibration: Speed = loop iterations in one TIMER second.
  // BUILD_PLAN §2 timer.js: replaced by a fixed constant (the value is StdDelay! = A(86), the modules'
  // standard delay factor). The ~1 s pause on the first menu visit is kept for behaviour.
  async calibrate() {
    const { timer } = this;
    // 0A56 TimerMark = TIMER : 0A5F IF TIMER = TimerMark THEN GOTO 0A56  -> wait for the next TIMER tick edge
    const mark = timer.now();
    while (timer.now() === mark) await timer.frame();
    const t1 = timer.now();                              // 0A6A
    while (timer.now() - t1 < 1) await timer.frame();    // 0A73..0A83
    this.speed = timer.stdDelay ?? CALIBRATED_SPEED;     // TODO(api)+TODO(acceptance): DOSBox-measured value
  }

  // ---------------------------------------------------------------- SU-05 key 1: play 0A94..0B08
  async leave() {
    const { G, audio, timer } = this;
    G[DRIVE_TYPE] = this.driveSel;                        // 0A94 A(84) = DriveSel
    G[DRIVE_CFG] = 0;                                     // 0A9D
    G[STD_DELAY] = this.speed;                            // 0AA6 StdDelay! = Speed
    G[A87] = 0;                                           // 0AB1
    G[A92] = 0;                                           // 0AB9
    const q0 = audio.queue();                             // 0ABF Q0 = PLAY(0)
    for (;;) {                                            // 0ACD
      const q = audio.queue();
      if (q === 0 || q0 - q > 2) break;
      await timer.frame();                                // 0B08 GOTO L_0ACD (no music feeding while waiting)
    }
    return this.chain(SU[0xD530]);                        // 0AFF CHAIN "STARPORT"
  }

  // ---------------------------------------------------------------- SU-04 key 2: new game 0B0A..0CB6
  async newGame() {
    const { G, text, state } = this;
    this.clearWindow();                                   // 0B0A
    text.locate(13, 2); text.print(SU[0xD53C]);      // 0B0D
    text.locate(14, 2); text.print(SU[0xD564]);   // 0B27
    await this.yesNoPrompt();                             // 0B3E
    if (this.yesNo === 0) return false;                   // 0B41 GOTO L_08D3
    this.clearWindow();                                   // 0B4C
    text.locate(13, 2); text.print(SU[0xD592]);     // 0B4F
    text.locate(14, 2); text.print(SU[0xD5BA]);                              // 0B69
    await this.yesNoPrompt();                             // 0B80
    if (this.yesNo === 0) return false;                   // 0B83
    this.clearWindow();                                   // 0B8E
    text.locate(14, 3); text.print(SU[0xD5CA]);        // 0B91
    const crew = state.str('CrewName$');
    for (let i = 0; i <= 8; i++) crew[i] = '';            // 0BA9
    state.str('ShipName$')[0] = '';                       // 0BE6
    const saveEGA = G[EGA_DETECTED];                      // 0BEF
    for (let i = 0; i <= 2600; i++) G[i] = 0;             // 0BF8
    G[CREDITS_HI] = 3;                                    // 0C34
    G[CREDITS_LO] = 5000;                                 // 0C3D
    G[A83] = 27;                                          // 0C46
    G[USE_EGA] = saveEGA;                                 // 0C4F
    G[EGA_DETECTED] = saveEGA;                            // 0C58
    G[CHAIN_ARG] = 2;                                     // 0C60
    G[SECTOR_X] = 28;                                     // 0C69
    G[SECTOR_Y] = 2;                                      // 0C74
    G[CURSOR_COL] = 7;                                    // 0C7C
    G[CURSOR_ROW] = 7;                                    // 0C85
    G[SYS_CUR_X] = 6;                                     // 0C8B
    G[SYS_CUR_Y] = 6;                                     // 0C94
    if (G[EGA_DETECTED] === 1) this.applyPalette();       // 0C9A
    this.soundOn = 1;                                     // 0CAA
    this.feedMusic();                                     // 0CB3
    // the new save is NOT written to disk here (no BSAVE/OPEN FOR OUTPUT in STARTUP)
    return true;                                          // 0CB6 GOTO L_08D3
  }

  // 0CB9..0D2D Y/N prompt: YesNo = 1 for y/Y, 0 for n/N; any other key keeps waiting (music fed)
  async yesNoPrompt() {
    const { input, timer } = this;
    for (;;) {
      this.yesNo = 0;                                     // 0CB9
      const k = input.inkey();                            // 0CC2
      if (k === SU[0xD60C] || k === SU[0xD612]) return;                 // 0CCB
      if (k === SU[0xD618] || k === SU[0xD61E]) { this.yesNo = 1; return; } // 0CEF
      if (this.soundOn !== 0) this.feedMusic();           // 0D1D
      await timer.frame();                                // 0D2D GOTO L_0CB9
    }
  }

  // 0D2F key 3: cycle drive type (MaxDrive = 1 -> toggles 0/1 only)
  keyDrive() {
    const { text } = this;
    // 0D2F DriveSel = (DriveSel + 1) * ABS(DriveSel < MaxDrive)   (BASIC true = -1)
    this.driveSel = (this.driveSel + 1) * Math.abs(this.driveSel < this.maxDrive ? -1 : 0);
    text.locate(15, 10); text.print(DRIVE_NAME[cint(this.driveSel)]);           // 0D5C
  }
  // 0D81 key 4: toggle sound
  keySound() {
    const { G, text, audio } = this;
    G[SOUND_OFF] = 1 - G[SOUND_OFF];                      // 0D81
    this.soundOn = 1 - this.soundOn;                      // 0D8F
    text.locate(16, 10); text.print(SOUND_TEXT[cint(G[SOUND_OFF])]);            // 0D9E
    if (this.soundOn === 1) { this.tunePos = 0; this.feedMusic(); }             // 0DCC
    else audio.sound(99, 0);                              // 0DDB SOUND 99, 0  TODO(api): audio.sound (silences the queue)
  }
  // 0DEF key 5: toggle adapter (only when EGA detected)
  keyAdapter() {
    const { G, text } = this;
    if (G[EGA_DETECTED] === 0) return;                    // 0DEF
    G[USE_EGA] = 1 - G[USE_EGA];                          // 0DFA
    text.locate(17, 10); text.print(ADAPTER[cint(G[USE_EGA])]);                 // 0E06
    G[ADAPTER_PREF] = G[USE_EGA] !== G[EGA_DETECTED] ? 1 : 0; // 0E28 ABS(UseEGA! <> A(90))
    this.applyPalette();                                  // 0E45
  }
  // 0E4B..0E7E
  applyPalette() {
    const { G, display } = this;
    display.palette(1, cint(G[USE_EGA] * 6 + 3));         // 0E4B  3 (CGA) / 9 (EGA)
    display.palette(2, cint(5 - G[USE_EGA]));             // 0E6B  5 (CGA) / 4 (EGA)
  }

  // 0E7F..0EF3 feed the background music queue, 3 tune characters at a time
  feedMusic() {
    const { audio } = this;
    for (;;) {
      if (audio.queue() > 31 || this.tunePlaying === 0) return;          // 0E7F
      const note = this.tune.substr(cint(this.tunePos + 1) - 1, 3);       // 0EA3 MID$(Tune$, TunePos+1, 3)
      audio.play(SU[0xD72C] + note);                             // 0EC0 PLAY "X"+VARPTR$(Note$) = play the substring  TODO(api)
      this.tunePos = this.tunePos + 3;                    // 0ECE
      if (this.tune.length < this.tunePos) this.tunePos = 0; // 0EDC
    }                                                     // 0EF3 GOTO L_0E7F
  }
}

// TODO(acceptance): measure the DOSBox calibration (STARTUP 0A56) and use it as the default Standard Delay Factor.
const CALIBRATED_SPEED = 1000;

// VAL of an INKEY$ string: leading number, else 0 (extended keys start with CHR$(0) -> 0)
function basicVal(s) { const m = /^\s*[-+]?\d*\.?\d+/.exec(s || ''); return m ? Number(m[0]) : 0; }
