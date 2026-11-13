import sys,os,struct,zlib
EGA=[(0,0,0),(0,0,170),(0,170,0),(0,170,170),(170,0,0),(170,0,170),(170,85,0),(170,170,170),
     (85,85,85),(85,85,255),(85,255,85),(85,255,255),(255,85,85),(255,85,255),(255,255,85),(255,255,255)]
CGA1=[(0,0,0),(85,255,255),(255,85,255),(255,255,255)]
CGA0=[(0,0,0),(85,255,85),(255,85,85),(255,255,85)]

def png(path,w,h,pix,pal,scale=1):
    raw=bytearray()
    for y in range(h):
        row=bytearray([0])
        for x in range(w):
            c=pal[pix[y*w+x]]
            row+=bytes(c)*scale
        for _ in range(scale): raw+=row
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    hdr=struct.pack('>IIBBBBB',w*scale,h*scale,8,2,0,0,0)
    open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',hdr)+chunk(b'IDAT',zlib.compress(bytes(raw),9))+chunk(b'IEND',b''))

def header(b):
    return dict(magic=b[0],seg=struct.unpack_from('<H',b,1)[0],off=struct.unpack_from('<H',b,3)[0],len=struct.unpack_from('<H',b,5)[0])

def plausible(b,pos,mode):
    if pos+4>len(b): return None
    w,h=struct.unpack_from('<HH',b,pos)
    if w==0 or h==0 or w>640 or h>200: return None
    if mode=='cga' and w%2: return None
    rowb=(w+7)//8
    n=4+rowb*h*(4 if mode=='ega' else 1)
    return (w,h,n)

def walk(b,mode,maxn=64,start=7):
    pos=start; out=[]
    while len(out)<maxn:
        cand=None
        for tries in range(4):
            q=pos+(1 if (pos-start)%2 else 0)+2*tries
            r=plausible(b,q,mode)
            if r: cand=(q,)+r; break
        if not cand: break
        q,w,h,n=cand
        trunc=max(0,q+n-(len(b)-1))
        if trunc>8: break
        out.append((q,w,h,n,trunc)); pos=q+n
        if trunc: break
    return out,pos

def decode(b,pos,mode,planes='BGRI',layout='row'):
    w,h=struct.unpack_from('<HH',b,pos); rowb=(w+7)//8; d=b[pos+4:]+bytes(16)
    if mode=='cga':
        pw=w//2; pix=[]
        for y in range(h):
            r=d[y*rowb:(y+1)*rowb]
            for x in range(pw):
                byte=r[x//4]; sh=6-2*(x%4); pix.append((byte>>sh)&3)
        return pw,h,pix
    order={'B':0,'G':1,'R':2,'I':3}
    bits=[order[c] for c in planes]
    pix=[0]*(w*h)
    for y in range(h):
        for k in range(4):
            if layout=='row': r=d[(y*4+k)*rowb:(y*4+k+1)*rowb]
            else: r=d[(k*h+y)*rowb:(k*h+y+1)*rowb]
            for x in range(w):
                if r[x//8]>>(7-x%8)&1: pix[y*w+x]|=1<<bits[k]
    return w,h,pix

if __name__=='__main__':
    a=sys.argv; f=a[1]; mode=a[a.index('--mode')+1]; out=a[a.index('--out')+1]
    planes=a[a.index('--planes')+1] if '--planes' in a else 'BGRI'
    layout=a[a.index('--layout')+1] if '--layout' in a else 'row'
    maxn=int(a[a.index('--max')+1]) if '--max' in a else 64
    scale=int(a[a.index('--scale')+1]) if '--scale' in a else 1
    pal=CGA0 if '--pal0' in a else CGA1
    b=open(f,'rb').read(); hd=header(b); arrs,end=walk(b,mode,maxn)
    stem=os.path.basename(f).replace('.','_')
    print(f,hd,'arrays',[(hex(p),w,h,n,t) for p,w,h,n,t in arrs],'walk_end',end,'file',len(b))
    os.makedirs(out,exist_ok=True)
    for i,(p,w,h,n,t) in enumerate(arrs):
        pw,ph,pix=decode(b,p,mode,planes,layout)
        tag='' if mode=='cga' else '_'+planes+'_'+layout
        png(os.path.join(out,'%s_%d%s.png'%(stem,i,tag)),pw,ph,pix,EGA if mode=='ega' else pal,scale)

def sheet(path,items,scale=2,gap=4):
    rows=[[]]; x=0
    for it in items:
        if x+it[0]>600 and rows[-1]: rows.append([]); x=0
        rows[-1].append(it); x+=it[0]+gap
    W=max(sum(i[0]+gap for i in r) for r in rows); H=sum(max(i[1] for i in r)+gap for r in rows)
    pix=[(40,40,40)]*(W*H)
    y0=0
    for r in rows:
        x0=0; rh=max(i[1] for i in r)
        for (w,h,p,pal) in r:
            for y in range(h):
                for x in range(w): pix[(y0+y)*W+x0+x]=pal[p[y*w+x]]
            x0+=w+gap
        y0+=rh+gap
    png(path,W,H,list(range(W*H)),pix,scale)
