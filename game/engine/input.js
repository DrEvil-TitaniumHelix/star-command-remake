export const KEY = {
  ENTER: '\r', ESC: '\x1b', BACKSPACE: '\b', TAB: '\t', SPACE: ' ',
  UP: '\0H', DOWN: '\0P', LEFT: '\0K', RIGHT: '\0M',
  HOME: '\0G', END: '\0O', PGUP: '\0I', PGDN: '\0Q', INS: '\0R', DEL: '\0S', F1: '\0;', F2: '\0<',
};

const EXTENDED = {
  ArrowUp: KEY.UP, ArrowDown: KEY.DOWN, ArrowLeft: KEY.LEFT, ArrowRight: KEY.RIGHT,
  Home: KEY.HOME, End: KEY.END, PageUp: KEY.PGUP, PageDown: KEY.PGDN, Insert: KEY.INS, Delete: KEY.DEL,
};
for (let i = 1; i <= 10; i++) EXTENDED[`F${i}`] = `\0${String.fromCharCode(58 + i)}`;
const CONTROL = { Enter: KEY.ENTER, Escape: KEY.ESC, Backspace: KEY.BACKSPACE, Tab: KEY.TAB };

export function keyCode(e) {
  if (EXTENDED[e.key]) return EXTENDED[e.key];
  if (CONTROL[e.key]) return CONTROL[e.key];
  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    const c = e.key.charCodeAt(0);
    if (c >= 32 && c < 127) return e.key;
  }
  return null;
}

const PAD = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, BACK: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const REPEAT_DELAY = 400, REPEAT_RATE = 120;

export class Input {
  constructor() {
    this.queue = [];
    this.waiters = [];
    this.menu = null;
    this.menuSel = 0;
    this.highlight = null;
    this.text = null;
    this.lastDevice = 'keyboard';
    this.padPrev = new Map();
    this.modal = null;
    this.onDeviceEscape = null;
    this.onDeviceHelp = null;
    this.hotkeys = new Map();
  }

  helpAvailable() { return !!this.onDeviceHelp && (this.onDeviceHelp.enabled?.() ?? true); }

  attach(target = window) {
    target.addEventListener('keydown', (e) => {
      const k = keyCode(e);
      if (k === null) return;
      e.preventDefault();
      this.lastDevice = 'keyboard';
      this.device(k);
    });
  }

  device(k) {
    if (this.modal) { this.modal.key(k); return; }
    if (k === KEY.ESC && this.onDeviceEscape) { this.onDeviceEscape(); return; }
    if (k === KEY.F1 && this.onDeviceHelp) { this.onDeviceHelp(); return; }
    const hk = this.hotkeys.get(k);
    if (hk && (hk.enabled?.() ?? true)) { hk.run(); return; }
    this.push(k);
  }

  push(k) {
    const w = this.waiters.shift();
    if (w) w(k); else this.queue.push(k);
  }

  inkey() { return this.queue.length ? this.queue.shift() : ''; }

  async key(filter) {
    for (;;) {
      const k = this.queue.length ? this.queue.shift() : await new Promise((r) => this.waiters.push(r));
      if (!filter || filter(k)) return k;
    }
  }

  flush() { this.queue.length = 0; }

  async lineInput(text, prompt = '', maxLen = 255) {
    if (prompt) text.print(prompt, ';');
    let s = '';
    for (;;) {
      const k = await this.key();
      if (k === KEY.ENTER) { text.print(''); return s; }
      if (k === KEY.BACKSPACE) {
        if (s.length) { s = s.slice(0, -1); text.col--; text.glyph(32); }
        continue;
      }
      if (k.length === 1 && k >= ' ' && s.length < maxLen) { s += k; text.write(k); }
    }
  }

  setMenu(items, opts = {}) { this.menu = { items, arrows: !!opts.arrows }; this.menuSel = 0; }
  clearMenu() { this.menu = null; }

