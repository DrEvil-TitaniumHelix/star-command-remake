import { applySpaceFixture } from '../space/fixture.js';
import { NAME_ARRAYS } from '../startup.js';

const UP = '\0H', DOWN = '\0P', LEFT = '\0K', RIGHT = '\0M', ENTER = '\r';

const CHAIN_ARG = 2214, ENTRY_MODE = 2227, TERRAIN = 2228, SURPRISE = 2229, GRAVITY10 = 2250, BREATHABLE = 2252, ENCLOSURE = 2260;

const SEED = { default: 3, 'PB-08': 2 };
export const SCRIPTS = {
  'PB-01': [],
  'PB-02': [ENTER],
  'PB-03': [ENTER, 'Y'],
  'PB-04': [ENTER, 'N'],
  'PB-05': [ENTER, 'N', 'B', 'B'],
  'PB-06': [ENTER, 'N', 'B', 'B', ENTER, ENTER, ENTER, ENTER, ENTER, ENTER],
  'PB-07': [ENTER, 'Y', 'D'],
  'PB-08': [ENTER, 'N', 'B', 'B', ENTER, ENTER, ENTER, ENTER, ENTER, ENTER],
};
const SETUP = {
  'PB-08': (G) => { for (let m = 1; m <= 8; m++) G[1300 + 100 * m + 15] = 1; },
};
const HOLD = {
  'PB-06': { text: /making|and hits|and misses/ },
  'PB-07': { chain: true },
  'PB-08': { text: /You Are All Dead/, now: true },
};

const ROOM_TRIP = { 'PB-04D': 'row', 'PB-04E': 'inside' };
const ROOM_SEED = 3, ROW_DOWNS = 6;

async function roomTrip(E, mode, gap) {
  const ready = () => { if (typeof window !== 'undefined') window.__devReady = true; };
  E.devSeed = ROOM_SEED;
  E.state.G[93] = 1;
  let last = '', downs = 0, held = false;
  const print = E.text.print.bind(E.text);
  E.text.print = (v, ...r) => { const s = [].concat(v).join(''); if (s.trim() && E.text.row >= 20) last = s; return print(v, ...r); };
  const frame = E.timer.frame.bind(E.timer);
  E.timer.frame = () => (held ? new Promise(() => {}) : frame());
  const inkey = E.input.inkey.bind(E.input);
  let idleSince = null;
  E.input.inkey = () => {
    const k = inkey();
    if (k !== '') { idleSince = null; return k; }
    const t = E.timer.now();
    if (idleSince === null) idleSince = t;
    if (t - idleSince < gap / 2) return '';
    idleSince = null;
    if (E.currentModule === 'INSIDE') { if (mode === 'inside') ready(); return ''; }
    if (/Establish communications/.test(last)) return 'N';
    if (/C-Time Delay/.test(last)) {
      if (mode === 'row' && downs >= ROW_DOWNS) { held = true; ready(); return ''; }
      downs++; return DOWN;
    }
    return ENTER;
  };
}

export async function prepare(E, screen, gap = 3) {
  const sid0 = String(screen).toUpperCase();
  if (sid0.endsWith(':ROOM')) return roomTrip(E, ROOM_TRIP[sid0.slice(0, -5)], gap);
  if (ROOM_TRIP[sid0]) {
    globalThis.__keepChain = true;
    if (typeof window !== 'undefined') Object.defineProperty(window, '__screenReady', { get: () => false, set() {}, configurable: true });
    const chain = E.chain.bind(E);
    E.chain = (name, o) => chain(name, /PLBATTLE/i.test(name) ? { screen: sid0 + ':ROOM' } : o);
    return E.chain('INSIDE', { screen: 'IN-09' });
  }
  await E.state.load('CHARINFO.BAS');
  const f = await E.data.nameFields(); let k = 0;
  for (const [name, first, last] of NAME_ARRAYS) { const arr = E.state.str(name); for (let i = first; i <= last; i++) arr[i] = f[k++]; }
  const G = E.state.G;
  applySpaceFixture(G, (n) => E.state.str(n));
  for (let m = 1; m <= 8; m++) { G[1300 + 100 * m + 58] = 90; G[1300 + 100 * m + 23] = 9; }
  G[CHAIN_ARG] = 0; G[ENTRY_MODE] = 1; G[TERRAIN] = 1; G[SURPRISE] = 0; G[GRAVITY10] = 10; G[BREATHABLE] = 1; G[ENCLOSURE] = 0;
  const sid = String(screen).toUpperCase();
  const set = Object.keys(SETUP).find((x) => x.toUpperCase() === sid);
  if (set) SETUP[set](G);
  const pick = (o) => o[Object.keys(o).find((x) => x.toUpperCase() === sid)];
  E.devSeed = pick(SEED) ?? SEED.default;
  const hold = pick(HOLD);
  const ready = () => { if (typeof window !== 'undefined') window.__devReady = true; };
  const freeze = () => { ready(); return new Promise(() => {}); };
  if (hold) {
    let hit = false;
    if (hold.chain) E.chain = () => freeze();
    if (hold.text) {
      const print = E.text.print.bind(E.text);
      E.text.print = (v, ...r) => { if (hold.text.test([].concat(v).join(''))) hit = true; return print(v, ...r); };
      const frame = E.timer.frame?.bind(E.timer), delay = E.timer.delayLoop?.bind(E.timer);
      if (delay) E.timer.delayLoop = (n) => (hit ? freeze() : delay(n));
      if (hold.now && frame) E.timer.frame = () => (hit ? freeze() : frame());
    }
  }
  let idleHeld = false;
  const frameAt = E.timer.frame?.bind(E.timer);
  if (frameAt) E.timer.frame = () => (idleHeld ? new Promise(() => {}) : frameAt());
  const id = Object.keys(SCRIPTS).find((x) => x.toUpperCase() === sid);
  const keys = [...(id ? SCRIPTS[id] : [])];
  const inkey = E.input.inkey.bind(E.input);
  let idleSince = null;
  E.input.inkey = () => {
    const k2 = inkey();
    if (k2 !== '') { idleSince = null; return k2; }
    const t = E.timer.now();
    if (idleSince === null) idleSince = t;
    if (!keys.length) { if (!hold && t - idleSince >= gap / 2) { idleHeld = true; ready(); } return ''; }
    if (t - idleSince >= gap / 2) { idleSince = null; return keys.shift(); }
    return '';
  };
  return keys;
}
export { UP, DOWN, LEFT, RIGHT, ENTER };
