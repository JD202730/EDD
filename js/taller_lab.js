/* taller_lab.js — Laboratorio → Taller interactivo: configuración libre de los talleres de heap, rojo-negro, lista enlazada, pilas y colas y arreglos
   (el de árboles BST/AVL sigue en vistas_otras.js). El estudiante elige la estructura, el estado inicial y la lista de operaciones. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, TG = ET.TallerGen;

  const FAMS = [['arbol', '🌳 Árboles BST/AVL'], ['heap', '⛰ Heap'], ['rn', '● Rojo-negro'], ['lista', '🔗 Lista enlazada'], ['pc', '📚 Pilas y colas'], ['arr', '▦ Arreglos']];
  /** botones para cambiar de estructura (el de árboles es la pantalla de siempre) */
  function selector(actual) {
    return h('div', { class: 'fila tg-fams', role: 'tablist', 'aria-label': 'Estructura del taller' }, FAMS.map(([k, t]) => h('a', { class: 'btn peq ' + (k === actual ? '' : 'sec'), href: '#/lab/taller' + (k === 'arbol' ? '' : '?f=' + k), role: 'tab', 'aria-selected': k === actual ? 'true' : 'false', text: t })));
  }

  const CONF = {
    heap: {
      intro: 'Haz **tú** cada paso de un **heap** (árbol completo guardado en un arreglo): colocar el elemento nuevo en la primera posición libre y **subirlo**; **sacar la raíz**, llevar la última hoja a la raíz y **bajarla**; o **construir** el heap desde un arreglo cualquiera (**heapify**). Lo incorrecto no se acepta.',
      selector: { clave: 'tipo', etiqueta: 'Tipo de heap', opciones: [['min', 'Min-heap (la raíz es el mínimo)'], ['max', 'Max-heap (la raíz es el máximo)']] },
      inicial: { etiqueta: 'Arreglo inicial', ph: 'p. ej. 2, 5, 3, 9, 6, 8 (vacío = heap vacío)', max: 31 },
      ops: { ph: 'Operaciones: 1, 7, x, build — número = insertar · x = extraer la raíz · build = construir desde el arreglo', max: 40 },
      presets: [
        ['Insertar (sube)', { tipo: 'min', vals: '2, 5, 3, 9, 6, 8', ops: '1' }], ['Insertar varios', { tipo: 'max', vals: '24, 10, 12, 5, 3', ops: '15, 30, 8' }],
        ['Extraer (baja)', { tipo: 'min', vals: '1, 3, 2, 9, 6, 8, 5', ops: 'x' }], ['Extraer 3 veces', { tipo: 'max', vals: '20, 15, 18, 7, 10, 12, 9, 3', ops: 'x, x, x' }],
        ['Construir (heapify)', { tipo: 'max', vals: '3, 1, 6, 5, 2, 4, 9', ops: 'build' }], ['Cola de prioridad', { tipo: 'min', vals: '5, 8, 7, 9', ops: '3, x, 6, x, 2' }],
        ['Heap grande (15)', { tipo: 'min', vals: '1, 3, 2, 7, 5, 4, 6, 15, 9, 8, 10, 11, 12, 13, 14', ops: 'x, 0, x' }]
      ]
    },
    rn: {
      intro: 'Inserta valores en un **árbol rojo-negro** y repara tú las reglas: cuelga el nodo (entra **rojo**), mira el color del **tío**, elige el **caso** (tío rojo / zigzag / línea recta), **recolorea** tocando los nodos y **rota** arrastrando un hijo sobre su padre. (La **eliminación** se ve paso a paso en Laboratorio → Rojo-negro.)',
      inicial: { etiqueta: 'Valores iniciales (se insertan en ese orden)', ph: 'p. ej. 10, 20, 30 (vacío = árbol vacío)', max: 30 },
      ops: { ph: 'Valores a insertar: 25, 5, 15', max: 30 },
      presets: [
        ['Tío rojo (caso 3)', { vals: '10, 5, 20', ops: '1' }], ['Zigzag (caso 1)', { vals: '10, 20', ops: '15' }], ['Línea recta (caso 2)', { vals: '10, 20', ops: '30' }],
        ['Secuencia de clase', { vals: '', ops: '10, 20, 30, 40, 50, 25' }], ['Árbol vacío', { vals: '', ops: '8, 4, 12, 2, 6' }], ['Varias reparaciones', { vals: '41, 38, 31, 12, 19', ops: '8, 7, 9, 3' }]
      ]
    },
    lista: {
      intro: 'Reasigna las **referencias** de una **lista enlazada simple** en el orden correcto: arrastra un nodo (o la caja «cabeza») sobre aquel al que va a apuntar. Si lo haces en el orden equivocado, **pierdes el resto de la lista** y el taller no lo acepta.',
      inicial: { etiqueta: 'Lista inicial (de la cabeza a la cola)', ph: 'p. ej. 10, 20, 30 (vacío = lista vacía)', max: 12 },
      ops: { ph: 'Operaciones: ini 5 · fin 9 · tras 20 7 (7 después del nodo 20) · -20 (eliminar el 20)', max: 20 },
      presets: [
        ['Insertar al inicio', { vals: '10, 20, 30', ops: 'ini 5' }], ['Insertar en el medio', { vals: '30, 20, 10', ops: 'tras 20 99' }], ['Insertar al final', { vals: '10, 20, 30', ops: 'fin 40' }],
        ['Eliminar la cabeza', { vals: '10, 20, 30', ops: '-10' }], ['Eliminar del medio', { vals: '30, 20, 10', ops: '-20' }], ['Varias operaciones', { vals: '10, 20, 30', ops: 'ini 5, tras 20 25, -30, fin 40' }]
      ]
    },
    pc: {
      intro: 'Opera una **pila**, una **cola**, una **deque** o una **cola circular**: arrastra cada elemento nuevo al extremo por donde entra y toca el elemento que sale. En la cola circular debes calcular la casilla con `(frente + tam) % C`.',
      selector: { clave: 'modo', etiqueta: 'Estructura', opciones: [['pila', 'Pila (LIFO)'], ['cola', 'Cola (FIFO)'], ['deque', 'Deque (dos extremos)'], ['circ', 'Cola circular (arreglo fijo)']] },
      inicial: { etiqueta: 'Elementos iniciales (pila: de abajo a arriba · cola: del frente al final)', ph: 'p. ej. 3, 7, 1 (vacío = estructura vacía)', max: 12 },
      ops: { ph: 'Pila: push 5, pop · Cola: enc 5, des · Deque: addr 5, addl 6, popr, popl', max: 30 },
      extraCirc: true,
      presets: [
        ['Pila: push y pop', { modo: 'pila', vals: '3, 7, 1', ops: 'push 9, pop, pop, push 4' }], ['Cola: enc y des', { modo: 'cola', vals: '3, 7, 1', ops: 'enc 9, des, des, enc 4' }],
        ['Deque', { modo: 'deque', vals: '3, 7, 1', ops: 'addl 9, popr, addr 5, popl' }], ['Cola circular', { modo: 'circ', vals: '11, 22, 33', ops: 'enc 44, enc 55, des', C: '6', frente: '4' }],
        ['Circular: dar la vuelta', { modo: 'circ', vals: '5, 6, 7, 8', ops: 'des, des, enc 9, enc 10, enc 11', C: '6', frente: '3' }]
      ]
    },
    arr: {
      intro: 'Trabaja con un **arreglo**: para **insertar** o **eliminar** en el medio hay que **desplazar** elementos en el orden correcto (si no, se sobrescriben valores y se pierden), y la **búsqueda binaria** se hace elegiendo tú la casilla del medio y decidiendo hacia dónde seguir.',
      inicial: { etiqueta: 'Arreglo inicial', ph: 'p. ej. 10, 20, 30, 40, 50 (la búsqueda binaria exige que esté ordenado)', max: 16 },
      ops: { ph: 'Operaciones: ins 7 2 (insertar 7 en la posición 2) · ins 7 (al final) · del 3 (eliminar la posición 3) · bin 40 (buscar 40)', max: 20 },
      presets: [
        ['Insertar en el medio', { vals: '10, 20, 30, 40, 50', ops: 'ins 25 2' }], ['Eliminar del medio', { vals: '10, 20, 30, 40, 50', ops: 'del 1' }],
        ['Búsqueda binaria (está)', { vals: '3, 8, 14, 19, 23, 31, 42, 56, 61, 77', ops: 'bin 42' }], ['Búsqueda binaria (no está)', { vals: '3, 8, 14, 19, 23, 31, 42, 56, 61, 77', ops: 'bin 50' }],
        ['Varias operaciones', { vals: '5, 9, 14, 20, 31', ops: 'ins 12 2, del 0, bin 20' }]
      ]
    }
  };

  const numeros = (txt, max, etiqueta) => {
    const a = txt.split(/[;,\s]+/).filter(Boolean).map(s => { if (!/^-?\d+$/.test(s)) throw new Error('«' + s + '» no es un número entero (' + etiqueta + ').'); return Number(s); });
    if (a.length > max) throw new Error(etiqueta + ': usa a lo sumo ' + max + ' valores (son ' + a.length + ').');
    return a;
  };

  function montar(host, fam) {
    const C = CONF[fam], F = TG.familias[fam];
    host.appendChild(selector(fam));
    host.appendChild(h('p', { class: 'suave', style: { marginTop: '12px' }, html: U.mdInline(C.intro) }));
    const sel = C.selector ? h('select', { 'aria-label': C.selector.etiqueta }, C.selector.opciones.map(([v, t]) => h('option', { value: v, text: t }))) : null;
    const inV = h('input', { type: 'text', class: 'entrada-nota', placeholder: C.inicial.ph, spellcheck: 'false', autocomplete: 'off', 'aria-label': C.inicial.etiqueta });
    const inOps = h('input', { type: 'text', class: 'entrada-nota', placeholder: C.ops.ph, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Operaciones' });
    const inC = C.extraCirc ? h('input', { type: 'text', class: 'entrada-nota', placeholder: 'C = tamaño del arreglo (4 a 10)', inputmode: 'numeric', 'aria-label': 'Tamaño C de la cola circular', style: { maxWidth: '260px' } }) : null;
    const inF = C.extraCirc ? h('input', { type: 'text', class: 'entrada-nota', placeholder: 'frente inicial (0 a C−1)', inputmode: 'numeric', 'aria-label': 'Posición inicial del frente', style: { maxWidth: '260px' } }) : null;
    const extraCirc = C.extraCirc ? h('div', { class: 'fila', style: { marginTop: '8px' } }, inC, inF) : null;
    const zona = h('div', { style: { marginTop: '14px' } });
    const alternarCirc = () => { if (extraCirc) extraCirc.style.display = sel.value === 'circ' ? '' : 'none'; };
    if (sel) sel.addEventListener('change', alternarCirc);

    function comenzar() {
      U.vaciar(zona);
      try {
        const cfg = { familia: fam, estricto: true };
        if (sel) cfg[C.selector.clave] = sel.value;
        cfg.vals = numeros(inV.value, C.inicial.max, C.inicial.etiqueta);
        if (fam === 'pc' && cfg.modo === 'circ') {
          cfg.C = Number(inC.value || 6); cfg.frente = Number(inF.value || 0);
          if (!Number.isInteger(cfg.C) || cfg.C < 3 || cfg.C > 10) throw new Error('C debe ser un entero entre 3 y 10.');
          if (!Number.isInteger(cfg.frente) || cfg.frente < 0 || cfg.frente >= cfg.C) throw new Error('El frente debe estar entre 0 y C − 1 = ' + (cfg.C - 1) + '.');
          if (cfg.vals.length > cfg.C) throw new Error('No caben ' + cfg.vals.length + ' elementos en un arreglo de C = ' + cfg.C + ' casillas.');
        }
        if (fam === 'heap' && cfg.vals.length > 31) throw new Error('Usa un heap de hasta 31 elementos.');
        cfg.ops = F.leerOps(inOps.value, cfg);
        if (!cfg.ops.length) throw new Error('Escribe al menos una operación.');
        if (cfg.ops.length > C.ops.max) throw new Error('Usa hasta ' + C.ops.max + ' operaciones por ejercicio (son ' + cfg.ops.length + ').');
        const avisos = [];
        if (fam === 'heap' && cfg.vals.length > 1 && cfg.ops[0].t !== 'build' && !ET.Sim.heap.esHeap(F.iniciar(cfg).a, cfg.tipo)) {   // como en el AVL: se repara primero
          cfg.ops.unshift({ t: 'build' }); avisos.push('El arreglo inicial no es un ' + (cfg.tipo === 'max' ? 'max' : 'min') + '-heap: primero se construye con heapify (operación «build»).');
        }
        if (cfg.ops.length > C.ops.max) throw new Error('Usa hasta ' + C.ops.max + ' operaciones por ejercicio.');
        let m = F.iniciar(cfg);   // se valida cada operación con el mismo plan que usará el taller
        cfg.ops.forEach((op, i) => { try { m = F.plan(m, op, cfg).final; } catch (e) { throw new Error('Operación ' + (i + 1) + ' («' + F.nombreOp(op, cfg) + '»): ' + e.message); } });
        avisos.forEach(a => zona.appendChild(h('div', { class: 'panel', text: a })));
        zona.appendChild(h('div', { class: 'card flat', style: { marginTop: '8px' } }, h('div', { class: 'taller-lab' })));
        const w = TG.montar(U.$('.taller-lab', zona), cfg);
        w.onCompletar(r => { zona.appendChild(h('div', { class: 'panel', html: U.mdInline('🎉 **Terminaste.** Intentos fallidos: ' + r.fallos + ' · pistas: ' + r.pistas + '. Cambia las operaciones o elige otro ejemplo para seguir practicando.') })); });
      } catch (e) { zona.appendChild(h('div', { class: 'panel', style: { borderColor: 'var(--mal)' }, text: '⚠ ' + e.message })); }
    }
    /** un heap min espejado (v → 100 − v) es un heap max con los mismos pasos: así los ejemplos respetan el tipo que elegiste */
    const espejo = s => s.replace(/-?\d+/g, n => String(100 - Number(n)));
    const presets = h('div', { class: 'fila' }, C.presets.map(p => h('button', { type: 'button', class: 'btn sec peq', onclick: () => {
      const d = p[1]; let vals = d.vals, ops = d.ops;
      if (fam === 'heap') { if (d.tipo !== sel.value) { vals = espejo(vals); ops = espejo(ops); } }   // el selector NO cambia: se adapta el ejemplo
      else if (sel && d[C.selector.clave]) sel.value = d[C.selector.clave];
      inV.value = vals; inOps.value = ops; if (inC) { inC.value = d.C || ''; inF.value = d.frente || ''; } alternarCirc(); comenzar();
    } }, p[0])));
    host.appendChild(h('div', { class: 'card flat' },
      h('div', { class: 'peq suave', style: { marginBottom: '6px' }, text: 'Ejemplos rápidos' }), presets,
      sel ? h('div', { class: 'fila', style: { marginTop: '12px' } }, sel) : null,
      h('div', { style: { marginTop: '8px' } }, inV), extraCirc, h('div', { style: { marginTop: '8px' } }, inOps),
      h('div', { class: 'fila', style: { marginTop: '10px' } }, h('button', { type: 'button', class: 'btn', onclick: comenzar }, '✋ Comenzar'))));
    host.appendChild(zona); alternarCirc();
  }
  ET.TallerLab = { FAMS, selector, montar, CONF };
})(typeof window !== 'undefined' ? window : globalThis);
