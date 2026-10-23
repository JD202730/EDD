/* arboles.js — árboles binarios: operaciones (BST/AVL), notación, generadores, dibujo SVG y animaciones.
   Convenciones del curso: altura en aristas (hoja = 0, vacío = -1); factor = alt(izq) - alt(der). */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const U = ET.U;

  const Arb = {};

  /* ---------- estructura básica ---------- */
  const N = (v, l, r) => ({ v, l: l || null, r: r || null });
  const altura = n => n ? 1 + Math.max(altura(n.l), altura(n.r)) : -1;
  const factor = n => n ? altura(n.l) - altura(n.r) : 0;
  const tam = n => n ? 1 + tam(n.l) + tam(n.r) : 0;
  const hojas = n => !n ? 0 : (!n.l && !n.r ? 1 : hojas(n.l) + hojas(n.r));
  const pre = (n, o = []) => { if (n) { o.push(n.v); pre(n.l, o); pre(n.r, o); } return o; };
  const ino = (n, o = []) => { if (n) { ino(n.l, o); o.push(n.v); ino(n.r, o); } return o; };
  const post = (n, o = []) => { if (n) { post(n.l, o); post(n.r, o); o.push(n.v); } return o; };
  const niveles = n => { const o = [], q = n ? [n] : []; while (q.length) { const x = q.shift(); o.push(x.v); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } return o; };
  const copia = n => n ? { v: n.v, l: copia(n.l), r: copia(n.r) } : null;
  const igual = (a, b) => (!a && !b) || (!!a && !!b && String(a.v) === String(b.v) && igual(a.l, b.l) && igual(a.r, b.r));
  const num = v => (typeof v === 'number' ? v : (/^-?\d+(\.\d+)?$/.test(String(v)) ? Number(v) : String(v)));
  const lt = (a, b) => { a = num(a); b = num(b); return a < b; };
  const kk = n => (n.k !== undefined ? String(n.k) : String(n.v));
  const nodos = (n, o = []) => { if (n) { nodos(n.l, o); o.push(n); nodos(n.r, o); } return o; };
  const profundidades = (n, d = 0, m = new Map()) => { if (n) { m.set(String(n.v), d); profundidades(n.l, d + 1, m); profundidades(n.r, d + 1, m); } return m; };
  const buscarNodo = (n, v) => { while (n) { if (String(n.v) === String(v)) return n; n = lt(v, n.v) ? n.l : n.r; } return null; };
  /** busca por valor en cualquier árbol (no necesariamente BST) */
  const hallar = (n, v) => { if (!n) return null; if (String(n.v) === String(v)) return n; return hallar(n.l, v) || hallar(n.r, v); };
  const camino = (n, v) => { const p = []; while (n) { p.push(n.v); if (String(n.v) === String(v)) break; n = lt(v, n.v) ? n.l : n.r; } return p; };

  /* ---------- notación 20(10,30) ---------- */
  function nota(n) {
    if (!n) return '_';
    const f = x => {
      if (!x) return '';
      if (!x.l && !x.r) return String(x.v);
      return String(x.v) + '(' + f(x.l) + ',' + f(x.r) + ')';
    };
    return f(n);
  }
  function parse(src) {
    let s = String(src == null ? '' : src).replace(/\s+/g, '');
    if (s === '' || s === '_' || s === '∅' || /^none$/i.test(s)) return null;
    let i = 0;
    const fail = m => { throw new Error(m); };
    function arbol(requerido) {
      let j = i;
      while (j < s.length && !'(),'.includes(s[j])) j++;
      let tok = s.slice(i, j);
      if (tok === '_' || tok === '∅' || tok === '') {
        if (tok === '' && requerido && (s[j] === '(')) fail('Falta el valor del nodo antes de "(".');
        i = j; return null;
      }
      i = j;
      const node = { v: num(tok), l: null, r: null };
      if (s[i] === '(') {
        i++;
        node.l = arbol(false);
        if (s[i] !== ',') fail('Cada nodo con hijos se escribe valor(izq,der). Si falta un hijo deja su lugar vacío o usa _ : por ejemplo 20(10,) o 20(,30).');
        i++;
        node.r = arbol(false);
        if (s[i] !== ')') fail('Falta cerrar un paréntesis ")".');
        i++;
      }
      return node;
    }
    const t = arbol(true);
    if (i < s.length) fail('Sobran caracteres cerca de "' + s.slice(i, i + 6) + '". Revisa paréntesis y comas.');
    // valores repetidos
    const vs = pre(t); if (new Set(vs.map(String)).size !== vs.length) fail('Hay valores repetidos: en este entrenador cada nodo tiene un valor distinto.');
    return t;
  }
  const lista = a => '[' + a.map(String).join(', ') + ']';

  /* ---------- propiedades ---------- */
  function esBST(n, lo, hi) {
    if (!n) return true;
    if (lo !== undefined && !lt(lo, n.v)) return false;
    if (hi !== undefined && !lt(n.v, hi)) return false;
    return esBST(n.l, lo, n.v) && esBST(n.r, n.v, hi);
  }
  /** nodos que violan la propiedad AVL (|f|>=2), del más profundo al más superficial */
  function desbalanceados(n) {
    const out = []; const prof = profundidades(n);
    nodos(n).forEach(x => { if (Math.abs(factor(x)) >= 2) out.push(x); });
    out.sort((a, b) => prof.get(String(b.v)) - prof.get(String(a.v)));
    return out;
  }
  const esAVL = n => esBST(n) && desbalanceados(n).length === 0;
  function tipoArbol(n) {
    if (!n) return { lleno: true, completo: true, perfecto: true };
    const lleno = nodos(n).every(x => (!x.l && !x.r) || (x.l && x.r));
    // completo: recorrido por niveles sin huecos
    let completo = true, visto = false;
    const q = [n];
    while (q.length) {
      const x = q.shift();
      for (const h of [x.l, x.r]) {
        if (h) { if (visto) completo = false; q.push(h); } else visto = true;
      }
    }
    const h = altura(n);
    const perfecto = lleno && nodos(n).filter(x => !x.l && !x.r).every(x => profundidades(n).get(String(x.v)) === h);
    return { lleno, completo, perfecto };
  }

  /* ---------- BST ---------- */
  function insBST(t, v) {
    if (!t) return N(v);
    if (String(v) === String(t.v)) return t;
    return lt(v, t.v) ? { v: t.v, l: insBST(t.l, v), r: t.r } : { v: t.v, l: t.l, r: insBST(t.r, v) };
  }
  const minimo = n => { while (n && n.l) n = n.l; return n; };
  const maximo = n => { while (n && n.r) n = n.r; return n; };
  /** eliminación BST. modo 'pred' (S6-C2: mayor del izquierdo) o 'suc' (S7-C1: menor del derecho) */
  function delBST(t, v, modo) {
    if (!t) return null;
    if (String(v) === String(t.v)) {
      if (!t.l) return t.r;
      if (!t.r) return t.l;
      if (modo === 'suc') { const s = minimo(t.r); return { v: s.v, l: t.l, r: delBST(t.r, s.v, modo) }; }
      const p = maximo(t.l); return { v: p.v, l: delBST(t.l, p.v, modo), r: t.r };
    }
    return lt(v, t.v) ? { v: t.v, l: delBST(t.l, v, modo), r: t.r } : { v: t.v, l: t.l, r: delBST(t.r, v, modo) };
  }
  function insertarSecuencia(vals) { let t = null; for (const v of vals) t = insBST(t, v); return t; }

  /* ---------- rotaciones y AVL ---------- */
  const rotDer = y => ({ v: y.l.v, l: y.l.l, r: { v: y.v, l: y.l.r, r: y.r } });
  const rotIzq = x => ({ v: x.r.v, l: { v: x.v, l: x.l, r: x.r.l }, r: x.r.r });
  function reemplazar(t, v, nuevo) {
    if (!t) return null;
    if (String(t.v) === String(v)) return nuevo;
    return lt(v, t.v) ? { v: t.v, l: reemplazar(t.l, v, nuevo), r: t.r } : { v: t.v, l: t.l, r: reemplazar(t.r, v, nuevo) };
  }
  /** reemplaza por posición (sirve en árboles no-BST y tras copiar valores) */
  function reemplazarPorValor(t, v, nuevo) {
    if (!t) return null;
    if (String(t.v) === String(v)) return nuevo;
    return { v: t.v, l: reemplazarPorValor(t.l, v, nuevo), r: reemplazarPorValor(t.r, v, nuevo) };
  }
  function casoDe(u) {
    const f = factor(u);
    if (f > 1) return factor(u.l) >= 0 ? 'LL' : 'LR';
    if (f < -1) return factor(u.r) <= 0 ? 'RR' : 'RL';
    return null;
  }
  const NOMBRE_CASO = { LL: 'Izq-Izq', RR: 'Der-Der', LR: 'Izq-Der', RL: 'Der-Izq' };
  const ROT_CASO = { LL: '1 rotación derecha', RR: '1 rotación izquierda', LR: 'rotación izquierda del hijo izquierdo y luego derecha', RL: 'rotación derecha del hijo derecho y luego izquierda' };
  /** repite: corrige el nodo desbalanceado más profundo hasta que no quede ninguno. Devuelve {arbol, pasos[]} con snapshots. */
  function rebalancear(t) {
    const pasos = [];
    let guard = 0;
    while (guard++ < 60) {
      const bad = desbalanceados(t);
      if (!bad.length) break;
      const u = bad[0]; const caso = casoDe(u);
      const antes = t;
      if (caso === 'LL') { t = reemplazarPorValor(t, u.v, rotDer(u)); pasos.push({ tipo: 'rot', rot: 'derecha', sobre: u.v, caso, antes, despues: t, factor: factor(u) }); }
      else if (caso === 'RR') { t = reemplazarPorValor(t, u.v, rotIzq(u)); pasos.push({ tipo: 'rot', rot: 'izquierda', sobre: u.v, caso, antes, despues: t, factor: factor(u) }); }
      else if (caso === 'LR') {
        const c = u.l; const mid = reemplazarPorValor(t, c.v, rotIzq(c));
        pasos.push({ tipo: 'rot', rot: 'izquierda', sobre: c.v, caso, parte: 1, antes, despues: mid, factor: factor(u), nodoDesbalanceado: u.v });
        const u2 = hallar(mid, u.v);
        t = reemplazarPorValor(mid, u.v, rotDer(u2));
        pasos.push({ tipo: 'rot', rot: 'derecha', sobre: u.v, caso, parte: 2, antes: mid, despues: t, factor: factor(u), nodoDesbalanceado: u.v });
      } else {
        const c = u.r; const mid = reemplazarPorValor(t, c.v, rotDer(c));
        pasos.push({ tipo: 'rot', rot: 'derecha', sobre: c.v, caso, parte: 1, antes, despues: mid, factor: factor(u), nodoDesbalanceado: u.v });
        const u2 = hallar(mid, u.v);
        t = reemplazarPorValor(mid, u.v, rotIzq(u2));
        pasos.push({ tipo: 'rot', rot: 'izquierda', sobre: u.v, caso, parte: 2, antes: mid, despues: t, factor: factor(u), nodoDesbalanceado: u.v });
      }
    }
    return { arbol: t, pasos };
  }
  /** inserción AVL con registro: {arbol, bst (sin rebalancear), nuevo, ruta, pasos, primerDesbalanceado, caso} */
  function insAVL(t, v) {
    const existe = !!buscarNodo(t, v);
    if (existe) return { arbol: t, bst: t, nuevo: v, ruta: camino(t, v), pasos: [], duplicado: true };
    const bst = insBST(t, v);
    const ruta = camino(bst, v);
    const bad = desbalanceados(bst);
    const reb = rebalancear(bst);
    return { arbol: reb.arbol, bst, nuevo: v, ruta, pasos: reb.pasos, primerDesbalanceado: bad.length ? bad[0].v : null, caso: bad.length ? casoDe(bad[0]) : null, factores: bad.length ? factor(bad[0]) : 0 };
  }
  function delAVL(t, v, modo) {
    if (!buscarNodo(t, v)) return { arbol: t, bst: t, pasos: [], noEncontrado: true };
    const bst = delBST(t, v, modo || 'suc');
    const reb = rebalancear(bst);
    return { arbol: reb.arbol, bst, pasos: reb.pasos, eliminado: v };
  }
  function construirAVL(vals) {
    let t = null; const hist = [];
    for (const v of vals) { const r = insAVL(t, v); hist.push(r); t = r.arbol; }
    return { arbol: t, hist };
  }

  /* ---------- reconstrucción desde recorridos ---------- */
  function desdePreIn(preA, inA) {
    if (!preA.length) return null;
    const raiz = preA[0]; const k = inA.map(String).indexOf(String(raiz));
    if (k < 0) throw new Error('Recorridos inconsistentes');
    return { v: raiz, l: desdePreIn(preA.slice(1, 1 + k), inA.slice(0, k)), r: desdePreIn(preA.slice(1 + k), inA.slice(k + 1)) };
  }
  function desdePostIn(postA, inA) {
    if (!postA.length) return null;
    const raiz = postA[postA.length - 1]; const k = inA.map(String).indexOf(String(raiz));
    if (k < 0) throw new Error('Recorridos inconsistentes');
    return { v: raiz, l: desdePostIn(postA.slice(0, k), inA.slice(0, k)), r: desdePostIn(postA.slice(k, postA.length - 1), inA.slice(k + 1)) };
  }

  /* ---------- generadores ---------- */
  const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  /** forma aleatoria con n nodos; devuelve árbol con valores null (se etiquetan después) */
  function forma(rng, n, balance) {
    if (n <= 0) return null;
    let nl;
    if (balance) { const base = Math.floor((n - 1) / 2); nl = Math.max(0, Math.min(n - 1, base + rng.int(-1, 1))); }
    else nl = rng.int(0, n - 1);
    return { v: null, l: forma(rng, nl, balance), r: forma(rng, n - 1 - nl, balance) };
  }
  function etiquetarNiveles(t, valores) {
    const q = t ? [t] : []; let i = 0;
    while (q.length) { const x = q.shift(); x.v = valores[i++]; if (x.l) q.push(x.l); if (x.r) q.push(x.r); }
    return t;
  }
  /** árbol binario genérico con letras A, B, C... asignadas por niveles */
  function aleatorio(rng, n, opts) {
    opts = opts || {};
    let t = forma(rng, n, opts.balance !== false && rng.chance(0.6));
    const vals = opts.valores || LETRAS.slice(0, n).split('');
    return etiquetarNiveles(t, vals);
  }
  function llenoAleatorio(rng, nInternos) {   // lleno: cada nodo 0 o 2 hijos; nInternos nodos internos
    if (nInternos === 0) return { v: null, l: null, r: null };
    const a = rng.int(0, nInternos - 1);
    return { v: null, l: llenoAleatorio(rng, a), r: llenoAleatorio(rng, nInternos - 1 - a) };
  }
  function completoDe(n) {         // completo de n nodos (indexación de heap)
    const mk = i => i <= n ? { v: null, l: mk(2 * i), r: mk(2 * i + 1) } : null;
    return mk(1);
  }
  function perfectoDe(h) {
    const mk = d => d > h ? null : { v: null, l: mk(d + 1), r: mk(d + 1) };
    return mk(0);
  }
  /** BST con altura objetivo aproximada usando valores únicos de [lo,hi] */
  function bstAleatorio(rng, n, lo, hi, balanceado) {
    const vals = rng.distinct(n, lo, hi);
    if (balanceado) {
      const s = vals.slice().sort((a, b) => a - b);
      const orden = [];
      (function med(a, b) { if (a > b) return; const m = (a + b) >> 1; orden.push(s[m]); med(a, m - 1); med(m + 1, b); })(0, s.length - 1);
      return { arbol: insertarSecuencia(orden), secuencia: orden };
    }
    return { arbol: insertarSecuencia(vals), secuencia: vals };
  }
  /** secuencia de inserción que provoca (al menos) un caso concreto en un AVL pequeño, a partir de base */
  function secuenciaCaso(caso, rng) {
    // tres nodos raíz-hijo-nieto con subárboles extra opcionales
    const a = rng.int(10, 40), b = a + rng.int(10, 20), c = b + rng.int(10, 20);
    const bajo = rng.int(0, a - 2) + 1;
    switch (caso) {
      case 'LL': return [c, b, a];
      case 'RR': return [a, b, c];
      case 'LR': return [c, a, b];
      default: return [a, c, b];
    }
  }

  /* ---------- dibujo SVG ---------- */
  function layout(t) {
    const pos = new Map(); let i = 0, maxD = 0;
    (function rec(n, d) { if (!n) return; rec(n.l, d + 1); pos.set(kk(n), { x: i++, y: d, node: n }); if (d > maxD) maxD = d; rec(n.r, d + 1); })(t, 0);
    return { pos, ancho: i, prof: maxD };
  }
  const CFG = { dx: 44, dy: 54, r: 17, pad: 24 };
  function geom(opts) {
    if (opts && opts.geom) return Object.assign({}, CFG, opts.geom);
    if (opts && opts.compacto) return { dx: 34, dy: 44, r: 14, pad: 18 };
    return CFG;
  }
  /** tamaño del lienzo: admite margen horizontal, desplazamiento vertical (bandeja) y niveles extra (huecos) */
  function medidas(g, anchoN, prof, opts) {
    const mx = (opts && opts.margenX) || 0, oy = (opts && opts.offsetY) || 0, ex = (opts && opts.extraNiveles) || 0;
    return {
      W: Math.max(1, anchoN) * g.dx + g.pad * 2 - g.dx + g.r * 2 + mx * 2,
      H: (prof + 1 + ex) * g.dy + g.pad * 2 - g.dy + g.r * 2 + oy + ((opts && opts.etiquetas) ? 8 : 0),
      X: p => g.pad + g.r + mx + p.x * g.dx, Y: p => g.pad + g.r + oy + p.y * g.dy
    };
  }
  const etiquetaNodo = (n, modo) => {
    if (modo === 'factor') { const f = factor(n); return (f > 0 ? '+' : '') + f; }
    if (modo === 'altura') return 'h=' + altura(n);
    if (modo === 'profundidad') return '';
    return '';
  };

  /** Dibuja el árbol en host. opts: {etiquetas, clases:{valor:'clase'}, onClick, compacto, vacio, flechas} */
  function dibujar(host, t, opts) {
    opts = opts || {};
    const g = geom(opts);
    U.vaciar(host);
    host.classList.add('arbol-host');
    const L = layout(t);
    if (!t) {
      host.appendChild(U.h('div', { class: 'arbol-vacio', text: opts.vacio || 'Árbol vacío' }));
      return { svg: null, nodos: new Map(), resaltar() { }, limpiar() { } };
    }
    const { W, H, X, Y } = medidas(g, L.ancho, L.prof, opts);
    const svg = U.svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'arbol-svg', role: 'img', 'aria-label': 'Diagrama de árbol: ' + nota(t) });
    svg.style.width = Math.min(W, opts.maxAncho || 760) + 'px';
    svg.style.maxWidth = '100%';
    if (opts.sinReducir) { svg.style.width = W + 'px'; svg.style.maxWidth = 'none'; }   // árboles grandes: tamaño real, con desplazamiento
    const gEdges = U.svgEl('g', { class: 'aristas' }); const gNodes = U.svgEl('g', { class: 'nodos' });
    svg.appendChild(gEdges); svg.appendChild(gNodes);
    const refs = new Map();
    L.pos.forEach((p, key) => {
      const n = p.node;
      for (const [h, lado] of [[n.l, 'l'], [n.r, 'r']]) {
        if (!h) continue; const q = L.pos.get(kk(h));
        const ln = U.svgEl('line', { x1: X(p), y1: Y(p), x2: X(q), y2: Y(q), class: 'arista' });
        gEdges.appendChild(ln);
      }
    });
    L.pos.forEach((p, key) => {
      const n = p.node;
      const gr = U.svgEl('g', { class: 'nodo' + (opts.clases && opts.clases[key] ? ' ' + opts.clases[key] : '') + (opts.onClick ? ' clic' : ''), transform: 'translate(' + X(p) + ',' + Y(p) + ')', 'data-v': key });
      const c = U.svgEl('circle', { r: g.r, cx: 0, cy: 0 });
      const tx = U.svgEl('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); tx.textContent = String(n.v);
      if (String(n.v).length > 2) tx.setAttribute('class', 'largo');
      gr.appendChild(c); gr.appendChild(tx);
      if (opts.etiquetas) {
        const e = etiquetaNodo(n, opts.etiquetas);
        if (e) { const lb = U.svgEl('text', { x: g.r + 3, y: g.r + 1, class: 'etq ' + (opts.etiquetas === 'factor' && Math.abs(factor(n)) >= 2 ? 'mala' : ''), 'text-anchor': 'start' }); lb.textContent = e; gr.appendChild(lb); }
      }
      if (opts.etqNodo) { const e = opts.etqNodo(n, key); if (e) { const lb2 = U.svgEl('text', { x: g.r + 3, y: g.r + 1, class: 'etq ' + (/!$/.test(e) ? 'mala' : ''), 'text-anchor': 'start' }); lb2.textContent = String(e).replace(/!$/, ''); gr.appendChild(lb2); } }
      if (opts.tags && opts.tags[key]) { const tg = U.svgEl('text', { x: 0, y: -g.r - 5, class: 'tag', 'text-anchor': 'middle' }); tg.textContent = opts.tags[key]; gr.appendChild(tg); }
      if (opts.onClick) { gr.addEventListener('click', () => opts.onClick(n.v, key)); gr.setAttribute('tabindex', '0'); gr.setAttribute('role', 'button'); gr.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); opts.onClick(n.v, key); } }); }
      gNodes.appendChild(gr); refs.set(key, gr);
    });
    host.appendChild(svg);
    return {
      svg, nodos: refs, X, Y, L, g, W, H,
      resaltar(v, clase, on) { const e = refs.get(String(v)); if (e) e.classList.toggle(clase, on !== false); },
      limpiar(clases) { refs.forEach(e => (clases || ['visitando', 'visitado', 'nuevo', 'desbalanceado', 'ruta', 'objetivo', 'error', 'sel']).forEach(c => e.classList.remove(c))); },
      conAristas: gEdges
    };
  }

  /** Anima un recorrido sobre un árbol ya dibujado. Devuelve {parar()}. */
  function animarRecorrido(ctrl, orden, opts) {
    opts = opts || {};
    const vel = opts.vel || 650; let parado = false; let i = 0; let timer = null;
    ctrl.limpiar();
    const salida = opts.salida; if (salida) U.vaciar(salida);
    const clave = o => (o && typeof o === 'object') ? o.k : o, texto = o => (o && typeof o === 'object') ? o.t : o;
    const paso = () => {
      if (parado) return;
      if (i > 0) { ctrl.resaltar(clave(orden[i - 1]), 'visitando', false); ctrl.resaltar(clave(orden[i - 1]), 'visitado', true); }
      if (i >= orden.length) { if (opts.fin) opts.fin(); return; }
      const v = orden[i]; ctrl.resaltar(clave(v), 'visitando', true);
      if (salida) { salida.appendChild(U.h('span', { class: 'chip-orden', text: String(texto(v)) })); }
      if (opts.paso) opts.paso(i, v);
      i++; timer = setTimeout(paso, vel);
    };
    paso();
    return { parar() { parado = true; clearTimeout(timer); } };
  }

  /** Anima la transición de un árbol A a otro B dentro de host (interpolación de posiciones). */
  function animarTransicion(host, A, B, opts) {
    opts = opts || {};
    const g = geom(opts); const dur = opts.dur || 900;
    U.vaciar(host); host.classList.add('arbol-host');
    const LA = layout(A), LB = layout(B);
    const ancho = Math.max(LA.ancho, LB.ancho, 1), prof = Math.max(LA.prof, LB.prof);
    const { W, H, X, Y } = medidas(g, ancho, prof, opts);
    const svg = U.svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'arbol-svg' });
    svg.style.width = Math.min(W, opts.maxAncho || 760) + 'px'; svg.style.maxWidth = '100%';
    host.appendChild(svg);
    const keys = new Set([...LA.pos.keys(), ...LB.pos.keys()]);
    const gE = U.svgEl('g'); const gN = U.svgEl('g'); svg.appendChild(gE); svg.appendChild(gN);
    const els = new Map();
    keys.forEach(k => {
      const gr = U.svgEl('g', { class: 'nodo' + (opts.clases && opts.clases[k] ? ' ' + opts.clases[k] : '') });
      gr.appendChild(U.svgEl('circle', { r: g.r })); const tx = U.svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }); tx.textContent = k; gr.appendChild(tx);
      gN.appendChild(gr); els.set(k, gr);
    });
    const aristas = (L) => { const r = []; L.pos.forEach((p, k) => { if (p.node.l) r.push([k, kk(p.node.l)]); if (p.node.r) r.push([k, kk(p.node.r)]); }); return r; };
    const eA = aristas(LA), eB = aristas(LB);
    const linesA = eA.map(() => gE.appendChild(U.svgEl('line', { class: 'arista' })));
    const linesB = eB.map(() => gE.appendChild(U.svgEl('line', { class: 'arista' })));
    let raf = null, t0 = null, parado = false;
    const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const posEn = (k, f) => {
      const a = LA.pos.get(k), b = LB.pos.get(k);
      if (a && b) return { x: X(a) + (X(b) - X(a)) * f, y: Y(a) + (Y(b) - Y(a)) * f, op: 1 };
      if (a) return { x: X(a), y: Y(a), op: 1 - f };
      return { x: X(b), y: Y(b), op: f };
    };
    const pinta = f => {
      keys.forEach(k => { const p = posEn(k, f); const e = els.get(k); e.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')'); e.style.opacity = p.op; });
      eA.forEach(([a, b], i) => { const pa = posEn(a, f), pb = posEn(b, f); const l = linesA[i]; l.setAttribute('x1', pa.x); l.setAttribute('y1', pa.y); l.setAttribute('x2', pb.x); l.setAttribute('y2', pb.y); l.style.opacity = (1 - f) * 0.9; });
      eB.forEach(([a, b], i) => { const pa = posEn(a, f), pb = posEn(b, f); const l = linesB[i]; l.setAttribute('x1', pa.x); l.setAttribute('y1', pa.y); l.setAttribute('x2', pb.x); l.setAttribute('y2', pb.y); l.style.opacity = f * 0.9; });
    };
    pinta(0);
    return new Promise(res => {
      const tick = ts => {
        if (parado) return res();
        if (t0 === null) t0 = ts;
        const f = Math.min(1, (ts - t0) / dur);
        pinta(ease(f));
        if (f < 1) raf = requestAnimationFrame(tick); else res();
      };
      if (opts.sinAnimar || typeof requestAnimationFrame === 'undefined') { pinta(1); return res(); }
      setTimeout(() => { if (!parado) raf = requestAnimationFrame(tick); }, opts.espera || 250);
      host.__parar = () => { parado = true; cancelAnimationFrame(raf); };
    });
  }

  Object.assign(Arb, {
    N, altura, factor, tam, hojas, pre, ino, post, niveles, copia, igual, nodos, profundidades, buscarNodo, hallar, camino, num, lt,
    nota, parse, lista, esBST, desbalanceados, esAVL, tipoArbol, insBST, delBST, minimo, maximo, insertarSecuencia,
    rotDer, rotIzq, reemplazar, reemplazarPorValor, casoDe, NOMBRE_CASO, ROT_CASO, rebalancear, insAVL, delAVL, construirAVL,
    desdePreIn, desdePostIn, aleatorio, llenoAleatorio, completoDe, perfectoDe, etiquetarNiveles, bstAleatorio, secuenciaCaso, forma,
    layout, kk, dibujar, animarRecorrido, animarTransicion, LETRAS
  });
  ET.Arb = Arb;
})(typeof window !== 'undefined' ? window : globalThis);
