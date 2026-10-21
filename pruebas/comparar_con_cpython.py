"""Compara el intérprete de Python del entrenador (JavaScript) con CPython real.

Requiere haber pulsado los botones en pruebas.html (con servidor_pruebas.py en marcha) para generar:
    pruebas/salida/resultados_py.json    <- botón «Intérprete de Python»
    pruebas/salida/banco_exportar.json   <- botón «Banco completo»
    pruebas/salida/avl_casos.json        <- botón «Árboles AVL vs CPython»

Uso:   python pruebas/comparar_con_cpython.py
"""
import contextlib
import io
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SAL = os.path.join(AQUI, 'salida')
sys.setrecursionlimit(5000)
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')   # consolas de Windows (cp1252)
except Exception:
    pass


def cargar(nombre):
    ruta = os.path.join(SAL, nombre)
    if not os.path.exists(ruta):
        print('  (falta %s: se omite)' % nombre)
        return None
    with open(ruta, encoding='utf-8') as f:
        return json.load(f)


# ---------------------------------------------------------------- 1. fragmentos de Python
def comparar_fragmentos():
    print('1) Fragmentos de Python (58) contra CPython')
    res = cargar('resultados_py.json')
    if res is None:
        return 0
    src = open(os.path.join(AQUI, 'snippets.js'), encoding='utf-8').read()
    snips = re.findall(r'String\.raw`(.*?)`', src, re.S)
    mal = 0
    for i, code in enumerate(snips):
        buf = io.StringIO()
        err = None
        with contextlib.redirect_stdout(buf):
            try:
                exec(compile(code, '<s>', 'exec'), {'__name__': '__main__'})
            except BaseException as e:
                err = type(e).__name__
        if buf.getvalue() != res[i]['stdout'] or err != res[i]['err']:
            mal += 1
            print('  DIFERENCIA en fragmento', i, '\n   CPython:', repr(buf.getvalue()), err, '\n   Entrenador:', repr(res[i]['stdout']), res[i]['err'])
    print('  %d fragmentos, %d diferencias' % (len(snips), mal))
    return mal


# ---------------------------------------------------------------- 2. banco de preguntas
def tipo(x):
    return 'num' if isinstance(x, (int, float)) and not isinstance(x, bool) else type(x).__name__


def comparar_banco():
    print('2) Código del banco de preguntas contra CPython')
    datos = cargar('banco_exportar.json')
    if datos is None:
        return 0
    mal = 0
    n = {'codigo': 0, 'salida': 0}
    ineficientes = []   # ejercicios cuya fuerza bruta es correcta en CPython pero el entrenador la rechaza por lenta (límite de pasos)
    for it in datos:
        if it['tipo'] == 'codigo':
            n['codigo'] += 1
            ns = {}
            try:
                exec(it.get('prelude') or '', ns)
                exec(it['solucion'], ns)
            except Exception as e:
                print('  ERR carga de la solución', it['id'], it['seed'], repr(e)); mal += 1; continue
            for t in it['tests']:
                try:
                    obtenido = eval(t['e'], ns)
                    esperado = eval(t['r'], ns)
                except BaseException as e:
                    print('  ERR prueba', it['id'], it['seed'], t['e'], repr(e)); mal += 1; continue
                if obtenido != esperado or tipo(obtenido) != tipo(esperado):
                    print('  DIF', it['id'], it['seed'], t['e'], 'CPython:', repr(obtenido), 'esperado:', repr(esperado)); mal += 1
            if it['starter']:
                ns2 = {}
                try:
                    exec(it.get('prelude') or '', ns2)
                    exec(it['starter'], ns2)
                    todo = True
                    for t in it['tests']:
                        try:
                            if not (eval(t['e'], ns2) == eval(t['r'], ns2)):
                                todo = False
                        except BaseException:
                            todo = False
                    if todo:
                        ineficientes.append(it['id'])
                except BaseException:
                    pass
        elif it['tipo'] == 'salida':
            n['salida'] += 1
            buf = io.StringIO()
            try:
                with contextlib.redirect_stdout(buf):
                    exec(it['codigo'], {'__name__': '__main__'})
            except BaseException as e:
                print('  ERR salida', it['id'], it['seed'], repr(e)); mal += 1; continue
            if buf.getvalue().rstrip('\n') != it['esperado']:
                print('  DIF salida', it['id'], it['seed'], repr(buf.getvalue()), repr(it['esperado'])); mal += 1
    print('  verificados:', n, '| diferencias:', mal)
    if ineficientes:
        print('  Nota: en estos ejercicios el código inicial es correcto en CPython pero lento (el entrenador lo rechaza por eficiencia):', sorted(set(ineficientes)))
    return mal


# ---------------------------------------------------------------- 3. AVL (inserción y eliminación)
class N:
    def __init__(s, v):
        s.v = v; s.l = None; s.r = None; s.h = 0


def h(n): return -1 if n is None else n.h
def upd(n): n.h = 1 + max(h(n.l), h(n.r))
def bal(n): return h(n.l) - h(n.r)


def rotR(y):
    x = y.l; y.l = x.r; x.r = y; upd(y); upd(x); return x


def rotL(x):
    y = x.r; x.r = y.l; y.l = x; upd(x); upd(y); return y


def rebalance(n):
    upd(n); b = bal(n)
    if b > 1:
        if bal(n.l) < 0: n.l = rotL(n.l)
        return rotR(n)
    if b < -1:
        if bal(n.r) > 0: n.r = rotR(n.r)
        return rotL(n)
    return n


def ins(n, v):
    if n is None: return N(v)
    if v < n.v: n.l = ins(n.l, v)
    elif v > n.v: n.r = ins(n.r, v)
    else: return n
    return rebalance(n)


def dele(n, v):
    if n is None: return None
    if v < n.v: n.l = dele(n.l, v)
    elif v > n.v: n.r = dele(n.r, v)
    else:
        if n.l is None: return n.r
        if n.r is None: return n.l
        s = n.r
        while s.l is not None: s = s.l
        n.v = s.v; n.r = dele(n.r, s.v)
    return rebalance(n)


def nota(n):
    if n is None: return '_'
    sub = lambda x: '' if x is None else nota(x)
    if n.l is None and n.r is None: return str(n.v)
    return str(n.v) + '(' + sub(n.l) + ',' + sub(n.r) + ')'


def comparar_avl():
    print('3) Motor de árboles AVL (inserción y eliminación) contra una implementación estándar')
    casos = cargar('avl_casos.json')
    if casos is None:
        return 0
    mal = 0
    for c in casos:
        r = None
        for v in c['vals']: r = ins(r, v)
        if nota(r) != c['ins']:
            mal += 1; print('  INS', c['vals'], nota(r), c['ins'])
        if nota(dele(r, c['x'])) != c['del']:
            mal += 1; print('  DEL', c['vals'], c['x'])
    print('  %d casos, %d diferencias' % (len(casos), mal))
    return mal


if __name__ == '__main__':
    total = comparar_fragmentos() + comparar_banco() + comparar_avl()
    print('\nRESULTADO:', 'todo coincide ✔' if total == 0 else '%d diferencias' % total)
