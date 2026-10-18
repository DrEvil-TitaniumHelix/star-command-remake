// ui.js — the one panel style for the post-v1 overlays (v1.2 control overlay, tooltips; same look as the v1.1
// Esc overlay): black box, cyan frame, text in the game's own 8x8 EGA font at 2x, EGA colours. Draws on the
// 640x400 canvas context in display.overlays, never into the framebuffer (acceptance shots unaffected).
export const UI = {
  bg: '#000000', frame: '#55ffff', text: '#ffffff', key: '#ffff55', dim: '#aaaaaa', select: '#0000aa',
  cell: 16,          // one 8x8 glyph drawn at 2x
  pad: 8,
};

// draw a string with the engine font (E.text.glyphs); returns the x after the last glyph
export function drawText(ctx, E, s, x, y, color = UI.text, scale = 2) {
  ctx.fillStyle = color;
  for (const ch of String(s)) {
    const g = E.text?.glyphs?.[ch.charCodeAt(0)];
    if (g) {
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((g[r] >> (7 - c)) & 1) ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
    } else { ctx.font = `${8 * scale}px monospace`; ctx.fillText(ch, x, y + 7 * scale); }
    x += 8 * scale;
  }
  return x;
}

// lines: [string | {text, color} | [{text, color}, ...]] -> a framed box at (x, y) (canvas px), clamped into
// the 640x400 canvas; returns its rectangle. scale 1 = 8 px glyphs (dense tooltips), 2 = 16 px (default).
export function drawPanel(ctx, E, x, y, lines, { scale = 2, width } = {}) {
  const segs = lines.map((l) => (Array.isArray(l) ? l : [typeof l === 'string' ? { text: l } : l]));
  const cols = width ?? Math.max(1, ...segs.map((s) => s.reduce((n, p) => n + String(p.text).length, 0)));
  const w = cols * 8 * scale + 2 * UI.pad, h = segs.length * 10 * scale + 2 * UI.pad - 2 * scale;
  x = Math.max(0, Math.min(x, 640 - w)); y = Math.max(0, Math.min(y, 400 - h));
  ctx.save();
  ctx.fillStyle = UI.bg; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = UI.frame; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  segs.forEach((s, i) => {
    let cx = x + UI.pad;
    for (const p of s) cx = drawText(ctx, E, p.text, cx, y + UI.pad + i * 10 * scale, p.color ?? UI.text, scale);
  });
  ctx.restore();
  return { x, y, w, h };
}
