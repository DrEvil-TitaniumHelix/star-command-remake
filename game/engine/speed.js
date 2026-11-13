import { KEY } from './input.js';
export const SPEEDS = Object.freeze(['normal', 'fast', 'fastest']);
export function cornerButton(E, label, row, enabled, action, keepOpen = () => false) {
  const canvas = E.display.canvas, doc = canvas?.ownerDocument;
  if (!doc?.body) return null;
  let hovered = false;
  const button = doc.createElement('button');
  button.textContent = label; button.type = 'button'; button.hidden = true;
  Object.assign(button.style, { position: 'fixed', zIndex: '11', fontSize: '11px' });
  button.onclick = () => { action(); canvas.focus?.(); };
  canvas.addEventListener('mouseenter', () => { hovered = true; });
  canvas.addEventListener('mouseleave', event => { hovered = event.relatedTarget === button; });
  button.addEventListener('mouseenter', () => { hovered = true; });
  button.addEventListener('mouseleave', event => { hovered = event.relatedTarget === canvas; });
  doc.body.appendChild(button);
  E.display.frameHooks.push(() => {
    const rect = canvas.getBoundingClientRect();
    button.style.left = `${rect.right - 110}px`; button.style.top = `${rect.bottom - row}px`;
    button.hidden = !enabled() || !!E.input.modal || !(hovered || keepOpen());
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
