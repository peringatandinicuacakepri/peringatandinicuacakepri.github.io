"""Server pratinjau + unduhan satu file.
GET /            -> index.html inline (pratinjau aplikasi live)
GET /unduh       -> index.html sebagai lampiran (unduhan)
GET /download    -> alias /unduh
Jalankan: python3 tests/download_server.py   (port 8080)"""
import http.server, socketserver, os

HERE = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(HERE, '..', 'index.html')

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        route = self.path.split('?')[0]
        if route in ('/download', '/unduh'):
            with open(TARGET, 'rb') as f:
                body = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Disposition', 'attachment; filename="index.html"')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(body)
        elif route in ('/', '/index.html'):
            with open(TARGET, 'rb') as f:
                body = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write('Gunakan jalur / atau /unduh'.encode('utf-8'))

    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
socketserver.TCPServer(('0.0.0.0', 8080), H).serve_forever()
