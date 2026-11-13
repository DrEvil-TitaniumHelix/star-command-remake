import assert from 'node:assert/strict';
import { installZoom, ZOOM_STEPS, anchoredView } from './zoom.js';
import { MAP_PROVIDERS, mapRegions } from './pointer.js';
const listeners = {};
const canvas = { addEventListener(n, f) { listeners[n] = f; },
  getBoundingClientRect: () => ({left:100, top:50, width:640, height:400}) };
let enabled = true, regions = [{kind:'map',x:0,y:0,w:320,h:200}], clears = 0, chains = 0;
const display = { view:{scale:1, ox:0, oy:0}, frameHooks:[],
  setView(scale, ox, oy) { this.view = {scale, ox:Math.max(0,Math.min(320-320/scale,ox)), oy:Math.max(0,Math.min(200-200/scale,oy))}; },
  viewToLogical(x,y) { const v=this.view; return {x:v.ox+x/2/v.scale,y:v.oy+y/2/v.scale}; } };
const E = {display, currentModule:'SPACE', settings:{on:n => n==='mapZoom' && enabled}, input:{},
  pointer:{regions:()=>regions}, fb:{cls(){clears++;return 7;}}, chain(){chains++;return 8;} };
const z=installZoom(E,canvas);
assert.equal(installZoom(E,canvas),z);
for(const scale of ZOOM_STEPS.slice(1)) { z.zoomAt(160,100,1); assert.equal(z.level,scale); }
z.zoomAt(160,100,1); assert.equal(z.level,4);
for(let i=0;i<6;i++)z.zoomAt(160,100,-1);
assert.equal(z.level,1);
for(const old of [{scale:1,ox:0,oy:0},{scale:2,ox:40,oy:20}]) {
  const v=anchoredView(old,100,70,3);
  assert(Math.abs((100-v.ox)*3-(100-old.ox)*old.scale)<1e-10);
  assert(Math.abs((70-v.oy)*3-(70-old.oy)*old.scale)<1e-10);
}
z.zoomAt(320,200,1); assert.equal(display.view.ox,320-320/1.5);
z.reset();
let prevented=0;
const event={clientX:420,clientY:250,deltaY:-100,button:0,preventDefault(){prevented++;}};
listeners.wheel(event);assert.equal(z.level,1.5);assert.equal(prevented,1);
listeners.click(event);assert.equal(z.level,1.5);
listeners.mousedown({...event,button:2});assert.equal(z.level,1);
listeners.contextmenu(event);assert.equal(prevented,3);
for(const invalidate of [()=>enabled=false,()=>E.input.modal={},()=>regions=[],()=>E.currentModule='INSIDE']) {
  enabled=true;E.input.modal=null;regions=[{kind:'map',x:0,y:0,w:320,h:200}];
  z.zoomAt(100,80,1);assert.equal(z.level,1.5);
  invalidate();display.frameHooks[0]();assert.equal(z.level,1);
}
enabled=true;E.input.modal=null;regions=[{kind:'map',x:0,y:0,w:320,h:200}];
z.zoomAt(100,80,1);assert.equal(E.fb.cls(),7);assert.equal(clears,1);assert.equal(z.level,1);
z.zoomAt(100,80,1);assert.equal(E.chain(),8);assert.equal(chains,1);assert.equal(z.level,1);
enabled=false;listeners.wheel(event);assert.equal(prevented,3);assert.equal(z.level,1);
for (const disable of [()=>enabled=false,()=>E.input.modal={},()=>regions=[]]) {
  enabled=true;E.input.modal=null;regions=[{kind:'map',x:0,y:0,w:320,h:200}];
  disable();listeners.contextmenu(event);assert.equal(prevented,3);
}
enabled=true;E.input.modal=null;
for (const kind of ['selector','arrow','map']) {
  regions=[{kind,x:150,y:90,w:20,h:20}];
  if(kind!=='map')regions.push({kind:'map',x:0,y:0,w:20,h:20});
  listeners.click(event);assert.equal(z.level,1);
}
regions=[{kind:'map',x:0,y:0,w:20,h:20}];
let stopped=0;
listeners.click({...event,stopImmediatePropagation(){stopped++;}});
assert.equal(z.level,1.5);assert.equal(stopped,1);
listeners.click({...event,button:2});assert.equal(z.level,1.5);
z.reset();
let lines=Array(25).fill('');
const game={text:{screenText:()=>lines},state:{G:new Float32Array(2300)},
  commonScalars:new Map([[18592,4],[18596,5]]),
  moduleInstance:{A:()=>({5:30})}};
const space=()=>MAP_PROVIDERS.SPACE(game,{arrows:[{bank:'SPACESH.BAS',x:240}],markers:[]});
const inside=()=>MAP_PROVIDERS.INSIDE(game,{arrows:[{bank:'INSH.BAS'}]});
const battle=()=>MAP_PROVIDERS.PLBATTLE(game,{arrows:[{bank:'PLBTSH.BAS'}]});
for(const provider of [space,inside]) {
  lines=Array(25).fill('');assert(provider());
  E.pointer.regions=()=>{const m=provider();return m?mapRegions(m):[];};
  z.zoomAt(100,80,1);assert.equal(z.level,1.5);
  lines[1]='      EQUIPING';
  assert.equal(provider(),null);assert.deepEqual(E.pointer.regions(),[]);
  display.frameHooks[0]();assert.equal(z.level,1);
  lines[1]='';lines[4]='    Inspect Who?';assert.equal(provider(),null);
}
lines=Array(25).fill('');lines[19]='Movement Phase 1';assert(battle());
lines[6]='                         Equipment';assert.equal(battle(),null);
lines=Array(25).fill('');assert(space());assert(inside());
const sector=()=>MAP_PROVIDERS.SPACE(game,{arrows:[{bank:'SPACESH.BAS',x:156}],markers:[]});
const system=()=>MAP_PROVIDERS.SPACE(game,{arrows:[],markers:[{x:20,y:28}]});
lines[19]='  A-Up Scan';assert(sector());assert(system());
lines[4]='    EQUIPING';assert.equal(sector(),null);assert.equal(system(),null);
lines=Array(25).fill('');lines[16]=' Use arrow keys to pick';lines[19]=' >#1';
assert(MAP_PROVIDERS.INSIDE(game,{arrows:[]}));
console.log('zoom tests passed');
