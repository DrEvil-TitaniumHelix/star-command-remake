// devjump.js — `?screen=SB-xx` for the SPBATTLE acceptance screenshots (lane build-spbattle).
// SPBATTLE never draws the console: it reuses SPACE's panels (SPBATTLE_SCREENS.md, SCREENS_INDEX "needs SP-00 on
// screen"). So a dev jump does what a real game does before SPACE 9043 `CHAIN "SPBATTLE.EXE"`:
//   1. shipped save + NAME arrays + the SPACE fixture (game/modules/space/fixture.js, build-startup),
//   2. run SPACE's real flow until it waits for its first key (console SP-00 + view SP-01 drawn), then stop it,
//   3. set ChainArg! = the ENCLIST record of the encounter and let the generated SPBATTLE run from 0x0040,
//      typing the original keys that lead to the screen when the program is idle at a prompt.
import { SpaceModule, DATA as SPACE_DATA } from '../space.js';
import { applySpaceFixture } from '../space/fixture.js';
import { NAME_ARRAYS } from '../startup.js';

const UP = '\0H', DOWN = '\0P', LEFT = '\0K', RIGHT = '\0M', ENTER = '\r';
// ENCLIST record (0-based, SPBATTLE 06EF-0742 reads records 0..ChainArg!): 12 = "Pirate Scout, 2" (two hostile
// scouts, tech 0) unless the screen needs another one.
const ENC = 12;
// screen id -> [encounter, keys]. Keys are the original ones (SPBATTLE.bas.md "Key map", SPBATTLE_SCREENS.md).
export const SCRIPTS = {
  'SB-00': [ENC, []],                         // entry text, before the communications prompt is answered
  'SB-01': [ENC, ['Y']],                      // Establish communications? Y -> (established) Communications Phase
  'SB-02': [ENC, ['N']],                      // no communications -> movement phase menu
  'SB-02v': [ENC, ['N', 'D']],                // D-Visual
  'SB-02s': [ENC, ['N', 'C']],                // C-Scan -> scan map (+ enemy report text)
  'SB-03': [ENC, ['N', 'C']],                 // enemy report on the scan map
  'SB-04': [ENC, ['N', 'H']],                 // H-Jump To Hyperspace
  'SB-05': [ENC, ['N', 'E', 'E', 'E', 'E', 'E', 'E']],   // skip the 6 player move phases -> targeting
  // firing: the scouts end up south of the player (SB-05), so rotate CW x4 to heading 4 (FNCanHit 0EAC: arc of
  // gun 1 = ArcAngle!(0) + heading*45), skip the remaining moves, F + ENTER; further rounds skip + fire
  // Battle Over (2C10) with Life Support broken (G!(2) = 2) -> SUB_2F4B. The fix roll (02FE5) succeeds when
  // RND*100 < skill(26)*10 + 35: member 3 (key 1) with skill 7 always fixes it (SB-09), with -4 never (SB-08).
  'SB-07': [ENC, ['N', 'H', 'H', 'H']],          // hyperspace (80 %) -> Battle Over -> BATTLE REPORT
  'SB-09': [ENC, ['N', 'H', 'H', 'H', ENTER, '1'], (G) => { G[2] = 2; G[1626] = 7; }],
  'SB-08': [ENC, ['N', 'H', 'H', 'H', ENTER, '1'], (G) => { G[2] = 2; G[1626] = -4; }],
  // docking (3DD8): one ship left within 1 cell. ENCLIST 0 = one Freighter at EnX! 14 (0AF0), EnY! 4 or 16 (0A35, RND):
  // close in left x5 and up (the shot is retaken until the freighter spawned north and stayed)
  'SB-02d': [0, ['N', LEFT, LEFT, LEFT, LEFT, LEFT, UP, ENTER, 'N', UP, UP, UP, UP, UP, UP]],
  // Y = board (3EC3-3F20): Terrain! 10, Surprise! 0, Gravity10! 10, BoardCrew! = hull, Breathable! 1, G!(2266) = fuel,
  // Battle Over -> BATTLE REPORT "Docked" -> 2F3C ChainArg! = EnBoardArg! -> 2F48 CHAIN PLBATTLE.STR (PB-01 briefing)
  'SB-02dY': [0, ['N', LEFT, LEFT, LEFT, LEFT, LEFT, UP, ENTER, 'N', UP, UP, UP, UP, UP, UP, 'Y']],
  'SB-06': [ENC, ['N', 'B', 'B', 'B', 'B', 'E', 'E', 'F', ENTER, ...[...Array(3)].flatMap(() => ['N', 'E', 'E', 'E', 'E', 'E', 'E', 'F', ENTER])]],
};

