// sprites.js — the sprite atlas + BASIC PUT/GET on the Framebuffer.
//
// Data-driven (owner/coordinator 2026-10-15): every sprite comes from assets/atlas.png + assets/atlas.json
// (built by tools/build_atlas.py from the original .BAS/.EGA banks). No sprite data lives in code; a redrawn
// or upscaled atlas with another `scale` is swapped in by replacing those two files.
// atlas.png pixels are colour NUMBERS (attributes), mapped back from RGB through atlas.json `palette`:
//   mode "cga" (.BAS banks): SCREEN 1 attributes 0..3;  mode "ega" (.EGA banks): attributes 0..15.
//
// PUT verbs (RT_LEDGER 3E_58, byte-proven): 0 OR, 1 AND, 2 PRESET (inverted copy), 3 PSET (copy), 4 XOR.
// Bank keys: the file name as sprites_index.tsv lists it ("TITLE.BAS", "BIGSH-1.EGA"); a bare stem gets
// ".BAS" like BLOAD's default extension ("LOGO" -> "LOGO.BAS").

import { cintAway } from './gfx.js';

export const OR = 0, AND = 1, PRESET = 2, PSET = 3, XOR = 4;
export const VERBS = { OR, AND, PRESET, PSET, XOR };
const VERB_NAME = ['OR', 'AND', 'PRESET', 'PSET', 'XOR'];

// Image objects: {w, h (logical), S, mask (3 or 15), pix: Uint8Array((w*S)*(h*S))}
// Both atlas sprites and GET buffers have this shape, so put() treats them alike.

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

  // Browser loader: fetch the JSON, decode the PNG, map RGB back to colour numbers.
  static async load(base = 'assets/') {
    const meta = await (await fetch(`${base}atlas.json`)).json();
    // the PNG through fetch() too, so a base served by the BYOC store (byoc/import/opfs.js) works like a URL
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

  // PUT (x, y), image, verb   — image = atlas sprite {bank,index} / sprite object / GET buffer.
  // Off-screen parts are clipped with a console warning (the original raises "Illegal function call").
  put(x, y, image, verb = XOR) {
    const img = image.pix ? image : this.atlas.sprite(image.bank, image.index);
    if (typeof verb === 'string') verb = VERBS[verb.toUpperCase()];
    const fb = this.fb, S = fb.S, W = fb.W;
    const iw = img.w * S, ih = img.h * S, mask = img.mask;
    const x0 = cintAway(x) * S, y0 = cintAway(y) * S;            // 3E_89 -> A915 (round half away from zero)
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

  // GET (x1,y1)-(x2,y2) -> buffer (inclusive corners, clipped to the screen like the runtime, 3E_3A).
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
