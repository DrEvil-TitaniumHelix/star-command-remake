export const SAVE_FILES = ['CHARINFO.BAS', 'CHARNAME'];

export async function applySaveParam(files, params, { base = 'assets/saves/', fetchImpl = globalThis.fetch, onDone = null } = {}) {
  const name = params.get('save');
  if (!name) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(name)) throw new Error(`?save=${name}: bad save name`);
  const force = params.get('force') === '1';
  if (!force && files.saved('CHARINFO.BAS')) return { name, applied: false };
  const bytes = await Promise.all(SAVE_FILES.map(async (f) => {
    const r = await fetchImpl(`${base}${name}/${f}`);
    if (!r.ok) throw new Error(`?save=${name}: ${f} not found`);
    return new Uint8Array(await r.arrayBuffer());
  }));
  if (force) files.reset();
  SAVE_FILES.forEach((f, i) => files.write(f, bytes[i]));
  onDone?.({ name, force });
  return { name, applied: true, force };
}
