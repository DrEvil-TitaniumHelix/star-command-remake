import { MANIFEST, RECIPE_VERSION, versionDir, stageImport, writeFile, readFile } from './opfs.js';
import { validate } from './validate.js';
import { unzip } from './zip.js';
import { convertAll, STEPS } from '../convert/index.js';
import { streamDeflate } from '../convert/atlas.js';
import { saveRead } from '../convert/saves.js';

const progress = (phase, done, total, label) => postMessage({ type: 'progress', phase, done, total, label });

async function storedOriginals() {
  const dir = await versionDir(), out = [];
  for (const f of MANIFEST.list) {
    const bytes = await readFile(dir, `originals/${f.name}`);
    if (bytes) out.push({ name: f.name, bytes });
  }
  return out;
}

async function run(msg) {
  const candidates = msg.cmd === 'reconvert' ? await storedOriginals() : msg.zip ? await unzip(msg.zip, MANIFEST) : msg.files;
  const v = await validate(MANIFEST, candidates, undefined, (i, n) => progress('check', i, n, 'Checking your copy'));
  if (!v.ok) {
    postMessage({ type: 'error', message: 'This is not a Star Command game folder. Choose the folder containing the game itself, and check that the copy is complete.', problems: v.problems.slice(0, 5).concat(v.problems.length > 5 ? [`And ${v.problems.length - 5} more files need attention.`] : []) });
    return;
  }
  const json = async (u) => { const r = await fetch(new URL(u, import.meta.url)); if (!r.ok) throw new Error('The converter could not load. Please retry when the game server is available.'); return r.json(); };
  const [gmap, cfg, ann] = await Promise.all([json('../../assets/gmap.json'), json('../modules.json'), json('../convert/annotations.json')]);
  const read = (name) => v.files.get(name);
  saveRead(read, gmap, msg.allowNewCrew);
  const info = await stageImport(async (dir) => {
    let i = 0;
    for (const [name, bytes] of v.files) {
      progress('store', i++, v.files.size, 'Keeping a local copy for future updates');
      await writeFile(dir, `originals/${name}`, bytes);
    }
    let files = 0, bytes = 0, step = 0;
    const labels = ['Preparing game data', 'Preparing equipment', 'Preparing pictures', 'Preparing the optional crew', 'Preparing game rules', 'Finishing'];
    for await (const out of convertAll(read, { deflate: streamDeflate, gmap, code: { files: v.files, cfg, ann, vers: v.vers }, allowNewCrew: msg.allowNewCrew, onStep: (s) => { step = s; progress('convert', s, STEPS, labels[s]); } })) {
      await writeFile(dir, out.path, out.bytes);
      files++; bytes += out.bytes.length;
      progress('convert', step, STEPS, labels[step]);
    }
    const info = { manifest: MANIFEST.version, recipe: RECIPE_VERSION, ver: v.ver, files, bytes, originals: v.files.size, at: new Date().toISOString(), sourceId: msg.sourceId ?? null };
    await writeFile(dir, 'done', new TextEncoder().encode(JSON.stringify(info)));
    return info;
  });
  postMessage({ type: 'done', info });
}

let pending;
globalThis.onmessage = (e) => {
  const msg = e.data.cmd === 'continue' ? { ...pending, allowNewCrew: true } : e.data;
  pending = msg;
  return run(msg).catch((err) => postMessage({ type: 'error', code: err.code, message: err.name === 'QuotaExceededError' ? 'There is not enough browser storage. Free some disk space and retry. Your previous import and saves are kept.' : err.message || 'Import failed. Please retry; your previous import and saves are kept.', problems: [] }));
};
