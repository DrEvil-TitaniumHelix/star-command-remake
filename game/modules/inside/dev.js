// dev.js — `index.html?screen=<IN-id>` jumps for the INSIDE port (acceptance screenshots).
// The module code runs unchanged from its entry (0040); a jump only prepares a FIXTURE save and then types a
// scripted key sequence, so every screen is reached through the original control flow.
//
// Fixture (test data, not from the original): the shipped CHARINFO.BAS + an EGA adapter (G!(89) = G!(90) = 1, as
// STARCOMM's probe sets on an EGA), the COMMON string arrays read from NAME with STARTUP's loop bounds
// (STARTUP.bas.md 00F0-0552), ship/crew names, and a plain six-member squad (crew slots 3..8 = INSIDE squad
// 1..6, FNCrew base 1500). SectorX! = G!(2216) selects the location (INSIDE 06A3-07CD): 28 -> location 1,
// 8 -> location 5, 12 -> location 3 (airless). RANDOMIZE TIMER gets a fixed TIMER value so the 1% random
// encounter per step and the trap rolls repeat exactly. Key paths come from game/modules/inside/mapinfo.py.

import { KEY } from '../../engine/input.js';

const U = KEY.UP, D = KEY.DOWN, L = KEY.LEFT, R = KEY.RIGHT;
const keys = (s) => s.split(' ').filter(Boolean).map((k) => ({ UP: U, DOWN: D, LEFT: L, RIGHT: R, ENTER: KEY.ENTER, SPACE: KEY.SPACE }[k] ?? k));

// location 5 paths (mapinfo.py 5)
const L5 = {
  exit: 'DOWN RIGHT UP',
  enemy: 'DOWN DOWN DOWN DOWN DOWN DOWN LEFT',
  script: 'DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN RIGHT RIGHT',
  trap: 'DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN RIGHT RIGHT',
  door: 'DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN RIGHT DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN DOWN RIGHT RIGHT RIGHT RIGHT RIGHT UP UP LEFT',
};

// screen id -> fixture: sector (location), keys typed once the main loop runs, breakAfter = GOSUB to stop after
export const FIXTURES = {
  'IN-00': { sector: 28, breakAfter: 0x63F9 },            // frame (SUB_0DEE) + location loaded and map PUT (SUB_63F9), before the panels
  'IN-01': { sector: 12 },                                // location 3, nobody has oxygen -> the Y/N prompt
  'IN-02': { sector: 28 },
  'IN-02a': { sector: 8, keys: L5.trap },
  'IN-02b': { sector: 8, keys: L5.door },
  'IN-02c': { sector: 8, keys: L5.exit },
  'IN-03': { sector: 28, keys: 'C' },
  'IN-04': { sector: 28, keys: 'E' },
  'IN-05': { sector: 28, keys: 'F' },
  'IN-06': { sector: 28, keys: 'G' },
  'IN-07': { sector: 28, keys: 'I 1' },
  'IN-08': { sector: 28, keys: 'M A' },
  'IN-09': { sector: 8, keys: L5.enemy, stopChain: true },
  'IN-10': { sector: 8, keys: L5.script },
  'IN-11': { sector: 28, keys: 'R', freezeAfter: 0.2 },
  'IN-12': { sector: 28, keys: 'S', freezeAfter: 0.2 },
  'IN-13': { sector: 28, keys: 'T' },
  'IN-14': { sector: 28, keys: 'U' },
  'IN-14v': { sector: 28, keys: 'V', freezeAfter: 0.8 },
};

const STRING_LOOPS = [   // STARTUP 00F0-0552: [array, first index, last index] in NAME field order
  ['Rank$', 1, 13], ['Skill$', 0, 15], ['ShipClassName$', 0, 8], ['ShipSize$', 0, 3], ['ShieldName$', 0, 4],
  ['DefHwName$', 0, 4], ['MissileKillerName$', 0, 2], ['GunName$', 0, 24], ['WeaponName$', 0, 53],
  ['HandWeaponName$', 0, 5], ['SightingName$', 0, 3], ['ArmorSuitName$', 0, 15], ['MiscItemName$', 0, 10],
  ['ItemName$', 0, 99], ['FindName$', 0, 49], ['ShipType$', 0, 22], ['EquipName$', 0, 22], ['AttrName$', 0, 6],
];

