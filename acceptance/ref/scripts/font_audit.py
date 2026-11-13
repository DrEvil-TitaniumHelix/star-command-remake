#!/usr/bin/env python3
import json
import sys
from collections import defaultdict
from pathlib import Path

import numpy as np
from PIL import Image

REPO = Path('')
font = json.loads((REPO / 'game/assets/font8x8.json').read_text())['glyphs']
G = np.array([[[(row >> (7 - b)) & 1 for b in range(8)] for row in g] for g in font], dtype=np.uint8)

seen = defaultdict(lambda: [0, None, set()])
exact = defaultdict(int)
for id_ in sys.argv[1:]:
    p = REPO / f'acceptance/ref/{id_}.png'
    a = np.asarray(Image.open(p).convert('RGB'))[::2, ::2].astype(int)
    k = (a[..., 0] << 16) | (a[..., 1] << 8) | a[..., 2]
    for r in range(25):
        for c in range(40):
            cell = k[r * 8:r * 8 + 8, c * 8:c * 8 + 8]
            vals, cnt = np.unique(cell, return_counts=True)
            if len(vals) != 2:
                continue
            fg = vals[cnt.argmin()]
            bits = (cell == fg).astype(np.uint8)
            d = (G[32:127] != bits).sum(axis=(1, 2))
            ch = int(d.argmin()) + 32
            dist = int(d.min())
            if dist == 0:
                exact[ch] += 1
            elif dist <= 6 and bits.sum() > 4:
                s = seen[(ch, bits.tobytes())]
                s[0] += 1; s[1] = bits; s[2].add(f'{id_}@{r+1},{c+1}')
rows = lambda b: ' '.join(f'{int("".join(map(str, r)), 2):02X}' for r in b)
for (ch, _), (n, bits, where) in sorted(seen.items(), key=lambda x: (-x[1][0])):
    if ch in exact and n < 3:
        continue
    print(f"{ch:3d} {chr(ch)!r}: {n} cells, ref {rows(bits)} | engine {rows(G[ch])} | e.g. {sorted(where)[:3]}")
print('exact matches:', ''.join(sorted(chr(c) for c in exact)))
