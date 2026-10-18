# STARPORT — verification (lane verify, Opus, 2026-10-15)

Inputs:
- `decode/pseudo/STARPORT.bas.md`, `STARPORT_SCREENS.md`, `STARPORT_names.json` (lane mod-starport).
  - The sample text was taken at 5b90190. The file was regenerated in 71f36ac (verify translator fixes); the findings below are re-checked against the current file.
- `decode/listings/STARPORT.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` + `decode/data/tools/_STARPORT.json`.

**Sample:**
- 2700 statement lines in `## Pseudocode`. Python `random.seed(20261015)`, `random.sample(range(2700), 270)` (10%), plus every CHAIN / BLOAD / BSAVE / ON GOTO / ON GOSUB / INPUT / OPEN line (35 sites, 31 not already drawn) = **301 statements**.
- Each statement was derived from the listing first, then compared with the pseudocode text. Four independent passes (subagents of this lane) did this.
- This lane re-checked each DISAGREE against the bytes.
- A fifth pass did names (45, same seed), all DEF FN bodies (3) with 9 call sites, the screens and the Unknowns.

## Summary

- 301 statements: **299 AGREE, 2 DISAGREE, 0 UNSURE**.
  - 08F25 is a PRINT USING split; it is fixed in the current file.
  - **09B16 is a register-reuse defect that is still open**, and the same defect affects 09B27 out of sample. The rendering shows fresh `RND` draws where the code reuses the values it just stored, which changes game behaviour (the save-game password prompt).
- DEF FNs: FNCrew 0797, FNIdx 07C9 and FNCredits 07E8 match their bodies and caller slots; no FN is mislabelled.
- Names: 33/45 SUPPORTED, 1 WEAK (ClassNo!), 11 NOT FOUND (names shared from SPACE that STARPORT never uses; harmless).
- Screens: 249 quoted texts all proven (237 literals, 12 concatenations), 24/24 coordinates and 22/22 PUT verbs match. One prose error (frame redraw) and one omission (logo box).

## Disagreements and fix requests

1. **09B16 / 09B27 — register reuse rendered as new RND calls (translator; open in the current file).** Bytes:
   - 9ADE-9AF2: `Sect% = CINT(INT(RND*10))`, kept in ax.
   - 9AF5-9B08: `Ord% = CINT(INT(RND*5))`. Then `xchg bx,ax`, so ax = Ord% and bx = Sect%.
   - 9B0B-9B16: `dx = cx = Ord%; ax = 5; imul bx; add ax,cx` → `WordIdx% = 5 * Sect% + Ord%`.
   - 9B19: `dx = bx = Sect%`.
   - 9B27-9B4x: `PRINT "Type the "; Ordinal$(Ord%)` (cx·4 + 0xA710 at 9B30-9B38); `" word in section"; Sect% + 1` (dx, `inc dx`).
   - The current file renders `WordIdx% = 5 * CINT(INT(RND * 10)) + CINT(INT(RND * 5))` and `... Ordinal$(CINT(INT(RND * 5))) ... CINT(INT(RND * 10)) + 1`. That would draw three new random numbers. Correct renderings:
     - `WordIdx% = 5 * Sect% + Ord%`
     - `PRINT "Type the "; Ordinal$(Ord%); " word in section"; Sect% + 1`
   - The translator should render an integer register whose value was just stored to an integer variable as that variable, not as the expression that produced it.
2. **08F25 — PRINT USING split** (one RT3F_BD .. FNCredits at 8F31 .. one RT3E_79 at 8F3A). It was rendered as `PRINT USING "#######";` + `PRINT FNCredits(0)`, which loses the format. **Fixed** in 71f36ac: it now reads `PRINT USING "#######"; FNCredits(0)`.
3. Out of sample, **fixed** by 71f36ac (re-checked: no bare `PRINT` and no `= FAC` lines remain in the file):
   - 06FCC PRINT/FN split → `PRINT Status$(CINT(FNCrew(I!, 31)))`;
   - 0AA5F variable-STEP FOR (`DotY! = FAC`).
   - Cosmetic splits after a `;` (output unchanged): 2EB1, 2EE2, 415A, 57C7, 5E3F, 5E7C, 5F9A, 5FD7, 619B, 6F73, 7003, 7C45, 8A5D.
4. **STARPORT_SCREENS.md §0:** it says the frame (SUB_1C09) is drawn "once on entry and after the medal ceremony". SUB_1C09 has one caller (`0107D call 0x1c09`); the medal ceremony ends with `0AC3F call 0x1efd`, which only re-PUTs the starport picture. The frame description also omits the inner logo box `LINE (231,6)-(313,26),,B` (1CFC-1D15).
5. Names (no rendering impact):
   - `ClassNo!` (AF3A) is a reused scratch variable. It is the size class only at 51D2 (column +0x36); at 29F8-2A0B it reads column +0 (drop-ship parts), and at 501F it is G!(43)-1 (a ship index).
   - The `1988 CreditsHi!` `_why` still cites SPACE's mislabelled FN at 5982; the proof here is the FNCredits body 07E8.
   - `DefHardware!` stores `NumIn%+1` (a type) at 4EBB.
   - `EntryMode!` is set to 1 before CHAIN SPACE.STR (9ED5).
   - 11 names shared from SPACE are not referenced in STARPORT.lst.

## Names, DEF FN and screens pass (output of the fifth pass)

### STARPORT verification: names, DEF FNs, screens (lane verify, 2026-10-15)

Inputs: decode/pseudo/STARPORT_names.json, STARPORT.bas.md, STARPORT_SCREENS.md, decode/listings/STARPORT.lst (SPACE.lst for inherited cites), decode/data/tools/_STARPORT.json (literals), RT_LEDGER PUT verb map.

#### Summary

- Task A: 45 sampled names (seed 20261015, 399 eligible keys). 33 SUPPORTED, 1 WEAK, 0 CONTRADICTED, 11 NOT FOUND in STARPORT. The NOT FOUND names are inherited from SPACE_names.json, have no operand reference in STARPORT.lst, and their SPACE cites check out in SPACE.lst. They do no harm. Every G!() index claim (19 checked) equals (addr-0x1850)/4. All 10 sampled G!() layout rows are SUPPORTED.
- Task B: 3 DEF FNs (SUB_0797 FNCrew, SUB_07C9 FNIdx, SUB_07E8 FNCredits). All formulas and argument slots match the bytes. 9 call sites were checked (3 per FN) and all fill the slots in the order the pseudocode prints. A scan of all 65 near-call targets found only these 3 bodies that return a FAC value (ret after INT->FAC, with the caller using FAC), so no FN is unnamed or mislabelled.
- Task C: 249 unique quoted texts. 237 are byte-equal literals and 12 are concatenations the pseudocode proves. 24 coordinate/LOCATE/verb spot checks all match, and all 22 PUTs in the body have verbs that match DL. 1 mismatch: a frame-redraw claim. 1 minor omission. The Unknowns sections are honest.

#### Task A: names (45 sampled)

