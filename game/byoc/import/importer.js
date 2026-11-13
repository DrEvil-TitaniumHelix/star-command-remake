import { assetsStatus, MANIFEST } from './opfs.js';

const $ = (id) => document.getElementById(id);
const status = (t, cls = 'dim') => { $('status').textContent = t; $('status').className = cls; };
const params = new URLSearchParams(location.search);
const playUrl = params.get('return') || '../../index.html?assets=opfs';
$('play').querySelector('a').href = playUrl;

const PHASES = { check: [0, 0.3], store: [0.3, 0.5], convert: [0.5, 1] };
let busy = false;

function setBusy(b) {
  busy = b;
  for (const id of ['pick', 'pick-input']) $(id).disabled = b;
  $('bar').style.display = b ? 'block' : $('bar').style.display;
}

function bar(f) { $('bar').style.display = 'block'; $('bar').firstElementChild.style.width = `${Math.round(f * 100)}%`; }

function start(msg, transfer = []) {
  if (busy) return;
  setBusy(true);
  $('problems').textContent = '';
  $('play').hidden = true;
  navigator.storage?.persist?.().catch(() => {});
  const w = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  w.onmessage = ({ data: m }) => {
    if (m.type === 'progress') {
      const [a, b] = PHASES[m.phase];
      bar(a + (b - a) * (m.total ? m.done / m.total : 0));
      status(m.label);
    } else if (m.type === 'done') {
      bar(1);
      status(`Ready: ${m.info.files} files converted (${Math.round(m.info.bytes / 1024)} KB) from ${m.info.originals} original files.`, 'ok');
      $('play').hidden = false;
      w.terminate(); setBusy(false);
    } else if (m.type === 'error') {
      status(m.message, '');
      $('problems').textContent = [...(m.problems ?? [])].join('\n');
      w.terminate(); setBusy(false);
    }
  };
  w.onerror = (e) => { status(`converter failed: ${e.message}`, ''); w.terminate(); setBusy(false); };
  w.postMessage(msg, transfer);
}

const asFiles = async (list) => Promise.all(list.map(async ({ name, file }) => ({ name, bytes: new Uint8Array(await file.arrayBuffer()) })));
const transfers = (files) => files.map((f) => f.bytes.buffer);

async function filesOfDirectory(dir, depth = 0) {
  const out = [];
  for await (const h of dir.values()) {
    if (h.kind === 'file') out.push({ name: h.name, file: await h.getFile() });
    else if (depth < 1) out.push(...await filesOfDirectory(h, depth + 1));
  }
  return out;
}

$('pick').onclick = async () => {
  if (!window.showDirectoryPicker) { $('dir-input').click(); return; }
  let dir;
  try { dir = await window.showDirectoryPicker({ id: 'starcoma', mode: 'read' }); } catch (e) { if (e.name !== 'AbortError') status(e.message, ''); return; }
  status('reading the folder ...');
  const files = await asFiles(await filesOfDirectory(dir));
  start({ cmd: 'import', files }, transfers(files));
};

$('pick-input').onclick = () => $('dir-input').click();
$('dir-input').onchange = async (e) => {
  const list = [...e.target.files].map((file) => ({ name: file.name, file }));
  e.target.value = '';
  if (!list.length) return;
  status('reading the folder ...');
  const files = await asFiles(list);
  start({ cmd: 'import', files }, transfers(files));
};

const drop = $('drop');
drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
drop.ondragleave = () => drop.classList.remove('over');
drop.ondrop = async (e) => {
  e.preventDefault();
  drop.classList.remove('over');
  const f = e.dataTransfer.files[0];
  if (!f) return;
  if (!/\.zip$/i.test(f.name)) { status(`${f.name} is not a .zip file; use "Choose folder" for a folder.`, ''); return; }
  const zip = new Uint8Array(await f.arrayBuffer());
  start({ cmd: 'import', zip }, [zip.buffer]);
};

const st = await assetsStatus();
if (st.state === 'unsupported') {
  status('This browser has no private file storage (OPFS). Use a current Chrome or Edge.', '');
  for (const id of ['pick', 'pick-input']) $(id).disabled = true;
} else if (st.state === 'ready') {
  status(`Your copy is already imported (${st.done.at.slice(0, 10)}, ${st.done.files} files). Choose the folder again only to re-import.`, 'ok');
  $('play').hidden = false;
} else if (st.state === 'stale') {
  status('The converter was updated: converting your stored copy again ...');
  start({ cmd: 'reconvert' });
} else {
  status(`Expected: the ${MANIFEST.required} files of the ${MANIFEST.release} release.`);
}
