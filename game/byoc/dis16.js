// dis16.js — table-driven 16-bit x86 decoder for the code of compiled QuickBASIC 3.00 modules (BYOC B3, lane byoc-b3).
// It prints instructions exactly as capstone 5 (CS_MODE_16, Intel syntax) does, which is what decode/tools/qbdis.py
// used to make the committed listings, so qbdis.js reproduces them byte for byte.
//
// Coverage: the whole one-byte opcode map (8086 + the 186/286/386 one-byte forms capstone decodes in 16-bit mode)
// without prefixes. The 7 Star Command listings use 65 opcode keys / 33 mnemonics; game/byoc/byoc.test.mjs checks
// every one of their 46,317 instructions, and the map as a whole was checked against capstone 5.0.7 itself on 76,800
// random encodings (docs/byoc/B3.md step 2). Prefixes (26 2E 36 3E 64-67 F0 F2 F3), the 0F escape, the FPU escapes
// D8-DF, the VEX/EVEX register forms of C4/C5/62 and the TSX forms C6/C7 /7 throw, so an unexpected input fails loudly instead of silently differing.
//
// Capstone formatting reproduced: immediates `0x%x` when > 9 else decimal; sign-extended imm8 printed signed for
// add/adc/sbb/sub/cmp/push/imul (`-0x46`) but as an unsigned word for or/and/xor (`0xffdd`); memory operands carry
// `byte ptr` / `word ptr` (`lea` none, `les`/`lds` `ptr`, far `lcall`/`ljmp` none); displacements signed (`[bp - 6]`,
// `[di - 0x4436]`), a direct address unsigned (`[0x8c3c]`); branch targets = next + rel as an unsigned 32-bit value,
// not wrapped to 16 bits (SPACE 088DA `call 0x103e2`, STARPORT 01506 `call 0xffffa932`); capstone's own quirks
// `cwde`/`cdq` for 98/99 and `rcl <mem>` without `, 1` for D0/D1 /2.
//
// decode(code, pos, end) -> { size, mnemonic, opStr } or null (invalid encoding, or not enough bytes before `end`).

const R8 = ['al', 'cl', 'dl', 'bl', 'ah', 'ch', 'dh', 'bh'];
const R16 = ['ax', 'cx', 'dx', 'bx', 'sp', 'bp', 'si', 'di'];
const SREG = ['es', 'cs', 'ss', 'ds', 'fs', 'gs', null, null];
const RM = ['bx + si', 'bx + di', 'bp + si', 'bp + di', 'si', 'di', 'bp', 'bx'];
const ALU = ['add', 'or', 'adc', 'sbb', 'and', 'sub', 'xor', 'cmp'];
const SHF = ['rol', 'ror', 'rcl', 'rcr', 'shl', 'shr', 'sal', 'sar'];
const JCC = ['jo', 'jno', 'jb', 'jae', 'je', 'jne', 'jbe', 'ja', 'js', 'jns', 'jp', 'jnp', 'jl', 'jge', 'jle', 'jg'];
const F7 = ['test', 'test', 'not', 'neg', 'mul', 'imul', 'div', 'idiv'];
const ONE = { 0x27: 'daa', 0x2f: 'das', 0x37: 'aaa', 0x3f: 'aas', 0x60: 'pushaw', 0x61: 'popaw', 0x90: 'nop', 0x98: 'cwde',
  0x99: 'cdq', 0x9b: 'wait', 0x9c: 'pushf', 0x9d: 'popf', 0x9e: 'sahf', 0x9f: 'lahf', 0xc3: 'ret', 0xc9: 'leave', 0xcb: 'retf',
  0xcc: 'int3', 0xce: 'into', 0xcf: 'iret', 0xd6: 'salc', 0xd7: 'xlatb', 0xf1: 'int1', 0xf4: 'hlt', 0xf5: 'cmc', 0xf8: 'clc',
  0xf9: 'stc', 0xfa: 'cli', 0xfb: 'sti', 0xfc: 'cld', 0xfd: 'std' };
