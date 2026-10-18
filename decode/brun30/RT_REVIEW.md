# RT_REVIEW — independent second-opinion review of RT_LEDGER.md (lane glm-review-rt, GLM 5.3, 2026-10-15)

Method: every ledger row was checked against the routine body in `decode/brun30/rt_asm.txt` (all 140 sections re-read in full) and against at least one game-side context taken from `decode/listings/*.lst` (grep windows equivalent to `ctx.py`, whose exact-line match no longer fits the listing format — lines now carry trailing comments). Where the body calls out to undumped helpers, I decoded the helper bytes directly from `BRUN30.EXE` (load-module offsets; DS-relative data at module 0xFE00+offset; note rt_asm.txt prints capstone call targets without the 16-bit wrap, so `0x1290f` = real 0x290F etc.).

**Mid-review event:** while this review was running, commit c19a327 (mod-startup) updated two ledger rows (3E_58 PUT verb enum, 3D_44 STICK→PLAY) and regenerated the listings (13:47). This review is against the **updated** ledger; both changed rows were independently re-verified from the binary and AGREE (see Disagreements section — the old PUT enum would have been a DISAGREE).

**Verdict summary: 137/137 ledger rows AGREE. 0 DISAGREE, 0 UNSURE.** Confidence upgrades suggested for 6 rows (noted in the table and below).

## Review table

