# PLBATTLE — verification (lane verify, Opus, 2026-10-15)

Inputs: `decode/pseudo/PLBATTLE.bas.md`, `PLBATTLE_SCREENS.md`, `PLBATTLE_names.json` (lane mod-plbattle, commit 2760fc6), `decode/listings/PLBATTLE.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` + `decode/data/tools/_PLBATTLE.json`, `decode/data/SPRITES.md` + `sprites_index.tsv`.

**Sample:**
- 2169 statement lines in `## Pseudocode`. Python `random.seed(20261015)`, `random.sample(range(2169), 217)` (10%), plus every CHAIN / BLOAD / BSAVE / ON GOTO / ON GOSUB / INPUT / OPEN line (20 sites) = **237 statements**.
- Each statement was derived from the listing first, then compared with the pseudocode. Four independent passes (subagents of this lane) did this.
- Each pass also hunted the five translator weak spots found in the other modules: mislabelled FN, split PRINT, variable-STEP FOR, register reuse, dropped DS store.
- A fifth pass did names (45, same seed), all 9 FN bodies (30 of 213 call sites by hand), the screens, the SCREEN-mode/bank selection and the Unknowns.
- This lane re-checked the contradictions from the bytes.

## Summary

- 237 statements: **237 AGREE, 0 DISAGREE, 0 UNSURE**. No translator weak-spot instance in or around the sample.
  - The variable-STEP loops (InitLevel!/InitStep! 06587-070AE, U!/PStep1! 086F1-0874C, MinusOne2! 096D2, legend 03A2) are reconstructed.
  - All 8 named FNs (06A9 FNCrew, 06DB FNIdx, 179F, 17F8, 183B, 1875, 18D5 FNOffMap, 1932 FNPassable) match their bodies and caller slots.
- Names: 41/45 SUPPORTED, 2 WEAK, 2 CONTRADICTED (`_why` texts only). Screens: about 69 literals + 45 concatenations proven; 70/70 PUT array/verbs, 86/86 LOCATEs, 20/20 coordinates.
- Documentation errors: 4 contradicted claims and a few weak ones, listed below; no rendered statement is affected.
- Data finding: **the BIGSH-n.BAS/.EGA bytes after the portrait are animation frames + a frame script, not stale memory** (fix request to data).

## Mode and sprite-bank selection (for BUILD_PLAN)

- `SCREEN 7` only at 0061-0072 (`UseEGA!` = 1); otherwise the SCREEN 1 inherited through CHAIN stays. There is no COLOR or PALETTE statement in PLBATTLE.
- TR-n: `.EGA` (`UseEGA!` = 1, 0333) or `.BAS` (0380), both to &HBC6C.
- PLBTSH: `PLBTSH.EGA` (019E0) or `plbtsh.bas` (019F8), to &HAC70 (test `= 1`, 019C6).
- BIGSH portrait: test `UseEGA! <> 0` (01957). EGA = `"BIGSH"+STR$(-n)+".EGA"` to &H8052 **without Drive$** (019BD); CGA = `Drive$+...+".BAS"` to &H942E (01990).
- Logo: `LOGO.EGA` into `BoxSave` (0349, EGA only); the CGA logo at 0x40F4 is already in COMMON (the `BLOAD "LOGO"` at 0509 is on the debug path).

## Findings and fix requests (documentation only)

1. `TowState!` (1868) `_why` and Variables row: "<> 2 prints it". The bytes say the opposite: 04463 `FCMP [1868]?[9412]=2; je 4471` → PRINT "Tow linkage broken". **= 2 prints it**; other values continue to salvage. (Statement 0446C is rendered right.)
2. `GrpPortrait!` (AC308) `_why`: "12 forces group size BoardCrew!". 01260 compares with 0xBB56 = 3 together with `Terrain! = 10`, so the override applies for any portrait other than 3.
3. Header "PLBTSH ... 18 slots of 132 bytes": the indices are right but the slot sizes are not. Boom1..5 are 0x124 apart, Cursor→Shot1 is 0x184, then 8/16/20 bytes; only the 16x16 slots are 132.
4. `FNPassable` (SUB1932 in names.json and the SUB table) "returns -1": 01944-0194E `mov bx,0; je; dec bx; and; jge; neg bx` returns **+1** (callers test `<> 0`).
5. Weak:
   - `PortTick!` range is 0..13 (9C5C-9C83), not 0..12.
   - `NewState!` is also reused as a letter code (4E74/4F34).
   - Header line 19 "logo LOGO (CGA) chosen accordingly": no CGA logo load on the normal path.
   - Header Unknowns "`N_D130!` never given a value": stored 0 at 06480, negated at 064CE (always 0 holds).
   - SCREENS row 16 door text: two PRINTs (004AB `use the door at the`; 004B7 `bottom of the map.`) that wrap onto row 17.
   - `9404_why`: Drive$ is not prefixed to the LOGO (0509) and BIGSH .EGA (019BD) names.
   - `MapSave` is the enemy-grid band, not "the title area".
6. Cosmetic: every FOR prints its STEP on the NEXT line (e.g. `0201B FOR J! = 1100 TO 1397` … `020BD NEXT J! STEP 3`), while the header describes `FOR x = a TO b STEP s`. The same convention holds in all modules; document it in the headers.

## Data fix request (BIGSH animation frames)

- `PLBATTLE_names.json`: PortFrame1..4 at DS 0x9920/0x9DF4/0xA2C8/0xA79C in the CGA buffer (BLOAD &H942E) = BIGSH-n.BAS file offsets 1273/2509/3745/4981. Each starts with a valid 88x56 CGA header (`b0 00 38 00`); frame 4 exists only in the files long enough (e.g. BIGSH-6.BAS, 6218 bytes).
- PortEgaFrame1..3 at DS 0x8AF2/0x8ED4/0x91D0 in the EGA buffer (BLOAD &H8052) = BIGSH-n.EGA offsets 2727/3721/4485 (small overlay arrays, e.g. 16x19, 14x19, 26x28 in BIGSH-1.EGA). The words after each portrait are a frame script (type, delay/100) read at 9B5B / 9D53.
- PUT sites: 9CE4..9D2F (CGA, every 0.123 s) and 9F34..9F72 (EGA, XOR at (I_89F6%+8, I_89F8%+25)).
- SPRITES.md (BIGSH- family text: "bytes after the first array are stale memory") and `sprites_index.tsv` (BIGSH maxn 1) must index and render these arrays, like TITLE.BAS.

## Names, DEF FN and screens pass (output of the fifth pass)

### PLBATTLE verify - names / DEF FN / screens (2026-10-15)

#### Summary
- Task A: 45 sampled names: 41 SUPPORTED, 2 WEAK (NewState!, PortTick!), 2 CONTRADICTED (TowState! _why inverted; GrpPortrait! '12' clause, real test is <> 3), 0 NOT FOUND; G!() indices 8/8 correct.
- Task B: 9 FN bodies, formulas and arg slots all correct; 213 call sites rendered as FN calls, 30 checked by hand; 1 mismatch (FNPassable comment says -1, returns +1); only the 8 FNs return FAC values, all named.
- Task C: 0 bad texts; PUT 70/70, LOCATE 86/86, 20/20 coords; 1 CONTRADICTED (PLBTSH '132-byte slots'), 4 WEAK; sprite table below.

#### Task A - names sample (random.seed(20261015), random.sample(sorted keys excl. _*, *_why, FN*, SUB*), n=45 of 379)

All 45 addresses occur in PLBATTLE.lst (no NOT FOUND). G!() index = (addr-0x1850)/4 recomputed for every G! claim: 19A8=86, 3B20=2228, 1D34=313, 3BA0=2260, 1D28=310, 3B44=2237, 1868=6, 19B0=88 - all correct.

