"""bas2js.py — retired (BYOC B3 step 1, lane byoc-b3): the three generators game/modules/{space,inside,starport}/bas2js.py
were merged into tools/byoc/bas2js.py (per-module options in game/byoc/modules.json; output byte-identical, checked by
tools/byoc/rebuild_all.py). This stub keeps the old command working: python game/modules/inside/bas2js.py [MOD] (default INSIDE)."""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.exit(subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'byoc', 'bas2js.py'), sys.argv[1] if len(sys.argv) > 1 else 'INSIDE']))
