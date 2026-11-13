# SPACE — BASIC-style pseudocode (lane mod-space) — COMPLETE

Evidence: `decode/listings/SPACE.lst` (regenerated after rt-naming), `decode/data/MODULE_CONSTANTS.md` (SPACE.EXE section), `decode/data/tools/_SPACE.json` (string/numeric literal table, code end 0x99F0), `decode/brun30/RT_LEDGER.md`, `decode/data/SPRITES.md`, `decode/data/DATA_FILES.md`; read 2026-10-15. Generated mechanically by `decode/pseudo/tools/qb2bas.py` (run twice: the first pass writes `_space_try.md.vars.json` with the variable kinds the second pass uses) with `--names decode/pseudo/SPACE_names.json --tempbase A860`; this file = `decode/pseudo/SPACE_header.md` + the generated body. Every statement carries its listing offset; labels `L_XXXX` are jump targets, `SUB_XXXX` near-call targets (GOSUB bodies). Screens and flows: `decode/pseudo/SPACE_SCREENS.md`.

## Conventions

- Names come from `SPACE_names.json`; each has an `_why` evidence string (reproduced in the Variables table). Unnamed addresses would print as `N_xxxx!` (single at DS xxxx), `S_xxxx$` (string), `I_xxxx%` (integer), `A_xxxx` (array by base address); after this pass none remain in the body.
- `G!()` is the 51x51 COMMON single array at DS 0x1850 (CHARINFO.BAS = the whole game state). COMMON scalars live inside it: a variable at DS `a` with 0x1850 <= a < 0x40F4 is `G!((a-0x1850)/4)`; named ones (`Fuel!` = G!(2200), `SectorX!` = G!(2216) ...) give the index in their evidence, unnamed ones print as `G!(n)` directly.
- `DEF FN` accessors (bodies at SUB_03E2/0414/0452) are inlined at every call site by the translator (the argument stores that precede each `call` are folded into the call):
  - `FNCrew(member, field) = INT(G!(member*100 + field + 1300) + .1)` — crew record field (member 1..8, field 0..99);
  - `FNIdx(member, field) = INT(member*100 + field + 1300.5)` — index of that field, used as an assignment target `G!(CINT(FNIdx(m, f))) = ...`;
  - `FNRound2(v)` = `INT(v*100 + 1 - (INT(v*100 + 1) = 9)) / 100` — two-decimal rounding of the planet readouts (mass, gravity, diameter, density; body 0452-0490, argument `Val!`). The credits sum `INT(CreditsHi!*30000 + CreditsLo! + .5)` is the body at 0433, which no code calls (SUB_16A6 does the credits arithmetic inline).
- Compiler temp slots T0..T5 (`RT3F_71 #80..#85`, DS 0xA860 + 8*n per RT_LEDGER.md) are rendered as the expression they hold; the three addresses that appear as plain operands (0xA860 T0, 0xA870 T2, 0xA878 T3) therefore never show up as variables (the previous pass had misnamed them `ShipBankOff!`/`PicOff!`).
- FOR/NEXT are reconstructed from the compiled pattern (`jmp` to the test, counter store, compare, jump back); `NEXT x STEP n` shows a non-unit step. Conditions after FCMP/FTEST are rendered as `IF ... THEN GOTO`; `jcc L1 ; jmp L2 ; L1:` pairs are folded into `IF NOT cond THEN GOTO L2`. Boolean idioms (`mov R,0 ; jcc ; dec R`) print as BASIC relational values (-1/0), e.g. `(RND < 0.5) * 2 + 1`.
- 2-D arrays: an element index of the form `x + N*y` is printed `A(x, y)`; the first dimension (N) is noted in the Arrays table (`PixColor!`, `PixObj!`, `PixCol!` are 16 x 2).
- Integer array reads through `[reg + base]` (also with negative displacements that wrap: `[di - 0x5FF4]` = DS 0xA00C) print as `Galaxy%(i)`, `HeadX%(i)`, `PicBuf(i)`.
- `RETURN   'with FAC = expr` notes the value left in the floating accumulator at a `ret` (meaningful only for the DEF FN bodies).

## Key map (SUB_212C / SUB_1C58)

See `SPACE_SCREENS.md` "Keys". Summary: extended keys -> `Cmd!` 1..11 (2 Up, 5 Left, 7 Right, 10 Down), letters -> 12 (A) .. 37 (Z), `Cmd! = 40` = "Pilot or ship not ready"; sub-menus use SUB_1C58 (A = 1 .., ENTER = -51, SPACE = -32). Main dispatch: 1C13 (cursor keys) and 1C39 (`ON Cmd!-11 GOTO`: A galaxy scan, B switch, C computer, D sector scan, E equip, F fix, H heal, I inspect, J time delay, L load).

## G!() layout as used by SPACE (index ranges, evidence = statements that read/write them)

