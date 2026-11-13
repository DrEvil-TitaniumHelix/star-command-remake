# BRUN30 CIRCLE rasteriser (RT3E_8C) - the algorithm from the bytes

Lane crossref (Fable), 2026-10-16, for build-engine qa fix F-2 (SPACE console arcs 1 px off vs the DOSBox reference).

Evidence: `BRUN30.EXE` load module (MZ header stripped, 0x11218 bytes; one code+data segment, so every address below
is a load-module offset = segment-0 offset); the entry fragments in `decode/brun30/rt_asm.txt` (its near-call targets
are printed unmasked: `call 0x13f85` is `call 3F85`); `decode/brun30/RT_LEDGER.md` rows 3E_2F/3E_30/3E_31/3E_8C/3E_8D;
the SPACE call site `SPACE.lst` 10AA-10D0 (`SPACE.bas.md` 010D0 .. 0138x, SUB_1023). The full disassembly of
E2D5-E6C0 and the helpers was made with capstone (16-bit) from the original file; nothing was modified.
Reference implementation: `decode/brun30/circle_model.py` (checked pixel-for-pixel against `acceptance/ref/SP-01.png`,
see section 9).

## 0. What the engine has to do (summary)

1. Convert the three singles with the runtime's CINT: **round half away from zero** (A915: `shr bx,cl / adc bx,0`, then
   `neg` for negatives). `CINT(68.5) = 69`, `CINT(75.5) = 76`, `CINT(-2.5) = -3`. This is the CINT of every module
   (RT3F_75/77/1B all jump into A91E), not round-half-even and not JavaScript `Math.round` (which differs for
   negative halves).
2. Centre `(cx, cy) = (CINT(x), CINT(y))` (3E_8D, DC92). Radius `R = CINT(r)` ([12D2]).
3. `k = CINT(CSNG(R) * 0.70710678)` = the number of steps per octant ([12FC]).
4. Aspect `a` (3E_31): `tall = (a >= 1)`; `f = CINT((tall ? 1/a : a) * 256)` reduced to its low byte, except that a value
   with a zero low byte becomes 256 when `>= 256` and 0 otherwise ([12F8]). `scale(v) = (v*f + 128) >> 8`.
5. Midpoint circle on the integer radius R in "circle space": `x = 0, y = R, d = 1 - R`; plot the 8 symmetric points;
   stop after plotting when `x >= y`; else `d < 0 ? d += 2x + 3 : (d += 2(x - y) + 5, y -= 1)`, `x += 1`.
6. The 8 screen points of circle point (x, y), relative to the centre, with their step index on the 8k chain:
   wide (`tall = 0`, x radius R): `(y, -scale(x)) @x`, `(-x, -scale(y)) @2k+x`, `(-y, scale(x)) @4k+x`, `(x, scale(y)) @6k+x`,
   `(x, -scale(y)) @2k-x`, `(-y, -scale(x)) @4k-x`, `(-x, scale(y)) @6k-x`, `(y, scale(x)) @8k-x`;
   tall (`tall = 1`, y radius R): the same list with the scaled and unscaled coordinates exchanged:
   `(scale(y), -x) @x`, `(-scale(x), -y) @2k+x`, `(-scale(y), x) @4k+x`, `(scale(x), y) @6k+x`,
   `(scale(x), -y) @2k-x`, `(-scale(y), -x) @4k-x`, `(-scale(x), y) @6k-x`, `(scale(y), x) @8k-x`.
   Plot order is exactly that (first four, then the last four); duplicates are plotted again.
7. Arc: each angle becomes a step `s(theta) = CINT(base*k +- R*|trig(theta)|)` (section 4). `L = min, H = max` of the
   two steps; `swapped = |end| < |start|` (float compare of the angles). A point with step `L` or `H` is always plotted
   (or replaced by the radius line when that angle was negative); a point with `L < step < H` is plotted when not
   swapped; a point with `step < L` or `step > H` is plotted when swapped. Missing start = 0, missing end = step 65535.
8. Points outside the viewport are skipped (clip test only when the bounding box leaves the viewport).

