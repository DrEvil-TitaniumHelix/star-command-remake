# BRUN30 runtime routine ledger (Star Command decode)

Convention (evidence: BRUN30.EXE handlers at 0x0048/0x00BB/0x00E9, read 2026-10-15): `INT 3Dh/3Eh/3Fh` + 1 inline byte n -> near call to word table[n] at BRUN 0x0171 / 0x0243 / 0x038D. Handler pops the return address, reads the inline byte, advances the return IP by 1, dispatches; when flag [0x2F]&0x40 it rewrites the call site into a far call (self-patching). `INT 3D 00 wwww` = far call through pointer table es:[0xA1E] (user-library / cross-module).

Confidence: H = read the routine body and matched game-side usage; M = body or usage only; L = pattern guess. Unknowns stay RTxx_nn.

## Proven conventions (offsets are BRUN30 load-module offsets; DS data offsets live at load-module 0xFE00 + offset)

- **FAC** = single accumulator DS:0x1A..0x1D (MBF: mantissa lo/mid/hi+sign, exponent at 0x1D, sign = bit 7 of 0x1C). **DAC** = double accumulator DS:0x16..0x1D. `[0x1E]` = end of the accumulator area (the PRINT dispatcher copies an n-byte value to 0x1E-n).
- **Temps T[b]**: routines calling 0x1EC3 (RT3F_71/85/8D/95/9D/A5) pop the return address, read one inline byte b and address an 8-byte temp slot at `[0x10 or 0x12] + ((b<<1)&0xFF)*4` = `base + (b&0x7F)*8` (body 1EC3-1EF3). Game uses b = 80h..98h (T0..T24). RT3F_71 stores FAC into T[b]; the others use T[b] as the [SI] operand. Note (crossref 2026-10-15): the temp base [0x10/0x12] is module header word 17 (SPACE 0xA860, SPBATTLE 0x6FAA, STARPORT 0xA87C, INSIDE 0x8968, PLBATTLE 0xBE88, STARTUP 0xD624), proven on SPACE/SPBATTLE/STARPORT; qb2bas.py --tempbase takes that value.
- **Inline-byte scaling** (RT3F_AB/AD): pop return, lodsb b, `add [0x1D],b` -> FAC * 2^b (body AC66-AC8A).
- **FP operand forms**: each binary op has 4 table entries: `[SI] op [DI]`, `FAC op [DI]` (si=1A stub), `[SI] op FAC` (di=1A stub), `T[b] op FAC` (1EC3 + di=1A). Negating the DI operand before the add path (`xor al,80h` on [di+2] at B365) = subtract.
- **Error frame**: `call 0x1F6B` saves regs + sp for the error dispatcher; `mov [0xA08],sp` likewise. `0x1099D` = "Illegal function call", `0x109A6` = overflow-class error, `0x99D` = error dispatch.
- **Statement argument buffer**: `[0x74]` = write pointer into 0xC26..; `RT3E_42/33/59` push `(flag=1, BL)`, `RT3E_43` pushes `(0, ?)` = "argument omitted"; the executing routine (LOCATE/COLOR/SCREEN) resets `[0x74]=0xC26`.
- **PRINT item dispatcher 0x99CC**: pops return, `lodsw cs:` the (type, sep) pair stored at the entry stub: type 03 = string descriptor at [BX], 02 = integer in BX, 04 = single at [BX], 08 = double at [BX]; sep 01 = `;` (numbers get a trailing space), sep 02 = newline after the item (`jmp [0xEBE]` = 0xDA4F CR/LF), sep 00 = comma zone-tab (9A7A; unused by the game). Output vectors 0xEBA..0xEC6 are copied from DS:0x3B0 by 0x9B84.
- **String descriptor** = (len u16, ptr u16); temp strings are freed by 0xA111; 0xA08B allocates; 0xA129 makes a substring temp; DS:0x222 = null-string descriptor.
- **Graphics coordinate convention** (0xDC92): BX = x, DX = y; CX = -1 means BX is a pointer to a single, AX = -1 means DX is a pointer to a single, 0 = integer literal. Result stored to [0x12CE]/[0x12D0] (current) and [0x12D6]/[0x12D8] (last point).
- **rt_asm.txt call targets** (RT_REVIEW note): capstone prints un-wrapped 16-bit near-call targets, so `call 0x1290f` = 0x290F and `0x11f6b` = 0x1F6B; helper bytes are read at BRUN30 file offset 0x200 + address.
- **Module code addresses in operands** (ON GOTO tables, RESUME, ON ERROR GOTO, LINES block): **listing offset = CS offset + 0x10**. Verified three ways: INSIDE ON GOTO table at 1D3E with entries 1D42,1D5A,.. -> case blocks at 1D52,1D6A,.. (24-byte PUT blocks right after the table); STARCOMM RESUME 0xA1 -> 0xB1 (`mov si,19B8` instruction start); STARCOMM ON ERROR GOTO 0x10F -> 0x11F = the handler `mov bx,0xA1; RT3F_09`. The data lane found the same +0x10 from the LINES block (MODULE_CONSTANTS.md).

