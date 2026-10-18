// byoc.test.mjs — BYOC tier 3 equivalence test (docs/BYOC.md 3.4, B3 step 3): the JS code pipeline run on the original
// EXEs must reproduce today's committed files byte for byte:
//   decode/listings/<MOD>.lst (7)   decode/data/tools/_<MOD>.json (7, deep-equal)   decode/pseudo/<MOD>.bas.md (5)
//   game/modules/{space,starport/flow,inside,plbattle,spbattle}.js + space/banks.js + inside/banks.js + startup/strings.js
// Run: node game/byoc/byoc.test.mjs   (originals from $SC_ORIGINALS or game/byoc/modules.json originals_default;
// without them the pipeline part is skipped with a message and only the unit checks run).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { fileURLToPath } from 'node:url';
import { buildModule, stringTableJs } from './pipeline.js';
import { decode } from './dis16.js';
import { fmt, g, repr, dumps, loads, Counter, split, strip } from './py.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ------------------------------------------------------------------ unit checks (no original bytes needed)
assert.equal(fmt('%05X  %-6s|%d %x %04X %%', 0x40, 'ab', -3, 255, 10), '00040  ab    |-3 ff 000A %');
assert.equal(g(0.5, 7), '0.5');
assert.equal(g(2 ** -11, 7), '0.0004882812');              // exact tie 4.8828125e-4 rounds half to even (C printf)
assert.equal(g(1234567.5, 7), '1234568');
assert.equal(g(12345678, 7), '1.234568e+07');
assert.equal(g(-0.00001, 7), '-1e-05');
assert.equal(repr(['cmp', "it's", 'a\\b']), `('cmp', "it's", 'a\\\\b')`);
assert.equal(repr(null), 'None');
assert.equal(dumps(['aé', 1]), '["a\\u00e9", 1]');
assert.equal(dumps(new Map([['9588', 1], ['3B24', 2]]), { sep: ',', kv: ':' }), '{"9588":1,"3B24":2}');
assert.deepEqual([...loads('{"3B24": "x", "9588": "y"}').keys()], ['3B24', '9588']);   // source order kept
const c = new Counter(); c.inc('N'); c.inc('S'); c.inc('S'); c.inc('I');
assert.deepEqual(c.most_common(), [['S', 2], ['N', 1], ['I', 1]]);
assert.deepEqual(split('  a b\x1c c '), ['a', 'b', 'c']);
assert.equal(strip('\x85 x \xa0'), 'x');
const dis = (hex, at = 0x100) => {
  const b = Uint8Array.from(hex.split(' ').map((h) => parseInt(h, 16)));
  const code = new Uint8Array(at + b.length); code.set(b, at);
  const r = decode(code, at, code.length);
  return r && (r.mnemonic + ' ' + r.opStr).trim();
};
assert.equal(dis('83 c3 ba'), 'add bx, -0x46');
assert.equal(dis('81 c6 34 12'), 'add si, 0x1234');
assert.equal(dis('89 5e fa'), 'mov word ptr [bp - 6], bx');
assert.equal(dis('c7 85 ca bb 01 00'), 'mov word ptr [di - 0x4436], 1');
assert.equal(dis('a3 3c 8c'), 'mov word ptr [0x8c3c], ax');
assert.equal(dis('87 f2'), 'xchg dx, si');
assert.equal(dis('d1 e6'), 'shl si, 1');
assert.equal(dis('f7 2e 70 ae'), 'imul word ptr [0xae70]');
assert.equal(dis('e8 00 80', 0x8000), 'call 3');               // next + rel, no 16-bit wrap; <= 9 prints decimal
assert.equal(dis('e8 00 70', 0x9000), 'call 0x10003');
assert.equal(dis('e8 00 80', 0x1000), 'call 0xffff9003');
assert.equal(dis('74 fd', 0), 'je 0xffffffff');
assert.equal(dis('83 cb dd'), 'or bx, 0xffdd');                // logical ops print the sign-extended imm8 unsigned
assert.equal(dis('98'), 'cwde');                               // capstone 16-bit quirk (cbw)
assert.equal(dis('ff ff'), null);                              // FF /7 invalid -> qbdis prints db
assert.equal(dis('e8 00'), null);                              // truncated
assert.throws(() => dis('f3 a4'));                             // prefixes are not supported (loud, not a guess)
// capstone reference corpus (tools/byoc/dis16_corpus.py): synthetic encodings over the whole one-byte map
const NOSUP = new Set([0x0f, 0x26, 0x2e, 0x36, 0x3e, 0x62, 0x64, 0x65, 0x66, 0x67, 0xc4, 0xc5, 0xc6, 0xc7, 0xd8, 0xd9, 0xda, 0xdb, 0xdc, 0xdd, 0xde, 0xdf, 0xf0, 0xf2, 0xf3]);
let corpusOk = 0, corpusThrow = 0;
for (const [hex, at, size, mn, ops] of JSON.parse(rd('game/byoc/dis16.capstone.json'))) {
  const b = Uint8Array.from(hex.match(/../g).map((h) => parseInt(h, 16)));
  const code = new Uint8Array(at + b.length); code.set(b, at);
  let r;
  try { r = decode(code, at, code.length); } catch (e) {
    assert.ok(NOSUP.has(b[0]), `dis16 threw on ${hex}: ${e.message}`); corpusThrow++; continue;
  }
  assert.deepEqual(r && [r.size, r.mnemonic, r.opStr], size === undefined ? null : [size, mn, ops], `dis16 vs capstone on ${hex} at ${at.toString(16)}`);
  corpusOk++;
}
console.log(`byoc unit checks: OK (dis16 = capstone on ${corpusOk} corpus encodings, ${corpusThrow} unsupported forms rejected)`);

