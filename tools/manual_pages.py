import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def build():
    docs = ROOT / 'decode/docs'
    chunks = re.split(r'===== PAGE (\d+) =====', (docs / 'StarCommand_Manual_SSI1988.txt').read_text(encoding='utf-8'))
    pages = {int(chunks[i]): chunks[i + 1].strip() for i in range(1, len(chunks), 2)}
    differences = []
    for line in (docs / 'MANUAL_XCHECK.md').read_text(encoding='utf-8').splitlines():
        cells = re.split(r'\s+\|\s+', line.strip().strip('|').strip(), maxsplit=4)
        if re.match(r'^[A-H]\d+$', cells[0].strip()) and len(cells) == 5 and cells[3].strip().startswith('DISCREPANCY'):
            ident, manual, source, verdict, game = [c.strip() for c in cells]
            differences.append(dict(id=ident, manual=manual, game=(verdict.removeprefix('DISCREPANCY').strip() + ' ' + game).strip(), source=source))
    assert len(differences) == 59, len(differences)
    chapters = {'CM': (5, 10, 'A'), 'SU': (5, 10, 'A'), 'PT': (10, 15, 'ABC'),
                'SP': (15, 17, 'E'), 'SB': (17, 19, 'F'), 'PB': (19, 21, 'G'),
                'IN': (21, 23, 'H'), 'ST': (5, 6, 'A')}
    screens = {}
    for ident, title in re.findall(r'^\| ([A-Z]{2}-\d+[a-z]?) \| ([^|]+)', (ROOT / 'decode/pseudo/SCREENS_INDEX.md').read_text(encoding='utf-8'), re.M):
        first, last, groups = chapters[ident[:2]]
        screens[ident] = dict(title=title.strip(), pages=list(range(first, last + 1)),
                             differences=[d['id'] for d in differences if d['id'][0] in groups])
    return dict(source='decode/docs/StarCommand_Manual_SSI1988.txt', pages=pages,
                screens=screens, differences=differences)

if __name__ == '__main__':
    target = ROOT / 'game/assets/data/manual.json'
    target.write_text(json.dumps(build(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')




