import math, sys


def cint(v):
    return int(math.copysign(math.floor(abs(v) + 0.5), v))


def aspect_fixed(aspect):
    tall = aspect >= 1.0
    v = (1.0 / aspect) if tall else aspect
    n = cint(v * 256.0)
    lo, hi = n & 0xFF, n >> 8
    return (lo if lo else (256 if hi else 0)), tall


def scale(v, f):
    return ((v * f) + 0x80) >> 8


FOUR_OVER_PI = 1.2732395
RSQRT2 = 0.70710678


def endpoint_step(theta, R, k):
    line = theta < 0
    t = abs(theta)
    o = int(t * FOUR_OVER_PI)
    if o >= 8:
        raise ValueError('illegal function call (angle >= 2 pi)')
    half, o2 = o >= 4, o & 3
    base, use_sin, add = {0: (0, True, True),
                          1: (2, False, False),
                          2: (2, False, True),
                          3: (4, True, False)}[o2]
    if half: base += 4
    trig = abs(math.sin(t)) if use_sin else abs(math.cos(t))
    val = base * k + float(R) * trig if add else base * k - float(R) * trig
    return cint(val), line


def basic_circle(cx, cy, radius, aspect, start=None, end=None):
    R = cint(radius)
    k = cint(float(R) * RSQRT2)
    f, tall = aspect_fixed(aspect)
    arc = start is not None or end is not None
    lines, pts = [], []
    if arc:
        s_step, s_line = endpoint_step(start if start is not None else 0.0, R, k)
        if end is not None:
            e_step, e_line = endpoint_step(end, R, k)
            swapped = abs(end) < abs(start if start is not None else 0.0)
            L, H = (e_step, s_step) if swapped else (s_step, e_step)
            lineL, lineH = (e_line, s_line) if swapped else (s_line, e_line)
        else:
            L, H, swapped, lineL, lineH = s_step, 0xFFFF, False, s_line, False
        if L == H and (lineL or lineH): lineL = lineH = True
    drawn = {'L': False, 'H': False}

    def plot(sx, sy, step):
        if arc:
            if step == L:
                if lineL:
                    if drawn['L']: return
                    drawn['L'] = True; lines.append((cx, cy, cx + sx, cy + sy)); return
            elif step == H:
                if lineH:
                    if drawn['H']: return
                    drawn['H'] = True; lines.append((cx, cy, cx + sx, cy + sy)); return
            elif L < step < H:
                if swapped: return
            else:
                if not swapped: return
        pts.append((cx + sx, cy + sy))

    x, y, d = 0, R, 1 - R
    while True:
        xs, ys = scale(x, f), scale(y, f)
        if not tall:
            g = [(y, -xs, x), (-x, -ys, 2 * k + x), (-y, xs, 4 * k + x), (x, ys, 6 * k + x),
                 (x, -ys, 2 * k - x), (-y, -xs, 4 * k - x), (-x, ys, 6 * k - x), (y, xs, 8 * k - x)]
        else:
            g = [(ys, -x, x), (-xs, -y, 2 * k + x), (-ys, x, 4 * k + x), (xs, y, 6 * k + x),
                 (xs, -y, 2 * k - x), (-ys, -x, 4 * k - x), (-xs, y, 6 * k - x), (ys, x, 8 * k - x)]
        for sx, sy, st in g: plot(sx, sy, st)
        if x >= y: break
        if d < 0: d += 2 * x + 3
        else: d += 2 * (x - y) + 5; y -= 1
        x += 1
    return pts, lines


SPACE_CONSOLE = [
    ((16, 75.5), 68.5, 1.57, 4.71, 8), ((15, 75.5), 68.5, 1.57, 4.71, 8), ((143, 75.5), 68.5, 4.71, 1.57, 8), ((144, 75.5), 68.5, 4.71, 1.57, 8),
    ((16, 171.5), 20.5, 1.57, 4.71, 2), ((15, 171.5), 20.5, 1.57, 4.71, 2), ((303, 171.5), 20.5, 4.71, 1.57, 2), ((304, 171.5), 20.5, 4.71, 1.57, 2),
    ((248, 35.5), 28.5, 1.57, 4.71, 3), ((247, 35.5), 28.5, 1.57, 4.71, 3), ((304, 35.5), 28.5, 4.71, 1.57, 3), ((303, 35.5), 28.5, 4.71, 1.57, 3),
    ((160, 107.5), 36.5, 1.57, 4.71, 9), ((159, 107.5), 36.5, 1.57, 4.71, 9), ((304, 107.5), 36.5, 4.71, 1.57, 9), ((303, 107.5), 36.5, 4.71, 1.57, 9),
]

if __name__ == '__main__':
    allpts = set()
    for (x, y), r, a0, a1, asp in SPACE_CONSOLE:
        pts, lines = basic_circle(cint(x), cint(y), r, asp, a0, a1)
        allpts |= set(pts)
        R = cint(r); k = cint(float(R) * RSQRT2); f, tall = aspect_fixed(asp)
        print('CIRCLE (%g,%g),%g,2,%g,%g,%g -> centre (%d,%d) R %d k %d f %d %s steps %d..%d: %d pixels'
              % (x, y, r, a0, a1, asp, cint(x), cint(y), R, k, f, 'tall' if tall else 'wide',
                 endpoint_step(a0, R, k)[0], endpoint_step(a1, R, k)[0], len(set(pts))))
    if len(sys.argv) > 1:
        from PIL import Image
        from collections import Counter
        im = Image.open(sys.argv[1]).convert('RGB'); px = im.load()
        sx, sy = im.size[0] // 320, im.size[1] // 200
        ref = {(x, y): px[x * sx, y * sy] for x in range(320) for y in range(200)}
        col = Counter(ref[p] for p in allpts)
        arc_col = col.most_common(1)[0][0]
        miss = [p for p in allpts if ref[p] != arc_col]
        print('reference colour under the model pixels %s; model pixels NOT of that colour: %d of %d %s'
              % (col.most_common(3), len(miss), len(allpts), sorted(miss)[:20]))