  pollGamepads(now) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = [...pads].find((p) => p && p.connected);
    if (!pad) return;
    const b = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
    const ax = pad.axes || [];
    const state = {
      A: b(PAD.A), B: b(PAD.B), X: b(PAD.X), Y: b(PAD.Y), LB: b(PAD.LB), RB: b(PAD.RB),
      BACK: b(PAD.BACK), START: b(PAD.START),
      UP: b(PAD.UP) || ax[1] < -0.5, DOWN: b(PAD.DOWN) || ax[1] > 0.5,
      LEFT: b(PAD.LEFT) || ax[0] < -0.5, RIGHT: b(PAD.RIGHT) || ax[0] > 0.5,
      RUP: ax[3] < -0.5, RDOWN: ax[3] > 0.5,
    };
    for (const [id, down] of Object.entries(state)) {
      const prev = this.padPrev.get(id) || { down: false, next: 0 };
      const repeatable = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'LB', 'RB', 'RUP', 'RDOWN'].includes(id);
      if (down && (!prev.down || (repeatable && now >= prev.next))) {
        this.lastDevice = 'gamepad';
        this.padButton(id);
        this.padPrev.set(id, { down: true, next: now + (prev.down ? REPEAT_RATE : REPEAT_DELAY) });
      } else if (!down) this.padPrev.set(id, { down: false, next: 0 });
    }
  }

  menuItems() {
    if (this.menu?.items.length) return this.menu.items;
    if (!this.text) return [];
    const items = [];
    this.text.screenText().forEach((line, r) => {
      for (const m of line.matchAll(/(?:^| )([A-Z0-9])-(?=[A-Za-z0-9])(\S+(?: \S+)*)/g)) {
        const col = m.index + (m[0].startsWith(' ') ? 1 : 0) + 1;
        items.push({ key: m[1], row: r + 1, col, len: 2 + m[2].length });
      }
    });
    return items;
  }

  yesNoPrompt() { return !!this.text && this.text.screenText().some((l) => /\((?:Y\/N|y\/n)\)/.test(l)); }

  padButton(id) {
    if (this.modal) {
      this.highlight = null;
      if (id === 'LB' || id === 'RB' || id === 'RUP' || id === 'RDOWN') return;
    }
    if (id === 'LB' || id === 'RB' || id === 'RUP' || id === 'RDOWN') {
      const items = this.menuItems();
      if (!items.length) { this.highlight = null; return; }
      const d = id === 'LB' || id === 'RUP' ? -1 : 1;
      const cur = this.highlight ? items.findIndex((it) => it.key === this.highlight.key && it.row === this.highlight.row) : -1;
      this.highlight = items[cur < 0 ? (d > 0 ? 0 : items.length - 1) : (cur + d + items.length) % items.length];
      return;
    }
    if (id === 'A' && this.highlight) {
      const still = this.menuItems().some((it) => it.key === this.highlight.key && it.row === this.highlight.row);
      const k = this.highlight.key;
      this.highlight = null;
      if (still) { this.device(k); return; }
    }
    if (id === 'B') { this.device(this.yesNoPrompt() && !this.modal ? 'N' : KEY.ESC); return; }
    this.highlight = null;
    const map = {
      A: KEY.ENTER, START: this.onDeviceEscape ? KEY.ESC : KEY.ENTER, BACK: this.helpAvailable() ? KEY.F1 : KEY.ESC, X: KEY.SPACE, Y: 'Y',
      UP: KEY.UP, DOWN: KEY.DOWN, LEFT: KEY.LEFT, RIGHT: KEY.RIGHT,
    };
    if (map[id]) this.device(map[id]);
  }

  overlay(ctx) {
    if (!this.highlight || this.lastDevice !== 'gamepad') return;
    if (!this.menuItems().some((x) => x.key === this.highlight.key && x.row === this.highlight.row)) { this.highlight = null; return; }
    const it = this.highlight;
    ctx.save();
    ctx.strokeStyle = '#ffff55';
    ctx.lineWidth = 2;
    ctx.strokeRect(16 * (it.col - 1) - 2, 16 * (it.row - 1) - 1, 16 * it.len + 4, 18);
    ctx.restore();
  }
}
