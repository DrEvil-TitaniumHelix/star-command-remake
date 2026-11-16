import assert from 'node:assert/strict';
import { Files } from './files.js';
import { State } from './state.js';
import { Data } from './data.js';
import { Input, KEY } from './input.js';
import { Framebuffer } from './display.js';
import { installEscape, captureSave } from './overlay.js';
import { Settings } from './settings.js';
import { dom } from './settings-panel.fixture.mjs';
import { Timer, TICKS_PER_SEC } from './timer.js';

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function fixture(module = 'STARPORT', settings, files = new Files({ baseDir: new URL('../assets/files/', import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1') })) {
  const state = new State(files); await state.load();
  const data = new Data(files), names = await data.charName();
  state.str('ShipName$')[0] = names[0];
  names.slice(1).forEach((n, i) => { state.str('CrewName$')[i + 1] = n; });
  const E = { files, state, data, input: new Input(), fb: new Framebuffer(), timer: new Timer(),
    settings, currentModule: module, display: { overlays: [], present() {} }, chain() { throw new Error('chain'); } };
  installEscape(E); return E;
}
function menuWait(E) {
  E.text = { screenText: () => ['Main Menu', 'G-Game Save', 'Select Option'] };
  assert.equal(E.input.inkey(), '');
}
function menuText(E) {
  const rows = new Map(), ctx = { save() {}, restore() {}, fillRect() {}, strokeRect() {}, translate() {},
    fillText(ch, x, y) { rows.set(y, (rows.get(y) ?? '') + ch); } };
  E.display.overlays.forEach(draw => draw(ctx));
  return [...rows.values()];
}
for (const slots of [false, true]) for (const route of ['key', 'arrows', 'click']) {
  const files = new Files(), state = new State(files);
  for (let m = 1; m <= 8; m++) state.setCrew(m, 15, 30);
  state.save(); files.writeText('CHARNAME', 'Ship,A,B,C,D,E,F,G,H,');
  const E = await fixture('PLBATTLE', undefined, files), before = files.saved('CHARINFO.BAS').slice();
  let loads = 0, saves = 0, settings = 0, closed = 0, dead = true;
  E.slots.enabled = () => slots;
  E.slots.openLoad = () => loads++;
  E.slots.openSave = () => saves++;
  E.settingsPanel = { open: () => settings++, isOpen: () => false };
  E.text = { screenText: () => [dead ? '           You Are All Dead' : 'Movement Phase 3'] };
  for (let m = 3; m <= 8; m++) E.state.setCrew(m, 15, 0);
  const pick = (k, i) => {
    if (route === 'key') E.input.device(k);
    else if (route === 'click') E.input.modal.click(40, 65 + i * 20);
    else { for (let j = 0; j < i; j++) E.input.device(KEY.DOWN); E.input.device(KEY.ENTER); }
  };
  const labels = ['R-Resume', 'Q-Quit without saving', 'T-Settings', ...(slots ? ['L-Load'] : [])];
  E.input.device(KEY.ESC);
  assert.deepEqual(menuText(E), labels);
  E.input.device('s'); E.input.device('Y');
  assert.deepEqual(menuText(E), labels, 'hidden save shortcut does nothing');
  assert.equal(saves, 0);
  if (slots) {
    pick('L', 3); E.input.device('N'); assert.equal(loads, 0);
    E.input.device('L'); E.input.device('Y'); assert.equal(loads, 1);
  } else { E.input.device('L'); E.input.device('Y'); assert.deepEqual(menuText(E), labels); }
  E.escape.resume(); E.input.device(KEY.ESC);
  pick('T', 2); assert.equal(settings, 1); assert.equal(E.input.modal, null);
  dead = false; E.input.device(KEY.ESC);
  assert.ok(menuText(E).includes('S-Save & Quit'), 'save returns on a normal screen');
  E.input.device('S'); assert.ok(menuText(E).some(s => s.includes('Quit? (Y/N)')));
  if (slots) { E.input.device('Y'); assert.equal(saves, 1); } else E.input.device('N');
  E.escape.resume(); dead = true; E.input.device(KEY.ESC);
  E.input.device(KEY.UP); E.input.device(KEY.DOWN); E.input.device(KEY.ENTER);
  assert.equal(E.input.modal, null, 'navigation wraps through visible rows');
  E.input.device(KEY.ESC);
  const win = globalThis.window;
  globalThis.window = { close: () => closed++ };
  try {
    pick('Q', 1); assert.deepEqual(menuText(E), ['Quit without saving? (Y/N)']);
    E.input.device('N'); assert.equal(closed, 0);
    E.input.device('Q'); E.input.device('Y'); assert.equal(closed, 1);
    assert.deepEqual(files.saved('CHARINFO.BAS'), before);
  } finally { if (win === undefined) delete globalThis.window; else globalThis.window = win; }
}
console.log('overlay: death menu, save guard, load, quit, settings, keys and clicks passed');
{
  const E = await fixture(), before = E.state.toBytes(), lock = E.state.G[2265];
  const point = captureSave(E);
  assert.equal(E.state.G[2265], lock);
  const expected = before.slice(); expected.fill(0, 2265 * 4, 2266 * 4);
  if (lock === 0) expected.set(before.subarray(2265 * 4, 2266 * 4), 2265 * 4);
  assert.deepEqual(point.body, expected);
  E.input.device(KEY.ESC); assert.ok(E.input.modal);
  E.input.device('r'); assert.equal(E.input.modal, null);
  assert.deepEqual(E.state.toBytes(), before); assert.equal(E.input.inkey(), '');
  for (const k of [KEY.ESC, 'B']) { E.input.device(KEY.ESC); E.input.device(k); assert.equal(E.input.modal, null); }
  E.input.device(KEY.ESC); E.input.device(KEY.DOWN); E.input.device(KEY.UP); E.input.device(KEY.ENTER);
  assert.equal(E.input.modal, null);
  E.input.device(KEY.ESC); E.input.modal.click(40, 65); assert.equal(E.input.modal, null);
  E.input.device(KEY.ESC); E.input.modal.click(0, 0); assert.ok(E.input.modal);
  let finished = false; const wait = E.timer.wait(0).then(() => { finished = true; });
  await sleep(20); assert.equal(finished, false);
  E.input.device('R'); await wait; assert.equal(finished, true);
  E.state.G[2200] += 1;
  menuWait(E);
  E.input.device(KEY.ESC); E.input.device('s'); await sleep(10);
  const saved = await E.files.bload('CHARINFO.BAS');
  const expectedSave = captureSave(E);
  assert.deepEqual(saved.body, expectedSave.body);
  assert.deepEqual(await E.data.charName(), point.names);
  assert.equal(await E.files.readText('CHARNAME'), point.names.map(n => `${n},`).join('') + '\x1a');
  const fresh = new State(E.files); await fresh.load(); assert.equal(fresh.G[2200], E.state.G[2200]);
}
{
  const E = await fixture();
  const point = captureSave(E);
  E.files.write('INMAP-1.BAS', new Uint8Array([5, 6]));
  assert.throws(() => E.chain('SPACE'), /chain/);
  E.currentModule = 'INSIDE'; E.state.G[2200] += 23;
  E.state.str('CrewName$')[1] = 'Changed';
  E.files.write('INMAP-1.BAS', new Uint8Array([8, 9]));
  E.files.write('IN-1.BAS', new Uint8Array([1, 2, 3]));
  E.input.device(KEY.ESC); E.input.device(KEY.DOWN); E.input.device(KEY.ENTER); await sleep(10);
  assert.notDeepEqual(E.files.saved('IN-1.BAS'), null, 'away from a starport: nothing written before Y');
  E.input.device('N'); assert.ok(E.input.modal); E.input.device('S'); E.input.device('Y'); await sleep(10);
  assert.deepEqual((await E.files.bload('CHARINFO.BAS')).body, point.body);
  assert.equal(E.files.saved('IN-1.BAS'), null);
  assert.deepEqual(E.files.saved('INMAP-1.BAS'), new Uint8Array([5, 6]));
  assert.deepEqual(await E.data.charName(), point.names);
}
{
  const E = await fixture('SPACE'), before = await E.files.read('CHARINFO.BAS');
  E.state.G[2200] += 42;
  E.input.device(KEY.ESC); E.input.device('S'); E.input.device('Y'); await sleep(10);
  assert.deepEqual(await E.files.read('CHARINFO.BAS'), before);
}
{
  const E = await fixture(); E.input.device(KEY.ESC); E.input.device('Q');
  assert.equal(E.files.saved('CHARINFO.BAS'), null);
}
{
  let closed = 0, reloads = 0; globalThis.window = { close: () => closed++ }; globalThis.location = { search: '', reload: () => reloads++ };
  const E = await fixture(); E.state.G[2200] += 1;
  E.input.device(KEY.ESC); E.input.device('Q'); E.input.device('N'); assert.equal(closed, 0); assert.ok(E.input.modal);
  E.input.device('Q'); E.input.device(KEY.ESC); assert.equal(closed, 0); assert.ok(E.input.modal);
  E.input.device('Q'); E.input.device('Y'); assert.equal(closed, 1);
  await sleep(350); E.input.device(KEY.ENTER); assert.equal(reloads, 1);
  const F = await fixture('STARCOMM'); F.input.device(KEY.ESC); F.input.device('Q'); assert.equal(closed, 2);
  const G = await fixture(); G.state.save(); G.input.device(KEY.ESC); G.input.device('Q'); assert.equal(closed, 3);
  const H = await fixture(); H.files.storage = { getItem: () => null, setItem() { throw Error('quota'); }, removeItem() {} };
  menuWait(H); H.state.G[2200] += 1;
  H.input.device(KEY.ESC); H.input.device('S'); await sleep(10);
  assert.equal(closed, 3, 'failed save does not quit'); assert.ok(H.input.modal); assert.ok(H.files.writeError);
  delete globalThis.window; delete globalThis.location;
}
{
  const E = await fixture();
  const waiting = E.timer.wait(0.08);
  E.input.device(KEY.ESC);
  const frozen = E.timer.now(); await sleep(110);
  assert.equal(E.timer.now(), frozen);
  E.input.device('R'); const resumed = performance.now(); await waiting;
  assert.ok(performance.now() - resumed > 45, 'remaining wait preserved after pause');
  const ticks = E.timer.now() * TICKS_PER_SEC;
  assert.ok(Math.abs(ticks - Math.round(ticks)) < 0.2, 'paused TIMER remains BIOS tick quantised');
}
for (const reachedMenu of [false, true]) {
  const E = await fixture('SPACE');
  E.state.G[314] = 1; E.state.G[311] = 2;
  const arrivalPoint = captureSave(E);
  E.currentModule = 'STARPORT';
  E.state.G[78] += 1;
  if (reachedMenu) menuWait(E);
  const point = reachedMenu ? captureSave(E) : null;
  E.input.push('B'); E.input.inkey();
  E.text = { screenText: () => ['Press ENTER Key'] };
  E.state.G[78] += 10;
  E.input.device(KEY.ESC); E.input.device('S'); await sleep(10);
  assert.equal(E.state.G[314], 1, 'kill marker not cleared yet');
  assert.deepEqual((await E.files.bload('CHARINFO.BAS')).body, (point ?? arrivalPoint).body);
}
{
  const E = await fixture();
  E.state.str('CrewName$')[3] = undefined;
  E.state.G[2265] = 1; E.options = { protection: true };
  menuWait(E);
  const names = captureSave(E).names.map(n => n ?? '');
  E.input.device(KEY.ESC); E.input.device('S'); await sleep(10);
  assert.equal(await E.files.readText('CHARNAME'), names.map(n => `${n},`).join('') + '\x1a');
  assert.equal(E.state.G[2265], 1);
  const saved = new State(E.files); await saved.load(); assert.equal(saved.G[2265], 0);
}
{
  const memory = new Map(), storage = { getItem: k => memory.get(k), setItem: (k,v) => memory.set(k,v) };
  const settings = new Settings({storage});
  const { doc } = dom(); globalThis.document = doc;
  const F = await fixture('STARPORT', settings);
  assert.equal(F.options.protection, false);
  F.input.device(KEY.ESC); F.input.device('T');
  assert.equal(F.input.modal, null); assert.equal(F.settingsPanel.isOpen(), true);
  const panel = doc.getElementById('settings-panel'), mouse = panel.find(n => n.name === 'mouse');
  mouse.checked = false; mouse.fire('change');
  assert.equal(settings.on('mouse'), false);
  assert.equal(new Settings({storage}).on('mouse'), false);
  const challenge = panel.find(n => n.name === 'noChallenge'); challenge.checked = false; challenge.fire('change');
  assert.equal(F.options.protection, true);
  F.settingsPanel.close(); assert.equal(F.input.modal, null);
  F.input.device(KEY.ESC); F.input.modal.click(40,125);
  mouse.checked = true; mouse.fire('change'); assert.equal(settings.on('mouse'), true);
  F.settingsPanel.close(); delete globalThis.document;
  const {attachPointer} = await import('./pointer.js');
  const listeners = {}, canvas = {style:{}, addEventListener:(n,f)=>listeners[n]=f,
    getBoundingClientRect:()=>({left:0,top:0,width:640,height:400})};
  const pointerE = {settings, input:{modal:{click(){assert.fail('disabled click');}}},sprites:{put(){}}};
  settings.set('mouse',false); attachPointer(pointerE,canvas);
  assert.deepEqual(pointerE.pointer.regions(),[]);
  listeners.click({button:0}); listeners.mousemove({});
  assert.equal(canvas.style.cursor,'default');
  const blocked = new Settings({storage:{getItem(){throw Error();},setItem(){throw Error();}}});
  blocked.set('mouse',false); assert.equal(blocked.on('mouse'),false);
}
console.log('overlay: save bytes, checkpoint rollback, disk fallback, keys, clicks, pause, quit passed');

if (process.argv.includes('--browser')) {
  const { spawn } = await import('node:child_process');
  const { mkdirSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const port = 9900 + process.pid % 100;
  const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), `escape-${process.pid}`)}`, '--window-size=640,400', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}`;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) { try { await fetch(base + '/json/version'); ready = true; break; } catch { await sleep(100); } }
    assert.ok(ready, 'Chrome started');
    mkdirSync('acceptance/out/v1.1', { recursive: true });
    for (const id of ['PT-02', 'SP-01']) {
      const tab = await (await fetch(base + '/json/new?' + encodeURIComponent(`http://127.0.0.1:8094/index.html?screen=${id}`), { method: 'PUT' })).json();
      const ws = new WebSocket(tab.webSocketDebuggerUrl), pending = new Map(); let serial = 0;
      ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); } };
      await new Promise(r => { ws.onopen = r; });
      const send = (method, params = {}) => new Promise((resolve, reject) => {
        const n = ++serial, timeout = setTimeout(() => reject(new Error(method + ' timeout')), 15000);
        pending.set(n, m => { clearTimeout(timeout); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
        ws.send(JSON.stringify({ id: n, method, params }));
      });
      const evaluate = async expression => {
        const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
        return r.result.value;
      };
      const key = async k => {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, text: k.length === 1 ? k : '' });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k });
      };
      try {
        await send('Emulation.setDeviceMetricsOverride', { width: 640, height: 400, deviceScaleFactor: 1, mobile: false });
        await sleep(9000);
        assert.equal(await evaluate("document.querySelector('#msg').textContent"), '');
        const before = await evaluate('JSON.stringify(Array.from(E.fb.pix))');
        const beforeShot = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(`acceptance/out/v1.1/${id}-before.png`, Buffer.from(beforeShot.data, 'base64'));
        await key('Escape'); assert.equal(await evaluate('!!E.input.modal'), true);
        await sleep(200);
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(`acceptance/out/v1.1/${id}-escape.png`, Buffer.from(shot.data, 'base64'));
        await key('r'); assert.equal(await evaluate('!!E.input.modal'), false);
        assert.equal(await evaluate('JSON.stringify(Array.from(E.fb.pix))'), before);
        const resumedShot = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(`acceptance/out/v1.1/${id}-resume.png`, Buffer.from(resumedShot.data, 'base64'));
        assert.equal(resumedShot.data, beforeShot.data, 'resume screenshot identical');
        await evaluate('(async () => { window.close = () => {}; window.__diskBefore = (await E.files.bload("CHARINFO.BAS")).body; window.__escapeBefore = E.state.toBytes(); E.state.G[2200] += 1; })()');
        await key('Escape'); await key('s'); await sleep(400);
        const evidence = await evaluate(`(async () => {
          const disk = await E.files.bload('CHARINFO.BAS');
          const changed = []; for (let i=0;i<disk.body.length;i++) if(disk.body[i] !== window.__escapeBefore[i]) changed.push(i);
          return {module:E.currentModule, changed, diskUnchanged:disk.body.every((v,i)=>v===window.__diskBefore[i]), persisted:!!localStorage.getItem('starcommand:file:CHARINFO.BAS')};
        })()`);
        assert.ok(evidence.persisted);
        if (id === 'PT-02') assert.ok(evidence.changed.every(i => Math.floor(i/4) === 2200 || Math.floor(i/4) === 2265));
        else assert.ok(evidence.diskUnchanged, 'SPACE direct jump preserves last disk save exactly');
        await send('Page.navigate', { url: 'http://127.0.0.1:8094/index.html' }); await sleep(3000);
        await key(' '); await sleep(3000);
        assert.ok(await evaluate("E.text.screenText().join(' ').includes('1-Play Star Command')"));
        await key('1'); await sleep(6000);
        evidence.reloadedModule = await evaluate('E.currentModule');
        assert.equal(evidence.reloadedModule, 'STARPORT');
        writeFileSync(`acceptance/out/v1.1/${id}-escape.json`, JSON.stringify(evidence, null, 2));
        console.log(id, { changedBytes: evidence.changed.length, diskUnchanged: evidence.diskUnchanged, persisted: evidence.persisted, reloadedModule: evidence.reloadedModule });
      } finally { ws.close(); await fetch(base + '/json/close/' + tab.id); }
    }
  } finally { chrome.kill(); }
}

