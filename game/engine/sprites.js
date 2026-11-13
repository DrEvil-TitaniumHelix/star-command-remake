import { cintAway } from './gfx.js';

export const OR = 0, AND = 1, PRESET = 2, PSET = 3, XOR = 4;
export const VERBS = { OR, AND, PRESET, PSET, XOR };
const VERB_NAME = ['OR', 'AND', 'PRESET', 'PSET', 'XOR'];


export class Atlas {
  constructor(meta, indexPixels) {
    this.meta = meta;
    this.scale = meta.scale || 1;
    this.byKey = new Map();
    const S = this.scale, AW = meta.width * S;
    for (const s of meta.sprites) {
      const w = s.w * S, h = s.h * S, pix = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) {
        const o = (s.y * S + y) * AW + s.x * S;
        pix.set(indexPixels.subarray(o, o + w), y * w);
      }
      this.byKey.set(`${s.bank}#${s.index}`, { w: s.w, h: s.h, S, mask: s.mode === 'ega' ? 15 : 3, mode: s.mode, bank: s.bank, index: s.index, pix });
    }
  }

  static bankName(bank) { return /\.[A-Za-z]{3}$/.test(bank) ? bank.toUpperCase() : `${bank.toUpperCase()}.BAS`; }

  has(bank, index) { return this.byKey.has(`${Atlas.bankName(bank)}#${index}`); }

  sprite(bank, index) {
    const s = this.byKey.get(`${Atlas.bankName(bank)}#${index}`);
    if (!s) throw new Error(`sprite ${bank}[${index}] not in atlas`);
    return s;
  }

  static async load(base = 'assets/') {
    const meta = await (await fetch(`${base}atlas.json`)).json();
    const png = await fetch(`${base}atlas.png`);
    if (!png.ok) throw new Error(`${base}atlas.png: HTTP ${png.status}`);
    const img = new Image();
    img.src = URL.createObjectURL(await png.blob());
    try { await img.decode(); } finally { URL.revokeObjectURL(img.src); }
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const rgba = ctx.getImageData(0, 0, img.width, img.height).data;
    const lut = new Map(meta.palette.map(([r, g, b], i) => [(r << 16) | (g << 8) | b, i]));
    const idx = new Uint8Array(img.width * img.height);
    for (let i = 0; i < idx.length; i++) {
      const v = lut.get((rgba[4 * i] << 16) | (rgba[4 * i + 1] << 8) | rgba[4 * i + 2]);
      if (v === undefined) throw new Error(`atlas.png pixel ${i % img.width},${(i / img.width) | 0} is not a palette colour`);
      idx[i] = v;
    }
    if (img.width !== meta.width * (meta.scale || 1)) throw new Error('atlas.png width does not match atlas.json width*scale');
    return new Atlas(meta, idx);
  }
}

export class Sprites {
  constructor(fb, atlas) {
    if (atlas && atlas.scale !== fb.S) throw new Error(`framebuffer scale ${fb.S} != atlas scale ${atlas.scale}`);
    this.fb = fb;
    this.atlas = atlas;
  }

  put(x, y, image, verb = XOR) {
    const img = image.pix ? image : this.atlas.sprite(image.bank, image.index);
    if (typeof verb === 'string') verb = VERBS[verb.toUpperCase()];
    const fb = this.fb, S = fb.S, W = fb.W;
    const iw = img.w * S, ih = img.h * S, mask = img.mask;
    const x0 = cintAway(x) * S, y0 = cintAway(y) * S;
    if (x0 < 0 || y0 < 0 || x0 + iw > fb.W || y0 + ih > fb.H) {
      console.warn(`PUT (${x},${y}) ${img.bank ?? 'buffer'}[${img.index ?? ''}] ${img.w}x${img.h} leaves the screen (clipped)`);
    }
    const src = img.pix, dst = fb.pix;
    for (let j = 0; j < ih; j++) {
      const yy = y0 + j;
      if (yy < 0 || yy >= fb.H) continue;
      const so = j * iw, dro = yy * W;
      for (let i = 0; i < iw; i++) {
        const xx = x0 + i;
        if (xx < 0 || xx >= W) continue;
        const s = src[so + i], d = dro + xx;
        switch (verb) {
          case OR: dst[d] |= s; break;
          case AND: dst[d] &= s; break;
          case PRESET: dst[d] = (~s) & mask; break;
          case PSET: dst[d] = s; break;
          case XOR: dst[d] ^= s; break;
          default: throw new Error(`PUT verb ${verb}`);
        }
      }
    }
    fb.dirty = true;
  }

  get(x1, y1, x2, y2) {
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];
    x1 = Math.max(0, x1 | 0); y1 = Math.max(0, y1 | 0);
    x2 = Math.min(319, x2 | 0); y2 = Math.min(199, y2 | 0);
    const fb = this.fb, S = fb.S, w = x2 - x1 + 1, h = y2 - y1 + 1, iw = w * S;
    const pix = new Uint8Array(iw * h * S);
    for (let j = 0; j < h * S; j++) {
      const o = (y1 * S + j) * fb.W + x1 * S;
      pix.set(fb.pix.subarray(o, o + iw), j * iw);
    }
    return { w, h, S, mask: fb.colorMask, pix };
  }
}

export const verbName = (v) => VERB_NAME[v];
