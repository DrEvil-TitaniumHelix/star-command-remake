# SPBATTLE — BASIC-style pseudocode (lane mod-spbattle) — COMPLETE

Evidence: `decode/listings/SPBATTLE.lst` (regenerated after rt-naming), `decode/data/MODULE_CONSTANTS.md` (SPBATTLE.EXE section), `decode/data/tools/_SPBATTLE.json` (literal table, code end 0x7450), `decode/brun30/RT_LEDGER.md`, `decode/data/SPRITES.md` (SPBTSH.BAS, ENSHP-n.BAS, SPACESH.BAS inventories), `decode/data/DATA_FILES.md` (ENCLIST, ENCTABLE); read 2026-10-15. The codex draft `SPBATTLE.draft.md` was used only as a map of the string literals; every statement below is re-derived from the listing by `decode/pseudo/tools/qb2bas.py` run twice with `--names decode/pseudo/SPBATTLE_names.json --tempbase 6FAA` (the first pass writes `_spb_try.md.vars.json`). This file = `decode/pseudo/SPBATTLE_header.md` + the generated body. Screens and flows: `decode/pseudo/SPBATTLE_SCREENS.md`.

Translator note: the shared `qb2bas.py` initially crashed on `imul word ptr [bp - 0xc]` (SPBATTLE 0F2C); mod-inside committed the fix (c48ab36, `qb2bas done` in STATUS.md) and the body was regenerated with the shared translator; regenerated again after the PUT verb-map correction (541b493: 0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR), which changed the verb word of every PUT (enemy/explosion/hit frames are OR, headers/player ship/saved areas PSET, the scan-map cell clear PRESET).

## Conventions

