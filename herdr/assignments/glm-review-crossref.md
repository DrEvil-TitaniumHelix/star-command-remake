# Lane: glm-review-crossref (GLM 5.3) — second opinion on the cross-module consolidation

Read FOREMAN.md first (evidence rule). Input: `decode/pseudo/CROSSREF.md` (lane crossref, Fable), the final pseudocode files it cites (`decode/pseudo/*.bas.md`, `*_names.json`), `decode/data/DATA_FILES.md` section D, `decode/brun30/RT_LEDGER.md`, the listings in `decode/listings/`.

Task: for every claim in CROSSREF.md sections 1-5 (CHAIN graph edges and conditions, G!()/A() index meanings, string-array roles, resolved data unknowns, ledger M-row check, unknown roll-up impacts) re-derive it from the cited offsets in the listings/pseudocode: AGREE / DISAGREE (with your derivation) / UNSURE. Pay special attention to: reachability of every module from STARCOMM, index collisions (two modules reading the same G!() slot with different meanings), and any "resolved" data unknown whose resolution rests on a single site.

Output `decode/pseudo/CROSSREF_GLMREVIEW.md` (verdict table, disagreements, 3-line summary). Disagreements also as `crossref fix request: ...` lines at the top of STATUS.md. Do not edit other lanes' files. Commit only your file and STATUS.md (5-line block).
