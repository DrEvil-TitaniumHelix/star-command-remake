// engine.js — boots the engine and hands modules one object with the BASIC-statement API (README.md).
//
//   const E = await boot(canvas);
//   E.screen(1); E.fb.modulePalette('STARTUP');               SCREEN 1 / PALETTE 1,9: PALETTE 2,4
//   E.text.locate(5, 2); E.text.print('Version 1.0');        LOCATE 5,2: PRINT "Version 1.0"
//   E.gfx.line(0, 1, 319, 198, -1, 'B');                     LINE (0,1)-(319,198),,B
//   E.sprites.put(120, 7, { bank: 'LOGO.BAS', index: 0 }, PSET)   PUT (120,7), Logo, PSET
//   const k = await E.input.key();                           waiting INKEY$
//   E.audio.play('MBT126'); E.timer.now(); await E.state.load(); E.chain('STARPORT')

import { Framebuffer, Display, EGA_RGB } from './display.js';
import { Gfx } from './gfx.js';
import { Text } from './text.js';
import { Atlas, Sprites } from './sprites.js';
import { Input } from './input.js';
import { Files } from './files.js';
import { State } from './state.js';
import { Data } from './data.js';
import { Audio } from './audio.js';
import { Timer } from './timer.js';
import { chain, run } from './chain.js';
import { attachPointer } from './pointer.js';
import { installEscape } from './overlay.js';
import { Settings } from './settings.js';
import { installHelp } from './help.js';
import { installZoom } from './zoom.js';
import { installTooltips } from './tooltip.js';
import { installCombat } from './combat.js';
import { installSpeed } from './speed.js';
import { installMarker } from './marker.js';
import { installManual } from './manual.js';

export async function loadJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.json();
}

// assets: base URL of atlas, files/, data/, saves/ (default the shipped game/assets/; BYOC: index.html ?assets=opfs)
// options: { protection: false } - true = show STARPORT's rule-book challenge (index.html ?protection=1, v1.1);
// { classic: true } = every post-v1 addition off (index.html ?classic=1, settings.js)
export async function boot(canvas, { assets = 'assets/', options = {} } = {}) {
  const [atlas, font, gmap] = await Promise.all([
    Atlas.load(assets), loadJSON(`${assets}font8x8.json`), loadJSON(`${assets}gmap.json`)]);
  const fb = new Framebuffer(atlas.scale);
  const display = new Display(canvas, fb);
  const input = new Input();
  input.attach(window);
  display.frameHooks.push((t) => input.pollGamepads(t));
  // the gamepad menu highlight marks game content, so it follows the v1.2 zoom view (screen-space UI does not)
  display.overlays.push((ctx) => {
    const v = display.view;
    if (v.scale === 1) { input.overlay(ctx); return; }
    ctx.save(); ctx.scale(v.scale, v.scale); ctx.translate(-v.ox * 2, -v.oy * 2); input.overlay(ctx); ctx.restore();
  });
  const text = new Text(fb, font);
  input.text = text;
  display.overlays.push((ctx) => text.drawCursor(ctx, EGA_RGB[fb.attr2ega[text.fgAttr]]));
  const files = new Files({ base: `${assets}files/` });
  const E = {
    fb, display, gfx: new Gfx(fb), text, sprites: new Sprites(fb, atlas), atlas, input,
    files, state: new State(files, gmap), data: new Data(files, { base: `${assets}data/` }),
    audio: new Audio(), timer: null, chain, options: { protection: false, ...options },
    settings: new Settings({ classic: !!options.classic }),   // v1.2/v1.3 per-feature switches + Classic mode
    assets,   // assetsBase: 'assets/' or the BYOC store (byoc/import/opfs.js OPFS_PREFIX)
  };
  E.timer = new Timer(() => E.state.G[86]);   // delay loops count against the save's StdDelay!
  // SCREEN n resets text colours and the graphics cursor as well
  E.screen = (mode) => { fb.screen(mode); text.resetColors(); text.row = 1; text.col = 1; E.gfx.lastX = 160; E.gfx.lastY = 100; };
  display.screen = E.screen;
  E.run = (module, opts) => run(E, module, opts);
  attachPointer(E, canvas);   // v1.1 mouse on hotkeys
  installEscape(E);           // v1.1 Esc overlay
  installHelp(E);             // v1.2 control overlay (F1 / pad Back)
  installZoom(E, canvas);     // v1.2 map zoom
  installTooltips(E, canvas); // v1.2 item tooltips
  installCombat(E, canvas);   // v1.3 enemy tooltips, range overlay, hit-chance preview
  installSpeed(E);            // v1.3 speed toggle (after installEscape: delays keep its pause gate)
  installMarker(E);           // v1.3 mission-target marker
  await installManual(E, { url: `${assets}data/manual.json` });   // v1.3 manual on demand
  return E;
}
