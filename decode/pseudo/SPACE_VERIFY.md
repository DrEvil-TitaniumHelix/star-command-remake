# SPACE — verification (lane verify, Opus, 2026-10-15)

Inputs: `decode/pseudo/SPACE.bas.md`, `SPACE_SCREENS.md`, `SPACE_names.json` (lane mod-space / mod-space2; that lane is gone, so fixes go to the Foreman), `decode/listings/SPACE.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` + `decode/data/tools/_SPACE.json`. The independent GLM review is in `SPACE_GLMVERIFY.md`.

**Sample:** 2516 statement lines in the `## Pseudocode` block (lines that begin with a 5-digit offset). Python `random.seed(20261015)`, `random.sample(range(2516), 252)` (10%), plus every CHAIN / BLOAD / ON GOTO / ON GOSUB / INPUT / OPEN line (20 sites, 15 of them not already drawn) = **267 statements**. For each statement, the listing instructions after the previous statement's offset up to its own offset were derived first, then compared with the pseudocode text. PRINT/INPUT statements carry the offset of their begin call, so their items were read past that offset, up to PRINT end. Four independent derivation passes (subagents of this lane) did the work. This lane re-checked every DISAGREE against the bytes and spot-checked AGREE rows: the FNIdx argument order (body 0414), an FTEST `jbe` sense (5CA7), PRINT +NL (7594) and a RETURN; all held. Names (45 entries, same seed) and screens were checked by a fifth pass.

## Summary

- 267 statements: **261 AGREE, 6 DISAGREE, 0 UNSURE**. All 6 disagreements are one systematic translator defect, the PUT verb map: `, OR` is really PSET. It affects **all 35 verb-3 PUTs** in the body, plus the Arrays table and 10 items in SPACE_SCREENS.md. The 50 XOR PUTs are correct.
- Out of sample (found by the names pass, confirmed by this lane from the bytes): **FN 0x0452 is mis-named FNKey(CreditsHi!, CreditsLo!)**. It is a two-decimal rounding of `Val!` (DS 0xAA90). At 0x5982 (MASS) the assignment `Val! = PlDiameter!^3 * PlDensity!(Idx!)` is missing from the pseudocode. 4 readout lines, the header, the SUB table, names.json and SPACE_SCREENS §4a are affected.
- Names: 45 sampled, 43 SUPPORTED, 2 CONTRADICTED (CreditsHi! citation, Digit1 verb detail), 0 not found. All G!() index claims check. Screens: all 181 quoted strings are literals or proven concatenations (5 view labels are sprite pictures, not text); 22 coordinate checks match.

## Disagreements and fix requests

