import { flow } from './starport/flow.js';
import { str$, val as bval, cint } from '../engine/basic.js';
import { Files } from '../engine/files.js';

export const screens = ['PT-00', 'PT-01', 'PT-01m', 'PT-02', 'PT-03', 'PT-04', 'PT-05', 'PT-06', 'PT-07', 'PT-08',
  'PT-09', 'PT-09w', 'PT-09a', 'PT-09b', 'PT-10', 'PT-11', 'PT-12', 'PT-13', 'PT-14', 'PT-15'];

export { cint };
export const fr = Math.fround;
export const ix = (x) => (Number.isInteger(x) ? x : cint(x));
export const B = (c) => (c ? -1 : 0);
export const AND = (a, b) => cint(a) & cint(b);
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
export const STR = (x) => str$(x);

const DATA = [16, 19, 23, 26, 27, 31, 34, 41, 47, 49, 54,
  ...('aaaa,aaaaaaa,aa,aaaa,aa,aaaa,aaaaaaa,aaaaa,aa,aaa,aaaaaa,aaa,aaaaa,aaaaaaa,aaa,aa,aa,aaa,aaa,aaaa,aaa,aaaaaaaaa,' +
      'aaa,aaaaaaaaa,aaaaaa,aaa,aaaaaaa,aaaaaaa,aaa,aaaaaaaa,aaaaaa,aaa,aaaa,aaaa,aa,aaaa,aaa,aaaa,aaaaa,aa,aa,aaaaaaa,' +
      'aaaaaa,aaaa,aaaaaaaa,aaaaaaa,aaaaaaaa,aaaa,aaaaaaaa,aa').split(',')];

const CSTR = ['CrewName', 'Rank', 'Skill', 'ShipClassName', 'ShipSize', 'ShieldName', 'DefHwName', 'MissileKillerName',
  'GunName', 'WeaponName', 'HandWeaponName', 'SightingName', 'ArmorSuitName', 'MiscItemName', 'ItemName', 'FindName',
  'ShipType', 'EquipName', 'AttrName', 'ShipName'];


const LOOP_FACTOR = 0.25;
const TICK = 1 / 18.2;

const GI = { CreditsHi: 78, CreditsLo: 79, StdDelay: 86, Delay: 88, UseEGA: 89, SoundOff: 93, ChainArg: 2214,
  Years: 2202, Days: 2204, PayYear: 2207, PayDay: 2209, VisitYear: 2210, VisitDay: 2212, Fuel: 2200, MaxFuel: 52,
  ShipIdx1: 43, Armor: 55, BaseWt: 45, MaxWt: 46, BaseMove: 44, CurMove: 82, Defence: 51, ArmorDiv: 53,
  KillPtr: 311, KillStartPort: 314, KillStartMission: 312, SaveLock: 2265 };

