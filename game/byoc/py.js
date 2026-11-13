const WS = ' \t\n\r\x0b\x0c\x1c\x1d\x1e\x1f\x85\xa0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000';
const isWs = (ch) => WS.includes(ch);

export function strip(s, chars) {
  const w = chars === undefined ? isWs : (c) => chars.includes(c);
  let i = 0, j = s.length;
  while (i < j && w(s[i])) i++;
  while (j > i && w(s[j - 1])) j--;
  return s.slice(i, j);
}
export function lstrip(s, chars) {
  const w = chars === undefined ? isWs : (c) => chars.includes(c);
  let i = 0;
  while (i < s.length && w(s[i])) i++;
  return s.slice(i);
}
export function rstrip(s, chars) {
  const w = chars === undefined ? isWs : (c) => chars.includes(c);
  let j = s.length;
  while (j > 0 && w(s[j - 1])) j--;
  return s.slice(0, j);
}
export function split(s, maxsplit = -1) {
  const out = []; let i = 0;
  const n = s.length;
  while (true) {
    while (i < n && isWs(s[i])) i++;
    if (i >= n) break;
    if (maxsplit >= 0 && out.length === maxsplit) { out.push(rstrip(s.slice(i))); break; }
    let j = i;
    while (j < n && !isWs(s[j])) j++;
    out.push(s.slice(i, j)); i = j;
  }
  return out;
}
export const isdigit = (s) => s.length > 0 && /^[0-9\xb2\xb3\xb9]+$/.test(s);

function reprStr(s) {
  const q = s.includes("'") && !s.includes('"') ? '"' : "'";
  let o = q;
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (ch === '\\') o += '\\\\';
    else if (ch === q) o += '\\' + q;
    else if (ch === '\t') o += '\\t';
    else if (ch === '\n') o += '\\n';
    else if (ch === '\r') o += '\\r';
    else if (c < 0x20 || (c >= 0x7f && c <= 0xa0) || c === 0xad) o += '\\x' + c.toString(16).padStart(2, '0');
    else o += ch;
  }
  return o + q;
}
export function repr(x) {
  if (x === null || x === undefined) return 'None';
  if (x === true) return 'True';
  if (x === false) return 'False';
  if (typeof x === 'string') return reprStr(x);
  if (typeof x === 'number') return String(x);
  if (Array.isArray(x)) return x.length === 1 ? '(' + repr(x[0]) + ',)' : '(' + x.map(repr).join(', ') + ')';
  throw new Error('repr: unsupported ' + typeof x);
}
export function ps(x) {
  if (typeof x === 'string') return x;
  if (typeof x === 'number') return Number.isInteger(x) ? String(x) : String(x);
  return repr(x);
}

function exactDigits(x) {
  const buf = new DataView(new ArrayBuffer(8)); buf.setFloat64(0, x);
  const hi = buf.getUint32(0), lo = buf.getUint32(4);
  const be = (hi >>> 20) & 0x7ff;
  let mant = (BigInt(hi & 0xfffff) << 32n) | BigInt(lo);
  let e2;
  if (be === 0) e2 = -1074; else { mant |= 1n << 52n; e2 = be - 1075; }
  let digits, pointPos;
  if (e2 >= 0) { digits = (mant << BigInt(e2)).toString(); pointPos = digits.length; }
  else { digits = (mant * 5n ** BigInt(-e2)).toString(); pointPos = digits.length + e2; }
  const lead = digits.search(/[1-9]/);
  digits = digits.slice(lead); pointPos -= lead;
  return [digits.replace(/0+$/, '') || '0', pointPos - 1];
}
function roundDigits(x, p) {
  let [d, e] = exactDigits(x);
  if (d.length <= p) return [d.padEnd(p, '0'), e];
  const head = d.slice(0, p), rest = d.slice(p);
  let up = rest[0] > '5' || (rest[0] === '5' && (/[1-9]/.test(rest.slice(1)) || (Number(head[p - 1]) & 1) === 1));
  if (!up) return [head, e];
  let r = (BigInt(head) + 1n).toString();
  if (r.length > p) { r = r.slice(0, p); e += 1; }
  return [r, e];
}
export function g(x, p = 6, alt = false) {
  if (Number.isNaN(x)) return 'nan';
  if (!Number.isFinite(x)) return x < 0 ? '-inf' : 'inf';
  if (p === 0) p = 1;
  const neg = x < 0 || Object.is(x, -0);
  const ax = Math.abs(x);
  if (ax === 0) return (neg ? '-' : '') + '0';
  const [d, e] = roundDigits(ax, p);
  let s;
  if (e < -4 || e >= p) {
    let m = d[0] + '.' + d.slice(1);
    if (!alt) m = m.replace(/0+$/, '').replace(/\.$/, '');
    s = m + 'e' + (e < 0 ? '-' : '+') + String(Math.abs(e)).padStart(2, '0');
  } else if (e >= 0) {
    s = d.slice(0, e + 1) + '.' + d.slice(e + 1);
    if (!alt) s = s.replace(/0+$/, '').replace(/\.$/, '');
  } else {
    s = '0.' + '0'.repeat(-e - 1) + d;
    if (!alt) s = s.replace(/0+$/, '').replace(/\.$/, '');
  }
  return (neg ? '-' : '') + s;
}

