import { KEY } from './input.js';
const contains = (r,x,y) => x>=r.x && y>=r.y && x<r.x+r.w && y<r.y+r.h;
const cellRegion = (key,row,col,len,kind='text') => ({key,x:8*(col-1),y:8*(row-1),w:8*len,h:8,kind});
export function textRegions(text, menuItems=[]) {
  const out=[];
  const add=(k,r,c,n,kind)=>out.push(cellRegion(k,r,c,n,kind));
  const lines=text.screenText();
  const picker=lines.some(line=>/Who will (?:change positions|change weapons|fix it|fire)\?|Who Will Buy\?|Change with who\?|Dismiss Which Squad Member\?|Clone who\?|Inspect Who\?|Switch who\?|With who\?|Who'll change\?/.test(line));
  const weaponChart=lines.some(line=>line.includes('-G-Bullet')) && lines.some(line=>line.includes('-J-Laser'));
  lines.forEach((line,r)=>{
    for(const m of line.matchAll(/(?:^|\s|-)([A-Za-z0-9])([->)])(?=\S)/g)) {
      const c=m.index+m[0].length-2, rest=line.slice(c+2);
      if(m[2]!=='-'&&!picker) continue;
      if(line[c-1]==='-'&&!weaponChart) continue;
      if(m[2]==='-'&&/^[A-Za-z0-9](?:\s|$)/.test(rest)) continue;
      const end=rest.search(/[,.;:]|\s{2,}|\s[A-Za-z0-9][->)]|\b(?:ENTER|SPACEBAR|SPACE|F(?:10|[1-9])|PGUP|PGDN|BACKSPACE)\b/);
      add(m[1],r+1,c+1,2+(end<0?rest.trimEnd().length:rest.slice(0,end).trimEnd().length),'selector');
    }
    for(const m of line.matchAll(/\(([Yy])\/([Nn])\)/g)) {
      add(m[1],r+1,m.index+2,1,'prompt'); add(m[2],r+1,m.index+4,1,'prompt');
    }
    for(const m of line.matchAll(/\b(ENTER|SPACEBAR|SPACE|F(?:10|[1-9])|PGUP|PGDN|BACKSPACE)\b/g)) {
      const word=m[1].toUpperCase();
      const k={ENTER:KEY.ENTER,SPACE:KEY.SPACE,SPACEBAR:KEY.SPACE,PGUP:KEY.PGUP,PGDN:KEY.PGDN,BACKSPACE:KEY.BACKSPACE}[word] ?? `\0${String.fromCharCode(58+Number(word.slice(1)))}`;
      add(k,r+1,m.index+1,m[0].length,'word');
    }
    for(const m of line.matchAll(/#([1-9])\b/g)) add(m[1],r+1,m.index+1,2,'number');
  });
  return out;
}
export function arrowRegions({x,y,w=26,h=24}) {
  return [
    {key:KEY.UP,x:x+w/3,y,w:w/3,h:h/3},
    {key:KEY.DOWN,x:x+w/3,y:y+h*2/3,w:w/3,h:h/3},
    {key:KEY.LEFT,x,y:y+h/3,w:w/3,h:h/3},
    {key:KEY.RIGHT,x:x+w*2/3,y:y+h/3,w:w/3,h:h/3},
  ].map(r=>({...r,kind:'arrow'}));
}
export function mapRegions({area,cursor,cell}) {
  const out=[];
  const x=area.x+cursor.x*cell.w,y=area.y+cursor.y*cell.h;
  const add=(key,x,y,w,h)=>{if(w>0&&h>0)out.push({key,x,y,w,h,kind:'map'});};
  add(KEY.LEFT,area.x,area.y,x-area.x,area.h);
  add(KEY.RIGHT,x+cell.w,area.y,area.x+area.w-x-cell.w,area.h);
  add(KEY.UP,x,area.y,cell.w,y-area.y);
  add(KEY.DOWN,x,y+cell.h,cell.w,area.y+area.h-y-cell.h);
  return out;
}
export const MAP_PROVIDERS={
  pictureVisible(E,area) {
    return !(E.text?.screenText() ?? []).slice(Math.ceil(area.y/8),Math.floor((area.y+area.h)/8))
      .some(line=>/[A-Za-z]{3}/.test(line.slice(Math.ceil(area.x/8),Math.floor((area.x+area.w)/8))));
  },
  INSIDE(E,{arrows}) {
    const lines=E.text.screenText();
    if(lines.some(l=>l.includes('Use arrow keys to pick'))) {
      const row=lines.findIndex(l=>/^\s*>/.test(l));
      if(row>=0)return {area:{x:8,y:(row-1)*8,w:184,h:24},cursor:{x:0,y:1},cell:{w:184,h:8}};
    }
    if(!arrows.some(a=>a.bank==='INSH.BAS')) return null;
    if(!MAP_PROVIDERS.pictureVisible(E,{x:8,y:7,w:185,h:185})) return null;
    const x=E.commonScalars?.get(18592),y=E.commonScalars?.get(18596);
    if(!Number.isFinite(x)||!Number.isFinite(y)) return null;
    return {area:{x:8,y:7,w:185,h:185},cursor:{x,y},cell:{w:5,h:5}};
  },
  SPACE(E,{arrows,markers}) {
    const G=E.state.G, arrow=arrows.find(a=>a.bank==='SPACESH.BAS');
    if(!MAP_PROVIDERS.pictureVisible(E,{x:16,y:8,w:128,h:136})) return null;
    if(arrow?.x===240) return {area:{x:16,y:16,w:128,h:128},cursor:{x:G[2216]%8,y:G[2217]%8},cell:{w:16,h:16}};
    if(arrow?.x===156) return {area:{x:16,y:16,w:15*7.46,h:15*7.46},cursor:{x:G[2218],y:G[2219]},cell:{w:7.46,h:7.46}};
    if(markers.some(a=>Math.abs(a.x-(G[2220]*8+20))<0.6&&Math.abs(a.y-(G[2221]*8+28))<0.6)&&E.text.screenText().some(l=>/A-Up Scan/.test(l)))
      return {area:{x:20,y:28,w:96,h:96},cursor:{x:G[2220],y:G[2221]},cell:{w:8,h:8}};
    return null;
  },
  PLBATTLE(E,{arrows}) {
    const m=E.moduleInstance;
    if(!m||!arrows.some(a=>a.bank.startsWith('PLBTSH.'))) return null;
    if(!MAP_PROVIDERS.pictureVisible(E,{x:200,y:32,w:112,h:112})) return null;
    return {area:{x:200,y:32,w:112,h:112},cursor:{x:m.A('GrpX!')[5]-26,y:m.A('GrpY!')[5]-5},cell:{w:8,h:8}};
  },
};
const ARROWS=new Set(['SPACESH.BAS#15','INSH.BAS#64','PLBTSH.BAS#8','PLBTSH.EGA#8']);
export function disjointRegions(regions) {
  const out=[];
  for(const r of [...regions].sort((a,b)=>a.w*a.h-b.w*b.h)) {
    let pieces=[r];
    for(const a of out) pieces=pieces.flatMap(b=>{
      const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),right=Math.min(a.x+a.w,b.x+b.w),bottom=Math.min(a.y+a.h,b.y+b.h);
      if(x>=right||y>=bottom)return [b];
      return [
        {...b,h:y-b.y}, {...b,y:bottom,h:b.y+b.h-bottom},
        {...b,y,h:bottom-y,w:x-b.x}, {...b,x:right,y,w:b.x+b.w-right,h:bottom-y},
      ].filter(p=>p.w>0&&p.h>0);
    });
    out.push(...pieces);
  }
  return out;
}
export function attachPointer(E,canvas,win=typeof window!=='undefined'?window:null) {
  if(E.pointer) return E.pointer;
  if(win) {
    let armed=!win.document?.hasFocus?.(),gate=false,t=0,out=0,away=false;
    const eat=e=>{e.preventDefault?.();e.stopImmediatePropagation?.();};
    const hint=v=>{const h=win.document?.getElementById?.('click-hint');if(h)h.hidden=!v;};
    const back=()=>{if(out&&Date.now()-out>=800){away=true;hint(true);}out=0;};
    win.addEventListener('blur',()=>{clearTimeout(t);armed=true;});
    win.addEventListener('focus',()=>{clearTimeout(t);t=setTimeout(()=>armed=false,300);});
    win.addEventListener('mouseout',e=>{if(!e.relatedTarget&&!out)out=Date.now();},true);
    win.addEventListener('mouseover',e=>{if(!e.relatedTarget)back();},true);
    win.addEventListener('keydown',()=>{armed=away=false;out=out&&Date.now();hint(false);},true);
    win.addEventListener('mousedown',e=>{back();gate=armed||away;armed=away=false;hint(false);if(gate)eat(e);},true);
    for(const n of ['mouseup','click','auxclick','dblclick']) win.addEventListener(n,e=>{if(gate)eat(e);if(n==='click'||n==='auxclick')gate=false;},true);
  }
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  const drawn=new Map();
  const sample=r=>{
    const out=[];
    for(let y=0;y<r.h;y++) for(let x=0;x<r.w;x++) out.push(E.fb.point(r.x+x,r.y+y));
    return out;
  };
  const put=E.sprites.put;
  E.sprites.put=function(x,y,image,...args) {
    const bank=image.bank ? (/\.[A-Za-z]{3}$/.test(image.bank)?image.bank.toUpperCase():`${image.bank.toUpperCase()}.BAS`):'';
    const id=`${bank}#${image.index}`, tracked=ARROWS.has(id)||id==='SPACESH.BAS#16';
    const before=tracked?drawn.get(id):null;
    const wasLive=before&&!before.erased&&before.module===E.currentModule&&before.x===Math.round(x)&&before.y===Math.round(y)&&sample(before).every((p,i)=>p===before.pixels[i]);
    const result=put.call(this,x,y,image,...args);
    if(tracked) {
      const sprite=image.pix?image:this.atlas.sprite(image.bank,image.index);
      const r={x:Math.round(x),y:Math.round(y),w:sprite.w,h:sprite.h,bank,module:E.currentModule};
      r.pixels=sample(r);
      r.erased=!!wasLive&&(args[0]==='XOR'||args[0]===4||args[0]===undefined);
      drawn.set(id,r);
    }
    return result;
  };
  const regions=()=>{
    if(E.input.modal||E.manual?.isOpen) return [];
    const live=[...drawn.entries()].filter(([,r])=>!r.erased&&r.module===E.currentModule&&sample(r).every((p,i)=>p===r.pixels[i]));
    const arrows=live.filter(([id])=>ARROWS.has(id)).map(([,r])=>r);
    const markers=live.filter(([id])=>id==='SPACESH.BAS#16').map(([,r])=>r);
    const out=textRegions(E.text,E.input.menuItems());
    out.push(...arrows.flatMap(arrowRegions));
    const map=MAP_PROVIDERS[E.currentModule]?.(E,{arrows,markers});
    if(map) out.push(...mapRegions(map));
    return disjointRegions(out);
  };
  const point=e=>{const r=canvas.getBoundingClientRect();const cx=(e.clientX-r.left)*640/r.width,cy=(e.clientY-r.top)*400/r.height;
    return !E.input.modal && E.display?.viewToLogical ? E.display.viewToLogical(cx,cy) : {x:cx/2,y:cy/2};};
  const hit=(x,y)=>regions().find(r=>contains(r,x,y));
  canvas.style.cursor='default';
  canvas.addEventListener('mousemove',e=>{
    if(E.settings?.on('mouse') === false) {canvas.style.cursor='default';return;}
    E.input.lastDevice='mouse';const {x,y}=point(e);
    canvas.style.cursor=E.input.modal||hit(x,y)?'pointer':'default';
  });
  canvas.addEventListener('mouseleave',()=>{canvas.style.cursor='default';});
  canvas.addEventListener('click',e=>{
    if(e.button!==undefined&&e.button!==0) return;
    if(E.settings?.on('mouse') === false) {canvas.style.cursor='default';return;}
    E.input.lastDevice='mouse';const {x,y}=point(e);
    if(E.input.modal) {E.input.modal.click(x,y);return;}
    if(E.manual?.isOpen) {e.preventDefault();return;}
    const r=hit(x,y);if(r) {e.preventDefault();E.input.device(r.key);}
  });
  E.pointer={regions};
  if(typeof window!=='undefined') window.__clickRegions=regions;
  return E.pointer;
}
