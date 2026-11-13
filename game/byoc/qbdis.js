import { decode } from './dis16.js';
import { fmt, Counter } from './py.js';

const CSBASE = 0x10;

export function mzLoad(f) {
  const w = (o) => f[o] | (f[o + 1] << 8);
  const cblp = w(2), cp = w(4), crlc = w(6), cparhdr = w(8);
  const hdr = cparhdr * 16;
  const size = cblp ? (cp - 1) * 512 + cblp : cp * 512;
  const lfarlc = w(24);
  const relocs = [];
  for (let i = 0; i < crlc; i++) relocs.push([w(lfarlc + 4 * i), w(lfarlc + 4 * i + 2)]);
  return { raw: f, lm: f.subarray(hdr, Math.min(size, f.length)), cs: w(22), ip: w(20), ss: w(14), sp: w(16), relocs, hdr };
}

const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(' ');

export function qbdis(exe, rtNames, inlineArgs) {
  const lm = mzLoad(exe).lm;
  const codepar = lm[2] | (lm[3] << 8);
  const cstart = 0x40, cend = cstart + codepar * 16;
  const code = lm.subarray(0, Math.min(cend, lm.length));
  const clen = code.length;
  const at = (i) => code[i];
  const slice = (a, b) => code.subarray(Math.min(a, clen), Math.min(b, clen));
  const word = (i) => code[i] | (code[i + 1] << 8);
  const INLINE = {};
  for (const [k, v] of Object.entries(inlineArgs)) if (!k.startsWith('_')) INLINE[k] = v;
  function inlineLen(nm, pos) {
    const spec = INLINE[nm];
    if (spec === undefined || spec === null) return [0, ''];
    if (typeof spec === 'number') return [spec, Array.from(slice(pos + 3, pos + 3 + spec), (b) => fmt('#%02X', b)).join(' ')];
    const b0 = pos + 3 < cend ? at(pos + 3) : 0;
    if (spec === '1+b0') {
      const n = 1 + b0;
      return [n, fmt('n=%d types=%s', b0, Array.from(slice(pos + 4, pos + 3 + n), (b) => fmt('%02X', b)).join(' '))];
    }
    if (spec === '1+2*b0') {
      const n = 1 + 2 * b0; const tgts = [];
      for (let i = 0; i < b0; i++) if (pos + 6 + 2 * i <= cend) tgts.push(word(pos + 4 + 2 * i));
      return [n, fmt('n=%d -> %s', b0, tgts.map((t) => fmt('%05X', t + CSBASE)).join(' '))];
    }
    throw new Error('inline spec ' + spec);
  }
  const lines = []; const rt = new Counter(); let pos = cstart;
  while (pos < cend) {
    if (at(pos) === 0xcd && pos + 2 < cend && [0x3d, 0x3e, 0x3f].includes(at(pos + 1))) {
      const g = at(pos + 1), n = at(pos + 2);
      if (g === 0x3d && n === 0 && pos + 5 <= cend) {
        const w = word(pos + 3);
        lines.push(fmt('%05X  %-20s %s', pos, hex(slice(pos, pos + 5)), fmt('CALLFAR RT3D_FAR[%04X]', w)));
        rt.inc(fmt('RT3D_FAR[%04X]', w)); pos += 5;
      } else {
        const nm = fmt('RT%02X_%02X', g, n);
        const [extra, arg] = inlineLen(nm, pos);
        const lab = rtNames[nm] || '';
        const hexs = hex(slice(pos, pos + 3 + Math.min(extra, 6))) + (extra > 6 ? ' ..' : '');
        lines.push(fmt('%05X  %-20s %s', pos, hexs, 'CALL ' + nm + (arg ? ' ' + arg : '') + (lab ? '   ; ' + lab : '')));
        rt.inc(nm); pos += 3 + extra;
      }
      continue;
    }
    const ins = decode(code, pos, Math.min(pos + 15, clen));
    if (ins === null) { lines.push(fmt('%05X  %-20s db 0x%02x', pos, hex(slice(pos, pos + 1)), at(pos))); pos += 1; continue; }
    lines.push(fmt('%05X  %-20s %s %s', pos, hex(slice(pos, pos + ins.size)), ins.mnemonic, ins.opStr));
    pos += ins.size;
  }
  return lines.join('\n') + '\n\n; runtime call usage\n' + rt.most_common().map(([k, v]) => fmt('%-16s %d', k, v)).join('\n') + '\n';
}
