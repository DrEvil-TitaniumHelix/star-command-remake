export const LOGICAL_W = 320;
export const LOGICAL_H = 200;

export const EGA_RGB = [
  [0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170], [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
  [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255], [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255],
];

export const MODULE_PALETTE = {
  STARCOMM: { ega: [[1, 9], [2, 4]], cga: [] },
  STARTUP: { ega: [[1, 9], [2, 4]], cga: [[1, 3], [2, 5]] },
  SPACE: { ega: [[1, 9], [2, 4]], cga: [] },
  STARPORT: { ega: [[1, 9], [2, 4]], cga: [] },
  SPBATTLE: { ega: [[1, 9], [2, 4]], cga: [] },
  INSIDE: { ega: [[1, 2], [2, 6]], cga: [] },
  PLBATTLE: { ega: [], cga: [] },
};

export class Framebuffer {
  constructor(scale = 1) {
    this.S = scale;
    this.W = LOGICAL_W * scale;
    this.H = LOGICAL_H * scale;
    this.pix = new Uint8Array(this.W * this.H);
    this.mode = 1;
    this.ega7Seen = false;
    this.attr2ega = new Uint8Array(16);
    this.version = 0;
    this.dirty = true;
    this.screen(1);
  }

  get dirty() { return this._dirty; }
  set dirty(v) { this._dirty = v; if (v) this.version++; }

  screen(mode) {
    if (mode !== 1 && mode !== 7) throw new Error(`SCREEN ${mode} not supported`);
    if (mode === 7) this.ega7Seen = true;
    this.mode = mode;
    this.colorMask = mode === 1 ? 3 : 15;
    this.paletteReset();
    this.cls();
  }

  paletteReset() {
    for (let i = 0; i < 16; i++) this.attr2ega[i] = i;
    if (this.mode === 1) {
      const [a, b, c] = this.ega7Seen ? [11, 13, 15] : [3, 5, 7];
      this.attr2ega[1] = a; this.attr2ega[2] = b; this.attr2ega[3] = c;
    }
    this.dirty = true;
  }

  palette(attr, ega) { this.attr2ega[attr & 15] = ega & 15; this.dirty = true; }

  modulePalette(mod, useEGA = true) {
    const p = MODULE_PALETTE[mod];
    if (!p) throw new Error(`no palette entry for ${mod}`);
    for (const [a, c] of (useEGA ? p.ega : p.cga)) this.palette(a, c);
  }

  colorScreen1(bg, pal) {
    if (bg !== undefined && bg !== null) this.attr2ega[0] = bg & 15;
    if (pal !== undefined && pal !== null) {
      const hi = this.ega7Seen ? 8 : 0;
      const t = ((pal & 1) ? [3, 5, 7] : [2, 4, 6]).map((v) => v + hi);
      this.attr2ega[1] = t[0]; this.attr2ega[2] = t[1]; this.attr2ega[3] = t[2];
    }
    this.dirty = true;
  }

  cls(attr = 0) { this.pix.fill(attr); this.dirty = true; }

  pset(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= LOGICAL_W || y >= LOGICAL_H) return;
    const S = this.S, v = c & 15;
    if (S === 1) { this.pix[y * this.W + x] = v; }
    else for (let j = 0; j < S; j++) this.pix.fill(v, (y * S + j) * this.W + x * S, (y * S + j) * this.W + x * S + S);
    this.dirty = true;
  }

  point(x, y) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= LOGICAL_W || y >= LOGICAL_H) return -1;
    return this.pix[(y * this.S) * this.W + x * this.S];
  }

  fillRect(x1, y1, x2, y2, c) {
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];
    x1 = Math.max(0, x1 | 0); y1 = Math.max(0, y1 | 0);
    x2 = Math.min(LOGICAL_W - 1, x2 | 0); y2 = Math.min(LOGICAL_H - 1, y2 | 0);
    if (x1 > x2 || y1 > y2) return;
    const S = this.S, v = c & 15;
    for (let y = y1 * S; y < (y2 + 1) * S; y++) this.pix.fill(v, y * this.W + x1 * S, y * this.W + (x2 + 1) * S);
    this.dirty = true;
  }

  toRGBA(out) {
    const lut = new Uint32Array(16);
    const le = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1;
    for (let i = 0; i < 16; i++) {
      const [r, g, b] = EGA_RGB[this.attr2ega[i]];
      lut[i] = le ? (255 << 24 | b << 16 | g << 8 | r) >>> 0 : (r << 24 | g << 16 | b << 8 | 255) >>> 0;
    }
    const o32 = new Uint32Array(out.buffer, out.byteOffset, this.W * this.H);
    const p = this.pix;
    for (let i = 0; i < p.length; i++) o32[i] = lut[p[i]];
    return out;
  }
}

export class Display {
  constructor(canvas, fb) {
    this.canvas = canvas;
    this.fb = fb;
    canvas.width = 640;
    canvas.height = 400;
    this.ctx = canvas.getContext('2d');
    this.src = document.createElement('canvas');
    this.src.width = fb.W;
    this.src.height = fb.H;
    this.sctx = this.src.getContext('2d');
    this.img = this.sctx.createImageData(fb.W, fb.H);
    this.overlays = [];
    this.frameHooks = [];
    this.view = { scale: 1, ox: 0, oy: 0 };
    this.fit = this.fit.bind(this);
    window.addEventListener('resize', this.fit);
    this.fit();
    const tick = (t) => {
      for (const h of this.frameHooks) h(t);
      this.present();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  fit() {
    const k = Math.max(1, Math.floor(Math.min(window.innerWidth / 640, window.innerHeight / 400)));
    this.canvas.style.width = `${640 * k}px`;
    this.canvas.style.height = `${400 * k}px`;
  }

  setView(scale = 1, ox = 0, oy = 0) {
    const s = Math.max(1, scale), w = this.fb.W / s, h = this.fb.H / s;
    this.view = { scale: s, ox: Math.min(Math.max(0, ox), this.fb.W - w), oy: Math.min(Math.max(0, oy), this.fb.H - h) };
    this.present(true);
  }

  viewToLogical(cx, cy) {
    const v = this.view;
    return { x: v.ox + cx * this.fb.W / 640 / v.scale, y: v.oy + cy * this.fb.H / 400 / v.scale };
  }

  present(force = false) {
    if (!this.fb.dirty && !force && !this.overlays.length) return;
    this.fb.toRGBA(this.img.data);
    this.sctx.putImageData(this.img, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    const v = this.view;
    if (v.scale === 1) this.ctx.drawImage(this.src, 0, 0, 640, 400);
    else this.ctx.drawImage(this.src, v.ox, v.oy, this.fb.W / v.scale, this.fb.H / v.scale, 0, 0, 640, 400);
    for (const o of this.overlays) o(this.ctx);
    this.fb.dirty = false;
  }
}
