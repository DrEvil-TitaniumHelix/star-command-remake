// code.js — tier 3 of the BYOC conversion in the importer (docs/BYOC.md 3.4): the generated module JS from the
// player's EXEs, by calling lane byoc-b3's pipeline (../pipeline.js buildModule; not edited here) with our
// annotations (./annotations.json, tools/byoc/annotations.mjs) and the module options (../modules.json).
// Output paths mirror game/: `modules/space.js`, `modules/starport/flow.js`, `modules/space/banks.js` ...
// (modules.json bas2js `out` / `banks_out` and `strings.out` = modules/startup/strings.js, without the leading `game/`).
// The listing and .bas.md are not stored.

import { buildModule, stringTableJs } from '../pipeline.js';

const enc = (s) => new TextEncoder().encode(s);
const storePath = (p) => p.replace(/^game\//, '');

// files: Map NAME -> Uint8Array (the validated originals); cfg = modules.json; ann = annotations.json
export function* buildCode(files, cfg, ann) {
  const done = new Set();
  for (const [mod, mc] of Object.entries(cfg.modules)) {
    if (!mc.bas2js) continue;   // STARCOMM / STARTUP: hand-written game/modules/startup.js
    const r = buildModule(mod, {
      exe: files.get(`${mod}.EXE`), files, cfg, rtNames: ann.rtNames, inlineArgs: ann.inlineArgs, sprites: ann.sprites,
      names: ann.modules[mod].names, header: ann.modules[mod].header,
    });
    for (const [out, text] of [[mc.bas2js.out, r.js], [mc.bas2js.banks_out, r.banks]]) {
      if (!out || text === null || done.has(out)) continue;   // PLBATTLE / SPBATTLE write SPACE's banks.js again
      done.add(out);
      yield { path: storePath(out), bytes: enc(text), module: mod };
    }
  }
  if (cfg.strings) {   // STARCOMM / STARTUP game text for the hand-written startup.js (modules.json "strings")
    const t = stringTableJs(cfg, files);
    yield { path: storePath(t.path), bytes: enc(t.js), module: cfg.strings.modules.join('+') };
  }
}

// the store paths tier 3 writes (for the service worker / tests), from modules.json alone
export const codePaths = (cfg) => [...new Set([...Object.values(cfg.modules).flatMap((mc) => (mc.bas2js ? [mc.bas2js.out, mc.bas2js.banks_out] : [])), cfg.strings?.out].filter(Boolean).map(storePath))];
