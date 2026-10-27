/* sim_pila_cola.js — animaciones de la pila (LIFO), la cola (FIFO), la deque y la cola circular (S3-C2 y S4-C1):
   apilar/desapilar, balanceo de símbolos, pila monótona (próximo día más caluroso), por qué list.pop(0) es O(n) y deque.popleft() es O(1),
   y la cola circular con aritmética módulo C. Cada operación devuelve {frames, modelo}. */
(function (global) {
  'use strict';
  const ET = global.ET, Dib = ET.Dib;
  const Sim = ET.Sim = ET.Sim || {};
  const resumirV = a => '[' + a.join(', ') + ']';

  /* ===================================================================== PILA ===================================================================== */
  const PW = 130, PH = 34, PX = 210;
  const pilaNueva = (vals, o) => Object.assign({ items: (vals || []).map((v, i) => ({ id: i + 1, v })), sigId: (vals || []).length + 1 }, o || {});
  const pilaCopia = m => Object.assign({}, m, { items: m.items.map(x => Object.assign({}, x)) });
  const pilaH = n => Math.max(270, 120 + (n + 1) * (PH + 4));
  function itemsPila(S) {
    const it = [], H = S.H || pilaH(S.items.length + (S.libres ? S.libres.length : 0)), base = H - 40;
    it.push(Dib.rect('suelo', PX - 12, base + PH + 2, PW + 24, 5, 'zona'));
    it.push(Dib.etq('lbl_base', PX + PW / 2, base + PH + 20, 'base de la pila', 'gris'));
    S.items.forEach((x, i) => it.push(Dib.caja('p' + x.id, PX, base - i * (PH + 4), PW, PH, x.v, S.cls && S.cls[x.id] || '')));
    (S.libres || []).forEach(l => it.push(Dib.caja('p' + l.id, l.x !== undefined ? l.x : PX, l.y !== undefined ? l.y : base - S.items.length * (PH + 4), PW, PH, l.v, l.cls || 'nuevo')));
    if (S.items.length) { const ty = base - (S.items.length - 1) * (PH + 4) + PH / 2; it.push(Dib.etq('tope', PX + PW + 70, ty, '← tope', 'ptr')); }
    else it.push(Dib.etq('tope', PX + PW + 70, base + PH / 2, '(pila vacía)', 'gris'));
    if (S.ret !== undefined && S.ret !== null) it.push(Dib.etq('ret', 90, base - S.items.length * (PH + 4) + PH / 2 + 4, 'devuelve ' + S.ret, S.retCls || 'ok', 'middle'));
    if (S.err) it.push(Dib.etq('err', PX + PW / 2, 24, S.err, 'mal'));
    return it;
  }
  const cuadroP = (S, msg, linea) => { const f = { items: itemsPila(S), msg, W: 520, H: S.H || pilaH(S.items.length + (S.libres ? S.libres.length : 0)) }; if (linea !== undefined) f.linea = linea; return f; };
  const clonP = S => ({ items: S.items.map(x => Object.assign({}, x)), cls: Object.assign({}, S.cls || {}), libres: (S.libres || []).map(l => Object.assign({}, l)), ret: S.ret, retCls: S.retCls, err: S.err, H: S.H });
  const PILA_COD = ['class Pila:', '    def __init__(self):', '        self._datos = []', '    def apilar(self, x):            # push  O(1)', '        self._datos.append(x)', '    def desapilar(self):            # pop   O(1)', '        if self.vacia():', '            raise IndexError("desapilar de una pila vacia")', '        return self._datos.pop()', '    def tope(self):                 # peek  O(1)', '        return self._datos[-1]', '    def vacia(self):', '        return len(self._datos) == 0'];

  function apilar(m, v) {
    const id = m.sigId, nm = pilaCopia(m); nm.sigId++; nm.items.push({ id, v });
    const S = clonP({ items: m.items }), F = [];
    S.H = pilaH(nm.items.length + 1);
    const base = S.H - 40, y = base - m.items.length * (PH + 4);
    F.push(cuadroP(S, 'Pila actual: **' + resumirV(m.items.map(x => x.v)) + '** (el último es el **tope**). Vamos a **apilar ' + v + '**.', 4));
    const S1 = clonP(S); S1.libres = [{ id, v, x: PX - 230, y, cls: 'nuevo' }]; F.push(cuadroP(S1, 'El elemento nuevo está listo para entrar **por el tope**: es el único extremo accesible.', 5));
    const S2 = clonP(S); S2.items.push({ id, v }); S2.cls[id] = 'nuevo'; S2.H = S.H; F.push(cuadroP(S2, '`self._datos.append(' + v + ')`: **' + v + '** queda arriba y el tope sube. Costo **O(1)**: no se movió ningún otro elemento.', 5));
    return { frames: F, modelo: nm };
  }
  function desapilar(m) {
    const S = clonP({ items: m.items }), F = [];
    if (!m.items.length) { S.err = 'IndexError: desapilar de una pila vacia'; F.push(cuadroP(S, '`self.vacia()` es verdadero: **no se puede desapilar de una pila vacía**; el método lanza `IndexError`. Por eso hay que comprobarlo antes.', [7, 8])); return { frames: F, modelo: pilaCopia(m), error: 'vacia' }; }
    const top = m.items[m.items.length - 1], nm = pilaCopia(m); nm.items.pop();
    F.push(cuadroP(S, 'Pila actual: **' + resumirV(m.items.map(x => x.v)) + '**. Vamos a **desapilar**: siempre sale el **último que entró** (LIFO).', 6));
    const S1 = clonP(S); S1.cls[top.id] = 'act'; F.push(cuadroP(S1, 'El tope es **' + top.v + '**.', 9));
    const S2 = clonP({ items: nm.items }); S2.libres = [{ id: top.id, v: top.v, x: PX + 230, y: S.H ? (S.H || pilaH(m.items.length)) - 40 - (m.items.length - 1) * (PH + 4) : 0, cls: 'act' }]; S2.H = pilaH(m.items.length + 1); S2.ret = top.v;
    F.push(cuadroP(S2, '`return self._datos.pop()`: se quita **' + top.v + '** y se devuelve. Costo **O(1)**: solo se toca el tope.', 9));
    const S3 = clonP({ items: nm.items }); S3.ret = top.v; S3.H = pilaH(m.items.length + 1);
    F.push(cuadroP(S3, '**Listo.** Ahora el tope es ' + (nm.items.length ? '**' + nm.items[nm.items.length - 1].v + '**' : 'ninguno: la pila quedó vacía') + '. El que entró primero sale al final.', undefined));
    return { frames: F, modelo: nm, valor: top.v };
  }
  function tope(m) {
    const S = clonP({ items: m.items }), F = [];
    if (!m.items.length) { S.err = 'IndexError: la pila está vacía'; F.push(cuadroP(S, '`tope()` sobre una pila vacía falla con `IndexError`.', 11)); return { frames: F, modelo: pilaCopia(m), error: 'vacia' }; }
    const top = m.items[m.items.length - 1]; F.push(cuadroP(S, 'Pila: **' + resumirV(m.items.map(x => x.v)) + '**.', 10));
    const S1 = clonP(S); S1.cls[top.id] = 'ok'; F.push(cuadroP(S1, '`return self._datos[-1]` → **' + top.v + '**. Se **mira sin quitar**: la pila no cambia. Costo **O(1)**.', 11));
    return { frames: F, modelo: pilaCopia(m), valor: top.v };
  }

  /* ---------- balanceo de símbolos ---------- */
  const PARES = { ')': '(', ']': '[', '}': '{' }, ABRE = '([{', CIERRA = ')]}';
  const BAL_COD = ['def balanceado(texto):', '    pila = []', '    pares = {")": "(", "]": "[", "}": "{"}', '    for c in texto:', '        if c in "([{":', '            pila.append(c)             # abre: se apila', '        elif c in ")]}":', '            if not pila or pila.pop() != pares[c]:', '                return False           # cierra sin abrir, o no coincide', '    return len(pila) == 0              # ¿quedó algo abierto?'];
  function balanceo(texto) {
    const F = [], chars = Array.from(texto), n = chars.length, W = Math.max(520, 60 + n * 46 + 200), H = 330, SX = 40, base = H - 50;
    let pila = [], contador = 0, estado = null;   // estado: null | 'mal'
    const itemsB = (i, opciones) => {
      const it = []; opciones = opciones || {};
      chars.forEach((c, k) => it.push(Dib.caja('c' + k, 40 + k * 46, 26, 38, 38, c, k < i ? (opciones.malEn === k ? 'mal' : 'suave') : (k === i ? 'act' : ''), String(k))));
      if (i >= 0 && i < n) it.push(Dib.fl('cur', 59 + i * 46, 96, 59 + i * 46, 70, 'act'));
      pila.forEach((p, j) => it.push(Dib.caja('s' + p.id, SX, base - j * 38, 70, 32, p.c, opciones.malPila ? 'mal' : '')));
      it.push(Dib.rect('suelo', SX - 8, base + 34, 86, 5, 'zona')); it.push(Dib.etq('lp', SX + 35, base + 54, 'pila', 'gris'));
      if (pila.length) it.push(Dib.etq('tope', SX + 110, base - (pila.length - 1) * 38 + 16, '← tope', 'ptr', 'start'));
      it.push(Dib.etq('ct', 330, 150, 'Contador ingenuo: ' + contador, 'tit', 'start'));
      it.push(Dib.etq('ct2', 330, 172, '(+1 al abrir, −1 al cerrar)', 'gris', 'start'));
      it.push(Dib.etq('pt', 330, 214, 'Pila: ' + (pila.length ? pila.map(p => p.c).join(' ') : '(vacía)'), 'tit', 'start'));
      if (opciones.veredicto) it.push(Dib.etq('ver', 330, 262, opciones.veredicto, opciones.vcls || 'grande', 'start'));
      return it;
    };
    const fr = (i, msg, linea, op) => F.push({ items: itemsB(i, op), msg, linea, W, H });
    fr(-1, 'Comprobamos si **' + texto + '** está bien balanceado y anidado. Se apila cada apertura y se desapila con cada cierre.', 2);
    let id = 1, ok = true, razon = '';
    for (let i = 0; i < n && ok; i++) {
      const c = chars[i];
      if (ABRE.includes(c)) {
        contador++; pila.push({ id: id++, c });
        fr(i, '`' + c + '` es una **apertura**: se **apila**. (El contador sube a ' + contador + '.)', 6);
      } else if (CIERRA.includes(c)) {
        contador--;
        if (!pila.length) { ok = false; razon = 'la pila está vacía: hay un `' + c + '` sin abrir'; fr(i, '`' + c + '` es un **cierre** pero la pila está **vacía**: no hay nada que cerrar → **no balanceado**.', 8, { malEn: i, veredicto: '✖ No balanceado', vcls: 'mal' }); break; }
        const cima = pila[pila.length - 1];
        if (cima.c !== PARES[c]) { ok = false; razon = 'no coincide'; fr(i, '`' + c + '` es un **cierre**, pero el tope de la pila es `' + cima.c + '` (esperaba `' + PARES[c] + '`) → **mal anidado**. ' + (contador === 0 ? 'Un simple contador diría que está bien (vale 0), pero la pila lo detecta.' : ''), 8, { malEn: i, malPila: true, veredicto: '✖ Mal anidado', vcls: 'mal' }); break; }
        pila.pop(); fr(i, '`' + c + '` es un **cierre**: el tope (`' + cima.c + '`) coincide → se **desapila**. (El contador baja a ' + contador + '.)', 8);
      } else fr(i, '`' + c + '` no es un símbolo de agrupación: se ignora.', 4);
    }
    if (ok) {
      if (pila.length) { ok = false; fr(n, 'Se acabó el texto pero **la pila no está vacía** (`' + pila.map(p => p.c).join('') + '` sin cerrar) → **no balanceado**.', 10, { veredicto: '✖ Quedó algo abierto', vcls: 'mal', malPila: true }); }
      else fr(n, 'Se acabó el texto y **la pila quedó vacía** → ✔ **balanceado**. Cada elemento se apiló y desapiló una vez: **O(n)**.', 10, { veredicto: '✔ Balanceado', vcls: 'ok' });
    }
    return { frames: F, balanceado: ok };
  }

  /* ---------- pila monótona: días hasta un día más caluroso ---------- */
  const MON_COD = ['def dias_hasta_mas_calor(T):', '    n = len(T)', '    D = [0] * n', '    pila = []                       # guarda INDICES de días en espera', '    for i in range(n):', '        while pila and T[pila[-1]] < T[i]:', '            k = pila.pop()          # ese día ya encontró su día más caluroso', '            D[k] = i - k', '        pila.append(i)              # hoy también queda en espera', '    return D'];
  function monotona(T) {
    const n = T.length, F = [], W = Math.max(560, 100 + n * 62), D = new Array(n).fill(0), pila = [], H = 330;
    const decididos = new Set();
    const itemsM = (i, o) => {
      o = o || {}; const it = [];
      it.push(Dib.etq('tt', 8, 14, 'T (temperaturas)', 'gris', 'start')); it.push(Dib.etq('td', 8, 130, 'D (días de espera)', 'gris', 'start')); it.push(Dib.etq('tp', 8, 226, 'pila (índices, tope a la derecha →)', 'gris', 'start'));
      T.forEach((t, k) => it.push(Dib.caja('T' + k, 30 + k * 62, 28, 50, 40, t, k === i ? 'act' : (o.cmp === k ? 'ruta' : (k > i ? '' : 'suave')), String(k))));
      T.forEach((t, k) => it.push(Dib.caja('D' + k, 30 + k * 62, 144, 50, 40, decididos.has(k) || (i >= n && true) ? D[k] : (k <= i ? '?' : ''), o.sale === k ? 'ok' : (decididos.has(k) ? '' : 'vacio'), String(k))));
      pila.forEach((p, j) => it.push(Dib.caja('P' + p, 30 + j * 56, 240, 46, 36, p, j === pila.length - 1 ? (o.sale === p ? 'ok' : 'act') : '', 'T=' + T[p])));
      if (i >= 0 && i < n) it.push(Dib.fl('cur', 55 + i * 62, 92, 55 + i * 62, 70, 'act'));
      if (o.sale !== undefined && o.sale !== null && i >= 0 && i < n) it.push(Dib.fl('res', 55 + i * 62, 92, 55 + o.sale * 62, 142, 'ok', 22));
      return it;
    };
    const fr = (i, msg, linea, o) => F.push({ items: itemsM(i, o), msg, linea, W, H });
    fr(-1, 'Para cada día queremos saber **cuántos días faltan hasta una temperatura mayor** (0 si no la hay). La pila guarda los **índices de los días que aún esperan**; su temperatura queda en orden no creciente de la base al tope.', 4);
    for (let i = 0; i < n; i++) {
      fr(i, '**Día ' + i + '** (T = ' + T[i] + '). ' + (pila.length ? 'El tope es el día ' + pila[pila.length - 1] + ' (T = ' + T[pila[pila.length - 1]] + ').' : 'La pila está vacía.'), 5);
      while (pila.length && T[pila[pila.length - 1]] < T[i]) {
        const k = pila.pop(); D[k] = i - k; decididos.add(k);
        fr(i, '`' + T[i] + ' > ' + T[k] + '`: el día ' + k + ' **ya encontró** su día más caluroso (el ' + i + '). Se desapila: **D[' + k + '] = ' + i + ' − ' + k + ' = ' + D[k] + '**.', [6, 7, 8], { sale: k, cmp: k });
      }
      pila.push(i); fr(i, '`pila.append(' + i + ')`: el día ' + i + ' (T = ' + T[i] + ') también queda **en espera**. Pila de índices: **' + resumirV(pila) + '**.', 9);
    }
    fr(n, '**Resultado: D = ' + resumirV(D) + '.** Los índices que quedaron en la pila (' + (pila.length ? resumirV(pila) : 'ninguno') + ') nunca hallaron un día más caluroso (D = 0). Cada índice entra y sale **una sola vez**: **O(n)** amortizado, aunque haya un `while` dentro del `for`.', 10);
    return { frames: F, D, pila: pila.slice() };
  }

  /* ===================================================================== COLA ===================================================================== */
  const QW = 64, QH = 40, QX = 40;
  const colaNueva = (vals, o) => Object.assign({ modo: 'deque', items: (vals || []).map((v, i) => ({ id: i + 1, v })), base: 0, sigId: (vals || []).length + 1, costo: 0 }, o || {});
  const colaCopia = m => Object.assign({}, m, { items: m.items.map(x => Object.assign({}, x)) });
  function itemsCola(S) {
    const it = [], b = S.base || 0, n = S.items.length;
    S.items.forEach((x, i) => it.push(Dib.caja('q' + x.id, QX + (b + i + (S.dx && S.dx[x.id] ? S.dx[x.id] : 0)) * (QW + 8), 70, QW, QH, x.v, S.cls && S.cls[x.id] || '', String(i))));
    (S.libres || []).forEach(l => it.push(Dib.caja('q' + l.id, QX + l.slot * (QW + 8), l.y !== undefined ? l.y : 70, QW, QH, l.v, l.cls || 'nuevo')));
    if (n) {
      it.push(Dib.etq('frente', QX + b * (QW + 8) + QW / 2, 36, 'frente', 'ptr')); it.push(Dib.fl('ff', QX + b * (QW + 8) + QW / 2, 44, QX + b * (QW + 8) + QW / 2, 68, 'act'));
      it.push(Dib.etq('final', QX + (b + n - 1) * (QW + 8) + QW / 2, 36, 'final', 'ptr')); if (n > 1) it.push(Dib.fl('ffn', QX + (b + n - 1) * (QW + 8) + QW / 2, 44, QX + (b + n - 1) * (QW + 8) + QW / 2, 68, 'act'));
    }
    if (S.sale) it.push(Dib.caja('q' + S.sale.id, QX + (S.sale.slot) * (QW + 8), 4 - 60 + 0, QW, QH, S.sale.v, 'act'));
    it.push(Dib.etq('costo', 8, 150, 'Movimientos de elementos hasta ahora: ' + (S.costo || 0), 'tit', 'start'));
    it.push(Dib.etq('modo', 8, 172, S.modo === 'lista' ? 'Implementación: list  (desencolar = lista.pop(0))' : 'Implementación: collections.deque  (desencolar = cola.popleft())', 'gris', 'start'));
    if (S.err) it.push(Dib.etq('err', 8, 196, S.err, 'mal', 'start'));
    return it;
  }
  const clonQ = S => ({ modo: S.modo, items: S.items.map(x => Object.assign({}, x)), base: S.base, cls: Object.assign({}, S.cls || {}), libres: (S.libres || []).map(l => Object.assign({}, l)), costo: S.costo, sale: S.sale, err: S.err, dx: Object.assign({}, S.dx || {}) });
  const cuadroQ = (S, msg, linea) => { const slots = Math.max(8, (S.base || 0) + S.items.length + 2 + (S.libres ? S.libres.length : 0)); const f = { items: itemsCola(S), msg, W: QX * 2 + slots * (QW + 8), H: 210 }; if (linea !== undefined) f.linea = linea; return f; };
  const COLA_LISTA = ['cola = []', 'cola.append(x)     # encolar:   O(1)  (se agrega al final)', 'cola.pop(0)        # desencolar: O(n)  (desplaza TODOS los demás)'];
  const COLA_DEQUE = ['from collections import deque', 'cola = deque()', 'cola.append(x)      # encolar:    O(1)', 'cola.popleft()      # desencolar: O(1)  (nada se desplaza)', '# como deque (ambos extremos):', 'd.appendleft(x)     # O(1)', 'd.pop()             # O(1)'];

  function encolar(m, v) {
    const id = m.sigId, nm = colaCopia(m); nm.sigId++; nm.items.push({ id, v }); nm.costo = (m.costo || 0) + 1;
    const S = clonQ(m), F = [];
    F.push(cuadroQ(S, 'Cola: **' + resumirV(m.items.map(x => x.v)) + '** (frente a la izquierda). **Encolar ' + v + '**: se agrega por el **final**.', m.modo === 'lista' ? 2 : 3));
    const S1 = clonQ(S); S1.libres = [{ id, v, slot: (m.base || 0) + m.items.length, y: 140, cls: 'nuevo' }]; S1.costo = nm.costo; F.push(cuadroQ(S1, 'Llega **' + v + '**…', m.modo === 'lista' ? 2 : 3));
    const S2 = clonQ(S); S2.items.push({ id, v }); S2.cls[id] = 'nuevo'; S2.costo = nm.costo; F.push(cuadroQ(S2, '`append(' + v + ')`: queda al final. Costo **O(1)** en `list` y en `deque`.', m.modo === 'lista' ? 2 : 3));
    return { frames: F, modelo: nm };
  }
  function desencolar(m) {
    const S = clonQ(m), F = [], linea = m.modo === 'lista' ? 3 : 4;
    if (!m.items.length) { S.err = 'IndexError: la cola está vacía'; F.push(cuadroQ(S, 'No hay nada que desencolar: la cola está vacía (`IndexError`).', linea)); return { frames: F, modelo: colaCopia(m), error: 'vacia' }; }
    const nm = colaCopia(m), sale = nm.items.shift(); const n = m.items.length;
    F.push(cuadroQ(S, 'Cola: **' + resumirV(m.items.map(x => x.v)) + '**. **Desencolar**: sale el **primero que entró** (FIFO), el del frente: **' + sale.v + '**.', linea));
    const S1 = clonQ(S); S1.cls[sale.id] = 'act'; F.push(cuadroQ(S1, 'El frente es **' + sale.v + '**.', linea));
    if (m.modo === 'lista') {
      // pop(0): se quita el primero y TODOS los demás se desplazan una posición hacia la izquierda, uno por uno
      let S2 = clonQ(S); S2.items.shift(); S2.sale = { id: sale.id, v: sale.v, slot: (m.base || 0) }; S2.libres = [];
      const prim = clonQ(S2); prim.items = m.items.slice(1).map(x => Object.assign({}, x)); prim.dx = {}; prim.base = m.base || 0; prim.sale = null; prim.libres = [{ id: sale.id, v: sale.v, slot: m.base || 0, y: 8, cls: 'act' }];
      // los elementos siguen en sus posiciones antiguas (un hueco a la izquierda) y se van corriendo
      const pos = {}; m.items.slice(1).forEach(x => { pos[x.id] = 1; });   // desplazamiento pendiente (en casillas, hacia la izquierda)
      const base = clonQ(prim); base.dx = {}; m.items.slice(1).forEach(x => { base.dx[x.id] = 1; });
      F.push(cuadroQ(base, '`cola.pop(0)`: se quita **' + sale.v + '** y queda un **hueco** al frente. Python debe **desplazar a la izquierda los ' + (n - 1) + ' elementos restantes**, uno por uno…', linea));
      let costo = m.costo || 0;
      m.items.slice(1).forEach((x, j) => { base.dx[x.id] = 0; costo++; const Sk = clonQ(base); Sk.cls[x.id] = 'act'; Sk.costo = costo; Sk.dx = Object.assign({}, base.dx); F.push(cuadroQ(Sk, 'Se desplaza **' + x.v + '** una casilla a la izquierda (' + (j + 1) + ' de ' + (n - 1) + ').', linea)); });
      nm.costo = costo;
      const Sf = clonQ({ modo: 'lista', items: nm.items, base: m.base || 0, costo, cls: {}, libres: [], dx: {} }); F.push(cuadroQ(Sf, '**Listo.** `pop(0)` costó **' + (n - 1) + ' desplazamientos**: es **O(n)**. Una cola de n operaciones se vuelve **O(n²)**. Para una cola correcta usa `collections.deque`.', linea));
    } else {
      nm.base = (m.base || 0) + 1; nm.costo = (m.costo || 0) + 1;
      const S2 = clonQ({ modo: 'deque', items: nm.items, base: nm.base, costo: nm.costo, cls: {}, libres: [{ id: sale.id, v: sale.v, slot: m.base || 0, y: 8, cls: 'act' }], dx: {} });
      F.push(cuadroQ(S2, '`cola.popleft()`: el **frente avanza una posición** y se devuelve **' + sale.v + '**. **Nadie más se mueve**: **O(1)**. (La deque es una lista de bloques doblemente enlazada, no un arreglo contiguo.)', linea));
      const S3 = clonQ({ modo: 'deque', items: nm.items, base: nm.base, costo: nm.costo, cls: {}, libres: [], dx: {} }); F.push(cuadroQ(S3, '**Listo.** Un solo movimiento: `popleft()` es **O(1)** (con `list.pop(0)` serían ' + (n - 1) + ').', linea));
    }
    return { frames: F, modelo: nm, valor: sale.v };
  }
  function appendleft(m, v) {
    if (m.modo !== 'deque') throw new Error('appendleft solo existe en la deque.');
    const id = m.sigId, nm = colaCopia(m); nm.sigId++; nm.items.unshift({ id, v }); nm.costo = (m.costo || 0) + 1;
    const rebase = (m.base || 0) === 0; if (!rebase) nm.base = m.base - 1;
    const S = clonQ(m), F = [];
    F.push(cuadroQ(S, 'Deque: **' + resumirV(m.items.map(x => x.v)) + '**. **appendleft(' + v + ')**: se agrega por el **frente**.', 6));
    const S1 = clonQ(S); S1.libres = [{ id, v, slot: rebase ? 0 : m.base - 1, y: 140, cls: 'nuevo' }]; if (rebase) { S1.base = 1; } F.push(cuadroQ(S1, 'El elemento llega al frente…', 6));
    const S2 = clonQ({ modo: 'deque', items: nm.items, base: rebase ? 0 : nm.base, costo: nm.costo, cls: { [id]: 'nuevo' }, libres: [], dx: {} }); F.push(cuadroQ(S2, '`appendleft(' + v + ')`: **O(1)** (en una `list`, `insert(0, x)` desplazaría todo: O(n)).', 6));
    return { frames: F, modelo: nm };
  }
  function popFinal(m) {
    if (m.modo !== 'deque') throw new Error('pop() por el final solo se muestra en la deque.');
    const S = clonQ(m), F = [];
    if (!m.items.length) { S.err = 'IndexError: pop from an empty deque'; F.push(cuadroQ(S, 'La deque está vacía.', 7)); return { frames: F, modelo: colaCopia(m), error: 'vacia' }; }
    const nm = colaCopia(m), sale = nm.items.pop(); nm.costo = (m.costo || 0) + 1;
    F.push(cuadroQ(S, 'Deque: **' + resumirV(m.items.map(x => x.v)) + '**. **pop()** quita por el **final**.', 7));
    const S1 = clonQ(S); S1.cls[sale.id] = 'act'; F.push(cuadroQ(S1, 'El último es **' + sale.v + '**.', 7));
    F.push(cuadroQ(clonQ({ modo: 'deque', items: nm.items, base: m.base, costo: nm.costo, cls: {}, libres: [], dx: {} }), '`d.pop()` devuelve **' + sale.v + '** en **O(1)**: la deque da O(1) en **ambos** extremos.', 7));
    return { frames: F, modelo: nm, valor: sale.v };
  }

  /* ---------- cola circular sobre un arreglo de tamaño fijo ---------- */
  const CW = 66, CH = 44, CX = 40, CY = 100;
  const circNueva = (C, vals) => { const m = { C, datos: new Array(C).fill(null), frente: 0, tam: 0, sigId: 1 }; (vals || []).forEach(v => { const f = circEnc(m, v); if (!f.error) { Object.assign(m, f.modelo); } }); return m; };
  const circCopia = m => ({ C: m.C, datos: m.datos.map(x => x ? Object.assign({}, x) : null), frente: m.frente, tam: m.tam, sigId: m.sigId });
  const CIRC_COD = ['class ColaCircular:', '    def __init__(self, capacidad):', '        self._datos = [None] * capacidad', '        self._cap = capacidad', '        self._frente = 0', '        self._tam = 0', '    def encolar(self, x):', '        if self._tam == self._cap:', '            raise OverflowError("cola llena")', '        final = (self._frente + self._tam) % self._cap   # da la vuelta', '        self._datos[final] = x', '        self._tam += 1', '    def desencolar(self):', '        if self._tam == 0:', '            raise IndexError("cola vacia")', '        x = self._datos[self._frente]', '        self._frente = (self._frente + 1) % self._cap', '        self._tam -= 1', '        return x'];
  function itemsCirc(m, o) {
    o = o || {}; const it = [], C = m.C, fin = m.tam ? (m.frente + m.tam - 1) % C : null;
    m.datos.forEach((d, i) => it.push(Dib.caja('c' + i, CX + i * (CW + 6), CY, CW, CH, d ? d.v : '', (o.cls && o.cls[i]) || (d ? '' : 'vacio'), String(i))));
    if (m.tam) { it.push(Dib.etq('pf', CX + m.frente * (CW + 6) + CW / 2, CY - 30, 'frente', 'ptr')); it.push(Dib.fl('pff', CX + m.frente * (CW + 6) + CW / 2, CY - 22, CX + m.frente * (CW + 6) + CW / 2, CY - 2, 'act')); it.push(Dib.etq('pn', CX + fin * (CW + 6) + CW / 2, CY + CH + 40, 'final', 'ptr')); it.push(Dib.fl('pnf', CX + fin * (CW + 6) + CW / 2, CY + CH + 28, CX + fin * (CW + 6) + CW / 2, CY + CH + 4, 'act')); }
    it.push(Dib.etq('info', CX, CY + CH + 78, 'capacidad C = ' + C + '   ·   frente = ' + m.frente + '   ·   tam = ' + m.tam + '   ·   ' + (m.tam === C ? 'LLENA' : (m.tam === 0 ? 'vacía' : 'quedan ' + (C - m.tam) + ' libres')), 'tit', 'start'));
    if (o.wrap) it.push(Dib.fl('wrap', CX + (C - 1) * (CW + 6) + CW / 2, CY + CH + 4, CX + CW / 2, CY + CH + 4, 'ok', -48));
    if (o.err) it.push(Dib.etq('err', CX, CY - 56, o.err, 'mal', 'start'));
    return it;
  }
  const cuadroC = (m, msg, linea, o) => { const f = { items: itemsCirc(m, o), msg, W: CX * 2 + m.C * (CW + 6), H: 300 }; if (linea !== undefined) f.linea = linea; return f; };
  function circEnc(m, v) {
    const F = [];
    if (m.tam === m.C) { F.push(cuadroC(m, '`tam == cap`: **la cola está llena** (`OverflowError`). Aunque `frente` y `final` coincidan, es el **tamaño** el que distingue una cola llena de una vacía.', [8, 9], { err: 'OverflowError: cola llena' })); return { frames: F, modelo: circCopia(m), error: 'llena' }; }
    const nm = circCopia(m), id = nm.sigId++, fin = (m.frente + m.tam) % m.C; nm.datos[fin] = { id, v }; nm.tam++;
    F.push(cuadroC(m, 'Encolar **' + v + '**: ¿hay lugar? `tam (' + m.tam + ') ≠ cap (' + m.C + ')` → sí.', 8));
    F.push(cuadroC(m, '`final = (frente + tam) % cap = (' + m.frente + ' + ' + m.tam + ') % ' + m.C + ' = ' + fin + '`' + (m.frente + m.tam >= m.C ? ' → **da la vuelta** al índice 0' : '') + '.', 10, { cls: { [fin]: 'act' }, wrap: m.frente + m.tam >= m.C }));
    F.push(cuadroC(nm, '`_datos[' + fin + '] = ' + v + '` y `tam += 1` (ahora ' + nm.tam + '). Todo **O(1)**: no se desplazó nada.', [11, 12], { cls: { [fin]: 'nuevo' } }));
    return { frames: F, modelo: nm };
  }
  function circDes(m) {
    const F = [];
    if (m.tam === 0) { F.push(cuadroC(m, '`tam == 0`: la cola está vacía (`IndexError`).', [14, 15], { err: 'IndexError: cola vacia' })); return { frames: F, modelo: circCopia(m), error: 'vacia' }; }
    const nm = circCopia(m), x = nm.datos[m.frente]; nm.datos[m.frente] = null; nm.frente = (m.frente + 1) % m.C; nm.tam--;
    F.push(cuadroC(m, 'Desencolar: se lee el elemento del **frente** (índice ' + m.frente + '): **' + x.v + '**.', 16, { cls: { [m.frente]: 'act' } }));
    F.push(cuadroC(nm, '`frente = (frente + 1) % cap = (' + m.frente + ' + 1) % ' + m.C + ' = ' + nm.frente + '` y `tam -= 1` (ahora ' + nm.tam + '). Devuelve **' + x.v + '**. El hueco se **reutiliza** más adelante: el arreglo es un **anillo**.', [17, 18], { wrap: m.frente + 1 >= m.C }));
    return { frames: F, modelo: nm, valor: x.v };
  }

  Sim.pila = { cuadro: (m, msg) => cuadroP(clonP({ items: m.items }), msg), nueva: pilaNueva, copia: pilaCopia, apilar, desapilar, tope, balanceo, monotona, escena: itemsPila, CODIGO: PILA_COD, BAL_COD, MON_COD, valores: m => m.items.map(x => x.v) };
  Sim.cola = { cuadro: (m, msg) => cuadroQ(clonQ(m), msg), nueva: colaNueva, copia: colaCopia, encolar, desencolar, appendleft, popFinal, COLA_LISTA, COLA_DEQUE, valores: m => m.items.map(x => x.v), escena: itemsCola,
    circ: { cuadro: (m, msg) => cuadroC(m, msg), nueva: circNueva, copia: circCopia, encolar: circEnc, desencolar: circDes, CODIGO: CIRC_COD, escena: itemsCirc, valores: m => { const r = []; for (let i = 0; i < m.tam; i++) r.push(m.datos[(m.frente + i) % m.C].v); return r; } } };
})(typeof window !== 'undefined' ? window : globalThis);
