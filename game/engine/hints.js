export const BASE = 'Esc - Menu     F1 - Plus', ANY = 'Press any key', BACK = 'Enter - Back', SAVED = 'Game saved',
  OLD = 'Options 3 and 5 are kept from the 1988 version and change nothing here.';
const TITLE = ['STARCOMM', 'STARTUP'];

export function hintText(module, lines, polled) {
  if (lines.some(l => l.includes('One Floppy Disk Drive') || l.includes('Enhanced Graphics Adaptor'))) return `${BASE}     ${OLD}`;
  if (module === 'STARPORT' && lines.some(l => l.includes('Quit the game?'))) return `${BASE}     ${SAVED}`;
  if (module === 'STARPORT' && !lines.some(l => /Main Menu|\((?:Y\/N|y\/n)\)|Basic Training Year|Input Name|ENTER/.test(l)) &&
    lines.some(l => /Select Option|Select A |Who Will Buy|Inspect Who|Select item/.test(l))) return `${BASE}     ${BACK}`;
  if (polled && TITLE.includes(module) && !lines.some(l => l.trim())) return `${BASE}     ${ANY}`;
  return BASE;
}

export function installHints(E, el, win = globalThis.window, now = () => performance.now()) {
  let polledAt = -1e9, seen = -1, lines = [], credits, mod, note = '', noteUntil = 0;
  const inkey = E.input.inkey.bind(E.input);
  E.input.inkey = () => { polledAt = now(); return inkey(); };
  const click = win?.document?.getElementById?.('click-hint'), msg = win?.document?.getElementById?.('msg');
  const update = () => {
    const v = E.fb?.version ?? 0;
    if (v !== seen) { seen = v; lines = E.text?.screenText?.() ?? []; }
    const r = E.display.canvas?.getBoundingClientRect?.(), room = r ? win.innerHeight - r.bottom >= 18 : true;
    const top = r ? (room ? r.bottom + 2 : win.innerHeight - 16) : 0;
    el.style.top = `${top}px`;
    if (click) click.style.top = el.style.top;
    const G = E.state?.G, c = G ? G[78] * 30000 + G[79] : undefined;
    if (mod === E.currentModule && E.currentModule === 'STARPORT' && c < credits) { note = `Paid ${Math.round(credits - c).toLocaleString('en-US')} credits, ${Math.round(c).toLocaleString('en-US')} left`; noteUntil = now() + 3000; }
    credits = c; mod = E.currentModule;
    el.textContent = hintText(E.currentModule, lines, now() - polledAt < 3000) + (now() < noteUntil ? `     ${note}` : '');
    el.hidden = E.settings?.on('hints') === false || (click && !click.hidden) || !!msg?.textContent || (!room && !!lines[lines.length - 1]?.trim());
  };
  E.display.frameHooks?.push(update);
  update();
  return update;
}
