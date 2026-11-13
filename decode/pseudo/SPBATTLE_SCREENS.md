# SPBATTLE — screens and flows (lane mod-spbattle)

Evidence: `decode/pseudo/SPBATTLE.bas.md` (offsets below), `decode/data/SPRITES.md` (SPBTSH.BAS / ENSHP-n.BAS / SPACESH.BAS), `decode/data/DATA_FILES.md` (ENCLIST, ENCTABLE). SCREEN 1 pixels, `LOCATE row, column`. SPBATTLE is CHAINed from SPACE (`ChainArg!` = encounter type) and never redraws the console frame: it reuses SPACE's panels (picture window 16..143 x 8..144, ship panel, crew panel, FUEL:/ARMOR:/alert boxes, text box rows 20..24) and only repaints their contents. Keys: see the header of SPACE_SCREENS.md and SPBATTLE.bas.md "Key map".

## 0. Entry (06BA-13D2)

- `BLOAD Drive$+"SPBTSH.BAS", &H73A0`; ENCLIST read up to record `ChainArg!` -> `EnemyName$`, `NumEnemy!`, `EncMod!`, `EncRow!`; `LOCATE 22,3: PRINT NumEnemy!; EnemyName$; "(s)"` (0758); ENCTABLE read up to row `EncRow!` (25 columns) and scaled by `EncMod!` into the per-ship arrays (08F4-0C55); `BLOAD Drive$+"ENSHP"+STR$(-EnSprite!)+".BAS", &H6AA2` (0CAB); player at grid (20,10), enemies spread at x 14..27, y 4 or 16 (0AF0, 0A35).
- Crew commands cleared (`FNIdx(m,37) = 0`), visual window drawn (SUB_4186), then the round loop at L_2088.

## 1. Round start: communications (L_2088-L_2922)

- Crew panel AM/RL refresh (SUB_1831); SUB_2925 classifies the enemy ships; no active ship -> 5 "Battle Over".
- `CommState! = 2` (first round): `LOCATE 22,3: "Establish communications? (y/n)"`; Y -> `"Communications established"` (radio `CommCond! = 1` and either attitude 1 or a comms roll `RND*100 < skill23*5+50` on member 2) or `CrewName$(2); " fails"` (218E) -> battle.
- Communications Phase (21B2-225D): `20,8 "Communications Phase"`, `21,3 "A-Plead"`, `22,3 "B-Ask"`, `23,3 "C-Demand"`, `21,15 "D-Bargain/Bribe"`, `22,15 "E-Impersonate Diety"`, `23,15 "F-None"`, `24,3 "Choose An Approach: (A-F)"`. F -> battle (skip). D forces objective Truce; otherwise `21,3 "A-Fuel"`, `22,3 "B-Truce"`, `21,15 "C-Tribute"`, `22,15 "D-Surrender"`, `24,3 "CHOOSE AN OBJECTIVE: (A-D)"` (22CA-232E).
- Offer score (236C-2509): 50, or for the deity bluff (approach 4 = E-Impersonate Diety) `(EnTech! < 4) * -40` = +40 against tech < 4 and 0 against tech >= 4 (2396; QB true = -1, so the term is a bonus, not -40) x `ApproachTbl!(approach, attitude)` x `StrengthTbl!(approach, strength class)` + `ObjectiveTbl!(approach, objective)`; -99 when no enemy is in view. Roll `RND*400 - Offer!`: >= 0 -> refusal text at 22,3: `"They respectfully decline"` / `"They refuse your offer"` / `"They are insulted by your offer"` / `"They laugh in your face"` by score band (2575-25AE), and an attitude > 1 enemy may turn hostile (2BFD).
- Success by objective: Fuel -> `"They surrender most of their fuel"` then the SPACE fueling bar (`20,9 "Fueling ISS "; ShipName$`, bar 42..270, 25D2-27BE), enemies set to escaped, Battle Over; Truce -> `"They agree to a truce"` or (Bargain) `21,3 "They accept"; n; "credits"` / `"as payment for a truce"` (n = `INT(TotalWt10!)`, paid), Battle Over; Tribute -> `"They pay"; n; "credits"` (tonnage-based, reduced after the 5th tribute `TributeCount!`), Battle Over; Surrender -> `"They surrender all valuables"` then the fuel transfer, Battle Over.

## 2. Movement phase (L_309B-L_3DD8)

