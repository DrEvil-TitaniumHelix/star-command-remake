import { RECIPE_VERSION } from '../convert/version.js';
import MANIFEST from './manifest.json' with { type: 'json' };

export { MANIFEST, RECIPE_VERSION };
export const ROOT = 'sc-assets';
export const OPFS_PREFIX = 'byoc-opfs/';

export async function cacheDir(create = false) {
  const root = await navigator.storage.getDirectory();
  const top = await root.getDirectoryHandle(ROOT, { create });
  return top.getDirectoryHandle(MANIFEST.version, { create });
}

export async function versionDir(create = false) {
  const dir = await cacheDir(create), pointer = await readFile(dir, 'active');
  if (!pointer?.length) return dir;
  const name = new TextDecoder().decode(pointer);
  if (!/^import-[a-f0-9-]+$/.test(name)) throw new Error('The imported copy needs repair. Choose your game folder again; your saves will be kept.');
  return dir.getDirectoryHandle(name);
}

export async function stageImport(work) {
  const run = async () => {
    const base = await cacheDir(true), name = 'import-' + crypto.randomUUID();
    const current = new TextDecoder().decode(await readFile(base, 'active') ?? new Uint8Array());
    const previous = new TextDecoder().decode(await readFile(base, 'previous') ?? new Uint8Array());
    const clean = async (keep) => {
      for await (const h of base.values()) if (h.kind === 'directory' && /^import-[a-f0-9-]+$/.test(h.name) && !keep.includes(h.name)) await base.removeEntry(h.name, { recursive: true }).catch(() => {});
    };
    await clean([current, previous]);
    const dir = await base.getDirectoryHandle(name, { create: true });
    try {
      const result = await work(dir);
      if (!(await readFile(dir, 'done'))) throw new Error('The import did not finish. Please retry.');
      await writeFile(base, 'previous', new TextEncoder().encode(current));
      await writeFile(base, 'active', new TextEncoder().encode(name));
      await clean([name, current]).catch(() => {});
      return result;
    } catch (e) { await base.removeEntry(name, { recursive: true }).catch(() => {}); throw e; }
  };
  if (!navigator.locks?.request) throw new Error('This browser cannot safely update the imported copy. Use a current Chrome or Edge.');
  return navigator.locks.request('star-command-import', { ifAvailable: true }, (lock) => {
    if (!lock) throw new Error('Another window is importing this game. Wait for it to finish, then retry.');
    return run();
  });
}

export async function fileHandle(dir, path, create = false) {
  const parts = path.split('/');
  try {
    for (const p of parts.slice(0, -1)) dir = await dir.getDirectoryHandle(p, { create });
    return await dir.getFileHandle(parts[parts.length - 1], { create });
  } catch (e) {
    if (!create && (e.name === 'NotFoundError' || e.name === 'TypeMismatchError')) return null;
    throw e;
  }
}

export async function writeFile(dir, path, bytes) {
  const w = await (await fileHandle(dir, path, true)).createWritable();
  try { await w.write(bytes); await w.close(); }
  catch (e) { await w.abort().catch(() => {}); throw e; }
}

export async function readFile(dir, path) {
  const h = await fileHandle(dir, path);
  return h ? new Uint8Array(await (await h.getFile()).arrayBuffer()) : null;
}

export async function assetsStatus() {
  const out = { state: 'missing', version: MANIFEST.version, recipe: RECIPE_VERSION, done: null };
  if (!globalThis.navigator?.storage?.getDirectory) return { ...out, state: 'unsupported' };
  try {
    const dir = await versionDir();
    const done = await readFile(dir, 'done');
    if (!done) return out;
    out.done = JSON.parse(new TextDecoder().decode(done));
    if (!out.done || typeof out.done.at !== 'string' || !Number.isInteger(out.done.files) || typeof out.done.recipe !== 'string' || typeof out.done.manifest !== 'string') throw new Error('Invalid import record');
    out.state = out.done.recipe === RECIPE_VERSION && out.done.manifest === MANIFEST.version ? 'ready' : 'stale';
  } catch (e) {
    if (e.name !== 'NotFoundError') return { ...out, state: 'damaged', message: 'The imported copy could not be read. Check browser storage permissions or choose your game folder again to repair it. Your saves will be kept.' };
  }
  return out;
}

const TYPES = { json: 'application/json', png: 'image/png', js: 'text/javascript' };

export async function installOpfsFetch({ prefix = OPFS_PREFIX, fallback = 'assets/' } = {}) {
  const dir = await versionDir();
  const base = new URL(prefix, location.href).href;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async function opfsFetch(input, init) {
    const href = new URL(input instanceof Request ? input.url : String(input), location.href).href;
    if (!href.startsWith(base)) return realFetch.call(this, input, init);
    const rel = decodeURIComponent(href.slice(base.length).split(/[?#]/)[0]);
    const h = rel.includes('..') ? null : await fileHandle(dir, rel);
    if (!h) return realFetch.call(this, new URL(fallback + rel, location.href), init);
    const file = await h.getFile();
    return new Response(file, { status: 200, headers: { 'Content-Type': TYPES[rel.split('.').pop().toLowerCase()] ?? 'application/octet-stream' } });
  };
  return () => { globalThis.fetch = realFetch; };
}
