# SPACE — screens and flows (lane mod-space)

Evidence: `decode/pseudo/SPACE.bas.md` (every offset quoted below is a statement in that file, derived from `decode/listings/SPACE.lst`), `decode/data/SPRITES.md` (SPACESH.BAS array inventory), `decode/data/DATA_FILES.md`. Coordinates are CGA SCREEN 1 pixels (320x200), text positions are `LOCATE row, column` (1-based). SPACE runs entirely in SCREEN 1; with `UseEGA! = 1` it sets `PALETTE 1,9` and `PALETTE 2,4` (1032-1049).

## Keys (SUB_212C and SUB_1C58)

| reader | key | `Cmd!` | used by |
|---|---|---|---|
| SUB_212C (2137-21E4) | extended keys: INKEY$ 2nd byte - 70 | 1 Home, 2 Up, 3 PgUp, 4 KP-, 5 Left, 6 KP5, 7 Right, 8 KP+, 9 End, 10 Down, 11 PgDn | main view, sector scan, system scan (only 2/5/7/10 do anything) |
| SUB_212C | letters A..Z (either case) | 12..37 | menu letters: A = 12, B = 13 ... |
| SUB_212C | cursor key while `G!(0) = 2` or `G!(3) = 2` or pilot dead | 40 = "Pilot or ship not ready" (2238) | caller returns to the long-range view (1C08, 311F, 3FA3) |
| SUB_212C | cursor key while `G!(0) <> 1` or `G!(3) <> 1` otherwise | never returns: "Ship is irreparable. The crew starves!" (228B, loop 2297) | game over |
| SUB_1C58 | letter A.. (either case) | 1.. (A = 1), accepted when `CmdMin! <= Cmd! <= CmdMax!` | sub-menus |
| SUB_1C58 | ENTER | -51 | back / cancel |
| SUB_1C58 | SPACE | -32 | next page / ignore |
| SUB_2544 | Y/y, N/n | `YesNo!` 1/0 | yes/no prompts |
| SUB_1828 | ENTER = 0, P = 1, C = 2, 1..6 = 3..8 | `Member!` | crew pickers ("Who will change positions?", "Change with who?", "Inspect Who?") |
| SUB_2327 | typed text, BACKSPACE, ENTER | `K$`, `NumIn%` | delay factor input |

## 0. Console frame (SUB_1023, drawn once on entry and after every CHAIN return)

Fixed furniture (all `LINE`/`CIRCLE`/`PAINT`, colour 2 outline, 0 fill):
- Full-screen background `LINE (0,0)-(319,199),1,BF` with a colour-2 double border (1069-10A4).
- Picture panel x 16..143, y 8..143 (rounded ends at 10D0-11A2); its content is one of the scan views below.
- Ship panel x 248..303, y 6..64 (12CC-139E): ship sprite for `ShipHeading!` at (264,24) from the SHIP-n.BAS bank (`ShipHead0..7`, SUB_1CE3 1D0A-1DE8), the six gun-number digits (`Digit1..6`, 4x5) at the 8 compass positions `HeadX%()/HeadY%()` rotated by the heading (1DF4-1EC8), shield arcs `CIRCLE (275..277, 35..37), 25.5` per shield `G!(7..10)` (SUB_1FB5).
- Crew panel x 160..303, y 70..144 (13CA-149C): header `LOCATE 10,25: "NAME    AM RL"`, rows 11..18: `SlotTag$(m) + ">"` at column 21 (15DC-15DF), name or `Status$` at column 23 (SUB_1A7B), gun ammo columns per gun 1..6 at column 33 (SUB_16F7: `"-- --"`, `"Okay"` or `"## ##"` loaded/stock).
- Logo panel: `PUT (154,0), Logo, PSET` (14B4), three boxes (157,22+16k)-(234,33+16k) (1535-1586) holding `LOCATE 4,21: "FUEL:"` + `PRINT USING "####"` at 4,26 (SUB_1A5F), `LOCATE 6,21: "ARMOR:"` + `PRINT USING "###"` at 6,27 (SUB_1A28, clipped to 999), and the alert box at 8,21: `"   RED   "` / `" YELLOW  "` / `"  GREEN  "` / blank (SUB_24E0/24F9/2512/252B).
- Text box x 16..303, y 152..191 (11CE-12A0): menus and messages, rows 20..24, cleared by SUB_2299 (`LINE (16,152)-(303,191),0,BF`).

## 1. Long-range view = sector map tile (SUB_2626 + SUB_28C1; default view, label "LONG RANGE")

