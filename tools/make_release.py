import os, re, subprocess, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = ('tools/serve.py', 'tools/serve.ps1', 'tools/make_release.py', 'tools/launcher.c', 'tools/launcher.rc', 'tools/launcher.manifest', 'README.md', 'CHANGELOG.md', 'LICENSE', 'LICENSE-DOCS', 'LICENSE-MIT', 'Play Star Command.cmd', 'Play Star Command (Veteran Crew).cmd', 'recomplauncher.json')


def launcher(version):
    out = ROOT / 'dist' / 'build'
    out.mkdir(parents=True, exist_ok=True)
    vc = Path(os.environ.get('ProgramFiles(x86)', 'C:/Program Files (x86)')) / 'Microsoft Visual Studio/2022/BuildTools/VC/Auxiliary/Build/vcvars64.bat'
    exe = out / 'StarCommand.exe'
    batch = out / 'compile.cmd'
    n = (re.findall(r'\d+', version) + ['0'] * 4)[:4]
    (out / 'version.h').write_text(f'#define VER_N {",".join(n)}\n#define VER_S "{version}"\n')
    batch.write_text('\n'.join(['@echo off', f'call "{vc}" >nul', 'if errorlevel 1 exit /b 1', f'rc /nologo /i "{out}" /i "{ROOT / "tools"}" /fo "{out / "launcher.res"}" "{ROOT / "tools/launcher.rc"}" || exit /b 1', f'cl /nologo /O2 /MT "{ROOT / "tools/launcher.c"}" "{out / "launcher.res"}" /Fo:"{out / "launcher.obj"}" /Fe:"{exe}" /link /Brepro /SUBSYSTEM:WINDOWS /NODEFAULTLIB:libucrt.lib ucrt.lib', 'exit /b %errorlevel%', '']))
    r = subprocess.run(['cmd', '/c', str(batch)], cwd=out, capture_output=True, text=True)
    if r.returncode or not exe.is_file():
        raise RuntimeError('launcher compilation failed: ' + r.stdout + r.stderr)
    return exe.read_bytes()


def build(version):
    if not re.fullmatch(r'[0-9][A-Za-z0-9._-]*', version):
        raise ValueError('invalid release version')
    files = sorted([p.relative_to(ROOT).as_posix() for p in (ROOT / 'game').rglob('*') if p.is_file()] + list(FILES))
    out = ROOT / 'dist' / f'star-command-remake-{version}-windows-x64.zip'
    out.parent.mkdir(exist_ok=True)
    exe = launcher(version)
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in files:
            p = ROOT / name
            if p.is_symlink() or not p.resolve().is_relative_to(ROOT):
                raise ValueError(f'file outside release: {name}')
            info = zipfile.ZipInfo('star-command-remake/' + name, (1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            z.writestr(info, p.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
            if name == 'recomplauncher.json':
                info = zipfile.ZipInfo('star-command-remake/StarCommand.exe', (1980, 1, 1, 0, 0, 0))
                info.create_system = 3
                info.external_attr = 0o100755 << 16
                z.writestr(info, exe, compress_type=zipfile.ZIP_DEFLATED, compresslevel=9)
    return out


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('usage: python tools/make_release.py VERSION')
    print(build(sys.argv[1]).name)
