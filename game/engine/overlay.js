import { installSlots, forgetFile, validateSlotName } from './slots.js';
import { installSettingsPanel } from './settings-panel.js';
import { KEY } from './input.js';
import { ChainSignal } from './chain.js';
import { dosName, Files } from './files.js';
import { charNameText } from './data.js';
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
      get: () => protectionOverride ?? !E.settings.on('noChallenge'),
      set: value => { protectionOverride = !!value; } });
  }
  let restartPending = false;
  const checkRestart = () => {
    if (restartPending) { restartPending = false; throw new ChainSignal('STARCOMM'); }
  };
  installSettingsPanel(E, name => { if (name === 'noChallenge') protectionOverride = undefined; });
  let active = false, quitting = false, dead = false, selected = 0, note = '', checkpoint, priorModal, ask = null, failAt = -1e9;
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
    if (active) return '';
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
  const FAIL = 'Could not save: the browser storage is full or blocked.';
  E.files.onWriteFail = () => { failAt = performance.now(); E.display.present?.(true); };
  const lose = () => {
    if (['STARCOMM', 'STARTUP'].includes(E.currentModule)) return false;
    const d = E.files.saved('CHARINFO.BAS');
    if (!d) return true;
    const a = Files.parseBsave(d).body, b = E.state.toBytes();
    return a.length !== b.length || a.some((x, i) => x !== b[i]);
  };
  const wrap = t => t.split(' ').reduce((l, w) => {
    if (l.length && (l[l.length - 1] + ' ' + w).length <= 32) l[l.length - 1] += ' ' + w; else l.push(w);
    return l;
  }, []);
  const labels = () => ['R-Resume', ...(!dead ? ['S-Save & Quit'] : []), 'Q-Quit without saving', 'T-Settings', ...(E.slots?.enabled() ? ['L-Load'] : [])];
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
    if (!active && performance.now() - failAt < 5000) {
      ctx.save(); ctx.fillStyle = '#000000'; ctx.fillRect(48, 8, 544, 48);
      wrap(FAIL).forEach((s, i) => letters(ctx, s, 64, 14 + i * 18, '#ffff55')); ctx.restore();
    }
    if (!active) return;
    ctx.save(); ctx.fillStyle = '#000000'; ctx.fillRect(48, 96, 544, labels().length * 40 + 88);
    ctx.strokeStyle = '#55ffff'; ctx.strokeRect(49, 97, 542, labels().length * 40 + 86);
    if (quitting === 'closed') {
      letters(ctx, 'You can close this window.', 96, 192);
      letters(ctx, 'Enter - play again', 96, 232);
    } else if (ask) ask.lines.forEach((s, i) => letters(ctx, s, 80, 160 + i * 24));
    else {
      labels().forEach((s, i) => {
        if (selected === i) { ctx.fillStyle = '#0000aa'; ctx.fillRect(64, 120 + i * 40, 512, 32); }
        letters(ctx, s, 80, 128 + i * 40);
      });
      ctx.save(); ctx.translate(64, labels().length * 40 + 152);
      const ls = wrap(note);
      ls.forEach((s, i) => letters(ctx, s, 0, (i + 1 - ls.length) * 18, '#ffff55')); ctx.restore();
    }
    ctx.restore();
  });
  function resume() {
    if (quitting) return;
    active = false; E.input.modal = priorModal ?? null;
    wallPaused += performance.now() - wallAt;
    if (clock) elapsed += clock() - pausedAt;
    if (audioWasRunning) E.audio.ctx?.resume()?.catch?.(() => {});
    release?.(); E.fb.dirty = true; E.display.present?.(true);
  }
  async function quit(save, slotName) {
    if (quitting) return;
    quitting = true;
    E.files.writeError = null;
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
        E.data.writeText('CHARNAME', charNameText(point.names));
        if (!starport) for (const [n, bytes] of journal) {
          if (bytes) write(n, bytes);
          else forgetFile(E.files, n);
        }
        if (point.logbook) write('LOGBOOK', point.logbook);
        else forgetFile(E.files, 'LOGBOOK');
        if (E.files.writeError) throw E.files.writeError;
        if (slotName) await E.slots.save(slotName);
      }
      globalThis.window?.close();
      setTimeout(() => { quitting = 'closed'; E.fb.cls(); E.display.present?.(true); }, 300);
    } catch (error) { quitting = false; failAt = -1e9; note = FAIL; console.error(error); throw error; }
  }
  const confirm = (lines, yes) => { if (lose()) ask = { lines, yes }; else yes(); };
  function choose(i) {
    if (i === 'L') { if (E.slots?.enabled()) confirm(['Loading replaces the', 'game in progress.', 'Load anyway? (Y/N)'], () => E.slots.openLoad()); }
    else if (i === 'T') { resume(); if (!E.plus?.open('settings')) E.settingsPanel?.open('settings'); }
    else if (i === 'R') resume();
    else if (i === 'S') {
      if (dead) return;
      const go = () => E.slots?.enabled() ? E.slots.openSave(name => quit(true, name)) : void quit(true).catch(() => {});
      if (E.currentModule === 'STARPORT') go();
      else ask = { lines: wrap('You are away from a starport. Your game returns to your last starport save. Quit? (Y/N)'), yes: go };
    }
    else if (i === 'Q') confirm(['Quit without saving? (Y/N)'], () => void quit(false).catch(() => {}));
  }
  function key(k) {
    if (quitting === 'closed' && k === KEY.ENTER) return globalThis.location?.reload();
    if (quitting) return;
    const upper = k.toUpperCase();
    if (ask) {
      const yes = ask.yes;
      if (upper === 'Y') { ask = null; yes(); } else if (upper === 'N' || k === KEY.ESC) ask = null;
      return;
    }
    if (k === KEY.ESC || upper === 'R' || upper === 'B') resume();
    else if (upper === 'S') choose('S');
    else if (upper === 'Q') choose('Q');
    else if (upper === 'T') choose('T');
    else if (upper === 'L') choose('L');
    else if (k === KEY.UP || k === KEY.LEFT) selected = (selected + labels().length - 1) % labels().length;
    else if (k === KEY.DOWN || k === KEY.RIGHT) selected = (selected + 1) % labels().length;
    else if ((k === KEY.ENTER || k === KEY.SPACE)) choose(labels()[selected][0]);
  }
  E.input.onDeviceEscape = () => {
    if (active) return;
    if (E.help?.isOpen?.()) return E.help.close();
    if (E.settingsPanel?.isOpen()) return E.settingsPanel.close();
    frozenTimer = E.timer?.now?.() ?? 0;
    wallAt = performance.now();
    priorModal = E.input.modal;
    dead = /\bYou\s+Are\s+All\s+Dead\b/i.test(E.text?.screenText?.().join('\n') ?? '');
    active = true; selected = 0; ask = null; gate = new Promise(r => { release = r; });
    pausedAt = clock?.() ?? 0;
    audioWasRunning = E.audio?.ctx?.state === 'running';
    if (audioWasRunning) E.audio.ctx.suspend()?.catch?.(() => {});
    note = dead ? '' : E.currentModule === 'STARPORT' ?
      (menuWaiting && mainMenu(true) ? 'Save current starport state' : menuPoint ?
        'Saved as of the starport main menu' : 'Saved as of arrival at the starport') :
      checkpoint ? 'Saved as of starport departure' : 'Saved as of your last save';
    E.input.modal = E.escape.modal = { key, click(x, y) {
      if (!quitting && !ask && x >= 32 && x < 288) {
        const i = Math.floor((y - 60) / 20);
        if (i >= 0 && i < labels().length && y < 76 + i * 20) { selected = i; choose(labels()[i][0]); }
      }
    } };
  };
  const device = E.input.device.bind(E.input);
  E.input.device = (k, ...args) => {
    if (k === KEY.ESC && !active) return E.input.onDeviceEscape();
    return device(k, ...args);
  };
  E.escape = { resume, modal: null, restart() {
    checkpoint = undefined; journal.clear(); menuPoint = entryPoint = undefined;
    priorModal = null;
    E.input.flush(); restartPending = true; resume();
  } };
  installSlots(E);
  if (currentModule === 'STARPORT' && E.slots.enabled()) enterStarport();
}
