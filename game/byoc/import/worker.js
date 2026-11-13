import { MANIFEST, RECIPE_VERSION, versionDir, writeFile, readFile, fileHandle } from './opfs.js';
import { validate } from './validate.js';
import { unzip } from './zip.js';
import { convertAll, STEPS } from '../convert/index.js';
import { streamDeflate } from '../convert/atlas.js';

const progress = (phase, done, total, label) => postMessage({ type: 'progress', phase, done, total, label });

async function storedOriginals(dir) {
  const out = [];
  for (const f of MANIFEST.list) {
    const bytes = await readFile(dir, `originals/${f.name}`);
    if (bytes) out.push({ name: f.name, bytes });
  }
  return out;
}

async function run(msg) {
  let candidates;
  const dir = await versionDir(true);
  if (msg.cmd === 'reconvert') candidates = await storedOriginals(dir);
  else candidates = msg.zip ? await unzip(msg.zip) : msg.files;

  const v = await validate(MANIFEST, candidates, undefined, (i, n, name) => progress('check', i, n, `checking ${name}`));
  if (!v.ok) {
    postMessage({ type: 'error', message: msg.cmd === 'reconvert' ? 'The stored copy no longer validates; please choose your STARCOMA folder again.' : 'This folder is not a complete copy of the known release.', problems: v.problems, notes: v.notes });
    return;
  }
  const old = await fileHandle(dir, 'done');
  if (old) await dir.removeEntry('done');

  if (msg.cmd !== 'reconvert') {
    let i = 0;
    for (const [name, bytes] of v.files) {
      progress('store', i++, v.files.size, `storing ${name}`);
      await writeFile(dir, `originals/${name}`, bytes);
    }
  }

  const json = async (u) => { const r = await fetch(new URL(u, import.meta.url)); if (!r.ok) throw new Error(`${u}: HTTP ${r.status}`); return r.json(); };
  const [gmap, cfg, ann] = await Promise.all([json('../../assets/gmap.json'), json('../modules.json'), json('../convert/annotations.json')]);
  const read = (name) => {
    const b = v.files.get(name);
    if (!b) throw new Error(`recipe needs ${name}, which the manifest does not list`);
    return b;
  };
  let files = 0, bytes = 0, step = 0;
  for await (const out of convertAll(read, { deflate: streamDeflate, gmap, code: { files: v.files, cfg, ann }, onStep: (s, label) => { step = s; progress('convert', s, STEPS, label); } })) {
    await writeFile(dir, out.path, out.bytes);
    files++; bytes += out.bytes.length;
    progress('convert', step, STEPS, `writing ${out.path}`);
  }
  const info = { manifest: MANIFEST.version, recipe: RECIPE_VERSION, files, bytes, originals: v.files.size, at: new Date().toISOString() };
  await writeFile(dir, 'done', new TextEncoder().encode(JSON.stringify(info)));
  postMessage({ type: 'done', info, notes: v.notes });
}

onmessage = (e) => run(e.data).catch((err) => postMessage({ type: 'error', message: String(err?.message ?? err), problems: [] }));
