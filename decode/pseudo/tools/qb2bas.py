import sys,re,json,collections

LINE=re.compile(r'^([0-9A-F]{5})  ((?:[0-9a-f]{2} )*[0-9a-f]{2}(?: \.\.)?)\s+(.*)$')
def parse(path):
    ins=[]
    for l in open(path,encoding='latin1'):
        m=LINE.match(l.rstrip('\n'))
        if not m: continue
        addr=int(m.group(1),16); txt=m.group(3).strip()
        d=dict(addr=addr,txt=txt,rt=None,ops=None,mn=None)
        if txt.startswith('CALL RT') or txt.startswith('CALLFAR'):
            t=txt.split(';')[0].strip()
            parts=t.split()
            d['rt']=parts[1]
            if '#' in t: d['inl']=[int(x[1:],16) for x in parts[2:] if x.startswith('#')]
            if 'n=' in t:
                n=int(re.search(r'n=(\d+)',t).group(1)); d['n']=n
                if '->' in t: d['tgts']=[int(x,16) for x in t.split('->')[1].split()]
                if 'types=' in t: d['types']=[int(x,16) for x in t.split('types=')[1].split()]
        else:
            mm=txt.split(None,1); d['mn']=mm[0]; d['ops']=[o.strip() for o in mm[1].split(',')] if len(mm)>1 else []
        ins.append(d)
    for i,d in enumerate(ins): d['size']=(ins[i+1]['addr']-d['addr']) if i+1<len(ins) else 1
    return ins

def imm(s):
    s=s.strip()
    if s.startswith('0x'): return int(s,16)
    if s.startswith('-0x'): return -int(s[1:],16)
    if re.fullmatch(r'-?\d+',s): return int(s)
    return None
REGS=('ax','bx','cx','dx','si','di')

COMMON=[(0x1850,2601,4,'G!'),(0x40F4,202,2,'Logo'),(0x4288,9,4,'CrewName$'),(0x42AC,14,4,'Rank$'),(0x42E4,16,4,'Skill$'),(0x4324,9,4,'ShipClassName$'),
        (0x4348,5,4,'ShipSize$'),(0x435C,5,4,'ShieldName$'),(0x4370,5,4,'DefHwName$'),(0x4384,3,4,'MissileKillerName$'),(0x4390,25,4,'GunName$'),
        (0x43F4,54,4,'WeaponName$'),(0x44CC,6,4,'HandWeaponName$'),(0x44E4,4,4,'SightingName$'),(0x44F4,16,4,'ArmorSuitName$'),(0x4534,11,4,'MiscItemName$'),
        (0x4560,100,4,'ItemName$'),(0x46F0,50,4,'FindName$'),(0x47B8,23,4,'ShipType$'),(0x4814,23,4,'EquipName$'),(0x4870,7,4,'AttrName$')]

def strip1(v):
    if not (v.startswith('(') and v.endswith(')')): return v
    depth=0
    for k,ch in enumerate(v):
        if ch=='(': depth+=1
        elif ch==')':
            depth-=1
            if depth==0 and k!=len(v)-1: return v
    return v[1:-1]

