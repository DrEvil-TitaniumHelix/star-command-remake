import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { deflateRawSync } from 'node:zlib';
import { validate } from './import/validate.js';
import { selectFolder, directoryFiles, readFiles, readBytes, abortable, MAX_FILE } from './import/selection.js';
import { unzip, crc32 } from './import/zip.js';
import { saveRead, newSave } from './convert/saves.js';
import { Files } from '../engine/files.js';

let count = 0;
const test = async (name, work) => { await work(); count++; console.log('ok ' + name); };
const enc = new TextEncoder(), dec = new TextDecoder();
const manifest = { list: [{ name: 'CREW', save: true, required: true }, { name: 'GAME', save: true, required: true }] };
const candidates = (dir, value) => ['CREW', 'GAME'].map((name) => ({ name: dir + name, bytes: enc.encode(value) }));
await test('complete roots are never mixed with backup saves', async () => {
  const result = await validate(manifest, [{ name: 'backup/CREW', bytes: enc.encode('old') }, ...candidates('', 'current')]);
  assert.equal(result.ok, true); assert.equal(dec.decode(result.files.get('CREW')), 'current');
  const ambiguous = await validate(manifest, [...candidates('one/', 'one'), ...candidates('two/', 'two')]);
  assert.equal(ambiguous.ok, false); assert.match(ambiguous.problems[0], /More than one game folder/);
  assert.throws(() => selectFolder(manifest, [...candidates('', 'current'), { name: 'crew', bytes: new Uint8Array() }]), /Two files/);
  const partial = { list: [{ name: 'CREW', save: true, required: true }, { name: 'GAME', required: true }, { name: 'OTHER', required: true }] };
  const selected = selectFolder(partial, [...candidates('', 'current'), ...candidates('backup/', 'old'), { name: 'backup/OTHER' }]);
  assert.deepEqual(selected.map((f) => f.name), ['CREW', 'GAME']);
  assert.throws(() => selectFolder(partial, [...candidates('one/', 'current'), ...candidates('two/', 'old'), { name: 'two/OTHER' }]), /More than one/);
});
const file = (text) => new Blob([text]);
const handle = (name, text) => ({ kind: 'file', name, getFile: async () => file(text) });
const directory = (name, children) => ({ kind: 'directory', name, async *values() { yield* children; } });
await test('both pickers discover the same deeply nested copy and ignore unrelated bytes', async () => {
  const unrelated = { kind: 'file', name: 'unrelated.bin', getFile: () => { throw new Error('must not read'); } };
  const dir = directory('', [unrelated, directory('one', [directory('two', [handle('CREW', 'crew'), handle('GAME', 'game'), unrelated])])]);
  const list = await directoryFiles(dir, manifest);
  const native = await readFiles(list, manifest);
  const alternate = await readFiles([{ name: 'one/two/CREW', file: file('crew') }, { name: 'one/two/GAME', file: file('game') }, { name: 'unrelated.bin', getFile: unrelated.getFile }], manifest);
  assert.deepEqual(native, alternate);
});
await test('read failures, hanging reads and cancellation settle instead of waiting silently', async () => {
  await assert.rejects(readFiles([{ name: 'CREW', getFile: async () => { throw new Error('offline'); } }], manifest), /Could not read CREW/);
  await assert.rejects(abortable(() => new Promise(() => {}), null, 5), /took too long/);
  const abort = new AbortController(), pending = abortable(() => new Promise(() => {}), abort.signal);
  abort.abort(); await assert.rejects(pending, { name: 'AbortError' });
  let reads = 0;
  await assert.rejects(readFiles([{ name: 'CREW', file: { size: MAX_FILE + 1, arrayBuffer() { reads++; } } }], manifest), /too large/);
  assert.equal(reads, 0);
  const streamAbort = new AbortController(); let cancelled = false;
  const streamRead = readBytes({ size: 1, stream: () => new ReadableStream({ cancel() { cancelled = true; } }) }, streamAbort.signal);
  streamAbort.abort(); await assert.rejects(streamRead, { name: 'AbortError' }); assert.equal(cancelled, true);
});
function zip(entries) {
  const local = [], central = []; let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name), data = Buffer.from(e.text ?? ''), raw = e.method === 8 ? deflateRawSync(data) : data;
    const a = Buffer.alloc(30), c = Buffer.alloc(46), crc = e.crc ?? crc32(data);
    a.writeUInt32LE(0x04034b50); a.writeUInt16LE(20, 4); a.writeUInt16LE(e.flags ?? 0, 6); a.writeUInt16LE(e.method ?? 0, 8);
    a.writeUInt32LE(crc, 14); a.writeUInt32LE(raw.length, 18); a.writeUInt32LE(e.size ?? data.length, 22); a.writeUInt16LE(name.length, 26);
    c.writeUInt32LE(0x02014b50); c.writeUInt16LE(e.flags ?? 0, 8); c.writeUInt16LE(e.method ?? 0, 10); c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(raw.length, 20); c.writeUInt32LE(e.size ?? data.length, 24); c.writeUInt16LE(name.length, 28); c.writeUInt32LE(offset, 42);
    local.push(a, name, raw); central.push(c, name); offset += a.length + name.length + raw.length;
  }
  const end = Buffer.alloc(22), cd = Buffer.concat(central);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, cd, end]);
}
await test('ZIP stored and deflated bytes retain paths and pass checksum verification', async () => {
  const result = await unzip(zip([{ name: 'copy/CREW', text: 'crew' }, { name: 'copy/GAME', text: 'game', method: 8 }]));
  assert.deepEqual(result.map((f) => [f.name, dec.decode(f.bytes)]), [['copy/CREW', 'crew'], ['copy/GAME', 'game']]);
});
await test('damaged ZIP offsets, checksums and lengths produce a useful recovery message', async () => {
  for (const bytes of [new Uint8Array(), zip([{ name: 'CREW', text: 'crew', crc: 0 }]), zip([{ name: 'CREW', text: 'crew', size: 1 }]), zip([{ name: 'CREW', text: 'crew', method: 8, size: 1 }])]) await assert.rejects(unzip(bytes), /ZIP is damaged or incomplete/);
  const damaged = zip([{ name: 'CREW', text: 'crew' }]); damaged.writeUInt32LE(0xffffff, damaged.length - 6);
  await assert.rejects(unzip(damaged), /ZIP is damaged or incomplete/);
  await assert.rejects(unzip(zip([{ name: 'CREW', size: MAX_FILE + 1 }])), /too much data/);
});
await test('ZIP extras are not decompressed and duplicate game roots require a choice', async () => {
  const bytes = zip([{ name: 'CREW', text: 'crew' }, { name: 'GAME', text: 'game' }, { name: 'extra', method: 99, flags: 1 }]);
  assert.equal((await unzip(bytes, manifest)).length, 2);
  await assert.rejects(unzip(zip(['one', 'two'].flatMap((d) => [{ name: d + '/CREW' }, { name: d + '/GAME' }])), manifest), /More than one/);
});
await test('damaged crew requires consent and never replaces a valid played save', () => {
  const entries = new Map([['CHARINFO.BAS', newSave({})], ['CHARNAME', enc.encode(','.repeat(9) + '\x1a')]]);
  for (let i = 1; i <= 7; i++) {
    entries.set(`IN-${i}.BAS`, Files.makeBsave(new Uint8Array(5502), 0, 0));
    const map = new Uint8Array(8700), v = new DataView(map.buffer); v.setUint16(0, 370, true); v.setUint16(2, 185, true);
    entries.set(`INMAP-${i}.BAS`, Files.makeBsave(map, 0, 0));
  }
  const read = (n) => entries.get(n), crew = entries.get('CHARINFO.BAS');
  assert.equal(saveRead(read, {})('CHARINFO.BAS'), crew);
  entries.set('CHARINFO.BAS', new Uint8Array());
  assert.throws(() => saveRead(read, {}), (e) => e.code === 'crew' && /explicitly/.test(e.message));
  assert.deepEqual(saveRead(read, {}, true)('CHARINFO.BAS'), crew);
});
let failure = '', storageDenied = false;
const missing = () => new DOMException('Missing', 'NotFoundError');
class MemoryFile {
  constructor(name, path) { this.name = name; this.path = path; this.kind = 'file'; this.bytes = new Uint8Array(); }
  async getFile() { return new Blob([this.bytes]); }
  async createWritable() {
    let bytes;
    return { write: async (b) => { bytes = new Uint8Array(b); }, close: async () => { if (failure === this.path) throw new DOMException('Full', 'QuotaExceededError'); this.bytes = bytes; }, abort: async () => {} };
  }
}
class MemoryDirectory {
  constructor(name = '', path = '') { this.name = name; this.path = path; this.kind = 'directory'; this.entries = new Map(); }
  async getDirectoryHandle(n, { create = false } = {}) { return this.get(n, create, true); }
  async getFileHandle(n, { create = false } = {}) { return this.get(n, create, false); }
  get(n, create, dir) {
    if (!this.entries.has(n)) { if (!create) throw missing(); this.entries.set(n, dir ? new MemoryDirectory(n, this.path + '/' + n) : new MemoryFile(n, this.path + '/' + n)); }
    return this.entries.get(n);
  }
  async removeEntry(n) { this.entries.delete(n); }
  async *values() { yield* this.entries.values(); }
}
const root = new MemoryDirectory();
let locked = false;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { storage: { getDirectory: async () => { if (storageDenied) throw new DOMException('Denied', 'SecurityError'); return root; } }, locks: { request: async (name, options, fn) => { if (locked) return fn(null); locked = true; try { return await fn({ name }); } finally { locked = false; } } } } });
const { cacheDir, versionDir, readFile, writeFile, stageImport, assetsStatus, RECIPE_VERSION, MANIFEST } = await import('./import/opfs.js');
const done = enc.encode(JSON.stringify({ manifest: MANIFEST.version, recipe: RECIPE_VERSION, files: 1, at: '2026-01-01' }));
const base = await cacheDir(true);
await writeFile(base, 'done', done); await writeFile(base, 'modules/example.js', enc.encode('old'));
await test('a failed first pointer write leaves the legacy import playable', async () => {
  failure = base.path + '/active';
  await assert.rejects(stageImport(async (dir) => { await writeFile(dir, 'done', done); }), { name: 'QuotaExceededError' });
  failure = '';
  assert.equal(dec.decode(await readFile(await versionDir(), 'modules/example.js')), 'old');
  assert.equal((await assetsStatus()).state, 'ready');
});
await test('failed conversion and interrupted staging preserve the legacy import', async () => {
  await assert.rejects(stageImport(async (dir) => { await writeFile(dir, 'modules/example.js', enc.encode('bad')); throw new Error('conversion failed'); }), /conversion failed/);
  assert.equal(dec.decode(await readFile(await versionDir(), 'modules/example.js')), 'old');
  let release; const gate = new Promise((r) => { release = r; });
  const pending = stageImport(async (dir) => { await writeFile(dir, 'modules/example.js', enc.encode('new')); await gate; await writeFile(dir, 'done', done); });
  await new Promise((r) => setImmediate(r));
  assert.equal(dec.decode(await readFile(await versionDir(), 'modules/example.js')), 'old');
  await assert.rejects(stageImport(async () => {}), /Another window/);
  release(); await pending;
  assert.equal(dec.decode(await readFile(await versionDir(), 'modules/example.js')), 'new');
  assert.equal((await assetsStatus()).state, 'ready');
});
await test('failed pointer publication preserves the last committed generation', async () => {
  failure = base.path + '/active';
  await assert.rejects(stageImport(async (dir) => { await writeFile(dir, 'modules/example.js', enc.encode('bad')); await writeFile(dir, 'done', done); }), { name: 'QuotaExceededError' });
  failure = '';
  assert.equal(dec.decode(await readFile(await versionDir(), 'modules/example.js')), 'new');
});
await test('service worker reads the committed generation and legacy cache layout', async () => {
  const context = vm.createContext({ navigator, self: { location: { href: 'http://localhost/byoc-sw.js' }, addEventListener() {} }, URL, fetch: async () => new Response(JSON.stringify(MANIFEST)), Response });
  vm.runInContext(readFileSync(new URL('../byoc-sw.js', import.meta.url), 'utf8'), context);
  assert.equal(await (await context.storeFile('modules/example.js')).text(), 'new');
  const active = await readFile(base, 'active'); await base.removeEntry('active');
  assert.equal(await (await context.storeFile('modules/example.js')).text(), 'old');
  await writeFile(base, 'active', active);
});
await test('invalid metadata and denied storage produce recoverable status', async () => {
  const current = await versionDir(); await writeFile(current, 'done', enc.encode('{'));
  assert.equal((await assetsStatus()).state, 'damaged');
  await writeFile(current, 'done', done);
  storageDenied = true; assert.equal((await assetsStatus()).state, 'damaged'); storageDenied = false;
  assert.equal((await assetsStatus()).state, 'ready');
});
console.log(`import safety: ${count} checks passed`);
await test('wrong folders give one explanation and no more than five named problems', async () => {
  const messages = [];
  globalThis.postMessage = (m) => messages.push(m);
  await import('./import/worker.js');
  await globalThis.onmessage({ data: { cmd: 'import', files: [] } });
  const error = messages.find((m) => m.type === 'error');
  assert.match(error.message, /^This is not a Star Command game folder\./);
  assert.equal(error.problems.length, 6); assert.match(error.problems[5], /^And \d+ more/);
});
let uiNumber = 0;
async function ui(search = '') {
  const elements = new Map(), redirects = [], timers = new Map(), workers = [];
  const element = (id) => ({ id, hidden: ['play', 'cancel', 'new-crew', 'use-source'].includes(id), disabled: false, value: '', files: [], textContent: '', style: {}, attributes: {}, firstElementChild: { style: {} }, classList: { add() {}, remove() {}, toggle() {} }, setAttribute(k, v) { this.attributes[k] = v; }, focus() { document.activeElement = this; }, click() {}, querySelector() { return elementFor('play-link'); } });
  const elementFor = (id) => { if (!elements.has(id)) elements.set(id, element(id)); return elements.get(id); };
  globalThis.document = { getElementById: elementFor, activeElement: null };
  globalThis.window = {};
  const url = new URL('http://localhost/byoc/import/index.html' + search);
  globalThis.location = { href: url.href, origin: url.origin, protocol: url.protocol, search, replace(u) { redirects.push(u); } };
  globalThis.Worker = class { constructor() { this.messages = []; workers.push(this); } postMessage(m) { this.messages.push(m); } terminate() { this.terminated = true; } };
  globalThis.setInterval = (fn) => { const id = timers.size + 1; timers.set(id, fn); return id; };
  globalThis.clearInterval = (id) => timers.delete(id);
  await import(`./import/importer.js?test=${++uiNumber}`);
  return { get: elementFor, redirects, timers, workers };
}
const interval = globalThis.setInterval, clear = globalThis.clearInterval;
try {
  await test('failed replacement restores Play and supports an explicit new-crew retry', async () => {
    const u = await ui(), input = u.get('dir-input');
    assert.equal(u.get('play').hidden, false);
    input.files = [Object.assign(file('crew'), { name: 'CHARNAME', webkitRelativePath: 'copy/CHARNAME' })];
    await input.onchange({ target: input });
    assert.equal(u.get('play').hidden, true);
    const w = u.workers[0];
    await w.onmessage({ data: { type: 'progress', phase: 'convert', done: 2, total: 5, label: 'Preparing pictures' } });
    assert.equal(u.get('bar').attributes['aria-valuenow'], '70'); assert.equal(u.get('status').textContent, 'Preparing pictures');
    await w.onmessage({ data: { type: 'error', code: 'crew', message: 'Damaged crew', problems: [] } });
    assert.equal(u.get('play').hidden, false); assert.equal(u.get('new-crew').hidden, false);
    assert.equal(document.activeElement, u.get('problems'));
    u.get('new-crew').onclick(); assert.equal(w.messages.at(-1).cmd, 'continue');
    await w.onmessage({ data: { type: 'done', info: { ver: '1.2' } } });
    assert.equal(u.get('play').hidden, false); assert.equal(u.get('cancel').hidden, true); assert.equal(u.timers.size, 0);
    assert.equal(document.activeElement, u.get('play-link'));
  });
  await test('busy drop never reads bytes and cancelling a slow read restores controls and Play', async () => {
    const u = await ui(), input = u.get('dir-input');
    input.files = [{ name: 'CHARNAME', size: 1, arrayBuffer: () => new Promise(() => {}) }];
    const pending = input.onchange({ target: input });
    await new Promise((r) => setImmediate(r));
    assert.equal(u.get('pick').disabled, true); assert.equal(u.get('drop').attributes['aria-disabled'], 'true');
    assert.match(u.get('elapsed').textContent, /seconds elapsed/);
    let reads = 0;
    await u.get('drop').ondrop({ preventDefault() {}, dataTransfer: { files: [{ name: 'copy.zip', arrayBuffer() { reads++; } }] } });
    assert.equal(reads, 0);
    await u.get('cancel').onclick(); await pending;
    assert.equal(u.get('pick').disabled, false); assert.equal(u.get('play').hidden, false); assert.match(u.get('status').textContent, /cancelled/);
  });
  await test('changed launcher source offers a choice while source-free cached launches continue', async () => {
    const changed = await ui('?launch=1&source=token&copy=different');
    assert.equal(changed.redirects.length, 0); assert.equal(changed.get('use-source').hidden, false); assert.equal(changed.get('play').hidden, false);
    const cached = await ui('?launch=1'); assert.equal(cached.redirects.length, 1);
  });
  await test('cancelling during completion cannot redirect from an older operation', async () => {
    const u = await ui('?launch=1&source=token&copy=different'), input = u.get('dir-input');
    input.files = [Object.assign(file('crew'), { name: 'CHARNAME' })];
    await input.onchange({ target: input });
    const original = navigator.storage.getDirectory; let release;
    navigator.storage.getDirectory = () => new Promise((resolve) => { release ??= []; release.push(resolve); });
    const finished = u.workers[0].onmessage({ data: { type: 'done', info: { sourceId: 'different' } } });
    const cancelled = u.get('cancel').onclick();
    for (const resolve of release) resolve(root);
    await Promise.all([finished, cancelled]); navigator.storage.getDirectory = original;
    assert.equal(u.redirects.length, 0); assert.equal(u.get('use-source').hidden, false);
    assert.doesNotMatch(u.get('elapsed').textContent, /can cancel/);
  });
  await test('picker startup errors and malformed return links keep recovery available', async () => {
    const u = await ui('?return=http%3A%2F%2F%5B');
    window.showDirectoryPicker = () => { throw new DOMException('Denied', 'SecurityError'); };
    u.get('pick').onclick();
    assert.match(u.get('status').textContent, /alternative/); assert.equal(u.get('play').hidden, false);
    assert.equal(u.get('play-link').href, 'http://localhost/index.html?assets=opfs');
  });
  await test('staged imports wait for the serving worker to understand the new layout', async () => {
    const listeners = new Set();
    const serving = { state: 'installing', addEventListener(type, f) { listeners.add(f); }, removeEventListener(type, f) { listeners.delete(f); } };
    const registration = { installing: serving, async update() {} };
    navigator.serviceWorker = { async register() { return registration; } };
    try {
      const u = await ui(), input = u.get('dir-input');
      input.files = [Object.assign(file('crew'), { name: 'CHARNAME' })];
      const pending = input.onchange({ target: input });
      await new Promise((r) => setImmediate(r));
      assert.equal(u.workers.length, 0); assert.equal(u.get('pick').disabled, true);
      serving.state = 'activated'; for (const listener of listeners) listener();
      await pending;
      assert.equal(u.workers.length, 1); assert.equal(listeners.size, 0);
      await u.get('cancel').onclick();
    } finally { delete navigator.serviceWorker; }
  });
  await test('unsupported storage disables all import routes and errors have accessible containers', async () => {
    const storage = navigator.storage; navigator.storage = {};
    const u = await ui();
    let reads = 0;
    await u.get('drop').ondrop({ preventDefault() {}, dataTransfer: { files: [{ name: 'copy.zip', arrayBuffer() { reads++; } }] } });
    assert.equal(reads, 0); assert.equal(u.get('pick').disabled, true);
    navigator.storage = storage;
    const html = readFileSync(new URL('./import/index.html', import.meta.url), 'utf8');
    assert.match(html, /id="status"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.match(html, /id="problems"[^>]*role="alert"/);
    assert.match(html, /id="bar"[^>]*role="progressbar"/);
  });
} finally { globalThis.setInterval = interval; globalThis.clearInterval = clear; }
console.log(`import safety and controls: ${count} checks passed`);
