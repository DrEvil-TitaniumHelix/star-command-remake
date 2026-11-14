import assert from 'node:assert/strict';
import { dom } from './settings-panel.fixture.mjs';
import { snapshot, handle, features, installPlus, runPlusWindow, NAME } from './plus.js';
import { installManual } from './manual.js';
import { installHelp } from './help.js';
import { installEscape } from './overlay.js';
import { Settings } from './settings.js';
import { Input, KEY } from './input.js';
import { Files } from './files.js';

const mem = new Map(), storage = { getItem: k => mem.get(k), setItem: (k, v) => mem.set(k, v) };
const d = dom(); globalThis.document = d.doc;
let silence = 0, screen = ['A-Personnel', 'B-Buy'];
const E = { settings: new Settings({ storage }), files: new Files({ storage }), input: new Input(), currentModule: 'SPACE',
  fb: { dirty: false }, display: { overlays: [], frameHooks: [], present() {} }, chain() {},
  timer: { frame: async () => {}, wait: async () => {} }, audio: { silence: () => { silence++; } },
  text: { screenText: () => screen }, pointer: { regions: () => screen.map((s, i) => ({ kind: 'menu', key: s[0].toLowerCase(), x: 0, y: i * 8, w: s.length * 8 })) },
  logbook: { entries: () => [{ kind: 'arrival', text: 'Start → STARPORT' }] } };
E.input.attach(d.win); installEscape(E); installHelp(E);
assert.equal(E.plus, undefined);
let s = snapshot(E);
assert.equal(s.t, 'state'); assert.equal(s.module, 'SPACE');
assert(s.help.screen.includes('A: Personnel')); assert(s.help.general.some(l => l.startsWith('F1:')));
assert.equal(s.settings.music, true); assert.deepEqual(s.log, ['[arrival] Start → STARPORT']); assert.equal(s.manual, null);
assert.equal(Object.hasOwn(s.settings, 'manual'), false);
const raw = [{ kind: 'credits', text: 'Credits 16852.595703125 (+16852.595703125)' }], copy = JSON.stringify(raw);
assert.deepEqual(snapshot({ ...E, logbook: { entries: () => raw } }).log, ['[credits] Credits 16,853 (+16,853)']);
assert.equal(JSON.stringify(raw), copy);
const data = { screens: { 'SP-01': { title: 'Long range', pages: [1], differences: [] } }, pages: { 1: 'Map controls.' }, differences: [] };
for (const manual of [undefined, { missing: true, data }, { data: null }, { data: {} }, { data: { screens: {} } }]) {
  E.manual = manual; const state = snapshot(E);
  assert.equal(Object.hasOwn(state.settings, 'manual'), false); assert.equal(state.manual, null);
}
E.manual = { data }; assert(snapshot(E).manual.includes('Map controls.')); assert.equal(snapshot(E).settings.manual, true);
E.settings.set('manual', false); assert.equal(snapshot(E).settings.manual, false); assert.equal(snapshot(E).manual, null);
E.settings.set('manual', true); delete E.manual;
screen = ['1-Play Star Command']; E.currentModule = 'STARCOMM';
s = snapshot(E); assert(s.help.screen.includes('1: Play Star Command')); assert(!s.help.screen.includes('A: Personnel'));
const sent = [];
handle(E, { t: 'hello' }, m => sent.push(m)); assert.equal(sent.pop().t, 'state');
handle(E, { t: 'set', name: 'music', value: false }, m => sent.push(m));
assert.equal(E.settings.on('music'), false); assert.equal(E.settings.hear('music'), false); assert.equal(silence, 1);
assert.equal(sent.pop().settings.music, false); assert.equal(JSON.parse(mem.get('starcommand:settings')).music, false);
handle(E, { t: 'set', name: 'bogus', value: true }, m => sent.push(m)); assert.equal(sent.length, 0);
handle(E, null, m => sent.push(m)); assert.equal(sent.length, 0);
E.settings.set('logBook', false); assert.equal(snapshot(E).log, null);
assert.equal(features({ x: 10, y: 20, w: 300, h: 500 }), 'popup,resizable,width=300,height=500,left=10,top=20');
assert.equal(features(null, { screenX: 5, screenY: 6, outerWidth: 800, outerHeight: 600 }), 'popup,resizable,width=440,height=600,left=805,top=6');
assert.equal(features({ x: 'bad' }, {}), 'popup,resizable,width=440,height=600,left=800,top=0');

d.key('F1'); assert.equal(E.help.isOpen(), true); assert.equal(E.settingsPanel.tab, 'help');
d.key('Escape'); assert.equal(E.help.isOpen(), false); assert.equal(E.input.modal, null);
d.key('F1'); E.settingsPanel.open('settings'); assert.equal(E.settingsPanel.isOpen(), true);
d.key('Escape'); assert.equal(E.settingsPanel.isOpen(), false); assert.equal(E.help.isOpen(), false); assert.equal(E.input.modal, null);
d.key('Escape'); assert.notEqual(E.input.modal, null); d.key('r'); assert.equal(E.input.modal, null);
d.key('Escape'); d.key('t'); assert.equal(E.settingsPanel.tab, 'settings'); assert.equal(E.settingsPanel.isOpen(), true);
d.key('Escape'); assert.equal(E.settingsPanel.isOpen(), false); assert.equal(E.input.modal, null);

