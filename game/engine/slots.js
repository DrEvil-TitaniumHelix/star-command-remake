import { Files } from './files.js';
import { KEY } from './input.js';
import { drawPanel, UI } from './ui.js';

const STORE = 'starcommand:slots:v1';
let recordSerial = 0;
const encode = bytes => {
  let text=''; for(let i=0;i<bytes.length;i+=0x8000) text+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(text);
};
const decode = bytes => {
  if(typeof bytes==='string') {try {return Uint8Array.from(atob(bytes),c=>c.charCodeAt(0));} catch {throw Error('Damaged slot');}}
  if(!Array.isArray(bytes)||!bytes.every(b=>Number.isInteger(b)&&b>=0&&b<=255)) throw Error('Damaged slot');
  return Uint8Array.from(bytes);
};
export function validateSlotName(name, auto=false) {
  name=String(name).trim().slice(0,24);
  if(!name) throw Error('Enter a slot name');
  if(!auto && name==='Autosave') throw Error('Autosave is reserved');
  return name;
}
const PREFIX = 'starcommand:file:';
const extra = n => /^IN(?:MAP)?-\d+\.BAS$/.test(n) || n === 'LOGBOOK';
const stations = Array.from({length:7}, (_,i)=>i+1).flatMap(n=>[`IN-${n}.BAS`,`INMAP-${n}.BAS`]);
export function savedNames(files) {
  const names = new Set(files.mem.keys());
  try { for(let i=0;i<(files.storage?.length ?? 0);i++) {
    const k=files.storage.key(i); if(k?.startsWith(PREFIX)) names.add(k.slice(PREFIX.length));
  } } catch {   }
  return [...names].filter(extra);
}
export function forgetFile(files, name) {
  files.mem.delete(name);
  try { files.storage?.removeItem(PREFIX+name); } catch {   }
}
export class Slots {
  constructor(E, {restart = () => E.escape.restart()} = {}) {
    this.E=E; this.restart=restart; this.records=[];
    try { const value=JSON.parse(E.files.storage?.getItem(STORE) ?? '[]');
      if(Array.isArray(value)) this.records=value.map(r=>r.key ? {...JSON.parse(E.files.storage.getItem(r.key)),_key:r.key} : r).filter(r=>typeof r.name==='string' && r.files && typeof r.files==='object');
    } catch {   }
  }
  enabled() { return this.E.settings?.on('saveSlots') === true; }
  list() { return this.records.map(({name,time,auto})=>({name,time,auto})); }
  async snapshot(point) {
    const files=this.E.files;
    const names=new Set([...stations,...savedNames(files)]);
    const pending=[...names].map(n=>[n,files.saved(n)?.slice() ?? (n==='LOGBOOK'?null:files.read(n))]);
    const result={};
    for(const [n,value] of pending) if(value) result[n]=Array.from(await value);
    if(point) {
      result['CHARINFO.BAS']=Array.from(Files.makeBsave(point.body,point.header.seg,point.header.off));
      result.CHARNAME=Array.from(Uint8Array.from(point.names.map(n=>`${n ?? ''},`).join('')+'\x1a',c=>c.charCodeAt(0)&255));
      if(point.logbook) result.LOGBOOK=Array.from(point.logbook); else delete result.LOGBOOK;
    } else {
      for(const n of ['CHARINFO.BAS','CHARNAME']) result[n]=Array.from(await files.read(n));
    }
    return result;
  }
  async save(name, point, auto=false) {
    if(!this.enabled()) return false;
    name=validateSlotName(name,auto);
    const raw=await this.snapshot(point);
    const files=Object.fromEntries(Object.entries(raw).map(([n,b])=>[n,encode(Uint8Array.from(b))]));
    const record={name,auto,time:new Date().toISOString(),files};
    const next=[record,...this.records.filter(r=>r.name!==name)];
    const storage=this.E.files.storage, created=[];
    try {
      if(storage) {
        for(const r of next) if(!r._key) {
          const compact={name:r.name,auto:r.auto,time:r.time,
            files:Object.fromEntries(Object.entries(r.files).map(([n,b])=>[n,typeof b==='string'?b:encode(decode(b))]))};
          const key=`${STORE}:record:${Date.now()}:${++recordSerial}`;
          storage.setItem(key,JSON.stringify(compact));created.push([r,key]);
        }
        storage.setItem(STORE,JSON.stringify(next.map(r=>({name:r.name,key:r._key ?? created.find(([item])=>item===r)[1]}))));
        for(const [r,key] of created) r._key=key;
      }
    } catch {
      for(const [,key] of created) try {storage.removeItem(key);} catch {   }
      throw Error('Storage full; free space and retry');
    }
    const obsolete=this.records.find(r=>r.name===name)?._key;
    this.records=next;
    if(obsolete) try {storage?.removeItem(obsolete);} catch {   }
    return true;
  }

