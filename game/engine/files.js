const PREFIX = 'starcommand:file:';

export const dosName = (name, defExt = '') => {
  const n = name.toUpperCase().replace(/^[A-Z]:/, '');
  return defExt && !/\.[A-Z0-9]{1,3}$/.test(n) ? n + defExt : n;
};

const b64 = {
  enc: (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); },
  dec: (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
};

export const memStorage = () => {
  const m = new Map();
  return { get length() { return m.size; }, key: (i) => [...m.keys()][i] ?? null, getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); }, clear: () => m.clear() };
};

export class Files {
  constructor({ base = 'assets/files/', baseDir = null, storage = (typeof localStorage !== 'undefined' ? localStorage : null) } = {}) {
    this.base = base;
    this.baseDir = baseDir;
    this.storage = storage;
    this.mem = new Map();
  }

  async shipped(name) {
    if (this.baseDir) {
      const { readFileSync } = await import('node:fs');
      return new Uint8Array(readFileSync(`${this.baseDir}/${name}`));
    }
    const r = await fetch(this.base + encodeURIComponent(name));
    if (!r.ok) throw new Error(`File not found: ${name}`);
    return new Uint8Array(await r.arrayBuffer());
  }

  saved(name) {
    if (this.mem.has(name)) return this.mem.get(name);
    try { const s = this.storage?.getItem(PREFIX + name); if (s) return b64.dec(s); } catch {   }
    return null;
  }

  async read(name) {
    name = dosName(name);
    return this.saved(name) ?? this.shipped(name);
  }

  write(name, bytes) {
    name = dosName(name);
    this.mem.set(name, bytes);
    try {
      this.storage?.setItem(PREFIX + name, b64.enc(bytes));
      if (name === 'CHARINFO.BAS') for (const [k, v] of this.mem) if (v === null) { this.mem.delete(k); this.storage?.removeItem(PREFIX + k); }
    } catch (e) { console.warn(`could not persist ${name}: ${e.message}`); this.writeError = e; this.onWriteFail?.(e); }
  }

  forget(test) {
    const names = new Set(this.mem.keys());
    try { for (let i = 0; i < (this.storage?.length ?? 0); i++) { const k = this.storage.key(i); if (k?.startsWith(PREFIX)) names.add(k.slice(PREFIX.length)); } } catch {   }
    for (const n of names) if (test(n)) this.mem.set(n, null);
  }

  async readText(name) { return new TextDecoder('latin1').decode(await this.read(name)); }
  writeText(name, s) { this.write(name, Uint8Array.from(s, (c) => c.charCodeAt(0) & 255)); }

  reset() {
    this.mem.clear();
    try {
      for (let i = (this.storage?.length ?? 0) - 1; i >= 0; i--) {
        const k = this.storage.key(i);
        if (k.startsWith(PREFIX)) this.storage.removeItem(k);
      }
    } catch {   }
  }

  static parseBsave(bytes) {
    if (bytes[0] !== 0xfd) throw new Error('Bad file mode (not a BSAVE image)');
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const seg = dv.getUint16(1, true), off = dv.getUint16(3, true), len = dv.getUint16(5, true);
    return { seg, off, len, body: bytes.subarray(7, 7 + len) };
  }

  static makeBsave(body, seg = 0, off = 0) {
    const out = new Uint8Array(7 + body.length + 1);
    const dv = new DataView(out.buffer);
    out[0] = 0xfd; dv.setUint16(1, seg, true); dv.setUint16(3, off, true); dv.setUint16(5, body.length, true);
    out.set(body, 7);
    out[7 + body.length] = 0x1a;
    return out;
  }

  async bload(name) { return Files.parseBsave(await this.read(dosName(name, '.BAS'))); }
  bsave(name, body, seg = 0, off = 0) { this.write(dosName(name, '.BAS'), Files.makeBsave(body, seg, off)); }
}
