import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync, deflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { convertAll, RECIPE_VERSION } from './convert/index.js';
import { floatRepr, dumps, PyFloat } from './convert/pyjson.js';
import { DISK_FILES } from './convert/lists.js';
import { validate } from './import/validate.js';
import { buildAtlas, streamDeflate } from './convert/atlas.js';
import { newSave, saveRead } from './convert/saves.js';
import { Files } from '../engine/files.js';
import { State } from '../engine/state.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const ti = process.argv.indexOf('--targets');
const TARGETS = ti > 0 ? process.argv[ti + 1] : '../re-targets/starcommand/starcoma';
const ASSETS = here('../assets/');
let n = 0;
const test = async (name, fn) => { await fn(); n++; console.log(`ok ${name}`); };
const MANIFEST = JSON.parse(readFileSync(here('./import/manifest.json'), 'utf8'));

await test('only files written by the game bypass release hashes', async () => {
  const saves = ['CHARINFO.BAS', 'CHARNAME', ...['IN', 'INMAP'].flatMap((s) => [1, 2, 3, 4, 5, 6, 7].map((i) => `${s}-${i}.BAS`))];
  assert.deepEqual(MANIFEST.list.filter((f) => f.save).map((f) => f.name).sort(), saves.sort());
  for (const f of MANIFEST.list.filter((f) => f.required)) {
    const m = { list: [f] }, bytes = new Uint8Array(f.size);
    assert.equal((await validate(m, [{ name: f.name.toLowerCase(), bytes }], async () => '')).ok, !!f.save, f.name);
    if (f.save) {
      assert.equal((await validate(m, [{ name: f.name, bytes: new Uint8Array() }])).ok, true);
      assert.equal((await validate(m, [])).ok, false);
    }
  }
});
await test('played saves survive conversion and damaged crews need explicit consent', async () => {
  const f = new Map(), names = new TextEncoder().encode('Ship,One,Two,Three,Four,Five,Six,Seven,Eight,\x1a');
  const s = new State(new Files({ storage: null }), {});
  s.G[79] = 12345;
  const played = Files.makeBsave(s.toBytes(), s.header.seg, s.header.off);
  f.set('CHARINFO.BAS', played); f.set('CHARNAME', names);
  for (let i = 1; i <= 7; i++) {
    f.set(`IN-${i}.BAS`, Files.makeBsave(new Uint8Array(5502), 0, 0x48b0));
    const d = new Uint8Array(8700), v = new DataView(d.buffer);
    v.setUint16(0, 370, true); v.setUint16(2, 185, true);
    f.set(`INMAP-${i}.BAS`, Files.makeBsave(d, 0, 0x5e2e));
  }
  const read = (n) => f.get(n);
  for (const [n, b] of f) assert.equal(saveRead(read, {})(n), b, n);
  const blank = newSave({});
  const disk = new Files({ storage: null });
  disk.mem.set('CHARINFO.BAS', blank);
  const fresh = new State(disk, {});
  await fresh.load();
  assert.equal(fresh.G[78] * 30000 + fresh.G[79], 95000);
  assert.equal(fresh.G[43], 0);
  assert.equal(fresh.G[2216], 28);
  assert.equal(fresh.G[2217], 2);
  for (const b of [played.subarray(0, 7), played.subarray(0, played.length - 2), Uint8Array.of(0), new Uint8Array(played.length)]) {
    f.set('CHARINFO.BAS', b);
    assert.throws(() => saveRead(read, {}), (e) => e.code === 'crew');
    const r = saveRead(read, {}, true);
    assert.deepEqual(r('CHARINFO.BAS'), blank);
    assert.equal(new TextDecoder().decode(r('CHARNAME')), ','.repeat(9) + '\x1a');
  }
  f.set('CHARINFO.BAS', played); f.set('CHARNAME', new Uint8Array());
  assert.throws(() => saveRead(read, {}), (e) => e.code === 'crew');
  assert.deepEqual(saveRead(read, {}, true)('CHARINFO.BAS'), blank);
  f.set('CHARNAME', names); f.set('CHARINFO.BAS', played.subarray(0, played.length - 1));
  assert.equal(saveRead(read, {})('CHARINFO.BAS').length, 10411);
  f.set('IN-1.BAS', Files.makeBsave(new Uint8Array(5002), 0, 0));
  assert.equal(saveRead(read, {})('IN-1.BAS').length, 5010);
  const station = f.get('IN-1.BAS'), picture = f.get('INMAP-1.BAS');
  for (const b of [new Uint8Array(), station.subarray(0, 7), station.subarray(0, station.length - 2)]) {
    f.set('IN-1.BAS', b);
    assert.throws(() => saveRead(read, {}), /IN-1.BAS.*intact station maps/);
  }
  f.set('IN-1.BAS', station);
  const wrong = picture.slice();
  wrong[7] = 0;
  f.set('INMAP-1.BAS', wrong);
  assert.throws(() => saveRead(read, {}), /INMAP-1.BAS.*intact station maps/);
  f.set('INMAP-1.BAS', new Uint8Array(8708));
  assert.throws(() => saveRead(read, {}), /INMAP-1.BAS.*intact station maps/);
});