function m2(E, opts) {
  const files = opts.filesBase ? new Files({ base: opts.filesBase }) : (E.files ?? new Files());
  const t0 = performance.now() / 1000 - (Date.now() / 1000 - new Date().setHours(0, 0, 0, 0) / 1000);
  const timer = E.timer ?? {
    now: () => performance.now() / 1000 - t0,
    frame: () => new Promise((r) => setTimeout(r, 16)),
  };
  const strs = {};
  const state = E.state ?? {
    G: new Float32Array(2601),
    str: (n) => (strs[n] ??= new Array(256).fill('')),
    async save(name) { files.bsave(name, mbfBody(this.G), 0x0B73, 0x1850); },
    async load(name) { const { body } = await files.bload(name); this.G.set(fromMbf(body, 2601)); },
  };
  const audio = E.audio ?? { sound() {}, async play() {}, beep() {} };
  return { files, timer, state, audio };
}
export function fromMbf(body, n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const b = body.subarray(4 * i, 4 * i + 4);
    if (b.length < 4 || b[3] === 0) { out[i] = 0; continue; }
    const sign = b[2] & 0x80 ? -1 : 1;
    const mant = ((b[2] & 0x7f) | 0x80) * 65536 + b[1] * 256 + b[0];
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

class Runtime {
  constructor(E, opts) {
    this.E = E;
    Object.assign(this, m2(E, opts));
    this.G = this.state.G;
    const def = (k) => (k.endsWith('_s') ? '' : 0);
    this.V = new Proxy({}, { get: (o, k) => (k in o ? o[k] : def(String(k))) });
    this.A = new Proxy({}, { get: (o, k) => (o[k] ??= new Array(1024).fill(def(String(k)))) });
    const S = {};
    for (const n of CSTR) { const a = this.state.str(n + '$'); S[n] = new Proxy(a, { get: (o, k) => o[k] ?? (typeof k === 'string' && /^\d+$/.test(k) ? '' : o[k]) }); }
    this.S = S;
    this.INFO = new Float32Array(1262);
    this.buf = { Logo: { bank: 'LOGO.BAS', index: 0 } };
    this.idle = false; this.spin = 0;
    this.dataPtr = 0;
    this.rndSeed = 0x50000;
    this.file = null;
    this.script = [];
    this.devJump = 0;
    this.devScreen = null; this.idleSince = null;
  }

  async yieldFrame() { this.idle = false; this.spin = 0; await this.timer.frame(); }
  async wait(sec) { const t0 = this.timer.now(); while (this.timer.now() - t0 < sec) await this.timer.frame(); }
  TIMER() { this.idle = true; return this.timer.now(); }
  inkey() {
    if (this.script.length) return this.script.shift();
    const k = this.E.input.inkey();
    if (k === '') { this.idle = true; this.devIdle(); } else this.idleSince = null;
    return k;
  }
  devIdle() {
    if (!this.devScreen || this.script.length || typeof window === 'undefined') return;
    const t = this.timer.now();
    if (this.idleSince == null) this.idleSince = t;
    if (t - this.idleSince >= 1.5) window.__devReady = true;
  }
  async delayLoop(from, to) {
    const n = Math.max(0, Math.floor(to) - from + 1);
    if (this.timer.delayLoop) { this.timer.stdDelay = this.G[GI.StdDelay] || 188; await this.timer.delayLoop(n); }
    else await this.wait(n * LOOP_FACTOR / (this.G[GI.StdDelay] || 188));
  }

  rnd() { this.rndSeed = (this.rndSeed * 0x43FD43FD + 0xC39EC3) % 0x1000000; return this.rndSeed / 0x1000000; }
  randomize(t) {
    if (this.E.devSeed !== undefined) t = this.E.devSeed;
    this.rndSeed = (Math.floor(t * 100) * 0x10001) % 0x1000000;
  }
  read(isStr) {
    const v = DATA[this.dataPtr++];
    if (v === undefined) throw new Error('Out of DATA');
    return isStr ? String(v) : v;
  }

  screen(m) { this.E.screen(m); }
  palette(a, c) { this.E.fb.palette(a, c); }
  cls() { this.E.text.cls(); }
  keyOff() {   }
  locate(r, c  ) { this.E.text.locate(r, c); }
  pos() { return this.E.text.col; }
  csrlin() { return this.E.text.row; }
  print(v) { this.E.text.print(v, ';'); }
  printZone() { this.E.text.print('', ','); }
  printEnd(semi) { if (!semi) this.E.text.print(''); }
  printUsing(fmt, v, semi) { this.E.text.print(using(fmt, v), ';'); this.printEnd(semi); }

  line(x1, y1, x2, y2, c, box) { this.E.gfx.line(x1, y1, x2, y2, c === undefined ? -1 : c, box); }
  pset(x, y) { this.E.gfx.pset(x, y); }
  preset(x, y) { this.E.gfx.preset(x, y); }
  put(x, y, name, verb) {
    const b = this.buf[name];
    if (!b) throw new Error(`PUT of an unloaded array ${name}`);
    this.E.sprites.put(x, y, b, verb);
  }
  get(x1, y1, x2, y2, name) { this.buf[name] = this.E.sprites.get(x1, y1, x2, y2); }

  async bload(file, addr) {
    const name = file.replace(/^[AB]:/i, '').toUpperCase();
    const bank = /\.[A-Z]{3}$/.test(name) ? name : name + '.BAS';
    switch (addr) {
      case 0x4F9E: for (let i = 0; i < 4; i++) this.buf['ShipPic' + i] = { bank: 'SHIPPICS.BAS', index: i }; return;
      case 0x4926: this.buf.PortPic = { bank, index: 0 }; return;
      case 0x65AE: this.buf.Flame = { bank: 'FIRE.BAS', index: 0 };
        for (let i = 1; i <= 14; i++) this.buf['Medal' + i] = { bank: 'FIRE.BAS', index: i }; return;
      case 0x40F4: this.buf.Logo = { bank: 'LOGO.BAS', index: 0 }; return;
      case 0x51F6:
        try { const { body } = await this.files.bload(name); this.INFO.set(fromMbf(body, 1262)); }
        catch (e) { console.warn(`STARPORT: ${name} not available (${e.message}); prices/stats read as 0`); }
        return;
      case 0x1850: await this.state.load('CHARINFO.BAS'); return;
      default: throw new Error(`BLOAD ${file} at unknown address ${addr.toString(16)}`);
    }
  }
  async bsave(file, addr, len) {
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
    if (f && f.mode === 'OUTPUT') this.files.writeText(f.name, f.out + '\x1a');
  }
  fprint(v) { this.file.out += typeof v === 'number' ? STR(v) + ' ' : v; }
  fprintZone() { this.file.out += ' '.repeat(14 - (this.file.out.length % 14)); }
  fprintEnd(semi) { if (!semi) this.file.out += '\r\n'; }
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
  async inputNum(prompt) {
    const s = await this.E.input.lineInput(this.E.text, prompt, 10);
    return VAL(s);
  }

  async sound(freq, ticks) { const p = this.audio.sound(freq, ticks); if (p?.then) await p; else if (ticks > 0) await this.wait(ticks * TICK); }
  async play(s) { if (s !== 'MF') await this.audio.play(s); }
  async beep() { const p = this.audio.beep(); if (p?.then) await p; else await this.wait(0.25); }

  chain(file) {
    const mod = file.replace(/^[AB]:/i, '').replace(/\.(STR|EXE)$/i, '').toUpperCase();
    if (this.E.chain) return this.E.chain(mod);
    this.E.text.locate(25, 1); this.E.text.print(`[CHAIN ${mod}: engine chain() not built yet]`, ';');
    return { chain: mod };
  }
  end() { return this.E.end ? this.E.end() : { end: true }; }
}

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

export default async function starport(E, opts = {}) {
  const rt = new Runtime(E, opts);
  if (typeof window !== 'undefined') window.SP = rt;
  if (opts.screen) await devFixture(rt, opts.screen);
  return flow(rt);
}
export const run = starport;

function baseFixture(rt) {
  const { G, S } = rt;
  G.fill(0);
  G[GI.CreditsHi] = 3; G[GI.CreditsLo] = 5000; G[83] = 27; G[GI.StdDelay] = 188; G[GI.Delay] = 188; G[GI.UseEGA] = 1;
  G[GI.ChainArg] = 2; G[2216] = 28; G[2217] = 2; G[2218] = 7; G[2219] = 7; G[2220] = 6; G[2221] = 6;
  G[GI.Years] = 72; G[GI.Days] = 100; G[GI.VisitYear] = 72; G[GI.VisitDay] = 100; G[GI.PayYear] = 72; G[GI.PayDay] = 100;
  const crew = [
    ['Jason', [55, 61, 48, 62, 51, 20, 45], 4, 1, 27],
    ['Riker', [64, 50, 57, 44, 60, 12, 52], 3, 0, 31],
    ['Nadia', [47, 58, 66, 59, 49, 31, 40], 2, 2, 24],
  ];
  crew.forEach(([name, at, rank, cls, age], k) => {
    const m = k + 1, b = 1300 + 100 * m;
    at.forEach((a, f) => { G[b + f] = a; });
    G[b + 16] = Math.floor((at[0] + at[4]) * 0.25 + 0.125); G[b + 15] = G[b + 16];
    G[b + 10] = Math.floor((at[2] * 2 + at[3]) / 6 - 25); G[b + 11] = Math.floor(at[1] * 0.5 - 25);
    G[b + 13] = Math.floor(at[0] * 0.25 + 8); G[b + 12] = Math.floor((at[0] + at[1]) / 20 + 15);
    G[b + 8] = G[b + 12]; G[b + 9] = 1; G[b + 17 + cls] = 3; G[b + 29] = age * 365 + 40; G[b + 31] = 1;
    G[b + 34] = rank; G[b + 35] = cls; G[b + 36] = age;
    S.CrewName[m] = name;
  });
  G[GI.ShipIdx1] = 1; S.ShipName[0] = 'VALIANT';
  G[GI.BaseWt] = 200; G[GI.MaxWt] = 300; G[GI.BaseMove] = 8; G[GI.Armor] = 100; G[GI.ArmorDiv] = 15;
  G[GI.MaxFuel] = 400; G[GI.Fuel] = 150; G[GI.CurMove] = 6;
  for (let i = 0; i <= 6; i++) G[i] = 1;
  G[110] = 1;
}

const MENU = 0x210D;
const DEV = {
  'PT-00': [0, [], null],
  'PT-01': [0, [], (rt) => {
    const G = rt.G; G[GI.KillStartPort] = 1; G[GI.KillPtr] = 0; G[210] = 3; G[260] = 120; G[110] = 2; G[GI.Days] = 130; }],
  'PT-01m': [0, ['\r'], (rt) => { rt.G[109] = 1; }],
  'PT-02': [MENU, [], null],
  'PT-03': [MENU, ['A'], null], 'PT-04': [MENU, ['B'], null], 'PT-05': [MENU, ['C'], null],
  'PT-06': [MENU, ['D'], null], 'PT-07': [MENU, ['E'], null],
  'PT-08': [MENU, ['F'], (rt) => holdAfter(rt, { sound: 2900 })],
  'PT-09': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = true; }],
  'PT-10': [MENU, ['H'], null], 'PT-11': [MENU, ['I'], null],
  'PT-09w': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = true; }],
  'PT-09a': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = true; }],
  'PT-09b': [MENU, ['G'], (rt) => { (rt.E.options ??= {}).protection = false; rt.G[GI.SaveLock] = 1; }],
  'PT-12': [MENU, ['K'], (rt) => { rt.S.ShipName[0] = ''; }],
  'PT-13': [MENU, ['L'], (rt) => { rt.G[GI.Fuel] = 0; holdAfter(rt, { text: 'Pilot or ship not ready' }); }],
  'PT-14': [MENU, ['M'], null], 'PT-15': [MENU, ['T'], null],
};
const DEV_SEED = 1;
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
const NAME_ARRAYS = [['Rank', 1, 13], ['Skill', 0, 15], ['ShipClassName', 0, 8], ['ShipSize', 0, 3], ['ShieldName', 0, 4],
  ['DefHwName', 0, 4], ['MissileKillerName', 0, 2], ['GunName', 0, 24], ['WeaponName', 0, 53], ['HandWeaponName', 0, 5],
  ['SightingName', 0, 3], ['ArmorSuitName', 0, 15], ['MiscItemName', 0, 10], ['ItemName', 0, 99], ['FindName', 0, 49],
  ['ShipType', 0, 22], ['EquipName', 0, 22], ['AttrName', 0, 6]];
async function devFixture(rt, id) {
  const d = DEV[Object.keys(DEV).find((k) => k.toUpperCase() === String(id).toUpperCase())];
  if (!d) throw new Error(`no STARPORT dev screen ${id}`);
  try {
    await rt.open('NAME', 'INPUT');
    for (const [n, a, b] of NAME_ARRAYS) for (let i = a; i <= b; i++) rt.S[n][i] = await rt.finput(true);
    await rt.close();
  } catch (e) { console.warn(`STARPORT dev: NAME not available (${e.message})`); }
  baseFixture(rt);
  rt.devJump = d[0];
  rt.script = d[1].slice();
  rt.devScreen = id;
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('seed') : null;
  rt.E.devSeed = qs !== null ? Number(qs) : DEV_SEED;
  if (d[2]) d[2](rt);
}
