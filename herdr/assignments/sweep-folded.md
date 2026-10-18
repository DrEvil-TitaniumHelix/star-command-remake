# Lane: sweep-folded (Fable) — decode sweep for constant array indexes folded into direct addresses (error class #3), plus standing decode fixer

Read FOREMAN.md, `herdr/FOREMAN_MEMORY.md` (sections on F-5 ABS idiom and F-6 room door), `decode/pseudo/CROSSREF.md`, and the STATUS.md notes `decode fix done (ABS idiom)` and `decode fix done (room door)`.

Background: the QuickBASIC compiler folds a constant array index into a direct memory operand (`mov word ptr [0xBC62],1` = `Map%(76) = 1`, PLBATTLE 09AB1). The decode had named that address a write-only scalar (`HasDoor%`), which hid the room-door exit until a DOSBox comparison exposed it. The previous Fable fixer (lane crossref, pane closed) had started this sweep; nothing of it is committed.

Task:
1. For all seven modules: take every named or unnamed scalar address used in `decode/pseudo/<MOD>.bas.md` (Variables tables / `<MOD>_names.json`) and test whether it falls inside a DIM'd array's range (array base + element size x count, from the `Arrays` tables, `decode/data/MODULE_CONSTANTS.md` and the COMMON map in CROSSREF.md §2, incl. the BLOAD regions). Every hit is re-rendered as `<Array>(<index>)` in the `.bas.md` (and names.json/_header prose); list each site with offset and old/new text.
2. Teach `decode/pseudo/tools/qb2bas.py` (you own it now) to resolve direct addresses inside array ranges automatically, regenerate the affected `.bas.md` files, diff-check that only the intended sites changed.
3. Flag remaining suspects (write-only or read-only "scalars", addresses adjacent to arrays) in a `## Suspects` list in `decode/pseudo/CROSSREF.md` §6.
4. Post `decode fix done (folded indexes): <MOD> <offsets>` at the top of STATUS.md so lane build-plbattle regenerates the JS; commit per module.
Afterwards you are the standing Fable decode fixer: answer `decode fix request:` notes at the top of STATUS.md in place.

Shell rule: rm paths as `"${VAR:?}/..."` or literals. Commit only decode files, qb2bas.py, this assignment and STATUS.md.

## Result (sweep-folded, 2026-10-16)

Done: see `decode fix done (folded indexes)` in STATUS.md and CROSSREF.md §6 "Suspects". Hits beyond the earlier Map%(76)/MoveDY!(0)/EnHeading!(5): PLBATTLE GrpX!/GrpY! slots 5..8 (16 sites), SPBATTLE EnX!(5)/EnY!(5) (14 sites), SPACE CondMark$ elements 1..3 (3 sites, behaviour: the equipment condition marks were off by one). qb2bas.py resolves direct addresses inside array ranges (COMMON built in, `A<base>_count` in the names files), `--header`, `--sweep`. Lane now idle as the standing Fable decode fixer (answers `decode fix request:` notes at the top of STATUS.md).
