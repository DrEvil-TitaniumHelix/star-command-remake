import { cint } from '../engine/basic.js';
import { STARCOMM as CM, STARTUP as SU } from './startup/strings.js';

const CREDITS_HI = 78, CREDITS_LO = 79, A83 = 83, DRIVE_TYPE = 84  , DRIVE_CFG = 85, STD_DELAY = 86,
      A87 = 87, USE_EGA = 89, EGA_DETECTED = 90, ADAPTER_PREF = 91, A92 = 92, SOUND_OFF = 93,
      CHAIN_ARG = 2214, SECTOR_X = 2216, SECTOR_Y = 2217, CURSOR_COL = 2218, CURSOR_ROW = 2219,
      SYS_CUR_X = 2220, SYS_CUR_Y = 2221;

const TUNE = SU[0x4896];
const DRIVE_NAME = [SU[0xD358], SU[0xD372], SU[0xD38C]];
const ADAPTER = [SU[0xD3AE], SU[0xD3CC]];
const SOUND_TEXT = [SU[0xD3F2], SU[0xD400]];

export const NAME_ARRAYS = [
  ['Rank$', 1, 13], ['Skill$', 0, 15], ['ShipClassName$', 0, 8], ['ShipSize$', 0, 3], ['ShieldName$', 0, 4],
  ['DefHwName$', 0, 4], ['MissileKillerName$', 0, 2], ['GunName$', 0, 24], ['WeaponName$', 0, 53],
  ['HandWeaponName$', 0, 5], ['SightingName$', 0, 3], ['ArmorSuitName$', 0, 15], ['MiscItemName$', 0, 10],
  ['ItemName$', 0, 99], ['FindName$', 0, 49], ['ShipType$', 0, 22], ['EquipName$', 0, 22], ['AttrName$', 0, 6],
];

export const screens = ['CM-01', 'SU-01', 'SU-02', 'SU-03', 'SU-04', 'SU-05'];

export default async function (E, opts = {}) {
  const eng = makeEng(E);
  const screen = opts.screen ?? (typeof location !== 'undefined' ? new URLSearchParams(location.search).get('screen') : null);
  await starcomm({ ...eng, chain: (m) => m });
  return run(eng, { screen: screen === 'CM-01' ? null : screen });
}

export function makeEng(E) {
  const st = E.state ?? stubState();
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
      keyOff: () => {},
    },
    sprites: { put: (bank, index, x, y, verb) => E.sprites.put(x, y, { bank: bank + '.BAS', index }, verb) },
    input: { inkey: () => E.input.inkey() },
    audio: E.audio ?? stubAudio(),
    timer: E.timer ?? stubTimer(),
    state: st,
    data: E.data ?? stubData(),
    chain: E.chain ?? ((m) => { E.text.locate(25, 1); E.text.print(`CHAIN ${m} (module not built yet)`, ';'); return m; }),
  };
}

function stubTimer() {
  return {
    now: () => performance.now() / 1000,
    frame: () => new Promise((r) => setTimeout(r, 16)),
  };
}
function stubAudio() {
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
  return { G, str: (n) => (strs[n] ??= []), load: async () => {} };
}
function stubData() {
  return { nameFields: async () => new Array(375).fill(''), charName: async () => new Array(10).fill('') };
}

export async function starcomm(eng) {
  const { display, text, state } = eng, G = state.G;
  for (let i = 0; i < 2; i++) { display.screen(1); text.color(0, 1); text.cls(); }
  display.screen(1);
  text.keyOff();
  await state.load(CM[0x40FA]);
  G[EGA_DETECTED] = 0;
  display.palette(1, 9); display.palette(2, 4);
  G[EGA_DETECTED] = 1;
  if (G[EGA_DETECTED] === 0 || G[ADAPTER_PREF] === 1) G[USE_EGA] = 0; else G[USE_EGA] = 1;
  if (G[EGA_DETECTED] === 1 && G[USE_EGA] === 0) text.color(0, 1);
  return eng.chain(CM[0x4112]);
}

export async function run(eng, opts = {}) {
  const m = new Startup(eng);
  return m.main(opts.screen);
}

class Startup {
  constructor(eng) {
    Object.assign(this, eng);
    this.G = eng.state.G;
    this.tune = '';
    this.soundOn = 0;
    this.maxDrive = 0;
    this.keyHit = 0;
    this.j = 0;
    this.tunePlaying = 0;
    this.timerMark = 0;
    this.driveSel = 0;
    this.speed = 0;
    this.tunePos = 0;
    this.yesNo = 0;
  }

