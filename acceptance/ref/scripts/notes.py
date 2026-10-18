#!/usr/bin/env python3
"""notes.py WAV : PC-speaker note list from a mono 22050 Hz WAV: segments of constant pitch
(FFT peak, 1024-sample window, 5.8 ms hop) and silences, as 'start dur Hz' lines."""
import sys
import wave

import numpy as np

w = wave.open(sys.argv[1])
rate = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype='<i2').astype(float)
N, H = 1024, 128
win = np.hanning(N)
freqs = np.fft.rfftfreq(N, 1 / rate)
track = []
for i in range(0, len(x) - N, H):
    seg = x[i:i + N]
    if np.abs(seg).max() < 300 or seg.std() < 200:
        track.append(0.0); continue
    sp = np.abs(np.fft.rfft((seg - seg.mean()) * win))
    k = int(sp[3:].argmax()) + 3
    # parabolic interpolation
    a, b, c = sp[k - 1], sp[k], sp[k + 1]
    p = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) else 0
    track.append((k + p) * rate / N)
segs = []
for j, f in enumerate(track):
    t = j * H / rate
    if segs and (abs(f - segs[-1][2]) <= max(4, 0.03 * f)):
        segs[-1][1] = t + H / rate - segs[-1][0]
        segs[-1][2] = (segs[-1][2] * segs[-1][3] + f) / (segs[-1][3] + 1); segs[-1][3] += 1
    else:
        segs.append([t, H / rate, f, 1])
for s, d, f, _ in segs:
    if d >= 0.02:
        print(f'{s:7.3f} {d:6.3f} {f:7.1f}')
