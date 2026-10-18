// index.js — the BYOC conversion recipe (lane byoc-assets, docs/BYOC.md 3.2/3.3): the player's original files ->
// the asset tree the engine reads (same layout as game/assets/):
//   files/<NAME>            byte copies (tier 1, ./data.js)          data/<STEM>.json   decoded tables (./data.js)
//   data/items.json         tooltip records (./items.js)              atlas.png, atlas.json   sprites (tier 2, ./atlas.js)
//   saves/veteran/CHARINFO.BAS, CHARNAME   the Veteran Crew save (./veteran.js)
//   modules/<generated>.js  the module JS (tier 3, ./code.js -> lane byoc-b3's pipeline), when `code` is given
// Not produced: data/manual.json (the manual is not in the game folder, docs/BYOC.md 3.2), gmap.json and font8x8.json
// (own work, shipped with the engine), game/modules/startup.js (hand-written; its text = modules/startup/strings.js).
//
//   for await (const { path, bytes } of convertAll(read, { deflate, gmap, code: { files, cfg, ann } })) ...
//   read(NAME) -> Uint8Array; files = Map NAME -> bytes; cfg = game/byoc/modules.json; ann = ./annotations.json

import { convertData } from './data.js';
import { itemsJson } from './items.js';
import { buildAtlas } from './atlas.js';
import { buildVeteran } from './veteran.js';
import { buildCode } from './code.js';

export { RECIPE_VERSION } from './version.js';

export const STEPS = 5;   // progress: data, items, atlas, veteran, module code

export async function* convertAll(read, { deflate, gmap, code = null, onStep = () => {} }) {
  onStep(0, 'data files and tables');
  const tables = {};
  for (const out of convertData(read)) {
    if (out.table) tables[out.table.source] = out.table;
    yield out;
  }
  onStep(1, 'item tooltips');
  yield { path: 'data/items.json', bytes: itemsJson(tables['INFO.BAS'].values, tables.NAME.fields) };
  onStep(2, 'sprite atlas');
  yield* await buildAtlas(read, deflate);
  onStep(3, 'veteran crew save');
  const v = await buildVeteran({ blank: read('CHARINFO.BAS'), info: tables['INFO.BAS'].values, names: tables.NAME.fields, mission: tables.MISSION.records, gmap });
  yield { path: 'saves/veteran/CHARINFO.BAS', bytes: v.charinfo };
  yield { path: 'saves/veteran/CHARNAME', bytes: v.charname };
  if (code) {
    onStep(4, 'module code');
    yield* buildCode(code.files, code.cfg, code.ann);
  }
  onStep(STEPS, 'done');
}
