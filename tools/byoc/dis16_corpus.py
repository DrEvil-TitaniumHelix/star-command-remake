"""dis16_corpus.py — regenerate game/byoc/dis16.capstone.json, the capstone reference corpus for game/byoc/dis16.js
(BYOC B3, lane byoc-b3). Random (seeded) encodings for every one-byte opcode, a mix of ModR/M shapes, load addresses
(branch-target wrap) and truncated buffers, decoded by capstone 5 in CS_MODE_16 exactly as decode/tools/qbdis.py does.
The bytes are synthetic (no game content). game/byoc/byoc.test.mjs replays the corpus through dis16.js; cases whose
first byte dis16 deliberately does not support (prefixes, 0F, FPU, VEX/EVEX, TSX) must throw, all others must match.

Usage (repo root, Windows Python with capstone):  python -I tools/byoc/dis16_corpus.py
"""
import json, os, random
from capstone import Cs, CS_ARCH_X86, CS_MODE_16

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
md = Cs(CS_ARCH_X86, CS_MODE_16)
rnd = random.Random(16)
MODRM = [0x00, 0x06, 0x07, 0x46, 0x86, 0xc0, 0xd8, 0x3e, 0x7e, 0xbe, 0xfe, 0x45, 0x85, 0x0f, 0x1f, 0xf8]
cases = []
for op in range(256):
    for k in range(24):
        b = [op] + [rnd.randrange(256) for _ in range(7)]
        if k < 16: b[1] = MODRM[k] | (rnd.randrange(8) << 3 if k % 2 else 0)
        at = rnd.choice([0x40, 0x100, 0x8000, 0x9000, 0x1000, 0xfff0, 2])
        n = rnd.choice([8, 8, 8, 8, 3, 2])
        ins = next(md.disasm(bytes(b[:n]), at), None)
        cases.append([bytes(b[:n]).hex(), at] + ([ins.size, ins.mnemonic, ins.op_str] if ins else []))
out = os.path.join(ROOT, 'game', 'byoc', 'dis16.capstone.json')
with open(out, 'w', encoding='utf-8', newline='\n') as f:
    f.write('[\n' + ',\n'.join(json.dumps(c, separators=(',', ':')) for c in cases) + '\n]\n')
print('wrote', out, len(cases), 'cases')
