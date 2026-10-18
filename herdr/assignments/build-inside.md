# Lane: build-inside (Opus) — port module INSIDE to `game/modules/inside.js`

Read FOREMAN.md, BUILD_PLAN.md (§2 engine API, §4 your screens, §5 acceptance), `game/engine/README.md` (engine API as built by lane build-engine), then your decode inputs: `decode/pseudo/INSIDE.bas.md` (the behaviour, statement by statement), `decode/pseudo/INSIDE_SCREENS.md` and the `IN-*` rows of `decode/pseudo/SCREENS_INDEX.md` (what the player sees, sprites as bank[index], keys, transitions), `decode/pseudo/INSIDE_names.json` (variable meanings), `decode/pseudo/CROSSREF.md` §1-2 (CHAIN contract, G!() map), `decode/data/DATA_FILES.md` for the files this module reads.

You own `game/modules/inside.js` (and `game/modules/inside/*` if you split it). Rules:
- Transcribe the pseudocode flow faithfully: same screens, same text at the same row/col, same sprites/verbs/positions, same keys, same transitions and timing (SC-1 = B: colours may differ, geometry and behaviour may not). Keep the listing offsets as comments (`// 1B69`) so a reviewer can map code to the decode.
- Use only the engine API; if you need something the engine lacks, file `engine request: <what, why, which screen>` at the top of STATUS.md and continue with other screens; build-engine posts `engine done`.
- Decode doubts (a statement you cannot reproduce from the pseudocode) = `decode fix request: INSIDE <offset> <question>` note at the top of STATUS.md; the standing Fable fixer (lane crossref) answers in place. Never guess silently; mark a TODO with the offset.
- Every screen id you finish gets a dev jump (`?screen=<id>` with a fixture state) and a screenshot `acceptance/out/<id>.png`; add the row to `ACCEPTANCE.md` with your self-check (text/sprites/keys/transitions) and leave the reviewer column empty.
- Shell rule: rm paths as `"${VAR:?}/..."` or literals. Never modify the originals under `re-targets`.
Commit per screen group (`git add game/modules/inside* acceptance ACCEPTANCE.md herdr/assignments/build-inside.md STATUS.md`), 5-line STATUS.md block per milestone, DONE block when all IN-* rows pass your self-check.
