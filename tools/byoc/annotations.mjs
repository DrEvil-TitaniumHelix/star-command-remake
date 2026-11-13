import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const rd = (p) => readFileSync(here(`../../${p}`), 'utf8');
const OUT = here('../../game/byoc/convert/annotations.json');
const cfg = JSON.parse(rd('game/byoc/modules.json'));
const modules = {};
for (const [mod, mc] of Object.entries(cfg.modules)) {
  if (mc.qb2bas) modules[mod] = { names: rd(`decode/pseudo/${mod}_names.json`), header: rd(`decode/pseudo/${mod}_header.md`) };
}
const bundle = {
  source: 'tools/byoc/annotations.mjs from decode/brun30/{rt_names,inline_args}.json, decode/data/sprites_index.tsv, decode/pseudo/<MOD>_{names.json,header.md}',
  rtNames: JSON.parse(rd('decode/brun30/rt_names.json')),
  inlineArgs: JSON.parse(rd('decode/brun30/inline_args.json')),
  sprites: rd('decode/data/sprites_index.tsv'),
  modules,
};
const text = `${JSON.stringify(bundle)}\n`;
if (process.argv.includes('--check')) {
  let ok = false;
  try { ok = readFileSync(OUT, 'utf8') === text; } catch {   }
  console.log(ok ? 'annotations.json up to date' : 'annotations.json OUT OF DATE: run node tools/byoc/annotations.mjs');
  process.exit(ok ? 0 : 1);
}
writeFileSync(OUT, text);
console.log(`${Object.keys(modules).length} modules, ${text.length} bytes -> ${OUT}`);