const opened = [], W = { open: (...a) => { opened.push(a); return { focus() {}, closed: false }; }, localStorage: storage, addEventListener() {} };
const P = { display: {}, settings: E.settings }; installPlus(P, W);
mem.set('starcommand:plus-window', '{"x":1,"y":2,"w":3,"h":4}');
assert.equal(P.plus.open('settings'), true); const gid = opened[0][0].match(/^plus\.html\?g=(\w+)#settings$/)?.[1];
assert(gid); assert.deepEqual(opened[0].slice(1), [`${NAME}-${gid}`, 'popup,resizable,width=3,height=4,left=1,top=2']);
{
  const bus = [], Bus = class { constructor() { bus.push(this); } postMessage(m) { for (const c of bus) if (c !== this) c.onmessage?.({ data: m }); } };
  const hit = [], game = n => ({ display: { frameHooks: [] }, settings: E.settings, settingsPanel: { veteran: () => hit.push(n) } });
  const urls = [], mk = () => ({ open: u => { urls.push(u); return { focus() {}, closed: false }; }, localStorage: storage, addEventListener() {}, BroadcastChannel: Bus });
  const A = game('A'), Z = game('Z'); installPlus(A, mk()); installPlus(Z, mk()); A.plus.open('settings'); Z.plus.open('settings');
  assert.notEqual(urls[0], urls[1]);
  const pw = dom(); Object.assign(pw.win, { location: { hash: '#settings', search: urls[0].slice(9, urls[0].indexOf('#')) }, history: { replaceState() {} }, BroadcastChannel: Bus, setInterval() {}, localStorage: storage });
  runPlusWindow(pw.doc, pw.win);
  A.display.frameHooks[0](1000); Z.display.frameHooks[0](1000);
  pw.doc.body.find(n => n.textContent === 'Load' && n.tagName === 'BUTTON').onclick();
  assert.deepEqual(hit, ['A']);
}
const B = { display: {} }; installPlus(B, { open: () => null, addEventListener() {} }); assert.equal(B.plus.open(), false);

const ui = dom(), channel = { postMessage() {} };
Object.assign(ui.win, { location: { hash: '#manual' }, history: { replaceState(a, b, hash) { ui.win.location.hash = hash; } },
  BroadcastChannel: class { constructor() { return channel; } }, setInterval() {}, localStorage: storage });
runPlusWindow(ui.doc, ui.win);
const tab = id => ui.doc.body.find(n => n.dataset.tab === id), main = ui.doc.body.find(n => n.tagName === 'MAIN');
assert.equal(tab('manual').hidden, true);
const update = () => channel.onmessage({ data: snapshot(E) });
update(); assert.equal(tab('help').attrs['aria-selected'], 'true'); assert.equal(ui.win.location.hash, '#help');
tab('settings').onclick(); assert.equal(main.find(n => n.name === 'manual'), undefined);
E.currentModule = 'SPACE'; E.manual = { data }; update();
assert.equal(tab('manual').hidden, false); assert.equal(main.find(n => n.name === 'manual').checked, true);
tab('manual').onclick(); assert(main.find(n => n.textContent === 'Map controls.'));
E.settings.set('manual', false); update(); assert.equal(tab('manual').hidden, false);
assert(main.find(n => n.textContent === 'The manual is off (Settings tab).'));
tab('settings').onclick(); assert.equal(main.find(n => n.name === 'manual').checked, false);
E.manual.missing = true; update(); assert.equal(tab('manual').hidden, true); assert.equal(main.find(n => n.name === 'manual'), undefined);
E.manual.missing = false; E.settings.set('manual', true); update(); tab('manual').onclick();
delete E.manual; update(); assert.equal(tab('help').attrs['aria-selected'], 'true'); assert.equal(tab('manual').hidden, true);
assert(!main.find(n => /manual is off|not available/.test(n.textContent)));

const fetch0 = globalThis.fetch, warn0 = console.warn;
try {
  console.warn = () => {};
  for (const response of [null, { ok: false, status: 404 }, { ok: true, json: async () => null },
    { ok: true, json: async () => ({}) }, { ok: true, json: async () => ({ screens: {} }) },
    { ok: true, json: async () => { throw Error(); } }, { ok: true, json: async () => data }]) {
    globalThis.fetch = async () => { if (!response) throw Error(); return response; };
    const m = dom(), settings = new Settings({ storage: null });
    const engine = { currentModule: 'SPACE', input: {}, settings, display: { canvas: m.canvas, frameHooks: [], overlays: [] } };
    await installManual(engine);
    const button = m.doc.body.find(n => n.textContent === 'Manual');
    if (engine.manual.missing) { assert.equal(button, undefined); assert.equal(engine.display.overlays.length, 0); }
    else {
      const tick = () => engine.display.frameHooks.forEach(f => f());
      m.canvas.fire('mouseenter'); tick(); assert.equal(button.hidden, false);
      button.onclick(); assert.equal(engine.manual.isOpen, true);
      settings.set('manual', false); tick(); assert.equal(button.hidden, true); assert.equal(engine.manual.isOpen, false);
      settings.set('manual', true); engine.manual.missing = true; tick(); assert.equal(button.hidden, true);
    }
  }
} finally { globalThis.fetch = fetch0; console.warn = warn0; }
delete globalThis.document;
console.log('plus: snapshot/hello/set protocol, window features, F1/Esc/Esc T order with the in-page fallback passed');
