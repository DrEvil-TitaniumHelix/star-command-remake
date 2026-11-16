import assert from 'node:assert/strict';
import { Gfx } from './gfx.js';

function original(x1, y1, x2, y2, style = 0xffff) {
  if (x1 > x2) [x1, y1, x2, y2] = [x2, y2, x1, y1];                       // 8270-8275
  const W = x2 - x1, DY = y2 - y1, H = Math.abs(DY), sy = DY < 0 ? -1 : 1;
  const out = []; let x = x1, y = y1, si;
  const bit = () => { const b = (style >> 15) & 1; style = ((style << 1) | b) & 0xffff; return b; };   // rol di,1
  if (H < W) {                                                            // 82CC: wider than tall
    si = 4 * H - W;                                                       // 82D3-82DE
    for (let n = W + 1; n > 0; n--) {
      if (bit()) out.push([x, y]);
      if (si < 0) si += 4 * H; else { si += 4 * (H - W); y += sy; }      // 8364-8391
      x++;
    }
  } else if (W === 0) {                                                   // 83E4 -> 83A1: straight up or down
    for (let n = H + 1; n > 0; n--) { if (bit()) out.push([x, y]); y += sy; }
  } else {                                                                // 83E8: taller than wide, or diagonal
    si = 4 * W - H;
    for (let n = H + 1; n > 0; n--) {
      if (bit()) out.push([x, y]);
      if (si < 0) si += 4 * W; else { si += 4 * (W - H); x++; }          // 8456-846D
      y += sy;
    }
  }
  return out;
}

const drawn = (x1, y1, x2, y2, style) => {
  const px = [];
  new Gfx({ pset: (x, y, c) => px.push([x, y]), mode: 7 }).seg(x1, y1, x2, y2, 1, style);
  return px;
};

const LINES = [
  [259, 91, 311, 107], [311, 107, 259, 91], [259, 91, 311, 80], [311, 80, 259, 91],
  [100, 50, 110, 90], [110, 90, 100, 50], [100, 90, 110, 50], [110, 50, 100, 90],
  [40, 10, 40, 60], [40, 60, 40, 10], [10, 20, 41, 20], [41, 20, 10, 20],
  [20, 20, 50, 50], [50, 20, 20, 50], [0, 0, 100, 1], [7, 7, 7, 7],
];
for (const l of LINES) for (const style of [0xffff, 0xcccc, 0xcd26]) {
  assert.deepEqual(drawn(...l, style), original(...l, style), `LINE (${l[0]},${l[1]})-(${l[2]},${l[3]}) style ${style.toString(16)}`);
}

assert.deepEqual(drawn(0, 0, 100, 1).filter(([, y]) => y === 0).length, 25, 'the row changes a quarter of the way along, not half');
assert.deepEqual(drawn(311, 107, 259, 91, 0x8000)[0], [259, 91], 'the dash pattern starts at the left end whichever way the line was given');
assert.deepEqual(drawn(40, 60, 40, 10, 0x8000)[0], [40, 60], 'a vertical line starts at its first point');

console.log(`gfx: ${LINES.length} lines x 3 styles match the original line routine`);
