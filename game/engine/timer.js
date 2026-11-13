export const TICKS_PER_SEC = 1193182 / 65536;
export const SHIPPED_STD_DELAY = 188;
export const EMPTY_LOOP_RATIO = 7.7;

const FRAME_MS = 1000 / 60;

export class Timer {
  constructor(stdSource = null) {
    this.stdDelay = SHIPPED_STD_DELAY;
    this.stdSource = stdSource;
    this.clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  }

  now() {
    const d = new Date();
    const secs = (d - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 1000;
    return Math.fround(Math.floor(secs * TICKS_PER_SEC) / TICKS_PER_SEC);
  }

  frame() { return new Promise((r) => setTimeout(r, FRAME_MS)); }

  wait(sec) { return new Promise((r) => setTimeout(r, Math.max(0, sec * 1000))); }

  delaySeconds(n) { return n / ((this.stdSource?.() || this.stdDelay) * EMPTY_LOOP_RATIO); }

  delayLoop(n) { return this.wait(this.delaySeconds(n)); }
}
