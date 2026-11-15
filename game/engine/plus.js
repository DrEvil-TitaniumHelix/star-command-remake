import { FEATURES, AUDIO } from './settings.js';
import { manualLines, hasManual } from './manual.js';
import { logLines, crewLines, crewStatus, shipStatus } from './panels.js';

export const CHANNEL = 'starcommand-plus', GEOM = 'starcommand:plus-window', NAME = 'starcommand-plus', LAST = 'starcommand:plus-tab';
export const TABS = { crew: 'Crew', help: 'Help', settings: 'Settings', log: 'Log book', manual: 'Manual' };
const CREW = ['SPACE', 'INSIDE', 'PLBATTLE', 'SPBATTLE', 'STARPORT'], SHIP = ['SPACE', 'SPBATTLE'], NL = String.fromCharCode(10);
const crewText = E => { try { return E.state && CREW.includes(E.currentModule) ? crewLines(crewStatus(E)).join(NL + NL) + (SHIP.includes(E.currentModule) ? NL + NL + 'Ship status' + NL + shipStatus(E).join(NL) : '') : ''; } catch { return ''; } };
const PREFIX = { STARTUP: 'SU', STARCOMM: 'CM', STARPORT: 'PT', SPACE: 'SP', INSIDE: 'IN', SPBATTLE: 'SB', PLBATTLE: 'PB' };
const known = n => Object.hasOwn(FEATURES, n) || Object.hasOwn(AUDIO, n);

export function snapshot(E) {
  const d = hasManual(E) ? E.manual.data : null, id = d && Object.keys(d.screens).find(s => s.startsWith(`${PREFIX[E.currentModule]}-`));
  return { t: 'state', module: E.currentModule ?? '', crew: crewText(E),
    help: E.help?.sections?.() ?? { screen: [], general: [], additions: [] },
    settings: Object.fromEntries([...Object.keys(AUDIO), ...Object.keys(FEATURES)].filter(n => n !== 'manual' || d).map(n => [n, E.settings?.on(n) !== false])),
    log: E.settings?.on('logBook') === false || !E.logbook ? null : logLines(E.logbook.entries()),
    manual: d && E.settings?.on('manual') !== false ? manualLines(d, id).map(String) : null };
}

export function handle(E, m, post) {
  if (m?.t === 'hello') post(snapshot(E));
  else if (m?.t === 'set' && known(m.name)) {
    if (E.settingsPanel?.apply) E.settingsPanel.apply(m.name, !!m.value); else E.settings.set(m.name, !!m.value);
    post(snapshot(E));
  } else if (m?.t === 'veteran') E.settingsPanel?.veteran?.();
}

export function features(g, win) {
  const n = (v, d) => Number.isFinite(v) ? Math.round(v) : d;
  const w = n(g?.w, 440), h = n(g?.h, n(win?.outerHeight, 600)), x = n(g?.x, n(win?.screenX, 0) + n(win?.outerWidth, 800)), y = n(g?.y, n(win?.screenY, 0));
  return `popup,resizable,width=${w},height=${h},left=${x},top=${y}`;
}

export function installPlus(E, win = globalThis.window) {
  if (!win?.open || E.plus) return;
  let w = null, last = '', at = 0;
  const g = Math.random().toString(36).slice(2, 10), ch = win.BroadcastChannel ? new win.BroadcastChannel(CHANNEL) : null;
  const post = m => { try { ch?.postMessage({ ...m, g }); } catch { } };
  if (ch) ch.onmessage = e => { if (e.data?.g === g) handle(E, e.data, m => { last = JSON.stringify(m); post(m); }); };
  E.plus = { open(tab) {
    if (!tab) { try { tab = win.localStorage.getItem(LAST); } catch { } if (!Object.hasOwn(TABS, tab ?? '')) tab = 'crew'; }
    let geo; try { geo = JSON.parse(win.localStorage.getItem(GEOM)); } catch { }
    try { w = win.open(`plus.html?g=${g}#${tab}`, `${NAME}-${g}`, features(geo, win)); } catch { w = null; }
    if (!w) return false;
    try { w.focus(); } catch { }
    last = ''; return true;
  }, get window() { return w && !w.closed ? w : null; } };
  E.display.frameHooks?.push(t => {
    if (!ch || t - at < 250) return;
    at = t; const m = snapshot(E), s = JSON.stringify(m);
    if (s !== last) { last = s; post(m); }
  });
  win.addEventListener?.('pagehide', () => { post({ t: 'close' }); try { w?.close(); } catch { } });
}

