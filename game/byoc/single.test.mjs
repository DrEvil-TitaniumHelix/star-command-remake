import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bas2js, moduleOptions } from './bas2js.js';

const cfg = JSON.parse(readFileSync(new URL('./modules.json', import.meta.url)));
const text = '## Pseudocode\n```basic\n00040  B! = INT(E! * 0.7 + 0.6)\n00050  K$ = K$ + "x"\n00060  C! = E! / 3 - E! ^ 0.5\n00100  RETURN\n```\n';
const k = { data: [], common_start: 0, common_len: 0 };
const fr = Math.fround;
const fixtures = [];
for (const mod of ['PLBATTLE', 'STARPORT']) {
  const opt = moduleOptions(cfg, mod), js = bas2js(mod, opt, text, new Map(), k).js;
  const code = js.split('\n').filter((l) => !l.trim().startsWith('//') && /V(\.[BKC]\w* |\["[BKC][!$]"\] )= /.test(l)).join('\n');
  const run = new Function('fr', 'V', code);
  const key = (n, suffix) => (mod === 'STARPORT' ? n + (suffix === '$' ? '_s' : '') : n + suffix);
  for (let x = 0; x <= 400; x++) {
    const V = { [key('E', '!')]: x, [key('K', '$')]: 'ab' };
    run(fr, V);
    assert.equal(V[key('B', '!')], Math.floor(fr(fr(x * fr(0.7)) + fr(0.6))), `${mod} INT(${x} * 0.7 + 0.6)`);
    assert.equal(V[key('K', '$')], 'abx', mod);
    assert.equal(V[key('C', '!')], fr(fr(x / 3) - fr(Math.pow(x, fr(0.5)))), `${mod} ${x} / 3 - ${x} ^ 0.5`);
  }
  const V = { [key('E', '!')]: 12, [key('K', '$')]: '' };
  run(fr, V);
  assert.equal(V[key('B', '!')], 9, mod);
  fixtures.push({ mod, opt, text, js });
}
const py = 'import json,runpy,sys\nm=runpy.run_path(sys.argv[1])\nr=[m["translate"](f["mod"],f["opt"],f["text"],{}, {"data":[],"common_start":0,"common_len":0},"", ".")["js"] for f in json.load(sys.stdin)]\nprint(json.dumps(r))';
const twin = JSON.parse(execFileSync('python', ['-I', '-c', py, fileURLToPath(new URL('../../tools/byoc/bas2js.py', import.meta.url))], { input: JSON.stringify(fixtures), encoding: 'utf8' }));
assert.deepEqual(twin, fixtures.map((f) => f.js));
console.log('single precision: every + - * / ^ and fractional constant is rounded to single in both back ends; string + stays a concatenation; Python and JS translations match');