  async load(name) {
    if(!this.enabled()) return false;
    const record=this.records.find(r=>r.name===name); if(!record) throw Error('Slot not found');
    const decoded=new Map();
    for(const [n,bytes] of Object.entries(record.files)) {
      if(n!=='CHARINFO.BAS' && n!=='CHARNAME' && !extra(n)) continue;
      decoded.set(n,decode(bytes));
    }
    if(!decoded.has('CHARINFO.BAS') || !decoded.has('CHARNAME')) throw Error('Incomplete slot');
    const save=Files.parseBsave(decoded.get('CHARINFO.BAS'));
    if(save.body.length!==this.E.state.toBytes().length) throw Error('Damaged COMMON');
    for(const n of savedNames(this.E.files)) forgetFile(this.E.files,n);
    for(const [n,bytes] of decoded) this.E.files.write(n,bytes);
    try { const lb=decoded.get('LOGBOOK'); this.E.logbook?.restore?.(lb?JSON.parse(new TextDecoder().decode(lb)):[]); } catch(e) { console.error(e); this.E.logbook?.restore?.([]); }
    this.afterLoad?.(); this.dismiss?.(); this.restart(); return true;
  }
}

export function installSlots(E) {
  if(E.slots) return E.slots;
  const slots=E.slots=new Slots(E);
  let page=null, titleShown=false, loadedTitle=false;
  const titleModule=()=>['STARCOMM','STARTUP'].includes(E.currentModule);
  const moduleProperty=Object.getOwnPropertyDescriptor(E,'currentModule');
  Object.defineProperty(E,'currentModule',{...moduleProperty,set(value) {
    moduleProperty.set.call(E,value);
    titleShown=loadedTitle && ['STARCOMM','STARTUP'].includes(value); loadedTitle=false;
  }});
  slots.afterLoad=()=>{loadedTitle=true;titleShown=true;};
  function close() { page=null; E.input.modal=E.escape.modal; }
  function open(mode, done, title=false) {
    if(!slots.enabled()) return;
    if(title) titleShown=true;
    page={mode,done,title,selected:0,name:'',editing:false,busy:false,error:''};
    E.input.modal={key,click};
  }
  const choices=()=>page.mode==='save' ? [{name:'New named slot'},...slots.list().filter(r=>!r.auto)] :
    [...(page.title?[{name:'Continue current disk',disk:true}]:[]),...slots.list()];
  async function choose() {
    const p=page; if(!p||p.busy) return;
    const row=choices()[p.selected]; if(!row) return;
    if(p.mode==='save' && !p.editing && p.selected===0) {p.editing=true;return;}
    if(p.mode==='save' && !p.editing) {p.name=row.name;p.editing=true;return;}
    p.busy=true;
    try {
      if(p.mode==='save') {await p.done(validateSlotName(p.name));close();}
      else if(row.disk) {close();E.escape.resume();titleShown=true;E.input.push('1');}
      else await slots.load(row.name);
    } catch(e) {p.error=e.message;p.busy=false;}
  }
  function key(k) {
    if(!page||page.busy) return;
    if(!slots.enabled()) {close();return;}
    if(page.editing) {
      if(k===KEY.ESC) {page.editing=false;return;}
      if(k===KEY.ENTER) {void choose();return;}
      if(k===KEY.BACKSPACE) page.name=page.name.slice(0,-1);
      else if(k.length===1 && k>=' ' && page.name.length<24) page.name+=k;
      return;
    }
    if(k===KEY.ESC || k.toUpperCase()==='B') {const title=page.title;close();if(title) E.escape.resume();return;}
    const count=choices().length;
    if(k===KEY.UP||k===KEY.LEFT) page.selected=(page.selected+count-1)%Math.max(1,count);
    else if(k===KEY.DOWN||k===KEY.RIGHT) page.selected=(page.selected+1)%Math.max(1,count);
    else if(k===KEY.ENTER||k===KEY.SPACE) void choose();
  }
  function click(x,y) {
    if(!page||page.busy) return;
    if(page.editing) {if(y>=42&&y<50) void choose();else if(y>=52&&y<60) key(KEY.ESC);return;}
    const start=Math.max(0,page.selected-10), i=Math.floor((y-22)/10)+start;
    if(x>=8&&x<312 && i>=start&&i<Math.min(choices().length,start+12)) {page.selected=i;void choose();}
    else if(y>=142&&y<150) key(KEY.ESC);
  }
  E.display.overlays.push(ctx=>{
    if(!page) return;
    if(!slots.enabled()) {close();return;}
    let lines;
    if(page.editing) lines=['Name save slot',page.name+'_','Enter saves / overwrites this name','Click here to save','Esc-Cancel'];
    else {
      const start=Math.max(0,page.selected-10);
      lines=[page.mode==='save'?'Save & Quit: choose a slot':'Load: choose a slot',...choices().slice(start,start+12).map((r,i)=>({
        text:`${start+i===page.selected?'>':' '}${r.name}${r.auto?' (auto)':''}`,color:start+i===page.selected?UI.key:UI.text})),
        ...Array(Math.max(0,12-choices().slice(start,start+12).length)).fill(''),'Esc/B-Back'];
    }
    if(page.error) lines.push({text:page.error.slice(0,36),color:UI.key});
    drawPanel(ctx,E,16,16,lines,{width:36});
  });
  slots.dismiss=()=>{page=null;};
  slots.openLoad=(title=false)=>open('load',null,title);
  slots.openSave=done=>open('save',done);
  const inkey=E.input.inkey.bind(E.input);
  E.input.inkey=()=>{
    const k=inkey();
    if(k==='1' && !titleShown && slots.enabled() && slots.list().length && titleModule() &&
      E.text?.screenText().some(l=>l.includes('1-Play Star Command'))) {
      E.input.onDeviceEscape(); slots.openLoad(true); return '';
    }
    return k;
  };
  return slots;
}
