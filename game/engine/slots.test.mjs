import assert from 'node:assert/strict';
import {Files} from './files.js';
import {State} from './state.js';
import {Data} from './data.js';
import {Input,KEY} from './input.js';
import {Settings} from './settings.js';
import {Slots} from './slots.js';
import {installEscape,captureSave} from './overlay.js';
import {applySaveParam} from './saves.js';
const slotBytes=b=>typeof b==='string'?Uint8Array.from(atob(b),c=>c.charCodeAt(0)):Uint8Array.from(b);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function storage() {
  const m=new Map(); return {get length(){return m.size;}, key:i=>[...m.keys()][i],
    getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};
}
async function fixture(disk=storage(),enabled=true) {
  const files=new Files({baseDir:new URL('../assets/files/',import.meta.url).pathname.replace(/^\/([A-Z]:)/i,'$1'),storage:disk});
  const state=new State(files); await state.load();
  const E={files,state,data:new Data(files),settings:new Settings({storage:disk}),options:{},input:new Input(),
    currentModule:'SPACE',text:{screenText:()=>[]},fb:{dirty:false,cls(){}},display:{overlays:[],present(){}},chain(){}};
  if(!enabled) E.settings.set('saveSlots',false);
  installEscape(E);return E;
}
{
  const E=await fixture(), original=await E.files.read('CHARINFO.BAS');
  E.files.write('IN-1.BAS',new Uint8Array([1,2]));
  E.files.write('INMAP-23.BAS',new Uint8Array([9]));
  E.files.writeText('LOGBOOK','first voyage');
  await E.slots.save('Alpha');
  assert.equal(E.slots.list().length,1);
  const reloaded=new Slots(E); assert.equal(reloaded.list()[0].name,'Alpha');
  E.files.write('IN-1.BAS',new Uint8Array([5]));E.files.writeText('LOGBOOK','later');
  await E.slots.save('Beta'); await E.slots.save('Beta'); assert.equal(E.slots.list().length,2);
  E.files.write('IN-99.BAS',new Uint8Array([7]));
  let restart=0; E.slots.restart=()=>restart++;
  await E.slots.load('Alpha');assert.equal(restart,1);
  assert.deepEqual(await E.files.read('CHARINFO.BAS'),original);
  assert.deepEqual(E.files.saved('IN-1.BAS'),new Uint8Array([1,2]));
  assert.deepEqual(E.files.saved('INMAP-23.BAS'),new Uint8Array([9]));
  assert.equal(E.files.saved('IN-99.BAS'),null);
  assert.equal(await E.files.readText('LOGBOOK'),'first voyage');
  assert.ok(E.slots.records[0].files['INMAP-7.BAS'],'shipped station maps included');
  E.files.mem.delete('LOGBOOK');E.files.storage.removeItem('starcommand:file:LOGBOOK');
  await E.slots.save('No log'); E.files.writeText('LOGBOOK','unrelated');
  await E.slots.load('No log');assert.equal(E.files.saved('LOGBOOK'),null);
  E.settings.set('saveSlots',false);
  assert.equal(await E.slots.save('disabled'),false);assert.equal(await E.slots.load('Alpha'),false);
  E.settings.set('saveSlots',true);
  E.slots.records.push({name:'Broken',files:{'CHARINFO.BAS':[0]}});
  const before=await E.files.read('CHARINFO.BAS');
  await assert.rejects(E.slots.load('Broken'));assert.deepEqual(await E.files.read('CHARINFO.BAS'),before);
}
{
  const E=await fixture(); E.files.writeText('LOGBOOK','arrival');
  const before=captureSave(E); E.currentModule='STARPORT';
  E.state.G[78]+=42;E.files.writeText('LOGBOOK','after reward');
  await E.slots.autosave;
  const auto=E.slots.records.find(r=>r.auto);
  assert.deepEqual(slotBytes(auto.files['CHARINFO.BAS']),Files.makeBsave(before.body,before.header.seg,before.header.off));
  assert.equal(new TextDecoder().decode(slotBytes(auto.files.LOGBOOK)),'arrival');
  E.currentModule='SPACE';E.currentModule='STARPORT';await E.slots.autosave;
  assert.equal(E.slots.list().filter(r=>r.auto).length,1);
  const pref=E.files.storage.getItem('starcommand:settings');
  E.options.protection=true;assert.equal(E.options.protection,true);
  E.options.protection=false;assert.equal(E.options.protection,false);
  assert.equal(E.files.storage.getItem('starcommand:settings'),pref);
  E.settings.set('noChallenge',false);assert.equal(E.options.protection,false);
}
{
  const E=await fixture();await E.slots.save('Here');E.state.G[2200]+=1;
  E.input.device(KEY.ESC);E.input.device('L');assert.equal(E.input.modal,E.escape.modal);
  E.input.device('N');assert.equal(E.input.modal,E.escape.modal);
  E.input.device('L');E.input.device('Y');assert.notEqual(E.input.modal,E.escape.modal);
  const F=await fixture();F.currentModule='STARCOMM';F.input.device(KEY.ESC);F.input.device('L');
  assert.notEqual(F.input.modal,F.escape.modal,'nothing to lose: no question');
}
{
  const E=await fixture();await E.slots.save('Title crew');
  E.currentModule='STARCOMM';E.text.screenText=()=>['1-Play Star Command'];
  E.input.push('1');assert.equal(E.input.inkey(),'');assert.ok(E.input.modal);
  E.input.device(KEY.ESC);assert.equal(E.input.modal,null);
  E.input.push('1');assert.equal(E.input.inkey(),'1','cancelled picker is shown only once per title visit');
  E.currentModule='STARPORT'; E.currentModule='STARCOMM';
  E.input.push('1');E.input.inkey();E.input.device(KEY.ENTER);
  assert.equal(E.input.modal,null);assert.equal(E.input.inkey(),'1','current disk bypasses picker once');
  E.currentModule='STARPORT'; E.currentModule='STARCOMM';
  E.input.push('1');E.input.inkey();E.input.device(KEY.DOWN);
  let restarts=0;const r0=E.slots.restart;E.slots.restart=()=>{restarts++;r0();};
  E.input.device(KEY.ENTER);await pause(5);assert.equal(restarts,1);
  assert.throws(()=>E.input.inkey(),/CHAIN STARCOMM/);E.currentModule='STARCOMM'; E.input.push('1');
  assert.equal(E.input.inkey(),'1','loaded title advances without a second picker');
  E.currentModule='STARPORT'; E.currentModule='STARCOMM'; E.input.push('1');
  assert.equal(E.input.inkey(),'','a later title visit can show the picker again');
}
{
  const E=await fixture();
  E.input.device(KEY.ESC);E.input.device('S');E.input.device('Y');assert.ok(E.input.modal);
  E.input.device(KEY.ENTER);for(const c of 'My crew') E.input.device(c);
  E.input.device(KEY.ENTER);await pause(30);
  assert.equal(E.slots.list()[0].name,'My crew');
}
{
  const E=await fixture(undefined,false);
  E.currentModule='STARPORT';assert.equal(E.slots.autosave,undefined);
  E.input.device(KEY.ESC);E.input.device('L');assert.equal(E.slots.list().length,0);
  E.input.device('S');await pause(10);assert.ok(E.files.saved('CHARINFO.BAS'));
  assert.equal(E.slots.list().length,0);
}
{
  const E=await fixture();await E.slots.save('Keep');
  const input=await Promise.all(['CHARINFO.BAS','CHARNAME'].map(n=>E.files.read(n)));
  const result=await applySaveParam(E.files,new URLSearchParams('save=veteran&force=1'),{
    fetchImpl:async url=>({ok:true,arrayBuffer:async()=>input[url.endsWith('CHARNAME')?1:0].buffer})});
  assert.equal(result.applied,true);assert.equal(new Slots(E).list()[0].name,'Keep');
}
{
  const E=await fixture(); E.settings.set('saveSlots',false);
  E.files.writeText('LOGBOOK','departure'); E.currentModule='STARPORT'; E.chain('SPACE');
  E.currentModule='SPACE'; E.files.writeText('LOGBOOK','combat after departure');
  E.input.device(KEY.ESC);E.input.device('S');await pause(10);
  assert.equal(await E.files.readText('LOGBOOK'),'combat after departure','away from a starport: asks first');
  E.input.device('Y');await pause(10);
  assert.equal(await E.files.readText('LOGBOOK'),'departure','journal rolls back with COMMON');
}
{
  const E=await fixture(); E.settings.set('saveSlots',false);
  E.files.writeText('LOGBOOK','arrival'); E.currentModule='STARPORT';
  E.files.writeText('LOGBOOK','mid transaction');
  E.input.device(KEY.ESC);E.input.device('S');await pause(10);
  assert.equal(await E.files.readText('LOGBOOK'),'arrival','starport transaction uses entry journal');
}
{
  const E=await fixture(); await E.slots.save('Restart');
  E.input.device(KEY.ESC); await E.slots.load('Restart');
  assert.equal(E.input.modal,null);
  assert.throws(()=>E.input.inkey(), e=>e.module==='STARCOMM' && Object.keys(e.opts).length===0);
  assert.equal(E.input.inkey(),'','restart signal is consumed once');
}
for(const save of [false,true]) {
  const E=await fixture();E.settings.set('saveSlots',false);
  let entries=['A']; E.logbook={checkpoint:()=>structuredClone(entries),observe(){}};
  E.state.save(); E.files.writeText('LOGBOOK',JSON.stringify(entries));
  E.currentModule='STARPORT';E.chain('SPACE');E.currentModule='SPACE';
  entries.push('voyage battle');
  if(!save) E.currentModule='STARPORT';
  assert.equal(await E.files.readText('LOGBOOK'),'["A"]');
  E.input.device(KEY.ESC);E.input.device(save?'S':'Q');await pause(10);
  assert.equal(await E.files.readText('LOGBOOK'),'["A"]',save?'away save uses departure journal':'Quit never persists voyage');
}
for(const name of ['', 'Autosave']) {
  const E=await fixture();const before=await E.files.read('CHARINFO.BAS');E.state.G[78]+=100;
  let writes=0;const write=E.files.write;E.files.write=(...a)=>{writes++;return write(...a);};
  E.input.device(KEY.ESC);E.input.device('S');E.input.device(KEY.ENTER);
  for(const c of name) E.input.device(c);E.input.device(KEY.ENTER);await pause(5);
  assert.equal(writes,0,'invalid slot name rejected before any disk write');
  assert.deepEqual(await E.files.read('CHARINFO.BAS'),before);
}
{
  const E=await fixture();await E.slots.save('Autosave',captureSave(E),true);
  const before=JSON.stringify(E.slots.records.find(r=>r.auto));
  const locationBefore=globalThis.location;globalThis.location={search:'?screen=PT-02'};
  try {E.currentModule='STARPORT';await E.slots.autosave;} finally {globalThis.location=locationBefore;}
  assert.equal(JSON.stringify(E.slots.records.find(r=>r.auto)),before,'dev jump cannot replace Autosave');
}
{
  const E=await fixture();await E.slots.save('Legacy');
  const legacy=E.slots.records.map(r=>({...r,files:Object.fromEntries(Object.entries(r.files).map(([n,b])=>[n,Array.from(slotBytes(b))]))}));
  for(const r of legacy) delete r._key;
  E.files.storage.setItem('starcommand:slots:v1',JSON.stringify(legacy));
  const migrated=new Slots(E,{restart(){}});await migrated.load('Legacy');
  await migrated.save('Compact');
  const manifest=JSON.parse(E.files.storage.getItem('starcommand:slots:v1'));
  assert.ok(manifest.every(r=>r.key&&!r.files),'index contains only names and record keys');
  const compact=JSON.parse(E.files.storage.getItem(manifest[0].key));
  assert.equal(typeof compact.files['CHARINFO.BAS'],'string');
  let writes=0;const set=E.files.storage.setItem;E.files.storage.setItem=(...a)=>{writes++;return set(...a);};
  await migrated.save('Autosave',captureSave(E),true);
  assert.equal(writes,2,'arrival writes only changed record and index');
  E.files.storage.setItem=()=>{throw Error('QuotaExceededError');};
  const previous=migrated.list();await assert.rejects(migrated.save('Quota'),/Storage full; free space and retry/);
  assert.deepEqual(migrated.list(),previous,'quota failure keeps old slots');
}
console.log('slots: complete disk snapshots, persistence, overwrite, autosave, title, Esc, protection and prepared saves passed');

