import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [outDir, ...ids] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.GAME_URL || 'http://localhost:8088/index.html';
const PORT = 9200 + (process.pid % 500);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(outDir, { recursive: true });
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), `in-shoot-${process.pid}`)}`,
  '--window-size=640,400', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });

async function getJSON(path, method = 'GET') {
  for (let i = 0; i < 150; i++) {
    try { return await (await fetch(`http://127.0.0.1:${PORT}${path}`, { method })).json(); } catch { await sleep(200); }
  }
  throw new Error('chrome did not start');
}

function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map(), errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  return new Promise((r) => { ws.onopen = () => r({ send, errors, close: () => ws.close() }); });
}

try {
  for (const shotId of ids) {
    const tab = await getJSON(`/json/new?${encodeURIComponent(`${BASE}?${shotId.includes('=') ? shotId : `screen=${shotId}`}`)}`, 'PUT');
    const s = await connect(tab.webSocketDebuggerUrl);
    await s.send('Emulation.setDeviceMetricsOverride', { width: 640, height: 400, deviceScaleFactor: 1, mobile: false });
    await s.send('Runtime.enable');
    const t0 = Date.now();
    let ready = false;
    const limit = process.env.SETTLE ? Number(process.env.SETTLE) : 180000;
    while (Date.now() - t0 < limit) {
      const r = await s.send('Runtime.evaluate', { expression: 'window.__screenReady === true || window.__devReady === true' });
      if (r.result?.result?.value === true) { ready = true; break; }
      await sleep(250);
    }
    await sleep(300);
    const shot = await s.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 640, height: 400, scale: 1 } });
    writeFileSync(join(outDir, `${shotId.replace(/[=&]/g, '_')}.png`), Buffer.from(shot.result.data, 'base64'));
    console.log(`${shotId}: ${ready ? 'ready' : 'TIMEOUT'} after ${((Date.now() - t0) / 1000).toFixed(1)} s${s.errors.length ? ` errors: ${s.errors.join(' | ')}` : ''}`);
    s.close();
    await getJSON(`/json/close/${tab.id}`).catch(() => {});
  }
} finally {
  chrome.kill();
}
