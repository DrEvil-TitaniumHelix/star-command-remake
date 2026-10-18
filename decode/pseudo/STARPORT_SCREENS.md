# STARPORT — screens and flows (lane mod-starport)

Evidence: `decode/pseudo/STARPORT.bas.md` (offsets), `decode/data/SPRITES.md`, `decode/data/DATA_FILES.md`. SCREEN 1 (CGA 320x200), `PALETTE 1,9` / `2,4` when `UseEGA! = 1` (0058-006F); `LOCATE row, column`. STARPORT is CHAINed from SPACE with `ChainArg!` = starport number (0 EARTH, 1 SOLONOR, 2 LUNA) and chains back to SPACE.STR on "L-Leave".

## Keys

`SUB_22C4`: letters -> A = 1.. (either case), ENTER -51 (back), SPACE -32 (next page), ESC -37 (leave a pick list); `SUB_1F14` crew picker (ENTER none, P pilot, C captain, 1..6 members 3..8); `SUB_28BA` y/n; `SUB_2950` typed yes/no; `SUB_24F4` text input with BACKSPACE; `SUB_A422` single digit.

## 0. Frame (SUB_1C09, drawn once on entry: its only caller is 0107D; after the medal ceremony only the picture is re-PUT at 0AC3F)

- `CLS`, `KEY OFF`; outer border `LINE (1,2)-(318,197),,B`, logo box `LINE (231,6)-(313,26),,B` (1CFC-1D15), text box `LINE (5,117)-(314,194),,B`; banner `LOCATE 2,7: "STARPORT "; PortName$(PortNo!)` captured with `GET (48,8)-(220,15)` and re-put `PRESET` (inverted) inside the filled bar `LINE (5,17)-(226,6),,BF`; left panel `LINE (5,5)-(226,114),,B`; logo box `(230,5)-(314,27)` with `PUT (232,7), Logo, XOR`; right panel `(230,30)-(314,114)`; colour-1 bars (1D7F-1E43).
- Left panel: squad list (SUB_646D): `4,6 "Rank"`, `4,15 "Name"`, `4,24 "Class"`, rows 6..13: `SlotTag$(m) ">"` + `RIGHT$("     "+LEFT$(Rank$,10),10) name(9) class(3)` (`"Injr"` when HP < max, `Status$` when not Okay) or 25 spaces.
- Right panel: starport picture `PUT (232,32), PortPic, PSET` (SUB_1EFD; SPPIC-(PortNo!+1).BAS).
- Text box rows 16..24 (x 7..312, y 119..192), cleared by SUB_2352 / SUB_2374.

## 1. Arrival processing (L_10CF-L_1C06, before the main menu)

- Aging: for each member, age = field 29 + days away/2; when a new year >= 60 is reached, roll `RND*100 < years*4-236` -> `19,2 CrewName$; " has aged."`, attributes 0..2 lose 1..4; an attribute at 0 -> record wiped, `21,2 CrewName$; " is dead"`; derived fields recomputed (SUB_26A6); `24,2` "Press ENTER Key" (11FB-138F).
- Kill rewards since the last starport (SUB_161E per entry): `17,2 "As a reward for "; "defeating"`, `18,2 "a "; ShipType$; " ship"`, `19,2 "weighing"; n; "tons"`, `20,2 "you receive"; n; "credits."` (20 credits/ton, 4/ton for type 9); tow list entries the same with `"towing"` and 10/ton (SUB_15D5); the lists are cleared.
- Espionage finds (SUB_150A): `17,2 "You found a valuable item,"`, `18,2 "analysis reveals it to be:"`, `19,2 FindName$`, `21,2 "You recieve"; n; "credits."`.
- Completed missions (G!(110..159) = 2): `19,2 "Congratulations for completing your"`, `20,2 "mission you receive"; n; "credits."` (1000 x mission number); special bonuses (SUB_13DC): `17,2 "Your performance on this last mission"`, `"was so outstanding you made every"`, `19,2 "headline in the traingle."`, `21,2 "You have earned a special bonus"`, `22,2 "of"; n; "credits."`; pay per member: `17,2 Rank$; " "; CrewName$; " receives"`, `18,2 n; "credits in pay"` (pay table x days/30, max 60 days), promotion `20,2 "Your promotion came through"`, `21,2 "You are a "; Rank$(rank+1)`; each member gains a training session (field 9).
- Medal of honor (SUB_A932, bonus index 109): `18,4 CrewName$; " receives a medal of honor!"`, rising dot `PSET/PRESET (288, y)` with SOUND, flame + 14 "fire" frames in the right panel, tune; `22,13` "Press ENTER Key".

