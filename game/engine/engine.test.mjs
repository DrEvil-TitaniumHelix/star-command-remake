// engine.test.mjs — node self-test of the DOM-free engine parts: node game/engine/engine.test.mjs
// Covers: PUT verbs on attributes, GET/PUT round trip, text cell placement + wrap + scroll, PAINT, STR$/CINT/USING,
// and atlas.png/atlas.json consistency (decodes the PNG with node's zlib; the builder writes filter-0 rows).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { Framebuffer } from './display.js';
import { Gfx } from './gfx.js';
import { Text } from './text.js';
import { Atlas, Sprites, OR, AND, PRESET, PSET, XOR } from './sprites.js';
import { str$, cint, using, val } from './basic.js';
import { Input } from './input.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
let n = 0;
const t = (name, f) => { f(); n++; console.log(`ok ${n} ${name}`); };

// ---- atlas from disk (minimal PNG reader: 8-bit indexed, filter 0) ----
function readIndexedPng(buf) {
  let p = 8, w, h; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('latin1', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); assert.equal(d[8], 8); assert.equal(d[9], 3); }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) { assert.equal(raw[y * (w + 1)], 0, 'filter 0'); out.set(raw.subarray(y * (w + 1) + 1, (y + 1) * (w + 1)), y * w); }
  return { w, h, pix: out };
}
const meta = JSON.parse(readFileSync(here('../assets/atlas.json'), 'utf8'));
const png = readIndexedPng(readFileSync(here('../assets/atlas.png')));
const atlas = new Atlas(meta, png.pix);

t('atlas covers sprites_index.tsv', () => {
  const tsv = readFileSync(here('../../decode/data/sprites_index.tsv'), 'utf8').trim().split('\n');
  let count = 0;
  for (const line of tsv) {
    const c = line.split('\t');
    if (c[5] !== 'cga' && c[5] !== 'ega') continue;
    for (const part of c[6].split(';').filter(Boolean)) {
      const [, i, w, h] = /^(\d+):(\d+)x(\d+)@/.exec(part);
      const s = atlas.sprite(c[0], +i);
      assert.deepEqual([s.w, s.h], [+w, +h], `${c[0]}[${i}]`);
      count++;
    }
  }
  assert.equal(count, meta.sprites.length);
  assert.equal(png.w, meta.width);
  const logo = atlas.sprite('LOGO', 0);                 // bare stem -> .BAS
  assert.deepEqual([logo.w, logo.h, logo.mask], [81, 19, 3]);
  assert.equal(atlas.sprite('BIGSH-1.EGA', 0).mask, 15);
  assert.ok(atlas.sprite('TITLE.BAS', 0).pix.every((v) => v <= 3), 'CGA sprite holds attributes 0..3');
});

t('PUT verbs (RT_LEDGER 3E_58: 0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR)', () => {
  const fb = new Framebuffer(1), sp = new Sprites(fb, atlas);
  const img = { w: 4, h: 1, S: 1, mask: 3, pix: Uint8Array.from([0, 1, 2, 3]) };
  const run = (verb, bg) => { fb.cls(bg); sp.put(10, 10, img, verb); return [0, 1, 2, 3].map((i) => fb.point(10 + i, 10)); };
  assert.deepEqual(run(PSET, 2), [0, 1, 2, 3]);
  assert.deepEqual(run(PRESET, 2), [3, 2, 1, 0]);
  assert.deepEqual(run(OR, 2), [2, 3, 2, 3]);
  assert.deepEqual(run(AND, 2), [0, 0, 2, 2]);
  assert.deepEqual(run(XOR, 2), [2, 3, 0, 1]);
  fb.cls(1); sp.put(0, 0, img, XOR); sp.put(0, 0, img, XOR);
  assert.deepEqual([0, 1, 2, 3].map((i) => fb.point(i, 0)), [1, 1, 1, 1], 'XOR twice restores');
  sp.put(0, 0, { bank: 'SHIP-1.BAS', index: 0 }, 'PSET');
  assert.equal(fb.point(0, 0), atlas.sprite('SHIP-1.BAS', 0).pix[0]);
});

