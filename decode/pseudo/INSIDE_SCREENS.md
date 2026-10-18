# INSIDE screens (what the player sees)

Lane mod-inside, 2026-10-15. Derived from `INSIDE.bas.md` (labels refer to it) and the data lane's findings. Mode: SCREEN 1 (320x200, 4 colours); with `UseEGA!` (G!(89)) = 1 `PALETTE 1,2: PALETTE 2,6`, otherwise `COLOR 0,1`. Text coordinates are LOCATE row, column (1-based, 40 columns, 8x8 cells: column c starts at x = (c-1)*8, row r at y = (r-1)*8). INSIDE is reached by CHAIN from SPACE (boarding a ship / landing) and from PLBATTLE (after a fight); it leaves by CHAIN to SPACE.STR or PLBATTLE.EXE.

## Screen 0: the frame (SUB_0DEE, drawn once per entry)

| element | statement |
|---|---|
| outer box | `LINE (3,3)-(317,195),,B` |
| map box | `LINE (7,6)-(193,192),,B`; the map picture (INMAP-n, 185x185) is PUT at (8,7) |
| title box | `LINE (197,6)-(313,26),,BF` with `PUT (216,7), Logo, PSET` (LOGO.BAS 81x19) |
| room-text panel | `LINE (197,29)-(313,89),,B` — rows 5..11, columns 26..39 |
| enclosure panel | `LINE (197,92)-(313,105),,B` — row 13 |
| command panel | `LINE (197,108)-(313,192),,B` — rows 15..24 |
| colour-2 bars | `LINE (4,4)-(316,5),2,BF`, `(4,193)-(316,194)`, `(197,27)-(313,28)`, `(197,90)-(313,91)`, `(197,106)-(313,107)`, `(4,6)-(6,192)`, `(194,6)-(196,192)`, `(314,6)-(316,192)` |

Panel clears used everywhere: command panel `LINE (200,110)-(311,191),0,BF` (SUB_14CA), lower command panel `(200,128)-(311,191)` (SUB_150E), room-text panel `(200,31)-(311,87)` (SUB_14EC), map area `(8,7)-(192,191)` (SUB_1378, with `MapHidden!` = 1) or below its title row `(8,16)-(192,191)` (SUB_13A3). The map area is saved with `GET (8,7)-(192,191), MapPic` (SUB_13C5) and restored with `PUT (8,7), MapPic, PSET` (SUB_13E5).

## Screen 1: atmosphere check (fresh entry only, and only at locations 3 and 6 where `Breathable!` = 0)

Map area blanked. Text: row 4 col 2 `Atmosphere Unbreathable`; row 10 col 2 `Squad members with`; row 11 col 2 `oxygen:` followed by the digits of the members that own items 10, 8 and 9 (`CHR$(n+48); " "`). Then:

- everybody has oxygen: two long pauses (SUB_128E), map restored, -> Screen 2.
- otherwise rows 16-18 col 2: `Some squad members have` / `no oxygen source. Will` / `you continue? (Y/N)`. `N` -> names un-shifted and `CHAIN Drive$ + "SPACE.STR"` (back to space). `Y` -> map blanked, row 9 col 4 then one line per living member without oxygen: name and `takes 999 hits` / `dies!!!` (SUB_6217); if nobody survives: `You Are All Dead` at row 13 col 5 and the program loops forever (L_6385). Three pauses, map restored, -> Screen 2.

## Screen 2: exploration (L_2408, the main loop)

Command panel rows 15..24 col 26:

```
C-Change Wep.
E-Equip
F-Fix Items
G-Switch
I-Inspect
M-Medical
R-Reload
S-Search
T-Time Delay
U-Use  V-View
```

plus `PUT (280,144), Cursor, XOR` (the 24x28 INSH cursor sprite beside the list). Map: the squad marker `Tile42` XORed at (X!*5+8, Y!*5+7) and re-XORed on every background tick (SUB_60BE); active detectors animate a blip along the top/bottom edge (radiation, every 0.23 s) or the left/right edge (motion, every 0.07 s).

On entering a room (RoomNo! <> PrevRoom!): row 13 col 26 `Enclosure$(field 4)` (`   Enclosed  ` / `Semi-Enclosed` / `     Open    `); room text `MesLine$(field 3)` printed 14 characters per row at column 26 from row `8 - INT((LEN+13)/28)` (so a 1..14-char text sits on row 8, longer texts start higher); unmapped rooms are drawn tile by tile (5x5 sprites PUT with PSET at (x*5+8, y*5+7)). If the room's enemy group is >= 0 -> Screen 9 (encounter). If the room has a script -> Screen 10.