// ------------------------------------------------------------------ pipeline equivalence on the originals
const cfg = JSON.parse(rd('game/byoc/modules.json'));
const ORIG = process.env.SC_ORIGINALS || cfg.originals_default;
if (!fs.existsSync(path.join(ORIG, 'SPACE.EXE'))) {
  console.log(`byoc equivalence: SKIPPED - the original game files are not at ${ORIG} (set SC_ORIGINALS to the starcoma folder)`);
  process.exit(0);
}
const files = new Map(fs.readdirSync(ORIG).filter((n) => fs.statSync(path.join(ORIG, n)).isFile())
  .map((n) => [n.toUpperCase(), new Uint8Array(fs.readFileSync(path.join(ORIG, n)))]));
const common = {
  files, cfg,
  rtNames: JSON.parse(rd('decode/brun30/rt_names.json')),
  inlineArgs: JSON.parse(rd('decode/brun30/inline_args.json')),
  sprites: rd('decode/data/sprites_index.tsv'),
};
const seen = new Set(); const bad = [];
const same = (rel, got) => {
  if (seen.has(rel)) return;     // PLBATTLE/SPBATTLE write the same space/banks.js as SPACE
  seen.add(rel);
  const exp = fs.readFileSync(path.join(ROOT, rel));
  const gb = Buffer.from(got, 'utf8');
  if (exp.equals(gb)) return;
  const A = exp.toString('utf8').split('\n'), B = got.split('\n');
  const i = A.findIndex((l, k) => l !== B[k]);
  bad.push(`${rel}: first difference at line ${i + 1}\n    repo: ${(A[i] ?? '<eof>').slice(0, 160)}\n    js:   ${(B[i] ?? '<eof>').slice(0, 160)}`);
};
const t0 = Date.now();
for (const mod of Object.keys(cfg.modules)) {
  const mc = cfg.modules[mod];
  const r = buildModule(mod, {
    ...common, exe: files.get(mod + '.EXE'),
    names: mc.qb2bas ? rd(`decode/pseudo/${mod}_names.json`) : null,
    header: mc.qb2bas ? rd(`decode/pseudo/${mod}_header.md`) : null,
  });
  same(`decode/listings/${mod}.lst`, r.listing);
  seen.add(`decode/data/tools/_${mod}.json`);
  const ej = JSON.parse(rd(`decode/data/tools/_${mod}.json`)), gj = JSON.parse(JSON.stringify(r.consts));
  if (!util.isDeepStrictEqual(ej, gj)) bad.push(`decode/data/tools/_${mod}.json: constant table differs`);
  if (r.basmd !== null) same(`decode/pseudo/${mod}.bas.md`, r.basmd);
  if (r.js !== null) same(mc.bas2js.out, r.js);
  if (r.banks !== null && mc.bas2js.banks_out) same(mc.bas2js.banks_out, r.banks);
}
{ const st = stringTableJs(cfg, files); same(st.path, st.js); }   // startup.js game text (STARCOMM/STARTUP)
const dt = Date.now() - t0;
if (bad.length) { console.log(bad.join('\n')); }
assert.equal(bad.length, 0, `${bad.length} of ${seen.size} generated files differ from the committed ones`);
console.log(`byoc equivalence: ${seen.size} files byte-identical (7 modules, ${dt} ms)`);
