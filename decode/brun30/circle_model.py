"""circle_model.py - reference implementation of the BRUN30 CIRCLE rasteriser (RT3E_8C, E346..E6C0) as read from the
bytes; see decode/brun30/CIRCLE.md for the offsets behind every line.

    python -I decode/brun30/circle_model.py                       # prints the SPACE console arcs (SUB_1023 CIRCLE calls)
    python -I decode/brun30/circle_model.py acceptance/ref/SP-01.png   # compares them with the DOSBox reference capture

Coordinates are logical 320x200 pixels. The runtime's single->integer conversion (A915, shared by the modules' CINT
RT3F_75/77/1B) rounds half AWAY from zero (shr/adc on the magnitude, then neg): CINT(68.5) = 69, CINT(-2.5) = -3.
"""
import math, sys


def cint(v):
    """A915: round half away from zero (NOT round-half-even, NOT JS Math.round for negatives)."""
    return int(math.copysign(math.floor(abs(v) + 0.5), v))


def aspect_fixed(aspect):
    """RT3E_31 (E2F6-E342): (f, tall). f = 8.8 fixed fraction of min(aspect, 1/aspect) as a 0..256 integer; tall = aspect >= 1."""
    tall = aspect >= 1.0                                   # E309-E313: FAC >= 1 (exponent >= 0x81, positive)
    v = (1.0 / aspect) if tall else aspect                 # E315-E320: FAC = 1.0 / FAC (4297), flag [1307] |= 1
    n = cint(v * 256.0)                                    # E323-E329: exponent += 8, then CINT (A915)
    lo, hi = n & 0xFF, n >> 8                              # E32E-E33F
    return (lo if lo else (256 if hi else 0)), tall        # [12F8]


def scale(v, f):
    """E5B7 / E5D9-E5F2: (v * f + 0x80) >> 8 (16x16 unsigned mul, +128, high byte -> rounded fraction)."""
    return ((v * f) + 0x80) >> 8


FOUR_OVER_PI = 1.2732395  # MBF single 82 F9 22 81 at E4B4-E4B7
RSQRT2 = 0.70710678       # MBF single F3 04 35 80 at E381-E384


def endpoint_step(theta, R, k):
    """E4A9-E578: angle -> position on the 8k-step chain around the circle. Returns (step, radius_line)."""
    line = theta < 0                                       # E44F-E463: negative angle -> radius line flag, FAC made positive
    t = abs(theta)
    o = int(t * FOUR_OVER_PI)                              # E4B4-E4C5: FAC * 4/pi, INT (AC92), CINT -> octant
    if o >= 8:
        raise ValueError('illegal function call (angle >= 2 pi)')  # E4CA-E4CF -> 099D
    half, o2 = o >= 4, o & 3                               # E4D2-E4DB
    base, use_sin, add = {0: (0, True, True),              # E4DE-E4E4: al = 81h, bl = 0
                          1: (2, False, False),            # E4E6-E4EF: al = 00h, bl = 2
                          2: (2, False, True),             # E4F1-E4F8: al = 01h, bl = 2
                          3: (4, True, False)}[o2]         # E4FA-E4FC: al = 80h, bl = 4
    if half: base += 4                                     # E4FF-E504
    trig = abs(math.sin(t)) if use_sin else abs(math.cos(t))   # E528-E53F: bit7 -> SIN (DE65) else COS (DE5D), then ABS
    val = base * k + float(R) * trig if add else base * k - float(R) * trig   # E507-E511 base*k; E549-E555 R*trig; E55B-E564
    return cint(val), line                                 # E56F: CINT (A915)


def basic_circle(cx, cy, radius, aspect, start=None, end=None):
    """CIRCLE (cx, cy), radius, colour, start, end, aspect with cx, cy already converted by 3E_8D (CINT).
    Returns (pixels in plot order with duplicates, radius lines [(x0, y0, x1, y1)])."""
    R = cint(radius)                                       # E372-E377: [12D2] = CINT(radius) (negative radius -> error 099D)
    k = cint(float(R) * RSQRT2)                            # E37B-E38F: [12FC] = CINT(CSNG(R) * 0.70710678)
    f, tall = aspect_fixed(aspect)
    arc = start is not None or end is not None
    lines, pts = [], []
    if arc:                                                # E3CD-E449
        s_step, s_line = endpoint_step(start if start is not None else 0.0, R, k)
        if end is not None:
            e_step, e_line = endpoint_step(end, R, k)
            swapped = abs(end) < abs(start if start is not None else 0.0)   # E416 DE36: FCMP end-angle ? start-angle (floats)
            L, H = (e_step, s_step) if swapped else (s_step, e_step)
            lineL, lineH = (e_line, s_line) if swapped else (s_line, e_line)  # E41F-E42A: flags exchanged (xor 81h)
        else:
            L, H, swapped, lineL, lineH = s_step, 0xFFFF, False, s_line, False  # E3FE-E403
        if L == H and (lineL or lineH): lineL = lineH = True                     # E43C-E449
    drawn = {'L': False, 'H': False}

    def plot(sx, sy, step):                                # E621-E6BF, one point of the 8
        if arc:                                            # E631: [1307] & 6
            if step == L:                                  # E66A-E66E -> E695
                if lineL:
                    if drawn['L']: return
                    drawn['L'] = True; lines.append((cx, cy, cx + sx, cy + sy)); return   # E6A5-E6AF: LINE centre-point (EA0A)
            elif step == H:                                # E672-E676 -> E683
                if lineH:
                    if drawn['H']: return
                    drawn['H'] = True; lines.append((cx, cy, cx + sx, cy + sy)); return
            elif L < step < H:                             # E678 -> E6B1
                if swapped: return
            else:                                          # E670 / E67A: step < L or step > H
                if not swapped: return
        pts.append((cx + sx, cy + sy))                     # E638-E642: clip test (DE6D) when needed, then plot (6FEA/7214)

    x, y, d = 0, R, 1 - R                                  # E57D-E588
    while True:
        xs, ys = scale(x, f), scale(y, f)                  # E5D9-E5F2
        if not tall:                                       # wide ellipse: x radius R, y scaled
            g = [(y, -xs, x), (-x, -ys, 2 * k + x), (-y, xs, 4 * k + x), (x, ys, 6 * k + x),
                 (x, -ys, 2 * k - x), (-y, -xs, 4 * k - x), (-x, ys, 6 * k - x), (y, xs, 8 * k - x)]
        else:                                              # tall ellipse: y radius R, x scaled
            g = [(ys, -x, x), (-xs, -y, 2 * k + x), (-ys, x, 4 * k + x), (xs, y, 6 * k + x),
                 (xs, -y, 2 * k - x), (-ys, -x, 4 * k - x), (-xs, y, 6 * k - x), (ys, x, 8 * k - x)]
        for sx, sy, st in g: plot(sx, sy, st)              # E60B first group of 4, E61B-E621 second group of 4
        if x >= y: break                                   # E592-E594: cmp di,si ; jae (after plotting)
        if d < 0: d += 2 * x + 3                           # E5A5-E5AD
        else: d += 2 * (x - y) + 5; y -= 1                 # E59D-E5A4 (+ E5A5-E5AD)
        x += 1
    return pts, lines


SPACE_CONSOLE = [  # SPACE.bas.md SUB_1023: CIRCLE (x, y), r, 2, start, end, aspect
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
