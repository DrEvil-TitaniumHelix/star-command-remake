import { readFileSync } from 'node:fs';
const repo = './game/engine/';
const { Framebuffer } = await import('file:///' + repo + 'display.js');
const { Gfx } = await import('file:///' + repo + 'gfx.js');
const d = JSON.parse(readFileSync(new URL(process.argv[2] || './arcs.json', import.meta.url)));
const cls = (c) => (c[0] === 0 && c[1] === 0 && c[2] === 0 ? 0 : c[2] === 255 && c[0] === 85 ? 1 : c[0] === 170 && c[1] === 0 ? 2 : 3);
const ref = d.ref.map((r) => r.map(cls));

const cint = (v) => { const r = Math.round(v); return Math.abs(v % 1) === 0.5 ? 2 * Math.round(v / 2) : r; };
const TWO_PI = 2 * Math.PI;

function variant(opts) {
  return function circle(fb, cx, cy, r, c, a0, a1, asp) {
    const R = opts.roundR ? cint(r) : r;
    let rx, ry;
    if (asp < 1) { rx = R; ry = R * asp; } else { ry = R; rx = R / asp; }
    if (opts.roundRad) { rx = cint(rx); ry = cint(ry); }
    const X = opts.roundC ? cint(cx) : cx, Y = opts.roundC ? cint(cy) : cy;
    const inArc = (px, py) => {
      let a = Math.atan2(-(py) / (ry || 1), px / (rx || 1)); if (a < 0) a += TWO_PI;
      let s = a0, e = a1; if (e < s) e += TWO_PI; if (a < s) a += TWO_PI;
      return opts.incl ? a <= e + 1e-9 : a < e;
    };
    const plot = (px, py) => { if (inArc(px, py)) fb.pset(Math.round(X + px), Math.round(Y + py), c); };
    if (opts.mode === 'midpoint') {
      const a = Math.round(rx), b = Math.round(ry);
      let x = 0, y = b; const a2 = a * a, b2 = b * b;
      let dx = 0, dy = 2 * a2 * y, p = b2 - a2 * b + a2 / 4;
      const four = (x, y) => { plot(x, y); plot(-x, y); plot(x, -y); plot(-x, -y); };
      while (dx < dy) { four(x, y); x++; dx += 2 * b2; if (p < 0) p += b2 + dx; else { y--; dy -= 2 * a2; p += b2 + dx - dy; } }
      p = b2 * (x + 0.5) * (x + 0.5) + a2 * (y - 1) * (y - 1) - a2 * b2;
      while (y >= 0) { four(x, y); y--; dy -= 2 * a2; if (p > 0) p += a2 - dy; else { x++; dx += 2 * b2; p += a2 - dy + dx; } }
    } else {
      const steps = Math.ceil(TWO_PI * Math.max(rx, ry) * 4);
      for (let i = 0; i < steps; i++) { const t = TWO_PI * i / steps; plot(rx * Math.cos(t), -ry * Math.sin(t)); }
    }
  };
}

function render(circle) {
  const fb = new Framebuffer(1); const g = new Gfx(fb);
  g.line(0, 0, 319, 199, 1, 'BF'); g.line(0, 0, 319, 199, 2, 'B'); g.line(1, 1, 318, 198, 2, 'B');
  const C = (x, y, r, a0, a1, asp) => circle(fb, x, y, r, 2, a0, a1, asp);
  C(16, 75.5, 68.5, 1.57, 4.71, 8); C(15, 75.5, 68.5, 1.57, 4.71, 8); C(143, 75.5, 68.5, 4.71, 1.57, 8); C(144, 75.5, 68.5, 4.71, 1.57, 8);
  g.line(16, 6, 143, 7, 2, 'BF'); g.line(16, 144, 143, 145, 2, 'BF'); g.paint(16, 75, 0, 2);
  C(16, 171.5, 20.5, 1.57, 4.71, 2); C(15, 171.5, 20.5, 1.57, 4.71, 2); C(303, 171.5, 20.5, 4.71, 1.57, 2); C(304, 171.5, 20.5, 4.71, 1.57, 2);
  g.line(16, 150, 303, 151, 2, 'BF'); g.line(14, 192, 305, 193, 2, 'BF'); g.paint(16, 171, 0, 2);
  C(248, 35.5, 28.5, 1.57, 4.71, 3); C(247, 35.5, 28.5, 1.57, 4.71, 3); C(303, 35.5, 28.5, 4.71, 1.57, 3); C(304, 35.5, 28.5, 4.71, 1.57, 3);
  g.line(248, 6, 303, 7, 2, 'BF'); g.line(247, 64, 304, 65, 2, 'BF'); g.paint(248, 35, 0, 2);
  C(160, 107.5, 36.5, 1.57, 4.71, 9); C(159, 107.5, 36.5, 1.57, 4.71, 9); C(303, 107.5, 36.5, 4.71, 1.57, 9); C(304, 107.5, 36.5, 4.71, 1.57, 9);
  g.line(160, 70, 303, 71, 2, 'BF'); g.line(160, 144, 303, 145, 2, 'BF'); g.paint(160, 107, 0, 2);
  return fb;
}

const zones = [[0, 30, 0, 150], [130, 160, 0, 150], [0, 30, 150, 200], [290, 320, 150, 200], [234, 258, 0, 70], [293, 320, 0, 70], [146, 170, 68, 150], [293, 320, 68, 150]];
function score(fb) {
  let bad = 0;
  for (const [x0, x1, y0, y1] of zones) for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const e = fb.point(x, y), r = ref[y][x];
    if ((e === 2) !== (r === 2)) bad++;
  }
  return bad;
}
const res = [];
for (const mode of ['midpoint', 'param']) for (const roundR of [0, 1]) for (const roundRad of [0, 1]) for (const roundC of [0, 1]) for (const incl of [0, 1]) {
  const o = { mode, roundR, roundRad, roundC, incl };
  res.push([score(render(variant(o))), JSON.stringify(o)]);
}
const { Gfx: G2 } = await import('file:///' + repo + 'gfx.js');
const cur = (fb, x, y, r, c, a0, a1, asp) => new G2(fb).circle(x, y, r, c, a0, a1, asp);
res.push([score(render(cur)), 'current gfx.js']);
res.sort((a, b) => a[0] - b[0]);
for (const [s, o] of res.slice(0, 8)) console.log(s, o);

{
  const fb = render(cur); const only = { engine2: [], ref2: [] };
  for (const [x0, x1, y0, y1] of zones) for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const e = fb.point(x, y), r = ref[y][x];
    if (e === 2 && r !== 2) only.engine2.push([x, y, r]); else if (e !== 2 && r === 2) only.ref2.push([x, y, e]);
  }
  const rows = (l) => { const m = {}; for (const [x, y] of l) (m[y] ??= []).push(x); return Object.entries(m).slice(0, 12).map(([y, xs]) => `y${y}:${xs.length}@${Math.min(...xs)}..${Math.max(...xs)}`).join(' '); };
  console.log('engine colour 2 where the ref is not:', only.engine2.length, rows(only.engine2));
  console.log('ref colour 2 where the engine is not:', only.ref2.length, rows(only.ref2));
}
