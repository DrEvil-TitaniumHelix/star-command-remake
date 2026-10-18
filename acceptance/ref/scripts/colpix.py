#!/usr/bin/env python3
"""colpix.py REFPNG HEXCOLOUR X0 Y0 X1 Y1 [OUTTXT] : list the 320x200 pixels of one colour inside a box
(row by row, x runs), e.g. the shield arcs of SP-01sh: colpix.py SP-01sh.png 5555ff 236 0 319 70"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

p = Path(sys.argv[1])
if not p.exists():
    p = Path('acceptance/ref') / sys.argv[1]
a = np.asarray(Image.open(p).convert('RGB').resize((640, 400), Image.NEAREST))[::2, ::2].astype(int)
c = int(sys.argv[2], 16)
k = (a[..., 0] << 16) | (a[..., 1] << 8) | a[..., 2]
x0, y0, x1, y1 = map(int, sys.argv[3:7])
lines = []
for y in range(y0, y1 + 1):
    xs = [x for x in range(x0, x1 + 1) if k[y, x] == c]
    if not xs:
        continue
    runs, s = [], xs[0]
    for i in range(1, len(xs) + 1):
        if i == len(xs) or xs[i] != xs[i - 1] + 1:
            runs.append(f'{s}' if s == xs[i - 1] else f'{s}-{xs[i - 1]}')
            if i < len(xs):
                s = xs[i]
    lines.append(f'y{y}: ' + ' '.join(runs))
txt = '\n'.join(lines)
if len(sys.argv) > 7:
    Path(sys.argv[7]).write_text(txt + '\n')
print(txt)