## 2. Main Menu (L_210D)

`16,11 "Main Menu"`; `17,2 "A-Personnel"`, `17,20 "G-Game Save"`, `18,2 "B-Buy"`, `18,20 "H-Headquarters"`, `19,2 "C-Sell"`, `19,20 "I-Inspect"`, `20,2 "D-Dry Dock"`, `20,20 "K-Christen"`, `21,2 "E-Training"`, `21,20 "L-Leave"`, `22,2 "F-Fuel"`, `22,20 "M-Medical"`, `23,20 "T-Time Delay"`; `24,2 "Select Option"`.

## 3. A-Personnel: Recruitment Office (L_543C)

- `16,6 "Recruitment Office"`, `19,2 "A-Recruit New Squad Member"`, `20,2 "B-Dismiss Squad Member Permanently"`, `21,2 "C-Change Positions"`.
- A (L_557E): needs a free slot (else "No More Of That Allowed Onboard"); attributes rolled (30..71), esper potential 0..49 (50..52 with 5% if no Esper exists); shown as `AttrName$(i)` + value rows 16..22 col 9; `24,2 "Keep this squad member? (y/n)"`; class menu rows 16..18 `A-Marine B-Pilot C-Soldier` (+ `19,2 "D-Esper"` when potential > 50); `20,16` class name; Basic Training years 1..8: `16,10 "Basic Training Year"; n`, up to 10 skill choices `A-..J-` + `Skill$` (two columns, from `TrainTable!(class, slot)`), `24,2` "Select Option"; 20% `17,2 "You did not make it"`; `19,2 "Your assignment: "; Skill$`; attribute training (`"X is"; value` rows 21/22), skill levels `21,2 "You reach "; Skill$; " level"; n`, promotions `23,2 "You are promoted to "; Rank$`; finally `20,2 "Input Name: "` (8 chars).
- B (L_54D7): picker `"Dismiss Which Squad Member?"`, `19,2 "Dismiss "; name; " permanently?"` + typed yes/no; record and name cleared.
- C (L_627F): `"Who will change positions?"` / `"Change with who?"`: records, names and item owners swapped.

## 4. B-Buy: Arsenal (L_37D0)

- `16,8 "Arsenal"`, `19,2 "A-Buy Personal Equipment"`, `20,2 "B-Buy Ships Equipment"`, `21,2 "C-Buy Ship"`.
- A (L_3874): picker `"Who Will Buy?"`; header `16,2 CrewName$; " Buying With"; credits; "Credits"`; `19,2 "A-Regular Weapon"`, `20,2 "B-Ammo"`, `21,2 "C-Hand Weapon"`, `19,20 "D-Sighting Hardware"`, `20,20 "E-Armor"`, `21,20 "F-Miscellaneous"`.
  - A (L_3959): weapon-class chart (3A58-3BC3: `"A-ALL WEAPONS"`, `"-G-Bullet"`, `"HEAVY  H-Flame"`, `"-B-Bullet   WEAPONS I-Rocket"`, `"LIGHT  C-Needler"`, `"-J-Laser"`, `"WEAPONS D-Electric"`, `"E-Ion      K-CHEMICAL WEAPONS"`, `"-F-Gernade"`, `"L-EXPLOSIVE WEAPONS"` with four `LINE` brackets); then the paged pick list (SUB_A1D8, 6 per page, `24,2 "Select A Weapon"[, SPACE for more]`); `20,2 LEFT$(WeaponName$,38)`; record 800.. filled from `WeaponTable!`, credits debited; limits "No More Of That Allowed Onboard" (no free record) / "Can Not Carry Anymore Of That" (> 9 weapons) / "Can Not Afford It".
  - B (L_3F25): weapon list of the buyer (SUB_A596/SUB_A68C: `16,2 " Reloads   "; name; "'s weapons"`, rows 18..22 `n> reloads [*] WeaponName$`), `24,2 "Ammo for which gun?"[, SPACE for more]`; ammo record 1100.. filled, reload count incremented.
  - C (L_4190): `"Select A Hand Weapon"` list (6); `20,2 HandWeaponName$`; fields 44/45/46/90 set (Espers cannot take item 6).
  - D (L_4313): `"Select A Unit"` (4 sighting units); `20,2 SightingName$`; fields 41..43.
  - E (L_446A): `"Select A Suit"` (16); `20,2 ArmorSuitName$`; fields 47..49, 91.
  - F (L_45F0): `"Select A Unit"` (11 misc items); `20,2 LEFT$(MiscItemName$,38)`; record 2300.. filled.
