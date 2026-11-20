export const MODULE_FILES = {
  STARCOMM: 'startup', STARTUP: 'startup', STARPORT: 'starport', SPACE: 'space',
  INSIDE: 'inside', SPBATTLE: 'spbattle', PLBATTLE: 'plbattle',
};

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
    if (!(result instanceof ChainSignal)) {
      if (!E.afterEnd) return result;
      try { await E.afterEnd(mod); return result; } catch (e) { if (!(e instanceof ChainSignal)) throw e; result = e; }
    }
    if (['PLBATTLE','SPBATTLE'].includes(mod) && E.timer && E.text?.screenText?.().some((r) => r.includes('BATTLE REPORT'))) {
      const t0 = E.timer.clock(), end = t0 + 1000 * E.timer.delaySeconds(22 * (E.state.G[88] || E.timer.stdDelay));
      try {
        for (;;) { const t = E.timer.clock(); if (t >= end) break; if (t - t0 < 700) E.input.flush?.(); else if (E.input.inkey?.()) break; await E.timer.frame(); }
      } catch (e) {
        if (!(e instanceof ChainSignal)) throw e;
        result = e;
      }
    }
    mod = result.module;
    opts = result.opts;
    E.input.clearMenu?.();
  }
}
