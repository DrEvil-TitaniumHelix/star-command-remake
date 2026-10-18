"""regen_colours.py (lane build-engine, ruling SC-2): bring SCREEN 1 engine screenshots to the EGA low-intensity
palette 1 (attribute 3 = EGA 7 light grey instead of EGA 15 white) without re-running every module's dev jump.

In SCREEN 1 on the EGA build, white can only come from attribute 3: the modules remap attributes 1 and 2
(PALETTE 1,9: 2,4 / INSIDE 1,2: 2,6) and attribute 0 is black. So every white pixel (255,255,255) of a
SCREEN 1 shot becomes light grey (170,170,170). Do NOT run it on SCREEN 7 shots (PLBATTLE PB-*, the demo
PUT-XOR-S7): there white is colour 15.

Usage: python -I acceptance/regen_colours.py PNG...   (rewrites in place)
Validated: real re-shoots after the change are pixel-identical to the substituted files (see STATUS.md).
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from review_text import read_png          # noqa: E402
from contact_sheets import write_png       # noqa: E402

WHITE, GREY = bytes((255, 255, 255)), bytes((170, 170, 170))


def main():
    for path in sys.argv[1:]:
        w, h, bpp, rows = read_png(path)
        img = bytearray(b''.join(r[x * bpp:x * bpp + 3] for r in rows for x in range(w)))
        n = 0
        for o in range(0, len(img), 3):
            if img[o:o + 3] == WHITE:
                img[o:o + 3] = GREY
                n += 1
        if n:
            write_png(path, w, h, bytes(img))
        print(f'{os.path.basename(path)}: {n // 4} logical px')


if __name__ == '__main__':
    main()
