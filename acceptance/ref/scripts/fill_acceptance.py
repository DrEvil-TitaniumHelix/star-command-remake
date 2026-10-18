#!/usr/bin/env python3
"""fill_acceptance.py VERDICTS.tsv : write the DOSBox ref path (column 4) and append the dosbox-ref
verdict to the reviewer column (6) of ACCEPTANCE.md for every row id in the TSV (id<TAB>ref<TAB>verdict).
Re-running replaces an earlier dosbox-ref verdict instead of appending twice. LF line endings kept."""
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
acc = REPO / 'ACCEPTANCE.md'
TAG = ' / dosbox-ref 2026-10-16: '
verdicts = {}
for line in Path(sys.argv[1]).read_text(encoding='utf-8').splitlines():
    if line.strip() and not line.startswith('#'):
        id_, ref, v = line.split('\t')
        verdicts[id_] = (ref, v)
out, hit = [], set()
for line in acc.read_text(encoding='utf-8').split(chr(10)):
    cells = line.split('|')
    if line.startswith('| ') and len(cells) == 8 and cells[1].strip() in verdicts:
        id_ = cells[1].strip()
        ref, v = verdicts[id_]
        cells[4] = f' {ref} '
        rev = cells[6].strip().split(TAG.strip())[0].rstrip(' /')
        cells[6] = f' {rev}{TAG}{v} ' if rev else f' dosbox-ref 2026-10-16: {v} '
        line = '|'.join(cells)
        hit.add(id_)
    out.append(line)
acc.write_bytes('\n'.join(out).encode('utf-8'))
print('updated', len(hit), 'rows; not found:', sorted(set(verdicts) - hit))
