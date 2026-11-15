import { TEXT, BIN_MBF, BIN_INT, DISK_FILES } from './lists.js';
import { dumps, utf8, PyFloat } from './pyjson.js';

const latin1 = (b) => { let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return s; };
const fixes = [[/\bcoridor\b/gi, (s) => s.slice(0, 3) + s[2] + s.slice(3)]];
const textBytes = (b) => {
  const s = latin1(b), t = fixes.reduce((s, [re, to]) => s.replace(re, to), s);
  return t === s ? b : Uint8Array.from(t, (c) => c.charCodeAt(0));
};
const pyInt = (v) => (v === Math.trunc(v) ? (Object.is(v, -0) ? 0 : v) : v);

const FLOAT_RE = /^[+-]?(?:(?:\d(?:_?\d)*)?\.\d(?:_?\d)*|\d(?:_?\d)*\.?)(?:[eE][+-]?\d(?:_?\d)*)?$/;
function pyFloat(tok) {
  const t = tok.replace(/^[ \t\n\r\x0b\x0c]+|[ \t\n\r\x0b\x0c]+$/g, '');
  if (FLOAT_RE.test(t)) return Number(t.replace(/_/g, ''));
  const m = /^([+-]?)(inf|infinity|nan)$/i.exec(t);
  if (m) return /nan/i.test(m[2]) ? NaN : (m[1] === '-' ? -Infinity : Infinity);
  return null;
}

export class InputReader {
  constructor(data) {
    const end = data.indexOf(0x1a);
    this.b = end < 0 ? data : data.subarray(0, end);
    this.p = 0;
  }

  eof() { return this.p >= this.b.length; }

  delim() {
    const b = this.b;
    if (this.p < b.length && b[this.p] === 44) this.p += 1;
    else if (b[this.p] === 13 && b[this.p + 1] === 10) this.p += 2;
    else if (this.p < b.length && (b[this.p] === 13 || b[this.p] === 10)) this.p += 1;
  }

  str() {
    const b = this.b;
    while (this.p < b.length && (b[this.p] === 32 || b[this.p] === 9)) this.p++;
    let s;
    if (this.p < b.length && b[this.p] === 34) {
      let q = b.indexOf(34, this.p + 1);
      if (q < 0) q = b.length;
      s = b.subarray(this.p + 1, q);
      this.p = q + 1;
      while (this.p < b.length && b[this.p] !== 44 && b[this.p] !== 13 && b[this.p] !== 10) this.p++;
    } else {
      let q = this.p;
      while (q < b.length && b[q] !== 44 && b[q] !== 13 && b[q] !== 10) q++;
      s = b.subarray(this.p, q);
      this.p = q;
    }
    this.delim();
    return latin1(s);
  }

  num() {
    const b = this.b;
    while (this.p < b.length && (b[this.p] === 32 || b[this.p] === 9 || b[this.p] === 13 || b[this.p] === 10)) this.p++;
    let q = this.p;
    while (q < b.length && b[q] !== 32 && b[q] !== 44 && b[q] !== 13 && b[q] !== 10) q++;
    const tok = latin1(b.subarray(this.p, q));
    this.p = q;
    while (this.p < b.length && (b[this.p] === 32 || b[this.p] === 9)) this.p++;
    this.delim();
    const v = tok ? pyFloat(tok.replace(/D/g, 'E').replace(/d/g, 'e')) : 0;
    return pyInt(v === null ? 0 : v);
  }

  skipBlankLines() { while (!this.eof() && (this.b[this.p] === 32 || this.b[this.p] === 13 || this.b[this.p] === 10)) this.p++; }
}

export function mbf(b, o) {
  const e = b[o + 3];
  if (e === 0) return new PyFloat(0);
  const s = b[o + 2] & 0x80 ? -1 : 1;
  const m = ((b[o + 2] & 0x7f) << 16) | (b[o + 1] << 8) | b[o];
  return pyInt(s * (1 + m / 0x800000) * 2 ** (e - 129));
}

export function bsaveBody(data) {
  if (data[0] !== 0xfd) throw new Error('not a BSAVE image');
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const len = dv.getUint16(5, true);
  return [{ seg: dv.getUint16(1, true), off: dv.getUint16(3, true), len }, data.subarray(7, 7 + len)];
}

export function convertText(name, data) {
  const r = new InputReader(textBytes(data));
  const rep = (n, f) => Array.from({ length: n }, f);
  if (name === 'NAME' || name === 'CHARNAME') {
    const fields = [];
    while (!r.eof()) fields.push(r.str());
    return { fields };
  }
  if (name === 'ENCINFO' || name === 'ENCLIST') {
    const records = [];
    while (!r.eof()) {
      const nm = r.str();
      records.push(name === 'ENCINFO' ? { name: nm, c: rep(27, () => r.num()) } : { name: nm, n: rep(3, () => r.num()) });
    }
    return { records };
  }
  if (name === 'ENCTABLE') {
    const rows = [];
    while (!r.eof()) { rows.push(rep(25, () => r.num())); r.skipBlankLines(); }
    return { rows };
  }
  if (name === 'MISSION') {
    const records = [];
    while (!r.eof()) {
      const text = [r.str(), r.str()];
      records.push({ text, n: rep(15, () => r.num()) });
      r.skipBlankLines();
    }
    return { records };
  }
  if (name.startsWith('MES-')) {
    const lines = latin1(r.b).split('\r\n');
    if (lines.length && lines[lines.length - 1] === '') lines.pop();
    return { lines };
  }
  throw new Error(name);
}

export function convertFile(name, data) {
  let obj;
  if (TEXT.includes(name)) obj = convertText(name, data);
  else if (BIN_MBF.includes(name)) {
    const [bsave, body] = bsaveBody(data);
    obj = { bsave, values: Array.from({ length: body.length >> 2 }, (_, i) => mbf(body, 4 * i)) };
  } else if (BIN_INT.includes(name)) {
    const [bsave, body] = bsaveBody(data);
    const dv = new DataView(body.buffer, body.byteOffset, body.byteLength);
    obj = { bsave, values: Array.from({ length: body.length >> 1 }, (_, i) => dv.getInt16(2 * i, true)) };
  } else return null;
  obj.source = name;
  return obj;
}

export const tableStem = (name) => (name.endsWith('.BAS') ? name.slice(0, name.lastIndexOf('.')) : name);

export function* convertData(read) {
  for (const name of DISK_FILES) {
    const b = read(name), data = TEXT.includes(name) ? textBytes(b) : b;
    yield { path: `files/${name}`, bytes: data };
    const obj = convertFile(name, data);
    if (obj) yield { path: `data/${tableStem(name)}.json`, bytes: utf8(dumps(obj, { separators: [',', ':'], ensureAscii: false })), table: obj };
  }
}
