import { spawn } from 'node:child_process';
import { writeFileSync, readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [mode, a1, a2, a3] = process.argv.slice(2);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = process.env.GAME_URL || 'http://localhost:8088/index.html';
const PORT = 9600 + (process.pid % 300);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const logFile = mode === 'repl' ? a2 : join(a2, 'run.log');
const shotDir = mode === 'repl' ? a3 : a2;
mkdirSync(shotDir, { recursive: true });
const log = (s) => { appendFileSync(logFile, `${s}\n`); console.log(s); };

const PROFILE = process.env.QA_PROFILE || join(tmpdir(), `qa-drive-${process.pid}`);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`,
  '--window-size=640,400', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });

async function getJSON(path, method = 'GET') {
  for (let i = 0; i < 150; i++) { try { return await (await fetch(`http://127.0.0.1:${PORT}${path}`, { method })).json(); } catch { await sleep(200); } }
  throw new Error('chrome did not start');
}
function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') log(`  !! page exception: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`);
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) log(`  !! console.${m.params.type}: ${m.params.args.map((x) => x.value ?? x.description).join(' ')}`.slice(0, 400));
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  return new Promise((r) => { ws.onopen = () => r({ send }); });
}

const SCREEN_TEXT = `(() => {
  const fb = E.fb, G = E.text.glyphs, fg = E.text.fgAttr, key = window.__glyphKey || (window.__glyphKey = new Map(G.map((g, c) => [g.join(','), c]).filter(([, c]) => c >= 32 && c < 127).map(([k, c]) => [k, String.fromCharCode(c)])));
  const out = [];
  for (let r = 0; r < 25; r++) { let line = '';
    for (let c = 0; c < 40; c++) { const rows = []; let ok = true;
      for (let y = 0; y < 8 && ok; y++) { let b = 0; for (let x = 0; x < 8; x++) { const v = fb.point(c * 8 + x, r * 8 + y); if (v !== 0 && v !== fg) ok = false; b = (b << 1) | (v === fg ? 1 : 0); } rows.push(b); }
      line += ok ? (key.get(rows.join(',')) ?? '?') : '\\u00b7'; }
    out.push(line); }
  return out.join('\\n'); })()`;

const KEYS = { ENTER: '\r', ESC: '\x1b', SPACE: ' ', BS: '\b', UP: '\0H', DOWN: '\0P', LEFT: '\0K', RIGHT: '\0M' };

const tab = await getJSON(`/json/new?${encodeURIComponent(URL)}`, 'PUT');
const S = await connect(tab.webSocketDebuggerUrl);
await S.send('Emulation.setDeviceMetricsOverride', { width: 640, height: 400, deviceScaleFactor: 1, mobile: false });
await S.send('Runtime.enable');
const ev = async (expr) => (await S.send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;
const screenText = () => ev(`typeof E === 'undefined' ? '' : ${SCREEN_TEXT}`);
let fails = 0;

async function run(line) {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const [cmd, ...rest] = line.split(' ');
  const arg = rest.join(' ');
  if (cmd === 'keys') {
    for (const t of rest) {
      if (t.startsWith('w:')) { await sleep(Number(t.slice(2))); continue; }
      const k = KEYS[t] ?? t;
      for (let i = 0; i < 400 && (await ev('E.input.queue.length')) > 0; i++) await sleep(50);
      await ev(`E.input.push(${JSON.stringify(k)})`);
      await sleep(250);
    }
    log(`keys ${arg}`);
  } else if (cmd === 'wait') {
    const m = /^\/(.*)\/\s*(\d+)?$/.exec(arg);
    const re = new RegExp(m[1]), lim = Number(m[2] ?? 60) * 1000, t0 = Date.now();
    let txt = '';
    while (Date.now() - t0 < lim) { txt = (await screenText()) ?? ''; if (re.test(txt)) break; await sleep(300); }
    const ok = re.test(txt);
    if (!ok) fails++;
    log(`wait /${m[1]}/ -> ${ok ? 'ok' : 'FAIL (timeout)'} after ${((Date.now() - t0) / 1000).toFixed(1)} s [module ${await ev('E.currentModule')}]`);
    if (!ok) log(txt.split('\n').map((l, i) => `   ${String(i + 1).padStart(2)}|${l}|`).join('\n'));
  } else if (cmd === 'shot') {
    const r = await S.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 640, height: 400, scale: 1 } });
    writeFileSync(join(shotDir, `${arg}.png`), Buffer.from(r.result.data, 'base64'));
    log(`shot ${arg}`);
  } else if (cmd === 'text') {
    log(`text [module ${await ev('E.currentModule')}]\n${((await screenText()) ?? '').split('\n').map((l, i) => `   ${String(i + 1).padStart(2)}|${l}|`).join('\n')}`);
  } else if (cmd === 'eval') {
    log(`eval ${arg} = ${JSON.stringify(await ev(arg))}`);
  } else if (cmd === 'note') log(`note ${arg}`);
  else log(`?? unknown command ${line}`);
}

try {
  if (mode === 'plan') {
    for (const line of readFileSync(a1, 'utf8').split(/\r?\n/)) await run(line);
    log(`plan finished, ${fails} wait failures`);
  } else {
    let done = 0;
    log('repl ready');
    for (;;) {
      const lines = existsSync(a1) ? readFileSync(a1, 'utf8').split(/\r?\n/) : [];
      while (done < lines.length - 1) { const l = lines[done++]; if (l.trim() === 'quit') throw new Error('quit'); await run(l); log('--- ok'); }
      await sleep(300);
    }
  }
} catch (e) { if (e.message !== 'quit') log(`driver error ${e.stack}`); }
finally { chrome.kill(); process.exit(0); }
