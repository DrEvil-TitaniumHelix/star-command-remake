# SPBATTLE — verification (lane verify, Opus, 2026-10-15)

Inputs:
- `decode/pseudo/SPBATTLE.bas.md`, `SPBATTLE_SCREENS.md`, `SPBATTLE_names.json` (lane mod-spbattle).
  - The sample text was taken at 24e53ce. The file was regenerated in a11f8b3, which changed only PUT verb words (98 PUT lines, no other statement line), so every verdict holds for the current file.
- `decode/listings/SPBATTLE.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md` + `decode/data/tools/_SPBATTLE.json`.
- Independent GLM review: `SPBATTLE_GLMVERIFY.md`.

**Sample:**
- 1673 statement lines in `## Pseudocode`. Python `random.seed(20261015)`, `random.sample(range(1673), 168)` (10%), plus every CHAIN / BLOAD / BSAVE / ON GOTO / ON GOSUB / INPUT / OPEN line (20 sites, 18 not already drawn) = **186 statements**.
- Each statement was derived from the listing first, then compared with the pseudocode text. Four independent passes (subagents of this lane) did this.
- This lane re-checked every DISAGREE against the bytes.
- A fifth pass did names (40, same seed), all 13 DEF FN bodies with 33 call sites, the screens and the Unknowns.
- Per the Foreman, PUT verb defects count as KNOWN.

## Summary

- 186 statements: **178 AGREE, 1 DISAGREE, 7 KNOWN, 0 UNSURE**.
  - The DISAGREE is 05B13, a variable-STEP FOR loop whose start value and step are not rendered.
  - KNOWN: 6 × verb 3 shown as OR in the sampled text, and 1 × verb 0 shown as PSET (0688E). All 7 are already correct in the current file.
- Out of sample, confirmed by this lane:
  - The same variable-STEP FOR defect at 6 more sites.
  - A PRINT/FN split at 01788.
  - The never-called FN at 0352 is documented with a wrong signature.
  - The FNCanHit and FNSize prose is wrong (the rendered bodies are right).
  - 5 names carried over from SPACE do not occur in this listing.
- Names: 33/40 SUPPORTED, 2 WEAK, 5 NOT FOUND (shared SPACE names, G!() indices correct). DEF FNs: no argument slot is swapped anywhere. Screens: 98/98 strings proven, 19/19 coordinates match.

**Re-check after 71f36ac (mod-inside applied the verify translator requests and regenerated SPBATTLE):** the current SPBATTLE.bas.md has no `X = FAC` line and no bare `PRINT` line. 0530E now reads `FOR TimeSlot! = GunMax! + 1 TO 0` with the step on the NEXT line, per the module's convention. So findings 1 and 2 below are **applied**; 3-6 (documentation) remain open.

## Disagreements and fix requests

1. **Variable-STEP FOR loops not reconstructed (translator; the one sampled DISAGREE + 6 out of sample).**
   - 05B13 `TimeSlot! = FAC`. Bytes:
     - 52F6-5302 `TimeStep! = GunRange! * -0.25`;
     - 5305-530E `FAC = GunMax! + 1 (0x6F4A = 1); jmp 5B10`;
     - 5B07-5B0D `FADD TimeSlot! + TimeStep!`; 5B10 store;
     - 5B16-5B36 sign-of-step test against 0, jumping back to L_5312.
   - The rendering drops the start value and the step-add. It should be `FOR TimeSlot! = GunMax! + 1 TO 0 STEP TimeStep!` ... `NEXT TimeSlot!`.
   - Same pattern, each rendered as `X = FAC` + `IF StepVar >= 0 ...`: 036DF HeadTry!, 0386E HeadTry!, 0426A I! (start NumEnemy! - 1 at 41B5-41BB, step-add `FADD [710E]+[A67C]` at 4264), 0463D I!, 04B62 I!, 06C3F ShieldStr!.
   - The header claims "FOR/NEXT reconstructed", and neither Manual corrections nor Unknowns mention these.
2. **PRINT split around a leading FN call (translator).** 01788..017AE is one PRINT (one RT3F_BC, FN 0301 call, item 6A `;`, one RT3E_79). It is rendered as a bare `PRINT` plus a second PRINT line.
3. **FN 0352 signature.** The body is `INT(G!(78)*30000 + G!(79) + .5)` with **no arguments** (it reads 0x1988/0x198C directly). The header and names.json SUB0352 say `FNKey(a, b)`. It is never called (no `call 0x352`).
4. **FNCanHit prose** (names.json SUB0EAC + Subroutines table):
   - The body indexes `ArcAngle!(CINT(a))` (EAC-EB8: `0x8C42 + 4*CINT([8C66])`), not `(a+1)`.
   - It computes `ArcAngle - bearing (+ heading*45)` (EDB `FSUB [SI]-FAC`, SI = the ArcAngle element, FAC = the bearing from 0D2A), not `bearing - ArcAngle`.
   - The rendered body at 0F6F is correct; only the prose is wrong.
5. **FNSize prose:** "tonnage of ship a" — the body multiplies by the scalar `EnTonnage!` (1001 `mov di,0x8b84`, no index), so it returns the same value for every enemy ship.
6. Names/evidence nits (no rendering impact):
   - 3B54 MissionKey1!, 3B38 MissionKey2!, 1864 ComputerOK!, 18A4 DropPart2! and 3AF4 SectorY! are not referenced in SPBATTLE.lst (their `_why` cites SPACE).
   - `Rnd3!` `_why` cites SPACE 6DF3; SPBATTLE only writes 10 (3EE9).
   - Digit1 `_why` cites SPACE SUB_2056; here it is SUB_1B68, PSET then XOR.
   - G!() layout row "60/61, 63/64" cites 51C3/51C8, which test G!(18)×G!(61) and G!(17)×G!(64).
   - CmdName$ index is `Command!` (4D8E).
   - SCREENS §2 `|dx|<7` is actually -6..+7 (4210).

## Names, DEF FN and screens pass (output of the fifth pass)

### SPBATTLE verification: names / DEF FNs / screens (lane verify)

Inputs: decode/pseudo/SPBATTLE_names.json, SPBATTLE.bas.md, SPBATTLE_SCREENS.md, decode/listings/SPBATTLE.lst, decode/data/tools/_SPBATTLE.json, decode/data/SPRITES.md. Repo read-only. G!(n) = DS 0x1850+4n. Known PUT-verb-3 defect ignored (none was found in the sampled sites: every verb 3 checked renders PSET).

#### Summary

| task | checked | SUPPORTED / OK | WEAK | CONTRADICTED / mismatch | NOT FOUND |
|---|---|---|---|---|---|
| A names (seed 20261015, 40 of 441) | 40 | 33 | 2 | 0 | 5 |
| A G!() layout rows | 10 | 9 | 1 | 0 | - |
| B DEF FNs (all 13) | 13 bodies, 33 call sites | 10 | 2 (FNCanHit text, FNSize text) | 1 (FNKey signature) | - |
| C screen texts | 99 distinct quoted strings | 98 byte-equal + 1 doc heading | - | 0 | - |
| C coordinates | 18 | 18 | - | 0 | - |
| C Unknowns honesty | 2 sections | asm padding disclosed | - | 1 (7 undisclosed `X = FAC` lines) | - |

#### Task A — names (random.sample, 40)

NOT FOUND = the address never appears in SPBATTLE.lst (shared COMMON name carried over from SPACE; its `_why` cites SPACE offsets). G!() index arithmetic was checked for every COMMON entry, and all of it is correct.

