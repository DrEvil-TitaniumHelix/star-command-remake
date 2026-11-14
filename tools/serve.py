import argparse, functools, hashlib, http.server, io, json, os, secrets, shutil, subprocess, sys, threading, zipfile
from pathlib import Path

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'game')


def fail(code, message):
    if os.name == 'nt' and os.environ.get('SC_QUIET') != '1' and '--no-browser' not in sys.argv:
        import ctypes
        ctypes.windll.user32.MessageBoxW(None, message, 'Star Command', 0x10)
    else:
        print(message, file=sys.stderr)
    sys.exit(code)


class Parser(argparse.ArgumentParser):
    def error(self, message):
        fail(10, 'Invalid launch arguments: ' + message)


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.json': 'application/json'}

    def do_GET(self):
        if self.path.startswith('/byoc-source/'):
            if self.path != getattr(self.server, 'source_path', None):
                self.send_error(404)
                return
            try:
                data = source_zip(self.server.source_folder)
            except OSError:
                self.send_error(503, 'The selected folder is unavailable. Choose a locally available copy, or play the imported copy.')
                return
            self.send_response(200)
            self.send_header('Content-Type', 'application/zip')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Referrer-Policy', 'no-referrer')
        super().end_headers()


def source_zip(folder):
    root = Path(folder).resolve()
    names = {f['name'] for f in json.loads((Path(ROOT) / 'byoc/import/manifest.json').read_text())['list']}
    data = io.BytesIO()
    with zipfile.ZipFile(data, 'w') as z:
        for p in sorted(root.iterdir()):
            if p.name.upper() in names and p.is_file() and p.resolve().is_relative_to(root):
                z.writestr(p.name.upper(), p.read_bytes())
    return data.getvalue()


def launch(mode='--launch', port=None, no_browser=False, test_timeout=None):
    if os.name == 'nt':
        return subprocess.call(['powershell.exe', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', str(Path(ROOT).parent / 'tools/serve.ps1'), mode] + (['--no-browser', str(port)] if no_browser else []) + (['--test-timeout', str(test_timeout)] if test_timeout is not None else []))
    folder = os.environ.get('SC_GAME', '')
    profile = Path(ROOT).parent / 'recomp-profile'
    profile.mkdir(exist_ok=True)
    choice_file = profile / 'browser'
    choice = os.environ.get('SC_BROWSER') or (choice_file.read_text().strip() if choice_file.exists() else '')
    if choice not in ('', 'edge', 'chrome'):
        raise ValueError('Choose edge or chrome with SC_BROWSER.')
    names = [choice] if choice else ['chrome', 'edge']
    browsers = {'chrome': ('google-chrome', 'chromium', 'chromium-browser', 'chrome'), 'edge': ('microsoft-edge', 'msedge')}
    browser = next(((name, exe) for name in names for command in browsers[name] if (exe := shutil.which(command))), None)
    if not no_browser and not browser:
        raise ValueError('The browser used for this game is unavailable. Repair it to keep using the same saved game.')
    token = secrets.token_urlsafe(32) if folder else ''
    port_file = profile / 'port'
    port = int(port_file.read_text()) if port_file.exists() else port if no_browser and port is not None else 8089
    try:
        srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=ROOT))
    except OSError as e:
        raise ValueError('The saved game address is in use. Close the other session, then press Play again.') from e
    port = srv.server_port
    port_file.write_text(str(port))
    srv.source_path = '/byoc-source/' + token
    srv.source_folder = folder
    thread = threading.Thread(target=srv.serve_forever, daemon=True)
    thread.start()
    url = f'http://127.0.0.1:{port}/byoc/import/index.html?launch=1'
    if token:
        url += '&source=' + token + '&copy=' + hashlib.sha256(str(Path(folder).resolve()).encode()).hexdigest()
    try:
        if no_browser:
            thread.join(test_timeout)
            return 0
        if not os.environ.get('SC_BROWSER'):
            choice_file.write_text(browser[0])
        return subprocess.call([browser[1], '--user-data-dir=' + str(profile), '--no-first-run', '--no-default-browser-check', '--disable-background-mode', '--app=' + url, '--window-size=1296,840'])
    finally:
        srv.shutdown()
        srv.server_close()
        thread.join()


if __name__ == '__main__':
    parser = Parser()
    parser.add_argument('port', type=int, nargs='?', default=8088)
    parser.add_argument('--launch', action='store_true')
    parser.add_argument('--play', action='store_true')
    parser.add_argument('--veteran', action='store_true')
    parser.add_argument('--no-browser', action='store_true')
    parser.add_argument('--test-timeout', type=int)
    args = parser.parse_args()
    if args.launch or args.play or args.veteran:
        try:
            sys.exit(launch('--launch' if args.launch else '--veteran' if args.veteran else '--play', args.port, args.no_browser, args.test_timeout))
        except (OSError, ValueError) as e:
            fail(20 if os.name == 'nt' else 1, 'Could not start the launcher: ' + str(e))
    else:
        srv = http.server.ThreadingHTTPServer(('127.0.0.1', args.port), functools.partial(Handler, directory=ROOT))
        print(f'serving {ROOT} at http://localhost:{args.port}/')
        srv.serve_forever()
