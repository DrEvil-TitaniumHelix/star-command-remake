# BRUN30 number-to-text output for singles (STR$ and PRINT number items)

Lane fout (Fable), 2026-10-18. Evidence: capstone disassembly of BRUN30.EXE load-module offsets (`decode/tools/dis16.py BRUN30.EXE <off> <len>`), table bytes read at file offset 0x200 + 0xFE00 + DS offset (`decode/tools/mz.py`). Confidence H throughout: every routine body below was read, and a Python model of the bytes reproduces the SP-04a reference (`.01`) and the known MS BASIC outputs (` .3333333`, ` 1.234568E+07`).

Entry points:
- **STR$ (RT3D_11, B1D5)**: `[0x10D8] = 4` (type single; B1DC sets 8 for doubles), B1E1 saves `[0x16..0x1C]` + registers, `call B21B` (format into DS:0xF78), `bx = length, dx = 0xF78`, `call A0E3` (allocate temp string of BX bytes, copy from DX), restore, retf. Result BX = temp string descriptor.
- **PRINT number item (dispatcher 99CC)**: type 04 copies the 4-byte single to `[0x1E-4] = [0x1A]` (99E4-99F0; type 02 stores BX at `[0x1A]`), then with PRINT USING off (`[0xEB7] = 0`) `call B235` (the formatter after the copy step), `inc ax` (length + 1 for the trailing space), `call 9AA0` (line-wrap check through the column/width vectors `[0xEBC]`/`[0xEBA]`: a CR/LF is emitted first when the item would not fit the line; skipped for devices reporting 0xFF), `call 9ACE` (emit the ASCIIZ text at SI through the putchar vector `[0xEC0]`), then if the separator `[0x10D9]` is not 0 (sep 01 `;` or 02 newline) one space 0x20, and for sep 02 `jmp [0xEBE]` (CR/LF). So **PRINT n; = STR$(n) + " "**, and the engine's `printNum` is `str$(n) + ' '`.

The formatter is three steps: AA2D (digits), ABA1 (round to 7 significant digits), B247 (layout).

## 1. AA2D: MBF single -> decimal digit string (DS:0xF9C), sign char (DS:0xF78)

```
AA2D  if [0x10D8] < 4 goto A9FE                      ; type 2 = integer: AA01 ax=[0x1A], sign ' '/'-', AB64 prints the
                                                     ;   decimal digits of |ax|, dx = 0 (not used by the game's singles)
AA34  bx = 0x99 (single) / 0xB9 (double)
AA3C  dl = exponent [0x1D]; if 0 goto AA1C           ; AA1C: [0xF78] = ' ', digits "0", cx = 1, dx = 0 -> " 0"
AA46  bx = bx - e                                    ; index into the signed byte table
AA48  al = ' ' ; if [0x1C] & 0x80 then al = '-'
AA53  [0xF78] = al                                   ; sign char = the first output byte
AA56  k = sbyte [bx + 0x4DC]                         ; DS:0x476..0x574 for singles (e = 1..255); cbw -> signed
AA5B  si = 0x7FC + 8*k                               ; DS:0x70C..0x974 = MBF doubles of 10^k, k = -30..46
AA67  ah = [si+7] + e ; al = -k ; push ax            ; [si+7] = exponent byte of 10^k (true exponent mod 256)
AA6F  (single path, [0x10D8] = 4)
AA76  di = [0x1A] (mantissa low word)  cl = [0x1C] | 0x80 (mantissa high byte, implicit 1 restored)
AA7E  bl = [si+6] (M hi byte, | 0x80 in B4ED)  al = [si+3] (M lowest byte)
AA87  ax = Mlowest * manthi ; push ax ; si = [si+4] (M low word)
AA8D  call B4ED  -> ax:bx = top 32 bits of mant24 * M24 (M24 = Mhi:Mlo):
        B4F9  dx:ax = Mlo * mantlo ; bx = dx ; ZF = (ax == 0)   (low word of the product is dropped)
        B503  dx:ax = Mhi * mantlo ; bx += ax ; di = dx + carry
        B50C  dx:ax = manthi * Mlo ; bx += ax ; di += dx + carry
        B514  if the dropped low word was not 0: bl |= 1        (sticky bit)
        B51A  ax = Mhi * manthi + di
AA90  pop dx ; bl += dh ; adc bh,0 ; adc ax,0        ; + (Mlowest * manthi) >> 8: the 32-bit M approximation of 10^k
AA99  dx:ax = (ax:bx) >> 8 (24-bit integer part), bl = fraction byte
AAA1  pop cx ; cx = (adj + e) & 7                    ; adj = [si+7]; shift count that makes N = value * 10^k
AAAB  shl bl / rcl ax / rcl dx  cx times             ; dx:ax:bl <<= cx
AAB6  if bl > 0x80 or (bl == 0x80 and ax odd): dx:ax += 1   ; round half to even
AAC7  N = dx:ax ; q = N / 10000 (bx = 0x2710), r = N % 10000 ; push r
AACD  call AB64 (ax = q): if q >= 10000 write one digit q / 10000 (AB6F), then AB74 writes q % 10000 as 4 digits
AAD1  pop dx ; call AB74: 4 digits of r (AB74 always writes 4 chars, zero padded: div 100, div 10 per pair)
AAD4  dx = sign-extend(-k) (the pushed al)           ; decimal exponent: value = digits * 10^dx
AAD8  cx = di - 0xF9C (8 or 9 digits) ; repe scasb '0' from 0xF9C ; inc cx ; dec di ; si = di
      -> SI = first non-zero digit, CX = digit count, DX = -k
```

