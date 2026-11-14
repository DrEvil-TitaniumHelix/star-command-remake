import {cornerButton} from './speed.js';
const supported = new Set(['SPACE', 'INSIDE', 'PLBATTLE', 'SPBATTLE']);
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export const logLines = entries => entries.map(e => `[${e.kind}] ${e.text.replace(/[+-]?(?:\d+(?:,\d{3})*(?:\.\d+)?|(?<![\w.])\.\d+)(?:e[+-]?\d+)?/gi,
  n => (n[0] === '+' ? '+' : '') + whole.format(Number(n.replaceAll(',', ''))))}`);
export function crewStatus(E) {
  const G = E.state.G, names = E.state.str('CrewName$');
  const shifted = ['PLBATTLE','INSIDE'].includes(E.currentModule);
  if (!shifted && names.slice(1,9).some(n => n)) E.crewNames = names.slice();
  const weapons = typeof E.moduleInstance?.A==='function' ? E.moduleInstance.A('WeaponName$') : E.state.str('WeaponName$');
  const items = E.tooltips?.items?.()?.filter(i => i.group==='squad weapons');
  return Array.from({length:8}, (_, i) => {
    const m = i+1, b = 1300+100*m, slot = Math.trunc(G[b+32]);
    const rec = 788+12*slot, type = slot > 0 ? Math.trunc(G[rec]) : 0;
    let reloads = 0;
    for (let a=1100;a<=1397;a+=3) if (type && G[a]===type && G[a+2]===m) reloads++;
    return {member:m, label: m===1 ? 'P' : m===2 ? 'C' : String(m-2),
      name: (shifted ? (m>2 ? names[m-2] : E.crewNames?.[m]) : names[m]) || '',
      hp:G[b+15], maxHP:G[b+16], status:G[b+31],
      stamina:E.currentModule==='PLBATTLE' && m>2 ? G[b+58] : null,
      weapon:slot>0 ? (weapons?.[type-1] || items?.find(it => it.index===type-1)?.name || '') : 'Hand weapon',
      ammo:slot>0 ? G[rec+3] : null, reloads,
      medal:G[b+59]};
  });
}
export const crewLines = crew => crew.filter(c => c.name).map(c => [`${c.label}> ${c.name} · HP ${Math.round(c.hp)}/${Math.round(c.maxHP)}`,
  [c.stamina!==null && `Stamina ${Math.round(c.stamina)}`, c.weapon].filter(Boolean).join(' · '),
  c.ammo!==null && c.weapon && c.weapon!=='Hand weapon' ? `Ammo ${Math.round(c.ammo)} · reloads ${c.reloads}` : ''].filter(Boolean).join('\n'));
export function shipStatus(E) {
  const G=E.state.G;
  const labels=['Engine','Retros','Life support','Power','Communications','Computer','Tow link',
    'Shield 1','Shield 2','Shield 3','Shield 4',...Array.from({length:6},(_,i)=>`Gun ${i+1}`),
    'Defense','Missile killer','Hull','Drop ship 1','Drop ship 2','Drop ship 3'];
  return [`Fuel ${G[2200]}/${G[52]} · Armor ${G[55]}`,
    ...labels.map((s,i)=>`${s}: ${['none','OK','broken','unfixable'][G[i]] ?? G[i]}`)];
}

export function battleReport(E) {
  const m=E.moduleInstance, v=m?.V, a=name=>typeof m?.A==='function' ? m.A(name) : [];
  if(!v)return null;
  if(E.currentModule==='PLBATTLE') {
    const groups=Array.from({length:v['NGroups!'] ?? 0},(_,g)=>{
      const size=a('GrpSize!')[g] ?? 0;
      let alive=0;for(let u=0;u<size;u++)alive+=Math.sign(a('UnitHP!')[u+g*5] ?? 0);
      return `${String.fromCharCode(65+g)}: ${size-alive} killed, ${alive} ${a('GrpState!')[g]===2?'survived':'surrendered'}`;
    });
    return `PLBATTLE report: credits gained ${v['CreditsGained!'] ?? 0}; ${groups.join('; ')}`;
  }
  if(E.currentModule==='SPBATTLE') {
    const ships=Array.from({length:v['NumEnemy!'] ?? 0},(_,i)=>{
      const status=a('EnStatus!')[i];
      return `#${i+1}: ${status===2?'survived':status===5?'docked':a('Hull!')[i]>0?'surrendered':'destroyed'}`;
    });
    return `SPBATTLE report: ${ships.join('; ')}`;
  }
  return null;
}

