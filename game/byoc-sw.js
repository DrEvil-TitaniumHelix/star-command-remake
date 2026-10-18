// byoc-sw.js — service worker (scope game/) that serves the generated module JS from the BYOC store (lane byoc-assets,
// docs/BYOC.md 3.1 step 5 + 3.4). ES module imports do not go through fetch(), so the page's fetch wrapper
// (byoc/import/opfs.js installOpfsFetch) cannot reach them; this worker can, and keeps one URL per module (the same
// modules/space.js URL as today), so the hand-written modules and the engine are loaded once, from the network.
//
// A GET of modules/<path> that exists in OPFS sc-assets/<version>/modules/<path> (written by the importer, tier 3):
//   page in OPFS mode (its URL has ?assets=opfs; index.html adds it)  -> the OPFS file
//   otherwise -> the network file, and the OPFS file only when the network has none (404, the public tree)
// Everything else goes to the network untouched.
import { versionDir, fileHandle, readFile } from './byoc/import/opfs.js';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('message', (e) => { if (e.data === 'claim') e.waitUntil(self.clients.claim()); });

const SCOPE = new URL('./', self.location.href).href;

async function storeFile(rel) {
  try {
    const dir = await versionDir();
    if (!(await readFile(dir, 'done'))) return null;   // an unfinished import is never served
    const h = await fileHandle(dir, rel);
    return h ? h.getFile() : null;
  } catch { return null; }
}

const js = (file) => new Response(file, { status: 200, headers: { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' } });

async function handle(e, rel) {
  const file = await storeFile(rel);
  if (!file) return fetch(e.request);
  const client = e.clientId ? await self.clients.get(e.clientId) : null;
  if (client && new URL(client.url).searchParams.get('assets') === 'opfs') return js(file);
  const net = await fetch(e.request);
  return net.status === 404 ? js(file) : net;
}

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (e.request.method !== 'GET' || !url.startsWith(SCOPE)) return;
  const rel = decodeURIComponent(url.slice(SCOPE.length).split(/[?#]/)[0]);
  if (!rel.startsWith('modules/') || !rel.endsWith('.js') || rel.includes('..')) return;
  e.respondWith(handle(e, rel));
});
