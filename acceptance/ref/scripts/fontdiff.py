#!/usr/bin/env python3
"""fontdiff.py RAWPNG OUTJSON : decode the FONT.COM capture (256 glyphs, 32 per row) into a JSON
font and list the codes whose glyph differs from game/assets/font8x8.json."""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

REPO = Path('')
a = np.asarray(Image.open(sys.argv[1]).convert('L').resize((320, 200), Image.NEAREST))
glyphs = []
for c in range(256):
    r, col = divmod(c, 32)
    cell = a[r * 8:r * 8 + 8, col * 8:col * 8 + 8] > 0
    glyphs.append([int(''.join('1' if v else '0' for v in row), 2) for row in cell])
Path(sys.argv[2]).write_text(json.dumps({
    'name': 'DOSBox-X 2026.01.02 machine=ega, BIOS mode 4 INT 10h AH=09h glyphs (captured by FONT.COM)',
    'width': 8, 'height': 8, 'glyphs': glyphs}) + '\n')
eng = json.loads((REPO / 'game/assets/font8x8.json').read_text())['glyphs']
diff = [c for c in range(256) if glyphs[c] != eng[c]]
h = lambda g: ' '.join(f'{b:02X}' for b in g)
for c in diff:
    ch = chr(c) if 32 <= c < 127 else '.'
    print(f'{c:3d} 0x{c:02X} {ch!r}: dosbox {h(glyphs[c])} | engine {h(eng[c])}')
print(f'{len(diff)} of 256 glyphs differ')