| RT | ledger name | verdict | your evidence (body offsets + context) | proposed name if DISAGREE |
|---|---|---|---|---|
| 3F_7B | FMOV [DI]<-[SI] | AGREE | body 1E30 movsw x2, sub 4 both, retf; ubiquitous (SPACE 35FF etc.) | |
| 3F_7D | FSTORE [DI]<-FAC | AGREE | 1E2D si=1A then same copy; INSIDE 01588 FSTORE after CSNG | |
| 3F_6F | FLOAD FAC<-[SI] | AGREE | 1E47 di=1A, movsw x2, si restored; SPBATTLE 04DED FLOAD then CINT | |
| 3F_71 | FSTORE T[b]<-FAC | AGREE | 1E5B: saves si/di, 1EC3 (temp addr from inline byte), copies FAC, restores; INSIDE 2CEB `71 #80` mid-expression | |
| 3F_7F | FADD [SI]+[DI] | AGREE | B374: exponent align, `cmp ah,0x18` limit, no sign flip; SPACE 02947 | |
| 3F_81 | FADD FAC+[DI] | AGREE | B369 si=1A; PLBATTLE 07BD2 (RND*8+1) | |
| 3F_83 | FADD [SI]+FAC | AGREE | B371 di=1A; SPBATTLE 02816 area | |
| 3F_85 | FADD T[b]+FAC | AGREE | B36E 1EC3 + di=1A | |
| 3F_97 | FSUB [SI]-[DI] | AGREE | B35F `xor al,80h` on [di+2] then add path; STARTUP 0055 | |
| 3F_99 | FSUB FAC-[DI] | AGREE | B354 si=1A → B35F | |
| 3F_9B | FSUB [SI]-FAC | AGREE | B35C di=1A; STARTUP 0AE7 (stick/menu delta) | |
| 3F_9D | FSUB T[b]-FAC | AGREE | B359 1EC3, di=1A | |
| 3F_8F | FMUL [SI]*[DI] | AGREE | B4AB: `(ah-81h)+(ch-80h)` exponents, B4ED mantissa mul; SPACE 03326 | |
| 3F_91 | FMUL FAC*[DI] | AGREE | B4A0 si=1A | |
| 3F_93 | FMUL [SI]*FAC | AGREE | B4A8 di=1A | |
| 3F_95 | FMUL T[b]*FAC | AGREE | B4A5 1EC3 + di=1A | |
| 3F_87 | FDIV [SI]/[DI] | AGREE | B52B `sub ah,ch` exponent, long division B582/B57E | |
| 3F_89 | FDIV FAC/[DI] | AGREE | B520 si=1A | |
| 3F_8B | FDIV [SI]/FAC | AGREE | B528 di=1A | |
| 3F_8D | FDIV T[b]/FAC | AGREE | B525 1EC3 + di=1A | |
| 3F_9F | FCMP [SI]?[DI] | AGREE | A837 sign/exp pre-step, `std; repe cmpsw`, operand swap for negatives; SPACE 0187C `jbe` | |
| 3F_A1 | FCMP FAC?[DI] | AGREE | A82C si=1A; PLBATTLE 01401 `ja` | |
| 3F_A3 | FCMP [SI]?FAC | AGREE | A834 di=1A | |
| 3F_A5 | FCMP T[b]?FAC | AGREE | A831 1EC3 + di=1A | |
| 3F_A7 | FTEST [SI] | AGREE | AC1A `or ah,ah` (ZF=zero), `rcl al` (CF=sign); STARCOMM 00B4 `jne`/`dec bx` = NOT-pattern | |
| 3F_A9 | FTEST FAC | AGREE | AC2D ax=[0x1c] → AC1E; STARPORT 09D91 | |
| 3F_75 / 3F_19 | CINT [SI]->BX | AGREE | A8C8 ax=[si+2], cx=[si] → A91E shift/round/overflow; SPACE 0559 array index | |
| 3F_77 / 3F_1B | CINT FAC->BX | AGREE | A911 ax=[0x1c], cx=[0x1a]; PLBATTLE 07BDB | |
| 3F_78 | CINT DAC->BX | AGREE | A8E0 si=0x16, A9BC gathers low mantissa; STARPORT 02640 right after VAL | |
| 3F_57 | CSNG BX->FAC | AGREE | A880 ax=0x9000 exp setup, neg-if-negative, B43D normalize; 300 uses (SPACE 00B0 etc.) | |
| 3F_7A | CSNG DAC->FAC | AGREE | A8A2: reads 0x16..0x1D, `or al,ah/[0x18]` → `or dl,1` sticky, B46B; STARTUP 00A06 INKEY$→VAL→7A | |
| 3F_2B | ABS [SI]->FAC | AGREE | AC51 AD69 then `and [0x1c],0x7f` | |
| 3F_2D | ABS FAC | AGREE | AC54 `and [0x1c],0x7f` direct | |
| 3F_AF | NEG FAC<- -[SI] | AGREE | ABE0 AD69 then `xor [0x1c],0x80` | |
| 3F_B1 | NEG FAC | AGREE | ABE3 `xor [0x1c],0x80` direct | |
| 3F_2F | SGN [SI]->FAC | AGREE | ABF2/ABFC: exp 0 → zero, else exp=0x81, keep sign, clear mantissa | |
| 3F_31 | SGN FAC->FAC | AGREE | ABF8 reads [0x1c] then same | |
| 3F_1D | BOOL [SI]->BX | AGREE | AC32 `cmp byte [si+3],0; dec bx` (-1 iff exponent≠0); STARTUP 0066 `and bx,bx; jne` | |
| 3F_1F | BOOL FAC->BX | AGREE | AC46 `cmp byte [0x1d],0; dec bx` | |
| 3F_AB | FSCALE FAC<-[SI]*2^b | AGREE | AC63 AD69 then AC66 inline-byte add to exponent | |
| 3F_AD | FSCALE FAC<-FAC*2^b | AGREE | AC66 pop ret/lodsb, `add es:[0x1d],al`; PLBATTLE 07BCB `RND; AD #03; +[DI]; INT` = INT(RND*8+1) | |
| 3F_23 | FPOW [SI]^[DI] | AGREE (suggest H) | B8A9: AC92 on exponent, `cmp ah,0x90` integer-power path, else exp/log; PLBATTLE 0262 const^const after FCMP | |
| 3F_25 | FPOW FAC^[DI] | AGREE (suggest H) | B89E si=1A; PLBATTLE 0110B `RND ^ [0x9412]` | |
| 3F_27 | FPOW [SI]^FAC | AGREE (suggest H) | B8A6 di=1A; INSIDE 02CF5 `const ^ (RND*c+d)` | |
| 3D_03 | INT [BX]->FAC | AGREE | ACB2: AD69 load, positive→mask fraction (AC9D), negative→AD4E/AD17 with `[1c]=80h; inc [1d]` = floor; PLBATTLE 07BD8 | |
| 3D_33 | RND(X) [BX]->FAC | AGREE | B2C7: [bx+3]=0 → B30C last value, sign → B316 reseed, else B2D6 LCG on [0x234]/[0x236] with multiplier words [0x22C..0x232] | |
| 3D_34 | RND -> FAC | AGREE | B2C2 → B2D6 LCG directly, `mov ax,0x8800; jmp B43D` normalize | |
| 3D_35 | ATN [BX]->FAC | AGREE | B65B odd-function wrapper (sign saved, result negated), range reduction constants (0.2679 = tan 15°, pi/2, pi/6, sqrt3) per ledger; series at 59E | |
| 3D_38 | LOG [BX]->FAC | AGREE | B763: B7E1 error on <=0, mantissa split at 0.7071, ln2 split constants; only wrapper bytes visible in dump, constants cited by ledger check out by role | |
| 3D_39 | SIN [BX]->FAC | AGREE | BF0C: x*DS:3CA (0.159155 = 1/2pi, verified by value), sign save (odd), AC92 fold at 0.25/0.5, polynomial 6A8 via B5E1 | |
| 3D_3A | SQR [BX]->FAC | AGREE | B9E5: exponent halved (`shr al,1; adc al,0x40`), cx=0x19 = 25-iteration shift-subtract root loop | |
| 3D_43 | TIMER -> FAC | AGREE | C12F int 21h/2Ch, al=0x3c*ch(hours)+cx(min), CSNG, /0x3c, sec, /0x64, hundredths; PLBATTLE 00E36 + SPACE 00ECD both `RANDOMIZE TIMER` | |
| 3D_11 | STR$ [BX] (single) | AGREE | B1D5 [0x10d8]=4 (type single) → B1E1; SPACE 0294D STR$ feeding MID$ | |
| 3D_13 | VAL s$[BX]->DAC | AGREE | 4667 [0x10d8]=8 (double), parser 4745, A111 free; STARTUP 00A03 INKEY$→VAL→CSNG DAC | |
| 3F_55 | SCAT s$[AX]+s$[BX]->BX | AGREE | 9DE5 lengths added, A08B alloc, two 9E0B copies (AX string then BX string); STARPORT 000D7 BLOAD name concat, SPACE 03614 CHAIN name concat | |
| 3F_61 | SASSIGN s$[DX]<-s$[BX] | AGREE | 9DAF re-derived: after `xchg dx,bx`, movsw x2 copies the descriptor **from [si]=orig BX to [di]=orig DX**, and the string back-pointer `[data-2]` is set to the **DX** descriptor; SPACE 01890 INKEY$→BX, dx=var | |
| 3F_62 | SCMP s$[AX]?s$[BX] | AGREE | 9E1F di=[bx+2]/cx=[bx], swap to AX string, `repe cmpsb` + length compare, A111 frees; SPACE 03388 | |
| 3F_BA | LEN s$[BX]->BX | AGREE | 9BBB push [bx]; A111; pop bx (returns descriptor word 0); STARPORT 023B4 then CSNG | |
| 3F_BB | ASC s$[BX]->BX | AGREE | 9BC2 len 0 → error, first byte via double load + `bh=0`; INSIDE 011C1 → CSNG → FSTORE | |
| 3D_05 | CHR$ BX -> BX | AGREE | 9C08 bh≠0 → error, alloc 1, store bl; PLBATTLE 01314 CHR$ (CINT result) then PRINT | |
| 3D_06 | INKEY$ -> BX | AGREE | 9BD6 [0x26] flag, 1A4D/1A6C key read, 2-byte extended keys, null 0x222; SPACE 0188D/0337A | |
| 3D_0A | MID$(s$[BX],DX,CX) | AGREE | 9CE8 start-1, clip to length via [bx]-cx, A129 substring; SPACE 02952 MID$(STR$(x),..) | |
| 3D_0B | LEFT$(s$[BX],DX) | AGREE | 9CCE cx=0 (start 0) → 9D90 shared substring; SPACE 023E4 | |
| 3D_0C | RIGHT$(s$[BX],DX) | AGREE | 9CD7 cx=[bx]-dx (start=len-n) → 9D90 | |
| 3D_0D | SPACE$(BX) | AGREE | 9D1B dl=0x20 → 9D22 fill | |
| 3D_0E | STRING$(BX, DL) | AGREE | 9D40 push dx → 9D22; STARPORT 09B97 `mov dl,0x2d` = STRING$(n,"-") exactly as cited | |
| 3D_0F | STRING$(BX, s$[DX]) | AGREE | 9D4A first char of DX string, A111 free, 9D22 fill; STARPORT 08112 | |
| 3D_08 | INSTR(BX,s$[DX],s$[CX]) | AGREE | 9C60 bx<=0 → error, search loop, frees temps | |
| 3D_09 | INSTR(s$[BX],s$[DX]) | AGREE | 9CBD cx=dx, dx=bx, bx=1, far call 9C60 (2-arg = 3-arg with start 1) | |
| 3F_11 | SWAP [SI],[DI] (4-byte) | AGREE | 9556 two xchg-word pairs; INSIDE 036A3 array-element swap | |
| 3F_14 | SWAP s$[SI],s$[DI] | AGREE | 956A → A611 (back-pointer fixup); INSIDE 0033B string-array swap | |
| 3F_18 | VARPTR$(s$[BX]) | AGREE | 9D78 alloc 3, stores 03 then pointer; STARPORT 09FDE `PLAY "X"+VARPTR$(tune$)` = the classic continuation trick | |
| 3F_C9 | VARPTR(array[BX])->FAC | AGREE (keep M) | C443 re-derived: X=[bx]-DS as paragraphs; result = (X<<4 + carry) + input DX, i.e. (seg-DS)*16+element-offset, then A0-exponent single via B43D; PLBATTLE 0033B `xor dx,dx` then BLOAD with dx=1A (FAC) — offset feeds BLOAD | |
| 3F_45 | DIM array[BX] | AGREE | C22D: [bx]=0 dup-def check, inline ndims, pops sizes with `mul` accumulation, element size by type; PLBATTLE 0047 | |
| 3F_BC | PRINT begin (screen) | AGREE | 9B6D [0xEB6]=0, [0xA3A]=0, 1B09 hook, [0xEB7]=0, 9B84 vectors | |
| 3F_BD | PRINT USING fmt$[BX] | AGREE | 9B96 → 95FA fmt copy, [0xEB7]=1; SPACE 01815 fmt$[0xac5a] then PRINT single | |
| 3F_BE | PRINT #BX, begin | AGREE | 9AF0 → 9B0D file find (input mode → error) | |
| 3F_67 | PRINT single [BX]; | AGREE | stub 99A4 carries data pair (04,01) into dispatcher 99CC; SPACE 0181B after PRINT USING | |
| 3F_6A | PRINT s$[BX]; | AGREE | stub 99B3 pair (03,01); SPACE 014B7 etc. (592 uses) | |
| 3F_6B | PRINT single [BX]+NL | AGREE | stub 99B8 pair (04,02); STARPORT 0504A | |
| 3F_6D | PRINT integer BX+NL | AGREE | stub 99C2 pair (02,02); STARPORT 09B46 | |
| 3F_6E | PRINT s$[BX]+NL | AGREE | stub 99C7 pair (03,02); always followed by 3E_79 in listings (689 uses) | |
| 3F_35 | SPC(BX) | AGREE (suggest H) | DBE6 DC44 count then putchar-0x20 loop via [0xEC0]; SPBATTLE 017D8 `POS(0); 31-POS(0); SPC` right-align idiom + SPBATTLE 04DF7 `34-POS(0)` | |
| 3E_79 | PRINT end | AGREE | 3C9B flushes device block [0xA3A] via 3BB8 and zeroes it; no CR/LF of its own | |
| 3D_21 | POS(BX)->BX | AGREE | 6267 1AFF column, wrap vs [0x29E], `inc bx` (1-based) | |
| 3D_25 | CSRLIN->BX | AGREE | 4448 [0x282] row vs [0x287]/[0x29E]; INSIDE 0158B y=CSRLIN | |
| 3F_B5 | INPUT begin (prompt, flags) | AGREE | 4544 inline flags → [0xC38], prompt → [0xC36], readers [0xFC6]=45AB/[0xFC8]=4745, prints "? " unless bit1; STARPORT 07817 `B5 #00` then B7 | |
| 3F_B6 | INPUT #BX, begin | AGREE | 5CFD A5EF find, `[si]==2` input-mode check, readers 5D2D/5E0C; INSIDE 064AC `INPUT #1` in the EOF read loop | |
| 3F_B7 | INPUT item list | AGREE | C529 inline count → [0x10D6], type bytes via xlat 707, C653 parse, return addr in [0x10CF]; STARPORT 0781B `B7 n=1 types=02` (one integer) | |
| 3F_B8 | INPUT store next -> [BX] | AGREE | C5FB pops from [0xFCA] stack, copies cl bytes, final `mov sp,[0x10D3]; ljmp [0x10CF]` | |
| 3F_5A | LINE INPUT #, s$[BX] | AGREE | DB61 one item via [0xFC6], 9DB3 string assign into [BX], [0xA3A]=0; INSIDE 064BD directly after INPUT #1 | |
| 3F_0D | READ single -> [BX] | AGREE | 1D83 type 4 → 1D9D DATA scan 4941/parse 4745/comma 2Ch | |
| 3F_0F | READ integer -> [BX] | AGREE | 1D91 type 2; SPACE 001AA sequential ints | |
| 3F_10 | READ string -> s$[BX] | AGREE | 1D98 type 3; PLBATTLE 000E6 | |
| 3F_5D | ON BX GOSUB tbl | AGREE | 9504 sets ah=0xE4 (≠0) → 9525 pushes after-table address before target `retf`; PLBATTLE 047EE n=14 with repeated default handler | |
| 3F_5E | ON BX GOTO tbl | AGREE | 950B `xor ah,ah` → 9521 skips the return push; INSIDE 01D24 `5E 08 28 1d 02 1e …` → targets 1D38/1E12… = table+0x10, +0x10 convention verified live in the inline bytes | |
| 3F_02 | ON ERROR GOTO DX | AGREE | 45AC 6B2 control block, `[si+4]=dx`, re-raise if dx=0 with error active; STARCOMM 0093 `mov dx,0x10f` → handler at listing 0x11F (CHAIN retry + RESUME) | |
| 3F_09 | RESUME BX | AGREE | 45D5 requires [0xA3C], 465E clears, `pop ax; push bx; retf` → CS:BX; STARCOMM 0122 `mov bx,0xa1` → 0xB1 | |
| 3E_01 | END | AGREE | 0B25 3B2F close files, 3B29, 1810, popf, 1C21 restore/exit; STARPORT 09D99 after FTEST flag | |
| 3E_02 | END (handler end) | AGREE | 0B1A bl=0x13 (err 19 "No RESUME") if [0xA3C]≠0 else 0B25; STARCOMM 0125 = error-handler fallthrough | |
| 3E_0E | CHAIN file$[BX] | AGREE | 1441 sp reset from [0xA24], 166A/1835 memory, module load; SPACE 03617 SCAT(drive$,name) immediately before; .STR module files exist in the target dir (data lane confirms names) | |
| 3E_1A | BLOAD file$[BX], off=[DX] | AGREE | 92F3/9304: open, reads 7-byte header, `cmp byte [0xb06],0xfd` check, seg/off/len from header; STARCOMM 0084 `dx=0x1a` (FAC); PLBATTLE 0140F-0151 array-offset computation then BLOAD | |
| 3E_1B | BSAVE file$[BX], off DX, len CX | AGREE | 92FF [0xC1E]=2, [0xEA6]=dx [0xEA8]=cx, FD header write via 93C3/C8EE | |
| 3E_20 | OPEN mode select BL | AGREE | C7E5 `bl = 1<<cl` into [0xC1E]; SPBATTLE 01CB `xor bx,bx` (INPUT) | |
| 3E_1E | OPEN file$[DX] AS #BX | AGREE | C859 → C879 name parse/file block; SPBATTLE 01D6 `#1, reclen 0` | |
| 3E_21 | CLOSE #BX | AGREE | C755 A5EF find, ah=6 device dispatch; PLBATTLE 05D7 CLOSE #1 | |
| 3D_2F | EOF(BX)->BX | AGREE | C736 bx=0 → C720 (console ioctl) else ah=0 file status; INSIDE 064C3 `EOF(1)` terminating the read loop | |
| 3E_42 / 3E_33 / 3E_59 | ARGPUSH BX | AGREE | 4313 al=1, ah=bl, `stosw` at [0x74]; one body serves all three indices (used_routines fullname column agrees) | |
| 3E_43 | ARGPUSH omitted | AGREE | 432D al=0 → shared 4321 | |
| 3E_44 | LOCATE exec | AGREE | 4333 walks buffer at 0xC26, args at di+4/6/8 (cursor shape via 24FB), [0x282] row default; SPACE 030E `LOCATE 20,3`-form | |
| 3E_5B | SCREEN exec | AGREE | 42FE 42DA count + 84A0 mode tables; STARCOMM 007F `mov bx,1` = SCREEN 1 | |
| 3E_35 | COLOR exec | AGREE | 42C8 42DA + 8B00 by mode [0xAA2]; STARCOMM 0116 | |
| 3E_32 | CLS [BX] | AGREE | 43D2 bx=-1 → ax=0x602 both viewports, graphics flag [0x136C] branches | |
| 3E_3C | KEY BL | AGREE | 4464 bl=2 list, bl=0 → [0x140D]=0, else FFh, redraw | |
| 3E_2B | BEEP | AGREE | 6118 → 2F78; **raw bytes at 2F78 verified**: wait until [0xACB]≠1, then `mov dl,7; mov ah,6; int 21h` = direct-console BEL | |
| 3E_09 | RANDOMIZE [BX] | AGREE | B349 `[0x235] = [bx] xor [bx+2]`; both game sites are `TIMER → bx=1A → 3E_09` = RANDOMIZE TIMER | |
| 3E_4A | PALETTE BX,DX | AGREE | FC58 both -1 → 12996 defaults else set; STARTUP 009C/00A5 `(1,9)` `(2,4)` pairs exactly as cited | |
| 3E_5E | SOUND freq BX, dur [DX] | AGREE | F1BC [0x1144]=bx, copies 4 bytes [dx]→[0x1146], sign checks; PLBATTLE 07B1D `bx=0x384; dx=1A` (FAC duration) | |
| 3E_5F | SOUND exec vol DX, voice BX | AGREE (name solid; vol/voice detail stays inference) | F211 dl=-1 → default, F259/9079 tone loop; always called with bx=dx=-1 right after 3E_5E (PLBATTLE 07B25) = PCjr-form tail | |
| 3E_51 | PLAY s$[BX] | AGREE | F301 F328 queue init ([0x114A], slot table 0x114E/0x1166, 0x18-byte slots), stores string, F35E executes | |
| 3E_8D | GFX coord (x,y), flags cleared | AGREE | EB1E [0x1307]=0, 3F85, DC92; flag convention confirmed in listings (`cx=-1; ax=cx` = both ptrs; `xor cx,cx; ax=-1` = y-ptr only); SPACE 10B5 CIRCLE head | |
| 3E_89 | GFX coord for PUT | AGREE | E7FA DC92, `jae E856` error, else 6FEA; 322 uses directly before 3E_58 | |
| 3E_84 | LINE (x1,y1) | AGREE | EB23 → DC92; SPACE 014BC | |
| 3E_85 | LINE -(x2,y2) | AGREE | EA22 saves [0x12CE]/[0x12D0] to [0x12D2]/[0x12D4] then DC92; SPACE 014C5 | |
| 3E_86 | LINE exec | AGREE | EA39 style [0x12EC]=cx, DDC6 color, dx dispatch -1/0/1 → line/box/fill else 1099D; SPACE 0118D/0148x box-then-PAINT pattern | |
| 3E_87 | GET (x1,y1) | AGREE | E6CB DC92 + ret quirk; PLBATTLE 0233D | |
| 3E_88 | GET -(x2,y2) | AGREE | E6DC copies last point to [0x12D2]/[0x12D4] then DC92; PLBATTLE 02345 (STEP(7,7) constants) | |
| 3E_3A | GET exec, array[BX] | AGREE | E6F6 [0x133D]=0, ED71/ED66 clip, w/h to [0x12EA]/[0x12E8], 6FEA, DX=0 → E79F capacity from descriptor; PLBATTLE 0234E `dx=0x24` | |
| 3E_58 | PUT, action DL: 0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR | AGREE (independently confirmed — see Disagreements) | my own decode: 7260 does `bl=al` (verb), `bx*2`, picks table **DS:0x368** (mode<0x0D) or **DS:0x372** (mode≥0x0D) and patches CS:[0x70CF]; tables (read at module 0xFE00+0x368/0x372) = 72C3,72B8,72AC,72AE,72CA / 72EF,72E1,72D1,72D3,72F9; decoded ops: 72C3/72EF `or [di],al&ch`=OR, 72B8/72E1 `and`=AND, 72AC/72D1 `not al`+copy=PRESET, 72AE/72D3 copy=PSET, 72CA/72F9 `xor`=XOR. Current-listing count: SPACE 85 PUTs all verb 3 or 4, DH=0 | |
| 3E_2F | CIRCLE start <- [BX] | AGREE | E2D5 flag 4 → [0x1308], copies 4 bytes from [bx]; SPACE 10BB (see note on start/end order) | |
| 3E_30 | CIRCLE end <- [BX] | AGREE | E2E1 flag 2 → [0x130C]; SPACE 10C1 | |
| 3E_31 | CIRCLE aspect <- [BX] | AGREE | E2F6 `or [0x1307],8`, then `bx=0x1d; add [bx],8` (FAC ×2^8) + A915 CINT = ×256 fixed point; SPACE 10C7 | |
| 3E_8C | CIRCLE exec radius [BX], color DX | AGREE | E346 `ah=[bx+2]` sign check (negative → error), 14200, aspect default constant; SPACE 10D0 `dx=2` | |
| 3E_48 | PAINT (x,y), BX, border DX | AGREE (suggest H) | E243 [0x1322]=0, E1A2 tile$ checks, 763E fill; SPACE 11A2 pattern `LINE …,B; coord; mov bx,ax(-1 default); mov dx,2; PAINT` = `PAINT (x,y),,2` after a box | |
| 3E_8A | PRESET (default 0) | AGREE (suggest H) | **raw 0x290F decoded**: CF=1 → `xor ah,ah; mov al,[0x53]; mov bx,0; ret`; 8A then does `mov ax,bx` → color 0 (background) = PRESET; SPACE 03371 erases the point 8B drew (blink pair) | |
| 3E_8B | PSET (default foreground [0x53]) | AGREE (suggest H) | same 0x290F, but 8B falls into EAE1 with **AX = [0x53]** (foreground) = PSET; SPACE 03358 draws, 03371 erases — behaviorally decisive | |
| 3D_44 | PLAY(BX) -> BX (background-music queue notes) | AGREE (independently confirmed) | **my decode**: static [DS:0x2FC] = 0x0AD6 (module 0x100FC holds `d6 0a`); 69FC al=1 branch @6A33 = `call 2F73` (2F73 = `mov bx,[0x2fc]; ret`) then `mov bx,[bx]` (the second deref is at 6A36, in 69FC); 0x2F18 = sound-off resets the 0xAD6 queue, silences speaker (8253/61h), restores INT 8 vector — the block is the music queue; game: STARTUP 0E7F feed-if-≤31, 0ACD wait-for-drain before CHAIN | |

