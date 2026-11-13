import { drawPanel } from './ui.js';

const modules = new Set(['STARPORT', 'SPACE', 'INSIDE', 'PLBATTLE']);
const limits = { STARPORT: { 'squad weapons': [38, 30], guns: [28], shields: [18], 'misc items': [38, 18] },
  SPACE: { 'misc items': [16] }, INSIDE: { 'misc items': [23] }, PLBATTLE: { 'squad weapons': [31] } };

function regions(E, items) {
  const mod = E.currentModule;
  if (!modules.has(mod)) return [];
  const rows = E.text.screenText(), out = [];
  const screen = rows.join('\n');
  const allowed = (item) => {
    if (item.group === 'crew pay') return false;
    if (mod === 'PLBATTLE') return item.group === 'squad weapons' && /Is Using:|SPACE to change weapon/.test(screen);
    if (mod === 'SPACE' || mod === 'INSIDE') return /EQUIPING|Rank:|Class:|Status Report|Ships Guns|Rlds|Weapons|Hand Weapon|Armor|Sighting/.test(screen);
    return /Select A|Price:|[Aa]mmo for which gun|Arsenal|Returns Department|Class |Rank:|Status Report|Ships Guns|Rlds|Weapons|Hand Weapon|Armor|Sighting/.test(screen);
  };
  for (let r = 0; r < rows.length; r++) {
    for (const item of items.filter(allowed)) {
      const sellLimits = mod === 'STARPORT' && /Select item to sell/.test(screen) ? [33, 36] : [];
      const variants = [item.name, ...[...(limits[mod]?.[item.group] ?? []), ...sellLimits].filter(n => n < item.name.length).map(n => item.name.slice(0, n))];
      for (const name of variants) {
        const c = rows[r].indexOf(name);
        if (c < 0 || (c && /[A-Za-z]/.test(rows[r][c - 1]))) continue;
        if (/[A-Za-z]/.test(rows[r][c + name.length] ?? '')) continue;
        const selector = /^\s*(?:[A-Z0-9PCSH]+[>\-])(?:\s*[PC1-6SH])?\s*$/.test(rows[r].slice(0, c));
        out.push({ item, row: r, col: selector ? rows[r].search(/\S/) : c, end: c + name.length });
        if (mod === 'SPACE' && /EQUIPING/.test(screen) && r > 0 && /^\s*[A-K]-.*(?:Weapon|Ammo For)/.test(rows[r - 1])) {
          out.push({item,row:r-1,col:rows[r-1].search(/\S/),end:Math.max(c+name.length,rows[r-1].trimEnd().length)});
        }
        break;
      }
    }
  }
  if (E.state?.str && /Rank|Class|Inspect|Personnel/.test(screen)) {
    const names = E.state.str('CrewName$'), skills = E.state.str('Skill$');
    for (let m = 1; m <= 8; m++) {
      if (!names[m]) continue;
      for (let r = 0; r < rows.length; r++) {
        const name = names[m].slice(0, 9), c = rows[r].indexOf(name);
        if (c < 0 || !/^\s*[PC1-6]>/.test(rows[r])) continue;
        const g = f => Math.trunc(E.state.G[1300 + m * 100 + f] + 0.1);
        const pay = items.find(i => i.group === 'crew pay' && i.index === g(34));
        const lines = [`Class: ${['Marine','Pilot','Soldier','Esper'][g(35)] ?? 'Unknown'}`];
        if (pay) lines.push(`Monthly wage: ${pay.fields['monthly wage']}`);
        for (let f = 17; f <= 28; f++) if (g(f)) lines.push(`${skills[f - 16] || 'Skill ' + (f - 16)}: ${g(f)}`);
        out.push({item:{group:'crew',index:m,name:names[m],tip:{title:names[m],lines}},row:r,col:rows[r].search(/\S/),end:c+name.length});
      }
    }
  }
  return out;
}

function describe(item, E) {
  if (item.tip) return item.tip;
  const screen = E.text.screenText().join('\n');
  const buying = E.currentModule === 'STARPORT' && /Select A|Price:|Ammo for which gun/i.test(screen);
  const hidden = new Set(['starport purchase price', 'printed purchase price', 'starport ammo purchase price',
    'ship table weight', 'tons per armor point', 'damage type', 'skill type', 'size class']);
  const lines = Object.entries(item.fields).filter(([key]) => !key.startsWith('unknown') && !hidden.has(key))
    .map(([key, value]) => {
      let label = key;
      if (key === 'price') {
        label = buying ? 'Weapon purchase price' : 'Base price';
        if (item.group !== 'guns' && item.group !== 'squad weapons') label = buying ? 'Purchase price' : 'Base price';
        if (buying) value = item.fields['printed purchase price'] ?? item.fields['starport purchase price'];
      } else if (key === 'ammo price') {
        label = buying ? 'Ammo purchase price' : 'Ammo base price';
        if (buying) value = item.fields['starport ammo purchase price'];
      } else if (key === 'damage kind') label = 'damage type';
      else if (key === 'size class name') label = 'size class';
      return `${label}: ${typeof value === 'number' ? Number(value.toPrecision(7)) : value}`;
    });
  if (E.currentModule === 'PLBATTLE' && item.group === 'squad weapons') {
    const row = E.text.screenText().find(r => r.includes(item.name.slice(0,31)));
    const counts = row?.match(/A([0-9]) R([0-9])/);
    if (counts) lines.push(`Loaded ammo (shown): ${counts[1]}`, `Reloads (shown): ${counts[2]}`);
  }
  return { title: item.name, lines };
}

export function installTooltips(E, canvas) {
  let items = [], pointer = null;
  const at = (x, y) => {
    if (E.input.modal || !E.settings.on('itemTooltips') || !Number.isFinite(x) || !Number.isFinite(y)) return null;
    const hits = regions(E, items).filter(h => h.row === Math.floor(y / 8) && x >= h.col * 8 && x < h.end * 8);
    const unique = [...new Map(hits.map(h => [h.item.group + ':' + h.item.index, h.item])).values()];
    return unique.length === 1 ? describe(unique[0], E) : null;
  };
  E.tooltips = { at, ready: (E.data.base ? fetch(`${E.data.base}items.json`).then(r => { if (!r.ok) throw new Error(`items: HTTP ${r.status}`); return r.json(); }) : E.data.table('items')).then(data => { items = data; }).catch(error => { E.tooltips.error = String(error); }) };
  canvas.addEventListener('mousemove', ev => {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: (ev.clientX - rect.left) * 640 / rect.width, y: (ev.clientY - rect.top) * 400 / rect.height };
  });
  canvas.addEventListener('mouseleave', () => { pointer = null; });
  E.display.overlays.push(ctx => {
    if (E.input.modal || !E.settings.on('itemTooltips')) return;
    let tip, anchor;
    const h = E.input.highlight;
    if (h && E.input.lastDevice === 'gamepad') {
      const hit = regions(E, items).find(it => it.row === h.row - 1 && it.col < h.col - 1 + h.len && it.end > h.col - 1);
      if (hit) { tip = at(hit.end * 8 - 1, hit.row * 8); anchor = { x: h.col * 16, y: h.row * 16 }; }
    } else if (pointer) { const p = E.display.viewToLogical(pointer.x, pointer.y); tip = at(p.x, p.y); anchor = pointer; }
    if (tip) drawPanel(ctx, E, anchor.x + 12, anchor.y + 12, [tip.title, ...tip.lines], { scale: 1 });
  });
}
