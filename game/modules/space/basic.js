import { str$, cint as ecint, val as eval_, using } from '../../engine/basic.js';
import { floatToMbf } from '../../engine/state.js';
import { BANK_OFFSETS } from './banks.js';
import { mark, held } from './hold.js';

export const fr = Math.fround;
export const cint = (x) => ecint(x);
const B = (c) => (c ? -1 : 0);
const n32 = (a, b) => (typeof a === 'number' && typeof b === 'number');
export const eq = (a, b) => B(n32(a, b) ? fr(a) === fr(b) : a === b);
export const ne = (a, b) => B(n32(a, b) ? fr(a) !== fr(b) : a !== b);
export const lt = (a, b) => B(n32(a, b) ? fr(a) < fr(b) : a < b);
export const gt = (a, b) => B(n32(a, b) ? fr(a) > fr(b) : a > b);
export const le = (a, b) => B(n32(a, b) ? fr(a) <= fr(b) : a <= b);
export const ge = (a, b) => B(n32(a, b) ? fr(a) >= fr(b) : a >= b);
export const mod = (a, b) => cint(a) % cint(b);
export const idiv = (a, b) => Math.trunc(cint(a) / cint(b));
export const sgn = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
export const str = (x) => str$(x);
export const chr = (n) => String.fromCharCode(cint(n));
export const asc = (s) => { if (!s.length) throw new Error('Illegal function call (ASC "")'); return s.charCodeAt(0); };
export const len = (s) => s.length;
export const left = (s, n) => s.slice(0, Math.max(0, cint(n)));
export const right = (s, n) => (cint(n) <= 0 ? '' : s.slice(-cint(n)));
export const mid = (s, st, n) => (n === undefined ? s.slice(cint(st) - 1) : s.substr(cint(st) - 1, Math.max(0, cint(n))));
export const val = (s) => eval_(s);
export const stringS = (n, c) => (typeof c === 'number' ? String.fromCharCode(cint(c)) : c[0]).repeat(Math.max(0, cint(n)));
export const instr = (a, b, c) => (c === undefined ? a.indexOf(b) + 1 : (b.indexOf(c, cint(a) - 1) + 1));
export const spc = (n) => ' '.repeat(Math.max(0, cint(n)));

export const SEMI = Symbol(';'), COMMA = Symbol(',');

const PAUSE = { SPACE: 0x19D1, PLBATTLE: 0x2913 };
class Chain { constructor(target) { this.target = target; } }
class End { }

export class BasicRT {
  constructor(E, opts = {}) {
    this.E = E;
    this.G = E.state?.G ?? new Float32Array(2601);
    const strs = new Map();
    this.S = (n) => (E.state?.str ? E.state.str(n) : (strs.has(n) ? strs.get(n) : (strs.set(n, []), strs.get(n))));
    this.V = new Proxy({}, { get: (o, k) => (k in o ? o[k] : (String(k).endsWith('$') ? '' : 0)) });
    const arrays = new Map();
    this.A = (name) => {
      if (!arrays.has(name)) arrays.set(name, new Proxy([], { get: (o, k) => (k in o ? o[k] : (/^\d+$/.test(k) ? (name.endsWith('$') ? '' : 0) : o[k])) }));
      return arrays.get(name);
    };
    this.regions = E.memRegions ?? (E.memRegions = new Map());
    if (!this.regions.has(0x40F4)) this.regions.set(0x40F4, { base: 0x40F4, name: 'LOGO.BAS', bytes: null, len: 404 });
    this.M16 = (base, i) => this.mem16(base, i);
    this.W16 = (base, i, v) => this.wmem16(base, i, v);
    this.F = {};
    this.bufs = {};
    this.arrBanks = {};
    this.files = new Map();
    this.data = opts.data ?? [];
    this.dataPos = 0;
    this.seed = 5;
    this.lastRnd = 0;
    this.lastYield = 0;
    this.spins = 0;
    this.sub = [];
    const ex = this.exec;
    if (ex) this.exec = async (pc) => { this.sub.push(pc); try { return await ex.call(this, pc); } finally { this.sub.pop(); } };
  }

