#!/usr/bin/env python3
"""raw2wav.py RAW WAV [START_S] [LEN_S] : SDL disk-audio dump (S16LE stereo 22050 Hz) -> mono WAV;
prints per-second RMS and the times of note onsets (frequency changes of the square wave)."""
import sys
import wave

import numpy as np

RATE = 22050
raw = np.fromfile(sys.argv[1], dtype='<i2').reshape(-1, 2)[:, 0]
start = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
length = float(sys.argv[4]) if len(sys.argv) > 4 else len(raw) / RATE
seg = raw[int(start * RATE):int((start + length) * RATE)]
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(RATE)
    w.writeframes(seg.astype('<i2').tobytes())
print(f'total {len(raw)/RATE:.1f} s, wrote {len(seg)/RATE:.1f} s from {start:.1f} s')
for s in range(int(len(raw) / RATE)):
    x = raw[s * RATE:(s + 1) * RATE].astype(float)
    print(f'{s:3d}s rms {np.sqrt((x*x).mean()):7.0f}', end='  ' if s % 4 != 3 else '\n')
print()
# note segmentation: zero-crossing period in 20 ms windows
win = RATE // 50
notes = []
prev = None
for i in range(0, len(seg) - win, win):
    x = seg[i:i + win].astype(float)
    if np.abs(x).max() < 500:
        f = 0
    else:
        zc = np.nonzero(np.diff(np.signbit(x - x.mean())))[0]
        f = int(round(len(zc) / 2 / (win / RATE), -1)) if len(zc) > 1 else 0
    if prev is None or abs(f - prev) > max(15, 0.04 * max(f, 1)):
        notes.append((start + i / RATE, f))
        prev = f
print('onsets (t s, Hz):', ' '.join(f'{t:.2f}:{f}' for t, f in notes[:120]))
