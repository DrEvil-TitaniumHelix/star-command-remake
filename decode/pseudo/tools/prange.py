import sys
a=int(sys.argv[2],16); b=int(sys.argv[3],16); last=0
for l in open(sys.argv[1],encoding='utf-8'):
    l=l.rstrip('\n')
    if len(l)>6 and l[5]==' ':
        try: last=int(l[:5],16)
        except ValueError: pass
    elif l.startswith(('L_','SUB_')):
        try: last=int(l[l.index('_')+1:l.index(':')],16)
        except ValueError: pass
    if a<=last<=b: print(l[:150])
