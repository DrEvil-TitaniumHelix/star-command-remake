export const SPACE_FIXTURE_NAMES = ['Gruber', 'Lane', 'Ortiz', 'Haas', 'Kim', 'Moss', 'Reyes', 'Tanaka'];

export function applySpaceFixture(G, S) {
  for (const i of [0, 1, 2, 3, 4, 5, 19, 20, 21, 22]) G[i] = 1;
  G[11] = 1;
  G[29] = 1;
  G[43] = 2;
  G[52] = 900; G[2200] = 900;
  G[53] = 20; G[55] = 300;
  G[89] = 1; G[90] = 1;
  G[2227] = 1;
  for (let m = 1; m <= 8; m++) {
    const r = 1300 + 100 * m;
    for (let a = 0; a <= 6; a++) G[r + a] = 50;
    G[r + 15] = 20; G[r + 16] = 20;
    G[r + 12] = 10; G[r + 13] = 50;
    G[r + 31] = 1;
    G[r + 34] = 3; G[r + 35] = m === 1 ? 1 : 0;
    for (let k = 17; k <= 28; k++) G[r + k] = 2;
  }
  G[1300 + 100 + 17] = 5;
  G[1300 + 200 + 23] = 4;
  G[800] = 3; G[809] = 3;
  G[1100] = 3; G[1102] = 3;
  G[2300] = 2; G[2302] = 4;
  const crew = S('CrewName$');
  SPACE_FIXTURE_NAMES.forEach((n, i) => { crew[i + 1] = n; });
  S('ShipName$')[0] = 'Valiant';
}
