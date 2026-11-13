# STARPORT — BASIC-style pseudocode (lane mod-starport) — COMPLETE

Evidence: `decode/listings/STARPORT.lst` (regenerated after rt-naming), `decode/data/MODULE_CONSTANTS.md` (STARPORT.EXE section), `decode/data/tools/_STARPORT.json` (literal table, code end 0xAD00), `decode/brun30/RT_LEDGER.md` (incl. the corrected 3F_B7 INPUT type bytes and the 3E_58 PUT verb map), `decode/data/SPRITES.md`, `decode/data/DATA_FILES.md` (NAME, MISSION, CHARINFO, CHARNAME, INFO.BAS); read 2026-10-15. The codex draft `STARPORT.draft.md` served only as a literal map; every statement is re-derived from the listing by `decode/pseudo/tools/qb2bas.py` (commit 541b493 or later: PUT verbs 0 OR/1 AND/2 PRESET/3 PSET/4 XOR, INPUT types 01 integer/02 single/03 double/04 string) run twice with `--names decode/pseudo/STARPORT_names.json --tempbase A87C`. This file = `decode/pseudo/STARPORT_header.md` + the generated body. Screens and flows: `decode/pseudo/STARPORT_SCREENS.md`.

## Conventions

Same as `SPACE.bas.md` / `SPBATTLE.bas.md`: labels = offsets, `SUB_XXXX` = near-call targets, `G!()` = the COMMON array at DS 0x1850 (fixed-index elements print as `G!(n)`), compiler temp slots T0..T31 at 0xA87C + 8n (the 256-byte block ending the 260-byte gap 0xA878..0xA97C in the literal table; T0 = 0xA87C is the SPPIC BLOAD offset at 10B7 = `&H4926`) rendered as the expression they hold, FOR/NEXT reconstructed (the step, when not 1, is printed on the `NEXT x STEP s` line, never on the FOR line), bool idioms as relational values.

DEF FN accessors inlined at every call site:

| FN | definition | body |
|---|---|---|
| `FNCrew(m, f)` | `INT(G!(m*100 + f + 1300) + .1)` | SUB_0797 |
| `FNIdx(m, f)` | `INT(m*100 + f + 1300.5)` | SUB_07C9 |
| `FNCredits(0)` | `INT(CreditsHi!*30000 + CreditsLo! + .5)` (dummy argument) | SUB_07E8 |

Price/stat tables come from INFO.BAS (`BLOAD Drive$+"INFO.BAS", &H51F6`, 020F): single arrays whose field f of item i sits at `base + (i + f*count)*4`, so the body shows e.g. `GunTable!(CINT(GunIdx!) + 100)` = price column of 25 guns. The Arrays table names each table and lists its columns as used. Ship pictures come from SHIPPICS.BAS (`&H4F9E`), the starport picture from SPPIC-n.BAS (`&H4926`), the medal animation from "fire" (`&H65AE`, FIRE.BAS).

## Key map

`SUB_22C4`: letters -> `Cmd!` 1.. (A = 1), ENTER -51, SPACE -32, ESC -37 (used by the pick lists), accepted within `CmdMin!..CmdMax!`. `SUB_1F14` crew picker: ENTER 0, P 1, C 2, 1..6 -> 3..8 (existing members only). `SUB_28BA` Y/N, `SUB_2950` typed YES/NO. `SUB_24F4` line editor (digits only when `MaxLen! = 3.9`). `SUB_A422` single digit. Main menu dispatch 227D: A Personnel (L_543C), B Buy (L_37D0), C Sell (L_2BB3), D Dry Dock (L_667D), E Training (L_7C01), F Fuel (L_2396), G Game Save (L_9AA7), H Headquarters (L_7515), I Inspect (L_83FC), K Christen (L_9F45), L Leave (L_9D9C), M Medical (L_6E43), T Time Delay (L_A8A7).

## G!() layout used by STARPORT (in addition to the SPACE / SPBATTLE tables)

