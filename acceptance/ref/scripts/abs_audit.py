#!/usr/bin/env python3
"""abs_audit.py : find the integer ABS idiom (`and r,r / jge +2 / neg r`) in every decode listing and
print the pseudocode line(s) whose label falls within the next 12 listing lines, so a reviewer can see
whether qb2bas rendered ABS(...) or a plain negation -(...). Run from the repo root (Windows Python)."""
import re
from pathlib import Path

for lst in sorted(Path('decode/listings').glob('*.lst')):
    mod = lst.stem
    pseudo = Path(f'decode/pseudo/{mod}.bas.md')
    if not pseudo.exists():
        continue
    plines = pseudo.read_text(encoding='utf-8').splitlines()
    byaddr = {}
    for l in plines:
        m = re.match(r'^([0-9A-F]{5})  (.*)', l)
        if m:
            byaddr.setdefault(m.group(1), []).append(m.group(2))
    L = lst.read_text(encoding='utf-8', errors='replace').splitlines()
    for i in range(len(L) - 2):
        if re.search(r'\band (\w+), \1\b', L[i]) and 'jge' in L[i + 1] and 'neg' in L[i + 2]:
            addr = L[i][:5]
            shown = None
            for j in range(i + 3, min(i + 40, len(L))):
                a = L[j][:5]
                if a in byaddr:
                    shown = (a, byaddr[a]); break
            txt = ' | '.join(shown[1]) if shown else '(no pseudo line found)'
            flag = 'ABS ok' if 'ABS(' in txt else 'CHECK'
            print(f'{mod} {addr} -> {shown[0] if shown else "-"}: {flag}: {txt[:160]}')
