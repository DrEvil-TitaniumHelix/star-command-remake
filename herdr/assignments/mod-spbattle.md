# Lane: mod-SPBATTLE — BASIC-style pseudocode for one module

Read FOREMAN.md and `decode/brun30/RT_LEDGER.md` first. Input: `decode/listings/SPBATTLE.lst` (regenerated after rt-naming), `decode/data/MODULE_CONSTANTS.md`. Output: `decode/pseudo/SPBATTLE.bas.md` and `decode/pseudo/SPBATTLE_SCREENS.md`.

Rules: labels = code offsets (`L_0040:`); render each runtime-call pattern as the BASIC statement it implements (e.g. `mov bx,20; RT3E_42; mov bx,2; RT3E_44; RT3F_BC; mov bx,0xaa94; RT3F_6A; RT3E_79` -> `LOCATE 20,2: PRINT S_AA94$`). Name variables by evidence only (`S_AA94$` until a literal/usage proves a meaning, then `ShipName$ 'was S_AA94$`). Near `call`/`ret` inside the module = GOSUB/RETURN or compiled subroutines; `jmp` = GOTO; conditional jumps after FCMP/FTEST = IF. Keep a `## Unknowns` section listing every runtime call you could not render. Keep a `## Variables` table (address, type, inferred name, evidence). Screens: for each distinct screen the player sees, list the LOCATE/PRINT text, the sprites PUT, the keys read, and transitions.
Commit; 5-line status to STATUS.md.

## Inputs added 2026-10-15 (Foreman)
- Codex first draft: `decode/pseudo/SPBATTLE.draft.md` (scaffold only; re-derive every statement from `decode/listings/SPBATTLE.lst`).
- Translator from mod-space: `decode/pseudo/tools/qb2bas.py` (`python decode/pseudo/tools/qb2bas.py decode/listings/SPBATTLE.lst decode/data/tools/_SPBATTLE.json decode/pseudo/SPBATTLE.bas.md --title SPBATTLE --names decode/pseudo/SPBATTLE_names.json`). Create `decode/pseudo/SPBATTLE_names.json` in the SPACE_names.json format (key = DS hex / A<base> / SUB<addr>, <key>_why = evidence). Extend the translator if SPBATTLE uses patterns it does not render; keep it generic (shared by all module lanes - do not break SPACE).
- Model: `decode/pseudo/STARTUP.bas.md` + `STARTUP_SCREENS.md` (format), `decode/pseudo/SPACE.bas.md` (translator output + names).
- Do NOT edit files owned by other lanes (SPACE.bas.md, RT_LEDGER.md). Ledger disagreements go into your STATUS.md block.
- When done: commit (`git add decode/pseudo/SPBATTLE* decode/pseudo/tools herdr/assignments/mod-spbattle.md STATUS.md && git commit -m "mod-spbattle: ..."`) and write a DONE block at the top of STATUS.md.

## Shared-file rule (2026-10-15, the coordinator flag)
- `decode/pseudo/tools/qb2bas.py` has ONE owner lane at a time (named in STATUS.md / FOREMAN_MEMORY.md). Non-owners request changes with a `qb2bas request:` note at the top of STATUS.md and rerun after the owner posts `qb2bas done`.
