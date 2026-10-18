// Read-only combat aids. Decode sources refer to decode/pseudo/*.bas.md.
import { drawPanel } from './ui.js';
const arr = (E,n) => E.moduleInstance.A(n);
const val = (E,n) => E.moduleInstance.V[n] ?? 0;
// PLBATTLE 06A9: FNCrew; never call the generated helper (it writes V).
const crew = (E,m,f) => Math.floor(E.state.G[(E.currentModule==='SPBATTLE'?1300:1500)+100*m+f]+0.1);
const g = (E,i) => E.state.G[i] ?? 0;
const distance = (E,p,i,j) => Math.hypot(arr(E,p+'X!')[i]-arr(E,p+'X!')[j],arr(E,p+'Y!')[i]-arr(E,p+'Y!')[j]);
// PLBATTLE 179F..1875, 0575B..05878: strict tolerance, not a rounded radius.
export const reachBand = (distance,reach) => distance*10-reach<7 ? 2 : distance*10-reach*2<7 ? 1 : 0;
const terrain = t => t>1 && t<5 ? 105-35*t : 0; // PB 64B1, 6ADE
const aim = n => (n>0?50:0)+(n>1?30:0)+(n>2?20:0); // PB 6A8E, SB 56FF
const clamp = n => Math.max(10,Math.min(90,n));
const fmt = n => Number(n.toFixed(2));
// Framebuffer.version changes on every picture write (display.js). Share the
// decoded rows across command checks, preview and tooltip lookup until it changes.
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
function tile(E,i) { // PB 1875: Map index x+y*9
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
    // PB 06924: 21 - 3*(type=0), with QB true=-1, gives field 24.
    const skill=slot?({0:24,1:25,2:24,3:22}[g(E,rec+11)]??21):28;
    // PB 06346..06390 keeps the previous aim only for the same group (as command confirmation does).
    const old=crew(E,m,37), a=crew(E,m,38)===target && old>3 && old<7 ? old-3 : 0;
    const band=reachBand(distance(E,'Grp',target,5),slot?g(E,rec+10):10);
    pct=crew(E,m,skill)*5+crew(E,m,10)+aim(a)-arr(E,'GrpToHitMod!')[target]+crew(E,m,43)+(slot?g(E,rec+7):crew(E,m,46))+50;
    // PB 6A9C..6B69: halve before terrain/range; clamp last.
    if(command===7) pct*=0.5;
    pct=clamp(pct+terrain(tile(E,target))+terrain(tile(E,5))+(band===2?50:band===1?25:0)-50);
    shots=slot?Math.min(g(E,rec+3),g(E,rec+2)*(command===7?2:1)):command===7?2:1;
    // PB 835D..83D2: exact expectation of floor(sqrt(U)*D+1)-armor, per struck unit.
    const d=slot?g(E,rec+1):crew(E,m,45), size=arr(E,'GrpSize!')[target];
    const unitMean=u=>{
      let mean=0;
      if(arr(E,'UnitHP!')[target*5+u]<1)return 0;
      if(d===0)return Math.max(0,1-arr(E,'UnitArmor!')[target*5+u]);
      if(d>0)for(let k=1;k<=Math.ceil(d);k++)mean+=Math.max(0,k-arr(E,'UnitArmor!')[target*5+u])*(Math.min(1,(k/d)**2)-Math.min(1,((k-1)/d)**2));
      return mean;
    };
    let expected=unitMean(unit);
    // PB 082B8..082F5: exact random span distribution, uniform starting unit.
    if(type>=6&&type<=11) {
      expected=0;
      for(let n=1;n<=size;n++) {
        const probability=type===8?(n===size?1:0):(n/size)**(1/0.7)-((n-1)/size)**(1/0.7);
        for(let start=0;start<=size-n;start++)for(let u=start;u<start+n;u++)expected+=probability/(size-n+1)*unitMean(u);
      }
    }
    damage=`Expected ${type>=6&&type<=11?'group':'selected unit'} damage: ${fmt(shots*pct/100*expected)}`;
  } else {
    // SB 56FF..5745, 5816..588B. QB comparison true=-1, so defence is subtracted.
    const rec=m*7+669, old=crew(E,m,37), a=crew(E,m,38)===target && old>3 && old<7?old-3:0;
    pct=crew(E,m,18)*5+crew(E,m,10)+g(E,rec+4)+100/(distance(E,'En',5,target)+1)+aim(a)-(arr(E,'Hull!')[target]>0?arr(E,'EnDefence!')[target]:0)+50;
    pct=clamp(command===7?pct*0.5:pct);
    shots=Math.min(g(E,rec+6)*(command===7?2:1),g(E,rec)>14?g(E,2200):g(E,rec+5));
    // SB 6584..65F4: expected positive floor(sqrt(U)*D-shield), before breaches.
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
  if(pb&&rows.some(r=>r.includes('GROUND COMBAT')))return []; // briefing has no battlefield yet
  for(let i=0;i<count;i++) {
    const letter=String.fromCharCode(65+i);
    if(pb) {
      // PB 4ED5/A018: text-coordinate group sprites; 057D9/05854 letters on row 21.
      out.push({i,x:arr(E,'GrpX!')[i]*8-8,y:arr(E,'GrpY!')[i]*8-8,w:8,h:8});
      // PB 9FE1/9FF3: separate unit sprite grid.
      for(let u=0;u<arr(E,'GrpSize!')[i];u++) out.push({i,x:u*16+112,y:i*16+16,w:16,h:16});
      rows.forEach((r,y)=>{if(!/Groups In Range:/.test(r))return;for(let x=r.indexOf(':')+1;x<r.length;x++)if(r[x].toUpperCase()===letter)out.push({i,x:x*8,y:y*8,w:8,h:8});});
    } else {
      // SB 4186 visual window and 4469 long-range letter map.
      const x=arr(E,'EnX!')[i],y=arr(E,'EnY!')[i];
      if(val(E,'ViewMode!')===0) {if(Math.abs(x-arr(E,'EnX!')[5])<7&&Math.abs(y-arr(E,'EnY!')[5])<7)out.push({i,x:x*8-96,y:y*8-16,w:16,h:16});}
      else out.push({i,x:x*5-23,y:y*5+24,w:5,h:5});
    }
  }
  return out.filter(r=>r.x>=0&&r.y>=0&&r.x+r.w<=320&&r.y+r.h<=200);
}
function describe(E,i) {
  if(E.currentModule==='PLBATTLE') {
    // ENCINFO columns/live arrays: PB 0E93..15AC, 3E39, 7151; DATA_FILES §D.
    const units=Array.from({length:arr(E,'GrpSize!')[i]},(_,u)=>i*5+u).filter(u=>arr(E,'UnitHP!')[u]>0);
    return [`Group ${String.fromCharCode(65+i)}: ${arr(E,'GrpName$')[i]}`,`Alive: ${units.length}`,`HP: ${units.map(u=>fmt(arr(E,'UnitHP!')[u])).join(', ')}`,`Armor: ${units.map(u=>fmt(arr(E,'UnitArmor!')[u])).join(', ')}`,`Weapon: ${units.map(u=>['melee','rockets','flame'][arr(E,'UnitWeapon!')[u]]).join(', ')}`,`Range: ${units.map(u=>arr(E,'UnitWeapon!')[u]===1?6.7:arr(E,'UnitWeapon!')[u]===2?3.7:arr(E,'GrpMeleeRange!')[i]).join(', ')}`,`Tactic: ${arr(E,'GrpTactic!')[i]}`];
  }
  // ENCTABLE/live SB 079F..0C39, 39EE..3A0D: hull is crew/hull strength, not armor HP.
  return [`Enemy ship ${String.fromCharCode(65+i)}`,`Hull / crew: ${arr(E,'Hull!')[i]}`,`Armor: ${arr(E,'EnArmor!')[i]}`,`Alive: ${Array.from({length:val(E,'NumEnemy!')},(_,j)=>arr(E,'Hull!')[j]).filter(h=>h>0).length}`,`Weapon damage slots: ${Array.from({length:6},(_,s)=>fmt(arr(E,'WeaponDmg!')[i*6+s])).join(', ')}`,`Tactic: ${val(E,'EnTactic!')}`,`Preferred range: ${val(E,'EnTactic!')===2?9:val(E,'EnTactic!')===3?10:'approach'}`];
}
export function installCombat(E,canvas=E.display.canvas) {
  let pointer=null, range=false, hit=false;
  const enabled=k=>E.settings.on(k)&&!E.input.modal;
  const at=(x,y)=>enabled('enemyTooltips')?enemyRegions(E).filter(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h).map(r=>describe(E,r.i))[0]??null:null;
  E.combat={at,preview:()=>enabled('hitPreview')?preview(E):null,toggleRange:()=>range=!range,togglePreview:()=>hit=!hit};
  canvas?.addEventListener('mousemove',ev=>{const r=canvas.getBoundingClientRect();pointer={x:(ev.clientX-r.left)*640/r.width,y:(ev.clientY-r.top)*400/r.height};});
  canvas?.addEventListener('mouseleave',()=>pointer=null);
  // Buttons outside the picture, no game key consumed. Settings still gates every action.
  const doc=canvas?.ownerDocument, buttons=[];
  if(doc?.body) for(const [label,key,toggle] of [['Range','rangeOverlay',E.combat.toggleRange],['Hit preview','hitPreview',E.combat.togglePreview]]) {
    const b=doc.createElement('button');b.textContent=label;b.type='button';b.hidden=true;Object.assign(b.style,{position:'fixed',zIndex:'11',fontSize:'11px'});b.onclick=()=>{toggle();canvas.focus?.();};doc.body.appendChild(b);buttons.push({b,key});
  }
  E.display.overlays.push(ctx=>{
    const phase=commandPhase(E),pb=E.currentModule==='PLBATTLE';
    for(const [i,{b,key}] of buttons.entries()) {
      b.hidden=!phase||!enabled(key)||(key==='rangeOverlay'&&!pb)||!pointer||pointer.x<520||pointer.y<360;
      const rect=canvas.getBoundingClientRect();b.style.left=`${rect.right-110}px`;b.style.top=`${rect.bottom-44+i*22}px`;
    }
    if(phase&&pb&&range&&enabled('rangeOverlay')) {
      // PB grid 02486, reach 17F8/183B; selected member is K!, squad position slot 5.
      const m=val(E,'K!'),slot=crew(E,m,32),reach=slot?g(E,slot*12+798):10,v=E.display.view??{scale:1,ox:0,oy:0};
      ctx.save();ctx.scale(v.scale,v.scale);ctx.translate(-v.ox*2,-v.oy*2);
      for(let y=5;y<19;y++)for(let x=26;x<40;x++) {const b=reachBand(Math.hypot(x-arr(E,'GrpX!')[5],y-arr(E,'GrpY!')[5]),reach);if(b){ctx.fillStyle=b===2?'rgba(85,255,255,.24)':'rgba(255,255,85,.16)';ctx.fillRect((x*8-8)*2,(y*8-8)*2,16,16);}}
      ctx.restore();drawPanel(ctx,E,0,0,[`Member ${m} reach: cyan A / yellow a`],{scale:1});
    }
    if(phase&&hit&&enabled('hitPreview')) {const p=preview(E);if(p)drawPanel(ctx,E,0,300,p.lines,{scale:1});}
    if(!enabled('enemyTooltips'))return;
    let tip;
    const h=E.input.highlight;
    if(h&&E.input.lastDevice==='gamepad')tip=at((h.col-1)*8,(h.row-1)*8);
    if(!tip&&phase&&E.input.lastDevice==='gamepad')tip=describe(E,val(E,pb?'TgtGrp!':'ShieldNo!'));
    if(E.input.lastDevice!=='gamepad'&&pointer){const p=E.display.viewToLogical(pointer.x,pointer.y);tip=at(p.x,p.y);}
    if(tip)drawPanel(ctx,E,0,0,tip,{scale:1});
  });
}