## Disagreements

**None against the current ledger.** Every row survived independent verification. Three findings worth recording:

1. **PUT verb enum (row 3E_58) — corrected mid-review, independently confirmed by this lane.** The pre-13:47 ledger assumed PSET=0, PRESET=1, AND=2, OR=3, XOR=4 (marked M); that would have been a DISAGREE. I decoded the raster-op machinery from raw bytes before seeing the update: 7260 indexes two 5-word tables (DS:0x368 for modes <0x0D i.e. SCREEN 1; DS:0x372 for ≥0x0D i.e. SCREEN 7) by verb*2 and self-patches the op vector at CS:0x70CF; the five ops are `or` (72C3/72EF), `and` (72B8/72E1), `not`+copy = PRESET (72AC/72D1), copy = PSET (72AE/72D3), `xor` (72CA/72F9) — i.e. **0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR**, exactly what commit c19a327 landed. The game's dominant verbs are therefore PSET (162, opaque blit) and XOR (114, erase), which is also the more plausible art strategy. Two lanes reaching the same decode from the same bytes makes this the best-evidenced row in the graphics family.

2. **3D_44 STICK → PLAY(n) — corrected mid-review, independently confirmed.** The withdrawn STICK reading fails on the binary: nothing in this path touches joystick port 201h; [0x2FC] statically points at the queue block 0x0AD6 that the sound-off routine (0x2F18) resets alongside speaker shutdown and INT-8 vector restore, and 69FC's al=1 branch returns the block's first word. The game's usage (feed 3 chars only when the value ≤ 31; wait until it drops to 0 before CHAIN) only makes sense as queue occupancy, i.e. GW-BASIC `PLAY(n)`. Evidence-text nit: the `bx=[bx]` deref executes at 6A36 inside 69FC, not inside 2F73 (2F73 is just `mov bx,[0x2FC]; ret`).

