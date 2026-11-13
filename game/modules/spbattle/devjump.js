import { SpaceModule, DATA as SPACE_DATA } from '../space.js';
import { applySpaceFixture } from '../space/fixture.js';
import { NAME_ARRAYS } from '../startup.js';

const UP = '\0H', DOWN = '\0P', LEFT = '\0K', RIGHT = '\0M', ENTER = '\r';
const ENC = 12;
export const SCRIPTS = {
  'SB-00': [ENC, []],
  'SB-01': [ENC, ['Y']],
  'SB-02': [ENC, ['N']],
  'SB-02v': [ENC, ['N', 'D']],
  'SB-02s': [ENC, ['N', 'C']],
  'SB-03': [ENC, ['N', 'C']],
  'SB-04': [ENC, ['N', 'H']],
  'SB-05': [ENC, ['N', 'E', 'E', 'E', 'E', 'E', 'E']],
  'SB-07': [ENC, ['N', 'H', 'H', 'H']],
  'SB-09': [ENC, ['N', 'H', 'H', 'H', ENTER, '1'], (G) => { G[2] = 2; G[1626] = 7; }],
  'SB-08': [ENC, ['N', 'H', 'H', 'H', ENTER, '1'], (G) => { G[2] = 2; G[1626] = -4; }],
  'SB-02d': [0, ['N', LEFT, LEFT, LEFT, LEFT, LEFT, UP, ENTER, 'N', UP, UP, UP, UP, UP, UP]],
  'SB-02dY': [0, ['N', LEFT, LEFT, LEFT, LEFT, LEFT, UP, ENTER, 'N', UP, UP, UP, UP, UP, UP, 'Y']],
  'SB-06': [ENC, ['N', 'B', 'B', 'B', 'B', 'E', 'E', 'F', ENTER, ...[...Array(3)].flatMap(() => ['N', 'E', 'E', 'E', 'E', 'E', 'E', 'F', ENTER])]],
};

const SEED = { 'SB-02d': 1, 'SB-02dY': 1, 'SB-04': 3, 'SB-07': 3, 'SB-09': 3 };
const HOLD = { 'SB-04': { delay: /Sucessfull\/$/ }, 'SB-07': { chain: true }, 'SB-09': { idle: true } };

export async function prepare(E, screen, gap = 3) {
  const id = Object.keys(SCRIPTS).find((k) => k.toUpperCase() === String(screen).toUpperCase());
  if (!id) throw new Error(`no SPBATTLE dev screen ${screen}`);
  const [enc, script, fix] = SCRIPTS[id];
  await E.state.load('CHARINFO.BAS');
  const f = await E.data.nameFields(); let k = 0;
  for (const [name, first, last] of NAME_ARRAYS) { const arr = E.state.str(name); for (let i = first; i <= last; i++) arr[i] = f[k++]; }
  applySpaceFixture(E.state.G, (n) => E.state.str(n));
  const G = E.state.G; G[46] = 300; G[45] = 200; G[44] = 8;
  Object.assign(G, { 690: 1, 691: 30, 692: 10, 693: 10, 694: 10, 695: 10, 696: 1 });

  if (fix) fix(E.state.G);
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('seed') : null;
  if (qs !== null) E.devSeed = Number(qs); else if (SEED[id] !== undefined) E.devSeed = SEED[id];

  const inkey = E.input.inkey.bind(E.input);
  const stop = new Error('spbattle-devjump: SPACE console drawn');
  E.input.inkey = () => { throw stop; };
  try { await new SpaceModule(E, { data: SPACE_DATA }).run(0x0040); } catch (e) { if (e !== stop) throw e; }

  const pr = E.text.print.bind(E.text); const t0 = E.timer.now(); E.textLog = [];
  E.text.print = (it, end) => {
    const nl = end === undefined || end === '\n' ? '/' : '';
    E.textLog.push(`${(E.timer.now() - t0).toFixed(1)} @${E.text.row},${E.text.col} ${[].concat(it).map(String).join('')}${nl}`);
    return pr(it, end);
  };

  if (id === 'SB-00') {
    const open = E.data.open.bind(E.data);
    E.data.open = (name) => (E.textLog.some((l) => /\(s\)\/$/.test(l)) ? new Promise(() => { if (typeof window !== 'undefined') window.__devReady = true; }) : open(name));
  }

  if (id === 'SB-06' && E.timer.delayLoop) {
    const delay = E.timer.delayLoop.bind(E.timer);
    E.timer.delayLoop = (n) => (E.textLog.some((l) => /@22,3 making/.test(l)) ? new Promise(() => { if (typeof window !== 'undefined') window.__devReady = true; }) : delay(n));
  }

  const hold = HOLD[id];
  const ready = () => { if (typeof window !== 'undefined') window.__devReady = true; };
  if (hold?.delay && E.timer.delayLoop) {
    const delay = E.timer.delayLoop.bind(E.timer);
    E.timer.delayLoop = (n) => (E.textLog.some((l) => hold.delay.test(l)) ? (ready(), new Promise(() => {})) : delay(n));
  }

  const chain = E.chain; E.chainLog = [];
  E.chain = (name, o) => {
    const g = (i) => E.state.G[i];
    E.chainLog.push({ to: name, ChainArg: g(2214), Terrain: g(2228), Surprise: g(2229), Gravity10: g(2250), BoardCrew: g(2251), Breathable: g(2252), EnFuel: g(2266), LastEnemyType: g(2263) });
    if (hold?.chain) { ready(); return new Promise(() => {}); }
    E.chain = chain; return chain(name, o);
  };

  E.state.G[2214] = enc;
  const keys = [...script];
  let idleSince = null;
  E.input.inkey = () => {
    const key = inkey();
    if (key !== '' || (!keys.length && !hold?.idle)) { idleSince = null; return key; }
    const t = E.timer.now();
    if (idleSince === null) idleSince = t;
    if (!keys.length) { if (t - idleSince >= gap / 2) ready(); return ''; }
    if (t - idleSince >= gap / 2) { idleSince = null; return keys.shift(); }
    return '';
  };
  return keys;
}
export { UP, DOWN, LEFT, RIGHT, ENTER };
