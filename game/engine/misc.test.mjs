import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Timer } from './timer.js';
import { Input, KEY } from './input.js';
import { installSpeed, cornerButton } from './speed.js';
import { installHelp } from './help.js';
import { missionTargets, markerCells } from './marker.js';
import { manualLines } from './manual.js';

const G = new Float32Array(2601);
G[86] = 188; G[88] = 188;
let on = true;
const E = { input: new Input(), settings: { on: () => on }, timer: new Timer(() => G[86]), display: {} };
const before = Buffer.from(G.buffer).toString('hex');
const original = E.timer.delaySeconds(188);
installSpeed(E);
assert.equal(E.speed.cycle(), 'fast'); assert.equal(E.timer.delaySeconds(188), original / 4);
assert.equal(E.speed.cycle(), 'fastest'); assert.equal(E.timer.delaySeconds(188), original / 16);
on = false; assert.equal(E.timer.delaySeconds(188), original); assert.equal(E.speed.label, 'normal');
assert.equal(Buffer.from(G.buffer).toString('hex'), before);
on = true; assert.equal(E.speed.cycle(), 'normal');
E.input.device(KEY.F2); assert.equal(E.speed.label, 'fast'); assert.equal(E.input.inkey(), '');
E.input.device(KEY.F2); assert.equal(E.speed.label, 'fastest');
E.input.device(KEY.F2); assert.equal(E.speed.label, 'normal');
let modalKey;
E.input.modal = { key: key => { modalKey = key; } };
E.input.device(KEY.F2); assert.equal(modalKey, KEY.F2); assert.equal(E.speed.label, 'normal');
E.input.modal = null;
on = false; E.input.device(KEY.F2); assert.equal(E.input.inkey(), KEY.F2); assert.equal(E.speed.label, 'normal');
on = true; E.input.push(KEY.F2); assert.equal(E.input.inkey(), KEY.F2); assert.equal(E.speed.label, 'normal');
assert.equal(Buffer.from(G.buffer).toString('hex'), before);
G[110] = 1; G[2240] = 150; G[2238] = 10; G[2239] = 11;
G[2216] = 9; G[2217] = 8;
assert.deepEqual(missionTargets(G), [{ x: 10, y: 11 }]);
assert.deepEqual(markerCells(G, 1), [{ x: 48, y: 64, size: 16 }]);
assert.deepEqual(markerCells(G, 0), [{ x: 67, y: 70, size: 3 }]);
G[2216] = 0; assert.deepEqual(markerCells(G, 1), []);
G[110] = 2; assert.deepEqual(missionTargets(G), []);
G[110] = 1; G[2240] = 0; assert.deepEqual(missionTargets(G), []);
const manual = JSON.parse(readFileSync(new URL('../assets/data/manual.json', import.meta.url)));
assert.equal(manual.differences.length, 59);
assert.equal(new Set(manual.differences.map(d => d.id)).size, 59);
assert.ok(Object.keys(manual.screens).length > 70);
for (const [id, screen] of Object.entries(manual.screens)) {
  assert.ok(screen.pages.every(p => manual.pages[p]));
  assert.ok(manualLines(manual, id).join('\n').includes(screen.title));
}
for (const d of manual.differences) assert.ok(Object.keys(manual.screens).some(id => manualLines(manual, id).join('\n').includes(`${d.id}: manual says`)));
console.log('misc: speed scaling/save immutability, mission lifecycle/map geometry, manual screens/59 current discrepancies passed');
// Idle, hover, modal and disabled reveal states without requiring a browser.
const events = {}, buttonEvents = {}, hooks = [];
const mockButton = { style: {}, addEventListener: (name, fn) => { buttonEvents[name] = fn; } };
const mockCanvas = { ownerDocument: { body: { appendChild() {} }, createElement: () => mockButton },
  addEventListener: (name, fn) => { events[name] = fn; },
  getBoundingClientRect: () => ({ right: 640, bottom: 400 }) };
const revealE = { input: {}, display: { canvas: mockCanvas, frameHooks: hooks } };
let revealEnabled = true, opened = false;
cornerButton(revealE, 'Manual', 88, () => revealEnabled, () => {}, () => opened);
const sync = () => hooks.forEach(fn => fn());
sync(); assert.equal(mockButton.hidden, true);
events.mouseenter(); sync(); assert.equal(mockButton.hidden, false);
assert.equal(mockButton.style.top, '312px');
events.mouseleave({ relatedTarget: null }); sync(); assert.equal(mockButton.hidden, true);
opened = true; sync(); assert.equal(mockButton.hidden, false);
revealE.input.modal = {}; sync(); assert.equal(mockButton.hidden, true);
revealE.input.modal = null; revealEnabled = false; sync(); assert.equal(mockButton.hidden, true);
const helpE = { input: {}, text: { screenText: () => [] }, pointer: { regions: () => [] },
  settings: { on: () => true }, speed: { label: 'fast' }, display: { overlays: [] } };
installHelp(helpE);
assert.ok(helpE.help.lines().includes('Manual: use Manual button / screen selector'));
assert.ok(helpE.help.lines().includes('F2: speed (fast; Speed button also cycles)'));
assert.ok(helpE.help.lines().includes('Yellow map box: unfinished mission target'));
helpE.settings.on = () => false;
assert.ok(!helpE.help.lines().some(line => /^(Manual:|F2: speed|Yellow map box:)/.test(line)));
console.log('misc: corner reveal states and setting-gated help lines passed');



