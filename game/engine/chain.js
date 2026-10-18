// chain.js — CHAIN / RUN between modules with the COMMON state (E.state) intact (CROSSREF.md §1).
//
//   E.chain('STARPORT')      CHAIN "STARPORT.STR" / "STARPORT.EXE" / RUN ... (extension and drive ignored)
//
// chain() throws a ChainSignal that unwinds the running module; E.run() catches it and starts the target
// module's file `modules/<file>.js` (default export `async (E, opts)`). A module may also `return E.chain(..)`.
// .STR stubs are not built (hard-disk configuration, Foreman decision 2026-10-15): "X.STR" goes straight to X.
// Session state that survives CHAIN lives on the shared engine objects, never in the save: E.state (COMMON),
// E.memRegions / E.commonScalars (COMMON memory), and E.fb.ega7Seen (SC-2 addendum: after the first SCREEN 7
// module the original shows SCREEN 1 at high intensity for the rest of the session). run() never recreates
// E.fb, so that palette state carries across every CHAIN; a fresh start (page load) begins with it false.

export const MODULE_FILES = {
  STARCOMM: 'startup', STARTUP: 'startup', STARPORT: 'starport', SPACE: 'space',
  INSIDE: 'inside', SPBATTLE: 'spbattle', PLBATTLE: 'plbattle',
};

// screen id prefix -> module (SCREENS_INDEX.md conventions)
export const SCREEN_MODULE = { CM: 'STARCOMM', SU: 'STARTUP', PT: 'STARPORT', SP: 'SPACE', IN: 'INSIDE', SB: 'SPBATTLE', PB: 'PLBATTLE' };

export class ChainSignal extends Error {
  constructor(module, opts = {}) { super(`CHAIN ${module}`); this.module = module; this.opts = opts; }
}

export const moduleName = (name) => String(name).toUpperCase().replace(/^[A-Z]:/, '').replace(/\.(STR|EXE|BAS)$/, '');

export function chain(name, opts = {}) {
  const mod = moduleName(name);
  if (!MODULE_FILES[mod]) throw new Error(`CHAIN: unknown module ${name}`);
  throw new ChainSignal(mod, opts);
}

// Run modules until one returns without chaining. `loader(file)` imports `modules/<file>.js`.
export async function run(E, module, opts = {}, loader = (f) => import(`../modules/${f}.js`)) {
  let mod = moduleName(module);
  for (;;) {
    E.currentModule = mod;
    const m = await loader(MODULE_FILES[mod]);
    const fn = m.default ?? m.run;
    let result;
    try {
      result = await fn(E, { ...opts, module: mod });
    } catch (e) {
      if (!(e instanceof ChainSignal)) throw e;
      result = e;
    }
    if (!(result instanceof ChainSignal)) return result;
    mod = result.module;
    opts = result.opts;
    E.input.clearMenu?.();
  }
}
