#!/usr/bin/env python3
"""compare.py - geometry/text comparison of DOSBox refs against engine shots, colours ignored.

usage: python3 -I compare.py OUTDIR ID...

Both images are sampled to the 320x200 game raster (ref = 2x nearest of the DOSBox window,
engine = 640x400 headless Chrome). Each image is reduced to colour classes; ref classes are
mapped to the engine colour that covers most of their pixels (SC-1 = B: palettes differ by
design, a consistent colour substitution is not a defect). Pixels whose engine colour differs
from the mapped colour are geometry/text mismatches. Prints per id: mismatch pixel count,
mismatch percentage, colour map, and the mismatch bounding boxes (8x8 cell clusters); writes
OUTDIR/<id>.diff.png (ref greyed, mismatches red).
"""
import sys
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
from PIL import Image

REPO = Path('')


def raster(p):
    im = Image.open(p).convert('RGB')
    if im.size != (640, 400):
        im = im.resize((640, 400), Image.NEAREST)
    a = np.asarray(im)[::2, ::2, :]
    return a.astype(np.int32)


def key(a):
    return (a[..., 0] << 16) | (a[..., 1] << 8) | a[..., 2]


def compare(id_, outdir):
    # ID or ID:ENGINEPATH (repo-relative) to compare a ref with another engine shot (e.g. integration runs)
    id_, _, ep = id_.partition(':')
    r = REPO / f'acceptance/ref/{id_}.png'
    e = REPO / ep if ep else REPO / f'acceptance/out/{id_}.png'
    if not (r.exists() and e.exists()):
        return None
    ra, ea = raster(r), raster(e)
    rk, ek = key(ra), key(ea)
    cmap = {}
    for c in np.unique(rk):
        m = rk == c
        vals, cnt = np.unique(ek[m], return_counts=True)
        cmap[int(c)] = int(vals[cnt.argmax()])
    mapped = np.vectorize(cmap.get)(rk)
    bad = mapped != ek
    n = int(bad.sum())
    # 8x8 cell clusters
    cells = bad.reshape(25, 8, 40, 8).any(axis=(1, 3))
    rows = [f'{row+1}:' + ''.join('#' if cells[row, c] else '.' for c in range(40))
            for row in range(25) if cells[row].any()]
    g = (ra.mean(axis=2) * 0.4).astype(np.uint8)
    img = np.stack([g, g, g], axis=2)
    img[bad] = [255, 0, 0]
    Image.fromarray(img).resize((640, 400), Image.NEAREST).save(outdir / f'{id_}.diff.png')
    cm = ', '.join(f'{c:06x}->{v:06x}' for c, v in cmap.items())
    return n, 100.0 * n / 64000, cm, rows


def main():
    outdir = Path(sys.argv[1]); outdir.mkdir(parents=True, exist_ok=True)
    for id_ in sys.argv[2:]:
        res = compare(id_, outdir)
        id_ = id_.replace('/', '_')
        if res is None:
            print(f'{id_}: missing'); continue
        n, pct, cm, rows = res
        print(f'{id_}: {n} px ({pct:.2f}%) mismatched; colours {cm}')
        for line in rows:
            print('   ', line)


if __name__ == '__main__':
    main()
