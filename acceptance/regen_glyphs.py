"""regen_glyphs.py (lane build-engine, F-1): bring existing engine screenshots up to a new font without
re-running every module's dev jump. Text is always drawn as whole 8x8 cells on the LOCATE grid (text.js
glyph()), so a font change only changes cells that show one of the changed glyphs: every grid cell whose
two colours form exactly an OLD glyph (in either colour role, so inverted/PRESET text is covered too) is
redrawn with the NEW glyph in the same two colours. Cells with one colour (space) are untouched.

Usage: python -I acceptance/regen_glyphs.py OLD_FONT.json NEW_FONT.json PNG...   (rewrites the PNGs in place)
Validation: compare a few regenerated shots with real re-shoots (must be byte-identical in pixels).
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from review_text import read_png          # noqa: E402
from contact_sheets import write_png       # noqa: E402


def main():
    old = json.load(open(sys.argv[1]))['glyphs']
    new = json.load(open(sys.argv[2]))['glyphs']
    changed = {tuple(old[c]): new[c] for c in range(256) if old[c] != new[c] and any(old[c])}
    total = 0
    for path in sys.argv[3:]:
        w, h, bpp, rows = read_png(path)
        assert (w, h) == (640, 400), path
        img = bytearray(b''.join(r[x * bpp:x * bpp + 3] for r in rows for x in range(w)))
        px = lambda x, y: bytes(img[(2 * y * w + 2 * x) * 3:(2 * y * w + 2 * x) * 3 + 3])
        n = 0
        for r in range(25):
            for c in range(40):
                cols = {px(8 * c + x, 8 * r + y) for y in range(8) for x in range(8)}
                if len(cols) != 2:
                    continue
                for fg in cols:
                    bg = (cols - {fg}).pop()
                    bits = tuple(sum(1 << (7 - x) for x in range(8) if px(8 * c + x, 8 * r + y) == fg) for y in range(8))
                    if bits in changed:
                        g = changed[bits]
                        for y in range(8):
                            for x in range(8):
                                col = fg if (g[y] >> (7 - x)) & 1 else bg
                                for dy in (0, 1):
                                    for dx in (0, 1):
                                        o = ((2 * (8 * r + y) + dy) * w + 2 * (8 * c + x) + dx) * 3
                                        img[o:o + 3] = col
                        n += 1
                        break
        if n:
            write_png(path, w, h, bytes(img))
        total += n
        print(f'{os.path.basename(path)}: {n} cell(s) redrawn')
    print(f'{total} cells in {len(sys.argv) - 3} files')


if __name__ == '__main__':
    main()
