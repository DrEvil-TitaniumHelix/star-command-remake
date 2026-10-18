import { drawPanel } from './ui.js';
import { cornerButton } from './speed.js';

const prefixes = { STARTUP: 'SU', STARCOMM: 'CM', STARPORT: 'PT', SPACE: 'SP', INSIDE: 'IN', SPBATTLE: 'SB', PLBATTLE: 'PB' };
export function manualLines(data, id) {
  const screen = data.screens[id];
  if (!screen) return ['Choose a screen from the manual index.'];
  return [`${id}: ${screen.title}`, ...screen.pages.flatMap(page => [`Manual page ${page}`, data.pages[page]]),
    ...data.differences.filter(d => screen.differences.includes(d.id)).flatMap(d =>
      [`${d.id}: manual says ${d.manual}; the game does ${d.game}`, `Decode: ${d.source}`])];
}
const wrap = lines => lines.flatMap(line => String(line).split(/\r?\n/).flatMap(row => row.match(/.{1,74}(?:\s|$)|.{1,74}/g)?.map(s => s.trim()) ?? ['']));

export async function installManual(E, { url = 'assets/data/manual.json' } = {}) {
  if (E.manual) return E.manual;
  const response = await fetch(url).catch(() => null);
  if (!response?.ok) {
    // BYOC public tree: manual.json (the rule book text) is not shipped and not in the game folder (docs/BYOC.md 3.2);
    // the Manual button then stays off instead of stopping the boot
    console.warn(`Manual not available (${url}: ${response ? `HTTP ${response.status}` : 'no response'})`);
    E.manual = { data: null, missing: true, close() {}, open() {}, get isOpen() { return false; } };
    return E.manual;
  }
  const data = await response.json();
  let active = false, id, offset = 0;
  const enabled = () => E.settings?.on('manual') === true;
  const close = () => { active = false; };
  E.manual = { data, close, open(screenId) {
    if (!enabled() || E.input.modal) return;
    const prefix = prefixes[E.currentModule];
    id = data.screens[screenId] ? screenId : Object.keys(data.screens).find(s => s.startsWith(`${prefix}-`));
    offset = 0; active = true;
  }, get isOpen() { return active && enabled(); } };
  const doc = E.display.canvas?.ownerDocument;
  let controls;
  if (doc?.body) {
    controls = doc.createElement('span');
    controls.hidden = true;
    Object.assign(controls.style, { position: 'fixed', zIndex: '12', fontSize: '11px' });
    const button = (label, fn) => { const b = doc.createElement('button'); b.textContent = label; b.onclick = fn; controls.appendChild(b); };
    cornerButton(E, 'Manual', 88, enabled, () => E.manual.open(), () => E.manual.isOpen);
    const select = doc.createElement('select'); select.setAttribute('aria-label', 'Manual screen');
    for (const [key, value] of Object.entries(data.screens)) {
      const option = doc.createElement('option'); option.value = key; option.textContent = `${key}: ${value.title}`; select.appendChild(option);
    }
    select.onchange = () => E.manual.open(select.value); controls.appendChild(select);
    button('Previous page', () => { offset = Math.max(0, offset - 30); });
    button('Next page', () => { offset = Math.min(Math.max(0, wrap(manualLines(data, id)).length - 30), offset + 30); });
    button('Close manual', close); doc.body.appendChild(controls);
    E.display.frameHooks.push(() => {
      const rect = E.display.canvas.getBoundingClientRect();
      controls.style.left = `${rect.left + 8}px`; controls.style.top = `${rect.bottom - 58}px`;
      controls.style.maxWidth = `${Math.max(0, rect.width - 128)}px`;
      controls.hidden = !E.manual.isOpen || !!E.input.modal;
      if (active && id) select.value = id;
    });
  }
  E.display.overlays.push(ctx => {
    if (!enabled()) close();
    if (!E.manual.isOpen || E.input.modal) return;
    const lines = wrap(manualLines(data, id));
    drawPanel(ctx, E, 8, 8, ['Manual (use navigation buttons)', ...lines.slice(offset, offset + 30), `${offset + 1}-${Math.min(offset + 30, lines.length)} / ${lines.length}`], { scale: 1, width: 76 });
  });
  return E.manual;
}
