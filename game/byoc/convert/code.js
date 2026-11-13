import { buildModule, stringTableJs } from '../pipeline.js';

const enc = (s) => new TextEncoder().encode(s);
const storePath = (p) => p.replace(/^game\//, '');

export function* buildCode(files, cfg, ann) {
  const done = new Set();
  for (const [mod, mc] of Object.entries(cfg.modules)) {
    if (!mc.bas2js) continue;
    const r = buildModule(mod, {
      exe: files.get(`${mod}.EXE`), files, cfg, rtNames: ann.rtNames, inlineArgs: ann.inlineArgs, sprites: ann.sprites,
      names: ann.modules[mod].names, header: ann.modules[mod].header,
    });
    for (const [out, text] of [[mc.bas2js.out, r.js], [mc.bas2js.banks_out, r.banks]]) {
      if (!out || text === null || done.has(out)) continue;
      done.add(out);
      yield { path: storePath(out), bytes: enc(text), module: mod };
    }
  }
  if (cfg.strings) {
    const t = stringTableJs(cfg, files);
    yield { path: storePath(t.path), bytes: enc(t.js), module: cfg.strings.modules.join('+') };
  }
}

export const codePaths = (cfg) => [...new Set([...Object.values(cfg.modules).flatMap((mc) => (mc.bas2js ? [mc.bas2js.out, mc.bas2js.banks_out] : [])), cfg.strings?.out].filter(Boolean).map(storePath))];
