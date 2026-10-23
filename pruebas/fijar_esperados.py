"""Herramienta de autoría: rellena los marcadores «@@id#n» de `esperado` con la salida real de CPython.

En un archivo js/teoria_*.js se escribe  esperado: '@@rn-def#0'  (id del tema y número de bloque de código); luego se
pulsa «Biblioteca» en pruebas.html (guarda pruebas/salida/biblioteca_codigo.json) y se ejecuta:

    python pruebas/fijar_esperados.py

El script ejecuta cada bloque marcado con CPython y sustituye el marcador por su salida. Revisa el resultado (git diff / lectura):
la prueba comparar_biblioteca.py sigue comparando después el intérprete del entrenador con CPython.
"""
import glob
import json
import os
import re
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..'))


def js_cadena(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n') + "'"


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    with open(os.path.join(AQUI, 'salida', 'biblioteca_codigo.json'), encoding='utf-8') as f:
        bloques = {'%s#%s' % (b['id'], b['i']): b for b in json.load(f)}
    env = dict(os.environ, PYTHONIOENCODING='utf-8')
    hechos = 0
    for ruta in glob.glob(os.path.join(RAIZ, 'js', 'teoria_*.js')):
        with open(ruta, encoding='utf-8') as f:
            texto = f.read()

        def sustituir(m):
            nonlocal hechos
            clave = m.group(1)
            b = bloques.get(clave)
            if b is None:
                print('sin bloque exportado para', clave, '(¿corriste la prueba de la Biblioteca?)')
                return m.group(0)
            r = subprocess.run([sys.executable, '-I', '-X', 'utf8', '-c', b['src']], capture_output=True, text=True, encoding='utf-8', timeout=120, env=env)
            if r.returncode != 0:
                print('CPython falla en', clave, '\n', r.stderr[-300:])
                return m.group(0)
            hechos += 1
            return js_cadena(r.stdout.rstrip())

        nuevo = re.sub(r"'@@([a-z0-9-]+#\d+)'", sustituir, texto)
        if nuevo != texto:
            with open(ruta, 'w', encoding='utf-8', newline='') as f:
                f.write(nuevo)
    print('marcadores sustituidos:', hechos)


if __name__ == '__main__':
    main()
