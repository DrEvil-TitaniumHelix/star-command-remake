import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Files } from './files.js';
import { State } from './state.js';
import { Data } from './data.js';
import { applySaveParam } from './saves.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
let n = 0;
const t = async (name, f) => { await f(); n++; console.log(`ok ${n} ${name}`); };

class MemStorage {
  constructor() { this.m = new Map(); }
  get length() { return this.m.size; }
  key(i) { return [...this.m.keys()][i]; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
}
const disk = (p) => readFileSync(here(`../assets/saves/${p}`));
const fetchImpl = async (url) => {
  const m = /^assets\/saves\/(.+)$/.exec(url);
  try { const b = disk(m[1]); return { ok: true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) }; } catch { return { ok: false }; }
};
const browserFiles = () => new Files({ baseDir: here('../assets/files').replace(/[\\/]$/, ''), storage: new MemStorage() });
const q = (s) => new URLSearchParams(s);

await t('?save=veteran fills an empty storage', async () => {
  const files = browserFiles();
  const r = await applySaveParam(files, q('save=veteran'), { fetchImpl });
  assert.equal(r.applied, true);
  assert.deepEqual([...files.saved('CHARINFO.BAS')], [...disk('veteran/CHARINFO.BAS')]);
  assert.deepEqual([...files.saved('CHARNAME')], [...disk('veteran/CHARNAME')]);
});

await t('?save=veteran keeps an existing player save; &force=1 replaces it and forgets station maps', async () => {
  const files = browserFiles();
  files.write('CHARINFO.BAS', new Uint8Array([0xfd, 1, 2, 3]));
  files.write('IN-1.BAS', new Uint8Array([9]));
  assert.equal((await applySaveParam(files, q('save=veteran'), { fetchImpl })).applied, false);
  assert.deepEqual([...files.saved('CHARINFO.BAS')], [0xfd, 1, 2, 3]);
  let done = null;
  const r = await applySaveParam(files, q('save=veteran&force=1'), { fetchImpl, onDone: (x) => { done = x; } });
  assert.equal(r.applied, true); assert.equal(done.force, true);
  assert.deepEqual([...files.saved('CHARINFO.BAS')], [...disk('veteran/CHARINFO.BAS')]);
  assert.equal(files.saved('IN-1.BAS'), null);
});

await t('bad or missing save names are errors, no ?save is a no-op', async () => {
  const files = browserFiles();
  await assert.rejects(applySaveParam(files, q('save=../x'), { fetchImpl }), /bad save name/);
  await assert.rejects(applySaveParam(files, q('save=nosuch'), { fetchImpl }), /not found/);
  assert.equal(await applySaveParam(files, q(''), { fetchImpl }), null);
});

await t('veteran save: 8 healthy crew, ship, fuel, credits, mission (what STARPORT reads)', async () => {
  const files = browserFiles();
  await applySaveParam(files, q('save=veteran'), { fetchImpl });
  const st = new State(files, JSON.parse(readFileSync(here('../assets/gmap.json'), 'utf8')));
  await st.load();
  assert.deepEqual(st.toBytes(), files.saved('CHARINFO.BAS').subarray(7, 7 + 10404), 'byte-identical round trip');
  const names = await new Data(files).charName();
  assert.equal(names[0], 'Valkyrie');
  assert.equal(names.slice(1).filter(Boolean).length, 8);
  for (let m = 1; m <= 8; m++) {
    assert.ok(st.crew(m, 0) > 0, `member ${m} present`);
    assert.equal(st.crew(m, 31), 1, 'status Okay');
    assert.equal(st.crew(m, 15), st.crew(m, 16), 'HP = max HP');
    assert.ok(st.crew(m, 34) >= 6 && st.crew(m, 34) <= 13, 'rank');
    for (let f = 17; f <= 28; f++) assert.ok(st.crew(m, f) <= 8, 'skill cap 8');
    assert.ok(st.crew(m, 29) * 0.005479452 < 60, 'no aging');
    if (m >= 3) assert.ok(st.crew(m, 14) <= st.crew(m, 13), 'squad not overloaded');
  }
  assert.equal(st.v.Fuel, st.v.MaxFuel);
  assert.ok(st.G[43] > 0, 'ship owned');
  assert.equal(st.v.Armor, 1000);
  assert.equal(st.v.CreditsHi * 30000 + st.v.CreditsLo, 50000);
  assert.equal(st.G[110], 1, 'first mission active');
  assert.equal(st.G[2261], st.v.MissionCodeA); assert.equal(st.G[2262], st.v.MissionCodeB);
  assert.equal(st.v.Years + st.v.Days + st.G[2207] + st.G[2209] + st.G[2210] + st.G[2212], 0, 'no days away');
  assert.equal(st.G[2265], 0, 'no save lock');
});

console.log(`${n} tests passed`);
