# Changelog

## v0.1.0-alpha — 2026-10-18 (first public release)

**What plays.** The whole 1988 game in the browser: title and startup menu, starport (recruiting, training, ships,
equipment, missions, saving), space travel and scans, stations and bases, ship-to-ship battles and ground battles,
with the original save file `CHARINFO.BAS`. Additions, each switchable in Esc → T-Settings, all off in **Classic mode**:
mouse on every hotkey, Esc menu (save & quit, load), F1 controls help, map zoom, item and enemy tooltips, named save
slots and autosave, crew panel, log book, combat aids (range, hit preview), game speed, mission marker, veteran crew.
Keyboard, mouse and gamepad.

**How it was checked.** 90 acceptance screens, each with a build check and an independent review: 90 pass
(`ACCEPTANCE.md`). 64 of them were compared pixel by pixel with the original running in DOSBox-X: 62 match apart from
test data (crew names, dice rolls), none differ, 2 cannot be shown in the original (SP-10, IN-04). Integration runs
RUN-1 and RUN-2 pass; the same opening also passes from an imported copy in a fresh browser profile.

**Known open points.**
- D-IN-3: esper V-View inside a station: whether the map keeps the revealed rooms after the flash (needs a DOSBox check).
- D-MX-2: ship battle with only Shield #1 fitted: whether fire from straight ahead hits that shield (needs a DOSBox check).
- Ground-battle beam flashes are drawn dashed as the program says; not compared with a DOSBox picture.
- The Manual button is off: the rule book is not distributed.
- Floppy "insert disk" prompts are not shown (hard-disk behaviour).

**Bring your own copy.** Needs the `STARCOMA` folder of the original release: 123 files known, 115 required, checked
by size and SHA-256 against `docs/byoc/manifest.json` (release `starcoma-1`; other releases untested). The importer
converts the files and translates the program modules in the browser; nothing is uploaded. Chrome or Edge
recommended; serve with `python -I tools/serve.py 8088`.