t('GET/PUT round trip', () => {
  const fb = new Framebuffer(1), sp = new Sprites(fb, atlas);
  sp.put(0, 0, { bank: 'TITLE.BAS', index: 0 }, PSET);
  const buf = sp.get(50, 60, 99, 89);
  assert.deepEqual([buf.w, buf.h], [50, 30]);
  sp.put(200, 100, buf, PSET);
  for (let y = 0; y < 30; y++) for (let x = 0; x < 50; x++) assert.equal(fb.point(200 + x, 100 + y), fb.point(50 + x, 60 + y));
});

t('framebuffer scale 2 keeps logical coordinates', () => {
  const fb = new Framebuffer(2);
  fb.pset(3, 4, 2);
  assert.equal(fb.point(3, 4), 2);
  assert.equal(fb.pix[(9) * fb.W + 7], 2);
});

t('text: LOCATE/PRINT cell geometry, wrap, scroll, row 25', () => {
  const font = JSON.parse(readFileSync(here('../assets/font8x8.json'), 'utf8'));
  const fb = new Framebuffer(1), tx = new Text(fb, font);
  tx.locate(5, 2); tx.print('Version 1.0                    3/18/88');
  assert.deepEqual([tx.row, tx.col], [6, 1], '39 chars from col 2 end at col 40, one newline');
  const A = font.glyphs[65];
  tx.locate(13, 8); tx.print('A', ';');
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) assert.equal(fb.point(56 + x, 96 + y), (A[y] >> (7 - x)) & 1 ? 3 : 0);
  assert.deepEqual([tx.row, tx.col], [13, 9]);
  tx.locate(1, 38); tx.print('ABCDE', ';');
  assert.deepEqual([tx.row, tx.col], [2, 6], 'item that does not fit starts on the next line');
  tx.locate(1, 1); tx.print('Z', ';'); tx.locate(24, 1); tx.print('x');
  assert.equal(tx.row, 24, 'newline on row 24 scrolls');
  assert.equal(fb.point(0, 0), 0, 'row 1 scrolled away');
  tx.locate(25, 1); tx.print('row25', ';');
  assert.equal(tx.row, 25);
  tx.locate(3, 1); tx.print(['3-', 7], ';');
  assert.equal(tx.col, 1 + 2 + 3, 'numbers print with sign space and trailing space');
});

t('PAINT stops at the border colour (SU-03: PAINT (3,3),2,3)', () => {
  const fb = new Framebuffer(1), g = new Gfx(fb);
  g.line(0, 1, 319, 198, -1, 'B'); g.line(1, 2, 318, 197, -1, 'B');
  g.line(5, 29, 314, 194, -1, 'B'); g.line(6, 30, 313, 193, -1, 'B');
  g.paint(3, 3, 2, 3);
  assert.equal(fb.point(3, 3), 2);
  assert.equal(fb.point(100, 100), 0, 'inside the inner box is untouched');
  assert.equal(fb.point(0, 0), 0, 'row 0 lies outside the outer box');
});

t('BASIC formatting', () => {
  assert.equal(str$(5), ' 5'); assert.equal(str$(-3), '-3'); assert.equal(str$(0.5), ' .5');
  assert.equal(str$(1 / 3), ' .3333333'); assert.equal(str$(12345678), ' 1.234568E+07');
  assert.equal(cint(2.5), 3); assert.equal(cint(3.5), 4); assert.equal(cint(-2.5), -3); assert.equal(cint(68.5), 69); assert.equal(cint(0.4), 0);   // A915: half away from zero
  assert.equal(using('####', 120), ' 120'); assert.equal(using('###', 5), '  5'); assert.equal(using('#.##', 0.5), '0.50');
  assert.equal(using('##', 123), '%123');
  assert.equal(val(' 12abc'), 12); assert.equal(val('x'), 0);
});

