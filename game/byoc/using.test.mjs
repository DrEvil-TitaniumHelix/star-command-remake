import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { using } from '../engine/basic.js';
import { Text } from '../engine/text.js';

const cases = [['+##', 5, ' +5'], ['+##', -3, ' -3'], ['+##', 25, '+25'], ['+##', -25, '-25'], ['+##', 0, ' +0'], ['+##', 125, '%+125'],
  ['+##', -0.3333, ' -0'], ['##', -0.3333, '-0'], ['###', -0.6667, ' -1'], ['##', 7, ' 7'], ['#.#', 2.5, '2.5'], ['###', 12.5, ' 13'], ['##', 123, '%123']];
for (const [f, v, want] of cases) assert.equal(using(f, v), want, `PRINT USING "${f}"; ${v}`);

const shown = [];
Text.prototype.printUsing.call({ print: (s) => shown.push(s) }, '+##', -3);
Text.prototype.printUsing.call({ print: (s) => shown.push(s) }, '## ##', [4, 12]);
assert.deepEqual(shown, [' -3', ' 4 12']);

const at = (rel) => new URL(rel, new URL('../modules/starport.js', import.meta.url)).href;
const src = readFileSync(new URL('../modules/starport.js', import.meta.url), 'utf8')
  .replace("import { flow } from './starport/flow.js';", 'const flow = (rt) => rt;')
  .replace(/from '(\.[^']+)'/g, (_, rel) => `from '${at(rel)}'`);
const { default: starport } = await import('data:text/javascript,' + encodeURIComponent(src));
const port = [];
const rt = await starport({ text: { print: (s, end) => { if (end === ';') port.push(s); } } }, {});
rt.printUsing('+##', 5, true); rt.printUsing('+##', -0.3333, true); rt.printUsing('#######', 119999, true);
assert.deepEqual(port, [' +5', ' -0', ' 119999']);
console.log('print using: the sign is printed directly before the digits, a leading + adds one position, a negative value that rounds to zero keeps its minus; same in the starport runtime');
