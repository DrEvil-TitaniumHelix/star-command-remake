import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { InputReader, convertText, convertData } from './convert/data.js';
import { TEXT } from './convert/lists.js';
import { bas2js, moduleOptions } from './bas2js.js';
import { buildCode } from './convert/code.js';

const bytes = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const source = '\r\nEmpty Coridor\r\ncoridor CORIDOR\r\nCorridor corridors Coridora\r\nInacessable Diety\r\n\xe9\r\n\x1a';
const expected = ['', 'Empty Corridor', 'corridor CORRIDOR', 'Corridor corridors Coridora', 'Inacessable Diety', '\xe9'];
for (let i = 1; i <= 7; i++) assert.deepEqual(convertText(`MES-${i}`, bytes(source)).lines, expected);
assert.equal(expected[1].length, 14);
assert.deepEqual(convertText('NAME', bytes('"Coridor",coridor,CORIDOR,\x1a')).fields, ['Corridor', 'corridor', 'CORRIDOR']);
assert.deepEqual(convertText('CHARNAME', bytes('Skum Bucket,Stange,"Coridor",ALGEA,\x1a')).fields, ['Skum Bucket', 'Stange', 'Coridor', 'ALGEA']);
for (const [name, count, key] of [['ENCINFO', 27, 'c'], ['ENCLIST', 3, 'n']]) {
  const nums = Array.from({ length: count }, (_, i) => i - 1);
  assert.deepEqual(convertText(name, bytes('"Coridor",' + nums.join(',') + '\r\n\x1a')).records, [{ name: 'Corridor', [key]: nums }]);
}
const nums = Array.from({ length: 15 }, (_, i) => i);
assert.deepEqual(convertText('MISSION', bytes('"Coridor","coridor",' + nums.join(',') + '\r\n\x1a')).records, [{ text: ['Corridor', 'corridor'], n: nums }]);
const input = bytes(source), copy = input.slice();
const raw = convertData(() => input).next().value;
assert.deepEqual(raw.bytes, bytes(expected.join('\r\n') + '\r\n\x1a'));
assert.deepEqual(input, copy);
assert.deepEqual(convertText('MES-1', raw.bytes).lines, expected);
assert.deepEqual(convertData(() => raw.bytes).next().value.bytes, raw.bytes);
const words = [
  ['sceret', 'secret'], ['existance', 'existence'], ['anomoly', 'anomaly'], ['tounge', 'tongue'],
  ['unweildly', 'unwieldy'], ['speckels', 'speckles'], ['mammilian', 'mammalian'],
  ['manuvering', 'maneuvering'], ['gernade', 'grenade'], ['skum', 'scum'], ['reptillian', 'reptilian'],
  ['antihixotropic', 'antithixotropic'], ['appartly', 'apparently'], ['budies', 'buddies'],
  ['coccoon', 'cocoon'], ['coccoons', 'cocoons'], ['stange', 'strange'], ['conciousness', 'consciousness'],
  ['dectectors', 'detectors'], ['immeadiately', 'immediately'], ['enginless', 'engineless'],
  ['rendevous', 'rendezvous'], ['villans', 'villains'], ['fision', 'fission'], ['algea', 'algae'], ["mens'", "men's"],
];
for (const [a, b] of words) {
  assert.deepEqual(convertText('NAME', bytes(`${a},${a.toUpperCase()},${a}2,x${a},${a}_x`)).fields,
    [b, b.toUpperCase(), `${a}2`, `x${a}`, `${a}_x`]);
}
const rows = [
  [14, 'coccoon-like  ', 'cocoon-like'], [14, 'the makes you ', 'that makes you'],
  [23, 'friends at the bar are appartly ignoring him. ', 'friends at the bar     apparently ignore him.'],
  [23, 'His mutant budies      ', 'His mutant buddies'],
  [23, 'with a reptillian      ', 'with a reptilian'], [23, 'armor. The reptillian  ', 'armor. The reptilian'],
  [23, 'searching secrets an   ', 'searching secretes an'], [23, 'stange looking output  ', 'strange looking output'],
  [23, 'conciousness, your typeis a slightly          ', 'consciousness, your    type is a slightly'],
  [23, 'you face.              ', 'your face.'], [23, 'Radiation dectectors   ', 'Radiation detectors'],
  [23, 'immeadiately begins to ', 'immediately begins to'], [23, 'unweildly to carry.    ', 'unwieldy to carry.'],
  [34, 'drifting enginless around         ', 'drifting engineless around'],
  [34, 'is scheduled to rendevous with.   ', 'is scheduled to rendezvous with.'],
  [34, 'They will both near the first starin sector (27,26).                ', 'They will both be near the first  star in sector (27,26).'],
  [34, 'rendevous point at star 4 in      ', 'rendezvous point at star 4 in'],
  [34, 'rogues and villans, and try to    ', 'rogues and villains, and try to'],
  [34, 'Destroy the nuclear fision controlcomputer. This will start a chain ', 'Destroy the nuclear fission       control computer to start a chain'],
];
for (const [width, a, b] of rows) {
  const result = convertText('MES-1', bytes(a)).lines[0];
  assert.equal(result, b.padEnd(a.length), a);
  assert.equal(result.length % width, 0, a);
  assert.equal(convertText('MES-1', bytes(result)).lines[0], result, a);
}
console.log('spelling: shared text correction, case, boundaries, records, Latin-1, CRLF, EOF and idempotence passed');

