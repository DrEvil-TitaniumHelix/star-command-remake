import { bsaveBody, convertText } from './data.js';
import { Files } from '../../engine/files.js';
import { State } from '../../engine/state.js';

export function newSave(gmap) {
  const s = new State(new Files({ storage: null }), gmap);
  for (const [i, v] of [[78, 3], [79, 5000], [83, 27], [2214, 2], [2216, 28], [2217, 2], [2218, 7], [2219, 7], [2220, 6], [2221, 6]]) s.G[i] = v;
  return Files.makeBsave(s.toBytes(), s.header.seg, s.header.off);
}

function body(b, sizes) {
  const [h, d] = bsaveBody(b);
  if (!sizes.includes(h.len) || d.length !== h.len || (b.length !== h.len + 7 && (b.length !== h.len + 8 || b.at(-1) !== 0x1a))) throw new Error('invalid saved image');
  return d;
}

export function saveRead(read, gmap, allowNewCrew = false) {
  const files = new Map();
  try {
    const b = read('CHARINFO.BAS');
    body(b, [10404]);
    if ((b[3] | b[4] << 8) !== 0x1850 || convertText('CHARNAME', read('CHARNAME')).fields.length !== 9) throw new Error('invalid crew save');
  } catch {
    if (!allowNewCrew) throw Object.assign(new Error('The crew save in this copy is damaged. Choose an intact copy, or explicitly import with a new crew. Your existing browser saves will be kept.'), { code: 'crew' });
    files.set('CHARINFO.BAS', newSave(gmap));
    files.set('CHARNAME', new TextEncoder().encode(','.repeat(9) + '\x1a'));
  }
  for (let i = 1; i <= 7; i++) {
    for (const stem of ['IN', 'INMAP']) {
      const n = `${stem}-${i}.BAS`;
      try {
        const d = body(read(n), stem === 'INMAP' ? [8700] : [1, 5, 7].includes(i) ? [5002, 5502] : [5502]);
        if (stem === 'INMAP' && ((d[0] | d[1] << 8) !== 370 || (d[2] | d[3] << 8) !== 185)) throw new Error('invalid map picture');
      } catch {
        throw new Error(`${n} is not a complete saved map; choose a copy with intact station maps`);
      }
    }
  }
  return (n) => files.get(n) ?? read(n);
}
