// qb2bas.js — qbdis listing -> BASIC-style pseudocode (<MOD>.bas.md); port of decode/pseudo/tools/qb2bas.py
// (BYOC B3, lane byoc-b3). Statement for statement the same rules (see the Python file for the evidence notes of each
// rule); the port keeps Python's evaluation order where it has side effects on the usage counters (dict displays
// evaluate every entry, `%` tuples left to right), because those counters feed the Variables/Arrays tables.
//
//   qb2bas(listing, consts, names, opts) -> { text, vars }   one pass; opts = { title, tempbase, end, header, pre }
//   qb2basTwoPass(listing, consts, names, opts) -> text      what rebuild_all.py runs (pass 2 reads pass 1's vars)
// consts = the modconst object (modconst.js parse), names = <MOD>_names.json as a Map (py.js loads).
import { fmt, ps, strip, rstrip, lstrip, split, isdigit, Counter, dget } from './py.js';

// ---------------------------------------------------------------- listing parse
const LINE = /^([0-9A-F]{5})  ((?:[0-9a-f]{2} )*[0-9a-f]{2}(?: \.\.)?)\s+(.*)$/;
function parse(text) {
  const ins = [];
  const ls = text.split('\n'); if (ls[ls.length - 1] === '') ls.pop();
  for (const l of ls) {
    const m = LINE.exec(rstrip(l, '\n'));
    if (!m) continue;
    const addr = parseInt(m[1], 16), txt = strip(m[3]);
    const d = { addr, txt, rt: null, ops: null, mn: null };
    if (txt.startsWith('CALL RT') || txt.startsWith('CALLFAR')) {
      const t = strip(txt.split(';')[0]);
      const parts = split(t);
      d.rt = parts[1];
      if (t.includes('#')) d.inl = parts.slice(2).filter((x) => x.startsWith('#')).map((x) => parseInt(x.slice(1), 16));
      if (t.includes('n=')) {
        d.n = parseInt(/n=(\d+)/.exec(t)[1], 10);
        if (t.includes('->')) d.tgts = split(t.split('->')[1]).map((x) => parseInt(x, 16));
        if (t.includes('types=')) d.types = split(t.split('types=')[1]).map((x) => parseInt(x, 16));
      }
    } else {
      const mm = split(txt, 1); d.mn = mm[0]; d.ops = mm.length > 1 ? mm[1].split(',').map((o) => strip(o)) : [];
    }
    ins.push(d);
  }
  ins.forEach((d, i) => { d.size = i + 1 < ins.length ? ins[i + 1].addr - d.addr : 1; });
  return ins;
}

function imm(s) {
  s = strip(s);
  if (s.startsWith('0x')) return parseInt(s, 16);
  if (s.startsWith('-0x')) return -parseInt(s.slice(1), 16);   // negative hex immediates (mod-inside)
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  return null;
}
const REGS = ['ax', 'bx', 'cx', 'dx', 'si', 'di'];
const isReg = (x) => REGS.includes(x);
const eqArr = (a, b) => Array.isArray(a) && a.length === b.length && a.every((x, i) => x === b[i]);
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------- array ranges (sweep-folded): COMMON block descriptors
const COMMON = [[0x1850, 2601, 4, 'G!'], [0x40F4, 202, 2, 'Logo'], [0x4288, 9, 4, 'CrewName$'], [0x42AC, 14, 4, 'Rank$'], [0x42E4, 16, 4, 'Skill$'], [0x4324, 9, 4, 'ShipClassName$'],
  [0x4348, 5, 4, 'ShipSize$'], [0x435C, 5, 4, 'ShieldName$'], [0x4370, 5, 4, 'DefHwName$'], [0x4384, 3, 4, 'MissileKillerName$'], [0x4390, 25, 4, 'GunName$'],
  [0x43F4, 54, 4, 'WeaponName$'], [0x44CC, 6, 4, 'HandWeaponName$'], [0x44E4, 4, 4, 'SightingName$'], [0x44F4, 16, 4, 'ArmorSuitName$'], [0x4534, 11, 4, 'MiscItemName$'],
  [0x4560, 100, 4, 'ItemName$'], [0x46F0, 50, 4, 'FindName$'], [0x47B8, 23, 4, 'ShipType$'], [0x4814, 23, 4, 'EquipName$'], [0x4870, 7, 4, 'AttrName$']];

