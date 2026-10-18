// Presentation-only map zoom; existing pointer regions take priority on LMB.
export const ZOOM_STEPS = Object.freeze([1, 1.5, 2, 3, 4]);

export function anchoredView(view, x, y, scale) {
  return { scale, ox: x - (x - view.ox) * view.scale / scale,
    oy: y - (y - view.oy) * view.scale / scale };
}

export function installZoom(E, canvas) {
  if (E.zoom) return E.zoom;
  const display = E.display;
  let module = E.currentModule;
  const reset = () => {
    if (display.view.scale !== 1 || display.view.ox || display.view.oy) display.setView(1, 0, 0);
  };
  const active = () => !!E.settings?.on('mapZoom') && !E.input.modal &&
    !!E.pointer?.regions().some(r => r.kind === 'map');
  const sync = () => {
    if (module !== E.currentModule || !active()) reset();
    module = E.currentModule;
  };
  const zoomAt = (lx, ly, step) => {
    sync();
    if (!active() || !Number.isFinite(lx) || !Number.isFinite(ly) || !Number.isFinite(step)) return;
    const index = ZOOM_STEPS.indexOf(display.view.scale);
    const next = Math.max(0, Math.min(ZOOM_STEPS.length - 1, index + Math.sign(step)));
    if (next === index) return;
    const v = anchoredView(display.view, lx, ly, ZOOM_STEPS[next]);
    display.setView(v.scale, v.ox, v.oy);
  };
  E.zoom = { get level() { return display.view.scale; }, reset, zoomAt };
  display.frameHooks.push(sync);
  // SCREEN calls fb.cls too; reset synchronously before either kind of clear is presented.
  const cls = E.fb.cls;
  E.fb.cls = function(...args) { reset(); return cls.apply(this, args); };
  const chain = E.chain;
  if (chain) E.chain = function(...args) { reset(); return chain.apply(this, args); };
  const point = e => {
    const r = canvas.getBoundingClientRect();
    return display.viewToLogical((e.clientX-r.left)*640/r.width, (e.clientY-r.top)*400/r.height);
  };
  // Capture runs before pointer.js so a stale map view cannot affect a new screen's click.
  canvas.addEventListener('click', e => {
    sync();
    if ((e.button !== undefined && e.button !== 0) || !active()) return;
    const p = point(e);
    if (E.pointer.regions().some(r => p.x >= r.x && p.y >= r.y &&
      p.x < r.x+r.w && p.y < r.y+r.h)) return;
    // Stop propagation before changing the transform: pointer.js must not hit
    // a different logical point under the newly zoomed view for this click.
    e.preventDefault();
    e.stopImmediatePropagation();
    zoomAt(p.x, p.y, 1);
  }, true);
  canvas.addEventListener('wheel', e => {
    sync();
    if (!active()) return;
    e.preventDefault();
    const p = point(e);
    zoomAt(p.x, p.y, -Math.sign(e.deltaY));
  }, { passive: false });
  canvas.addEventListener('contextmenu', e => {
    sync();
    if (active()) e.preventDefault();
  });
  canvas.addEventListener('mousedown', e => {
    sync();
    if (e.button !== 2 || !active()) return;
    e.preventDefault();
    const p = point(e);
    zoomAt(p.x, p.y, -1);
  });
  return E.zoom;
}