## 1. Entry points and data cells

| Routine | Offset | Role |
|---|---|---|
| RT3E_8D | EB1E | `[1307] = 0`, then DC92: coordinate `(x, y)`; `cx = -1` / `ax = -1` mark pointers to singles, converted with A915 (DD06-DD2F); STEP offsets `[12CA]/[12CC]` and the VIEW origin `[1366]/[1368]` added (DCB7-DCD2); result `[12CE]/[12D0]` (centre) and `[12D6]/[12D8]` (last point) |
| RT3E_2F | E2D5 | start angle: `[1307] |= 4`, single copied to `[1308]` |
| RT3E_30 | E2E1 | end angle: `[1307] |= 2`, single copied to `[130C]` |
| RT3E_31 | E2F6 | aspect: `[1307] |= 8`; `[12F8] = f`, `[1307] |= 1` when aspect >= 1 (section 3) |
| RT3E_8C | E346 | execute: radius `[BX]`, colour `DX` (section 3, 5, 6) |
| A915 / A91E | | single -> integer, round half away from zero (section 2) |
| AC92 | | INT (used on the octant number) |
| 4200 / 41EA / 41F5 | | FAC <- [BX]; dx:cx <- [BX]; [BX] <- dx:cx |
| 426A / 4274 | | FAC <- integer BX; CSNG (A880) |
| 42AB / 4283 / 4297 / DE49 | | ARG <- dx:cx then FAC = FAC*ARG (B4AE) / ARG-FAC (B362) / ARG/FAC (B52E) / ARG+FAC (B377) |
| DE5D / DE65 | | COS (BEF6) / SIN (BF0F) of FAC |
| DE36 | | FCMP FAC ? dx:cx |
| DE6D | | point (cx, dx) inside the viewport `[135E]..[1360]` x `[1362]..[1364]` -> carry |
| 6FEA + 7214 | | pixel address of (cx, dx) and write with the current colour (the PSET primitive) |
| EA0A | | LINE from the centre `[12CE]/[12D0]` to the current point (the radius line) |
| 6FE1 | | default aspect from the mode table `[0A88]/[0A8A]` (copied at SCREEN time, 8E21-8E2A) |

Data cells (DS): `[1A..1D]` FAC (mantissa lo/mid, `[1C]` sign+mantissa hi, `[1D]` exponent), `[1396]` ARG,
`[1307]` flags (1 aspect >= 1, 2 end angle, 4 start angle, 8 aspect given), `[12CE]/[12D0]` centre,
`[12D2]` R, `[12D6]` working radius (= R, E3B8), `[12FC]` k, `[12F8]` f, `[1304]` L, `[12FA]` H, `[1306]` swapped,
`[12F7]` radius-line flags (bit 0 line at L, bit 1 drawn, bit 7 line at H, bit 6 drawn), `[12F6]` clip needed,
`[12FE]` x (then k - x), `[1300]` octant base, `[1302]` d, `[1316]/[1318]` rotation temps, `[135E..1364]` viewport,
`[136A]` WINDOW active, `[134E]` WINDOW x scale.

## 2. CINT = round half away from zero (A915)

```
A915  push ax / push cx ; ax = [1C] (sign|mantissa hi, exponent), cx = [1A] (mantissa lo)
A91E  xor bx,bx ; or ah,ah ; je A955 (exponent 0 -> 0)
A924  sub ah,80h ; jb A903 (|FAC| < 1 -> rounds to 0 or +-1 there)
A929  bh = al ; bl = ch ; cx <-> ax ; cl = 16 - exponent' ; ah = bh ; jb A971 (overflow) ; je A95C (+-32768 case)
A938  or bh,80h (hidden bit) ; cmp byte [1F],4 ; je A8F0 (double)
A942  shr bx,cl        ; integer part in bx, the last bit shifted out (the 0.5 bit) in CF
A944  adc bx,0         ; + CF  -> the magnitude is rounded half UP
A947  jo A974 ; or ah,ah ; jns A94F ; neg bx   -> sign applied after rounding = half away from zero
A955  pop cx / pop ax ; [1A] = bx ; retf
```
RT3F_77 and RT3F_1B start at A911 (`mov [A08],sp` then fall into A915); RT3F_75 (A8C8) loads the operand from [SI]
and jumps to A91E. Every `CINT(...)` in the five module pseudocodes therefore rounds .5 away from zero.

