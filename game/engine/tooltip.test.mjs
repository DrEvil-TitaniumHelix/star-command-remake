import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { installTooltips } from './tooltip.js';
import { Framebuffer } from './display.js';
import { Text } from './text.js';
const json = p => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const items = json('../assets/data/items.json'), info = json('../assets/data/INFO.json').values;
const tables = [['crew pay',0,14,'monthly wage',0],['ships',58,9,'price',3],['shields',175,5,'strength',2],['defense hardware',190,5,'percent',2],['missile killers',205,3,'price',1],['guns',214,25,'damage',0],['squad weapons',414,54,'range',4],['hand weapons',1062,6,'points',0],['sighting units',1080,4,'price',1],['armor suits',1092,16,'armor points',0],['misc items',1140,11,'price',1]];
for (const [group,base,count,key,col] of tables) {
  const records = items.filter(i => i.group === group);
  assert.equal(records.length,count);
  for (const i of [0,Math.floor(count/2),count-1]) {
    assert.equal(records[i].fields[key],info[base+i+col*count], `${group} ${i}`);
    for (const k of Object.keys(records[i].fields)) assert.match(records[i].src[k],/INFO.BAS table/);
  }
}
assert.equal(items.find(i=>i.group==='crew pay' && i.index===1).name,'Private');
assert.equal(items.find(i=>i.group==='crew pay' && i.index===13).name,'Grand Admiral');
const fb = new Framebuffer(2), text = new Text(fb,json('../assets/font8x8.json'));
text.locate(16,2); text.print('A-5.56mm Palm Gun'); text.locate(24,2); text.print('Select A Weapon', ';');
let enabled = true;
const listeners = {}, overlays = [];
const E = {currentModule:'STARPORT',text,input:{},settings:{on:()=>enabled},data:{table:async()=>items},display:{overlays,viewToLogical:(x,y)=>({x:x/2,y:y/2})}};
installTooltips(E,{addEventListener:(key,f)=>listeners[key]=f,getBoundingClientRect:()=>({left:0,top:0,width:640,height:400})});
await E.tooltips.ready;
assert.equal(E.tooltips.at(28,120).title,'5.56mm Palm Gun');
assert.equal(E.tooltips.at(8,120).title,'5.56mm Palm Gun');
assert.equal(E.tooltips.at(250,120),null);
assert.equal(E.tooltips.at(8,112),null);
let panels=0;
const ctx = new Proxy({}, {get:(_,key)=> key==='fillRect' ? ()=>panels++ : ()=>{}});
let minX=1e9;overlays[0](new Proxy({}, {get:(_,key)=> key==='fillRect' ? x=>{minX=Math.min(minX,x);} : ()=>{}}));assert.ok(minX>=(38-2)*16 && minX<(38-1)*16,'price column reads 20, the whole number the original prints');
overlays[0](ctx); const priceOnly=panels; assert.ok(priceOnly>0 && priceOnly<200,'no pointer: only the price beside the row');
panels=0; listeners.mousemove({clientX:56,clientY:240}); overlays[0](ctx); assert.ok(panels>priceOnly,'pointer adds the tooltip panel');
enabled=false; assert.equal(E.tooltips.at(28,120),null);
const before=panels; overlays[0](ctx); assert.equal(panels,before);
enabled=true;
text.cls(); text.locate(16,2); text.print('A-Standard Combat Suit',';'); text.locate(24,2); text.print('Select A Armor',';');
assert.equal(E.tooltips.at(24,120).title,'Standard Combat Suit');
E.currentModule='PLBATTLE'; assert.equal(E.tooltips.at(24,120),null);
text.cls(); text.locate(20,2); text.print('Ortiz Is Using:',';');text.locate(21,2);text.print('5.56mm Palm Gun',';');
assert.equal(E.tooltips.at(8,160).title,'5.56mm Palm Gun');
E.currentModule='SPACE'; text.cls();text.locate(2,7);text.print('EQUIPPING',';');text.locate(4,3);text.print('A-1 Weapon',';');text.locate(5,5);text.print('9mm Revolver',';');
assert.equal(E.tooltips.at(16,24).title,'9mm Revolver','selector on preceding equip line');
listeners.mouseleave();
const leaveBefore=panels;overlays[0](ctx);assert.equal(panels,leaveBefore);
for (const [name,base,cargo,points] of [['Wasp',40,12,200],['Dagger',84,28,124],['Hunter',190,80,50],['Warrior',201,99,50],['Ranger',191,75,50]]) {
  const item=items.find(i=>i.group==='ships' && i.name===name);
  assert.equal(item.fields['base weight'],base,name+' base weight');
  assert.equal(item.fields['cargo capacity'],cargo,name+' cargo');
  assert.equal(item.fields['armor points per ton'],points,name+' armor per ton');
  assert.equal(item.fields['tons per armor point'],info[58+item.index+90]);
  assert.equal(item.fields['ship table weight'],info[58+item.index+9]);
}
const show=(name,prompt='Select A Weapon')=>{
  E.currentModule='STARPORT';text.cls();text.locate(16,2);text.print('A-'+name,';');
  text.locate(24,2);text.print(prompt,';');return E.tooltips.at(24,120);
};
let tip=show('Dagger','Price:');
assert.ok(tip.lines.includes('Base weight: 84'));
assert.ok(tip.lines.includes('Cargo capacity: 28'));
assert.ok(tip.lines.includes('Armor points per ton: 124'));
assert.ok(tip.lines.includes('Size class: Escort'));
assert.ok(!tip.lines.some(l=>/ship table weight|tons per armor point|size class: 1/i.test(l)));
tip=show('5.56mm Palm Gun');
assert.ok(tip.lines.includes('Damage type: bullet'));
assert.ok(tip.lines.includes('Required skill: Light Arms'));
assert.ok(tip.lines.includes('Price: 20.4'));
assert.ok(tip.lines.includes('Ammo price: 3.6'));
for (const name of ['5.56mm Palm Gun','Hypervelocity Rocket']) {
  tip=show(name,'Buy ammo for which gun? (1-6)');
  const item=items.find(i=>i.name===name);
  assert.ok(tip.lines.includes(`Ammo price: ${Number(Math.fround(item.fields['ammo price']*Math.fround(1.2)).toPrecision(7))}`));
  assert.ok(!tip.lines.some(l=>l.startsWith('Base price:')));
}
assert.ok(show('Nerve Gas Canister').lines.includes('Damage type: chemical'));
assert.ok(show('Fragmentation Grenade').lines.includes('Damage type: explosive'));
const hand=items.find(i=>i.group==='hand weapons' && i.index===5);
assert.equal(hand.fields['to hit bonus'],info[1062+5+12]);
assert.ok(show(hand.name,'Select A Hand Weapon').lines.includes(`To hit bonus: ${hand.fields['to hit bonus']}`));
show('5.56mm Palm Gun');listeners.mousemove({clientX:56,clientY:240});
const idlePixels=fb.pix.slice();
E.input.modal={key(){}};
assert.equal(E.tooltips.at(24,120),null);
const modalBefore=panels;overlays[0](ctx);assert.equal(panels,modalBefore,'modal suppresses pointer tooltip');
E.input.modal=null;overlays[0](ctx);assert.ok(panels>modalBefore,'tooltip resumes after modal');
assert.deepEqual(fb.pix,idlePixels,'tooltip never modifies framebuffer');
listeners.mouseleave();
{ const fb1=new Framebuffer(2);fb1.mode=1;const t1=new Text(fb1,json('../assets/font8x8.json'));let drawn=0;const c1={fillRect:()=>drawn++};
  const now=performance.now;performance.now=()=>0;t1.drawCursor(c1,[255,255,255]);assert.equal(drawn,0,'no cursor outside a prompt');
  t1.typing=true;t1.drawCursor(c1,[255,255,255]);assert.equal(drawn,1,'cursor while typing a name in SCREEN 1');performance.now=now; }