- Visual window redrawn; per-ship weapon slots revalidated; 7 sub-phases (`Phase!` 1..7, 7 = enemy only). When the player's move allowance (`CurMove!`) grants a step: `20,12 "Movement Phase"; Phase!`, `21,3 "A-Rotate CCW"`, `22,3 "B-Rotate CW"`, `23,3 "C-Scan"`, `24,3 "D-Visual"`, cursor sprite `PUT (254,160), Cursor, XOR`, `21,17 "E-Skip Move"`, `22,17 "F-Switch"`, `23,17 "G-Time Delay"`, `24,17 "H-Jump To Hyperspace"` (3231-336E).
- Keys (33A0): Up/Left/Right/Down move the player one grid cell (`EnX!(5)/EnY!(5)`, 4704-4726); A/B rotate `ShipHeading!` (needs pilot alive, `G!(3) = 1`, `RetrosCond! = 1`, fuel; else "Pilot or ship not ready") and redraw the ship panel (473F-47C3); C enemy report (3); D visual window (SUB_4186); E skip; F switch positions (same as SPACE: `"Who will change positions?"` / `"Change with who?"`, 3F42); G time delay screen (same as SPACE, 722E); H hyperspace (4). The menu repeats until a move or turn happened (33EF) except after E.
- Enemy moves (3441-3CBF) when their allowance grants a step: turn toward the best weapon arc, then evaluate 5 moves (N/E/S/W/stay) against preferred range/spacing. The grid scrolls so the player stays at (20,10) (3CDE-3D58). The window (visual or scan map, `ViewMode!`) is redrawn after moves.
- Docking (3DD8-3F3F): when exactly one enemy ship remains active and it sits within 1 cell: `20,3 "You have docked with"`, `21,3 EnemyName$; "."`, `24,3 "Will you board? (Y/N)"`; Y -> `G!(2266)` = its fuel, status 5 (docked), `Terrain! = 10`, `Surprise! = 0`, `Gravity10! = 10`, `BoardCrew!` = its hull, `Breathable! = 1`, `Boarding! = 1` -> Battle Over -> CHAIN PLBATTLE.

### Visual window (SUB_4186)

`PUT (32,0), HdrVisual, PSET`; picture area cleared; each enemy ship with |dx| < 7, |dy| < 7 from the player: `PUT (EnX!*8-96, EnY!*8-16), EnShipHead0..7, OR` (wreck sprite `Wreck` for heading 8); player ship `ShipHead0..7` by `ShipHeading!` at `(MyX!*8-96, MyY!*8-16)` (= (64,64)).

### Scan map (SUB_4469)

`PUT (32,0), HdrLongRange, PSET`; grid lines `LINE (46,9)-(46,143)`, `(117,9)-(117,143)`, `(17,43)-(141,43)`, `(17,109)-(141,109)`; enemy ships inside x 8..32 / y -3..23 as `LetterA..E` at `(EnX!*5-23, EnY!*5+24)`; player as `Star` (3x3) at `(MyX!*5-23, MyY!*5+24)` after clearing the cell with `LetterA` PRESET/XOR.

## 3. Enemy report (C key, L_47C4-4935)

- Scan map, then `20,11 "Enemy Report"`; rows `21 - INT(i/3)*3 + i`, column `INT(i/3)*16 + 3`: `CHR$(65+i); "-"` + `"Escaped"` / `"Destroyed"` / `"Surrendered"` / `"In Range"` / `"Out Of Range"`; `24,3` "Press ENTER Key".

## 4. Hyperspace (H key, L_4936-49E6)

- `21,3 "Attempting jump to hyperspace..."`; burns up to 40 fuel (`JumpFuel!`); success `RND <= (fuel used/40)*0.6+0.2` -> `23,3 "Sucessfull"`, all enemies escaped, Battle Over; else `23,3 "Failed"` and the round continues with the firing phase.

## 5. Targeting phase (L_49E9-5151), only while an enemy is in view

- For each gunner member 3..8 with a fitted gun (`G!(m+8) = 1`), alive and not switching: `20,11 CrewName$(m)`, `21,3 "Ships In Range: "` + letters of ships `FNCanHit` or `"None"`; default command from the previous round; `22,3 "Command: "; CmdName$(Command!)` [+ `" at ship "; CHR$(65+Target!)`], `23,3 "ENTER to accept   "` [+ `"A-"; CHR$(NumEnemy!+64); " to retarget"`], `24,3 "W-Wait F-Fire R-Rapid L-Load M-Aim"` (4D8B-4E9D).
- Keys (4EDD): A..E retarget (only ships in range), F fire, L reload, M aim (cycles Aim / Aim more / Best aim 4..6), R rapid fire (7), W wait (0); ENTER accepts: aim level stored in field 56, target in 38, command in 37. `CmdName$` = Wait, Fire, Reload, Switch, Aim, Aim more, Best aim, Rapid fire.

## 6. Firing phase (L_5164-5B81)

