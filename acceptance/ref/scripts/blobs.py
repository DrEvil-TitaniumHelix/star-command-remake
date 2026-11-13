#!/usr/bin/env python3
import sys
from pathlib import Path

import numpy as np
from PIL import Image

p = Path(sys.argv[1])
if not p.exists():
    p = (Path.home() / 'scref/raw') / f'{sys.argv[1]}.png'
a = np.asarray(Image.open(p).convert('RGB').resize((320, 200), Image.NEAREST)).astype(int)
x0, y0, x1, y1 = map(int, sys.argv[2:6])
m = (a[y0:y1 + 1, x0:x1 + 1].sum(axis=2) > 0)
seen = np.zeros_like(m)
H, W = m.shape
for y in range(H):
    for x in range(W):
        if m[y, x] and not seen[y, x]:
            st = [(y, x)]; seen[y, x] = 1; pts = []
            while st:
                cy, cx = st.pop(); pts.append((cy, cx))
                for dy in range(-2, 3):
                    for dx in range(-2, 3):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = 1; st.append((ny, nx))
            ys = [q[0] for q in pts]; xs = [q[1] for q in pts]
            if len(pts) >= 6:
                print(f'blob x {min(xs)+x0}..{max(xs)+x0} y {min(ys)+y0}..{max(ys)+y0} ({len(pts)} px)')
