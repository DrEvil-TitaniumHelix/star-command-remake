// starport.js — STARPORT module (lane build-starport)
// Screens: PT-00 .. PT-15, PT-01m (decode/pseudo/SCREENS_INDEX.md "STARPORT" rows)
// Decode sources: decode/pseudo/STARPORT.bas.md (verified 299/301 Opus + 306/306 GLM, fixes applied),
// STARPORT_SCREENS.md, STARPORT_names.json, CROSSREF.md §1-2, decode/data/DATA_FILES.md (INFO.BAS, MISSION).
//
// Structure:
//   starport/flow.js   GENERATED statement-for-statement from STARPORT.bas.md by starport/bas2js.py: every BASIC
//                      statement appears as `// <offset>  <statement>` above its JS, labels are `case 0xXXXX`,
//                      GOSUB/RETURN use a return stack, FOR/NEXT follow QuickBASIC semantics. That file IS the flow.
//   this file          the BASIC runtime the flow calls (PRINT / PRINT USING / LOCATE / INKEY$ / LINE / PUT / GET /
//                      BLOAD / BSAVE / INPUT# / SOUND / PLAY / RND / delay loops / CHAIN), mapped onto the engine
//                      API of BUILD_PLAN.md §2, plus the dev jumps (?screen=PT-xx) with fixture states.
//
// Engine: game/engine/README.md (build-engine milestone 1, 8845183): E = { fb, display, gfx, text, sprites, atlas,
// input, screen }. Milestone 2 (audio, state, data, timer, chain, ?screen=) is not built yet: `m2()` below supplies
// local stand-ins and uses E.audio / E.state / E.files / E.chain as soon as the engine provides them (TODO(m2)).

import { flow } from './starport/flow.js';
import { str$, val as bval, cint } from '../engine/basic.js';
import { Files } from '../engine/files.js';

export const screens = ['PT-00', 'PT-01', 'PT-01m', 'PT-02', 'PT-03', 'PT-04', 'PT-05', 'PT-06', 'PT-07', 'PT-08',
  'PT-09', 'PT-09w', 'PT-09a', 'PT-09b', 'PT-10', 'PT-11', 'PT-12', 'PT-13', 'PT-14', 'PT-15'];

// ---------------------------------------------------------------- BASIC value helpers (imported by flow.js)
// CINT = the engine's (runtime A915: round half away from zero, overflow error; qa fix, decode/brun30/CIRCLE.md s.2)
export { cint };
export const fr = Math.fround;                       // single-precision store (all ! variables are singles)
export const ix = (x) => (Number.isInteger(x) ? x : cint(x));   // array subscript (implicit CINT)
export const B = (c) => (c ? -1 : 0);                // relational result: true = -1
export const AND = (a, b) => cint(a) & cint(b);       // logical operators are bitwise on integers
export const OR = (a, b) => cint(a) | cint(b);
export const NOT = (a) => ~cint(a);
export const MOD = (a, b) => cint(a) % cint(b);
export const IDIV = (a, b) => Math.trunc(cint(a) / cint(b));
export const ASC = (s) => { if (!s.length) throw new Error('ASC("") = Illegal function call'); return s.charCodeAt(0); };
export const LEFT = (s, n) => s.substr(0, Math.max(0, cint(n)));
export const RIGHT = (s, n) => (cint(n) <= 0 ? '' : s.substr(Math.max(0, s.length - cint(n))));
export const MID = (s, p, n) => (n === undefined ? s.substr(cint(p) - 1) : s.substr(cint(p) - 1, Math.max(0, cint(n))));
export const STRING = (n, c) => (typeof c === 'number' ? String.fromCharCode(c) : c[0]).repeat(Math.max(0, cint(n)));
export const VAL = (s) => bval(s || '');
export const STR = (x) => str$(x);                   // STR$ (engine basic.js: 7 significant digits, sign column)

