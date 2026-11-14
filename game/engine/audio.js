const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const BUFFER = 32;
const GAIN = 0.06;

export class Audio {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.muted = false;
    this.items = [];
    this.tail = 0;
    this.osc = new Set();
    this.reset();
    if (typeof window !== 'undefined') {
      const unlock = () => this.unlock();
      window.addEventListener('keydown', unlock);
      window.addEventListener('pointerdown', unlock);
      window.addEventListener('gamepadconnected', unlock);
    }
  }

  reset() { this.octave = 4; this.len = 4; this.tempo = 120; this.art = 7 / 8; this.background = false; }

  clock() { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }

  unlock() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch {   }
  }

  prune() { const t = this.clock(); while (this.items.length && this.items[0].end <= t) this.items.shift(); }

  queue() { this.prune(); return this.items.length; }

  allow(kind) { return !this.muted && this.settings?.hear?.(kind) !== false; }

  silence() { for (const o of this.osc) if (!this.allow(o.kind)) { try { o.stop(); } catch {   } } }

  enqueue(freq, dur, on = dur, kind = 'effects') {
    const now = this.clock();
    const start = Math.max(now, this.tail), end = start + dur * 1000;
    this.items.push({ start, end });
    this.tail = end;
    const ctx = this.ctx;
    if (freq > 0 && on > 0 && this.allow(kind) && ctx && ctx.state === 'running') {
      const t0 = ctx.currentTime + (start - now) / 1000;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.kind = kind;
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.value = GAIN;
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + on);
      this.osc.add(o);
      o.onended = () => this.osc.delete(o);
    }
  }

  stopAll() {
    for (const o of this.osc) { try { o.stop(); } catch {   } }
    this.osc.clear();
    this.items.length = 0;
    this.tail = 0;
  }

  noteFreq(n) { return 440 * 2 ** ((n - 46) / 12); }

  noteSecs(len, dots) { let s = (60 / this.tempo) * (4 / len); let add = s / 2; for (let i = 0; i < dots; i++) { s += add; add /= 2; } return s; }

  play(mml) {
    const s = mml.toUpperCase();
    let i = 0;
    const num = () => { let j = i; while (j < s.length && s[j] >= '0' && s[j] <= '9') j++; const v = j > i ? parseInt(s.slice(i, j), 10) : null; i = j; return v; };
    const dots = () => { let d = 0; while (s[i] === '.') { d++; i++; } return d; };
    const tone = (n, len, d) => {
      const secs = this.noteSecs(len, d);
      if (n <= 0) this.enqueue(0, secs);
      else this.enqueue(this.noteFreq(n), secs, secs * this.art, 'music');
    };
    while (i < s.length) {
      const c = s[i++];
      if (c === ' ' || c === ';' || c === 'X') continue;
      if (NOTE[c] !== undefined) {
        let n = NOTE[c];
        if (s[i] === '#' || s[i] === '+') { n++; i++; } else if (s[i] === '-') { n--; i++; }
        const len = num() ?? this.len;
        tone(this.octave * 12 + n + 1, len, dots());
      } else if (c === 'N') { const n = num() ?? 0; tone(n, this.len, dots()); }
      else if (c === 'O') this.octave = Math.min(6, Math.max(0, num() ?? 4));
      else if (c === '<') this.octave = Math.max(0, this.octave - 1);
      else if (c === '>') this.octave = Math.min(6, this.octave + 1);
      else if (c === 'L') this.len = num() ?? 4;
      else if (c === 'T') this.tempo = num() ?? 120;
      else if (c === 'P') { const len = num() ?? 4; this.enqueue(0, this.noteSecs(len, dots())); }
      else if (c === 'M') {
        const m = s[i++];
        if (m === 'F') this.background = false;
        else if (m === 'B') this.background = true;
        else if (m === 'N') this.art = 7 / 8;
        else if (m === 'L') this.art = 1;
        else if (m === 'S') this.art = 3 / 4;
        else throw new Error(`PLAY: illegal function call at M${m}`);
      } else throw new Error(`PLAY: illegal function call at '${c}' in "${mml}"`);
    }
    return this.settle();
  }

  settle(keep = 0) {
    return new Promise((resolve) => {
      const check = () => {
        const n = this.queue();
        if (this.background ? n <= BUFFER : n <= keep) resolve();
        else setTimeout(check, 10);
      };
      check();
    });
  }

  sound(freq, ticks) {
    if (ticks === 0) { this.stopAll(); return Promise.resolve(); }
    this.enqueue(freq >= 37 ? freq : 0, ticks / 18.2065);
    return this.settle(1);
  }

  beep() { this.enqueue(800, 0.25); return this.settle(); }
}
