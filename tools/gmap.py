import json, os, re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def table_rows(lines, start_heading):
    i = next(k for k, l in enumerate(lines) if l.startswith(start_heading))
    rows = []
    for l in lines[i + 1:]:
        if l.startswith('#'):
            break
        if l.startswith('|') and not re.match(r'^\|[\s|:-]+\|$', l):
            rows.append([c.strip() for c in l.strip().strip('|').split('|')])
    return rows[1:]


def expand_names(tok):
    parts = [p.strip().rstrip('!') for p in tok.split('/')]
    out = [parts[0]]
    for p in parts[1:]:
        out.append(re.sub(r'[A-Z][a-z0-9]*$', p, parts[0]) if re.match(r'^[A-Z][A-Za-z0-9]*$', p) else p)
    return out


def indices(text):
    text = text.strip()
    if re.fullmatch(r'\d+', text):
        return [int(text)]
    if re.fullmatch(r'\d+(\s*,\s*\d+)+', text):
        return [int(x) for x in text.split(',')]
    m = re.fullmatch(r'(\d+)\.\.(\d+)', text)
    if m:
        return list(range(int(m.group(1)), int(m.group(2)) + 1))
    return None


NAME = re.compile(r'`([A-Z][A-Za-z0-9]*!(?:/[A-Z][A-Za-z0-9]*!)*)`')
PAIR = re.compile(r'(\d+)(?:/(\d+))?\s+`([A-Z][A-Za-z0-9]*!(?:/[A-Z][A-Za-z0-9]*!)*)`')


def main():
    lines = open(os.path.join(REPO, 'decode', 'pseudo', 'CROSSREF.md'), encoding='utf-8').read().splitlines()
    scalars, rows = {}, []

    def put(name, idx):
        if name in scalars and scalars[name] != idx:
            raise SystemExit(f'{name}: {scalars[name]} vs {idx}')
        scalars[name] = idx

    for c in table_rows(lines, '### 2.2'):
        idx_t, ds, name_t, meaning, evidence = (c + [''] * 5)[:5]
        rows.append(dict(index=idx_t, ds=ds, name=name_t, meaning=meaning, evidence=evidence))
        pairs = PAIR.findall(name_t + ' ' + meaning)
        if pairs:
            for a, b, tok in pairs:
                nums = [int(a)] + ([int(b)] if b else [])
                names = expand_names(tok)
                if len(nums) == len(names):
                    for n, i in zip(names, nums):
                        put(n, i)
            continue
        names = [n for tok in NAME.findall(name_t) for n in expand_names(tok)]
        idx = indices(idx_t)
        if names and idx and len(names) == len(idx):
            for n, i in zip(names, idx):
                put(n, i)

    crew = [dict(field=c[0], meaning=c[1]) for c in table_rows(lines, '### 2.3')]
    strings = []
    for c in table_rows(lines, '### 2.4'):
        ds, count, name, sname, fields, used = (c + [''] * 6)[:6]
        strings.append(dict(ds=ds, count=int(count), name=name.strip('`'), startupName=sname, nameFields=fields, usedBy=used))

    out = dict(source='decode/pseudo/CROSSREF.md section 2 via tools/gmap.py', size=2601,
               scalars=dict(sorted(scalars.items(), key=lambda kv: kv[1])), rows=rows, crew=crew, strings=strings)
    path = os.path.join(REPO, 'game', 'assets', 'gmap.json')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, indent=1, ensure_ascii=False)
    print(f'{len(scalars)} named scalars, {len(rows)} rows, {len(crew)} crew fields, {len(strings)} string arrays -> {path}')


if __name__ == '__main__':
    main()
