import assert from 'node:assert/strict';
import { dom } from './settings-panel.fixture.mjs';
import { installSettingsPanel, panelPosition } from './settings-panel.js';
import { Settings } from './settings.js';
import { Input, KEY } from './input.js';
import { installEscape } from './overlay.js';
import { Files } from './files.js';
import { attachPointer } from './pointer.js';

const posKey = 'starcommand:settings-position', memory = new Map();
const storage = { getItem: k => memory.get(k), setItem: (k, v) => memory.set(k, v) };
assert.deepEqual(panelPosition({ x: 999, y: -20 }, { width: 280, height: 360 }, 640, 400), { x: 360, y: 0 });
assert.deepEqual(panelPosition({ x: Infinity, y: NaN }, { width: 500, height: 500 }, 320, 200), { x: 0, y: 0 });
let d = dom(); globalThis.document = d.doc;
let silence = 0, suspend = 0, resume = 0, frames = 0;
const E = { settings: new Settings({ storage }), files: new Files({ storage }), input: new Input(), currentModule: 'SPACE',
  fb: { dirty: false }, display: { overlays: [], frameHooks: [], present() {} }, chain() {},
  timer: { frame: async () => { frames++; }, wait: async () => {} },
  audio: { clock: () => performance.now() / 1000, silence: () => { silence++; }, ctx: { state: 'running',
    suspend() { suspend++; }, resume() { resume++; } } } };
E.input.attach(d.win); installEscape(E);
assert.equal(d.key('Tab').defaultPrevented, true); assert.equal(E.input.inkey(), KEY.TAB);
d.key('Escape'); let completed = false;
const paused = E.timer.frame().then(() => { completed = true; });
await Promise.resolve(); await Promise.resolve(); assert.equal(completed, false);
d.key('t'); await paused;
assert.equal(E.input.modal, null); assert.equal(E.settingsPanel.isOpen(), true); assert.equal(completed, true);
assert.equal(d.doc.activeElement, d.canvas);
for (const [key, code] of [['ArrowUp', KEY.UP], ['ArrowDown', KEY.DOWN], ['ArrowLeft', KEY.LEFT], ['ArrowRight', KEY.RIGHT]]) {
  assert.equal(d.key(key).defaultPrevented, true); assert.equal(E.input.inkey(), code);
}
assert.equal(d.key('Tab').defaultPrevented, false); assert.equal(E.input.inkey(), '');
await E.timer.frame(); assert.equal(frames, 2); assert.equal(suspend, 1); assert.equal(resume, 1);
E.text = { screenText: () => ['A-Action'] }; E.input.text = E.text; E.sprites = { put() {} }; E.state = { G: new Float32Array(2601) };
d.canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 640, height: 400 });
attachPointer(E, d.canvas, d.win);
d.canvas.fire('click', { clientX: 4, clientY: 4 }); assert.equal(E.input.inkey(), 'A');
assert.equal(E.settingsPanel.isOpen(), true);
let panel = d.doc.getElementById('settings-panel'), title = panel.children[0];
const row = panel.find(n => n.name === 'manual').parent;
assert.equal(row.hidden, true); const manualTab = panel.find(n => n.attrs.role === 'tab' && n.textContent === 'Manual'); assert.equal(manualTab.hidden, true);
assert.deepEqual(panel.all(n => n.attrs.role === 'tab').map(n => n.textContent), ['Crew', 'Help', 'Settings', 'Log book', 'Manual']);
E.manual = { data: { screens: { 'SP-01': {} } } }; E.settingsPanel.open(); assert.equal(row.hidden, false);
E.settings.set('manual', false); E.settingsPanel.open(); assert.equal(row.hidden, false);
E.manual.missing = true; E.display.frameHooks.forEach(f => f()); assert.equal(row.hidden, true);
assert.equal(E.settings.on('manual'), false);
delete E.manual; E.settingsPanel.open(); assert.equal(row.hidden, true);
for (const name of ['sound', 'music', 'effects']) {
  const input = panel.find(n => n.name === name); input.checked = false; input.fire('change');
}
assert.equal(silence, 3); assert.equal(E.settings.hear('effects'), false);
assert.equal(panel.style.left, '16px'); assert.equal(panel.style.top, '16px');
title.fire('pointerdown', { clientX: 26, clientY: 26 });
title.fire('pointermove', { clientX: 210, clientY: 40, pointerId: 2 }); assert.equal(panel.style.left, '16px');
title.fire('pointermove', { clientX: 210, clientY: 40 });
title.fire('pointerup');
assert.deepEqual(JSON.parse(memory.get(posKey)), { x: 200, y: 30 });
E.settingsPanel.close(); E.settingsPanel.open(); assert.equal(panel.style.left, '200px'); assert.equal(panel.style.top, '30px');
title.fire('pointerdown', { clientX: 210, clientY: 40 });
title.fire('pointermove', { clientX: 999, clientY: 999 }); title.fire('pointerup');
assert.deepEqual(JSON.parse(memory.get(posKey)), { x: 360, y: 40 });
d.win.innerWidth = 320; d.win.innerHeight = 240; d.win.fire('resize');
assert.deepEqual(JSON.parse(memory.get(posKey)), { x: 40, y: 16 });
E.settingsPanel.close();
d = dom(); globalThis.document = d.doc; installSettingsPanel(E); E.settingsPanel.open();
panel = d.doc.getElementById('settings-panel'); title = panel.children[0];
assert.equal(panel.style.left, '40px'); assert.equal(panel.style.top, '16px');
const veteran = panel.find(n => n.textContent === 'Load veteran crew'); veteran.fire('click');
const cancel = panel.find(n => n.textContent === 'Cancel');
assert.equal(cancel.parent.hidden, false); assert.equal(d.doc.activeElement, cancel);
cancel.fire('click'); assert.equal(cancel.parent.hidden, true); assert.equal(d.doc.activeElement, veteran);
const close = panel.find(n => n.attrs['aria-label'] === 'Close settings');
close.fire('pointerdown', { clientX: 50, clientY: 26 });
title.fire('pointermove', { clientX: -99, clientY: -99 }); assert.equal(panel.style.left, '40px');
close.fire('click'); assert.equal(E.settingsPanel.isOpen(), false);
for (const value of ['{', 'null', '{"x":"bad","y":null}']) {
  memory.set(posKey, value); d = dom(); globalThis.document = d.doc; installSettingsPanel(E); E.settingsPanel.open();
  panel = d.doc.getElementById('settings-panel'); assert.equal(panel.style.left, '16px'); assert.equal(panel.style.top, '16px');
}
E.settings = new Settings({ storage: { getItem() { throw Error(); }, setItem() { throw Error(); } } });
d = dom(); globalThis.document = d.doc; installSettingsPanel(E); E.settingsPanel.open();
title = d.doc.getElementById('settings-panel').children[0];
title.fire('pointerdown', { clientX: 20, clientY: 20 }); title.fire('pointermove', { clientX: -50, clientY: -50 });
title.fire('pointercancel'); assert.equal(title.parent.style.left, '0px'); assert.equal(title.parent.style.top, '0px');
delete globalThis.document;

