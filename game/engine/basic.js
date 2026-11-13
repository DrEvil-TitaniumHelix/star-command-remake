const f32 = Math.fround;


const FOUT_K = [
  46,46,46,45,45,45,44,44,44,44,43,43,43,42,42,42,41,41,41,41,40,40,40,39,39,39,38,38,38,38,37,37,37,36,36,36,35,35,35,35,
  34,34,34,33,33,33,32,32,32,32,31,31,31,30,30,30,29,29,29,28,28,28,28,27,27,27,26,26,26,25,25,25,25,24,24,24,23,23,23,22,
  22,22,22,21,21,21,20,20,20,19,19,19,19,18,18,18,17,17,17,16,16,16,16,15,15,15,14,14,14,13,13,13,13,12,12,12,11,11,11,10,
  10,10,10,9,9,9,8,8,8,7,7,7,7,6,6,6,5,5,5,4,4,4,4,3,3,3,2,2,2,1,1,1,0,0,0,0,-1,-1,-1,-2,
  -2,-2,-3,-3,-3,-3,-4,-4,-4,-5,-5,-5,-6,-6,-6,-6,-7,-7,-7,-8,-8,-8,-9,-9,-9,-9,-10,-10,-10,-11,-11,-11,-12,-12,-12,-12,-13,-13,-13,-14,
  -14,-14,-15,-15,-15,-15,-16,-16,-16,-17,-17,-17,-18,-18,-18,-18,-19,-19,-19,-20,-20,-20,-21,-21,-21,-21,-22,-22,-22,-23,-23,-23,-24,-24,-24,-24,-25,-25,-25,-26,
  -26,-26,-27,-27,-27,-27,-28,-28,-28,-29,-29,-29,-30,-30,-30,
];
const FOUT_P10 = [
  [247,16991,162,29],[245,54007,202,32],[242,34741,253,35],[183,29905,158,39],[37,4614,198,42],[174,38535,247,45],[205,48660,154,49],
  [0,28058,193,52],[128,51456,241,55],[80,7584,151,59],[100,58632,188,62],[125,7754,236,65],[142,37614,147,69],[50,30634,184,72],
  [190,38292,230,75],[247,7548,144,79],[53,9436,180,82],[66,11795,225,85],[9,48332,140,89],[11,60415,175,92],[206,59134,219,95],
  [65,28767,137,99],[17,52343,171,102],[213,49044,214,105],[5,14269,134,109],[71,50604,167,112],[88,46871,209,115],[151,4718,131,119],
  [61,55050,163,122],[204,52428,204,125],[0,0,128,129],[0,0,160,132],[0,0,200,135],[0,0,250,138],[0,16384,156,142],
  [0,20480,195,145],[0,9216,244,148],[0,38528,152,152],[0,48160,190,155],[0,27432,238,158],[0,761,149,162],[64,17335,186,165],
  [16,54437,232,168],[42,34023,145,172],[244,58912,181,175],[49,24489,227,178],[191,7113,142,182],[46,41660,177,185],[58,2923,222,188],
  [4,50979,138,192],[197,30955,173,195],[183,55078,216,198],[50,34424,135,202],[63,26646,169,205],[206,49691,211,208],[97,22865,132,212],
  [185,28581,165,215],[39,52111,206,218],[120,16185,129,222],[215,36615,161,225],[205,62153,201,228],[64,28540,252,231],[168,50605,157,235],
  [18,14105,197,238],[86,34015,246,241],[150,4875,154,245],[123,38862,192,248],[26,48578,240,251],[80,30361,150,255],[164,5183,188,130],
  [142,6479,235,133],[184,61393,146,137],[39,43974,183,140],[176,38583,229,143],[206,32306,143,147],[130,23999,179,150],[98,13615,224,153],
];
const fcvt = new Float32Array(1), ucvt = new Uint32Array(fcvt.buffer);

