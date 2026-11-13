import argparse, json, os, struct, sys, zlib

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, 'decode', 'data', 'tools'))
import bsave

ATLAS_W = 1024


def parse_arrays(spec):
    out = []
    for part in spec.split(';'):
        part = part.strip()
        if not part:
            continue
        idx, rest = part.split(':', 1)
        size, off = rest.split('@', 1)
        w, h = size.split('x')
        off = off.split('(')[0]
        out.append((int(idx), int(w), int(h), int(off)))
    return out


def write_indexed_png(path, w, h, pix, pal):
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        raw += pix[y * w:(y + 1) * w]

    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    hdr = struct.pack('>IIBBBBB', w, h, 8, 3, 0, 0, 0)
    plte = b''.join(bytes(c) for c in pal)
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', hdr) + chunk(b'PLTE', plte)
                + chunk(b'IDAT', zlib.compress(bytes(raw), 9)) + chunk(b'IEND', b''))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--targets', default='../re-targets/starcommand/starcoma')
    ap.add_argument('--out', default=os.path.join(REPO, 'game', 'assets'))
    a = ap.parse_args()

    sprites = []
    with open(os.path.join(REPO, 'decode', 'data', 'sprites_index.tsv'), encoding='utf-8') as f:
        for line in f:
            col = line.rstrip('\n').split('\t')
            if len(col) < 7 or col[5] not in ('cga', 'ega'):
                continue
            fname, mode = col[0], col[5]
            data = open(os.path.join(a.targets, fname), 'rb').read()
            for idx, w, h, off in parse_arrays(col[6]):
                pw, ph, pix = bsave.decode(data, off, mode)
                assert (pw, ph) == (w, h), (fname, idx, pw, ph, w, h)
                sprites.append(dict(bank=fname, index=idx, w=w, h=h, mode=mode, pix=pix))

    order = sorted(range(len(sprites)), key=lambda i: (-sprites[i]['h'], -sprites[i]['w']))
    x = y = shelf = 0
    for i in order:
        s = sprites[i]
        if x + s['w'] > ATLAS_W:
            x, y, shelf = 0, y + shelf + 1, 0
        s['x'], s['y'] = x, y
        x += s['w'] + 1
        shelf = max(shelf, s['h'])
    H = y + shelf
    img = bytearray(ATLAS_W * H)
    for s in sprites:
        for r in range(s['h']):
            row = s['pix'][r * s['w']:(r + 1) * s['w']]
            o = (s['y'] + r) * ATLAS_W + s['x']
            img[o:o + s['w']] = bytes(row)

    os.makedirs(a.out, exist_ok=True)
    write_indexed_png(os.path.join(a.out, 'atlas.png'), ATLAS_W, H, img, bsave.EGA)
    meta = dict(scale=1, palette=[list(c) for c in bsave.EGA], width=ATLAS_W, height=H,
                source='tools/build_atlas.py from decode/data/sprites_index.tsv + the original banks',
                sprites=[{k: s[k] for k in ('bank', 'index', 'x', 'y', 'w', 'h', 'mode')} for s in sprites])
    with open(os.path.join(a.out, 'atlas.json'), 'w') as f:
        json.dump(meta, f, separators=(',', ':'))
    banks = len({s['bank'] for s in sprites})
    print(f'{len(sprites)} sprites from {banks} banks -> atlas {ATLAS_W}x{H}')


if __name__ == '__main__':
    main()
