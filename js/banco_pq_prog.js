/* banco_pq_prog.js — «programación con casos borde» (pregunta 5 del parcial): funciones que deben cubrir los casos de borde
   (vacío, un nodo, el valor ausente, los cuatro casos de eliminación…), con reglas del enunciado («no use listas auxiliares»),
   un literal de estado (qué árbol queda, cuántas comparaciones) y la explicación de la complejidad. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, Arb = ET.Arb, Py = ET.Py, B = ET.Banco.add, K = ET.Kit, PQ = ET.PQ, cr = PQ.cr;
  const cod = U.dedent;
  const parteC = (clave, titulo, peso, q) => ({ clave, titulo, peso, q });
  const abierta = (enun, crit, modelo, filas) => ({ tipo: 'abierta', enunciado: enun, criterios: crit.map(c => cr(...c)), modelo, filas: filas || 4 });
  const T = t => ({ t });
  const inp = (...alts) => ({ in: alts, w: 8 });
  const tabla = (enun, cols, filas) => ({ tipo: 'tabla', enunciado: enun, cols, filas });
  const CLASE = K.CLASE_NODO;
  const PIST_PROG = [
    'Antes de escribir código, **lista los casos borde** del enunciado y decide qué debe devolver tu función en cada uno (vacío, un elemento, valor ausente…).',
    'Escribe primero el **caso base** y luego la fórmula recursiva; comprueba a mano con el caso más pequeño y con uno intermedio.',
    'Respeta las **reglas del enunciado** (sin listas auxiliares, sin bucles, sin rebanadas…): se revisan automáticamente y bajan el puntaje si se incumplen.'
  ];

  /** registra la versión completa (C) y una corta (B) con las claves indicadas */
  function prog(def) {
    [['C', false], ['B', true]].concat(def.liteA ? [['A', true]] : []).forEach(([e, lite]) => {
      B({
        id: def.id + '-' + e, n: def.n, e, dif: e === 'A' ? 2 : (lite ? Math.max(3, def.dif - 2) : def.dif), c: def.c, tema: 'Parcial: programación — ' + def.tema + (lite ? ' (corta)' : ''), parcial: !lite, slot: 'prog',
        gen(rng) {
          const q = def.gen(rng);
          if (lite) { q.partes = q.partes.filter(p => (e === 'A' ? def.liteA : def.lite).includes(p.clave)); q.valor = U.sum(q.partes.map(p => p.peso)); q.enunciado += '\n\n*(Versión corta: solo algunos literales.)*'; }
          else q.valor = 1;
          q.partes.forEach(p => { delete p.clave; });
          q.tipo = 'mixta'; q.fmt = 'Parcial · Programación'; q.cat = 'implementacion'; q.pistas = PIST_PROG;
          return q;
        }
      });
    });
  }

  /* =========================================================================================
     1) BST: insertar y eliminar (los cuatro casos), estado tras eliminar y complejidad
     ========================================================================================= */
  prog({
    id: 'pq-prog-bst', n: 6, dif: 5, c: ['bs_insertar', 'bs_eliminar', 'bs_altura', 'bs_minmax'], tema: 'BST: insertar y eliminar', lite: ['a', 'd'],
    gen(rng) {
      const vals = rng.distinct(7, 10, 90);
      const t = Arb.insertarSecuencia(rng.shuffle(vals));
      const dos = rng.pick(Arb.nodos(t).filter(n => n.l && n.r)); const x = dos.v;
      const tdel = Arb.delBST(t, x, 'pred'); const camino = Arb.camino(t, x);
      const solIns = cod(`
        def insertar(raiz, valor):
            if raiz is None:
                return NodoArbol(valor)
            if valor < raiz.valor:
                raiz.izq = insertar(raiz.izq, valor)
            elif valor > raiz.valor:
                raiz.der = insertar(raiz.der, valor)
            return raiz
      `);
      const solDel = cod(`
        def eliminar(raiz, valor):
            if raiz is None:
                return None
            if valor < raiz.valor:
                raiz.izq = eliminar(raiz.izq, valor)
            elif valor > raiz.valor:
                raiz.der = eliminar(raiz.der, valor)
            else:
                if raiz.izq is None:
                    return raiz.der
                if raiz.der is None:
                    return raiz.izq
                p = raiz.izq
                while p.der is not None:
                    p = p.der
                raiz.valor = p.valor
                raiz.izq = eliminar(raiz.izq, p.valor)
            return raiz
      `);
      const base = K.PRE_ARBOL;
      const A = '50(30(20,40),70(60,80))';
      const mk = n => K.pyN(Arb.parse(n));
      const insQ = PQ.codigoQ({
        enun: 'Escriba `insertar(raiz, valor)`: agrega `valor` a un **BST** (nodos `NodoArbol` con `valor`, `izq`, `der`) y **devuelve la raíz**. En este BST **no se insertan valores repetidos** (si ya está, el árbol no cambia). Debe funcionar con el árbol vacío (`raiz = None`).',
        fn: 'insertar', starter: 'def insertar(raiz, valor):\n    # complete aquí\n    pass\n', solucion: solIns, prelude: base, vista: CLASE,
        tests: ['a_nota(insertar(None, 5))', 'a_nota(insertar(N(5), 3))', 'a_nota(insertar(N(5), 8))', 'a_nota(insertar(N(5), 5))', 'a_nota(insertar(' + mk(A) + ', 45))', 'a_nota(insertar(' + mk(A) + ', 60))', 'a_nota(insertar(' + mk(A) + ', 90))', 'a_nota(insertar(' + K.pyN(t) + ', ' + (rng.int(11, 89)) + '))'],
        ejemplo: 'a_nota(insertar(None, 5))'
      });
      const casos = [mk('50(30(20,40),70(60,80))') + ', 20', mk('50(30(20,40),70(60,80))') + ', 30', mk('50(30(20,),70)') + ', 30', mk('50(30(,40),70)') + ', 30', mk('50(30(20,40),70(60,80))') + ', 50', mk('50(30(20,40),70(60,80))') + ', 55', 'None, 5', mk('7') + ', 7', K.pyN(t) + ', ' + x];
      const delQ = PQ.codigoQ({
        enun: 'Escriba `eliminar(raiz, valor)`: elimina el nodo con ese `valor` de un **BST** y **devuelve la raíz resultante**. Debe funcionar en **todos** los casos: árbol vacío o valor ausente (no cambia), nodo **hoja**, nodo con **un solo hijo** (izquierdo o derecho) y nodo con **dos hijos** (reemplácelo por su **predecesor inorden**, el mayor del subárbol izquierdo). **No construya listas de Python auxiliares** ni haga un recorrido inorden completo.',
        fn: 'eliminar', starter: 'def eliminar(raiz, valor):\n    # complete aquí\n    pass\n', solucion: solDel, prelude: base, vista: CLASE,
        tests: casos.map(c => 'a_nota(eliminar(' + c + '))'),
        reglas: [{ t: 'noUsa', re: /\[\s*\]|\blist\(|\.append\(|sorted\(/, msg: 'No construya listas de Python auxiliares ni recorridos completos del árbol para eliminar.' }], ejemplo: 'a_nota(eliminar(N(5, N(3), N(8)), 3))'
      });
      return {
        enunciado: 'Se dispone de la clase de nodos del BST (`NodoArbol`). Trabaje con funciones **recursivas** sobre los nodos.',
        codigoVista: CLASE,
        partes: [
          parteC('a', 'Insertar', 0.3, insQ),
          parteC('b', 'Eliminar', 0.4, delQ),
          parteC('c1', 'Estado tras eliminar', 0.10, { tipo: 'arbol', enunciado: 'Sobre el BST de la figura (arriba), dibuje el resultado de `eliminar(raiz, ' + x + ')` usando el **predecesor inorden**. Escríbalo en notación `valor(izq,der)`.', arbol: t, arbolTitulo: 'BST (raíz = ' + t.v + ')', arbolOpts: { compacto: true }, esperado: tdel, verificar: { bst: true, inorden: false }, placeholder: 'p. ej. 20(10,30)' }),
          parteC('c2', 'Comparaciones', 0.05, { tipo: 'salida', numerico: true, enunciado: 'Al **localizar** el nodo ' + x + ' en ese árbol, ¿con cuántos nodos se compara el valor (la raíz incluida y el propio ' + x + ')?', esperado: String(camino.length), placeholder: 'un número' }),
          parteC('d', 'Complejidad', 0.15, abierta('Indique la complejidad de `eliminar` en el **peor caso** (respecto de qué variable) y **explique por qué no puede ser O(1)**, aunque alguien le entregue directamente la referencia al nodo que se debe eliminar.',
            [['Hay que localizar el nodo bajando por un camino: O(h) comparaciones (h = altura)', 'o(h)', 'altura', 'localizar', 'camino', 'buscar'], ['En el peor caso (árbol degenerado) h = n − 1 → O(n); solo es O(log n) si el árbol está balanceado', 'degenerad', 'o(n)', 'n-1', 'n − 1', 'balancead'], ['Con dos hijos hay que hallar el predecesor (bajar a la derecha) y reenlazar al padre, que el nodo no conoce: no es O(1)', 'predecesor', 'padre', 'reenlaz', 'no conoce', 'enlace']],
            'El costo es **O(h)**, con h la altura del árbol (**O(n)** en el peor caso, un árbol degenerado con h = n − 1; O(log n) solo si está balanceado). **No puede ser O(1)**: hay que **localizar** el nodo bajando por un camino y, si tiene dos hijos, **buscar el predecesor** (bajar siempre a la derecha); además el nodo no conoce a su **padre**, necesario para reenlazar.'))
        ],
        explicacion: 'Eliminar ' + x + ' (dos hijos): se copia el predecesor ' + Arb.maximo(dos.l).v + ' y se elimina ese nodo. Árbol resultante: **' + Arb.nota(tdel) + '**. Comparaciones al localizar: ' + camino.length + ' (' + camino.join(', ') + ').'
      };
    }
  });

  /* =========================================================================================
     2) Recursión: dos funciones con casos borde y reglas (sin bucles, sin rebanadas)
     ========================================================================================= */
  prog({
    id: 'pq-prog-rec', n: 1, dif: 4, c: ['rc_impl', 'rc_base', 'rc_conteo', 'rc_pila', 'cx_recursivo'], tema: 'recursión con casos borde', lite: ['a', 'd'], liteA: ['a'],
    gen(rng) {
      const v = rng.pick(['digitos', 'potencia']);
      let a, b, d, M, llamadasA, enunC, solA, solB;
      if (v === 'digitos') {
        M = rng.pick([4072, 98765, 1000, 7, 56789, 300204]);
        solA = cod(`
          def suma_digitos(n):
              if n < 10:
                  return n
              return n % 10 + suma_digitos(n // 10)
        `);
        solB = cod(`
          def contar(A, x, i=0):
              if i == len(A):
                  return 0
              return (1 if A[i] == x else 0) + contar(A, x, i + 1)
        `);
        llamadasA = String(M).length;
        a = PQ.codigoQ({ enun: 'Escriba `suma_digitos(n)` (con `n` entero **no negativo**) que devuelve la suma de sus dígitos decimales, **de forma recursiva y sin bucles** (`suma_digitos(0) = 0`, `suma_digitos(123) = 6`). Debe cubrir `n = 0`, un solo dígito y números con ceros (p. ej. 1000).', fn: 'suma_digitos', starter: 'def suma_digitos(n):\n    # complete aquí\n    pass\n', solucion: solA, prelude: '', tests: ['suma_digitos(0)', 'suma_digitos(7)', 'suma_digitos(10)', 'suma_digitos(1000)', 'suma_digitos(123)', 'suma_digitos(98765)', 'suma_digitos(300204)'], reglas: [{ t: 'recursiva', fn: 'suma_digitos' }, { t: 'sinBucles', fn: 'suma_digitos' }], ejemplo: 'suma_digitos(123)' });
        b = PQ.codigoQ({ enun: 'Escriba `contar(A, x, i=0)` que devuelve **cuántas veces aparece `x` en la lista `A`**, **de forma recursiva, sin bucles y sin rebanadas** (`A[1:]` copia la lista y es un costo oculto). Use el parámetro `i` como posición actual. Debe cubrir la lista vacía, un valor ausente y varias apariciones.', fn: 'contar', starter: 'def contar(A, x, i=0):\n    # complete aquí\n    pass\n', solucion: solB, prelude: '', tests: ['contar([], 3)', 'contar([3], 3)', 'contar([1, 2, 3], 9)', 'contar([2, 2, 5, 2], 2)', 'contar([7, 7, 7, 7, 7], 7)', 'contar(list(range(200)), 5)'], reglas: [{ t: 'recursiva', fn: 'contar' }, { t: 'sinBucles', fn: 'contar' }, { t: 'noUsa', re: /\[[^\]]*:[^\]]*\]/, msg: 'No use rebanadas (`A[1:]`): copian la lista (costo oculto O(n) por llamada).' }], ejemplo: 'contar([1, 2, 1], 1)' });
        enunC = 'Al ejecutar `suma_digitos(' + M + ')` con **su** implementación (un caso base para `n < 10` y una llamada por cada dígito restante), ¿cuántas llamadas se hacen en total, contando la inicial?';
        d = abierta('Indique la **complejidad de tiempo** y el **espacio de pila** de `contar` respecto de `n = len(A)`, y explique **qué cambiaría si se llamara con `A[1:]`** en vez de pasar el índice `i`.',
          [['Tiempo O(n): una llamada por elemento, trabajo O(1) en cada una', 'o(n)', 'lineal', 'una llamada por', 'o(1)'], ['Espacio de pila O(n): n + 1 marcos activos a la vez', 'pila', 'marcos', 'n+1', 'o(n)'], ['Con A[1:] cada llamada copia la lista (costo oculto O(n)): el tiempo pasaría a O(n²)', 'a[1:]', 'copia', 'oculto', 'n²', 'n2', 'cuadr']],
          '**Tiempo O(n)** (una llamada por elemento con trabajo O(1)) y **espacio de pila O(n)** (n + 1 marcos activos). Con **`A[1:]`** cada llamada **copia** el resto de la lista (costo oculto O(n)), así que el tiempo pasaría a **O(n²)**.');
      } else {
        M = rng.pick([10, 13, 16, 20, 25, 32]);
        solA = cod(`
          def potencia(x, n):
              if n == 0:
                  return 1
              r = potencia(x, n // 2)
              if n % 2 == 0:
                  return r * r
              return r * r * x
        `);
        solB = cod(`
          def maximo(A, i=0):
              if len(A) == 0:
                  return None
              if i == len(A) - 1:
                  return A[i]
              m = maximo(A, i + 1)
              return A[i] if A[i] > m else m
        `);
        let k = 0, n = M; while (true) { k++; if (n === 0) break; n = Math.floor(n / 2); } llamadasA = k;
        a = PQ.codigoQ({ enun: 'Escriba `potencia(x, n)` (con `n` entero **no negativo**) que calcula `xⁿ` **de forma recursiva y sin bucles**, usando que `xⁿ = (x^(n//2))²` (y se multiplica por `x` si `n` es impar). Debe cubrir `n = 0` (`x⁰ = 1`), `n = 1` y exponentes pares e impares.', fn: 'potencia', starter: 'def potencia(x, n):\n    # complete aquí\n    pass\n', solucion: solA, prelude: '', tests: ['potencia(3, 0)', 'potencia(3, 1)', 'potencia(2, 10)', 'potencia(2, 11)', 'potencia(5, 3)', 'potencia(1, 40)', 'potencia(0, 5)'], reglas: [{ t: 'recursiva', fn: 'potencia' }, { t: 'sinBucles', fn: 'potencia' }], ejemplo: 'potencia(2, 10)' });
        b = PQ.codigoQ({ enun: 'Escriba `maximo(A, i=0)` que devuelve el **mayor elemento** de la lista `A`, **de forma recursiva, sin bucles y sin rebanadas**, usando `i` como posición actual. Si la lista está **vacía** devuelve `None`. Debe cubrir un solo elemento, valores negativos y el máximo en el primer o el último lugar.', fn: 'maximo', starter: 'def maximo(A, i=0):\n    # complete aquí\n    pass\n', solucion: solB, prelude: '', tests: ['maximo([])', 'maximo([4])', 'maximo([3, 9, 2])', 'maximo([9, 3, 2])', 'maximo([2, 3, 9])', 'maximo([-5, -2, -9])', 'maximo(list(range(300)))'], reglas: [{ t: 'recursiva', fn: 'maximo' }, { t: 'sinBucles', fn: 'maximo' }, { t: 'noUsa', re: /\[[^\]]*:[^\]]*\]|\bmax\(/, msg: 'No use rebanadas ni la función `max`: la recursión debe recorrer la lista.' }], ejemplo: 'maximo([1, 5, 2])' });
        enunC = 'Al ejecutar `potencia(2, ' + M + ')` con **su** implementación (se llama con `n // 2` hasta llegar a `n = 0`), ¿cuántas llamadas se hacen en total, contando la inicial?';
        d = abierta('Indique la **complejidad de tiempo** de `potencia` respecto de `n` y el **espacio de pila**; luego explique **por qué `maximo` con `A[1:]` sería peor**.',
          [['Tiempo O(log n): el exponente se divide a la mitad en cada llamada', 'log', 'mitad', 'n // 2', 'divide'], ['Espacio de pila O(log n): hay ≈ log₂ n marcos activos', 'pila', 'marcos', 'log'], ['Con A[1:] cada llamada copia la lista (costo oculto O(n)) y el tiempo pasa a O(n²)', 'a[1:]', 'copia', 'oculto', 'n²', 'n2', 'cuadr']],
          '**Tiempo O(log n)** porque el exponente se **divide a la mitad** en cada llamada, y **espacio de pila O(log n)** (≈ log₂ n marcos activos). `maximo` con **`A[1:]`** sería peor: cada llamada **copia** la lista (costo oculto O(n)), lo que lleva el tiempo a **O(n²)**.');
      }
      return {
        enunciado: 'Escriba funciones **recursivas** (sin bucles) y respete las reglas de cada literal.',
        partes: [
          parteC('a', 'Primera función', 0.3, a),
          parteC('b', 'Segunda función', 0.4, b),
          parteC('c', 'Llamadas', 0.15, { tipo: 'salida', numerico: true, enunciado: enunciadoLimpio(enunC), esperado: String(llamadasA), placeholder: 'un número' }),
          parteC('d', 'Complejidad', 0.15, d)
        ],
        explicacion: 'Casos base y casos borde primero (vacío, un elemento, n = 0); la recursión debe avanzar hacia el caso base. Llamadas pedidas: ' + llamadasA + '.'
      };
    }
  });
  function enunciadoLimpio(s) { return s; }

  /* =========================================================================================
     3) Árboles binarios: métricas recursivas (hojas, altura) y valores sobre un árbol dado
     ========================================================================================= */
  prog({
    id: 'pq-prog-arbol', n: 4, dif: 4, c: ['ar_nodo', 'ar_profalt', 'ar_vocab', 'cx_recursivo'], tema: 'métricas de un árbol binario', lite: ['a', 'd'],
    gen(rng) {
      const n = rng.int(7, 9); const t = Arb.bstAleatorio(rng, n, 10, 90, rng.chance(0.3)).arbol;
      const hojas = Arb.hojas(t), alt = Arb.altura(t), nodos = Arb.tam(t);
      const solH = cod(`
        def contar_hojas(raiz):
            if raiz is None:
                return 0
            if raiz.izq is None and raiz.der is None:
                return 1
            return contar_hojas(raiz.izq) + contar_hojas(raiz.der)
      `);
      const solAlt = cod(`
        def altura(raiz):
            if raiz is None:
                return -1
            return 1 + max(altura(raiz.izq), altura(raiz.der))
      `);
      const hq = PQ.codigoQ({ enun: 'Escriba `contar_hojas(raiz)` que devuelve el número de **hojas** (nodos sin hijos) de un árbol binario (nodos `NodoArbol`), **de forma recursiva**. Debe cubrir el árbol vacío (0), un solo nodo (1) y un nodo con un solo hijo (ese nodo **no** es hoja).', fn: 'contar_hojas', starter: 'def contar_hojas(raiz):\n    # complete aquí\n    pass\n', solucion: solH, prelude: K.PRE_ARBOL, vista: CLASE, tests: ['contar_hojas(None)', 'contar_hojas(N(5))', 'contar_hojas(N(5, N(3), None))', 'contar_hojas(N(5, None, N(8, N(7), None)))', 'contar_hojas(N(5, N(3), N(8)))', 'contar_hojas(' + K.pyN(t) + ')'], reglas: [{ t: 'recursiva', fn: 'contar_hojas' }], ejemplo: 'contar_hojas(N(2, N(1), N(3)))' });
      const aq = PQ.codigoQ({ enun: 'Escriba `altura(raiz)` que devuelve la **altura** del árbol **en aristas** (una hoja vale 0 y el **árbol vacío vale −1**), **de forma recursiva**. Debe cubrir el árbol vacío, un solo nodo y un árbol degenerado (una cadena).', fn: 'altura', starter: 'def altura(raiz):\n    # complete aquí\n    pass\n', solucion: solAlt, prelude: K.PRE_ARBOL, vista: CLASE, tests: ['altura(None)', 'altura(N(5))', 'altura(N(5, N(3), None))', 'altura(N(5, N(3, N(2, N(1), None), None), None))', 'altura(N(5, N(3), N(8, None, N(9))))', 'altura(' + K.pyN(t) + ')'], reglas: [{ t: 'recursiva', fn: 'altura' }], ejemplo: 'altura(N(2, N(1), N(3)))' });
      return {
        enunciado: 'Se trabaja con árboles binarios de nodos `NodoArbol`. Todas las funciones deben ser **recursivas**.', codigoVista: CLASE,
        partes: [
          parteC('a', 'Contar hojas', 0.25, hq),
          parteC('b', 'Altura', 0.25, aq),
          parteC('c', 'Sobre un árbol dado', 0.3, tabla('Para el árbol de la figura complete los valores que **devolverían** las funciones (y dos datos más).', ['Dato', 'Valor'], [[T('`contar_hojas(raiz)`'), inp(String(hojas))], [T('`altura(raiz)`'), inp(String(alt))], [T('Número de nodos'), inp(String(nodos))], [T('Número de aristas'), inp(String(nodos - 1))]])),
          parteC('d', 'Complejidad', 0.2, abierta('Indique la **complejidad de tiempo** de `altura` respecto del número de nodos `n`, el **espacio de pila** respecto de la altura `h`, y **qué cambia en un árbol degenerado**.',
            [['Tiempo O(n): cada nodo se visita una sola vez con trabajo O(1)', 'o(n)', 'una vez', 'cada nodo', 'lineal'], ['Espacio de pila O(h): solo están activas las llamadas del camino raíz–nodo actual', 'o(h)', 'camino', 'altura', 'h+1'], ['En un árbol degenerado h = n − 1, así que la pila es O(n) (riesgo de RecursionError)', 'degenerad', 'n-1', 'n − 1', 'o(n)', 'recursionerror']],
            '**Tiempo O(n)** (cada nodo se visita una sola vez con trabajo O(1)); **espacio de pila O(h)** (solo están activas las llamadas del camino raíz–nodo actual). En un **árbol degenerado** h = n − 1 y la pila es **O(n)** (con riesgo de RecursionError).'))
        ],
        arbol: t, arbolTitulo: 'Árbol de la parte (c) (raíz = ' + t.v + ')', arbolOpts: { compacto: true },
        explicacion: 'Hojas: ' + hojas + ', altura: ' + alt + ', nodos: ' + nodos + ', aristas: ' + (nodos - 1) + '.'
      };
    }
  });

  /* =========================================================================================
     4) Recorridos: postorden, hojas de izquierda a derecha, reconstruir el árbol
     ========================================================================================= */
  prog({
    id: 'pq-prog-recorridos', n: 5, dif: 4, c: ['tv_post', 'tv_pre', 'tv_in', 'tv_reconstruir'], tema: 'recorridos y reconstrucción', lite: ['a', 'd'],
    gen(rng) {
      const n = rng.int(6, 7); const t = Arb.bstAleatorio(rng, n, 10, 90, false).arbol; const tt = Arb.aleatorio(rng, n, { balance: false });
      // árbol con etiquetas A.. para reconstruir
      const arbolRec = Arb.aleatorio(rng, rng.int(6, 7), { balance: rng.chance(0.5) });
      const pre = Arb.pre(arbolRec), ino = Arb.ino(arbolRec);
      const solP = cod(`
        def postorden(raiz):
            if raiz is None:
                return []
            return postorden(raiz.izq) + postorden(raiz.der) + [raiz.valor]
      `);
      const solH = cod(`
        def hojas(raiz):
            if raiz is None:
                return []
            if raiz.izq is None and raiz.der is None:
                return [raiz.valor]
            return hojas(raiz.izq) + hojas(raiz.der)
      `);
      const pq = PQ.codigoQ({ enun: 'Escriba `postorden(raiz)` que devuelve la **lista** de valores del recorrido **posorden** (izquierdo, derecho, raíz), **de forma recursiva**. Debe cubrir el árbol vacío (`[]`) y un solo nodo.', fn: 'postorden', starter: 'def postorden(raiz):\n    # complete aquí\n    pass\n', solucion: solP, prelude: K.PRE_ARBOL, vista: CLASE, tests: ['postorden(None)', 'postorden(N(5))', 'postorden(N(5, N(3), None))', 'postorden(N(5, None, N(8)))', 'postorden(N(5, N(3, N(1), N(4)), N(8, None, N(9))))', 'postorden(' + K.pyN(t) + ')'], reglas: [{ t: 'recursiva', fn: 'postorden' }], ejemplo: 'postorden(N(2, N(1), N(3)))' });
      const hq = PQ.codigoQ({ enun: 'Escriba `hojas(raiz)` que devuelve la lista de los valores de las **hojas** de **izquierda a derecha**. Debe cubrir el árbol vacío (`[]`), un solo nodo (es hoja: `[valor]`) y un nodo con un solo hijo (ese nodo **no** es hoja).', fn: 'hojas', starter: 'def hojas(raiz):\n    # complete aquí\n    pass\n', solucion: solH, prelude: K.PRE_ARBOL, vista: CLASE, tests: ['hojas(None)', 'hojas(N(5))', 'hojas(N(5, N(3), None))', 'hojas(N(5, None, N(8, N(7), None)))', 'hojas(N(5, N(3, N(1), N(4)), N(8, None, N(9))))', 'hojas(' + K.pyN(t) + ')'], reglas: [{ t: 'recursiva', fn: 'hojas' }], ejemplo: 'hojas(N(2, N(1), N(3)))' });
      return {
        enunciado: 'Se trabaja con árboles binarios de nodos `NodoArbol`. Las funciones deben ser **recursivas**.', codigoVista: CLASE,
        partes: [
          parteC('a', 'Posorden', 0.3, pq),
          parteC('b', 'Hojas', 0.3, hq),
          parteC('c', 'Reconstruir', 0.25, { tipo: 'arbol', enunciado: 'Un árbol binario tiene **preorden** `' + pre.join(' ') + '` e **inorden** `' + ino.join(' ') + '`. Dibuje el árbol y escríbalo en notación `valor(izq,der)`.', esperado: arbolRec, verificar: { inorden: true }, placeholder: 'p. ej. A(B,C)' }),
          parteC('d', 'Argumento', 0.15, abierta('Explique **por qué un solo recorrido (por ejemplo, el preorden) no basta** para reconstruir de forma única un árbol binario y **qué combinación de dos recorridos sí lo permite**.',
            [['Un solo recorrido es ambiguo: árboles distintos pueden dar el mismo recorrido (por ejemplo, un hijo izquierdo o derecho único)', 'ambig', 'distintos', 'mismo recorrido', 'hijo unico', 'un solo hijo', 'no es unico'], ['Con preorden (o posorden) + inorden sí: la raíz sale del primero (o del último) y el inorden separa los subárboles', 'inorden', 'raiz', 'separa', 'subarbol'], ['La raíz es el primer elemento del preorden; ubicándola en el inorden se parte el problema en izquierdo y derecho', 'primer', 'primero', 'preorden']],
            'Un solo recorrido es **ambiguo**: árboles distintos (p. ej., un único hijo izquierdo o derecho) producen el **mismo** recorrido. Con **preorden + inorden** (o posorden + inorden) **sí**: la raíz es el **primer** elemento del preorden y, al ubicarla en el inorden, este **separa** el subárbol izquierdo del derecho, y se repite.'))
        ],
        explicacion: 'Árbol: ' + Arb.nota(arbolRec) + '. La raíz es ' + pre[0] + '; en el inorden lo que está antes es el subárbol izquierdo.'
      };
    }
  });

  /* =========================================================================================
     5) AVL: factor, rotación izquierda y un caso concreto
     ========================================================================================= */
  prog({
    id: 'pq-prog-avl', n: 7, dif: 5, c: ['av_factor', 'av_altura', 'av_rotsimple', 'av_rr', 'av_rl', 'av_primer'], tema: 'AVL: factor y rotación izquierda', lite: ['b', 'd'],
    gen(rng) {
      const s = ET.Kit.escenarioRot(rng, rng.pick(['RR', 'RL', 'LL', 'LR']), rng.int(5, 7));
      const bad = Arb.desbalanceados(s.bst)[0]; const caso = s.r.caso;
      const c = caso; const u = Arb.hallar(s.bst, bad.v);
      const raizLocal = c === 'LL' ? u.l.v : c === 'RR' ? u.r.v : c === 'LR' ? u.l.r.v : u.r.l.v;
      const solF = cod(`
        def factor(n):
            if n is None:
                return 0
            hi = -1 if n.izq is None else n.izq.h
            hd = -1 if n.der is None else n.der.h
            return hi - hd
      `);
      const solR = cod(`
        def rotar_izquierda(x):
            y = x.der
            x.der = y.izq
            y.izq = x
            x.h = 1 + max(-1 if x.izq is None else x.izq.h, -1 if x.der is None else x.der.h)
            y.h = 1 + max(-1 if y.izq is None else y.izq.h, -1 if y.der is None else y.der.h)
            return y
      `);
      const CL = ET.Kit.PRE_AVL.split('def NA')[0].trim();
      const fq = PQ.codigoQ({ enun: 'Escriba `factor(n)`: el **factor de balance** (`altura(izq) − altura(der)`) del nodo `n`, usando el campo `h` de los hijos (hoja = 0, **hijo vacío = −1**). Si `n` es `None` devuelve 0. Debe cubrir un nodo sin hijos, con un solo hijo (izquierdo o derecho) y con dos hijos.', fn: 'factor', starter: 'def factor(n):\n    # complete aquí\n    pass\n', solucion: solF, prelude: K.PRE_AVL, vista: CL, tests: ['factor(None)', 'factor(NA(5))', 'factor(NA(5, NA(3), None))', 'factor(NA(5, None, NA(8)))', 'factor(NA(5, NA(3), NA(8)))', 'factor(NA(5, NA(3, NA(1), None), NA(8)))', 'factor(NA(5, NA(3), NA(8, None, NA(9, None, NA(10)))))'], ejemplo: 'factor(NA(2, NA(1), None))' });
      const rq = PQ.codigoQ({ enun: 'Escriba `rotar_izquierda(x)`: rotación simple a la izquierda del nodo `x` (que tiene hijo derecho `y`). Debe **reasignar los enlaces** (el subárbol izquierdo de `y` pasa a ser el derecho de `x`), **actualizar las alturas** `h` (primero la de `x`, luego la de `y`) y **devolver la nueva raíz local**. Debe funcionar cuando `y` tiene hijo izquierdo y cuando no lo tiene.', fn: 'rotar_izquierda', starter: 'def rotar_izquierda(x):\n    # complete aquí\n    pass\n', solucion: solR, prelude: K.PRE_AVL, vista: CL, tests: ['a_notaA(rotar_izquierda(NA(10, None, NA(20, None, NA(30)))))', 'rotar_izquierda(NA(10, None, NA(20, None, NA(30)))).h', 'a_notaA(rotar_izquierda(NA(10, NA(5), NA(20, NA(15), NA(30)))))', 'rotar_izquierda(NA(10, NA(5), NA(20, NA(15), NA(30)))).h', 'rotar_izquierda(NA(10, NA(5), NA(20, NA(15), NA(30)))).izq.h', 'a_notaA(rotar_izquierda(NA(10, NA(5), NA(20, None, NA(30, None, NA(40))))))'], ejemplo: 'a_notaA(rotar_izquierda(NA(1, None, NA(2, None, NA(3)))))' });
      return {
        enunciado: 'Se trabaja con nodos `NodoAVL` (`valor`, `izq`, `der` y `h` = altura en aristas; hoja = 0, vacío = −1).', codigoVista: CL,
        partes: [
          parteC('a', 'Factor de balance', 0.2, fq),
          parteC('b', 'Rotación izquierda', 0.3, rq),
          parteC('c', 'Un caso concreto', 0.3, { tipo: 'avl', pide: ['nodo', 'caso', 'raiz'], enunciado: 'Se inserta **' + s.nuevo + '** en el AVL de la figura (se muestra tras colgarlo como hoja, **antes de rebalancear**). Indique el primer nodo desbalanceado, el caso y qué nodo queda como **raíz del subárbol rotado**.', arbol: s.bst, arbolOpts: { etiquetas: 'factor', clases: { [String(s.nuevo)]: 'nuevo' } }, esperado: { nodo: bad.v, caso, nrot: (c === 'LL' || c === 'RR') ? 1 : 2, raiz: raizLocal, arbol: s.r.arbol, alt: Arb.altura(s.r.arbol) }, conceptos: ['av_primer'] }),
          parteC('d', 'Complejidad', 0.2, abierta('Indique la **complejidad de una rotación** y explique **por qué conserva el recorrido inorden** (y la propiedad de BST).',
            [['La rotación cuesta O(1): solo cambia unos pocos punteros y recalcula dos alturas', 'o(1)', 'punteros', 'constante', 'dos alturas'], ['Los subárboles no se recorren ni se copian: cada uno solo cambia de padre', 'no se recorren', 'no se copian', 'cambia de padre', 'sin recorrer'], ['Conserva el inorden: cambia la jerarquía, no el orden relativo de los valores (izquierda < raíz < derecha se mantiene)', 'inorden', 'orden relativo', 'orden', 'bst', 'propiedad']],
            'La rotación cuesta **O(1)**: solo **cambia unos pocos punteros** y recalcula dos alturas; los subárboles **no se recorren ni se copian**, solo cambian de padre. **Conserva el inorden** porque cambia la jerarquía pero no el **orden relativo** de los valores: lo que estaba a la izquierda sigue estando a la izquierda.'))
        ],
        explicacion: 'Caso ' + c + ' en el nodo ' + bad.v + ' → raíz local ' + raizLocal + '. Árbol final: ' + Arb.nota(s.r.arbol) + '.'
      };
    }
  });

  /* =========================================================================================
     6) Backtracking: subconjuntos y combinaciones
     ========================================================================================= */
  prog({
    id: 'pq-prog-backtracking', n: 3, dif: 5, c: ['pd_bt', 'pd_fb', 'cx_recursivo'], tema: 'backtracking: subconjuntos y combinaciones', lite: ['a', 'd'],
    gen(rng) {
      const nn = rng.int(4, 6), kk = rng.int(2, 3);
      const solS = cod(`
        def subconjuntos(A):
            res = []
            def f(i, actual):
                if i == len(A):
                    res.append(actual[:])
                    return
                f(i + 1, actual)
                actual.append(A[i])
                f(i + 1, actual)
                actual.pop()
            f(0, [])
            return res
      `);
      const solC = cod(`
        def combinaciones(A, k):
            res = []
            def f(i, actual):
                if len(actual) == k:
                    res.append(actual[:])
                    return
                if i == len(A):
                    return
                actual.append(A[i])
                f(i + 1, actual)
                actual.pop()
                f(i + 1, actual)
            f(0, [])
            return res
      `);
      const sq = PQ.codigoQ({ enun: 'Escriba `subconjuntos(A)` que devuelve la **lista de todos los subconjuntos** de la lista `A` (cada uno como lista que conserva el orden de `A`; **el orden de los subconjuntos no importa**). Use **backtracking** (decidir para cada elemento si entra o no). Debe cubrir la lista vacía (su único subconjunto es `[]`) y no compartir listas entre resultados.', fn: 'subconjuntos', starter: 'def subconjuntos(A):\n    # complete aquí\n    pass\n', solucion: solS, prelude: '', tests: ['sorted(subconjuntos([]))', 'sorted(subconjuntos([1]))', 'sorted(subconjuntos([1, 2]))', 'sorted(subconjuntos([1, 2, 3]))', 'len(subconjuntos([1, 2, 3, 4, 5]))'], ejemplo: 'sorted(subconjuntos([1, 2]))' });
      const cq = PQ.codigoQ({ enun: 'Escriba `combinaciones(A, k)` que devuelve la **lista de todas las combinaciones de `k` elementos** de `A` (cada una como lista que conserva el orden de `A`; **el orden del resultado no importa**). Use **backtracking** con **poda** (no siga si ya no quedan elementos suficientes). Debe cubrir `k = 0` (`[[]]`), `k > len(A)` (ninguna) y `k = len(A)`.', fn: 'combinaciones', starter: 'def combinaciones(A, k):\n    # complete aquí\n    pass\n', solucion: solC, prelude: '', tests: ['combinaciones([1, 2, 3], 0)', 'combinaciones([1, 2], 3)', 'sorted(combinaciones([1, 2, 3], 3))', 'sorted(combinaciones([1, 2, 3, 4], 2))', 'len(combinaciones([1, 2, 3, 4, 5, 6], 3))', 'combinaciones([], 1)'], ejemplo: 'sorted(combinaciones([1, 2, 3], 2))' });
      const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
      return {
        enunciado: 'Escriba funciones **recursivas con backtracking** (elegir, explorar, deshacer).',
        partes: [
          parteC('a', 'Subconjuntos', 0.3, sq),
          parteC('b', 'Combinaciones', 0.3, cq),
          parteC('c', 'Cuántos hay', 0.2, tabla('Complete cuántos elementos devolvería cada función.', ['Llamada', 'Cantidad'], [[T('`len(subconjuntos(A))` con `len(A) = ' + nn + '`'), inp(String(Math.pow(2, nn)))], [T('`len(combinaciones(A, ' + kk + '))` con `len(A) = ' + nn + '`'), inp(String(comb(nn, kk)))], [T('`len(combinaciones(A, 0))`'), inp('1')]])),
          parteC('d', 'Complejidad', 0.2, abierta('Indique la **complejidad de tiempo** de `subconjuntos` respecto de `n = len(A)` y **explique por qué no puede ser polinómica** aunque se pode.',
            [['Hay 2ⁿ subconjuntos (cada elemento entra o no): el número de hojas de la recursión es 2ⁿ', '2^n', '2ⁿ', 'entra o no', 'incluir', 'hojas'], ['Copiar cada subconjunto cuesta hasta O(n): total O(n·2ⁿ)', 'o(n)', 'n·2', 'n*2', 'copia', 'copiar'], ['Solo para producir el resultado hay que escribir 2ⁿ listas: ningún algoritmo puede ser polinómico', 'resultado', 'salida', 'polinom', 'exponencial', 'inevitable']],
            'Hay **2ⁿ subconjuntos** (cada elemento entra o no) y copiar cada uno cuesta hasta O(n): **O(n·2ⁿ)**. No puede ser polinómica porque **el propio resultado** tiene 2ⁿ listas: solo para devolverlo ya hay un número **exponencial** de elementos.'))
        ],
        explicacion: 'Subconjuntos: 2^' + nn + ' = ' + Math.pow(2, nn) + '; combinaciones C(' + nn + ',' + kk + ') = ' + comb(nn, kk) + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
