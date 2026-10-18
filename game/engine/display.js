// display.js — logical framebuffer of colour attributes + the EGA palette + the canvas presenter.
//
// The original runs SCREEN 1 (320x200, attributes 0..3) in every module and SCREEN 7 (320x200, attributes
// 0..15) in PLBATTLE (decode/pseudo/SCREENS_INDEX.md "Mode"). The framebuffer stores ATTRIBUTES; the palette
// maps attribute -> EGA colour number -> RGB at present time, so PALETTE remaps behave as on the hardware
// (already-drawn pixels change colour). Ruling SC-1 = B: shown as EGA 16-colour at 640x400.
//
// Resolution: the framebuffer is (320*S) x (200*S) device pixels, S = the sprite atlas `scale`
// (assets/atlas.json). All drawing APIs take LOGICAL coordinates (0..319, 0..199); one logical pixel is an
// SxS block. With the shipped atlas S = 1.

export const LOGICAL_W = 320;
export const LOGICAL_H = 200;

// Standard EGA colours 0..15 (same table as decode/data/tools/bsave.py EGA).
export const EGA_RGB = [
  [0, 0, 0], [0, 0, 170], [0, 170, 0], [0, 170, 170], [170, 0, 0], [170, 0, 170], [170, 85, 0], [170, 170, 170],
  [85, 85, 85], [85, 85, 255], [85, 255, 85], [85, 255, 255], [255, 85, 85], [255, 85, 255], [255, 255, 85], [255, 255, 255],
];

// PALETTE remaps the originals perform on an EGA (UseEGA! = G!(89) = 1), SCREENS_INDEX.md "Palette per module".
// STARTUP: `PALETTE 1, CINT(UseEGA!*6+3): PALETTE 2, CINT(5-UseEGA!)` (STARTUP 0E4B) = 1,9 / 2,4 on EGA, 1,3 / 2,5 on CGA.
export const MODULE_PALETTE = {
  STARCOMM: { ega: [[1, 9], [2, 4]], cga: [] },
  STARTUP: { ega: [[1, 9], [2, 4]], cga: [[1, 3], [2, 5]] },
  SPACE: { ega: [[1, 9], [2, 4]], cga: [] },
  STARPORT: { ega: [[1, 9], [2, 4]], cga: [] },
  SPBATTLE: { ega: [[1, 9], [2, 4]], cga: [] },  // inherits SPACE's (no PALETTE call of its own)
  INSIDE: { ega: [[1, 2], [2, 6]], cga: [] },     // INSIDE 0E08-0E13
  PLBATTLE: { ega: [], cga: [] },                 // SCREEN 7 native 16 colours (CGA build: SCREEN 1 defaults)
};

// Pure framebuffer (no DOM): usable from tests under node.
export class Framebuffer {
  constructor(scale = 1) {
    this.S = scale;
    this.W = LOGICAL_W * scale;
    this.H = LOGICAL_H * scale;
    this.pix = new Uint8Array(this.W * this.H);
    this.mode = 1;                       // BASIC SCREEN mode: 1 or 7
    this.ega7Seen = false;               // session: a SCREEN 7 module has run (SC-2 addendum, see paletteReset)
    this.attr2ega = new Uint8Array(16);
    this.version = 0;                    // bumped by every write (dirty = true): cheap "screen changed" test
    this.dirty = true;
    this.screen(1);
  }

  get dirty() { return this._dirty; }
  set dirty(v) { this._dirty = v; if (v) this.version++; }

  // SCREEN n: clears the screen and resets the palette (BASIC semantics).
  screen(mode) {
    if (mode !== 1 && mode !== 7) throw new Error(`SCREEN ${mode} not supported`);
    if (mode === 7) this.ega7Seen = true;      // SC-2 addendum (see paletteReset)
    this.mode = mode;
    this.colorMask = mode === 1 ? 3 : 15;
    this.paletteReset();
    this.cls();
  }

  // PALETTE with no arguments: the mode's default table.
  // SCREEN 1 on EGA = CGA palette 1 at LOW intensity (0, 3 cyan, 5 magenta, 7 light grey): ruling SC-2
  // (RULINGS.md, R-1 in acceptance/DOSBOX_REQUESTS.md): every DOSBox-X machine=ega reference shows colour 3 as
  // light grey. SC-2 addendum: once a SCREEN 7 module (PLBATTLE) has run, the original shows SCREEN 1 at HIGH
  // intensity (colour 3 bright white) for the rest of the session; `ega7Seen` records that. It is session state,
  // not game state: set by screen(7), kept across CHAIN (the framebuffer object lives for the whole page),
  // never saved, false again on a fresh start (new page = new Framebuffer). SCREEN 7 = identity.
  paletteReset() {
    for (let i = 0; i < 16; i++) this.attr2ega[i] = i;
    if (this.mode === 1) {
      const [a, b, c] = this.ega7Seen ? [11, 13, 15] : [3, 5, 7];
      this.attr2ega[1] = a; this.attr2ega[2] = b; this.attr2ega[3] = c;
    }
    this.dirty = true;
  }

  palette(attr, ega) { this.attr2ega[attr & 15] = ega & 15; this.dirty = true; }

  // Apply the PALETTE calls the given module makes on its adapter (MODULE_PALETTE).
  modulePalette(mod, useEGA = true) {
    const p = MODULE_PALETTE[mod];
    if (!p) throw new Error(`no palette entry for ${mod}`);
    for (const [a, c] of (useEGA ? p.ega : p.cga)) this.palette(a, c);
  }

  // COLOR in SCREEN 1: COLOR background, palette. Ruling SC-2: palette 1 = EGA 3 / 5 / 7 (cyan, magenta, light
  // grey), palette 0 = 2 / 4 / 6 (green, red, brown), low intensity as on the EGA (DOSBox-X references).
  colorScreen1(bg, pal) {
    if (bg !== undefined && bg !== null) this.attr2ega[0] = bg & 15;
    if (pal !== undefined && pal !== null) {
      const hi = this.ega7Seen ? 8 : 0;   // SC-2 addendum: high intensity after the first SCREEN 7 module
      const t = ((pal & 1) ? [3, 5, 7] : [2, 4, 6]).map((v) => v + hi);
      this.attr2ega[1] = t[0]; this.attr2ega[2] = t[1]; this.attr2ega[3] = t[2];
    }
    this.dirty = true;
  }

  cls(attr = 0) { this.pix.fill(attr); this.dirty = true; }

  // Logical-pixel accessors (one logical pixel = SxS device pixels).
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

  // Filled logical rectangle, inclusive corners, clipped.
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

  // RGBA rendering of the framebuffer through the palette (Uint8ClampedArray W*H*4).
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

// Canvas presenter: draws the framebuffer at 640x400 (2x2 per logical pixel), integer-scaled to the window,
// nearest neighbour. `overlay(ctx, k)` hooks (gamepad menu highlight) draw on top in 640x400 space and are
// never part of the framebuffer (POINT/GET are unaffected).
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

  // v1.2 view transform (map zoom, game/engine/zoom.js): `view` = {scale, ox, oy}, the logical pixel at the
  // canvas top-left and the zoom factor; scale 1 at (0,0) = the acceptance screen. Presentation only: the
  // framebuffer, POINT/GET and module logic never see it. viewToLogical maps 640x400 canvas pixels back to
  // logical 320x200 pixels (pointer.js uses it for every click).
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