| indices | meaning | evidence |
|---|---|---|
| 0, 3 | ship / pilot readiness flags (2 = not ready, must be 1) | 2224, 2273 |
| 0..6, 19..22 | ship equipment condition per slot (0 none, 1 ok, 2 broken, 3 unfixable) with `EquipName$(slot)` | 4523-4537, 78CA-78E5, 45C9-46D2 |
| 5 | computer working (= 1) | 5204 |
| 7..10 | shields 1..4 strength (arcs on the ship panel) | 1F25; also via 67+3i at 7A1A-7A5B |
| 11..16 | gun I fitted flags (`G!(I+10) = 1`) | 1770, 8252 |
| 17 | drive flag (MaxMove! = G!(63) when 1) | 8112 |
| 20..22 | drop-ship parts fitted | 8D58 |
| 44..46, 48, 50..53, 55 | BaseMove!, BaseWt!, MaxWt!, CargoWt10!, TotalWt10!, Defence!, MaxFuel!, ArmorDiv!, Armor! | SUB_7F9D, 7717-7861 |
| 60..75 (step 3) | ship items: type, ?, weight | 7FAC-7FEB |
| 60/61, 63/64 | missile killer fitted/%, defence hardware fitted/% | 7983, 79D9 |
| 78, 79 | CreditsHi!, CreditsLo! (credits = hi*30000 + lo) | SUB_16A6 |
| 82, 85, 86, 88, 89, 93 | CurMove!, DriveCfg!, StdDelay!, Delay!, UseEGA!, SoundOff! | 7861, 0064, 8327, 8346, 1032, 018C |
| 110..159 | mission flags: 1 active, 2 completed | SUB_90D1, SUB_8CC2, 5001-502E |
| 160..259 | espionage finds (1 = found) | 60BB-60C5 |
| 210..259 / 260..309 | kill list: ship type / tonnage (50 entries, ring) | SUB_548D, 1D28-1D3C pointers |
| 310..315 | KillStartAll!, KillPtr!, KillStartMission!, Kills!, KillStartPort!, Tonnage! | 52EA-535C, 52FF, 531E |
| 320..329 / 330..339 | tow list: ship type / tonnage | 55E0-5627 |
| 340..369 | gun ammo stock (gun type per slot) | 17AC-17DB, 8273-82A2 |
| 400..499 | cargo items held (1 = held) by `ItemName$` index | 5EDC-5EE6, 637B, 7B0A-7B48 |
| 500..554 | reload counts per weapon type (rebuilt in L_974E) | 976F-9807 |
| 683 + 7i (i = 1..6), 690 + 7i | gun records: type, +2 ?, +5 loaded ammo | 1721-180F, 8208-82DA, 95B7 |
| 800..1088 (step 12) | squad weapons: type, +3 condition (-1 broken, -2 repairing), +5 weight, +9 owner | 4935-498F, 7CCB-7D38, 83E2-842F, 9838-9964 |
| 1100..1397 (step 3) | ammo: type, +1 weight, +2 owner | 7D5C-7DCA, 8462-84AF, 97AA-9807 |
| 1300 + 100m + f | crew records, m = 0 (ship/unused) .. 8; fields used: 0 exists, 8 cur move, 10 hit bonus, 11 defence, 12 max move, 13 max wt, 14 cur wt, 15 HP, 16 max HP, 17..28 skills (`Skill$(1..12)`), 19 investigation skill, 20 medical, 23 comms, 26 repair, 27 esper level, 29 age (days), 31 status (0 dead 1 okay 2 rad), 34 rank, 35 class, 39 carried wt, 41..47 armor/weapon slots, 48/49 armor cur/max, 50 clones, 55 ?, 90/91 ? | FNCrew/FNIdx call sites, 6EC2-75AC |
| 2200..2266 | COMMON scalars of the ship: Fuel!, Years!, Days!, Hours!, ChainArg!, SectorX!/Y!, CursorCol!/Row!, SysCurX!/Y!, ShipHeading!, EntryMode!, Terrain!, Surprise!, mission parameters (2234..2244), Gravity10!, Breathable!, StationNo! | Variables table |
| 2230 + zone | base enemy strength per zone | 9080 |
| 2300..2597 (step 3) | personal items: type, +1 weight, +2 owner; types 1 medkit, 2 repair kit, 3/4 stealth items | SUB_247C, 7DEE-7E5C, 84E2-852F |

## Manual corrections (translator limitations; the body text is as generated)

- 21DF: generated `IF NOT ((Cmd! > 37) OR (Cmd! >= 12)) THEN GOTO L_2139`; the listing (21C0-21E1: `mov bx,0 ; jae ; dec bx` = `Cmd! < 12`, `mov dx,0 ; jbe ; dec dx` = `Cmd! > 37`, `or`, `je ret`) means `IF (Cmd! < 12) OR (Cmd! > 37) THEN GOTO L_2139` (reject anything that is not a letter). Translator request filed in STATUS.md.
- 3E38 `PRINT "Star"; -StarNo!` and 576B `LEFT$(STR$(-PlanetNo!(Idx!)), 2)`: the negations are real (`RT3F_AF`/`RT3F_B1`); STR$ of a negative number has no leading space, so the screen shows e.g. `Star-3` / `Planet-2`.
- 25AA-25D9 and 25E0-2625 are reachable only by fall-through from SUB_2544's `GOTO L_2544` loop (never) - dead code blocks (a `" is dead."` message and a three-letter yes/no input).
- 2129 `GOTO L_1B5D` after SUB_2056's last RETURN and 019F7 / 08B32 / 08BC5 (`RETURN` after `RETURN`) are compiler padding between routines.
- 0x99B4-0x99EE after the last `ret` is data (the `' asm` lines at the end).

## Unknowns

No runtime call is left unrendered (see the table at the end). Open points of interpretation (all marked M in the Variables table): `Difficulty!` (0xAB8C) is only known from its use as an item range / enemy strength factor; the meaning of `G!(0)` vs `G!(3)` ("Pilot or ship not ready") is not separable from SPACE alone; crew fields 55, 90, 91 and ship-item field +1 are read without a printed label.