  async main(jump) {
    const { G, text, display, sprites, audio, state, data } = this;
    this.tune = TUNE;
    audio.play(SU[0x494C]);
    this.soundOn = Math.trunc(1 - G[SOUND_OFF]);
    if (this.soundOn !== 0) this.feedMusic();
    this.maxDrive = 1;
    display.screen(1);
    text.cls();
    text.keyOff();
    if (G[USE_EGA] === 1) { display.palette(1, 9); display.palette(2, 4); }
    sprites.put('TITLE', 0, 0, 0, 'XOR');
    if (this.soundOn !== 0) this.feedMusic();

    const f = await data.nameFields();
    let k = 0;
    for (const [name, first, last] of NAME_ARRAYS) {
      const arr = state.str(name);
      for (let i = first; i <= last; i++) arr[i] = f[k++];
    }
    const c = await data.charName();
    state.str('ShipName$')[0] = c[0];
    const crew = state.str('CrewName$');
    for (let i = 1; i <= 8; i++) crew[i] = c[i];
    if (this.soundOn !== 0) this.feedMusic();

    if (jump === 'SU-02') return this.attract(true);
    if (jump === 'SU-03') return this.menu();
    if (jump === 'SU-04') return this.menu('2');
    if (jump === 'SU-05') return this.menu('1');
    this.markTimer();
    return this.attract(false);
  }

  async attract(skipStill) {
    const { sprites, input } = this;
    if (!skipStill) {
      if (input.inkey() !== '') return this.menu();
      for (this.j = 1; this.j <= 100; this.j++) {
        await this.wait24();
        if (this.keyHit !== 0) this.j = 199;
      }
      if (this.j > 150) return this.menu();
    }
    for (;;) {
      this.tunePlaying = 1;
      sprites.put('TITLE', 1, 28, 54, 'PSET');
      await this.wait24(); if (this.keyHit !== 0) return this.menu();
      sprites.put('TITLE', 2, 48, 58, 'PSET');
      await this.wait24(); if (this.keyHit !== 0) return this.menu();
      sprites.put('TITLE', 3, 48, 58, 'PSET');
      await this.wait24(); if (this.keyHit !== 0) return this.menu();
      sprites.put('TITLE', 4, 44, 48, 'PSET');
      for (this.j = 1; this.j <= 3; this.j++) {
        await this.wait24();
        if (this.keyHit !== 0) this.j = 99;
      }
      if (this.j > 50) return this.menu();
      sprites.put('TITLE', 0, 0, 0, 'PSET');
    }
  }

  async wait24() {
    const { timer, input } = this;
    while (Math.abs(timer.now() - this.timerMark) < 2.4) {
      if (this.soundOn !== 0) this.feedMusic();
      await timer.frame();
    }
    this.keyHit = input.inkey() !== '' ? -1 : 0;
    this.markTimer();
  }
  markTimer() { this.timerMark = this.timer.now(); }

  async menu(devKey) {
    const { G, text, display, sprites, input, timer } = this;
    text.cls();
    display.line(0, 1, 319, 198, -1, 'B');
    display.line(1, 2, 318, 197, -1, 'B');
    display.line(5, 29, 314, 194, -1, 'B');
    display.line(6, 30, 313, 193, -1, 'B');
    display.line(5, 5, 314, 26, -1, 'BF');
    sprites.put(SU[0xD344], 0, 120, 7, 'PSET');
    display.paint(3, 3, 2, 3);
    this.driveSel = G[DRIVE_TYPE];
    for (;;) {
      this.drawMenu();
      if (this.speed < 1) await this.calibrate();
      for (;;) {
        const k = devKey ?? input.inkey(); devKey = undefined;
        const choice = cint(basicVal(k));
        if (choice === 1) return this.leave();
        if (choice === 2) { await this.newGame(); break; }
        if (choice === 3) { this.keyDrive(); continue; }
        if (choice === 4) { this.keySound(); continue; }
        if (choice === 5) { this.keyAdapter(); continue; }
        if (this.soundOn !== 0) this.feedMusic();
        await timer.frame();
      }
    }
  }

  drawMenu() {
    const { G, text } = this;
    this.clearWindow();
    text.locate(5, 2);  text.print(SU[0xD43A]);
    text.locate(6, 2);  text.print(SU[0xD464]);
    text.locate(13, 8); text.print(SU[0xD48E]);
    text.locate(14, 8); text.print(SU[0xD4A6]);
    text.locate(15, 8); text.print(SU[0xD4BA] + DRIVE_NAME[cint(this.driveSel)]);
    text.locate(16, 8); text.print(SU[0xD4C0] + SOUND_TEXT[cint(G[SOUND_OFF])]);
    if (G[EGA_DETECTED] === 1) { text.locate(17, 8); text.print(SU[0xD4C6] + ADAPTER[cint(G[USE_EGA])]); }
    text.locate(23, 2); text.print(SU[0xD4CC]);
    text.locate(24, 2); text.print(SU[0xD4F6], ';');
  }
  clearWindow() { this.display.line(7, 31, 312, 192, 0, 'BF'); }