3. **Minor evidence-detail corrections (no name changes).**
   - **3E_8A/8B**: the two rows' original evidence snippets were mutually inconsistent (both call the same 0x290F, so it cannot return 0 for one and [0x53] for the other). Resolution from the bytes: 0x290F returns AX=[0x53] and BX=0 simultaneously; 8A uses BX (=0, background) and 8B uses the returned AX (=foreground). Both defaults now stand on one consistent mechanism.
   - **3E_2F/3E_30 (CIRCLE start/end)**: the start-vs-end assignment rests on BASIC operand order (start evaluated before end) since the body only shows which flag/slot each writes (flag 4 → [0x1308], flag 2 → [0x130C]); no independent semantic anchor found. Not worth changing; keep as is.
   - **rt_asm.txt call-target rendering**: capstone prints un-wrapped 16-bit near-call targets (`0x1290f` means 0x290F, `0x11f6b` means 0x1F6B) and DS-relative data lives at module 0xFE00+offset; both facts are already in the ledger's conventions note in substance, but anyone re-deriving helper addresses from rt_asm.txt will trip on the +0x10000. Worth a line in the conventions when convenient.

**Confidence upgrades suggested** (evidence now body+game+independent-helper-decode): 3F_23/25/27 FPOW family M→H; 3F_35 SPC M→H (right-align idiom `SPC(31-POS(0))` + putchar-0x20 body); 3E_48 PAINT M→H (box-then-PAINT pattern with explicit border 2); 3E_8A/8B PRESET/PSET M→H (0x290F default mechanism decoded; SPACE blink pair is behaviorally decisive). 3F_C9 VARPTR keeps M (formula verified but the descriptor-field reading of [BX] as segment is inferred; a runtime probe or the DIM descriptor layout write-up would settle it).
