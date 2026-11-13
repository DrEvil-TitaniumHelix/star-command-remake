import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [outDir, filesBase, ...shots] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9400 + (process.pid % 500);
mkdirSync(outDir, { recursive: true });
const prof = join(tmpdir(), 'sp-shoot-' + process.pid);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`,
  '--window-size=640,400', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(path, method = 'GET') {
  for (let i = 0; i < 150; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}${path}`, { method }); const t = await r.text(); try { return JSON.parse(t); } catch { return t; } } catch { await sleep(200); }
  }
  throw new Error('chrome did not start');
}

function session(wsUrl) {
  const ws = new WebSocket(wsUrl); let id = 0; const pend = new Map(); const logs = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) logs.push(m.params.type + ': ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
    else if (m.method === 'Runtime.exceptionThrown') logs.push('exception: ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text));
  };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  return new Promise((res) => { ws.onopen = () => res({ send, logs, close: () => ws.close() }); });
}

async function key(s, ch) {
  const isEnter = ch === '~';
  const k = isEnter ? 'Enter' : ch;
  const base = { key: k, code: isEnter ? 'Enter' : undefined, windowsVirtualKeyCode: isEnter ? 13 : ch.toUpperCase().charCodeAt(0) };
  await s.send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, text: isEnter ? '\r' : ch });
  await s.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
}

process.on('exit', () => chrome.kill());
await json('/json/version');
for (const shot of shots) {
  const [spec, at] = shot.split('@');
  const [id, keys = ''] = spec.split(':');
  const settle = at && !keys ? Number(at) : Number(process.env.SETTLE || 2500);
  const last = at && keys ? Number(at) : Number(process.env.KEYWAIT || 1500);
  const t = await json('/json/new?about:blank', 'PUT');
  const s = await session(t.webSocketDebuggerUrl);
  await s.send('Runtime.enable'); await s.send('Page.enable');
  await s.send('Emulation.setDeviceMetricsOverride', { width: 640, height: 400, deviceScaleFactor: 1, mobile: false });
  const url = filesBase === 'index' ? `http://localhost:8088/index.html?screen=${id}`
    : `http://localhost:8088/modules/starport/dev.html?screen=${id}&files=${encodeURIComponent(filesBase)}`;
  await s.send('Page.navigate', { url });
  if (process.env.WAITFOR) {
    const re = JSON.stringify(process.env.WAITFOR);
    for (let w = 0; w < 1500; w++) {
      const r = await s.send('Runtime.evaluate', { expression: `!!(window.E && E.textLog && E.textLog.some((l) => new RegExp(${re}).test(l)))`, returnByValue: true });
      if (r.result.result.value) break;
      await sleep(100);
    }
  }
  await sleep(settle);
  for (let i = 0; i < keys.length; i++) { await key(s, keys[i]); await sleep(i === keys.length - 1 ? last : 1500); }
  if (process.env.EVAL) console.log('EVAL', JSON.stringify((await s.send('Runtime.evaluate', { expression: process.env.EVAL, awaitPromise: true, returnByValue: true })).result.result.value));
  if (process.env.BURST) {
    const [iv, n] = process.env.BURST.split('x').map(Number);
    for (let b = 0; b < n; b++) {
      const rb = await s.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(outDir, `${id}_b${String(b).padStart(2, '0')}.png`), Buffer.from(rb.result.data, 'base64'));
      await sleep(iv);
    }
  }
  const r = await s.send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, `${id}${keys ? '_' + keys.replace(/~/g, 'ENT') : ''}.png`), Buffer.from(r.result.data, 'base64'));
  console.log(`${id}${keys ? ':' + keys : ''}: ${s.logs.length ? s.logs.join(' | ') : 'ok'}`);
  s.close();
  await json(`/json/close/${t.id}`);
}
chrome.kill();
