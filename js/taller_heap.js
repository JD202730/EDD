/* taller_heap.js — taller interactivo del HEAP (S7-C2): insertar (subir), extraer la raíz (bajar) y construir desde un arreglo (heapify).
   Dibuja con los mismos elementos que la animación del laboratorio (árbol + arreglo). Los pasos esperados son los del algoritmo de las diapositivas. */
(function (global) {
  'use strict';
  const ET = global.ET, TG = ET.TallerGen, SH = ET.Sim.heap, Dib = ET.Dib, U = ET.U;
  const mejor = SH.mejor;
  const HUECO = { id: 'h', v: '', hueco: true };
  const nom = t => t === 'max' ? 'máximo' : 'mínimo';
  const gan = t => t === 'max' ? 'mayor' : 'menor';
  const sig = t => t === 'max' ? '>' : '<';
  const nombreHeap = t => t === 'max' ? 'max-heap' : 'min-heap';

  const cp = m => ({ tipo: m.tipo, a: m.a.slice(), sigId: m.sigId, salida: m.salida.slice(), nuevo: m.nuevo || null, sale: m.sale || null });
  const valores = m => m.a.filter(e => !e.hueco).map(e => e.v);
  const idxDe = (m, dom) => { const c = dom[0]; if (c !== 'n' && c !== 'r') return -1; const id = dom.slice(1); return m.a.findIndex(e => String(e.id) === id); };
  const huecoLibre = dom => ((dom[0] === 'v' || dom[0] === 's') && /^\d+$/.test(dom.slice(1))) ? Number(dom.slice(1)) : -1;
  const esCelda = dom => /^[nrvs][0-9h]+$/.test(dom);
  const idNodo = e => 'n' + e.id;
  const cambiar = (m, i, j) => { const r = cp(m); const t = r.a[i]; r.a[i] = r.a[j]; r.a[j] = t; return r; };

  function iniciar(cfg) { const b = SH.nuevo(cfg.vals || [], cfg.tipo); return { tipo: cfg.tipo, a: b.a, sigId: b.sigId, salida: [], nuevo: null, sale: null }; }

  /* ---------- dibujo ---------- */
  function dibujar(m, p) {
    const n = m.a.length, tipo = m.tipo;
    const S = { tipo, a: m.a, cls: {}, aristas: new Set(), fuera: [], flechas: [], titulo: (tipo === 'max' ? 'Max-heap' : 'Min-heap') + ' · la raíz es el ' + nom(tipo), capN: n, capArr: n };
    const extra = [];
    m.a.forEach(e => { if (e.hueco) S.cls[e.id] = 'vacio gris'; });
    if (p && p.vista) p.vista(S, m, extra);
    if (m.sale) { const q = SH.pos(0, SH.niveles(S.a.length, S.capN)); S.fuera.push({ id: m.sale.id, v: m.sale.v, x: q.x + 130, y: q.y - 6, cls: 'ok', sub: 'sale' }); }
    if (m.nuevo) S.fuera.push({ id: m.nuevo.id, v: m.nuevo.v, x: 38, y: 58, cls: 'nuevo', sub: 'nuevo' });
    if (m.salida.length) { S.texto = 'salida: ' + m.salida.join(', '); S.textoCls = 'ok'; }
    const r = SH.dibujo(S);
    return { items: r.items.concat(extra), W: r.W, H: r.H };
  }

  /* ---------- pasos ---------- */
  function pasoColocar(m, m1) {
    const n = m.a.length, nuevo = m.nuevo, v = nuevo.v, niv0 = SH.niveles(n, n + 1);
    const libres = []; for (let j = n; j <= n + 2 && j <= Math.pow(2, niv0) - 2; j++) libres.push(j);
    return {
      id: 'colocar', antes: m, titulo: 'Colocar el elemento nuevo', gestos: 'par',
      instr: 'Arrastra el **nodo nuevo (' + v + ')** a la **primera posición libre**: el heap es un árbol **completo** (se llena por niveles, de izquierda a derecha, sin dejar huecos), o sea, **justo después del último** del arreglo. Suéltalo en el hueco punteado del árbol o en la casilla del arreglo (o tócalo y luego toca el hueco).',
      ayudaFuente: 'En este paso solo se mueve el **nodo nuevo** (el amarillo/verde de la izquierda).',
      fuente: id => id === idNodo(nuevo), destino: esCelda,
      vista(S, mm, ex) { S.capN = n + 1; S.capArr = n + libres.length; libres.forEach(j => { const q = SH.pos(j, niv0); ex.push(Dib.circ('s' + j, q.x, q.y, 15, '+', 'hueco', String(j))); }); },
      acepta(g) {
        if (g.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra el nodo nuevo a un hueco punteado (o tócalo y luego toca el hueco).' };
        if (g.de !== idNodo(nuevo)) return { ok: false, blando: true, msg1: 'En este paso solo se mueve el nodo nuevo.' };
        const j = huecoLibre(g.a);
        if (j === n) return { ok: true, despues: m1, msg: '✔ **' + v + '** entra en la posición ' + n + ' (la última hoja): el árbol sigue completo. Ahora puede romper la propiedad del heap, así que hay que **subirlo**.' };
        if (j < 0) return { ok: false, msg1: 'Ahí ya hay un elemento: el nodo nuevo va en un hueco libre (punteado).' };
        return { ok: false, msg1: 'Esa no es la siguiente posición libre.', msg2: 'El heap es un árbol completo: se llena por niveles de izquierda a derecha sin saltarse posiciones, así que la siguiente libre es la **' + n + '**.' };
      },
      pista: TG.pista3(['Un heap es un árbol **completo**: no se pueden dejar huecos en el medio. ¿En qué posición del arreglo va el siguiente?', 'Es la posición **' + n + '** (la primera casilla vacía del arreglo, justo después de la última).', 'Suelta el nodo nuevo en el hueco **' + n + '** (círculo punteado o casilla punteada con ese índice).'], ['s' + n, 'v' + n], 2),
      correcta: () => ({ tipo: 'par', de: idNodo(nuevo), a: 's' + n }),
      incorrecta: () => ({ tipo: 'par', de: idNodo(nuevo), a: 's' + (n + 1) })
    };
  }
  function pasoSubir(m, i, p, swap, despues) {
    const tipo = m.tipo, ei = m.a[i], ep = m.a[p], g = gan(tipo);
    return {
      id: 'subir', antes: m, titulo: 'Subir (bubble up)', gestos: 'par',
      instr: 'El elemento **' + ei.v + '** está en la posición **' + i + '**. Su padre está en ⌊(i − 1)/2⌋. Si **' + (tipo === 'max' ? 'es mayor' : 'es menor') + ' que su padre**, **intercámbialos** (arrastra uno sobre el otro); si no, pulsa «✔ Ya está en su sitio».',
      fuente: id => idxDe(m, id) >= 0, destino: id => idxDe(m, id) >= 0,
      botones: [{ t: '✔ Ya está en su sitio', v: 'ya' }],
      vista(S) { S.cls[ei.id] = 'act'; },
      acepta(gs) {
        if (gs.tipo === 'boton') {
          if (!swap) return { ok: true, msg: '✔ Correcto: **' + ei.v + '** no ' + (tipo === 'max' ? 'supera' : 'es menor que') + ' a su padre (' + ep.v + '): ya cumple la propiedad del heap y se **detiene**.' };
          return { ok: false, msg1: 'Todavía no: **' + ei.v + '** es ' + g + ' que su padre (' + ep.v + ').', msg2: 'Si el hijo le gana al padre hay que intercambiarlos y seguir subiendo.' };
        }
        if (gs.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra un elemento sobre otro, o usa el botón.' };
        const a = idxDe(m, gs.de), b = idxDe(m, gs.a);
        if (a < 0 || b < 0 || a === b) return { ok: false, blando: true, msg1: 'Intercambia dos elementos del heap.' };
        const par = (a === i && b === p) || (a === p && b === i);
        if (par) return swap ? { ok: true, despues, msg: '✔ Intercambio: **' + ei.v + '** sube a la posición ' + p + ' y ' + ep.v + ' baja a la ' + i + '.' + (p === 0 ? ' Llegó a la raíz: **termina**.' : '') }
          : { ok: false, msg1: 'No hay que intercambiar: **' + ei.v + '** ' + (tipo === 'max' ? 'no es mayor que' : 'no es menor que') + ' su padre (' + ep.v + ').', msg2: 'La propiedad del heap ya se cumple entre ellos: pulsa «✔ Ya está en su sitio».' };
        const hp = (x, y) => x > 0 && ((x - 1) >> 1) === y;
        if (hp(a, b) || hp(b, a)) return { ok: false, msg1: 'Ese par no es el que corresponde.', msg2: 'Se sube el elemento **' + ei.v + '** (el que acaba de entrar o de moverse): su padre está en la posición ' + p + '.' };
        return { ok: false, msg1: 'Solo se intercambia un **hijo con su padre**.', msg2: 'El padre del elemento en la posición ' + i + ' está en (' + i + ' − 1) // 2 = ' + p + '.' };
      },
      pista: TG.pista3(['El padre de la posición ' + i + ' está en (' + i + ' − 1) // 2 = **' + p + '**.', 'El padre es **' + ep.v + '**. ¿Es ' + ei.v + ' ' + sig(tipo) + ' ' + ep.v + '? (' + (tipo === 'max' ? 'max' : 'min') + '-heap: el ' + g + ' va arriba).', swap ? 'Sí: intercambia **' + ei.v + '** con **' + ep.v + '**.' : 'No: pulsa «✔ Ya está en su sitio».'], [idNodo(ep)], 2),
      correcta: () => swap ? { tipo: 'par', de: idNodo(ei), a: idNodo(ep) } : TG.boton('ya'),
      incorrecta: () => swap ? TG.boton('ya') : { tipo: 'par', de: idNodo(ei), a: idNodo(ep) }
    };
  }

  function pasoBajar(m, i, g, despues) {
    const tipo = m.tipo, n = m.a.length, ei = m.a[i], l = 2 * i + 1, r = 2 * i + 2, hijos = [l, r].filter(x => x < n), q = gan(tipo);
    const desc = hijos.map(x => m.a[x].v).join(' y ');
    return {
      id: 'bajar', antes: m, titulo: 'Bajar (bubble down)', gestos: 'par',
      instr: 'El elemento **' + ei.v + '** está en la posición **' + i + '**; sus hijos están en 2i + 1 = ' + l + ' y 2i + 2 = ' + r + ' (existen solo si < n = ' + n + '). Si algún hijo es **' + q + '** que ' + ei.v + ', **intercámbialo con el hijo ' + q + '** (arrastra uno sobre el otro); si no, pulsa «✔ Ya está en su sitio».',
      fuente: id => idxDe(m, id) >= 0, destino: id => idxDe(m, id) >= 0,
      botones: [{ t: '✔ Ya está en su sitio', v: 'ya' }],
      vista(S) { S.cls[ei.id] = 'act'; },
      acepta(gs) {
        if (gs.tipo === 'boton') {
          if (g === null) return { ok: true, msg: '✔ Correcto: ningún hijo (' + desc + ') es ' + q + ' que **' + ei.v + '**: ya cumple la propiedad y se **detiene**.' };
          return { ok: false, msg1: 'Todavía no: el hijo ' + q + ' (**' + m.a[g].v + '**) es ' + q + ' que **' + ei.v + '**.', msg2: 'Hay que intercambiarlo con ese hijo y seguir bajando.' };
        }
        if (gs.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra un elemento sobre otro, o usa el botón.' };
        const a = idxDe(m, gs.de), b = idxDe(m, gs.a);
        if (a < 0 || b < 0 || a === b) return { ok: false, blando: true, msg1: 'Intercambia dos elementos del heap.' };
        const otro = a === i ? b : (b === i ? a : -1);
        if (otro < 0) return { ok: false, msg1: 'Se intercambia el elemento **' + ei.v + '** (el que baja) con uno de sus hijos.', msg2: 'Sus hijos están en las posiciones ' + hijos.join(' y ') + '.' };
        if (!hijos.includes(otro)) return { ok: false, msg1: 'Bajar es hacia los **hijos**, no hacia el padre.', msg2: 'Los hijos de la posición ' + i + ' están en ' + hijos.join(' y ') + '.' };
        if (g === null) return { ok: false, msg1: 'No hay que intercambiar: ningún hijo (' + desc + ') es ' + q + ' que **' + ei.v + '**.', msg2: 'Ya cumple la propiedad del heap: pulsa «✔ Ya está en su sitio».' };
        if (otro === g) return { ok: true, despues, msg: '✔ Intercambio: **' + ei.v + '** baja a la posición ' + g + ' y **' + m.a[g].v + '** sube a la ' + i + '.' };
        return { ok: false, msg1: 'Con ese hijo no: se baja por el hijo **' + q + '** (**' + m.a[g].v + '**, no ' + m.a[otro].v + ').', msg2: 'Si subiera ' + m.a[otro].v + ' quedaría encima de su hermano ' + m.a[g].v + ' y el heap se rompería.' };
      },
      pista: TG.pista3(['Los hijos de la posición ' + i + ' están en 2i + 1 = ' + l + (r < n ? ' y 2i + 2 = ' + r : ' (el derecho ' + r + ' ≥ n: no existe)') + (hijos.length ? '.' : '; ninguno existe.'), 'Compara los hijos (' + desc + ') con **' + ei.v + '**: ¿alguno es ' + q + '? Si hay dos candidatos, se elige el hijo ' + q + '.', g === null ? 'Ningún hijo gana: pulsa «✔ Ya está en su sitio».' : 'Intercambia **' + ei.v + '** con el hijo **' + m.a[g].v + '** (posición ' + g + ').'], hijos.map(x => idNodo(m.a[x])), 2),
      correcta: () => g === null ? TG.boton('ya') : { tipo: 'par', de: idNodo(ei), a: idNodo(m.a[g]) },
      incorrecta: () => g === null ? { tipo: 'par', de: idNodo(ei), a: idNodo(m.a[hijos[0]]) } : TG.boton('ya')
    };
  }

  function pasoRaiz(m, m1) {
    const tipo = m.tipo, raiz = m.a[0];
    return {
      id: 'raiz', antes: m, titulo: 'Sacar la raíz', gestos: 'clic', clicable: id => idxDe(m, id) >= 0,
      instr: 'Extraer el **' + nom(tipo) + '**: ¿dónde está en un ' + nombreHeap(tipo) + '? **Toca ese elemento** para sacarlo del heap.',
      acepta(g) {
        if (g.tipo !== 'clic') return { ok: false, blando: true, msg1: 'Toca el elemento que se extrae.' };
        const i = idxDe(m, g.id);
        if (i === 0) return { ok: true, despues: m1, msg: '✔ **' + raiz.v + '** (la raíz) sale del heap: consultar el ' + nom(tipo) + ' es **O(1)**. Queda un hueco en la raíz.' };
        if (i < 0) return { ok: false, blando: true, msg1: 'Toca un elemento del heap.' };
        return { ok: false, msg1: 'Ese no es el ' + nom(tipo) + ': en un ' + nombreHeap(tipo) + ' el ' + nom(tipo) + ' está en la **raíz** (posición 0).', msg2: 'Los demás elementos no están ordenados entre sí.' };
      },
      pista: TG.pista3(['En un ' + nombreHeap(tipo) + ' cada nodo es ' + (tipo === 'max' ? '≥' : '≤') + ' que sus hijos, así que el extremo está en lo más alto del árbol.', 'Es el primer elemento del arreglo (posición 0).', 'Toca la raíz: **' + raiz.v + '**.'], [idNodo(raiz)], 2),
      correcta: () => ({ tipo: 'clic', id: idNodo(raiz) }),
      incorrecta: () => ({ tipo: 'clic', id: idNodo(m.a[m.a.length - 1]) })
    };
  }
  function pasoUltima(m, m2) {
    const n = m.a.length, ult = m.a[n - 1];
    return {
      id: 'ultima', antes: m, titulo: 'Última hoja a la raíz', gestos: 'par',
      instr: 'No se puede dejar la raíz vacía ni correr todo el arreglo (O(n)): se toma la **última hoja** (el último elemento del arreglo, **' + ult.v + '**) y se **lleva a la raíz**. Arrástrala al hueco punteado de arriba (o tócala y luego toca el hueco).',
      fuente: id => idxDe(m, id) > 0, destino: id => idxDe(m, id) >= 0,
      vista(S) { S.cls[ult.id] = 'ruta'; },
      acepta(g) {
        if (g.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra la última hoja hasta la raíz.' };
        const a = idxDe(m, g.de), b = idxDe(m, g.a);
        if (a < 0 || b < 0) return { ok: false, blando: true, msg1: 'Suelta sobre un elemento del heap.' };
        if (a === n - 1 && b === 0) return { ok: true, despues: m2, msg: '✔ **' + ult.v + '** pasa a la raíz y el heap queda con ' + (n - 1) + ' elemento(s). El árbol sigue completo, pero la propiedad del heap probablemente **se rompió** arriba: hay que **bajarlo**.' };
        if (b === 0) return { ok: false, msg1: 'Tiene que ser la **última** hoja (posición ' + (n - 1) + ', valor ' + ult.v + ').', msg2: 'Quitar la última hoja es O(1) y deja el árbol completo; sacar otra dejaría un hueco en medio.' };
        return { ok: false, msg1: 'Llévala a la **raíz** (el hueco punteado de arriba).', msg2: 'La raíz quedó vacía al sacar el ' + nom(m.tipo) + ': allí va la última hoja.' };
      },
      pista: TG.pista3(['La última hoja es el **último elemento del arreglo** (la casilla más a la derecha).', 'Es **' + ult.v + '** (posición ' + (n - 1) + '), y va al hueco de la raíz.', 'Arrastra **' + ult.v + '** sobre el hueco punteado de la raíz.'], [idNodo(ult), 'nh'], 2),
      correcta: () => ({ tipo: 'par', de: idNodo(ult), a: 'nh' }),
      incorrecta: () => n > 2 ? { tipo: 'par', de: idNodo(m.a[1]), a: 'nh' } : null   // con 2 elementos la única hoja que queda es la correcta
    };
  }
  function pasoElegir(m, i) {
    const n = m.a.length, el = m.a[i], primera = i === (n >> 1) - 1;
    return {
      id: 'elegir', antes: m, titulo: 'Elegir el nodo a reparar', gestos: 'clic', clicable: id => idxDe(m, id) >= 0,
      instr: primera ? 'Heapify repara **de derecha a izquierda** empezando en la **última posición que tiene hijos**: n // 2 − 1 = **' + i + '** (las hojas ya son heaps de un nodo). **Toca ese nodo.**' : 'Siguiente nodo de derecha a izquierda: la posición **' + i + '**. **Tócalo** para repararlo (bajarlo si hace falta).',
      acepta(g) {
        if (g.tipo !== 'clic') return { ok: false, blando: true, msg1: 'Toca el nodo que se repara.' };
        const j = idxDe(m, g.id);
        if (j === i) return { ok: true, msg: '✔ Se repara la posición **' + i + '** (**' + el.v + '**): los subárboles de abajo ya son heaps.' };
        if (j < 0) return { ok: false, blando: true, msg1: 'Toca un elemento del heap.' };
        return { ok: false, msg1: 'No es ese: ahora toca la posición **' + i + '**.', msg2: primera ? 'Se empieza en n // 2 − 1 = ' + i + ' (n = ' + n + '): el último nodo que tiene hijos.' : 'Se avanza de derecha a izquierda, una posición cada vez, hasta llegar a la raíz.' };
      },
      pista: TG.pista3([primera ? 'El último nodo con hijos es el padre de la última posición: (n − 2) // 2 = n // 2 − 1.' : 'Se retrocede de una en una: la posición anterior a la que acabas de reparar.', 'Es la posición **' + i + '**.', 'Toca el elemento **' + el.v + '**.'], [idNodo(el)], 2),
      correcta: () => ({ tipo: 'clic', id: idNodo(el) }),
      incorrecta: () => ({ tipo: 'clic', id: idNodo(m.a[i === 0 ? n - 1 : 0]) })
    };
  }

  /* ---------- planes ---------- */
  /** pasos de «bajar» el elemento de la posición i; devuelve el modelo final */
  function bajar(m, i, pasos) {
    const n = m.a.length, tipo = m.tipo; let mm = m, j = i, sw = 0;
    for (; ;) {
      const l = 2 * j + 1, r = 2 * j + 2; if (l >= n) break;
      let g = j; if (mejor(tipo, mm.a[l].v, mm.a[g].v)) g = l; if (r < n && mejor(tipo, mm.a[r].v, mm.a[g].v)) g = r;
      if (g === j) { pasos.push(pasoBajar(mm, j, null)); break; }
      const m2 = cambiar(mm, j, g); pasos.push(pasoBajar(mm, j, g, m2)); mm = m2; j = g; sw++;
    }
    return { m: mm, sw };
  }
  function planIns(m0, v) {
    if (!SH.esHeap(m0.a, m0.tipo)) throw new Error('El arreglo inicial no es un ' + nombreHeap(m0.tipo) + '. Cámbialo o empieza con «construir».');
    const tipo = m0.tipo, n = m0.a.length, el = { id: m0.sigId, v };
    const m1a = cp(m0); m1a.nuevo = el; m1a.sigId = m0.sigId + 1;
    const m1b = cp(m1a); m1b.nuevo = null; m1b.a = m0.a.concat([el]);
    const pasos = [pasoColocar(m1a, m1b)]; let mm = m1b, i = n, sw = 0;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (mejor(tipo, mm.a[i].v, mm.a[p].v)) { const m2 = cambiar(mm, i, p); pasos.push(pasoSubir(mm, i, p, true, m2)); mm = m2; i = p; sw++; }
      else { pasos.push(pasoSubir(mm, i, p, false, null)); break; }
    }
    return { pasos, final: mm, texto: '<strong>Insertar ' + v + '</strong>: va a la última hoja (posición ' + n + ') y ' + (sw ? 'sube ' + sw + ' nivel(es)' : 'no sube') + ' → <code>' + TG.lst(valores(mm)) + '</code>.' };
  }
  function planExt(m0) {
    if (!m0.a.length) throw new Error('El heap está vacío: no hay nada que extraer.');
    if (!SH.esHeap(m0.a, m0.tipo)) throw new Error('El arreglo inicial no es un ' + nombreHeap(m0.tipo) + '. Cámbialo o empieza con «construir».');
    const tipo = m0.tipo, n = m0.a.length, raiz = m0.a[0], ult = m0.a[n - 1];
    const m1 = cp(m0); m1.sale = raiz;
    const cierra = mm => { const f = cp(mm); f.sale = null; f.salida = f.salida.concat([raiz.v]); return f; };
    if (n === 1) { m1.a = []; return { pasos: [pasoRaiz(m0, m1)], final: cierra(m1), texto: '<strong>Extraer el ' + nom(tipo) + '</strong>: ' + raiz.v + ' era el único elemento; el heap queda vacío.' }; }
    m1.a = [HUECO].concat(m0.a.slice(1));
    const m2 = cp(m1); m2.a = [ult].concat(m0.a.slice(1, n - 1));
    const pasos = [pasoRaiz(m0, m1), pasoUltima(m1, m2)];
    const b = bajar(m2, 0, pasos);
    return { pasos, final: cierra(b.m), texto: '<strong>Extraer el ' + nom(tipo) + '</strong>: sale ' + raiz.v + '; la última hoja (' + ult.v + ') pasa a la raíz y baja ' + b.sw + ' nivel(es) → <code>' + TG.lst(valores(b.m)) + '</code>.' };
  }
  function planBuild(m0) {
    const n = m0.a.length; let mm = cp(m0); const pasos = []; let sw = 0;
    for (let i = (n >> 1) - 1; i >= 0; i--) { pasos.push(pasoElegir(mm, i)); const b = bajar(mm, i, pasos); mm = b.m; sw += b.sw; }
    return { pasos, final: mm, texto: '<strong>Construir el ' + nombreHeap(m0.tipo) + '</strong> (heapify, O(n)): se baja cada nodo con hijos de derecha a izquierda; ' + sw + ' intercambio(s) → <code>' + TG.lst(valores(mm)) + '</code>.' };
  }
  function plan(m, op) {
    if (op.t === 'ins') return planIns(m, op.v);
    if (op.t === 'ext') return planExt(m);
    return planBuild(m);
  }

  TG.familias.heap = {
    etiqueta: 'Taller del heap', iniciar,
    plan, dibujar,
    nombreOp: (o, cfg) => o.t === 'ins' ? 'Insertar ' + o.v : (o.t === 'ext' ? 'Extraer el ' + nom(cfg.tipo) : 'Construir el heap'),
    resumen: m => nombreHeap(m.tipo).replace(/^./, c => c.toUpperCase()) + ': ' + TG.lst(valores(m)) + (m.salida.length ? ' · salida: ' + TG.lst(m.salida) : ''),
    textoFinal: m => TG.lst(valores(m)) + (m.salida.length ? ' salida ' + TG.lst(m.salida) : ''),
    resolucionHtml(cfg) { let m = iniciar(cfg); const out = []; cfg.ops.forEach(o => { const p = plan(m, o); out.push('<li>' + p.texto + '</li>'); m = p.final; }); return '<ol>' + out.join('') + '</ol>'; },
    /** «5, 3, x, build»: número = insertar; x / ext = extraer la raíz; build = construir desde el arreglo */
    leerOps(txt) {
      const ops = [];
      for (const raw of txt.split(/[;,]+/).map(s => s.trim()).filter(Boolean)) {
        let mm;
        if ((mm = /^(?:\+|ins(?:ertar)?\s*)?(-?\d+)$/i.exec(raw))) ops.push({ t: 'ins', v: Number(mm[1]) });
        else if (/^(x|ext(?:raer)?|pop|-)$/i.test(raw)) ops.push({ t: 'ext' });
        else if (/^(build|heapify|construir)$/i.test(raw)) ops.push({ t: 'build' });
        else throw new Error('No entiendo «' + raw + '». Usa un número para insertar (25), «x» para extraer la raíz o «build» para construir el heap desde el arreglo.');
      }
      return ops;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