| addr | name | verdict | evidence (SPBATTLE.lst) |
|---|---|---|---|
| 3B54 | MissionKey1! | NOT FOUND | 0 refs; G!(2241) arithmetic OK; cites SPACE 5C4E |
| 3B38 | MissionKey2! | NOT FOUND | 0 refs; G!(2234) OK |
| 9F8C | ArcEnd! | SUPPORTED | 1A6B-1A6E FSTORE = ArcStart!(9F88)+[9FA4]; 26BE-26C1 = Fuel!/MaxFuel!*228+42; read at 272A for BarX1! |
| A288 | BarX1! | SUPPORTED | 2736 FSCALE #1 of INT(ArcEnd!*0.5), stored 273F |
| 1864 | ComputerOK! | NOT FOUND | 0 refs; G!(5) OK |
| A9AA | DelayN3! | SUPPORTED | 62AB/62AE = DelayN!*0.2 |
| A9B2 | X1! | SUPPORTED | 6324/6327 FSTORE of FNShotX(EnSlot!,EnShip!) |
| 1904 | BaseWt! | SUPPORTED | G!(45) OK; read 1022 in FNSize (player tonnage), 71A7 |
| 18A4 | DropPart2! | NOT FOUND | 0 refs; G!(21) OK |
| A67B8 | ShipHead3 | SUPPORTED | 43E8 bx=0x67B8, dl=3 PSET, case 4 of `ON ShipHeading!+1`; 0x67B8-0x65FC+7 = 451 = SHIP-n frame 3 |
| 3B20 | Rnd3! | WEAK | G!(2228) OK, but the only SPBATTLE write is 3EE9 `Rnd3! = 10` (literal 10); the "INT(RND*3+1)" in `_why` comes from SPACE 6DF3, so the name doesn't describe this module |
| A4BCE | Digit1 | WEAK | 0x4BCE-0x4890+7 = 837 = SPACESH array 5, correct; but `_why` "SUB_2056 ... (OR then XOR)" is stale SPACE text: SPBATTLE's routine is SUB_1B68, with bytes `mov dx,3` (PSET) at 1B92/1C22 and `mov dx,4` (XOR) at 1C34. The pseudocode body correctly prints PSET/XOR |
| A9BA | X2! | SUPPORTED | 6372/6375 FNShotX(INT(RND*6),Shooter!)+.5; explosion coord at 6862.. |
| 9F50 | M! | SUPPORTED | all 6 refs 1751-181D inside SUB_173C, used as the FOR M! counter |
| 9D4A | DelayM! | SUPPORTED | 1 ref (11D3 store of 6) |
| A5A2 | BestMove! | SUPPORTED | 3995 =4, 3C30 =MoveTry!, 3C55 compare |
| A71C | JumpFuel! | SUPPORTED | 4960 =40; 4997 divisor in hyperspace roll |
| A7D6E | BigBoom3 | SUPPORTED | 698A bx=0x7D6E dl=4; 0x7D6E-0x73A0+7 = 2517 = SPBTSH array 13 |
| A8C76 | CmdName$ | SUPPORTED | F88 READ CmdName$(I!) (DATA line 3991); 4DA5 print. Nit: the index at 4D8E is Command!, not Cmd! |
| A6BCA | EnShipHead2 | SUPPORTED | 42D0 dl=0 OR, case 3 of `ON EnHeading!+1`; 0x6BCA-0x6AA2+7 = 303 = frame 2 |
| 9D46 | DelayN! | SUPPORTED | 11CA =6; FOR var of SUB_1693 (16A2/16A8); read 5A19, 62A5, 62D9. Nit: SUB_13D5 itself never reads it (13D5 uses 0x19B0*[9EB6]); it is a count of SUB_13D5 calls |
| A9C6 | EdgeX! | SUPPORTED | 646C =142, 6478 =17, 64A4 read |
| 3BB8 | G!(2266) | SUPPORTED | 3ED5 = EnFuel!(I!) before boarding; index OK |
| A8C2A | MoveDY! | SUPPORTED | DBD MoveDY!(0) and DD1 (0x8C32) MoveDY!(2); array base at 3A71/3CA5 |
| A4384 | MissileKillerName$ | SUPPORTED | 5F20-5F30 `add bx,0x4384` with index G!(60)-1 (0x1940 + [70AA]); printed after "Intercepted by" |
| A7BDA | BigBoom2 | SUPPORTED | 6970 dl=4 XOR; offset 2113 = array 12 |
| AA2A | ExpX! | SUPPORTED | 6F45 = X2!+4; coord at 6F85/6FB5 |
| 1944 | MissileKillPct! | SUPPORTED | G!(61) OK; 05B6 =50 (test setup), 51BA used in MissileKillPct2! |
| A566 | ShipsN6! | SUPPORTED | 344F = NumEnemy!-1, the FOR K! limit at 345B |
| 3AF4 | SectorY! | NOT FOUND | 0 refs; G!(2217) OK |
| 1950 | DefHardwarePct! | SUPPORTED | G!(64) OK; 51DF multiplier |
| A73A0 | LetterA | SUPPORTED | BLOAD base &H73A0 (06C3); 45CC dl=0 OR; 4698 dl=2 PRESET; 46A9 XOR |
| 7178 | FnMember! | SUPPORTED | 0304 FMUL [7178]*100 in SUB_0301 |
| 1968 | G!(70) | SUPPORTED | 1309 SGN(G!(8))*G!(70) (second shield facing); 066B =0 |
| 8BA4 | GunRange! | SUPPORTED | 0919 store of GunMax!-GunMin! (091C) |
| A758 | StepDir5! | SUPPORTED | 4AE8 = -1; step tested at 4B56/4B65 |
| 488C | ShipName$ | SUPPORTED | 25F9 printed after "Fueling ISS " (0xA260) |
| A68C | TurnDir! | SUPPORTED | 472A =+1 (4730), 4736 =-1 (473C), 479D ShipHeading!+TurnDir! -> FNMod8 |
| 8CFE | ArgB1150! | SUPPORTED | 1150 CINT [8CFE] -> EnY!/EnHeading! index; set at 6335/638F |
| 3AE8 | ChainArg! | SUPPORTED | G!(2214) OK; 06F5 EncRec! = ChainArg!, 2F36 ChainArg! = EnBoardArg! (the `_why` offsets 3608/6DCF/9034 are SPACE's) |

##### G!() layout table rows (10 of 16)

| row | verdict | evidence |
|---|---|---|
| 1 helm flag (4794) | OK | `G!(1) <> 1` -> SUB_1D61 |
| 2 life support (2C3A, 3024) | OK | `IF G!(2)=1`, `G!(2) = 1` |
| 4 radio (2166) | OK | `G!(4) = 1 AND ...` |
| 7..10 shield fitted (5E06, 1A37) | OK | G!(HitFacing!+7); G!(ShieldNo!+6) with ShieldNo! 1..4 |
| 11..16 gun fitted G!(m+8) (4A6E, 53E0) | OK | G!(J!+8), G!(Member!+8) |
| 19 hull state (6094, 136A) | OK | `G!(19) = 2`; INT(G!(19)+.9) divisor |
| 60/61, 63/64 (51C3, 51E8) | WEAK | 51C3 tests G!(18) x G!(61), and 51C8 tests 0x1894 = G!(17) ("DriveFlag!") x G!(64). Neither cited site touches G!(60) or G!(63). G!(60) is the killer *type* (name index at 5F23), not a "fitted" flag. The defence-hardware active flag is really G!(17) |
| 67/70/73/76 shield strengths (136A) | OK | G!(67)*SGN(G!(7)) + G!(70)*SGN(G!(8)) ... |
| 109 / 110..159 (73BD, 73C6) | OK | `G!(109) = 1` when EnBoardArg! = 23; FOR J! = 110 TO 159 |
| 210..259 / 260..309 kill list (2D80-2E53) | OK | G!(Ix!+210) = EnShipType!, G!(Ix!+260) = EnTonnage!, ring wraps at 48.5 |
| 340..369 ammo stock (548A-54F2) | OK | FOR K! = 340 TO 369, match GunNo!, clear, then +5 <- +2 |
| 669+7m gun record (53F7-5816) | OK | GunRec! = Member!*7+669; +6 shots, +5 <- +2 |

(12 rows are listed above because 3 of them were cheap to add. The 10-row sample is 9 OK and 1 WEAK.)

#### Task B — DEF FNs

Literal values come from _SPBATTLE.json: 717C = 100, 7180 = 1300, 7184 = .1, 7190 = 1300.5, 7198 = 30000, 719C = .5, 8BF6 = .125, 8C0A = 90, 8C0E = 1E-7, 8C12 = 57.296, 6F8A = 7, 7116 = 8, 8C5E = 180, 8C62 = 360, 71D4 = 5, 8C6E = 45, 8C72 = 60.5, 8BD8 = 10, 710A = 3, 8CDE = 77, 8CE2 = 148, 8CE6 = 199, 8BC8 = .3, 8BA8 = .2, 71CC = 4, 8CF2 = -11, 8CF6 = -85, 8D02 = -16. T[#90] = 0x702A (T16).

| FN | body | args (names.json) | formula vs listing | call sites checked (slot order) | verdict |
|---|---|---|---|---|---|
| FNCrew(m,f) | 0301-032F | 7178=m, 7174=f | `INT(G!(CINT(m*100+f+1300)) + .1)`: matches | 177A (M!,31), 4A12 (J!,31), 5571 (Member!,38) | OK |
| FNIdx(m,f) | 0333-034E | 718C=m, 7188=f | `INT(m*100+f+1300.5)`: matches | 04FC (I!,1), 3F8F (Member!,37), 510A (J!,38) | OK |
| FNKey | 0352-036D | none | **MISMATCH**: the body is `INT([0x1988]*30000 + [0x198C] + .5)` = `INT(CreditsHi!*30000 + CreditsLo! + .5)`. It reads the globals directly and has no argument slots, so the header's `FNKey(a, b) = INT(a*30000 + b + .5)` and names.json SUB0352 have the wrong signature. 0 call sites, so the body is not affected | none (0 `call 0x352`) | mismatch (header text only) |
| FNMod8(a) | 0CB1-0CCD | 8BF2 | `INT(a - INT(a*.125)*8)`: matches | 377D HeadTry!, 3908 EnHeading!(K!)+1, 47AE ShipHeading!+TurnDir! | OK |
| FNDist(a,b) | 0CD1-0D26 | 8BFA=a, 8BFE=b | `SQR((EnX!(a)-EnX!(b))^2+(EnY!(a)-EnY!(b))^2)`; EnX!(5) = 0x89D4 = MyX!, EnY!(5) = 0x89EC = MyY!, so 5 = player holds | 3A9B (.,5), 3B9A (K!,Other!) via xchg di,si, 5610 (5,ShieldNo!), F1C (5,b) | OK |
| FNAngle(a,b) | 0D2A-0DB9 | 8C02=a, 8C06=b | `INT(90 - (EnX!(b)<EnX!(a))*180 - ATN((EnY!(a)-EnY!(b))/(EnX!(b)-EnX!(a)+1E-7))*57.296 + .5)`: matches body line 0DB9 | 3470 (K!,5), 5D77 (5,EnShip!), ED5 (5,b) | OK |
| FNInView(a) | 0DE2-0E46 | 8C3E | (MyX!-EnX!(a)<7)*(EnX!(a)-MyX!<8)*(ABS(MyY!-EnY!(a))<7): matches | 48E4 I!, 5A95 EnShip!, F68 b | OK |
| FNNorm(a) | 0E81-0EA8 | 8C5A | `INT(a - INT((a+180)/360)*360)`: matches | EF5 (in FNCanHit), 5D98 FNAngle(5,EnShip!)-ShipHeading!*45+45 | OK (only 2 sites exist) |
| FNCanHit(a,b) | 0EAC-0F6F | 8C66=a, 8C6A=b | Listing: `(ABS(FNNorm(ArcAngle!(a) - FNAngle(5,b) + ShipHeading!*45)) < 60.5) * (FNDist(5,b) < 10) * INT(EnStatus!(b)/3) * FNInView(b)`, matching body line 0F6F. **WEAK** prose in names.json SUB0EAC / Subroutines table: the text "\|bearing - ArcAngle!(a+1) + heading*45\|" is wrong twice over. The index is ArcAngle!(a) (si = 0x8C42 + 4*CINT([8C66]), EB2-EB8), and the sign is ArcAngle - bearing + heading*45 (EDB FSUB [SI]-FAC, then +3B18*45), which is not equivalent | 4B14 (J!-3, I!), 4BF5 (J!-3, FNCrew(J!,38)), 4F4D (J!-3, NewTarget! = A7DE) | body OK, text WEAK |
| FNSize(a) | 0FED-102F | 8CD6 | `ABS((a<5)*EnTonnage!) + ABS((a=5)*BaseWt!)`: matches. **WEAK** prose: the header says "tonnage of ship a", but EnTonnage! (0x8B84, 1001 `mov di,0x8b84`) is a scalar, so every enemy ship returns the same value | 103C/1066/1091 (all inside FNScale, 8CD6 <- 8CDA) | body OK, text WEAK |
| FNScale(a) | 1033-10AD | 8CDA | .3 + .3*(>77) + .2*(>148) + .2*(>199) = .3/.6/.8/1: matches | 10DB (in FNShotX, 8CDA <- 8CEE) | OK (only 1 site) |
| FNShotX(a,b) | 10B2-114C | 8CEA=a, 8CEE=b | `EnX!(b)*8 + FNScale(b)*(PortX!(FNMod8(EnHeading!(b)+a+(a>1)+(a>4))) - 11) - 85` (QB relational -1, subtracted): matches | 6321 (EnSlot!,EnShip!), 6367 (INT(RND*6),Shooter!) | OK (only 2 sites) |
| FNShotY(a,b) | 1150-11C9 | 8CFA=a, 8CFE=b | `EnY!(b)*8 + PortY!(FNMod8(...)) - 16`. T[#90] = 0x702A is reloaded at 11BD. No FNScale factor (unlike FNShotX), and the body renders this correctly | 633E (EnSlot!,EnShip!), 6398 (INT(RND*6),Shooter!) | OK (only 2 sites) |

Unlike the SPACE FNKey case, no slot was swapped at any of the 33 call sites checked.

#### Task C — screens

##### Texts
I ran a script over every `"..."` in SPBATTLE_SCREENS.md (99 distinct strings) against the str literals in _SPBATTLE.json. 98 are byte-equal to a literal: for example `"Sucessfull"` 0xA72E, `"E-Impersonate Diety"` 0xA0FC, `"ENTER to accept   "` 0xA788 (with its 3 trailing spaces), `"Fueling ISS "` 0xA260, `" struggles with the life"` 0xA44C. The remaining one, "Key map", is a cross-reference to the doc heading, not screen text. CmdName$ list = DATA line 3991 exactly. Concatenations (`"They accept"; n; "credits"`, `"making"; n; "hits"`, `CrewName$; " fires"`, `"#"; CHR$(49+i); " "; EnemyName$; " - "`) use only literals that exist. No mismatch.

##### Coordinates (first ARGPUSH = row)

| site | doc | listing bytes | ok |
|---|---|---|---|
| 0767 NumEnemy!..."(s)" | 22,3 | bx=0x16, bx=3 | yes |
| 21B8 Communications Phase | 20,8 | 0x14, 8 | yes |
| 221C D-Bargain/Bribe | 21,15 | dx <- bx=0x15 (21C1/21C7), 0xF | yes |
| 2260 Choose An Approach | 24,3 | 0x18, 3 | yes |
| 25F3 Fueling ISS | 20,9 | 0x14, 9 | yes |
| 2C22 Battle Over | 22,14 | 0x16, 0xE | yes |
| 2C57 BATTLE REPORT | 1,14 | 1, 0xE | yes |
| 3075 You Are All Dead | 9,3 | 9, 3 | yes |
| 3243 Movement Phase | 20,12 | 0x14, 0xC | yes |
| 332B E-Skip Move | 21,17 | 0x15, 0x11 | yes |
| 3317 PUT Cursor | (254,160) XOR | bx=0xFE, dx=0xA0, dl=4 | yes |
| 3E78 You have docked with | 20,3 | 0x14, 3 | yes |
| 41A1 PUT HdrVisual | (32,0) PSET | bx=0x20, dx=0, dl=3; 0x4B28-0x4890+7 = 671 = SPACESH 4 "VISUAL" | yes |
| 4484 PUT HdrLongRange | (32,0) PSET | 0x20, 0, dl=3; 173 = SPACESH 1 | yes |
| 448A LINE | (46,9)-(46,143) | bx=0x2E, dx=9 / dx=0x8F | yes |
| 47D9 Enemy Report | 20,11 | 0x14, 0xB | yes |
| 4988/49CE Sucessfull | 23,3 | 0x17, 3 | yes |
| 4EA0 W-Wait... | 24,3 | 0x18, 3 | yes |
| 5D15 fires and | 21,3 | 0x15, dx <- 3 (5CF3/5CFC) | yes |

Minor prose items, not defects: §2 visual window "|dx| < 7" — 4210 accepts EnX! 14..27 around MyX! = 20, so dx runs -6..+7 (FNInView agrees: <7 / <8). The hyperspace roll `RND <= (FuelUse!/JumpFuel!)*.6+.2` matches 4994-49B4.

##### Unknowns honesty
- The 22 `' asm` lines at 7421-744E are the padding already disclosed in Manual corrections (07412/0741B). OK.
- The `## Unknowns (runtime calls not rendered)` table is empty, which matches the header's "No runtime call is left unrendered".
- **Not disclosed:** 7 body lines render a bare accumulator: `036DF HeadTry! = FAC`, `0386E HeadTry! = FAC`, `0426A I! = FAC`, `0463D I! = FAC`, `04B62 I! = FAC`, `05B13 TimeSlot! = FAC`, `06C3F ShieldStr! = FAC`. These are FOR loops with a variable STEP that the translator did not rebuild. At 4264, `FADD [710E]+[A67C]` = I! + StepDir3!. The loop entry at 41B5-41BB, `FADD NumEnemy!(8B2C) + [70AA]`, loads the start value NumEnemy!-1, and that value never appears in the body. Similarly 6C39 = ShieldStr! + [AA06]. The header Conventions say "FOR/NEXT reconstructed", but these loops lose their start and step expressions, and neither Manual corrections nor Unknowns mention them.
- Cosmetic: 4 `LINE (...)-(...), ` renders (44A4.., scan-map grid) have a dangling comma. Bytes bx = dx = cx = 0xFFFF mean colour and B/BF are omitted.

## Verdict table (186 sampled statements)

Columns: statement offset (as printed in SPBATTLE.bas.md) / first bytes / derivation from the listing / pseudocode text / verdict / note.

| offset | bytes | derivation | pseudocode | verdict | note |
|---|---|---|---|---|---|
| 0005D | e9 17 00 | inside IF DriveCfg!=1 (4F FCMP [19A4]?#1, je 57): Drive$="A:" (57-5A), then jmp 0077 | GOTO L_0077 | AGREE | |
| 000DE | e9 43 00 | (CF jmp 115 = tail of IF DebugLoad! test) CSNG 0x4890 -> FAC; BLOAD "spacesh" (6F92), off FAC | BLOAD "spacesh", &H4890 | AGREE | |
| 000ED | bb 50 18 | CSNG 0x1850; BLOAD "CHARINFO" (6F9E) | BLOAD "CHARINFO", &H1850 | AGREE | |
| 00112 | bb fc 65 | CSNG 0x65FC -> T0 (71 #80); FSUB [70AA]#-1 - [18C4]ShipClass!; STR$; "SHIP"+; BLOAD off T0 | BLOAD "SHIP" + STR$(-1 - ShipClass!), &H65FC | AGREE | |
| 00170 | 90 be 0e 71 | dest SlotTag$ base 70DA + CINT(I!)*4; CHR$(CINT(I!+#46)); SASSIGN | SlotTag$(CINT(I!)) = CHR$(CINT(I! + 46)) | AGREE | |
| 0017B | 8b f1 | I!+#1 -> I!, cmp #8 (183) | NEXT I! | AGREE | |
| 001AC | bb 40 71 | SASSIGN [7128]ClassName$(2) <- "Soldier" (7140) | ClassName$(2) = "Soldier" | AGREE | |
| 001C6 | e9 44 01 | (1B7 tail of IF DebugLoad! jne) CSNG 0x40F4; BLOAD "LOGO" (714C) | BLOAD "LOGO", &H40F4 | AGREE | |
| 001D6 | 33 db | OPEN mode 0 (INPUT), #1, "NAME" (7154) | OPEN "NAME" FOR INPUT AS #1 | AGREE | |
| 001E5 | bb 01 00 | INPUT #1 begin; B7 n=1 type 04; store 715C K$ | INPUT #1, K$ | AGREE | |
| 00219 | 90 bb 01 00 | INPUT #1; n=1 type 04; store 4384 + CINT(I!)*4 MissileKillerName$() | INPUT #1, MissileKillerName$(CINT(I!)) | AGREE | |
| 0025B | 90 bb 01 00 | INPUT #1; n=1 type 04; store 4390 + CINT(I!)*4 GunName$() | INPUT #1, GunName$(CINT(I!)) | AGREE | |
| 002A3 | 33 db | (290 CLOSE #1 = prev) OPEN mode 0, #1, "CHARNAME" (7168) | OPEN "CHARNAME" FOR INPUT AS #1 | AGREE | |
| 002A9 | bb 01 00 | INPUT #1; n=1 type 04; store 488C ShipName$ | INPUT #1, ShipName$ | AGREE | |
| 002C3 | bb 01 00 | INPUT #1; n=1 type 04; store 4288 + CINT(I!)*4 CrewName$() | INPUT #1, CrewName$(CINT(I!)) | AGREE | |
| 00330 | e9 1c 00 | jmp 034F after FN body ret at 32F (skip next DEF FN body 0333) | GOTO L_034F | AGREE | |
| 003D5 | 90 be 0e 71 | FMOV G!(CINT(I!)) (1850+4*CINT) <- #1 | G!(CINT(I!)) = 1 | AGREE | |
| 0046D | 8b f2 | DX=Ix! (43A/43C); Ix!+#2 CINT -> G! slot <- #9 | G!(CINT(Ix! + 2)) = 9 | AGREE | |
| 0048A | 8b f2 | Ix!+#4 CINT -> G! slot <- #40 (71D0) | G!(CINT(Ix! + 4)) = 40 | AGREE | |
| 004CD | 8b fa | DX=&#7 (4A8 xchg dx,si after si=6F8A), AX=&Ix!; Ix!+7 -> Ix!, cmp #725, ja exit | NEXT Ix! STEP 7 | AGREE | step 7 confirmed via 4A8 xchg |
| 00586 | bf 4a 6f | I!+#1 -> I!, cmp #369 | NEXT I! | AGREE | |
| 005B6 | bf 44 19 | FMOV [1944]MissileKillPct! <- #50 | MissileKillPct! = 50 | AGREE | |
| 005C7 | 8b f3 | SI=BX=&#1 (5A8 mov bx,si; si=6F4A); FMOV [189C]G!(19) | G!(19) = 1 | AGREE | |
| 00680 | bf e8 3a | FMOV [3AE8]ChainArg! <- #18 | ChainArg! = 18 | AGREE | |
| 006A4 | bf 70 18 | FMOV [1870]G!(8) <- #2 | G!(8) = 2 | AGREE | |
| 006D5 | bb a0 73 | CSNG 0x73A0; Drive$ + "SPBTSH.BAS" (886E); BLOAD | BLOAD Drive$ + "SPBTSH.BAS", &H73A0 | AGREE | |
| 006EF | 33 db | OPEN mode 0, #1, Drive$+"ENCLIST" (8B18) | OPEN Drive$ + "ENCLIST" FOR INPUT AS #1 | AGREE | |
| 006F8 | bf 24 8b | FMOV [8B24]EncRec! <- [3AE8]ChainArg! | EncRec! = ChainArg! | AGREE | |
| 00707 | bb 01 00 | INPUT #1; n=4 types 04 02 02 02; stores 8B28 EnemyName$, 8B2C NumEnemy!, 8B30 EncMod!, 8B34 EncRow! | INPUT #1, EnemyName$, NumEnemy!, EncMod!, EncRow! | AGREE | |
| 00787 | bb 2c 8b | (75B-76D = items of PRINT at 758) OPEN mode 0, #1, Drive$+"ENCTABLE" (8B40) | OPEN Drive$ + "ENCTABLE" FOR INPUT AS #1 | AGREE | |
| 0079F | bb 01 00 | INPUT #1; n=13 all 02; stores 8B50..8B68 (7 Tbl*), 887C..8890 TblWeapon!(0..5) | INPUT #1, TblHull! ... TblWeapon!(5) | AGREE | all 13 targets match in order |
| 00804 | cd 3f b7 0d | (items of prev INPUT) INPUT #1; n=12 all 02; stores 8B6C..8B98 EnMoves!..TblMissiles! | INPUT #1, EnMoves!, ... TblGunDmg!, TblMissiles! | AGREE | all 12 targets match |
| 0087E | cd 3f 7d | (NEXT I! cmp EncRowN! tail) CLOSE #1 | CLOSE #1 | AGREE | |
| 0088C | bf 7c 71 | FDIV [8B30]EncMod!/#100 -> EncMod! | EncMod! = EncMod! / 100 | AGREE | |
| 0091C | 87 f9 | CX=&GunMin! (8F9); xchg -> SI=GunMax!, DI=GunMin!; FSUB -> [8BA4]GunRange! | GunRange! = GunMax! - GunMin! | AGREE | |
| 00A6B | 8b f2 | DX=&EncMod! (A46), CX=&#1 (A53 xchg); EncMod!*#0.6 + 1, * TblGunDmg!, store TblGunDmg! | TblGunDmg! = (EncMod! * 0.6 + 1) * TblGunDmg! | AGREE | |
| 00B36 | 81 c3 f0 8a | BX=CINT(I!)*4 (AC4/AFB/B1F); 8AF0+BX EnDefence!() <- [8B58]TblDef! | EnDefence!(CINT(I!)) = TblDef! | AGREE | |
| 00CAB | bb a2 6a | CSNG 0x6AA2 -> T1 (71 #81); Drive$+"ENSHP"; NEG [8B7C]EnSprite!; STR$; +; +".BAS"; BLOAD off T1 | BLOAD Drive$ + "ENSHP" + STR$(-EnSprite!) + ".BAS", &H6AA2 | AGREE | |
| 00E62 | be 0e 71 | READ sng -> 8C42 + CINT(I!)*4 ArcAngle!() | READ ArcAngle!(CINT(I!)) | AGREE | |
| 00FAE | cd 3f 7d | (NEXT I! cmp #7 tail) FLOAD #0, jmp FDA; FDA store I!, cmp #7 jbe FB2 | FOR I! = 0 TO 7 | AGREE | |
| 011E8 | be 82 6f | FLOAD #0, jmp 1219: store K!, cmp #2 (1221), jbe 11EC | FOR K! = 0 TO 2 | AGREE | |
| 012BE | cd 3f 7d | (NEXT K! cmp #3 tail) I!+#1 -> I!, cmp #4 | NEXT I! | AGREE | |
| 014B4 | 8b f7 | SI=DI=&Ix!; G!(CINT(Ix!)) -> [9EE2]GunType! | GunType! = G!(CINT(Ix!)) | AGREE | |
| 014FF | bb d8 9e | (PRINT "-- --" items of 14F3) ret; FAC last set at 14DC INT(G!(CINT(I!+10))) | RETURN 'with FAC = INT(G!(CINT(I! + 10))) | AGREE | FAC comment consistent (string PRINT does not reload FAC) |
| 01521 | bf ee 9e | FMOV [9EEE]AmmoCount! <- #0 | AmmoCount! = 0 | AGREE | |
| 0158D | cd 3f 7d | (NEXT Tmp2! cmp #369 tail) Ix!+#5 CINT -> G! -> [9EBA]Tmp! | Tmp! = G!(CINT(Ix! + 5)) | AGREE | |
| 015A6 | e8 e3 07 | near call 1D8C (SUB_15A6 entry) | GOSUB SUB_1D8C | AGREE | |
| 01656 | 75 03 (164B tail) bf a6 9e be 54 6f cd 3f 7b | FMOV 9EA6 Member! <- 6F54 #2 (IF-true branch after jne 1650) | Member! = 2 | AGREE | |
| 01701 | 87 f7 cd 3f 7b | after FCMP Tmp!(9EBA) ? #999(9F38), ja 16FF: xchg -> DI=Tmp!, SI=#999, FMOV | Tmp! = 999 | AGREE | |
| 0170D | bb 06 00 cd 3e 42 bb 1b 00 cd 3e 44 | ARGPUSH 6, LOCATE exec 0x1B | LOCATE 6, 27 | AGREE | |
| 0171F | bb 3c 9f cd 3f bd ... c3 | tail: PRINT USING "###"; Tmp! +NL, PRINT end; ret at 171F | RETURN | AGREE | |
| 018DF | e9 75 ff | jmp 1857 | GOTO L_1857 | AGREE | |
| 01ADC | be b4 9f cd 3f 6f e9 75 00 | FLOAD #275, jmp 1B54 (store I!, FCMP I!?ArcX1!(9FAC), ja exit 1B67, else body 1AE0); NEXT at 1B4B adds #1 | FOR I! = 275 TO ArcX1! | AGREE | |
| 01C0D | bb 0e 71 ba dc 8b b9 ff ff ... cd 3e 58 | RT3E_89 (I!,K!); PUT arr 4C00 Digit6, DL=3 | PUT (I!, K!), Digit6, OR | KNOWN | verb 3 = PSET |
| 01C25 | bb 0e 71 ba dc 8b ... ba 03 00 cd 3e 58 | RT3E_89 (I!,K!); PUT arr 4BCE Digit1, DL=3 | PUT (I!, K!), Digit1, OR | KNOWN | verb 3 = PSET |
| 01C72 | 8b da ba 01 00 cd 3d 0c cd 3f bb 83 c3 ba | RIGHT$(K$,1), ASC, add -0x46, CSNG, FSTORE 9F54 Cmd! (LEN(K$)>1 branch) | Cmd! = ASC(RIGHT$(K$, 1)) - 70 | AGREE | |
| 01CB2 | 8b f7 bf c8 9f cd 3f 9f 77 03 | FCMP Cmd! ? #43; ja 1CB7 (Cmd!-32) else jmp 1CC2 | IF Cmd! <= 43 THEN GOTO L_1CC2 | AGREE | folded form of IF Cmd!>43 THEN Cmd!=Cmd!-32 |
| 01D61 | e8 28 00 | call 1D8C | GOSUB SUB_1D8C | AGREE | |
| 01D7C | bb 16 00 ... cd 3f 6e cd 3e 79 e8 14 f9 | tail LOCATE 22,3 / PRINT "Pilot or ship not ready"; call 1693 | GOSUB SUB_1693 | AGREE | |
| 01DF1 | b9 ff ff cd 3e 86 c3 | tail of LINE ... BF; ret 1DF1 | RETURN | AGREE | |
| 01E12 | b9 ff ff cd 3e 86 c3 | tail of LINE; ret 1E12 | RETURN | AGREE | |
| 01E5F | be f4 9f cd 3f 75 cd 3e 42 ... bb 07 00 cd 3e 44 | ARGPUSH CINT(CurY!), CINT(CurX!), 1, 0; exec 7 | LOCATE CINT(CurY!), CINT(CurX!), 1, 0, 7 | AGREE | |
| 01F14 | bf cc 71 be ec 9f cd 3f 9f ... 74 03 e9 26 ff | bx=(MaxLen!=4); dx=(I!<48); cx=(I!>57); (cx OR dx) AND bx; je 1F19 else jmp 1E3F | IF ((I! > 57) OR (I! < 48)) AND (MaxLen! = 4) THEN GOTO L_1E3F | AGREE | |
| 01FB1 | bf 10 a0 be 4a 6f cd 3f 7b | FMOV A010 Flag! <- #1 | Flag! = 1 | AGREE | |
| 01FFD | 8b c2 bb 28 a0 cd 3f 62 ... 75 03 e9 0a 00 | cx=(K$="y"); dx=(K$="Y"); OR; jne 2002 (YesNo!=1) else jmp 200C | IF NOT ((K$ = "Y") OR (K$ = "y")) THEN GOTO L_200C | AGREE | OR operand order swapped, same value |
| 0205A | bf b4 71 be 14 a0 cd 3f 7b | FMOV 71B4 YesNo! <- A014 #0 | YesNo! = 0 | AGREE | |
| 02284 | be 54 9f cd 3f a7 72 f5 | after call 1857 at 227B: FTEST Cmd!; jb 227B | IF Cmd! < 0 THEN GOTO L_227B | AGREE | |
| 022AB | bf 0a 71 be 3c a1 cd 3f 9f 74 03 | FCMP Approach! ? #3; je 22B0 else jmp 22BC | IF Approach! <> 3 THEN GOTO L_22BC | AGREE | |
| 022FC | 8b da cd 3e 42 bb 0f 00 cd 3e 44 | bx=dx (=21 from 22C5); ARGPUSH; exec 0x0F | LOCATE 21, 15 | AGREE | |
| 0232B | bb 18 00 cd 3e 42 8b d8 cd 3e 44 | ARGPUSH 0x18; bx=ax (=3, set 22E9 from LOCATE 22,3 col) | LOCATE 24, 3 | AGREE | |
| 0237A | 8b df bf cc 71 be 3c a1 cd 3f 9f 74 03 | FCMP Approach! ? #4; je 237F else jmp 2399 | IF Approach! <> 4 THEN GOTO L_2399 | AGREE | |
| 02396 | be 70 8b cd 3f 9f b8 00 00 73 01 48 ba d8 ff f7 ea | ax=(EnTech! < #4); imul -40; CSNG; FSTORE DI=Offer!(A196, saved in bx 236F) | Offer! = (EnTech! < 4) * -40 | AGREE | |
| 023A7 | bf 8c 8b be 8e 9e cd 3f 97 | FSUB MyStrength!(9E8E) - EnStrength!(8B8C) -> RelStrength!(A19A) | RelStrength! = MyStrength! - EnStrength! | AGREE | |
| 0246D | bf 4a 6f be 9e 9e cd 3f 9f ... 75 03 e9 08 00 | bx=(Hostile!=1); dx=(EnAttitude!=1); AND; jne 2472 else jmp 247A | IF NOT ((EnAttitude! = 1) AND (Hostile! = 1)) THEN GOTO L_247A | AGREE | |
| 02593 | cd 3f bc bb fa a1 cd 3f 6e cd 3e 79 | PRINT begin; s$ A1FA +NL; end | PRINT "They are insulted by your offer" | AGREE | |
| 0273F | bf 9c 71 be 8c 9f cd 3f 8f ... cd 3f ad 01 | FMUL ArcEnd!*#0.5; INT; FSCALE *2^1; FSTORE A288 BarX1! | BarX1! = INT(ArcEnd! * 0.5) * 2 | AGREE | |
| 027BE | e8 d2 ee | (2nd) call 1693 | GOSUB SUB_1693 | AGREE | |
| 027C4 | e8 a3 03 e9 49 04 | tail call 2B67; jmp 2C10 | GOTO L_2C10 | AGREE | |
| 027D5 | cd 3f bc bb 8c a2 cd 3f 6e | PRINT "They agree to a truce" +NL (reached via Approach!<>3 jne 27D5) | PRINT "They agree to a truce" | AGREE | |
| 029D8 | bf b2 a1 be 4a 6f cd 3f 7b | FMOV A1B2 EnemyNear! <- #1 | EnemyNear! = 1 | AGREE | |
| 02A3D | 81 c2 08 8a 8b fa ... be 54 6f cd 3f 7b | DX = CINT(I!)*4 (29E7/2A07) + 8A08 EnStatus!; FMOV <- #2 | EnStatus!(CINT(I!)) = 2 | AGREE | |
| 02A68 | be 0e 71 cd 3f 75 ... 81 c6 94 88 ... 72 03 e9 0e 00 | FCMP Hull!(CINT(I!)) ? #1; jb 2A6D else jmp 2A7B | IF Hull!(CINT(I!)) >= 1 THEN GOTO L_2A7B | AGREE | |
| 02AEC | 8b f2 bf 4a 6f cd 3f 7f bf dc 8b | SI=DX=K!(8BDC) +#1 -> K!; then FCMP K! ? #5 jbe 2AB6 (FOR K!=0 TO 5) | NEXT K! | AGREE | |
| 02B7C | bf aa 70 be 2c 8b cd 3f 7f bf 28 a3 | NumEnemy! + #-1 -> A328 ShipsN3! | ShipsN3! = NumEnemy! - 1 | AGREE | |
| 02C2E | e8 62 ea | (2nd) call 1693 after PRINT "Battle Over" | GOSUB SUB_1693 | AGREE | |
| 02D80 | bf 4a 6f be 2c 1d cd 3f 7f ... cd 3f 71 92 ... cd 3f 95 92 | T = KillPtr!+1; FCMP SI=KillPtr! (RT3F_71 preserves SI/DI) ? #48.5 -> -1/0, ABS; T*that; INT; -> 71C0 Ix! | Ix! = INT((KillPtr! + 1) * (-(KillPtr! < 48.5))) | AGREE | |
| 02E43 | bf 4a 6f be 34 1d cd 3f 7f 8b fe cd 3f 7d | Kills!(1D34) + #1 -> Kills! | Kills! = Kills! + 1 | AGREE | |
| 02F30 | bb b4 a3 b8 42 6f cd 3f 55 cd 3e 0e | (Boarding!=0 branch) SCAT Drive$ + "SPACE.EXE"; CHAIN | CHAIN Drive$ + "SPACE.EXE" | AGREE | special |
| 02F48 | ... bb c2 a3 b8 42 6f cd 3f 55 cd 3e 0e | tail ChainArg! = EnBoardArg!; SCAT Drive$ + "PLBATTLE.STR"; CHAIN | CHAIN Drive$ + "PLBATTLE.STR" | AGREE | special |
| 03057 | cd 3f bc bb 68 a4 cd 3f 6e cd 3e 79 | PRINT "support systems your air runs out." +NL (after LOCATE 22,3) | PRINT "support systems your air runs out." | AGREE | |
| 03158 | bf aa 70 be 2c 8b cd 3f 7f bf be a4 | tail NEXT J! (TO 8); NumEnemy! + #-1 -> A4BE ShipsN5! | ShipsN5! = NumEnemy! - 1 | AGREE | |
| 0317A | be 0e 71 cd 3f 75 ... 81 c6 04 8b ... 72 03 e9 6a 00 | FCMP Missiles!(CINT(I!)) ? #1; jb 317F else jmp 31E9 | IF Missiles!(CINT(I!)) >= 1 THEN GOTO L_31E9 | AGREE | |
| 031CE | be 0e 71 cd 3f 75 ... f7 ef ... 81 c7 1c 8a 81 c3 a8 88 ... cd 3f a7 | idx = CINT(I!)*6 + CINT(Slot!); cx=(WeaponDmg!(idx) > 0) -1/0, neg -> 1/0; FMUL WeaponOK!(idx)*cx -> WeaponOK!(idx) | WeaponOK!(CINT(I!)*6+CINT(Slot!)) = (WeaponOK!(...)) * (-(WeaponDmg!(...) > 0)) | AGREE | |
| 0347F | bf 6e a5 be 72 a5 cd 3f 7b | FMOV A56E BestScore! <- A572 #0 | BestScore! = 0 | AGREE | |
| 03671 | be 7a a5 | si=&MoveScore!(CINT(HeadTry!)) 3645-3651; xchg -> SQR(Tmp2! 9EF2) 3659, *#50 (71F0), FADD [MoveScore elem], INT (FAC 1A), FSTORE same elem | MoveScore!(CINT(HeadTry!)) = INT(MoveScore!(..) + SQR(Tmp2!) * 50) | AGREE | |
| 03736 | 75 03 e9 | MoveScore!(CINT(EnHeading!(CINT(K!)))) FCMP BestScore! (A56E); jne 373B else jmp 3943 | IF MoveScore!(..) = BestScore! THEN GOTO L_3943 | AGREE | |
| 03803 | bf 9a a5 | FMOV StepDir2! (A59A) <- #-1 (70AA) | StepDir2! = -1 | AGREE | |
| 03857 | 74 03 e9 | (tail je/jmp 3862) EnHeading!(CINT(K!)) FSUB HeadTry! (A57A) -> FSTORE TurnCCW! (A58E) | TurnCCW! = EnHeading!(CINT(K!)) - HeadTry! | AGREE | |
| 0385F | 8b fb | di=bx=HeadTry! (A57A); FMOV <- #-99 (A1B6) | HeadTry! = -99 | AGREE | |
| 03877 | cd 3f 7d | (tail FSTORE HeadTry!) FTEST StepDir2!; jb 387C else jmp 3889 | IF StepDir2! >= 0 THEN GOTO L_3889 | AGREE | |
| 03884 | e9 0d 00 | si=di=HeadTry!; FCMP HeadEnd2! (A596); jae 3810 | IF HeadTry! >= HeadEnd2! THEN GOTO L_3810 | AGREE | |
| 03892 | 0e 00 bf | FCMP HeadTry! ? HeadEnd2!; ja 3897 else jmp 3810 | IF HeadTry! <= HeadEnd2! THEN GOTO L_3810 | AGREE | |
| 03A0D | 7d 8b f3 | si=EnTactic! (8B78, via bx 39EC) FCMP #3; dx=-1/0; shl x2 (*4); + cx (=6 from 39C4); CSNG; FSTORE WantSpacing! (A5AE) | WantSpacing! = (EnTactic! = 3) * 4 + 6 | AGREE | |
| 03C68 | 75 03 e9 | (tail jne/jmp 3CB6) FMOV Moved! (A4B2) <- #1 | Moved! = 1 | AGREE | |
| 03D8A | 7d 8b f7 | (tail NEXT I! TO 5) bx=-1 if ViewMode!=0 (jne skip); dx=-1 if Moved!+Turned! >0 (jbe skip); and; jne -> call 4186, else jmp 3D95 | IF NOT ((Turned!+Moved! > 0) AND (ViewMode! = 0)) THEN GOTO L_3D95 | AGREE | |
| 03DE4 | bf 4a 6f | (tail call 2925) FCMP EnemyLeft! (A05E) ? #1; je 3DE9 else jmp 49E9 | IF EnemyLeft! <> 1 THEN GOTO L_49E9 | AGREE | |
| 03DF5 | 03 e9 00 | FADD NumEnemy! (8B2C) + #-1 -> FSTORE ShipsN8! (A5E2) | ShipsN8! = NumEnemy! - 1 | AGREE | |
| 03E73 | cd 3f bc | (LOCATE exec tail) PRINT begin 3E73; s$ A5E6 "You have docked with" via RT3F_6E (+NL); end 3E7E | PRINT "You have docked with" | AGREE | |
| 04071 | 42 bf 50 | si=&G!(CINT(K!-RecDelta! A650)) 4042-4058; di=&G!(CINT(K!)) 4062-406B; RT3F_11 SWAP numeric | SWAP G!(CINT(K! - RecDelta!)), G!(CINT(K!)) | AGREE | |
| 0407C | bf f2 74 | si=cx=K!; +#1; FSTORE K!; FCMP RecEnd! (A654) | NEXT K! | AGREE | |
| 040C1 | bf a6 9e | FADD Tmp2! (9EF2) + Member! (9EA6) -> FSTORE SwapSum! (A65C) | SwapSum! = Tmp2! + Member! | AGREE | |
| 040DA | e8 69 00 | (call 413A body) I! + #12 (9EE6) -> I!; FCMP #1097 (A664) | NEXT I! STEP 12 | AGREE | limit 1097 |
| 04126 | e8 1d 00 | I! + #3 -> I!; FCMP #2599 (A674) | NEXT I! STEP 3 | AGREE | limit 2599 |
| 0427D | 72 03 e9 | (tail FTEST StepDir3! jb) si=di=I! (stored 4267); FTEST; jb 4282 else jmp 41BE | IF I! >= 0 THEN GOTO L_41BE | AGREE | negative-step branch of FOR I! ... TO 0 STEP StepDir3! |
| 0437E | 7d bf 4a | ShipHeading! (3B18) + #1, CINT, RT3F_5E n=8 -> 4392 43AA 43C2 43DA 43F2 440A 4422 443A | ON CINT(ShipHeading!+1) GOTO L_4392 .. L_443A | AGREE | |
| 043D6 | bb 70 9f | RT3E_89 coord (PutX! 9F70, PutY! 9F74); bx=ShipHead2 (6724); dx=3; RT3E_58 | PUT (PutX!, PutY!), ShipHead2, OR | KNOWN | verb 3 = PSET |
| 043EE | bb 70 9f | same, bx=ShipHead3 (67B8), dx=3 | PUT (PutX!, PutY!), ShipHead3, OR | KNOWN | verb 3 = PSET |
| 0444E | bb 70 9f | same, bx=ShipHead7 (6A08), dx=3 | PUT (PutX!, PutY!), ShipHead7, OR | KNOWN | verb 3 = PSET |
| 04451 | c3 | ret | RETURN | AGREE | |
| 0446F | bf de a5 | FMOV ViewMode! (A5DE) <- #1 | ViewMode! = 1 | AGREE | |
| 045AD | 74 9f cd | si=dx=I! (4566); +#1; CINT; RT3F_5D n=5 -> 45BE 45D5 45EC 4603 461A | ON CINT(I! + 1) GOSUB L_45BE .. L_461A | AGREE | |
| 0471D | 5e a5 be | FADD MyY! (89EC) + DY! (A55E) -> FSTORE MyY! | MyY! = MyY! + DY! | AGREE | |
| 04730 | bf 8c a6 | FMOV TurnDir! (A68C) <- #1 | TurnDir! = 1 | AGREE | |
| 0479C | c3 | ret (after call 1D61) | RETURN | AGREE | |
| 048B8 | 76 03 e9 | (tail jbe/jmp 48DB) Hull!(CINT(I!)) (8894) FCMP #1; jb 48BD else jmp 48CC | IF Hull!(CINT(I!)) >= 1 THEN GOTO L_48CC | AGREE | |
| 0492F | bf 0e 71 | (tail NEXT I! TO ShipsN9!) ARGPUSH 0x18; LOCATE exec 3 | LOCATE 24, 3 | AGREE | |
| 049E6 | e9 27 e2 | jmp 2C10 | GOTO L_2C10 | AGREE | |
| 04B53 | 8b f2 | si=dx=I! (4B30); FMOV ShieldNo! (9F98) | ShieldNo! = I! | AGREE | |
| 04BB7 | be 10 a0 | (tail FSTORE Ix!) FTEST Flag! (A010); je 4BBC else jmp 4BC8 | IF Flag! <> 0 THEN GOTO L_4BC8 | AGREE | |
| 04E9A | bb 18 00 | (tail PRINT SPC(15)) ARGPUSH 24; LOCATE exec 3 | LOCATE 24, 3 | AGREE | |
| 04F20 | bf aa 70 | (tail jmp 4D07) Cmd! (9F54) + #-1 -> FSTORE NewTarget! (A7DE) | NewTarget! = Cmd! - 1 | AGREE | |
| 04FA2 | 8b fe | (tail of IF) di=si=Command! (A754); si=bx=#4 (71CC, via 4F87) ; FMOV | Command! = 4 | AGREE | |
| 04FCC | bf 54 a7 | FMOV Command! <- #2 (6F54) | Command! = 2 | AGREE | |
| 04FFF | 74 03 e9 | (tail Flag!=1 je/jmp 500B) bx=-1 if Command!<4 (jae skip); cx=-1 if Command!>6 (jbe skip); or; jne 5004 else jmp 500B | IF NOT ((Command! > 6) OR (Command! < 4)) THEN GOTO L_500B | AGREE | |
| 0500B | 87 f2 cd | (tail FMOV) ret | RETURN | AGREE | |
| 050F3 | 03 e9 48 | Fn2Field!=56, Fn2Member!=J! (6F86); call 0333 = INT(m*100+f+1300.5) = FNIdx; CINT -> &G!; FnField!=37, FnMember!=J!; call 0301 = INT(G!(CINT(m*100+f+1300))+.1) = FNCrew; + #-3; FSTORE | G!(CINT(FNIdx(J!, 56))) = FNCrew(J!, 37) - 3 | AGREE | FN bodies 0301/0333 and slots 7174/7178, 7188/718C confirmed |
| 051F1 | bf 04 8a | FMOV MyHeading2! (8A04) <- ShipHeading! (3B18) | MyHeading2! = ShipHeading! | AGREE | |
| 05284 | 87 f7 cd | (tail FMOV) NumEnemy! + #-1 -> FSTORE ShipsN10! (A7F2) | ShipsN10! = NumEnemy! - 1 | AGREE | |
| 0528D | be bc 8b | FLOAD #0; jmp 52E6 (store I!, FCMP ShipsN10!, jbe 5290); increment +#1 at 52DD | FOR I! = 0 TO ShipsN10! | AGREE | step 1 |
| 053E0 | 74 03 e9 | bx=-1 if Command!>2; dx=-1 if Command!<7; dx&=bx; ax=-1 if G!(CINT(Member!+8))<>1; ax/=dx; dx=-1 if Command!=#8 (si=cx=Command!, di=bx=#8); dx/=ax; je 53E5 else jmp 5A44 | IF (Command! = 8) OR ((G!(CINT(Member!+8)) <> 1) OR ((Command! < 7) AND (Command! > 2))) THEN GOTO L_5A44 | AGREE | |
| 05534 | 03 e9 32 | (tail je/jmp 555A, call 1D8C) ARGPUSH 0x16; LOCATE exec 3 | LOCATE 22, 3 | AGREE | |
| 05816 | bf d8 71 | 57DD FADD GunRec!+#6 (71D8) CINT -> G! elem; 57FB FCMP Command! vs #7 -> DX bool; CX=1-DX; CSNG; FMUL G!elem*FAC; FSTORE Shots! (A83C) | Shots! = G!(CINT(GunRec!+6)) * (1-(Command!=7)) | AGREE | |
| 0588B | e9 0e 00 | tail jmp 5894 (prev IF); 5886 SI=DI=#1 (6F4A); FMOV FuelUse! (A720) | FuelUse! = 1 | AGREE | |
| 05914 | bf 10 a0 | FMOV Flag! (A010) <- #0 (6F82) | Flag! = 0 | AGREE | |
| 05963 | bb 4c a8 | items of prev PRINT ("making"; Hits!; "hits"); 595A FCMP Hits! vs #1; jae skip, else jmp 5A16 | IF Hits! < 1 THEN GOTO L_5A16 | AGREE | |
| 059ED | bb a6 a8 | PRINT "Hull breached."; (prev); 59ED jmp 5A16 | GOTO L_5A16 | AGREE | |
| 05ABF | be 34 a8 | FTEST IsMissile! (A834); je 5AC4 else jmp 5AC7 | IF IsMissile! <> 0 THEN GOTO L_5AC7 | AGREE | |
| 05B13 | cd 3f 7d | 5AFA tail of NEXT EnShip! (vs ShipsN11!, jbe 5A8C); L_5B07: FADD TimeSlot!+TimeStep! (A7FA+A7F6); L_5B10: FSTORE TimeSlot!; 530E jumps to 5B10 with FAC=GunMax!+1 (5305); 5B16-5B36 sign-of-step test vs 0 -> body 5312 | TimeSlot! = FAC | DISAGREE | Missing effect: the increment TimeSlot!+TimeStep! (5B07-5B0D) is rendered nowhere (L_5B07 prints empty), and 0530E `GOTO L_5B10` drops FAC=GunMax!+1. Correct: `FOR TimeSlot! = GunMax! + 1 TO 0 STEP TimeStep!` (5305-530E, TimeStep! = GunRange!*-0.25 at 5302) ... `NEXT TimeSlot!` here (or at least `TimeSlot! = TimeSlot! + TimeStep!` on the 5B07 path) |
| 05B1C | be f6 a7 | FTEST TimeStep!; jb 5B21 else jmp 5B2E | IF TimeStep! >= 0 THEN GOTO L_5B2E | AGREE | (part of the FOR..STEP test above) |
| 05B74 | e9 d9 f7 | tail jmp 5312; BX=(PlayerFired!=1); T92=RND*#100; FAC=EnAttitude!*#25+#-25 (A8F8); FCMP T<FAC -> CX; or; jne 5B79 else jmp 5B81 | IF NOT ((RND*100 < EnAttitude!*25-25) OR (PlayerFired!=1)) THEN GOTO L_5B81 | AGREE | |
| 05ED3 | be f0 a8 | idx=CINT(EnShip!)*6+CINT(EnSlot!) into WeaponOK! (8A1C); AX=(elem=#1); DX=(IsMissile!=0); imul; +2; CSNG; FSTORE same elem | WeaponOK!(i) = (WeaponOK!(i)=1)*(IsMissile!=0)+2 | AGREE | |
| 05F72 | bb 3a a9 | PRINT "Shields absorb damage." +NL (prev); jmp 62A2 | GOTO L_62A2 | AGREE | |
| 05F7B | bf 54 a9 | FMOV DmgExp! (A954) <- #0.7 (8BAC) | DmgExp! = 0.7 | AGREE | |
| 05F8F | bf 0a a9 | FSUB Armor!(192C)-Damage!(A90A); INT; FSTORE Armor! | Armor! = INT(Armor! - Damage!) | AGREE | |
| 06002 | e9 ea 00 | tail jmp 60D0; RND; FPOW ^DmgExp!; FMUL #25; INT; FSTORE HitSlot! (A958) | HitSlot! = INT((RND ^ DmgExp!) * 25) | AGREE | |
| 06058 | e8 8e b6 | call 16E9 | GOSUB SUB_16E9 | AGREE | |
| 06094 | bb 72 a9 | PRINT "Hull breached." +NL (prev); FMOV 189C (G!(19)) <- #2 | G!(19) = 2 | AGREE | |
| 0620A | bb 18 00 | ARGPUSH 0x18; LOCATE exec 3 | LOCATE 24, 3 | AGREE | |
| 062B7 | be 4a 6f | FLOAD #1; jmp 62C6 (FSTORE I!; FCMP vs DelayN3! (A9AA); jbe body 62BA) | FOR I! = 1 TO DelayN3! | AGREE | |
| 0643F | c3 | ret after Y2! = DY!*0.55+Y1! (DI=BX=#0.55 from 641D) | RETURN 'with FAC = DY!*0.55+Y1! | AGREE | |
| 06467 | e9 55 ff | tail jmp 63B6; FTEST DX! (A55A); ja 646C else jmp 6478 | IF DX! <= 0 THEN GOTO L_6478 | AGREE | |
| 0647E | e9 09 00 | tail jmp 6481; FMOV EdgeX! (A9C6) <- #17 (9FCC) | EdgeX! = 17 | AGREE | |
| 065A5 | cd 3f 7b | tail FMOV Shooter!<-ShieldNo!; FMOV EnShip! (A8F0) <- #5 (71D4) | EnShip! = 5 | AGREE | |
| 0661A | cd 3f 7d | tail store EnArmor!(i)-=Damage!; DX=EnArmor! elem (CINT ShieldNo! 65FC); FTEST; jae ret else jmp 6620 | IF EnArmor!(CINT(ShieldNo!)) < 0 THEN GOTO L_6620 | AGREE | |
| 067A4 | cd 3d 34 | T92=RND*#22; DX=CINT(ShieldNo!) (676A); FAC=Hull!(8894)+#10; FCMP T?FAC; jb continue else jmp 67E7 | IF RND*22 >= Hull!(CINT(ShieldNo!))+10 THEN GOTO L_67E7 | AGREE | |
| 067E4 | e9 0b 00 | tail jmp 67E7; BX=ShieldNo!*4 (678E, unchanged); +8A08 EnStatus!; DI=elem; SI=#1 (67D1) FMOV | EnStatus!(CINT(ShieldNo!)) = 1 | AGREE | |
| 0688E | bb ba a9 | coords X2!,Y2!; BX=771E Boom3; `xor dx,dx` -> verb 0 = OR | PUT (X2!, Y2!), Boom3, PSET | KNOWN | Verb 0 is OR, not PSET (`33 d2` at 688C). Correct: `PUT (X2!, Y2!), Boom3, OR`. Mirror of the known verb-map defect (0/3 swapped); current SPBATTLE.bas.md L2157 already reads OR  [lane verify: reclassified KNOWN - mirror of the verb-map defect (verb 0 shown as PSET in the sampled text); current SPBATTLE.bas.md line 2157 already renders OR]|
| 068E9 | bb ba a9 | X2!,Y2!; BX=82BE SmallBoom2; DX=4 XOR | PUT (X2!, Y2!), SmallBoom2, XOR | AGREE | |
| 0691D | bb ba a9 | X2!,Y2!; BX=720C SaveArea; DX=3 PSET | PUT (X2!, Y2!), SaveArea, OR | KNOWN | verb 3 rendered OR (known defect) |
| 06990 | bb ba a9 | X2!,Y2!; BX=7D6E BigBoom3; DX=4 XOR | PUT (X2!, Y2!), BigBoom3, XOR | AGREE | |
| 06A80 | bf f6 a9 | FAC=SndDur!(6F5E)*#1.5; SOUND BX=0x1E61=7777, dur FAC (DX=1A); exec BX=DX=AX=-1 (from 6A54) | SOUND 7777, SndDur! * 1.5 | AGREE | |
| 06B49 | e8 ee 03 | call 6F3A (else branch of IF Damage!>0) | GOSUB SUB_6F3A | AGREE | |
| 06B9A | 8b df | FSUB Y2!(A9BE)-Y1!(A9B6); FSTORE DY! (A55E) | DY! = Y2! - Y1! | AGREE | |
| 06C71 | e9 69 ff | tail jmp 6BD4; FTEST Flag!; jne 6C76 else jmp 6AE3 | IF Flag! = 0 THEN GOTO L_6AE3 | AGREE | |
| 06E12 | be 5e 6f | BOOL SndDur!; jne 6E17 else jmp 6E7B | IF (SndDur! = 0) THEN GOTO L_6E7B | AGREE | |
| 06ECC | bf 4a 6f | (tail SOUND exec); FADD N!+#1 -> N!; FCMP vs #7; jbe 6E92 (FOR N! = 1 TO 7 at 6E8F) | NEXT N! | AGREE | |
| 06F48 | bf cc 71 | FADD X2!+#4; FSTORE ExpX! (AA2A) | ExpX! = X2! + 4 | AGREE | |
| 070AB | 90 | FOR I! body (init #340 jmp 70B6): G!(CINT(I!+#30)) elem -> DX; SGN(G!(CINT(I!))); FMUL; +WtSum!; FSTORE WtSum! | WtSum! = G!(CINT(I!+30)) * SGN(G!(CINT(I!))) + WtSum! | AGREE | |
| 0729E | 81 3e 0e a0 | cmp NumIn% (A00E), 0x270F=9999; jg 72A3 else jmp 72A9 | IF NumIn% <= 9999 THEN GOTO L_72A9 | AGREE | |
| 072E5 | e8 38 a4 | call 1720 | GOSUB SUB_1720 | AGREE | |
| 073B2 | bf f8 71 | FCMP EnBoardArg!(8B80) vs #23 (71F8); je 73B7 else jmp 73C0 | IF EnBoardArg! <> 23 THEN GOTO L_73C0 | AGREE | |
| 073E4 | 90 | FOR J! body (init #110 jmp 7402): G!(CINT(J!)) vs #1; je 73E9 (=2) else jmp 73F9 | IF G!(CINT(J!)) <> 1 THEN GOTO L_73F9 | AGREE | |
| 07421 | 89 5e 16 | data after last RETURN 7412 (not code); 7421 bytes 00 01 disassemble as add [bx+di],al | ' asm add byte ptr [bx + di], al | AGREE | non-code padding; 741E bytes 89 5E 16 inside this range are not rendered (harmless, header documents the tail as data) |
| 0743B | 00 00 | data bytes 00 00 | ' asm add byte ptr [bx + si], al | AGREE | non-code |
| 07445 | 00 00 | data bytes 00 00 | ' asm add byte ptr [bx + si], al | AGREE | non-code |
| 07449 | 00 00 | data bytes 00 00 | ' asm add byte ptr [bx + si], al | AGREE | non-code |
