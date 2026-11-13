import os, struct, sys, zlib


def pixels(path):
    b = open(path, 'rb').read()
    assert b[:8] == b'\x89PNG\r\n\x1a\n', path
    o, idat, w = 8, b'', None
    while o < len(b):
        n, = struct.unpack('>I', b[o:o + 4]); t = b[o + 4:o + 8]; d = b[o + 8:o + 8 + n]; o += 12 + n
        if t == b'IHDR':
            w, h, depth, ctype, _, _, inter = struct.unpack('>IIBBBBB', d)
            assert depth == 8 and ctype in (2, 6) and not inter, (path, depth, ctype, inter)
            bpp = 3 if ctype == 2 else 4
        elif t == b'IDAT':
            idat += d
    raw = zlib.decompress(idat)
    stride = w * bpp
    out, prev = bytearray(), bytearray(stride)
    p = 0
    for _ in range(h):
        f = raw[p]; line = bytearray(raw[p + 1:p + 1 + stride]); p += 1 + stride
        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0
            c = prev[i - bpp] if i >= bpp else 0
            up = prev[i]
            if f == 1: line[i] = (line[i] + a) & 255
            elif f == 2: line[i] = (line[i] + up) & 255
            elif f == 3: line[i] = (line[i] + ((a + up) >> 1)) & 255
            elif f == 4:
                pa, pb, pc = abs(up - c), abs(a - c), abs(a + up - 2 * c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else up if pb <= pc else c)) & 255
        out += line; prev = line
    rgb = [bytes(out[i:i + 3]) for i in range(0, len(out), bpp)]
    return w, h, rgb


def main():
    ref, dirs = sys.argv[1], sys.argv[2:]
    bad = 0
    for d in dirs:
        for n in sorted(os.listdir(d)):
            if not n.endswith('.png'):
                continue
            a, r = os.path.join(d, n), os.path.join(ref, n)
            if not os.path.exists(r):
                print(f'{os.path.basename(d)}/{n}: no reference'); continue
            if open(a, 'rb').read() == open(r, 'rb').read():
                print(f'{os.path.basename(d)}/{n}: byte-identical'); continue
            (w1, h1, p1), (w2, h2, p2) = pixels(a), pixels(r)
            if (w1, h1) != (w2, h2):
                print(f'{os.path.basename(d)}/{n}: size {w1}x{h1} vs {w2}x{h2}'); bad += 1; continue
            diff = sum(1 for x, y in zip(p1, p2) if x != y)
            print(f'{os.path.basename(d)}/{n}: bytes differ, {diff} px differ' + (' (pixel-identical)' if not diff else ''))
            bad += diff > 0
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
