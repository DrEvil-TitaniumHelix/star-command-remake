// text.js — BASIC text output on the graphics screen: LOCATE, PRINT, PRINT USING, COLOR, CLS.
// 40 x 25 cells of 8x8 (SCREEN 1 and SCREEN 7): column c at x = 8(c-1), row r at y = 8(r-1)
// (SCREENS_INDEX.md "Mode"). Characters are drawn like the BIOS in graphics modes: the whole 8x8 cell is
// written, foreground pixels in the text colour, the rest in the background attribute (0 in SCREEN 1).
// Print viewport rows 1..24 scroll; row 25 is reachable with LOCATE (KEY OFF) and never scrolls.
// Font: assets/font8x8.json (IBM CGA ROM glyphs, see game/ASSETS.md).

import { printNum, using as usingFmt } from './basic.js';

export const COLS = 40;
export const ROWS = 25;
const VIEW_TOP = 1, VIEW_BOTTOM = 24;

export class Text {
  constructor(fb, font) {
    this.fb = fb;
    this.glyphs = font.glyphs;
    this.row = 1; this.col = 1;
    this.resetColors();
  }

  resetColors() { this.fgAttr = this.fb.mode === 1 ? 3 : 15; this.bgAttr = 0; }

  // LOCATE r, c, cursor, start, stop: the visible text cursor (line editors: SPACE 236A, STARPORT, INSIDE
  // SUB_157D). Drawn as a display overlay over scanlines start..stop of the cursor cell, blinking like the CGA
  // hardware cursor (16 frames on / 16 off at 60 Hz); never written into the framebuffer, so POINT/GET and
  // the next PRINT are unaffected.
  cursor(visible, start = 7, stop = 7) {
    this.cursorOn = !!visible;
    if (start !== undefined && start !== null) this.cursorStart = start & 7;
    if (stop !== undefined && stop !== null) this.cursorStop = stop & 7;
    this.fb.dirty = true;
  }

  // The 25 text rows as they look on screen: a cell reads as a character when its 8x8 pixels are exactly that
  // glyph in the text colour on background 0 (other cells -> ' '). Used by the gamepad menu detection.
  screenText() {
    if (!this.glyphKey) this.glyphKey = new Map(this.glyphs.map((g, c) => [g.join(','), String.fromCharCode(c)]).filter(([, c]) => c >= ' ' && c <= '~'));
    const fb = this.fb, fg = this.fgAttr, out = [];
    for (let r = 0; r < ROWS; r++) {
      let line = '';
      for (let c = 0; c < COLS; c++) {
        const rows = [];
        let ok = true;
        for (let y = 0; y < 8 && ok; y++) {
          let b = 0;
          for (let x = 0; x < 8; x++) { const v = fb.point(8 * c + x, 8 * r + y); if (v !== 0 && v !== fg) { ok = false; break; } b = (b << 1) | (v === fg ? 1 : 0); }
          rows.push(b);
        }
        line += ok ? (this.glyphKey.get(rows.join(',')) ?? ' ') : ' ';
      }
      out.push(line);
    }
    return out;
  }

  // display.js overlay hook (640x400 canvas: 16x16 per text cell).
  // qa fix F-3 (DOSBox-X reference, D-IN-2): in the graphics modes the game uses (SCREEN 1 and 7) the original
  // shows NO cursor for `LOCATE r, c, 1, start, stop` (INSIDE 015C0, SPACE 236A, STARPORT line editors): the
  // state is kept, nothing is drawn. Only a text mode (not used by the game) would draw it.
  drawCursor(ctx, rgb) {
    if (this.fb.mode === 1 || this.fb.mode === 7) return;
    if (!this.cursorOn || this.col > COLS || (Math.floor(performance.now() / 267) & 1)) return;
    const a = this.cursorStart ?? 7, b = Math.max(a, this.cursorStop ?? 7);
    ctx.fillStyle = `rgb(${rgb.join(',')})`;
    ctx.fillRect(16 * (this.col - 1), 16 * (this.row - 1) + 2 * a, 16, 2 * (b - a + 1));
  }

