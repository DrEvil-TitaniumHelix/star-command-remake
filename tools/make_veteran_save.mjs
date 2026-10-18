// make_veteran_save.mjs — builds game/assets/saves/veteran/{CHARINFO.BAS, CHARNAME, README.md} (lane testsave).
//
//   node tools/make_veteran_save.mjs            (no browser, no server; deterministic)
//
// The recipe itself is game/byoc/convert/veteran.js (lane byoc-assets: the BYOC importer runs the same code in its
// worker against the player's converted tables). This wrapper feeds it the shipped blank CHARINFO.BAS, INFO.json,
// the NAME fields and MISSION.json from game/assets and writes the three files.
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Files } from '../game/engine/files.js';
import { Data } from '../game/engine/data.js';
import { buildVeteran } from '../game/byoc/convert/veteran.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const OUT = here('../game/assets/saves/veteran/');
const files = new Files({ baseDir: here('../game/assets/files').replace(/[\/]$/, ''), storage: null });
const gmap = JSON.parse(readFileSync(here('../game/assets/gmap.json'), 'utf8'));
const data = new Data(files);
const v = await buildVeteran({
  blank: await files.read('CHARINFO.BAS'),
  info: (await data.table('INFO')).values,
  names: await data.nameFields(),
  mission: (await data.table('MISSION')).records,
  gmap,
});
mkdirSync(OUT, { recursive: true });
writeFileSync(OUT + 'CHARINFO.BAS', v.charinfo);
writeFileSync(OUT + 'CHARNAME', v.charname);
writeFileSync(OUT + 'README.md', v.readme);
console.log(`wrote ${OUT}: ${v.summary[0]}`);
for (const line of v.summary.slice(1)) console.log(line);
