export const MAX_FILE = 8 * 1024 * 1024;
export const MAX_TOTAL = 128 * 1024 * 1024;
export const baseName = (name) => name.replaceAll('\\', '/').split('/').pop().toUpperCase();
export const wanted = (manifest, name) => name.replaceAll('\\', '/').split('/').length <= 34 && manifest.list.some((f) => f.name === baseName(name));

export function selectFolder(manifest, candidates) {
  const groups = new Map(), required = new Set(manifest.list.filter((f) => f.required).map((f) => f.name));
  for (const c of candidates) {
    if (!wanted(manifest, c.name)) continue;
    const path = c.name.replaceAll('\\', '/'), dir = path.slice(0, path.lastIndexOf('/') + 1);
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir).push(c);
  }
  const score = (files) => new Set(files.map((f) => baseName(f.name)).filter((n) => required.has(n))).size;
  const originals = new Set(manifest.list.filter((f) => f.required && !f.save).map((f) => f.name));
  let copies = [...groups].filter(([, files]) => files.some((f) => originals.has(baseName(f.name))));
  if (copies.length > 1) {
    const parent = copies.find(([dir]) => copies.every(([other]) => other.startsWith(dir)));
    if (!parent) throw new Error('More than one game folder was found. Choose the single copy you want to play, or a ZIP containing only that copy.');
    copies = [parent];
  }
  const ranked = (copies.length ? copies.map(([, files]) => files) : [...groups.values()]).sort((a, b) => score(b) - score(a));
  if (!ranked.length) return [];
  if (ranked.length > 1 && score(ranked[0]) === score(ranked[1])) throw new Error('More than one game folder was found. Choose the single copy you want to play, or a ZIP containing only that copy.');
  const names = new Set();
  for (const f of ranked[0]) {
    const n = baseName(f.name);
    if (names.has(n)) throw new Error(`Two files are named ${n} in this folder. Choose a copy with only one of each game file.`);
    names.add(n);
  }
  return ranked[0];
}

export function abortable(work, signal, timeout = 60000) {
  return new Promise((resolve, reject) => {
    let timer;
    const finish = (fn, value) => { clearTimeout(timer); signal?.removeEventListener('abort', abort); fn(value); };
    const abort = () => finish(reject, new DOMException('Import cancelled.', 'AbortError'));
    if (signal?.aborted) return abort();
    signal?.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => finish(reject, new Error('Reading took too long. Make the game folder available on this computer, then retry.')), timeout);
    Promise.resolve().then(work).then((v) => finish(resolve, v), (e) => finish(reject, e));
  });
}

export async function directoryFiles(dir, manifest, signal, prefix = '', depth = 0) {
  if (depth > 32) return [];
  const out = [], it = dir.values();
  for (;;) {
    const { done, value: h } = await abortable(() => it.next(), signal);
    if (done) break;
    const name = prefix + h.name;
    if (h.kind === 'file' && wanted(manifest, name)) out.push({ name, getFile: () => h.getFile() });
    else if (h.kind === 'directory') out.push(...await directoryFiles(h, manifest, signal, name + '/', depth + 1));
  }
  return out;
}

export async function readBytes(file, signal, limit = MAX_FILE, progress = () => {}) {
  if (file.size > limit) throw new Error('This file is too large. Choose a copy containing only the game.');
  if (!file.stream) {
    const bytes = new Uint8Array(await abortable(() => file.arrayBuffer(), signal));
    if (bytes.length > limit) throw new Error('This file is too large. Choose a copy containing only the game.');
    progress(1); return bytes;
  }
  const reader = file.stream().getReader(), chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await abortable(() => reader.read(), signal);
      if (done) break;
      size += value.length;
      if (size > limit) throw new Error('This file is too large. Choose a copy containing only the game.');
      chunks.push(value); progress(file.size ? size / file.size : 0);
    }
  } finally { reader.cancel().catch(() => {}); }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const chunk of chunks) { bytes.set(chunk, at); at += chunk.length; }
  progress(1); return bytes;
}

export async function readFiles(list, manifest, signal, progress = () => {}) {
  const chosen = selectFolder(manifest, list), out = [];
  let total = 0;
  for (const entry of chosen) {
    progress(out.length, chosen.length);
    try {
      const file = entry.file ?? await abortable(entry.getFile, signal);
      if (file.size > MAX_FILE || total + file.size > MAX_TOTAL) throw new Error('This copy contains a game file that is too large. Choose an intact copy.');
      const bytes = await readBytes(file, signal, Math.min(MAX_FILE, MAX_TOTAL - total), (fraction) => progress(out.length, chosen.length, fraction));
      total += bytes.length;
      out.push({ name: entry.name, bytes });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      if (e.message.includes('too large')) throw e;
      throw new Error(`Could not read ${baseName(entry.name)}. Make the file available on this computer, then retry. ${e.message.includes('too long') ? e.message : ''}`.trim());
    }
  }
  progress(out.length, chosen.length);
  return out;
}
