// runtime.js — INSIDE additions to the generated-module BASIC runtime (basic.js, copied from game/modules/space).
// Owner: build-engine (INSIDE port). What INSIDE needs beyond SPACE (INSIDE.bas.md header "Data formats"):
//  - LINE INPUT # / EOF (MES-n room texts, SUB_6473) and exact INPUT # fields: engine data.js InputReader;
//  - BSAVE of BLOADed memory: IN-n.BAS (InMap%, &H48B0, 5502 bytes) and INMAP-n.BAS (MapPic, &H5E2E, 8700) are
//    written back when the squad leaves (SUB_6387) and read again on the next visit (SUB_63F9);
//  - GET into an array that lives in BLOADed memory (GET (8,7)-(192,191), MapPic at 13E1) writes real SCREEN 1
//    GET-array bytes there, so the BSAVEd INMAP-n file has the original format (DOSBox-interchangeable);
//  - PUT from BLOADed memory: the atlas sprite while the region still holds the shipped file's bytes (keeps the
//    data-driven art path), else the bytes in memory (a game-written INMAP-n, or a GET into MapPic);
//  - COLOR (0E21).
// INSIDE's DEF FNs are inlined by bas2js.py (FNCrew/FNIdx base 1500, FNRoom/FNRoomIdx/FNCell over InMap%).

import { BasicRT, dosName, cint } from './basic.js';
import { InputReader } from '../../engine/data.js';
import { BANK_OFFSETS } from './banks.js';

export * from './basic.js';

export class InsideRT extends BasicRT {
  constructor(E, opts) {
    super(E, opts);
    this.readers = new Map();
    // COMMON scalars beyond G!() (generated COMMON_VARS: name -> DS address, e.g. X! 0x48A0) live in a store
    // shared across CHAIN, keyed by DS address (the COMMON block is one memory area in every module)
    const cv = this.constructor.COMMON_VARS || {};
    const store = E.commonScalars ?? (E.commonScalars = new Map());
    const local = this.V;
    this.V = new Proxy({}, {
      get: (o, k) => (k in cv ? (store.has(cv[k]) ? store.get(cv[k]) : 0) : local[k]),
      set: (o, k, v) => { if (k in cv) store.set(cv[k], v); else local[k] = v; return true; },
    });
  }

  get fs() { return this.E.files ?? this.E.state?.files; }

  // ---- files
  // OPEN adds no extension (unlike BLOAD): "MES-3", "NAME", "CHARNAME"
  async open(name, n) { this.readers.set(n, new InputReader(await this.fs.read(fileName(name)))); }
  close(n) { this.readers.delete(n); }
  reader(n) { const r = this.readers.get(n); if (!r) throw new Error(`Bad file number ${n}`); return r; }
  inputField(n, isStr) { return isStr ? this.reader(n).str() : this.reader(n).num(); }
  lineInput(n) { return this.reader(n).line(); }
  eof(n) { return this.reader(n).eof() ? -1 : 0; }

  color(a, b) { this.E.text.color(a, b); }
  csrlin() { return this.E.text.row; }                  // CSRLIN (line editor SUB_157D, 01594)
  cursor(visible, start, stop) { this.E.text.cursor?.(visible, start, stop); }   // LOCATE ,,cursor,start,stop

  // ---- BLOAD / BSAVE of module memory
  async bload(name, base) {
    const fname = dosName(name);
    if (fname === 'CHARINFO.BAS' && this.E.state?.load) { await this.E.state.load(); return; }
    const b = await this.fs.bload(fname);
    const bytes = b.body.slice();                     // private copy: W16 must not touch the file store
    const pristine = !this.fs.saved?.(fname);         // shipped bytes -> PUT may use the atlas
    this.regions.set(base, { base, name: fname, bytes, len: bytes.length, pristine });
  }

  bsave(name, base, length) {
    const r = this.regionAt(base);
    if (!r || !r.bytes) throw new Error(`BSAVE ${name}: no memory at DS 0x${base.toString(16)}`);
    const o = base - r.base;
    const body = new Uint8Array(length);
    body.set(r.bytes.subarray(o, o + length));
    this.fs.bsave(dosName(name), body, 0, base);
  }

  wmem16(base, i, v) { super.wmem16(base, i, v); const r = this.regionAt(base); if (r) r.pristine = false; }

  // ---- GET / PUT with BLOADed memory
  get(x1, y1, x2, y2, name) {
    const addr = this.addrOf(name);
    const r = addr !== null ? this.regionAt(addr) : null;
    if (!r || !r.bytes) return super.get(x1, y1, x2, y2, name);
    // SCREEN 1 GET array: w = width in bits (2 per pixel), h, rows of (w+7)/8 bytes, MSB = leftmost pixel
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];
    const pw = x2 - x1 + 1, h = y2 - y1 + 1, wb = 2 * pw, rowb = (wb + 7) >> 3;
    const o = addr - r.base, fb = this.E.fb;
    if (o + 4 + rowb * h > r.bytes.length) throw new Error(`GET ${name}: array too small`);
    const m = r.bytes;
    m[o] = wb & 255; m[o + 1] = wb >> 8; m[o + 2] = h & 255; m[o + 3] = h >> 8;
    for (let y = 0; y < h; y++) {
      const ro = o + 4 + y * rowb;
      m.fill(0, ro, ro + rowb);
      for (let x = 0; x < pw; x++) m[ro + (x >> 2)] |= (fb.point(x1 + x, y1 + y) & 3) << (6 - 2 * (x & 3));
    }
    r.pristine = false;
    delete this.bufs[name];
  }

  put(x, y, name, addr, verb) {
    if (addr === null || addr === undefined) addr = this.addrOf(name);
    const r = addr !== null && addr !== undefined ? this.regionAt(addr) : null;
    if (r && r.bytes && !r.pristine) return this.E.sprites.put(x, y, this.decodeCga(r, addr), verb);
    if (r && r.pristine) {
      const offs = BANK_OFFSETS[r.name];
      if (offs && offs.indexOf(addr - r.base + 7) >= 0) return this.E.sprites.put(x, y, { bank: r.name, index: offs.indexOf(addr - r.base + 7) }, verb);
      if (r.bytes) return this.E.sprites.put(x, y, this.decodeCga(r, addr), verb);
    }
    return super.put(x, y, name, addr, verb);
  }

  // image object (engine sprites.js shape) from a SCREEN 1 GET array in memory, at the framebuffer scale
  decodeCga(r, addr) {
    const m = r.bytes, o = addr - r.base;
    const wb = m[o] | (m[o + 1] << 8), h = m[o + 2] | (m[o + 3] << 8), pw = wb >> 1, rowb = (wb + 7) >> 3;
    const S = this.E.fb.S, pix = new Uint8Array(pw * S * h * S);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < pw; x++) {
        const v = (m[o + 4 + y * rowb + (x >> 2)] >> (6 - 2 * (x & 3))) & 3;
        for (let j = 0; j < S; j++) pix.fill(v, ((y * S + j) * pw + x) * S, ((y * S + j) * pw + x) * S + S);
      }
    }
    return { w: pw, h, S, mask: 3, pix };
  }

  addrOf(name) { return this.constructor.ADDR?.[name] ?? null; }
}

const fileName = (name) => String(name).toUpperCase().replace(/^[A-Z]:/, '').trim();

export { cint };
