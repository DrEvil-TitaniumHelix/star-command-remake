import { KEY } from './input.js';
export const SPEEDS = Object.freeze(['normal', 'fast', 'fastest']);
export function barPlace(rect, view, h) {
  if (view.h - rect.bottom >= 20 + h) return { outside: true, left: rect.left, top: rect.bottom + 20, row: true };
  if (rect.left >= 116) return { outside: true, left: rect.left - 112, top: rect.bottom - 3 * (h + 2), row: false };
  return { outside: false };
}
export function cornerButton(E, label, row, enabled, action, keepOpen = () => false) {
  const canvas = E.display.canvas, doc = canvas?.ownerDocument;
  if (!doc?.body) return null;
  let hovered = false;
  const button = doc.createElement('button');
  button.textContent = label; button.type = 'button'; button.hidden = true;
  Object.assign(button.style, { position: 'fixed', zIndex: '11', fontSize: '11px', whiteSpace: 'nowrap' });
  button.onclick = () => { action(); canvas.focus?.(); };
  canvas.addEventListener('mouseenter', () => { hovered = true; });
  canvas.addEventListener('mouseleave', event => { hovered = event.relatedTarget === button; });
  button.addEventListener('mouseenter', () => { hovered = true; });
  button.addEventListener('mouseleave', event => { hovered = event.relatedTarget === canvas; });
  doc.body.appendChild(button);
  const slots = E.display.cornerSlots ??= [];
  const slot = slots.push(button) - 1;
  E.display.frameHooks.push(() => {
    const rect = canvas.getBoundingClientRect(), win = doc.defaultView;
    const p = barPlace(rect, { w: win?.innerWidth ?? 0, h: win?.innerHeight ?? 0 }, 20);
    if (p.outside) {
      const before = slots.slice(0, slot).filter(b => !b.hidden);
      const shift = p.row ? before.reduce((n, b) => n + (b.offsetWidth || 90) + 4, 0) : 0;
      button.style.left = `${p.left + shift}px`; button.style.top = `${p.row ? p.top : p.top + slot * 22}px`;
    } else { button.style.left = `${rect.right - 110}px`; button.style.top = `${rect.bottom - row}px`; }
    button.hidden = !enabled() || !!E.input.modal || !(p.outside || hovered || keepOpen());
  });
  return button;
}
export function installSpeed(E) {
  if (E.speed) return E.speed;
  let index = 0;
  const enabled = () => E.settings?.on('speed') === true;
  const delaySeconds = E.timer.delaySeconds;
  E.timer.delaySeconds = function(n) {
    return delaySeconds.call(this, n) / (enabled() ? [1, 4, 16][index] : 1);
  };
  E.speed = { cycle() { if (enabled()) index = (index + 1) % SPEEDS.length; return this.label; },
    get label() { return SPEEDS[enabled() ? index : 0]; } };
  E.input.hotkeys.set(KEY.F2, { run: () => E.speed.cycle(), enabled });
  const button = cornerButton(E, 'Speed: normal', 66, enabled, () => E.speed.cycle());
  if (button) E.display.frameHooks.push(() => { button.textContent = `Speed: ${E.speed.label}`; });
  return E.speed;
}
