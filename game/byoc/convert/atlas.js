import { SPRITE_BANKS } from './lists.js';
import { dumps, utf8 } from './pyjson.js';

export const ATLAS_W = 1024;
export const EGA = [[0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170], [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
  [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255], [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255]];

export function decodeArray(b, pos, mode) {
  const w = b[pos] | (b[pos + 1] << 8), h = b[pos + 2] | (b[pos + 3] << 8), rowb = (w + 7) >> 3;
  const d = new Uint8Array(b.length - pos - 4 + 16);
  d.set(b.subarray(pos + 4));
  if (mode === 'cga') {
    const pw = w >> 1, pix = new Uint8Array(pw * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < pw; x++) pix[y * pw + x] = (d[y * rowb + (x >> 2)] >> (6 - 2 * (x & 3))) & 3;
    return [pw, h, pix];
  }
  const pix = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let k = 0; k < 4; k++) {
      const r = (y * 4 + k) * rowb;
      for (let x = 0; x < w; x++) if ((d[r + (x >> 3)] >> (7 - (x & 7))) & 1) pix[y * w + x] |= 1 << k;
    }
  }
  return [w, h, pix];
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
const crc32 = (bytes) => { let c = 0xffffffff; for (const v of bytes) c = CRC[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

const concat = (parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};

export async function indexedPng(w, h, pix, pal, deflate) {
  const raw = new Uint8Array(h * (w + 1));
  for (let y = 0; y < h; y++) raw.set(pix.subarray(y * w, (y + 1) * w), y * (w + 1) + 1);
  const hdr = new Uint8Array(13), dv = new DataView(hdr.buffer);
  dv.setUint32(0, w); dv.setUint32(4, h); hdr[8] = 8; hdr[9] = 3;
  return concat([Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a), chunk('IHDR', hdr), chunk('PLTE', Uint8Array.from(pal.flat())),
    chunk('IDAT', await deflate(raw)), chunk('IEND', new Uint8Array(0))]);
}

export async function buildAtlas(read, deflate) {
  const sprites = [];
  for (const bank of SPRITE_BANKS) {
    const data = read(bank.file);
    for (const [index, w, h, off] of bank.arrays) {
      const [pw, ph, pix] = decodeArray(data, off, bank.mode);
      if (pw !== w || ph !== h) throw new Error(`${bank.file}[${index}]: ${pw}x${ph}, index says ${w}x${h}`);
      sprites.push({ bank: bank.file, index, w, h, mode: bank.mode, pix });
    }
  }
  const order = sprites.map((_, i) => i).sort((a, b) => (sprites[b].h - sprites[a].h) || (sprites[b].w - sprites[a].w));
  let x = 0, y = 0, shelf = 0;
  for (const i of order) {
    const s = sprites[i];
    if (x + s.w > ATLAS_W) { x = 0; y += shelf + 1; shelf = 0; }
    s.x = x; s.y = y;
    x += s.w + 1;
    shelf = Math.max(shelf, s.h);
  }
  const H = y + shelf, img = new Uint8Array(ATLAS_W * H);
  for (const s of sprites) for (let r = 0; r < s.h; r++) img.set(s.pix.subarray(r * s.w, (r + 1) * s.w), (s.y + r) * ATLAS_W + s.x);
  const meta = {
    scale: 1, palette: EGA, width: ATLAS_W, height: H,
    source: 'tools/build_atlas.py from decode/data/sprites_index.tsv + the original banks',
    sprites: sprites.map(({ bank, index, x: sx, y: sy, w, h, mode }) => ({ bank, index, x: sx, y: sy, w, h, mode })),
  };
  return [
    { path: 'atlas.png', bytes: await indexedPng(ATLAS_W, H, img, EGA, deflate) },
    { path: 'atlas.json', bytes: utf8(dumps(meta, { separators: [',', ':'] })) },
  ];
}

export async function streamDeflate(raw) {
  const s = new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
