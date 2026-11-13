import glob, os
from collections import Counter
from PIL import Image
R = 'acceptance'
def raster(p):
    im = Image.open(p).convert('RGB')
    if im.size != (640, 400): im = im.resize((640, 400), Image.NEAREST)
    px = im.load(); return [[px[2 * x, 2 * y] for x in range(320)] for y in range(200)]
for p in sorted(glob.glob(R + '/ref/*.png')):
    sid = os.path.basename(p)[:-4]
    e = R + '/out/' + sid + '.png'
    if not os.path.exists(e): continue
    a, b = raster(p), raster(e)
    ca = Counter(c for r in a for c in r)
    at = Counter(b[y][x] for y in range(200) for x in range(320) if a[y][x] == (170, 170, 170))
    print(f'{sid}\tgrey {ca.get((170,170,170),0)}\twhite {ca.get((255,255,255),0)}\tengine at ref-grey: {at.most_common(2)}')
