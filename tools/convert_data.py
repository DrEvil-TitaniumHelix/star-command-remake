import argparse, json, os, shutil, struct, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(REPO, 'decode', 'data', 'tools'))

TEXT = ['NAME', 'CHARNAME', 'ENCINFO', 'ENCLIST', 'ENCTABLE', 'MISSION'] + [f'MES-{n}' for n in range(1, 8)]
BIN_MBF = ['CHARINFO.BAS', 'INFO.BAS']
BIN_INT = ['GALAXY.BAS', 'INSH.BAS'] + [f'IN-{n}.BAS' for n in range(1, 8)]
RAW_ONLY = [f'INMAP-{n}.BAS' for n in range(1, 8)] + ['INMAP.BAS']
with open(os.path.join(REPO, 'decode', 'data', 'sprites_index.tsv'), encoding='utf-8') as _f:
    BANKS = sorted({c[0] for c in (l.split('\t') for l in _f) if len(c) > 5 and c[5] in ('cga', 'ega')})


class InputReader:
    def __init__(self, data):
        end = data.find(b'\x1a')
        self.b = data if end < 0 else data[:end]
        self.p = 0

    def eof(self):
        return self.p >= len(self.b)

    def _delim(self):
        if self.p < len(self.b) and self.b[self.p:self.p + 1] == b',':
            self.p += 1
        elif self.b[self.p:self.p + 2] == b'\r\n':
            self.p += 2
        elif self.p < len(self.b) and self.b[self.p] in (13, 10):
            self.p += 1

    def str(self):
        b = self.b
        while self.p < len(b) and b[self.p] in (32, 9):
            self.p += 1
        if self.p < len(b) and b[self.p] == 34:
            q = b.find(b'"', self.p + 1)
            q = len(b) if q < 0 else q
            s = b[self.p + 1:q]
            self.p = q + 1
            while self.p < len(b) and b[self.p] not in (44, 13, 10):
                self.p += 1
        else:
            q = self.p
            while q < len(b) and b[q] not in (44, 13, 10):
                q += 1
            s = b[self.p:q]
            self.p = q
        self._delim()
        return s.decode('latin1')

    def num(self):
        b = self.b
        while self.p < len(b) and b[self.p] in (32, 9, 13, 10):
            self.p += 1
        q = self.p
        while q < len(b) and b[q] not in (32, 44, 13, 10):
            q += 1
        tok = b[self.p:q].decode('latin1')
        self.p = q
        while self.p < len(b) and b[self.p] in (32, 9):
            self.p += 1
        self._delim()
        try:
            v = float(tok.replace('D', 'E').replace('d', 'e')) if tok else 0.0
        except ValueError:
            v = 0.0
        return int(v) if v == int(v) else v


def mbf(b, o):
    e = b[o + 3]
    if e == 0:
        return 0.0
    s = -1.0 if b[o + 2] & 0x80 else 1.0
    m = ((b[o + 2] & 0x7f) << 16) | (b[o + 1] << 8) | b[o]
    v = s * (1 + m / 0x800000) * 2.0 ** (e - 129)
    return int(v) if v == int(v) else v


def bsave_body(data):
    assert data[0] == 0xfd, 'not a BSAVE image'
    seg, off, ln = struct.unpack_from('<HHH', data, 1)
    return dict(seg=seg, off=off, len=ln), data[7:7 + ln]


def convert_text(name, data):
    r = InputReader(data)
    if name in ('NAME', 'CHARNAME'):
        out = []
        while not r.eof():
            out.append(r.str())
        return dict(fields=out)
    if name == 'ENCINFO':
        recs = []
        while not r.eof():
            recs.append(dict(name=r.str(), c=[r.num() for _ in range(27)]))
        return dict(records=recs)
    if name == 'ENCLIST':
        recs = []
        while not r.eof():
            recs.append(dict(name=r.str(), n=[r.num() for _ in range(3)]))
        return dict(records=recs)
    if name == 'ENCTABLE':
        rows = []
        while not r.eof():
            rows.append([r.num() for _ in range(25)])
            while not r.eof() and r.b[r.p] in (32, 13, 10):
                r.p += 1
        return dict(rows=rows)
    if name == 'MISSION':
        recs = []
        while not r.eof():
            recs.append(dict(text=[r.str(), r.str()], n=[r.num() for _ in range(15)]))
            while not r.eof() and r.b[r.p] in (32, 13, 10):
                r.p += 1
        return dict(records=recs)
    if name.startswith('MES-'):
        txt = r.b.decode('latin1')
        lines = txt.split('\r\n')
        if lines and lines[-1] == '':
            lines.pop()
        return dict(lines=lines)
    raise ValueError(name)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--targets', default='../re-targets/starcommand/starcoma')
    a = ap.parse_args()
    files_dir = os.path.join(REPO, 'game', 'assets', 'files')
    data_dir = os.path.join(REPO, 'game', 'assets', 'data')
    os.makedirs(files_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    def dump(stem, obj):
        with open(os.path.join(data_dir, stem + '.json'), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(obj, f, separators=(',', ':'), ensure_ascii=False)

    for name in TEXT + BIN_MBF + BIN_INT + RAW_ONLY + [n for n in BANKS if n not in RAW_ONLY]:
        src = os.path.join(a.targets, name)
        shutil.copyfile(src, os.path.join(files_dir, name))
        data = open(src, 'rb').read()
        stem = name.rsplit('.', 1)[0] if name.endswith('.BAS') else name
        if name in TEXT:
            obj = convert_text(name, data)
        elif name in BIN_MBF:
            hdr, body = bsave_body(data)
            obj = dict(bsave=hdr, values=[mbf(body, 4 * i) for i in range(len(body) // 4)])
        elif name in BIN_INT:
            hdr, body = bsave_body(data)
            obj = dict(bsave=hdr, values=list(struct.unpack_from(f'<{len(body) // 2}h', body)))
        else:
            continue
        obj['source'] = name
        dump(stem, obj)
        summary = {k: len(v) for k, v in obj.items() if isinstance(v, list)}
        print(f'{name:14s} -> data/{stem}.json {summary}')


if __name__ == '__main__':
    main()