Keys (SUB_1405): Up/Down/Left/Right move one cell when the current tile's blocking digit is 0 (hundreds/thousands/units/tens of `TilePass%`), else `SOUND 900, SndDur!*7` (a set digit blocks that direction). Letters dispatch to Screens 3..8 and 11..14. Every move checks the new cell:

- tile 36..40 and room trap level >= 1 -> Screen 2a (trap);
- tile 34/35 with door strength >= 1 -> Screen 2b (vault door);
- tile 41 -> Screen 2c (the exit);
- any step: 1% chance (`RND >= .99`) of a random encounter with enemy group `InMap%(1930 + INT(RND*2) + INT(RND*2))` -> Screen 9.

### Screen 2a: trap (L_2986)

Command panel cleared. Radiation traps (level 1..3) are detected only with the radiation detector on: rows 15/16 col 26 `Radiation trap` / `dectected.` with the sweep animation (8 passes of 25 blips, `SOUND 555` / `SOUND 1234`). Explosive traps (4..6): each living member with `RND*100 < Scouting*10 + 5` gives rows 15/16 `name` / `sees a trap!`. If detected: rows 19-21 `Will you have` / `Scout! dis-` / `arm it? (Y/N)`. `N` -> step back. `Y` -> row 23 `Successful!` (RND*100 < ScoutSkill*10+15, max 90) or `Failure!`. Not detected or failed -> the trap fires: row 15 `Radiation Trap` (`SOUND 900, SndDur!*28`; a random member plus each living member for which `RND*100 < 2^(level-1)*13` gets rows 19/20 `name` / `is poisoned!` = status 2 "Rad") or `Explosive Trap` (each living member with `RND*200 > Speed + 50` (field 1 = `AttrName$(1)`) takes `INT(RND*level*level + 9)` hits via SUB_6217). The trap level is then cleared (field 0 = 0) and the move completes.

### Screen 2b: vault door (L_2F8C)

Rows 15/16 col 26 `A Vault Door` / `<strength> pts`, rows 19-22: `A-Leave`, `B-Use Torch`, `C-Fire At Door`, `D-Pick Lock`. `A` -> back (door strength stored with its sign). `B`: needs item 6 or 5 (`No Torches`): rows 19/20 `owner uses` / `MiscItemName$(item-1)`, repeated `SOUND 4444`/`SOUND 5555` bursts each taking `item*15 - 25` points until `RND*15 >= 14`, when the torch is consumed; door opens when strength < 1. `C`: `Who will fire?` (Screen member picker); `Not Armed` (no gun equipped) or `Out Of Ammo`; otherwise `SOUND 5555`/`SOUND 1111` per shot, each taking `INT(RND^.5 * damage + 1)` points, ammo -1 until empty. `D`: needs item 7 (`No Lock Pick`): row 18 `Scout!`, row 19 `picks the lock` (RND*100 < ScoutSkill*5+20, 0 after an earlier failure) or `fails` (sign of the strength flipped to -1). Opened: row 19 col 26 `Door Opened` (door field = 0) -> Screen 2.

### Screen 2c: the exit (L_34EE)

Row 17 col 29 `The Exit`; rows 20/21 col 26 `Will you take` / `it? (Y/N)`. `Y` -> names un-shifted, IN-n.BAS and INMAP-n.BAS BSAVEd (explored state), `CHAIN Drive$ + "SPACE.STR"`. `N` -> Screen 2.

### Member picker (SUB_10D3, used by C, G, I and the door's C-Fire)

Command panel cleared; one row per living member from row 15 col 26: `n>name`; row 22 col 26 `Prompt$` (`Who will fire?`, `Switch who?`, `With who?`, `Inspect Who?`, `Who'll change?`). Digit 1..6 picks (dead members refused except in Switch), ENTER cancels (Member! = 0).

## Screen 3: C-Change Wep. (L_597C)

Picker `Who'll change?`. Map area blanked: row 6 col 2 `name Is Using:`, row 8 the current weapon line (`Hand Weapon`, or `A<ammo> R<reloads>` + `*` when broken + weapon name wrapped by SUB_673F), rows 14/15 `SPACE to change weapon` / `ENTER to select`, rows 18/19 the candidate weapon line. SPACE cycles through the member's weapon records (800 + 12k, owner = member+2, type > 0, then back to `Hand Weapon`); ENTER stores the choice (field 32) and sets field 37 = 3 when it changed; back to the picker, ENTER there -> Screen 2.

