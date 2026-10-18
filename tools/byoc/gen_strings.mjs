// gen_strings.mjs — write game/modules/startup/strings.js from the original STARCOMM.EXE / STARTUP.EXE (lane byoc-b3).
// Usage (repo root): node tools/byoc/gen_strings.mjs [ORIGINALS_DIR]   (default: game/byoc/modules.json originals_default)
import fs from 'node:fs';
import path from 'node:path';
import { stringTableJs } from '../../game/byoc/pipeline.js';
const cfg = JSON.parse(fs.readFileSync('game/byoc/modules.json', 'utf8'));
const dir = process.argv[2] || cfg.originals_default;
const files = new Map(cfg.strings.modules.map((m) => [m + '.EXE', new Uint8Array(fs.readFileSync(path.join(dir, m + '.EXE')))]));
const r = stringTableJs(cfg, files);
fs.writeFileSync(r.path, r.js);
console.log('wrote', r.path, r.js.split('\n').length, 'lines');