const P = { settings: new Settings({ storage: null }), files: new Files({ storage: null }), input: new Input(), currentModule: 'STARPORT',
  state: { G: new Float32Array(2601), str: () => [], toBytes: () => new Uint8Array(10404) }, options: { protection: true },
  text: { screenText: () => ['Type the third word in section 8', 'of the rule book.', '>---'] },
  fb: { dirty: false }, display: { overlays: [], present() {} }, chain() {} };
P.settings.set('saveSlots', false); P.state.G[2265] = 1;
let writes = 0, closed = 0; P.files.write = () => { writes++; }; globalThis.window = { close() { closed++; } };
installEscape(P);
let answer = 'ab'; const prompt = { key(k) { answer += k; } };
P.input.modal = prompt; P.input.device(KEY.ESC);
assert.notEqual(P.input.modal, prompt); assert.equal(answer, 'ab'); assert.equal(P.input.inkey(), '');
P.input.device(KEY.ESC); assert.equal(P.input.modal, prompt); assert.equal(answer, 'ab');
P.input.device('c'); assert.equal(answer, 'abc');
P.input.device(KEY.ESC); P.input.device('r'); assert.equal(P.input.modal, prompt);
P.input.modal = null; P.input.push('x'); P.input.device(KEY.ESC); assert.equal(P.input.inkey(), '');
P.input.device('r'); assert.equal(P.input.inkey(), 'x');
P.input.push(KEY.ESC); assert.equal(P.input.inkey(), KEY.ESC);
const printed = [];
let done = false; const text = { row: 23, col: 2, locate() {}, print(s) { printed.push(s); }, write(s) { printed.push(s); } };
const line = P.input.lineInput(text, '>', 8).then(value => { done = true; return value; });
P.input.device('a'); await Promise.resolve(); P.input.device('b'); await new Promise(setImmediate);
const before = printed.slice();
P.input.device(KEY.ESC); await Promise.resolve(); assert.equal(done, false);
assert.deepEqual(printed, before); assert.equal(P.options.protection, true); assert.equal(P.state.G[2265], 1);
P.input.device('r'); P.input.device('c'); await Promise.resolve(); P.input.device(KEY.ENTER);
assert.equal(await line, 'abc'); assert.equal(writes, 0); assert.equal(closed, 0);
P.input.modal = prompt; P.input.device(KEY.ESC); P.escape.restart(); assert.equal(P.input.modal, null);
assert.throws(() => P.input.inkey());
delete globalThis.window;
console.log('settings panel: live timer/audio, dragging, bounds, persistence, confirmation, prompt restoration and no implicit save/quit passed');
