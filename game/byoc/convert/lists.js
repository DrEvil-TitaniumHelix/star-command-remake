// lists.js — which original files the BYOC conversion reads and what it makes of them (lane byoc-assets).
// Same lists as tools/convert_data.py (TEXT, BIN_MBF, BIN_INT, RAW_ONLY, BANKS); formats: decode/data/DATA_FILES.md.
// Names only: no bytes of the originals live here.

import SPRITES from './sprites_index.json' with { type: 'json' };

export const SPRITE_BANKS = SPRITES.banks;   // decode/data/sprites_index.tsv rows (tools/byoc/sprites_index.mjs)

// OPEN ... FOR INPUT files (INPUT # / LINE INPUT #)
export const TEXT = ['NAME', 'CHARNAME', 'ENCINFO', 'ENCLIST', 'ENCTABLE', 'MISSION', ...[1, 2, 3, 4, 5, 6, 7].map((n) => `MES-${n}`)];
// BLOADed tables: MBF singles / 16-bit integers
export const BIN_MBF = ['CHARINFO.BAS', 'INFO.BAS'];
export const BIN_INT = ['GALAXY.BAS', 'INSH.BAS', ...[1, 2, 3, 4, 5, 6, 7].map((n) => `IN-${n}.BAS`)];
// pictures the game may BSAVE back (byte copies only)
export const RAW_ONLY = [...[1, 2, 3, 4, 5, 6, 7].map((n) => `INMAP-${n}.BAS`), 'INMAP.BAS'];
// every sprite bank is also a byte copy: modules BLOAD them into memory and some read the pixel words as data
export const BANKS = [...new Set(SPRITE_BANKS.map((b) => b.file))].sort();

// tools/convert_data.py main() order: the order files are copied and tables written
// (INSH.BAS is both a table and a sprite bank: convert_data.py handles it twice with the same result; listed once here)
export const DISK_FILES = [...new Set([...TEXT, ...BIN_MBF, ...BIN_INT, ...RAW_ONLY, ...BANKS.filter((n) => !RAW_ONLY.includes(n))])];

// the compiled program: launcher + 6 modules, and the runtime they need (tier 3 input)
export const MODULES = ['STARCOMM.EXE', 'STARTUP.EXE', 'STARPORT.EXE', 'SPACE.EXE', 'INSIDE.EXE', 'SPBATTLE.EXE', 'PLBATTLE.EXE'];
export const RUNTIME = ['BRUN30.EXE'];

// in the release but not needed by the port: separate utilities, CHAIN stubs the engine skips (README "CHAIN"),
// the floppy start batch
export const OPTIONAL = {
  'COLOR.EXE': 'utility (not part of the game program)',
  'DEMO.EXE': 'utility (not part of the game program)',
  'FIXIT.EXE': 'utility (not part of the game program)',
  'INSIDE.STR': 'CHAIN stub, skipped by the engine (hard-disk configuration)',
  'PLBATTLE.STR': 'CHAIN stub, skipped by the engine (hard-disk configuration)',
  'SPACE.STR': 'CHAIN stub, skipped by the engine (hard-disk configuration)',
  'STARPORT.STR': 'CHAIN stub, skipped by the engine (hard-disk configuration)',
  'START.BAT': 'DOS start batch',
};

// role of one file of the release (manifest "use")
export function fileUse(name) {
  if (MODULES.includes(name)) return 'module';
  if (RUNTIME.includes(name)) return 'runtime';
  if (TEXT.includes(name) || BIN_MBF.includes(name) || BIN_INT.includes(name)) return 'data';
  if (RAW_ONLY.includes(name) || BANKS.includes(name)) return 'bank';
  if (name in OPTIONAL) return 'optional';
  return null;
}