## Corrections to earlier rows (2026-10-15, rt-naming lane)
- RT3F_61 direction is **s$[DX] <- s$[BX]** (was BX<-DX): body 9DAF copies the descriptor from [orig BX] to [orig DX] (after `xchg dx,bx`, movsw si=dx(src) di=bx(dst)) and sets the string data back-pointer to the DX descriptor; game: `RT3D_06 (INKEY$ -> BX); mov dx,var; RT3F_61` (SPACE 1890). Data lane agrees (STARTUP 0x40: literal in BX, variable in DX).
- RT3F_6E/6B/6D are the **newline-terminated** PRINT items (sep 02), not "single var": 6E = string, 6B = single, 6D = integer in BX.
- RT3E_84/85/86 = LINE (first coord / second coord / execute); RT3D_03 = INT().
- RT3F_7F/81 are plain FADD (no sign flip in B374); the FSUB family is 97/99/9B/9D.

## Ledger

| RT | name | conf | evidence (body offsets; one game-side context) |
|---|---|---|---|
| 3F_7B | FMOV [DI] <- [SI] (4-byte single) | H | body 1E30: movsw x2, restore SI/DI; 3018 uses `mov di,var; mov si,var; call` |
| 3F_7D | FSTORE [DI] <- FAC | H | body 1E2D: si=1A then same copy |
| 3F_6F | FLOAD FAC <- [SI] | H | body 1E47 |
| 3F_71 b | FSTORE T[b] <- FAC (temp slot, 1 inline byte) | H | body 1E5B: save SI/DI, 1EC3 (DI = temp addr), copy FAC, restore; SPACE 026C `RT3F_71 #80` then `RT3F_97` on the saved operands |
| 3F_7F | FADD [SI]+[DI] -> FAC | H | B374: exponent align (<=24 bits) then add; no sign flip. INSIDE 1D1E |
| 3F_81 | FADD FAC+[DI] -> FAC | H | B369: si=1A; jmp B374 |
| 3F_83 | FADD [SI]+FAC -> FAC | H | B371: di=1A; jmp B374. SPBATTLE 2662 |
| 3F_85 b | FADD T[b]+FAC -> FAC | H | B36E: 1EC3, di=1A, B374. SPBATTLE 0A94 (`71 #81 ... 85 #81`) |
| 3F_97 | FSUB [SI]-[DI] -> FAC | H | B35F: `xor al,80h` on [di+2] (negate DI) then add path B37A. SPBATTLE 3D35 |
| 3F_99 | FSUB FAC-[DI] -> FAC | H | B354: si=1A; jmp B35F. PLBATTLE 1859 |
| 3F_9B | FSUB [SI]-FAC -> FAC | H | B35C: di=1A then B35F. STARPORT 1524 |
| 3F_9D b | FSUB T[b]-FAC -> FAC | H | B359: 1EC3, di=1A, negate, add. SPBATTLE 0DA9 |
| 3F_8F | FMUL [SI]*[DI] -> FAC | H | B4AB: exponents (ah-81h)+(ch-80h), B4ED mantissa multiply. SPBATTLE 2890 |
| 3F_91 | FMUL FAC*[DI] -> FAC | H | B4A0: si=1A |
| 3F_93 | FMUL [SI]*FAC -> FAC | H | B4A8: di=1A. SPBATTLE 1025 (`CSNG BX; mov si,dx; 93`) |
| 3F_95 b | FMUL T[b]*FAC -> FAC | H | B4A5: 1EC3, di=1A. PLBATTLE 82CC |
| 3F_87 | FDIV [SI]/[DI] -> FAC | H | B52B: exp[SI]-exp[DI], long division via B582/B57E. STARPORT 1513 |
| 3F_89 | FDIV FAC/[DI] -> FAC | H | B520: si=1A. PLBATTLE 4919 |
| 3F_8B | FDIV [SI]/FAC -> FAC | H | B528: di=1A. SPBATTLE 0AD7 |
| 3F_8D b | FDIV T[b]/FAC -> FAC | H | B525: 1EC3, di=1A. SPBATTLE 0D99 |
| 3F_9F | FCMP [SI] ? [DI] -> flags (use ja/jb/je) | H | A837: sign/exponent compare, `std; repe cmpsw`, operands swapped for negatives. SPACE 187C `jbe` |
| 3F_A1 | FCMP FAC ? [DI] -> flags | H | A82C: si=1A. PLBATTLE 9D50 |
| 3F_A3 | FCMP [SI] ? FAC -> flags | H | A834: di=1A. INSIDE 3260 |
| 3F_A5 b | FCMP T[b] ? FAC -> flags | H | A831: 1EC3, di=1A. SPACE 32D3 |
| 3F_A7 | FTEST [SI] (ZF=zero, CF=negative) | H | AC1A. SPBATTLE 56DF `jbe` |
| 3F_A9 | FTEST FAC | H | AC2C: ax=[1C]; jmp AC1E. INSIDE 0A4F |
| 3F_75 / 3F_19 | CINT [SI] -> BX | H | A8C8 (both table indices point here): exponent-driven shift, overflow check, rounding. SPACE 0559 |
| 3F_77 / 3F_1B | CINT FAC -> BX | H | A911. PLBATTLE 8C62 |
| 3F_78 | CINT DAC (double) -> BX | H | A8E0: si=16, A9BC gathers low mantissa, A91E. STARPORT 2640 right after VAL |
| 3F_57 | CSNG BX -> FAC | H | A880: exponent 90h, neg if negative, normalize B43D |
| 3F_7A | CSNG DAC -> FAC (double to single, sticky-bit rounding) | H | A8A2: reads 16..1D, `or dl,1` sticky, B46B. STARTUP 0A06 after VAL |
| 3F_2B | ABS [SI] -> FAC | H | AC51: AD69 (FAC<-[SI]) then `and [1C],7Fh`. SPBATTLE 2E48 |
| 3F_2D | ABS FAC | H | AC54. SPBATTLE 0E2B |
| 3F_AF | NEG FAC <- -[SI] | H | ABE0: AD69 then `xor [1C],80h`. STARPORT 1096 |
| 3F_B1 | NEG FAC | H | ABE3. PLBATTLE 4B53 |
| 3F_2F | SGN [SI] -> FAC (-1 / 0 / +1 as single) | H | ABF2: ax=[si+2]; ABFC: exp 0 -> 0, else exp=81h, keep sign, clear mantissa. SPACE 7D0A |
| 3F_31 | SGN FAC -> FAC | H | ABF8. PLBATTLE 3627 |
| 3F_1D | BOOL [SI] -> BX (-1 if nonzero else 0) | H | AC32: `cmp [si+3],0; dec bx`. STARTUP 0066 `and bx,bx; jne` |
| 3F_1F | BOOL FAC -> BX | H | AC46. PLBATTLE 3D9F |
| 3F_AB b | FSCALE FAC <- [SI] * 2^b (1 inline byte) | H | AC63: AD69 then AC66. PLBATTLE 91C5 `RT3F_AB 02` |
| 3F_AD b | FSCALE FAC <- FAC * 2^b (1 inline byte) | H | AC66: pop ret, lodsb, `add [1D],al`. PLBATTLE 7BCB `RND; AD 03; +[DI]; INT` = INT(RND*8+1) |
| 3F_23 | FPOW [SI]^[DI] -> FAC | H | B8A9: INT of exponent via AC92, integer-power path when integral and < 2^16 (cmp ah,90h at B8D4), else LOG/EXP path. PLBATTLE 0262 (const^const after FCMP). M->H per RT_REVIEW (glm-review-rt) |
| 3F_25 | FPOW FAC^[DI] -> FAC | H | B89E: si=1A -> B8A9. PLBATTLE 110B `RND ^ [0x9412]`. M->H per RT_REVIEW |
| 3F_27 | FPOW [SI]^FAC -> FAC | H | B8A6: di=1A -> B8A9. INSIDE 2CF5 `const ^ (RND*c+d)`. M->H per RT_REVIEW |
| 3D_03 | INT [BX] -> FAC | H | ACB2: AD69 load, exponent test, AD17/AD4E mask the fraction, round toward -inf (`mov [1C],80h; inc [1D]` for negatives). PLBATTLE 7BD8 `INT(RND*8+1)` feeding ON..GOSUB |
| 3D_33 | RND(X) [BX] -> FAC | H | B2C7: x=0 -> B30C last value, x<0 -> B316 reseed from the value bytes, else B2D6 LCG on [0x234]/[0x236] with multiplier [0x22C..0x232]. SPACE 38E2 |
| 3D_34 | RND -> FAC | H | B2C2: 1F6B; jmp B2D6 (LCG, exponent 88h normalize). SPACE 0566 |
| 3D_35 | ATN [BX] -> FAC | H | B65B: odd-function wrapper; B67C: x>=1 -> 1/x and pi/2 (DS 3D6 = 1.5708) minus; constants pi/6 (DS 3E2), tan(pi/12) (DS 3EE = 0.2679), sqrt3 (DS 3F6); series table 59E. SPBATTLE 0DA0 |
| 3D_38 | LOG [BX] -> FAC | H | B763: B7E1 errors on <=0, splits the mantissa around sqrt(.5) (DS 3C2 = 0.7071), ln(m) series, then n*ln2 with split constants DS 5CE = 0.693359 / DS 5D2 = -0.000212194. SPACE 0171 |
| 3D_39 | SIN [BX] -> FAC | H | BF0C: x*DS:3CA (0.159155 = 1/2pi), sign saved/restored (odd), INT via AC92, fold at 0.25/0.5 (DS 412 = 0.5), polynomial table 6A8 via B5E1. PLBATTLE 8E3C |
| 3D_3A | SQR [BX] -> FAC | H | B9E5: exponent halved (`shr al,1; adc al,40h`), 25-iteration shift-subtract root loop. SPBATTLE 0D23 |
| 3D_43 | TIMER -> FAC | H | C12F: int 21h/2Ch, ((h*60+m)*60+s)*100+hundredths, /100 via C16C. PLBATTLE 0E36, followed by RT3E_09 = RANDOMIZE TIMER |
| 3D_11 | STR$ [BX] (single) -> BX | H | B1D5: type 4 -> B1E1 saves FAC/DAC, B21B formats, A0E3 builds the temp string. SPACE 0278 (bx=1A). Number-to-text algorithm (AA2D digits, ABA1 7-digit rounding, B247 fixed/E layout, tables DS:0x476/0x70C): FOUT.md (fout lane 2026-10-18) |
| 3D_13 | VAL s$[BX] -> DAC (double) | H | 4667: A212, type 8, number parser 4745 on the string data, A111 frees. STARPORT 263D followed by 3F_78 |
| 3F_55 | SCAT s$[AX]+s$[BX] -> BX (temp) | H | 9DE5: lengths added (jo "string too long"), A08B alloc, copies the AX string then the BX string via 9E0B. STARPORT 00D7 (`bx="GALMAP.BAS" ax=drive$`) |
| 3F_61 | SASSIGN s$[DX] <- s$[BX] | H | 9DAF (see Corrections). SPACE 1893 |
| 3F_62 | SCMP s$[AX] ? s$[BX] -> flags | H | 9E1F: repe cmpsb then length compare, frees temps. SPACE 189B `je` |
| 3F_BA | LEN s$[BX] -> BX | H | 9BBB: push [bx]; A111; pop bx. STARPORT 23B4 |
| 3F_BB | ASC s$[BX] -> BX | H | 9BC2: len 0 -> error; first byte; A111. INSIDE 11C1 |
| 3D_05 | CHR$ BX -> BX | H | 9C08: bh!=0 -> error, alloc 1, store bl. PLBATTLE 1314 |
| 3D_06 | INKEY$ -> BX | H | 9BD6: [0x26] key flag, 1A4D/1A6C/2DC6 read key, alloc 1 or 2 (extended key) bytes, null string 0x222 if none. SPACE 188D |
| 3D_0A | MID$(s$[BX], start DX, len CX) -> BX | H | 9CE8: dx-1 start (jl error), clip to length, A129 substring. SPACE 677B |
| 3D_0B | LEFT$(s$[BX], DX) -> BX | H | 9CCE: cx=0; 9D90 (dx=0 -> null string 0x222). SPACE 5A57 |
| 3D_0C | RIGHT$(s$[BX], DX) -> BX | H | 9CD7: cx=len-dx; 9D90. INSIDE 1431 |
| 3D_0D | SPACE$(BX) -> BX | H | 9D1B: dl=20h; 9D22 alloc+fill. STARPORT 663A |
| 3D_0E | STRING$(BX, char DL) -> BX | H | 9D40: push dx; 9D22. STARPORT 9B97 (dl=2Dh '-') |
| 3D_0F | STRING$(BX, s$[DX]) -> BX | H | 9D4A: first char of the DX string, A111, 9D22. STARPORT 8112 |
| 3D_08 | INSTR(start BX, s$[DX], find$[CX]) -> BX | H | 9C60: bx<=0 -> error, repne scasb / repe cmpsb, frees temps. INSIDE 67CA |
| 3D_09 | INSTR(s$[BX], find$[DX]) -> BX | H | 9CBD: cx=dx, dx=bx, bx=1, far call 9C60. INSIDE 6759 |
| 3F_11 | SWAP [SI],[DI] (4-byte numeric) | H | 9556: exchanges two words. INSIDE 36A3 |
| 3F_14 | SWAP s$[SI],s$[DI] (string descriptors; fixes back-pointers) | H | 956A -> A611. INSIDE 033B |
| 3F_18 | VARPTR$(s$[BX]) -> BX (3-byte string: 03, addr lo, addr hi) | H | 9D78: dl=3, alloc 3, stores dl then bx. STARPORT 9FDE then concat + PLAY ("X"+VARPTR$) |
| 3F_C9 | VARPTR(array[BX]) -> FAC (DS-relative offset as single; DX = element offset) | M | C443: `test [bx+2],80h` far/near array descriptor, (seg-DS)*16+off, exponent A0h normalize. PLBATTLE 033B before BLOAD name$, FAC |
| 3F_45 b | DIM array[BX] (b = number of dimensions; sizes pushed on the stack; 1 inline byte) | H | C22D: `cmp [bx],0` already dimensioned, pop ret, lodsb count, pops dims, multiplies sizes, element size by type. PLBATTLE 0047 `push 0C42h; mov bx,8030h; RT3F_45 01` |
| 3F_BC | PRINT begin (screen) | H | 9B6D: [EB6]=0 (not WRITE), [A3A]=0 (device = screen), hook 1B09, [EB7]=0 (not USING), 9B84 copies the output vectors. 1019 uses |
| 3F_BD | PRINT USING fmt$[BX]; begin | H | 9B96: 9B84, [A3A]=0, 95FA copies fmt to [0xA2E] via 9DB3, [EB7]=1, formatter [EB8]=961E. SPACE 1815; "###"/"####" literals at SPACE lm 09B6C/0A168 |
| 3F_BE | PRINT #BX, begin | H | 9AF0: 9B0D (A5EF find file, input-mode -> error, [A3A]=block), [EB6]=0. STARPORT 9D12 right after OPEN #1 |
| 3F_67 | PRINT single [BX]; | H | stub 99A4 pair (04,01). STARPORT 14BE. Text = STR$ + one space (99CC -> B235, 9A19 emits 0x20 for sep 01/02): FOUT.md |
| 3F_6A | PRINT s$[BX]; | H | stub 99B3 pair (03,01). 592 uses |
| 3F_6B | PRINT single [BX] + newline | H | stub 99B8 pair (04,02). STARPORT 504A then RT3E_79. Number text: FOUT.md |
| 3F_6D | PRINT integer BX + newline | H | stub 99C2 pair (02,02): `mov [1A],bx`. STARPORT 9B46 |
| 3F_6E | PRINT s$[BX] + newline | H | stub 99C7 pair (03,02). 689 uses, always followed by RT3E_79 |
| 3F_35 | SPC(BX) (emit BX spaces, n mod width) | H | DBE6: DC44 computes the count (n mod width via [EBC]/[EBA]), loop putchar 20h via [EC0]. SPBATTLE 17CE-17D8 `xor bx,bx; POS(0); sub bx,1Fh; neg bx; SPC` = `SPC(31-POS(0))` right-align idiom (also SPBATTLE 4DF7 `34-POS(0)`). M->H per RT_REVIEW |
| 3E_79 | PRINT end (flush file device block [A3A], reset) | H | 3C9B: no CR/LF itself (the newline comes from the sep-02 item). 1073 uses |
| 3D_21 | POS(BX) -> BX (cursor column, 1-based) | H | 6267: 1AFF ah=[0x283], wrap check vs [0x29E], +1. SPBATTLE 17D0 `xor bx,bx; 3D_21` |
| 3D_25 | CSRLIN -> BX (cursor row, 1-based) | H | 4448: [0x282] row vs [0x287]/[0x29E]. INSIDE 158B |
| 3F_B5 b | INPUT begin (keyboard): prompt s$[BX], b = flags (bit1: suppress "? "); 1 inline byte | H | 4544: pop ret, lodsb, [C38]=flags, [C36]=prompt, readers [FC6]=45AB [FC8]=4745, prints "? " unless bit1. STARPORT 7817 `RT3F_B5 00` then RT3F_B7 |
| 3F_B6 | INPUT #BX, begin | H | 5CFD: A5EF find file, output-mode -> error, [A3A]=block, readers 5D2D/5E0C. INSIDE 64AC |
| 3F_B7 n,t.. | INPUT item list: inline count byte then `count` type bytes; raw byte -> xlat DS:0x707 = `83 02 04 08 03`, so raw 01 = integer, 02 = single, 03 = double, 04 = string (corrected 2026-10-15 by lane verify; was listed as 04 single/03 string/02 integer); parses the items via [FC6]/[FC8] | H | C529: pop ret, al=count -> [10D6], type bytes via xlat 707 (BRUN30 file offset 0x200+0xFE00+0x707), C653 parse, pushes values; return address saved in [10CF]. PLBATTLE 052C `RT3F_B7 01 04` (string); STARTUP 05B0 type 04 -> 0x488C later SASSIGN ""; SPACE 05098 types 04 04 -> strings 0xB37E/0xB382; SPACE 050BA type 02 -> single Scratch! |
| 3F_B8 | INPUT store next item -> [BX] (pops a parsed value; after the last item restores the stack) | H | C5FB: pops from the [FCA] value stack, copies cl bytes (3 = string assign), `dec [10D6]`, final `mov sp,[10D3]; ljmp [10CF]`. PLBATTLE 0534 |
| 3F_5A | LINE INPUT #, s$[BX] | H | DB61: one item via [FC6] with si=FCE, far call 9DB3 (string assign) into [BX], [A3A]=0. INSIDE 64BD after RT3F_B6 |
| 3F_0D | READ single -> [BX] (DATA pointer) | H | 1D83: type 4; 1D9D: 6B2 DATA pointer, 4941 scan, 4745 parse, comma check (2Ch). SPBATTLE 0E62 |
| 3F_0F | READ integer -> [BX] | H | 1D91: type 2. SPACE 01AA |
| 3F_10 | READ string -> s$[BX] | H | 1D98: type 3. PLBATTLE 00E6 |
| 3F_5D n,tbl | ON BX GOSUB tbl: inline count byte + count words (CS offsets; listing = +0x10); pushes the address after the table as return | H | 9504: stack check, ah!=0 path pushes dx (after-table) as GOSUB return, `shl bx; dx=[bx+si]; push ds; push dx; retf`. PLBATTLE 47EE |
| 3F_5E n,tbl | ON BX GOTO tbl (same table form, no return pushed) | H | 950B: `xor ah,ah` then the shared body. INSIDE 1D24 `5E 08 28 1D 02 1E ...` |
| 3F_02 | ON ERROR GOTO DX (CS offset; 0 = disable) | H | 45AC: 6B2 reads the control block pointer, `[si+4]=dx`; dx=0 with an error active re-raises via A41. STARCOMM 0093 `mov dx,10Fh` = handler at listing 0x11F |
| 3F_09 | RESUME BX (CS offset) | H | 45D5: requires [A3C] error active, 465E clears it, `pop ax; push bx; retf` -> CS:BX. STARCOMM 0122 `mov bx,0A1h` -> listing 0xB1 |
| 3E_01 | END | H | 0B25: 3B2F close files, 3B29, 1810 release memory, 1C21 restore screen/key line, exit. STARPORT 9F42 after CHAIN |
| 3E_02 | END (error-handler fallthrough: error 19 "No RESUME" if an error is active, else END) | H | 0B1A: bl=13h; [A3C]==0 -> 0B25 else 0AC4. STARCOMM 0125 |
| 3E_0E | CHAIN file$[BX] (load and run module) | H | 1441: resets sp from [A24], 166A/1835 memory, loads the module. SPACE 3617 (`drive$+"STARPORT.STR"`); data lane confirms the names |
| 3E_1A | BLOAD file$[BX], offset = [DX] (DX -> single holding the DS offset; DX=1A -> FAC) | H | 92F3: [EAA]=1 [C1E]=1 then 9304: [EA6]=dx, open (C879), reads the 7-byte header FDh seg off len, 9592 converts the [EA6] single. PLBATTLE 0151 (`CSNG 1850h -> FAC; dx=1A`) |
| 3E_1B | BSAVE file$[BX], offset DX, length CX | H | 92FF: [C1E]=2, [EA6]=dx [EA8]=cx, writes the FDh header via 93C3/C8EE. INSIDE 63BB (`cx=157Eh dx=8968h`) |
| 3E_20 | OPEN mode select BL (0 INPUT, 1 OUTPUT, 2 RANDOM, 3 APPEND -> [C1E]=1<<bl) | H | C7E5. SPBATTLE 01CB `xor bx,bx` before OPEN |
| 3E_1E | OPEN file$[DX] AS #BX, reclen CX (0 = default) | H | C859 -> C879: parses the name (D7DF), file block. SPBATTLE 01D6 |
| 3E_21 | CLOSE #BX | H | C755: A5EF find block, function ah=6 via C921/C931 device dispatch. PLBATTLE 05D7 |
| 3D_2F | EOF(BX) -> BX (BX=0: stdin via ioctl 44h/06) | H | C736: bx=0 -> C720 int 21h ioctl, else function ah=0 via C921. INSIDE 64C3 `and bx,bx; jne` |
| 3E_42 / 3E_33 / 3E_59 | ARGPUSH BX (statement argument buffer; one body for all three indices) | H | 4313: push (1,BL) at [0x74]. LOCATE row (841 uses), COLOR/SCREEN args (STARCOMM) |
| 3E_43 | ARGPUSH omitted argument | H | 432D: al=0 -> 4321. STARPORT 1462 `LOCATE ,col` |
| 3E_44 | LOCATE exec (last arg BX): row, col, cursor, start, stop from the buffer | H | 4333: args at C26, 24FB cursor shape, [0x282] row default. 850 uses after ARGPUSH |
| 3E_5B | SCREEN exec (last arg BX) | H | 42FE: 42DA push + count [C25], 84A0 (BIOS equipment byte 0:410 check, mode tables). STARCOMM 0043 `SCREEN 1`; data lane: bx=1/7 |
| 3E_35 | COLOR exec (last arg BX) | H | 42C8: 42DA, 8B00 (behaviour by current mode [AA2] = 0Dh/7/4, [AC7]). STARCOMM 004F `COLOR 0,1` |
| 3E_32 | CLS [BX] (-1 omitted, 0..2) | H | 43D2: -1 -> both viewports (ax=602h, or 101h/700h by [136C] graphics flag); bits select [0x29C] screen clear / 39A6 / 38C7+389B home cursor. PLBATTLE 01AF before LOCATE 1,.. |
| 3E_3C | KEY BL (0 OFF, 1 ON, 2 LIST) | H | 4464: bl=2 -> 449F list (table 13DC), bl=0 -> [140D]=0, else FFh, redraw 39A6. STARCOMM 0075 `KEY OFF` |
| 3E_2B | BEEP | H | 6118 -> 2F78: int 21h/06 dl=7. STARPORT 23A4 |
| 3E_09 | RANDOMIZE [BX] (seed = word0 xor word1 of the value) | H | B349: [0x235] = [bx]^[bx+2]. SPACE 0ECD `TIMER; bx=1A; 3E_09` |
| 3E_4A | PALETTE BX, DX (-1,-1 = reset) | H | FC58: both -1 -> 2996 default table cs:8C63 by mode; else set. STARTUP 00A1 `PALETTE 1,9 : PALETTE 2,4` |
| 3E_5E | SOUND freq BX, duration [DX] (DX -> single) | H | F1BC: [1144]=bx, copies 4 bytes [dx] -> [1146], sign/exponent checks. PLBATTLE 7B1D (dx=1A) |
| 3E_5F | SOUND exec, volume DX, voice BX (-1 = omitted; PCjr/Tandy form) | H | F211: dl=-1 -> default, F259/9079 tone loop. PLBATTLE 7B25 `bx=dx=-1` |
| 3E_51 | PLAY s$[BX] | H | F301: F328 init queue ([114A],[1182], slot table 114E), store string, F35E executes via F0AD/F404. STARPORT 9FE7; data lane: "MBMLT126" literal |
| 3E_8D | GFX coord (x,y) with statement flags cleared ([1307]=0): start of CIRCLE/PAINT/PSET/PRESET | H | EB1E: [1307]=0; 3F85; 1F6B; DC92. SPACE 10B5 |
| 3E_89 | GFX coord (x,y) for PUT (range-checked) | H | E7FA: DC92; jae E856 error else 6FEA pixel address. 322 uses before 3E_58 |
| 3E_84 | LINE first coord (x1,y1) | H | EB23: DC92. PLBATTLE 22BB |
| 3E_85 | LINE second coord (x2,y2) (saves the previous point to [12D2]/[12D4]) | H | EA22. PLBATTLE 22C4 |
| 3E_86 | LINE exec: color BX (-1 default), DX = -1 plain / 0 box B / 1 filled BF, CX = style (-1 none) | H | EA39: [12EC]=cx, DDC6 color, dx dispatch E8B3 (line) / 4 lines / EC76 fill. PLBATTLE 22CC |
| 3E_87 | GET first coord (x1,y1) | H | E6CB: DC92; jae; ret quirk. PLBATTLE 233D |
| 3E_88 | GET second coord (x2,y2) (saves the last point) | H | E6DC. PLBATTLE 2345 |
| 3E_3A | GET (x1,y1)-(x2,y2), array[BX] (DX = array capacity in words, 0 = from descriptor via E79F) | H | E6F6: [133D]=0, ED71/ED66 clip, stores w/h [12EA]/[12E8], 7729 bounds, writes the w,h header at es:[bx]. PLBATTLE 234E |
| 3E_58 | PUT (x,y), array[BX], action DL: 0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR (DH!=0: BX is a far-array descriptor) | H | E808: [133D]=1, E7D8 far/near, E7EC reads w,h, 725C, E9A5, 7260 selects the raster op: `bx=verb*2`, table DS:0x368 (CGA modes) = 72C3,72B8,72AC,72AE,72CA / DS:0x372 (EGA) = 72EF,72E1,72D1,72D3,72F9; 72C3 `and al,ch; or es:[di],al` = OR, 72B8 = AND, 72AC `not al` + copy = PRESET, 72AE copy = PSET, 72CA `xor es:[di],al` = XOR. Game uses 3 PSET (162), 4 XOR (114), 2 PRESET (11), 1 AND (1); STARTUP restores the title picture over animation frames with verb 3 (mod-startup lane) |
| 3E_2F | CIRCLE start angle <- [BX] (single ptr; flag 4, copied to [1308]) | H | E2D5. SPACE 10BB |
| 3E_30 | CIRCLE end angle <- [BX] (flag 2, [130C]) | H | E2E1. SPACE 10C1 |
| 3E_31 | CIRCLE aspect <- [BX] (flag 8; FAC*256 CINT fixed point) | H | E2F6: `add [1D],8` then A915 CINT. SPACE 10C7 |
| 3E_8C | CIRCLE exec: radius [BX] (single ptr), color DX | H | E346: ah=[bx+2] sign check (negative radius -> error), 14200 convert, CINT, aspect constant 8035:04F3. SPACE 10D0 |
| 3E_48 | PAINT (x,y), paint BX (color, or tile$ descriptor), border DX | H | E243: [1322]=0, E1A2 (string-descriptor length checks, frees temp -> tile form), E2BF current point, 6FEA, DDC6, 763E fill. SPACE 1178-118D `LINE (16,144)-(143,145),2,B` then 1190-11A2 coord (16,75); `mov bx,ax; mov dx,2; PAINT` = `PAINT (x,y),,2` inside a border-2 box. M->H per RT_REVIEW |
| 3E_8A | PRESET (x,y)[,BX color] (default 0) | H | EAA2: bx=-1 -> `stc; call 290F` then `mov ax,bx` (=0); 2F91 set color; DE6D plot. Raw BRUN30 0x290F (file 0x2B0F) `72 0c ... 32 e4 a0 53 00 bb 00 00 c3`: CF=1 -> `xor ah,ah; mov al,[0x53]; mov bx,0; ret`, i.e. returns AX=[0x53] (foreground) AND BX=0 at once; 8A uses BX = background. SPACE 3371 erases the point 3358 drew. M->H per RT_REVIEW (evidence corrected: one mechanism for 8A and 8B) |
| 3E_8B | PSET (x,y)[,BX color] (default foreground [0x53]) | H | EAD0: bx=-1 -> `stc; call 290F` and falls into EAE1 with the returned AX=[0x53] (foreground; same 290F as 3E_8A); 2F91; DE6D. SPACE 3358 draws, 3371 (PRESET) erases = blink pair. M->H per RT_REVIEW |
| 3D_44 | PLAY(BX) -> BX (notes remaining in the background music queue) | H | F2E2: ax=1, ah=bl (bx<=1), 69FC: al=1 branch at 6A33 `call 2F73` (2F73 = `mov bx,[0x2FC]; ret`; static DS:0x2FC = 0x0AD6, file bytes `d6 0a` = music queue block), then `mov bx,[bx]` at 6A36 inside 69FC (raw `e8 3d c5 8b 1f`) = count. Game: STARTUP 0E7F `IF PLAY(0) > 31 OR TunePlaying=0 THEN RETURN` before feeding 3 more tune chars with `PLAY "X"+VARPTR$`; STARTUP 0ACD waits until PLAY(0)=0 or it dropped by >2 before CHAIN. (Earlier STICK reading withdrawn by the mod-startup lane.) |
