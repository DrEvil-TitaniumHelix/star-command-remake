export function dom() {
  const doc = {};
  class Element {
    constructor(tag) {
      this.tagName = tag.toUpperCase(); this.ownerDocument = doc; this.children = []; this.listeners = new Map(); this.style = {};
      this.attrs = {}; this.dataset = {}; this.hidden = false; this.textContent = ''; this.tabIndex = -1;
    }
    append(...nodes) { for (const n of nodes) { n.parent = this; this.children.push(n); } }
    appendChild(n) { this.append(n); return n; }
    replaceChildren(...nodes) { for (const n of this.children) n.parent = null; this.children = []; this.append(...nodes); }
    setAttribute(k, v) { this.attrs[k] = v; }
    addEventListener(k, f) { if (!this.listeners.has(k)) this.listeners.set(k, []); this.listeners.get(k).push(f); }
    contains(n) { return n === this || this.children.some(c => c.contains(n)); }
    focus() { doc.activeElement = this; }
    getBoundingClientRect() {
      return { left: parseFloat(this.style.left) || 0, top: parseFloat(this.style.top) || 0,
        width: Math.min(280, win.innerWidth), height: Math.min(360, win.innerHeight - 16) };
    }
    setPointerCapture(id) { this.pointerId = id; }
    fire(type, props = {}) {
      const e = { type, target: this, button: 0, pointerId: 1, defaultPrevented: false, stopped: false,
        preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; }, ...props };
      for (let n = this; n; n = n.parent) {
        for (const f of n.listeners.get(type) ?? []) f(e);
        if (e.stopped) break;
      }
      return e;
    }
    find(test) { return test(this) ? this : this.children.map(c => c.find(test)).find(Boolean); }
    all(test) { return [...(test(this) ? [this] : []), ...this.children.flatMap(c => c.all(test))]; }
  }
  const win = new Element('window'); win.innerWidth = 640; win.innerHeight = 400;
  doc.body = new Element('body'); doc.body.parent = win; doc.defaultView = win;
  doc.hasFocus = () => true; win.document = doc;
  doc.createElement = tag => new Element(tag); doc.getElementById = id => doc.body.find(n => n.id === id);
  const canvas = doc.createElement('canvas'); canvas.id = 'screen'; canvas.tabIndex = 0; doc.body.append(canvas); canvas.focus();
  return { doc, win, canvas, key: (key, type = 'keydown') => doc.activeElement.fire(type, { key }) };
}