const STR = { 0x6c: ['insb', 'byte ptr es:[di], dx'], 0x6d: ['insw', 'word ptr es:[di], dx'], 0x6e: ['outsb', 'dx, byte ptr [si]'],
  0x6f: ['outsw', 'dx, word ptr [si]'], 0xa4: ['movsb', 'byte ptr es:[di], byte ptr [si]'], 0xa5: ['movsw', 'word ptr es:[di], word ptr [si]'],
  0xa6: ['cmpsb', 'byte ptr [si], byte ptr es:[di]'], 0xa7: ['cmpsw', 'word ptr [si], word ptr es:[di]'], 0xaa: ['stosb', 'byte ptr es:[di], al'],
  0xab: ['stosw', 'word ptr es:[di], ax'], 0xac: ['lodsb', 'al, byte ptr [si]'], 0xad: ['lodsw', 'ax, word ptr [si]'],
  0xae: ['scasb', 'al, byte ptr es:[di]'], 0xaf: ['scasw', 'ax, word ptr es:[di]'], 0xec: ['in', 'al, dx'], 0xed: ['in', 'ax, dx'],
  0xee: ['out', 'dx, al'], 0xef: ['out', 'dx, ax'] };
const THROW = new Set([0x0f, 0x26, 0x2e, 0x36, 0x3e, 0x64, 0x65, 0x66, 0x67, 0xd8, 0xd9, 0xda, 0xdb, 0xdc, 0xdd, 0xde, 0xdf, 0xf0, 0xf2, 0xf3]);

const hexImm = (v) => (v > 9 ? '0x' + v.toString(16) : String(v));
const sImm = (v) => (v < 0 ? '-' + hexImm(-v) : hexImm(v));
const s8 = (b) => (b & 0x80 ? b - 256 : b);
const s16 = (w) => (w & 0x8000 ? w - 65536 : w);

export class Unsupported extends Error {}
const TRUNC = Symbol('truncated');

