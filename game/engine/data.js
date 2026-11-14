import { dosName } from './files.js';

export const charNameText = (names) => names.map((n) => `${String(n ?? '').replace(/[",]/g, '')},`).join('');

export class InputReader {
  constructor(bytes) {
    const z = bytes.indexOf(0x1a);
    this.b = z < 0 ? bytes : bytes.subarray(0, z);
    this.p = 0;
  }

  eof() { return this.p >= this.b.length; }

  delim() {
    const b = this.b;
    if (b[this.p] === 44) this.p++;
    else if (b[this.p] === 13 && b[this.p + 1] === 10) this.p += 2;
    else if (b[this.p] === 13 || b[this.p] === 10) this.p++;
  }

  text(a, z) { let s = ''; for (let i = a; i < z; i++) s += String.fromCharCode(this.b[i]); return s; }

  str() {
    if (this.eof()) throw new Error('Input past end of file');
    const b = this.b;
    while (this.p < b.length && (b[this.p] === 32 || b[this.p] === 9)) this.p++;
    let s;
    if (b[this.p] === 34) {
      let q = b.indexOf(34, this.p + 1);
      if (q < 0) q = b.length;
      s = this.text(this.p + 1, q);
      this.p = q + 1;
      while (this.p < b.length && b[this.p] !== 44 && b[this.p] !== 13 && b[this.p] !== 10) this.p++;
    } else {
      let q = this.p;
      while (q < b.length && b[q] !== 44 && b[q] !== 13 && b[q] !== 10) q++;
      s = this.text(this.p, q);
      this.p = q;
    }
    this.delim();
    return s;
  }

  num() {
    if (this.eof()) throw new Error('Input past end of file');
    const b = this.b;
    while (this.p < b.length && (b[this.p] === 32 || b[this.p] === 9 || b[this.p] === 13 || b[this.p] === 10)) this.p++;
    let q = this.p;
    while (q < b.length && b[q] !== 32 && b[q] !== 44 && b[q] !== 13 && b[q] !== 10) q++;
    const tok = this.text(this.p, q);
    this.p = q;
    while (this.p < b.length && (b[this.p] === 32 || b[this.p] === 9)) this.p++;
    this.delim();
    const v = parseFloat(tok.replace(/[dD]/, 'e'));
    return Number.isNaN(v) ? 0 : Math.fround(v);
  }

  line() {
    if (this.eof()) throw new Error('Input past end of file');
    const b = this.b;
    let q = this.p;
    while (q < b.length && b[q] !== 13) q++;
    const s = this.text(this.p, q);
    this.p = q;
    if (b[this.p] === 13) this.p++;
    if (b[this.p] === 10) this.p++;
    return s;
  }
}

export class Data {
  constructor(files, { base = 'assets/data/' } = {}) {
    this.files = files;
    this.base = base;
    this.cache = new Map();
  }

  async table(name) {
    const key = dosName(name).replace(/\.BAS$/, '');
    if (!this.cache.has(key)) {
      let p;
      if (this.files.baseDir) {
        const { readFileSync } = await import('node:fs');
        p = Promise.resolve(JSON.parse(readFileSync(`${this.files.baseDir}/../data/${key}.json`, 'utf8')));
      } else p = fetch(`${this.base}${encodeURIComponent(key)}.json`).then((r) => { if (!r.ok) throw new Error(`no table ${key}`); return r.json(); });
      this.cache.set(key, p);
    }
    return this.cache.get(key);
  }

  async open(name) { return new InputReader(await this.files.read(name)); }

  async nameFields(count = 375) {
    const f = await this.open('NAME');
    const out = [];
    for (let i = 0; i < count && !f.eof(); i++) out.push(f.str());
    return out;
  }

  async charName(count = 9) {
    const f = await this.open('CHARNAME');
    const out = [];
    for (let i = 0; i < count; i++) out.push(f.eof() ? '' : f.str());
    return out;
  }

  writeText(name, text) { this.files.writeText(name, text.endsWith('\x1a') ? text : `${text}\x1a`); }
}
