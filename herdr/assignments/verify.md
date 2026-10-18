# Lane: verify (Opus) — independent 10% re-read of each module's final pseudocode against its listing

Read FOREMAN.md first (evidence rule). This lane runs module by module as the Fable mod lanes finish; the Foreman re-prompts you with each new module name. Inputs per module: `decode/pseudo/<MOD>.bas.md`, `<MOD>_SCREENS.md`, `<MOD>_names.json` (if present), `decode/listings/<MOD>.lst`, `decode/brun30/RT_LEDGER.md`, `decode/data/MODULE_CONSTANTS.md`.

Method: with a fixed seed (state it), sample 10% of the pseudocode statements (minimum 30, every statement for modules under 300 lines) plus every CHAIN / BLOAD / ON GOTO / ON GOSUB / INPUT / OPEN site. For each sampled statement, re-derive it from the listing's instruction bytes and the ledger semantics without looking at the pseudocode's rendering first; then compare. Record AGREE / DISAGREE (with your derivation) / UNSURE, offset, bytes. Also spot-check that every named variable in the `## Variables` table or names.json has evidence that the listing supports, and that `_SCREENS.md` text matches the module's string table.

Output: `decode/pseudo/<MOD>_VERIFY.md` (verdict table, disagreements, 3-line summary with counts). Do NOT edit the module lane's files: for a DISAGREE write the fix as a `verify fix request: <MOD> <offset> <what>` note at the top of STATUS.md; the owning lane (or the Foreman, if that lane is gone) applies it. Commit only your files (`git add decode/pseudo/<MOD>_VERIFY.md STATUS.md && git commit -m "verify: <MOD> ..."`); 5-line block at the top of STATUS.md per module.

First modules: STARCOMM and STARTUP (both final, `decode/pseudo/STARCOMM.bas.md`, `STARTUP.bas.md`, `STARTUP_SCREENS.md`).
