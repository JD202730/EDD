/* teoria_gf.js — Biblioteca: área Grafos: BFS y DFS (fuente: S12-C1, Clase1_BFS_DFS_Topologico, 19 diapositivas).
   Contenido complementario: definiciones básicas de grafo (el profesor las da por sabidas), conteo de operaciones y los grados de separación. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;
  const CLASE = R`grafo = {'A': ['B', 'C', 'D'], 'B': ['A', 'E'], 'C': ['A', 'F', 'G'], 'D': ['A'], 'E': ['B', 'F'], 'F': ['C', 'E', 'G'], 'G': ['C', 'F']}`;

  B.tema({
    id: 'gf-grafo', area: 'gf', titulo: 'Grafo: vértices, aristas y lista de adyacencia', fuente: 'S12-C1 · diap. 5, 14 (complemento: definiciones)', nivel: 15, comp: true,
    conceptos: ['gr_def'], lab: [{ tab: 'grafos', e: 'clase', texto: 'Ver el grafo de la clase' }, { tab: 'grafos', e: 'aleatorio', texto: 'Generar un grafo con los nodos que elijas' }], alias: 'grafos nodos vertices aristas adyacencia matriz dirigido ponderado conexo ciclo',
    definicion: R`
Un **grafo** G = (V, E) es un conjunto de **vértices** (o nodos) V y un conjunto de **aristas** E que unen pares de vértices.

- **No dirigido**: la arista {u, v} se puede recorrer en los dos sentidos. **Dirigido**: la arista (u → v) tiene un sentido.
- **Ponderado**: cada arista lleva un **peso** (distancia, tiempo, costo).
- **Camino**: secuencia de vértices unidos por aristas. **Ciclo**: camino que vuelve al punto de partida.
- **Conexo**: hay un camino entre cada par de vértices. Un **árbol** es un grafo **conexo sin ciclos**.

Para programar con grafos se usa la **lista de adyacencia**: para cada vértice, la lista de sus vecinos. En Python es un diccionario: §grafo = {'A': ['B', 'C'], 'B': ['A'], 'C': ['A']}§. Si el grafo es ponderado, cada vecino lleva su peso: §{'A': {'B': 5, 'C': 2}}§.`,
    intuicion: R`
Un grafo es **un mapa de relaciones**: las ciudades y las carreteras entre ellas, las personas de una red social y sus amistades, las páginas web y sus enlaces, las tareas de un proyecto y sus dependencias.

Lo que ya conoces es un caso particular: una **lista enlazada** es un grafo en forma de cadena; un **árbol** (semana 6) es un grafo sin ciclos. Lo nuevo de los grafos generales es que **puede haber ciclos**: por eso los recorridos necesitan un **conjunto de visitados** (temas [[gf-bfs]] y [[gf-dfs]]).

La lista de adyacencia es como una agenda: junto a cada nombre se apuntan sus contactos. La **matriz de adyacencia** es una tabla gigante de «¿se conocen?» con una casilla por cada par de personas, incluso si casi nadie se conoce.`,
    formal: R`
**Grado** de un vértice: número de aristas que le llegan (en un grafo no dirigido, el tamaño de su lista de vecinos).

**Lema del apretón de manos**: en un grafo no dirigido, la suma de los grados es **2·|E|** (cada arista cuenta dos veces).

**Cotas**: un grafo no dirigido sin aristas repetidas tiene a lo sumo §V(V − 1)/2§ aristas; uno **conexo** tiene al menos §V − 1§; un **árbol** tiene exactamente §V − 1§.

| | **Lista de adyacencia** | **Matriz de adyacencia** |
|---|---|---|
| Memoria | **§O(V + E)§** | §O(V²)§ |
| ¿Existe la arista (u, v)? | §O(grado de u)§ | **§O(1)§** |
| Recorrer los vecinos de u | **§O(grado de u)§** | §O(V)§ |
| Conviene cuando | el grafo es **ralo** (E ≪ V²) | el grafo es **denso** o se consultan aristas sueltas |

Las clases de la semana 12 usan siempre la lista de adyacencia.`,
    procedimiento: R`
**Para construir la lista de adyacencia a partir de las aristas:**

1. Crea un diccionario con una lista **vacía** por cada vértice.
2. Para cada arista (u, v): agrega v a la lista de u.
3. Si el grafo es **no dirigido**, agrega también u a la lista de v (la arista va en los dos sentidos).
4. En un grafo ponderado, guarda el peso junto al vecino (diccionario de diccionarios).

**Para comprobar a mano**: la suma de los tamaños de las listas debe ser 2·|E| (no dirigido) o |E| (dirigido).`,
    codigo: [{
      titulo: 'Construir la lista de adyacencia desde una lista de aristas',
      src: R`
def lista_adyacencia(nodos, aristas):
    grafo = {n: [] for n in nodos}
    for u, v in aristas:
        grafo[u].append(v)
        grafo[v].append(u)               # no dirigido: la arista va en los dos sentidos
    return grafo

aristas = [('A', 'B'), ('A', 'C'), ('A', 'D'), ('B', 'E'), ('C', 'F'), ('C', 'G'), ('E', 'F'), ('F', 'G')]
g = lista_adyacencia('ABCDEFG', aristas)
print(g['C'])
print(sum(len(v) for v in g.values()) // 2)
print({n: len(v) for n, v in g.items()}['F'])
`,
      esperado: '[\'A\', \'F\', \'G\']\n8\n3'
    }],
    ejemplo: R`
**El grafo de la clase** (S12-C1, diap. 5-13): 7 vértices y 8 aristas.

~~~python
` + CLASE + R`
~~~

- Los vecinos de **C** son A, F y G: su **grado** es 3.
- Los grados suman 3 + 2 + 3 + 1 + 2 + 3 + 2 = **16 = 2 · 8**: hay 8 aristas.
- Tiene un **ciclo**: A – B – E – F – C – A. Por eso un recorrido necesita saber qué nodos ya visitó.`,
    complejidad: R`
- **Construir** la lista de adyacencia: §O(V + E)§.
- **Memoria**: lista §O(V + E)§; matriz §O(V²)§ (con 10 000 vértices, 10⁸ casillas aunque haya pocas aristas).
- **Recorrer todos los vecinos** de un vértice: §O(grado)§ con lista, §O(V)§ con matriz.
- **Recorrer todo el grafo** con la lista: §O(V + E)§ (tema [[gf-complejidad]]).`,
    errores: R`
- **Olvidar la segunda dirección** al construir un grafo no dirigido: la arista queda a medias y los recorridos se «atascan».
- **Confundir dirigido con no dirigido**: en uno dirigido la suma de grados de salida es §|E|§, no §2|E|§.
- **Usar una matriz de adyacencia en un grafo enorme y ralo**: gasta §O(V²)§ de memoria para nada.
- **Pensar que un árbol y un grafo son cosas distintas**: un árbol es un grafo conexo sin ciclos.
- **Suponer que hay un solo camino entre dos nodos**: con ciclos puede haber muchos.`,
    preguntas: [
      ['Define grafo, grafo dirigido y grafo ponderado.', 'Un grafo es un conjunto de vértices unidos por aristas. Es dirigido si cada arista tiene sentido (u → v) y ponderado si cada arista lleva un peso (distancia, tiempo, costo).'],
      ['¿Qué es una lista de adyacencia y cuánta memoria usa?', 'Para cada vértice, la lista de sus vecinos (en Python, un diccionario de listas). Usa O(V + E) de memoria.'],
      ['¿Cuántas aristas tiene un grafo no dirigido cuyos grados suman 16?', '8: la suma de los grados es 2·|E| porque cada arista cuenta en sus dos extremos.'],
      ['¿Cuándo conviene una matriz de adyacencia en lugar de una lista?', 'Cuando el grafo es denso o hay que consultar muy seguido si existe una arista concreta (O(1)); a cambio ocupa O(V²).']
    ],
    resumen: R`
- **Grafo** = vértices + aristas (dirigido o no, ponderado o no); **árbol** = grafo conexo sin ciclos.
- **Lista de adyacencia**: §O(V + E)§ de memoria; la que usan las clases. **Matriz**: §O(V²)§, consulta §O(1)§.
- En un grafo no dirigido, **suma de grados = 2·|E|**.`
  });

  B.tema({
    id: 'gf-bfs', area: 'gf', titulo: 'BFS: búsqueda en anchura con una cola', fuente: 'S12-C1 · diap. 4-7', nivel: 15,
    conceptos: ['gr_bfs'], lab: [{ tab: 'grafos', e: 'clase.bfs', texto: 'Ver BFS paso a paso en el grafo de la clase' }, { tab: 'grafos', e: 'arbol.bfs', texto: 'BFS en un árbol: por niveles' }, { tab: 'grafos', e: 'laberinto.bfs', texto: 'BFS inundando un laberinto' }], alias: 'busqueda en anchura breadth first queue cola niveles',
    definicion: R`
**BFS** (*breadth-first search*, búsqueda en **anchura**) explora el grafo **nivel por nivel** desde un origen: primero los vecinos a distancia 1, luego los de distancia 2, etc.

Usa una **cola (FIFO)** y un **conjunto de visitados**. Cada nodo se visita **una sola vez**.

Orden BFS del grafo de la clase desde A: **A, B, C, D** (nivel 1), **E, F, G** (nivel 2).`,
    intuicion: R`
Imagina que sueltas una **gota de agua** en un nodo: el agua se extiende **en círculos**, llegando primero a los vecinos, luego a los vecinos de los vecinos. Así explora BFS, y por eso la **pregunta inicial** de la clase se contesta así: para hallar la salida de un laberinto **más cercana**, conviene explorar «todas las casillas a distancia 1, luego a distancia 2…», es decir, BFS.

La **cola** es lo que produce esos círculos: los vecinos se encolan **al final** y los más antiguos (los más cercanos al origen) salen **primero**. Regla mnemotécnica: **cola → BFS → el más cercano primero.**`,
    formal: R`
**Invariante**: cuando BFS desencola un nodo u a distancia d del origen, la cola contiene solo nodos a distancia d o d + 1, y los de distancia d + 1 van **detrás** de los de d. Por eso cada nodo se descubre por primera vez por un camino **con el menor número de aristas**.

**Algoritmo** (marcar al **encolar**):

1. §visitados = {inicio}§, §cola = [inicio]§.
2. Mientras la cola no esté vacía: **desencolar** u y visitarlo.
3. Para cada vecino w de u que no esté en §visitados§: **marcarlo** y **encolarlo**.

Marcar al **desencolar** (en lugar de al encolar) sería un error: un nodo podría entrar a la cola varias veces antes de salir (tema [[gf-complejidad]]).

**Costo**: cada vértice se encola y desencola una vez y cada arista se examina una vez: **§O(V + E)§**.`,
    procedimiento: R`
**Para hacer BFS a mano** (como en las diapositivas 6-13):

1. Dibuja la **cola** y un registro de **visitados**. Encola el origen y márcalo.
2. **Desencola** el nodo del frente: ese es el siguiente en el orden BFS.
3. Mira sus vecinos **en el orden de la lista**: encola los que no estén marcados y márcalos **en ese momento**.
4. Repite hasta que la cola esté vacía.
5. El **orden BFS** es el orden en que se desencolaron los nodos; el **nivel** de un nodo es el del nodo que lo encoló más uno.`,
    codigo: [{
      titulo: 'BFS: orden de visita (código de la clase)',
      src: R`
from collections import deque

def bfs(grafo, inicio):
    visitados = set([inicio])
    cola = deque([inicio])
    orden = []
    while cola:
        u = cola.popleft()               # FIFO: el primero que entro
        orden.append(u)
        for w in grafo[u]:
            if w not in visitados:
                visitados.add(w)         # marcar al encolar evita duplicados
                cola.append(w)
    return orden

` + CLASE + R`
print(bfs(grafo, 'A'))
print(bfs(grafo, 'G'))
`,
      esperado: '[\'A\', \'B\', \'C\', \'D\', \'E\', \'F\', \'G\']\n[\'G\', \'C\', \'F\', \'A\', \'E\', \'B\', \'D\']'
    }, {
      titulo: 'BFS con niveles: la distancia (en aristas) a cada nodo',
      src: R`
from collections import deque

def niveles(grafo, inicio):
    nivel = {inicio: 0}                  # tambien sirve como conjunto de visitados
    cola = deque([inicio])
    while cola:
        u = cola.popleft()
        for w in grafo[u]:
            if w not in nivel:
                nivel[w] = nivel[u] + 1
                cola.append(w)
    return nivel

` + CLASE + R`
print(niveles(grafo, 'A'))
`,
      esperado: '{\'A\': 0, \'B\': 1, \'C\': 1, \'D\': 1, \'E\': 2, \'F\': 2, \'G\': 2}'
    }],
    ejemplo: R`
**BFS desde A en el grafo de la clase** (diap. 6-13): cada paso muestra la cola.

| Paso | Desencola | Encola | Cola después |
|---|---|---|---|
| 1 | — | A (origen) | A |
| 2 | A | B, C, D | B C D |
| 3 | B | E | C D E |
| 4 | C | F, G | D E F G |
| 5 | D | — | E F G |
| 6 | E | — (F ya está marcado) | F G |
| 7 | F | — | G |
| 8 | G | — | vacía |

**Orden BFS: A B C D E F G**, por niveles: {A}, {B, C, D}, {E, F, G}.`,
    complejidad: R`
- **Tiempo**: §O(V + E)§. Cada vértice entra y sale de la cola una vez (§O(V)§) y cada arista se examina una vez desde cada extremo (§O(E)§).
- **Memoria**: §O(V)§ (visitados, cola, y §prev§ si se guarda).
- En una **cuadrícula** de m × n celdas: §O(m × n)§.
- Con una lista de Python como cola (§pop(0)§) cada desencolado sería §O(n)§ y el recorrido §O(V² + E)§: usa **§collections.deque§** (§popleft()§ es §O(1)§).`,
    errores: R`
- **Marcar al desencolar** (no al encolar): un nodo entra varias veces a la cola y se pierde eficiencia.
- **Olvidar el conjunto de visitados**: en un grafo con ciclos el recorrido no termina.
- **Usar una pila en lugar de una cola**: lo que se obtiene es DFS.
- **Usar §list.pop(0)§ como cola**: es §O(n)§; usa §deque§.
- **Creer que BFS da el camino más corto en un grafo con pesos**: solo lo garantiza **sin pesos** (con pesos: Dijkstra, nivel 16).`,
    preguntas: [
      ['¿Qué estructura usa BFS y por qué ese orden de visita?', 'Una cola (FIFO): los nodos más antiguos, que son los más cercanos al origen, salen primero; así se explora por niveles.'],
      ['Da el orden BFS desde A del grafo A–B, A–C, A–D, B–E, C–F, C–G, E–F, F–G (vecinos en orden alfabético).', 'A, B, C, D, E, F, G (A; luego B, C, D; luego E, F, G).'],
      ['¿Por qué se marca el nodo como visitado al encolarlo y no al desencolarlo?', 'Para que no entre varias veces a la cola: dos vecinos podrían encolarlo antes de que se desencole.'],
      ['¿Por qué BFS es O(V + E)?', 'Cada vértice se encola y desencola una sola vez (O(V)) y cada arista se examina una sola vez desde cada extremo (O(E)).']
    ],
    resumen: R`
- **BFS** = **cola** + visitados; explora **por niveles**; cola → el más cercano primero.
- Se marca **al encolar**, no al desencolar.
- Orden de la clase desde A: **A B C D E F G**. Costo **§O(V + E)§**.
- Garantiza el camino con menos aristas **sin pesos** (tema [[gf-camino]]).`
  });

  B.tema({
    id: 'gf-dfs', area: 'gf', titulo: 'DFS: búsqueda en profundidad (pila o recursión)', fuente: 'S12-C1 · diap. 9-10', nivel: 15,
    conceptos: ['gr_dfs'], lab: [{ tab: 'grafos', e: 'clase.dfsRec', texto: 'Ver DFS recursivo paso a paso' }, { tab: 'grafos', e: 'clase.dfsIter', texto: 'Ver el DFS iterativo con su pila' }, { tab: 'grafos', e: 'laberinto.dfsRec', texto: 'DFS recorriendo un laberinto' }], alias: 'busqueda en profundidad depth first pila stack recursion backtracking',
    definicion: R`
**DFS** (*depth-first search*, búsqueda en **profundidad**) avanza **tan lejos como puede** por un camino antes de **retroceder** (*backtracking*).

Usa una **pila (LIFO)** o la **pila de llamadas** (recursión) y un conjunto de visitados.

Orden DFS recursivo del grafo de la clase desde A: **A, B, E, F, C, G, D**.`,
    intuicion: R`
Es **explorar un laberinto con una cuerda**: sigues un pasillo hasta el fondo; si es un callejón sin salida, **retrocedes** hasta la última bifurcación y pruebas otro camino. La cuerda es la **pila**: guarda por dónde volver.

Regla mnemotécnica: **pila → DFS → lo más profundo primero.** Es el mismo recorrido de árboles de la semana 6 (preorden), pero con un conjunto de visitados para no caer en los ciclos.`,
    formal: R`
**Versión recursiva**: §dfs(u)§ marca u, y para cada vecino w no visitado llama §dfs(w)§. La **pila de llamadas** es la pila del recorrido; su profundidad puede llegar a **§O(V)§**.

**Versión iterativa** (diapositiva 16): se apila el origen; mientras haya pila se **desapila** u; si ya estaba visitado se **descarta**; si no, se visita y se apilan sus vecinos no visitados. Un mismo nodo puede estar **varias veces** en la pila.

**Diferencia de orden**: la versión iterativa, al apilar los vecinos en el orden de la lista, visita **primero al último** vecino. Para obtener el **mismo orden que la recursiva** hay que apilar al revés (§reversed(grafo[u])§).

**Costo**: cada vértice se visita una vez y cada arista se examina una vez: **§O(V + E)§**.`,
    procedimiento: R`
**Para hacer DFS recursivo a mano** (diapositivas 17-24):

1. Visita el origen: queda en la pila de llamadas.
2. Del nodo actual, baja al **primer vecino no visitado** de su lista.
3. Si el nodo actual **no tiene vecinos nuevos**, la rama está agotada: **retrocede** al nodo anterior y sigue con su siguiente vecino.
4. Termina cuando la pila de llamadas queda vacía.

El **orden DFS** es el orden en que se **visita** cada nodo al entrar.`,
    codigo: [{
      titulo: 'DFS recursivo e iterativo (código de la clase)',
      src: R`
def dfs_recursivo(grafo, u, visitados=None):
    if visitados is None:
        visitados = []
    visitados.append(u)                  # visitar u
    for w in grafo[u]:
        if w not in visitados:
            dfs_recursivo(grafo, w, visitados)
    return visitados

def dfs_iterativo(grafo, inicio):
    visitados, pila = [], [inicio]
    while pila:
        u = pila.pop()                   # LIFO: el ultimo que entro
        if u in visitados:
            continue
        visitados.append(u)
        for w in grafo[u]:
            if w not in visitados:
                pila.append(w)
    return visitados

def dfs_iterativo_igual(grafo, inicio):
    visitados, pila = [], [inicio]
    while pila:
        u = pila.pop()
        if u in visitados:
            continue
        visitados.append(u)
        for w in reversed(grafo[u]):     # al reves: sale primero el 1.er vecino
            if w not in visitados:
                pila.append(w)
    return visitados

` + CLASE + R`
print(dfs_recursivo(grafo, 'A'))
print(dfs_iterativo(grafo, 'A'))
print(dfs_iterativo_igual(grafo, 'A'))
`,
      esperado: '[\'A\', \'B\', \'E\', \'F\', \'C\', \'G\', \'D\']\n[\'A\', \'D\', \'C\', \'G\', \'F\', \'E\', \'B\']\n[\'A\', \'B\', \'E\', \'F\', \'C\', \'G\', \'D\']'
    }],
    ejemplo: R`
**DFS recursivo desde A en el grafo de la clase** (diap. 17-24):

| Paso | Qué ocurre | Pila de llamadas |
|---|---|---|
| 1 | visitar A | A |
| 2 | A baja al primer vecino, B | A B |
| 3 | B baja a E | A B E |
| 4 | E baja a F | A B E F |
| 5 | F baja a C | A B E F C |
| 6 | C baja a G | A B E F C G |
| 7 | G no tiene vecinos nuevos: se retrocede hasta A y se visita D | A D |
| 8 | D agotado, A agotado | vacía |

**Orden DFS: A B E F C G D.** El iterativo de la diapositiva 16, sin invertir, da **A D C G F E B**: otro orden válido, porque sale primero el último vecino apilado.`,
    complejidad: R`
- **Tiempo**: §O(V + E)§, igual que BFS.
- **Memoria**: §O(V)§: el conjunto de visitados y la pila (o la profundidad de la recursión, hasta §V§ en el peor caso).
- **Riesgo de la recursión**: con islas o grafos enormes la profundidad puede superar el límite de Python (§RecursionError§): por eso se prefiere la versión **iterativa** o BFS.
- Usar una **lista** como conjunto de visitados (§w not in visitados§) cuesta §O(V)§ por consulta; en código serio se usa un §set§ (aquí se usa lista solo para conservar el orden al imprimir).`,
    errores: R`
- **Olvidar el conjunto de visitados**: con un ciclo el recorrido no termina.
- **Creer que DFS halla el camino más corto**: baja al fondo por el primer camino que encuentra; solo BFS lo garantiza (sin pesos).
- **Usar DFS recursivo en grafos enormes**: desborda la pila de llamadas.
- **Esperar que el iterativo dé el mismo orden que el recursivo** sin apilar al revés.
- **Visitar al apilar en lugar de al desapilar** en la versión iterativa: cambia el orden y la «visita» deja de coincidir con la del recursivo.`,
    preguntas: [
      ['¿Qué estructura usa DFS y qué orden de visita produce?', 'Una pila (o la pila de llamadas de la recursión): baja por un camino hasta el fondo y retrocede al agotarlo; lo más profundo primero.'],
      ['Da el orden DFS recursivo desde A del grafo A–B, A–C, A–D, B–E, C–F, C–G, E–F, F–G (vecinos en orden alfabético).', 'A, B, E, F, C, G, D.'],
      ['¿Por qué el DFS iterativo con pila.append(w) puede dar un orden distinto al recursivo?', 'Porque al apilar los vecinos en orden, el último queda en el tope y se visita primero; apilando con reversed(...) coincide con el recursivo.'],
      ['¿Qué riesgo tiene el DFS recursivo en grafos muy grandes y cómo se evita?', 'Desborda la pila de llamadas (profundidad hasta V); se evita con la versión iterativa o con BFS.']
    ],
    resumen: R`
- **DFS** = **pila** (o recursión) + visitados; baja hasta el fondo y **retrocede**.
- Orden de la clase desde A: **A B E F C G D**. Costo **§O(V + E)§**.
- El iterativo sin invertir visita primero al **último** vecino; con §reversed§ coincide con el recursivo.
- **No** garantiza el camino más corto; la recursión puede **desbordar** la pila.`
  });

  B.tema({
    id: 'gf-vs', area: 'gf', titulo: 'BFS frente a DFS: cuál usar', fuente: 'S12-C1 · diap. 11, 13-14', nivel: 15,
    conceptos: ['gr_vs'], lab: [{ tab: 'grafos', e: 'laberinto.bfs.dfsRec', texto: 'Carrera: BFS contra DFS en un laberinto' }, { tab: 'grafos', e: 'calles.bfs.dfsRec', texto: 'Carrera en un mapa de calles' }, { tab: 'grafos', e: 'arbol.bfs.dfsRec', texto: 'En un árbol: niveles contra preorden' }], alias: 'comparacion elegir cola pila camino mas corto',
    definicion: R`
BFS y DFS recorren el mismo grafo con la **misma complejidad** (§O(V + E)§) pero en **distinto orden**, y eso decide para qué sirve cada uno:

| | **BFS** (anchura) | **DFS** (profundidad) |
|---|---|---|
| Estructura | **Cola** (FIFO) | **Pila** (LIFO) o recursión |
| Explora | **Nivel por nivel** | **Un camino hasta el fondo** |
| Complejidad | §O(V + E)§ | §O(V + E)§ |
| ¿Camino más corto (sin pesos)? | **Sí** | **No** |
| Usos típicos | distancia mínima, niveles | ciclos, componentes, *backtracking* |

**Regla mnemotécnica**: **cola → BFS → el más cercano primero. Pila → DFS → lo más profundo primero.**`,
    intuicion: R`
Pregunta de la clase: para explorar un laberinto desde la entrada, ¿avanzarías por un camino hasta el fondo y retrocederías al chocar (**profundidad**), o explorarías todas las casillas a distancia 1, luego a distancia 2, etc. (**anchura**)? ¿Cuál **garantiza** encontrar la salida **más cercana** primero? **La anchura.**

DFS puede tener suerte y llegar rápido, pero también puede dar una vuelta enorme antes de llegar: en el Laboratorio verás en un laberinto que el camino de DFS es mucho más largo que el de BFS, aunque DFS a veces explora menos celdas.

Es **el mismo recorrido de árboles de la semana 6** (BFS = por niveles, DFS = preorden), ahora con un conjunto de visitados por los ciclos.`,
    formal: R`
**BFS** minimiza el número de aristas porque descubre cada nodo por el camino más corto (tema [[gf-bfs]]). **DFS** solo garantiza **alcanzabilidad**: si hay un camino de u a v, DFS lo encontrará, pero no necesariamente el más corto.

**Elegir según el problema** (diapositiva 13, «¿BFS o DFS?»):

1. **Mínimo de saltos** entre dos personas en una red social → **BFS**.
2. **Detectar si un grafo de dependencias tiene un ciclo** → **DFS** (recuerda el camino actual y detecta cuándo vuelve a un nodo de él).
3. **Cualquier camino** entre dos nodos (no necesariamente el más corto) → **cualquiera de los dos**.
4. **Árbol de decisiones de un juego con backtracking** → **DFS**.`,
    procedimiento: R`
**Para decidir entre BFS y DFS:**

1. ¿Piden «**el más corto**», «**mínimo número de pasos**» o «**el más cercano**»? → **BFS**.
2. ¿Piden «**explorar todas las posibilidades**», «**retroceder**» o «**detectar ciclos**»? → **DFS**.
3. ¿Solo piden «**si existe un camino**», contar **componentes** o **islas**? → cualquiera.
4. ¿El grafo es **enorme** y la recursión podría desbordar la pila? → **BFS** o **DFS iterativo**.`,
    codigo: [{
      titulo: 'El mismo grafo, dos caminos: BFS halla el más corto, DFS no',
      src: R`
from collections import deque

def camino_bfs(grafo, s, t):
    prev = {s: None}
    cola = deque([s])
    while cola:
        u = cola.popleft()
        for w in grafo[u]:
            if w not in prev:
                prev[w] = u
                cola.append(w)
    return armar(prev, t)

def camino_dfs(grafo, s, t):
    prev = {s: None}
    def bajar(u):
        for w in grafo[u]:
            if w not in prev:
                prev[w] = u
                bajar(w)
    bajar(s)
    return armar(prev, t)

def armar(prev, t):
    camino = []
    while t is not None:
        camino.append(t)
        t = prev[t]
    return camino[::-1]

` + CLASE + R`
print(camino_bfs(grafo, 'A', 'G'))
print(camino_dfs(grafo, 'A', 'G'))
`,
      esperado: '[\'A\', \'C\', \'G\']\n[\'A\', \'B\', \'E\', \'F\', \'C\', \'G\']'
    }],
    ejemplo: R`
**Pregunta de análisis (1) de la clase**, resuelta:

1. *Mínimo de saltos entre dos personas en una red social*: **BFS** (garantiza el camino con menos aristas; es el «seis grados de separación»).
2. *Detectar si un grafo de dependencias tiene un ciclo*: **DFS** (si desde un nodo se vuelve a uno que sigue en la pila de llamadas, hay un ciclo).
3. *Encontrar cualquier camino entre dos nodos*: **cualquiera** (los dos lo hallan si existe).
4. *Recorrer un árbol de decisiones con backtracking*: **DFS** (baja hasta el fondo y retrocede al fallar).

Y con el grafo de la clase, de A a G: BFS da **A → C → G** (2 aristas); DFS da **A → B → E → F → C → G** (5 aristas).`,
    complejidad: R`
- **Tiempo**: los dos §O(V + E)§.
- **Memoria**: BFS guarda la **frontera** (en un grafo ancho puede llegar a §O(V)§ nodos a la vez); DFS guarda el **camino actual** (en un grafo profundo también §O(V)§). En un laberinto, BFS suele guardar muchas celdas a la vez y DFS una cadena larga.
- **Camino hallado**: BFS = mínimo número de aristas; DFS = cualquiera (en el peor caso, el más largo).`,
    errores: R`
- **Creer que DFS halla el camino más corto**: solo BFS lo garantiza (sin pesos).
- **Elegir BFS para detectar ciclos o hacer backtracking** cuando lo natural es DFS.
- **Pensar que uno es más rápido que el otro** en el peor caso: los dos son §O(V + E)§.
- **Usar cualquiera de los dos para caminos de menor costo con pesos**: ni BFS ni DFS sirven; hace falta Dijkstra (nivel 16).`,
    preguntas: [
      ['Completa: «BFS usa una ___ y explora ___; DFS usa una ___ y explora ___».', 'BFS usa una cola y explora nivel por nivel; DFS usa una pila (o recursión) y explora un camino hasta el fondo.'],
      ['¿Cuál de los dos garantiza el camino más corto en un grafo sin pesos y por qué?', 'BFS: explora por niveles, así que descubre cada nodo por primera vez por el camino con menos aristas. DFS puede llegar por un camino larguísimo.'],
      ['Para cada tarea elige BFS o DFS: (a) mínimo de saltos entre dos personas, (b) detectar un ciclo de dependencias, (c) backtracking en un juego.', '(a) BFS; (b) DFS; (c) DFS.'],
      ['¿Qué complejidad tienen y qué los diferencia?', 'Los dos O(V + E); los diferencia la estructura (cola o pila) y por tanto el orden de exploración y el camino que encuentran.']
    ],
    resumen: R`
- **Cola → BFS → el más cercano primero** (camino más corto sin pesos). **Pila → DFS → lo más profundo primero** (ciclos, componentes, backtracking).
- Los dos son **§O(V + E)§** y necesitan **visitados** por los ciclos.
- Mismo recorrido de árboles de la semana 6 (niveles y preorden), ahora con ciclos.`
  });

  B.tema({
    id: 'gf-camino', area: 'gf', titulo: 'Camino más corto sin pesos con BFS (prev)', fuente: 'S12-C1 · diap. 8', nivel: 15,
    conceptos: ['gr_camino'], lab: [{ tab: 'grafos', e: 'red.bfs', texto: 'Grados de separación en una red social' }, { tab: 'grafos', e: 'laberinto.bfs', texto: 'El camino más corto de un laberinto' }, { tab: 'grafos', e: 'calles.bidir.bfs', texto: 'BFS bidireccional contra BFS en un mapa' }], alias: 'prev predecesor reconstruir camino saltos grados de separacion',
    definicion: R`
Para recuperar el **camino** (y no solo la distancia), BFS guarda en §prev[v]§ **desde qué nodo se llegó** a §v§. Luego se sigue §prev§ **hacia atrás** desde el destino hasta el origen y se **invierte** la lista.

Como BFS descubre cada nodo por primera vez por el camino con **menos aristas**, el camino reconstruido es el **más corto en número de saltos** (solo en grafos **sin pesos**). Si origen y destino no están conectados, el resultado es §[]§.`,
    intuicion: R`
Es **dejar migas de pan**: al llegar a un nodo por primera vez, apuntas «vine desde X». Al llegar al destino, sigues las migas hacia atrás hasta el origen y las lees al revés.

En una red social, BFS desde una persona calcula los **grados de separación**: los amigos están a 1, los amigos de amigos a 2, etc.`,
    formal: R`
**Árbol de BFS**: las aristas (§prev[v]§, §v§) forman un **árbol** que contiene un camino más corto desde el origen a cada nodo alcanzable. El **nivel** de v es el número de aristas de ese camino.

**Reconstrucción** (diapositiva 8):

~~~python
camino, at = [], e
while at is not None:       # de e hacia atras siguiendo prev
    camino.append(at); at = prev[at]
camino.reverse()
return camino if camino[0] == s else []   # [] si s y e no conectan
~~~

La comprobación §camino[0] == s§ detecta el caso en que el destino nunca fue alcanzado (su cadena de §prev§ termina en otro nodo).`,
    procedimiento: R`
**Para hallar el camino más corto a mano:**

1. Haz BFS desde el origen anotando, **al encolar** cada nodo, su predecesor (§prev§).
2. Detén la búsqueda cuando el destino salga de la cola (o cuando se encole).
3. Parte del destino y **sigue §prev§** hasta el origen.
4. **Invierte** el orden para leer el camino de ida y cuenta las aristas.`,
    codigo: [{
      titulo: 'BFS con prev y reconstrucción del camino (diap. 15)',
      src: R`
from collections import deque

def solve(g, s, n):
    cola = deque([s]); visitado = [False] * n; visitado[s] = True
    prev = [None] * n
    while cola:
        nodo = cola.popleft()
        for sig in g[nodo]:
            if not visitado[sig]:
                cola.append(sig); visitado[sig] = True
                prev[sig] = nodo         # llegue a 'sig' desde 'nodo'
    return prev

def reconstruir_camino(s, e, prev):
    camino, at = [], e
    while at is not None:                # de 'e' hacia atras siguiendo prev
        camino.append(at); at = prev[at]
    camino.reverse()
    return camino if camino[0] == s else []   # [] si s y e no conectan

# nodos 0..6 = A..G del grafo de la clase
g = [[1, 2, 3], [0, 4], [0, 5, 6], [0], [1, 5], [2, 4, 6], [2, 5]]
prev = solve(g, 0, 7)
print(prev)
print(reconstruir_camino(0, 6, prev))
print(len(reconstruir_camino(0, 4, prev)) - 1)
`,
      esperado: '[None, 0, 0, 0, 1, 2, 2]\n[0, 2, 6]\n2'
    }],
    ejemplo: R`
**De A a G en el grafo de la clase** (nodos 0 a 6 = A a G):

1. BFS llena §prev§: B, C y D llegaron desde A; E desde B; F y G desde C.
2. Desde el destino G: §prev[G] = C§, §prev[C] = A§, §prev[A] = None§.
3. Camino al revés: G, C, A. Invertido: **A → C → G**, con **2 aristas**.

De A a E: §prev[E] = B§, §prev[B] = A§ → **A → B → E** (2 aristas). Observa que aunque E–F–C–A también conecta, es más largo (3 aristas).`,
    complejidad: R`
- **BFS con §prev§**: §O(V + E)§ de tiempo y §O(V)§ de memoria.
- **Reconstruir** el camino: §O(longitud del camino)§ ≤ §O(V)§.
- Si solo hace falta la **distancia**, basta un diccionario de niveles; §prev§ añade lo necesario para el camino.`,
    errores: R`
- **Guardar §prev§ al desencolar** en vez de al encolar: puede quedar un predecesor que no es el del camino más corto.
- **Olvidar invertir** el camino: sale del destino al origen.
- **No comprobar el caso sin camino**: sin la prueba §camino[0] == s§ se devuelve un camino falso.
- **Usar DFS para este fin** esperando el camino más corto.
- **Usarlo con pesos**: BFS mide saltos, no pesos (para eso, Dijkstra).`,
    preguntas: [
      ['¿Para qué sirve el arreglo prev en BFS?', 'Guarda desde qué nodo se llegó a cada nodo; al terminar se sigue hacia atrás desde el destino para reconstruir el camino.'],
      ['¿Por qué el camino que reconstruye BFS es el más corto?', 'Porque BFS descubre cada nodo por primera vez por el camino con menos aristas; el predecesor guardado es el de ese primer descubrimiento.'],
      ['¿Qué devuelve reconstruir_camino si el destino no es alcanzable y cómo lo detecta?', 'Una lista vacía; lo detecta porque la cadena de prev del destino no llega al origen (camino[0] != s).'],
      ['¿Sirve BFS para el camino de menor costo en un grafo ponderado?', 'No: minimiza el número de aristas, no la suma de pesos; para eso se usa Dijkstra.']
    ],
    resumen: R`
- §prev[v]§ = desde qué nodo se llegó a §v§ (al **encolar**).
- Sigue §prev§ **hacia atrás** desde el destino y **invierte**; devuelve §[]§ si no hay camino.
- BFS da el camino con **menos aristas** (sin pesos); DFS no.`
  });

  B.tema({
    id: 'gf-islas', area: 'gf', titulo: 'Contar islas y componentes con BFS o DFS', fuente: 'S12-C1 · diap. 12, 14', nivel: 15,
    conceptos: ['gr_islas'], lab: [{ tab: 'grafos', e: 'islas.islasBfs', texto: 'Contar islas con BFS' }, { tab: 'grafos', e: 'islas.islasBfs.islasDfs', texto: 'BFS contra DFS contando islas' }], alias: 'numero de islas componentes conexas cuadricula flood fill inundacion',
    definicion: R`
**Número de islas**: dada una cuadrícula de **1 (tierra)** y **0 (agua)**, contar las **islas** (grupos de celdas de tierra conectadas por arriba, abajo, izquierda y derecha).

**Estrategia (O(m × n))**: recorrer cada celda; al encontrar **tierra no visitada**, lanzar un **BFS o DFS que marca toda su isla** y **sumar 1** al contador. Cada celda se visita **una vez**.

Es lo mismo que contar las **componentes conexas** de un grafo: lanzar un recorrido desde cada nodo no visitado.`,
    intuicion: R`
Es **pintar con el bote de pintura de un editor de imágenes**: cuando encuentras un píxel de tierra sin pintar, echas un bote de pintura nuevo y se pinta **toda** la isla de un golpe; cada bote es una isla.

La cuadrícula es un grafo **implícito**: cada celda es un nodo y sus vecinas de tierra son sus aristas. No hace falta construir la lista de adyacencia.

**Por qué BFS iterativo**: con islas enormes, la recursión de DFS puede **desbordar la pila**; el BFS con cola lo evita.`,
    formal: R`
**Grafo implícito**: V = celdas de tierra; hay arista entre dos celdas de tierra **adyacentes** (4 vecinos: §(±1, 0)§ y §(0, ±1)§). Una **isla** es una componente conexa de ese grafo.

**Corrección**: el contador sube exactamente una vez por componente, porque el recorrido marca **toda** la componente antes de seguir barriendo; las demás celdas de ella se saltan por estar visitadas.

**Costo**: el barrido visita §m·n§ celdas y cada celda de tierra entra una vez a la cola o pila y mira 4 vecinas: **§O(m × n)§** de tiempo y **§O(m × n)§** de memoria (matriz de visitados y frontera).

Con 8 vecinas (diagonales) las islas pueden unirse: es una variante común (**complemento**), cambia solo la lista de movimientos.`,
    procedimiento: R`
**Para contar islas a mano:**

1. Recorre la cuadrícula **fila por fila**.
2. Al encontrar un **1** que no esté marcado: **cuenta una isla** y márcala entera (BFS o DFS desde esa celda).
3. Sigue barriendo: las celdas ya marcadas se saltan.
4. El contador final es el número de islas.

**Para componentes conexas de un grafo**: igual, con una lista de visitados por vértice.`,
    codigo: [{
      titulo: 'Número de islas con BFS iterativo',
      src: R`
from collections import deque

def contar_islas(m):
    filas, cols = len(m), len(m[0])
    visto = [[False] * cols for _ in range(filas)]
    islas = 0
    for r in range(filas):
        for c in range(cols):
            if m[r][c] == 1 and not visto[r][c]:
                islas += 1               # tierra nueva: una isla mas
                visto[r][c] = True
                cola = deque([(r, c)])
                while cola:              # BFS: marca toda la isla
                    f, k = cola.popleft()
                    for df, dk in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nf, nk = f + df, k + dk
                        if 0 <= nf < filas and 0 <= nk < cols and m[nf][nk] == 1 and not visto[nf][nk]:
                            visto[nf][nk] = True
                            cola.append((nf, nk))
    return islas

mapa = [[1, 1, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 0, 1]]
print(contar_islas(mapa))
print(contar_islas([[1, 0, 1], [0, 1, 0], [1, 0, 1]]))
print(contar_islas([[0, 0], [0, 0]]))
`,
      esperado: '2\n5\n0'
    }],
    ejemplo: R`
**La cuadrícula de la diapositiva 12** (3 × 4; tierra en verde): tierra en (0,0), (0,1) y (2,3).

1. Al barrer, (0,0) es tierra sin visitar: **isla 1**; el recorrido marca también (0,1).
2. (0,1) ya está marcada; el resto de la fila 0 y la fila 1 son agua.
3. En la fila 2, (2,3) es tierra sin visitar: **isla 2**.

Hay **2 islas**. En el tablero [[1,0,1],[0,1,0],[1,0,1]] las cinco celdas se tocan solo por las esquinas: con 4 vecinas son **5 islas**.`,
    complejidad: R`
- **Tiempo**: §O(m × n)§: cada celda se visita una vez (el barrido) y cada celda de tierra se procesa una vez en el recorrido.
- **Memoria**: §O(m × n)§ para la matriz de visitados; la cola de BFS guarda a lo sumo una «frontera» (§O(min(m, n))§ en cuadrículas anchas, hasta §O(m × n)§ en el peor caso).
- DFS recursivo: la pila de llamadas puede llegar a §O(m × n)§ en una isla en forma de serpiente.`,
    errores: R`
- **Lanzar el recorrido desde cada celda de tierra**, incluso ya visitada: se cuentan islas de más.
- **Olvidar marcar la celda al encolarla**: entra varias veces a la cola.
- **Contar las diagonales** cuando el enunciado dice «arriba, abajo, izquierda y derecha».
- **No revisar los límites** antes de mirar §m[nf][nk]§ (los índices negativos de Python «dan la vuelta»).
- **Usar DFS recursivo en islas enormes**: desborda la pila.`,
    preguntas: [
      ['Describe cómo BFS o DFS cuenta el número de islas.', 'Se recorre cada celda; al encontrar tierra no visitada se suma 1 y se lanza un recorrido que marca toda su isla. Cada celda se visita una vez: O(m × n).'],
      ['¿Por qué se prefiere BFS iterativo con islas enormes?', 'Porque la recursión de DFS puede desbordar la pila de llamadas; el BFS con cola no usa recursión.'],
      ['¿Qué relación hay entre contar islas y contar componentes conexas?', 'Es lo mismo: la cuadrícula es un grafo y cada isla es una componente conexa; se lanza un recorrido desde cada nodo no visitado.'],
      ['¿Cuántas islas tiene [[1,1,0],[0,1,0],[0,0,1]] con 4 vecinas?', '2: la de tres celdas en forma de L y la celda de la esquina inferior derecha (solo toca por diagonal).']
    ],
    resumen: R`
- **Barrer** la cuadrícula; en tierra **no visitada**: **+1 isla** y **marcar toda** la isla con BFS/DFS.
- Cada celda se visita **una vez**: **§O(m × n)§**. Es contar **componentes conexas**.
- **BFS iterativo** evita desbordar la pila de la recursión.`
  });

  B.tema({
    id: 'gf-complejidad', area: 'gf', titulo: 'Complejidad O(V + E) y errores frecuentes en BFS y DFS', fuente: 'S12-C1 · diap. 7, 14-15, 30', nivel: 15,
    conceptos: ['gr_cx'], lab: [{ tab: 'grafos', e: 'aleatorio.bfs.dfsRec', texto: 'Comparar cuántos nodos explora cada recorrido' }], alias: 'o(v+e) errores frecuentes visitados desbordar pila',
    definicion: R`
BFS y DFS son **§O(V + E)§**: cada **vértice** se procesa una vez (§O(V)§) y cada **arista** se examina una vez (§O(E)§; en un grafo no dirigido, desde cada uno de sus dos extremos). La memoria extra es §O(V)§.

**Errores frecuentes** (diapositiva 15):

- **Olvidar el conjunto de visitados**: en grafos con ciclos, el recorrido no termina.
- **Marcar visitado al desencolar** en BFS: un nodo entra varias veces y se pierde eficiencia.
- **Creer que DFS halla el camino más corto**: solo BFS lo garantiza (sin pesos).
- **Usar DFS recursivo en grafos enormes** y desbordar la pila: preferir la versión iterativa.`,
    intuicion: R`
La cuenta es como **repartir correo**: visitas cada casa (vértice) una sola vez y recorres cada calle (arista) una sola vez. No hay un «por cada casa, todas las calles»: eso sería §V · E§ y no ocurre, gracias al conjunto de visitados.

Los errores frecuentes son **olvidos de esa buena contabilidad**: sin visitados se repite trabajo (o no se termina); marcando tarde se encola de más; la recursión profunda gasta la memoria de la pila.`,
    formal: R`
**Demostración de §O(V + E)§ para BFS** (lista de adyacencia):

- Cada vértice se **encola a lo sumo una vez** (solo si no estaba marcado): §O(V)§ operaciones de cola.
- Al **desencolar** u se recorre su lista de vecinos: §O(grado(u))§. La suma de los grados es §2E§ (no dirigido) o §E§ (dirigido): §O(E)§.
- Total: §O(V + E)§. Con una **matriz** de adyacencia recorrer los vecinos de u cuesta §O(V)§ y el total sube a **§O(V²)§**.

**DFS**: igual, con la pila (o las llamadas) en lugar de la cola.

**Cuadrículas**: §V = m·n§ y §E ≤ 2·m·n§, luego §O(m × n)§.`,
    procedimiento: R`
**Para razonar el costo de un recorrido:**

1. Cuenta cuántas veces entra cada nodo a la cola/pila: **una** (si se marca al encolar).
2. Suma el trabajo de recorrer las listas de vecinos: la suma de grados, **§O(E)§**.
3. Suma ambos: **§O(V + E)§**.
4. Si el grafo está en una matriz o se usa §list.pop(0)§ como cola, anota el costo extra.

**Para depurar un recorrido que no termina o va lento**: revisa (a) ¿hay conjunto de visitados?, (b) ¿se marca al encolar?, (c) ¿la cola es un §deque§?`,
    codigo: [{
      titulo: 'Contar el trabajo real de un BFS: nodos y aristas examinadas',
      src: R`
from collections import deque

def bfs_contando(grafo, inicio):
    visitados = set([inicio])
    cola = deque([inicio])
    nodos, aristas = 0, 0
    while cola:
        u = cola.popleft()
        nodos += 1                       # cada vertice se procesa una vez
        for w in grafo[u]:
            aristas += 1                 # cada arista se examina desde cada extremo
            if w not in visitados:
                visitados.add(w)
                cola.append(w)
    return nodos, aristas

` + CLASE + R`
print(bfs_contando(grafo, 'A'))
print(sum(len(v) for v in grafo.values()))
`,
      esperado: '(7, 16)\n16'
    }],
    ejemplo: R`
**Con el grafo de la clase** (V = 7, E = 8): BFS procesa **7** vértices y examina **16** aristas (2·E, una por cada extremo): en total del orden de 7 + 16 operaciones, no 7 × 8.

**Un grafo grande**: V = 1 000 y E = 4 500 → BFS hace del orden de 1 000 + 9 000 = 10 000 pasos; con una matriz de adyacencia serían del orden de 1 000² = 10⁶.

**Error de marcado**: si en el grafo de la clase se marcara al **desencolar**, el nodo F podría entrar dos veces (desde C y desde E) antes de procesarse.`,
    complejidad: R`
| Recorrido | Tiempo | Memoria extra |
|---|---|---|
| BFS con lista de adyacencia | **§O(V + E)§** | §O(V)§ |
| DFS con lista de adyacencia | **§O(V + E)§** | §O(V)§ |
| BFS o DFS con matriz de adyacencia | §O(V²)§ | §O(V)§ |
| Contar islas en m × n | **§O(m × n)§** | §O(m × n)§ |
| BFS con §list.pop(0)§ como cola | §O(V² + E)§ | §O(V)§ |`,
    errores: R`
- **Sin conjunto de visitados** → con ciclos no termina.
- **Marcar al desencolar** → nodos repetidos en la cola.
- **DFS recursivo en grafos enormes** → §RecursionError§.
- **Pensar que es §O(V · E)§**: el trabajo se reparte, cada arista se mira una vez.
- **Usar una lista como cola**: §pop(0)§ desplaza todo (§O(n)§).`,
    preguntas: [
      ['Justifica por qué BFS y DFS son O(V + E).', 'Cada vértice entra una vez a la cola o pila (O(V)) y, al procesarlo, se recorre su lista de vecinos; la suma de los tamaños de las listas es O(E).'],
      ['Menciona dos errores frecuentes al implementar BFS.', 'Olvidar el conjunto de visitados (no termina con ciclos) y marcar al desencolar en vez de al encolar (un nodo entra varias veces).'],
      ['¿Qué pasa con la complejidad si el grafo se guarda en una matriz de adyacencia?', 'Recorrer los vecinos de cada vértice cuesta O(V) y el total pasa a O(V²).'],
      ['¿Cuántas aristas examina BFS en el grafo de la clase y por qué?', '16: la suma de los grados, porque en un grafo no dirigido cada una de las 8 aristas se examina desde sus dos extremos.']
    ],
    resumen: R`
- **§O(V + E)§** de tiempo y **§O(V)§** de memoria: cada vértice y cada arista, **una vez**.
- Errores: **sin visitados**, marcar **al desencolar**, creer que **DFS** da el camino más corto, **recursión** en grafos enormes.
- Con matriz: §O(V²)§; con §pop(0)§ como cola: §O(V² + E)§.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
