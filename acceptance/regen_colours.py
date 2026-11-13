import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from review_text import read_png
from contact_sheets import write_png

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
