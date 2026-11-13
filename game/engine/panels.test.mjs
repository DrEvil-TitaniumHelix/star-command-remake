import assert from 'node:assert/strict';
import {crewStatus,shipStatus,battleReport,installPanels} from './panels.js';
const G=new Float32Array(2601), strings={'CrewName$':['','Pilot','Comms','Ada'], 'WeaponName$':['Laser']};
const saved=new Map(), flags={crewPanel:true,logBook:true};
let rows=['Mission briefing: Find the station.'];
const E={state:{G,str:n=>strings[n]??[]},currentModule:'SPACE',settings:{on:k=>!!flags[k]},
 files:{saved:n=>saved.get(n),write:(n,b)=>saved.set(n,b)},text:{screenText:()=>rows},input:{},display:{frameHooks:[]}};
G[1600]=30;G[1615]=24;G[1616]=30;G[1631]=1;G[1632]=1;G[1658]=42;
G[800]=1;G[803]=7;G[1100]=1;G[1102]=3;
assert.equal(crewStatus(E).length,8);
assert.deepEqual([crewStatus(E)[2].hp,crewStatus(E)[2].ammo,crewStatus(E)[2].reloads],[24,7,1]);
assert.equal(crewStatus(E)[2].weapon,'Laser');
assert.equal(crewStatus(E)[2].stamina,null);
E.currentModule='PLBATTLE';assert.equal(crewStatus(E)[2].stamina,42);
G[2200]=120;G[52]=200;G[55]=80;G[0]=2;
assert.equal(shipStatus(E)[0],'Fuel 120/200 · Armor 80');assert.equal(shipStatus(E)[1],'Engine: broken');
const original=G.slice();const log=installPanels(E);log.observe();
assert.deepEqual(G,original,'presentation never changes COMMON');
assert.equal(log.entries()[0].text,rows.join('\n'),'briefing text verbatim');
const checkpoint=log.checkpoint();G[79]=90;G[1631]=0;G[109]=1;log.observe();
assert.ok(log.entries().some(e=>e.kind==='credits'));
assert.ok(log.entries().some(e=>e.kind==='death'));
assert.ok(log.entries().some(e=>e.kind==='medal'));
E.currentModule='SPACE';log.observe();assert.ok(log.entries().some(e=>e.kind==='battle'));
log.persist(checkpoint);assert.deepEqual(JSON.parse(new TextDecoder().decode(saved.get('LOGBOOK'))),checkpoint);
log.restore(checkpoint);assert.deepEqual(log.entries(),checkpoint);
flags.logBook=false;G[79]=100;rows=['Mission other'];log.observe();log.persist([]);
assert.deepEqual(log.entries(),checkpoint);assert.deepEqual(JSON.parse(new TextDecoder().decode(saved.get('LOGBOOK'))),checkpoint);
console.log('panels: crew, ammo, stamina, ship, journal deltas, checkpoint persistence, off and read-only checks pass');

{
 const g=new Float32Array(2601), names=['','Ada','Bo'];let decodes=0;
 const engine={currentModule:'SPACE',fb:{version:1},state:{G:g,str:n=>n==='CrewName$'?names:[]},
  settings:{on:()=>true},files:{saved:()=>null},input:{},display:{frameHooks:[]},
  text:{screenText:()=>{decodes++;return ['Mission briefing'];},print(){engine.fb.version++;}}};
 g[1400]=g[1500]=30;g[1431]=1;g[1531]=0;
 const book=installPanels(engine);book.observe();book.observe();book.observe();
 assert.equal(decodes,1,'unchanged fb.version decodes screenText only once');
 engine.fb.version++;book.observe();assert.equal(decodes,2,'changed framebuffer refreshes cache');
 for(const mod of ['SPACE','STARPORT']){
  engine.currentModule=mod;book.observe();
  const first=g.slice(1400,1500);g.copyWithin(1400,1500,1600);g.set(first,1500);
  [names[1],names[2]]=[names[2],names[1]];
  book.observe();assert.equal(book.entries().filter(e=>e.kind==='death').length,0,mod+' swap does not repeat a death');
 }
 g[1431]=0;book.observe();assert.equal(book.entries().filter(e=>e.kind==='death').length,1);
 const first=g.slice(1400,1500);g.copyWithin(1400,1500,1600);g.set(first,1500);
 [names[1],names[2]]=[names[2],names[1]];book.observe();
 assert.equal(book.entries().filter(e=>e.kind==='death').length,1);
 engine.currentModule='STARTUP';book.observe();
 engine.text.print('old characters. Start a new game?(Y/N)');book.observe();
 assert.ok(book.entries().length,'asking/cancelling new game keeps the old journal');
 engine.text.print('Starting a new game. Please wait.');book.observe();
 assert.ok(book.entries().length,'confirmation marker alone is not a completed G reset');
 g.fill(0);names.fill('');g[78]=3;g[79]=5000;g[83]=27;g[2214]=2;
 engine.text.screenText=()=>{decodes++;return ['Play Star Command'];};engine.fb.version++;
 book.observe();assert.deepEqual(book.entries(),[],'completed new-game reset clears old campaign');
 book.observe();assert.deepEqual(book.entries(),[],'reset does not invent deaths or a credit delta');
 engine.currentModule='SPBATTLE';book.observe();g[2254]=1;engine.currentModule='SPACE';book.observe();
 const battle=book.entries().find(e=>e.kind==='battle');
 assert.match(battle.text,/cumulative counters/);assert.doesNotMatch(battle.text,/won/,'space battles never use stale PLBATTLE won flag');
 const arrays={'GrpSize!':[3,2],'UnitHP!':[10,0,5,0,0,0,4],'GrpState!':[2,3]};
 engine.currentModule='PLBATTLE';engine.moduleInstance={V:{'CreditsGained!':75,'NGroups!':2},A:n=>arrays[n]??[]};
 assert.equal(battleReport(engine),'PLBATTLE report: credits gained 75; A: 1 killed, 2 survived; B: 1 killed, 1 surrendered');
 engine.currentModule='SPBATTLE';engine.moduleInstance={V:{'NumEnemy!':4},A:n=>({'EnStatus!':[2,5,3,3],'Hull!':[10,10,0,5]}[n]??[])};
 assert.equal(battleReport(engine),'SPBATTLE report: #1: survived; #2: docked; #3: destroyed; #4: surrendered');
 console.log('panels review regressions: identity swaps, new-game reset, framebuffer cache and per-battle reports pass');
}

