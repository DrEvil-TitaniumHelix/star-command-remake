// fixture.js — dev-jump save state for the SP-* acceptance screenshots (lane build-startup).
// Applied on top of the shipped CHARINFO.BAS (a blank game: no ship, no fuel, no crew). Every index is from
// decode/pseudo/CROSSREF.md §2.2 / §2.3; values are a plausible "just left the starport" state, not a DOSBox save.
// TODO(acceptance): replace with a DOSBox save captured at the same point once owner/coordinator provide one.

export const SPACE_FIXTURE_NAMES = ['Gruber', 'Lane', 'Ortiz', 'Haas', 'Kim', 'Moss', 'Reyes', 'Tanaka'];

export function applySpaceFixture(G, S) {
  for (const i of [0, 1, 2, 3, 4, 5, 19, 20, 21, 22]) G[i] = 1;   // Engine, Retros, Life Suprt, Power, Commun, Computer, Hull Int., drop-ship parts
  G[11] = 1;                       // Gun #1 fitted
  G[29] = 1;                       // ShipClass! -> SHIP-2.BAS
  G[43] = 2;                       // ship index + 1
  G[52] = 900; G[2200] = 900;      // MaxFuel!, Fuel!
  G[53] = 20; G[55] = 300;         // ArmorDiv!, Armor!
  // StdDelay!/Delay! (G!(86)/G!(88)) keep the shipped 188
  G[89] = 1; G[90] = 1;            // UseEGA!, EGA detected
  G[2227] = 1;                     // EntryMode! = arriving from the starport
  for (let m = 1; m <= 8; m++) {
    const r = 1300 + 100 * m;
    for (let a = 0; a <= 6; a++) G[r + a] = 50;          // attributes (field 0 <> 0 = slot occupied)
    G[r + 15] = 20; G[r + 16] = 20;                      // HP / max HP
    G[r + 12] = 10; G[r + 13] = 50;                      // max movement, max weight (PLBATTLE derives field 8 = current move from them, 0961C)
    G[r + 31] = 1;                                       // status Okay
    G[r + 34] = 3; G[r + 35] = m === 1 ? 1 : 0;          // rank, class (member 1 = pilot)
    for (let k = 17; k <= 28; k++) G[r + k] = 2;         // skill levels
  }
  G[1300 + 100 + 17] = 5;          // pilot skill
  G[1300 + 200 + 23] = 4;          // comms skill (member 2)
  G[800] = 3; G[809] = 3;          // squad weapon record 800: type 3 (WeaponName$(2)), owner slot 3 (member 1)
  G[1100] = 3; G[1102] = 3;        // ammo record 1100 for weapon type 3, owner 3
  G[2300] = 2; G[2302] = 4;        // misc item record 2300: type 2 (MiscItemName$(1)), owner 4
  const crew = S('CrewName$');
  SPACE_FIXTURE_NAMES.forEach((n, i) => { crew[i + 1] = n; });
  S('ShipName$')[0] = 'Valiant';
}
