/* banco_pq_alg.js — «algoritmo en cuatro literales» (pregunta 4 del parcial):
   (a) trazado en tabla · (b) resultado · (c) implementación con casos borde y eficiencia (O(n²) vale la mitad) · (d) argumento.
   Las soluciones de referencia se ejecutan con el intérprete al generar la pregunta; las pruebas de eficiencia (`ef`) usan un
   presupuesto de pasos con «costos ocultos» activados (x in lista, A[1:], pop(0)… cuentan lo que recorren). */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, Arb = ET.Arb, Py = ET.Py, B = ET.Banco.add, K = ET.Kit, PQ = ET.PQ, cr = PQ.cr;
  const cod = U.dedent;

  function refRepr(prelude, codigo, expr) {
    const r = Py.evaluar(codigo, expr, { prelude, maxSteps: 6e7 });
    if (!r.ok) throw new Error('La referencia falla en ' + expr + ': ' + Py.textoError(r.error));
    return r.repr;
  }
  function pasosDe(prelude, codigo, expr) {
    const s = Py.sesion(codigo, { prelude, maxSteps: 6e7, maxMs: 20000 });
    if (!s.ok) throw new Error('La referencia no carga: ' + Py.textoError(s.error));
    const r = s.evaluar(expr, { maxSteps: 6e7, cargaOculta: true });
    if (!r.ok) throw new Error('La referencia falla en ' + expr + ': ' + Py.textoError(r.error));
    return r.pasos;
  }
  /** pregunta de código con pruebas generadas por la referencia (corrección) y pruebas de eficiencia calibradas (ef) */
  PQ.codigoQ = function (o) {
    const tests = (o.tests || []).map(e => ({ e, r: refRepr(o.prelude, o.solucion, e) }));
    (o.ef || []).forEach(e => { const p = pasosDe(o.prelude, o.solucion, e); tests.push({ e, r: refRepr(o.prelude, o.solucion, e), ef: true, maxPasos: Math.max(2500, Math.round(p * (o.factor || 6))), desc: o.efDesc || e }); });
    return { tipo: 'codigo', modoEj: 'codigo', enunciado: o.enun, codigoVista: o.vista, starter: o.starter, solucion: o.solucion, prelude: o.prelude, tests, reglas: o.reglas || [], fn: o.fn, lento: o.lento, lineas: o.lineas || 10, ejemploLlamada: o.ejemplo, conceptos: o.conceptos };
  };
  const OPC = (...a) => a;
  const NONE = ['None', 'none', 'ninguno', '-', '—', 'null'];
  const inp = (...alts) => ({ in: alts, w: 8 });
  const T = t => ({ t });
  const listaTxt = a => '[' + a.join(', ') + ']';
  const pilaAlts = a => a.length ? [listaTxt(a), a.join(' '), a.join(',')] : ['[]', 'vacia', 'vacía', 'vacio', 'vacío'];
  const parte = (titulo, peso, q) => ({ titulo, peso, q });
  const PES = { tr: 0.35, res: 0.10, im: 0.45, arg: 0.10 };
  const abierta = (enun, crit, modelo, filas) => ({ tipo: 'abierta', enunciado: enun, criterios: crit.map(c => cr(...c)), modelo, filas: filas || 4 });
  const PIST_ALG = [
    'Haz el **trazado a mano** con valores pequeños antes de programar: anota el estado (variables, pila, memoria) tras cada paso.',
    'Piensa en los **casos borde** que pide el enunciado (vacío, un elemento, todos iguales, el peor orden de entrada) antes de dar por buena tu función.',
    'Para la **eficiencia**: pregúntate cuántas veces visitas cada elemento; un ciclo dentro de otro o un costo oculto (`x in lista`, `A[1:]`, `pop(0)`) suele delatar un O(n²).'
  ];
  function tabla(enun, cols, filas) { return { tipo: 'tabla', enunciado: enun, cols, filas }; }
  const aleatorioDistinto = (rng, k, lo, hi) => rng.distinct(k, lo, hi);
  const LITE = { tr: 1, res: 1, arg: 1 };   // la versión «B» omite la implementación

  /** registra la versión completa (C) y una reducida sin implementación (B) */
  function alg(def) {
    [['C', 5, false], ['B', 3, true]].forEach(([e, dif, lite]) => {
      B({
        id: def.id + '-' + e, n: def.n, e: lite ? 'B' : e, dif: lite ? Math.max(3, def.dif - 2) : def.dif, c: def.c, tema: 'Parcial: algoritmo — ' + def.tema + (lite ? ' (sin implementar)' : ''), parcial: !lite, slot: 'alg',
        gen(rng) {
          const q = def.gen(rng);
          if (lite) {
            q.partes = q.partes.filter(p => LITE[p.clave]);
            const tot = U.sum(q.partes.map(p => p.peso)); q.valor = tot;
            q.enunciado += '\n\n*(Versión corta: sin el literal de implementación.)*';
          }
          q.partes.forEach(p => { delete p.clave; });
          q.fmt = 'Parcial · Algoritmo'; q.cat = 'analisis'; q.pistas = PIST_ALG;
          if (!lite) q.valor = 1;
          return q;
        }
      });
    });
  }
  const P = (clave, titulo, peso, q) => Object.assign(parte(titulo, peso, q), { clave });

  /* =========================================================================================
     1) Memoización: formas de subir una escalera (paradigmas · DP top-down)
     ========================================================================================= */
  alg({
    id: 'pq-alg-memo', n: 3, dif: 5, c: ['pd_memo', 'pd_dp', 'pd_escalera', 'cx_recursivo'], tema: 'memoización (escalera)',
    gen(rng) {
      const pasos = rng.pick([[1, 2], [1, 2, 3]]); const N = pasos.length === 2 ? rng.int(6, 8) : rng.int(5, 6);
      const suma = pasos.map(p => 'maneras(n - ' + p + ')').join(' + ');
      const base = (instr) => {
        const L = ['llamadas = 0', 'memo = {}', '', 'def maneras(n):', '    global llamadas', '    llamadas += 1', '    if n < 0:', '        return 0', '    if n == 0:', '        return 1', '    if n in memo:', '        return memo[n]', '    memo[n] = ' + suma];
        if (instr) L.push('    print(n, memo[n], llamadas)');
        L.push('    return memo[n]');
        return L.join('\n');
      };
      const codigo = base(false);
      const instr = base(true);
      const out = K.run(instr + '\nmaneras(' + N + ')');
      const filas = out.split('\n').map(l => l.split(' ').map(Number));
      const ult = filas[filas.length - 1];
      // solución de referencia (con memoria local) y versión lenta (sin memoria)
      const sumaRef = pasos.map(p => 'f(k - ' + p + ')').join(' + ');
      const solucion = cod(`
        def maneras(n):
            memo = {}
            def f(k):
                if k < 0:
                    return 0
                if k == 0:
                    return 1
                if k not in memo:
                    memo[k] = ${sumaRef}
                return memo[k]
            return f(n)
      `);
      const lento = cod(`
        def maneras(n):
            if n < 0:
                return 0
            if n == 0:
                return 1
            return ${pasos.map(p => 'maneras(n - ' + p + ')').join(' + ')}
      `);
      const nEf = pasos.length === 2 ? 26 : 20;
      const codigoQ = PQ.codigoQ({
        enun: 'Implemente `maneras(n)`, que devuelve de cuántas formas se puede subir una escalera de `n` escalones dando pasos de ' + pasos.join(', ') + ' escalón' + (pasos.length > 1 ? 'es' : '') + ' (`maneras(0)` = 1). Use **memoización con un diccionario** (no use `functools` ni `lru_cache`). La solución debe ser **O(n)**: una recursión sin memoria (exponencial) obtiene la mitad del puntaje.',
        fn: 'maneras', starter: 'def maneras(n):\n    # complete aquí\n    pass\n', solucion, lento, prelude: '', tests: ['maneras(0)', 'maneras(1)', 'maneras(2)', 'maneras(3)', 'maneras(' + N + ')', 'maneras(12)'], ef: ['maneras(' + nEf + ')'], efDesc: 'maneras(' + nEf + ')  (eficiencia)',
        reglas: [{ t: 'noUsa', re: /lru_cache|functools|\bcache\b/, msg: 'No use `functools`/`lru_cache`: la memoria debe ser un diccionario escrito por usted.' }], ejemplo: 'maneras(' + N + ')'
      });
      return {
        tipo: 'mixta', valor: 1, codigoVista: codigo,
        enunciado: 'Se dispone de la función `maneras(n)` con memoización (el contador `llamadas` cuenta **todas** las llamadas, incluidas las que solo consultan `memo`). Se ejecuta `maneras(' + N + ')` con `memo` y `llamadas` recién inicializados (`llamadas = 0`, `memo = {}`).',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Complete la tabla indicando, **cada vez que se guarda un valor en `memo`** (en el orden en que ocurre), el valor guardado y el número acumulado de llamadas hasta ese momento.', ['n', 'memo[n] guardado', 'llamadas acumuladas'], filas.map(f => [T(String(f[0])), inp(String(f[1])), inp(String(f[2]))]))),
          P('res', 'Resultado', PES.res, tabla('Al terminar `maneras(' + N + ')`: ¿qué valor devuelve y cuántas llamadas se hicieron en total?', ['Valor devuelto', 'Llamadas totales'], [[inp(String(ult[1])), inp(String(ult[2]))]])),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('La función hace ' + pasos.length + ' llamadas recursivas por invocación y, aun así, es O(n). **Explique por qué** (argumento: cuántos subproblemas distintos hay y cuántas veces se calcula cada uno).',
            [['Cada subproblema `maneras(k)` (0 ≤ k ≤ n) se calcula una sola vez y se guarda en memo', 'una sola vez', 'una vez', 'guarda', 'memo'], ['Las demás llamadas encuentran el valor en memo y cuestan O(1)', 'o(1)', 'consulta', 'constante', 'encuentra'], ['Hay n + 1 subproblemas y cada uno genera a lo sumo ' + pasos.length + ' llamadas: ≈ ' + pasos.length + 'n llamadas → O(n)', 'n+1', 'n + 1', 'o(n)', 'lineal', 'total']],
            'Cada subproblema `maneras(k)` con 0 ≤ k ≤ n se **calcula una sola vez** y se guarda en `memo`; las demás llamadas **encuentran el valor en memo** y cuestan O(1). Hay **n + 1 subproblemas** y cada uno genera a lo sumo ' + pasos.length + ' llamadas: en total ≈ ' + pasos.length + 'n llamadas, es decir **O(n)** (aquí, con n = ' + N + ' hubo ' + ult[2] + ').'))
        ],
        explicacion: 'Trazado: ' + filas.map(f => 'memo[' + f[0] + '] = ' + f[1] + ' (' + f[2] + ' llamadas)').join('; ') + '. Con memoria cada subproblema se resuelve una vez: O(n) en vez de exponencial.'
      };
    }
  });

  /* =========================================================================================
     2) Divide y vencerás: mezclar dos listas ordenadas sin duplicados
     ========================================================================================= */
  alg({
    id: 'pq-alg-mezclar', n: 3, dif: 5, c: ['pd_dyc', 'cx_recursivo', 'cx_python'], tema: 'mezcla de listas ordenadas (merge)',
    gen(rng) {
      const nA = rng.int(4, 5), nB = rng.int(3, 4);
      const A = rng.distinct(nA, 1, 14).sort((a, b) => a - b), Bv = rng.distinct(nB, 1, 14).sort((a, b) => a - b);
      const codigo = cod(`
        def mezclar(A, B):
            i = j = 0
            res = []
            while i < len(A) and j < len(B):
                if A[i] <= B[j]:
                    res.append(A[i])
                    i += 1
                else:
                    res.append(B[j])
                    j += 1
            res.extend(A[i:])
            res.extend(B[j:])
            return res
      `);
      // trazado manual: pasos del while
      let i = 0, j = 0; const pasos = []; const res = [];
      while (i < A.length && j < Bv.length) {
        const deA = A[i] <= Bv[j]; const toma = deA ? A[i] : Bv[j];
        if (deA) i++; else j++;
        res.push(toma); pasos.push({ cmp: 'A[i] = ' + A[i - (deA ? 1 : 0)] + ', B[j] = ' + Bv[j - (deA ? 0 : 1)], toma, i, j });
      }
      const finalRes = res.concat(A.slice(i), Bv.slice(j));
      const solucion = cod(`
        def mezclar_unicos(A, B):
            res = []
            i = j = 0
            while i < len(A) or j < len(B):
                if j >= len(B) or (i < len(A) and A[i] <= B[j]):
                    x = A[i]
                    i += 1
                else:
                    x = B[j]
                    j += 1
                if not res or res[-1] != x:
                    res.append(x)
            return res
      `);
      const lento = cod(`
        def mezclar_unicos(A, B):
            res = []
            for x in A + B:
                k = 0
                while k < len(res) and res[k] < x:
                    k += 1
                if k == len(res) or res[k] != x:
                    res.insert(k, x)
            return res
      `);
      const prel = 'GA = list(range(0, 600, 2))\nGB = list(range(0, 450, 3))\n';
      const codigoQ = PQ.codigoQ({
        enun: 'Escriba `mezclar_unicos(A, B)` que recibe dos listas **ya ordenadas** (de menor a mayor, pueden tener valores repetidos) y devuelve **una sola lista ordenada sin valores repetidos**. Debe funcionar si una o ambas listas están vacías y si todos los valores son iguales. **No use** `sorted`, `.sort()` ni `set`. Debe ser **O(n + m)**: una solución O(n·m) obtiene la mitad.',
        fn: 'mezclar_unicos', starter: 'def mezclar_unicos(A, B):\n    # complete aquí\n    pass\n', solucion, lento, prelude: prel,
        tests: ['mezclar_unicos([], [])', 'mezclar_unicos([1, 3, 5], [])', 'mezclar_unicos([], [2, 2, 4])', 'mezclar_unicos([1, 1, 2], [1, 2, 2, 3])', 'mezclar_unicos([4, 4, 4], [4, 4])', 'mezclar_unicos(' + listaTxt(A) + ', ' + listaTxt(Bv) + ')', 'mezclar_unicos([1, 2, 3], [10, 20])', 'mezclar_unicos([10, 20], [1, 2, 3])'], ef: ['mezclar_unicos(GA, GB)'], efDesc: 'mezclar_unicos con listas de 300 y 150 elementos (eficiencia)',
        reglas: [{ t: 'noUsa', re: /sorted|\.sort\(|\bset\(/, msg: 'No use `sorted`, `.sort()` ni `set`: la mezcla debe aprovechar que las listas ya están ordenadas.' }], ejemplo: 'mezclar_unicos([1, 3], [2, 3])'
      });
      return {
        tipo: 'mixta', valor: 1, codigoVista: codigo,
        enunciado: 'La función `mezclar` combina dos listas ordenadas (es el paso de combinación de *merge sort*). Se llama con `A = ' + listaTxt(A) + '` y `B = ' + listaTxt(Bv) + '`.',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Complete la tabla para cada vuelta del `while`: de qué lista se toma el elemento, y los valores de `i` y `j` **al terminar** la vuelta.', ['Vuelta', 'Valores comparados', 'Se toma (valor)', 'i', 'j'], pasos.map((p, k) => [T(String(k + 1)), T(p.cmp), inp(String(p.toma)), inp(String(p.i)), inp(String(p.j))]))),
          P('res', 'Resultado', PES.res, { tipo: 'salida', tokens: true, numerico: false, enunciado: 'Escriba la lista que devuelve `mezclar(A, B)` (valores separados por comas).', esperado: finalRes.join(', '), placeholder: 'p. ej. 1, 2, 3' }),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('Si *merge sort* usa esta combinación (que cuesta O(n) por nivel), **justifique** por qué su tiempo es O(n log n).',
            [['Divide en dos mitades de tamaño n/2 (dos llamadas recursivas)', 'mitades', 'n/2', 'dos llamadas', 'dos subproblemas'], ['En cada nivel la mezcla recorre n elementos en total: O(n) por nivel', 'o(n)', 'n por nivel', 'cada nivel', 'mezcla', 'combinar'], ['Hay ≈ log₂ n niveles → O(n log n)', 'log', 'niveles', 'n log n', 'nlogn']],
            'T(n) = 2·T(n/2) + O(n): **dos llamadas sobre mitades** (n/2) y **mezclar cuesta O(n)** por nivel (cada elemento participa una vez en cada nivel); hay ≈ **log₂ n niveles**, así que T(n) = O(n log n).'))
        ],
        explicacion: 'La mezcla avanza dos índices una sola vez sobre cada lista: ' + pasos.length + ' vueltas del while y luego se copian las colas. Resultado: ' + listaTxt(finalRes) + '.'
      };
    }
  });

  /* =========================================================================================
     3) Backtracking con poda: subconjuntos que suman un objetivo
     ========================================================================================= */
  alg({
    id: 'pq-alg-subconjuntos', n: 3, dif: 5, c: ['pd_bt', 'pd_fb', 'cx_recursivo'], tema: 'backtracking con poda (subconjuntos)',
    gen(rng) {
      let A, T0, filas, ult;
      const fuente = cod(`
        def cuenta(A, i, resto):
            if resto == 0:
                return 1
            if resto < 0 or i == len(A):
                return 0
            return cuenta(A, i + 1, resto - A[i]) + cuenta(A, i + 1, resto)
      `);
      for (let intento = 0; intento < 200; intento++) {
        A = rng.distinct(4, 2, 9); T0 = rng.int(8, 14);
        // registro en orden de entrada a cada llamada
        const traza = cod(`
          reg = []
          def cuenta(A, i, resto):
              idx = len(reg)
              reg.append([i, resto, None])
              if resto == 0:
                  r = 1
              elif resto < 0 or i == len(A):
                  r = 0
              else:
                  r = cuenta(A, i + 1, resto - A[i]) + cuenta(A, i + 1, resto)
              reg[idx][2] = r
              return r
        `);
        const s = Py.sesion(traza, { maxSteps: 2e6 }); if (!s.ok) continue;
        const r = s.evaluar('cuenta(' + listaTxt(A) + ', 0, ' + T0 + ')'); if (!r.ok) continue;
        const rr = s.evaluar('reg'); if (!rr.ok) continue;
        filas = JSON.parse(rr.repr.replace(/None/g, 'null')); ult = Number(r.repr);
        if (filas.length >= 9 && filas.length <= 13 && ult >= 1) break;
      }
      const solucion = cod(`
        def subconjuntos_suma(A, objetivo):
            def f(i, resto):
                if resto == 0:
                    return 1
                if resto < 0 or i == len(A):
                    return 0
                return f(i + 1, resto - A[i]) + f(i + 1, resto)
            return f(0, objetivo)
      `);
      const lento = cod(`
        def subconjuntos_suma(A, objetivo):
            def f(i, resto):
                if i == len(A):
                    return 1 if resto == 0 else 0
                return f(i + 1, resto - A[i]) + f(i + 1, resto)
            return f(0, objetivo)
      `);
      const grande = '[' + Array.from({ length: 22 }, (_, k) => 9 + k).join(', ') + ']';
      const codigoQ = PQ.codigoQ({
        enun: 'Escriba `subconjuntos_suma(A, objetivo)` que cuenta cuántos subconjuntos de `A` (enteros **positivos**) suman exactamente `objetivo` (el subconjunto vacío suma 0). Use **backtracking con poda**: no siga explorando una rama cuando ya se pasó del objetivo. Debe cubrir `objetivo = 0`, una lista vacía y elementos mayores que el objetivo. Sin la poda el costo es 2ⁿ y obtiene la mitad.',
        fn: 'subconjuntos_suma', starter: 'def subconjuntos_suma(A, objetivo):\n    # complete aquí\n    pass\n', solucion, lento, prelude: '',
        tests: ['subconjuntos_suma([], 0)', 'subconjuntos_suma([], 5)', 'subconjuntos_suma([3, 5], 0)', 'subconjuntos_suma([4, 7], 3)', 'subconjuntos_suma(' + listaTxt(A) + ', ' + T0 + ')', 'subconjuntos_suma([2, 3, 5, 7, 8], 10)', 'subconjuntos_suma([1, 1, 1, 1], 2)'], ef: ['subconjuntos_suma(' + grande + ', 30)'], efDesc: 'subconjuntos_suma con 22 elementos y objetivo 30 (eficiencia)', factor: 8,
        ejemplo: 'subconjuntos_suma([2, 3, 5], 5)'
      });
      return {
        tipo: 'mixta', valor: 1, codigoVista: fuente,
        enunciado: 'La función `cuenta` cuenta los subconjuntos de `A` que suman `resto` (todos positivos). Se ejecuta `cuenta(' + listaTxt(A) + ', 0, ' + T0 + ')`.',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Complete la tabla con **todas las llamadas** en el orden en que **comienzan** (preorden de la recursión): el valor de `resto` en cada una y lo que **devuelve**. (La primera llamada es `cuenta(A, 0, ' + T0 + ')`.)', ['Llamada', 'i', 'resto', 'devuelve'], filas.map((f, k) => [T(String(k + 1)), T(String(f[0])), inp(String(f[1])), inp(String(f[2]))]))),
          P('res', 'Resultado', PES.res, tabla('¿Qué devuelve la llamada inicial y cuántas llamadas se hicieron en total (contando la inicial)?', ['Valor devuelto', 'Llamadas totales'], [[inp(String(ult)), inp(String(filas.length))]])),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('Explique **qué hace la poda** (`resto < 0`) y **por qué, aun con poda, el peor caso sigue siendo exponencial**.',
            [['La poda detiene una rama en cuanto el resto es negativo (esa rama ya no puede sumar el objetivo)', 'resto < 0', 'resto negativo', 'se pasa', 'detiene', 'descarta', 'rama'], ['Cada elemento se incluye o no: hay hasta 2ⁿ ramas/hojas', '2^n', '2ⁿ', 'incluir', 'dos llamadas', 'dos opciones'], ['En el peor caso (p. ej. elementos pequeños y objetivo grande) casi no se poda: sigue siendo O(2ⁿ)', 'peor caso', 'exponencial', 'no se poda', 'casi no']],
            'La poda **descarta la rama** en cuanto `resto < 0` (ya no puede sumar el objetivo) y así evita explorar muchas combinaciones. Pero cada elemento se **incluye o no** (2 llamadas), lo que da hasta **2ⁿ** hojas; en el **peor caso** (elementos pequeños y objetivo grande) casi no hay poda y el costo sigue siendo **exponencial**.'))
        ],
        explicacion: 'Se hicieron ' + filas.length + ' llamadas y se obtuvo ' + ult + '. Sin poda serían 2^(n+1) − 1 llamadas.'
      };
    }
  });

  /* =========================================================================================
     4) Voraz frente a programación dinámica: cambio de monedas
     ========================================================================================= */
  alg({
    id: 'pq-alg-cambio', n: 3, dif: 5, c: ['pd_greedy', 'pd_coin', 'pd_dp'], tema: 'cambio de monedas (voraz vs DP)',
    gen(rng) {
      const caso = rng.pick([[[1, 3, 4], 6], [[1, 5, 6], 10], [[1, 4, 6], 8], [[1, 6, 7], 12]]);
      const monedas = caso[0], V = caso[1];
      const desc = monedas.slice().sort((a, b) => b - a);
      const codigo = cod(`
        def voraz(monedas, monto):
            usadas = []
            for m in sorted(monedas, reverse=True):
                while monto >= m:
                    usadas.append(m)
                    monto -= m
            return usadas
      `);
      let resto = V; const pasos = [];
      desc.forEach(m => { while (resto >= m) { pasos.push({ antes: resto, m, despues: resto - m }); resto -= m; } });
      // óptimo por DP
      const dp = [0]; for (let v = 1; v <= V; v++) { let b = Infinity; monedas.forEach(m => { if (m <= v) b = Math.min(b, dp[v - m] + 1); }); dp.push(b); }
      const solucion = cod(`
        def cambio_minimo(monedas, monto):
            dp = [0] + [monto + 1] * monto
            for v in range(1, monto + 1):
                for m in monedas:
                    if m <= v and dp[v - m] + 1 < dp[v]:
                        dp[v] = dp[v - m] + 1
            return dp[monto] if dp[monto] <= monto else -1
      `);
      const lento = cod(`
        def cambio_minimo(monedas, monto):
            if monto == 0:
                return 0
            mejor = -1
            for m in monedas:
                if m <= monto:
                    r = cambio_minimo(monedas, monto - m)
                    if r >= 0 and (mejor < 0 or r + 1 < mejor):
                        mejor = r + 1
            return mejor
      `);
      const codigoQ = PQ.codigoQ({
        enun: 'Escriba `cambio_minimo(monedas, monto)` que devuelve el **menor número de monedas** que suman `monto` (cada moneda puede repetirse), o `-1` si es imposible. Use **programación dinámica**; la estrategia voraz **no** es correcta en general. Debe cubrir `monto = 0` y casos sin solución. Debe ser O(V·m): una recursión sin memoria (exponencial) obtiene la mitad.',
        fn: 'cambio_minimo', starter: 'def cambio_minimo(monedas, monto):\n    # complete aquí\n    pass\n', solucion, lento, prelude: '',
        tests: ['cambio_minimo([1, 3, 4], 0)', 'cambio_minimo([5, 10], 3)', 'cambio_minimo(' + listaTxt(monedas) + ', ' + V + ')', 'cambio_minimo([1, 5, 10], 18)', 'cambio_minimo([2], 7)', 'cambio_minimo([2, 5], 11)', 'cambio_minimo([3, 7], 20)'], ef: ['cambio_minimo([1, 5, 10, 25, 50], 400)'], efDesc: 'cambio_minimo([1, 5, 10, 25, 50], 400) (eficiencia)', ejemplo: 'cambio_minimo([1, 3, 4], 6)'
      });
      const voraces = pasos.length;
      return {
        tipo: 'mixta', valor: 1, codigoVista: codigo,
        enunciado: 'La función `voraz` entrega el cambio tomando siempre la moneda más grande que cabe. Se llama con `monedas = ' + listaTxt(monedas) + '` y `monto = ' + V + '`.',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Complete la tabla: en cada iteración del `while` (en el orden de ejecución) la moneda que se agrega y el monto que queda **después**.', ['Paso', 'Monto antes', 'Moneda usada', 'Monto después'], pasos.map((p, k) => [T(String(k + 1)), T(String(p.antes)), inp(String(p.m)), inp(String(p.despues))]))),
          P('res', 'Resultado', PES.res, tabla('¿Cuántas monedas usa `voraz` y cuál es el **mínimo real** de monedas para ese monto?', ['Monedas con voraz', 'Mínimo real'], [[inp(String(voraces)), inp(String(dp[V]))]])),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('Con `monedas = ' + listaTxt(monedas) + '` y `monto = ' + V + '` la estrategia voraz **no** da el mínimo. **Explique por qué falla** y **qué hace distinta la programación dinámica**.',
            [['Contraejemplo: la voraz usa ' + voraces + ' monedas y el óptimo es ' + dp[V], 'contraejemplo', String(voraces), String(dp[V]), 'monedas'], ['La elección local (la moneda más grande) no garantiza el óptimo global', 'local', 'global', 'no garantiza', 'no siempre'], ['La DP prueba todas las monedas para cada monto y reutiliza subproblemas', 'todas las monedas', 'cada monto', 'subproblemas', 'reutiliza', 'tabla']],
            'Con {' + monedas.join(', ') + '} y monto ' + V + ' la voraz usa **' + voraces + ' monedas** y el óptimo es **' + dp[V] + '**: la **elección local** (la moneda más grande) **no garantiza el óptimo global**. La DP **prueba todas las monedas** para cada monto y **reutiliza** los subproblemas ya resueltos (tabla), por eso sí lo encuentra.'))
        ],
        explicacion: 'Voraz: ' + pasos.map(p => p.m).join(' + ') + ' (' + voraces + ' monedas); óptimo: ' + dp[V] + ' monedas.'
      };
    }
  });

  /* =========================================================================================
     5) BST: validar con límites en O(n) (en vez de O(n²))
     ========================================================================================= */
  const PRE_CAD = K.PRE_ARBOL + '\n' + cod(`
    def cadena_der(lo, hi):
        raiz = None
        for v in range(hi, lo - 1, -1):
            raiz = N(v, None, raiz)
        return raiz
    def cadena_izq(lo, hi):
        raiz = None
        for v in range(lo, hi + 1):
            raiz = N(v, raiz, None)
        return raiz
    G1 = cadena_der(1, 250)
    G2 = cadena_izq(1, 250)
  `);
  const CLASE = K.CLASE_NODO;
  /** árbol aleatorio con forma de BST (5-7 nodos); con probabilidad p se deja un valor que viola la propiedad de forma no local */
  function arbolValidable(rng, invalido) {
    const vals = rng.distinct(rng.int(6, 7), 10, 90);
    let t = Arb.insertarSecuencia(rng.shuffle(vals));
    if (!invalido) return t;
    // sustituye el valor de una hoja del subárbol izquierdo (o derecho) de la raíz por uno que viola la raíz
    const copia = Arb.copia(t); const nodos = Arb.nodos(copia).filter(n => !n.l && !n.r && String(n.v) !== String(copia.v));
    const enIzq = new Set(Arb.nodos(copia.l).map(n => String(n.v))), enDer = new Set(Arb.nodos(copia.r).map(n => String(n.v)));
    const cand = nodos.filter(n => enIzq.has(String(n.v)) || enDer.has(String(n.v)));
    if (!cand.length) return t;
    const n = rng.pick(cand); const eraIzq = enIzq.has(String(n.v));
    n.v = eraIzq ? copia.v + rng.int(1, 4) : copia.v - rng.int(1, 4);
    return copia;
  }
  alg({
    id: 'pq-alg-validar-bst', n: 6, dif: 5, c: ['bs_prop', 'bs_altura', 'cx_recursivo', 'tv_in'], tema: 'validar un BST con límites',
    gen(rng) {
      let t, trazaFilas, res;
      const codigo = cod(`
        def es_bst(nodo, lo=None, hi=None):
            if nodo is None:
                return True
            if (lo is not None and nodo.valor <= lo) or (hi is not None and nodo.valor >= hi):
                return False
            return es_bst(nodo.izq, lo, nodo.valor) and es_bst(nodo.der, nodo.valor, hi)
      `);
      const traza = cod(`
        reg = []
        def es_bst(nodo, lo=None, hi=None):
            if nodo is None:
                return True
            reg.append([nodo.valor, lo, hi, not ((lo is not None and nodo.valor <= lo) or (hi is not None and nodo.valor >= hi))])
            if (lo is not None and nodo.valor <= lo) or (hi is not None and nodo.valor >= hi):
                return False
            return es_bst(nodo.izq, lo, nodo.valor) and es_bst(nodo.der, nodo.valor, hi)
      `);
      const invalido = rng.chance(0.55);
      t = arbolValidable(rng, invalido);
      const s = Py.sesion(traza, { prelude: K.PRE_ARBOL, maxSteps: 1e6 });
      const r = s.evaluar('es_bst(' + K.pyN(t) + ')'); const rr = s.evaluar('reg');
      res = r.repr; trazaFilas = JSON.parse(rr.repr.replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false'));
      const malo = trazaFilas.find(f => !f[3]);
      const solucion = cod(`
        def es_bst(raiz):
            def ok(n, lo, hi):
                if n is None:
                    return True
                if (lo is not None and n.valor <= lo) or (hi is not None and n.valor >= hi):
                    return False
                return ok(n.izq, lo, n.valor) and ok(n.der, n.valor, hi)
            return ok(raiz, None, None)
      `);
      const lento = cod(`
        def es_bst(raiz):
            def mx(n):
                if n is None:
                    return -10**9
                return max(n.valor, mx(n.izq), mx(n.der))
            def mn(n):
                if n is None:
                    return 10**9
                return min(n.valor, mn(n.izq), mn(n.der))
            if raiz is None:
                return True
            if mx(raiz.izq) >= raiz.valor or mn(raiz.der) <= raiz.valor:
                return False
            return es_bst(raiz.izq) and es_bst(raiz.der)
      `);
      const codigoQ = PQ.codigoQ({
        enun: 'Escriba `es_bst(raiz)` que devuelve `True` si el árbol (nodos `NodoArbol` con `valor`, `izq`, `der`) es un **BST válido**: todo el subárbol izquierdo es **estrictamente menor** y todo el derecho **estrictamente mayor** (sin duplicados). Debe funcionar con el árbol vacío, un solo nodo, valores repetidos y violaciones **no locales** (un nodo mal ubicado lejos de su padre). Debe ser **O(n)**: calcular el máximo/mínimo de cada subárbol en cada nodo (O(n²)) obtiene la mitad.',
        fn: 'es_bst', starter: 'def es_bst(raiz):\n    # complete aquí\n    pass\n', solucion, lento, prelude: PRE_CAD, vista: CLASE,
        tests: ['es_bst(None)', 'es_bst(N(5))', 'es_bst(N(5, N(3), N(8)))', 'es_bst(N(5, N(3), N(5)))', 'es_bst(N(10, N(5, None, N(15)), N(20)))', 'es_bst(N(10, N(5, N(2), N(7)), N(20, N(12), N(30))))', 'es_bst(N(10, N(5), N(20, N(8), None)))', 'es_bst(' + K.pyN(t) + ')', 'es_bst(G1)', 'es_bst(G2)'], ef: ['es_bst(G1)'], efDesc: 'es_bst de una cadena de 250 nodos (eficiencia)', factor: 6, ejemplo: 'es_bst(N(2, N(1), N(3)))'
      });
      return {
        tipo: 'mixta', valor: 1, codigoVista: codigo, arbol: t, arbolTitulo: 'Árbol (raíz = ' + t.v + ')', arbolOpts: { compacto: true },
        enunciado: 'La función `es_bst` valida un árbol propagando un intervalo `(lo, hi)` (`None` = sin límite). Se llama `es_bst(raiz)` sobre el árbol dibujado.',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Complete la tabla con las llamadas con nodo **no vacío**, en el orden en que ocurren (la recursión se detiene en cuanto una llamada devuelve `False`). Escriba `None` para «sin límite».', ['Nodo', 'lo', 'hi', '¿Cumple?'], trazaFilas.map(f => [T(String(f[0])), inp(...(f[1] === null ? NONE : [String(f[1])])), inp(...(f[2] === null ? NONE : [String(f[2])])), inp(...(f[3] ? ['sí', 'si', 'True', 'cumple', 'v'] : ['no', 'False', 'no cumple', 'f']))]))),
          P('res', 'Resultado', PES.res, tabla('¿Qué devuelve `es_bst(raiz)` y, si es `False`, cuál es el **primer nodo que viola** el intervalo? (escriba `-` si es `True`)', ['Devuelve', 'Primer nodo que viola'], [[inp(...(res === 'True' ? ['True', 'verdadero', 'sí', 'si', 'v'] : ['False', 'falso', 'no', 'f'])), inp(...(malo ? [String(malo[0])] : ['-', 'ninguno', 'none', 'None']))]])),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('La versión con límites es **O(n)**. **Justifique** y explique por qué la que calcula máximo/mínimo en cada nodo puede llegar a O(n²).',
            [['Cada nodo se visita una sola vez y los límites (lo, hi) se pasan en O(1)', 'una vez', 'una sola vez', 'o(1)', 'limites', 'lo', 'hi'], ['Trabajo O(1) por nodo → O(n) en total', 'o(n)', 'lineal', 'n nodos'], ['La versión ingenua recorre un subárbol entero en cada nodo (máximo/mínimo): n nodos × O(n) = O(n²)', 'subarbol', 'maximo', 'minimo', 'n²', 'n2', 'cuadr']],
            'Cada nodo se visita **una sola vez** y los límites `(lo, hi)` se pasan en **O(1)**: **O(n)** en total. La versión ingenua calcula el **máximo/mínimo de un subárbol entero** en cada nodo (O(n) cada vez): n nodos × O(n) = **O(n²)** en el árbol degenerado.'))
        ],
        explicacion: 'Resultado: ' + res + (malo ? ' (el primer nodo que viola es ' + malo[0] + ')' : '') + '. Los límites se heredan: a la izquierda baja `hi`, a la derecha sube `lo`.'
      };
    }
  });

  /* =========================================================================================
     6) Recorrido inorden iterativo con pila: while anidado y argumento amortizado
     ========================================================================================= */
  alg({
    id: 'pq-alg-inorden-pila', n: 5, dif: 5, c: ['tv_in', 'tv_pre', 'cx_recursivo', 'rc_pila'], tema: 'recorrido iterativo con pila',
    gen(rng) {
      const n = rng.int(6, 7); const t = Arb.bstAleatorio(rng, n, 10, 90, rng.chance(0.4)).arbol;
      const codigo = cod(`
        def inorden(raiz):
            pila = []
            res = []
            nodo = raiz
            while pila or nodo is not None:
                while nodo is not None:
                    pila.append(nodo)
                    nodo = nodo.izq
                nodo = pila.pop()
                res.append(nodo.valor)
                nodo = nodo.der
            return res
      `);
      const traza = cod(`
        reg = []
        def inorden(raiz):
            pila = []
            res = []
            nodo = raiz
            while pila or nodo is not None:
                while nodo is not None:
                    pila.append(nodo)
                    nodo = nodo.izq
                nodo = pila.pop()
                res.append(nodo.valor)
                reg.append([nodo.valor, [x.valor for x in pila]])
                nodo = nodo.der
            return res
      `);
      const s = Py.sesion(traza, { prelude: K.PRE_ARBOL, maxSteps: 1e6 });
      const r = s.evaluar('inorden(' + K.pyN(t) + ')'); const rr = s.evaluar('reg');
      const filas = JSON.parse(rr.repr); const orden = Arb.ino(t);
      const solucion = cod(`
        def preorden_iter(raiz):
            res = []
            pila = [raiz] if raiz is not None else []
            while pila:
                n = pila.pop()
                res.append(n.valor)
                if n.der is not None:
                    pila.append(n.der)
                if n.izq is not None:
                    pila.append(n.izq)
            return res
      `);
      const codigoQ = PQ.codigoQ({
        enun: 'Escriba `preorden_iter(raiz)` que devuelve la lista de valores del recorrido **preorden** (raíz, izquierdo, derecho) **sin recursión**, usando una pila explícita. Debe funcionar con el árbol vacío y con un árbol muy profundo (una cadena de 1 500 nodos).',
        fn: 'preorden_iter', starter: 'def preorden_iter(raiz):\n    # complete aquí (sin llamarse a sí misma)\n    pass\n', solucion, vista: CLASE,
        prelude: K.PRE_ARBOL + '\n' + cod(`
          def cad(lo, hi):
              raiz = None
              for v in range(hi, lo - 1, -1):
                  raiz = N(v, raiz, None)
              return raiz
          PROF = cad(1, 1500)
        `),
        tests: ['preorden_iter(None)', 'preorden_iter(N(7))', 'preorden_iter(N(5, N(3, N(1), N(4)), N(8, None, N(9))))', 'preorden_iter(' + K.pyN(t) + ')', 'len(preorden_iter(PROF))', 'preorden_iter(PROF)[:3]'],
        reglas: [{ t: 'noRecursiva', fn: 'preorden_iter', msg: 'Debe ser iterativa: `preorden_iter` no puede llamarse a sí misma.' }], ejemplo: 'preorden_iter(N(2, N(1), N(3)))'
      });
      return {
        tipo: 'mixta', valor: 1, codigoVista: codigo, arbol: t, arbolTitulo: 'Árbol (raíz = ' + t.v + ')', arbolOpts: { compacto: true },
        enunciado: 'La función `inorden` recorre un árbol con una **pila explícita** (sin recursión). Se llama `inorden(raiz)` sobre el árbol dibujado.',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Complete la tabla: para cada nodo visitado (cada vez que se ejecuta `res.append`), el contenido de la **pila justo después del `pop`** (base → tope; escriba `[]` si está vacía).', ['Paso', 'Nodo visitado', 'Pila (base → tope)'], filas.map((f, k) => [T(String(k + 1)), inp(String(f[0])), inp(...pilaAlts(f[1]))]))),
          P('res', 'Resultado', PES.res, { tipo: 'salida', tokens: true, enunciado: 'Escriba la lista que devuelve `inorden(raiz)` (valores separados por comas).', esperado: orden.join(', ') }),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('`inorden` tiene un `while` dentro de otro `while` y, aun así, es **O(n)**. **Explique por qué** (argumento amortizado) y diga cuánto espacio extra usa la pila.',
            [['Cada nodo se apila una sola vez y se desapila una sola vez', 'una vez', 'una sola vez', 'apila', 'desapila'], ['El número total de operaciones de la pila es ≤ 2n, no n por iteración externa (argumento amortizado)', 'amortiz', '2n', 'total', 'no n²', 'n²'], ['Espacio extra O(h): la pila guarda el camino hasta el nodo actual (O(n) en el degenerado)', 'o(h)', 'altura', 'camino', 'degenerad']],
            'Aunque hay un `while` dentro de otro, **cada nodo se apila una sola vez y se desapila una sola vez**: en total ≤ 2n operaciones O(1) (**argumento amortizado**), así que es **O(n)**, no O(n²). La pila guarda el **camino** hasta el nodo actual: espacio extra **O(h)** (O(n) si el árbol es degenerado).'))
        ],
        explicacion: 'Inorden: ' + orden.join(', ') + '. Se entra a la izquierda empilando hasta no poder, se visita el tope y se pasa al hijo derecho.'
      };
    }
  });

  /* =========================================================================================
     7) AVL: secuencia de inserciones con rotaciones
     ========================================================================================= */
  alg({
    id: 'pq-alg-avl-secuencia', n: 7, dif: 5, c: ['av_insertar', 'av_primer', 'av_ll', 'av_rr', 'av_lr', 'av_rl', 'av_rotsimple'], tema: 'inserciones y rotaciones en un AVL',
    gen(rng) {
      let vals, hist, arbol;
      for (let i = 0; i < 300; i++) {
        vals = rng.distinct(6, 10, 80); const r = Arb.construirAVL(vals); hist = r.hist; arbol = r.arbol;
        const rot = hist.filter(h => h.pasos.length).length; if (rot >= 2 && rot <= 3) break;
      }
      const filas = hist.map(h => {
        const nrot = h.pasos.length ? (h.pasos.some(p => p.parte) ? 2 : 1) : 0;
        return [T(String(h.nuevo)), inp(...(h.primerDesbalanceado === null ? ['-', 'ninguno', 'ninguna', 'none', 'no hay', '—'] : [String(h.primerDesbalanceado)])), inp(...(h.caso ? [h.caso, ({ LL: 'izq-izq', RR: 'der-der', LR: 'izq-der', RL: 'der-izq' })[h.caso]] : ['-', 'ninguno', 'ninguna', 'none', 'no hay', '—'])), inp(String(nrot))];
      });
      const solucion = cod(`
        def rotar_derecha(y):
            x = y.izq
            y.izq = x.der
            x.der = y
            y.h = 1 + max(-1 if y.izq is None else y.izq.h, -1 if y.der is None else y.der.h)
            x.h = 1 + max(-1 if x.izq is None else x.izq.h, -1 if x.der is None else x.der.h)
            return x
      `);
      const codigoQ = PQ.codigoQ({
        enun: 'Escriba `rotar_derecha(y)`: rotación simple a la derecha del nodo `y` (que tiene hijo izquierdo `x`). Debe **reasignar los enlaces**, **actualizar las alturas** (`h`; hoja = 0, vacío = −1; primero la de `y` y luego la de `x`) y **devolver la nueva raíz local**. Debe funcionar cuando `x` tiene hijo derecho (ese subárbol cambia de padre) y cuando `x` no lo tiene.',
        fn: 'rotar_derecha', starter: 'def rotar_derecha(y):\n    # complete aquí\n    pass\n', solucion, vista: ET.Kit.PRE_AVL.split('def NA')[0].trim(), prelude: K.PRE_AVL,
        tests: ['a_notaA(rotar_derecha(NA(30, NA(20, NA(10), None), None)))', 'rotar_derecha(NA(30, NA(20, NA(10), None), None)).h', 'a_notaA(rotar_derecha(NA(30, NA(20, NA(10), NA(25)), NA(40))))', 'rotar_derecha(NA(30, NA(20, NA(10), NA(25)), NA(40))).h', 'rotar_derecha(NA(30, NA(20, NA(10), NA(25)), NA(40))).der.h', 'a_notaA(rotar_derecha(NA(50, NA(30, NA(20, NA(10), None), NA(40)), NA(60))))', 'rotar_derecha(NA(50, NA(30, NA(20, NA(10), None), NA(40)), NA(60))).h'], ejemplo: 'a_notaA(rotar_derecha(NA(3, NA(2, NA(1)))))'
      });
      return {
        tipo: 'mixta', valor: 1,
        enunciado: 'Se insertan, **en este orden**, los valores **' + vals.join(', ') + '** en un **AVL** vacío (factor = altura(izq) − altura(der); hoja = 0, vacío = −1).',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Para cada inserción complete: el **primer nodo desbalanceado** (el más profundo con |factor| = 2; `-` si no hay), el **caso** (LL, RR, LR o RL; `-` si no hay) y el **número de rotaciones simples** aplicadas (una doble cuenta 2).', ['Inserto', 'Primer nodo desbalanceado', 'Caso', 'Rotaciones'], filas)),
          P('res', 'Resultado', PES.res, { tipo: 'arbol', enunciado: 'Escriba el **árbol AVL final** en notación `valor(izq,der)`.', esperado: arbol, verificar: { bst: true, avl: true, inorden: true }, placeholder: 'p. ej. 20(10,30)' }),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('**Explique** por qué una inserción en un AVL necesita **a lo sumo una rotación** (simple o doble) y por qué la inserción completa cuesta **O(log n)**.',
            [['Al corregir el primer nodo desbalanceado, el subárbol recupera la altura que tenía antes de insertar, por lo que los ancestros quedan balanceados', 'recupera', 'misma altura', 'altura anterior', 'ancestros', 'antes de insertar'], ['Bajar y subir recorren la altura del árbol, que en un AVL es O(log n)', 'o(log n)', 'log', 'altura'], ['La rotación solo cambia unos pocos punteros: O(1)', 'o(1)', 'punteros', 'constante']],
            'Al corregir el **primer nodo desbalanceado** (el más profundo), el subárbol **recupera la altura que tenía antes de insertar**, así que los ancestros ya quedan balanceados: basta **una rotación** (simple o doble). Bajar y subir recorren la altura del árbol (**O(log n)** en un AVL) y cada rotación solo cambia unos pocos punteros (**O(1)**).'))
        ],
        explicacion: 'Árbol final: ' + Arb.nota(arbol) + '. Rotaciones: ' + hist.filter(h => h.pasos.length).map(h => h.nuevo + ' → ' + h.caso).join('; ') + '.'
      };
    }
  });

  /* =========================================================================================
     8) AVL: comprobar el balance en O(n) devolviendo (altura, válido)
     ========================================================================================= */
  alg({
    id: 'pq-alg-balance-altura', n: 7, dif: 5, c: ['av_factor', 'av_altura', 'cx_recursivo', 'tv_post'], tema: 'comprobar el balance (altura y validez a la vez)',
    gen(rng) {
      const n = rng.int(6, 7); const t = Arb.bstAleatorio(rng, n, 10, 90, rng.chance(0.4)).arbol;
      const codigo = cod(`
        def revisa(nodo):
            if nodo is None:
                return (-1, True)
            hi, oki = revisa(nodo.izq)
            hd, okd = revisa(nodo.der)
            return (1 + max(hi, hd), oki and okd and abs(hi - hd) <= 1)
      `);
      const traza = cod(`
        reg = []
        def revisa(nodo):
            if nodo is None:
                return (-1, True)
            hi, oki = revisa(nodo.izq)
            hd, okd = revisa(nodo.der)
            r = (1 + max(hi, hd), oki and okd and abs(hi - hd) <= 1)
            reg.append([nodo.valor, r[0], r[1]])
            return r
      `);
      const s = Py.sesion(traza, { prelude: K.PRE_ARBOL, maxSteps: 1e6 });
      const r = s.evaluar('revisa(' + K.pyN(t) + ')'); const rr = s.evaluar('reg');
      const filas = JSON.parse(rr.repr.replace(/True/g, 'true').replace(/False/g, 'false'));
      const resTxt = r.repr; const primerMalo = filas.find(f => !f[2]);
      const solucion = cod(`
        def es_avl(raiz):
            def rev(n):
                if n is None:
                    return (-1, True)
                hi, oki = rev(n.izq)
                hd, okd = rev(n.der)
                return (1 + max(hi, hd), oki and okd and abs(hi - hd) <= 1)
            return rev(raiz)[1]
      `);
      const lento = cod(`
        def es_avl(raiz):
            def alt(n):
                if n is None:
                    return -1
                return 1 + max(alt(n.izq), alt(n.der))
            def ok(n):
                if n is None:
                    return True
                a = ok(n.izq)
                b = ok(n.der)
                d = abs(alt(n.izq) - alt(n.der))
                return a and b and d <= 1
            return ok(raiz)
      `);
      const codigoQ = PQ.codigoQ({
        enun: 'Escriba `es_avl(raiz)` que devuelve `True` si **todos** los nodos del árbol cumplen |altura(izq) − altura(der)| ≤ 1 (hoja = 0, vacío = −1). Debe funcionar con el árbol vacío, un solo nodo y árboles degenerados. Debe ser **O(n)**: recalcular la altura de los subárboles en cada nodo (O(n²)) obtiene la mitad.',
        fn: 'es_avl', starter: 'def es_avl(raiz):\n    # complete aquí\n    pass\n', solucion, lento, prelude: PRE_CAD, vista: CLASE,
        tests: ['es_avl(None)', 'es_avl(N(5))', 'es_avl(N(5, N(3), None))', 'es_avl(N(5, N(3, N(2), None), None))', 'es_avl(N(5, N(3, N(2), N(4)), N(8, None, N(9))))', 'es_avl(N(5, N(3, N(2, N(1), None), None), N(8)))', 'es_avl(' + K.pyN(t) + ')', 'es_avl(G1)', 'es_avl(G2)'], ef: ['es_avl(G1)'], efDesc: 'es_avl de una cadena de 250 nodos (eficiencia)', factor: 6, ejemplo: 'es_avl(N(2, N(1), N(3)))'
      });
      return {
        tipo: 'mixta', valor: 1, codigoVista: codigo, arbol: t, arbolTitulo: 'Árbol (raíz = ' + t.v + ')', arbolOpts: { compacto: true },
        enunciado: 'La función `revisa` devuelve **dos datos a la vez**: la altura del subárbol y si está balanceado. Se llama `revisa(raiz)` sobre el árbol dibujado (hoja = 0, vacío = −1).',
        partes: [
          P('tr', 'Trazado', PES.tr, tabla('Complete la tabla con lo que **devuelve** `revisa` para cada nodo no vacío, en el orden en que **terminan** las llamadas (posorden).', ['Nodo', 'Altura devuelta', '¿Balanceado?'], filas.map(f => [T(String(f[0])), inp(String(f[1])), inp(...(f[2] ? ['sí', 'si', 'True', 'v'] : ['no', 'False', 'f']))]))),
          P('res', 'Resultado', PES.res, tabla('¿Qué devuelve `revisa(raiz)` completo? (altura y validez) y, si hay desbalance, ¿cuál es el **primer nodo** (en el orden de la tabla) marcado como no balanceado? (`-` si ninguno)', ['Altura', '¿Balanceado?', 'Primer nodo no balanceado'], [[inp(String(/^\((-?\d+),/.exec(resTxt)[1])), inp(...(/True\)$/.test(resTxt) ? ['sí', 'si', 'True'] : ['no', 'False'])), inp(...(primerMalo ? [String(primerMalo[0])] : ['-', 'ninguno', 'none']))]])),
          P('im', 'Implementación', PES.im, codigoQ),
          P('arg', 'Argumento', PES.arg, abierta('`revisa` es **O(n)**. **Justifique** y explique por qué la versión que llama a `altura` en cada nodo puede ser O(n²).',
            [['Cada nodo se visita una sola vez y combina los resultados de sus hijos en O(1)', 'una vez', 'una sola vez', 'o(1)', 'combina'], ['Trabajo O(1) por nodo → O(n) en total', 'o(n)', 'lineal', 'n nodos'], ['La versión ingenua recalcula la altura de un subárbol entero en cada nodo: n × O(n) = O(n²) en el degenerado', 'recalcula', 'subarbol', 'altura', 'n²', 'n2', 'cuadr']],
            'Cada nodo se visita **una sola vez** y combina los resultados de sus hijos en **O(1)**: **O(n)**. La versión ingenua **recalcula la altura de un subárbol entero** en cada nodo (O(n) cada vez): n × O(n) = **O(n²)** en el árbol degenerado.'))
        ],
        explicacion: 'Resultado de `revisa(raiz)`: ' + resTxt + '. La altura sube desde las hojas (posorden) y la validez se propaga con `and`.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
