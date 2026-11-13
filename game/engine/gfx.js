export const cintAway = (v) => Math.sign(v) * Math.floor(Math.abs(v) + 0.5);
const RSQRT2 = 0.70710678;
const FOUR_OVER_PI = 1.2732395;

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
    this.lastX = 160; this.lastY = 100;
  }

  get fg() { return this.fb.mode === 1 ? 3 : 15; }

  pset(x, y, c = this.fg) { x = cintAway(x); y = cintAway(y); this.fb.pset(x, y, c); this.lastX = x; this.lastY = y; }
  preset(x, y, c = 0) { x = cintAway(x); y = cintAway(y); this.fb.pset(x, y, c); this.lastX = x; this.lastY = y; }
  point(x, y) { return this.fb.point(cintAway(x), cintAway(y)); }

  line(x1, y1, x2, y2, c = this.fg, box = '', style) {
    if (c === undefined || c === null || c < 0) c = this.fg;
    x1 = cintAway(x1); y1 = cintAway(y1); x2 = cintAway(x2); y2 = cintAway(y2);
    if (box === 'BF') this.fb.fillRect(x1, y1, x2, y2, c);
    else if (box === 'B') {
      this.seg(x1, y1, x2, y1, c, style); this.seg(x1, y2, x2, y2, c, style);
      this.seg(x1, y1, x1, y2, c, style); this.seg(x2, y1, x2, y2, c, style);
    } else this.seg(x1, y1, x2, y2, c, style);
    this.lastX = x2; this.lastY = y2;
  }

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

  circle(x, y, r, c = this.fg, start, end, aspect = 5 / 6) {
    if (c === undefined || c === null || c < 0) c = this.fg;
    if (r < 0) throw new Error('CIRCLE: Illegal function call (negative radius)');
    const cx = cintAway(x), cy = cintAway(y);
    const R = cintAway(r);
    const k = cintAway(R * RSQRT2);
    const tall = aspect >= 1;
    const n = cintAway((tall ? 1 / aspect : aspect) * 256);
    const f = (n & 0xff) ? (n & 0xff) : (n >= 256 ? 256 : 0);
    const scale = (v) => (v * f + 0x80) >> 8;
    const has = (v) => v !== undefined && v !== null;
    const arc = has(start) || has(end);
    let L = 0, H = 0xffff, swapped = false, lineL = false, lineH = false;
    if (arc) {
      const s0 = has(start) ? start : 0;
      const [sStep, sLine] = endpointStep(s0, R, k);
      if (has(end)) {
        const [eStep, eLine] = endpointStep(end, R, k);
        swapped = Math.abs(end) < Math.abs(s0);
        [L, H] = swapped ? [eStep, sStep] : [sStep, eStep];
        [lineL, lineH] = swapped ? [eLine, sLine] : [sLine, eLine];
      } else { L = sStep; H = 0xffff; lineL = sLine; }
      if (L === H && (lineL || lineH)) lineL = lineH = true;
    }
    let drawnL = false, drawnH = false;
    const plot = (sx, sy, step) => {
      if (arc) {
        if (step === L) {
          if (lineL) { if (!drawnL) { drawnL = true; this.seg(cx, cy, cx + sx, cy + sy, c); } return; }
        } else if (step === H) {
          if (lineH) { if (!drawnH) { drawnH = true; this.seg(cx, cy, cx + sx, cy + sy, c); } return; }
        } else if (step > L && step < H) { if (swapped) return; }
        else if (!swapped) return;
      }
      this.fb.pset(cx + sx, cy + sy, c);
    };
    let px = 0, py = R, d = 1 - R;
    for (;;) {
      const xs = scale(px), ys = scale(py);
      if (!tall) {
        plot(py, -xs, px); plot(-px, -ys, 2 * k + px); plot(-py, xs, 4 * k + px); plot(px, ys, 6 * k + px);
        plot(px, -ys, 2 * k - px); plot(-py, -xs, 4 * k - px); plot(-px, ys, 6 * k - px); plot(py, xs, 8 * k - px);
      } else {
        plot(ys, -px, px); plot(-xs, -py, 2 * k + px); plot(-ys, px, 4 * k + px); plot(xs, py, 6 * k + px);
        plot(xs, -py, 2 * k - px); plot(-ys, -px, 4 * k - px); plot(-xs, py, 6 * k - px); plot(ys, px, 8 * k - px);
      }
      if (px >= py) break;
      if (d < 0) d += 2 * px + 3;
      else { d += 2 * (px - py) + 5; py -= 1; }
      px += 1;
    }
    this.lastX = cx; this.lastY = cy;
  }
}
