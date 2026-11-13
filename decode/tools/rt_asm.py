import sys,os,json,csv
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from mz import load
from capstone import Cs,CS_ARCH_X86,CS_MODE_16
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B=load(sys.argv[1])["lm"]
T=json.load(open(os.path.join(D,"brun30_tables.json")))["tables"]
used=[r["rt"] for r in csv.DictReader(open(os.path.join(D,"brun30","used_routines.tsv")),delimiter="\t")]
md=Cs(CS_ARCH_X86,CS_MODE_16)
out=[]
N=int(sys.argv[2]) if len(sys.argv)>2 else 28
for nm in used:
    g,i=nm[2:4],int(nm[5:],16)
    if i>=len(T[g]): out.append("%s: index beyond table\n"%nm); continue
    off=T[g][i]; out.append("==== %s @%04X"%(nm,off))
    n=0
    for ins in md.disasm(B[off:off+200],off):
        out.append("  %04X  %-16s %s %s"%(ins.address,ins.bytes.hex(" "),ins.mnemonic,ins.op_str)); n+=1
        if ins.mnemonic in ("retf","ret","iret") or (ins.mnemonic=="jmp" and n>1) or n>=N: break
    out.append("")
open(os.path.join(D,"brun30","rt_asm.txt"),"w").write("\n".join(out))
print("routines:",len(used))
