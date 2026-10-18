// shoot_all.mjs (lane dosbox-ref) — re-shoot engine dev-jump screens for a re-compare against the DOSBox refs,
// without touching acceptance/out. Headless Chrome over the DevTools protocol (no window). A screen is captured
// when its dev jump signals ready (window.__screenReady / window.__devReady, INSIDE / SPACE / SPBATTLE / PLBATTLE)
// or, for modules without a signal (STARTUP, STARPORT), when the canvas has not changed for STABLE_MS of real time.
// Needs: python -I tools/serve.py 8093. Usage: node acceptance/ref/scripts/shoot_all.mjs <outDir> <id>...
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [outDir, ...ids] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.GAME_URL || 'http://127.0.0.1:8094/index.html';
const STABLE_MS = Number(process.env.STABLE_MS || 2500);
const LIMIT_MS = Number(process.env.LIMIT_MS || 40000);
const SLOW_STABLE_MS = Number(process.env.SLOW_STABLE_MS || 6000);
const SIGNAL_LIMIT_MS =Number(process.env.SIGNAL_LIMIT_MS || 120000);
const SEND_MS =Number(process.env.SEND_MS || 15000);
const PORT = 9700 + (process.pid % 200);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(outDir, { recursive: true });
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${process.env.SHOOT_PROFILE || join(tmpdir(), `ref-shoot-${process.pid}`)}`,   // SHOOT_PROFILE: e.g. a BYOC profile from tools/byoc/import_check.mjs --profile
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
  // every call times out (a page stuck in a busy loop never answers; the re-shoot of 2026-10-16 hung on PT-04)
  const send = (method, params = {}) => new Promise((r, j) => {
    const i = ++id;
    const t = setTimeout(() => { pending.delete(i); j(new Error(`${method} timed out`)); }, SEND_MS);
    pending.set(i, (m) => { clearTimeout(t); r(m); });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  return new Promise((r) => { ws.onopen = () => r({ send, errors, close: () => ws.close() }); });
}
const PROBE = `(() => { if (window.__screenReady === true || window.__devReady === true) return 'READY';
  const c = document.getElementById('screen'); if (!c) return 'none';
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0;
  for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + 7 * d[i + 1] + 13 * d[i + 2]) >>> 0;
  return String(h); })()`;

try {
  for (const shotId of ids) {
    // PUT-<VERB>[-S7] = the engine PUT demo (game/engine/demo.js), everything else a ?screen= dev jump
    const put = /^PUT-([A-Z]+)(-S7)?$/.exec(shotId);
    // CLASSIC=1: acceptance in Classic mode (every post-v1 addition off, the owner v1.3)
    const query = (put ? `demo=put&verb=${put[1]}${put[2] ? '&mode=7' : ''}` : `screen=${shotId}`) + (process.env.CLASSIC ? '&classic=1' : '');
    const tab = await getJSON(`/json/new?${encodeURIComponent(`${BASE}${BASE.includes('?') ? '&' : '?'}${query}`)}`, 'PUT');
    const s = await connect(tab.webSocketDebuggerUrl);
    try {
    await s.send('Emulation.setDeviceMetricsOverride', { width: 640, height: 400, deviceScaleFactor: 1, mobile: false });
    await s.send('Runtime.enable');
    if (process.env.POST7) {
      // POST7=1: the session state after a SCREEN 7 module (SC-2 addendum): set E.fb.ega7Seen as soon as index.html
      // publishes window.E, before the module's own SCREEN 1 / PALETTE calls; then reload so the hook is active.
      await s.send('Page.enable');
      await s.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { let v; Object.defineProperty(window, 'E', { configurable: true,
        get() { return v; }, set(x) { v = x; try { x.fb.ega7Seen = true; } catch (e) {} } }); })();` });
      await s.send('Page.reload', { ignoreCache: true });
      await sleep(300);
    }
    const t0 = Date.now();
    let how = 'TIMEOUT', last = null, since = Date.now();
    // INSIDE and PLBATTLE dev jumps always signal ready: captured only on the signal (a scripted key path pauses
    // longer than STABLE_MS before its first key; IN-02a/IN-02b were caught on the idle screen). SPACE/SPBATTLE
    // signal only some ids: ready, or a canvas quiet for SLOW_STABLE_MS. Others (SU/CM/PT/PUT): STABLE_MS.
    const signalOnly = /^(IN|PB)-/.test(shotId);
    const stableMs = /^(SP|SB)-/.test(shotId) ? SLOW_STABLE_MS : STABLE_MS;
    while (Date.now() - t0 < (signalOnly ? SIGNAL_LIMIT_MS : LIMIT_MS)) {
      const v = (await s.send('Runtime.evaluate', { expression: PROBE })).result?.result?.value;
      if (v === 'READY') { how = 'ready'; break; }
      if (v !== last) { last = v; since = Date.now(); } else if (!signalOnly && Date.now() - since >= stableMs && Date.now() - t0 > 1500) { how = 'stable'; break; }
      await sleep(250);
    }
    if (process.env.KEYS) {
      // KEYS="f a" (space separated; Enter, Space, ArrowUp.. by name): typed after the screen is ready, then wait for a stable canvas
      for (const k of process.env.KEYS.split(' ')) {
        const key = k;
        const text = k.length === 1 ? k : (k === 'Enter' ? String.fromCharCode(13) : k === 'Space' ? ' ' : '');
        await s.send('Input.dispatchKeyEvent', { type: 'keyDown', key, text, unmodifiedText: text, code: k.length === 1 ? `Key${k.toUpperCase()}` : k });
        await s.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: k.length === 1 ? `Key${k.toUpperCase()}` : k });
        await sleep(Number(process.env.KEY_GAP || 1500));
      }
      let l2 = null, t2 = Date.now(), s2 = Date.now();
      while (Date.now() - t2 < LIMIT_MS) {
        const v = (await s.send('Runtime.evaluate', { expression: PROBE.replace("if (window.__screenReady === true || window.__devReady === true) return 'READY';", '') })).result?.result?.value;
        if (v !== l2) { l2 = v; s2 = Date.now(); } else if (Date.now() - s2 >= STABLE_MS) break;
        await sleep(250);
      }
    }
    await sleep(300);
    const shot = await s.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 640, height: 400, scale: 1 } });
    writeFileSync(join(outDir, `${shotId}${process.env.POST7 ? '_post7' : ''}${process.env.KEYS ? '_k' : ''}.png`), Buffer.from(shot.result.data, 'base64'));
    console.log(`${shotId}: ${how} after ${((Date.now() - t0) / 1000).toFixed(1)} s${s.errors.length ? ` errors: ${s.errors.join(' | ')}` : ''}`);
    } catch (e) {
      console.log(`${shotId}: HUNG (${e.message}), no shot`);
    }
    s.close();
    await getJSON(`/json/close/${tab.id}`).catch(() => {});
  }
} finally {
  chrome.kill();
}
