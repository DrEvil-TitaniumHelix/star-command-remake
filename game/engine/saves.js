export const SAVE_FILES = ['CHARINFO.BAS', 'CHARNAME'];

export async function applySaveParam(files, params, { base = 'assets/saves/', fetchImpl = globalThis.fetch, onDone = null, ask = null } = {}) {
  const name = params.get('save');
  if (!name) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(name)) throw new Error(`?save=${name}: bad save name`);
  const force = params.get('force') === '1';
  const exists = !!files.saved('CHARINFO.BAS');
  if (!force && exists) return { name, applied: false };
  if (force && exists && ask && !(await ask('Replace your saved game with the veteran crew? (Y/N)'))) return { name, applied: false };
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
