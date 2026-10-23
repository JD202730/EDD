"""Compara con CPython el código de referencia de la Biblioteca.

Uso (después de pulsar «Biblioteca» en pruebas.html, que guarda pruebas/salida/biblioteca_codigo.json):
    python pruebas/comparar_biblioteca.py

Cada bloque de código se ejecuta con CPython real; su salida debe ser igual a la que declara la biblioteca («esperado»)
y a la que produjo el intérprete del entrenador.
"""
import json
import os
import subprocess
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
ARCHIVO = os.path.join(AQUI, 'salida', 'biblioteca_codigo.json')


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    with open(ARCHIVO, encoding='utf-8') as f:
        bloques = json.load(f)
    malos = 0
    for b in bloques:
        env = dict(os.environ, PYTHONIOENCODING='utf-8')
        r = subprocess.run([sys.executable, '-I', '-X', 'utf8', '-c', b['src']], capture_output=True, text=True, encoding='utf-8', timeout=60, env=env)
        real = r.stdout.rstrip()
        esperado = (b.get('esperado') or '').rstrip()
        propio = b.get('stdout', '').rstrip()
        if r.returncode != 0:
            malos += 1
            print('✘ %s#%s: CPython falla:\n%s' % (b['id'], b['i'], r.stderr.strip()[-400:]))
        elif real != esperado:
            malos += 1
            print('✘ %s#%s: CPython imprime algo distinto de «esperado»\n  CPython : %r\n  esperado: %r' % (b['id'], b['i'], real[:200], esperado[:200]))
        elif real != propio:
            malos += 1
            print('✘ %s#%s: el intérprete del entrenador difiere de CPython\n  CPython  : %r\n  entrenador: %r' % (b['id'], b['i'], real[:200], propio[:200]))
    print('Bloques comparados: %d | diferencias: %d' % (len(bloques), malos))
    sys.exit(1 if malos else 0)


if __name__ == '__main__':
    main()