- B (SUB_4771): `17,2 "A-Ships Guns"`, `"B-Ammo For Missle Weapon"`, `"C-Shields"`, `"D-Defense Hardware"`, `"E-Missle Killers"`, `"F-Armor"` (rows 17..22).
  - A: gun list (SUB_9FED: `16,2 "#  Ammo    Ship's Guns"`, six `n> ammo [*] GunName$` rows), `24,2 "Buy weapon for which position? (1-6)"` (digit), `"You Already Have One"` if occupied; `"Select A Ship Weapon"` list (25); record 683+7n filled from `GunTable!`, flag G!(n+10) = 1.
  - B: gun list, `24,2 "Buy ammo for which gun? (1-6)"` (BEEP for missile weapons > 14); free ammo slot in G!(340..369) or "No More Of That Allowed Onboard".
  - C: shield list (SUB_A444: `16,2 "#   Shield"`, `,24 "Value"`, rows 18..21), `24,2 "Which position? (1-4)"`, `"Select A Shield"` (5); slot 63+3n filled, flag G!(n+6) = 1.
  - D: `"Select A Defense Unit"` (5); `20,2 DefHwName$`; `DefHardware!`, `DefHardwarePct!`, `DefSysCond! = 1`, weight G!(65).
  - E: `"Select A Missle Killer"` (3); `20,2 MissileKillerName$`; `MissileKiller!`, `MissileKillPct!`, MisKillerCond! = 1, weight G!(62).
  - F (L_5004): `18,2 "Current armor points:"; Armor!` (or `"You Must Have A Ship First"`), `19,2 "Armor cost per point:"; n`, `20,2 "A ton of armor is"; n; "points"`, `21,2 "You are allowed"; n; "more points"`, `24,2 "Buy how many points? "` (up to 1000 - Armor!).
- C (L_5198): ship browser: right panel cleared (SUB_541A), `18,2 ShipClassName$; " Class "; ShipSize$`, `20,2 "Price:"; n; "Credits"`, `23,2 "SPACEBAR to see more ships"`, `24,2 "B-Buy the Ship, ENTER to Exit"`, ship name centred at row 6, picture `PUT (261,74), ShipPic0..3, XOR` by size class; SPACE cycles 0..8; B: "You Already Have One" / "Can Not Afford It" / install (SUB_29F8), `ShipName$ = ""`, `20,2 "You May Christen Your Ship"`.

## 5. C-Sell: Returns Department (L_2BB3)

- `16,6 "Returns Department"`, `18,2 "A-Sell Personal Equipment"`, `19,2 "B-Sell Ships Equipment"`, `20,2 "C-Sell Cargo"`, `21,2 "D-Sell Ship"`, `22,2 "E-Declare Bankrupcy"`.
- A: header `16,2 "Owner    Item    "; credits; "credits"`; rows 17..22 `X- SlotTag$(owner)` + name at column 7 for weapons, `"Ammo for "+WeaponName$`, misc items; `24,2 "Select item to sell"[, SPACEBAR for more]`; a letter clears the record, credits the value and blanks the row.
- B: header `"Selling Equipment  "`; missile killer, defense hardware, `"SHIELD n  "+ShieldName$`, `"GUN n  "+GunName$`, `"Ammo for "+GunName$` rows (values = 15% rule not applied here: table price columns).
- C: cargo items with `CargoValue!`.
- D: `"You do not have one"` or `17,2 "The reinstallation fee on ships guns,"`, `18,2 "shields, etc.  is 15% of cost."`, `19,2 "There is no credit or reinstalation"`, `20,2 "for ships armor."`, `22,2 "Are you sure you want to sell"`, `23,2 "your ship? "` + typed yes/no; `17,2 "Received for ship   "; n; "credits"`, `19,2 "Reinstallation fees "; n; "credits"`, `21,2 "Total received      "; n; "credits"`; G!(43) = 0, Armor! = 0; `24,14` "Press ENTER Key".
- E (L_7989): `19,2 "Do you wish to declare bankrupcy?"` + typed yes/no -> `20,2 "High Command is very disapointed"`; all equipment, items, guns, cargo, ship cleared; then `Amount! = 90000` (07BF5) is ADDED to the balance by SUB_1E98 (1EAD: credits + Amount!), so a debt is reduced by 90,000, not cleared, and a positive balance keeps its value plus 90,000 (manual-xcheck B29).

