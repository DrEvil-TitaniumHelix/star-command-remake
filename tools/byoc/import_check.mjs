import { spawn } from 'node:child_process';
import { readFileSync, readdirSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const TARGETS = arg('--targets', '../re-targets/starcommand/starcoma');
const KEEP = arg('--profile', null);
const PORT = Number(arg('--port', 8097)), CDP = 9700 + (process.pid % 200);
const GAME = `http://127.0.0.1:${PORT}/`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (b) => createHash('sha256').update(b).digest('hex');
const scratch = join(tmpdir(), `byoc-import-check-${process.pid}`);
const profile = KEEP ?? join(scratch, 'profile');
mkdirSync(profile, { recursive: true });
mkdirSync(scratch, { recursive: true });

const server = spawn('python', ['-I', here('../serve.py'), String(PORT)], { stdio: 'ignore' });
const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', `--remote-debugging-port=${CDP}`,
  `--user-data-dir=${profile}`, '--window-size=800,600', '--no-first-run', 'about:blank'], { stdio: 'ignore' });

async function json(path, method = 'GET') {
  for (let i = 0; i < 100; i++) { try { const r = await fetch(`http://127.0.0.1:${CDP}${path}`, { method }); return path.startsWith('/json/close/') ? r.text() : r.json(); } catch { await sleep(200); } }
  throw new Error('Chrome unavailable');
}
async function connect(url) {
  const ws = new WebSocket(url), pending = new Map();
  let id = 0;
  let listener = null;
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else if (m.method) listener?.(m); };
  await new Promise((r) => { ws.onopen = r; });
  return {
    close: () => ws.close(),
    onEvent: (f) => { listener = f; },
    send: (method, params = {}) => new Promise((resolve, reject) => {
      const i = ++id, t = setTimeout(() => { pending.delete(i); reject(new Error(`${method} timeout`)); }, 60000);
      pending.set(i, (m) => { clearTimeout(t); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); });
      ws.send(JSON.stringify({ id: i, method, params }));
    }),
  };
}

