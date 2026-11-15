import assert from 'node:assert/strict';
import {crewStatus,shipStatus,battleReport,installPanels,logLines} from './panels.js';
import {dom} from './settings-panel.fixture.mjs';
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
{
 const g=new Float32Array(2601), un=['','Pilot','Comms','Able','Baker','Charlie','Dog','Easy','Fox'];let names=un.slice(),ms=0;
 const engine={currentModule:'SPACE',fb:{version:1},timer:{clock:()=>ms},state:{G:g,str:n=>n==='CrewName$'?names:[]},settings:{on:()=>true},files:{saved:()=>null},
  input:{},display:{frameHooks:[]},text:{screenText:()=>['']},chain:m=>{engine.currentModule=m;}};
 const book=installPanels(engine),deaths=()=>book.entries().filter(e=>e.kind==='death').map(e=>e.text);
 const sw=(a,b)=>{[names[a],names[b]]=[names[b],names[a]];book.observe();};
 const fwd=()=>{for(let i=1;i<=6;i++)sw(i+2,i);ms+=600;book.observe();}, rev=()=>{for(let i=6;i>=1;i--)sw(i+2,i);};
 for(let m=1;m<=8;m++){g[1315+100*m]=30;g[1331+100*m]=1;}
 engine.currentModule='INSIDE';fwd();book.observe();
 assert.deepEqual(engine.crewNames,un,'jump start: crew order seeded only from a settled list');
 for(const [from,to] of [['INSIDE','PLBATTLE'],['PLBATTLE','INSIDE'],['PLBATTLE','SPACE']]){
  engine.currentModule=from;book.observe();
  if(from==='PLBATTLE'){g[1831]=0;book.observe();}
  rev();engine.chain(to);book.observe();if(to!=='SPACE')fwd();
  g[1831]=1;rev();engine.currentModule='SPACE';book.observe();engine.currentModule='INSIDE';fwd();
 }
 assert.deepEqual(deaths(),['Charlie died','Charlie died'],'names moved back before CHAIN: only the dead member, once per fight');
}
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

{
 const raw=[{kind:'credits',text:'Credits 16852.595703125 (+16852.595703125)'},
  {kind:'battle',text:'Credits -9999.6; kills 1234; tonnage 1234567.5'},
  {kind:'screen',text:'Mission 1234\nReward: 1,999.6 credits. Bonus +1e6; fuel 20.4/1000. Gravity .6; cost....1234.5'}];
 const before=JSON.stringify(raw), d=dom(), store=new Map();
 const engine={...E,settings:{on:()=>true},files:{saved:()=>null,write:(n,b)=>store.set(n,b)},display:{canvas:d.canvas,frameHooks:[]}};
 const book=installPanels(engine);book.restore(raw);book.open();
 const expected=['[credits] Credits 16,853 (+16,853)','[battle] Credits -10,000; kills 1,234; tonnage 1,234,568',
  '[screen] Mission 1,234\nReward: 2,000 credits. Bonus +1,000,000; fuel 20/1,000. Gravity 1; cost....1,235'];
 assert.deepEqual(logLines(raw),expected);
 assert.equal(d.doc.getElementById('log-book').find(n=>n.tagName==='PRE').textContent,expected.join('\n\n'));
 assert.equal(JSON.stringify(raw),before);assert.deepEqual(book.entries(),raw);assert.deepEqual(book.checkpoint(),raw);
 book.persist();assert.deepEqual(JSON.parse(new TextDecoder().decode(store.get('LOGBOOK'))),raw);
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
   await evaluate("E.logbook.close();E.settings.set('crewPanel',false);E.settings.set('logBook',false)");await pause(100);
   assert.equal(await evaluate("document.getElementById('crew-status').hidden && document.getElementById('log-book-button').hidden"),true);
   await evaluate("E.settings.set('crewPanel',true);E.settings.set('logBook',true)");
   await send('Emulation.setDeviceMetricsOverride',{width:640,height:400,deviceScaleFactor:1,mobile:false});await pause(100);
   assert.equal(await evaluate("document.getElementById('crew-status').hidden"),true,'no spare width hides crew panel');
   await send('Emulation.setDeviceMetricsOverride',{width:1100,height:700,deviceScaleFactor:1,mobile:false});await pause(100);
  }
 } finally{ws?.close();chrome.kill();}
}
{
 const {crewLines}=await import('./panels.js'), {barPlace}=await import('./speed.js');
 const g=new Float32Array(2601), names={'CrewName$':['','REX','PIL','SOA']};
 g[1415]=20.4;g[1416]=30;g[1515]=20;g[1516]=20;g[1615]=12;g[1616]=12;g[1632]=1;g[800]=4;g[803]=6;
 const e={state:{G:g,str:n=>names[n]??[]},currentModule:'SPACE',tooltips:{items:()=>[{group:'squad weapons',index:3,name:'Laser Rifle'}]}};
 const space=crewLines(crewStatus(e));
 assert.equal(space.length,3,'no filler rows for empty slots');
 assert.equal(space[0],'P> REX · HP 20/30\nHand weapon');
 assert.equal(space[2],'1> SOA · HP 12/12\nLaser Rifle\nAmmo 6 · reloads 0');
 assert.ok(!space.join().match(/Weapon \d|Stamina|—/));
 e.currentModule='PLBATTLE';names['CrewName$']=['','SOA'];g[1658]=40;
 const ground=crewLines(crewStatus(e));
 assert.ok(ground[0].startsWith('P> REX')&&ground[2].startsWith('1> SOA')&&!/Pilot|Communicator/.test(ground.join()),'real names on the ground');
 assert.deepEqual(barPlace({left:320,right:960,bottom:820},{h:1000},20),{outside:true,left:320,top:840,row:true});
 assert.equal(barPlace({left:200,right:840,bottom:410},{h:420},20).outside,true);
 assert.equal(barPlace({left:0,right:640,bottom:410},{h:420},20).outside,false);
 console.log('panels: crew labels P/C/1-6, real names and weapon names, no filler, corner bar outside the picture pass');
}
{
 const {installManual}=await import('./manual.js'), {Input,KEY}=await import('./input.js');
 const data={screens:{'SP-01':{title:'Space',pages:['1'],differences:[]}},pages:{'1':Array(80).fill('line').join('\n')},differences:[]};
 const input=new Input(), e={input,currentModule:'SPACE',settings:{on:()=>true},display:{overlays:[],frameHooks:[]}};
 let esc=0;input.onDeviceEscape=()=>esc++;
 await installManual(e,{url:'data:application/json,'+encodeURIComponent(JSON.stringify(data))});
 e.manual.open();assert.equal(e.manual.isOpen,true);
 input.device('A');input.device(KEY.DOWN);assert.equal(input.inkey(),'','open manual swallows game keys');
 input.device(KEY.ESC);assert.equal(e.manual.isOpen,false);assert.equal(esc,0,'Esc closes the manual, not the menu');
 input.device('A');assert.equal(input.inkey(),'A','closed manual passes keys');
 console.log('manual: keys go to the open manual only pass');
}
