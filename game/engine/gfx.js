// gfx.js — BASIC graphics statements on the Framebuffer: PSET, PRESET, POINT, LINE [B|BF] [,style], PAINT, CIRCLE.
// Runtime evidence: RT_LEDGER 3E_84/85/86 (LINE: colour -1 = default, DX -1 plain / 0 B / 1 BF, CX style),
// 3E_8D (PSET/PRESET/CIRCLE/PAINT coordinate), 3E_48 (PAINT colour, border).
// Coordinates are logical (0..319, 0..199); off-screen pixels are clipped (SCREEN clipping, no error).

// The runtime's single -> integer conversion (BRUN30 A915): round half AWAY from zero (decode/brun30/CIRCLE.md s.2).
export const cintAway = (v) => Math.sign(v) * Math.floor(Math.abs(v) + 0.5);
const RSQRT2 = 0.70710678;          // MBF F3 04 35 80 at E381-E384
const FOUR_OVER_PI = 1.2732395;     // MBF 82 F9 22 81 at E4B4-E4B7

// E4A9-E578: angle -> [step on the 8k chain, radius-line flag]
function endpointStep(theta, R, k) {
  const line = theta < 0;
  const t = Math.abs(theta);
  const o = Math.trunc(t * FOUR_OVER_PI);
  if (o >= 8) throw new Error('CIRCLE: Illegal function call (angle >= 2 pi)');
  let [base, useSin, add] = [[0, true, true], [2, false, false], [2, false, true], [4, true, false]][o & 3];
  if (o >= 4) base += 4;
  const trig = Math.abs(useSin ? Math.sin(t) : Math.cos(t));
  const v = add ? base * k + R * trig : base * k - R * trig;
  return [cintAway(v), line];
}

export class Gfx {
  constructor(fb) {
    this.fb = fb;
    this.lastX = 160; this.lastY = 100;   // graphics cursor (centre after SCREEN)
  }

  get fg() { return this.fb.mode === 1 ? 3 : 15; }   // default foreground: SCREEN 1 = 3, SCREEN 7 = 15

  pset(x, y, c = this.fg) { x = cintAway(x); y = cintAway(y); this.fb.pset(x, y, c); this.lastX = x; this.lastY = y; }
  preset(x, y, c = 0) { x = cintAway(x); y = cintAway(y); this.fb.pset(x, y, c); this.lastX = x; this.lastY = y; }
  point(x, y) { return this.fb.point(cintAway(x), cintAway(y)); }

  // LINE (x1,y1)-(x2,y2), c, box ('' | 'B' | 'BF'), style (16-bit mask, MSB first; -1/undefined = solid)
  line(x1, y1, x2, y2, c = this.fg, box = '', style) {
    if (c === undefined || c === null || c < 0) c = this.fg;
    x1 = cintAway(x1); y1 = cintAway(y1); x2 = cintAway(x2); y2 = cintAway(y2);   // DC92 -> A915
    if (box === 'BF') this.fb.fillRect(x1, y1, x2, y2, c);
    else if (box === 'B') {
      this.seg(x1, y1, x2, y1, c, style); this.seg(x1, y2, x2, y2, c, style);
      this.seg(x1, y1, x1, y2, c, style); this.seg(x2, y1, x2, y2, c, style);
    } else this.seg(x1, y1, x2, y2, c, style);
    this.lastX = x2; this.lastY = y2;
  }

  // LINE -(x2,y2): from the last point
  lineTo(x2, y2, c, box, style) { this.line(this.lastX, this.lastY, x2, y2, c, box, style); }

