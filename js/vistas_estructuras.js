/* vistas_estructuras.js — pestañas del laboratorio con las animaciones de estructuras de datos:
   listas enlazadas, pilas y colas, arreglos y técnicas, heaps, rojo-negro y memoria/referencias.
   Cada pestaña tiene controles para operar la estructura y un reproductor paso a paso con la explicación y el código; la página no se mueve
   mientras avanzas los pasos (las alturas son fijas y solo el panel de código se desplaza). */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Vc = ET.Vc, Sim = ET.Sim, RP = ET.Reproductor;
  const LE = ET.LabEstructuras = {};

  /* ---------- ayudas de interfaz ---------- */
  const intro = t => h('p', { class: 'suave', html: U.mdInline(t) });
  const btn = (t, fn, cls, tit) => h('button', { type: 'button', class: 'btn peq ' + (cls === undefined ? 'sec' : cls), title: tit || null, onclick: fn }, t);
  const campo = (ph, ancho, valor, aria) => { const i = h('input', { type: 'text', inputmode: 'numeric', placeholder: ph, 'aria-label': aria || ph, autocomplete: 'off', spellcheck: 'false', style: { width: (ancho || 90) + 'px' } }); if (valor !== undefined) i.value = valor; return i; };
  const grupo = (titulo, ...hijos) => h('div', { class: 'sim-grupo' }, titulo ? h('b', { text: titulo }) : null, ...hijos);
  const fila = (...hijos) => h('div', { class: 'sim-ctl' }, ...hijos);
  const numero = (inp, nombre) => { const t = inp.value.trim(); if (t === '') { Vc.toast('Escribe ' + nombre + '.'); return null; } const n = Number(t); if (!isFinite(n) || !/^-?\d+$/.test(t)) { Vc.toast('«' + t + '» no es un entero.'); return null; } return n; };
  const listaNum = (txt, min) => { const l = String(txt).split(/[\s,;]+/).filter(Boolean).map(Number); if (l.some(x => !isFinite(x))) throw new Error('Usa solo números separados por comas.'); if (min && l.length < min) throw new Error('Escribe al menos ' + min + ' valor(es).'); return l; };
  const chip = () => h('span', { class: 'sim-cx', text: '' });
  const avisoEjemplo = txt => h('p', { class: 'peq tenue', text: txt });
  /** monta un reproductor dentro de un contenedor propio y devuelve funciones de uso común */
  function nuevoRep(cfg) {
    const cont = h('div', { class: 'sim-rep' }); const rep = RP.crear(cont, cfg);
    return { cont, rep };
  }
  const mostrarCuadro = (rep, f, texto) => rep.mostrar(f.items, texto !== undefined ? texto : f.msg, { dur: 0, W: f.W, H: f.H });
  function pie(host, texto) { host.appendChild(h('div', { class: 'card espacio' }, h('h3', { text: 'Qué observar' }), h('div', { html: U.md(texto) }))); }
  function intentar(fn) { try { return fn(); } catch (e) { Vc.toast('⚠ ' + (e && e.message ? e.message : e)); return null; } }

  /* ===================================================================== LISTAS ENLAZADAS ===================================================================== */
  LE.listas = function (host, q) {
    const L = Sim.lista; let m = L.desde([10, 20, 30]);
    host.appendChild(intro('Mira cómo se **reasignan las referencias** al insertar, eliminar, buscar, invertir y detectar ciclos. Cada paso muestra la línea del código de la clase que se ejecuta. Los punteros con nombre (`cabeza`, `actual`, `anterior`, `tortuga`, `liebre`…) aparecen sobre el nodo al que apuntan.'));
    const selTipo = h('select', { 'aria-label': 'Tipo de lista' }, h('option', { value: 's', text: 'Lista simple' }), h('option', { value: 'd', text: 'Lista doble (anterior + siguiente)' }));
    const chkCola = h('input', { type: 'checkbox' });
    const val = campo('valor', 70, '7'), pos = campo('pos', 55, '2'), kc = campo('k', 45, '1');
    const cx = chip(), est = h('div', { class: 'sim-estado', 'aria-live': 'polite' });
    const { cont, rep } = nuevoRep({ W: 700, H: L.ALTO, codigo: L.CODIGOS.inicio, tituloCodigo: 'insertar_inicio' });
    const pintar = () => { const S = L.vis(m); S.mostrarCola = chkCola.checked; const f = L.cuadro(S, 'Lista: **' + L.resumen(m) + '**. Elige una operación.'); mostrarCuadro(rep, f); est.textContent = 'lista = ' + (m.nodos.length ? m.nodos.map(n => n.v).join(m.doble ? ' ⇄ ' : ' → ') : '(vacía)') + (m.ciclo !== null && m.ciclo !== undefined ? '   [ciclo: el último apunta al nodo ' + m.nodos[m.ciclo].v + ']' : ''); };
    const jugar = (res, clave, titulo, costo) => { if (!res) return; m = res.modelo; rep.setCodigo(L.CODIGOS[clave], titulo); rep.cargar(res.frames, { alFinal: () => { est.textContent = 'lista = ' + (m.nodos.length ? m.nodos.map(n => n.v).join(m.doble ? ' ⇄ ' : ' → ') : '(vacía)') + (m.ciclo !== null && m.ciclo !== undefined ? '   [ciclo]' : ''); } }); cx.textContent = costo || ''; };
    const reiniciar = vals => { m = L.desde(vals, { doble: selTipo.value === 'd', cola: chkCola.checked }); cx.textContent = ''; pintar(); };
    selTipo.addEventListener('change', () => reiniciar(L.valores(m)));
    chkCola.addEventListener('change', () => { m.cola = chkCola.checked; pintar(); });
    const v0 = () => numero(val, 'un valor'), p0 = () => numero(pos, 'una posición');
    host.appendChild(fila(grupo('Estructura', selTipo, h('label', { class: 'fila peq' }, chkCola, 'puntero a la cola'))));
    host.appendChild(fila(grupo('Insertar', val, btn('al inicio', () => { const v = v0(); if (v !== null) intentar(() => jugar(L.insertarInicio(m, v), 'inicio', 'insertar_inicio', 'O(1)')); }), btn('al final', () => { const v = v0(); if (v !== null) intentar(() => jugar(L.insertarFinal(m, v, chkCola.checked), chkCola.checked ? 'finalCola' : 'final', 'insertar_final', chkCola.checked ? 'O(1) con cola' : 'O(n)')); }), pos, btn('en la posición', () => { const v = v0(), p = p0(); if (v !== null && p !== null) intentar(() => jugar(L.insertarEn(m, p, v), 'en', 'insertar_en', 'O(n) buscar + O(1) enlazar')); })),
      grupo('Eliminar / buscar', btn('eliminar el valor', () => { const v = v0(); if (v !== null) intentar(() => jugar(L.eliminar(m, v), 'eliminar', 'eliminar', 'O(1) con el nodo · O(n) buscarlo')); }), btn('buscar el valor', () => { const v = v0(); if (v !== null) intentar(() => jugar(L.buscar(m, v), 'buscar', 'buscar', 'O(n)')); }))));
    host.appendChild(fila(grupo('Recorridos y algoritmos', btn('recorrer', () => intentar(() => jugar(L.recorrer(m), 'recorrer', 'recorrer', 'O(n)'))), btn('invertir la lista', () => intentar(() => jugar(L.invertir(m), 'invertir', 'invertir', 'O(n) tiempo · O(1) memoria'))), btn('detectar ciclo (Floyd)', () => intentar(() => jugar(L.floyd(m), 'floyd', 'tiene_ciclo (liebre y tortuga)', 'O(n) tiempo · O(1) memoria')))),
      grupo('Ciclo', kc, btn('crear ciclo → nodo k', () => { const k = numero(kc, 'la posición k del ciclo'); if (k === null) return; if (k < 0 || k >= m.nodos.length) { Vc.toast('k debe estar entre 0 y ' + (m.nodos.length - 1) + '.'); return; } intentar(() => jugar(L.crearCiclo(m, k), 'floyd', 'tiene_ciclo (liebre y tortuga)', '')); }), btn('quitar ciclo', () => jugar(L.quitarCiclo(m), 'floyd', 'tiene_ciclo', ''))),
      grupo('Ejemplos', btn('lista 10-20-30', () => reiniciar([10, 20, 30])), btn('lista de 6', () => reiniciar([5, 12, 8, 21, 3, 17])), btn('vacía', () => reiniciar([])))));
    host.appendChild(h('div', { class: 'fila peq' }, h('span', { class: 'tenue', text: 'Costo de la última operación:' }), cx));
    host.appendChild(cont); host.appendChild(est);
    pintar();
    pie(host, '- **Insertar al inicio** es **O(1)**: solo se reasignan dos referencias; en un arreglo habría que desplazar todo (O(n)).\n- **El orden importa**: al insertar en el medio, primero `nuevo.siguiente = actual.siguiente` y luego `actual.siguiente = nuevo`; al revés se pierde el resto de la lista.\n- **Eliminar** es **puentear** el nodo; el nodo queda sin referencias y el recolector lo libera.\n- **Acceso por índice**: no existe; hay que recorrer (**O(n)**).\n- **Floyd**: la liebre (2 pasos) alcanza a la tortuga (1 paso) solo si hay ciclo; usa **O(1)** de memoria.');
    const demos = { ini: () => jugar(L.insertarInicio(m, 5), 'inicio', 'insertar_inicio', 'O(1)'), fin: () => jugar(L.insertarFinal(m, 40, false), 'final', 'insertar_final', 'O(n)'), en: () => jugar(L.insertarEn(m, 1, 15), 'en', 'insertar_en', 'O(n)'), elim: () => jugar(L.eliminar(m, 20), 'eliminar', 'eliminar', 'O(1)'), buscar: () => jugar(L.buscar(m, 30), 'buscar', 'buscar', 'O(n)'), inv: () => jugar(L.invertir(m), 'invertir', 'invertir', 'O(n)'), floyd: () => { m = L.desde([1, 2, 3, 4, 5], { doble: false }); m = L.crearCiclo(m, 1).modelo; pintar(); jugar(L.floyd(m), 'floyd', 'tiene_ciclo', 'O(n)'); } };
    if (q && q.e && demos[q.e]) setTimeout(demos[q.e], 80);
    return () => rep.destruir();
  };

  /* ===================================================================== PILAS Y COLAS ===================================================================== */
  LE.pilas = function (host, q) {
    const modos = [['pila', '📚 Pila (LIFO)'], ['bal', '( ) Balanceo de símbolos'], ['mon', '🌡 Pila monótona'], ['cola', '🚶 Cola: list vs deque'], ['circ', '⭕ Cola circular']];
    let actual = (q && q.e && modos.some(x => x[0] === q.e)) ? q.e : 'pila', limpiar = null;
    host.appendChild(intro('**Pila** (último en entrar, primero en salir) y **cola** (primero en entrar, primero en salir). Elige el tema: operaciones básicas, el problema del balanceo de paréntesis, la pila monótona de las temperaturas, por qué `list.pop(0)` es una mala cola y cómo la cola circular reutiliza los huecos.'));
    const tabs = h('div', { class: 'tabs' }); const zona = h('div');
    modos.forEach(([k, t]) => tabs.appendChild(h('button', { type: 'button', class: 'tab' + (k === actual ? ' act' : ''), onclick: () => { actual = k; U.$$('.tab', tabs).forEach((x, i) => x.classList.toggle('act', modos[i][0] === k)); montar(); } }, t)));
    host.append(tabs, zona);
    function montar() { if (limpiar) limpiar(); U.vaciar(zona); limpiar = ({ pila: vPila, bal: vBal, mon: vMon, cola: vCola, circ: vCirc })[actual](zona, q); }
    montar();
    return () => { if (limpiar) limpiar(); };
  };

  function vPila(zona) {
    const P = Sim.pila; let m = P.nueva([3, 7, 1]); const val = campo('valor', 70, '9'), cx = chip();
    const { cont, rep } = nuevoRep({ W: 520, H: 280, codigo: P.CODIGO, tituloCodigo: 'class Pila' });
    const pintar = () => mostrarCuadro(rep, P.cuadro(m, 'Pila: **' + (m.items.length ? '[' + m.items.map(x => x.v).join(', ') + ']' : 'vacía') + '** (el último es el tope).'));
    const jugar = (res, costo) => { if (!res) return; m = res.modelo; rep.cargar(res.frames); cx.textContent = costo; };
    zona.appendChild(fila(grupo('Operaciones', val, btn('apilar', () => { const v = numero(val, 'un valor'); if (v !== null) jugar(P.apilar(m, v), 'O(1)'); }), btn('desapilar', () => jugar(P.desapilar(m), 'O(1)')), btn('tope (mirar sin quitar)', () => jugar(P.tope(m), 'O(1)')), btn('vaciar', () => { m = P.nueva([]); pintar(); }))));
    zona.appendChild(h('div', { class: 'fila peq' }, h('span', { class: 'tenue', text: 'Costo:' }), cx));
    zona.appendChild(cont); pintar(); pie(zona, '- Todo lo que ocurre **en el tope** es **O(1)**; mirar un elemento interno obliga a desapilar (**O(n)**).\n- Sobre una lista de Python el tope debe ser el **final** (`append`/`pop`): con `insert(0, x)`/`pop(0)` sería O(n).\n- **Desapilar una pila vacía** lanza `IndexError`: hay que comprobarlo.');
    return () => rep.destruir();
  }
  function vBal(zona) {
    const P = Sim.pila; const txt = h('input', { type: 'text', value: '([]{})', 'aria-label': 'Texto a comprobar', spellcheck: 'false', style: { width: '200px' } });
    const { cont, rep } = nuevoRep({ W: 640, H: 330, codigo: P.BAL_COD, tituloCodigo: 'balanceado(texto)' });
    const correr = () => { const t = txt.value.replace(/\s/g, ''); if (!t) { Vc.toast('Escribe un texto con ( ) [ ] { }.'); return; } if (t.length > 14) { Vc.toast('Usa hasta 14 caracteres para que quepa en la pantalla.'); return; } const r = P.balanceo(t); rep.cargar(r.frames); };
    zona.appendChild(fila(grupo('Texto', txt, btn('comprobar', correr, ''), ...['([]{})', '([)]', '((', '())', '{[()()]}'].map(x => btn(x, () => { txt.value = x; correr(); })))));
    zona.appendChild(cont); correr();
    pie(zona, '- Una **pila** resuelve el balanceo porque lo que importa es **qué se abrió por última vez** (LIFO).\n- Un **contador** de aperturas y cierres acepta por error `([)]` (vale 0 al final) y no detecta el mal anidamiento.\n- Cada símbolo se apila y desapila a lo sumo una vez: **O(n)**.');
    return () => rep.destruir();
  }
  function vMon(zona) {
    const P = Sim.pila; const lis = h('input', { type: 'text', value: '6, 8, 5, 4, 3, 7, 9, 6', 'aria-label': 'Temperaturas', style: { width: '240px' } });
    const { cont, rep } = nuevoRep({ W: 600, H: 330, codigo: P.MON_COD, tituloCodigo: 'dias_hasta_mas_calor(T)' });
    const correr = () => { const T = intentar(() => listaNum(lis.value, 2)); if (!T) return; if (T.length > 10) { Vc.toast('Usa hasta 10 temperaturas.'); return; } rep.cargar(P.monotona(T).frames); };
    zona.appendChild(fila(grupo('Temperaturas T', lis, btn('animar', correr, ''), btn('ejemplo de la clase', () => { lis.value = '6, 8, 5, 4, 3, 7, 9, 6'; correr(); }), btn('siempre bajando', () => { lis.value = '9, 8, 7, 6, 5'; correr(); }), btn('siempre subiendo', () => { lis.value = '1, 2, 3, 4, 5'; correr(); }))));
    zona.appendChild(cont); correr();
    pie(zona, '- La pila guarda **índices** de los días que todavía esperan un día más caluroso.\n- Al llegar el día i se **desapilan** todos los que tienen menor temperatura: ya encontraron su respuesta (`D[k] = i − k`).\n- Cada índice se apila **una vez** y se desapila **a lo sumo una vez**: **O(n)** amortizado aunque haya un `while` dentro del `for` (el ingenuo es O(n²)).\n- Los índices que quedan al final en la pila nunca encontraron un día más caluroso: `D = 0`.');
    return () => rep.destruir();
  }
  function vCola(zona) {
    const Q = Sim.cola; let m = Q.nueva([1, 2, 3, 4], { modo: 'deque' }); const val = campo('valor', 70, '9'), cx = chip();
    const sel = h('select', { 'aria-label': 'Implementación' }, h('option', { value: 'deque', text: 'collections.deque (popleft O(1))' }), h('option', { value: 'lista', text: 'list con pop(0) (O(n))' }));
    const { cont, rep } = nuevoRep({ W: 640, H: 210, codigo: Q.COLA_DEQUE, tituloCodigo: 'cola con deque' });
    const pintar = () => { rep.setCodigo(m.modo === 'lista' ? Q.COLA_LISTA : Q.COLA_DEQUE, m.modo === 'lista' ? 'cola con list' : 'cola con deque'); mostrarCuadro(rep, Q.cuadro(m, 'Cola: **' + (m.items.length ? '[' + m.items.map(x => x.v).join(', ') + ']' : 'vacía') + '** (frente a la izquierda). Implementación: **' + (m.modo === 'lista' ? 'list' : 'deque') + '**.')); };
    const jugar = (res, costo) => { if (!res) return; m = res.modelo; rep.cargar(res.frames); cx.textContent = costo || ''; };
    sel.addEventListener('change', () => { m = Q.nueva(m.items.map(x => x.v), { modo: sel.value }); cx.textContent = ''; pintar(); });
    zona.appendChild(fila(grupo('Implementación', sel), grupo('Operaciones', val, btn('encolar', () => { const v = numero(val, 'un valor'); if (v !== null) jugar(Q.encolar(m, v), 'O(1)'); }), btn('desencolar', () => jugar(Q.desencolar(m), m.modo === 'lista' ? 'O(n) (pop(0))' : 'O(1) (popleft)')), btn('appendleft (solo deque)', () => intentar(() => { const v = numero(val, 'un valor'); if (v !== null) jugar(Q.appendleft(m, v), 'O(1)'); })), btn('pop del final (solo deque)', () => intentar(() => jugar(Q.popFinal(m), 'O(1)'))))));
    zona.appendChild(h('div', { class: 'fila peq' }, h('span', { class: 'tenue', text: 'Costo:' }), cx));
    zona.appendChild(cont); pintar();
    pie(zona, '- **FIFO**: se encola por el final y se desencola por el frente.\n- Con `list`, `pop(0)` **desplaza todos los elementos**: O(n); una cola de n operaciones cuesta **O(n²)** (con n = 10⁶ es inaceptable).\n- `collections.deque` ofrece **O(1) en ambos extremos** (es una lista de bloques doblemente enlazada, no un arreglo contiguo).\n- Ojo: `d[i]` en una deque es O(n); usa `deque` para los extremos, no para acceso por índice.\n- Una **cola de prioridad** no es FIFO: sale el más urgente (se implementa con un heap).');
    return () => rep.destruir();
  }
  function vCirc(zona) {
    const C = Sim.cola.circ; let m = C.nueva(5); const val = campo('valor', 70, '7'), cap = campo('C', 45, '5');
    const { cont, rep } = nuevoRep({ W: 560, H: 300, codigo: C.CODIGO, tituloCodigo: 'class ColaCircular' });
    const pintar = () => mostrarCuadro(rep, C.cuadro(m, 'Cola circular de capacidad **' + m.C + '**: ' + (m.tam ? '**[' + C.valores(m).join(', ') + ']**' : 'vacía') + '.'));
    const jugar = res => { if (!res) return; m = res.modelo; rep.cargar(res.frames); };
    zona.appendChild(fila(grupo('Capacidad', cap, btn('crear', () => { const c = numero(cap, 'la capacidad'); if (c === null) return; if (c < 2 || c > 8) { Vc.toast('La capacidad debe estar entre 2 y 8.'); return; } m = C.nueva(c); pintar(); })), grupo('Operaciones', val, btn('encolar', () => { const v = numero(val, 'un valor'); if (v !== null) jugar(C.encolar(m, v)); }), btn('desencolar', () => jugar(C.desencolar(m))),
      btn('ejemplo de la clase', () => { m = C.nueva(5); pintar(); setTimeout(() => { let mm = C.nueva(5); ['A', 'B', 'C'].forEach(x => { mm = C.encolar(mm, x).modelo; }); mm = C.desencolar(mm).modelo; mm = C.desencolar(mm).modelo; ['D', 'E', 'F', 'G'].forEach(x => { mm = C.encolar(mm, x).modelo; }); m = mm; mostrarCuadro(rep, C.cuadro(m, 'Estado de la diapositiva 12 tras encolar A,B,C · desencolar ×2 · encolar D,E,F,G: **llena** (`tam = C`). Un `encolar` más lanza `OverflowError`.')); }, 60); }))));
    zona.appendChild(cont); pintar();
    pie(zona, '- El arreglo se trata como un **anillo**: `final = (frente + tam) % C` y `frente = (frente + 1) % C`, **sin desplazar nada**: todo **O(1)**.\n- Se reutilizan los huecos del inicio; una cola lineal se declararía «llena» con espacio libre.\n- **Llena** ⇔ `tam == C` (por eso se lleva el **tamaño**: con solo frente y final no se distingue llena de vacía).\n- Ideal para **búferes de tamaño fijo** (audio, video, sensores, *data loaders*).');
    return () => rep.destruir();
  }

  /* ===================================================================== ARREGLOS Y TÉCNICAS ===================================================================== */
  LE.arreglos = function (host, q) {
    const modos = [['ops', '▦ Operaciones'], ['pre', '∑ Suma de prefijos'], ['kad', '📈 Kadane'], ['dos', '⇄ Dos punteros'], ['ven', '🪟 Ventana deslizante'], ['mer', '▬ Merge intervals']];
    let actual = (q && q.e && modos.some(x => x[0] === q.e)) ? q.e : 'ops', limpiar = null;
    host.appendChild(intro('El **arreglo** da acceso **O(1)** por índice pero inserción y eliminación **O(n)**. Las técnicas de la clase (suma de prefijos, Kadane, dos punteros, ventana deslizante y *merge intervals*) comparten una idea: **no recomputar**; se mantiene un estado que se actualiza en **una sola pasada**.'));
    const tabs = h('div', { class: 'tabs' }), zona = h('div');
    modos.forEach(([k, t]) => tabs.appendChild(h('button', { type: 'button', class: 'tab' + (k === actual ? ' act' : ''), onclick: () => { actual = k; U.$$('.tab', tabs).forEach((x, i) => x.classList.toggle('act', modos[i][0] === k)); montar(); } }, t)));
    host.append(tabs, zona);
    function montar() { if (limpiar) limpiar(); U.vaciar(zona); limpiar = ({ ops: aOps, pre: aPre, kad: aKad, dos: aDos, ven: aVen, mer: aMer })[actual](zona); }
    montar();
    return () => { if (limpiar) limpiar(); };
  };
  function aOps(zona) {
    const A = Sim.arreglo; let m = A.nuevo([17, 4, 29, 8, 11], 6); const val = campo('valor', 65, '99'), idx = campo('i', 45, '2'), cx = chip();
    const { cont, rep } = nuevoRep({ W: 560, H: 270, codigo: A.ARR_COD.insertar, tituloCodigo: 'insertar' });
    const pintar = () => mostrarCuadro(rep, A.cuadro(m, 'Arreglo: **[' + A.valores(m).join(', ') + ']** · capacidad ' + m.cap + ' · base ' + m.base + ', ' + m.tam + ' bytes por elemento.'));
    const jugar = (res, clave, tit, costo) => { if (!res) return; m = res.modelo; rep.setCodigo(A.ARR_COD[clave], tit); rep.cargar(res.frames); cx.textContent = costo + (res.desplazamientos !== undefined ? ' · ' + res.desplazamientos + ' desplazamientos' : ''); };
    zona.appendChild(fila(grupo('Operaciones', val, idx, btn('acceder a A[i]', () => { const i = numero(idx, 'el índice i'); if (i !== null) jugar(A.acceso(m, i), 'acceso', 'acceso por índice', 'O(1)'); }), btn('insertar x en i', () => { const x = numero(val, 'un valor'), i = numero(idx, 'el índice i'); if (x !== null && i !== null) intentar(() => jugar(A.insertar(m, i, x), 'insertar', 'insertar', 'O(n)')); }), btn('eliminar la posición i', () => { const i = numero(idx, 'el índice i'); if (i !== null) intentar(() => jugar(A.eliminar(m, i), 'eliminar', 'eliminar', 'O(n)')); }), btn('buscar el valor', () => { const x = numero(val, 'un valor'); if (x !== null) jugar(A.buscar(m, x), 'buscar', 'buscar', 'O(n)'); }), btn('reiniciar', () => { m = A.nuevo([17, 4, 29, 8, 11], 6); cx.textContent = ''; pintar(); }))));
    zona.appendChild(h('div', { class: 'fila peq' }, h('span', { class: 'tenue', text: 'Costo:' }), cx));
    zona.appendChild(cont); pintar();
    pie(zona, '- **Acceso O(1)**: `dir(A[i]) = base + i × tam`, una multiplicación y una suma (solo funciona porque la memoria es **contigua**).\n- **Insertar/eliminar O(n)**: hay que **desplazar** los elementos siguientes; el peor caso es en la posición 0.\n- Si el arreglo está **lleno**, se reserva uno de doble capacidad y se **copian** los n elementos (así crece `list.append`: O(n) de vez en cuando, **O(1) amortizado**).');
    return () => rep.destruir();
  }
  function aPre(zona) {
    const T = Sim.tecnicas; const lis = h('input', { type: 'text', value: '5, 4, 9, 0, 1, 3', 'aria-label': 'Datos A', style: { width: '200px' } }), qi = campo('i', 40, '2'), qj = campo('j', 40, '4');
    const { cont, rep } = nuevoRep({ W: 560, H: 300, codigo: T.PRE_COD, tituloCodigo: 'SumaRango' });
    const correr = () => { const A = intentar(() => listaNum(lis.value, 2)); if (!A) return; if (A.length > 10) { Vc.toast('Usa hasta 10 datos.'); return; } const i = numero(qi, 'i'), j = numero(qj, 'j'); if (i === null || j === null) return; if (i < 0 || j >= A.length || i > j) { Vc.toast('Debe cumplirse 0 ≤ i ≤ j < ' + A.length + '.'); return; } rep.cargar(T.prefijos(A, [[i, j]]).frames); };
    zona.appendChild(fila(grupo('Datos A', lis), grupo('Consulta q(i, j)', qi, qj, btn('animar', correr, '')), grupo('Ejemplos', btn('de la clase', () => { lis.value = '5, 4, 9, 0, 1, 3'; qi.value = '2'; qj.value = '4'; correr(); }), btn('desde i = 0', () => { lis.value = '3, 1, 4, 1, 5'; qi.value = '0'; qj.value = '3'; correr(); }))));
    zona.appendChild(cont); correr();
    pie(zona, '- **Preproceso O(n)** una vez: `P[i] = P[i−1] + A[i]`. **Cada consulta O(1)**: `q(i, j) = P[j] − P[i−1]` (con `P[−1] = 0`).\n- Compromiso **tiempo–espacio**: O(n) de memoria extra a cambio de consultas constantes; rentable con muchas consultas.\n- Error típico: olvidar el caso `i = 0` en la consulta.');
    return () => rep.destruir();
  }
  function aKad(zona) {
    const T = Sim.tecnicas; const lis = h('input', { type: 'text', value: '-2, 1, -3, 4, -1, 2, 1, -5, 4', 'aria-label': 'Datos A', style: { width: '260px' } });
    const { cont, rep } = nuevoRep({ W: 600, H: 320, codigo: T.KAD_COD, tituloCodigo: 'max_subarreglo (Kadane)' });
    const correr = () => { const A = intentar(() => listaNum(lis.value, 2)); if (!A) return; if (A.length > 10) { Vc.toast('Usa hasta 10 datos.'); return; } rep.cargar(T.kadane(A).frames); };
    zona.appendChild(fila(grupo('Datos A', lis, btn('animar', correr, ''), btn('de la clase', () => { lis.value = '-2, 1, -3, 4, -1, 2, 1, -5, 4'; correr(); }), btn('todos negativos', () => { lis.value = '-5, -2, -8, -1'; correr(); }))));
    zona.appendChild(cont); correr();
    pie(zona, '- En cada elemento: **¿extiendo el subarreglo anterior o empiezo de nuevo?** `s_actual = max(A[i], s_actual + A[i])`. Si lo acumulado es negativo, lastra: mejor empezar de cero.\n- Una pasada: **O(n)** tiempo y **O(1)** espacio (frente a O(n²) probando todos los subarreglos).\n- **Error más común**: inicializar `s_max = 0`; falla cuando todos los valores son negativos (la respuesta correcta es el mayor de ellos, no 0).');
    return () => rep.destruir();
  }
  function aDos(zona) {
    const T = Sim.tecnicas; const lis = h('input', { type: 'text', value: '1, 3, 4, 6, 8, 11, 15', 'aria-label': 'Arreglo ordenado', style: { width: '230px' } }), S = campo('S', 55, '14');
    const { cont, rep } = nuevoRep({ W: 600, H: 270, codigo: T.DOS_COD, tituloCodigo: 'par_que_suma' });
    const correr = () => { const A = intentar(() => listaNum(lis.value, 2)); if (!A) return; if (A.some((x, i) => i && x < A[i - 1])) { Vc.toast('La técnica exige el arreglo ORDENADO (de menor a mayor).'); return; } if (A.length > 10) { Vc.toast('Usa hasta 10 datos.'); return; } const s = numero(S, 'la suma S'); if (s === null) return; rep.cargar(T.dosPunteros(A, s).frames); };
    zona.appendChild(fila(grupo('Arreglo ordenado', lis), grupo('Objetivo', S, btn('animar', correr, ''), btn('S = 100 (sin par)', () => { S.value = '100'; correr(); }))));
    zona.appendChild(cont); correr();
    pie(zona, '- Con el arreglo **ordenado**: si `A[l] + A[r] < S`, la suma debe **crecer** → `l` avanza; si `> S`, debe **decrecer** → `r` retrocede.\n- Cada puntero recorre el arreglo **una vez**: **O(n)** (frente a O(n²) con dos ciclos). Memoria **O(1)**.\n- **Precondición crucial**: el arreglo debe estar ordenado (ordenar cuesta O(n log n) y aún así es mejor que O(n²)).');
    return () => rep.destruir();
  }
  function aVen(zona) {
    const T = Sim.tecnicas; const txt = h('input', { type: 'text', value: 'cutebear', 'aria-label': 'Texto', style: { width: '170px' } });
    const { cont, rep } = nuevoRep({ W: 640, H: 300, codigo: T.VEN_COD, tituloCodigo: 'subcadena_sin_repetir' });
    const correr = () => { const t = txt.value.replace(/\s/g, ''); if (t.length < 2) { Vc.toast('Escribe al menos 2 caracteres.'); return; } if (t.length > 14) { Vc.toast('Usa hasta 14 caracteres.'); return; } rep.cargar(T.ventana(t).frames); };
    zona.appendChild(fila(grupo('Texto', txt, btn('animar', correr, ''), btn('cutebear', () => { txt.value = 'cutebear'; correr(); }), btn('abcabcbb', () => { txt.value = 'abcabcbb'; correr(); }), btn('aaaa', () => { txt.value = 'aaaa'; correr(); }))));
    zona.appendChild(cont); correr();
    pie(zona, '- La **ventana [l, r]** crece por la derecha mientras no viole la restricción y **se encoge por la izquierda** cuando la viola.\n- Aunque hay un `while` dentro del `for`, **cada carácter entra una vez y sale a lo sumo una vez**: 2n operaciones → **O(n)** amortizado (no O(n²)).\n- No confundir con la **ventana de contexto fija** de un tokenizador: aquella tiene tamaño k constante; esta cambia de tamaño.');
    return () => rep.destruir();
  }
  function aMer(zona) {
    const T = Sim.tecnicas; const txt = h('input', { type: 'text', value: '8-10, 1-3, 15-18, 2-6', 'aria-label': 'Intervalos', style: { width: '250px' } });
    const { cont, rep } = nuevoRep({ W: 640, H: 330, codigo: T.MER_COD, tituloCodigo: 'fusionar_intervalos' });
    const correr = () => { const iv = txt.value.split(/[,;]+/).map(s => s.trim()).filter(Boolean).map(s => s.split('-').map(Number)); if (iv.length < 2 || iv.some(p => p.length !== 2 || p.some(x => !isFinite(x)) || p[0] > p[1])) { Vc.toast('Escribe intervalos como 1-3, 2-6 (inicio ≤ fin).'); return; } if (iv.length > 6) { Vc.toast('Usa hasta 6 intervalos.'); return; } if (Math.max(...iv.map(p => p[1])) > 30) { Vc.toast('Usa valores hasta 30.'); return; } rep.cargar(T.fusionar(iv).frames); };
    zona.appendChild(fila(grupo('Intervalos (inicio-fin)', txt, btn('animar', correr, ''), btn('de la clase', () => { txt.value = '8-10, 1-3, 15-18, 2-6'; correr(); }), btn('todos solapados', () => { txt.value = '1-4, 2-5, 3-6, 5-9'; correr(); }))));
    zona.appendChild(cont); correr();
    pie(zona, '- Patrón **ordenar y barrer**: se ordenan por el extremo izquierdo (**O(n log n)**) y en un solo recorrido se **extiende** el último intervalo de la salida o se agrega uno nuevo.\n- Condición de solape: `a <= ultimo_b` (el que empieza antes de que termine el anterior).\n- Usos: fusionar reservas de calendario, rangos de memoria, segmentos detectados en una señal.');
    return () => rep.destruir();
  }

  /* ===================================================================== HEAPS ===================================================================== */
  LE.heap = function (host, q) {
    const H = Sim.heap; let m = H.nuevo([24, 10, 12, 5, 3], 'max'); const val = campo('valor', 65, '15'), idx = campo('i', 45, '1'), cx = chip();
    host.appendChild(intro('Un **heap** es un **árbol binario completo** con orden parcial (en el max-heap cada nodo ≥ sus hijos; en el min-heap, ≤) que se guarda en un **arreglo**: `padre(i) = (i−1)//2`, `izq = 2i+1`, `der = 2i+2`. Insertar y extraer cuestan **O(log n)**; ver el extremo, **O(1)**.'));
    const selTipo = h('select', { 'aria-label': 'Tipo de heap' }, h('option', { value: 'max', text: 'Max-heap (raíz = máximo)' }), h('option', { value: 'min', text: 'Min-heap (raíz = mínimo)' }));
    const lis = h('input', { type: 'text', value: '3, 1, 6, 5, 2, 4', 'aria-label': 'Lista de valores', style: { width: '200px' } }), kk = campo('k', 40, '3');
    const { cont, rep } = nuevoRep({ W: 640, H: 340, codigo: H.codigo('max'), tituloCodigo: 'MaxHeap' });
    const pintar = () => { rep.setCodigo(H.codigo(m.tipo), m.tipo === 'max' ? 'MaxHeap' : 'MinHeap'); mostrarCuadro(rep, H.cuadro(m, 'Heap: **[' + H.valores(m).join(', ') + ']**. Opera con los botones o toca «Navegar» para ver padre e hijos de un índice.')); };
    const jugar = (res, costo) => { if (!res) return; if (res.modelo) m = res.modelo; rep.cargar(res.frames); cx.textContent = costo || ''; };
    selTipo.addEventListener('change', () => { m = H.construir(H.valores(m), selTipo.value).modelo; cx.textContent = ''; pintar(); });
    host.appendChild(fila(grupo('Tipo', selTipo), grupo('Operaciones', val, btn('insertar', () => { const v = numero(val, 'un valor'); if (v === null) return; if (m.a.length >= 15) { Vc.toast('El heap de práctica admite hasta 15 elementos.'); return; } jugar(H.insertar(m, v), 'O(log n)'); }), btn('extraer la raíz', () => jugar(H.extraer(m), 'O(log n)')), idx, btn('navegar (padre/hijos de i)', () => { const i = numero(idx, 'el índice i'); if (i === null) return; if (i < 0 || i >= m.a.length) { Vc.toast('i debe estar entre 0 y ' + (m.a.length - 1) + '.'); return; } jugar(H.navegar(m, i), 'O(1)'); }), btn('vaciar', () => { m = H.nuevo([], selTipo.value); cx.textContent = ''; pintar(); }))));
    host.appendChild(fila(grupo('Algoritmos con una lista', lis, btn('construir heap (heapify)', () => { const v = intentar(() => listaNum(lis.value, 2)); if (!v) return; if (v.length > 15) { Vc.toast('Usa hasta 15 valores.'); return; } jugar(H.construir(v, selTipo.value), 'O(n)'); }), btn('heapsort', () => { const v = intentar(() => listaNum(lis.value, 2)); if (!v) return; if (v.length > 12) { Vc.toast('Usa hasta 12 valores para heapsort.'); return; } jugar(H.heapsort(v), 'O(n log n)'); }), kk, btn('top-k (k menores)', () => { const v = intentar(() => listaNum(lis.value, 2)); const k = numero(kk, 'k'); if (!v || k === null) return; if (k < 1 || k > 7 || k >= v.length) { Vc.toast('k debe estar entre 1 y ' + Math.min(7, v.length - 1) + '.'); return; } if (v.length > 14) { Vc.toast('Usa hasta 14 valores.'); return; } jugar(H.topk(v, k), 'O(n log k)'); }))));
    host.appendChild(h('div', { class: 'fila peq' }, h('span', { class: 'tenue', text: 'Costo:' }), cx));
    host.appendChild(cont); pintar();
    pie(host, '- **Bubble up** (insertar): se pone en la última hoja y **sube** mientras gane a su padre. **Bubble down** (extraer): la última hoja pasa a la raíz y **baja** por el hijo **mayor** (en max-heap) o **menor** (en min-heap).\n- **No** se borra la raíz con `del datos[0]` (O(n) y revuelve los índices): se mueve la última hoja.\n- **Heapify** desde la última posición con hijos (`n//2 − 1`) construye el heap en **O(n)**, más rápido que n inserciones (O(n log n)).\n- **Top-k** con un heap de tamaño **k**: O(n log k) y memoria O(k). **Heapsort**: O(n log n) garantizado y O(1) de memoria extra.\n- Un heap **no** sirve para buscar un valor (O(n)): da el extremo, no el orden total del BST. En Python, `heapq` es un **min-heap** (para max-heap se niegan los valores).');
    const demos = { ins: () => jugar(H.insertar(m, 15), 'O(log n)'), ext: () => jugar(H.extraer(H.insertar(m, 15).modelo), 'O(log n)'), con: () => jugar(H.construir([3, 1, 6, 5, 2, 4], 'max'), 'O(n)'), sort: () => jugar(H.heapsort([3, 1, 6, 5, 2, 4]), 'O(n log n)'), topk: () => jugar(H.topk([8, 3, 5, 1, 9, 2, 7], 3), 'O(n log k)') };
    if (q && q.e && demos[q.e]) setTimeout(demos[q.e], 80);
    return () => rep.destruir();
  };

  /* ===================================================================== ROJO-NEGRO ===================================================================== */
  LE.rn = function (host, q) {
    const RN = Sim.rn; let m = RN.desde([10, 5, 15, 1, 8, 12, 20]); const val = campo('valor', 65, '3'), seq = h('input', { type: 'text', value: '10, 20, 30, 40, 50, 25', 'aria-label': 'Secuencia', style: { width: '210px' } }), cx = h('div', { class: 'sim-estado', 'aria-live': 'polite' });
    host.appendChild(intro('**Árbol rojo-negro**: BST auto-balanceado con colores. Reglas: cada nodo es rojo o negro; **la raíz es negra**; **un rojo no tiene hijos rojos**; **todo camino a NIL tiene los mismos nodos negros** (altura negra). Verás los **recoloreos** y las **rotaciones** de la inserción (3 casos) y de la eliminación (doble negro, 4 casos). Es el mismo algoritmo del código de apoyo de la clase.'));
    const { cont, rep } = nuevoRep({ W: 640, H: 320, codigo: RN.codigoRN(), tituloCodigo: 'ArbolRN (código de apoyo de la clase)' });
    const pintar = () => { mostrarCuadro(rep, RN.cuadro(m, 'Árbol: **' + (m.raiz ? RN.nota(m.raiz) : 'vacío') + '** (`n` = negro, `r` = rojo). Inserta o elimina un valor.')); };
    let hist = [];
    const jugar = (res, etiqueta) => { if (!res) return; m = res.modelo; rep.cargar(res.frames); hist.unshift(etiqueta + ' → ' + (res.casos && res.casos.length ? res.casos.join(', ') : (res.duplicado ? 'duplicado' : (res.noEsta ? 'no está' : 'sin casos'))) + ' · ' + res.rotaciones + ' rotación(es)'); cx.textContent = hist.slice(0, 4).join('\n'); };
    const secuencia = () => { const v = intentar(() => listaNum(seq.value, 1)); if (!v) return; let mm = RN.nuevo(), fr = []; v.slice(0, 8).forEach(x => { const r = RN.insertar(mm, x); mm = r.modelo; fr = fr.concat(r.frames); }); m = mm; rep.cargar(fr); cx.textContent = 'Secuencia ' + v.slice(0, 8).join(', ') + ' → ' + RN.nota(m.raiz); };
    host.appendChild(fila(grupo('Operaciones', val, btn('insertar', () => { const v = numero(val, 'un valor'); if (v === null) return; if (m.raiz && RN.tam(m.raiz) >= 20) { Vc.toast('Para que quepa en pantalla, el árbol de práctica admite hasta 20 nodos.'); return; } jugar(RN.insertar(m, v), 'insertar ' + v); }), btn('eliminar', () => { const v = numero(val, 'un valor'); if (v !== null) jugar(RN.eliminar(m, v), 'eliminar ' + v); }), btn('vaciar', () => { m = RN.nuevo(); hist = []; cx.textContent = ''; pintar(); })),
      grupo('Secuencia', seq, btn('insertar paso a paso', () => secuencia()), btn('cargar sin animar', () => { const v = intentar(() => listaNum(seq.value, 1)); if (!v) return; if (v.length > 20) { Vc.toast('Usa hasta 20 valores.'); return; } let mm = RN.nuevo(); v.forEach(x => { mm = RN.insertar(mm, x).modelo; }); m = mm; pintar(); cx.textContent = 'Cargada: ' + RN.nota(m.raiz); }))));
    host.appendChild(cont); host.appendChild(cx); pintar();
    pie(host, '- **Inserción**: el nodo nuevo entra **rojo**. Si su padre es rojo se mira el **tío**: **tío rojo** → recolorear (padre y tío negros, abuelo rojo) y seguir subiendo; **tío negro en zigzag** → una rotación para alinear y luego el caso de línea recta; **línea recta** → abuelo rojo, padre negro y **una rotación**. A lo sumo **2 rotaciones**.\n- **Eliminación**: si el nodo que desaparece es **rojo** no pasa nada; si es **negro** queda un **doble negro** que se arregla según el hermano y sus sobrinos (casos 1–4); a lo sumo 3 rotaciones.\n- **NIL cuenta como negro.** Altura **O(log n)** (≤ 2·log₂(n+1)); balance más laxo que el AVL: menos rotaciones, árbol algo más alto.');
    const demos = { ins: () => { m = RN.desde([10, 5, 15, 1, 8, 12, 20]); jugar(RN.insertar(m, 3), 'insertar 3'); }, del: () => jugar(RN.eliminar(m, 1), 'eliminar 1'), seq: () => secuencia() };
    if (q && q.e && demos[q.e]) setTimeout(demos[q.e], 80);
    return () => rep.destruir();
  };

  /* ===================================================================== MEMORIA Y REFERENCIAS ===================================================================== */
  LE.memoria = function (host, q) {
    const M = Sim.memoria; host.appendChild(intro('En Python **una variable no contiene el objeto: contiene una referencia** a un objeto que vive en el montículo. Estas animaciones guiadas (no ejecutan tu código; el programa de cada una está al lado y se verificó con el intérprete) muestran alias, mutabilidad, copias, argumentos por defecto, memoria contigua vs enlazada y fragmentación.'));
    const lista = M.ESCENARIOS.map(e => [e.id, e.titulo]).concat([['contiguo', 'Memoria contigua vs enlazada'], ['frag', 'Fragmentación del montículo']]);
    const sel = h('select', { 'aria-label': 'Escenario' }, lista.map(([k, t]) => h('option', { value: k, text: t })));
    const salida = h('pre', { class: 'consola-out sim-estado', 'aria-label': 'Salida del programa' });
    const { cont, rep } = nuevoRep({ W: 640, H: 300, codigo: [], tituloCodigo: 'Programa' });
    const cargar = () => {
      const id = sel.value; let r;
      if (id === 'contiguo') { r = M.contiguoVsEnlazado(); rep.setCodigo([], ''); salida.textContent = ''; }
      else if (id === 'frag') { r = M.fragmentacion(); rep.setCodigo([], ''); salida.textContent = ''; }
      else { r = M.escenario(id); rep.setCodigo(r.codigo, 'Programa'); salida.textContent = 'Salida esperada al terminar:\n' + r.salida; }
      rep.cargar(r.frames);
    };
    sel.addEventListener('change', cargar);
    if (q && q.e && lista.some(x => x[0] === q.e)) sel.value = q.e;
    host.appendChild(fila(grupo('Escenario', sel, btn('▶ repetir', cargar, ''))));
    host.appendChild(cont); host.appendChild(salida); cargar();
    pie(host, '- **Asignar con `=` copia la referencia, nunca el objeto.** Con objetos **mutables** (`list`, `dict`, `set`, objetos propios) todos los alias ven el cambio; con **inmutables** (`int`, `float`, `str`, `tuple`) un «cambio» crea otro objeto.\n- **Copia superficial** (`copy.copy`) copia solo la estructura externa y **comparte** lo de adentro; **copia profunda** (`copy.deepcopy`) copia todo el árbol.\n- Un objeto no se libera cuando deja de usarse, sino cuando **nadie lo referencia** (conteo de referencias).\n- `def f(x, acc=[])` crea la lista **una sola vez** y la comparte entre llamadas: usa `acc=None`.');
    return () => rep.destruir();
  };
})(typeof window !== 'undefined' ? window : globalThis);
