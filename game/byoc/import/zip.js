import { MAX_FILE, MAX_TOTAL, selectFolder } from './selection.js';

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function inflateRaw(bytes, size) {
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const out = new Uint8Array(size);
  let at = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      if (at + value.length > size) throw new Error('Damaged ZIP');
      out.set(value, at); at += value.length;
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  if (at !== size) throw new Error('Damaged ZIP');
  return out;
}

export async function unzip(b, manifest) {
  try {
    if (b.length > MAX_TOTAL) throw new Error('This ZIP is too large. Choose a ZIP containing only the game folder.');
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength), entries = [];
    const bounds = (p, n) => { if (!Number.isSafeInteger(p) || p < 0 || n < 0 || p + n > b.length) throw new Error('Damaged ZIP'); };
    let end = -1;
    for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) if (dv.getUint32(i, true) === 0x06054b50 && i + 22 + dv.getUint16(i + 20, true) === b.length) { end = i; break; }
    if (end < 0) throw new Error('Damaged ZIP');
    const count = dv.getUint16(end + 10, true), centralSize = dv.getUint32(end + 12, true);
    let p = dv.getUint32(end + 16, true);
    if (dv.getUint32(end + 4, true) !== 0 || count !== dv.getUint16(end + 8, true) || p + centralSize !== end) throw new Error('Damaged ZIP');
    for (let n = 0; n < count; n++) {
      bounds(p, 46);
      if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Damaged ZIP');
      const flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true), crc = dv.getUint32(p + 16, true), compressed = dv.getUint32(p + 20, true), size = dv.getUint32(p + 24, true);
      const nameLen = dv.getUint16(p + 28, true), extra = dv.getUint16(p + 30, true), comment = dv.getUint16(p + 32, true), local = dv.getUint32(p + 42, true);
      bounds(p, 46 + nameLen + extra + comment);
      const name = new TextDecoder(flags & 2048 ? 'utf-8' : 'latin1').decode(b.subarray(p + 46, p + 46 + nameLen));
      p += 46 + nameLen + extra + comment;
      if (!name.endsWith('/')) entries.push({ name, flags, method, crc, compressed, size, local });
    }
    if (p !== end) throw new Error('Damaged ZIP');
    const chosen = manifest ? selectFolder(manifest, entries) : entries, out = [];
    let total = 0;
    for (const e of chosen) {
      if (e.flags & 1 || ![0, 8].includes(e.method)) throw new Error('This ZIP uses encryption or unsupported compression. Extract it first, then choose the game folder.');
      total += e.size;
      if (e.size > MAX_FILE || total > MAX_TOTAL) throw new Error('This ZIP expands to too much data. Choose a ZIP containing only an intact game copy.');
      bounds(e.local, 30);
      if (dv.getUint32(e.local, true) !== 0x04034b50 || dv.getUint16(e.local + 8, true) !== e.method || dv.getUint16(e.local + 6, true) !== e.flags) throw new Error('Damaged ZIP');
      const data = e.local + 30 + dv.getUint16(e.local + 26, true) + dv.getUint16(e.local + 28, true);
      bounds(data, e.compressed);
      if (data + e.compressed > end - centralSize) throw new Error('Damaged ZIP');
      const raw = b.subarray(data, data + e.compressed), bytes = e.method === 0 ? raw.slice() : await inflateRaw(raw, e.size);
      if (bytes.length !== e.size || crc32(bytes) !== e.crc) throw new Error('Damaged ZIP');
      out.push({ name: e.name, bytes });
    }
    return out;
  } catch (e) {
    if (/^(This ZIP|More than one game folder|Two files are named)/.test(e.message)) throw e;
    throw new Error('This ZIP is damaged or incomplete. Download or copy it again, or extract an intact copy and choose its game folder.');
  }
}