## 6. D-Dry Dock (L_667D)

- Best alive repair skill member: `16,6 CrewName$; " In Dry Dock"`, `19,2 "A-Repair Ships Equipment"`, `20,2 "B-Repair All Personal Equipment"`, `21,2 "C-Remove Armor From Ship"`.
- A: equipment list in the text box (3 columns of 8, `A-..W-` + `CondMark$` + `EquipName$` or `"-----------"`), `24,2 "Repair What?  *-Broken  #-4000 to fix"`; broken (2): roll vs skill*10+35 -> `24,10 "Sucessful"` (cond 1) / `"Failure"` (cond 3); unfixable (3): 4000 credits.
- B: armor suits and broken weapons: `17,2 CrewName$; " makes"; n; "repairs"`, `19,2 "Technicians make"; n; "repairs"`, `21,2 "Total cost:"; n; "credits"` (400 each).
- C: `18,2 "Your ship has"; Armor!; "armor points"`, `20,2 "Remove how many? "`.

## 7. E-Training (L_7C01)

- Per alive member: `17,2 CrewName$; " has"; n; "training sessions due"`, `19,2 "A-Next character"`, `20,2 "B-Buy training session (200,000 cr)"`, `21,2 "C-Inspect "; name`, [`22,2 "D-Use training session"`]; B asks `20,2 "Are you sure? (Y/N)"`.
- D: `16,5 "Post Mission Training For "; name`; attribute menu `A-..G-` + `AttrName$` (two columns); esper potential (F) only 50..99; `20,2 AttrName$; " goes to"; n`; then skill menu `A-..L-` + `Skill$(1..12)` with dotted leaders and levels; `24,2 "Select Valid Training Area"` (BEEP if not in the class table); `20,2 "You reach "; Skill$; " level "; n` (max 8; gains halve above level 2 and 5).

## 8. F-Fuel (L_2396)

- BEEP without a ship; `18,x "Refueling ISS "; ShipName$` centred; bar `LINE (18,152)-(303,176),,BF`, `(30,160)-(290,168),0,BF`, green `(30,160)-(x,168),2,BF` growing to 290 with `SOUND x*10`; `Fuel! = MaxFuel!`.

## 9. G-Game Save (L_9AA7)

- BEEP when the save lock SaveLock! is set. `17,14 "Saving game."`, `20,2 "Type the "; Ordinal$; " word in section"; n`, `21,2 "of the rule book."`, dashes at 24,3, `23,2 ">"` + input; the typed word must have the word's length (09BC9) and every character must satisfy `Diff! = ABS(ASC(typed) - ASC(word))` <= 1 or = 32 (one letter off either way, or a case difference; 09C2E/09C4F - ABS, not negation: decode fix F-5); mismatch -> `19,17 "Wrong!"`, BEEP; the second consecutive failure sets the lock (`Tries!` starts at 1 at 09AC0, +1 per miss, `IF Tries! <= 2` retries at 09CC1); match -> `BSAVE Drive$+"CHARINFO.BAS", &H1850, 10404`, CHARNAME rewritten (ShipName$, 8 names, comma separated), `20,2 "Quit the game? (Y/N)"` -> `END`.

## 10. H-Headquarters (L_7515)

- `16,14 "Headquarters"`; with an active mission: `20,2 "Do you wish to review your"`, `21,2 "mission? (y/n)"` -> MISSION record read (text 1/2 + 15 integers into G!(2230..2244), codes saved to G!(2261/2262)), text 34 chars per row rows 16..21, "Press ENTER Key" per page; without: `"You have completed your last mission"` (17 done) or `"Here is your new mission"` (next mission flag = completed count x3 + RND*3, max 49) then the review.

## 11. I-Inspect (L_83FC)