// DATA statements of STARPORT (decode/data/MODULE_CONSTANTS.md / tools/_STARPORT.json): line 429 = WeaponClass%(1..11)
// (READ at 01A2); lines 2136-2137 = RuleWord$(0..49) (READ at 0820). The shipped rule-book words are placeholders
// "a..a" of the right lengths (the copy-protection check at 9BE9-9C5C compares length and letters by distance).
const DATA = [16, 19, 23, 26, 27, 31, 34, 41, 47, 49, 54,
  ...('aaaa,aaaaaaa,aa,aaaa,aa,aaaa,aaaaaaa,aaaaa,aa,aaa,aaaaaa,aaa,aaaaa,aaaaaaa,aaa,aa,aa,aaa,aaa,aaaa,aaa,aaaaaaaaa,' +
      'aaa,aaaaaaaaa,aaaaaa,aaa,aaaaaaa,aaaaaaa,aaa,aaaaaaaa,aaaaaa,aaa,aaaa,aaaa,aa,aaaa,aaa,aaaa,aaaaa,aa,aa,aaaaaaa,' +
      'aaaaaa,aaaa,aaaaaaaa,aaaaaaa,aaaaaaaa,aaaa,aaaaaaaa,aa').split(',')];

// COMMON string arrays used by STARPORT (CROSSREF.md §2.4; DS 0x4288..0x488C)
const CSTR = ['CrewName', 'Rank', 'Skill', 'ShipClassName', 'ShipSize', 'ShieldName', 'DefHwName', 'MissileKillerName',
  'GunName', 'WeaponName', 'HandWeaponName', 'SightingName', 'ArmorSuitName', 'MiscItemName', 'ItemName', 'FindName',
  'ShipType', 'EquipName', 'AttrName', 'ShipName'];

// BLOAD targets -> atlas entries (decode/data/sprites_index.tsv; atlas keyed by file stem + array index)
//   &H4F9E SHIPPICS.BAS arrays 0..3 = ShipPic0..3 (24x24); &H4926 SPPIC-n.BAS array 0 = PortPic (80x80);
//   &H65AE FIRE.BAS array 0 = Flame, 1..14 = Medal1..14; &H40F4 LOGO array 0 = Logo (BLOADed by STARTUP 0602 into
//   the COMMON area, so STARPORT finds it there without loading it).
// TODO(acceptance): the medal names follow STARPORT_names.json (Medal1..14 at the FIRE.BAS offsets 29..15117).

// Delay loops (SUB_1E4A: FOR L! = 1 TO Delay!*1.2: NEXT) ran at CPU speed. StdDelay! (G!(86)) is STARTUP's count of
// calibration-loop iterations per TIMER second; the empty FOR loop is cheaper than that loop. Seconds per iteration =
// LOOP_FACTOR / StdDelay!. TODO(acceptance): measure SUB_20B6 (5 x SUB_1E4A) in DOSBox and set LOOP_FACTOR.
const LOOP_FACTOR = 0.25;
const TICK = 1 / 18.2;                               // SOUND duration unit (clock ticks)

// G!() indices of named COMMON scalars used by the fixtures (DS address - 0x1850) / 4, STARPORT_names.json
const GI = { CreditsHi: 78, CreditsLo: 79, StdDelay: 86, Delay: 88, UseEGA: 89, SoundOff: 93, ChainArg: 2214,
  Years: 2202, Days: 2204, PayYear: 2207, PayDay: 2209, VisitYear: 2210, VisitDay: 2212, Fuel: 2200, MaxFuel: 52,
  ShipIdx1: 43, Armor: 55, BaseWt: 45, MaxWt: 46, BaseMove: 44, CurMove: 82, Defence: 51, ArmorDiv: 53,
  KillPtr: 311, KillStartPort: 314, KillStartMission: 312, SaveLock: 2265 };

