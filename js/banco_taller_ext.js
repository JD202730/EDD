/* banco_taller_ext.js — talleres interactivos del heap, el árbol rojo-negro, las listas enlazadas, las pilas y colas y los arreglos
   (motor js/taller_gen.js). Igual que los de árboles: solo de práctica (soloPractica), porque se resuelven moviendo elementos. */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, TG = ET.TallerGen, SH = ET.Sim.heap, SR = ET.Sim.rn;
  const PIST = ['Las pistas de este ejercicio están dentro del taller (botón «💡 Pista»): cada una resta un poco de crédito.'];
  const lst = TG.lst, coma = a => a.join(', ');
  const base = (fmt, extra) => Object.assign({ tipo: 'taller', fmt, cat: 'analisis', pistasInternas: true, pistas: PIST }, extra);
  /** configuración del taller + resultado esperado (el mismo que calcula el motor al validar) */
  function mk(familia, datos) {
    const F = TG.familias[familia], cfg = Object.assign({ familia, estricto: true }, datos);
    let m = F.iniciar(cfg); cfg.ops.forEach(op => { m = F.plan(m, op, cfg).final; });
    cfg.finalEsperado = F.textoFinal(m); return cfg;
  }
  const nuevoDistinto = (rng, usados, lo, hi) => { let v; let g = 0; do { v = rng.int(lo, hi); } while (usados.has(v) && ++g < 400); usados.add(v); return v; };
  const nomHeap = t => t === 'max' ? 'max-heap (cada padre ≥ sus hijos)' : 'min-heap (cada padre ≤ sus hijos)';
  const heapDe = (rng, tipo, n) => { let m = SH.nuevo([], tipo); rng.distinct(n, 3, 60).forEach(v => { m = SH.insertar(m, v).modelo; }); return m; };

  /* ------------------------------ HEAP ------------------------------ */
  B({
    id: 'n13-taller-heap-ins', n: 13, e: 'A', dif: 2, c: ['hp_def', 'hp_arr', 'hp_subir'], tema: 'Taller: insertar en un heap', soloPractica: true,
    gen(rng) {
      const tipo = rng.pick(['min', 'max']), m = heapDe(rng, tipo, rng.int(5, 8)), vals = SH.valores(m), usados = new Set(vals), ops = []; let sim = m;
      const k = rng.int(1, 2);
      for (let i = 0; i < k; i++) {
        let v = nuevoDistinto(rng, usados, 1, 70);
        for (let g = 0; g < 40 && i === 0 && !SH.insertar(sim, v).intercambios; g++) v = nuevoDistinto(rng, usados, 1, 70);   // el primero debe subir al menos un nivel
        ops.push({ t: 'ins', v }); sim = SH.insertar(sim, v).modelo;
      }
      const cfg = mk('heap', { tipo, vals, ops });
      return base('Taller interactivo del heap', {
        enunciado: 'Este **' + nomHeap(tipo) + '** está guardado en el arreglo **' + lst(vals) + '**. Inserta, **en este orden**, los valores **' + coma(ops.map(o => o.v)) + '**: coloca cada elemento nuevo en la **primera posición libre** (el árbol debe seguir completo) y **súbelo** intercambiándolo con su padre mientras sea necesario.',
        taller: cfg, conceptos: ['hp_def', 'hp_arr', 'hp_subir'],
        explicacion: 'Heap final: **' + cfg.finalEsperado + '**. Cada intercambio sube **un nivel**, así que insertar cuesta a lo sumo la altura: **O(log n)**.'
      });
    }
  });
  B({
    id: 'n13-taller-heap-ext', n: 13, e: 'B', dif: 3, c: ['hp_def', 'hp_arr', 'hp_bajar'], tema: 'Taller: extraer la raíz de un heap', soloPractica: true,
    gen(rng) {
      const tipo = rng.pick(['min', 'max']); let m = heapDe(rng, tipo, rng.int(6, 9));
      for (let g = 0; g < 60 && !SH.extraer(m).intercambios; g++) m = heapDe(rng, tipo, rng.int(6, 9));
      const vals = SH.valores(m), k = rng.int(1, 2), ops = Array.from({ length: k }, () => ({ t: 'ext' }));
      const cfg = mk('heap', { tipo, vals, ops });
      return base('Taller interactivo del heap', {
        enunciado: 'Este **' + nomHeap(tipo) + '** está guardado en el arreglo **' + lst(vals) + '**. **Extrae el ' + (tipo === 'max' ? 'máximo' : 'mínimo') + '** ' + (k === 1 ? 'una vez' : k + ' veces seguidas') + ': saca la raíz, lleva la **última hoja** a la raíz y **bájala** intercambiándola con el hijo ' + (tipo === 'max' ? 'mayor' : 'menor') + ' mientras sea necesario.',
        taller: cfg, conceptos: ['hp_def', 'hp_arr', 'hp_bajar'],
        explicacion: 'Heap final: **' + lst(cfg.finalEsperado.replace(/ salida.*$/, '').replace(/[\[\]]/g, '').split(', ').filter(Boolean)) + '**. Cada vuelta baja **un nivel**: extraer cuesta **O(log n)**. Se elige el hijo ' + (tipo === 'max' ? 'mayor' : 'menor') + ' porque si subiera el otro quedaría encima de su hermano y se rompería el heap.'
      });
    }
  });
  B({
    id: 'n13-taller-heap-build', n: 13, e: 'C', dif: 3, c: ['hp_build', 'hp_bajar', 'hp_arr'], tema: 'Taller: construir un heap (heapify)', soloPractica: true,
    gen(rng) {
      const tipo = rng.pick(['min', 'max']); let vals;
      for (let g = 0; g < 80; g++) { vals = rng.distinct(rng.int(6, 8), 2, 60); const r = SH.construir(vals, tipo); if (r.intercambios >= 2 && !SH.esHeap(vals.map((v, i) => ({ id: i, v })), tipo)) break; }
      const cfg = mk('heap', { tipo, vals, ops: [{ t: 'build' }] });
      return base('Taller interactivo del heap', {
        enunciado: 'Convierte el arreglo **' + lst(vals) + '** en un **' + nomHeap(tipo) + '** con **heapify** (O(n)): empieza en la **última posición que tiene hijos** (n // 2 − 1) y retrocede hasta la raíz, **bajando** cada elemento mientras haga falta.',
        taller: cfg, conceptos: ['hp_build', 'hp_bajar', 'hp_arr'],
        explicacion: 'Heap construido: **' + cfg.finalEsperado + '**. Es lineal porque casi todos los nodos están cerca de las hojas y bajan muy poco; hacer n inserciones costaría O(n log n).'
      });
    }
  });
  B({
    id: 'n13-taller-heap-mixto', n: 13, e: 'C', dif: 4, c: ['hp_subir', 'hp_bajar', 'hp_pq'], tema: 'Taller: cola de prioridad con un heap', soloPractica: true,
    gen(rng) {
      const tipo = rng.pick(['min', 'max']), m = heapDe(rng, tipo, rng.int(5, 7)), vals = SH.valores(m), usados = new Set(vals), ops = []; let sim = m;
      const k = rng.int(3, 4);
      for (let i = 0; i < k; i++) {
        if ((i % 2 === 1 && sim.a.length > 2) || (rng.chance(.4) && sim.a.length > 3)) { ops.push({ t: 'ext' }); sim = SH.extraer(sim).modelo; }
        else { const v = nuevoDistinto(rng, usados, 1, 70); ops.push({ t: 'ins', v }); sim = SH.insertar(sim, v).modelo; }
      }
      const cfg = mk('heap', { tipo, vals, ops });
      return base('Taller interactivo del heap', {
        enunciado: 'Una **cola de prioridad** se implementa con este **' + nomHeap(tipo) + '**, guardado en **' + lst(vals) + '**. Ejecuta **en orden**: ' + ops.map(o => o.t === 'ins' ? 'insertar ' + o.v : 'extraer el ' + (tipo === 'max' ? 'máximo' : 'mínimo')).join(' → ') + '.',
        taller: cfg, conceptos: ['hp_subir', 'hp_bajar', 'hp_pq'],
        explicacion: 'Resultado: **' + cfg.finalEsperado + '**. Insertar sube (bubble up) y extraer baja (bubble down): ambas son **O(log n)**; consultar el extremo es **O(1)**.'
      });
    }
  });

  /* ------------------------------ ROJO-NEGRO ------------------------------ */
  function rnBase(rng, n) { return rng.distinct(n, 5, 95); }
  B({
    id: 'n7-taller-rn-ins', n: 7, e: 'B', dif: 3, c: ['rn_def', 'rn_ins'], tema: 'Taller: insertar en un árbol rojo-negro', soloPractica: true,
    gen(rng) {
      const vals = rnBase(rng, rng.int(4, 6)), m = SR.desde(vals), usados = new Set(vals); let v;
      for (let g = 0; g < 100; g++) { v = nuevoDistinto(rng, usados, 3, 97); if (SR.insertar(m, v).casos.length) break; }
      const cfg = mk('rn', { vals, ops: [{ t: 'ins', v }] }), r = SR.insertar(m, v);
      return base('Taller interactivo del rojo-negro', {
        enunciado: 'Este es un **árbol rojo-negro** (construido insertando **' + coma(vals) + '** en ese orden). Inserta el **' + v + '**: cuélgalo como hoja (entra **rojo**), mira el color del **tío**, elige el caso, **recolorea** y/o **rota** hasta que se cumplan las reglas, y deja la raíz **negra**.',
        taller: cfg, conceptos: ['rn_def', 'rn_ins'],
        explicacion: 'Casos aplicados: **' + (r.casos.join(' → ') || 'ninguno') + '**. Rotaciones: **' + r.rotaciones + '** (a lo sumo 2 por inserción). Árbol final: **' + cfg.finalEsperado + '** (n = negro, r = rojo).'
      });
    }
  });
  B({
    id: 'n7-taller-rn-secuencia', n: 7, e: 'C', dif: 4, c: ['rn_ins', 'rn_def'], tema: 'Taller: varias inserciones en un rojo-negro', soloPractica: true,
    gen(rng) {
      let vals, ops, casos = 0;
      for (let g = 0; g < 200 && casos < 2; g++) {
        vals = rnBase(rng, rng.int(2, 4)); const usados = new Set(vals); ops = Array.from({ length: 3 }, () => ({ t: 'ins', v: nuevoDistinto(rng, usados, 3, 97) }));
        let m = SR.desde(vals); casos = 0; ops.forEach(o => { const r = SR.insertar(m, o.v); casos += r.casos.length; m = r.modelo; });
      }
      const cfg = mk('rn', { vals, ops });
      return base('Taller interactivo del rojo-negro', {
        enunciado: 'Partiendo del **árbol rojo-negro** construido con **' + coma(vals) + '**, inserta **en este orden** los valores **' + coma(ops.map(o => o.v)) + '**. En cada inserción: cuelga el nodo (rojo), identifica el caso, recolorea o rota, y comprueba que la raíz sea negra.',
        taller: cfg, conceptos: ['rn_ins', 'rn_def'],
        explicacion: 'Árbol final: **' + cfg.finalEsperado + '** (n = negro, r = rojo). Cada inserción hace a lo sumo **2 rotaciones**; los recoloreos del caso 3 pueden subir hasta la raíz.'
      });
    }
  });

  /* ------------------------------ PILAS Y COLAS ------------------------------ */
  function secuenciaPC(rng, modo, vals, k) {
    const ref = vals.slice(), usados = new Set(vals), ops = [];
    for (let i = 0; i < k; i++) {
      const v = nuevoDistinto(rng, usados, 1, 90), vacio = !ref.length, meter = vacio || rng.chance(.55);
      if (modo === 'pila') { if (meter) { ops.push({ t: 'push', v }); ref.push(v); } else { ops.push({ t: 'pop' }); ref.pop(); } }
      else if (modo === 'cola') { if (meter) { ops.push({ t: 'enc', v }); ref.push(v); } else { ops.push({ t: 'des' }); ref.shift(); } }
      else { const r = rng.next(); if (meter && r < .5) { ops.push({ t: 'addr', v }); ref.push(v); } else if (meter) { ops.push({ t: 'addl', v }); ref.unshift(v); } else if (r < .5) { ops.push({ t: 'popl' }); ref.shift(); } else { ops.push({ t: 'popr' }); ref.pop(); } }
    }
    return ops;
  }
  const textoOpsPC = (ops, modo) => ops.map(o => TG.familias.pc.nombreOp(o, { modo })).join(' → ');
  B({
    id: 'n11-taller-pila', n: 11, e: 'A', dif: 2, c: ['pc_pila'], tema: 'Taller: operar una pila', soloPractica: true,
    gen(rng) {
      const vals = rng.distinct(rng.int(2, 4), 1, 50), ops = secuenciaPC(rng, 'pila', vals, rng.int(4, 6)), cfg = mk('pc', { modo: 'pila', vals, ops });
      return base('Taller interactivo de pilas y colas', {
        enunciado: 'Esta **pila** tiene (de abajo hacia arriba) **' + lst(vals) + '**. Ejecuta **en orden**: ' + textoOpsPC(ops, 'pila') + '. Arrastra cada elemento nuevo al extremo por donde entra y toca el elemento que sale.',
        taller: cfg, conceptos: ['pc_pila'],
        explicacion: 'Pila (LIFO): se entra y se sale siempre por el **tope**. Estado final (de abajo hacia arriba): **' + cfg.finalEsperado.replace(/ salieron.*$/, '') + '**. Cada operación cuesta **O(1)**.'
      });
    }
  });
  B({
    id: 'n11-taller-cola', n: 11, e: 'A', dif: 2, c: ['pc_cola'], tema: 'Taller: operar una cola', soloPractica: true,
    gen(rng) {
      const vals = rng.distinct(rng.int(2, 4), 1, 50), ops = secuenciaPC(rng, 'cola', vals, rng.int(4, 6)), cfg = mk('pc', { modo: 'cola', vals, ops });
      return base('Taller interactivo de pilas y colas', {
        enunciado: 'Esta **cola** tiene (del frente al final) **' + lst(vals) + '**. Ejecuta **en orden**: ' + textoOpsPC(ops, 'cola') + '. Arrastra cada elemento nuevo al extremo por donde entra y toca el elemento que sale.',
        taller: cfg, conceptos: ['pc_cola'],
        explicacion: 'Cola (FIFO): se entra por el **final** y se sale por el **frente**. Estado final (frente → final): **' + cfg.finalEsperado.replace(/ salieron.*$/, '') + '**. Con una `list`, `pop(0)` sería O(n); con `deque.popleft()` es O(1).'
      });
    }
  });
  B({
    id: 'n11-taller-deque', n: 11, e: 'B', dif: 3, c: ['pc_deque', 'pc_cola'], tema: 'Taller: operar una deque', soloPractica: true,
    gen(rng) {
      const vals = rng.distinct(rng.int(2, 4), 1, 50), ops = secuenciaPC(rng, 'deque', vals, rng.int(4, 6)), cfg = mk('pc', { modo: 'deque', vals, ops });
      return base('Taller interactivo de pilas y colas', {
        enunciado: 'Esta **deque** (`collections.deque`) tiene (de izquierda a derecha) **' + lst(vals) + '**. Ejecuta **en orden**: ' + textoOpsPC(ops, 'deque') + '. `append` y `pop` actúan sobre el **final**; `appendleft` y `popleft`, sobre el **frente**.',
        taller: cfg, conceptos: ['pc_deque', 'pc_cola'],
        explicacion: 'Una deque opera en **ambos extremos en O(1)**. Estado final: **' + cfg.finalEsperado.replace(/ salieron.*$/, '') + '**.'
      });
    }
  });
  B({
    id: 'n11-taller-circ', n: 11, e: 'B', dif: 3, c: ['pc_circ'], tema: 'Taller: cola circular sobre un arreglo', soloPractica: true,
    gen(rng) {
      let C, frente, vals, ops;
      for (let g = 0; g < 200; g++) {
        C = rng.int(4, 6); frente = rng.int(1, C - 1); vals = rng.distinct(rng.int(1, C - 2), 1, 50); let tam = vals.length, f = frente, dio = false; const usados = new Set(vals); ops = [];
        for (let i = 0; i < rng.int(3, 5); i++) {
          if (tam === 0 || (tam < C && rng.chance(.6))) { if (f + tam >= C) dio = true; ops.push({ t: 'enc', v: nuevoDistinto(rng, usados, 1, 90) }); tam++; } else { ops.push({ t: 'des' }); f = (f + 1) % C; tam--; }
        }
        if (dio) break;
      }
      const cfg = mk('pc', { modo: 'circ', C, frente, vals, ops });
      return base('Taller interactivo de pilas y colas', {
        enunciado: 'Una **cola circular** usa un arreglo de **C = ' + C + '** casillas con **frente = ' + frente + '** y **tam = ' + vals.length + '** (elementos en orden: **' + lst(vals) + '**). Ejecuta **en orden**: ' + textoOpsPC(ops, 'circ') + '. Para encolar elige la casilla `(frente + tam) % C`; para desencolar, la del `frente`.',
        taller: cfg, conceptos: ['pc_circ'],
        explicacion: 'Encolar: `final = (frente + tam) % C`; desencolar: `frente = (frente + 1) % C`. El **módulo** hace que dé la vuelta sin desplazar nada: **O(1)**. Estado final (frente → final): **' + cfg.finalEsperado.replace(/ salieron.*$/, '') + '**.'
      });
    }
  });

  /* ------------------------------ LISTAS ENLAZADAS ------------------------------ */
  B({
    id: 'n12-taller-lista-ins', n: 12, e: 'A', dif: 3, c: ['le_nodo', 'le_ins'], tema: 'Taller: insertar en una lista enlazada', soloPractica: true,
    gen(rng) {
      const vals = rng.distinct(rng.int(3, 5), 5, 80), usados = new Set(vals), ops = [];
      ops.push({ t: 'ini', v: nuevoDistinto(rng, usados, 1, 90) });
      const x = rng.pick(vals), pos = rng.int(0, 3);
      ops.push(pos === 3 ? { t: 'fin', v: nuevoDistinto(rng, usados, 1, 90) } : { t: 'tras', x, v: nuevoDistinto(rng, usados, 1, 90) });
      const cfg = mk('lista', { vals, ops }), F = TG.familias.lista;
      return base('Taller interactivo de la lista enlazada', {
        enunciado: 'Esta **lista enlazada simple** es **' + vals.join(' → ') + ' → None**. Ejecuta **en orden**: ' + ops.map(o => F.nombreOp(o)).join(' → ') + '. Reasigna las referencias **en el orden correcto** (arrastra un nodo sobre aquel al que va a apuntar): si lo haces al revés, pierdes el resto de la lista.',
        taller: cfg, conceptos: ['le_nodo', 'le_ins'],
        explicacion: 'Primero el **nuevo** apunta al sucesor y **después** el anterior (o la cabeza) apunta al nuevo. Lista final: **' + cfg.finalEsperado.split(',').join(' → ') + ' → None**. Al inicio es O(1); en una posición cualquiera hay que recorrer hasta el anterior (O(n)).'
      });
    }
  });
  B({
    id: 'n12-taller-lista-elim', n: 12, e: 'B', dif: 3, c: ['le_del', 'le_nodo'], tema: 'Taller: eliminar de una lista enlazada', soloPractica: true,
    gen(rng) {
      const vals = rng.distinct(rng.int(4, 6), 5, 80), ops = [{ t: 'elim', v: vals[0] }, { t: 'elim', v: rng.pick(vals.slice(1, -1).length ? vals.slice(1, -1) : vals.slice(1)) }];
      if (rng.chance(.5)) ops.reverse();
      const cfg = mk('lista', { vals, ops });
      return base('Taller interactivo de la lista enlazada', {
        enunciado: 'Esta **lista enlazada simple** es **' + vals.join(' → ') + ' → None**. Elimina **en orden** los valores **' + coma(ops.map(o => o.v)) + '**. Para quitar un nodo se **puentea**: el anterior deja de apuntarle y apunta a su siguiente (si es la cabeza, se mueve la **cabeza**).',
        taller: cfg, conceptos: ['le_del', 'le_nodo'],
        explicacion: 'Eliminar es **O(1)** si ya se tiene el anterior y **O(n)** si hay que buscarlo. Lista final: **' + (cfg.finalEsperado ? cfg.finalEsperado.split(',').join(' → ') + ' → None' : 'vacía') + '**.'
      });
    }
  });

  /* ------------------------------ ARREGLOS ------------------------------ */
  B({
    id: 'n10-taller-arreglo-ins', n: 10, e: 'A', dif: 2, c: ['ay_def'], tema: 'Taller: insertar en un arreglo (desplazar)', soloPractica: true,
    gen(rng) {
      const n = rng.int(4, 7), vals = rng.distinct(n, 5, 80), v = rng.int(1, 90), k = rng.int(0, n - 1), cfg = mk('arr', { vals, ops: [{ t: 'ins', v, k }] });
      return base('Taller interactivo de arreglos', {
        enunciado: 'Inserta el valor **' + v + '** en la posición **' + k + '** del arreglo **' + lst(vals) + '** (hay una casilla libre al final). Desplaza los elementos **a la derecha empezando por el último** y escribe el valor nuevo en el hueco.',
        taller: cfg, conceptos: ['ay_def'],
        explicacion: 'Se desplazaron **' + (n - k) + '** elemento(s): **O(n)**. Arreglo final: **' + lst(cfg.finalEsperado.split(',')) + '**. Si se empieza por el principio se sobrescriben valores que aún no se movieron.'
      });
    }
  });
  B({
    id: 'n10-taller-arreglo-elim', n: 10, e: 'B', dif: 2, c: ['ay_def'], tema: 'Taller: eliminar de un arreglo (desplazar)', soloPractica: true,
    gen(rng) {
      const n = rng.int(5, 8), vals = rng.distinct(n, 5, 80), k = rng.int(0, n - 2), cfg = mk('arr', { vals, ops: [{ t: 'del', k }] });
      return base('Taller interactivo de arreglos', {
        enunciado: 'Elimina el elemento de la posición **' + k + '** (el **' + vals[k] + '**) del arreglo **' + lst(vals) + '**: desplaza los siguientes **a la izquierda empezando por el primero** y reduce el tamaño.',
        taller: cfg, conceptos: ['ay_def'],
        explicacion: 'Se desplazaron **' + (n - 1 - k) + '** elemento(s): **O(n)**. Arreglo final: **' + lst(cfg.finalEsperado.split(',')) + '**.'
      });
    }
  });
  B({
    id: 'n3-taller-busqueda-binaria', n: 3, e: 'B', dif: 2, c: ['pd_dyc', 'ay_def'], tema: 'Taller: búsqueda binaria paso a paso', soloPractica: true,
    gen(rng) {
      const n = rng.int(8, 13), vals = rng.distinct(n, 3, 90).sort((a, b) => a - b), esta = rng.chance(.6), x = esta ? rng.pick(vals) : (() => { let v; do { v = rng.int(1, 95); } while (vals.includes(v)); return v; })();
      const cfg = mk('arr', { vals, ops: [{ t: 'bin', x }] });
      return base('Taller interactivo de arreglos', {
        enunciado: 'Busca **' + x + '** en el arreglo **ordenado** **' + lst(vals) + '** con **búsqueda binaria**: en cada vuelta elige la casilla del medio `(lo + hi) // 2`, compárala con ' + x + ' y descarta la mitad que no puede contenerlo.',
        taller: cfg, conceptos: ['pd_dyc', 'ay_def'],
        explicacion: (esta ? x + ' sí está en el arreglo.' : x + ' no está en el arreglo.') + ' Cada comparación descarta **la mitad** del rango: como mucho ⌊log₂ n⌋ + 1 = **' + (Math.floor(Math.log2(n)) + 1) + '** comparaciones para n = ' + n + ' (**O(log n)**).'
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
