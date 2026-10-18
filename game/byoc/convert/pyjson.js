// pyjson.js — Python's json.dumps output in JS, so the browser conversion writes the same bytes as the Python tools
// (tools/convert_data.py, tools/items.py, tools/build_atlas.py) did for the committed game/assets.
//
//   dumps(obj, { indent = null, separators, ensureAscii = true })     = json.dumps(obj, indent=, separators=, ensure_ascii=)
//   new PyFloat(v)   a Python float whose value is integral (prints `120.0`); plain JS numbers print like Python ints
//                    when integral and like Python floats otherwise (repr: shortest round trip, `1e-05`, `1.5e+16`)

export class PyFloat {
  constructor(v) { this.v = v; }
  valueOf() { return this.v; }
}

export const num = (x) => (x instanceof PyFloat ? x.v : x);

// float.__repr__ (CPython 'r' format): shortest digits; exponent form when the decimal exponent < -4 or >= 16
export function floatRepr(x) {
  if (Number.isNaN(x)) return 'NaN';
  if (x === Infinity) return 'Infinity';
  if (x === -Infinity) return '-Infinity';
  if (x === 0) return Object.is(x, -0) ? '-0.0' : '0.0';
  const [m, e] = x.toExponential().split('e');   // shortest round-trip digits
  const neg = m.startsWith('-');
  const digits = m.replace(/^-/, '').replace('.', '');
  const exp = Number(e);
  let s;
  if (exp < -4 || exp >= 16) {
    s = digits[0] + (digits.length > 1 ? `.${digits.slice(1)}` : '') + 'e' + (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(2, '0');
  } else if (exp < 0) {
    s = `0.${'0'.repeat(-exp - 1)}${digits}`;
  } else if (digits.length > exp + 1) {
    s = `${digits.slice(0, exp + 1)}.${digits.slice(exp + 1)}`;
  } else {
    s = `${digits}${'0'.repeat(exp + 1 - digits.length)}.0`;
  }
  return neg ? `-${s}` : s;
}

function numberText(x) {
  if (x instanceof PyFloat) return floatRepr(x.v);
  if (Number.isInteger(x)) return Math.abs(x) < 2 ** 53 ? String(x === 0 ? 0 : x) : BigInt(x).toString();
  return floatRepr(x);
}

function stringText(s, ensureAscii) {
  const t = JSON.stringify(s);   // same escapes as Python: \" \\ \b \f \n \r \t, other C0 as \u00xx (lower-case)
  return ensureAscii ? t.replace(/[\u0080-￿]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`) : t;
}

export function dumps(obj, { indent = null, separators = null, ensureAscii = true } = {}) {
  const [itemSep, keySep] = separators ?? (indent === null ? [', ', ': '] : [',', ': ']);
  const pad = typeof indent === 'number' ? ' '.repeat(indent) : indent;
  const enc = (v, level) => {
    if (v === null || v === undefined) return 'null';
    if (v === true) return 'true';
    if (v === false) return 'false';
    if (typeof v === 'number' || v instanceof PyFloat) return numberText(v);
    if (typeof v === 'string') return stringText(v, ensureAscii);
    const isArr = Array.isArray(v) || ArrayBuffer.isView(v);
    const parts = isArr ? Array.from(v, (x) => enc(x, level + 1))
      : Object.entries(v).map(([k, x]) => stringText(k, ensureAscii) + keySep + enc(x, level + 1));
    const [open, close] = isArr ? ['[', ']'] : ['{', '}'];
    if (!parts.length) return open + close;
    if (pad === null) return open + parts.join(itemSep) + close;
    const nl = `\n${pad.repeat(level + 1)}`;
    return open + nl + parts.join(itemSep + nl) + `\n${pad.repeat(level)}` + close;
  };
  return enc(obj, 0);
}

// UTF-8 bytes of a string (what Python's open(..., encoding='utf-8') writes)
export const utf8 = (s) => new TextEncoder().encode(s);