// ---- milestone 2 ----
const { Files } = await import('./files.js');
const { State, mbfToFloat, floatToMbf } = await import('./state.js');
const { Data } = await import('./data.js');
const { Audio } = await import('./audio.js');
const { Timer, TICKS_PER_SEC } = await import('./timer.js');
const { run, chain, ChainSignal } = await import('./chain.js');
const files = new Files({ baseDir: here('../assets/files'), storage: null });
const gmap = JSON.parse(readFileSync(here('../assets/gmap.json'), 'utf8'));

t('CHARINFO.BAS: BLOAD -> G!() -> BSAVE is byte-identical to the shipped file', () => {});
{
  const st = new State(files, gmap);
  await st.load('CHARINFO');                         // bare name -> .BAS
  assert.equal(st.G[79], 5000); assert.equal(st.v.CreditsHi, 3); assert.equal(st.v.StdDelay, 188); assert.equal(st.v.ChainArg, 2);
  assert.equal(st.v.SectorX, 28);
  st.save('CHARINFO.BAS');
  const orig = readFileSync(here('../assets/files/CHARINFO.BAS'));
  assert.deepEqual(Buffer.from(files.mem.get('CHARINFO.BAS')), orig);
  st.v.Fuel = 123.5; st.save();
  const st2 = new State(files, gmap); await st2.load();
  assert.equal(st2.v.Fuel, 123.5, 'a saved change reads back');
  console.log('   CHARINFO.BAS round trip: %d bytes identical', orig.length);
}

t('MBF <-> IEEE exact for every normal single', () => {
  const b = new Uint8Array(4), o = new Uint8Array(4);
  let seed = 12345;
  for (let k = 0; k < 20000; k++) {
    for (let i = 0; i < 4; i++) { seed = (seed * 1103515245 + 12345) >>> 0; b[i] = seed >>> 24; }
    if (b[3] < 3) b[3] = 3 + (b[3] % 250);
    floatToMbf(mbfToFloat(b), o);
    assert.deepEqual([...o], [...b]);
  }
  // CHARINFO.BAS A(79) at file offset 0x143 = `00 40 1c 8d` = 5000.0 (DATA_FILES.md §B prints 0x147 / ...8c: typo)
  assert.equal(mbfToFloat(Uint8Array.from([0x00, 0x40, 0x1c, 0x8d])), 5000);
});

t('NAME / CHARNAME via INPUT # rules = convert_data.py JSON', () => {});
{
  const d = new Data(files);
  const names = await d.nameFields();
  assert.deepEqual(names, (await d.table('NAME')).fields);
  assert.equal(names.length, 374);
  assert.deepEqual([names[0], names[13], names[344], names[373]], ['Private', 'Desk Duty', 'Engine', 'Intelligence']);
  const cn = await d.charName();
  assert.deepEqual(cn, Array(9).fill(''));
  const enc = await d.open('ENCINFO');
  assert.equal(enc.str(), 'Service Unit');
  assert.deepEqual([enc.num(), enc.num(), enc.num()], [4, 30, -100]);
  const mes = await d.open('MES-1');
  assert.equal(mes.line(), ''); assert.equal(mes.line(), 'Empty Coridor');
}

t('PLAY: STARTUP tune fed 3 chars at a time; PLAY(0) and SOUND x,0', () => {
  const a = new Audio();
  a.play('MBMLT126');
  const T = 'O1 E3>D+8E4<B4>C4<G+4 A4 E4 O1F3> E8D4< F4F+3>E8D4<F+4G3> F8E4< G4G+3>F8E4< B4 O2C4<A4> C4 E4 A3P64<A8P64A4>C4< B4G+4>F4E4< A4 E4P64 E3 A8P64 A4 E4P64 E3G+8A4>C4< B4E4< A2 P1';
  for (let i = 0; i < T.length; i += 3) a.play(`X${T.slice(i, i + 3)}`);
  assert.equal(a.queue(), 55);
  assert.ok(Math.abs(a.noteFreq(46) - 440) < 1e-9 && Math.abs(a.noteFreq(37) - 261.63) < 0.01);
  a.sound(99, 0);
  assert.equal(a.queue(), 0);
});