export function runPlusWindow(doc, win = doc.defaultView) {
  const g = new URLSearchParams(win.location.search ?? '').get('g'), bc = new win.BroadcastChannel(CHANNEL), ch = { postMessage: m => bc.postMessage({ ...m, g }) }, el = (tag, text, parent) => { const n = doc.createElement(tag); if (text != null) n.textContent = text; parent?.append(n); return n; };
  let st = null, shown = '', tab = Object.hasOwn(TABS, win.location.hash.slice(1)) ? win.location.hash.slice(1) : 'help';
  doc.title = 'Star Command Plus';
  const nav = el('nav', null, doc.body), main = el('main', null, doc.body);
  nav.setAttribute('role', 'tablist'); main.setAttribute('role', 'tabpanel');
  const buttons = Object.entries(TABS).map(([id, label]) => {
    const b = el('button', label, nav); b.type = 'button'; b.dataset.tab = id; b.setAttribute('role', 'tab');
    b.onclick = () => select(id); return b;
  });
  const list = (title, items) => { el('h2', title, main); const ul = el('ul', null, main); for (const s of items) el('li', s, ul); if (!items.length) el('li', 'None', ul); };
  const part = () => st && ({ crew: st.crew, help: st.help, settings: st.settings, log: st.log, manual: st.manual })[tab];
  const manual = () => !!st && Object.hasOwn(st.settings, 'manual');
  const state = () => JSON.stringify([tab, st?.module, manual(), part()]);
  function render() {
    if (tab === 'manual' && st && !manual()) return select('help');
    for (const b of buttons) { b.hidden = b.dataset.tab === 'manual' && !manual(); b.setAttribute('aria-selected', String(b.dataset.tab === tab)); }
    shown = state(); main.replaceChildren();
    if (!st) { el('p', 'Waiting for the game window…', main); return; }
    if (tab === 'crew') el('pre', st.crew || 'No crew to show on this screen.', main);
    else if (tab === 'help') {
      list(`This screen (${st.module || 'starting'})`, st.help.screen); list('General keys', st.help.general); list('Additions', st.help.additions);
    } else if (tab === 'settings') {
      for (const [title, rows] of [['Sound', AUDIO], ['Additions', FEATURES]]) {
        const f = el('fieldset', null, main); el('legend', title, f);
        for (const [name, text] of Object.entries(rows)) {
          if (!Object.hasOwn(st.settings, name)) continue;
          const l = el('label', null, f), c = el('input', null, l); c.type = 'checkbox'; c.name = name; c.checked = !!st.settings[name];
          c.onchange = () => ch.postMessage({ t: 'set', name, value: c.checked }); el('span', text, l);
        }
      }
      const v = el('button', 'Load veteran crew', main), box = el('div', null, main); v.type = 'button'; box.hidden = true;
      el('p', 'Replace your saved game with the veteran crew?', box);
      const yes = el('button', 'Load', box), no = el('button', 'Cancel', box);
      v.onclick = () => { box.hidden = false; no.focus(); }; no.onclick = () => { box.hidden = true; v.focus(); };
      yes.onclick = () => { ch.postMessage({ t: 'veteran' }); box.hidden = true; };
    } else if (tab === 'log') {
      if (!st.log) el('p', 'The log book is off (Settings tab).', main); else el('pre', st.log.join('\n\n') || 'No entries yet.', main);
    } else if (!st.manual) el('p', 'The manual is off (Settings tab).', main);
    else for (const s of st.manual) el('p', s, main);
  }
  function select(id) { tab = id === 'manual' && !manual() ? 'help' : id; try { win.history.replaceState(null, '', `#${tab}`); } catch { } try { win.localStorage.setItem(LAST, tab); } catch { } render(); }
  bc.onmessage = e => {
    if ((e.data?.g ?? null) !== g) return;
    if (e.data?.t === 'close') return win.close();
    if (e.data?.t !== 'state') return;
    st = e.data; if (state() !== shown) render();
  };
  win.addEventListener('hashchange', () => { const id = win.location.hash.slice(1); if (Object.hasOwn(TABS, id) && id !== tab) select(id); });
  let saved = '';
  const remember = () => {
    const s = JSON.stringify({ x: win.screenX, y: win.screenY, w: win.outerWidth, h: win.outerHeight });
    if (s !== saved) { saved = s; try { win.localStorage.setItem(GEOM, s); } catch { } }
  };
  win.setInterval(remember, 1000); win.addEventListener('resize', remember); win.addEventListener('pagehide', remember);
  render(); ch.postMessage({ t: 'hello' });
}