| indices | meaning | evidence |
|---|---|---|
| 0..6 | ship equipment slots set to 1 with a new ship | 2B75-2B99 |
| 20..22 | drop-ship parts from the ship table | 2A16-2A55 |
| 28 | `ShipTable!(+108)` of the bought ship | 2B6C |
| 43 | ship index + 1 (0 = no ship) | 2AFA, 3509, 37B2, 8D50, 9E12 |
| 60/61, 63/64, 62, 65 | missile killer / defence hardware type, %, weights x10 | 4EBB-4EE9, 4FBE-4FEC |
| 63 + 3n (n = 1..4) | shield slots: type, +1 strength, +2 weight x10; flag `G!(n+6)` | 4D1E-4DE9, A4C5-A55D |
| 100..109 | special bonus flags (1 -> paid, 2) | SUB_13DC |
| 110..159 | mission flags: 0 none, 1 active, 2 completed (paid -> 3) | 18F7-1928, 754B-7933 |
| 160..209 | espionage finds (1 found -> 2 rewarded) | 18AF-18D5, 98D2 |
| 210..309, 310..315 | kill list, pointers | 1779-183E |
| 320..339 | tow list (type / tonnage) | 184D-1899 |
| 340..369 | gun ammo stock (gun type), weight at +30 | 4B3F-4C44, 3184 |
| 400..499 | cargo items; `CargoValue!` on sale | 3241 |
| 500..554 | reload counts per weapon type (rebuilt by SUB_9FED / SUB_A596); `G!(541+row)` list map | A00E-A093, A80B |
| 683 + 7n (n = 1..6) | gun records: type, +1 damage, +2 ammo capacity, +3 weight x10, +4 accuracy, +5 loaded, +6 shots; flag `G!(n+10)` | 4895-4A7D, 30B8 |
| 726 + k (k = 16..32) | miscellaneous items shown by "E-Miscellaneous Items" | 99BC-9A04 |
| 742..758 | set to 1 in the test setup | 0FA4 |
| 800..1088 (step 12) | squad weapons: type, +1 max damage, +2 rate of fire (shots per round), +3 loaded ammo (= +4 at purchase), +4 magazine capacity, +5 weight x10, +6 damage type 1..12, +7 to-hit bonus, +8 intimidation factor, +9 owner, +10 range, +11 weapon/skill type 1..4 (column meanings from the PLBATTLE use sites 06CF4/067ED/0669A/068A6/0405B/056B3/06924 and manual p12-13) | 3CFF-3EC0 |
| 1100..1397 (step 3) | ammo: type, +1 weight x10, +2 owner | 409E-40F3 |
| 1300 + 100m + f | crew records: 0..6 attributes, 5 esper potential (> 50 = Esper allowed), 7..99 cleared at recruitment, 8 move, 9 training sessions due, 10/11 bonuses, 12 max move, 13 max carried, 14 carried, 15/16 HP, 17..28 skill levels (`Skill$(1..12)`), 29 age days, 31 status, 32 first weapon record, 34 rank, 35 class, 36 last aging year, 41..43 sighting hardware, 44..46 hand weapon, 47..49 armor suit, 50 clones, 54 = attr5/25, 59 medal flag, 90/91 item numbers | FNCrew/FNIdx sites |
| 2199..2212 | last-mission / last-visit year and day (`PayYear!`, `PayDay!`, `VisitYear!`, `VisitDay!`) | 10F5-1103, 19BE, 1BCF |
| 2230..2244 | mission parameters read from the MISSION record (15 integers) | 765E-768A |
| 2261/2262 | saved mission codes restored into `MissionCodeA!/B!` | 10C3, 76B9 |
| 2264 | tribute counter (reset with a new mission) | 7797 |
| 2265 | save lock after two consecutive wrong rule-book answers (Tries! starts at 1, retries while <= 2) | 9AAF-9CDB |
| 2300, 2597 | test setup values | 092B, 0934 |

## Manual corrections (translator limitations; the body text is as generated)

- 4895, 4945, 4B04, 4CC2, 4D1E: `word ptr [0xae70]` inside `imul` expressions is the integer variable `NumIn%` (the translator resolves absolute memory operands only in `mov`/`cmp`): read `7 * NumIn% + 683` and `3 * NumIn% + 63`. Request filed in STATUS.md.
- 0ACC8 `N(?) = 0` and 0ACCB `GOSUB SUB_0AAE` are stray renders of the padding/data bytes after the error-handler `END` at ACC2 (`SUB_0AAE` does not exist); the `' asm` lines up to ACFE are data.
- Unreferenced blocks (no `call`/`jmp` reaches them): 08A7-1071 test-ship setup (reached only through the never-set `DebugLoad!`), 22BB-22C1 (`Years! = 74`), 2920-294F (" is dead."), 7805-7936 (`INPUT "TRY WHICH MISSION (1-50)?"; Flag!` mission chooser - the INPUT item type 02 renders as the single `Flag!`), 793F-7986 (medal reset), A40A-A421 (duplicate case).
- `A_4534$` is named `MiscItemName$` here; SPACE_names.json calls the same NAME array `HandWeaponName$` (SPACE prints it under "Hand Weapon" for the items in G!(2300..2597)); STARPORT shows those items are the 11 "F-Miscellaneous" purchases and the 6 hand weapons are `A_44CC$` - noted in STATUS.md for the SPACE owner.

## Unknowns

No runtime call is left unrendered. Interpretation points marked M in the Variables table: the INFO.BAS column meanings are inferred from their use (columns written into record fields without a printed label keep a `field n` description); `G!(28)`, `G!(2300)`, `G!(2597)`, `G!(742..758)` are written without a readable purpose; `A6D4` `PriceFactor!` is 1.2 at all three starports.
