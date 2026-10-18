// files.js — the game's disk: shipped files read from assets/files/<NAME> (byte copies of the originals made by
// tools/convert_data.py), files the game writes (CHARINFO.BAS, CHARNAME, IN-n.BAS, ...) kept in localStorage
// and preferred over the shipped copy. Names are upper-cased DOS names; BLOAD/BSAVE add ".BAS" to a name
// without extension (runtime default, DATA_FILES.md §C).
//
// Node (tests): `new Files({ baseDir })` reads from a directory with node:fs and keeps writes in memory.

const PREFIX = 'starcommand:file:';

export const dosName = (name, defExt = '') => {
  const n = name.toUpperCase().replace(/^[A-Z]:/, '');
  return defExt && !/\.[A-Z0-9]{1,3}$/.test(n) ? n + defExt : n;
};

const b64 = {
  enc: (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); },
  dec: (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
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
    try { const s = this.storage?.getItem(PREFIX + name); if (s) return b64.dec(s); } catch { /* storage unavailable */ }
    return null;
  }

  async read(name) {
    name = dosName(name);
    return this.saved(name) ?? this.shipped(name);
  }

  write(name, bytes) {
    name = dosName(name);
    this.mem.set(name, bytes);
    try { this.storage?.setItem(PREFIX + name, b64.enc(bytes)); } catch (e) { console.warn(`could not persist ${name}: ${e.message}`); }
  }

  async readText(name) { return new TextDecoder('latin1').decode(await this.read(name)); }
  writeText(name, s) { this.write(name, Uint8Array.from(s, (c) => c.charCodeAt(0) & 255)); }

  // forget every file the game wrote (back to the shipped disk)
  reset() {
    this.mem.clear();
    try {
      for (let i = (this.storage?.length ?? 0) - 1; i >= 0; i--) {
        const k = this.storage.key(i);
        if (k.startsWith(PREFIX)) this.storage.removeItem(k);
      }
    } catch { /* storage unavailable */ }
  }

  // BSAVE image: FD seg off len, body, 1A (SPRITES.md §1)
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

  // BLOAD name -> {seg, off, len, body}
  async bload(name) { return Files.parseBsave(await this.read(dosName(name, '.BAS'))); }
  // BSAVE name, body (seg/off recorded in the header like the runtime does; BLOAD with an offset ignores them)
  bsave(name, body, seg = 0, off = 0) { this.write(dosName(name, '.BAS'), Files.makeBsave(body, seg, off)); }
}
