import assert from 'node:assert/strict';
import { Settings, FEATURES, AUDIO } from './settings.js';
import { Files } from './files.js';
import { Input, KEY } from './input.js';
import { installEscape } from './overlay.js';
import { dom } from './settings-panel.fixture.mjs';

const key = 'starcommand:settings';
const memory = new Map(), storage = { getItem: k => memory.get(k), setItem: (k, v) => memory.set(k, v) };
const s = new Settings({ storage });
for (const name of Object.keys(FEATURES)) assert.equal(s.on(name), true);
for (const name of Object.keys(AUDIO)) assert.equal(s.hear(name), true);
s.set('mouse', false); s.set('music', false);
memory.set(key, JSON.stringify({ ...s.values, retiredMode: true, unused: false }));
const r = new Settings({ storage });
assert.deepEqual(r.values, { mouse: false, music: false });
assert.deepEqual(JSON.parse(memory.get(key)), r.values);
assert.equal(r.on('controlOverlay'), true);
assert.equal(r.hear('music'), false);
r.set('retiredMode', true); r.set('toString', false);
assert.deepEqual(JSON.parse(memory.get(key)), { mouse: false, music: false });
for (const value of ['{', 'null', '[]']) {
  memory.set(key, value);
  assert.equal(new Settings({ storage }).on('mouse'), true);
}
const blocked = new Settings({ storage: { getItem() { throw Error(); }, setItem() { throw Error(); } } });
blocked.set('mouse', false); assert.equal(blocked.on('mouse'), false);
const readonly = new Settings({ storage: { getItem: () => '{"retiredMode":true,"mouse":false}', setItem() { throw Error(); } } });
assert.deepEqual(readonly.values, { mouse: false });
{ let saved = '{"mapZoom":false,"music":false}'; const old = new Settings({ storage: { getItem: () => saved, setItem(k, v) { saved = v; } } });
  assert.deepEqual(old.values, { music: false }); assert.equal(saved, '{"music":false}'); assert(!('mapZoom' in FEATURES)); }

memory.clear();
const { doc, win, canvas, key: press } = dom(); globalThis.document = doc;
const settings = new Settings({ storage });
const E = { settings, files: new Files({ storage }), input: new Input(), currentModule: 'SPACE',
  manual: { data: { screens: { 'SP-01': {} } } },
  fb: { dirty: false }, display: { overlays: [], present() {} }, chain() {} };
E.input.attach(win); installEscape(E);
E.input.device(KEY.ESC); E.input.device('T');
assert.equal(E.input.modal, null); assert.equal(E.settingsPanel.isOpen(), true);
const panel = doc.getElementById('settings-panel');
assert.equal(panel.attrs['aria-modal'], 'false');
const names = [...Object.keys(FEATURES), ...Object.keys(AUDIO)];
assert.equal(panel.all(n => n.type === 'checkbox').length, names.length);
for (const name of names) {
  const input = panel.find(n => n.name === name), before = settings.on(name);
  assert.equal(input.parent.hidden, false);
  assert.equal(input.checked, before);
  input.checked = !before; input.fire('change'); assert.equal(settings.on(name), !before);
  assert.equal(new Settings({ storage }).on(name), !before);
  input.checked = before; input.fire('change'); assert.equal(settings.on(name), before);
}
E.options.protection = true;
const challenge = panel.find(n => n.name === 'noChallenge'); challenge.checked = true; challenge.fire('change');
assert.equal(E.options.protection, false);
challenge.checked = false; challenge.fire('change'); assert.equal(E.options.protection, true);
const sound = panel.find(n => n.name === 'sound'); sound.focus();
for (const k of ['a', 's', 'q', ' ', 'Enter', 'F1', 'F2']) {
  const e = press(k); assert.equal(e.defaultPrevented, false); assert.equal(E.input.inkey(), '');
}
canvas.focus(); press('a'); assert.equal(E.input.inkey(), 'a');
assert.equal(E.settingsPanel.isOpen(), true);
sound.focus(); press('Escape'); assert.equal(E.settingsPanel.isOpen(), false); assert.equal(E.input.modal, null);
assert.equal(doc.activeElement, canvas);
press('Escape'); E.input.modal.click(40, 125); assert.equal(E.settingsPanel.isOpen(), true); assert.equal(E.input.modal, null);
assert.equal(doc.activeElement, canvas);
press('Escape'); assert.equal(E.settingsPanel.isOpen(), false); assert.equal(E.input.modal, null);
press('ArrowRight'); assert.equal(E.input.inkey(), KEY.RIGHT);
press('Escape'); assert.ok(E.input.modal);
press('t'); assert.equal(E.settingsPanel.isOpen(), true); assert.equal(E.input.modal, null);
panel.find(n => n.attrs['aria-label'] === 'Close settings').fire('click'); assert.equal(E.settingsPanel.isOpen(), false);
assert.deepEqual(new Settings({ storage }).values, settings.values);
delete globalThis.document;
console.log('settings: defaults, persistence, retired keys, storage errors, native controls, focus and menu entry passed');
