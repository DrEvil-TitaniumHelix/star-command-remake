// sprites_index.mjs — decode/data/sprites_index.tsv -> game/byoc/convert/sprites_index.json (lane byoc-assets).
//
//   node tools/byoc/sprites_index.mjs [--check]
//
// The tsv is own analysis (bank names, BSAVE header values, GET-array sizes and offsets, no pixel data); the JSON is
// the same rows in the shape the browser converter reads (tools/build_atlas.py parse_arrays). --check exits 1 when
// the committed JSON is out of date.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const TSV = here('../../decode/data/sprites_index.tsv');
const OUT = here('../../game/byoc/convert/sprites_index.json');

const banks = [];
for (const line of readFileSync(TSV, 'utf8').split('\n')) {
  const c = line.replace(/\r$/, '').split('\t');
  if (c.length < 7 || (c[5] !== 'cga' && c[5] !== 'ega')) continue;
  const arrays = [];
  for (let part of c[6].split(';')) {
    part = part.trim();
    if (!part) continue;
    const [idx, rest] = [part.slice(0, part.indexOf(':')), part.slice(part.indexOf(':') + 1)];
    const [size, off] = rest.split('@');
    const [w, h] = size.split('x');
    arrays.push([+idx, +w, +h, parseInt(off.split('(')[0], 10)]);   // "7(short4)" -> 7, as parse_arrays
  }
  banks.push({ file: c[0], bytes: +c[1], seg: +c[2], off: +c[3], len: +c[4], mode: c[5], arrays });
}
const text = `{"source":"tools/byoc/sprites_index.mjs from decode/data/sprites_index.tsv","banks":[\n${banks.map((b) => JSON.stringify(b)).join(',\n')}\n]}\n`;
if (process.argv.includes('--check')) {
  const ok = readFileSync(OUT, 'utf8') === text;
  console.log(ok ? 'sprites_index.json up to date' : 'sprites_index.json OUT OF DATE: run node tools/byoc/sprites_index.mjs');
  process.exit(ok ? 0 : 1);
}
writeFileSync(OUT, text);
console.log(`${banks.length} banks, ${banks.reduce((n, b) => n + b.arrays.length, 0)} arrays -> ${OUT}`);
