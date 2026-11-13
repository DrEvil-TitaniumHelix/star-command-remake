let _ver;
async function _version(){ if(!_ver){ const r=await fetch(new URL('byoc/import/manifest.json',self.location.href)); _ver=(await r.json()).version; } return _ver; }
async function versionDir(){ const top=await (await navigator.storage.getDirectory()).getDirectoryHandle('sc-assets'); return top.getDirectoryHandle(await _version()); }
async function fileHandle(dir,path){ const parts=path.split('/'); try{ for(const p of parts.slice(0,-1)) dir=await dir.getDirectoryHandle(p); return await dir.getFileHandle(parts[parts.length-1]); }catch(e){ if(e.name==='NotFoundError'||e.name==='TypeMismatchError') return null; throw e; } }
async function readFile(dir,path){ const h=await fileHandle(dir,path); return h? h.getFile():null; }

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('message', (e) => { if (e.data === 'claim') e.waitUntil(self.clients.claim()); });

const SCOPE = new URL('./', self.location.href).href;

async function storeFile(rel) {
  try {
    const dir = await versionDir();
    if (!(await readFile(dir, 'done'))) return null;
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