## 3. Parameter conversion (RT3E_31, RT3E_8C E346-E3B8)

Aspect (E2F6-E342): FAC <- aspect; `[1307] |= 8`; if FAC is positive and its exponent byte `[1D] >= 81h`
(|aspect| >= 1): `FAC = 1.0 / FAC` (constant 1.0 = `8100:0000` in cx:dx, 4297) and `[1307] |= 1`. Then `[1D] += 8`
(x 256) and A915: `n = CINT(...)`. `[12F8] = n & 0xFF` when that low byte is not 0; otherwise 256 when `n >= 256`,
else 0 (E32E-E33F). Examples: aspect 8 -> 32, 2 -> 128, 3 -> 85 (85.33), 9 -> 28 (28.44), 1 -> 256, default 5/6 -> 213.
Without an aspect argument (`[1307] & 8 = 0`) 6FE1 returns the mode table's `bx` (aspect x 256) and `dx` (its
reciprocal x 256); `bh = 0` -> `[12F8] = bx`, else `[1307] |= 1` and `[12F8] = dx` (E39A-E3A8). Every CIRCLE in
Star Command passes an aspect (SPACE 8/2/3/9, SPBATTLE 1), so the table values were not extracted.

Radius (E346-E38F): `3F85` (one-time init), `1F6B` (error frame), colour pushed; `[BX+2] & 80h` (negative radius)
-> error 099D (illegal function call). FAC <- radius (4200); with WINDOW active (`[136A]`) FAC *= `[134E]` (E362-E36F,
not used by the game). `[12D2] = CINT(FAC)` = R (E372-E377). `k`: FAC <- CSNG(R) (426A/4274), FAC *= 0.70710678
(constant `8035:04F3` = MBF `F3 04 35 80`), `[12FC] = CINT(FAC)` (E37B-E38F).
Then (E3AC-E3C6): colour validated (DDC6: -1 = default, 2F91 range check), `[12D6] = [12D2]`, `[12F7] = [12F6] = 0`,
E466 computes the bounding box `cx +- R, cy +- scale(R)` (or the other way round when tall; E5B7) against the viewport
and sets `[12F6] = -1` when any side is outside (clip test per point).

## 4. Angle -> step (E4A9-E578), called for the start (cl = 1) and the end (cl = 80h)

```
E44F  if FAC < 0: FAC = |FAC| ; [12F7] |= cl              ' negative angle = draw the radius line to that end
E4AC  push FAC ; FAC *= 4/pi (constant 8122:F982 = MBF 82 F9 22 81 = 1.2732395) ; INT (AC92) ; bx = CINT  ' octant
E4CA  bx >= 8 -> error 099D
E4D2  ah = 0 ; if bx >= 4: ah = 1, bx -= 4
      bx = 0: al = 81h, bl = 0 | bx = 1: al = 00h, bl = 2 | bx = 2: al = 01h, bl = 2 | bx = 3: al = 80h, bl = 4
E4FF  if ah & 1: bl += 4
E507  FAC = CSNG(k * bl)                                  ' base of the octant pair on the 8k chain
E51D  pop FAC -> the angle again, the base kept in cx:dx
E528  al & 80h ? FAC = SIN(angle) (DE65) : FAC = COS(angle) (DE5D) ; FAC = |FAC| (E534-E53F)
E549  FAC = CSNG(R) * |trig|                              ' 426A/4274 on [12D6], 42AB with the pushed |trig|
E55B  al & 1 ? FAC = base + FAC (DE49) : FAC = base - FAC (4283)
E56F  dx = CINT(FAC)                                      ' the step
```
So `s(theta) = CINT(0*k + R|sin|)` in octant 0, `CINT(2k - R|cos|)` in 1, `CINT(2k + R|cos|)` in 2, `CINT(4k - R|sin|)`
in 3, and `+4k` for octants 4..7. (The add/sub identification of DE49/4283 follows from this geometry and from the
WINDOW mapping at DDD8-DDF0, which uses 4283 for `x - x0`; SIN/COS: BEF6 = COS, BF0F = SIN.)