// ================================================================ milestone-2 stand-ins (TODO(m2))
// Used only while the engine lacks them; each prefers the engine object when it exists.
function m2(E, opts) {
  const files = opts.filesBase ? new Files({ base: opts.filesBase }) : (E.files ?? new Files());
  const t0 = performance.now() / 1000 - (Date.now() / 1000 - new Date().setHours(0, 0, 0, 0) / 1000);
  const timer = E.timer ?? {
    now: () => performance.now() / 1000 - t0,                                  // TIMER = seconds since midnight
    frame: () => new Promise((r) => setTimeout(r, 16)),
  };
  const strs = {};
  const state = E.state ?? {
    G: new Float32Array(2601),
    str: (n) => (strs[n] ??= new Array(256).fill('')),
    async save(name) { files.bsave(name, mbfBody(this.G), 0x0B73, 0x1850); },
    async load(name) { const { body } = await files.bload(name); this.G.set(fromMbf(body, 2601)); },
  };
  const audio = E.audio ?? { sound() {}, async play() {}, beep() {} };          // silent until engine audio exists
  return { files, timer, state, audio };
}
// MBF single (Microsoft Binary Format, the QB 3.00 float layout of CHARINFO.BAS / INFO.BAS) <-> IEEE
export function fromMbf(body, n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const b = body.subarray(4 * i, 4 * i + 4);
    if (b.length < 4 || b[3] === 0) { out[i] = 0; continue; }
    const sign = b[2] & 0x80 ? -1 : 1;
    const mant = ((b[2] & 0x7f) | 0x80) * 65536 + b[1] * 256 + b[0];       // 24-bit with the hidden 1
    out[i] = sign * mant * Math.pow(2, b[3] - 128 - 24);
  }
  return out;
}
function mbfBody(G) {
  const out = new Uint8Array(4 * G.length);
  G.forEach((v, i) => {
    if (v === 0) return;
    let e = Math.floor(Math.log2(Math.abs(v))) + 1, m = Math.round(Math.abs(v) / Math.pow(2, e) * 16777216);
    if (m >= 16777216) { m /= 2; e++; }
    out[4 * i] = m & 255; out[4 * i + 1] = (m >> 8) & 255; out[4 * i + 2] = ((m >> 16) & 0x7f) | (v < 0 ? 0x80 : 0);
    out[4 * i + 3] = e + 128;
  });
  return out;
}

// ================================================================ runtime object passed to flow.js
class Runtime {
  constructor(E, opts) {
    this.E = E;
    Object.assign(this, m2(E, opts));               // files, timer, state, audio
    this.G = this.state.G;
    const def = (k) => (k.endsWith('_s') ? '' : 0);
    this.V = new Proxy({}, { get: (o, k) => (k in o ? o[k] : def(String(k))) });              // module scalars, zero-init
    this.A = new Proxy({}, { get: (o, k) => (o[k] ??= new Array(1024).fill(def(String(k)))) }); // module arrays
    const S = {};
    // COMMON string arrays; an element never assigned reads as "" (BASIC zero-init)
    for (const n of CSTR) { const a = this.state.str(n + '$'); S[n] = new Proxy(a, { get: (o, k) => o[k] ?? (typeof k === 'string' && /^\d+$/.test(k) ? '' : o[k]) }); }
    this.S = S;
    this.INFO = new Float32Array(1262);              // INFO.BAS, filled by the BLOAD at 020F
    this.buf = { Logo: { bank: 'LOGO.BAS', index: 0 } }; // PUT/GET arrays by name (Logo: STARTUP 0602 BLOAD "LOGO")
    this.idle = false; this.spin = 0;
    this.dataPtr = 0;
    this.rndSeed = 0x50000;                          // QuickBASIC default seed (RANDOMIZE TIMER at 107A reseeds)
    this.file = null;                                // open #1
    this.script = [];                                // dev fixture key script (consumed before the keyboard)
    this.devJump = 0;
    this.devScreen = null; this.idleSince = null;   // dev jump id, start of the current empty-INKEY$ stretch (devIdle)
  }

  // ---- scheduling
  async yieldFrame() { this.idle = false; this.spin = 0; await this.timer.frame(); }
  async wait(sec) { const t0 = this.timer.now(); while (this.timer.now() - t0 < sec) await this.timer.frame(); }
  TIMER() { this.idle = true; return this.timer.now(); }                   // TIMER (busy-wait loops at AC8C/ACAA)
  inkey() {                                                                   // INKEY$ (never blocks)
    if (this.script.length) return this.script.shift();
    const k = this.E.input.inkey();
    if (k === '') { this.idle = true; this.devIdle(); } else this.idleSince = null;
    return k;
  }
  // dev jumps only: the screen is "ready" for the shooter (acceptance/ref/scripts/shoot_all.mjs) once the key script is
  // used up and the program has polled INKEY$ empty for 1.5 s of program time, i.e. it waits at its next prompt
  devIdle() {
    if (!this.devScreen || this.script.length || typeof window === 'undefined') return;
    const t = this.timer.now();
    if (this.idleSince == null) this.idleSince = t;
    if (t - this.idleSince >= 1.5) window.__devReady = true;
  }
  async delayLoop(from, to) {                                                 // empty FOR loop = CPU-speed delay
    const n = Math.max(0, Math.floor(to) - from + 1);
    if (this.timer.delayLoop) { this.timer.stdDelay = this.G[GI.StdDelay] || 188; await this.timer.delayLoop(n); }
    else await this.wait(n * LOOP_FACTOR / (this.G[GI.StdDelay] || 188));
  }