const cfg = JSON.parse(readFileSync(new URL('./modules.json', import.meta.url)));
const fixtures = [];
for (const mod of ['SPACE', 'INSIDE', 'PLBATTLE', 'SPBATTLE']) {
  const opt = moduleOptions(cfg, mod), raw = opt.text_fixes.map(([a]) => a);
  const text = '## Pseudocode\n' + raw.map((s, i) => `${(0x40 + i * 16).toString(16).toUpperCase().padStart(5, '0')}  PRINT "${s}"`).join('\n') + '\n00100  RETURN\n';
  const emit = (o) => bas2js(mod, o, text, new Map(), { data: [], common_start: 0, common_len: 0 }).js;
  const run = async (js) => {
    const lines = [], rt = class { print(items) { lines.push(items.join('')); } };
    const code = js.slice(js.indexOf('export class'), js.indexOf('export const DATA')).replace('export class', 'return class');
    const cls = new Function('BasicRT', 'InsideRT', code)(rt, rt);
    await new cls().exec(0x40);
    return lines;
  };
  const js = emit(opt);
  assert.deepEqual(await run(js), opt.text_fixes.map(([, b]) => b), mod);
  assert.deepEqual(await run(emit({ ...opt, text_fixes: [] })), raw, mod);
  fixtures.push({ mod, opt, text, js });
}
const legend = ' Typical Inacessable Defensive Offensive   Area      Area      Area      Area';
const fixed = cfg.modules.PLBATTLE.bas2js.text_fixes.reduce((s, [a, b]) => s.replaceAll(a, b), legend);
assert.equal(fixed.length, legend.length);
assert.equal(fixed.slice(0, 40), 'Typical Inaccessible Defensive Offensive');
assert.equal(fixed.slice(40), legend.slice(40));
console.log('spelling modules: all four class back ends execute configured corrections; disabled options preserve originals; legend stays aligned');

if (process.env.SC_ORIGINALS) {
  const crew = bytes('Skum Bucket,Stange,Algea,Fision,Villans,Coridor,Budies,,,\x1a');
  const read = (n) => (n === 'CHARNAME' ? crew : new Uint8Array(readFileSync(`${process.env.SC_ORIGINALS}/${n}`)));
  const changed = [];
  for (const out of convertData(read)) {
    if (!out.path.startsWith('files/')) continue;
    const name = out.path.slice(6), before = read(name);
    if (!TEXT.includes(name) || name === 'CHARNAME') { assert.deepEqual(out.bytes, before, name); continue; }
    const a = Buffer.from(before).toString('latin1'), b = Buffer.from(out.bytes).toString('latin1');
    assert.doesNotMatch(b, new RegExp('\\b(coridor|' + words.map(([w]) => w).join('|') + ')(?!\\w)', 'i'), name);
    if (a !== b) changed.push(name);
    if (name.startsWith('MES-')) {
      const old = a.split('\r\n'), next = b.split('\r\n');
      assert.equal(next.length, old.length, name);
      old.forEach((s, i) => {
        assert.equal(next[i].length, s.length + (name === 'MES-1' && i === 1 ? 1 : 0), `${name}:${i + 1}`);
      });
    }
    if (name === 'MISSION') {
      const old = new InputReader(before), next = new InputReader(out.bytes);
      while (!old.eof()) {
        for (let i = 0; i < 2; i++) assert.equal(next.str().length, old.str().length);
        for (let i = 0; i < 15; i++) assert.equal(next.num(), old.num());
        old.skipBlankLines(); next.skipBlankLines();
      }
      assert.ok(next.eof());
    }
  }
  assert.deepEqual(changed, ['NAME', 'MISSION', 'MES-1', 'MES-2', 'MES-3', 'MES-4', 'MES-5', 'MES-6', 'MES-7']);
  console.log('spelling originals: listed data misspellings removed; message widths, mission fields, numbers and binaries preserved');
  const ann = JSON.parse(readFileSync(new URL('./convert/annotations.json', import.meta.url)));
  const manifest = JSON.parse(readFileSync(new URL('./import/manifest.json', import.meta.url)));
  const files = new Map(manifest.list.filter((f) => f.required).map((f) => [f.name, read(f.name)]));
  for (const out of buildCode(files, cfg, ann)) {
    if (!cfg.modules[out.module]?.bas2js || out.path.endsWith('banks.js')) continue;
    const js = new TextDecoder().decode(out.bytes).split('\n').filter((s) => !s.trim().startsWith('//')).join('\n');
    for (const [a, b] of cfg.modules[out.module].bas2js.text_fixes) {
      if (a === 'word ptr [0xae70]') continue;
      assert.ok(!js.includes(a), `${out.module}: ${a}`);
      assert.ok(js.includes(b), `${out.module}: ${b}`);
    }
  }
  const py = 'import json,runpy,sys\nm=runpy.run_path(sys.argv[1])\nr=[m["translate"](f["mod"],f["opt"],f["text"],{}, {"data":[],"common_start":0,"common_len":0},"", ".")["js"] for f in json.load(sys.stdin)]\nprint(json.dumps(r))';
  const twin = JSON.parse(execFileSync('python', ['-I', '-c', py, fileURLToPath(new URL('../../tools/byoc/bas2js.py', import.meta.url))], { input: JSON.stringify(fixtures), encoding: 'utf8' }));
  assert.deepEqual(twin, fixtures.map((f) => f.js));
  console.log('spelling pipeline: every configured replacement reaches imported modules; Python and JS class translations match');
}
