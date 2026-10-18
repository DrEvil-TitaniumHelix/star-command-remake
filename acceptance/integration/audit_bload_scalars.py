"""audit_bload_scalars.py (lane build-qa): find variables a generated module renders as module-locals (V["x"])
although their DS address lies inside a BLOADed region, i.e. the original reads them from the loaded file.
Example found in the integration run: PLBATTLE FrameDX1% (DS 0x89F6) inside BIGSH-n.EGA BLOADed at &H8052.

Usage: python -I acceptance/integration/audit_bload_scalars.py
Regions: every `BLOAD <name>, &Hxxxx` in decode/pseudo/<MOD>.bas.md, length = the largest BSAVE length of the
files that name can denote (game/assets/files, header bytes 5..6).
"""
import glob, json, os, re, struct

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FILES = os.path.join(REPO, 'game', 'assets', 'files')
COMMON_LO, COMMON_HI = 0x1850, 0x40F4


def regions(mod):
    out = {}
    for l in open(os.path.join(REPO, 'decode', 'pseudo', f'{mod}.bas.md'), encoding='utf-8'):
        m = re.search(r'BLOAD (.*), &H([0-9A-F]+)\s*$', l.split("'")[0].rstrip())
        if not m:
            continue
        base = int(m.group(2), 16)
        lits = [x for x in re.findall(r'"([^"]*)"', m.group(1)) if x not in ('A:', 'B:')]
        stem = lits[0].upper() if lits else ''
        ext = lits[-1].upper() if len(lits) > 1 and lits[-1].startswith('.') else ('' if '.' in stem else '.BAS')
        pat = os.path.join(FILES, (stem + '*' + ext) if ('STR$' in m.group(1) or '+' in m.group(1)) else stem + ext)
        ln = 0
        for f in glob.glob(pat):
            b = open(f, 'rb').read(7)
            if b[:1] == b'\xfd':
                ln = max(ln, struct.unpack_from('<H', b, 5)[0])
        if base >= COMMON_HI and ln:
            out[base] = max(out.get(base, 0), ln)
    return out


def main():
    total = 0
    for mod in ('SPACE', 'STARPORT', 'INSIDE', 'SPBATTLE', 'PLBATTLE'):
        js = os.path.join(REPO, 'game', 'modules', f'{mod.lower()}.js')
        if not os.path.exists(js):
            continue
        src = open(js, encoding='utf-8').read()
        if mod == 'STARPORT' and os.path.exists(os.path.join(REPO, 'game', 'modules', 'starport', 'flow.js')):
            src += open(os.path.join(REPO, 'game', 'modules', 'starport', 'flow.js'), encoding='utf-8').read()
        names = json.load(open(os.path.join(REPO, 'decode', 'pseudo', f'{mod}_names.json'), encoding='utf-8'))
        regs = regions(mod)
        hits = []
        for k, v in names.items():
            if not re.fullmatch(r'[0-9A-F]{4}', k) or not isinstance(v, str):
                continue
            a = int(k, 16)
            for base, ln in regs.items():
                if base <= a < base + ln and f'V[{json.dumps(v)}]' in src:
                    hits.append((v, a, base, ln))
        print(f'{mod}: regions {", ".join(f"{b:04X}+{l}" for b, l in sorted(regs.items()))}')
        for v, a, base, ln in sorted(hits, key=lambda h: h[1]):
            print(f'   {v:20s} DS {a:04X} inside BLOAD &H{base:04X} (+{a - base}) -> rendered as V["{v}"] (module-local)')
        total += len(hits)
        # second class (RUN-2): scalars inside the module's COMMON block beyond the string arrays (header
        # hw[20]/hw[21]) survive CHAIN in the original but are module-locals unless the runtime shares them
        hdr = json.load(open(os.path.join(REPO, 'decode', 'data', 'tools', f'_{mod}.json')))
        cend = hdr['common_start'] + hdr['common_len']
        shared = 'COMMON_VARS' in src
        com = sorted((int(k, 16), v) for k, v in names.items() if re.fullmatch(r'[0-9A-F]{4}', k) and isinstance(v, str)
                     and 0x4890 <= int(k, 16) < cend and f'V[{json.dumps(v)}]' in src)
        if com:
            print(f'   COMMON ends 0x{cend:04X}; {len(com)} scalar(s) in 0x4890..0x{cend:04X} rendered as V[...]'
                  + (' (runtime shares them via COMMON_VARS: OK)' if shared else ' -> lost across CHAIN') + ': '
                  + ', '.join(f'{v} {a:04X}' for a, v in com))
            if not shared:
                total += len(com)
    print(f'{total} variable(s) read from BLOADed memory but rendered as module-locals')


if __name__ == '__main__':
    main()
