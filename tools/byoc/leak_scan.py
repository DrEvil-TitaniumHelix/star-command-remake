"""leak_scan.py: find original Star Command material in a tree or in a git history (lane byoc-b6, docs/BYOC.md B6).

Usage: python -I tools/byoc/leak_scan.py TREE [--originals DIR] [--history] [--json OUT] [--quiet]
  TREE         a folder (every file under it, .git skipped), or with --history a git repo: every blob of
               `git rev-list --all --objects` (each blob once, reported under its first path)
  --originals  the original release, read only (default ../re-targets/starcommand/starcoma)

Checks, per file / blob:
  (a) HASH    its SHA-256 is one of the manifest's (docs/byoc/manifest.json) = a byte copy of an original file
  (b) BYTES   it contains a run of >= 32 bytes identical to a run in an original file, and the run is binary
              (not only printable text); low-entropy runs (< 6 distinct byte values, e.g. zero padding) are ignored
  (b') TEXT   the same for a run that is printable text only (game text quoted in a document) - report, like (c)
  (c) STRING  a game string of >= 12 characters from the EXEs' / .STR files' string-literal INIT tables and DATA
              statements (decode/data/tools/modconst.py) appears verbatim in a text file - report for B4
Exit 1 when any (a) or (b) is found; (b') and (c) only report (SC-3: pseudocode may quote game text).
Only paths, offsets, lengths and counts are printed, never the matched content.
"""
import argparse, hashlib, json, os, re, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(REPO, 'decode', 'data', 'tools'))

RUN = 32          # (b) minimum run
W = 16            # index window; target probed every W bytes, so any run >= 2W-1 = 31 bytes contains a probed window
MIN_DISTINCT = 6  # (b) low-entropy filter
MIN_STR = 12      # (c) minimum string length
TEXT_BYTES = set(range(0x20, 0x7f)) | {9, 10, 13}


def load_originals(d):
    files = {}
    for n in sorted(os.listdir(d)):
        p = os.path.join(d, n)
        if os.path.isfile(p):
            with open(p, 'rb') as f:
                files[n.upper()] = f.read()
    return files


def build_index(orig):
    """hash(16-byte window) -> (file, offset) of its first occurrence, low-entropy windows skipped"""
    idx = {}
    for name, b in orig.items():
        for i in range(len(b) - W + 1):
            w = b[i:i + W]
            if len(set(w)) < MIN_DISTINCT:
                continue
            idx.setdefault(hash(w), (name, i))
    return idx


def game_strings(orig):
    import modconst  # noqa: E402  (decode/data/tools; reads the EXE through decode/tools/mz.py)
    out = set()
    tmp = None
    for name, b in orig.items():
        if not name.endswith(('.EXE', '.STR')) or name in ('BRUN30.EXE', 'COLOR.EXE', 'DEMO.EXE', 'FIXIT.EXE'):
            continue
        try:
            o = modconst.parse(os.path.join(ORIG_DIR, name))
        except Exception:  # not a QuickBASIC module
            continue
        for r in o.get('init', []):
            if r.get('kind') == 'str' and len(r.get('text', '')) >= MIN_STR:
                out.add(r['text'])
        for r in o.get('data', []):
            for part in [r.get('text', '')] + r.get('text', '').split(','):
                part = part.strip()
                if len(part) >= MIN_STR:
                    out.add(part)
    # file names the program opens (CHARINFO.BAS, C:STARPORT.STR ...) are names, not game text
    return {x for x in out if not re.fullmatch(r'(?:[A-Za-z]:)?[\\A-Za-z0-9_-]{1,8}\.[A-Za-z]{3}', x)}


