"""fon2json.py: Windows .FON (NE, FONT resources, FNT v2/v3) -> game/assets/font8x8.json.

Usage: python -I tools/font/fon2json.py <Bm437_IBM_EGA_8x8.FON> <out.json>
Source font: "The Ultimate Oldschool PC Font Pack" v2.2 by VileR (int10h.org), CC BY-SA 4.0 (tools/font/LICENSE.TXT).
The game uses Bm437_IBM_EGA_8x8 = the EGA BIOS 8x8 font the original shows on an EGA (identical in all 256
glyphs to the DOSBox-X capture acceptance/ref/font_dosbox_ega8x8.json; the CGA ROM font differs in 0x05/0x06/0x0F/'S').
Output: {"name","source","licence","width":8,"height":8,"glyphs":[256 x [8 row bytes, MSB = leftmost]]}.
"""
import json, os, struct, sys


def fnt_resources(b):
    ne = struct.unpack_from('<H', b, 0x3C)[0]
    assert b[ne:ne + 2] == b'NE', 'not an NE file'
    rt = ne + struct.unpack_from('<H', b, ne + 0x24)[0]
    shift = struct.unpack_from('<H', b, rt)[0]
    p = rt + 2
    while True:
        typ, cnt = struct.unpack_from('<HH', b, p)
        if typ == 0:
            return
        p += 8
        for _ in range(cnt):
            off, ln = struct.unpack_from('<HH', b, p)
            if typ == 0x8008:  # RT_FONT
                yield b[off << shift:(off << shift) + (ln << shift)]
            p += 12


def parse_fnt(f):
    ver = struct.unpack_from('<H', f, 0)[0]
    pixw, pixh = struct.unpack_from('<HH', f, 0x56)
    first, last = f[0x5F], f[0x60]
    tab, ent = (0x76, 4) if ver == 0x200 else (0x94, 6)
    glyphs = {}
    for i, ch in enumerate(range(first, last + 1)):
        w = struct.unpack_from('<H', f, tab + i * ent)[0]
        off = (struct.unpack_from('<H', f, tab + i * ent + 2)[0] if ent == 4
               else struct.unpack_from('<I', f, tab + i * ent + 2)[0])
        assert w <= 8, 'only 8-pixel-wide glyphs supported'
        glyphs[ch] = list(f[off:off + pixh])  # one byte column, pixh rows, MSB = leftmost
    return ver, pixw, pixh, glyphs


def main():
    src, out = sys.argv[1], sys.argv[2]
    b = open(src, 'rb').read()
    for f in fnt_resources(b):
        ver, w, h, g = parse_fnt(f)
        if h == 8:
            break
    else:
        sys.exit('no 8-pixel-high FONT resource')
    glyphs = [g.get(c, [0] * 8) for c in range(256)]
    stem = os.path.splitext(os.path.basename(src))[0]
    json.dump({'name': stem,
               'source': 'The Ultimate Oldschool PC Font Pack v2.2, VileR, https://int10h.org/oldschool-pc-fonts/',
               'licence': 'CC BY-SA 4.0 (tools/font/LICENSE.TXT)',
               'width': 8, 'height': 8, 'glyphs': glyphs}, open(out, 'w'), separators=(',', ':'))
    print(f'FNT v{ver >> 8}.{ver & 255}: {len(g)} glyphs {w}x{h} -> {out}')


if __name__ == '__main__':
    main()
