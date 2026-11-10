/* sim_grafo_alg.js — trazas paso a paso de los algoritmos sobre grafos (S12-C1 y S12-C2).
   Cada función G.<alg>(g, s, t, o) devuelve una TRAZA {g, pasos[], res}. Un paso es un objeto
     {k, u, v, ch:[[nodo, estado]], d:[[nodo, dist, prev]], pv:[[nodo, prev]], hf:[[nodo, f]], vis, hi:[nodos], ar:[[a, b]], ds, ds2, lin:[líneas del código], msg, exp, camino, mat, extra, islas}
   que G.estadoEn (sim_grafo.js) aplica en orden. s = origen, t = destino (−1 si no hay).
   Opciones o: {detalle (un paso por arista), orden ('asc'|'desc'|'azar'), inverso (DFS iterativo), h (heurística de A*), hpeso}.
   Los algoritmos son los de las diapositivas: lo que se anima es exactamente lo que hace el código mostrado. */
(function (global) {
  'use strict';
  const ET = global.ET, G = ET.Sim.grafo, E = G.E;

  const b = s => '**' + s + '**';
  const nm = (g, i) => b(g.nom[i]);
  const lista = (g, a) => a.map(i => g.nom[i]).join(', ');
  const fmt = x => x === Infinity ? '∞' : (Number.isInteger(x) ? String(x) : String(Math.round(x * 10) / 10));
  function Trazo(g, alg, o) { this.g = g; this.alg = alg; this.o = o || {}; this.pasos = []; this.exp = 0; this.res = {}; }
  Trazo.prototype.p = function (o) { o.exp = this.exp; this.pasos.push(o); return o; };
  const ln = G.ln;

  /** líneas del código de cada acción (se calculan al cargar: si un fragmento no existe en el listado, falla aquí y no en pantalla) */
  const LN = {
    bfs: { ini: ln('bfs', 'visitados = set', 'prev = {', 'cola = deque', 'orden = []'), mientras: ln('bfs', 'while cola'), sacar: ln('bfs', 'cola.popleft()', 'orden.append(u)'), meta: ln('bfs', 'if u == destino', 'break'),
      mirar: ln('bfs', 'for w in grafo[u]', 'if w not in visitados'), enc: ln('bfs', 'visitados.add(w)', 'prev[w] = u', 'cola.append(w)'), fin: ln('bfs', 'return orden, prev') },
    dfsRec: { visitar: ln('dfsRec', 'visitados.add(u)', 'orden.append(u)'), meta: ln('dfsRec', 'if u == destino', 'return True'), mirar: ln('dfsRec', 'for w in grafo[u]', 'if w not in visitados'),
      bajar: ln('dfsRec', 'prev[w] = u', 'if dfs_recursivo(grafo, w'), volver: ln('dfsRec', 'return False') },
    dfsIter: { ini: ln('dfsIter', 'visitados, pila', 'prev = {', 'orden = []'), sacar: ln('dfsIter', 'pila.pop()'), omitir: ln('dfsIter', 'if u in visitados', 'continue'), visitar: ln('dfsIter', 'visitados.add(u)', 'orden.append(u)'),
      meta: ln('dfsIter', 'if u == destino', 'break'), mirar: ln('dfsIter', 'if w not in visitados'), apilar: ln('dfsIter', 'prev[w] = u', 'pila.append(w)'), fin: ln('dfsIter', 'return orden, prev') },
    dijkstra: { ini: ln('dijkstra', 'costs = {n:', 'parents = {n:', 'costs[inicio] = 0', 'processed = []'), elegir: ln('dijkstra', 'while node is not None'), meta: ln('dijkstra', 'if node == destino', 'break'),
      vecino: ln('dijkstra', 'for vecino, peso', 'nuevo = costs[node] + peso'), mejora: ln('dijkstra', 'if nuevo < costs[vecino]', 'costs[vecino] = nuevo', 'parents[vecino] = node'), nomejora: ln('dijkstra', 'if nuevo < costs[vecino]'),
      cerrar: ln('dijkstra', 'processed.append(node)'), buscar: ln('dijkstra', 'node = find_lowest_cost_node(costs, processed)'), fin: ln('dijkstra', 'return costs, parents') },
    dijkstraHeap: { ini: ln('dijkstraHeap', 'dist = {n:', 'parents = {n:', 'dist[inicio] = 0', 'heap = [(0, inicio)]'), sacar: ln('dijkstraHeap', 'heapq.heappop(heap)'), obsoleta: ln('dijkstraHeap', 'if d > dist[u]', 'continue'),
      meta: ln('dijkstraHeap', 'if u == destino', 'break'), vecino: ln('dijkstraHeap', 'for v, peso', 'nuevo = d + peso'), mejora: ln('dijkstraHeap', 'if nuevo < dist[v]', 'dist[v] = nuevo', 'parents[v] = u', 'heapq.heappush'),
      nomejora: ln('dijkstraHeap', 'if nuevo < dist[v]'), fin: ln('dijkstraHeap', 'return dist, parents') },
    astar: { ini: ln('astar', 'costs = {n:', 'parents = {n:', 'costs[inicio] = 0', 'processed = []'), elegir: ln('astar', 'while node is not None'), meta: ln('astar', 'if node == destino', 'break'),
      vecino: ln('astar', 'for vecino, peso', 'nuevo = costs[node] + peso'), mejora: ln('astar', 'if nuevo < costs[vecino]', 'costs[vecino] = nuevo', 'parents[vecino] = node'), nomejora: ln('astar', 'if nuevo < costs[vecino]'),
      cerrar: ln('astar', 'processed.append(node)'), fin: ln('astar', 'return costs[destino], parents'), f: ln('astar', 'f = costs[node] + h[node]') },
    bellman: { ini: ln('bellman', 'dist = {v:', 'parents = {v:', 'dist[inicio] = 0'), pasada: ln('bellman', 'for _ in range(len(nodos) - 1)', 'cambio = False'), arista: ln('bellman', 'for u, v, peso in aristas:', 'if dist[u] + peso < dist[v]'),
      mejora: ln('bellman', 'dist[v] = dist[u] + peso', 'parents[v] = u', 'cambio = True'), parar: ln('bellman', 'if not cambio', 'break'), ciclo: ln('bellman', 'return None, None'), fin: ln('bellman', 'return dist, parents') },
    floyd: { ini: ln('floyd', 'd = {i:', 'd[i][i] = 0', 'd[i][j] = w'), k: ln('floyd', 'for k in nodos'), ij: ln('floyd', 'for i in nodos:', 'for j in nodos:'), mejora: ln('floyd', 'if d[i][k] + d[k][j] < d[i][j]', 'd[i][j] = d[i][k] + d[k][j]'), fin: ln('floyd', 'return d') },
    bidir: { ini: ln('bidir', 'prev_s, prev_t', 'cola_s, cola_t'), mientras: ln('bidir', 'while cola_s and cola_t'), elegir: ln('bidir', 'if len(cola_s) <= len(cola_t)'), sacar: ln('bidir', 'cola.popleft()'), mirar: ln('bidir', 'for w in grafo[u]', 'if w not in mio'),
      enc: ln('bidir', 'mio[w] = u', 'cola.append(w)'), encuentro: ln('bidir', 'if w in otro', 'return unir(prev_s, prev_t, w)'), fin: ln('bidir', 'return []') },
    generar: { ini: ln('generar', 'muro[1][1] = 0', 'pila = [(1, 1)]'), mirar: ln('generar', 'r, c = pila[-1]', 'vecinos.append((nr, nc))'), tallar: ln('generar', 'random.choice(vecinos)', 'muro[(r + nr) // 2][(c + nc) // 2] = 0', 'muro[nr][nc] = 0', 'pila.append((nr, nc))'), volver: ln('generar', 'pila.pop()') },
    islasBfs: { barrer: ln('islasBfs', 'for r in range(filas)', 'if m[r][c] == 1 and not visto[r][c]'), nueva: ln('islasBfs', 'islas += 1', 'cola = deque([(r, c)])'), sacar: ln('islasBfs', 'while cola', 'cola.popleft()'),
      vecinos: ln('islasBfs', 'for df, dk in', 'nf, nk = f + df, k + dk'), marcar: ln('islasBfs', 'visto[nf][nk] = True', 'cola.append((nf, nk))'), fin: ln('islasBfs', 'return islas') },
    islasDfs: { barrer: ln('islasDfs', 'for r in range(filas)', 'if m[r][c] == 1 and not visto[r][c]'), nueva: ln('islasDfs', 'islas += 1', 'pila = [(r, c)]'), sacar: ln('islasDfs', 'while pila', 'pila.pop()'),
      vecinos: ln('islasDfs', 'for df, dk in', 'nf, nk = f + df, k + dk'), marcar: ln('islasDfs', 'visto[nf][nk] = True', 'pila.append((nf, nk))'), fin: ln('islasDfs', 'return islas') }
  };
  G.LN = LN;

  /** al final de una búsqueda con destino: el paso del camino o el aviso de que no hay */
  function cierre(T, g, s, t, prev, hallado, lin, tipo, extra) {
    const cam = hallado ? G.camino(prev, s, t) : [];
    if (t >= 0 && cam.length) {
      const cost = g.ponderado ? G.pesoCamino(g, cam) : cam.length - 1;
      T.p({ k: 'camino', u: -1, ch: cam.map(i => [i, E.CAMINO]), camino: cam, ds: [], lin, msg: 'Camino de ' + nm(g, s) + ' a ' + nm(g, t) + ': ' + (cam.length <= 14 ? cam.map(i => g.nom[i]).join(' → ') : cam.length + ' nodos') + ' (' + (g.ponderado ? 'costo ' + fmt(cost) : (cam.length - 1) + ' aristas') + '). ' + (tipo || '') + (extra || '') });
      T.res.camino = cam; T.res.costo = cost; T.res.longitud = cam.length - 1;
    } else if (t >= 0) { T.p({ k: 'fin', u: -1, ds: [], lin, msg: 'No hay camino de ' + nm(g, s) + ' a ' + nm(g, t) + ': se agotaron los nodos alcanzables.' }); T.res.camino = []; }
    return cam;
  }
  const sinDup = a => Array.from(new Set(a));

  /* ===================================================================== BFS (S12-C1 diap. 5-15) ===================================================================== */
  G.bfs = function (g, s, t, o) {
    o = o || {}; const det = !!o.detalle, T = new Trazo(g, 'bfs', o), vis = new Uint8Array(g.n), prev = new Int32Array(g.n).fill(-1), nivel = new Int32Array(g.n), q = [s], orden = []; let head = 0, hallado = false, maxQ = 1; vis[s] = 1;
    T.p({ k: 'ini', u: -1, ch: [[s, E.COLA]], d: [[s, 0, -1]], ds: [s], lin: LN.bfs.ini, msg: 'Se **encola el origen** ' + nm(g, s) + ' y se marca como visitado (queda en la cola).' });
    while (head < q.length) {
      const u = q[head++]; orden.push(u); T.exp++;
      if (det) T.p({ k: 'sacar', u, ch: [[u, E.ACT]], vis: u, ds: q.slice(head), lin: LN.bfs.sacar, msg: 'Se **desencola** ' + nm(g, u) + ' (sale el primero: FIFO) y se visita; es el n.º ' + orden.length + '.' });
      if (u === t) {
        hallado = true; T.p({ k: 'meta', u, ch: [[u, E.HECHO]], vis: det ? undefined : u, ds: q.slice(head), lin: LN.bfs.meta, msg: '¡' + nm(g, u) + ' es el destino! Se detiene la búsqueda tras visitar **' + orden.length + '** nodos.' }); break;
      }
      const nuevos = [];
      for (const e of G.vec(g, u, o.orden)) {
        const v = e.v;
        if (vis[v]) { if (det) T.p({ k: 'mirar', u, v, ar: [[u, v]], ds: q.slice(head), lin: LN.bfs.mirar, msg: nm(g, v) + ' ya está visitado: se ignora (no vuelve a entrar a la cola).' }); continue; }
        vis[v] = 1; prev[v] = u; nivel[v] = nivel[u] + 1; q.push(v); nuevos.push(v);
        if (det) T.p({ k: 'enc', u, v, ar: [[u, v]], ch: [[v, E.COLA]], d: [[v, nivel[v], u]], ds: q.slice(head), lin: LN.bfs.enc, msg: nm(g, v) + ' es nuevo: se marca visitado **al encolarlo**, guarda su padre (' + g.nom[u] + ') y entra a la cola (nivel ' + nivel[v] + ').' });
      }
      maxQ = Math.max(maxQ, q.length - head);
      if (det) T.p({ k: 'cerrar', u, ch: [[u, E.HECHO]], ds: q.slice(head), lin: LN.bfs.mientras, msg: 'Se terminó con ' + nm(g, u) + ': queda **procesado**.' });
      else T.p({ k: 'exp', u, ch: [[u, E.HECHO]].concat(nuevos.map(v => [v, E.COLA])), d: nuevos.map(v => [v, nivel[v], u]), vis: u, ar: nuevos.map(v => [u, v]), ds: q.slice(head), lin: LN.bfs.sacar.concat(LN.bfs.mirar, LN.bfs.enc),
        msg: 'Desencola ' + nm(g, u) + ' (n.º ' + orden.length + ')' + (nuevos.length ? ' → encola sus vecinos nuevos: ' + nuevos.map(v => b(g.nom[v])).join(', ') + '.' : ': no tiene vecinos nuevos.') });
    }
    const cam = cierre(T, g, s, t, prev, hallado, LN.bfs.fin, 'Por ser BFS **sin pesos**, es un camino **más corto** (en número de aristas). ');
    if (t < 0) T.p({ k: 'fin', u: -1, ds: [], lin: LN.bfs.fin, msg: 'La cola quedó vacía: fin. **Orden BFS:** ' + lista(g, orden) + ' (por niveles).' });
    T.res.orden = orden; T.res.prev = Array.from(prev); T.res.nivel = Array.from(nivel); T.res.hallado = hallado; T.res.maxEstr = maxQ; T.res.exp = orden.length; T.res.estructura = 'cola';
    return T;
  };

  /* ===================================================================== DFS recursivo (diap. 16-24) ===================================================================== */
  G.dfsRec = function (g, s, t, o) {
    o = o || {}; const det = !!o.detalle, T = new Trazo(g, 'dfsRec', o), vis = new Uint8Array(g.n), prev = new Int32Array(g.n).fill(-1), orden = [s], marco = [{ u: s, i: 0, nb: G.vec(g, s, o.orden) }], pend = [];
    let hallado = s === t, maxP = 1; vis[s] = 1; T.exp = 1;
    const pila = () => marco.map(f => f.u);
    T.p({ k: 'visitar', u: s, ch: [[s, E.ACT]], vis: s, pv: [[s, -1]], ds: [s], lin: LN.dfsRec.visitar, msg: 'dfs(' + nm(g, s) + '): se visita el origen (n.º 1) y se apila su llamada.' });
    if (hallado) T.p({ k: 'meta', u: s, ch: [[s, E.HECHO]], ds: [s], lin: LN.dfsRec.meta, msg: 'El origen ya es el destino.' });
    while (marco.length && !hallado) {
      const f = marco[marco.length - 1];
      if (f.i < f.nb.length) {
        const v = f.nb[f.i++].v;
        if (vis[v]) { if (det) T.p({ k: 'mirar', u: f.u, v, ar: [[f.u, v]], ds: pila(), lin: LN.dfsRec.mirar, msg: nm(g, v) + ' ya está visitado: se salta.' }); continue; }
        vis[v] = 1; prev[v] = f.u; orden.push(v); T.exp++; marco.push({ u: v, i: 0, nb: G.vec(g, v, o.orden) }); maxP = Math.max(maxP, marco.length);
        const volvio = pend.splice(0);
        T.p({ k: 'bajar', u: v, v: f.u, ar: [[f.u, v]], ch: volvio.map(c => [c, E.HECHO]).concat([[f.u, E.COLA], [v, E.ACT]]), pv: [[v, f.u]], vis: v, ds: pila(), lin: LN.dfsRec.bajar.concat(LN.dfsRec.visitar),
          msg: (volvio.length ? 'Se retrocede hasta ' + nm(g, f.u) + ' (' + (volvio.length > 1 ? 'ramas agotadas' : 'rama agotada') + ') y ' : nm(g, f.u) + ' ') + 'baja a ' + nm(g, v) + ' (n.º ' + orden.length + ').' });
        if (v === t) { hallado = true; T.p({ k: 'meta', u: v, ch: [[v, E.HECHO]], ds: pila(), lin: LN.dfsRec.meta, msg: '¡' + nm(g, v) + ' es el destino! Las llamadas devuelven **True** hacia arriba sin explorar más.' }); }
      } else {
        marco.pop();
        if (det) T.p({ k: 'volver', u: marco.length ? marco[marco.length - 1].u : -1, ch: [[f.u, E.HECHO]].concat(marco.length ? [[marco[marco.length - 1].u, E.ACT]] : []), ds: pila(), lin: LN.dfsRec.volver,
          msg: nm(g, f.u) + ' no tiene más vecinos sin visitar: **rama agotada**, la llamada termina' + (marco.length ? ' y se retrocede a ' + nm(g, marco[marco.length - 1].u) + '.' : '.') });
        else pend.push(f.u);
      }
    }
    if (!hallado) {
      const resto = sinDup(pend.concat(pila()));   // las llamadas que quedaban terminan
      T.p({ k: 'fin', u: -1, ch: resto.map(c => [c, E.HECHO]), ds: [], lin: LN.dfsRec.volver, msg: t >= 0 ? 'No hay camino de ' + nm(g, s) + ' a ' + nm(g, t) + ': se recorrió todo lo alcanzable.' : 'La pila de llamadas quedó vacía: fin. **Orden DFS:** ' + lista(g, orden) + '.' });
      T.res.camino = [];
    } else cierre(T, g, s, t, prev, true, LN.dfsRec.meta, 'DFS halla **un** camino, no necesariamente el más corto. ');
    T.res.orden = orden; T.res.prev = Array.from(prev); T.res.hallado = hallado; T.res.maxEstr = maxP; T.res.exp = orden.length; T.res.estructura = 'pila de llamadas';
    return T;
  };

  /* ===================================================================== DFS iterativo (diap. 16) ===================================================================== */
  G.dfsIter = function (g, s, t, o) {
    o = o || {}; const det = !!o.detalle, inv = !!o.inverso, T = new Trazo(g, 'dfsIter', o), vis = new Uint8Array(g.n), prev = new Int32Array(g.n).fill(-1), pila = [s], orden = [];
    let hallado = false, maxP = 1; const L = LN.dfsIter;
    T.p({ k: 'ini', u: -1, ch: [[s, E.COLA]], ds: pila.slice(), lin: L.ini, msg: 'La pila empieza con el origen ' + nm(g, s) + '.' });
    while (pila.length) {
      const u = pila.pop();
      if (vis[u]) { if (det) T.p({ k: 'omitir', u, ds: pila.slice(), lin: L.sacar.concat(L.omitir), msg: nm(g, u) + ' ya estaba visitado (entró a la pila por otra rama): se **descarta**.' }); continue; }
      vis[u] = 1; orden.push(u); T.exp++;
      if (det) T.p({ k: 'sacar', u, ch: [[u, E.ACT]], vis: u, ds: pila.slice(), lin: L.sacar.concat(L.visitar), msg: 'Se **desapila** ' + nm(g, u) + ' (sale el último que entró: LIFO) y se visita; es el n.º ' + orden.length + '.' });
      if (u === t) { hallado = true; T.p({ k: 'meta', u, ch: [[u, E.HECHO]], vis: det ? undefined : u, ds: pila.slice(), lin: L.meta, msg: '¡' + nm(g, u) + ' es el destino! Se detiene tras visitar **' + orden.length + '** nodos.' }); break; }
      const vs = G.vec(g, u, o.orden), it = inv ? vs.slice().reverse() : vs, nuevos = [];
      for (const e of it) {
        const v = e.v;
        if (vis[v]) { if (det) T.p({ k: 'mirar', u, v, ar: [[u, v]], ds: pila.slice(), lin: L.mirar, msg: nm(g, v) + ' ya está visitado: no se apila.' }); continue; }
        prev[v] = u; pila.push(v); nuevos.push(v); maxP = Math.max(maxP, pila.length);
        if (det) T.p({ k: 'enc', u, v, ar: [[u, v]], ch: [[v, E.COLA]], pv: [[v, u]], ds: pila.slice(), lin: L.apilar, msg: nm(g, v) + ' no está visitado: se **apila** (su padre queda ' + g.nom[u] + ').' });
      }
      if (det) T.p({ k: 'cerrar', u, ch: [[u, E.HECHO]], ds: pila.slice(), lin: L.sacar, msg: nm(g, u) + ' queda **procesado**.' });
      else T.p({ k: 'exp', u, ch: [[u, E.HECHO]].concat(nuevos.map(v => [v, E.COLA])), pv: nuevos.map(v => [v, u]), vis: u, ar: nuevos.map(v => [u, v]), ds: pila.slice(), lin: L.sacar.concat(L.visitar, L.apilar),
        msg: 'Desapila ' + nm(g, u) + ' (n.º ' + orden.length + ')' + (nuevos.length ? ' → apila ' + nuevos.map(v => b(g.nom[v])).join(', ') + (nuevos.length > 1 ? ' (sale primero **' + g.nom[nuevos[nuevos.length - 1]] + '**).' : '.') : ': no tiene vecinos nuevos.') });
    }
    cierre(T, g, s, t, prev, hallado, L.fin, 'DFS halla **un** camino, no necesariamente el más corto. ');
    if (t < 0) T.p({ k: 'fin', u: -1, ds: [], lin: L.fin, msg: 'La pila quedó vacía: fin. **Orden DFS:** ' + lista(g, orden) + (inv ? '.' : ' (apilando en el orden del grafo, el último vecino sale primero; con «al revés» coincide con la versión recursiva).') });
    T.res.orden = orden; T.res.prev = Array.from(prev); T.res.hallado = hallado; T.res.maxEstr = maxP; T.res.exp = orden.length; T.res.estructura = 'pila';
    return T;
  };

  /* ===================================================================== Dijkstra (S12-C2 diap. 6-19) y A* (diap. 28-37) ===================================================================== */
  /** frontera: nodos con costo finito aún no cerrados, de menor a mayor prioridad (para mostrarla) */
  const frontera = (n, cost, proc, h) => { const a = []; for (let i = 0; i < n; i++) if (!proc[i] && cost[i] < Infinity) a.push([i, h ? cost[i] + h[i] : cost[i]]); a.sort((x, y) => x[1] - y[1] || x[0] - y[0]); return a; };
  function listaCostos(g, cost, proc, s) { const a = []; for (let i = 0; i < g.n; i++) if (i !== s && cost[i] < Infinity) a.push(g.nom[i] + ' = ' + fmt(cost[i])); return a.join(', '); }

  /** Dijkstra con la búsqueda lineal de la clase (O(V²)) o, con o.heap, con cola de prioridad (O(E log V)); con o.h (y t) es A* */
  function costoMinimo(alg, g, s, t, o) {
    o = o || {}; const det = !!o.detalle, T = new Trazo(g, alg, o), n = g.n, esA = alg === 'astar', L = LN[alg], h = esA ? (o.h || G.heur(g, t, 'auto', 1)) : null;
    const cost = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), proc = new Uint8Array(n), neg = G.hayNegativos(g), cerrados = [];
    cost[s] = 0; let hallado = false, maxF = 1;
    const aviso = neg && !esA ? ' ⚠ Hay pesos negativos: Dijkstra puede dar un resultado **incorrecto**.' : '';
    T.p({ k: 'ini', u: -1, ch: [[s, E.COLA]], d: [[s, 0, -1]], hf: esA ? [[s, h[s]]] : undefined, ds: frontera(n, cost, proc, h), lin: L.ini,
      msg: 'Inicio: costo **0** en el origen ' + nm(g, s) + ' y **∞** en los demás; todavía no hay nodos procesados.' + (esA ? ' f = g + h; en el origen f = 0 + ' + fmt(h[s]) + '.' : '') + aviso });
    for (;;) {
      let best = -1, low = Infinity;   // «el no procesado más barato» (empate: el primero en el orden de los nodos, como find_lowest_*_node)
      for (let i = 0; i < n; i++) if (!proc[i]) { const val = esA ? cost[i] + h[i] : cost[i]; if (val < low) { low = val; best = i; } }
      if (best < 0) break;
      const u = best; maxF = Math.max(maxF, frontera(n, cost, proc, h).length);
      if (u === t) {
        proc[u] = 1; cerrados.push(u); T.exp++; hallado = true;
        T.p({ k: 'meta', u, ch: [[u, E.HECHO]], vis: u, ds: frontera(n, cost, proc, h), lin: L.meta,
          msg: esA ? '**Expande ' + g.nom[u] + '** (g = ' + fmt(cost[u]) + ', f = ' + fmt(cost[u] + h[u]) + '): ¡es el destino! A* expandió **' + T.exp + '** nodos.' : 'Se cierra el destino ' + nm(g, u) + ' con costo **' + fmt(cost[u]) + '**: ya es óptimo (' + T.exp + ' nodos cerrados).' }); break;
      }
      if (det) T.p({ k: 'elegir', u, ch: [[u, E.ACT]], hi: [u], ds: frontera(n, cost, proc, h), lin: L.elegir, msg: 'Se elige el no procesado ' + (esA ? 'de menor **f = g + h**' : 'más barato') + ': ' + nm(g, u) + ' (' + (esA ? 'g = ' + fmt(cost[u]) + ', f = ' + fmt(low) : 'costo ' + fmt(cost[u])) + ').' });
      const mejoras = [];
      for (const e of g.ady[u]) {
        const v = e.v, nuevo = cost[u] + e.w, mejor = nuevo < cost[v];
        if (mejor) { const ant = cost[v]; cost[v] = nuevo; prev[v] = u; mejoras.push([v, nuevo, ant]); }
        if (det) {
          if (mejor) T.p({ k: 'relajar', u, v, ar: [[u, v]], ch: proc[v] ? [] : [[v, E.COLA]], d: [[v, nuevo, u]], hf: esA ? [[v, nuevo + h[v]]] : undefined, hi: [v], ds: frontera(n, cost, proc, h), lin: L.mejora,
            msg: fmt(cost[u]) + ' + ' + fmt(e.w) + ' = ' + fmt(nuevo) + ' < ' + fmt(mejoras[mejoras.length - 1][2]) + ' → **mejora**: costo de ' + nm(g, v) + ' = ' + fmt(nuevo) + ' (predecesor ' + g.nom[u] + ').' });
          else T.p({ k: 'noMejora', u, v, ar: [[u, v]], ds: frontera(n, cost, proc, h), lin: L.nomejora, msg: fmt(cost[u]) + ' + ' + fmt(e.w) + ' = ' + fmt(nuevo) + ' ≥ ' + fmt(cost[v]) + ' → **no mejora**; ' + g.nom[v] + ' queda igual.' });
        }
      }
      proc[u] = 1; cerrados.push(u); T.exp++;
      if (det) T.p({ k: 'cerrar', u, ch: [[u, E.HECHO]], vis: u, ds: frontera(n, cost, proc, h), lin: L.cerrar, msg: 'Se **cierra** ' + nm(g, u) + ' (' + (esA ? 'expandido' : 'procesado') + '): ' + (esA ? 'ya no se vuelve a elegir.' : 'su costo ' + fmt(cost[u]) + ' ya no cambia.') });
      else T.p({ k: 'cerrar', u, ch: [[u, E.HECHO]].concat(mejoras.filter(m => !proc[m[0]]).map(m => [m[0], E.COLA])), d: mejoras.map(m => [m[0], m[1], u]), hf: esA ? mejoras.map(m => [m[0], m[1] + h[m[0]]]) : undefined, hi: mejoras.map(m => m[0]), ar: mejoras.map(m => [u, m[0]]), vis: u, ds: frontera(n, cost, proc, h), lin: L.elegir.concat(L.vecino, L.mejora, L.cerrar),
        msg: (esA ? 'Expande **' + g.nom[u] + '** (g = ' + fmt(cost[u]) + ', f = ' + fmt(cost[u] + h[u]) + ')' : 'Cierra **' + g.nom[u] + '** (' + fmt(cost[u]) + ')') + (mejoras.length ? ' → ' + mejoras.map(m => g.nom[m[0]] + (esA ? ' (g ' + fmt(m[1]) + ', f ' + fmt(m[1] + h[m[0]]) + ')' : ' = ' + fmt(m[1]) + (m[2] < Infinity ? ' (antes ' + fmt(m[2]) + ')' : ''))).join(', ') + '.' : ' (sin mejoras).') });
    }
    T.res.costos = Array.from(cost); T.res.prev = Array.from(prev); T.res.cerrados = cerrados; T.res.hallado = hallado; T.res.maxEstr = maxF; T.res.exp = T.exp; T.res.estructura = 'tabla de costos'; T.res.h = h;
    if (t >= 0) {
      const ok = cost[t] < Infinity;
      cierre(T, g, s, t, prev, ok, L.fin, '');
      if (esA && ok && o.optimo !== undefined && cost[t] > o.optimo) { T.res.noOptimo = true; T.pasos[T.pasos.length - 1].msg += ' ⚠ **No es óptimo**: el mejor camino cuesta ' + fmt(o.optimo) + '. La heurística **sobrestima** (no es admisible) y A* pierde la garantía.'; }
    } else T.p({ k: 'fin', u: -1, ds: [], lin: L.fin, msg: 'No quedan nodos por procesar. **Costos mínimos desde ' + g.nom[s] + ':** ' + listaCostos(g, cost, proc, s) + '.' + aviso });
    return T;
  }
  G.dijkstra = (g, s, t, o) => (o && o.heap) ? dijkstraHeap(g, s, t, o) : costoMinimo('dijkstra', g, s, t, o);
  G.astar = (g, s, t, o) => costoMinimo('astar', g, s, t, o);

  /** Dijkstra con heapq (complemento): las entradas obsoletas se descartan al salir; el desempate de la tupla (d, nombre) es alfabético como en Python */
  function dijkstraHeap(g, s, t, o) {
    o = o || {}; const det = !!o.detalle, T = new Trazo(g, 'dijkstraHeap', o), n = g.n, L = LN.dijkstraHeap, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), proc = new Uint8Array(n), heap = [[0, s]], cerrados = [];
    dist[s] = 0; let hallado = false, maxH = 1, obsoletas = 0;
    const menor = (a, c) => a[0] - c[0] || (g.nom[a[1]] < g.nom[c[1]] ? -1 : (g.nom[a[1]] > g.nom[c[1]] ? 1 : 0));
    const vista = () => heap.slice().sort(menor).map(e => [e[1], e[0]]);
    T.p({ k: 'ini', u: -1, ch: [[s, E.COLA]], d: [[s, 0, -1]], ds: vista(), lin: L.ini, msg: 'La cola de prioridad empieza con **(0, ' + g.nom[s] + ')**; el resto de las distancias es ∞.' });
    while (heap.length) {
      heap.sort(menor); const [d, u] = heap.shift();
      if (d > dist[u]) { obsoletas++; T.p({ k: 'obsoleta', u, ds: vista(), lin: L.sacar.concat(L.obsoleta), msg: 'Sale **(' + fmt(d) + ', ' + g.nom[u] + ')** pero ya hay una distancia mejor (' + fmt(dist[u]) + '): entrada **obsoleta**, se descarta.' }); continue; }
      proc[u] = 1; cerrados.push(u); T.exp++;
      if (u === t) { hallado = true; T.p({ k: 'meta', u, ch: [[u, E.HECHO]], vis: u, ds: vista(), lin: L.meta, msg: 'Sale **(' + fmt(d) + ', ' + g.nom[u] + ')**: el destino se cierra con costo **' + fmt(d) + '**.' }); break; }
      const mejoras = [];
      for (const e of g.ady[u]) {
        const v = e.v, nuevo = d + e.w;
        if (nuevo < dist[v]) { const ant = dist[v]; dist[v] = nuevo; prev[v] = u; heap.push([nuevo, v]); maxH = Math.max(maxH, heap.length); mejoras.push([v, nuevo, ant]);
          if (det) T.p({ k: 'relajar', u, v, ar: [[u, v]], ch: proc[v] ? [] : [[v, E.COLA]], d: [[v, nuevo, u]], hi: [v], ds: vista(), lin: L.mejora, msg: fmt(d) + ' + ' + fmt(e.w) + ' = ' + fmt(nuevo) + ' < ' + fmt(ant) + ' → se actualiza ' + nm(g, v) + ' y se empuja **(' + fmt(nuevo) + ', ' + g.nom[v] + ')**.' }); }
        else if (det) T.p({ k: 'noMejora', u, v, ar: [[u, v]], ds: vista(), lin: L.nomejora, msg: fmt(d) + ' + ' + fmt(e.w) + ' = ' + fmt(nuevo) + ' ≥ ' + fmt(dist[v]) + ' → no mejora.' });
      }
      if (det) T.p({ k: 'cerrar', u, ch: [[u, E.HECHO]], vis: u, ds: vista(), lin: L.sacar, msg: 'Se cierra ' + nm(g, u) + ' (' + fmt(d) + ').' });
      else T.p({ k: 'cerrar', u, ch: [[u, E.HECHO]].concat(mejoras.filter(m => !proc[m[0]]).map(m => [m[0], E.COLA])), d: mejoras.map(m => [m[0], m[1], u]), hi: mejoras.map(m => m[0]), ar: mejoras.map(m => [u, m[0]]), vis: u, ds: vista(), lin: L.sacar.concat(L.vecino, L.mejora),
        msg: 'Sale **(' + fmt(d) + ', ' + g.nom[u] + ')** → cierra ' + nm(g, u) + (mejoras.length ? ' y empuja ' + mejoras.map(m => '(' + fmt(m[1]) + ', ' + g.nom[m[0]] + ')').join(', ') + '.' : ' (sin mejoras).') });
    }
    T.res.costos = Array.from(dist); T.res.prev = Array.from(prev); T.res.cerrados = cerrados; T.res.hallado = hallado; T.res.maxEstr = maxH; T.res.exp = T.exp; T.res.obsoletas = obsoletas; T.res.estructura = 'heap';
    if (t >= 0) cierre(T, g, s, t, prev, dist[t] < Infinity, L.fin, ''); else T.p({ k: 'fin', u: -1, ds: [], lin: L.fin, msg: 'El heap quedó vacío. **Costos mínimos desde ' + g.nom[s] + ':** ' + listaCostos(g, dist, proc, s) + '.' });
    return T;
  }

  /** distancias mínimas desde s (referencia sencilla, sin trazas): para validar y para saber el costo óptimo */
  G.distMin = function (g, s) {
    const n = g.n, d = new Array(n).fill(Infinity), p = new Array(n).fill(-1), hecho = new Array(n).fill(false); d[s] = 0;
    for (let it = 0; it < n; it++) { let u = -1; for (let i = 0; i < n; i++) if (!hecho[i] && d[i] < Infinity && (u < 0 || d[i] < d[u])) u = i; if (u < 0) break; hecho[u] = true; g.ady[u].forEach(e => { if (d[u] + e.w < d[e.v]) { d[e.v] = d[u] + e.w; p[e.v] = u; } }); }
    return { dist: d, prev: p };
  };

  /* ===================================================================== Bellman-Ford (diap. 38, 41) ===================================================================== */
  G.bellman = function (g, s, t, o) {
    o = o || {}; const det = !!o.detalle, T = new Trazo(g, 'bellman', o), n = g.n, L = LN.bellman, dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1);
    const ar = []; g.aristas.forEach(e => { ar.push([e.a, e.b, e.w]); if (!g.dirigido) ar.push([e.b, e.a, e.w]); });
    dist[s] = 0; const finitos = () => { const c = []; for (let i = 0; i < n; i++) if (dist[i] < Infinity) c.push([i]); return c; };
    T.p({ k: 'ini', u: -1, ch: [[s, E.COLA]], d: [[s, 0, -1]], ds: [], lin: L.ini, msg: 'Costo **0** en el origen ' + nm(g, s) + ' y **∞** en los demás. Se relajarán **todas** las aristas hasta ' + (n - 1) + ' veces (|V| − 1).' });
    let pasadas = 0, relaj = 0;
    for (let k = 1; k <= n - 1; k++) {
      pasadas = k; const cambios = [];
      for (const [u, v, w] of ar) {
        const nuevo = dist[u] + w, mejor = nuevo < dist[v]; relaj++;
        if (mejor) { const ant = dist[v]; dist[v] = nuevo; prev[v] = u; cambios.push([v, nuevo, ant, u]); }
        if (det) T.p({ k: 'arista', u, v, ar: [[u, v]], ch: mejor ? [[v, E.COLA]] : [], d: mejor ? [[v, nuevo, u]] : undefined, hi: mejor ? [v] : [], lin: mejor ? L.arista.concat(L.mejora) : L.arista,
          msg: 'Pasada ' + k + ', arista ' + g.nom[u] + ' → ' + g.nom[v] + ' (' + fmt(w) + '): ' + fmt(dist[u]) + ' + ' + fmt(w) + (mejor ? ' = ' + fmt(nuevo) + ' < ' + fmt(cambios[cambios.length - 1][2]) + ' → **mejora** ' + nm(g, v) + '.' : ' no mejora ' + g.nom[v] + '.') });
      }
      T.exp = k;
      if (!det) T.p({ k: 'pasada', u: -1, ch: cambios.map(c => [c[0], E.COLA]), d: cambios.map(c => [c[0], c[1], c[3]]), hi: cambios.map(c => c[0]), ar: cambios.map(c => [c[3], c[0]]), lin: L.pasada.concat(L.arista, L.mejora),
        msg: '**Pasada ' + k + ' de ' + (n - 1) + '**: ' + (cambios.length ? 'mejoran ' + cambios.map(c => g.nom[c[0]] + ' = ' + fmt(c[1])).join(', ') + '.' : 'ninguna distancia mejora.') });
      if (!cambios.length) { T.p({ k: 'parar', u: -1, lin: L.parar, msg: 'En la pasada ' + k + ' no hubo cambios: ya no mejorará más, se puede **parar antes**.' }); break; }
    }
    let ciclo = false, malo = null;
    for (const [u, v, w] of ar) if (dist[u] + w < dist[v]) { ciclo = true; malo = [u, v]; break; }
    if (ciclo) T.p({ k: 'ciclo', u: -1, ar: [malo], hi: [malo[1]], lin: L.ciclo, msg: '⚠ Una pasada **extra** todavía mejora la arista ' + g.nom[malo[0]] + ' → ' + g.nom[malo[1]] + ': hay un **ciclo negativo**; no existe camino mínimo (la función devuelve None).' });
    else {
      const cam = t >= 0 && dist[t] < Infinity ? G.camino(prev, s, t) : [];
      T.p({ k: 'fin', u: -1, ch: finitos().map(c => [c[0], E.HECHO]).concat(cam.map(i => [i, E.CAMINO])), camino: cam, lin: L.fin, msg: 'Sin ciclos negativos tras la pasada extra. **Costos mínimos desde ' + g.nom[s] + ':** ' + listaCostos(g, dist, new Uint8Array(n), s) + '.' + (cam.length ? ' Camino a ' + nm(g, t) + ': ' + cam.map(i => g.nom[i]).join(' → ') + ' (costo ' + fmt(dist[t]) + ').' : '') });
      if (cam.length) { T.res.camino = cam; T.res.costo = dist[t]; T.res.longitud = cam.length - 1; }
    }
    T.res.costos = Array.from(dist); T.res.prev = Array.from(prev); T.res.cicloNegativo = ciclo; T.res.pasadas = pasadas; T.res.relajaciones = relaj; T.res.exp = pasadas; T.res.maxEstr = 0; T.res.estructura = 'lista de aristas'; T.res.hallado = !ciclo && (t < 0 || dist[t] < Infinity);
    return T;
  };

  /* ===================================================================== Floyd-Warshall (diap. 38) ===================================================================== */
  G.floyd = function (g, s, t, o) {
    o = o || {}; const det = !!o.detalle, T = new Trazo(g, 'floyd', o), n = g.n, L = LN.floyd;
    const M = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : Infinity));
    g.aristas.forEach(e => { M[e.a][e.b] = Math.min(M[e.a][e.b], e.w); if (!g.dirigido) M[e.b][e.a] = Math.min(M[e.b][e.a], e.w); });
    const copia = () => M.map(r => r.slice());
    T.p({ k: 'ini', u: -1, mat: copia(), extra: { k: -1, cambios: [] }, lin: L.ini, msg: 'Matriz inicial: **0** en la diagonal, el peso de cada arista donde existe y **∞** donde no hay arista directa.' });
    let relaj = 0, total = 0;
    for (let k = 0; k < n; k++) {
      const cambios = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        relaj++; const nuevo = M[i][k] + M[k][j];
        if (nuevo < M[i][j]) {
          const ant = M[i][j]; M[i][j] = nuevo; cambios.push([i, j, nuevo, ant]); total++;
          if (det) T.p({ k: 'mejora', u: k, mat: copia(), extra: { k, cambios: [[i, j, nuevo, ant]] }, lin: L.mejora, msg: 'k = ' + nm(g, k) + ': ir de ' + g.nom[i] + ' a ' + g.nom[j] + ' pasando por ' + g.nom[k] + ' cuesta ' + fmt(M[i][k]) + ' + ' + fmt(M[k][j]) + ' = ' + fmt(nuevo) + ' < ' + fmt(ant) + ' → d[' + g.nom[i] + '][' + g.nom[j] + '] = ' + fmt(nuevo) + '.' });
        }
      }
      T.exp = k + 1;
      if (!det) T.p({ k: 'k', u: k, mat: copia(), extra: { k, cambios }, lin: L.k.concat(L.ij, L.mejora), msg: '**k = ' + g.nom[k] + '** (intermedio ' + (k + 1) + ' de ' + n + '): ' + (cambios.length ? 'mejoran ' + cambios.map(c => g.nom[c[0]] + '→' + g.nom[c[1]] + ' = ' + fmt(c[2]) + ' (antes ' + fmt(c[3]) + ')').join(', ') + '.' : 'ningún par mejora pasando por ' + g.nom[k] + '.') });
    }
    let neg = false; for (let i = 0; i < n; i++) if (M[i][i] < 0) neg = true;
    T.p({ k: 'fin', u: -1, mat: copia(), extra: { k: n, cambios: [] }, lin: L.fin, msg: 'Ya se probó cada nodo como intermedio: la matriz tiene la **distancia mínima entre todos los pares** (' + n + '³ = ' + (n * n * n) + ' comprobaciones, ' + total + ' mejoras).' + (neg ? ' ⚠ Hay un valor negativo en la diagonal: **ciclo negativo**.' : '') });
    T.res.matriz = M.map(r => r.slice()); T.res.mejoras = total; T.res.relajaciones = relaj; T.res.cicloNegativo = neg; T.res.exp = n; T.res.maxEstr = 0; T.res.estructura = 'matriz de distancias'; T.res.hallado = true;
    return T;
  };

  /* ===================================================================== BFS bidireccional (complemento) ===================================================================== */
  G.bidir = function (g, s, t, o) {
    o = o || {}; const T = new Trazo(g, 'bidir', o), n = g.n, L = LN.bidir, pS = new Int32Array(n).fill(-2), pT = new Int32Array(n).fill(-2), qS = [s], qT = [t]; let hS = 0, hT = 0, enc = -1, maxQ = 2;
    if (s === t) { T.p({ k: 'meta', u: s, ch: [[s, E.CAMINO]], camino: [s], ds: [s], lin: L.ini, msg: 'El origen y el destino son el mismo nodo.' }); T.res.camino = [s]; T.res.hallado = true; T.res.exp = 0; T.res.maxEstr = 1; T.res.longitud = 0; T.res.costo = 0; T.res.orden = []; T.res.estructura = 'dos colas'; return T; }
    pS[s] = -1; pT[t] = -1;
    T.p({ k: 'ini', u: -1, ch: [[s, E.COLA], [t, E.COLA2]], ds: [s], ds2: [t], lin: L.ini, msg: 'Dos búsquedas a la vez: una **desde ' + nm(g, s) + '** y otra **desde ' + nm(g, t) + '**; terminan cuando sus frentes se tocan.' });
    outer: while (hS < qS.length && hT < qT.length) {
      const desdeS = (qS.length - hS) <= (qT.length - hT), cola = desdeS ? qS : qT, mio = desdeS ? pS : pT, otro = desdeS ? pT : pS; let cab = desdeS ? hS : hT; const nivel = cola.length - cab;
      for (let c = 0; c < nivel; c++) {
        const u = cola[cab++]; T.exp++; const nuevos = [];
        for (const e of g.ady[u]) {
          const w = e.v; if (mio[w] !== -2) continue;
          mio[w] = u; cola.push(w); nuevos.push(w);
          if (otro[w] !== -2) { enc = w; T.p({ k: 'meta', u, v: w, ch: [[u, desdeS ? E.HECHO : E.HECHO2], [w, E.ACT]], ar: [[u, w]], ds: qS.slice(hS), ds2: qT.slice(hT), lin: L.encuentro, msg: 'Los dos frentes se **tocan en ' + g.nom[w] + '**: la búsqueda desde ' + (desdeS ? 'el origen' : 'el destino') + ' alcanzó un nodo que la otra ya había visitado.' }); break outer; }
        }
        maxQ = Math.max(maxQ, qS.length - hS + qT.length - hT);
        if (desdeS) hS = cab; else hT = cab;
        T.p({ k: 'exp', u, ch: [[u, desdeS ? E.HECHO : E.HECHO2]].concat(nuevos.map(v => [v, desdeS ? E.COLA : E.COLA2])), pv: nuevos.map(v => [v, u]), ar: nuevos.map(v => [u, v]), ds: qS.slice(hS), ds2: qT.slice(hT), lin: L.sacar.concat(L.mirar, L.enc),
          msg: (desdeS ? 'Frente del **origen**' : 'Frente del **destino**') + ': expande ' + nm(g, u) + (nuevos.length ? ' → ' + nuevos.length + ' nodo(s) nuevo(s).' : ' (sin vecinos nuevos).') });
      }
      if (desdeS) hS = cab; else hT = cab;
    }
    let cam = [];
    if (enc >= 0) { const a = []; for (let x = enc; x !== -1; x = pS[x]) a.push(x); a.reverse(); for (let x = pT[enc]; x !== -1; x = pT[x]) a.push(x); cam = a; }
    if (cam.length) { T.p({ k: 'camino', u: -1, ch: cam.map(i => [i, E.CAMINO]), camino: cam, ds: [], ds2: null, lin: L.fin, msg: 'Camino de ' + (cam.length - 1) + ' aristas. Con **dos búsquedas** de la mitad de profundidad se visitan muchos menos nodos que con un solo BFS.' }); T.res.camino = cam; T.res.longitud = cam.length - 1; T.res.costo = g.ponderado ? G.pesoCamino(g, cam) : cam.length - 1; }
    else T.p({ k: 'fin', u: -1, ds: [], lin: L.fin, msg: 'Los frentes no se tocan: no hay camino.' });
    T.res.hallado = cam.length > 0; T.res.exp = T.exp; T.res.maxEstr = maxQ; T.res.orden = []; T.res.estructura = 'dos colas';
    return T;
  };

  /* ===================================================================== contar islas / componentes (S12-C1 diap. 26) ===================================================================== */
  G.contarIslas = function (g, s, t, o) {
    o = o || {}; const dfs = o.pila || o.alg === 'islasDfs', T = new Trazo(g, dfs ? 'islasDfs' : 'islasBfs', o), L = dfs ? LN.islasDfs : LN.islasBfs, n = g.n, vis = new Uint8Array(n), tam = [];
    let k = 0, maxE = 1;
    for (let i = 0; i < n; i++) {
      if (g.muro[i] || vis[i]) continue;
      k++; vis[i] = 1; const est = [i]; let sz = 1; const col = E.ISLA0 + (k - 1);
      T.p({ k: 'nueva', u: i, ch: [[i, col]], islas: k, ds: [i], lin: L.barrer.concat(L.nueva), msg: 'Al barrer la cuadrícula aparece **tierra sin visitar** en ' + G.nombreCelda(g, i) + ': es la **isla n.º ' + k + '** (el contador sube a ' + k + '). Se lanza un ' + (dfs ? 'DFS con pila' : 'BFS con cola') + ' que marca toda la isla.' });
      let head = 0;
      while (dfs ? est.length : head < est.length) {
        const u = dfs ? est.pop() : est[head++]; T.exp++; const nuevos = [];
        for (const e of G.vec(g, u, o.orden)) { if (!vis[e.v]) { vis[e.v] = 1; nuevos.push(e.v); est.push(e.v); sz++; } }
        maxE = Math.max(maxE, dfs ? est.length : est.length - head);
        T.p({ k: 'exp', u, ch: nuevos.map(v => [v, col]), islas: k, ds: dfs ? est.slice() : est.slice(head), lin: L.sacar.concat(L.vecinos, L.marcar), msg: (dfs ? 'Desapila ' : 'Desencola ') + b(G.nombreCelda(g, u)) + (nuevos.length ? ' → marca ' + nuevos.length + ' vecina(s) de tierra de la isla ' + k + '.' : ': sin vecinas nuevas.') });
      }
      tam.push(sz);
    }
    T.p({ k: 'fin', u: -1, islas: k, ds: [], lin: L.fin, msg: 'Se revisó toda la cuadrícula: hay **' + k + ' isla' + (k === 1 ? '' : 's') + '**' + (k ? ' (tamaños: ' + tam.join(', ') + ' celdas)' : '') + '. Cada celda se visitó **una sola vez**: O(filas × columnas).' });
    T.res.islas = k; T.res.tamanos = tam; T.res.exp = T.exp; T.res.maxEstr = maxE; T.res.estructura = dfs ? 'pila' : 'cola'; T.res.hallado = true; T.res.orden = [];
    return T;
  };

  /* ===================================================================== construir un laberinto con DFS (complemento) ===================================================================== */
  G.generar = function (g, s, t, o) {
    o = o || {}; const T = new Trazo(g, 'generar', o), L = LN.generar, pila = [], ev = g.eventos || []; let maxP = 0; const nom = i => b(G.nombreCelda(g, i));
    ev.forEach(e => {
      if (e.t === 'ini') { pila.push(e.room); T.exp++; maxP = 1; T.p({ k: 'ini', u: e.room, ch: [[e.room, E.ACT]], vis: e.room, ds: pila.slice(), lin: L.ini, msg: 'Todo empieza **lleno de paredes**. Se parte de la habitación ' + nom(e.room) + ': se marca como visitada y entra a la **pila**.' }); }
      else if (e.t === 'tallar') {
        const ant = pila[pila.length - 1]; pila.push(e.room); T.exp++; maxP = Math.max(maxP, pila.length);
        T.p({ k: 'tallar', u: e.room, ch: [[ant, E.COLA], [e.conn, E.HECHO], [e.room, E.ACT]], vis: e.room, ds: pila.slice(), lin: L.mirar.concat(L.tallar), msg: 'Desde ' + nom(ant) + ' se elige **al azar** un vecino sin visitar, ' + nom(e.room) + ': se **derriba la pared** entre los dos y se avanza (DFS: hasta el fondo).' });
      } else {
        const sale = pila.pop(), nuevo = pila[pila.length - 1];
        T.p({ k: 'volver', u: nuevo === undefined ? -1 : nuevo, ch: [[sale, E.HECHO]].concat(nuevo === undefined ? [] : [[nuevo, E.ACT]]), ds: pila.slice(), lin: L.volver, msg: nom(sale) + ' **no tiene vecinos sin visitar**: callejón sin salida, se **retrocede**' + (nuevo === undefined ? '.' : ' a ' + nom(nuevo) + '.') });
      }
    });
    if (g.extra && g.extra.length) T.p({ k: 'atajos', u: -1, ch: g.extra.map(i => [i, E.HECHO]), ds: [], lin: [], msg: 'Se derriban **' + g.extra.length + '** paredes más al azar: ahora hay **varios caminos** entre algunas celdas (atajos).' });
    T.p({ k: 'fin', u: -1, ds: [], lin: L.volver, msg: 'Laberinto listo: cada habitación se visitó una vez (**O(filas × columnas)**) y, sin atajos, hay **un único camino** entre cualquier par de celdas. Ahora elige un algoritmo para resolverlo.' });
    T.res.exp = T.exp; T.res.maxEstr = maxP; T.res.estructura = 'pila'; T.res.hallado = true; T.res.orden = []; T.res.camino = [];
    return T;
  };

  /** ejecuta un algoritmo por su clave y devuelve la traza */
  G.correr = function (alg, g, s, t, o) {
    o = o || {};
    switch (alg) {
      case 'bfs': return G.bfs(g, s, t, o);
      case 'dfsRec': return G.dfsRec(g, s, t, o);
      case 'dfsIter': return G.dfsIter(g, s, t, o);
      case 'dijkstra': return G.dijkstra(g, s, t, o);
      case 'dijkstraHeap': return G.dijkstra(g, s, t, Object.assign({}, o, { heap: true }));
      case 'astar': { const opt = t >= 0 ? G.distMin(g, s).dist[t] : undefined; return G.astar(g, s, t, Object.assign({ optimo: opt }, o, { h: o.h || G.heur(g, t, 'auto', o.hpeso === undefined ? 1 : o.hpeso) })); }
      case 'bellman': return G.bellman(g, s, t, o);
      case 'floyd': return G.floyd(g, s, t, o);
      case 'bidir': return G.bidir(g, s, t, o);
      case 'generar': return G.generar(g, s, t, o);
      case 'islasBfs': return G.contarIslas(g, s, t, Object.assign({}, o, { pila: false }));
      case 'islasDfs': return G.contarIslas(g, s, t, Object.assign({}, o, { pila: true }));
    }
    throw new Error('Algoritmo desconocido: ' + alg);
  };
  /** el número sobre cada nodo: orden de visita (recorridos) o distancia conocida (caminos mínimos) */
  G.insignia = alg => (alg === 'dijkstra' || alg === 'dijkstraHeap' || alg === 'astar' || alg === 'bellman') ? (i, st) => st.dist[i] < Infinity ? fmt(st.dist[i]) : '' : (alg === 'bidir' ? () => '' : (i, st) => st.ord[i] || '');
  /** cuadros del reproductor (para la explicación de un ejercicio): el grafo en cada paso, la cola o la pila debajo, el mensaje y las líneas del código */
  G.frames = function (T, o) {
    o = o || {}; const g = T.g, out = [], Dib = ET.Dib, rotulo = { bfs: 'Cola', dfsIter: 'Pila', dfsRec: 'Pila de llamadas', bidir: null }[T.alg];
    T._st = null;
    for (let k = 0; k < T.pasos.length; k++) {
      const st = G.estadoEn(T, k), f = G.cuadro(g, st, { pesos: g.ponderado, nombres: o.nombres, badge: G.insignia(T.alg) }), items = f.items.slice(); let hh = f.H;
      if (rotulo) {
        items.push(Dib.etq('q-t', 8, hh + 16, rotulo + ':', 'gris', 'start'));
        st.ds.slice(0, 16).forEach((n, j) => { const nodo = Array.isArray(n) ? n[0] : n; items.push(Dib.caja('q' + j, 112 + j * 34, hh + 4, 30, 24, g.etq[nodo], 'g-q' + (j === 0 && T.alg === 'bfs' ? ' frente' : '') + (j === st.ds.length - 1 && T.alg !== 'bfs' ? ' frente' : ''))); });
        hh += 36;
      }
      out.push({ items, msg: st.msg, linea: st.lin, W: f.W, H: hh });
    }
    T._st = null; return out;
  };
  /** nombres y descripciones cortas para la interfaz */
  G.ALGS = {
    bfs: { nombre: 'BFS (anchura, cola)', corto: 'BFS', estr: 'Cola (FIFO)', cx: 'O(V + E)', camino: 'más corto en saltos', cod: 'bfs' },
    dfsRec: { nombre: 'DFS recursivo (pila de llamadas)', corto: 'DFS recursivo', estr: 'Pila de llamadas', cx: 'O(V + E)', camino: 'un camino (no el más corto)', cod: 'dfsRec' },
    dfsIter: { nombre: 'DFS iterativo (pila)', corto: 'DFS iterativo', estr: 'Pila (LIFO)', cx: 'O(V + E)', camino: 'un camino (no el más corto)', cod: 'dfsIter' },
    dijkstra: { nombre: 'Dijkstra (búsqueda lineal, como en clase)', corto: 'Dijkstra', estr: 'Tabla de costos', cx: 'O(V²)', camino: 'de menor costo (pesos ≥ 0)', cod: 'dijkstra' },
    dijkstraHeap: { nombre: 'Dijkstra con heap (heapq)', corto: 'Dijkstra + heap', estr: 'Cola de prioridad', cx: 'O(E log V)', camino: 'de menor costo (pesos ≥ 0)', cod: 'dijkstraHeap' },
    astar: { nombre: 'A* (Dijkstra con heurística)', corto: 'A*', estr: 'Tabla de costos + h', cx: 'O(E log V)*', camino: 'óptimo si h es admisible', cod: 'astar' },
    bellman: { nombre: 'Bellman-Ford (pesos negativos)', corto: 'Bellman-Ford', estr: 'Lista de aristas', cx: 'O(V · E)', camino: 'de menor costo (admite negativos)', cod: 'bellman' },
    floyd: { nombre: 'Floyd-Warshall (todos los pares)', corto: 'Floyd-Warshall', estr: 'Matriz de distancias', cx: 'O(V³)', camino: 'todos los pares', cod: 'floyd' },
    bidir: { nombre: 'BFS bidireccional', corto: 'BFS bidireccional', estr: 'Dos colas', cx: 'O(V + E)', camino: 'más corto en saltos', cod: 'bidir' },
    generar: { nombre: 'Construir el laberinto con DFS (backtracking)', corto: 'Construcción con DFS', estr: 'Pila', cx: 'O(filas × columnas)', camino: '—', cod: 'generar' },
    islasBfs: { nombre: 'Contar islas con BFS (cola)', corto: 'Islas con BFS', estr: 'Cola (FIFO)', cx: 'O(m × n)', camino: '—', cod: 'islasBfs' },
    islasDfs: { nombre: 'Contar islas con DFS (pila)', corto: 'Islas con DFS', estr: 'Pila (LIFO)', cx: 'O(m × n)', camino: '—', cod: 'islasDfs' }
  };
})(typeof window !== 'undefined' ? window : globalThis);