- `16,2 "A-Inspect Ship"`, `17,2 "B-Inspect Squad"`, `18,2 "C-Cargo List"`, `19,2 "D-Espionage List"`, `20,2 "E-Miscellaneous Items"`.
- A (L_8D47): `"You do not have one"` or pages (SPACEBAR, ENTER leaves): `16,2 "ISS "; ShipName$; " Status Report"`, `17,2 ShipClassName$; " Class "; ShipSize$`, `Base Weight../Cargo Weight../Total Weight../Max. Weight..` + `" tns"` rows 19..22, `19,25 "Armor........."` + value right-aligned to column 41, `23,2 "Credits......."` USING `#######`, `20,25 "Defense....+##%"`, `21,25 "Max. Move....."`, `22,25 "Cur. Move....."`; equipment list with `23,2 "(-) okay  (*) broken  (#) 4000 to fix"`; gun list (SUB_9FED); shield list (SUB_A444); `18,2 "Missle Killer........."` and `21,2 "Defense Hardware......"` with `*`/`%`.
- B (SUB_84CB): picker `"Inspect Who?"`; pages: `16,2 Rank$; " "; name; "   "; ClassName$`, `17,2 age "yr" months "mo   HP" cur "/" max "   " Status$`, attributes with dotted leaders (two columns); `To Hit Bonus...+##`, `Defense Bonus..+##`, `Max. Carried...## kg`, `Weight Carried.## kg`, `Max. Movement..##`, `Movement.......##`, `18,24 "Non-Esper"`/`"Esper Ability"` + `Level`, `Mindshock`, `Communications`, `Healing`, ` ,View`, `Psychic Scream`; skills with dotted leaders and level digits; `Armor..............cur/max`, `Sighting Hardware..n%`, `Clones.............n`, `Hand Weapon........n pts`; carried misc items; reload/weapon list (SUB_A596/A68C).
- C: `16,15 "Cargo List"`, `ItemName$` rows 18..22, 5 per page; D: `16,13 "Espionage List"`, `FindName$`; E: `16,9 "Miscellaneous Items"`, `ItemName$(16..32)` where `G!(726+k) <> 0`.

## 12. K-Christen (L_9F45)

- Only with a ship and an empty name: `20,2 "Input ship name: ISS "` (15 chars); `19,2 "Star Command welcomes the new ship"`, `20,2 "ISS "; ShipName$; " to the fleet."`; `PLAY "X"+VARPTR$(Tune$)`.

## 13. L-Leave (L_9D9C)

- `20,2 "Pilot or ship not ready"` (no ship, no fuel, member 1 missing or dead) or `"Ship overloaded"` (CurMove! < 1) or `"Leaving starport"`: field 54 = attr5/25 per member, `EntryMode! = 1`, clock advanced by the dry-dock/sickbay/training days, `CHAIN Drive$+"SPACE.STR"`.

## 14. M-Medical: Sickbay (L_6E43)

- `16,8 "Sickbay"`, `18,2 "A-Squad Health"`, `19,2 "B-Rest In Sickbay"`, `20,2 "C-Make Clone"`, `21,2 "D-Use Clone"`.
- A: rows 16..23: `name`, `,13 "HP" cur "/" max`, `,24 Status$`, `,30 "Clones:" n`; `24,10` "Press ENTER Key".
- B: HP restored, Rad -> Okay; `20,2 "Squad rests for"; n; " days"` (longest healing time, added to the clock on departure).
- C: picker `"Clone who?"`; cost 30000 (100000 for a dead member): `20,2 "Total cost:"; n; "credits"`; clones + 1 (max 9).
- D: every dead member with a clone is replaced (`20,2 CrewName$; " is replaced"`, attributes x0.9..1.0 + 1, status Okay) or `"Not possible"`.

## 15. T-Time Delay (L_A8A7)

- `18,2 "Standard Delay Factor:"; StdDelay!`, `20,2 "Current Delay Factor:"; Delay!`, `22,2 "New Delay Factor (1-9999):"` + numeric input, clamped.

## Common messages

`"No More Of That Allowed Onboard"` (SUB_2649), `"Can Not Carry Anymore Of That"` (SUB_2668), `"Can Not Afford It"` (SUB_2687), `"You Already Have One"` (SUB_4A83), `"There are no squad members present"` (SUB_1F14), `"Press ENTER Key"` (SUB_20DD), `"Press SPACEBAR"` (SUB_A882), `"Select Option"` (SUB_1E7C).

## CHAIN table

| offset | target | COMMON values set before |
|---|---|---|
| 9F3F | `Drive$ + "SPACE.STR"` | `EntryMode! = 1`, `Years!/Days!` advanced, field 54 per member, G!(2210/2212) visit date, kill-list pointers reset |

Game save: `BSAVE CHARINFO.BAS` (9CF3) + CHARNAME (9D0C-9D6D); `END` at 9D99 (quit) and 9F42 (after CHAIN, unreachable).