Same as `SPACE.bas.md`: labels = offsets, `SUB_XXXX` = near-call targets, `G!()` = the COMMON array at DS 0x1850 (fixed-index elements print as `G!(n)`, named COMMON scalars give their index in the Variables table), compiler temp slots T0..T24 at 0x6FAA + 8n (identified like SPACE's: the 268-byte gap 0x6F9E..0x70AA in the literal table, T0 = 0x6FAA used as the SHIP-n BLOAD offset at 0112 = `&H65FC`, T1 = 0x6FB2 as the ENSHP BLOAD offset at 0CAB = `&H6AA2`) are rendered as the expression they hold, FOR/NEXT reconstructed (the step, when not 1, is printed on the `NEXT x STEP s` line, never on the FOR line), bool idioms as relational values, `RETURN 'with FAC = ...` = value left in the accumulator.

DEF FN accessors inlined at every call site (bodies at the SUB_ addresses):

| FN | definition | body |
|---|---|---|
| `FNCrew(m, f)` | `INT(G!(m*100 + f + 1300) + .1)` crew-record field | SUB_0301 |
| `FNIdx(m, f)` | `INT(m*100 + f + 1300.5)` index of that field | SUB_0333 |
| `FNKey` | `INT(G!(78)*30000 + G!(79) + .5)` (no arguments) | 0352 (never called here) |
| `FNMod8(a)` | `a MOD 8` (heading wrap) | SUB_0CB1 |
| `FNDist(a, b)` | distance between ships a and b (5 = the player) | SUB_0CD1 |
| `FNAngle(a, b)` | bearing a -> b in degrees | SUB_0D2A |
| `FNInView(a)` | ship a inside the visual window | SUB_0DE2 |
| `FNNorm(a)` | angle to -180..180 | SUB_0E81 |
| `FNCanHit(a, b)` | gunner a (0..5 = member 3..8) can hit ship b: distance < 10, `ABS(ArcAngle!(a) - bearing + heading*45) < 60.5`, ship active, in view | SUB_0EAC |
| `FNSize(a)` | `EnTonnage!` (the same scalar for every enemy) or `BaseWt!` for the player (a = 5) | SUB_0FED |
| `FNScale(a)` | sprite scale factor by size | SUB_1033 |
| `FNShotX(a, b)` / `FNShotY(a, b)` | screen origin of weapon slot a of ship b | SUB_10B2 / SUB_1150 |

Per-enemy-ship state is a set of parallel arrays indexed 0..NumEnemy!-1 (`Hull!`, `EnArmor!`, `EnFuel!`, `EnX!`, `EnY!`, `EnHeading!`, `EnStatus!`, `CanMove!`, `CanTurn!`, `EnDefence!`, `Missiles!`) plus the 2-D `Shield!(facing, ship)` and the 6-slot `WeaponOK!`/`WeaponDmg!` (index `ship*6 + slot`; the translator's 2-D detection only recognises the `x + N*y` form, so these print with the explicit index). The player ship is index 5 in `FNDist`/`FNShotX` and sits at grid (`EnX!(5)`, `EnY!(5)`; the decode had rendered these direct operands as scalars `MyX!`/`MyY!` - sweep-folded); screen = grid*8 - (96,16) in the visual window, grid*5 + (-23, 24) on the scan map.

## Key map

| reader | keys | `Cmd!` |
|---|---|---|
| SUB_1C3B (movement phase) | extended keys -> scan code - 70 (2 Up, 5 Left, 7 Right, 10 Down); letters A..Z -> 12..37; cursor keys refused with "Pilot or ship not ready" (`Cmd! = 40`) unless member 1 is alive with field 17 > 0, `Fuel! > 0`, `G!(0) = G!(3) = 1` | dispatch 33A0: Up/Left/Right/Down move, A rotate CCW, B rotate CW, C enemy report, D visual, E skip, F switch, G time delay, H hyperspace |
| SUB_1857 (menus) | letters -> 1.. (A = 1), ENTER -51, SPACE -32, accepted within `CmdMin!..CmdMax!` | approaches 1..6, objectives 1..4, targeting 1..23 |
| SUB_1FD6 | Y/N | `YesNo!` |
| SUB_15A6 | ENTER 0, P 1, C 2, 1..6 -> 3..8 | `Member!` |

## G!() layout used by SPBATTLE (in addition to the SPACE table)

| indices | meaning | evidence |
|---|---|---|
| 1 | helm/engines flag, must be 1 to rotate | 4794 |
| 2 | life support ok (1) | 2C3A, 3024 |
| 4 | radio fitted | 2166 |
| 7..10 | shield fitted flags (facing 0..3) | 5E06, 1A37 |
| 11..16 | gun fitted flags (member m uses `G!(m+8)`) | 4A6E, 53E0 |
| 18 | missile killer active | 51C3 |
| 19 | hull state (2 = breached) | 6094, 136A |
| 60/61, 63/64 | missile killer / defence hardware fitted and % | 51C3, 51E8 |
| 67, 70, 73, 76 | shield strengths (`67 + 3f`) | 5E06, 136A, 7A5B in SPACE |
| 109 | special flag set when `EnBoardArg! = 23` | 73BD |
| 110..159 | mission flags (1 active -> 2 done by SUB_73A9) | 73C6 |
| 210..259 / 260..309, 310..315 | kill list and its pointers (`KillPtr!` ring of 50) | 2D80-2E53 |
| 340..369 | gun ammo stock | 548A-54F2 |
| 669 + 7m (m = 3..8) = 690 + 7(m-3) | gun record of member m: type, +1 damage, +2 ammo capacity, +4 accuracy, +5 loaded ammo, +6 shots per salvo | 53F7-5816 |
| crew fields | 1 initiative (fires when >= `TimeSlot!`), 10 hit bonus, 15 HP, 17 pilot skill (member 1), 18 gunnery, 23 comms (member 2), 26 repair, 31 status, 37 command (0 Wait .. 7 Rapid fire, 8 = fired), 38 target ship, 56 aim level | 5332-5455, 56FF, 4A6E-5145 |
| 2200.. | `Fuel!`, `ChainArg!` (= ENCLIST record on entry, = `EnBoardArg!` before PLBATTLE), `ShipHeading!`, `Terrain!`, `Surprise!`, mission codes, `Gravity10!`, `BoardCrew!` = boarded ship hull, `Breathable!`, `LastEnemyType!` last enemy type, `TributeCount!` tribute counter | Variables table |

## Manual corrections (translator limitations; the body text is as generated)

- 0741B `0 = Pad!` is a stray render of the padding bytes after the last `RETURN` at 7412 (the `' asm` lines up to 744E are data, not code).
- 13FF-1423 (`LOCATE 24,3: PRINT "Select Option"; GOSUB SUB_1857`) and 1F77-1FD5 (item search for `ItemType!`), 2042-2087 (three-letter yes/no) are unreferenced blocks (no `call`/`jmp` reaches them): compiled leftovers shared with SPACE.
- 0040-036E dead code: `DebugLoad!` (0x6F8E) is never assigned, so the standalone BLOADs, NAME/CHARNAME reads and the "Change things?" test-ship setup never run when CHAINed from SPACE.
- `AmmoCount!` (0x9EEE), `AllDead!` (0x9F4C), `ShieldNo!` (0x9F98), `EnemyLeft!` (0xA05E) are reused for a second purpose in the battle code; the Variables table names the primary use and lists the reuse.

## Unknowns

No runtime call is left unrendered. Open interpretation points (M in the Variables table): the meaning of ENCTABLE columns is derived only from how SPBATTLE consumes them (names `Tbl*`/`En*` are readings); `MoveDX!/MoveDY!` elements 1,3 / 0,2 are set at 0DC3-0DDC and the others are assumed 0 (never written); crew field 1 (initiative) and 56 (aim level) have no printed label.
