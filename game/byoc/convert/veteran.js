// veteran.js — the Veteran Crew save as a recipe (lane byoc-assets, docs/BYOC.md 3.2; was tools/make_veteran_save.mjs).
//
//   const v = await buildVeteran({ blank, info, names, mission, gmap })
//     blank = the shipped CHARINFO.BAS bytes (a blank new game, DATA_FILES.md section B), info = INFO table values,
//     names = NAME fields, mission = MISSION records (tables as convert_data.py / ./data.js decode them), gmap.json
//   -> { charinfo, charname (Uint8Array), readme (text), log, summary (console lines) }
//
// Pure (no DOM, no node:fs): runs in node (tools/make_veteran_save.mjs writes game/assets/saves/veteran/) and in the
// importer's worker (OPFS saves/veteran/). Deterministic: same tables in, same bytes out.
//
// Starts from the shipped CHARINFO.BAS (a blank new game, DATA_FILES.md §B) and applies, field by field, what the
// original STARPORT code writes when a player recruits, trains, buys and gets a mission, with the values taken from
// INFO.BAS (game/assets/data/INFO.json) at the offsets in decode/pseudo/STARPORT.bas.md. Every write goes through
// set(index, value, source) so README.md lists each changed G!() index with its source. Crew records follow the
// recruitment code (L_557E) and SUB_26A6 with skills/attributes at the levels post-mission training reaches
// (E-Training 7C01..833B: skill cap 8, attributes uncapped). Indexes: CROSSREF.md §2.2 (G!) and §2.3 (crew fields).
import { Files } from '../../engine/files.js';
import { State } from '../../engine/state.js';