| # | key | name | listing refs | sites read | verdict | note |
|---|---|---|---|---|---|---|
| 1 | AC570 | MoveScore! | 10 (add di,0xc570) | 4A5A-4A76 ((Dist-KeepDist)^2*10, 0x9412=2), 4CF3-4D0A FCMP jb -> copy (minimum) | SUPPORTED | |
| 2 | AC3D8 | UnitFlames! | 6 | 14DB =0, 1505-1531 INT((RND*.7+.5)*C21+.5), 7665-7673 + [C6B0]=-1 | SUPPORTED | |
| 3 | CA4E | EquipHit! | 6 | 8488 =1, 6F05/6F0A "Equipment destroyed.", 2C99/2CD6 all-dead product | SUPPORTED | dual use is stated in _why |
| 4 | CCFE | NewState! | 8 | 3BE3/3C71/3CBA =2, 3CD8 =1, 40B4 GrpState!(I)=NewState! | WEAK | slot also reused as a letter code: 4E74 `NewState! = I! + 65`, 4F34 `PRINT CHR$(NewState!)` - not mentioned in _why |
| 5 | 19A8 | StdDelay! | 2 | 1B14 -> DelayBase!, 5452 PRINT after "Standard Time Delay:" | SUPPORTED | G!(86) ok |
| 6 | 3B20 | Terrain! | 2 | 0194 -> TerrType!, 1251 FCMP vs 0xBAF4 (=10) | SUPPORTED | G!(2228) ok |
| 7 | 1D34 | Kills! | 1 | 43F8-4400 FADD [C6B0](-1), store | SUPPORTED | G!(313); matches SPACE_names "Kills:" |
| 8 | D238 | Target! | 4 | 6F84 =5, 7FFA/802D GrpX!/GrpY!(Target), 81EB =Grp! | SUPPORTED | |
| 9 | AC378 | GrpFlameDmg! | 5 | INPUT 0E93 position 20 (counted), 721F, 76A1 | SUPPORTED | |
| 10 | CEFA | KeepDist! | 2 | 49C1 = 2^(4-GrpTactic)-1, 4A62 | SUPPORTED | |
| 11 | C9E4 | Unit! | 44 | 28BA FOR, 697D =FNCrew(M,33), 6FE3 FOR | SUPPORTED | |
| 12 | C936 | N_C936! | 1 | 1C27 store only | SUPPORTED | never read: true (single ref is mov di) |
| 13 | D140 | GrpMax8! | 2 | 64DA =NGroups-1, 6564 loop bound | SUPPORTED | |
| 14 | D3FE | ToX! | 30 | 8015 =GrpX(Target)*8-5, 8167 edge clip | SUPPORTED | |
| 15 | D47E | Noise! | 2 | 8BCA/8BD0 FOR/NEXT 1..8 | SUPPORTED | |
| 16 | D2E6 | NTargets! | 7 | 78FC INT(RND*NewWep*2+1), 8234 =1, 82B5 RND^.7*GrpSize+1 | SUPPORTED | |
| 17 | C932 | Attacked! | 6 | 1C1E =0, 4102/70F3/714B =1, 6F60 test | SUPPORTED | |
| 18 | AC82A | CommRatio! | 2 | 1B91 READ (I+J*5), 3ACC (5*Bucket+Approach) | SUPPORTED | |
| 19 | CE24 | TowIdx! | 3 | 436D =TowSlot!, 43A4, 4504 | SUPPORTED | |
| 20 | D476 | N_D476! | 1 | 8A41 NOT toggle inside dead 89EA-8B79 | SUPPORTED | |
| 21 | 3BA0 | Enclosure! | 1 | 0224 IF TerrType<>11, 022B -> EncAdd! | SUPPORTED | G!(2260) ok |
| 22 | D04E | MinusOne5! | 3 | 5782 =-1, 58C6/58D5 STEP | SUPPORTED | |
| 23 | AC308 | GrpPortrait! | 7 | 0E93 col 10, 1260 FCMP vs [BB56], 1990/19BD BIGSH, A8C1 | CONTRADICTED (one clause) | _why says "12 forces group size BoardCrew! when boarding (1270)"; 0125D-01270 compares GrpPortrait!(0) with 0xBB56 = `00 00 40 82` = 3 (je -> dx=0), ANDed with Terrain!=0xBAF4 (=10): override runs for portrait <> 3, not 12. Rest correct |
| 24 | 488C | ShipName$ | 1 | 05ED INPUT #1 field 1 | SUPPORTED | |
| 25 | D41A | EdgeY! | 3 | 80D7 =143, 80E3 =32, 8106 | SUPPORTED | |
| 26 | C108 | CrewName2$ | 1 | 0603 INPUT field 3 | SUPPORTED | |
| 27 | 89FA | FrameDX2% | 1 | 9F3F mov bx,[0x89fa] -> PUT (x+8,..) PortEgaFrame2, XOR (9F53) | SUPPORTED | |
| 28 | C6C0 | Sp1! | 3 | 117B INSTR, 11C1 =Sp2!, 1209 | SUPPORTED | |
| 29 | D44E | PStep1! | 3 | 86E2 =PStep!, 8752 STEP | SUPPORTED | |
| 30 | BA90 | I! | 219 | 00D4, 00F1, 010C ... | SUPPORTED | |
| 31 | D24C | NewWep! | 14 | 71B3 =UnitWeapon!, 7283 =2, 72C4 =1, 7343/7371 melee->rockets->flames fall-through | SUPPORTED | |
| 32 | C92E | CommState! | 4 | 1C15 =2, 358D ON CommState+1 GOTO 3D65/37C5/35A0, 3798 =1, 37AA =0 | SUPPORTED | |
| 33 | AC2A8 | GrpSpeed! | 4 | 0E93 col 5, 4908 INT(GrpSpeed*Phase/6+.5) | SUPPORTED | |
| 34 | 1D28 | N_1D28! | 1 | 43CE-43D8 -1 | SUPPORTED | G!(310). SPACE/SPBATTLE name it KillStartAll! - could be adopted |
| 35 | 3B44 | N_3B44! | 1 | 4407-4413 G!(2237)-10 vs ExitTag! -> SUB_A8B8 | SUPPORTED | SPACE/SPBATTLE name it MissionType! - could be adopted |
| 36 | 1868 | TowState! | 3 (+1 false hit: jae 0x1868 at 01865) | 0DDE =1 (debug), 04463-0446E | CONTRADICTED | _why says "<> 2 prints it, = 2 goes on to Towing for salvage". Bytes: `mov di,0x9412` (=2) / `mov si,0x1868` / FCMP / `je 0x4471` -> 04471 PRINT [CE3C]="Tow linkage broken" + ret; `jmp 0x447e` (<>2) -> salvage. So = 2 prints "Tow linkage broken"; the pseudocode line 0446C renders this correctly, only the _why (and the Variables table row) is inverted |
| 37 | CF4A | SlotRec! | 1 | 50F1 =WepSlot*12+788 | SUPPORTED | |
| 38 | C9E8 | DelayN1! | 2 | 291F =Delay*0.6, 293F FOR bound | SUPPORTED | |
| 39 | AC0B8 | Status$ | 2 | 04DA "Dead"/"Okay"/"Rad ", 2D8D indexed by field 31 | SUPPORTED | |
| 40 | 19B0 | Delay! | 4 | 2919/294D *0.6/*0.5, 546F PRINT, 54BA store after clamp 1..9999 (5497-54AD) | SUPPORTED | G!(88) ok |
| 41 | D3EE | PauseN2! | 2 | 7F33 =DelayUnits*0.8, 7F56 | SUPPORTED | |
| 42 | D422 | EdgeT! | 2 | 80FB, 8127 min of the two edge params | SUPPORTED | |
| 43 | CA62 | CmdMax! | 5 | 2E33 compare in SUB_2DBF, 3891 =6, 3950 =3, 51CF =0 | SUPPORTED | |
| 44 | AA79C | PortFrame4 | 1 | 9D29 mov bx,0xa79c -> PUT (8,25),PortFrame4,PSET | SUPPORTED | |
| 45 | D50E | PortTick! | 3 | 9B68 test, 09C59-09C83, 9C96 =1 | WEAK | _why says counter 0..12; bytes 09C5C-09C83: T3 = PortTick+1; FCMP [SI=0xD50E] vs [0xBAD0] (=`00 00 50 84` = 13) on the OLD value; result = (old+1)*(-(old<13)) -> 12 -> 13 -> 0, so the range is 0..13 |

Task A counts: SUPPORTED 41, WEAK 2 (NewState!, PortTick!), CONTRADICTED 2 (TowState!, GrpPortrait! clause), NOT FOUND 0.

#### Task B - DEF FNs (all 8 named + unused credits FN)

Constants (`_PLBATTLE.json` init): BB9E=100, C118=1500, C11C=0.1, C128=1500.5, C130=30000, BB52=0.5, 9412=2, C0F4=5, BAF4=10, C194=7, C71A=-1.5, C71E=-12, C726=39, C1D0=26, C1E4=18, BB56=3. GrpX! C518, GrpY! C53C, Map% BBCA (`[di-0x4436]`).

| FN | body | formula (verified) | arg slots | call sites checked | verdict |
|---|---|---|---|---|---|
| FNCrew (06A9) | 06A9-06D7 | INT(G!(CINT(m*100+f+1500))+0.1) | C114=member, C110=field | 00A8A (I!,32), 01A20 (M!,31), 01C66 (I!,32), 01EC2/01EDD/01EFA (I!,33/56/40), 0A388 (M!,33) | SUPPORTED |
| FNIdx (06DB) | 06DB-06F6 | INT(m*100+f+1500.5) | C124=member, C120=field | 00A4A, 00ACF, 00B0B, 01F1C, 092C6 | SUPPORTED |
| credits FN (06F7) | 06FA-0715 | INT(CreditsHi!*30000+CreditsLo!+0.5) | none | no callers | SUPPORTED (dead, unnamed - fine) |
| FNDist (179F) | 179F-17F4 | SQR((X(a)-X(b))^2+(Y(a)-Y(b))^2) | C702=a, C706=b | 04A3A (J!,5), 04ABE (6,J!), 04B1D (7,J!), 04B50 -(8,J!), 071CD, 081B3 | SUPPORTED |
| FNRanged (17F8) | 17F8-1837 | -(FNDist(g,5)*10 - C70E*2 < 7) (*2 = FSCALE #01) | C70A | 0581A, 06B1D (only 2 sites exist) | SUPPORTED |
| FNInRange (183B) | 183B-1871 | -(FNDist(g,5)*10 - WepReach! < 7) | C712 | 0579F, 05D1E, 05FE1, 06B05 | SUPPORTED |
| FNMap (1875) | 1875-18D1 | Map%(INT(X*0.5-12)+INT(Y*0.5-1.5)*9) | C716 | 06475 (5), 06AB7, 0775E, 0193B (in FNPassable) | SUPPORTED |
| FNOffMap (18D5) | 18D5-192E | -(X>39 OR X<26 OR Y<5 OR Y>18) | C722 | 03D9C, 03F96 (5), 04BB8, 04E01, 04F00 | SUPPORTED (test order differs, OR-equivalent) |
| FNPassable (1932) | 1932-1953 | -(FNMap(s) <> 3) | C72A | 04B65, 04FA2 (only 2 sites) | formula SUPPORTED; comment WEAK |

Mismatch: names.json `SUB1932` and the bas.md SUB table (line 3204) say "-1 when slot s stands on a passable cell", but the function returns +1: `01944 mov bx,0` / `01947 je` (FNMap=3 -> 0) / `01949 dec bx` / `0194A and bx,bx` / `0194C jge` / `0194E neg bx` -> +1, then `01950` CSNG. Callers test `<> 0`, so only the comment's sign is wrong. FNRanged/FNInRange/FNOffMap use the same neg pattern and also return 1, matching the `= 1` tests at 04BCC/057D4/0584F.

Rendering: all 213 FN call sites are rendered as FN calls (FNCrew 100 incl. 10 wrapped `call 0x106a9`, FNIdx 70 incl. 5 `0x106db`, FNDist 9, FNRanged 2, FNInRange 5, FNMap 4, FNOffMap 5, FNPassable 2); no raw GOSUB to an FN body. HitPct! 06B40 = FNInRange*25 + FNRanged*25 + HitPct! + TerrainMod! - 50 (CE34 = -50) checked.

FAC-returning near-call targets: a scan of every `call` for a FAC read right after it (FSTORE, FTEST, FCMP, BOOL, CINT FAC, FAC arithmetic) finds only the 8 FN targets 06A9, 06DB, 179F, 17F8, 183B, 1875, 18D5, 1932. All are named and labelled (only the FNPassable comment is off). The ~50 `RETURN 'with FAC = ...` annotations on ordinary GOSUBs (e.g. 01783, 04F0D, 06008, 081EA) are never consumed by a caller; they only show what is left in FAC (could be noted in Conventions).

Task B counts: 9 bodies checked, 9 formulas OK, 9 arg-slot sets OK, 30 sites checked by hand, 1 comment mismatch (FNPassable sign), 0 unnamed FAC-returning targets.

#### Task C - screens

##### C1 On-screen text
- ~69 literal matches (61 byte-equal quoted strings incl. one-letter `y` 0xC15A, `A` 0xCFA6, plus 8 DATA: 7 TerrainName$ (line 297) and `Reload` (6903)); ~45 concatenations proven against PRINT lists (e.g. 01300/0134B `Group `+CHR$+`:`..`(s)`, 04255 SPC(9)+`killed. `, 05395 ammo/reload column, 07412 ` (`..`) switches weapons`, 03C36 `LOCATE , 2` + `as payment for a truce`, 05708 stamina, 0xD5AC ` is healed.` + 9 spaces). 0 bad texts.
- WEAK (layout): the door text is two PRINTs, 0xC040 `use the door at the` (004AB `PRINT s$;`) + 0xC058 `bottom of the map.` (004B7 +NL), with no space byte between them; `To escape the combat ` (21) + 19 = 40, so it wraps to row 17. The 0xC06E text (69 chars) and the 77-char legend 0xBFBE also wrap. SCREENS.md shows them as single rows.

##### C2 Coordinates / PUT verbs
- 70/70 RT3E_58 PUTs (array in BX, verb in DL, far flag in DH, immediate coords) match the pseudocode; 86/86 RT3E_44 LOCATEs (row = first ARGPUSH; 19 register-carried, spot-checked 03833 (21,13), 09BD0, 0390A).
- 20 hand checks, all OK: LOCATE 0459 (7,1), 0471 (16,1), 0435C (13,12), 0411A (22,12), 046E9 (20,10), 02549 (2,16), 01A93 (23,1), 01D7B (24,1), 035AC (22,2), 0609B (24,2), 037D1 (20,7), 037EB (21,2), 021DD (25,1); LINE 023AD (0,0)-(319,199) B, 02427 (7,24)-(96,24) (DX=-1), 0264D (112,16)-(191,79),0,BF, 02686 (5,85)-(194,146),2,BF, 02F1A (8,152)-(311,191),0,BF; PUT 047C1 (224,160) Cursor XOR; legend tiles 0416-0450 PSET at x 112/192/272, y 84.
- Unit sprites (unit*16+112, grp*16+16) (09FE1/09FF3), map tiles (184+16i, 16+16j) (0996E/09950), squad start (256,88): OK. The door box at 09AE3 has colour CINT(3 - UseEGA!*2) (SCREENS.md gives no colour).

##### C3 SCREEN mode and bank selection
- 0061-0072: FCMP [0x19B4] UseEGA! vs [0x804E]=1.0, je -> `mov bx,7` RT3E_5B = SCREEN 7. This is the only SCREEN call; the CGA SCREEN 1 is inherited from the module that CHAINed here.
- TR-n tiles: UseEGA!=1 -> Drive$+"TR"+STR$(-TerrType!)+".EGA" to &HBC6C (0333; offset in temp T0=0xBE88); else ".BAS" to &HBC6C (0380).
- LOGO.EGA: UseEGA!=1 only, Drive$+"LOGO.EGA" to VARPTR(BoxSave) (descriptor 0x8044) (0349). CGA `BLOAD "LOGO", &H40F4` only at 0509 (DebugLoad path, no Drive$); in normal play the CGA logo at 0x40F4 is inherited in COMMON.
- BIGSH portrait: FTEST UseEGA! (01957, i.e. non-zero) -> "BIGSH"+STR$(-GrpPortrait!(0))+".EGA" to &H8052 (019BD, NO Drive$: AX=0xC738 at 019AC); zero -> Drive$+...+".BAS" to &H942E (01990).
- PLBTSH: FCMP UseEGA!=1 (019C6) -> Drive$+"PLBTSH.EGA" to &HAC70 (019E0); else Drive$+"plbtsh.bas" to &HAC70 (019F8).
- Quirk: the portrait (01957) and logo PUT (025DA) test <>0, while SCREEN/TR/PLBTSH test =1 (rendered correctly).

##### C4 Sprite name -> BANK[index] (file offset = DS - base + 7)

| name | DS | bank (base) | file off | BANK[index] | tsv |
|---|---|---|---|---|---|
| UnitSprite0/1/2 | AC70/ACF4/AD78 | PLBTSH (AC70) | 7/139/271 | PLBTSH[0]/[1]/[2] | yes |
| Boom1..5 | ADFC/AF20/B044/B168/B28C | PLBTSH | 403/695/987/1279/1571 | PLBTSH[3]..[7] | yes |
| Cursor | B3B0 | PLBTSH | 1863 | PLBTSH[8] 26x24 | yes |
| Shot1/Shot2/Rocket | B534/B53C/B54C | PLBTSH | 2251/2259/2275 | PLBTSH[9]/[10]/[11] | yes |
| Burst1/2/3 | B560/B684/B7A8 | PLBTSH | 2295/2587/2879 | PLBTSH[12]/[13]/[14] | yes |
| UnitSprite3/4/5 | B8CC/B950/B9D4 | PLBTSH | 3171/3303/3435 | PLBTSH[15]/[16]/[17] | yes |
| SquadIcon | BA58 | after PLBTSH, built by GET | 3567 | - | n/a |
| TileBank/Tile2/Tile3/Tile4 | BC6C/BCF0/BD74/BDF8 | TR-n (BC6C) | 7/139/271/403 | TR[0]/[1]/[2]/[3] | yes |
| PortraitCGA | 942E | BIGSH-n.BAS (942E) | 7 | BIGSH.BAS[0] 88x56 | yes |
| PortFrame1..4 | 9920/9DF4/A2C8/A79C | BIGSH-n.BAS | 1273/2509/3745/4981 | trailing frames | not indexed |
| PortraitEGA | 8052 | BIGSH-n.EGA (8052) | 7 | BIGSH.EGA[0] | yes |
| PortEgaFrame1..3 | 8AF2/8ED4/91D0 | BIGSH-n.EGA | 2727/3721/4485 | trailing frames | not indexed |
| Logo | 40F4 | LOGO.BAS (40F4, COMMON) | 7 | LOGO[0] 81x19 | yes |
| BoxSave (logo PUT 02609) | far 8044 | LOGO.EGA | elem 0 | LOGO.EGA[0] 80x10 | yes |
| MapSave/HdrSave/BoxSave (other uses) | 803A/8030/8044 | GET buffers | - | - | n/a |

The CGA frame count fits the file sizes (1266 + 1236 per frame): BIGSH-3/4/5/8 have 2 frames, 1/2/7/9 have 3, 6 has 4. FrameDX1% 0x89F6 = file offset 2475, right after the 2468-byte EGA portrait, consistent with the frame script at word 1240. SUB_9F76 ON-GOTO: 1 UnitSprite1 rockets, 2 UnitSprite2 flames, 3..6 UnitSprite0/3/4/5 = attack verbs 1..4, 7..12 the same with PRESET.

##### C5 Unknowns honesty and other findings
- CONTRADICTED (header Data formats): "PLBTSH ... 18 slots of 132 bytes". The indices are right but the sizes are not: Boom1..5 are 0x124 (292) apart, Cursor->Shot1 0x184 (388), then 8/16/20. Only the 16x16 slots are 132 bytes.
- WEAK (header line 19): "logo LOGO (CGA) chosen accordingly (0301-0380, ...)". No CGA logo BLOAD on the normal path; the only `BLOAD "LOGO"` is at 0509 (DebugLoad).
- WEAK (header Unknowns): "`N_D130!` ... never given a value". It is stored at 06480 (`mov di,0xd130; mov si,0xc99c; FMOV`, C99C=0.0) and negated at 064CE; the "always 0" conclusion holds. `N_D2C4!` is honest (one ref, a read at 07747).
- names.json `9404_why` (Drive$ "prefixed to ... LOGO/BIGSH"): false for LOGO 0509 and BIGSH .EGA 019BD.
- names.json `MapSave`: "(103,6)-(194,82) the title area" is the enemy-grid band; the title box is at x 197-314.
- SPRITES.md calls PLBTSH 0-2 "soldier figures" and 3-7 "blob/beast"; the PUT sites show units (PSET/PRESET) and 5 explosion frames XORed in sequence.
- SCREENS.md has no Unknowns section (minor). Header "runtime calls not rendered" table is empty, which is true (RANDOMIZE, PLAY, BEEP, omitted-arg LOCATE, SIN, SQR, CSRLIN all rendered).

Task C counts: texts ~114 OK / 0 bad / 2 wrap imprecisions; PUT 70/70, LOCATE 86/86, 20/20 hand checks; 33 sprite names resolved (26 to indexed bank entries, all tsv-matched); 1 CONTRADICTED + 4 WEAK prose items + 2 names.json notes.

## Verdict table (237 sampled statements)

Columns: statement offset (as printed in PLBATTLE.bas.md) / first bytes / derivation from the listing / pseudocode text / verdict / note.

| offset | bytes | derivation | pseudocode | verdict | note |
|---|---|---|---|---|---|
| 0006A | e9 / bf 4e 80 | 0061 di=#1 si=UseEGA! FCMP; je 006F (SCREEN 7 at 0072) else jmp 0075 | IF UseEGA! <> 1 THEN GOTO L_0075 | AGREE | |
| 00151 | e9 25 00 / bb 50 18 | 0145 CSNG 0x1850 -> FAC; bx="CHARINFO"; dx=1A; RT3E_1A | BLOAD "CHARINFO", &H1850 | AGREE | range starts with jmp 016A of the DebugLoad! test |
| 001AF | bb ff ff | bx=-1; RT3E_32 | CLS | AGREE | |
| 001D8 | e9 0f 00 / cd 3f bc | 01D8 BC; "The squad is surprised." 6E; 79 | PRINT "The squad is surprised." | AGREE | guarded by Surprise! = 2 (01CA-01D3) |
| 001F0 | bf 4e 80 | 01E7 Surprise! ? #1; je 01F5 else jmp 0204 | IF Surprise! <> 1 THEN GOTO L_0204 | AGREE | |
| 00204 | cd 3f bc | 0204 BC; bx=0x9408 ""; 6E; 79 | PRINT "" | AGREE | |
| 0022E | e9 08 00 / 8b fb | di=bx (=EncAdd! from 0210/0219); si=Enclosure! (0x3BA0); FMOV | EncAdd! = Enclosure! | AGREE | |
| 0026B | cd 3f bc | BC; "Gravity:" 6A; Gravity! 67; "      Fatigue Factor:" 6A; Fatigue!*#100 (8F), INT, FAC/[#100] (89), 6B NL; 79 at 0298 | PRINT "Gravity:"; Gravity!; "      Fatigue Factor:"; INT(Fatigue! * 100) / 100 | AGREE | one PRINT, separators ; ; ; NL |
| 0029B | bb 5a bb ... cd 3f bc | tail of previous PRINT, then 029B BC; "Atmosphere: " 6A; 79 | PRINT "Atmosphere: "; | AGREE | |
| 00333 | e9 4e 00 / bb 6c bc | CSNG &HBC6C -> T0 (71 #80); Drive$+"TR"; NEG TerrType! -> STR$; +".EGA"; dx=T0; BLOAD | BLOAD Drive$ + "TR" + STR$(-TerrType!) + ".EGA", &HBC6C | AGREE | UseEGA! = 1 branch (02F3-02FC) |
| 00349 | bb 44 80 | VARPTR(BoxSave, dx=0) -> FAC; ax=cx (Drive$ 0x9404 kept from 030A); +"LOGO.EGA"; dx=1A; BLOAD | BLOAD Drive$ + "LOGO.EGA", VARPTR(BoxSave) | AGREE | VARPTR of element 0 (dx=0) |
| 00380 | e9 34 00 / bb 6c bc | same as 0333 with ".BAS" | BLOAD Drive$ + "TR" + STR$(-TerrType!) + ".BAS", &HBC6C | AGREE | |
| 003EA | cd 3f 7d ... | 03D4 store LegendY!, cmp #100 jbe 03B0 (inner NEXT); 03E1 LegendX! + #16 -> store LegendX!, cmp LegendEnd! jbe 03A6 | NEXT LegendX! STEP 16 | AGREE | FOR head 03A2: LegendX! = I! TO LegendEnd! (= I!+32) |
| 00459 | 8b... / bb 07 00 | ARGPUSH 7; bx=1; RT3E_44 | LOCATE 7, 1 | AGREE | row 7 first |
| 004DD | bb 6e c0 ... | (tail of PRINT at 04CB) 04D7 bx="Dead" dx=Status$(0) 0xC0B8; RT3F_61 | Status$(0) = "Dead" | AGREE | |
| 00509 | e9 56 01 / bb f4 40 | CSNG &H40F4; "LOGO"; dx=1A; BLOAD | BLOAD "LOGO", &H40F4 | AGREE | DebugLoad!-only path |
| 00519 | 33 db | OPEN mode 0 (INPUT); #1; "NAME"; RT3E_1E | OPEN "NAME" FOR INPUT AS #1 | AGREE | |
| 00529 | 90 / bb 01 00 | INPUT #1 begin; B7 n=1 type 04; store K$ (0xC0EC) | INPUT #1, K$ | AGREE | inside FOR I! = 1 TO 80 (051C/0548) |
| 00556 | cd 3f 7d ... | tail NEXT I! (cmp #80); 0550 FLOAD #0; jmp 0582; limit at 058A #53 | FOR I! = 0 TO 53 | AGREE | |
| 0055D | 90 / bb 01 00 | INPUT #1; B7 type 04; store CINT(I!)*4 + 0x43F4 GunName$() | INPUT #1, GunName$(CINT(I!)) | AGREE | |
| 0059F | 90 / bb 01 00 | INPUT #1; type 04; CINT(I!)*4 + 0x44CC HandWeapon$() | INPUT #1, HandWeapon$(CINT(I!)) | AGREE | loop 0..5 (#5 at 05CC) |
| 005E7 | 33 db | mode 0; #1; "CHARNAME" | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | |
| 005ED | bb 01 00 | INPUT #1; B7 n=3 types 04 04 04; stores ShipName$ 0x488C, CrewName1$ 0xC104, CrewName2$ 0xC108 | INPUT #1, ShipName$, CrewName1$, CrewName2$ | AGREE | |
| 00615 | bb 01 00 | INPUT #1; type 04; CINT(I!)*4 + 0x4288 CrewName$() | INPUT #1, CrewName$(CINT(I!)) | AGREE | loop 1..6 (#6 at 0642) |
| 00730 | cd 3f bc | (LOCATE 20,2 before) 0730 BC; "Change things? " 6A; 79 | PRINT "Change things? "; | AGREE | |
| 00875 | 8b f2 | si=dx (= I!, set 07F3); +#8; CINT; G!() elt; FMOV <- #5 | G!(CINT(I! + 8)) = 5 | AGREE | |
| 008C4 | 8b f8 | di=ax (= 0xC10C #6, from 0840); si=dx (I!); FADD; CINT; G! elt <- #12 | G!(CINT(I! + 6)) = 12 | AGREE | register-reused constant #6 resolved correctly |
| 00919 | 8b f0 | si=ax (= I!, 08CF/08D1 after xchg dx,si at 08C7); +#2; G! elt <- [cx] (cx=#1 0x804E from xchg 081B) | G!(CINT(I! + 2)) = 1 | AGREE | |
| 00987 | 8b f1 | si=cx (I!, 0924); +#11; G! elt <- #10 | G!(CINT(I! + 11)) = 10 | AGREE | |
| 00991 | 8b fa | di=dx (=0xC184 #12 after xchg at 08C7); si=cx (I!); FADD; store I! (0994); cmp #1088 ja exit | NEXT I! STEP 12 | AGREE | |
| 00A30 | cd 3f 7d ... | tail: NEXT I! STEP 3 (cx=#3) cmp #1397; 0A2A FLOAD #1; jmp 0C1D; limit #6 at 0C25, ja exit | FOR I! = 1 TO 6 | AGREE | |
| 00B74 | bf 20 c1 | FnIField!(C120)=#54; FnIMember!(C124)=I!; call 06DB (FNIdx body: INT(member*100+field+1500.5)); CINT; G! elt <- #33 | G!(CINT(FNIdx(I!, 54))) = 33 | AGREE | FN slots checked: 06DB uses C124*100 + C120 |
| 00BEA | bf 20 c1 | field #12, member I!; call 06DB; G! elt; RND*#10 + #15; INT; store | G!(CINT(FNIdx(I!, 12))) = INT(RND * 10 + 15) | AGREE | |
| 00CA4 | 8b f2 | si=dx (I!, 0C47); +#2; G! elt; RND*#6 + [cx] (cx=#3, 0C61); INT; store | G!(CINT(I! + 2)) = INT(RND * 6 + 3) | AGREE | |
| 00D43 | bf 20 c1 | field #16, member I!; call 06DB; G! elt <- #30 | G!(CINT(FNIdx(I!, 16))) = 30 | AGREE | |
| 00E4E | bf 38 c6 | di=EncRec! (C638); si=FirstEnemy! (0x3AE8 = G!(2214)); FMOV | EncRec! = FirstEnemy! | AGREE | |
| 00E71 | 33 db | mode 0; Drive$ + "ENCINFO"; xchg -> dx=file; #1 | OPEN Drive$ + "ENCINFO" FOR INPUT AS #1 | AGREE | |
| 00E83 | bf 54 c6 | EncEnd! <- EncRec! | EncEnd! = EncRec! | AGREE | |
| 00E93 | 90 / bb 01 00 | INPUT #1; B7 n=28 types 04 + 27x02 (single); dx = CINT(J!)*4 (one CINT at 0EB9); stores in order C1E8$, C658, C65C, C248(), C660, C2A8(), C664, C668, C66C, C5D4(), C308(), C318(), C328(), C338(), C348(), C670, C368(), C674, C358(), C678, C378(), C67C, C680, C684, C688, C68C, C614(), C624() | INPUT #1, GrpName$(CINT(J!)), C1Size!, ... GrpMeleeRange!(CINT(J!)), GrpAttackVerb!(CINT(J!)) | AGREE | all 28 targets and types match names.json |
| 01039 | bf a0 c6 | C2Init! * #1.3 -> InitHi! | InitHi! = C2Init! * 1.3 | AGREE | |
| 0112B | e9 dc fe / be 34 c6 | GrpSize!(CINT(J!)) elt; RND ^ #2 (25); #1 - FAC (9B); * C1Size!; + [dx=si=#1]; INT; store | GrpSize!(CINT(J!)) = INT((1 - (RND ^ 2)) * C1Size! + 1) | AGREE | |
| 01167 | be 34 c6 | LEN(GrpName$(CINT(J!))) -> CSNG; *#0.5; +#1; store Half! (C6BC) | Half! = (LEN(GrpName$(CINT(J!)))) * 0.5 + 1 | AGREE | |
| 012B3 | be 34 c6 | dx=si (=BoardCrew! 0x3B7C from 1275); GrpSize!(CINT(J!)) elt (xchg si,di); si=dx; FMOV | GrpSize!(CINT(J!)) = BoardCrew! | AGREE | |
| 012C0 | 8b df | di=C23Next1!; si=EncRec!; FMOV | C23Next1! = EncRec! | AGREE | |
| 013B6 | be 34 c6 | idx = (CINT(J!)*5 + CINT(I!))*4 + C1F8 UnitInit!(); RND*#0.6 + #0.7; * C2Init!; store | UnitInit!(CINT(J!) * 5 + CINT(I!)) = (RND * 0.6 + 0.7) * C2Init! | AGREE | |
| 013F2 | 81 c3 c8 c4 | bx (= idx*4, restored 13C7) + C4C8 UnitState!(); <- #1 | UnitState!(CINT(J!) * 5 + CINT(I!)) = 1 | AGREE | |
| 01404 | cd 3d 34 | RND * #100 ? C15RocketPct! (A1); ja 1409 else jmp 1431 | IF RND * 100 <= C15RocketPct! THEN GOTO L_1431 | AGREE | |
| 0142E | e9 7b 00 | jmp 14AC | GOTO L_14AC | AGREE | |
| 01562 | e9 0b 00 / 05 28 c4 | (C25Melee! < 1 -> dx=-1) OR (RND < 0.5 -> bx=-1); jne 155A; ax (= idx*4 from 1527) + C428 UnitWeapon!() <- #2 | UnitWeapon!(CINT(J!) * 5 + CINT(I!)) = 2 | AGREE | |
| 0160C | cd 3d 34 | RND ? #0.5 (A1); jb 1611 (assign) else jmp 1619 | IF RND >= 0.5 THEN GOTO L_1619 | AGREE | |
| 01616 | e9 08 00 / 8b fb | di=bx (=NextRec! C6FE); si=C24Next2!; FMOV | NextRec! = C24Next2! | AGREE | |
| 01644 | e9 06 00 / e8 22 00 | (NextRec! ? EncRec! je 1644 else jmp 164A) call 1669 | GOSUB SUB_1669 | AGREE | |
| 016F0 | 8b d9 | cx = CINT(J!)*4 (1677), ax = CINT(J!-1)*4 (168E); dst cx+C318, src ax+C318 GrpCol11!(); FMOV | GrpCol11!(CINT(J!)) = GrpCol11!(CINT(J! - 1)) | AGREE | |
| 0175F | 8b d9 | dst cx+C378, src ax+C378 GrpFlameDmg!() | GrpFlameDmg!(CINT(J!)) = GrpFlameDmg!(CINT(J! - 1)) | AGREE | |
| 01837 | bf 02 c7 | FNRanged body: DistA!=FnGrp1!, DistB!=#5; call 179F (FNDist over DistA/DistB); *#10 -> T2; WepReach!*2 (AB #01); T2 - FAC; ? #7: jae skip, else bx=-1; abs; CSNG; ret | RETURN 'with FAC = -(FNDist(FnGrp1!, 5) * 10 - (WepReach! * 2) < 7) | AGREE | FN arg slots C702/C706 match FN179F_args |
| 01990 | e9 37 00 / bb 2e 94 | (UseEGA! = 0) CSNG &H942E -> T3; Drive$+"BIGSH"; STR$(-GrpPortrait!(0)); +".BAS"; dx=T3; BLOAD | BLOAD Drive$ + "BIGSH" + STR$(-GrpPortrait!(0)) + ".BAS", &H942E | AGREE | |
| 019BD | bb 52 80 | CSNG &H8052 -> T3; STR$(-GrpPortrait!(0)); ax="BIGSH" (0xC738, no Drive$); +".EGA"; BLOAD | BLOAD "BIGSH" + STR$(-GrpPortrait!(0)) + ".EGA", &H8052 | AGREE | no Drive$ prefix in the bytes (game quirk), rendered faithfully |
| 019E0 | e9 18 00 / bb 70 ac | (UseEGA! = 1) CSNG &HAC70; Drive$ + "PLBTSH.EGA"; BLOAD | BLOAD Drive$ + "PLBTSH.EGA", &HAC70 | AGREE | |
| 019F8 | bb 70 ac | CSNG &HAC70; Drive$ + "plbtsh.bas"; BLOAD | BLOAD Drive$ + "plbtsh.bas", &HAC70 | AGREE | |
| 01ABF | bf 96 c7 | di=MoveDX!(1) 0xC796; si=#1; FMOV | MoveDX!(1) = 1 | AGREE | |
| 01BDB | be 34 c6 8b de 8b d3 cd 3f 75 | CINT(J!)*5 (imul cx=5) + CINT(I!), *4 + C8DE CommObjective!(); RT3F_0D READ sng ->[BX]; inside FOR J! 0..3 | READ CommObjective!(CINT(I!) + CINT(J!) * 5) | AGREE | |
| 01C33 | bf 3a c9 be b0 c6 cd 3f 7b | FMOV PortGroup! (C93A) <- C6B0 #-1 | PortGroup! = -1 | AGREE | |
| 01C9A | e9 80 00 | jmp 1D1D (THEN tail after WepSlot! = 0 at 1C97) | GOTO L_1D1D | AGREE | |
| 01D7E | cd 3f bc / bb 52 c9 cd 3f 6a / 3e 79 | PRINT begin; s$ C952 "Squad members with oxygen:" with 6A (;); end 1D87; after LOCATE 24,1 | PRINT "Squad members with oxygen:"; | AGREE | |
| 02071 | e9 48 00 / 8b fa be 46 bb cd 3f 7b | DI = DX; DX = &G!(CINT(J!)) via xchg dx,si at 203E (dx was &J!, si = G! element); FMOV <- BB46 #0 | G!(CINT(J!)) = 0 | AGREE | condition at 2067 (G!(J+2)=OwnerCode AND G!(J)=AmmoType, jne -> body) also matches |
| 02113 | cd 3f 7d 8b f7 bf a4 c1 (NEXT J tail) bf 20 c1 be 60 c1 | FnIField!=51, FnIMember!=M!, call 06DB (FNIdx = INT(m*100+f+1500.5)), CINT -> G! addr saved [bp-C]; FnField!=15, FnMember!=M!, call 06A9 (FNCrew); FSTORE | G!(CINT(FNIdx(M!, 51))) = FNCrew(M!, 15) | AGREE | FN bodies checked: 06A9 = FNCrew (C110 field / C114 member), 06DB = FNIdx (C120 field / C124 member); slots match |
| 022E7 | 8b c8 bb 03 00 ba 02 00 cd 3e 84 | (x=3,y=2) RT3E_84, DX=5 (BX still 3) RT3E_85 (3,5), color -1 default, DX=-1 line, style -1 | LINE (3, 2)-(3, 5) | AGREE | |
| 0231F | 8b c8 bb 01 00 ba 07 00 cd 3e 84 | (1,7) - (3,5), color/DX/CX = -1 | LINE (1, 7)-(3, 5) | AGREE | |
| 02530 | (PRINT CHR$ items 2514-2525) 8b f2 bf 4e 80 cd 3f 7f bf 90 ba | SI=DX=&I! (2503 dx=bx=si=I!), +#1 -> I!, cmp #4 jbe 24F4 | NEXT I! | AGREE | preceding PRINT CHR$(CINT(I!+64)) (6E newline) also verified |
| 025F0 | e9 17 00 / 8b c8 bb d7 00 ba 06 00 cd 3e 89 | UseEGA! FTEST je -> 25DF: coord (215,6); BX=40F4 Logo, DX=0001 -> DL=1 AND, DH=0 near | PUT (215, 6), Logo, AND | AGREE | |
| 02664 | e9 58 00 | jmp 26BF | GOTO L_26BF | AGREE | |
| 026B9 | 8b c8 bb 08 00 ba 57 00 cd 3e 89 | coord (8,87); BX=8030 HdrSave; DX=FF00 -> DL=0 OR, DH<>0 far descriptor | PUT (8, 87), HdrSave, OR 'dynamic array | AGREE | |
| 027FE | bb 03 00 ba 05 00 33 c9 8b c1 cd 3e 84 | (3,5)-(4,194); color CINT(BarColor! C9D4) via 3F_19; DX=1 BF | LINE (3, 5)-(4, 194), CINT(BarColor!), BF | AGREE | |
| 02872 | (call 9B06 tail) e8 1e 04 | call 2C93 | GOSUB SUB_2C93 | AGREE | |
| 028D9 | (NEXT Unit! tail 28C3-28CE) bf 4e 80 be dc c9 cd 3f 7f bf dc c9 | Grp! + #1 -> Grp!, cmp GrpMax5! jbe 288E | NEXT Grp! | AGREE | |
| 0292B | be 4e 80 cd 3f 6f e9 09 00 | FLOAD #1, jmp 2937 store OwnerCode2!; limit cmp DelayN1! (293F) jbe 292E; step +1 | FOR OwnerCode2! = 1 TO DelayN1! | AGREE | |
| 0297B | (NEXT tail cmp DelayN2!) e8 88 71 | call 9B06 | GOSUB SUB_9B06 | AGREE | |
| 029B0 | bf 30 c1 be 88 19 cd 3f 8f | CreditsHi!*30000 + CreditsLo! + Delta! -> FSTORE Delta! (DI=CA06) | Delta! = CreditsHi! * 30000 + CreditsLo! + Delta! | AGREE | |
| 02AAA | (jmp 2AB7 tail) cd 3f bc bb 12 ca cd 3f 6a | PRINT "Hnd" with 6A (;), end 2AB3 | PRINT "Hnd"; | AGREE | |
| 02ADB | 8b f7 bf 78 c1 cd 3f 9f 77 03 | Ammo! ? #9; ja 2AE0 (Ammo!=9 clamp), else jmp 2AE5 | IF Ammo! <= 9 THEN GOTO L_2AE5 | AGREE | |
| 02B03 | bf 26 ca be dc c1 cd 3f 7b | Reloads! <- #0 | Reloads! = 0 | AGREE | |
| 02BE1 | (call 9B06 tail) eb e5 | jmp 2BC8 | GOTO L_2BC8 | AGREE | |
| 02C63 | cd 3f bc bb 3a ca cd 3f 6a | PRINT "Press ENTER Key" 6A (;), end 2C6C | PRINT "Press ENTER Key"; | AGREE | |
| 02D01 | bf 84 c1 be 90 ba cd 3f 7f | I! + #12 -> Half! (BX=&I! kept for later) | Half! = I! + 12 | AGREE | |
| 02D16 | cd 3f bc / 8b f2 cd 3f 75 ... 81 c3 88 42 cd 3f 6e | SI=DX=&I! (2D06); CrewName$(CINT(I!)) 6E newline | PRINT CrewName$(CINT(I!)) | AGREE | LOCATE CINT(Half!),4 before it correct |
| 02D6E | cd 3f bc bf 10 c1 be c0 c1 | FnField!=31, FnMember!=I!, call 06A9 FNCrew, CINT, Status$(C0B8) 6E newline | PRINT Status$(CINT(FNCrew(I!, 31))) | AGREE | |
| 02E4B | e9 71 ff | jmp 2DBF (IF-false target of 2E45) | GOTO L_2DBF | AGREE | |
| 02F3C | bb 08 00 ba a0 00 33 c9 8b c1 cd 3e 84 | (8,160)-(311,191), color 0 (xor bx), DX=1 BF | LINE (8, 160)-(311, 191), 0, BF | AGREE | |
| 02F80 | bb c8 00 ba 20 00 33 c9 | (200,32)-(311,143), color 0, BF | LINE (200, 32)-(311, 143), 0, BF | AGREE | dead code (header says so) |
| 02F83 | c3 | ret | RETURN | AGREE | |
| 02FCF | bb 08 94 ba ec c0 cd 3f 61 | SASSIGN K$ (C0EC) <- "" (9408) | K$ = "" | AGREE | |
| 03018 | 8b c2 bb 08 94 cd 3f 62 74 ed | SCMP Ch$ (AX=DX=CA82) ? ""; je 3007 | IF Ch$ = "" THEN GOTO L_3007 | AGREE | |
| 03100 | bb ec c0 cd 3d 13 cd 3f 78 | VAL(K$) -> DAC, CINT DAC, mov [CA8E],ax | InputVal% = CINT(VAL(K$)) | AGREE | |
| 031A5 | (call 2C3C tail) c3 | ret | RETURN | AGREE | |
| 03473 | bf 20 c1 be f0 c0 cd 3f 7b | FnIField!=53, FnIMember!=M!, call 06DB FNIdx -> G! addr; DbgEsper! ? #4: dx=0, jbe skip, dec -> -1; neg -> 1/0; CSNG, store | G!(CINT(FNIdx(M!, 53))) = -(DbgEsper! > 4) | AGREE | |
| 03542 | bf e0 ca be dc c1 cd 3f 7b | YesNo! <- #0 | YesNo! = 0 | AGREE | |
| 035AC | bb 16 00 cd 3e 42 bb 02 00 cd 3e 44 | ARGPUSH 22, last 2 | LOCATE 22, 2 | AGREE | |
| 03772 | (PRINT items 375B-376F) e9 23 00 | jmp 3798 | GOTO L_3798 | AGREE | preceding PRINT CrewName$(CINT(Flag!)); " translates" (6A then 6E) verified |
| 037A4 | e8 95 f4 | second call 2C3C | GOSUB SUB_2C3C | AGREE | |
| 037D4 | cd 3f bc bb 66 cb cd 3f 6e | "Communications Phase" 6E newline; after LOCATE 20,7 | PRINT "Communications Phase" | AGREE | |
| 03807 | cd 3f bc 8b c3 bb 8a cb cd 3f 6e | "B-Ask" newline; LOCATE 22, CX=2 (xchg cx,bx) | PRINT "B-Ask" | AGREE | |
| 038F3 | 87 da cd 3e 42 8b da cd 3e 44 | xchg -> BX=21 push, BX=DX=2 exec: second LOCATE 21,2 right after the one at 38E9 | LOCATE 21, 2 | AGREE | duplicate LOCATE is real in the bytes |
| 03924 | cd 3f bc bb 16 cc cd 3f 6e | "C-Surrender" newline | PRINT "C-Surrender" | AGREE | |
| 0394D | (PRINT items 393E-3944) bf 5e ca be 4e 80 cd 3f 7b | CmdMin! <- #1 (label 3947) | CmdMin! = 1 | AGREE | |
| 0396A | bf f8 cb be 52 ca cd 3f 7b | Objective! <- Cmd! (after jb 3947 on Cmd!<0) | Objective! = Cmd! | AGREE | |
| 039C8 | e9 0d 00 / 87 fb cd 3f 87 8b fb cd 3f 7d | BX=&EnemyStr! (39AF), SI=&Bucket!; xchg -> DI=EnemyStr!, FDIV Bucket!/EnemyStr!, store to BX=&Bucket! (ja 39C1 on Bucket!>0) | Bucket! = Bucket! / EnemyStr! | AGREE | |
| 039CB | e9 0e 00 | jmp 39DC | GOTO L_39DC | AGREE | |
| 03A58 | (store tail) bf b0 c6 be 50 cc cd 3f 9f | dx = 0 - sum of (Bucket! > c) for c = -1, -0.5, -0.25, -0.05, 0.05, 0.25, 0.5, 1 (each jbe skip / dec bx / sub dx,bx); CSNG -> Bucket! | Bucket! = 0 - (Bucket! > -1) - ... - (Bucket! > 1) | AGREE | |
| 03B29 | (LOCATE tail) cd 3d 34 bf 64 cc cd 3f 91 | RND*#150 - Offer! (3F_99 FAC-[DI]) -> Tmp! | Tmp! = RND * 150 - Offer! | AGREE | |
| 03BA4 | cd 3f bc bb c8 cc cd 3f 6e | "They laugh in your face" newline | PRINT "They laugh in your face" | AGREE | |
| 03BB9 | (jmp 40D1 tail) be f8 cb cd 3f 75 cd 3f 5e 03 | CINT(Objective!); ON n=3 words 3BB3/3C6A/3CB6 +10 -> 3BC3, 3C7A, 3CC6 | ON CINT(Objective!) GOTO L_3BC3, L_3C7A, L_3CC6 | AGREE | |
| 03BE9 | (call 407B tail) e8 50 f0 | call 2C3C | GOSUB SUB_2C3C | AGREE | |
| 03C74 | (FMOV tail) e8 04 04 | call 407B (NewState!=2 before) | GOSUB SUB_407B | AGREE | |
| 03C97 | (FSTORE tail) 8b f7 bf 02 cb cd 3f 7b | SI=DI=&Delta! (just stored INT(EnemyValue!*0.5)); FMOV CreditsGained! <- Delta! | CreditsGained! = Delta! | AGREE | |
| 03CE4 | (call 407B tail) e8 55 ef | call 2C3C | GOSUB SUB_2C3C | AGREE | |
| 03CF3 | (FMOV tail) e8 a5 ec | call 299B (Delta! = EnemyValue! before) | GOSUB SUB_299B | AGREE | |
| 03D64 | (NEXT I! tail: store, cmp GrpMax! jbe 3D24) c3 | ret | RETURN | AGREE | |
| 03DA4 | (FMOV tail) bf 22 c7 be 90 ba cd 3f 7b e8 36 db | FnSlot2! <- I!, call 18D5 (FNOffMap: GrpX>39 OR GrpX<26 OR GrpY<5 OR GrpY>18, negated -> 1/0), RT3F_1F bool; jne 3DA9 else jmp 3DDB | IF (FNOffMap(I!) = 0) THEN GOTO L_3DDB | AGREE | FN body 18D5 reads FnSlot2! (C722): slot matches |
| 03EE8 | (FMOV tail) 81 c2 d4 c5 8b fa be f4 c0 | DX = BX = CINT(I!)*4 (3E99); +C5D4 GrpTactic!(); <- #5 | GrpTactic!(CINT(I!)) = 5 | AGREE | condition at 3ECC ((GrpSize>4 AND Flag=2) OR (GrpSize>2 AND Flag=1)) verified |
| 03F7F | (NEXT I! tail: cmp GrpMax2! ja 3F79) be 06 cb cd 3f a7 74 03 | FTEST ActiveGroups!; je 3F84 (Surrendered!=1), else jmp 3F8D | IF ActiveGroups! <> 0 THEN GOTO L_3F8D | AGREE | |
| 03F9E | bf 22 c7 | 3F8D FnSlot2!(C722 = arg of FN18D5 FNOffMap)=5; call 18D5; BOOL; jne 3FA3 else jmp 3FB8 -> IF FNOffMap(5)=0 GOTO 3FB8 | IF (FNOffMap(5) = 0) THEN GOTO L_3FB8 | AGREE | |
| 0402B | 8b df | 4013 FnField!=32, FnMember!=I!, call 06A9 (FNCrew: INT(G!(m*100+f+1500)+.1)), FSTORE WepSlot! | WepSlot! = FNCrew(I!, 32) | AGREE | mov bx,di = tail |
| 0410B | e9 46 04 | jmp 4554 | GOTO L_4554 | AGREE | |
| 04140 | bb 01 00 | ARGPUSH 1; LOCATE exec BX=0E -> LOCATE 1,14 | LOCATE 1, 14 | AGREE | |
| 042B3 | be 7c c9 | BOOL [Flag!]; jne 42B8 (body) else jmp 42C9 | IF (Flag! = 0) THEN GOTO L_42C9 | AGREE | DX kept = Flag! for next PRINT |
| 0433B | e9 0f 00 | 432A FromSpace!=1 je 4332 (tail jmp 4341); SCAT Drive$(AX)+"SPACE.STR"(BX); RT3E_0E CHAIN | CHAIN Drive$ + "SPACE.STR" | AGREE | |
| 0434A | bb 02 ce | 4341 SCAT Drive$+"INSIDE.EXE"; CHAIN | CHAIN Drive$ + "INSIDE.EXE" | AGREE | |
| 04403 | c3 | 43F5-4400 Kills! = Kills! + -1 (FAC=Kills!); ret | RETURN 'with FAC = Kills! | AGREE | |
| 046AC | e9 63 00 | tail jmp 46AF; FNIdx(K!,58) (06DB args C124 member/C120 field) -> CINT -> G! addr saved [bp-10]; again G!(FNIdx(K!,58)) in SI; Fatigue!*22; FSUB [SI]-FAC; store | G!(CINT(FNIdx(K!, 58))) = G!(...) - (Fatigue! * 22) | AGREE | |
| 047DC | bf da ce | DX! <- #0 (BB46) | DX! = 0 | AGREE | |
| 0483E | bf 4e 80 | Moved! ? 1, je 4843 else jmp 48C6 | IF Moved! <> 1 THEN GOTO L_48C6 | AGREE | |
| 049A6 | 8b d3 | BX = CINT(J!)*4 (4983); +C53C GrpY!(); FMOV GrpY0! | GrpY0! = GrpY!(CINT(J!)) | AGREE | |
| 049CD | be 46 bb | FLOAD 0; jmp 4D16 (store Move!, cmp 4, ja exit, jmp 49D0) | FOR Move! = 0 TO 4 | AGREE | step 1 at 4D0D |
| 049D0 | e8 33 51 | call 9B06 | GOSUB SUB_9B06 | AGREE | |
| 04AC7 | e9 92 00 | jmp 4B5C | GOTO L_4B5C | AGREE | |
| 04C7A | bf 12 cf | Dist2! ? 0.9; jb 4C7F (body) else jmp 4C9C | IF Dist2! >= 0.9 THEN GOTO L_4C9C | AGREE | |
| 04CA5 | bf 4e 80 | OtherGrp!+1 -> store, cmp GrpMax7! | NEXT OtherGrp! | AGREE | |
| 04CE0 | e9 1d 00 | tail jmp 4CE3; MoveScore!(CINT(Move!)) += 1e20 (CEEE) | MoveScore!(CINT(Move!)) = ... + 1e+20 | AGREE | |
| 04D96 | bf 4e 80 | J!+1 -> J!, cmp GrpMax6! | NEXT J! | AGREE | |
| 04DB7 | e8 ae ef | call 3D68 | GOSUB SUB_3D68 | AGREE | |
| 04E2C | cd 3d 34 | RND*EnemyValue!; INT; FSTORE Delta! (CA06) | Delta! = INT(RND * EnemyValue!) | AGREE | |
| 04F59 | bf da ce | DX! <- #-1 (C6B0) | DX! = -1 | AGREE | |
| 04FA8 | bf 2a c7 | FnSlot3!(C72A = FN1932 FNPassable arg)=5; call 1932; FTEST FAC; je 4FAD (undo) else jmp 4FCB | IF FNPassable(5) <> 0 THEN GOTO L_4FCB | AGREE | |
| 04FB3 | e9 1e 00 | tail; SquadX! <- OldX! | SquadX! = OldX! | AGREE | |
| 05013 | be 90 ba | G!(CINT(I!)) <- #0 (CF3E) | G!(CINT(I!)) = 0 | AGREE | DX = I! for NEXT |
| 050BD | e8 3c de | call 2EFC | GOSUB SUB_2EFC | AGREE | |
| 05209 | e9 0a 00 | tail jmp 520E; di=si=WeaponRec! (from 51EC/51F2); <- #788 | WeaponRec! = 788 | AGREE | |
| 05339 | 8b f7 | FTEST Ammo2!; jb 533E (set 0) else jmp 5347 | IF Ammo2! >= 0 THEN GOTO L_5347 | AGREE | |
| 05357 | e9 05 00 | Ammo2! ? 9 ja 5355; xchg -> DI=Ammo2!, SI=#9; FMOV | Ammo2! = 9 | AGREE | |
| 05395 | cd 3f bc | BC; 6A "A"; CHR$(CINT(Ammo2!+48)) 6A; " R" 6A; CHR$(CINT(Reloads2!+48)) (DI still #48) 6A; " " 6A; 79 | PRINT "A"; CHR$(...Ammo2!+48); " R"; CHR$(...Reloads2!+48); " "; | AGREE | single PRINT |
| 0580E | e9 6a 00 | jmp 587B | GOTO L_587B | AGREE | |
| 05B8B | bf 10 c1 | FNCrew(K!,37)>3 (jbe->0) bx; FNCrew(K!,37)<7 AND; FNCrew(K!,38)=TgtGrp! AND; jne 5B90 else jmp 5BC7 | IF NOT ((FNCrew(K!,38)=TgtGrp!) AND ((FNCrew(K!,37)<7) AND (FNCrew(K!,37)>3))) THEN GOTO L_5BC7 | AGREE | |
| 05BA8 | e9 37 00 | tail; FNCrew(K!,37) -> MemberCmd! | MemberCmd! = FNCrew(K!, 37) | AGREE | |
| 05BEA | e9 0c 00 | tail (FNCrew<0 jb); MemberCmd! <- #7 | MemberCmd! = 7 | AGREE | |
| 05CB7 | be 46 c9 | WepSlot!>0 (dx); G!(CINT(WeaponRec!+3))<1 AND -> cx; MemberCmd!=1 (dx); MemberCmd!>3 (DI=#3 via bx) ax; <8 bx; (bx AND ax) OR dx AND cx; jne body else 5CC4 | IF NOT ((((MemberCmd!<8) AND (MemberCmd!>3)) OR (MemberCmd!=1)) AND ((G!(..+3)<1) AND (WepSlot!>0))) THEN GOTO L_5CC4 | AGREE | |
| 05CE5 | e9 09 00 | tail (GrpState!()<3 jb); MemberCmd! <- #0 | MemberCmd! = 0 | AGREE | |
| 05E97 | cd 3f bc | BC; CHR$(CINT(TgtGrp!+65)) 6A; CHR$(CINT(Unit!+49)) 6A; 79 | PRINT CHR$(CINT(TgtGrp!+65)); CHR$(CINT(Unit!+49)); | AGREE | |
| 05F4E | be 52 ca | CINT Cmd!; RT3F_5D n=23 ON GOSUB 5F83x4,6071,61A6,5F04x5,61CB,61E0,5F04x4,6229,5F04x4,624E | ON CINT(Cmd!) GOSUB ... (same 23) | AGREE | targets match listing table |
| 05F80 | e9 76 fc | jmp 5BF9 | GOTO L_5BF9 | AGREE | |
| 05FC8 | e9 01 00 | tail jmp 5FC9; ret (FAC = Cmd!-1 stored PickGrp! at 5F91, unchanged by FCMP) | RETURN 'with FAC = PickGrp! | AGREE | |
| 060AA | bb fe d0 | tail of PRINT "M-indshock..."; call 2DBF | GOSUB SUB_2DBF | AGREE | |
| 061CA | c3 | ret | RETURN | AGREE | |
| 061F6 | be 46 d0 | GrpState!(CINT(TgtGrp!)) ? 2; ja 61FB else jmp 6228 | IF GrpState!(CINT(TgtGrp!)) <= 2 THEN GOTO L_6228 | AGREE | |
| 064C4 | e9 1b 00 | tail; SI=MapType! (bx from 647E); *35; 105-FAC; DI=CX=TerrainMod! (648B) | TerrainMod! = 105 - (MapType! * 35) | AGREE | |
| 0659D | e9 08 00 | tail (InitLevel!<InitMid! jb); InitLevel! <- #0 | InitLevel! = 0 | AGREE | |
| 0665E | e9 fe 08 | tail jmp 6F44; FNCrew(M!,32) -> WepType! | WepType! = FNCrew(M!, 32) | AGREE | |
| 0671D | 8b f3 | SI=BX=MemberCmd! (66FD/6710); ? #2 je 6722 else jmp 6864 | IF MemberCmd! <> 2 THEN GOTO L_6864 | AGREE | |
| 067AD | e9 51 00 | tail; DI=DX = G!(CINT(J!)) addr (xchg at 677A); <- #0 | G!(CINT(J!)) = 0 | AGREE | |
| 06AF9 | e9 19 00 | tail; SI=MapType! (6AC0) *35; HitPct!-FAC; +105; store HitPct! | HitPct! = HitPct! - (MapType! * 35) + 105 | AGREE | |
| 06D86 | e9 23 00 | tail (Melee! <> 0 skip); G!(CINT(WeaponRec!+3)) + -1 store | G!(CINT(WeaponRec! + 3)) = G!(...) - 1 | AGREE | |
| 06E03 | cd 3f bc | BC; "making" 6A; Hits! 67; "hit(s)" 6E; 79 | PRINT "making"; Hits!; "hit(s)" | AGREE | |
| 06E40 | e9 1a 00 | tail (DamageSum!>0 ja); BC; "for" 6A; SI=DamageSum! 67; "points of damage." 6E; 79 | PRINT "for"; DamageSum!; "points of damage." | AGREE | |
| 06EFC | bb 10 d2 | tail of PRINT " killed!"; jmp 6F16 | GOTO L_6F16 | AGREE | |
| 06F28 | e8 e8 b9 | call 2913 (FOR I! body) | GOSUB SUB_2913 | AGREE | |
| 06F7F | cd 3f 7d | tail NEXT M! (>6 -> 65AA); Attacked!=0 (bx); Surprise!=1 (dx); OR; je 6F84 else jmp 70A5 | IF (Surprise! = 1) OR (Attacked! = 0) THEN GOTO L_70A5 | AGREE | |
| 06F8A | e9 21 01 | tail; Target! <- #5 | Target! = 5 | AGREE | |
| 070E9 | bf 4e 80 | SquadHit! ? 1 je 70EE else jmp 70F6 | IF SquadHit! <> 1 THEN GOTO L_70F6 | AGREE | |
| 071D3 | 8b f1 | SI=CX=AtkGrp! ptr (718A/7199) -> DistA!; DistB!=5; call 179F FNDist; store Dist2! | Dist2! = FNDist(AtkGrp!, 5) | AGREE | |
| 074B5 | bb 14 00 | ARGPUSH 20; LOCATE exec 2 | LOCATE 20, 2 | AGREE | |
| 075C8 | bf 4e 80 | NewWep! ? 1 je 75CD else jmp 763A | IF NewWep! <> 1 THEN GOTO L_763A | AGREE | |
| 076AA | be 4e 80 | FLOAD #1, jmp 76F9 store Try!, FCMP Try!?#7 (C194) jbe 76AE | FOR Try! = 1 TO 7 | AGREE | |
| 07750 | cd 3f 7d | Try! store/cmp tail; Dist2!/WepReach! INT *25, 50-FAC; FnField=11,FnMember=M!, T3, call 6A9 (FNCrew), T3-FAC, -N_D130!, +N_D2C4!, store HitPct! | HitPct! = 50 - INT(Dist2!/WepReach!)*25 - FNCrew(M!,11) - N_D130! + N_D2C4! | AGREE | FN slots C114=member, C110=field checked against body 06A9 |
| 0787B | bf 4e 80 | NewWep!+1 CINT; RT3F_5D n=3 words 90F7/8CC2/8BE2 +10h = 9107/8CD2/8BF2 | ON CINT(NewWep!+1) GOSUB L_9107, L_8CD2, L_8BF2 | AGREE | |
| 078D1 | cd 3d 34 | RND FCMP 0.5 (BB52); jb 78D6 (fallthrough) else jmp 78E1 | IF RND >= 0.5 THEN GOTO L_78E1 | AGREE | bx=di keeps U! for next stmt |
| 078DE | e9 0b 00 | di=bx=U!, si=#1, FSUB [SI]-[DI], store U! | U! = 1 - U! | AGREE | |
| 0794B | 87 fb | xchg: di=#1 (bx from 78FA), si=dx=NTargets! (7902); FCMP je 7950 else jmp 7958 | IF NTargets! <> 1 THEN GOTO L_7958 | AGREE | |
| 079C5 | e9 e1 05 | RND^0.5*Damage!; T3; FNCrew(M!,48) (field C980=48); T3-FAC; INT; store Damage! | Damage! = INT(RND^0.5*Damage! - FNCrew(M!,48)) | AGREE | |
| 07B25 | bf 0c c1 | SndDur!*6 -> FAC; bx=384h=900, dx=1A; 3E_5E; 3E_5F -1,-1 | SOUND 900, SndDur! * 6 | AGREE | |
| 07D06 | 8b f7 | si=di=U! (just stored), +#2, store HandEnd! | HandEnd! = U! + 2 | AGREE | |
| 07D6C | c3 | ret after G!(CINT(FNIdx(M!,90)))=#0 | RETURN 'with FAC = FNIdx(M!,90) | AGREE | |
| 07D8E | cd 3f bc | BC; 6A "Armor is damaged." (D3A6); 79 | PRINT "Armor is damaged."; | AGREE | |
| 07E09 | bf 10 c1 | FnField=#32 (BFA6), FnMember=M!, call 6A9, store WepSlot! | WepSlot! = FNCrew(M!, 32) | AGREE | |
| 07E11 | 8b f7 | FTEST WepSlot!; jne 7E16 else jmp 7C1D | IF WepSlot! = 0 THEN GOTO L_7C1D | AGREE | |
| 07E39 | e9 51 00 | (tail of IF RND<0.3) BC at 7E39; 6A "Weapon is destroyed."; 79 | PRINT "Weapon is destroyed."; | AGREE | |
| 07E5E | bb c0 d3 | (print items) WeaponRec!+#3 CINT -> G!(); FMOV #-1 (C6B0) | G!(CINT(WeaponRec! + 3)) = -1 | AGREE | |
| 07EAF | bb d8 d3 | (print items "Ammo is destroyed.") WeaponRec!+#3 CINT -> G!(); FMOV #0 (C1DC) | G!(CINT(WeaponRec! + 3)) = 0 | AGREE | |
| 08039 | bf 4e 80 | FCMP Hit!?#1; jne 803E else jmp 816D | IF Hit! = 1 THEN GOTO L_816D | AGREE | |
| 080E9 | bf 1a d4 | FMOV EdgeY! <- #32 (BFA6) | EdgeY! = 32 | AGREE | |
| 08385 | bf 06 cb | FMOV CB06 <- #1 | ActiveGroups! = 1 | AGREE | |
| 085B7 | be dc c9 | CINT(Grp!)*5 + CINT(Unit!), *4 + C388 (UnitRockets!); [SI]*0.5; +[DI]=0.5; INT; store same element | UnitRockets!(g*5+u) = INT(UnitRockets!(g*5+u)*0.5 + 0.5) | AGREE | |
| 08699 | be 26 94 | BOOL SndDur!; jne 869E else jmp 86E2 | IF (SndDur! = 0) THEN GOTO L_86E2 | AGREE | |
| 086BD | bb 3b 17 | bx=173Bh=5947, dx=CC60 (0.05); 5E; 5F -1 | SOUND 5947, 0.05 | AGREE | |
| 0878A | cd 3f 7d | (tail NEXT U! STEP PStep1!: sign test jb, jae/ja correct) CINT(Hit!)->dx, CINT(SndDur!) AND dx; jne 878F else jmp 87B1 | IF NOT (CINT(SndDur!) AND CINT(Hit!)) THEN GOTO L_87B1 | AGREE | operand order Hit!/SndDur! swapped, AND commutative |
| 087C7 | be 4e 80 | FLOAD #1, jmp 87D3 store StepI!, FCMP vs StepN! (D45A) | FOR StepI! = 1 TO StepN! | AGREE | |
| 0887A | bb 2a d4 | PX!,PY! (cx=ax=-1 single ptrs) 3E_89; bx=B53C Shot2, dl=4 | PUT (PX!, PY!), Shot2, XOR | AGREE | |
| 08A0A | bf 72 d0 | DX!*U!; +FromX!; store PX! | PX! = DX! * U! + FromX! | AGREE | |
| 08BEE | cd 3f 7d | (tail NEXT Noise! <=8) bx=28h=40, dx=D452 (0.09); 5E/5F | SOUND 40, 0.09000001 | AGREE | |
| 08C0D | be 4e 80 | FLOAD #1, jmp 8C76 store I!, FCMP vs #15 (C1BC) | FOR I! = 1 TO 15 | AGREE | |
| 08C76 | bf 4e 80 | I!+#1 -> store I! at 8C79 | NEXT I! | AGREE | |
| 08CDB | be bc d1 | FTEST Hit!; je 8CE0 (ret) else jmp 8CE1 | IF Hit! <> 0 THEN GOTO L_8CE1 | AGREE | |
| 08D0E | 8b d7 | bx=ToX! (xchg at 8CF1), dx=di=ToY!; 3E_89; bx=B560 Burst1, dl=4 | PUT (ToX!, ToY!), Burst1, XOR | AGREE | |
| 08D76 | bb fe d3 | bx=ToX!, dx=ToY!; 3E_89; bx=B684 Burst2, dl=4 | PUT (ToX!, ToY!), Burst2, XOR | AGREE | |
| 08FB5 | 8b d7 | bx=ToX! (xchg 8F98), dx=ToY!; 3E_89; bx=ADFC Boom1, dl=4 | PUT (ToX!, ToY!), Boom1, XOR | AGREE | |
| 0914C | bb f6 d3 | 3E_84 (FromX!,FromY!); 3E_85 (ToX!,ToY!); UseEGA!*12+3 CINT -> bx; dx=ax=-1 (plain line), cx=-1 | LINE (FromX!,FromY!)-(ToX!,ToY!), CINT(UseEGA!*12+3) | AGREE | |
| 092CC | bf 20 c1 | FnIField <- [si]=D46E (#0, still loaded), FnIMember=M!, call 6DB, store Rec! | Rec! = FNIdx(M!, 0) | AGREE | |
| 0954F | 8b f2 | si=dx=I! (94E5), +#3, store I! (cmp #2597) | NEXT I! STEP 3 | AGREE | |
| 09624 | 8b f2 | dx=Tmp! (95EA/95F2); FTEST; jb 9629 else jmp 9632 | IF Tmp! >= 0 THEN GOTO L_9632 | AGREE | |
| 09681 | bf 7c c1 | G!(CINT(Rec!+#8)) addr -> dx; Tmp!+0.5 INT; store | G!(CINT(Rec! + 8)) = INT(Tmp! + 0.5) | AGREE | |
| 09684 | c3 | ret | RETURN 'with FAC = INT(Tmp! + 0.5) | AGREE | |
| 096D2 | 8b f1 | si=cx=I! (96B6), +MinusOne2! (D4D2), store I!, step sign FTEST | NEXT I! STEP MinusOne2! | AGREE | MinusOne2!=-1 set at 9685; FOR I!=6 at 968E |
| 09739 | 90 | CINT(J!)*9 + CINT(I!), *2, word [di+BBCA] (Map%) = 1 | Map%(CINT(I!) + CINT(J!) * 9) = 1 | AGREE | |
| 09760 | cd 3f 7d | (tail NEXT J! <= 8 jbe 9718) I!+#1 -> I! | NEXT I! | AGREE | |
| 097C3 | 83 c3 48 | bx=CINT(I!) (978F, unchanged) +48h=72; Map%[bx]=3 | Map%(CINT(I!) + 72) = 3 | AGREE | |
| 0983C | be 4e 80 | (after NSpecial2!=NSpecial!) FLOAD #1, jmp 9894 | FOR I! = 1 TO NSpecial2! | AGREE | |
| 099CD | bb 2a d4 | PX!,PY! single ptrs; 3E_89; bx=BCF0 Tile2, dl=4 | PUT (PX!, PY!), Tile2, XOR | AGREE | |
| 099E0 | be 90 ba | I! *2^1, +#24.5, store TileX! | TileX! = I! * 2 + 24.5 | AGREE | |
| 09C1D | 8b f7 | (PRINT CHR$(PortGroup!+65) items, 6E, 79) ARGPUSH cx=bx=2 (row); LEN(GrpName1$(CINT(PortGroup!)))*0.5, 7.5-FAC, CINT; 3E_44 | LOCATE 2, CINT(7.5 - LEN(GrpName1$(CINT(PortGroup!)))*0.5) | AGREE | |
| 09D5F | cd 3d 43 | TIMER, store PortTimer! | PortTimer! = TIMER | AGREE | |
| 09EB0 | e9 09 00 | (IF NGroups!=1 tail) TIMER, store NameTimer! | NameTimer! = TIMER | AGREE | |
| 09F15 | bb 08 00 | bx=8, dx=19h=25, cx=ax=0 (ints); 3E_89; bx=8052 PortraitEGA, dx=3 | PUT (8, 25), PortraitEGA, PSET | AGREE | |
| 09FE1 | be e4 c9 | Unit! *2^4, +#112, store PX! | PX! = Unit! * 16 + 112 | AGREE | |
| 0A200 | bf 36 d5 | FMOV MinusK! <- #-1000 | MinusK! = -1000 | AGREE | |
| 0A38E | bf 10 c1 | FnField=#33 (C1B4), FnMember=M!, call 6A9, store FirstTgt! | FirstTgt! = FNCrew(M!, 33) | AGREE | |
| 0A3AB | bf 10 c1 | FnField=#38 (D066), FnMember=M!, call 6A9, store Grp! | Grp! = FNCrew(M!, 38) | AGREE | |
| 0A466 | cd 3f bc | BC; 6A CrewName$(CINT(M!)); 6A " uses "; 6A CmdName$(CINT(MemberCmd!)); 6E "."; 79 (one PRINT) | PRINT CrewName$(CINT(M!)); " uses "; CmdName$(CINT(MemberCmd!)); "." | AGREE | |
| 0A7FA | e9 4c 00 | (IF tail) FNCrew(I!,51); T3; FNCrew(I!,15); T3-FAC; store Heal! | Heal! = FNCrew(I!, 51) - FNCrew(I!, 15) | AGREE | |
| 0A8C1 | bf 56 bb | FCMP C308 (GrpPortrait!(0)) ? #3; je A8C6 else jmp A8CF | IF GrpPortrait!(0) <> 3 THEN GOTO L_A8CF | AGREE | |
