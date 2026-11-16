import assert from 'node:assert/strict';
import {installCombat,reachBand,preview,enemyRegions,commandPhase} from './combat.js';
assert.equal(reachBand(1.6999,10),2);
assert.equal(reachBand(1.7,10),1);
assert.equal(reachBand(2.7,10),0);
const arrays={'GrpX!':[26,0,0,0,0,26],'GrpY!':[5,0,0,0,0,5],'GrpSize!':[1],'GrpName$':['Test'],'UnitHP!':[10],'UnitArmor!':[2],'UnitWeapon!':[0],'GrpAttackVerb!':[1],'GrpMeleeRange!':[10],'GrpTactic!':[1],'GrpToHitMod!':[0],'Map%':Array(81).fill(1)};
const E={currentModule:'PLBATTLE',moduleInstance:{V:{'K!':1,'MemberCmd!':1,'TgtGrp!':0,'Unit!':0,'NGroups!':1},A:n=>arrays[n]??[]},state:{G:new Float32Array(2601)},text:{screenText:()=>['Groups In Range: A','Command: Attack']},settings:{on:()=>true},input:{},display:{overlays:[],viewToLogical:(x,y)=>({x,y})}};
E.state.G[1600+45]=3;
const before=JSON.stringify({arrays,V:E.moduleInstance.V,G:[...E.state.G]});
let p=preview(E);
assert.equal(p.pct,50);assert.equal(p.hits,.5);
assert.ok(p.lines[2].includes('0.28'));
E.moduleInstance.V['MemberCmd!']=7;assert.equal(preview(E).pct,25);assert.equal(preview(E).shots,2);
E.moduleInstance.V['MemberCmd!']=1;
Object.assign(E.state.G,{1632:1,1624:2,1618:7,800:1,801:3,802:1,803:1,806:1,810:10,811:0});
assert.equal(preview(E).pct,60,'type 0 uses the field-24 skill');
Object.assign(E.state.G,{1632:0,1624:0,1618:0,800:0,801:0,802:0,803:0,806:0,810:0,811:0});
let decodes=0, rows=['Groups In Range: A','Command: Attack'];
E.fb={version:1};E.text.screenText=()=>{decodes++;return rows;};
assert.equal(commandPhase(E),true);preview(E);enemyRegions(E);
assert.equal(decodes,1);
rows=['GROUND COMBAT'];E.fb.version++;
assert.equal(commandPhase(E),false);assert.equal(preview(E),null);assert.deepEqual(enemyRegions(E),[]);
assert.equal(decodes,2);
rows=['Groups In Range: A','Command: Attack'];E.fb.version++;
installCombat(E);
assert.ok(E.combat.at(112,16));assert.ok(enemyRegions(E).some(r=>r.x===200));
assert.equal(JSON.stringify({arrays,V:E.moduleInstance.V,G:[...E.state.G]}),before);
E.settings.on=()=>false;assert.equal(E.combat.at(112,16),null);assert.equal(E.combat.preview(),null);
E.display.overlays[0]({});
E.settings.on=()=>true;E.input.modal={};assert.equal(E.combat.at(112,16),null);
E.input.modal=null;E.currentModule='SPACE';assert.equal(preview(E),null);
E.currentModule='SPBATTLE';E.moduleInstance.V={'J!':3,'Command!':7,'ShieldNo!':0,'NumEnemy!':1,'ViewMode!':0};
Object.assign(arrays,{'EnX!':[20,0,0,0,0,20],'EnY!':[10,0,0,0,0,10],'Hull!':[5],'EnDefence!':[200],'Facing!':[0],'Shield!':[0],'WeaponDmg!':Array(6).fill(10),'EnArmor!':[20]});
Object.assign(E.state.G,{690:1,691:3,694:0,695:1,696:2});
p=preview(E);assert.equal(p.pct,10);assert.equal(p.shots,1);assert.equal(p.hits,.1);
assert.equal(p.lines[2],'Expected armor damage: 0.14');
const ctx=new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
const snapshot=JSON.stringify({arrays,V:E.moduleInstance.V,G:[...E.state.G]});
E.combat.togglePreview();
E.display.overlays[0](ctx);
assert.equal(JSON.stringify({arrays,V:E.moduleInstance.V,G:[...E.state.G]}),snapshot);
E.settings.on=()=>false;
E.display.overlays[0](new Proxy({},{get:()=>()=>{throw Error('disabled overlay drew');}}));
E.currentModule='PLBATTLE';E.moduleInstance={V:{'NGroups!':1},A:n=>({...arrays,'UnitHP!':[25.73],'UnitArmor!':[2.4]})[n]??[]};E.settings.on=()=>true;
E.text.screenText=()=>['Groups In Range: A','Command: Attack'];E.fb.version++;
const gtip=E.combat.at(112,16);assert.ok(gtip.includes('Armor: 2')&&gtip.includes('Standing: 1 of 1')&&gtip.includes('HP per unit: 26')&&gtip.includes('Weapon: laser')&&!/Tactic|\d\.\d/.test(gtip.join()),'ground tooltip: actual attack, health and whole numbers');
for(const [v,w] of [[2,'claw'],[3,'sting'],[4,'bite']]){arrays['GrpAttackVerb!'][0]=v;assert.ok(E.combat.at(112,16).includes(`Weapon: ${w}`));}
Object.assign(arrays,{'GrpSize!':[3],'UnitWeapon!':[1,2,0]});
E.moduleInstance.A=n=>({...arrays,'UnitHP!':[12.2,25.73,0]})[n]??[];
assert.ok(E.combat.at(112,16).includes('Weapon: rocket launcher, flame thrower'));
assert.ok(E.combat.at(112,16).includes('HP per unit: 12-26'));
E.moduleInstance.A=n=>({...arrays,'UnitHP!':[0,0,0]})[n]??[];
assert.ok(E.combat.at(112,16).includes('HP per unit: 0'));assert.ok(E.combat.at(112,16).includes('Weapon: none'));
const ships={'EnX!':[20,25],'EnY!':[10,10],'Hull!':[4.6,3],'EnArmor!':[20.2,10],'WeaponDmg!':[55.34,-30,90,0,0,0,-40,-60,20,0,0,0],'WeaponOK!':[1,2,0,1,0,0,1,1,0,0,0,0]};
E.currentModule='SPBATTLE';E.moduleInstance={V:{'NumEnemy!':2,'ViewMode!':1,'EnTactic!':3},A:n=>ships[n]??[]};E.fb.version++;
const stip=E.combat.at(77,74);assert.deepEqual(stip,['Enemy ship A','Hull: 5','Armor: 20','Weapons: 1 energy gun, 1 missile launcher','Keeps to range: 10']);
assert.ok(E.combat.at(102,74).includes('Weapons: 2 missile launchers'));
ships['WeaponOK!'].fill(0);assert.ok(E.combat.at(77,74).includes('Weapons: none'));
let letters=0;const lctx=new Proxy({},{get:(o,k)=>k==='fillRect'?()=>letters++:o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});E.text.glyphs=[];E.combat.togglePreview();
E.display.overlays[0](lctx);assert.ok(letters>0,'ship letter drawn on the space battle visual');
Object.assign(ships,{'EnX!':[20,33,8],'EnY!':[10,10,-4]});E.moduleInstance.V['NumEnemy!']=3;E.fb.version++;assert.ok(E.combat.at(77,74));assert.equal(E.combat.at(144,76),null,'x 33 outside the scan window');assert.equal(E.combat.at(19,6),null,'y -4 outside the scan window');
console.log('combat boundary, expectations, gating, sprite recognition and read-only tests pass');

