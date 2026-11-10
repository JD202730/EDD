/* teoria_extra_gf.js — Biblioteca: fórmulas, tablas comparativas, repaso y autoevaluación de las áreas Grafos (BFS y DFS) y Caminos mínimos.
   Se carga después de teoria_extra.js. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;
  const F = (id, area, nombre, formula, variables, cuando, ejemplo, condiciones, tema, alias) => B.formula({ id, area, nombre, formula, variables, cuando, ejemplo, condiciones, tema, alias });
  const T = (id, titulo, md, nota, fuente, temas) => B.tabla({ id, titulo, md: md.trim(), nota, fuente, temas });

  /* ===================================================== FÓRMULAS ===================================================== */
  F('gf-apreton', 'gf', 'Suma de grados y número de aristas', 'Σ grado(v) = 2 · |E|      (no dirigido)        |E| de un árbol = |V| − 1',
    ['§grado(v)§: número de vecinos de v', '§|E|§: número de aristas', '§|V|§: número de vértices'],
    'Comprobar una lista de adyacencia, contar aristas o decidir si un grafo conexo es un árbol.',
    'Grafo de la clase: A = 3, B = 2, C = 3, D = 1, E = 2, F = 3 y G = 2 suman **16** ⇒ |E| = 8.',
    ['Cada arista aparece **dos veces** en la lista de adyacencia de un grafo no dirigido.', 'En un grafo **dirigido** la suma de grados de salida es §|E|§.', 'Un grafo conexo con §|E| = |V| − 1§ es un árbol (no tiene ciclos).'], 'gf-grafo', 'grado aristas apreton de manos');
  F('gf-vplusE', 'gf', 'Costo de BFS y DFS: O(V + E)', 'tiempo = O(V) (cada vértice una vez) + O(E) (cada arista una vez) = O(V + E)      memoria extra = O(V)',
    ['§V§: vértices', '§E§: aristas', 'con lista de adyacencia'],
    'Justificar el costo de un recorrido (BFS o DFS) y compararlo con una matriz de adyacencia (§O(V²)§).',
    'Grafo de la clase: V = 7, E = 8: ≈ 7 + 16 operaciones (cada arista se mira desde sus dos extremos).',
    ['Se marca al **encolar** (o al visitar) para que cada nodo entre **una sola vez**.', 'En una cuadrícula m × n: §V = m·n§ y §E ≈ 2·m·n§ ⇒ §O(m × n)§.', 'Con matriz de adyacencia el recorrido cuesta §O(V²)§; con §list.pop(0)§ como cola, §O(V² + E)§.'], 'gf-complejidad', 'o(v+e) tiempo bfs dfs');
  F('cm-relajacion', 'cm', 'Relajación de una arista', 'si d(v) > d(u) + w(u, v):   d(v) ← d(u) + w(u, v);   parents[v] ← u',
    ['§d(v)§: menor costo conocido de origen a v (∞ al inicio, 0 en el origen)', '§w(u, v)§: peso de la arista', '§parents[v]§: predecesor de v en el mejor camino conocido'],
    'Actualizar distancias en Dijkstra, A* y Bellman-Ford.',
    '§d(S) = 0§, arista S → A de peso 5: 0 + 5 = 5 < ∞ ⇒ §d(A) = 5§ y §parents[A] = S§.',
    ['Solo se actualiza si **mejora** (estrictamente menor).', 'Con §d(u) = ∞§ no mejora nada (§∞ + w = ∞§).', 'Guardar los predecesores permite **reconstruir** el camino.'], 'cm-problema', 'relajar relaxation');
  F('cm-astar-f', 'cm', 'Prioridad de A*: f = g + h', 'f(v) = g(v) + h(v)      h admisible ⇔ h(v) ≤ costo real mínimo de v al destino',
    ['§g(v)§: costo real desde el origen hasta v', '§h(v)§: estimación del costo de v al destino', '§f(v)§: prioridad (se expande el de menor f)'],
    'Elegir qué nodo expande A* y comprobar que la heurística conserva el óptimo.',
    'S → X: §f(D) = g + h = 6 + 2 = 8§ (el menor tras expandir S, por eso D se expande primero).',
    ['**h = 0** da Dijkstra (admisible pero no guía).', 'Si h **sobrestima**, se pierde la garantía de optimalidad.', 'Cuadrícula de 4 direcciones: **Manhattan** §|Δx| + |Δy|§; mapa: **línea recta** §√(Δx² + Δy²)§.'], 'cm-astar', 'heuristica a estrella f g h manhattan');
  F('cm-floyd-rec', 'cm', 'Recurrencia de Floyd-Warshall', 'd_ij ← mín( d_ij , d_ik + d_kj )   para cada nodo intermedio k      tiempo O(V³)  espacio O(V²)',
    ['§d_ij§: menor costo conocido de i a j', '§k§: nodo intermedio que se prueba', '§V§: número de nodos'],
    'Calcular la distancia mínima entre **todos los pares** de nodos.',
    'Trueque: §d[Audífonos][PC] = 35§ (por Tarjeta y Tableta); §d[Reloj][Tarjeta] = ∞§.',
    ['El bucle de **k** va **afuera**; i y j adentro.', 'Admite pesos negativos pero **no ciclos negativos** (se nota §d_ii < 0§).', 'Con 10 000 nodos son §10¹²§ operaciones: si basta un origen, usa Dijkstra.'], 'cm-floyd', 'todos los pares matriz');
  F('cm-complejidades', 'cm', 'Costo de los algoritmos de caminos mínimos', 'Dijkstra O(V²) o O(E log V) · A* O(E log V) · Bellman-Ford O(V · E) · Floyd-Warshall O(V³)',
    ['§V§: vértices', '§E§: aristas'],
    'Elegir el algoritmo según los pesos, el destino y cuántos pares se necesitan.',
    'Grafo de 5 000 nodos: Floyd-Warshall §5000³ = 1,25 · 10¹¹§; Dijkstra desde un origen en un grafo ralo es de unos cientos de miles de operaciones.',
    ['Dijkstra y A* **no** admiten pesos negativos; Bellman-Ford y Floyd-Warshall **sí** (sin ciclos negativos).', 'Con un **heap**, Dijkstra pasa de §O(V²)§ a §O(E log V)§.', 'En un grafo **denso** (§E ≈ V²§) la versión lineal §O(V²)§ puede ser mejor que la del heap.'], 'cm-elegir', 'complejidad dijkstra bellman floyd');

  /* ===================================================== TABLAS ===================================================== */
  T('gf-bfs-dfs', 'BFS frente a DFS', R`
| Aspecto | **BFS** (anchura) | **DFS** (profundidad) |
|---|---|---|
| Estructura | **Cola** (FIFO) | **Pila** (LIFO) o recursión |
| Explora | **Nivel por nivel** | **Un camino hasta el fondo** |
| Complejidad | §O(V + E)§ | §O(V + E)§ |
| ¿Camino más corto (sin pesos)? | **Sí** | **No** |
| Usos típicos | distancia mínima, niveles, grados de separación | ciclos, componentes, *backtracking* |
| Riesgo | frontera grande (memoria) | desbordar la pila (recursión) |
| Regla mnemotécnica | cola → el más cercano primero | pila → lo más profundo primero |`,
    'Es el mismo recorrido de árboles de la semana 6 (por niveles y preorden), ahora con un conjunto de visitados por los ciclos.', 'S12-C1 · d.11', ['gf-vs', 'gf-bfs', 'gf-dfs']);
  T('gf-lista-matriz', 'Lista de adyacencia frente a matriz de adyacencia', R`
| Aspecto | **Lista de adyacencia** | **Matriz de adyacencia** |
|---|---|---|
| Memoria | **§O(V + E)§** | §O(V²)§ |
| ¿Existe la arista (u, v)? | §O(grado de u)§ | **§O(1)§** |
| Recorrer los vecinos de u | **§O(grado de u)§** | §O(V)§ |
| BFS o DFS completo | **§O(V + E)§** | §O(V²)§ |
| Conviene en grafos | **ralos** | **densos** |`,
    'Las clases de BFS, DFS y caminos mínimos usan la lista de adyacencia (un diccionario).', 'S12-C1 · d.14 (complemento)', ['gf-grafo', 'gf-complejidad']);
  T('cm-comparacion', 'Comparación de los cuatro algoritmos de caminos mínimos', R`
| Algoritmo | Resuelve | Pesos negativos | Complejidad |
|---|---|---|---|
| **Dijkstra** | origen a todos | No | §O(E log V)§ |
| **A\*** | origen a destino | No | §O(E log V)§ (explora menos con buena heurística) |
| **Bellman-Ford** | origen a todos | **Sí** | §O(V · E)§ |
| **Floyd-Warshall** | **todos los pares** | **Sí** (sin ciclos negativos) | §O(V³)§ |`,
    'Cómo elegir: pesos no negativos y un origen → Dijkstra; destino fijo con heurística → A*; pesos negativos → Bellman-Ford; todos los pares en un grafo pequeño o denso → Floyd-Warshall.', 'S12-C2 · d.26', ['cm-elegir', 'cm-dijkstra', 'cm-astar', 'cm-bellman', 'cm-floyd']);
  T('cm-dijkstra-vs-astar', 'Dijkstra frente a A* en el grafo de la clase (S → X)', R`
| | **Dijkstra** | **A\*** |
|---|---|---|
| Prioridad | solo el costo real g | **f = g + h** |
| Nodos cerrados o expandidos | 9: S A C D B F E I X | **6**: S D C E B X |
| Nodos que nunca toca | ninguno (cierra todos hasta X) | **A, G, F, I** |
| Distancia y camino | 11 por S D E X | 11 por S D E X |
| Necesita | solo el grafo | el grafo **y una heurística admisible** |`,
    'La heurística dirige la búsqueda hacia X en lugar de explorar en todas las direcciones; el óptimo es el mismo.', 'S12-C2 · d.18, 31', ['cm-astar', 'cm-dijkstra']);

  /* ===================================================== REPASO ===================================================== */
  B.repasoSec({ id: 'grafos-recorridos', icono: '🕸', titulo: 'Grafos: BFS y DFS', md: R`
**Grafo.** Vértices + aristas (dirigido o no, ponderado o no). **Lista de adyacencia** (§grafo = {'A': ['B', 'C']}§): §O(V + E)§ de memoria. Suma de grados = 2·|E|. Árbol = grafo conexo sin ciclos.

**BFS (anchura).** **Cola** (FIFO) + visitados; se marca **al encolar**. Explora **por niveles**; cola → el más cercano primero. Orden de la clase desde A: **A B C D E F G**. Con §prev§ da el **camino con menos aristas** (sin pesos): se sigue §prev§ hacia atrás desde el destino y se invierte.

**DFS (profundidad).** **Pila** (LIFO) o recursión + visitados; baja hasta el fondo y **retrocede**. Orden de la clase desde A: **A B E F C G D**. El iterativo sin invertir visita primero al **último** vecino (**A D C G F E B**); con §reversed§ coincide con el recursivo. **No** garantiza el camino más corto.

**Elegir.** Mínimo de saltos → **BFS**; ciclos y *backtracking* → **DFS**; solo «¿se llega?» → cualquiera. Los dos son **§O(V + E)§**.

**Islas y componentes.** Barrer la cuadrícula; en tierra **no visitada**: **+1 isla** y marcar toda con BFS/DFS: **§O(m × n)§**. Es contar componentes conexas. BFS iterativo evita desbordar la pila.

**Errores.** Sin visitados (no termina con ciclos); marcar al desencolar; creer que DFS da el camino más corto; recursión en grafos enormes.` });
  B.repasoSec({ id: 'caminos-minimos', icono: '🧭', titulo: 'Caminos mínimos: Dijkstra, A*, Bellman-Ford y Floyd-Warshall', md: R`
**Problema.** En un grafo **ponderado** el camino mínimo suma **pesos**; BFS cuenta saltos y no sirve. **Relajar** (u, v): si §d(v) > d(u) + w§ entonces §d(v) = d(u) + w§ y §parents[v] = u§. Costos iniciales **∞** (0 en el origen).

**Dijkstra.** Greedy con cola de prioridad: **cierra** el nodo abierto más barato y relaja sus aristas; **pesos ≥ 0**. §O(V²)§ con búsqueda lineal (clase), **§O(E log V)§** con heap (descartar entradas obsoletas). Trueque: **35**; S → X: **11** por **S D E X** (cierra S A C D B F E I X).

**Pesos negativos.** Dijkstra cierra nodos asumiendo que no mejorarán y falla. **Bellman-Ford**: relaja **todas las aristas |V| − 1 veces**, **§O(V · E)§**; una pasada extra que aún mejora ⇒ **ciclo negativo** (no hay camino mínimo).

**A\*.** Dijkstra con prioridad **f = g + h** y destino fijo; **h admisible** (nunca sobrestima) ⇒ óptimo; h = 0 ⇒ Dijkstra. Manhattan (cuadrícula 4 dir.), línea recta (mapas). S → X: expande **6** nodos (S D C E B X) frente a 9.

**Floyd-Warshall.** Todos los pares con DP: §d_ij ← mín(d_ij, d_ik + d_kj)§ para cada intermedio k; **§O(V³)§** y §O(V²)§.

**Elegir.** Un origen, pesos ≥ 0 → Dijkstra; destino fijo con heurística → A*; negativos → Bellman-Ford; todos los pares (grafo pequeño o denso) → Floyd-Warshall.` });
  B.repasoSec({ id: 'grafos-pasos', icono: '🪜', titulo: 'Pasos de los ejercicios de grafos y caminos mínimos', md: R`
**Orden BFS / DFS.** Dibuja la cola (o la pila de llamadas) y los visitados. BFS: desencola, **encola los vecinos nuevos en el orden de la lista** y márcalos al encolar. DFS: baja por el **primer vecino no visitado**; al agotar un nodo, retrocede.

**Contenido de la cola o la pila tras k pasos.** Aplica k pasos: BFS saca del **frente** y mete al **final**; el DFS iterativo saca del **tope** y apila los vecinos nuevos (en el orden de la lista).

**Camino con prev.** Sigue §prev§ desde el destino hasta el origen e invierte; cuenta las aristas.

**Contar islas.** Barre fila por fila; al hallar tierra sin marcar, suma 1 y marca toda la isla (4 vecinas).

**Dijkstra a mano.** Tabla nodo / costo / predecesor. Cierra el no procesado de menor costo y relaja sus aristas (solo si mejora). En empate, el primero del diccionario.

**A\* a mano.** Igual, pero se expande el de menor **f = g + h** y se detiene al expandir el destino.

**Bellman-Ford a mano.** Aristas en el orden dado; cada pasada recorre **todas** con los valores ya actualizados; pasada extra para ciclos negativos.

**Floyd-Warshall a mano.** Matriz inicial; para cada intermedio k (en orden) mejora d[i][j] con d[i][k] + d[k][j] (si un tramo es ∞ no mejora).` });
  B.repasoSec({ id: 'grafos-confusiones', icono: '⚠', titulo: 'Confusiones frecuentes (grafos y caminos mínimos)', md: R`
- **BFS con pesos**: BFS minimiza **saltos**, no suma de pesos (para eso, Dijkstra).
- **DFS = camino más corto**: no; solo BFS lo garantiza (sin pesos).
- **Marcar al desencolar** en BFS: el nodo entra varias veces; se marca **al encolar**.
- **DFS iterativo ≠ DFS recursivo** en el orden, salvo que se apile con §reversed§.
- **Dijkstra con pesos negativos**: da resultados incorrectos aunque termine.
- **Heurística no admisible** en A*: se pierde el óptimo; **h = 0** sí es admisible.
- **Floyd-Warshall para un solo origen**: gasta §O(V³)§; basta Dijkstra.
- **Ciclo negativo ≠ arista negativa**: la arista negativa se maneja con Bellman-Ford; el ciclo negativo no tiene camino mínimo.` });

  /* ===================================================== AUTOEVALUACIÓN ===================================================== */
  B.autoevalua('gf', [
    ['Da el orden BFS y el orden DFS recursivo desde A del grafo A–B, A–C, A–D, B–E, C–F, C–G, E–F, F–G (vecinos en orden alfabético).', 'BFS: A B C D E F G (por niveles). DFS: A B E F C G D.'],
    ['¿Qué estructura usa BFS y cuál DFS? ¿Por qué ambos son O(V + E)?', 'BFS una cola (FIFO) y DFS una pila (LIFO) o la recursión. Cada vértice se procesa una vez y cada arista se examina una vez.'],
    ['¿Cuál garantiza el camino más corto sin pesos y por qué?', 'BFS: explora por niveles, así que descubre cada nodo por primera vez por el camino con menos aristas.'],
    ['¿Por qué se marca visitado al encolar y no al desencolar en BFS?', 'Para que un nodo no entre varias veces a la cola; con el marcado tardío dos vecinos podrían encolarlo antes de que salga.'],
    ['Describe cómo BFS o DFS cuenta el número de islas de una cuadrícula.', 'Se recorre cada celda; al hallar tierra no visitada se suma 1 y se lanza un recorrido que marca toda su isla. Cada celda se visita una vez: O(m × n).'],
    ['Elige BFS o DFS: mínimo de saltos entre dos personas; detectar un ciclo de dependencias; backtracking en un juego.', 'BFS; DFS; DFS.']
  ]);
  B.autoevalua('cm', [
    ['¿Por qué BFS no sirve en un grafo ponderado? Da un ejemplo.', 'Cuenta saltos y no pesos: con S–A = 1, A–D = 1 y S–D = 5, BFS elige S → D (costo 5) pero el de menor costo es S → A → D (costo 2).'],
    ['¿Qué estructura usa Dijkstra para elegir el próximo nodo y por qué? ¿Qué complejidad tiene?', 'Una cola de prioridad (heap) para extraer el nodo no procesado más cercano; O(E log V) con heap (O(V²) con búsqueda lineal).'],
    ['¿Qué es la relajación de una arista?', 'Probar si llegar a v por u mejora: si d(v) > d(u) + w, se actualiza d(v) = d(u) + w y el predecesor de v pasa a ser u.'],
    ['¿En qué se diferencia A* de Dijkstra y cuándo conserva el óptimo?', 'A* prioriza por f = g + h con una heurística hacia un destino fijo y explora menos nodos; conserva el óptimo si h es admisible (nunca sobrestima).'],
    ['¿Cuándo usar Bellman-Ford y cuándo Floyd-Warshall?', 'Bellman-Ford con pesos negativos desde un origen (O(V · E), detecta ciclos negativos); Floyd-Warshall para todos los pares en grafos pequeños o densos (O(V³)).'],
    ['¿Por qué Dijkstra falla con pesos negativos?', 'Cierra un nodo suponiendo que su distancia ya es definitiva; con una arista negativa posterior puede aparecer un camino mejor cuando el nodo ya está cerrado.']
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
