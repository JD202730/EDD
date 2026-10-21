"""Servidor local de pruebas: sirve el proyecto y guarda en pruebas/salida/ los JSON que envía pruebas.html.

Uso (desde la carpeta del proyecto):
    python pruebas/servidor_pruebas.py            # puerto 8765
    python pruebas/servidor_pruebas.py 9000       # otro puerto
Luego abre http://127.0.0.1:8765/pruebas.html y pulsa los botones.
"""
import http.server
import os
import socketserver
import sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SALIDA = os.path.join(os.path.dirname(__file__), 'salida')
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
os.makedirs(SALIDA, exist_ok=True)


class Manejador(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RAIZ, **k)

    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        cuerpo = self.rfile.read(n)
        nombre = self.path.strip('/').replace('/', '_') or 'post'
        with open(os.path.join(SALIDA, nombre + '.json'), 'wb') as f:
            f.write(cuerpo)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'ok')

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('127.0.0.1', PUERTO), Manejador) as s:
    print('Sirviendo %s en http://127.0.0.1:%d  (Ctrl+C para salir)' % (RAIZ, PUERTO))
    try:
        s.serve_forever()
    except KeyboardInterrupt:
        pass
