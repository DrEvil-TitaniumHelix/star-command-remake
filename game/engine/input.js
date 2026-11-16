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

export class Input {
  constructor() {
    this.queue = [];
    this.waiters = [];
    this.menu = null;
    this.menuSel = 0;
    this.text = null;
    this.modal = null;
    this.onDeviceEscape = null;
    this.onDeviceHelp = null;
    this.hotkeys = new Map();
  }

  attach(target = window) {
    target.addEventListener('keydown', (e) => {
      const k = keyCode(e);
      if (k === null) return;
      if (k === KEY.TAB && !this.modal && target.document?.getElementById?.('settings-panel')?.hidden === false) return;
      e.preventDefault();
      this.device(k);
    });
  }

  device(k) {
    if (this.modal) { this.modal.key(k); return; }
    if (this.capture?.(k)) return;
    if (this.onDeviceHelp && (k === KEY.F1 || (k === KEY.ESC && this.onDeviceHelp.isOpen?.()))) { this.onDeviceHelp(); return; }
    if (k === KEY.ESC && this.onDeviceEscape) { this.onDeviceEscape(); return; }
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
    text.typing = true;
    try {
      for (;;) {
        const k = await this.key();
        if (k === KEY.ENTER) { text.typing = false; text.print(''); return s; }
        if (k === KEY.BACKSPACE) {
          if (s.length) { s = s.slice(0, -1); text.col--; text.glyph(32); }
          continue;
        }
        if (k.length === 1 && k >= ' ' && s.length < maxLen) { s += k; text.write(k); }
      }
    } finally { text.typing = false; }
  }

  setMenu(items, opts = {}) { this.menu = { items, arrows: !!opts.arrows }; this.menuSel = 0; }
  clearMenu() { this.menu = null; }

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
}
