# CROSSREF — cross-module consolidation for the decode gate (lane crossref, Fable, 2026-10-15)

Corrections 2026-10-18 (decode-fixer, from `CROSSREF_GLMREVIEW.md` D1-D5): INSIDE 0D51 polarity (§2.2 row 2254, §5 #2, §6), `Difficulty!` is assigned (§5 #4), the COMMON extents per module pair (§2.1, §2.5), the SPBATTLE 3098 END (§1.2), the PLBATTLE uses of 43F4/44CC and the INSIDE 3B88 rename (§2.4, §2.6).

Inputs read: `decode/pseudo/{STARCOMM,STARTUP,SPACE,INSIDE,SPBATTLE,STARPORT}.bas.md` (+ `_header.md`, `_SCREENS.md`, `_names.json`), `decode/pseudo/PLBATTLE.bas.md` (final, mod-plbattle; the draft-derived items were re-checked, see §6), `decode/data/{DATA_FILES,STR_FILES,BAT,MODULE_CONSTANTS,SPRITES}.md`, `decode/data/tools/_*.json`, `decode/brun30/RT_LEDGER.md`, the target directory `re-targets/starcommand/starcoma/`. Offsets are listing offsets inside the named module. PLBATTLE offsets refer to the final `PLBATTLE.bas.md` (the earlier draft offsets were identical).

## 1. CHAIN graph

### 1.1 Every CHAIN / RUN site

| from | offset | statement | condition / when | target on disk |
|---|---|---|---|---|
| START.BAT | - | `STARCOMM` | DOS start | STARCOMM.EXE (BAT.md) |
| STARCOMM | 0119 | `CHAIN "STARTUP"` | always, after the EGA probe | STARTUP.EXE |
| STARTUP | 0AFF | `CHAIN "STARPORT"` | menu key 1 (start game) after the music queue drains | STARPORT.EXE |
| STARPORT | 9F3F | `CHAIN Drive$ + "SPACE.STR"` | L-Leave with a ship, fuel, pilot alive, not overloaded; `EntryMode! = 1` | SPACE.STR -> SPACE.EXE |
| SPACE | 3617 | `CHAIN Drive$ + "STARPORT.STR"` | B-Dock With Starport; `EntryMode! = 0`, `ChainArg! = PortNo!` | STARPORT.STR -> STARPORT.EXE |
| SPACE | 3888 | `CHAIN Drive$ + "INSIDE.STR"` | B-Dock With Space Station; `EntryMode! = 3`, `StationNo!`, `Gravity10! = 1` | INSIDE.STR -> INSIDE.EXE |
| SPACE | 6879 | `CHAIN Drive$ + "INSIDE.STR"` | E-Visit Unique Area, drop ship sent; `EntryMode! = 4` | INSIDE.STR -> INSIDE.EXE |
| SPACE | 6E0B | `CHAIN Drive$ + "PLBATTLE.STR"` | surface encounter accepted (espionage / science / unique area); `ChainArg! = EnemyType!`, `Surprise!`, `Terrain! = 1..3`, `Breathable!`, `Gravity10!` | PLBATTLE.STR -> PLBATTLE.EXE |
| SPACE | 9043 | `CHAIN Drive$ + "SPBATTLE.EXE"` | space encounter (friendly approached or hostile); `ChainArg! = EnemyType!` | SPBATTLE.EXE |
| SPBATTLE | 2F30 | `CHAIN Drive$ + "SPACE.EXE"` | Battle Over, not boarding; `G!(2263) = ChainArg!` | SPACE.EXE |
| SPBATTLE | 2F48 | `CHAIN Drive$ + "PLBATTLE.STR"` | Battle Over after "Will you board?" = Y; `ChainArg! = EnBoardArg!`, `Terrain! = 10`, `Surprise! = 0`, `Gravity10! = 10`, `G!(2251)` = hull, `Breathable! = 1` | PLBATTLE.STR -> PLBATTLE.EXE |
| INSIDE | 0B9F | `CHAIN "SPACE.STR"` (no `Drive$`) | "Some squad members have no oxygen source. Will you continue?" = N (names un-shifted first) | SPACE.STR -> SPACE.EXE |
| INSIDE | 3557 | `CHAIN Drive$ + "SPACE.STR"` | "The Exit" = Y (IN-n / INMAP-n BSAVEd first) | SPACE.STR -> SPACE.EXE |
| INSIDE | 6655 | `CHAIN Drive$ + "PLBATTLE.EXE"` | encounter in a room (script op 1 or random 1%); `InBattle! = 1`, `ChainArg! = EnemyGroup!`, `Terrain! = 11`, `Surprise!`, `G!(2260)` = enclosure | PLBATTLE.EXE |
| PLBATTLE | 433B | `CHAIN Drive$ + "SPACE.STR"` | Battle Over when `EntryMode! = 1` (432D; PLBATTLE calls it `FromSpace!`) after `BattleWon!` is stored (430D), the boarding epilogue (TerrType! = 10, SUB_436D) and the crew names un-shifted (SUB_9685) | SPACE.STR -> SPACE.EXE |
| PLBATTLE | 434A | `CHAIN Drive$ + "INSIDE.EXE"` | Battle Over when `EntryMode! <> 1` (3 or 4: the squad is inside a station or structure) | INSIDE.EXE |
| SPACE.STR etc. | 0114 | `RUN "<MOD>.EXE"` | after the floppy prompt (STR_FILES.md) | the .EXE |

Every target file exists on disk (listing of the target directory, 2026-10-15): STARCOMM.EXE, STARTUP.EXE, STARPORT.EXE/.STR, SPACE.EXE/.STR, INSIDE.EXE/.STR, PLBATTLE.EXE/.STR, SPBATTLE.EXE. There is no SPBATTLE.STR and none is referenced. Not in the graph: COLOR.EXE, FIXIT.EXE, DEMO.EXE (BAT.md).

### 1.2 Reachability from STARCOMM

```
START.BAT -> STARCOMM -> STARTUP -> STARPORT <-> SPACE -> SPBATTLE -> SPACE
                                                  |  ^        \-> PLBATTLE (boarding)
                                                  v  |              |
                                               INSIDE -> PLBATTLE --+-> SPACE / INSIDE
```
All seven modules are reachable: STARCOMM (START.BAT) -> STARTUP (0119) -> STARPORT (0AFF) -> SPACE (9F3F) -> INSIDE (3888/6879), SPBATTLE (9043), PLBATTLE (6E0B); PLBATTLE also from INSIDE (6655) and SPBATTLE (2F48). Returns: SPBATTLE -> SPACE (2F30); INSIDE -> SPACE (0B9F/3557); PLBATTLE -> SPACE or INSIDE (433B/434A); SPACE -> STARPORT (3617). STARTUP and STARCOMM are entered once per program start only (no CHAIN leads back to them). Program exits: STARPORT "G-Game Save" -> `Quit the game? (Y/N)` = Y -> `END` (9D99); SPBATTLE life-support failure ("support systems your air runs out." 3057, "You Are All Dead" 3072, 15-second TIMER wait 3084-3096) -> `END` (3098); STARPORT 9F42 is an unreachable END after the CHAIN; PLBATTLE's "You Are All Dead" (436B) is an endless loop, not an exit.

### 1.3 Who writes what before a CHAIN (`EntryMode!` = G!(2227) decides the return path)

| value of G!(2227) | set by | meaning for the chained module |
|---|---|---|
| 0 | SPACE 35FF | STARPORT: docked (STARPORT does not read it) |
| 1 | STARPORT 9ED5 | SPACE: arriving from the starport; PLBATTLE returns to SPACE.STR when 1 |
| 3 | SPACE 3867 | INSIDE: space station (`StationNo!` = G!(2253), `Gravity10! = 1`) |
| 4 | SPACE 686A | INSIDE: planet unique area |
`ChainArg!` = G!(2214) carries the record number for the next module (starport 0..2, ENCLIST record, enemy group); STARTUP seeds it with 2 and the shipped save holds 2.0.

### 1.4 .STR stubs and the drive prefix

- Each .STR is a compiled stub (STR_FILES.md): `IF A(84) = 0 OR A(92) = <disk> THEN RUN "<MOD>.EXE" ELSE prompt "Insert disk B/A in drive A", set A(92), RUN`. A(84) = G!(84) is the drive type chosen in STARTUP (0 hard disk, 1 one floppy, 2 two floppies: STARTUP DriveName$), A(92) = G!(92) the disk currently in drive A (0 = disk A with STARPORT, 2 = disk B with the other modules). STARPORT.STR compares with 0, SPACE/INSIDE/PLBATTLE.STR with 2 (and `A(84)`/`A(92)` are never read by the game modules: SPACE/INSIDE/SPBATTLE/STARPORT names have no 0x19A0 / 0x19C0 use).
- Direct `.EXE` chains are used only between modules on the same disk (SPACE <-> SPBATTLE, INSIDE -> PLBATTLE, PLBATTLE -> INSIDE), `.STR` chains across disks or when the disk is uncertain; both forms are equivalent for the reproduction ("go to module X").
- Drive prefix: every module computes `Drive$` from `DriveCfg!` = G!(85) (`1 -> "A:"`, `2 -> "B:"`, else `""`): SPACE 0058-0086, INSIDE 0046-0074, SPBATTLE 0046-0074, STARPORT 008A-00B8, PLBATTLE 007B-00A9. G!(85) is written by STARTUP (set to 0 when starting a game, 0x19A4; the drive letter selection is A(84), so G!(85) is 0 on the shipped save and `Drive$ = ""`: the prefix only matters for the two-floppy configuration where STARTUP stores 1/2). STARCOMM and STARTUP use no prefix (their files are on disk A).
- INSIDE 0B9F chains `"SPACE.STR"` without the prefix (the other INSIDE sites prefix it); harmless unless `Drive$ <> ""`.

## 2. Shared state

### 2.1 The COMMON block

Every module declares the same shared vocabulary at the start of its COMMON block (MODULE_CONSTANTS.md "COMMON block arrays"), and some module pairs extend the block (module header words 20/21 = COMMON start/length in `_*.json`: STARCOMM 0x1850 + 0x28A4 = the `G!()` array only, ends 0x40F4; STARTUP, STARPORT and the four .STR stubs 0x1850 + 0x3040, ends 0x4890 right after `ShipName$`; SPACE and SPBATTLE 0x1850 + 0x524C, ends 0x6A9C; INSIDE and PLBATTLE 0x1850 + 0x67DA, ends 0x802A - each module's own literals start exactly at that end: SPACE 0x6AA2, SPBATTLE 0x6AA2, INSIDE 0x827C, PLBATTLE 0x804E, STARPORT 0x4F6C). The shared part: the 2601-element single array `A()` = `G!()` at DS 0x1850 (saved to CHARINFO.BAS by STARPORT 9CF3, loaded by STARCOMM 0078 and by every module's dead `DebugLoad!` path), the 20 string arrays at 0x4288..0x4870 (filled from NAME/CHARNAME by STARTUP), `ShipName$` 0x488C, and the COMMON scalars which the compiler placed inside the `A()` range (index = (DS - 0x1850)/4, e.g. `Fuel!` = A(2200)). Names below are the SPACE/SPBATTLE/STARPORT names (identical by construction: SPBATTLE/STARPORT copied SPACE's for every shared address); STARTUP uses `A(n)`; INSIDE's differing names are listed in §2.4.

### 2.2 G!() / A() index map (every entry: module and offset that proves it)

| index | DS | name | meaning | evidence |
|---|---|---|---|---|
| 0..22 | 1850.. | ship equipment slots = `EquipName$(0..22)` (NAME 344..366): 0 Engine, 1 Retros, 2 Life Suprt, 3 Power, 4 Commun, 5 Computer, 6 Tow Link, 7..10 Shield #1-4, 11..16 Gun #1-6, 17 Def. Systm, 18 Mis. Killr, 19 Hull Int., 20..22 Drop Ship1-3 | condition 0 none / 1 ok / 2 broken / 3 unfixable ("*-Broken #-Unfixable"); set 1 for 0..6 with a new ship; the shield/gun/defense/killer/drop-ship slots double as fitted flags | NAME parsed with INPUT quoting (crossref); SPACE 4523-4537, 78CA-78E5; STARPORT 2B75-2B99, 68AD-68C1; SPBATTLE 6002-60BD (slot hit) |
| 6 | 1868 | `TowLinkCond!` | "Tow Link": 2 = broken -> "Tow linkage broken", no salvage tow | PLBATTLE 446C-4471 |
| 0, 3 | 1850, 185C | `EngineCond!`, `PowerCond!` | "Engine" / "Power": 2 = "Pilot or ship not ready", must be 1 to move/rotate; else "Ship is irreparable" | SPACE 2224/2273; SPBATTLE 1D5B, 4794 |
| 1 | 1854 | `RetrosCond!` | "Retros": must be 1 to rotate | SPBATTLE 4794 (test setup 03A8) |
| 2 | 1858 | `LifeSuptCond!` | "Life Suprt": SPBATTLE life-support failure when <> 1 | SPBATTLE 2C3A, 3024 |
| 4 | 1860 | `CommCond!` | "Commun": radio working (1) | SPBATTLE 2166 |
| 5 | 1864 | `ComputerCond!` | "Computer": "Computer Broken" unless 1 | SPACE 5204 |
| 7..10 | 186C.. | shield facing flags | `G!(n+6)` = 1 when shield n fitted; shield arcs on the ship panel | STARPORT 4DE9, A4FE; SPACE 1F25; SPBATTLE 1A37, 5E06 |
| 11..16 | 187C.. | gun fitted flags | `G!(n+10)` = 1 when gun n bought | STARPORT 4A7D, A178; SPACE 1770; SPBATTLE 4A6E, 53E0 |
| 17 | 1894 | `DefSysCond!` | "Def. Systm": 1 when defense hardware installed; MaxMove uses G!(63) when 1 | STARPORT 4ED7; SPACE 8112 |
| 18 | 1898 | `MisKillerCond!` | "Mis. Killr": active (1) | STARPORT 4FDA; SPBATTLE 51C3 |
| 19 | 189C | `HullCond!` | "Hull Int.": 1 ok / 2 breached | STARPORT 2BAF; SPBATTLE 6094, 136A |
| 20..22 | 18A0.. | `DropPart1..3!` | drop-ship parts fitted (from `ShipTable!` +0) | STARPORT 2A16-2A55; SPACE 8D58 |
| 28 | 18C0 | G!(28) | `ShipTable!(+108)` of the bought ship (unknown use) | STARPORT 2B6C |
| 29 | 18C4 | `ShipClass!` | size class 0..3 -> SHIP-n.BAS picture, `ShipSize$` | SPACE 028B; STARPORT 2B0F, 08DAA |
| 43 | 18FC | G!(43) | ship index + 1 (0 = no ship) | STARPORT 2AFA, 3509, 9E12; SPACE (not read) |
| 44..46 | 1900.. | `BaseMove!`, `BaseWt!`, `MaxWt!` | from `ShipTable!` +72/+9/+18 | STARPORT 2A9C-2B24; SPACE 7717-77CF |
| 48, 50 | 1910, 1918 | `CargoWt10!`, `TotalWt10!` | weights x10, recomputed by the weight routine | SPACE SUB_7F9D; SPBATTLE SUB_6FE6; STARPORT SUB_965F |
| 51 | 191C | `Defence!` | ship defence % | STARPORT 2AEA; SPACE 7821 |
| 52 | 1920 | `MaxFuel!` | fuel capacity | STARPORT 2B59; SPACE 3664 |
| 53 | 1924 | `ArmorDiv!` | armor points per ton | STARPORT 2B44; SPACE 801B |
| 55 | 192C | `Armor!` | armor points | STARPORT 2AD5, 5180; SPACE SUB_1A28; SPBATTLE 5F8F |
| 60/61/62 | 1940.. | `MissileKiller!`, `MissileKillPct!`, weight x10 | | STARPORT 4FBE-4FEC; SPACE 7983 |
| 63/64/65 | 194C.. | `DefHardware!`, `DefHardwarePct!`, weight x10 | | STARPORT 4EBB-4EE9; SPACE 79D9, 8112 |
| 66..75 (step 3) | 1958.. | shield slots | `63+3n`: type, +1 strength, +2 weight x10 (n = 1..4) | STARPORT 4D1E-4DD5, A4C5-A55D; SPBATTLE 5E06 (`67+3f`); SPACE 7A1A-7A5B |
| 78, 79 | 1988, 198C | `CreditsHi!`, `CreditsLo!` | credits = hi*30000 + lo (shipped 3 / 5000) | all modules' credit routines; STARTUP new-game defaults |
| 82 | 1998 | `CurMove!` | current move allowance | SPACE/SPBATTLE/STARPORT weight routines |
| 83 | 199C | A(83) | new-game default 27; not read by any module (PLBATTLE included) | STARTUP 0x199C |
| 84 | 19A0 | A(84) DriveType | 0 hard disk / 1 one floppy / 2 two floppies; read by the .STR stubs only | STARTUP, STR_FILES.md |
| 85 | 19A4 | `DriveCfg!` | 1/2 -> `Drive$` "A:"/"B:" | SPACE 0064; INSIDE 0052; SPBATTLE 0052; STARPORT 0096 |
| 86 | 19A8 | `StdDelay!` | CPU calibration count (STARTUP "Speed") | STARTUP; SPACE 8327 |
| 87 | 19AC | A(87) | set 0 at game start; not read elsewhere | STARTUP |
| 88 | 19B0 | `Delay!` | current delay factor | every module's delay loop |
| 89 | 19B4 | `UseEGA!` | 1 -> EGA palette / PLBATTLE SCREEN 7 | STARCOMM 00D5; STARTUP 0E4B; SPACE 1032; STARPORT 0058; INSIDE 0DF7; PLBATTLE (draft) 0067 |
| 90, 91 | 19B8, 19BC | EGADetected, AdapterPref | STARCOMM probe / STARTUP option 5 | STARCOMM.bas.md |
| 92 | 19C0 | A(92) disk in drive | 0 disk A / 2 disk B; read by the .STR stubs only | STR_FILES.md |
| 93 | 19C4 | `SoundOff!` | 1 = sound off (`SndDur! = 1 - SoundOff!`) | STARTUP; SPACE 018C; SPBATTLE 0083 |
| 100..109 | 19E0.. | special bonus flags | 1 -> bonus paid (2); 109 = medal of honor, set when `EnBoardArg! = 23` (SPBATTLE) or after a won boarding of portrait type 3 (PLBATTLE) | STARPORT SUB_13DC; SPBATTLE 73BD; PLBATTLE A8CC |
| 110..159 | 1A08.. | mission flags | 0 none, 1 active, 2 completed, 3 paid | SPACE 5001, SUB_8CC2; STARPORT 754B-7933, 18F7-1928; SPBATTLE SUB_73A9; INSIDE op 8 |
| 160..209 | 1AD0.. | espionage finds | 1 found -> 2 rewarded (`FindName$`) | SPACE 60BB; STARPORT 18AF, 98D2 |
| 210..259 / 260..309 | 1B98.. | kill list type / tonnage (ring of 50) | | SPBATTLE 2E12-2E2D; SPACE SUB_548D; STARPORT SUB_161E |
| 310..315 | 1D28.. | `KillStartAll!`, `KillPtr!`, `KillStartMission!`, `Kills!`, `KillStartPort!`, `Tonnage!` | a lost boarding retracts the kill entry SPBATTLE made (pointers -1, tonnage/kills -1) | SPBATTLE 2D80-2E53; SPACE 52EA-535C; STARPORT 1779-183E; PLBATTLE 43A1-4400 |
| 320..329 / 330..339 | 1D50.. | tow list type / tonnage | a won boarding replaces the lightest tow entry with the boarded ship ("Towing for salvage") | SPACE 55E0-5627; STARPORT 184D-1899; PLBATTLE 4484-4550 |
| 340..369 | 1DA0.. | gun ammo stock (gun type per slot), weight at +30 | | STARPORT 4B3F-4C44; SPACE 17AC, 8273; SPBATTLE 548A |
| 400..499 | 1E90.. | cargo items held (`ItemName$`) | | SPACE 5EDC, 637B, 7B0A; STARPORT 3241; INSIDE (items 10/8/9 needed for oxygen: fields, not cargo) |
| 500..554 | 2020.. | reload counts per weapon type (rebuilt before each list) | | SPACE 976F; STARPORT A00E, A5CE; INSIDE reload lists |
| 669 + 7m (m = 3..8) = 683 + 7n (n = 1..6) | 2318.. | gun records: type, +1 damage, +2 ammo capacity, +3 weight x10, +4 accuracy, +5 loaded ammo, +6 shots per salvo | | STARPORT 4895-4A59; SPACE 1721-180F, 8208-82DA; SPBATTLE 53F7-5816 |
| 726 + k (k = 16..32) | 23F8.. | miscellaneous-item flags shown by STARPORT "E-Miscellaneous Items" | | STARPORT 99BC-9A04 |
| 742..758 | 2438.. | set to 1 by the STARPORT test setup only | | STARPORT 0FA4 |
| 800..1088 (step 12) | 24D0.. | squad weapons: type, +1 damage, +2 ammo cap, +3 condition (-1 broken, -2 unfixable), +4 accuracy, +5 weight x10, +6 shots, +7, +8, +9 owner member, +10, +11 | | STARPORT 3CFF-3EC0; SPACE 83E2, 9838; SPBATTLE (not used); INSIDE Equip/Fix |
| 1100..1397 (step 3) | 2980.. | ammo: type, +1 weight x10, +2 owner | | STARPORT 409E-40F3; SPACE 8462; INSIDE Reload |
| 1300 + 100m + f | 2CA0.. | crew records, m = 1..8 (m = 0 unused), fields 0..99: see §2.3 | | FNCrew/FNIdx sites in every module |
| 2199..2212 | 3AAC.. | clock and dates: 2200 `Fuel!`, 2202 `Years!`, 2204 `Days!`, 2206 `Hours!`, 2207/2209 last pay year/day, 2210/2212 last visit year/day | | SPACE SUB_8973; STARPORT 10F5-1103, 1BCF-1BD8 |
| 2214 | 3AE8 | `ChainArg!` | record for the chained module (§1.3): starport number, ENCLIST record, first ENCINFO record (PLBATTLE `FirstEnemy!`) | SPACE 3608/6DCF/9034; SPBATTLE 06F8; INSIDE 663D; STARPORT 0106; PLBATTLE 0E4E |
| 2216..2221 | 3AF0.. | `SectorX!/Y!`, `CursorCol!/Row!`, `SysCurX!/Y!` | galaxy position and scan cursors (shipped 28, 2, 7, 7, 6, 6); INSIDE picks the location from `SectorX!` | SPACE 2938, 31C2, 3F11; INSIDE 068E-07F9 |
| 2226 | 3B18 | `ShipHeading!` | 0..7 | SPACE 1CFB; SPBATTLE 18FA, 47B4 |
| 2227 | 3B1C | `EntryMode!` | §1.3 | SPACE, STARPORT, PLBATTLE (draft) 432A |
| 2228 | 3B20 | `Terrain!` | PLBATTLE terrain 1..13 = `TerrainName$` index and the TR-n tile file: 1..3 Plains/Mushrooms/Swamp (SPACE `INT(RND*3+1)`), 10 Enemy Ship (SPBATTLE), 11 + `Enclosure!` 0..2 = Enclosed / Semi-enclosed / Open Room (INSIDE) | SPACE 6DF3; SPBATTLE 3EEF; INSIDE 6646; PLBATTLE 0197-0224, DATA 297 |
| 2229 | 3B24 | `Surprise!` | 0 confrontation / 1 "The enemy is surprised." (enemies skip the first movement) / 2 "The squad is surprised." (the squad skips it) | SPACE 6DD8; INSIDE 6575; SPBATTLE 3EFA; PLBATTLE 01D3-01F5, 4761, 496C |
| 2230..2233 | 3B28.. | enemy strength per zone A/B/N/? (`G!(Zone!+2230)`) | from the MISSION record | SPACE 9080; STARPORT 765E |
| 2234..2244 | 3B38.. | mission parameters: 2234 `MissionKey2!`, 2235 `BaseEnc!`, 2236 `MissionCodeB!`, 2237 `MissionType!`, 2238/2239 `MissionX1!/Y1!`, 2240 `MissionCodeA!`, 2241 `MissionKey1!`, 2242 `MissionEncB!`, 2243/2244 `MissionX2!/Y2!` | the 15 MISSION integers = G!(2230..2244) in file order | STARPORT 765E-768A; SPACE 2B15-2B6F, 5C4E-5D63 |
| 2250 | 3B78 | `Gravity10!` | planet gravity x10 (station 1, boarded ship 10, INSIDE locations 1/4 = 10); PLBATTLE `Gravity! = INT(G!(2250))/10` | SPACE 5BF1/3879; SPBATTLE 3F02; INSIDE 06C9/07AF; PLBATTLE 0179 |
| 2251 | 3B7C | `BoardCrew!` | hull/crew points of the boarded ship, used by PLBATTLE as the boarding crew count (groups of up to 3) | SPBATTLE 3F0E; PLBATTLE 12B3-12D3 |
| 2252 | 3B80 | `Breathable!` | 1 breathable (INSIDE: 0 for locations 3 and 6); PLBATTLE prints "Breathable"/"Unbreathable" from SGN of it | SPACE 5936-594E; SPBATTLE 3F17; INSIDE 0829-086D; PLBATTLE 02B0-02C4 |
| 2253 | 3B84 | `StationNo!` | space station number for INSIDE | SPACE 3870 |
| 2254 | 3B88 | `BattleWon!` | = -((CreditsGained! > 0) OR (Surrendered! > 0)) at Battle Over; INSIDE 0D51 (`FCMP [3B88] ? 0; je 0D56`): 0 (lost or fled) -> `X!,Y! = OldX!,OldY!` (the squad is pushed back off the encounter cell), nonzero (won) -> it stays on the cell and L_0D6B marks the room (0D86-0DA4); polarity corrected 2026-10-18 (GLMREVIEW D1) | PLBATTLE 430D; INSIDE 0D4B-0D68 |
| 2255 | 3B8C | `InBattle!` | INSIDE: 1 while a room battle runs (skips the map reload on return) | INSIDE 6619, 0818 |
| 2260 | 3BA0 | `Enclosure!` | room enclosure 0..2, added to terrain 11 by PLBATTLE | INSIDE 6634; PLBATTLE 0224 |
| 2261, 2262 | 3BA4, 3BA8 | saved mission codes A/B | STARPORT restores `MissionCodeA!/B!` from them on entry | STARPORT 10C3-10CC, 76B9-76C2 |
| 2263 | 3BAC | `LastEnemyType!` | last space enemy type fought; after a won boarding PLBATTLE compares it with `MissionType!-10` (mission done), `MissionCodeA!-50` / `MissionCodeB!-50` (code cleared) | SPBATTLE 2F16; PLBATTLE 4413-4454 (its `ExitTag!`) |
| 2264 | 3BB0 | G!(2264) | tribute counter (reset with a new mission) | SPBATTLE 2885-28D1; STARPORT 7797 |
| 2265 | 3BB4 | G!(2265) | save lock after three wrong rule-book answers | STARPORT 9AAF-9CDB |
| 2266 | 3BB8 | G!(2266) | fuel of the boarded ship; SPACE tests it at startup (0FC7) | SPBATTLE 3ED8; SPACE 0FC7 |
| 2300..2597 (step 3) | 3C40.. | personal items: type (`MiscItemName$`), +1 weight x10, +2 owner; types 1 medkit, 2 repair kit, 3/4 stealth items, 8/9/10 oxygen gear (INSIDE), 11 radiation detector, 3/4 motion detector (INSIDE) | | STARPORT 4716-4759; SPACE SUB_247C; INSIDE 5F6A-60BB, 0829 |

### 2.3 Crew record fields (G!(1300 + 100*member + field), member 1..8)

| field | meaning | evidence |
|---|---|---|
| 0..6 | attributes (`AttrName$`: Strength, Speed, Accuracy, Courage, Willpower, Esper, Intelligence); 0 = 0 means empty slot | STARPORT 5677-57C7, 86D1; SPACE 1840 |
| 1 | initiative in space combat (fires when >= time slot) | SPBATTLE 5383 |
| 5 | esper potential (> 50 -> Esper class allowed) | STARPORT 59E5 |
| 7 | (cleared at recruitment with 7..99) | STARPORT 5847-5871 |
| 8 | current move | SPACE SUB_7BD5; STARPORT SUB_9296 |
| 9 | training sessions due | STARPORT 1B60-1BA1, 7C6B |
| 10, 11 | hit bonus, defence bonus | STARPORT SUB_26A6; SPACE 70EF-7135 |
| 12, 13, 14 | max move, max carried, carried weight | SPACE 7177-7202; STARPORT SUB_26A6 |
| 15, 16 | HP, max HP | all modules |
| 17..28 | skill levels (`Skill$(1..12)`); 17 pilot (member 1), 18 gunnery, 19 investigation, 20 medical, 23 comms (member 2), 26 repair | SPACE 73FD; SPBATTLE 1D5B, 56FF, 6152; STARPORT 8A5D |
| 27 | esper level (abilities by level) | SPACE 72B4-73BB; STARPORT 8832-8939 |
| 29 | age in days (`*0.005479452` = years) | SPACE 6F8D; STARPORT 115A, 8591 |
| 31 | status 0 dead / 1 okay / 2 rad (`Status$`) | all modules |
| 32 | currently selected weapon record (INSIDE "Change Wep.") | STARPORT 3EC9-3F1F; INSIDE 597C |
| 33 | oxygen-gear flag (INSIDE) | INSIDE 0829 |
| 34, 35 | rank (`Rank$`), class (`ClassName$`: 0 Marine, 1 Pilot, 2 Soldier, 3 Esper) | STARPORT 5A80, 1B48; SPACE 6EE8-6F30 |
| 36 | last aging year | STARPORT 1187-11D4 |
| 37, 38 | battle command, target ship (SPBATTLE); 3 = switching (INSIDE sets 3 on weapon change) | SPBATTLE 4A6E-5145; INSIDE 597C |
| 39 | carried weight of worn items | SPACE SUB_7BD5 |
| 40 | oxygen-check product (INSIDE) | INSIDE 0829 |
| 41..43 | sighting hardware: type, weight x10, % | STARPORT 43BA-4452 |
| 44..46 | hand weapon: weight x10, points, field | STARPORT 4237-430A |
| 47..49 | armor suit: type, armor cur, armor max | STARPORT 4511-459B; SPACE 74AE-74DC |
| 50 | clones | STARPORT 7012-72C9; SPACE 756C |
| 54 | = attr5/25 on leaving the starport (esper points, INSIDE "View" needs >= 7) | STARPORT 9E6E-9EB3; INSIDE 53DA |
| 55 | armor-related field used by the repair pass | SPACE 4798-4844 |
| 56 | aim level (SPBATTLE) / oxygen flag (INSIDE) | SPBATTLE 50F3; INSIDE 0829 |
| 59 | medal of honor received | STARPORT SUB_A932 |
| 90, 91 | hand weapon item number, armor suit weight x10 | STARPORT 42B0, 45A4; SPACE SUB_7BD5 |
| 99 | last field (record end for swaps) | SPACE 412C; STARPORT 583E |

### 2.4 String arrays (COMMON, filled by STARTUP from NAME in file order; STARPORT 0239-06D0 repeats the same reads in its debug path and SPBATTLE skips 52 fields = 13+16+9+4+5+5 before reading its two)

| DS | count | canonical name | STARTUP name | NAME fields | used by |
|---|---|---|---|---|---|
| 4288 | 9 | `CrewName$(1..8)` | Crew$ | CHARNAME 2..9 | all (INSIDE shifts by two: CrewName$(1..6) = members 3..8) |
| 42AC | 14 | `Rank$(1..13)` | Rank$ | 0..12 | SPACE, STARPORT, INSIDE |
| 42E4 | 16 | `Skill$(0..15)` | Skill$ | 13..28 | SPACE, STARPORT, INSIDE |
| 4324 | 9 | `ShipClassName$` | N4324$ | 29..37 | STARPORT |
| 4348 | 4 | `ShipSize$` | N4348$ | 38..41 | STARPORT |
| 435C | 5 | `ShieldName$` | N435C$ | 42..46 | STARPORT |
| 4370 | 5 | `DefHwName$` | N4370$ | 47..51 | STARPORT |
| 4384 | 3 | `MissileKillerName$` | N4384$ | 52..54 | STARPORT, SPBATTLE |
| 4390 | 25 | `GunName$` | N4390$ | 55..79 | STARPORT, SPACE, SPBATTLE |
| 43F4 | 54 | `WeaponName$` | N43F4$ | 80..133 | STARPORT, SPACE, INSIDE (named GunName$ there - rename), PLBATTLE (attack line; debug INPUT 055D) |
| 44CC | 6 | `HandWeaponName$` | N44CC$ | 134..139 | STARPORT, PLBATTLE (6C76 `PRINT HandWeaponName$(CINT(HandWep!))`; debug INPUT 059F) |
| 44E4 | 4 | `SightingName$` | N44E4$ | 140..143 | STARPORT |
| 44F4 | 16 | `ArmorSuitName$` | N44F4$ | 144..159 | STARPORT |
| 4534 | 11 | `MiscItemName$` | N4534$ | 160..170 | STARPORT (F-Miscellaneous), SPACE (named HandWeaponName$), INSIDE (named ItemName$) - rename both |
| 4560 | 100 | `ItemName$` (cargo) | N4560$ | 171..270 | SPACE, STARPORT |
| 46F0 | 50 | `FindName$` | N46F0$ | 271..320 | STARPORT |
| 47B8 | 23 | `ShipType$` | N47B8$ | 321..343 | SPACE, STARPORT |
| 4814 | 23 | `EquipName$` | N4814$ | 344..366 | SPACE, STARPORT, SPBATTLE |
| 4870 | 7 | `AttrName$` | N4870$ | 367..373 | SPACE, STARPORT, INSIDE |
| 488C | 1 | `ShipName$` | CharName$ | CHARNAME 1 | all |

Field numbers count as `INPUT #` does (a quoted string may contain commas: two espionage messages do, so the 378 raw comma-separated items are 375 INPUT fields); the loops consume 374, the trailing empty field is never read. Verified by re-parsing NAME with the quoting rule: every group starts with the expected name (Private, Desk Duty, Wasp, Scoutship, Anti-Inertial Screen, Stealth Pod, Point Defense Turret, Hypervelocity Rocket, 5.56mm Palm Gun, Stiletto, Laser Targeter, Flight Suit, Medkit, Vaccine, Optical Sensors, (empty)/Pirate Scout, Engine, Strength). Equipment slot names: Engine, Retros, Life Suprt, Power, Commun, Computer, Tow Link, Shield #1..#4, Gun #1..#6, Def. Systm, Mis. Killr, Hull Int., Drop Ship1..3.

### 2.5 Other shared memory

- `Logo` at 0x40F4 (LOGO.BAS, BLOADed by STARTUP 0x40F4, PUT by SPACE 14B4 / STARPORT 1D4B) - inside the COMMON block, so it survives CHAIN.
- SPACESH.BAS at 0x4890 and SHIP-n.BAS at 0x65FC lie **inside the COMMON block that SPACE and SPBATTLE declare in common** (header word 21 = 0x524C: 0x1850..0x6A9C, see §2.1): SPACE BLOADs them (023A/028B), SPBATTLE only in its dead `DebugLoad!` path (00DE/0112) and PUTs from them after the CHAIN because BRUN keeps the declared COMMON extent - the reproduction must keep them loaded (or load them in SPBATTLE). Likewise INSIDE and PLBATTLE share 0x4890..0x802A (header word 21 = 0x67DA): INSIDE's squad position `X!/Y!/OldX!/OldY!` (0x48A0..0x48AC) survives the PLBATTLE round trip for that reason. Not shared: STARPORT's INFO.BAS/SHIPPICS (its own BLOADs at 00E0/020F; STARPORT's COMMON ends at 0x4890) and INSIDE's INSH.BAS (00B3, INSIDE-only use). (Corrected 2026-10-18, GLMREVIEW D3; the old text called the banks "not COMMON".)
- Compiler temp slots T0..T31 are at the DS address stored in **module header word 17** (SPACE 0xA860, SPBATTLE 0x6FAA, STARPORT 0xA87C, INSIDE 0x8968, PLBATTLE 0xBE88, STARTUP 0xD624; 0 for STARCOMM and the stubs) - proven for the three modules whose `--tempbase` was found independently from the listings (SPACE A860, SPBATTLE 6FAA, STARPORT A87C). The ledger's "[0x10 or 0x12]" is the runtime's copy of that word. Not COMMON.

### 2.6 Name alignment - rename requests (filed in STATUS.md)

INSIDE: 3AE8 `N_3AE8!` -> `ChainArg!`; 3B20 `N_3B20!` -> `Terrain!`; 3B24 `N_3B24!` -> `Surprise!`; 3B78 `N_3B78!` -> `Gravity10!`; 3B80 `Airless!` -> `Breathable!` (value 1 = breathable, INSIDE's own evidence 0829-086D); 3BA0 `N_3BA0!` -> `Enclosure!`; 3B88 `N_3B88!` -> `BattleWon!` (applied 2026-10-18 with the D1 polarity in its `_why`); A43F4 `GunName$` -> `WeaponName$`; A4534 `ItemName$` -> `MiscItemName$`.
SPACE, SPBATTLE, STARPORT: 3B20 `Rnd3!` -> `Terrain!`; 3B24 `SurfaceEnc!` -> `Surprise!`; A4534 `HandWeaponName$` -> `MiscItemName$` (SPACE, SPBATTLE); STARPORT 3BB0 and SPBATTLE 3BB0 `G!(2264)` -> `TributeCount!`; SPBATTLE 3B7C `G!(2251)` -> `BoardedHull!`, 3BAC `G!(2263)` -> `LastEnemyType!`; STARPORT 3BB4 `G!(2265)` -> `SaveLock!`, 3BA4/3BA8 -> `SavedCodeA!/SavedCodeB!`, 3ACC/3AD4 -> `PayYear!/PayDay!`, 3AD8/3AE0 -> `VisitYear!/VisitDay!`.
PLBATTLE (owner mod-inside session): 3AE8 `FirstEnemy!` -> `ChainArg!`; 3B1C `FromSpace!` -> `EntryMode!`; 3B24 `SurpriseIn!` -> `Surprise!` (and the local copy 0xBAEC `Surprise!` -> `SurpriseCur!`); 3B78 `GravityX10!` -> `Gravity10!`; 3BAC `ExitTag!` -> `LastEnemyType!`; 1D28/1D30/1D38 `N_1D28!/N_1D30!/N_1D38!` -> `KillStartAll!/KillStartMission!/KillStartPort!`; 1D2C `TowSlot!` -> `KillPtr!`; 3B40/3B44/3B50 -> `MissionCodeB!/MissionType!/MissionCodeA!`; 1868 `TowState!` -> keep but note = `EquipName$(6)` condition; A43F4 `GunName$` -> `WeaponName$`; A44CC `HandWeapon$` -> `HandWeaponName$`. SPBATTLE 3B7C `BoardedHull!` -> `BoardCrew!` (applied). Equipment-slot condition names applied to SPACE/SPBATTLE/STARPORT/PLBATTLE: `EngineCond!` (0), `RetrosCond!` (1), `LifeSuptCond!` (2), `PowerCond!` (3), `CommCond!` (4), `ComputerCond!` (5), `TowLinkCond!` (6), `DefSysCond!` (17), `MisKillerCond!` (18), `HullCond!` (19).
STARTUP (A(n) style, no names file): the string arrays per §2.4 and A(85) `DriveCfg!`, A(86) `StdDelay!`, A(88) `Delay!`, A(89) `UseEGA!`, A(93) `SoundOff!`, A(78/79) `CreditsHi!/Lo!`, A(2214) `ChainArg!`, A(2216..2221) as in §2.2.

## 3. Data unknowns (DATA_FILES.md "unknowns left")

| item | resolution | evidence |
|---|---|---|
| ENCLIST columns | name$, number of ships, strength modifier %, ENCTABLE row count to read | SPBATTLE 0707, 088C-0790 |
| ENCTABLE 25 columns | hull, gun damage base, defence, fuel, armor, missile damage, shield/facing, 6 weapon slots (sign = kind, abs = hit %), moves, tech, attitude, tactic, ENSHP sprite no, PLBATTLE boarding arg, tonnage, kill-list ship type, strength, hit bonus, gun damage, missiles | SPBATTLE 079F-0804 and the scaling at 08F4-0C39 (SPBATTLE.bas.md Variables `Tbl*`) |
| MISSION 15 integers | written straight into G!(2230..2244): 2230..2233 enemy strength per zone, 2234 planet key 2, 2235 base encounter chance, 2236 code B, 2237 mission type, 2238/2239 target 1 x/y, 2240 code A, 2241 planet key 1, 2242 encounter bonus at target 2, 2243/2244 target 2 x/y; codes: < 50 message, 50..149 enemy ship (-50), 150..249 pickup item (-150), 250+ delivery item (-250) | STARPORT 765E-768A; SPACE 2B15-2B6F, 5CC8-5D63, 62BC-6463 |
| ENCINFO 27 integers | c1 max group size, c2 initiative base (x1.3/x0.7/x0.6 = the initiative countdown bounds InitHi!/InitMid!/InitLo!, PLBATTLE 1039-1055, 6587-659D; not morale), c3 to-hit modifier, c4 unit armour, c5 squares per turn, c6 hit points base, c7 attitude 1..3 (bribe offer = (c7 < 4) * -40 = +40, PLBATTLE 399D), c8 hostility (1 passive, >1 attacks with 35*c8-35 %), c9 tactic 1..5, c10 BIGSH portrait, c11 unused, c12 credits per unit, c13 strength per unit, c14 unused, c15/c17 rocket chance/count, c16/c18/c20 rocket/melee/flame damage, c19/c21 flame-thrower chance/charges, c22 chance of a following group, c23/c24 following records, c25 melee attacks, c26 melee reach, c27 attack verb 1..4 (= creature sprite) | PLBATTLE.bas.md header "Data formats found here", 0E96-0F5C, 112B-165B |
| IN-n dimensions | 37x37 cells (words 0..1368, `y*37+x`, value room*64+tile) + 11-word room records from word 1369 + scripts; IN-4's different look = the same layout with other values | INSIDE.bas.md header "Data formats found here" |
| INSH.BAS | 64 passability words + 64 5x5 tiles + cursor + 2 blips | INSIDE header |
| INMAP-n / MAP-n / SPPIC-n / SPSTGRPH | pictures; MAP-n doubles as data (SPACE reads its pixel words as the sector map) | SPACE 2E22-305B |
| GALAXY.BAS | 32x32 int16 `Galaxy%(x + 32y)`, value = zone*10000 + code (code < 444 star system, 1000+n starport, 2000+n station, 2099..2102 black hole) | SPACE 2913, 2B97, 2BA2-2C07 |
| INFO.BAS | 13 stat/price tables (pay, training, ship, shield, defense hw, missile killer, gun, weapon, hand weapon, sighting, suit, misc item, cargo value) with the column layout in STARPORT.bas.md Arrays | STARPORT 020F and the Arrays table |
| CHARINFO.BAS | = G!() as in §2.2 | STARPORT 9CF3 |
| NAME field groups | §2.4 (375 INPUT fields; the equipment group gives the G!(0..22) slot names) | STARTUP 00F0-0552; STARPORT 0242-06D0; NAME re-parsed |
| TR-n / BIGSH-n names | `Drive$ + "TR" + STR$(-TerrType!) + ".EGA"` (EGA) or `".BAS"` (CGA) at &HBC6C (4 terrain tiles: typical, offensive, inaccessible, defensive); `Drive$ + "BIGSH" + STR$(-portrait) + ".BAS"` at &H942E (CGA) or `"BIGSH" + STR$(-portrait) + ".EGA"` at &H8052 (EGA, **without** the drive prefix); the words after the 88x56 portrait are a frame script (CGA from word 618; EGA from word 1240 as type/delay pairs with overlay offsets); `STR$` of the negated number supplies the "-" (same idiom as SPACE "MAP"/"SPPIC"/"SHIP" and SPBATTLE "ENSHP") | PLBATTLE 0333, 0380, 1990, 19BD, 9B5B-9F72; SPACE 2705, 3512, 028B; SPBATTLE 0CAB |
| CGA palette | SCREEN 1 with the default palette 1 (cyan/magenta/white on black: `COLOR 0,1` in STARCOMM 0046 and INSIDE 0E21); with `UseEGA! = 1` the modules re-map colour 1/2 by PALETTE: STARCOMM/STARTUP/SPACE/STARPORT `PALETTE 1,9: PALETTE 2,4` (bright blue / red), INSIDE `PALETTE 1,2: PALETTE 2,6` (green / brown), PLBATTLE uses `SCREEN 7` (16 colours) when `UseEGA! = 1` else the inherited SCREEN 1 (0072) | the SCREEN/PALETTE sites listed |
| DATA-block count word (block A, 3rd word) | **unknown**; equals the number of distinct source line numbers for STARCOMM (0x0B = 11 lines) and the stubs (8 lines), but not for SPBATTLE (0x21B = 539 vs 689 distinct lines in its LINES table); no module reads it; no reproduction impact | `_*.json` blockA / lines |
| PUT verb numbers | resolved earlier (0 OR, 1 AND, 2 PRESET, 3 PSET, 4 XOR), all listings regenerated | RT_LEDGER 3E_58 |

## 4. Ledger M/L rows

The ledger has exactly one non-H row: `3F_C9` VARPTR(array) -> FAC (M). Game uses: PLBATTLE only (0349 `BLOAD Drive$ + "LOGO.EGA", VARPTR(BoxSave)`: the offset of the DIMmed GET buffer `BoxSave` at 8044); no other module calls it (grep of all six final files: none). For the reproduction the exact numeric form is irrelevant ("BLOAD into that array"); the row can stay M unless mod-plbattle's reading of 033B/0343 needs the value. No ledger text change proposed. (Verify lanes' earlier PUT-verb and INPUT-type corrections are already in.) One addition proposed for the ledger note on temps (§2.5): the base is module header word 17.

## 5. Unknown roll-up (union of the modules' Unknowns sections, deduplicated)

| # | unknown | modules | impact on a faithful reproduction |
|---|---|---|---|
| 1 | meaning of A(83) = 27, A(87), G!(28), G!(2300), G!(2597), G!(742..758), crew fields 7, 55, 90/91 sub-meaning, ship-item field +1 | STARTUP, STARPORT, SPACE | none: written, never read in the decoded modules (PLBATTLE pending for 83/87) |
| 2 | G!(2254) = `BattleWon!` (resolved): after a LOST or fled room battle (0) INSIDE puts the squad back on `OldX!/OldY!`; after a won one (nonzero) it stays on the encounter cell and the room is marked (0D51-0DA4) | INSIDE, PLBATTLE | none (resolved; inside.js 342 already has this polarity) |
| 3 | `G!(0)` vs `G!(3)` roles | SPACE, SPBATTLE | resolved: slot 0 = Engine, slot 3 = Power (NAME 344/347); both must be 1 |
| 4 | `Difficulty!` (SPACE 0xAB8C) | SPACE | resolved: a module-local recomputed on entry - `Difficulty! = 0` (0F40), then `FOR I! = 110 TO 159: IF G!(I!) > 0 THEN Difficulty! = I! - 110` (0F49-0F7F) = the highest mission-flag index that is nonzero (0..49 = how far the mission list has progressed); feeds `EnemyType! = INT(Difficulty! * 5 / 50)` (6BD1) and the found-item range (60A0). space.js 347/353 implement it. (Corrected 2026-10-18, GLMREVIEW D2; the old text said never assigned.) |
| 5 | ENCTABLE/ENCINFO column semantics beyond their use | SPBATTLE, PLBATTLE | none: the use sites define the behaviour |
| 6 | INFO.BAS columns written without a printed label (`field n`) | STARPORT | none: copied into crew/weapon records whose consumers are known |
| 7 | `MoveDX!/MoveDY!` elements 0,1,3 / 1,3,4 assumed 0 | SPBATTLE | none (never written; BASIC arrays start at 0) |
| 8 | `PriceFactor!` = 1.2 at every starport | STARPORT | none |
| 9 | `SOUND 99, 0` silencing the music queue (STARTUP 0DDB) | STARTUP | cosmetic |
| 10 | `FirstRow!` never assigned (INSIDE 2717) | INSIDE | none (0) |
| 11 | `N_9018!` incremented by Fix, never read | INSIDE | none (G!(2250) = 10 is read by PLBATTLE as 1 g, resolved) |
| 12 | block A count word | all | none |
| 13 | `Resumed!`/`DebugLoad!`/`TestMode!` debug paths (never set) | SPACE, SPBATTLE, STARPORT, INSIDE | none: dead code, must not be reproduced |
| 14 | unreachable code blocks listed per module (compiler leftovers) | all | none |
| 15 | COLOR.EXE / FIXIT.EXE / DEMO.EXE purpose | - | none (not in the chain) |
| 16 | G!(81), G!(235), G!(285) written by the PLBATTLE debug fill only; weapon record fields +8/+10 (PLBATTLE names them by use) | PLBATTLE | none (debug path never runs; fields consumed where named) |

## 6. PLBATTLE (final, re-checked against `PLBATTLE.bas.md`)

mod-plbattle posted DONE after the first version of this file; every draft-derived item was re-checked against the final:
- CHAIN sites and conditions unchanged (433B/434A, `EntryMode! = 1` -> SPACE.STR else INSIDE.EXE); before them `BattleWon!` (430D), the boarding epilogue SUB_436D (only for `Terrain! = 10`) and the crew-name un-shift SUB_9685.
- G!(2254) = `BattleWon!` = -((CreditsGained! > 0) OR (Surrendered! > 0)); INSIDE 0D51: 0 -> the squad is put back on `OldX!/OldY!`, nonzero -> it keeps the encounter cell and L_0D6B marks the room (polarity corrected 2026-10-18, GLMREVIEW D1).
- Boarding epilogue: lost boarding -> the kill-list entry SPBATTLE made is retracted (KillPtr! back one slot, the four start pointers -1, Kills! -1, Tonnage! minus the entry); won boarding -> mission checks on `LastEnemyType!` (= `MissionType!-10` completes the mission via SUB_A8B8, = `MissionCodeA!-50` / `MissionCodeB!-50` clears the code), then "Tow linkage broken" when `G!(6) = 2` else "Towing for salvage": the lightest tow entry G!(330..339) and its type G!(320..329) are replaced by the boarded ship.
- ENCINFO columns: §3 row (from the PLBATTLE header). `ChainArg!` is the 0-based first ENCINFO record; following groups come from columns 23/24.
- `Terrain!`, `Surprise!`, `Gravity10!`, `Breathable!`, `Enclosure!`, `BoardCrew!` consumed as described in §2.2; PLBATTLE's local names differ and are listed as rename requests in §2.6.
- `Difficulty!`/A(83)/A(87): not read by PLBATTLE either (A(81), A(235), A(285) are written by its debug fill only).
- Ledger 3F_C9: used once, 0349 `VARPTR(BoxSave)` as a BLOAD offset; no reproduction impact.
- Screens: `PLBATTLE_SCREENS.md` (mod-plbattle) completes the inventory; the master index `SCREENS_INDEX.md` (screens-index lane) still marks its PLBATTLE rows pending.

### Suspects (folded constant indexes - sweep-folded, 2026-10-16)

Decode-error class #3: the compiler folds a constant array index into a direct operand (`mov word ptr [0xBC62],1` = PLBATTLE `Map%(76) = 1`), and the decode had named such addresses scalars. Sweep over all seven modules: every scalar address of the Variables tables (named or `N_XXXX!`) was tested against the COMMON descriptors (MODULE_CONSTANTS.md, §2 above) and the static local arrays' extents; a static array has no DIM record in the listing (RT3F_45 is used only for PLBATTLE's three dynamic GET buffers), so extents come from the READ/FOR loop bounds, the constant indexes used, the 2-D strides and the compiler's contiguous first-appearance layout (the next variable starts right after the array). Every array that has an element reached by a direct operand now carries `A<base>_count` (with the evidence in `A<base>_why`) in its names file, and `qb2bas.py` renders every direct address inside a known range as `Name(idx)` automatically (`--sweep` prints HIT / alias / folded / suspect lines). STARTUP and STARCOMM (hand-written pseudocode) have no local array with a scalar inside.

Hits (behaviour or reading changed):
- PLBATTLE 09AB1 `Map%(76) = 1` (room door, F-6, fixed earlier; 0xBC62 = 0xBBCA + 2*76, TileBank starts at 0xBC6C = 0xBBCA + 81*2).
- PLBATTLE `SquadX!/SquadY!` = `GrpX!(5)/GrpY!(5)`, `TileX!/TileY!` = (6), `ExitX!/ExitY!` = (7), `CenterX!/CenterY!` = (8): 01790 01799 047CA 047D3 04ED5 04EF6 04F7F 04F8D 04FB3 04FBC 099E0 099F3 09A84 09A8F 09A97 09AA0 now write the elements (GrpX!/GrpY! have 9 elements: GrpY! starts at 0xC53C = 0xC518 + 9*4, GrpState! at 0xC560). Reading unchanged (the aliases were documented), rendering now shows that FNDist/FNOffMap/FNMap on slots 5..8 read the same storage.
- SPBATTLE `MyX!/MyY!` = `EnX!(5)/EnY!(5)` (6-element arrays, EnY! at 0x89D8 = 0x89C0 + 6*4): 00C6E 00C77 00E46 03AD4 03AEB 03CDE 03CEF 03E5F 0435C 0436F 04677 0468B 0470F 0471D; with `EnHeading!(5)` (051F1, fixed earlier) the player ship is slot 5 of all three position arrays.
- SPACE `CondMark$`: the stores 0032D/00336/0033F were named `CondMark$(0..2)`, but the array base is 0xAA02 (`add bx,0xAA02` for the indexed reads at 04554/078F1), so they are elements 1..3 = "-" / "*" / "#" for equipment condition 1 ok / 2 broken / 3 unfixable, exactly like STARPORT 01E8-01FA. The old numbering made the inspect-ship (4537) and repair (78E5) lists print the mark of the next condition (space.js carried it: lines 105-107).

Suspects (a scalar within 11 elements after an array whose extent the listing does not prove; none changes behaviour, because no indexed access reaches that element):
- SPBATTLE `EncRec!` 0x8B24, `EnemyName$` 0x8B28, `NumEnemy!` 0x8B2C after `Missiles!` 0x8B04 (would be elements 8..10): `Missiles!(i)` is indexed 0..NumEnemy!-1 <= 4 only (0AB1, 317A, 5CA5, 5E41), and `EnemyName$` is a string descriptor inside a single array's would-be range, so the array ends before 0x8B28.
- SPBATTLE `Arg0E81!` 0x8C5A, `ArgA0EAC!` 0x8C66, `ArgB0EAC!` 0x8C6A after `ArcAngle!` 0x8C42 (elements 6, 9, 10): `ArcAngle!(I!)` runs 0..5; the DEF FN argument slots are allocated where the FN bodies are defined, right after the table.
- SPBATTLE `Arg0FED!` 0x8CD6, `Arg1033!` 0x8CDA after `PortY!` 0x8CB6 (elements 8, 9): `PortY!` is indexed 0..7.

Checked and clean (the scalar starts exactly where the loop-bounded array ends): SPACE `Log4!`/`SndDur!` after `Surface$(1..5)`, `I!` after `OrbitDY!(0..9)`, `J!` after `HeadY%(0..7)`; STARPORT `YesNo!`/`J!` after `RuleWord$(0..49)` (ends 0xA7F0), `PriceFactor!` after `PriceMul!(0..2)`, `I!` after `SlotTag$(0..8)`, `DelayUnits!` after `CmdName$`; INSIDE `PrevRoom!`/`DelayN1!` after `OptionName$(1..22)` (ends 0x8B88), `RoomNo!` after `OpLen%(0..26)`; PLBATTLE `I!` after `AttackVerb$(1..4)`, `J!` after `GrpAttackVerb!(0..3)`, `DelayUnits!` after `CmdName$(0..10)`.

By decision the COMMON `G!` aliases (`Fuel!` = G!(2200), `Delay!` = G!(88) ...) keep their names: they are the cross-module vocabulary of §2.2, every names file documents the index, and the translators map them by address (`--sweep` lists them as `alias`). All other hand-named elements (`G!(7)`, `Status$(1)`, `MoveDX!(1)`, `PixColor!(7, 0)` ...) were dropped from the names files and are reproduced by the automatic resolution (regeneration diff: only the sites above changed).
