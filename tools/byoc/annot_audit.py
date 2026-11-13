import argparse, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'decode', 'data', 'tools'))
from modconst import parse

MODS = ['STARCOMM', 'STARTUP', 'SPACE', 'STARPORT', 'INSIDE', 'PLBATTLE', 'SPBATTLE']
PSEUDO = ['SPACE', 'STARPORT', 'INSIDE', 'PLBATTLE', 'SPBATTLE']
QUOTE = re.compile(r'"([^"\r\n]{2,})"')


def game_strings(orig):
    out = []
    srcs = [(m, os.path.join(orig, m + '.EXE')) for m in MODS]
    srcs += [(os.path.splitext(n)[0].upper() + '.STR', os.path.join(orig, n)) for n in sorted(os.listdir(orig)) if n.upper().endswith('.STR')]
    for m, p in srcs:
        try: c = parse(p)
        except Exception: continue
        for it in c.get('init', []):
            if it['kind'] == 'str' and it['text']: out.append((m, 'str', it['addr'], it['text']))
        for r in c.get('data', []):
            if r.get('line') is not None: out.append((m, 'data', r['line'], r['text']))
    return out


def locate(frag, mod, gs):
    best = None
    for m, k, w, t in gs:
        if frag not in t: continue
        exact = frag == t or (k == 'data' and frag in [x.strip().strip('"') for x in t.split(',')])
        rank = (0 if m == mod else 1, 0 if exact else 1, 0 if k == 'str' else 1, w)
        if best is None or rank < best[0]: best = (rank, m, k, w, exact)
    if best is None:
        for m, k, w, t in sorted(gs, key=lambda g: (-len(g[3].strip()), g[0] != mod, g[2])):
            if len(t.strip()) >= 6 and t.strip() in frag:
                where = ('string at DS 0x%04X' % w) if k == 'str' else ('DATA line %d' % w)
                return 'text with the ' + (where if m == mod else '%s %s' % (m.replace('.STR', ' .STR'), where))
        return None
    _, m, k, w, exact = best
    where = ('string at DS 0x%04X' % w) if k == 'str' else ('DATA line %d' % w)
    if k == 'data' and not exact: where = 'part of ' + where
    elif k == 'str' and not exact: where = 'part of the ' + where
    return where if m == mod else '%s %s' % (m.replace('.STR', ' .STR'), where)


def scan_text(s, mod, gs, min_text):
    q = [f.group(1) for f in QUOTE.finditer(s) if locate(f.group(1), mod, gs)]
    long_ = {t for _, _, _, t in gs if len(t.strip()) >= min_text}
    tx = sum(1 for t in long_ if t.strip() in s)
    return len(q), tx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--originals', default=json.load(open(os.path.join(ROOT, 'game/byoc/modules.json'), encoding='utf-8'))['originals_default'])
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--min-text', type=int, default=8)
    a = ap.parse_args()
    gs = game_strings(a.originals)
    print('game strings: %d (%d distinct texts)' % (len(gs), len({t for *_, t in gs})))
    rows = []
    for mod in PSEUDO:
        p = os.path.join(ROOT, 'decode/pseudo/%s_names.json' % mod)
        raw = open(p, 'rb').read().decode('utf-8'); names = json.loads(raw)
        assert (json.dumps(names, indent=1).replace('\n', '\r\n')) == raw, p + ': not in the committed json.dumps(indent=1)+CRLF form'
        per = {'_why': [0, 0, 0], 'name': [0, 0, 0], 'other': [0, 0, 0]}
        changed = 0
        for k, v in names.items():
            if not isinstance(v, str): continue
            f = '_why' if k.endswith('_why') else ('name' if re.fullmatch(r'A?[0-9A-F]{3,4}|SUB[0-9A-F]{4}|FN[0-9A-F]{4}', k) else 'other')
            qn, tn = scan_text(v, mod, gs, a.min_text)
            per[f][0] += 1 if (qn or tn) else 0; per[f][1] += qn; per[f][2] += tn
            if a.apply and (f == '_why' or k.startswith('SUB')) and qn:
                nv = QUOTE.sub(lambda mm: locate(mm.group(1), mod, gs) or mm.group(0), v)
                if nv != v: names[k] = nv; changed += 1
        for f, (nf, qn, tn) in per.items():
            rows.append(('decode/pseudo/%s_names.json' % mod, f, nf, qn, tn))
        if a.apply and changed:
            open(p, 'wb').write(json.dumps(names, indent=1).replace('\n', '\r\n').encode('utf-8'))
            print('applied: %s_names.json, %d _why fields rewritten' % (mod, changed))
        h = os.path.join(ROOT, 'decode/pseudo/%s_header.md' % mod)
        qn, tn = scan_text(open(h, encoding='utf-8').read(), mod, gs, a.min_text)
        rows.append(('decode/pseudo/%s_header.md' % mod, 'prose', '-', qn, tn))
    for rel in ('game/byoc/modules.json', 'decode/brun30/rt_names.json', 'decode/brun30/inline_args.json', 'decode/data/sprites_index.tsv'):
        qn, tn = scan_text(open(os.path.join(ROOT, rel), encoding='utf-8').read(), None, gs, a.min_text)
        rows.append((rel, 'all', '-', qn, tn))
    print('| file | field | fields with game text | QUOTE | TEXT (>= %d chars) |' % a.min_text)
    print('|---|---|---|---|---|')
    for r in rows: print('| %s | %s | %s | %d | %d |' % r)


if __name__ == '__main__':
    main()