| key | name | STARPORT refs | verdict | evidence |
|---|---|---|---|---|
| 3B50 | MissionCodeA! | 2 | SUPPORTED | G!(2240). 10C3 `MissionCodeA! = G!(2261)`, 76B9 reverse. SPACE 2B1F/63CE verified |
| 3B24 | SurfaceEnc! | 0 | NOT FOUND | G!(2229) correct. SPACE 6DD8 `mov di,0x3b24` store verified |
| A6314 | Planet40 | 0 | NOT FOUND | SPACESH bank. 1 ref in SPACE.lst only |
| A65C4 | Medal1 | 1 | SUPPORTED | AAA1 bx=0xf7, dx=0x36. AAAE `bb c4 65`, dl=3, so PUT (247,54) PSET |
| 1874 | G!(9) | 0 | NOT FOUND | generic element name. Index correct |
| 1910 | CargoWt10! | 2 | SUPPORTED | G!(48). 8E39 FDIV by A686=10.0 inside PRINT USING. 9816 store |
| 18C4 | ShipClass! | 2 | SUPPORTED | G!(29). 2B0F = ShipTable!(+54). 8DCA indexes ShipSize$ (0x4348). The 028B cite is SPACE |
| AB72 | Prompt$ | 10 | SUPPORTED | 15E4 "towing" (AB64), 162D "defeating" (AB7E), 387A/54DD/71E6/84B4 picker prompts, printed at 1FA0 |
| 3B1C | EntryMode! | 1 | SUPPORTED | G!(2227). STARPORT 9ED5 `EntryMode! = 1` (4F6C=1.0) before CHAIN SPACE.STR. That value is not listed in the _why. SPACE 35FF verified |
| A6E4 | FnField! | 92 | SUPPORTED | FNCrew body 07A0 `FADD FAC+[a6e4]` (second operand) |
| A6154 | Planet35 | 0 | NOT FOUND | SPACESH bank, SPACE only |
| A5D8C | DropShip5 | 0 | NOT FOUND | SPACE 8EB2 `bb 8c 5d`, dl=3, dx=0x21 verified |
| AA06 | AgeYears! | 3 | SUPPORTED | 116E INT(AgeDays!*[AA0E]=0.0054794522). 11AA compare with 60 (AA12). 11D4 store to field 36 |
| AE60 | Ch$ | 3 | SUPPORTED | 254F INKEY$ -> AE60 in SUB_24F4 |
| B3F4 | Price! | 36 | SUPPORTED | 3C92 `WeaponTable!(..)*[A6D4]` (PriceFactor!) -> B3F4. 36 sites |
| ACE4 | Tmp3! | 4 | SUPPORTED | 1ED8 INT(x/30000). 63A9 sum. 9F13 INT(DaysAway!/365) |
| A5C68 | DropShip4 | 0 | NOT FOUND | SPACE 8E99 PUT dl=3, dx=0x13 verified |
| 3BB0 | G!(2264) | 1 | SUPPORTED | 7797 `G!(2264) = 0` (BC54=0.0) right after "Here is your new mission" |
| A684C | ShipHead4 | 0 | NOT FOUND | SPACE 1D94 `bb 4c 68` PUT verified |
| B3F0 | ListLast! | 13 | SUPPORTED | 3C1A `ListLast! = 53`. A1F5/A2AC compares in SUB_A1D8 |
| 194C | DefHardware! | 6 | SUPPORTED | G!(63). 4EBB `= NumIn% + 1`, 3657 `DefHwTable!(DefHardware!-1)+5`, 97D4 MaxMove2!. Note: in STARPORT this holds a type index+1, not only a "fitted flag" |
| A8320 | Medal8 | 1 | SUPPORTED | AB5D `bb 20 83`, dl=3, so PUT (232,32) PSET. It is the 9th PUT in SUB_A932 |
| 3AF0 | SectorX! | 0 | NOT FOUND | G!(2216) correct. SPACE 2938/283B verified |
| 1954 | G!(65) | 1 | SUPPORTED | 4EE9 `= DefHwTable!(NumIn%)*10` |
| AF36 | ShipIdx! | 7 | SUPPORTED | 51A4 =0, 5386 +1, 539B wrap, SUB_29F8 index |
| A42E4 | Skill$ | 7 | SUPPORTED | 028B INPUT #1 Skill$(I!). 5BE8 `add bx,0x42e4` PRINT |
| 1988 | CreditsHi! | 4 | SUPPORTED | G!(78). FNCredits body 07EB `be 88 19` *30000. Note: the _why still cites "FNKey at 5982", which is the SPACE FN known to be mislabelled (stale wording only) |
| A4EC | Status$(1) | 1 | SUPPORTED | 0118 `Status$(1) = "Okay"` (A4FC "Okay") |
| B302 | Count! | 3 | SUPPORTED | 3A08 `Count! += 1` when G!(I!+9) = Member!. 3A41 limit 9 |
| 3BB8 | G!(2266) | 0 | NOT FOUND | index correct. 2 SPACE refs |
| ABEC | KillFrom! | 3 | SUPPORTED | 1796 `KillPtr! - KillStartPort! + 1`, used as the FOR start at 17F1 |
| A5C4 | I! | 333 | SUPPORTED | main counter |
| 3AE0 | G!(2212) | 1 | SUPPORTED | 1103 `G!(2212) = Days!` |
| 18A4 | DropPart2! | 1 | SUPPORTED | G!(21). 2A36 `-(ClassNo! > 1)` |
| 1920 | MaxFuel! | 3 | SUPPORTED | G!(52). 2B59 ShipTable!(+99). 23F9 bar, 2400 `Fuel! = MaxFuel!` |
| 1850 | ShipFlag0! | 266 (array base) | SUPPORTED | G!(0). In STARPORT only through the G!() base (2B8F slots 0..6 = 1). SPACE 2224/2273 compare blocks verified |
| A714 | Ordinal$(1) | 1 | SUPPORTED | 084A `= "second"` (A7FA) |
| A61BC | Planet36 | 0 | NOT FOUND | SPACESH bank, SPACE only |
| 3AC0 | Days! | 5 | SUPPORTED | G!(2204). 1103, 19BE, 1BD8, 9F33 |
| 1878 | G!(10) | 0 | NOT FOUND | generic. Index correct |
| AE48 | BarX! | 4 | SUPPORTED | 23F9 `(Fuel!/MaxFuel!)*260+30`. 244E LINE x2 |
| AF3A | ClassNo! | 8 | WEAK | see below |
| A638 | CondMark$(3) | 1 | SUPPORTED | 01FA `= "#"`. 0xA62C + 3*4 |
| 1D30 | KillStartMission! | 1 | SUPPORTED | G!(312). 1BE1 `= 0`. SPACE cite 5347 |
| B908 | RecEnd2! | 2 | SUPPORTED | 630E `= FNIdx(Tmp2!, 99)` |

WEAK, AF3A ClassNo!: the _why says "size class of the ship (2A0B, 51D2)". Only 51D2 reads the size-class column: 051C4 `83 c6 36` add si,0x36 (+54), then 051CB `81 c6 de 52`. At 029F8..02A0B there is no column add: `be 36 af` / CINT / shl / shl / `81 c6 de 52` / `bf 3a af` FMOV. That is ShipTable!(+0), which the header's Arrays row defines as "+0 drop-ship parts", and DropPart2!/3! = -(ClassNo! > 1/2) uses it that way. At 501F ClassNo! = G!(43)-1 is a ship index. The variable is a reused scratch, and the _why gives the wrong meaning for 2A0B.

G!() index arithmetic for 3B50 3B24 1874 1910 18C4 3B1C 3BB0 194C 3AF0 1954 1988 3BB8 3AE0 18A4 1920 1850 3AC0 1878 1D30: every one is exact.

##### G!() layout table: 10 rows sampled

| row | cited | verdict | body |
|---|---|---|---|
| 43 ship index+1 | 2AFA 3509 37B2 8D50 9E12 | SUPPORTED | `G!(43) = ShipIdx!+1`, `<> 0` / `= 0` / `>= 1` tests, "Pilot or ship not ready" |
| 100..109 bonus | SUB_13DC | SUPPORTED | 13EB FOR 100..109, `=1` -> 2, I!*20000-1980000 |
| 160..209 espionage | 18AF-18D5, 98D2 | SUPPORTED | FOR 160..209, 1 -> 2 + SUB_150A, 98D2 FOR |
| 320..339 tow | 184D-1899 | SUPPORTED | FOR 320..329 with +10 tonnage, cleared |
| 340..369 ammo, +30 wt | 4B3F-4C44, 3184 | SUPPORTED | FOR 340..369, 4C44 `G!(AmmoSlot!+30) = ..*10` |
| 683+7n guns | 4895-4A7D, 30B8 | SUPPORTED | 4895 `7*NumIn%+683` (manual correction), 4A7D `G!(NumIn%+10)=1`, 30B8 FOR 690..725 |
| 742..758 | 0FA4 | SUPPORTED | FOR 742 TO 758 in the test setup |
| 2230..2244 | 765E-768A | SUPPORTED | FOR J! 2230..2244 INPUT #1 |
| 2265 save lock | 9AAF-9CDB | SUPPORTED | test/BEEP, `=1` after 3 tries, `=0` on success |
| 2300, 2597 | 092B, 0934 | SUPPORTED | `G!(2300)=3`, `G!(2597)=9` |

#### Task B: DEF FNs

| FN | body bytes | formula confirmed | slots |
|---|---|---|---|
| FNCrew (SUB_0797, jmp-around 07C6) | `[a6e8]*[a6ec]`, +[a6e4], +[a6f0], CINT, *4 +0x1850, +[a6f4], INT, ret | INT(G!(m*100+f+1300)+.1), with A6EC=100.0, A6F0=1300.0, A6F4=0.1 (`cd cc 4c 7d`) | m=A6E8, f=A6E4. Matches names.json `A6E8,A6E4` |
| FNIdx (SUB_07C9, jmp 07E5) | `[a6fc]*[a6ec]`, +[a6f8], +[a700], INT, ret | INT(m*100+f+1300.5), with A700=1300.5 (`00 90 22 8b`) | m=A6FC, f=A6F8. Matches |
| FNCredits (SUB_07E8, jmp 0804) | `[1988]*[a708]`, +[198c], +[a70c], INT, ret | INT(CreditsHi!*30000+CreditsLo!+.5), with A708=30000, A70C=.5. A704 is never read | dummy A704 (callers store 0.0) |

Call sites (listing slot stores vs pseudocode):

| site | stores | pseudocode |
|---|---|---|
| 0C3C | A6E4<-A97C(16.0), A6E8<-I! | 0C46 `FNCrew(I!, 16)` |
| 282B | A6E4<-AD16(0.0), A6E8<-Member! | 2843 `FNCrew(Member!, 0)` |
| 5E9D | A6E4<-A676(4.0), A6E8<-Member! | 5EA3 `PRINT FNCrew(Member!, 4)` |
| 65A8 | A6E4<-A86C(31.0), A6E8<-I! | 65B9 `Status$(CINT(FNCrew(I!, 31)))` |
| 09C2 | A6F8<-J!, A6FC<-I! | 09D5 `FNIdx(I!, J!)` |
| 3EF4 | A6F8<-AE68(32.0), A6FC<-Member! | 3F1F `FNIdx(Member!, 32)` |
| 5777 | A6F8<-A682(5.0), A6FC<-Member! | 57A2 `FNIdx(Member!, 5)` |
| 2EC3 | A704<-B028(0.0) | 2EC9 `PRINT FNCredits(0)` |
| 6989 | A704<-A66E(0.0) | 6992 `IF FNCredits(0) >= 4000` |

FN scan: 65 near-call targets. Only 0797, 07C9 and 07E8 end in INT->FAC + ret with callers that consume FAC (FTEST/FCMP/FSTORE/CINT right after the call: 85/83/20 calls). SUB_1E98, SUB_2352 and SUB_2374 show FAC use after some calls only because the next statement starts with RND->FAC. No other target returns a value. Nothing is unnamed or mislabelled. Wording nit: the header says the accessors are "inlined at every call site", but the body prints them as FN calls.

#### Task C: screens

Quoted texts: 249 unique. 237 are exact literals in _STARPORT.json. The other 12 are composites the pseudocode proves:
- `"Select A Weapon"`, `"Select A Hand Weapon"`, `"Select A Unit"` (x2), `"Select A Suit"`, `"Select A Ship Weapon"`, `"Select A Shield"`, `"Select A Defense Unit"`, `"Select A Missle Killer"`: these are "Select A " (C394) + ListWord$ (3BFA/41B1/4334/448B/4674/48D6/4CEE/4E30/4F33, all literals).
- `"SHIELD n  "` / `"GUN n  "`: 306F/313B `"SHIELD" + STR$(..) + "  "` (STR$ leading space).
- `"Defense....+##%"`: 8F49 "Defense...." + 8F58 USING "+##" + 8F64 "%".
- `"X is"`: AttrName$ + " is" (B882), 5E3F.

Coordinates and verbs: 24 checked, all match. Row = first ARGPUSH.