export async function fixtureState(E, sector) {
  const st = E.state;
  await st.load('CHARINFO.BAS');
  const names = await E.data.nameFields();
  let k = 0;
  for (const [arr, a, b] of STRING_LOOPS) { const s = st.str(arr); for (let i = a; i <= b; i++) s[i] = names[k++]; }
  st.str('ShipName$')[0] = 'FIXTURE';
  const crew = st.str('CrewName$');
  ['Pilot', 'Comms', 'Able', 'Baker', 'Charlie', 'Dog', 'Easy', 'Fox'].forEach((n, i) => { crew[i + 1] = n; });
  const G = st.G;
  G[89] = 1; G[90] = 1;                       // UseEGA!, EGA detected
  G[2216] = sector;                           // SectorX! -> Location!
  G[2255] = 0;                                // InBattle!: fresh entry
  for (let c = 1; c <= 8; c++) {              // crew records 1300 + 100c (INSIDE squad m = crew c - 2)
    const f = (i, v) => { G[1300 + 100 * c + i] = v; };
    [50, 45, 55, 40, 45, 20, 60].forEach((v, i) => f(i, v));   // attributes (field 0 <> 0 = slot used)
    f(15, 30); f(16, 30); f(31, 1); f(34, 2); f(35, 2); f(29, 9000); f(12, 5);
    for (let s = 17; s <= 26; s++) f(s, 3);
  }
  G[1300 + 300 + 27] = 8; G[1300 + 300 + 54] = 2;   // squad member 1 = esper (values of INSIDE's own TestMode set-up, 05CB-061D)
  // gear (CROSSREF §2.2 layouts): squad weapons 800 + 12k (type, damage, ammo cap, condition, accuracy,
  // weight x10, shots, .., .., owner crew), ammo 1100 + 3k (type, weight x10, owner), personal items 2300 + 3k
  // (type, weight x10, owner): 1 medkit, 2 repair kit, 3 motion detector, 6 torch, 7 lock pick, 11 radiation
  // detector. No oxygen gear (items 8/9/10), so location 3 asks the atmosphere question (IN-01).
  for (let k = 0; k < 6; k++) {
    const w = 800 + 12 * k;
    [k + 1, 10, 30, 0, 50, 50, 1].forEach((v, i) => { G[w + i] = v; });
    G[w + 9] = k + 3;
    G[1100 + 3 * k] = k + 1; G[1101 + 3 * k] = 10; G[1102 + 3 * k] = k + 3;
  }
  [[1, 3], [2, 4], [6, 5], [7, 6], [3, 7], [11, 8]].forEach(([type, owner], k) => {
    G[2300 + 3 * k] = type; G[2301 + 3 * k] = 10; G[2302 + 3 * k] = owner;
  });
}

export async function setup(E, m, screen) {
  const fx = FIXTURES[Object.keys(FIXTURES).find((k) => k.toUpperCase() === String(screen).toUpperCase())];
  if (!fx) throw new Error(`no INSIDE fixture for ${screen}`);
  await fixtureState(E, fx.sector);
  const randomize = m.randomize.bind(m);
  m.randomize = () => randomize(globalThis.__insideSeed ?? fx.seed ?? 1000.5);   // RANDOMIZE TIMER with a fixed TIMER
  // GOSUB hooks: SUB_1405 (the command-key reader) = the main loop waits for input; breakAfter = stop there
  let inputReady = false;
  const exec = m.exec.bind(m);
  m.exec = async (pc) => {
    if (pc === 0x1405 || pc === 0x1ABD) inputReady = true;   // command-key reader / Y-N reader
    const r = await exec(pc);
    if (pc === fx.breakAfter) { window.__screenReady = true; await new Promise(() => {}); }
    return r;
  };
  if (fx.stopChain && !globalThis.__keepChain) E.chain = (mod) => { window.__screenReady = true; return new Promise(() => {}); };
  // freezeAfter: transient screens (Reloading, You Find, the View flash) are held by stopping the module's clock
  // (every wait/poll goes through m.frame) freezeAfter seconds after the last key
  const frame = m.frame.bind(m);
  m.frame = async () => { if (m.frozen) await new Promise(() => {}); return frame(); };
  const seq = keys(fx.keys ?? '');
  // type one key whenever the queue is empty and the module has had 300 ms to react (keeps INKEY$ loops honest)
  (async () => {
    while (!inputReady) await E.timer.wait(0.1);
    await E.timer.wait(0.5);
    for (const k of seq) {
      while (E.input.queue.length) await E.timer.wait(0.05);
      E.input.push(k);
      await E.timer.wait(0.3);
    }
    if (fx.freezeAfter !== undefined) { await E.timer.wait(fx.freezeAfter); m.frozen = true; }
    await E.timer.wait(1.5);
    window.__screenReady = true;
  })();
}
