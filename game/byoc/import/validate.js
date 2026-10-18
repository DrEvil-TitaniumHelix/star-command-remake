// validate.js — check the player's files against the manifest (docs/BYOC.md 3.1 step 2). Pure: runs in the worker
// and in node (assets.test.mjs).
//
//   const r = await validate(MANIFEST, [{ name, bytes }], sha256)
//   r.ok, r.files (Map NAME -> bytes: every required file + the optional ones that match), r.problems, r.notes
//
// Names compare case-insensitively by base name. When several candidates share a name (a .zip with subfolders),
// the one that matches the manifest wins. Extra files are ignored.

export const hex = (buf) => Array.from(new Uint8Array(buf), (v) => v.toString(16).padStart(2, '0')).join('');
export const webSha256 = async (bytes) => hex(await crypto.subtle.digest('SHA-256', bytes));

export async function validate(manifest, candidates, sha256 = webSha256, onFile = () => {}) {
  const byName = new Map();
  for (const c of candidates) {
    const n = c.name.split(/[\\/]/).pop().toUpperCase();
    if (!byName.has(n)) byName.set(n, []);
    byName.get(n).push(c.bytes);
  }
  const files = new Map(), problems = [], notes = [];
  let i = 0;
  for (const want of manifest.list) {
    onFile(i++, manifest.list.length, want.name);
    const have = byName.get(want.name) ?? [];
    let match = null, wrongSize = null, wrongHash = null;
    for (const bytes of have) {
      if (bytes.length !== want.size) { wrongSize ??= bytes.length; continue; }
      if ((await sha256(bytes)) === want.sha256) { match = bytes; break; }
      wrongHash = true;
    }
    if (match) { files.set(want.name, match); continue; }
    let why;
    if (!have.length) why = `${want.name} is missing (expected ${want.size} bytes)`;
    else if (wrongHash) why = `${want.name} has the expected size (${want.size} bytes) but different content: not the known release, or a changed copy`;
    else why = `${want.name} is ${wrongSize} bytes, expected ${want.size} bytes`;
    (want.required ? problems : notes).push(want.required ? why : `${why} (optional, not needed)`);
  }
  return { ok: problems.length === 0, files, problems, notes };
}
