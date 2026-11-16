import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const at = (rel) => new URL(rel, new URL('../modules/starport.js', import.meta.url)).href;
const src = readFileSync(new URL('../modules/starport.js', import.meta.url), 'utf8')
  .replace("import { flow } from './starport/flow.js';", 'const flow = (rt) => rt;')
  .replace(/from '(\.[^']+)'/g, (_, rel) => `from '${at(rel)}'`);
const { default: starport } = await import('data:text/javascript,' + encodeURIComponent(src));
const rt = await starport({}, {});

const next = (s) => Number((BigInt(s) * 0x343FDn + 0x1A9EC3n) % 0x1000000n);
let s = 5;
for (let i = 0; i < 1000; i++) { s = next(s); assert.equal(rt.rnd(), s / 0x1000000, `value ${i + 1} after start`); }

rt.rndSeed = 5; rt.randomize(1);
assert.equal(rt.rndSeed, 0x810005);
rt.rndSeed = 5; rt.randomize(4321.25);
assert.equal(rt.rndSeed, 0x870705);

const seen = new Set();
for (let i = 0; i < 100000; i++) { rt.rnd(); assert.ok(!seen.has(rt.rndSeed), `the sequence repeats after ${i} values`); seen.add(rt.rndSeed); }
console.log('starport rnd: BRUN30 sequence from the start seed, RANDOMIZE mixes the value bytes into the seed, no repeat in 100000 values');