  // ---- RND / RANDOMIZE (QuickBASIC 24-bit LCG) / READ
  rnd() { this.rndSeed = (this.rndSeed * 0x43FD43FD + 0xC39EC3) % 0x1000000; return this.rndSeed / 0x1000000; }
  randomize(t) {
    if (this.E.devSeed !== undefined) t = this.E.devSeed;   // dev jumps only: a fixed RANDOMIZE value instead of TIMER (reproducible screenshots)
    this.rndSeed = (Math.floor(t * 100) * 0x10001) % 0x1000000;
  }
  read(isStr) {
    const v = DATA[this.dataPtr++];
    if (v === undefined) throw new Error('Out of DATA');
    return isStr ? String(v) : v;
  }

  // ---- screen / text
  screen(m) { this.E.screen(m); }
  palette(a, c) { this.E.fb.palette(a, c); }
  cls() { this.E.text.cls(); }
  keyOff() { /* KEY OFF: the engine never shows the soft-key line; row 25 is reachable */ }
  locate(r, c /* , cursor, start, stop: 2537 shows the cursor in the line editor - not drawn */) { this.E.text.locate(r, c); }
  pos() { return this.E.text.col; }                                           // POS(0)
  csrlin() { return this.E.text.row; }                                        // CSRLIN
  print(v) { this.E.text.print(v, ';'); }                                     // one PRINT item followed by ';'
  printZone() { this.E.text.print('', ','); }
  printEnd(semi) { if (!semi) this.E.text.print(''); }                        // newline unless the PRINT ends in ';'
  printUsing(fmt, v, semi) { this.E.text.print(using(fmt, v), ';'); this.printEnd(semi); }

  // ---- graphics
  line(x1, y1, x2, y2, c, box) { this.E.gfx.line(x1, y1, x2, y2, c === undefined ? -1 : c, box); }
  pset(x, y) { this.E.gfx.pset(x, y); }
  preset(x, y) { this.E.gfx.preset(x, y); }
  put(x, y, name, verb) {
    const b = this.buf[name];
    if (!b) throw new Error(`PUT of an unloaded array ${name}`);
    this.E.sprites.put(x, y, b, verb);
  }
  get(x1, y1, x2, y2, name) { this.buf[name] = this.E.sprites.get(x1, y1, x2, y2); }

