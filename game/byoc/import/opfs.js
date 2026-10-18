// opfs.js — the BYOC asset store in the Origin Private File System (lane byoc-assets, docs/BYOC.md 3.1 steps 4-5).
//
//   sc-assets/<manifest version>/            the converted tree (same layout as game/assets/, convert/index.js)
//   sc-assets/<manifest version>/originals/  the player's validated files (re-conversion without asking again)
//   sc-assets/<manifest version>/done        JSON {manifest, recipe, files, bytes, at}: written last
//
// Save games are not here: the game keeps them in localStorage (engine/files.js, slots.js); nothing in this file
// touches localStorage.
//
//   await assetsStatus()            {state: 'ready' | 'stale' | 'missing', version, recipe, done}
//   installOpfsFetch()              fetch(`${OPFS_PREFIX}<path>`) answers from the store, falling back to
//                                   `assets/<path>` for what the recipe does not make (font8x8.json, gmap.json, ...)

import { RECIPE_VERSION } from '../convert/version.js';
import MANIFEST from './manifest.json' with { type: 'json' };

export { MANIFEST, RECIPE_VERSION };
export const ROOT = 'sc-assets';
export const OPFS_PREFIX = 'byoc-opfs/';   // engine assetsBase in OPFS mode (relative to game/index.html)

export async function versionDir(create = false) {
  const root = await navigator.storage.getDirectory();
  const top = await root.getDirectoryHandle(ROOT, { create });
  return top.getDirectoryHandle(MANIFEST.version, { create });
}

// path 'data/INFO.json' -> FileSystemFileHandle (or null)
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
  await w.write(bytes);
  await w.close();
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
    out.state = out.done.recipe === RECIPE_VERSION && out.done.manifest === MANIFEST.version ? 'ready' : 'stale';
  } catch (e) {
    if (e.name !== 'NotFoundError') throw e;
  }
  return out;
}

const TYPES = { json: 'application/json', png: 'image/png', js: 'text/javascript' };

// Wrap fetch so `byoc-opfs/<path>` reads sc-assets/<version>/<path>; a path the store does not have is fetched
// from `fallback` (default 'assets/'). Returns the uninstall function.
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
