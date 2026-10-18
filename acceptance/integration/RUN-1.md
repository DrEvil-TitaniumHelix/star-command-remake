# RUN-1 — integration run of the real chain (lane build-qa, 2026-10-15)

**Setup.** `game/index.html` with no dev jump; shipped save (`assets/files/CHARINFO.BAS`, fresh browser profile = empty localStorage); headless Chrome driven over the DevTools protocol by `acceptance/integration/drive.mjs` (REPL mode: keys are typed only when the INKEY$ queue is empty, the screen is read back by decoding the framebuffer text). Screenshots: `acceptance/integration/run1/rNN_*.png`. Engine at commit 84a0bd8 + the modules as of e7034ce.

**Result.** Every module boundary of the planned chain was crossed with the state intact: STARCOMM → STARTUP → STARPORT → SPACE → STARPORT → SPACE → INSIDE → SPACE → INSIDE (re-entry from the game-written IN-1/INMAP-1) → SPACE → SPBATTLE → SPACE → INSIDE → PLBATTLE. No page exception or console error in the whole run. **1 defect** (PLBATTLE portrait animation, qa fix request filed). The PLBATTLE → INSIDE return was **not exercised**: the one-man squad died (PB-08 "You Are All Dead" is an endless loop by design); queued for RUN-2. **1 test intervention** (encounter chance, below).

