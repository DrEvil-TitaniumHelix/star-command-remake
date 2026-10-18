// python -I tools/serve.py 8094; node click_check.mjs <outDir> <id>...
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
  '--window-size=640,400','--hide-scrollbars','about:blank'],{stdio:'ignore'});
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
const HASH=`(() => {const c=document.getElementById('screen');if(!c)return '';const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=4)h=(h*31+d[i]+7*d[i+1]+13*d[i+2])>>>0;return String(h);})()`;
const results=[];let failed=false;
try {
 for(const id of ids) {
  const [screen,keys=""]=id.split(":");
  const fileId=id.replaceAll(":","-");
  let tab,s;
  const ev=async expression=>{
    const r=await s.send('Runtime.evaluate',{expression,returnByValue:true});
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result?.value;
  };
  async function settle(initial=false) {
    const start=Date.now();let prev=null,since=Date.now(),rows=null,rowsSince=Date.now();
    while(Date.now()-start<Number(process.env.LIMIT_MS||120000)) {
      const booted=!initial||await ev('!!window.E?.currentModule && typeof window.__clickRegions === "function"');
      if(initial&&!booted&&Date.now()-start>10000)throw Error('engine did not boot (check server/network)');
      if(booted&&initial&&await ev('window.__screenReady===true||window.__devReady===true')) return;
      const h=await ev(HASH);
      if(!initial) {
        const nextRows=await ev('window.E?.text.screenText()');
        const signature=JSON.stringify(nextRows);
        if(signature!==rows){rows=signature;rowsSince=Date.now();}
        // Galaxy cursor/portraits animate indefinitely. Text can settle independently of pixels.
        if(nextRows?.some(l=>l.trim())&&Date.now()-start>2000&&Date.now()-rowsSince>=1200)return;
      }
      if(h!==prev){prev=h;since=Date.now();}
      else if(booted&&h&&Date.now()-since>=(initial&&/^(SP|SB)-/.test(id)?6000:Number(process.env.STABLE_MS||1200))&&(!initial||!/^(IN|PB)-/.test(id))) return;
      await sleep(150);
    }
    throw Error('screen did not settle');
  }
  async function load() {
    // Fresh document/session prevents a previous document's ready flag satisfying a reload.
    for(let attempt=0;attempt<3;attempt++) {
      if(s) {s.close();await json(`/json/close/${tab.id}`);}
      tab=await json(`/json/new?${encodeURIComponent(`${BASE}?screen=${encodeURIComponent(screen)}`)}`,'PUT');
      s=await connect(tab.webSocketDebuggerUrl);
      await s.send('Emulation.setDeviceMetricsOverride',{width:640,height:400,deviceScaleFactor:1,mobile:false});
      await sleep(250);
      try {await settle(true);
        for(const key of keys) {
          await s.send('Input.dispatchKeyEvent',{type:'keyDown',key,text:key,unmodifiedText:key});
          await s.send('Input.dispatchKeyEvent',{type:'keyUp',key});
          await settle();
        }
        return;}catch(e){if(attempt===2)throw e;console.log(`${id}: retry fresh load (${e.message})`);}
    }
  }
  async function shot(name) {
    await settle();await sleep(80);
    const rows=await ev('window.E.text.screenText()');
    const png=await s.send('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width:640,height:400,scale:1}});
    writeFileSync(join(outDir,name+'.png'),Buffer.from(png.data,'base64'));
    return {rows,png:png.data};
  }
  try {
    await load();
    const regions=await ev('window.__clickRegions()');
    writeFileSync(join(outDir,fileId+'-regions.json'),JSON.stringify(regions,null,2));
    console.log(`${id}: ${regions.length} regions`);
    if(!regions.length)throw Error('no clickable regions');
    for(let i=0;i<regions.length;i++) {
      const r=regions[i],name=`${fileId}-${String(i).padStart(2,'0')}`;
      await load();
      const rect=await ev(`(() => {const r=document.getElementById('screen').getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};})()`);
      const x=rect.x+(r.x+r.w/2)*rect.w/320,y=rect.y+(r.y+r.h/2)*rect.h/200;
      await s.send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
      await s.send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
      const click=await shot(name+'-click');
      await load();
      const control={'\r':'Enter',' ':' ','\b':'Backspace','\0H':'ArrowUp','\0P':'ArrowDown','\0K':'ArrowLeft','\0M':'ArrowRight','\0I':'PageUp','\0Q':'PageDown'};
      const key=control[r.key]||(r.key[0]==='\0'?`F${r.key.charCodeAt(1)-58}`:r.key),text=r.key.length===1?r.key:'';
      await s.send('Input.dispatchKeyEvent',{type:'keyDown',key,text,unmodifiedText:text});
      await s.send('Input.dispatchKeyEvent',{type:'keyUp',key});
      const keyboard=await shot(name+'-key');
      const samePixels=click.png===keyboard.png,sameRows=JSON.stringify(click.rows)===JSON.stringify(keyboard.rows);
      // SB-02 ship/galaxy sprites and PB-04 portraits animate independently of input.
      const animated=['SB-02','PB-04'].includes(id);
      const pass=samePixels||(animated&&sameRows);failed ||= !pass;
      results.push({id,index:i,kind:r.kind,key:r.key,pass,samePixels,sameRows,animated});
      writeFileSync(join(outDir,'results.json'),JSON.stringify(results,null,2));
      console.log(`${pass?'PASS':'FAIL'} ${name} ${r.kind} ${JSON.stringify(r.key)} (${samePixels?'pixels':sameRows?'text rows':'different'})`);
    }
  } catch(e) {failed=true;results.push({id,error:e.message});console.log(`FAIL ${id}: ${e.message}`);}
  finally{if(s)s.close();if(tab)await json(`/json/close/${tab.id}`).catch(()=>{});writeFileSync(join(outDir,'results.json'),JSON.stringify(results,null,2));}
 }
} finally {chrome.kill();}
if(failed)process.exitCode=1;
