import { drawPanel, drawText, UI } from './ui.js';
const arr = (E,n) => E.moduleInstance.A(n);
const val = (E,n) => E.moduleInstance.V[n] ?? 0;
const crew = (E,m,f) => Math.floor(E.state.G[(E.currentModule==='SPBATTLE'?1300:1500)+100*m+f]+0.1);
const g = (E,i) => E.state.G[i] ?? 0;
const distance = (E,p,i,j) => Math.hypot(arr(E,p+'X!')[i]-arr(E,p+'X!')[j],arr(E,p+'Y!')[i]-arr(E,p+'Y!')[j]);
export const reachBand = (distance,reach) => distance*10-reach<7 ? 2 : distance*10-reach*2<7 ? 1 : 0;
const terrain = t => t>1 && t<5 ? 105-35*t : 0;
const aim = n => (n>0?50:0)+(n>1?30:0)+(n>2?20:0);
const clamp = n => Math.max(10,Math.min(90,n));
const fmt = n => Number(n.toFixed(2));
const screenCache = new WeakMap();
function screen(E) {
  const version = E.fb?.version, cached = screenCache.get(E);
  if (version !== undefined && cached?.version === version && cached.text === E.text) return cached;
  const rows = E.text.screenText(), model = {version, text:E.text, rows, joined:rows.join('\n')};
  screenCache.set(E, model);
  return model;
}
export function commandPhase(E) {
  if (!E.moduleInstance || !['PLBATTLE','SPBATTLE'].includes(E.currentModule)) return false;
  const text = screen(E).joined;
  return /Command:/.test(text) && (E.currentModule==='PLBATTLE' ? /Groups In Range:/.test(text) : true);
}
function tile(E,i) {
  return arr(E,'Map%')[Math.floor(arr(E,'GrpX!')[i]*0.5-12)+9*Math.floor(arr(E,'GrpY!')[i]*0.5-1.5)];
}
export function preview(E) {
  if (!commandPhase(E)) return null;
  const pb=E.currentModule==='PLBATTLE', m=val(E,pb?'K!':'J!'), command=val(E,pb?'MemberCmd!':'Command!');
  if (![1,7].includes(command)) return {lines:['Selected command: no shots this turn']};
  const target=val(E,pb?'TgtGrp!':'ShieldNo!'), unit=val(E,'Unit!');
  let pct, shots, damage;
  if(pb) {
    const slot=crew(E,m,32), rec=slot*12+788, type=slot?g(E,rec+6):0;
    const skill=slot?({0:24,1:25,2:24,3:22}[g(E,rec+11)]??21):28;
    const old=crew(E,m,37), a=crew(E,m,38)===target && old>3 && old<7 ? old-3 : 0;
    const band=reachBand(distance(E,'Grp',target,5),slot?g(E,rec+10):10);
    pct=crew(E,m,skill)*5+crew(E,m,10)+aim(a)-arr(E,'GrpToHitMod!')[target]+crew(E,m,43)+(slot?g(E,rec+7):crew(E,m,46))+50;
    if(command===7) pct*=0.5;
    pct=clamp(pct+terrain(tile(E,target))+terrain(tile(E,5))+(band===2?50:band===1?25:0)-50);
    shots=slot?Math.min(g(E,rec+3),g(E,rec+2)*(command===7?2:1)):command===7?2:1;
    const d=slot?g(E,rec+1):crew(E,m,45), size=arr(E,'GrpSize!')[target];
    const unitMean=u=>{
      let mean=0;
      if(arr(E,'UnitHP!')[target*5+u]<1)return 0;
      if(d===0)return Math.max(0,1-arr(E,'UnitArmor!')[target*5+u]);
      if(d>0)for(let k=1;k<=Math.ceil(d);k++)mean+=Math.max(0,k-arr(E,'UnitArmor!')[target*5+u])*(Math.min(1,(k/d)**2)-Math.min(1,((k-1)/d)**2));
      return mean;
    };
    let expected=unitMean(unit);
    if(type>=6&&type<=11) {
      expected=0;
      for(let n=1;n<=size;n++) {
        const probability=type===8?(n===size?1:0):(n/size)**(1/0.7)-((n-1)/size)**(1/0.7);
        for(let start=0;start<=size-n;start++)for(let u=start;u<start+n;u++)expected+=probability/(size-n+1)*unitMean(u);
      }
    }
    damage=`Expected ${type>=6&&type<=11?'group':'selected unit'} damage: ${fmt(shots*pct/100*expected)}`;
  } else {
    const rec=m*7+669, old=crew(E,m,37), a=crew(E,m,38)===target && old>3 && old<7?old-3:0;
    pct=crew(E,m,18)*5+crew(E,m,10)+g(E,rec+4)+100/(distance(E,'En',5,target)+1)+aim(a)-(arr(E,'Hull!')[target]>0?arr(E,'EnDefence!')[target]:0)+50;
    pct=clamp(command===7?pct*0.5:pct);
    shots=Math.min(g(E,rec+6)*(command===7?2:1),g(E,rec)>14?g(E,2200):g(E,rec+5));
    const facing=arr(E,'Facing!')[target], shield=arr(E,'Shield!')[facing+4*target], d=g(E,rec+1);
    let mean=0;
    if(d>0) for(let k=1;k<=Math.ceil(d-shield);k++) mean+=Math.max(0,1-((k+shield)/d)**2);
    damage=`Expected armor damage: ${fmt(shots*pct/100*mean)}`;
  }
  return {pct,shots,hits:shots*pct/100,lines:[`Hit chance: ${fmt(pct)}% / shot`,`Expected hits: ${fmt(shots*pct/100)} (${shots} shots)`,damage,'Estimate before intervening actions / kills']};
}
export function enemyRegions(E) {
  if(!E.moduleInstance) return [];
  const out=[], pb=E.currentModule==='PLBATTLE', sb=E.currentModule==='SPBATTLE';
  if(!pb&&!sb)return out;
  const rows=screen(E).rows, count=val(E,pb?'NGroups!':'NumEnemy!');
  if(pb&&rows.some(r=>r.includes('GROUND COMBAT')))return [];
  for(let i=0;i<count;i++) {
    const letter=String.fromCharCode(65+i);
    if(pb) {
      out.push({i,x:arr(E,'GrpX!')[i]*8-8,y:arr(E,'GrpY!')[i]*8-8,w:8,h:8});
      for(let u=0;u<arr(E,'GrpSize!')[i];u++) out.push({i,x:u*16+112,y:i*16+16,w:16,h:16});
      rows.forEach((r,y)=>{if(!/Groups In Range:/.test(r))return;for(let x=r.indexOf(':')+1;x<r.length;x++)if(r[x].toUpperCase()===letter)out.push({i,x:x*8,y:y*8,w:8,h:8});});
    } else {
      const x=arr(E,'EnX!')[i],y=arr(E,'EnY!')[i];
      if(val(E,'ViewMode!')===0) {if(x>13&&x<28&&y>3&&y<17)out.push({i,x:x*8-96,y:y*8-16,w:16,h:16});}
      else if(x>=8&&x<=32&&y>=-3&&y<=23)out.push({i,x:x*5-23,y:y*5+24,w:5,h:5});
    }
  }
  return out.filter(r=>r.x>=0&&r.y>=0&&r.x+r.w<=320&&r.y+r.h<=200);
}
const span = ns => { const v=ns.map(Math.round), lo=Math.min(...v), hi=Math.max(...v); return v.length ? lo===hi ? `${lo}` : `${lo}-${hi}` : '0'; };
function describe(E,i) {
  if(E.currentModule==='PLBATTLE') {
    const size=arr(E,'GrpSize!')[i], units=Array.from({length:size},(_,u)=>i*5+u).filter(u=>arr(E,'UnitHP!')[u]>0);
    const kinds=[...new Set(units.map(u=>arr(E,'UnitWeapon!')[u]))];
    return [`Group ${String.fromCharCode(65+i)}: ${arr(E,'GrpName$')[i]}`,`Standing: ${units.length} of ${size}`,`HP per unit: ${span(units.map(u=>arr(E,'UnitHP!')[u]))}`,`Armor: ${span(units.map(u=>arr(E,'UnitArmor!')[u]))}`,
      `Weapon: ${kinds.map(k=>k===0?['','laser','claw','sting','bite'][arr(E,'GrpAttackVerb!')[i]]:['','rocket launcher','flame thrower'][k]).join(', ')||'none'}`,`Range: ${kinds.map(k=>k===1?7:k===2?4:Math.round(arr(E,'GrpMeleeRange!')[i])).join(', ')||'0'}`];
  }
  const t=val(E,'EnTactic!'), weapons=Array.from({length:6},(_,s)=>i*6+s).filter(s=>arr(E,'WeaponOK!')[s]>0).map(s=>arr(E,'WeaponDmg!')[s]);
  const counts=[weapons.filter(d=>d>0).length,weapons.filter(d=>d<0).length];
  return [`Enemy ship ${String.fromCharCode(65+i)}`,`Hull: ${Math.round(arr(E,'Hull!')[i])}`,`Armor: ${Math.round(arr(E,'EnArmor!')[i])}`,`Weapons: ${counts.map((n,k)=>n?`${n} ${k?'missile launcher':'energy gun'}${n===1?'':'s'}`:'').filter(Boolean).join(', ')||'none'}`,`Keeps to range: ${t===2?9:t===3?10:'closes in'}`];
}
export function installCombat(E,canvas=E.display.canvas) {
  let pointer=null, range=false, hit=false;
  const enabled=k=>E.settings.on(k)&&!E.input.modal;
  const at=(x,y)=>enabled('enemyTooltips')?enemyRegions(E).filter(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h).map(r=>describe(E,r.i))[0]??null:null;
  E.combat={at,preview:()=>enabled('hitPreview')?preview(E):null,toggleRange:()=>range=!range,togglePreview:()=>hit=!hit};
  canvas?.addEventListener('mousemove',ev=>{const r=canvas.getBoundingClientRect();pointer={x:(ev.clientX-r.left)*640/r.width,y:(ev.clientY-r.top)*400/r.height};});
  canvas?.addEventListener('mouseleave',ev=>{if(!buttons.some(o=>o.b===ev.relatedTarget))pointer=null;});
  const doc=canvas?.ownerDocument, buttons=[];
  if(doc?.body) for(const [label,key,toggle] of [['Range','rangeOverlay',E.combat.toggleRange],['Hit preview','hitPreview',E.combat.togglePreview]]) {
    const b=doc.createElement('button');b.textContent=label;b.type='button';b.hidden=true;Object.assign(b.style,{position:'fixed',zIndex:'11',fontSize:'11px'});b.onmousedown=ev=>ev.preventDefault();b.onmouseleave=ev=>{if(ev.relatedTarget!==canvas&&!buttons.some(o=>o.b===ev.relatedTarget))pointer=null;};b.onclick=()=>{toggle();canvas.focus?.({focusVisible:false});};doc.body.appendChild(b);buttons.push({b,key});
  }
  E.display.overlays.push(ctx=>{
    const phase=commandPhase(E),pb=E.currentModule==='PLBATTLE';
    for(const [i,{b,key}] of buttons.entries()) {
      b.hidden=!phase||!enabled(key)||(key==='rangeOverlay'&&!pb)||!pointer||pointer.x<520||pointer.y>60;
      const rect=canvas.getBoundingClientRect();b.style.left=`${rect.left+rect.width*628/640-b.offsetWidth}px`;b.style.top=`${rect.top+rect.height*12/400+i*22}px`;
    }
    if(phase&&pb&&range&&enabled('rangeOverlay')) {
      const m=val(E,'K!'),slot=crew(E,m,32),reach=slot?g(E,slot*12+798):10;
      ctx.save();
      for(let y=5;y<19;y++)for(let x=26;x<40;x++) {const b=reachBand(Math.hypot(x-arr(E,'GrpX!')[5],y-arr(E,'GrpY!')[5]),reach);if(b){ctx.fillStyle=b===2?'rgba(85,255,255,.24)':'rgba(255,255,85,.16)';ctx.fillRect((x*8-8)*2,(y*8-8)*2,16,16);}}
      ctx.restore();drawPanel(ctx,E,0,0,[`Member ${m} reach: cyan A / yellow a`],{scale:1});
    }
    if(phase&&hit&&enabled('hitPreview')) {const p=preview(E);if(p)drawPanel(ctx,E,0,300,p.lines,{scale:1});}
    if(!enabled('enemyTooltips'))return;
    if(E.currentModule==='SPBATTLE'&&E.moduleInstance&&val(E,'ViewMode!')!==0)for(const r of enemyRegions(E)){ctx.fillStyle=UI.bg;ctx.fillRect((r.x+r.w)*2,r.y*2-2,18,20);drawText(ctx,E,String.fromCharCode(65+r.i),(r.x+r.w)*2+1,r.y*2,UI.key,2);}
    let tip;
    if(pointer){const p=E.display.viewToLogical(pointer.x,pointer.y);tip=at(p.x,p.y);}
    if(tip)drawPanel(ctx,E,pointer.x+12,pointer.y+12,tip,{scale:1});
  });
}
