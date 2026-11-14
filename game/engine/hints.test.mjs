import assert from 'node:assert/strict';
import { installHints, hintText, BASE, ANY, OLD } from './hints.js';
import { Settings } from './settings.js';

const blank = Array(25).fill(' '.repeat(80));
assert.equal(hintText('SPACE', ['Ship Computer'], true), BASE);
assert.equal(hintText('STARCOMM', blank, true), `${BASE}     ${ANY}`);
assert.equal(hintText('STARCOMM', blank, false), BASE);
assert.equal(hintText('SPACE', blank, true), BASE);
assert.equal(hintText('STARCOMM', ['3-One Floppy Disk Drive', '5-Enhanced Graphics Adaptor'], true), `${BASE}     ${OLD}`);
{
  let t = 0, screen = blank, bottom = 400;
  const m = new Map(), settings = new Settings({ storage: { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) } });
  const click = { hidden: true, style: {} }, msg = { textContent: '' }, el = { style: {} };
  const win = { innerHeight: 440, document: { getElementById: id => ({ 'click-hint': click, msg })[id] } };
  const hooks = [], E = { settings, currentModule: 'STARCOMM', fb: { version: 0 }, input: { inkey: () => '' },
    text: { screenText: () => screen }, display: { frameHooks: hooks, canvas: { getBoundingClientRect: () => ({ bottom }) } } };
  installHints(E, el, win, () => t);
  assert.equal(el.textContent, BASE); assert.equal(el.hidden, false); assert.equal(el.style.top, '402px');
  E.input.inkey(); hooks[0]();
  assert.equal(el.textContent, `${BASE}     ${ANY}`);
  t = 5000; hooks[0](); assert.equal(el.textContent, BASE);
  click.hidden = false; hooks[0](); assert.equal(el.hidden, true); assert.equal(click.style.top, '402px'); click.hidden = true;
  settings.set('hints', false); hooks[0](); assert.equal(el.hidden, true); settings.set('hints', true);
  bottom = 440; screen = [...blank.slice(0, 24), 'Press ENTER Key']; E.fb.version++; hooks[0]();
  assert.equal(el.hidden, true, 'no margin and a bottom prompt: hidden');
  screen = blank; E.fb.version++; hooks[0](); assert.equal(el.hidden, false); assert.equal(el.style.top, '424px');
  assert.equal(new Settings({ storage: null }).on('hints'), true, 'on by default');
}
console.log('hints: margin line text, title any-key, start-menu note, click hint place, setting, overlap passed');
{
  const { BACK, SAVED } = await import('./hints.js');
  assert.equal(hintText('STARPORT', ['       Arsenal', 'A-Buy Personal Equipment', 'Select Option'], false), `${BASE}     ${BACK}`);
  assert.equal(hintText('STARPORT', ['Who Will Buy?'], false), `${BASE}     ${BACK}`);
  assert.equal(hintText('STARPORT', ['Main Menu', 'Select Option'], false), BASE, 'main menu has no back');
  assert.equal(hintText('STARPORT', ['B-Buy the Ship, ENTER to Exit'], false), BASE, 'screen already names Enter');
  assert.equal(hintText('STARPORT', ['Quit the game? (Y/N)'], false), `${BASE}     ${SAVED}`);
  let t = 0; const G = new Float32Array(2601); G[79] = 5000;
  const el = { style: {} }, hooks = [], E = { currentModule: 'STARPORT', state: { G }, fb: { version: 0 }, input: { inkey: () => '' },
    text: { screenText: () => ['Select A Weapon'] }, display: { frameHooks: hooks } };
  installHints(E, el, { innerHeight: 440, document: { getElementById: () => null } }, () => t);
  G[79] = 3800; hooks[0](); assert.match(el.textContent, /Paid 1,200 credits, 3,800 left/);
  t = 4000; hooks[0](); assert.doesNotMatch(el.textContent, /Paid/);
  E.currentModule = 'SPACE'; G[79] = 100; hooks[0](); assert.doesNotMatch(el.textContent, /Paid/);
}
console.log('hints: sub-menu Enter - Back, game saved, paid note passed');