export function installPanels(E) {
  let entries=[], previous, lastScreen='', lastModule=E.currentModule;
  let screenVersion, cachedRows, newGamePending=false;
  const screenRows=()=>{
    const version=E.fb?.version;
    if(!cachedRows || version===undefined || version!==screenVersion){
      cachedRows=E.text.screenText();screenVersion=version;
    }
    return cachedRows;
  };
  if(E.text.print){const print=E.text.print.bind(E.text);E.text.print=(...args)=>{
    const result=print(...args);
    if(['STARTUP','STARCOMM'].includes(E.currentModule) && args[0]==='Starting a new game. Please wait.')newGamePending=true;
    return result;
  };}
  const enabled=k=>E.settings?.on(k)===true;
  try { entries=JSON.parse(new TextDecoder().decode(E.files.saved('LOGBOOK') ?? new Uint8Array()));
    if (!Array.isArray(entries)) entries=[];
  } catch { entries=[]; }
  const copy=()=>entries.map(e=>({...e}));
  const add=(kind,text)=>entries.push({kind,text});
  const observe=()=>{
    const G=E.state.G, mod=E.currentModule;
    if(newGamePending && G[78]===3 && G[79]===5000 && G[83]===27 && G[2214]===2 &&
      Array.from({length:8},(_,i)=>G[1400+i*100]).every(v=>v===0) &&
      E.state.str('CrewName$').slice(1,9).every(n=>!n)) {
      entries=[];previous=undefined;lastScreen='';lastModule=mod;newGamePending=false;
    }
    if (!enabled('logBook')) {previous=undefined;lastModule=E.currentModule;lastScreen='';return;}
    const now={credits:G[78]*30000+G[79], crew:crewStatus(E), medals:Array.from(G.slice(100,110))};
    if (previous) {
      if(now.credits!==previous.credits)add('credits',`Credits ${now.credits} (${now.credits-previous.credits>=0?'+':''}${now.credits-previous.credits})`);
      const unmatched=previous.crew.slice();
      const identity=c=>(['INSIDE','PLBATTLE'].includes(mod) && c.member<=2)?`role:${c.member}`:`name:${c.name||c.label}`;
      const previousIdentity=c=>(['INSIDE','PLBATTLE'].includes(lastModule) && c.member<=2)?`role:${c.member}`:`name:${c.name||c.label}`;
      now.crew.forEach(c=>{
        const candidates=unmatched.filter(old=>previousIdentity(old)===identity(c));
        const prior=candidates.find(old=>old.status===c.status) ?? candidates[0];
        if(prior)unmatched.splice(unmatched.indexOf(prior),1);
        if(prior?.status>0 && c.status===0)add('death',`${c.name} died`);
        if(prior && c.medal>prior.medal)add('medal',`${c.name}: Medal of Honor received`);
      });
      now.medals.forEach((v,i)=>{if(v===1 && previous.medals[i]!==1)add('medal',`${i===9?'Medal of Honor':'Special bonus'} earned (flag ${100+i})`);});
    }
    if(mod!==lastModule){
      add('arrival',`${lastModule || 'Start'} → ${mod} (sector ${G[2216]}, ${G[2217]})`);
      if(/^(?:PLBATTLE|SPBATTLE)$/.test(lastModule))add('battle',`${lastModule} cumulative counters: kills ${G[313]}, tonnage ${G[315]}${lastModule==='PLBATTLE'?`, won ${G[2254]}`:''}`);
      lastModule=mod;
    }
    const rows=screenRows(), screen=rows.join('\n');
    if(screen!==lastScreen && (/mission|briefing|battle (?:over|report)|medal/i.test(screen) ||
      (mod==='STARPORT' && /Press ENTER Key/.test(screen) && rows.slice(15,21).some(r=>r.trim())))) {
      if(!entries.some(e=>e.kind==='screen' && e.text===screen))add('screen',screen);
    }
    lastScreen=screen;previous=now;
  };
  E.logbook={observe, entries:copy, checkpoint:copy,
    persist(point=entries){if(enabled('logBook'))E.files.write('LOGBOOK',new TextEncoder().encode(JSON.stringify(point)));},
    restore(point){entries=(point??[]).map(e=>({...e}));previous=undefined;newGamePending=false;},
    open(){if(enabled('logBook') && !E.input.modal && journal) {journal.hidden=false;renderLog();}},
    close(){if(journal)journal.hidden=true;}};
  if(E.chain){const chain=E.chain;E.chain=(...args)=>{
    observe();
    if(enabled('logBook')) {const report=battleReport(E);if(report)add('battle',report);}
    return chain(...args);
  };}
  if(E.input.inkey){const inkey=E.input.inkey.bind(E.input);E.input.inkey=()=>{
    const key=inkey();if(key)observe();return key;
  };}
  const doc=E.display.canvas?.ownerDocument;
  let panel,journal,button,body;
  function renderLog(){if(body)body.textContent=logLines(entries).join('\n\n') || 'No entries yet.';}
  if(doc?.body){
    panel=doc.createElement('aside');panel.id='crew-status';panel.hidden=true;panel.setAttribute('aria-label','Crew status');
    journal=doc.createElement('section');journal.id='log-book';journal.hidden=true;
    const close=doc.createElement('button');close.textContent='Close log book';close.onclick=()=>E.logbook.close();
    body=doc.createElement('pre');journal.append(close,body);
    doc.body.append(panel,journal);
    button=cornerButton(E,'Log book',110,()=>enabled('logBook'),()=>E.logbook.open());button.id='log-book-button';
  }
  E.display.frameHooks.push(()=>{
    observe();if(!panel)return;
    const rect=E.display.canvas.getBoundingClientRect();
    const room=doc.documentElement.clientWidth-rect.width;
    const visible=enabled('crewPanel') && supported.has(E.currentModule) && room>=300;
    panel.hidden=!visible;
    if(visible){
      const width=Math.min(360,Math.max(200,room/2-24));E.display.canvas.style.transform=`translateX(${-Math.max(0,width+24-room/2)}px)`;
      const r=E.display.canvas.getBoundingClientRect();
      Object.assign(panel.style,{left:`${r.right+12}px`,top:`${r.top}px`,width:`${width-12}px`,maxHeight:`${rect.height}px`});
      panel.textContent='Crew status\n\n'+crewLines(crewStatus(E)).join('\n\n')+
        (['SPACE','SPBATTLE'].includes(E.currentModule)?'\n\nShip status\n'+shipStatus(E).join('\n'):'');
    }else E.display.canvas.style.transform='';
    if(!enabled('logBook') || E.input.modal)journal.hidden=true;
    if(!journal.hidden)renderLog();
  });
  return E.logbook;
}