if (process.argv.includes('--settings-shots')) {
  const {spawn} = await import('node:child_process');
  const {mkdirSync,writeFileSync} = await import('node:fs');
  const {tmpdir} = await import('node:os');
  const {join} = await import('node:path');
  const server = spawn('python',['-I','tools/serve.py','8097'],{stdio:'ignore'});
  const port = 9700 + process.pid % 100;
  const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    ['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${join(tmpdir(),'settings-'+process.pid)}`,'about:blank'],{stdio:'ignore'});
  let ws;
  try {
    let tab;
    for(let i=0;i<100;i++) { try { tab=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();break; } catch {await sleep(100);} }
    ws=new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
    let id=0; const pending=new Map();
    ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)(m);pending.delete(m.id);}};
    const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,m=>m.error?reject(m.error):resolve(m.result));ws.send(JSON.stringify({id:n,method,params}));});
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    await send('Emulation.setDeviceMetricsOverride',{width:640,height:400,deviceScaleFactor:1,mobile:false});
    mkdirSync('acceptance/out/v1.3',{recursive:true});
    {
      await send('Page.navigate',{url:'http://127.0.0.1:8097/index.html?screen=PT-02'});
      await sleep(2500);
      assert.equal(await evaluate("document.querySelector('#msg').textContent"),'');
      await evaluate("window.__before=Array.from(E.fb.pix); E.input.onDeviceEscape(); E.input.modal.key('T'); E.display.present(true)");
      const shot=await send('Page.captureScreenshot',{format:'png'});
      writeFileSync('acceptance/out/v1.3/settings-on.png',Buffer.from(shot.data,'base64'));
      assert.equal(await evaluate('E.fb.pix.every((v,i)=>v===window.__before[i])'),true);
      await evaluate("document.querySelector('#settings-panel').dispatchEvent(new KeyboardEvent('keydown', { key:'a', bubbles:true })); E.display.present(true)");
      assert.equal(await evaluate('Object.keys(E.settings.values).length'),0);
      assert.equal(await evaluate('E.input.modal'), null);
      await evaluate("document.querySelector('[aria-label=\"Close settings\"]').click()");
      assert.equal(await evaluate('E.fb.pix.every((v,i)=>v===window.__before[i])'),true);
    }
    console.log('settings browser shots and framebuffer invariance passed');
  } finally {ws?.close();chrome.kill();server.kill();}
}