  // ---- files
  async bload(file, addr) {
    const name = file.replace(/^[AB]:/i, '').toUpperCase();
    const bank = /\.[A-Z]{3}$/.test(name) ? name : name + '.BAS';
    switch (addr) {
      case 0x4F9E: for (let i = 0; i < 4; i++) this.buf['ShipPic' + i] = { bank: 'SHIPPICS.BAS', index: i }; return;
      case 0x4926: this.buf.PortPic = { bank, index: 0 }; return;             // SPPIC-1..3 (EARTH/SOLONOR/LUNA)
      case 0x65AE: this.buf.Flame = { bank: 'FIRE.BAS', index: 0 };
        for (let i = 1; i <= 14; i++) this.buf['Medal' + i] = { bank: 'FIRE.BAS', index: i }; return;
      case 0x40F4: this.buf.Logo = { bank: 'LOGO.BAS', index: 0 }; return;
      case 0x51F6:                                                              // INFO.BAS: 1262 MBF singles
        try { const { body } = await this.files.bload(name); this.INFO.set(fromMbf(body, 1262)); }
        catch (e) { console.warn(`STARPORT: ${name} not available (${e.message}); prices/stats read as 0`); }
        return;
      case 0x1850: await this.state.load('CHARINFO.BAS'); return;             // only with DebugLoad! (never set)
      default: throw new Error(`BLOAD ${file} at unknown address ${addr.toString(16)}`);
    }
  }
  async bsave(file, addr, len) {                                              // 9CF3 BSAVE CHARINFO.BAS, &H1850, 10404
    if (addr !== 0x1850 || len !== 10404) throw new Error('unexpected BSAVE');
    await this.state.save('CHARINFO.BAS');
  }
  async open(file, mode) {
    const name = file.replace(/^[AB]:/i, '').toUpperCase();
    if (mode === 'INPUT') this.file = { mode, name, text: await this.files.readText(name), pos: 0 };
    else this.file = { mode, name, out: '' };
  }
  async close() {
    const f = this.file; this.file = null;
    if (f && f.mode === 'OUTPUT') this.files.writeText(f.name, f.out + '\x1a');   // CLOSE appends Ctrl-Z
  }
  fprint(v) { this.file.out += typeof v === 'number' ? STR(v) + ' ' : v; }
  fprintZone() { this.file.out += ' '.repeat(14 - (this.file.out.length % 14)); }
  fprintEnd(semi) { if (!semi) this.file.out += '\r\n'; }
  // INPUT #1 field (BASIC rules): skip blanks/line ends; quoted string to the closing quote; unquoted string to ','
  // or end of line; number to blank, ',' or end of line; one separating ',' is consumed.
  async finput(isStr) {
    const f = this.file, t = f.text;
    while (f.pos < t.length && ' \r\n\t'.includes(t[f.pos])) f.pos++;
    if (f.pos >= t.length || t[f.pos] === '\x1a') throw new Error(`Input past end (${f.name})`);
    let v;
    if (t[f.pos] === '"') {
      const e = t.indexOf('"', f.pos + 1);
      v = t.slice(f.pos + 1, e < 0 ? t.length : e); f.pos = e < 0 ? t.length : e + 1;
    } else {
      const stop = isStr ? /[,\r\n\x1a]/ : /[ ,\r\n\x1a]/;
      let e = f.pos; while (e < t.length && !stop.test(t[e])) e++;
      v = t.slice(f.pos, e); f.pos = e;
      if (isStr) v = v.trimEnd();
    }
    while (f.pos < t.length && t[f.pos] === ' ') f.pos++;
    if (t[f.pos] === ',') f.pos++;
    return isStr ? v : VAL(v);
  }
  async inputNum(prompt) {                     // INPUT "..."; v  (only in the unreachable mission chooser 7805)
    const s = await this.E.input.lineInput(this.E.text, prompt, 10);
    return VAL(s);
  }

  // ---- sound (PLAY "MF" at 004C = music foreground: SOUND/PLAY/BEEP hold the program for their duration)
  async sound(freq, ticks) { const p = this.audio.sound(freq, ticks); if (p?.then) await p; else if (ticks > 0) await this.wait(ticks * TICK); }
  async play(s) { if (s !== 'MF') await this.audio.play(s); }                // TODO(m2): foreground PLAY waits for the tune
  async beep() { const p = this.audio.beep(); if (p?.then) await p; else await this.wait(0.25); }                 // BEEP = 800 Hz, 1/4 s

  // ---- program end
  chain(file) {                                                               // 9F3F CHAIN Drive$ + "SPACE.STR"
    // .STR = the floppy swap stub; the reproduction is the hard-disk configuration (BUILD_PLAN §2 chain.js), so the
    // stub's target module is entered directly with G!() intact.
    const mod = file.replace(/^[AB]:/i, '').replace(/\.(STR|EXE)$/i, '').toUpperCase();
    if (this.E.chain) return this.E.chain(mod);                               // TODO(m2)
    this.E.text.locate(25, 1); this.E.text.print(`[CHAIN ${mod}: engine chain() not built yet]`, ';');
    return { chain: mod };
  }
  end() { return this.E.end ? this.E.end() : { end: true }; }                // 9D99 END (quit after saving)  TODO(m2)
}

// PRINT USING for the formats STARPORT uses: "#", "##", "###", "#######", "#.#", "+##" (leading + = sign column
// floats in front of the digits). Overflow prints "%" + the number.
export function using(fmt, v) {
  v = fr(v);
  const plus = fmt.startsWith('+');
  const body = plus ? fmt.slice(1) : fmt;
  const dot = body.indexOf('.');
  const dec = dot < 0 ? 0 : body.length - dot - 1;
  let s = Math.abs(v).toFixed(dec);
  const sign = v < 0 && parseFloat(s) !== 0 ? '-' : (plus ? '+' : '');
  s = sign + s;
  return s.length > fmt.length ? '%' + s : s.padStart(fmt.length, ' ');
}

