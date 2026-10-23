/* teoria_tv.js — Biblioteca: área Recorridos de árboles (fuente: S6-C1, Árboles y recorridos, diap. 13-22) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'tv-profundidad', area: 'tv', titulo: 'Preorden, inorden y postorden (recorridos en profundidad)', fuente: 'S6-C1 · diap. 13-17, 23-25', nivel: 5, comp: true,
    conceptos: ['tv_pre', 'tv_in', 'tv_post', 'tv_errores'], interactivo: ['recorridos'],
    definicion: R`
Los **recorridos en profundidad** (DFS) visitan **todos los nodos de un árbol** una vez. Los tres recorridos binarios cambian **cuándo se visita la raíz** respecto a sus subárboles:

| Recorrido | Orden de visita |
|---|---|
| **Preorden** | raíz → izquierda → derecha |
| **Inorden** | izquierda → raíz → derecha |
| **Postorden** | izquierda → derecha → raíz |

Para el árbol §1(2(4,5),3)§ dan: preorden **1, 2, 4, 5, 3**; inorden **4, 2, 5, 1, 3**; postorden **4, 5, 2, 3, 1**.`,
    intuicion: R`
Imagina que recorres el árbol con la mano pegada a su contorno, empezando por la raíz y siempre rodeando por la izquierda. Cada nodo se «toca» **tres veces**: al **bajar** hacia él (por encima), al **volver** desde su hijo izquierdo (por debajo) y al **volver** desde el derecho (por la derecha).

- **Preorden** apunta el nodo la **primera** vez que lo tocas (**antes** de visitar a sus hijos).
- **Inorden** lo apunta la **segunda** (**entre** sus hijos).
- **Postorden** lo apunta la **tercera** (**después** de sus hijos).

Las tres funciones recursivas son **idénticas** salvo por la posición de la línea que «visita» (§salida.append(nodo.valor)§).`,
    formal: R`
**Implementación recursiva** (diapositiva 17). La línea «visitar» cambia de lugar:

~~~
preorden(n):  si n es None: volver
              visitar(n); preorden(n.izq); preorden(n.der)

inorden(n):   si n es None: volver
              inorden(n.izq); visitar(n); inorden(n.der)

postorden(n): si n es None: volver
              postorden(n.izq); postorden(n.der); visitar(n)
~~~

- El **caso base** (§nodo is None§) es obligatorio: sin él aparece §AttributeError§.
- Cada nodo se visita **una vez**: §O(n)§ en tiempo. La recursión usa la **pila de llamadas** (semana 5): espacio §O(h)§.
- Los tres son variantes de **DFS**; el recorrido **por niveles (BFS)** usa una cola ([[tv-niveles]]).
- **Un solo recorrido no determina el árbol**: hacen falta dos (por ejemplo inorden + preorden; ver [[tv-reconstruir]]).

[comp]
**Versión iterativa del inorden** con pila explícita (para árboles muy profundos): bajar siempre por la izquierda apilando; al no poder bajar, desapilar, visitar y pasar al hijo derecho. Evita el desbordamiento de la pila de llamadas, a cambio de una pila propia en el montículo.
[/comp]`,
    procedimiento: R`
**Para escribir un recorrido a mano** (examen):

1. Dibuja el árbol y **escribe el árbol en notación anidada** si no lo está.
2. Aplica la regla **recursivamente a cada subárbol** (un subárbol es un árbol):
   - preorden: **raíz**, subárbol izq., subárbol der.;
   - inorden: subárbol izq., **raíz**, subárbol der.;
   - postorden: subárbol izq., subárbol der., **raíz**.
3. Cuando un subárbol es una **hoja**, se escribe tal cual; cuando es **vacío**, no se escribe nada.
4. Comprueba que aparecen **todos** los nodos **exactamente una vez**.
5. Verifica con las **propiedades**: en preorden la **raíz** es el **primero**; en postorden es el **último**; en inorden la raíz separa subárbol izq. y der.`,
    codigo: {
      titulo: 'Los tres recorridos (S6-C1, d.17) y el inorden iterativo con pila',
      src: R`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

def preorden(nodo, salida):
    if nodo is None: return
    salida.append(nodo.valor)        # 1) raíz
    preorden(nodo.izq, salida)       # 2) izquierda
    preorden(nodo.der, salida)       # 3) derecha

def inorden(nodo, salida):
    if nodo is None: return
    inorden(nodo.izq, salida)        # 1) izquierda
    salida.append(nodo.valor)        # 2) raíz
    inorden(nodo.der, salida)        # 3) derecha

def postorden(nodo, salida):
    if nodo is None: return
    postorden(nodo.izq, salida)      # 1) izquierda
    postorden(nodo.der, salida)      # 2) derecha
    salida.append(nodo.valor)        # 3) raíz

def inorden_iterativo(raiz):
    pila, salida, actual = [], [], raiz
    while actual is not None or pila:
        while actual is not None:    # bajar todo lo posible por la izquierda
            pila.append(actual)
            actual = actual.izq
        actual = pila.pop()
        salida.append(actual.valor)
        actual = actual.der
    return salida

raiz = NodoArbol(1)
raiz.izq = NodoArbol(2)
raiz.der = NodoArbol(3)
raiz.izq.izq = NodoArbol(4)
raiz.izq.der = NodoArbol(5)

for f in (preorden, inorden, postorden):
    s = []
    f(raiz, s)
    print(f.__name__, s)
print("inorden iterativo", inorden_iterativo(raiz))
`,
      esperado: 'preorden [1, 2, 4, 5, 3]\ninorden [4, 2, 5, 1, 3]\npostorden [4, 5, 2, 3, 1]\ninorden iterativo [4, 2, 5, 1, 3]'
    },
    ejemplo: R`
**Árbol de la clase:** §1(2(4,5),3)§.

~~~
        1
       / \
      2   3
     / \
    4   5
~~~

- **Preorden** (raíz → izq → der): §1§, luego todo el subárbol de §2§ en preorden (§2, 4, 5§), luego §3§ ⇒ **1, 2, 4, 5, 3**.
- **Inorden** (izq → raíz → der): subárbol de §2§ en inorden (§4, 2, 5§), luego §1§, luego §3§ ⇒ **4, 2, 5, 1, 3**.
- **Postorden** (izq → der → raíz): subárbol de §2§ (§4, 5, 2§), luego §3§, luego §1§ ⇒ **4, 5, 2, 3, 1**.

**Árbol de 7 nodos** §A(B(D,E),C(F,G))§:

| Recorrido | Resultado |
|---|---|
| Preorden | A B D E C F G |
| Inorden | D B E A F C G |
| Postorden | D E B F G C A |

**Verificación formativa:** «dibuja un árbol de 5 nodos y escribe sus tres recorridos» (boleto de salida de la clase) — usa el procedimiento anterior y comprueba que cada recorrido tiene los 5 nodos.

El ejemplo interactivo construye un árbol de **13 nodos** y ejecuta los tres recorridos (más el recorrido por niveles): el nodo resaltado es el que visita la llamada actual y la lista de salida se va llenando paso a paso.`,
    complejidad: R`
- **Tiempo §O(n)§**: cada nodo se visita **una vez** y las llamadas con §None§ son en total §n + 1§ ⇒ §(2n + 1)§ llamadas con trabajo constante cada una.
- **Espacio de pila §O(h)§** (la profundidad de la recursión es la altura): §O(log n)§ en un árbol balanceado, §O(n)§ en uno degenerado.
- **Salida**: §O(n)§ elementos guardados (si se construye una lista).
- Los tres recorridos tienen **el mismo costo**; solo cambia el **orden** de visita.
- **Inorden iterativo**: mismo §O(n)§ en tiempo, §O(h)§ de pila propia.`,
    errores: R`
- **Olvidar el caso base §nodo is None§**: §AttributeError§.
- **Mezclar los tres órdenes** (poner el «visitar» en el lugar equivocado).
- **Creer que un solo recorrido determina el árbol**: se necesitan dos (inorden + preorden, o inorden + postorden).
- **Escribir el inorden de un árbol cualquiera esperando que salga ordenado**: solo en un **BST** el inorden entrega los valores ascendentes.
- **Usar recursión en árboles muy profundos** y desbordar la pila: a veces conviene DFS iterativo con pila.
- **Visitar un nodo dos veces** (llamar a §visitar§ en dos de las posiciones).`,
    preguntas: [
      ['Da el preorden, inorden y postorden del árbol §1(2(4,5),3)§.', 'Preorden: 1, 2, 4, 5, 3. Inorden: 4, 2, 5, 1, 3. Postorden: 4, 5, 2, 3, 1.'],
      ['¿Qué diferencia a los tres recorridos y cuál es su complejidad?', 'Solo cuándo se visita la raíz respecto a sus subárboles (antes, entre o después). Todos son variantes de DFS y cuestan §O(n)§ en tiempo y §O(h)§ en pila.'],
      ['¿Qué pasa si olvidas §if nodo is None: return§?', 'Al llegar a un hijo vacío se intenta acceder a un atributo de §None§ y Python lanza §AttributeError§.'],
      ['¿Cómo identificas la raíz en el preorden y en el postorden?', 'En el preorden es el **primer** elemento; en el postorden es el **último**.']
    ],
    resumen: R`
- **Preorden** raíz-izq-der · **Inorden** izq-raíz-der · **Postorden** izq-der-raíz (todos DFS).
- Mismas funciones, solo cambia la posición de «visitar».
- Árbol §1(2(4,5),3)§: pre **1 2 4 5 3**, in **4 2 5 1 3**, post **4 5 2 3 1**.
- Costo §O(n)§ tiempo, §O(h)§ pila. Caso base **§is None§** obligatorio.
- Un solo recorrido no determina el árbol; en un BST el inorden sale ordenado.`
  });

  B.tema({
    id: 'tv-niveles', area: 'tv', titulo: 'Recorrido por niveles (BFS) con una cola', fuente: 'S6-C1 · diap. 18 (BFS mencionado; se formaliza en la semana 12)', nivel: 5, comp: true,
    conceptos: ['tv_bfs'], interactivo: ['recorridos'],
    definicion: R`
El **recorrido por niveles** (o por anchura, **BFS**) visita el árbol **nivel por nivel**, de izquierda a derecha: primero la raíz, luego todos los nodos de profundidad 1, luego los de profundidad 2…

La clase lo menciona como el recorrido que **usa una cola en vez de la pila** de los recorridos en profundidad, y anuncia que se formalizará con grafos en la semana 12.

[comp]
**Todo el contenido de este tema (algoritmo, código y análisis) es complementario**: las diapositivas solo nombran el recorrido por anchura y la cola; aquí se desarrolla lo mínimo necesario para resolver ejercicios.
[/comp]`,
    intuicion: R`
Si el recorrido en profundidad es «internarte por una rama hasta el fondo y volver», el recorrido por niveles es «**ir revisando por pisos**»: primero el piso 0, luego todo el piso 1, después el 2…

Para no perder el orden se usa una **fila de espera** (cola): sacas el primero de la fila, lo visitas y **formas atrás de la fila a sus hijos**. Como los hijos entran al final, **primero se atienden todos los del nivel actual** y luego sus hijos, es decir, el siguiente nivel.`,
    formal: R`
**Algoritmo:**

~~~
por_niveles(raiz):
    cola ← [raiz]
    mientras la cola no esté vacía:
        n ← sacar el primero de la cola
        visitar(n)
        si n.izq no es None: añadir n.izq al final de la cola
        si n.der no es None: añadir n.der al final de la cola
~~~

- **Estructura clave:** **cola** (FIFO). Los recorridos en profundidad usan **pila** (la de llamadas o una explícita).
- Cada nodo entra y sale de la cola **una vez** ⇒ **§O(n)§** en tiempo.
- **Espacio:** la cola llega a guardar, como máximo, **el nivel más ancho** del árbol: §O(ancho)§, hasta §O(n)§ (en un árbol perfecto, el último nivel tiene §n/2§ nodos).
- Para **agrupar por niveles**: procesar de una vez tantos nodos como hay en la cola al empezar cada nivel.
- Para sacar el primero de una lista en §O(1)§ se usa §collections.deque§ (§popleft§); con §lista.pop(0)§ cada extracción cuesta §O(n)§ ([[cx-python]]).`,
    procedimiento: R`
**Para hacerlo a mano:**

1. Escribe la raíz.
2. Lista **todos los nodos de profundidad 1** de izquierda a derecha.
3. Repite con profundidad 2, 3… hasta agotar el árbol.

**Para programarlo:**

1. Crea una **cola** con la raíz (en un árbol vacío, devuelve lista vacía).
2. **Mientras la cola no esté vacía:** saca el primer nodo, regístralo y **encola** sus hijos no vacíos (primero el izquierdo).
3. Si necesitas los niveles por separado, **procesa por tandas**: la cantidad de nodos que hay en la cola al inicio de la tanda es el ancho del nivel.`,
    codigo: {
      titulo: 'Recorrido por niveles con deque (y agrupado por niveles)',
      src: R`
from collections import deque

class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

def por_niveles(raiz):
    if raiz is None:
        return []
    cola = deque([raiz])
    res = []
    while cola:
        nodo = cola.popleft()                 # el primero de la fila
        res.append(nodo.valor)
        if nodo.izq is not None:
            cola.append(nodo.izq)             # los hijos se forman atrás
        if nodo.der is not None:
            cola.append(nodo.der)
    return res

def niveles_agrupados(raiz):
    cola, niveles = deque([raiz]), []
    while cola:
        nivel = []
        for _ in range(len(cola)):            # una tanda = un nivel completo
            n = cola.popleft()
            nivel.append(n.valor)
            if n.izq is not None:
                cola.append(n.izq)
            if n.der is not None:
                cola.append(n.der)
        niveles.append(nivel)
    return niveles

raiz = NodoArbol(1)
raiz.izq = NodoArbol(2)
raiz.der = NodoArbol(3)
raiz.izq.izq = NodoArbol(4)
raiz.izq.der = NodoArbol(5)
raiz.der.izq = NodoArbol(6)
raiz.der.der = NodoArbol(7)
raiz.izq.izq.izq = NodoArbol(8)

print(por_niveles(raiz))
print(niveles_agrupados(raiz))
print(por_niveles(None))
`,
      esperado: '[1, 2, 3, 4, 5, 6, 7, 8]\n[[1], [2, 3], [4, 5, 6, 7], [8]]\n[]'
    },
    ejemplo: R`
**Seguimiento de la cola** para el árbol del código (nodos 1 a 8, con 8 hijo izquierdo de 4):

| Paso | Se saca | Cola después de encolar sus hijos | Salida |
|---|---|---|---|
| inicio | — | [1] | — |
| 1 | 1 | [2, 3] | 1 |
| 2 | 2 | [3, 4, 5] | 1 2 |
| 3 | 3 | [4, 5, 6, 7] | 1 2 3 |
| 4 | 4 | [5, 6, 7, 8] | 1 2 3 4 |
| 5 | 5 | [6, 7, 8] | … 5 |
| 6 | 6 | [7, 8] | … 6 |
| 7 | 7 | [8] | … 7 |
| 8 | 8 | [] | … 8 |

Resultado **1, 2, 3, 4, 5, 6, 7, 8**; agrupado: §[[1], [2, 3], [4, 5, 6, 7], [8]]§ (4 niveles).

**Comparación con el preorden del mismo árbol:** 1, 2, 4, 8, 5, 3, 6, 7 (se interna por la rama izquierda hasta el fondo). **El BFS nunca baja antes de terminar el nivel actual.**

El ejemplo interactivo («Recorridos») incluye también el recorrido por niveles con una cola implementada con una lista.`,
    complejidad: R`
- **Tiempo §O(n)§**: cada nodo se encola y se desencola una sola vez, con trabajo constante cada vez (con §deque.popleft()§).
- **Espacio §O(w)§**, con §w§ el **ancho máximo** de un nivel (≤ §n§). En un árbol perfecto, §w ≈ n/2§ ⇒ §O(n)§; en un árbol degenerado, §w = 1§ ⇒ §O(1)§ de cola.
- **Con §lista.pop(0)§** en vez de §deque.popleft()§ el tiempo total pasaría a §O(n²)§ por el desplazamiento en cada extracción.
- **Comparación con DFS**: tiempo igual §O(n)§; espacio: DFS §O(h)§ frente a BFS §O(w)§. En árboles muy anchos conviene DFS; en árboles muy profundos y poco anchos, BFS.`,
    errores: R`
- **Usar pila en vez de cola**: el recorrido deja de ser por niveles (pasa a ser un DFS).
- **Encolar primero el hijo derecho**: el orden dentro de cada nivel sale de derecha a izquierda.
- **Olvidar el caso del árbol vacío** (§raiz is None§).
- **Usar §lista.pop(0)§** en árboles grandes: cada extracción es §O(n)§.
- **Procesar la cola «por tandas» sin fijar su tamaño antes**: si usas §len(cola)§ dentro del §for§ sin guardarlo, cambia mientras encolas. (En el código, §range(len(cola))§ se evalúa **una vez**.)
- **Pensar que BFS es «más rápido» que DFS**: ambos son §O(n)§; cambian el orden y el uso de memoria.`,
    preguntas: [
      ['¿Qué estructura usa el recorrido por niveles y qué usan los recorridos en profundidad?', 'El recorrido por niveles (BFS) usa una **cola** (FIFO); los recorridos en profundidad usan una **pila** (la de llamadas, en la versión recursiva).'],
      ['Da el recorrido por niveles del árbol §1(2(4,5),3(6,7))§.', '1, 2, 3, 4, 5, 6, 7 (por niveles: [1], [2, 3], [4, 5, 6, 7]).'],
      ['¿Qué complejidad en tiempo y espacio tiene el recorrido por niveles?', 'Tiempo §O(n)§; espacio §O(w)§ con §w§ el ancho máximo de un nivel (hasta §O(n)§).'],
      ['¿Por qué conviene §deque.popleft()§ frente a §lista.pop(0)§?', 'Porque §popleft§ es §O(1)§ mientras §pop(0)§ desplaza todos los elementos (§O(n)§): con listas el BFS sería §O(n²)§.']
    ],
    resumen: R`
- **Por niveles (BFS)** = nivel por nivel, de izq. a der., con una **cola** (los DFS usan pila).
- Algoritmo: sacar el primero, visitarlo, encolar sus hijos (izq. primero).
- §O(n)§ en tiempo; espacio **§O(ancho)§**.
- Usa §deque.popleft()§ (§O(1)§), no §pop(0)§ (§O(n)§).
- La clase solo lo nombra: se formaliza con grafos en la semana 12.`
  });

  B.tema({
    id: 'tv-usos', area: 'tv', titulo: 'Para qué sirve cada recorrido y aplicaciones en IA', fuente: 'S6-C1 · diap. 15-16, 18, 20-21', nivel: 5,
    conceptos: ['tv_usos'], interactivo: [],
    definicion: R`
Cada recorrido encaja con un tipo de problema según **cuándo hay que tener disponible la información del padre o de los hijos**:

- **Preorden**: **copiar o serializar** un árbol; procesar el **padre antes que los hijos** (ej.: exportar un menú anidado).
- **Inorden**: en un árbol binario de búsqueda entrega los elementos **ordenados** (se ve en [[bs-inorden]]).
- **Postorden**: procesar los **hijos antes que el padre**: liberar memoria, evaluar expresiones, calcular tamaños (ej.: *autograd* en IA).
- **Por niveles (BFS)**: recorrer por capas, con una cola.`,
    intuicion: R`
- Si **vas a armar un edificio**, primero el cimiento y luego los pisos de arriba: el **padre antes que los hijos** (**preorden**).
- Si **vas a demoler un edificio**, primero los pisos de arriba y al final el cimiento: los **hijos antes que el padre** (**postorden**).
- Si **solo necesitas saber cuánto pesa cada carpeta**, primero necesitas el peso de sus subcarpetas y luego sumas: **postorden**.

La pregunta clave es: **¿necesito el resultado de los hijos antes de poder resolver al padre?** Si sí, postorden; si necesito al padre primero, preorden.`,
    formal: R`
**Aplicaciones de los árboles en IA** (diapositiva 20):

| Aplicación | Idea | Recorrido |
|---|---|---|
| **Árboles de decisión** | cada nodo interno prueba una característica y cada hoja da una predicción; se recorren **de la raíz a una hoja** | un camino raíz → hoja |
| **Grafo de cómputo y autograd** | una red neuronal es un árbol/grafo de operaciones; la **retropropagación** calcula los gradientes de los hijos antes que los del padre | **postorden** |
| **Búsqueda en juegos** | el árbol de jugadas (ajedrez, Go) se explora con **backtracking y poda**; Monte Carlo Tree Search lo recorre para elegir la mejor jugada | backtracking / MCTS |
| **Sistemas de archivos y JSON** | carpetas y documentos anidados son árboles | **preorden** o **postorden** |

**Regla de dependencia** (pregunta de análisis): la retropropagación necesita el gradiente de cada operación **después** de tener los de las operaciones que dependen de ella ⇒ **postorden** (hijos antes que el padre). Para **imprimir la arquitectura de arriba hacia abajo** se usa **preorden** (el padre antes que sus hijos).`,
    procedimiento: R`
**Para elegir el recorrido:**

1. Pregunta: «¿necesito resultados de los **hijos** para resolver al **padre**?»
   - **Sí** → **postorden** (tamaños, alturas, evaluación de expresiones, liberar memoria, autograd).
   - **No, necesito al padre primero** → **preorden** (copiar, serializar, imprimir jerarquías).
2. ¿El árbol es un **BST** y necesito los datos **ordenados**? → **inorden**.
3. ¿Necesito procesar **por capas** (distancia desde la raíz)? → **por niveles**.
4. Implementa el recorrido con la **plantilla recursiva** y pon la acción de «visitar» en la posición correspondiente.`,
    codigo: {
      titulo: 'Un árbol de carpetas: preorden para listar, postorden para sumar tamaños',
      src: R`
class Nodo:
    def __init__(self, nombre, tam=0):
        self.nombre = nombre
        self.tam = tam                 # tamaño propio (archivos)
        self.hijos = []

raiz = Nodo("proyecto")
src = Nodo("src")
doc = Nodo("docs")
raiz.hijos = [src, doc, Nodo("README.md", 4)]
src.hijos = [Nodo("main.py", 20), Nodo("util.py", 12)]
doc.hijos = [Nodo("guia.md", 30)]

def imprimir(n, nivel):                # PREORDEN: el padre antes que los hijos
    print("  " * nivel + n.nombre)
    for h in n.hijos:
        imprimir(h, nivel + 1)

def tamano_total(n):                   # POSTORDEN: los hijos antes que el padre
    total = n.tam
    for h in n.hijos:
        total += tamano_total(h)
    print(n.nombre, "pesa", total)
    return total

imprimir(raiz, 0)
print("---")
tamano_total(raiz)
`,
      esperado: 'proyecto\n  src\n    main.py\n    util.py\n  docs\n    guia.md\n  README.md\n---\nmain.py pesa 20\nutil.py pesa 12\nsrc pesa 32\nguia.md pesa 30\ndocs pesa 30\nREADME.md pesa 4\nproyecto pesa 66'
    },
    ejemplo: R`
**Autograd (retropropagación).** Una red calcula §y = (a + b) · c§. El grafo de cómputo es un árbol de operaciones:

~~~
        *            (nodo raíz: y)
       / \
      +   c
     / \
    a   b
~~~

La clase lo resume así: «**la retropropagación hace un recorrido postorden: calcula los gradientes de los hijos antes que los del padre**». La pregunta de análisis lo plantea como una **dependencia**: cada operación necesita el gradiente de las operaciones que dependen de ella, y la respuesta es **postorden**, porque en ese recorrido un nodo se procesa solo **cuando ya se procesaron sus hijos**.

[comp]
La **evaluación hacia adelante** de §y = (a + b) · c§ también es un postorden: hay que conocer §a§, §b§ y §c§ antes de calcular §a + b§, y este valor antes de multiplicar. En una implementación real, la pasada hacia atrás recorre el grafo en el orden **inverso** al de cálculo.
[/comp]

**Tamaño de carpetas (código):** el tamaño de §src§ (32) solo se conoce **después** de haber calculado el de §main.py§ y §util.py§: por eso se calcula en **postorden**. Imprimir la jerarquía con sangrías es **preorden**: cada carpeta se escribe antes que su contenido.

**Árbol de decisión:** para clasificar una muestra se baja **de la raíz a una hoja** respondiendo una pregunta por nodo; no se recorre todo el árbol (un solo camino: §O(h)§).`,
    complejidad: R`
- **Preorden y postorden de un árbol de §n§ nodos**: §O(n)§ cada uno (se visita cada nodo una vez), con pila de recursión §O(h)§.
- **Árbol de decisión**: clasificar una muestra recorre **un camino raíz–hoja**: §O(h)§ (profundidad del árbol).
- **Autograd**: una pasada por el grafo, §O(número de operaciones)§.
- **Búsqueda en juegos**: el árbol de jugadas es exponencial; backtracking con **poda** y MCTS evitan recorrerlo entero.
- Todo recorrido completo es **Ω(n)**: hay que ver cada nodo al menos una vez; no hay forma más barata de recorrerlos todos.`,
    errores: R`
- **Elegir el recorrido por costumbre** y no por la dependencia (usar preorden para calcular tamaños).
- **Creer que el inorden sirve para cualquier árbol**: solo ordena datos en un **BST**.
- **Pensar que recorrer un árbol de decisión es recorrerlo entero**: se baja por **un** camino.
- **Confundir el orden de visita con el orden de cómputo** en autograd: define bien qué depende de qué.
- **Olvidar que un sistema de archivos con muchos hijos** (no binario) usa la misma idea con una lista de hijos, no §izq§/§der§.`,
    preguntas: [
      ['¿Qué recorrido usa la retropropagación y por qué?', 'Postorden: necesita procesar los hijos (operaciones de las que depende) antes que el padre; la clase dice que calcula los gradientes de los hijos antes que los del padre.'],
      ['¿Qué recorrido usarías para imprimir la arquitectura de una red de arriba hacia abajo?', 'Preorden: se imprime cada nodo **antes** que sus hijos.'],
      ['¿Para qué sirven preorden, inorden y postorden?', 'Preorden: copiar/serializar, padre antes que hijos. Inorden: en un BST entrega los datos ordenados. Postorden: hijos antes que el padre (liberar memoria, evaluar expresiones, calcular tamaños, autograd).'],
      ['Menciona dos aplicaciones de los árboles en IA.', 'Árboles de decisión (raíz → hoja para predecir), grafo de cómputo/autograd (postorden), búsqueda en juegos (backtracking con poda y MCTS), sistemas de archivos y JSON.']
    ],
    resumen: R`
- **Preorden**: padre antes que hijos (copiar, serializar, imprimir jerarquías).
- **Inorden**: en un BST, datos **ordenados**.
- **Postorden**: hijos antes que el padre (tamaños, evaluar expresiones, liberar memoria, **autograd**).
- **Por niveles**: por capas, con cola.
- IA: árboles de decisión (raíz → hoja), autograd (postorden), juegos (backtracking + poda, MCTS), archivos y JSON.`
  });

  B.tema({
    id: 'tv-reconstruir', area: 'tv', titulo: 'Reconstruir un árbol a partir de dos recorridos', fuente: 'S6-C1 · diap. 19, 23', nivel: 5, comp: true,
    conceptos: ['tv_reconstruir'], interactivo: ['tv-reconstruir'],
    definicion: R`
**Un solo recorrido no determina el árbol**: se necesitan **dos**, por ejemplo **inorden + preorden** (o inorden + postorden). Con ellos, si los **valores son distintos**, el árbol se reconstruye de forma **única**.

Pregunta de la clase: preorden §[A, B, D, E, C]§ e inorden §[D, B, E, A, C]§ ⇒ la raíz es §A§ (primero del preorden) y el inorden la separa en izquierda §[D, B, E]§ y derecha §[C]§; el árbol es **§A(B(D,E),C)§**.`,
    intuicion: R`
El **preorden** te dice **quién es la raíz** (siempre es el primero); el **inorden** te dice **qué nodos quedan a cada lado** de esa raíz (los que están antes de ella en el inorden son del subárbol izquierdo y los que están después, del derecho). Con esa información **partes el problema en dos subproblemas más pequeños** y repites: es recursión.

Solo con el preorden no basta: §[A, B]§ puede ser §A§ con §B§ a la izquierda **o** a la derecha. El inorden resuelve la ambigüedad (§[B, A]§ frente a §[A, B]§).`,
    formal: R`
**Propiedades usadas** (valores distintos):

- **Preorden**: el **primer** elemento es la **raíz**; después viene todo el subárbol izquierdo y luego todo el derecho.
- **Postorden**: el **último** elemento es la raíz.
- **Inorden**: la raíz **separa** los elementos del subárbol izquierdo (antes) de los del derecho (después).

**Reconstrucción** (preorden + inorden): si §k§ es la posición de la raíz en el inorden, entonces:

~~~
raíz = pre[0]
subárbol izq: preorden = pre[1 : k+1],  inorden = ino[0 : k]
subárbol der: preorden = pre[k+1 : ],   inorden = ino[k+1 : ]
~~~

**Por qué no basta un recorrido:** hay árboles distintos con el mismo preorden (o el mismo inorden). **Hay que declarar** que los valores son distintos; con repetidos la reconstrucción puede no ser única.

[comp]
Con **preorden + postorden** **no** se puede reconstruir un árbol binario de forma única en general (solo si es lleno). Con **por niveles + inorden** sí.
[/comp]`,
    procedimiento: R`
**A mano** (preorden §[A, B, D, E, C]§, inorden §[D, B, E, A, C]§):

1. **Raíz** = primer elemento del preorden: §A§.
2. **Ubica §A§ en el inorden**: a su izquierda §[D, B, E]§ (subárbol izquierdo, 3 nodos) y a su derecha §[C]§ (subárbol derecho, 1 nodo).
3. Del preorden, tras la raíz, toma los **3 siguientes** (§B, D, E§) para el subárbol izquierdo y el **resto** (§C§) para el derecho.
4. **Repite** con cada pareja: en §(preorden [B, D, E], inorden [D, B, E])§ la raíz es §B§, con izquierda §[D]§ y derecha §[E]§.
5. Cuando un subárbol tiene **un solo nodo**, es una hoja; cuando no tiene nodos, es §None§.
6. **Verifica**: calcula el preorden e inorden del árbol obtenido y compáralos con los datos.`,
    codigo: {
      titulo: 'Construir el árbol desde preorden e inorden (y mostrar la ambigüedad de un solo recorrido)',
      src: R`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

def construir(pre, ino):
    if not pre:
        return None
    raiz = NodoArbol(pre[0])                  # el primero del preorden es la raíz
    k = ino.index(pre[0])                     # posición de la raíz en el inorden
    raiz.izq = construir(pre[1:k + 1], ino[:k])
    raiz.der = construir(pre[k + 1:], ino[k + 1:])
    return raiz

def a_nota(n):
    if n is None:
        return "_"
    if n.izq is None and n.der is None:
        return str(n.valor)
    sub = lambda x: "" if x is None else a_nota(x)
    return str(n.valor) + "(" + sub(n.izq) + "," + sub(n.der) + ")"

def recorrer(n, orden, s):
    if n is None:
        return s
    if orden == "pre": s.append(n.valor)
    recorrer(n.izq, orden, s)
    if orden == "in": s.append(n.valor)
    recorrer(n.der, orden, s)
    if orden == "post": s.append(n.valor)
    return s

a = construir(["A", "B", "D", "E", "C"], ["D", "B", "E", "A", "C"])
print(a_nota(a))
print("postorden:", recorrer(a, "post", []))

x = NodoArbol("A")
x.izq = NodoArbol("B")                        # B a la izquierda de A
y = NodoArbol("A")
y.der = NodoArbol("B")                        # B a la derecha de A
print("mismo preorden:", recorrer(x, "pre", []), recorrer(y, "pre", []))
print("distinto inorden:", recorrer(x, "in", []), recorrer(y, "in", []))
`,
      esperado: "A(B(D,E),C)\npostorden: ['D', 'E', 'B', 'C', 'A']\nmismo preorden: ['A', 'B'] ['A', 'B']\ndistinto inorden: ['B', 'A'] ['A', 'B']"
    },
    ejemplo: R`
**Pregunta de la clase.** Preorden §[A, B, D, E, C]§ e inorden §[D, B, E, A, C]§:

| Paso | Preorden | Inorden | Raíz | Izq. | Der. |
|---|---|---|---|---|---|
| 1 | A B D E C | D B E A C | **A** | D B E | C |
| 2 (izq.) | B D E | D B E | **B** | D | E |
| 3 | D | D | **D** (hoja) | — | — |
| 4 | E | E | **E** (hoja) | — | — |
| 5 (der.) | C | C | **C** (hoja) | — | — |

Árbol: **§A(B(D,E),C)§**, cuyo postorden es §D, E, B, C, A§.

**¿Basta solo el preorden?** No: §A(B,_)§ y §A(_,B)§ tienen el mismo preorden §[A, B]§ (inorden §[B, A]§ y §[A, B]§ respectivamente). El inorden distingue ambos.

**Con el ejemplo interactivo** el programa reconstruye un árbol de **13 nodos** a partir de sus dos recorridos: observa cómo cada llamada recursiva «pesca» la raíz y reparte los dos tramos.`,
    complejidad: R`
- **Con §ino.index(pre[0])§**: cada llamada busca la raíz en el inorden en §O(n)§ y hay §n§ llamadas ⇒ **§O(n²)§** en el peor caso (árbol degenerado).
- **Espacio**: §O(n)§ de nodos + pila §O(h)§ + los cortes de listas (§pre[1:k+1]§, etc.) que **copian** y suman §O(n)§ por nivel en este código.
- **Unicidad**: con valores distintos, el par (preorden, inorden) determina **un único** árbol; la prueba es por inducción sobre el tamaño (la raíz y los tamaños de los subárboles quedan fijados).

[comp]
Con un **diccionario** valor → posición en el inorden (construido una vez, §O(n)§) y **índices** en lugar de cortes de lista, la reconstrucción baja a **§O(n)§**.
[/comp]`,
    errores: R`
- **Creer que un solo recorrido determina el árbol**: se necesitan dos (p. ej. inorden + preorden).
- **Intentar con preorden + postorden** esperando una solución única.
- **Cortar mal los tramos del preorden**: la longitud del subárbol izquierdo es §k§ (posición de la raíz en el inorden), no la mitad.
- **No suponer valores distintos**: con repetidos el §index§ puede ubicar mal la raíz.
- **Olvidar el caso base** de lista vacía (§None§).
- **Confundir cuál recorrido da la raíz**: preorden → primero; postorden → último; inorden → la raíz está «en medio» (no se sabe cuál es sin otro recorrido).`,
    preguntas: [
      ['Preorden §[A, B, D, E, C]§ e inorden §[D, B, E, A, C]§. ¿Puedes reconstruir el árbol? ¿Cuál es la raíz y cómo la identificas en cada recorrido?', 'Sí. La raíz es §A§: es el **primero del preorden** y en el inorden separa §[D, B, E]§ (izquierda) de §[C]§ (derecha). El árbol es §A(B(D,E),C)§.'],
      ['¿Bastaría solo con el preorden para reconstruirlo de forma única?', 'No: §A(B,_)§ y §A(_,B)§ tienen el mismo preorden §[A, B]§. Se necesitan dos recorridos (inorden + preorden o inorden + postorden).'],
      ['¿Cómo identificas la raíz en preorden, inorden y postorden?', 'Preorden: el primero. Postorden: el último. Inorden: no es fija (queda en medio: separa izquierda y derecha, y se ubica con ayuda del otro recorrido).'],
      ['¿Qué complejidad tiene la reconstrucción con §index§ y cuál con un diccionario?', 'Con §ino.index§: §O(n²)§ en el peor caso. Con un diccionario de posiciones: §O(n)§.']
    ],
    resumen: R`
- **Un solo recorrido no basta**; hacen falta dos (inorden + preorden o postorden), con valores distintos.
- **Preorden → raíz = primero; postorden → raíz = último.** El inorden separa izquierda y derecha.
- Algoritmo: raíz = §pre[0]§; §k = posición en inorden§; izq: §pre[1:k+1], ino[:k]§; der: §pre[k+1:], ino[k+1:]§.
- Ejemplo: pre ABDEC + in DBEAC ⇒ **§A(B(D,E),C)§**.
- §O(n²)§ con §index§, §O(n)§ con diccionario.`
  });

  B.tema({
    id: 'tv-expresion', area: 'tv', titulo: 'Árboles de expresión: evaluar con postorden', fuente: 'S6-C1 · diap. 22', nivel: 5, comp: true,
    conceptos: ['tv_expr'], interactivo: ['tv-expresion'],
    definicion: R`
Un **árbol de expresión aritmética** tiene **números en las hojas** y **operadores en los nodos internos**. Sus recorridos dan las tres notaciones de una expresión:

- **Preorden** → notación **prefija**.
- **Inorden** → notación **infija** (la usual, con paréntesis necesarios).
- **Postorden** → notación **postfija** (**RPN**, vista en la semana 3).

La **evaluación** se hace con **postorden**: hay que tener los dos operandos **antes** de aplicar el operador.`,
    intuicion: R`
Para calcular §(3 + 4) × 2§ necesitas primero el valor de §3 + 4§ y de §2§, y solo entonces multiplicas. En el árbol, el operador está **arriba** y sus operandos **abajo**; para evaluar un nodo debes haber evaluado **antes** a sus hijos: eso es exactamente el **postorden** (los hijos antes que el padre).

Con **preorden** verías primero el operador sin conocer los operandos (no puedes aplicarlo aún); por eso no sirve para evaluar, aunque sí para escribir la expresión en notación prefija.`,
    formal: R`
**Árbol de §(3 + 4) × 2§:**

~~~
       *
      / \
     +   2
    / \
   3   4
~~~

| Recorrido | Resultado | Notación |
|---|---|---|
| Preorden | §* + 3 4 2§ | prefija |
| Inorden | §3 + 4 * 2§ | infija (hay que añadir paréntesis para reflejar el árbol) |
| Postorden | §3 4 + 2 *§ | **postfija (RPN)** |

**Evaluación recursiva en postorden:**

~~~
evaluar(n):
    si n es hoja: devolver n.valor
    a ← evaluar(n.izq);  b ← evaluar(n.der)       # primero los hijos
    devolver aplicar(n.valor, a, b)               # luego el operador
~~~

Esto coincide con evaluar la RPN con una **pila**: cada número se apila, cada operador desapila dos operandos y apila el resultado.`,
    procedimiento: R`
**Para evaluar o convertir una expresión:**

1. **Construye el árbol**: el operador de **menor precedencia** (o el último que se aplica) es la raíz; sus lados son los subárboles.
2. **Escribe los tres recorridos** según la notación que pidan.
3. **Evalúa en postorden**: valor de las hojas; en cada operador aplica la operación a los valores de los hijos.
4. **Comprueba** que el postorden, evaluado con una pila, da el mismo número.
5. **Explica el porqué**: en postorden los operandos están disponibles antes que el operador.`,
    codigo: {
      titulo: 'Árbol de (3 + 4) * 2: los tres recorridos y la evaluación en postorden',
      src: R`
class NodoArbol:
    def __init__(self, valor, izq=None, der=None):
        self.valor = valor
        self.izq = izq
        self.der = der

OPS = {"+": lambda a, b: a + b, "-": lambda a, b: a - b, "*": lambda a, b: a * b}

def evaluar(n):                         # POSTORDEN: primero los hijos, luego el operador
    if n.izq is None and n.der is None:
        return n.valor
    a = evaluar(n.izq)
    b = evaluar(n.der)
    return OPS[n.valor](a, b)

def recorrer(n, orden, s):
    if n is None:
        return s
    if orden == "pre": s.append(n.valor)
    recorrer(n.izq, orden, s)
    if orden == "in": s.append(n.valor)
    recorrer(n.der, orden, s)
    if orden == "post": s.append(n.valor)
    return s

N = NodoArbol
arbol = N("*", N("+", N(3), N(4)), N(2))
print("prefija :", recorrer(arbol, "pre", []))
print("infija  :", recorrer(arbol, "in", []))
print("postfija:", recorrer(arbol, "post", []))
print("valor   :", evaluar(arbol))

def evaluar_rpn(tokens):                # la misma evaluación con una pila
    pila = []
    for t in tokens:
        if t in OPS:
            b = pila.pop()
            a = pila.pop()
            pila.append(OPS[t](a, b))
        else:
            pila.append(t)
    return pila[0]

print("RPN     :", evaluar_rpn(recorrer(arbol, "post", [])))
`,
      esperado: "prefija : ['*', '+', 3, 4, 2]\ninfija  : [3, '+', 4, '*', 2]\npostfija: [3, 4, '+', 2, '*']\nvalor   : 14\nRPN     : 14"
    },
    ejemplo: R`
**Actividad de la clase:** árbol de §(3 + 4) × 2§.

1. **Los tres recorridos:** preorden §* + 3 4 2§; inorden §3 + 4 * 2§; postorden §3 4 + 2 *§.
2. **¿Cuál produce la notación postfija (RPN)?** El **postorden**.
3. **Función que evalúa:** §evaluar(n)§ del código (en postorden).
4. **¿Por qué postorden y no preorden?** Porque para aplicar el operador necesitas **antes** los valores de sus dos operandos; el preorden visitaría primero el operador, sin valores que combinar.

**Seguimiento de §evaluar(*)§:**

~~~
evaluar(*) = OPS["*"]( evaluar(+), evaluar(2) )
evaluar(+) = OPS["+"]( evaluar(3), evaluar(4) ) = 3 + 4 = 7
evaluar(2) = 2
evaluar(*) = 7 * 2 = 14
~~~

**Cuidado con la notación infija:** el inorden §3 + 4 * 2§, leído con la precedencia habitual, daría 11, no 14: el árbol dice que la suma va **primero**, y eso en la notación infija exige **paréntesis** (§(3 + 4) * 2§).

El ejemplo interactivo evalúa una expresión de **15 nodos** (8 números y 7 operadores): puedes ver cómo el valor de cada subárbol se calcula antes que el de su padre.`,
    complejidad: R`
- **Evaluación**: cada nodo se visita **una vez** ⇒ **§O(n)§** en tiempo; pila de recursión **§O(h)§**.
- **Recorridos para obtener la notación**: §O(n)§.
- **Evaluación de RPN con pila**: §O(n)§ (cada token se procesa una vez, con §push§/§pop§ de §O(1)§); espacio §O(n)§ en el peor caso.
- **Justificación de «postorden»**: el valor de un nodo depende de los de sus hijos ⇒ el orden topológico del cálculo es hijos antes que padre.
- Un árbol de expresión de §n§ nodos tiene **§(n + 1)/2§ hojas** (números) y **§(n − 1)/2§ operadores** (cada operador binario tiene dos hijos: árbol lleno).`,
    errores: R`
- **Evaluar en preorden** o inorden: los operandos todavía no están disponibles.
- **Confundir postfija con prefija**: postfija = postorden (operador al final); prefija = preorden (operador al inicio).
- **Leer el inorden sin paréntesis** y evaluar con otra precedencia: el árbol manda.
- **Apilar en el orden equivocado** al evaluar RPN (para el operador debe salir primero el **segundo** operando: §b = pop()§, §a = pop()§).
- **Olvidar que las hojas son números** y los internos operadores (en un árbol de expresión binario, todo nodo interno tiene **dos** hijos).
- **División**: con operador §/§ cuida el orden de los operandos (no es conmutativa).`,
    preguntas: [
      ['Escribe los tres recorridos del árbol de §(3 + 4) * 2§.', 'Preorden: §* + 3 4 2§. Inorden: §3 + 4 * 2§ (con paréntesis para reflejar el árbol). Postorden: §3 4 + 2 *§.'],
      ['¿Cuál recorrido produce la notación postfija (RPN)?', 'El **postorden**.'],
      ['¿Por qué se evalúa con postorden y no con preorden?', 'Porque para aplicar un operador necesitas **antes** los valores de sus dos operandos (hijos antes que el padre); en preorden visitarías el operador primero, sin valores que combinar.'],
      ['Implementa §evaluar(n)§ para un árbol de expresión.', 'Si §n§ es hoja, devolver §n.valor§; si no, §a = evaluar(n.izq)§, §b = evaluar(n.der)§ y devolver §a op b§ según §n.valor§ (postorden).']
    ],
    resumen: R`
- **Árbol de expresión**: números en hojas, operadores en nodos internos.
- Preorden = **prefija**; inorden = **infija** (con paréntesis); postorden = **postfija (RPN)**.
- **Evaluar = postorden** (hijos antes que el padre): §O(n)§ en tiempo.
- §(3 + 4) * 2§: postorden §3 4 + 2 *§ ⇒ **14**.
- Equivale a evaluar la RPN con una pila.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