{
  // SOUND in MF waits for the previous tone only, not for its own (PLBATTLE rocket arc: 999-tick tone cut by SOUND 99,0)
  const a = new Audio();
  let now = 0;
  a.clock = () => now;
  const done = (p) => { let d = false; p.then(() => { d = true; }); return () => d; };
  const tick = () => new Promise((r) => setTimeout(r, 30));
  const first = done(a.sound(11000, 999));             // 999 ticks = 54.9 s
  await tick();
  assert.ok(first(), 'SOUND returns while its own 55 s tone plays');
  const second = done(a.sound(12000, 18));             // queued behind the first
  await tick();
  assert.ok(!second(), 'the next SOUND waits for the previous tone');
  now = 999 / 18.2065 * 1000 + 1;                      // first tone over
  await tick();
  assert.ok(second(), 'and starts once it has ended');
  a.sound(99, 0);
  assert.equal(a.queue(), 0, 'SOUND x,0 empties the queue');
  await a.sound(11000, 999);                           // rocket-arc step: resolves at once on an empty queue
  await a.sound(99, 0);
  assert.equal(a.queue(), 0);
  t('SOUND MF: waits for the previous tone, not its own; SOUND x,0 cuts it', () => {});
}

t('v1.1 input routing: overlay modal gets ENTER for pad A, never the game-menu highlight (review E-2)', () => {
  const i = new Input(); const got = [];
  i.text = { screenText: () => ['S-Search  R-Reload'] };
  i.onDeviceEscape = () => { i.modal = { key: (k) => got.push(k), click() {} }; };
  i.padButton('RB'); assert.equal(i.highlight?.key, 'S');
  i.padButton('B'); i.padButton('A'); i.padButton('RB'); i.padButton('A');
  assert.deepEqual(got, ['\r', '\r']);
  i.modal = null; i.push('x'); assert.equal(i.inkey(), 'x', 'code-pushed keys bypass the overlay');
});

t('TIMER is quantised to BIOS ticks', () => {
  const v = new Timer().now();
  // TIMER is a single (like the original), so near 86400 s it only resolves ~0.008 s = 0.15 tick
  assert.ok(Math.abs(v * TICKS_PER_SEC - Math.round(v * TICKS_PER_SEC)) < 0.2);
});

t('CHAIN runner switches modules, state kept', () => {});
{
  const log = [];
  const E = { input: {}, state: { G: new Float32Array(4) } };
  const mods = {
    startup: { default: async (e) => { e.state.G[0] = 7; log.push('startup'); return e.chain('STARPORT.STR'); } },
    starport: { default: async (e, o) => { log.push(`starport ${o.module} ${e.state.G[0]}`); chain('SPACE.EXE'); } },
    space: { default: async () => { log.push('space'); return 'done'; } },
  };
  E.chain = chain;
  const r = await run(E, 'STARCOMM', {}, async (f) => mods[f]);
  assert.equal(r, 'done');
  assert.deepEqual(log, ['startup', 'starport STARPORT 7', 'space']);
  assert.throws(() => chain('NOPE'), /unknown module/);
  assert.ok(new ChainSignal('SPACE') instanceof Error);
}

