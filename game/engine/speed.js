// Presentation delay only. G!(86)/G!(88) and TIMER/RND are never changed.
import { KEY } from './input.js';
export const SPEEDS = Object.freeze(['normal', 'fast', 'fastest']);
// Match combat.js's bottom-right reveal buttons; reserve the two rows above
// combat's -44/-22 rows. Hidden from the first frame until a real hover.
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
  // timer.js models decoded empty FOR/NEXT loops using StdDelay G!(86),
  // e.g. SPACE SUB_1657. Scale that result, preserving the original denominator.
  E.timer.delaySeconds = function(n) {
    return delaySeconds.call(this, n) / (enabled() ? [1, 4, 16][index] : 1);
  };
  E.speed = { cycle() { if (enabled()) index = (index + 1) % SPEEDS.length; return this.label; },
    get label() { return SPEEDS[enabled() ? index : 0]; } };
  // F2 = extended scan 60, unused by module command readers: SPACE SUB_212C,
  // INSIDE 01440, SPBATTLE 01C72 and PLBATTLE 02E89 subtract 70 and accept
  // only 1..11. STARPORT 022E3 uses ASC(K$) (NUL -> invalid command);
  // STARTUP 00A11 dispatches literal digits 1..5, not extended scans.
  // Generic any-key waits can accept F2 as any key; enabled engine hotkeys
  // intentionally consume it before those waits. Modal routing still wins.
  E.input.hotkeys.set(KEY.F2, { run: () => E.speed.cycle(), enabled });
  const button = cornerButton(E, 'Speed: normal', 66, enabled, () => E.speed.cycle());
  if (button) E.display.frameHooks.push(() => { button.textContent = `Speed: ${E.speed.label}`; });
  // Keep the pointer button alongside the engine-only F2 shortcut.
  return E.speed;
}
