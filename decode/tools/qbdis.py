"""qbdis.py MODULE.EXE [--out listing.txt]: QuickBASIC 3.0 module disassembler.
Treats INT 3D/3E/3F + inline byte as runtime calls (RT3x_nn); INT 3D 00 + word = far call via pointer table (RT3D_FAR[idx]).
Extra inline bytes per routine come from brun30/inline_args.json (int = fixed count, "1+b0" / "1+2*b0" = count byte b0
followed by b0 bytes / b0 words). Word tables hold CS offsets; listing offset = CS offset + 0x10 (see RT_LEDGER.md).
Uses capstone (WSL). Linear code walk from header end (0x40); emits listing with xref counts of runtime calls."""
import sys,os,struct,collections,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from mz import load
from capstone import Cs,CS_ARCH_X86,CS_MODE_16
B30=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),"brun30")
NAMES=json.load(open(os.path.join(B30,"rt_names.json")))
INLINE={k:v for k,v in json.load(open(os.path.join(B30,"inline_args.json"))).items() if not k.startswith("_")}
CSBASE=0x10   # listing offset of CS:0000 for module code addresses stored in operands/tables
path=sys.argv[1]; out=sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else None
m=load(path); lm=m["lm"]
codepar=struct.unpack_from("<H",lm,2)[0]; cstart=0x40; cend=cstart+codepar*16
code=lm[:cend]
md=Cs(CS_ARCH_X86,CS_MODE_16); md.detail=False
def inline_len(nm,pos):
    """number of extra inline bytes after the 3-byte call at pos, and a rendering of them"""
    spec=INLINE.get(nm)
    if spec is None: return 0,""
    if isinstance(spec,int):
        return spec," ".join("#%02X"%b for b in code[pos+3:pos+3+spec])
    b0=code[pos+3] if pos+3<cend else 0
    if spec=="1+b0":
        n=1+b0; return n,"n=%d types=%s"%(b0," ".join("%02X"%b for b in code[pos+4:pos+3+n]))
    if spec=="1+2*b0":
        n=1+2*b0; tgts=[struct.unpack_from("<H",code,pos+4+2*i)[0] for i in range(b0) if pos+6+2*i<=cend]
        return n,"n=%d -> %s"%(b0," ".join("%05X"%(t+CSBASE) for t in tgts))
    raise ValueError(spec)
lines=[]; rt=collections.Counter(); pos=cstart
while pos<cend:
    if code[pos]==0xCD and pos+2<cend and code[pos+1] in (0x3D,0x3E,0x3F):
        g=code[pos+1]; n=code[pos+2]
        if g==0x3D and n==0 and pos+5<=cend:
            w=struct.unpack_from("<H",code,pos+3)[0]; lines.append("%05X  %-20s %s"%(pos,code[pos:pos+5].hex(" "),"CALLFAR RT3D_FAR[%04X]"%w)); rt["RT3D_FAR[%04X]"%w]+=1; pos+=5
        else:
            nm="RT%02X_%02X"%(g,n)
            extra,arg=inline_len(nm,pos)
            lab=NAMES.get(nm,"")
            hexs=code[pos:pos+3+min(extra,6)].hex(" ")+(" .." if extra>6 else "")
            lines.append("%05X  %-20s %s"%(pos,hexs,"CALL "+nm+((" "+arg) if arg else "")+(("   ; "+lab) if lab else ""))); rt[nm]+=1; pos+=3+extra
        continue
    ins=next(md.disasm(code[pos:pos+15],pos),None)
    if ins is None: lines.append("%05X  %-20s db 0x%02x"%(pos,code[pos:pos+1].hex(),code[pos])); pos+=1; continue
    lines.append("%05X  %-20s %s %s"%(ins.address,ins.bytes.hex(" "),ins.mnemonic,ins.op_str)); pos+=ins.size
text="\n".join(lines)+"\n\n; runtime call usage\n"+"\n".join("%-16s %d"%(k,v) for k,v in rt.most_common())+"\n"
if out: open(out,"w",newline="\n").write(text)   # LF on Windows too (byoc-b3: the committed listings are LF)
else: print(text)
print("instructions:",len(lines),"distinct runtime calls:",len(rt),file=sys.stderr)