class Ctx:
    def __init__(s,consts,names):
        s.strlit={int(k):v for k,v in consts['str'].items()}
        s.numlit={int(k):v for k,v in consts['num'].items()}
        s.names=names
        s.vars=collections.defaultdict(lambda: collections.Counter())
        s.arrays=collections.defaultdict(lambda: collections.Counter())
        s.unknown=collections.Counter(); s.unknown_sites=collections.defaultdict(list); s.prekinds={}; s.prearrays={}
        s.tempbase=None; s.temps={}; s.dims={}
        s.ranges=[(b,n,es,names.get('A%04X'%b,nm)) for b,n,es,nm in COMMON]
        for k,v in names.items():
            m=re.fullmatch(r'A([0-9A-F]{4})_count',k)
            if not m: continue
            b=int(m.group(1),16); nm=names.get('A%04X'%b,'A_%04X'%b)
            es=int(names.get('A%04X_esize'%b, 2 if (nm.endswith('%') or nm[-1] not in '!$') else 4))
            s.ranges.append((b,int(v),es,nm))
        s.ranges.sort(); s.folded={}; s.named_in_range={}
    def inarray(s,a):
        for b,n,es,nm in s.ranges:
            if b<=a<b+n*es and (a-b)%es==0:
                i=(a-b)//es
                if b in s.dims: return (b,i,'%s(%d, %d)'%(nm,i%s.dims[b],i//s.dims[b]))
                return (b,i,'%s(%d)'%(nm,i))
        return None
    def tempslot(s,a):
        if s.tempbase is None: return None
        k=a-s.tempbase
        if 0<=k<0x100 and k%8==0: return k//8
        return None
    def fmtnum(s,v):
        if v==int(v) and abs(v)<1e9: return str(int(v))
        return ('%.7g'%v)
    def var(s,a,kind):
        if kind=='S' and a in s.strlit:
            return '"'+s.strlit[a].replace('"','""')+'"'
        if kind=='N' and a in s.numlit: return s.fmtnum(s.numlit[a])
        t=s.tempslot(a)
        if t is not None: return s.temps.get(t,'T%d'%t)
        s.vars[a][kind]+=1
        if a==0x1A: return 'FAC'
        nm=s.names.get('%04X'%a); hit=s.inarray(a)
        if nm:
            if hit: s.named_in_range[a]=(nm,hit)
            return nm
        if hit:
            s.folded[a]=hit; s.arrays[hit[0]]
            return hit[2]
        return {'N':'N_%04X!','S':'S_%04X$','I':'I_%04X%%','P':'M_%04X'}[kind]%a
    def elem(s,base,scale,kind,idx):
        nm=s.arr(base,scale,kind)
        m=re.match(r'^(.+?) \+ (\d+) \* (.+)$',idx)
        if m and atom(m.group(1)) and atom(m.group(3)):
            s.dims[base]=int(m.group(2))
            return '%s(%s, %s)'%(nm,m.group(1).strip(),m.group(3).strip())
        return '%s(%s)'%(nm,idx)
    def arr(s,base,scale,kind):
        s.arrays[base][kind]+=1
        nm=s.names.get('A%04X'%base)
        if nm: return nm
        return {'N':'A_%04X!','S':'A_%04X$','I':'A_%04X%%','P':'A_%04X'}[kind]%base

def isimm(v): return v is not None and v[0]=='imm'

class Xl:
    def __init__(s,ins,ctx):
        s.ins=ins; s.ctx=ctx; s.byaddr={d['addr']:i for i,d in enumerate(ins)}
        s.out=[]; s.labels=set(); s.subs=set(); s.nolabel=set(); s.forloops={}; s.consumed=set()
        s.reset(); s.temps={}; s.pr=None; s.args=[]; s.gfx={}; s.inp=None; s.openmode=None; s.sound=None
        s.tempsfrom={}; ctx.temps=s.temps
        s.lastassign={}; s.fnargnames=set(); s.fndefs={}; s.pendingargs={}
        for k,v in ctx.names.items():
            if k.startswith('FN') and k.endswith('_args'):
                t=int(k[2:6],16); addrs=[int(x,16) for x in v.split(',')]
                s.fndefs[t]=(ctx.names['FN%04X'%t],addrs); s.fnargnames.update(ctx.names.get('%04X'%a,'N_%04X!'%a) for a in addrs)
        s.calls=collections.Counter()
    def reset(s,fac='FAC'):
        s.r={k:None for k in REGS}; s.fac=fac; s.flags=None; s.facfrom=None
        if not hasattr(s,'bp'): s.bp={}
    def alias(s,old,new):
        if old is None or old[0]=='imm': return
        for k in REGS:
            if s.r[k] is old: s.r[k]=new
    def rv(s,op):
        if op in REGS: return s.r[op]
        k=imm(op)
        if k is not None: return ('imm',k&0xFFFF)
        if op.startswith('word ptr [bp'): return s.bp.get(op) or ('ptr',op)
        return s.memref(op) or ('ptr',op)
    def memref(s,op):
        m=re.fullmatch(r'word ptr \[(\w\w) ([+-]) (0x[0-9a-f]+)\]',op)
        if not m or m.group(1) not in REGS: return None
        v=s.r[m.group(1)]; base=imm(m.group(3)) if m.group(2)=='+' else (-imm(m.group(3)))&0xFFFF
        if v and v[0]=='elem': return ('int',s.ctx.elem((v[1]+base)&0xFFFF,v[2],'I',v[3]),'mem')
        if v and v[0]=='imm': return ('int',s.ctx.var((v[1]+base)&0xFFFF,'I'),'mem')
        return ('int','%s(%s)'%(s.ctx.arr(base,2,'I'),'?'),'mem')
    def num(s,v):
        if v is None: return 'N(?)'
        if v[0]=='imm' and v[1]==0x1A: return s.fac
        if v[0]=='imm': return s.ctx.var(v[1],'N')
        if v[0]=='elem': return s.ctx.elem(v[1],v[2],'N',v[3])
        if v[0]=='ptr': return 'N(%s)'%v[1]
        return 'N(%s)'%v[1]
    def st(s,v):
        if v is None: return 'S(?)'
        if v[0]=='imm': return s.ctx.var(v[1],'S')
        if v[0]=='str': return v[1]
        if v[0]=='elem': return s.ctx.elem(v[1],v[2],'S',v[3])
        return 'S(%s)'%v[1]
    def iv(s,v):
        if v is None: return '?'
        if v[0]=='imm':
            x=v[1]; return str(x-65536 if x>=0x8000 else x)
        if v[0] in ('int','bool','str'): return v[1]
        if v[0]=='elem':
            if v[1]==0: return v[3] if v[2]==1 else '%s * %d'%(par(v[3]),v[2])
            if v[1]<0x1000 or v[1]>=0xFF00: k=v[1]-65536 if v[1]>=0x8000 else v[1]; return '%s %s %d'%((v[3] if v[2]==1 else '%s * %d'%(par(v[3]),v[2])),'-' if k<0 else '+',abs(k))
            return 'VARPTR(%s)'%s.ctx.elem(v[1],v[2],'P',v[3])
        return v[1]
    def coord(s,xr,yr,fx,fy):
        x=s.r[xr]; y=s.r[yr]
        px=s.num(x) if (isimm(fx) and fx[1]==0xFFFF) or (fx and fx[0]=='int' and fx[1]=='-1') else s.iv(x)
        py=s.num(y) if (isimm(fy) and fy[1]==0xFFFF) or (fy and fy[0]=='int' and fy[1]=='-1') else s.iv(y)
        return '(%s, %s)'%(px,py)
    def arrref(s,v):
        if v is None: return 'ARR(?)'
        if v[0]=='imm': return s.ctx.arr(v[1],4,'P')
        if v[0]=='elem': return s.ctx.elem(v[1],v[2],'P',v[3])
        return 'ARR(%s)'%s.iv(v)
    def emit(s,addr,text,comment=None):
        text=re.sub(r'\+ -(\d)', r'- \1', text)
        if s.pr is not None:
            m=re.match(r'^(\S+) = (.*)$',text)
            if m and m.group(1) in s.fnargnames: s.pendingargs[m.group(1)]=m.group(2); return
        if s.pr is not None and not text.startswith("'"): s.flush_print(addr)
        s.out.append((addr,text+(("   '"+comment) if comment else '')))
        m=re.match(r'^(\S+) = (.*)$',text)
        if m and m.group(1) in s.fnargnames: s.lastassign[m.group(1)]=(len(s.out)-1,m.group(2))
    def note(s,addr,text): s.out.append((addr,"' "+text))
    def flush_print(s,addr):
        p=s.pr; s.pr=None
        if p is None: return
        head='PRINT'
        if p.get('file') is not None: head='PRINT #%s,'%p['file']
        if p.get('using'): head+=' USING %s;'%p['using']
        items=p['items']
        if not items: s.out.append((p['addr'],head)); return
        txt=head+' '+'; '.join(t for t,nl in items)
        if not items[-1][1]: txt+=';'
        s.out.append((p['addr'],txt))
    def cond(s,jcc):
        f=s.flags
        if f is None: return None
        k=f[0]
        if k in ('cmp','scmp'):
            L,R=f[1],f[2]
            op={'je':'=','jne':'<>','ja':'>','jg':'>','jae':'>=','jge':'>=','jb':'<','jl':'<','jbe':'<=','jle':'<='}.get(jcc)
            return '%s %s %s'%(L,op,R) if op else None
        if k=='test':
            X=f[1]
            op={'je':'= 0','jne':'<> 0','ja':'> 0','jae':'>= 0','jb':'< 0','jbe':'<= 0','jg':'> 0','jge':'>= 0','jl':'< 0','jle':'<= 0'}.get(jcc)
            return '%s %s'%(X,op) if op else None
        if k=='bool':
            B=f[1]
            if jcc in ('jne','jl','js'): return B
            if jcc in ('je','jge','jns'): return 'NOT %s'%B if B.startswith('(') else 'NOT (%s)'%B
        return None
    @staticmethod
    def invert(c):
        if c.startswith('NOT '):
            x=c[4:]
            return x[1:-1] if (x.startswith('(') and x.endswith(')') and atom(x)) else x
        if ' OR ' in c or ' AND ' in c or ' XOR ' in c:
            return 'NOT '+c if (c.startswith('(') and c.endswith(')') and atom(c)) else 'NOT (%s)'%c
        for a,b in (('<>','='),('>=','<'),('<=','>'),('=','<>'),('<','>='),('>','<=')):
            m=re.match(r'^(.*) '+re.escape(a)+r' (.*)$',c)
            if m: return '%s %s %s'%(m.group(1),b,m.group(2))
        return 'NOT (%s)'%c
    def backjump(s,k,body,short,longcc):
        w=s.ins[k:k+2]
        if not w: return None
        if w[0]['mn']==short and imm(w[0]['ops'][0])==body: return w[0]['addr']+w[0]['size']
        if len(w)==2 and w[0]['mn']==longcc and w[1]['mn']=='jmp' and imm(w[1]['ops'][0])==body and imm(w[0]['ops'][0])==w[1]['addr']+w[1]['size']: return w[1]['addr']+w[1]['size']
        return None
    def sgnidiom(s,i):
        w=s.ins[i:i+5]
        if len(w)<5 or w[0]['mn']!='and' or len(w[0]['ops'])!=2 or w[0]['ops'][0]!=w[0]['ops'][1] or w[0]['ops'][0] not in REGS: return False
        rr=w[0]['ops'][0]; L=w[4]['addr']+w[4]['size']
        return (w[1]['mn']=='je' and imm(w[1]['ops'][0])==L and w[2]['mn']=='mov' and w[2]['ops']==[rr,'1'] and w[3]['mn']=='jge' and imm(w[3]['ops'][0])==L and w[4]['mn']=='neg' and w[4]['ops']==[rr])
    def scan(s):
        for i,d in enumerate(s.ins):
            if d['rt']:
                if 'tgts' in d: s.labels.update(d['tgts'])
                continue
            mn=d['mn']
            if mn in ('jmp','call') or (mn and mn.startswith('j')):
                t=imm(d['ops'][0]) if d['ops'] else None
                if t is not None:
                    t&=0xFFFF
                    if mn=='call': s.subs.add(t)
                    else: s.labels.add(t)
        for i,d in enumerate(s.ins):
            if d['mn']=='mov' and len(d['ops'])==2 and d['ops'][1]=='0' and i+2<len(s.ins):
                j=s.ins[i+1]; k=s.ins[i+2]
                if j['mn'] and j['mn'].startswith('j') and j['mn']!='jmp' and k['mn']=='dec' and k['ops'][0]==d['ops'][0] and imm(j['ops'][0])==k['addr']+k['size']:
                    s.nolabel.add(k['addr']+k['size'])
        for i,d in enumerate(s.ins):
            if d['mn']=='jge' and i+1<len(s.ins) and s.ins[i+1]['mn']=='neg' and imm(d['ops'][0])==s.ins[i+1]['addr']+s.ins[i+1]['size'] and i>=1 and s.ins[i-1]['mn']=='and':
                s.nolabel.add(imm(d['ops'][0]))
        for i,d in enumerate(s.ins):
            if s.sgnidiom(i): s.nolabel.add(s.ins[i+4]['addr']+s.ins[i+4]['size'])
        for i,d in enumerate(s.ins):
            if d['mn']!='jmp': continue
            T=imm(d['ops'][0]); body=d['addr']+d['size']
            if T is None or T not in s.byaddr: continue
            k=s.byaddr[T]; w=s.ins[k:k+7]
            if len(w)<6: continue
            if body in s.byaddr and s.ins[s.byaddr[body]]['mn']=='nop': body+=1
            if (w[0]['mn']=='mov' and w[0]['ops'][0]=='di' and imm(w[0]['ops'][1]) is not None and w[1]['rt']=='RT3F_7D' and w[2]['mn']=='mov' and w[2]['ops']==['si','di']
                and w[3]['mn']=='mov' and w[3]['ops'][0]=='di' and imm(w[3]['ops'][1]) is not None and w[4]['rt']=='RT3F_9F'):
                if w[5]['mn'] in ('jbe','jae') and imm(w[5]['ops'][0])==body:
                    s.forloops[T]=dict(var=imm(w[0]['ops'][1]),lim=imm(w[3]['ops'][1]),body=body,jmp=d['addr'],op=w[5]['mn'],end=w[5]['addr']+w[5]['size'])
                    s.labels.discard(T)
                elif len(w)==7 and w[5]['mn'] in ('ja','jb') and imm(w[5]['ops'][0])==w[6]['addr']+w[6]['size'] and w[6]['mn']=='jmp' and imm(w[6]['ops'][0])==body:
                    s.forloops[T]=dict(var=imm(w[0]['ops'][1]),lim=imm(w[3]['ops'][1]),body=body,jmp=d['addr'],op={'ja':'jbe','jb':'jae'}[w[5]['mn']],end=w[6]['addr']+w[6]['size'])
                    s.labels.discard(T)
            elif (w[0]['mn']=='mov' and w[0]['ops'][0]=='di' and imm(w[0]['ops'][1]) is not None and w[1]['rt']=='RT3F_7D' and w[2]['mn']=='mov' and w[2]['ops'][0]=='si' and imm(w[2]['ops'][1]) is not None
                  and w[3]['rt']=='RT3F_A7' and w[4]['mn']=='jb' and w[5]['mn']=='jmp' and imm(w[4]['ops'][0])==w[5]['addr']+w[5]['size']):
                neg=s.byaddr.get(imm(w[4]['ops'][0])); pos=s.byaddr.get(imm(w[5]['ops'][0])); lim=None; ok=False; end=None; inner=set()
                if neg is not None and pos is not None:
                    n=s.ins[neg:neg+6]
                    if len(n)>=4 and n[0]['mn']=='mov' and n[0]['ops']==['si','di']:
                        if n[1]['mn']=='mov' and n[1]['ops'][0]=='di' and n[2]['rt']=='RT3F_9F': lim=imm(n[1]['ops'][1]); k=neg+3
                        elif n[1]['rt']=='RT3F_A7': lim=0; k=neg+2
                        else: k=None
                        if k is not None:
                            e=s.backjump(k,body,'jae','jb')
                            if e is not None and e in s.byaddr and s.ins[s.byaddr[e]]['mn']=='jmp': ok=True; inner.add(e)
                    if ok:
                        p=s.ins[pos:pos+4]; k=None
                        if len(p)>=3 and p[0]['mn']=='mov' and p[0]['ops'][0]=='di' and p[1]['mn']=='mov' and p[1]['ops'][0]=='si' and p[2]['rt']=='RT3F_9F': k=pos+3
                        elif len(p)>=2 and p[0]['mn']=='mov' and p[0]['ops'][0]=='si' and p[1]['rt']=='RT3F_A7': k=pos+2
                        end=s.backjump(k,body,'jbe','ja') if k is not None else None
                        ok=end is not None
                if ok:
                    s.forloops[T]=dict(var=imm(w[0]['ops'][1]),lim=lim,body=body,jmp=d['addr'],op='jbe',end=end,stepvar=imm(w[2]['ops'][1]))
                    s.labels.discard(T); s.nolabel.add(s.ins[neg]['addr']); s.nolabel.add(s.ins[pos]['addr']); s.nolabel|=inner
        s.labels-=s.nolabel
    def run(s):
        s.scan(); c=s.ctx; ins=s.ins; i=0; n=len(ins)
        while i<n:
            d=ins[i]; a=d['addr']
            if a in s.labels or a in s.subs:
                if s.pr is not None: s.flush_print(a)
                keep=False
                if i>=2 and ins[i-1]['mn']=='jmp' and ins[i-2]['mn'] and ins[i-2]['mn'].startswith('j') and ins[i-2]['mn']!='jmp' and imm(ins[i-2]['ops'][0])==a: keep=True
                if not keep: s.reset()
                s.out.append((a,('SUB_%04X:'%a) if a in s.subs else ('L_%04X:'%a)))
            if a in s.forloops:
                fl=s.forloops[a]; var=c.var(fl['var'],'N')
                step=''
                fx=s.fac
                m=re.match(r'^%s \+ (.+)$'%re.escape(var),fx or '')
                if m: step=' STEP '+m.group(1) if m.group(1)!='1' else ''
                elif fl.get('stepvar') is not None: step=' STEP '+c.var(fl['stepvar'],'N')
                else:
                    s.emit(a,'%s = %s'%(var,fx),'NEXT %s without increment: the loop variable was reassigned'%var)
                    s.emit(a,'IF %s %s %s THEN GOTO L_%04X'%(var,'<=' if fl['op']=='jbe' else '>=',(c.var(fl['lim'],'N') if fl['lim'] else '0'),fl['body']))
                    s.labels.add(fl['body'])
                    while ins[i]['addr']<fl['end']: i+=1
                    s.reset(); continue
                s.emit(a,'NEXT %s%s'%(var,step))
                while ins[i]['addr']<fl['end']: i+=1
                s.reset(); continue
            if d['rt']: i=s.rt(i); continue
            mn=d['mn']; ops=d['ops']
            if mn=='mov':
                dst,src=ops
                if dst in REGS:
                    if src in REGS: s.r[dst]=s.r[src]
                    elif imm(src) is not None: s.r[dst]=('imm',imm(src)&0xFFFF)
                    elif src.startswith('word ptr [bp'): s.r[dst]=s.bp.get(src)
                    elif src.startswith('word ptr ['):
                        ad=imm(src[10:-1]); s.r[dst]=('int',c.var(ad,'I')) if ad is not None else (s.memref(src) or ('ptr',src))
                    else: s.r[dst]=('ptr',src)
                elif dst.startswith('word ptr [bp') and src in REGS: s.bp[dst]=s.r[src]
                elif dst.startswith('word ptr [') and imm(dst[10:-1]) is not None:
                    ad=imm(dst[10:-1]); val=s.iv(s.rv(src)) if src in REGS else str(imm(src))
                    nm=c.var(ad,'I'); s.emit(a,'%s = %s'%(nm,val))
                    if src in REGS and nm not in s.fnargnames: s.alias(s.r[src],('int',nm))
                elif dst.startswith('word ptr [') and s.memref(dst) is not None:
                    val=s.iv(s.rv(src)) if src in REGS else s.iv(('imm',imm(src)&0xFFFF))
                    nm=s.memref(dst)[1]; s.emit(a,'%s = %s'%(nm,val))
                    if src in REGS: s.alias(s.r[src],('int',nm))
                else: s.note(a,'asm '+d['txt'])
            elif mn=='xchg':
                x,y=ops; s.r[x],s.r[y]=s.r[y],s.r[x]
            elif mn=='shl':
                rr=ops[0]; v=s.r.get(rr)
                if rr not in REGS: s.note(a,'asm '+d['txt']); i+=1; continue
                if v and v[0]=='elem': s.r[rr]=('elem',v[1],v[2]*2,v[3])
                elif v and v[0]=='imm': s.r[rr]=('imm',(v[1]*2)&0xFFFF)
                elif v and v[0] in ('int','bool'): s.r[rr]=('elem',0,2,v[1])
                else: s.r[rr]=('elem',0,2,'?')
            elif mn in ('add','sub','xor') and ops[0] not in REGS: s.note(a,'asm '+d['txt'])
            elif mn=='add':
                rr,src=ops; v=s.r[rr]; k=imm(src)
                if src in REGS or imm(src) is None:
                    w=s.rv(src)
                    if v and v[0]=='elem' and v[1]==0 and v[2]>1 and w and w[0] in ('int','bool'): s.r[rr]=('int','%s + %d * %s'%(w[1],v[2],v[3]))
                    elif w and w[0]=='elem' and w[1]==0 and w[2]>1 and v and v[0] in ('int','bool'): s.r[rr]=('int','%s + %d * %s'%(v[1],w[2],w[3]))
                    else: s.r[rr]=('int','%s + %s'%(s.iv(v),s.iv(w)))
                elif v and v[0]=='elem' and k is not None: s.r[rr]=('elem',(v[1]+k)&0xFFFF,v[2],v[3])
                elif v and v[0]=='imm' and k is not None: s.r[rr]=('imm',(v[1]+k)&0xFFFF)
                elif v and v[0]=='int' and len(v)>2 and k is not None: s.r[rr]=('int','%s + %d'%(v[1],k-65536 if k>=0x8000 else k))
                elif v and v[0] in ('int','bool') and k is not None: s.r[rr]=('int','%s + %d'%(v[1],k-65536 if k>=0x8000 else k))
                elif k is not None: s.r[rr]=('int','%s + %d'%(s.iv(v),k-65536 if k>=0x8000 else k))
                else: s.r[rr]=('int','%s + %s'%(s.iv(v),src))
                s.flags=None
            elif mn=='sub':
                rr,src=ops; v=s.r[rr]; k=imm(src)
                if src in REGS: s.r[rr]=('int','%s - %s'%(s.iv(v),s.iv(s.rv(src))))
                elif v and v[0]=='imm' and k is not None: s.r[rr]=('imm',(v[1]-k)&0xFFFF)
                else: s.r[rr]=('int','%s - %s'%(s.iv(v),k))
            elif mn=='xor':
                rr,src=ops
                if src==rr: s.r[rr]=('imm',0)
                elif imm(src) is not None: s.r[rr]=('int','(%s XOR %d)'%(s.iv(s.r[rr]),imm(src)))
                else: s.r[rr]=('int','(%s XOR %s)'%(s.iv(s.r[rr]),s.iv(s.rv(src))))
            elif mn=='and':
                rr,src=ops
                if src==rr and s.sgnidiom(i): s.r[rr]=('int','SGN(%s)'%s.iv(s.r[rr])); i+=5; continue
                if src==rr: s.flags=('bool',s.iv(s.r[rr]))
                elif rr not in REGS: s.note(a,'asm '+d['txt'])
                else: s.r[rr]=('bool','(%s AND %s)'%(s.iv(s.r[rr]),s.iv(s.rv(src)))); s.flags=('bool',s.r[rr][1])
            elif mn=='or':
                rr,src=ops
                if rr not in REGS: s.note(a,'asm '+d['txt']); i+=1; continue
                if src==rr: s.flags=('test',s.iv(s.r[rr])); i+=1; continue
                s.r[rr]=('bool','(%s OR %s)'%(s.iv(s.r[rr]),s.iv(s.rv(src)))); s.flags=('bool',s.r[rr][1])
            elif mn in ('dec','inc','neg','not') and ops[0] not in REGS: s.note(a,'asm '+d['txt'])
            elif mn=='dec':
                rr=ops[0]; v=s.r[rr]
                if v and v[0]=='imm': s.r[rr]=('imm',(v[1]-1)&0xFFFF)
                else: s.r[rr]=('int','%s - 1'%s.iv(v))
            elif mn=='inc':
                rr=ops[0]; v=s.r[rr]
                if v and v[0]=='imm': s.r[rr]=('imm',(v[1]+1)&0xFFFF)
                else: s.r[rr]=('int','%s + 1'%s.iv(v))
            elif mn=='neg':
                rr=ops[0]; s.r[rr]=('int','-(%s)'%s.iv(s.r[rr]))
            elif mn=='not':
                rr=ops[0]; s.r[rr]=('bool','NOT (%s)'%s.iv(s.r[rr]))
            elif mn=='imul':
                s.r['ax']=('int','%s * %s'%(s.iv(s.r['ax']),s.iv(s.rv(ops[0]))))
            elif mn=='cmp':
                x,y=ops
                L=s.iv(s.r[x]) if x in REGS else (c.var(imm(x[10:-1]),'I') if imm(x[10:-1]) is not None else s.iv(s.rv(x)))
                R=s.iv(s.r[y]) if y in REGS else (str(imm(y)) if imm(y) is not None else s.iv(s.rv(y)))
                s.flags=('cmp',L,R)
            elif mn=='test': s.flags=('bool',s.iv(s.r[ops[0]]))
            elif mn=='push': s.note(a,'push %s'%s.iv(s.r[ops[0]]) if ops[0] in REGS else 'push '+ops[0])
            elif mn=='pop': s.r[ops[0]]=('ptr','popped')
            elif mn=='nop': pass
            elif mn=='jmp':
                t=imm(ops[0])
                if t is None: s.note(a,'asm '+d['txt'])
                elif t in s.forloops:
                    fl=s.forloops[t]; var=c.var(fl['var'],'N'); lim=(c.var(fl['lim'],'N') if fl['lim'] else '0')
                    s.emit(a,'FOR %s = %s %s %s'%(var,s.fac,'TO' if fl['op']=='jbe' else 'DOWNTO',lim))
                else: s.emit(a,'GOTO L_%04X'%(t&0xFFFF))
                s.reset()
            elif mn.startswith('j'):
                t=imm(ops[0])&0xFFFF
                if i>=1 and ins[i-1]['mn']=='mov' and ins[i-1]['ops'][1]=='0' and i+1<n and ins[i+1]['mn']=='dec' and ins[i+1]['ops'][0]==ins[i-1]['ops'][0] and t==ins[i+1]['addr']+ins[i+1]['size']:
                    cnd=s.cond(mn); rr=ins[i+1]['ops'][0]
                    s.r[rr]=('bool','(%s)'%(s.invert(cnd) if cnd else '?')); i+=2; continue
                if mn=='jge' and i+1<n and ins[i+1]['mn']=='neg' and t==ins[i+1]['addr']+ins[i+1]['size'] and s.flags and s.flags[0]=='bool':
                    rr=ins[i+1]['ops'][0]; s.r[rr]=('int','ABS(%s)'%strip1(s.flags[1])); i+=2; continue
                cnd=s.cond(mn)
                if i+1<n and ins[i+1]['mn']=='jmp' and t==ins[i+1]['addr']+ins[i+1]['size']:
                    t2=imm(ins[i+1]['ops'][0])&0xFFFF
                    if t2 in s.forloops:
                        fl=s.forloops[t2]; var=c.var(fl['var'],'N'); lim=(c.var(fl['lim'],'N') if fl['lim'] else '0')
                        s.emit(a,'IF %s THEN FOR %s = %s TO %s'%(s.invert(cnd) if cnd else '?'+' '+mn,var,s.fac,lim))
                    else:
                        s.emit(a,'IF %s THEN GOTO L_%04X'%(s.invert(cnd) if cnd else ('?'+mn+' '+str(s.flags)),t2))
                    i+=2; continue
                s.emit(a,'IF %s THEN GOTO L_%04X'%(cnd if cnd else ('?'+mn+' '+str(s.flags)),t))
            elif mn=='call':
                t=imm(ops[0])
                if t is None: s.note(a,'asm '+d['txt'])
                elif (t&0xFFFF) in s.fndefs:
                    t&=0xFFFF; s.calls[t]+=1; fn,addrs=s.fndefs[t]
                    argnames=[c.names.get('%04X'%x,'N_%04X!'%x) for x in addrs]
                    la=[s.lastassign.get(nm) for nm in argnames]
                    vals=[]; idxs=[]; ok=True
                    for nm,x in zip(argnames,la):
                        if x: vals.append(x[1]); idxs.append(x[0])
                        elif nm in s.pendingargs: vals.append(s.pendingargs.pop(nm))
                        else: ok=False
                    if ok and sorted(idxs)==list(range(len(s.out)-len(idxs),len(s.out))):
                        del s.out[len(s.out)-len(idxs):]
                        for nm in argnames: s.lastassign.pop(nm,None)
                    else: vals=argnames
                    s.reset(fac='%s(%s)'%(fn,', '.join(vals)))
                else:
                    t&=0xFFFF; s.calls[t]+=1
                    s.emit(a,'GOSUB SUB_%04X'%t)
                    s.reset(fac='FN_%04X'%t)
            elif mn=='ret':
                if s.fac not in ('FAC',None) and not s.fac.startswith('FN_'): s.emit(a,"RETURN   'with FAC = %s"%s.fac)
                else: s.emit(a,'RETURN')
                s.reset()
            elif mn=='int': s.note(a,'asm '+d['txt']+'  (data tail?)')
            elif mn=='db': s.note(a,'db '+d['txt'])
            else: s.note(a,'asm '+d['txt'])
            i+=1
        if s.pr is not None: s.flush_print(0)
    def rt(s,i):
        oldfac=s.fac; i2=s.rt0(i)
        if s.rt0 is not None and s.fac is not oldfac and s.ins[i]['rt']!='RT3F_57': s.facfrom=None
        return i2
    def rt0(s,i):
        d=s.ins[i]; a=d['addr']; rt=d['rt']; r=s.r; c=s.ctx
        inl=d.get('inl',[0])
        def N(reg): return s.num(r[reg])
        def S(reg): return s.st(r[reg])
        def I(reg): return s.iv(r[reg])
        def tslot(b): return s.temps.get(b&0x7F,'T%d'%(b&0x7F))
        if rt=='RT3F_7B': s.emit(a,'%s = %s'%(N('di'),N('si')))
        elif rt=='RT3F_7D':
            if s.pr is None and N('di')!='FAC':
                s.emit(a,'%s = %s'%(N('di'),s.fac))
                if isimm(r['di']) and c.tempslot(r['di'][1]) is None and N('di') not in s.fnargnames: s.fac=N('di'); s.facfrom=None
            elif s.pr is not None and N('di') in s.fnargnames: s.pendingargs[N('di')]=s.fac
        elif rt=='RT3F_6F': s.fac=N('si')
        elif rt=='RT3F_71':
            b=inl[0]&0x7F; s.temps[b]=s.fac
            s.tempsfrom[b]=s.facfrom if (s.facfrom and s.fac==s.iv(s.facfrom)) else None
        elif rt in ('RT3F_7F','RT3F_81','RT3F_83','RT3F_85'):
            L,R={'RT3F_7F':(N('si'),N('di')),'RT3F_81':(s.fac,N('di')),'RT3F_83':(N('si'),s.fac),'RT3F_85':(tslot(inl[0]),s.fac)}[rt]
            s.fac='%s + %s'%(L,R)
        elif rt in ('RT3F_97','RT3F_99','RT3F_9B','RT3F_9D'):
            L,R={'RT3F_97':(N('si'),N('di')),'RT3F_99':(s.fac,N('di')),'RT3F_9B':(N('si'),s.fac),'RT3F_9D':(tslot(inl[0]),s.fac)}[rt]
            s.fac='%s - %s'%(L,par(R))
        elif rt in ('RT3F_8F','RT3F_91','RT3F_93','RT3F_95'):
            L,R={'RT3F_8F':(N('si'),N('di')),'RT3F_91':(s.fac,N('di')),'RT3F_93':(N('si'),s.fac),'RT3F_95':(tslot(inl[0]),s.fac)}[rt]
            s.fac='%s * %s'%(par(L),par(R))
        elif rt in ('RT3F_87','RT3F_89','RT3F_8B','RT3F_8D'):
            L,R={'RT3F_87':(N('si'),N('di')),'RT3F_89':(s.fac,N('di')),'RT3F_8B':(N('si'),s.fac),'RT3F_8D':(tslot(inl[0]),s.fac)}[rt]
            s.fac='%s / %s'%(par(L),par(R))
        elif rt in ('RT3F_23','RT3F_25','RT3F_27'):
            L,R={'RT3F_23':(N('si'),N('di')),'RT3F_25':(s.fac,N('di')),'RT3F_27':(N('si'),s.fac)}[rt]
            s.fac='%s ^ %s'%(par(L),par(R))
        elif rt=='RT3F_9F': s.flags=('cmp',N('si'),N('di'))
        elif rt=='RT3F_A1': s.flags=('cmp',s.fac,N('di'))
        elif rt=='RT3F_A3': s.flags=('cmp',N('si'),s.fac)
        elif rt=='RT3F_A5': s.flags=('cmp',tslot(inl[0]),s.fac)
        elif rt=='RT3F_A7': s.flags=('test',N('si'))
        elif rt=='RT3F_A9': s.flags=('test',s.fac)
        elif rt in ('RT3F_75','RT3F_19'):
            v=r['si']
            if v and v[0]=='imm' and v[1] in c.numlit: r['bx']=('imm',int(c.numlit[v[1]])&0xFFFF)
            else: r['bx']=('int','CINT(%s)'%N('si'))
        elif rt in ('RT3F_77','RT3F_1B'): r['bx']=('int','CINT(%s)'%s.fac)
        elif rt=='RT3F_78': r['bx']=('int','CINT(%s)'%s.fac)
        elif rt=='RT3F_57':
            v=r['bx']
            if v and v[0]=='imm': s.fac=s.iv(v); s.facfrom=('imm',v[1])
            else: s.fac=I('bx')
        elif rt=='RT3F_7A': pass
        elif rt=='RT3F_2B': s.fac='ABS(%s)'%N('si')
        elif rt=='RT3F_2D': s.fac='ABS(%s)'%s.fac
        elif rt=='RT3F_AF': s.fac='-%s'%par(N('si'))
        elif rt=='RT3F_B1': s.fac='-%s'%par(s.fac)
        elif rt=='RT3F_2F': s.fac='SGN(%s)'%N('si')
        elif rt=='RT3F_31': s.fac='SGN(%s)'%s.fac
        elif rt=='RT3F_1D': r['bx']=('bool','(%s <> 0)'%N('si'))
        elif rt=='RT3F_1F': r['bx']=('bool','(%s <> 0)'%s.fac)
        elif rt=='RT3F_AB': b=inl[0]; b=b-256 if b>127 else b; s.fac='%s * %s'%(par(N('si')),2**b if b>=0 else '2^%d'%b)
        elif rt=='RT3F_AD': b=inl[0]; b=b-256 if b>127 else b; s.fac='%s * %s'%(par(s.fac),2**b if b>=0 else '2^%d'%b)
        elif rt=='RT3D_03': s.fac='INT(%s)'%(s.fac if isimm(r['bx']) and r['bx'][1]==0x1A else N('bx'))
        elif rt=='RT3D_33': s.fac='RND(%s)'%(s.fac if isimm(r['bx']) and r['bx'][1]==0x1A else N('bx'))
        elif rt=='RT3D_34': s.fac='RND'
        elif rt in ('RT3D_35','RT3D_38','RT3D_39','RT3D_3A'):
            fn={'RT3D_35':'ATN','RT3D_38':'LOG','RT3D_39':'SIN','RT3D_3A':'SQR'}[rt]
            s.fac='%s(%s)'%(fn,s.fac if isimm(r['bx']) and r['bx'][1]==0x1A else N('bx'))
        elif rt=='RT3D_43': s.fac='TIMER'
        elif rt=='RT3F_11': s.emit(a,'SWAP %s, %s'%(N('si'),N('di')))
        elif rt=='RT3F_14': s.emit(a,'SWAP %s, %s'%(S('si'),S('di')))
        elif rt=='RT3F_C9': s.fac='VARPTR(%s)'%s.arrref(r['bx'])
        elif rt=='RT3F_45': s.emit(a,'DIM %s(%d dims; sizes pushed above)'%(s.arrref(r['bx']),inl[0]))
        elif rt=='RT3D_11': r['bx']=('str','STR$(%s)'%(s.fac if isimm(r['bx']) and r['bx'][1]==0x1A else N('bx')))
        elif rt=='RT3D_13': s.fac='VAL(%s)'%S('bx')
        elif rt=='RT3F_55': r['bx']=('str','%s + %s'%(S('ax'),S('bx')))
        elif rt=='RT3F_61': s.emit(a,'%s = %s'%(S('dx'),S('bx')))
        elif rt=='RT3F_62': s.flags=('scmp',S('ax'),S('bx'))
        elif rt=='RT3F_BA': r['bx']=('int','LEN(%s)'%S('bx'))
        elif rt=='RT3F_BB': r['bx']=('int','ASC(%s)'%S('bx'))
        elif rt=='RT3D_05': r['bx']=('str','CHR$(%s)'%I('bx'))
        elif rt=='RT3D_06': r['bx']=('str','INKEY$')
        elif rt=='RT3D_0A': r['bx']=('str','MID$(%s, %s, %s)'%(S('bx'),I('dx'),I('cx')))
        elif rt=='RT3D_0B': r['bx']=('str','LEFT$(%s, %s)'%(S('bx'),I('dx')))
        elif rt=='RT3D_0C': r['bx']=('str','RIGHT$(%s, %s)'%(S('bx'),I('dx')))
        elif rt=='RT3D_0D': r['bx']=('str','SPACE$(%s)'%I('bx'))
        elif rt=='RT3D_0E': r['bx']=('str','STRING$(%s, %s)'%(I('bx'),I('dx')))
        elif rt=='RT3D_0F': r['bx']=('str','STRING$(%s, %s)'%(I('bx'),S('dx')))
        elif rt=='RT3D_08': r['bx']=('int','INSTR(%s, %s, %s)'%(I('bx'),S('dx'),S('cx')))
        elif rt=='RT3D_09': r['bx']=('int','INSTR(%s, %s)'%(S('bx'),S('dx')))
        elif rt=='RT3F_18': r['bx']=('str','VARPTR$(%s)'%S('bx'))
        elif rt=='RT3D_21': r['bx']=('int','POS(0)')
        elif rt=='RT3D_25': r['bx']=('int','CSRLIN')
        elif rt=='RT3D_2F': r['bx']=('bool','EOF(%s)'%I('bx'))
        elif rt=='RT3D_44': r['bx']=('int','STICK(%s)'%I('bx'))
        elif rt=='RT3F_BC': s.pr=dict(addr=a,items=[],using=None,file=None)
        elif rt=='RT3F_BD': s.pr=dict(addr=a,items=[],using=S('bx'),file=None)
        elif rt=='RT3F_BE': s.pr=dict(addr=a,items=[],using=None,file=I('bx'))
        elif rt in ('RT3F_6A','RT3F_6E','RT3F_67','RT3F_6B','RT3F_6D','RT3F_35'):
            if s.pr is None: s.pr=dict(addr=a,items=[],using=None,file=None)
            if rt=='RT3F_6A': s.pr['items'].append((S('bx'),False))
            elif rt=='RT3F_6E': s.pr['items'].append((S('bx'),True))
            elif rt=='RT3F_67': s.pr['items'].append((N('bx'),False))
            elif rt=='RT3F_6B': s.pr['items'].append((N('bx'),True))
            elif rt=='RT3F_6D': s.pr['items'].append((I('bx'),True))
            else: s.pr['items'].append(('SPC(%s)'%I('bx'),False))
        elif rt=='RT3E_79': s.flush_print(a)
        elif rt in ('RT3E_42','RT3E_33','RT3E_59'): s.args.append(I('bx'))
        elif rt=='RT3E_43': s.args.append('')
        elif rt=='RT3E_44': s.emit(a,'LOCATE %s'%', '.join(s.args+[I('bx')])); s.args=[]
        elif rt=='RT3E_35': s.emit(a,'COLOR %s'%', '.join(s.args+[I('bx')])); s.args=[]
        elif rt=='RT3E_5B': s.emit(a,'SCREEN %s'%', '.join(s.args+[I('bx')])); s.args=[]
        elif rt=='RT3E_32': v=I('bx'); s.emit(a,'CLS' if v=='-1' else 'CLS %s'%v)
        elif rt=='RT3E_3C': s.emit(a,'KEY %s'%{'0':'OFF','1':'ON','2':'LIST'}.get(I('bx'),I('bx')))
        elif rt=='RT3E_2B': s.emit(a,'BEEP')
        elif rt=='RT3E_4A': s.emit(a,'PALETTE %s, %s'%(I('bx'),I('dx')))
        elif rt in ('RT3E_89','RT3E_8D','RT3E_84','RT3E_87'):
            s.gfx={'xy':s.coord('bx','dx',r['cx'],r['ax'])}
        elif rt in ('RT3E_85','RT3E_88'): s.gfx['xy2']=s.coord('bx','dx',r['cx'],r['ax'])
        elif rt=='RT3E_58':
            dv=imm(I('dx')) if I('dx').lstrip('-').isdigit() else None
            far=dv is not None and (dv&0xFF00)!=0
            verb={0:'OR',1:'AND',2:'PRESET',3:'PSET',4:'XOR'}.get(dv&0xFF if dv is not None else None,I('dx'))
            s.emit(a,'PUT %s, %s, %s'%(s.gfx.get('xy','(?)'),s.arrref(r['bx']),verb),'dynamic array (descriptor)' if far else None)
        elif rt=='RT3E_3A': s.emit(a,'GET %s-%s, %s'%(s.gfx.get('xy','(?)'),s.gfx.get('xy2','(?)'),s.arrref(r['bx'])))
        elif rt=='RT3E_86':
            col=I('bx'); dx=I('dx'); cx=I('cx')
            opt={'-1':'','0':', B','1':', BF'}.get(dx,', ?%s'%dx)
            sty='' if cx=='-1' else (', &H%04X'%(int(cx)&0xFFFF) if cx.lstrip('-').isdigit() else ', %s'%cx)
            tail=('' if col=='-1' else col)+(opt if (opt or not sty) else ', ')+sty
            s.emit(a,'LINE %s-%s%s'%(s.gfx.get('xy','(?)'),s.gfx.get('xy2','(?)'),(', '+tail) if tail else ''))
        elif rt=='RT3E_2F': s.gfx['start']=N('bx')
        elif rt=='RT3E_30': s.gfx['end']=N('bx')
        elif rt=='RT3E_31': s.gfx['aspect']=N('bx')
        elif rt=='RT3E_8C':
            g=s.gfx; extra=''
            if 'start' in g or 'end' in g or 'aspect' in g: extra=', %s, %s, %s'%(g.get('start',''),g.get('end',''),g.get('aspect',''))
            s.emit(a,'CIRCLE %s, %s, %s%s'%(g.get('xy','(?)'),N('bx'),I('dx'),extra)); s.gfx={}
        elif rt=='RT3E_48': s.emit(a,'PAINT %s, %s, %s'%(s.gfx.get('xy','(?)'),I('bx'),I('dx')))
        elif rt=='RT3E_8B': col=I('bx'); s.emit(a,'PSET %s%s'%(s.gfx.get('xy','(?)'),'' if col=='-1' else ', '+col))
        elif rt=='RT3E_8A': col=I('bx'); s.emit(a,'PRESET %s%s'%(s.gfx.get('xy','(?)'),'' if col=='-1' else ', '+col))
        elif rt=='RT3E_51': s.emit(a,'PLAY %s'%S('bx'))
        elif rt=='RT3E_5E': s.sound=(I('bx'),s.fac if isimm(r['dx']) and r['dx'][1]==0x1A else N('dx'))
        elif rt=='RT3E_5F': s.emit(a,'SOUND %s, %s'%(s.sound or ('?','?'))); s.sound=None
        elif rt=='RT3E_1A':
            off=s.fac if isimm(r['dx']) and r['dx'][1]==0x1A else N('dx')
            if s.facfrom and isimm(r['dx']) and r['dx'][1]==0x1A: off='&H%04X'%s.facfrom[1]
            ts=c.tempslot(r['dx'][1]) if isimm(r['dx']) else None
            if ts is not None and s.tempsfrom.get(ts): off='&H%04X'%s.tempsfrom[ts][1]
            s.emit(a,'BLOAD %s, %s'%(S('bx'),off))
        elif rt=='RT3E_1B':
            off=s.fac if isimm(r['dx']) and r['dx'][1]==0x1A else N('dx')
            if s.facfrom and isimm(r['dx']) and r['dx'][1]==0x1A: off='&H%04X'%s.facfrom[1]
            ts=c.tempslot(r['dx'][1]) if isimm(r['dx']) else None
            if ts is not None and s.tempsfrom.get(ts): off='&H%04X'%s.tempsfrom[ts][1]
            s.emit(a,'BSAVE %s, %s, %s'%(S('bx'),off,I('cx')))
        elif rt=='RT3E_0E': s.emit(a,'CHAIN %s'%S('bx'))
        elif rt=='RT3E_20': s.openmode={'0':'INPUT','1':'OUTPUT','2':'RANDOM','3':'APPEND'}.get(I('bx'),I('bx'))
        elif rt=='RT3E_1E': s.emit(a,'OPEN %s FOR %s AS #%s'%(S('dx'),s.openmode,I('bx'))); s.openmode=None
        elif rt=='RT3E_21': s.emit(a,'CLOSE #%s'%I('bx'))
        elif rt=='RT3F_B6': s.inp=dict(addr=a,kind='INPUT #%s,'%I('bx'),items=[],types=[])
        elif rt=='RT3F_B5':
            p=S('bx'); s.inp=dict(addr=a,kind='INPUT %s%s'%(p,';' if p!='""' else ''),items=[],types=[])
        elif rt=='RT3F_B7':
            if s.inp is None: s.inp=dict(addr=a,kind='INPUT',items=[],types=[])
            s.inp['types']=d.get('types',[])
        elif rt=='RT3F_B8':
            if s.inp is None: s.inp=dict(addr=a,kind='INPUT',items=[],types=[])
            k=s.inp['types'][len(s.inp['items'])] if len(s.inp['items'])<len(s.inp['types']) else 4
            v=r['bx']; ad=v[1] if isimm(v) else (v[1] if v and v[0]=='elem' else None)
            pk=(c.prekinds.get('%04X'%ad,{}) if isimm(v) else c.prearrays.get('%04X'%ad,{})) if ad is not None else {}
            if k==1: tgt=c.var(v[1],'I') if isimm(v) else (c.elem(v[1],v[2],'I',v[3]) if v and v[0]=='elem' else 'I(%s)'%I('bx'))
            elif k==4: tgt=S('bx')
            elif k in (2,3): tgt=N('bx')
            else: tgt=S('bx') if 'S' in pk else N('bx')
            s.inp['items'].append(tgt)
            if len(s.inp['items'])>=len(s.inp['types']):
                s.emit(s.inp['addr'],'%s %s'%(s.inp['kind'],', '.join(s.inp['items']))); s.inp=None
        elif rt=='RT3F_5A': s.emit(a,'LINE INPUT #%s, %s'%(s.inp['kind'].split('#')[1].rstrip(',') if s.inp else '?',S('bx'))); s.inp=None
        elif rt in ('RT3F_0D','RT3F_0F','RT3F_10'):
            tgt={'RT3F_0D':N('bx'),'RT3F_10':S('bx')}.get(rt)
            if rt=='RT3F_0F': v=r['bx']; tgt=c.var(v[1],'I') if isimm(v) else ('%s(%s)'%(c.arr(v[1],v[2],'I'),v[3]) if v and v[0]=='elem' else 'I(%s)'%I('bx'))
            s.emit(a,'READ %s'%tgt)
        elif rt in ('RT3F_5D','RT3F_5E'):
            kw='GOSUB' if rt=='RT3F_5D' else 'GOTO'
            s.emit(a,'ON %s %s %s'%(I('bx'),kw,', '.join(('SUB_%04X' if t in s.subs else 'L_%04X')%t for t in d.get('tgts',[]))))
        elif rt=='RT3F_02':
            v=r['dx']; t=(v[1]+0x10)&0xFFFF if isimm(v) else None
            if t==0x10: s.emit(a,'ON ERROR GOTO 0')
            elif t is not None: s.emit(a,'ON ERROR GOTO L_%04X'%t); s.labels.add(t)
            else: s.emit(a,'ON ERROR GOTO %s'%I('dx'))
        elif rt=='RT3F_09':
            v=r['bx']; t=(v[1]+0x10)&0xFFFF if isimm(v) else None
            if t is not None: s.emit(a,'RESUME L_%04X'%t); s.labels.add(t)
            else: s.emit(a,'RESUME %s'%I('bx'))
        elif rt=='RT3E_09': s.emit(a,'RANDOMIZE %s'%(s.fac if isimm(r['bx']) and r['bx'][1]==0x1A else N('bx')))
        elif rt=='RT3E_01': s.emit(a,'END')
        elif rt=='RT3E_02': s.emit(a,"END   'error-handler fallthrough (error 19 if an error is active)")
        else:
            c.unknown[rt]+=1; c.unknown_sites[rt].append(a)
            s.emit(a,'CALL %s(BX=%s, DX=%s, CX=%s, AX=%s, SI=%s, DI=%s)'%(rt,I('bx'),I('dx'),I('cx'),I('ax'),I('si'),I('di')))
            s.reset(fac='FAC')
        return i+1

def atom(t):
    d=0
    for ch in t:
        if ch=='(': d+=1
        elif ch==')':
            d-=1
            if d<0: return False
        elif ch==' ' and d==0: return False
    return d==0
def par(t):
    if t.startswith('(') and t.endswith(')') and atom(t): return t
    return t if re.fullmatch(r'[\w\.\$!%#"]+(\([^()]*\))?',t) or t.startswith('"') else '(%s)'%t

def main():
    args=sys.argv[1:]
    lst,cj,outp=args[0],args[1],args[2]
    names=json.load(open(args[args.index('--names')+1])) if '--names' in args else {}
    title=args[args.index('--title')+1] if '--title' in args else 'MODULE'
    tempbase=int(args[args.index('--tempbase')+1],16) if '--tempbase' in args else None
    consts=json.load(open(cj))
    cc={'str':{},'num':{}}
    for it in consts['init']:
        if it['kind']=='str': cc['str'][it['addr']]=it['text']
        elif it['kind']=='single': cc['num'][it['addr']]=it['value']
    ins=parse(lst)
    cend=int(args[args.index('--end')+1],16) if '--end' in args else consts['code_end']; ins=[d for d in ins if d['addr']<cend]
    ctx=Ctx(cc,names); ctx.tempbase=tempbase
    import os
    if os.path.exists(outp+'.vars.json'):
        pj=json.load(open(outp+'.vars.json')); ctx.prekinds=pj['vars']; ctx.prearrays=pj['arrays']
        ctx.dims={int(k,16):v for k,v in pj.get('dims',{}).items()}
    header=open(args[args.index('--header')+1],encoding='utf-8').read().rstrip('\n') if '--header' in args else None
    x=Xl(ins,ctx); x.run()
    L=[]
    L.append('```basic')
    for a,t in x.out:
        if t.endswith(':'): L.append(t)
        else: L.append('%05X  %s'%(a,t))
    L.append('```')
    body='\n'.join(L)
    V=['| address | kinds (uses) | name | evidence |','|---|---|---|---|']
    for a in sorted(ctx.vars):
        if a in cc['str'] or a in cc['num'] or a==0x1A: continue
        kinds=', '.join('%s x%d'%(k,v) for k,v in ctx.vars[a].most_common())
        nm=names.get('%04X'%a,''); ev=names.get('%04X_why'%a,'')
        if not nm and a in ctx.folded:
            b,i,nm=ctx.folded[a]; es=[r for r in ctx.ranges if r[0]==b][0][2]
            ev=ev or 'element %d of the array at 0x%04X (0x%04X + %d*%d): constant index folded into a direct operand by the compiler'%(i,b,b,es,i)
        V.append('| 0x%04X | %s | %s | %s |'%(a,kinds,nm,ev))
    A=['| base | element size / kinds (uses) | name | evidence |','|---|---|---|---|']
    for b in sorted(ctx.arrays):
        kinds=', '.join('%s x%d'%(k,v) for k,v in ctx.arrays[b].most_common())
        rng=[r for r in ctx.ranges if r[0]==b]
        if rng: kinds+=(', ' if kinds else '')+'%d elements (0..%d)'%(rng[0][1],rng[0][1]-1)
        if b in ctx.dims: kinds+=', 2-D (first dimension %d)'%ctx.dims[b]
        nm=names.get('A%04X'%b,''); ev=names.get('A%04X_why'%b,'')
        A.append('| 0x%04X | %s | %s | %s |'%(b,kinds,nm,ev))
    U=['| routine | uses | sites |','|---|---|---|']
    for rtn,cnt in ctx.unknown.most_common(): U.append('| %s | %d | %s |'%(rtn,cnt,' '.join('%04X'%s for s in ctx.unknown_sites[rtn][:12])))
    SUBS=['| sub | calls | role |','|---|---|---|']
    for t,cnt in sorted(x.calls.items()): SUBS.append('| SUB_%04X | %d | %s |'%(t,cnt,names.get('SUB%04X'%t,'')))
    json.dump(dict(vars={('%04X'%a):dict(v) for a,v in ctx.vars.items()},arrays={('%04X'%b):dict(v) for b,v in ctx.arrays.items()},calls={('%04X'%t):c for t,c in x.calls.items()},dims={('%04X'%b):d for b,d in ctx.dims.items()}),open(outp+'.vars.json','w'),indent=0)
    if '--sweep' in args:
        for a,(nm,hit) in sorted(ctx.named_in_range.items()):
            ok=nm==hit[2] or re.fullmatch(re.escape(hit[2].split('(')[0])+r'\(.*\)',nm)
            print('sweep %s %04X %s = %s'%('consistent' if ok else ('alias (COMMON G! index map, CROSSREF.md 2.2):' if hit[0]==0x1850 else 'HIT named scalar inside array:'),a,nm,hit[2]))
        for a,hit in sorted(ctx.folded.items()): print('sweep folded %04X -> %s (kinds %s)'%(a,hit[2],dict(ctx.vars[a])))
        known={r[0] for r in ctx.ranges}
        for b in sorted(ctx.arrays):
            if b in known or b<0x4890: continue
            es=4 if ('N' in ctx.arrays[b] or 'S' in ctx.arrays[b]) else 2; nm=names.get('A%04X'%b,'A_%04X'%b)
            for a in sorted(ctx.vars):
                if b<a<b+11*es and a not in ctx.arrays and (a-b)%es==0 and not any(b<o<=a for o in ctx.arrays): print('sweep suspect %04X %s within 11 elements of %s: would be %s(%d)'%(a,names.get('%04X'%a,'-'),nm,nm,(a-b)//es))
    open(outp,'w',encoding='utf-8',newline='\n').write('\n'.join([header if header is not None else '<!-- generated by qb2bas.py; edit %s_header.md for prose -->'%title,'','## Pseudocode','',body,'','## Subroutines (near CALL targets)','']+SUBS+['','## Variables','',"Addresses are DS offsets. kinds: N = 4-byte single, S = string descriptor, I = integer, P = array/untyped (PUT/BLOAD target). Names come from `%s_names.json` (evidence column = why)."%title]+V+['','### Arrays (indexed access base addresses)','']+A+['','## Unknowns (runtime calls not rendered)','']+U+['']))
    print('statements',len(x.out),'vars',len(ctx.vars),'arrays',len(ctx.arrays),'unknown rt',dict(ctx.unknown),'subs',len(x.calls))
if __name__=='__main__': main()
