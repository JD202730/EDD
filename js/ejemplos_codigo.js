/* ejemplos_codigo.js — programas de ejemplo para el depurador «Código ↔ Árbol».
   Son código Python REAL (el de las diapositivas, ampliado con árboles de más de 12 nodos): se ejecutan con el intérprete y el
   árbol que se ve es el que construye ese código, no una animación predefinida. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U;
  const cod = s => U.dedent(s);
  const EJ = ET.Ejemplos = { lista: [], porId: {} };
  const add = e => { EJ.lista.push(e); EJ.porId[e.id] = e; };

  const BST_BASE = String.raw`
    class NodoArbol:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None

    def insertar(nodo, v):
        if nodo is None:
            return NodoArbol(v)          # se cuelga aquí como hoja
        if v < nodo.valor:
            nodo.izq = insertar(nodo.izq, v)
        elif v > nodo.valor:
            nodo.der = insertar(nodo.der, v)
        return nodo                      # si v == nodo.valor: ya existe, no se duplica
  `;

  add({
    id: 'bst-insertar', grupo: 'BST', titulo: 'BST: insertar 22 valores', tema: 'bs-insertar',
    desc: 'La inserción de las diapositivas (S6-C2, d.8). Observa cómo cada llamada baja por un solo camino y cuelga la hoja con la asignación nodo.izq / nodo.der.',
    codigo: cod(BST_BASE + String.raw`
    raiz = None
    for v in [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 5, 15, 28, 38, 48, 58, 68]:
        raiz = insertar(raiz, v)         # siempre se reasigna la raíz

    def inorden(nodo, salida):
        if nodo is None:
            return
        inorden(nodo.izq, salida)
        salida.append(nodo.valor)
        inorden(nodo.der, salida)

    orden = []
    inorden(raiz, orden)
    print("inorden:", orden)
  `)
  });

  add({
    id: 'bst-buscar', grupo: 'BST', titulo: 'BST: búsqueda (camino raíz → hoja)', tema: 'bs-buscar',
    desc: 'La búsqueda de las diapositivas (S6-C2, d.6): cada comparación descarta un subárbol; el nodo resaltado es el que visita la llamada actual.',
    codigo: cod(BST_BASE + String.raw`
    def buscar(nodo, v):
        if nodo is None:
            return False                 # no está
        if v == nodo.valor:
            return True                  # encontrado
        if v < nodo.valor:
            return buscar(nodo.izq, v)   # está (si está) a la izquierda
        else:
            return buscar(nodo.der, v)   # está (si está) a la derecha

    raiz = None
    for v in [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 5, 15]:
        raiz = insertar(raiz, v)

    print(buscar(raiz, 45))    # True: 3 comparaciones
    print(buscar(raiz, 15))    # True: 4 niveles
    print(buscar(raiz, 63))    # False: llega a None
  `)
  });

  add({
    id: 'bst-eliminar', grupo: 'BST', titulo: 'BST: eliminar (0, 1 y 2 hijos)', tema: 'bs-eliminar',
    desc: 'La eliminación de las diapositivas (S6-C2, d.10-11): hoja, un hijo y dos hijos con el predecesor inorden (el mayor del subárbol izquierdo).',
    codigo: cod(BST_BASE + String.raw`
    def eliminar(nodo, v):
        if nodo is None:
            return None
        if v < nodo.valor:
            nodo.izq = eliminar(nodo.izq, v)
        elif v > nodo.valor:
            nodo.der = eliminar(nodo.der, v)
        else:                              # nodo a eliminar
            if nodo.izq is None:
                return nodo.der            # 0 o 1 hijo
            if nodo.der is None:
                return nodo.izq
            pred = nodo.izq                # 2 hijos: mayor del subárbol izquierdo
            while pred.der is not None:
                pred = pred.der
            nodo.valor = pred.valor
            nodo.izq = eliminar(nodo.izq, pred.valor)
        return nodo

    raiz = None
    for v in [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 5, 15]:
        raiz = insertar(raiz, v)

    raiz = eliminar(raiz, 5)     # hoja
    raiz = eliminar(raiz, 20)    # un hijo (el 25 sube... y el 10, 15 siguen)
    raiz = eliminar(raiz, 30)    # dos hijos: sube el predecesor
    raiz = eliminar(raiz, 50)    # la raíz con dos hijos
  `)
  });

  add({
    id: 'bst-verificar', grupo: 'BST', titulo: 'Verificar la propiedad del BST (13 nodos) y encontrar la violación', tema: 'bs-prop',
    desc: 'S6-C2 (d.5 y 16): la propiedad debe valer con TODO el subárbol, no solo con los hijos inmediatos. Se cuelga un 55 a la derecha del 45: cumple con su padre pero viola el límite 50. violacion() recorre pasando el intervalo permitido (lo, hi).',
    codigo: cod(BST_BASE + String.raw`
    raiz = None
    for v in [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 75, 90]:
        raiz = insertar(raiz, v)

    def violacion(n, lo, hi):
        if n is None:
            return None
        if (lo is not None and n.valor <= lo) or (hi is not None and n.valor >= hi):
            return (n.valor, lo, hi)             # este valor sale del intervalo permitido
        izq = violacion(n.izq, lo, n.valor)      # a la izquierda: el límite superior es el nodo
        if izq is not None:
            return izq
        return violacion(n.der, n.valor, hi)     # a la derecha: el límite inferior es el nodo

    print("antes:", violacion(raiz, None, None))

    nodo45 = raiz.izq.der.der                    # el 45
    nodo45.der = NodoArbol(55)                   # 55 > 45 (cumple con su padre) pero 55 > 50
    print("después:", violacion(raiz, None, None))
  `)
  });

  add({
    id: 'bst-degenerado', grupo: 'BST', titulo: 'BST degenerado: insertar 1…16 en orden', tema: 'bs-complejidad',
    desc: 'El orden de inserción importa (S6-C2, d.9 y 12): con datos ordenados el BST degenera en una lista de altura n−1 y todo cuesta O(n).',
    codigo: cod(BST_BASE + String.raw`
    def altura(nodo):
        if nodo is None:
            return -1
        return 1 + max(altura(nodo.izq), altura(nodo.der))

    raiz = None
    for v in range(1, 17):
        raiz = insertar(raiz, v)

    print("altura con datos ordenados:", altura(raiz))      # 15 = n - 1

    raiz2 = None
    for v in [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15, 16]:
        raiz2 = insertar(raiz2, v)
    print("altura con orden mezclado:", altura(raiz2))
  `)
  });

  add({
    id: 'recorridos', grupo: 'Árboles', titulo: 'Recorridos: preorden, inorden, postorden y por niveles', tema: 'tv-profundidad',
    desc: 'Los tres recorridos recursivos de S6-C1 (d.17) y el recorrido por niveles con cola. El nodo resaltado es el que visita la llamada; la salida se va llenando paso a paso.',
    codigo: cod(String.raw`
    class NodoArbol:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None

    raiz = NodoArbol(1)
    raiz.izq = NodoArbol(2)
    raiz.der = NodoArbol(3)
    raiz.izq.izq = NodoArbol(4)
    raiz.izq.der = NodoArbol(5)
    raiz.der.izq = NodoArbol(6)
    raiz.der.der = NodoArbol(7)
    raiz.izq.izq.izq = NodoArbol(8)
    raiz.izq.izq.der = NodoArbol(9)
    raiz.izq.der.izq = NodoArbol(10)
    raiz.der.der.der = NodoArbol(11)
    raiz.der.der.izq = NodoArbol(12)
    raiz.der.izq.der = NodoArbol(13)

    def preorden(nodo, salida):
        if nodo is None: return
        salida.append(nodo.valor)           # 1) raíz
        preorden(nodo.izq, salida)          # 2) izquierda
        preorden(nodo.der, salida)          # 3) derecha

    def inorden(nodo, salida):
        if nodo is None: return
        inorden(nodo.izq, salida)           # 1) izquierda
        salida.append(nodo.valor)           # 2) raíz
        inorden(nodo.der, salida)           # 3) derecha

    def postorden(nodo, salida):
        if nodo is None: return
        postorden(nodo.izq, salida)         # 1) izquierda
        postorden(nodo.der, salida)         # 2) derecha
        salida.append(nodo.valor)           # 3) raíz

    def por_niveles(raiz):
        cola = [raiz]
        res = []
        while cola:
            nodo = cola.pop(0)
            res.append(nodo.valor)
            if nodo.izq is not None: cola.append(nodo.izq)
            if nodo.der is not None: cola.append(nodo.der)
        return res

    s = []
    preorden(raiz, s)
    print("preorden :", s)
    s = []
    inorden(raiz, s)
    print("inorden  :", s)
    s = []
    postorden(raiz, s)
    print("postorden:", s)
    print("niveles  :", por_niveles(raiz))
  `)
  });

  add({
    id: 'ar-alturas', grupo: 'Árboles', titulo: 'Construir un árbol de 13 nodos y calcular profundidad y altura', tema: 'ar-vocab',
    desc: 'S6-C1 (d.7-9 y 12): el árbol se construye enganchando nodos con asignaciones; luego la función calcular() recorre en postorden, guarda la altura de cada nodo (se ve como «h») y muestra su profundidad. La altura del árbol es la de la raíz (aristas, no niveles).',
    codigo: cod(String.raw`
    class NodoArbol:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None
            self.altura = 0                # se calcula más abajo

    raiz = NodoArbol("A")
    raiz.izq = NodoArbol("B")
    raiz.der = NodoArbol("C")
    raiz.izq.izq = NodoArbol("D")
    raiz.izq.der = NodoArbol("E")
    raiz.der.der = NodoArbol("F")
    raiz.izq.izq.izq = NodoArbol("G")
    raiz.izq.izq.der = NodoArbol("H")
    raiz.der.der.izq = NodoArbol("I")
    raiz.der.der.der = NodoArbol("K")
    raiz.izq.der.izq = NodoArbol("L")
    raiz.izq.der.der = NodoArbol("M")
    raiz.izq.izq.izq.izq = NodoArbol("N")

    def calcular(n, profundidad):
        if n is None:
            return -1                      # árbol vacío: altura -1
        a = calcular(n.izq, profundidad + 1)
        b = calcular(n.der, profundidad + 1)
        n.altura = 1 + max(a, b)           # postorden: la altura necesita la de los hijos
        print(n.valor, "profundidad", profundidad, "altura", n.altura)
        return n.altura

    print("altura del árbol:", calcular(raiz, 0))
  `)
  });

  add({
    id: 'tv-reconstruir', grupo: 'Árboles', titulo: 'Reconstruir un árbol de 13 nodos desde preorden e inorden', tema: 'tv-reconstruir',
    desc: 'S6-C1 (d.19): la raíz es el primero del preorden; el inorden la parte en subárbol izquierdo y derecho. Cada llamada recursiva «pesca» una raíz y reparte los dos tramos; el árbol que ves es el que construye el código.',
    codigo: cod(String.raw`
    class NodoArbol:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None

    def construir(pre, ino):
        if not pre:
            return None
        raiz = NodoArbol(pre[0])                    # el primero del preorden es la raíz
        k = ino.index(pre[0])                       # la raíz separa el inorden
        raiz.izq = construir(pre[1:k + 1], ino[:k])
        raiz.der = construir(pre[k + 1:], ino[k + 1:])
        return raiz

    preorden = [1, 2, 4, 8, 9, 5, 10, 3, 6, 13, 7, 12, 11]
    inorden = [8, 4, 9, 2, 10, 5, 1, 6, 13, 3, 12, 7, 11]
    arbol = construir(preorden, inorden)

    def postorden(nodo, salida):
        if nodo is None:
            return
        postorden(nodo.izq, salida)
        postorden(nodo.der, salida)
        salida.append(nodo.valor)

    post = []
    postorden(arbol, post)
    print("postorden:", post)
  `)
  });

  add({
    id: 'tv-expresion', grupo: 'Árboles', titulo: 'Árbol de expresión de 15 nodos: evaluar en postorden', tema: 'tv-expresion',
    desc: 'S6-C1 (d.22): números en las hojas y operadores en los nodos internos. evaluar() es un postorden: calcula primero los dos subárboles y después aplica el operador. Observa cómo cada subárbol se resuelve antes que su padre.',
    codigo: cod(String.raw`
    class NodoArbol:
        def __init__(self, valor, izq=None, der=None):
            self.valor = valor
            self.izq = izq
            self.der = der

    N = NodoArbol
    # ((7 + 3) * (5 - 2)) + ((8 - 2) * (6 - 4))
    arbol = N("+",
              N("*", N("+", N(7), N(3)), N("-", N(5), N(2))),
              N("*", N("-", N(8), N(2)), N("-", N(6), N(4))))

    def evaluar(n):
        if n.izq is None and n.der is None:
            return n.valor                     # hoja: es un número
        a = evaluar(n.izq)                     # primero los hijos...
        b = evaluar(n.der)
        if n.valor == "+":                     # ...y después el operador
            return a + b
        if n.valor == "-":
            return a - b
        return a * b

    print("valor:", evaluar(arbol))            # (10 * 3) + (6 * 2) = 42
  `)
  });

  add({
    id: 'fib-llamadas', grupo: 'Recursión', titulo: 'Árbol de llamadas de fib(6)', tema: 'rec-ingenua',
    desc: 'La recursión ingenua de S5-C2 (d.7): el programa construye, con objetos reales, el árbol de llamadas de fib(6). Los subárboles repetidos son el desperdicio que arregla la memoización.',
    codigo: cod(String.raw`
    class Llamada:
        def __init__(self, n):
            self.valor = n
            self.izq = None
            self.der = None

    def fib(n):
        nodo = Llamada(n)                 # un nodo por cada llamada
        if n < 2:
            return nodo, n
        izq, a = fib(n - 1)
        der, b = fib(n - 2)
        nodo.izq = izq
        nodo.der = der
        return nodo, a + b

    arbol, resultado = fib(6)
    print("fib(6) =", resultado)
  `)
  });

  add({
    id: 'fib-memo', grupo: 'Recursión', titulo: 'Árbol de llamadas de fib(10) con memoización', tema: 'rec-memo',
    desc: 'La memoización de S5-C2 (d.8): el mismo árbol de llamadas, pero cuando n ya está en la caché la llamada es una hoja (no se recalcula). Con n = 10 hay 19 llamadas en vez de 177. El diccionario cache aparece en las variables.',
    codigo: cod(String.raw`
    class Llamada:
        def __init__(self, n):
            self.valor = n
            self.izq = None
            self.der = None

    cache = {}

    def fib(n):
        nodo = Llamada(n)                  # un nodo por cada llamada
        if n < 2:
            return nodo, n
        if n in cache:                     # ya calculado: O(1), sin llamadas hijas
            return nodo, cache[n]
        izq, a = fib(n - 1)
        der, b = fib(n - 2)
        nodo.izq = izq
        nodo.der = der
        cache[n] = a + b
        return nodo, cache[n]

    arbol, resultado = fib(10)
    print("fib(10) =", resultado)
    print("valores en la caché:", len(cache))
  `)
  });

  const AVL_BASE = String.raw`
    class Nodo:
        def __init__(self, v):
            self.v = v
            self.izq = None
            self.der = None
            self.altura = 0

    def alt(n):                        # altura (-1 si el nodo es None)
        return n.altura if n else -1

    def balance(n):                    # factor de equilibrio
        return alt(n.izq) - alt(n.der) if n else 0

    def actualizar(n):                 # recalcula la altura desde los hijos
        n.altura = 1 + max(alt(n.izq), alt(n.der))

    def rotar_derecha(y):              # corrige el caso Izq-Izq
        x = y.izq
        t = x.der
        x.der = y
        y.izq = t
        actualizar(y)
        actualizar(x)
        return x                       # x sube como nueva raíz local

    def rotar_izquierda(x):            # corrige el caso Der-Der
        y = x.der
        t = y.izq
        y.izq = x
        x.der = t
        actualizar(x)
        actualizar(y)
        return y

    def insertar(n, v):
        if n is None:
            return Nodo(v)
        if v < n.v:
            n.izq = insertar(n.izq, v)
        elif v > n.v:
            n.der = insertar(n.der, v)
        else:
            return n                   # sin duplicados
        actualizar(n)
        b = balance(n)
        if b > 1 and v < n.izq.v:      # Izq-Izq (recta)
            return rotar_derecha(n)
        if b < -1 and v > n.der.v:     # Der-Der (recta)
            return rotar_izquierda(n)
        if b > 1 and v > n.izq.v:      # Izq-Der (zigzag)
            n.izq = rotar_izquierda(n.izq)
            return rotar_derecha(n)
        if b < -1 and v < n.der.v:     # Der-Izq (zigzag)
            n.der = rotar_derecha(n.der)
            return rotar_izquierda(n)
        return n
  `;

  add({
    id: 'avl-insertar', grupo: 'AVL', titulo: 'AVL: insertar 10, 20, 30, 40, 50, 25 y más', tema: 'av-insercion',
    desc: 'El código de apoyo de S7-C1 (d.42-43), con el ejemplo completo de d.15-16 ampliado hasta 18 nodos. Cada nodo muestra h (altura guardada) y f (factor): en rojo cuando llega a ±2, justo antes de rotar.',
    codigo: cod(AVL_BASE + String.raw`
    raiz = None
    for v in [10, 20, 30, 40, 50, 25, 60, 70, 80, 65, 5, 3, 1, 90, 85, 95, 27, 26]:
        raiz = insertar(raiz, v)         # reasignar la raíz: una rotación puede cambiarla

    print("altura final:", alt(raiz), "· raíz:", raiz.v)
  `)
  });

  add({
    id: 'avl-cuatro-casos', grupo: 'AVL', titulo: 'AVL: los cuatro casos (LL, RR, LR, RL)', tema: 'av-casos',
    desc: 'S7-C1 (d.10-14): cuatro árboles pequeños, uno por caso. En línea recta basta una rotación; en zigzag, dos. Los cuatro terminan en 20(10,30).',
    codigo: cod(AVL_BASE + String.raw`
    def construir(valores):
        raiz = None
        for v in valores:
            raiz = insertar(raiz, v)
        return raiz

    LL = construir([30, 20, 10])       # Izq-Izq: 1 rotación derecha
    RR = construir([10, 20, 30])       # Der-Der: 1 rotación izquierda
    LR = construir([30, 10, 20])       # Izq-Der: izquierda del hijo y luego derecha
    RL = construir([10, 30, 20])       # Der-Izq: derecha del hijo y luego izquierda
    print(LL.v, RR.v, LR.v, RL.v)
  `)
  });

  add({
    id: 'avl-eliminar', grupo: 'AVL', titulo: 'AVL: eliminar y rebalancear', tema: 'av-eliminacion',
    desc: 'La eliminación de S7-C1 (d.19 y 44): se borra como en un BST (con el sucesor inorden) y se rebalancea por el camino; el caso se decide por el factor del hijo. Puede haber varias rotaciones.',
    codigo: cod(AVL_BASE + String.raw`
    def eliminar(n, v):
        if n is None:
            return None
        if v < n.v:
            n.izq = eliminar(n.izq, v)
        elif v > n.v:
            n.der = eliminar(n.der, v)
        else:                                  # nodo encontrado
            if n.izq is None:
                return n.der                   # 0 o 1 hijo
            if n.der is None:
                return n.izq
            suc = n.der                        # 2 hijos: sucesor inorden
            while suc.izq:
                suc = suc.izq
            n.v = suc.v
            n.der = eliminar(n.der, suc.v)
        actualizar(n)
        b = balance(n)                         # el caso depende del balance de los hijos
        if b > 1 and balance(n.izq) >= 0:
            return rotar_derecha(n)
        if b > 1 and balance(n.izq) < 0:
            n.izq = rotar_izquierda(n.izq)
            return rotar_derecha(n)
        if b < -1 and balance(n.der) <= 0:
            return rotar_izquierda(n)
        if b < -1 and balance(n.der) > 0:
            n.der = rotar_derecha(n.der)
            return rotar_izquierda(n)
        return n

    raiz = None
    for v in [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 65, 85, 5]:
        raiz = insertar(raiz, v)

    for v in [60, 65, 80, 70, 85]:             # los borrados del lado derecho desbalancean la raíz
        raiz = eliminar(raiz, v)
        print("tras eliminar", v, "→ raíz", raiz.v, "altura", alt(raiz))
  `)
  });

  add({
    id: 'rn-insertar', grupo: 'Rojo-negro', titulo: 'Rojo-negro: insertar con recoloreo y rotaciones', tema: 'rn-insercion',
    desc: 'Apoyo RN de S7-C1 (d.45-47) con las dos ramas (izquierda y derecha) escritas completas. Contenido complementario: las diapositivas dejan la rama espejo como «…». Los nodos se colorean con el atributo color (0 = rojo, 1 = negro, como en el código de clase).',
    codigo: cod(String.raw`
    ROJO, NEGRO = 0, 1

    class Nodo:
        def __init__(self, v, color=ROJO):
            self.v = v
            self.color = color
            self.izq = self.der = self.padre = None

    class ArbolRN:
        def __init__(self):
            self.nil = Nodo(None, NEGRO)          # centinela (siempre negro)
            self.raiz = self.nil

        def rotar_izq(self, x):
            y = x.der
            x.der = y.izq
            if y.izq is not self.nil:
                y.izq.padre = x
            y.padre = x.padre
            if x.padre is self.nil:
                self.raiz = y
            elif x is x.padre.izq:
                x.padre.izq = y
            else:
                x.padre.der = y
            y.izq = x
            x.padre = y

        def rotar_der(self, x):                   # el espejo de rotar_izq
            y = x.izq
            x.izq = y.der
            if y.der is not self.nil:
                y.der.padre = x
            y.padre = x.padre
            if x.padre is self.nil:
                self.raiz = y
            elif x is x.padre.der:
                x.padre.der = y
            else:
                x.padre.izq = y
            y.der = x
            x.padre = y

        def insertar(self, v):
            z = Nodo(v, ROJO)
            z.izq = z.der = self.nil
            y, x = self.nil, self.raiz
            while x is not self.nil:
                y = x
                if v == x.v:
                    return
                x = x.izq if v < x.v else x.der
            z.padre = y
            if y is self.nil:
                self.raiz = z
            elif v < y.v:
                y.izq = z
            else:
                y.der = z
            self.arreglar(z)

        def arreglar(self, z):                    # reparar dos rojos seguidos
            while z.padre.color == ROJO:
                if z.padre is z.padre.padre.izq:
                    t = z.padre.padre.der         # el otro hijo del abuelo
                    if t.color == ROJO:           # caso 3: recolorear y subir
                        z.padre.color = NEGRO
                        t.color = NEGRO
                        z.padre.padre.color = ROJO
                        z = z.padre.padre
                    else:
                        if z is z.padre.der:      # caso 1: zigzag -> alinear
                            z = z.padre
                            self.rotar_izq(z)
                        z.padre.color = NEGRO     # caso 2: recta
                        z.padre.padre.color = ROJO
                        self.rotar_der(z.padre.padre)
                else:                             # rama espejo
                    t = z.padre.padre.izq
                    if t.color == ROJO:
                        z.padre.color = NEGRO
                        t.color = NEGRO
                        z.padre.padre.color = ROJO
                        z = z.padre.padre
                    else:
                        if z is z.padre.izq:
                            z = z.padre
                            self.rotar_der(z)
                        z.padre.color = NEGRO
                        z.padre.padre.color = ROJO
                        self.rotar_izq(z.padre.padre)
            self.raiz.color = NEGRO               # la raíz siempre es negra

    arbol = ArbolRN()
    for v in [10, 20, 30, 40, 50, 25, 5, 3, 1, 45, 60, 70, 80, 90]:
        arbol.insertar(v)
    print("raíz:", arbol.raiz.v)
  `)
  });

  add({
    id: 'rn-eliminar', grupo: 'Rojo-negro', titulo: 'Rojo-negro: eliminar con el doble negro (los 4 casos)', tema: 'rn-eliminacion',
    desc: 'S7-C1 (d.28-32 y 48-49) con las ramas espejo completas (contenido complementario: la clase las deja como «…»). Se construyen 14 nodos y se eliminan cinco; arbol.casos dice qué caso de la clase se aplicó. Los nodos se colorean con el atributo color (0 = rojo, 1 = negro).',
    codigo: cod(String.raw`
    ROJO, NEGRO = 0, 1

    class Nodo:
        def __init__(self, v, color=ROJO):
            self.v = v
            self.color = color
            self.izq = self.der = self.padre = None

    class ArbolRN:
        def __init__(self):
            self.nil = Nodo(None, NEGRO)          # centinela (siempre negro)
            self.raiz = self.nil
            self.casos = []

        def rotar_izq(self, x):
            y = x.der
            x.der = y.izq
            if y.izq is not self.nil:
                y.izq.padre = x
            y.padre = x.padre
            if x.padre is self.nil:
                self.raiz = y
            elif x is x.padre.izq:
                x.padre.izq = y
            else:
                x.padre.der = y
            y.izq = x
            x.padre = y

        def rotar_der(self, x):
            y = x.izq
            x.izq = y.der
            if y.der is not self.nil:
                y.der.padre = x
            y.padre = x.padre
            if x.padre is self.nil:
                self.raiz = y
            elif x is x.padre.der:
                x.padre.der = y
            else:
                x.padre.izq = y
            y.der = x
            x.padre = y

        def insertar(self, v):
            z = Nodo(v, ROJO)
            z.izq = z.der = self.nil
            y, x = self.nil, self.raiz
            while x is not self.nil:
                y = x
                if v == x.v:
                    return
                x = x.izq if v < x.v else x.der
            z.padre = y
            if y is self.nil:
                self.raiz = z
            elif v < y.v:
                y.izq = z
            else:
                y.der = z
            self.arreglar_ins(z)

        def arreglar_ins(self, z):
            while z.padre.color == ROJO:
                if z.padre is z.padre.padre.izq:
                    t = z.padre.padre.der
                    if t.color == ROJO:
                        z.padre.color = NEGRO
                        t.color = NEGRO
                        z.padre.padre.color = ROJO
                        z = z.padre.padre
                    else:
                        if z is z.padre.der:
                            z = z.padre
                            self.rotar_izq(z)
                        z.padre.color = NEGRO
                        z.padre.padre.color = ROJO
                        self.rotar_der(z.padre.padre)
                else:
                    t = z.padre.padre.izq
                    if t.color == ROJO:
                        z.padre.color = NEGRO
                        t.color = NEGRO
                        z.padre.padre.color = ROJO
                        z = z.padre.padre
                    else:
                        if z is z.padre.izq:
                            z = z.padre
                            self.rotar_der(z)
                        z.padre.color = NEGRO
                        z.padre.padre.color = ROJO
                        self.rotar_izq(z.padre.padre)
            self.raiz.color = NEGRO

        def _trans(self, u, v):                   # pone el subárbol v donde estaba u
            if u.padre is self.nil:
                self.raiz = v
            elif u is u.padre.izq:
                u.padre.izq = v
            else:
                u.padre.der = v
            v.padre = u.padre

        def _min(self, x):
            while x.izq is not self.nil:
                x = x.izq
            return x

        def eliminar(self, v):
            z = self.raiz
            while z is not self.nil and z.v != v:
                z = z.izq if v < z.v else z.der
            if z is self.nil:
                return
            y = z
            yc = y.color
            if z.izq is self.nil:
                x = z.der
                self._trans(z, z.der)
            elif z.der is self.nil:
                x = z.izq
                self._trans(z, z.izq)
            else:                                 # 2 hijos: sucesor inorden
                y = self._min(z.der)
                yc = y.color
                x = y.der
                if y.padre is z:
                    x.padre = y
                else:
                    self._trans(y, y.der)
                    y.der = z.der
                    y.der.padre = y
                self._trans(z, y)
                y.izq = z.izq
                y.izq.padre = y
                y.color = z.color
            if yc == NEGRO:                       # se quitó un negro -> reparar el doble negro
                self.arreglar_del(x)

        def arreglar_del(self, x):
            while x is not self.raiz and x.color == NEGRO:
                if x is x.padre.izq:
                    w = x.padre.der               # hermano
                    if w.color == ROJO:           # caso 1: hermano rojo
                        self.casos.append(1)
                        w.color = NEGRO
                        x.padre.color = ROJO
                        self.rotar_izq(x.padre)
                        w = x.padre.der
                    if w.izq.color == NEGRO and w.der.color == NEGRO:    # caso 2: sobrinos negros
                        self.casos.append(2)
                        w.color = ROJO
                        x = x.padre
                    else:
                        if w.der.color == NEGRO:                         # caso 3: sobrino cercano rojo
                            self.casos.append(3)
                            w.izq.color = NEGRO
                            w.color = ROJO
                            self.rotar_der(w)
                            w = x.padre.der
                        self.casos.append(4)                             # caso 4: sobrino lejano rojo
                        w.color = x.padre.color
                        x.padre.color = NEGRO
                        w.der.color = NEGRO
                        self.rotar_izq(x.padre)
                        x = self.raiz
                else:                             # rama espejo
                    w = x.padre.izq
                    if w.color == ROJO:
                        self.casos.append(1)
                        w.color = NEGRO
                        x.padre.color = ROJO
                        self.rotar_der(x.padre)
                        w = x.padre.izq
                    if w.der.color == NEGRO and w.izq.color == NEGRO:
                        self.casos.append(2)
                        w.color = ROJO
                        x = x.padre
                    else:
                        if w.izq.color == NEGRO:
                            self.casos.append(3)
                            w.der.color = NEGRO
                            w.color = ROJO
                            self.rotar_izq(w)
                            w = x.padre.izq
                        self.casos.append(4)
                        w.color = x.padre.color
                        x.padre.color = NEGRO
                        w.izq.color = NEGRO
                        self.rotar_der(x.padre)
                        x = self.raiz
            x.color = NEGRO

    arbol = ArbolRN()
    for v in [10, 20, 30, 40, 50, 25, 5, 3, 1, 45, 60, 70, 80, 90]:
        arbol.insertar(v)

    for v in [1, 3, 5, 80, 20]:
        arbol.casos = []
        arbol.eliminar(v)
        print("eliminar", v, "-> casos aplicados:", arbol.casos, "| raíz:", arbol.raiz.v)
  `)
  });
})(typeof window !== 'undefined' ? window : globalThis);
