/* banco_ext4.js — preguntas de los niveles 15 (Grafos: BFS y DFS, S12-C1) y 16 (Caminos mínimos: Dijkstra, A*, Bellman-Ford y Floyd-Warshall, S12-C2).
   Los grafos de cada pregunta se generan con semilla (ET.Sim.grafo) y la respuesta sale de las MISMAS trazas que se animan en el Laboratorio, así que
   lo que se corrige es lo que se enseña; las preguntas de código se verifican ejecutando una solución de referencia con el intérprete. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, G = ET.Sim.grafo, PQ = ET.PQ, H = ET.BancoExt, B = ET.Banco.add, dd = U.dedent;

  /* ---------- ayudas ---------- */
  const nom = (g, a) => a.map(i => g.nom[i]);
  const bloque = c => '\n```\n' + c + '\n```\n';
  /** la lista de adyacencia como dict de Python, un nodo por línea */
  const pyDict = (g, pond, nombre) => (nombre || 'grafo') + ' = {\n' + g.nom.map((s, u) => "    '" + s + "': " + (pond ? '{' + g.ady[u].map(e => "'" + g.nom[e.v] + "': " + e.w).join(', ') + '}' : '[' + g.ady[u].map(e => "'" + g.nom[e.v] + "'").join(', ') + ']')).join(',\n') + '\n}';
  const grafoAl = (rng, n, grado, pond) => G.aleatorio(n, grado, rng.int(1, 2000000000), { pond });
  const fig = (g, titulo, o) => H.fig(G.figura(g, o), titulo);
  const simDe = (T, codigo, titulo, tit2) => H.sim(G.frames(T), codigo, tit2 || T.alg, titulo);
  const FIN = (x) => x === Infinity ? 'inf' : String(x);
  const niveles = (g, T) => { const m = {}; T.res.nivel.forEach((l, v) => { (m[l] = m[l] || []).push(g.nom[v]); }); return Object.keys(m).map(l => 'nivel ' + l + ': ' + m[l].join(', ')).join(' · '); };
  const costos = (g, a) => g.nom.map((s, i) => s + ' = ' + FIN(a[i])).join(', ');

  /* =============================================================================== NIVEL 15 · Grafos: BFS y DFS =============================================================================== */
  H.vf('n15-vf', 15, 'A', 1, ['gr_def', 'gr_bfs', 'gr_dfs', 'gr_vs', 'gr_camino', 'gr_islas'], 'Grafos, BFS y DFS (V/F)', [
    { a: 'BFS usa una cola (FIFO) y DFS una pila (LIFO) o la pila de llamadas de la recursión.', v: true, e: 'Cola → BFS → el más cercano primero; pila → DFS → lo más profundo primero.', j: ['La cola entrega primero al nodo más antiguo (el más cercano al origen); la pila, al más reciente (el más profundo).', 'Los dos usan una cola, pero DFS la recorre al revés.', 'Los dos usan una pila; BFS solo cambia el orden de los vecinos.'] },
    { a: 'En un grafo con ciclos, BFS y DFS terminan aunque no se lleve un conjunto de visitados.', v: false, e: 'Sin visitados se vuelve una y otra vez por el ciclo: el recorrido no termina.', j: ['Sin el conjunto de visitados se recorre el ciclo indefinidamente.', 'Terminan porque cada arista se usa una sola vez por definición.', 'Terminan porque la cola o la pila se vacían siempre.'] },
    { a: 'En un grafo sin pesos, BFS halla el camino con menos aristas entre dos nodos.', v: true, e: 'BFS descubre cada nodo por primera vez por el camino con menos aristas.', j: ['BFS explora por niveles: el primer camino que llega a un nodo es el de menos saltos.', 'Porque BFS suma los pesos de las aristas.', 'Porque BFS siempre visita primero al destino.'] },
    { a: 'DFS siempre halla el camino más corto entre dos nodos.', v: false, e: 'DFS baja por un camino hasta el fondo: puede llegar por uno muy largo.', j: ['DFS no explora por niveles; el primer camino que encuentra puede ser largo.', 'Es cierto porque DFS visita menos nodos.', 'Es cierto porque usa recursión.'] },
    { a: 'BFS y DFS tienen costo O(V + E) con una lista de adyacencia.', v: true, e: 'Cada vértice y cada arista se procesan una sola vez.', j: ['Cada nodo entra una vez a la cola o pila y cada arista se examina una vez.', 'Cuestan O(V · E) porque por cada nodo se recorren todas las aristas.', 'BFS cuesta O(V + E) pero DFS cuesta O(V²).'] },
    { a: 'En BFS conviene marcar un nodo como visitado al desencolarlo, no al encolarlo.', v: false, e: 'Marcar al encolar evita que un nodo entre varias veces a la cola.', j: ['Si se marca al desencolar, un nodo puede encolarse varias veces antes de procesarse.', 'Marcar al encolar es un error porque el nodo todavía no se visitó.', 'Da igual: el costo no cambia.'] },
    { a: 'Una lista de adyacencia ocupa O(V + E); una matriz de adyacencia ocupa O(V²).', v: true, e: 'La lista guarda solo las aristas que existen; la matriz reserva una casilla por cada par de vértices.', j: ['La lista guarda un elemento por arista y por vértice; la matriz una casilla por cada par (V × V).', 'Las dos ocupan O(V + E).', 'La lista ocupa O(V²) porque cada vértice guarda una lista.'] },
    { a: 'Un árbol es un grafo conexo sin ciclos.', v: true, e: 'Es la definición: conexo (hay camino entre todo par) y sin ciclos.', j: ['Un árbol conecta todos los nodos sin formar ciclos; por eso BFS y DFS de la semana 6 son un caso particular.', 'Un árbol puede tener ciclos si son pequeños.', 'Un árbol es un grafo dirigido con una sola raíz y ciclos.'] },
    { a: 'Para contar islas en una cuadrícula se lanza un BFS o DFS desde cada celda de tierra, incluso si ya fue visitada.', v: false, e: 'Solo se lanza desde la tierra **no visitada**; así cada celda se visita una vez.', j: ['Lanzar el recorrido solo desde tierra no visitada marca cada isla una vez y suma 1 por isla.', 'Hay que lanzarlo desde todas para no perder islas.', 'Se lanza desde cada celda porque una celda de agua también puede ser una isla.'] },
    { a: 'Con islas enormes, el BFS iterativo con cola evita el desbordamiento de pila que puede causar el DFS recursivo.', v: true, e: 'La recursión de DFS puede llegar a profundidad O(V); la cola no usa la pila de llamadas.', j: ['La recursión del DFS apila una llamada por celda; con millones de celdas desborda la pila.', 'El BFS visita menos celdas y por eso no desborda nada.', 'No hay diferencia: los dos recursan igual.'] }
  ], ['Piensa en la estructura: cola (FIFO) → BFS; pila (LIFO) → DFS.', 'Recuerda qué evita el conjunto de visitados y cuándo se marca.', 'BFS es el único de los dos que garantiza el camino más corto sin pesos.']);

  H.clasif('n15-clasif-bfs-dfs', 15, 'A', 2, ['gr_vs', 'gr_bfs', 'gr_dfs'], 'BFS o DFS', 'Para cada tarea, elige el recorrido adecuado (S12-C1, diap. 11 y 13): **BFS** (cola), **DFS** (pila o recursión) o **cualquiera de los dos**.', ['BFS (cola)', 'DFS (pila o recursión)', 'Cualquiera de los dos'], [
    ['Hallar el número mínimo de saltos entre dos personas en una red social', 'BFS (cola)', 'Solo BFS garantiza el camino con menos aristas.'], ['Detectar si un grafo de dependencias tiene un ciclo', 'DFS (pila o recursión)', 'DFS recuerda el camino actual y detecta cuándo vuelve a un nodo de él.'],
    ['Encontrar cualquier camino entre dos nodos (no necesariamente el más corto)', 'Cualquiera de los dos', 'Los dos hallan un camino si existe.'], ['Recorrer un árbol de decisiones de un juego con backtracking', 'DFS (pila o recursión)', 'El backtracking baja hasta el fondo y retrocede.'],
    ['Calcular a qué nivel (distancia en aristas) está cada nodo desde el origen', 'BFS (cola)', 'BFS explora por niveles.'], ['Contar las islas de una cuadrícula', 'Cualquiera de los dos', 'Basta marcar toda la isla desde una celda de tierra no visitada.'],
    ['Hallar la salida más cercana de un laberinto', 'BFS (cola)', 'BFS visita primero lo más cercano.'], ['Comprobar si dos ciudades están conectadas por carretera', 'Cualquiera de los dos', 'Solo importa si se llega, no por dónde.'],
    ['Explorar un camino hasta el fondo antes de volver a probar otro', 'DFS (pila o recursión)', 'Es la definición del recorrido en profundidad.'], ['Visitar primero a todos los vecinos y luego a los vecinos de los vecinos', 'BFS (cola)', 'Eso es recorrer por niveles.']
  ], ['¿Importa que el camino sea el más corto en saltos? Entonces BFS.', 'Backtracking y detección de ciclos son clásicos de DFS.', 'Si solo importa «¿se llega?», sirve cualquiera.'], 'Cola → BFS → el más cercano primero. Pila → DFS → lo más profundo primero. Los dos son O(V + E).');

  B({
    id: 'n15-grado-aristas', n: 15, e: 'A', dif: 1, c: ['gr_def'], tema: 'Aristas y grado de un grafo',
    gen(rng) {
      const g = grafoAl(rng, rng.int(5, 8), 2 + rng.next() * 1.2, false), aristas = G.numAristas(g), v = rng.int(0, g.n - 1), grado = g.ady[v].length, pideGrado = rng.chance(.5);
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Lectura de un grafo', placeholder: 'Un número', esperado: String(pideGrado ? grado : aristas), figura: fig(g, 'El grafo'),
        enunciado: 'Este es un grafo **no dirigido** (figura) y su lista de adyacencia:' + bloque(pyDict(g)) + (pideGrado ? '¿Cuál es el **grado** del nodo **' + g.nom[v] + '** (cuántos vecinos tiene)?' : '¿Cuántas **aristas** tiene el grafo?'),
        pistas: pideGrado ? ['El grado de un nodo es la cantidad de vecinos: el largo de su lista de adyacencia.', 'Cuenta los elementos de la lista de ' + g.nom[v] + ' o las líneas que salen de él en la figura.', 'En un grafo no dirigido cada arista aparece en la lista de sus dos extremos.'] : ['En un grafo no dirigido cada arista aparece **dos veces** en la lista de adyacencia (una por extremo).', 'Suma los largos de todas las listas y divide entre 2.', 'También puedes contar las líneas de la figura.'],
        explicacion: pideGrado ? 'El nodo ' + g.nom[v] + ' tiene los vecinos ' + nom(g, g.ady[v].map(e => e.v)).join(', ') + ': grado **' + grado + '**.' : 'La suma de los grados es ' + (aristas * 2) + ' (cada arista cuenta dos veces), así que hay **' + aristas + '** aristas.'
      };
    }
  });

  B({
    id: 'n15-orden-bfs', n: 15, e: 'A', dif: 2, c: ['gr_bfs'], tema: 'Orden de visita de BFS',
    gen(rng) {
      const g = grafoAl(rng, rng.int(6, 8), 2.2 + rng.next() * .8, false), T = G.bfs(g, 0, -1), orden = nom(g, T.res.orden);
      return {
        tipo: 'salida', tokens: true, fmt: 'Recorrido', placeholder: 'A B C …', esperado: orden.join(' '), figura: fig(g, 'El grafo (origen A)'),
        enunciado: 'Se ejecuta **BFS** desde el nodo **A** sobre este grafo (el código visita los vecinos **en el orden de la lista**):' + bloque(pyDict(g)) + 'Escribe los nodos en el **orden en que BFS los visita**, separados por espacios.',
        pistas: ['BFS usa una **cola**: primero el origen; al desencolar un nodo se encolan sus vecinos aún no visitados, en el orden de su lista.', 'Cada nodo se visita una vez; marcar al encolar evita repetirlos.', 'El orden resultante agrupa los nodos **por niveles**: primero el origen, luego sus vecinos, luego los vecinos de estos…'],
        explicacion: 'Orden BFS: **' + orden.join(' ') + '** (' + niveles(g, T) + ').',
        sim: simDe(T, G.CODIGO.bfs, 'BFS desde A, paso a paso')
      };
    }
  });

  B({
    id: 'n15-orden-dfs', n: 15, e: 'A', dif: 2, c: ['gr_dfs'], tema: 'Orden de visita de DFS',
    gen(rng) {
      const g = grafoAl(rng, rng.int(6, 8), 2.2 + rng.next() * .8, false), T = G.dfsRec(g, 0, -1), orden = nom(g, T.res.orden);
      return {
        tipo: 'salida', tokens: true, fmt: 'Recorrido', placeholder: 'A B C …', esperado: orden.join(' '), figura: fig(g, 'El grafo (origen A)'),
        enunciado: 'Se ejecuta **DFS recursivo** desde el nodo **A** (`dfs_recursivo(grafo, u, visitados, …)`), recorriendo los vecinos **en el orden de la lista**:' + bloque(pyDict(g)) + 'Escribe los nodos en el **orden en que DFS los visita**, separados por espacios.',
        pistas: ['DFS baja por el **primer vecino no visitado** y solo retrocede cuando un nodo ya no tiene vecinos nuevos.', 'Lleva la pila de llamadas: cada llamada recuerda por cuál vecino iba.', 'Al retroceder, el nodo anterior sigue con su siguiente vecino de la lista.'],
        explicacion: 'Orden DFS: **' + orden.join(' ') + '**. La pila de llamadas llegó a una profundidad máxima de ' + T.res.maxEstr + '.',
        sim: simDe(T, G.CODIGO.dfsRec, 'DFS recursivo desde A, paso a paso')
      };
    }
  });

  B({
    id: 'n15-nivel', n: 15, e: 'B', dif: 2, c: ['gr_bfs', 'gr_camino'], tema: 'Nivel de un nodo con BFS',
    gen(rng) {
      const g = grafoAl(rng, rng.int(7, 9), 2 + rng.next() * .7, false), T = G.bfs(g, 0, -1), cand = []; T.res.nivel.forEach((l, v) => { if (l >= 2) cand.push(v); }); const v = cand.length ? rng.pick(cand) : g.n - 1;
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Distancia en aristas', placeholder: 'Un número', esperado: String(T.res.nivel[v]), figura: fig(g, 'El grafo (origen A)'),
        enunciado: 'En este grafo sin pesos' + bloque(pyDict(g)) + '¿a qué **nivel** está el nodo **' + g.nom[v] + '** al hacer BFS desde **A** (cuántas aristas tiene el camino **más corto** de A a ' + g.nom[v] + ')?',
        pistas: ['El origen está en el nivel 0; sus vecinos, en el nivel 1; los vecinos nuevos de estos, en el 2…', 'BFS descubre cada nodo por primera vez por el camino con menos aristas.', 'Cuenta niveles hasta llegar al nodo.'],
        explicacion: 'Niveles: ' + niveles(g, T) + '. El nodo ' + g.nom[v] + ' está en el nivel **' + T.res.nivel[v] + '**: camino más corto ' + nom(g, G.camino(T.res.prev, 0, v)).join(' → ') + '.',
        sim: simDe(T, G.CODIGO.bfs, 'BFS desde A, paso a paso')
      };
    }
  });

  B({
    id: 'n15-cola-estado', n: 15, e: 'B', dif: 3, c: ['gr_bfs'], tema: 'Contenido de la cola de BFS',
    gen(rng) {
      let g, T, k;
      for (let t = 0; t < 60; t++) { g = grafoAl(rng, rng.int(7, 9), 2.2 + rng.next() * .8, false); T = G.bfs(g, 0, -1); k = rng.int(2, 4); if (T.pasos.length > k + 2 && T.pasos[k].ds.length >= 2) break; }
      const ds = nom(g, T.pasos[k].ds);
      return {
        tipo: 'salida', tokens: true, fmt: 'Estado de la cola', placeholder: 'de frente a final', esperado: ds.join(' '), figura: fig(g, 'El grafo (origen A)'),
        enunciado: 'BFS desde **A** (vecinos en el orden de la lista; se marca como visitado **al encolar**):' + bloque(pyDict(g)) + 'Justo después de **desencolar y procesar ' + k + ' nodos** (el origen cuenta como el primero), ¿qué nodos hay en la **cola**, de **frente a final**? Sepáralos con espacios.',
        pistas: ['Al inicio la cola tiene solo el origen. Cada paso: sale el del frente y entran sus vecinos no visitados (al final).', 'Un nodo que ya entró a la cola alguna vez no vuelve a entrar.', 'Haz una tabla: nodo desencolado → nodos que encola → cola resultante.'],
        explicacion: 'Tras ' + k + ' pasos la cola es **' + ds.join(' ') + '** (el primero sale primero).',
        sim: simDe(T, G.CODIGO.bfs, 'BFS: la cola en cada paso')
      };
    }
  });

  B({
    id: 'n15-pila-estado', n: 15, e: 'B', dif: 3, c: ['gr_dfs'], tema: 'Contenido de la pila del DFS iterativo',
    gen(rng) {
      let g, T, k;
      for (let t = 0; t < 60; t++) { g = grafoAl(rng, rng.int(6, 8), 2.2 + rng.next() * .8, false); T = G.dfsIter(g, 0, -1); k = rng.int(1, 3); if (T.pasos.length > k + 2 && T.pasos[k].ds.length >= 2) break; }
      const ds = nom(g, T.pasos[k].ds);
      return {
        tipo: 'salida', tokens: true, fmt: 'Estado de la pila', placeholder: 'de abajo hacia arriba (el tope al final)', esperado: ds.join(' '), figura: fig(g, 'El grafo (origen A)'),
        enunciado: 'Se ejecuta el **DFS iterativo** de la clase desde **A** (`pila.pop()`; al visitar un nodo se **apilan sus vecinos no visitados en el orden de la lista**; un nodo puede entrar a la pila varias veces):' + bloque(pyDict(g)) + 'Después de **desapilar y visitar ' + k + ' nodo' + (k > 1 ? 's' : '') + '** (empezando por A), ¿qué hay en la **pila**, de **abajo hacia arriba**? Sepáralos con espacios.',
        pistas: ['La pila empieza con [A]. Cada paso: `pop()` del tope; si ya estaba visitado se descarta; si no, se visita y se apilan sus vecinos no visitados.', 'Como se apila en el orden de la lista, el **último vecino** queda en el tope y es el primero en salir.', 'Escribe el contenido de abajo hacia arriba: el tope va al final.'],
        explicacion: 'Tras ' + k + ' paso' + (k > 1 ? 's' : '') + ' la pila es **' + ds.join(' ') + '** (el último es el tope).',
        sim: simDe(T, G.CODIGO.dfsIter, 'DFS iterativo: la pila en cada paso')
      };
    }
  });

  B({
    id: 'n15-camino-bfs', n: 15, e: 'B', dif: 3, c: ['gr_camino', 'gr_bfs'], tema: 'Camino más corto con BFS',
    gen(rng) {
      let g, T, t;
      for (let i = 0; i < 80; i++) { g = grafoAl(rng, rng.int(7, 9), 2 + rng.next() * .7, false); const T0 = G.bfs(g, 0, -1), cand = []; T0.res.nivel.forEach((l, v) => { if (l >= 2) cand.push(v); }); if (cand.length) { t = rng.pick(cand); T = G.bfs(g, 0, t); break; } }
      if (!T) { g = G.clase(); t = 6; T = G.bfs(g, 0, 6); }
      const cam = nom(g, T.res.camino);
      return {
        tipo: 'salida', tokens: true, fmt: 'Camino', placeholder: 'A … ' + g.nom[t], esperado: cam.join(' '), figura: fig(g, 'El grafo (origen A, destino ' + g.nom[t] + ')', { camino: [] }),
        enunciado: 'BFS guarda en `prev[v]` desde qué nodo llegó a `v` (al encolarlo, con los vecinos en el orden de la lista). En este grafo' + bloque(pyDict(g)) + 'escribe el **camino más corto** de **A** a **' + g.nom[t] + '** que reconstruye `prev` (de A hasta ' + g.nom[t] + ', separado por espacios).',
        pistas: ['Sigue `prev` hacia atrás desde el destino hasta A y luego invierte el orden.', '`prev[v]` es el nodo que **descubrió** a `v` por primera vez, con los vecinos en el orden de la lista.', 'Si dos caminos tienen la misma longitud, vale el que BFS descubre primero.'],
        explicacion: 'Camino: **' + cam.join(' → ') + '** (' + (cam.length - 1) + ' aristas). Se obtiene siguiendo `prev` desde ' + g.nom[t] + ' hasta A: ' + nom(g, G.camino(T.res.prev, 0, t).slice().reverse()).join(', ') + '.',
        sim: simDe(T, G.CODIGO.bfs, 'BFS de A hasta ' + g.nom[t])
      };
    }
  });

  B({
    id: 'n15-islas-contar', n: 15, e: 'B', dif: 2, c: ['gr_islas'], tema: 'Contar islas en una cuadrícula',
    gen(rng) {
      let g, k = 0;
      for (let t = 0; t < 80; t++) { g = G.islas(rng.int(4, 5), rng.int(6, 8), rng.int(1, 2000000000), rng.int(38, 55), false); k = G.contarIslas(g, -1, -1, {}).res.islas; if (k >= 2 && k <= 5) break; }
      const m = []; for (let r = 0; r < g.filas; r++) { const f = []; for (let c = 0; c < g.cols; c++) f.push(g.tierra[r * g.cols + c]); m.push(f.join(' ')); }
      const T = G.contarIslas(g, -1, -1, { pila: false });
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Contar islas', placeholder: 'Un número', esperado: String(k),
        enunciado: 'En esta cuadrícula **1 = tierra** y **0 = agua**. Una isla es un grupo de celdas de tierra conectadas por **arriba, abajo, izquierda o derecha** (no por diagonal):' + bloque(m.join('\n')) + '¿Cuántas **islas** hay?',
        pistas: ['Recorre la cuadrícula; cada vez que encuentres tierra que no hayas marcado, cuenta una isla nueva y marca **toda** esa isla.', 'Las celdas que se tocan solo por una esquina **no** están conectadas.', 'Así cada celda se visita una vez: O(filas × columnas).'],
        explicacion: 'Hay **' + k + '** isla' + (k === 1 ? '' : 's') + ' (tamaños: ' + T.res.tamanos.join(', ') + ' celdas). Se lanza un BFS/DFS desde cada celda de tierra no visitada.',
        sim: H.sim(G.frames(T), G.CODIGO.islasBfs, 'contar_islas', 'Contar islas con BFS')
      };
    }
  });

  B({
    id: 'n15-componentes', n: 15, e: 'B', dif: 3, c: ['gr_islas', 'gr_def'], tema: 'Componentes conexas',
    gen(rng) {
      const k = rng.int(2, 4), n = rng.int(7, 10), tam = []; let resto = n;
      for (let i = 0; i < k; i++) { const s = i === k - 1 ? resto : rng.int(1, Math.min(resto - (k - i - 1), 4)); tam.push(s); resto -= s; }
      const perm = rng.shuffle(Array.from({ length: n }, (_, i) => i)), aristas = [], grupos = []; let p = 0;
      tam.forEach(s => { const c = perm.slice(p, p + s); p += s; grupos.push(c); for (let j = 1; j < c.length; j++) aristas.push([c[j], c[rng.int(0, j - 1)], 1]); if (c.length >= 3 && rng.chance(.5)) aristas.push([c[0], c[c.length - 1], 1]); });
      const x = [], y = [];
      grupos.forEach((c, ci) => { const cx = 350 + (k > 1 ? 190 * Math.cos(2 * Math.PI * ci / k - Math.PI / 2) : 0), cy = 160 + (k > 1 ? 100 * Math.sin(2 * Math.PI * ci / k - Math.PI / 2) : 0); c.forEach((v, j) => { const a = 2 * Math.PI * j / c.length, r = c.length === 1 ? 0 : 38; x[v] = Math.round(cx + r * Math.cos(a)); y[v] = Math.round(cy + r * Math.sin(a)); }); });
      const seen = new Set(); aristas.forEach(a => { const key = a[0] < a[1] ? a[0] + ',' + a[1] : a[1] + ',' + a[0]; seen.add(key); });
      const g = G.crear(G.letras(n), Array.from(new Set(aristas.map(a => a[0] < a[1] ? a[0] + ',' + a[1] : a[1] + ',' + a[0]))).map(s => { const [a, b] = s.split(',').map(Number); return [a, b, 1]; }), { x, y, W: 700, H: 320, titulo: 'Un grafo con varias partes' });
      const comp = grupos.map(c => nom(g, c.slice().sort((a, b) => a - b)).join(', '));
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Componentes conexas', placeholder: 'Un número', esperado: String(k), figura: fig(g, 'El grafo'),
        enunciado: 'Este grafo **no dirigido** no es conexo: tiene varias partes separadas.' + bloque(pyDict(g)) + '¿Cuántas **componentes conexas** tiene (cuántas veces hay que lanzar un BFS o DFS desde un nodo no visitado para recorrerlo todo)?',
        pistas: ['Una componente conexa es un grupo de nodos alcanzables entre sí; no hay aristas hacia otros grupos.', 'Lanza un recorrido desde A: marca todo lo que alcanza. El siguiente nodo sin marcar empieza otra componente.', 'Un nodo sin vecinos es una componente por sí solo.'],
        explicacion: 'Hay **' + k + '** componentes: ' + comp.map(s => '{' + s + '}').join(', ') + '. Es el mismo método de contar islas: un recorrido por cada nodo no visitado.'
      };
    }
  });

  B({
    id: 'n15-cx-tabla', n: 15, e: 'B', dif: 2, c: ['gr_cx', 'gr_bfs', 'gr_dfs'], tema: 'Costos de BFS y DFS',
    gen() {
      const q = H.tablaCx(['Operación', 'Costo'], [
        ['BFS sobre un grafo con lista de adyacencia (V vértices, E aristas): tiempo', ['O(V + E)', 'V + E']], ['DFS sobre un grafo con lista de adyacencia: tiempo', ['O(V + E)', 'V + E']],
        ['BFS o DFS: memoria extra (visitados, cola o pila y `prev`)', ['O(V)', 'V']], ['Contar islas en una cuadrícula de m × n: tiempo', ['O(m × n)', 'O(m*n)', 'm × n', 'm*n', 'O(mn)']],
        ['Saber si existe la arista (u, v) con una **matriz** de adyacencia', ['O(1)', '1']], ['Memoria de una **matriz** de adyacencia', ['O(V²)', 'O(V^2)', 'V²']], ['Memoria de una **lista** de adyacencia', ['O(V + E)', 'V + E']]]);
      return Object.assign(q, {
        enunciado: 'Completa el costo de cada operación (S12-C1, diap. 7 y 12). Usa la notación `O(...)`.',
        pistas: ['Cada vértice entra una vez a la cola o a la pila y cada arista se examina una vez: V + E.', 'En una cuadrícula cada celda se visita una vez: filas × columnas.', 'La matriz reserva una casilla por cada par de vértices: V × V.'],
        explicacion: 'BFS y DFS: **O(V + E)** de tiempo y **O(V)** de memoria extra. Contar islas: **O(m × n)**. Matriz de adyacencia: O(1) para consultar una arista pero **O(V²)** de memoria; la lista ocupa **O(V + E)**.'
      });
    }
  });

  H.vf('n15-errores-vf', 15, 'B', 3, ['gr_cx', 'gr_bfs', 'gr_dfs', 'gr_camino'], 'Errores frecuentes con BFS y DFS (V/F)', [
    { a: 'Olvidar el conjunto de visitados en un grafo con ciclos hace que el recorrido no termine.', v: true, e: 'Se vuelve a los mismos nodos una y otra vez.', j: ['Sin visitados el recorrido puede recorrer el mismo ciclo indefinidamente.', 'Solo hace que el recorrido sea un poco más lento.', 'No pasa nada: la cola se vacía sola.'] },
    { a: 'Marcar visitado al desencolar (en vez de al encolar) en BFS puede meter un mismo nodo varias veces a la cola.', v: true, e: 'Dos vecinos de un nodo pueden encolarlo antes de que se desencole.', j: ['Entre que se encola y se desencola, otro nodo puede volver a encolarlo.', 'Es falso: el nodo se desencola una sola vez y es lo único que importa.', 'Solo pasa en grafos dirigidos.'] },
    { a: 'DFS recursivo en un grafo enorme puede desbordar la pila de llamadas.', v: true, e: 'La profundidad de la recursión puede llegar a O(V).', j: ['Cada nodo del camino actual es una llamada apilada; con un camino larguísimo se agota la pila.', 'Es falso porque la recursión usa el montículo.', 'Solo ocurre con BFS.'] },
    { a: 'El camino que encuentra DFS entre dos nodos es siempre el de menos aristas.', v: false, e: 'Solo BFS lo garantiza (sin pesos).', j: ['DFS toma el primer camino que encuentra al bajar al fondo, no el más corto.', 'DFS explora por niveles igual que BFS.', 'DFS siempre prueba primero el camino más corto.'] },
    { a: 'En el DFS iterativo con `pila.pop()`, un mismo nodo puede entrar a la pila más de una vez.', v: true, e: 'Si no se marca al apilar, varios vecinos pueden apilarlo; al desapilar se descarta si ya estaba visitado.', j: ['Se apila cuando se ve un vecino no visitado; otro nodo puede apilarlo antes de que se visite.', 'Es falso: cada nodo se apila exactamente una vez.', 'Solo ocurre si el grafo es un árbol.'] },
    { a: 'BFS y DFS tienen distinto costo asintótico: BFS es O(V + E) y DFS es O(V²).', v: false, e: 'Los dos son O(V + E) con lista de adyacencia.', j: ['Los dos visitan cada vértice y cada arista una sola vez.', 'DFS repite el recorrido desde cada nodo.', 'BFS necesita una matriz de adyacencia.'] }
  ], ['Piensa en qué pasaría con un ciclo si no se llevara la cuenta de lo visitado.', 'Recuerda cuándo se marca un nodo en BFS: al encolar.', 'DFS no garantiza el camino más corto; BFS sí (sin pesos).']);

  /* ---------- código: nivel 15 ---------- */
  const PRE15 = dd(`
    G1 = {'A': ['B', 'C', 'D'], 'B': ['A', 'E'], 'C': ['A', 'F', 'G'], 'D': ['A'], 'E': ['B', 'F'], 'F': ['C', 'E', 'G'], 'G': ['C', 'F']}
    G2 = {'1': ['2', '3'], '2': ['1', '4'], '3': ['1', '4'], '4': ['2', '3', '5'], '5': ['4']}
    G3 = {'X': []}
    G4 = {'A': ['B'], 'B': ['A'], 'C': []}
    G5 = {'S': ['A', 'B'], 'A': ['S', 'C'], 'B': ['S', 'C'], 'C': ['A', 'B', 'T'], 'T': ['C']}
  `);
  B({
    id: 'n15-impl-bfs', n: 15, e: 'C', dif: 3, c: ['gr_bfs', 'gr_cx'], tema: 'Implementar BFS',
    gen() {
      const sol = dd(`
        from collections import deque

        def bfs_orden(grafo, inicio):
            visitados = set([inicio])
            cola = deque([inicio])
            orden = []
            while cola:
                u = cola.popleft()
                orden.append(u)
                for w in grafo[u]:
                    if w not in visitados:
                        visitados.add(w)
                        cola.append(w)
            return orden
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `bfs_orden(grafo, inicio)` que devuelva la **lista de nodos en el orden en que BFS los visita** desde `inicio`. `grafo` es una **lista de adyacencia** (diccionario nodo → lista de vecinos); recorre los vecinos en el orden de su lista. Usa una **cola** (`collections.deque`) y un conjunto de **visitados que se marca al encolar**.', starter: 'from collections import deque\n\ndef bfs_orden(grafo, inicio):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE15,
        tests: ["bfs_orden(G1, 'A')", "bfs_orden(G1, 'F')", "bfs_orden(G2, '1')", "bfs_orden(G2, '5')", "bfs_orden(G3, 'X')", "bfs_orden(G4, 'A')", "bfs_orden(G5, 'S')", "bfs_orden(G5, 'T')"], fn: 'bfs_orden', ejemplo: "bfs_orden(G1, 'A')",
        reglas: [{ t: 'noUsa', re: /\bpop\s*\(\s*0\s*\)/, msg: 'No uses `lista.pop(0)` como cola: desplaza todos los elementos (O(n)). Usa `collections.deque` con `popleft()`.' }]
      });
      q.pistas = ['Empieza con `visitados = set([inicio])` y `cola = deque([inicio])`.', 'Mientras la cola no esté vacía: `u = cola.popleft()`, añade `u` al resultado y recorre `grafo[u]`.', 'Marca cada vecino nuevo como visitado **al encolarlo**, así no entra dos veces.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCada vértice y cada arista se procesan una vez: **O(V + E)**.';
      return q;
    }
  });
  B({
    id: 'n15-impl-dfs', n: 15, e: 'C', dif: 3, c: ['gr_dfs', 'gr_cx'], tema: 'Implementar DFS',
    gen() {
      const sol = dd(`
        def dfs_orden(grafo, inicio):
            visitados = set()
            orden = []
            def visitar(u):
                visitados.add(u)
                orden.append(u)
                for w in grafo[u]:
                    if w not in visitados:
                        visitar(w)
            visitar(inicio)
            return orden
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `dfs_orden(grafo, inicio)` que devuelva la **lista de nodos en el orden en que DFS los visita** desde `inicio` (visita el nodo al **entrar**; baja por el **primer vecino** no visitado de la lista y retrocede al agotarlo). Puede ser recursivo o iterativo, pero el orden debe ser el del **DFS recursivo**.', starter: 'def dfs_orden(grafo, inicio):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE15,
        tests: ["dfs_orden(G1, 'A')", "dfs_orden(G1, 'D')", "dfs_orden(G2, '1')", "dfs_orden(G2, '4')", "dfs_orden(G3, 'X')", "dfs_orden(G4, 'A')", "dfs_orden(G5, 'S')", "dfs_orden(G5, 'C')"], fn: 'dfs_orden', ejemplo: "dfs_orden(G1, 'A')"
      });
      q.pistas = ['Necesitas un conjunto de visitados para no volver a los mismos nodos.', 'Recursivo: visita `u`, y para cada vecino `w` no visitado llama a la función sobre `w`.', 'Iterativo: con una pila, apila los vecinos **al revés** (`reversed(grafo[u])`) para que salga primero el primero de la lista.'];
      q.explicacion = 'Solución recursiva:\n```\n' + sol + '\n```\nDFS visita cada vértice y cada arista una vez: **O(V + E)**; la profundidad de la recursión puede llegar a O(V).';
      return q;
    }
  });
  B({
    id: 'n15-impl-camino', n: 15, e: 'C', dif: 4, c: ['gr_camino', 'gr_bfs'], tema: 'Camino más corto sin pesos',
    gen() {
      const sol = dd(`
        from collections import deque

        def camino_corto(grafo, inicio, destino):
            prev = {inicio: None}
            cola = deque([inicio])
            while cola:
                u = cola.popleft()
                if u == destino:
                    break
                for w in grafo[u]:
                    if w not in prev:
                        prev[w] = u
                        cola.append(w)
            if destino not in prev:
                return []
            camino = []
            actual = destino
            while actual is not None:
                camino.append(actual)
                actual = prev[actual]
            camino.reverse()
            return camino
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `camino_corto(grafo, inicio, destino)` que devuelva la **lista de nodos del camino con menos aristas** de `inicio` a `destino` (incluidos los dos), o `[]` si no están conectados. Usa **BFS** guardando en `prev[v]` desde qué nodo se llegó a `v` (recorre los vecinos en el orden de la lista) y reconstruye el camino hacia atrás.', starter: 'from collections import deque\n\ndef camino_corto(grafo, inicio, destino):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE15,
        tests: ["camino_corto(G1, 'A', 'G')", "camino_corto(G1, 'D', 'F')", "camino_corto(G1, 'A', 'A')", "camino_corto(G2, '1', '5')", "camino_corto(G4, 'A', 'C')", "camino_corto(G4, 'A', 'B')", "camino_corto(G5, 'S', 'T')", "camino_corto(G5, 'T', 'S')"], fn: 'camino_corto', ejemplo: "camino_corto(G1, 'A', 'G')"
      });
      q.pistas = ['Un diccionario `prev` sirve también como conjunto de visitados: `w not in prev`.', 'Para reconstruir: parte de `destino` y sigue `prev` hasta `None`; luego invierte la lista.', 'Si `destino` nunca llegó a `prev`, no hay camino: devuelve `[]`.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCosto **O(V + E)**. BFS garantiza el camino con menos aristas porque descubre cada nodo por primera vez por el camino más corto.';
      return q;
    }
  });
  B({
    id: 'n15-impl-islas', n: 15, e: 'C', dif: 4, c: ['gr_islas', 'gr_cx'], tema: 'Número de islas',
    gen() {
      const sol = dd(`
        from collections import deque

        def contar_islas(m):
            filas, cols = len(m), len(m[0])
            visto = [[False] * cols for _ in range(filas)]
            islas = 0
            for r in range(filas):
                for c in range(cols):
                    if m[r][c] == 1 and not visto[r][c]:
                        islas += 1
                        visto[r][c] = True
                        cola = deque([(r, c)])
                        while cola:
                            f, k = cola.popleft()
                            for df, dk in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                                nf, nk = f + df, k + dk
                                if 0 <= nf < filas and 0 <= nk < cols and m[nf][nk] == 1 and not visto[nf][nk]:
                                    visto[nf][nk] = True
                                    cola.append((nf, nk))
            return islas
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `contar_islas(m)` que devuelva el **número de islas** de la cuadrícula `m` (lista de listas con `1` = tierra y `0` = agua). Una isla es un grupo de celdas de tierra conectadas por **arriba, abajo, izquierda o derecha** (no por diagonal). Recorre cada celda; al encontrar tierra **no visitada** suma 1 y marca toda su isla con un BFS o DFS **iterativo**.', starter: 'def contar_islas(m):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['contar_islas([[1, 1, 0, 0], [0, 0, 0, 1], [0, 0, 0, 1]])', 'contar_islas([[0, 0], [0, 0]])', 'contar_islas([[1]])', 'contar_islas([[1, 0, 1], [0, 1, 0], [1, 0, 1]])', 'contar_islas([[1, 1, 1], [1, 0, 1], [1, 1, 1]])', 'contar_islas([[1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [0, 0, 1, 0, 0], [1, 1, 0, 0, 1]])', 'contar_islas([[1, 1, 0], [0, 1, 0], [0, 1, 1]])'], fn: 'contar_islas', ejemplo: 'contar_islas([[1, 1, 0, 0], [0, 0, 0, 1]])'
      });
      q.pistas = ['Necesitas una matriz `visto` del mismo tamaño para no contar dos veces la misma isla.', 'Cada vez que encuentres un `1` no visto: `islas += 1` y lanza un recorrido que marque todas las celdas conectadas.', 'Los vecinos de `(f, k)` son `(f±1, k)` y `(f, k±1)`; comprueba los límites antes de mirar `m[nf][nk]`.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCada celda se visita una vez: **O(filas × columnas)**.';
      return q;
    }
  });
  B({
    id: 'n15-traza-dfs-iter', n: 15, e: 'C', dif: 4, c: ['gr_dfs', 'gr_vs'], tema: 'Traza del DFS iterativo',
    gen(rng) {
      const g = grafoAl(rng, rng.int(5, 6), 2.2 + rng.next() * .5, false), cod = dd(pyDict(g) + '\n\n' + G.CODIGO.dfsIter.join('\n') + "\n\norden, prev = dfs_iterativo(grafo, 'A')\nprint(' '.join(orden))");
      const T = G.dfsIter(g, 0, -1), esp = nom(g, T.res.orden).join(' '), real = ET.Kit.run(cod).trim(); if (real !== esp) throw new Error('El DFS iterativo de la animación no coincide con el código: ' + real + ' / ' + esp);
      return {
        tipo: 'salida', tokens: true, fmt: 'Trazado de un programa', placeholder: 'A B C …', esperado: esp, codigoVista: cod, figura: fig(g, 'El grafo (origen A)'),
        enunciado: '¿Qué **imprime** este programa? Recuerda que el DFS iterativo **apila los vecinos en el orden de la lista** y por eso sale primero el **último** que se apiló.',
        pistas: ['Lleva la pila a mano: `pila = [A]`; en cada vuelta `pop()` el tope.', 'Si el nodo ya estaba en `visitados`, `continue` (se descarta sin imprimir).', 'Al visitar un nodo se apilan sus vecinos aún no visitados, en el orden de su lista.'],
        explicacion: 'Salida: **' + esp + '**. Fíjate en que no coincide necesariamente con el DFS recursivo (' + nom(g, G.dfsRec(g, 0, -1).res.orden).join(' ') + '): para igualarlos hay que apilar con `reversed(grafo[u])`.',
        sim: simDe(T, G.CODIGO.dfsIter, 'DFS iterativo, paso a paso')
      };
    }
  });

  /* =============================================================================== NIVEL 16 · Caminos mínimos =============================================================================== */
  H.vf('n16-vf', 16, 'A', 1, ['cm_def', 'cm_relaj', 'cm_dij', 'cm_neg', 'cm_astar', 'cm_bf', 'cm_fw'], 'Caminos mínimos (V/F)', [
    { a: 'BFS encuentra el camino de menor costo en un grafo ponderado.', v: false, e: 'BFS cuenta saltos, no pesos.', j: ['BFS minimiza el número de aristas; un camino con más aristas puede costar menos.', 'BFS suma los pesos de las aristas igual que Dijkstra.', 'BFS solo falla si hay pesos negativos.'] },
    { a: 'Dijkstra requiere que todos los pesos sean no negativos.', v: true, e: 'Cierra un nodo suponiendo que su distancia ya no mejorará.', j: ['Al cerrar un nodo asume que ningún camino posterior lo mejora, y con pesos negativos eso puede ser falso.', 'Porque usa un heap que no admite negativos.', 'No lo requiere: solo es más lento con pesos negativos.'] },
    { a: 'Relajar la arista (u, v) de peso w actualiza d(v) solo si d(u) + w < d(v).', v: true, e: 'Solo se actualiza cuando llegar a v por u mejora lo conocido.', j: ['Si el camino por u no es mejor, d(v) se deja igual.', 'Relajar siempre reemplaza d(v) por d(u) + w.', 'Relajar compara solo los pesos, no las distancias.'] },
    { a: 'Con pesos no negativos, cuando Dijkstra cierra un nodo su distancia ya es definitiva.', v: true, e: 'Cualquier camino posterior pasaría por nodos más lejanos y solo sumaría más.', j: ['Los demás nodos abiertos están igual o más lejos y los pesos no negativos no pueden acortar el camino.', 'Es definitiva solo si el grafo es un árbol.', 'No: Dijkstra reabre los nodos varias veces.'] },
    { a: 'A* con una heurística que sobrestima el costo real sigue garantizando el camino óptimo.', v: false, e: 'Hace falta que h sea admisible (nunca sobrestime).', j: ['Si h sobrestima, A* puede descartar el camino óptimo y devolver uno peor.', 'A* siempre garantiza el óptimo, sea cual sea h.', 'Solo importa que h sea un entero.'] },
    { a: 'Con h = 0, A* se comporta como Dijkstra.', v: true, e: 'f = g + 0 = g: se prioriza solo por el costo real.', j: ['Con h = 0 la prioridad f = g + h es solo g, igual que en Dijkstra.', 'Con h = 0, A* no encuentra ningún camino.', 'Con h = 0, A* se vuelve un BFS.'] },
    { a: 'Bellman-Ford admite pesos negativos y detecta ciclos negativos.', v: true, e: 'Relaja todas las aristas |V| − 1 veces y una pasada extra revela los ciclos negativos.', j: ['Si una pasada extra todavía mejora alguna distancia, hay un ciclo negativo.', 'Admite pesos negativos pero no puede detectar ciclos.', 'No admite pesos negativos: para eso existe Dijkstra.'] },
    { a: 'Floyd-Warshall calcula las distancias desde un solo origen hasta todos los demás nodos.', v: false, e: 'Calcula la distancia entre **todos los pares** de nodos.', j: ['Calcula la matriz de distancias entre todos los pares con programación dinámica (O(V³)).', 'Sí, y por eso es más rápido que Dijkstra.', 'Calcula solo la distancia entre dos nodos dados.'] },
    { a: 'Con un heap, Dijkstra pasa de O(V²) a O(E log V).', v: true, e: 'El heap extrae el más cercano en O(log V) en lugar de recorrer todos los nodos.', j: ['Elegir el siguiente nodo cuesta O(log V) con el heap en vez de O(V) con la búsqueda lineal.', 'El heap no cambia el costo asintótico.', 'Con un heap Dijkstra pasa a O(V).'] },
    { a: 'Si hay un ciclo negativo alcanzable desde el origen, el camino mínimo está bien definido.', v: false, e: 'Se puede dar vueltas al ciclo y bajar el costo sin límite.', j: ['Cada vuelta al ciclo reduce el costo, así que no existe un mínimo.', 'Está bien definido: es el que pasa una sola vez por el ciclo.', 'Solo importa el peso de la última arista.'] }
  ], ['Piensa en qué mide cada algoritmo: saltos (BFS) o suma de pesos (Dijkstra).', 'Recuerda la restricción de Dijkstra y por qué existe.', 'A* necesita una heurística admisible; Floyd-Warshall trabaja con todos los pares.']);

  B({
    id: 'n16-relajacion', n: 16, e: 'A', dif: 1, c: ['cm_relaj'], tema: 'Relajar una arista',
    gen(rng) {
      const a = rng.int(2, 9), w = rng.int(1, 9), mejora = rng.chance(.55), c = mejora ? a + w + rng.int(1, 8) : Math.max(1, a + w - rng.int(0, 3)), u = rng.pick(['A', 'B', 'C']), v = rng.pick(['D', 'E', 'X']), esp = Math.min(c, a + w);
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Relajación', placeholder: 'Un número', esperado: String(esp),
        enunciado: 'En Dijkstra se conocen las distancias **d(' + u + ') = ' + a + '** y **d(' + v + ') = ' + c + '**. Existe la arista **' + u + ' → ' + v + '** con peso **' + w + '**. ¿Qué valor queda en **d(' + v + ')** después de **relajar** esa arista?',
        pistas: ['Relajar es probar si llegar por ' + u + ' mejora: ¿d(' + u + ') + w < d(' + v + ')?', 'Calcula ' + a + ' + ' + w + ' y compáralo con ' + c + '.', 'Si mejora, d(' + v + ') toma el valor nuevo (y el predecesor pasa a ser ' + u + '); si no, no cambia.'],
        explicacion: a + ' + ' + w + ' = ' + (a + w) + ((a + w) < c ? ' < ' + c + ' → **mejora**: d(' + v + ') = **' + (a + w) + '** y el predecesor pasa a ser ' + u + '.' : ' ≥ ' + c + ' → **no mejora**: d(' + v + ') se queda en **' + c + '**.')
      };
    }
  });

  H.clasif('n16-clasif-algoritmo', 16, 'A', 2, ['cm_elegir', 'cm_dij', 'cm_astar', 'cm_bf', 'cm_fw'], 'Elegir el algoritmo de caminos mínimos', 'Para cada situación, elige el algoritmo más adecuado (S12-C2, diap. 26, 27 y 40).', ['BFS', 'Dijkstra', 'A*', 'Bellman-Ford', 'Floyd-Warshall'], [
    ['Mínimo de saltos entre dos personas en una red social (sin pesos)', 'BFS', 'Sin pesos basta contar aristas: BFS.'], ['Ruta más rápida de una casa a un destino con distancias positivas, desde un único origen', 'Dijkstra', 'Pesos no negativos y un origen: Dijkstra.'],
    ['Un robot en un mapa con coordenadas que busca la ruta a un destino fijo usando la distancia en línea recta como estimación', 'A*', 'Destino fijo y heurística admisible: A*.'], ['Red financiera donde algunas transacciones ganan dinero (pesos negativos) y se busca arbitraje', 'Bellman-Ford', 'Admite pesos negativos y detecta ciclos negativos.'],
    ['Precalcular la distancia entre todas las 50 estaciones de un metro', 'Floyd-Warshall', 'Todos los pares en un grafo pequeño: Floyd-Warshall.'], ['Distancias desde un origen a todos los nodos con pesos no negativos', 'Dijkstra', 'Es el caso para el que se diseñó Dijkstra.'],
    ['Un solo origen, pesos negativos y sin ciclos negativos', 'Bellman-Ford', 'Dijkstra fallaría; Bellman-Ford lo maneja.'], ['Videojuego: encontrar el camino a la meta explorando pocos nodos gracias a una heurística de distancia Manhattan', 'A*', 'La heurística dirige la búsqueda.'],
    ['Distancia entre todos los pares de un grafo denso de 100 nodos', 'Floyd-Warshall', 'O(V³) = 10⁶: aceptable y muy simple.'], ['Contar el número mínimo de calles entre dos esquinas (todas las calles pesan lo mismo)', 'BFS', 'Aristas sin pesos.']
  ], ['¿Hay pesos? ¿Son negativos? ¿Hay un destino fijo con heurística? ¿Cuántos pares se necesitan?', 'Sin pesos → BFS; pesos ≥ 0 y un origen → Dijkstra; destino fijo con heurística → A*.', 'Negativos → Bellman-Ford; todos los pares → Floyd-Warshall.'], 'BFS sin pesos; Dijkstra pesos no negativos desde un origen; A* con destino fijo y heurística; Bellman-Ford con pesos negativos; Floyd-Warshall para todos los pares.');

  B({
    id: 'n16-bfs-vs-dijkstra', n: 16, e: 'A', dif: 2, c: ['cm_def', 'cm_dij'], tema: 'BFS no sirve con pesos',
    gen(rng) {
      let g, tb, td, t;
      for (let i = 0; i < 200; i++) {
        g = grafoAl(rng, rng.int(6, 8), 2.3 + rng.next() * .8, true); t = g.n - 1; tb = G.bfs(g, 0, t); td = G.dijkstra(g, 0, t);
        if (td.res.camino && tb.res.camino && td.res.costo < G.pesoCamino(g, tb.res.camino)) break;
      }
      const costoB = G.pesoCamino(g, tb.res.camino), costoD = td.res.costo;
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Camino de menor costo', placeholder: 'Un número', esperado: String(costoD), figura: fig(g, 'El grafo ponderado (de A a ' + g.nom[t] + ')'),
        enunciado: 'En este grafo **ponderado y no dirigido** (cada número es el costo de la arista):' + bloque(pyDict(g, true, 'graph')) + '¿Cuánto cuesta el **camino de menor costo** de **A** a **' + g.nom[t] + '**? (No siempre es el de menos aristas.)',
        pistas: ['BFS cuenta saltos, no pesos: aquí hay que **sumar** los pesos.', 'Tres calles cortas pueden costar menos que una larga: compara varios caminos.', 'Dijkstra cierra siempre el nodo abierto más barato; con él el costo mínimo es seguro.'],
        explicacion: 'Camino de menor costo: ' + nom(g, td.res.camino).join(' → ') + ' = **' + costoD + '**. El camino con menos aristas (el que daría BFS), ' + nom(g, tb.res.camino).join(' → ') + ', cuesta **' + costoB + '**.',
        sim: simDe(td, G.CODIGO.dijkstra, 'Dijkstra de A a ' + g.nom[t], 'dijkstra')
      };
    }
  });

  B({
    id: 'n16-dij-orden', n: 16, e: 'B', dif: 3, c: ['cm_dij'], tema: 'Orden en que Dijkstra cierra los nodos',
    gen(rng) {
      const g = grafoAl(rng, rng.int(6, 7), 2.4 + rng.next() * .7, true), T = G.dijkstra(g, 0, -1), orden = nom(g, T.res.cerrados);
      return {
        tipo: 'salida', tokens: true, fmt: 'Orden de cierre', placeholder: 'A … ', esperado: orden.join(' '), figura: fig(g, 'El grafo ponderado (origen A)'),
        enunciado: 'Se ejecuta **Dijkstra** (la versión de la clase, con `find_lowest_cost_node`) desde **A** en este grafo no dirigido:' + bloque(pyDict(g, true, 'graph')) + '¿En qué **orden se cierran (procesan)** los nodos? Si hay **empate** de costo, se cierra primero el que aparece antes en el diccionario (la letra menor). Escribe los nodos separados por espacios.',
        pistas: ['Cierra siempre el nodo **no procesado de menor costo**; al cerrarlo relaja sus aristas.', 'Lleva la tabla de costos: inicialmente 0 en A e ∞ en los demás.', 'El primero en cerrarse es el origen (costo 0).'],
        explicacion: 'Orden de cierre: **' + orden.join(' ') + '**. Costos finales: ' + costos(g, T.res.costos) + '.',
        sim: simDe(T, G.CODIGO.dijkstra, 'Dijkstra desde A, nodo por nodo', 'dijkstra')
      };
    }
  });

  B({
    id: 'n16-dij-distancia', n: 16, e: 'B', dif: 2, c: ['cm_dij', 'cm_relaj'], tema: 'Distancia mínima con Dijkstra',
    gen(rng) {
      const g = grafoAl(rng, rng.int(6, 8), 2.3 + rng.next() * .8, true), T = G.dijkstra(g, 0, -1), t = rng.int(2, g.n - 1);
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Distancia mínima', placeholder: 'Un número', esperado: String(T.res.costos[t]), figura: fig(g, 'El grafo ponderado (origen A)'),
        enunciado: 'Con Dijkstra desde **A** en este grafo no dirigido:' + bloque(pyDict(g, true, 'graph')) + '¿Cuál es la **distancia mínima** de **A** a **' + g.nom[t] + '**?',
        pistas: ['Procesa los nodos en orden de costo creciente y relaja sus aristas.', 'El costo de un nodo puede mejorar mientras no esté cerrado.', 'La distancia mínima es el costo del nodo al cerrarse.'],
        explicacion: 'Distancias mínimas desde A: ' + costos(g, T.res.costos) + '. Camino a ' + g.nom[t] + ': ' + nom(g, G.camino(T.res.prev, 0, t)).join(' → ') + '.',
        sim: simDe(T, G.CODIGO.dijkstra, 'Dijkstra desde A', 'dijkstra')
      };
    }
  });

  B({
    id: 'n16-dij-costos', n: 16, e: 'C', dif: 3, c: ['cm_dij', 'cm_relaj'], tema: 'Tabla final de costos de Dijkstra',
    gen(rng) {
      const g = grafoAl(rng, rng.int(5, 6), 2.4 + rng.next() * .6, true), T = G.dijkstra(g, 0, -1), esp = Array.from(T.res.costos).slice(1).join(' ');
      return {
        tipo: 'salida', tokens: true, fmt: 'Tabla de costos', placeholder: nom(g, g.nom.map((_, i) => i).slice(1)).join(' ') + ' (una cifra cada uno)', esperado: esp, figura: fig(g, 'El grafo ponderado (origen A)'),
        enunciado: 'Dijkstra desde **A** en este grafo no dirigido:' + bloque(pyDict(g, true, 'graph')) + 'Escribe los **costos finales** de los nodos **' + g.nom.slice(1).join(', ') + '** (en ese orden, separados por espacios).',
        pistas: ['Tabla inicial: A = 0 y los demás ∞. Cierra A y relaja sus vecinos.', 'Repite: cierra el no procesado más barato y relaja sus aristas (solo si mejora).', 'Al final todos los nodos están cerrados y cada costo es la distancia mínima desde A.'],
        explicacion: 'Costos finales: ' + costos(g, T.res.costos) + '.',
        sim: simDe(T, G.CODIGO.dijkstra, 'Dijkstra desde A', 'dijkstra')
      };
    }
  });

  B({
    id: 'n16-camino-min', n: 16, e: 'B', dif: 3, c: ['cm_dij', 'cm_relaj'], tema: 'Reconstruir el camino mínimo',
    gen(rng) {
      let g, T, t;
      for (let i = 0; i < 80; i++) { g = grafoAl(rng, rng.int(6, 8), 2.3 + rng.next() * .8, true); t = g.n - 1; T = G.dijkstra(g, 0, t); if (T.res.camino && T.res.camino.length >= 3) break; }
      const cam = nom(g, T.res.camino);
      return {
        tipo: 'salida', tokens: true, fmt: 'Camino de menor costo', placeholder: 'A … ' + g.nom[t], esperado: cam.join(' '), figura: fig(g, 'El grafo ponderado (de A a ' + g.nom[t] + ')'),
        enunciado: 'Con Dijkstra (guardando `parents[vecino] = node` cuando mejora) en este grafo no dirigido:' + bloque(pyDict(g, true, 'graph')) + 'escribe el **camino de menor costo** de **A** a **' + g.nom[t] + '**, de A hasta ' + g.nom[t] + ', separado por espacios. (Si hay dos caminos con el mismo costo, vale el que reconstruyen los predecesores de la clase.)',
        pistas: ['Sigue los **predecesores** hacia atrás desde el destino hasta A y luego invierte el orden.', 'El predecesor de un nodo es el que lo mejoró por última vez.', 'Comprueba que la suma de los pesos del camino sea la distancia mínima.'],
        explicacion: 'Camino: **' + cam.join(' → ') + '**, costo **' + T.res.costo + '**.',
        sim: simDe(T, G.CODIGO.dijkstra, 'Dijkstra de A a ' + g.nom[t], 'dijkstra')
      };
    }
  });

  /* el ejemplo de la clase con una arista negativa: Dijkstra falla, Bellman-Ford acierta */
  function negGrafo(rng) {
    const a = rng.int(2, 4), b = a + rng.int(1, 3), c = (b - a) + rng.int(1, 4), d = rng.int(1, 4);
    const g = G.crear(['S', 'A', 'B', 'C'], [['S', 'A', a], ['S', 'B', b], ['B', 'A', -c], ['A', 'C', d]], { dirigido: true, ponderado: true, x: [70, 280, 280, 560], y: [160, 60, 260, 160], ini: 0, fin: 3, titulo: 'Un grafo dirigido con una arista negativa' });
    return { g, a, b, c, d, real: b - c + d, dij: a + d };
  }
  B({
    id: 'n16-neg-real', n: 16, e: 'C', dif: 4, c: ['cm_neg', 'cm_bf'], tema: 'Dijkstra con una arista negativa',
    gen(rng) {
      const o = negGrafo(rng), g = o.g, bf = G.bellman(g, 0, 3), dj = G.dijkstra(g, 0, -1);
      if (bf.res.costos[3] !== o.real || dj.res.costos[3] !== o.dij) throw new Error('El grafo negativo no se comporta como se esperaba');
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Costo mínimo con pesos negativos', placeholder: 'Un número', esperado: String(o.real), figura: fig(g, 'Grafo dirigido (S → C)'),
        enunciado: 'Grafo **dirigido** con aristas S→A = ' + o.a + ', S→B = ' + o.b + ', **B→A = −' + o.c + '** y A→C = ' + o.d + ' (figura). Dijkstra cierra A con costo ' + o.a + ' y da para C el valor ' + o.dij + '. ¿Cuál es el **costo mínimo real** de **S a C**?',
        pistas: ['Dijkstra supone que al cerrar un nodo ya no mejorará, pero la arista negativa puede mejorarlo después.', 'Prueba el camino S → B → A → C y suma sus pesos (incluido el negativo).', 'Para pesos negativos se usa Bellman-Ford, que relaja todas las aristas |V| − 1 veces.'],
        explicacion: 'S → B → A → C cuesta ' + o.b + ' − ' + o.c + ' + ' + o.d + ' = **' + o.real + '**, menos que los **' + o.dij + '** de S → A → C. Dijkstra se equivoca porque cerró A antes de conocer el camino negativo; Bellman-Ford da C = ' + o.real + '.',
        sim: simDe(bf, G.CODIGO.bellman, 'Bellman-Ford desde S', 'bellman')
      };
    }
  });

  B({
    id: 'n16-bellman-pasada', n: 16, e: 'C', dif: 4, c: ['cm_bf', 'cm_relaj'], tema: 'Pasadas de Bellman-Ford',
    gen(rng) {
      const o = negGrafo(rng), ar = rng.shuffle([['S', 'A', o.a], ['S', 'B', o.b], ['B', 'A', -o.c], ['A', 'C', o.d]]);
      const g = G.crear(['S', 'A', 'B', 'C'], ar, { dirigido: true, ponderado: true, x: [70, 280, 280, 560], y: [160, 60, 260, 160], ini: 0, fin: 3, titulo: 'Grafo dirigido' }), T = G.bellman(g, 0, -1), k = rng.int(1, 2), st = G.estadoEn(T, k);
      const esp = Array.from(st.dist).map(FIN).join(' '), alt = Array.from(st.dist).map(x => x === Infinity ? '∞' : String(x)).join(' ');
      return {
        tipo: 'salida', tokens: true, fmt: 'Estado tras una pasada', placeholder: 'S A B C (usa inf si no se conoce)', esperado: [esp, alt], figura: fig(g, 'Grafo dirigido (origen S)'),
        enunciado: 'Se ejecuta **Bellman-Ford** desde **S**. En cada pasada se relajan las aristas **en este orden**: ' + ar.map(e => e[0] + '→' + e[1] + ' (' + e[2] + ')').join(', ') + '. Después de la **pasada ' + k + '**, ¿cuáles son las distancias de **S, A, B y C** (en ese orden)? Usa `inf` si todavía no se conoce.',
        pistas: ['Al inicio: S = 0 y los demás ∞. En cada pasada recorre **todas** las aristas en el orden dado, usando los valores ya actualizados.', 'Relajar (u→v, w): si d(u) + w < d(v), actualiza d(v). Con d(u) = ∞ no se mejora nada.', 'Los cambios de una arista se ven ya en las siguientes de la misma pasada.'],
        explicacion: 'Tras la pasada ' + k + ': ' + costos(g, st.dist) + '. (Sin ciclos negativos bastan |V| − 1 = 3 pasadas.)',
        sim: simDe(T, G.CODIGO.bellman, 'Bellman-Ford, pasada a pasada', 'bellman')
      };
    }
  });

  B({
    id: 'n16-floyd-celda', n: 16, e: 'C', dif: 4, c: ['cm_fw'], tema: 'Floyd-Warshall paso a paso',
    gen(rng) {
      for (let t = 0; t < 120; t++) {
        const pares = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== j) pares.push([i, j]);
        const ar = rng.sample(pares, rng.int(6, 8)).map(([i, j]) => [i, j, rng.int(1, 9)]);
        const g = G.crear(['A', 'B', 'C', 'D'], ar, { dirigido: true, ponderado: true, x: [80, 300, 520, 300], y: [160, 50, 160, 270], ini: 0, titulo: 'Grafo dirigido' }), T = G.floyd(g, 0, -1), M0 = T.pasos[0].mat, M2 = T.pasos[2].mat, cand = [];
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) if (i !== j && M2[i][j] < M0[i][j] && M2[i][j] < Infinity) cand.push([i, j]);
        if (!cand.length) continue;
        const [i, j] = rng.pick(cand);
        return {
          tipo: 'salida', numerico: true, tol: 0, fmt: 'Floyd-Warshall', placeholder: 'Un número', esperado: String(M2[i][j]), figura: fig(g, 'Grafo dirigido ponderado'),
          enunciado: 'Se ejecuta **Floyd-Warshall** (`for k … for i … for j … d[i][j] = min(d[i][j], d[i][k] + d[k][j])`) sobre este grafo dirigido con las aristas: ' + g.aristas.map(e => g.nom[e.a] + '→' + g.nom[e.b] + ' (' + e.w + ')').join(', ') + '. Los intermedios se prueban en el orden **A, B, C, D**. Justo después de procesar los intermedios **A y B** (las dos primeras vueltas del bucle exterior), ¿cuánto vale **d[' + g.nom[i] + '][' + g.nom[j] + ']**?',
          pistas: ['Matriz inicial: 0 en la diagonal, el peso de cada arista y ∞ donde no hay arista.', 'Con k = A, mejora d[i][j] si d[i][A] + d[A][j] < d[i][j]. Luego repite con k = B sobre la matriz ya actualizada.', 'Un camino i → k → j solo sirve si **ambos** tramos existen (no son ∞).'],
          explicacion: 'Después de k = A y k = B: d[' + g.nom[i] + '][' + g.nom[j] + '] = **' + M2[i][j] + '** (antes ' + FIN(M0[i][j]) + ').',
          sim: simDe(T, G.CODIGO.floyd, 'Floyd-Warshall, un intermedio por vez', 'floyd')
        };
      }
      throw new Error('No se halló un grafo de Floyd-Warshall adecuado');
    }
  });

  B({
    id: 'n16-astar-f', n: 16, e: 'B', dif: 2, c: ['cm_astar'], tema: 'f = g + h en A*',
    gen(rng) {
      const g = G.s12(), v = rng.pick(['A', 'B', 'C', 'D']), i = g.nom.indexOf(v), s = g.nom.indexOf('S'), arista = g.ady[s].find(e => e.v === i), gg = arista.w, h = g.h[i];
      const T = G.correr('astar', g, s, g.nom.indexOf('X'));
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Prioridad de A*', placeholder: 'Un número', esperado: String(gg + h), figura: fig(g, 'El grafo de S a X (número en el nodo: no se muestra h)'),
        enunciado: 'A* busca el camino de **S** a **X** y prioriza los nodos por **f(v) = g(v) + h(v)**. La heurística es h(S) = 5, h(A) = 8, h(B) = 4, h(C) = 3, h(D) = 2, h(X) = 0 (el grafo es el de la diap. 16: S–A = 5, S–B = 9, S–C = 6, S–D = 6). Justo **después de expandir S**, ¿cuánto vale **f(' + v + ')**?',
        pistas: ['g(' + v + ') es el costo real desde S hasta ' + v + ' conocido en ese momento: aquí, el peso de la arista S–' + v + '.', 'h(' + v + ') es la estimación que da el enunciado.', 'f(' + v + ') = g + h. Se expande primero el nodo con menor f.'],
        explicacion: 'f(' + v + ') = g + h = ' + gg + ' + ' + h + ' = **' + (gg + h) + '**. Con f, A* expande S, D, C, E, B, X (6 nodos): nunca toca A, G, F, I.',
        sim: simDe(T, G.CODIGO.astar, 'A* de S a X (f = g + h)', 'astar')
      };
    }
  });

  H.clasif('n16-astar-heuristica', 16, 'A', 2, ['cm_astar'], 'Heurísticas admisibles en A*', 'Una heurística **h(n)** es **admisible** si **nunca sobrestima** el costo real hasta el destino (S12-C2, diap. 21). Clasifica cada una.', ['Admisible (conserva el óptimo)', 'No admisible (puede perder el óptimo)'], [
    ['Distancia **Manhattan** en una cuadrícula con movimientos en 4 direcciones', 'Admisible (conserva el óptimo)', 'Nunca supera el mínimo de pasos necesarios.'], ['Distancia en **línea recta** en un mapa de carreteras', 'Admisible (conserva el óptimo)', 'Una carretera nunca es más corta que la línea recta.'],
    ['h = 0 en todos los nodos', 'Admisible (conserva el óptimo)', 'No sobrestima, aunque no guía (A* = Dijkstra).'], ['El **doble** de la distancia Manhattan en una cuadrícula de 4 direcciones', 'No admisible (puede perder el óptimo)', 'Puede sobrestimar el costo real.'],
    ['Una cota inferior del costo restante (siempre ≤ el costo real)', 'Admisible (conserva el óptimo)', 'Es justo la definición.'], ['El costo real × 1,5 hasta el destino', 'No admisible (puede perder el óptimo)', 'Sobrestima el costo real.'],
    ['La distancia Manhattan en una cuadrícula donde también se puede mover en **diagonal**', 'No admisible (puede perder el óptimo)', 'Una diagonal cuesta un paso: Manhattan puede sobrestimar.'], ['La distancia en línea recta cuando las aristas pesan la distancia exacta entre sus extremos', 'Admisible (conserva el óptimo)', 'Es una cota inferior del recorrido real.']
  ], ['¿Puede el valor de h superar el costo real que falta? Entonces no es admisible.', 'Manhattan y la línea recta son las heurísticas clásicas (mientras los movimientos las respeten).', 'h = 0 es admisible pero no ayuda.'], 'Admisible = nunca sobrestima. Entonces A* encuentra el camino óptimo. Si h sobrestima, A* puede devolver un camino peor.');

  B({
    id: 'n16-cx-tabla', n: 16, e: 'B', dif: 3, c: ['cm_elegir', 'cm_dij', 'cm_astar', 'cm_bf', 'cm_fw'], tema: 'Costos de los algoritmos de caminos mínimos',
    gen() {
      const q = H.tablaCx(['Algoritmo', 'Tiempo'], [
        ['Dijkstra con búsqueda lineal del mínimo (la versión de la clase)', ['O(V²)', 'O(V^2)', 'V²']], ['Dijkstra con un heap', ['O(E log V)', 'O(E logV)', 'E log V']], ['A* (con buena heurística explora menos nodos)', ['O(E log V)', 'E log V']],
        ['Bellman-Ford', ['O(V · E)', 'O(V*E)', 'O(VE)', 'V*E']], ['Floyd-Warshall: tiempo', ['O(V³)', 'O(V^3)', 'V³']], ['Floyd-Warshall: memoria', ['O(V²)', 'O(V^2)', 'V²']]]);
      return Object.assign(q, {
        enunciado: 'Completa el costo de cada algoritmo de caminos mínimos (S12-C2, diap. 17 y 26). Usa la notación `O(...)` con V vértices y E aristas.',
        pistas: ['Con el heap, elegir el siguiente nodo cuesta log V; se relajan E aristas en total.', 'Bellman-Ford relaja todas las aristas V − 1 veces.', 'Floyd-Warshall tiene tres bucles anidados sobre los vértices y guarda una matriz V × V.'],
        explicacion: 'Dijkstra: O(V²) con lista, **O(E log V)** con heap. A*: O(E log V) (en la práctica explora menos). Bellman-Ford: **O(V · E)**. Floyd-Warshall: **O(V³)** de tiempo y **O(V²)** de memoria.'
      });
    }
  });

  B({
    id: 'n16-ops', n: 16, e: 'B', dif: 2, c: ['cm_fw', 'cm_elegir'], tema: 'Operaciones de Floyd-Warshall',
    gen(rng) {
      const V = rng.pick([100, 200, 500, 1000, 2000, 5000]), esp = V * V * V;
      return {
        tipo: 'salida', numerico: true, tol: 0, fmt: 'Estimar el costo', placeholder: 'Un número', esperado: String(esp), unidad: 'operaciones',
        enunciado: 'Un grafo tiene **V = ' + V + '** nodos. Floyd-Warshall hace del orden de **V³** comprobaciones `d[i][k] + d[k][j] < d[i][j]`. ¿Cuántas son (escribe el número entero, sin separadores)?',
        pistas: ['Son tres bucles anidados, cada uno de V vueltas.', 'Calcula V × V × V.', 'Compáralo con ejecutar Dijkstra desde cada nodo: V · (E log V) puede ser mucho menos si el grafo es ralo.'],
        explicacion: V + '³ = **' + esp + '** (≈ ' + esp.toExponential(1).replace('e+', ' · 10^') + '). Por eso, si solo se necesitan las distancias desde pocos orígenes, conviene Dijkstra en lugar de Floyd-Warshall.'
      };
    }
  });

  /* ---------- código: nivel 16 ---------- */
  const PRE16 = dd(`
    GP1 = {'S': {'A': 5, 'B': 9, 'C': 6, 'D': 6}, 'A': {'S': 5, 'G': 9, 'B': 3}, 'G': {'A': 9}, 'B': {'S': 9, 'A': 3, 'C': 1, 'I': 7}, 'C': {'S': 6, 'B': 1, 'I': 5, 'F': 7, 'D': 2}, 'I': {'B': 7, 'C': 5, 'F': 8, 'X': 3}, 'F': {'C': 7, 'D': 2, 'I': 8}, 'D': {'S': 6, 'C': 2, 'F': 2, 'E': 2}, 'X': {'I': 3, 'E': 3}, 'E': {'D': 2, 'X': 3}}
    GP2 = {'A': {'B': 1, 'C': 4}, 'B': {'C': 2, 'D': 7}, 'C': {'D': 3}, 'D': {}}
    GP3 = {'A': {'B': 2}, 'B': {}, 'C': {'A': 1}}
  `);
  B({
    id: 'n16-impl-relajar', n: 16, e: 'B', dif: 2, c: ['cm_relaj'], tema: 'Implementar la relajación',
    gen() {
      const sol = dd(`
        def relajar(dist, padres, u, v, w):
            nuevo = dist[u] + w
            if nuevo < dist[v]:
                dist[v] = nuevo
                padres[v] = u
                return True
            return False
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `relajar(dist, padres, u, v, w)`: si llegar a `v` pasando por `u` (con la arista de peso `w`) es **mejor** que la distancia conocida de `v`, actualiza `dist[v]` y `padres[v] = u` y devuelve `True`; si no, no cambia nada y devuelve `False`.', starter: 'def relajar(dist, padres, u, v, w):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ["(lambda d, p: (relajar(d, p, 'A', 'B', 3), sorted(d.items()), sorted(p.items())))({'A': 0, 'B': 10}, {'A': None, 'B': None})", "(lambda d, p: (relajar(d, p, 'A', 'B', 3), sorted(d.items()), sorted(p.items())))({'A': 0, 'B': 3}, {'A': None, 'B': 'Z'})", "(lambda d, p: (relajar(d, p, 'A', 'B', 5), sorted(d.items()), sorted(p.items())))({'A': 2, 'B': 4}, {'A': None, 'B': 'Z'})", "(lambda d, p: (relajar(d, p, 'A', 'B', 1), sorted(d.items()), sorted(p.items())))({'A': 2, 'B': float('inf')}, {'A': None, 'B': None})", "(lambda d, p: (relajar(d, p, 'B', 'C', -2), sorted(d.items()), sorted(p.items())))({'B': 5, 'C': 4}, {'B': 'A', 'C': 'A'})"], fn: 'relajar', ejemplo: "relajar({'A': 0, 'B': 9}, {'A': None, 'B': None}, 'A', 'B', 4)"
      });
      q.pistas = ['Calcula primero `nuevo = dist[u] + w`.', 'Solo si `nuevo < dist[v]` se actualizan `dist[v]` y `padres[v]`.', 'Devuelve `True` si hubo mejora y `False` si no (también cuando es igual).'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nRelajar es la operación básica de Dijkstra, A* y Bellman-Ford.';
      return q;
    }
  });
  B({
    id: 'n16-impl-reconstruir', n: 16, e: 'B', dif: 3, c: ['cm_relaj', 'cm_dij'], tema: 'Reconstruir el camino con los predecesores',
    gen() {
      const sol = dd(`
        def reconstruir(padres, destino):
            camino = []
            actual = destino
            while actual is not None:
                camino.append(actual)
                actual = padres[actual]
            camino.reverse()
            return camino
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `reconstruir(padres, destino)`: `padres` es el diccionario de **predecesores** que dejan Dijkstra o BFS (el origen tiene `None`). Devuelve la **lista de nodos del camino**, del origen al `destino`, siguiendo los predecesores hacia atrás.', starter: 'def reconstruir(padres, destino):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ["reconstruir({'S': None, 'A': 'S', 'B': 'A', 'C': 'A'}, 'B')", "reconstruir({'S': None, 'A': 'S', 'B': 'A', 'C': 'A'}, 'C')", "reconstruir({'S': None, 'A': 'S'}, 'S')", "reconstruir({'A': None, 'B': 'A', 'C': 'B', 'D': 'C', 'E': 'D'}, 'E')", "reconstruir({'1': None, '2': '1', '3': '1', '4': '3'}, '4')"], fn: 'reconstruir', ejemplo: "reconstruir({'S': None, 'A': 'S', 'B': 'A'}, 'B')"
      });
      q.pistas = ['Empieza en el destino y retrocede con `actual = padres[actual]` hasta llegar a `None` (el origen no tiene predecesor).', 'Va quedando el camino al revés: invierte la lista al final (`reverse()`).', 'Si el destino es el origen, el camino es solo `[origen]`.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nSin guardar los predecesores se conoce la distancia pero no el camino.';
      return q;
    }
  });
  B({
    id: 'n16-impl-dijkstra', n: 16, e: 'C', dif: 4, c: ['cm_dij', 'cm_relaj'], tema: 'Implementar Dijkstra',
    gen() {
      const sol = dd(`
        import heapq

        def dijkstra(grafo, inicio):
            dist = {n: float("inf") for n in grafo}
            dist[inicio] = 0
            heap = [(0, inicio)]
            while heap:
                d, u = heapq.heappop(heap)
                if d > dist[u]:
                    continue
                for v, peso in grafo[u].items():
                    nuevo = d + peso
                    if nuevo < dist[v]:
                        dist[v] = nuevo
                        heapq.heappush(heap, (nuevo, v))
            return dist
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `dijkstra(grafo, inicio)` que devuelva un **diccionario con la distancia mínima** de `inicio` a cada nodo (`float("inf")` si no se alcanza). `grafo` es un diccionario de diccionarios (`grafo[u] = {vecino: peso}`) con pesos **no negativos**. Usa una **cola de prioridad** (`heapq`) y descarta las entradas **obsoletas** (`if d > dist[u]: continue`).', starter: 'import heapq\n\ndef dijkstra(grafo, inicio):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE16,
        tests: ["sorted(dijkstra(GP1, 'S').items())", "sorted(dijkstra(GP1, 'E').items())", "sorted(dijkstra(GP2, 'A').items())", "dijkstra(GP2, 'C')['D']", "dijkstra(GP3, 'A')['B']", "dijkstra(GP3, 'A')['C'] == float('inf')", "dijkstra(GP1, 'S')['X']"], fn: 'dijkstra', ejemplo: "dijkstra(GP2, 'A')"
      });
      q.pistas = ['Empieza con todas las distancias en `float("inf")` y `dist[inicio] = 0`; el heap guarda tuplas `(distancia, nodo)`.', '`heappop` entrega el de menor distancia; si `d > dist[u]` es una entrada vieja: sáltala.', 'Para cada vecino: `nuevo = d + peso`; si mejora, actualiza `dist[v]` y empuja `(nuevo, v)`.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCon el heap el costo es **O(E log V)** (la versión con búsqueda lineal del mínimo es O(V²)). Requiere pesos no negativos.';
      return q;
    }
  });
  B({
    id: 'n16-impl-bellman', n: 16, e: 'C', dif: 4, c: ['cm_bf', 'cm_neg'], tema: 'Detectar un ciclo negativo',
    gen() {
      const sol = dd(`
        def tiene_ciclo_negativo(nodos, aristas, inicio):
            dist = {v: float("inf") for v in nodos}
            dist[inicio] = 0
            for _ in range(len(nodos) - 1):
                for u, v, peso in aristas:
                    if dist[u] + peso < dist[v]:
                        dist[v] = dist[u] + peso
            for u, v, peso in aristas:
                if dist[u] + peso < dist[v]:
                    return True
            return False
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `tiene_ciclo_negativo(nodos, aristas, inicio)` que devuelva `True` si **desde `inicio` se alcanza un ciclo de peso negativo**. `aristas` es una lista de tuplas `(u, v, peso)` (grafo dirigido). Usa **Bellman-Ford**: relaja todas las aristas `len(nodos) - 1` veces y haz una pasada **extra**: si todavía mejora algo, hay un ciclo negativo.', starter: 'def tiene_ciclo_negativo(nodos, aristas, inicio):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ["tiene_ciclo_negativo(['S', 'A', 'B'], [('S', 'A', 1), ('A', 'B', 2)], 'S')", "tiene_ciclo_negativo(['S', 'A', 'B'], [('S', 'A', 1), ('A', 'B', -2), ('B', 'A', -2)], 'S')", "tiene_ciclo_negativo(['S', 'A', 'B', 'C'], [('S', 'A', 2), ('S', 'B', 3), ('B', 'A', -4), ('A', 'C', 1)], 'S')", "tiene_ciclo_negativo(['S', 'A', 'B', 'C'], [('S', 'A', 1), ('B', 'C', -3), ('C', 'B', 1)], 'S')", "tiene_ciclo_negativo(['A', 'B'], [('A', 'B', 3), ('B', 'A', -3)], 'A')", "tiene_ciclo_negativo(['A', 'B'], [('A', 'B', 3), ('B', 'A', -4)], 'A')"], fn: 'tiene_ciclo_negativo', ejemplo: "tiene_ciclo_negativo(['S', 'A'], [('S', 'A', -1)], 'S')"
      });
      q.pistas = ['Inicializa `dist` con `float("inf")` y `dist[inicio] = 0`.', 'Repite `len(nodos) - 1` veces: para cada arista `(u, v, peso)`, si `dist[u] + peso < dist[v]` actualiza `dist[v]`.', 'Después, una pasada extra: si **todavía** alguna arista mejora, hay un ciclo negativo alcanzable (con `inf` nunca mejora, así que un ciclo inalcanzable no cuenta).'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCosto **O(V · E)**. Un ciclo con suma 0 (como A→B = 3, B→A = −3) no es negativo.';
      return q;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
