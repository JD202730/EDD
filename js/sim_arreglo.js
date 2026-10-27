/* sim_arreglo.js — animaciones del arreglo (S3-C1): acceso por aritmética de direcciones, inserción y eliminación con desplazamientos,
   búsqueda lineal y arreglo dinámico que duplica su capacidad; y las técnicas de la clase: suma de prefijos, Kadane, dos punteros,
   ventana deslizante y merge intervals. Cada función devuelve {frames, …resultado}; el resultado se comprueba contra Python en las pruebas. */
(function (global) {
  'use strict';
  const ET = global.ET, Dib = ET.Dib;
  const Sim = ET.Sim = ET.Sim || {};
  const AW = 58, AH = 42, AX = 36, GAP = 6, PASO = AW + GAP;
  const lst = a => '[' + a.join(', ') + ']';

  /* ===================================================================== operaciones del arreglo ===================================================================== */
  const arrNuevo = (vals, cap, o) => Object.assign({ a: (vals || []).map((v, i) => ({ id: i + 1, v })), cap: Math.max(cap || 0, (vals || []).length, 4), sigId: (vals || []).length + 1, base: 2000, tam: 8 }, o || {});
  const arrCopia = m => Object.assign({}, m, { a: m.a.map(x => Object.assign({}, x)) });
  const ARR_COD = {
    acceso: ['# acceso por índice: una multiplicación y una suma', 'def direccion(base, i, tam):', '    return base + i * tam         # O(1), sin importar i ni n', 'valor = A[i]                      # O(1)'],
    insertar: ['def insertar(A, n, i, x):         # A tiene capacidad; n elementos', '    if n == len(A):', '        A = A + [None] * len(A)    # crear un arreglo mayor y copiar: O(n)', '    for j in range(n, i, -1):', '        A[j] = A[j - 1]            # desplazar a la derecha', '    A[i] = x', '    return A, n + 1'],
    eliminar: ['def eliminar(A, n, i):', '    for j in range(i, n - 1):', '        A[j] = A[j + 1]            # desplazar a la izquierda', '    A[n - 1] = None', '    return A, n - 1'],
    buscar: ['def buscar(A, n, x):', '    for i in range(n):             # O(n): elemento por elemento', '        if A[i] == x:', '            return i', '    return -1']
  };
  function itemsArr(S) {
    const it = [], n = S.a.length, y = S.y !== undefined ? S.y : 96;
    for (let i = 0; i < S.cap; i++) if (i >= n || S.fantasma) it.push(Dib.caja('v' + (S.pref || '') + i, AX + i * PASO, y, AW, AH, '', 'vacio', String(i)));
    S.a.forEach((x, i) => it.push(Dib.caja('a' + x.id, AX + (S.pos && S.pos[x.id] !== undefined ? S.pos[x.id] : i) * PASO, S.alt && S.alt[x.id] !== undefined ? S.alt[x.id] : y, AW, AH, x.v, S.cls && S.cls[x.id] || '', S.pos && S.pos[x.id] !== undefined ? String(S.pos[x.id]) : String(i))));
    (S.libres || []).forEach(l => it.push(Dib.caja('a' + l.id, AX + l.slot * PASO, l.y !== undefined ? l.y : 20, AW, AH, l.v, l.cls || 'nuevo')));
    if (S.dirs) for (let i = 0; i < S.cap; i++) it.push(Dib.etq('d' + i, AX + i * PASO + AW / 2, y - 14, String(S.base + i * S.tam), 'gris'));
    if (S.nuevoArr) it.push(...S.nuevoArr);
    if (S.formula) it.push(Dib.etq('formula', AX, 230, S.formula, 'tit', 'start'));
    if (S.etiqueta) it.push(Dib.etq('lbl', AX, 20, S.etiqueta, 'gris', 'start'));
    if (S.marca !== undefined && S.marca !== null) it.push(Dib.etq('pi', AX + S.marca * PASO + AW / 2, y + AH + 32, 'i', 'ptr'), Dib.fl('pif', AX + S.marca * PASO + AW / 2, y + AH + 22, AX + S.marca * PASO + AW / 2, y + AH + 3, 'act'));
    return it;
  }
  const cuadroA = (S, msg, linea) => { const f = { items: itemsArr(S), msg, W: Math.max(560, AX * 2 + Math.max(S.cap, S.capMax || 0) * PASO), H: S.H || 270 }; if (linea !== undefined) f.linea = linea; return f; };
  const clonA = S => ({ a: S.a.map(x => Object.assign({}, x)), cap: S.cap, cls: Object.assign({}, S.cls || {}), pos: Object.assign({}, S.pos || {}), alt: Object.assign({}, S.alt || {}), libres: (S.libres || []).map(l => Object.assign({}, l)), base: S.base, tam: S.tam, dirs: S.dirs, formula: S.formula, marca: S.marca, y: S.y, capMax: S.capMax, nuevoArr: S.nuevoArr, H: S.H, etiqueta: S.etiqueta });
  const visA = m => ({ a: m.a, cap: m.cap, cls: {}, pos: {}, alt: {}, libres: [], base: m.base, tam: m.tam });

  function acceso(m, i) {
    const S = visA(m), F = []; S.dirs = true;
    if (i < 0 || i >= m.a.length) { F.push(cuadroA(S, 'El índice **' + i + '** está fuera del rango 0..' + (m.a.length - 1) + ': en Python es `IndexError` (en C leería memoria ajena).', 4)); return { frames: F, modelo: arrCopia(m), error: 'rango' }; }
    F.push(cuadroA(S, 'Arreglo contiguo con **base = ' + m.base + '** y **' + m.tam + ' bytes** por elemento. Las direcciones están encima de cada casilla.', 2));
    const S1 = clonA(S); S1.cls[m.a[i].id] = 'act'; S1.formula = 'dir(A[' + i + ']) = base + i × tam = ' + m.base + ' + ' + i + ' × ' + m.tam + ' = ' + (m.base + i * m.tam);
    F.push(cuadroA(S1, '`A[' + i + ']` → **' + m.a[i].v + '**. La dirección se calcula con **una multiplicación y una suma**, sin recorrer nada: **O(1)** sin importar i ni n. Solo vale porque la memoria es **contigua**.', 3));
    return { frames: F, modelo: arrCopia(m), valor: m.a[i].v };
  }
  function insertar(m, i, x) {
    const n = m.a.length; if (i < 0 || i > n) throw new Error('La posición debe estar entre 0 y ' + n + '.');
    let nm = arrCopia(m), F = []; const id = nm.sigId++;
    let S = visA(m); let capAntes = m.cap;
    F.push(cuadroA(S, 'Arreglo: **' + lst(m.a.map(e => e.v)) + '** (capacidad ' + m.cap + '). Insertamos **' + x + '** en la posición **' + i + '**.', 1));
    if (n === m.cap) {
      const nueva = m.cap * 2; nm.cap = nueva;
      const filaNueva = [], fy = 190; for (let k = 0; k < nueva; k++) filaNueva.push(Dib.caja('nv' + k, AX + k * PASO, fy, AW, AH, '', 'vacio', String(k)));
      const S1 = clonA(S); S1.nuevoArr = filaNueva; S1.capMax = nueva; S1.H = 280; S1.etiqueta = 'arreglo lleno: se reserva uno nuevo de capacidad ' + nueva;
      F.push(cuadroA(S1, '**El arreglo está lleno** (n = capacidad = ' + n + '): no hay dónde poner el nuevo. Hay que **reservar un arreglo mayor** (el doble: ' + nueva + ') y **copiar** los ' + n + ' elementos: **O(n)**. (Así crece `list.append`: cuesta O(n) de vez en cuando y O(1) amortizado.)', [2, 3]));
      const S2 = clonA(S1); S2.libres = []; const copiaItems = [];
      m.a.forEach((e, k) => { copiaItems.push(Dib.caja('nvc' + k, AX + k * PASO, fy, AW, AH, e.v, 'ruta', String(k))); });
      S2.nuevoArr = filaNueva.concat(copiaItems); F.push(cuadroA(S2, 'Se **copian** los ' + n + ' elementos al arreglo nuevo (uno por uno).', 3));
      S = { a: m.a.map(e => Object.assign({}, e)), cap: nueva, cls: {}, pos: {}, alt: {}, libres: [], base: m.base, tam: m.tam }; S.capMax = nueva;
      F.push(cuadroA(S, 'El arreglo viejo se descarta: ahora trabajamos con el nuevo (capacidad ' + nueva + ').', 3));
    }
    // desplazar a la derecha desde el final hasta i
    const orden = []; for (let j = n - 1; j >= i; j--) orden.push(j);
    const cur = clonA(S); let desp = 0;
    orden.forEach(j => {
      const e = m.a[j]; desp++; cur.pos[e.id] = j + 1; cur.cls = {}; cur.cls[e.id] = 'act'; cur.marca = j;
      F.push(cuadroA(cur, 'Se **desplaza a la derecha** el elemento **' + e.v + '** (índice ' + j + ' → ' + (j + 1) + '): `A[' + (j + 1) + '] = A[' + j + ']`. Desplazamiento ' + desp + ' de ' + (n - i) + '.', 5));
      cur.cls = {};
    });
    const fin = clonA(cur); fin.cls = {}; fin.marca = null; fin.libres = [{ id, v: x, slot: i, y: 28, cls: 'nuevo' }];
    F.push(cuadroA(fin, n - i ? 'Quedó libre la posición **' + i + '**: llega **' + x + '**.' : 'Se inserta al final: no hubo que desplazar nada.', 6));
    nm.a.splice(i, 0, { id, v: x });
    const S5 = visA(nm); S5.cls[id] = 'nuevo'; if (nm.cap > S5.cap) S5.cap = nm.cap; S5.capMax = nm.cap;
    F.push(cuadroA(S5, '`A[' + i + '] = ' + x + '`. **Listo:** se hicieron **' + (n - i) + ' desplazamientos**' + (n === m.cap ? ' y una copia de ' + n + ' elementos' : '') + ': insertar en un arreglo es **O(n)** (el peor caso es al inicio, donde se mueven los n). En una lista enlazada, al inicio sería O(1).', 6));
    return { frames: F, modelo: nm, desplazamientos: n - i, copiado: n === capAntes };
  }
  function eliminar(m, i) {
    const n = m.a.length; if (i < 0 || i >= n) throw new Error('La posición debe estar entre 0 y ' + (n - 1) + '.');
    const nm = arrCopia(m), S = visA(m), F = [], quita = m.a[i]; nm.a.splice(i, 1);
    F.push(cuadroA(S, 'Arreglo: **' + lst(m.a.map(e => e.v)) + '**. Eliminamos la posición **' + i + '** (valor **' + quita.v + '**).', 1));
    const S1 = clonA(S); S1.cls[quita.id] = 'mal'; F.push(cuadroA(S1, 'El elemento **' + quita.v + '** se va; queda un **hueco** en la posición ' + i + ' que hay que **cerrar** desplazando todo lo que sigue a la izquierda.', 2));
    const cur = clonA(S); cur.a = cur.a.filter(e => e.id !== quita.id); let desp = 0;
    for (let j = i + 1; j < n; j++) {
      const e = m.a[j]; desp++; cur.pos[e.id] = j - 1; cur.cls = { [e.id]: 'act' };
      F.push(cuadroA(cur, 'Se **desplaza a la izquierda** el elemento **' + e.v + '** (índice ' + j + ' → ' + (j - 1) + '): `A[' + (j - 1) + '] = A[' + j + ']`. Desplazamiento ' + desp + ' de ' + (n - 1 - i) + '.', 3));
    }
    const S5 = visA(nm);
    F.push(cuadroA(S5, '**Listo:** ' + (n - 1 - i) + ' desplazamientos: eliminar en un arreglo es **O(n)** (peor caso: la posición 0). La última casilla queda libre (`A[n-1] = None`).', 4));
    return { frames: F, modelo: nm, desplazamientos: n - 1 - i };
  }
  function buscar(m, x) {
    const S = visA(m), F = [], n = m.a.length; let comps = 0;
    F.push(cuadroA(S, 'Buscamos **' + x + '** en **' + lst(m.a.map(e => e.v)) + '**. Sin orden no hay atajo: se revisa **elemento por elemento**.', 2));
    for (let i = 0; i < n; i++) {
      comps++; const Sc = clonA(S); Sc.marca = i; Sc.cls[m.a[i].id] = m.a[i].v === x ? 'ok' : 'ruta';
      F.push(cuadroA(Sc, '¿`A[' + i + '] == ' + x + '`? (**' + m.a[i].v + '**) → **' + (m.a[i].v === x ? 'sí' : 'no') + '**.', 3));
      if (m.a[i].v === x) { F.push(cuadroA(Sc, '**Encontrado en el índice ' + i + '** tras ' + comps + ' comparaciones. Peor caso: **O(n)**.', 4)); return { frames: F, modelo: arrCopia(m), indice: i, comparaciones: comps }; }
    }
    F.push(cuadroA(S, 'Se revisaron los ' + n + ' elementos: **no está** (`return -1`). **O(n)**.', 5));
    return { frames: F, modelo: arrCopia(m), indice: -1, comparaciones: comps };
  }

  /* ===================================================================== suma de prefijos ===================================================================== */
  const PRE_COD = ['class SumaRango:', '    def __init__(self, A):', '        self.P = [0] * len(A)', '        self.P[0] = A[0]', '        for i in range(1, len(A)):          # O(n): construcción', '            self.P[i] = self.P[i - 1] + A[i]', '    def consulta(self, i, j):               # O(1): cada consulta', '        return self.P[j] if i == 0 else self.P[j] - self.P[i - 1]'];
  function prefijos(A, consultas) {
    const n = A.length, P = new Array(n).fill(0), F = [], W = Math.max(560, AX * 2 + n * PASO), H = 300, ya = new Set();
    const items = (o) => {
      o = o || {}; const it = [];
      it.push(Dib.etq('ta', AX, 14, 'A (datos)', 'gris', 'start'), Dib.etq('tp', AX, 134, 'P (prefijos): P[i] = A[0] + … + A[i]', 'gris', 'start'));
      A.forEach((v, i) => it.push(Dib.caja('A' + i, AX + i * PASO, 28, AW, AH, v, o.a && o.a.includes(i) ? 'act' : (o.rango && i >= o.rango[0] && i <= o.rango[1] ? 'ruta' : ''), String(i))));
      A.forEach((v, i) => it.push(Dib.caja('P' + i, AX + i * PASO, 148, AW, AH, ya.has(i) ? P[i] : '', o.p && o.p.includes(i) ? 'act' : (ya.has(i) ? '' : 'vacio'), String(i))));
      if (o.rango) it.push(Dib.rect('rg', AX + o.rango[0] * PASO - 4, 24, (o.rango[1] - o.rango[0] + 1) * PASO + 2, AH + 8, ''));
      if (o.texto) it.push(Dib.etq('res', AX, 250, o.texto, 'grande', 'start'));
      return it;
    };
    const fr = (msg, linea, o) => F.push({ items: items(o), msg, linea, W, H });
    fr('**Suma de prefijos.** Un solo recorrido **O(n)** construye P; después **cada consulta de suma de rango** cuesta **O(1)**: q(i, j) = P[j] − P[i−1].', 3);
    for (let i = 0; i < n; i++) {
      P[i] = i === 0 ? A[0] : P[i - 1] + A[i]; ya.add(i);
      fr(i === 0 ? '`P[0] = A[0] = ' + A[0] + '`.' : '`P[' + i + '] = P[' + (i - 1) + '] + A[' + i + '] = ' + P[i - 1] + ' + ' + A[i] + ' = ' + P[i] + '`.', i === 0 ? 4 : 6, { a: [i], p: i ? [i - 1, i] : [i] });
    }
    const res = [];
    (consultas || []).forEach(([i, j]) => {
      const val = i === 0 ? P[j] : P[j] - P[i - 1]; res.push(val);
      fr('**Consulta q(' + i + ', ' + j + ')** = suma de A[' + i + '] a A[' + j + ']. Se resuelve con **dos lecturas**: ' + (i === 0 ? 'como i = 0, q = P[' + j + '] = **' + P[j] + '**.' : '`P[' + j + '] − P[' + (i - 1) + '] = ' + P[j] + ' − ' + P[i - 1] + ' = ' + val + '`.') + ' Comprobación: ' + A.slice(i, j + 1).join(' + ') + ' = ' + val + ' ✔. **O(1)**.', 8, { rango: [i, j], p: i === 0 ? [j] : [j, i - 1], texto: 'q(' + i + ', ' + j + ') = ' + val });
    });
    return { frames: F, P, resultados: res };
  }

  /* ===================================================================== Kadane ===================================================================== */
  const KAD_COD = ['def max_subarreglo(A):', '    s_actual = s_max = A[0]', '    for i in range(1, len(A)):', '        # extender el subarreglo previo o empezar de cero en A[i]', '        s_actual = max(A[i], s_actual + A[i])', '        s_max = max(s_max, s_actual)', '    return s_max'];
  function kadane(A) {
    const n = A.length, F = [], W = Math.max(560, AX * 2 + n * PASO), H = 320; const Sact = [], Smax = []; let ini = 0, mejorIni = 0, mejorFin = 0;
    const items = (k, o) => {
      o = o || {}; const it = [];
      it.push(Dib.etq('ta', AX, 14, 'A', 'gris', 'start'), Dib.etq('t1', AX, 128, 'S_act[i]: mejor suma de un subarreglo que TERMINA en i', 'gris', 'start'), Dib.etq('t2', AX, 208, 'S_max[i]: mejor suma vista hasta i', 'gris', 'start'));
      A.forEach((v, i) => it.push(Dib.caja('A' + i, AX + i * PASO, 28, AW, AH, v, i === k ? 'act' : '', String(i))));
      A.forEach((v, i) => it.push(Dib.caja('S' + i, AX + i * PASO, 142, AW, AH, i <= k ? Sact[i] : '', i === k ? 'act' : (i < k ? '' : 'vacio'))));
      A.forEach((v, i) => it.push(Dib.caja('M' + i, AX + i * PASO, 222, AW, AH, i <= k ? Smax[i] : '', i === k ? 'act' : (i < k ? '' : 'vacio'))));
      if (o.rango) it.push(Dib.rect('rg', AX + o.rango[0] * PASO - 4, 24, (o.rango[1] - o.rango[0] + 1) * PASO + 2, AH + 8, 'ok'));
      if (o.texto) it.push(Dib.etq('res', AX, 290, o.texto, 'grande', 'start'));
      return it;
    };
    const fr = (k, msg, linea, o) => F.push({ items: items(k, o), msg, linea, W, H });
    Sact[0] = Smax[0] = A[0]; mejorIni = mejorFin = 0;
    fr(0, '**Kadane**: en cada elemento se decide **extender** el subarreglo anterior o **empezar de nuevo**. Inicio: `s_actual = s_max = A[0] = ' + A[0] + '`.', 2);
    for (let i = 1; i < n; i++) {
      const ext = Sact[i - 1] + A[i], reinicia = A[i] > ext;
      Sact[i] = reinicia ? A[i] : ext; if (reinicia) ini = i;
      const mejora = Sact[i] > Smax[i - 1]; Smax[i] = mejora ? Sact[i] : Smax[i - 1]; if (mejora) { mejorIni = ini; mejorFin = i; }
      fr(i, '**i = ' + i + '** (A[i] = ' + A[i] + '). `max(A[i], s_actual + A[i]) = max(' + A[i] + ', ' + Sact[i - 1] + ' + ' + A[i] + ') = max(' + A[i] + ', ' + ext + ')` → **' + (reinicia ? 'se reinicia en A[i]' : 'se extiende') + '** (S_act = ' + Sact[i] + '). ' + (mejora ? 'Nuevo mejor: `s_max = ' + Smax[i] + '`.' : '`s_max` se queda en ' + Smax[i] + '.'), [5, 6]);
    }
    fr(n - 1, '**Resultado: ' + Smax[n - 1] + '**, el subarreglo contiguo **' + lst(A.slice(mejorIni, mejorFin + 1)) + '** (índices ' + mejorIni + '–' + mejorFin + '). Una sola pasada: **O(n)** tiempo y **O(1)** espacio (solo dos variables).', 7, { rango: [mejorIni, mejorFin], texto: 'máximo = ' + Smax[n - 1] });
    return { frames: F, max: Smax[n - 1], inicio: mejorIni, fin: mejorFin };
  }

  /* ===================================================================== dos punteros ===================================================================== */
  const DOS_COD = ['def par_que_suma(A, S):            # A ordenado', '    l, r = 0, len(A) - 1', '    while l < r:', '        suma = A[l] + A[r]', '        if suma == S:', '            return (l, r)', '        elif suma < S:', '            l += 1                    # necesito una suma mayor', '        else:', '            r -= 1                    # necesito una suma menor', '    return None                       # no existe tal par'];
  function dosPunteros(A, S) {
    const n = A.length, F = [], W = Math.max(560, AX * 2 + n * PASO), H = 270; let l = 0, r = n - 1;
    const items = (o) => {
      o = o || {}; const it = [];
      A.forEach((v, i) => it.push(Dib.caja('A' + i, AX + i * PASO, 70, AW, AH, v, o.hallado && (i === l || i === r) ? 'ok' : (i === l || i === r ? 'act' : (i < l || i > r ? 'suave' : '')), String(i))));
      if (l < n) { it.push(Dib.etq('pl', AX + l * PASO + AW / 2, 34, 'l', 'ptr'), Dib.fl('pfl', AX + l * PASO + AW / 2, 44, AX + l * PASO + AW / 2, 67, 'act')); }
      if (r >= 0) { it.push(Dib.etq('pr', AX + r * PASO + AW / 2, 186, 'r', 'ptr'), Dib.fl('pfr', AX + r * PASO + AW / 2, 176, AX + r * PASO + AW / 2, 116, 'act')); }
      if (o.texto) it.push(Dib.etq('res', AX, 236, o.texto, o.cls || 'grande', 'start'));
      return it;
    };
    const fr = (msg, linea, o) => F.push({ items: items(o), msg, linea, W, H });
    fr('**Dos punteros** sobre un arreglo **ordenado**: buscamos dos elementos que sumen **S = ' + S + '**. `l` empieza al inicio y `r` al final. De O(n²) a **O(n)**.', 2);
    let pasos = 0, par = null;
    while (l < r) {
      pasos++; const suma = A[l] + A[r];
      if (suma === S) { par = [l, r]; fr('`A[l] + A[r] = ' + A[l] + ' + ' + A[r] + ' = ' + suma + '` = ' + S + ' → ✔ **encontrado**: los índices (' + l + ', ' + r + ').', [4, 5, 6], { texto: A[l] + ' + ' + A[r] + ' = ' + S, hallado: true, cls: 'ok' }); break; }
      if (suma < S) { fr('`' + A[l] + ' + ' + A[r] + ' = ' + suma + ' < ' + S + '`: la suma debe **crecer** → avanzo `l` a la derecha (`l += 1`). Descarto A[' + l + '] = ' + A[l] + ' para siempre: con cualquier otro de la derecha seguiría quedando corta.', [4, 7, 8], { texto: A[l] + ' + ' + A[r] + ' = ' + suma + ' < ' + S }); l++; }
      else { fr('`' + A[l] + ' + ' + A[r] + ' = ' + suma + ' > ' + S + '`: la suma debe **decrecer** → retrocedo `r` a la izquierda (`r -= 1`). Descarto A[' + r + '] = ' + A[r] + ': con cualquier otro de la izquierda seguiría pasándose.', [4, 9, 10], { texto: A[l] + ' + ' + A[r] + ' = ' + suma + ' > ' + S }); r--; }
    }
    if (!par) fr('`l` y `r` se cruzaron: **no existe** ningún par que sume ' + S + ' (`return None`). Se hicieron ' + pasos + ' pasos: **O(n)**.', 11, { texto: 'sin solución', cls: 'mal' });
    return { frames: F, par, pasos };
  }

  /* ===================================================================== ventana deslizante ===================================================================== */
  const VEN_COD = ['def subcadena_sin_repetir(s):', '    vistos = set()                     # caracteres dentro de la ventana', '    l = mejor = 0', '    for r in range(len(s)):', '        while s[r] in vistos:          # restricción violada: encoger por la izquierda', '            vistos.remove(s[l])', '            l += 1', '        vistos.add(s[r])               # extender por la derecha', '        mejor = max(mejor, r - l + 1)', '    return mejor'];
  function ventana(s) {
    const cs = Array.from(s), n = cs.length, F = [], W = Math.max(560, AX * 2 + n * 52), H = 300; const vistos = []; let l = 0, mejor = 0, mejorIni = 0;
    const items = (r, o) => {
      o = o || {}; const it = [];
      cs.forEach((c, i) => it.push(Dib.caja('c' + i, AX + i * 52, 80, 44, 44, c, i === r ? 'act' : (i >= l && i <= r ? 'ruta' : (i < l ? 'suave' : '')), String(i))));
      if (r >= 0 && r < n) { it.push(Dib.rect('win', AX + l * 52 - 4, 74, (r - l + 1) * 52, 56, '')); it.push(Dib.etq('pl', AX + l * 52 + 22, 52, 'l', 'ptr'), Dib.etq('pr', AX + r * 52 + 22, 52 + 0, r === l ? '' : 'r', 'ptr')); }
      it.push(Dib.etq('vv', AX, 170, 'vistos = {' + vistos.join(', ') + '}', 'tit', 'start'), Dib.etq('mj', AX, 198, 'mejor = ' + mejor + (mejor ? '   ("' + cs.slice(mejorIni, mejorIni + mejor).join('') + '")' : ''), 'tit', 'start'));
      if (o.texto) it.push(Dib.etq('res', AX, 262, o.texto, o.cls || 'grande', 'start'));
      return it;
    };
    const fr = (r, msg, linea, o) => F.push({ items: items(r, o), msg, linea, W, H });
    fr(-1, '**Ventana deslizante** [l, r]: buscamos la subcadena **más larga sin caracteres repetidos** en **"' + s + '"**. Si el nuevo carácter ya está en la ventana, se **encoge por la izquierda**; si no, se **extiende por la derecha**.', 2);
    for (let r = 0; r < n; r++) {
      while (vistos.includes(cs[r])) {
        fr(r, '`' + cs[r] + '` **ya está** en la ventana: se viola la restricción. Se saca `' + cs[l] + '` por la izquierda (`l = ' + (l + 1) + '`).', [5, 6, 7], { texto: 'repetido: ' + cs[r] });
        vistos.splice(vistos.indexOf(cs[l]), 1); l++;
      }
      vistos.push(cs[r]);
      if (r - l + 1 > mejor) { mejor = r - l + 1; mejorIni = l; }
      fr(r, '`vistos.add("' + cs[r] + '")`: la ventana crece a **"' + cs.slice(l, r + 1).join('') + '"** (longitud ' + (r - l + 1) + '). `mejor = ' + mejor + '`.', [8, 9]);
    }
    fr(n, '**Resultado: ' + mejor + '** ("' + cs.slice(mejorIni, mejorIni + mejor).join('') + '"). Cada carácter **entra una vez y sale a lo sumo una vez**: 2n operaciones → **O(n)** aunque haya un `while` dentro del `for`.', 10, { texto: 'longitud máxima = ' + mejor, cls: 'ok' });
    return { frames: F, mejor };
  }

  /* ===================================================================== merge intervals ===================================================================== */
  const MER_COD = ['def fusionar_intervalos(intervalos):', '    intervalos.sort(key=lambda par: par[0])   # O(n log n): por extremo izquierdo', '    salida = [intervalos[0]]', '    for a, b in intervalos[1:]:', '        ultimo_a, ultimo_b = salida[-1]', '        if a <= ultimo_b:                     # se solapan: extender', '            salida[-1] = (ultimo_a, max(ultimo_b, b))', '        else:                                 # sin solape: nuevo intervalo', '            salida.append((a, b))', '    return salida'];
  function fusionar(iv) {
    const F = [], W = 640, H = 330, X = 50, maxT = Math.max(...iv.map(p => p[1])) + 1, sc = (W - X - 30) / maxT;
    const barra = (id, a, b, y, cls) => Dib.rect(id, X + a * sc, y, Math.max(6, (b - a) * sc), 22, 'barra ' + (cls || ''), '(' + a + ',' + b + ')');
    const lanes = (lista) => lista.map((p, k) => k);
    const estado = { orden: iv.map((p, i) => i), salida: [], act: null };
    const items = (o) => {
      o = o || {}; const it = [];
      for (let t = 0; t <= maxT; t++) it.push(Dib.etq('t' + t, X + t * sc, 14, String(t), 'gris'));
      it.push(Dib.etq('lin', 8, 38, 'entrada', 'gris', 'start'));
      o.orden.forEach((idx, k) => it.push(barra('in' + idx, iv[idx][0], iv[idx][1], 48 + k * 30, o.act === idx ? 'act' : (o.hechos && o.hechos.has(idx) ? 'ok' : ''))));
      const ySal = 48 + iv.length * 30 + 28; it.push(Dib.etq('sal', 8, ySal - 12, 'salida (fusionados)', 'gris', 'start'));
      (o.salida || []).forEach((p, k) => it.push(barra('out' + k, p[0], p[1], ySal + k * 30, 'ok')));
      return it;
    };
    const H2 = 48 + iv.length * 30 + 28 + iv.length * 30 + 40;
    const fr = (msg, linea, o) => F.push({ items: items(o), msg, linea, W, H: H2 });
    let orden = iv.map((p, i) => i);
    fr('**Merge intervals**: dado un conjunto de intervalos posiblemente solapados, producir el conjunto mínimo de intervalos **sin solape** que cubre lo mismo. Entrada: **' + iv.map(p => '(' + p[0] + ', ' + p[1] + ')').join(', ') + '**.', 1, { orden });
    orden = orden.slice().sort((x, y) => iv[x][0] - iv[y][0] || x - y);
    fr('**1.** `intervalos.sort(key=lambda par: par[0])`: se **ordenan por extremo izquierdo**. Costo **O(n log n)**: domina todo el algoritmo.', 2, { orden });
    const salida = [[iv[orden[0]][0], iv[orden[0]][1]]], hechos = new Set([orden[0]]);
    fr('**2.** `salida = [intervalos[0]]`: el primero entra a la salida.', 3, { orden, salida: salida.map(p => p.slice()), hechos });
    for (let k = 1; k < orden.length; k++) {
      const idx = orden[k], [a, b] = iv[idx], ult = salida[salida.length - 1];
      if (a <= ult[1]) {
        const nb = Math.max(ult[1], b);
        fr('**(' + a + ', ' + b + ')**: ¿`a ≤ ultimo_b`? `' + a + ' ≤ ' + ult[1] + '` → **sí, se solapan**. Se **extiende** el último: `max(' + ult[1] + ', ' + b + ') = ' + nb + '` → (' + ult[0] + ', ' + nb + ').', [5, 6, 7], { orden, salida: salida.map(p => p.slice()), act: idx, hechos });
        ult[1] = nb;
      } else {
        salida.push([a, b]);
        fr('**(' + a + ', ' + b + ')**: ¿`a ≤ ultimo_b`? `' + a + ' ≤ ' + ult[1] + '` → **no**: hay un hueco, es un **intervalo nuevo**.', [5, 8, 9], { orden, salida: salida.map(p => p.slice()), act: idx, hechos });
      }
      hechos.add(idx);
    }
    fr('**Resultado: ' + salida.map(p => '(' + p[0] + ', ' + p[1] + ')').join(', ') + '.** Tras ordenar, un solo barrido: el patrón **ordenar y barrer** (O(n log n) en total).', 10, { orden, salida: salida.map(p => p.slice()), hechos });
    return { frames: F, salida };
  }

  Sim.arreglo = { cuadro: (m, msg) => cuadroA(visA(m), msg), nuevo: arrNuevo, copia: arrCopia, acceso, insertar, eliminar, buscar, ARR_COD, escena: itemsArr, valores: m => m.a.map(e => e.v) };
  Sim.tecnicas = { prefijos, kadane, dosPunteros, ventana, fusionar, PRE_COD, KAD_COD, DOS_COD, VEN_COD, MER_COD };
})(typeof window !== 'undefined' ? window : globalThis);