## 5. Arc bounds (E3CD-E449)

Defaults `ax = cx = dx = 0`. Start given (`[1307] & 4`): FAC <- [1308], E4A9 -> `dx` = start step, `ax:cx` = the FAC
of the start value. End given (`[1307] & 2`): the start results are pushed, `dx = -1` default, FAC <- [130C],
E4A9 -> `bx` = end step; the two step *values* are compared as floats (DE36: end ? start): `end >= start` ->
`[1306] = 0`, `L = [1304] = start step`, `H = [12FA] = end step`; else `[1306] = -1` (swapped), the radius-line bits
of `[12F7]` are exchanged (`xor al,81h`) and `L = end step`, `H = start step`. End not given: `[12FA] = 0FFFFh`,
`[1306] = 0`. Start not given but end given: start step 0. `L == H` with a line flag set -> both line flags set
(E43C-E449).

## 6. Raster loop (E579-E5B6) and the 8-point plot (E5CF-E6C0)

```
E579  push es ; 7236 (EGA write mode) ; di = 0 (x) ; si = [12D6] (y = R) ; [1302] = 1 - R (d)
E58B  loop: push di,si ; E5CF (plot 8 points) ; pop si,di
E592  if di >= si: 7251 (restore), pop es, ret                 ' the point with x >= y was plotted
E596  ax = d ; if d >= 0: ax -= 2*si ; ax += 2 ; si -= 1          ' E59D-E5A4
E5A5  ax += 2*di + 3 ; di += 1 ; d = ax ; jmp E58B

E5CF  [12FE] = x ; [1300] = 0
      bx = scale(x) = (x*[12F8] + 80h) >> 8 ; dx = scale(y)      ' E5D9-E5F2 (mul, add 80h, adc dh,dl, dl = ah)
      if not tall: di <-> bx, si <-> dx                          ' E5F4-E5FD: wide keeps y unscaled on screen x
      [1316] = bx ; [1318] = si ; si = dx ; di = -di
      E621 (4 points) ; [1300] = k ; [12FE] = k - x ; neg [1316] ; neg di ; fall into E621 (4 more points)

E621  ax = 4 ; push ax
E625  cx = si + [12CE] ; dx = di + [12D0]                        ' screen point
E631  if [1307] & 6: arc test (E658, below) else E638
E638  if [12F6]: DE6D (inside viewport?) jb E63F else skip      ' E6BA-E6BF
E63F  6FEA ; 7214                                                ' plot
E645  pop ax ; dec ax ; je ret
      si <-> [1316] ; si = -si ; di <-> [1318] ; di = -di ; jmp E624   ' rotate to the next of the 4 points

E658  bx = [1300] ; [1300] += 2k ; step = bx + [12FE]
      step == L (E66E): [12F7] & 1 ? ([12F7] & 2 ? skip : [12F7] |= 2, radius line EA0A + 7236, skip) : plot
      step <  L (E670): [1306] ? plot : skip
      step == H (E676): [12F7] & 80h ? ([12F7] & 40h ? skip : |= 40h, radius line, skip) : plot
      L < step < H (E678): [1306] ? skip : plot
      step >  H       : [1306] ? plot : skip
```
The rotation gives, for the first group, the points `(y_u, -x_s)`, `(-x_u, -y_s)`, `(-y_u, x_s)`, `(x_u, y_s)` with
bases 0, 2k, 4k, 6k and offset x, and for the second group `(x_u, -y_s)`, `(-y_u, -x_s)`, `(-x_u, y_s)`, `(y_u, x_s)`
with bases k, 3k, 5k, 7k and offset k - x (i.e. steps 2k-x, 4k-x, 6k-x, 8k-x). `_u` = unscaled, `_s` = scaled;
in the wide case the x-screen coordinate is the unscaled one, in the tall case the y-screen coordinate is.
The radius line goes from the centre to the plotted circle point of that step (not to the exact angle point).

