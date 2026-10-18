// state.js — the COMMON block: G!() = A() (2601 singles, the whole save game), the 20 COMMON string arrays,
// and CHARINFO.BAS load/save in the original BSAVE layout (MBF singles) so the shipped save and DOSBox saves
// interoperate. CROSSREF.md §2; DATA_FILES.md §B (CHARINFO.BAS = BSAVE 0B73:1850 len 10404 = 2601 MBF singles).
//
//   state.G[2200]            G!(2200)      (Float32Array: values are single precision like the original)
//   state.v.Fuel             same, by the CROSSREF name (assets/gmap.json "scalars"; "!" dropped)
//   state.crew(m, f)         G!(1300 + 100*m + f)       state.setCrew(m, f, x)
//   state.str('Rank$')       the COMMON string array (a JS array, created on first use, survives CHAIN)
//   await state.load()       BLOAD "CHARINFO.BAS", &H1850     state.save()  BSAVE "CHARINFO", &H1850, 10404

import { Files } from './files.js';

export const G_SIZE = 2601;
export const COMMON_DS = 0x1850;

// ---- Microsoft Binary Format single <-> IEEE single ----
// MBF (little endian): m0 m1 [s|m2(7)] e ; value = (-1)^s * 1.m * 2^(e-129), e = 0 -> 0.
// IEEE: [s|e(8)|m(23)], value = 1.m * 2^(e-127). Same 23-bit mantissa, exponent differs by 2.
const f32buf = new DataView(new ArrayBuffer(4));

export function mbfToFloat(b, o = 0) {
  const e = b[o + 3];
  if (e === 0) return 0;
  const s = b[o + 2] & 0x80;
  const m = ((b[o + 2] & 0x7f) << 16) | (b[o + 1] << 8) | b[o];
  if (e <= 2) return (s ? -1 : 1) * (1 + m / 0x800000) * 2 ** (e - 129);   // below IEEE normal range
  f32buf.setUint32(0, ((s << 24) | ((e - 2) << 23) | m) >>> 0, true);
  return f32buf.getFloat32(0, true);
}

export function floatToMbf(v, out, o = 0) {
  f32buf.setFloat32(0, v, true);
  const bits = f32buf.getUint32(0, true);
  const s = bits >>> 31, ei = (bits >>> 23) & 0xff, m = bits & 0x7fffff;
  if (ei === 0) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0; return; }   // zero / IEEE denormal -> 0
  if (ei + 2 > 255) throw new Error('Overflow');
  out[o] = m & 0xff; out[o + 1] = (m >> 8) & 0xff; out[o + 2] = ((m >> 16) & 0x7f) | (s << 7); out[o + 3] = ei + 2;
}

export class State {
  constructor(files = new Files(), gmap = null) {
    this.files = files;
    this.G = new Float32Array(G_SIZE);
    this.strings = new Map();
    this.header = { seg: 0x0b73, off: COMMON_DS };   // the shipped file's BSAVE header (seg is irrelevant to BLOAD)
    this.gmap = gmap;
    const self = this;
    this.v = new Proxy({}, {
      get(_, k) { return self.G[self.index(k)]; },
      set(_, k, val) { self.G[self.index(k)] = val; return true; },
      has(_, k) { return !!(self.gmap && k in self.gmap.scalars); },
    });
  }

  index(name) {
    const i = this.gmap?.scalars?.[String(name).replace(/!$/, '')];
    if (i === undefined) throw new Error(`state.v.${String(name)}: no such name in gmap.json`);
    return i;
  }

  crew(m, f) { return this.G[1300 + 100 * m + f]; }
  setCrew(m, f, x) { this.G[1300 + 100 * m + f] = x; }

  str(name) {
    if (!this.strings.has(name)) this.strings.set(name, []);
    return this.strings.get(name);
  }

  // G!() <-> CHARINFO body bytes.
  // Elements whose value is unchanged since load are written back with their loaded bytes: the shipped save
  // holds non-canonical MBF zeros (G!(330..339) = `00 00 20 00`, exponent 0 = value 0 with mantissa bits set),
  // which a value conversion would normalise to `00 00 00 00`. This keeps load/save byte-identical.
  fromBytes(body) {
    if (body.length < G_SIZE * 4) throw new Error(`CHARINFO body ${body.length} bytes < ${G_SIZE * 4}`);
    for (let i = 0; i < G_SIZE; i++) this.G[i] = mbfToFloat(body, 4 * i);
    this.loadedBytes = body.slice(0, G_SIZE * 4);
    this.loadedG = this.G.slice();
  }

  toBytes() {
    const body = new Uint8Array(G_SIZE * 4);
    for (let i = 0; i < G_SIZE; i++) {
      if (this.loadedG && Object.is(this.G[i], this.loadedG[i])) body.set(this.loadedBytes.subarray(4 * i, 4 * i + 4), 4 * i);
      else floatToMbf(this.G[i], body, 4 * i);
    }
    return body;
  }

  async load(name = 'CHARINFO.BAS') {
    const { seg, off, body } = await this.files.bload(name);
    this.header = { seg, off };
    this.fromBytes(body);
  }

  save(name = 'CHARINFO.BAS') { this.files.bsave(name, this.toBytes(), this.header.seg, this.header.off); }
}
