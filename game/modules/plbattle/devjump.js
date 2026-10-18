// devjump.js — `?screen=PB-xx` for the acceptance screenshots (lane build-plbattle).
// The module runs its real flow from 0x0040. A dev jump loads the shipped save + the NAME arrays (as STARTUP does),
// applies the crew fixture shared with SPACE and the CHAIN contract SPACE sets before `CHAIN "PLBATTLE.STR"`
// (CROSSREF.md §1.1 6E0B, §1.3, §6), then types the original keys whenever the program idles at a prompt.
import { applySpaceFixture } from '../space/fixture.js';
import { NAME_ARRAYS } from '../startup.js';

const UP = '\0H', DOWN = '\0P', LEFT = '\0K', RIGHT = '\0M', ENTER = '\r';

// G!() indices: assets/gmap.json (CROSSREF.md §2.2)
const CHAIN_ARG = 2214, ENTRY_MODE = 2227, TERRAIN = 2228, SURPRISE = 2229, GRAVITY10 = 2250, BREATHABLE = 2252, ENCLOSURE = 2260;

// The RNG is pinned (RANDOMIZE value, basic.js E.devSeed) so maps, rolls and outcomes are reproducible.
const SEED = { default: 3, 'PB-08': 2 };
export const SCRIPTS = {
  'PB-01': [],                          // briefing (waits for ENTER)
  'PB-02': [ENTER],                     // battle screen + "Establish communications? (y/n)"
  'PB-03': [ENTER, 'Y'],                // communications phase menu
  'PB-04': [ENTER, 'N'],                // movement phase 2 menu (phase 1 has no squad move at seed 3)
  'PB-05': [ENTER, 'N', 'B', 'B'],      // B skips the squad moves (phases 2, 5) -> command phase, first member
  'PB-06': [ENTER, 'N', 'B', 'B', ENTER, ENTER, ENTER, ENTER, ENTER, ENTER],   // accept every default command -> initiative round
  'PB-07': [ENTER, 'Y', 'D'],           // bargain/bribe: "They accept 600 credits as payment for a truce" -> Battle Over + report
  'PB-08': [ENTER, 'N', 'B', 'B', ENTER, ENTER, ENTER, ENTER, ENTER, ENTER],   // squad at 1 HP, seed 2: all die in round 1
};
const SETUP = {
  'PB-08': (G) => { for (let m = 1; m <= 8; m++) G[1300 + 100 * m + 15] = 1; },
};
// hold points for screens the program does not stop at by itself: the run freezes (and the shooter is told it is
// ready) at the first delay after a matching PRINT, or at the CHAIN out of the module
const HOLD = {
  'PB-06': { text: /making|and hits|and misses/ },
  'PB-07': { chain: true },
  'PB-08': { text: /You Are All Dead/, now: true },
};

// PB-04d / PB-04e: the room-door exit (qa F-6, PLBATTLE 09AB1 Map%(76) = 1) as a real round trip. The run starts in
// INSIDE at IN-09 (location 5, the squad walks into an enemy room -> CHAIN PLBATTLE, Terrain! 11); the battle then
// answers its own prompts: N to "Establish communications", DOWN at every squad move, ENTER for every command, so the
// squad walks straight down column 4 to the door cell (4, 8). PB-04d holds on the bottom row (SquadY! 18) at the
// move prompt before the last DOWN; PB-04e lets FNOffMap(5) end the battle (L_410E) and holds once INSIDE is back
// at its command loop with the squad on OldX!/OldY!.
const ROOM_TRIP = { 'PB-04D': 'row', 'PB-04E': 'inside' };
const ROOM_SEED = 3, ROW_DOWNS = 6;

async function roomTrip(E, mode, gap) {
  const ready = () => { if (typeof window !== 'undefined') window.__devReady = true; };
  E.devSeed = ROOM_SEED;
  // sound off (G!(93), SndDur! = 0 at 000C7): the rocket arc 08EE2 starts SOUND f, 999 ticks; the engine's MF SOUND
  // waits for the whole tone (engine request in STATUS.md), the original returns at once
  E.state.G[93] = 1;
  let last = '', downs = 0, held = false;
  const print = E.text.print.bind(E.text);
  // prompts only (rows 20..25): the portrait animation SUB_9B06 reprints the group name at rows 2..3 while polling keys
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
    if (/C-Time Delay/.test(last)) {                  // squad move: SquadY! 12 + 1 per DOWN, row 18 after 6
      if (mode === 'row' && downs >= ROW_DOWNS) { held = true; ready(); return ''; }
      downs++; return DOWN;
    }
    return ENTER;                                     // commands (W-ait F-Attack: default), Press ENTER, combat messages
  };
}

export async function prepare(E, screen, gap = 3) {
  const sid0 = String(screen).toUpperCase();
  if (sid0.endsWith(':ROOM')) return roomTrip(E, ROOM_TRIP[sid0.slice(0, -5)], gap);   // PLBATTLE leg of PB-04d/e
  if (ROOM_TRIP[sid0]) {                                                               // INSIDE leg: IN-09, real CHAIN
    globalThis.__keepChain = true;
    // the IN-09 fixture flags __screenReady once its keys are typed (inside/dev.js), i.e. mid-trip: only __devReady counts
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
  // surface battle as SPACE 6DC6-6E0B sets it up: first ENCINFO group, plains, no surprise, 1 g, breathable
  for (let m = 1; m <= 8; m++) { G[1300 + 100 * m + 58] = 90; G[1300 + 100 * m + 23] = 9; }   // stamina (field 58; a rest refills it to current move * 3, 022A8), Code Breaking (23)
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
  // the program freezes once it reports ready: at a prompt SUB_9B06 keeps cycling the group header (A, B, ... every
  // 14 x 0.123 s) and the frame animation while it polls INKEY$, so a shot taken some wall-clock time after the ready
  // signal showed group A or B at random (PB-02 / PB-04, dosbox-recompare 2026-10-18)
  let idleHeld = false;
  const frameAt = E.timer.frame?.bind(E.timer);
  if (frameAt) E.timer.frame = () => (idleHeld ? new Promise(() => {}) : frameAt());
  const id = Object.keys(SCRIPTS).find((x) => x.toUpperCase() === sid);
  const keys = [...(id ? SCRIPTS[id] : [])];
  // idle-typed keys (the key readers flush early keys, as on DOS): a key is given when INKEY$ has polled empty
  // for gap/2 seconds of program time
  const inkey = E.input.inkey.bind(E.input);
  let idleSince = null;
  E.input.inkey = () => {
    const k2 = inkey();
    if (k2 !== '') { idleSince = null; return k2; }
    const t = E.timer.now();
    if (idleSince === null) idleSince = t;
    // after the last scripted key: the screen is "ready" once the program idles at its next prompt (shooter waits)
    if (!keys.length) { if (!hold && t - idleSince >= gap / 2) { idleHeld = true; ready(); } return ''; }
    if (t - idleSince >= gap / 2) { idleSince = null; return keys.shift(); }
    return '';
  };
  return keys;
}
export { UP, DOWN, LEFT, RIGHT, ENTER };
