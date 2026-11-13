import os, struct, sys, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from review_text import read_png, REPO


def write_png(path, w, h, rgb):
    raw = b''.join(b'\0' + rgb[y * w * 3:(y + 1) * w * 3] for y in range(h))
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
                           + chunk(b'IDAT', zlib.compress(raw, 6)) + chunk(b'IEND', b''))


def main():
    out, ids = sys.argv[1], sys.argv[2:]
    os.makedirs(out, exist_ok=True)
    for k in range(0, len(ids), 4):
        group = ids[k:k + 4]
        sheet = bytearray(640 * 400 * 3)
        for n, sid in enumerate(group):
            w, h, bpp, rows = read_png(os.path.join(REPO, 'acceptance', 'out', f'{sid}.png'))
            ox, oy = 320 * (n % 2), 200 * (n // 2)
            for y in range(200):
                src = rows[2 * y]
                for x in range(320):
                    o = ((oy + y) * 640 + ox + x) * 3
                    sheet[o:o + 3] = src[2 * x * bpp:2 * x * bpp + 3]
        name = os.path.join(out, 'sheet_' + '_'.join(group) + '.png')
        write_png(name, 640, 400, bytes(sheet))
        print(name)


if __name__ == '__main__':
    main()