- Picture: `PUT (32,0), HdrLongRange, PSET` (263B); `BLOAD "MAP"+STR$(-MapNo!)+".BAS", &H9008` when the tile changes (2705; galaxy = 4x4 tiles of 8x8 cells, `MapNo! = MapRow!*4 + MapCol! + 1`), `PUT (16,16), PicBuf, PSET` (271A); ship position marker `PUT (CellX!*16+16, CellY!*16+16), PlanetMark, XOR` (2819/28F0).
- Status line `LOCATE 2,5: "(" x+1 "," 32-y ") ZN:" ZoneTag$(Zone!)` (2935-2938); alert box green for zones N/? else yellow with a 7-cycle siren `SOUND 4444/678` (29B2-2A39).
- Menu (L_1B5D, 1B69-1BE1): `A-Up Scan    B-Switch` / `C-Computer   D-Down Scan` / `E-Equip      F-Fix` / `H-Heal       I-Inspect` / `J-Time Delay L-Load     SELECT ONE`, cursor sprite `PUT (240,156), Cursor, XOR` (1B8B).
- Keys (1C13/1C39): Up/Left/Right/Down move one cell (L_271E/274E/27B4/277E; refused at the galaxy edge, 2745-27E1), each move = `PUT` marker, `SectorX!/SectorY!/SectorIdx!` += `DX!/DY!`, tile reload when leaving the 8x8 cell range (28B9), fuel -5 (2822 via SUB_87AD), out-of-fuel check (SUB_87DC), clock +10 h (2A4F, SUB_8973), rad tick (2A9D), encounter roll `RND*100 < EncChance!` -> flow 12 (2AB4). A -> 2 galaxy scan (L_32DF), B -> 5 switch (L_4094), C -> 6 computer (L_51F8), D -> 3 sector scan (L_321A), E -> 10 equip (L_83A3), F -> 7 fix (L_429A), H -> 8 heal (L_4AA8), I -> 9 inspect (L_6E0E), J -> 11 time delay (L_8318), L -> load guns (L_81E7: moves ammo `G!(340..369)` into the gun records `G!(690+7i)`, redraws the AM/RL columns), G/K ignored.

## 2. Galaxy scan (L_32DF, "GALAXY SCAN")

- `PUT (32,0), HdrGalaxyScan, PSET`; `PUT (16,16), GalMap, PSET` (GALMAP.BAS); text `LOCATE 20,3: "D-Down Scan"`.
- Blinking ship dot: `PSET`/`PRESET (SectorX!*3+37, SectorY!*3+37)` with SUB_1657 delays (3336-3377).
- Keys: D (3380-33A1) -> back to the long-range view (L_33A6 = SUB_2626 + SUB_28C1 + menu).

## 3. Sector scan (L_321A: SUB_2ACA + SUB_30B1, "SECTOR SCAN")

- `PUT (32,0), HdrSectorScan, PSET`; the current cell's 16x16 picture pixels are decoded from `PicBuf` words (2E22-305B) and shown 8x zoomed as 8x8 blips: colour 1/2/3 -> `Blip1/2/3` at `(BlipX!, BlipY!)` (2FF5/303E/3058); black-hole cell -> `PUT (72,72), BlackHoleMark, XOR` (2DDF).
- Mission sector codes: `MissionCode1!/MissionCode2!/MissionEnc!` set when `SectorX!/SectorY!` equal the mission targets (2B15-2B6F).
- Black hole (SectorCode! 2099..2102, 2BB5-2D3E): `PUT (32,0), HdrVisual`, `PUT (28,28), Starfield, XOR`, text `LOCATE 22,3: "You are pulled into a black hole!"`, `PLAY "mb"`, 50 random black lines with `SOUND 44`/`77`, then `SectorX!/SectorY!` = (14,8), (29,13) or (22,11) by code and the console is redrawn (GOTO L_0FBE).
- Menu (SUB_30B1): `LOCATE 20,3: "A-Up Scan"`, `21,3: "D-Down Scan"`, `PUT (156,156), Cursor, XOR`, `LOCATE 24,3: "SELECT OPTION"`.
- Cursor: `PUT (CursorCol!*7.46+16, CursorRow!*8+16), PlanetMark, XOR` (31F8/3256), arrows move it 0..14 (3163-31BF); each move: fuel -INT(RND*1.1), clock +1 h, rad tick, encounter roll with `EncChance! + MissionEnc!` (326B-32D7).
- Keys: A -> long-range view (L_315D); D (L_33F1) -> `StarClass! = PixColor!(CursorRow!, half)`: 0 -> `LOCATE 21,15: "Empty Area"` + `24,13` "Press ENTER Key" (3465-3492); 1..3 -> 4 system scan; >= 4 -> 3a starport or 3b space station.