// SB-02d/SB-02dY: the freighter's start row (0A35 EnY! 4 or 16) and its moves are rolls; pinned so the shot is
// reproducible (seeds 1..6 all dock with the scripted moves, 2026-10-16)
// SB-04/07/09: the jump roll (049B4 RND <= 0.8) and the scouts' start cells; seed 3 jumps (?seed= scan 1..5: 3, 4 succeed)
const SEED = { 'SB-02d': 1, 'SB-02dY': 1, 'SB-04': 3, 'SB-07': 3, 'SB-09': 3 };
// hold points of the transient screens (the run freezes there and the shooter is told it is ready):
//   delay = the first delay loop after a PRINTed text (SB-04: 049E3 after "Sucessfull"), chain = the CHAIN out of the
//   module (SB-07: 02F30 after the BATTLE REPORT), idle = the program waits at its next prompt after the last key
//   (SB-09: 0301B "Press ENTER Key" under "Life Support fixed at the last second!")
const HOLD = { 'SB-04': { delay: /Sucessfull\/$/ }, 'SB-07': { chain: true }, 'SB-09': { idle: true } };

export async function prepare(E, screen, gap = 3) {
  const id = Object.keys(SCRIPTS).find((k) => k.toUpperCase() === String(screen).toUpperCase());
  if (!id) throw new Error(`no SPBATTLE dev screen ${screen}`);
  const [enc, script, fix] = SCRIPTS[id];
  await E.state.load('CHARINFO.BAS');
  const f = await E.data.nameFields(); let k = 0;
  for (const [name, first, last] of NAME_ARRAYS) { const arr = E.state.str(name); for (let i = first; i <= last; i++) arr[i] = f[k++]; }
  applySpaceFixture(E.state.G, (n) => E.state.str(n));
  // the SPACE fixture leaves the ship's move/weight base at 0, so SPBATTLE's SUB_6FE6 (0DBA) computes CurMove! = 0
  // and the player never gets a movement step (329C). Values of STARPORT's test ship (0D83-0D95).
  const G = E.state.G; G[46] = 300; G[45] = 200; G[44] = 8;   // MaxWt!, BaseWt!, BaseMove!
  // gun #1 (fitted flag G!(11) = 1 in the SPACE fixture) gets a record (683 + 7n, STARPORT.bas.md G!() layout):
  // type 1 (GunName$(0)), damage 30, ammo capacity 10, weight, accuracy 10, 10 loaded, 1 shot - so the player fires
  Object.assign(G, { 690: 1, 691: 30, 692: 10, 693: 10, 694: 10, 695: 10, 696: 1 });

  if (fix) fix(E.state.G);
  // pinned RANDOMIZE value (basic.js E.devSeed) where the screen depends on a roll; ?seed=n overrides (dev only)
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('seed') : null;
  if (qs !== null) E.devSeed = Number(qs); else if (SEED[id] !== undefined) E.devSeed = SEED[id];

  // 2. SP-00 underlay from SPACE's own code: stop it at its first INKEY$ poll
  const inkey = E.input.inkey.bind(E.input);
  const stop = new Error('spbattle-devjump: SPACE console drawn');
  E.input.inkey = () => { throw stop; };
  try { await new SpaceModule(E, { data: SPACE_DATA }).run(0x0040); } catch (e) { if (e !== stop) throw e; }

  // dev aid: timestamped log of everything PRINTed (E.textLog), to time the transient screens' captures
  const pr = E.text.print.bind(E.text); const t0 = E.timer.now(); E.textLog = [];
  E.text.print = (it, end) => {
    const nl = end === undefined || end === '\n' ? '/' : '';
    E.textLog.push(`${(E.timer.now() - t0).toFixed(1)} @${E.text.row},${E.text.col} ${[].concat(it).map(String).join('')}${nl}`);
    return pr(it, end);
  };

  // SB-00 hold point (the program never stops on its entry text): 00758 PRINT "n EnemyName$(s)" is followed by
  // 00787 OPEN "ENCTABLE" - the run freezes there, so the shot shows the entry text before the comms prompt
  if (id === 'SB-00') {
    const open = E.data.open.bind(E.data);
    E.data.open = (name) => (E.textLog.some((l) => /\(s\)\/$/.test(l)) ? new Promise(() => { if (typeof window !== 'undefined') window.__devReady = true; }) : open(name));
  }

  // SB-06 hold point: freeze at the first delay after the shot report (593F `"making"; n; "hits"`), with the
  // player's fire text, weapon and damage report on screen
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

  // dev aid: the COMMON hand-off at SPBATTLE's CHAIN (2F30 SPACE / 2F48 PLBATTLE, CROSSREF.md §1) -> E.chainLog
  const chain = E.chain; E.chainLog = [];
  E.chain = (name, o) => {
    const g = (i) => E.state.G[i];
    E.chainLog.push({ to: name, ChainArg: g(2214), Terrain: g(2228), Surprise: g(2229), Gravity10: g(2250), BoardCrew: g(2251), Breathable: g(2252), EnFuel: g(2266), LastEnemyType: g(2263) });
    if (hold?.chain) { ready(); return new Promise(() => {}); }
    E.chain = chain; return chain(name, o);
  };

  // 3. the CHAIN contract of SPACE 9043 (CROSSREF.md §1.1): ChainArg! = encounter record
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