// The body below is the former script, unindented on purpose: the README template literal is written verbatim.
export async function buildVeteran({ blank, info, names, mission, gmap }) {
const files = new Files({ storage: null });
files.mem.set('CHARINFO.BAS', blank);
const state = new State(files, gmap);
await state.load();                                  // shipped blank game
const INFO = Array.from(info, Number);               // INFO.BAS = BLOAD &H51F6: element i at DS 0x51F6 + 4i (PyFloat zeros -> 0)
const NAME = names.slice(0, 375);                    // data.nameFields(): 374 fields + the empty trailing one
const MISSION = mission;
const f32 = Math.fround;

// ---- INFO.BAS tables (STARPORT.bas.md Arrays: base DS, count; column f of item i = base + i + f*count) ----
const table = (ds, count) => (i, col) => INFO[(ds - 0x51F6) / 4 + i + col];
const PayTable = table(0x51F6, 14);
const ShipTable = table(0x52DE, 9);
const ShieldTable = table(0x54B2, 5);
const DefHwTable = table(0x54EE, 5);
const MissileKillerTable = table(0x552A, 3);
const GunTable = table(0x554E, 25);
const WeaponTable = table(0x586E, 54);
const HandWeaponTable = table(0x628E, 6);
const SightingTable = table(0x62D6, 4);
const ArmorSuitTable = table(0x6306, 16);
const MiscItemTable = table(0x63C6, 11);
const TrainTable = (cls, slot) => INFO[(0x522E - 0x51F6) / 4 + cls + 4 * slot];   // 2-D (4 classes, 11 slots)
// NAME.json string groups (CROSSREF §2.4)
const Rank$ = (r) => NAME[r - 1];                     // Rank$(1..13) = NAME 0..12
const Skill$ = (s) => NAME[13 + s];
const ClassName$ = ['Marine', 'Pilot', 'Soldier', 'Esper'];
const ShipClassName$ = (i) => NAME[29 + i];
const ShieldName$ = (i) => NAME[42 + i];
const DefHwName$ = (i) => NAME[47 + i];
const MissileKillerName$ = (i) => NAME[52 + i];
const GunName$ = (i) => NAME[55 + i];
const WeaponName$ = (i) => NAME[80 + i];
const HandWeaponName$ = (i) => NAME[134 + i];
const SightingName$ = (i) => NAME[140 + i];
const ArmorSuitName$ = (i) => NAME[144 + i];
const MiscItemName$ = (i) => NAME[160 + i];
const AttrName$ = (i) => NAME[367 + i];

// ---- change log for README.md ----
const log = [];
const G = state.G;
function set(i, v, src, what = '') {
  G[i] = v;
  log.push({ i, v: G[i], src, what });
}
const crewIdx = (m, f) => 1300 + 100 * m + f;           // FNIdx (STARPORT SUB_07C9)
const crew = (m, f) => Math.trunc(G[crewIdx(m, f)] + 0.1);   // FNCrew (SUB_0797) = INT(x + .1)
const setCrew = (m, f, v, src, what) => set(crewIdx(m, f), v, src, what);

// ============================ the squad ============================
// slot 1 = pilot (P), slot 2 = co-pilot (C), slots 3..8 = squad members 1..6 who go INSIDE / into ground combat
// (SUB_1F14; SPACE 2224, 8DB9; SPBATTLE 1D5B, 2166). Attributes in AttrName$ order:
// Strength, Speed, Accuracy, Courage, Willpower, Esper, Intelligence. Skill numbers = Skill$ index (field = s + 16).
const S = { Pilot: 1, Gunner: 2, Scout: 3, Medical: 4, Explosives: 5, Chemical: 6, CodeBreak: 7, Light: 8, Heavy: 9, Repair: 10, Esper: 11, Hand: 12 };
const W = { Gauss: 18, Sniping: 44, D2: 46, Panzer: 38, NeutronGr: 53, CausticMist: 48 };    // WeaponName$ index
const M = { Medkit: 0, RepairKit: 1, HelmetScanner: 2, MotionDetector: 3, SonicTorch: 4, Lockpick: 6, O2Mask: 7, O2Cyl: 8, EnvSuit: 9, RadDetector: 10 };
const O2 = [M.EnvSuit, M.O2Mask, M.O2Cyl];          // INSIDE 0AAD: oxygen = f33 (suit) * f56 (mask) * f40 (cylinder)
const SQUAD = [
  { name: 'Vasquez', role: 'pilot', cls: 1, rank: 10, age: 38, attr: [88, 96, 95, 90, 92, 31, 97],
    skills: { Pilot: 8, Gunner: 8, CodeBreak: 6, Light: 7, Medical: 5, Repair: 6 },
    weapons: [[W.Gauss, 3]], hand: 4, items: [] },
  { name: 'Okafor', role: 'co-pilot / comms', cls: 1, rank: 9, age: 36, attr: [86, 90, 92, 88, 94, 27, 99],
    skills: { Pilot: 8, CodeBreak: 8, Gunner: 8, Light: 6, Medical: 5, Repair: 7 },
    weapons: [[W.Gauss, 3]], hand: 4, items: [] },
  { name: 'Brandt', role: 'engineer', cls: 1, rank: 8, age: 35, attr: [92, 88, 94, 90, 90, 22, 98],
    skills: { Repair: 8, Gunner: 8, Light: 8, Medical: 6, Pilot: 6, CodeBreak: 5 },
    weapons: [[W.Gauss, 3]], hand: 4, items: [...O2, M.SonicTorch] },
  { name: 'Nakamura', role: 'medic', cls: 0, rank: 7, age: 34, attr: [95, 92, 96, 94, 95, 35, 96],
    skills: { Medical: 8, Heavy: 8, Scout: 7, Light: 7, Hand: 7 },
    weapons: [[W.Sniping, 2]], hand: 4, items: [...O2, M.Medkit, M.Medkit] },
  { name: 'Kowalski', role: 'marine', cls: 0, rank: 8, age: 37, attr: [100, 94, 97, 99, 98, 18, 88],
    skills: { Heavy: 8, Light: 8, Hand: 8, Scout: 8, Medical: 6 },
    weapons: [[W.Panzer, 2]], hand: 4, items: [...O2, M.MotionDetector] },
  { name: 'Dubois', role: 'soldier (explosives)', cls: 2, rank: 7, age: 33, attr: [98, 95, 96, 97, 96, 25, 90],
    skills: { Explosives: 8, Heavy: 8, Light: 7, Hand: 7, Chemical: 6, Medical: 5 },
    weapons: [[W.Panzer, 2], [W.NeutronGr, 4]], hand: 4, items: [...O2, M.Lockpick] },
  { name: 'Haddad', role: 'soldier (chemical)', cls: 2, rank: 6, age: 32, attr: [96, 93, 98, 95, 94, 29, 92],
    skills: { Chemical: 8, Heavy: 8, Explosives: 7, Light: 7, Hand: 7, Medical: 5 },
    weapons: [[W.D2, 2], [W.CausticMist, 4]], hand: 4, items: [...O2, M.HelmetScanner] },
  { name: 'Solveig', role: 'esper', cls: 3, rank: 7, age: 31, attr: [85, 97, 95, 92, 100, 100, 98],
    skills: { Esper: 8, Light: 8, Hand: 8, Gunner: 7, Medical: 6 },
    weapons: [[W.Gauss, 3]], hand: 5, items: [...O2, M.RadDetector] },
];
const BEST_SIGHT = 3;    // Compusight Aiming Assistant (35 %)
const BEST_SUIT = 13;    // Electroactive Armor (15 points, 5.7 kg: the best points per kg; Neutronium's 16 points weigh 20.3)

// class rows of TrainTable (basic-training offers and valid post-mission training areas, 5B77 / 8238)
const classSkills = (cls) => { const s = new Set(); for (let k = 1; k <= 10; k++) { const v = TrainTable(cls, k); if (v >= 1 && v <= 12) s.add(v); } return s; };

let weaponSlot = 800, ammoSlot = 1100, itemSlot = 2300;
SQUAD.forEach((c, k) => {
  const m = k + 1, who = `${c.name} (member ${m})`;
  // recruitment L_557E: attributes 56E8 (+ training 7FDA), esper potential 5742 (Esper class needs > 50, 59EE),
  // fields 7..99 cleared 5856, age 5906, status 5930, rank 595A (+ promotions 6177 / 1B48), class 5A80
  for (let a = 0; a <= 6; a++) setCrew(m, a, c.attr[a], a === 5 ? '5742 / 7F6B (cap 100)' : '56E8 / 7FDA', `${who} ${AttrName$(a)}`);
  if (c.cls !== 3 && c.attr[5] > 49) throw new Error(`${c.name}: only an Esper keeps esper potential above 49`);
  setCrew(m, 29, Math.round(c.age * 182.5), '5906 (age in days x2: years = f29 * 0.005479452, 116E)', `${who} age ${c.age}`);
  setCrew(m, 31, 1, '5930', `${who} status Okay`);
  if (c.rank < 1 || c.rank > 13) throw new Error('rank');
  setCrew(m, 34, c.rank, '595A / 6177 / 1B48 (Rank$(1..13))', `${who} rank ${Rank$(c.rank)}`);
  setCrew(m, 35, c.cls, '5A80', `${who} class ${ClassName$[c.cls]}`);
  const allowed = classSkills(c.cls);
  for (const [sk, lvl] of Object.entries(c.skills)) {
    const s = S[sk];
    if (!allowed.has(s)) throw new Error(`${c.name}: ${Skill$(s)} is not in the ${ClassName$[c.cls]} training row`);
    if (lvl > 8) throw new Error('skill cap is 8 (833B)');
    setCrew(m, 16 + s, lvl, '6094 / 82E2-833B (cap 8)', `${who} ${Skill$(s)}`);
  }
  // SUB_26A6 (271A-28B6) derived stats, then HP = max HP (6231)
  const A = (i) => crew(m, i);
  setCrew(m, 16, Math.trunc(f32((A(0) + A(4)) * 0.25 + 0.125)), 'SUB_26A6 271A', `${who} max HP`);
  setCrew(m, 10, Math.trunc((A(2) * 2 + A(3)) / 6 - 25), 'SUB_26A6 2797', `${who} to-hit bonus`);
  setCrew(m, 11, Math.trunc(A(1) * 0.5 - 25), 'SUB_26A6 27EB', `${who} defence bonus`);
  setCrew(m, 13, Math.trunc(A(0) * 0.25 + 8), 'SUB_26A6 2843', `${who} max carried`);
  setCrew(m, 12, Math.trunc((A(0) + A(1)) / 20 + 15), 'SUB_26A6 28B6', `${who} max move`);
  setCrew(m, 15, crew(m, 16), '6231', `${who} HP = max HP`);

  // ---- personal equipment, B-Buy / A-Buy Personal Equipment (L_3874) ----
  c.weapons.forEach(([wi, reloads]) => {      // A-Regular Weapon 3CFF-3EC0: record 800 + 12r
    const s = weaponSlot; weaponSlot += 12;
    const nm = `${who} ${WeaponName$(wi)}`;
    set(s, wi + 1, '3CFF', `${nm}: type`);
    set(s + 9, m, '3D1A', `${nm}: owner`);
    set(s + 1, WeaponTable(wi, 0), '3D38', `${nm}: damage`);
    set(s + 4, WeaponTable(wi, 108), '3D5F', `${nm}: magazine`);
    set(s + 3, G[s + 4], '3D7D', `${nm}: loaded = magazine`);
    set(s + 2, WeaponTable(wi, 54), '3DA2', `${nm}: shots`);
    set(s + 5, f32(WeaponTable(wi, 162) * 10), '3DDB', `${nm}: weight x10`);
    set(s + 6, WeaponTable(wi, 270), '3E05', `${nm}: damage type`);
    set(s + 7, WeaponTable(wi, 432), '3E2F', `${nm}: to-hit`);
    set(s + 8, WeaponTable(wi, 540), '3E57', `${nm}: intimidation`);
    set(s + 10, WeaponTable(wi, 216), '3E98', `${nm}: range`);
    set(s + 11, WeaponTable(wi, 594), '3EC0', `${nm}: weapon skill type`);
    if (crew(m, 32) === 0) setCrew(m, 32, Math.trunc((s - 787) / 12), '3F1F', `${who} selected weapon record`);
    for (let r = 0; r < reloads; r++) {        // B-Ammo 409E-40F3: record 1100 + 3r (G!(501..554) are list scratch, A5CE)
      const a = ammoSlot; ammoSlot += 3;
      set(a, wi + 1, '409E', `${nm}: reload ${r + 1}`);
      set(a + 1, f32(WeaponTable(wi, 324) * 10), '40D6', `${nm}: reload weight x10`);
      set(a + 2, m, '40F3', `${nm}: reload owner`);
    }
  });
  // C-Hand Weapon 4270-430A (no price; item 6 Lightsword refused unless class 3, 4203)
  if (c.hand === 5 && c.cls !== 3) throw new Error('Lightsword is Esper only');
  setCrew(m, 44, f32(HandWeaponTable(c.hand, 6) * 10), '4270', `${who} hand weapon weight x10`);
  setCrew(m, 45, HandWeaponTable(c.hand, 0), '42A7', `${who} ${HandWeaponName$(c.hand)} points`);
  setCrew(m, 90, c.hand + 1, '42D7', `${who} hand weapon ${HandWeaponName$(c.hand)}`);
  setCrew(m, 46, HandWeaponTable(c.hand, 12), '430A', `${who} hand weapon field 46`);
  // D-Sighting Hardware 43E7-4452
  setCrew(m, 41, BEST_SIGHT + 1, '43E7', `${who} ${SightingName$(BEST_SIGHT)}`);
  setCrew(m, 42, f32(SightingTable(BEST_SIGHT, 0) * 10), '441F', `${who} sight weight x10`);
  setCrew(m, 43, SightingTable(BEST_SIGHT, 8), '4452', `${who} sight %`);
  // E-Armor 453E-45D8
  setCrew(m, 47, BEST_SUIT + 1, '453E', `${who} ${ArmorSuitName$(BEST_SUIT)}`);
  setCrew(m, 48, ArmorSuitTable(BEST_SUIT, 0), '456C', `${who} armor points`);
  setCrew(m, 49, ArmorSuitTable(BEST_SUIT, 0), '459B', `${who} armor max`);
  setCrew(m, 91, f32(ArmorSuitTable(BEST_SUIT, 32) * 10), '45D8', `${who} armor weight x10`);
  // F-Miscellaneous 4716-4759: record 2300 + 3r
  c.items.forEach((it) => {
    const s = itemSlot; itemSlot += 3;
    set(s, it + 1, '4716', `${who} ${MiscItemName$(it)}`);
    set(s + 1, f32(MiscItemTable(it, 0) * 10), '473E', `${who} ${MiscItemName$(it)} weight x10`);
    set(s + 2, m, '4759', `${who} ${MiscItemName$(it)} owner`);
  });
});

// carried weight / move, SPACE SUB_7BD5 (07CC2-07F99; STARPORT SUB_9296 recomputes the same on Inspect)
for (let m = 1; m <= 8; m++) {
  const r = crewIdx(m, 0), sgn = Math.sign;
  const worn = G[r + 42] * sgn(G[r + 41]) + G[r + 44] * sgn(G[r + 90]) + G[r + 91] * sgn(G[r + 47]);
  let sum = 0;
  for (let i = 800; i <= 1088; i += 12) if (G[i + 9] === m) sum += sgn(G[i]) * G[i + 5];
  for (let i = 1100; i <= 1397; i += 3) if (G[i + 2] === m) sum += sgn(G[i]) * G[i + 1];
  for (let i = 2300; i <= 2597; i += 3) if (G[i + 2] === m) sum += sgn(G[i]) * G[i + 1];
  set(r + 39, f32(worn), 'SPACE 7CC2', `member ${m} worn weight x10`);
  set(r + 14, Math.trunc(f32(G[r + 39] + sum) / 10), 'SPACE 7EC1', `member ${m} carried kg`);
  let cnt = Math.trunc(G[r + 12] * f32(2 - G[r + 14] / G[r + 13]) + 0.5);
  cnt = Math.max(0, Math.min(cnt, G[r + 12]));
  set(r + 8, Math.trunc(cnt + 0.5), 'SPACE 7F99', `member ${m} current move`);
  if (G[r + 8] < G[r + 12]) throw new Error(`member ${m} is overloaded (${G[r + 14]} kg of ${G[r + 13]})`);
}

// ============================ the ship ============================
// C-Buy Ship -> SUB_29F8 (2A0B-2BAF): the most expensive hull = Warrior (ShipTable price column, 430000 x 1.2)
let SHIP = 0;
for (let i = 1; i < 9; i++) if (ShipTable(i, 27) > ShipTable(SHIP, 27)) SHIP = i;
const ClassNo = ShipTable(SHIP, 0);
set(20, 1, '2A16', 'DropPart1');
set(21, Math.abs(ClassNo > 1 ? 1 : 0), '2A36', 'DropPart2');
set(22, Math.abs(ClassNo > 2 ? 1 : 0), '2A55', 'DropPart3');
set(45, Math.trunc(f32(ShipTable(SHIP, 9) - f32(ShipTable(SHIP, 36) * ShipTable(SHIP, 90)))), '2A9C', 'BaseWt!');
set(46, ShipTable(SHIP, 18), '2AAF', 'MaxWt!');
set(55, ShipTable(SHIP, 36), '2AD5', 'Armor! (hull)');
set(51, ShipTable(SHIP, 45), '2AEA', 'Defence!');
set(43, SHIP + 1, '2AFA', `ship index + 1 = ${ShipClassName$(SHIP)}`);
set(29, ShipTable(SHIP, 54), '2B0F', 'ShipClass! (size)');
set(44, ShipTable(SHIP, 72), '2B24', 'BaseMove!');
set(53, Math.trunc(f32(1 / ShipTable(SHIP, 90))), '2B44', 'ArmorDiv!');
set(52, ShipTable(SHIP, 99), '2B59', 'MaxFuel!');
set(28, ShipTable(SHIP, 108), '2B6C', 'G!(28)');
for (let i = 0; i <= 6; i++) set(i, 1, '2B8F', `${NAME[344 + i]} ok`);
set(19, 1, '2BAF', 'HullCond! ok');
// B-Buy Ships Equipment (SUB_4771)
const GUNS = [24, 23, 21, 20, 19, 12];   // FMC Anti-Ion, Thunderbolt Plasma, Resonant EMP, Ion, Multi-barrel Laser, Antimatter Missile
const GUN_RELOADS = { 12: 3 };
GUNS.forEach((gi, k) => {                // A-Ships Guns 4945-4A7D: record 683 + 7n
  const n = k + 1, ix = 7 * n + 683, nm = `Gun #${n} ${GunName$(gi)}`;
  set(ix, gi + 1, '496B', `${nm}: type`);
  set(ix + 1, GunTable(gi, 0), '4991', `${nm}: damage`);
  set(ix + 2, GunTable(gi, 50), '49BA', `${nm}: ammo capacity`);
  set(ix + 3, f32(GunTable(gi, 75) * 10), '49EF', `${nm}: weight x10`);
  set(ix + 4, GunTable(gi, 175), '4A18', `${nm}: accuracy`);
  set(ix + 5, G[ix + 2], '4A34', `${nm}: loaded = capacity`);
  set(ix + 6, GunTable(gi, 25), '4A59', `${nm}: shots`);
  set(n + 10, 1, '4A7D', `${nm}: fitted / ok`);
});
let shipAmmo = 340;
for (const [gi, cnt] of Object.entries(GUN_RELOADS)) {     // B-Ammo For Missle Weapon 4C0F-4C44 (gun types 1..14)
  for (let r = 0; r < cnt; r++, shipAmmo++) {
    set(shipAmmo, Number(gi) + 1, '4C0F', `${GunName$(gi)} reload ${r + 1}`);
    set(shipAmmo + 30, f32(GunTable(Number(gi), 150) * 10), '4C44', `${GunName$(gi)} reload weight x10`);
  }
}
const SHIELD = 4;                       // C-Shields 4D79-4DE9: Variable Stasis Shield in all four positions
for (let n = 1; n <= 4; n++) {
  const ix = 3 * n + 63;
  set(ix, SHIELD + 1, '4D79', `Shield #${n} ${ShieldName$(SHIELD)}`);
  set(ix + 1, ShieldTable(SHIELD, 10), '4DA7', `Shield #${n} strength`);
  set(ix + 2, f32(ShieldTable(SHIELD, 0) * 10), '4DD5', `Shield #${n} weight x10`);
  set(n + 6, 1, '4DE9', `Shield #${n} fitted`);
}
const DEF = 4;                          // D-Defense Hardware 4EBB-4EE9: Inertialess Drives (move +2, 980D)
set(63, DEF + 1, '4EBB', `DefHardware! ${DefHwName$(DEF)}`);
set(64, DefHwTable(DEF, 10), '4ECE', 'DefHardwarePct!');
set(17, 1, '4ED7', 'DefSysCond!');
set(65, f32(DefHwTable(DEF, 0) * 10), '4EE9', 'defense hardware weight x10');
const MK = 2;                           // E-Missle Killers 4FBE-4FEC: Skynet
set(60, MK + 1, '4FBE', `MissileKiller! ${MissileKillerName$(MK)}`);
set(61, MissileKillerTable(MK, 6), '4FD1', 'MissileKillPct!');
set(18, 1, '4FDA', 'MisKillerCond!');
set(62, f32(MissileKillerTable(MK, 0) * 10), '4FEC', 'missile killer weight x10');
set(55, 1000, '50C8 / 5180 (F-Armor: up to 1000 points)', 'Armor!');
// weight / move, SUB_965F (9665-98A4)
{
  let t = 0;
  for (let i = 60; i <= 75; i += 3) t = f32(G[i + 2] * Math.sign(G[i]) + t);
  t = f32(f32(G[55] / G[53]) * 10 + t);
  for (let i = 340; i <= 369; i++) t = f32(G[i + 30] * Math.sign(G[i]) + t);
  for (let i = 690; i <= 725; i += 7) t = f32(G[i + 3] * Math.sign(G[i]) + t);
  const dh = G[63] * (G[17] === 1 ? 1 : 0);
  const maxMove = G[44] + (dh > 2 ? 1 : 0) + (dh > 4 ? 1 : 0);
  set(48, Math.trunc(t), '9819', 'CargoWt10!');
  set(50, G[48] + G[45] * 10, '9831', 'TotalWt10!');
  let mv = f32((2 - f32(G[48] / (G[46] - G[45])) * 0.1) * maxMove);
  mv = Math.min(Math.max(mv, 0), maxMove, 6);
  set(82, Math.trunc(mv + 0.5), '98A4', 'CurMove!');
  if (G[82] < maxMove) throw new Error(`ship overloaded: cur move ${G[82]} < ${maxMove}`);
}
set(2200, G[52], '2400 (F-Fuel: Fuel! = MaxFuel!)', 'Fuel!');
const SHIP_NAME = 'Valkyrie';          // K-Christen 9F98 (15 chars max, 9F8C)

// ============================ credits and mission ============================
const CREDITS = 50000;                 // SUB_1E98 1ED8-1EF9: hi*30000 + lo
set(78, Math.trunc(CREDITS / 30000), '1EE0', 'CreditsHi!');
set(79, CREDITS - G[78] * 30000, '1EF9', 'CreditsLo!');
// H-Headquarters, first mission (775E-7802): flag = 0*3 + INT(RND*3) -> one of records 0..2; record 0 (vaccine)
const MIS = 0;
set(110 + MIS, 1, '77FF', `mission ${MIS + 1} active`);
MISSION[MIS].n.forEach((v, j) => set(2230 + j, v, '765E-768A (MISSION record ' + MIS + ')', `mission integer ${j + 1}`));
set(2261, G[2240], '76B9', 'SavedCodeA! = MissionCodeA!');
set(2262, G[2236], '76C2', 'SavedCodeB! = MissionCodeB!');
// TributeCount! G!(2264) = 0 at 7797: already 0 in the blank game

// ============================ write ============================
const charinfo = Files.makeBsave(state.toBytes(), state.header.seg, state.header.off);
// CHARNAME as STARPORT 9D0C-9D6D writes it: ShipName$; ","; then each CrewName$; ","; CLOSE adds Ctrl-Z
const charname = `${SHIP_NAME},${SQUAD.map((c) => `${c.name},`).join('')}\x1a`;

// round trip: what the game will BLOAD
const checkFiles = new Files({ storage: null });
checkFiles.mem.set('CHARINFO.BAS', charinfo);
const check = new State(checkFiles, gmap);
await check.load();
for (let i = 0; i < 2601; i++) if (!Object.is(check.G[i], G[i])) throw new Error(`round trip G!(${i}) ${check.G[i]} <> ${G[i]}`);

// ---- README ----
const credits = Math.trunc(G[78] * 30000 + G[79] + 0.5);
const skillList = (m) => { const out = []; for (let s = 1; s <= 12; s++) if (crew(m, 16 + s)) out.push(`${Skill$(s)} ${crew(m, 16 + s)}`); return out.join(', '); };
const crewRows = SQUAD.map((c, k) => {
  const m = k + 1, w = c.weapons.map(([wi, r]) => `${WeaponName$(wi)} (+${r} reloads)`).join(', ');
  const items = c.items.map((it) => MiscItemName$(it)).join(', ') || '-';
  return `| ${m} | ${c.name} | ${c.role} | ${Rank$(c.rank)} | ${ClassName$[c.cls]} | ${crew(m, 15)}/${crew(m, 16)} | ${c.attr.join(' ')} | ${skillList(m)} | ${w}; ${HandWeaponName$(c.hand)}; ${SightingName$(BEST_SIGHT)}; ${ArmorSuitName$(BEST_SUIT)} | ${items} | ${crew(m, 14)}/${crew(m, 13)} kg |`;
}).join('\n');
const fieldRows = log.map((e) => `| ${e.i} | ${e.i >= 1400 && e.i < 2200 ? `${Math.floor((e.i - 1300) / 100)}.${(e.i - 1300) % 100}` : ''} | ${+e.v.toFixed(4)} | ${e.what} | ${e.src} |`).join('\n');
const readme = `# Veteran crew save (lane testsave)

A ready-to-play save game: eight veterans with the best personal gear, a fully fitted ${ShipClassName$(SHIP)}-class ship and an
active first mission, docked at the starport main menu. **Generated** by \`node tools/make_veteran_save.mjs\`; do not
edit by hand (this README is rewritten by the script as well).

- \`CHARINFO.BAS\`: the original BSAVE layout (FD, seg 0x${state.header.seg.toString(16).toUpperCase()}, off 0x1850, 10404 bytes = G!(0..2600) as MBF singles, 1A), built with
  \`game/engine/state.js\`; \`CHARNAME\`: \`ShipName$,\` + 8 \`CrewName$,\` + Ctrl-Z, as STARPORT 9D0C-9D6D writes it.
- Start: double-click **Star Command - Veteran Crew** on the desktop (or \`Play Star Command (Veteran Crew).cmd\`), then
  any key at the title and **1-Play Star Command**. Manual URL: \`http://127.0.0.1:8088/index.html?save=veteran&force=1\`.
  \`force=1\` restores this save on every launch (station maps from earlier runs are forgotten too) and is then dropped
  from the address, so a page reload inside the session keeps what was saved since. Without \`force\` the save is only
  copied when the browser storage has no save yet. The launcher uses 127.0.0.1 instead of localhost: a separate
  browser storage, so the regular game's continuing save is never touched (one save each until v1.3's save slots).
- Base: the shipped CHARINFO.BAS (blank new game). Every changed element is listed below with the STARPORT
  (unless another module is named) offset that writes it in the original, from decode/pseudo/STARPORT.bas.md and the
  INFO.BAS tables (game/assets/data/INFO.json); indexes per decode/pseudo/CROSSREF.md §2.2 / §2.3.
- Nothing is range-checked when a save is loaded (STARCOMM 0078 / STARPORT BLOAD only); the starport's arrival pass
  (10CF-1C06) changes nothing here: no days away (Years!/Days!/visit dates all 0), every age < 60 years, no kills,
  finds or completed missions, so no pay/promotion screens.
- Caps used: skills <= 8 (post-mission training 82E2-833B) and only skills in the member's class row of TrainTable
  (8205-82A7); rank 1..13 (Rank$, 1AD5); attributes have no cap (7FDA), esper potential <= 100 (7F6B-7FA8) and <= 49
  for non-Espers (5742); max HP = INT((Str+Will)/4+.125) (271A); every squad member carries no more than "Max.
  Carried", so their movement is not reduced (SPACE 7F05); the ship's cargo stays within its weight margin
  (CurMove! = max move, 9856).
- Credits are set to ${credits.toLocaleString('en-US')} directly (CreditsHi!/Lo!), not the remainder after buying (the gear is worth far more).
- No Repair Kit: it weighs 100 kg (MiscItemTable 1), more than anyone can carry (Inspect shows \`Weight Carried.%115 kg\`,
  Movement 0); it only adds 35 % to space repairs (SPACE 4446), and Brandt's Ship Repair 8 already gives 80 %.
  Buy one at the starport if wanted. INSIDE needs all three oxygen items (Environment Suit, Oxygen Mask, Oxygen
  Cylinder) per squad member for an unbreathable station (INSIDE 0AAD), so each of members 3..8 carries the set.
- Display limits of the original: SPACE shows the ship's armor as \`ARMOR:999\` (SUB_1A28 caps the printed value at
  999, 1A39); Armor! is 1000.

## Crew

| # | name | role | rank | class | HP | Str Spd Acc Cou Wil Esp Int | skills | weapons / hand / sight / armor | items | carried |
|---|---|---|---|---|---|---|---|---|---|---|
${crewRows}

Slot 1 is the pilot, slot 2 the co-pilot (drop ship, hailing via Code Breaking); slots 3..8 are the squad that goes
inside stations and into ground combat.

## Ship

ISS ${SHIP_NAME}, ${ShipClassName$(SHIP)} class (the most expensive hull at the starport), armor ${G[55]} (the F-Armor maximum), fuel ${G[2200]}/${G[52]},
defence ${G[51]} %, move ${G[82]} (cargo ${G[48] / 10} t of ${G[46] - G[45]} t).
Guns: ${GUNS.map((g, k) => `#${k + 1} ${GunName$(g)}`).join(', ')} (${GUN_RELOADS[12]} reloads for the missile).
Shields: 4 x ${ShieldName$(SHIELD)}. Defense: ${DefHwName$(DEF)}. Missile killer: ${MissileKillerName$(MK)}.
Mission: record ${MIS} of MISSION ("${MISSION[MIS].text[0].slice(0, 60).replace(/\s+/g, ' ')}...").

## Every changed G!() element

Crew elements also show member.field (G!(1300 + 100*member + field)). Values are as stored (single precision).

| G!() | m.f | value | what | source |
|---|---|---|---|---|
${fieldRows}
`;
const summary = [`CHARINFO.BAS ${charinfo.length} bytes, CHARNAME ${charname.length} bytes, ${log.length} writes`,
  `ship ${ShipClassName$(SHIP)} armor ${G[55]} cargo ${G[48]} move ${G[82]}; credits ${credits}`];
for (let m = 1; m <= 8; m++) summary.push(`  ${m} ${SQUAD[m - 1].name.padEnd(9)} ${Rank$(crew(m, 34)).padEnd(14)} HP ${crew(m, 15)}/${crew(m, 16)} carried ${crew(m, 14)}/${crew(m, 13)} move ${crew(m, 8)}/${crew(m, 12)}`);
return { charinfo, charname: Uint8Array.from(charname, (c) => c.charCodeAt(0) & 255), readme: readme.replace(/\r?\n/g, '\n'), log, summary };
}
