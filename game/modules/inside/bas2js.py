import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.exit(subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'byoc', 'bas2js.py'), sys.argv[1] if len(sys.argv) > 1 else 'INSIDE']))