## Screen 4: E-Equip (L_4F7E)

Map area blanked, row 2 col 10 `EQUIPING`. Rows from 4: `<A..R>-<owner digit 1..6> name` for every weapon (owner > 2), then ammo (`Ammo For ` + gun name), then items; 18 entries per page. Rows 23/24 col 2 `SPACEBAR for more` / `A-R to change owner`. A letter cycles that entry's owner through 3..8 (shown as digit 1..6 at column 4 of its row); SPACE -> next page; ENTER -> Screen 2.

## Screen 5: F-Fix Items (L_37C3)

Uses the best Ship Repair member and the repair kit (item 2). Rows 15/16 col 26 `Items fixed by` / `name:<n>`, rows 18/19 `Items rendered` / `unfixable:<n>`, rows 21/22 `Repair kits` / `used up:<0|1>`, row 24 `Press ENTER`. Armour (fields 48/49/55) and weapons with ammo = -1 are examined: each is fixed with probability `Found*35 + skill*10` %, otherwise marked unfixable (-2); the kit is used up with probability `1 - .9^fixed`.

## Screen 6: G-Switch (L_35C0)

Pickers `Switch who?` then `With who?` (any slot allowed). The two members' 100-field records, names and the owner fields of all weapon/ammo/item records are exchanged. No text of its own; back to Screen 2.

## Screen 7: I-Inspect (L_41B8)

Picker `Inspect Who?` (ENTER -> Screen 2). Map area blanked; three pages, each ending with `Press SPACEBAR` at row 24 col 6 (any other key than SPACE/ENTER ignored; ENTER = -51 < -40 skips the remaining pages):

1. row 2 col 3 `LEFT$(Rank$(field 34),12) name`; row 4 col 2 `<age> years   <Status$(field 31)>`; row 5 col 14 `HP <cur>/<max>`; rows 6..12 col 2 the seven `AttrName$(i)` with dotted leaders to column 19 and the value (3 chars); rows 14-19 col 2 `To Hit Bonus....+##%`, `Defence Bonus...+##%`, `Maximum Weight..## kg`, `Current Weight..## kg`, `Max Movement....##`, `Cur Movement....##`; row 21 col 2 `Non-Esper` (field 35 < 3) or `Esper Ability:` (field 35 >= 3) with `Level n` (field 27) at col 17 and the abilities `Mindshock` (22,3), `Communicate` (22,14), `Heal` (23,3), `View` (23,9), `Psy Scream` (23,15) for levels >= 1/3/5/7/8.
2. rows 7..18 col 2: `LEFT$(Skill$(i+1),20)` dotted to column 23 and the level digit `CHR$(level+48)` for the 12 skill fields 17..28.
3. rows 4-7 col 2: `Armor.............##/##`, `Sighting Hardware.##%`, `Clones............#`, `Hand Weapon.......## pt`; rows 9.. up to 15 owned items `LEFT$(MiscItemName$(type-1),23)`; then (after SPACEBAR) row 4 col 2 `Rlds    Weapons` and from row 5: reload digit, two spaces, `*` if broken, the weapon name wrapped (SUB_673F) for every weapon owned.

## Screen 8: M-Medical (L_3C56)

Rows 15/16 col 26 `A-Squad Health` / `B-Heal Member`; ENTER -> Screen 2.

- `A`: map area blanked; row 5 col 8 `Squad Health`, row 8 col 4 `Name`, col 13 `Hit Pts`; rows 9..14: `n>name` at col 2, `cur/max` at col 12, `Status$` at col 21 for living members; row 24 col 8 `Press ENTER`; back to the Medical menu.
- `B`: the best Medical member heals: rows 15/16 col 26 `name` / `will heal`; for each member below max HP or with status 0: lower panel rows 19/20 `name is` / `not healed` or `healed 4 pts` / `fully healed` (chance `MedSkill*Found*10` %, Found = owns medkit item 1), 20% `Medkit used up` (row 22); `Press ENTER` row 24. If nobody needed healing: rows 20/21 `Squad is` / `fully healed`.

## Screen 9: encounter (L_64E4 / SUB_656F)

