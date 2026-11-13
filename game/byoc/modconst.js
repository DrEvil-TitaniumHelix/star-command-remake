import { mzLoad } from './qbdis.js';

const hx = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join(' ');
const latin1 = (b) => Array.from(b, (x) => String.fromCharCode(x)).join('');

export function mbfSingle(b) {
  const e = b[3];
  if (e === 0) return 0.0;
  const s = b[2] & 0x80 ? -1.0 : 1.0;
  const m = (((b[2] | 0x80) << 16) | (b[1] << 8) | b[0]) / (1 << 24);
  return s * m * 2.0 ** (e - 128);
}
export function mbfDouble(b) {
  const e = b[7];
  if (e === 0) return 0.0;
  const s = b[6] & 0x80 ? -1.0 : 1.0;
  let v = 0n;
  for (let i = 6; i >= 0; i--) v = (v << 8n) | BigInt(i === 6 ? b[6] | 0x80 : b[i]);
  const m = Number(v) / 2 ** 56;
  return s * m * 2.0 ** (e - 128);
}

export function parse(exe, file = '') {
  const m = mzLoad(exe); const lm = m.lm;
  const w = (o) => lm[o] | (lm[o + 1] << 8);
  const hw = Array.from({ length: 32 }, (_, i) => w(2 * i));
  const cend = 0x40 + hw[1] * 16;
  const out = { file, lm_len: lm.length, hdr: m.hdr, code_end: cend, header_words: hw.map((x) => '0x' + x.toString(16)),
    data_start: hw[15], data_end: hw[16], common_start: hw[20], common_len: hw[21] };
  const blocks = []; let p = hw[27] * 16;
  if (hw[26] !== hw[27]) p = hw[26] * 16;
  while (p + 16 <= lm.length) {
    const bid = w(p), n = w(p + 2), ln = w(p + 4);
    if (bid < 0x16 || bid > 0x30 || lm[p + 11] !== 0x40) break;
    blocks.push({ id: bid, n, len: ln, off: p, data: lm.subarray(p + 16, Math.min(p + 16 + ln, lm.length)) });
    p = p + 16 + Math.floor((ln + 15) / 16) * 16;
  }
  out.blocks = blocks.map((b) => ({ id: b.id, n: b.n, len: b.len, off: b.off }));
  const nameOff = hw[28] * 16, initOff = hw[29] * 16;
  for (const b of blocks) {
    if (b.off === nameOff) b.kind = 'NAME';
    else if (b.off === initOff) b.kind = 'INIT';
    else if (b.off === hw[27] * 16) b.kind = 'A';
    else if (b.off < hw[27] * 16) b.kind = 'OFS';
    else if (nameOff < b.off && b.off < initOff) b.kind = 'DATA';
    else if (b.off > initOff) b.kind = 'LINES';
  }
  let initRaw = [];
  for (const b of blocks) {
    const d = b.data; const dw = (i) => d[i] | (d[i + 1] << 8);
    if (b.kind === 'NAME') { const z = d.indexOf(0); out.source_name = latin1(z < 0 ? d : d.subarray(0, z)); }
    else if (b.kind === 'A') out.blockA = hx(d);
    else if (b.kind === 'OFS') { out.ofs = []; for (let i = 0; i < d.length - 1; i += 2) out.ofs.push(dw(i)); }
    else if (b.kind === 'DATA') {
      const recs = []; let i = 0;
      while (i + 2 <= d.length) {
        const line = dw(i); i += 2;
        if (line === 0xffff) { recs.push({ line: null, text: hx(d.subarray(i)), note: 'terminator' }); break; }
        const j = d.indexOf(0, i);
        if (j < 0) throw new Error('modconst: DATA record without NUL');
        recs.push({ line, text: latin1(d.subarray(i, j)) }); i = j + 1;
      }
      out.data = recs;
    } else if (b.kind === 'INIT') {
      const recs = []; let i = 0;
      while (i + 4 <= d.length) {
        const ln = dw(i), ad = dw(i + 2);
        if (ln === 0) { out.init_tail = hx(d.subarray(i)); break; }
        recs.push({ off: b.off + 16 + i, len: ln, addr: ad, payload: d.subarray(i + 4, i + ln) }); i += ln;
      }
      initRaw = recs;
    } else if (b.kind === 'LINES') {
      out.lines = []; for (let i = 0; i < d.length - 3; i += 4) out.lines.push([dw(i), dw(i + 2)]);
    }
  }
  const byaddr = new Map(); for (const r of initRaw) byaddr.set(r.addr, r);
  const items = []; const used = new Set();
  for (const r of initRaw) {
    if (used.has(r.addr)) continue;
    const pl = r.payload, n = pl.length; const pw = (i) => pl[i] | (pl[i + 1] << 8);
    if (n === 4) {
      const L = pw(0), P = pw(2);
      if (L === 0 && P === r.addr + 4) { items.push({ kind: 'str', addr: r.addr, body_addr: P, len: 0, text: '', pad: '', off: r.off }); continue; }
      if (L > 0 && byaddr.has(P) && L <= byaddr.get(P).len - 4 && byaddr.get(P).len - 4 <= L + 1 && P === r.addr + 4) {
        const body = byaddr.get(P).payload;
        items.push({ kind: 'str', addr: r.addr, body_addr: P, len: L, text: latin1(body.subarray(0, L)), pad: hx(body.subarray(L)).replace(/ /g, ''), off: r.off });
        used.add(P); continue;
      }
      items.push({ kind: 'single', addr: r.addr, bytes: hx(pl), value: mbfSingle(pl), off: r.off });
    } else if (n === 8) items.push({ kind: 'double', addr: r.addr, bytes: hx(pl), value: mbfDouble(pl), off: r.off });
    else if (n === 2) items.push({ kind: 'int', addr: r.addr, bytes: hx(pl), value: (pw(0) << 16) >> 16, off: r.off });
    else if (n === 10) items.push({ kind: 'array', addr: r.addr, data: pw(0), flags: pw(2), bytes: pw(4), w3: pw(6), count: pw(8), raw: hx(pl), off: r.off });
    else items.push({ kind: 'raw', addr: r.addr, bytes: hx(pl), off: r.off });
  }
  out.init = items;
  return out;
}
