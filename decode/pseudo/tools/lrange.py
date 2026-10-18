"""lrange.py LISTING START END: print listing lines whose address lies in [START,END] (hex)."""
import sys
a=int(sys.argv[2],16); b=int(sys.argv[3],16)
for l in open(sys.argv[1]):
    try: x=int(l[:5],16)
    except ValueError: continue
    if a<=x<=b: print(l.rstrip()[:130])
