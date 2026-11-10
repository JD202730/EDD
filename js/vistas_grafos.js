/* vistas_grafos.js — Laboratorio: «Grafos: BFS y DFS» (S12-C1) y «Caminos mínimos» (S12-C2).
   El estudiante ELIGE el escenario (grafo de la clase, grafo al azar, árbol, red social, laberinto, islas, mapa de calles, mapa de ciudades, trueque…),
   cuántos nodos o qué tamaño tiene, el algoritmo (BFS, DFS recursivo o iterativo, bidireccional, Dijkstra, A*, Bellman-Ford, Floyd-Warshall) y puede
   COMPARAR dos algoritmos lado a lado sobre el mismo problema (¿cuál sale primero?). Los grafos pequeños se dibujan con el motor de escenas (SVG, con la
   cola/pila, la tabla de costos y el código Python que se ejecuta); los laberintos, las islas y los mapas grandes se dibujan en un lienzo (canvas). */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, G = ET.Sim.grafo, E = G.E, Vc = ET.Vc;
  const LE = ET.LabEstructuras = ET.LabEstructuras || {};

  /* ===================================================================== escenarios ===================================================================== */
  const PAR = (k, t, min, max, paso, def, unid) => ({ k, t, min, max, paso, def, unid: unid || '' });
  const ESCENAS = {
    clase: { ic: '📘', t: 'Grafo de la clase', tipo: 'svg', par: [], build: () => G.clase(), nota: 'El grafo de las diapositivas de la clase (S12-C1): 7 nodos con un ciclo A–B–E–F–C. BFS: A B C D E F G · DFS: A B E F C G D.' },
    aleatorio: { ic: '🕸', t: 'Grafo al azar', tipo: 'svg', par: [PAR('n', 'Nodos', 4, 26, 1, 9), PAR('grado', 'Conexiones por nodo', 1.5, 4.5, .5, 2.5)], build: p => G.aleatorio(p.n, p.grado, p.seed), nota: 'Un grafo conexo con los nodos y las conexiones que elijas.' },
    arbol: { ic: '🌳', t: 'Árbol', tipo: 'svg', par: [PAR('n', 'Nodos', 3, 31, 1, 15), PAR('ramas', 'Hijos como máximo', 2, 4, 1, 2)], build: p => G.arbol(p.n, p.ramas, p.seed), orden: 'asc', nota: 'Un árbol es un grafo sin ciclos: BFS lo recorre por niveles y DFS en preorden (como en la semana 6). Los números muestran el orden de visita.' },
    red: { ic: '👥', t: 'Red social', tipo: 'svg', par: [PAR('n', 'Personas', 5, 26, 1, 12), PAR('grado', 'Amigos por persona (media)', 1.5, 5, .5, 2.5)], build: p => G.red(p.n, p.grado, p.seed), nombres: true, nota: 'Cada arista es una amistad. BFS desde una persona calcula los **grados de separación**; con destino da el mínimo de saltos.' },
    laberinto: { ic: '🧱', t: 'Laberinto', tipo: 'rejilla', par: [PAR('filas', 'Filas', 9, 45, 2, 29), PAR('cols', 'Columnas', 9, 65, 2, 49), PAR('bucles', 'Caminos extra', 0, 100, 5, 15, ' %')], build: p => G.laberinto(p.filas, p.cols, p.seed, p.bucles), orden: 'azar', nota: 'Cada celda libre es un nodo y sus vecinas libres son sus aristas. Mueve el origen o el destino con un clic. Con «caminos extra» hay varios caminos y se nota la diferencia entre BFS y DFS.' },
    islas: { ic: '🏝', t: 'Islas', tipo: 'rejilla', par: [PAR('filas', 'Filas', 4, 30, 1, 10), PAR('cols', 'Columnas', 5, 44, 1, 18), PAR('pct', 'Tierra', 15, 70, 5, 42, ' %'), PAR('ocho', 'Vecinos', 4, 8, 4, 4)], build: p => G.islas(p.filas, p.cols, p.seed, p.pct, p.ocho === 8), nota: 'Contar islas: se barre la cuadrícula y, al encontrar tierra sin visitar, se lanza un BFS/DFS que marca toda la isla (diap. 26).' },
    calles: { ic: '🗺', t: 'Mapa de calles', tipo: 'mapa', par: [PAR('n', 'Intersecciones', 60, 1200, 20, 400)], build: p => G.calles(p.n, p.seed), orden: 'azar', nota: 'Una red de calles: cada intersección es un nodo y cada calle una arista (su peso es la longitud). Haz clic en el mapa para mover el destino.' },
    ciudades: { ic: '🏙', t: 'Mapa de ciudades', tipo: 'svg', par: [], build: () => G.ciudades(), nombres: true, nota: 'Ciudades de Colombia unidas por carreteras. **Las distancias son aproximadas** y solo sirven para practicar. En A* la heurística es la distancia en línea recta.' },
    s12: { ic: '🧭', t: 'Grafo de la clase 2', tipo: 'svg', par: [], build: () => G.s12(), nota: 'El grafo de la clase de caminos mínimos (S12-C2, diap. 16): de S a X. Dijkstra cierra S A C D B F E I X; A* solo expande S D C E B X.' },
    trueque: { ic: '💱', t: 'Trueque de Rafael', tipo: 'svg', par: [], build: () => G.trueque(), nombres: true, nota: 'De los audífonos al PC Gamer cambiando objetos (S12-C2, diap. 7-15). Las flechas van en el sentido del trueque; el número es el costo.' },
    negativo: { ic: '➖', t: 'Peso negativo', tipo: 'svg', par: [], build: () => G.negativo(), nota: 'Con la arista B → A de −4, **Dijkstra se equivoca** (C = 3) y Bellman-Ford acierta (C = 0): ver diap. 41.' },
    pond: { ic: '⚖', t: 'Grafo ponderado al azar', tipo: 'svg', par: [PAR('n', 'Nodos', 4, 20, 1, 9), PAR('grado', 'Conexiones por nodo', 1.5, 4.5, .5, 2.5)], build: p => G.aleatorio(p.n, p.grado, p.seed, { pond: true }), nota: 'Pesos al azar entre 1 y 9 en cada arista.' }
  };
  const TABS = {
    grafos: { t: 'Grafos: BFS y DFS', escenas: ['clase', 'aleatorio', 'arbol', 'red', 'laberinto', 'islas', 'calles', 'ciudades'], alg: 'bfs', cmp: 'dfsRec' },
    caminos: { t: 'Caminos mínimos: Dijkstra y A*', escenas: ['s12', 'trueque', 'ciudades', 'pond', 'negativo', 'calles', 'laberinto'], alg: 'dijkstra', cmp: 'astar' }
  };
  /** algoritmos que tienen sentido en cada escenario de cada pestaña (el primero es el predeterminado) */
  function algsDe(tab, id, g) {
    const esc = ESCENAS[id];
    if (id === 'islas') return ['islasBfs', 'islasDfs'];
    if (id === 'laberinto') return (tab === 'grafos' ? ['bfs', 'dfsRec', 'dfsIter', 'bidir'] : ['dijkstra', 'astar', 'bfs', 'dfsRec']).concat(['generar']);
    if (tab === 'grafos') return esc.tipo === 'svg' && id !== 'arbol' ? ['bfs', 'dfsRec', 'dfsIter', 'bidir'] : (id === 'arbol' ? ['bfs', 'dfsRec', 'dfsIter'] : ['bfs', 'dfsRec', 'dfsIter', 'bidir']);
    if (esc.tipo === 'svg') { const a = ['dijkstra', 'dijkstraHeap', 'astar', 'bellman']; if (g && g.n <= 12) a.push('floyd'); a.push('bfs'); return id === 'negativo' ? ['dijkstra', 'bellman', 'astar', 'floyd', 'bfs'] : a; }
    return ['dijkstra', 'dijkstraHeap', 'astar', 'bfs', 'dfsRec'];
  }
  const NEGRITA = s => U.mdInline(s);
  const chip = (txt, tit) => h('span', { class: 'sim-cx', title: tit || null, text: txt });
  const fmt = x => x === Infinity ? '∞' : (Number.isInteger(x) ? String(x) : String(Math.round(x * 10) / 10));
  /** nombre corto de un nodo para las fichas de la cola y la pila */
  const corto = (g, i) => g.tipo === 'rejilla' ? Math.floor(i / g.cols) + ',' + (i % g.cols) : (g.tipo === 'mapa' ? '#' + i : g.etq[i]);

  /* ===================================================================== dibujo en lienzo (laberinto, islas, mapa) ===================================================================== */
  const COL = { cola: '#e6faff', cola2: '#f5e9ff', oro: '#fde047', ini: '#34d399', fin: '#fb7185', islas: ['#22d3ee', '#f472b6', '#a3e635', '#fb923c', '#a78bfa', '#facc15'] };
  const rr = (c, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const brillo = (c, col, blur, fn) => { c.save(); c.shadowColor = col; c.shadowBlur = blur; fn(); c.restore(); };
  const claveAr = (a, b) => a < b ? a + ',' + b : b + ',' + a;
  function aristaIdx(g) { if (g._eidx) return g._eidx; const m = new Map(); g.aristas.forEach((e, i) => m.set(claveAr(e.a, e.b), i)); return (g._eidx = m); }
  /** agrega al trazo actual la calle `ei` recorrida de `desde` a `hasta` (con su curvatura); mover = empezar un trazo nuevo */
  function calle(c, g, k, ei, desde, hasta, mover) {
    const e = g.aristas[ei], x1 = g.x[e.a] * k, y1 = g.y[e.a] * k, x2 = g.x[e.b] * k, y2 = g.y[e.b] * k, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, cv = (e.cv || 0) * k;
    if (mover) c.moveTo(g.x[desde] * k, g.y[desde] * k);
    c.quadraticCurveTo((x1 + x2) / 2 - dy / L * cv, (y1 + y2) / 2 + dx / L * cv, g.x[hasta] * k, g.y[hasta] * k);
  }
  function lienzo(host, g, esc) {
    const cv = h('canvas', { class: 'gf-cv', role: 'img' }); host.appendChild(cv); let cs = 10, anchoCss = 0, alto = 0, ultHost = 0, base = null, geo = null; const dpr = Math.min(2, global.devicePixelRatio || 1), lab = g.tipo === 'rejilla' && esc === 'laberinto';
    const ajustar = () => {
      const disp = Math.max(260, host.clientWidth || 700);
      if (lab) { geo = geomLab(g, disp); anchoCss = geo.W; alto = geo.H; }
      else if (g.tipo === 'rejilla') { cs = Math.max(3, Math.min(26, Math.floor(disp / g.cols))); anchoCss = g.cols * cs; alto = g.filas * cs; }
      else { anchoCss = Math.min(disp, g.W); alto = Math.round(anchoCss * g.H / g.W); }
      cv.style.width = anchoCss + 'px'; cv.style.height = alto + 'px'; cv.width = Math.round(anchoCss * dpr); cv.height = Math.round(alto * dpr); base = null;
    };
    const hacerBase = () => {
      base = document.createElement('canvas'); base.width = cv.width; base.height = cv.height; const c = base.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (lab) baseLab(c, g, geo); else if (g.tipo === 'rejilla') baseRejilla(c, g, cs, esc, anchoCss, alto); else baseMapa(c, g, anchoCss / g.W, anchoCss, alto);
    };
    return {
      cv,
      pintar(st, T, o) {
        const hw = host.clientWidth || 700; if (!anchoCss || Math.abs(hw - ultHost) > 24) { ultHost = hw; ajustar(); }
        if (!base) hacerBase();
        const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.drawImage(base, 0, 0); c.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (lab) pintaLab(c, g, st, geo, T.alg === 'generar'); else if (g.tipo === 'rejilla') pintaRejilla(c, g, st, cs, esc); else pintaMapa(c, g, st, anchoCss / g.W, o, anchoCss);
        cv.setAttribute('aria-label', g.titulo + ': paso ' + (st.k + 1) + ', ' + st.exp + (T.alg === 'generar' ? ' habitaciones talladas' : ' nodos explorados') + (st.camino.length ? ', camino de ' + (st.camino.length - 1) + ' aristas' : ''));
      },
      /** nodo bajo un clic (o -1) */
      nodoEn(ev) {
        const r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
        if (lab) {
          const pos = (o, w, v) => { for (let i = 0; i < o.length; i++) if (v >= o[i] && v < o[i] + w[i]) return i; return -1; };
          let c = pos(geo.ox, geo.wc, x), f = pos(geo.oy, geo.hr, y); if (c < 0 || f < 0) return -1;
          if (c % 2 === 0) c += (c + 1 < g.cols && (c === 0 || x - geo.ox[c] > geo.wc[c] / 2)) ? 1 : -1; if (f % 2 === 0) f += (f + 1 < g.filas && (f === 0 || y - geo.oy[f] > geo.hr[f] / 2)) ? 1 : -1;
          return f * g.cols + c;
        }
        if (g.tipo === 'rejilla') { const c = Math.floor(x / cs), f = Math.floor(y / cs); if (c < 0 || c >= g.cols || f < 0 || f >= g.filas) return -1; return f * g.cols + c; }
        const k = anchoCss / g.W; let mejor = -1, md = 24 * 24;
        for (let i = 0; i < g.n; i++) { const dx = g.x[i] * k - x, dy = g.y[i] * k - y, d = dx * dx + dy * dy; if (d < md) { md = d; mejor = i; } }
        return mejor;
      },
      ajustar, destruir() { cv.remove(); }
    };
  }
  /* ---------- laberinto al estilo «neón»: paredes finas y claras, pasillos anchos, la exploración se tiñe de azul a magenta y el camino brilla en amarillo ---------- */
  function geomLab(g, disp) {
    const C = g.cols, R = g.filas, t = disp / C > 12 ? 3 : 2; let s = Math.floor((disp - ((C + 1) / 2) * t) / ((C - 1) / 2)); s = Math.max(5, Math.min(34, s));
    const ox = [], oy = [], wc = [], hr = []; let x = 0, y = 0;
    for (let c = 0; c < C; c++) { ox[c] = x; wc[c] = c % 2 ? s : t; x += wc[c]; }
    for (let r = 0; r < R; r++) { oy[r] = y; hr[r] = r % 2 ? s : t; y += hr[r]; }
    return { ox, oy, wc, hr, W: x, H: y, s, t };
  }
  const PALETA_LAB = Array.from({ length: 72 }, (_, i) => { const f = i / 71; return 'hsl(' + Math.round(228 + f * 112) + ',' + Math.round(78 + f * 8) + '%,' + Math.round(50 - f * 3) + '%)'; });
  function baseLab(c, g, geo) {
    const f = c.createLinearGradient(0, 0, 0, geo.H); f.addColorStop(0, '#101c3f'); f.addColorStop(1, '#0a1329'); c.fillStyle = f; c.fillRect(0, 0, geo.W, geo.H);
    const C = g.cols, R = g.filas; c.fillStyle = '#16244f';
    for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) if (!g.muro[r * C + k]) c.fillRect(geo.ox[k], geo.oy[r], geo.wc[k], geo.hr[r]);
    c.fillStyle = '#e3e9ff';
    for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) if (g.muro[r * C + k]) c.fillRect(geo.ox[k], geo.oy[r], geo.wc[k], geo.hr[r]);
  }
  function pintaLab(c, g, st, geo, gen) {
    const C = g.cols, R = g.filas, max = Math.max(1, st.nOrd), ord = i => st.ord[i] || 0;
    if (gen) {   // al construir, los pasillos que todavía no se han abierto se ven como pared
      c.fillStyle = '#e3e9ff';
      for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) { const i = r * C + k; if (!g.muro[i] && !st.est[i] && ((r % 2) !== (k % 2))) c.fillRect(geo.ox[k], geo.oy[r], geo.wc[k], geo.hr[r]); }
    }
    for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) {
      const i = r * C + k, e = st.est[i]; if (!e) continue;
      let col;
      if (e === E.ACT) col = '#ffffff';
      else if (e === E.COLA || e === E.COLA2) col = gen ? '#fbbf24' : '#f3eeff';
      else { let o = ord(i); if (!o) { if (k > 0) o = Math.max(o, ord(i - 1)); if (k < C - 1) o = Math.max(o, ord(i + 1)); if (r > 0) o = Math.max(o, ord(i - C)); if (r < R - 1) o = Math.max(o, ord(i + C)); } col = PALETA_LAB[Math.min(71, Math.floor(o / max * 71))]; }
      c.fillStyle = col; c.fillRect(geo.ox[k], geo.oy[r], geo.wc[k], geo.hr[r]);
    }
    const centro = i => [geo.ox[i % C] + geo.wc[i % C] / 2, geo.oy[Math.floor(i / C)] + geo.hr[Math.floor(i / C)] / 2];
    if (st.camino.length > 1) {
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.shadowColor = '#fde047'; c.shadowBlur = 12; c.strokeStyle = '#fde047'; c.lineWidth = Math.max(3, geo.s * .42); c.beginPath();
      st.camino.forEach((i, j) => { const p = centro(i); if (j) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.stroke();
      c.shadowBlur = 0; c.strokeStyle = '#fff7c2'; c.lineWidth = Math.max(1.2, geo.s * .14); c.stroke(); c.restore();
    }
    if (st.u >= 0 && !gen) { const p = centro(st.u); brillo(c, '#fff', 10, () => { c.fillStyle = '#fff'; c.beginPath(); c.arc(p[0], p[1], Math.max(2.5, geo.s * .3), 0, 6.3); c.fill(); }); }
    [[g.ini, '#34d399'], [g.fin, '#fb7185']].forEach(([i, col]) => { if (i < 0) return; const p = centro(i), s = geo.s * .86; brillo(c, col, 12, () => { rr(c, p[0] - s / 2, p[1] - s / 2, s, s, s * .25); c.fillStyle = col; c.fill(); }); });
  }
  /** lo que no cambia en la cuadrícula: el suelo, las paredes con relieve, el agua y la arena */
  function baseRejilla(c, g, cs, esc, w, hh) {
    const islas = esc === 'islas', R = g.filas, C = g.cols, r0 = cs >= 6 ? Math.max(1, cs * .24) : 0, f = c.createLinearGradient(0, 0, 0, hh);
    if (islas) { f.addColorStop(0, '#0c3169'); f.addColorStop(1, '#06193c'); } else { f.addColorStop(0, '#0e1a3a'); f.addColorStop(1, '#080f24'); }
    c.fillStyle = f; c.fillRect(0, 0, w, hh);
    for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) {
      const i = r * C + k, x = k * cs, y = r * cs;
      if (islas) {
        if (g.muro[i]) { if (cs >= 7 && (r * 5 + k * 3) % 7 === 0) { c.strokeStyle = 'rgba(147,197,253,.18)'; c.lineWidth = 1; c.beginPath(); c.arc(x + cs / 2, y + cs * .62, cs * .26, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); } }
        else { if (r0) rr(c, x + .5, y + .5, cs - 1, cs - 1, r0); else { c.beginPath(); c.rect(x, y, cs, cs); } c.fillStyle = '#d8c48d'; c.fill(); if (cs >= 8) { c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x + 1.5, y + 1.5, cs - 3, Math.max(1, cs * .14)); } }
      } else if (g.muro[i]) {
        if (r0) rr(c, x + .5, y + .5, cs - 1, cs - 1, r0); else { c.beginPath(); c.rect(x, y, cs, cs); } c.fillStyle = '#20315f'; c.fill();
        if (cs >= 8) { c.fillStyle = 'rgba(150,180,255,.17)'; c.fillRect(x + 1.5, y + 1.5, cs - 3, Math.max(1, cs * .15)); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x + 1.5, y + cs - 1.5 - Math.max(1, cs * .12), cs - 3, Math.max(1, cs * .12)); }
      }
    }
  }
  function pintaRejilla(c, g, st, cs, esc) {
    const R = g.filas, C = g.cols, islas = esc === 'islas', r0 = cs >= 6 ? Math.max(1, cs * .24) : 0, pad = cs >= 8 ? 1 : 0;
    const celda = (r, k, col, glow) => {
      const x = k * cs + pad, y = r * cs + pad, s = cs - pad * 2;
      const dibuja = () => { c.fillStyle = col; if (r0) { rr(c, x, y, s, s, r0); c.fill(); } else c.fillRect(x, y, s, s); };
      if (glow) brillo(c, glow, Math.max(6, cs * .9), dibuja); else dibuja();
    };
    for (let r = 0; r < R; r++) for (let k = 0; k < C; k++) {
      const i = r * C + k, e = st.est[i]; if (!e || (!islas && g.muro[i])) continue;
      if (islas) { if (e >= E.ISLA0) { const col = COL.islas[(e - E.ISLA0) % 6]; celda(r, k, col, null); if (cs >= 8) { c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(k * cs + 2, r * cs + 2, cs - 4, Math.max(1, cs * .14)); } } continue; }
      if (e === E.HECHO) celda(r, k, 'rgba(34,211,238,.6)', null);
      else if (e === E.HECHO2) celda(r, k, 'rgba(192,132,252,.6)', null);
      else if (e === E.COLA) celda(r, k, COL.cola, '#67e8f9');
      else if (e === E.COLA2) celda(r, k, COL.cola2, '#c084fc');
      else if (e === E.CAMINO) celda(r, k, COL.oro, '#f59e0b');
      else if (e === E.ACT) celda(r, k, '#ffffff', '#ffffff');
    }
    if (!islas) {
      [[g.ini, COL.ini], [g.fin, COL.fin]].forEach(([i, col]) => {
        if (i < 0) return; const r = Math.floor(i / C), k = i % C, x = k * cs + cs / 2, y = r * cs + cs / 2, rad = Math.max(cs * .72, 5);
        brillo(c, col, 14, () => { c.fillStyle = col; c.beginPath(); c.arc(x, y, rad, 0, 6.3); c.fill(); });
        c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.5, cs / 8); c.beginPath(); c.arc(x, y, rad, 0, 6.3); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, rad * .3, 0, 6.3); c.fill();
      });
    }
    if (st.u >= 0 && !islas) { const r = Math.floor(st.u / C), k = st.u % C; c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.5, cs / 6); c.strokeRect(k * cs + .5, r * cs + .5, cs - 1, cs - 1); }
    else if (st.u >= 0 && islas) { const r = Math.floor(st.u / C), k = st.u % C; brillo(c, '#fff', 10, () => { c.strokeStyle = '#fff'; c.lineWidth = Math.max(1.5, cs / 6); c.strokeRect(k * cs + 1, r * cs + 1, cs - 2, cs - 2); }); }
  }
  /** el plano de la ciudad al estilo del mapa de GTA: agua azul con costa, tierra color arena, manzanas, parques y un lago, calles blancas con borde y avenidas amarillas */
  const hashN = (a, b, s) => { let x = (a * 374761393 + b * 668265263 + (s | 0) * 2147483647) | 0; x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
  function costa(c, w, hh, g) {
    const N = 96, pts = [], rx = w * .5 - 2, ry = hh * .5 - 2, fase = hashN(1, 2, g.seed) * 6;
    for (let i = 0; i < N; i++) {
      const t = i / N * 2 * Math.PI, ca = Math.cos(t), sa = Math.sin(t), x = Math.sign(ca) * Math.pow(Math.abs(ca), .34), y = Math.sign(sa) * Math.pow(Math.abs(sa), .34);
      const wob = 1 - .035 - .02 * Math.sin(t * 5 + fase) - .014 * Math.sin(t * 11 + fase * 2) - .008 * Math.sin(t * 23 + fase);
      pts.push([w / 2 + x * rx * wob, hh / 2 + y * ry * wob]);
    }
    c.beginPath(); c.moveTo((pts[0][0] + pts[N - 1][0]) / 2, (pts[0][1] + pts[N - 1][1]) / 2);
    for (let i = 0; i < N; i++) { const p = pts[i], q = pts[(i + 1) % N]; c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
    c.closePath();
  }
  function baseMapa(c, g, k, w, hh) {
    const esc = Math.max(.7, k), ag = c.createLinearGradient(0, 0, w, hh); ag.addColorStop(0, '#86bfe0'); ag.addColorStop(1, '#6fa8cc'); c.fillStyle = ag; c.fillRect(0, 0, w, hh);
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.2; for (let i = 0; i < 26; i++) { const x = hashN(i, 5, g.seed) * w, y = hashN(i, 9, g.seed) * hh; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 9, y - 4, x + 18, y); c.stroke(); }   // olas
    c.save(); costa(c, w, hh, g); c.lineJoin = 'round'; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 12 * esc; c.stroke(); c.restore();
    c.save(); costa(c, w, hh, g); const tl = c.createLinearGradient(0, 0, 0, hh); tl.addColorStop(0, '#e9e0c4'); tl.addColorStop(1, '#ddd3b4'); c.fillStyle = tl; c.fill(); c.clip();
    // manzanas, parques, plazas y un lago (según la posición, siempre iguales para el mismo mapa)
    const tonos = ['#e4dbbe', '#dcd2b3', '#e8e0c6', '#d7cdae'], F = g.filas, C = g.cols; let lago = -1;
    for (let r = 0; r < F - 1; r++) for (let q = 0; q < C - 1; q++) {
      const a = r * C + q, b = a + 1, d = a + C, e = d + 1, cx = (g.x[a] + g.x[b] + g.x[d] + g.x[e]) / 4 * k, cy = (g.y[a] + g.y[b] + g.y[d] + g.y[e]) / 4 * k, u = hashN(r, q, g.seed);
      let col = tonos[Math.floor(hashN(q, r, g.seed + 3) * tonos.length)];
      if (u < .09) col = '#a9cc8c'; else if (u < .125) col = '#d4d1c4'; else if (u > .985 && lago < 0) { col = '#86bfe0'; lago = a; }
      c.fillStyle = col; c.beginPath(); [[a, 0], [b, 1], [e, 2], [d, 3]].forEach(([n, j]) => { const x = cx + (g.x[n] * k - cx) * .86, y = cy + (g.y[n] * k - cy) * .86; if (j) c.lineTo(x, y); else c.moveTo(x, y); }); c.closePath(); c.fill();
      if (col === '#a9cc8c') { c.strokeStyle = '#8fb872'; c.lineWidth = 1; c.stroke(); }
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    [false, true].forEach(art => {   // primero las calles normales y encima las avenidas
      c.beginPath(); g.aristas.forEach((e, i) => { if (!!e.art === art) calle(c, g, k, i, e.a, e.b, true); }); c.strokeStyle = art ? '#b9852a' : '#a39b85'; c.lineWidth = (art ? 7.2 : 4.6) * esc; c.stroke();
      c.beginPath(); g.aristas.forEach((e, i) => { if (!!e.art === art) calle(c, g, k, i, e.a, e.b, true); }); c.strokeStyle = art ? '#f8c64f' : '#fdfcf4'; c.lineWidth = (art ? 4.9 : 2.8) * esc; c.stroke();
    });
    c.restore();
    c.save(); costa(c, w, hh, g); c.strokeStyle = 'rgba(80,120,150,.55)'; c.lineWidth = 1.6; c.stroke(); c.restore();
  }
  /** letras al estilo GTA: blancas con contorno negro grueso */
  function rotulo(c, txt, x, y, tam, col) { c.font = '800 ' + tam + 'px "Arial Narrow", Arial, system-ui, sans-serif'; c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = 3.2; c.strokeStyle = 'rgba(0,0,0,.85)'; c.strokeText(txt, x, y); c.fillStyle = col || '#fff'; c.fillText(txt, x, y); c.textAlign = 'left'; }
  function pintaMapa(c, g, st, k, o, w) {
    const idx = aristaIdx(g), esc = Math.max(.75, k); c.lineCap = 'round'; c.lineJoin = 'round';
    // lo explorado: las calles que se «encienden» (azul desde el origen, naranja desde el destino), con un halo blanco como el trazado del GPS
    [false, true].forEach(lado => {
      c.beginPath(); let hay = false;
      for (let i = 0; i < g.n; i++) {
        const e = st.est[i], p = st.prev[i]; if (p < 0 || e === E.LIBRE) continue; if ((e === E.COLA2 || e === E.HECHO2) !== lado) continue;
        const ei = idx.get(claveAr(p, i)); if (ei === undefined) continue; calle(c, g, k, ei, p, i, true); hay = true;
      }
      if (hay) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 6.2 * esc; c.stroke(); c.strokeStyle = lado ? '#f4511e' : '#1e88e5'; c.lineWidth = 3.4 * esc; c.stroke(); }
    });
    for (let i = 0; i < g.n; i++) { const e = st.est[i]; if (e === E.COLA || e === E.COLA2) { c.fillStyle = '#fff'; c.strokeStyle = e === E.COLA ? '#1565c0' : '#d84315'; c.lineWidth = 2.2; c.beginPath(); c.arc(g.x[i] * k, g.y[i] * k, 3.6 * esc, 0, 6.3); c.fill(); c.stroke(); } }
    if (st.camino.length > 1) {   // la ruta: morada con borde blanco y marcas de dirección, como el GPS
      const traza = () => { c.beginPath(); for (let j = 1; j < st.camino.length; j++) { const a = st.camino[j - 1], b = st.camino[j], ei = idx.get(claveAr(a, b)); if (ei === undefined) { if (j === 1) c.moveTo(g.x[a] * k, g.y[a] * k); c.lineTo(g.x[b] * k, g.y[b] * k); } else calle(c, g, k, ei, a, b, j === 1); } };
      c.save(); c.strokeStyle = '#ffffff'; c.lineWidth = 11.5 * esc; traza(); c.stroke();
      c.strokeStyle = '#8e24aa'; c.lineWidth = 7.4 * esc; traza(); c.stroke();
      c.setLineDash([2.5 * esc, 11 * esc]); c.lineCap = 'butt'; c.strokeStyle = '#f3d9ff'; c.lineWidth = 3.4 * esc; traza(); c.stroke(); c.restore();
    }
    if (st.u >= 0) { c.fillStyle = '#ffeb3b'; c.strokeStyle = '#111'; c.lineWidth = 2.2; c.beginPath(); c.arc(g.x[st.u] * k, g.y[st.u] * k, 5.6 * esc, 0, 6.3); c.fill(); c.stroke(); }
    // marcadores: el origen es una flecha azul (como el jugador del radar) y el destino un pin rojo
    if (g.ini >= 0) {
      const x = g.x[g.ini] * k, y = g.y[g.ini] * k, r = 9 * esc;
      c.fillStyle = 'rgba(41,121,255,.22)'; c.beginPath(); c.arc(x, y, r * 1.9, 0, 6.3); c.fill();
      c.fillStyle = '#fff'; c.strokeStyle = '#0d47a1'; c.lineWidth = 2.4; c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill(); c.stroke();
      c.fillStyle = '#2979ff'; c.beginPath(); c.moveTo(x + r * .1, y - r * .62); c.lineTo(x + r * .56, y + r * .5); c.lineTo(x, y + r * .22); c.lineTo(x - r * .56, y + r * .5); c.closePath(); c.fill();
      rotulo(c, 'ORIGEN', x, y - r - 6, 10, '#fff');
    }
    if (g.fin >= 0) {
      const x = g.x[g.fin] * k, y = g.y[g.fin] * k, r = 8 * esc;
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, y + 1, r * .9, r * .35, 0, 0, 6.3); c.fill();
      c.fillStyle = '#e53935'; c.strokeStyle = '#7f0000'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x - r * 1.5, y - r * 1.1, x - r * 1.2, y - r * 2.9, x, y - r * 2.9); c.bezierCurveTo(x + r * 1.2, y - r * 2.9, x + r * 1.5, y - r * 1.1, x, y); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y - r * 1.75, r * .5, 0, 6.3); c.fill();
      rotulo(c, 'DESTINO', x, y - r * 2.9 - 6, 10, '#fff');
    }
    // tablero tipo radar de GTA: fondo oscuro translúcido, rótulos en gris y cifras grandes
    const bw = 204, bx = Math.max(8, w - bw - 12), by = 12, bh = 70;
    c.fillStyle = 'rgba(10,12,18,.78)'; rr(c, bx, by, bw, bh, 6); c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#c9ced6'; c.font = '700 10px "Arial Narrow", Arial, system-ui, sans-serif'; c.fillText(String(o.nombre || '').toUpperCase(), bx + 12, by + 18); c.fillText('EXPLORADOS', bx + 12, by + 40); c.fillText('DISTANCIA', bx + 108, by + 40);
    c.fillStyle = '#fff'; c.font = '800 20px "Arial Narrow", Arial, system-ui, sans-serif'; c.fillText(String(st.exp), bx + 12, by + 60);
    const dd = st.camino.length > 1 ? (g.ponderado ? fmt(G.pesoCamino(g, st.camino)) + ' m' : (st.camino.length - 1) + ' pasos') : '—'; c.fillStyle = st.camino.length > 1 ? '#d8a1ff' : '#c9ced6'; c.fillText(dd, bx + 108, by + 60);
  }

  /* ===================================================================== dibujo SVG (grafos pequeños) ===================================================================== */
  function visualSvg(host, g, S, alClic) {
    const caja = h('div', { class: 'gf-svg' }); host.appendChild(caja); const esc = new ET.Escena(caja, { W: g.W, H: g.H, etiqueta: g.titulo });
    const ajustar = () => { const disp = Math.max(240, (host.clientWidth || 700) - 22); esc.escala = Math.min(1, disp / g.W); esc.medir(); };
    ajustar();
    return {
      esc, ajustar,
      pintar(st, T, o) {
        const f = G.cuadro(g, st, { pesos: g.ponderado, nombres: S.esc.nombres, badge: insignia(T.alg), badgeCls: (i, s) => (T.alg === 'bellman' || T.alg === 'dijkstra' || T.alg === 'dijkstraHeap' || T.alg === 'astar') && s.hi.indexOf(i) >= 0 ? 'nuevo' : '' });
        f.items.forEach(it => { if (it.id[0] === 'n') { const i = +it.id.slice(1); it.clic = () => alClic(i); } });
        return esc.aplicar(f.items, { dur: o.dur });
      },
      destruir() { esc.destruir(); caja.remove(); }
    };
  }
  /** el número sobre cada nodo: orden de visita (recorridos) o distancia conocida (caminos mínimos) */
  const insignia = alg => G.insignia(alg);

  /* ===================================================================== estructura de datos (cola, pila, tabla de costos…) ===================================================================== */
  function fichas(g, lista, etiqueta, clase, tope) {
    const cont = h('div', { class: 'gf-fichas' }), max = 22;
    const vis = lista.length > max ? (tope === 'der' ? lista.slice(lista.length - max) : lista.slice(0, max)) : lista;
    if (lista.length > max && tope === 'der') cont.appendChild(h('span', { class: 'gf-mas', text: '… ' + (lista.length - max) + ' más' }));
    vis.forEach((e, j) => {
      const par = Array.isArray(e), nodo = par ? e[0] : e, ult = j === vis.length - 1, prim = j === 0;
      const marca = tope === 'der' ? (ult ? 'tope' : '') : (prim ? 'frente' : '');
      cont.appendChild(h('span', { class: 'gf-ch' + (marca ? ' ' + marca : '') + (clase ? ' ' + clase : ''), title: marca || null }, corto(g, nodo), par ? h('small', { text: fmt(e[1]) }) : null));
    });
    if (lista.length > max && tope !== 'der') cont.appendChild(h('span', { class: 'gf-mas', text: '… ' + (lista.length - max) + ' más' }));
    if (!lista.length) cont.appendChild(h('span', { class: 'gf-vacia', text: '(vacía)' }));
    return h('div', { class: 'gf-bloque' }, h('b', { class: 'gf-etq', text: etiqueta }), cont);
  }
  function tablaCostos(g, st, T) {
    const esA = T.alg === 'astar', filas = [];
    for (let i = 0; i < g.n; i++) { if (g.n > 30 && st.dist[i] === Infinity) continue; filas.push(i); }
    const t = h('table', { class: 'gf-tabla' }, h('thead', null, h('tr', null, h('th', { text: 'Nodo' }), h('th', { text: 'Costo' }), esA ? h('th', { text: 'f = g + h' }) : null, h('th', { text: 'Predecesor' }), h('th', { text: 'Estado' }))));
    const tb = h('tbody'); t.appendChild(tb);
    filas.slice(0, 40).forEach(i => {
      const e = st.est[i], estado = e === E.HECHO || e === E.CAMINO ? (T.alg === 'bellman' ? 'conocido' : (esA ? 'expandido' : 'cerrado')) : (e === E.COLA || e === E.ACT ? (T.alg === 'bellman' ? 'conocido' : 'abierto') : '—');
      tb.appendChild(h('tr', { class: (st.u === i ? 'act ' : '') + (st.hi.indexOf(i) >= 0 ? 'mejora' : '') + (e === E.HECHO || e === E.CAMINO ? ' cerrado' : '') },
        h('th', { scope: 'row', text: g.nom[i] }), h('td', { text: fmt(st.dist[i]) }), esA ? h('td', { text: st.dist[i] === Infinity ? '∞' : fmt(st.f[i] === Infinity ? st.dist[i] + (T.res.h ? T.res.h[i] : 0) : st.f[i]) }) : null, h('td', { text: st.prev[i] >= 0 ? g.nom[st.prev[i]] : '—' }), h('td', { text: estado })));
    });
    return h('div', { class: 'gf-bloque' }, h('b', { class: 'gf-etq', text: T.alg === 'bellman' ? 'Distancias (se relajan todas las aristas)' : 'Tabla de costos y predecesores' }), h('div', { class: 'gf-scroll' }, t));
  }
  function tablaMatriz(g, st) {
    const M = st.mat || [], ex = st.extra || { k: -1, cambios: [] }, cam = new Set((ex.cambios || []).map(c => c[0] + ',' + c[1]));
    const t = h('table', { class: 'gf-tabla gf-mat' }, h('thead', null, h('tr', null, h('th', { text: '' }), g.nom.map((s, j) => h('th', { class: j === ex.k ? 'k' : '', text: g.etq[j] })))));
    const tb = h('tbody'); t.appendChild(tb);
    M.forEach((fila, i) => tb.appendChild(h('tr', null, h('th', { scope: 'row', class: i === ex.k ? 'k' : '', text: g.etq[i] }), fila.map((v, j) => h('td', { class: (cam.has(i + ',' + j) ? 'mejora ' : '') + (i === ex.k || j === ex.k ? 'k' : '') + (v === Infinity ? ' inf' : ''), text: fmt(v) })))));
    return h('div', { class: 'gf-bloque' }, h('b', { class: 'gf-etq', text: 'Matriz de distancias d[i][j]' + (ex.k >= 0 && ex.k < g.n ? ' · intermedio k = ' + g.nom[ex.k] : '') }), h('div', { class: 'gf-scroll' }, t));
  }
  function estructura(g, st, T) {
    const a = T.alg;
    if (a === 'bfs' || a === 'islasBfs') return fichas(g, st.ds, 'Cola (sale por la izquierda: el primero que entró)', '', 'izq');
    if (a === 'dfsIter' || a === 'islasDfs') return fichas(g, st.ds, 'Pila (sale por la derecha: el último que entró)', '', 'der');
    if (a === 'dfsRec') return fichas(g, st.ds, 'Pila de llamadas (la llamada actual es la de la derecha)', '', 'der');
    if (a === 'generar') return fichas(g, st.ds, 'Pila de habitaciones (la actual es la de la derecha)', '', 'der');
    if (a === 'bidir') return h('div', null, fichas(g, st.ds, 'Cola desde el origen', '', 'izq'), fichas(g, st.ds2 || [], 'Cola desde el destino', 'dos', 'izq'));
    if (a === 'dijkstraHeap') return h('div', null, fichas(g, st.ds, 'Cola de prioridad (d, nodo): sale la de menor d', '', 'izq'), tablaCostos(g, st, T));
    if (a === 'floyd') return tablaMatriz(g, st);
    if (g.n > 60) return fichas(g, st.ds, 'Frontera (nodos abiertos)', '', 'izq');
    return tablaCostos(g, st, T);
  }

  /* ===================================================================== el laboratorio ===================================================================== */
  function montar(host, q, tab) {
    const CFG = TABS[tab]; let limpiar = [];
    const pe = String(q.e || '').split('.'), e0 = pe[0], a0 = pe[1] || q.a, b0 = pe[2];   // ?e=escena · ?e=escena.alg · ?e=escena.alg.algB (compara los dos)
    const S = { tab, escId: CFG.escenas.includes(e0) ? e0 : CFG.escenas[0], p: {}, seed: +q.seed || U.newSeed(), orden: null, detalle: false, inverso: false, hpeso: 1, alg: null, cmp: !!+q.c || !!b0, algB: null, ini: -1, fin: -1, modoClic: 'fin', k: 0, jugando: false };
    S.esc = ESCENAS[S.escId];
    host.appendChild(h('p', { class: 'suave', html: NEGRITA(tab === 'grafos' ? 'Elige el **problema**, **cuántos nodos** tiene y el **algoritmo**: **BFS** (cola, por niveles) o **DFS** (pila, hasta el fondo). Activa «comparar» para ver cuál sale primero.' : 'Aquí las aristas **pesan**: se suman pesos, no se cuentan saltos. Prueba **Dijkstra**, A*, **Bellman-Ford** y **Floyd-Warshall** y compara cuántos nodos explora cada uno.') }));
    const filaEsc = h('div', { class: 'gf-esc', role: 'radiogroup', 'aria-label': 'Elige el problema' });
    const zonaPar = h('div', { class: 'gf-ctl' }), zonaAlg = h('div', { class: 'gf-ctl' }), nota = h('p', { class: 'peq tenue gf-nota' });
    const zonaPan = h('div', { class: 'gf-pans' }), zonaRes = h('div', { class: 'gf-res' }), leyenda = h('div', { class: 'gf-ley', 'aria-label': 'Leyenda de colores' });
    const barra = h('div', { class: 'cdarb-ctl rep-ctl gf-barra', role: 'toolbar', 'aria-label': 'Control de la animación' });
    const zonaPrac = h('div', { class: 'gf-prac card', 'aria-live': 'polite' });
    host.append(filaEsc, h('div', { class: 'gf-ctls card' }, zonaPar, zonaAlg), leyenda, zonaPrac, zonaPan, barra, zonaRes, nota);

    /* ---------- reproductor ---------- */
    const P = { k: 0, max: 0, timer: null, jugando: false, vel: 'normal', acc: 0 };
    const bt = (t, tit, fn) => h('button', { class: 'btn sec peq', type: 'button', title: tit, 'aria-label': tit, onclick: fn }, t);
    const bPlay = bt('▶', 'Reproducir / pausar', () => alternar());
    const slider = h('input', { type: 'range', min: 0, max: 0, value: 0, class: 'cdarb-slider', 'aria-label': 'Paso de la animación' });
    const cont = h('span', { class: 'peq tenue cdarb-cont' });
    const VELS = [['lenta', 'lenta'], ['normal', 'normal'], ['rapida', 'rápida'], ['turbo', 'muy rápida'], ['fin', 'solo el resultado']];
    const selVel = h('select', { class: 'cdarb-sel', 'aria-label': 'Velocidad de la animación' }, VELS.map(([v, t]) => h('option', { value: v, text: t })));
    selVel.value = P.vel; selVel.addEventListener('change', () => { P.vel = selVel.value; if (P.jugando) { parar(); alternar(); } else if (P.vel === 'fin') ir(P.max); });
    slider.addEventListener('input', () => { parar(); ir(+slider.value, 0); });
    barra.append(bt('⏮', 'Al primer paso', () => { parar(); ir(0); }), bt('◀', 'Paso atrás', () => { parar(); ir(P.k - 1); }), bPlay, bt('▶|', 'Paso adelante', () => { parar(); ir(P.k + 1); }), bt('⏭', 'Al último paso', () => { parar(); ir(P.max); }), slider, cont, selVel);
    const paneles = [];
    const tipoVis = () => (S.g && S.g.tipo === 'rejilla') || (S.g && S.g.tipo === 'mapa') ? 'rej' : 'svg';
    /** tiempo entre pasos (svg) o tiempo total (lienzo) según la velocidad */
    const TIEMPO = { svg: { lenta: 1500, normal: 900, rapida: 450, turbo: 160 }, rej: { lenta: 40000, normal: 14000, rapida: 5500, turbo: 2200 } };
    function ir(k, dur) {
      P.k = Math.max(0, Math.min(P.max, k)); slider.value = String(P.k); cont.textContent = 'Paso ' + (P.k + 1) + ' de ' + (P.max + 1);
      const d = dur === undefined ? (tipoVis() === 'svg' ? Math.min(480, (TIEMPO.svg[P.vel] || 600) * .6) : 0) : dur;
      paneles.forEach(p => p.pintar(P.k, d));
      if (P.k >= P.max) { zonaRes.classList.add('lista'); }
    }
    function parar() { P.jugando = false; bPlay.textContent = '▶'; if (P.timer) { clearTimeout(P.timer); P.timer = null; } }
    function alternar() {
      if (P.jugando) { parar(); return; }
      if (P.vel === 'fin') { ir(P.max); return; }
      if (P.k >= P.max) ir(0, 0);
      P.jugando = true; bPlay.textContent = '⏸'; P.acc = 0;
      const svg = tipoVis() === 'svg', T = TIEMPO[svg ? 'svg' : 'rej'][P.vel], tick = svg ? T : 33, rate = svg ? 1 : Math.max(0.05, (P.max + 1) / (T / 33));
      const paso = () => {
        if (!P.jugando) return;
        if (P.k >= P.max) { parar(); return; }
        P.acc += rate; const n = Math.floor(P.acc); P.acc -= n; if (n > 0) ir(P.k + n);
        P.timer = setTimeout(paso, tick);
      };
      P.timer = setTimeout(paso, svg ? Math.min(400, T * .5) : 150);
    }

    /* ---------- panel (un algoritmo sobre el grafo) ---------- */
    function panel(idx) {
      const raiz = h('section', { class: 'gf-pan card', 'aria-label': 'Animación ' + (idx + 1) });
      const tit = h('h3', { class: 'gf-tit' }), msg = h('div', { class: 'rep-msg gf-msg', 'aria-live': idx === 0 ? 'polite' : 'off' }), vis = h('div', { class: 'gf-vis' }), est = h('div', { class: 'gf-est' }), stats = h('div', { class: 'gf-stats' });
      const codEl = h('div', { class: 'cdarb-cod rep-cod gf-cod', role: 'region', 'aria-label': 'Código Python' }), det = h('details', { class: 'gf-det', open: true }, h('summary', { text: 'Código Python que se ejecuta' }), h('div', { class: 'gf-datos' }), codEl);
      raiz.append(tit, vis, msg, est, stats, det);
      const o = { T: null, V: null, lineas: [], el: raiz };
      o.montar = (T) => {
        o.T = T; U.vaciar(tit); tit.append(h('span', { text: G.ALGS[T.alg].nombre }), h('span', { class: 'gf-medalla', title: 'Estructura que usa y complejidad', text: G.ALGS[T.alg].estr + ' · ' + G.ALGS[T.alg].cx })); if (o.V) o.V.destruir();
        o.V = (S.g.tipo === 'rejilla' || S.g.tipo === 'mapa') ? lienzo(vis, S.g, S.escId) : visualSvg(vis, S.g, S, alClicNodo);
        if (o.V.cv) { o.V.cv.onclick = ev => { const i = o.V.nodoEn(ev); if (i >= 0 && !(S.g.muro && S.g.muro[i])) alClicNodo(i); }; o.V.cv.style.cursor = S.escId === 'islas' ? 'default' : 'crosshair'; }
        const cod = G.codigoDe(T.alg, { inverso: S.inverso }); U.vaciar(codEl); o.lineas = [];
        cod.forEach((ln, i) => { const f = h('div', { class: 'cl', 'data-l': i + 1 }, h('span', { class: 'cl-n', text: String(i + 1) }), h('span', { class: 'cl-m' }), h('span', { class: 'cl-c', html: (U.resaltarPy ? U.resaltarPy(ln) : U.esc(ln)) || ' ' })); codEl.appendChild(f); o.lineas.push(f); });
        const datos = det.querySelector('.gf-datos'); U.vaciar(datos);
        if (S.g.tipo !== 'rejilla' && S.g.tipo !== 'mapa' && S.g.n <= 26 && T.alg !== 'floyd' && T.alg !== 'bellman') datos.appendChild(h('pre', { class: 'code gf-grafo-py' }, h('code', { text: (G.ALGS[T.alg].cod.indexOf('dijkstra') === 0 || T.alg === 'astar' ? 'graph' : 'grafo') + ' = ' + G.aPython(S.g, S.g.ponderado && (T.alg === 'dijkstra' || T.alg === 'dijkstraHeap' || T.alg === 'astar')) })));
        else if (S.g.tipo === 'rejilla') datos.appendChild(h('p', { class: 'peq tenue', text: 'En la cuadrícula el «grafo» es implícito: los vecinos de una celda son las celdas libres de arriba, derecha, abajo e izquierda' + (S.g.ocho ? ' (y las 4 diagonales).' : '.') }));
        else if (S.g.tipo === 'mapa') datos.appendChild(h('p', { class: 'peq tenue', text: 'Cada intersección es un nodo; cada calle une dos nodos y pesa lo que mide.' }));
      };
      o.pintar = (k, dur) => {
        const T = o.T; if (!T) return; const kk = Math.min(k, T.pasos.length - 1), st = G.estadoEn(T, kk), fin = kk >= T.pasos.length - 1;
        o.V.pintar(st, T, { dur, nombre: G.ALGS[T.alg].corto });
        msg.innerHTML = U.mdInline(st.msg || '');
        const act = new Set(st.lin); o.lineas.forEach((l, i) => l.classList.toggle('act', act.has(i + 1)));
        const primera = Math.min(...st.lin); if (isFinite(primera) && o.lineas[primera - 1]) { const fa = o.lineas[primera - 1], top = fa.offsetTop, bot = top + fa.offsetHeight; if (top < codEl.scrollTop + 4 || bot > codEl.scrollTop + codEl.clientHeight - 4) codEl.scrollTop = Math.max(0, top - codEl.clientHeight / 2); }
        U.vaciar(est); est.appendChild(estructura(S.g, st, T));
        U.vaciar(stats);
        const info = G.ALGS[T.alg]; const nVis = st.exp;
        [chip((T.alg === 'generar' ? 'Habitaciones: ' : 'Explorados: ') + nVis + (S.g.n && S.escId !== 'islas' && T.alg !== 'bellman' && T.alg !== 'floyd' && T.alg !== 'generar' ? ' de ' + S.g.n : ''), T.alg === 'generar' ? 'Habitaciones que ya se visitaron al construir' : 'Nodos que el algoritmo ya procesó'), chip('Estructura: ' + info.estr), chip('Costo: ' + info.cx, 'Complejidad'),
          S.escId === 'islas' ? chip('Islas contadas: ' + st.islas) : null, st.camino.length > 1 ? chip('Camino: ' + (st.camino.length - 1) + ' aristas' + (S.g.ponderado ? ' · costo ' + fmt(G.pesoCamino(S.g, st.camino)) : '')) : null].filter(Boolean).forEach(c => stats.appendChild(c));
        if (fin && T.res.maxEstr) stats.appendChild(chip('Máx. ' + (info.estr.indexOf('Pila') === 0 ? 'pila' : 'cola/frontera') + ': ' + T.res.maxEstr, 'Mayor tamaño que alcanzó'));
      };
      o.destruir = () => { if (o.V) o.V.destruir(); raiz.remove(); };
      return o;
    }

    /* ---------- construir el grafo y las trazas ---------- */
    function parametros() { const p = { seed: S.seed }; S.esc.par.forEach(d => { p[d.k] = S.p[d.k] === undefined ? d.def : S.p[d.k]; }); return p; }
    function reconstruir() {
      parar(); S.g = S.esc.build(parametros()); S.ini = S.g.ini; S.fin = S.g.fin; if (S.escId === 'islas') { S.ini = -1; S.fin = -1; }
      S.orden = S.orden || S.esc.orden || 'asc'; if (S.esc.orden && S.ordenManual !== true) S.orden = S.esc.orden;
      const algs = algsDe(tab, S.escId, S.g);
      if (!S.alg || !algs.includes(S.alg)) S.alg = a0 && algs.includes(a0) && !S.alg ? a0 : algs[0];
      if (!S.algB || !algs.includes(S.algB) || S.algB === S.alg) S.algB = (b0 && algs.includes(b0) && b0 !== S.alg && !S.algB ? b0 : null) || algs.find(a => a !== S.alg && a === CFG.cmp) || algs.find(a => a !== S.alg) || algs[0];
      pintarControles(); recalcular();
    }
    function recalcular(auto) {
      parar();
      const g = S.g;
      if (S.escId !== 'islas' && S.fin < 0 && (S.alg === 'bidir' || (S.cmp && S.algB === 'bidir'))) S.fin = g.fin >= 0 && g.fin !== S.ini ? g.fin : (S.ini === g.n - 1 ? 0 : g.n - 1);   // la búsqueda bidireccional necesita destino
      g.ini = S.ini; g.fin = S.fin; nota.innerHTML = U.mdInline(S.esc.nota + ' **' + g.titulo + '**: ' + g.n + (g.tipo === 'rejilla' ? ' celdas' : ' nodos') + ', ' + (g.tipo === 'rejilla' ? (g.tierra ? g.tierra.reduce((a, b) => a + b, 0) + ' de tierra' : G.numAristas(g) + ' conexiones') : G.numAristas(g) + ' aristas') + '.');
      const algs = S.cmp ? [S.alg, S.algB] : [S.alg];
      const trazas = algs.map(a => { const o = { orden: S.orden, detalle: S.detalle && g.tipo !== 'rejilla' && g.tipo !== 'mapa', inverso: S.inverso, hpeso: S.hpeso }; return G.correr(a, g, a === 'bellman' || a === 'floyd' || a === 'islasBfs' || a === 'islasDfs' ? Math.max(0, S.ini) : S.ini, S.fin, o); });
      zonaPan.className = 'gf-pans' + (S.cmp && host.clientWidth >= 880 ? ' dos' : ''); while (paneles.length > trazas.length) paneles.pop().destruir();
      trazas.forEach((T, i) => { if (!paneles[i]) { paneles[i] = panel(i); zonaPan.appendChild(paneles[i].el); } paneles[i].montar(T); });
      P.max = Math.max(...trazas.map(T => T.pasos.length)) - 1; slider.max = String(P.max); zonaRes.classList.remove('lista');
      resumen(trazas); leyendaColores();
      const svgG = g.tipo !== 'rejilla' && g.tipo !== 'mapa';
      if (S.practica && !(svgG && !S.cmp && ['bfs', 'dfsRec', 'dfsIter'].indexOf(S.alg) >= 0)) S.practica = false;
      barra.style.display = S.practica ? 'none' : ''; zonaPrac.style.display = S.practica ? '' : 'none';
      ir(0, 0);
      if (S.practica) { S.pr = { ac: 0, er: 0, fallos: 0, pista: false }; pintarPractica(); }
      else if (P.vel === 'fin') ir(P.max, 0); else if (auto !== false) setTimeout(() => { if (!P.jugando && P.k === 0) alternar(); }, 250);
      limpiar.forEach(f => f()); limpiar = []; const rs = () => { zonaPan.classList.toggle('dos', S.cmp && host.clientWidth >= 880); paneles.forEach(p => { if (p.V && p.V.ajustar) { p.V.ajustar(); } }); paneles.forEach(p => p.pintar(P.k, 0)); };   // al cambiar el ancho se reajusta el lienzo y se vuelve a pintar el paso actual global.addEventListener('resize', rs); limpiar.push(() => global.removeEventListener('resize', rs));
    }
    /* ---------- modo práctica: tú eliges el siguiente nodo del recorrido ---------- */
    function siguienteVisita() { const T = paneles[0].T; for (let k = P.k + 1; k < T.pasos.length; k++) if (T.pasos[k].vis !== undefined) return { k, nodo: T.pasos[k].vis }; return null; }
    function pintarPractica() {
      U.vaciar(zonaPrac); if (!S.practica) return; const T = paneles[0].T, sig = siguienteVisita(), nombreAlg = S.alg === 'bfs' ? 'BFS' : 'DFS';
      const regla = S.alg === 'bfs' ? 'BFS **desencola el del frente de la cola** (y encola sus vecinos nuevos en el orden de su lista).' : (S.alg === 'dfsRec' ? 'DFS **baja al primer vecino no visitado** del nodo actual; si no quedan, **retrocede** al anterior y sigue con su siguiente vecino.' : 'El DFS iterativo **desapila el tope** (el último que entró); si ya estaba visitado lo descarta.');
      zonaPrac.appendChild(h('div', { class: 'gf-prac-t' }, h('b', { text: '🎯 Modo práctica' }), h('span', { class: 'gf-prac-c', html: U.mdInline('Aciertos: **' + S.pr.ac + '** · Errores: **' + S.pr.er + '**') }), h('button', { class: 'btn fantasma peq', type: 'button', onclick: () => { S.pr = { ac: 0, er: 0, fallos: 0, pista: false }; ir(0, 0); pintarPractica(); } }, '↺ Empezar de nuevo')));
      if (!sig) { zonaPrac.appendChild(h('p', { html: U.mdInline('🏁 **¡Recorrido completo!** Orden ' + nombreAlg + ': **' + T.res.orden.map(i => S.g.nom[i]).join(' → ') + '**. ' + (S.pr.er ? 'Tuviste ' + S.pr.er + ' error' + (S.pr.er === 1 ? '' : 'es') + ': repite hasta que salgan todos a la primera.' : '¡Sin ningún error!')) })); return; }
      zonaPrac.appendChild(h('p', { html: U.mdInline('Haz clic en el **siguiente nodo que visita ' + nombreAlg + '** (puedes mirar la ' + (S.alg === 'bfs' ? 'cola' : 'pila') + ' y la figura). ' + regla) }));
      if (S.pr.pista) zonaPrac.appendChild(h('p', { class: 'gf-prac-pista', html: U.mdInline('💡 La respuesta es **' + S.g.nom[sig.nodo] + '**. Haz clic en él para continuar.') }));
      else if (S.pr.fallos >= 2) zonaPrac.appendChild(h('button', { class: 'btn sec peq', type: 'button', onclick: () => { S.pr.pista = true; pintarPractica(); } }, '💡 Mostrar la respuesta'));
    }
    function practicar(i) {
      const sig = siguienteVisita(); if (!sig) return; const T = paneles[0].T, st = G.estadoEn(T, P.k);
      if (i === sig.nodo) { S.pr.ac++; S.pr.fallos = 0; S.pr.pista = false; ir(sig.k); pintarPractica(); return; }
      S.pr.er++; S.pr.fallos++; S.pr.pista = false;
      const visitado = st.ord[i] > 0 || st.est[i] === E.HECHO;
      Vc.toast((visitado ? S.g.nom[i] + ' ya está visitado. ' : 'No es ' + S.g.nom[i] + '. ') + (S.alg === 'bfs' ? 'Mira el frente de la cola.' : (S.alg === 'dfsIter' ? 'Mira el tope de la pila.' : 'Baja al primer vecino sin visitar.')));
      pintarPractica();
    }
    function alClicNodo(i) {
      if (S.practica) { practicar(i); return; }
      if (S.escId === 'islas') return;
      if (S.modoClic === 'ini') { if (i !== S.fin) S.ini = i; } else if (S.g.tipo === 'svg' || S.g.tipo === 'arbol' || S.g.tipo === 'red' || S.g.tipo === 'ciudades') { if (S.fin === i) S.fin = -1; else if (i !== S.ini) S.fin = i; } else { if (i !== S.ini) S.fin = i; }
      pintarControles(); recalcular();
    }

    /* ---------- resumen y comparación ---------- */
    function resumen(trazas) {
      U.vaciar(zonaRes); const g = S.g;
      const filas = [['Nodos explorados', T => String(T.res.exp !== undefined ? T.res.exp : '—')], ['Pasos de la animación', T => String(T.pasos.length)],
        ['Camino hallado', T => T.res.camino && T.res.camino.length ? (T.res.camino.length - 1) + ' aristas' + (g.ponderado ? ' · costo ' + fmt(T.res.costo) : '') : (S.fin < 0 ? '—' : 'ninguno')],
        ['Mayor tamaño de la ' + (trazas[0].res.estructura || 'estructura'), T => T.res.maxEstr ? String(T.res.maxEstr) : '—'], ['¿Garantiza el camino de menor ' + (g.ponderado ? 'costo' : 'número de saltos') + '?', T => G.ALGS[T.alg].camino]];
      if (S.escId === 'islas') { zonaRes.appendChild(h('p', { html: NEGRITA('**Resultado:** ' + trazas[0].res.islas + ' isla' + (trazas[0].res.islas === 1 ? '' : 's') + ' (tamaños: ' + trazas[0].res.tamanos.join(', ') + '). Con BFS y con DFS el número es el mismo; cambia el orden en que se marca cada isla.') })); if (!S.cmp) return; }
      const tabla = h('table', { class: 'gf-tabla gf-comp' }, h('thead', null, h('tr', null, h('th', { text: '' }), trazas.map(T => h('th', { text: G.ALGS[T.alg].corto })))), h('tbody', null, filas.map(([n, f]) => h('tr', null, h('th', { scope: 'row', text: n }), trazas.map(T => h('td', { text: f(T) }))))));
      let veredicto = '';
      if (trazas.length === 2 && S.fin >= 0 && S.escId !== 'islas') {
        const [a, b] = trazas, na = G.ALGS[a.alg].corto, nb = G.ALGS[b.alg].corto, ea = a.res.exp, eb = b.res.exp;
        const ca = a.res.camino && a.res.camino.length ? a.res.camino.length - 1 : null, cb = b.res.camino && b.res.camino.length ? b.res.camino.length - 1 : null, costA = a.res.costo, costB = b.res.costo;
        veredicto = '**¿Cuál sale primero?** ' + (ea === eb ? na + ' y ' + nb + ' exploran la misma cantidad de nodos (' + ea + ').' : (ea < eb ? na : nb) + ' llega al destino explorando **' + Math.min(ea, eb) + '** nodos; ' + (ea < eb ? nb : na) + ' explora **' + Math.max(ea, eb) + '**.') +
          (ca !== null && cb !== null ? (g.ponderado && costA !== undefined && costB !== undefined && costA !== costB ? ' El camino de ' + (costA < costB ? na : nb) + ' es el de **menor costo** (' + fmt(Math.min(costA, costB)) + ' frente a ' + fmt(Math.max(costA, costB)) + ').' : (ca === cb ? ' Los dos caminos tienen **' + ca + '** aristas.' : ' El camino de ' + (ca < cb ? na : nb) + ' es más corto (**' + Math.min(ca, cb) + '** frente a **' + Math.max(ca, cb) + '** aristas).')) : '');
      } else if (trazas.length === 1 && trazas[0].res.camino && trazas[0].res.camino.length && S.escId !== 'islas') veredicto = '**Resultado:** ' + G.ALGS[trazas[0].alg].corto + ' halló un camino de ' + (trazas[0].res.camino.length - 1) + ' aristas' + (g.ponderado ? ' y costo ' + fmt(trazas[0].res.costo) : '') + ' explorando ' + trazas[0].res.exp + ' nodos.';
      if (veredicto) zonaRes.appendChild(h('p', { class: 'gf-veredicto', html: NEGRITA(veredicto) }));
      if (trazas.length === 2 || S.escId !== 'islas') zonaRes.appendChild(h('div', { class: 'gf-scroll' }, tabla));
    }
    function leyendaColores() {
      U.vaciar(leyenda); const rej = S.g.tipo === 'rejilla' || S.g.tipo === 'mapa', isl = S.escId === 'islas';
      const it = (cls, t) => h('span', { class: 'gf-li' }, h('i', { class: 'gf-sw ' + cls }), t);
      if (isl) leyenda.append(it('agua', 'agua'), it('tierra', 'tierra sin visitar'), it('isla0', 'isla marcada (un color por isla)'), it('actual', 'celda que se procesa'));
      else leyenda.append(it('ini', 'origen'), it('fin', 'destino'), it(rej ? 'cola-c' : 'cola', 'en la ' + (S.alg === 'dfsRec' || S.alg === 'dfsIter' ? 'pila' : 'cola / frontera')), it(rej ? 'hecho-c' : 'hecho', 'explorado / procesado'), it('camino', 'camino')); if (S.alg === 'bidir' || (S.cmp && S.algB === 'bidir')) leyenda.append(it('dos', 'frente del destino'));
    }

    /* ---------- controles ---------- */
    function pintarControles() {
      U.vaciar(filaEsc); CFG.escenas.forEach(id => { const e = ESCENAS[id]; filaEsc.appendChild(h('button', { type: 'button', role: 'radio', 'aria-checked': id === S.escId ? 'true' : 'false', class: 'gf-card' + (id === S.escId ? ' act' : ''), onclick: () => { S.escId = id; S.esc = e; S.p = {}; S.alg = null; S.algB = null; S.seed = U.newSeed(); S.ordenManual = false; S.orden = null; S.detalle = false; S.modoClic = 'fin'; reconstruir(); } }, h('span', { class: 'gf-ic', 'aria-hidden': 'true', text: e.ic }), h('span', { class: 'gf-nm', text: e.t }))); });
      U.vaciar(zonaPar);
      S.esc.par.forEach(d => {
        const v = S.p[d.k] === undefined ? d.def : S.p[d.k], out = h('output', { class: 'gf-out', text: String(v) + d.unid });
        if (d.k === 'ocho') { const sel = h('select', { 'aria-label': d.t }, h('option', { value: '4', text: '4 (arriba, abajo, izquierda, derecha)' }), h('option', { value: '8', text: '8 (con diagonales)' })); sel.value = String(v); sel.addEventListener('change', () => { S.p.ocho = +sel.value; reconstruir(); }); zonaPar.appendChild(h('label', { class: 'gf-par' }, h('span', { text: d.t }), sel)); return; }
        const r = h('input', { type: 'range', min: d.min, max: d.max, step: d.paso, value: v, 'aria-label': d.t });
        r.addEventListener('input', () => { out.textContent = r.value + d.unid; });
        r.addEventListener('change', () => { S.p[d.k] = +r.value; reconstruir(); });
        zonaPar.appendChild(h('label', { class: 'gf-par' }, h('span', { text: d.t }), r, out));
      });
      if (S.esc.par.length || ['pond'].includes(S.escId)) zonaPar.appendChild(h('button', { class: 'btn sec peq', type: 'button', title: 'Genera otro ' + S.esc.t.toLowerCase() + ' con los mismos tamaños', onclick: () => { S.seed = U.newSeed(); reconstruir(); } }, S.escId === 'laberinto' ? '🎲 Nuevo laberinto' : '🎲 Otro'));
      U.vaciar(zonaAlg); const algs = algsDe(tab, S.escId, S.g);
      const selA = h('select', { 'aria-label': 'Algoritmo' }, algs.map(a => h('option', { value: a, text: G.ALGS[a].nombre }))); selA.value = S.alg; selA.addEventListener('change', () => { S.alg = selA.value; if (S.algB === S.alg) S.algB = algs.find(a => a !== S.alg); pintarControles(); recalcular(); });
      zonaAlg.appendChild(h('label', { class: 'gf-par' }, h('span', { text: 'Algoritmo' }), selA));
      if (S.escId !== 'islas' || true) {
        const chk = h('input', { type: 'checkbox' }); chk.checked = S.cmp; chk.addEventListener('change', () => { S.cmp = chk.checked; pintarControles(); recalcular(); });
        zonaAlg.appendChild(h('label', { class: 'check gf-chk' }, chk, h('span', null, h('strong', { text: 'Comparar' }), ' con otro algoritmo lado a lado')));
        if (S.cmp) { const selB = h('select', { 'aria-label': 'Segundo algoritmo' }, algs.filter(a => a !== S.alg).map(a => h('option', { value: a, text: G.ALGS[a].nombre }))); selB.value = S.algB; selB.addEventListener('change', () => { S.algB = selB.value; recalcular(); }); zonaAlg.appendChild(h('label', { class: 'gf-par' }, h('span', { text: 'Contra' }), selB)); }
      }
      if (S.escId !== 'islas') {
        const svgG = S.g.tipo !== 'rejilla' && S.g.tipo !== 'mapa';
        if (svgG) { const ns = S.g.nom.map((s, i) => [i, S.g.tipo === 'red' || S.g.tipo === 'ciudades' || S.g.tipo === 'ciudades' ? s : s]);
          const selI = h('select', { 'aria-label': 'Origen' }, ns.map(([i, s]) => h('option', { value: String(i), text: s }))); selI.value = String(Math.max(0, S.ini)); selI.addEventListener('change', () => { const v = +selI.value; if (v === S.fin) S.fin = -1; S.ini = v; pintarControles(); recalcular(); });
          const selF = h('select', { 'aria-label': 'Destino' }, [h('option', { value: '-1', text: '(sin destino: explorar todo)' })].concat(ns.map(([i, s]) => h('option', { value: String(i), text: s })))); selF.value = String(S.fin); selF.addEventListener('change', () => { S.fin = +selF.value; recalcular(); });
          zonaAlg.append(h('label', { class: 'gf-par' }, h('span', { text: 'Origen' }), selI), h('label', { class: 'gf-par' }, h('span', { text: 'Destino' }), selF)); }
        else { const mk = (v, t) => { const r = h('input', { type: 'radio', name: 'gfclic' + tab, value: v }); r.checked = S.modoClic === v; r.addEventListener('change', () => { S.modoClic = v; }); return h('label', { class: 'fila peq' }, r, t); };
          zonaAlg.appendChild(h('div', { class: 'gf-par gf-clic' }, h('span', { text: 'Un clic en el lienzo mueve:' }), mk('fin', 'el destino (rojo)'), mk('ini', 'el origen (verde)'))); }
        if (S.alg === 'bfs' || S.alg === 'dfsRec' || S.alg === 'dfsIter' || (S.cmp && (S.algB === 'dfsRec' || S.algB === 'dfsIter' || S.algB === 'bfs'))) {
          const selO = h('select', { 'aria-label': 'Orden de los vecinos' }, h('option', { value: 'asc', text: 'Vecinos como están (alfabético)' }), h('option', { value: 'desc', text: 'Vecinos al revés' }), h('option', { value: 'azar', text: 'Vecinos en orden al azar (fijo)' }));
          selO.value = S.orden; selO.addEventListener('change', () => { S.orden = selO.value; S.ordenManual = true; recalcular(); }); zonaAlg.appendChild(h('label', { class: 'gf-par' }, h('span', { text: 'Orden de exploración' }), selO));
        }
        if (S.alg === 'dfsIter' || (S.cmp && S.algB === 'dfsIter')) { const c = h('input', { type: 'checkbox' }); c.checked = S.inverso; c.addEventListener('change', () => { S.inverso = c.checked; recalcular(); }); zonaAlg.appendChild(h('label', { class: 'check gf-chk' }, c, h('span', null, h('strong', { text: 'Apilar al revés' }), ' (así sale primero el 1.er vecino, como en el recursivo)'))); }
        if (S.alg === 'astar' || (S.cmp && S.algB === 'astar')) { const selH = h('select', { 'aria-label': 'Heurística' }, h('option', { value: '1', text: 'h admisible (distancia recta / Manhattan)' }), h('option', { value: '0', text: 'h = 0 (A* = Dijkstra)' }), h('option', { value: '3', text: 'h × 3 (sobrestima: NO admisible)' })); selH.value = String(S.hpeso); selH.addEventListener('change', () => { S.hpeso = +selH.value; recalcular(); }); zonaAlg.appendChild(h('label', { class: 'gf-par' }, h('span', { text: 'Heurística de A*' }), selH)); }
        if (svgG && !S.cmp && ['bfs', 'dfsRec', 'dfsIter'].indexOf(S.alg) >= 0) { const c = h('input', { type: 'checkbox' }); c.checked = !!S.practica; c.addEventListener('change', () => { S.practica = c.checked; if (S.practica) S.detalle = false; pintarControles(); recalcular(false); }); zonaAlg.appendChild(h('label', { class: 'check gf-chk' }, c, h('span', null, h('strong', { text: '🎯 Practicar' }), ' (tú eliges el siguiente nodo)'))); }
        if (svgG && S.alg !== 'floyd' && !S.practica) { const c = h('input', { type: 'checkbox' }); c.checked = S.detalle; c.addEventListener('change', () => { S.detalle = c.checked; recalcular(); }); zonaAlg.appendChild(h('label', { class: 'check gf-chk' }, c, h('span', null, h('strong', { text: 'Paso fino' }), ' (una arista por paso)'))); }
      }
    }
    reconstruir();
    return () => { parar(); limpiar.forEach(f => f()); paneles.forEach(p => p.destruir()); };
  }
  LE.grafos = (host, q) => montar(host, q || {}, 'grafos');
  LE.caminos = (host, q) => montar(host, q || {}, 'caminos');
})(typeof window !== 'undefined' ? window : globalThis);
