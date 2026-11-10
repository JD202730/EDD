/* teoria_cm.js — Biblioteca: área Caminos mínimos: Dijkstra y A* (fuente: S12-C2, Clase2_CaminosMinimos, 36 diapositivas).
   Incluye Bellman-Ford y Floyd-Warshall (diap. 25-28) y la comparación de los cuatro algoritmos.
   Contenido complementario: la versión de Dijkstra con heap y entradas obsoletas, los datos de costo y la demostración de por qué falla con pesos negativos. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;
  /* grafo de la clase (S12-C2 diap. 16): las claves en este orden desempatan como en la clase */
  const GP1 = R`GP1 = {'S': {'A': 5, 'B': 9, 'C': 6, 'D': 6}, 'A': {'S': 5, 'G': 9, 'B': 3}, 'G': {'A': 9}, 'B': {'S': 9, 'A': 3, 'C': 1, 'I': 7}, 'C': {'S': 6, 'B': 1, 'I': 5, 'F': 7, 'D': 2}, 'I': {'B': 7, 'C': 5, 'F': 8, 'X': 3}, 'F': {'C': 7, 'D': 2, 'I': 8}, 'D': {'S': 6, 'C': 2, 'F': 2, 'E': 2}, 'X': {'I': 3, 'E': 3}, 'E': {'D': 2, 'X': 3}}`;
  const TRUEQUE = R`graph = {'Audifonos': {'Tarjeta': 5, 'Stickers': 0}, 'Tarjeta': {'Reloj': 15, 'Tableta': 20}, 'Stickers': {'Reloj': 30, 'Tableta': 35}, 'Reloj': {'PC': 20}, 'Tableta': {'PC': 10}, 'PC': {}}`;
  const DIJKSTRA = R`
def find_lowest_cost_node(costs, processed):
    lowest, best = float("inf"), None
    for node in costs:                   # recorre todos los nodos
        if costs[node] < lowest and node not in processed:
            lowest, best = costs[node], node
    return best

def dijkstra(graph, inicio):
    costs = {n: float("inf") for n in graph}     # distancia conocida
    parents = {n: None for n in graph}           # para reconstruir
    costs[inicio] = 0
    processed = []
    node = find_lowest_cost_node(costs, processed)
    while node is not None:              # el no procesado mas barato
        for vecino, peso in graph[node].items():
            nuevo = costs[node] + peso
            if nuevo < costs[vecino]:
                costs[vecino] = nuevo
                parents[vecino] = node
        processed.append(node)
        node = find_lowest_cost_node(costs, processed)
    return costs, parents
`;

  B.tema({
    id: 'cm-problema', area: 'cm', titulo: 'El problema del camino mínimo: pesos, relajación y predecesores', fuente: 'S12-C2 · diap. 4-6, 17', nivel: 16,
    conceptos: ['cm_def', 'cm_relaj'], lab: [{ tab: 'caminos', e: 's12.bfs.dijkstra', texto: 'BFS contra Dijkstra en un grafo con pesos' }, { tab: 'caminos', e: 'ciudades', texto: 'Caminos mínimos en un mapa de ciudades' }], alias: 'grafo ponderado peso camino minimo relajacion predecesor costo distancia',
    definicion: R`
En un **grafo ponderado** cada arista tiene un **peso** w (distancia, tiempo, costo). El **camino mínimo** entre dos nodos es el camino cuya **suma de pesos** es menor.

**BFS no sirve aquí**: cuenta **saltos**, no pesos. Necesitamos algoritmos que **sumen** los pesos.

La operación básica es la **relajación**: **si d(v) > d(u) + w(u, v), entonces d(v) ← d(u) + w(u, v)**. Se guarda además el **predecesor** de v (§parents[v] = u§) para **reconstruir el camino** al final.`,
    intuicion: R`
Pregunta de la clase: en un mapa, ir por **3 calles cortas** puede ser más rápido que por **1 autopista larga**. BFS, que solo cuenta calles, elegiría la autopista (1 arista) aunque tarde más. Lo que importa es el **costo total**.

Relajar es **comprobar si hay un atajo**: «¿llegar a v pasando por u me sale más barato de lo que ya conocía?». Si sí, apuntas el nuevo costo y que **vienes desde u**. Al principio no conoces ningún camino: todos los costos son **∞** (salvo el origen, con 0), así que cualquier camino encontrado mejora.`,
    formal: R`
**Notación**: §d(v)§ es el **menor costo conocido** de origen a v; §w(u, v)§ el peso de la arista; §parents[v]§ el predecesor de v en el mejor camino conocido.

**Inicialización**: §d(origen) = 0§ y §d(v) = ∞§ para los demás; §parents[v] = None§.

**Relajación** de la arista (u, v):

~~~
si d(v) > d(u) + w(u, v):
    d(v) <- d(u) + w(u, v)
    parents[v] <- u
~~~

**Propiedad**: tras relajar, §d(v) ≤ d(u) + w(u, v)§. Un valor §d(v)§ nunca baja de la distancia mínima real: solo desciende hacia ella.

**Reconstrucción**: desde el destino se sigue §parents§ hacia atrás hasta §None§ y se invierte la lista; sin predecesores se conoce la distancia pero no el camino.`,
    procedimiento: R`
**Para relajar una arista a mano:**

1. Calcula **d(u) + w** (el costo de llegar a v pasando por u).
2. Compáralo con el **d(v)** actual.
3. Si es **menor**, reemplaza d(v) y anota u como predecesor; si no, no cambies nada.

**Para reconstruir el camino**: parte del destino, ve anotando **§parents[nodo]§** hasta llegar a §None§ y **invierte** el orden.`,
    codigo: [{
      titulo: 'La relajación de una arista',
      src: R`
INF = float("inf")

def relajar(costs, parents, u, v, w):
    nuevo = costs[u] + w
    if nuevo < costs[v]:
        costs[v] = nuevo
        parents[v] = u
        return True
    return False

costs = {'S': 0, 'A': INF, 'B': INF}
parents = {'S': None, 'A': None, 'B': None}
print(relajar(costs, parents, 'S', 'A', 5), costs['A'], parents['A'])
print(relajar(costs, parents, 'A', 'B', 3), costs['B'])
print(relajar(costs, parents, 'S', 'A', 7), costs['A'])
`,
      esperado: 'True 5 S\nTrue 8\nFalse 5'
    }, {
      titulo: 'Reconstruir el camino con los predecesores',
      src: R`
def reconstruir(parents, destino):
    camino = []
    actual = destino
    while actual is not None:            # del destino hacia atras
        camino.append(actual)
        actual = parents[actual]
    camino.reverse()
    return camino

parents = {'S': None, 'A': 'S', 'B': 'A', 'C': 'A'}
print(reconstruir(parents, 'B'))
print(reconstruir(parents, 'C'))
print(reconstruir(parents, 'S'))
`,
      esperado: '[\'S\', \'A\', \'B\']\n[\'S\', \'A\', \'C\']\n[\'S\']'
    }],
    ejemplo: R`
**Relajar con números.** d(S) = 0; arista S → A de peso 5: 0 + 5 = 5 < ∞ → **d(A) = 5** y §parents[A] = S§. Arista A → B de peso 3: 5 + 3 = 8 < ∞ → **d(B) = 8**, §parents[B] = A§. Si luego aparece la arista S → B de peso 6: 0 + 6 = 6 < 8 → **d(B) = 6** y el predecesor pasa a ser S.

**Por qué BFS falla**: con S–A = 1, A–D = 1 y S–D = 5, BFS elige S → D (1 arista, costo 5); el camino de menor costo es S → A → D (2 aristas, costo **2**).`,
    complejidad: R`
- **Relajar una arista**: §O(1)§ (una suma y una comparación).
- **Reconstruir** un camino de k nodos: §O(k)§.
- Los algoritmos de caminos mínimos se diferencian en **cuántas veces** relajan y **en qué orden** (temas [[cm-dijkstra]], [[cm-bellman]] y [[cm-floyd]]).`,
    errores: R`
- **Usar BFS con pesos**: minimiza saltos, no costo.
- **Olvidar guardar los predecesores**: se conoce la distancia pero no el camino.
- **Actualizar §d(v)§ sin comprobar que mejora**: se pierden mejores valores ya conocidos.
- **Inicializar las distancias en 0** en vez de ∞: nada «mejora» y el resultado es falso.
- **Confundir camino más corto en saltos (BFS) con camino de menor peso**.`,
    preguntas: [
      ['¿Qué es el camino mínimo en un grafo ponderado y por qué no sirve BFS?', 'Es el camino cuya suma de pesos es menor. BFS cuenta aristas, no pesos, así que puede elegir un camino corto en saltos pero caro.'],
      ['Explica qué es relajar la arista (u, v) de peso w.', 'Probar si llegar a v por u mejora: si d(v) > d(u) + w se actualiza d(v) = d(u) + w y el predecesor de v pasa a ser u.'],
      ['d(A) = 4, d(B) = 9, arista A → B de peso 3. ¿Qué pasa al relajarla?', '4 + 3 = 7 < 9: mejora; d(B) pasa a 7 y el predecesor de B es A.'],
      ['¿Para qué se guardan los predecesores?', 'Para reconstruir el camino: se sigue parents hacia atrás desde el destino hasta el origen y se invierte.']
    ],
    resumen: R`
- **Camino mínimo** = menor **suma de pesos**; BFS no sirve (cuenta saltos).
- **Relajar**: si §d(v) > d(u) + w§ entonces §d(v) = d(u) + w§ y §parents[v] = u§.
- Distancias iniciales **∞** (0 en el origen); los **predecesores** reconstruyen el camino.`
  });

  B.tema({
    id: 'cm-dijkstra', area: 'cm', titulo: 'Dijkstra: cerrar siempre el nodo abierto más barato', fuente: 'S12-C2 · diap. 6-19', nivel: 16,
    conceptos: ['cm_dij'], lab: [{ tab: 'caminos', e: 's12.dijkstra', texto: 'Dijkstra en el grafo S → X, paso a paso' }, { tab: 'caminos', e: 'trueque.dijkstra', texto: 'El trueque de Rafael con Dijkstra' }, { tab: 'caminos', e: 'calles.dijkstra', texto: 'Dijkstra inundando un mapa de calles' }], alias: 'dijkstra greedy cola de prioridad heap trueque costo minimo find_lowest_cost_node',
    definicion: R`
**Dijkstra** es un algoritmo **greedy con cola de prioridad**. Mantiene la **distancia mínima conocida** a cada nodo y, repetidamente:

1. **extrae el nodo no procesado más cercano** (lo **cierra**: su distancia ya es definitiva), y
2. **relaja sus aristas**: si llegar por él mejora la distancia de un vecino, la actualiza.

Se guarda también el **predecesor** de cada nodo para reconstruir el camino. **Restricción**: requiere **pesos no negativos** (tema [[cm-negativos]]).

Versión de la clase (búsqueda lineal del mínimo): **§O(V²)§**; con un **heap** (semana 7): **§O(E log V)§**.`,
    intuicion: R`
Dijkstra **explora en círculos desde el origen**, como una onda en el agua, pero midiendo con **pesos** en vez de saltos: siempre cierra **el nodo abierto más cercano**. Cuando lo cierra sabe que **no puede existir un atajo mejor**, porque cualquier otro camino pasaría por nodos que están **igual o más lejos** y, con pesos no negativos, avanzar nunca resta.

**El trueque de Rafael** (diap. 7): quiere pasar de unos **audífonos** a un **PC Gamer** haciendo trueques; cada trueque cuesta dinero extra. La secuencia más barata es exactamente un problema de camino mínimo.`,
    formal: R`
**Invariante** (pesos ≥ 0): al cerrar un nodo u, §d(u)§ es la **distancia mínima real**. *Idea de la prueba*: cualquier otro camino de origen a u sale del conjunto de nodos cerrados por una arista hacia un nodo abierto v con §d(v) ≥ d(u)§ (u era el más barato); lo que sigue solo suma pesos ≥ 0, luego no puede ser menor.

**Algoritmo**:

1. §costs = ∞§ en todos, §costs[origen] = 0§, §processed = []§.
2. **node = el no procesado de menor costo** (si no hay, terminar).
3. Para cada vecino: §nuevo = costs[node] + peso§; si §nuevo < costs[vecino]§: actualizar costo y predecesor.
4. §processed.append(node)§ y volver al paso 2.

**Con destino**: se puede parar cuando el destino se **cierra** (su costo ya es óptimo).

**Con heap** [comp]: se guardan tuplas §(distancia, nodo)§; al sacar una con §d > dist[u]§ es una entrada **obsoleta** y se descarta (§if d > dist[u]: continue§); no descartarlas es un error de eficiencia.[/comp]`,
    procedimiento: R`
**Para hacer Dijkstra a mano** (tabla de costos, como en las diapositivas 13 y 18):

1. Tabla con tres columnas: **nodo**, **costo** y **predecesor**. Costo 0 en el origen, ∞ en los demás.
2. Elige el nodo **no procesado de menor costo** y **ciérralo** (táchalo).
3. Para cada vecino, calcula **costo del nodo + peso**; si mejora el costo de la tabla, **actualízalo** y anota el predecesor.
4. Repite hasta cerrar el destino (o todos los nodos).
5. **Reconstruye** el camino con los predecesores, de atrás hacia delante.`,
    codigo: [{
      titulo: 'Dijkstra de la clase en el trueque de Rafael',
      src: DIJKSTRA + '\n' + TRUEQUE + R`

costs, parents = dijkstra(graph, 'Audifonos')
print(costs)
camino, at = [], 'PC'
while at is not None:
    camino.append(at)
    at = parents[at]
print(camino[::-1], costs['PC'])
`,
      esperado: '{\'Audifonos\': 0, \'Tarjeta\': 5, \'Stickers\': 0, \'Reloj\': 20, \'Tableta\': 25, \'PC\': 35}\n[\'Audifonos\', \'Tarjeta\', \'Tableta\', \'PC\'] 35'
    }, {
      titulo: 'Dijkstra con heap (heapq) en el grafo S → X',
      src: R`
import heapq

def dijkstra_heap(graph, inicio):
    dist = {n: float("inf") for n in graph}
    dist[inicio] = 0
    heap = [(0, inicio)]
    while heap:
        d, u = heapq.heappop(heap)       # el mas cercano
        if d > dist[u]:
            continue                     # entrada obsoleta: se descarta
        for v, peso in graph[u].items():
            nuevo = d + peso
            if nuevo < dist[v]:
                dist[v] = nuevo
                heapq.heappush(heap, (nuevo, v))
    return dist

` + GP1 + R`
dist = dijkstra_heap(GP1, 'S')
print(dist['X'], dist['E'], dist['G'])
print(sorted(dist.items()))
`,
      esperado: '11 8 14\n[(\'A\', 5), (\'B\', 7), (\'C\', 6), (\'D\', 6), (\'E\', 8), (\'F\', 8), (\'G\', 14), (\'I\', 11), (\'S\', 0), (\'X\', 11)]'
    }],
    ejemplo: R`
**Dijkstra de S a X** (diapositivas 18-27; en un empate se cierra el que aparece primero en el diccionario):

| Paso | Cierra | dist | Relaja (solo si mejora) |
|---|---|---|---|
| 1 | S | 0 | A=5, B=9, C=6, D=6 |
| 2 | A | 5 | B=8, G=14 |
| 3 | C | 6 | B=7, I=11, F=13 |
| 4 | D | 6 | F=8, E=8 |
| 5 | B | 7 | (I=14, peor: no cambia) |
| 6 | F | 8 | (I=16, peor: no cambia) |
| 7 | E | 8 | X=11 |
| 8 | I | 11 | (X=14, peor: no cambia) |
| 9 | X | 11 | ¡destino alcanzado! |

**Resultado**: distancia mínima S → X = **11**, por **S → D → E → X** (6 + 2 + 3).

**El trueque** (diap. 8-15): costos 5 (Tarjeta), 0 (Stickers); se cierra Stickers (0) → Reloj = 30, Tableta = 35; luego Tarjeta (5) mejora Reloj a **20** y Tableta a **25**; Reloj (20) → PC = 40; Tableta (25) mejora PC a **35**. Camino: Audífonos → Tarjeta → Tableta → PC Gamer, **costo 35** (5 + 20 + 10).`,
    complejidad: R`
- **Versión de la clase** (§find_lowest_cost_node§ recorre todos los nodos): §V§ extracciones × §O(V)§ cada una = **§O(V²)§** (más §O(E)§ para relajar).
- **Con un heap**: cada arista puede empujar una entrada y cada entrada cuesta §O(log V)§: **§O(E log V)§**.
- **Memoria**: §O(V)§ (costos, predecesores y procesados); el heap puede tener hasta §O(E)§ entradas.
- Para **grafos densos** (E ≈ V²) la versión lineal §O(V²)§ puede ser **mejor** que la de heap §O(V² log V)§.`,
    errores: R`
- **Usar Dijkstra con pesos negativos**: da resultados incorrectos; usa Bellman-Ford.
- **Olvidar guardar los predecesores**: sin ellos se conoce la distancia pero no el camino.
- **No descartar las entradas obsoletas del heap** (§if d > dist[u]: continue§): pérdida de eficiencia.
- **Confundir «cerrar» con «descubrir»**: el costo es definitivo **al cerrar**, no cuando se ve por primera vez.
- **Confundir camino más corto en saltos (BFS) con camino de menor peso (Dijkstra)**.`,
    preguntas: [
      ['¿Qué estructura usa Dijkstra para elegir el próximo nodo y por qué?', 'Una cola de prioridad (heap): para extraer siempre el nodo no procesado más cercano en O(log V) en lugar de recorrerlos todos.'],
      ['¿Qué complejidad tiene Dijkstra con búsqueda lineal y con heap?', 'Con búsqueda lineal O(V²); con un heap O(E log V).'],
      ['En el grafo S → X, ¿qué distancia y qué camino da Dijkstra?', '11, por S → D → E → X (6 + 2 + 3).'],
      ['¿Por qué cerrar un nodo es seguro si los pesos son no negativos?', 'Porque cualquier otro camino al nodo pasaría por nodos igual o más lejanos y solo sumaría pesos ≥ 0, así que no puede mejorarlo.']
    ],
    resumen: R`
- **Greedy**: cierra siempre el nodo abierto **más barato** y **relaja** sus aristas; pesos **≥ 0**.
- **§O(V²)§** (búsqueda lineal, clase) u **§O(E log V)§** (heap); resuelve **origen a todos**.
- Trueque: **35**; grafo S → X: **11** por **S D E X**; guarda los **predecesores**.`
  });

  B.tema({
    id: 'cm-negativos', area: 'cm', titulo: 'Por qué Dijkstra falla con pesos negativos', fuente: 'S12-C2 · diap. 6, 28, 32', nivel: 16,
    conceptos: ['cm_neg'], lab: [{ tab: 'caminos', e: 'negativo.dijkstra.bellman', texto: 'Dijkstra contra Bellman-Ford con una arista negativa' }], alias: 'pesos negativos aristas negativas ciclo negativo falla',
    definicion: R`
Dijkstra **cierra** un nodo cuando lo extrae, **suponiendo que ya tiene su distancia mínima**. Con una **arista negativa** posterior podría existir un camino mejor que llega **demasiado tarde**, cuando el nodo ya está cerrado: el resultado es **incorrecto**.

Con pesos negativos se usa **Bellman-Ford** (tema [[cm-bellman]]). Si hay un **ciclo negativo** alcanzable (un ciclo cuya suma es menor que 0), **no existe camino mínimo**: se puede dar vueltas y bajar el costo sin límite.`,
    intuicion: R`
Con pesos no negativos, «alejarse» nunca ayuda: cuanto más lejos del origen, más cuesta. Por eso es seguro cerrar el más cercano. Una **arista negativa** es como una **oferta o reembolso**: llegar a un nodo por un camino largo puede terminar siendo más barato que por uno corto, y Dijkstra, que ya «cerró» ese nodo, no vuelve a mirarlo.

El **ciclo negativo** es un **bucle de dinero infinito** (arbitraje): cada vuelta gana algo; no hay «mínimo» porque siempre se puede ganar más.`,
    formal: R`
**Contraejemplo mínimo** (dirigido): §S → A§ de peso 2, §S → B§ de peso 3, §B → A§ de peso **−4**, §A → C§ de peso 1.

- Dijkstra cierra S, luego A (costo 2) y calcula C = 2 + 1 = **3**. Cuando cierra B (costo 3) relaja B → A y mejora A a **−1**, pero A ya estaba cerrado: C no se recalcula.
- El camino real S → B → A → C cuesta 3 − 4 + 1 = **0**. Bellman-Ford da C = 0.

**Por qué se rompe la invariante**: la prueba de Dijkstra usa que los pesos son ≥ 0 para asegurar que un camino que sale del conjunto cerrado no puede ser más barato; con una arista negativa esa desigualdad deja de valer.

**Ciclo negativo**: si el ciclo suma −1, cada vuelta baja 1 el costo: el ínfimo es −∞ y el «camino mínimo» no está definido.`,
    procedimiento: R`
**Para decidir qué algoritmo usar según los pesos:**

1. ¿Todos los pesos son **≥ 0**? → Dijkstra (o A* con un destino).
2. ¿Hay **algún peso negativo**? → **Bellman-Ford**.
3. ¿Bellman-Ford sigue mejorando en la pasada **extra**? → hay un **ciclo negativo**: no hay camino mínimo.
4. Si necesitas **todos los pares** con pesos negativos → Floyd-Warshall (sin ciclos negativos).`,
    codigo: [{
      titulo: 'Con una arista negativa: Dijkstra falla y Bellman-Ford acierta',
      src: DIJKSTRA + R`
def bellman_ford(nodos, aristas, inicio):
    dist = {v: float("inf") for v in nodos}
    dist[inicio] = 0
    for _ in range(len(nodos) - 1):
        for u, v, peso in aristas:
            if dist[u] + peso < dist[v]:
                dist[v] = dist[u] + peso
    return dist

graph = {'S': {'A': 2, 'B': 3}, 'A': {'C': 1}, 'B': {'A': -4}, 'C': {}}
aristas = [('S', 'A', 2), ('S', 'B', 3), ('B', 'A', -4), ('A', 'C', 1)]
costs, parents = dijkstra(graph, 'S')
print(costs['C'])
print(bellman_ford(['S', 'A', 'B', 'C'], aristas, 'S')['C'])
`,
      esperado: '3\n0'
    }],
    ejemplo: R`
**El ejemplo de la clase** (diap. 28): S → A = 1, S → B = 5, B → A = −4. Dijkstra fija d(A) = 1 y lo cierra, pero S → B → A cuesta 5 + (−4) = 1, igual aquí; con **más** aristas negativas el camino por B sería **menor** y Dijkstra daría un valor erróneo.

**El contraejemplo de arriba** (S→A 2, S→B 3, B→A −4, A→C 1): Dijkstra da **C = 3**, pero el camino S → B → A → C cuesta **0**. En el Laboratorio, la escena «Peso negativo» muestra los dos algoritmos lado a lado.`,
    complejidad: R`
- **Dijkstra con pesos ≥ 0**: §O(E log V)§ (o §O(V²)§). **No es correcto** con pesos negativos aunque termine.
- **Bellman-Ford**: §O(V · E)§; **sí** es correcto con pesos negativos y detecta ciclos negativos.
- El costo de la corrección: Bellman-Ford es más lento (relaja todas las aristas |V| − 1 veces).`,
    errores: R`
- **Usar Dijkstra con pesos negativos** esperando el resultado correcto.
- **Creer que sumar una constante a todos los pesos lo arregla**: cambia el camino mínimo (los caminos con más aristas se encarecen más).
- **Confundir una arista negativa con un ciclo negativo**: una arista negativa se maneja con Bellman-Ford; un ciclo negativo no tiene solución.
- **Suponer que «el algoritmo terminó» implica «el resultado es correcto»**.`,
    preguntas: [
      ['¿Por qué Dijkstra falla con pesos negativos?', 'Cierra un nodo suponiendo que ya tiene su distancia mínima; con una arista negativa posterior puede aparecer un camino mejor cuando el nodo ya está cerrado.'],
      ['¿Qué algoritmo se usa con pesos negativos y qué detecta además?', 'Bellman-Ford (O(V · E)); detecta ciclos negativos con una pasada extra.'],
      ['¿Existe el camino mínimo si hay un ciclo negativo alcanzable?', 'No: cada vuelta al ciclo baja el costo, así que no hay mínimo.'],
      ['Con S→A 2, S→B 3, B→A −4, A→C 1: ¿cuánto vale C para Dijkstra y cuánto en realidad?', 'Dijkstra da 3; el costo real mínimo es 0 por S → B → A → C.']
    ],
    resumen: R`
- Dijkstra **cierra** nodos asumiendo que no mejorarán: **falla con pesos negativos**.
- Con negativos: **Bellman-Ford**; un **ciclo negativo** no tiene camino mínimo.
- Contraejemplo: C = **3** (Dijkstra) frente a **0** (real).`
  });

  B.tema({
    id: 'cm-astar', area: 'cm', titulo: 'A*: Dijkstra guiado por una heurística', fuente: 'S12-C2 · diap. 20-24, 29', nivel: 16,
    conceptos: ['cm_astar'], lab: [{ tab: 'caminos', e: 's12.astar.dijkstra', texto: 'A* contra Dijkstra en el grafo S → X' }, { tab: 'caminos', e: 'calles.astar.dijkstra', texto: 'A* contra Dijkstra en un mapa de calles' }, { tab: 'caminos', e: 'laberinto.astar.bfs', texto: 'A* con distancia Manhattan en un laberinto' }], alias: 'a estrella a star heuristica admisible f g h manhattan linea recta gps',
    definicion: R`
**A\*** es **Dijkstra guiado por una heurística**. Cuando se busca el camino a un **destino fijo**, usa una función **h(v)** que **estima** la distancia de v al destino y prioriza los nodos por:

**f(v) = d(v) + h(v)**

(d(v): costo real desde el origen; h(v): estimación de lo que falta). Así dirige la búsqueda hacia el destino y **explora menos nodos** que Dijkstra.

**Si h nunca sobrestima (es admisible), A\* encuentra el óptimo.** En mapas se usa la distancia en línea recta. Es el algoritmo de los GPS y de la búsqueda de rutas en videojuegos.`,
    intuicion: R`
Dijkstra es una **onda circular**: se expande igual en todas las direcciones, incluso las que se alejan del destino. A* es **una onda con brújula**: la heurística le dice «el destino está hacia allá» y empuja la búsqueda en esa dirección; los nodos que parecen alejarse **se quedan sin explorar**.

**¿Cómo se elige h?** (diapositiva 21): es una **estimación rápida**, con una fórmula, de lo que falta; no el costo real (eso sería resolver el problema). Debe ser **admisible**: nunca **sobrestimar**. Con h = 0 A* se convierte en Dijkstra (es admisible pero no guía).`,
    formal: R`
**Prioridad**: **f(v) = g(v) + h(v)**; se **expande** (cierra) siempre el nodo abierto de menor f. Se **detiene al expandir el destino**.

**Heurística admisible**: §h(v) ≤ costo real mínimo de v al destino§ para todo v. Entonces A* devuelve un camino **óptimo**. Si h **sobrestima**, A* puede descartar el camino óptimo y devolver uno peor.

**Cómo elegirla según el problema**:

- **Cuadrícula de 4 direcciones**: **Manhattan** |Δx| + |Δy|. (Con 8 direcciones: distancia de Chebyshev; Manhattan sobrestimaría.)
- **Movimiento libre / mapa**: **línea recta** √(Δx² + Δy²).
- **Sin geometría**: h = 0, o una cota inferior del costo.

Ejemplo (diap. 21): destino ⋆ en (4, 4) y nodo en (1, 2): h = |4−1| + |4−2| = **5** (mínimo 5 pasos, no sobrestima).`,
    procedimiento: R`
**Para hacer A\* a mano** (diap. 23): tabla con **expande (g, f)** y **genera/actualiza (g, f = g + h)**.

1. Calcula f del origen: g = 0, f = h(origen).
2. **Expande** el nodo abierto de **menor f** (en un empate, el primero del diccionario).
3. Para cada vecino calcula g nuevo = g + peso; si mejora, actualiza g y **f = g + h**.
4. Detente al **expandir el destino**. Cuenta cuántos nodos expandiste y compáralo con Dijkstra.`,
    codigo: [{
      titulo: 'A* en el grafo S → X (con la lista de nodos expandidos)',
      src: R`
def find_lowest_f_node(costs, h, processed):
    lowest, best = float("inf"), None
    for node in costs:
        if node in processed:
            continue
        f = costs[node] + h[node]        # f = g + h
        if f < lowest:
            lowest, best = f, node
    return best

def a_estrella(graph, inicio, destino, h):
    costs = {n: float("inf") for n in graph}
    parents = {n: None for n in graph}
    costs[inicio] = 0
    processed = []
    node = find_lowest_f_node(costs, h, processed)
    while node is not None:
        if node == destino:
            break                        # llegamos al destino
        for vecino, peso in graph[node].items():
            nuevo = costs[node] + peso
            if nuevo < costs[vecino]:
                costs[vecino] = nuevo
                parents[vecino] = node
        processed.append(node)
        node = find_lowest_f_node(costs, h, processed)
    return costs[destino], parents, processed

` + GP1 + R`
h = {'S': 5, 'A': 8, 'G': 9, 'B': 4, 'C': 3, 'I': 2, 'F': 5, 'D': 2, 'X': 0, 'E': 1}
costo, parents, expandidos = a_estrella(GP1, 'S', 'X', h)
print(costo)
print(expandidos + ['X'])
print(parents['X'], parents['E'], parents['D'])
`,
      esperado: '11\n[\'S\', \'D\', \'C\', \'E\', \'B\', \'X\']\nE D S'
    }],
    ejemplo: R`
**A\* de S a X** (diapositivas 23-31; g = costo real, h = heurística):

| Paso | Expande (g, f) | Genera / actualiza (g, f = g + h) |
|---|---|---|
| 1 | S (0, 5) | A(5, 13) B(9, 13) C(6, 9) D(6, 8) |
| 2 | D (6, 8) | E(8, 9) F(8, 13) |
| 3 | C (6, 9) | B(7, 11) mejora; I(11, 13) |
| 4 | E (8, 9) | X(11, 11) |
| 5 | B (7, 11) | (sin mejoras) |
| 6 | X (11, 11) | ¡destino: costo 11! |

**A\* frente a Dijkstra**: el mismo óptimo (**11**, camino **S D E X**), pero A* expandió **6 nodos** (S, D, C, E, B, X) y **nunca tocó A, G, F, I**; Dijkstra cerró **9**. La heurística lo dirigió hacia X en vez de explorar en todas direcciones.`,
    complejidad: R`
- **Peor caso**: igual que Dijkstra, **§O(E log V)§** con heap (la clase usa búsqueda lineal: §O(V²)§).
- **En la práctica** (con buena heurística) explora **muchos menos nodos**; con h = 0 coincide con Dijkstra.
- **Memoria**: §O(V)§.
- A* resuelve **un destino**; para todos los destinos desde un origen sirve Dijkstra.`,
    errores: R`
- **Usar una heurística que sobrestima** (no admisible): se pierde la garantía de optimalidad.
- **Confundir f con g**: f = g + h es la **prioridad**, el costo real es g.
- **Creer que h = costo real exacto es lo ideal**: calcularlo equivale a resolver el problema.
- **Detener A\* al generar el destino** en lugar de al **expandirlo**: puede haber un camino mejor todavía.
- **Usar Manhattan con movimientos diagonales**: sobrestima.`,
    preguntas: [
      ['¿En qué se diferencia A* de Dijkstra?', 'A* prioriza por f = g + h, con una heurística h que estima lo que falta al destino, y explora menos nodos; Dijkstra prioriza solo por g.'],
      ['¿Cuándo garantiza A* el camino óptimo?', 'Cuando la heurística es admisible: nunca sobrestima el costo real al destino.'],
      ['¿Qué heurística usarías en una cuadrícula de 4 direcciones y en un mapa de carreteras?', 'Manhattan en la cuadrícula; la distancia en línea recta en el mapa. Las dos son admisibles.'],
      ['En el grafo S → X, ¿cuántos nodos expande A* y cuántos Dijkstra?', 'A* expande 6 (S, D, C, E, B, X); Dijkstra cierra 9.']
    ],
    resumen: R`
- **A\*** = Dijkstra con prioridad **f = g + h** y **destino fijo**; se detiene al **expandirlo**.
- **h admisible** (nunca sobrestima) ⇒ camino **óptimo**; **h = 0** ⇒ Dijkstra.
- Manhattan (cuadrícula 4 dir.), línea recta (mapas). En S → X: **6** nodos frente a **9**.`
  });

  B.tema({
    id: 'cm-bellman', area: 'cm', titulo: 'Bellman-Ford: pesos negativos y ciclos negativos', fuente: 'S12-C2 · diap. 25, 28', nivel: 16,
    conceptos: ['cm_bf'], lab: [{ tab: 'caminos', e: 'negativo.bellman', texto: 'Bellman-Ford pasada a pasada' }, { tab: 'caminos', e: 'ciudades.bellman', texto: 'Bellman-Ford en el mapa de ciudades' }], alias: 'bellman ford pesos negativos ciclo negativo relajar todas las aristas',
    definicion: R`
**Bellman-Ford** **relaja todas las aristas |V| − 1 veces**. Es más lento que Dijkstra (**§O(V · E)§**), pero **admite pesos negativos** y **detecta ciclos negativos**: si una pasada **extra** todavía mejora alguna arista, hay un ciclo negativo.`,
    intuicion: R`
Dijkstra es **selectivo** (cierra de a un nodo, en orden); Bellman-Ford es **terco**: en cada pasada **revisa todas las aristas** y relaja las que mejoran, sin preocuparse del orden. Tras la pasada 1 se conocen bien los caminos de **1 arista**; tras la pasada 2, los de **hasta 2**; y así sucesivamente.

Un camino mínimo (sin ciclos) tiene a lo sumo **|V| − 1 aristas**, así que tras **|V| − 1 pasadas** todo está resuelto. Si todavía se puede mejorar, es porque hay un **ciclo de ganancia infinita**.`,
    formal: R`
**Algoritmo**:

1. §dist[origen] = 0§ y §dist[v] = ∞§ para el resto.
2. Repetir **|V| − 1** veces: para **cada arista** (u, v, w): si §dist[u] + w < dist[v]§, actualizar §dist[v]§ y §parents[v] = u§.
3. **Pasada extra**: si alguna arista todavía mejora, existe un **ciclo negativo** alcanzable.

**Corrección** (por inducción sobre k): después de k pasadas §dist[v]§ es ≤ el costo del mejor camino de **a lo sumo k aristas** hasta v. Con |V| − 1 pasadas cubre todos los caminos simples.

**Parada anticipada**: si una pasada **no cambia nada**, las siguientes tampoco: se puede parar.

**Costo**: |V| − 1 pasadas × |E| aristas = **§O(V · E)§**.`,
    procedimiento: R`
**Para hacer Bellman-Ford a mano:**

1. Lista las aristas en un **orden fijo** (el que indique el enunciado) y la tabla de distancias inicial.
2. **Pasada 1**: recorre las aristas en ese orden relajando cada una con los valores **ya actualizados**.
3. Repite pasadas hasta que **no cambie nada** o llegues a |V| − 1.
4. **Pasada extra**: si todavía mejora alguna distancia, hay un **ciclo negativo**.`,
    codigo: [{
      titulo: 'Bellman-Ford con detección de ciclo negativo',
      src: R`
def bellman_ford(nodos, aristas, inicio):
    dist = {v: float("inf") for v in nodos}
    parents = {v: None for v in nodos}
    dist[inicio] = 0
    for _ in range(len(nodos) - 1):      # |V| - 1 pasadas
        cambio = False
        for u, v, peso in aristas:
            if dist[u] + peso < dist[v]:
                dist[v] = dist[u] + peso
                parents[v] = u
                cambio = True
        if not cambio:
            break                        # ya no mejora: se puede parar antes
    for u, v, peso in aristas:           # una pasada mas: si aun mejora hay ciclo negativo
        if dist[u] + peso < dist[v]:
            return None, None
    return dist, parents

nodos = ['S', 'A', 'B', 'C']
aristas = [('S', 'A', 2), ('S', 'B', 3), ('B', 'A', -4), ('A', 'C', 1)]
dist, parents = bellman_ford(nodos, aristas, 'S')
print(dist)
print(parents['C'], parents['A'])
print(bellman_ford(['S', 'A', 'B'], [('S', 'A', 1), ('A', 'B', -2), ('B', 'A', -2)], 'S'))
`,
      esperado: '{\'S\': 0, \'A\': -1, \'B\': 3, \'C\': 0}\nA B\n(None, None)'
    }],
    ejemplo: R`
**Con las aristas en el orden S→A (2), S→B (3), B→A (−4), A→C (1):**

| Pasada | S | A | B | C |
|---|---|---|---|---|
| inicio | 0 | ∞ | ∞ | ∞ |
| 1 | 0 | 2 → **−1** | **3** | **0** |
| 2 | 0 | −1 | 3 | 0 (sin cambios: se puede parar) |

(En la pasada 1: S→A da A = 2; S→B da B = 3; B→A da 3 − 4 = **−1**; A→C da −1 + 1 = **0**.)

**Con un ciclo negativo** (S→A 1, A→B −2, B→A −2): A y B siguen mejorando en cada pasada y la **pasada extra** todavía mejora: el algoritmo devuelve §None§.`,
    complejidad: R`
- **Tiempo**: **§O(V · E)§** (|V| − 1 pasadas por |E| aristas); más lento que Dijkstra (§O(E log V)§).
- **Memoria**: §O(V)§.
- **A cambio**: admite **pesos negativos** y **detecta ciclos negativos**.
- Es un ejemplo de **programación dinámica** de la semana 5 aplicada a grafos.`,
    errores: R`
- **Hacer solo una pasada**: no basta, los caminos con varias aristas aún no están resueltos.
- **Olvidar la pasada extra** de detección: un ciclo negativo pasaría desapercibido.
- **Usarlo cuando todos los pesos son ≥ 0** y basta Dijkstra: pierde eficiencia.
- **Relajar con §dist[u] = ∞§** esperando una mejora: §∞ + w§ nunca mejora (en Python §inf + (−3)§ sigue siendo §inf§).
- **Confundir ciclo negativo con arista negativa**.`,
    preguntas: [
      ['¿Cuántas veces relaja Bellman-Ford las aristas y por qué?', '|V| − 1 veces: un camino mínimo simple tiene a lo sumo |V| − 1 aristas, y cada pasada resuelve un nivel más de aristas.'],
      ['¿Cómo detecta un ciclo negativo?', 'Con una pasada extra: si todavía mejora alguna distancia, hay un ciclo negativo alcanzable.'],
      ['Compara Bellman-Ford con Dijkstra en complejidad y aplicabilidad.', 'Bellman-Ford es O(V · E) y admite pesos negativos; Dijkstra es O(E log V) pero solo pesos no negativos.'],
      ['¿Cuándo se puede parar antes de las |V| − 1 pasadas?', 'Cuando una pasada completa no cambia ninguna distancia.']
    ],
    resumen: R`
- **Relaja todas las aristas |V| − 1 veces**: **§O(V · E)§**.
- **Admite pesos negativos** y detecta **ciclos negativos** (pasada extra que aún mejora).
- Parada anticipada si una pasada no cambia nada.`
  });

  B.tema({
    id: 'cm-floyd', area: 'cm', titulo: 'Floyd-Warshall: todos los pares con programación dinámica', fuente: 'S12-C2 · diap. 25, 28-30', nivel: 16,
    conceptos: ['cm_fw'], lab: [{ tab: 'caminos', e: 'trueque.floyd', texto: 'Floyd-Warshall en el trueque, intermedio por intermedio' }, { tab: 'caminos', e: 's12.floyd', texto: 'Floyd-Warshall en el grafo S → X' }], alias: 'floyd warshall todos los pares matriz de distancias programacion dinamica',
    definicion: R`
**Floyd-Warshall** halla el camino mínimo entre **todos los pares** de nodos con **programación dinámica**: **O(V³)** de tiempo y **O(V²)** de espacio. Admite pesos negativos (sin ciclos negativos).

La recurrencia (para cada nodo intermedio k):

**d_ij ← mín( d_ij , d_ik + d_kj )**

¿Es más corto ir de i a j **pasando por k**? Se prueba con cada k posible.`,
    intuicion: R`
Es una **tabla de distancias** que se va mejorando permitiendo **más intermediarios**: primero solo se puede pasar por A; luego por A o B; luego por A, B o C… Al terminar con todos los nodos, la tabla tiene la mejor ruta entre cualquier par.

Es como un **mapa de rutas aéreas**: «¿conviene volar de i a j directo o con escala en k?». Si se prueba **cada ciudad como escala** para **cada par**, no se escapa ningún atajo.`,
    formal: R`
**Subproblema**: §d(k)[i][j]§ = costo del mejor camino de i a j cuyos nodos **intermedios** están todos entre los **primeros k** nodos.

**Recurrencia**: §d(k)[i][j] = mín( d(k−1)[i][j], d(k−1)[i][k] + d(k−1)[k][j] )§: o el mejor camino **no usa** k, o **pasa por k** una vez (de i a k y de k a j con intermedios menores).

**Inicialización**: §d[i][i] = 0§; §d[i][j]§ = peso de la arista si existe, **∞** si no.

**Costo**: tres bucles anidados (k, i, j): **§V³§**. La matriz se actualiza **en el mismo sitio** (por eso el espacio es §O(V²)§).

**Ciclos negativos**: si al terminar algún §d[i][i] < 0§, hay un ciclo negativo.`,
    procedimiento: R`
**Para hacer Floyd-Warshall a mano:**

1. Escribe la **matriz inicial** (0 en la diagonal, pesos de las aristas, ∞ donde no hay arista).
2. Para **k = primer nodo**: para cada par (i, j) compara **d[i][j]** con **d[i][k] + d[k][j]** y conserva el menor (si algún tramo es ∞, no mejora).
3. Repite con el **siguiente nodo k**, usando la matriz ya actualizada.
4. Al terminar con todos los k, cada celda es la **distancia mínima** entre ese par.`,
    codigo: [{
      titulo: 'Floyd-Warshall en el trueque de Rafael',
      src: R`
def floyd_warshall(nodos, peso):
    d = {i: {j: float("inf") for j in nodos} for i in nodos}
    for i in nodos:
        d[i][i] = 0
    for (i, j), w in peso.items():
        d[i][j] = w
    for k in nodos:                      # nodo intermedio
        for i in nodos:
            for j in nodos:
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    return d

nodos = ['Audifonos', 'Tarjeta', 'Stickers', 'Reloj', 'Tableta', 'PC']
peso = {('Audifonos', 'Tarjeta'): 5, ('Audifonos', 'Stickers'): 0, ('Tarjeta', 'Reloj'): 15, ('Tarjeta', 'Tableta'): 20,
        ('Stickers', 'Reloj'): 30, ('Stickers', 'Tableta'): 35, ('Reloj', 'PC'): 20, ('Tableta', 'PC'): 10}
d = floyd_warshall(nodos, peso)
print(d['Audifonos']['PC'], d['Stickers']['Reloj'], d['Tarjeta']['PC'])
print(d['Reloj']['Tarjeta'])
`,
      esperado: '35 30 30\ninf'
    }],
    ejemplo: R`
**Trueque de Rafael** (dirigido): Audífonos → Tarjeta 5, Audífonos → Stickers 0, Tarjeta → Reloj 15, Tarjeta → Tableta 20, Stickers → Reloj 30, Stickers → Tableta 35, Reloj → PC 20, Tableta → PC 10.

- **d[Audífonos][PC] = 35** (por Tarjeta y Tableta).
- **d[Tarjeta][PC] = 30** (Tarjeta → Tableta → PC, 20 + 10).
- **d[Reloj][Tarjeta] = ∞**: el trueque va en un solo sentido, no hay camino de vuelta.

**Costo con números**: con 50 estaciones de metro, 50³ = **125 000** comprobaciones: aceptable. Con 10 000 nodos serían **10¹²**.`,
    complejidad: R`
- **Tiempo**: **§O(V³)§** (tres bucles de V vueltas).
- **Espacio**: **§O(V²)§** (la matriz de distancias).
- **Frente a Dijkstra desde cada nodo**: V · O(E log V). En grafos **ralos** y grandes, Dijkstra repetido gana; en grafos **pequeños y densos** Floyd-Warshall es más simple y competitivo.
- Con 5 000 nodos: 5 000³ = 1,25 · 10¹¹ operaciones.`,
    errores: R`
- **Usar Floyd-Warshall cuando basta un Dijkstra desde un origen**: gasta §O(V³)§ en vez de §O(E log V)§.
- **Poner el bucle de k adentro**: el orden correcto es **k afuera**, i y j adentro.
- **Sumar con ∞ sin cuidado** en otros lenguajes (desbordamientos): en Python §inf + x§ es §inf§.
- **Olvidar la diagonal** (d[i][i] = 0).
- **Esperar que funcione con ciclos negativos**: la diagonal queda negativa.`,
    preguntas: [
      ['¿Qué calcula Floyd-Warshall y con qué técnica?', 'Las distancias mínimas entre todos los pares de nodos, con programación dinámica (d_ij = mín(d_ij, d_ik + d_kj) para cada intermedio k).'],
      ['¿Qué complejidad en tiempo y en espacio tiene?', 'O(V³) en tiempo y O(V²) en espacio.'],
      ['Con 5000 nodos, ¿cuántas operaciones hace aproximadamente?', '5000³ = 1,25 · 10¹¹.'],
      ['¿Cuándo conviene Floyd-Warshall y cuándo Dijkstra?', 'Floyd-Warshall si se necesitan todos los pares y el grafo es pequeño o denso; Dijkstra si basta uno o pocos orígenes.']
    ],
    resumen: R`
- **Todos los pares**: §d_ij ← mín(d_ij, d_ik + d_kj)§ para cada **intermedio k** (**k afuera**).
- **§O(V³)§** tiempo, **§O(V²)§** espacio; admite negativos sin ciclos negativos.
- Si basta un origen: **Dijkstra**.`
  });

  B.tema({
    id: 'cm-elegir', area: 'cm', titulo: 'Elegir el algoritmo: comparación, costo e IA', fuente: 'S12-C2 · diap. 26-27, 29-30, 32', nivel: 16,
    conceptos: ['cm_elegir'], lab: [{ tab: 'caminos', e: 's12.dijkstra.astar', texto: 'Comparar Dijkstra y A* en el grafo S → X' }, { tab: 'caminos', e: 'calles.dijkstra.astar', texto: 'Comparar Dijkstra y A* en un mapa de calles' }], alias: 'comparar dijkstra a star bellman floyd cuando usar elegir costo computacional ia gps',
    definicion: R`
**Comparación de los cuatro algoritmos** (diapositiva 26):

| Algoritmo | Resuelve | Pesos negativos | Complejidad |
|---|---|---|---|
| **Dijkstra** | Origen a todos | No | §O(E log V)§ |
| **A\*** | Origen a destino | No | §O(E log V)§ (explora menos con buena heurística) |
| **Bellman-Ford** | Origen a todos | **Sí** | §O(V · E)§ |
| **Floyd-Warshall** | **Todos los pares** | **Sí** (sin ciclos negativos) | §O(V³)§ |

**Cómo elegir**: pesos no negativos y un origen → **Dijkstra**; con destino fijo y heurística → **A\***; hay pesos negativos → **Bellman-Ford**; todos los pares y grafo pequeño o denso → **Floyd-Warshall**.`,
    intuicion: R`
Elegir es contestar **tres preguntas**: ¿hay **pesos negativos**? ¿el **destino es fijo** (y hay una buena estimación)? ¿cuántos **pares** de nodos me importan?

- GPS que calcula la ruta de su casa a un destino (distancias positivas) → **Dijkstra o A\***.
- Red financiera donde algunas transacciones ganan dinero (pesos negativos) y se busca **arbitraje** → **Bellman-Ford**.
- Precalcular las distancias entre las **50 estaciones** de un metro → **Floyd-Warshall**.

**En IA**: A* es central en búsqueda de rutas para agentes, robótica y videojuegos; hallar la relación **más cercana entre dos entidades** en un grafo de conocimiento es un camino mínimo; Floyd-Warshall y Bellman-Ford son ejemplos de la **programación dinámica** de la semana 5 aplicada a grafos.`,
    formal: R`
**Costo computacional** (mCP41): Floyd-Warshall es §O(V³)§: con **10 000 nodos son 10¹² operaciones**. Elegir Dijkstra desde **pocos orígenes** puede ahorrar **horas de cómputo y energía** frente a calcular todos los pares.

**Pregunta de análisis (2)**, grafo de 5 000 nodos:

1. Solo las distancias **desde un origen**: **Dijkstra**, §O(E log V)§.
2. **Todos los pares**: Floyd-Warshall (§V³§) o Dijkstra **desde cada nodo** (§V · E log V§): depende de la **densidad**; en un grafo ralo gana Dijkstra repetido.
3. **Operaciones**: Floyd-Warshall = 5 000³ = **1,25 · 10¹¹**.

**Errores típicos**: Dijkstra con pesos negativos; olvidar los predecesores; no descartar entradas obsoletas del heap; Floyd-Warshall cuando basta un Dijkstra; una heurística **no admisible** en A*; confundir camino más corto en **saltos** (BFS) con de menor **peso** (Dijkstra).`,
    procedimiento: R`
**Para elegir el algoritmo, en orden:**

1. ¿**Sin pesos**? → **BFS** (nivel 15).
2. ¿**Todos los pares** de nodos? → **Floyd-Warshall** (grafo pequeño o denso).
3. ¿Hay **pesos negativos**? → **Bellman-Ford** (¿ciclo negativo? no hay camino mínimo).
4. ¿Hay **destino fijo y una heurística admisible**? → **A\***.
5. En otro caso → **Dijkstra** (con heap).`,
    codigo: [{
      titulo: 'Una regla de decisión y el costo de Floyd-Warshall',
      src: R`
def elegir(sin_pesos, todos_los_pares, pesos_negativos, destino_con_heuristica):
    if sin_pesos:
        return 'BFS'
    if todos_los_pares:
        return 'Floyd-Warshall'
    if pesos_negativos:
        return 'Bellman-Ford'
    if destino_con_heuristica:
        return 'A*'
    return 'Dijkstra'

print(elegir(False, False, False, False))
print(elegir(False, False, False, True))
print(elegir(False, False, True, False))
print(elegir(False, True, False, False))
print(elegir(True, False, False, False))
V = 5000
print(V ** 3)
`,
      esperado: 'Dijkstra\nA*\nBellman-Ford\nFloyd-Warshall\nBFS\n125000000000'
    }],
    ejemplo: R`
**Preguntas de análisis resueltas:**

- *GPS de casa a un destino con distancias positivas*: **Dijkstra** (o A* con la distancia en línea recta como heurística).
- *Red financiera con ganancias (pesos negativos) y arbitraje (ciclos negativos)*: **Bellman-Ford**.
- *Precalcular la distancia entre las 50 estaciones de un metro*: **Floyd-Warshall** (50³ = 125 000: barato).
- *5 000 nodos, todos los pares*: Floyd-Warshall = **1,25 · 10¹¹**; Dijkstra desde cada nodo en un grafo ralo (E ≈ 5·V): 5 000 · (25 000 · log 5 000) ≈ **1,5 · 10⁹**: **mucho menos**.`,
    complejidad: R`
| Algoritmo | Tiempo | Memoria |
|---|---|---|
| BFS (sin pesos) | §O(V + E)§ | §O(V)§ |
| Dijkstra (búsqueda lineal) | §O(V²)§ | §O(V)§ |
| Dijkstra (heap) | §O(E log V)§ | §O(V)§ |
| A\* (buena heurística) | §O(E log V)§ en el peor caso | §O(V)§ |
| Bellman-Ford | §O(V · E)§ | §O(V)§ |
| Floyd-Warshall | §O(V³)§ | §O(V²)§ |`,
    errores: R`
- **Usar Dijkstra con pesos negativos**: resultados incorrectos; usa Bellman-Ford.
- **Olvidar guardar los predecesores**: se conoce la distancia pero no el camino.
- **No descartar las entradas obsoletas del heap** (§if d > dist[u]: continue§).
- **Usar Floyd-Warshall (§O(V³)§) cuando basta un Dijkstra** desde un origen.
- **Elegir una heurística no admisible en A\***: pierde la garantía de optimalidad.
- **Confundir camino más corto en saltos (BFS) con de menor peso (Dijkstra)**.`,
    preguntas: [
      ['Elige el algoritmo: (a) GPS de casa a un destino con distancias positivas, (b) arbitraje con ganancias y pérdidas, (c) distancias entre las 50 estaciones de un metro.', '(a) Dijkstra o A*; (b) Bellman-Ford (pesos negativos y ciclos negativos); (c) Floyd-Warshall (todos los pares).'],
      ['Completa la tabla: ¿qué resuelve y qué complejidad tiene cada uno de Dijkstra, A*, Bellman-Ford y Floyd-Warshall?', 'Dijkstra: origen a todos, O(E log V); A*: origen a destino, O(E log V); Bellman-Ford: origen a todos con negativos, O(V · E); Floyd-Warshall: todos los pares, O(V³).'],
      ['Con 5000 nodos, ¿Floyd-Warshall o Dijkstra desde cada nodo?', 'Depende de la densidad: Floyd-Warshall hace 5000³ = 1,25 · 10¹¹; Dijkstra desde cada nodo en un grafo ralo es mucho menor.'],
      ['¿Por qué importa el costo computacional en IA?', 'Floyd-Warshall con 10 000 nodos son 10¹² operaciones; elegir Dijkstra desde pocos orígenes puede ahorrar horas de cómputo y energía.']
    ],
    resumen: R`
- **Sin pesos** → BFS; **un origen, pesos ≥ 0** → Dijkstra; **destino fijo con heurística** → A\*; **negativos** → Bellman-Ford; **todos los pares** → Floyd-Warshall.
- Costos: **§O(E log V)§**, **§O(E log V)§**, **§O(V · E)§**, **§O(V³)§**.
- Elegir bien ahorra **horas y energía** en IA.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
