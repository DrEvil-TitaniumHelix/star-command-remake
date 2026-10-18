"""review_text.py (lane build-qa): check the proven `row,col "text"` items of a SCREENS_INDEX.md row against
the engine screenshot acceptance/out/<id>.png.

Usage: python -I acceptance/review_text.py ID [ID ...]   (or --all-prefix SU,PT,SP)
The 640x400 PNG is reduced to the 320x200 logical screen (every 2nd pixel), each 8x8 cell is read as a glyph of
game/assets/font8x8.json when its pixels are exactly one bright colour on black (any colour, so palette
differences do not matter), and every item `r,c "literal"` of the row is tested at that exact cell.
Printed per item: OK / MISS (with what the screen shows there). Items in a list of alternatives ("A"/"B")
are reported separately; the reviewer judges conditional texts by hand.
"""
import json, os, re, struct, sys, zlib

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_png(path):
    b = open(path, 'rb').read()
    p, idat = 8, []
    while p < len(b):
        ln = struct.unpack('>I', b[p:p + 4])[0]
        t = b[p + 4:p + 8]
        d = b[p + 8:p + 8 + ln]
        if t == b'IHDR':
            w, h, depth, ctype = struct.unpack('>IIBB', d[:10])
        elif t == b'IDAT':
            idat.append(d)
        p += 12 + ln
    assert depth == 8 and ctype in (2, 6), (depth, ctype)
    bpp = 3 if ctype == 2 else 4
    raw = zlib.decompress(b''.join(idat))
    stride = w * bpp
    out, prev = [], bytearray(stride)
    for y in range(h):
        f = raw[y * (stride + 1)]
        line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
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
        out.append(bytes(line))
        prev = line
    return w, h, bpp, out


def screen_text(path):
    w, h, bpp, rows = read_png(path)
    px = lambda x, y: tuple(rows[2 * y][2 * x * bpp:2 * x * bpp + 3])
    glyphs = json.load(open(os.path.join(REPO, 'game', 'assets', 'font8x8.json')))['glyphs']
    key = {tuple(g): chr(c) for c, g in enumerate(glyphs) if 32 <= c < 127}
    lines = []
    for r in range(25):
        s = ''
        for c in range(40):
            cols = {px(8 * c + x, 8 * r + y) for y in range(8) for x in range(8)}
            fg = [k for k in cols if k != (0, 0, 0)]
            if len(fg) > 1:
                s += '·'
                continue
            f = fg[0] if fg else None
            g = tuple(sum(1 << (7 - x) for x in range(8) if px(8 * c + x, 8 * r + y) == f) for y in range(8)) if f else (0,) * 8
            s += key.get(g, '?')
        lines.append(s)
    return lines


def row_items(sid):
    for l in open(os.path.join(REPO, 'decode', 'pseudo', 'SCREENS_INDEX.md'), encoding='utf-8'):
        if l.startswith(f'| {sid} |'):
            cells = [c.strip() for c in l.split('|')]
            text = cells[5] if len(cells) > 5 else ''
            return [(int(r), int(c), t) for r, c, t in re.findall(r'(\d+),(\d+) "([^"]*)"', text)]
    return None


def main():
    ids = sys.argv[1:]
    if ids and ids[0] == '--all-prefix':
        pre = tuple(ids[1].split(','))
        ids = sorted(f[:-4] for f in os.listdir(os.path.join(REPO, 'acceptance', 'out')) if f.startswith(pre) and f.endswith('.png'))
    for sid in ids:
        png = os.path.join(REPO, 'acceptance', 'out', f'{sid}.png')
        items = row_items(sid)
        if items is None or not os.path.exists(png):
            print(f'{sid}: no SCREENS_INDEX row' if items is None else f'{sid}: no shot')
            continue
        lines = screen_text(png)
        ok = 0
        res = []
        for r, c, t in items:
            got = lines[r - 1][c - 1:c - 1 + len(t)] if 1 <= r <= 25 else ''
            hit = got == t
            ok += hit
            res.append(f'   {"OK  " if hit else "MISS"} {r},{c} "{t}"' + ('' if hit else f'  screen: "{got}"'))
        print(f'{sid}: {ok}/{len(items)} positioned texts match')
        print('\n'.join(res))
        if '-v' in os.environ.get('REVIEW', ''):
            print('\n'.join(f'   {i + 1:2d}|{l}|' for i, l in enumerate(lines)))


if __name__ == '__main__':
    main()
