import sys,os,glob,struct
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import bsave
S='../re-targets/starcommand/starcoma/'
OUT='decode/data/png'; os.makedirs(OUT+'/sheets',exist_ok=True)
NUMERIC={'CHARINFO.BAS','GALAXY.BAS','INFO.BAS','IN-1.BAS','IN-2.BAS','IN-3.BAS','IN-4.BAS','IN-5.BAS','IN-6.BAS','IN-7.BAS'}
SLOTS={'cga':[7,1273,2509,3745,4981],'ega':[7,2727,3721,4485]}
START={'INSH.BAS':0x87}
MAXN={'INSH':80,'DEMOSH':1,'LOGO':1,'TITLE':5,'MAP-':1,'GAL.':1,'GALMAP':1,'INMAP':1,'SPPIC':1,'SPSTGRPH':1,'TR-':4}
rows=[]
for p in sorted(glob.glob(S+'*.BAS')+glob.glob(S+'*.EGA')):
    name=os.path.basename(p)
    if name in NUMERIC: continue
    b=open(p,'rb').read(); hd=bsave.header(b)
    mode='ega' if name.endswith('.EGA') else 'cga'
    maxn=64
    for k,v in MAXN.items():
        if name.startswith(k): maxn=v
    arrs,end=bsave.walk(b,mode,maxn,START.get(name,7))
    twin=p[:-4]+'.EGA'
    if mode=='cga' and os.path.exists(twin) and not name.startswith('BIGSH') and name!='LOGO.BAS':
        tb=open(twin,'rb').read(); tarrs,tend=bsave.walk(tb,'ega',64); arrs=[]
        for (pos,w,h,n,t) in tarrs:
            r=bsave.plausible(b,pos,'cga')
            if r: arrs.append((pos,r[0],r[1],r[2],0))
        end=tend
    if name.startswith('BIGSH'):
        arrs=[]; end=7
        for pos in SLOTS[mode]:
            r=bsave.plausible(b,pos,mode)
            if pos>=end and r and pos+r[2]<=len(b)-1:
                arrs.append((pos,r[0],r[1],r[2],0)); end=pos+r[2]
    items=[]
    for i,(pos,w,h,n,t) in enumerate(arrs):
        pw,ph,pix=bsave.decode(b,pos,mode)
        pal=bsave.EGA if mode=='ega' else bsave.CGA1
        bsave.png(os.path.join(OUT,'%s_%d.png'%(name.replace('.','_'),i)),pw,ph,pix,pal,1)
        items.append((pw,ph,pix,pal))
    if items: bsave.sheet(os.path.join(OUT,'sheets','%s.png'%name.replace('.','_')),items,2)
    rows.append((name,len(b),hd['seg'],hd['off'],hd['len'],mode,';'.join('%d:%dx%d@%d%s'%(i,(w//2 if mode=='cga' else w),h,pos,('(short%d)'%t if t else '')) for i,(pos,w,h,n,t) in enumerate(arrs)),len(b)-end-1))
for r in rows: print('\t'.join(str(x) for x in r))
