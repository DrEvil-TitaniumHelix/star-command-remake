import { Files } from './files.js';

export const G_SIZE = 2601;
export const COMMON_DS = 0x1850;

const f32buf = new DataView(new ArrayBuffer(4));

export function mbfToFloat(b, o = 0) {
  const e = b[o + 3];
  if (e === 0) return 0;
  const s = b[o + 2] & 0x80;
  const m = ((b[o + 2] & 0x7f) << 16) | (b[o + 1] << 8) | b[o];
  if (e <= 2) return (s ? -1 : 1) * (1 + m / 0x800000) * 2 ** (e - 129);
  f32buf.setUint32(0, ((s << 24) | ((e - 2) << 23) | m) >>> 0, true);
  return f32buf.getFloat32(0, true);
}

export function floatToMbf(v, out, o = 0) {
  f32buf.setFloat32(0, v, true);
  const bits = f32buf.getUint32(0, true);
  const s = bits >>> 31, ei = (bits >>> 23) & 0xff, m = bits & 0x7fffff;
  if (ei === 0) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0; return; }
  if (ei + 2 > 255) throw new Error('Overflow');
  out[o] = m & 0xff; out[o + 1] = (m >> 8) & 0xff; out[o + 2] = ((m >> 16) & 0x7f) | (s << 7); out[o + 3] = ei + 2;
}

export class State {
  constructor(files = new Files(), gmap = null) {
    this.files = files;
    this.G = new Float32Array(G_SIZE);
    this.strings = new Map();
    this.header = { seg: 0x0b73, off: COMMON_DS };
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