t('SC-2 + addendum: SCREEN 1 colour 3 light grey until the first SCREEN 7, then white; kept across CHAIN', () => {});
{
  const fb = new Framebuffer(1);
  const EGA = (a) => fb.attr2ega[a];
  fb.screen(1); fb.modulePalette('STARTUP', true);                       // game start: STARTUP, PALETTE 1,9: 2,4
  assert.deepEqual([EGA(0), EGA(1), EGA(2), EGA(3)], [0, 9, 4, 7], 'low intensity: colour 3 = EGA 7 light grey');
  fb.colorScreen1(0, 1); assert.equal(EGA(3), 7);
  fb.colorScreen1(0, 0); assert.deepEqual([EGA(1), EGA(2), EGA(3)], [2, 4, 6], 'palette 0 low intensity');
  // CHAIN to SPACE/INSIDE (same fb object), then PLBATTLE switches to SCREEN 7
  const E = { fb, input: {}, state: { G: new Float32Array(4) } };
  E.chain = chain;
  const mods = {
    space: { default: async (e) => { e.fb.screen(1); e.fb.modulePalette('SPACE', true); assert.equal(e.fb.attr2ega[3], 7); chain('PLBATTLE.STR'); } },
    plbattle: { default: async (e) => { e.fb.screen(7); assert.equal(e.fb.attr2ega[15], 15); chain('INSIDE.EXE'); } },
    inside: { default: async (e) => { e.fb.screen(1); e.fb.modulePalette('INSIDE', true); return [e.fb.attr2ega[1], e.fb.attr2ega[2], e.fb.attr2ega[3]]; } },
  };
  const back = await run(E, 'SPACE', {}, async (f) => mods[f]);
  assert.deepEqual(back, [2, 6, 15], 'after PLBATTLE: module remaps 1/2 kept, colour 3 = EGA 15 white');
  fb.colorScreen1(0, 1); assert.equal(EGA(3), 15, 'COLOR 0,1 after PLBATTLE stays high intensity');
  // fresh start = new framebuffer: back to light grey; the flag is not part of the save
  const fresh = new Framebuffer(1); fresh.screen(1);
  assert.equal(fresh.attr2ega[3], 7);
  assert.ok(!('ega7Seen' in new State(files, gmap)), 'not stored in the COMMON state / save');
}

t('LINE style: 16-bit mask, MSB first, restarted per segment (BRUN30 826F rol+plot, E8E4 restores [12EC]); PLBATTLE 08949/0896A', () => {
  const fb = new Framebuffer(1), g = new Gfx(fb); fb.screen(7);
  const row = (y, x0, n) => Array.from({ length: n }, (_, i) => fb.point(x0 + i, y));
  const bits = (s, c) => [...s].map(b => (b === '1' ? c : 0));
  g.line(10, 20, 41, 20, 3, '', 0xCCCC);                   // 08949 `LINE ..., 3, , &HCCCC` (32 pixels)
  assert.deepEqual(row(20, 10, 32), bits('11001100110011001100110011001100', 3), '&HCCCC: bit 15 first, pattern repeats, a clear bit leaves the pixel');
  g.line(10, 30, 25, 30, 2, '', 0xCD26);                   // 0896A `LINE ..., 2, , &HCD26` (16 pixels)
  assert.deepEqual(row(30, 10, 16), bits('1100110100100110', 2), '&HCD26 = 1100 1101 0010 0110');
  g.line(10, 40, 41, 40, 1, '', -1);
  assert.deepEqual(row(40, 10, 32), new Array(32).fill(1), 'style -1 (CX = -1) is a solid line');
  g.line(10, 50, 25, 65, 1, 'B', 0x8000);                   // B: every side starts again at bit 15
  assert.deepEqual([fb.point(10, 50), fb.point(11, 50), fb.point(10, 51), fb.point(10, 65), fb.point(11, 65), fb.point(25, 50), fb.point(25, 51)], [1, 0, 0, 1, 0, 1, 0]);
  g.line(10, 70, 25, 75, 1, 'BF', 0x8000);
  assert.equal(fb.point(20, 72), 1, 'BF ignores the style (EC76 fill)');
});

console.log(`all ${n} tests passed`);
