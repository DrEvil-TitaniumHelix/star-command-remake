import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { convertText, convertData } from './convert/data.js';
import { TEXT } from './convert/lists.js';

const bytes = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const source = '\r\nEmpty Coridor\r\ncoridor CORIDOR\r\nCorridor corridors Coridora\r\nInacessable Diety\r\n\xe9\r\n\x1a';
const expected = ['', 'Empty Corridor', 'corridor CORRIDOR', 'Corridor corridors Coridora', 'Inacessable Diety', '\xe9'];
for (let i = 1; i <= 7; i++) assert.deepEqual(convertText(`MES-${i}`, bytes(source)).lines, expected);
assert.equal(expected[1].length, 14);
for (const name of ['NAME', 'CHARNAME']) assert.deepEqual(convertText(name, bytes('"Coridor",coridor,CORIDOR,\x1a')).fields, ['Corridor', 'corridor', 'CORRIDOR']);
for (const [name, count, key] of [['ENCINFO', 27, 'c'], ['ENCLIST', 3, 'n']]) {
  const nums = Array.from({ length: count }, (_, i) => i - 1);
  assert.deepEqual(convertText(name, bytes('"Coridor",' + nums.join(',') + '\r\n\x1a')).records, [{ name: 'Corridor', [key]: nums }]);
}
const nums = Array.from({ length: 15 }, (_, i) => i);
assert.deepEqual(convertText('MISSION', bytes('"Coridor","coridor",' + nums.join(',') + '\r\n\x1a')).records, [{ text: ['Corridor', 'corridor'], n: nums }]);
const input = bytes(source), copy = input.slice();
const raw = convertData(() => input).next().value;
assert.deepEqual(raw.bytes, bytes(expected.join('\r\n') + '\r\n\x1a'));
assert.deepEqual(input, copy);
assert.deepEqual(convertText('MES-1', raw.bytes).lines, expected);
assert.deepEqual(convertData(() => raw.bytes).next().value.bytes, raw.bytes);
console.log('spelling: shared text correction, case, boundaries, records, Latin-1, CRLF, EOF and idempotence passed');

if (process.env.SC_ORIGINALS) {
  const read = (n) => new Uint8Array(readFileSync(`${process.env.SC_ORIGINALS}/${n}`));
  const changed = [];
  for (const out of convertData(read)) {
    if (!out.path.startsWith('files/')) continue;
    const name = out.path.slice(6), before = read(name);
    if (!TEXT.includes(name)) { assert.deepEqual(out.bytes, before, name); continue; }
    const a = Buffer.from(before).toString('latin1'), b = Buffer.from(out.bytes).toString('latin1');
    assert.doesNotMatch(b, /\bcoridor\b/i, name);
    assert.equal(b, a.replace(/\bCoridor\b/g, 'Corridor'), name);
    if (a !== b) changed.push(name);
    if (name.startsWith('MES-')) {
      const old = a.split('\r\n'), next = b.split('\r\n');
      assert.equal(next.length, old.length, name);
      old.forEach((s, i) => {
        if (s !== next[i]) { assert.equal(name, 'MES-1'); assert.equal(i, 1); assert.equal(s.length, 13); assert.equal(next[i].length, 14); }
        else assert.equal(next[i].length, s.length);
      });
    }
  }
  assert.deepEqual(changed, ['MES-1']);
  console.log('spelling originals: only MES-1 line 2 changes (13 to 14 columns); every other record, delimiter and binary is unchanged');
}
