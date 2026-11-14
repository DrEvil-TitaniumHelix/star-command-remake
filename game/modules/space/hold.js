const now = () => performance.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const HOLD_MS = 1500;
export function mark(rt, items) {
  if (items.some((s) => typeof s === 'string' && /[a-z]{2}/i.test(s))) { rt.msgAt = now(); rt.msgV = 0; }
}
export async function held(rt, ms, delay) {
  const t = now();
  if (rt.msgAt && rt.msgV && t - rt.msgEnd > 100) rt.msgAt = 0;
  if (!rt.msgAt) return delay();
  rt.msgV = (rt.msgV || t) + ms;
  const w = Math.max(rt.msgV, rt.msgAt + HOLD_MS) - t;
  if (w >= ms) { await sleep(w - ms); await delay(); } else if (w > 0) await sleep(w);
  rt.msgEnd = now();
}
