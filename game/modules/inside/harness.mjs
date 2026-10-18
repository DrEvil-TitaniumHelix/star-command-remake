// harness.mjs — run the INSIDE module headless under node with the real engine parts and a virtual clock.
// Dev/debug only (the acceptance screenshots come from Chrome). Usage:
//   node game/modules/inside/harness.mjs <IN-id> [out.png] [virtualSeconds=60]
// Prints the text screen (40x25) and writes the framebuffer as a 640x400 PNG through the EGA palette.
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { Framebuffer, EGA_RGB } from '../../engine/display.js';
import { Gfx } from '../../engine/gfx.js';
import { Text } from '../../engine/text.js';
import { Atlas, Sprites } from '../../engine/sprites.js';
import { Input } from '../../engine/input.js';
import { Files } from '../../engine/files.js';
import { State } from '../../engine/state.js';
import { Data } from '../../engine/data.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [screen = 'IN-02', out = null, secs = '60', seed] = process.argv.slice(2);
if (seed) globalThis.__insideSeed = Number(seed);

function readIndexedPng(buf) {
  let p = 8, w, h; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('latin1', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat)), px = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) px.set(raw.subarray(y * (w + 1) + 1, (y + 1) * (w + 1)), y * w);
  return px;
}
function writePng(path, fb) {
  const W = 640, H = 400, raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    for (let x = 0; x < W; x++) {
      const c = EGA_RGB[fb.attr2ega[fb.point(x >> 1, y >> 1)]];
      raw.set(c, y * (W * 3 + 1) + 1 + 3 * x);
    }
  }
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
  writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}

// virtual clock: every wait advances time immediately (setImmediate keeps the event loop turning)
let vt = 0;
const tick = () => new Promise((r) => setImmediate(r));
const timer = {
  stdDelay: 188,
  now: () => Math.fround(Math.floor((43200 + vt) * 18.2065) / 18.2065),
  frame: async () => { vt += 1 / 60; await tick(); },
  wait: async (s) => { vt += Math.max(0, s); await tick(); },
  delayLoop: async (n) => { vt += n / (188 * 4); await tick(); },
};
globalThis.window = globalThis;
const meta = JSON.parse(readFileSync(here('../../assets/atlas.json'), 'utf8'));
const atlas = new Atlas(meta, readIndexedPng(readFileSync(here('../../assets/atlas.png'))));
const fb = new Framebuffer(1);
const files = new Files({ baseDir: here('../../assets/files'), storage: null });
const E = {
  fb, gfx: new Gfx(fb), text: new Text(fb, JSON.parse(readFileSync(here('../../assets/font8x8.json'), 'utf8'))),
  sprites: new Sprites(fb, atlas), atlas, input: new Input(), files,
  state: new State(files, JSON.parse(readFileSync(here('../../assets/gmap.json'), 'utf8'))),
  data: new Data(files), timer,
  audio: { play() {}, queue: () => 0, sound() {}, beep() {} },
  chain: (m) => { console.log(`CHAIN ${m}`); return new Promise(() => {}); },
};
E.screen = (m) => { fb.screen(m); E.text.resetColors(); E.text.row = 1; E.text.col = 1; };

const mod = await import('../inside.js');
let err = null;
// RETURN=1: when the module CHAINs to PLBATTLE, simulate a won fight (PLBATTLE leaves InBattle! = 1 and
// BattleWon! = G!(2254) = 1) and start a fresh INSIDE instance on the same engine state (the return path 0823/0D40)
if (process.env.RETURN) {
  globalThis.__keepChain = true;
  E.chain = (m) => {
    console.log(`CHAIN ${m} -> simulated won battle, back to INSIDE`);
    E.state.G[2255] = 1; E.state.G[2254] = 1;
    E.chain = (m2) => { console.log(`CHAIN ${m2}`); return new Promise(() => {}); };
    mod.default(E, {}).catch((e) => { err = e; });
    return new Promise(() => {});
  };
}
mod.default(E, { screen }).catch((e) => { err = e; });
while (vt < Number(secs) && !err) await timer.wait(0.05);
if (err) console.log('ERROR', err.stack);
// text dump: a cell shows a char when its 8x8 pixels match a glyph exactly (fg 3 on 0)
const font = JSON.parse(readFileSync(here('../../assets/font8x8.json'), 'utf8')).glyphs;
const key = new Map(); font.forEach((g, c) => { if (c >= 32 && c < 127) key.set(g.join(','), String.fromCharCode(c)); });
for (let r = 0; r < 25; r++) {
  let line = '';
  for (let c = 0; c < 40; c++) {
    const rows = []; let ok = true;
    for (let y = 0; y < 8 && ok; y++) { let b = 0; for (let x = 0; x < 8; x++) { const v = fb.point(c * 8 + x, r * 8 + y); if (v !== 0 && v !== 3) ok = false; b = (b << 1) | (v === 3 ? 1 : 0); } rows.push(b); }
    line += ok ? (key.get(rows.join(',')) ?? '#') : '#';
  }
  console.log(String(r + 1).padStart(2), line);
}
console.log(`virtual time ${vt.toFixed(1)} s`);
if (out) writePng(out, fb);
process.exit(0);