if (process.argv.includes('--shots')) {
  const {spawn} = await import('node:child_process');
  const {mkdirSync,writeFileSync} = await import('node:fs');
  const {tmpdir} = await import('node:os');
  const {join} = await import('node:path');
  const server = spawn('python',['-I','tools/serve.py','8097'],{stdio:'ignore'});
  const port = 9700 + process.pid % 100;
  const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    ['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${join(tmpdir(),'settings-'+process.pid)}`,'about:blank'],{stdio:'ignore'});
  let ws;
  try {
    let tab;
    for(let i=0;i<100;i++) { try { tab=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();break; } catch {await pause(100);} }
    ws=new WebSocket(tab.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
    let id=0; const pending=new Map();
    ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)(m);pending.delete(m.id);}};
    const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,m=>m.error?reject(m.error):resolve(m.result));ws.send(JSON.stringify({id:n,method,params}));});
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    await send('Emulation.setDeviceMetricsOverride',{width:640,height:400,deviceScaleFactor:1,mobile:false});
    mkdirSync('acceptance/out/v1.3',{recursive:true});
    await send('Page.navigate',{url:'http://127.0.0.1:8097/index.html?screen=PT-02'});
    for(let i=0;i<100;i++) {if(await evaluate('!!window.E && !!E.currentModule')) break;await pause(200);}
    await pause(500);
    assert.equal(await evaluate("document.querySelector('#msg').textContent"),'');
    await evaluate("E.settings.set('saveSlots',true); window.__before=Array.from(E.fb.pix); E.input.onDeviceEscape(); E.input.modal.key('S'); E.display.present(true)");
    async function shot(name) {
      await evaluate('E.display.present(true)');
      const result=await send('Page.captureScreenshot',{format:'png'});
      writeFileSync(`acceptance/out/v1.3/slots-${name}.png`,Buffer.from(result.data,'base64'));
    }
    await shot('save-picker');
    await evaluate("E.input.modal.key('\\r'); for(const c of 'Veteran crew') E.input.modal.key(c); E.display.present(true)");
    await shot('name');
    assert.equal(await evaluate('E.fb.pix.every((v,i)=>v===window.__before[i])'),true);
    await send('Runtime.evaluate',{expression:"E.slots.save('Veteran crew')",awaitPromise:true});
    await evaluate("E.input.modal.key('\\x1b'); E.input.modal.key('\\x1b'); E.input.modal.key('L')");
    await shot('load-picker');
    assert.equal(await evaluate('E.fb.pix.every((v,i)=>v===window.__before[i])'),true);
    await evaluate("E.input.modal.key('\\x1b'); E.input.modal.key('R')");
    assert.equal(await evaluate('E.fb.pix.every((v,i)=>v===window.__before[i])'),true);
    await send('Page.navigate',{url:'http://127.0.0.1:8097/index.html?screen=SU-03'});
    await pause(1000);
    for(let i=0;i<100;i++) { if(await evaluate("!!window.E && E.text.screenText().some(l=>l.includes('1-Play Star Command'))")) break; await pause(200); }
    assert.equal(await evaluate("document.querySelector('#msg').textContent"),'');
    await evaluate("E.input.push('1')");
    for(let i=0;i<50;i++) {if(await evaluate('!!E.input.modal')) break;await pause(100);}
    assert.equal(await evaluate('!!E.input.modal'),true);
    await shot('title-picker');
    await evaluate("E.input.modal.key('\\x1b')");
    assert.equal(await evaluate('!!E.input.modal'),false);
    await send('Runtime.evaluate',{expression:"E.slots.load('Veteran crew')",awaitPromise:true});
    await pause(2500);
    assert.equal(await evaluate('E.currentModule'),'STARCOMM');
    assert.equal(await evaluate('!!E.input.modal'),false);

    assert.equal(await evaluate("document.querySelector('#msg').textContent"),'');
    await evaluate("E.input.push(' '); E.input.push('1')");
    for(let i=0;i<100;i++) {if(await evaluate("E.currentModule==='STARPORT'")) break;await pause(100);}
    assert.equal(await evaluate('E.currentModule'),'STARPORT');
    assert.equal(await evaluate('!!E.input.modal'),false);
    console.log('slots browser pickers, framebuffer invariance, title interception and STARCOMM restart passed');
  } finally {ws?.close();chrome.kill();server.kill();}
}
{
  const disk=storage(), A=await fixture(disk), B=await fixture(disk);
  await A.slots.save('From A'); await B.slots.save('From B'); await A.slots.save('A again');
  assert.deepEqual(new Slots(await fixture(disk)).list().map(r=>r.name).sort(),['A again','From A','From B'],'two windows keep each other\'s slots');
  await A.slots.load('From B');
}
{
  const {charNameText,InputReader}=await import('./data.js');
  const names=['"Bad, ship','A,B','C"','D','E','F','G','H','I'], r=new InputReader(Uint8Array.from(charNameText(names)+'\x1a',c=>c.charCodeAt(0)));
  assert.deepEqual(Array.from({length:9},()=>r.str()),['Bad ship','AB','C','D','E','F','G','H','I']);
  const E=await fixture(); E.files.write('CHARNAME',Uint8Array.from('"open,quote,\x1a',c=>c.charCodeAt(0)));
  assert.equal((await E.data.charName()).length,9,'a damaged name file still loads');
}
{
  const disk=storage(), E=await fixture(disk), shipped=await E.files.read('IN-1.BAS');
  E.files.write('IN-1.BAS',new Uint8Array([7,7])); E.files.forget(n=>/^IN(?:MAP)?-\d+\.BAS$/.test(n));
  assert.deepEqual(await E.files.read('IN-1.BAS'),shipped,'new game sees fresh stations');
  assert.ok(disk.getItem('starcommand:file:IN-1.BAS'),'old campaign kept until the new one is saved');
  E.files.write('CHARINFO.BAS',await E.files.read('CHARINFO.BAS'));
  assert.equal(disk.getItem('starcommand:file:IN-1.BAS'),null);
}
