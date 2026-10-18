# Lane: fout (Fable) — exact BRUN30 number-to-text formatting for STR$ / PRINT (2026-10-18)

Read FOREMAN.md, `decode/brun30/RT_LEDGER.md` (conventions; FAC/MBF section, the PRINT number item rows), `decode/brun30/rt_asm.txt` + `decode/brun30/funcs/*.c`, and in STATUS.md the line `qa fix request (dosbox-recompare -> Foreman, engine): SP-04a MASS`.

Problem: `game/engine/basic.js` `str$` guesses the MS BASIC rule (E notation outside 0.01 <= |n| < 1E7, 7 significant digits, confidence M). SP-04a prints `1E-02` where the original prints `.01`, because fround(0.01) < 0.01.

Task:
1. Find and transcribe BRUN30's single-precision output routine (the number-to-ASCII conversion used by PRINT number items and STR$, reached from the PRINT dispatcher / RT3F_6x rows): how the MBF single is scaled to decimal digits, how many digits, how it rounds, when it switches to E notation (exact thresholds as MBF/decimal exponent conditions), trailing-zero and leading-zero handling, the sign/space, and the exponent format (`E-02`, `E+07`, `D` never for singles). Write it as pseudocode with offsets into `decode/brun30/FOUT.md` and add a pointer from the relevant RT_LEDGER rows (no renames).
2. Implement exactly that algorithm in `game/engine/basic.js` `str$` (you own `str$` / `printNum` for this task; nothing else in the engine). Work on the MBF/IEEE single value, not on a JS double, where the routine depends on it.
3. Add a node test `game/engine/fout.test.mjs` with the edge cases the decode identifies (at least .01, .0099999, .001, 1E-07, 9999999, 1E+07, 123.4567, -0.5, values just below/above each threshold) and the expected strings from your transcription; all existing `node game/engine/*.test.mjs` must still pass.
4. Do NOT start headless Chrome or DOSBox (RAM is tight; lane dosbox-recompare owns the single slot). Post `qa review request (fout -> dosbox-recompare): re-shoot SP-04a and any screen printing small/large numbers`, mark the SP-04a request `[APPLIED by fout <commit>]`, write a 5-line DONE block at the top of STATUS.md with `date` output.

The git index is shared: commit with a pathspec (`git commit -m "fout: ..." -- <files>`). Shell rule: rm paths as `"${VAR:?}/..."` or literals.
