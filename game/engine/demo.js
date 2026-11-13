import { OR, AND, PRESET, PSET, XOR, VERBS, verbName } from './sprites.js';

export function drawSU03(E) {
  const { gfx, text, sprites } = E;
  E.screen(1);
  text.color(0, 1);
  E.fb.modulePalette('STARTUP', true);
  gfx.line(0, 1, 319, 198, -1, 'B');
  gfx.line(1, 2, 318, 197, -1, 'B');
  gfx.line(5, 29, 314, 194, -1, 'B');
  gfx.line(6, 30, 313, 193, -1, 'B');
  gfx.line(5, 5, 314, 26, -1, 'BF');
  sprites.put(120, 7, { bank: 'LOGO.BAS', index: 0 }, PSET);
  gfx.paint(3, 3, 2, 3);
  gfx.line(7, 31, 312, 192, 0, 'BF');
  text.locate(5, 2); text.print('Version 1.0                    3/18/88');
  text.locate(6, 2); text.print('copyright 1988 by Winston Douglas Wood');
  text.locate(13, 8); text.print('1-Play Star Command');
  text.locate(14, 8); text.print('2-Begin New Game');
  text.locate(15, 8); text.print(['3-', 'Hard Disk Drive       ']);
  text.locate(16, 8); text.print(['4-', 'Sound On ']);
  text.locate(17, 8); text.print(['5-', 'Enhanced Graphics Adaptor']);
  text.locate(23, 2); text.print(' portions of this product copyrighted');
  text.locate(24, 2); text.print(' by Microsoft Corporation   1982-1987', ';');
  E.input.setMenu([1, 2, 3, 4, 5].map((n) => ({ key: String(n), row: 12 + n, col: 8, len: 2 })));
}

function bars(E, x1, y1, x2, y2, colours) {
  for (let x = x1, i = 0; x <= x2; x += 4, i++) E.fb.fillRect(x, y1, Math.min(x + 3, x2), y2, colours[i % colours.length]);
}

export function drawPutTest(E, verb = PSET, mode = 1) {
  const { text, sprites } = E;
  E.screen(mode);
  if (mode === 1) { text.color(0, 1); E.fb.modulePalette('STARTUP', true); }
  const cols = mode === 1 ? [0, 1, 2, 3] : [...Array(16).keys()];
  const big = mode === 1 ? { bank: 'TITLE.BAS', index: 1 } : { bank: 'BIGSH-1.EGA', index: 0 };
  const small = mode === 1 ? { bank: 'SHIP-1.BAS', index: 0 } : { bank: 'TR-1.EGA', index: 0 };
  bars(E, 0, 0, 203, 105, cols);
  sprites.put(2, 2, big, verb);
  text.locate(1, 27); text.print('PUT test');
  text.locate(3, 27); text.print(`SCREEN ${mode}`);
  text.locate(5, 27); text.print(`verb ${verbName(verb)}`);
  text.locate(7, 27); text.print(`${big.bank}`);
  text.locate(8, 27); text.print(`[${big.index}]`);
  const buf = sprites.get(40, 30, 79, 69);
  sprites.put(240, 66, buf, PSET);
  [OR, AND, PRESET, PSET, XOR].forEach((v, i) => {
    const x = 64 * i;
    text.locate(15, 8 * i + 1); text.print(verbName(v), ';');
    bars(E, x, 122, x + 59, 153, cols);
    sprites.put(x + 18, 126, small, v);
  });
  text.locate(21, 1); text.print(`${small.bank}[${small.index}] with each verb`);
  text.locate(23, 1); text.print('keys: 1-5 verb   C SCREEN 1   E SCREEN 7', ';');
}

export async function runDemo(E, which, params) {
  if (which === 'put') {
    let verb = VERBS[(params.get('verb') || 'PSET').toUpperCase()] ?? PSET;
    let mode = params.get('mode') === '7' ? 7 : 1;
    drawPutTest(E, verb, mode);
    window.__demoReady = true;
    for (;;) {
      const k = await E.input.key();
      if (k >= '1' && k <= '5') verb = Number(k) - 1;
      else if (k.toUpperCase() === 'C') mode = 1;
      else if (k.toUpperCase() === 'E') mode = 7;
      else continue;
      drawPutTest(E, verb, mode);
    }
  }
  drawSU03(E);
  window.__demoReady = true;
  await E.input.key();
  E.input.clearMenu();
  return runDemo(E, 'put', params);
}