await test('an alt row is accepted and names its version', async () => {
  const m = { ver: '1.0', list: [{ name: 'A', size: 1, sha256: 'x', required: true, alt: [{ size: 2, sha256: 'y', ver: '1.2' }] }] };
  const run = (n, h) => validate(m, [{ name: 'a', bytes: new Uint8Array(n) }], async () => h);
  assert.equal((await run(1, 'x')).ver, '1.0');
  assert.equal((await run(2, 'y')).ver, '1.2');
  assert.equal((await run(2, 'x')).ok, false);
  assert.equal((await run(3, 'y')).ok, false);
});
await test('floatRepr = Python repr', () => {
  const cases = [[0.1, '0.1'], [1e-5, '1e-05'], [0.0001, '0.0001'], [1.5e16, '1.5e+16'], [1e16, '1e+16'], [123.0, '123.0'],
    [-2.5, '-2.5'], [Math.fround(1.2), '1.2000000476837158'], [1e22, '1e+22'], [123456789012345.6, '123456789012345.6'], [5e-324, '5e-324']];
  for (const [v, want] of cases) assert.equal(floatRepr(v), want, String(v));
});
await test('dumps = json.dumps', () => {
  assert.equal(dumps({ a: [1, new PyFloat(0), 0.5, 'é\u0001"'] }, { separators: [',', ':'], ensureAscii: false }), '{"a":[1,0.0,0.5,"é\\u0001\\""]}');
  assert.equal(dumps({ a: [], b: {}, c: [1, 'é'] }, { indent: 2 }), '{\n  "a": [],\n  "b": {},\n  "c": [\n    1,\n    "\\u00e9"\n  ]\n}');
});
await test('manifest copy and sprite index in sync', () => {
  const m = JSON.parse(readFileSync(here('./import/manifest.json'), 'utf8'));
  m.list = m.list.map(({ save, ...f }) => f);
  assert.deepEqual(m, JSON.parse(readFileSync(here('../../docs/byoc/manifest.json'), 'utf8')));
  execFileSync(process.execPath, [here('../../tools/byoc/sprites_index.mjs'), '--check'], { stdio: 'pipe' });
  execFileSync(process.execPath, [here('../../tools/byoc/annotations.mjs'), '--check'], { stdio: 'pipe' });
});
await test('manifest covers every file the recipe reads', () => {
  const req = new Set(MANIFEST.list.filter((f) => f.required).map((f) => f.name));
  for (const f of DISK_FILES) assert.ok(req.has(f), f);
  assert.equal(MANIFEST.list.length, MANIFEST.files);
});

if (!existsSync(`${TARGETS}/STARCOMM.EXE`)) {
  console.log(`SKIP conversion tests: originals not found at ${TARGETS} (pass --targets DIR)`);
  console.log(`assets.test: ${n} passed (conversion skipped)`);
  process.exit(0);
}
const read = (name) => new Uint8Array(readFileSync(`${TARGETS}/${name}`));
const sha = (b) => createHash('sha256').update(b).digest('hex');

