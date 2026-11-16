import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('./devjump.js', import.meta.url), 'utf8'), re = new RegExp(src.match(/'SB-04': \{ delay: \/(.+?)\/ \}/)[1]);
for (const l of ['@23,3 Successful/', '@23,3 Sucessfull/']) assert.ok(re.test(l), l);
console.log('devjump: SB-04 stops on either spelling of Successful pass');
