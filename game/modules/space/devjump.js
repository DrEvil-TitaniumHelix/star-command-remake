// devjump.js — `?screen=SP-xx` for the acceptance screenshots (lane build-startup).
// The module always runs its real flow from the entry point (0x0040); a dev jump only applies the fixture
// save (fixture.js) and then types the original keys that lead to the screen, one every `gap` seconds.
import { applySpaceFixture } from './fixture.js';
import { NAME_ARRAYS } from '../startup.js';

const UP = '\0H', DOWN = '\0P', LEFT = '\0K', RIGHT = '\0M', ENTER = '\r';
// screen id -> keys from the long-range view (SP-01). Start: sector (28,2) = Earth starport at the cursor home.
export const SCRIPTS = {
  'SP-00': [], 'SP-01': [],
  'SP-02': ['A'],                      // galaxy scan
  'SP-03': ['D'],                      // sector scan
  'SP-03a': ['D', 'D'],                // sector scan -> D on the starport cell
  'SP-05': ['B'],                      // switch positions prompt
  'SP-06': ['C'],                      // computer menu
  'SP-07': ['F'],                      // fix
  'SP-08': ['H'],                      // heal menu
  'SP-09': ['I'],                      // inspect menu
  'SP-09a': ['I', 'A', ' '],           // inspect ship, page 2: equipment list with the condition marks (078E5)
  'SP-10': ['E'],                      // equip list
  'SP-11': ['J'],                      // time delay prompt
  'SP-03b': ['D', 'D'],                // station sector (30,5): object at the cursor home
  'SP-03c': ['D'],                     // black-hole sector (27,18): pulled in on the sector scan
  'SP-04': ['D', DOWN, 'D'],           // sector (28,3): class-3 star at row 8 col 7 (Node probe of the 2E02 decoder)
  'SP-04a': ['D', DOWN, 'D', LEFT, LEFT, LEFT, UP, UP, UP, 'D'],   // planet at system cursor (3,3)
  'SP-04b': ['D', DOWN, 'D', LEFT, LEFT, LEFT, UP, UP, UP, 'D', 'C'],   // C-Scientific Investigation -> drop ship
  'SP-12': [RIGHT],                    // BaseEnc! = 100 -> encounter roll on the first move
  'SP-12s': ['D', DOWN, 'D', UP, UP, UP, 'D', 'C'],   // sector (27,23): planet 1 at orbit 0 (0,-3), PlLife! 1 -> PlTech! 1; C-Science rolls SUB_6B82
  'SP-14': [RIGHT],                    // EngineCond! = 3 -> "Ship is irreparable"
};
// per-screen state on top of the fixture (G!() indices from CROSSREF.md §2.2; sectors from GALAXY.BAS)
const SETUP = {
  'SP-03b': (G) => { G[2216] = 30; G[2217] = 5; },
  'SP-03c': (G) => { G[2216] = 27; G[2217] = 18; },
  'SP-04': (G) => { G[2216] = 28; G[2217] = 3; },
  'SP-04a': (G) => { G[2216] = 28; G[2217] = 3; },
  'SP-04b': (G) => { G[2216] = 28; G[2217] = 3; },
  'SP-09a': (G) => { G[1] = 2; G[2] = 3; },   // equipment 1 broken (*), 2 unfixable (#), the rest as saved
  'SP-12': (G) => { G[2235] = 100; },  // BaseEnc! (EncChance! = BaseEnc! at 0F95)
  'SP-12s': (G) => { G[2216] = 27; G[2217] = 23; },
  'SP-13': (G) => { G[2200] = 0; },    // Fuel! 0: out of fuel on the first move
  'SP-14': (G) => { G[0] = 3; },       // EngineCond! 3 (not 1 or 2): cursor key -> game over (2224-2297)
};
// pinned RANDOMIZE value (basic.js E.devSeed) where the screen depends on a roll: SP-12s seed 1 -> RND*100 <= 30
// (EncPct! science) at 06BB3 -> "Confrontation on planet surface" (found with a Node seed scan, 1..10: 1,6,7,10)
const SEED = { 'SP-12s': 1 };
// hold points (dev only): the run freezes and the shooter is told it is ready - at the CHAIN out of the module, or
// at the first SOUND of a given frequency (SP-04b: SUB_8F2E SOUND Note!*3+38, Note! = 4 right after DropShip4 PUT (52,19);
// SP-03c: the first SOUND 44 of the black-hole loop (02C6C), right after "You are pulled into a black hole!" and
// before its random black lines erase the starfield)
const HOLD = { 'SP-12s': { chain: true }, 'SP-04b': { sound: 50 }, 'SP-03c': { sound: 44 } };

export async function prepare(E, screen, gap = 3) {
  await E.state.load('CHARINFO.BAS');                       // shipped save first (STARCOMM does this in a normal run)
  // the NAME / CHARNAME string arrays exactly as STARTUP fills them (00F0-05FC), then the fixture on top
  const f = await E.data.nameFields(); let k = 0;
  for (const [name, first, last] of NAME_ARRAYS) { const arr = E.state.str(name); for (let i = first; i <= last; i++) arr[i] = f[k++]; }
  applySpaceFixture(E.state.G, (n) => E.state.str(n));
  const id = Object.keys(SCRIPTS).find((k) => k.toUpperCase() === String(screen).toUpperCase());   // index.html upper-cases ids
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
  // Feed the next key only when the program is idle at a prompt: SPACE's key reader first flushes the keyboard
  // (02137 `IF INKEY$ <> "" THEN GOTO L_212C`), so a key typed while a screen is still drawing is lost, as on DOS.
  // Idle = INKEY$ polled empty for `gap` seconds of program time.
  const inkey = E.input.inkey.bind(E.input);
  let idleSince = null;
  E.input.inkey = () => {
    const k = inkey();
    if (k !== '') { idleSince = null; return k; }
    const t = E.timer.now();
    if (idleSince === null) idleSince = t;
    // after the last scripted key: the screen is "ready" once the program idles at its next prompt (shooter waits)
    if (!keys.length) { if (!hold && t - idleSince >= gap / 2) ready(); return ''; }
    if (t - idleSince >= gap / 2) { idleSince = null; return keys.shift(); }
    return '';
  };
  return keys;
}
export { UP, DOWN, LEFT, RIGHT, ENTER };