await test('originals validate against the manifest', async () => {
  const files = readdirSync(TARGETS).map((name) => ({ name, bytes: read(name) }));
  const r = await validate(MANIFEST, files, async (b) => sha(b));
  assert.deepEqual(r.problems, []);
  assert.equal(r.files.size, MANIFEST.files);
  const bad = await validate(MANIFEST, files.filter((f) => f.name !== 'SPACE.EXE').map((f) => (f.name === 'NAME' ? { name: 'name', bytes: f.bytes.subarray(1) } : f)), async (b) => sha(b));
  assert.equal(bad.ok, false);
  assert.ok(bad.problems.some((p) => /^SPACE\.EXE is missing \(expected \d+ bytes\)$/.test(p)));
  assert.ok(bad.problems.some((p) => /^NAME is \d+ bytes, expected \d+ bytes$/.test(p)));
});

const pngChunks = (b) => {
  const out = [];
  for (let o = 8; o < b.length;) { const len = b.readUInt32BE(o); out.push([b.toString('latin1', o + 4, o + 8), b.subarray(o + 8, o + 8 + len)]); o += 12 + len; }
  return out;
};
const pixelSame = (a, b) => {
  const x = pngChunks(Buffer.from(a)), y = pngChunks(Buffer.from(b));
  return x.length === y.length && x.every(([t, d], i) => t === y[i][0] && Buffer.compare(t === 'IDAT' ? inflateSync(d) : d, t === 'IDAT' ? inflateSync(y[i][1]) : y[i][1]) === 0);
};

const gmap = JSON.parse(readFileSync(`${ASSETS}gmap.json`, 'utf8'));
await test(`recipe ${RECIPE_VERSION}: every output equals the committed game/assets`, async () => {
  const seen = [];
  let png = null;
  const files = new Map(readdirSync(TARGETS).map((n) => [n.toUpperCase(), read(n)]));
  const code = { files, cfg: JSON.parse(readFileSync(here('./modules.json'), 'utf8')), ann: JSON.parse(readFileSync(here('./convert/annotations.json'), 'utf8')) };
  for await (const out of convertAll(read, { deflate: (r) => deflateSync(r, { level: 9 }), gmap, code })) {
    const ref = readFileSync(out.path.startsWith('modules/') ? here(`../${out.path}`) : `${ASSETS}${out.path}`);
    seen.push(out.path);
    if (out.path === 'atlas.png') { png = { same: Buffer.compare(ref, Buffer.from(out.bytes)) === 0, pixels: pixelSame(out.bytes, ref) }; continue; }
    assert.ok(Buffer.compare(ref, Buffer.from(out.bytes)) === 0, `${out.path} differs (${out.bytes.length} vs ${ref.length} bytes)`);
  }
  assert.equal(seen.length, 107 + 24 + 1 + 2 + 2 + 8);
  assert.equal(new Set(seen).size, seen.length);
  for (const f of readdirSync(`${ASSETS}files`)) assert.ok(seen.includes(`files/${f}`), `files/${f} not produced`);
  for (const f of readdirSync(`${ASSETS}data`)) if (f !== 'manual.json') assert.ok(seen.includes(`data/${f}`), `data/${f} not produced`);
  assert.ok(png.pixels, 'atlas.png pixels differ');
  console.log(`   atlas.png: ${png.same ? 'byte-identical' : 'pixel-identical (IHDR/PLTE/IEND and inflated scanlines equal; deflate stream differs from Python zlib)'}`);
});
await test('atlas with the browser deflate (CompressionStream) is pixel-identical', async () => {
  const [png] = await buildAtlas(read, streamDeflate);
  assert.ok(pixelSame(png.bytes, readFileSync(`${ASSETS}atlas.png`)));
});
console.log(`assets.test: ${n} passed`);