let tab, s;
const errors = [];
const ev = async (expression) => {
  const r = await s.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result?.value;
};
async function open(url) {
  if (s) { s.close(); await json(`/json/close/${tab.id}`); }
  tab = await json(`/json/new?${encodeURIComponent(url)}`, 'PUT');
  s = await connect(tab.webSocketDebuggerUrl);
  await s.send('Runtime.enable');
  s.onEvent?.((m) => { if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description).join(' ')); });
}
async function until(expr, what, ms = 120000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { try { const v = await ev(expr); if (v) return v; } catch {   } await sleep(250); }
  throw new Error(`timeout: ${what}`);
}
async function setFolder(paths) {
  const { root } = await s.send('DOM.getDocument');
  const { nodeId } = await s.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#dir-input' });
  await s.send('DOM.setFileInputFiles', { nodeId, files: paths });
}
const results = [];
const check = (name, ok, detail = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`); };
const CANVAS = `(() => { const c = document.getElementById('screen'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + 7 * d[i + 1] + 13 * d[i + 2]) >>> 0; return h; })()`;
async function settledCanvas() {
  let prev = null, since = Date.now();
  for (const t0 = Date.now(); Date.now() - t0 < 60000; await sleep(200)) {
    const h = await ev(CANVAS);
    if (h !== prev) { prev = h; since = Date.now(); } else if (h && Date.now() - since > 2500) return h;
  }
  throw new Error('canvas did not settle');
}
const OPFS_SHA = (path) => `(async () => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('sc-assets'); d = await d.getDirectoryHandle('starcoma-1');
  const p = ${JSON.stringify(path)}.split('/'); for (const x of p.slice(0, -1)) d = await d.getDirectoryHandle(x);
  const b = await (await (await d.getFileHandle(p[p.length - 1])).getFile()).arrayBuffer();
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', b)), (v) => v.toString(16).padStart(2, '0')).join(''); })()`;

try {
  await sleep(800);
  await open(`${GAME}index.html?assets=opfs`);
  const landed = await until(`location.pathname.endsWith('/byoc/import/index.html') && document.getElementById('status').textContent`, 'redirect to the importer', 30000);
  check('no store: index.html?assets=opfs redirects to the importer', true, landed);

  const bad = join(scratch, 'bad');
  mkdirSync(bad);
  for (const n of readdirSync(TARGETS)) if (n !== 'SPACE.EXE') copyFileSync(join(TARGETS, n), join(bad, n));
  const name = readFileSync(join(TARGETS, 'NAME'));
  (await import('node:fs')).writeFileSync(join(bad, 'NAME'), name.subarray(0, name.length - 1));
  await setFolder([bad]);
  const problems = await until(`document.getElementById('problems').textContent`, 'problems listed', 60000);
  check('incomplete folder refused with the missing and the wrong-size file named', /SPACE\.EXE is missing \(expected 50912 bytes\)/.test(problems) && /NAME is 5861 bytes, expected 5862 bytes/.test(problems), problems.replace(/\n/g, ' | '));

  await setFolder([join(TARGETS)]);
  const t0 = Date.now();
  const done = await until(`!document.getElementById('play').hidden && document.getElementById('status').textContent`, 'conversion done', 180000);
  check('full folder converted', /^Ready: 144 files/.test(done), `${done} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  const assets = here('../../game/assets/');
  const want = [...readdirSync(join(assets, 'files')).map((f) => `files/${f}`), ...readdirSync(join(assets, 'data')).filter((f) => f !== 'manual.json').map((f) => `data/${f}`),
    'atlas.json', 'saves/veteran/CHARINFO.BAS', 'saves/veteran/CHARNAME'];
  const CODE = ['modules/space.js', 'modules/inside.js', 'modules/plbattle.js', 'modules/spbattle.js', 'modules/starport/flow.js', 'modules/space/banks.js', 'modules/inside/banks.js', 'modules/startup/strings.js'];
  let same = 0;
  const diff = [];
  for (const p of [...want, ...CODE]) (await ev(OPFS_SHA(p))) === sha(readFileSync(p.startsWith('modules/') ? here(`../../game/${p}`) : join(assets, p))) ? same++ : diff.push(p);
  check('OPFS outputs hash-equal the committed game/assets', !diff.length, `${same}/${want.length + CODE.length} equal${diff.length ? `; differ: ${diff.join(', ')}` : ''}`);
  const pixels = await ev(`(async () => { const load = async (u) => { const r = await fetch(u); const b = await createImageBitmap(await r.blob()); const c = new OffscreenCanvas(b.width, b.height); const x = c.getContext('2d'); x.drawImage(b, 0, 0); return x.getImageData(0, 0, b.width, b.height).data; };
    let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('sc-assets'); d = await d.getDirectoryHandle('starcoma-1');
    const u = URL.createObjectURL(await (await d.getFileHandle('atlas.png')).getFile()); const a = await load(u), b = await load('../../assets/atlas.png');
    if (a.length !== b.length) return 'size differs'; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return 'pixel ' + (i >> 2) + ' differs'; return 'equal ' + (a.length / 4) + ' px'; })()`);
  check('OPFS atlas.png pixel-equal to the committed one', pixels.startsWith('equal'), pixels);

  await open(`${GAME}index.html`);
  await until('window.E?.currentModule', 'boot from assets/', 60000);
  const hAssets = await settledCanvas();
  await open(`${GAME}index.html?assets=opfs`);
  await until('window.E?.currentModule', 'boot from OPFS', 60000);
  const hOpfs = await settledCanvas();
  const base = await ev(`[E.assets, fetch.name, E.atlas.meta.sprites.length].join(' ')`);
  check('game boots from OPFS and draws the same title screen', hAssets === hOpfs && /^byoc-opfs\/ opfsFetch 471$/.test(base), `canvas ${hAssets} vs ${hOpfs}; ${base}`);
  await open(`${GAME}index.html?assets=opfs&save=veteran&force=1`);
  await until('window.E?.currentModule', 'boot with the veteran save', 60000);
  const vet = await ev(`(async () => { const b = E.files.saved('CHARINFO.BAS'); return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', b)), (v) => v.toString(16).padStart(2, '0')).join(''); })()`);
  check('?save=veteran from OPFS = the committed veteran CHARINFO.BAS', vet === sha(readFileSync(join(assets, 'saves/veteran/CHARINFO.BAS'))));

  const SPACE_FILE = `(async () => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('sc-assets'); d = await d.getDirectoryHandle('starcoma-1'); return (await d.getDirectoryHandle('modules')).getFileHandle('space.js'); })()`;
  await ev(`(async () => { const h = await ${SPACE_FILE}; const t = await (await h.getFile()).text(); globalThis.__orig = t; const w = await h.createWritable(); const NL = String.fromCharCode(10); await w.write(t + NL + 'globalThis.__byocSentinel = 1;' + NL); await w.close(); return t.length; })()`);
  const origLen = await ev('globalThis.__orig.length');
  await open(`${GAME}index.html?assets=opfs&screen=SP-01`);
  const fromOpfs = await until(`window.E?.currentModule === 'SPACE' && window.E.moduleInstance && [!!navigator.serviceWorker.controller, globalThis.__byocSentinel === 1].join(' ')`, 'SPACE from OPFS', 90000);
  await open(`${GAME}index.html?screen=SP-01`);
  const fromNet = await until(`window.E?.currentModule === 'SPACE' && window.E.moduleInstance && [!!navigator.serviceWorker.controller, globalThis.__byocSentinel === 1].join(' ')`, 'SPACE from assets/', 90000);
  check('?assets=opfs runs the module JS from OPFS (service worker), the default runs the shipped one', fromOpfs === 'true true' && fromNet.endsWith(' false'), `opfs mode: controller/sentinel ${fromOpfs}; default: ${fromNet}`);
  await open(`${GAME}byoc/import/index.html`);
  await until('document.readyState === "complete"', 'importer page', 30000);
  const restored = await ev(`(async () => { const h = await ${SPACE_FILE}; const t = await (await h.getFile()).text(); const o = t.slice(0, t.lastIndexOf(String.fromCharCode(10) + 'globalThis.__byocSentinel')); const w = await h.createWritable(); await w.write(o); await w.close(); return o.length; })()`);
  check('stored space.js restored', restored === origLen && (await ev(OPFS_SHA('modules/space.js'))) === sha(readFileSync(here('../../game/modules/space.js'))));

  await open(`${GAME}byoc/import/index.html`);
  await until(`/already imported/.test(document.getElementById('status').textContent)`, 'importer reports the store', 30000);
  await ev(`(async () => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('sc-assets'); d = await d.getDirectoryHandle('starcoma-1');
    const h = await d.getFileHandle('done'); const j = JSON.parse(await (await h.getFile()).text()); j.recipe = 'old'; const w = await h.createWritable(); await w.write(JSON.stringify(j)); await w.close(); })()`);
  await open(`${GAME}index.html?assets=opfs`);
  const re = await until(`location.pathname.endsWith('/byoc/import/index.html') && !document.getElementById('play').hidden && document.getElementById('status').textContent`, 'stale store re-converted', 180000);
  check('stale recipe: the game sends the player to the importer, which re-converts without a folder', /^Ready: 144 files/.test(re), re);
  const saveKept = await ev(`!!localStorage.getItem('starcommand:file:CHARINFO.BAS')`);
  check('the save game (localStorage) survived the re-conversion', saveKept);
  if (KEEP) {
    await ev(`(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('starcommand:')) localStorage.removeItem(k); localStorage.setItem('starcommand:assetsBase', 'opfs'); return 1; })()`);
    s.close(); await json(`/json/close/${tab.id}`); s = null;
    await sleep(5000);
    console.log(`profile kept: ${profile} (OPFS store ready, no game files; use ?assets=opfs, the starcommand:assetsBase flag is best effort)`);
  }
} catch (e) {
  check('import check ran', false, e.message);
  try { console.log('  page:', await ev(`location.pathname + ' | ' + (document.getElementById('status')?.textContent ?? '') + ' | ' + (document.getElementById('problems')?.textContent ?? '')`)); } catch {   }
  for (const x of errors) console.log('  console:', x);
} finally {
  try { s?.close(); } catch {   }
  spawn('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore' }); server.kill();
  await sleep(1500);
  try { rmSync(KEEP ? join(scratch, 'bad') : scratch, { recursive: true, force: true }); if (KEEP) rmSync(scratch, { recursive: true, force: true }); } catch {   }
}
const failed = results.filter((r) => !r).length;
console.log(`import_check: ${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