### 3a. Starport (L_34A3-L_361A, `SectorCode! = 1000+n`)

- `PUT (32,0), HdrVisual`; `BLOAD "SPPIC"+STR$(-PortNo!-1)+".BAS", &H9008`; `LOCATE 4,7: "STARPORT"`, `5,7: PortName$(PortNo!)` (" EARTH" / "SOLONOR" / "  LUNA"); `PUT (28,40), Starfield, XOR`; `PUT (40,56), PicBuf, PSET`.
- Menu: `20,3 "A-Up Scan"`, `21,3 "B-Dock With Starport"`, `22,3 "C-Refuel Only"` (SUB_168A "Select Option").
- A -> sector scan; B -> `EntryMode! = 0`, `ChainArg! = PortNo!`, `CHAIN Drive$+"STARPORT.STR"` (3617); C -> SUB_3629 refuel animation: `LOCATE 20,8: "Fueling ISS "; ShipName$`, bar `LINE (30,168)-(283,188),,BF` / `(42,175)-(270,181),0,BF` / green `(42,175)-(x,181),2,BF` growing 2 px per `SOUND i*10` step (36C8-3782).

### 3b. Space station (L_37A8-L_3888, `SectorCode! = 2000+n`, reached when `SectorCode! > 1777`)

- `BLOAD "SPSTGRPH.BAS", &H9008`; `PUT (28,28), Starfield, XOR`; `PUT (40,48), PicBuf, PSET`.
- Menu: `"A-Up Scan"`, `"B-Dock With Space Station"`. B -> `EntryMode! = 3`, `StationNo! = SectorCode!-2000`, `Gravity10! = 1`, `CHAIN Drive$+"INSIDE.STR"` (3888).

## 4. System scan (L_388B-L_4091, "SYSTEM SCAN")

- Deterministic system from `RND(-seed)` of the sector and cell coordinates (38E8): up to `NumBodies!` planets on 10 orbits with size class, gravity, density, surface and life (3917-3D3B).
- `PUT (32,0), HdrSystemScan, PSET`; star `PUT (64,72), Star1/2/3, XOR` by `StarClass!` (3DB4-3DF4); `LOCATE 3,3: "Star"; -StarNo!` (3E38); planets `PUT (OrbitDX!(i)*mirror*8+67, OrbitDY!(i)*mirror*8+75)` via SUB_9138 (20x20 / 16x16 / 8x8 sprites by class, 3E95-3EBD); cursor `PUT (SysCurX!*8+20, SysCurY!*8+28), PlanetMark, XOR` (3F11/4072).
- Menu SUB_30B1 (A-Up Scan / D-Down Scan). Arrows move the cursor 0..11 (3FE1-403D) with the same fuel/clock/rad/encounter step as the sector scan (3F26-3F92).
- Keys: A -> sector scan (L_321A); D (L_5663) -> planet at `(SysCurX!-6, SysCurY!-6)` on an orbit -> 4a visual, else `LOCATE 21,16: "Empty Area"` + `24,14` "Press ENTER Key".

### 4a. Planet visual (L_574B-L_5D63, "VISUAL")