  async run(entry = 0x0040) {
    try { await this.exec(entry); }
    catch (e) {
      if (e instanceof Chain) return this.E.chain ? this.E.chain(e.target) : e.target;
      if (e instanceof End) return 'END';
      throw e;
    }
    return null;
  }
  nowMs() { return this.E.timer?.now ? this.E.timer.now() * 1000 : performance.now(); }
  async frame() { if (this.E.timer?.frame) return this.E.timer.frame(); return new Promise((r) => setTimeout(r, 16)); }
  chainTo(target) { return new Chain(target); }
  end() { return new End(); }
  untranslated(off, text) { throw new Error(`untranslated statement at ${off}: ${text}`); }
  async tick() {
    const t = this.nowMs();
    if (t - this.lastYield > 8 || ++this.spins > 5000) { this.lastYield = t; this.spins = 0; await this.frame(); }
  }
  forOk(v, lim, step) { return step >= 0 ? fr(v) <= fr(lim) : fr(v) >= fr(lim); }
  forCount(v, lim, step) { return step === 0 ? 0 : Math.max(0, Math.floor((lim - v) / step) + 1); }
  forEnd(v, lim, step) { return v + this.forCount(v, lim, step) * step; }
  async delayLoop(count) {
    const T = this.E.timer, p = PAUSE[this.E.currentModule];
    if (T?.delayLoop) {
      if (T.delaySeconds && (!p || this.sub.slice(-2).includes(p))) await held(this, T.delaySeconds(count) * 1000, () => T.delayLoop(count));
      else await T.delayLoop(count);
      this.lastYield = this.nowMs(); return;
    }
    const perSec = this.G[86] > 0 ? this.G[86] : 1000;
    const ms = (count / perSec) * 1000;
    const until = this.nowMs() + ms;
    while (this.nowMs() < until) await this.frame();
    this.lastYield = this.nowMs();
  }

  print(items) {
    const T = this.E.text; let cur = [], last = null;
    for (const it of items) {
      if (it === COMMA) { T.print(cur.length ? cur : '', ','); cur = []; last = ','; continue; }
      if (it === SEMI) { last = ';'; continue; }
      cur.push(it); last = null;
    }
    if (last === ';') { if (cur.length) T.print(cur, ';'); }
    else if (last !== ',') T.print(cur.length ? cur : '');
    mark(this, items);
  }
  printUsing(fmt, items, semi) { mark(this, [fmt]); this.E.text.printUsing(fmt, items.length === 1 ? items[0] : items, semi ? ';' : undefined); }
  locate(r, c, vis, start, stop) {
    this.E.text.locate(r == null ? undefined : cint(r), c == null ? undefined : cint(c));
    if (vis !== undefined) this.E.text.cursor?.(cint(vis) !== 0, start, stop);
  }
  csrlin() { return this.E.text.row; }
  cls() { this.E.text.cls(); }
  pos() { return this.E.text.col; }

  screen(m) { this.E.screen(m); }
  palette(a, c) { this.E.fb.palette(a, c); }
  line(x1, y1, x2, y2, c, box, style) { this.E.gfx.line(cint(x1), cint(y1), cint(x2), cint(y2), c, box, style); }
  circle(x, y, r, c, s, e, a) { this.E.gfx.circle(cint(x), cint(y), r, c, s, e, a); }
  paint(x, y, p, b) { this.E.gfx.paint(cint(x), cint(y), p, b); }
  pset(x, y, c) { this.E.gfx.pset(cint(x), cint(y), c); }
  preset(x, y, c) { this.E.gfx.preset(cint(x), cint(y), c); }
  get(x1, y1, x2, y2, name) { this.bufs[name] = this.E.sprites.get(cint(x1), cint(y1), cint(x2), cint(y2)); }
  put(x, y, name, addr, verb) {
    x = cint(x); y = cint(y);
    if (this.bufs[name]) return this.E.sprites.put(x, y, this.bufs[name], verb);
    if (this.arrBanks[name]) return this.E.sprites.put(x, y, { bank: this.arrBanks[name], index: 0 }, verb);
    const r = this.regionAt(addr);
    if (!r) throw new Error(`PUT ${name}: no BLOADed bank at DS 0x${addr.toString(16)}`);
    const offs = BANK_OFFSETS[r.name];
    const index = offs ? offs.indexOf(addr - r.base + 7) : -1;
    if (index < 0) throw new Error(`PUT ${name}: DS 0x${addr.toString(16)} is not an array start in ${r.name}`);
    this.E.sprites.put(x, y, { bank: r.name, index }, verb);
  }

  regionAt(addr) {
    let best = null;
    for (const r of this.regions.values()) if (addr >= r.base && addr < r.base + r.len) best = r;
    return best;
  }
  async bload(name, base) {
    const files = this.E.files ?? this.E.state?.files;
    const fname = dosName(name);
    if (fname === 'CHARINFO.BAS' && this.E.state?.load) { await this.E.state.load(); return; }
    let bytes = null;
    try { if (files?.bload) { const b = await files.bload(fname); bytes = b.body ?? b; } }
    catch (e) {
      if (!BANK_OFFSETS[fname]) throw e;
    }
    this.regions.delete(base);
    this.regions.set(base, { base, name: fname, bytes, len: bytes ? bytes.length : 0x10000 });
  }
  async bloadArr(name, arr) { this.arrBanks[arr] = dosName(name); }
  mem16(base, i) {
    const r = this.regionAt(base), o = base - r.base + 2 * i;
    if (!r.bytes) throw new Error(`memory read in ${r.name} before its bytes are loaded`);
    const v = r.bytes[o] | (r.bytes[o + 1] << 8);
    return v >= 0x8000 ? v - 0x10000 : v;
  }
  wmem16(base, i, v) {
    const r = this.regionAt(base), o = base - r.base + 2 * i, x = cint(v) & 0xffff;
    r.bytes[o] = x & 0xff; r.bytes[o + 1] = x >> 8;
  }