| # | step | keys | screen reached | result | notes / shot |
|---|---|---|---|---|---|
| 1 | boot | - | SU-01 title picture | PASS | r01_title |
| 2 | menu | SPACE | SU-03 | PASS | "3-One Floppy Disk Drive" = shipped A(84) = 1 (faithful); r02_menu |
| 3 | play | 1 | ⇒ STARPORT, PT-02 main menu | PASS | CHAIN STARTUP → STARPORT, music drain wait OK; r03_starport |
| 4 | leave without ship | L | PT-13 "Pilot or ship not ready" | PASS | correct refusal with the empty shipped save |
| 5 | recruit pilot | A A y B, 9 training picks, `ACE` ENTER | PT-03 flow: attributes, class menu, Basic Training Year 1..n, "Your assignment", "You reach Pilot level n", "Input Name:" | PASS | ACE = P (Corporal, Pil); r04_recruit |
| 6 | recruit 2 more | same flow, class C | PT-03 | PASS | SPARKS (C), GRUNT (1); 24-25 training rounds each |
| 7 | buy ship | ENTER B C B | PT-04 ship browser ("Buying With 95000 Credits", "Wasp Class Scoutship", "Price: 70800 Credits") | PASS | G!(43) = 1, credits 95000 → 24200, MaxFuel 100; r05_shipbrowser. Note: no "You May Christen Your Ship" text was seen between B and the Arsenal menu (it may have flashed between polls) |
| 8 | fuel | ENTER F | PT-08 refuel bar | PASS | fuel 0 → 100, no charge (original: `Fuel! = MaxFuel!`, 2400); r06_fuel |
| 9 | leave | L | ⇒ SPACE, SP-00 / SP-01 | PASS | (29,30) ZN:N, crew list P/C/1 + "Dead" for empty slots (faithful: SUB_1A7B prints Status$(0)); r07_leave, r08_space |
| 10 | galaxy scan | A | SP-02 | PASS | r09_galaxy |
| 11 | sector scan | D D | SP-03 | PASS | only the cursor box: the starport sits under it; r10_sector |
| 12 | starport approach | D | SP-03a "STARPORT LUNA", A/B/C | PASS | r11_downscan |
| 13 | computer | A A C | SP-06 menu | PASS | r12_computer |
| 14 | computer D-Mission | D | "You have completed your mission" (no mission yet), menu after 2 x SUB_19D1 | PASS | first try pressed D before the menu was ready (driver timing, not a defect); r13_mission |
| 15 | dock with starport | ENTER D D B | ⇒ STARPORT, PT-02 | PASS | crew/ship kept across CHAIN; r14_docked |
| 16 | headquarters | H, ENTER, ENTER | PT-10 mission 1 text (34-char rows), "Press ENTER Key" | PASS | G!(110) = 1, mission parameters G!(2230..2244) from MISSION record 0; r15_hq |
| 17 | leave + fly | L, RIGHT RIGHT DOWN DOWN DOWN | SP-01 moves | PASS | each move x/y ±1, fuel −5, zone A shown, alert YELLOW |
| 18 | station sector | D | SP-03 at (30,5) | PASS | r16_station_sector |
| 19 | station approach | D | SP-03b "B-Dock With Space Station" | PASS | r17_station |
| 20 | dock station | B | ⇒ INSIDE, IN-02 (location 1, "Empty Coridor") | PASS | EntryMode 3, StationNo 1; r18_inside |
| 21 | the exit | DOWN UP, Y | IN-02c → ⇒ SPACE SP-01 | PASS | IN-1.BAS + INMAP-1.BAS BSAVEd into the browser store; r19_exit, r20_back_in_space |
| 22 | re-entry | D D B | INSIDE from the game-written files | PASS | INMAP-1 region loaded non-pristine (8700 bytes), map drawn from memory = identical to the first visit (GET → BSAVE → BLOAD → PUT round trip); r21_inside_again |
| 23 | random encounters | 12 x LEFT/RIGHT | none | PASS | EncChance! = BaseEnc! = G!(2235) = 1 from MISSION record 0 → 1 % per move, so no encounter is expected |
| 24 | **test intervention** | page: `E.state.G[2235] = 100`, then station dock/exit (SPACE entry 0F95 copies it) | encounter on SPACE entry | — | documented intervention to reach SPBATTLE without ~100 moves; restored to 1 after the fight |
| 25 | space encounter | (automatic) | ⇒ SPBATTLE, visual + "Establish communications? (y/n)" | PASS | SP-12 passed between polls; r22_encounter |
| 26 | communications | y, A (Plead), B (Truce) | SB communications phase menus | PASS | r23_comms |
| 27 | truce | - | ⇒ SPACE SP-01 | PASS | BaseEnc! after combat = 70 = INT(100*0.7+0.6) (SPACE 90CB); r24_comms_result |
| 28 | enemy room | D D B, DOWN x13 RIGHT x4 UP | INSIDE IN-09 ⇒ PLBATTLE PB-01 briefing (SCREEN 7, gravity 1, Breathable, Semi-enclosed Room, Group A: 4 Pirate Trainee(s)) | PASS | r25_inside_enemy |
| 29 | battle screen | ENTER | PB-02 | **FAIL** | portrait animation overlays XORed at the portrait origin (8,25) instead of (8+dx, 25+dy): see defect D1; r26_battle |
| 30 | ground combat | n, B (skip move) x n, ENTER | movement phases 1..6, command phase ("GRUNT [ 55 ]", "Command: Wait"), enemy fire ("Pirate Trainee (A2) fires laser and hits. GRUNT takes 8 points") | PASS | |
| 31 | squad killed | - | PB-08 "You Are All Dead" (endless loop by design) | PASS | r27_battle_state. PLBATTLE → INSIDE (PB-07 ⇒ INSIDE.EXE, InBattle! = 1) not exercised → RUN-2 |

## Defects

- **D1 — PLBATTLE PB-02 (owner build-plbattle, bas2js):** `FrameDX1%..FrameDY3%` (DS 0x89F6..0x8A00) lie inside the BIGSH-n.EGA BLOAD region (&H8052, +2468..+2478: the file stores the overlay offsets), but plbattle.js renders them as module-locals `V["FrameDX1%"]` = 0, so every EGA overlay frame is XORed at (8,25). BIGSH-8.EGA holds (14,8) (21,8) (30,13). `acceptance/integration/audit_bload_scalars.py` checks all generated modules for this class: these 6 are the only hits. Filed as `qa fix request` in STATUS.md.

## Not exercised (→ RUN-2)
PLBATTLE PB-07 → INSIDE return (InBattle! = 1 path, IN-02 without map reload) and PB-07 → SPACE (boarding from SPBATTLE); SPBATTLE fight to the end (kill list, tow list); planet surface (SP-04a: unique area → INSIDE EntryMode 4, espionage, cargo); G-Game Save (needs the rule-book word); STARPORT arrival processing with kills/missions.
