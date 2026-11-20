import assert from 'node:assert/strict';
import {run, chain} from './chain.js';
import {Timer} from './timer.js';
for (const [from,to] of [['PLBATTLE','INSIDE'],['SPBATTLE','SPACE'],['SPBATTLE','PLBATTLE']]) {
const tm = new Timer(); let ms = 0; tm.clock = () => ms; tm.frame = async () => { ms += 50; };
const keys = [];
const E = { timer: tm, input: { inkey: () => keys.shift() ?? '', flush: () => { keys.length = 0; } }, state: { G: new Float32Array(100) }, text: { screenText: () => ['BATTLE REPORT'] } };
E.state.G[88] = 188; E.chain = chain;
const mods = { [from.toLowerCase()]: { default: async () => chain(to+'.EXE') }, [to.toLowerCase()]: { default: async () => ms } };
const go = () => run(E, from, {}, async (f) => mods[f]);
const held = await go();
assert.ok(held > 2700 && held < 3000, `held ${held} ms`);
ms = 0; keys.push('x'); tm.frame = async () => { ms += 50; if ([300,650].includes(ms)) keys.push('x'); };
const early = await go();
assert.ok(early > 2700 && early < 3000, `early keys ignored, held ${early} ms`);
ms = 0; tm.frame = async () => { ms += 50; if (ms === 1000) keys.push('x'); };
assert.equal(await go(), 1000, 'key ends the hold');
ms = 0; E.text.screenText = () => ['You are on a wide taxiway'];
assert.equal(await go(), 0, 'no report, no hold');
E.text.screenText = () => ['BATTLE REPORT'];
assert.equal(await run(E, to, {}, async () => ({default:async()=>ms})),0,'report text alone does not hold a completed module');
ms = 0; mods.startup = { default: async () => 'title' }; tm.frame = async () => { ms += 50; if (ms === 1000) chain('STARCOMM'); };
assert.equal(await go(), 'title', 'load during the hold restarts at the title');
delete mods.startup;
console.log(`chain: ${from} to ${to} report held 22 delay units, early keys ignored, later key ends it, no report no hold pass`);
}
{
const E = { input: {}, text: { screenText: () => [] }, afterEnd: async () => { if (!n++) chain('STARCOMM'); } }, seen = []; let n = 0;
const mods = { spbattle: { default: async () => { seen.push('dead'); return 'END'; } }, startup: { default: async () => 'title' } };
assert.equal(await run(E, 'SPBATTLE', {}, async (f) => mods[f]), 'title', 'a load after END restarts at the title');
assert.equal(await run(E, 'SPBATTLE', {}, async (f) => mods[f]), 'END');
console.log('chain: a module that ends can be left by a restart pass');
}
