import os, re
from collections import Counter

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(REPO, 'ACCEPTANCE.md')


def main():
    s = open(P, encoding='utf-8', newline='').read()
    out, rows = [], []
    for l in s.split('\n'):
        if re.match(r'^\| [A-Z]{2}-[0-9A-Za-z/-]+ \|', l):
            c = l.split('|')[1:-1]
            if len(c) > 6:
                c = c[:5] + [' ' + ' / '.join(x.strip() for x in c[5:] if x.strip()) + ' ']
                l = '|' + '|'.join(c) + '|'
            rows.append(l)
        out.append(l)
    s = '\n'.join(out)
    per = {}
    for l in rows:
        c = [x.strip() for x in l.split('|')]
        sid, selfc, rev = c[1], c[5], c[6]
        mod = sid[:2]
        m = re.search(r'\b(PASS|FAIL|OPEN|N/A)', rev)
        verdict = m.group(1) if m else None
        for k in (mod, 'all'):
            d = per.setdefault(k, Counter())
            d['rows'] += 1
            d['self'] += 'OK' in selfc
            d['reviewed'] += bool(rev)
            d['pass'] += verdict == 'PASS'
            d['fail'] += verdict == 'FAIL'
            d['open'] += verdict != 'PASS' and verdict != 'FAIL'
    order = ['CM', 'SU', 'PT', 'SP', 'IN', 'SB', 'PB']
    lines = ['<!-- summary (python -I acceptance/acceptance_summary.py) -->',
             '| module | rows | self-checked | reviewed | PASS | FAIL | open (unreviewed / OPEN / N/A) |', '|---|---|---|---|---|---|---|']
    for k in [x for x in order if x in per] + ['all']:
        d = per[k]
        lines.append(f"| {k} | {d['rows']} | {d['self']} | {d['reviewed']} | {d['pass']} | {d['fail']} | {d['open']} |")
    lines.append('<!-- /summary -->')
    block = '\n'.join(lines)
    if '<!-- summary' in s:
        s = re.sub(r'<!-- summary.*?<!-- /summary -->', block, s, flags=re.S)
    else:
        i = s.index('\n\n', s.index('\n') + 1) + 2
        s = s[:i] + block + '\n\n' + s[i:]
    open(P, 'w', encoding='utf-8', newline='').write(s)
    print(block)


if __name__ == '__main__':
    main()
