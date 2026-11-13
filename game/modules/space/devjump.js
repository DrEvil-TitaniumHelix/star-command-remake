import { applySpaceFixture } from './fixture.js';
import { NAME_ARRAYS } from '../startup.js';

const UP = '\0H', DOWN = '\0P', LEFT = '\0K', RIGHT = '\0M', ENTER = '\r';
export const SCRIPTS = {
  'SP-00': [], 'SP-01': [],
  'SP-02': ['A'],
  'SP-03': ['D'],
  'SP-03a': ['D', 'D'],
  'SP-05': ['B'],
  'SP-06': ['C'],
  'SP-07': ['F'],
  'SP-08': ['H'],
  'SP-09': ['I'],
  'SP-09a': ['I', 'A', ' '],
  'SP-10': ['E'],
  'SP-11': ['J'],
  'SP-03b': ['D', 'D'],
  'SP-03c': ['D'],
  'SP-04': ['D', DOWN, 'D'],
  'SP-04a': ['D', DOWN, 'D', LEFT, LEFT, LEFT, UP, UP, UP, 'D'],
  'SP-04b': ['D', DOWN, 'D', LEFT, LEFT, LEFT, UP, UP, UP, 'D', 'C'],
  'SP-12': [RIGHT],
  'SP-12s': ['D', DOWN, 'D', UP, UP, UP, 'D', 'C'],
  'SP-14': [RIGHT],
};
const SETUP = {
  'SP-03b': (G) => { G[2216] = 30; G[2217] = 5; },
  'SP-03c': (G) => { G[2216] = 27; G[2217] = 18; },
  'SP-04': (G) => { G[2216] = 28; G[2217] = 3; },
  'SP-04a': (G) => { G[2216] = 28; G[2217] = 3; },
  'SP-04b': (G) => { G[2216] = 28; G[2217] = 3; },
  'SP-09a': (G) => { G[1] = 2; G[2] = 3; },
  'SP-12': (G) => { G[2235] = 100; },
  'SP-12s': (G) => { G[2216] = 27; G[2217] = 23; },
  'SP-13': (G) => { G[2200] = 0; },
  'SP-14': (G) => { G[0] = 3; },
};
const SEED = { 'SP-12s': 1 };
const HOLD = { 'SP-12s': { chain: true }, 'SP-04b': { sound: 50 }, 'SP-03c': { sound: 44 } };

export async function prepare(E, screen, gap = 3) {
  await E.state.load('CHARINFO.BAS');
  const f = await E.data.nameFields(); let k = 0;
  for (const [name, first, last] of NAME_ARRAYS) { const arr = E.state.str(name); for (let i = first; i <= last; i++) arr[i] = f[k++]; }
  applySpaceFixture(E.state.G, (n) => E.state.str(n));
  const id = Object.keys(SCRIPTS).find((k) => k.toUpperCase() === String(screen).toUpperCase());
  const sid = String(screen).toUpperCase();
  const setup = Object.keys(SETUP).find((k) => k.toUpperCase() === sid);
  if (setup) SETUP[setup](E.state.G);
  const keys = [...(id ? SCRIPTS[id] : (sid === 'SP-13' ? [RIGHT] : []))];
  const pick = (o) => o[Object.keys(o).find((x) => x.toUpperCase() === sid)];
  if (pick(SEED) !== undefined) E.devSeed = pick(SEED);
  const hold = pick(HOLD);
  const ready = () => { if (typeof window !== 'undefined') window.__devReady = true; };
  const freeze = () => { ready(); return new Promise(() => {}); };
  if (hold?.chain) E.chain = () => freeze();
  if (hold?.sound && E.audio?.sound) {
    const sound = E.audio.sound.bind(E.audio);
    E.audio.sound = (f, d) => (!keys.length && Math.round(f) === hold.sound ? freeze() : sound(f, d));
  }
  const inkey = E.input.inkey.bind(E.input);
  let idleSince = null;
  E.input.inkey = () => {
    const k = inkey();
    if (k !== '') { idleSince = null; return k; }
    const t = E.timer.now();
    if (idleSince === null) idleSince = t;
    if (!keys.length) { if (!hold && t - idleSince >= gap / 2) ready(); return ''; }
    if (t - idleSince >= gap / 2) { idleSince = null; return keys.shift(); }
    return '';
  };
  return keys;
}
export { UP, DOWN, LEFT, RIGHT, ENTER };
