/* banco_n7.js — Nivel 7: Árboles AVL y balanceo (S7-C1, diap. 1-20) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py, Arb = ET.Arb;
  const J = a => a.map(String).join(' ');
  const CID = { LL: 'av_ll', RR: 'av_rr', LR: 'av_lr', RL: 'av_rl' };
  const NR = c => (c === 'LL' || c === 'RR') ? 1 : 2;
  const fsig = f => (f > 0 ? '+' + f : String(f));

  /* ---------- Python de apoyo ---------- */
  const PY_HELP = U.dedent(`
    def altura(n):
        return -1 if n is None else n.h
    def actualizar(n):
        n.h = 1 + max(altura(n.izq), altura(n.der))
    def factor(n):
        return 0 if n is None else altura(n.izq) - altura(n.der)
  `);
  const PY_ROT = U.dedent(`
    def rot_der(y):
        x = y.izq
        y.izq = x.der
        x.der = y
        actualizar(y)
        actualizar(x)
        return x
    def rot_izq(x):
        y = x.der
        x.der = y.izq
        y.izq = x
        actualizar(x)
        actualizar(y)
        return y
  `);
  const SOL_ROT_DER = PY_ROT.split('def rot_izq')[0].trim();
  const SOL_ROT_IZQ = 'def rot_izq' + PY_ROT.split('def rot_izq')[1];
  const CLASE_AVL = U.dedent(`
    class NodoAVL:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None
            self.h = 0        # altura (hoja = 0, vacío = -1)
  `);
  const SOL_INS = U.dedent(`
    def insertar(nodo, v):
        if nodo is None:
            return NodoAVL(v)
        if v < nodo.valor:
            nodo.izq = insertar(nodo.izq, v)
        elif v > nodo.valor:
            nodo.der = insertar(nodo.der, v)
        else:
            return nodo
        actualizar(nodo)
        f = factor(nodo)
        if f > 1 and v < nodo.izq.valor:
            return rot_der(nodo)
        if f < -1 and v > nodo.der.valor:
            return rot_izq(nodo)
        if f > 1 and v > nodo.izq.valor:
            nodo.izq = rot_izq(nodo.izq)
            return rot_der(nodo)
        if f < -1 and v < nodo.der.valor:
            nodo.der = rot_der(nodo.der)
            return rot_izq(nodo)
        return nodo
  `);
  const PRE_CONSTRUIR = U.dedent(`
    def construir(vals):
        r = None
        for v in vals:
            r = insertar(r, v)
        return r
  `);

  /* ---------- utilidades de generación ---------- */
  const bstAle = (rng, n, bal) => Arb.bstAleatorio(rng, n, 5, 95, bal);
  function violacion(t) {
    let res = null;
    (function rec(n, lo, hi) {
      if (!n || res) return;
      if (lo && !Arb.lt(lo.v, n.v)) { res = { n: n.v, a: lo.v, lado: 'der' }; return; }
      if (hi && !Arb.lt(n.v, hi.v)) { res = { n: n.v, a: hi.v, lado: 'izq' }; return; }
      rec(n.l, lo, n); rec(n.r, n, hi);
    })(t, null, null); return res;
  }
  function conValor(t, v, nv) { return t ? (String(t.v) === String(v) ? { v: nv, l: t.l, r: t.r } : { v: t.v, l: conValor(t.l, v, nv), r: conValor(t.r, v, nv) }) : null; }
  function corromper(rng, t) {
    const vals = Arb.pre(t).map(String);
    for (let i = 0; i < 200; i++) { const v = rng.pick(vals); const nv = rng.int(2, 98); if (vals.includes(String(nv))) continue; const c = conValor(t, v, nv); if (!Arb.esBST(c)) return c; }
    return null;
  }
  /** pasos de rebalanceo como texto */
  function resumenPasos(h) {
    return h.pasos.map(p => 'rotación ' + p.rot + ' en ' + p.sobre).join(' + ');
  }
  function arbolNuevoClases(v) { const c = {}; c[String(v)] = 'nuevo'; return c; }

  /* ============ A ============ */
  B({
    id: 'n7-altura-vacio', n: 7, e: 'A', dif: 1, c: ['av_factor', 'av_altura'], tema: 'Convenciones de altura y factor',
    gen(rng, K) {
      const o = rng.int(0, 5); let q, esp, ex;
      if (o === 0) { q = 'En el curso, ¿cuál es la **altura de un árbol vacío** (`None`)?'; esp = '-1'; ex = 'Árbol vacío = −1, hoja = 0 (así altura(n) = 1 + máx(alt(izq), alt(der)) sirve para hojas).'; }
      else if (o === 1) { q = '¿Cuál es la **altura de un nodo hoja**?'; esp = '0'; ex = 'La hoja no tiene hijos: 1 + máx(−1, −1) = 0.'; }
      else if (o === 2) { q = 'Un nodo es una **hoja**. ¿Cuál es su **factor de balance**?'; esp = '0'; ex = 'altura(izq) − altura(der) = −1 − (−1) = 0.'; }
      else if (o === 3) { q = 'Un nodo tiene **solo un hijo izquierdo que es hoja**. ¿Cuál es su factor de balance (altura(izq) − altura(der))?'; esp = '1'; ex = '0 − (−1) = +1.'; }
      else if (o === 4) { q = 'Un nodo tiene **solo un hijo derecho que es hoja**. ¿Cuál es su factor de balance?'; esp = '-1'; ex = '−1 − 0 = −1.'; }
      else { const h = rng.int(2, 5); q = 'La altura del subárbol izquierdo de un nodo es **' + h + '** y la del derecho es **' + (h - 2) + '**. ¿Qué factor de balance tiene? ¿Cuál es el valor?'; esp = '2'; ex = h + ' − ' + (h - 2) + ' = +2: el nodo está desbalanceado (|f| ≥ 2) y requiere rotación.'; }
      return {
        tipo: 'salida', numerico: true, enunciado: q, esperado: esp, placeholder: 'Un número entero',
        pistas: ['Convención del curso: árbol vacío = −1 y hoja = 0 (se cuentan aristas).', 'factor(n) = altura(n.izq) − altura(n.der).', 'Recuerda que un hijo ausente cuenta como −1.'], explicacion: ex
      };
    }
  });

  B({
    id: 'n7-factor-tabla', n: 7, e: 'A', dif: 2, c: ['av_factor', 'av_altura'], tema: 'Alturas y factores',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = bstAle(rng, n, rng.chance(0.4)).arbol;
      const vs = Arb.ino(t);
      const filas = vs.map(v => { const nd = Arb.hallar(t, v); const f = Arb.factor(nd); return [{ t: '`' + v + '`' }, { in: String(Arb.altura(nd)), w: 4 }, { in: f > 0 ? [String(f), '+' + f] : String(f), w: 4 }]; });
      return {
        tipo: 'tabla', enunciado: 'Para cada nodo del árbol calcula su **altura** (hoja = 0, árbol vacío = −1) y su **factor de balance** = altura(izq) − altura(der).', arbol: t, cols: ['Nodo', 'Altura', 'Factor'], filas,
        pistas: ['Empieza por las hojas (altura 0) y sube: altura(n) = 1 + máx(altura(izq), altura(der)).', 'Un hijo que no existe cuenta como altura −1.', 'Factor = altura del subárbol izquierdo − altura del derecho. Puede ser negativo.'],
        explicacion: 'Alturas y factores: ' + vs.map(v => v + ': h=' + Arb.altura(Arb.hallar(t, v)) + ', f=' + fsig(Arb.factor(Arb.hallar(t, v)))).join(' · ') + '. ' + (Arb.desbalanceados(t).length ? 'Hay nodos con |f| ≥ 2: no es AVL.' : 'Todos |f| ≤ 1: es AVL.')
      };
    }
  });

  B({
    id: 'n7-es-avl', n: 7, e: 'A', dif: 3, c: ['av_factor', 'bs_prop'], tema: '¿Es AVL?',
    gen(rng, K) {
      const arboles = [], items = []; const tipos = rng.shuffle(['avl', 'avl', 'bstno', 'bstno', 'nobst']).slice(0, 4);
      tipos.forEach((tp, i) => {
        let t, cat, why;
        if (tp === 'avl') { t = Arb.construirAVL(rng.distinct(rng.int(5, 7), 5, 90)).arbol; cat = 0; why = 'Es BST y todos los nodos cumplen |factor| ≤ 1.'; }
        else if (tp === 'bstno') {
          for (let k = 0; k < 50; k++) { t = Arb.insertarSecuencia(rng.distinct(rng.int(5, 7), 5, 90)); if (Arb.desbalanceados(t).length) break; }
          const bad = Arb.desbalanceados(t); cat = bad.length ? 1 : 0; why = bad.length ? 'Cumple la propiedad de BST, pero el nodo **' + bad[0].v + '** tiene factor ' + fsig(Arb.factor(bad[0])) + ' (|f| ≥ 2).' : 'Todos |factor| ≤ 1.';
        } else {
          const base = Arb.construirAVL(rng.distinct(6, 5, 90)).arbol; const c = corromper(rng, base);
          t = c || base; const vio = violacion(t); cat = vio ? 2 : 0; why = vio ? 'No es un BST: ' + vio.n + ' está en el subárbol ' + (vio.lado === 'der' ? 'derecho' : 'izquierdo') + ' de ' + vio.a + ' pero ' + (vio.lado === 'der' ? vio.n + ' < ' + vio.a : vio.n + ' > ' + vio.a) + '.' : 'Es AVL.';
        }
        arboles.push({ titulo: 'Árbol ' + (i + 1), arbol: t, opts: {} });
        items.push({ t: 'Árbol ' + (i + 1) + ' (`' + Arb.nota(t) + '`)', cat, why });
      });
      return {
        tipo: 'clasificar', enunciado: 'Clasifica cada árbol: ¿es **AVL**, es un **BST pero no AVL** (algún nodo con |factor| ≥ 2), o **no es siquiera un BST**?', arboles, categorias: ['Es AVL', 'BST pero no AVL', 'No es un BST'], items,
        pistas: ['Primero comprueba la propiedad de BST (izq < nodo < der en todo el subárbol).', 'Luego calcula la altura de cada nodo desde las hojas y su factor: ¿alguno llega a ±2?', 'Un AVL debe ser BST **y** estar balanceado en todos los nodos.'],
        explicacion: 'AVL = BST + |altura(izq) − altura(der)| ≤ 1 en todo nodo.'
      };
    }
  });

  const VF7 = [
    { a: 'Una rotación conserva el recorrido inorden del árbol (la propiedad de BST se mantiene).', v: true, e: 'Una rotación solo reengancha punteros sin alterar el orden relativo de los valores.', j: ['Antes y después de rotar el inorden es el mismo (por ejemplo A < r < B < p < C).', 'La rotación ordena los valores de nuevo.', 'Después de rotar hay que reordenar el árbol con un recorrido.'] },
    { a: 'Una rotación simple cuesta O(n).', v: false, e: 'Una rotación toca solo unos pocos punteros: O(1).', j: ['Solo se reenganchan unos pocos punteros y se recalculan dos alturas.', 'Hay que recorrer todo el subárbol.', 'Hay que copiar todos los valores.'] },
    { a: 'Una inserción en un AVL puede disparar varias rotaciones en cadena subiendo hacia la raíz.', v: false, e: 'Cada inserción dispara **a lo sumo una** rotación (simple o doble).', j: ['Tras corregir el primer nodo desbalanceado, el subárbol recupera su altura anterior y los ancestros quedan balanceados.', 'Cada ancestro debe rotar.', 'Depende del lenguaje de programación.'] },
    { a: 'Una **eliminación** en un AVL puede requerir varias rotaciones subiendo por el camino.', v: true, e: 'A diferencia de la inserción, un borrado puede requerir hasta O(log n) rotaciones.', j: ['La rotación puede reducir la altura del subárbol y propagar el desbalance a los ancestros.', 'La eliminación nunca desbalancea.', 'Siempre necesita exactamente una rotación.'] },
    { a: 'En el curso, la altura del árbol vacío se define como 0.', v: false, e: 'El árbol vacío tiene altura −1 y una hoja 0.', j: ['Con vacío = −1 y hoja = 0, la fórmula 1 + máx(...) funciona para todos los nodos.', 'Porque no tiene nodos y 0 nodos = altura 0.', 'La altura del vacío no se define.'] },
    { a: 'En un AVL de n nodos, buscar un valor cuesta O(log n) en el peor caso.', v: true, e: 'La altura de un AVL es O(log n).', j: ['El balance garantiza que la altura sea O(log n) y la búsqueda sigue un solo camino.', 'Un AVL se puede degenerar en una lista.', 'Cuesta O(n) porque se recorren todos los nodos.'] },
    { a: 'Un BST degenerado de 5 nodos (en forma de lista) es un árbol AVL válido.', v: false, e: 'En una lista de 5 nodos hay nodos con factor ±2 o más.', j: ['El primer nodo tiene una rama de altura 3 o más frente a una vacía: |factor| ≥ 2.', 'Todo BST es AVL.', 'Solo los árboles perfectos son AVL.'] },
    { a: 'La **rotación derecha** sube el hijo izquierdo y baja la raíz hacia la derecha.', v: true, e: 'x = y.izq sube; y pasa a ser el hijo derecho de x.', j: ['El hijo izquierdo se convierte en la nueva raíz local y la raíz queda como su hijo derecho.', 'Sube el hijo derecho.', 'Es una rotación que no modifica ningún puntero.'] },
    { a: 'Tras una rotación, hay que recalcular primero la altura del nodo que **subió** y luego la del que bajó.', v: false, e: 'Primero el que **bajó** (porque ahora es hijo del otro) y luego el que subió.', j: ['La altura del que subió depende de la del que bajó, así que esta debe estar actualizada antes.', 'El orden da igual: las alturas son independientes.', 'No hace falta recalcular alturas tras rotar.'] },
    { a: 'AVL son las iniciales de sus creadores, Adelson-Velskii y Landis (1962).', v: true, e: 'Fue el primer árbol binario de búsqueda auto-balanceable de la historia.', j: ['Es el primer BST auto-balanceable, propuesto por esos dos matemáticos.', 'Significa «Árbol Verticalmente Ligado».', 'Significa «Árbol de Valores Lineales».'] }
  ];
  B({
    id: 'n7-vf', n: 7, e: 'A', dif: 2, c: ['av_rotsimple', 'av_insertar', 'av_eliminar', 'av_complejidad', 'av_altura', 'av_prob'], tema: 'AVL (V/F)',
    gen(rng, K) {
      const it = rng.pick(VF7);
      return {
        tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón correcta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Recuerda: una rotación es local, O(1), y conserva el inorden.', 'Inserción: a lo sumo una rotación (simple o doble). Eliminación: puede requerir varias.', 'Convención: vacío = −1, hoja = 0, factor = alt(izq) − alt(der).']
      };
    }
  });

  B({
    id: 'n7-caso-3', n: 7, e: 'A', dif: 2, c: ['av_ll', 'av_rr', 'av_lr', 'av_rl', 'av_rotsimple'], tema: 'Rotar con tres nodos',
    gen(rng, K, opts) {
      const caso = (opts && opts.caso) || rng.pick(['LL', 'RR', 'LR', 'RL']);
      const seq = Arb.secuenciaCaso(caso, rng); const t = Arb.insertarSecuencia(seq); const r = Arb.insAVL(Arb.insertarSecuencia(seq.slice(0, 2)), seq[2]);
      const u = Arb.hallar(t, r.primerDesbalanceado); const raiz = caso === 'LL' ? u.l.v : caso === 'RR' ? u.r.v : caso === 'LR' ? u.l.r.v : u.r.l.v;
      return {
        tipo: 'avl', pide: ['caso', 'arbol'], enunciado: 'Se insertaron en un árbol AVL vacío los valores **' + seq.join(', ') + '** (en ese orden). Este es el árbol justo después de insertar el último, **antes de rebalancear** (a la derecha de cada nodo se muestra su factor).', arbol: t, arbolOpts: { etiquetas: 'factor', clases: arbolNuevoClases(seq[2]) },
        esperado: { nodo: r.primerDesbalanceado, caso, nrot: NR(caso), raiz, arbol: r.arbol, alt: Arb.altura(r.arbol) }, conceptos: [CID[caso], 'av_rotsimple'],
        pistas: ['Fíjate en el nodo con factor ±2 (en rojo). ¿El nodo nuevo está en línea recta con ese nodo y su hijo, o en zigzag?', 'Línea recta (LL o RR) → una rotación simple. Zigzag (LR o RL) → doble rotación.', 'En los tres casos el árbol final queda con el valor del medio en la raíz: ' + Arb.nota(r.arbol).replace(/\(.*$/, '') + '… ¿cuál es el hijo izquierdo y cuál el derecho?'],
        explicacion: 'Caso **' + caso + ' (' + Arb.NOMBRE_CASO[caso] + ')**: ' + Arb.ROT_CASO[caso] + '. Resultado: **' + Arb.nota(r.arbol) + '**.'
      };
    }
  });

  B({
    id: 'n7-rot-pasos', n: 7, e: 'A', dif: 2, c: ['av_rotsimple'], tema: 'Algoritmo de rotación',
    gen(rng, K) {
      const der = rng.chance(0.5);
      const items = der
        ? ['Sea `x` el hijo izquierdo de `y`', 'El hijo derecho de `x` pasa a ser el hijo izquierdo de `y`', '`y` pasa a ser el hijo derecho de `x`', 'Recalcular la altura de `y` y luego la de `x`', 'Devolver `x` como nueva raíz local']
        : ['Sea `y` el hijo derecho de `x`', 'El hijo izquierdo de `y` pasa a ser el hijo derecho de `x`', '`x` pasa a ser el hijo izquierdo de `y`', 'Recalcular la altura de `x` y luego la de `y`', 'Devolver `y` como nueva raíz local'];
      const idx = items.map((_, i) => i); let ini = rng.shuffle(idx); if (ini.every((x, i) => x === i)) ini = idx.slice().reverse();
      return {
        tipo: 'orden', enunciado: 'Ordena los pasos del algoritmo de la **rotación ' + (der ? 'derecha del nodo `y` (corrige Izq-Izq)' : 'izquierda del nodo `x` (corrige Der-Der)') + '**.', items, correcto: idx, inicial: ini,
        pistas: ['Primero identifica el nodo que va a subir; luego mueve el subárbol del medio; después reengancha el nodo que baja.', 'Las alturas se recalculan **después** de reenganchar los punteros: primero el que bajó, luego el que subió.', 'Lo último es devolver la nueva raíz local (el nodo que subió).'],
        explicacion: 'Orden: ' + items.map((s, i) => (i + 1) + '. ' + s).join(' → ')
      };
    }
  });

  const CASOS_T = [
    ['El nodo nuevo cayó en el subárbol **izquierdo del hijo izquierdo**', 0], ['Factor +2 en el nodo y factor +1 (o 0) en su hijo izquierdo', 0], ['Se corrige con **una sola rotación derecha**', 0],
    ['El nodo nuevo cayó en el subárbol **derecho del hijo derecho**', 1], ['Factor −2 en el nodo y factor −1 en su hijo derecho', 1], ['Se corrige con **una sola rotación izquierda**', 1],
    ['El nodo nuevo cayó en el subárbol **derecho del hijo izquierdo**', 2], ['Factor +2 en el nodo y factor −1 en su hijo izquierdo', 2], ['Se corrige con rotación **izquierda del hijo** y luego **derecha del nodo**', 2],
    ['El nodo nuevo cayó en el subárbol **izquierdo del hijo derecho**', 3], ['Factor −2 en el nodo y factor +1 en su hijo derecho', 3], ['Se corrige con rotación **derecha del hijo** y luego **izquierda del nodo**', 3]
  ];
  B({
    id: 'n7-casos-teoria', n: 7, e: 'A', dif: 3, c: ['av_ll', 'av_rr', 'av_lr', 'av_rl', 'av_primer'], tema: 'Los cuatro casos',
    gen(rng, K) {
      const cats = [0, 1, 2, 3]; const pick = []; rng.shuffle(cats).slice(0, 3).forEach(c => pick.push(rng.pick(CASOS_T.filter(x => x[1] === c))));
      while (pick.length < 6) { const x = rng.pick(CASOS_T); if (!pick.includes(x)) pick.push(x); }
      const why = ['Línea recta a la izquierda → rotación derecha (Izq-Izq).', 'Línea recta a la derecha → rotación izquierda (Der-Der).', 'Zigzag Izq-Der → doble rotación (izq. del hijo, luego der.).', 'Zigzag Der-Izq → doble rotación (der. del hijo, luego izq.).'];
      return {
        tipo: 'clasificar', enunciado: 'Asocia cada descripción con el **caso de desbalance** del AVL al que corresponde.', categorias: ['Izq-Izq (LL)', 'Der-Der (RR)', 'Izq-Der (LR)', 'Der-Izq (RL)'], items: rng.shuffle(pick).map(x => ({ t: x[0], cat: x[1], why: why[x[1]] })),
        conceptos: Array.from(new Set(pick.map(x => ['av_ll', 'av_rr', 'av_lr', 'av_rl'][x[1]]))),
        pistas: ['Nombra el caso por el camino: primera palabra = hacia dónde está el hijo pesado; segunda = hacia dónde cayó el nodo nuevo desde él.', 'Factor +2 → pesado a la izquierda; −2 → a la derecha. El signo del factor del hijo dice si es línea recta (mismo signo) o zigzag (signo contrario).', 'Línea recta → 1 rotación simple. Zigzag → 2 rotaciones.'],
        explicacion: 'Regla mnemotécnica de clase: en línea recta basta una rotación; en zigzag, dos (S7-C1, diap. 10).'
      };
    }
  });

  B({
    id: 'n7-comparar', n: 7, e: 'B', dif: 3, c: ['av_prob', 'av_compara', 'av_complejidad'], tema: 'BST vs AVL',
    gen(rng, K) {
      const P = [['Cumple «izquierda < nodo < derecha» para todo el subárbol', 2, 'Todo AVL es un BST.'], ['Garantiza |factor| ≤ 1 en todos los nodos', 1, 'Es la condición de equilibrio del AVL.'], ['Insertar [1, 2, 3, 4, 5] puede dejarlo como una lista de altura 4', 0, 'Un BST sin balanceo degenera con datos ordenados.'], ['Usa rotaciones para reorganizarse tras insertar o eliminar', 1, 'Las rotaciones son la operación de rebalanceo del AVL.'], ['El inorden entrega los valores en orden ascendente', 2, 'Ambos son BST.'], ['Garantiza búsqueda O(log n) en el peor caso', 1, 'Su altura se mantiene en O(log n).'], ['La búsqueda puede costar O(n) en el peor caso', 0, 'Si el árbol degenera, h = n − 1.'], ['Tras cada inserción hay que recalcular altura y factor subiendo por el camino', 1, 'Necesario para detectar el primer nodo desbalanceado.']];
      const items = rng.sample(P, 5).map(p => ({ t: p[0], cat: p[1], why: p[2] }));
      return {
        tipo: 'clasificar', enunciado: 'Indica a qué estructura se refiere cada afirmación: solo **BST** (sin balanceo), solo **AVL**, o **ambos**.', categorias: ['Solo BST (sin balanceo)', 'Solo AVL', 'Ambos'], items,
        pistas: ['Todo AVL es un BST, así que las propiedades de orden son comunes.', 'Lo que añade el AVL es el equilibrio (|factor| ≤ 1) y las rotaciones.', 'Lo que solo se da en el BST es la posibilidad de degenerar.'],
        explicacion: 'AVL = BST + garantía de balance (S7-C1, diap. 5-6).'
      };
    }
  });

  /* ============ B ============ */
  B({
    id: 'n7-primer-nodo', n: 7, e: 'B', dif: 3, c: ['av_primer', 'av_insertar', 'av_ll', 'av_rr', 'av_lr', 'av_rl'], tema: 'Primer nodo desbalanceado',
    gen(rng, K, opts) {
      const caso = (opts && opts.caso) || null;
      const s = K.escenarioRot(rng, caso, rng.int(4, 7)); const t = s.bst; const u = Arb.hallar(t, s.r.primerDesbalanceado);
      return {
        tipo: 'avl', pide: ['nodo', 'caso', 'nrot'], enunciado: 'Este AVL (balanceado) recibe el valor **' + s.nuevo + '** (resaltado). El dibujo muestra el árbol justo **después de insertarlo como en un BST**, antes de rebalancear. Encuentra el **primer nodo desbalanceado** (el más profundo con |factor| ≥ 2), el **caso** y cuántas rotaciones necesita.', arbol: t, arbolOpts: { clases: arbolNuevoClases(s.nuevo) },
        esperado: { nodo: s.r.primerDesbalanceado, caso: s.r.caso, nrot: NR(s.r.caso), raiz: null, arbol: s.r.arbol, alt: Arb.altura(s.r.arbol) }, conceptos: ['av_primer', CID[s.r.caso]],
        pistas: ['Calcula las alturas desde las hojas hacia arriba y busca el **primer** nodo (el más profundo) cuyo factor sea +2 o −2.', 'Fíjate en el camino desde ese nodo hasta el nuevo: dos pasos hacia el mismo lado = línea recta; un paso a cada lado = zigzag.', 'Izq-Izq / Der-Der → 1 rotación; Izq-Der / Der-Izq → 2 rotaciones.'],
        explicacion: 'El primer nodo desbalanceado es **' + s.r.primerDesbalanceado + '** (factor ' + fsig(Arb.factor(u)) + '): caso **' + s.r.caso + '** (' + Arb.NOMBRE_CASO[s.r.caso] + '), ' + Arb.ROT_CASO[s.r.caso] + '.'
      };
    }
  });

  B({
    id: 'n7-rotacion-arbol', n: 7, e: 'B', dif: 4, c: ['av_primer', 'av_rotsimple', 'av_insertar', 'av_ll', 'av_rr', 'av_lr', 'av_rl'], tema: 'Ejecutar la rotación',
    gen(rng, K, opts) {
      const caso = (opts && opts.caso) || null;
      const s = K.escenarioRot(rng, caso, rng.int(5, 8)); const t = s.bst; const u = Arb.hallar(t, s.r.primerDesbalanceado);
      const c = s.r.caso; const raiz = c === 'LL' ? u.l.v : c === 'RR' ? u.r.v : c === 'LR' ? u.l.r.v : u.r.l.v;
      return {
        tipo: 'avl', pide: ['nodo', 'caso', 'raiz', 'arbol'], enunciado: 'Se inserta **' + s.nuevo + '** en este AVL (resaltado; se muestra el árbol después de colgarlo como hoja, **antes de rebalancear**). Determina el primer nodo desbalanceado, el caso, qué nodo queda como **raíz del subárbol rotado** y escribe el **árbol final**.', arbol: t, arbolOpts: { clases: arbolNuevoClases(s.nuevo) },
        esperado: { nodo: s.r.primerDesbalanceado, caso: c, nrot: NR(c), raiz, arbol: s.r.arbol, alt: Arb.altura(s.r.arbol) }, conceptos: ['av_rotsimple', CID[c], 'av_primer'],
        pistas: ['Primero localiza el nodo desbalanceado más profundo y su caso (línea recta o zigzag).', 'Simple: el hijo pesado sube y la raíz baja al lado contrario; el subárbol «de en medio» del hijo cambia de padre. Doble: el nieto (el nodo del zigzag) termina como raíz del subárbol.', 'Verifica que el inorden no cambió y que todos los factores quedaron en {−1, 0, +1}.'],
        explicacion: 'Nodo **' + s.r.primerDesbalanceado + '**, caso **' + c + '**; la raíz del subárbol rotado es **' + raiz + '**. Árbol final: **' + Arb.nota(s.r.arbol) + '** (altura ' + Arb.altura(s.r.arbol) + ').'
      };
    }
  });

  B({
    id: 'n7-insertar-secuencia', n: 7, e: 'B', dif: 4, c: ['av_insertar', 'av_ll', 'av_rr', 'av_lr', 'av_rl'], tema: 'Insertar una secuencia en un AVL',
    gen(rng, K) {
      let vals, r;
      for (let i = 0; i < 100; i++) { vals = rng.distinct(rng.int(5, 7), 5, 60); r = Arb.construirAVL(vals); if (r.hist.filter(h => h.pasos.length).length >= 1) break; }
      const casos = r.hist.filter(h => h.pasos.length).map(h => h.caso);
      return {
        tipo: 'arbol', enunciado: 'Inserta, en este orden, los valores **' + K.coma(vals) + '** en un **AVL** vacío (rebalanceando con rotaciones cuando algún nodo llegue a |factor| = 2). Escribe el árbol **final** en notación `valor(izq,der)`.', esperado: r.arbol, verificar: { bst: true, avl: true, inorden: true }, placeholder: 'p. ej. 20(10,30)',
        conceptos: ['av_insertar'].concat(casos.map(c => CID[c])),
        pistas: ['Inserta uno a uno como en un BST y, tras cada inserción, revisa los factores desde el nodo nuevo hacia la raíz.', 'Cuando aparezca un nodo con |factor| = 2, identifica el caso (LL, RR, LR, RL) y rota solo ahí; luego continúa.', 'Ejemplo de clase: 10, 20, 30, 40, 50, 25 → 30(20(10,25),40(,50)).'],
        explicacion: 'Pasos: ' + r.hist.map(h => h.nuevo + (h.pasos.length ? ' → ' + resumenPasos(h) + ' (' + h.caso + ')' : '')).join('; ') + '. Árbol final: **' + Arb.nota(r.arbol) + '**.'
      };
    }
  });

  B({
    id: 'n7-contar-rot', n: 7, e: 'B', dif: 4, c: ['av_insertar', 'av_complejidad'], tema: 'Contar rotaciones',
    gen(rng, K) {
      let vals, r;
      for (let i = 0; i < 100; i++) { vals = rng.distinct(rng.int(6, 8), 5, 70); r = Arb.construirAVL(vals); if (r.hist.filter(h => h.pasos.length).length >= 2) break; }
      const indiv = r.hist.reduce((s, h) => s + h.pasos.length, 0), conRot = r.hist.filter(h => h.pasos.length).length;
      return {
        tipo: 'tabla', enunciado: 'Se insertan en un AVL vacío los valores **' + K.coma(vals) + '**. Completa (una rotación doble cuenta como **2 rotaciones simples**).', cols: ['Medida', 'Valor'],
        filas: [[{ t: 'Inserciones que dispararon alguna rotación' }, { in: String(conRot), w: 4 }], [{ t: 'Total de rotaciones simples individuales realizadas' }, { in: String(indiv), w: 4 }], [{ t: 'Altura del árbol final' }, { in: String(Arb.altura(r.arbol)), w: 4 }]],
        pistas: ['Simula las inserciones una por una y anota en cuáles aparece un factor ±2.', 'Cada inserción dispara a lo sumo una rotación (simple = 1, doble = 2 rotaciones individuales).', 'Cuando termines, dibuja el árbol final y mide su altura.'],
        explicacion: 'Pasos: ' + r.hist.map(h => h.nuevo + (h.pasos.length ? ' → ' + resumenPasos(h) : '')).join('; ') + '. Árbol final: ' + Arb.nota(r.arbol) + '.'
      };
    }
  });

  B({
    id: 'n7-bigo', n: 7, e: 'B', dif: 3, c: ['av_complejidad', 'av_prob'], tema: 'Complejidad en AVL',
    gen(rng, K) {
      const P = [
        { en: 'Buscar un valor en un AVL de n nodos (peor caso).', t: 'logn', j: ['El balance mantiene la altura en O(log n) y la búsqueda sigue un solo camino.', 'Puede degenerar en una lista, por eso es O(n).', 'Siempre cuesta O(1).'] },
        { en: 'Realizar **una rotación** (simple) sobre un nodo.', t: '1', j: ['Solo reengancha unos pocos punteros y recalcula dos alturas.', 'Recorre todo el subárbol: O(n).', 'Depende de la altura del árbol: O(log n).'] },
        { en: 'Insertar un valor en un AVL de n nodos, incluyendo el rebalanceo (peor caso).', t: 'logn', j: ['Se baja y se sube por un camino de altura O(log n) y se hace a lo sumo una rotación O(1).', 'Hay que reconstruir el árbol: O(n).', 'Es O(1): solo se cuelga una hoja.'] },
        { en: 'Insertar un valor en un BST **degenerado** de n nodos (peor caso).', t: 'n', j: ['Hay que recorrer los n nodos (altura n − 1) hasta colgar la hoja.', 'El BST siempre cuesta O(log n).', 'Se cuelga en la raíz: O(1).'] },
        { en: 'Construir un AVL insertando **n** valores uno a uno (peor caso).', t: 'nlogn', j: ['n inserciones y cada una cuesta O(log n).', 'Cada inserción cuesta O(1), total O(n).', 'Cada inserción cuesta O(n), total O(n²).'] }
      ];
      const p = rng.pick(P);
      return {
        tipo: 'bigo', enunciado: '¿Cuál es la complejidad **temporal**?\n\n> ' + p.en, tiempo: p.t, escala: ['1', 'logn', 'n', 'nlogn', 'n2'],
        justif: { opciones: rng.shuffle([{ t: p.j[0], ok: true }, { t: p.j[1], ok: false, why: 'No es el razonamiento correcto.' }, { t: p.j[2], ok: false, why: 'No es el razonamiento correcto.' }]) },
        pistas: ['Un AVL mantiene su altura en O(log n); un BST sin balanceo, en el peor caso, en O(n).', 'Una rotación toca un número constante de punteros.', 'Rebalancear tras una inserción exige subir por el camino: O(log n).'],
        explicacion: p.j[0] + ' (S7-C1, diap. 5 y 9.)'
      };
    }
  });

  /* ---------- código AVL ---------- */
  function arbolConHijo(rng, K, lado) {
    for (let i = 0; i < 80; i++) { const { arbol } = bstAle(rng, rng.int(4, 7), rng.chance(0.4)); if (lado === 'izq' ? arbol.l : arbol.r) return arbol; }
    return Arb.parse(lado === 'izq' ? '20(10,30)' : '20(10,30)');
  }
  /** árbol donde actualizar las alturas en el orden equivocado produce un campo h incorrecto */
  function arbolSensible(rng, K, lado) {
    for (let i = 0; i < 600; i++) {
      const { arbol: t } = bstAle(rng, rng.int(6, 9), rng.chance(0.3)); const h = Arb.altura;
      if (lado === 'izq' && t.l) { const x = t.l; const yOld = h(t), yNew = 1 + Math.max(h(x.r), h(t.r)); if (Math.max(h(x.l), yOld) !== Math.max(h(x.l), yNew)) return t; }
      if (lado === 'der' && t.r) { const y = t.r; const xOld = h(t), xNew = 1 + Math.max(h(t.l), h(y.l)); if (Math.max(xNew, h(y.r)) !== Math.max(xOld, h(y.r))) return t; }
    }
    return null;
  }
  function testsRot(rng, K, lado) {
    const out = [];
    const sens = arbolSensible(rng, K, lado);
    for (let i = 0; i < 4; i++) {
      const t = (i === 0 && sens) ? sens : arbolConHijo(rng, K, lado); const f = lado === 'izq' ? 'rot_der' : 'rot_izq'; const rot = lado === 'izq' ? Arb.rotDer(t) : Arb.rotIzq(t);
      out.push({ e: `a_notaA(${f}(${K.pyNA(t)}))`, r: JSON.stringify(Arb.nota(rot)) }, { e: `alturas_ok(${f}(${K.pyNA(t)}))`, r: 'True' });
    }
    return out;
  }
  B({
    id: 'n7-completar-rot', n: 7, e: 'B', dif: 3, c: ['av_rotsimple', 'av_codigo'], tema: 'Completar la rotación',
    gen(rng, K) {
      const der = rng.chance(0.5); const sol = der ? SOL_ROT_DER : SOL_ROT_IZQ; const f = der ? 'rot_der' : 'rot_izq';
      const H = der
        ? [['x = y.izq', 'y.izq', []], ['y.izq = x.der', 'x.der', []], ['x.der = y', 'x.der', []], ['actualizar(y)', 'y', []], ['return x', 'x', []], ['actualizar(y)\n    actualizar(x)', 'actualizar(x)', []]]
        : [['y = x.der', 'x.der', []], ['x.der = y.izq', 'y.izq', []], ['y.izq = x', 'y.izq', []], ['actualizar(x)', 'x', []], ['return y', 'y', []], ['actualizar(x)\n    actualizar(y)', 'actualizar(y)', []]];
      const ids = rng.sample([0, 1, 2, 4, 5], 3).sort((a, b) => a - b);
      const r = K.huecos(sol, ids.map(i => [H[i][0], H[i][1]]), {});
      return {
        tipo: 'codigo', modoEj: 'completar', fn: f, cls_arbol: true, prelude: K.PRE_AVL + '\n' + PY_HELP, enunciado: 'Completa la **' + (der ? 'rotación derecha' : 'rotación izquierda') + '** (algoritmo de clase). Ya existen `altura(n)` y `actualizar(n)` (recalcula `n.h`).', codigoVista: CLASE_AVL + '\n' + PY_HELP,
        plantilla: r.plantilla, respuestas: r.respuestas, solucion: sol, tests: testsRot(rng, K, der ? 'izq' : 'der'), anchos: { 1: 10, 2: 10, 3: 14 }, ejemploLlamada: 'a_notaA(' + f + '(NA(30, NA(20), None)))',
        pistas: [der ? 'Rotación derecha de `y`: `x` es el hijo izquierdo de `y`; el hijo derecho de `x` pasa a ser hijo izquierdo de `y`; `y` pasa a ser hijo derecho de `x`.' : 'Rotación izquierda de `x`: `y` es el hijo derecho de `x`; el hijo izquierdo de `y` pasa a ser hijo derecho de `x`; `x` pasa a ser hijo izquierdo de `y`.', 'Las alturas se recalculan primero para el nodo que **bajó** y luego para el que subió.', 'La función devuelve la **nueva raíz local** (el nodo que subió).'],
        explicacion: '```\n' + sol + '\n```'
      };
    }
  });

  B({
    id: 'n7-impl-rot', n: 7, e: 'B', dif: 4, c: ['av_rotsimple', 'av_codigo', 'av_altura'], tema: 'Implementar la rotación',
    gen(rng, K) {
      const der = rng.chance(0.5); const f = der ? 'rot_der' : 'rot_izq'; const sol = der ? SOL_ROT_DER : SOL_ROT_IZQ;
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: f, cls_arbol: true, prelude: K.PRE_AVL + '\n' + PY_HELP, enunciado: 'Escribe `' + f + '(' + (der ? 'y' : 'x') + ')`: la **rotación ' + (der ? 'derecha' : 'izquierda') + '** de un nodo AVL. Debe reenganchar los punteros, **recalcular las alturas** (primero el nodo que baja, luego el que sube) y **devolver la nueva raíz local**.', codigoVista: CLASE_AVL + '\n' + PY_HELP,
        starter: `def ${f}(${der ? 'y' : 'x'}):\n    # tu código aquí\n    pass`, solucion: sol, tests: testsRot(rng, K, der ? 'izq' : 'der'), ejemploLlamada: 'a_notaA(' + f + '(NA(30, NA(20), None)))',
        pistas: der ? ['Guarda `x = y.izq`. Ese será el nuevo nodo raíz del subárbol.', 'El hijo derecho de `x` pasa a ser el izquierdo de `y`; luego `x.der = y`.', 'Actualiza `y` primero, luego `x`, y devuelve `x`.'] : ['Guarda `y = x.der`. Ese será el nuevo nodo raíz del subárbol.', 'El hijo izquierdo de `y` pasa a ser el derecho de `x`; luego `y.izq = x`.', 'Actualiza `x` primero, luego `y`, y devuelve `y`.'],
        explicacion: '```\n' + sol + '\n```\nO(1) y conserva el inorden.'
      };
    }
  });

  const DEP7 = [
    { f: 'rot_der', bug: 'Devuelve `y` (la raíz vieja) en lugar de `x`: el subárbol rotado queda desconectado y se pierde `x`.', start: SOL_ROT_DER.replace('return x', 'return y'), lado: 'izq', p: ['Prueba `a_notaA(rot_der(NA(30, NA(20), None)))`: ¿qué árbol sale?', 'Después de rotar, la nueva raíz local es el nodo que **subió**.', 'Cambia el último `return`.'] },
    { f: 'rot_der', bug: 'Se recalculan las alturas en el orden equivocado: `x` antes que `y`, cuando la altura de `x` depende de la de `y`.', start: SOL_ROT_DER.replace('actualizar(y)\n    actualizar(x)', 'actualizar(x)\n    actualizar(y)'), lado: 'izq', p: ['El árbol tiene la forma correcta, pero ¿las alturas `h` son correctas? Revisa `alturas_ok(...)`.', 'Tras rotar, `y` es hijo de `x`: ¿cuál altura debe estar lista primero?', 'Primero `actualizar(y)` (el que bajó), luego `actualizar(x)`.'] },
    { f: 'rot_izq', bug: 'Falta enganchar `x` como hijo izquierdo de `y` (`y.izq = x`): se pierde la rama.', start: SOL_ROT_IZQ.replace('    y.izq = x\n', ''), lado: 'der', p: ['Prueba la rotación con un árbol de 3 nodos: ¿falta algún nodo en el resultado?', 'En una rotación izquierda, la raíz vieja baja como hijo **izquierdo** del nodo que sube.', 'Agrega `y.izq = x` después de mover el subárbol del medio.'] },
    { f: 'rot_izq', bug: 'Se mueve el hijo equivocado: usa `y.der` en lugar de `y.izq` como subárbol que cambia de padre.', start: SOL_ROT_IZQ.replace('x.der = y.izq', 'x.der = y.der'), lado: 'der', p: ['Usa un árbol donde el hijo derecho tenga un hijo izquierdo. ¿Dónde queda?', 'El subárbol «del medio» es el hijo **izquierdo** de `y` (entre `x` y `y` en el inorden).', 'Corrige la segunda asignación.'] },
    { f: 'rot_der', bug: 'No se actualizan las alturas: los factores posteriores serán incorrectos.', start: SOL_ROT_DER.replace('    actualizar(y)\n    actualizar(x)\n', ''), lado: 'izq', p: ['Verifica `alturas_ok(...)` después de rotar.', 'Al cambiar la estructura, los campos `h` de `x` e `y` quedan desactualizados.', 'Recalcula `y` y luego `x` antes de devolver.'] }
  ];
  B({
    id: 'n7-depurar-rot', n: 7, e: 'B', dif: 4, c: ['av_rotsimple', 'av_codigo', 'in_depurar'], tema: 'Depurar rotaciones',
    gen(rng, K) {
      const d = rng.pick(DEP7); const sol = d.f === 'rot_der' ? SOL_ROT_DER : SOL_ROT_IZQ;
      return {
        tipo: 'codigo', modoEj: 'depurar', fn: d.f, cls_arbol: true, prelude: K.PRE_AVL + '\n' + PY_HELP, enunciado: 'Esta rotación AVL **no funciona bien**. Encuentra el error y corrígelo. (Las pruebas comprueban la forma del árbol **y** las alturas.)', codigoVista: CLASE_AVL + '\n' + PY_HELP,
        starter: d.start, solucion: sol, tests: testsRot(rng, K, d.lado), ejemploLlamada: 'a_notaA(' + d.f + '(NA(30, NA(20), None)))', pistas: d.p, explicacion: '**Error:** ' + d.bug + '\n```\n' + sol + '\n```'
      };
    }
  });

  /* ============ C ============ */
  B({
    id: 'n7-eliminar', n: 7, e: 'C', dif: 5, c: ['av_eliminar', 'av_rotsimple'], tema: 'Eliminar en un AVL',
    gen(rng, K, opts) {
      for (let intento = 0; intento < 200; intento++) {
        const n = rng.int(7, 10); const base = Arb.construirAVL(rng.distinct(n, 5, 95)).arbol; const x = rng.pick(Arb.nodos(base)).v;
        const r = Arb.delAVL(base, x, 'suc'); if (intento < 120 && !r.pasos.length) continue;
        const nd = Arb.hallar(base, x); const dos = nd.l && nd.r; const ac = dos ? [Arb.delAVL(base, x, 'pred').arbol] : [];
        return {
          tipo: 'arbol', enunciado: 'Elimina el valor **' + x + '** de este AVL. Convención de clase: borrar como en un BST (con 2 hijos, copiar el **sucesor inorden** —el menor del subárbol derecho— y borrar ese sucesor) y **rebalancear** por el camino hacia la raíz decidiendo el caso por el **factor del hijo**. (Si usas el predecesor, también se acepta.) Escribe el árbol resultante.', arbol: base, arbolOpts: { etiquetas: 'factor' },
          esperado: r.arbol, aceptados: ac, verificar: { bst: true, avl: true, inorden: false }, placeholder: 'p. ej. 20(10,30)',
          pistas: ['Primero elimina como en un BST y luego recorre el camino hacia la raíz recalculando alturas y factores.', 'Si algún nodo llega a ±2: factor > 1 y balance(hijo izq.) ≥ 0 → rotación derecha; si es < 0 → izquierda del hijo y luego derecha (simétrico para el lado derecho).', 'A diferencia de la inserción, un borrado puede requerir varias rotaciones al subir.'],
          explicacion: 'Resultado: **' + Arb.nota(r.arbol) + '**' + (r.pasos.length ? ' (rotaciones: ' + resumenPasos(r) + ')' : ' (no hizo falta rotar)') + '.'
        };
      }
      throw new Error('no se pudo generar la eliminación');
    }
  });

  B({
    id: 'n7-eliminar-caso', n: 7, e: 'C', dif: 5, c: ['av_eliminar', 'av_primer', 'av_ll', 'av_rr', 'av_lr', 'av_rl'], tema: 'Caso tras una eliminación',
    gen(rng, K, opts) {
      for (let intento = 0; intento < 600; intento++) {
        const n = rng.int(7, 10); const base = Arb.construirAVL(rng.distinct(n, 5, 95)).arbol; const x = rng.pick(Arb.nodos(base)).v;
        const bst = Arb.delBST(base, x, 'suc'); const bad = Arb.desbalanceados(bst); if (!bad.length) continue;
        const u = bad[0]; const caso = Arb.casoDe(u); const c = Arb.factor(u) > 0 ? u.l : u.r; const trampa = Arb.factor(c) === 0;
        if (!trampa && intento < 450 && rng.chance(0.7)) continue;
        return {
          tipo: 'avl', pide: ['nodo', 'caso', 'nrot'], enunciado: 'Del AVL siguiente se **eliminó el valor ' + x + '** (copiando el sucesor inorden si tenía 2 hijos). El dibujo muestra el árbol justo **después de borrar como en un BST, antes de rebalancear**. Encuentra el **primer nodo desbalanceado** (el más profundo con |factor| ≥ 2), el **caso** y las rotaciones necesarias. *(En eliminación el caso se decide por el **factor del hijo**.)*', arbol: bst,
          esperado: { nodo: u.v, caso, nrot: NR(caso), raiz: null, arbol: null, alt: null }, conceptos: ['av_eliminar', CID[caso]],
          pistas: ['Recalcula alturas y factores de abajo hacia arriba y toma el nodo más profundo con |factor| = 2.', 'Mira el factor de su hijo **pesado**: mismo signo → línea recta (rotación simple); signo contrario → zigzag (doble).', 'Trampa de eliminación: si el factor del hijo pesado es **0**, se corrige con una rotación **simple**.'],
          explicacion: 'Nodo **' + u.v + '** (factor ' + fsig(Arb.factor(u)) + ') con hijo pesado de factor ' + fsig(Arb.factor(c)) + ': caso **' + caso + '** → ' + Arb.ROT_CASO[caso] + '.' + (trampa ? ' (Hijo con factor 0: rotación simple.)' : '')
        };
      }
      throw new Error('no se pudo generar el caso de eliminación');
    }
  });

  B({
    id: 'n7-abierta-zigzag', n: 7, e: 'C', dif: 4, c: ['av_lr', 'av_rl', 'av_rotsimple'], tema: '¿Por qué dos rotaciones?',
    gen(rng, K) {
      return {
        tipo: 'abierta', enunciado: '**¿Por qué el caso en zigzag (Izq-Der o Der-Izq) no se arregla con una sola rotación simple y qué se hace en su lugar?** Explícalo con un ejemplo, por ejemplo insertando 30, 10, 20.',
        criterios: [
          { desc: 'Explica que una rotación simple deja el problema (el zigzag solo **mueve el desbalance** al otro lado y el árbol sigue desbalanceado).', claves: [['una sola', 'no'], ['simple', 'no', 'basta'], ['simple', 'no', 'resuelve'], ['simple', 'sigue'], ['simple', 'desbalance'], ['no', 'arregla']] },
          { desc: 'Indica el primer paso: una rotación en el **hijo** que convierte el zigzag en una **línea recta**.', claves: [['hijo', 'recta'], ['hijo', 'linea'], ['primero', 'hijo'], ['rotacion', 'hijo'], ['convierte', 'recta']] },
          { desc: 'Indica el segundo paso: una rotación simple en el **nodo desbalanceado** (la raíz del subárbol).', claves: [['segunda', 'rotacion'], ['luego', 'rotacion'], ['despues', 'rotacion'], ['rotacion', 'nodo desbalanceado'], ['rotacion', 'raiz']] },
          { desc: 'Da el resultado/ejemplo: con 30, 10, 20 queda 20 como raíz con 10 y 30 (`20(10,30)`).', claves: ['20(10,30)', ['20', '10', '30'], 'balanceado'] }
        ],
        modelo: 'En un zigzag el nodo nuevo queda «doblado»: una **sola rotación simple** solo cambia el lado del desbalance y el árbol **sigue desbalanceado**. Por eso se hacen **dos rotaciones**: (1) una rotación en el **hijo** que convierte el zigzag en una **línea recta** (caso Izq-Izq o Der-Der); (2) una **rotación simple en el nodo desbalanceado**. Ejemplo: insertar 30, 10, 20 (Izq-Der): rotación izquierda en 10 → 30(20(10,)), rotación derecha en 30 → **20(10,30)**, balanceado.',
        pistas: ['Piensa qué le pasa a la forma del árbol si en un zigzag rotas directamente el nodo desbalanceado.', 'Primero hay que «enderezar» el zigzag para que se vuelva una línea recta.', 'Haz el ejemplo 30, 10, 20 y escribe el árbol tras cada rotación.'],
        explicacion: 'S7-C1, diap. 13-14: la doble rotación convierte el zigzag en línea recta y luego balancea.'
      };
    }
  });

  B({
    id: 'n7-abierta-compara', n: 7, e: 'C', dif: 3, c: ['av_compara', 'av_prob', 'in_justificar'], tema: 'AVL vs BST vs rojo-negro (complemento)',
    gen(rng, K) {
      return {
        tipo: 'abierta', fmt: 'Pregunta de razonamiento', enunciado: 'Compara **BST**, **AVL** y **rojo-negro**. *(Contenido complementario: el PDF de AVL disponible solo llega hasta la diapositiva 20 y no cubre rojo-negro; usa lo que se dice de ellos en las diapositivas 1–5 y conocimiento general.)* ¿Cuál garantiza O(log n)? ¿Cuándo usarías cada uno?',
        criterios: [
          { desc: 'Indica que el **BST** sin balanceo puede **degenerar** (altura hasta n−1, O(n)).', claves: ['degener', ['o(n)', 'bst'], ['lista', 'altura'], 'no garantiza'] },
          { desc: 'Indica que **AVL** y **rojo-negro** son auto-balanceados y **garantizan O(log n)**.', claves: [['avl', 'log n'], ['auto', 'balance'], ['garantiz', 'log'], ['o(log n)']] },
          { desc: 'Señala que el **AVL** es más estricto (|factor| ≤ 1): búsquedas más rápidas pero más rotaciones.', claves: [['avl', 'estricto'], ['avl', 'busqueda'], ['avl', 'consulta'], ['avl', 'mas rotaciones'], ['factor']] },
          { desc: 'Señala que el **rojo-negro** es más relajado: menos rotaciones al insertar/eliminar (mejor con muchas modificaciones).', claves: [['rojo', 'menos rotaciones'], ['rojo', 'inserc'], ['rojo', 'relajad'], ['rojo-negro', 'modific'], ['rojinegro', 'menos']] }
        ],
        modelo: 'Un **BST** sin balanceo puede **degenerar** (altura hasta n−1, operaciones O(n)). **AVL** y **rojo-negro** son BST **auto-balanceados** que garantizan **O(log n)** en búsqueda, inserción y eliminación. El **AVL** mantiene un balance estricto (|factor| ≤ 1): sus búsquedas son muy rápidas pero hace más rotaciones al insertar/eliminar; conviene cuando predominan las **consultas**. El **rojo-negro** es más relajado: hace **menos rotaciones** al insertar/eliminar y conviene con **muchas modificaciones** (por eso lo usan bibliotecas como `std::map` o `TreeMap`).',
        pistas: ['Empieza por el problema del BST: ¿qué pasa con datos ordenados?', 'Los dos auto-balanceados garantizan altura O(log n); lo que cambia es qué tan estricto es el balance.', 'Relaciona «más estricto» con búsqueda y «más relajado» con costo de rebalanceo.'],
        explicacion: 'Rojo-negro es complemento general (no está en las diapositivas 1-20).'
      };
    }
  });

  B({
    id: 'n7-impl-insertar', n: 7, e: 'C', dif: 5, c: ['av_insertar', 'av_codigo', 'av_ll', 'av_rr', 'av_lr', 'av_rl'], tema: 'Implementar la inserción AVL',
    gen(rng, K) {
      const secs = [[30, 20, 10], [10, 20, 30], [30, 10, 20], [10, 30, 20], [10, 20, 30, 40, 50, 25]];
      for (let i = 0; i < 3; i++) secs.push(rng.distinct(rng.int(6, 9), 5, 70));
      secs.push([20, 10, 20, 10]);
      const tests = []; secs.forEach(s => { const r = Arb.construirAVL(s); tests.push({ e: `a_notaA(construir(${JSON.stringify(s)}))`, r: JSON.stringify(Arb.nota(r.arbol)) }); });
      tests.push({ e: `alturas_ok(construir(${JSON.stringify(secs[secs.length - 2])}))`, r: 'True' });
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: 'insertar', cls_arbol: true, prelude: K.PRE_AVL + '\n' + PY_HELP + '\n' + PY_ROT + '\n' + PRE_CONSTRUIR,
        enunciado: 'Escribe `insertar(nodo, v)` de un **AVL**: inserta como en un BST (sin duplicar), actualiza la altura de cada nodo al volver por el camino y, si el factor llega a ±2, aplica el caso correspondiente (**Izq-Izq, Der-Der, Izq-Der, Der-Izq**) usando las rotaciones ya definidas. **Devuelve la nueva raíz del subárbol.**\n\nYa están definidos `altura`, `actualizar`, `factor`, `rot_der` y `rot_izq` (la clase `NodoAVL` incluye el atributo `h`).', codigoVista: CLASE_AVL + '\n' + PY_HELP + '\n' + PY_ROT,
        starter: 'def insertar(nodo, v):\n    # tu código aquí\n    pass', solucion: SOL_INS, tests, reglas: [{ t: 'recursiva', fn: 'insertar' }], ejemploLlamada: 'a_notaA(construir([10, 20, 30]))',
        pistas: ['Empieza igual que el `insertar` del BST (devolviendo `NodoAVL(v)` en el caso base y reasignando `nodo.izq`/`nodo.der`). No olvides tratar el valor repetido.', 'Después de insertar: `actualizar(nodo)` y calcula `f = factor(nodo)`. Si |f| ≤ 1, devuelve `nodo`.', 'Casos: `f > 1` y `v < nodo.izq.valor` → `rot_der(nodo)`; `f < -1` y `v > nodo.der.valor` → `rot_izq(nodo)`; los dos zigzag: primero rota el hijo y luego el nodo, y **devuelve** la nueva raíz.'],
        explicacion: '```\n' + SOL_INS + '\n```\nCada inserción dispara a lo sumo una rotación (simple o doble). En el uso: `raiz = insertar(raiz, v)`.'
      };
    }
  });

  B({
    id: 'n7-compara-bst-avl', n: 7, e: 'C', dif: 4, c: ['av_prob', 'av_insertar', 'bs_ordenins'], tema: 'BST vs AVL con la misma secuencia',
    gen(rng, K) {
      const n = rng.int(6, 8); const asc = rng.chance(0.6); let vals = rng.distinct(n, 5, 80); if (asc) vals = vals.slice().sort((a, b) => a - b);
      const bst = Arb.insertarSecuencia(vals), av = Arb.construirAVL(vals); const rot = av.hist.reduce((s, h) => s + h.pasos.length, 0);
      return {
        tipo: 'tabla', enunciado: 'Se insertan los valores **' + K.coma(vals) + '** (en ese orden) en un **BST** y en un **AVL**. Completa:', cols: ['Medida', 'Valor'],
        filas: [[{ t: 'Altura del BST' }, { in: String(Arb.altura(bst)), w: 4 }], [{ t: 'Altura del AVL' }, { in: String(Arb.altura(av.arbol)), w: 4 }], [{ t: 'Total de rotaciones simples individuales al construir el AVL' }, { in: String(rot), w: 4 }]],
        pistas: ['Construye el BST normal y mide su altura (aristas).', 'Construye el AVL rebalanceando cuando aparezca un factor ±2 y cuenta las rotaciones (una doble = 2).', 'Compara: si los datos llegan ordenados, el BST degenera pero el AVL se mantiene con altura ≈ log₂ n.'],
        explicacion: 'BST: ' + Arb.nota(bst) + ' (altura ' + Arb.altura(bst) + '). AVL: ' + Arb.nota(av.arbol) + ' (altura ' + Arb.altura(av.arbol) + ', ' + rot + ' rotaciones).'
      };
    }
  });

  B({
    id: 'n7-mixta', n: 7, e: 'C', dif: 5, c: ['av_insertar', 'av_ll', 'av_rr', 'av_lr', 'av_rl', 'av_factor'], tema: 'Construcción y análisis de un AVL',
    gen(rng, K) {
      let vals, r;
      for (let i = 0; i < 100; i++) { vals = rng.distinct(6, 5, 60); r = Arb.construirAVL(vals); if (r.hist.filter(h => h.pasos.length).length >= 2) break; }
      const primera = r.hist.find(h => h.pasos.length);
      return {
        tipo: 'mixta', enunciado: 'Se insertan en un AVL vacío los valores **' + K.coma(vals) + '**.',
        partes: [
          { titulo: 'Primer desbalance', peso: 1, q: { tipo: 'opcion', enunciado: 'El primer desbalance ocurre al insertar **' + primera.nuevo + '**. ¿Qué caso es?', opciones: ['LL', 'RR', 'LR', 'RL'].map(c => ({ t: c + ' — ' + Arb.NOMBRE_CASO[c], ok: c === primera.caso, why: c === primera.caso ? 'Es el caso correcto.' : 'No es el caso.' })) } },
          { titulo: 'Rotaciones', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuántas rotaciones simples individuales se hacen **en total** (una doble = 2)?', esperado: String(r.hist.reduce((s, h) => s + h.pasos.length, 0)) } },
          { titulo: 'Árbol final', peso: 2, q: { tipo: 'arbol', enunciado: 'Escribe el AVL final en notación `valor(izq,der)`.', esperado: r.arbol, verificar: { bst: true, avl: true } } },
          { titulo: 'Factor de la raíz', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuál es el factor de balance de la raíz del árbol final?', esperado: String(Arb.factor(r.arbol)) } }
        ],
        conceptos: ['av_insertar', CID[primera.caso]],
        pistas: ['Simula cada inserción y, al aparecer un factor ±2, identifica el caso antes de rotar.', 'Cuenta una rotación doble como dos rotaciones simples.', 'Con el árbol final, calcula alturas y el factor de la raíz (alt(izq) − alt(der)).'],
        explicacion: 'Pasos: ' + r.hist.map(h => h.nuevo + (h.pasos.length ? ' → ' + resumenPasos(h) + ' (' + h.caso + ')' : '')).join('; ') + '. Final: ' + Arb.nota(r.arbol) + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
