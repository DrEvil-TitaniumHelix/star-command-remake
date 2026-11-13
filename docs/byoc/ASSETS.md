# BYOC tiers 1+2 and the veteran recipe (lane byoc-assets, docs/BYOC.md B1, B2, B5)

## Pieces

| file | what |
|---|---|
| `docs/byoc/manifest.json` (+ identical `game/byoc/import/manifest.json` for the browser) | the known release (`starcoma-1`): 123 names, sizes, SHA-256; 115 required, 8 optional. `node tools/byoc/make_manifest.mjs [DIR] [--check]` |
| `game/byoc/convert/lists.js`, `sprites_index.json` | which files the recipe reads (convert_data.py lists); sprite banks from `decode/data/sprites_index.tsv` (`node tools/byoc/sprites_index.mjs [--check]`) |
| `game/byoc/convert/data.js` | tier 1, port of `tools/convert_data.py`: `files/<NAME>` byte copies + `data/<STEM>.json` |
| `game/byoc/convert/items.js` | port of `tools/items.py`: `data/items.json` |
| `game/byoc/convert/pyjson.js` | Python `json.dumps` in JS (float repr, `0.0`, `ensure_ascii`, indent): why the JSON bytes match |
| `game/byoc/convert/atlas.js` | tier 2, port of `tools/build_atlas.py` + `bsave.py decode()`: `atlas.png`, `atlas.json` |
| `game/byoc/convert/veteran.js` | the Veteran Crew save (was `tools/make_veteran_save.mjs`, which is now a wrapper around it) |
| `game/byoc/convert/index.js`, `version.js` | the recipe: all of the above in order; `RECIPE_VERSION` |
| `game/byoc/import/` | importer page (`index.html`, `importer.js`), `worker.js`, `validate.js`, `zip.js`, `opfs.js` (store + fetch wrapper) |

## Results (on this machine, from the originals)

- 107 files, 24 tables, items.json, atlas.json, veteran CHARINFO.BAS + CHARNAME: **byte-identical** to `game/assets`.
- atlas.png: **pixel-identical, not byte-identical.** Same IHDR, PLTE, IEND and the same inflated scanlines; only the
  IDAT deflate stream differs, because the committed file came from Python's zlib 1.3.1 level 9 and neither node
  (Chromium zlib 1.3.2.1-motley) nor the browser's `CompressionStream` produce those exact bytes. The engine decodes
  the PNG, so nothing downstream sees a difference. `node game/byoc/assets.test.mjs` checks all of this.
- Not produced: `data/manual.json` (the manual is not in the game folder; docs/BYOC.md 3.2), `gmap.json`,
  `font8x8.json` (own work / licensed, shipped). In OPFS mode those are fetched from `assets/` (fallback).

## OPFS layout and the switch

`sc-assets/starcoma-1/` holds the `game/assets` layout, `originals/` (the validated files, so a new
`RECIPE_VERSION` re-converts without asking the player again) and `done` (written last: `{manifest, recipe, files,
bytes, originals, at}`). Save games stay in localStorage (`starcommand:file:*`, slots) and are never touched.

`game/index.html?assets=opfs` (or localStorage `starcommand:assetsBase` = `opfs`): no ready store = go to the
importer and come back; ready = `installOpfsFetch()` and `boot({ assets: 'byoc-opfs/' })`. Every engine read
goes through `fetch()` (sprites.js now loads atlas.png through fetch + an object URL), so the switch is the base
URL alone. The default stays `assets/` until B6 removes the originals.

## Open for later lanes

- B6: once `game/assets/{files,data,atlas.*,saves}` are gone, the default must become OPFS (flip the index.html
  default) and `manual.js` must cope with the missing manual.json (falls back to our own notes, docs/BYOC.md 3.2).
- Tier 3 (B3) can add its module JS to the same store: yield `{path: 'modules/...', bytes}` from
  `convert/index.js` and bump `RECIPE_VERSION`.
