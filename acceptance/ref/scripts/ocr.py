#!/usr/bin/env python3
"""ocr.py RAW ROW COL N : read N text cells at ROW,COL (1-based, 40-column SCREEN 1/7 text) from a raw
grab by exact match against the captured EGA font (acceptance/ref/font_dosbox_ega8x8.json); unknown
cells print as '?'."""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

REF = Path('acceptance/ref')
glyphs = json.loads((REF / 'font_dosbox_ega8x8.json').read_text())['glyphs']
lut = {tuple(g): chr(c) for c, g in enumerate(glyphs) if 32 <= c < 127}
p = Path(sys.argv[1])
if not p.exists():
    p = (Path.home() / 'scref/raw') / f'{sys.argv[1]}.png'
a = np.asarray(Image.open(p).convert('RGB').resize((320, 200), Image.NEAREST)).astype(int)
k = (a[..., 0] << 16) | (a[..., 1] << 8) | a[..., 2]
row, col, n = map(int, sys.argv[2:5])
out = ''
for i in range(n):
    y0, x0 = (row - 1) * 8, (col - 1 + i) * 8
    cell = k[y0:y0 + 8, x0:x0 + 8]
    bg = cell[7, 7] if (cell == cell[7, 7]).sum() >= 32 else np.bincount(cell.ravel() & 0xFFFFFF).argmax()
    bits = tuple(int(''.join('1' if v != bg else '0' for v in r), 2) for r in cell)
    out += lut.get(bits, ' ' if not any(bits) else '?')
print(out)
