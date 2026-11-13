#!/usr/bin/env python3
import sys
from pathlib import Path

import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parents[3]
r = lambda p: np.asarray(Image.open(p).convert('RGB').resize((640, 400), Image.NEAREST))[::2, ::2].astype(int)
same = []
for n in sorted(Path(sys.argv[1]).glob('*.png')):
    o = REPO / 'acceptance/out' / n.name
    if not o.exists():
        continue
    d = (r(n) != r(o)).any(axis=2)
    if not d.any():
        same.append(n.stem); continue
    ys, xs = np.nonzero(d)
    print(f'{n.stem}: {int(d.sum())} px changed, x {xs.min()}..{xs.max()} y {ys.min()}..{ys.max()}')
print(f'unchanged ({len(same)}):', ' '.join(same))
