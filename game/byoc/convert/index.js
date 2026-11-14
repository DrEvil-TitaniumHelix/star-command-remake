import { convertData } from './data.js';
import { itemsJson } from './items.js';
import { buildAtlas } from './atlas.js';
import { buildVeteran } from './veteran.js';
import { buildCode } from './code.js';
import { newSave, saveRead } from './saves.js';

export { RECIPE_VERSION } from './version.js';

export const STEPS = 5;

export async function* convertAll(read, { deflate, gmap, code = null, onStep = () => {}, allowNewCrew = false }) {
  read = saveRead(read, gmap, allowNewCrew);
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
  const v = await buildVeteran({ blank: newSave(gmap), info: tables['INFO.BAS'].values, names: tables.NAME.fields, mission: tables.MISSION.records, gmap });
  yield { path: 'saves/veteran/CHARINFO.BAS', bytes: v.charinfo };
  yield { path: 'saves/veteran/CHARNAME', bytes: v.charname };
  if (code) {
    onStep(4, 'module code');
    yield* buildCode(new Map([...code.files.keys()].map((n) => [n, read(n)])), code.cfg, code.ann, code.vers);
  }
  onStep(STEPS, 'done');
}
