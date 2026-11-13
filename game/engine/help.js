import { KEY } from './input.js';
import { drawPanel } from './ui.js';
const names = new Map([[KEY.ENTER,'ENTER'],[KEY.SPACE,'SPACE'],[KEY.PGUP,'PGUP'],[KEY.PGDN,'PGDN'],[KEY.BACKSPACE,'BACKSPACE']]);
const keyName = k => names.get(k) ?? (k?.[0] === '\0' ? `F${k.charCodeAt(1)-58}` : String(k).toUpperCase());
const supplements = [
  {
    when: (E, screen) => E.currentModule === 'STARPORT' &&
      screen.some(line => /\bSelect (?:Option|A\s+\w+)/.test(line)),
    entries: [['ENTER', 'ENTER: return / finish menu'], ['SPACE', 'SPACE: more / stay on menu']],
  },
  {
    when: (E, screen, regions) => regions.some(r => r.kind === 'map' || r.kind === 'arrow'),
    entries: [['arrow', 'Arrow keys: move']],
  },
  {
    when: (E, screen) => E.currentModule === 'INSIDE' &&
      screen.some(line => line.includes('Use arrow keys to pick')),
    entries: [['arrow', 'Arrow keys: move'], ['PGUP', 'PGUP: accepted; no option change'],
      ['PGDN', 'PGDN: accepted; no option change'], ['ENTER', 'ENTER: accept option']],
  },
];
export function installHelp(E) {
  let active = false, hovered = false;
  const enabled = () => E.settings?.on('controlOverlay') !== false;
  const isOpen = () => active && enabled();
  function lines() {
    const screen = E.text.screenText(), regions = E.pointer.regions(), out = [], seen = new Set();
    for (const r of regions) {
      const group = ['arrow','map'].includes(r.kind) ? r.kind : keyName(r.key);
      if (seen.has(group)) continue;
      seen.add(group);
      if (group === 'arrow') { out.push('Arrow keys: move'); continue; }
      if (group === 'map') { out.push('Click a cell: step toward it'); continue; }
      const row = screen[Math.floor(r.y/8)] ?? '';
      let label = row.slice(Math.floor(r.x/8), Math.ceil((r.x+r.w)/8)).trim();
      if (['selector','menu','option'].includes(r.kind)) label = label.replace(/^[A-Za-z0-9][>)-]\s*/, '');
      if (r.kind === 'word') label = row.trim().split(/\s{2,}/).find(part => part.includes(label)) ?? label;
      if (r.kind === 'prompt') label = group === 'Y' ? 'Yes' : 'No';
      out.push(`${group}: ${label || group}`);
    }
    for (const supplement of supplements) {
      if (!supplement.when(E, screen, regions)) continue;
      for (const [key, line] of supplement.entries) {
        if (!seen.has(key)) { seen.add(key); out.push(line); }
      }
    }
    out.push('Gamepad: d-pad = arrows','A = ENTER / highlighted item',
      'B = N on Y/N prompts; otherwise Esc','X = SPACE; Y = Y',
      'LB/RB = highlight menu items','Start = Esc menu; Back = this help',
      'Mouse: click a hotkey = press it');
    if (E.settings?.on('mapZoom') !== false) out.push('Map zoom: wheel in / out','Right-click out; click cells to step');
    out.push('Esc: Resume / Save & Quit / Quit menu','F1: this help');
    if (E.settings?.on('manual')) out.push('Manual: use Manual button / screen selector');
    if (E.settings?.on('speed')) out.push(`F2: speed (${E.speed?.label ?? 'normal'}; Speed button also cycles)`);
    if (E.settings?.on('missionMarker')) out.push('Yellow map box: unfinished mission target');
    return out;
  }
  const close = () => { active = false; };
  const open = () => { if (enabled() && !E.input.modal) active = true; };
  const toggle = () => { if (E.input.modal) return; if (isOpen()) close(); else open(); };
  toggle.enabled = enabled;
  E.help = {open,close,toggle,isOpen,lines};
  E.input.onDeviceHelp = toggle;
  const canvas = E.display.canvas, doc = canvas?.ownerDocument;
  let button;
  if (doc?.body) {
    button = doc.createElement('button');
    button.textContent = '?'; button.type = 'button'; button.title = 'Controls (F1)';
    button.setAttribute('aria-label','Toggle control help');
    Object.assign(button.style,{position:'fixed',width:'24px',height:'24px',padding:'0',
      background:'rgba(0,0,0,0.65)',color:'#55ffff',border:'1px solid #55ffff',cursor:'pointer',zIndex:'10',display:'none'});
    button.addEventListener('click',event => { event.stopPropagation(); toggle(); canvas.focus?.(); });
    canvas.addEventListener('mouseenter',() => { hovered = true; });
    canvas.addEventListener('mouseleave',event => { hovered = event.relatedTarget === button; });
    button.addEventListener('mouseleave',event => { hovered = event.relatedTarget === canvas; });
    doc.body.appendChild(button);
  }
  E.display.overlays.push(ctx => {
    if (!enabled()) close();
    if (button) {
      const rect = canvas.getBoundingClientRect();
      button.style.left = `${rect.right-24}px`; button.style.top = `${rect.bottom-24}px`;
      button.style.display = enabled() && !E.input.modal && hovered ? 'block' : 'none';
    }
    if (!isOpen() || E.input.modal) return;
    const model = ['Controls (F1 / Back to close)',...lines()];
    const cols = Math.max(...model.map(line => line.length));
    const scale = cols*16+16 <= 320 && model.length*20+12 <= 400 ? 2 : 1;
    const wrapped = model.flatMap(line => line.match(/.{1,76}/g) ?? ['']);
    const width = Math.max(...wrapped.map(line => line.length));
    drawPanel(ctx,E,640-width*8*scale-16,0,wrapped,{scale});
  });
}
