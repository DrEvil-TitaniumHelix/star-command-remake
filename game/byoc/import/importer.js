import { assetsStatus, MANIFEST } from './opfs.js';
import { abortable, directoryFiles, readFiles, readBytes, MAX_TOTAL } from './selection.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search), source = params.get('source'), sourceId = params.get('copy');
const automatic = params.has('launch') || !!source;
let playUrl = new URL('../../index.html?assets=opfs', location.href).href;
try {
  const destination = new URL(params.get('return') || playUrl, location.href);
  if (destination.origin === location.origin && destination.protocol === location.protocol) playUrl = destination.href;
} catch {}
$('play').querySelector('a').href = playUrl;
const PHASES = { check: [0.2, 0.2], store: [0.4, 0.1], convert: [0.5, 0.5] };
let busy = true, supported = true, worker, controller, ticker, started = 0, serial = 0;

function status(text, error = false) {
  $('status').textContent = text;
  $('status').className = error ? '' : 'dim';
}
function setBusy(value) {
  busy = value;
  for (const id of ['pick', 'pick-input', 'use-source', 'new-crew']) $(id).disabled = busy || !supported;
  $('drop').setAttribute('aria-disabled', String(busy || !supported));
  $('drop').classList.toggle('disabled', busy || !supported);
  $('cancel').hidden = !busy;
  $('bar').setAttribute('aria-busy', String(busy));
}
function bar(f) {
  const value = Math.round(Math.max(0, Math.min(1, f)) * 100);
  $('bar').style.display = 'block'; $('bar').firstElementChild.style.width = `${value}%`;
  $('bar').setAttribute('aria-valuenow', String(value));
}
function clock() { $('elapsed').textContent = `${Math.floor((Date.now() - started) / 1000)} seconds elapsed. Large or cloud-stored copies can take longer. You can cancel safely.`; }
function begin(label, keepWorker = false) {
  if (busy || !supported) return null;
  if (!keepWorker) { worker?.terminate(); worker = null; }
  controller?.abort(); controller = new AbortController();
  if (!keepWorker) serial++;
  started = Date.now(); clearInterval(ticker); ticker = setInterval(clock, 1000); clock();
  setBusy(true); bar(0); status(label);
  $('problems').textContent = ''; $('play').hidden = true; $('new-crew').hidden = true; $('use-source').hidden = true;
  return { id: serial, signal: controller.signal };
}
async function finish(message, error = false, keepWorker = false) {
  clearInterval(ticker);
  if (!keepWorker) { worker?.terminate(); worker = null; }
  const id = serial, st = await assetsStatus();
  if (id !== serial) return;
  setBusy(false); status(message, error);
  if (started) $('elapsed').textContent = `${Math.floor((Date.now() - started) / 1000)} seconds elapsed.`;
  $('play').hidden = st.state !== 'ready';
  $('use-source').hidden = !source;
  if (error) $('problems').focus();
}
function problem(e) {
  if (e.name === 'AbortError') return 'Import cancelled. Your saved games are kept.';
  return e.message || 'Could not read this copy. Make it available on this computer and retry.';
}
async function prepareServing(signal) {
  if (!navigator.serviceWorker) return;
  const registration = await abortable(() => navigator.serviceWorker.register(new URL('../../byoc-sw.js', import.meta.url), { type: 'module' }), signal, 15000);
  await abortable(() => registration.update(), signal, 15000);
  const next = registration.installing ?? registration.waiting ?? registration.active;
  if (!next) throw new Error('The game could not prepare its local storage. Reload this page to retry.');
  let changed;
  try {
    await abortable(() => new Promise((resolve, reject) => {
      changed = () => {
        if (next.state === 'activated') resolve();
        else if (next.state === 'redundant') reject(new Error('The game update could not start. Reload this page to retry.'));
      };
      next.addEventListener('statechange', changed); changed();
    }), signal, 15000);
  } finally { if (changed) next.removeEventListener('statechange', changed); }
}
async function launchWorker(msg, transfer = []) {
  const id = serial;
  status('Preparing the importer. Your existing copy is kept until the new copy is ready.');
  try { await prepareServing(controller.signal); }
  catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new Error('The game could not prepare the import. Check that the local game server is still running, then reload this page to retry.');
  }
  if (id !== serial) return;
  navigator.storage?.persist?.().catch(() => {});
  worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = async ({ data: m }) => {
    if (id !== serial) return;
    if (m.type === 'progress') {
      const [a, b] = PHASES[m.phase]; bar(a + b * (m.total ? m.done / m.total : 0)); status(m.label);
    } else if (m.type === 'done') {
      bar(1); await finish(`Your copy is ready to play${m.info.ver ? ` (version ${m.info.ver})` : ''}. Your saved games are kept.`);
      if (id !== serial) return;
      $('play').querySelector('a').focus();
      if (automatic && (!source || m.info.sourceId === sourceId)) location.replace(playUrl);
      else if (source && msg.cmd === 'reconvert') offerSource();
    } else if (m.type === 'error') {
      $('problems').textContent = (m.problems ?? []).join('\n');
      await finish(m.message, true, m.code === 'crew');
      if (id !== serial) return;
      $('new-crew').hidden = m.code !== 'crew';
    }
  };
  worker.onerror = async (e) => { e.preventDefault(); if (id === serial) await finish('The import stopped unexpectedly. Retry or choose another copy; your saved games and previous import are kept.', true); };
  worker.postMessage(msg, transfer);
}
async function readSelection(getList) {
  const op = begin('Finding the game files');
  if (!op) return;
  try {
    const files = await readFiles(await getList(op.signal), MANIFEST, op.signal, (i, n, fraction = 0) => { bar(n ? 0.2 * (i + fraction) / n : 0); status(`Reading your game files (${i} of ${n})`); });
    if (op.id !== serial) return;
    await launchWorker({ cmd: 'import', files }, files.map((f) => f.bytes.buffer));
  } catch (e) { if (op.id === serial) await finish(problem(e), e.name !== 'AbortError'); }
}
$('pick').onclick = () => {
  if (busy || !supported) return;
  if (!window.showDirectoryPicker) { $('dir-input').click(); return; }
  let chosen;
  try { chosen = window.showDirectoryPicker({ id: 'starcoma', mode: 'read' }); }
  catch { status('Could not open the folder picker. Try Choose folder (alternative).', true); return; }
  return readSelection(async (signal) => directoryFiles(await abortable(() => chosen, signal, 300000), MANIFEST, signal));
};
$('pick-input').onclick = () => { if (!busy && supported) $('dir-input').click(); };
$('dir-input').onchange = (e) => {
  const list = [...e.target.files].map((file) => ({ name: file.webkitRelativePath || file.name, file }));
  e.target.value = '';
  if (list.length) return readSelection(async () => list);
};
const drop = $('drop');
drop.ondragover = (e) => { e.preventDefault(); if (!busy && supported) drop.classList.add('over'); };
drop.ondragleave = () => drop.classList.remove('over');
drop.ondrop = async (e) => {
  e.preventDefault(); drop.classList.remove('over');
  if (busy || !supported) return;
  const f = e.dataTransfer.files[0];
  if (!f) return;
  if (!/\.zip$/i.test(f.name)) { status('Choose a ZIP file, or use Choose folder for a folder.', true); return; }
  const op = begin('Reading the ZIP. You can cancel while it is being read.');
  try {
    if (f.size > MAX_TOTAL) throw new Error('This ZIP is too large. Choose a ZIP containing only the game folder.');
    const zip = await readBytes(f, op.signal, MAX_TOTAL, (fraction) => bar(0.2 * fraction));
    if (op.id === serial) await launchWorker({ cmd: 'import', zip }, [zip.buffer]);
  } catch (err) { if (op.id === serial) await finish(problem(err), true); }
};
$('cancel').onclick = async () => {
  serial++; controller?.abort(); worker?.terminate(); worker = null;
  await finish('Import cancelled. Your saved games are kept.');
};
$('new-crew').onclick = () => {
  if (!worker || busy) return;
  const current = worker;
  if (!begin('Importing with a new crew. Existing browser saves will be kept.', true)) return;
  worker = current;
  worker.postMessage({ cmd: 'continue' });
};
async function useSource() {
  const op = begin('Reading the copy selected in the launcher');
  if (!op) return;
  try {
    const r = await abortable(() => fetch('/byoc-source/' + encodeURIComponent(source), { signal: op.signal }), op.signal);
    if (!r.ok) throw new Error('The selected folder is unavailable. Make it available locally, choose another folder, or play your already imported copy.');
    if (Number(r.headers.get('Content-Length')) > MAX_TOTAL) throw new Error('The selected copy is too large. Choose the game folder itself.');
    const zip = await readBytes({ size: Number(r.headers.get('Content-Length')), stream: () => r.body }, op.signal, MAX_TOTAL, (fraction) => bar(0.2 * fraction));
    if (op.id === serial) await launchWorker({ cmd: 'import', zip, sourceId }, [zip.buffer]);
  } catch (e) { if (op.id === serial) await finish(problem(e), true); }
}
function offerSource() {
  status('The launcher selected a different or previously unconfirmed copy. Play your imported copy, or import the selected folder. Your browser saves will be kept.');
  $('use-source').hidden = false;
}
$('use-source').onclick = useSource;
const st = await assetsStatus();
supported = st.state !== 'unsupported'; setBusy(false);
if (!supported) status('This browser cannot store the imported game. Use a current Chrome or Edge.', true);
else if (st.state === 'damaged') status(st.message, true);
else if (st.state === 'ready') {
  $('play').hidden = false;
  if (source && st.done.sourceId !== sourceId) offerSource();
  else if (automatic) location.replace(playUrl);
  else status('Your copy is already imported. Play it, or choose a folder to replace the imported copy. Your saves will be kept.');
} else if (st.state === 'stale') {
  const op = begin('Updating your imported copy. The original folder is not needed.');
  try { await launchWorker({ cmd: 'reconvert', sourceId: st.done.sourceId }); }
  catch { if (op.id === serial) await finish('The converter could not start. Reload this page to retry; your saved games and imported copy are kept.', true); }
} else if (source) await useSource();
else status('Choose the folder containing your Star Command game, or drop a ZIP of that folder.');
