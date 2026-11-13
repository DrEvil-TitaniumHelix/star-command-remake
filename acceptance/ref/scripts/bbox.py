#!/usr/bin/env python3
import sys
from pathlib import Path

import numpy as np
from PIL import Image

RAW = (Path.home() / 'scref/raw')


def load(n):
    p = Path(n) if Path(n).exists() else RAW / f'{n}.png'
    return np.asarray(Image.open(p).convert('RGB').resize((320, 200), Image.NEAREST)).astype(int)


base = load(sys.argv[1])
for n in sys.argv[2:]:
    d = (load(n) != base).any(axis=2)
    if not d.any():
        print(n, 'identical'); continue
    ys, xs = np.nonzero(d)
    print(f'{n}: x {xs.min()}..{xs.max()}  y {ys.min()}..{ys.max()}  ({int(d.sum())} px)')
