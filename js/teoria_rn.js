/* teoria_rn.js — Biblioteca: área Árboles rojo-negro (fuente: S7-C1, diap. 22-33 y código de apoyo 45-49).
   Contenido complementario: la clase deja las ramas espejo del código como «…»; aquí están escritas completas y verificadas. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  /* Código de apoyo RN de la clase (S7-C1, d.45-49) con las ramas espejo completas; «casos» y «rotaciones» son añadidos para estudiar. */
  const RN_BASE = R`
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
        self.casos = []                       # anota qué caso de la clase se aplicó (solo para estudiar)
        self.rotaciones = 0                   # cuenta las rotaciones

    def rotar_izq(self, x):
        self.rotaciones += 1
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
        self.rotaciones += 1
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
                return                         # sin duplicados
            x = x.izq if v < x.v else x.der
        z.padre = y
        if y is self.nil:
            self.raiz = z
        elif v < y.v:
            y.izq = z
        else:
            y.der = z
        self.arreglar_ins(z)

    def arreglar_ins(self, z):                 # reparar dos rojos seguidos
        while z.padre.color == ROJO:
            if z.padre is z.padre.padre.izq:
                t = z.padre.padre.der          # el otro hijo del abuelo
                if t.color == ROJO:            # caso 3: recolorear y subir
                    self.casos.append('caso 3 (tío rojo)')
                    z.padre.color = NEGRO
                    t.color = NEGRO
                    z.padre.padre.color = ROJO
                    z = z.padre.padre
                else:
                    if z is z.padre.der:       # caso 1: zigzag -> alinear
                        self.casos.append('caso 1 (zigzag)')
                        z = z.padre
                        self.rotar_izq(z)
                    self.casos.append('caso 2 (recta)')
                    z.padre.color = NEGRO      # caso 2: recta
                    z.padre.padre.color = ROJO
                    self.rotar_der(z.padre.padre)
            else:                              # rama espejo
                t = z.padre.padre.izq
                if t.color == ROJO:
                    self.casos.append('caso 3 (tío rojo)')
                    z.padre.color = NEGRO
                    t.color = NEGRO
                    z.padre.padre.color = ROJO
                    z = z.padre.padre
                else:
                    if z is z.padre.izq:
                        self.casos.append('caso 1 (zigzag)')
                        z = z.padre
                        self.rotar_der(z)
                    self.casos.append('caso 2 (recta)')
                    z.padre.color = NEGRO
                    z.padre.padre.color = ROJO
                    self.rotar_izq(z.padre.padre)
        self.raiz.color = NEGRO                # la raíz siempre es negra

    def _trans(self, u, v):                    # pone el subárbol v donde estaba u
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
        else:                                  # 2 hijos: sucesor inorden
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
        if yc == NEGRO:                        # se quitó un negro -> reparar
            self.arreglar_del(x)

    def arreglar_del(self, x):                 # x arrastra un "negro de más"
        while x is not self.raiz and x.color == NEGRO:
            if x is x.padre.izq:
                w = x.padre.der                # hermano
                if w.color == ROJO:            # caso 1
                    self.casos.append('caso 1 (hermano rojo)')
                    w.color = NEGRO
                    x.padre.color = ROJO
                    self.rotar_izq(x.padre)
                    w = x.padre.der
                if w.izq.color == NEGRO and w.der.color == NEGRO:     # caso 2
                    self.casos.append('caso 2 (hermano y sobrinos negros)')
                    w.color = ROJO
                    x = x.padre
                else:
                    if w.der.color == NEGRO:   # caso 3
                        self.casos.append('caso 3 (sobrino cercano rojo)')
                        w.izq.color = NEGRO
                        w.color = ROJO
                        self.rotar_der(w)
                        w = x.padre.der
                    self.casos.append('caso 4 (sobrino lejano rojo)')
                    w.color = x.padre.color    # caso 4 (termina)
                    x.padre.color = NEGRO
                    w.der.color = NEGRO
                    self.rotar_izq(x.padre)
                    x = self.raiz
            else:                              # rama espejo
                w = x.padre.izq
                if w.color == ROJO:
                    self.casos.append('caso 1 (hermano rojo)')
                    w.color = NEGRO
                    x.padre.color = ROJO
                    self.rotar_der(x.padre)
                    w = x.padre.izq
                if w.der.color == NEGRO and w.izq.color == NEGRO:
                    self.casos.append('caso 2 (hermano y sobrinos negros)')
                    w.color = ROJO
                    x = x.padre
                else:
                    if w.izq.color == NEGRO:
                        self.casos.append('caso 3 (sobrino cercano rojo)')
                        w.der.color = NEGRO
                        w.color = ROJO
                        self.rotar_izq(w)
                        w = x.padre.izq
                    self.casos.append('caso 4 (sobrino lejano rojo)')
                    w.color = x.padre.color
                    x.padre.color = NEGRO
                    w.izq.color = NEGRO
                    self.rotar_der(x.padre)
                    x = self.raiz
        x.color = NEGRO

    def nota(self, n=None, primero=True):      # notación anidada con color: 20n(10r,30r)
        if primero:
            n = self.raiz
        if n is self.nil:
            return "_"
        c = "r" if n.color == ROJO else "n"
        if n.izq is self.nil and n.der is self.nil:
            return str(n.v) + c
        sub = lambda x: "" if x is self.nil else self.nota(x, False)
        return str(n.v) + c + "(" + sub(n.izq) + "," + sub(n.der) + ")"

    def altura(self, n=None, primero=True):
        if primero:
            n = self.raiz
        if n is self.nil:
            return -1
        return 1 + max(self.altura(n.izq, False), self.altura(n.der, False))

    def verificar(self):                       # propiedades de la clase: (¿válido?, altura negra, errores)
        errores = []
        def bh(n):
            if n is self.nil:
                return 1                       # la hoja NIL cuenta como negra
            if n.color == ROJO and (n.izq.color == ROJO or n.der.color == ROJO):
                errores.append("dos rojos seguidos en " + str(n.v))
            a = bh(n.izq)
            b = bh(n.der)
            if a != b:
                errores.append("distinto número de negros bajo " + str(n.v))
            return max(a, b) + (1 if n.color == NEGRO else 0)
        if self.raiz.color != NEGRO:
            errores.append("la raíz es roja")
        h = bh(self.raiz)
        return len(errores) == 0, h, errores
`;
  B.codigo = B.codigo || {}; B.codigo.RN = RN_BASE;   // lo usan los ejercicios del banco (banco_biblioteca.js)

  /* AVL mínimo (S7-C1, d.42-43) con contador, para la comparación con el rojo-negro */
  const AVL_MIN = R`
rot_avl = [0]

class NodoAVL:
    def __init__(self, v):
        self.v = v
        self.izq = self.der = None
        self.altura = 0

def alt(n):
    return n.altura if n else -1

def balance(n):
    return alt(n.izq) - alt(n.der) if n else 0

def actualizar(n):
    n.altura = 1 + max(alt(n.izq), alt(n.der))

def rotar_derecha(y):
    rot_avl[0] += 1
    x = y.izq
    t = x.der
    x.der = y
    y.izq = t
    actualizar(y)
    actualizar(x)
    return x

def rotar_izquierda(x):
    rot_avl[0] += 1
    y = x.der
    t = y.izq
    y.izq = x
    x.der = t
    actualizar(x)
    actualizar(y)
    return y

def insertar_avl(n, v):
    if n is None:
        return NodoAVL(v)
    if v < n.v:
        n.izq = insertar_avl(n.izq, v)
    elif v > n.v:
        n.der = insertar_avl(n.der, v)
    else:
        return n
    actualizar(n)
    b = balance(n)
    if b > 1 and v < n.izq.v:
        return rotar_derecha(n)
    if b < -1 and v > n.der.v:
        return rotar_izquierda(n)
    if b > 1 and v > n.izq.v:
        n.izq = rotar_izquierda(n.izq)
        return rotar_derecha(n)
    if b < -1 and v < n.der.v:
        n.der = rotar_derecha(n.der)
        return rotar_izquierda(n)
    return n
`;

  B.tema({
    id: 'rn-def', area: 'rn', titulo: 'Árboles rojo-negro: reglas, altura negra y por qué quedan balanceados', fuente: 'S7-C1 · diap. 22-23, 33, 38', nivel: 7, comp: true,
    conceptos: ['rn_def'], interactivo: ['rn-insertar'], alias: 'rojinegro rojinegros red black',
    definicion: R`
Un **árbol rojo-negro** es **otro BST auto-balanceado**. Colorea los nodos de **rojo** o **negro** y mantiene reglas que garantizan altura **§O(log n)§**:

1. **cada nodo es rojo o negro**; la **raíz** y las **hojas (NIL)** son **negras**;
2. un **nodo rojo no puede tener hijos rojos** (no hay dos rojos seguidos);
3. **todo camino de un nodo a sus hojas tiene el mismo número de nodos negros**: es la **altura negra**.`,
    intuicion: R`
El color es una **marca de contabilidad** que obliga al árbol a repartirse: la regla 3 dice que todos los caminos «pagan» la misma cantidad de nodos negros, y la regla 2 dice que los nodos rojos no pueden ir seguidos, solo **intercalados** entre negros. Entonces el camino más largo (el que alterna negro-rojo-negro-rojo…) **no puede ser más del doble** que el más corto (todo negro).

Es un balance más **laxo** que el del AVL: permite que un lado sea hasta el doble de alto que el otro, pero a cambio necesita **menos reacomodos** (muchas correcciones se resuelven solo **cambiando colores**, que cuesta §O(1)§ y no toca punteros).`,
    formal: R`
**Reglas** (diapositiva 22):

| # | Regla |
|---|---|
| 1 | cada nodo es **rojo** o **negro** |
| 2 | la **raíz** es negra y las **hojas NIL** son negras |
| 3 | un **nodo rojo** no puede tener **hijos rojos** |
| 4 | todo camino de un nodo a sus hojas NIL tiene el **mismo número de nodos negros** (**altura negra**) |

**Por qué queda balanceado** (diapositiva 23):

- Las reglas obligan a que todo camino de la raíz a una hoja NIL tenga el mismo número de nodos negros: esa es la **altura negra**.
- Como **no hay dos rojos seguidos**, el camino más largo es **a lo sumo el doble del más corto**.
- Por eso la altura total es **§O(log n)§** y también lo son **buscar, insertar y eliminar**.

**Ejemplo de la clase:** §13(8(1,11),17(,25))§, donde **cada camino a NIL tiene 3 nodos negros (contando la hoja NIL)**: árbol válido. (La diapositiva muestra el árbol con colores; en el ejemplo de abajo se detalla una coloración válida.)

[comp]
**Cota de altura.** Sea §bh§ la altura negra de la raíz. Todo subárbol con altura negra §b§ tiene al menos §2ᵇ − 1§ nodos internos, luego §n ≥ 2^bh − 1§ ⇒ §bh ≤ log₂(n + 1)§. Como a lo sumo la mitad de los nodos de un camino son rojos, **§altura ≤ 2·log₂(n + 1)§**. El AVL, en cambio, tiene §altura < 1,44·log₂(n + 2)§: el rojo-negro puede ser hasta ≈ 1,4 veces más alto.
[/comp]`,
    procedimiento: R`
**Para decidir si un árbol coloreado es rojo-negro:**

1. **¿La raíz es negra?**
2. **¿Hay algún nodo rojo con un hijo rojo?** Si sí, no es válido.
3. **Cuenta los nodos negros de cada camino** de la raíz a cada NIL (**incluye la hoja NIL como un negro**, como en la clase): ¿todos los caminos dan el mismo número?
4. Si las tres comprobaciones pasan, es rojo-negro; la cuenta de negros es su **altura negra**.
5. **Un hijo ausente es una hoja NIL (negra).** Consecuencia útil: un nodo rojo siempre tiene **0 o 2 hijos reales** (con un solo hijo real —que debería ser negro— los dos caminos tendrían distinto número de negros).`,
    codigo: {
      titulo: 'Verificar las reglas rojo-negro en árboles armados a mano',
      src: R`
ROJO, NEGRO = 0, 1

class Nodo:
    def __init__(self, v, color):
        self.v = v
        self.color = color
        self.izq = None
        self.der = None

def N(v, color, izq=None, der=None):
    n = Nodo(v, color)
    n.izq = izq
    n.der = der
    return n

def verificar(raiz):
    errores = []
    def altura_negra(n):
        if n is None:
            return 1                           # la hoja NIL cuenta como un nodo negro
        if n.color == ROJO:
            for h in (n.izq, n.der):
                if h is not None and h.color == ROJO:
                    errores.append("dos rojos seguidos en " + str(n.v))
        a = altura_negra(n.izq)
        b = altura_negra(n.der)
        if a != b:
            errores.append("distinto número de negros bajo " + str(n.v))
        return max(a, b) + (1 if n.color == NEGRO else 0)
    if raiz.color != NEGRO:
        errores.append("la raíz es roja")
    bh = altura_negra(raiz)
    return len(errores) == 0, bh, errores

valido = N(13, NEGRO, N(8, ROJO, N(1, NEGRO), N(11, NEGRO)), N(17, NEGRO, None, N(25, ROJO)))
raiz_roja = N(13, ROJO, N(8, NEGRO), N(17, NEGRO))
dos_rojos = N(10, NEGRO, N(5, ROJO, N(2, ROJO), None), None)
negros_distintos = N(10, NEGRO, N(5, NEGRO), None)
for nombre, t in [("válido (clase)", valido), ("raíz roja", raiz_roja), ("dos rojos seguidos", dos_rojos), ("negros distintos", negros_distintos)]:
    print(nombre, "->", verificar(t))
`,
      esperado: 'válido (clase) -> (True, 3, [])\nraíz roja -> (False, 2, [\'la raíz es roja\'])\ndos rojos seguidos -> (False, 2, [\'dos rojos seguidos en 5\'])\nnegros distintos -> (False, 3, [\'distinto número de negros bajo 10\'])'
    },
    ejemplo: R`
**Árbol de la diapositiva 23** (una coloración válida):

~~~
            13 (negro)
          /            \
     8 (rojo)        17 (negro)
     /     \              \
 1 (negro) 11 (negro)      25 (rojo)
~~~

Caminos de la raíz a cada NIL (contando la hoja NIL como negra):

| Camino | Negros | Total |
|---|---|---|
| 13 → 8 → 1 → NIL | 13, 1, NIL | **3** |
| 13 → 8 → 11 → NIL | 13, 11, NIL | **3** |
| 13 → 17 → NIL (izquierda) | 13, 17, NIL | **3** |
| 13 → 17 → 25 → NIL | 13, 17, NIL | **3** |

**Altura negra = 3**; los rojos (8 y 25) tienen hijos negros ⇒ **árbol válido**.

**Árboles inválidos** (código): raíz roja; **dos rojos seguidos** (§5§ rojo con hijo rojo §2§); **distinto número de negros** (bajo §10§ un camino tiene un negro más que el otro).

**Camino más largo frente al más corto:** en el ejemplo, el camino más largo (§13 → 17 → 25 → NIL§) tiene 3 aristas y el más corto (§13 → 17 → NIL§) 2: nunca más del doble.

El ejemplo interactivo construye un árbol rojo-negro de 14 nodos con el código de la clase: los nodos se pintan de rojo o negro según su atributo §color§.`,
    complejidad: R`
- **Altura**: §O(log n)§; más precisamente §altura ≤ 2·log₂(n + 1)§ (el camino más largo es a lo sumo el doble del más corto).
- **Buscar, insertar y eliminar**: **§O(log n)§** (garantizado).
- **Espacio extra**: **un bit** por nodo (el color) — menos que el entero de altura del AVL — y, en la implementación de la clase, un puntero al padre.
- **Verificar las propiedades** (§verificar§): §O(n)§.
- **Justificación**: la regla 4 fuerza que haya muchos nodos por cada nivel negro (§n ≥ 2^bh − 1§), y la regla 3 limita los rojos a como mucho la mitad del camino.`,
    errores: R`
- **Olvidar que las hojas NIL son negras** al contar los negros de un camino.
- **Pensar que cada nodo rojo debe tener dos hijos**: lo único que prohíbe la regla 3 es que **un rojo tenga hijos rojos**.
- **Creer que rojo-negro significa «mitad rojos, mitad negros»**: no hay una proporción fija.
- **Aceptar una raíz roja**: la raíz **siempre** es negra.
- **Confundir altura negra con altura**: la altura negra solo cuenta los nodos negros del camino.
- **Pensar que rojo-negro es mejor que AVL en absoluto**: depende de si domina lectura o escritura ([[rn-vs-avl]]).`,
    preguntas: [
      ['Enumera las reglas de un árbol rojo-negro.', 'Cada nodo es rojo o negro; la raíz y las hojas (NIL) son negras; un nodo rojo no puede tener hijos rojos; todo camino de un nodo a sus hojas tiene el mismo número de nodos negros (altura negra).'],
      ['¿Por qué un rojo-negro queda balanceado (altura §O(log n)§)?', 'Porque todos los caminos tienen el mismo número de negros (altura negra) y no hay dos rojos seguidos; el camino más largo es a lo sumo el doble del más corto, así que la altura es §O(log n)§ y también lo son buscar, insertar y eliminar.'],
      ['¿Qué es la altura negra y cómo se cuenta?', 'El número de nodos negros en cualquier camino de un nodo a una hoja NIL (es el mismo para todos los caminos); en la clase se cuenta la hoja NIL como un negro.'],
      ['¿Un nodo rojo puede ser hijo de otro rojo? ¿Y la raíz puede ser roja?', 'No en ambos casos: un rojo no puede tener hijos rojos y la raíz siempre es negra.']
    ],
    resumen: R`
- **Reglas**: rojo/negro; raíz y NIL **negras**; **no dos rojos seguidos**; **misma altura negra** en todos los caminos.
- Camino más largo ≤ **2×** el más corto ⇒ altura **§O(log n)§** (§≤ 2·log₂(n+1)§).
- Buscar, insertar, eliminar: §O(log n)§. Costo extra: **1 bit** por nodo.
- Balance más **laxo** que el AVL: menos rotaciones, a cambio de un árbol algo más alto.
- NIL cuenta como negro.`
  });

  B.tema({
    id: 'rn-insercion', area: 'rn', titulo: 'Inserción en un rojo-negro: tres casos y el algoritmo de rebalanceo', fuente: 'S7-C1 · diap. 24-27, 45-47', nivel: 7, comp: true,
    conceptos: ['rn_ins'], interactivo: ['rn-insertar'], alias: 'rojinegro rojinegros',
    definicion: R`
**Punto de partida:** el nodo nuevo **§N§ entra rojo** (se inserta como en un BST). Si su **padre §P§ también es rojo**, hay que reparar. Según la posición de §N§ y el color del otro hijo de §Q§ (el **abuelo**) hay **3 casos** (los simétricos son el espejo):

- **Caso 1 (zigzag)**: §N§ es hijo **derecho** de §P§ (y §P§ hijo izquierdo de §Q§), y §Q§ no tiene hijo derecho. Se **rota §P§ a la izquierda**; el árbol sigue inválido y se pasa al **caso 2**.
- **Caso 2 (línea recta)**: §N§ y §P§ rojos; §P§ hijo izquierdo de §Q§ y §N§ hijo izquierdo de §P§; §Q§ no tiene hijo derecho. **Una rotación** sube §P§ a la raíz local; §P§ pasa a **negro** y §Q§ a **rojo**. **Termina.**
- **Caso 3 (el otro hijo de §Q§ es rojo)**: §Q§ sí tiene hijo derecho §T§ y es **rojo**. **Sin rotación**: §P§ y §T§ pasan a **negro** y §Q§ a **rojo**; se continúa desde §Q§. Si §Q§ es la raíz, se deja negra.`,
    intuicion: R`
Insertar un nodo **rojo** es la forma más barata de no romper la regla de la altura negra (un rojo no añade negros). El único problema posible es que su padre sea también rojo (**dos rojos seguidos**). Entonces miramos al **tío** (el otro hijo del abuelo):

- **Tío rojo** (caso 3): hay «demasiado rojo» alrededor; basta **recolorear** (padre y tío a negro, abuelo a rojo) y el problema **sube** al abuelo, que ahora es rojo y podría tener un padre rojo: se repite.
- **Tío negro** (casos 1 y 2): no hay forma de arreglarlo recoloreando; hace falta **rotar** para llevar un nodo rojo hacia arriba y dejar al abuelo (que baja) como hijo rojo de un negro. Si el nuevo está en **zigzag**, primero una rotación lo **alinea** (caso 1) y luego se aplica el caso 2.`,
    formal: R`
**Algoritmo de rebalanceo** (diapositiva 27). Entrada: el nuevo nodo §N§.

~~~
Mientras N no sea la raíz y el padre de N sea ROJO:
    P = padre de N;  Q = padre de P   (existen: P es rojo y la raíz siempre es negra)
    Si P es el hijo IZQUIERDO de Q:
        1. No existe Q->der y N es hijo derecho de P:  rotación izquierda de P;  N = P
        2. No existe Q->der y N es hijo izquierdo de P: Q → Rojo, P → Negro, rotación derecha de P (de Q)
        3. Existe Q->der y es Rojo:  Q->der y Q->izq → Negro, Q → Rojo;  N = Q
    Si P es el hijo DERECHO de Q:  (espejo)
        1. No existe Q->izq y N es hijo izquierdo de P: rotación derecha de P;  N = P
        2. No existe Q->izq y N es hijo derecho de P:   Q → Rojo, P → Negro, rotación izquierda
        3. Existe Q->izq y es Rojo:  Q->der y Q->izq → Negro, Q → Rojo;  N = Q
Al final: SIEMPRE se cambia el color del nodo raíz a Negro.
~~~

[comp]
**Sobre «no existe Q->der».** Las figuras de la clase dibujan el caso en que el tío es una hoja NIL. El **código de apoyo** (diapositivas 45-47) lo generaliza: usa el **color del tío** (§t.color == ROJO§ ⇒ caso 3; en otro caso, tío **negro**, que incluye tanto NIL como un nodo negro real ⇒ casos 1 y 2). Por eso la implementación con el centinela NIL negro es equivalente y cubre todos los casos.
[/comp]

**Resumen de acciones:**

| Caso | Tío | Acción | ¿Continúa? |
|---|---|---|---|
| 3 | **rojo** | recolorear (P y T negros, Q rojo) | sí, desde Q |
| 1 | negro, N en zigzag | rotar P y pasar al caso 2 | sí (caso 2) |
| 2 | negro, N en recta | recolorear (P negro, Q rojo) y rotar Q | **no** |

**Rotaciones:** a lo sumo **2** por inserción (una del caso 1 y una del caso 2); el caso 3 solo recolorea y puede repetirse §O(log n)§ veces subiendo por el árbol.`,
    procedimiento: R`
**Para insertar en un rojo-negro a mano:**

1. **Inserta §N§ como en un BST** y píntalo de **rojo**.
2. Si es la **raíz**, píntalo de **negro** y termina.
3. Si el **padre es negro**, **termina** (no se rompió ninguna regla).
4. Si el padre es **rojo**: identifica al **abuelo §Q§** y al **tío §T§**:
   - **§T§ rojo** → **caso 3**: P y T a negro, Q a rojo; repite con §N = Q§.
   - **§T§ negro** y §N§ en zigzag → **caso 1**: rota el padre para alinear; ahora aplica el caso 2.
   - **§T§ negro** y §N§ en línea recta → **caso 2**: P negro, Q rojo, rota Q hacia el lado contrario.
5. Al terminar, **pinta la raíz de negro**.
6. **Verifica** las reglas (sin dos rojos seguidos, misma altura negra).`,
    codigo: {
      titulo: 'Código de apoyo RN (S7-C1, d.45-47): los tres casos de inserción en acción',
      src: RN_BASE + R`
def insertar_y_mostrar(secuencia):
    arbol = ArbolRN()
    for v in secuencia:
        arbol.casos = []
        arbol.insertar(v)
        ok, bh, errores = arbol.verificar()
        print("inserto", v, "->", arbol.nota(), "| casos:", arbol.casos, "| válido:", ok, "| altura negra:", bh)

print("--- caso 3: tío rojo (recolorear)")
insertar_y_mostrar([10, 5, 15, 1])
print("--- caso 2: línea recta (rotar una vez)")
insertar_y_mostrar([10, 5, 1])
print("--- caso 1 + caso 2: zigzag")
insertar_y_mostrar([10, 5, 7])
print("--- la secuencia de la clase")
insertar_y_mostrar([10, 20, 30, 40, 50, 25])
`,
      esperado: '--- caso 3: tío rojo (recolorear)\ninserto 10 -> 10n | casos: [] | válido: True | altura negra: 2\ninserto 5 -> 10n(5r,) | casos: [] | válido: True | altura negra: 2\ninserto 15 -> 10n(5r,15r) | casos: [] | válido: True | altura negra: 2\ninserto 1 -> 10n(5n(1r,),15n) | casos: [\'caso 3 (tío rojo)\'] | válido: True | altura negra: 3\n--- caso 2: línea recta (rotar una vez)\ninserto 10 -> 10n | casos: [] | válido: True | altura negra: 2\ninserto 5 -> 10n(5r,) | casos: [] | válido: True | altura negra: 2\ninserto 1 -> 5n(1r,10r) | casos: [\'caso 2 (recta)\'] | válido: True | altura negra: 2\n--- caso 1 + caso 2: zigzag\ninserto 10 -> 10n | casos: [] | válido: True | altura negra: 2\ninserto 5 -> 10n(5r,) | casos: [] | válido: True | altura negra: 2\ninserto 7 -> 7n(5r,10r) | casos: [\'caso 1 (zigzag)\', \'caso 2 (recta)\'] | válido: True | altura negra: 2\n--- la secuencia de la clase\ninserto 10 -> 10n | casos: [] | válido: True | altura negra: 2\ninserto 20 -> 10n(,20r) | casos: [] | válido: True | altura negra: 2\ninserto 30 -> 20n(10r,30r) | casos: [\'caso 2 (recta)\'] | válido: True | altura negra: 2\ninserto 40 -> 20n(10n,30n(,40r)) | casos: [\'caso 3 (tío rojo)\'] | válido: True | altura negra: 3\ninserto 50 -> 20n(10n,40n(30r,50r)) | casos: [\'caso 2 (recta)\'] | válido: True | altura negra: 3\ninserto 25 -> 20n(10n,40r(30n(25r,),50n)) | casos: [\'caso 3 (tío rojo)\'] | válido: True | altura negra: 3'
    },
    ejemplo: R`
**Los tres casos con números** (el código imprime cada paso; §n§ = negro, §r§ = rojo):

- **Caso 3 (tío rojo):** insertar §10, 5, 15§ da §10n(5r,15r)§. Al insertar **1** (hijo de 5): padre §5§ rojo y tío §15§ rojo ⇒ **recolorear**: §5§ y §15§ a negro y §10§ a rojo; como §10§ es la raíz, se pinta de negro ⇒ **§10n(5n(1r,),15n)§**. Sin rotaciones. La altura negra subió de 2 a 3.
- **Caso 2 (recta):** §10, 5, 1§ ⇒ §1§ está en línea recta bajo §5§ y el tío es NIL (negro) ⇒ **una rotación** sube §5§: **§5n(1r,10r)§**.
- **Caso 1 → caso 2 (zigzag):** §10, 5, 7§ ⇒ §7§ es hijo **derecho** de §5§ (zigzag) ⇒ rotación izquierda de §5§ (alinea) y luego caso 2 ⇒ **§7n(5r,10r)§**.

**Secuencia §10, 20, 30, 40, 50, 25§:** (el árbol AVL de la clase para la misma secuencia terminaba en §30(20(10,25),40(,50))§; el rojo-negro, en cambio, termina en §20n(10n,40r(30n(25r,),50n))§.)

| Inserto | Resultado | Casos |
|---|---|---|
| 10 | §10n§ | — (raíz negra) |
| 20 | §10n(,20r)§ | — (padre negro) |
| 30 | §20n(10r,30r)§ | **caso 2** (línea recta) |
| 40 | §20n(10n,30n(,40r))§ | **caso 3** (tío rojo) |
| 50 | §20n(10n,40n(30r,50r))§ | **caso 2** |
| 25 | §20n(10n,40r(30n(25r,),50n))§ | **caso 3** |

**Ejemplo interactivo:** inserta 14 valores con este mismo código y colorea los nodos; avanza paso a paso y observa cómo un cambio de color o una rotación repara los «dos rojos seguidos».`,
    complejidad: R`
- **Inserción**: descenso §O(log n)§ + reparación. El **caso 3** se puede repetir subiendo por el árbol (**a lo sumo §O(log n)§ recoloreos**, cada uno §O(1)§); los **casos 1 y 2** terminan y usan **a lo sumo 2 rotaciones** (§O(1)§). Total: **§O(log n)§**.
- **Comparación con el AVL**: el AVL hace a lo sumo una corrección (simple o doble) tras subir por el camino; el rojo-negro hace **a lo sumo 2 rotaciones** y reduce muchas reparaciones a **recolorear** (sin tocar punteros).
- **Espacio**: §O(n)§ + un bit de color por nodo.
- **Justificación de que el caso 3 sube pero no se repite indefinidamente**: cada repetición sube dos niveles (de §N§ a su abuelo) y termina en la raíz como máximo: §O(log n)§ pasos.`,
    errores: R`
- **Insertar el nodo nuevo como negro**: rompería la altura negra de golpe; se inserta **rojo**.
- **Aplicar rotaciones cuando el tío es rojo** (es el caso 3: solo se recolorea).
- **Olvidar que en el zigzag hay que alinear primero** (caso 1) y después aplicar el caso 2.
- **Olvidar pintar la raíz de negro** al final (el caso 3 puede dejarla roja).
- **Recolorear mal en el caso 2**: el padre queda **negro** y el abuelo (que baja) **rojo**.
- **Olvidar los casos simétricos** (espejo) cuando el padre es hijo derecho.
- **Confundir este algoritmo con las rotaciones del AVL**: aquí el criterio es el **color del tío**, no el factor de balance.`,
    preguntas: [
      ['Describe los tres casos de inserción en un rojo-negro.', 'El nodo nuevo entra rojo; si el padre también es rojo: caso 1 (zigzag): rotar el padre para alinear y pasar al caso 2; caso 2 (recta): rotación, padre negro y abuelo rojo, termina; caso 3 (el otro hijo del abuelo —el tío— es rojo): recolorear padre y tío a negro y abuelo a rojo y continuar desde el abuelo. Al final la raíz se pinta de negro.'],
      ['¿Qué se hace al final de cualquier inserción?', 'Se cambia el color del nodo raíz a negro (siempre).'],
      ['Inserta §10, 5, 15, 1§ en un rojo-negro. ¿Qué caso ocurre y cuál es el árbol resultante?', 'Al insertar 1: padre 5 rojo y tío 15 rojo ⇒ caso 3 (recolorear): §10n(5n(1r,),15n)§, sin rotaciones.'],
      ['¿Cuántas rotaciones hace una inserción en un rojo-negro?', 'A lo sumo dos (una del caso 1 y una del caso 2); el caso 3 solo recolorea.']
    ],
    resumen: R`
- Nodo nuevo **rojo**; si el padre es rojo, mira al **tío**.
- **Tío rojo → caso 3**: recolorear (P y T negros, Q rojo) y seguir desde Q.
- **Tío negro**: zigzag → **caso 1** (rotar P) y luego **caso 2**; recta → **caso 2** (P negro, Q rojo, rotar Q) y termina.
- **Raíz siempre negra** al final.
- A lo sumo **2 rotaciones**; total §O(log n)§.`
  });

  B.tema({
    id: 'rn-eliminacion', area: 'rn', titulo: 'Eliminación en un rojo-negro: el doble negro y sus cuatro casos', fuente: 'S7-C1 · diap. 28-32, 48-49', nivel: 7, comp: true,
    conceptos: ['rn_del'], interactivo: ['rn-eliminar'], alias: 'rojinegro rojinegros doble negro',
    definicion: R`
**Idea.** Se borra como en un BST (si tiene dos hijos, se intercambia con su **sucesor** y se borra una hoja). **Borrar un nodo rojo no altera nada**; **borrar uno negro quita un negro de ese camino**: el hueco queda marcado como **doble negro**.

**Meta:** trasladar ese negro de más **hacia arriba** hasta que lo absorba un nodo **rojo** (que pasa a negro) o llegue a la **raíz**. Se resuelve con **4 casos** según el color del **hermano** y de sus hijos (los **sobrinos**). NIL cuenta como negro.`,
    intuicion: R`
Si quitas un nodo negro, todos los caminos que pasaban por él quedan con **un negro menos** que los del otro lado: la regla de la altura negra se rompió. Para recordarlo, ponemos una **marca de «doble negro»** en el hueco (como si el negro desaparecido se hubiera convertido en una deuda que hay que pagar).

Para pagarla hay dos estrategias: **pasar la deuda hacia arriba** (si el hermano puede «prestar» un negro volviéndose rojo) o **traer un negro desde el hermano** con una rotación y recolorear. Los 4 casos son los 4 estados posibles del hermano y sus hijos.`,
    formal: R`
Sea §D§ el nodo con el negro de más («doble negro»), §P§ su padre y §H§ su **hermano**.

| Caso | Situación | Acción | ¿Termina? |
|---|---|---|---|
| **1** | §H§ **rojo** | §H§ negro, §P§ rojo; **rotar §P§ hacia el lado de §D§**; pasa a caso 2, 3 o 4 | no |
| **2** | §H§ **negro** y sus **dos hijos negros** (NIL cuenta) | §H§ → rojo; el negro de más **sube a §P§**: si §P§ era rojo pasa a negro y **termina**; si era negro queda doble negro y **se repite más arriba** | solo si §P§ era rojo |
| **3** | §H§ negro, su hijo **cercano** a §D§ (§c§) **rojo** y el lejano negro | **intercambiar colores** de §H§ y §c§ y **rotar §H§ en sentido opuesto a §D§**; el rojo queda del lado lejano: **pasa al caso 4** | no |
| **4** | §H§ negro y su hijo **más lejano** a §D§ (§d§) **rojo** | §H§ toma el **color de §P§**; §P§ → negro; §d§ → negro; **rotar §P§ hacia el lado de §D§** | **sí** (equilibrado) |

**Pasos del borrado** (código, diapositiva 48): localizar §z§; si tiene a lo sumo un hijo se sustituye por él; con dos hijos se usa el **sucesor** §y§ (mínimo del derecho), que ocupa el lugar de §z§ con **su color**; se recuerda el **color original** del nodo realmente quitado (§yc§); **si era negro**, se llama a la reparación con el nodo §x§ que ocupó su lugar.

**Cuántas rotaciones:** a lo sumo **3** por eliminación (casos 1, 3 y 4); el caso 2 solo recolorea y puede repetirse subiendo (§O(log n)§).`,
    procedimiento: R`
**Para eliminar §v§ de un rojo-negro a mano:**

1. **Borra como en un BST** (hoja, un hijo, o dos hijos con el **sucesor**). Anota el **color del nodo que realmente se quitó**.
2. Si era **rojo** → **terminaste** (ninguna regla se rompe).
3. Si era **negro** y el nodo que lo reemplaza es **rojo** → píntalo de **negro** y termina.
4. Si era negro y el reemplazo es **negro (o NIL)** → hay un **doble negro** en §D§. Mientras §D§ no sea la raíz:
   - **Hermano rojo** → **caso 1**.
   - **Hermano negro, sobrinos negros** → **caso 2** (hermano a rojo, la deuda sube a §P§).
   - **Hermano negro, sobrino cercano rojo y lejano negro** → **caso 3**.
   - **Hermano negro, sobrino lejano rojo** → **caso 4** (fin).
5. Si el doble negro llega a la **raíz**, simplemente se **ignora** (la raíz queda negra).
6. **Verifica** las reglas.`,
    codigo: {
      titulo: 'Código de apoyo RN (S7-C1, d.48-49): cada caso de eliminación en acción',
      src: RN_BASE + R`
def escenario(insertados, borrar):
    arbol = ArbolRN()
    for v in insertados:
        arbol.insertar(v)
    antes = arbol.nota()
    arbol.casos = []
    arbol.eliminar(borrar)
    ok, bh, errores = arbol.verificar()
    print("eliminar", borrar, "de", antes, "->", arbol.nota(), "| casos:", arbol.casos, "| válido:", ok)

escenario([1, 2, 3, 4], 1)                  # hermano negro con sobrino lejano rojo
escenario([1, 2, 3, 4, 5, 6], 1)            # hermano rojo, luego hermano y sobrinos negros
escenario([1, 2, 3, 4, 6, 5], 2)            # sobrino cercano rojo, luego lejano rojo
escenario([1, 2, 4, 5, 6, 3], 1)            # hermano rojo, sobrino cercano rojo y lejano rojo
escenario([1, 2, 3, 4, 5, 6, 7, 8], 1)      # hermano y sobrinos negros, el padre rojo absorbe el negro
escenario([5, 3, 8], 3)                      # eliminar una hoja roja: no cambia nada más
`,
      esperado: 'eliminar 1 de 2n(1n,3n(,4r)) -> 3n(2n,4n) | casos: [\'caso 4 (sobrino lejano rojo)\'] | válido: True\neliminar 1 de 2n(1n,4r(3n,5n(,6r))) -> 4n(2n(,3r),5n(,6r)) | casos: [\'caso 1 (hermano rojo)\', \'caso 2 (hermano y sobrinos negros)\'] | válido: True\neliminar 2 de 2n(1n,4r(3n,6n(5r,))) -> 3n(1n,5r(4n,6n)) | casos: [\'caso 3 (sobrino cercano rojo)\', \'caso 4 (sobrino lejano rojo)\'] | válido: True\neliminar 1 de 2n(1n,5r(4n(3r,),6n)) -> 5n(3r(2n,4n),6n) | casos: [\'caso 1 (hermano rojo)\', \'caso 3 (sobrino cercano rojo)\', \'caso 4 (sobrino lejano rojo)\'] | válido: True\neliminar 1 de 4n(2r(1n,3n),6r(5n,7n(,8r))) -> 4n(2n(,3r),6r(5n,7n(,8r))) | casos: [\'caso 2 (hermano y sobrinos negros)\'] | válido: True\neliminar 3 de 5n(3r,8r) -> 5n(,8r) | casos: [] | válido: True'
    },
    ejemplo: R`
**Un doble negro, el caso 4** (el más simple de seguir): árbol §2n(1n,3n(,4r))§; eliminar §1§ (hoja negra) deja un doble negro en su lugar. El hermano §3§ es **negro** y su hijo **lejano** (§4§) es **rojo** ⇒ **caso 4**: §3§ toma el color de §2§ (negro), §2§ y §4§ pasan a negro y se rota §2§ hacia la izquierda ⇒ **§3n(2n,4n)§**. Termina.

**Caso 1 → 2** (diapositiva 29-30): §2n(1n,4r(3n,5n(,6r)))§, eliminar §1§: el hermano §4§ es **rojo** (caso 1): se pinta §4§ negro y §2§ rojo y se rota §2§; ahora el hermano es §3§ (negro, sobrinos NIL negros) ⇒ **caso 2**: §3§ pasa a rojo y la deuda sube a §2§, que **es rojo** ⇒ pasa a negro y **termina**: **§4n(2n(,3r),5n(,6r))§**.

**Caso 3 → 4** (diapositiva 31-32): el hermano tiene el hijo **cercano** rojo (zigzag): el caso 3 lo convierte en el lejano y el caso 4 termina.

**Eliminar una hoja roja** (§5, 3, 8§ y eliminar 3): no ocurre nada más, no hay casos.

**Pregunta que cae en el parcial:** «¿qué es un nodo doble negro y cómo se resuelve?» → el negro de más que deja el borrado de un nodo negro; se traslada hacia arriba hasta que lo absorba un nodo rojo o llegue a la raíz, con los 4 casos según el color del hermano y sus hijos.

Con el ejemplo interactivo se borran cinco valores de un árbol de 14 nodos y se imprime qué caso se aplicó en cada uno.`,
    complejidad: R`
- **Eliminación**: buscar §O(log n)§ + localizar el sucesor §O(log n)§ + reparación. El **caso 2** puede repetirse subiendo (**a lo sumo §O(log n)§ recoloreos**, cada uno §O(1)§); los casos **1, 3 y 4** usan **a lo sumo 3 rotaciones** (§O(1)§). Total **§O(log n)§**.
- **Comparación con el AVL**: el AVL puede necesitar hasta §O(log n)§ **rotaciones** en un borrado; el rojo-negro, a lo sumo **3 rotaciones** y el resto son recoloreos. (En mediciones pequeñas con datos aleatorios la diferencia en rotaciones puede ser pequeña; la garantía es sobre el peor caso.)
- **Espacio**: §O(1)§ extra (variables temporales) + un bit por nodo.
- **Por qué el negro de más sube**: el caso 2 hace rojo al hermano, equilibrando ese lado, y traslada el problema un nivel hacia arriba.`,
    errores: R`
- **Pensar que eliminar un nodo rojo exige reparar**: no altera la altura negra.
- **Olvidar que NIL cuenta como negro** al decidir si «los sobrinos son negros».
- **Rotar hacia el lado equivocado**: en los casos 1 y 4 se rota §P§ **hacia el lado de §D§**; en el caso 3 se rota §H§ en sentido **opuesto** a §D§.
- **Confundir cercano y lejano**: el sobrino **cercano** es el más próximo a §D§; el **lejano**, el opuesto.
- **Detenerse tras el caso 1 o 3**: no terminan (llevan a los casos 2-4).
- **No recordar el color del nodo realmente eliminado**: es lo que decide si hace falta reparar.
- **Olvidar la rama espejo** (cuando §D§ es hijo derecho).`,
    preguntas: [
      ['¿Qué es el «doble negro» y cuál es la meta al repararlo?', 'Al borrar un nodo negro se quita un negro de ese camino; el hueco queda como «doble negro». La meta es trasladar ese negro de más hacia arriba hasta que lo absorba un nodo rojo (que pasa a negro) o llegue a la raíz.'],
      ['Describe los cuatro casos de eliminación.', '1: hermano rojo ⇒ hermano negro, padre rojo, rotar el padre hacia el lado del doble negro; 2: hermano negro y sobrinos negros ⇒ hermano rojo y el negro de más sube al padre; 3: sobrino cercano rojo ⇒ intercambiar colores y rotar el hermano en sentido opuesto ⇒ caso 4; 4: sobrino lejano rojo ⇒ hermano toma el color del padre, padre y sobrino lejano negros, rotar el padre; termina.'],
      ['¿Qué pasa al eliminar un nodo rojo?', 'Nada más: no altera la altura negra ni genera dos rojos seguidos; no hay que reparar.'],
      ['¿Cuántas rotaciones hace como máximo una eliminación en un rojo-negro?', 'Tres (en los casos 1, 3 y 4); el caso 2 solo recolorea y se repite subiendo (§O(log n)§ veces).']
    ],
    resumen: R`
- Borrar como BST (sucesor). **Rojo → nada**; **negro → doble negro**.
- **Caso 1** hermano rojo → rotar y pasar a 2/3/4. **Caso 2** hermano y sobrinos negros → hermano rojo, el negro **sube**. **Caso 3** sobrino cercano rojo → intercambiar colores y rotar el hermano → caso 4. **Caso 4** sobrino lejano rojo → rotar el padre y **termina**.
- NIL cuenta como negro. A lo sumo **3 rotaciones**; total §O(log n)§.
- Si el doble negro llega a la raíz, se ignora.`
  });

  B.tema({
    id: 'rn-vs-avl', area: 'rn', titulo: 'AVL frente a rojo-negro: cuándo usar cada uno', fuente: 'S7-C1 · diap. 33-34, 37-38', nivel: 7, comp: true,
    conceptos: ['av_compara', 'rn_vs'], interactivo: ['avl-insertar', 'rn-insertar'], alias: 'rojinegro rojinegros avl',
    definicion: R`
**Ambos garantizan §O(log n)§** en búsqueda, inserción y eliminación. La diferencia es el **compromiso**: el **AVL** invierte más en mantenerse bajito (**mejor para leer**); el **rojo-negro** invierte menos en rebalancear (**mejor para escribir**). «Otra vez, elegir es diseñar.»

| Criterio | AVL | Rojo-negro |
|---|---|---|
| Balance | **más estricto** (§\|hi − hd\| ≤ 1§) | más laxo |
| Altura | **más baja** ⇒ búsquedas más rápidas | un poco mayor |
| Inserción/eliminación | **más rotaciones** | menos rotaciones |
| Uso típico | cuando **dominan las búsquedas** | cuando **dominan las modificaciones** |
| En la práctica | bases de datos, índices | §std::map§ de C++, §TreeMap§ de Java, planificador de Linux |`,
    intuicion: R`
El AVL es como un **bibliotecario obsesivo**: cada vez que se desordena un poco, reacomoda para que todo quede perfectamente parejo; las consultas son lo más rápidas posible, pero cada libro nuevo le cuesta trabajo. El rojo-negro es **más relajado**: tolera que un lado sea más alto (hasta el doble) y arregla las cosas con **cambios de color** y pocas rotaciones; las consultas son un poco más lentas, pero **agregar y quitar** es más barato.

Elige según **quién domina en tu aplicación**: un índice de base de datos que se **consulta millones de veces y casi no se modifica** pide el árbol más bajito (AVL); una estructura que recibe **inserciones y borrados constantes** y consultas ocasionales pide el que menos se reacomoda (rojo-negro).`,
    formal: R`
**Comparación detallada**

| Aspecto | AVL | Rojo-negro |
|---|---|---|
| Garantía | altura §< 1,44·log₂(n + 2)§ | altura §≤ 2·log₂(n + 1)§ |
| Información por nodo | altura (entero) | color (**1 bit**) |
| Rotaciones por inserción | a lo sumo **1** corrección (simple o doble) | a lo sumo **2** rotaciones |
| Rotaciones por eliminación | hasta §O(log n)§ | a lo sumo **3** |
| Búsqueda | §O(log n)§, más rápida (más bajo) | §O(log n)§, algo más lenta |
| Inserción/eliminación | §O(log n)§ | §O(log n)§, con menos reacomodos |

(En el cuadro, las cotas de rotaciones del rojo-negro y la cota 1,44 del AVL son **complementarias**; la clase presenta solo la comparación cualitativa de la primera tabla.)

**Pregunta de análisis (2) de la clase — «Elija la estructura»:**

1. **Un índice de base de datos que se consulta millones de veces pero rara vez se modifica** ⇒ **AVL** (la lectura domina: conviene el árbol más bajo).
2. **Una estructura que recibe inserciones y borrados constantes y consultas ocasionales** ⇒ **rojo-negro** (la escritura domina: menos rotaciones).

**Síntesis:** AVL favorece la **lectura**; rojo-negro, la **escritura**; ambos son §O(log n)§. Un error típico es creer que el rojo-negro es mejor que el AVL **en absoluto**: depende de si domina lectura o escritura.`,
    procedimiento: R`
**Para elegir entre AVL y rojo-negro:**

1. Estima la **proporción lecturas/escrituras** de tu aplicación.
2. **Muchas lecturas, pocas escrituras** ⇒ **AVL** (más bajo, búsquedas más rápidas).
3. **Muchas escrituras** (inserciones y borrados frecuentes) ⇒ **rojo-negro** (menos reacomodos).
4. **Si no importa el orden** y solo consultas pertenencia, considera una **tabla hash** ([[ad-hash]]).
5. Justifica con el **compromiso lectura/escritura**: «AVL invierte más en mantenerse bajito; rojo-negro invierte menos en rebalancear».`,
    codigo: {
      titulo: 'Medir alturas y rotaciones de AVL y rojo-negro con las mismas inserciones (valores medidos, no de las diapositivas)',
      src: AVL_MIN + RN_BASE.replace(/Nodo/g, 'NodoRN') + R`
def comparar(nombre, secuencia):
    avl = None
    rot_avl[0] = 0
    rn = ArbolRN()
    for v in secuencia:
        avl = insertar_avl(avl, v)
        rn.insertar(v)
    ok, bh, errores = rn.verificar()
    print(nombre, "| AVL: altura", alt(avl), "rotaciones", rot_avl[0], "| RN: altura", rn.altura(), "rotaciones", rn.rotaciones, "| RN válido:", ok)

comparar("ordenado 1..127", list(range(1, 128)))
comparar("mezclado (150 valores)", [(i * 7919) % 1009 for i in range(1, 151)])
`,
      esperado: 'ordenado 1..127 | AVL: altura 6 rotaciones 120 | RN: altura 11 rotaciones 115 | RN válido: True\nmezclado (150 valores) | AVL: altura 8 rotaciones 43 | RN: altura 8 rotaciones 43 | RN válido: True',
      nota: 'Con estos datos el AVL queda **más bajo** (altura menor: las búsquedas son más baratas) y las rotaciones de ambos son parecidas; la ventaja del rojo-negro en escritura es una **garantía de peor caso** (a lo sumo 2 rotaciones por inserción y 3 por eliminación), no un resultado de cada medición.'
    },
    ejemplo: R`
**Resultado del código** (inserciones con las mismas secuencias): con datos **ordenados** el AVL queda perfectamente balanceado (altura 6 para 127 valores) y el rojo-negro más alto; con datos **mezclados** las alturas son parecidas. Las rotaciones totales son similares: el rojo-negro sustituye parte de las rotaciones por **recoloreos** (el caso 3), que no tocan punteros.

**Dos casos de la clase:**

| Caso | Elección | Justificación |
|---|---|---|
| Índice de base de datos: millones de consultas, casi sin cambios | **AVL** | domina la lectura; el árbol más bajo da búsquedas más rápidas |
| Estructura con inserciones y borrados constantes y consultas ocasionales | **Rojo-negro** | domina la escritura; menos rotaciones por cambio |

**Uso real:** los mapas ordenados de lenguajes populares (§std::map§ en C++, §TreeMap§ en Java) y el planificador de Linux usan rojo-negro; las bases de datos e índices suelen preferir estructuras más bajas para lectura (como el AVL o variantes).

Los dos ejemplos interactivos (AVL y rojo-negro) construyen árboles de 14-18 nodos: compáralos viendo cómo el AVL muestra **alturas y factores** y el rojo-negro **colores**.`,
    complejidad: R`
- **Ambos**: búsqueda, inserción y eliminación **§O(log n)§** en el peor caso; espacio §O(n)§.
- **AVL**: altura menor (§≈ 1,44·log₂ n§ en el peor caso) ⇒ **menos comparaciones por búsqueda**; mantenimiento más costoso (alturas y hasta §O(log n)§ rotaciones por borrado).
- **Rojo-negro**: altura hasta §2·log₂ n§ ⇒ búsquedas algo más lentas en el peor caso; mantenimiento más barato (a lo sumo 2 rotaciones por inserción y 3 por borrado).
- **Criterio de elección**: lecturas/escrituras. Si las lecturas dominan, el ahorro de comparaciones del AVL compensa su mantenimiento; si las escrituras dominan, conviene el rojo-negro.`,
    errores: R`
- **Pensar que rojo-negro es mejor que AVL en absoluto**: depende de si domina lectura o escritura.
- **Decir que uno de los dos no es §O(log n)§**: ambos lo son.
- **Confundir los criterios de balance**: el AVL usa **factor de balance** (alturas); el rojo-negro, **colores** y altura negra.
- **Olvidar el costo extra por nodo**: el AVL guarda un entero (altura), el rojo-negro un bit (color).
- **Concluir de una sola medición** (como la del código) que uno rota «siempre menos»: la ventaja es una garantía del peor caso.
- **Usar un árbol balanceado cuando basta una tabla hash** (si no importa el orden).`,
    preguntas: [
      ['Compara AVL y rojo-negro en balance, altura, rotaciones y uso típico.', 'AVL: balance más estricto (|hi − hd| ≤ 1), altura más baja (búsquedas más rápidas), más rotaciones en inserción/eliminación, ideal si dominan las búsquedas (bases de datos, índices). Rojo-negro: balance más laxo, altura algo mayor, menos rotaciones, ideal si dominan las modificaciones (§std::map§ de C++, §TreeMap§ de Java, planificador de Linux). Ambos §O(log n)§.'],
      ['Un índice de base de datos que se consulta millones de veces pero rara vez se modifica, ¿AVL o rojo-negro? ¿Y una estructura con inserciones y borrados constantes?', 'Índice: AVL (dominan las lecturas, árbol más bajo). Inserciones/borrados constantes: rojo-negro (dominan las escrituras, menos rotaciones). Justificación: compromiso lectura/escritura.'],
      ['¿Es cierto que el rojo-negro es mejor que el AVL?', 'No en absoluto: depende de si domina la lectura (AVL) o la escritura (rojo-negro).'],
      ['¿Qué información extra guarda cada nodo en cada árbol?', 'AVL: la altura (un entero). Rojo-negro: el color (un bit).']
    ],
    resumen: R`
- **Ambos §O(log n)§**; difieren en el **compromiso**.
- **AVL**: balance estricto, altura menor, **más rotaciones** ⇒ **mejor para lectura** (índices, bases de datos).
- **Rojo-negro**: balance laxo, altura algo mayor, **menos rotaciones** ⇒ **mejor para escritura** (§std::map§, §TreeMap§, planificador de Linux).
- Nada es «mejor en absoluto»: depende de lecturas frente a escrituras.
- AVL guarda una altura por nodo; rojo-negro, un bit de color.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
