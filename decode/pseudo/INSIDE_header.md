# INSIDE — BASIC-style pseudocode (lane mod-inside)

Evidence: `decode/listings/INSIDE.lst` (regenerated after rt-naming), `decode/data/tools/_INSIDE.json` (string/number literal table, DATA records, LINES table of `decode/data/MODULE_CONSTANTS.md` section INSIDE.EXE), `decode/brun30/RT_LEDGER.md`, `decode/data/DATA_FILES.md` / `SPRITES.md` (IN-n, INMAP-n, MES-n, INSH, NAME), the NAME file itself for the string-array indices; all read 2026-10-15. The codex draft `INSIDE.draft.md` was used as a scaffold only; every statement below was re-derived from the listing by `decode/pseudo/tools/qb2bas.py`:

```
python decode/pseudo/tools/qb2bas.py decode/listings/INSIDE.lst decode/data/tools/_INSIDE.json decode/pseudo/INSIDE.bas.md --title INSIDE --names decode/pseudo/INSIDE_names.json --end 71E3 --tempbase 8968
```

(run twice so that the INPUT-type pre-pass sees the variable kinds; `--end 71E3` stops at the last reachable instruction, the 13 bytes 71E3..71EF have no incoming edge and the metadata block 22 starts at 71F0; `--tempbase 8968`: the compiler's temp slot T0 is DS 0x8968 — proven by `RT3F_71 #80` at 060EF followed by `mov dx,0x8968` as the PUT y operand at 06104, and T1 = 0x8970 at 04CA2.)

## Conventions

- Every statement carries its listing offset; `L_XXXX:` = jump target, `SUB_XXXX:` = near-call target (GOSUB). `GOTO`/`IF ... THEN GOTO` are the compiled jumps; FOR/NEXT are reconstructed from the compiled counter-store/compare pattern (three shapes: short `jbe BODY`, long `ja +3 / jmp BODY`, and variable STEP with the sign test). Translator convention (all modules): the `FOR x = a TO b` line never shows the step; a non-unit or variable step is printed on the matching `NEXT x STEP s` line.
- Names come from `INSIDE_names.json` (every name has an `_why` evidence entry, listing offsets in hex). Unnamed items keep `N_xxxx!` (single at DS xxxx), `S_xxxx$`, `A_xxxx!(i)`. `G!()` is the 51x51 COMMON array (CHARINFO.BAS at DS 0x1850); DS addresses below 0x40F4 are its elements, index = (addr - 0x1850) / 4, so `DriveCfg!` = G!(85), `UseEGA!` = G!(89), `StdDelay!` = G!(86), `Delay!` = G!(88), `CreditsHi!/CreditsLo!` = G!(78)/G!(79), `SectorX!` = G!(2216), `InBattle!` = G!(2255), `Breathable!` = G!(2252), and the four values handed to PLBATTLE are G!(2214), G!(2228), G!(2229), G!(2260).
- DEF FN bodies (the five one-expression subroutines at 0359..0426) are inlined at their call sites as `FNCrew(member, field)`, `FNIdx(member, field)`, `FNRoom(room, field)`, `FNRoomIdx(room, field)`, `FNCell(0)`; the compiled form is `argument stores ; call ; FAC`. `FNCrew` addresses the squad records at 1500 + member*100 (member 1..6), which are the ship crew slots 3..8 of SPACE's `FNCrew` (1300 + crew*100): the module shifts `CrewName$` by two on entry (0303) and back before every CHAIN (SUB_4F07).
- Conditions: `(a > b)` as a value is the BASIC boolean -1/0; `IF NOT (...) THEN GOTO` is the compiled "skip" form (the source probably read `IF ... THEN <block>`).
- `' with FAC = ...` on a RETURN = the value a DEF FN body leaves in the accumulator.
- Runtime-call semantics are the ledger's; nothing in this module is unrendered (see Unknowns / open questions below).

## Module structure (offsets)

| range | content |
|---|---|
| 0040-00B3 | `Drive$` from `DriveCfg!`, `Enclosure$(0..2)`, `SndDur!`, `BLOAD INSH.BAS` to &H82D6 |
| 00BC-0356 | standalone-test loading guarded by `TestMode!` (always 0 at run time, see names): CHARINFO, LOGO, NAME (Rank$ 1..13, Skill$ 0..15, skip 130, MiscItemName$ 0..10, skip 197, AttrName$ 0..6), CHARNAME; the normal path only shifts `CrewName$` by two (0303) |
| 0359-0426 | the DEF FN bodies (FNCrew, FNIdx, an unused FNKey copy at 03A7, FNRoom, FNRoomIdx, FNCell) |
| 0427-068B | `TestMode!`-only debug initialisation ("Change things?") |
| 068E-07F9 | `RANDOMIZE TIMER`, frame (SUB_0DEE), `Location!`/`StartX!`/`StartY!` from `SectorX!`: <=5 -> 4 (17,0); 6 -> 7 (18,0); 7..10 -> 5 (25,0); 11..14 -> 3 (4,3); 15..18 -> 6 (3,8); 19..30 -> 1 (18,8); >30 -> 2 (9,28) |
| 07F9-0829 | fresh entry (`InBattle!` = 0): load the location (SUB_63F9) ; return from PLBATTLE: read MES-n only (SUB_6473) and restore the map |
| 0829-0CDF | `Breathable!` (0 for locations 3 and 6, 1 elsewhere); the atmosphere/oxygen check runs only on a fresh entry (InBattle! = 0) when it is 0 (088F): members need items 10, 8 and 9 (flags in fields 33/56/40, product -> field 40); "Atmosphere Unbreathable", list of members with oxygen, "Some squad members have no oxygen source. Will you continue? (Y/N)": N -> save names and `CHAIN SPACE.STR`, Y -> every living member without oxygen takes 999 hits (dies) |
| 0CDF-0DEB | READ `OpLen%(0..26)` and `OptionName$(1..22)`; position: fresh entry -> `StartX!/StartY!`; back from battle (`InBattle!`): `BattleWon!` = 0 -> back to `OldX!/OldY!` (0D51-0D68), nonzero -> stay and mark the room's enemy group -1 (cleared, 0D86-0DA4) |
| 0DEE-0FFA | SUB_0DEE: the screen frame |
| 0FFB-1707 | helper subroutines (delays, member picker, key readers, line editor, panel clears, map save/restore) |
| 1707-17A8 | SUB_1707 item search; 17AF-1ABC unreachable leftover (derives a member's stats) |
| 1ABD-2407 | Y/N, room drawing (SUB_1B23 + the 64-case tile PUT SUB_1CEA) |
| 2408-2650 | main loop head: command list, cursor, `RoomNo!`, passability digits, key dispatch `ON Cmd! GOTO` (Up/Left/Right/Down, C E F G I M R S T U V) |
| 2650-2830 | new room: `Enclosure$`, room text (14-char rows), draw if unmapped, enemies -> 64E4, script -> 6BF2, else 34C5 |
| 2830-2F18 | the four moves (blocked -> SOUND 900) and the trap event (radiation 1..3 / explosive 4..6; detection by the radiation detector or a Scout roll; disarm by `Scout!`) |
| 2F18-34B7 | the vault door (A-Leave, B-Use Torch, C-Fire At Door, D-Pick Lock) |
| 34B7-35BD | room bookkeeping, "The Exit" (Y -> save names, BSAVE IN-n/INMAP-n, `CHAIN SPACE.STR`), 1% random encounter per step (TestMode 0) |
| 35C0-37C0 | G-Switch: exchange two members' records, names and item ownership |
| 37C3-3C53 | F-Fix Items: best Ship Repair member, repair kit (item 2), armour (fields 48/49/55) and weapons (ammo field -1 broken -> -2 unfixable / 0 fixed), summary |
| 3C56-41B5 | M-Medical: A-Squad Health table, B-Heal Member (best Medical, medkit item 1, +4 HP or full, 20% medkit used up) |
| 41B8-4B2D | I-Inspect: page 1 stats, page 2 skills, page 3 armour/items/weapons (SUB_4B30 recomputes weight and movement) |
| 4F07-4F7D | SUB_4F07 un-shift names |
| 4F7E-53D7 | E-Equip: EQUIPING list of weapons (800+12k, owner > 2), ammo ("Ammo For "), items; A-R changes an item's owner 3..8 |
| 53DA-5741 | V-View: a member with esper level >= 7 and field 54 > 0 (decremented), 10 sounds, map flashed with PRESET, rooms within 2 cells revealed, "Beings!" / "No Life" |
| 5744-597B | detector sweep animations (radiation: top/bottom edge, motion: left/right edge) |
| 597C-5D4D | C-Change Wep.: cycle through the member's weapons with SPACE, ENTER selects (field 32; field 37 = 3 when changed) |
| 5D4E-5EF0 | R-Reload all weapons with ammo 0 from matching ammo items |
| 5EF1-5F67 | S-Search: "You Find Nothing Unusual" unless the room has a script (-> 6BF2) |
| 5F6A-60BB | U-Use: A/B activate the motion (items 3/4) or radiation (item 11) detector |
| 60BE-6216 | SUB_60BE background tick (detectors + squad marker), SUB_6169 best Scout |
| 6217-6386 | SUB_6217 damage/death, "You Are All Dead" (endless loop) |
| 6387-64E2 | save/load the location files, read MES-n |
| 64E4-6655 | encounter: surprise roll `RND*100 < 50 - MotDetOn!*20 + enclosure*20` (0 confrontation / 1 you surprise / 2 enemies surprise, random +0..1 with a 3 folded to 0), then `CHAIN PLBATTLE.EXE` |
| 6658-6891 | spacebar wait, reload counts, list-line word wrap |
| 6892-695F | T-Time Delay: standard/current/new delay (1..9999) |
| 6962-6BF1 | SUB_6962 option picker + typed single word |
| 6BF2-71E0 | the interaction-script interpreter (see the opcode table) |

## Data formats found here (for DATA_FILES.md)

- **IN-n.BAS** (`InMap%`, BLOAD at &H48B0, BSAVEd back with 5502 bytes = 2751 words when the player takes the exit): words 0..1368 = 37x37 cells, index `y*37 + x`, value `room*64 + tile`; words 1369.. = room records of 11 words at `1369 + room*11`: 0 trap level (1..3 radiation, 4..6 explosive), 1 enemy group (-1 none; >= 0 -> PLBATTLE), 2 script pointer (0 none; negative = one-shot), 3 MES-n line number of the description, 4 enclosure 0..2, 5 mapped flag, 6 vault door strength (sign flips after a failed pick), 7..10 rectangle x0 y0 x1 y1; scripts follow (see opcodes); words 1930..1932 = random-encounter enemy groups. The explored flags and consumed one-shot scripts are saved into the file, so the shipped IN-n files carry state.
- **INSH.BAS** (`TilePass%`, BLOAD at &H82D6, 1228 bytes): words 0..63 = 4-digit decimal code of the blocked directions of tile 0..63 (a SET digit blocks the move: thousands = down, hundreds = up, tens = right, units = left; 0 = open on all sides; polarity verified at 2833-285A: nonzero -> SOUND 900, zero -> move), then 64 GET arrays of 14 bytes (5x5 CGA tiles) at 0x8356 + 14*t, the 24x28 command-panel cursor at 0x86D6 (PUT (280,144) XOR), and two 8x6 detector blips at 0x8782 / 0x8792. Tile 42 doubles as the squad marker (PUT (x*5+8, y*5+7) XOR), 34/35 are the vault door, 36..40 traps, 41 the exit.
- **INMAP-n.BAS** (`MapPic`, BLOAD at &H5E2E): the 185x185 picture of the map area (8,7)-(192,191); redrawn rooms are BSAVEd back (8700 bytes).
- **MES-n**: one line per room (index = room field 3), 14-character cells; a 3-letter line at index k is a typed-command keyword giving `Option!` = k + 100; lines 0..100 are searched.
- **Script opcodes** (`InMap%` words from the room's field 2; `OpLen%` = words per opcode from DATA line 3331; arguments are the following words):

| op | len | effect (label) |
|---|---|---|
| 0 | 1 | nothing (6BF8) |
| 1 | 2 | battle with enemy group Arg1, `Surprise!` = 0 (6D30 -> SUB_656F) |
| 2 | 2 | show `MesLine$(Arg1)` in the map panel, 23 chars per row (6D59) |
| 3 | 3 | `G!(Arg1) = Arg2` (6E46) |
| 4 | 3 | `X! = Arg1: Y! = Arg2` (6E5F) |
| 5 | 3 | `InMap%(Arg1) = Arg2` (6E74) |
| 6 | 2 | credits + Arg1 (6E8D) |
| 7 | 3 | every living member: field Arg1 + Arg2 (6E9C) |
| 8 | 2 | `IF G!(Arg1+109) = 1 THEN G!(Arg1+109) = 2` (6F2E) |
| 9 | 1 | option picker (6F5A -> SUB_6962) |
| 10 | 2 | "Nothing unusual happens", jump to Arg1 (6F60) |
| 11 | 2 | "Not valid or possible", jump to Arg1 (6F87) |
| 12 | 2 | "What?", jump to Arg1 (6FAE) |
| 13 | 3 | `IF Option! = Arg1 THEN` jump to Arg2 (6FD5) |
| 14 | 2 | jump to Arg1 (6FEF) |
| 15 | 3 | `IF RND*100 < Arg1 THEN` jump to Arg2 (6FFB) |
| 16 | 4 | `IF G!(Arg1) <= Arg2 THEN` jump to Arg3 (701B) |
| 17 | 4 | `IF G!(Arg1) >= Arg2 THEN` jump to Arg3 (7042) |
| 18 | 1 | "Enter Amount:" -> `Amount!` (7069) |
| 19 | 3 | `IF Amount! >= Arg1 THEN` jump to Arg2 (7097) |
| 20 | 2 | credits + Arg1 * `Amount!` (70B1) |
| 21 | 3 | `IF credits >= Arg1 THEN` jump to Arg2 (70C6) |
| 22 | 1 | end: restore the map, back to the command loop (70EC) |
| 23 | 2 | as 2 plus "Press ENTER" (70F2) |
| 24 | 2 | every living member takes INT(RND*Arg1 + 1) hits (70F5) |
| 25 | 1 | `X!, Y! = OldX!, OldY!` (71A0) |
| 26 | 2 | unmap room Arg1 and force a redraw (71B5) |

A negative opcode word marks a one-shot instruction: after it is read the whole instruction is zeroed (6C75-6CB6) and the saved IN-n file keeps it zeroed.

## Dead / unreferenced code

- 03A7-03C5: a DEF FN body `INT(CreditsHi!*30000 + CreditsLo! + .5)` (SPACE's FNKey) with no caller.
- 01067-01082 ("Select Option" + key wait), 0154E-01551 (LINE), 017AF-01ABC (member stat derivation using DbgEsper!): no label reaches them (they follow a RETURN); compiler leftovers of removed GOSUBs.
- 0427-068B, 00BC-0300, 27CD, 6D3E: reachable only with `TestMode!` <> 0, which nothing sets.
- 71E3-71EF: 13 bytes after the last `GOTO L_6BF8`, no incoming edge (not rendered).

## LINES table

The module's LINES block maps source line numbers to offsets: lines 1/3/10 -> 0040, 20 -> 00BC, 30 -> 00C2, 40 -> 00EE, 100 -> 00FB, 300 -> 0118. Only these early lines are recorded (the table has 8 entries), consistent with `ON ERROR`-style references in the source; no line numbers are invented elsewhere.

## Unknowns / open questions

- No runtime call is unrendered (the generated Unknowns table at the end of this file is empty).
- `BattleWon!` (G!(2254), PLBATTLE 430D = credits gained or a surrender): read once after a return from PLBATTLE (0D51, `FCMP [3B88] ? 0; je 0D56`): 0 -> the squad is put back on `OldX!/OldY!`, nonzero -> it stays on the encounter cell and the room is marked (0D6B-0DA4). (Polarity corrected 2026-10-18, glm-review-crossref D1.)
- `N_3B78!` (G!(2250)) is set to 10 for locations 4 and 1 and never read here (PLBATTLE reads it as the gravity x10); `N_9018!` is incremented by Fix and never read.
- `Breathable!` (G!(2252)) is 0 for locations 3 and 6 and 1 elsewhere; the atmosphere/oxygen screen runs only on a fresh entry (`InBattle!` = 0) when it is 0 (088F); PLBATTLE prints "Breathable" for 1, so the polarity is proven there.
- `GunName$` (A_43F4) is a COMMON string array loaded by STARPORT/PLBATTLE (NAME items 81..134).
- `FOR I! = FirstRow! TO LastRow!` at 2717: `FirstRow!` (0x8D82) is never assigned; the loop starts at 0 at run time.
- The unreachable blocks listed under "Dead / unreferenced code" are rendered but not reachable.
