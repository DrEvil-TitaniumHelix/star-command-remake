// timer.js — TIMER, waits, and the original's CPU-calibrated delay loops replaced by wall-clock time.
//
//   timer.now()             TIMER: seconds since midnight, in BIOS ticks (18.2065 per second) like the original
//   await timer.frame()     yield to the browser for one animation frame (a busy-wait loop iteration)
//   await timer.wait(sec)   wait sec seconds (keys stay queued for INKEY$)
//   await timer.delayLoop(n)  `FOR I = 1 TO n: NEXT` (SPACE SUB_1657 runs n = Delay! * 1.2)
//   timer.stdDelay          StdDelay! = the STARTUP calibration count (iterations of its TIMER/FADD loop in one
//                           second, STARTUP L_0A56). The reproduction does not calibrate: it uses this constant.
//
// Delay-loop model: an empty FOR/NEXT iteration is EMPTY_LOOP_RATIO times faster than one calibration iteration,
// so n iterations last n / (stdDelay * EMPTY_LOOP_RATIO) seconds and the game's "Delay Factor" keeps its
// meaning (Delay! = StdDelay! gives the designed speed). EMPTY_LOOP_RATIO from acceptance/DOSBOX_REQUESTS.md D-QA-2
// ("You have completed your mission" stays 1.5 s at Delay = Standard). StdDelay comes from the save, G!(86)
// (stdSource), else the shipped 188.

export const TICKS_PER_SEC = 1193182 / 65536;      // 18.2065 Hz BIOS timer
export const SHIPPED_STD_DELAY = 188;               // CHARINFO.BAS A(86) = A(88) = 188 (DATA_FILES.md §B)
export const EMPTY_LOOP_RATIO = 7.7;                // measured in DOSBox-X (D-QA-2, qa fix F-4): 15900..16500 empty it/s vs calibration 2069

const FRAME_MS = 1000 / 60;

export class Timer {
  constructor(stdSource = null) {
    this.stdDelay = SHIPPED_STD_DELAY;
    this.stdSource = stdSource;          // () => G!(86) StdDelay! of the running game
    this.clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  }

  now() {
    const d = new Date();
    const secs = (d - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 1000;
    return Math.fround(Math.floor(secs * TICKS_PER_SEC) / TICKS_PER_SEC);
  }

  // setTimeout-based (~60 Hz) rather than requestAnimationFrame, so loops keep running in headless Chrome and
  // background tabs (build-startup request)
  frame() { return new Promise((r) => setTimeout(r, FRAME_MS)); }

  wait(sec) { return new Promise((r) => setTimeout(r, Math.max(0, sec * 1000))); }

  delaySeconds(n) { return n / ((this.stdSource?.() || this.stdDelay) * EMPTY_LOOP_RATIO); }

  delayLoop(n) { return this.wait(this.delaySeconds(n)); }
}
