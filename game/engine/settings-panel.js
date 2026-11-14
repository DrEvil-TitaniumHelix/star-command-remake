import { FEATURES, AUDIO } from './settings.js';
import { hasManual } from './manual.js';

const KEY = 'starcommand:settings-position';

export function panelPosition(p, r, w, h) {
  return { x: Math.max(0, Math.min(Number.isFinite(p?.x) ? p.x : 16, w - r.width)),
    y: Math.max(0, Math.min(Number.isFinite(p?.y) ? p.y : 16, h - r.height)) };
}

export function installSettingsPanel(E, changed = () => {}) {
  const doc = globalThis.document;
  if (!doc?.createElement || !E.settings) return;
  const win = doc.defaultView, storage = E.settings.storage;
  const el = (tag, text) => { const n = doc.createElement(tag); if (text) n.textContent = text; return n; };
  const panel = el('div'), title = el('div'), heading = el('span', 'Star Command Plus'), body = el('div'), footer = el('div'), tabs = el('div'), help = el('div');
  panel.id = 'settings-panel'; panel.hidden = true; panel.tabIndex = -1;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'settings-title'); heading.id = 'settings-title';
  title.className = 'settings-title'; body.className = 'settings-body'; footer.className = 'settings-footer';
  const button = (text, run) => { const b = el('button', text); b.type = 'button'; b.addEventListener('click', run); return b; };
  const closeButton = button('×', close); closeButton.setAttribute('aria-label', 'Close settings');
  title.append(heading, closeButton);
  tabs.className = 'settings-tabs'; tabs.setAttribute('role', 'tablist'); help.className = 'settings-body'; help.hidden = true;
  let tab = 'settings', manualRow;
  const sync = () => { if (manualRow) manualRow.hidden = !hasManual(E); };
  const tabButtons = [['help', 'Help'], ['settings', 'Settings']].map(([id, text]) => {
    const b = button(text, () => show(id)); b.setAttribute('role', 'tab'); tabs.append(b); return [id, b];
  });
  function renderHelp() {
    const s = E.help?.sections?.(); if (!s) return;
    help.textContent = '';
    for (const [name, rows] of [[`This screen (${E.currentModule ?? ''})`, s.screen], ['General keys', s.general], ['Additions', s.additions]]) {
      help.append(el('strong', name)); const ul = el('ul'); for (const r of rows) ul.append(el('li', r)); help.append(ul);
    }
  }
  function show(id) {
    tab = id; help.hidden = id !== 'help'; body.hidden = footer.hidden = id === 'help';
    for (const [t, b] of tabButtons) b.setAttribute('aria-selected', String(t === id));
    if (id === 'help') renderHelp();
    if (!panel.hidden) place();
  }
  E.display?.frameHooks?.push(() => { sync(); if (!panel.hidden && tab === 'help') renderHelp(); });
  const controls = new Map();
  function apply(name, value) {
    E.settings.set(name, value); changed(name); if (controls.has(name)) controls.get(name).checked = E.settings.on(name);
    if (Object.hasOwn(AUDIO, name)) E.audio?.silence?.();
    if (E.fb) E.fb.dirty = true; E.display?.present?.(true);
  }
  for (const [name, text] of [...Object.entries(AUDIO), ...Object.entries(FEATURES)]) {
    const label = el('label'), input = el('input'); input.type = 'checkbox'; input.name = name;
    input.addEventListener('change', () => apply(name, input.checked));
    label.append(input, el('span', text)); body.append(label); controls.set(name, input);
    if (name === 'manual') manualRow = label;
  }
  sync();
  const confirmation = el('div'), status = el('div'); confirmation.hidden = true; status.hidden = true;
  status.setAttribute('role', 'status');
  const veteran = button('Load veteran crew', () => { confirmation.hidden = false; place(); cancel.focus(); });
  async function loadVeteran() {
    accept.disabled = veteran.disabled = true; status.hidden = false; status.textContent = 'Loading veteran crew…';
    try {
      const { applySaveParam } = await import('./saves.js');
      await applySaveParam(E.files, new URLSearchParams('save=veteran&force=1'), { base: `${E.assets ?? 'assets/'}saves/` });
      globalThis.location?.reload();
    } catch (error) { status.textContent = 'Veteran crew not loaded.'; console.error(error); }
    finally { accept.disabled = veteran.disabled = false; if (!panel.hidden) place(); }
  }
  const accept = button('Load', loadVeteran);
  const cancel = button('Cancel', () => { confirmation.hidden = true; place(); veteran.focus(); });
  confirmation.append(el('p', 'Replace your saved game with the veteran crew?'), accept, cancel);
  footer.append(veteran, confirmation, status); panel.append(title, tabs, help, body, footer); doc.body.append(panel);
  let pos, drag;
  try { pos = JSON.parse(storage?.getItem(KEY) ?? 'null'); } catch {   }
  function place() {
    pos = panelPosition(pos, panel.getBoundingClientRect(), win.innerWidth, win.innerHeight);
    panel.style.left = `${pos.x}px`; panel.style.top = `${pos.y}px`;
  }
  function remember() { try { storage?.setItem(KEY, JSON.stringify(pos)); } catch {   } }
  function close() {
    const focused = panel.contains(doc.activeElement);
    drag = null; panel.hidden = true; confirmation.hidden = true; status.hidden = true;
    if (focused) doc.getElementById('screen')?.focus();
  }
  for (const type of ['keydown', 'keyup', 'keypress']) panel.addEventListener(type, e => {
    e.stopPropagation();
    if (e.key === 'Escape') { e.preventDefault(); if (type === 'keydown') close(); }
  });
  for (const type of ['pointerdown', 'mousedown', 'click', 'wheel']) panel.addEventListener(type, e => e.stopPropagation());
  title.addEventListener('pointerdown', e => {
    if (e.button !== 0 || closeButton.contains(e.target)) return;
    e.preventDefault(); panel.focus();
    drag = { id: e.pointerId, x: e.clientX - pos.x, y: e.clientY - pos.y };
    title.setPointerCapture(e.pointerId);
  });
  title.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    pos = { x: e.clientX - drag.x, y: e.clientY - drag.y }; place();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) title.addEventListener(type, e => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null; remember();
  });
  win.addEventListener('resize', () => { if (!panel.hidden) { place(); remember(); } });
  E.settingsPanel = { open(id = 'settings') {
    sync();
    for (const [name, input] of controls) input.checked = E.settings.on(name);
    panel.hidden = false; show(id);
  }, close, apply, veteran: loadVeteran, isOpen: () => !panel.hidden, get tab() { return tab; } };
  return E.settingsPanel;
}