- `PUT (32,0), HdrVisual`; `LOCATE 3,11: "Planet"; LEFT$(STR$(-PlanetNo!),2)`; `LINE (16,24)-(143,143),0,BF`.
- Readout: `5,3 "ATMOSPHERE:"`, `6,4` gas list by class/gravity (`"Hyd, Hel"[, Meth]` / `"Nit, Oxy"[, C Di]` / `"C Di, "` + `Oxy`/`Arg`/`Nit`, 57F1-58E7), `7,4 "Breathable"`/`"Unbreathable"` (surface 2 or 3), `8,3 "MASS:"`, `9,3 "GRAVITY:"`, `10,3 "DIAMETER:"`, `11,3 "DENSITY:"` (numbers rounded to two decimals via `LEFT$(STR$(FNRound2(Val!)),n)`; mass = `PlDiameter!^3 * PlDensity!(Idx!)`), `12,3 "LIFE: "; TechLevel$(PlTech!)`, `13,9 LifeForm$(PlForm!)` when tech > 0, `15,9 "SURFACE:"`, `16,10 RIGHT$("     "+Surface$(PlSurface!),8)`; divider `LINE (16,97)-(61,98),,BF` + `(61,97)-(62,143),,BF`; planet sprite at (28,111) (SUB_9138).
- Mission hooks before the menu: incoming signal (SUB_65A9: `"Incoming signal,"` / `"will you receive? (y/n)"`, then `CrewName$; " decodes the message"` or `"No one can decode the message"`, message text 34 chars per row rows 20..22 with "Press ENTER Key"), enemy ship `MissionCode 50..149` -> flow 12 (5D24-5D63).
- Menu (5D66-5DE7): `20,3 "A-Up Scan"`, `21,3 "B-Espionage Mission"`, `22,3 "C-Scientific Investigation"`, `23,3 "D-Cargo Pickup/Delivery"`, `20,18 "E-Visit Unique Area"`.
- A -> back to the sector-scan select (L_33F1). B (L_5FB4): needs tech level 1 and life form <= 3 else `"Not possible"` (SUB_5F95); drop-ship launch (4b), clock +24 h, up to 6 finds into `G!(160+item)`, `"You found"; n; "items"` / `"Nothing new found"`, surface encounter roll (SUB_6B82) -> PLBATTLE (6DC6). C (L_5E12): drop-ship launch, clock +12 h, up to 5 finds `"You have found:"` / `ItemName$(FoundItem!)` into `G!(400+item)`, `"Nothing new found"`, surface encounter roll. D (L_61FF): `"No transactions on this planet now"` unless a mission code or tech 1/3; mission shipment `"Will you accept a shipment of"` / `ItemName$ " ?"` / `"(y/n)"` -> `"Cargo Loaded"`; delivery `"The locals await a shipment of"` / `ItemName$` / `"but you have none"` or `"Will you give them yours? (y/n)"` -> `"They thank you"`; otherwise trade by density: `"Buy 20 units of fuel for 150"` / `"credits? (Y/N)"` (6B35), `ItemName$; " is needed."` + `"Will you sell for"; Price!; "credits?"` (6A69-6AE1), or `"Will you pay"; Price!; "credits for"` + `ItemName$; "? (Y/N)"` (697A-699C) -> `LOCATE 22,19: "OK"`. E (L_67CE): `"Scanners reveal nothing unusual"` unless `PlanetKey! = SectorCode!`, then `"Scanners detect a unique structure"` / `"Send a drop ship? (y/n)"` -> drop-ship launch, clock +24 h, `EntryMode! = 4`, `CHAIN Drive$+"INSIDE.STR"` (6879).

### 4b. Drop-ship launch (SUB_8D15)

- `"Drop ship or pilot not ready"` (8DD5) unless the 3 drop-ship parts `G!(20..22) = 1` and member 2 is alive with field 17 > 0.
- `GET (15,8)-(143,144), SaveArea`; picture cleared; `PUT (28,12), Starfield, XOR`; planet sprite at (60,63); frames `DropShip1..7` at (56,12) (44,12) (44,12) (52,19) (56,33) (60,46) (64,52) each with three rising `SOUND`s (SUB_8F2E); `LINE (64,59)-(71,61),0,BF`; pause; `PUT (15,8), SaveArea, PSET`.

## 5. Switch positions (L_4094)

- SUB_1828 prompts `"Who will change positions?"` then `"Change with who?"` (row 22); swaps the two 100-element crew records in `G!`, `CrewName$`, and the owner numbers in all item records (4144-422C); crew panel redrawn (SUB_1A7B).

## 6. Computer (L_51F8)

- `LOCATE 21,14: "Computer Broken"` when `G!(5) <> 1` (5215).
- Menu: `20,3 "A-Total Kill List"`, `21,3 "B-Mission Kill List"`, `22,3 "C-Kill List Since Starport"`, `20,27 "D-Mission"`, `21,27 "E-Tow List"` (SUB_168A).
- A/B/C: header bar (SUB_33AF), `LOCATE 2,6: "KILL LIST"`, rows `Idx!+4`: `LEFT$(ShipType$(G!(210+i)),10)` at column 3 and `ABS(G!(260+i)); "T"` at column 13, 12 rows per page with "Press ENTER Key" at 18,3 (SUB_548D); A first shows `7,3 "Kills:"; Kills!` and `11,3 "Tonnage:"; Tonnage!` (52FC-531E).
- D (L_4FF2): reads the active mission text from the MISSION file (`OPEN Drive$+"MISSION" FOR INPUT AS #1`, record `Idx!`), prints it 34 chars per row at 20..22,3 with "Press ENTER Key" per page (50FD-51B2); `"You have completed your mission"` when no flag is active (51C4).
- E (L_5546): `2,7 "TOW LIST"`, `4,3 "# Ship      Tons"`, rows 6..15: digit, `LEFT$(ShipType$(G!(320+i)),10)`, tonnage `MID$(STR$(ABS(G!(330+i))),2,3)` at column 16.
- ENTER backs out to the long-range view (52BD).

