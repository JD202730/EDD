/* banco_n8.js — Nivel 8: Retos integradores (recursión + complejidad + paradigmas + BST + AVL) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py, Arb = ET.Arb;
  const J = a => a.map(String).join(' ');
  const PAR = ['Fuerza bruta', 'Backtracking', 'Greedy', 'Divide y vencerás', 'Programación dinámica'];
  const ETQ8 = { Vm: 'O(V·m)', nn: 'O(nⁿ)' };

  /* ---------- 1. Elegir paradigma + justificar + costo ---------- */
  const ESC8 = [
    { t: 'Ordenar un millón de registros.', p: 3, k: 'nlogn', j: ['Se parte en mitades **independientes** que se ordenan y luego se combinan (merge sort).', 'Los subproblemas se solapan y hay que guardarlos en una tabla.', 'Basta tomar siempre el menor elemento disponible sin reconsiderar.'] },
    { t: 'Calcular el **mínimo de monedas** para formar un valor V con denominaciones {1, 3, 4}.', p: 4, k: 'Vm', j: ['Los subproblemas «mínimo para v − c» se **solapan**, y greedy no garantiza el óptimo con este sistema.', 'Los subproblemas son independientes, así que se divide a la mitad.', 'Se toma la mayor moneda que quepa: es óptimo siempre.'] },
    { t: 'Hallar **todas** las formas de colocar N reinas en un tablero sin que se ataquen.', p: 1, k: null, j: ['Se prueba una reina por fila y se **abandona la rama** apenas dos reinas se atacan (poda).', 'Los subproblemas se repiten y se guardan en una caché.', 'Se elige siempre la mejor posición local y no se reconsidera.'] },
    { t: 'Calcular **fib(80)** de forma eficiente.', p: 4, k: 'n', j: ['Los subproblemas fib(k) se **solapan**: se guardan (memoización o tabla) y se resuelven una vez.', 'Los subproblemas son independientes, se combinan al final.', 'Se podan las ramas inválidas del árbol de llamadas.'] },
    { t: 'Dar cambio con monedas {1, 5, 10, 25} usando el mínimo de monedas.', p: 2, k: null, j: ['En un sistema **canónico**, tomar la mayor moneda que quepa da el óptimo local y global.', 'Los subproblemas se solapan y hay que llenar una tabla.', 'Hay que probar todas las combinaciones posibles.'] },
    { t: 'Saber si dos números de una lista de n elementos suman S **probando todos los pares**.', p: 0, k: 'n2', j: ['Se enumeran todos los candidatos (n(n−1)/2 pares) y se verifica cada uno.', 'Se divide la lista en mitades y se combinan los resultados.', 'Se poda cuando la suma supera S.'] },
    { t: 'Buscar un valor en un arreglo **ordenado** de n elementos descartando la mitad en cada paso.', p: 3, k: 'logn', j: ['Se divide el problema en uno de la mitad de tamaño (y se descarta el otro): divide y vencerás.', 'Los subproblemas se solapan.', 'Se prueba cada posición hasta encontrarlo.'] }
  ];
  B({
    id: 'n8-elegir-paradigma', n: 8, e: 'A', dif: 3, c: ['in_paradigma', 'pd_cinco', 'in_justificar'], tema: 'Paradigma + justificación + costo',
    gen(rng, K) {
      const s = rng.pick(ESC8);
      const partes = [
        { titulo: 'Paradigma', peso: 1, q: { tipo: 'opcion', enunciado: '¿Qué **paradigma** es el más apropiado?', opciones: PAR.map((p, i) => ({ t: p, ok: i === s.p, why: i === s.p ? 'Es el paradigma adecuado.' : 'No es el más adecuado para este problema.' })) } },
        { titulo: 'Justificación', peso: 1.5, q: { tipo: 'opcion', enunciado: '¿Qué propiedad del problema justifica esa elección?', opciones: rng.shuffle([{ t: s.j[0], ok: true, why: 'Es la propiedad correcta.' }, { t: s.j[1], ok: false, why: 'No es la propiedad que aplica.' }, { t: s.j[2], ok: false, why: 'No es la propiedad que aplica.' }]) } }
      ];
      if (s.k) partes.push({ titulo: 'Costo', peso: 1, q: { tipo: 'bigo', enunciado: '¿Cuál es el costo temporal de la solución adecuada? (n = tamaño; V = valor y m = número de monedas)', tiempo: s.k, escala: ['logn', 'n', 'nlogn', 'n2', 'Vm', '2n', 'nfact'], etq: ETQ8 } });
      return {
        tipo: 'mixta', enunciado: 'Problema: ' + s.t, partes,
        pistas: ['¿Los subproblemas son independientes, se solapan, o se pueden podar ramas? ¿Hay una decisión local óptima?', 'Elige la propiedad que justifica el paradigma y que aparece en el enunciado.', 'Recuerda: DyV n log n (ordenar), búsqueda binaria log n, DP del cambio O(V·m), fib con memoización O(n), pares O(n²).'],
        explicacion: PAR[s.p] + ': ' + s.j[0]
      };
    }
  });

  /* ---------- 2. Analizar código ---------- */
  const FAM8 = [
    { fn: 'fib', code: `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`, n: [5, 8], t: '2n', s: 'n', j: ['Cada llamada genera dos más (recalcula subproblemas) y la pila llega a profundidad n.', 'Hace n llamadas, una por cada valor.', 'Divide n a la mitad en cada llamada.'] },
    { fn: 'fib_memo', code: `def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]`, n: [5, 9], t: 'n', s: 'n', j: ['Cada valor se calcula una vez (n+1 cálculos O(1)); la caché y la pila ocupan O(n).', 'Sigue siendo exponencial.', 'Es O(1) porque la caché lo resuelve todo.'] },
    { fn: 'mitad', code: `def mitad(n):\n    if n <= 1:\n        return 0\n    return 1 + mitad(n // 2)`, n: [16, 64], t: 'logn', s: 'logn', j: ['n se divide a la mitad en cada llamada: ≈ log₂ n llamadas y pila de ese tamaño.', 'n baja de uno en uno: n llamadas.', 'Hace dos llamadas por nivel.'] },
    { fn: 'suma', code: `def suma(n):\n    if n == 0:\n        return 0\n    return n + suma(n - 1)`, n: [4, 9], t: 'n', s: 'n', j: ['n llamadas con trabajo constante y n marcos apilados.', 'Es constante porque solo suma.', 'Es logarítmica: n se reduce rápido.'] }
  ];
  B({
    id: 'n8-analiza-codigo', n: 8, e: 'B', dif: 4, c: ['in_analisis', 'rc_conteo', 'cx_recursivo', 'cx_espacial'], tema: 'Analizar un algoritmo recursivo',
    gen(rng, K) {
      const f = rng.pick(FAM8); const n = rng.int(f.n[0], f.n[1]);
      const full = f.code + `\n\nprint(${f.fn}(${n}))`; const out = K.run(full); const cl = K.llamadas(f.code, `${f.fn}(${n})`, f.fn);
      return {
        tipo: 'mixta', enunciado: 'Analiza el programa.', codigoVista: full,
        partes: [
          { titulo: 'Salida', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Qué imprime el programa?', esperado: out } },
          { titulo: 'Llamadas', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuántas veces se ejecuta `' + f.fn + '` en total (incluida la llamada inicial)?', esperado: String(cl.n) } },
          { titulo: 'Complejidad', peso: 1.5, q: { tipo: 'bigo', pideEspacio: true, enunciado: 'Complejidad temporal (en función de n) y espacial (pila + estructuras auxiliares):', tiempo: f.t, espacio: f.s, escala: ['1', 'logn', 'n', 'nlogn', 'n2', '2n'], etqS: 'Espacio', justif: { opciones: rng.shuffle([{ t: f.j[0], ok: true }, { t: f.j[1], ok: false, why: 'No es el razonamiento correcto.' }, { t: f.j[2], ok: false, why: 'No es el razonamiento correcto.' }]) } } }
        ],
        pistas: ['Haz una traza breve para obtener la salida y cuenta las llamadas en el árbol de llamadas.', 'Complejidad = (número de llamadas) × (trabajo por llamada); el espacio es la profundidad máxima de la pila más lo que guarde la estructura auxiliar.', 'Compara con las reglas de clase: lineal, logarítmica, exponencial, memoización.'],
        explicacion: 'Salida ' + out + '; ' + cl.n + ' llamadas. ' + f.j[0]
      };
    }
  });

  /* ---------- 3. Depurar recursión en árboles ---------- */
  const SOL8 = {
    altura: `def altura(nodo):\n    if nodo is None:\n        return -1\n    return 1 + max(altura(nodo.izq), altura(nodo.der))`,
    contar_hojas: `def contar_hojas(nodo):\n    if nodo is None:\n        return 0\n    if nodo.izq is None and nodo.der is None:\n        return 1\n    return contar_hojas(nodo.izq) + contar_hojas(nodo.der)`,
    suma_valores: `def suma_valores(nodo):\n    if nodo is None:\n        return 0\n    return nodo.valor + suma_valores(nodo.izq) + suma_valores(nodo.der)`,
    profundidad: `def profundidad(nodo, v):\n    if nodo is None:\n        return -1\n    if v == nodo.valor:\n        return 0\n    d = profundidad(nodo.izq if v < nodo.valor else nodo.der, v)\n    return -1 if d == -1 else d + 1`,
    altura_min: `def altura(nodo):\n    if nodo is None:\n        return -1\n    return 1 + max(altura(nodo.izq), altura(nodo.der))`
  };
  const DEP8 = [
    { fn: 'altura', k: 'altura', bug: 'El caso base devuelve 0 para el árbol vacío; por convención del curso debe ser −1 (así una hoja tiene altura 0).', start: SOL8.altura.replace('return -1', 'return 0'), p: ['Prueba `altura(N(5))`: una hoja debería tener altura 0.', 'Si el árbol vacío vale 0, una hoja da 1 + máx(0, 0) = 1.', 'El caso base debe ser `return -1`.'] },
    { fn: 'contar_hojas', k: 'contar_hojas', bug: 'El árbol vacío se cuenta como hoja (devuelve 1 en el caso base).', start: SOL8.contar_hojas.replace('return 0', 'return 1'), p: ['Prueba `contar_hojas(N(1, N(2), None))`: debería dar 1.', 'Los hijos `None` no son hojas: no existen.', 'El caso base de `None` debe devolver 0.'] },
    { fn: 'suma_valores', k: 'suma_valores', bug: 'Solo se suma el subárbol izquierdo; falta el derecho.', start: SOL8.suma_valores.replace(' + suma_valores(nodo.der)', ''), p: ['Prueba un árbol con hijo derecho y compara con la suma real.', 'La suma total = valor + suma(izq) + suma(der).', 'Falta un sumando.'] },
    { fn: 'profundidad', k: 'profundidad', bug: 'Cuando el valor no está, el −1 se convierte en 0 al sumar 1 en el regreso (no se propaga el «no encontrado»).', start: SOL8.profundidad.replace('return -1 if d == -1 else d + 1', 'return d + 1'), p: ['Busca un valor que NO esté en el árbol: debería devolver −1.', 'El −1 que viene de la llamada más profunda se vuelve 0, 1, 2… al regresar.', 'Si `d == -1`, devuélvelo tal cual; si no, suma 1.'] },
    { fn: 'altura', k: 'altura_min', bug: 'Usa `min` en vez de `max`: calcula la altura de la rama más corta.', start: SOL8.altura_min.replace('max(', 'min('), p: ['Prueba un árbol con una rama larga y otra corta.', 'La altura es la distancia a la hoja **más lejana**.', 'Cambia `min` por `max`.'] }
  ];
  B({
    id: 'n8-depurar-int', n: 8, e: 'B', dif: 4, c: ['in_depurar', 'ar_profalt', 'ar_subarbol', 'bs_buscar'], tema: 'Depurar recursión en árboles',
    gen(rng, K) {
      const d = rng.pick(DEP8); const sol = SOL8[d.k];
      const ts = [null, Arb.N(7)]; for (let i = 0; i < 4; i++) ts.push(Arb.aleatorio(rng, rng.int(3, 8), { valores: rng.distinct(8, 1, 40), balance: rng.chance(0.5) }));
      let ch = null; for (const v of rng.distinct(5, 1, 40)) ch = { v, l: ch, r: null }; ts.push(ch);
      const calc = t => d.fn === 'altura' ? Arb.altura(t) : (d.fn === 'contar_hojas' ? Arb.hojas(t) : Arb.pre(t).reduce((s, x) => s + x, 0));
      let tests;
      if (d.fn === 'profundidad') {
        tests = []; const { arbol: t } = Arb.bstAleatorio(rng, 7, 5, 60, rng.chance(0.5)); const vs = Arb.ino(t);
        vs.slice(0, 3).forEach(v => tests.push({ e: `profundidad(${K.pyN(t)}, ${v})`, r: String(Arb.profundidades(t).get(String(v))) })); tests.push({ e: `profundidad(${K.pyN(t)}, 99)`, r: '-1' }, { e: 'profundidad(None, 3)', r: '-1' });
      } else tests = ts.map(t => ({ e: `${d.fn}(${K.pyN(t)})`, r: String(calc(t)) }));
      return {
        tipo: 'codigo', modoEj: 'depurar', fn: d.fn, cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: 'Esta función recursiva sobre árboles tiene un error. Encuéntralo y corrígelo. *(Recuerda las convenciones del curso: altura en aristas, hoja = 0, árbol vacío = −1.)*', codigoVista: K.CLASE_NODO,
        starter: d.start, solucion: sol, tests, reglas: [{ t: 'recursiva', fn: d.fn }], ejemploLlamada: d.fn === 'profundidad' ? 'profundidad(N(5, N(3), N(8)), 3)' : d.fn + '(N(5, N(3), None))', pistas: d.p, explicacion: '**Error:** ' + d.bug + '\n```\n' + sol + '\n```'
      };
    }
  });

  /* ---------- 4. BST vs AVL con la misma secuencia ---------- */
  B({
    id: 'n8-bst-avl', n: 8, e: 'B', dif: 4, c: ['in_bst_avl', 'bs_ordenins', 'av_insertar'], tema: 'Construir y balancear',
    gen(rng, K) {
      let vals, r;
      for (let i = 0; i < 100; i++) { vals = rng.chance(0.6) ? rng.distinct(rng.int(6, 7), 5, 80).sort((a, b) => a - b) : rng.distinct(rng.int(6, 7), 5, 80); r = Arb.construirAVL(vals); if (r.hist.some(h => h.pasos.length)) break; }
      const bst = Arb.insertarSecuencia(vals); const rot = r.hist.reduce((s, h) => s + h.pasos.length, 0);
      return {
        tipo: 'mixta', enunciado: 'Se insertan los valores **' + K.coma(vals) + '** (en ese orden), primero en un **BST** y luego en un **AVL**.',
        partes: [
          { titulo: 'BST', peso: 1, q: { tipo: 'arbol', enunciado: 'Escribe el **BST** resultante.', esperado: bst, verificar: { bst: true } } },
          { titulo: 'Altura BST', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Qué altura tiene ese BST?', esperado: String(Arb.altura(bst)) } },
          { titulo: 'AVL', peso: 2, q: { tipo: 'arbol', enunciado: 'Escribe el **AVL** resultante (rebalanceando con rotaciones).', esperado: r.arbol, verificar: { bst: true, avl: true } } },
          { titulo: 'Rotaciones', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: 'Total de rotaciones simples individuales hechas al construir el AVL (una doble = 2):', esperado: String(rot) } }
        ],
        pistas: ['Construye el BST normalmente; mide su altura en aristas.', 'Para el AVL, tras cada inserción revisa factores de abajo hacia arriba y rota solo cuando aparezca ±2.', 'El AVL debe tener altura ≈ log₂ n incluso si los datos llegan ordenados.'],
        explicacion: 'BST: ' + Arb.nota(bst) + ' (altura ' + Arb.altura(bst) + '). AVL: ' + Arb.nota(r.arbol) + ' (altura ' + Arb.altura(r.arbol) + ', ' + rot + ' rotaciones).'
      };
    }
  });

  /* ---------- 5. Implementar ArbolBST ---------- */
  const SOL_CLASE = U.dedent(`
    class ArbolBST:
        def __init__(self):
            self.raiz = None
        def insertar(self, v):
            self.raiz = self._ins(self.raiz, v)
        def _ins(self, nodo, v):
            if nodo is None:
                return NodoArbol(v)
            if v < nodo.valor:
                nodo.izq = self._ins(nodo.izq, v)
            elif v > nodo.valor:
                nodo.der = self._ins(nodo.der, v)
            return nodo
        def buscar(self, v):
            n = self.raiz
            while n is not None:
                if v == n.valor:
                    return True
                n = n.izq if v < n.valor else n.der
            return False
        def altura(self):
            return self._alt(self.raiz)
        def _alt(self, nodo):
            if nodo is None:
                return -1
            return 1 + max(self._alt(nodo.izq), self._alt(nodo.der))
        def inorden(self):
            salida = []
            self._ino(self.raiz, salida)
            return salida
        def _ino(self, nodo, salida):
            if nodo is None:
                return
            self._ino(nodo.izq, salida)
            salida.append(nodo.valor)
            self._ino(nodo.der, salida)
  `);
  B({
    id: 'n8-impl-arbolbst', n: 8, e: 'C', dif: 5, c: ['in_bst_avl', 'bs_insertar', 'bs_buscar', 'ar_profalt', 'tv_in'], tema: 'Clase ArbolBST completa',
    gen(rng, K) {
      const tests = [];
      for (let i = 0; i < 4; i++) {
        const n = rng.int(0, 8); const vals = []; for (let k = 0; k < n + 2; k++) vals.push(rng.int(5, 40)); const t = Arb.insertarSecuencia(vals); const dis = Arb.ino(t); const x = rng.pick(dis), y = 99;
        const c = `construir_bst(${JSON.stringify(vals)})`;
        tests.push({ e: `${c}.inorden()`, r: JSON.stringify(dis) }, { e: `${c}.altura()`, r: String(Arb.altura(t)) }, { e: `${c}.buscar(${x})`, r: 'True' }, { e: `${c}.buscar(${y})`, r: 'False' });
      }
      tests.push({ e: 'ArbolBST().altura()', r: '-1' }, { e: 'ArbolBST().inorden()', r: '[]' });
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: null, cls_arbol: true, prelude: K.PRE_ARBOL + '\n' + U.dedent(`
          def construir_bst(vals):
              a = ArbolBST()
              for v in vals:
                  a.insertar(v)
              return a
        `),
        enunciado: 'Implementa la clase **`ArbolBST`** (usa `NodoArbol`, ya definido) con:\n\n- `__init__()`: árbol vacío (`self.raiz = None`).\n- `insertar(v)`: inserta `v` (sin duplicados).\n- `buscar(v)`: `True` si está, `False` si no.\n- `altura()`: altura en aristas (árbol vacío = −1).\n- `inorden()`: lista con los valores en orden ascendente.\n\nPuedes añadir métodos auxiliares recursivos.', codigoVista: K.CLASE_NODO,
        starter: 'class ArbolBST:\n    def __init__(self):\n        self.raiz = None\n\n    # agrega tus métodos aquí', solucion: SOL_CLASE, tests, reglas: [], ejemploLlamada: 'construir_bst([5, 3, 8]).inorden()',
        pistas: ['Cada operación puede apoyarse en una función recursiva auxiliar que recibe un nodo (como `_ins(nodo, v)`).', 'insertar: `self.raiz = self._ins(self.raiz, v)` (reasigna la raíz). altura: caso base `None → −1`. inorden: recorre izq, agrega valor, recorre der.', 'buscar puede ser iterativo: baja por la izquierda o la derecha según la comparación.'],
        explicacion: '```\n' + SOL_CLASE + '\n```\nOperaciones O(h); inorden O(n).'
      };
    }
  });

  /* ---------- 6. es_avl ---------- */
  const SOL_ESAVL = `def es_avl(nodo):\n    def altura(n):\n        if n is None:\n            return -1\n        return 1 + max(altura(n.izq), altura(n.der))\n    if nodo is None:\n        return True\n    if abs(altura(nodo.izq) - altura(nodo.der)) > 1:\n        return False\n    return es_avl(nodo.izq) and es_avl(nodo.der)`;
  B({
    id: 'n8-impl-es-avl', n: 8, e: 'C', dif: 5, c: ['av_factor', 'av_altura', 'rc_impl', 'ar_profalt'], tema: 'Verificar el equilibrio AVL',
    gen(rng, K) {
      const ts = [null, Arb.N(5)];
      for (let i = 0; i < 3; i++) ts.push(Arb.construirAVL(rng.distinct(rng.int(4, 8), 5, 80)).arbol);
      for (let i = 0; i < 4; i++) ts.push(Arb.aleatorio(rng, rng.int(4, 8), { valores: rng.distinct(8, 1, 40), balance: false }));
      ts.push(Arb.insertarSecuencia([1, 2, 3, 4]), Arb.insertarSecuencia([20, 10, 30, 5, 15, 25]));
      const tests = ts.map(t => ({ e: `es_avl(${K.pyN(t)})`, r: Arb.desbalanceados(t).length === 0 ? 'True' : 'False' }));
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: 'es_avl', cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: 'Escribe `es_avl(nodo)` que devuelva `True` si en **todos los nodos** del árbol se cumple `|altura(izq) − altura(der)| ≤ 1` (condición de equilibrio AVL; no hace falta comprobar el orden de BST) y `False` en caso contrario. Recuerda: altura del árbol vacío = −1; hoja = 0.', codigoVista: K.CLASE_NODO,
        starter: 'def es_avl(nodo):\n    # tu código aquí\n    pass', solucion: SOL_ESAVL, tests, reglas: [{ t: 'recursiva', fn: 'es_avl' }], ejemploLlamada: 'es_avl(N(2, N(1), N(3)))',
        pistas: ['Necesitas la altura de los subárboles: escribe (o define dentro) una función `altura(n)` con `None → −1`.', 'Un árbol es AVL si su raíz cumple la condición **y** sus dos subárboles también la cumplen.', 'Tres casos: árbol vacío → `True`; diferencia de alturas > 1 → `False`; en otro caso `es_avl(izq) and es_avl(der)`.'],
        explicacion: '```\n' + SOL_ESAVL + '\n```\nEsta versión recalcula alturas: O(n²) en el peor caso; una versión que devuelve la altura (o un centinela) es O(n).'
      };
    }
  });

  /* ---------- 7. Complejidad integral ---------- */
  B({
    id: 'n8-complejidad-integral', n: 8, e: 'B', dif: 4, c: ['in_analisis', 'cx_ciclos', 'cx_recursivo', 'bs_altura'], tema: 'Tres algoritmos, tres costos',
    gen(rng, K) {
      const A = `def f(v):\n    c = 0\n    for i in range(len(v)):\n        for j in range(i, len(v)):\n            c += v[i] * v[j]\n    return c`;
      const Bc = `def g(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n < 2:\n        return n\n    if n not in memo:\n        memo[n] = g(n - 1, memo) + g(n - 2, memo)\n    return memo[n]`;
      const Cc = `def h(nodo, v):\n    while nodo is not None:\n        if v == nodo.valor:\n            return True\n        nodo = nodo.izq if v < nodo.valor else nodo.der\n    return False`;
      return {
        tipo: 'mixta', enunciado: 'Determina la complejidad **temporal** (peor caso) de cada algoritmo. En `f`, n = len(v); en `g`, n es el argumento; en `h`, el árbol es un BST de n nodos y altura h.',
        codigos: [{ titulo: 'f', codigo: A }, { titulo: 'g', codigo: Bc }, { titulo: 'h', codigo: Cc }],
        partes: [
          { titulo: 'f', peso: 1, q: { tipo: 'bigo', enunciado: 'Complejidad temporal de `f(v)`:', tiempo: 'n2', escala: ['logn', 'n', 'nlogn', 'n2', 'h', '2n'] } },
          { titulo: 'g', peso: 1, q: { tipo: 'bigo', pideEspacio: true, enunciado: 'Tiempo y espacio de `g(n)`:', tiempo: 'n', espacio: 'n', escala: ['logn', 'n', 'nlogn', 'n2', 'h', '2n'], etqS: 'Espacio' } },
          { titulo: 'h', peso: 1, q: { tipo: 'bigo', pideEspacio: true, enunciado: 'Tiempo y espacio extra de `h(nodo, v)`:', tiempo: 'h', espacio: '1', escala: ['1', 'logn', 'n', 'h', 'n2'], etqS: 'Espacio extra' } }
        ],
        pistas: ['f: ciclos anidados con interno dependiente de i (n(n+1)/2 iteraciones).', 'g: con memoización cada valor se calcula una vez; la caché y la pila crecen con n.', 'h: baja por un solo camino; la complejidad depende de la altura h y no usa estructuras auxiliares.'],
        explicacion: 'f: O(n²); g: O(n) tiempo y O(n) espacio; h: O(h) tiempo y O(1) espacio extra (O(log n) si el árbol está balanceado).'
      };
    }
  });

  /* ---------- 8. Justificar la estructura de datos ---------- */
  B({
    id: 'n8-justifica-estructura', n: 8, e: 'C', dif: 4, c: ['in_justificar', 'bs_hash', 'av_compara'], tema: 'Elegir estructura de datos',
    gen(rng, K) {
      return {
        tipo: 'abierta', fmt: 'Pregunta de razonamiento', enunciado: 'Un juego debe mantener un **ranking dinámico de puntajes**: se consulta **ordenado** muy seguido y llegan **nuevos puntajes con frecuencia** (incluso ya ordenados). ¿Qué estructura elegirías (lista ordenada, tabla hash, BST, AVL)? **Justifica** con la complejidad de las operaciones y explica qué problema evitas.',
        criterios: [
          { desc: 'Elige un **árbol de búsqueda balanceado** (AVL / BST balanceado).', claves: ['avl', 'balancead', 'auto-balance', 'autobalance', 'rojo'] },
          { desc: 'Justifica el **orden**: el recorrido **inorden** entrega los puntajes ordenados sin costo extra.', claves: ['inorden', ['ordenad', 'recorrido'], ['orden', 'sin costo']] },
          { desc: 'Menciona la **inserción eficiente O(log n)** frente a O(n) de insertar en una lista/arreglo ordenado.', claves: ['o(log n)', 'log n', ['lista', 'o(n)'], ['arreglo', 'o(n)'], ['inserc', 'eficiente']] },
          { desc: 'Explica el riesgo de **degeneración** si llegan ordenados (BST normal → lista, O(n)) y que el balanceo lo evita.', claves: ['degener', ['ordenad', 'lista'], ['ordenad', 'altura', 'n'], ['rotacion'], ['balance', 'evita']] },
          { desc: 'Descarta la **tabla hash** porque no mantiene el orden.', claves: [['hash', 'no', 'orden'], ['hash', 'sin orden'], ['hash', 'orden']] }
        ],
        modelo: 'Elegiría un **BST auto-balanceado (AVL)**: el recorrido **inorden** entrega los puntajes **ordenados** sin costo extra y la inserción, búsqueda y eliminación cuestan **O(log n)** (insertar en una lista ordenada cuesta O(n)). Si los puntajes llegan ya ordenados, un BST normal **degenera** en una lista (O(n)); el AVL lo evita con **rotaciones**. La **tabla hash** se descarta porque no mantiene el orden.',
        pistas: ['Piensa en las dos operaciones que importan: insertar y recorrer en orden.', 'Qué pasa con un BST común cuando los datos llegan ordenados.', 'Compara con la lista ordenada (inserción O(n)) y con la tabla hash (sin orden).'],
        explicacion: 'Actividad en parejas de S6-C2 (diap. 15) llevada a AVL (S7-C1).'
      };
    }
  });

  /* ---------- 9. Reconstruir, medir y balancear ---------- */
  B({
    id: 'n8-reconstruir-balancear', n: 8, e: 'C', dif: 5, c: ['tv_reconstruir', 'in_bst_avl', 'av_factor', 'av_insertar'], tema: 'Reconstruir, evaluar y balancear',
    gen(rng, K) {
      let vals, bst, av;
      for (let i = 0; i < 100; i++) { vals = rng.distinct(rng.int(6, 7), 5, 70); bst = Arb.insertarSecuencia(vals); if (Arb.desbalanceados(bst).length) break; }
      const pr = Arb.pre(bst), io = Arb.ino(bst), esAvl = Arb.desbalanceados(bst).length === 0; const av2 = Arb.construirAVL(pr).arbol; const bad = Arb.desbalanceados(bst);
      return {
        tipo: 'mixta', enunciado: 'Un BST tiene estos recorridos:\n\n- **Preorden:** `' + J(pr) + '`\n- **Inorden:** `' + J(io) + '`',
        partes: [
          { titulo: 'Reconstruir', peso: 2, q: { tipo: 'arbol', enunciado: 'Reconstruye el árbol (notación `valor(izq,der)`).', esperado: bst, verificar: { bst: true } } },
          { titulo: 'Altura', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuál es su altura?', esperado: String(Arb.altura(bst)) } },
          { titulo: '¿AVL?', peso: 1, q: { tipo: 'opcion', enunciado: '¿Es un árbol AVL?', opciones: [{ t: 'Sí, todos los nodos cumplen |factor| ≤ 1.', ok: esAvl, why: esAvl ? 'Correcto.' : 'Hay nodos con |factor| ≥ 2.' }, { t: 'No: al menos un nodo tiene |factor| ≥ 2.', ok: !esAvl, why: !esAvl ? 'Correcto: nodo ' + (bad[0] ? bad[0].v : '') + ' con factor ' + (bad[0] ? Arb.factor(bad[0]) : '') + '.' : 'Todos cumplen |factor| ≤ 1.' }] } },
          { titulo: 'Balancear', peso: 2, q: { tipo: 'arbol', enunciado: 'Inserta los mismos valores, **en el orden del preorden**, en un **AVL** vacío. Escribe el AVL resultante.', esperado: av2, verificar: { bst: true, avl: true } } }
        ],
        conceptos: ['tv_reconstruir', 'av_factor', 'av_insertar'],
        pistas: ['La raíz es el primer elemento del preorden; el inorden separa izquierda y derecha.', 'Calcula las alturas de abajo hacia arriba y revisa los factores.', 'Para el AVL inserta uno a uno en el orden dado y rota cuando aparezca ±2.'],
        explicacion: 'BST: ' + Arb.nota(bst) + ' (altura ' + Arb.altura(bst) + ', ' + (esAvl ? 'es AVL' : 'no es AVL') + '). AVL con el mismo preorden: ' + Arb.nota(av2) + '.'
      };
    }
  });

  /* ---------- 10. Fibonacci completo ---------- */
  B({
    id: 'n8-fib-completo', n: 8, e: 'C', dif: 5, c: ['pd_memo', 'rc_fib', 'cx_recursivo', 'in_analisis'], tema: 'Fibonacci: del análisis a la implementación',
    gen(rng, K) {
      const n = rng.int(6, 9); const ing = `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`;
      const a = K.llamadas(ing, `fib(${n})`, 'fib');
      const fibJS = k => { let x = 0, y = 1; for (let i = 0; i < k; i++) [x, y] = [y, x + y]; return x; };
      return {
        tipo: 'mixta', enunciado: 'Analiza y mejora la función `fib`.', codigoVista: ing,
        partes: [
          { titulo: 'Llamadas', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuántas llamadas a `fib` se hacen al evaluar `fib(' + n + ')`?', esperado: String(a.n) } },
          { titulo: 'Complejidad ingenua', peso: 1, q: { tipo: 'bigo', enunciado: 'Complejidad temporal de la versión ingenua:', tiempo: '2n', escala: ['logn', 'n', 'nlogn', 'n2', '2n'] } },
          { titulo: 'Diagnóstico', peso: 1, q: { tipo: 'opcion', enunciado: '¿Cuál es la causa de la ineficiencia y qué paradigma la corrige?', opciones: [{ t: 'Subproblemas **solapados** que se recalculan → programación dinámica (memoización).', ok: true, why: 'Es la causa y la solución.' }, { t: 'Subproblemas independientes → divide y vencerás.', ok: false, why: 'Aquí los subproblemas se repiten.' }, { t: 'Falta una poda → backtracking.', ok: false, why: 'No hay restricciones que permitan podar.' }, { t: 'Se elige mal el óptimo local → greedy.', ok: false, why: 'No es un problema de optimización con decisiones locales.' }] } },
          { titulo: 'Implementar', peso: 3, q: { tipo: 'codigo', modoEj: 'codigo', fn: 'fib_memo', enunciado: 'Escribe `fib_memo(n)` con **memoización**. Se probará con n = 32 (la versión ingenua será rechazada por lenta).', starter: 'def fib_memo(n):\n    # tu código aquí\n    pass', solucion: 'def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]', maxSteps: 250000, tests: [0, 1, 10, 30, 32].map(k => ({ e: `fib_memo(${k})`, r: String(fibJS(k)) })), reglas: [{ t: 'noUsa', re: /def\s+\w+\s*\([^)]*=\s*(\{\}|\[\]|dict\(\))/, msg: 'No uses un valor por defecto mutable para la caché.' }], ejemploLlamada: 'fib_memo(10)' } }
        ],
        pistas: ['Cuenta los nodos del árbol de llamadas de fib(' + n + ').', 'El mismo fib(k) aparece muchas veces: eso son subproblemas solapados.', 'Guarda cada resultado en un diccionario y consúltalo antes de calcular.'],
        explicacion: fibJS(n) + ' es fib(' + n + '); la versión ingenua hace ' + a.n + ' llamadas (≈ 2ⁿ); con memoización O(n).'
      };
    }
  });

  /* ---------- 11. Recorridos del AVL final ---------- */
  B({
    id: 'n8-recorridos-avl', n: 8, e: 'B', dif: 4, c: ['in_bst_avl', 'av_insertar', 'tv_pre', 'tv_post'], tema: 'Recorridos de un AVL',
    gen(rng, K) {
      let vals, r;
      for (let i = 0; i < 100; i++) { vals = rng.distinct(rng.int(6, 7), 5, 70); r = Arb.construirAVL(vals); if (r.hist.some(h => h.pasos.length)) break; }
      const t = r.arbol;
      return {
        tipo: 'mixta', enunciado: 'Se insertan en un AVL vacío los valores **' + K.coma(vals) + '**. Sea T el AVL final.',
        partes: [
          { titulo: 'Preorden', peso: 2, q: { tipo: 'salida', tokens: true, enunciado: 'Preorden de T:', esperado: J(Arb.pre(t)) } },
          { titulo: 'Postorden', peso: 2, q: { tipo: 'salida', tokens: true, enunciado: 'Postorden de T:', esperado: J(Arb.post(t)) } },
          { titulo: 'Inorden', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Inorden de T (¿qué propiedad tiene?):', esperado: J(Arb.ino(t)) } },
          { titulo: 'Altura', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: 'Altura de T:', esperado: String(Arb.altura(t)) } }
        ],
        pistas: ['Construye T con cuidado rotando cuando aparezca un factor ±2.', 'Con T dibujado, aplica el orden de cada recorrido.', 'El inorden de un AVL (que es un BST) está ordenado; úsalo para validar tu árbol.'],
        explicacion: 'T = ' + Arb.nota(t) + '.'
      };
    }
  });

  /* ---------- 12. Tres soluciones para detectar duplicados ---------- */
  B({
    id: 'n8-abierta-duplicados', n: 8, e: 'C', dif: 4, c: ['in_analisis', 'cx_python', 'pd_fb', 'cx_espacial', 'in_justificar'], tema: 'Detectar duplicados: tres soluciones',
    gen(rng, K) {
      return {
        tipo: 'abierta', fmt: 'Pregunta de razonamiento', enunciado: 'Se quiere saber si una lista de **n números** tiene elementos repetidos. Describe **tres soluciones** (fuerza bruta, ordenando, usando un `set`), da su **complejidad temporal y espacial** y di cuándo usarías cada una.',
        criterios: [
          { desc: 'Fuerza bruta: compara **todos los pares**, tiempo **O(n²)** y espacio O(1).', claves: [['pares', 'n2'], ['pares', 'n²'], ['pares', 'cuadr'], ['fuerza bruta', 'o(n'], ['doble', 'ciclo']] },
          { desc: 'Ordenando: tras **ordenar** (O(n log n)) se revisan **adyacentes** (O(n)); total O(n log n).', claves: [['ordenar', 'adyacente'], ['ordena', 'n log n'], ['sort', 'n log n'], ['ordenar', 'vecino'], ['ordenar', 'consecutivo']] },
          { desc: 'Con `set`: un solo recorrido, tiempo **O(n)**, pero **memoria extra O(n)**.', claves: [['set', 'o(n)'], ['set', 'lineal'], ['conjunto', 'o(n)'], ['hash', 'o(n)'], ['set', 'memoria']] },
          { desc: 'Indica un criterio para elegir (compromiso **tiempo–espacio**, tamaño de n, memoria disponible).', claves: ['compromiso', ['memoria', 'tiempo'], ['n pequeno'], ['n grande'], 'depende', 'limitad'] }
        ],
        modelo: '**Fuerza bruta**: comparar todos los pares: tiempo **O(n²)**, espacio **O(1)** (sirve para n pequeño). **Ordenando**: tras ordenar (**O(n log n)**) se comparan elementos **adyacentes** (O(n)); espacio O(n) si se copia (O(1) si se ordena en el sitio). **Con un set**: un recorrido guardando lo visto, tiempo **O(n)** y **memoria extra O(n)**. Es el compromiso **tiempo–espacio**: con memoria limitada y n moderado, ordenar; con n grande y memoria suficiente, el set.',
        pistas: ['Para cada solución piensa en cuántas operaciones y cuánta memoria adicional usa.', 'Recuerda los costos de Python: `x in lista` O(n), `x in set` O(1), `sort()` O(n log n).', 'Cierra con una recomendación: ¿qué sacrificas en cada caso?'],
        explicacion: 'Integra S2-C1 (compromiso tiempo–espacio, costos de Python) y S5-C2 (fuerza bruta vs. estructuras auxiliares).'
      };
    }
  });

  /* ---------- 13. Trazado integral de código sobre un árbol ---------- */
  B({
    id: 'n8-trazado-integral', n: 8, e: 'C', dif: 5, c: ['ar_nodo', 'ar_profalt', 'tv_pre', 'rc_traza', 'in_analisis'], tema: 'Trazar código que construye y recorre un árbol',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { valores: rng.distinct(n, 1, 9) });
      const lineas = ['raiz = NodoArbol(' + t.v + ')'];
      (function rec(nd, ruta) { for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) if (h) lineas.push(ruta + '.' + lado + ' = NodoArbol(' + h.v + ')'); for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) if (h) rec(h, ruta + '.' + lado); })(t, 'raiz');
      const funcs = `def altura(nodo):\n    if nodo is None:\n        return -1\n    return 1 + max(altura(nodo.izq), altura(nodo.der))\n\ndef recorrer(nodo, salida):\n    if nodo is None:\n        return\n    recorrer(nodo.izq, salida)\n    recorrer(nodo.der, salida)\n    salida.append(nodo.valor)\n\ndef suma(nodo):\n    if nodo is None:\n        return 0\n    return nodo.valor + suma(nodo.izq) + suma(nodo.der)`;
      const code = K.CLASE_NODO + '\n' + lineas.join('\n') + '\n\n' + funcs + '\n\ns = []\nrecorrer(raiz, s)\nprint(altura(raiz))\nprint(s)\nprint(suma(raiz))';
      const salida = K.run(code).split('\n');
      return {
        tipo: 'mixta', enunciado: 'El siguiente programa construye un árbol y lo recorre. Responde qué imprime cada `print` (en orden).', codigoVista: code,
        partes: [
          { titulo: 'altura', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: 'Primer `print` (altura de la raíz):', esperado: salida[0] } },
          { titulo: 'recorrido', peso: 2, q: { tipo: 'salida', tokens: true, enunciado: 'Segundo `print` (la lista `s`; ¿qué recorrido implementa `recorrer`?):', esperado: salida[1] } },
          { titulo: 'suma', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: 'Tercer `print` (suma de todos los valores):', esperado: salida[2] } },
          { titulo: 'tipo', peso: 1, q: { tipo: 'opcion', enunciado: '¿Qué recorrido implementa `recorrer`?', opciones: [{ t: 'Preorden', ok: false, why: 'En preorden la raíz va primero.' }, { t: 'Inorden', ok: false, why: 'En inorden la raíz va entre los subárboles.' }, { t: 'Postorden', ok: true, why: 'Agrega el valor después de recorrer ambos subárboles.' }, { t: 'Por niveles', ok: false, why: 'No usa cola.' }] } }
        ],
        pistas: ['Dibuja el árbol que construyen las asignaciones (`raiz.izq`, `raiz.der`, …).', 'Altura en aristas (hoja = 0). `recorrer` agrega el valor después de las dos llamadas.', 'La suma es independiente del recorrido.'],
        explicacion: 'Salida:\n```\n' + salida.join('\n') + '\n```'
      };
    }
  });
  /* ---------- A: conceptos transversales ---------- */
  const CONC8 = [
    ['Caso base y fórmula recursiva', 0], ['Pila de llamadas y `RecursionError`', 0], ['Contar cuántas veces se llama a una función recursiva', 0],
    ['T(n) ∈ O(g(n)) exhibiendo c y n₀', 1], ['Razón de duplicación T(2n)/T(n)', 1], ['Costo real de `x in lista` frente a `x in set`', 1], ['Complejidad espacial y compromiso tiempo–espacio', 1],
    ['Subproblemas solapados', 2], ['Memoización y tabulación', 2], ['Contraejemplo de greedy con monedas {1,3,4}', 2], ['Divide, vence y combina', 2],
    ['Propiedad izq < nodo < der y operaciones O(h)', 3], ['Eliminación con 0, 1 o 2 hijos y predecesor inorden', 3], ['Recorridos preorden, inorden y postorden', 3],
    ['Factor de balance |altura(izq) − altura(der)| ≤ 1', 4], ['Rotaciones simples y dobles (LL, RR, LR, RL)', 4], ['Altura del árbol vacío = −1 y recalcular alturas por el camino', 4]
  ];
  B({
    id: 'n8-conceptos', n: 8, e: 'A', dif: 2, c: ['in_justificar', 'pd_cinco', 'cx_formal', 'rc_def'], tema: '¿De qué tema es?',
    gen(rng, K) {
      const items = rng.sample(CONC8, 6).map(c => ({ t: c[0], cat: c[1], why: ['Recursión (nivel 1).', 'Complejidad / Big O (nivel 2).', 'Paradigmas algorítmicos (nivel 3).', 'Árboles, recorridos y BST (niveles 4-6).', 'AVL y balanceo (nivel 7).'][c[1]] }));
      return {
        tipo: 'clasificar', enunciado: 'Ubica cada concepto en el **bloque del curso** al que pertenece.', categorias: ['Recursión', 'Complejidad y Big O', 'Paradigmas', 'Árboles y BST', 'AVL'], items,
        pistas: ['Piensa en la clase donde lo viste: recursión, análisis asintótico, paradigmas, árboles/BST o balanceo.', 'Palabras clave: «pila», «c y n₀», «solapados», «inorden», «factor de balance».', 'Si un concepto aparece en dos bloques, elige el que lo introduce.'],
        explicacion: 'Mapa del curso: recursión → complejidad → paradigmas → árboles → recorridos → BST → AVL.'
      };
    }
  });

  const VF8 = [
    { a: 'Un BST que recibe sus valores ya ordenados tiene búsqueda O(n), mientras que un AVL con los mismos valores mantiene búsqueda O(log n).', v: true, e: 'El BST degenera en una lista; el AVL rebalancea con rotaciones.', j: ['El BST degenera (altura n−1) y el AVL mantiene |factor| ≤ 1 con rotaciones.', 'El AVL guarda los valores en una tabla hash.', 'Ambos cuestan siempre O(log n).'] },
    { a: 'Fibonacci con memoización mejora el costo de O(2ⁿ) a O(n) pero gasta O(n) de memoria adicional.', v: true, e: 'Es el compromiso tiempo–espacio: cada valor se calcula una vez.', j: ['Cada subproblema se calcula una vez y se guarda en la caché (O(n) de memoria).', 'No usa memoria adicional.', 'La memoización hace que fib sea O(1).'] },
    { a: 'El recorrido inorden entrega los datos ordenados en cualquier árbol binario.', v: false, e: 'Solo en un BST.', j: ['La propiedad izq < nodo < der solo se garantiza en un BST.', 'En todo árbol la raíz está entre sus hijos.', 'El inorden ordena siempre porque visita todos los nodos.'] },
    { a: 'Una función recursiva correcta siempre necesita al menos un caso base y una llamada que se acerque a él.', v: true, e: 'Sin ambos, la recursión no termina.', j: ['Sin caso base o sin avance hacia él se agota la pila.', 'El caso base solo es necesario en funciones con listas.', 'Basta con que la función termine con un `return`.'] },
    { a: 'Para un problema de optimización, un algoritmo greedy es siempre la mejor opción por ser el más rápido.', v: false, e: 'Greedy no siempre da el óptimo (p. ej. monedas {1,3,4}).', j: ['La elección local no garantiza el óptimo global en todos los problemas.', 'Greedy es más lento que fuerza bruta.', 'Greedy siempre explora todas las combinaciones.'] },
    { a: 'Un árbol con N nodos tiene N − 1 aristas y, si es perfecto de altura h, N = 2^(h+1) − 1.', v: true, e: 'Cada nodo salvo la raíz tiene un padre.', j: ['Cada nodo excepto la raíz aporta una arista hacia su padre; el nivel k tiene 2^k nodos.', 'N aristas siempre porque cada nodo tiene una.', 'N = 2h + 1.'] },
    { a: 'Una inserción en un AVL puede hacer varias rotaciones en cadena hasta la raíz.', v: false, e: 'A lo sumo una (simple o doble). El borrado sí puede requerir varias.', j: ['Una rotación restaura la altura que tenía el subárbol antes de insertar.', 'Cada ancestro hace una rotación.', 'Depende del lenguaje.'] }
  ];
  B({
    id: 'n8-vf', n: 8, e: 'A', dif: 3, c: ['in_justificar', 'in_bst_avl', 'pd_memo'], tema: 'Verdadero/Falso integrador',
    gen(rng, K) {
      const it = rng.pick(VF8);
      return {
        tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón correcta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Identifica a qué tema(s) del curso se refiere la afirmación.', 'Busca un contraejemplo pequeño si dudas.', 'Cuidado con «siempre», «nunca» y «cualquier».']
      };
    }
  });

  B({
    id: 'n8-lee-codigo-arbol', n: 8, e: 'A', dif: 3, c: ['ar_nodo', 'ar_profalt', 'rc_traza', 'tv_pre'], tema: 'Leer código sobre un árbol',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { valores: rng.distinct(n, 1, 9) });
      const lineas = ['raiz = NodoArbol(' + t.v + ')'];
      (function rec(nd, ruta) { for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) if (h) lineas.push(ruta + '.' + lado + ' = NodoArbol(' + h.v + ')'); for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) if (h) rec(h, ruta + '.' + lado); })(t, 'raiz');
      const fams = [
        { f: `def f(nodo):\n    if nodo is None:\n        return -1\n    return 1 + max(f(nodo.izq), f(nodo.der))`, q: 'la altura del árbol (en aristas)' },
        { f: `def f(nodo):\n    if nodo is None:\n        return 0\n    if nodo.izq is None and nodo.der is None:\n        return 1\n    return f(nodo.izq) + f(nodo.der)`, q: 'el número de hojas' },
        { f: `def f(nodo):\n    if nodo is None:\n        return 0\n    return nodo.valor + f(nodo.izq) + f(nodo.der)`, q: 'la suma de los valores' },
        { f: `def f(nodo):\n    if nodo is None:\n        return 0\n    return 1 + f(nodo.izq) + f(nodo.der)`, q: 'el número de nodos' }
      ];
      const fam = rng.pick(fams); const code = K.CLASE_NODO + '\n' + lineas.join('\n') + '\n\n' + fam.f + '\n\nprint(f(raiz))'; const esp = K.run(code);
      return {
        tipo: 'salida', numerico: true, stdout: true, enunciado: 'El programa construye un árbol y aplica una función recursiva. ¿Qué imprime? *(Dibuja el árbol que construyen las asignaciones y sigue la recursión.)*', codigoVista: code, esperado: esp, placeholder: 'Un número',
        pistas: ['Dibuja primero el árbol: `raiz.izq` es el hijo izquierdo y `raiz.der` el derecho.', 'Lee la función: ¿qué devuelve para `None`? ¿cómo combina los resultados de los hijos?', 'Aplica la función de abajo hacia arriba, empezando por las hojas.'],
        explicacion: 'La función calcula ' + fam.q + ': **' + esp + '**. Árbol: ' + Arb.nota(t) + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
