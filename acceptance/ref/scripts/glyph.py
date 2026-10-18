#!/usr/bin/env python3
"""glyph.py ID ROW COL [N] : print the 8x8 cells at text ROW,COL (1-based) of ref and engine shots as hex rows."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

REPO = Path('')


def cells(p, row, col, n):
    a = np.asarray(Image.open(p).convert('L').resize((640, 400), Image.NEAREST))[::2, ::2]
    bg = a[(row - 1) * 8 + 7, (col - 1) * 8 + 7]
    out = []
    for k in range(n):
        x0, y0 = (col - 1 + k) * 8, (row - 1) * 8
        c = a[y0:y0 + 8, x0:x0 + 8]
        bits = [int(''.join('1' if v != bg else '0' for v in r), 2) for r in c]
        out.append(' '.join(f'{b:02X}' for b in bits))
    return out


id_, row, col = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
n = int(sys.argv[4]) if len(sys.argv) > 4 else 1
for name in ('ref', 'out'):
    for k, s in enumerate(cells(REPO / f'acceptance/{name}/{id_}.png', row, col, n)):
        print(f'{name} {row},{col + k}: {s}')