| item | listing |
|---|---|
| LINE (1,2)-(318,197),,B | 1C14-1C31 bx=1 dx=2 / 0x13e 0xc5 |
| LINE (5,117)-(314,194),,B | 1C34-1C51 |
| LOCATE 2,7 "STARPORT " | 1C54 push 2, bx 7, ACB8 |
| GET (48,8)-(220,15) | 1C7D-1C99 (buffer 0x4926) |
| LINE (5,5)-(226,114),,B | 1C9C-1CB8 |
| LINE (5,17)-(226,6),,BF | 1CBD-1CD7 dx=1 |
| LINE (230,5)-(314,27),,B | 1CDA-1CF7 |
| LINE (230,30)-(314,114),,B | 1D18-1D35 |
| PUT (232,7),Logo,XOR | 1D38-1D4B 0x40f4 dl=4 |
| PUT (48,8),PortPic,PRESET | 1D4E-1D5D dl=2 |
| PUT (232,32),PortPic,PSET | 1EFD-1F10 dl=3 |
| PUT (261,74),ShipPic0,XOR | 52C2-52D5 0x105,0x4a, 0x4f9e dl=4 |
| PUT (247,54),Medal1,PSET | AAA1-AAB4 |
| LINE (18,152)-(303,176),,BF | 2403-2421 |
| LINE (30,160)-(290,168),0,BF | 2426-2440 |
| LINE (30,160)-(BarX!,168),2,BF | 2445-2460 |
| 16,11 Main Menu / 23,20 T-Time Delay / 22,2 F-Fuel | 2110, 2243, 2217 |
| 24,2 Select Option | 1E7C |
| 17,14 Saving game. / 19,17 Wrong! | 9AC6, 9C97 |
| 16,5 Post Mission Training / 16,15 Cargo List | 7DF4, 91B0 |
| 24,10 Sucessful | 69C5 push 0x18, col 0xa |
| 18,4 medal of honor | A9C6 |
| "flame + 14 fire frames" | 15 PUTs in A932..AC42 (0x65AE + 14 frames) |
| all 22 PUT verbs in the body | DL matches the rendered verb (script) |

Mismatch: SCREENS section 0 heading says the frame (SUB_1C09) is drawn "once on entry and after the medal ceremony". SUB_1C09 has one caller, 0107D `e8 89 0b` call 0x1c09. SUB_A932 ends at 0AC3F `e8 bb 72` call 0x(1)1efd, so after the ceremony only the starport picture (SUB_1EFD) is re-put. The frame is not redrawn.

Minor omission: the inner logo box `LINE (231,6)-(313,26),,B` (1CFC-1D15, in the body at 01D15) is not listed in the SCREENS frame description.

Note: the banner GET/PUT buffer is 0x4926, the same array as PortPic. This is harmless because 1C09 (107D) runs before BLOAD SPPIC (10B7). The pseudocode's use of the name `PortPic` for the GET buffer is technically right but could mislead a reader.

Unknowns: STARPORT.bas.md has a header `## Unknowns` and an empty `## Unknowns (runtime calls not rendered)` table. A scan of the body for RT calls, `(?)`, `' asm`, `word ptr` and `[bp` finds only the documented items: 5x `word ptr [0xae70]` (manual correction), `N(?) = 0` / `GOSUB SUB_0AAE` at ACC8/ACCB, and asm data ACD1-ACFE. STARPORT_SCREENS.md has no Unknowns section of its own. Its unexplained items are the open points already listed in the header (G!(28), G!(2300/2597), 742..758 purpose, INFO.BAS column meanings).

## Verdict table (301 sampled statements)

Columns: statement offset (as printed in STARPORT.bas.md) / first bytes / derivation from the listing / pseudocode text / verdict / note.

