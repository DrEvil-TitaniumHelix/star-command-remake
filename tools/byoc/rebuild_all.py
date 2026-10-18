"""rebuild_all.py — BYOC reproducibility baseline (docs/BYOC.md 3.4, work item B3 step 0, lane byoc-b3).

Runs today's Python pipeline for all 7 modules from the ORIGINAL game files (read-only) into a scratch directory and
diffs the result against the committed files:

  EXE --qbdis.py--> listing          vs decode/listings/<MOD>.lst            (all 7 modules)
  EXE --modconst.py--> _<MOD>.json   vs decode/data/tools/_<MOD>.json        (all 7)
  listing + _<MOD>.json + <MOD>_names.json + <MOD>_header.md --qb2bas.py x2--> <MOD>.bas.md
                                     vs decode/pseudo/<MOD>.bas.md           (SPACE STARPORT INSIDE PLBATTLE SPBATTLE)
  <MOD>.bas.md + names + _<MOD>.json + sprites_index --tools/byoc/bas2js.py--> module JS
                                     vs game/modules/{space,plbattle,spbattle,inside}.js, starport/flow.js, */banks.js

STARCOMM and STARTUP have no qb2bas pass: decode/pseudo/STARCOMM.bas.md, STARTUP.bas.md and game/modules/startup.js
are hand-written (lane mod-startup / build-startup), so only their listings and constant tables are checked.

Usage (repo root):  python -I tools/byoc/rebuild_all.py [--originals DIR] [--out DIR] [--keep]
  --originals  folder with the 7 .EXE files and the BSAVE banks (default: the re-targets starcoma folder)
  --out        scratch output dir (default: <TEMP>/sc-byoc-rebuild); wiped first unless --keep
Exit status 0 when every file is byte-identical, 1 otherwise (a unified diff head is printed per differing file).
"""
import argparse, difflib, json, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODS = ['STARCOMM', 'STARTUP', 'SPACE', 'STARPORT', 'INSIDE', 'PLBATTLE', 'SPBATTLE']
CFG = json.load(open(os.path.join(ROOT, 'game', 'byoc', 'modules.json'), encoding='utf-8'))


def run(cmd, cwd):
    r = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd)
    if r.returncode:
        print('FAILED:', ' '.join(cmd)); print(r.stdout[-2000:]); print(r.stderr[-2000:]); sys.exit(2)
    return r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--originals', default=CFG['originals_default'])
    ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'sc-byoc-rebuild'))
    ap.add_argument('--keep', action='store_true')
    a = ap.parse_args()
    orig = a.originals.rstrip('/\\')
    if not os.path.exists(os.path.join(orig, 'SPACE.EXE')):
        print('originals not found at', orig, '- nothing to do'); sys.exit(1)
    out = a.out
    if os.path.exists(out) and not a.keep:
        shutil.rmtree(out)   # the scratch dir only; the originals are never written
    for d in ('listings', 'const', 'pseudo'):
        os.makedirs(os.path.join(out, d), exist_ok=True)
    py = sys.executable
    results = []   # (relative repo path, scratch path)
    # 1. listings + constant tables (all 7)
    for m in MODS:
        exe = os.path.join(orig, m + '.EXE')
        run([py, os.path.join(ROOT, 'decode/tools/qbdis.py'), exe, '--out', os.path.join(out, 'listings', m + '.lst')], ROOT)
        run([py, os.path.join(ROOT, 'decode/data/tools/modconst.py'), exe, '--json', os.path.join(out, 'const', '_%s.json' % m)], ROOT)
        results.append(('decode/listings/%s.lst' % m, os.path.join(out, 'listings', m + '.lst')))
        results.append(('decode/data/tools/_%s.json' % m, os.path.join(out, 'const', '_%s.json' % m)))
    # 2. pseudocode, two passes from a clean state (pass 1 writes the .vars.json pass 2 reads)
    for m, c in CFG['modules'].items():
        if 'qb2bas' not in c: continue
        o = os.path.join(out, 'pseudo', m + '.bas.md')
        cmd = [py, os.path.join(ROOT, 'decode/pseudo/tools/qb2bas.py'), os.path.join(out, 'listings', m + '.lst'),
               os.path.join(out, 'const', '_%s.json' % m), o, '--title', m,
               '--names', os.path.join(ROOT, 'decode/pseudo/%s_names.json' % m),
               '--header', os.path.join(ROOT, 'decode/pseudo/%s_header.md' % m)] + c['qb2bas']
        if os.path.exists(o + '.vars.json'): os.remove(o + '.vars.json')
        run(cmd, ROOT); run(cmd, ROOT)
        results.append(('decode/pseudo/%s.bas.md' % m, o))
    # 3. module JS from the scratch pseudocode + scratch constant tables, through the one translator tools/byoc/bas2js.py
    os.makedirs(os.path.join(out, 'js'), exist_ok=True)
    for m, c in CFG['modules'].items():
        if 'bas2js' not in c: continue
        o = os.path.join(out, 'js', m.lower() + '.js'); bo = os.path.join(out, 'js', m.lower() + '.banks.js')
        run([py, os.path.join(ROOT, 'tools/byoc/bas2js.py'), m, '--src', os.path.join(out, 'pseudo', m + '.bas.md'),
             '--const', os.path.join(out, 'const', '_%s.json' % m), '--originals', orig, '--out', o, '--banks-out', bo], ROOT)
        results.append((c['bas2js']['out'], o))
        if 'banks_out' in c['bas2js']: results.append((c['bas2js']['banks_out'], bo))
    # 4. compare
    bad = 0
    seen = set()
    for rel, sp in results:
        if rel in seen: continue
        seen.add(rel)
        if not os.path.exists(os.path.join(ROOT, rel)):
            # public tree: listings and generated modules are not committed (BYOC); the scratch file is the result
            print('BUILT ', rel, '->', sp); continue
        a_ = open(os.path.join(ROOT, rel), 'rb').read(); b_ = open(sp, 'rb').read()
        if a_ == b_: print('SAME  ', rel); continue
        bad += 1; print('DIFFER', rel, '(%d vs %d bytes)' % (len(a_), len(b_)))
        d = list(difflib.unified_diff(a_.decode('utf-8', 'replace').split('\n'), b_.decode('utf-8', 'replace').split('\n'), 'repo', 'scratch', n=0, lineterm=''))
        for l in d[:20]: print('    ' + l[:200])
    print('rebuild_all: %d files compared, %d differ' % (len(seen), bad))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