## 7. Pseudocode

See `decode/brun30/circle_model.py` (`basic_circle(cx, cy, radius, aspect, start, end)`); every line carries the
offsets above. Rounding: `cint(v) = sign(v) * floor(|v| + 0.5)`.

## 8. The game's CIRCLE calls

SPACE SUB_1023 (console frame), colour 2, aspect given, both halves drawn twice one pixel apart:

| CIRCLE (x, y), r, 2, start, end, aspect | centre | R | k | f | tall | L..H (steps) | pixels |
|---|---|---|---|---|---|---|---|
| (16, 75.5), 68.5, 1.57, 4.71, 8 and (15, 75.5) | (16, 76), (15, 76) | 69 | 49 | 32 | yes | 98..294 | 149 each |
| (143, 75.5) / (144, 75.5), 68.5, 4.71, 1.57, 8 | (143/144, 76) | 69 | 49 | 32 | yes | 98..294 swapped (right half) | 149 |
| (16, 171.5) / (15, 171.5), 20.5, 1.57, 4.71, 2 | (16/15, 172) | 21 | 15 | 128 | yes | 30..90 | 53 |
| (303, 171.5) / (304, 171.5), 20.5, 4.71, 1.57, 2 | (303/304, 172) | 21 | 15 | 128 | yes | 30..90 swapped | 53 |
| (248, 35.5) / (247, 35.5), 28.5, 1.57, 4.71, 3 | (248/247, 36) | 29 | 21 | 85 | yes | 42..126 | 67 |
| (304, 35.5) / (303, 35.5), 28.5, 4.71, 1.57, 3 | (304/303, 36) | 29 | 21 | 85 | yes | 42..126 swapped | 67 |
| (160, 107.5) / (159, 107.5), 36.5, 1.57, 4.71, 9 | (160/159, 108) | 37 | 26 | 28 | yes | 52..156 | 77 |
| (304, 107.5) / (303, 107.5), 36.5, 4.71, 1.57, 9 | (304/303, 108) | 37 | 26 | 28 | yes | 52..156 swapped | 77 |

The half-radius values round UP (68.5 -> 69, 20.5 -> 21, 28.5 -> 29, 36.5 -> 37): with round-half-even the arcs come
out one pixel narrower at every extreme, which is the F-2 symptom.
SPBATTLE shield arcs (SUB_1AC7 / SUB_1FB5): `CIRCLE (I!, K!), 25.5, colour, start, end, 1` -> R = 26, k = 18,
aspect 1 -> f = 256, tall (a true circle; `scale(v) = v`); start/end from the shield facing (`ArcStart!/ArcEnd!`).

## 9. Verification against DOSBox

`python -I decode/brun30/circle_model.py acceptance/ref/SP-01.png`: all 1324 distinct pixels of the 16 SPACE arcs are
colour 2 (170,0,0) in the reference capture; the only row differences are the console's horizontal LINE joins at the
arc ends (rows 7/144/145, 151/192/193, 7/64/65, 71/144/145), which are not CIRCLE pixels. With round-half-even
(R = 68/20/28/36) 202 of 1296 model pixels miss the reference; with floor (INT) 202 of 1296 miss.

## 10. Not covered / open

- PAINT (RT3E_48 ...) was not disassembled; this note is CIRCLE only.
- The default-aspect table behind 6FE1 (`[0A88]/[0A8A]`, filled from the mode table at 8E21-8E2A) was not extracted
  (no caller in the game relies on it).
- The WINDOW scaling path (`[136A]`, DD32..) and the double-precision branch of A915 (`[1F] = 4`) are not used by the game.
- The SIN/COS and FMUL helpers were identified by their use (section 4); their bodies (BEF6/BF0F/B4AE/B362/B377/B52E)
  were not transcribed. All results are MBF single precision; `circle_model.py` uses double precision, which agreed
  with the reference for every game call (the step values are at least 0.05 away from a rounding boundary).
