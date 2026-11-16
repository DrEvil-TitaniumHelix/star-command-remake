import assert from 'node:assert/strict';
import { installMarker, markerCells } from './marker.js';

for (const title of [0, 1]) {
  const G = new Float32Array(2601), drawn = [];
  let enabled = true, text = [];
  G[110] = G[2240] = 1; G[2238] = G[2216] = 28; G[2239] = G[2217] = 2;
  const E = { state: { G }, currentModule: 'SPACE', settings: { on: () => enabled }, input: {},
    text: { screenText: () => text }, fb: { cls() {} }, sprites: { put() {} }, display: { overlays: [] } };
  const marker = installMarker(E), before = G.slice();
  E.sprites.put(32, 0, { bank: 'SPACESH.BAS', index: title });
  const [cell] = markerCells(G, title);
  const ctx = { save() {}, restore() {}, strokeRect(x, y, w, h) { drawn.push({ x, y, w, h }); } };
  const draw = () => { drawn.length = 0; E.display.overlays[0](ctx); return drawn; };
  assert.equal(draw().length, 1);
  assert.equal(ctx.strokeStyle, '#ffff55');
  const [box] = drawn, yellow = (x, y) =>
    ((Math.abs(x - box.x) < 1 || Math.abs(x - box.x - box.w) < 1) && y >= box.y - 0.5 && y <= box.y + box.h + 0.5) ||
    ((Math.abs(y - box.y) < 1 || Math.abs(y - box.y - box.h) < 1) && x >= box.x - 0.5 && x <= box.x + box.w + 0.5);
  for (let y = 0; y < cell.size * 2; y++) for (let x = 0; x < cell.size * 2; x++) {
    if (x < 2 || y < 2 || x >= cell.size * 2 - 2 || y >= cell.size * 2 - 2)
      assert.equal(yellow(cell.x * 2 + x + 0.5, cell.y * 2 + y + 0.5), false, 'mission outline preserves the white ship box');
  }
  assert.ok(box.w > 0 && box.h > 0, 'mission target remains visible on both map scales');
  assert.deepEqual(G, before, 'marker never changes game state');
  enabled = false; assert.deepEqual(draw(), []);
  enabled = true; E.input.modal = {}; assert.deepEqual(draw(), []);
  E.input.modal = null; E.currentModule = 'STARPORT'; assert.deepEqual(draw(), []);
  E.currentModule = 'SPACE'; text = ['', '', '    Mission briefing']; assert.deepEqual(draw(), []);
  text = ['', '        KILL LIST']; assert.deepEqual(draw(), []);
  text = []; E.fb.cls(); assert.deepEqual(marker.cells(), []);
}
console.log('marker: ship and mission outlines remain visible on both maps; visibility and read-only checks pass');