if (process.argv.includes('--shots')) {
  const { spawn } = await import('node:child_process');
  const { mkdirSync, writeFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const port = 9800 + process.pid % 500, pause = ms => new Promise(r => setTimeout(r,ms));
  const chrome = spawn(process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new',`--remote-debugging-port=${port}`,`--user-data-dir=${join(tmpdir(),'v13-combat-'+process.pid)}`,'--window-size=640,400','about:blank'], {stdio:'ignore'});
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
    const out = new URL('../../acceptance/out/v1.3/',import.meta.url);
    mkdirSync(out,{recursive:true});
    const key=async k=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:k,text:k==='Enter'?'\r':k,windowsVirtualKeyCode:k==='Enter'?13:k.charCodeAt(0)});await send('Input.dispatchKeyEvent',{type:'keyUp',key:k});await pause(650);};

    for (const [screen,keys] of [['PB-05',[]],['SB-05',[]]]) {
      await send('Page.navigate',{url:`${process.env.GAME_URL || 'http://127.0.0.1:8094/index.html'}?screen=${screen}`});
      for(let i=0;i<60;i++){if(await evaluate('!!window.E?.moduleInstance'))break;await pause(200);}
      for(let i=0;i<240;i++){if(await evaluate("E.text.screenText().some(r=>r.includes('Command:'))"))break;await pause(200);}
      for(const k of keys)await key(k);
      assert.ok(await evaluate("E.text.screenText().some(r=>r.includes('Command:'))"),screen+' command reached');
      await key('F');
      await evaluate("import('./engine/combat.js').then(m=>m.installCombat(E))");
      const before=await evaluate('Array.from(E.fb.pix)');
      await evaluate('E.combat.toggleRange(); E.combat.togglePreview()');
      const point=await evaluate("import('./engine/combat.js').then(m=>m.enemyRegions(E)[0])");
      if(point)await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x*2+2,y:point.y*2+2});
      await pause(250);
      assert.ok(await evaluate("!!E.combat.preview()"),'preview model present');
      const shot=await send('Page.captureScreenshot',{format:'png'});
      writeFileSync(new URL(screen+'-combat.png',out),Buffer.from(shot.result.data,'base64'));
    }
  } finally {ws?.close();chrome.kill();}
}

{
  const h={},bs=[],doc={body:{appendChild:b=>bs.push(b)},createElement:()=>({style:{},offsetWidth:70})};
  const cv={ownerDocument:doc,addEventListener:(t,f)=>h[t]=f,getBoundingClientRect:()=>({left:0,top:0,right:640,bottom:400,width:640,height:400}),focus:o=>cv.f=o};
  const E2={...E,currentModule:'PLBATTLE',fb:undefined,text:{screenText:()=>['Groups In Range: A','Command: Attack']},display:{...E.display,overlays:[]}};installCombat(E2,cv);const draw=()=>E2.display.overlays[0]({save(){},restore(){},fillRect(){},measureText:()=>({width:0}),fillText(){}});
  h.mousemove({clientX:600,clientY:390});draw();assert.equal(bs[1].hidden,true);
  h.mousemove({clientX:600,clientY:30});draw();assert.equal(bs[1].hidden,false);assert.deepEqual([bs[0].style.left,bs[0].style.top,bs[1].style.top],['558px','12px','34px']);
  h.mouseleave({relatedTarget:bs[1]});draw();assert.equal(bs[1].hidden,false);
  bs[1].onmouseleave({relatedTarget:bs[0]});draw();assert.equal(bs[0].hidden,false);
  bs[0].onmouseleave({relatedTarget:null});draw();assert.equal(bs[0].hidden,true);
  bs[0].onclick();assert.deepEqual(cv.f,{focusVisible:false});
}
