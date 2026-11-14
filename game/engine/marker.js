import { MAP_PROVIDERS } from './pointer.js';

export function missionTargets(G) {
  if (!Array.from(G.slice(110, 160)).some(v => v === 1)) return [];
  return [[2238, 2239, 2240], [2243, 2244, 2236]].filter(([, , code]) => G[code] !== 0)
    .map(([x, y]) => ({ x: G[x], y: G[y] }))
    .filter(p => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < 32 && p.y < 32);
}

export function markerCells(G, title) {
  const targets = missionTargets(G);
  if (title === 0) return targets.map(p => ({ x: p.x * 3 + 37, y: p.y * 3 + 37, size: 3 }));
  if (title !== 1) return [];
  const bx = Math.floor(G[2216] / 8) * 8, by = Math.floor(G[2217] / 8) * 8;
  return targets.filter(p => Math.floor(p.x / 8) * 8 === bx && Math.floor(p.y / 8) * 8 === by)
    .map(p => ({ x: (p.x - bx) * 16 + 16, y: (p.y - by) * 16 + 16, size: 16 }));
}

export function installMarker(E) {
  if (E.missionMarker) return E.missionMarker;
  let title = null;
  const put = E.sprites.put, cls = E.fb.cls;
  E.fb.cls = function(...args) { title = null; return cls.apply(this, args); };
  E.sprites.put = function(x, y, image, ...args) {
    if (E.currentModule === 'SPACE' && x === 32 && y === 0) title = /SPACESH(?:\.BAS)?$/i.test(image.bank ?? '') ? image.index : null;
    return put.call(this, x, y, image, ...args);
  };
  E.missionMarker = { cells: () => E.settings?.on('missionMarker') === true && E.currentModule === 'SPACE' &&
    !E.input.modal && MAP_PROVIDERS.pictureVisible(E, { x: 16, y: 16, w: 128, h: 128 })
    ? markerCells(E.state.G, title) : [] };
  E.display.overlays.push(ctx => {
    const cells = E.missionMarker.cells();
    if (!cells.length) return;
    ctx.save();
    ctx.strokeStyle = '#ffff55'; ctx.lineWidth = 1;
    for (const p of cells) ctx.strokeRect(p.x * 2 + 1, p.y * 2 + 1, p.size * 2 - 2, p.size * 2 - 2);
    ctx.restore();
  });
  return E.missionMarker;
}