if(process.argv.includes('--shots')) {
 const {spawn}=await import('node:child_process');const {mkdirSync,writeFileSync}=await import('node:fs');
 const port=12000+process.pid%10000,pause=ms=>new Promise(r=>setTimeout(r,ms));
 const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${process.env.TEMP}/v13-panels-${process.pid}`,'about:blank'],{stdio:'ignore'});
 let ws;
 try {
  let page;for(let i=0;i<50;i++){try{page=await(await fetch(`http://localhost:${port}/json/new?about:blank`,{method:'PUT'})).json();break;}catch{await pause(200);}}
  ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
  let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}};
  const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.result?.value;
  await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1100,height:700,deviceScaleFactor:1,mobile:false});
  const out=new URL('../../acceptance/out/v1.3/',import.meta.url);mkdirSync(out,{recursive:true});
  for(const screen of ['SP-01','PB-04','IN-02']){
   for(let attempt=0;attempt<3;attempt++){
    await send('Page.navigate',{url:`http://127.0.0.1:8094/index.html?screen=${screen}&panelsAttempt=${attempt}`});
    for(let i=0;i<50;i++){if(await evaluate('!!window.E?.logbook'))break;await pause(200);}
    if(await evaluate('!!window.E?.logbook'))break;
   }
   await pause(1500);
   assert.ok(await evaluate('!!window.E?.logbook'),'panels installed: '+await evaluate('document.body.innerText'));
   await evaluate("E.settings.set('crewPanel',true);E.settings.set('logBook',true)");await pause(150);
   assert.equal(await evaluate("document.getElementById('crew-status').hidden"),false);
   assert.equal(await evaluate("document.getElementById('log-book-button').hidden"),true,'idle corner button hidden');
   const canvasRect=await evaluate("(()=>{const r=E.display.canvas.getBoundingClientRect();return {x:r.left+20,y:r.top+20};})()");
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',...canvasRect});await pause(100);
   assert.equal(await evaluate("document.getElementById('log-book-button').hidden"),false,'hover reveals corner button');
   await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:0,y:0});await pause(100);
   assert.equal(await evaluate("document.getElementById('log-book-button').hidden"),true,'leaving picture hides corner button');
   writeFileSync(new URL(`${screen}-crew.png`,out),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).result.data,'base64'));
   await evaluate('E.logbook.open()');await pause(100);
   writeFileSync(new URL(`${screen}-logbook.png`,out),Buffer.from((await send('Page.captureScreenshot',{format:'png'})).result.data,'base64'));
   await evaluate("E.logbook.close();E.settings.set('classic',true)");await pause(100);
   assert.equal(await evaluate("document.getElementById('crew-status').hidden && document.getElementById('log-book-button').hidden"),true);
   await evaluate("E.settings.set('classic',false)");
   await send('Emulation.setDeviceMetricsOverride',{width:640,height:400,deviceScaleFactor:1,mobile:false});await pause(100);
   assert.equal(await evaluate("document.getElementById('crew-status').hidden"),true,'no spare width hides crew panel');
   await send('Emulation.setDeviceMetricsOverride',{width:1100,height:700,deviceScaleFactor:1,mobile:false});await pause(100);
  }
 } finally{ws?.close();chrome.kill();}
}
