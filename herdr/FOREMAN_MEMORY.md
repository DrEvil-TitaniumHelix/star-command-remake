# FOREMAN MEMORY — Star Command RE (one persistent Foreman persona; see FOREMAN.md ## Persistence)

Maintained by the Foreman at every milestone and before every pause. Newest facts first inside each section. A fresh instance reads FOREMAN.md, this file, then STATUS.md, and acts as me.

## Session ids (newest first) — restart with `claude --resume <id>` in this repo, pane name `foreman`
- <session-id> — 2026-10-15 14:00- (after the Anthropic account switch; pane <pane>; started under the agent name "foreman2", renamed to "foreman" 14:30 per the owner's persistence ruling)
- <session-id> — 2026-10-15 10:30-14:00 (first Foreman; paused for the account switch; wrote STATUS.md ## HANDOFF; pane <pane>, closed)
- Other .jsonl files in the projects dir (1e33092b, 23f4b31f, 638d83a4) are lane sessions, not Foreman.

## Who is who
- The owner = owner, non-technical, watches the Herdr window, rules via RULINGS.md (A/B). The coordinator = coordinator Claude session in `<projects>\Main`; relays the owner, sends me mid-turn instructions, flags mistakes, does not touch lanes. I own all lane/model assignments.
- Git author in this repo: repo-local `<owner identity>` (set 10/15 because no global identity existed; lanes commit with it). Remote: origin = github DrEvil-TitaniumHelix/StarCommandRE, push works.

## Machine / tool quirks (handheld = handheld PC, Windows 11, 24 GB, 16 threads)
- Herdr: pane ids are never reused (closed <pane>-p3; live: <pane> foreman, <pane> mod-space2, <pane> mod-inside, <pane> codex, <pane> GLM in tab w2:t2). `herdr pane split --pane <id> --direction right|down --cwd "<repo>"`; `herdr agent start <name> --kind claude --pane <id> --timeout 90000 -- --dangerously-skip-permissions` returns in seconds (bypass dialog is pre-accepted on this account); then `herdr agent prompt <name> "<text>" --wait --until working`. `herdr agent wait <name> --timeout 300000` exits 1 with a `timeout` error when nothing settles: normal, not a failure; background waits therefore show as "failed" tasks (harmless but noisy, so use foreground waits <= 300000 ms, alternating lanes).
- Lane status: `herdr agent list` gives name/agent_status/pane_id; `herdr agent read <name> --source visible | tail -12` for a glance, `--source recent-unwrapped --lines 150` for the final report. Lanes write their real result to files + STATUS.md, so read those, not the terminal.
- Opus lane: `-- --model opus --dangerously-skip-permissions`. GLM 5.3: `cc-glm` is a Windows PowerShell 5.1 profile function (`~/OneDrive/Documents/WindowsPowerShell/profile.ps1`), NOT in the pwsh 7 profile that new panes open: run `herdr pane run <pane> "powershell.exe -NoLogo"`, wait ~6 s, then `herdr pane run <pane> "cc-glm --dangerously-skip-permissions"`, wait ~30 s, (bypass dialog: `send-keys down`, `enter` only if shown), `herdr agent rename <pane> <name>`, then prompt. `cc-glm-lean` does not work here (its settings files are missing). GLM prints a red "NOT ANTHROPIC" banner. GLM handled raw-byte disassembly review well (137/137 rows checked, decoded the raster tables itself).
- Codex (Astra): start with `--kind codex -- --dangerously-bypass-approvals-and-sandbox`; `-s workspace-write -a never` prompts for every command (unusable unattended). First start on a machine: trust dialog -> `send-keys enter`; sandbox choice -> `down` then `enter` (option 1 needs an admin UAC prompt that blocks the pane). Prompts MUST be short (1-2 sentences pointing at files): long pastes arrive mangled and leave a "Queued follow-up input" with an idle composer; esc/enter do not free it, only `ctrl+c` twice (exits codex), then restart + short prompt. A full module draft (11-17K lines) takes codex 3-10 min. Reuse the pane: `herdr agent rename <old> <new>` + short prompt.
- Fable lanes can hit "dropped connection, retrying"; one `send-keys esc` resumed it and it picked up the queued note. Fable quota is the real constraint (caused the 14:00 account switch); conserve Fable per policy.
- Python 3.13 console is cp1252: when printing transcript/UTF-8 text use `sys.stdout.reconfigure(encoding='utf-8')` (`python -I` ignores PYTHONIOENCODING). Transcripts: `~/.claude/projects/<claude-project>/<id>.jsonl`; mid-turn the coordinator messages are stored as `queue-operation` entries, assistant text under `type=assistant` content[].text.
- Prompt text in double quotes is shell-expanded: `CondMark$(1..3)` became a command substitution (`1..3: command not found`) and the text was cut. Write BASIC names like `CondMark$` only in single-quoted prompts, or escape `$`; or point the lane at the STATUS note instead of quoting code.
- Bash tool heredocs with `cat > file <<'EOF'` can fail to parse for long markdown bodies; use the Write tool for whole files.
- SHARED-FILE RULE (the coordinator flag 14:45 on commit b8914bc, two lanes edited qb2bas.py concurrently and one commit swept in the other's unfinished edits): any file two lanes both need has ONE owner lane; the other lane writes a `<file> request:` note at the top of STATUS.md and reruns after the owner posts `<file> done`. Current owner of decode/pseudo/tools/qb2bas.py = mod-inside (from 14:45); when mod-inside finishes, ownership passes to the next active mod lane and is written here. Record the owner in every mod assignment prompt.
- Git while lanes run: lanes `git add` only their own files; the Foreman adds named files (STATUS.md, assignments, docs), not `-A`, so another lane's half-edited files are not swept into a Foreman commit. Concurrent commits from lanes in the same tree work (index lock retried).
- Classifier/refusal traps: none hit so far on Fable, Opus, GLM or codex. Rule from the owner: if an Opus lane refuses disassembly-type work, note it in STATUS.md and move that task to a Fable lane. Keep prompts framed as the RE/preservation of this 1988 game; never ask lanes to modify the originals.

## Decisions and why (chronological)
- 10/15 SC-1 = B (the owner): the reproduction renders 640x200 EGA 16-colour as a deliberate enhancement; acceptance = same content/layout/behaviour per screen; .EGA banks are the art source. Background: the data lane proved the original runs SCREEN 1 (CGA 4-colour) except PLBATTLE SCREEN 7, so the original FOREMAN.md assumption was wrong; verify every brief assumption against evidence.
- 10/15 Model policy (the owner): Fable only for disassembly-heavy decode lanes; Opus for data/tooling/review/verification/build; codex for bulk first drafts; GLM for reviews. Max 6 lanes.
- 10/15 the owner: no go-ahead needed after DECODE_GATE.md; write BUILD_PLAN.md and start build lanes immediately. RULINGS.md only for genuine decisions.
- 10/15 the owner: the Foreman is one persistent persona; this file is its memory; restart = resume the latest session id; pane name always `foreman`.
- 10/15 owner/coordinator (for BUILD_PLAN.md): engine loads sprites from a PNG atlas (+ index with scale factor), data-driven, no sprite data in code, so an upscaled/redrawn art set can be swapped in without code changes; art pass deferred. Recorded in FOREMAN.md work plan item 5.
- 10/15 me: verify lane DISAGREE fixes for modules whose lane is gone are applied by me (STARTUP 0x07D8 KeyHit sign + field count 374, applied 15:40).
- 10/15 me: run mod lanes two at a time (mod-space2 + mod-inside); 'additive edits only' on the shared qb2bas.py FAILED (b8914bc) and was replaced by the single-owner rule above; mod-space did its line-120 fix first and committed it alone (a435179). Assignments for inside/spbattle/plbattle/starport got an "Inputs added" section (codex draft + translator + <MOD>_names.json).
- 10/15 me: closed the old idle Fable sessions (<pane>-p3) on instruction; cost = the resumed mod-space lane had to rebuild context from the ## RESUME section. Prefer resuming an idle session when its context is still valuable.

## Lane results so far (phase 1) — details in STATUS.md
- rt-naming DONE (6d48e87): 140/140 ledger rows, rt_names.json, inline_args.json, listings regenerated with names + ON GOTO targets. Later fixes by mod-startup: PUT verbs 0 OR/1 AND/2 PRESET/3 PSET/4 XOR; RT3D_44 = PLAY(n).
- data DONE (7e67a4d): SPRITES/MODULE_CONSTANTS/STR_FILES/DATA_FILES/BAT.md, 352 PNGs; open follow-up: SPRITES.md row TITLE.BAS must add 4 animation-frame GET arrays (DS 0x87E8/0x9BD8/0xADDA/0xBF7A).
- mod-startup DONE (c19a327, cdfe6b1): STARCOMM.bas.md, STARTUP.bas.md, STARTUP_SCREENS.md = the format model.
- codex drafts DONE for all 6 modules (decode/pseudo/<MOD>.draft.md).
- glm-review-rt DONE (6ed77c8): 137 AGREE / 0 DISAGREE / 0 UNSURE; 6 confidence upgrades suggested (optional, Opus). Nothing to fold. GLM pane <pane> kept for glm-verify-<mod> lanes.
- mod-space: paused at 0x2299 by Foreman #1 (88af72a); mod-space2 (Fable, <pane>) resumed 14:10 from SPACE.bas.md ## RESUME. Translator qb2bas.py renders the whole module (3753 statements, 0 unrendered calls); reuse it for every module.
- mod-space2 DONE 15:20 (56a468d): SPACE.bas.md 2516 statements, 0 unrendered, SPACE_SCREENS.md 14 screens, SPACE_names.json 444 names; SPACE_header.md = hand-written header merged with the generated body. Session reused 15:25 as mod-spbattle (<pane>).
- data-fix DONE 15:05 (1812bd8); its Opus session reused as lane verify (<pane>), started on STARCOMM+STARTUP, SPACE queued. glm-verify-space (<pane>, reused GLM session) started 15:25.
- mod-inside (Fable, <pane>) started 14:10; owner of qb2bas.py since 14:45; mod-space2 filed its first `qb2bas request` in STATUS.md (143cd1b) and the protocol works.

## Milestone 15:50 (session 0c86eed9)
- mod-inside DONE (c48ab36); mod-spbattle DONE (9546d3d, body built with a private translator copy, must be regenerated). Both Fable sessions reused: <pane> = mod-plbattle (first: translator owner tasks), <pane> = mod-starport.
- verify (Opus) found two systematic defects: qb2bas.py PUT verb map was the withdrawn order (3 rendered as OR, really PSET) -> SPACE/INSIDE/SPBATTLE bodies + SCREENS need regeneration (assigned to mod-plbattle session, which owns qb2bas.py); RT_LEDGER 3F_B7 INPUT type bytes were wrong (fixed by me, 30f687d: raw 01 int, 02 single, 03 double, 04 string). Lesson: a translator bug multiplies across modules; re-check the ledger-derived tables in qb2bas.py against RT_LEDGER.md whenever a ledger row changes.
- My mistake: the verify (Opus) and glm-verify templates both named the output <MOD>_VERIFY.md -> collision on SPACE. Fixed: GLM writes <MOD>_GLMVERIFY.md (template + lane told to git mv). Rule: every lane's output file name must be unique across all templates.
- Verify results so far: STARCOMM 20/20, STARTUP 166/167 (fixed), SPACE GLM 274/280 (all 6 = PUT verb defect).

## Milestone 16:15
- qb2bas PUT verb map + INPUT types fixed (541b493); SPACE + INSIDE regenerated with FN0452 -> FNRound2 and MASS fixes (8ee3fa6): SPACE and INSIDE are FINAL. SPBATTLE regeneration pending (mod-starport session told). Verify so far: STARCOMM 20/20, STARTUP 166/167 fixed, SPACE Opus 261/267 + GLM 274/280 (all DISAGREEs fixed), INSIDE GLM 202/209 (7 = known verb labels, 0 new). GLM pane -> glm-verify-spbattle; Opus verify -> INSIDE then SPBATTLE.
- Lane protocol that works: fix requests as `verify fix request:` lines at the top of STATUS.md, the owner marks them `(APPLIED ...)` in place. Keep it.

## Milestone 16:40
- mod-starport DONE (b99b86a) in ~45 min; SPBATTLE regenerated (a11f8b3). glm-verify-spbattle 194/194. Only PLBATTLE (mod-plbattle, <pane>) still being written. Fable session <pane> reused as lane crossref (CHAIN graph, shared COMMON layout, data unknowns, ledger M rows, unknown roll-up) = the remaining DECODE_GATE.md items. GLM pane -> glm-verify-starport. Opus verify queue: INSIDE -> SPBATTLE -> STARPORT -> PLBATTLE.
- Reusing a finished Fable session for the next module (rename + prompt) keeps the translator/header know-how; each module after the first took under an hour this way.

## Milestone 17:10
- crossref DONE (f9c8a6c): CROSSREF.md (CHAIN graph, G!() map, string arrays, data unknowns resolved into DATA_FILES.md section D, only ledger M row left = 3F_C9 PLBATTLE-only). Finding: module header word 17 = compiler temp-slot base (added as a ledger note). crossref session now applies cross-module renames to SPACE/INSIDE/SPBATTLE/STARPORT/STARTUP (it owns those files for that; qb2bas.py stays with mod-plbattle).
- A Fable lane in bypass mode can still BLOCK on a 'Do you want to proceed? 1. Yes' dialog (mod-plbattle 17:00, 17:25, 17:35). TRIGGER FOUND from the lane transcript (23f4b31f): every blocked Bash call contained `rm -f "$S/..."` on scratchpad paths, i.e. rm outside the project dir, which Claude Code confirms even with --dangerously-skip-permissions. The coordinator confirmed by zooming the pane: it is the built-in check 'Dangerous rm operation on possibly-empty variable path', which auto-denies after ~2 min. Rule for all lanes (in mod/draft templates): write rm paths as `"${S:?}/${g:?}.ext"` or literal paths; never `rm -f "$S/$g"`. Diagnose a blocked lane by reading its transcript: the tool_use with no tool_result is the blocked command. The coordinator's instruction: accept with `herdr agent send-keys <pane> enter` and confirm it resumes. Keep loop waits <= 170 s so blocked lanes are caught quickly; `herdr agent read --source recent --lines N` is refused while a lane is blocked (use --source visible).
- verify (Opus) results: INSIDE 199/199 (3 translator fixes applied 71f36ac, all modules regenerated); SPBATTLE/STARPORT in progress.

## Milestone 17:40
- glm-verify-starport 306/306 (24fe613); crossref renames applied to SPACE/INSIDE/SPBATTLE/STARPORT/STARTUP (bfa2917..5c05307). GLM pane -> glm-review-crossref. Opus verify session -> screens-index (SCREENS_INDEX.md, the BUILD_PLAN input). Fable: mod-plbattle still writing PLBATTLE (+ translator fixes); crossref session idle, waiting for PLBATTLE.
- Lane transcripts are in ~/.claude/projects/<claude-project>/: 23f4b31f = mod-inside/mod-plbattle session, ec14c202 and caa06fb8 = other lanes (verify/crossref); timestamps are UTC (local = UTC-4).

## Milestone 17:55 — all 7 modules final
- mod-plbattle DONE (2760fc6; also the STARPORT RND register-reuse translator fix + regenerations). SCREENS_INDEX.md landed (14b7b9b, 76 rows). Remaining before the gate: Opus verify of PLBATTLE, GLM verify of PLBATTLE (after glm-review-crossref), CROSSREF section 6, INSH.BAS GET-array data fix, then tick DECODE_GATE.md and write BUILD_PLAN.md.
- Decision (mine, not a the owner ruling): the build implements the hard-disk configuration (DriveCfg = 0), so the floppy swap prompt ST-01 is not built. Mention to the coordinator; reversible in BUILD_PLAN.md.
- Fable session <pane> (mod-plbattle) idle and finished; <pane> crossref finishing PLBATTLE section. Keep both idle unless Fable-grade work appears (conserve).

## Milestone 18:05
- BUILD_PLAN.md DRAFT written while the last gate items run (engine modules, atlas pipeline with scale factor, module order, acceptance, phase-2 lanes). Finalize + start build-engine (Opus) the moment DECODE_GATE.md is ticked. The coordinator reports the plan to the owner when it lands (tell the coordinator in the next report).

## Milestone 18:20 — GLM quota
- GLM (Z.ai) has a 5-hour usage limit; hit at 18:20 after ~5 h of continuous review work (429 'Usage limit reached for 5 hour', resets 2026-10-16 08:39). Pane <pane> session keeps its context: after the reset prompt "continue" (finish CROSSREF_GLMREVIEW.md), then glm-verify-plbattle. Lesson: GLM review lanes are rate-limited per 5 h; schedule them so the limit does not fall in the critical path, and never make the gate depend on a single rate-limited lane.
- crossref DONE incl. PLBATTLE (0b4cf20). Remaining for the gate: Opus verify of PLBATTLE (running) and SCREENS_INDEX PLBATTLE rows. Then tick + BUILD_PLAN final + build-engine lane.

## Milestone 18:45 — DECODE GATE MET, phase 2 started
- Gate ticked (8adec7c) with GLM PLBATTLE/CROSSREF passes deferred (non-blocking). BUILD_PLAN.md final. build-engine (Opus) started in a NEW pane <pane>: neither ctrl+c x2 nor a prompted "/exit" freed the finished Claude session in <pane> (`agent start` -> agent_pane_busy), so I closed that pane (`herdr pane close <pane>`, work was committed) and split a fresh one. Rule: to reuse a pane for a different model, close it and split anew; rename+prompt only when the same session continues.
- Phase-2 lane plan: build-engine first (milestone 1 = display/text/sprites/input demo SU-03); then build-startup + build-starport; then space, inside, spbattle, plbattle; build-qa on GLM. Engine requests via `engine request:` / `engine done` notes in STATUS.md.

## Milestone 19:05
- Phase 1 fully closed: verify lane DONE (all 7 modules, SCREENS_INDEX incl. PLBATTLE rows, BIGSH frames 0f6aeea); crossref applied PLBATTLE doc fixes (b9ebe89) and is the standing Fable fixer (idle, <pane>). Opus verify session reused as build-startup (<pane>), starting from the decode while build-engine (<pane>) builds milestone 1. build-<mod>.md assignments exist for all six modules (build-template.md).
- Lane count now (19:15): foreman <pane>, build-engine <pane>, build-startup <pane>, build-starport w2:pA, crossref (idle Fable) <pane>, GLM (idle until reset) <pane> = 6 panes, the limit. Next build lanes reuse finished ones.

## Milestone 19:40 — engine milestone 1
- build-engine milestone 1 (8845183): game/engine/{display,gfx,text,sprites,input,basic,engine,demo}.js + README.md (API), atlas 471 sprites/84 banks with `scale`, font = IBM CGA ROM glyphs (VileR Oldschool PC Font Pack, CC BY-SA 4.0, recorded in game/ASSETS.md), node tests 7/7, headless-Chrome screenshot acceptance/out/SU-03.png checked by me: correct text rows/cols and frame. Serve with `python -I tools/serve.py` (file:// blocks ES modules in Chrome).
- build-startup did startup.js decode-first in ~25 min (ffc5026); now aligning to the real API, then space.js (it owns both). build-starport on starport.js. Next lanes when panes free: inside, spbattle, plbattle; build-qa on GLM after the reset.

## Milestone 20:10 — engine complete (M2)
- build-engine M2 (6fe54d1): audio/state/files/data/timer/chain, data + gmap pipeline, CHARINFO MBF round-trip test, API names exactly as build-startup requested ('engine done'). Engine lane now also ports INSIDE (owns inside.js) while remaining the engine owner. build-startup owns startup.js + space.js; build-starport owns starport.js. Remaining: spbattle, plbattle (next free Opus lane), build-qa (GLM after reset, or Opus if GLM stays limited).

## Note 20:20 — mechanical port
- build-startup wrote tools bas2js.py: generates game/modules/space.js from the verified SPACE.bas.md (2506/2506 statements) on top of a small BASIC runtime (BRUN30-exact RND, BLOAD regions, DATA/INPUT#), Node smoke-tested on the original files (18067b5). This is the fidelity-preserving path for the remaining modules: prefer generating from the .bas.md + hand-written screen glue over free-hand ports; tell spbattle/plbattle lanes to reuse bas2js.py (owner: build-startup; requests via STATUS notes).

## Milestone 21:00 — four modules on the engine
- startup (SU-01..05), starport (PT-00..15, generated flow via its own bas2js.py copy), space (SP-01..13, generated, dev jumps with the shipped save), inside in progress (build-engine), spbattle started (build-spbattle = former build-starport session, w2:pA). Screenshots I checked: SU-01, SU-03, PT-01, SP-01 all match the decoded screens (text rows/cols, frames, sprites). Open requests flow through STATUS.md notes (engine x2, bas2js x1) and are nudged to the owners at each loop pass.
- Remaining build: plbattle (needs a lane: reuse build-startup when SPACE is complete), build-qa (GLM after 08:40 or Opus), DOSBox reference screenshots are owner/coordinator's part (ACCEPTANCE.md reviewer column).

## Milestone 22:30 — five modules on the engine, QA starts
- INSIDE milestone 1 (f11f2ab, 19 IN-* screens, generated 1771/1771). Engine lane now also build-qa (integration run RUN-1.md + reviewer column for SU/PT/SP). Open: SPBATTLE (build-spbattle), PLBATTLE (build-plbattle, context near auto-compact), INSIDE passability prose fix (crossref), CSRLIN translator bug (build-plbattle).
- Pattern that works for the build: every module = generated flow from <MOD>.bas.md via bas2js.py + small runtime + devjump fixtures + headless-Chrome screenshots; module lanes finished in 1-2 h each.

## Milestone 22:45 — all six modules on the engine
- PLBATTLE generated 2169/2169, PB-01..08 (1716e8e; PB-01 checked: SCREEN 7 briefing with terrain sprites). SPBATTLE in progress (build-spbattle; bas2js alias table done 6970062). INSIDE passability prose fixed (ca60522). QA integration run starting on the engine lane. What remains for 'playable': SB screens, RUN-1 integration defects, reviewer passes, DOSBox reference captures (owner/coordinator).

## Lesson 23:10 — request bookkeeping
- A `grep '<file> done'` can match an OLD note and hide a new open request (basic.js regionAt request sat unanswered while its owner idled). Rule: a request note carries a unique tag (`basic.js request #2 (regionAt)`) and the owner answers with the same tag; when checking, match the tag, not the file name. Also: an idle owner lane + an open request = re-prompt immediately with the request text.

## Milestone 23:30
- Engine gamepad mapping aligned to the plan (c83cd1b); game/README.md for the owner (cf32566); IN reviewed 19/19 PASS; RUN-1 integration in progress; SPBATTLE last module in progress. Remaining to call it 'playable v1': SB screens + RUN-1 clean + README final. Then: DOSBox references (owner/coordinator), GLM second reviewer pass after 08:40, open TODO(acceptance) timing items (delay-loop ratio, PLAY timing).

## Milestone 00:10 (2026-10-16) — integration run passes
- RUN-1 (31ea318): the real chain STARCOMM -> STARTUP -> STARPORT -> SPACE -> INSIDE -> SPBATTLE -> PLBATTLE driven by scripted keys over the DevTools protocol, 30/31 PASS; the one defect (PLBATTLE portrait overlay offsets = scalars inside a BLOAD region) fixed in bas2js (1db5361). Driver: acceptance/integration/ (CDP driver + audit_bload_scalars.py). Remaining: SPBATTLE screens (build-spbattle, long context, near compaction), reviewer column SU/PT/SP (build-engine step 2), SB reviewer pass (build-plbattle), DOSBox references (owner/coordinator), GLM passes after 08:40.

## Milestone 00:30 (2026-10-16) — all six modules built, playable v1 in review
- SPBATTLE done (4dd1b30). Reviewer passes: IN 19/19 PASS, SU/PT/SP 41 PASS 2 OPEN (c770be7). Running: SB review (build-plbattle), PB review (build-spbattle), RUN-2 (build-engine). After these: close OPEN rows, final STATUS 'playable v1' block, then only DOSBox references + GLM passes remain; the Foreman loop can slow to 300 s waits.

## Milestone 01:20 (2026-10-16) — acceptance 81/83
- All 83 screen rows self-checked and cross-reviewed: 81 PASS, 0 FAIL, 2 awaiting build-engine's re-review (SP-04b, SP-12s). SPBATTLE DONE (d81e451). RUN-2 (PLBATTLE returns, full fight + boarding, surface encounter, save/reload) running on build-engine. When RUN-2 is clean and the last 2 rows pass: write the 'playable v1' STATUS block, tell the coordinator, slow the loop to 300 s and keep only build-engine (engine owner) + crossref (Fable fixer) + GLM (08:40) alive; exit the other Opus sessions.

## Note 02:05 — tooling caution
- `python -I acceptance/acceptance_summary.py` REWRITES the summary table inside ACCEPTANCE.md (it is not read-only); running it for a glance left an uncommitted edit in a shared file. Read the table with sed instead; only lanes that own the rows regenerate it.

## Ruling 00:40 (2026-10-16) — input scope
- The owner: keyboard (+ the gamepad mapping) is the v1 input; mouse control is a probable later post-acceptance enhancement. Do NOT build it now; keep input.js structured so a pointer layer (click menu letter / map cell -> injected key) can be added without touching module code. Recorded in BUILD_PLAN.md §7; build-engine (input.js owner) told.
- Clock note: lane transcript timestamps are UTC; this machine is UTC-4 (00:29 local = 04:29Z). build-engine's long RUN-2 turn was NOT stuck (tool calls continued); check the transcript's last tool_use time before interrupting a lane.

## 00:50 (2026-10-16) — manual cross-check lane (the owner via the coordinator)
- The owner asked whether functions were checked against the MANUAL/strategy guides: they were not (binaries only). The coordinator fetched the SSI 1988 manual OCR into decode/docs/; lane manual-xcheck (Opus, reused build-spbattle session w2:pA) writes decode/docs/MANUAL_XCHECK.md (MATCHES / DISCREPANCY / MANUAL-ONLY / BUILD-GAP per documented function), settles DOSBox requests from the manual, and assesses the undecoded extras DEMO.EXE + DEMOSH.BAS and COLOR.EXE (not among the 7 modules). Decision pending on those: if in scope, open a Fable decode lane (crossref session) for them.

## Provisional decision 01:20 (2026-10-16) — undecoded extras
- manual-xcheck's inspection: DEMO.EXE = stand-alone promo demo started from DOS (D/M/ESC, credits, narration slides from the game banks + DEMOSH.BAS, no CHAIN from/to the game; manual p3), COLOR.EXE = SCREEN 7 16-colour test chart, FIXIT.EXE = challenge/response support tool. Provisional Foreman decision: OUT of scope for the playable reproduction (not reachable from the game, no gameplay content); document them in DECODE_GATE.md as known, undecoded, out-of-scope extras; revisit only if the owner wants the attract demo (then a Fable decode lane on DEMO.EXE, ~44 KB?). Final 01:40: lane recommendation = COLOR/FIXIT out, DEMO optional -> decided out of scope for v1, optional later (DECODE_GATE.md §4b). MANUAL_XCHECK.md: 583 rows, 490 match, 60 discrepancies (manual vs binary), 6 manual-only, 0 build gaps -> the build reproduces the binary, and the manual's deviations are documented for the owner.

## Decision 01:55 (2026-10-16) — manual vs binary
- Build follows the binary where the manual disagrees (SC-1 = B is about the original's behaviour); copy-protection stays length-only as shipped. Recorded in DECODE_GATE.md §4b and BUILD_PLAN.md §7; the coordinator tells the owner via STATUS. Strategy guides (the coordinator fetching) -> manual-xcheck lane continues on them when they appear in decode/docs/.

## Milestone 02:50 (2026-10-16) — PLAYABLE v1
- Acceptance 83/83 PASS (44d7ded); RUN-2 S1-S3 PASS, S4-S6 running (build-engine, one commit per scenario). Original-behaviour findings F1/F2 recorded as faithful, not defects. From here the Foreman loop only needs: RUN-2 completion, DOSBox reference captures (owner/coordinator), GLM second column after 08:40, strategy guides when they appear. Lanes to keep: build-engine (engine owner + qa), crossref (Fable fixer), GLM; build-plbattle / manual-xcheck sessions idle for fix requests.

## 03:20 (2026-10-16) — RUN-2 S4 partial
- S4 (SPBATTLE boarding -> PLBATTLE terrain 10) could not be reached through real play in three attempts (enemies out of gun arcs, pilot killed, hyperspace fails): the fights and returns matched the decode, only the docking step is unevidenced. Routed as a dev-jump extension (SB-02dY) to the spbattle.js owner (manual-xcheck session, ex build-spbattle); build-engine continues S5 (surface encounter) and S6 (fresh-profile reload). A real-flow failure to reach a rare state is not a port defect; evidence it with a dev jump instead of burning hours.

## 03:50 (2026-10-16)
- S4 boarding hand-off evidenced by the SB-02dY dev jump (af53199; PB-01 shows 'Location of combat: Enemy Ship' + the no-flee line, checked by me); no spbattle.js deviation. RUN-2 left: S5 surface encounter, S6 fresh-profile reload (build-engine).

## Milestone 04:20 (2026-10-16) — PLAYABLE v1 COMPLETE
- RUN-2 DONE 6/6 (f79ee25). Everything my lanes can verify is verified; what remains needs owner/coordinator (DOSBox captures), the GLM reset (08:40), or new inputs (strategy guides). All lanes idle and kept (owners for fix requests). Loop now idles in 5-minute checks: `herdr agent wait glm-review-crossref --until working --timeout 300000` acts as a sleep (nothing is working). Each pass: check decode/docs for new guides (-> manual-xcheck lane), STATUS.md for new requests, time >= 08:40 -> prompt GLM 'continue'.
- Timeline for the record: phase 1 decode 10/15 10:30-18:40 (gate), phase 2 build 10/15 18:45-10/16 04:20 (playable v1 with 83/83 acceptance + 2 integration runs). ~18 hours wall clock, 6 panes.

## 04:35 (2026-10-16) — dosbox-ref lane (the coordinator's plan)
- DOSBox reference captures can be done HEADLESS in WSL (dosbox-x + Xvfb :99 + xdotool; never DISPLAY=:0/WSLg because the owner may be dictating; copy the game dir first). Lane dosbox-ref (fresh Opus pane) works through acceptance/DOSBOX_REQUESTS.md, captures acceptance/ref/<id>.png at 640x400 nearest, fills the ACCEPTANCE.md reviewer column with REF PASS/FAIL. Pane w2:pA (manual-xcheck/build-spbattle) closed; build-plbattle now owns all generated module files.

## 05:05 (2026-10-16) — first DOSBox references
- dosbox-ref works: headless DOSBox-X captures land in acceptance/ref/ (PT-00..05 first). My own comparison ref/PT-02 vs out/PT-02: identical layout, text rows/cols, sprites and even the EGA palette (the original on an EGA shows the same blue/red remap), only fixture data differs. Machine clock: `date` prints MDT (UTC-6), earlier 'UTC-4' note was wrong; GLM reset time 08:39 is in the GLM server's clock, try after 08:40 local and again later if still limited.

## Milestone 06:10 (2026-10-16) — DOSBox references, first comparison
- dosbox-ref milestone 1 (a02d1b1, d198af9): 46 headless DOSBox-X captures, 44 ACCEPTANCE rows compared: 40 REF PASS, 2 REF FAIL (SP-00/01 console arcs, IN-13 cursor), 2 N/A; 6 DOSBOX_REQUESTS answered. Real fidelity defects only the original could reveal, all engine-level, assigned to build-engine as F-1..F-4: font glyph 'S' (and 0x05/0x06/0x0F) differs from the EGA BIOS 8x8 (captured to acceptance/ref/font_dosbox_ega8x8.json), CIRCLE/PAINT arcs off by 1-px steps, no text cursor in SCREEN 1 line editors, EMPTY_LOOP_RATIO measured 7.7 (engine used 4, delays ~1.9x too long). Lesson: the headless reference harness (acceptance/ref/scripts/, compare.py) is the real acceptance oracle; run it for every remaining screen id and after every engine fix.

## Lesson 06:40 (2026-10-16) — the oracle caught a decode error
- F-5: STARPORT 09C1B-09C26 uses the and/jge/neg idiom = ABS(); the pseudocode (09C2E) and hence starport.js rendered a plain negation. Three verification passes (Opus 10%, GLM, manual cross-check) and RUN-2 all missed it; RUN-2 even recorded it as 'original behaviour F1'. The headless DOSBox comparison found it in one capture. Corrections: crossref (Fable) fixes the pseudocode + sweeps all listings for the idiom + owns qb2bas.py now; build-plbattle regenerates starport.js (F-5); RUN-2 F1 / MANUAL_XCHECK B43 wording corrected by the lanes. Rule: a 'finding about the original' is only valid once confirmed in DOSBox; idiom-level translator bugs must be swept across all modules, never fixed at one site.
- My earlier STATUS claim 'F1 reproduced faithfully' was wrong; corrected in the 06:40 STATUS block.

## 07:10 (2026-10-16) — second decode error from the oracle
- ABS sweep done (crossref 672a8c6: qb2bas renders and/jge/neg as ABS; affected .bas.md regenerated); build-plbattle regenerates the JS. dosbox-ref milestone 3 (5735347): the room-battle door IS usable in the original -> PLBATTLE decode (SUB_96FC border handling) misread; RUN-2 'F2' and MANUAL_XCHECK G56 were wrong; crossref (Fable) re-derives it after the CIRCLE rasteriser. Pattern: both decode errors were control-flow idioms (ABS, border loop) that read plausibly in pseudocode; only behavioural comparison with the original catches them. Keep dosbox-ref running until every screen id and every 'finding about the original' has a reference.

## Decision 07:30 (2026-10-16) — SC-2 colour 3
- R-1 from build-engine: the original on EGA draws SCREEN 1 colour 3 as light grey (170,170,170), the engine used bright white. Decided A (match the original's EGA colours, one palette table), recorded as SC-2 in RULINGS.md with 'the owner may reverse'. Rule used: SC-1 = B names the EGA look as the target; when the original's EGA output is known, match it; enhancements are only where the original has no EGA rendering (CGA-only content).

## 07:50 (2026-10-16)
- SC-2 applied (581e717; SU-03 now EGA grey like the reference), ABS regeneration landed (775f049). Open: F-2 CIRCLE rasteriser (crossref decoding), F-6 room door (crossref after CIRCLE), dosbox-ref re-compare + remaining SB/PB ids, GLM passes after 08:40.

## 08:10 (2026-10-16) — SC-2 addendum
- The original's colour 3 is grey only until the first SCREEN 7 module ran, then white (EGA palette registers left by SCREEN 7). Decided: emulate it (engine palette state across CHAIN). dosbox-ref milestone 4: all 51 SCREEN 1 refs re-compared, IN-13 PASS, D-QA-6/8 answered.

## 2026-10-16 01:54 (machine clock) — dosbox-ref done; clock lesson
- My block timestamps since ~'18:45' were estimates and drifted hours from the machine clock (`date` now says 2026-10-16 01:54); always stamp blocks with `date`. GLM reset '08:39' is still ahead on this clock.
- dosbox-ref DONE for now (f5176de/d6893fe): 57/60 REF PASS, 1 FAIL pending CIRCLE, 2 N/A; harness documented in acceptance/ref/README.md; keep the session for re-compares (CIRCLE, room door, post-combat colour state).

## 01:57 (2026-10-16, machine clock) — F-6 root cause and sweep
- Room door (F-6): PLBATTLE 09AB1 `mov word ptr [0xBC62],1` is Map%(76) = 1 (constant index folded into a direct store); the decode had named 0xBC62 a write-only scalar. Decode-error class #3 (after ABS idiom and translator PUT verbs): folded array indexes read as scalars. crossref sweeps all modules for named scalars inside array ranges and teaches qb2bas to resolve them; build-plbattle regenerates plbattle.js; dosbox-ref re-compares PB-04. CIRCLE rasteriser decoded (ec4316f, decode/brun30/CIRCLE.md); build-engine implementing F-2.

## 02:06 (2026-10-16) — crossref pane vanished; new Fable lane
- Pane <pane> (crossref, Fable fixer) disappeared mid-sweep (`pane_not_found`; no exit text recoverable, cause unknown: closed from the TUI or a crash). Nothing of the sweep was committed. New Fable lane sweep-folded in a fresh pane continues the folded-index sweep and becomes the standing decode fixer (owns qb2bas.py). Lesson: an in-progress Fable sweep should commit per module so a vanished pane loses little.
- build-engine's 'done' state while 'N shells still running' means it drives Chrome re-shoots in background shells: not stuck, do not re-prompt; wait for the commit.

## 02:07 (2026-10-16) — three panes vanished
- <pane> (crossref), <pane> (build-plbattle), <pane> (GLM) disappeared without my action; build-plbattle's regeneration was uncommitted (recovered by the new build-modules lane from the shared tree). Asked the coordinator in STATUS.md. Rule: lanes commit at every milestone (already) AND the Foreman checks `git status` for orphaned work whenever a pane disappears; owners are re-created from assignment files + STATUS notes, which is why everything must live in files.

## 02:11 (2026-10-16) — foreign agent
- A new workspace w3 with an agent named `dl-foreman` (<pane>) appeared, started by someone else (owner/coordinator), not by me. Not mine to touch; it may explain the pane churn (layout reorganisation). Current lanes: build-engine <pane>, dosbox-ref w2:pB, sweep-folded w2:pC (Fable), build-modules w2:pD.

## 02:14 (2026-10-16) — fourth pane lost; engine owner replaced
- <pane> (build-engine) vanished mid re-shoot. New owner build-engine2 (fresh Opus) rebuilt from herdr/assignments/build-engine.md + build-qa.md + STATUS notes: the file-based protocol makes owner replacement a one-prompt operation. Lane map: dosbox-ref w2:pB, sweep-folded w2:pC (Fable), build-modules w2:pD, build-engine2 (new). Foreign: dl-foreman <pane>, dl-link <pane>.

## 02:16 (2026-10-16) — pane-churn pattern
- All four vanished panes (crossref, build-plbattle, GLM, build-engine) were in the idle/'done' state when they went; workspace w3 is the coordinator's other project (DarklandsRE: dl-foreman, dl-link). Most likely the coordinator reclaims idle w2 panes for it. Consequences: (1) treat 'done' lanes as disposable: everything must be committed and in STATUS notes (it was, except build-plbattle's in-flight regen, recovered from the tree); (2) a lane with background shells still running looks idle but is not: build-engine lost its re-shoot that way; (3) keep the active lane count small (4 + Foreman) so the coordinator has room; (4) asked the coordinator in STATUS.md to tell me before closing panes.

## 02:25 (2026-10-16) — fidelity 58/60, 0 FAIL
- dosbox-ref 13f236c: SP-00/SP-01 arcs now equal the original (BRUN30 rasteriser), post-combat colour state verified; 58/60 REF PASS, 0 FAIL, 2 N/A. Open: full CINT re-compare after build-engine2's re-shoot; F-6 regeneration commit (build-modules); folded-index sweep (sweep-folded, INSIDE in progress); GLM passes later.

## 02:29 (2026-10-16) — sweep #3 result
- Folded-index sweep done (d76e346): 33 more sites across PLBATTLE/SPBATTLE/SPACE, one behavioural (SPACE CondMark$ off by one). Three decode-error classes so far, all idiom-level and all caught only by behaviour comparison or targeted sweeps: translator PUT verbs (ledger), ABS idiom, folded constant indexes. Sweep lanes are cheap Fable use with high yield; schedule one after every behavioural finding.

## 02:49 (2026-10-16) — F-6 verified
- Room-door exit fixed (9ab6aff) and verified against DOSBox (c617c98: PB-04d/e REF PASS; D-QA-7/D-MX-1 closed): 60/62 REF PASS, 0 FAIL. Open: build-engine2 full re-shoot (hang-proof harness, in progress), build-modules post-sweep regeneration + cint request, then dosbox-ref full re-compare; GLM passes after 08:40.

## 03:04 (2026-10-16) — memory pressure
- dosbox-ref reports its git-log watcher loop was 'stopped by Claude Code for low memory' (several headless Chrome + DOSBox-X + Xvfb instances on the 24 GB handheld). Lanes must not poll in background loops; the Foreman nudges them when the awaited commit lands. Keep the active lane count <= 4 and have lanes close their Chrome/DOSBox processes at the end of each milestone.

## HANDOFF 2026-10-16 03:20 — Fable usage limit reached in session 0c86eed9
- Resume: `claude --resume <session-id>` in this repo, pane name `foreman` (or fresh: read FOREMAN.md, this file, STATUS.md ## HANDOFF). Exact next steps are in STATUS.md ## HANDOFF (top). Loop: `herdr agent wait <lane> --timeout 175000`, read STATUS notes, prompt owners; `date` for timestamps; no polling loops in lanes.
- Lane map at pause: build-engine2 w2:pE (working), dosbox-ref w2:pB, build-modules w2:pD, sweep-folded w2:pC (Fable), foreman <pane>. Foreign: w3 (DarklandsRE).

## 2026-10-18 00:23 MDT — RESUME 10/18 (Opus 5.5 instance; handheld was shut down 10/16)
- Missed while away (by build-engine2 as coordinator): v1.1 mouse/Esc/no challenge, v1.2 help/zoom/tooltips, v1.3 settings/Classic/slots/autosave/crew panel/log book/combat aids/manual/speed/marker (DONE 12:45 10/16), testsave veteran crew save + desktop launcher. The owner 10/18: finish, rulings via RULINGS.md with a named default; model policy codex/GLM first, Fable for hard, Opus only where those fail; cap 2 lanes (PoR foreman <pane> runs 4); one headless Chrome/DOSBox at a time across both projects; push after milestones.
- 10/18 00:25: codex down (service: workspace routing discovery failed) and GLM out of balance (429). Lanes: dev-ready (Opus, w2:pZ), glm-verify-plbattle (Fable as second column, <pane>). Commit rule now in auto-memory: shared index -> `git commit -- <files>`.
- Remaining after these: full dosbox re-compare (line 'qa review request (build-engine2 -> dosbox-ref): full re-compare'), v1.3 COMPLETE block, docs/BYOC.md (game/assets/files holds 107 original byte copies, 718 KB, in history since 6fe54d1/84a0bd8).

## 00:52 2026-10-18 — rulings + RAM rule
- BYOC rulings SC-3/4/5 = A/A/A (the owner via the coordinator). Implementation (docs/BYOC.md section 5, B1..B7) only after completion work, when lanes are free.
- RAM (the coordinator 01:55, 1.2 GB free): every Claude session starts its own rea-mcp WSL server (vmmemWSL 2.4 GB). START EVERY LANE WITH `--strict-mcp-config` (no MCP servers), also on restarts/replacements. Never shut down WSL. Current lanes dev-ready/decode-fixer were started without it; replace them with strict lanes when they finish.

## 00:56 2026-10-18 — progress
- Done today: Veteran docs + Esc 'V-Load veteran crew' (d2d4f9b), reproducible dev jumps (2181fab), second column PLBATTLE 244/244 + CROSSREF review (980e3c2) and its doc fixes (14a9b98), DECODE_GATE deferred rows closed, BYOC design + SC-3/4/5 = A/A/A.
- RAM: dev-ready's re-shoot run killed for low memory (1.5 GB free, PoR Chrome). Closed dev-ready pane; dosbox-recompare (Opus, --strict-mcp-config, <pane>) does compares first, re-shoots when the Chrome slot is free. decode-fixer (Fable, <pane>, old non-strict session) fixes the LINE style pattern (plbattle beam flashes), no browser. codex still down 01:15.
- Remaining: dosbox-recompare DONE -> route REF FAIL; v1.3 COMPLETE block + README check; then BYOC implementation (B1..B7) when lanes are free.

## 01:21 2026-10-18 — fixes and lessons
- fout (Fable): BRUN30 number output transcribed (decode/brun30/FOUT.md) and str$ ported bit-exact (05d75c2) -> SP-04a. decode-fixer: PLBATTLE beam-flash LINE style patterns (ebdcf1b). readme-final: game/README.md finally covers v1.1-v1.3 (c8f946c); its numbers need a refresh after the re-compare.
- LESSON: dev-ready's 2181fab put a raw CR into starport.js; node suites never load module files, so STARPORT was dead in the browser until dosbox-recompare hit it (86de203). New guard tools/check_js.sh (node --check + raw CR) — tell every lane touching game/ to run it before committing.
- Pattern that works under RAM pressure: one browser-using lane at a time; every other lane gets 'no browsers' in its prompt; close a lane's pane the moment it is DONE (each idle Claude session costs RAM, non-strict ones also a rea-mcp WSL server).

## 01:57 2026-10-18 — v1.3 COMPLETE; BYOC started
- dosbox-recompare: full re-compare 62 PASS / 0 FAIL / 2 N/A (3f7ec08); 90/90 acceptance rows with second check (0c47daa); PB-02/04 freeze fix (the seed was fine; SUB_9B06 cycled the header while polling), its re-shoot waits for the Chrome slot. README final numbers (46c8893). v1.3 COMPLETE block (8ad5602), pushed.
- BYOC: byoc-b3 (Fable, strict, <pane>) = translators to JS byte-identical (step 0 = prove the Python pipeline reproduces the repo from the originals; hand edits become annotations). byoc-assets (B1/B2/B5) assignment ready; starts on Opus strict (codex still down 02:00) when dosbox-recompare finishes. Then B4 (annotation scrub), B6 (filtered public repo per SC-4 A, private untouched), B7 (import acceptance run).

## 02:05 2026-10-18 — FABLE STOP (the owner 02:05)
- Fable weekly usage at 92%: NO Fable lanes until the weekly reset 16:00 MDT 2026-10-18. byoc-b3 (Fable) paused after step 0 (26e2f78: Python pipeline reproduces listings/.bas.md/module JS byte-identically from the originals; RESUME section in docs/byoc/B3.md); pane closed. Its session id: <session-id> (resume with `claude --resume <id>` after 16:00 if Fable work is wanted).
- My call: B3 steps 1-4 reassigned to Opus (byoc-b3-opus) — the byte-identical equivalence test makes a wrong port impossible to miss; Fable reserved for after 16:00 only if Opus stalls on the 8086 decoder. Rest of BYOC continues on Opus (codex still down, GLM no balance).

## 02:21 2026-10-18 — BYOC progress
- byoc-assets (Opus, <pane>): B1/B2/B5 done in ~15 min (1df3e32..b92d8a7): manifest (123 files, 115 required, hashes only), importer page (picker/webkitdirectory/zip, worker -> OPFS), tier 1 + tier 2 ports byte/pixel-identical, veteran recipe, `?assets=opfs` switch (default unchanged), node test. Browser import check waits for the Chrome slot (its 30 s watcher is running).
- byoc-b3-opus (Opus, <pane>): step 1 one bas2js byte-identical (50badc2); now steps 2-4 (JS port incl. dis16 decoder, equivalence test, annotation audit).
- Next after both: B4 annotation scrub (if B3 step 4 leaves items), B6 filtered public repo (SC-4 A: new repo from a filtered clone; needs a repo name + GitHub create = outward-facing -> ask owner/coordinator before creating), B7 import acceptance run + the parked PB-02/04 re-shoot.

## 02:30 2026-10-18 — SC-6 + B3 port
- SC-6 = A for now (the owner 02:20): public tree local only; publish only after the owner personally tested Star Command AND Pool of Radiance (later this week). Fable reset 16:00 MDT = 00:00 Amsterdam; no Fable before.
- B3 step 2 done on Opus (bbd6c18): game/byoc dis16/qbdis/modconst/qb2bas/bas2js pipeline byte-identical on all 7 modules. byoc-assets: browser import check 9/9 (4bfaecf), now on B6 (local filtered clone + leak scanner).

## 02:55 2026-10-18 — B3 DONE on Opus (no Fable needed)
- byoc-b3-opus finished B3 (bbd6c18 port, ac3b81f equivalence 27/27 files from the EXEs, ac4c533 annotation audit, 0ce0458 MODULE_CONSTANTS.public.md, f41305e startup.js strings from a generated strings.js). Pane closed. The Fable session 5d903c38 is no longer needed.
- B6 (aba3f9b): local filtered clone <projects>/StarCommand-public, 0 hash / 0 binary hits in tree + history; nothing pushed (SC-6 A for now).
- Remaining: byoc-assets integration (tier 3 in the import worker, modules from OPFS, auto when assets/files absent) + B7 acceptance + parked PB-02/04 re-shoot; then refresh the filtered clone from the final HEAD and re-scan; final STATUS block for the owner.
- Python heredoc trap: a Windows path containing a backslash-U inside a normal Python string literal is a unicode-escape SyntaxError; write paths with forward slashes, or use the Edit tool for memory notes.

## Open threads / next steps (keep current)
1. (superseded 04:20, see Milestone above) Phase 2 lanes (21:30): build-plbattle <pane> (ex build-startup; owns startup.js, space.js, bas2js.py, plbattle.js), build-spbattle w2:pA (ex build-starport; owns starport.js, spbattle.js), build-engine <pane> (engine + inside.js; 2 engine requests open: sprite-bank files, text cursor), crossref <pane> (Fable fixer, idle), GLM <pane> (idle until 2026-10-16 08:40: 'continue' CROSSREF_GLMREVIEW.md, glm-verify-plbattle, then build-qa). When a module lane finishes: build-qa reviewer pass (GLM or Opus) over ACCEPTANCE.md, then integration run STARCOMM->PLBATTLE end to end. (foreground waits, 5 min). On DONE: check that .bas.md + _SCREENS.md + names.json exist, STATUS DONE block, commit; rename+re-prompt the finished Fable session as the next mod lane (keeps translator context): order PLBATTLE, STARPORT remaining; re-prompt glm-verify/verify lanes per finished module. Open: 'verify fix request' notes in STATUS.md for finished modules are mine to apply.
2. data-fix (Opus, <pane>, started 14:55; codex session there was exited with ctrl+c x2 since all drafts are done): SPRITES.md TITLE.BAS row + RT_LEDGER confidence upgrades. On DONE the pane is free for the next Fable mod lane or glm-verify.
3. verify lane (Opus): 10% random-line re-read per module vs listing. 4. DECODE_GATE.md (Foreman). 5. BUILD_PLAN.md + Opus build lanes (game/ HTML5 engine) without waiting.
