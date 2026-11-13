import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const [outDir,...ids]=process.argv.slice(2);
if(!outDir||!ids.length) throw Error('usage: click_check.mjs <outDir> <id>...');
mkdirSync(outDir,{recursive:true});
const BASE=process.env.GAME_URL||'http://127.0.0.1:8094/index.html',PORT=10000+process.pid%40000;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',[
  '--headless=new',`--remote-debugging-port=${PORT}`,`--user-data-dir=${join(tmpdir(),`click-check-${process.pid}`)}`,
  '--window-size=900,700','--hide-scrollbars','about:blank'],{stdio:'ignore'});
async function json(path,method='GET') {
  for(let i=0;i<100;i++) {try{const r=await fetch(`http://127.0.0.1:${PORT}${path}`,{method});return path.startsWith('/json/close/')?await r.text():await r.json();}catch{await sleep(200);}}
  throw Error('Chrome unavailable');
}
async function connect(url) {
  const ws=new WebSocket(url),pending=new Map();let id=0;
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id);}};
  await new Promise(r=>ws.onopen=r);
  return {close:()=>ws.close(),send:(method,params={})=>new Promise((resolve,reject)=>{
    const i=++id,t=setTimeout(()=>{pending.delete(i);reject(Error(`${method} timeout`));},15000);
    pending.set(i,m=>{clearTimeout(t);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);});
    ws.send(JSON.stringify({id:i,method,params}));
  })};
}
let session;
try {
  const tab = await json('/json/new?' + encodeURIComponent('http://127.0.0.1:8097/index.html?screen=SP-01'), 'PUT');
  session = await connect(tab.webSocketDebuggerUrl);
  await session.send('Page.enable');
  await session.send('Page.navigate', { url: 'http://127.0.0.1:8097/index.html?screen=SP-01' });
  const ev = async expression => {
    const r = await session.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw Error(JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  for (const screen of ['SU-03', 'PT-02', 'SP-01', 'IN-02', 'PB-04']) {
    await session.send('Page.navigate', { url: `http://127.0.0.1:8097/index.html?screen=${screen}` });
    await sleep(500);
    for (let i = 0; i < 100; i++) {
      if (await ev(`!!window.E && (${JSON.stringify(screen)}.match(/^(IN|PB)-/) ? !!(window.__screenReady || window.__devReady) : !!E.currentModule)`)) break;
      await sleep(200);
    }
    await sleep(3000);
    if (screen === 'PB-04') {
      await ev('E.timer.frame=()=>new Promise(()=>{})');
      await sleep(200);
    }
    const capture = async () => (await session.send('Page.captureScreenshot', { format: 'png' })).data;
    const before = await capture();
    await ev(`(async()=>{ E.settings.on=()=>true;
      (await import('./engine/speed.js')).installSpeed(E);
      (await import('./engine/marker.js')).installMarker(E);
      await (await import('./engine/manual.js')).installManual(E);
    })()`);
    await sleep(300);
    const after = await capture();
    if (before !== after) throw Error(`${screen}: idle picture changed`);
    writeFileSync(join(outDir, `misc-idle-${screen}.png`), Buffer.from(after, 'base64'));
    console.log(`${screen}: idle installers unchanged`);
  }
  await session.send('Page.navigate', { url: 'http://127.0.0.1:8097/index.html?screen=SP-01' });
  await sleep(500);
  for (let i = 0; i < 100 && !await ev('!!window.E?.moduleInstance'); i++) await sleep(200);
  console.log(await ev('document.body.innerText'));
  await ev(`(async()=>{ E.settings.on=()=>true;
    (await import('./engine/marker.js')).installMarker(E);
    (await import('./engine/speed.js')).installSpeed(E);
    await (await import('./engine/manual.js')).installManual(E);
    E.state.G[110]=1; E.state.G[2240]=150; E.state.G[2238]=E.state.G[2216]; E.state.G[2239]=E.state.G[2217];
    E.sprites.put(32,0,{bank:'SPACESH.BAS',index:1},'PSET');
    window.miscPixels=Array.from(E.fb.pix).join(',');
  })()`);
  await sleep(250);
  const rect = await ev("(()=>{const r=E.display.canvas.getBoundingClientRect();return {x:r.right-60,y:r.bottom-100}})()");
  await session.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: rect.x, y: rect.y });
  for (const [name, code] of [['misc-marker',''], ['misc-speed', 'E.speed.cycle()'], ['misc-manual', "E.manual.open('SP-01')"]]) {
    if (code) await ev(code);
    await sleep(200);
    const shot = await session.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(outDir, name + '.png'), Buffer.from(shot.data, 'base64'));
  }
  if (!await ev("window.miscPixels===Array.from(E.fb.pix).join(',')")) throw Error('Overlay changed framebuffer');
  await ev("E.settings.on=()=>false");
  await sleep(100);
  if (!await ev("!E.manual.isOpen && E.speed.label==='normal' && E.missionMarker.cells().length===0")) throw Error('Disabled feature remained active');
  console.log('misc browser screenshots captured');
} finally { session?.close(); chrome.kill(); }
