import { installSlots, forgetFile, validateSlotName } from './slots.js';
import { FEATURES } from './settings.js';
import { drawPanel, UI } from './ui.js';
import { KEY } from './input.js';
import { ChainSignal } from './chain.js';
import { dosName } from './files.js';
import { TICKS_PER_SEC } from './timer.js';

export function captureSave(E) {
  const lock = E.state.G[2265];
  try {
    E.state.G[2265] = 0;
    let logbook = E.files.saved('LOGBOOK')?.slice() ?? null;
    try {
      if (E.logbook?.checkpoint && E.settings?.on?.('logBook') !== false) {
        E.logbook.observe?.();
        logbook = new TextEncoder().encode(JSON.stringify(E.logbook.checkpoint()));
      }
    } catch (e) { console.error(e); }
    return { logbook, body: E.state.toBytes(), header: { ...E.state.header },
      names: [E.state.str('ShipName$')[0], ...Array.from({length: 8}, (_, i) => E.state.str('CrewName$')[i + 1])] };
  } finally { E.state.G[2265] = lock; }
}

export function installEscape(E) {
  let protectionOverride = E.options?.protection === true ? true : undefined;
  if (E.settings) {
    E.options ??= {};
    Object.defineProperty(E.options, 'protection', { configurable: true, enumerable: true,
      get: () => protectionOverride ?? (E.settings.classic || !E.settings.on('noChallenge')),
      set: value => { protectionOverride = !!value; } });
  }
  let restartPending = false;
  const checkRestart = () => {
    if (restartPending) { restartPending = false; throw new ChainSignal('STARCOMM'); }
  };
  let page = false, settingIndex = 0, confirmVeteran = false;
  const rows = [['classic', 'Classic mode'], ...Object.entries(FEATURES), ['veteran', 'Load veteran crew']];
  const shortcuts = 'ACDEFGHIJKLM NOPV'.replaceAll(' ', '');
  async function loadVeteran() {
    try {
      const { applySaveParam } = await import('./saves.js');
      await applySaveParam(E.files, new URLSearchParams('save=veteran&force=1'), { base: `${E.assets ?? 'assets/'}saves/` });
      globalThis.location?.reload();
    } catch (error) { confirmVeteran = false; page = false; note = 'Veteran crew not loaded; R to resume'; console.error(error); }
  }
  const toggle = () => {
    const name = rows[settingIndex][0];
    if (name === 'veteran') { confirmVeteran = true; return; }
    if (name === 'noChallenge') protectionOverride = undefined;
    if (name === 'classic') E.settings?.set(name, !E.settings.classic);
    else if (!E.settings?.classic) E.settings?.set(name, !E.settings.on(name));
  };
  let active = false, quitting = false, selected = 0, note = '', checkpoint;
  let release, gate, pausedAt = 0, elapsed = 0, audioWasRunning = false;
  let wallAt = 0, wallPaused = 0;
  const wall = () => (active ? wallAt : performance.now()) - wallPaused;
  const journal = new Map(), write = E.files.write.bind(E.files);
  let entryPoint, menuPoint, menuWaiting = false, currentModule = E.currentModule;
  function enterStarport() {
    entryPoint = captureSave(E);
    if (E.slots?.enabled() && !new URLSearchParams(globalThis.location?.search ?? '').has('screen')) E.slots.autosave = E.slots.save('Autosave', entryPoint, true).catch(error => {
      note = 'Autosave failed: ' + error.message; console.error(error);
    });
    menuPoint = undefined; menuWaiting = false;
  }
  if (currentModule === 'STARPORT') enterStarport();
  Object.defineProperty(E, 'currentModule', { configurable: true, enumerable: true,
    get: () => currentModule,
    set(value) { currentModule = value; if (value === 'STARPORT') enterStarport(); }
  });
  let menuAt = -1, menuSeen = false;
  const mainMenu = (fresh = false) => {
    const v = E.fb?.version ?? NaN;
    if (fresh || v !== menuAt) {
      const text = E.text?.screenText?.().join('\n') ?? '';
      menuSeen = /\bMain Menu\b/.test(text) && /\bSelect Option\b/.test(text);
      menuAt = v;
    }
    return menuSeen;
  };
  const inkey = E.input.inkey.bind(E.input);
  E.input.inkey = () => {
    checkRestart();
    const k = inkey();
    const waiting = E.currentModule === 'STARPORT' && !k && mainMenu();
    if (waiting && !menuWaiting) menuPoint = captureSave(E);
    menuWaiting = waiting;
    return k;
  };
  E.files.write = (name, bytes) => {
    const n = dosName(name);
    if ((/^IN(?:MAP)?-\d+\.BAS$/.test(n) || n === 'LOGBOOK') && !journal.has(n)) journal.set(n, E.files.saved(n)?.slice() ?? null);
    return write(name, bytes);
  };
  const chain = E.chain;
  E.chain = (...args) => {
    if (E.currentModule === 'STARPORT') { checkpoint = captureSave(E); journal.clear(); }
    return chain(...args);
  };
  for (const method of ['frame', 'wait']) {
    if (!E.timer?.[method]) continue;
    const original = E.timer[method].bind(E.timer);
    E.timer[method] = async (...args) => {
      const start = wall();
      checkRestart();
      await original(...args); while (active) await gate;
      checkRestart();
      if (method === 'wait') {
        let remaining = Number(args[0]) * 1000 - (wall() - start);
        while (remaining > 1) {
          await original(remaining / 1000); while (active) await gate;
          remaining = Number(args[0]) * 1000 - (wall() - start);
        }
      }
    };
  }
  const timerNow = E.timer?.now?.bind(E.timer);
  let frozenTimer = 0;
  if (timerNow) E.timer.now = () => active ? frozenTimer :
    Math.fround((Math.round(timerNow() * TICKS_PER_SEC) - Math.round(wallPaused / 1000 * TICKS_PER_SEC)) / TICKS_PER_SEC);
  const clock = E.audio?.clock?.bind(E.audio);
  if (clock) E.audio.clock = () => (active ? pausedAt : clock()) - elapsed;
  const unlock = E.audio?.unlock?.bind(E.audio);
  if (unlock) E.audio.unlock = () => { if (!active) return unlock(); };
  const labels = () => ['R-Resume', 'S-Save & Quit', 'Q-Quit without saving', 'T-Settings', ...(E.slots?.enabled() ? ['L-Load'] : [])];
  function letters(ctx, value, x, y, color = '#ffffff') {
    ctx.fillStyle = color;
    for (const ch of value) {
      const glyph = E.text?.glyphs?.[ch.charCodeAt(0)];
      if (glyph) {
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++)
          if ((glyph[r] >> (7 - c)) & 1) ctx.fillRect(x + c * 2, y + r * 2, 2, 2);
      } else { ctx.font = '16px monospace'; ctx.fillText(ch, x, y + 14); }
      x += 16;
    }
  }
  E.display.overlays.push(ctx => {
    if (!active) return;
    if (page) {
      const lines = ['Settings  (arrows + Enter/Space)', ...rows.map(([name, label], i) => (name === 'veteran' ? {
        text: `${i === settingIndex ? '>' : ' '}${shortcuts[i]}-${label}`, color: i === settingIndex ? UI.key : UI.text,
      } : {
        text: `${i === settingIndex ? '>' : ' '}${shortcuts[i]}-${label}: ${name === 'classic' ? (E.settings?.classic ? 'ON' : 'OFF') : (E.settings?.on(name) ? 'ON' : 'OFF')}${name === 'classic' && E.settings?.forcedClassic ? ' (forced)' : ''}`,
        color: name !== 'classic' && E.settings?.classic ? UI.dim : i === settingIndex ? UI.key : UI.text,
      })), 'Esc/B-Back'];
      drawPanel(ctx, E, 16, 16, lines, { scale: 2, width: 36 });
      if (confirmVeteran) drawPanel(ctx, E, 48, 160, ['Replace the current game with the', 'veteran crew? (Y/N)'], { scale: 2, width: 33 });
      return;
    }
    ctx.save(); ctx.fillStyle = '#000000'; ctx.fillRect(48, 96, 544, E.slots?.enabled() ? 288 : 248);
    ctx.strokeStyle = '#55ffff'; ctx.strokeRect(49, 97, 542, E.slots?.enabled() ? 286 : 246);
    if (quitting === 'closed') letters(ctx, 'You can close this window.', 96, 192);
    else {
      labels().forEach((s, i) => {
        if (selected === i) { ctx.fillStyle = '#0000aa'; ctx.fillRect(64, 120 + i * 40, 512, 32); }
        letters(ctx, s, 80, 128 + i * 40);
      });
      ctx.save(); ctx.translate(64, E.slots?.enabled() ? 352 : 312);
      ctx.scale(Math.min(1, 512 / (note.length * 16)), 1);
      letters(ctx, note, 0, 0, '#ffff55'); ctx.restore();
    }
    ctx.restore();
  });
  function resume() {
    if (quitting) return;
    active = false; E.input.modal = null;
    wallPaused += performance.now() - wallAt;
    if (clock) elapsed += clock() - pausedAt;
    if (audioWasRunning) E.audio.ctx?.resume()?.catch?.(() => {});
    release?.(); E.fb.dirty = true; E.display.present?.(true);
  }
  async function quit(save, slotName) {
    if (quitting) return;
    quitting = true;
    try {
      if (save) {
        if (slotName !== undefined) slotName = validateSlotName(slotName);
        const starport = E.currentModule === 'STARPORT';
        const live = starport && menuWaiting && mainMenu(true);
        let point = live ? captureSave(E) : starport ? (menuPoint ?? entryPoint) : checkpoint;
        if (!point) {
          const disk = await E.files.bload('CHARINFO.BAS');
          point = { body: disk.body, header: disk, names: await E.data.charName(),
            logbook: journal.has('LOGBOOK') ? journal.get('LOGBOOK') : E.files.saved('LOGBOOK')?.slice() ?? null };
        }
        if (live) {
          const lock = E.state.G[2265];
          try { E.state.G[2265] = 0; E.state.save(); }
          finally { E.state.G[2265] = lock; }
        } else E.files.bsave('CHARINFO.BAS', point.body, point.header.seg, point.header.off);
        E.data.writeText('CHARNAME', point.names.map(n => `${n ?? ''},`).join(''));
        if (!starport) for (const [n, bytes] of journal) {
          if (bytes) write(n, bytes);
          else forgetFile(E.files, n);
        }
        if (point.logbook) write('LOGBOOK', point.logbook);
        else forgetFile(E.files, 'LOGBOOK');
        if (slotName) await E.slots.save(slotName);
      }
      globalThis.window?.close();
      setTimeout(() => { quitting = 'closed'; E.fb.cls(); E.display.present?.(true); }, 300);
    } catch (error) { quitting = false; note = 'Save failed; R to resume'; console.error(error); throw error; }
  }
  function choose(i) {
    if (i === 4) { if (E.slots?.enabled()) E.slots.openLoad(); }
    else if (i === 3) { page = true; settingIndex = 0; }
    else if (i === 0) resume();
    else if (i === 1 && E.slots?.enabled()) E.slots.openSave(name => quit(true, name));
    else void quit(i === 1).catch(() => {});
  }
  function key(k) {
    if (quitting) return;
    const upper = k.toUpperCase();
    if (page && confirmVeteran) {
      if (upper === 'Y') void loadVeteran();
      else if (upper === 'N' || k === KEY.ESC || upper === 'B') confirmVeteran = false;
      return;
    }
    if (page) {
      if (k === KEY.ESC || upper === 'B') page = false;
      else if (k === KEY.UP || k === KEY.LEFT) settingIndex = (settingIndex + rows.length - 1) % rows.length;
      else if (k === KEY.DOWN || k === KEY.RIGHT) settingIndex = (settingIndex + 1) % rows.length;
      else if (k === KEY.ENTER || k === KEY.SPACE) toggle();
      else if (upper.length === 1 && shortcuts.includes(upper)) { settingIndex = shortcuts.indexOf(upper); toggle(); }
      return;
    }
    if (k === KEY.ESC || upper === 'R' || upper === 'B') resume();
    else if (upper === 'S') choose(1);
    else if (upper === 'Q') choose(2);
    else if (upper === 'T') choose(3);
    else if (upper === 'L') choose(4);
    else if (k === KEY.UP || k === KEY.LEFT) selected = (selected + labels().length - 1) % labels().length;
    else if (k === KEY.DOWN || k === KEY.RIGHT) selected = (selected + 1) % labels().length;
    else if ((k === KEY.ENTER || k === KEY.SPACE)) choose(selected);
  }
  E.input.onDeviceEscape = () => {
    if (active) return;
    frozenTimer = E.timer?.now?.() ?? 0;
    wallAt = performance.now();
    active = true; page = false; confirmVeteran = false; selected = 0; gate = new Promise(r => { release = r; });
    pausedAt = clock?.() ?? 0;
    audioWasRunning = E.audio?.ctx?.state === 'running';
    if (audioWasRunning) E.audio.ctx.suspend()?.catch?.(() => {});
    note = E.currentModule === 'STARPORT' ?
      (menuWaiting && mainMenu(true) ? 'Save current starport state' : menuPoint ?
        'Saved as of the starport main menu' : 'Saved as of arrival at the starport') :
      checkpoint ? 'Saved as of starport departure' : 'Saved as of last disk save';
    E.input.modal = E.escape.modal = { key, click(x, y) {
      if (page && !quitting) {
        if (confirmVeteran) return;
        if (x >= 8 && x < 304) {
          const i = Math.floor((y - 22) / 10);
          if (i >= 0 && i < rows.length) { settingIndex = i; toggle(); }
          else if (i === rows.length) page = false;
        }
        return;
      }
      if (!quitting && x >= 32 && x < 288) {
        const i = Math.floor((y - 60) / 20);
        if (i >= 0 && i < labels().length && y < 76 + i * 20) { selected = i; choose(i); }
      }
    } };
  };
  E.escape = { resume, modal: null, restart() {
    checkpoint = undefined; journal.clear(); menuPoint = entryPoint = undefined;
    E.input.flush(); restartPending = true; resume();
  } };
  installSlots(E);
  if (currentModule === 'STARPORT' && E.slots.enabled()) enterStarport();
}