- Picture window saved (`GET (16,12)-(143,139), ViewSave`); enemy hit chance `EnHitPct!` 10..90 from pilot skill, `Defence!`, defence hardware and `EnHitBonus!`.
- Time slots run from `GunMax!` down to 0 in steps of `GunRange!/4`; in each slot every gunner whose initiative (field 1) >= slot acts: Reload -> `22,3 CrewName$; " Reloads"` (ammo stock G!(340..369) -> gun +5); Fire/Rapid -> `20,3 CrewName$; " fires"`, `21,3 GunName$(type-1)`, `Shots!` shots each rolled against `HitPct!` (gunnery*5 + hit bonus + gun accuracy + 100/(dist+1) + aim bonuses (+50/+30/+20 for aim level 1/2/3: the `-((aim > n) * k)` terms add, QB true = -1) + enemy defence, halved for rapid fire, 10..90), energy weapons (gun types 15..25, `IsBeam!` = 1) cost 1 fuel, missile types 1..14 use 1 loaded round; each shot animates (missile: dotted `Plus`/`Star` trail with `SOUND 4444`, 6B7A; gun: beam `LINE` colour 1/2 with four SOUNDs, 6A48) and a hit resolves in SUB_6523 (damage minus the facing shield -> `EnArmor!`; below 0: hull breach with a random hit type: engines, steering, defence, shields, weapon slot + possible crew kill, or destruction).
- Report (593F-5A0A): `22,3 "making"; n; "hits"`, `23,3 n; "points of damage done."`, `24,3 EnemyName$; " destroyed!"` / `"Some crew members killed."` / `"Hull breached."` / `"Armor reduced."` / `"Shields absorb damage."`.
- Destruction animation (67E8-6A47): `GET` 40x40 under the ship, `Boom1..4` OR with SUB_6E0A noise, then `SmallBoom1..3` (tonnage < 130) or `BigBoom1..4` XOR, restore, `Wreck` at +8,+8; kill list entry, `EnStrength!` x0.26.
- Enemy fire (5A66-5AF7, only when `Hostile!`): each ship in view fires its arc slots (SUB_5B84): `20,3 EnemyName$`, `21,3 "fires and "` + `"misses."` [+ `23,3 "Intercepted by"`, `24,3 MissileKillerName$(k); "."` for intercepted missiles] or `"hits."` + `22,3 "Shields absorb damage."` / `"Armor reduced."` / `"Hull breached."` (`HullCond! = 2`) / `EquipName$(slot); " destroyed."` (slot 0..24; 9..16 = crew slot -> `24,3 CrewName$; " dies."` with red alert, `MyStrength!` x0.68; 18 disables the missile killer); player ship destroyed -> 10 window flashes -> 8 "You Are All Dead".
- After the slots: the enemy turns hostile with chance `EnAttitude!*25-25` or if the player fired (5B74); back to 1.

## 7. Battle Over / Battle Report (L_2C10-2F48)

- `22,14 "Battle Over"`; if life support `LifeSuptCond! <> 1`: 9. `CLS`, `LOCATE 1,14: "BATTLE REPORT"`, one line per enemy ship `"#"; CHR$(49+i); " "; EnemyName$; " - "` + `"Survived"` (escaped) / `"Docked"` / `"Surrendered"` / `"Destroyed"` (the last two add a kill-list entry: ship type `EnShipType!`, tonnage, `Kills!`, `Tonnage!`).
- Mission hooks: `MissionType!-10 = ChainArg!` with a kill -> SUB_73A9 (mission done); mission codes `-50 = ChainArg!` cleared.
- `LastEnemyType! = ChainArg!`; `CHAIN Drive$+"SPACE.EXE"` (2F30) or, after boarding, `ChainArg! = EnBoardArg!`, `CHAIN Drive$+"PLBATTLE.STR"` (2F48).

## 8. You Are All Dead (L_3063)

- Picture area cleared, `LOCATE 9,3: "You Are All Dead"`, 15 s TIMER wait, `END`.

## 9. Life support failure (SUB_2F4B, after Battle Over when `LifeSuptCond! <> 1`)

- `20,3 "Life Support is out!"`, `21,3 "You have a few seconds left."`, `24,3` "Press ENTER Key"; `"Who will fix it?"` (SUB_15A6, must pick someone); roll `RND*100 < repair skill*10+35` -> `21,3 "Life Support fixed at the"`, `22,3 "last second!"` (`LifeSuptCond! = 1`), else `21,3 "As "; CrewName$; " struggles with the life"`, `22,3 "support systems your air runs out."` -> 8.

## CHAIN table

| offset | target | COMMON values set before |
|---|---|---|
| 2F30 | `Drive$ + "SPACE.EXE"` | `LastEnemyType! = ChainArg!`, kill list, mission flags |
| 2F48 | `Drive$ + "PLBATTLE.STR"` | `ChainArg! = EnBoardArg!`, `Terrain! = 10`, `Surprise! = 0`, `Gravity10! = 10`, `BoardCrew!` = enemy hull, `Breathable! = 1`, `G!(2266)` = enemy fuel |

SUB_72B9 (called before each CHAIN) is an empty `RETURN`, like SPACE's SUB_81E6.
