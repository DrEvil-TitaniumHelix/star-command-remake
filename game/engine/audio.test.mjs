import assert from 'node:assert/strict';
import { Audio } from './audio.js';
import { Settings } from './settings.js';
const memory = new Map(), storage = { getItem: k => memory.get(k), setItem: (k, v) => memory.set(k, v) };
const nodes = [];
const ctx = { state: 'running', currentTime: 0, destination: {},
  createGain: () => ({ gain: {}, connect: d => d }),
  createOscillator: () => { const o = { frequency: {}, connect: g => g, start() {}, stop(t) { if (t === undefined) o.stopped = true; } }; nodes.push(o); return o; } };
const make = s => { const a = new Audio(s); a.ctx = ctx; return a; };
const count = async (s, f) => { nodes.length = 0; const a = make(s); await f(a); a.stopAll(); return nodes.length; };
const tune = a => { a.play('MBL64CDE'); }, fx = a => { a.sound(440, 1); a.beep(); };
const s = new Settings({ storage });
assert.deepEqual([await count(s, tune), await count(s, fx)], [3, 2]);
s.set('music', false);
assert.deepEqual([await count(s, tune), await count(s, fx)], [0, 2]);
s.set('music', true); s.set('effects', false);
assert.deepEqual([await count(s, tune), await count(s, fx)], [3, 0]);
s.set('effects', true); s.set('sound', false);
assert.deepEqual([await count(s, tune), await count(s, fx)], [0, 0]);
s.set('sound', true);
const r = new Settings({ storage });
assert.equal(r.values.sound, true);
assert.deepEqual([await count(r, tune), await count(r, fx)], [3, 2]);
r.set('music', false);
const a = make(r); a.sound(440, 1); r.values.music = true; a.play('MBL64C'); r.set('effects', false); a.silence();
assert.deepEqual(nodes.slice(-2).map(o => [o.kind, !!o.stopped]), [['effects', true], ['music', false]]);
a.stopAll();
assert.equal(new Settings({ storage }).hear('music'), true);
console.log('audio: music, effects and master switches, persistence, silence passed');
