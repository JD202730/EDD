/* banco_n6.js — Nivel 6: Árboles BST (S6-C2) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py, Arb = ET.Arb;
  const J = a => a.map(String).join(' ');
  const cuenta = t => t ? 1 + cuenta(t.l) + cuenta(t.r) : 0;

  /* ---------- utilidades ---------- */
  /** primera violación de la propiedad BST (sobre todo el subárbol) */
  function violacion(t) {
    let res = null;
    (function rec(n, lo, hi) {
      if (!n || res) return;
      if (lo && !Arb.lt(lo.v, n.v)) { res = { n: n.v, a: lo.v, lado: 'der' }; return; }
      if (hi && !Arb.lt(n.v, hi.v)) { res = { n: n.v, a: hi.v, lado: 'izq' }; return; }
      rec(n.l, lo, n); rec(n.r, n, hi);
    })(t, null, null);
    return res;
  }
  /** cumple la relación solo con los hijos inmediatos */
  function localOk(n) {
    if (!n) return true;
    if (n.l && !Arb.lt(n.l.v, n.v)) return false;
    if (n.r && !Arb.lt(n.v, n.r.v)) return false;
    return localOk(n.l) && localOk(n.r);
  }
  function conValor(t, v, nuevo) { return t ? (String(t.v) === String(v) ? { v: nuevo, l: t.l, r: t.r } : { v: t.v, l: conValor(t.l, v, nuevo), r: conValor(t.r, v, nuevo) }) : null; }
  /** corrompe un BST; trampa=true busca una violación "profunda" (válida con los hijos inmediatos) */
  function corromper(rng, t, trampa) {
    const vals = Arb.pre(t).map(String);
    for (let i = 0; i < 200; i++) {
      const v = rng.pick(vals); const nv = rng.int(2, 98);
      if (vals.includes(String(nv))) continue;
      const c = conValor(t, v, nv);
      if (Arb.esBST(c)) continue;
      if (trampa && !localOk(c)) continue;
      return c;
    }
    return null;
  }
  const textoViol = vio => 'El valor **' + vio.n + '** está en el subárbol ' + (vio.lado === 'der' ? 'derecho' : 'izquierdo') + ' de **' + vio.a + '**, pero ' + (vio.lado === 'der' ? vio.n + ' ≤ ' + vio.a : vio.n + ' ≥ ' + vio.a) + ': la propiedad debe valer con **todo el subárbol**.';
  const bstAleatorio = (rng, n, bal) => Arb.bstAleatorio(rng, n, 5, 95, bal);

  /* ============ A ============ */
  B({
    id: 'n6-es-bst', n: 6, e: 'A', dif: 3, c: ['bs_prop', 'bs_errores'], tema: '¿Es un BST?',
    gen(rng, K) {
      const k = 4; const items = []; const arboles = []; const cats = rng.shuffle([0, 1, 1, rng.pick([0, 1])]);
      let trampaUsada = false;
      for (let i = 0; i < k; i++) {
        let t = bstAleatorio(rng, rng.int(5, 7), rng.chance(0.5)).arbol; let cat = cats[i];
        let why = 'Para cada nodo, todo su subárbol izquierdo es menor y todo el derecho mayor: cumple.';
        if (cat === 1) {
          const c = corromper(rng, t, !trampaUsada && rng.chance(0.6));
          if (c) { t = c; trampaUsada = trampaUsada || localOk(c); why = textoViol(violacion(c)); } else cat = 0;
        }
        arboles.push({ titulo: 'Árbol ' + (i + 1), arbol: t });
        items.push({ t: 'Árbol ' + (i + 1) + ' (`' + Arb.nota(t) + '`)', cat: cat === 0 ? 0 : 1, why });
      }
      return {
        tipo: 'clasificar', enunciado: '¿Cuáles de estos árboles son **BST válidos** (para cada nodo: todos los valores del subárbol izquierdo < nodo < todos los del derecho)? Ojo con comprobar todo el subárbol.', arboles, categorias: ['Sí es un BST', 'No es un BST'], items,
        pistas: ['Comprueba, para cada nodo, que **todo** su subárbol izquierdo sea menor y **todo** el derecho mayor (no solo sus hijos inmediatos).', 'Un truco: el inorden de un BST es una secuencia estrictamente creciente. Escribe el inorden de cada árbol.', 'Un valor puede ser correcto respecto a su padre pero violar la regla respecto a un abuelo.'],
        explicacion: 'Verificar solo hijos inmediatos es un error frecuente (S6-C2, diap. 16): la propiedad vale con todo el subárbol.'
      };
    }
  });

  B({
    id: 'n6-insertar-secuencia', n: 6, e: 'A', dif: 2, c: ['bs_insertar', 'bs_prop'], tema: 'Construir un BST',
    gen(rng, K) {
      const n = rng.int(5, 7); const vals = rng.distinct(n, 3, 60); const t = Arb.insertarSecuencia(vals);
      return {
        tipo: 'arbol', enunciado: 'Inserta, en este orden, los valores **' + K.coma(vals) + '** en un BST vacío (los valores menores van a la izquierda, los mayores a la derecha; cada nuevo valor se cuelga como hoja). Escribe el árbol resultante en notación `valor(izq,der)`.', esperado: t, verificar: { bst: true }, placeholder: 'p. ej. 8(3,10)',
        pistas: ['El primer valor es la raíz. Cada valor siguiente: compáralo con la raíz y baja a la izquierda (menor) o derecha (mayor) hasta encontrar un lugar vacío.', 'El nuevo valor siempre se cuelga como **hoja**; nunca se reorganiza lo que ya está.', 'Dibuja el árbol paso a paso después de cada inserción.'],
        explicacion: 'Árbol: **' + Arb.nota(t) + '** (altura ' + Arb.altura(t) + '). Su inorden es ' + J(Arb.ino(t)) + ' (ordenado).'
      };
    }
  });

  B({
    id: 'n6-recorrido-bst', n: 6, e: 'A', dif: 3, c: ['bs_inorden', 'bs_insertar', 'tv_pre'], tema: 'Recorridos de un BST',
    gen(rng, K) {
      const n = rng.int(6, 8); const vals = rng.distinct(n, 3, 60); const t = Arb.insertarSecuencia(vals);
      const k = rng.pick(['pre', 'post', 'in']); const nom = { pre: 'preorden', post: 'postorden', in: 'inorden' }[k]; const f = { pre: Arb.pre, post: Arb.post, in: Arb.ino }[k];
      return {
        tipo: 'salida', tokens: true, enunciado: 'Se insertan en un BST vacío los valores **' + K.coma(vals) + '** (en ese orden). Escribe el recorrido en **' + nom + '** del árbol resultante.', esperado: J(f(t)), placeholder: 'valores separados por espacio', animacion: { arbol: t, orden: f(t), nombre: nom },
        pistas: ['Primero construye el BST insertando en el orden dado.', k === 'in' ? 'Recuerda: el inorden de un BST entrega los valores ordenados.' : 'Aplica el orden del recorrido (' + nom + ') sobre el árbol que construiste.', 'Verifica: el primer elemento del preorden y el último del postorden son la raíz (el primer valor insertado).'],
        explicacion: 'Árbol: ' + Arb.nota(t) + ' → ' + nom + ': **' + J(f(t)) + '**.'
      };
    }
  });

  B({
    id: 'n6-busqueda-ruta', n: 6, e: 'A', dif: 2, c: ['bs_buscar'], tema: 'Ruta de una búsqueda',
    gen(rng, K) {
      const n = rng.int(6, 9); const { arbol: t } = bstAleatorio(rng, n, rng.chance(0.5)); const vals = Arb.ino(t);
      const existe = rng.chance(0.7); let x;
      if (existe) x = rng.pick(vals); else { do { x = rng.int(2, 98); } while (vals.includes(x)); }
      const ruta = Arb.camino(t, x);
      return {
        tipo: 'salida', tokens: true, enunciado: 'Se busca el valor **' + x + '** en el BST. Escribe, en orden, los **valores de los nodos con los que se compara** `' + x + '` (empieza por la raíz y termina al encontrarlo' + (existe ? '' : ' o al llegar a un hijo vacío') + ').', arbol: t, esperado: J(ruta), placeholder: 'p. ej. 50 30 40',
        pistas: ['Empieza en la raíz: si el valor buscado es menor, baja a la izquierda; si es mayor, a la derecha.', 'Anota cada nodo con el que comparas. Termina cuando lo encuentras o cuando el hijo al que debes bajar no existe.', 'Solo recorres un camino raíz–hoja: por eso la búsqueda es O(h).'],
        explicacion: 'Ruta: **' + J(ruta) + '** → ' + ruta.length + ' comparaciones. ' + (existe ? 'Lo encuentra.' : 'Llega a un hijo vacío: el valor no está.')
      };
    }
  });

  const VF6 = [
    { a: 'El recorrido inorden de un BST entrega los valores en orden ascendente.', v: true, e: 'Primero todo lo menor, luego el nodo, luego todo lo mayor.', j: ['En cada nodo se visita primero todo el subárbol menor, luego el nodo y luego el mayor.', 'El inorden visita primero las hojas.', 'Solo ocurre si el árbol es perfecto.'] },
    { a: 'Para comprobar que un árbol es un BST basta verificar que cada nodo sea mayor que su hijo izquierdo y menor que su hijo derecho.', v: false, e: 'La propiedad debe valer con **todo el subárbol**, no solo con los hijos inmediatos.', j: ['Un valor puede cumplir con su padre y violar la regla respecto a un ancestro más arriba.', 'Basta con revisar la raíz y sus dos hijos.', 'Con revisar las hojas es suficiente.'] },
    { a: 'La búsqueda en un BST cuesta siempre O(log n).', v: false, e: 'Cuesta O(h): solo es O(log n) si el árbol está balanceado; degenerado es O(n).', j: ['Cuesta O(h) y la altura h puede llegar a n−1 si el árbol degenera.', 'Siempre cuesta O(1) porque se compara solo una vez.', 'Siempre cuesta O(n) porque se recorren todos los nodos.'] },
    { a: 'Insertar los valores 1, 2, 3, …, n en orden creciente en un BST vacío produce un árbol degenerado de altura n − 1.', v: true, e: 'Cada valor es mayor que todos los anteriores y se cuelga a la derecha del último.', j: ['Cada nuevo valor es mayor que todos los anteriores, así que siempre va a la derecha.', 'Produce un árbol perfecto.', 'Produce un árbol de altura log n.'] },
    { a: 'Al eliminar un nodo con **dos hijos** basta con quitarlo y subir uno de sus hijos.', v: false, e: 'Se reemplaza su valor por el predecesor (o sucesor) inorden y luego se elimina ese sustituto de su posición original.', j: ['Subir un hijo puede romper el orden; se usa el predecesor/sucesor inorden como sustituto.', 'Sí, porque el hijo siempre es mayor que el resto.', 'Hay que reconstruir todo el árbol desde cero.'] },
    { a: 'En el BST de clase, al insertar un valor que ya existe no se duplica.', v: true, e: 'Convención: `elif v > nodo.valor` / `if v < …`; si es igual, se deja el árbol como está.', j: ['La función solo cuelga hojas cuando llega a `None`; con un valor igual no baja a ningún lado.', 'Se inserta a la izquierda del existente.', 'Se inserta a la derecha del existente.'] },
    { a: 'Eliminar un nodo **hoja** de un BST consiste en quitarlo directamente.', v: true, e: 'Caso 0 hijos: se elimina el nodo.', j: ['No tiene hijos que reubicar, así que no hay nada más que reconectar.', 'Siempre hay que reemplazarlo por el predecesor.', 'Es imposible eliminar una hoja.'] },
    { a: 'El valor **mínimo** de un BST se encuentra bajando siempre por la rama izquierda.', v: true, e: 'Todo lo menor está a la izquierda.', j: ['Todo lo menor que un nodo está en su subárbol izquierdo.', 'El mínimo siempre es la raíz.', 'Hay que revisar todos los nodos.'] },
    { a: 'Una tabla hash permite listar las claves en orden sin ningún costo adicional.', v: false, e: 'La tabla hash no mantiene orden; el BST sí (inorden).', j: ['Las claves en una tabla hash no están ordenadas; habría que ordenarlas.', 'Sí, porque tiene búsqueda O(1).', 'Sí, porque usa un árbol.'] },
    { a: 'El **predecesor inorden** de un nodo con hijo izquierdo es simplemente su hijo izquierdo.', v: false, e: 'Es el **mayor** del subárbol izquierdo (se baja por la derecha desde el hijo izquierdo).', j: ['El predecesor es el mayor del subárbol izquierdo, no necesariamente el hijo.', 'El predecesor es siempre el padre.', 'Sí, es siempre el hijo izquierdo.'] }
  ];
  B({
    id: 'n6-vf', n: 6, e: 'A', dif: 2, c: ['bs_prop', 'bs_eliminar', 'bs_altura', 'bs_hash', 'bs_errores'], tema: 'BST (V/F)',
    gen(rng, K) {
      const it = rng.pick(VF6);
      return {
        tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón correcta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Piensa en la propiedad de orden del BST y en que se aplica recursivamente a todo el subárbol.', 'Recuerda que las operaciones cuestan O(h): log n si está balanceado, n si degenera.', 'Prueba la afirmación con un BST de 5 o 6 nodos.']
      };
    }
  });

  /* ============ B ============ */
  function nodoParaEliminar(rng, t, hijos) {
    const cands = Arb.nodos(t).filter(n => (n.l ? 1 : 0) + (n.r ? 1 : 0) === hijos);
    return cands.length ? rng.pick(cands) : null;
  }
  B({
    id: 'n6-eliminar', n: 6, e: 'B', dif: 3, c: ['bs_eliminar', 'bs_minmax'], tema: 'Eliminar en un BST',
    gen(rng, K, opts) {
      for (let intento = 0; intento < 60; intento++) {
        const n = rng.int(6, 8); const { arbol: t } = bstAleatorio(rng, n, rng.chance(0.6));
        const h = (opts && opts.hijos !== undefined) ? opts.hijos : rng.pick([0, 1, 2, 2]);
        const x = nodoParaEliminar(rng, t, h); if (!x) continue;
        const pred = Arb.delBST(t, x.v, 'pred'), suc = Arb.delBST(t, x.v, 'suc');
        const aceptados = h === 2 ? [suc] : [];
        const caso = h === 0 ? 'hoja (0 hijos)' : (h === 1 ? '1 hijo' : '2 hijos');
        return {
          tipo: 'arbol', enunciado: 'Elimina el valor **' + x.v + '** de este BST. Convención de clase: si el nodo tiene 2 hijos se reemplaza su valor por el **predecesor inorden** (el mayor del subárbol izquierdo); *también se acepta el sucesor* (el menor del derecho). Escribe el árbol resultante en notación `valor(izq,der)`.',
          arbol: t, esperado: pred, aceptados, verificar: { bst: true }, placeholder: 'p. ej. 10(5,15)', conceptos: ['bs_eliminar'],
          pistas: ['Primero cuenta cuántos hijos tiene el nodo ' + x.v + ': 0, 1 o 2. Cada caso se trata distinto.', 'Hoja: se quita. Un hijo: ese hijo ocupa su lugar. Dos hijos: sube el predecesor (mayor del izquierdo) y ese sustituto se elimina de donde estaba.', 'Después de eliminar, el inorden debe seguir estando ordenado: úsalo para verificar.'],
          explicacion: 'El nodo ' + x.v + ' es ' + caso + '. Resultado: **' + Arb.nota(pred) + '**' + (h === 2 ? ' (con el sucesor: ' + Arb.nota(suc) + ')' : '') + '.'
        };
      }
      throw new Error('no se pudo generar eliminación');
    }
  });

  B({
    id: 'n6-casos-eliminar', n: 6, e: 'B', dif: 3, c: ['bs_eliminar', 'bs_minmax'], tema: 'Los tres casos de eliminación',
    gen(rng, K) {
      const n = rng.int(7, 9); const { arbol: t } = bstAleatorio(rng, n, rng.chance(0.6));
      const h = rng.pick([0, 1, 2]); const x = nodoParaEliminar(rng, t, h) || nodoParaEliminar(rng, t, 2) || t; const hx = (x.l ? 1 : 0) + (x.r ? 1 : 0);
      let q2, e2, ex2;
      if (hx === 0) { q2 = '¿Qué valor ocupa el lugar de `' + x.v + '` después de eliminarlo? (escribe `ninguno` si el lugar queda vacío)'; e2 = ['ninguno', 'ninguna', 'vacio', 'nada', 'none']; ex2 = 'Es una hoja: se quita y el lugar queda vacío.'; }
      else if (hx === 1) { const hijo = x.l || x.r; q2 = '¿Qué valor ocupa el lugar de `' + x.v + '` después de eliminarlo?'; e2 = String(hijo.v); ex2 = 'Se reemplaza el nodo por su único hijo (' + hijo.v + ').'; }
      else { const p = Arb.maximo(x.l); q2 = '¿Qué valor **sube** a la posición de `' + x.v + '` si se usa el **predecesor inorden**?'; e2 = String(p.v); ex2 = 'Predecesor = mayor del subárbol izquierdo = ' + p.v + '.'; }
      const suc = hx === 2 ? Arb.minimo(x.r) : null;
      return {
        tipo: 'mixta', enunciado: 'Se elimina el nodo **' + x.v + '** del BST dibujado.', arbol: t,
        partes: [
          { titulo: 'Caso', peso: 1, q: { tipo: 'opcion', enunciado: '¿Cuántos hijos tiene el nodo ' + x.v + ', es decir, en qué caso de eliminación estamos?', opciones: [{ t: '0 hijos (hoja)', ok: hx === 0, why: hx === 0 ? 'Es una hoja.' : 'Tiene hijos.' }, { t: '1 hijo', ok: hx === 1, why: hx === 1 ? 'Tiene exactamente un hijo.' : 'No tiene exactamente un hijo.' }, { t: '2 hijos', ok: hx === 2, why: hx === 2 ? 'Tiene los dos hijos.' : 'No tiene dos hijos.' }] } },
          { titulo: 'Sustituto', peso: 1.5, q: { tipo: 'salida', tokens: true, enunciado: q2, esperado: e2 } },
          hx === 2 ? { titulo: 'Sucesor', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Y si se usara el **sucesor inorden** (el menor del subárbol derecho), ¿qué valor subiría?', esperado: String(suc.v) } } : { titulo: 'Resultado', peso: 1, q: { tipo: 'arbol', enunciado: 'Escribe el árbol resultante en notación `valor(izq,der)`.', esperado: Arb.delBST(t, x.v, 'pred'), verificar: { bst: true } } }
        ],
        pistas: ['Cuenta los hijos del nodo en el dibujo.', '0 hijos: se quita. 1 hijo: lo reemplaza su hijo. 2 hijos: sube el predecesor (mayor del izquierdo) o el sucesor (menor del derecho).', 'Predecesor: baja una vez a la izquierda y luego todo a la derecha. Sucesor: una vez a la derecha y luego todo a la izquierda.'],
        explicacion: ex2
      };
    }
  });

  B({
    id: 'n6-altura-orden', n: 6, e: 'B', dif: 3, c: ['bs_ordenins', 'bs_altura'], tema: 'El orden de inserción importa',
    gen(rng, K) {
      const n = rng.int(5, 8); const vals = rng.distinct(n, 3, 80); const asc = vals.slice().sort((a, b) => a - b);
      const t1 = Arb.insertarSecuencia(vals), t2 = Arb.insertarSecuencia(asc), t3 = Arb.insertarSecuencia(asc.slice().reverse());
      return {
        tipo: 'tabla', enunciado: 'Se insertan los mismos **' + n + ' valores** en un BST vacío de tres maneras. Completa la **altura** (en aristas) de cada árbol resultante.\n\n- Orden A (dado): `' + K.coma(vals) + '`\n- Orden B (creciente): `' + K.coma(asc) + '`\n- Orden C (decreciente): `' + K.coma(asc.slice().reverse()) + '`',
        cols: ['Orden de inserción', 'Altura'], filas: [[{ t: 'A (dado)' }, { in: String(Arb.altura(t1)), w: 4 }], [{ t: 'B (creciente)' }, { in: String(Arb.altura(t2)), w: 4 }], [{ t: 'C (decreciente)' }, { in: String(Arb.altura(t3)), w: 4 }]],
        pistas: ['Construye cada árbol (aunque sea un borrador) y mide la altura: aristas de la raíz a la hoja más profunda.', 'Si los valores llegan ya ordenados, cada nuevo valor se cuelga siempre del mismo lado del anterior: se forma una lista.', 'Una lista de n nodos tiene altura n − 1.'],
        explicacion: 'A: altura ' + Arb.altura(t1) + ' (' + Arb.nota(t1) + '); B y C: ' + (n - 1) + ' (degenerados, como una lista). Por eso los datos ordenados degeneran el BST y las operaciones pasan a O(n).'
      };
    }
  });

  B({
    id: 'n6-degenera', n: 6, e: 'B', dif: 3, c: ['bs_altura', 'bs_ordenins'], tema: 'Balanceado vs degenerado',
    gen(rng, K) {
      const h = rng.int(2, 4); const n = Math.pow(2, h + 1) - 1;
      return {
        tipo: 'tabla', enunciado: 'Se tienen **n = ' + n + '** valores distintos. Compara dos BST con esos valores: uno **degenerado** (insertados en orden creciente) y uno **perfecto**. Completa:', cols: ['Medida', 'Valor'],
        filas: [[{ t: 'Altura del BST degenerado' }, { in: String(n - 1), w: 4 }], [{ t: 'Comparaciones para buscar el mayor valor en el degenerado' }, { in: String(n), w: 4 }], [{ t: 'Altura del BST perfecto' }, { in: String(h), w: 4 }], [{ t: 'Comparaciones máximas para buscar un valor en el perfecto' }, { in: String(h + 1), w: 4 }]],
        pistas: ['Degenerado = lista: altura n − 1 y el último valor exige comparar con los n nodos.', 'Perfecto de n = 2^(h+1) − 1 nodos: despeja h.', 'En el peor caso se compara con un nodo por nivel: h + 1 comparaciones.'],
        explicacion: 'Degenerado: altura ' + (n - 1) + ', ' + n + ' comparaciones (O(n)). Perfecto: altura ' + h + ', ' + (h + 1) + ' comparaciones (O(log n)). Complejidad = O(h).'
      };
    }
  });

  /* ---------- implementación ---------- */
  function casosBST(rng, K, tipo) {
    const out = [];
    for (let i = 0; i < 4; i++) { const { arbol } = bstAleatorio(rng, rng.int(4, 8), rng.chance(0.5)); out.push(arbol); }
    return out;
  }
  const IMPL6 = [
    {
      fn: 'buscar', enun: 'Escribe `buscar(nodo, v)` que devuelva `True` si el valor `v` está en el BST que cuelga de `nodo` y `False` en caso contrario. Aprovecha la propiedad del BST (en cada nodo descarta un subárbol). Para `None` devuelve `False`.', sol: `def buscar(nodo, v):\n    if nodo is None:\n        return False\n    if v == nodo.valor:\n        return True\n    if v < nodo.valor:\n        return buscar(nodo.izq, v)\n    return buscar(nodo.der, v)`,
      tests: (rng, K) => { const o = [{ e: 'buscar(None, 5)', r: 'False' }]; casosBST(rng, K).forEach(t => { const vs = Arb.ino(t); const x = rng.pick(vs); let y; do { y = rng.int(1, 99); } while (vs.includes(y)); o.push({ e: `buscar(${K.pyN(t)}, ${x})`, r: 'True' }, { e: `buscar(${K.pyN(t)}, ${y})`, r: 'False' }); }); return o; },
      pistas: ['Casos base: árbol vacío → `False`; valor igual al del nodo → `True`.', 'Si `v` es menor, solo puede estar en el subárbol izquierdo; si es mayor, en el derecho.', 'Devuelve el resultado de la llamada recursiva: `return buscar(nodo.izq, v)`.']
    },
    {
      fn: 'insertar', enun: 'Escribe `insertar(nodo, v)` que inserte `v` en el BST que cuelga de `nodo` y **devuelva la raíz** del árbol. Si `v` ya existe no se duplica. Para `None` devuelve un nodo nuevo.', sol: `def insertar(nodo, v):\n    if nodo is None:\n        return NodoArbol(v)\n    if v < nodo.valor:\n        nodo.izq = insertar(nodo.izq, v)\n    elif v > nodo.valor:\n        nodo.der = insertar(nodo.der, v)\n    return nodo`,
      tests: (rng, K) => { const o = [{ e: 'a_nota(insertar(None, 5))', r: '"5"' }]; casosBST(rng, K).forEach(t => { const vs = Arb.ino(t); let y; do { y = rng.int(1, 99); } while (vs.includes(y)); o.push({ e: `a_nota(insertar(${K.pyN(t)}, ${y}))`, r: JSON.stringify(Arb.nota(Arb.insBST(t, y))) }); const x = rng.pick(vs); o.push({ e: `a_nota(insertar(${K.pyN(t)}, ${x}))`, r: JSON.stringify(Arb.nota(t)) }); }); return o; },
      pistas: ['Caso base: al llegar a `None` se crea el nodo nuevo (`NodoArbol(v)`) y se devuelve.', 'Si `v` es menor, el nuevo subárbol izquierdo es el resultado de insertar en el izquierdo (asígnalo: `nodo.izq = …`).', 'No olvides `return nodo` al final para devolver la raíz.']
    },
    {
      fn: 'minimo', enun: 'Escribe `minimo(nodo)` que devuelva el **menor valor** de un BST no vacío (sin recorrerlo entero: baja por la izquierda).', sol: `def minimo(nodo):\n    while nodo.izq is not None:\n        nodo = nodo.izq\n    return nodo.valor`,
      tests: (rng, K) => casosBST(rng, K).map(t => ({ e: `minimo(${K.pyN(t)})`, r: String(Arb.ino(t)[0]) })).concat([{ e: 'minimo(N(7))', r: '7' }]),
      pistas: ['En un BST todo lo menor está a la izquierda.', 'Mientras exista hijo izquierdo, baja a él.', 'Cuando ya no haya hijo izquierdo, el valor de ese nodo es el mínimo.']
    },
    {
      fn: 'maximo', enun: 'Escribe `maximo(nodo)` que devuelva el **mayor valor** de un BST no vacío (baja por la derecha).', sol: `def maximo(nodo):\n    if nodo.der is None:\n        return nodo.valor\n    return maximo(nodo.der)`,
      tests: (rng, K) => casosBST(rng, K).map(t => ({ e: `maximo(${K.pyN(t)})`, r: String(Arb.ino(t).slice(-1)[0]) })).concat([{ e: 'maximo(N(7))', r: '7' }]),
      pistas: ['En un BST todo lo mayor está a la derecha.', 'Si el nodo no tiene hijo derecho, él es el máximo; si lo tiene, el máximo está en ese subárbol.', '`return maximo(nodo.der)` después del caso base.']
    },
    {
      fn: 'contar_menores', enun: 'Escribe `contar_menores(nodo, v)` que devuelva cuántos valores del BST son **estrictamente menores** que `v`. Aprovecha la propiedad del BST para no recorrer subárboles innecesarios.', sol: `def contar_menores(nodo, v):\n    if nodo is None:\n        return 0\n    if nodo.valor < v:\n        return 1 + contar_menores(nodo.izq, v) + contar_menores(nodo.der, v)\n    return contar_menores(nodo.izq, v)`,
      tests: (rng, K) => casosBST(rng, K).map(t => { const y = rng.int(1, 99); return { e: `contar_menores(${K.pyN(t)}, ${y})`, r: String(Arb.ino(t).filter(x => x < y).length) }; }).concat([{ e: 'contar_menores(None, 3)', r: '0' }]),
      pistas: ['Árbol vacío → 0.', 'Si el valor del nodo es menor que `v`, cuenta ese nodo y busca en ambos subárboles; si no, todo el subárbol derecho es ≥ v y solo importa el izquierdo.', 'Dos ramas: `nodo.valor < v` suma 1 + izquierda + derecha; en otro caso, solo izquierda.']
    }
  ];
  B({
    id: 'n6-impl', n: 6, e: 'B', dif: 3, c: ['bs_buscar', 'bs_insertar', 'bs_minmax'], tema: 'Implementar operaciones de BST',
    gen(rng, K, opts) {
      const f = opts && opts.fam ? IMPL6.find(x => x.fn === opts.fam) : rng.pick(IMPL6);
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: f.fn, cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: f.enun + '\n\nLa clase de nodo ya está definida (tus funciones pueden usarla):', codigoVista: K.CLASE_NODO,
        starter: `def ${f.fn}(nodo${f.fn === 'minimo' || f.fn === 'maximo' ? '' : ', v'}):\n    # tu código aquí\n    pass`, solucion: f.sol, tests: f.tests(rng, K), reglas: [], ejemploLlamada: f.fn + '(N(10, N(5), N(15))' + (f.fn === 'minimo' || f.fn === 'maximo' ? ')' : ', 5)'), pistas: f.pistas,
        explicacion: '```\n' + f.sol + '\n```\nCosto O(h): un solo camino raíz–hoja.'
      };
    }
  });

  const SOL_ELIM = `def eliminar(nodo, v):\n    if nodo is None:\n        return None\n    if v < nodo.valor:\n        nodo.izq = eliminar(nodo.izq, v)\n    elif v > nodo.valor:\n        nodo.der = eliminar(nodo.der, v)\n    else:\n        if nodo.izq is None:\n            return nodo.der\n        if nodo.der is None:\n            return nodo.izq\n        pred = nodo.izq\n        while pred.der is not None:\n            pred = pred.der\n        nodo.valor = pred.valor\n        nodo.izq = eliminar(nodo.izq, pred.valor)\n    return nodo`;
  function testsEliminar(rng, K) {
    const out = [];
    for (const h of [0, 1, 2, 2]) {
      for (let i = 0; i < 40; i++) {
        const { arbol: t } = bstAleatorio(rng, rng.int(5, 8), rng.chance(0.6)); const x = nodoParaEliminar(rng, t, h);
        if (x) { out.push({ e: `a_nota(eliminar(${K.pyN(t)}, ${x.v}))`, r: JSON.stringify(Arb.nota(Arb.delBST(t, x.v, 'pred'))) }); break; }
      }
    }
    const { arbol: t } = bstAleatorio(rng, 6, true); out.push({ e: `a_nota(eliminar(${K.pyN(t)}, 100))`, r: JSON.stringify(Arb.nota(t)) });
    return out;
  }
  B({
    id: 'n6-completar-eliminar', n: 6, e: 'B', dif: 3, c: ['bs_eliminar'], tema: 'Completar eliminar()',
    gen(rng, K) {
      const H = [['if v < nodo.valor:', 'v < nodo.valor', ['nodo.valor > v']], ['return nodo.der', 'nodo.der', []], ['pred = nodo.izq', 'nodo.izq', []], ['while pred.der is not None:', 'pred.der', []], ['nodo.valor = pred.valor', 'pred.valor', []], ['nodo.izq = eliminar(nodo.izq, pred.valor)', 'pred.valor', []], ['elif v > nodo.valor:', 'v > nodo.valor', ['nodo.valor < v']], ['if nodo.der is None:', 'nodo.der', []]];
      const ids = rng.sample([0, 1, 2, 3, 4, 5, 6, 7], 4).sort((a, b) => a - b);
      const r = K.huecos(SOL_ELIM, ids.map(i => [H[i][0], H[i][1]]), Object.fromEntries(ids.map((hi, ix) => [ix + 1, H[hi][2]])));
      return {
        tipo: 'codigo', modoEj: 'completar', fn: 'eliminar', cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: 'Completa la función `eliminar(nodo, v)` de un BST (convención de clase: con 2 hijos se usa el **predecesor inorden**, el mayor del subárbol izquierdo).', codigoVista: K.CLASE_NODO,
        plantilla: r.plantilla, respuestas: r.respuestas, solucion: SOL_ELIM, tests: testsEliminar(rng, K), anchos: { 1: 14, 2: 10, 3: 10, 4: 12 }, ejemploLlamada: 'a_nota(eliminar(N(10, N(5), N(15)), 10))',
        pistas: ['Los tres casos: sin hijo izquierdo → devolver el derecho; sin hijo derecho → devolver el izquierdo; con dos hijos → sustituir por el predecesor.', 'El predecesor es el mayor del subárbol izquierdo: baja una vez a la izquierda y luego todo lo que puedas a la derecha.', 'Después de copiar el valor del predecesor hay que eliminarlo de su posición original (llamada recursiva sobre `nodo.izq`).'],
        conceptos: ['bs_eliminar', 'bs_minmax'], explicacion: '```\n' + SOL_ELIM + '\n```'
      };
    }
  });

  const DEP6 = [
    { fn: 'insertar', bug: 'Se descarta el resultado de la llamada recursiva: el nodo nuevo nunca se cuelga del árbol (falta `nodo.izq = …` / `nodo.der = …`).', start: `def insertar(nodo, v):\n    if nodo is None:\n        return NodoArbol(v)\n    if v < nodo.valor:\n        insertar(nodo.izq, v)\n    elif v > nodo.valor:\n        insertar(nodo.der, v)\n    return nodo`, sol: `def insertar(nodo, v):\n    if nodo is None:\n        return NodoArbol(v)\n    if v < nodo.valor:\n        nodo.izq = insertar(nodo.izq, v)\n    elif v > nodo.valor:\n        nodo.der = insertar(nodo.der, v)\n    return nodo`, p: ['Inserta un valor en un árbol con un nodo y mira con `a_nota(...)`: ¿aparece el nuevo valor?', 'La llamada recursiva devuelve la raíz del subárbol actualizado, pero aquí se tira ese resultado.', 'Asigna el resultado: `nodo.izq = insertar(nodo.izq, v)`.'] },
    { fn: 'insertar', bug: 'Falta `return nodo` al final: la función devuelve `None` y se pierde el árbol.', start: `def insertar(nodo, v):\n    if nodo is None:\n        return NodoArbol(v)\n    if v < nodo.valor:\n        nodo.izq = insertar(nodo.izq, v)\n    elif v > nodo.valor:\n        nodo.der = insertar(nodo.der, v)`, sol: `def insertar(nodo, v):\n    if nodo is None:\n        return NodoArbol(v)\n    if v < nodo.valor:\n        nodo.izq = insertar(nodo.izq, v)\n    elif v > nodo.valor:\n        nodo.der = insertar(nodo.der, v)\n    return nodo`, p: ['Prueba `a_nota(insertar(N(5), 3))` en la consola.', 'La llamada de más arriba recibe `None` cuando termina el `if`: ¿qué devuelve la función en ese caso?', 'La función debe devolver el nodo (la raíz del subárbol) al final.'] },
    { fn: 'insertar', bug: 'Los valores repetidos se insertan a la derecha: el árbol de clase no admite duplicados.', start: `def insertar(nodo, v):\n    if nodo is None:\n        return NodoArbol(v)\n    if v < nodo.valor:\n        nodo.izq = insertar(nodo.izq, v)\n    else:\n        nodo.der = insertar(nodo.der, v)\n    return nodo`, sol: `def insertar(nodo, v):\n    if nodo is None:\n        return NodoArbol(v)\n    if v < nodo.valor:\n        nodo.izq = insertar(nodo.izq, v)\n    elif v > nodo.valor:\n        nodo.der = insertar(nodo.der, v)\n    return nodo`, p: ['Inserta dos veces el mismo valor: ¿cuántos nodos tiene el árbol?', 'El `else` atrapa también el caso `v == nodo.valor`.', 'Cambia el `else` por `elif v > nodo.valor` para que el caso de igualdad no haga nada.'] },
    { fn: 'buscar', bug: 'Las ramas están invertidas: con `v` menor se baja por la derecha.', start: `def buscar(nodo, v):\n    if nodo is None:\n        return False\n    if v == nodo.valor:\n        return True\n    if v < nodo.valor:\n        return buscar(nodo.der, v)\n    return buscar(nodo.izq, v)`, sol: `def buscar(nodo, v):\n    if nodo is None:\n        return False\n    if v == nodo.valor:\n        return True\n    if v < nodo.valor:\n        return buscar(nodo.izq, v)\n    return buscar(nodo.der, v)`, p: ['Busca un valor menor que la raíz que sí esté en el árbol.', 'Todo lo menor que un nodo está en su subárbol **izquierdo**.', 'Intercambia `nodo.der` y `nodo.izq` en las dos llamadas.'] },
    { fn: 'minimo', bug: 'Baja por la derecha: eso devuelve el máximo, no el mínimo.', start: `def minimo(nodo):\n    while nodo.der is not None:\n        nodo = nodo.der\n    return nodo.valor`, sol: `def minimo(nodo):\n    while nodo.izq is not None:\n        nodo = nodo.izq\n    return nodo.valor`, p: ['Prueba `minimo(N(5, N(3), N(8)))`: ¿qué devuelve?', 'El menor valor de un BST está en el extremo izquierdo.', 'Cambia `der` por `izq` en el ciclo.'] },
    { fn: 'eliminar', bug: 'Con dos hijos copia el predecesor pero no lo elimina de su posición original: el valor queda duplicado.', start: `def eliminar(nodo, v):\n    if nodo is None:\n        return None\n    if v < nodo.valor:\n        nodo.izq = eliminar(nodo.izq, v)\n    elif v > nodo.valor:\n        nodo.der = eliminar(nodo.der, v)\n    else:\n        if nodo.izq is None:\n            return nodo.der\n        if nodo.der is None:\n            return nodo.izq\n        pred = nodo.izq\n        while pred.der is not None:\n            pred = pred.der\n        nodo.valor = pred.valor\n    return nodo`, sol: SOL_ELIM, p: ['Elimina la raíz de un árbol de 3 nodos y mira el resultado con `a_nota`.', 'Se copia `pred.valor` al nodo, pero el nodo `pred` sigue en su lugar.', 'Falta eliminar el sustituto: `nodo.izq = eliminar(nodo.izq, pred.valor)`.'] }
  ];
  B({
    id: 'n6-depurar', n: 6, e: 'B', dif: 4, c: ['bs_errores', 'in_depurar', 'bs_insertar', 'bs_eliminar'], tema: 'Depurar operaciones de BST',
    gen(rng, K) {
      const d = rng.pick(DEP6); let tests;
      if (d.fn === 'insertar') {
        tests = [{ e: 'a_nota(insertar(None, 5))', r: '"5"' }];
        for (let i = 0; i < 3; i++) { const { arbol: t } = bstAleatorio(rng, rng.int(3, 6), rng.chance(0.5)); const vs = Arb.ino(t); let y; do { y = rng.int(1, 99); } while (vs.includes(y)); tests.push({ e: `a_nota(insertar(${K.pyN(t)}, ${y}))`, r: JSON.stringify(Arb.nota(Arb.insBST(t, y))) }); }
        const { arbol: t0 } = bstAleatorio(rng, 5, true); tests.push({ e: `a_nota(insertar(${K.pyN(t0)}, ${Arb.ino(t0)[2]}))`, r: JSON.stringify(Arb.nota(t0)) });
      } else if (d.fn === 'buscar') tests = IMPL6[0].tests(rng, K);
      else if (d.fn === 'minimo') tests = IMPL6[2].tests(rng, K);
      else tests = testsEliminar(rng, K);
      return {
        tipo: 'codigo', modoEj: 'depurar', fn: d.fn, cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: 'Esta operación de BST **no funciona bien**. Encuentra el error y corrígelo.', codigoVista: K.CLASE_NODO, starter: d.start, solucion: d.sol, tests,
        ejemploLlamada: d.fn === 'insertar' ? 'a_nota(insertar(N(5), 3))' : (d.fn === 'eliminar' ? 'a_nota(eliminar(N(5, N(3), N(8)), 5))' : d.fn + '(N(5, N(3), N(8))' + (d.fn === 'minimo' ? ')' : ', 3)')), pistas: d.p, explicacion: '**Error:** ' + d.bug + '\n```\n' + d.sol + '\n```'
      };
    }
  });

  const BIGO6 = [
    { en: 'Buscar un valor en un BST de **n nodos y altura h**.', t: 'h', j: ['Sigue un solo camino raíz–hoja, descartando un subárbol en cada comparación.', 'Recorre todos los nodos, por eso es O(n).', 'Siempre cuesta O(log n) sin importar la forma del árbol.'] },
    { en: 'Insertar un valor en un BST **balanceado** de n nodos.', t: 'logn', j: ['Un solo camino raíz–hoja de altura ≈ log₂ n.', 'Hay que recorrer los n nodos.', 'Es constante porque solo se cuelga una hoja.'] },
    { en: 'Buscar un valor en un BST **degenerado** (en forma de lista) de n nodos.', t: 'n', j: ['La altura es n − 1 y se recorre un nodo por nivel.', 'La altura es log n.', 'Es constante: el árbol ya está ordenado.'] },
    { en: 'Recorrer en **inorden** todos los nodos de un BST de n nodos.', t: 'n', j: ['Cada nodo se visita una sola vez.', 'Solo se recorre un camino: O(h).', 'Es O(n²) porque cada nodo llama a sus dos hijos.'] },
    { en: 'Hallar el **mínimo** de un BST balanceado de n nodos.', t: 'logn', j: ['Baja siempre por la izquierda: la altura es ≈ log₂ n.', 'Hay que compararlo con los n valores.', 'Es el valor de la raíz: O(1).'] },
    { en: 'Eliminar un nodo con **dos hijos** en un BST de altura h (buscar el nodo, el predecesor y eliminar el sustituto).', t: 'h', j: ['Se recorren caminos raíz–hoja un par de veces: O(h).', 'Hay que reconstruir todo el árbol: O(n).', 'Es O(1): solo se copia un valor.'] }
  ];
  B({
    id: 'n6-bigo-ops', n: 6, e: 'B', dif: 3, c: ['bs_altura', 'bs_buscar', 'cx_recursivo'], tema: 'Complejidad de operaciones BST',
    gen(rng, K) {
      const p = rng.pick(BIGO6);
      return {
        tipo: 'bigo', enunciado: '¿Cuál es la complejidad **temporal** (peor caso) de la operación?\n\n> ' + p.en, tiempo: p.t, escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2'],
        justif: { opciones: rng.shuffle([{ t: p.j[0], ok: true }, { t: p.j[1], ok: false, why: 'No es el razonamiento correcto.' }, { t: p.j[2], ok: false, why: 'No es el razonamiento correcto.' }]) },
        pistas: ['La complejidad de un BST es O(h), no O(log n) en general: depende de la forma del árbol.', 'Balanceado: h ≈ log n. Degenerado: h = n − 1. El inorden completo visita todos los nodos.', 'Cuenta cuántos nodos se tocan en el peor caso.'],
        explicacion: p.j[0] + ' (S6-C2, diap. 12-13: tabla de operaciones.)'
      };
    }
  });

  B({
    id: 'n6-abierta-propiedad', n: 6, e: 'B', dif: 3, c: ['bs_prop', 'bs_errores'], tema: 'Propiedad de orden (explicar)',
    gen(rng, K) {
      return {
        tipo: 'abierta', enunciado: '**Enuncia la propiedad de orden de un BST.** ¿Se cumple solo comparando cada nodo con sus hijos inmediatos o con todo el subárbol? Da un ejemplo de un árbol que parezca válido pero no lo sea.',
        criterios: [
          { desc: 'Enuncia la propiedad: **izquierda < nodo < derecha** (valores menores a la izquierda, mayores a la derecha).', claves: [['izquierd', 'menor'], ['derech', 'mayor'], ['izq', '<', 'der']] },
          { desc: 'Aclara que vale para **todo el subárbol** (todos los valores de cada subárbol), no solo los hijos inmediatos.', claves: ['todo el subarbol', 'todos los valores', 'todo subarbol', ['no solo', 'hijos'], ['subarbol', 'completo'], ['cada', 'subarbol']] },
          { desc: 'Menciona que es **recursiva**: cada subárbol también es un BST.', claves: ['recursiv', ['cada subarbol'], ['subarboles', 'tambien'], 'cada nodo'] },
          { desc: 'Da un **ejemplo** o contraejemplo (p. ej. un valor correcto respecto a su padre pero que viola la regla respecto a un ancestro).', claves: ['ejemplo', 'ancestro', 'abuelo', ['padre', 'pero'], /\d+\(\d+\(/] }
        ],
        modelo: 'En un BST, para cada nodo con valor v, **todos** los valores de su subárbol izquierdo son **menores** que v y **todos** los del subárbol derecho son **mayores** que v; la propiedad vale **recursivamente** para cada subárbol. No basta comparar con los hijos inmediatos: por ejemplo en `10(5(3,12),15)` el 12 es mayor que su padre 5 pero está en el subárbol izquierdo de 10 y 12 > 10, así que **no** es un BST (ejemplo con un ancestro).',
        pistas: ['Piensa en cada nodo: ¿qué debe cumplirse sobre todo lo que cuelga a su izquierda y a su derecha?', 'Un error frecuente es verificar solo el padre inmediato. ¿Qué pasa con el abuelo?', 'Para el ejemplo: coloca un valor pequeño del lado derecho de un abuelo, pero mayor que su padre.'],
        explicacion: 'S6-C2, diap. 5 y 16 (verificación formativa 1).'
      };
    }
  });

  B({
    id: 'n6-abierta-inorden', n: 6, e: 'B', dif: 3, c: ['bs_inorden', 'tv_in'], tema: '¿Por qué el inorden ordena?',
    gen(rng, K) {
      return {
        tipo: 'abierta', enunciado: '**¿Por qué el recorrido inorden de un BST entrega los valores ordenados?** Explícalo con la propiedad del BST.',
        criterios: [
          { desc: 'Indica que el inorden visita primero el **subárbol izquierdo** (valores menores), luego el **nodo** y luego el **derecho** (mayores).', claves: [['izquierd', 'nodo', 'derech'], ['primero', 'menor'], ['izq', 'raiz', 'der']] },
          { desc: 'Relaciona con la propiedad: todo lo de la izquierda es **menor** que el nodo y todo lo de la derecha **mayor**.', claves: [['menor', 'mayor'], ['menores', 'mayores'], ['izquierda', 'menor']] },
          { desc: 'Señala que esto ocurre **recursivamente** en cada nodo/subárbol (por inducción), por lo que toda la secuencia queda ordenada.', claves: ['recursiv', 'cada nodo', 'cada subarbol', 'induccion', 'en cada'] }
        ],
        modelo: 'En cada nodo, el inorden visita **primero todo el subárbol izquierdo** (todos los valores **menores** que el nodo), **luego el nodo** y **luego todo el subárbol derecho** (todos los **mayores**). Como esto ocurre **recursivamente en cada nodo**, la secuencia completa sale en orden ascendente: un BST es, en esencia, un arreglo ordenado que permite inserción eficiente.',
        pistas: ['Escribe qué visita el inorden en un nodo cualquiera y compáralo con la propiedad del BST.', 'La propiedad dice qué hay a la izquierda y qué a la derecha de cada nodo.', 'Recuerda que ambas cosas se repiten en todos los subárboles.'],
        explicacion: 'S6-C2, diap. 7.'
      };
    }
  });

  /* ============ C ============ */
  const SOL_ESBST = `def es_bst(nodo, minimo=None, maximo=None):\n    if nodo is None:\n        return True\n    if minimo is not None and nodo.valor <= minimo:\n        return False\n    if maximo is not None and nodo.valor >= maximo:\n        return False\n    return es_bst(nodo.izq, minimo, nodo.valor) and es_bst(nodo.der, nodo.valor, maximo)`;
  B({
    id: 'n6-es-bst-codigo', n: 6, e: 'C', dif: 5, c: ['bs_prop', 'bs_errores', 'in_depurar'], tema: 'Verificar la propiedad de BST',
    gen(rng, K) {
      const tests = [{ e: 'es_bst(None)', r: 'True' }, { e: 'es_bst(N(5))', r: 'True' }];
      for (let i = 0; i < 3; i++) { const { arbol: t } = bstAleatorio(rng, rng.int(5, 8), rng.chance(0.5)); tests.push({ e: `es_bst(${K.pyN(t)})`, r: 'True' }); const c1 = corromper(rng, t, true) || corromper(rng, t, false); if (c1) tests.push({ e: `es_bst(${K.pyN(c1)})`, r: 'False' }); const c2 = corromper(rng, t, false); if (c2) tests.push({ e: `es_bst(${K.pyN(c2)})`, r: 'False' }); }
      tests.push({ e: 'es_bst(N(10, N(5, N(3), N(12)), N(15)))', r: 'False' }, { e: 'es_bst(N(10, N(5, N(3), N(7)), N(15, N(12), N(20))))', r: 'True' });
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: 'es_bst', cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: 'Escribe `es_bst(nodo)` que devuelva `True` si el árbol que cuelga de `nodo` cumple la propiedad de **BST** (todos los valores del subárbol izquierdo < nodo < todos los del derecho) y `False` en caso contrario. El árbol vacío cumple la propiedad.\n\n**Cuidado:** no basta comparar cada nodo con sus hijos inmediatos. (Pista de diseño: pasa por parámetro el rango permitido, o usa el inorden.) Puedes añadir parámetros con valor por defecto.', codigoVista: K.CLASE_NODO,
        starter: 'def es_bst(nodo):\n    # tu código aquí\n    pass', solucion: SOL_ESBST, tests, reglas: [], ejemploLlamada: 'es_bst(N(10, N(5), N(15)))',
        pistas: ['Una solución ingenua compara cada nodo con sus hijos; falla cuando un valor viola la regla respecto a un ancestro lejano.', 'Cada nodo debe estar dentro de un rango (mínimo, máximo) determinado por sus ancestros: al bajar a la izquierda el máximo pasa a ser el valor del nodo; al bajar a la derecha, el mínimo.', 'Otra idea: el inorden de un BST es estrictamente creciente; recorre en inorden y comprueba que cada valor sea mayor que el anterior.'],
        explicacion: 'Error frecuente (S6-C2, diap. 16): verificar solo hijos inmediatos.\n```\n' + SOL_ESBST + '\n```'
      };
    }
  });

  const SOL_IMPL_ELIM = SOL_ELIM;
  B({
    id: 'n6-impl-eliminar', n: 6, e: 'C', dif: 5, c: ['bs_eliminar', 'bs_minmax'], tema: 'Implementar eliminar() completo',
    gen(rng, K) {
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: 'eliminar', cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: 'Escribe `eliminar(nodo, v)` que elimine `v` del BST y **devuelva la raíz** del árbol resultante. Distingue los **tres casos** (0, 1 y 2 hijos); con 2 hijos usa el **predecesor inorden** (el mayor del subárbol izquierdo). Si `v` no está, el árbol no cambia.', codigoVista: K.CLASE_NODO,
        starter: 'def eliminar(nodo, v):\n    # tu código aquí\n    pass', solucion: SOL_IMPL_ELIM, tests: testsEliminar(rng, K), reglas: [{ t: 'recursiva', fn: 'eliminar' }], ejemploLlamada: 'a_nota(eliminar(N(10, N(5), N(15)), 10))',
        pistas: ['Primero localiza el nodo como en la búsqueda: menor → izquierda, mayor → derecha, y reasigna `nodo.izq = eliminar(...)` / `nodo.der = eliminar(...)`.', 'Al encontrarlo: sin hijo izquierdo → devuelve el derecho; sin hijo derecho → devuelve el izquierdo.', 'Con dos hijos: halla el predecesor (baja a la izquierda y luego todo a la derecha), copia su valor al nodo y elimina el predecesor del subárbol izquierdo.'],
        explicacion: '```\n' + SOL_IMPL_ELIM + '\n```\nCosto O(h).'
      };
    }
  });

  const TR6 = [
    ['El inorden de cualquier árbol binario (aunque no sea BST) entrega los valores ordenados.', false, 'Solo en un BST el inorden está ordenado.'],
    ['En un BST con n nodos la altura siempre es ≈ log₂ n.', false, 'Depende del orden de inserción: puede llegar a n − 1.'],
    ['Un BST de 7 nodos puede tener altura 6.', true, 'Si los valores se insertan en orden creciente o decreciente se forma una lista.'],
    ['Permitir duplicados sin una política clara rompe la unicidad de la búsqueda.', true, 'Por eso la convención de clase es no insertarlos.'],
    ['Al eliminar un nodo con 2 hijos se reemplaza su valor por el predecesor o el sucesor inorden.', true, 'Ambos mantienen la propiedad de orden.'],
    ['El predecesor inorden de un nodo con dos hijos es el menor valor de su subárbol derecho.', false, 'Ese es el sucesor; el predecesor es el mayor del subárbol izquierdo.'],
    ['Buscar en un BST cuesta O(h), por lo que en un árbol degenerado cuesta O(n).', true, 'La altura de un árbol degenerado es n − 1.'],
    ['Si se inserta [3, 2, 4, 1, 5] se obtiene un árbol de altura 2.', true, 'Queda 3(2(1,),4(,5)): altura 2.'],
    ['Un BST permite búsqueda en O(1), igual que una tabla hash.', false, 'El BST es O(h) (log n si balanceado).'],
    ['Eliminar la raíz de un BST de 3 nodos siempre deja un árbol de 2 nodos con la propiedad de BST.', true, 'Se sustituye por predecesor/sucesor o su único hijo: se mantiene el orden.']
  ];
  B({
    id: 'n6-trampas', n: 6, e: 'C', dif: 4, c: ['bs_errores', 'bs_altura', 'bs_eliminar', 'bs_ordenins'], tema: 'Trampas conceptuales',
    gen(rng, K) {
      const v = rng.sample(TR6.filter(x => x[1]), 2), f = rng.sample(TR6.filter(x => !x[1]), 2), ex = rng.sample(TR6.filter(x => !v.includes(x) && !f.includes(x)), 1);
      const sel = rng.shuffle(v.concat(f).concat(ex));
      return {
        tipo: 'opcion', multi: true, enunciado: '¿Cuáles de las siguientes afirmaciones sobre BST son **verdaderas**? (Marca todas.)', opciones: sel.map(s => ({ t: s[0], ok: s[1], why: s[2] })),
        pistas: ['Revisa cada una con un ejemplo pequeño (3 a 5 nodos).', 'Recuerda: la complejidad es O(h); la altura depende del orden de inserción.', 'Predecesor = mayor del subárbol izquierdo; sucesor = menor del subárbol derecho.'],
        explicacion: 'Errores frecuentes de clase (S6-C2, diap. 16): confundir O(h) con O(log n), predecesor con hijo izquierdo, y olvidar que el orden de inserción importa.'
      };
    }
  });

  B({
    id: 'n6-hash-vs-bst', n: 6, e: 'C', dif: 3, c: ['bs_hash', 'in_justificar'], tema: 'BST vs. tabla hash',
    gen(rng, K) {
      return {
        tipo: 'abierta', fmt: 'Pregunta de razonamiento', enunciado: 'Para el **vocabulario de un modelo de IA** se plantean dos opciones: un **BST balanceado** y una **tabla hash**. (1) ¿Cuál da búsqueda más rápida en promedio? (2) ¿Cuál permite listar las palabras en orden alfabético sin costo extra? (3) Si necesitas ambas cosas, ¿qué eliges y qué sacrificas?',
        criterios: [
          { desc: 'Indica que la **tabla hash** busca más rápido en promedio (≈ O(1)) frente a O(log n) del BST.', claves: [['hash', 'rapid'], ['hash', 'o(1)'], ['hash', 'constante'], ['tabla hash', 'promedio']] },
          { desc: 'Indica que el **BST** lista en orden sin costo extra (recorrido inorden).', claves: [['bst', 'orden'], ['arbol', 'inorden'], ['inorden'], ['arbol', 'ordenad']] },
          { desc: 'Elige el **BST balanceado** si se necesitan ambas cosas, sacrificando algo de velocidad de búsqueda (O(log n) vs O(1)).', claves: [['bst', 'sacrific'], ['arbol', 'sacrific'], ['bst', 'ambas'], ['bst balanceado', 'log n'], ['bst', 'o(log n)'], ['elegiria', 'arbol'], ['elegiria', 'bst']] }
        ],
        modelo: 'La **tabla hash** da la búsqueda más rápida en promedio (≈ **O(1)**) pero **no mantiene el orden**. El **BST balanceado** busca en **O(log n)** y permite **listar en orden alfabético sin costo extra** con el recorrido **inorden**. Si necesito ambas cosas elijo el **BST balanceado** y **sacrifico** algo de velocidad de búsqueda (O(log n) en vez de O(1)). Si solo importa saber si una palabra existe, la hash suele ser mejor.',
        pistas: ['Piensa en el costo de buscar y en si la estructura conserva el orden de las claves.', 'Recuerda qué entrega el recorrido inorden de un BST.', 'En la decisión final nombra lo que ganas y lo que pierdes.'],
        explicacion: 'S6-C2, diap. 13-14 y verificación formativa 5.'
      };
    }
  });

  B({
    id: 'n6-misma-forma', n: 6, e: 'C', dif: 4, c: ['bs_ordenins', 'bs_insertar'], tema: 'Orden de inserción y forma',
    gen(rng, K) {
      const n = rng.int(5, 6); const vals = rng.distinct(n, 5, 60); const t = Arb.insertarSecuencia(vals);
      const buenas = [Arb.pre(t)];
      const perm = () => rng.shuffle(vals);
      for (let i = 0; i < 400 && buenas.length < 3; i++) { const p = perm(); if (Arb.igual(Arb.insertarSecuencia(p), t) && !buenas.some(b => b.join() === p.join())) buenas.push(p); }
      const malas = []; for (let i = 0; i < 400 && malas.length < 2; i++) { const p = perm(); if (!Arb.igual(Arb.insertarSecuencia(p), t) && !malas.some(b => b.join() === p.join())) malas.push(p); }
      const ng = rng.int(1, Math.min(2, buenas.length)); const sel = rng.shuffle(buenas).slice(0, ng).concat(malas.slice(0, 4 - ng));
      return {
        tipo: 'opcion', multi: true, enunciado: 'Este BST se construyó insertando valores uno a uno en un árbol vacío. ¿**Cuáles** de las siguientes secuencias de inserción producen **exactamente este mismo árbol**? (Marca todas.)', arbol: t,
        opciones: rng.shuffle(sel.map(s => { const ok = Arb.igual(Arb.insertarSecuencia(s), t); return { t: '`' + K.coma(s) + '`', ok, why: ok ? 'Cada padre se inserta antes que sus hijos, así que se obtiene la misma forma.' : 'Produce otro árbol: ' + Arb.nota(Arb.insertarSecuencia(s)) + '.' }; })),
        pistas: ['Un valor solo puede colgarse de su padre si el padre ya está en el árbol: en la secuencia, cada padre debe aparecer **antes** que sus hijos.', 'La raíz tiene que ser el primer valor insertado.', 'Una secuencia siempre válida es el preorden del árbol; prueba las demás insertando paso a paso.'],
        explicacion: 'Hay muchas secuencias válidas: cualquier orden donde cada nodo aparezca después de su padre (por ejemplo el preorden: ' + K.coma(Arb.pre(t)) + ').'
      };
    }
  });

  B({
    id: 'n6-mixta', n: 6, e: 'C', dif: 4, c: ['bs_insertar', 'bs_eliminar', 'bs_altura', 'bs_inorden'], tema: 'Ranking dinámico (actividad de clase)',
    gen(rng, K) {
      const n = 7; const vals = rng.distinct(n, 10, 90); const balanceado = rng.chance(0.5);
      const orden = balanceado ? Arb.bstAleatorio(rng, n, 10, 90, true).secuencia : vals; const t = Arb.insertarSecuencia(orden);
      const x = rng.pick(Arb.nodos(t).filter(nd => nd.l && nd.r)) || t; const dsp = Arb.delBST(t, x.v, 'pred');
      return {
        tipo: 'mixta', enunciado: 'Se mantiene un **ranking de puntajes** en un BST. Los puntajes llegan en este orden: **' + K.coma(orden) + '**.',
        partes: [
          { titulo: 'Árbol', peso: 2, q: { tipo: 'arbol', enunciado: 'Escribe el BST resultante.', esperado: t, verificar: { bst: true } } },
          { titulo: 'Inorden', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Escribe su recorrido inorden (¿está ordenado?).', esperado: J(Arb.ino(t)) } },
          { titulo: 'Eliminar', peso: 2, q: { tipo: 'arbol', enunciado: 'Elimina el puntaje **' + x.v + '** (usa el predecesor inorden si tiene 2 hijos; también se acepta el sucesor). Escribe el árbol resultante.', esperado: dsp, aceptados: [Arb.delBST(t, x.v, 'suc')], verificar: { bst: true } } },
          { titulo: 'Altura', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Qué altura tendría el árbol si los puntajes llegaran **ya ordenados** de menor a mayor? (n = ' + n + ')', esperado: String(n - 1) } }
        ],
        pistas: ['Inserta uno por uno comparando con la raíz y bajando hasta un lugar vacío.', 'El inorden de un BST siempre está ordenado: úsalo para verificar tu árbol.', 'Eliminación con 2 hijos: sube el mayor del subárbol izquierdo (o el menor del derecho) y elimina ese sustituto.'],
        explicacion: 'Árbol: ' + Arb.nota(t) + ' · tras eliminar ' + x.v + ': ' + Arb.nota(dsp) + ' · ordenados degeneran: altura ' + (n - 1) + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