Map saved; rows 18/19 col 26 `Confrontation` / `with enemies` (`Surprise!` = 0), or `You surprise` / `enemies` (1), or `Enemies` / `surprise you` (2). `Surprise!` = 2 when `RND*100 < 50 - MotDetOn!*20 + enclosure*20`, plus `INT(RND*1.8)` (0 or 1); a 3 becomes 0. Then `InBattle!` = 1, G!(2260) = enclosure, G!(2214) = enemy group, G!(2228) = 11, names un-shifted, `CHAIN Drive$ + "PLBATTLE.EXE"`.

## Screen 10: room script / interaction (L_6BF2, opcode table in INSIDE.bas.md)

Map area blanked; opcode 2/23 prints `MesLine$(arg)` 23 characters per row at column 2 from row `7 - INT((LEN+22)/46)` with a separator `LINE (8,96)-(192,97),,BF`; opcode 23 adds `Press ENTER` at row 19 col 8. Opcode 9 shows the option picker: rows 17/18 col 2 `Use arrow keys to pick` / `option. ENTER to accept`, row 20 col 2 `>` + `OptionName$(Option!)` (Up/Down/PgUp/PgDn cycle through `#1`..`#9`, `LEAVE`, `ATTACK/BLOW IT UP`, `SEARCH/INSPECT`, `GREETINGS`, `DEMAND INFORMATION`, `DEMAND TRIBUTE`, `TAKE IT`, `USE IT`, `FOLLOW THE ADVICE`, `YES`, `NO`, `PAY FOR INFORMATION`, `ENTER A COMMAND`); choosing `ENTER A COMMAND` prints rows 22/23 col 2 `Enter a single word` / `-->` and reads up to 10 characters; its first three letters are looked up among the MES-n lines (`Unrecognized Command` at row 15 col 2 with `SOUND 900` when not found). Opcodes 10/11/12 print `Nothing unusual happens` / `Not valid or possible  ` / `What?                  ` at row 15 col 2. Opcode 18 prints `Enter Amount:` at row 13 col 2 and reads a number. Opcode 24 lists the members hit at rows 11.. (`name takes n hits`) with `Press ENTER` at row 24 col 6. Opcode 22 restores the map -> Screen 2; opcode 1 -> Screen 9.

## Screen 11: R-Reload (L_5D4E)

Row 19 col 28 `Reloading`; every weapon with ammo 0 that has a matching ammo item is refilled (`SOUND 6666` / `SOUND 66`); -> Screen 2.

## Screen 12: S-Search (L_5EF1)

Rows 18-20 col 29 `You Find` / `Nothing` / `Unusual` and a pause, unless the room has a script, which then runs (Screen 10).

## Screen 13: T-Time Delay (L_6892)

Rows 16/17 col 26 `Standard` / `Delay: n`, rows 19/20 `Current` / `Delay: n`, rows 22/23 `New Delay` / `(1-9999):` with the line editor (4 digits, BACKSPACE, ENTER); the value is clamped to 1..9999 and becomes `Delay!` (G!(88)).

## Screen 14: U-Use (L_5F6A) and V-View (L_53DA)

- `U`: rows 15-17 col 26/28 `A-Activate` / `Motion` / `Dectector`, rows 19-21 `B-Activate` / `Radiation` / `Dectector`; `A` needs item 4 or 3, `B` item 11, else row 23 col 26 `You Have None`; ENTER -> Screen 2. Active detectors keep animating in Screen 2 and change the trap/surprise rolls.
- `V`: needs a living member with esper level (field 27) >= 7 and field 54 > 0 (field 54 is decremented), else `SOUND 900`. Rows 16/17 col 29 `name` / `views...`; ten `SOUND n*1000, n*SndDur!/5` beeps (n = 1..10); the map is flashed (`PUT (8,7), MapPic, PRESET`) and restored; all rooms within 2 cells are drawn; row 20 col 29 `Beings!` or `No Life`; three pauses.

## Transitions summary

SPACE/PLBATTLE -> INSIDE (CHAIN). Exit tile + `Y`, or `N` to the no-oxygen question -> `SPACE.STR` (floppy stub -> SPACE). Enemies in a room, the random 1% step encounter, or script opcode 1 -> `PLBATTLE.EXE`; PLBATTLE chains back to INSIDE with `InBattle!` = 1 so the squad continues at `OldX!/OldY!` (or the last cell) without reloading the map.
