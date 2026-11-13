import SPRITES from './sprites_index.json' with { type: 'json' };

export const SPRITE_BANKS = SPRITES.banks;

export const TEXT = ['NAME', 'CHARNAME', 'ENCINFO', 'ENCLIST', 'ENCTABLE', 'MISSION', ...[1, 2, 3, 4, 5, 6, 7].map((n) => `MES-${n}`)];
export const BIN_MBF = ['CHARINFO.BAS', 'INFO.BAS'];
export const BIN_INT = ['GALAXY.BAS', 'INSH.BAS', ...[1, 2, 3, 4, 5, 6, 7].map((n) => `IN-${n}.BAS`)];
export const RAW_ONLY = [...[1, 2, 3, 4, 5, 6, 7].map((n) => `INMAP-${n}.BAS`), 'INMAP.BAS'];
export const BANKS = [...new Set(SPRITE_BANKS.map((b) => b.file))].sort();

export const DISK_FILES = [...new Set([...TEXT, ...BIN_MBF, ...BIN_INT, ...RAW_ONLY, ...BANKS.filter((n) => !RAW_ONLY.includes(n))])];

export const MODULES = ['STARCOMM.EXE', 'STARTUP.EXE', 'STARPORT.EXE', 'SPACE.EXE', 'INSIDE.EXE', 'SPBATTLE.EXE', 'PLBATTLE.EXE'];
export const RUNTIME = ['BRUN30.EXE'];

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

export function fileUse(name) {
  if (MODULES.includes(name)) return 'module';
  if (RUNTIME.includes(name)) return 'runtime';
  if (TEXT.includes(name) || BIN_MBF.includes(name) || BIN_INT.includes(name)) return 'data';
  if (RAW_ONLY.includes(name) || BANKS.includes(name)) return 'bank';
  if (name in OPTIONAL) return 'optional';
  return null;
}