  seg(x1, y1, x2, y2, c, style) {
    const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
    let err = dx - dy, x = x1, y = y1, bit = 0;
    const styled = style !== undefined && style !== null && style !== -1 && (style & 0xffff) !== 0xffff;
    for (;;) {
      if (!styled || ((style >> (15 - (bit & 15))) & 1)) this.fb.pset(x, y, c);
      bit++;
      if (x === x2 && y === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  }

  // PAINT (x,y), paint, border: flood-fill every pixel connected to (x,y) that is not the border colour.
  // Border omitted = paint colour (BASIC rule).
  paint(x, y, paint = this.fg, border) {
    if (border === undefined || border === null || border < 0) border = paint;
    const W = 320, H = 200;
    x = cintAway(x); y = cintAway(y);
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const seen = new Uint8Array(W * H);
    const fb = this.fb;
    const stack = [[x, y]];
    while (stack.length) {
      const [sx, sy] = stack.pop();
      if (seen[sy * W + sx] || fb.point(sx, sy) === border) continue;
      let l = sx, r = sx;
      while (l > 0 && !seen[sy * W + l - 1] && fb.point(l - 1, sy) !== border) l--;
      while (r < W - 1 && !seen[sy * W + r + 1] && fb.point(r + 1, sy) !== border) r++;
      for (let i = l; i <= r; i++) { seen[sy * W + i] = 1; fb.pset(i, sy, paint); }
      for (const ny of [sy - 1, sy + 1]) {
        if (ny < 0 || ny >= H) continue;
        let inRun = false;
        for (let i = l; i <= r; i++) {
          const open = !seen[ny * W + i] && fb.point(i, ny) !== border;
          if (open && !inRun) stack.push([i, ny]);
          inRun = open;
        }
      }
    }
    this.lastX = x; this.lastY = y;
  }

  // CIRCLE (x,y), r, c, start, end, aspect: the BRUN30 rasteriser RT3E_8C (E346..E6C0) exactly as transcribed in
  // decode/brun30/CIRCLE.md (reference model decode/brun30/circle_model.py, checked pixel-for-pixel against the
  // DOSBox reference acceptance/ref/SP-01.png; qa fix F-2). Integer midpoint circle on R = CINT(r); the minor axis
  // scaled by the 8.8 fraction f of min(aspect, 1/aspect); the eight symmetric points carry their position on an
  // 8k-step chain (k = CINT(R * 0.70710678)) that the start/end angles cut into the plotted arc; a negative angle
  // replaces the end point by a radius line from the centre. CINT here is the runtime's: round half AWAY from 0.
  // Default aspect (no argument): 5/6 (the game always passes one; the runtime's mode table was not extracted).
  circle(x, y, r, c = this.fg, start, end, aspect = 5 / 6) {
    if (c === undefined || c === null || c < 0) c = this.fg;
    if (r < 0) throw new Error('CIRCLE: Illegal function call (negative radius)');
    const cx = cintAway(x), cy = cintAway(y);                       // 3E_8D / DC92
    const R = cintAway(r);                                           // E372-E377 [12D2]
    const k = cintAway(R * RSQRT2);                                  // E37B-E38F [12FC]
    const tall = aspect >= 1;                                        // RT3E_31 E309-E313
    const n = cintAway((tall ? 1 / aspect : aspect) * 256);          // E315-E329
    const f = (n & 0xff) ? (n & 0xff) : (n >= 256 ? 256 : 0);        // E32E-E33F [12F8]
    const scale = (v) => (v * f + 0x80) >> 8;                        // E5D9-E5F2
    const has = (v) => v !== undefined && v !== null;
    const arc = has(start) || has(end);
    let L = 0, H = 0xffff, swapped = false, lineL = false, lineH = false;
    if (arc) {                                                       // E3CD-E449
      const s0 = has(start) ? start : 0;
      const [sStep, sLine] = endpointStep(s0, R, k);
      if (has(end)) {
        const [eStep, eLine] = endpointStep(end, R, k);
        swapped = Math.abs(end) < Math.abs(s0);                      // E416 DE36: end ? start (floats)
        [L, H] = swapped ? [eStep, sStep] : [sStep, eStep];
        [lineL, lineH] = swapped ? [eLine, sLine] : [sLine, eLine];  // E41F-E42A: flags exchanged
      } else { L = sStep; H = 0xffff; lineL = sLine; }               // E3FE-E403
      if (L === H && (lineL || lineH)) lineL = lineH = true;         // E43C-E449
    }
    let drawnL = false, drawnH = false;
    const plot = (sx, sy, step) => {                                 // E621-E6BF
      if (arc) {
        if (step === L) {
          if (lineL) { if (!drawnL) { drawnL = true; this.seg(cx, cy, cx + sx, cy + sy, c); } return; }   // E6A5 radius line
        } else if (step === H) {
          if (lineH) { if (!drawnH) { drawnH = true; this.seg(cx, cy, cx + sx, cy + sy, c); } return; }
        } else if (step > L && step < H) { if (swapped) return; }    // E678 -> E6B1
        else if (!swapped) return;                                   // E670 / E67A
      }
      this.fb.pset(cx + sx, cy + sy, c);                              // E638-E642 (clipped like DE6D)
    };
    let px = 0, py = R, d = 1 - R;                                   // E57D-E588
    for (;;) {
      const xs = scale(px), ys = scale(py);
      if (!tall) {                                                   // wide: x radius R, y scaled
        plot(py, -xs, px); plot(-px, -ys, 2 * k + px); plot(-py, xs, 4 * k + px); plot(px, ys, 6 * k + px);
        plot(px, -ys, 2 * k - px); plot(-py, -xs, 4 * k - px); plot(-px, ys, 6 * k - px); plot(py, xs, 8 * k - px);
      } else {                                                       // tall: y radius R, x scaled
        plot(ys, -px, px); plot(-xs, -py, 2 * k + px); plot(-ys, px, 4 * k + px); plot(xs, py, 6 * k + px);
        plot(xs, -py, 2 * k - px); plot(-ys, -px, 4 * k - px); plot(-xs, py, 6 * k - px); plot(ys, px, 8 * k - px);
      }
      if (px >= py) break;                                           // E592-E594 (after plotting)
      if (d < 0) d += 2 * px + 3;                                    // E5A5-E5AD
      else { d += 2 * (px - py) + 5; py -= 1; }                      // E59D-E5A4
      px += 1;
    }
    this.lastX = cx; this.lastY = cy;
  }
}