export function decode(code, pos, end) {
  let p = pos;
  const u8 = () => { if (p + 1 > end) throw TRUNC; return code[p++]; };
  const u16 = () => { if (p + 2 > end) throw TRUNC; const v = code[p] | (code[p + 1] << 8); p += 2; return v; };
  let modrm = 0;
  const rmByte = () => { modrm = u8(); return modrm; };
  const reg = () => (modrm >> 3) & 7;
  const isMem = () => (modrm >> 6) !== 3;
  // r/m operand text; sz = 'byte ptr ' / 'word ptr ' / 'ptr ' / '' prefix for memory; w selects the register file
  const rmOp = (w, sz = w ? 'word ptr ' : 'byte ptr ') => {
    const mod = modrm >> 6, rm = modrm & 7;
    if (mod === 3) return (w ? R16 : R8)[rm];
    if (mod === 0 && rm === 6) return sz + '[' + hexImm(u16()) + ']';
    let d = 0;
    if (mod === 1) d = s8(u8());
    else if (mod === 2) d = s16(u16());
    return sz + '[' + RM[rm] + (d > 0 ? ' + ' + hexImm(d) : d < 0 ? ' - ' + hexImm(-d) : '') + ']';
  };
  const rel = (n) => { const r = n === 1 ? s8(u8()) : s16(u16()); return hexImm((p + r) >>> 0); };
  const ins = (mn, ops = '') => ({ size: p - pos, mnemonic: mn, opStr: ops });
  const unsupported = (what) => new Unsupported('dis16: ' + what + ' at ' + pos.toString(16));
  try {
    const op = u8();
    if (THROW.has(op)) throw unsupported('opcode ' + op.toString(16) + ' (prefix / escape / FPU not supported)');
    if (op in ONE) return ins(ONE[op]);
    if (op in STR) return ins(...STR[op]);
    if (op < 0x40) {
      const a = ALU[op >> 3];
      switch (op & 7) {
        case 0: { rmByte(); const r = rmOp(0); return ins(a, r + ', ' + R8[reg()]); }
        case 1: { rmByte(); const r = rmOp(1); return ins(a, r + ', ' + R16[reg()]); }
        case 2: { rmByte(); const r = rmOp(0); return ins(a, R8[reg()] + ', ' + r); }
        case 3: { rmByte(); const r = rmOp(1); return ins(a, R16[reg()] + ', ' + r); }
        case 4: return ins(a, 'al, ' + hexImm(u8()));
        case 5: return ins(a, 'ax, ' + hexImm(u16()));
        case 6: return ins('push', SREG[op >> 3]);
        case 7: return ins('pop', SREG[op >> 3]);
      }
    }
    if (op < 0x48) return ins('inc', R16[op & 7]);
    if (op < 0x50) return ins('dec', R16[op & 7]);
    if (op < 0x58) return ins('push', R16[op & 7]);
    if (op < 0x60) return ins('pop', R16[op & 7]);
    if (op === 0x62) { rmByte(); if (!isMem()) throw unsupported('62 register form (EVEX)'); const r = rmOp(1, 'dword ptr '); return ins('bound', R16[reg()] + ', ' + r); }
    if (op === 0x63) { rmByte(); const r = rmOp(1); return ins('arpl', r + ', ' + R16[reg()]); }
    if (op === 0x68) return ins('push', hexImm(u16()));
    if (op === 0x6a) return ins('push', sImm(s8(u8())));
    if (op === 0x69 || op === 0x6b) {
      rmByte(); const r = rmOp(1);
      return ins('imul', R16[reg()] + ', ' + r + ', ' + (op === 0x69 ? hexImm(u16()) : sImm(s8(u8()))));
    }
    if (op >= 0x70 && op < 0x80) return ins(JCC[op & 15], rel(1));
    if (op >= 0x80 && op <= 0x83) {
      rmByte(); const w = op & 1; const r = rmOp(w); const g = reg();
      let v;
      if (op === 0x81) v = hexImm(u16());
      else if (op === 0x83) { const x = s8(u8()); v = g === 1 || g === 4 || g === 6 ? hexImm(x & 0xffff) : sImm(x); }
      else v = hexImm(u8());
      return ins(ALU[g], r + ', ' + v);
    }
    if (op >= 0x84 && op <= 0x8b) {
      rmByte(); const w = op & 1; const r = rmOp(w); const g = (w ? R16 : R8)[reg()];
      const mn = op < 0x86 ? 'test' : op < 0x88 ? 'xchg' : 'mov';
      return ins(mn, op < 0x8a ? r + ', ' + g : g + ', ' + r);
    }
    if (op === 0x8c || op === 0x8e) {
      rmByte(); const s = SREG[reg()]; if (!s) return null; const r = rmOp(1);
      return ins('mov', op === 0x8c ? r + ', ' + s : s + ', ' + r);
    }
    if (op === 0x8d) { rmByte(); if (!isMem()) return null; const r = rmOp(1, ''); return ins('lea', R16[reg()] + ', ' + r); }
    if (op === 0x8f) { rmByte(); if (reg() !== 0) return null; return ins('pop', rmOp(1)); }
    if (op > 0x90 && op < 0x98) return ins('xchg', R16[op & 7] + ', ax');
    if (op === 0x9a) { const o = u16(), s = u16(); return ins('lcall', hexImm(s) + ', ' + hexImm(o)); }
    if (op === 0xea) { const o = u16(), s = u16(); return ins('ljmp', hexImm(s) + ':' + hexImm(o)); }
    if (op === 0xa0) return ins('mov', 'al, byte ptr [' + hexImm(u16()) + ']');
    if (op === 0xa1) return ins('mov', 'ax, word ptr [' + hexImm(u16()) + ']');
    if (op === 0xa2) return ins('mov', 'byte ptr [' + hexImm(u16()) + '], al');
    if (op === 0xa3) return ins('mov', 'word ptr [' + hexImm(u16()) + '], ax');
    if (op === 0xa8) return ins('test', 'al, ' + hexImm(u8()));
    if (op === 0xa9) return ins('test', 'ax, ' + hexImm(u16()));
    if (op >= 0xb0 && op < 0xb8) return ins('mov', R8[op & 7] + ', ' + hexImm(u8()));
    if (op >= 0xb8 && op < 0xc0) return ins('mov', R16[op & 7] + ', ' + hexImm(u16()));
    if (op === 0xc0 || op === 0xc1 || (op >= 0xd0 && op <= 0xd3)) {
      rmByte(); const g = reg(); const w = op & 1; const r = rmOp(w);
      if (op <= 0xc1) return ins(SHF[g], r + ', ' + hexImm(u8()));
      if (op >= 0xd2) return ins(SHF[g], r + ', cl');
      return ins(SHF[g], g === 2 && isMem() ? r : r + ', 1');     // capstone: `rcl <mem>` without the count
    }
    if (op === 0xc2) return ins('ret', hexImm(u16()));
    if (op === 0xca) return ins('retf', hexImm(u16()));
    if (op === 0xc4 || op === 0xc5) { rmByte(); if (!isMem()) throw unsupported('C4/C5 register form (VEX)'); const r = rmOp(1, 'ptr '); return ins(op === 0xc4 ? 'les' : 'lds', R16[reg()] + ', ' + r); }
    if (op === 0xc6 || op === 0xc7) {
      rmByte(); const g = reg();
      if (g === 7) throw unsupported('C6/C7 /7 (xabort/xbegin)');
      if (g !== 0) return null;
      const w = op & 1; const r = rmOp(w);
      return ins('mov', r + ', ' + (w ? hexImm(u16()) : hexImm(u8())));
    }
    if (op === 0xc8) { const a = u16(), b = u8(); return ins('enter', sImm(s16(a)) + ', ' + sImm(s8(b))); }
    if (op === 0xcd) return ins('int', hexImm(u8()));
    if (op === 0xd4 || op === 0xd5) return ins(op === 0xd4 ? 'aam' : 'aad', hexImm(u8()));
    if (op >= 0xe0 && op <= 0xe3) return ins(['loopne', 'loope', 'loop', 'jcxz'][op & 3], rel(1));
    if (op === 0xe4 || op === 0xe5) return ins('in', (op & 1 ? 'ax, ' : 'al, ') + hexImm(u8()));
    if (op === 0xe6 || op === 0xe7) return ins('out', hexImm(u8()) + (op & 1 ? ', ax' : ', al'));
    if (op === 0xe8) return ins('call', rel(2));
    if (op === 0xe9) return ins('jmp', rel(2));
    if (op === 0xeb) return ins('jmp', rel(1));
    if (op === 0xf6 || op === 0xf7) {
      rmByte(); const m = F7[reg()]; const w = op & 1; const r = rmOp(w);
      if (m === 'test') return ins(m, r + ', ' + (w ? hexImm(u16()) : reg() === 1 ? sImm(s8(u8())) : hexImm(u8())));   // F6 /1 alias: signed
      return ins(m, r);
    }
    if (op === 0xfe) { rmByte(); if (reg() > 1) return null; const r = rmOp(0); return ins(reg() ? 'dec' : 'inc', r); }
    if (op === 0xff) {
      rmByte(); const g = reg();
      if (g === 7) return null;
      if (g === 3 || g === 5) { if (!isMem()) return null; return ins(g === 3 ? 'lcall' : 'ljmp', rmOp(1, '')); }
      return ins(['inc', 'dec', 'call', null, 'jmp', null, 'push'][g], rmOp(1));
    }
    throw unsupported('opcode ' + op.toString(16) + ' not in the table');
  } catch (e) {
    if (e === TRUNC) return null;     // instruction runs past `end`: capstone returns nothing -> qbdis prints `db`
    throw e;
  }
}
