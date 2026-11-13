export const FEATURES = {
  mouse: 'Mouse control',
  noChallenge: 'Skip rule-book question',
  controlOverlay: 'Control overlay (F1)',
  mapZoom: 'Map zoom',
  enemyTooltips: 'Enemy tooltips',
  rangeOverlay: 'Range overlay',
  hitPreview: 'Hit-chance preview',
  crewPanel: 'Crew status panel',
  logBook: 'Log book',
  saveSlots: 'Named save slots',
  manual: 'Manual on demand',
  speed: 'Speed toggle',
  missionMarker: 'Mission-target marker',
  itemTooltips: 'Item tooltips',
};
const KEY = 'starcommand:settings';

export class Settings {
  constructor({ classic = false, storage } = {}) {
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; } catch {   }
    this.values = {};
    try { Object.assign(this.values, JSON.parse(this.storage?.getItem(KEY) ?? '{}') ?? {}); } catch {   }
    this.forcedClassic = classic;
  }
  get classic() { return this.forcedClassic || !!this.values.classic; }
  on(name) { return !this.classic && this.values[name] !== false; }
  set(name, value) {
    if (name === 'classic' && this.forcedClassic) return;
    this.values[name] = !!value;
    try { this.storage?.setItem(KEY, JSON.stringify(this.values)); } catch {   }
  }
}
