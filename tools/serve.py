"""serve.py: static HTTP server for game/ (ES modules and fetch() do not work from file:// in Chrome).

Usage: python -I tools/serve.py [port]   (default 8088) -> http://localhost:8088/index.html?demo=1
"""
import functools, http.server, os, sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'game')


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript', '.json': 'application/json'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8088
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=ROOT))
    print(f'serving {ROOT} at http://localhost:{port}/')
    srv.serve_forever()
