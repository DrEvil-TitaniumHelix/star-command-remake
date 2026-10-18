#!/usr/bin/env python3
"""patchsave.py IN OUT IDX=VALUE... : copy a CHARINFO.BAS (BSAVE header 7 bytes + G!(0..2600) as
4-byte Microsoft Binary Format singles) and set elements, e.g. 2235=100 (BaseEnc!, test intervention
T1 as in RUN-1/RUN-2). Only ever applied to the scratch copy under ~/scref, never to the originals."""
import struct
import sys


def to_mbf(v):
    if v == 0:
        return b'\0\0\0\0'
    ieee = struct.unpack('<I', struct.pack('<f', v))[0]
    sign = ieee >> 31
    exp = ((ieee >> 23) & 0xFF) + 2
    man = ieee & 0x7FFFFF
    return struct.pack('<I', (exp << 24) | (sign << 23) | man)


def from_mbf(b):
    x = struct.unpack('<I', b)[0]
    exp = x >> 24
    if exp == 0:
        return 0.0
    sign = (x >> 23) & 1
    ieee = (sign << 31) | ((exp - 2) << 23) | (x & 0x7FFFFF)
    return struct.unpack('<f', struct.pack('<I', ieee))[0]


data = bytearray(open(sys.argv[1], 'rb').read())
for kv in sys.argv[3:]:
    i, v = kv.split('=')
    off = 7 + 4 * int(i)
    old = from_mbf(bytes(data[off:off + 4]))
    data[off:off + 4] = to_mbf(float(v))
    print(f'G!({i}) {old} -> {from_mbf(bytes(data[off:off+4]))}')
open(sys.argv[2], 'wb').write(data)