  async open(name, n) {
    const fname = String(name).toUpperCase().replace(/^[A-Z]:/, '').trim();
    if (this.E.data?.open) { this.files.set(n, await this.E.data.open(fname)); return; }
    const files = this.E.files ?? this.E.state?.files;
    this.files.set(n, { fields: parseInputFields(await files.readText(fname)), pos: 0 });
  }
  close(n) { this.files.delete(n); }
  inputField(n, isStr) {
    const f = this.files.get(n);
    if (!f) throw new Error('Bad file number');
    if (f.str) return isStr ? f.str() : f.num();
    if (f.pos >= f.fields.length) throw new Error('Input past end');
    const s = f.fields[f.pos++];
    return isStr ? s : val(s);
  }
  lineInput(n) {
    const f = this.files.get(n);
    if (!f) throw new Error('Bad file number');
    if (f.line) return f.line();
    return f.fields[f.pos++];
  }
  eof(n) { const f = this.files.get(cint(n)); if (!f) throw new Error('Bad file number'); return f.eof ? (f.eof() ? -1 : 0) : (f.pos >= f.fields.length ? -1 : 0); }
  read(isStr) {
    if (this.dataPos >= this.data.length) throw new Error('Out of DATA');
    const s = this.data[this.dataPos++];
    return isStr ? s : val(s);
  }

  inkey() { const k = this.E.input.inkey(); if (k) this.msgAt = 0; return k; }
  timerNow() { return this.E.timer?.now ? this.E.timer.now() : this.nowMs() / 1000; }
  async play(s) {
    if (this.E.audio?.play) { await this.E.audio.play(s); return; }
  }
  async sound(f, ticks) {
    if (this.E.audio?.sound) { await this.E.audio.sound(f, ticks); this.lastYield = this.nowMs(); return; }
    if (ticks > 0) await this.waitMs((ticks / 18.2) * 1000);
  }
  async beep() {
    if (this.E.audio?.beep) { await this.E.audio.beep(); return; }
    await this.waitMs(250);
  }
  async waitMs(ms) {
    const until = this.nowMs() + ms;
    while (this.nowMs() < until) await this.frame();
    this.lastYield = this.nowMs();
  }

  rnd(x) {
    if (x !== undefined) {
      if (fr(x) === 0) return this.lastRnd;
      if (x < 0) {
        const b = new Uint8Array(4); floatToMbf(fr(x), b);
        this.seed = (((b[2] << 16) | (b[1] << 8) | b[0]) + b[3]) & 0xffffff;
      }
    }
    this.seed = (this.seed * 0x343FD + 0x1A9EC3) % 0x1000000;
    this.lastRnd = this.seed / 0x1000000;
    return this.lastRnd;
  }
  randomize(x) {
    if (this.E.devSeed !== undefined) x = this.E.devSeed;
    const b = new Uint8Array(4); floatToMbf(fr(x), b);
    const w = ((b[0] | (b[1] << 8)) ^ (b[2] | (b[3] << 8))) & 0xffff;
    this.seed = (this.seed & 0xff) | (w << 8);
  }

  FNCrew(m, f) { return Math.floor(fr(this.G[cint(m * 100 + f + 1300)] + 0.1)); }
  FNIdx(m, f) { return Math.floor(fr(m * 100 + f + 1300.5)); }
  FNKey() { return Math.floor(fr(this.G[78] * 30000 + this.G[79] + 0.5)); }
  FNRound2(v) { const t = fr(v * 100); return fr(Math.floor(fr(t + 1 - B(Math.floor(fr(t + 1)) === 9))) / 100); }
}

export function dosName(name) {
  const n = String(name).toUpperCase().replace(/^[A-Z]:/, '').trim();
  return /\.[A-Z0-9]{1,3}$/.test(n) ? n : n + '.BAS';
}

export function parseInputFields(text) {
  const out = []; let i = 0; const s = text.split('\x1a')[0];
  while (i < s.length) {
    while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
    let f = '';
    if (s[i] === '"') {
      i++; while (i < s.length && s[i] !== '"') f += s[i++];
      i++; while (i < s.length && s[i] !== ',' && s[i] !== '\r' && s[i] !== '\n') i++;
    } else {
      while (i < s.length && s[i] !== ',' && s[i] !== '\r' && s[i] !== '\n') f += s[i++];
      f = f.replace(/\s+$/, '');
    }
    out.push(f);
    if (s[i] === '\r') i++;
    if (s[i] === '\n' || s[i] === ',') i++;
  }
  return out;
}

export { using };