function foutDigits(n) {
  fcvt[0] = n;
  const bits = ucvt[0];
  const sign = bits >>> 31 ? '-' : ' ';
  const E = (bits >>> 23) & 0xFF;
  if (E === 0) return { sign: ' ', digits: '0', dx: 0 };
  if (E >= 254) throw new Error('Overflow');
  const e = E + 2, mant = (bits & 0x7FFFFF) | 0x800000;
  const k = FOUT_K[e - 1];
  const [Mlowest, Mlo, Mhi, adj] = FOUT_P10[k + 30];
  const manthi = mant >>> 16, mantlo = mant & 0xFFFF;
  const p1 = Mlo * mantlo;
  let bx = Math.floor(p1 / 65536);
  bx += Mhi * mantlo; let di = Math.floor(bx / 65536); bx %= 65536;
  bx += manthi * Mlo; di += Math.floor(bx / 65536); bx %= 65536;
  if (p1 % 65536 !== 0) bx |= 1;
  let ax = Mhi * manthi + di;
  bx += Math.floor((Mlowest * manthi) / 256); ax += Math.floor(bx / 65536); bx %= 65536;
  const full = (ax * 65536 + bx) * (1 << ((adj + e) & 7));
  let N = Math.floor(full / 256);
  const frac = full % 256;
  if (frac > 0x80 || (frac === 0x80 && N % 2 === 1)) N += 1;
  let d = String(N).split('');
  let dx = -k;
  if (d.length > 7) {
    const first = d[7];
    dx += d.length - 7;
    d.length = 7;
    if (first >= '5') {
      let i = 6;
      for (;;) {
        if (i < 0) { d = ['1']; break; }
        if (d[i] !== '9') { d[i] = String.fromCharCode(d[i].charCodeAt(0) + 1); d.length = i + 1; break; }
        dx += 1; i -= 1;
      }
    }
  }
  let end = d.length;
  while (end > 1 && d[end - 1] === '0') end -= 1;
  dx += d.length - end;
  return { sign, digits: d.slice(0, end).join(''), dx };
}

export function str$(n) {
  const { sign, digits, dx } = foutDigits(n);
  const len = digits.length;
  if (Math.abs(dx) > 7 || dx + len > 7) {
    let s = digits[0], ex = dx;
    if (len > 1) { s += '.' + digits.slice(1); ex += len - 1; }
    s += 'E' + (ex < 0 ? '-' : '+');
    const a = Math.abs(ex);
    if (a >= 100) s += String(Math.floor(a / 100));
    return sign + s + String(a % 100).padStart(2, '0');
  }
  const P = dx + len;
  if (P <= 0) return sign + '.' + '0'.repeat(-P) + digits;
  if (P >= len) return sign + digits + '0'.repeat(P - len);
  return sign + digits.slice(0, P) + '.' + digits.slice(P);
}

export const printNum = (n) => `${str$(n)} `;

export function cint(n) {
  n = f32(n);
  const v = Math.sign(n) * Math.floor(Math.abs(n) + 0.5);
  if (v < -32768 || v > 32767) throw new Error('Overflow');
  return v === 0 ? 0 : v;
}
export const int = (n) => Math.floor(f32(n));
export const fix = (n) => Math.trunc(f32(n));
export const sgn = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0);

export function val(s) {
  const m = /^[ \t]*([+-]?(\d+\.?\d*|\.\d+)([ED][+-]?\d+)?)/i.exec(s);
  return m ? f32(parseFloat(m[1].replace(/[dD]/, 'e'))) : 0;
}

export const left$ = (s, n) => s.slice(0, Math.max(0, n));
export const right$ = (s, n) => (n <= 0 ? '' : s.slice(-n));
export const mid$ = (s, start, n) => (n === undefined ? s.slice(start - 1) : s.substr(start - 1, Math.max(0, n)));
export const space$ = (n) => ' '.repeat(Math.max(0, n));
export const string$ = (n, c) => (typeof c === 'number' ? String.fromCharCode(c) : c[0]).repeat(Math.max(0, n));
export const chr$ = (n) => String.fromCharCode(n);
export const asc = (s) => (s.length ? s.charCodeAt(0) : (() => { throw new Error('Illegal function call'); })());

export function using(fmt, n) {
  n = f32(n);
  const m = /^(#+)(\.(#+))?$/.exec(fmt);
  if (!m) throw new Error(`PRINT USING format not supported: ${fmt}`);
  const intW = m[1].length, dec = m[3] ? m[3].length : 0;
  let s = Math.abs(n).toFixed(dec);
  if (n < 0 && parseFloat(s) !== 0) s = `-${s}`;
  const width = intW + (dec ? dec + 1 : 0);
  if (s.length > width) return `%${s}`;
  return s.padStart(width, ' ');
}
