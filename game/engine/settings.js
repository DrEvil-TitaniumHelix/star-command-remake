// settings.js — one switch per post-v1 addition (the owner 2026-10-16: every feature toggleable in the Esc overlay,
// plus a Classic mode master switch that turns all of them off = the faithful game). v1.2/v1.3 features ask
// `E.settings.on(name)` at the moment they act; the v1.3 Settings page in overlay.js lists FEATURES and calls set().
// Stored per player in localStorage (try/catch: private windows, blocked storage); `?classic=1` forces Classic.
export const FEATURES = {
  mouse: 'Mouse control',                   // v1.1 pointer.js
  noChallenge: 'Skip rule-book question',   // v1.1 STARPORT bypass (off = the original challenge)
  controlOverlay: 'Control overlay (F1)',   // v1.2 help.js
  mapZoom: 'Map zoom',                      // v1.2 zoom.js
  enemyTooltips: 'Enemy tooltips',
  rangeOverlay: 'Range overlay',
  hitPreview: 'Hit-chance preview',
  crewPanel: 'Crew status panel',
  logBook: 'Log book',
  saveSlots: 'Named save slots',
  manual: 'Manual on demand',
  speed: 'Speed toggle',
  missionMarker: 'Mission-target marker',
  itemTooltips: 'Item tooltips',            // v1.2 tooltip.js
};
const KEY = 'starcommand:settings';

export class Settings {
  constructor({ classic = false, storage } = {}) {
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; } catch { /* blocked getter */ }
    this.values = {};
    try { Object.assign(this.values, JSON.parse(this.storage?.getItem(KEY) ?? '{}') ?? {}); } catch { /* no storage */ }
    this.forcedClassic = classic;
  }
  get classic() { return this.forcedClassic || !!this.values.classic; }
  // a feature is on unless Classic mode is on or the player switched it off (default: on)
  on(name) { return !this.classic && this.values[name] !== false; }
  set(name, value) {
    if (name === 'classic' && this.forcedClassic) return;
    this.values[name] = !!value;
    try { this.storage?.setItem(KEY, JSON.stringify(this.values)); } catch { /* no storage */ }
  }
}