// ---------------------------------------------------------------- symbolic values
// ['imm',v] literal word | ['int',text] integer expression | ['str',text] string temp | ['elem',base,scale,idx] element address
// | ['bool',text] -1/0 | ['ptr',text] unknown pointer
function strip1(v) {
  if (!(v.startsWith('(') && v.endsWith(')'))) return v;
  let depth = 0;
  for (let k = 0; k < v.length; k++) {
    const ch = v[k];
    if (ch === '(') depth++;
    else if (ch === ')') { depth--; if (depth === 0 && k !== v.length - 1) return v; }
  }
  return v.slice(1, -1);
}
function atom(t) {
  let d = 0;
  for (const ch of t) {
    if (ch === '(') d++;
    else if (ch === ')') { d--; if (d < 0) return false; }
    else if (ch === ' ' && d === 0) return false;
  }
  return d === 0;
}
function par(t) {
  if (t.startsWith('(') && t.endsWith(')') && atom(t)) return t;
  return /^[\p{L}\p{N}_.$!%#"]+(\([^()]*\))?$/u.test(t) || t.startsWith('"') ? t : '(' + t + ')';
}
const cmpTuple = (a, b) => { for (let i = 0; i < a.length; i++) { if (a[i] < b[i]) return -1; if (a[i] > b[i]) return 1; } return 0; };

class Ctx {
  constructor(consts, names) {
    this.strlit = consts.str; this.numlit = consts.num; this.names = names;
    this.vars = new Map(); this.arrays = new Map();
    this.unknown = new Counter(); this.unknown_sites = new Map(); this.prekinds = new Map(); this.prearrays = new Map();
    this.tempbase = null; this.temps = null; this.dims = new Map();
    this.ranges = COMMON.map(([b, n, es, nm]) => [b, n, es, names.has(fmt('A%04X', b)) ? names.get(fmt('A%04X', b)) : nm]);
    for (const [k, v] of names) {
      const m = /^A([0-9A-F]{4})_count$/.exec(k);
      if (!m) continue;
      const b = parseInt(m[1], 16); const nm = names.has(fmt('A%04X', b)) ? names.get(fmt('A%04X', b)) : fmt('A_%04X', b);
      const ek = fmt('A%04X_esize', b);
      const es = parseInt(names.has(ek) ? names.get(ek) : (nm.endsWith('%') || !'!$'.includes(nm[nm.length - 1]) ? 2 : 4), 10);
      this.ranges.push([b, parseInt(v, 10), es, nm]);
    }
    this.ranges.sort(cmpTuple); this.folded = new Map(); this.named_in_range = new Map();
  }
  inarray(a) {
    for (const [b, n, es, nm] of this.ranges) {
      if (b <= a && a < b + n * es && (a - b) % es === 0) {
        const i = Math.floor((a - b) / es);
        if (this.dims.has(b)) { const d = this.dims.get(b); return [b, i, fmt('%s(%d, %d)', nm, i % d, Math.floor(i / d))]; }
        return [b, i, fmt('%s(%d)', nm, i)];
      }
    }
    return null;
  }
  tempslot(a) {
    if (this.tempbase === null) return null;
    const k = a - this.tempbase;
    if (k >= 0 && k < 0x100 && k % 8 === 0) return k / 8;
    return null;
  }
  fmtnum(v) {
    if (v === Math.trunc(v) && Math.abs(v) < 1e9) return String(Math.trunc(v));
    return fmt('%.7g', v);
  }
  var(a, kind) {
    if (kind === 'S' && this.strlit.has(a)) return '"' + this.strlit.get(a).replaceAll('"', '""') + '"';
    if (kind === 'N' && this.numlit.has(a)) return this.fmtnum(this.numlit.get(a));
    const t = this.tempslot(a);
    if (t !== null) return this.temps.has(t) ? this.temps.get(t) : 'T' + t;
    dget(this.vars, a, () => new Counter()).inc(kind);
    if (a === 0x1A) return 'FAC';
    const nm = this.names.get(fmt('%04X', a)); const hit = this.inarray(a);
    if (nm) {
      if (hit) this.named_in_range.set(a, [nm, hit]);
      return nm;
    }
    if (hit) { this.folded.set(a, hit); dget(this.arrays, hit[0], () => new Counter()); return hit[2]; }
    return fmt({ N: 'N_%04X!', S: 'S_%04X$', I: 'I_%04X%%', P: 'M_%04X' }[kind], a);
  }
  elem(base, scale, kind, idx) {
    const nm = this.arr(base, scale, kind);
    const m = /^(.+?) \+ (\d+) \* (.+)$/.exec(idx);
    if (m && atom(m[1]) && atom(m[3])) {
      this.dims.set(base, parseInt(m[2], 10));
      return fmt('%s(%s, %s)', nm, strip(m[1]), strip(m[3]));
    }
    return fmt('%s(%s)', nm, idx);
  }
  arr(base, scale, kind) {
    dget(this.arrays, base, () => new Counter()).inc(kind);
    const nm = this.names.get(fmt('A%04X', base));
    if (nm) return nm;
    return fmt({ N: 'A_%04X!', S: 'A_%04X$', I: 'A_%04X%%', P: 'A_%04X' }[kind], base);
  }
}

const isimm = (v) => v !== null && v !== undefined && v[0] === 'imm';
const truthy = (x) => !(x === null || x === undefined || x === '' || x === 0 || x === false || (Array.isArray(x) && x.length === 0));

class Xl {
  constructor(ins, ctx) {
    this.ins = ins; this.ctx = ctx; this.byaddr = new Map(ins.map((d, i) => [d.addr, i]));
    this.out = []; this.labels = new Set(); this.subs = new Set(); this.nolabel = new Set(); this.forloops = new Map();
    this.reset(); this.temps = new Map(); this.pr = null; this.args = []; this.gfx = {}; this.inp = null; this.openmode = null; this.sound = null;
    this.tempsfrom = new Map(); ctx.temps = this.temps;
    this.lastassign = new Map(); this.fnargnames = new Set(); this.fndefs = new Map(); this.pendingargs = new Map();
    for (const [k, v] of ctx.names) {
      if (k.startsWith('FN') && k.endsWith('_args')) {
        const t = parseInt(k.slice(2, 6), 16); const addrs = v.split(',').map((x) => parseInt(x, 16));
        this.fndefs.set(t, [ctx.names.get(fmt('FN%04X', t)), addrs]);
        for (const a of addrs) this.fnargnames.add(ctx.names.has(fmt('%04X', a)) ? ctx.names.get(fmt('%04X', a)) : fmt('N_%04X!', a));
      }
    }
    this.calls = new Counter();
  }
  reset(fac = 'FAC') {
    this.r = { ax: null, bx: null, cx: null, dx: null, si: null, di: null }; this.fac = fac; this.flags = null; this.facfrom = null;
    if (this.bp === undefined) this.bp = new Map();
  }
  alias(old, nw) {
    if (old === null || old === undefined || old[0] === 'imm') return;
    for (const k of REGS) if (this.r[k] === old) this.r[k] = nw;
  }
  rv(op) {
    if (isReg(op)) return this.r[op];
    const k = imm(op);
    if (k !== null) return ['imm', k & 0xFFFF];
    if (op.startsWith('word ptr [bp')) return this.bp.get(op) || ['ptr', op];
    return this.memref(op) || ['ptr', op];
  }
  memref(op) {
    const m = /^word ptr \[(\w\w) ([+-]) (0x[0-9a-f]+)\]$/.exec(op);
    if (!m || !isReg(m[1])) return null;
    const v = this.r[m[1]]; const base = m[2] === '+' ? imm(m[3]) : (-imm(m[3])) & 0xFFFF;
    if (v && v[0] === 'elem') return ['int', this.ctx.elem((v[1] + base) & 0xFFFF, v[2], 'I', v[3]), 'mem'];
    if (v && v[0] === 'imm') return ['int', this.ctx.var((v[1] + base) & 0xFFFF, 'I'), 'mem'];
    return ['int', fmt('%s(%s)', this.ctx.arr(base, 2, 'I'), '?'), 'mem'];
  }
  // ---- rendering helpers
  num(v) {
    if (v === null || v === undefined) return 'N(?)';
    if (v[0] === 'imm' && v[1] === 0x1A) return this.fac;
    if (v[0] === 'imm') return this.ctx.var(v[1], 'N');
    if (v[0] === 'elem') return this.ctx.elem(v[1], v[2], 'N', v[3]);
    return fmt('N(%s)', v[1]);
  }
  st(v) {
    if (v === null || v === undefined) return 'S(?)';
    if (v[0] === 'imm') return this.ctx.var(v[1], 'S');
    if (v[0] === 'str') return v[1];
    if (v[0] === 'elem') return this.ctx.elem(v[1], v[2], 'S', v[3]);
    return fmt('S(%s)', v[1]);
  }
  iv(v) {
    if (v === null || v === undefined) return '?';
    if (v[0] === 'imm') { const x = v[1]; return String(x >= 0x8000 ? x - 65536 : x); }
    if (v[0] === 'int' || v[0] === 'bool' || v[0] === 'str') return v[1];
    if (v[0] === 'elem') {
      if (v[1] === 0) return v[2] === 1 ? v[3] : fmt('%s * %d', par(v[3]), v[2]);
      if (v[1] < 0x1000 || v[1] >= 0xFF00) { const k = v[1] >= 0x8000 ? v[1] - 65536 : v[1]; return fmt('%s %s %d', v[2] === 1 ? v[3] : fmt('%s * %d', par(v[3]), v[2]), k < 0 ? '-' : '+', Math.abs(k)); }
      return fmt('VARPTR(%s)', this.ctx.elem(v[1], v[2], 'P', v[3]));
    }
    return v[1];
  }
  coord(xr, yr, fx, fy) {
    const x = this.r[xr], y = this.r[yr];
    const px = (isimm(fx) && fx[1] === 0xFFFF) || (fx && fx[0] === 'int' && fx[1] === '-1') ? this.num(x) : this.iv(x);
    const py = (isimm(fy) && fy[1] === 0xFFFF) || (fy && fy[0] === 'int' && fy[1] === '-1') ? this.num(y) : this.iv(y);
    return fmt('(%s, %s)', px, py);
  }
  arrref(v) {
    if (v === null || v === undefined) return 'ARR(?)';
    if (v[0] === 'imm') return this.ctx.arr(v[1], 4, 'P');
    if (v[0] === 'elem') return this.ctx.elem(v[1], v[2], 'P', v[3]);
    return fmt('ARR(%s)', this.iv(v));
  }
  // ---- output
  emit(addr, text, comment = null) {
    text = text.replace(/\+ -(\d)/g, '- $1');
    if (this.pr !== null) {
      const m = /^(\S+) = (.*)$/.exec(text);
      if (m && this.fnargnames.has(m[1])) { this.pendingargs.set(m[1], m[2]); return; }
    }
    if (this.pr !== null && !text.startsWith("'")) this.flush_print(addr);
    this.out.push([addr, text + (comment ? "   '" + comment : '')]);
    const m = /^(\S+) = (.*)$/.exec(text);
    if (m && this.fnargnames.has(m[1])) this.lastassign.set(m[1], [this.out.length - 1, m[2]]);
  }
  note(addr, text) { this.out.push([addr, "' " + text]); }
  flush_print(addr) {
    const p = this.pr; this.pr = null;
    if (p === null) return;
    let head = 'PRINT';
    if (p.file !== null && p.file !== undefined) head = fmt('PRINT #%s,', p.file);
    if (truthy(p.using)) head += fmt(' USING %s;', p.using);
    const items = p.items;
    if (!items.length) { this.out.push([p.addr, head]); return; }
    let txt = head + ' ' + items.map(([t]) => t).join('; ');
    if (!items[items.length - 1][1]) txt += ';';
    this.out.push([p.addr, txt]);
  }
  // ---- conditions
  cond(jcc) {
    const f = this.flags;
    if (f === null) return null;
    const k = f[0];
    if (k === 'cmp' || k === 'scmp') {
      const op = { je: '=', jne: '<>', ja: '>', jg: '>', jae: '>=', jge: '>=', jb: '<', jl: '<', jbe: '<=', jle: '<=' }[jcc];
      return op ? fmt('%s %s %s', f[1], op, f[2]) : null;
    }
    if (k === 'test') {
      const op = { je: '= 0', jne: '<> 0', ja: '> 0', jae: '>= 0', jb: '< 0', jbe: '<= 0', jg: '> 0', jge: '>= 0', jl: '< 0', jle: '<= 0' }[jcc];
      return op ? fmt('%s %s', f[1], op) : null;
    }
    if (k === 'bool') {
      const B = f[1];
      if (['jne', 'jl', 'js'].includes(jcc)) return B;
      if (['je', 'jge', 'jns'].includes(jcc)) return B.startsWith('(') ? 'NOT ' + B : fmt('NOT (%s)', B);
    }
    return null;
  }
  static invert(c) {
    if (c.startsWith('NOT ')) {
      const x = c.slice(4);
      return x.startsWith('(') && x.endsWith(')') && atom(x) ? x.slice(1, -1) : x;
    }
    if (c.includes(' OR ') || c.includes(' AND ') || c.includes(' XOR ')) return c.startsWith('(') && c.endsWith(')') && atom(c) ? 'NOT ' + c : fmt('NOT (%s)', c);
    for (const [a, b] of [['<>', '='], ['>=', '<'], ['<=', '>'], ['=', '<>'], ['<', '>='], ['>', '<=']]) {
      const m = new RegExp('^(.*) ' + reEsc(a) + ' (.*)$').exec(c);
      if (m) return fmt('%s %s %s', m[1], b, m[2]);
    }
    return fmt('NOT (%s)', c);
  }
  backjump(k, body, short, longcc) {
    const w = this.ins.slice(k, k + 2);
    if (!w.length) return null;
    if (w[0].mn === short && imm(w[0].ops[0]) === body) return w[0].addr + w[0].size;
    if (w.length === 2 && w[0].mn === longcc && w[1].mn === 'jmp' && imm(w[1].ops[0]) === body && imm(w[0].ops[0]) === w[1].addr + w[1].size) return w[1].addr + w[1].size;
    return null;
  }
  sgnidiom(i) {
    const w = this.ins.slice(i, i + 5);
    if (w.length < 5 || w[0].mn !== 'and' || w[0].ops.length !== 2 || w[0].ops[0] !== w[0].ops[1] || !isReg(w[0].ops[0])) return false;
    const rr = w[0].ops[0], L = w[4].addr + w[4].size;
    return w[1].mn === 'je' && imm(w[1].ops[0]) === L && w[2].mn === 'mov' && eqArr(w[2].ops, [rr, '1']) && w[3].mn === 'jge' && imm(w[3].ops[0]) === L && w[4].mn === 'neg' && eqArr(w[4].ops, [rr]);
  }
  // ---- pass 1: labels
  scan() {
    const ins = this.ins;
    for (const d of ins) {
      if (d.rt) { if (d.tgts) for (const t of d.tgts) this.labels.add(t); continue; }
      const mn = d.mn;
      if (mn === 'jmp' || mn === 'call' || (mn && mn.startsWith('j'))) {
        let t = d.ops.length ? imm(d.ops[0]) : null;
        if (t !== null) {
          t &= 0xFFFF;
          if (mn === 'call') this.subs.add(t); else this.labels.add(t);
        }
      }
    }
    ins.forEach((d, i) => {
      if (d.mn === 'mov' && d.ops.length === 2 && d.ops[1] === '0' && i + 2 < ins.length) {
        const j = ins[i + 1], k = ins[i + 2];
        if (j.mn && j.mn.startsWith('j') && j.mn !== 'jmp' && k.mn === 'dec' && k.ops[0] === d.ops[0] && imm(j.ops[0]) === k.addr + k.size) this.nolabel.add(k.addr + k.size);
      }
    });
    ins.forEach((d, i) => {
      if (d.mn === 'jge' && i + 1 < ins.length && ins[i + 1].mn === 'neg' && imm(d.ops[0]) === ins[i + 1].addr + ins[i + 1].size && i >= 1 && ins[i - 1].mn === 'and') this.nolabel.add(imm(d.ops[0]));
    });
    ins.forEach((d, i) => { if (this.sgnidiom(i)) this.nolabel.add(ins[i + 4].addr + ins[i + 4].size); });
    // FOR loop detection
    for (const d of ins) {
      if (d.mn !== 'jmp') continue;
      const T = imm(d.ops[0]); let body = d.addr + d.size;
      if (T === null || !this.byaddr.has(T)) continue;
      const k0 = this.byaddr.get(T); const w = ins.slice(k0, k0 + 7);
      if (w.length < 6) continue;
      if (this.byaddr.has(body) && ins[this.byaddr.get(body)].mn === 'nop') body += 1;
      if (w[0].mn === 'mov' && w[0].ops[0] === 'di' && imm(w[0].ops[1]) !== null && w[1].rt === 'RT3F_7D' && w[2].mn === 'mov' && eqArr(w[2].ops, ['si', 'di'])
          && w[3].mn === 'mov' && w[3].ops[0] === 'di' && imm(w[3].ops[1]) !== null && w[4].rt === 'RT3F_9F') {
        if ((w[5].mn === 'jbe' || w[5].mn === 'jae') && imm(w[5].ops[0]) === body) {
          this.forloops.set(T, { var: imm(w[0].ops[1]), lim: imm(w[3].ops[1]), body, jmp: d.addr, op: w[5].mn, end: w[5].addr + w[5].size });
          this.labels.delete(T);
        } else if (w.length === 7 && (w[5].mn === 'ja' || w[5].mn === 'jb') && imm(w[5].ops[0]) === w[6].addr + w[6].size && w[6].mn === 'jmp' && imm(w[6].ops[0]) === body) {
          this.forloops.set(T, { var: imm(w[0].ops[1]), lim: imm(w[3].ops[1]), body, jmp: d.addr, op: { ja: 'jbe', jb: 'jae' }[w[5].mn], end: w[6].addr + w[6].size });
          this.labels.delete(T);
        }
      } else if (w[0].mn === 'mov' && w[0].ops[0] === 'di' && imm(w[0].ops[1]) !== null && w[1].rt === 'RT3F_7D' && w[2].mn === 'mov' && w[2].ops[0] === 'si' && imm(w[2].ops[1]) !== null
          && w[3].rt === 'RT3F_A7' && w[4].mn === 'jb' && w[5].mn === 'jmp' && imm(w[4].ops[0]) === w[5].addr + w[5].size) {
        const neg = this.byaddr.has(imm(w[4].ops[0])) ? this.byaddr.get(imm(w[4].ops[0])) : null;
        const pos = this.byaddr.has(imm(w[5].ops[0])) ? this.byaddr.get(imm(w[5].ops[0])) : null;
        let lim = null, ok = false, end = null; const inner = new Set();
        if (neg !== null && pos !== null) {
          const n = ins.slice(neg, neg + 6);
          if (n.length >= 4 && n[0].mn === 'mov' && eqArr(n[0].ops, ['si', 'di'])) {
            let k = null;
            if (n[1].mn === 'mov' && n[1].ops[0] === 'di' && n[2].rt === 'RT3F_9F') { lim = imm(n[1].ops[1]); k = neg + 3; }
            else if (n[1].rt === 'RT3F_A7') { lim = 0; k = neg + 2; }
            if (k !== null) {
              const e = this.backjump(k, body, 'jae', 'jb');
              if (e !== null && this.byaddr.has(e) && ins[this.byaddr.get(e)].mn === 'jmp') { ok = true; inner.add(e); }
            }
          }
          if (ok) {
            const p = ins.slice(pos, pos + 4); let k = null;
            if (p.length >= 3 && p[0].mn === 'mov' && p[0].ops[0] === 'di' && p[1].mn === 'mov' && p[1].ops[0] === 'si' && p[2].rt === 'RT3F_9F') k = pos + 3;
            else if (p.length >= 2 && p[0].mn === 'mov' && p[0].ops[0] === 'si' && p[1].rt === 'RT3F_A7') k = pos + 2;
            end = k !== null ? this.backjump(k, body, 'jbe', 'ja') : null;
            ok = end !== null;
          }
        }
        if (ok) {
          this.forloops.set(T, { var: imm(w[0].ops[1]), lim, body, jmp: d.addr, op: 'jbe', end, stepvar: imm(w[2].ops[1]) });
          this.labels.delete(T); this.nolabel.add(ins[neg].addr); this.nolabel.add(ins[pos].addr); for (const x of inner) this.nolabel.add(x);
        }
      }
    }
    for (const x of this.nolabel) this.labels.delete(x);
  }
  // ---- pass 2
  run() {
    this.scan(); const c = this.ctx, ins = this.ins, n = ins.length; let i = 0;
    while (i < n) {
      const d = ins[i], a = d.addr;
      if (this.labels.has(a) || this.subs.has(a)) {
        if (this.pr !== null) this.flush_print(a);
        let keep = false;
        if (i >= 2 && ins[i - 1].mn === 'jmp' && ins[i - 2].mn && ins[i - 2].mn.startsWith('j') && ins[i - 2].mn !== 'jmp' && imm(ins[i - 2].ops[0]) === a) keep = true;
        if (!keep) this.reset();
        this.out.push([a, this.subs.has(a) ? fmt('SUB_%04X:', a) : fmt('L_%04X:', a)]);
      }
      if (this.forloops.has(a)) {
        const fl = this.forloops.get(a); const vr = c.var(fl.var, 'N');
        let step = '';
        const fx = this.fac;
        const m = new RegExp('^' + reEsc(vr) + ' \\+ (.+)$').exec(fx || '');
        if (m) step = m[1] !== '1' ? ' STEP ' + m[1] : '';
        else if (fl.stepvar !== null && fl.stepvar !== undefined) step = ' STEP ' + c.var(fl.stepvar, 'N');
        else {
          this.emit(a, fmt('%s = %s', vr, fx), fmt('NEXT %s without increment: the loop variable was reassigned', vr));
          this.emit(a, fmt('IF %s %s %s THEN GOTO L_%04X', vr, fl.op === 'jbe' ? '<=' : '>=', truthy(fl.lim) ? c.var(fl.lim, 'N') : '0', fl.body));
          this.labels.add(fl.body);
          while (ins[i].addr < fl.end) i++;
          this.reset(); continue;
        }
        this.emit(a, fmt('NEXT %s%s', vr, step));
        while (ins[i].addr < fl.end) i++;
        this.reset(); continue;
      }
      if (d.rt) { i = this.rt(i); continue; }
      const mn = d.mn, ops = d.ops;
      if (mn === 'mov') {
        const [dst, src] = ops;
        if (isReg(dst)) {
          if (isReg(src)) this.r[dst] = this.r[src];
          else if (imm(src) !== null) this.r[dst] = ['imm', imm(src) & 0xFFFF];
          else if (src.startsWith('word ptr [bp')) this.r[dst] = this.bp.has(src) ? this.bp.get(src) : null;
          else if (src.startsWith('word ptr [')) {
            const ad = imm(src.slice(10, -1)); this.r[dst] = ad !== null ? ['int', c.var(ad, 'I')] : (this.memref(src) || ['ptr', src]);
          } else this.r[dst] = ['ptr', src];
        } else if (dst.startsWith('word ptr [bp') && isReg(src)) this.bp.set(dst, this.r[src]);
        else if (dst.startsWith('word ptr [') && imm(dst.slice(10, -1)) !== null) {
          const ad = imm(dst.slice(10, -1)); const val = isReg(src) ? this.iv(this.rv(src)) : ps(imm(src));
          const nm = c.var(ad, 'I'); this.emit(a, fmt('%s = %s', nm, val));
          if (isReg(src) && !this.fnargnames.has(nm)) this.alias(this.r[src], ['int', nm]);
        } else if (dst.startsWith('word ptr [') && this.memref(dst) !== null) {
          const val = isReg(src) ? this.iv(this.rv(src)) : this.iv(['imm', imm(src) & 0xFFFF]);
          const nm = this.memref(dst)[1]; this.emit(a, fmt('%s = %s', nm, val));
          if (isReg(src)) this.alias(this.r[src], ['int', nm]);
        } else this.note(a, 'asm ' + d.txt);
      } else if (mn === 'xchg') {
        const [x, y] = ops; const t = this.r[y]; this.r[y] = this.r[x]; this.r[x] = t;
      } else if (mn === 'shl') {
        const rr = ops[0]; const v = isReg(rr) ? this.r[rr] : null;
        if (!isReg(rr)) { this.note(a, 'asm ' + d.txt); i++; continue; }
        if (v && v[0] === 'elem') this.r[rr] = ['elem', v[1], v[2] * 2, v[3]];
        else if (v && v[0] === 'imm') this.r[rr] = ['imm', (v[1] * 2) & 0xFFFF];
        else if (v && (v[0] === 'int' || v[0] === 'bool')) this.r[rr] = ['elem', 0, 2, v[1]];
        else this.r[rr] = ['elem', 0, 2, '?'];
      } else if ((mn === 'add' || mn === 'sub' || mn === 'xor') && !isReg(ops[0])) this.note(a, 'asm ' + d.txt);
      else if (mn === 'add') {
        const [rr, src] = ops; const v = this.r[rr]; const k = imm(src);
        if (isReg(src) || imm(src) === null) {
          const w = this.rv(src);
          if (v && v[0] === 'elem' && v[1] === 0 && v[2] > 1 && w && (w[0] === 'int' || w[0] === 'bool')) this.r[rr] = ['int', fmt('%s + %d * %s', w[1], v[2], v[3])];
          else if (w && w[0] === 'elem' && w[1] === 0 && w[2] > 1 && v && (v[0] === 'int' || v[0] === 'bool')) this.r[rr] = ['int', fmt('%s + %d * %s', v[1], w[2], w[3])];
          else this.r[rr] = ['int', fmt('%s + %s', this.iv(v), this.iv(w))];
        } else if (v && v[0] === 'elem' && k !== null) this.r[rr] = ['elem', (v[1] + k) & 0xFFFF, v[2], v[3]];
        else if (v && v[0] === 'imm' && k !== null) this.r[rr] = ['imm', (v[1] + k) & 0xFFFF];
        else if (v && v[0] === 'int' && v.length > 2 && k !== null) this.r[rr] = ['int', fmt('%s + %d', v[1], k >= 0x8000 ? k - 65536 : k)];
        else if (v && (v[0] === 'int' || v[0] === 'bool') && k !== null) this.r[rr] = ['int', fmt('%s + %d', v[1], k >= 0x8000 ? k - 65536 : k)];
        else if (k !== null) this.r[rr] = ['int', fmt('%s + %d', this.iv(v), k >= 0x8000 ? k - 65536 : k)];
        else this.r[rr] = ['int', fmt('%s + %s', this.iv(v), src)];
        this.flags = null;
      } else if (mn === 'sub') {
        const [rr, src] = ops; const v = this.r[rr]; const k = imm(src);
        if (isReg(src)) this.r[rr] = ['int', fmt('%s - %s', this.iv(v), this.iv(this.rv(src)))];
        else if (v && v[0] === 'imm' && k !== null) this.r[rr] = ['imm', (v[1] - k) & 0xFFFF];
        else this.r[rr] = ['int', fmt('%s - %s', this.iv(v), k)];
      } else if (mn === 'xor') {
        const [rr, src] = ops;
        if (src === rr) this.r[rr] = ['imm', 0];
        else if (imm(src) !== null) this.r[rr] = ['int', fmt('(%s XOR %d)', this.iv(this.r[rr]), imm(src))];
        else this.r[rr] = ['int', fmt('(%s XOR %s)', this.iv(this.r[rr]), this.iv(this.rv(src)))];
      } else if (mn === 'and') {
        const [rr, src] = ops;
        if (src === rr && this.sgnidiom(i)) { this.r[rr] = ['int', fmt('SGN(%s)', this.iv(this.r[rr]))]; i += 5; continue; }
        if (src === rr) this.flags = ['bool', this.iv(this.r[rr])];
        else if (!isReg(rr)) this.note(a, 'asm ' + d.txt);
        else { this.r[rr] = ['bool', fmt('(%s AND %s)', this.iv(this.r[rr]), this.iv(this.rv(src)))]; this.flags = ['bool', this.r[rr][1]]; }
      } else if (mn === 'or') {
        const [rr, src] = ops;
        if (!isReg(rr)) { this.note(a, 'asm ' + d.txt); i++; continue; }
        if (src === rr) { this.flags = ['test', this.iv(this.r[rr])]; i++; continue; }
        this.r[rr] = ['bool', fmt('(%s OR %s)', this.iv(this.r[rr]), this.iv(this.rv(src)))]; this.flags = ['bool', this.r[rr][1]];
      } else if (['dec', 'inc', 'neg', 'not'].includes(mn) && !isReg(ops[0])) this.note(a, 'asm ' + d.txt);
      else if (mn === 'dec') {
        const rr = ops[0], v = this.r[rr];
        if (v && v[0] === 'imm') this.r[rr] = ['imm', (v[1] - 1) & 0xFFFF]; else this.r[rr] = ['int', fmt('%s - 1', this.iv(v))];
      } else if (mn === 'inc') {
        const rr = ops[0], v = this.r[rr];
        if (v && v[0] === 'imm') this.r[rr] = ['imm', (v[1] + 1) & 0xFFFF]; else this.r[rr] = ['int', fmt('%s + 1', this.iv(v))];
      } else if (mn === 'neg') { const rr = ops[0]; this.r[rr] = ['int', fmt('-(%s)', this.iv(this.r[rr]))]; }
      else if (mn === 'not') { const rr = ops[0]; this.r[rr] = ['bool', fmt('NOT (%s)', this.iv(this.r[rr]))]; }
      else if (mn === 'imul') this.r.ax = ['int', fmt('%s * %s', this.iv(this.r.ax), this.iv(this.rv(ops[0])))];
      else if (mn === 'cmp') {
        const [x, y] = ops;
        const L = isReg(x) ? this.iv(this.r[x]) : (imm(x.slice(10, -1)) !== null ? c.var(imm(x.slice(10, -1)), 'I') : this.iv(this.rv(x)));
        const R = isReg(y) ? this.iv(this.r[y]) : (imm(y) !== null ? ps(imm(y)) : this.iv(this.rv(y)));
        this.flags = ['cmp', L, R];
      } else if (mn === 'test') this.flags = ['bool', this.iv(this.r[ops[0]])];
      else if (mn === 'push') this.note(a, isReg(ops[0]) ? fmt('push %s', this.iv(this.r[ops[0]])) : 'push ' + ops[0]);
      else if (mn === 'pop') this.r[ops[0]] = ['ptr', 'popped'];
      else if (mn === 'nop') { /* alignment */ }
      else if (mn === 'jmp') {
        const t = imm(ops[0]);
        if (t === null) this.note(a, 'asm ' + d.txt);
        else if (this.forloops.has(t)) {
          const fl = this.forloops.get(t); const vr = c.var(fl.var, 'N'); const lim = truthy(fl.lim) ? c.var(fl.lim, 'N') : '0';
          this.emit(a, fmt('FOR %s = %s %s %s', vr, this.fac, fl.op === 'jbe' ? 'TO' : 'DOWNTO', lim));
        } else this.emit(a, fmt('GOTO L_%04X', t & 0xFFFF));
        this.reset();
      } else if (mn.startsWith('j')) {
        const t = imm(ops[0]) & 0xFFFF;
        if (i >= 1 && ins[i - 1].mn === 'mov' && ins[i - 1].ops[1] === '0' && i + 1 < n && ins[i + 1].mn === 'dec' && ins[i + 1].ops[0] === ins[i - 1].ops[0] && t === ins[i + 1].addr + ins[i + 1].size) {
          const cnd = this.cond(mn); const rr = ins[i + 1].ops[0];
          this.r[rr] = ['bool', fmt('(%s)', cnd ? Xl.invert(cnd) : '?')]; i += 2; continue;
        }
        if (mn === 'jge' && i + 1 < n && ins[i + 1].mn === 'neg' && t === ins[i + 1].addr + ins[i + 1].size && this.flags && this.flags[0] === 'bool') {
          const rr = ins[i + 1].ops[0]; this.r[rr] = ['int', fmt('ABS(%s)', strip1(this.flags[1]))]; i += 2; continue;
        }
        const cnd = this.cond(mn);
        if (i + 1 < n && ins[i + 1].mn === 'jmp' && t === ins[i + 1].addr + ins[i + 1].size) {
          const t2 = imm(ins[i + 1].ops[0]) & 0xFFFF;
          if (this.forloops.has(t2)) {
            const fl = this.forloops.get(t2); const vr = c.var(fl.var, 'N'); const lim = truthy(fl.lim) ? c.var(fl.lim, 'N') : '0';
            this.emit(a, fmt('IF %s THEN FOR %s = %s TO %s', cnd ? Xl.invert(cnd) : '?' + ' ' + mn, vr, this.fac, lim));
          } else this.emit(a, fmt('IF %s THEN GOTO L_%04X', cnd ? Xl.invert(cnd) : '?' + mn + ' ' + ps(this.flags), t2));
          i += 2; continue;
        }
        this.emit(a, fmt('IF %s THEN GOTO L_%04X', cnd ? cnd : '?' + mn + ' ' + ps(this.flags), t));
      } else if (mn === 'call') {
        let t = imm(ops[0]);
        if (t === null) this.note(a, 'asm ' + d.txt);
        else if (this.fndefs.has(t & 0xFFFF)) {
          t &= 0xFFFF; this.calls.inc(t); const [fn, addrs] = this.fndefs.get(t);
          const argnames = addrs.map((x) => (c.names.has(fmt('%04X', x)) ? c.names.get(fmt('%04X', x)) : fmt('N_%04X!', x)));
          const la = argnames.map((nm) => this.lastassign.get(nm));
          let vals = []; const idxs = []; let ok = true;
          argnames.forEach((nm, j) => {
            const x = la[j];
            if (x) { vals.push(x[1]); idxs.push(x[0]); }
            else if (this.pendingargs.has(nm)) { vals.push(this.pendingargs.get(nm)); this.pendingargs.delete(nm); }
            else ok = false;
          });
          const sorted = [...idxs].sort((p, q) => p - q);
          if (ok && eqArr(sorted, Array.from({ length: idxs.length }, (_, j) => this.out.length - idxs.length + j))) {
            this.out.splice(this.out.length - idxs.length);
            for (const nm of argnames) this.lastassign.delete(nm);
          } else vals = argnames;
          this.reset(fmt('%s(%s)', fn, vals.join(', ')));
        } else {
          t &= 0xFFFF; this.calls.inc(t);
          this.emit(a, fmt('GOSUB SUB_%04X', t));
          this.reset(fmt('FN_%04X', t));
        }
      } else if (mn === 'ret') {
        if (!(this.fac === 'FAC' || this.fac === null) && !this.fac.startsWith('FN_')) this.emit(a, fmt("RETURN   'with FAC = %s", this.fac));
        else this.emit(a, 'RETURN');
        this.reset();
      } else if (mn === 'int') this.note(a, 'asm ' + d.txt + '  (data tail?)');
      else if (mn === 'db') this.note(a, 'db ' + d.txt);
      else this.note(a, 'asm ' + d.txt);
      i++;
    }
    if (this.pr !== null) this.flush_print(0);
  }
  // ---- runtime calls
  rt(i) {
    const oldfac = this.fac; const i2 = this.rt0(i);
    if (this.fac !== oldfac && this.ins[i].rt !== 'RT3F_57') this.facfrom = null;
    return i2;
  }
  rt0(i) {
    const d = this.ins[i], a = d.addr, rt = d.rt, r = this.r, c = this.ctx;
    const inl = d.inl || [0];
    const N = (reg) => this.num(r[reg]);
    const S = (reg) => this.st(r[reg]);
    const I = (reg) => this.iv(r[reg]);
    const tslot = (b) => (this.temps.has(b & 0x7F) ? this.temps.get(b & 0x7F) : 'T' + (b & 0x7F));
    const facOr = (reg, fallback) => (isimm(r[reg]) && r[reg][1] === 0x1A ? this.fac : fallback());
    // a Python dict display {k: (..), ..}[rt]: every entry is evaluated (side effects), then one is chosen
    const pick = (entries) => { const ev = entries.map(([k, f]) => [k, f()]); return ev.find(([k]) => k === rt)[1]; };
    // ---------- floating point
    if (rt === 'RT3F_7B') this.emit(a, fmt('%s = %s', N('di'), N('si')));
    else if (rt === 'RT3F_7D') {
      if (this.pr === null && N('di') !== 'FAC') {
        this.emit(a, fmt('%s = %s', N('di'), this.fac));
        if (isimm(r.di) && c.tempslot(r.di[1]) === null && !this.fnargnames.has(N('di'))) { this.fac = N('di'); this.facfrom = null; }
      } else if (this.pr !== null && this.fnargnames.has(N('di'))) { const v = this.fac; this.pendingargs.set(N('di'), v); }
    } else if (rt === 'RT3F_6F') this.fac = N('si');
    else if (rt === 'RT3F_71') {
      const b = inl[0] & 0x7F; this.temps.set(b, this.fac);
      this.tempsfrom.set(b, this.facfrom && this.fac === this.iv(this.facfrom) ? this.facfrom : null);
    } else if (['RT3F_7F', 'RT3F_81', 'RT3F_83', 'RT3F_85'].includes(rt)) {
      const [L, R] = pick([['RT3F_7F', () => [N('si'), N('di')]], ['RT3F_81', () => [this.fac, N('di')]], ['RT3F_83', () => [N('si'), this.fac]], ['RT3F_85', () => [tslot(inl[0]), this.fac]]]);
      this.fac = fmt('%s + %s', L, R);
    } else if (['RT3F_97', 'RT3F_99', 'RT3F_9B', 'RT3F_9D'].includes(rt)) {
      const [L, R] = pick([['RT3F_97', () => [N('si'), N('di')]], ['RT3F_99', () => [this.fac, N('di')]], ['RT3F_9B', () => [N('si'), this.fac]], ['RT3F_9D', () => [tslot(inl[0]), this.fac]]]);
      this.fac = fmt('%s - %s', L, par(R));
    } else if (['RT3F_8F', 'RT3F_91', 'RT3F_93', 'RT3F_95'].includes(rt)) {
      const [L, R] = pick([['RT3F_8F', () => [N('si'), N('di')]], ['RT3F_91', () => [this.fac, N('di')]], ['RT3F_93', () => [N('si'), this.fac]], ['RT3F_95', () => [tslot(inl[0]), this.fac]]]);
      this.fac = fmt('%s * %s', par(L), par(R));
    } else if (['RT3F_87', 'RT3F_89', 'RT3F_8B', 'RT3F_8D'].includes(rt)) {
      const [L, R] = pick([['RT3F_87', () => [N('si'), N('di')]], ['RT3F_89', () => [this.fac, N('di')]], ['RT3F_8B', () => [N('si'), this.fac]], ['RT3F_8D', () => [tslot(inl[0]), this.fac]]]);
      this.fac = fmt('%s / %s', par(L), par(R));
    } else if (['RT3F_23', 'RT3F_25', 'RT3F_27'].includes(rt)) {
      const [L, R] = pick([['RT3F_23', () => [N('si'), N('di')]], ['RT3F_25', () => [this.fac, N('di')]], ['RT3F_27', () => [N('si'), this.fac]]]);
      this.fac = fmt('%s ^ %s', par(L), par(R));
    } else if (rt === 'RT3F_9F') this.flags = ['cmp', N('si'), N('di')];
    else if (rt === 'RT3F_A1') this.flags = ['cmp', this.fac, N('di')];
    else if (rt === 'RT3F_A3') this.flags = ['cmp', N('si'), this.fac];
    else if (rt === 'RT3F_A5') this.flags = ['cmp', tslot(inl[0]), this.fac];
    else if (rt === 'RT3F_A7') this.flags = ['test', N('si')];
    else if (rt === 'RT3F_A9') this.flags = ['test', this.fac];
    else if (rt === 'RT3F_75' || rt === 'RT3F_19') {
      const v = r.si;
      if (v && v[0] === 'imm' && c.numlit.has(v[1])) r.bx = ['imm', Math.trunc(c.numlit.get(v[1])) & 0xFFFF];
      else r.bx = ['int', fmt('CINT(%s)', N('si'))];
    } else if (rt === 'RT3F_77' || rt === 'RT3F_1B') r.bx = ['int', fmt('CINT(%s)', this.fac)];
    else if (rt === 'RT3F_78') r.bx = ['int', fmt('CINT(%s)', this.fac)];
    else if (rt === 'RT3F_57') {
      const v = r.bx;
      if (v && v[0] === 'imm') { this.fac = this.iv(v); this.facfrom = ['imm', v[1]]; } else this.fac = I('bx');
    } else if (rt === 'RT3F_7A') { /* CSNG DAC->FAC: fac already holds the VAL text */ }
    else if (rt === 'RT3F_2B') this.fac = fmt('ABS(%s)', N('si'));
    else if (rt === 'RT3F_2D') this.fac = fmt('ABS(%s)', this.fac);
    else if (rt === 'RT3F_AF') this.fac = '-' + par(N('si'));
    else if (rt === 'RT3F_B1') this.fac = '-' + par(this.fac);
    else if (rt === 'RT3F_2F') this.fac = fmt('SGN(%s)', N('si'));
    else if (rt === 'RT3F_31') this.fac = fmt('SGN(%s)', this.fac);
    else if (rt === 'RT3F_1D') r.bx = ['bool', fmt('(%s <> 0)', N('si'))];
    else if (rt === 'RT3F_1F') r.bx = ['bool', fmt('(%s <> 0)', this.fac)];
    else if (rt === 'RT3F_AB') { let b = inl[0]; b = b > 127 ? b - 256 : b; this.fac = fmt('%s * %s', par(N('si')), b >= 0 ? (2n ** BigInt(b)).toString() : fmt('2^%d', b)); }
    else if (rt === 'RT3F_AD') { let b = inl[0]; b = b > 127 ? b - 256 : b; this.fac = fmt('%s * %s', par(this.fac), b >= 0 ? (2n ** BigInt(b)).toString() : fmt('2^%d', b)); }
    else if (rt === 'RT3D_03') this.fac = fmt('INT(%s)', facOr('bx', () => N('bx')));
    else if (rt === 'RT3D_33') this.fac = fmt('RND(%s)', facOr('bx', () => N('bx')));
    else if (rt === 'RT3D_34') this.fac = 'RND';
    else if (['RT3D_35', 'RT3D_38', 'RT3D_39', 'RT3D_3A'].includes(rt)) {
      const fn = { RT3D_35: 'ATN', RT3D_38: 'LOG', RT3D_39: 'SIN', RT3D_3A: 'SQR' }[rt];
      this.fac = fmt('%s(%s)', fn, facOr('bx', () => N('bx')));
    } else if (rt === 'RT3D_43') this.fac = 'TIMER';
    else if (rt === 'RT3F_11') this.emit(a, fmt('SWAP %s, %s', N('si'), N('di')));
    else if (rt === 'RT3F_14') this.emit(a, fmt('SWAP %s, %s', S('si'), S('di')));
    else if (rt === 'RT3F_C9') this.fac = fmt('VARPTR(%s)', this.arrref(r.bx));
    else if (rt === 'RT3F_45') this.emit(a, fmt('DIM %s(%d dims; sizes pushed above)', this.arrref(r.bx), inl[0]));
    // ---------- strings
    else if (rt === 'RT3D_11') r.bx = ['str', fmt('STR$(%s)', facOr('bx', () => N('bx')))];
    else if (rt === 'RT3D_13') this.fac = fmt('VAL(%s)', S('bx'));
    else if (rt === 'RT3F_55') r.bx = ['str', fmt('%s + %s', S('ax'), S('bx'))];
    else if (rt === 'RT3F_61') this.emit(a, fmt('%s = %s', S('dx'), S('bx')));
    else if (rt === 'RT3F_62') this.flags = ['scmp', S('ax'), S('bx')];
    else if (rt === 'RT3F_BA') r.bx = ['int', fmt('LEN(%s)', S('bx'))];
    else if (rt === 'RT3F_BB') r.bx = ['int', fmt('ASC(%s)', S('bx'))];
    else if (rt === 'RT3D_05') r.bx = ['str', fmt('CHR$(%s)', I('bx'))];
    else if (rt === 'RT3D_06') r.bx = ['str', 'INKEY$'];
    else if (rt === 'RT3D_0A') r.bx = ['str', fmt('MID$(%s, %s, %s)', S('bx'), I('dx'), I('cx'))];
    else if (rt === 'RT3D_0B') r.bx = ['str', fmt('LEFT$(%s, %s)', S('bx'), I('dx'))];
    else if (rt === 'RT3D_0C') r.bx = ['str', fmt('RIGHT$(%s, %s)', S('bx'), I('dx'))];
    else if (rt === 'RT3D_0D') r.bx = ['str', fmt('SPACE$(%s)', I('bx'))];
    else if (rt === 'RT3D_0E') r.bx = ['str', fmt('STRING$(%s, %s)', I('bx'), I('dx'))];
    else if (rt === 'RT3D_0F') r.bx = ['str', fmt('STRING$(%s, %s)', I('bx'), S('dx'))];
    else if (rt === 'RT3D_08') r.bx = ['int', fmt('INSTR(%s, %s, %s)', I('bx'), S('dx'), S('cx'))];
    else if (rt === 'RT3D_09') r.bx = ['int', fmt('INSTR(%s, %s)', S('bx'), S('dx'))];
    else if (rt === 'RT3F_18') r.bx = ['str', fmt('VARPTR$(%s)', S('bx'))];
    else if (rt === 'RT3D_21') r.bx = ['int', 'POS(0)'];
    else if (rt === 'RT3D_25') r.bx = ['int', 'CSRLIN'];
    else if (rt === 'RT3D_2F') r.bx = ['bool', fmt('EOF(%s)', I('bx'))];
    else if (rt === 'RT3D_44') r.bx = ['int', fmt('STICK(%s)', I('bx'))];
    // ---------- PRINT / LOCATE / COLOR / SCREEN
    else if (rt === 'RT3F_BC') this.pr = { addr: a, items: [], using: null, file: null };
    else if (rt === 'RT3F_BD') this.pr = { addr: a, items: [], using: S('bx'), file: null };
    else if (rt === 'RT3F_BE') this.pr = { addr: a, items: [], using: null, file: I('bx') };
    else if (['RT3F_6A', 'RT3F_6E', 'RT3F_67', 'RT3F_6B', 'RT3F_6D', 'RT3F_35'].includes(rt)) {
      if (this.pr === null) this.pr = { addr: a, items: [], using: null, file: null };
      if (rt === 'RT3F_6A') this.pr.items.push([S('bx'), false]);
      else if (rt === 'RT3F_6E') this.pr.items.push([S('bx'), true]);
      else if (rt === 'RT3F_67') this.pr.items.push([N('bx'), false]);
      else if (rt === 'RT3F_6B') this.pr.items.push([N('bx'), true]);
      else if (rt === 'RT3F_6D') this.pr.items.push([I('bx'), true]);
      else this.pr.items.push([fmt('SPC(%s)', I('bx')), false]);
    } else if (rt === 'RT3E_79') this.flush_print(a);
    else if (['RT3E_42', 'RT3E_33', 'RT3E_59'].includes(rt)) this.args.push(I('bx'));
    else if (rt === 'RT3E_43') this.args.push('');
    else if (rt === 'RT3E_44') { this.emit(a, 'LOCATE ' + [...this.args, I('bx')].join(', ')); this.args = []; }
    else if (rt === 'RT3E_35') { this.emit(a, 'COLOR ' + [...this.args, I('bx')].join(', ')); this.args = []; }
    else if (rt === 'RT3E_5B') { this.emit(a, 'SCREEN ' + [...this.args, I('bx')].join(', ')); this.args = []; }
    else if (rt === 'RT3E_32') { const v = I('bx'); this.emit(a, v === '-1' ? 'CLS' : fmt('CLS %s', v)); }
    else if (rt === 'RT3E_3C') { const k = I('bx'); const dflt = I('bx'); const m = { 0: 'OFF', 1: 'ON', 2: 'LIST' }; this.emit(a, fmt('KEY %s', ['0', '1', '2'].includes(k) ? m[k] : dflt)); }
    else if (rt === 'RT3E_2B') this.emit(a, 'BEEP');
    else if (rt === 'RT3E_4A') this.emit(a, fmt('PALETTE %s, %s', I('bx'), I('dx')));
    // ---------- graphics
    else if (['RT3E_89', 'RT3E_8D', 'RT3E_84', 'RT3E_87'].includes(rt)) this.gfx = { xy: this.coord('bx', 'dx', r.cx, r.ax) };
    else if (rt === 'RT3E_85' || rt === 'RT3E_88') this.gfx.xy2 = this.coord('bx', 'dx', r.cx, r.ax);
    else if (rt === 'RT3E_58') {
      const dv = isdigit(lstrip(I('dx'), '-')) ? imm(I('dx')) : null;
      const far = dv !== null && (dv & 0xFF00) !== 0;
      const vk = dv !== null ? dv & 0xFF : null; const dflt = I('dx');
      const VERB = { 0: 'OR', 1: 'AND', 2: 'PRESET', 3: 'PSET', 4: 'XOR' };
      const verb = vk !== null && vk in VERB ? VERB[vk] : dflt;
      this.emit(a, fmt('PUT %s, %s, %s', 'xy' in this.gfx ? this.gfx.xy : '(?)', this.arrref(r.bx), verb), far ? 'dynamic array (descriptor)' : null);
    } else if (rt === 'RT3E_3A') this.emit(a, fmt('GET %s-%s, %s', 'xy' in this.gfx ? this.gfx.xy : '(?)', 'xy2' in this.gfx ? this.gfx.xy2 : '(?)', this.arrref(r.bx)));
    else if (rt === 'RT3E_86') {
      const col = I('bx'), dx = I('dx'), cx = I('cx');
      const o = { '-1': '', 0: ', B', 1: ', BF' }; const opt = ['-1', '0', '1'].includes(dx) ? o[dx] : fmt(', ?%s', dx);
      const sty = cx === '-1' ? '' : (isdigit(lstrip(cx, '-')) ? fmt(', &H%04X', parseInt(cx, 10) & 0xFFFF) : fmt(', %s', cx));
      const tail = (col === '-1' ? '' : col) + (opt || !sty ? opt : ', ') + sty;
      this.emit(a, fmt('LINE %s-%s%s', 'xy' in this.gfx ? this.gfx.xy : '(?)', 'xy2' in this.gfx ? this.gfx.xy2 : '(?)', tail ? ', ' + tail : ''));
    } else if (rt === 'RT3E_2F') this.gfx.start = N('bx');
    else if (rt === 'RT3E_30') this.gfx.end = N('bx');
    else if (rt === 'RT3E_31') this.gfx.aspect = N('bx');
    else if (rt === 'RT3E_8C') {
      const gx = this.gfx; let extra = '';
      const gg = (k) => (k in gx ? gx[k] : '');
      if ('start' in gx || 'end' in gx || 'aspect' in gx) extra = fmt(', %s, %s, %s', gg('start'), gg('end'), gg('aspect'));
      this.emit(a, fmt('CIRCLE %s, %s, %s%s', 'xy' in gx ? gx.xy : '(?)', N('bx'), I('dx'), extra)); this.gfx = {};
    } else if (rt === 'RT3E_48') this.emit(a, fmt('PAINT %s, %s, %s', 'xy' in this.gfx ? this.gfx.xy : '(?)', I('bx'), I('dx')));
    else if (rt === 'RT3E_8B') { const col = I('bx'); this.emit(a, fmt('PSET %s%s', 'xy' in this.gfx ? this.gfx.xy : '(?)', col === '-1' ? '' : ', ' + col)); }
    else if (rt === 'RT3E_8A') { const col = I('bx'); this.emit(a, fmt('PRESET %s%s', 'xy' in this.gfx ? this.gfx.xy : '(?)', col === '-1' ? '' : ', ' + col)); }
    // ---------- sound
    else if (rt === 'RT3E_51') this.emit(a, fmt('PLAY %s', S('bx')));
    else if (rt === 'RT3E_5E') { const x = I('bx'); this.sound = [x, facOr('dx', () => N('dx'))]; }
    else if (rt === 'RT3E_5F') { const sd = this.sound || ['?', '?']; this.emit(a, fmt('SOUND %s, %s', sd[0], sd[1])); this.sound = null; }
    // ---------- files / control
    else if (rt === 'RT3E_1A' || rt === 'RT3E_1B') {
      let off = facOr('dx', () => N('dx'));
      if (this.facfrom && isimm(r.dx) && r.dx[1] === 0x1A) off = fmt('&H%04X', this.facfrom[1]);
      const ts = isimm(r.dx) ? c.tempslot(r.dx[1]) : null;
      if (ts !== null && this.tempsfrom.get(ts)) off = fmt('&H%04X', this.tempsfrom.get(ts)[1]);
      if (rt === 'RT3E_1A') this.emit(a, fmt('BLOAD %s, %s', S('bx'), off));
      else this.emit(a, fmt('BSAVE %s, %s, %s', S('bx'), off, I('cx')));
    } else if (rt === 'RT3E_0E') this.emit(a, fmt('CHAIN %s', S('bx')));
    else if (rt === 'RT3E_20') { const k = I('bx'); const dflt = I('bx'); this.openmode = ['0', '1', '2', '3'].includes(k) ? { 0: 'INPUT', 1: 'OUTPUT', 2: 'RANDOM', 3: 'APPEND' }[k] : dflt; }
    else if (rt === 'RT3E_1E') { this.emit(a, fmt('OPEN %s FOR %s AS #%s', S('dx'), this.openmode, I('bx'))); this.openmode = null; }
    else if (rt === 'RT3E_21') this.emit(a, fmt('CLOSE #%s', I('bx')));
    else if (rt === 'RT3F_B6') this.inp = { addr: a, kind: fmt('INPUT #%s,', I('bx')), items: [], types: [] };
    else if (rt === 'RT3F_B5') { const p = S('bx'); this.inp = { addr: a, kind: fmt('INPUT %s%s', p, p !== '""' ? ';' : ''), items: [], types: [] }; }
    else if (rt === 'RT3F_B7') {
      if (this.inp === null) this.inp = { addr: a, kind: 'INPUT', items: [], types: [] };
      this.inp.types = d.types || [];
    } else if (rt === 'RT3F_B8') {
      if (this.inp === null) this.inp = { addr: a, kind: 'INPUT', items: [], types: [] };
      const k = this.inp.items.length < this.inp.types.length ? this.inp.types[this.inp.items.length] : 4;
      const v = r.bx; const ad = isimm(v) ? v[1] : (v && v[0] === 'elem' ? v[1] : null);
      const pk = ad !== null ? ((isimm(v) ? c.prekinds.get(fmt('%04X', ad)) : c.prearrays.get(fmt('%04X', ad))) || new Map()) : new Map();
      let tgt;
      if (k === 1) tgt = isimm(v) ? c.var(v[1], 'I') : (v && v[0] === 'elem' ? c.elem(v[1], v[2], 'I', v[3]) : fmt('I(%s)', I('bx')));
      else if (k === 4) tgt = S('bx');
      else if (k === 2 || k === 3) tgt = N('bx');
      else tgt = pk.has('S') ? S('bx') : N('bx');
      this.inp.items.push(tgt);
      if (this.inp.items.length >= this.inp.types.length) { this.emit(this.inp.addr, fmt('%s %s', this.inp.kind, this.inp.items.join(', '))); this.inp = null; }
    } else if (rt === 'RT3F_5A') { this.emit(a, fmt('LINE INPUT #%s, %s', this.inp ? rstrip(this.inp.kind.split('#')[1], ',') : '?', S('bx'))); this.inp = null; }
    else if (['RT3F_0D', 'RT3F_0F', 'RT3F_10'].includes(rt)) {
      const e1 = N('bx'), e2 = S('bx');
      let tgt = { RT3F_0D: e1, RT3F_10: e2 }[rt];
      if (tgt === undefined) tgt = null;
      if (rt === 'RT3F_0F') { const v = r.bx; tgt = isimm(v) ? c.var(v[1], 'I') : (v && v[0] === 'elem' ? fmt('%s(%s)', c.arr(v[1], v[2], 'I'), v[3]) : fmt('I(%s)', I('bx'))); }
      this.emit(a, fmt('READ %s', tgt));
    } else if (rt === 'RT3F_5D' || rt === 'RT3F_5E') {
      const kw = rt === 'RT3F_5D' ? 'GOSUB' : 'GOTO';
      this.emit(a, fmt('ON %s %s %s', I('bx'), kw, (d.tgts || []).map((t) => fmt(this.subs.has(t) ? 'SUB_%04X' : 'L_%04X', t)).join(', ')));
    } else if (rt === 'RT3F_02') {
      const v = r.dx; const t = isimm(v) ? (v[1] + 0x10) & 0xFFFF : null;
      if (t === 0x10) this.emit(a, 'ON ERROR GOTO 0');
      else if (t !== null) { this.emit(a, fmt('ON ERROR GOTO L_%04X', t)); this.labels.add(t); }
      else this.emit(a, fmt('ON ERROR GOTO %s', I('dx')));
    } else if (rt === 'RT3F_09') {
      const v = r.bx; const t = isimm(v) ? (v[1] + 0x10) & 0xFFFF : null;
      if (t !== null) { this.emit(a, fmt('RESUME L_%04X', t)); this.labels.add(t); }
      else this.emit(a, fmt('RESUME %s', I('bx')));
    } else if (rt === 'RT3E_09') this.emit(a, fmt('RANDOMIZE %s', facOr('bx', () => N('bx'))));
    else if (rt === 'RT3E_01') this.emit(a, 'END');
    else if (rt === 'RT3E_02') this.emit(a, "END   'error-handler fallthrough (error 19 if an error is active)");
    else {
      c.unknown.inc(rt); dget(c.unknown_sites, rt, () => []).push(a);
      this.emit(a, fmt('CALL %s(BX=%s, DX=%s, CX=%s, AX=%s, SI=%s, DI=%s)', rt, I('bx'), I('dx'), I('cx'), I('ax'), I('si'), I('di')));
      this.reset('FAC');
    }
    return i + 1;
  }
}

export function qb2bas(listing, consts, names, { title = 'MODULE', tempbase = null, end = null, header = null, pre = null } = {}) {
  const cc = { str: new Map(), num: new Map() };
  for (const it of consts.init) {
    if (it.kind === 'str') cc.str.set(it.addr, it.text);
    else if (it.kind === 'single') cc.num.set(it.addr, it.value);
  }
  let ins = parse(listing);
  const cend = end !== null ? end : consts.code_end; ins = ins.filter((d) => d.addr < cend);
  const ctx = new Ctx(cc, names); ctx.tempbase = tempbase;
  if (pre) { ctx.prekinds = pre.vars; ctx.prearrays = pre.arrays; ctx.dims = new Map(pre.dims); }
  const x = new Xl(ins, ctx); x.run();
  // ---- write
  const L = ['```basic'];
  for (const [a, t] of x.out) L.push(t.endsWith(':') ? t : fmt('%05X  %s', a, t));
  L.push('```');
  const body = L.join('\n');
  const nget = (k, dflt) => (names.has(k) ? names.get(k) : dflt);
  const V = ['| address | kinds (uses) | name | evidence |', '|---|---|---|---|'];
  for (const a of [...ctx.vars.keys()].sort((p, q) => p - q)) {
    if (cc.str.has(a) || cc.num.has(a) || a === 0x1A) continue;
    const kinds = ctx.vars.get(a).most_common().map(([k, v]) => fmt('%s x%d', k, v)).join(', ');
    let nm = nget(fmt('%04X', a), ''); let ev = nget(fmt('%04X_why', a), '');
    if (!truthy(nm) && ctx.folded.has(a)) {
      const [b, i, n2] = ctx.folded.get(a); nm = n2; const es = ctx.ranges.filter((r) => r[0] === b)[0][2];
      ev = truthy(ev) ? ev : fmt('element %d of the array at 0x%04X (0x%04X + %d*%d): constant index folded into a direct operand by the compiler', i, b, b, es, i);
    }
    V.push(fmt('| 0x%04X | %s | %s | %s |', a, kinds, nm, ev));
  }
  const A = ['| base | element size / kinds (uses) | name | evidence |', '|---|---|---|---|'];
  for (const b of [...ctx.arrays.keys()].sort((p, q) => p - q)) {
    let kinds = ctx.arrays.get(b).most_common().map(([k, v]) => fmt('%s x%d', k, v)).join(', ');
    const rng = ctx.ranges.filter((r) => r[0] === b);
    if (rng.length) kinds += (kinds ? ', ' : '') + fmt('%d elements (0..%d)', rng[0][1], rng[0][1] - 1);
    if (ctx.dims.has(b)) kinds += fmt(', 2-D (first dimension %d)', ctx.dims.get(b));
    A.push(fmt('| 0x%04X | %s | %s | %s |', b, kinds, nget(fmt('A%04X', b), ''), nget(fmt('A%04X_why', b), '')));
  }
  const U = ['| routine | uses | sites |', '|---|---|---|'];
  for (const [rtn, cnt] of ctx.unknown.most_common()) U.push(fmt('| %s | %d | %s |', rtn, cnt, ctx.unknown_sites.get(rtn).slice(0, 12).map((s) => fmt('%04X', s)).join(' ')));
  const SUBS = ['| sub | calls | role |', '|---|---|---|'];
  for (const [t, cnt] of [...x.calls.entries()].sort((p, q) => p[0] - q[0])) SUBS.push(fmt('| SUB_%04X | %d | %s |', t, cnt, nget(fmt('SUB%04X', t), '')));
  const vars = {
    vars: new Map([...ctx.vars].map(([a, v]) => [fmt('%04X', a), v])),
    arrays: new Map([...ctx.arrays].map(([b, v]) => [fmt('%04X', b), v])),
    dims: new Map(ctx.dims),
  };
  const text = [header !== null ? rstrip(header, '\n') : fmt('<!-- generated by qb2bas.py; edit %s_header.md for prose -->', title), '', '## Pseudocode', '', body, '',
    '## Subroutines (near CALL targets)', '', ...SUBS, '', '## Variables', '',
    fmt('Addresses are DS offsets. kinds: N = 4-byte single, S = string descriptor, I = integer, P = array/untyped (PUT/BLOAD target). Names come from `%s_names.json` (evidence column = why).', title),
    ...V, '', '### Arrays (indexed access base addresses)', '', ...A, '', '## Unknowns (runtime calls not rendered)', '', ...U, ''].join('\n');
  return { text, vars };
}

/** the committed <MOD>.bas.md: two passes from a clean state (pass 2 reads the variable kinds and 2-D strides of pass 1) */
export function qb2basTwoPass(listing, consts, names, opts = {}) {
  const p1 = qb2bas(listing, consts, names, { ...opts, pre: null });
  return qb2bas(listing, consts, names, { ...opts, pre: p1.vars }).text;
}