N = round(mant * M * 2^(s-24)) where mant = 24-bit MBF mantissa, M = 24-bit (+ 8 low bits) mantissa of 10^k and s = (adj + e) & 7. Because the table stores the true exponent of 10^k mod 256 and k is chosen per e (k = 46 at e = 1 ... 0 at e = 153..156 ... -30 at e = 253..255; the pattern is one step every 3 or 4 exponents = log10 2), N = |value| * 10^k with 8 or 9 digits for every exponent (checked at both mantissa ends; the 16-bit `div` quotient never overflows). The product keeps only the top 32 bits of the 48-bit mant*M (plus a sticky bit), so N is the correctly rounded value in almost all cases but not all: the digits are those of the runtime, not of the exact binary value.

Double path (AAE8, not used for the game's singles): B08C and repeated subtraction of 8-byte powers of ten at DS:0x41E into 11 digits (AB32-AB5F), then the same AAC7 tail.

## 2. ABA1: round the digit string to AL significant digits, strip trailing zeros

Called from B247 with al = 7 for singles (bx = 7; 0x10 = 16 for doubles). In: SI = digits, CX = count, DX = decimal exponent.

```
ABA1  di = si + cx (end) ; if al >= cx goto ABCB    ; 7 or fewer digits: nothing to round
ABAA  drop = cx - al ; dx += drop ; di -= drop ; cx = al
ABB1  al = [di] ; [di] = '0'                         ; first dropped digit (only this one is examined)
ABB5  if al < '5' goto ABCB                          ; round half UP (digit >= 5 rounds up, no tie test)
ABB9  if cx == 0 goto ABC7
ABBB  loop: di-- ; al = [di] + 1 ; if al < ':' { [di] = al ; di++ ; goto ABCB }   ; carry absorbed
      dx++ ; cx-- ; if cx != 0 goto loop            ; a '9' is dropped (the count shrinks, the exponent grows)
ABC7  cx = 1 ; [di] = '1' ; di++                     ; all digits were 9: "1" one decade up
ABCB  di-- ; ah = cl ; std ; repe scasb '0' ; cld ; inc cx    ; strip trailing zeros backwards
ABD5  dx += (ah - cl) ; di = 0xF79 ; ret             ; CX = digits left, DX = exponent, DI = output after the sign
```

So the 7-digit rounding is half-up on the 8th digit of N (which is itself round-half-even of the product): e.g. the single -102.73555 (exact -102.7355499...) gives N = 102735550 -> "-102.7356"; the engine reproduces this.

## 3. B21B / B247: layout (fixed vs E notation)

```
B21B  copy the operand to the FAC area (type 4: 4 bytes to [0x1E-4]; type 2: [0x1A] = bx)
B235  call AA2D ; bx = 7 (single) or 16 (double) ; al = bl ; call ABA1
B24A  ax = |dx| ; if |dx| > bx goto B28A             ; E notation
B257  ax = dx + cx (= P, digits before the point) ; if P > bx goto B28A
B25F  cx = P ; bx = n (digit count)
B262  if P <= 0 goto B286: cx = -P ; '.' ; cx zeros ; n digits          -> ".01", ".0000001"
B266  copy min(P, n) digits (movsb/dec bx/loopne) ; if P > n: P-n zeros (rep stosb '0') and done  -> "100", "1000000"
B270  if digits remain: '.' then the remaining n-P digits                -> "123.4567"
B27B  si = 0xF78 ; ax = di - si (length incl. the sign char) ; [di] = 0 ; ret
B28A  first digit ; cx-- ; if cx != 0: '.' + the remaining digits, dx += cx
B295  ax = "E+" (0x2B45) ; if dx < 0: dx = -dx, ah = '-' ; if double: 'D' instead of 'E' ; stosw
B2A9  al = dx / 100 ; if not 0 write it ; aam 10 on dx % 100 ; write two digits (zero padded)   -> "1E-02", "1.5E-07", "1E+38"
```

Rules, as conditions on the rounded digit string (n digits, value = digits * 10^dx):
- Fixed notation iff **|dx| <= 7 and dx + n <= 7**, i.e. the fixed form needs at most 7 digits counting the leading zeros after the point and the trailing zeros before it. `.0000001` (dx = -7) and `9999999` are fixed; `1E-08`, `1.5E-07` (would need 8 places), `1E+07` and `1.234568E+07` are E notation. There is no "0.01" lower bound: `.001`, `.0001`, `.0099999` are fixed, `1.234568E-02` is E because `.01234568` would be 8 digits.
- Mantissa in E notation: `d` or `d.ddd` with trailing zeros stripped; exponent sign always written, two digits with a leading zero, a third digit only for |exp| >= 100 (never for singles).
- No leading `0` before the point; integers get no point; negative sign `-` or a leading space for positive and zero; `" 0"` for zero (MBF exponent 0, sign ignored).

## Engine

`game/engine/basic.js` `str$` implements steps 1-3 on the IEEE single's bits (same 24-bit mantissa, e = IEEE exponent + 2; IEEE denormals, which MBF cannot hold, print as `" 0"`; |n| >= 2^127 throws Overflow because the MBF arithmetic would have), with the two tables copied from DS:0x476 and DS:0x70C. `game/engine/fout.test.mjs` pins 60 edge cases and 160 random singles against the Python model of this document.
