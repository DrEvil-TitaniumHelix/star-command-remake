export const FEATURES = {
  mouse: 'Mouse control',
  noChallenge: 'Skip rule-book question',
  controlOverlay: 'Help button (?) and gamepad Back',
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
  squadMarker: 'Bright squad marker',
  hints: 'Hints',
};
export const AUDIO = { sound: 'Sound', music: 'Music', effects: 'Sound effects' };
const KEY = 'starcommand:settings';

export class Settings {
  constructor({ storage } = {}) {
    try { this.storage = storage === undefined ? globalThis.localStorage : storage; } catch {   }
    this.values = {};
    try { Object.assign(this.values, JSON.parse(this.storage?.getItem(KEY) ?? '{}') ?? {}); } catch {   }
    const names = Object.keys(this.values);
    for (const name of names) if (!Object.hasOwn(FEATURES, name) && !Object.hasOwn(AUDIO, name)) delete this.values[name];
    if (Object.keys(this.values).length !== names.length) try { this.storage?.setItem(KEY, JSON.stringify(this.values)); } catch {   }
  }
  hear(kind) { return this.values.sound !== false && this.values[kind] !== false; }
  on(name) { return this.values[name] !== false; }
  set(name, value) {
    if (!Object.hasOwn(FEATURES, name) && !Object.hasOwn(AUDIO, name)) return;
    this.values[name] = !!value;
    try { this.storage?.setItem(KEY, JSON.stringify(this.values)); } catch {   }
  }
}
