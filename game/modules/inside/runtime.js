import { BasicRT, dosName, cint } from './basic.js';
import { InputReader } from '../../engine/data.js';
import { BANK_OFFSETS } from './banks.js';

export * from './basic.js';

export class InsideRT extends BasicRT {
  constructor(E, opts) {
    super(E, opts);
    this.readers = new Map();
    const cv = this.constructor.COMMON_VARS || {};
    const store = E.commonScalars ?? (E.commonScalars = new Map());
    const local = this.V;
    this.V = new Proxy({}, {
      get: (o, k) => (k in cv ? (store.has(cv[k]) ? store.get(cv[k]) : 0) : local[k]),
      set: (o, k, v) => { if (k in cv) store.set(cv[k], v); else local[k] = v; return true; },
    });
    if (E.display?.overlays && !E.sqDraw) E.display.overlays.push(E.sqDraw = (ctx) => {
      const k = E.sq; if (!k) return;
      ctx.save();
      for (const [c, w] of [['#000', 4], ['#ff55ff', 2]]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.strokeRect(k[0] * 2 - 3, k[1] * 2 - 3, 16, 16); }
      ctx.restore();
    });
  }

  get fs() { return this.E.files ?? this.E.state?.files; }

  async open(name, n) { this.readers.set(n, new InputReader(await this.fs.read(fileName(name)))); }
  close(n) { this.readers.delete(n); }
  reader(n) { const r = this.readers.get(n); if (!r) throw new Error(`Bad file number ${n}`); return r; }
  inputField(n, isStr) { return isStr ? this.reader(n).str() : this.reader(n).num(); }
  lineInput(n) { return this.reader(n).line(); }
  eof(n) { return this.reader(n).eof() ? -1 : 0; }

  color(a, b) { this.E.text.color(a, b); }
  csrlin() { return this.E.text.row; }
  cursor(visible, start, stop) { this.E.text.cursor?.(visible, start, stop); }

  async bload(name, base) {
    const fname = dosName(name);
    if (fname === 'CHARINFO.BAS' && this.E.state?.load) { await this.E.state.load(); return; }
    const b = await this.fs.bload(fname);
    const bytes = b.body.slice();
    const pristine = !this.fs.saved?.(fname);
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

  get(x1, y1, x2, y2, name) {
    const addr = this.addrOf(name);
    const r = addr !== null ? this.regionAt(addr) : null;
    if (!r || !r.bytes) return super.get(x1, y1, x2, y2, name);
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

  async frame() {
    const k = this.mk; this.mk = null;
    if (!k) return super.frame();
    const b = this.E.settings?.on('squadMarker') === true && !!this.E.sqDraw, t = this.mkOn === b;
    if (t) this.put0(...k);
    if (b) this.E.sq = k;
    await super.frame();
    this.E.sq = null;
    if (t) this.put0(...k);
  }

  put(x, y, name, addr, verb) {
    if (name === 'Tile42' && verb === 'XOR') { this.mkOn = !this.mkOn; this.mk = [x, y, name, addr, verb]; }
    return this.put0(x, y, name, addr, verb);
  }

  put0(x, y, name, addr, verb) {
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