// ================================================================ entry
// Module contract (game/engine/README.md): default async function (E, opts). opts.screen = dev jump id
// (BUILD_PLAN §4 `?screen=<id>`): fixture G!() + key script. opts.filesBase = where the original files are served
// (dev only, until the engine ships assets/files/).
export default async function starport(E, opts = {}) {
  const rt = new Runtime(E, opts);
  if (typeof window !== 'undefined') window.SP = rt;                       // dev console access
  if (opts.screen) await devFixture(rt, opts.screen);
  return flow(rt);
}
export const run = starport;

// ---------------------------------------------------------------- dev fixtures
// A playable state: shipped new-game values (CHARINFO.BAS, DATA_FILES.md) + 3 crew + a ship. Crew record fields per
// STARPORT.bas.md "G!() layout" (1300 + 100m + f).
function baseFixture(rt) {
  const { G, S } = rt;
  G.fill(0);
  G[GI.CreditsHi] = 3; G[GI.CreditsLo] = 5000; G[83] = 27; G[GI.StdDelay] = 188; G[GI.Delay] = 188; G[GI.UseEGA] = 1;
  G[GI.ChainArg] = 2; G[2216] = 28; G[2217] = 2; G[2218] = 7; G[2219] = 7; G[2220] = 6; G[2221] = 6;
  G[GI.Years] = 72; G[GI.Days] = 100; G[GI.VisitYear] = 72; G[GI.VisitDay] = 100; G[GI.PayYear] = 72; G[GI.PayDay] = 100;
  const crew = [
    // name, attrs 0..6, rank, class (0 Marine 1 Pilot 2 Soldier 3 Esper), age years
    ['Jason', [55, 61, 48, 62, 51, 20, 45], 4, 1, 27],
    ['Riker', [64, 50, 57, 44, 60, 12, 52], 3, 0, 31],
    ['Nadia', [47, 58, 66, 59, 49, 31, 40], 2, 2, 24],
  ];
  crew.forEach(([name, at, rank, cls, age], k) => {
    const m = k + 1, b = 1300 + 100 * m;
    at.forEach((a, f) => { G[b + f] = a; });
    G[b + 16] = Math.floor((at[0] + at[4]) * 0.25 + 0.125); G[b + 15] = G[b + 16];        // SUB_26A6
    G[b + 10] = Math.floor((at[2] * 2 + at[3]) / 6 - 25); G[b + 11] = Math.floor(at[1] * 0.5 - 25);
    G[b + 13] = Math.floor(at[0] * 0.25 + 8); G[b + 12] = Math.floor((at[0] + at[1]) / 20 + 15);
    G[b + 8] = G[b + 12]; G[b + 9] = 1; G[b + 17 + cls] = 3; G[b + 29] = age * 365 + 40; G[b + 31] = 1;
    G[b + 34] = rank; G[b + 35] = cls; G[b + 36] = age;
    S.CrewName[m] = name;
  });
  // ship: index 0 (G!(43) = 1), named; values as SUB_29F8 would set them from ShipTable (approximate for the fixture)
  G[GI.ShipIdx1] = 1; S.ShipName[0] = 'VALIANT';
  G[GI.BaseWt] = 200; G[GI.MaxWt] = 300; G[GI.BaseMove] = 8; G[GI.Armor] = 100; G[GI.ArmorDiv] = 15;
  G[GI.MaxFuel] = 400; G[GI.Fuel] = 150; G[GI.CurMove] = 6;
  for (let i = 0; i <= 6; i++) G[i] = 1;
  G[110] = 1;                                                                 // mission 1 active
}