const SPEC = /%([-0 +#]*)(\d+|\*)?(?:\.(\d+))?([sdixXrgc%])/g;
export function fmt(f, ...args) {
  let k = 0;
  return f.replace(SPEC, (m, flags, width, prec, conv) => {
    if (conv === '%') return '%';
    if (width === '*') width = String(args[k++]);
    const a = args[k++];
    if (a === undefined) throw new Error('fmt: not enough arguments for ' + f);
    let s;
    switch (conv) {
      case 's': s = ps(a); if (prec !== undefined) s = s.slice(0, Number(prec)); break;
      case 'r': s = repr(a); break;
      case 'c': s = typeof a === 'number' ? String.fromCharCode(a) : a; break;
      case 'd': case 'i': { const v = Math.trunc(a); s = String(Math.abs(v)); if (v < 0) s = '-' + s; else if (flags.includes('+')) s = '+' + s; break; }
      case 'x': case 'X': { const v = Math.trunc(a); s = Math.abs(v).toString(16); if (conv === 'X') s = s.toUpperCase(); if (flags.includes('#')) s = (conv === 'X' ? '0X' : '0x') + s; if (v < 0) s = '-' + s; break; }
      case 'g': s = g(a, prec === undefined ? 6 : Number(prec), flags.includes('#')); break;
    }
    if (width !== undefined && s.length < Number(width)) {
      const w = Number(width);
      if (flags.includes('-')) s = s.padEnd(w);
      else if (flags.includes('0') && conv !== 's' && conv !== 'r') {
        const sign = /^[-+]/.test(s) ? s[0] : '';
        s = sign + s.slice(sign.length).padStart(w - sign.length, '0');
      } else s = s.padStart(w);
    }
    return s;
  });
}

function dumpStr(s) {
  return JSON.stringify(s).replace(/[\u007f-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}
function dumpNum(x) {
  if (Number.isInteger(x)) return String(x);
  throw new Error('dumps: float formatting not needed by the pipeline');
}
export function dumps(x, { sep = ', ', kv = ': ' } = {}) {
  if (x === null || x === undefined) return 'null';
  if (x === true) return 'true';
  if (x === false) return 'false';
  if (typeof x === 'string') return dumpStr(x);
  if (typeof x === 'number') return dumpNum(x);
  if (Array.isArray(x)) return '[' + x.map((v) => dumps(v, { sep, kv })).join(sep) + ']';
  const ent = x instanceof Map ? [...x.entries()] : Object.entries(x);
  return '{' + ent.map(([k, v]) => dumpStr(String(k)) + kv + dumps(v, { sep, kv })).join(sep) + '}';
}

export function loads(text) {
  let i = 0;
  const ws = () => { while (i < text.length && ' \t\n\r'.includes(text[i])) i++; };
  const val = () => {
    ws();
    const c = text[i];
    if (c === '{') {
      i++; const m = new Map(); ws();
      if (text[i] === '}') { i++; return m; }
      for (;;) {
        ws(); const k = str(); ws();
        if (text[i++] !== ':') throw new SyntaxError('json: expected : at ' + i);
        m.set(k, val()); ws();
        const d = text[i++];
        if (d === '}') return m;
        if (d !== ',') throw new SyntaxError('json: expected , at ' + i);
      }
    }
    if (c === '[') {
      i++; const a = []; ws();
      if (text[i] === ']') { i++; return a; }
      for (;;) {
        a.push(val()); ws();
        const d = text[i++];
        if (d === ']') return a;
        if (d !== ',') throw new SyntaxError('json: expected , at ' + i);
      }
    }
    if (c === '"') return str();
    const m = /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|NaN|-?Infinity)/.exec(text.slice(i, i + 400));
    if (!m) throw new SyntaxError('json: bad value at ' + i);
    i += m[0].length;
    if (m[0] === 'true') return true;
    if (m[0] === 'false') return false;
    if (m[0] === 'null') return null;
    return Number(m[0]);
  };
  const str = () => {
    if (text[i] !== '"') throw new SyntaxError('json: expected string at ' + i);
    let j = i + 1;
    while (text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
    const s = JSON.parse(text.slice(i, j + 1)); i = j + 1; return s;
  };
  const v = val(); ws();
  if (i < text.length) throw new SyntaxError('json: trailing data at ' + i);
  return v;
}

export class Counter extends Map {
  inc(k, n = 1) { this.set(k, (this.get(k) || 0) + n); }
  most_common() { return [...this.entries()].map((e, i) => [e, i]).sort((a, b) => b[0][1] - a[0][1] || a[1] - b[1]).map((x) => x[0]); }
}

export function dget(m, k, mk) {
  let v = m.get(k);
  if (v === undefined) { v = mk(); m.set(k, v); }
  return v;
}
