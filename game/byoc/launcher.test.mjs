import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'win32') { console.log('SKIP Windows launcher checks'); process.exit(0); }
const run = promisify(execFile), root = fileURLToPath(new URL('../../', import.meta.url)), local = path.join(root, 'local');
mkdirSync(local, { recursive: true });
const fixture = mkdtempSync(path.join(local, 'round2-y-'));
const shell = path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe');
const script = path.join(fixture, 'tools/serve.ps1'), children = [];
const env = { ...process.env, SC_QUIET: '1', SC_GAME: '', SC_BROWSER: '', SC_LOG: '' };
const quote = (s) => "'" + s.replaceAll("'", "''") + "'";
let count = 0;
const test = async (name, work) => { await work(); count++; console.log('ok ' + name); };
const call = async (args, extra = {}) => {
  try { const r = await run(shell, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, ...args], { cwd: fixture, env: { ...env, ...extra }, windowsHide: true, timeout: 15000 }); return { ...r, code: 0 }; }
  catch (e) { return { stdout: e.stdout, stderr: e.stderr, code: e.code }; }
};
async function start(args, extra = {}) {
  const child = spawn(shell, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, ...args], { cwd: fixture, env: { ...env, ...extra }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);
  let output = '', errors = '';
  child.stderr.on('data', (b) => { errors += b; });
  const done = new Promise((resolve) => child.on('close', (code) => resolve({ code, errors, output })));
  const port = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server startup timed out')), 10000);
    child.stdout.on('data', (b) => { output += b; const match = output.match(/serving at http:\/\/127\.0\.0\.1:(\d+)/); if (match) { clearTimeout(timer); resolve(Number(match[1])); } });
    child.once('error', (e) => { clearTimeout(timer); reject(e); });
    child.once('close', () => { clearTimeout(timer); reject(new Error('Server did not start: ' + errors)); });
  });
  return { child, port, done };
}
function get(port, url = '/index.html', host = 'localhost') {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path: url, headers: { Host: `${host}:${port}` }, timeout: 5000 }, (r) => { const chunks = []; r.on('data', (b) => chunks.push(b)); r.on('end', () => resolve({ status: r.statusCode, text: Buffer.concat(chunks).toString(), body: Buffer.concat(chunks) })); });
    req.on('timeout', () => req.destroy(new Error('Request timed out'))); req.on('error', reject);
  });
}
try {
  mkdirSync(path.join(fixture, 'tools')); mkdirSync(path.join(fixture, 'game/byoc/import'), { recursive: true });
  for (const name of ['tools/serve.ps1', 'tools/serve.py', 'Play Star Command.cmd', 'Play Star Command (Veteran Crew).cmd', 'game/byoc/import/manifest.json']) copyFileSync(path.join(root, name), path.join(fixture, name));
  writeFileSync(path.join(fixture, 'game/index.html'), 'Star Command test resource');
  if (process.env.SC_REF) await test('launcher manifest matches the local schema including the remembered browser save path', () => {
    const schema = JSON.parse(readFileSync(path.join(process.env.SC_REF, 'docs/recomplauncher.schema.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(path.join(root, 'recomplauncher.json'), 'utf8'));
    const known = new Set(['$schema', '$id', '$ref', 'title', 'description', 'default', 'examples', 'definitions', 'type', 'properties', 'propertyNames', 'patternProperties', 'additionalProperties', 'required', 'items', 'minItems', 'maxItems', 'uniqueItems', 'minLength', 'maxLength', 'pattern', 'minimum', 'maximum', 'enum', 'const', 'anyOf', 'oneOf', 'allOf', 'not']);
    const valid = (value, rule) => {
      if (typeof rule === 'boolean') return rule;
      for (const key of Object.keys(rule)) assert.ok(known.has(key), 'Unsupported schema keyword: ' + key);
      if (rule.$ref) { assert.ok(rule.$ref.startsWith('#/')); return valid(value, rule.$ref.slice(2).split('/').reduce((p, k) => p[k.replaceAll('~1', '/').replaceAll('~0', '~')], schema)); }
      const type = { object: (v) => v !== null && typeof v === 'object' && !Array.isArray(v), array: Array.isArray, string: (v) => typeof v === 'string', integer: Number.isInteger, number: (v) => typeof v === 'number', boolean: (v) => typeof v === 'boolean', null: (v) => v === null };
      if (rule.type && ![].concat(rule.type).some((t) => type[t](value))) return false;
      if ('const' in rule && JSON.stringify(value) !== JSON.stringify(rule.const)) return false;
      if (rule.enum && !rule.enum.some((v) => JSON.stringify(v) === JSON.stringify(value))) return false;
      if (rule.anyOf && !rule.anyOf.some((r) => valid(value, r))) return false;
      if (rule.oneOf && rule.oneOf.filter((r) => valid(value, r)).length !== 1) return false;
      if (rule.allOf && !rule.allOf.every((r) => valid(value, r))) return false;
      if (rule.not && valid(value, rule.not)) return false;
      if (type.object(value)) {
        if (rule.required?.some((key) => !(key in value))) return false;
        for (const [key, item] of Object.entries(value)) {
          if (rule.propertyNames && !valid(key, rule.propertyNames)) return false;
          const rules = rule.properties?.[key] ? [rule.properties[key]] : [];
          for (const [pattern, r] of Object.entries(rule.patternProperties ?? {})) if (new RegExp(pattern).test(key)) rules.push(r);
          if (!(rules.length ? rules : [rule.additionalProperties ?? true]).every((r) => valid(item, r))) return false;
        }
      }
      if (Array.isArray(value)) {
        if (value.length < (rule.minItems ?? 0) || value.length > (rule.maxItems ?? Infinity)) return false;
        if (rule.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) return false;
        if (!value.every((v) => valid(v, rule.items ?? true))) return false;
      }
      if (typeof value === 'string' && (value.length < (rule.minLength ?? 0) || value.length > (rule.maxLength ?? Infinity) || rule.pattern && !new RegExp(rule.pattern).test(value))) return false;
      if (typeof value === 'number' && (value < (rule.minimum ?? -Infinity) || value > (rule.maximum ?? Infinity))) return false;
      return true;
    };
    assert.equal(valid(manifest, schema), true);
    assert.equal(valid({ ...manifest, format: 'invalid' }, schema), false);
    assert.equal(valid({ ...manifest, saves: [42] }, schema), false);
    assert.ok(manifest.saves.includes('{install}/recomp-profile/browser'));
  });
  await test('remembered Edge survives Chrome becoming available and an override does not rewrite the choice', async () => {
    const choice = path.join(fixture, 'browser-choice'); writeFileSync(choice, 'edge');
    const code = `$ErrorActionPreference='Stop'; $tokens=$null; $errors=$null; $ast=[Management.Automation.Language.Parser]::ParseFile(${quote(script)},[ref]$tokens,[ref]$errors); if($errors.Count){throw 'parse failed'}; $ast.FindAll({param($n) $n -is [Management.Automation.Language.FunctionDefinitionAst] -and $n.Name -in @('Fail','Browser-Names','Remember-Browser')},$true) | ForEach-Object {Invoke-Expression $_.Extent.Text}; $p=${quote(choice)}; if((@(Browser-Names $p) -join ',') -ne 'msedge'){throw 'browser changed'}; $env:SC_BROWSER='chrome'; if((@(Browser-Names $p) -join ',') -ne 'chrome'){throw 'override failed'}; Remember-Browser $p 'chrome.exe'; if([IO.File]::ReadAllText($p) -ne 'edge'){throw 'choice overwritten'}; $env:SC_BROWSER=''; Remove-Item -LiteralPath $p; Remember-Browser $p 'msedge.exe'; if((@(Browser-Names $p) -join ',') -ne 'msedge'){throw 'choice not remembered'}; 'browser choice checks passed'`;
    const r = await run(shell, ['-NoProfile', '-NonInteractive', '-Command', code], { env, cwd: fixture, windowsHide: true }); assert.match(r.stdout, /passed/);
  });
  await test('a foreign listener is rejected without changing the fixed address', async () => {
    const server = http.createServer((q, r) => { const body = JSON.stringify({ app: 'unrelated' }); r.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }); r.end(body); });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    try { const r = await call(['--play', '--no-browser', String(server.address().port), '--test-timeout', '2']); assert.equal(r.code, 13); assert.match(r.stderr, /Another program/); }
    finally { await new Promise((r) => server.close(r)); }
  });
  await test('recognized server reuse, both host names and request logging work', async () => {
    const log = path.join(fixture, 'requests.log'), live = await start(['--server', '--no-browser', '0', '--test-timeout', '5'], { SC_LOG: log });
    assert.equal((await get(live.port, '/index.html', 'localhost')).status, 200);
    assert.equal((await get(live.port, '/index.html', '127.0.0.1')).status, 200);
    const r = await call(['--play', '--no-browser', String(live.port), '--test-timeout', '2']); assert.equal(r.code, 0, r.stderr);
    assert.match(readFileSync(log, 'utf8'), /GET \/index.html 200/);
    assert.equal((await live.done).code, 0);
  });
  await test('launch without a chosen folder offers the importer and preserves the remembered port', async () => {
    const live = await start(['--launch', '--no-browser', '0', '--test-timeout', '3']);
    const info = JSON.parse((await get(live.port, '/byoc-status')).text);
    assert.equal(info.mode, 'launch'); assert.ok(!info.source);
    const remembered = readFileSync(path.join(fixture, 'recomp-profile/port'), 'utf8'); assert.equal(remembered, String(live.port));
    assert.equal((await call(['--launch', '--no-browser', '--test-timeout', '1'])).code, 0);
    assert.equal((await live.done).code, 0);
    assert.equal(readFileSync(path.join(fixture, 'recomp-profile/port'), 'utf8'), remembered);
  });
  await test('missing originals do not prevent startup and source read failure remains recoverable', async () => {
    const extra = { SC_GAME: path.join(fixture, 'unavailable-copy') }, live = await start(['--launch', '--no-browser', '--test-timeout', '3'], extra);
    const info = JSON.parse((await get(live.port, '/byoc-status')).text);
    assert.match(info.source, /^[A-Za-z0-9_-]{43}$/); assert.match(info.copy, /^[A-Za-z0-9_-]{43}$/);
    assert.equal((await get(live.port, '/byoc-source/' + info.source)).status, 503);
    assert.equal((await get(live.port)).status, 200);
    const changed = await call(['--launch', '--no-browser', '--test-timeout', '1'], { SC_GAME: path.join(fixture, 'different-copy') });
    assert.equal(changed.code, 13); assert.match(changed.stderr, /different original copy/);
    assert.equal((await live.done).code, 0);
  });
  await test('Python on Windows still delegates to the quiet serve-only PowerShell launcher', async () => {
    const r = await run('python', ['-I', path.join(fixture, 'tools/serve.py'), '--launch', '--no-browser', '--test-timeout', '1'], { cwd: fixture, env, windowsHide: true, timeout: 10000 });
    assert.match(r.stdout, /serving at/); assert.equal(r.stderr, '');
  });
  await test('both CMD files run without Python on PATH and never start a browser', async () => {
    const live = await start(['--server', '--no-browser', '0', '--test-timeout', '5']);
    const cleanPath = [path.join(process.env.SystemRoot, 'System32'), process.env.SystemRoot, path.join(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0')].join(';');
    for (const name of ['Play Star Command.cmd', 'Play Star Command (Veteran Crew).cmd']) {
      const command = `""${path.join(fixture, name)}" --no-browser ${live.port} --test-timeout 2"`;
      const result = await run(process.env.ComSpec, ['/d', '/s', '/c', command], { env: { ...env, PATH: cleanPath }, cwd: fixture, windowsHide: true, windowsVerbatimArguments: true, timeout: 10000 });
      assert.equal(result.stderr, '');
    }
    assert.equal((await live.done).code, 0);
  });
  console.log(`launcher safety: ${count} checks passed`);
} finally {
  for (const child of children) if (child.exitCode === null) child.kill();
  const target = path.resolve(fixture), boundary = path.resolve(local) + path.sep;
  if (!target.startsWith(boundary) || !path.basename(target).startsWith('round2-y-')) throw new Error('Unsafe cleanup target');
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
}