// dev jump table: [devJump label | 0 (run the arrival path), key script, extra fixture]
const MENU = 0x210D;                                                          // L_210D main menu (PT-02)
const DEV = {
  'PT-00': [0, [], null],
  'PT-01': [0, [], (rt) => {                                                  // one kill since the last port + completed mission
    const G = rt.G; G[GI.KillStartPort] = 1; G[GI.KillPtr] = 0; G[210] = 3; G[260] = 120; G[110] = 2; G[GI.Days] = 130; }],
  // special bonus 109 -> medal ceremony SUB_A932; ENTER answers the bonus text (ACCEPTANCE.md: shot after ENTER)
  'PT-01m': [0, ['\r'], (rt) => { rt.G[109] = 1; }],
  'PT-02': [MENU, [], null],
  'PT-03': [MENU, ['A'], null], 'PT-04': [MENU, ['B'], null], 'PT-05': [MENU, ['C'], null],
  'PT-06': [MENU, ['D'], null], 'PT-07': [MENU, ['E'], null],
  // refuel bar end state: hold at the 20B6 delay after the bar's last step (2491 SOUND I*10, I = 290)
  'PT-08': [MENU, ['F'], (rt) => holdAfter(rt, { sound: 2900 })],
  'PT-09': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = true; }],
  'PT-10': [MENU, ['H'], null], 'PT-11': [MENU, ['I'], null],
  // rule-book answer (F-5, 09C1B ABS): the shooter types it (SUB_24F4 stops at the word length) - PT-09w `zzzzzzzzz` is
  // Wrong! (|z-a| = 25), PT-09a `aaaaaaaaa` matches the shipped "a.." placeholder words
  'PT-09w': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = true; }],
  'PT-09a': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = true; }],
  // Default save also clears a lock left by an earlier protected session.
  'PT-09b': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = false; rt.G[GI.SaveLock] = 1; }],
  'PT-12': [MENU, ['K'], (rt) => { rt.S.ShipName[0] = ''; }],               // Christen needs an unnamed ship
  // "Pilot or ship not ready" (no fuel): hold at its 20B6 delay (the menu returns after it)
  'PT-13': [MENU, ['L'], (rt) => { rt.G[GI.Fuel] = 0; holdAfter(rt, { text: 'Pilot or ship not ready' }); }],
  'PT-14': [MENU, ['M'], null], 'PT-15': [MENU, ['T'], null],
};
const DEV_SEED = 1;
// hold point (dev only): the run freezes at the first delay loop after SOUND `sound` / PRINT `text` and tells the
// shooter it is ready
function holdAfter(rt, { sound: freq, text }) {
  const sound = rt.sound.bind(rt), print = rt.print.bind(rt), delay = rt.delayLoop.bind(rt);
  let armed = false;
  if (freq !== undefined) rt.sound = (f, d) => { if (f === freq) armed = true; return sound(f, d); };
  if (text !== undefined) rt.print = (v) => { if (v === text) armed = true; return print(v); };
  rt.delayLoop = (a, b) => {
    if (!armed) return delay(a, b);
    if (typeof window !== 'undefined') window.__devReady = true;
    return new Promise(() => {});
  };
}
// NAME -> COMMON string arrays in file order, as STARTUP 00E0-0594 loads them (CROSSREF.md §2.4)
const NAME_ARRAYS = [['Rank', 1, 13], ['Skill', 0, 15], ['ShipClassName', 0, 8], ['ShipSize', 0, 3], ['ShieldName', 0, 4],
  ['DefHwName', 0, 4], ['MissileKillerName', 0, 2], ['GunName', 0, 24], ['WeaponName', 0, 53], ['HandWeaponName', 0, 5],
  ['SightingName', 0, 3], ['ArmorSuitName', 0, 15], ['MiscItemName', 0, 10], ['ItemName', 0, 99], ['FindName', 0, 49],
  ['ShipType', 0, 22], ['EquipName', 0, 22], ['AttrName', 0, 6]];
async function devFixture(rt, id) {
  const d = DEV[Object.keys(DEV).find((k) => k.toUpperCase() === String(id).toUpperCase())];   // index.html upper-cases ids
  if (!d) throw new Error(`no STARPORT dev screen ${id}`);
  try {                                        // the strings STARTUP would have left in COMMON
    await rt.open('NAME', 'INPUT');
    for (const [n, a, b] of NAME_ARRAYS) for (let i = a; i <= b; i++) rt.S[n][i] = await rt.finput(true);
    await rt.close();
  } catch (e) { console.warn(`STARPORT dev: NAME not available (${e.message})`); }
  baseFixture(rt);
  rt.devJump = d[0];
  rt.script = d[1].slice();
  rt.devScreen = id;
  // pinned RANDOMIZE value (107A RANDOMIZE TIMER: arrival events, rule-book word); ?seed=n overrides (dev only)
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('seed') : null;
  rt.E.devSeed = qs !== null ? Number(qs) : DEV_SEED;
  if (d[2]) d[2](rt);
}
