/* sim_lista.js — animaciones de la lista enlazada simple y doble (S4-C2): insertar al inicio / al final / en una posición,
   eliminar, buscar, recorrer, invertir y detectar ciclos con la liebre y la tortuga (Floyd).
   Cada operación recibe un MODELO (lista de nodos) y devuelve {frames, modelo}: los cuadros son los pasos del código de la clase,
   con su explicación y la línea que se ejecuta; el modelo resultante se comprueba contra la implementación en Python en las pruebas. */
(function (global) {
  'use strict';
  const ET = global.ET, Dib = ET.Dib;
  const Sim = ET.Sim = ET.Sim || {};
  const NW = 92, NH = 42, STEP = 140, X0 = 46, YF = 160, YL = 52, ALTO = 262;

  const nuevoModelo = o => Object.assign({ doble: false, cola: false, nodos: [], ciclo: null, sigId: 1 }, o || {});
  const desde = (vals, o) => { const m = nuevoModelo(o); vals.forEach(v => m.nodos.push({ id: m.sigId++, v })); return m; };
  const copia = m => Object.assign({}, m, { nodos: m.nodos.map(n => Object.assign({}, n)) });
  const valores = m => m.nodos.map(n => n.v);
  const resumen = m => m.nodos.length ? m.nodos.map(n => n.v).join(' → ') + (m.ciclo !== null && m.ciclo !== undefined ? ' → (vuelve al ' + m.nodos[m.ciclo].v + ')' : ' → None') : '(lista vacía)';

  /* ---------- estado visual ---------- */
  function vis(m) {
    const orden = m.nodos.map(n => n.id), val = {}, sig = {}, ant = {};
    m.nodos.forEach((n, i) => { val[n.id] = n.v; sig[n.id] = i + 1 < m.nodos.length ? m.nodos[i + 1].id : (m.ciclo !== null && m.ciclo !== undefined ? m.nodos[m.ciclo].id : null); ant[n.id] = i > 0 ? m.nodos[i - 1].id : null; });
    return { doble: m.doble, orden, val, sig, ant, cab: orden.length ? orden[0] : null, cola: orden.length ? orden[orden.length - 1] : null, mostrarCola: m.cola, tags: [], cls: {}, libres: [], ocultas: new Set(), salida: '' };
  }
  const clon = S => ({ doble: S.doble, orden: S.orden.slice(), val: Object.assign({}, S.val), sig: Object.assign({}, S.sig), ant: Object.assign({}, S.ant), cab: S.cab, cola: S.cola, mostrarCola: S.mostrarCola, tags: S.tags.map(t => Object.assign({}, t)), cls: Object.assign({}, S.cls), libres: S.libres.map(l => Object.assign({}, l)), ocultas: new Set(S.ocultas), salida: S.salida });
  const setTag = (S, n, id, cls) => { const t = S.tags.find(x => x.n === n); if (t) { t.id = id; if (cls !== undefined) t.cls = cls; } else S.tags.push({ n, id, cls }); };
  const quitaTag = (S, n) => { S.tags = S.tags.filter(t => t.n !== n); };

  function itemsLista(S) {
    const it = [], pos = {}, tres = !!S.doble;
    S.orden.forEach((id, i) => { pos[id] = { x: X0 + i * STEP, y: YF }; });
    S.libres.forEach(l => { pos[l.id] = { x: X0 + (l.slot !== undefined ? l.slot : S.orden.length) * STEP + (l.dx !== undefined ? l.dx : -48), y: l.y !== undefined ? l.y : YL }; });
    const ids = S.orden.concat(S.libres.map(l => l.id));
    ids.forEach(id => {
      const p = pos[id], sN = S.sig[id] == null, aN = tres && S.ant[id] == null;
      it.push({ id: 'n' + id, k: 'nodoL', x: p.x, y: p.y, w: NW, h: NH, txt: S.val[id], partes: tres ? 3 : 2, nulo: sN && aN ? 'ambos' : (sN ? 'sig' : (aN ? 'ant' : '')), cls: S.cls[id] || '' });
    });
    const dX = tres ? NW * .865 : NW * .81, dYs = tres ? NH * .3 : NH * .5, dXa = NW * .135, dYa = NH * .7;
    const arco = (a, b) => Math.min(86, 30 + Math.abs(a.x - b.x) / STEP * 12);
    ids.forEach(id => {
      const A = pos[id];
      const t = S.sig[id];
      if (t != null && pos[t] && !S.ocultas.has('s' + id)) {
        const B = pos[t], x1 = A.x + dX, y1 = A.y + dYs, cls = (S.flCls && S.flCls['s' + id]) || '';
        let r;
        if (t === id) r = { x1, y1, x2: A.x + NW * .5, y2: A.y + NH + 3, cv: -60 };
        else if (Math.abs(B.y - A.y) < 8) {
          if (B.x > A.x + 1) r = B.x - A.x <= STEP + 1 ? { x1, y1, x2: B.x - 3, y2: B.y + dYs, cv: 0 } : { x1, y1, x2: B.x + NW * .3, y2: B.y - 3, cv: -arco(A, B) };
          else r = { x1, y1, x2: B.x + NW * .5, y2: B.y + NH + 3, cv: -arco(A, B) };
        } else if (B.y < A.y) r = { x1, y1, x2: B.x + NW * .5, y2: B.y + NH + 3, cv: 0 };
        else r = { x1, y1, x2: B.x + NW * .18, y2: B.y - 3, cv: 0 };
        it.push(Object.assign({ id: 's' + id, k: 'fl', cls }, r));
      }
      if (tres) {
        const t2 = S.ant[id];
        if (t2 != null && pos[t2] && !S.ocultas.has('a' + id)) {
          const B = pos[t2], x1 = A.x + dXa, y1 = A.y + dYa, cls = (S.flCls && S.flCls['a' + id]) || '';
          let r;
          if (Math.abs(B.y - A.y) < 8) r = A.x - B.x <= STEP + 1 && A.x > B.x ? { x1, y1, x2: B.x + NW + 3, y2: B.y + dYa, cv: 0 } : { x1, y1, x2: B.x + NW * .5, y2: B.y + NH + 3, cv: -arco(A, B) };
          else r = { x1, y1, x2: B.x + NW * .5, y2: B.y + NH + 3, cv: 0 };
          it.push(Object.assign({ id: 'a' + id, k: 'fl', cls }, r));
        }
      }
    });
    // punteros con nombre (cabeza, cola y los que use cada operación) apilados sobre el nodo al que apuntan
    const tags = []; if (S.cab != null) tags.push({ n: 'cabeza', id: S.cab }); if (S.mostrarCola && S.cola != null) tags.push({ n: 'cola', id: S.cola });
    S.tags.forEach(t => tags.push(t));
    const grupos = {}, nulos = [];
    tags.forEach(t => { if (t.id == null || !pos[t.id]) nulos.push(t); else (grupos[t.id] = grupos[t.id] || []).push(t); });
    Object.keys(grupos).forEach(id => grupos[id].forEach((t, j) => {
      const p = pos[id], cx = p.x + NW / 2, ty = p.y - 28 - j * 17;
      it.push(Dib.etq('t_' + t.n, cx, ty, t.n, t.cls || '')); if (j === 0) it.push(Dib.fl('tf_' + t.n, cx, ty + 9, cx, p.y - 2, 'act'));
    }));
    nulos.forEach((t, j) => { if (t.n === 'cabeza') return; it.push(Dib.etq('tn_' + t.n, 8, 12 + j * 16, t.n + ' = None', 'gris', 'start')); });
    if (S.cab == null) it.push(Dib.etq('tn_cabeza', 8, 12, 'cabeza = None (lista vacía)', 'gris', 'start'));
    // None al final de la fila
    const ult = S.orden[S.orden.length - 1];
    if (ult !== undefined && S.sig[ult] == null && !S.ocultas.has('none')) it.push(Dib.etq('none', pos[ult].x + NW + 12, YF + NH / 2, 'None', 'gris', 'start'));
    if (S.salida) it.push(Dib.etq('salida', 8, ALTO - 12, S.salida, 'grande', 'start'));
    return it;
  }
  function cuadro(S, msg, linea, foco) {
    const slots = Math.max(S.orden.length, 3) + S.libres.length;
    const f = { items: itemsLista(S), msg, W: Math.max(620, X0 * 2 + slots * STEP + 70), H: ALTO };
    if (linea !== undefined) f.linea = linea;
    const id = foco !== undefined ? foco : null;
    if (id !== null) { const i = S.orden.indexOf(id); if (i >= 0) f.foco = X0 + i * STEP + NW / 2; }
    return f;
  }
  const nombre = (S, id) => id == null ? 'None' : '**' + S.val[id] + '**';

  /* ---------- código de referencia (el de las diapositivas) ---------- */
  const NODO = ['class Nodo:', '    def __init__(self, dato):', '        self.dato = dato', '        self.siguiente = None'];
  const CODIGOS = {
    inicio: ['def insertar_inicio(self, dato):          # O(1)', '    nuevo = Nodo(dato)', '    nuevo.siguiente = self.cabeza      # el nuevo apunta al antiguo primero', '    self.cabeza = nuevo                # la cabeza pasa a ser el nuevo'],
    final: ['def insertar_final(self, dato):', '    nuevo = Nodo(dato)', '    if self.cabeza is None:', '        self.cabeza = nuevo', '        return', '    actual = self.cabeza', '    while actual.siguiente is not None:   # O(n): hay que llegar al último', '        actual = actual.siguiente', '    actual.siguiente = nuevo'],
    finalCola: ['def insertar_final(self, dato):          # con puntero a la cola: O(1)', '    nuevo = Nodo(dato)', '    if self.cabeza is None:', '        self.cabeza = self.cola = nuevo', '        return', '    self.cola.siguiente = nuevo', '    self.cola = nuevo'],
    en: ['def insertar_en(self, dato, pos):', '    if pos == 0:', '        self.insertar_inicio(dato); return', '    actual = self.cabeza', '    for _ in range(pos - 1):          # buscar el nodo en pos-1  (O(n))', '        if actual is None:', '            raise IndexError("posicion fuera de rango")', '        actual = actual.siguiente', '    nuevo = Nodo(dato)', '    nuevo.siguiente = actual.siguiente   # (1) el nuevo apunta al que estaba en pos', '    actual.siguiente = nuevo             # (2) el nodo pos-1 apunta al nuevo'],
    eliminar: ['def eliminar(self, dato):', '    actual, anterior = self.cabeza, None', '    while actual is not None:', '        if actual.dato == dato:', '            if anterior is None:             # el nodo es la CABEZA', '                self.cabeza = actual.siguiente', '            else:                            # nodo intermedio o final', '                anterior.siguiente = actual.siguiente', '            return True', '        anterior = actual                    # avanzar los dos punteros', '        actual = actual.siguiente', '    return False                             # el dato no estaba'],
    buscar: ['def buscar(self, dato):', '    actual = self.cabeza', '    while actual is not None:', '        if actual.dato == dato:', '            return actual', '        actual = actual.siguiente', '    return None'],
    recorrer: ['def recorrer(self):                    # O(n)', '    actual = self.cabeza', '    while actual is not None:', '        print(actual.dato, end=" -> ")', '        actual = actual.siguiente', '    print("None")'],
    invertir: ['def invertir(self):', '    anterior = None', '    actual = self.cabeza', '    while actual is not None:', '        siguiente = actual.siguiente    # guardar lo que viene', '        actual.siguiente = anterior     # darle la vuelta a la flecha', '        anterior = actual               # avanzar los dos punteros', '        actual = siguiente', '    self.cabeza = anterior'],
    floyd: ['def tiene_ciclo(cabeza):', '    tortuga = liebre = cabeza', '    while liebre is not None and liebre.siguiente is not None:', '        tortuga = tortuga.siguiente          # 1 paso', '        liebre = liebre.siguiente.siguiente  # 2 pasos', '        if tortuga is liebre:                # se encontraron: hay ciclo', '            return True', '    return False                             # la liebre llegó a None: sin ciclo']
  };
  const doble = (arr, extra) => arr.concat(extra || []);

  /* ===================== operaciones ===================== */
  function insertarInicio(m, v) {
    const id = m.sigId, nm = copia(m); nm.sigId++; nm.nodos.unshift({ id, v }); if (m.ciclo !== null && m.ciclo !== undefined) nm.ciclo = m.ciclo + 1;
    const S = vis(m), F = [], vacia = !m.nodos.length;
    F.push(cuadro(S, 'Lista actual: ' + resumen(m) + '. Vamos a insertar **' + v + '** al inicio.', 1, S.cab));
    const S1 = clon(S); S1.val[id] = v; S1.sig[id] = null; S1.ant[id] = null; S1.libres = [{ id, slot: 0 }]; S1.cls[id] = 'nuevo'; setTag(S1, 'nuevo', id);
    F.push(cuadro(S1, '**1.** `nuevo = Nodo(' + v + ')`: se crea un nodo suelto, con su dato y `siguiente = None`.', 2, S.cab));
    let S2 = S1;
    if (!vacia) {
      S2 = clon(S1); S2.sig[id] = S.cab; S2.flCls = { ['s' + id]: 'act' };
      F.push(cuadro(S2, '**2.** `nuevo.siguiente = self.cabeza`: el nuevo apunta al **antiguo primero** (' + nombre(S, S.cab) + '). Todavía no se perdió nada: `cabeza` sigue apuntando al antiguo primero.', 3, S.cab));
      if (m.doble) { const S2b = clon(S2); S2b.ant[S.cab] = id; S2b.flCls = { ['a' + S.cab]: 'act' }; F.push(cuadro(S2b, '(Lista **doble**) además `self.cabeza.anterior = nuevo`: el antiguo primero apunta hacia atrás al nuevo.', 3, S.cab)); S2 = S2b; }
    }
    const S3 = clon(S2); S3.cab = id; if (vacia) S3.cola = id; delete S3.flCls;
    F.push(cuadro(S3, '**3.** `self.cabeza = nuevo`: la cabeza pasa a ser el nuevo nodo.', 4, S.cab));
    const S4 = vis(nm); S4.cls[id] = 'nuevo';
    F.push(cuadro(S4, '**Listo.** Solo se reasignaron **dos referencias**; ningún nodo se desplazó en memoria: costo **O(1)**, sin importar el tamaño de la lista. (En un arreglo habría que mover los ' + m.nodos.length + ' elementos: O(n).)', undefined, id));
    return { frames: F, modelo: nm };
  }

  function insertarFinal(m, v, conCola) {
    const id = m.sigId, nm = copia(m); nm.sigId++; nm.nodos.push({ id, v });
    if (m.ciclo !== null && m.ciclo !== undefined) throw new Error('No se puede insertar al final de una lista con ciclo.');
    const S = vis(m), F = [], vacia = !m.nodos.length, usa = !!conCola;
    F.push(cuadro(S, 'Lista actual: ' + resumen(m) + '. Insertamos **' + v + '** al final' + (usa ? ' (la lista guarda un puntero a la cola).' : ' (solo se guarda la cabeza: hay que llegar al último nodo).'), usa ? 1 : 1, S.cola));
    const S1 = clon(S); S1.val[id] = v; S1.sig[id] = null; S1.ant[id] = null; S1.libres = [{ id, slot: S.orden.length }]; S1.cls[id] = 'nuevo'; setTag(S1, 'nuevo', id);
    S1.mostrarCola = usa || S.mostrarCola;
    F.push(cuadro(S1, '**1.** `nuevo = Nodo(' + v + ')`.', 2, S.cola));
    if (vacia) {
      const S2 = clon(S1); S2.cab = id; S2.cola = id; F.push(cuadro(S2, 'La lista estaba vacía (`self.cabeza is None`): `self.cabeza = nuevo`' + (usa ? ' y `self.cola = nuevo`' : '') + '.', 4, id));
    } else if (usa) {
      const S2 = clon(S1); S2.sig[S.cola] = id; if (m.doble) S2.ant[id] = S.cola; S2.flCls = { ['s' + S.cola]: 'act' };
      F.push(cuadro(S2, '**2.** `self.cola.siguiente = nuevo`: el último nodo (' + nombre(S, S.cola) + ') apunta al nuevo. No hay que recorrer nada.', 6, S.cola));
      const S3 = clon(S2); S3.cola = id; delete S3.flCls; F.push(cuadro(S3, '**3.** `self.cola = nuevo`: el puntero a la cola avanza al nuevo nodo.', 7, S.cola));
    } else {
      let cur = S.cab; const Sa = clon(S1); setTag(Sa, 'actual', cur); F.push(cuadro(Sa, '`actual = self.cabeza`: empezamos en el primero (' + nombre(S, cur) + ').', 6, cur));
      let pasos = 0;
      while (S.sig[cur] != null) {
        const sig = S.sig[cur]; pasos++;
        const Sb = clon(Sa); setTag(Sb, 'actual', sig); Sb.flCls = { ['s' + cur]: 'act' };
        F.push(cuadro(Sb, '`actual.siguiente` no es `None`: `actual = actual.siguiente` → ' + nombre(S, sig) + '. (paso ' + pasos + ' de recorrido: aquí está el costo O(n))', 8, sig));
        cur = sig; setTag(Sa, 'actual', cur);
      }
      const S2 = clon(Sa); S2.sig[cur] = id; if (m.doble) S2.ant[id] = cur; S2.flCls = { ['s' + cur]: 'act' };
      F.push(cuadro(S2, '`actual.siguiente` es `None`: llegamos al último. **`actual.siguiente = nuevo`**: ahora el último apunta al nuevo nodo.', 9, cur));
    }
    const S4 = vis(nm); S4.cls[id] = 'nuevo'; S4.mostrarCola = usa || m.cola;
    F.push(cuadro(S4, usa ? '**Listo.** Con puntero a la cola, insertar al final es **O(1)**.' : '**Listo.** Sin puntero a la cola hubo que recorrer los ' + m.nodos.length + ' nodos: insertar al final es **O(n)**; con un puntero a la cola sería O(1).', undefined, id));
    return { frames: F, modelo: nm };
  }

  function insertarEn(m, pos, v) {
    if (m.ciclo !== null && m.ciclo !== undefined) throw new Error('No se puede insertar en una lista con ciclo.');
    if (pos === 0) return insertarInicio(m, v);
    const S = vis(m), F = [];
    F.push(cuadro(S, 'Lista actual: ' + resumen(m) + '. Insertamos **' + v + '** en la posición **' + pos + '** (el primero es la posición 0).', 4, S.cab));
    let cur = S.cab; const Sa = clon(S); setTag(Sa, 'actual', cur);
    if (pos > m.nodos.length || pos < 0) {
      F.push(cuadro(Sa, '`actual = self.cabeza`. Hay que avanzar `pos - 1 = ' + (pos - 1) + '` veces…', 4, cur));
      let i = 0; while (i < pos - 1 && S.sig[cur] != null) { cur = S.sig[cur]; i++; const Sb = clon(Sa); setTag(Sb, 'actual', cur); F.push(cuadro(Sb, 'actual avanza (' + i + ').', 8, cur)); setTag(Sa, 'actual', cur); }
      const Se = clon(Sa); setTag(Se, 'actual', null); F.push(cuadro(Se, '✖ `actual is None`: **la posición ' + pos + ' está fuera de rango** (la lista tiene ' + m.nodos.length + ' nodos). Se lanza `IndexError`.', 7, cur));
      return { frames: F, modelo: copia(m), error: 'posicion fuera de rango' };
    }
    const id = m.sigId, nm = copia(m); nm.sigId++; nm.nodos.splice(pos, 0, { id, v });
    F.push(cuadro(Sa, '`actual = self.cabeza`. Hay que avanzar `pos - 1 = ' + (pos - 1) + '` vez/veces hasta el nodo que quedará **antes** del nuevo.', 4, cur));
    for (let i = 0; i < pos - 1; i++) {
      cur = S.sig[cur]; const Sb = clon(Sa); setTag(Sb, 'actual', cur); Sb.flCls = { ['s' + S.orden[i]]: 'act' };
      F.push(cuadro(Sb, '`actual = actual.siguiente` → ' + nombre(S, cur) + ' (vuelta ' + (i + 1) + ' de ' + (pos - 1) + ').', 8, cur)); setTag(Sa, 'actual', cur);
    }
    const suc = S.sig[cur];
    const S1 = clon(Sa); S1.val[id] = v; S1.sig[id] = null; S1.ant[id] = null; S1.libres = [{ id, slot: pos }]; S1.cls[id] = 'nuevo'; setTag(S1, 'nuevo', id);
    F.push(cuadro(S1, '`actual` es el nodo de la posición ' + (pos - 1) + ' (' + nombre(S, cur) + '). **`nuevo = Nodo(' + v + ')`**.', 9, cur));
    const S2 = clon(S1); S2.sig[id] = suc; S2.flCls = { ['s' + id]: 'act' };
    if (suc != null) F.push(cuadro(S2, '**(1)** `nuevo.siguiente = actual.siguiente`: el nuevo apunta a quien estaba en la posición ' + pos + ' (' + nombre(S, suc) + '). **Este paso va primero**: si se reasignara `actual.siguiente` antes, perderíamos el resto de la lista.', 10, cur));
    else F.push(cuadro(S2, '**(1)** `nuevo.siguiente = actual.siguiente`: como `actual` era el último, el nuevo queda apuntando a `None`.', 10, cur));
    const S3 = clon(S2); S3.sig[cur] = id; if (m.doble) { S3.ant[id] = cur; if (suc != null) S3.ant[suc] = id; } S3.flCls = { ['s' + cur]: 'act' };
    F.push(cuadro(S3, '**(2)** `actual.siguiente = nuevo`: el nodo anterior apunta al nuevo' + (m.doble ? ' (y, en la lista doble, también se actualizan los `anterior` del nuevo y del siguiente)' : '') + '. El nuevo ya está enlazado.', 11, id));
    const S4 = vis(nm); S4.cls[id] = 'nuevo';
    F.push(cuadro(S4, '**Listo.** Buscar el nodo costó **O(n)** (' + (pos - 1) + ' avances); enlazar el nuevo, solo **O(1)**: dos reasignaciones. Si ya tuviéramos `actual`, insertar sería O(1).', undefined, id));
    return { frames: F, modelo: nm };
  }

  function eliminar(m, v) {
    if (m.ciclo !== null && m.ciclo !== undefined) throw new Error('No se puede eliminar en una lista con ciclo.');
    const S = vis(m), F = [];
    F.push(cuadro(S, 'Lista actual: ' + resumen(m) + '. Eliminamos el primer nodo con dato **' + v + '**.', 2, S.cab));
    let cur = S.cab, ant = null; const Sa = clon(S);
    if (cur == null) { F.push(cuadro(Sa, 'La lista está vacía: el `while` no se ejecuta y `eliminar` devuelve `False`.', 12)); return { frames: F, modelo: copia(m), encontrado: false }; }
    setTag(Sa, 'actual', cur); setTag(Sa, 'anterior', null, 'gris');
    F.push(cuadro(Sa, '`actual, anterior = self.cabeza, None`: `actual` en el primero y `anterior` en `None`.', 2, cur));
    let hallado = null, comps = 0;
    while (cur != null) {
      comps++;
      const Sc = clon(Sa); Sc.cls[cur] = S.val[cur] === v ? 'ok' : 'ruta';
      F.push(cuadro(Sc, '¿`actual.dato == ' + v + '`? ' + nombre(S, cur) + ' == ' + v + ' → **' + (S.val[cur] === v ? 'sí' : 'no') + '**.', 4, cur));
      if (S.val[cur] === v) { hallado = cur; break; }
      ant = cur; cur = S.sig[cur];
      setTag(Sa, 'anterior', ant, ''); if (cur != null) setTag(Sa, 'actual', cur); else setTag(Sa, 'actual', null);
      const Sd = clon(Sa); Sd.flCls = { ['s' + ant]: 'act' };
      F.push(cuadro(Sd, '`anterior = actual; actual = actual.siguiente`: avanzan **los dos** punteros' + (cur == null ? ' (actual llegó a `None`)' : '') + '.', [10, 11], cur != null ? cur : ant));
    }
    if (hallado == null) {
      F.push(cuadro(Sa, 'Se recorrió toda la lista (' + comps + ' comparaciones) y **' + v + ' no estaba**: `eliminar` devuelve `False`. No se modifica nada.', 12));
      return { frames: F, modelo: copia(m), encontrado: false };
    }
    const nm = copia(m); const idx = m.nodos.findIndex(n => n.id === hallado); nm.nodos.splice(idx, 1);
    const suc = S.sig[hallado];
    if (ant == null) {
      const S1 = clon(Sa); S1.cab = suc; S1.cls[hallado] = 'mal'; S1.flCls = { ['s' + hallado]: 'tenue' };
      if (m.doble && suc != null) S1.ant[suc] = null;
      F.push(cuadro(S1, '`anterior is None`: el nodo es la **cabeza**. `self.cabeza = actual.siguiente`: la cabeza pasa al siguiente (' + nombre(S, suc) + ').' + (m.doble ? ' (Lista doble: el nuevo primero pone `anterior = None`.)' : ''), 6, hallado));
    } else {
      const S1 = clon(Sa); S1.sig[ant] = suc; S1.cls[hallado] = 'mal'; S1.flCls = { ['s' + ant]: 'act', ['s' + hallado]: 'tenue' };
      if (m.doble && suc != null) S1.ant[suc] = ant;
      if (m.doble && suc == null) { /* el anterior pasa a ser la cola */ S1.cola = ant; }
      F.push(cuadro(S1, '`anterior.siguiente = actual.siguiente`: se **puentea** el nodo: ' + nombre(S, ant) + (suc != null ? ' pasa a apuntar a ' + nombre(S, suc) : ' pasa a apuntar a `None`') + '.' + (m.doble ? ' (En la lista doble se actualiza también `anterior` del siguiente.)' : ''), 8, hallado));
    }
    const Sx = vis(nm); // el nodo eliminado desaparece y la fila se cierra
    F.push(cuadro(Sx, '**Listo.** El nodo **' + v + '** quedó **sin referencias entrantes**: el recolector de basura libera su memoria. Eliminar fue **O(1)** una vez localizado el nodo (' + comps + ' comparaciones para encontrarlo: la búsqueda es O(n)).', undefined, ant != null ? ant : suc));
    return { frames: F, modelo: nm, encontrado: true };
  }

  function buscar(m, v) {
    const S = vis(m), F = [];
    F.push(cuadro(S, 'Buscamos **' + v + '** en ' + resumen(m) + '. No hay índice: hay que recorrer desde la cabeza.', 2, S.cab));
    let cur = S.cab, comps = 0; const Sa = clon(S);
    if (cur == null) { F.push(cuadro(Sa, 'Lista vacía: `buscar` devuelve `None`.', 7)); return { frames: F, modelo: copia(m), encontrado: false }; }
    setTag(Sa, 'actual', cur); F.push(cuadro(Sa, '`actual = self.cabeza`.', 2, cur));
    const visto = new Set();
    while (cur != null && !visto.has(cur)) {
      visto.add(cur); comps++;
      const Sc = clon(Sa); Sc.cls[cur] = S.val[cur] === v ? 'ok' : 'ruta';
      F.push(cuadro(Sc, '¿`actual.dato == ' + v + '`? ' + nombre(S, cur) + ' → **' + (S.val[cur] === v ? 'sí' : 'no') + '**.', 4, cur));
      if (S.val[cur] === v) { const Sf = clon(Sc); F.push(cuadro(Sf, '**Encontrado** tras **' + comps + '** comparaciones: `return actual`. En el peor caso se recorre toda la lista: **O(n)**.', 5, cur)); return { frames: F, modelo: copia(m), encontrado: true, comparaciones: comps }; }
      cur = S.sig[cur]; setTag(Sa, 'actual', cur); const Sd = clon(Sa); F.push(cuadro(Sd, '`actual = actual.siguiente`' + (cur == null ? ' → `None`.' : '.'), 6, cur != null ? cur : S.cola));
    }
    F.push(cuadro(clon(Sa), '`actual` llegó a `None` tras **' + comps + '** comparaciones: `return None` (no está). **O(n)**.', 7));
    return { frames: F, modelo: copia(m), encontrado: false, comparaciones: comps };
  }

  function recorrer(m) {
    const S = vis(m), F = []; let cur = S.cab; let txt = '';
    F.push(cuadro(S, 'Recorrido: `actual = self.cabeza` y se avanza hasta `None`. Costo **O(n)**.', 2, cur));
    const Sa = clon(S); setTag(Sa, 'actual', cur); const visto = new Set();
    while (cur != null && !visto.has(cur)) {
      visto.add(cur); txt += S.val[cur] + ' -> ';
      const Sc = clon(Sa); Sc.cls[cur] = 'ruta'; Sc.salida = txt; F.push(cuadro(Sc, '`print(actual.dato, end=" -> ")` imprime **' + S.val[cur] + '**.', 4, cur));
      cur = S.sig[cur]; setTag(Sa, 'actual', cur); const Sd = clon(Sa); Sd.salida = txt; F.push(cuadro(Sd, '`actual = actual.siguiente`.', 5, cur != null ? cur : S.cola));
    }
    if (cur != null) { const Sx = clon(Sa); Sx.salida = txt + '…'; F.push(cuadro(Sx, '⚠ Volvimos a un nodo ya visitado: **la lista tiene un ciclo** y un `while` ingenuo no terminaría nunca (bucle infinito). Para detectarlo está el algoritmo de Floyd.', 3)); return { frames: F, modelo: copia(m), salida: txt }; }
    const Sf = clon(Sa); Sf.salida = txt + 'None'; F.push(cuadro(Sf, '`print("None")`: fin del recorrido. Salida: **' + txt + 'None**.', 6));
    return { frames: F, modelo: copia(m), salida: txt + 'None' };
  }

  function invertir(m) {
    if (m.ciclo !== null && m.ciclo !== undefined) throw new Error('No se puede invertir una lista con ciclo.');
    const S = vis(m), F = [], nm = copia(m); nm.nodos.reverse();
    F.push(cuadro(S, 'Invertimos la lista: **' + resumen(m) + '**. Se usan tres punteros: `anterior`, `actual` y `siguiente`.', 1, S.cab));
    let ant = null, cur = S.cab; const Sa = clon(S); Sa.mostrarCola = false;
    setTag(Sa, 'anterior', null, 'gris'); setTag(Sa, 'actual', cur);
    F.push(cuadro(Sa, '`anterior = None; actual = self.cabeza`.', [2, 3], cur));
    let paso = 0;
    while (cur != null) {
      paso++; const sig = S.sig[cur];
      setTag(Sa, 'siguiente', sig, sig == null ? 'gris' : '');
      const S1 = clon(Sa); S1.cls[cur] = 'ruta'; F.push(cuadro(S1, '**Vuelta ' + paso + '.** `siguiente = actual.siguiente`: se **guarda** lo que viene (' + nombre(S, sig) + ') antes de romper el enlace.', 5, cur));
      const S2 = clon(S1); S2.sig[cur] = ant; if (m.doble) S2.ant[cur] = sig; S2.flCls = { ['s' + cur]: 'act' };
      F.push(cuadro(S2, '`actual.siguiente = anterior`: **la flecha se da la vuelta** (' + nombre(S, cur) + ' ahora apunta a ' + nombre(S, ant) + ').', 6, cur));
      ant = cur; cur = sig; Sa.sig = S2.sig; Sa.ant = S2.ant; setTag(Sa, 'anterior', ant, ''); setTag(Sa, 'actual', cur, cur == null ? 'gris' : '');
      const S3 = clon(Sa); F.push(cuadro(S3, '`anterior = actual; actual = siguiente`: los dos punteros avanzan.', [7, 8], ant));
    }
    const S4 = clon(Sa); S4.cab = ant; S4.cola = S.cab; quitaTag(S4, 'siguiente');
    F.push(cuadro(S4, '`actual` llegó a `None`: `self.cabeza = anterior`. La cabeza pasa al que era el último (' + nombre(S, ant) + ').', 9, ant));
    const S5 = vis(nm); S5.cls[ant] = 'nuevo'; F.push(cuadro(S5, '**Listo.** Lista invertida **en el sitio**: un solo recorrido, **O(n)** de tiempo y **O(1)** de memoria extra (solo tres punteros).', undefined, ant));
    return { frames: F, modelo: nm };
  }

  function crearCiclo(m, k) {
    const nm = copia(m); nm.ciclo = k; const S = vis(nm);
    const F = [cuadro(S, 'El último nodo ahora apunta al nodo **' + nm.nodos[k].v + '** (posición ' + k + '): la lista tiene un **ciclo**. Un recorrido ingenuo con `while actual is not None` nunca terminaría.', undefined, nm.nodos[nm.nodos.length - 1].id)];
    return { frames: F, modelo: nm };
  }
  function quitarCiclo(m) { const nm = copia(m); nm.ciclo = null; return { frames: [cuadro(vis(nm), 'Se rompió el ciclo: el último nodo vuelve a apuntar a `None`.')], modelo: nm }; }

  function floyd(m) {
    const S = vis(m), F = [], tieneCiclo = m.ciclo !== null && m.ciclo !== undefined;
    F.push(cuadro(S, '**Detección de ciclos de Floyd** (liebre y tortuga): la tortuga avanza **1** paso y la liebre **2**. Si hay ciclo, la liebre alcanza a la tortuga; si llega a `None`, no lo hay. **O(n)** tiempo, **O(1)** memoria. Esta lista ' + (tieneCiclo ? '**sí** tiene ciclo' : '**no** tiene ciclo') + '.', 1, S.cab));
    if (S.cab == null) { F.push(cuadro(S, 'Lista vacía: `liebre is None`, el `while` no corre: **sin ciclo**.', 8)); return { frames: F, modelo: copia(m), ciclo: false, pasos: 0 }; }
    let t = S.cab, l = S.cab; const Sa = clon(S); Sa.mostrarCola = false; setTag(Sa, 'tortuga', t); setTag(Sa, 'liebre', l);
    F.push(cuadro(Sa, '`tortuga = liebre = cabeza`: las dos salen del primer nodo.', 2, t));
    let pasos = 0; const tope = (m.nodos.length + 2) * 3;
    while (l != null && S.sig[l] != null && pasos < tope) {
      pasos++;
      t = S.sig[t]; setTag(Sa, 'tortuga', t); const S1 = clon(Sa); S1.flCls = {}; F.push(cuadro(S1, '**Vuelta ' + pasos + '.** `tortuga = tortuga.siguiente` → ' + nombre(S, t) + ' (1 paso).', 4, t));
      const l1 = S.sig[l]; setTag(Sa, 'liebre', l1); const S2 = clon(Sa); F.push(cuadro(S2, '`liebre = liebre.siguiente.siguiente`: primer salto → ' + nombre(S, l1) + '…', 5, l1));
      l = S.sig[l1]; setTag(Sa, 'liebre', l);
      if (l == null) { const S3 = clon(Sa); F.push(cuadro(S3, '…segundo salto → `None`. La liebre llegó al final: **no hay ciclo**.', 5)); break; }
      const S3 = clon(Sa); F.push(cuadro(S3, '…segundo salto → ' + nombre(S, l) + ' (2 pasos).', 5, l));
      if (t === l) { const S4 = clon(Sa); S4.cls[t] = 'ok'; F.push(cuadro(S4, '¿`tortuga is liebre`? **Sí**: se encontraron en el nodo ' + nombre(S, t) + ' → **hay un ciclo** (`return True`). La liebre, al ir al doble de velocidad, tenía que alcanzar a la tortuga dentro del ciclo.', [6, 7], t)); return { frames: F, modelo: copia(m), ciclo: true, pasos }; }
      F.push(cuadro(clon(Sa), '¿`tortuga is liebre`? No (' + nombre(S, t) + ' ≠ ' + nombre(S, l) + '): se repite.', 6, l));
    }
    if (l != null && S.sig[l] == null) F.push(cuadro(clon(Sa), '`liebre.siguiente is None`: el `while` termina. **Sin ciclo** (`return False`).', 8));
    return { frames: F, modelo: copia(m), ciclo: false, pasos };
  }

  Sim.lista = { nuevoModelo, desde, copia, valores, resumen, insertarInicio, insertarFinal, insertarEn, eliminar, buscar, recorrer, invertir, crearCiclo, quitarCiclo, floyd, escena: S => itemsLista(S), vis, cuadro, CODIGOS, NODO, ALTO };
})(typeof window !== 'undefined' ? window : globalThis);
