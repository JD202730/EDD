/* sim_heap.js — animaciones del heap (S7-C2): el árbol completo y el arreglo que lo guarda (padre = (i−1)//2, hijos 2i+1 y 2i+2),
   insertar (bubble up), extraer la raíz (bubble down), construir un heap desde un arreglo en O(n) (heapify), heapsort y top-k con un heap de tamaño k.
   Sigue el algoritmo de las diapositivas (no el de heapq, que usa una variante equivalente pero con otro orden interno). */
(function (global) {
  'use strict';
  const ET = global.ET, Dib = ET.Dib;
  const Sim = ET.Sim = ET.Sim || {};
  const SEP = 66, TY = 66, X0 = 40, R = 20, CW = 48, CPASO = 54;
  const lst = a => '[' + a.join(', ') + ']';

  /** primero(a, b): ¿a debe estar ARRIBA de b? (max-heap: a > b; min-heap: a < b) */
  const mejor = (tipo, a, b) => tipo === 'max' ? a > b : a < b;
  const nombre = t => t === 'max' ? 'máximo' : 'mínimo';
  const nuevo = (vals, tipo) => ({ tipo: tipo || 'max', a: (vals || []).map((v, i) => ({ id: i + 1, v })), sigId: (vals || []).length + 1 });
  const copia = m => ({ tipo: m.tipo, a: m.a.map(e => Object.assign({}, e)), sigId: m.sigId });
  const valores = m => m.a.map(e => e.v);
  const esHeap = (a, tipo) => a.every((e, i) => i === 0 || !mejor(tipo, e.v, a[(i - 1) >> 1].v));

  /* ---------- código de referencia (el de las diapositivas, para max-heap o min-heap) ---------- */
  function codigo(tipo) {
    const mx = tipo === 'max', cls = mx ? 'MaxHeap' : 'MinHeap', cmpSube = mx ? '<=' : '>=', cmpBaja = mx ? '>' : '<', ext = mx ? 'extraer_max' : 'extraer_min', quien = mx ? 'mayor' : 'menor';
    return [
      'class ' + cls + ':', '    def __init__(self):', '        self.datos = []                  # el árbol vive aquí, sin punteros',
      '    def _padre(self, i): return (i - 1) // 2', '    def _izq(self, i): return 2 * i + 1', '    def _der(self, i): return 2 * i + 2',
      '    def insertar(self, x):', '        self.datos.append(x)             # 1. última hoja', '        self._subir(len(self.datos) - 1) # 2. subir',
      '    def _subir(self, i):                 # bubble up', '        d = self.datos', '        while i > 0:                     # la raíz no sube', '            p = self._padre(i)',
      '            if d[i] ' + cmpSube + ' d[p]:', '                break                    # ya está en su sitio', '            d[i], d[p] = d[p], d[i]      # intercambiar con el padre', '            i = p                        # seguir desde el padre',
      '    def ' + ext + '(self):', '        raiz = self.datos[0]', '        ultimo = self.datos.pop()        # última hoja', '        if self.datos:', '            self.datos[0] = ultimo       # a la raíz', '            self._bajar(0)               # bubble down', '        return raiz',
      '    def _bajar(self, i):', '        d, n = self.datos, len(self.datos)', '        while True:', '            ' + quien + ' = i', '            l, r = self._izq(i), self._der(i)',
      '            if l < n and d[l] ' + cmpBaja + ' d[' + quien + ']: ' + quien + ' = l', '            if r < n and d[r] ' + cmpBaja + ' d[' + quien + ']: ' + quien + ' = r', '            if ' + quien + ' == i:', '                break                    # ningún hijo gana', '            d[i], d[' + quien + '] = d[' + quien + '], d[i]', '            i = ' + quien + '                    # seguir bajando'
    ];
  }
  const linea = (tipo, texto) => codigo(tipo).findIndex(l => l.includes(texto)) + 1;

  /* ---------- dibujo ---------- */
  function niveles(n, cap) { return Math.max(3, Math.ceil(Math.log2(Math.max(n, cap || 0, 1) + 1))); }
  function posNodo(i, niv) { const d = Math.floor(Math.log2(i + 1)), k = i - (Math.pow(2, d) - 1), w = Math.pow(2, niv - 1) * SEP / Math.pow(2, d); return { x: X0 + (k + .5) * w, y: 38 + d * TY }; }
  function itemsHeap(S) {
    const a = S.a, size = S.size !== undefined ? S.size : a.length, niv = niveles(size, S.capN), it = [];
    const ancho = Math.pow(2, niv - 1) * SEP, yArr = 38 + (niv - 1) * TY + 74;
    for (let i = 1; i < size; i++) { const p = posNodo((i - 1) >> 1, niv), q = posNodo(i, niv); it.push(Dib.lin('e' + i, p.x, p.y, q.x, q.y, S.aristas && S.aristas.has(i) ? 'act' : '')); }
    for (let i = 0; i < size; i++) { const p = posNodo(i, niv), e = a[i]; it.push(Dib.circ('n' + e.id, p.x, p.y, R, e.v, S.cls && S.cls[e.id] || '', String(i))); }
    (S.fuera || []).forEach(f => it.push(Dib.circ('n' + f.id, f.x, f.y, R, f.v, f.cls || 'act', f.sub || '')));
    const nCelda = Math.max(a.length, S.capArr || 0);
    it.push(Dib.etq('lbl_arr', X0 - 10, yArr - 18, 'arreglo (índice debajo de cada casilla)', 'gris', 'start'));
    for (let i = 0; i < nCelda; i++) if (i >= a.length) it.push(Dib.caja('v' + i, X0 - 10 + i * CPASO, yArr, CW, 36, '', 'vacio', String(i)));
    a.forEach((e, i) => it.push(Dib.caja('r' + e.id, X0 - 10 + i * CPASO, yArr, CW, 36, e.v, i >= size ? 'ok' : (S.cls && S.cls[e.id] || ''), String(i))));
    (S.flechas || []).forEach(f => it.push(f));
    if (S.titulo) it.push(Dib.etq('tit', 8, 14, S.titulo, 'tit', 'start'));
    if (S.texto) it.push(Dib.etq('txt', X0 - 10, yArr + 70, S.texto, S.textoCls || 'grande', 'start'));
    return { items: it, W: Math.max(560, ancho + X0 * 2, X0 + nCelda * CPASO + 20), H: yArr + 100 };
  }
  const clon = S => ({ tipo: S.tipo, a: S.a.map(e => e), size: S.size, cls: Object.assign({}, S.cls || {}), aristas: new Set(S.aristas || []), fuera: (S.fuera || []).map(f => Object.assign({}, f)), flechas: S.flechas || [], titulo: S.titulo, texto: S.texto, textoCls: S.textoCls, capN: S.capN, capArr: S.capArr });
  function cuadro(S, msg, lin) { const r = itemsHeap(S), f = { items: r.items, W: r.W, H: r.H, msg }; if (lin !== undefined) f.linea = lin; return f; }
  const marca = (S, ids, c) => { ids.forEach(id => { S.cls[id] = c; }); };

  /* ---------- operaciones elementales con cuadros ---------- */
  /** sube el elemento en la posición i (a modifica en el sitio). Devuelve el número de intercambios. */
  function subir(a, i, tipo, F, base, L, cuenta) {
    let sw = 0;
    while (i > 0) {
      const p = (i - 1) >> 1, ei = a[i], ep = a[p], gana = mejor(tipo, ei.v, ep.v);
      const S = clon(base); S.a = a.slice(); S.cls = {}; S.cls[ei.id] = 'act'; S.cls[ep.id] = 'ruta'; S.aristas = new Set([i]); S.flechas = [];
      F.push(cuadro(S, '`p = _padre(' + i + ') = (' + i + ' − 1) // 2 = ' + p + '` (valor **' + ep.v + '**). ¿**' + ei.v + '** ' + (tipo === 'max' ? '>' : '<') + ' **' + ep.v + '**? **' + (gana ? 'sí' : 'no') + '**' + (gana ? ': el hijo le gana a su padre → se intercambian.' : ': ya cumple la propiedad del heap → **se detiene**.'), gana ? [L('p = self._padre'), L('if d[i] ')] : [L('p = self._padre'), L('if d[i] '), L('ya está en su sitio')]));
      if (!gana) break;
      a[p] = ei; a[i] = ep; sw++;
      const S2 = clon(base); S2.a = a.slice(); S2.cls = {}; S2.cls[ei.id] = 'act'; S2.aristas = new Set([i]);
      F.push(cuadro(S2, '**Intercambio:** ' + ei.v + ' sube a la posición ' + p + ' y ' + ep.v + ' baja a la ' + i + ': `d[i], d[p] = d[p], d[i]`. Ahora `i = ' + p + '`.', [L('d[i], d[p] ='), L('i = p')]));
      i = p;
    }
    return sw;
  }
  /** baja el elemento de la posición i dentro de los primeros `n` elementos (a se modifica en el sitio). */
  function bajar(a, i, n, tipo, F, base, L) {
    let sw = 0; const quien = tipo === 'max' ? 'mayor' : 'menor';
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2; let g = i; const ei = a[i];
      const S = clon(base); S.a = a.slice(); S.size = n; S.cls = {}; S.cls[ei.id] = 'act'; const hijos = [];
      if (l < n) { hijos.push(l); S.cls[a[l].id] = 'ruta'; }
      if (r < n) { hijos.push(r); S.cls[a[r].id] = 'ruta'; }
      S.aristas = new Set(hijos);
      if (l < n && mejor(tipo, a[l].v, a[g].v)) g = l;
      if (r < n && mejor(tipo, a[r].v, a[g].v)) g = r;
      const desc = hijos.length ? 'hijos en ' + hijos.map(h => h + ' (**' + a[h].v + '**)').join(' y ') + (r >= n ? ' (`' + r + ' ≥ n = ' + n + '`: el derecho no existe)' : '') : 'los hijos tendrían índices ' + l + ' y ' + r + ' ≥ n = ' + n + ': es **hoja**';
      if (g === i) {
        F.push(cuadro(S, '`i = ' + i + '` (**' + ei.v + '**): ' + desc + '. ' + (hijos.length ? 'Ninguno es ' + (tipo === 'max' ? 'mayor' : 'menor') + ' que ' + ei.v + ' → `' + quien + ' == i`: **se detiene**.' : '**Se detiene.**'), [L('l, r = self._izq'), L('if ' + quien + ' == i'), L('ningún hijo gana')]));
        break;
      }
      F.push(cuadro(S, '`i = ' + i + '` (**' + ei.v + '**): ' + desc + '. El ' + (tipo === 'max' ? 'mayor' : 'menor') + ' de los hijos es **' + a[g].v + '** (posición ' + g + ') y le gana a ' + ei.v + ' → se intercambian. (Se elige el hijo ' + (tipo === 'max' ? 'mayor' : 'menor') + ': si subiera el otro, quedaría encima de su hermano y se rompería el heap.)', [L('l, r = self._izq'), L('if l < n'), L('if r < n')]));
      const eg = a[g]; a[g] = ei; a[i] = eg; sw++;
      const S2 = clon(base); S2.a = a.slice(); S2.size = n; S2.cls = {}; S2.cls[ei.id] = 'act'; S2.aristas = new Set([g]);
      F.push(cuadro(S2, '**Intercambio:** ' + ei.v + ' baja a la posición ' + g + ' y ' + eg.v + ' sube a la ' + i + '. Ahora `i = ' + g + '`.', [L('d[i], d[' + quien + '] ='), L('i = ' + quien)]));
      i = g;
    }
    return sw;
  }

  /* ===================== insertar ===================== */
  function insertar(m, x) {
    const nm = copia(m), id = nm.sigId++, F = [], tipo = m.tipo, L = s => linea(tipo, s);
    const base = { tipo, a: m.a, capN: m.a.length + 1, capArr: m.a.length + 1, titulo: (tipo === 'max' ? 'Max-heap' : 'Min-heap') + ' · la raíz es el ' + nombre(tipo) };
    const S0 = clon(base); S0.capN = m.a.length;
    F.push(cuadro(S0, 'Heap: **' + lst(valores(m)) + '**. **Insertar ' + x + '**: se pone en la **última hoja** (para que el árbol siga completo) y se **sube** mientras gane a su padre.', L('def insertar')));
    const a = m.a.slice(); a.push({ id, v: x });
    const S1 = clon(base); S1.a = a.slice(); S1.cls = { [id]: 'nuevo' }; S1.capN = a.length;
    F.push(cuadro(S1, '`self.datos.append(' + x + ')`: **' + x + '** entra al final del arreglo = última hoja del árbol (posición ' + (a.length - 1) + ').', L('self.datos.append')));
    const sw = subir(a, a.length - 1, tipo, F, Object.assign({}, base, { capN: a.length }), L);
    nm.a = a.slice(); const Sf = clon(base); Sf.a = nm.a; Sf.cls = {}; Sf.capN = a.length;
    F.push(cuadro(Sf, '**Listo.** ' + (sw ? 'Subió ' + sw + ' nivel(es)' : 'No subió nada') + '. Cada vuelta sube **un nivel**, así que cuesta a lo sumo la altura: **O(log n)**. Heap: **' + lst(valores(nm)) + '**.', undefined));
    return { frames: F, modelo: nm, intercambios: sw };
  }

  /* ===================== extraer ===================== */
  function extraer(m) {
    const F = [], tipo = m.tipo, L = s => linea(tipo, s), nm = copia(m);
    const base = { tipo, a: m.a, capN: m.a.length, capArr: m.a.length, titulo: (tipo === 'max' ? 'Max-heap' : 'Min-heap') + ' · la raíz es el ' + nombre(tipo) };
    if (!m.a.length) { const S = clon(base); S.texto = 'IndexError: heap vacío'; S.textoCls = 'mal'; F.push(cuadro(S, 'No hay nada que extraer: el heap está vacío.')); return { frames: F, modelo: nm, error: 'vacio' }; }
    const a = m.a.slice(), raiz = a[0], ult = a[a.length - 1];
    const S0 = clon(base); S0.cls = { [raiz.id]: 'act' };
    F.push(cuadro(S0, 'Heap: **' + lst(valores(m)) + '**. **Extraer el ' + nombre(tipo) + '**: está en la **raíz** (`datos[0]` = **' + raiz.v + '**), así que consultarlo es **O(1)**.', L('raiz = self.datos[0]')));
    if (a.length === 1) { const S1 = clon(base); S1.a = []; S1.fuera = [{ id: raiz.id, v: raiz.v, x: 180, y: 38, cls: 'act' }]; S1.texto = 'extraído: ' + raiz.v; F.push(cuadro(S1, 'Era el único elemento: el heap queda vacío y devuelve **' + raiz.v + '**.', L('return raiz'))); nm.a = []; return { frames: F, modelo: nm, valor: raiz.v }; }
    a.pop();
    const S1 = clon(base); S1.a = a.slice(); S1.size = a.length; S1.capN = m.a.length; S1.cls = { [ult.id]: 'ruta' };
    const niv = niveles(m.a.length, m.a.length); const pRaiz = posNodo(0, niv);
    S1.fuera = [{ id: ult.id, v: ult.v, x: posNodo(m.a.length - 1, niv).x, y: posNodo(m.a.length - 1, niv).y, cls: 'ruta' }];
    S1.a = a.slice();
    F.push(cuadro(S1, '`ultimo = self.datos.pop()` → **' + ult.v + '** (la última hoja). Quitar **la última hoja** es **O(1)** y deja el árbol completo. **No** se borra la raíz directamente: `del datos[0]` correría todos los elementos (O(n)) y revolvería padres e hijos.', L('ultimo = self.datos.pop')));
    a[0] = ult;
    const S2 = clon(base); S2.a = a.slice(); S2.size = a.length; S2.capN = m.a.length; S2.cls = { [ult.id]: 'act' }; S2.fuera = [{ id: raiz.id, v: raiz.v, x: pRaiz.x + 130, y: pRaiz.y - 6, cls: 'act' }]; S2.texto = 'sale ' + raiz.v; S2.textoCls = 'ok';
    F.push(cuadro(S2, '`self.datos[0] = ultimo`: **' + ult.v + '** pasa a la raíz. El árbol sigue completo, pero la propiedad del heap probablemente **se rompió** arriba: hay que **bajarlo**.', L('self.datos[0] = ultimo')));
    const base2 = Object.assign({}, base, { capN: m.a.length, texto: 'sale ' + raiz.v, textoCls: 'ok', fuera: [{ id: raiz.id, v: raiz.v, x: pRaiz.x + 130, y: pRaiz.y - 6, cls: 'act' }] });
    const sw = bajar(a, 0, a.length, tipo, F, base2, L);
    nm.a = a.slice(); const Sf = clon(base); Sf.a = nm.a; Sf.capN = m.a.length; Sf.texto = 'devuelve ' + raiz.v; Sf.textoCls = 'ok';
    F.push(cuadro(Sf, '**Listo.** Devuelve **' + raiz.v + '** y el heap queda **' + lst(valores(nm)) + '** (' + sw + ' intercambio(s)). Cada vuelta baja **un nivel**: **O(log n)**.', undefined));
    return { frames: F, modelo: nm, valor: raiz.v, intercambios: sw };
  }

  /* ===================== construir desde un arreglo (heapify) ===================== */
  function construir(vals, tipo) {
    const m = nuevo(vals, tipo), F = [], L = s => linea(tipo, s), a = m.a.slice(), n = a.length;
    const base = { tipo, a, capN: n, capArr: n, titulo: 'Construir un ' + (tipo === 'max' ? 'max' : 'min') + '-heap desde un arreglo cualquiera (heapify, O(n))' };
    const S0 = clon(base); F.push(cuadro(S0, 'El arreglo **' + lst(vals) + '** se ve como un árbol completo, pero **todavía no cumple** la propiedad del heap. **Heapify** repara desde la **última posición que tiene hijos** (`n//2 − 1 = ' + (n / 2 - 1 | 0) + '`) hacia la raíz, **bajando** cada elemento. (Hacer n inserciones costaría O(n log n); así es **O(n)**.)', L('def _bajar')));
    let total = 0; const B = clon(base);
    for (let i = (n >> 1) - 1; i >= 0; i--) {
      const Sb = clon(base); Sb.a = a.slice(); Sb.cls = { [a[i].id]: 'act' };
      F.push(cuadro(Sb, '**Se baja la posición ' + i + '** (**' + a[i].v + '**): es el siguiente nodo, de derecha a izquierda, que tiene hijos. Los subárboles de abajo ya son heaps.', L('def _bajar')));
      total += bajar(a, i, n, tipo, F, Object.assign({}, base), L);
    }
    m.a = a.slice(); const Sf = clon(base); Sf.a = m.a;
    F.push(cuadro(Sf, '**Heap construido:** **' + lst(valores(m)) + '** (' + total + ' intercambio(s) en total). La mayoría de los nodos están cerca de las hojas y bajan poco: la suma total es lineal, **O(n)**.', undefined));
    return { frames: F, modelo: m, intercambios: total };
  }

  /* ===================== heapsort ===================== */
  function heapsort(vals) {
    const tipo = 'max', L = s => linea(tipo, s), m0 = construir(vals, 'max'), F = m0.frames.slice(), a = m0.modelo.a.slice(), n = a.length;
    const base = { tipo, a, capN: n, capArr: n, titulo: 'Heapsort: max-heap + extraer el máximo y colocarlo al final' };
    F.push(cuadro(Object.assign(clon(base), { a: a.slice() }), 'Ya hay un **max-heap**. Ahora **n veces**: se **intercambia la raíz (el máximo) con la última posición del heap**, el heap se **acorta en 1** y se **baja** la nueva raíz. Cada máximo queda en su lugar definitivo, al final.', undefined));
    let tam = n;
    for (let fin = n - 1; fin >= 1; fin--) {
      const raiz = a[0], ult = a[fin];
      const S = clon(base); S.a = a.slice(); S.size = tam; S.cls = { [raiz.id]: 'act', [ult.id]: 'ruta' };
      F.push(cuadro(S, '**Máximo = ' + raiz.v + '.** Se intercambia con el último del heap (posición ' + fin + ', valor ' + ult.v + ').', undefined));
      a[0] = ult; a[fin] = raiz; tam = fin;
      const S2 = clon(base); S2.a = a.slice(); S2.size = tam; S2.cls = { [ult.id]: 'act' };
      F.push(cuadro(S2, '**' + raiz.v + '** quedó en su posición definitiva (casilla verde). El heap ahora tiene **' + tam + '** elemento(s); hay que reparar la raíz.', undefined));
      bajar(a, 0, tam, tipo, F, Object.assign({}, base), L);
    }
    const Sf = clon(base); Sf.a = a.slice(); Sf.size = 0;
    F.push(cuadro(Sf, '**Ordenado: ' + lst(a.map(e => e.v)) + '.** Heapsort cuesta **O(n log n)** garantizado (construir O(n) + n extracciones de O(log n)) y usa **O(1)** de memoria extra: ordena **en el sitio**.', undefined));
    return { frames: F, resultado: a.map(e => e.v) };
  }

  /* ===================== top-k: los k menores sin ordenar todo ===================== */
  function topk(flujo, k) {
    const tipo = 'max', F = [], L = s => linea(tipo, s); const a = []; let id = 1, descartados = [];
    const base = (extra) => Object.assign({ tipo, a, capN: Math.max(k, 3), capArr: k, titulo: 'Top-' + k + ': heap de tamaño ' + k + ' con los ' + k + ' MENORES vistos (un max-heap: la raíz es el peor de los mejores)' }, extra || {});
    const S0 = clon(base()); S0.texto = 'flujo: ' + flujo.join(', '); S0.textoCls = 'gris';
    F.push(cuadro(S0, 'Queremos los **' + k + ' menores** de **' + lst(flujo) + '** **sin ordenar todo**. Se usa un **max-heap de tamaño k = ' + k + '**: su raíz es el **mayor de los k elegidos** (el primero que hay que descartar). Costo **O(n log k)** y memoria **O(k)**.', undefined));
    flujo.forEach((x, idx) => {
      const resto = 'flujo: ' + flujo.map((v, j) => j < idx ? '·' : (j === idx ? '[' + v + ']' : v)).join(' ');
      if (a.length < k) {
        const e = { id: id++, v: x }; a.push(e);
        const S1 = clon(base({ texto: resto, textoCls: 'gris' })); S1.a = a.slice(); S1.cls = { [e.id]: 'nuevo' };
        F.push(cuadro(S1, 'Llega **' + x + '**. El heap tiene ' + (a.length - 1) + ' < k = ' + k + ' elementos: **se agrega** (hoja + subir).', undefined));
        subir(a, a.length - 1, tipo, F, Object.assign(base({ texto: resto, textoCls: 'gris' }), {}), L);
      } else if (x < a[0].v) {
        const sale = a[0], e = { id: id++, v: x }; descartados.push(sale.v);
        const S1 = clon(base({ texto: resto, textoCls: 'gris' })); S1.a = a.slice(); S1.cls = { [sale.id]: 'mal' };
        F.push(cuadro(S1, 'Llega **' + x + '**. La raíz es **' + sale.v + '** (el peor de los k mejores). **' + x + ' < ' + sale.v + '** → el nuevo es mejor: se **reemplaza la raíz** y se baja.', undefined));
        a[0] = e; const S2 = clon(base({ texto: resto, textoCls: 'gris' })); S2.a = a.slice(); S2.cls = { [e.id]: 'nuevo' }; S2.fuera = [{ id: sale.id, v: sale.v, x: 290, y: 18, cls: 'mal' }];
        F.push(cuadro(S2, '**' + sale.v + '** sale del heap (ya no es de los ' + k + ' menores) y entra **' + x + '** en la raíz.', undefined));
        bajar(a, 0, a.length, tipo, F, Object.assign(base({ texto: resto, textoCls: 'gris' }), {}), L);
      } else {
        descartados.push(x);
        const S1 = clon(base({ texto: resto, textoCls: 'gris' })); S1.a = a.slice(); S1.cls = { [a[0].id]: 'ruta' };
        F.push(cuadro(S1, 'Llega **' + x + '**. La raíz es **' + a[0].v + '**: **' + x + ' ≥ ' + a[0].v + '** → no mejora a ninguno de los k elegidos: se **descarta** sin tocar el heap (solo costó comparar con la raíz: **O(1)**).', undefined));
      }
    });
    const orden = a.map(e => e.v).sort((p, q) => p - q);
    const Sf = clon(base({ texto: 'los ' + k + ' menores: ' + orden.join(', '), textoCls: 'ok' })); Sf.a = a.slice();
    F.push(cuadro(Sf, '**Resultado: los ' + k + ' menores son ' + lst(orden) + '.** Cada elemento costó a lo sumo **O(log k)** → **O(n log k)** en total, frente a O(n log n) de ordenar todo. Con n = 10⁶ y k = 10: ≈ n·3 frente a ≈ n·20.', undefined));
    return { frames: F, resultado: orden };
  }

  /* ===================== navegar el arreglo con las fórmulas ===================== */
  function navegar(m, i) {
    const a = m.a, n = a.length, niv = niveles(n, n), F = [];
    const base = { tipo: m.tipo, a, capN: n, capArr: n, titulo: 'Navegar el árbol con aritmética de índices' };
    const S = clon(base), fl = []; S.cls = { [a[i].id]: 'act' };
    const partes = []; const aristas = new Set();
    if (i > 0) { const p = (i - 1) >> 1; S.cls[a[p].id] = 'ruta'; aristas.add(i); partes.push('**padre** = ⌊(' + i + ' − 1) / 2⌋ = **' + p + '** (valor ' + a[p].v + ')'); }
    else partes.push('es la **raíz**: no tiene padre');
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n) { S.cls[a[l].id] = 'ok'; aristas.add(l); partes.push('**hijo izq** = 2·' + i + ' + 1 = **' + l + '** (valor ' + a[l].v + ')'); } else partes.push('**hijo izq** = ' + l + ' ≥ n = ' + n + ': **no existe**');
    if (r < n) { S.cls[a[r].id] = 'ok'; aristas.add(r); partes.push('**hijo der** = 2·' + i + ' + 2 = **' + r + '** (valor ' + a[r].v + ')'); } else partes.push('**hijo der** = ' + r + ' ≥ n = ' + n + ': **no existe**');
    S.aristas = aristas;
    F.push(cuadro(S, 'Nodo en el índice **' + i + '** (valor **' + a[i].v + '**): ' + partes.join(' · ') + '. ' + (l >= n ? 'Como no tiene hijos, es una **hoja**.' : '') , undefined));
    return { frames: F };
  }

  Sim.heap = { cuadro: (m, msg) => cuadro({ tipo: m.tipo, a: m.a, capN: m.a.length, capArr: m.a.length, titulo: (m.tipo === 'max' ? 'Max-heap' : 'Min-heap') + ' · la raíz es el ' + nombre(m.tipo) }, msg), nuevo, copia, valores, esHeap, mejor, insertar, extraer, construir, heapsort, topk, navegar, codigo, escena: S => itemsHeap(S).items };
})(typeof window !== 'undefined' ? window : globalThis);