## 7. Fix (L_429A)

- Picks the alive member with the best repair skill (field 26); `LOCATE 20,6: CrewName$; " Repairing"`, `21,3 "A-Repair Ships Equipment"`, `22,3 "B-Repair All Personal Equipment"`; ENTER -> ship panel/crew panel refresh and back (43E8-43F1).
- A (L_4402): equipment list in the picture panel: rows 2..18 col 3 (letters A..Q), 20..22 col 3 (R..T), 20..22 col 21 (U..W): `CHR$(65+i); CondMark$(cond); EquipName$(i)` or `"----------"` (SUB_44F4); `LOCATE 24,3: "Repair What?  *-Broken #-Unfixable"`; letter of a broken item (cond 2) -> clock +24 h, fuel, `LOCATE 24,12: "Sucessful"` (cond -> 1; 10% `"Kit Used Up"`) or `"Failure"` (cond -> 3).
- B (L_46D8): repairs armor (fields 48/49/55) and broken weapons `G!(803+12i) = -1` for all members; summary `20,3 "Items fixed:"; n`, `21,3 "Items rendered unfixable:"; n`, `22,3 "Repair kits used up:"; n`, "Press ENTER Key" at 24,3.

## 8. Heal (L_4AA8)

- Menu `20,3 "A-Squad Health"`, `21,3 "B-Heal Squad Member"`.
- A (L_4B18): `20,7 "Squad Hit Points and Status"`, two columns of four: `SlotTag$(m) ">" INT(HP) "/" INT(maxHP) Status$(status)` at rows 21..24 (4B81-4C32), SUB_1C58 waits.
- B (L_4C6C): best medical skill member; `20,7 CrewName$; " Healing"`; for each member needing it: `22,3 CrewName$; " is "` + `"not healed"` / `"healed 4 points"` / `"fully healed"`, `23,3 "Medkit used up"` (20%), "Press ENTER Key"; `22,3 "Squad is fully healed"` when nobody needed it.

## 9. Inspect (L_6E0E)

- Menu `20,3 "A-Inspect Ship"`, `21,3 "B-Inspect Squad"`; ENTER backs out.
- A (L_76DE), pages separated by SUB_998F (`18,4 "Press SPACEBAR"`; ENTER returns to the menu): (1) `2,3 "ISS "; LEFT$(ShipName$,12)`, `Base Wt...`/`Cargo Wt..`/`Total Wt..`/`Max. Wt...` with `" tn"` rows 5..8, `Armor.....`, `Defence...` (`+##%`), `Max. Move.`, `Cur. Move.` rows 11..14; (2) equipment list rows 4..14 `CondMark$ + EquipName$` for slots 0..6 and 19..22, `16,3 "*Brkn #Unfixable"`; (3) `Missle` / `Killer....##%`, `Defence` / `Hardware..##%`, `Shield 1..4...###pt` rows 11..14; (4) SUB_952B `2,3 "Ships Guns"` six `n>` rows with `GunName$` word-wrapped (SUB_95FB); (5) `2,6 "Cargo"`: `LEFT$(ItemName$(i-400),16)` for `G!(400..499) <> 0`, 13 per page.
- B (L_6E7E): SUB_1828 `"Inspect Who?"`; pages: (1) `2,7 CrewName$`, `4,3 "Rank: "; LEFT$(Rank$,10)`, `5,3 "Class: "; ClassName$`, `6,3 age "yr    "; Status$`, `7,3 "HP"; cur; "/"; max`, rows 9..15 `AttrName$(i)` dotted leaders + value; (2) `Hit Bonus.+##%`, `Defence...+##%`, `Max Wt....## kg`, `Cur Wt....## kg`, `Max Move..##`, `Cur Move..##` rows 4..9, `11,3 "Non-Esper"` or `"Esper Ability"` + `"Level"; n`, `"Mindshock"`, `"Communications"`, `"Healing"`, `", View"`, `"Psychic Scream"` by level (72B4-73BB); (3) rows 5..16 `LEFT$(Skill$(i),13)` dotted to column 18 + skill digit; (4) `Armor.....##/##`, `Sighting` / `Hardware.##%`, `Clones....##`, `Hand` / `Weapon...nn pts`; (5) carried items `LEFT$(MiscItemName$(type-1),16)` rows 5..17; (6) L_974E `2,3 "Rlds  Weapons"`: reload count digit, `"*"` for broken, `WeaponName$` word-wrapped, 12 rows per page.