console.log('tooltip data, Text recognition, selector, pointer, default invisibility and toggle tests pass');

if (process.argv.includes('--shots')) {
  const { spawn } = await import('node:child_process');
  const { mkdirSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const port = 9800 + process.pid % 500, pause = ms => new Promise(r => setTimeout(r,ms));
  const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${join(tmpdir(),'v12-tips-'+process.pid)}`,'--window-size=640,400','about:blank'], {stdio:'ignore'});
  let ws;
  try {
    let page;
    for (let i=0;i<60;i++) { try { page=(await (await fetch(`http://localhost:${port}/json/new?about:blank`,{method:'PUT'})).json()); break; } catch {await pause(200);} }
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise(r=>ws.onopen=r);
    let id=0; const pending=new Map();
    ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.method==='Runtime.exceptionThrown')console.log('browser exception',JSON.stringify(m.params)); if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}};
    const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.result?.value;
    await send('Runtime.enable'); await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride',{width:640,height:400,deviceScaleFactor:1,mobile:false});
    const out = new URL('../../acceptance/out/v1.2/',import.meta.url);
    mkdirSync(out,{recursive:true});
    const key=async k=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:k,text:k==='Enter'?'\r':k,windowsVirtualKeyCode:k==='Enter'?13:k.charCodeAt(0)});await send('Input.dispatchKeyEvent',{type:'keyUp',key:k});await pause(650);};
    for (const [screen,keys] of [['PT-04',['A','P','A','A']],['PT-05',['B']],['PT-06',[]],['SP-10',[]],['PB-04',['A','1']]]) {
      for(let attempt=0;attempt<3;attempt++) {
        await send('Page.navigate',{url:`${process.env.GAME_URL || 'http://127.0.0.1:8094/index.html'}?screen=${screen}&shot=${attempt}`});
        let loaded=false;
        for(let wait=0;wait<50;wait++){if(await evaluate('!!window.E?.currentModule')){loaded=true;break;}await pause(200);}
        if(loaded)break;
      }
      await pause(1800);
      for(const k of keys) await key(k);
      assert.ok(await evaluate('!!window.E'),screen+' engine loaded');
      await evaluate("E.settings.set('itemTooltips',false)");
      const off=(await send('Page.captureScreenshot',{format:'png'})).result.data;
      await evaluate("E.settings.set('itemTooltips',true)");
      const on=(await send('Page.captureScreenshot',{format:'png'})).result.data;
      assert.equal(on,off,screen+' no-pointer tooltip toggle preserves screenshot');
      const rows=await evaluate('window.E?.text.screenText()');
      console.log(screen,JSON.stringify(rows),await evaluate('document.body.innerText')); 
      const point=await evaluate(`(async()=>{if(!window.E)return null;const rows=E.text.screenText();const records=await (await fetch('assets/data/items.json')).json();for(const y of [...Array.from({length:10},(_,i)=>15+i),...Array.from({length:15},(_,i)=>i)])for(const item of records){if(item.group==='crew pay')continue;const x=rows[y].indexOf(item.name);if(x<0)continue;const tip=E.tooltips.at(x*8,y*8);if(tip)return {x:x*8,y:y*8,title:tip.title};}const tip=E.tooltips.at(8,40);return tip?{x:8,y:40,title:tip.title}:null})()`);
      if(point){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x*2+2,y:point.y*2+2});await pause(150);const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(new URL(screen+'-tip.png',out),Buffer.from(shot.result.data,'base64'));console.log('captured',screen,point);}
      else console.log('NO ITEM',screen,await evaluate('window.E?.tooltips.error'));
    }
  } finally {ws?.close();chrome.kill();}
}
