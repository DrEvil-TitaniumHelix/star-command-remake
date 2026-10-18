# Lane: readme-final — player README brought up to v1.3 (2026-10-18)

The owner is non-technical and reads `game/README.md` to play. It still describes v1 (10/15): none of the v1.1-v1.3 additions are in it, and its "Known gaps" list is stale (SPBATTLE was "being built", reviews "waiting"; both done).

Sources (do not invent behaviour; every control you describe must be in one of these or in the code): the STATUS.md blocks `v1.1 DONE ... what the owner will see`, `v1.2 DONE ...`, `v1.3 DONE ...`, `testsave DONE`, `dev-ready` (Esc `V-Load veteran crew`), `game/engine/README.md`, `game/engine/settings.js` (switch names), `game/engine/overlay.js` (Esc menu letters), ACCEPTANCE.md summary, `acceptance/DOSBOX_REQUESTS.md` (open items), RULINGS.md (SC-1, SC-2 + addendum: what colours to expect).

You own `game/README.md` only. Keep its existing structure where it is right (starting the game, keyboard, gamepad, saving, veteran crew, developer shortcut) and:
1. Add a section **"What is new compared with the 1988 game"**: mouse on every hotkey; Esc menu (Resume, Save & Quit, Quit, Settings, Load veteran crew); no rule-book question (and how Classic brings it back); F1 controls help; map zoom; item tooltips; Settings page and **Classic mode** (everything off = the original exactly); save slots + autosave at every starport; crew panel; log book; combat aids (enemy tooltips, Range, Hit preview); Manual button; F2 speed; mission marker. One or two plain sentences each: what it does, how to use it (keyboard / gamepad / mouse), how to switch it off.
2. Update **Controls** so mouse and gamepad descriptions match v1.1-v1.3 (the old note that crew pickers need a keyboard: check whether the mouse now covers them, per the v1.1 block).
3. Rewrite **Known gaps** from the current state only: ACCEPTANCE.md summary numbers, open DOSBox questions, anything the STATUS blocks list as not done; keep "Not in the port on purpose" (floppy prompts). Say plainly what is checked against the original (DOSBox comparison counts).
4. Plain language, short sentences, no jargon (no "module", "CHAIN", "OPFS"); bold the key names.

Do not start browsers or DOSBox. Commit with a pathspec: `git commit -m "readme-final: ..." -- game/README.md STATUS.md`; 3-line DONE block at the top of STATUS.md with `date` output.
