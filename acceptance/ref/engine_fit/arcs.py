import json, sys
from PIL import Image


def logical(p):
    im = Image.open(p).convert('RGB')
    if im.size != (640, 400):
        im = im.resize((640, 400), Image.NEAREST)
    px = im.load()
    return [[px[2 * x, 2 * y] for x in range(320)] for y in range(200)]


ref, eng = logical(sys.argv[1]), logical(sys.argv[2])
from collections import Counter
print('ref colours', Counter(c for r in ref for c in r).most_common(6))
print('eng colours', Counter(c for r in eng for c in r).most_common(6))
json.dump({'ref': ref, 'eng': eng}, open(sys.argv[3], 'w'))