| offset | bytes | derivation | pseudocode | verdict | note |
|---|---|---|---|---|---|
| 00078 | bb 7c 4f | mov bx 4F7C "##", dx 4F70 Fmt2$, SASSIGN | Fmt2$ = "##" | AGREE | |
| 000E0 | bb 9e 4f | (CC-CB tail FMOV StdDelay) CSNG 4F9E; SCAT Drive$ + "SHIPPICS.BAS" (A4C4); BLOAD off FAC | BLOAD Drive$ + "SHIPPICS.BAS", &H4F9E | AGREE | |
| 000FD | e9 0f 00 | (EE jmp 100 = IF DebugLoad! tail) CSNG 1850; BLOAD "CHARINFO" (A4D4) | BLOAD "CHARINFO", &H1850 | AGREE | |
| 001CD | bb 0c a6 | SASSIGN A5F6 ClassName$(1) <- A60C "Pilot" | ClassName$(1) = "Pilot" | AGREE | |
| 001F1 | bb 42 a6 | SASSIGN A634 CondMark$(2) <- A642 "*" | CondMark$(2) = "*" | AGREE | |
| 0020F | bb f6 51 | CSNG 51F6; SCAT Drive$ + "INFO.BAS" (A64E); BLOAD | BLOAD Drive$ + "INFO.BAS", &H51F6 | AGREE | |
| 00229 | e9 31 05 | (21A jmp 74E = IF DebugLoad!=0 tail) CSNG 40F4; BLOAD "LOGO" (A65A) | BLOAD "LOGO", &H40F4 | AGREE | |
| 00239 | 33 db | OPEN mode 0 (INPUT), #1, "NAME" (A662), reclen 0 | OPEN "NAME" FOR INPUT AS #1 | AGREE | |
| 00249 | 90 | (242 jmp 26E = FOR I!=1 init) 246 BX=1 INPUT #1 begin; B7 n=1 type 04; store 42AC+4*CINT(I!) Rank$ | INPUT #1, Rank$(CINT(I!)) | AGREE | |
| 0026E | cd 3f b7 | B7/store tail; FADD I!+1, FSTORE I!, FCMP #13 jbe 246 | NEXT I! | AGREE | |
| 0028B | 90 | (284 jmp 2B0 FOR init #0) INPUT #1 begin; store 42E4 Skill$(CINT(I!)) | INPUT #1, Skill$(CINT(I!)) | AGREE | |
| 002CD | 90 | (2C6 jmp 2F2) INPUT #1; store 4324 ShipClassName$(CINT(I!)) | INPUT #1, ShipClassName$(CINT(I!)) | AGREE | |
| 00308 | cd 3f 7d | NEXT tail (#8, jbe 2CA); FLOAD #0 (A66E), jmp 334; limit at 33C #3 | FOR I! = 0 TO 3 | AGREE | |
| 0030F | 90 | INPUT #1; store 4348 ShipSize$(CINT(I!)), type 04 | INPUT #1, ShipSize$(CINT(I!)) | AGREE | |
| 00351 | 90 | INPUT #1; store 435C ShieldName$ | INPUT #1, ShieldName$(CINT(I!)) | AGREE | |
| 00393 | 90 | INPUT #1; store 4370 DefHwName$ | INPUT #1, DefHwName$(CINT(I!)) | AGREE | |
| 003D5 | 90 | INPUT #1; store 4384 MissileKillerName$ | INPUT #1, MissileKillerName$(CINT(I!)) | AGREE | |
| 00417 | 90 | INPUT #1; store 4390 GunName$ | INPUT #1, GunName$(CINT(I!)) | AGREE | |
| 00459 | 90 | INPUT #1; store 43F4 WeaponName$ | INPUT #1, WeaponName$(CINT(I!)) | AGREE | |
| 00494 | cd 3f 7d | NEXT tail (#53); FLOAD #0, jmp 4C0; limit at 4C8 #5 | FOR I! = 0 TO 5 | AGREE | |
| 0049B | 90 | INPUT #1; store 44CC HandWeaponName$ | INPUT #1, HandWeaponName$(CINT(I!)) | AGREE | |
| 004DD | 90 | INPUT #1; store 44E4 SightingName$ | INPUT #1, SightingName$(CINT(I!)) | AGREE | |
| 00502 | cd 3f b7 | FADD I!+1; FSTORE; FCMP #3 (A5C0) jbe 4DA | NEXT I! | AGREE | |
| 0051F | 90 | INPUT #1; store 44F4 ArmorSuitName$ | INPUT #1, ArmorSuitName$(CINT(I!)) | AGREE | |
| 00561 | 90 | INPUT #1; store 4534 MiscItemName$ | INPUT #1, MiscItemName$(CINT(I!)) | AGREE | |
| 005A3 | 90 | INPUT #1; store 4560 ItemName$ | INPUT #1, ItemName$(CINT(I!)) | AGREE | |
| 005E5 | 90 | INPUT #1; store 46F0 FindName$ | INPUT #1, FindName$(CINT(I!)) | AGREE | |
| 0060A | cd 3f b7 | FADD I!+1; FCMP #49 (A68E) jbe 5E2 | NEXT I! | AGREE | |
| 00627 | 90 | INPUT #1; store 47B8 ShipType$ | INPUT #1, ShipType$(CINT(I!)) | AGREE | |
| 00669 | 90 | INPUT #1; store 4814 EquipName$ | INPUT #1, EquipName$(CINT(I!)) | AGREE | |
| 006AB | 90 | INPUT #1; store 4870 AttrName$ | INPUT #1, AttrName$(CINT(I!)) | AGREE | |
| 006D0 | cd 3f b7 | FADD I!+1; FCMP #6 (A696) jbe 6A8 | NEXT I! | AGREE | |
| 006F3 | 33 db | OPEN mode 0, #1, "CHARNAME" (A69A) | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | |
| 006F9 | bb 01 00 | INPUT #1 begin; B7 n=1 04; store 488C ShipName$ | INPUT #1, ShipName$ | AGREE | |
| 00713 | bb 01 00 | (70D jmp 738 FOR I!=1) INPUT #1; store 4288 CrewName$(CINT(I!)) | INPUT #1, CrewName$(CINT(I!)) | AGREE | |
| 00853 | bb 04 a8 | SASSIGN A718 Ordinal$(2) <- A804 "third" | Ordinal$(2) = "third" | AGREE | |
| 008A7 | bf 20 19 | FMOV 1920 MaxFuel! <- A83C #400 | MaxFuel! = 400 | AGREE | |
| 008B9 | bf d0 24 | FMOV 24D0 G!(800) <- A840 #12 | G!(800) = 12 | AGREE | |
| 008CB | bf f4 24 | FMOV 24F4 G!(809) <- #3 | G!(809) = 3 | AGREE | |
| 008EF | bf 58 29 | FMOV 2958 G!(1090) <- A84C #21 | G!(1090) = 21 | AGREE | |
| 008F8 | bf 80 29 | FMOV 2980 G!(1100) <- #1 | G!(1100) = 1 | AGREE | |
| 00922 | bf 20 2e | FMOV 2E20 G!(1396) <- A850 #7 | G!(1396) = 7 | AGREE | |
| 00959 | bf 70 19 | FMOV 1970 G!(72) <- #3 | G!(72) = 3 | AGREE | |
| 0096B | bf a4 23 | FMOV 23A4 G!(725) <- A5EE #11 | G!(725) = 11 | AGREE | |
| 009A1 | be 6c 4f | FLOAD #1, jmp 9FA; limit at A00 #8 | FOR I! = 1 TO 8 | AGREE | |
| 00A10 | cd 3f 7d | NEXT tail (#8 jbe 9A4); FMOV 3150 G!(1600) <- A860 #0 | G!(1600) = 0 | AGREE | |
| 00C6B | cd 3f 7d | NEXT tail (ja C65 / jmp BC6); FMOV 1A08 G!(110) <- #2 | G!(110) = 2 | AGREE | |
| 00CA9 | bf f8 a6 | Fn2Field!=#9, Fn2Member!=#5, call 7C9 (FNIdx body m*100+f+1300.5 INT); CINT; G!(..) <- #12 | G!(CINT(FNIdx(5, 9))) = 12 | AGREE | |
| 00D8C | bf 04 19 | FMOV 1904 BaseWt! <- A98C #200 | BaseWt! = 200 | AGREE | |
| 00E0D | be 98 a9 | FLOAD A998 #320, jmp E3C; limit at E44 #329 | FOR I! = 320 TO 329 | AGREE | |
| 00E52 | cd 3f 7d | NEXT tail (#329); FLOAD A9A0 #330, jmp E90; limit at E98 #339 | FOR I! = 330 TO 339 | AGREE | |
| 00F73 | bf f8 a6 | Fn2Field=#0, Fn2Member=#2, call 7C9; G!(CINT(FAC)) <- #7 | G!(CINT(FNIdx(2, 0))) = 7 | AGREE | |
| 00F9B | bf f8 a6 | Fn2Field=#3, Fn2Member=#2, call 7C9; G!(..) <- A9C4 #665 | G!(CINT(FNIdx(2, 3))) = 665 | AGREE | |
| 0105E | bf 04 1a | FMOV 1A04 G!(109) <- #1 | G!(109) = 1 | AGREE | |
| 0107A | cd 3d 43 | TIMER->FAC; RANDOMIZE FAC | RANDOMIZE TIMER | AGREE | |
| 0107D | e8 89 0b | call 1C09 | GOSUB SUB_1C09 | AGREE | |
| 010B7 | bb 26 49 | CSNG 4926 -> T0; Drive$+"SPPIC"+STR$(-PortNo! + -1)+".BAS"; BLOAD off T0 | BLOAD Drive$ + "SPPIC" + STR$(-PortNo! - 1) + ".BAS", &H4... | AGREE | |
| 010BA | e8 40 0e | call 1EFD | GOSUB SUB_1EFD | AGREE | |
| 0116E | 8b f7 | AgeDays! (FSTORE AA02) * AA0E #0.005479452; INT; FSTORE AA06 AgeYears! | AgeYears! = INT(AgeDays! * 0.005479452) | AGREE | |
| 01207 | bb 13 00 | ARGPUSH 0x13; LOCATE exec 2 | LOCATE 19, 2 | AGREE | |
| 0120A | cd 3f bc | PRINT begin; CrewName$(CINT(Member!)) 6A ;; " has aged." 6E NL; 79 | PRINT CrewName$(CINT(Member!)); " has aged." | AGREE | |
| 01274 | 8b f7 | Tmp! FCMP #1; jb 1279 else jmp 128B | IF Tmp! >= 1 THEN GOTO L_128B | AGREE | |
| 01363 | cd 3f bc | LOCATE 0x15,2 tail; PRINT begin; CrewName$(CINT(Member!)) 6A; " is dead" 6E | PRINT CrewName$(CINT(Member!)); " is dead" | AGREE | |
| 013D6 | cd 3f 7d | NEXT Member! (FCMP #8, ja 13D6 / jmp 1110); 13D6 call 646D | GOSUB SUB_646D | AGREE | |
| 01451 | bb 11 00 | ARGPUSH 0x11; LOCATE exec 2 | LOCATE 17, 2 | AGREE | |
| 015D4 | c3 | ret | RETURN | AGREE | |
| 016B3 | e8 9c 0c | (INT RewardRate! tail) call 2352 | GOSUB SUB_2352 | AGREE | |
| 0170F | cd 3f bc | PRINT begin; "weighing" 6A; ABS(Tons!) 67 ;; "tons" 6E | PRINT "weighing"; ABS(Tons!); "tons" | AGREE | |
| 0177F | be 38 1d | FTEST KillStartPort! jne 1784 else jmp 183E | IF KillStartPort! = 0 THEN GOTO L_183E | AGREE | |
| 017E8 | cd 3f 7d | NEXT I! (FCMP KillTo! jbe 17CC); jmp 183E | GOTO L_183E | AGREE | |
| 01974 | cd 3f bc | PRINT begin; "mission you receive" 6A; [DI]=AA4C Amount! 67; "credits." 6E | PRINT "mission you receive"; Amount!; "credits." | AGREE | |
| 0199D | e8 3c fa | call 13DC | GOSUB SUB_13DC | AGREE | |
| 01AD5 | cd 3d 34 | T=RND*100; DX=-1 if T<20-RankNo!; CX=-1 if RankNo!<13; AND; jne 1ADA else jmp 1B4B | IF NOT ((RankNo! < 13) AND (RND * 100 < 20 - RankNo!)) TH... | AGREE | |
| 01AE6 | cd 3f bc | LOCATE 20,2 tail; PRINT begin; "Your promotion came through" 6E | PRINT "Your promotion came through" | AGREE | |
| 01C60 | cd 3f bc | LOCATE 2,7 tail; PRINT begin; "STARPORT " 6A; PortName$(CINT(PortNo!)) (A6A6) 6E | PRINT "STARPORT "; PortName$(CINT(PortNo!)) | AGREE | |
| 01DBF | 8b c8 | LINE (2,0x73)-(0x13D,0x74); color 1, DX 1 = BF, style FFFF | LINE (2, 115)-(317, 116), 1, BF | AGREE | |
| 01E56 | bf e0 a6 | FMUL Delay!(19B0)*#1.2(A6E0) -> FSTORE DelayCount!(ACC6) | DelayCount! = Delay! * 1.2 | AGREE |  |
| 01E7B | cd 3f 7d | tail of NEXT L! (FSTORE L!, FCMP DelayCount! jbe 1E62) then ret at 1E7B | RETURN | AGREE | NEXT L! rendered at 1E6B |
| 01F10 | bb e8 00 | RT3E_89 x=0xE8=232 y=0x20=32; RT3E_58 arr 0x4926 (PortPic) DL=3 PSET | PUT (232, 32), PortPic, PSET | AGREE |  |
| 01F50 | 90 bf e4 a6 | FnField!=0, FnMember!=I!, call 797 (FNCrew body INT(G!(m*100+f+1300)+.1)); FTEST ja 1F55 else jmp 1F5E | IF FNCrew(I!, 0) <= 0 THEN GOTO L_1F5E | AGREE |  |
| 01F9A | e9 dd 00 | jmp 207A (after GOSUB 20B6) | GOTO L_207A | AGREE |  |
| 02003 | bf 1a ad | bx=(I!=80), dx=(I!=112), OR; jne 2008 else jmp 2014 | IF NOT ((I! = 112) OR (I! = 80)) THEN GOTO L_2014 | AGREE |  |
| 02063 | bf 70 a8 | bx=(I!>48) jbe, dx=(I!<55) jae, AND; jne 2068 else jmp 2077 | IF NOT ((I! < 55) AND (I! > 48)) THEN GOTO L_2077 | AGREE |  |
| 020B3 | e9 f3 fe | jmp 1FA9 | GOTO L_1FA9 | AGREE |  |
| 02133 | bb 4a ad | tail PRINT "Main Menu"+NL; ARGPUSH 0x11=17, bx=2 LOCATE exec | LOCATE 17, 2 | AGREE |  |
| 0214F | cd 3f bc | PRINT begin 214F; 2154 "G-Game Save"(AD68) 6E +NL; 79 at 215A | PRINT "G-Game Save" | AGREE |  |
| 02193 | bb 82 ad | tail PRINT "H-Headquarters"; ARGPUSH 0x13=19; xchg bx,ax (ax=2: 216B mov ax,bx after xchg cx,bx, cx=2 from 2139) LOCATE | LOCATE 19, 2 | AGREE |  |
| 0221E | bb d6 ad | tail PRINT "L-Leave"; ARGPUSH 0x16=22; xchg bx,ax (ax=2 via 21F6/21C9) LOCATE | LOCATE 22, 2 | AGREE |  |
| 022C1 | e9 0b ee | jmp 10CF | GOTO L_10CF | AGREE |  |
| 02370 | bb 07 00 | LINE (7,0x77=119)-(0x138=312,0xC0=192), color 0, DX=1 BF | LINE (7, 119)-(312, 192), 0, BF | AGREE |  |
| 02392 | bb 07 00 | LINE (7,0x80=128)-(312,192), color 0, DX=1 BF | LINE (7, 128)-(312, 192), 0, BF | AGREE |  |
| 023A4 | e9 05 00 | G!(43) FTEST je 23A4 / jmp 23A9 (IF G!(43)<>0 GOTO 23A9) then RT3E_2B at 23A4 | BEEP | AGREE |  |
| 024E5 | e8 6a fe | call 2352 | GOSUB SUB_2352 | AGREE |  |
| 025EC | bf 54 ae | bx=(MaxLen!=3.9 AE54), dx=(I!<48), cx=(I!>57); (cx OR dx) AND bx; je 25F1 else jmp 2517 | IF ((I! > 57) OR (I! < 48)) AND (MaxLen! = 3.9) THEN GOTO L_2517 | AGREE |  |
| 02637 | e9 dd fe | jmp 2517 after K$ = ... | GOTO L_2517 | AGREE |  |
| 02645 | bb 12 ad | VAL(K$) 3D13, CINT 3F78, mov [AE70] | NumIn% = CINT(VAL(K$)) | AGREE |  |
| 02667 | c3 | ret after PRINT/GOSUB 20B6 | RETURN | AGREE |  |
| 02683 | bb 96 ae | tail PRINT "Can Not Carry Anymore Of That"; call 20B6 | GOSUB SUB_20B6 | AGREE |  |
| 028B6 | bf f8 a6 | Fn2Field!=12, Fn2Member!=Member!, call 7C9 (FNIdx body INT(m*100+f+1300.5) on A6F8/A6FC) CINT -> G! addr; FnField=0 FnMember=Member call 797 -> T; FnField=1 call 797; T+FAC; /20; +15; INT; FSTORE | G!(CINT(FNIdx(Member!, 12))) = INT((FNCrew(Member!, 0) + FNCrew(Member!, 1)) / 20 + 15) | AGREE | FN bodies and DS slots match |
| 0297F | e8 72 fb | call 24F4 after LOCATE ,CINT(Ix!) | GOSUB SUB_24F4 | AGREE |  |
| 029F7 | c3 | ret (after PRINT "   "; and jmp 2973 loop) | RETURN | AGREE |  |
| 02B6C | 83 c3 6c | bx=dx=cx=CINT(ShipIdx!) (chain 2AFD..2B47); +0x6C=108; ShipTable!(52DE) -> FMOV G!(28)(18C0) | G!(28) = ShipTable!(CINT(ShipIdx!) + 108) | AGREE |  |
| 02BDA | cd 3f bc | PRINT begin; "A-Sell Personal Equipment"(AF54) 6E; 79 | PRINT "A-Sell Personal Equipment" | AGREE |  |
| 02C92 | bf c4 af | FMOV ListMode!(AFC4) <- #0(AFCC) | ListMode! = 0 | AGREE |  |
| 02CCB | 90 be d4 af | G!(CINT(Rec!)) + #-1 -> FSTORE I!(A5C4) | I! = G!(CINT(Rec!)) - 1 | AGREE |  |
| 02D4F | e9 6a fe | FLOAD #1100; jmp 2DD2 (FSTORE Rec!, FCMP #1397 ja exit); step FADD Rec!+#3 at 2DC9 | FOR Rec! = 1100 TO 1397 | AGREE | STEP 3 rendered on NEXT at 2DD2 |
| 02DAF | 8b f0 | si=ax=dx=&Rec! (2D52-2D57, 2D8F); +#2; CINT; G! -> FMOV Owner!(AFD8) | Owner! = G!(CINT(Rec! + 2)) | AGREE |  |
| 02EE2 | cd 3f bc | PRINT begin 2EE2; "Selling Equipment  "(B02C) 6A; continues FnDummy=0 call 7E8, 67 sng; "credits" 6E; single 79 at 2F03 | PRINT "Selling Equipment  "; | AGREE | one PRINT in bytes (2EE2..2F03) rendered as two lines (next line 2EFA PRINT FNCredits(0); "credits"); output identical because of the trailing ';' |
| 02F13 | bf c4 af | FMOV ListMode! <- #-1(A844) | ListMode! = -1 | AGREE |  |
| 02F40 | 8b f7 | si=di=&Rec! (just set =60); CINT; G! + #-1 -> I! | I! = G!(CINT(Rec!)) - 1 | AGREE |  |
| 02F7D | 83 c1 03 | cx=dx=CINT(I!) (2F5B); +3; MissileKillerTable!(552A) -> FMOV Value!(AFDC) | Value! = MissileKillerTable!(CINT(I!) + 3) | AGREE |  |
| 02FE4 | e8 ed 02 | call 32D4 | GOSUB SUB_32D4 | AGREE |  |
| 02FED | be 60 b0 | FLOAD #66; jmp 3091 (FSTORE Rec!, FCMP #75 ja exit); step FADD #3 at 3088 | FOR Rec! = 66 TO 75 | AGREE | STEP 3 rendered on NEXT at 3091 |
| 0302B | 8b f2 | si=dx=&Rec!; FDIV #3; FADD #-15; INT; FSTORE Tmp!(AA30) | Tmp! = INT(Rec! / 3 - 15) | AGREE |  |
| 030AD | cd 3f 7d | tail NEXT Rec! (<=75 jmp 2FF0); FCMP Rec! #8888 jbe 30B2 else jmp 2BB3 | IF Rec! > 8888 THEN GOTO L_2BB3 | AGREE |  |
| 031A5 | 90 be d4 af | G!(CINT(Rec!)) + #-1 -> I! | I! = G!(CINT(Rec!)) - 1 | AGREE |  |
| 031B7 | 8b f3 | si=bx=&I! (31AA mov bx,di); FTEST jae 31BC else jmp 31ED | IF I! < 0 THEN GOTO L_31ED | AGREE |  |
| 0320F | cd 3f 7d | tail NEXT Rec! (#369 jbe 3188); FCMP Rec! #8888 jbe 3214 else jmp 2BB3 | IF Rec! > 8888 THEN GOTO L_2BB3 | AGREE |  |
| 032CB | e9 ee f8 | FMOV ListMode! <- #99(A68A) | ListMode! = 99 | AGREE |  |
| 032E5 | e9 0a 01 | FMOV HasOwner!(B0B2) <- #0(B028) | HasOwner! = 0 | AGREE |  |
| 033A7 | be c8 af | CINT(Row!)*4 + A50C (SellRec!) <- FMOV Rec! | SellRec!(CINT(Row!)) = Rec! | AGREE |  |
| 033E3 | bf 96 a6 | bx=(Row!<>6) je; dx=(ListMode!<=0) ja; AND; jne 33E8 (ret) else jmp 33E9 | IF NOT ((ListMode! <= 0) AND (Row! <> 6)) THEN GOTO L_33E9 | AGREE |  |
| 0342D | bf 2e ae | FCMP Cmd!(AE16) #-51 je 3432 else jmp 343C | IF Cmd! <> -51 THEN GOTO L_343C | AGREE |  |
| 03456 | c3 | ret after GOSUB 2374 | RETURN | AGREE |  |
| 0350E | e9 21 00 | G!(43) FTEST je 350E else jmp 352F; call 2352 | GOSUB SUB_2352 | AGREE |  |
| 0353E | cd 3f bc | PRINT begin; B106 6E; 79 | PRINT "The reinstallation fee on ships guns," | AGREE |  |
| 03557 | cd 3f bc | PRINT begin; B130 6E; 79 at 3560 | PRINT "shields, etc.  is 15% of cost." | AGREE |  |
| 035C5 | bb b0 b1 | tail PRINT "your ship? "; then call 2950 | GOSUB SUB_2950 | AGREE |  |
| 03702 | e9 27 00 | (G!(CINT(Rec!))>0 guard) G!(..)+#-1 CINT +0x64=100 GunTable!(554E) FMUL #0.15; FSUB Amount!-FAC -> Amount! | Amount! = Amount! - ((GunTable!(CINT(G!(CINT(Rec!)) - 1) + 100)) * 0.15) | AGREE |  |
| 03772 | bb f0 b1 | tail PRINT "Reinstallation fees "; Amount!; "credits"; FADD ShipValue!(B1C0)+Amount! -> Amount! | Amount! = ShipValue! + Amount! | AGREE |  |
| 03810 | cd 3f bc | PRINT begin; B260 6E; 79 | PRINT "B-Buy Ships Equipment" | AGREE |  |
| 03912 | cd 3f bc | PRINT begin; B2EE 6E; 79 | PRINT "F-Miscellaneous" | AGREE |  |
| 03A8A | cd 3f bc | PRINT begin; B32A 6E; 79 | PRINT "HEAVY  H-Flame" | AGREE |  |
| 03B9A | bb b4 b3 | tail PRINT "-F-Gernade"; ARGPUSH 0x17=23; bx=dx=0x15=21 (3B66) LOCATE | LOCATE 23, 21 | AGREE |  |
| 03BE6 | bf 2e ae | FCMP Cmd! #-51 jne 3BEB else jmp 388B | IF Cmd! = -51 THEN GOTO L_388B | AGREE |  |
| 03C92 | e9 e0 fc | [AE70]NumIn% + 0x1E6=486; WeaponTable!(586E) FMUL PriceFactor!(A6D4) -> Price!(B3F4) | Price! = WeaponTable!(NumIn% + 486) * PriceFactor! | AGREE |  |
| 03CAE | e9 06 00 | FNCredits(0) FCMP Price! jb 3CAE else jmp 3CB4; call 2687 | GOSUB SUB_2687 | AGREE |  |
| 03CB1 | e9 a5 fc | jmp 3959 | GOTO L_3959 | AGREE |  |
| 03D7D | 8b f2 | cx=di=&G!(CINT(Slot!+4)) (3D3B-3D4C, dx=&Slot! from 3CE9); si=dx +#3 CINT -> G! addr; FMOV [di]<-[cx] | G!(CINT(Slot! + 3)) = G!(CINT(Slot! + 4)) | AGREE |  |
| 03F3D | be e8 af | FLOAD #1100; jmp 3F75 (FSTORE I!, FCMP #1397 jbe 3F40); step FADD #3 at 3F6C | FOR I! = 1100 TO 1397 | AGREE | STEP 3 rendered on NEXT at 3F75 |
| 03F61 | e9 10 00 | (G!(CINT(I!))<>0 -> jmp 3F6C); si=dx=&I! (3F45) FMOV Slot!(B306) | Slot! = I! | AGREE |  |
| 03F75 | bf c0 a5 | FADD I!+#3 -> FSTORE I! (3F78), FCMP #1397 jbe 3F40 | NEXT I! STEP 3 | AGREE |  |
| 03FC7 | bb 18 00 | ARGPUSH 0x18=24, bx=2 LOCATE | LOCATE 24, 2 | AGREE |  |
| 03FE3 | e9 0c 00 | (IF ...<=4 jmp 3FEF) PRINT begin 3FE3; B424 6A; 79 | PRINT ", SPACE for more"; | AGREE |  |
| 04045 | bf 44 b4 | Cmd!+#559 CINT G! ; CINT [SI] ; mov [AE70] | NumIn% = CINT(G!(CINT(Cmd! + 559))) | AGREE |  |
| 04196 | bf e4 b3 | FMOV ListKind!(B3E4) <- #6(A696) | ListKind! = 6 | AGREE |  |
| 04208 | e9 05 00 | (and bx,[bp-6]; jne 4208 else jmp 420D) RT3E_2B | BEEP | AGREE |  |
| 0420B | eb 83 | jmp 4190 | GOTO L_4190 | AGREE |  |
| 0432B | bf f0 b3 | FMOV ListLast!(B3F0) <- #3(A5C0) | ListLast! = 3 | AGREE |  |
| 04389 | e9 ff f4 | jmp 388B (after FNCredits<Price GOSUB 2687) | GOTO L_388B | AGREE |  |
| 044E0 | e9 a8 f3 | jmp 388B | GOTO L_388B | AGREE |  |
| 0461B | e9 10 00 | (G!(CINT(I!))<>0 -> jmp 4626); si=dx=&I! (45FF) FMOV Slot! | Slot! = I! | AGREE |  |
| 0464D | e9 06 00 | 4645 FCMP I!?#2888 jb 464D (GOSUB) else jmp 4653; 464D call 2649 | GOSUB SUB_2649 | AGREE | |
| 0466B | bf f0 b3 | FMOV ListLast!(B3F0) <- #10 (A686) | ListLast! = 10 | AGREE | |
| 04991 | 8b fb | di=#1, si=dx=Ix!; FADD, CINT -> G!(); si=cx=GunIdx! CINT -> GunTable!(0x554E) FMOV | G!(CINT(Ix!+1)) = GunTable!(CINT(GunIdx!)) | AGREE | |
| 04B36 | bf 2c aa | FMOV Flag! <- #0 | Flag! = 0 | AGREE | |
| 04B3F | be 94 b0 | FLOAD #340, jmp 4B80 (store I!, cmp #369 at 4B88) | FOR I! = 340 TO 369 | AGREE | |
| 04B74 | 8b fa | di=dx=I! (4B47), FMOV <- #369 | I! = 369 | AGREE | |
| 04BAC | bf 44 a8 | FADD Ix! + #-1 -> Ix! | Ix! = Ix! - 1 | AGREE | |
| 04BE6 | e9 06 00 | 4BDE FNCredits(0) (7E8) ? Price! jb 4BE6 else jmp 4BEC; call 2687 | GOSUB SUB_2687 | AGREE | |
| 04CDC | bf ec b3 | FMOV ListFirst! <- #0 | ListFirst! = 0 | AGREE | |
| 04DD5 | 8b f2 | si=dx=Ix! + #2, CINT -> G!(); dx=bx=ShieldIdx% (4D93/4DB2) -> ShieldTable!(0x54B2) * #10 | G!(CINT(Ix!+2)) = ShieldTable!(ShieldIdx%) * 10 | AGREE | |
| 04DE9 | 8b 3e 70 ae | di=(NumIn%+6)*4+G!; si=ax=0x4F6C (#1, via xchg 4DA6) | G!(NumIn% + 6) = 1 | AGREE | |
| 04DFB | e9 7e fe | jmp 4C7C | GOTO L_4C7C | AGREE | |
| 04E82 | e9 06 00 | FNCredits(0) ? Price! jb 4E82 else jmp 4E88; call 2687 | GOSUB SUB_2687 | AGREE | |
| 04F07 | be 40 19 | FTEST MissileKiller! ja 4F0C (GOSUB 4A83) else jmp 4F12 | IF MissileKiller! <= 0 THEN GOTO L_4F12 | AGREE | |
| 04F21 | bf ec b3 | FMOV ListFirst! <- #0 | ListFirst! = 0 | AGREE | |
| 05059 | bb 10 b6 | tail of PRINT "Current armor points:"; Armor!; ARGPUSH 0x13, LOCATE exec 2 | LOCATE 19, 2 | AGREE | |
| 0512C | e9 0a 00 | 5120 ja 5125 (CSNG NumIn% > ArmorRoom!); si=di=ArmorRoom! CINT -> [AE70] | NumIn% = CINT(ArmorRoom!) | AGREE | |
| 05192 | e8 21 cf | call 20B6 | GOSUB SUB_20B6 | AGREE | |
| 051AD | e8 84 ef | call 4134 | GOSUB SUB_4134 | AGREE | |
| 05227 | cd 3f bc | BC; 6A "Price:"; INT(Price! via di) 67 ;; 6E "Credits"; 79 | PRINT "Price:"; INT(Price!); "Credits" | AGREE | |
| 0539E | e9 09 fe | jmp 51AA | GOTO L_51AA | AGREE | |
| 054E9 | be fe a9 | FTEST Member! jne 54EE else jmp 543C | IF Member! = 0 THEN GOTO L_543C | AGREE | |
| 0557B | e9 be fe | jmp 543C | GOTO L_543C | AGREE | |
| 055C6 | bf e4 a6 | FNCrew(I!,0) (797) ==0 -> bx -1; Flag!==0 -> dx -1; and; jne 55CB else jmp 55DC | IF NOT ((Flag!=0) AND (FNCrew(I!,0)=0)) THEN GOTO L_55DC | AGREE | |
| 056F4 | bf 6c 4f | I!+#1 -> I!, cmp #6 (56FC) ja 5707 else jmp 567A | NEXT I! | AGREE | FOR I! = 0 TO 6 at 5677 |
| 057C4 | bf 7c a9 | FADD I!+#16, CINT, ARGPUSH; LOCATE exec 9 | LOCATE CINT(I! + 16), 9 | AGREE | |
| 05814 | cd 3e 79 | tail PRINT end; I!+1 -> I!, cmp #6 jbe 57AE | NEXT I! | AGREE | |
| 0583E | cd 3f 7d | Fn2Field<-#99, Fn2Member<-Member!, call 7C9 (FNIdx), store RecEnd! | RecEnd! = FNIdx(Member!, 99) | AGREE | |
| 05966 | be 6e a6 | FLOAD #0, jmp 59B8 (store I!, cmp #2) | FOR I! = 0 TO 2 | AGREE | |
| 05A14 | e8 65 c4 | call 1E7C | GOSUB SUB_1E7C | AGREE | |
| 05D1B | cd 3d 34 | RND, *2^1, +#1, INT, *2^2, store SkillNo! | SkillNo! = INT(RND*2+1)*4 | AGREE | |
| 05E79 | cd 3e 79 | tail PRINT end; ARGPUSH 0x16, LOCATE exec 2 | LOCATE 22, 2 | AGREE | |
| 06004 | cd 3e 79 | tail PRINT end; call 20B6 | GOSUB SUB_20B6 | AGREE | |
| 0608D | 8b f3 | FCMP Level! ? #3 ja 6092 (Level!=3) else jmp 6097 | IF Level! <= 3 THEN GOTO L_6097 | AGREE | |
| 061EF | cd 3f 7d | tail NEXT Year! (cmp #8); call 26A6 | GOSUB SUB_26A6 | AGREE | |
| 06264 | bb 12 ad | LEN(K$) cmp 1 jl 6234 | IF LEN(K$) < 1 THEN GOTO L_6234 | AGREE | |
| 06279 | be fe a9 | dx = CrewName$(CINT(Member!)) (0x4288), bx=K$, SASSIGN | CrewName$(CINT(Member!)) = K$ | AGREE | |
| 06288 | e8 89 bc | call 1F14 | GOSUB SUB_1F14 | AGREE | |
| 062F1 | e9 86 f1 | FNIdx(Tmp2!,0) -> T0; FNIdx(Member!,0); T0 - FAC (3F_9D #80) -> RecDelta! | RecDelta! = FNIdx(Tmp2!,0) - FNIdx(Member!,0) | AGREE | range starts with tail jmp 543C |
| 06402 | 90 | call 6421 | GOSUB SUB_6421 | AGREE | |
| 065F4 | be c4 a5 | PRINT SlotTag$(CINT(I!)); ">"; ends 65DA; FNCrew(I! via dx,0) FTEST je 65F9 else jmp 6608 | IF FNCrew(I!,0) <> 0 THEN GOTO L_6608 | AGREE | |
| 0667C | cd 3f 7d | tail NEXT I! (cmp #8, jmp 64BE); ret | RETURN | AGREE | |
| 066F4 | 90 | bx=(FNCrew(I!,31)>0) jbe; T0=FNCrew(I!,26), FAC=FNCrew(Member!,26), A5 jb -> T0>=FAC; and; jne 66F9 else jmp 6702 | IF NOT ((FNCrew(I!,26) >= FNCrew(Member!,26)) AND (FNCrew(I!,31) > 0)) THEN GOTO L_6702 | AGREE | |
| 06744 | cd 3f 7d | tail NEXT I! (#8); FNCrew(Member!,26) * #10 + #35 -> RepairPct! | RepairPct! = FNCrew(Member!,26)*10+35 | AGREE | |
| 06761 | 8b df | FNCrew(Member!,31) FTEST je 6766 else jmp 676F | IF FNCrew(Member!,31) <> 0 THEN GOTO L_676F | AGREE | |
| 0677B | bb 10 00 | ARGPUSH 0x10, LOCATE exec 6 | LOCATE 16, 6 | AGREE | |
| 0677E | cd 3f bc | BC; 6A CrewName$(CINT(Member!)); 6E " In Dry Dock"; 79 (6798) | PRINT CrewName$(CINT(Member!)); " In Dry Dock" | AGREE | |
| 067C0 | cd 3f bc | BC; 6E "B-Repair All Personal Equipment"; 79 | PRINT "B-Repair All Personal Equipment" | AGREE | |
| 0693B | bf 22 ae | FCMP Cmd! ? #-32 je 692F | IF Cmd! = -32 THEN GOTO L_692F | AGREE | |
| 069BF | e9 70 fe | jmp 6832 | GOTO L_6832 | AGREE | |
| 06C9E | cd 3f 7d | tail NEXT I! (cmp #1088); FMOV RepairN! <- Tmp2! | RepairN! = Tmp2! | AGREE | |
| 06E0B | bb ae ba | PRINT "Remove how many? "; (6A, 79); call 24EB | GOSUB SUB_24EB | AGREE | |
| 06E83 | 8b d3 | tail PRINT "A-Squad Health"; ARGPUSH 0x13, bx=dx=2 | LOCATE 19, 2 | AGREE | |
| 06E9A | bb e2 ba | tail PRINT "B-Rest In Sickbay"; ARGPUSH 0x14, bx=dx=2 | LOCATE 20, 2 | AGREE | |
| 06F14 | 90 | FADD I!+#15 -> J! | J! = I! + 15 | AGREE | |
| 06F73 | cd 3f bc | BC; 6A "HP"; (statement continues: FNCrew(I!,15) 67; "/" 6A; FNCrew(I!,16) 6B; one 79 at 6FBB) | PRINT "HP"; | AGREE | weak spot 2 (cosmetic): one PRINT 6F73-6FBB rendered as 3 PRINT lines; all splits after `;`, output identical |
| 07055 | e9 eb fd | jmp 6E43 | GOTO L_6E43 | AGREE | |
| 071E9 | e8 28 ad | call 1F14 | GOSUB SUB_1F14 | AGREE | |
| 07457 | 8b fb | di=bx=#1 (7447), J!+1 -> J!, cmp #6 (745F) | NEXT J! | AGREE | |
| 0749E | bb 14 00 | ARGPUSH 0x14, LOCATE exec 2 | LOCATE 20, 2 | AGREE | |
| 074C7 | bf fe a9 | FMOV Member! <- I! | Member! = I! | AGREE | |
| 0750F | bb 9c bb | PRINT "Not possible" (6E,79); call 20B6 | GOSUB SUB_20B6 | AGREE | |
| 07524 | cd 3f bc | BC; 6E "Headquarters"; 79 | PRINT "Headquarters" | AGREE | |
| 0759C | be c4 a5 | FCMP G!(CINT(I!)) ? #1 ja 75A1 else jmp 75AF | IF G!(CINT(I!)) <= 1 THEN GOTO L_75AF | AGREE | |
| 0762A | 33 db | OPEN mode BL=0 (INPUT); Drive$+"MISSION"; #1 | OPEN Drive$+"MISSION" FOR INPUT AS #1 | AGREE | |
| 07643 | 90 | B6 #1; B7 n=2 types 04 04; B8 MissionText1$, MissionText2$ | INPUT #1, MissionText1$, MissionText2$ | AGREE | |
| 07665 | 90 | B6 #1; B7 n=1 type 02 (single); B8 G!(CINT(J!)) | INPUT #1, G!(CINT(J!)) | AGREE | |
| 07797 | bb 38 bc | PRINT "Here is your new mission"; FMOV 0x3BB0 (=G!(2264)) <- #0 | G!(2264) = 0 | AGREE | |
| 07817 | bb 58 bc | B5 prompt flags 00 ("? " printed = `;` form); B7 n=1 type 02 -> Flag! | INPUT "TRY WHICH MISSION (1-50)?"; Flag! | AGREE | |
| 078FE | e9 08 00 | (G!(CINT(J!)) = #1 je 78F9) di=si, FMOV <- #0 | G!(CINT(J!)) = 0 | AGREE | |
| 07A16 | bf f8 a6 | Fn2Field<-#41, Fn2Member<-I!, FNIdx -> FAC, jmp 7A3C (store J!, cmp RecEnd3!) | FOR J! = FNIdx(I!,41) TO RecEnd3! | AGREE | |
| 07B22 | 8b f2 | si=dx=I! + #1 -> I! (cmp #80 at 7B2A) | NEXT I! | AGREE | |
| 07B74 | cd 3f 7d | tail NEXT I! (#449); FLOAD #2300, jmp 7B9A (cmp #2599) | FOR I! = 2300 TO 2599 | AGREE | |
| 07BD6 | 8b f2 | I!+#1 -> I! (cmp #731) | NEXT I! | AGREE | |
| 07BEC | cd 3f 7d | tail NEXT I!; FMOV G!(43) (0x18FC) <- #0 | G!(43) = 0 | AGREE | |
| 07BFE | e9 b2 af | jmp 2BB3 | GOTO L_2BB3 | AGREE | |
| 07C36 | e9 a4 07 / e8 19 a7 | tail jmp 83DA of IF FNCrew(..,31)<>1; 7C36 call 0x2352 | GOSUB SUB_2352 | AGREE | |
| 07C45 | cd 3f bc | after LOCATE 17,2 (0x11/2); PRINT begin; CrewName$(4288+4*CINT(Member!)) 6A; " has" (BD9C) 6A ; | PRINT CrewName$(CINT(Member!)); " has"; | AGREE | |
| 07CC4 | bb 66 bd | tail PRINT "B-Buy training session (200,000 cr)" +NL; bx=0x15 ARGPUSH; bx=dx (dx<-bx=2 at 7C9A) LOCATE exec | LOCATE 21, 2 | AGREE | |
| 07D29 | be 16 ae | after GOSUB 1E7C; FTEST Cmd!; jae 7D2E else jmp 83F6 | IF Cmd! < 0 THEN GOTO L_83F6 | AGREE | |
| 07DE2 | e9 51 fe | 7DDF call 84CB; 7DE2 jmp 7C36 | GOTO L_7C36 | AGREE | |
| 07DEB | bf f6 a9 | DaysAway!(A9F6) <- #3 (A5C0) FMOV | DaysAway! = 3 | AGREE | |
| 08013 | bb 14 00 | tail call 2374; bx=0x14 ARGPUSH, bx=2 LOCATE exec | LOCATE 20, 2 | AGREE | |
| 08205 | bf e4 a6 | FnField!(A6E4)<-#35 (A868), FnMember!(A6E8)<-Member!; call 0797 (body INT(G!(m*100+f+1300)+.1) = FNCrew); FSTORE ClassNo2!(BE46) | ClassNo2! = FNCrew(Member!, 35) | AGREE | FN body 0797 checked: slot A6E8 = m, A6E4 = f |
| 0830C | 8b f3 | 82F5 xchg bx,si -> bx=Tmp2!(AB7A); 8302 si=bx; FCMP Tmp2! ? #5 (A682); ja 8311 else jmp 831E | IF Tmp2! <= 5 THEN GOTO L_831E | AGREE | |
| 0833E | cd 3f bc | PRINT begin; "You reach " 6A; Skill$(42E4+4*CINT(Cmd!)) 6A; " level " 6A | PRINT "You reach "; Skill$(CINT(Cmd!)); " level "; | AGREE | |
| 083F9 | e9 53 9f | 83F6 call 646D; 83F9 jmp 234F | GOTO L_234F | AGREE | |
| 08708 | e8 77 21 | 8705 call 9296; 8708 call A882 | GOSUB SUB_A882 | AGREE | |
| 08843 | cd 3f bc | after LOCATE 19,25; PRINT begin; "Level" 6A; bx=si (si=&G!(CINT(Level!+27)) from 8819-882B) 6B +NL | PRINT "Level"; G!(CINT(Level! + 27)) | AGREE | |
| 0885E | 8b d3 | tail PRINT (dx<-bx=0x19 at 8846); bx=0x14 ARGPUSH; bx=dx LOCATE exec | LOCATE 20, 25 | AGREE | |
| 088D3 | cd 3f bc | after LOCATE 22,25; PRINT begin; "Healing" 6A; 3E_79 | PRINT "Healing"; | AGREE | |
| 08BDB | e9 ef f8 | tail jmp 84CA; 8BDB call 2374 | GOSUB SUB_2374 | AGREE | |
| 08CEA | e9 11 00 | tail jmp 8CFB; 8CEA call A882 | GOSUB SUB_A882 | AGREE | |
| 08D40 | bf 54 b0 | FCMP ListRow!(B438) ? #18 (B054); jne 8D45 else jmp 84CA | IF ListRow! = 18 THEN GOTO L_84CA | AGREE | |
| 08D64 | cd 3f bc | after LOCATE 20,2; PRINT begin; "You do not have one" 6E +NL | PRINT "You do not have one" | AGREE | |
| 08DFE | 8b d3 | tail PRINT "Base Weight..."; 3E_79; bx=Fmt3$(4F74) 3F_BD USING begin; item BaseWt!(1904) 67 ; ; 3E_79 | PRINT USING Fmt3$; BaseWt!; | AGREE | |
| 08E7E | be 18 19 | tail USING: TotalWt10!(1918) / [di=#10 from 8E36] 67 ; 3E_79; 8E7E PRINT begin; bx=ax (ax<-" tns" C0E2 at 8E18) 6E +NL | PRINT " tns" | AGREE | |
| 08EF0 | cd 3f bc | after LOCATE 19, 41-LEN(STR$(Armor!)); PRINT begin; dx=&Armor!(192C); STR$; LEN; dec; STR$; RIGHT$; 6E +NL | PRINT RIGHT$(STR$(Armor!), LEN(STR$(Armor!)) - 1) | AGREE | |
| 08F25 | bb 0e c1 | tail PRINT "Credits......."; 3E_79; bx="#######"(C120) 3F_BD USING begin; FnDummy!(A704)<-0; call 07E8 (FNCredits body, no arg use); bx=0x1A (FAC) 3F_6B +NL; 3E_79 at 8F3A | PRINT USING "#######"; | DISAGREE | one statement: PRINT USING "#######"; FNCredits(0) -- one 3F_BD (8F25) .. one 3E_79 (8F3A); the FN item is split off into a separate `PRINT FNCredits(0)` (L2951), which loses the format (weak spot 2) |
| 090B5 | cd 3f bc | after LOCATE 23,2; PRINT begin; C164 6E +NL | PRINT "(-) okay  (*) broken  (#) 4000 to fix" | AGREE | |
| 09263 | bf 6c 4f | I!(A5C4)+#1 FSTORE I!; FCMP #499 (B0AE); ja exit else jmp 91DA; FOR at 91D1 FLOAD #400 | NEXT I! | AGREE | FOR I! = 400 TO 499 (L3004) matches |
| 095F6 | 8b f1 | si=cx (=&Level! via 95A8/95AA); +#12; CINT; si=&G!(..); di=dx=&Tmp2!; FMUL; +#0.5; INT; FSTORE Tmp2! | Tmp2! = INT((G!(CINT(Level! + 12))) * Tmp2! + 0.5) | AGREE | |
| 0965E | c3 | tail G!(CINT(Level!+8)) = INT(Tmp2!+.5); ret | RETURN 'with FAC = INT(Tmp2! + 0.5) | AGREE | |
| 097B0 | e9 05 00 | tail jmp 97B3; 97AE xchg di,si -> di=Tons!(AB76), si=#32000 (C1D4); FMOV | Tons! = 32000 | AGREE | |
| 0985E | 8b f7 | si=di=Tmp2!; FTEST; jb 9863 (set 0) else jmp 986C | IF Tmp2! >= 0 THEN GOTO L_986C | AGREE | |
| 09869 | be 6e a6 | tail Tmp2!=#0 FMOV; jmp 987F | GOTO L_987F | AGREE | |
| 0987C | e9 05 00 | tail jmp 987F; xchg di,si -> di=Tmp2!, si=MaxMove2!(C14E); FMOV | Tmp2! = MaxMove2! | AGREE | |
| 098B7 | cd 3f bc | after LOCATE 16,13; PRINT begin; C1D8 6E +NL | PRINT "Espionage List" | AGREE | |
| 09910 | cd 3f bc | after LOCATE CINT(J!+17),2; PRINT begin; FindName$(46F0+4*CINT(I!+#-160)) 6E +NL | PRINT FindName$(CINT(I! + -160)) | AGREE | |
| 0995F | bf 6c 4f | I!+#1 FSTORE I!; FCMP #209 (ABFC); ja exit else jmp 98D6 | NEXT I! | AGREE | FOR I! = 160 TO 209 (098D2) |
| 09A14 | e9 62 00 | tail jmp 9A6B; J!(A858)+#1 FSTORE J! | J! = J! + 1 | AGREE | |
| 09A5C | cd 3e 44 | tail LOCATE 24,12; call 20DD | GOSUB SUB_20DD | AGREE | |
| 09AB4 | e9 06 00 | tail jmp 9ABA (BOOL G!(2265) jne 9AB4); 9AB4 RT3E_2B | BEEP | AGREE | |
| 09ACF | bb 11 00 | bx=0x11 ARGPUSH, bx=0xE LOCATE exec | LOCATE 17, 14 | AGREE | |
| 09AD2 | cd 3f bc | PRINT begin; C20A 6E +NL | PRINT "Saving game." | AGREE | |
| 09B16 | 8b d0 | 9AF0 ax=CINT(INT(RND*10)) -> Sect%(C23C); 9B04 bx=CINT(INT(RND*5)); xchg bx,ax: ax -> Ord%(C23E), bx = Sect% value; cx=dx=Ord%; ax=5; imul bx; add ax,cx; store WordIdx%(C240) | WordIdx% = 5 * CINT(INT(RND * 10)) + CINT(INT(RND * 5)) | DISAGREE | WordIdx% = 5 * Sect% + Ord% -- no RND call in 9B09-9B16; the operands are register copies (bx/cx) of the two values stored at 9AF2/9B08; the rendering re-evaluates RND twice |
| 09B87 | 8b 1e 40 c2 | tail LOCATE 24,3; bx=WordIdx%; RuleWord$(A728+4*); LEN; CSNG; FSTORE MaxLen!(AE50) | MaxLen! = LEN(RuleWord$(WordIdx%)) | AGREE | |
| 09BB7 | bb 4e b9 | tail PRINT ">"; (6A, 3E_79); call 24F4 | GOSUB SUB_24F4 | AGREE | |
| 09C94 | e8 bb 86 | (Tries!+1 FSTORE ends 9C91); call 2352 | GOSUB SUB_2352 | AGREE | |
| 09CA0 | bb 13 00 | bx=0x13 ARGPUSH, bx=0x11 LOCATE exec | LOCATE 19, 17 | AGREE | |
| 09CF3 | bb 50 18 | CSNG 0x1850 -> FAC (offset); Drive$(4F78)+"CHARINFO.BAS" SCAT; cx=0x28A4=10404; dx=FAC; RT3E_1B BSAVE | BSAVE Drive$ + "CHARINFO.BAS", &H1850, 10404 | AGREE | |
| 09D0C | bb 01 00 | RT3E_20 mode 1 (OUTPUT); Drive$+"CHARNAME"; dx=file; bx=1; cx=0; RT3E_1E OPEN | OPEN Drive$ + "CHARNAME" FOR OUTPUT AS #1 | AGREE | |
| 09E49 | bb c0 c2 | tail PRINT "Ship overloaded" +NL; call 20B6 | GOSUB SUB_20B6 | AGREE | |
| 09F3F | bb f0 c2 | Drive$+"SPACE.STR" SCAT; RT3E_0E CHAIN | CHAIN Drive$ + "SPACE.STR" | AGREE | |
| 0A0A9 | cd 3f 7d | tail NEXT I! (FSTORE I!, cmp #369 jbe A04E); A0A3 FLOAD #1; jmp A1C4: FSTORE I!, FCMP #6 (A696), ja ret else jmp A0AC | FOR I! = 1 TO 6 | AGREE | |
| 0A18C | cd 3f bc | PRINT begin; " " (AC6A) 6A; 3E_79 | PRINT " "; | AGREE | |
| 0A202 | e9 05 00 | tail jmp A205; xchg di,si -> di=ListEnd!(C38C), si=ListLast!(B3F0); FMOV | ListEnd! = ListLast! | AGREE | |
| 0A27E | bf 6c 4f | (start inside ON GOSUB table bytes); I!+#1 FSTORE I!; FCMP ListEnd2!(C390); jbe A218 | NEXT I! | AGREE | FOR I! = Ix! TO ListEnd2! (A20E FLOAD Ix!) |
| 0A2DB | e8 e6 7f | tail CmdMax! = ListEnd!-Ix!+1; call 0x22C4 (16-bit wrap of 0x122C4) | GOSUB SUB_22C4 | AGREE | |
| 0A2EC | e9 01 00 | tail jmp A2ED (Cmd! = #-57 je A2EC); A2EC ret | RETURN | AGREE | |
| 0A322 | e9 bc fe | A322 jmp A1E1 (target of A314 jmp) | GOTO L_A1E1 | AGREE | |
| 0A391 | be c4 a5 | A37A PRINT begin; MissileKillerName$(4384+4*CINT(I!)) 6A; 3E_79; ret | RETURN | AGREE | |
| 0A392 | cd 3f bc | PRINT begin; WeaponName$(43F4+4*CINT(I!)) 6A ; ; 3E_79 | PRINT WeaponName$(CINT(I!)); | AGREE | |
| 0A4DD | 8b f7 | si=di=Ix!(AF0E); CINT; &G!(); FCMP ? #1 (4F6C); jae A4E2 else jmp A579 | IF G!(CINT(Ix!)) < 1 THEN GOTO L_A579 | AGREE | |
| 0A62E | 90 | I!+#2; CINT; &G!(); FCMP ? Member!(A9FE); je A633 else jmp A66A | IF G!(CINT(I! + 2)) <> Member! THEN GOTO L_A66A | AGREE | |
| 0A77E | bf 70 c3 | tail PRINT G!(CINT(WeaponType!+500)); (67 ;); RT3E_43 ARGPUSH omitted; bx=9; LOCATE exec | LOCATE , 9 | AGREE | |
| 0A858 | bf d0 af | FCMP ListStart!(B44C) ? #800 (AFD0); je A85D else jmp A876 | IF ListStart! <> 800 THEN GOTO L_A876 | AGREE | |
| 0A875 | bb fc c3 | tail PRINT "No Weapons" +NL; ret | RETURN | AGREE | |
| 0A8A7 | e8 a8 7a | call 0x2352 (wrap of 0x12352) | GOSUB SUB_2352 | AGREE | |
| 0A93E | bb ae 65 | CSNG 0x65AE -> FAC; bx="fire" (C46E, no Drive$); dx=FAC; RT3E_1A BLOAD | BLOAD "fire", &H65AE | AGREE | |
| 0AA77 | e9 0e 00 | (after IF DotY! >= 73 GOTO AA04 at AA75); jmp AA88 | GOTO L_AA88 | AGREE | |
| 0AB7F | e8 c1 00 | tail PUT Medal9 verb 3 PSET; call AC43 | GOSUB SUB_AC43 | AGREE | |
| 0AC3F | e8 bb 72 | tail PLAY "X"+VARPTR$(Tune$); call 0x1EFD (wrap of 0x11EFD) | GOSUB SUB_1EFD | AGREE | |
| 0ACA1 | cd 3d 43 | AC8F TIMER; T0!(C4B6) - FAC (3F_9B); ABS; FCMP #0.3 (C4BA); jb AC8F | IF ABS(T0! - TIMER) < 0.3 THEN GOTO L_AC8F | AGREE | |
| 0ACA3 | c3 | ret (FAC = ABS(T0!-TIMER)) | RETURN 'with FAC = ABS(T0! - TIMER) | AGREE | |
| 0ACC1 | c3 | ret after the TIMER loop vs #2 (jb ACAD) | RETURN 'with FAC = ABS(T0! - TIMER) | AGREE | |
| 0ACC2 | cd 3e 02 | RT3E_02 END (handler end) | END 'error-handler fallthrough | AGREE | |
| 0ACC8 | be 84 a9 | si=#0 (A984); FMOV [DI] with DI unknown; unreachable after END, no reference to ACC5 | N(?) = 0 | AGREE | bytes do decode as FMOV [DI]<-#0 with unresolved DI; header lists it as a stray render after END |
| 0ACF7 | 00 00 | data bytes disassembled as add [bx+si],al | ' asm add byte ptr [bx + si], al | AGREE | data, documented in header |
