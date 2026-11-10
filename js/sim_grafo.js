/* sim_grafo.js — grafos: BFS, DFS y caminos mínimos (S12-C1 y S12-C2).
   Este archivo tiene el MODELO (grafo con lista de adyacencia, rejillas de laberinto/islas, mapa de calles), los GENERADORES con semilla,
   los listados de código Python que se muestran junto a la animación, el reproductor de ESTADOS (qué se ve en el paso k) y el dibujo SVG de un grafo.
   Las trazas de los algoritmos (BFS, DFS, Dijkstra, A*…) están en sim_grafo_alg.js. Nada de esto toca el DOM salvo `cuadro`, que solo devuelve
   elementos para el motor de escenas. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U;
  const Sim = ET.Sim = ET.Sim || {};
  const G = Sim.grafo = {};

  /** estado visual de un nodo en un paso (el dibujo asigna un color a cada uno) */
  const E = G.E = { LIBRE: 0, COLA: 1, ACT: 2, HECHO: 3, CAMINO: 4, COLA2: 5, HECHO2: 6, ISLA0: 10 };

  /* ===================================================================== listados de código ===================================================================== */
  const L = s => s.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const CODIGO = G.CODIGO = {
    bfs: L(`
from collections import deque

def bfs(grafo, inicio, destino=None):
    visitados = set([inicio])
    prev = {inicio: None}                # de que nodo llegamos a cada uno
    cola = deque([inicio])
    orden = []
    while cola:
        u = cola.popleft()               # FIFO: el primero que entro
        orden.append(u)
        if u == destino:                 # llegamos: se puede parar
            break
        for w in grafo[u]:
            if w not in visitados:
                visitados.add(w)         # marcar al encolar evita duplicados
                prev[w] = u
                cola.append(w)
    return orden, prev
`),
    dfsRec: L(`
def dfs_recursivo(grafo, u, visitados, orden, prev, destino=None):
    visitados.add(u)
    orden.append(u)                      # visitar u
    if u == destino:
        return True                      # se encontro: subir sin explorar mas
    for w in grafo[u]:
        if w not in visitados:
            prev[w] = u
            if dfs_recursivo(grafo, w, visitados, orden, prev, destino):
                return True
    return False                         # rama agotada: retroceder
`),
    dfsIter: L(`
def dfs_iterativo(grafo, inicio, destino=None):
    visitados, pila = set(), [inicio]
    prev = {inicio: None}
    orden = []
    while pila:
        u = pila.pop()                   # LIFO: el ultimo que entro
        if u in visitados:
            continue                     # ya se visito por otra rama
        visitados.add(u)
        orden.append(u)
        if u == destino:
            break
        for w in grafo[u]:
            if w not in visitados:
                prev[w] = u              # el ultimo que lo apila es su padre
                pila.append(w)
    return orden, prev
`),
    dfsIterRev: L(`
def dfs_iterativo(grafo, inicio, destino=None):
    visitados, pila = set(), [inicio]
    prev = {inicio: None}
    orden = []
    while pila:
        u = pila.pop()                   # LIFO: el ultimo que entro
        if u in visitados:
            continue                     # ya se visito por otra rama
        visitados.add(u)
        orden.append(u)
        if u == destino:
            break
        for w in reversed(grafo[u]):     # al reves: sale primero el 1.er vecino
            if w not in visitados:
                prev[w] = u              # el ultimo que lo apila es su padre
                pila.append(w)
    return orden, prev
`),
    dijkstra: L(`
def find_lowest_cost_node(costs, processed):
    lowest, best = float("inf"), None
    for node in costs:                   # recorre todos los nodos
        if costs[node] < lowest and node not in processed:
            lowest, best = costs[node], node
    return best

def dijkstra(graph, inicio, destino=None):
    costs = {n: float("inf") for n in graph}     # distancia conocida
    parents = {n: None for n in graph}           # para reconstruir
    costs[inicio] = 0
    processed = []
    node = find_lowest_cost_node(costs, processed)
    while node is not None:              # el no procesado mas barato
        if node == destino:
            break                        # destino cerrado: ya es optimo
        for vecino, peso in graph[node].items():
            nuevo = costs[node] + peso
            if nuevo < costs[vecino]:
                costs[vecino] = nuevo
                parents[vecino] = node
        processed.append(node)
        node = find_lowest_cost_node(costs, processed)
    return costs, parents
`),
    dijkstraHeap: L(`
import heapq

def dijkstra_heap(graph, inicio, destino=None):
    dist = {n: float("inf") for n in graph}
    parents = {n: None for n in graph}
    dist[inicio] = 0
    heap = [(0, inicio)]
    while heap:
        d, u = heapq.heappop(heap)       # el mas cercano
        if d > dist[u]:
            continue                     # entrada obsoleta: se descarta
        if u == destino:
            break
        for v, peso in graph[u].items():
            nuevo = d + peso
            if nuevo < dist[v]:
                dist[v] = nuevo
                parents[v] = u
                heapq.heappush(heap, (nuevo, v))
    return dist, parents
`),
    astar: L(`
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
    return costs[destino], parents
`),
    bellman: L(`
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
`),
    floyd: L(`
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
`),
    bidir: L(`
from collections import deque

def unir(prev_s, prev_t, w):
    ida, a = [], w
    while a is not None:
        ida.append(a)
        a = prev_s[a]
    ida.reverse()
    a = prev_t[w]
    while a is not None:
        ida.append(a)
        a = prev_t[a]
    return ida

def bfs_bidireccional(grafo, s, t):
    if s == t:
        return [s]
    prev_s, prev_t = {s: None}, {t: None}
    cola_s, cola_t = deque([s]), deque([t])
    while cola_s and cola_t:
        if len(cola_s) <= len(cola_t):   # se expande el frente mas pequeno
            cola, mio, otro = cola_s, prev_s, prev_t
        else:
            cola, mio, otro = cola_t, prev_t, prev_s
        for _ in range(len(cola)):       # un nivel completo
            u = cola.popleft()
            for w in grafo[u]:
                if w not in mio:
                    mio[w] = u
                    cola.append(w)
                    if w in otro:        # los dos frentes se tocan
                        return unir(prev_s, prev_t, w)
    return []
`),
    generar: L(`
import random

def generar_laberinto(filas, cols):
    muro = [[1] * cols for _ in range(filas)]     # 1 = pared, 0 = pasillo
    muro[1][1] = 0
    pila = [(1, 1)]
    while pila:                          # DFS con pila: avanza hasta el fondo
        r, c = pila[-1]
        vecinos = []
        for dr, dc in ((-2, 0), (0, 2), (2, 0), (0, -2)):
            nr, nc = r + dr, c + dc
            if 0 < nr < filas - 1 and 0 < nc < cols - 1 and muro[nr][nc] == 1:
                vecinos.append((nr, nc))
        if vecinos:
            nr, nc = random.choice(vecinos)
            muro[(r + nr) // 2][(c + nc) // 2] = 0   # derriba la pared del medio
            muro[nr][nc] = 0
            pila.append((nr, nc))
        else:
            pila.pop()                   # callejon sin salida: retrocede
    return muro
`),
    islasBfs: L(`
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
`),
    islasDfs: L(`
def contar_islas(m):
    filas, cols = len(m), len(m[0])
    visto = [[False] * cols for _ in range(filas)]
    islas = 0
    for r in range(filas):
        for c in range(cols):
            if m[r][c] == 1 and not visto[r][c]:
                islas += 1               # tierra nueva: una isla mas
                visto[r][c] = True
                pila = [(r, c)]
                while pila:              # DFS: marca toda la isla
                    f, k = pila.pop()
                    for df, dk in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nf, nk = f + df, k + dk
                        if 0 <= nf < filas and 0 <= nk < cols and m[nf][nk] == 1 and not visto[nf][nk]:
                            visto[nf][nk] = True
                            pila.append((nf, nk))
    return islas
`)
  };
  /** números de línea (base 1) de las primeras líneas que contienen cada fragmento (para resaltar el código); avisa si uno no existe */
  G.ln = function (alg, ...frags) {
    const cod = CODIGO[alg]; if (!cod) throw new Error('Listado desconocido: ' + alg);
    const out = [];
    frags.forEach(f => { const i = cod.findIndex(l => l.indexOf(f) >= 0); if (i < 0) throw new Error('Línea no encontrada en ' + alg + ': ' + f); out.push(i + 1); });
    return out;
  };
  /** el listado que corresponde a un algoritmo y sus opciones */
  G.codigoDe = (alg, o) => (alg === 'dfsIter' && o && o.inverso) ? CODIGO.dfsIterRev : CODIGO[alg];

  /* ===================================================================== modelo ===================================================================== */
  /** g = {n, nom[], etq[], nomLargo[], x[], y[], ady[][]{v,w}, aristas[]{a,b,w}, dirigido, ponderado, h[], tipo, W, H} */
  G.crear = function (nom, aristas, o) {
    o = o || {}; const n = nom.length, idx = new Map(nom.map((s, i) => [s, i]));
    const g = { n, nom: nom.slice(), etq: o.etq || nom.slice(), nomLargo: o.nomLargo || nom.slice(), x: o.x || [], y: o.y || [], ady: nom.map(() => []), aristas: [], dirigido: !!o.dirigido, ponderado: !!o.ponderado,
      h: o.h || null, tipo: o.tipo || 'grafo', W: o.W || 700, H: o.H || 320, ini: o.ini === undefined ? -1 : o.ini, fin: o.fin === undefined ? -1 : o.fin, titulo: o.titulo || '', seed: o.seed || 1 };
    aristas.forEach(a => {
      const i = typeof a[0] === 'number' ? a[0] : idx.get(a[0]), j = typeof a[1] === 'number' ? a[1] : idx.get(a[1]); const w = a[2] === undefined ? 1 : a[2];
      if (i === undefined || j === undefined) throw new Error('Arista con nodo desconocido: ' + a[0] + '–' + a[1]);
      g.aristas.push({ a: i, b: j, w }); g.ady[i].push({ v: j, w }); if (!g.dirigido) g.ady[j].push({ v: i, w });
    });
    g.ady.forEach(l => l.sort((p, q) => p.v - q.v));
    return g;
  };
  G.hayNegativos = g => g.aristas.some(a => a.w < 0);
  G.numAristas = g => g.tipo === 'rejilla' ? g.ady.reduce((s, l) => s + l.length, 0) / 2 : g.aristas.length;
  /** vecinos de u en el orden pedido: 'asc' (el del grafo), 'desc' (inverso) o 'azar' (fijo por semilla) */
  G.vec = function (g, u, orden) {
    const l = g.ady[u]; if (!orden || orden === 'asc' || l.length < 2) return l;
    if (orden === 'desc') return l.slice().reverse();
    g._perm = g._perm || {}; const k = (g.seed | 0) * 7919 + u;
    return g._perm[u] || (g._perm[u] = new U.RNG(k).shuffle(l));
  };
  const letras = n => { const o = []; for (let i = 0; i < n; i++) o.push(n <= 26 ? String.fromCharCode(65 + i) : String(i + 1)); return o; };
  G.letras = letras;

  /** camino desde el origen hasta t siguiendo prev (vacío si no llega) */
  G.camino = function (prev, s, t) {
    if (t < 0) return []; const c = []; let a = t, guard = 0;
    while (a !== -1 && a !== undefined && guard++ < 100000) { c.push(a); if (a === s) break; a = prev[a]; }
    c.reverse(); return c.length && c[0] === s ? c : [];
  };
  G.pesoCamino = function (g, cam) {
    let t = 0; for (let i = 0; i + 1 < cam.length; i++) { const a = g.ady[cam[i]].find(e => e.v === cam[i + 1]); t += a ? a.w : 0; } return t;
  };

  /* ---------- disposición automática de los nodos (resortes), determinista ---------- */
  function resortes(g, rng, W, H, margen) {
    const n = g.n; const px = [], py = [];
    for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n; px[i] = 0.5 + 0.38 * Math.cos(a) + (rng.next() - .5) * .06; py[i] = 0.5 + 0.38 * Math.sin(a) + (rng.next() - .5) * .06; }
    const k = 0.9 * Math.sqrt(1 / Math.max(1, n)), pares = g.aristas.map(e => [e.a, e.b]);
    for (let it = 0; it < 260; it++) {
      const t = 0.09 * (1 - it / 260) + 0.004, dx = new Array(n).fill(0), dy = new Array(n).fill(0);
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        let ex = px[i] - px[j], ey = py[i] - py[j], d = Math.sqrt(ex * ex + ey * ey) || 0.001; const f = k * k / d;
        ex /= d; ey /= d; dx[i] += ex * f; dy[i] += ey * f; dx[j] -= ex * f; dy[j] -= ey * f;
      }
      pares.forEach(([a, b]) => {
        let ex = px[a] - px[b], ey = py[a] - py[b]; const d = Math.sqrt(ex * ex + ey * ey) || 0.001, f = d * d / k; ex /= d; ey /= d;
        dx[a] -= ex * f; dy[a] -= ey * f; dx[b] += ex * f; dy[b] += ey * f;
      });
      for (let i = 0; i < n; i++) {
        const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 0.001, m = Math.min(d, t);
        px[i] += dx[i] / d * m; py[i] += dy[i] / d * m;
      }
    }
    let x0 = Math.min(...px), x1 = Math.max(...px), y0 = Math.min(...py), y1 = Math.max(...py); const sx = (x1 - x0) || 1, sy = (y1 - y0) || 1;
    for (let i = 0; i < n; i++) { g.x[i] = Math.round(margen + (px[i] - x0) / sx * (W - 2 * margen)); g.y[i] = Math.round(margen + (py[i] - y0) / sy * (H - 2 * margen)); }
  }

  /* ===================================================================== grafos de las diapositivas ===================================================================== */
  /** S12-C1, diap. 5-13: A–G (BFS: A B C D E F G; DFS: A B E F C G D) */
  G.clase = function () {
    return G.crear(['A', 'B', 'C', 'D', 'E', 'F', 'G'], [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'E'], ['C', 'F'], ['C', 'G'], ['E', 'F'], ['F', 'G']],
      { x: [350, 215, 350, 485, 215, 350, 485], y: [50, 145, 145, 145, 250, 250, 250], ini: 0, titulo: 'El grafo de la clase (S12-C1)' });
  };
  /** S12-C2, diap. 16-37: de S a X con heurística h para A* */
  G.s12 = function () {
    const nom = ['S', 'A', 'G', 'B', 'C', 'I', 'F', 'D', 'X', 'E'];   // orden de las claves del diccionario (desempata igual que la clase)
    const pos = { S: [55, 115], A: [290, 40], G: [545, 40], B: [290, 120], C: [215, 195], I: [545, 160], F: [400, 240], D: [95, 255], X: [620, 255], E: [300, 292] };
    const h = { S: 5, A: 8, G: 9, B: 4, C: 3, I: 2, F: 5, D: 2, X: 0, E: 1 };
    return G.crear(nom, [['S', 'A', 5], ['S', 'B', 9], ['S', 'C', 6], ['S', 'D', 6], ['A', 'G', 9], ['A', 'B', 3], ['B', 'C', 1], ['B', 'I', 7], ['C', 'I', 5], ['C', 'F', 7], ['C', 'D', 2], ['D', 'F', 2], ['D', 'E', 2], ['F', 'I', 8], ['E', 'X', 3], ['I', 'X', 3]],
      { ponderado: true, x: nom.map(s => pos[s][0]), y: nom.map(s => pos[s][1]), h: nom.map(s => h[s]), ini: 0, fin: 8, titulo: 'El grafo de la clase 2: de S a X (S12-C2)' });
  };
  /** S12-C2, diap. 7-15: el trueque de Rafael (dirigido) */
  G.trueque = function () {
    const nom = ['Audífonos', 'Tarjeta', 'Stickers', 'Reloj', 'Tableta', 'PC Gamer'];
    return G.crear(nom, [['Audífonos', 'Tarjeta', 5], ['Audífonos', 'Stickers', 0], ['Tarjeta', 'Reloj', 15], ['Tarjeta', 'Tableta', 20], ['Stickers', 'Reloj', 30], ['Stickers', 'Tableta', 35], ['Reloj', 'PC Gamer', 20], ['Tableta', 'PC Gamer', 10]],
      { dirigido: true, ponderado: true, etq: ['Aud', 'Tar', 'Sti', 'Rel', 'Tab', 'PC'], nomLargo: nom, x: [55, 235, 235, 440, 440, 640], y: [160, 75, 245, 75, 245, 160], ini: 0, fin: 5, titulo: 'El trueque de Rafael (S12-C2)' });
  };
  /** diap. 41: con una arista negativa, Dijkstra se equivoca (Bellman-Ford no) */
  G.negativo = function () {
    return G.crear(['S', 'A', 'B', 'C'], [['S', 'A', 2], ['S', 'B', 3], ['B', 'A', -4], ['A', 'C', 1]],
      { dirigido: true, ponderado: true, x: [70, 280, 280, 560], y: [160, 60, 260, 160], ini: 0, fin: 3, titulo: 'Con una arista negativa Dijkstra falla' });
  };

  /* ===================================================================== generadores ===================================================================== */
  /** grafo aleatorio conexo de n nodos con grado medio ≈ `grado` */
  G.aleatorio = function (n, grado, seed, o) {
    o = o || {}; n = U.clamp(n | 0, 2, 26); const rng = new U.RNG(seed), nom = letras(n), claves = new Set(), lista = [];
    const add = (a, b) => { if (a === b) return false; const k = a < b ? a + ',' + b : b + ',' + a; if (claves.has(k)) return false; claves.add(k); lista.push([a, b]); return true; };
    for (let i = 1; i < n; i++) add(rng.int(0, i - 1), i);   // un árbol al azar garantiza que sea conexo
    const meta = Math.min(n * (n - 1) / 2, Math.max(n - 1, Math.round(n * grado / 2)));
    for (let t = 0; t < 800 && lista.length < meta; t++) add(rng.int(0, n - 1), rng.int(0, n - 1));
    const g = G.crear(nom, lista.map(([a, b]) => [a, b, o.pond ? rng.int(1, 9) : 1]), { ponderado: !!o.pond, W: 700, H: 330, seed, titulo: 'Grafo aleatorio' });
    resortes(g, rng, g.W, g.H, 36); g.ini = 0; g.fin = n - 1;
    return g;
  };
  /** árbol aleatorio con n nodos y a lo sumo `ramas` hijos por nodo (nombres A, B, C… por niveles) */
  G.arbol = function (n, ramas, seed) {
    n = U.clamp(n | 0, 2, 31); ramas = U.clamp(ramas | 0, 2, 4); const rng = new U.RNG(seed), nom = letras(n), hijos = nom.map(() => []), prof = [0], aristas = [];
    for (let i = 1; i < n; i++) {
      const cand = []; for (let j = 0; j < i; j++) if (hijos[j].length < ramas) cand.push(j);
      const minP = Math.min(...cand.map(j => prof[j])), cerca = cand.filter(j => prof[j] <= minP + 1);   // se prefieren los niveles de arriba: árboles anchos y legibles
      const p = rng.pick(cerca); hijos[p].push(i); prof[i] = prof[p] + 1; aristas.push([p, i]);
    }
    const W = 700, H = 320, maxP = Math.max(...prof), xs = [], ys = []; let hoja = 0;
    const pos = u => { if (!hijos[u].length) { xs[u] = hoja++; } else { hijos[u].forEach(pos); xs[u] = (xs[hijos[u][0]] + xs[hijos[u][hijos[u].length - 1]]) / 2; } ys[u] = prof[u]; };
    pos(0);
    const g = G.crear(nom, aristas, { tipo: 'arbol', W, H, seed, titulo: 'Árbol de ' + n + ' nodos' });
    for (let i = 0; i < n; i++) { g.x[i] = Math.round(34 + (hoja > 1 ? xs[i] / (hoja - 1) : .5) * (W - 68)); g.y[i] = Math.round(36 + (maxP ? ys[i] / maxP : .5) * (H - 72)); }
    g.ini = 0; g.hijos = hijos; g.prof = prof; return g;
  };
  const NOMBRES = ['Ana', 'Beto', 'Carla', 'Diego', 'Elena', 'Felipe', 'Gabriela', 'Hugo', 'Isabel', 'Juan', 'Karen', 'Luis', 'María', 'Nicolás', 'Olga', 'Pablo', 'Quique', 'Rosa', 'Sara', 'Tomás', 'Ulises', 'Valeria', 'Wilson', 'Ximena', 'Yuli', 'Zoe'];
  /** red social: n personas y amistades (grado medio ≈ `amigos`); BFS = grados de separación */
  G.red = function (n, amigos, seed) {
    n = U.clamp(n | 0, 4, 26); const g = G.aleatorio(n, amigos, seed, {});
    g.nomLargo = NOMBRES.slice(0, n); g.etq = letras(26).slice(0, n); g.titulo = 'Red social de ' + n + ' personas'; g.tipo = 'red';
    g.nom = NOMBRES.slice(0, n); return g;
  };
  /** mapa de ciudades de Colombia (ponderado; las distancias son aproximadas y solo sirven para practicar) */
  G.ciudades = function () {
    const C = [['Bucaramanga', 'BGA', -73.12, 7.12], ['Barrancabermeja', 'BCJ', -73.85, 7.07], ['Cúcuta', 'CUC', -72.51, 7.89], ['Pamplona', 'PAM', -72.65, 7.38], ['Tunja', 'TUN', -73.37, 5.53], ['Bogotá', 'BOG', -74.07, 4.71],
      ['Villavicencio', 'VIV', -73.63, 4.15], ['Ibagué', 'IBA', -75.23, 4.44], ['Neiva', 'NEI', -75.28, 2.93], ['Cali', 'CLO', -76.53, 3.45], ['Manizales', 'MZL', -75.52, 5.07], ['Medellín', 'MDE', -75.57, 6.25],
      ['Cartagena', 'CTG', -75.51, 10.39], ['Barranquilla', 'BAQ', -74.78, 10.96], ['Santa Marta', 'SMR', -74.20, 11.24], ['Valledupar', 'VUP', -73.25, 10.47]];
    const nom = C.map(c => c[0]), rad = Math.PI / 180;
    const km = (a, b) => { const dl = (C[b][3] - C[a][3]) * rad, dn = (C[b][2] - C[a][2]) * rad, la = C[a][3] * rad, lb = C[b][3] * rad; const s = Math.sin(dl / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(s)); };
    const E = [['Bucaramanga', 'Barrancabermeja'], ['Bucaramanga', 'Pamplona'], ['Pamplona', 'Cúcuta'], ['Bucaramanga', 'Tunja'], ['Bucaramanga', 'Valledupar'], ['Tunja', 'Bogotá'], ['Bogotá', 'Villavicencio'], ['Bogotá', 'Ibagué'],
      ['Bogotá', 'Neiva'], ['Ibagué', 'Neiva'], ['Ibagué', 'Manizales'], ['Ibagué', 'Cali'], ['Manizales', 'Cali'], ['Manizales', 'Medellín'], ['Medellín', 'Barrancabermeja'], ['Medellín', 'Cartagena'], ['Cartagena', 'Barranquilla'],
      ['Barranquilla', 'Santa Marta'], ['Santa Marta', 'Valledupar'], ['Barranquilla', 'Valledupar'], ['Barrancabermeja', 'Tunja']];
    const idx = new Map(nom.map((s, i) => [s, i]));
    const ar = E.map(([a, b], i) => { const d = km(idx.get(a), idx.get(b)); return [a, b, Math.round(d * (1.18 + ((i * 37) % 11) / 55))]; });   // por carretera ≥ en línea recta
    // posiciones: longitud y latitud a un lienzo de 700 × 360
    const lon = C.map(c => c[2]), lat = C.map(c => c[3]); const x0 = Math.min(...lon), x1 = Math.max(...lon), y0 = Math.min(...lat), y1 = Math.max(...lat);
    const g = G.crear(nom, ar, { ponderado: true, etq: C.map(c => c[1]), nomLargo: nom, W: 700, H: 370, tipo: 'ciudades', titulo: 'Mapa de ciudades (distancias aproximadas)' });
    for (let i = 0; i < g.n; i++) { g.x[i] = Math.round(52 + (lon[i] - x0) / (x1 - x0) * 596); g.y[i] = Math.round(34 + (y1 - lat[i]) / (y1 - y0) * 290); }
    g.rectaKm = (a, b) => km(a, b);   // línea recta: heurística admisible (≤ distancia por carretera)
    g.ini = idx.get('Bucaramanga'); g.fin = idx.get('Cali'); return g;
  };

  /* ---------- rejillas (laberintos e islas) ---------- */
  const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];   // arriba, derecha, abajo, izquierda
  const DIRS8 = DIRS.concat([[-1, 1], [1, 1], [1, -1], [-1, -1]]);
  function adyRejilla(g, ocho) {
    const R = g.filas, C = g.cols, ds = ocho ? DIRS8 : DIRS; g.ady = new Array(R * C);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const l = [], i = r * C + c;
      if (!g.muro[i]) ds.forEach(([dr, dc]) => { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < R && cc >= 0 && cc < C && !g.muro[rr * C + cc]) l.push({ v: rr * C + cc, w: 1 }); });
      g.ady[i] = l;
    }
  }
  function rejilla(R, C, muro, o) {
    const g = { n: R * C, tipo: 'rejilla', filas: R, cols: C, muro, dirigido: false, ponderado: false, aristas: [], nom: [], etq: [], nomLargo: [], x: [], y: [], h: null, W: 0, H: 0, ini: -1, fin: -1, seed: (o && o.seed) || 1, titulo: (o && o.titulo) || '', ocho: !!(o && o.ocho) };
    for (let i = 0; i < g.n; i++) { const r = Math.floor(i / C), c = i % C; g.nom.push('(' + r + ',' + c + ')'); }
    adyRejilla(g, g.ocho); return g;
  }
  G.nombreCelda = (g, i) => '(' + Math.floor(i / g.cols) + ', ' + (i % g.cols) + ')';
  /** laberinto en bloques (filas y columnas impares): paredes = 1, pasillos = 0; `bucles` (0-100) abre paredes extra para que haya varios caminos */
  G.laberinto = function (filas, cols, seed, bucles) {
    const R = U.clamp(filas | 0, 5, 61) | 1, C = U.clamp(cols | 0, 5, 81) | 1, rng = new U.RNG(seed), muro = new Uint8Array(R * C).fill(1);
    const vis = new Uint8Array(R * C), pila = [[1, 1]], eventos = [{ t: 'ini', room: 1 * C + 1 }], extra = []; muro[1 * C + 1] = 0; vis[1 * C + 1] = 1;
    while (pila.length) {
      const [r, c] = pila[pila.length - 1], vs = [];
      DIRS.forEach(([dr, dc]) => { const rr = r + 2 * dr, cc = c + 2 * dc; if (rr > 0 && rr < R - 1 && cc > 0 && cc < C - 1 && !vis[rr * C + cc]) vs.push([rr, cc, dr, dc]); });
      if (!vs.length) { pila.pop(); eventos.push({ t: 'volver' }); continue; }
      const [rr, cc, dr, dc] = rng.pick(vs); muro[(r + dr) * C + (c + dc)] = 0; muro[rr * C + cc] = 0; vis[rr * C + cc] = 1; pila.push([rr, cc]); eventos.push({ t: 'tallar', conn: (r + dr) * C + (c + dc), room: rr * C + cc });
    }
    const p = U.clamp(+bucles || 0, 0, 100) / 100;
    if (p > 0) for (let r = 1; r < R - 1; r++) for (let c = 1; c < C - 1; c++) {
      if (!muro[r * C + c]) continue;
      const horiz = (r % 2 === 1 && c % 2 === 0 && !muro[r * C + c - 1] && !muro[r * C + c + 1]), vert = (r % 2 === 0 && c % 2 === 1 && !muro[(r - 1) * C + c] && !muro[(r + 1) * C + c]);
      if ((horiz || vert) && rng.next() < p * 0.35) { muro[r * C + c] = 0; extra.push(r * C + c); }
    }
    const g = rejilla(R, C, muro, { seed, titulo: 'Laberinto de ' + R + ' × ' + C });
    g.ini = 1 * C + 1; g.fin = (R - 2) * C + (C - 2); g.eventos = eventos; g.extra = extra; return g;
  };
  /** cuadrícula de tierra (m = 1) y agua (m = 0) con islas de formas naturales; `pct` = % de tierra aproximado */
  G.islas = function (filas, cols, seed, pct, ocho) {
    const R = U.clamp(filas | 0, 3, 30), C = U.clamp(cols | 0, 3, 44), rng = new U.RNG(seed); let m = new Uint8Array(R * C);
    for (let i = 0; i < m.length; i++) m[i] = rng.next() < U.clamp(+pct || 40, 5, 90) / 100 ? 1 : 0;
    for (let pasada = 0; pasada < 2; pasada++) {   // suavizado: la tierra se agrupa en islas
      const n2 = new Uint8Array(m.length);
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        let s = 0, t = 0; for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < R && cc >= 0 && cc < C) { t++; s += m[rr * C + cc]; } }
        n2[r * C + c] = s * 2 > t ? 1 : (s * 2 < t ? 0 : m[r * C + c]);
      }
      m = n2;
    }
    const muro = new Uint8Array(R * C); for (let i = 0; i < m.length; i++) muro[i] = m[i] ? 0 : 1;   // muro = agua
    const g = rejilla(R, C, muro, { seed, ocho, titulo: 'Cuadrícula de ' + R + ' × ' + C }); g.tierra = m; return g;
  };
  /** red de calles de una ciudad: manzanas de tamaño desigual, avenidas rectas, calles algo curvas y alguna diagonal (nunca se cruzan dos diagonales);
      ≈ n intersecciones; el peso de cada calle es su longitud (así la distancia en línea recta es una heurística admisible) */
  G.calles = function (n, seed) {
    const rng = new U.RNG(seed), W = 900, Hh = 520; n = U.clamp(n | 0, 40, 1600);
    const cols = Math.max(5, Math.round(Math.sqrt(n * W / Hh))), filas = Math.max(4, Math.round(n / cols)), N = filas * cols;
    const acum = (k, T) => { const a = Array.from({ length: k + 1 }, () => .65 + rng.next() * .7), s = a.reduce((p, q) => p + q, 0), o = []; let c = 0; for (let i = 0; i < k; i++) { c += a[i]; o.push(c / s * T); } return o; };
    const xs = acum(cols, W).map(v => W * .06 + v * .88), ys = acum(filas, Hh).map(v => Hh * .07 + v * .86), jx = W / (cols + 1) * .16, jy = Hh / (filas + 1) * .16, x = [], y = [];
    for (let r = 0; r < filas; r++) for (let c = 0; c < cols; c++) { x.push(Math.round(xs[c] + (rng.next() - .5) * 2 * jx)); y.push(Math.round(ys[r] + (rng.next() - .5) * 2 * jy)); }
    const claves = new Set(), cand = [], arts = [], padre = Array.from({ length: N }, (_, i) => i), raiz = a => { while (padre[a] !== a) { padre[a] = padre[padre[a]]; a = padre[a]; } return a; };
    const add = (a, b, art) => { const k = a < b ? a + ',' + b : b + ',' + a; if (claves.has(k)) return false; claves.add(k); cand.push([a, b]); arts.push(!!art); padre[raiz(a)] = raiz(b); return true; };
    const todas = [];
    for (let r = 0; r < filas; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (c + 1 < cols) todas.push([i, i + 1, r % 4 === 1, r % 4 === 1 ? .99 : .86]);
      if (r + 1 < filas) todas.push([i, i + cols, c % 5 === 2, c % 5 === 2 ? .99 : .86]);
      if (c + 1 < cols && r + 1 < filas && rng.next() < .17) { if (rng.next() < .5) todas.push([i, i + cols + 1, false, 1]); else todas.push([i + 1, i + cols, false, 1]); }   // una sola diagonal por manzana
    }
    todas.forEach(([a, b, art, p]) => { if (rng.next() < p) add(a, b, art); });
    rng.shuffle(todas).forEach(([a, b, art]) => { if (raiz(a) !== raiz(b)) add(a, b, art); });   // une las partes sueltas
    const dist = (a, b) => Math.max(1, Math.round(Math.hypot(x[a] - x[b], y[a] - y[b])));
    const g = G.crear(Array.from({ length: N }, (_, i) => String(i)), cand.map(([a, b]) => [a, b, dist(a, b)]), { ponderado: true, tipo: 'mapa', W, H: Hh, seed, titulo: 'Mapa de calles de ' + N + ' intersecciones' });
    g.aristas.forEach((e, i) => { e.art = arts[i]; e.cv = arts[i] ? 0 : Math.round((rng.next() - .5) * e.w * .26 * 10) / 10; });   // las avenidas son rectas; las demás calles se curvan un poco
    g.x = x; g.y = y; g.filas = filas; g.cols = cols;
    g.ini = Math.min(N - 1, 1 * cols + 1); g.fin = Math.max(0, (filas - 2) * cols + (cols - 2)); return g;
  };
  /** heurística de A*: distancia en línea recta (mapas), Manhattan (cuadrículas de 4 direcciones) o 0; `k` multiplica h (k > 1 la hace NO admisible) */
  G.heur = function (g, t, tipo, k) {
    k = k === undefined ? 1 : +k; const h = new Array(g.n).fill(0); if (t < 0 || tipo === 'cero' || !k) return h;
    for (let i = 0; i < g.n; i++) {
      if (g.tipo === 'rejilla') { const dr = Math.abs(Math.floor(i / g.cols) - Math.floor(t / g.cols)), dc = Math.abs(i % g.cols - t % g.cols); h[i] = k * (g.ocho ? Math.max(dr, dc) : dr + dc); }
      else if (g.tipo === 'ciudades' && g.rectaKm) h[i] = k * g.rectaKm(i, t);
      else if (g.tipo === 'mapa') h[i] = k * Math.hypot(g.x[i] - g.x[t], g.y[i] - g.y[t]);
      else if (g.h && t === g.fin) h[i] = k * g.h[i];   // la heurística de la diapositiva vale para su destino (X)
    }
    return h;
  };

  /* ===================================================================== estado en el paso k ===================================================================== */
  G.estadoVacio = function (g) {
    return { est: new Uint8Array(g.n), ord: new Int32Array(g.n), dist: new Float64Array(g.n).fill(Infinity), prev: new Int32Array(g.n).fill(-1), f: new Float64Array(g.n).fill(Infinity), u: -1, v: -1, hi: [], ar: [], ds: [], ds2: null,
      k: -1, exp: 0, nOrd: 0, camino: [], extra: null, msg: '', lin: [], islas: 0, mat: null };
  };
  function aplicar(st, p) {
    if (p.ch) for (let i = 0; i < p.ch.length; i++) st.est[p.ch[i][0]] = p.ch[i][1];
    if (p.d) for (let i = 0; i < p.d.length; i++) { const e = p.d[i]; st.dist[e[0]] = e[1]; if (e[2] !== undefined) st.prev[e[0]] = e[2]; }
    if (p.hf) for (let i = 0; i < p.hf.length; i++) st.f[p.hf[i][0]] = p.hf[i][1];
    if (p.pv) for (let i = 0; i < p.pv.length; i++) st.prev[p.pv[i][0]] = p.pv[i][1];
    if (p.vis !== undefined) st.ord[p.vis] = ++st.nOrd;
    st.u = p.u === undefined ? -1 : p.u; st.v = p.v === undefined ? -1 : p.v; st.hi = p.hi || []; st.ar = p.ar || [];
    if (p.ds) st.ds = p.ds; st.ds2 = p.ds2 || null; st.exp = p.exp === undefined ? st.exp : p.exp;
    if (p.camino) st.camino = p.camino; if (p.mat) st.mat = p.mat; if (p.extra !== undefined) st.extra = p.extra; if (p.islas !== undefined) st.islas = p.islas;
    st.msg = p.msg || ''; st.lin = p.lin || [];
  }
  /** estado visual después del paso k de la traza T (se recalcula desde cero solo si se retrocede) */
  G.estadoEn = function (T, k) {
    k = Math.max(0, Math.min(T.pasos.length - 1, k));
    let st = T._st; if (!st || k < st.k) st = T._st = G.estadoVacio(T.g);
    for (let i = st.k + 1; i <= k; i++) aplicar(st, T.pasos[i]);
    st.k = k; return st;
  };

  /* ===================================================================== dibujo SVG de un grafo ===================================================================== */
  const CLS = ['', 'g-cola', 'act', 'ok', 'ruta', 'g-cola2', 'g-hecho2'];
  /** elementos para el motor de escenas. o: {badge(i)→texto, nombres, pesos, foco} */
  G.cuadro = function (g, st, o) {
    const Dib = ET.Dib; o = o || {}; st = st || G.estadoVacio(g);
    const r = g.n <= 12 ? 19 : (g.n <= 20 ? 16 : 13), items = [], pesos = o.pesos !== undefined ? o.pesos : g.ponderado;
    const enCamino = new Set(); for (let i = 0; i + 1 < st.camino.length; i++) { enCamino.add(st.camino[i] + '>' + st.camino[i + 1]); if (!g.dirigido) enCamino.add(st.camino[i + 1] + '>' + st.camino[i]); }
    const enAr = new Set(); st.ar.forEach(([a, b]) => { enAr.add(a + '>' + b); if (!g.dirigido) enAr.add(b + '>' + a); });
    g.aristas.forEach((e, i) => {
      const x1 = g.x[e.a], y1 = g.y[e.a], x2 = g.x[e.b], y2 = g.y[e.b], k = e.a + '>' + e.b;
      let cls = ''; const arbol = st.est[e.a] !== E.LIBRE && st.est[e.b] !== E.LIBRE && (st.prev[e.b] === e.a || (!g.dirigido && st.prev[e.a] === e.b));
      if (enCamino.has(k)) cls = 'ok'; else if (enAr.has(k)) cls = 'act'; else if (arbol) cls = 'g-arb';
      if (g.dirigido) {
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, a = r + 3, b = r + 7;
        items.push(Dib.fl('e' + i, x1 + dx / L * a, y1 + dy / L * a, x2 - dx / L * b, y2 - dy / L * b, cls));
      } else items.push(Dib.lin('e' + i, x1, y1, x2, y2, cls));
      if (pesos) {
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 11, ny = dx / L * 11;
        items.push(Dib.etq('w' + i, (x1 + x2) / 2 + nx * (dx < 0 || (dx === 0 && dy < 0) ? -1 : 1), (y1 + y2) / 2 + ny * (dx < 0 || (dx === 0 && dy < 0) ? -1 : 1), String(e.w), 'g-peso' + (e.w < 0 ? ' mal' : '') + (cls ? ' ' + cls : '')));
      }
    });
    for (let i = 0; i < g.n; i++) {
      let cls = CLS[st.est[i]] || ''; if (st.est[i] >= E.ISLA0) cls = 'g-isla' + ((st.est[i] - E.ISLA0) % 6);
      if (g.ini === i) cls += ' g-ini'; if (g.fin === i) cls += ' g-fin'; if (st.v === i) cls += ' sel';
      items.push(Dib.circ('n' + i, g.x[i], g.y[i], r, g.etq[i], cls.trim(), o.nombres ? g.nomLargo[i] : '', { anillo: st.u === i || st.hi.indexOf(i) >= 0 }));
      const b = o.badge ? o.badge(i, st) : (st.ord[i] ? String(st.ord[i]) : '');
      if (b !== '' && b !== undefined && b !== null) { const w = Math.max(18, 9 + String(b).length * 7); items.push(Dib.caja('o' + i, g.x[i] + r * .55, g.y[i] - r - 14, w, 16, String(b), 'g-badge' + (o.badgeCls ? ' ' + o.badgeCls(i, st) : ''))); }
    }
    return { items, W: g.W, H: g.H };
  };
  /** figura estática de un grafo (preguntas del banco): est = {nodo: estado}, orden = {nodo: número} */
  G.figura = function (g, o) {
    o = o || {}; const st = G.estadoVacio(g);
    if (o.est) Object.keys(o.est).forEach(k => { st.est[+k] = o.est[k]; });
    if (o.orden) Object.keys(o.orden).forEach(k => { st.ord[+k] = o.orden[k]; });
    if (o.camino) st.camino = o.camino;
    return G.cuadro(g, st, o);
  };

  /** el grafo como diccionario de Python (lista de adyacencia): el mismo que usa el código */
  G.aPython = function (g, ponderado) {
    const nom = i => "'" + g.nom[i].replace(/'/g, "\\'") + "'";
    return '{' + g.nom.map((_, u) => nom(u) + ': ' + (ponderado ? '{' + g.ady[u].map(e => nom(e.v) + ': ' + e.w).join(', ') + '}' : '[' + g.ady[u].map(e => nom(e.v)).join(', ') + ']')).join(', ') + '}';
  };
})(typeof window !== 'undefined' ? window : globalThis);