## 10. Equip (L_83A3, "EQUIPING")

- Header bar; `2,7 "EQUIPING"`; rows from 4: `CHR$(65+k); "-"; SlotTag$(owner)` then the item name at column 8: squad weapons `G!(800..1088 STEP 12)` (`"Weapon"`), ammo `G!(1100..1397 STEP 3)` (`"Ammo For"`), items `G!(2300..2597 STEP 3)` (`MiscItemName$`), names word-wrapped (SUB_856B/SUB_95FB), 11 rows (A..K) per page.
- `17,3 "SPACE for more"`, `18,3 "A-K to change"`: a letter cycles that item's owner 0..8 and reprints `SlotTag$(owner)` at column 5 (8737-878E); SPACE next page; ENTER leaves (`Ix! = 9999`, 86E3) -> long-range view.

## 11. Time delay (L_8318)

- `20,3 "Standard Delay Factor:"; StdDelay!`, `22,3 "Current Delay Factor:"; Delay!`, `24,3 "New Delay Factor (1-9999): "` + line editor (SUB_231E/SUB_2327, 4 digits, BACKSPACE), clamped 1..9999 -> `Delay!`.

## 12. Encounters and combat (L_9046 -> L_8FA0)

- `EnemyType! = G!(Zone!+2230) * -(RND > .1)` (+ RND*3), `BaseEnc!` adjusted (9080-90CB).
- `21,3 "Scanning nearby craft"`, red alert siren (SUB_8B33), 3 pauses; `23,3 "It is friendly.  Approach? (y/n)"` when `EnemyType! < 1` (N -> back to the long-range view, Y -> random type 0..9) else `"Unidentified, prepare for combat"`; `ChainArg! = EnemyType!`, `CHAIN Drive$+"SPBATTLE.EXE"` (9043).
- Surface combat: `SUB_6B82` prints `21,3 "Confrontation on planet surface"` / `"Surprised by enemy beings"` / `"Enemy beings spotted by "; CrewName$` + `23,3 "Fight them? (y/n)"`; then (L_6DC6) red alert, `ChainArg! = EnemyType!`, `Surprise!`, `Terrain!`, `Breathable!`, `CHAIN Drive$+"PLBATTLE.STR"` (6E0B).

## 13. Out of fuel (SUB_87DC, after any fuel use that reaches 0)

- `20,3 "Out of fuel!"`, red alert, `21,3 "Rescued in"; days; "days"`, `22,3 "for"; 20000; "credits."` (credits deducted), possibly `23,3 CrewName$; " has starved to death."` (status -> 0), clock + days*24 h, "Press ENTER Key", 30 units of fuel (SUB_3629 animation).

## 14. Other messages

- `20,3 CrewName$(Member!); " is dead."` (25B6-25B9, unreferenced block after SUB_2544).
- `"(yes/no) "` three-letter yes/no input (25E3-2622, unreferenced block).
- Radiation death: SUB_89F8 flashes the crew name 20 times with the siren.
- Game over: `CLS`, `LOCATE 12,1: "Ship is irreparable. The crew starves!"`, infinite loop (227C-2297).

## CHAIN table

| offset | target | COMMON values set before |
|---|---|---|
| 3617 | `Drive$ + "STARPORT.STR"` | `EntryMode! = 0`, `ChainArg! = PortNo!` |
| 3888 | `Drive$ + "INSIDE.STR"` | `EntryMode! = 3`, `StationNo!`, `Gravity10! = 1` |
| 6879 | `Drive$ + "INSIDE.STR"` | `EntryMode! = 4` (planet unique area) |
| 6E0B | `Drive$ + "PLBATTLE.STR"` | `ChainArg! = EnemyType!`, `Surprise!`, `Terrain!`, `Breathable!`, `Gravity10!` |
| 9043 | `Drive$ + "SPBATTLE.EXE"` | `ChainArg! = EnemyType!` |

SUB_81E6 (called before every CHAIN) is an empty `RETURN`; the save of `G!` happens in the chained module (STARTUP/STARPORT write CHARINFO/CHARNAME per DATA_FILES.md).
