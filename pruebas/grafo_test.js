/* grafo_test.js — prueba los grafos y sus algoritmos (js/sim_grafo.js y js/sim_grafo_alg.js):
   (1) los listados de código Python se EJECUTAN con el intérprete del entrenador y su resultado coincide con la traza de la animación;
   (2) BFS, DFS, Dijkstra, A*, Bellman-Ford, Floyd-Warshall, bidireccional e islas se comparan con implementaciones independientes sobre cientos de grafos al azar;
   (3) las cifras de las diapositivas (S12-C1 y S12-C2): órdenes, costos, nodos expandidos por A*, el trueque, el peso negativo;
   (4) el reproductor de estados (ir y volver) y el dibujo SVG. Se puede usar `pruebaGrafo()` desde la consola. */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { if (out) out.textContent += s + '\n'; };

  async function pruebaGrafo() {
    const ET = window.ET, G = ET.Sim.grafo, Py = ET.Py, fallos = []; let n = 0;
    const ok = (cond, msg) => { n++; if (!cond) { fallos.push(msg); } };
    const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    const nombres = (g, a) => a.map(i => g.nom[i]);
    try {
      /* ---------- referencias independientes ---------- */
      const lista = (g, u, orden) => { const l = g.ady[u].map(e => e.v); return orden === 'desc' ? l.slice().reverse() : l; };
      const refBFS = (g, s, orden) => { const vis = new Set([s]), q = [s], o = [], d = { [s]: 0 }; while (q.length) { const u = q.shift(); o.push(u); lista(g, u, orden).forEach(v => { if (!vis.has(v)) { vis.add(v); d[v] = d[u] + 1; q.push(v); } }); } return { orden: o, dist: d }; };
      const refDFS = (g, s, orden) => { const vis = new Set(), o = []; const f = u => { vis.add(u); o.push(u); lista(g, u, orden).forEach(v => { if (!vis.has(v)) f(v); }); }; f(s); return o; };
      const refDFSIter = (g, s, inv) => { const vis = new Set(), pila = [s], o = []; while (pila.length) { const u = pila.pop(); if (vis.has(u)) continue; vis.add(u); o.push(u); const l = lista(g, u); (inv ? l.slice().reverse() : l).forEach(v => { if (!vis.has(v)) pila.push(v); }); } return o; };
      const alcanzable = (g, s, t) => refBFS(g, s).dist[t] !== undefined;
      const refIslas = (g, ocho) => {
        const R = g.filas, C = g.cols, vis = new Uint8Array(R * C); let k = 0;
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
          if (!g.tierra[r * C + c] || vis[r * C + c]) continue; k++; const p = [[r, c]]; vis[r * C + c] = 1;
          while (p.length) { const [a, b] = p.pop(); for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) { if ((da === 0 && db === 0) || (!ocho && da !== 0 && db !== 0)) continue; const x = a + da, y = b + db; if (x >= 0 && x < R && y >= 0 && y < C && g.tierra[x * C + y] && !vis[x * C + y]) { vis[x * C + y] = 1; p.push([x, y]); } } }
        }
        return k;
      };

      /* ---------- las cifras de las diapositivas ---------- */
      const gc = G.clase(), bc = G.bfs(gc, 0, -1), dc = G.dfsRec(gc, 0, -1);
      ok(igual(nombres(gc, bc.res.orden), ['A', 'B', 'C', 'D', 'E', 'F', 'G']), 'S12-C1 diap. 13: orden BFS desde A = A B C D E F G');
      ok(igual(nombres(gc, dc.res.orden), ['A', 'B', 'E', 'F', 'C', 'G', 'D']), 'S12-C1 diap. 24: orden DFS desde A = A B E F C G D');
      ok(igual(bc.res.nivel, [0, 1, 1, 1, 2, 2, 2]), 'S12-C1 diap. 5: niveles 0, 1 (B, C, D) y 2 (E, F, G)');
      ok(igual(nombres(gc, G.dfsIter(gc, 0, -1, { inverso: true }).res.orden), ['A', 'B', 'E', 'F', 'C', 'G', 'D']), 'DFS iterativo con la pila al revés = orden del recursivo');
      ok(igual(G.dfsIter(gc, 0, -1).res.orden, refDFSIter(gc, 0, false)), 'DFS iterativo (como en la diapositiva 16) = referencia');
      ok(igual(nombres(gc, G.dfsIter(gc, 0, -1).res.orden), ['A', 'D', 'C', 'G', 'F', 'E', 'B']), 'DFS iterativo sin invertir visita primero al último vecino (A D C G F E B)');
      const idc = x => gc.nom.indexOf(x), bcg = G.bfs(gc, idc('A'), idc('G'));
      ok(igual(nombres(gc, bcg.res.camino), ['A', 'C', 'G']) && bcg.res.longitud === 2, 'camino más corto A → G con BFS: A C G (2 aristas)');

      const gs = G.s12(), di = x => gs.nom.indexOf(x), dj = G.dijkstra(gs, di('S'), di('X'));
      ok(igual(nombres(gs, dj.res.cerrados), ['S', 'A', 'C', 'D', 'B', 'F', 'E', 'I', 'X']), 'S12-C2 diap. 18: Dijkstra cierra S A C D B F E I X');
      ok(dj.res.costos[di('X')] === 11 && igual(nombres(gs, dj.res.camino), ['S', 'D', 'E', 'X']), 'S12-C2 diap. 18: distancia mínima S → X = 11 por S D E X');
      const as = G.correr('astar', gs, di('S'), di('X'));
      ok(igual(nombres(gs, as.res.cerrados), ['S', 'D', 'C', 'E', 'B', 'X']) && as.res.exp === 6, 'S12-C2 diap. 31: A* expande S D C E B X (6 nodos) y no toca A, G, F, I');
      ok(as.res.costos[di('X')] === 11 && igual(nombres(gs, as.res.camino), ['S', 'D', 'E', 'X']), 'A* halla el mismo óptimo (11, S D E X)');
      ok(dj.res.exp === 9 && as.res.exp < dj.res.exp, 'A* expande menos nodos que Dijkstra (6 frente a 9)');
      const gt = G.trueque(), dt = G.dijkstra(gt, 0, 5);
      ok(dt.res.costos[5] === 35 && igual(nombres(gt, dt.res.camino), ['Audífonos', 'Tarjeta', 'Tableta', 'PC Gamer']), 'S12-C2 diap. 13-14: trueque, costo 35 por Audífonos → Tarjeta → Tableta → PC Gamer');
      ok(igual(Array.from(dt.res.costos), [0, 5, 0, 20, 25, 35]), 'S12-C2 diap. 13: tabla final de costos (Tarjeta 5, Stickers 0, Reloj 20, Tableta 25, PC Gamer 35)');
      const gn = G.negativo(), dn = G.dijkstra(gn, 0, -1), bn = G.bellman(gn, 0, -1);
      ok(dn.res.costos[3] === 3 && bn.res.costos[3] === 0, 'S12-C2 diap. 41: con una arista negativa Dijkstra da C = 3 (mal) y Bellman-Ford C = 0 (bien)');
      const gcn = G.crear(['S', 'A', 'B'], [['S', 'A', 1], ['A', 'B', -2], ['B', 'A', -2]], { dirigido: true, ponderado: true });
      ok(G.bellman(gcn, 0, -1).res.cicloNegativo === true && G.bellman(gn, 0, -1).res.cicloNegativo === false, 'Bellman-Ford detecta el ciclo negativo (y no lo inventa)');

      /* ---------- los listados de código se ejecutan y coinciden con la animación ---------- */
      const run = codigo => Py.salida(codigo, { maxSteps: 3000000 });
      const grafoPy = (g, pond) => 'grafo = ' + G.aPython(g, pond) + '\n';
      const sinPrev = (g, t) => nombres(g, t);
      let py = run(grafoPy(gc) + G.CODIGO.bfs.join('\n') + "\norden, prev = bfs(grafo, 'A')\nprint(' '.join(orden))");
      ok(py === 'A B C D E F G', 'el código de BFS de la clase imprime A B C D E F G: ' + py);
      py = run(grafoPy(gc) + G.CODIGO.bfs.join('\n') + "\norden, prev = bfs(grafo, 'A', 'G')\nprint(' '.join(orden))\nprint(prev['G'], prev['C'])");
      ok(py === 'A B C D E F G\nC A' || py === 'A B C D E F\nC A' || py.split('\n')[1] === 'C A', 'BFS con destino: prev[G] = C y prev[C] = A: ' + py);
      py = run(grafoPy(gc) + G.CODIGO.dfsRec.join('\n') + "\nvis, orden, prev = set(), [], {'A': None}\ndfs_recursivo(grafo, 'A', vis, orden, prev)\nprint(' '.join(orden))");
      ok(py === 'A B E F C G D', 'el DFS recursivo del código imprime A B E F C G D: ' + py);
      py = run(grafoPy(gc) + G.CODIGO.dfsIter.join('\n') + "\norden, prev = dfs_iterativo(grafo, 'A')\nprint(' '.join(orden))");
      ok(py === 'A D C G F E B', 'el DFS iterativo del código imprime A D C G F E B: ' + py);
      py = run(grafoPy(gc) + G.CODIGO.dfsIterRev.join('\n') + "\norden, prev = dfs_iterativo(grafo, 'A')\nprint(' '.join(orden))");
      ok(py === 'A B E F C G D', 'el DFS iterativo con reversed(...) imprime A B E F C G D: ' + py);
      py = run(grafoPy(gs, true) + G.CODIGO.dijkstra.join('\n') + "\ncostos, padres = dijkstra(grafo, 'S')\nprint(costos['X'], costos['E'], costos['G'])");
      ok(py === '11 8 14', 'el código de Dijkstra da X = 11, E = 8, G = 14: ' + py);
      py = run(grafoPy(gs, true) + G.CODIGO.dijkstraHeap.join('\n') + "\ndist, padres = dijkstra_heap(grafo, 'S')\nprint(dist['X'], dist['E'], dist['G'])");
      ok(py === '11 8 14', 'el código de Dijkstra con heap da lo mismo: ' + py);
      py = run(grafoPy(gs, true) + 'h = ' + JSON.stringify(Object.fromEntries(gs.nom.map((s, i) => [s, gs.h[i]]))) + '\n' + G.CODIGO.astar.join('\n') + "\ncosto, padres = a_estrella(grafo, 'S', 'X', h)\nprint(costo, padres['X'], padres['E'], padres['D'])");
      ok(py === '11 E D S', 'el código de A* da costo 11 con padres E, D, S: ' + py);
      py = run(grafoPy(gt, true) + G.CODIGO.dijkstra.join('\n') + "\ncostos, padres = dijkstra(grafo, 'Audífonos')\nprint(costos['PC Gamer'], padres['PC Gamer'], padres['Tableta'])");
      ok(py === '35 Tableta Tarjeta', 'el código de Dijkstra en el trueque: 35, Tableta, Tarjeta: ' + py);
      const aristasPy = g => '[' + g.aristas.map(e => "('" + g.nom[e.a] + "', '" + g.nom[e.b] + "', " + e.w + ')').join(', ') + ']';
      py = run('nodos = ' + JSON.stringify(gn.nom) + '\naristas = ' + aristasPy(gn) + '\n' + G.CODIGO.bellman.join('\n') + "\ndist, padres = bellman_ford(nodos, aristas, 'S')\nprint(dist['C'], dist['A'])");
      ok(py === '0 -1', 'el código de Bellman-Ford da C = 0 y A = −1: ' + py);
      const peso = g => '{' + g.aristas.map(e => "('" + g.nom[e.a] + "', '" + g.nom[e.b] + "'): " + e.w).join(', ') + '}';
      py = run('nodos = ' + JSON.stringify(gt.nom) + '\npeso = ' + peso(gt) + '\n' + G.CODIGO.floyd.join('\n') + "\nd = floyd_warshall(nodos, peso)\nprint(d['Audífonos']['PC Gamer'], d['Stickers']['Reloj'], d['Reloj']['Tarjeta'])");
      ok(py === '35 30 inf', 'el código de Floyd-Warshall en el trueque: 35, 30, inf: ' + py);
      const fw = G.floyd(gt, 0, -1);
      ok(fw.res.matriz[0][5] === 35 && fw.res.matriz[2][3] === 30 && fw.res.matriz[3][1] === Infinity, 'la animación de Floyd-Warshall da la misma matriz');

      /* ---------- grafos al azar: BFS, DFS, orden de vecinos, destino ---------- */
      let casos = 0;
      const familias = [];
      for (let seed = 1; seed <= 40; seed++) {
        familias.push(G.aleatorio(4 + seed % 16, 1.6 + (seed % 5) * .6, seed));
        familias.push(G.arbol(3 + seed % 28, 2 + seed % 3, seed));
        familias.push(G.red(5 + seed % 20, 2.2 + (seed % 4) * .5, seed));
      }
      familias.forEach((g, i) => {
        const ordenes = ['asc', 'desc', 'azar'], orden = ordenes[i % 3], t = g.n - 1, det = i % 2 === 0;
        const r = refBFS(g, 0, orden === 'azar' ? 'asc' : orden);
        if (orden !== 'azar') {
          const tb = G.bfs(g, 0, -1, { orden, detalle: det });
          ok(igual(tb.res.orden, r.orden), 'BFS = referencia (' + g.titulo + ', ' + orden + ')');
          ok(g.nom.every((_, v) => tb.res.nivel[v] === r.dist[v]), 'los niveles de BFS = distancias en aristas (' + g.titulo + ')');
          ok(igual(G.dfsRec(g, 0, -1, { orden, detalle: det }).res.orden, refDFS(g, 0, orden)), 'DFS recursivo = referencia (' + g.titulo + ', ' + orden + ')');
          ok(igual(G.dfsIter(g, 0, -1, { orden, detalle: det }).res.orden, (() => { const gg = Object.assign({}, g, { ady: g.ady.map(l => orden === 'desc' ? l.slice().reverse() : l) }); return refDFSIter(gg, 0, false); })()), 'DFS iterativo = referencia (' + g.titulo + ', ' + orden + ')');
        }
        const tb = G.bfs(g, 0, t, { orden, detalle: det }), td = G.dfsRec(g, 0, t, { orden, detalle: det }), ti = G.dfsIter(g, 0, t, { orden, detalle: det });
        ok(tb.res.hallado && td.res.hallado && ti.res.hallado, 'con un grafo conexo los recorridos llegan al destino (' + g.titulo + ')');
        ok(tb.res.longitud === refBFS(g, 0, 'asc').dist[t], 'BFS halla un camino MÁS CORTO (' + g.titulo + ')');
        [td, ti].forEach(T => { const c = T.res.camino; ok(c.length > 0 && c[0] === 0 && c[c.length - 1] === t && c.every((v, k) => k === 0 || g.ady[c[k - 1]].some(e => e.v === v)), 'DFS devuelve un camino válido (' + g.titulo + ')'); });
        ok(td.res.longitud >= tb.res.longitud && ti.res.longitud >= tb.res.longitud, 'DFS nunca halla un camino más corto que BFS (' + g.titulo + ')');
        const bd = G.bidir(g, 0, t);
        ok(bd.res.longitud === tb.res.longitud, 'BFS bidireccional halla la misma longitud que BFS (' + g.titulo + ')');
        casos++;
      });

      /* ---------- Dijkstra, A*, Bellman-Ford, Floyd-Warshall contra la referencia ---------- */
      for (let seed = 1; seed <= 40; seed++) {
        const g = G.aleatorio(4 + seed % 14, 2 + (seed % 4) * .5, seed + 100, { pond: true }), s = 0, t = g.n - 1, ref = G.distMin(g, s).dist;
        const dl = G.dijkstra(g, s, -1, { detalle: seed % 2 === 0 }), dh = G.dijkstra(g, s, -1, { heap: true, detalle: seed % 2 === 1 }), bf = G.bellman(g, s, -1, { detalle: seed % 3 === 0 });
        ok(igual(Array.from(dl.res.costos), ref) && igual(Array.from(dh.res.costos), ref) && igual(Array.from(bf.res.costos), ref), 'Dijkstra, Dijkstra con heap y Bellman-Ford dan las mismas distancias (semilla ' + seed + ')');
        const dt = G.dijkstra(g, s, t), at = G.correr('astar', g, s, t, { h: new Array(g.n).fill(0) });
        ok(dt.res.costos[t] === ref[t] && G.pesoCamino(g, dt.res.camino) === ref[t], 'Dijkstra con destino: costo y camino óptimos (semilla ' + seed + ')');
        ok(at.res.costos[t] === ref[t], 'A* con h = 0 es Dijkstra (semilla ' + seed + ')');
        const fl = G.floyd(g, 0, -1); let todo = true;
        for (let i = 0; i < g.n; i++) { const rf = G.distMin(g, i).dist; for (let j = 0; j < g.n; j++) if (fl.res.matriz[i][j] !== rf[j]) todo = false; }
        ok(todo, 'Floyd-Warshall = Dijkstra desde cada nodo (semilla ' + seed + ')');
      }
      const mapas = [G.ciudades(), G.calles(120, 3), G.calles(300, 9), G.laberinto(15, 21, 5, 20)];
      mapas.forEach(g => {
        const s = g.ini, t = g.fin, ref = G.distMin(g, s).dist, a1 = G.correr('astar', g, s, t, { hpeso: 1 }), d1 = G.dijkstra(g, s, t);
        ok(a1.res.costos[t] === ref[t], 'A* con heurística admisible es óptimo (' + g.titulo + ')');
        ok(a1.res.exp <= d1.res.exp, 'A* no expande más nodos que Dijkstra (' + g.titulo + '): ' + a1.res.exp + ' ≤ ' + d1.res.exp);
        const a3 = G.correr('astar', g, s, t, { hpeso: 3 }); ok(a3.res.costos[t] >= ref[t], 'con h sobrestimada A* nunca baja del óptimo (' + g.titulo + ')');
      });
      const ciu = G.ciudades(); ok(ciu.aristas.every(e => e.w >= ciu.rectaKm(e.a, e.b)), 'en el mapa de ciudades cada carretera mide ≥ la línea recta (la heurística es admisible)');
      ok(ciu.aristas.every(e => e.w > 0), 'las distancias de las carreteras son positivas');

      /* ---------- laberintos, calles, islas ---------- */
      for (let seed = 1; seed <= 25; seed++) {
        const lab = G.laberinto(9 + seed % 20, 11 + seed % 30, seed, (seed % 4) * 10);
        ok(lab.filas % 2 === 1 && lab.cols % 2 === 1 && !lab.muro[lab.ini] && !lab.muro[lab.fin], 'el laberinto tiene tamaño impar y entrada y salida libres (semilla ' + seed + ')');
        ok(alcanzable(lab, lab.ini, lab.fin), 'del inicio se llega a la salida (semilla ' + seed + ')');
        const bl = G.bfs(lab, lab.ini, lab.fin, { orden: 'azar' }), dl = G.dfsRec(lab, lab.ini, lab.fin, { orden: 'azar' }), bi = G.bidir(lab, lab.ini, lab.fin);
        ok(bl.res.longitud === refBFS(lab, lab.ini).dist[lab.fin] && dl.res.longitud >= bl.res.longitud && bi.res.longitud === bl.res.longitud, 'laberinto: BFS más corto, DFS ≥ BFS, bidireccional = BFS (semilla ' + seed + ')');
        const cal = G.calles(60 + seed * 30, seed); ok(alcanzable(cal, 0, cal.n - 1) && cal.n >= 40, 'el mapa de calles es conexo (semilla ' + seed + ')');
        const isl8 = seed % 2 === 0, isl = G.islas(4 + seed % 20, 5 + seed % 30, seed, 25 + (seed % 5) * 10, isl8);
        const ref = refIslas(isl, isl8), ib = G.contarIslas(isl, -1, -1, { pila: false }), id = G.contarIslas(isl, -1, -1, { pila: true });
        ok(ib.res.islas === ref && id.res.islas === ref, 'contar islas con BFS y con DFS = referencia (' + ref + ', semilla ' + seed + ', ' + (isl8 ? '8' : '4') + ' vecinos)');
        ok(ib.res.tamanos.reduce((a, b) => a + b, 0) === isl.tierra.reduce((a, b) => a + b, 0), 'los tamaños de las islas suman toda la tierra (semilla ' + seed + ')');
      }
      let isl = G.islas(8, 10, 4, 40, false); const pyIslas = (g, alg) => { const m = []; for (let r = 0; r < g.filas; r++) { const f = []; for (let c = 0; c < g.cols; c++) f.push(g.tierra[r * g.cols + c]); m.push(f); } return 'm = ' + JSON.stringify(m) + '\n' + G.CODIGO[alg].join('\n') + '\nprint(contar_islas(m))'; };
      ok(run(pyIslas(isl, 'islasBfs')) === String(G.contarIslas(isl, -1, -1, {}).res.islas) && run(pyIslas(isl, 'islasDfs')) === String(G.contarIslas(isl, -1, -1, { pila: true }).res.islas), 'el código de contar islas (BFS y DFS) da el mismo número que la animación');

      /* ---------- construcción del laberinto con DFS: los eventos reproducen exactamente el laberinto y el código de Python hace laberintos perfectos ---------- */
      for (let seed = 1; seed <= 20; seed++) {
        const lab = G.laberinto(9 + seed % 14, 11 + seed % 20, seed * 977, (seed % 3) * 25), C = lab.cols, m = new Uint8Array(lab.filas * C).fill(1);
        lab.eventos.forEach(e => { if (e.t === 'ini') m[e.room] = 0; else if (e.t === 'tallar') { m[e.conn] = 0; m[e.room] = 0; } }); lab.extra.forEach(i => { m[i] = 0; });
        ok(m.every((v, i) => v === lab.muro[i]), 'los eventos de construcción reproducen el laberinto (semilla ' + seed + ')');
        const T = G.generar(lab, -1, -1, {}), ult = G.estadoEn(T, T.pasos.length - 1);
        ok(lab.muro.every((w, i) => w || ult.est[i]) && ult.est.every((e, i) => !lab.muro[i] || !e), 'al terminar la construcción todo pasillo está abierto y ninguna pared (semilla ' + seed + ')');
        ok(T.res.exp === ((lab.filas - 1) / 2) * ((lab.cols - 1) / 2), 'se tallan todas las habitaciones una vez (semilla ' + seed + ')');
      }
      const dist = new Set(); for (let i = 0; i < 12; i++) dist.add(Array.from(G.laberinto(15, 21, ET.U.newSeed(), 10).muro).join('')); ok(dist.size === 12, 'cada laberinto nuevo es distinto (12 de 12)');
      py = run(G.CODIGO.generar.join('\n') + '\nm = generar_laberinto(9, 13)\nprint(sum(1 for f in m for x in f if x == 0), 4 * 6 * 2 - 1)');
      ok(py.split(' ')[0] === py.split(' ')[1], 'el código de la construcción hace un laberinto perfecto (celdas abiertas = 2·habitaciones − 1): ' + py);

      /* ---------- el reproductor de estados: adelante y atrás dan lo mismo ---------- */
      const ts = [G.bfs(gc, 0, -1, { detalle: true }), G.dfsRec(gs, 0, -1), G.dijkstra(gs, 0, 8, { detalle: true }), G.correr('astar', gs, 0, 8), G.bellman(gn, 0, -1), G.contarIslas(isl, -1, -1, {})];
      ts.forEach((T, ti2) => {
        const total = T.pasos.length; let bien = true;
        [Math.floor(total / 2), total - 1, 0, Math.floor(total / 3), total - 1].forEach(k => {
          const a = G.estadoEn(T, k), snap = JSON.stringify([Array.from(a.est), Array.from(a.ord), Array.from(a.prev), a.u, a.exp, a.ds]);
          T._st = null; const b = G.estadoEn(T, k); if (JSON.stringify([Array.from(b.est), Array.from(b.ord), Array.from(b.prev), b.u, b.exp, b.ds]) !== snap) bien = false;
        });
        ok(bien, 'ir a un paso y volver da el mismo estado (traza ' + ti2 + ')');
        ok(T.pasos.every(p => Array.isArray(p.lin) && p.lin.every(l => l >= 1 && l <= G.CODIGO[T.alg === 'dijkstraHeap' ? 'dijkstraHeap' : T.alg].length) && typeof p.msg === 'string' && p.msg.length > 3), 'cada paso trae mensaje y líneas de código válidas (traza ' + ti2 + ')');
      });
      const ult = G.estadoEn(ts[0], ts[0].pasos.length - 1);
      ok(Array.from(ult.ord).join() === '1,2,3,4,5,6,7' && ult.est.every(e => e === G.E.HECHO), 'al terminar el BFS de la clase todos los nodos están procesados y numerados 1 a 7');
      ok(G.estadoEn(ts[1], ts[1].pasos.length - 1).est.every(e => e === G.E.HECHO), 'al terminar el DFS todos los nodos quedan procesados');

      /* ---------- dibujo SVG ---------- */
      [gc, gs, gt, gn, G.arbol(12, 3, 2), G.red(10, 3, 2), ciu].forEach(g => {
        const f = G.cuadro(g, G.estadoEn(G.bfs(g, g.ini < 0 ? 0 : g.ini, -1), 4), { pesos: g.ponderado, nombres: g.tipo === 'red' || g.tipo === 'ciudades' });
        const ids = f.items.map(i => i.id);
        ok(f.items.length > g.n && new Set(ids).size === ids.length, 'el dibujo del grafo no repite elementos (' + g.titulo + ')');
        ok(f.items.every(i => ['lin', 'fl', 'etq', 'circ', 'caja'].includes(i.k)) && g.x.every((v, i) => v >= 0 && v <= g.W && g.y[i] >= 0 && g.y[i] <= g.H), 'los nodos caben en el lienzo (' + g.titulo + ')');
      });
      ok(G.figura(gc, { est: { 0: G.E.HECHO }, orden: { 0: 1 }, camino: [0, 2, 6] }).items.length > 7, 'G.figura dibuja una figura estática para el banco de preguntas');
      ok(G.aPython(gc) === "{'A': ['B', 'C', 'D'], 'B': ['A', 'E'], 'C': ['A', 'F', 'G'], 'D': ['A'], 'E': ['B', 'F'], 'F': ['C', 'E', 'G'], 'G': ['C', 'F']}", 'la lista de adyacencia del grafo de la clase se escribe como diccionario de Python');
    } catch (e) { fallos.push('excepción: ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' | ') : e)); }
    return { comprobaciones: n, fallos };
  }
  window.pruebaGrafo = pruebaGrafo;
  const btn = document.getElementById('btn-grafo');
  if (btn) btn.onclick = async () => {
    out.textContent = 'Probando grafos, BFS, DFS, Dijkstra y A*…\n';
    const t0 = performance.now(), r = await pruebaGrafo();
    log('Comprobaciones: ' + r.comprobaciones + ' | fallos: ' + r.fallos.length + ' | ' + Math.round(performance.now() - t0) + ' ms');
    r.fallos.slice(0, 40).forEach(f => log(' ✗ ' + f));
  };
})();