def scan_bytes(data, orig, idx, strings, prefixes):
    hits = {}
    sha = hashlib.sha256(data).hexdigest()
    if sha in MANIFEST_SHA:
        hits['hash'] = MANIFEST_SHA[sha]
    runs_bin, runs_txt = [], []
    pos = 0
    covered = -1
    while pos + W <= len(data):
        if pos <= covered:
            pos += W
            continue
        w = data[pos:pos + W]
        ref = idx.get(hash(w)) if len(set(w)) >= MIN_DISTINCT else None
        if ref:
            name, o = ref
            src = orig[name]
            if src[o:o + W] == w:
                a, b = pos, o
                while a > 0 and b > 0 and data[a - 1] == src[b - 1]:
                    a -= 1; b -= 1
                e, f = pos + W, o + W
                while e < len(data) and f < len(src) and data[e] == src[f]:
                    e += 1; f += 1
                if e - a >= RUN:
                    run = data[a:e]
                    (runs_txt if set(run) <= TEXT_BYTES else runs_bin).append((a, e - a, name, b))
                    covered = e
        pos += W
    if runs_bin:
        hits['bytes'] = runs_bin
    if runs_txt:
        hits['text'] = runs_txt
    if strings and data and sum(1 for c in data[:4096] if c in TEXT_BYTES or c >= 0x80) > 0.95 * min(len(data), 4096):
        t = data.decode('latin1')
        found = set()
        for i in range(len(t) - MIN_STR + 1):
            cand = prefixes.get(t[i:i + MIN_STR])
            if cand:
                for s in cand:
                    if t.startswith(s, i):
                        found.add(s)
        if found:
            hits['strings'] = len(found)
    return hits


def tree_items(root):
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x != '.git']
        for n in sorted(files):
            p = os.path.join(d, n)
            with open(p, 'rb') as f:
                yield os.path.relpath(p, root).replace('\\', '/'), f.read()


def history_items(repo):
    objs = subprocess.run(['git', '-C', repo, 'rev-list', '--all', '--objects'], capture_output=True, check=True).stdout.decode('utf-8', 'replace').splitlines()
    paths = {}
    for line in objs:
        sha, _, path = line.partition(' ')
        if path and sha not in paths:
            paths[sha] = path
    p = subprocess.Popen(['git', '-C', repo, 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    for sha, path in paths.items():
        p.stdin.write(sha.encode() + b'\n'); p.stdin.flush()
        head = p.stdout.readline().split()
        size = int(head[2])
        body = p.stdout.read(size); p.stdout.read(1)
        if head[1] == b'blob':
            yield f'{path} @{sha[:10]}', body
    p.stdin.close(); p.wait()


def main():
    global ORIG_DIR, MANIFEST_SHA
    ap = argparse.ArgumentParser()
    ap.add_argument('tree')
    ap.add_argument('--originals', default='../re-targets/starcommand/starcoma')
    ap.add_argument('--history', action='store_true')
    ap.add_argument('--json')
    ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args()
    ORIG_DIR = a.originals
    with open(os.path.join(REPO, 'docs', 'byoc', 'manifest.json'), encoding='utf-8') as f:
        MANIFEST_SHA = {r['sha256']: r['name'] for r in json.load(f)['list']}
    orig = load_originals(a.originals)
    idx = build_index(orig)
    strings = game_strings(orig)
    prefixes = {}
    for s in strings:
        prefixes.setdefault(s[:MIN_STR], []).append(s)
    report, counts, n = {}, dict(files=0, hash=0, bytes=0, text=0, strings=0), 0
    for path, data in (history_items(a.tree) if a.history else tree_items(a.tree)):
        counts['files'] += 1
        h = scan_bytes(data, orig, idx, strings, prefixes)
        if not h:
            continue
        report[path] = h
        for k in ('hash', 'bytes', 'text', 'strings'):
            if k in h:
                counts[k] += 1
        if not a.quiet:
            parts = []
            if 'hash' in h: parts.append(f"HASH = {h['hash']}")
            if 'bytes' in h: parts.append(f"BYTES {len(h['bytes'])} run(s), longest {max(r[1] for r in h['bytes'])} (from {', '.join(sorted({r[2] for r in h['bytes']}))[:80]})")
            if 'text' in h: parts.append(f"TEXT {len(h['text'])} run(s), longest {max(r[1] for r in h['text'])}")
            if 'strings' in h: parts.append(f"STRING {h['strings']} game string(s)")
            print(f'{path}: {"; ".join(parts)}')
    print(f"leak_scan {'history' if a.history else 'tree'} {a.tree}: {counts['files']} files; "
          f"(a) hash {counts['hash']}, (b) binary runs {counts['bytes']}, (b') text runs {counts['text']}, (c) game strings {counts['strings']}; "
          f"{len(strings)} game strings >= {MIN_STR} chars indexed")
    if a.json:
        with open(a.json, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(dict(counts=counts, files=report), f, indent=1)
    sys.exit(1 if counts['hash'] or counts['bytes'] else 0)


if __name__ == '__main__':
    main()
