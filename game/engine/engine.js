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

export async function boot(canvas, { assets = 'assets/', options = {}, storage } = {}) {
  const [atlas, font, gmap] = await Promise.all([
    Atlas.load(assets), loadJSON(`${assets}font8x8.json`), loadJSON(`${assets}gmap.json`)]);
  const fb = new Framebuffer(atlas.scale);
  const display = new Display(canvas, fb);
  const input = new Input();
  input.attach(window);
  display.frameHooks.push((t) => input.pollGamepads(t));
  display.overlays.push((ctx) => input.overlay(ctx));
  const text = new Text(fb, font);
  input.text = text;
  display.overlays.push((ctx) => text.drawCursor(ctx, EGA_RGB[fb.attr2ega[text.fgAttr]]));
  const files = new Files({ base: `${assets}files/`, storage });
  const E = {
    fb, display, gfx: new Gfx(fb), text, sprites: new Sprites(fb, atlas), atlas, input,
    files, state: new State(files, gmap), data: new Data(files, { base: `${assets}data/` }),
    timer: null, chain, options: { protection: false, ...options },
    settings: new Settings(),
    assets,
  };
  E.audio = new Audio(E.settings);
  E.timer = new Timer(() => E.state.G[86]);
  E.screen = (mode) => { fb.screen(mode); text.resetColors(); text.row = 1; text.col = 1; E.gfx.lastX = 160; E.gfx.lastY = 100; };
  display.screen = E.screen;
  E.run = (module, opts) => run(E, module, opts);
  attachPointer(E, canvas);
  installEscape(E);
  installHelp(E);
  installTooltips(E, canvas);
  installCombat(E, canvas);
  installSpeed(E);
  installMarker(E);
  await installManual(E, { url: `${assets}data/manual.json` });
  return E;
}