  async calibrate() {
    const { timer } = this;
    const mark = timer.now();
    while (timer.now() === mark) await timer.frame();
    const t1 = timer.now();
    while (timer.now() - t1 < 1) await timer.frame();
    this.speed = timer.stdDelay ?? CALIBRATED_SPEED;
  }

  async leave() {
    const { G, audio, timer } = this;
    G[DRIVE_TYPE] = this.driveSel;
    G[DRIVE_CFG] = 0;
    G[STD_DELAY] = this.speed;
    G[A87] = 0;
    G[A92] = 0;
    const q0 = audio.queue();
    for (;;) {
      const q = audio.queue();
      if (q === 0 || q0 - q > 2) break;
      await timer.frame();
    }
    return this.chain(SU[0xD530]);
  }

  async newGame() {
    const { G, text, state } = this;
    this.clearWindow();
    text.locate(13, 2); text.print(SU[0xD53C]);
    text.locate(14, 2); text.print(SU[0xD564]);
    await this.yesNoPrompt();
    if (this.yesNo === 0) return false;
    this.clearWindow();
    text.locate(13, 2); text.print(SU[0xD592]);
    text.locate(14, 2); text.print(SU[0xD5BA]);
    await this.yesNoPrompt();
    if (this.yesNo === 0) return false;
    this.clearWindow();
    text.locate(14, 3); text.print(SU[0xD5CA]);
    const crew = state.str('CrewName$');
    for (let i = 0; i <= 8; i++) crew[i] = '';
    state.str('ShipName$')[0] = '';
    const saveEGA = G[EGA_DETECTED];
    for (let i = 0; i <= 2600; i++) G[i] = 0;
    G[CREDITS_HI] = 3;
    G[CREDITS_LO] = 5000;
    G[A83] = 27;
    G[USE_EGA] = saveEGA;
    G[EGA_DETECTED] = saveEGA;
    G[CHAIN_ARG] = 2;
    G[SECTOR_X] = 28;
    G[SECTOR_Y] = 2;
    G[CURSOR_COL] = 7;
    G[CURSOR_ROW] = 7;
    G[SYS_CUR_X] = 6;
    G[SYS_CUR_Y] = 6;
    if (G[EGA_DETECTED] === 1) this.applyPalette();
    this.soundOn = 1;
    this.feedMusic();
    return true;
  }

  async yesNoPrompt() {
    const { input, timer } = this;
    for (;;) {
      this.yesNo = 0;
      const k = input.inkey();
      if (k === SU[0xD60C] || k === SU[0xD612]) return;
      if (k === SU[0xD618] || k === SU[0xD61E]) { this.yesNo = 1; return; }
      if (this.soundOn !== 0) this.feedMusic();
      await timer.frame();
    }
  }

  keyDrive() {
    const { text } = this;
    this.driveSel = (this.driveSel + 1) * Math.abs(this.driveSel < this.maxDrive ? -1 : 0);
    text.locate(15, 10); text.print(DRIVE_NAME[cint(this.driveSel)]);
  }
  keySound() {
    const { G, text, audio } = this;
    G[SOUND_OFF] = 1 - G[SOUND_OFF];
    this.soundOn = 1 - this.soundOn;
    text.locate(16, 10); text.print(SOUND_TEXT[cint(G[SOUND_OFF])]);
    if (this.soundOn === 1) { this.tunePos = 0; this.feedMusic(); }
    else audio.sound(99, 0);
  }
  keyAdapter() {
    const { G, text } = this;
    if (G[EGA_DETECTED] === 0) return;
    G[USE_EGA] = 1 - G[USE_EGA];
    text.locate(17, 10); text.print(ADAPTER[cint(G[USE_EGA])]);
    G[ADAPTER_PREF] = G[USE_EGA] !== G[EGA_DETECTED] ? 1 : 0;
    this.applyPalette();
  }
  applyPalette() {
    const { G, display } = this;
    display.palette(1, cint(G[USE_EGA] * 6 + 3));
    display.palette(2, cint(5 - G[USE_EGA]));
  }

  feedMusic() {
    const { audio } = this;
    for (;;) {
      if (audio.queue() > 31 || this.tunePlaying === 0) return;
      const note = this.tune.substr(cint(this.tunePos + 1) - 1, 3);
      audio.play(SU[0xD72C] + note);
      this.tunePos = this.tunePos + 3;
      if (this.tune.length < this.tunePos) this.tunePos = 0;
    }
  }
}

const CALIBRATED_SPEED = 1000;

function basicVal(s) { const m = /^\s*[-+]?\d*\.?\d+/.exec(s || ''); return m ? Number(m[0]) : 0; }
