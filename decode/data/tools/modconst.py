import sys,os,struct,json
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','tools'))
from mz import load

def mbf_single(b):
    e=b[3]
    if e==0: return 0.0
    s=-1.0 if b[2]&0x80 else 1.0
    m=((b[2]|0x80)<<16|b[1]<<8|b[0])/float(1<<24)
    return s*m*2.0**(e-128)

def mbf_double(b):
    e=b[7]
    if e==0: return 0.0
    s=-1.0 if b[6]&0x80 else 1.0
    m=int.from_bytes(bytes([b[0],b[1],b[2],b[3],b[4],b[5],b[6]|0x80]),'little')/float(1<<56)
    return s*m*2.0**(e-128)

def parse(path):
    m=load(path); lm=m['lm']; hw=struct.unpack_from('<32H',lm,0)
    cend=0x40+hw[1]*16
    out=dict(file=os.path.basename(path),lm_len=len(lm),hdr=m['hdr'],code_end=cend,header_words=[hex(x) for x in hw],
             data_start=hw[15],data_end=hw[16],common_start=hw[20],common_len=hw[21])
    blocks=[]; p=hw[27]*16
    if hw[26]!=hw[27]: p=hw[26]*16
    while p+16<=len(lm):
        bid,n,ln=struct.unpack_from('<HHH',lm,p)
        if bid<0x16 or bid>0x30 or lm[p+11]!=0x40: break
        data=lm[p+16:p+16+ln]
        blocks.append(dict(id=bid,n=n,len=ln,off=p,data=data))
        p=p+16+((ln+15)//16)*16
    out['blocks']=[dict(id=b['id'],n=b['n'],len=b['len'],off=b['off']) for b in blocks]
    name_off=hw[28]*16; init_off=hw[29]*16
    for b in blocks:
        if b['off']==name_off: b['kind']='NAME'
        elif b['off']==init_off: b['kind']='INIT'
        elif b['off']==hw[27]*16: b['kind']='A'
        elif b['off']<hw[27]*16: b['kind']='OFS'
        elif name_off<b['off']<init_off: b['kind']='DATA'
        elif b['off']>init_off: b['kind']='LINES'
    for b in blocks:
        k=b.get('kind'); d=b['data']
        if k=='NAME': out['source_name']=d.split(b'\0')[0].decode('latin1')
        elif k=='A': out['blockA']=d.hex(' ')
        elif k=='OFS': out['ofs']=[struct.unpack_from('<H',d,i)[0] for i in range(0,len(d)-1,2)]
        elif k=='DATA':
            recs=[]; i=0
            while i+2<=len(d):
                line=struct.unpack_from('<H',d,i)[0]; i+=2
                if line==0xFFFF: recs.append(dict(line=None,text=d[i:].hex(' '),note='terminator')); break
                j=d.index(b'\0',i); recs.append(dict(line=line,text=d[i:j].decode('latin1'))); i=j+1
            out['data']=recs
        elif k=='INIT':
            recs=[]; i=0
            while i+4<=len(d):
                ln,ad=struct.unpack_from('<HH',d,i)
                if ln==0: out['init_tail']=d[i:].hex(' '); break
                recs.append(dict(off=b['off']+16+i,len=ln,addr=ad,payload=d[i+4:i+ln])); i+=ln
            out['init_raw']=recs
        elif k=='LINES':
            out['lines']=[struct.unpack_from('<HH',d,i) for i in range(0,len(d)-3,4)]
    recs=out.get('init_raw',[]); byaddr={r['addr']:r for r in recs}
    items=[]; used=set()
    for r in recs:
        if r['addr'] in used: continue
        pl=r['payload']; n=len(pl)
        if n==4:
            L,P=struct.unpack('<HH',pl)
            if L==0 and P==r['addr']+4:
                items.append(dict(kind='str',addr=r['addr'],body_addr=P,len=0,text='',pad='',off=r['off'])); continue
            if L>0 and P in byaddr and L<=byaddr[P]['len']-4<=L+1 and P==r['addr']+4:
                body=byaddr[P]['payload']
                items.append(dict(kind='str',addr=r['addr'],body_addr=P,len=L,text=body[:L].decode('latin1'),pad=body[L:].hex(),off=r['off'])); used.add(P); continue
            items.append(dict(kind='single',addr=r['addr'],bytes=pl.hex(' '),value=mbf_single(pl),off=r['off']))
        elif n==8: items.append(dict(kind='double',addr=r['addr'],bytes=pl.hex(' '),value=mbf_double(pl),off=r['off']))
        elif n==2: items.append(dict(kind='int',addr=r['addr'],bytes=pl.hex(' '),value=struct.unpack('<h',pl)[0],off=r['off']))
        elif n==10:
            dptr,f,sz,z,cnt=struct.unpack('<HHHHH',pl)
            items.append(dict(kind='array',addr=r['addr'],data=dptr,flags=f,bytes=sz,w3=z,count=cnt,raw=pl.hex(' '),off=r['off']))
        else: items.append(dict(kind='raw',addr=r['addr'],bytes=pl.hex(' '),off=r['off']))
    out['init']=items
    del out['init_raw']
    return out

if __name__=='__main__':
    o=parse(sys.argv[1])
    if '--json' in sys.argv:
        json.dump(o,open(sys.argv[sys.argv.index('--json')+1],'w'),indent=1,default=str)
    print(o['file'],'source',o.get('source_name'),'code_end',hex(o['code_end']),'data',hex(o['data_start']),'-',hex(o['data_end']),'common',hex(o['common_start']),'+',hex(o['common_len']))
    print(' blocks',[(hex(b['id']),b.get('kind'),b['n'],b['len'],hex(b['off'])) for b in o['blocks']])
    print(' blockA',o.get('blockA'),'ofs',o.get('ofs'))
    print(' init_tail',o.get('init_tail'),'items',len(o['init']),'lines',len(o.get('lines',[])),'data',len(o.get('data',[])))
    from collections import Counter; print(' kinds',Counter(i['kind'] for i in o['init']))
    for i in o['init'][:12]: print('  ',i)
    for d in o.get('data',[])[:3]: print('  DATA',d)
