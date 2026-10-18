"""mapinfo.py: dev helper for the INSIDE port — plan arrow-key paths through an IN-n.BAS map for the
?screen=<IN-id> fixtures (game/modules/inside/dev.js). Formats: INSIDE.bas.md header "Data formats found here".

Usage: python -I game/modules/inside/mapinfo.py <location 1..7> [--json]
  cells: InMap%(y*37 + x) = room*64 + tile; room record r at 1369 + r*11: 0 trap level, 1 enemy group (-1 none),
  2 script, 3 MES line, 4 enclosure, 5 mapped, 6 door strength, 7..10 rectangle.
  moving: the CURRENT tile's passability (INSH.BAS word tile, 4 decimal digits: thousands down, hundreds up,
  tens right, units left; a SET digit BLOCKS that direction: 2838 `IF (CanUp! = 0) THEN GOTO L_285A` moves) decides
  whether the arrow moves.
  events on arrival (L_2408 ff.): tile 36..40 with trap level >= 1 -> trap; tile 34/35 with door >= 1 -> door;
  tile 41 -> exit; new room with enemy group >= 0 -> encounter; new room with script != 0 -> script.
Start cells per location from INSIDE.bas.md 06A3-07CD.
"""
import json, os, struct, sys
from collections import deque

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
FILES = os.path.join(REPO, 'game', 'assets', 'files')
START = {4: (17, 0), 7: (18, 0), 5: (25, 0), 3: (4, 3), 6: (3, 8), 1: (18, 8), 2: (9, 28)}
MOVES = {'DOWN': (0, 1, 1000), 'UP': (0, -1, 100), 'RIGHT': (1, 0, 10), 'LEFT': (-1, 0, 1)}


def words(name):
    b = open(os.path.join(FILES, name), 'rb').read()
    ln = struct.unpack_from('<H', b, 5)[0]
    return list(struct.unpack_from('<%dh' % (ln // 2), b, 7))


def main():
    loc = int(sys.argv[1])
    m = words('IN-%d.BAS' % loc)
    tp = words('INSH.BAS')[:64]
    room = lambda r, f: m[1369 + r * 11 + f]
    cell = lambda x, y: m[y * 37 + x]

    def event(x, y, prev_room):
        v = cell(x, y); r, t = v // 64, v % 64
        if 36 <= t <= 40 and room(r, 0) >= 1: return 'trap'
        if t in (34, 35) and room(r, 6) >= 1: return 'door'
        if t == 41: return 'exit'
        if r != prev_room and room(r, 1) >= 0: return 'enemy'
        if r != prev_room and room(r, 2) != 0: return 'script'
        return None

    sx, sy = START[loc]
    start_room = cell(sx, sy) // 64
    seen = {(sx, sy): []}
    q = deque([(sx, sy)])
    found = {}
    while q:
        x, y = q.popleft()
        path = seen[(x, y)]
        t = cell(x, y) % 64
        for k, (dx, dy, digit) in MOVES.items():
            if (tp[t] // digit) % 10 != 0: continue      # digit set = wall (025F6..28FC: IF CanUp! = 0 THEN move)
            nx, ny = x + dx, y + dy
            if not (0 <= nx < 37 and 0 <= ny < 37) or (nx, ny) in seen: continue
            ev = event(nx, ny, cell(x, y) // 64)
            np = path + [k]
            if ev:
                found.setdefault(ev, (nx, ny, np, cell(nx, ny) // 64))
                continue                     # never walk through an event cell
            seen[(nx, ny)] = np
            q.append((nx, ny))
    out = dict(location=loc, start=[sx, sy], startRoom=start_room, startCell=cell(sx, sy),
               events={k: dict(cell=[v[0], v[1]], room=v[3], keys=v[2]) for k, v in found.items()})
    if '--json' in sys.argv: print(json.dumps(out))
    else:
        print('location', loc, 'start', (sx, sy), 'room', start_room, 'tile', cell(sx, sy) % 64, 'reachable cells', len(seen))
        for k, v in out['events'].items(): print(' ', k, v['cell'], 'room', v['room'], len(v['keys']), 'keys:', ' '.join(v['keys']))


if __name__ == '__main__':
    main()
