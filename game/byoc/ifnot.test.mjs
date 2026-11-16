import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bas2js, moduleOptions } from './bas2js.js';
import { cint } from '../engine/basic.js';

const cfg = JSON.parse(readFileSync(new URL('./modules.json', import.meta.url)));
const text = '## Pseudocode\n```basic\n00040  IF NOT (CINT(A!) AND CINT(B!)) THEN GOTO L_0060\n00050  IF NOT (A! = 1) AND CINT(B!) THEN GOTO L_0060\nL_0060:\n00060  A! = NOT (CINT(A!))\n00100  RETURN\n```\n';
const k = { data: [], common_start: 0, common_len: 0 };
const B = (c) => (c ? -1 : 0), AND = (a, b) => cint(a) & cint(b), NOT = (a) => ~cint(a), eq = (a, b) => B(a === b), fr = Math.fround;
const fixtures = [];
for (const mod of ['PLBATTLE', 'STARPORT']) {
  const opt = moduleOptions(cfg, mod), js = bas2js(mod, opt, text, new Map(), k).js;
  const ifs = js.split('\n').filter((l) => l.includes('pc = 0x0060')).map((l) => /if \((.*)\) \{ pc = 0x0060/.exec(l)[1]);
  assert.equal(ifs.length, 2, mod);
  const [whole, part] = ifs.map((c) => new Function('cint', 'B', 'AND', 'NOT', 'eq', 'V', `return !!(${c});`));
  for (const a of [-1, 0, 1, 2]) for (const b of [-1, 0, 1, 3]) {
    const V = { A: a, B: b, 'A!': a, 'B!': b };
    assert.equal(whole(cint, B, AND, NOT, eq, V), (a & b) === 0, `${mod} IF NOT (${a} AND ${b})`);
    assert.equal(part(cint, B, AND, NOT, eq, V), (~B(a === 1) & b) !== 0, `${mod} IF NOT (${a} = 1) AND ${b}`);
  }
  const set = js.split('\n').find((l) => !l.trim().startsWith('//') && /V(\.A|\["A!"\]) = /.test(l));
  const V = { A: 1, 'A!': 1 };
  new Function('cint', 'NOT', 'fr', 'V', set)(cint, NOT, fr, V);
  assert.equal(V.A === 1 ? V['A!'] : V.A, -2, mod);
  fixtures.push({ mod, opt, text, js });
}
const py = 'import json,runpy,sys\nm=runpy.run_path(sys.argv[1])\nr=[m["translate"](f["mod"],f["opt"],f["text"],{}, {"data":[],"common_start":0,"common_len":0},"", ".")["js"] for f in json.load(sys.stdin)]\nprint(json.dumps(r))';
const twin = JSON.parse(execFileSync('python', ['-I', '-c', py, fileURLToPath(new URL('../../tools/byoc/bas2js.py', import.meta.url))], { input: JSON.stringify(fixtures), encoding: 'utf8' }));
assert.deepEqual(twin, fixtures.map((f) => f.js));
console.log('if not: a whole-condition NOT jumps only on zero in both back ends; a NOT used as a number stays a complement; Python and JS translations match');