  // LOCATE row, col (either may be omitted = unchanged)
  locate(row, col) {
    if (row !== undefined && row !== null) {
      if (row < 1 || row > ROWS) throw new Error(`LOCATE row ${row}: Illegal function call`);
      this.row = row;
    }
    if (col !== undefined && col !== null) {
      if (col < 1 || col > COLS) throw new Error(`LOCATE col ${col}: Illegal function call`);
      this.col = col;
    }
  }

  // COLOR: SCREEN 1 = COLOR background, palette (text stays attribute 3); SCREEN 7 = COLOR fg, bg.
  color(a, b) {
    if (this.fb.mode === 1) this.fb.colorScreen1(a, b);
    else {
      if (a !== undefined && a !== null) this.fgAttr = a & 15;
      if (b !== undefined && b !== null) this.bgAttr = b & 15;
    }
  }

  cls() { this.fb.cls(0); this.row = 1; this.col = 1; }

  // Draw one character at the cursor cell, no cursor movement.
  glyph(ch, row = this.row, col = this.col) {
    const g = this.glyphs[ch & 255];
    const x0 = 8 * (col - 1), y0 = 8 * (row - 1), fb = this.fb;
    for (let y = 0; y < 8; y++) {
      const bits = g[y];
      for (let x = 0; x < 8; x++) fb.pset(x0 + x, y0 + y, (bits >> (7 - x)) & 1 ? this.fgAttr : this.bgAttr);
    }
  }

  newline() {
    this.col = 1;
    if (this.row >= VIEW_BOTTOM) { if (this.row === VIEW_BOTTOM) this.scroll(); else this.row = VIEW_BOTTOM; }
    else this.row++;
  }

  // Scroll the print viewport (rows 1..24) up one text row, clearing the bottom row to attribute 0.
  scroll() {
    const fb = this.fb, S = fb.S, W = fb.W;
    const top = (VIEW_TOP - 1) * 8 * S, bot = VIEW_BOTTOM * 8 * S, line = 8 * S * W;
    fb.pix.copyWithin(top * W, top * W + line, bot * W);
    fb.pix.fill(0, bot * W - line, bot * W);
    fb.dirty = true;
  }

  // Write a string at the cursor with wrap at column 40 (the cursor parks on column 41 until the next char).
  write(s) {
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c === 13) { this.newline(); continue; }
      if (this.col > COLS) this.newline();
      this.glyph(c);
      this.col++;
    }
  }

  // PRINT item [; | ,]
  //   text.print('A')            PRINT "A"
  //   text.print('A', ';')       PRINT "A";
  //   text.print('A', ',')       PRINT "A",   (next 14-column zone)
  //   text.print(5)              PRINT 5      (numbers get BASIC's sign space and trailing space)
  //   text.print(['3-', s], ';') PRINT "3-"; s;   (an array = items joined with ';')
  //   text.print()               PRINT
  print(item = '', end = '\n') {
    const items = Array.isArray(item) ? item : [item];
    for (const it of items) {
      const s = typeof it === 'number' ? printNum(it) : String(it);
      // an item that does not fit on the rest of the line starts on the next line (BASIC rule)
      if (this.col > 1 && s.length <= COLS && this.col - 1 + s.length > COLS) this.newline();
      this.write(s);
    }
    if (end === '\n') { this.newline(); }
    else if (end === ',') {
      const next = (Math.floor((this.col - 1) / 14) + 1) * 14 + 1;
      if (next > COLS) this.newline(); else this.write(' '.repeat(next - this.col));
    }
  }

  // PRINT USING fmt; values [;]  — numeric fields only (basic.js using()); literal text around the field kept.
  printUsing(fmt, values, end = '\n') {
    const vals = Array.isArray(values) ? values : [values];
    let k = 0;
    const out = fmt.replace(/#+(\.#+)?/g, (f) => usingFmt(f, vals[k++]));
    this.print(out, end);
  }
}