1. **PUT verb map (systematic).** `decode/pseudo/tools/qb2bas.py:551` maps `{0 PSET, 1 PRESET, 2 AND, 3 OR, 4 XOR}`. RT3E_58 (ledger, proven twice from the BRUN30 tables DS:0x368/0x372) is `{0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR}`. Sampled hits: 1D66 (`mov dx,3` at 1D63, ShipHead2), 20E3 (Digit5, dx=3 at 20E0), 263B (HdrLongRange, 2638), 34B5 (HdrVisual, 34B2), 8E86 (DropShip3, 8E83), 8F2A (SaveArea, 8F27). Fix: correct the map and regenerate (or replace `, OR` with `, PSET` in all 35 body lines), plus the Arrays row 0x40F4 (line 3778) and SPACE_SCREENS.md (Logo, HdrLongRange, both PicBuf PUTs, HdrGalaxyScan, GalMap, HdrSectorScan, HdrSystemScan, SaveArea). The sampled XOR PUTs (2125, 9287, 93BF) are correct.
2. **FN 0x0452 is not FNKey.**
   - Body 0452..0490: `T = [AA90]*100` (temp #81); `K = (INT(T + 1) = 9) ? 2 : 1` (`dec bx` twice, `neg`); returns `INT(T + K) / 100`. It reads only `Val!` (0xAA90), with constants 0xAA6C = 100, 0x6AC0 = 1, 0x6C2C = 9.
   - The credits formula `INT(G!(78)*30000 + G!(79) + .5)` is the body at **0433** (0xAA88 = 30000, 0xAA8C = .5), and this listing has no `call 0x433`.
   - Call sites of 0452: 59A3, 59D6, 5A0B, 5A4B.
   - Correct renderings:
     - 0x5982: `Val! = PlDiameter!^3 * PlDensity!(CINT(Idx!))` (598D FPOW [B542]^[6C80]=3; 5995 FMUL by the density element held in ax; 599A FSTORE [AA90]), then `PRINT "MASS:"; LEFT$(STR$(FNRound2(Val!)), 7)`.
     - 059E5, 05A1A, 05A5A: `PRINT LEFT$(STR$(FNRound2(Val!)), n)`.
   - Also fix `SPACE_names.json` keys `SUB0452` / `FN0452` / `FN0452_args` and `1988_why` (the cited site 5982 does not use 1988/198C; the credits FN is 0433), the header definition (line 12), the SUB table (line 3434), and SPACE_SCREENS.md §4a. "FNRound2" is a placeholder; the lane or Foreman picks the name.
3. **Digit1 (A4BCE) `_why`** says its first PUT is OR. It is verb 3 = PSET (same root cause as 1).

## Names and screens pass (verbatim output of the fifth pass)

### SPACE verify: names sample + screens

Sample: `random.seed(20261015); random.sample(sorted(keys), 45)`, where keys are the address keys of SPACE_names.json (438 keys: hex / A<base> / SUB<addr>). `_doc`, `FN*`, and `*_why` keys are excluded. `*_why` keys are evidence strings, not address keys; if they were left in, the sample would contain duplicates. Site offsets below are SPACE.lst offsets. Literal and constant values come from MODULE_CONSTANTS.md "## SPACE.EXE". G!(n) = 0x1850+4n.

#### Task A: names (45)

| addr | name | claimed role (short) | sites checked | verdict | note |
|---|---|---|---|---|---|
| 6AA2 | Fmt3$ | "###" PRINT USING format | 0046, 772B, 7A5B | SUPPORTED | Gets "###" (0x6AAE) at 0046. Its only other uses are PRINT USING fmt at 772B and 7A5B |
| 3B60 | MissionY2! | G!(2244) sector y of target 2 | 2B3A | SUPPORTED | G index 2244 is correct. Its only ref is FCMP with SectorY!, paired with MissionX2!/SectorX! (2B2B), and the result selects MissionEnc! = MissionEncB! (2B6F) |
| A9A0 | SlotTag$(2) | element 2 of string array 0xA998 | 02B5 | SUPPORTED | SASSIGN "C" into 0xA998+8. The base is indexed with `add bx,0xa998` at 02D2/15EB/4BB9/85DC/879A |
| AAA8 | YesNo! | SUB_2544: 1 for Y/y, 0 for N/n | 2544-2579, 259E, 25F2 + 10 tests | SUPPORTED | INKEY$ is compared with "y"/"Y", then YesNo! = 1 (2570) |
| 1874 | G!(9) | fixed G! element | 0E9E | SUPPORTED | (0x1874-0x1850)/4 = 9. Its only ref is an init store of 0. No role is claimed |
| SUB7BD5 | (sub) | recompute carried weight, G!(Rec!+14), G!(Rec!+8) | 7BD5-7F9C | SUPPORTED | WtSum! accumulates over G!(Rec!+39/41/44/90/91/47), weapons 800..1088, ammo 1100..1397, items 2300..2597. It writes Rec!+14 (7E7A) and Rec!+8 (7F6E-7F80) |
| SUB81E6 | (sub) | empty RET, called before every CHAIN | 81E6, 360B/387C/686D/6DFF/9037 | SUPPORTED | Body is `ret`. There are 5 CHAINs, and each one is preceded by `call 0x81e6`. "Compiled-out save" is speculation |
| 1920 | MaxFuel! | G!(52) fuel capacity, clip at 3664 | 3629, 3648-366B, 368F | SUPPORTED | G index 52 is correct. Fuel! = INT(Fuel!+FuelAdd!), then IF Fuel! > MaxFuel! THEN Fuel! = MaxFuel! |
| 1904 | BaseWt! | G!(45) "Base Wt..." / total weight | 7728-7733, 815F-816F | SUPPORTED | G index 45 is correct. TotalWt10! = CargoWt10! + BaseWt!*10 |
| B0D8 | NumBodies! | INT(RND*(StarClass!+7)+1) after RND seed | 38DF-390E | SUPPORTED | RND(-seed) at 38E2, then the formula is exactly as claimed |
| 3B58 | MissionEncB! | G!(2242) target-2 encounter bonus | 2B6C, 642B-6442 | SUPPORTED | G index 2242 is correct. Wording: at 6442 the listing does `IF MissionEncB! > 150 THEN EncChance! = MissionEncB! - 150`. The claim "= EncChance!+150" states the same relation in reverse |
| AD48 | Cmd! | SUB_1C58 ASC(K$) -32/-64; ON GOTO tables | 1C58-1CA5, 1C13, 1C39, 3139, 3FBD | SUPPORTED | ASC, then -32 if >95, then -64. Used as the index of all four ON GOTO tables |
| SUB87AD | (sub) | burn FuelUse! (not below 0), refresh readout | 87AD-87DB, 1A5F | SUPPORTED | Fuel! = INT(max(Fuel!-FuelUse!,0)), then SUB_1A5F (PRINT USING at 4,26) |
| A6E56 | GalMap | BLOAD GALMAP.BAS at &H6E56; PUT (16,16) | 01FE-0210, 32F4-3302 | SUPPORTED | PUT verb DL=3 = PSET (see Task B) |
| A6B4C | PlanetNo! | running planet number per orbit; "Planet" print | 3A9C-3AA4, 3AB6, 576E-5787 | SUPPORTED | Gets ObjCount! for occupied orbits, else 0. Printed as -PlanetNo!(Idx!) after "Planet" |
| AED4 | Zone! | ZoneTag$(Zone!) at 2938 | 2910, 2979-2987 | SUPPORTED | Zone! = INT(sector word / 10000). ZoneTag$(Zone!) is printed at 2983 (2938 is where that PRINT starts) |
| B560 | PlTech! | INT(PlLife!/10)-(PlLife!>0); TechLevel$ index | 5A60-5AB2, 5AFF-5B0D | SUPPORTED | FTEST at 5A9C is on PlLife!(Idx!), as claimed. Indexes TechLevel$ after "LIFE: " |
| B950 | Stealth! | 0.2/item type 3, 0.4 if type 4; lowers surprise | 6C48-6C77, 6C7D-6C9C, 6D0D | SUPPORTED | Stealth! = 0.2*count, or 0.4. The term 2*(RND < .5-Stealth!) is summed into PortNo! (6D0D), which becomes SurfaceEnc! |
| SUB2626 | (sub) | "LONG RANGE" header, MapCol/Row, CellX/Y, SectorIdx, BLOAD MAP, PUT (16,16) | 2626-271D | SUPPORTED | "LONG RANGE" is the HdrLongRange sprite PUT at (32,0), not a text literal. BLOAD "MAP"+STR$(-MapNo!)+".BAS" runs only when MapNo! <> LoadedMap! |
| B2F8 | AnyHealed! | 1 if anyone needed healing, else "Squad is fully healed" | 4D52, 4DC9, 4FC9-4FE3 | SUPPORTED | |
| A6B24 | PlDensity! | density; "DENSITY:"; diameter = grav/density; trade | 3B08-3B1E, 5971-597F, 5A41-5A48, 6888-68A7 | SUPPORTED | Trade thresholds are 0.66 and 0.88 |
| SUB8973 | (sub) | advance clock by ElapsedHrs! | 8973-89F7 | SUPPORTED | TotalHrs! uses 24 and 8760, then splits back into Years!/Days!/Hours! |
| 6E4E | ZoneTag$(2) | element 2 of array 0x6E46 | 01E4 | SUPPORTED | Gets "N". The base is indexed at 2983 |
| SUB252B | (sub) | alert box blank | 252B-2543 | SUPPORTED | LOCATE 8,21: 9 spaces (0xAE5C) |
| AC12 | DelayCount! | = Delay!*1.2; empty delay loop | 1657-1689 | SUPPORTED | |
| B898 | Price! | "Will you pay"/"sell for"; Price! | 6974-698B, 6AC1-6AD0 | SUPPORTED | Price! = INT(PlGravity!*65+25) at 6974 |
| SUB95FB | (sub) | word-wrap ListLine$ into 14-char rows at col 5 | 95FB-9747 | SUPPORTED | |
| 1988 | CreditsHi! | G!(78); credits = Hi*30000+Lo (SUB_16A6, FNKey at 5982) | 0433-044E, 16A6-16DB, 5982-59A3 | CONTRADICTED (citation) | The name and G index 78 are fine (SUB_16A6 and the FN body at 0433). But the cited 5982 site calls FN **0x0452**, which works on **Val!** (`Val!*100`, `+1`, `=9` test, `/100`, a 2-decimal round). It does not use Hi/Lo. The credits FN is the body at 0x0433, which has no `call 0x433` anywhere. "shipped 3" cannot be checked in the listing |
| AE18 | Ch$ | key read inside SUB_2327 | 237F-2395, 245C | SUPPORTED | |
| 3B3C | BaseEnc! | G!(2235) encounter chance restored after delivery | 0F92, 65A0-65A3, 90C8 | SUPPORTED | Also set = INT(EncChance!*.7+.6) at 90C8 |
| 1998 | CurMove! | G!(82) "Cur. Move."; = INT(Count!+.5) in SUB_7F9D | 7864-786D, 81D0-81E2 | SUPPORTED | 81DF is inside SUB_7F9D (ret at 81E5) |
| B590 | PlanetCode1! | mission code 1 on mission planet else 0 | 5C3D-5C58 | SUPPORTED | |
| A4BCE | Digit1 | 4x5 "1"; SUB_2056 case 1 and 7 (OR then XOR) | 2056-2083, 20FF-2122 | CONTRADICTED (detail) | The cases are right: ON J! GOSUB entry 1 = 206F, entry 7 = 20FF. But the first PUT uses DL=3 = **PSET** (RT_LEDGER 3E_58), not OR. The second is DL=4 XOR. File offset 837 cannot be checked in the listing |
| 19B0 | Delay! | G!(88) "Current Delay Factor:"; DelayCount = Delay*1.2 | 165A, 8349-834F, 839A | SUPPORTED | "shipped 188" cannot be checked in the listing |
| A64AC | Planet46 | 16x16 planet, SUB_9138 case 19 (+2,+2) | 9419, 921B table entry 19 = 940B, 91B0-91C5 | SUPPORTED | File offset 7203 cannot be checked in the listing |
| B6AC | BestMember! | best-skill member; "Enemy beings spotted by" | 6152-61DF, 6D76-6D8D | SUPPORTED | |
| A1850 | G! | 51x51 COMMON single array, CHARINFO | 0248-0254, COMMON descriptor 0x490A | SUPPORTED | BLOAD CHARINFO into 0x1850. 2601 elements (= 51*51; the dimensions themselves are not in the listing) |
| B110 | StarNo! | = PixObj! at cursor; "Star"; -StarNo!; PlanetKey | 3E2E-3E49, 5C12-5C38 | SUPPORTED | |
| A6AFC | PlGravity! | gravity per class; "GRAVITY:"; sprite index | 3AEC-3B03, 596D, 915D-9173 | SUPPORTED | Only the class-3 formula (RND*.5+.01) was opened |
| 3B24 | SurfaceEnc! | G!(2229) surface encounter type before PLBATTLE | 6DD2-6DD8 | SUPPORTED | Gets PortNo! (the encounter type; value 1 = "spotted by" at 6D68) |
| SUB9138 | (sub) | planet sprite by SizeClass/PlGravity with offsets | 9138-921B | SUPPORTED | ON SizeClass! (3-way), then SpriteNo!, then a 30-way ON GOTO. +2 offset in class 2 |
| 18C4 | ShipClass! | BLOAD "SHIP"+STR$(-1-ShipClass!)+".BAS" | 0257-028B | SUPPORTED | |
| 1940 | MissileKiller! | G!(60) fitted flag, SGN() * pct | 059C, 7986-7997 | SUPPORTED | |
| SUB65A9 | (sub) | incoming signal, decode check, Message$ = ItemName$(MsgNo!+10), 34/row | 65A9-67CD | SUPPORTED | |
| SUB33AF | (sub) | LINE (28,0)-(123,7),2,BF and (28,2)-(123,5),1,BF | 33AF-33F0 | SUPPORTED | |

G!() index claims in the sample: 11 (2244, 9, 52, 45, 2242, 78, 2235, 82, 88, 2229, 60). All equal (addr-0x1850)/4.

#### Task B: screens

All 181 distinct double-quoted strings in SPACE_SCREENS.md were checked by script against the 265 SPACE literals. The 20-odd backtick readout labels (`Base Wt...`, `Killer....`, `Hit Bonus.`, `Shield `, `...`, ` kg`, ` pts`, etc.) were checked by grep. The rows below cover every non-exact item and the coordinate spot-checks. Every other quoted string is byte-equal to a literal.

| screen item | claimed | listing/literal evidence | verdict |
|---|---|---|---|
| 175 quoted strings | literal text | byte-equal to a SPACE literal (desc DS listed by the check script) | OK |
| 3b "SPSTGRPH.BAS" | BLOAD name | "SPSTGRPH" (0xB07E) + ".BAS" (0xA96C), SCAT at 37BD-37CB | OK (concatenation) |
| labels "LONG RANGE", "GALAXY SCAN", "SECTOR SCAN", "SYSTEM SCAN", "VISUAL" | view labels | not string literals: they are the header sprites HdrLongRange/HdrGalaxyScan/HdrSectorScan/HdrSystemScan/HdrVisual (PUT (32,0)). The text inside them cannot be checked in the listing | NOT A LITERAL (sprite text; unverified) |
| 13 "for"; 20000; "credits." | rescue cost | "for"; RescueCost!; "credits." with RescueCost! = #20000 (0x8838-0x883B) | OK |
| crew header | LOCATE 10,25 "NAME    AM RL" | 15A5-15B4: ARGPUSH 0xA, LOCATE 0x19 | OK |
| fuel readout | PRINT USING "####" at 4,26 | 1A5F-1A6E: 4, 0x1A, fmt 0xACA8 "####" | OK |
| alert box | 8,21 | 24F9/2512/252B: 8, 0x15 | OK |
| status line | LOCATE 2,5 "(" ... | 292A-2935: ARGPUSH 2, LOCATE 5 | OK |
| fueling | LOCATE 20,8 "Fueling ISS " | 3671-367A: 0x14, 8 | OK |
| refuel bar | LINE (30,168)-(283,188),,BF | 36AA-36C8: (0x1E,0xA8)-(0x11B,0xBC), BF | OK |
| text box clear | LINE (16,152)-(303,191),0,BF | 2299-22B4 | OK |
| menu cursor | PUT (240,156), Cursor, XOR | 1B78-1B8B: (0xF0,0x9C), DL=4 | OK |
| sector Empty Area | 21,15 + 24,13 | 3468-3489 | OK |
| system Empty Area | 21,16 + 24,14 | 571E-573F | OK |
| star sprite | PUT (64,72), Star1.., XOR | 3DA1-3DB4: (0x40,0x48), DL=4 | OK |
| visual title | LOCATE 3,11 "Planet" | 5760-5768: row = DX (3), col 0xB | OK |
| readout rows | 8,3 MASS / 9,3 GRAVITY / 11,3 DENSITY / 12,3 LIFE | 5951-595A, 59B8-59C1, 5A20-5A29, 5AEA-5AF3 | OK |
| delay screen | 22,3 "Current Delay Factor:" | 833B-8343 | OK |
| SUB_998F | 18,4 "Press SPACEBAR" | 998F-9998 | OK |
| game over | LOCATE 12,1 | 227F-2288 | OK |
| rescue lines | 21,3 "Rescued in" / 22,3 "for" | 8841-884A, 886D-8875 | OK |
| fully healed | 22,3 "Squad is fully healed" | 4FD4-4FE3 | OK |
| 10 `PUT ..., OR` items: Logo (154,0), HdrLongRange, PicBuf (16,16), HdrGalaxyScan, GalMap, HdrSectorScan, PicBuf (40,56)/(40,48), HdrSystemScan, SaveArea (15,8) | action OR | every one has DL=3 (e.g. 014B1, 02638, 02717, 032FF, 08F27). RT_LEDGER 3E_58 (H): 0 OR, 1 AND, 2 PRESET, **3 PSET**, 4 XOR | MISMATCH: should be PSET |
| 4a readout numbers | `LEFT$(STR$(FNKey(..)),n)` | the FN at 0x0452 rounds Val! to 2 decimals (MASS/GRAVITY/DIAMETER/DENSITY). It is not the credits formula. SPACE.bas.md 1958/1962/1966/1970 print `FNKey(CreditsHi!, CreditsLo!)` | MISMATCH (pseudocode FN identity) |

Root cause of the PUT mismatch: `decode/pseudo/tools/qb2bas.py:551` uses the verb map `{0:'PSET',1:'PRESET',2:'AND',3:'OR',4:'XOR'}`. This contradicts RT_LEDGER 3E_58. All 35 DL=3 PUTs in SPACE.bas.md print as `OR`, and the DL=4 ones (XOR, 50) are correct.

#### Summary

- Task A: 45 sampled. 43 SUPPORTED, 0 WEAK, 2 CONTRADICTED (detail only: 1988 CreditsHi! cites FNKey at 5982, but FN 0x0452 works on Val!; A4BCE Digit1 says "OR", but the listing has PSET). 0 NOT FOUND. The 11 G!() index claims are all correct.
- Task B: 181 distinct quoted strings. 175 are byte-equal literals, 1 is a valid concatenation (SPSTGRPH.BAS), and 5 view labels are sprite headers rather than literals (cannot be checked as text). All backtick readout labels are exact. 22 coordinate spot-checks all match.
- Task B mismatches: 10 `PUT ..., OR` (they are PSET; translator verb map, 35 statements in SPACE.bas.md) and the FNKey identity (FN_0452 = Val! 2-decimal round, not Hi*30000+Lo; `FN0452_args: 1988,198C` in SPACE_names.json is wrong, and the credits body is 0x0433).

## Verdict table (267 sampled statements)

Columns: statement offset (as printed in SPACE.bas.md) / first bytes / derivation from the listing / pseudocode text / verdict / note.

| offset | bytes | derivation | pseudocode | verdict | note |
|---|---|---|---|---|---|
| 0007B | bf ca 6a | FCMP [19A4]DriveCfg ? [6ACA]=2; je 0080 else jmp 0089 | IF DriveCfg! <> 2 THEN GOTO L_0089 | AGREE |  |
| 00210 | e9 00 00 | CSNG 0x6E56 -> FAC; Drive$ + "GALMAP.BAS" (A828); BLOAD off=FAC | BLOAD Drive$ + "GALMAP.BAS", &H6E56 | AGREE | 1FB `jmp 1FE` is the tail of the preceding empty IF |
| 00225 | bb 0c a0 | CSNG 0xA00C; Drive$ + "GALAXY.BAS" (A836); BLOAD off=FAC | BLOAD Drive$ + "GALAXY.BAS", &HA00C | AGREE | &HA00C as integer = -24564, same bytes |
| 0023A | bb 90 48 | CSNG 0x4890; Drive$ + "SPACESH.BAS" (A844); BLOAD | BLOAD Drive$ + "SPACESH.BAS", &H4890 | AGREE |  |
| 00254 | e9 0f 00 | (245 jmp 257 = tail of IF FTEST [A80C]) CSNG 0x1850; "CHARINFO" (A854, no Drive$); BLOAD | BLOAD "CHARINFO", &H1850 | AGREE |  |
| 0028B | bb fc 65 | CSNG 0x65FC -> T0 (71 #80); Drive$+"SHIP"; FSUB [A968]=-1 - [18C4]ShipClass; STR$; +".BAS" (A96C); BLOAD off=[A860]=T0 | BLOAD Drive$ + "SHIP" + STR$(-1 - ShipClass!) + ".BAS", &H65FC | AGREE |  |
| 00294 | bb 80 a9 | SASSIGN [A974]=Status$(0) <- "Dead" (A980) | Status$(0) = "Dead" | AGREE |  |
| 002AF | bb bc a9 | SASSIGN [A99C]=SlotTag$(1) <- "P" (A9BC) | SlotTag$(1) = "P" | AGREE |  |
| 002E8 | be 28 6c | dx=I; bx=CINT(I)*4+A998 (SlotTag$); FADD I+[A9C8]=46; CINT; CHR$; xchg cx,dx; SASSIGN | SlotTag$(CINT(I!)) = CHR$(CINT(I! + 46)) | AGREE |  |
| 00336 | bb 18 aa | SASSIGN [AA0A]=CondMark$(1) <- "*" (AA18) | CondMark$(1) = "*" | AGREE |  |
| 0033F | bb 1e aa | SASSIGN [AA0E]=CondMark$(2) <- "#" (AA1E) | CondMark$(2) = "#" | AGREE |  |
| 00359 | e9 77 00 | (34A jmp 3C4 = IF tail) CSNG 0x40F4; "LOGO" (AA24); BLOAD | BLOAD "LOGO", &H40F4 | AGREE |  |
| 00369 | 33 db | RT3E_20 bl=0 INPUT; cx=bx; bx=1; dx="CHARNAME" (AA2C); RT3E_1E OPEN | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE |  |
| 0036F | bb 01 00 | bx=1; RT3F_B6 INPUT #1 begin (items B7 n=1 type 04, B8 ->[488C]ShipName$ follow at 372-37A) | INPUT #1, ShipName$ | AGREE | line offset = INPUT begin; item/store bytes fall in the next range |
| 00389 | bb 01 00 | (FOR I=1 head 37D-383) bx=1; B6 INPUT #1 begin; following B7/B8 store -> [CINT(I)*4+4288]=CrewName$(I) | INPUT #1, CrewName$(CINT(I!)) | AGREE | store at 391-3A3 (after range) |
| 0044E | bf 88 aa | SUB_0433: FMUL [1988]CreditsHi*[AA88]=30000; +[198C]CreditsLo; +[AA8C]=0.5; INT; ret | RETURN   'with FAC = INT(CreditsHi! * 30000 + CreditsLo! + 0.5) | AGREE | FNKey body |
| 004A8 | bb 14 00 | bx=0x14 ARGPUSH; bx=2 LOCATE exec -> LOCATE 20,2 | LOCATE 20, 2 | AGREE |  |
| 00513 | bf 58 29 | FMOV [2958]=G!(1090) <- [AAB8]=21 | G!(1090) = 21 | AGREE |  |
| 0058C | 8b f2 | si=dx(I); FADD I+[6C80]=3; di=I (FSTORE/limit 2421 test at 58F-597 follow) | NEXT I! STEP 3 | AGREE | NEXT step 3; FOR limit [AAC8]=2421 |
| 0077E | cd 3f 7d | (76B-776: FSTORE I; FCMP I?22; jbe 73C = NEXT I tail) FMOV [1864]ComputerOK <- 1 | ComputerOK! = 1 | AGREE | range also holds the preceding NEXT tail |
| 008DF | bf 14 1a | si=[6ACA]=2 carried; FMOV [1A14]=G!(113) <- 2 | G!(113) = 2 | AGREE |  |
| 008EB | bf 2c 1a | si=2 carried; FMOV [1A2C]=G!(119) <- 2 | G!(119) = 2 | AGREE |  |
| 00941 | bf 78 aa | Fn2Field[AA78]=9, Fn2Member[AA7C]=6; call 0414 (FNIdx = INT(m*100+f+[AA80])); CINT; G!(idx) <- [6C2C]=9 | G!(CINT(FNIdx(6, 9))) = 9 | AGREE |  |
| 009C0 | cd 3f 7d | (NEXT I tail: FSTORE, FCMP I?8, jbe 94E) Field=5, Member=[si]=5; call 0414; CINT; G!() <- [AB08]=70 | G!(CINT(FNIdx(5, 5))) = 70 | AGREE | range also holds the preceding NEXT tail |
| 009E8 | bf 78 aa | Field=[AAE0]=35, Member=[AABC]=5; call 0414; CINT; G!() <- [AB0C]=0 | G!(CINT(FNIdx(5, 35))) = 0 | AGREE |  |
| 00A15 | bf 24 19 | FMOV [1924]ArmorDiv <- [AB04]=15 | ArmorDiv! = 15 | AGREE |  |
| 00A7B | be 20 ab | FLOAD [AB20]=320; jmp AAA (test, limit [AB24]=329) | FOR I! = 320 TO 329 | AGREE |  |
| 00AAA | 8b f2 | si=dx(I); FADD I+1; di=I (store/limit 329 test follow) | NEXT I! | AGREE |  |
| 00B20 | bf 5c 1c | FMOV [1C5C]=G!(259) <- [AAB8]=21 | G!(259) = 21 | AGREE |  |
| 00B4A | bf 30 1d | FMOV [1D30]KillStartMission <- [AB3C]=25 | KillStartMission! = 25 | AGREE |  |
| 00C96 | bf 78 aa | Field=[AB54]=19, Member=[6E42]=7; call 0414; CINT; G!() <- [AABC]=5 | G!(CINT(FNIdx(7, 19))) = 5 | AGREE |  |
| 00CC9 | 8b f2 | (after READ G!(I)) si=dx(I); FADD I+1; di=I (limit [AB5C]=2244 follows) | NEXT I! | AGREE |  |
| 00D6F | be 28 6c | di=CINT(I)*4+1850; RND; FMUL [AB3C]=25; INT; FSTORE [di] | G!(CINT(I!)) = INT(RND * 25) | AGREE |  |
| 00E42 | 8b f7 | si=[AB74]Ix; dx=bx=I (bx=si=6C28 at E22); si=CINT(Ix)*4+1850; xchg -> FMOV G!(CINT(Ix)) <- [I] | G!(CINT(Ix!)) = I! | AGREE |  |
| 00E7E | cd 3f 7d | (NEXT I tail: FSTORE, FCMP I?25, jbe E16) FMOV [3BB8]=G!(2266) <- [AB7C]=77 | G!(2266) = 77 | AGREE | range also holds the preceding NEXT tail |
| 00F2A | bf c0 6a | FADD [AB84]Member+1; di=Member (store + limit 8 follow) | NEXT Member! | AGREE |  |
| 00F40 | cd 3f 7d | (NEXT Member tail: FSTORE, FCMP ?8, jbe EDA) FMOV [AB8C]Difficulty <- [6C24]=0 | Difficulty! = 0 | AGREE | range also holds the preceding NEXT tail |
| 00FBE | e8 65 16 | call 2626 (else branch; FB8 call 1023/jmp FC1 = then branch) | GOSUB SUB_2626 | AGREE |  |
| 00FD7 | 8b fe | di=si=[3BB8]G!(2266) (si from FTEST at FC1); si=[6C24]=0; FMOV | G!(2266) = 0 | AGREE |  |
| 00FE2 | 8b fe | di=si=6C24 (0); si=[3B88]G!(2254); FCMP G!(2254)?0; ja FE7 else jmp 1017 | IF G!(2254) <= 0 THEN GOTO L_1017 | AGREE |  |
| 00FF3 | bb 16 00 | bx=0x16 ARGPUSH; bx=0x0D LOCATE exec -> LOCATE 22,13 | LOCATE 22, 13 | AGREE |  |
| 0101D | bf b6 ab | FMOV [ABB6]ShownAlert <- [6C88]=4 | ShownAlert! = 4 | AGREE |  |
| 01040 | ba 09 00 | bx=1 carried from SCREEN 1 at 1037; dx=9; RT3E_4A PALETTE | PALETTE 1, 9 | AGREE | BX reuse from SCREEN arg |
| 01049 | bb 02 00 | bx=2; dx=4; PALETTE | PALETTE 2, 4 | AGREE |  |
| 010A7 | e9 fc 01 | jmp 12A6 | GOTO L_12A6 | AGREE |  |
| 01220 | bb 2f 01 | coord bx=0x12F=303 int, dx=[ABCA]=171.5 ptr; start [ABC2]=4.71; end [ABBE]=1.57; aspect [6ACA]=2; radius [ABCE]=20.5, color 2 | CIRCLE (303, 171.5), 20.5, 2, 4.71, 1.57, 2 | AGREE |  |
| 012CC | bb f8 00 | coord 0xF8=248, [ABD2]=35.5; start [ABBE]=1.57; end [ABC2]=4.71; aspect [6C80]=3; radius [ABD6]=28.5, color 2 | CIRCLE (248, 35.5), 28.5, 2, 1.57, 4.71, 3 | AGREE |  |
| 0141C | bb 2f 01 | coord 303, [ABDA]=107.5; start 4.71; end 1.57; aspect [6C2C]=9; radius [ABDE]=36.5, color 2 | CIRCLE (303, 107.5), 36.5, 2, 4.71, 1.57, 9 | AGREE |  |
| 01650 | e8 0c 04 | call 1A5F | GOSUB SUB_1A5F | AGREE |  |
| 016F5 | c3 | ret (FAC last set at 16E7/16EC: [AC30]Delta - CreditsHi*[AA88]=30000, also stored to CreditsLo) | RETURN   'with FAC = Delta! - (CreditsHi! * 30000) | AGREE |  |
| 01775 | e9 0d 00 | (1772 jmp 1782 = tail of folded IF) RT3F_BC PRINT begin; "-- --" (AC38) RT3F_6E newline at 1778-177B | PRINT "-- --" | AGREE | line offset = PRINT begin; item falls after range |
| 017E6 | 8b f2 | si=dx(Count, set at 17B5); FADD +1; di=[AC52]Count (limit [AC56]=369 follows) | NEXT Count! | AGREE |  |
| 01871 | bf c0 6a | FADD [6C28]I + 1; di=I (limit 8 follows) | NEXT I! | AGREE |  |
| 01A0A | bb 94 ac | (PRINT "Press ENTER Key" 6A ; = body of the 19F8 line) RT3D_06 INKEY$; SASSIGN [AC6C]K$ | K$ = INKEY$ | AGREE | range also holds the PRINT item of the preceding line |
| 01A2E | bf 1a ac | FMOV [AC1A]Tmp4 <- [192C]Armor | Tmp4! = Armor! | AGREE |  |
| 01AEA | cd 3f bc | RT3F_BC PRINT begin; then CINT [ACB0]M*4+4288 CrewName$, RT3F_6A ; (1AED-1AFB) | PRINT CrewName$(CINT(M!)); | AGREE | items after range |
| 01B23 | 33 db | (PRINT body of 1B01 line: POS(0), sub 31, neg, SPC, "" ;) FADD [ACB0]M+1; di=M | NEXT M! | AGREE | range also holds the PRINT SPC(31-POS(0)); ""; items |
| 01C08 | bf 4c ad | FCMP [AD48]Cmd ? [AD4C]=40; jne 1C0D else jmp 33A6 | IF Cmd! = 40 THEN GOTO L_33A6 | AGREE |  |
| 01CDF | e9 01 00 | (1CDC jmp 1CE0 = folded IF tail) ret; FAC last = Cmd!+[AD64]=-64 (1C98, stored to Cmd!) | RETURN   'with FAC = Cmd! - 64 | AGREE | FAC = old Cmd! - 64 |
| 01D35 | e9 b6 00 | jmp 1DEE | GOTO L_1DEE | AGREE |  |
| 01D66 | bb 28 6c | bx=[6C28]I ptr, dx=[AACC]ShipY ptr (cx=ax=-1); RT3E_89; bx=0x6724 ShipHead2; dl=3; RT3E_58 PUT | PUT (I!, ShipY!), ShipHead2, OR | DISAGREE | verb DL=3 = PSET (RT_LEDGER 3E_58: 0 OR 1 AND 2 PRESET 3 PSET 4 XOR); correct: PUT (I!, ShipY!), ShipHead2, PSET. qb2bas.py line 551 maps 3->OR (systematic: every dl=3 PUT) |
| 01E04 | 90 | nop; FADD [AC52]Count + [AD6C]Heading; FSTORE [AB74]Ix | Ix! = Count! + Heading! | AGREE |  |
| 01E88 | bf ca 6a | FCMP Count?2: bx=0,jbe,dec -> (Count>2) -> T2; FCMP Count?[AAD4]=6 -> (Count>6); T2+FAC; +Count; +1; FSTORE [6E3E]J | J! = (Count! > 2) + (Count! > 6) + Count! + 1 | AGREE |  |
| 01EF5 | bf 84 ad | FMOV [AD84]Tmp2 <- [AD8C]=6.28 | Tmp2! = 6.28 | AGREE |  |
| 01F65 | bf 88 ad | FMOV [AD88]ArcOn <- 1 | ArcOn! = 1 | AGREE |  |
| 01F9B | eb e8 | jmp short 1F85 | GOTO L_1F85 | AGREE |  |
| 01FDA | 90 | nop; FSUB [ADB4]=37 - [AD7C]L; FSTORE [ADB0]ArcY1 | ArcY1! = 37 - L! | AGREE |  |
| 020B6 | c3 | 20B6 ret | RETURN | AGREE | |
| 020E3 | bb 28 6c | BX=I! DX=ShipY! CX=AX=-1 (ptrs), RT3E_89; BX=Digit5, DL=3, RT3E_58 = PUT (I!,ShipY!),Digit5,PSET | PUT (I!, ShipY!), Digit5, OR | DISAGREE | `PUT (I!, ShipY!), Digit5, PSET`: 20E0 `mov dx,3`; RT3E_58 verb 3 = PSET per RT_LEDGER (raster table entry 72AE copy). qb2bas.py:551 maps {0 PSET,1 PRESET,2 AND,3 OR,4 XOR} - systematic translator bug |
| 02125 | bb 28 6c | BX=I! DX=ShipY! (CX/AX=-1 carried from 2105/2108), RT3E_89; BX=Digit1 DL=4 -> PUT ...,XOR | PUT (I!, ShipY!), Digit1, XOR | AGREE | 4 = XOR in both mappings |
| 021BD | e9 0b 00 | 21B2 jmp 21C0 is the tail of the preceding IF (ja 21B5); 21B5 SI=Cmd! (from 21A8) + [-32.0] -> Cmd! | Cmd! = Cmd! - 32 | AGREE | |
| 0227C | bb ff ff | BX=-1, RT3E_32 = CLS (no arg) | CLS | AGREE | |
| 0231D | c3 | ret | RETURN | AGREE | |
| 02332 | 33 db | POS(0) (BX=0, RT3D_21), CSNG, store CurX! (AE0A) | CurX! = POS(0) | AGREE | |
| 0236D | cd 3f bc | 236D PRINT begin; following 2370-237C: K$ (6A ;), " " (AE12, 6A ;), PRINT end | PRINT K$; " "; | AGREE | sample range ends at PRINT begin; items read from 2370-237C |
| 02482 | bf 64 ac | Idx! (AC64) <- [AAF8]=0.0 | Idx! = 0 | AGREE | |
| 0251E | cd 3f bc | PRINT begin; 2521 "  GREEN  " (AE4E) RT3F_6E newline; 2527 end | PRINT "  GREEN  " | AGREE | items after range end |
| 02543 | bb 5c ae | 253A-2540 = items of previous PRINT ("         " + NL), 2543 ret | RETURN | AGREE | range includes PRINT tail; statement = ret |
| 0254A | cd 3d 06 | INKEY$ -> BX; DX=K$ (AC6C); SASSIGN | K$ = INKEY$ | AGREE | |
| 025A7 | c3 | ret | RETURN | AGREE | |
| 025B9 | cd 3f bc | PRINT begin; 25BC CINT(Member!)*4+4288 = CrewName$() 6A ; then " is dead." (AE7C) 6E NL; end | PRINT CrewName$(CINT(Member!)); " is dead." | AGREE | items after range end |
| 0263B | bb 20 00 | BX=32 DX=0 CX=AX=0 (literal ints) RT3E_89; BX=HdrLongRange (4936), DL=3 -> PUT (32,0),HdrLongRange,PSET | PUT (32, 0), HdrLongRange, OR | DISAGREE | `PUT (32, 0), HdrLongRange, PSET`: 2638 `mov dx,3` = PSET (RT_LEDGER 3E_58) |
| 02705 | bb 08 90 | FAC=CSNG(&H9008)->T2; Drive$+"MAP"; NEG [SI=MapNo! from 26C9]; STR$; +".BAS"; BLOAD file, [T2] | BLOAD Drive$ + "MAP" + STR$(-MapNo!) + ".BAS", &H9008 | AGREE | |
| 02778 | e9 6f 00 | jmp 27EA | GOTO L_27EA | AGREE | |
| 027E7 | e9 03 f4 | jmp 1BED | GOTO L_1BED | AGREE | |
| 02938 | cd 3f bc | PRINT begin; "(" ;, MID$(STR$(SectorX!+1),DX=2,CX=2) ; (DX=BX=2 from 292A/2930), "," ;, MID$(STR$(32-SectorY!),2,2) ;, ") ZN:" ;, ZoneTag$(CINT(Zone!)) ;, "  " ; then end (no NL) | PRINT "("; MID$(STR$(SectorX! + 1), 2, 2); ","; MID$(STR$(32 - SectorY!), 2, 2); ") ZN:"; ZoneTag$(CINT(Zone!)); "  "; | AGREE | items 293B-2990 |
| 029FC | bb a6 02 | SOUND 0x2A6=678, dur [SndDur!]; exec -1,-1 | SOUND 678, SndDur! | AGREE | |
| 02AE8 | bf 04 af | MissionCode1! (AF04) <- 0.0 | MissionCode1! = 0 | AGREE | |
| 02B28 | bf 0c af | MissionEnc! (AF0C) <- 0.0 | MissionEnc! = 0 | AGREE | |
| 02BB0 | e9 3c 02 | 2BA4 jmp = previous IF tail; SectorCode! ? 2099.0 (AF1C): jae 2BB5 else jmp 2D41 -> IF SectorCode! < 2099 GOTO 2D41 | IF SectorCode! < 2099 THEN GOTO L_2D41 | AGREE | |
| 02BE0 | e9 31 00 | 2BD6 jmp = previous IF tail; DI=BX=SectorX! (3AF0, from 2BBE) <- 29.0 (AF24) | SectorX! = 29 | AGREE | |
| 02D38 | e8 96 ec | call 19D1 | GOSUB SUB_19D1 | AGREE | |
| 02D79 | 90 | DI = (CINT(CurX!) + 16*CINT(CurY!))*4 + 6D1E (PixColor!) <- 0.0 | PixColor!(CINT(CurX!), CINT(CurY!)) = 0 | AGREE | |
| 02DB6 | cd 3f 7d | 2DA0-2DAB = NEXT CurX! tail (<=15 loop); SectorCode! ? 777: ja 2DBB else jmp 2DE2 -> IF SectorCode! <= 777 GOTO 2DE2 | IF SectorCode! <= 777 THEN GOTO L_2DE2 | AGREE | |
| 02DE2 | c3 | ret | RETURN | AGREE | |
| 02E69 | e9 ef 01 | jmp 305B | GOTO L_305B | AGREE | |
| 02E77 | bf c0 6a | ObjCount! + 1.0 -> ObjCount! | ObjCount! = ObjCount! + 1 | AGREE | |
| 02EA9 | be 6c ad | FTEST Heading!: jb 2EAE (neg) else jmp 2EB9 -> IF Heading! >= 0 GOTO 2EB9 | IF Heading! >= 0 THEN GOTO L_2EB9 | AGREE | |
| 02F72 | 8b 7e fa | DI=[bp-6] (=(CINT(CurY!)*16+CINT(CurX!))*4 from 2F25) + 6D9E PixCol!; DX=K! (AC90, via 2EE4 xchg); CX=(K!<4) (mov 0/jae/dec), *8; CSNG - K! + 11 | PixCol!(CINT(CurX!), CINT(CurY!)) = (K! < 4) * 8 - K! + 11 | AGREE | |
| 03073 | 8b fb | 3068 store = NEXT Ix! tail; DI=BX=1.0 (6AC0); CurY! + 1 -> CurY! (3076) | NEXT CurY! | AGREE | step 1 |
| 0309D | bf c0 6a | CurX! + 1.0 -> CurX! (30A0), compare 15 follows | NEXT CurX! | AGREE | |
| 030D6 | 8b d3 | 30C3 DX=BX=3; prev PRINT "A-Up Scan" NL; ARGPUSH 21 (0x15); last arg BX=DX=3; LOCATE exec | LOCATE 21, 3 | AGREE | range includes previous PRINT tail |
| 03183 | bf c0 6a | CursorCol! ? 1.0: jb 3113 | IF CursorCol! < 1 THEN GOTO L_3113 | AGREE | |
| 031A5 | e9 74 ff | 319C jmp = previous IF tail; DX! (AD40) <- 1.0 | DX! = 1 | AGREE | |
| 0326B | cd 3d 34 | RND * 1.1 (AFB6), INT, -> FuelUse! (AED0) | FuelUse! = INT(RND * 1.1) | AGREE | |
| 032A3 | 8b fe | DI=SI=1.0; RadTick2!+1 -> T2; FCMP RadTick2! ? 6.0 -> BX=(RadTick2!<6); ABS(BX) (jge/neg); CSNG; T2*FAC -> RadTick2! | RadTick2! = (RadTick2! + 1) * (-(RadTick2! < 6)) | AGREE | compiled as ABS(); same value for -1/0 |
| 03311 | bb 14 00 | ARGPUSH 20; last 3; LOCATE | LOCATE 20, 3 | AGREE | |
| 0335E | e8 f6 e2 | call 1657 | GOSUB SUB_1657 | AGREE | |
| 03460 | 8b f7 | AX=(StarClass!=0) (jne/dec); CX=PixCol! addr (index CursorRow!+16*CurY! from 3410-3423); FAC = [DX=CursorCol!] - CurY!*8; DX=(PixCol!(..) <> FAC); OR; jne 3465 else jmp 3495 | IF NOT ((PixCol!(CINT(CursorRow!), CINT(CurY!)) <> CursorCol! - (CurY! * 8)) OR (StarClass! = 0)) THEN GOTO L_3495 | AGREE | |
| 034B5 | e9 e8 03 | 34A0 jmp = previous IF tail; BX=32 DX=CX=AX=0; RT3E_89; HdrVisual (4B28), DL=3 -> PSET | PUT (32, 0), HdrVisual, OR | DISAGREE | `PUT (32, 0), HdrVisual, PSET`: 34B2 `mov dx,3` = PSET (RT_LEDGER 3E_58) |
| 03512 | bb 08 90 | CSNG(&H9008)->T2; Drive$+"SPPIC"; NEG [SI=DI=PortNo! B006]; + -1.0; STR$; +".BAS"; BLOAD ..., [T2] | BLOAD Drive$ + "SPPIC" + STR$(-PortNo! - 1) + ".BAS", &H9008 | AGREE | |
| 03556 | 8b f1 | 353D-354D = previous PRINT PortName$(CINT(..)) NL tail; LoadedMap! (AEC4) <- 0.0 | LoadedMap! = 0 | AGREE | range includes PRINT tail |
| 035EF | be 48 ad | CINT(Cmd!); RT3F_5E n=3 words 320A,35E9,360A +10h -> 321A,35F9,361A | ON CINT(Cmd!) GOTO L_321A, L_35F9, L_361A | AGREE | |
| 03617 | bb 4a b0 | Drive$ + "STARPORT.STR" (B04A); RT3E_0E | CHAIN Drive$ + "STARPORT.STR" | AGREE | |
| 03626 | e9 58 ff | jmp 3581 | GOTO L_3581 | AGREE | |
| 0379E | cd 3f 7d | 3791-379C = NEXT I! (step 2, limit BarX1!) tail; 379E call 1A5F | GOSUB SUB_1A5F | AGREE | |
| 037D1 | bb 08 90 | CSNG(&H9008)->FAC; Drive$+"SPSTGRPH"+".BAS"; BLOAD, DX=1A (FAC) | BLOAD Drive$ + "SPSTGRPH" + ".BAS", &H9008 | AGREE | |
| 03888 | bb be b0 | Drive$ + "INSIDE.STR"; RT3E_0E | CHAIN Drive$ + "INSIDE.STR" | AGREE | |
| 0390E | cd 3d 34 | RND->T2; StarClass!+7.0; T2*FAC; +1.0; INT -> NumBodies! (B0D8) | NumBodies! = INT(RND * (StarClass! + 7) + 1) | AGREE | |
| 03B48 | 81 c1 7c 6b | CX=4*CINT(I!)+6B7C PlSurface!; RND->T2; FAC=[DX=PlGravity!(I) 6AFC+4i] + -0.2; FCMP T2?FAC jae -> BX=(RND<..); +4; store | PlSurface!(CINT(I!)) = (RND < PlGravity!(CINT(I!)) - 0.2) + 4 | AGREE | |
| 03CCC | e9 3d 00 | jmp 3D0C | GOTO L_3D0C | AGREE | |
| 03D84 | cd 3d 34 | RND ? [DI=BX=0.5 (AA8C, from 3D51/3D63)]: DX=(RND<0.5); *2+1; CSNG -> MapRow! (AEAC) | MapRow! = (RND < 0.5) * 2 + 1 | AGREE | |
| 03E38 | cd 3f bc | PRINT begin; "Star" (B114) ;, NEG [SI=DI=StarNo!] RT3F_6B single NL; end | PRINT "Star"; -StarNo! | AGREE | items after range end |
| 03E6B | be 28 6c | FTEST OrbitClass!(CINT(I!)) (6AD4+4i): jne 3E70 else jmp 3EC0 | IF OrbitClass!(CINT(I!)) = 0 THEN GOTO L_3EC0 | AGREE | |
| 03E95 | e9 50 00 | 3E6D jmp = previous IF tail; OrbitDX!(CINT(I!)) (6BD4) * MapCol!; *2^3; +67.0 -> CurX! | CurX! = ((OrbitDX!(CINT(I!))) * MapCol!) * 8 + 67 | AGREE | |
| 03F29 | e8 81 48 | call 87AD | GOSUB SUB_87AD | AGREE | |
| 04009 | bf 40 ad | DX! <- -1.0 (A968) | DX! = -1 | AGREE | |
| 04018 | bf c4 aa | SysCurX! ? 11.0: jbe 401D else jmp 3F97 | IF SysCurX! > 11 THEN GOTO L_3F97 | AGREE | |
| 04026 | e9 17 00 | jmp 4040 | GOTO L_4040 | AGREE | |
| 040A6 | e8 7f d7 | call 1828 | GOSUB SUB_1828 | AGREE | |
| 040C3 | bb 42 b1 | "Change with who?" (B142) -> Prompt$ (AC68) | Prompt$ = "Change with who?" | AGREE | |
| 041B8 | cd 3f 7d | 4185-4190 = NEXT ShipY! (limit RecEnd!) tail; SI=CrewName$(CINT(Member!)) (4288+4m), DI=CrewName$(CINT(Count!)); RT3F_14 string SWAP | SWAP CrewName$(CINT(Member!)), CrewName$(CINT(Count!)) | AGREE | range includes NEXT tail |
| 042A9 | bf 84 ab | Member! (AB84) <- 1.0 (FOR init; 42AC FLOAD + jmp test follow) | Member! = 1 | AGREE | |
| 04369 | bb 14 00 | ARGPUSH 20; last 6; LOCATE | LOCATE 20, 6 | AGREE | |
| 0436C | 0436C cd 3f bc | 0436C PRINT begin; CrewName$(CINT(Member! 0xAB84)) via 6A ';', then " Repairing" 0xB186 via 6E (newline) | PRINT CrewName$(CINT(Member!)); " Repairing" | AGREE |  |
| 043EE | 043EE e8 05 d3 | call 0x16F6 | GOSUB SUB_16F6 | AGREE |  |
| 04446 | 04417 bf e0 aa | Idx!*35 (8F, 0xAAE0=35) -> T2; FnField=26, FnMember=Member!, call 03E2 = FNCrew(Member!,26); *10 (0x6C84); +T2; store 0xB182 RepairPct! | RepairPct! = Idx! * 35 + FNCrew(Member!, 26) * 10 | AGREE |  |
| 04574 | 04574 cd 3f bc | 04574 PRINT begin; "Repair What?  *-Broken #-Unfixable" 0xB1EA via 6A (';') | PRINT "Repair What?  *-Broken #-Unfixable"; | AGREE |  |
| 04624 | 04618 e9 89 00 | ARGPUSH 0x18 (24), LOCATE exec bx=0x0C (12); range also holds the jmp 0x46A4 of the previous IF | LOCATE 24, 12 | AGREE |  |
| 0466B | 0464C be 64 ac | bx=-1 if FTEST Idx! zero (jne skip dec); dx=-1 if RND<0.9 (FCMP FAC?0.9, jae skip dec); or; je 4670 else jmp 0x440B | IF (RND < 0.9) OR (Idx! = 0) THEN GOTO L_440B | AGREE |  |
| 0469E | 04695 bb 26 b2 | PRINT "Kit Used Up"; items, then call 0x19D1 at 0469E | GOSUB SUB_19D1 | AGREE |  |
| 04B50 | 04B3C bf f0 b0 | I! (0x6C28)*0.25 (0xB0F0); INT (RT3D_03 on FAC); store Count! 0xAC52 (inside FOR I loop from 04B33) | Count! = INT(I! * 0.25) | AGREE |  |
| 04DDF | 04DD2 bf 88 6c | ElapsedHrs! 0xAEFC + 4 (0x6C88) -> ElapsedHrs! | ElapsedHrs! = ElapsedHrs! + 4 | AGREE |  |
| 04DE7 | 04DE2 8b f3 | si=bx=0x6AC0 (#1, saved at 04DD5 from previous FMOV); FMOV ItemType! 0xAE2A <- 1 | ItemType! = 1 | AGREE |  |
| 04E42 | 04E39 bb 16 00 | ARGPUSH 0x16 (22), LOCATE exec 3 | LOCATE 22, 3 | AGREE |  |
| 04EA5 | 04E85 bf 64 aa | FnField=15 (0xAB04), FnMember=J! (0x6E3E), call 03E2; +4 (0x6C88); store Count! | Count! = FNCrew(J!, 15) + 4 | AGREE |  |
| 04EEB | 04EEB cd 3f bc | 04EEB PRINT begin; "fully healed" 0xB312 via 6E (newline) | PRINT "fully healed" | AGREE |  |
| 04FEF | 04FEF e9 b6 fa | jmp 0x4AA8 | GOTO L_4AA8 | AGREE |  |
| 0507D | 05066 33 db | OPEN mode 0 (INPUT), name = Drive$ (0x6AAA) + "MISSION" (0xB36E) SCAT, #1 (bx=1), RT3E_1E | OPEN Drive$ + "MISSION" FOR INPUT AS #1 | AGREE |  |
| 05095 | 05092 bb 01 00 | INPUT #1 begin (B6); B7 n=2 types 04 04; stores 0xB37E MissionText1$, 0xB382 MissionText2$ | INPUT #1, MissionText1$, MissionText2$ | AGREE | types 04 04 go to string vars (0xB37E is MID$ source at 0513B) and 02 to Scratch!; RT_LEDGER's RT3F_B7 type list (04 single, 03 string, 02 integer) does not fit these call sites - ledger question, not a pseudocode error |
| 050B7 | 050B3 90 | INPUT #1 begin at 050B7 (B7 n=1 type 02 and store to 0xB386 Scratch! follow) | INPUT #1, Scratch! | AGREE | see type-code note on the previous INPUT row |
| 050CE | 050BA cd 3f b7 01 02 | range = INPUT items for Scratch! + ShipY! (0xAACC) += 1, store, compare <= 14 (0xAB80), jbe 0x50B4; FOR ShipY = 0 TO 14 from 050AA | NEXT ShipY! | AGREE | the INPUT item calls B7/B8 fall into this range by range convention (INPUT anchored at B6) |
| 050FD | 050FD e8 99 d1 | CLOSE #1 precedes; call 0x2299 | GOSUB SUB_2299 | AGREE |  |
| 051B2 | 051B2 e9 48 ff | MissionText1$ <- MissionText2$; MissionText2$ <- "" precede; jmp 0x50FD | GOTO L_50FD | AGREE |  |
| 05221 | 05218 bb ae b3 | PRINT "Computer Broken" (6E) items, then jmp 0x3320 | GOTO L_3320 | AGREE |  |
| 0524B | 0524B cd 3f bc | LOCATE 21, cx(=3) precedes; 0524B PRINT begin; "B-Mission Kill List" 0xB3D8 via 6E | PRINT "B-Mission Kill List" | AGREE |  |
| 05368 | 05368 e8 44 e0 | Idx! = 0 precedes; call 0x33AF | GOSUB SUB_33AF | AGREE |  |
| 053E3 | 053DE 8b f3 | KillEnd1! (0xB44E) <- Tmp2! (0xAD84) limit copy; FLOAD Tmp1! (si=bx=0xAD80); jmp 53F2 = I! store, cmp KillEnd1, jbe body 53E6, step +1 | FOR I! = Tmp1! TO KillEnd1! | AGREE |  |
| 05439 | 05433 be 24 6c | KillEnd2! <- Tmp2!; FLOAD #0; jmp 5448 = I! store, cmp KillEnd2 (0xB452), jbe 543C, step +1 | FOR I! = 0 TO KillEnd2! | AGREE |  |
| 0547B | 05472 bb 12 00 | ARGPUSH 0x12 (18), LOCATE 3 (at L_5472) | LOCATE 18, 3 | AGREE |  |
| 054EF | 054B4 bf 56 b4 | PRINT LEFT$(ShipType$(CINT(G!(CINT(I!+210)))),10) items; then row = ax = dx = CINT(Idx!+4) from 054A3/054A9, LOCATE exec 0x0D (13) | LOCATE CINT(Idx! + 4), 13 | AGREE |  |
| 056EA | 05694 be 28 6c | off=CINT(I!)*4; cx=(OrbitDX!(off)*MapCol! = PickX!); bx=(OrbitDY!(off)*MapRow! = PickY!) AND cx; cx=(OrbitClass!(off) > 0, FTEST jbe) AND bx; jne 56EF else jmp 0x56F7 | IF NOT ((OrbitClass!(CINT(I!)) > 0) AND (((OrbitDY!(CINT(I!))) * MapRow! = PickY!) AND ((OrbitDX!(CINT(I!))... | AGREE |  |
| 0593C | 0593C cd 3f bc | 0593C PRINT begin; "Unbreathable" 0xB51C via 6E | PRINT "Unbreathable" | AGREE |  |
| 059F4 | 059E8 cd 3e 79 | PRINT end of previous PRINT; ARGPUSH 0x0A (10), LOCATE 3 | LOCATE 10, 3 | AGREE |  |
| 05A29 | 05A1D cd 3e 79 | PRINT end of previous PRINT; ARGPUSH 0x0B (11), LOCATE 3 | LOCATE 11, 3 | AGREE |  |
| 05B4D | 05B30 be 64 b5 | PRINT LifeForm$(CINT(PlForm!)) items; ARGPUSH 0x0F (15), LOCATE 9 | LOCATE 15, 9 | AGREE |  |
| 05BD5 | 05BB9 8b c8 | cx=ax=0 (integer coords, ax from 05BA0); LINE (0x3D=61,0x61=97)-(0x3E=62,0x8F=143); exec color -1 (default), DX=1 BF, style -1 | LINE (61, 97)-(62, 143), , BF | AGREE |  |
| 05C03 | 05BFD bf 0e ae | FMOV CurY! 0xAE0E <- 111 (0xB588) | CurY! = 111 | AGREE |  |
| 05C0C | 05C06 bf 20 b1 | FMOV OrbitNo! 0xB120 <- Idx! 0xAC64 | OrbitNo! = Idx! | AGREE |  |
| 05CA7 | 05CA1 be 10 af | FTEST MissionNo! 0xAF10; jbe 5CAC (<=0 falls on); else jmp 0x5D66 | IF MissionNo! > 0 THEN GOTO L_5D66 | AGREE |  |
| 05D30 | 05D30 e9 6d 32 | EnemyType! = ... - 50 precedes; jmp 0x8FA0 | GOTO L_8FA0 | AGREE |  |
| 05E71 | 05E6B be 9c b5 | FTEST EnemyType! 0xB59C; jb 5E76 (negative continues); else jmp 0x6DC6 | IF EnemyType! >= 0 THEN GOTO L_6DC6 | AGREE |  |
| 05F11 | 05F11 cd 3f bc | 05F11 PRINT begin; ItemName$(CINT(FoundItem! 0xB638)) via 6E | PRINT ItemName$(CINT(FoundItem!)) | AGREE |  |
| 05FA1 | 05F98 bb 16 00 | ARGPUSH 0x16 (22), LOCATE 3 | LOCATE 22, 3 | AGREE |  |
| 05FDB | 05FD8 e9 06 00 | jmp 5FE1 (false branch of preceding IF); call 0x5F95 | GOSUB SUB_5F95 | AGREE |  |
| 06067 | 06057 90 | RND*100 (0xAA6C) FCMP SuccessPct! 0xB624; jb 606C continues; else jmp 0x60D5 | IF RND * 100 >= SuccessPct! THEN GOTO L_60D5 | AGREE |  |
| 06103 | 060FD be 34 b6 | FTEST FoundQty! 0xB634; je 6108 (print); else jmp 0x6117 | IF FoundQty! <> 0 THEN GOTO L_6117 | AGREE |  |
| 06108 | 06105 e9 0f 00 | 06108 PRINT begin; "Nothing new found" 0xB67E via 6E | PRINT "Nothing new found" | AGREE |  |
| 06158 | 06152 bf 20 b6 | FMOV BestSkill! 0xB620 <- -1 (0xA968) | BestSkill! = -1 | AGREE |  |
| 06265 | 06265 e8 69 b7 | call 0x19D1 (second of two) | GOSUB SUB_19D1 | AGREE |  |
| 0637B | 0635F e9 04 fa | FoundItem!+400 (0xAAAC), CINT, *4 + 0x1850 -> G!(); FMOV <- 1 | G!(CINT(FoundItem! + 400)) = 1 | AGREE |  |
| 063DA | 063D1 bf c0 6a | FCMP MissionType! 0x3B44 ? 1; je 63DF (call 8CC2); else jmp 0x63E2 | IF MissionType! <> 1 THEN GOTO L_63E2 | AGREE |  |
| 0640B | 06403 e9 25 00 | di=si=0xB594 PlanetCode2! (from 063E5); FMOV <- #0 (0xB72C) | PlanetCode2! = 0 | AGREE |  |
| 06411 | 0640E bf 08 af | si still 0xB72C (#0); FMOV MissionCode2! 0xAF08 <- 0 | MissionCode2! = 0 | AGREE |  |
| 06428 | 06425 e9 03 00 | jmp 642B (false branch of IF MissionType=1); call 0x8CC2 | GOSUB SUB_8CC2 | AGREE |  |
| 06434 | 0642B bf a0 b5 | FCMP MissionEncB! 0x3B58 ? 150 (0xB5A0); ja 6439 continues; else jmp 0x6445 | IF MissionEncB! <= 150 THEN GOTO L_6445 | AGREE |  |
| 06454 | 0644B bb 14 00 | ARGPUSH 0x14 (20), LOCATE 3 | LOCATE 20, 3 | AGREE |  |
| 06566 | 0655D bf 80 6c | FCMP MissionType! ? 3 (0x6C80); je 656B (call 8CC2); else jmp 0x656E | IF MissionType! <> 3 THEN GOTO L_656E | AGREE |  |
| 065B8 | 065B8 cd 3f bc | 065B8 PRINT begin; "Incoming signal," 0xB7A6 via 6E | PRINT "Incoming signal," | AGREE |  |
| 067C7 | 067B5 e9 15 00 | bx=Message$ 0xB814, dx=0x67 (103), cx=0xC8 (200), MID$; assign to dx=ax=Message$ | Message$ = MID$(Message$, 103, 200) | AGREE |  |
| 06879 | 06870 bb 7e b8 | Drive$ + "INSIDE.STR" (0xB87E) SCAT; RT3E_0E CHAIN | CHAIN Drive$ + "INSIDE.STR" | AGREE |  |
| 0699C | 0699C cd 3f bc | 0699C PRINT begin; ItemName$(CINT(TradeItem! 0xB894)) via 6A ';'; "? (Y/N)" 0xB8C8 via 6A ';' | PRINT ItemName$(CINT(TradeItem!)); "? (Y/N)"; | AGREE |  |
| 069C2 | 069BC be a8 aa | FTEST YesNo! 0xAAA8; jne 69C7 continues; else (zero) jmp 0x5D66 | IF YesNo! = 0 THEN GOTO L_5D66 | AGREE |  |
| 06A66 | 06A5D bb 15 00 | ARGPUSH 0x15 (21), LOCATE 3 | LOCATE 21, 3 | AGREE |  |
| 06AAD | 06AAD e9 b6 f2 | jmp 0x5D66 | GOTO L_5D66 | AGREE |  |
| 06B32 | 06B29 bb 16 00 | ARGPUSH 0x16 (22), LOCATE 3 | LOCATE 22, 3 | AGREE |  |
| 06C33 | 06C33 cd 3e 2b | RT3E_2B BEEP (first of three) | BEEP | AGREE |  |
| 06D9C | 06D79 bb 9a b9 | PRINT "Enemy beings spotted by "; CrewName$(CINT(BestMember!)) items; ARGPUSH 0x17 (23), LOCATE 3 | LOCATE 23, 3 | AGREE |  |
| 06DB4 | 06DAE be a8 aa | FTEST YesNo!; je 6DB9 (EnemyType=-1); else jmp 0x6DC5 | IF YesNo! <> 0 THEN GOTO L_6DC5 | AGREE |  |
| 06DC5 | 06DC5 c3 | ret | RETURN | AGREE |  |
| 06E0B | 06E02 bb cc b9 | Drive$ + "PLBATTLE.STR" (0xB9CC) SCAT; RT3E_0E CHAIN | CHAIN Drive$ + "PLBATTLE.STR" | AGREE |  |
| 06E33 | 8b d3 bb dc b9 | tail of PRINT "A-Inspect Ship" (6E22-6E28), then bx=0x15 ARGPUSH (row 21), bx=dx=3 (dx<-bx=3 at 6E20) LOCATE exec -> LOCATE 21, 3 | LOCATE 21, 3 | AGREE | range starts inside prior PRINT (translator anchors PRINT at RT3F_BC) |
| 06E84 | e9 60 08 bb 02 ba | 6E7B jmp 76DE (tail of IF Cmd!=1); bx=BA02 "Inspect Who?", dx=AC68 Prompt$, RT3F_61 -> Prompt$ = "Inspect Who?" | Prompt$ = "Inspect Who?" | AGREE | |
| 07193 | 8b f1 bf f4 aa | PRINT USING item G!(CINT(Rec!+13)) (cx=Rec!, AAF4=13); then 7193 PRINT begin; 7196 BA86 " kg" RT3F_6E (+NL) -> PRINT " kg" | PRINT " kg" | AGREE | |
| 07355 | cd 3f bc | 7355 PRINT begin; 7358 BB02 "Healing" RT3F_6A (;) -> PRINT "Healing"; | PRINT "Healing"; | AGREE | |
| 074DC | bb e2 b2 cd 3f 6a | "/" RT3F_6A; bx=Fmt2$ RT3F_BD; si=ax(=Rec! BA28 from 74BA) + AAF0 49 -> CINT -> G!(), RT3F_6B (+NL) -> PRINT USING Fmt2$; G!(CINT(Rec!+49)) | PRINT USING Fmt2$; G!(CINT(Rec! + 49)) | AGREE | |
| 07594 | cd 3f bc | PRINT begin; BB6E "Hand" RT3F_6E (+NL) -> PRINT "Hand" | PRINT "Hand" | AGREE | |
| 075EC | bf 4a ba be 48 ad | FCMP Cmd!(AD48) ? -40 (BA4A); jae skip; jmp 6E7E -> IF Cmd! < -40 THEN GOTO L_6E7E | IF Cmd! < -40 THEN GOTO L_6E7E | AGREE | |
| 0766A | e9 41 00 bf c0 6a | (jmp 76A3 tail of IF NOT); si=I!(6C28)+1.0(6AC0); di=si; FSTORE -> I! = I! + 1 | I! = I! + 1 | AGREE | |
| 0767E | 8b f7 bf 88 6c | si=I! + 4.0(6C88), CINT, ARGPUSH (row); bx=3 LOCATE exec -> LOCATE CINT(I!+4), 3 | LOCATE CINT(I! + 4), 3 | AGREE | |
| 076CA | e9 11 00 e8 c2 22 | (jmp 76DB tail of IF I!>0); call 998F -> GOSUB SUB_998F | GOSUB SUB_998F | AGREE | |
| 076E4 | e8 f6 ab | call 22DD -> GOSUB SUB_22DD | GOSUB SUB_22DD | AGREE | |
| 076F3 | cd 3f bc | PRINT begin; BB82 "ISS " RT3F_6A; 488C ShipName$, dx=12 LEFT$, RT3F_6E (+NL) -> PRINT "ISS "; LEFT$(ShipName$,12) | PRINT "ISS "; LEFT$(ShipName$, 12) | AGREE | |
| 0774F | bb c2 bb cd 3f 6e | tail PRINT " tn" (BBC2, +NL); bx=6 ARGPUSH; bx=dx (=3 from 771D mov dx,bx after LOCATE 5,3) -> LOCATE 6, 3 | LOCATE 6, 3 | AGREE | |
| 077BE | 8b d8 cd 3f 6e | tail PRINT ax(" tn") +NL; bx=8 ARGPUSH; bx=dx(=3) -> LOCATE 8, 3 | LOCATE 8, 3 | AGREE | |
| 0787F | bf 4a ba be 48 ad | FCMP Cmd! ? -40; jae 7884; jmp 6E0E -> IF Cmd! < -40 THEN GOTO L_6E0E | IF Cmd! < -40 THEN GOTO L_6E0E | AGREE | |
| 07884 | e9 8a f5 e8 77 aa | (jmp 6E0E tail); call 22FE -> GOSUB SUB_22FE | GOSUB SUB_22FE | AGREE | |
| 07A5B | bb 4c bc cd 3f 6a | prior PRINT "Shield ";CHR$(..);"..."; then Fmt3$ RT3F_BD; dx=&ShipY!(AACC): G!(CINT(ShipY!)) kept in dx, ShipY!+(-1) -> CINT -> SGN G!(); FMUL; RT3F_67 (;) -> PRINT USING Fmt3$; G!(CINT(ShipY!))*SGN(G!(CINT(ShipY!-1))); | PRINT USING Fmt3$; (G!(CINT(ShipY!))) * (SGN(G!(CINT(ShipY! + -1)))); | AGREE | |
| 07B96 | e9 78 f2 e8 65 a7 | (jmp 6E0E tail); call 22FE -> GOSUB SUB_22FE | GOSUB SUB_22FE | AGREE | |
| 07DCA | 90 bf ca 6a be 28 6c | dx=&I!; (G!(CINT(I!+2)) = Member!(AB84)) -1/0 (jne/dec) CSNG -> T2; *SGN(G!(CINT(I!))) -> T3(A878); T3*G!(CINT(I!+1)); WtSum!(BC78) - FAC (RT3F_9B) -> store WtSum! | WtSum! = WtSum! - (((G!(CINT(I! + 2)) = Member!) * (SGN(G!(CINT(I!))))) * (G!(CINT(I! + 1)))) | AGREE | |
| 07EC1 | cd 3f 7d 8b f7 | (tail of NEXT I! loop test vs 2597, jmp 7DF2); target G!(CINT(Rec!+14)) (AB80=14) in dx; G!(CINT(Rec!+39)) (BC7C=39) + WtSum!, /10 (6C84), INT, store | G!(CINT(Rec! + 14)) = INT((G!(CINT(Rec! + 39)) + WtSum!) / 10) | AGREE | |
| 07FA3 | bf 78 bc be f8 aa | FMOV WtSum!(BC78) <- 0.0(AAF8) -> WtSum! = 0 | WtSum! = 0 | AGREE | |
| 082DA | bf bc aa be 74 ab | target G!(CINT(Ix!+5)) (AABC=5, AB74 Ix!); source G!(CINT(Ix!+2)) (6ACA=2); FMOV | G!(CINT(Ix! + 5)) = G!(CINT(Ix! + 2)) | AGREE | |
| 083B2 | bf 6a af be 68 a9 | FMOV ObjCount!(AF6A) <- -1.0(A968) | ObjCount! = -1 | AGREE | |
| 083BB | bf 00 bd be 80 6c | FMOV ListRow!(BD00) <- 3.0(6C80) | ListRow! = 3 | AGREE | |
| 0840A | e9 33 00 bb 10 bd | (jmp 8435 tail of IF G!()>0); bx=BD10 "Weapon", dx=AC6C K$, RT3F_61 -> K$ = "Weapon" | K$ = "Weapon" | AGREE | |
| 08672 | be 64 ac cd 3f a7 | bx=(Idx!=0) (FTEST jne/dec); dx=(ObjCount!<11) (jae/dec); AND; bx=(ListRow!<14) (jae/dec); AND; jne 8677(ret) else jmp 8678 -> IF NOT (ListRow!<14 AND ObjCount!<11 AND Idx!=0) THEN GOTO L_8678 (else RETURN) | IF NOT ((ListRow! < 14) AND ((ObjCount! < 11) AND (Idx! = 0))) THEN GOTO L_8678 | AGREE | |
| 086CC | e8 89 95 | call 1C58 -> GOSUB SUB_1C58 | GOSUB SUB_1C58 | AGREE | |
| 0870A | c3 | ret -> RETURN | RETURN | AGREE | |
| 0878B | 81 c2 4c 6b 87 f2 | dx=4*CINT(Cmd!-1) (from 874F-8767) + 6B4C PlanetNo! base; CINT [elem] ARGPUSH (row); bx=5 -> LOCATE CINT(PlanetNo!(CINT(Cmd!-1))), 5 | LOCATE CINT(PlanetNo!(CINT(Cmd! - 1))), 5 | AGREE | |
| 087E8 | e8 ae 9a | call 2299 -> GOSUB SUB_2299 | GOSUB SUB_2299 | AGREE | |
| 0884A | bb 15 00 cd 3e 42 | bx=0x15 ARGPUSH; bx=3 -> LOCATE 21, 3 | LOCATE 21, 3 | AGREE | |
| 088E0 | 8b df bf 64 aa | FnField!(AA64)=31(AAE4), FnMember!(AA68)=L!(AD7C); call 03E2 (FNCrew); FTEST FAC ja skip, jmp 893C -> IF FNCrew(L!,31) <= 0 THEN GOTO L_893C | IF FNCrew(L!, 31) <= 0 THEN GOTO L_893C | AGREE | |
| 08936 | be 7c ad 8b de | (prior PRINT CrewName$(L!);" has starved to death."); Fn2Field!=31, Fn2Member!=L!(dx), call 0414 (FNIdx), CINT, G!() <- 0.0(AB88) | G!(CINT(FNIdx(L!, 31))) = 0 | AGREE | |
| 08AA2 | be c0 6a cd 3f 6f | FLOAD 1.0, jmp 8B05: store J!(6E3E), FCMP J! ? 20.0(AB34) jbe 8AA6 (body); increment at 8AFC +1.0 -> FOR J! = 1 TO 20 | FOR J! = 1 TO 20 | AGREE | |
| 08CE6 | 90 be 3e 6e | G!(CINT(J!)) FCMP 1.0; je 8CEB (then) else jmp 8CFB -> IF G!(CINT(J!)) <> 1 THEN GOTO L_8CFB | IF G!(CINT(J!)) <> 1 THEN GOTO L_8CFB | AGREE | |
| 08E32 | e8 03 03 | call 9138 -> GOSUB SUB_9138 | GOSUB SUB_9138 | AGREE | |
| 08E86 | bb 2c 00 ba 0c 00 | bx=0x2C(44) dx=0x0C(12) cx=ax=0 (integer literals) RT3E_89; bx=5AC4 DropShip3; dx=3 RT3E_58 -> verb 3 = PSET | PUT (44, 12), DropShip3, OR | DISAGREE | correct: PUT (44, 12), DropShip3, PSET. 8E83 `mov dx,3`; RT_LEDGER 3E_58 verb 3 = PSET (raster table entry 72AE = plain copy). qb2bas.py:551 verb map {0:PSET,1:PRESET,2:AND,3:OR,4:XOR} contradicts the ledger (0 OR,1 AND,2 PRESET,3 PSET,4 XOR) - systemic, 35 ", OR" PUTs in SPACE.bas.md |
| 08F2A | bb 0f 00 ba 08 00 | bx=15 dx=8 cx=ax=0 RT3E_89; bx=7E5A SaveArea; dx=3 RT3E_58 -> PUT (15,8), SaveArea, PSET | PUT (15, 8), SaveArea, OR | DISAGREE | correct: PUT (15, 8), SaveArea, PSET. 8F27 `mov dx,3` = PSET per RT_LEDGER 3E_58 (same translator verb-map bug) |
| 08F9C | cd 3f 7d 8b f7 | (tail of NEXT R!: store R!, R!<=3 jbe 8F44); si=Note!(BDFA)+1.0, di=si FSTORE -> Note! = Note! + 1 | Note! = Note! + 1 | AGREE | |
| 08FA0 | e8 f6 92 | call 2299 -> GOSUB SUB_2299 | GOSUB SUB_2299 | AGREE | |
| 08FAF | cd 3f bc | PRINT begin; BE0A "Scanning nearby craft" RT3F_6E (+NL) | PRINT "Scanning nearby craft" | AGREE | |
| 08FE1 | e9 41 00 cd 3f bc | (jmp 9022 of IF EnemyType!<1); PRINT begin; BE24 "It is friendly.  Approach? (y/n)" RT3F_6A (;) | PRINT "It is friendly.  Approach? (y/n)"; | AGREE | |
| 09004 | e9 56 8b | jmp 1B5D -> GOTO L_1B5D | GOTO L_1B5D | AGREE | |
| 09037 | e8 ac f1 | call 81E6 -> GOSUB SUB_81E6 | GOSUB SUB_81E6 | AGREE | |
| 09043 | bb 6c be b8 aa 6a | bx=BE6C "SPBATTLE.EXE", ax=6AAA Drive$, SCAT ax+bx, RT3E_0E CHAIN | CHAIN Drive$ + "SPBATTLE.EXE" | AGREE | |
| 09103 | bf 90 ab be 28 6c | I!(6C28)+110(AB90) CINT -> G!(); FTEST ja 9108 else jmp 911E -> IF G!(CINT(I!+110)) <= 0 THEN GOTO L_911E | IF G!(CINT(I! + 110)) <= 0 THEN GOTO L_911E | AGREE | |
| 0914B | be 20 b1 cd 3f 75 | CINT OrbitNo!(B120) -> si=4*bx+6AD4 (OrbitClass!), FMOV SizeClass!(BE80) <- elem | SizeClass! = OrbitClass!(CINT(OrbitNo!)) | AGREE | |
| 09205 | bf d4 aa be 0a ae | CurX!(AE0A)+6.0(AAD4); xchg si,di (di=&CurX!); FSTORE -> CurX! = CurX! + 6 | CurX! = CurX! + 6 | AGREE | |
| 09272 | c3 | ret -> RETURN | RETURN | AGREE | |
| 09287 | bb 0a ae ba 0e ae | bx=&CurX! dx=&CurY! cx=ax=-1 (single pointers) RT3E_89; bx=5EE4 Planet29; dx=4 XOR | PUT (CurX!, CurY!), Planet29, XOR | AGREE | |
| 092A2 | c3 | ret -> RETURN | RETURN | AGREE | |
| 092EA | c3 | ret -> RETURN | RETURN | AGREE | |
| 0931A | c3 | ret -> RETURN | RETURN | AGREE | |
| 093AA | c3 | ret -> RETURN | RETURN | AGREE | |
| 093BF | bb 0a ae ba 0e ae | (CurX!,CurY!) single pointers; bx=639C Planet42; dx=4 XOR | PUT (CurX!, CurY!), Planet42, XOR | AGREE | |
| 0943A | c3 | ret -> RETURN | RETURN | AGREE | |
| 09537 | bb 02 00 cd 3e 42 | bx=2 ARGPUSH; bx=3 -> LOCATE 2, 3 | LOCATE 2, 3 | AGREE | |
| 097CE | 90 bf ca 6a be 28 6c | G!(CINT(I!+2)) FCMP Member!(AB84); je 97D3 (then) else jmp 980A -> IF G!(CINT(I!+2)) <> Member! THEN GOTO L_980A | IF G!(CINT(I! + 2)) <> Member! THEN GOTO L_980A | AGREE | |
| 098E1 | 8b f7 bf 2c 6c | Scratch!(B386) FCMP 9.0(6C2C); ja 98E6 else jmp 98EB -> IF Scratch! <= 9 THEN GOTO L_98EB | IF Scratch! <= 9 THEN GOTO L_98EB | AGREE | |
| 09956 | e8 a2 fc | call 95FB -> GOSUB SUB_95FB | GOSUB SUB_95FB | AGREE | |
| 09989 | e8 03 00 | call 998F -> GOSUB SUB_998F | GOSUB SUB_998F | AGREE | |
| 099B3 | c3 | ret -> RETURN (last ret of code) | RETURN | AGREE | |
| 099B5 | 18 be 78 a8 | data past last ret (0x99B4-0x99EE per header) disassembled as `sbb byte ptr [bp-0x5788], bh` | ' asm sbb byte ptr [bp - 0x5788], bh | AGREE | non-code; comment matches listing text |
| 099C9 | 00 00 | data, disasm `add byte ptr [bx+si], al` at 99C9 | ' asm add byte ptr [bx + si], al | AGREE | non-code; matches listing |
| 099DF | 00 17 | data, disasm `add byte ptr [bx], dl` at 99DF | ' asm add byte ptr [bx], dl | AGREE | non-code; matches listing |
| 099E1 | 00 01 | data, disasm `add byte ptr [bx+di], al` at 99E1 | ' asm add byte ptr [bx + di], al | AGREE | non-code; matches listing |
