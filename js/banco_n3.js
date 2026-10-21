/* banco_n3.js — Nivel 3: Paradigmas algorítmicos (S5-C2) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py;
  const PAR = ['Fuerza bruta', 'Backtracking', 'Greedy', 'Divide y vencerás', 'Programación dinámica'];

  const PROBLEMAS = [
    ['Ordenar un arreglo grande partiéndolo por la mitad, ordenando cada mitad y mezclando', 3, 'Subproblemas independientes (mitades) que luego se combinan: divide y vencerás (merge sort).'],
    ['Hallar el camino más corto tomando siempre la arista más barata disponible', 2, 'Decisión local («lo mejor ahora») sin reconsiderar: greedy.'],
    ['Contar de cuántas formas se puede subir una escalera de n pasos dando 1 o 2 pasos', 4, 'f(n) = f(n−1) + f(n−2): los subproblemas se solapan → programación dinámica.'],
    ['Encontrar todas las formas de colocar 8 reinas sin que se ataquen', 1, 'Se coloca una reina por fila y se abandona la rama apenas dos se atacan: backtracking (poda).'],
    ['Hallar dos elementos de una lista que sumen S probando todos los pares', 0, 'Enumera todos los candidatos y verifica: fuerza bruta, O(n²).'],
    ['Calcular fib(n) guardando en un diccionario los valores ya calculados', 4, 'Memoización = programación dinámica top-down: los subproblemas se solapan.'],
    ['Dar cambio con monedas de un sistema canónico tomando siempre la mayor moneda que quepa', 2, 'Elige el óptimo local en cada paso: greedy (funciona en sistemas canónicos).'],
    ['Buscar un valor en un arreglo ordenado descartando la mitad en cada paso', 3, 'Divide el problema en dos subproblemas independientes y resuelve solo uno: divide y vencerás.'],
    ['Hallar el mínimo de monedas para un valor con denominaciones arbitrarias llenando una tabla dp[v]', 4, 'Greedy puede fallar; la tabla reutiliza subproblemas solapados: programación dinámica (bottom-up).'],
    ['Probar todas las rutas posibles del agente viajero para quedarse con la más corta', 0, 'Enumera las n! rutas: fuerza bruta, O(n!).'],
    ['Quicksort: partir el arreglo según un pivote y ordenar recursivamente cada parte', 3, 'Las partes son subproblemas independientes: divide y vencerás.'],
    ['Mochila 0/1: maximizar el valor sin exceder el peso máximo', 4, 'Los subproblemas (capacidad restante, objetos considerados) se solapan: programación dinámica.'],
    ['Resolver un sudoku abandonando una rama apenas se repite un número en fila, columna o región', 1, 'Fuerza bruta con poda temprana de ramas inválidas: backtracking.'],
    ['Explorar el árbol de jugadas de un juego descartando las ramas que ya violan una restricción', 1, 'Explora y poda: backtracking con poda.']
  ];
  B({
    id: 'n3-clasifica', n: 3, e: 'A', dif: 2, c: ['pd_cinco', 'pd_fb', 'pd_bt', 'pd_greedy', 'pd_dyc', 'pd_dp'], tema: 'Clasificar paradigmas',
    gen(rng, K) {
      const items = rng.sample(PROBLEMAS, 5).map(p => ({ t: p[0], cat: p[1], why: p[2] }));
      return {
        tipo: 'clasificar', enunciado: 'Para cada problema, ¿qué **paradigma** usarías y por qué? Elige el más apropiado.', categorias: PAR, items,
        pistas: ['¿Los subproblemas son **independientes** (dividir y vencerás) o se **solapan** (programación dinámica)?', 'Greedy elige lo mejor en cada paso; backtracking es fuerza bruta que **poda** ramas inválidas; la fuerza bruta prueba todo sin podar.', 'Palabras clave: «partir por la mitad» → DyV · «guardar resultados» → DP · «lo más barato disponible» → greedy · «abandonar la rama» → backtracking · «probar todos» → fuerza bruta.'],
        explicacion: 'Cómo elegir (S5-C2, diap. 9): independientes → DyV · solapados → DP · decisiones locales óptimas → greedy · si no, backtracking o DP.'
      };
    }
  });

  const VF3 = [
    { a: 'El algoritmo greedy siempre encuentra la solución óptima.', v: false, e: 'Solo funciona en problemas con subestructura greedy; con monedas {1, 3, 4} y objetivo 6 da 3 monedas y el óptimo es 2.', j: ['Con monedas {1,3,4} y V = 6, greedy toma 4+1+1 (3 monedas) mientras que 3+3 (2 monedas) es mejor.', 'Greedy siempre examina todas las combinaciones, por eso es óptimo.', 'Greedy es óptimo porque es el más rápido.'] },
    { a: 'La programación dinámica se aplica cuando los subproblemas se **solapan**.', v: true, e: 'Cada subproblema se resuelve una vez y se reutiliza.', j: ['Si los subproblemas se repiten, guardarlos evita recalcular lo mismo.', 'Se aplica solo cuando los subproblemas son independientes.', 'Se aplica cuando no hay recursión.'] },
    { a: 'Divide y vencerás y programación dinámica son equivalentes: ambos manejan subproblemas que se repiten.', v: false, e: 'En divide y vencerás los subproblemas son independientes; en DP se solapan.', j: ['DyV divide en subproblemas independientes; DP reutiliza subproblemas solapados.', 'Ambos usan una tabla para guardar resultados.', 'La única diferencia es el lenguaje de programación.'] },
    { a: 'El backtracking es fuerza bruta que **poda** las ramas inválidas apenas se detectan.', v: true, e: 'Ejemplo: N-reinas abandona la rama en cuanto dos reinas se atacan.', j: ['Al descartar ramas que ya violan una restricción explora mucho menos que la fuerza bruta.', 'Backtracking explora todas las combinaciones sin excepción.', 'Backtracking siempre es greedy.'] },
    { a: 'La memoización convierte el costo O(2ⁿ) del Fibonacci recursivo en O(n).', v: true, e: 'Cada subproblema se calcula una sola vez.', j: ['Con caché, hay n+1 cálculos distintos con trabajo constante cada uno.', 'Porque la caché hace que la recursión desaparezca por completo.', 'Porque el cómputo se vuelve iterativo.'] },
    { a: 'Merge sort necesita memoización porque resuelve subproblemas que se repiten.', v: false, e: 'Sus mitades son independientes y no se repiten: es divide y vencerás.', j: ['Las mitades son subproblemas independientes; no hay nada que reutilizar.', 'Los subproblemas se solapan, igual que en Fibonacci.', 'Merge sort es un algoritmo greedy.'] },
    { a: 'En la programación dinámica **bottom-up** se calcula F₀, F₁, F₂… en orden hasta Fₙ guardando en una tabla.', v: true, e: 'Es el enfoque iterativo (tabulación).', j: ['Es el enfoque iterativo: se llena la tabla desde los casos pequeños.', 'Es el enfoque recursivo con caché.', 'Es el enfoque que prueba todas las combinaciones.'] },
    { a: 'Resolver el agente viajero (TSP) por fuerza bruta tiene costo O(n!).', v: true, e: 'Se enumeran todas las rutas posibles: n! permutaciones.', j: ['Hay n! rutas posibles y todas se evalúan.', 'La fuerza bruta del TSP es lineal.', 'El TSP se resuelve en O(n²) exactamente.'] },
    { a: 'Con monedas {1, 5, 10, 25}, tomar siempre la mayor moneda que quepa da el mínimo de monedas.', v: true, e: 'Ese es un sistema canónico: aquí greedy sí funciona.', j: ['En sistemas canónicos como este, la elección local de la mayor moneda es óptima.', 'Greedy nunca funciona con monedas.', 'Solo funciona si hay una moneda de valor 3.'] }
  ];
  B({
    id: 'n3-vf', n: 3, e: 'A', dif: 2, c: ['pd_cinco', 'pd_greedy', 'pd_dp', 'pd_errores'], tema: 'Paradigmas (V/F)',
    gen(rng, K) {
      const it = rng.pick(VF3);
      return {
        tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón correcta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Relaciona la afirmación con la definición del paradigma que menciona.', 'Cuidado con las palabras «siempre» y «nunca».', 'Busca un contraejemplo pequeño (por ejemplo monedas {1,3,4} con V = 6, o Fibonacci).']
      };
    }
  });

  B({
    id: 'n3-senal', n: 3, e: 'A', dif: 2, c: ['pd_dyc', 'pd_dp'], tema: 'Señal de DP vs DyV',
    gen(rng, K) {
      const dp = rng.chance(0.5);
      const q = dp ? '¿Cuál es la **señal** que te dice «aquí va programación dinámica»?' : '¿Cuál es la **señal** que te dice «aquí va divide y vencerás»?';
      return Object.assign(K.mc(rng, q,
        [[dp ? 'Los subproblemas se **solapan** (el mismo subproblema aparece muchas veces).' : 'El problema se parte en subproblemas **independientes** que luego se combinan.', dp ? 'Se resuelven una vez y se reutilizan.' : 'Dividir → vencer → combinar (merge sort, quicksort).']],
        [[dp ? 'Los subproblemas son **independientes** y no se repiten.' : 'Los subproblemas se **solapan** y se repiten muchas veces.', 'Es justo la señal del otro paradigma.'], ['La decisión local siempre da el óptimo global.', 'Esa es la condición de un algoritmo greedy.'], ['Se necesita probar absolutamente todas las soluciones candidatas.', 'Eso describe la fuerza bruta.']]), {
        pistas: ['Piensa en el ejemplo de cada uno: Fibonacci (DP) y merge sort (DyV).', 'En Fibonacci el mismo fib(2) se calcula varias veces; en merge sort cada mitad es distinta.', 'La palabra clave es «solapados» frente a «independientes».'],
        explicacion: 'Divide y vencerás: subproblemas **independientes**. Programación dinámica: subproblemas **solapados** (S5-C2, diap. 9 y 13).'
      });
    }
  });

  const GREEDY = `def greedy(monedas, V):\n    n = 0\n    for c in sorted(monedas, reverse=True):\n        n += V // c\n        V = V % c\n    return n`;
  const DPMIN = `def minimo(monedas, V):\n    INF = float('inf')\n    dp = [0] + [INF] * V\n    for v in range(1, V + 1):\n        for c in monedas:\n            if c <= v and dp[v - c] + 1 < dp[v]:\n                dp[v] = dp[v - c] + 1\n    return dp[V]`;
  const FALLAN = [[[1, 3, 4], 6], [[1, 3, 4], 10], [[1, 5, 6], 10], [[1, 7, 10], 14], [[1, 5, 12], 15], [[1, 6, 10], 12], [[1, 3, 4], 14]];
  B({
    id: 'n3-greedy-falla', n: 3, e: 'A', dif: 3, c: ['pd_greedy'], tema: 'Greedy vs óptimo',
    gen(rng, K) {
      const [mon, V] = rng.pick(FALLAN);
      const g = K.ev(GREEDY + `\nprint(greedy(${JSON.stringify(mon)}, ${V}))`, `greedy(${JSON.stringify(mon)}, ${V})`).repr;
      const o = K.ev(DPMIN, `minimo(${JSON.stringify(mon)}, ${V})`).repr;
      return {
        tipo: 'tabla', enunciado: 'Se quiere formar el valor **V = ' + V + '** con el mínimo de monedas, con denominaciones **' + JSON.stringify(mon) + '** (hay cantidad ilimitada de cada una). La función `greedy` toma siempre la mayor moneda que quepa. Completa la tabla.', codigoVista: GREEDY,
        cols: ['Estrategia', 'Monedas usadas'], filas: [[{ t: 'Greedy (resultado de `greedy`)' }, { in: g, w: 4 }], [{ t: 'Mínimo real (óptimo)' }, { in: o, w: 4 }]],
        pistas: ['Para greedy: sigue el código con las monedas ordenadas de mayor a menor y calcula `V // c` y el resto.', 'Para el óptimo: busca combinaciones que no usen siempre la moneda mayor (por ejemplo, prueba con las dos monedas más grandes).', 'Si greedy y el óptimo difieren, ese es un contraejemplo de que greedy no siempre es óptimo.'],
        explicacion: 'Greedy usa **' + g + '** monedas y el óptimo es **' + o + '**' + (g !== o ? ': ¡greedy falla! La elección local (la mayor moneda) no garantiza el óptimo global.' : '.')
      };
    }
  });

  B({
    id: 'n3-fib-llamadas', n: 3, e: 'A', dif: 3, c: ['pd_memo', 'rc_fib'], tema: 'Ingenuo vs memoización',
    gen(rng, K) {
      const n = rng.int(5, 9);
      const ing = `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`;
      const memo = `def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]`;
      const a = K.llamadas(ing, `fib(${n})`, 'fib'), b = K.llamadas(memo, `fib_memo(${n})`, 'fib_memo');
      return {
        tipo: 'tabla', enunciado: 'Cuenta **cuántas veces se ejecuta la función** (cada llamada, incluida la inicial y las que terminan encontrando el valor en la caché) al evaluar con n = ' + n + '.',
        codigos: [{ titulo: 'Recursión ingenua', codigo: ing }, { titulo: 'Con memoización (top-down)', codigo: memo }],
        cols: ['Versión', 'Llamadas'], filas: [[{ t: '`fib(' + n + ')`' }, { in: String(a.n), w: 5 }], [{ t: '`fib_memo(' + n + ')`' }, { in: String(b.n), w: 5 }]],
        pistas: ['En la versión ingenua cuenta todos los nodos del árbol de llamadas (hojas y nodos internos).', 'En la memoizada: cada valor se calcula una vez, pero cada cálculo genera **dos** llamadas (una puede ser un acierto de caché).', 'Número de llamadas memoizadas = 2n − 1 (para n ≥ 1). Comprueba con n pequeño.'],
        explicacion: 'Ingenua: **' + a.n + '** llamadas (≈ 2ⁿ, recalcula subproblemas). Memoizada: **' + b.n + '** llamadas (≈ 2n − 1, O(n)). Los cálculos reales son solo n + 1.'
      };
    }
  });

  /* ---------- implementación: memoización / bottom-up ---------- */
  const fibJS = n => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };
  const tribJS = n => { const t = [0, 0, 1]; for (let i = 3; i <= n; i++) t[i] = t[i - 1] + t[i - 2] + t[i - 3]; return t[n]; };
  const MEMO = [
    { fn: 'fib_memo', enun: 'Escribe `fib_memo(n)` que calcule el n-ésimo número de Fibonacci (fib(0)=0, fib(1)=1) con **recursión y memoización** (un diccionario o `@lru_cache`).', f: fibJS, ns: [0, 1, 2, 10, 30, 32], sol: `def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]` },
    { fn: 'escalera', enun: 'Escribe `escalera(n)` que devuelva de **cuántas formas** se puede subir una escalera de n escalones dando pasos de 1 o 2 (con `escalera(0) = escalera(1) = 1`). Usa **recursión con memoización**.', f: n => fibJS(n + 1), ns: [0, 1, 2, 5, 10, 30, 32], sol: `def escalera(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n <= 1:\n        return 1\n    if n in memo:\n        return memo[n]\n    memo[n] = escalera(n - 1, memo) + escalera(n - 2, memo)\n    return memo[n]` },
    { fn: 'trib', enun: 'La secuencia de **tribonacci** cumple `trib(0)=0, trib(1)=0, trib(2)=1` y `trib(n)=trib(n-1)+trib(n-2)+trib(n-3)`. Escribe `trib(n)` con **recursión y memoización**.', f: tribJS, ns: [0, 1, 2, 3, 10, 25, 30], sol: `def trib(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n < 2:\n        return 0\n    if n == 2:\n        return 1\n    if n in memo:\n        return memo[n]\n    memo[n] = trib(n - 1, memo) + trib(n - 2, memo) + trib(n - 3, memo)\n    return memo[n]` }
  ];
  B({
    id: 'n3-impl-memo', n: 3, e: 'B', dif: 3, c: ['pd_memo', 'pd_dp', 'pd_escalera'], tema: 'Implementar memoización',
    gen(rng, K) {
      const m = rng.pick(MEMO);
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: m.fn, enunciado: m.enun + '\n\nSe probará con valores de n grandes (p. ej. n = 30): la versión recursiva ingenua tardaría demasiado y será rechazada. **No uses un diccionario/lista como valor por defecto** (`cache={}`).',
        starter: `def ${m.fn}(n):\n    # tu código aquí\n    pass`, solucion: m.sol, maxSteps: 250000,
        tests: m.ns.map(n => ({ e: `${m.fn}(${n})`, r: String(m.f(n)) })),
        reglas: [{ t: 'noUsa', re: /def\s+\w+\s*\([^)]*=\s*(\{\}|\[\]|dict\(\))/, msg: 'No uses un valor por defecto mutable para la caché (se comparte entre llamadas): usa `None` y créalo dentro.' }],
        ejemploLlamada: m.fn + '(10)',
        pistas: ['Parte de la versión recursiva ingenua; el problema es que **recalcula** los mismos subproblemas.', 'Agrega una caché (diccionario): antes de calcular pregunta `if n in cache`; después de calcular, guarda `cache[n] = …`.', 'Patrón: `def f(n, cache=None): if cache is None: cache = {}` … y pasa `cache` en las llamadas recursivas (o usa `@lru_cache(maxsize=None)`).'],
        explicacion: 'Memoización: O(2ⁿ) → O(n).\n```\n' + m.sol + '\n```'
      };
    }
  });

  const BU = [
    { fn: 'escalera', enun: 'Escribe `escalera(n)` (formas de subir n escalones con pasos de 1 o 2; `escalera(0)=escalera(1)=1`) de forma **iterativa bottom-up con O(1) de memoria**: guarda solo los dos últimos valores.', f: n => fibJS(n + 1), ns: [0, 1, 2, 5, 10, 40, 70], sol: `def escalera(n):\n    a, b = 1, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a` },
    { fn: 'fib_iter', enun: 'Escribe `fib_iter(n)` (fib(0)=0, fib(1)=1) de forma **iterativa bottom-up con O(1) de memoria**: guarda solo los dos últimos valores.', f: fibJS, ns: [0, 1, 2, 10, 50, 70], sol: `def fib_iter(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a` }
  ];
  B({
    id: 'n3-impl-bottomup', n: 3, e: 'B', dif: 3, c: ['pd_dp', 'pd_escalera', 'rc_iter'], tema: 'Bottom-up O(1) memoria',
    gen(rng, K) {
      const m = rng.pick(BU);
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: m.fn, enunciado: m.enun + '\n\nNo uses recursión, listas ni diccionarios.', starter: `def ${m.fn}(n):\n    # tu código aquí\n    pass`, solucion: m.sol,
        tests: m.ns.map(n => ({ e: `${m.fn}(${n})`, r: String(m.f(n)) })),
        reglas: [{ t: 'conBucle', fn: m.fn }, { t: 'noRecursiva', fn: m.fn }, { t: 'noUsa', re: /\[|\{|dict|list\(/, msg: 'Para O(1) de memoria solo guarda dos variables: no uses listas ni diccionarios.' }],
        ejemploLlamada: m.fn + '(10)',
        pistas: ['Bottom-up: calcula desde los casos pequeños hacia n, sin recursión.', 'Para calcular el siguiente valor solo necesitas los **dos anteriores**: guárdalos en dos variables.', 'En cada vuelta: `a, b = b, a + b` (asignación simultánea).'],
        explicacion: 'Tiempo O(n), memoria O(1).\n```\n' + m.sol + '\n```'
      };
    }
  });

  B({
    id: 'n3-coin-completar', n: 3, e: 'B', dif: 3, c: ['pd_coin', 'pd_dp'], tema: 'Cambio de monedas (código)',
    gen(rng, K) {
      const sol = `def min_monedas(monedas, V):\n    INF = float('inf')\n    dp = [0] + [INF] * V\n    for v in range(1, V + 1):\n        for c in monedas:\n            if c <= v and dp[v - c] + 1 < dp[v]:\n                dp[v] = dp[v - c] + 1\n    return dp[V] if dp[V] != INF else -1`;
      const H = [['dp = [0] + [INF] * V', '[INF] * V', ['[INF] * V', '[INF]*V']], ['range(1, V + 1)', 'V + 1', ['V + 1', '1 + V']], ['if c <= v and', 'c <= v', ['c <= v', 'v >= c']], ['and dp[v - c] + 1 < dp[v]', 'dp[v - c] + 1', ['dp[v - c] + 1', '1 + dp[v - c]', 'dp[v-c] + 1']], ['else -1', '-1', ['-1']]];
      const ids = rng.sample([0, 1, 2, 3, 4], rng.int(3, 4)).sort((a, b) => a - b);
      let pl = sol; const resp = {};
      ids.forEach((hi, k) => {
        const [ctx, frag, alts] = H[hi]; const p = pl.indexOf(ctx); const q = ctx.indexOf(frag);
        pl = pl.slice(0, p) + ctx.slice(0, q) + '\uE000' + String.fromCharCode(0xE100 + k) + '\uE001' + ctx.slice(q + frag.length) + pl.slice(p + ctx.length); resp[String(k + 1)] = alts;
      });
      pl = pl.replace(/\uE000(.)\uE001/g, (m, c) => '[[' + (c.charCodeAt(0) - 0xE100 + 1) + ']]');
      const juegos = [[[1, 3, 4], 6, 2], [[1, 5, 10, 25], 63, 6], [[2], 3, -1], [[1, 5, 6], 10, 2], [[5, 7], 12, 2], [[3, 7], 11, -1], [[1, 2, 5], 11, 3]];
      const tests = rng.sample(juegos, 5).map(([m, v, r]) => ({ e: `min_monedas(${JSON.stringify(m)}, ${v})`, r: String(r) }));
      return {
        tipo: 'codigo', modoEj: 'completar', fn: 'min_monedas', enunciado: 'Completa la función de **programación dinámica bottom-up** que devuelve el **mínimo número de monedas** para formar `V` (o `-1` si es imposible). `dp[v]` guarda el mínimo para el valor `v`.',
        plantilla: pl, respuestas: resp, solucion: sol, tests, anchos: { 1: 10, 2: 6, 3: 8, 4: 14, 5: 4 }, ejemploLlamada: 'min_monedas([1, 3, 4], 6)',
        pistas: ['`dp[v]` empieza en infinito (aún no se sabe formar v) excepto `dp[0] = 0`.', 'Para cada valor v y cada moneda c que **quepa** (c ≤ v): usar c cuesta 1 moneda + lo que cueste formar `v − c`.', 'Un valor sigue en infinito si no se puede formar: por eso se devuelve −1.'],
        explicacion: 'Código completo:\n```\n' + sol + '\n```\nCosto O(V × monedas).'
      };
    }
  });

  B({
    id: 'n3-coin-tabla', n: 3, e: 'B', dif: 3, c: ['pd_coin'], tema: 'Tabla dp de cambio',
    gen(rng, K) {
      const sets = [[1, 3, 4], [1, 4, 5], [2, 3], [1, 5, 6], [1, 2, 5]]; const mon = rng.pick(sets); const V = rng.int(6, 9);
      const code = `def tabla_dp(monedas, V):\n    INF = float('inf')\n    dp = [0] + [INF] * V\n    for v in range(1, V + 1):\n        for c in monedas:\n            if c <= v and dp[v - c] + 1 < dp[v]:\n                dp[v] = dp[v - c] + 1\n    return dp`;
      const s = Py.sesion(code); const r = s.evaluar(`tabla_dp(${JSON.stringify(mon)}, ${V})`); const vals = r.v.map(x => (x === Infinity ? '∞' : String(x)));
      const filas = []; const cols = [];
      for (let v = 0; v <= V; v++) filas.push([{ t: String(v) }, v === 0 ? { t: '0' } : { in: vals[v] === '∞' ? ['inf', '∞', 'infinito'] : vals[v], w: 4 }]);
      return {
        tipo: 'tabla', enunciado: 'Con monedas **' + JSON.stringify(mon) + '**, completa la tabla `dp[v]` (mínimo de monedas para formar v; escribe `inf` si es imposible) que construye este algoritmo hasta V = ' + V + '.', codigoVista: code,
        cols: ['v', 'dp[v]'], filas,
        pistas: ['`dp[0] = 0`. Para cada v prueba cada moneda c ≤ v: `dp[v] = min(dp[v], dp[v − c] + 1)`.', 'Completa en orden: v = 1, 2, 3… Cada celda usa celdas anteriores de la tabla.', 'Si ninguna moneda permite llegar a v (todas dan infinito), se queda en `inf`.'],
        explicacion: 'dp = [' + vals.join(', ') + ']. Cada celda usa los valores ya calculados (esto es lo que evita recalcular).'
      };
    }
  });

  const BIGO3 = [
    { en: 'Hallar dos elementos de una lista de n números que sumen S probando **todos los pares** (fuerza bruta).', t: 'n2', j: ['Hay n(n−1)/2 pares y cada comprobación es O(1).', 'Se recorre la lista una sola vez.', 'Se divide la lista a la mitad en cada paso.'] },
    { en: 'Resolver el agente viajero (TSP) con **n ciudades** por fuerza bruta (probar todas las rutas).', t: 'nfact', j: ['Existen n! rutas posibles y se evalúan todas.', 'Hay n² pares de ciudades y eso es todo.', 'Se descartan rutas mediante poda y por eso es polinomial.'] },
    { en: 'Calcular `fib(n)` con la recursión ingenua `fib(n-1) + fib(n-2)`.', t: '2n', j: ['Cada llamada genera dos llamadas y se recalculan subproblemas: árbol de llamadas exponencial.', 'Hace n llamadas, una por valor.', 'Divide n por la mitad en cada llamada.'] },
    { en: 'Calcular `fib(n)` con **memoización** (cada subproblema se calcula una vez).', t: 'n', j: ['Hay n + 1 subproblemas distintos y cada uno cuesta O(1).', 'Sigue siendo exponencial porque es recursiva.', 'Es constante gracias a la caché.'] },
    { en: 'Mínimo de monedas para formar V con **m denominaciones** usando programación dinámica bottom-up (tabla dp de tamaño V+1).', t: 'Vm', j: ['Para cada uno de los V valores se prueban las m monedas: V × m.', 'Solo se recorre la tabla una vez: V.', 'Se prueban todas las combinaciones posibles: exponencial.'] },
    { en: 'Colocar `n` reinas probando **todas** las posiciones de una reina por fila sin poda (n columnas en cada una de las n filas).', t: 'nn', j: ['Hay n elecciones por fila en n filas: nⁿ colocaciones completas.', 'Cada reina se coloca en O(1): total O(n).', 'La poda reduce el problema a n².'] }
  ];
  B({
    id: 'n3-bigo-paradigma', n: 3, e: 'B', dif: 3, c: ['pd_fb', 'pd_dp', 'pd_memo', 'cx_tasas'], tema: 'Complejidad de paradigmas',
    gen(rng, K) {
      const p = rng.pick(BIGO3); const escala = p.t === 'Vm' ? ['n', 'Vm', 'n2', '2n', 'nfact'] : (p.t === 'nn' ? ['n', 'n2', '2n', 'nfact', 'nn'] : ['1', 'n', 'nlogn', 'n2', '2n', 'nfact']);
      return {
        tipo: 'bigo', enunciado: '¿Cuál es la complejidad temporal (peor caso) de este enfoque?\n\n> ' + p.en, tiempo: p.t, escala, etq: { nn: 'O(nⁿ)', Vm: 'O(V·m)' },
        justif: { opciones: rng.shuffle([{ t: p.j[0], ok: true }, { t: p.j[1], ok: false, why: 'No es el razonamiento correcto.' }, { t: p.j[2], ok: false, why: 'No es el razonamiento correcto.' }]) },
        pistas: ['Cuenta cuántas veces se realiza el trabajo básico en función de n (o de V y m).', 'Recuerda los datos de clase: TSP por fuerza bruta O(n!), pares O(n²), Fibonacci ingenuo O(2ⁿ), con memoización O(n), cambio de monedas DP O(V × monedas).', 'Piensa en cuántas soluciones candidatas se enumeran.'],
        explicacion: p.j[0]
      };
    }
  });

  B({
    id: 'n3-backtracking', n: 3, e: 'B', dif: 4, c: ['pd_bt', 'pd_fb', 'cx_tasas'], tema: 'Poda en N-reinas',
    gen(rng, K) {
      const N = rng.int(4, 6);
      const code = `def n_reinas(n):\n    soluciones = []\n    def seguro(cols, c):\n        fila = len(cols)\n        for i, cc in enumerate(cols):\n            if cc == c or abs(cc - c) == fila - i:\n                return False\n        return True\n    def colocar(cols):\n        if len(cols) == n:\n            soluciones.append(cols[:])\n            return\n        for c in range(n):\n            if seguro(cols, c):\n                cols.append(c)\n                colocar(cols)\n                cols.pop()\n    colocar([])\n    return soluciones`;
      const r = K.llamadas(code, `len(n_reinas(${N}))`, 'colocar');
      const nsol = r.valor;
      return {
        tipo: 'tabla', enunciado: 'El código resuelve **N-reinas con backtracking**: coloca una reina por fila y retrocede en cuanto dos reinas se atacan. Para **N = ' + N + '**, completa:', codigoVista: code,
        cols: ['Concepto', 'Valor'], filas: [[{ t: 'Colocaciones completas **sin poda** (una reina por fila, cualquier columna): Nᴺ' }, { in: String(Math.pow(N, N)), w: 6 }], [{ t: 'Soluciones válidas que encuentra `n_reinas(' + N + ')`' }, { in: nsol, w: 4 }], [{ t: 'Veces que se ejecuta `colocar` (con poda)' }, { in: String(r.n), w: 6 }]],
        pistas: ['Sin poda hay N elecciones de columna en cada una de las N filas: Nᴺ combinaciones.', 'Las soluciones válidas son colocaciones donde ninguna pareja de reinas se ataca (para N=4 hay 2, para N=5 hay 10, para N=6 hay 4).', 'La tercera cifra se obtiene siguiendo el código; basta saber que es **mucho menor** que Nᴺ: la poda corta ramas.'],
        explicacion: 'Sin poda: ' + Math.pow(N, N) + ' colocaciones. Con backtracking: ' + r.n + ' llamadas a `colocar` y ' + nsol + ' soluciones. La poda explora mucho menos (S5-C2, diap. 10).'
      };
    }
  });

  const ESCEN = [
    { t: 'Calcular el **mínimo número de monedas** para formar un valor V con denominaciones arbitrarias, por ejemplo {1, 3, 4}.', par: ['programacion dinamica', 'dinamica', ' dp '], just: ['solap', 'greedy falla', 'contraejemplo', 'subproblemas', 'tabla'], cx: ['v x', 'v*m', 'v·m', 'o(v'], model: '**Programación dinámica** (bottom-up): los subproblemas «mínimo para v−c» se **solapan** y se reutilizan en una tabla `dp`. Greedy no sirve porque no garantiza el óptimo (con {1,3,4} y V = 6 da 3 monedas y lo óptimo es 2). Costo **O(V × monedas)**.' },
    { t: 'Ordenar una lista de **10 millones de números**.', par: ['divide y venceras', 'divide y vencer', 'merge', 'quick'], just: ['independiente', 'mitad', 'combin', 'dividir'], cx: ['n log n', 'nlogn', 'n*log'], model: '**Divide y vencerás** (merge sort / quicksort): se parte el arreglo en subproblemas **independientes**, se ordena cada parte y se **combina**. Costo **O(n log n)**.' },
    { t: 'Encontrar todas las formas de **colocar N reinas** en un tablero N×N sin que se ataquen.', par: ['backtracking', 'vuelta atras', 'retroceso'], just: ['poda', 'podar', 'abandon', 'restriccion', 'retroced'], cx: ['n!', 'exponencial', 'nn', 'n^n'], model: '**Backtracking**: fuerza bruta que coloca una reina por fila y **poda** (abandona la rama) apenas dos reinas se atacan; explora mucho menos que probar todas las colocaciones. En el peor caso su costo es exponencial (del orden de nⁿ o n!), pero la poda lo reduce enormemente.' },
    { t: 'Calcular **fib(60)** de forma eficiente.', par: ['programacion dinamica', 'memoiz', 'dinamica', 'bottom'], just: ['solap', 'repite', 'recalcul', 'cache', 'tabla'], cx: ['o(n)', 'lineal', 'n)'], model: '**Programación dinámica** (memoización top-down o bottom-up): los subproblemas fib(k) se **solapan**, así que se guardan y se reutilizan. Pasa de O(2ⁿ) a **O(n)**.' },
    { t: 'Dar cambio con monedas {1, 5, 10, 25} usando el **mínimo de monedas**.', par: ['greedy', 'voraz'], just: ['canonic', 'optimo local', 'mayor moneda', 'mas grande', 'sistema'], cx: ['o(m', 'rapid', 'lineal', 'o(1'], model: '**Greedy**: en un sistema de monedas **canónico** tomar siempre la mayor moneda que quepa da el óptimo; es rápido (no explora combinaciones). Ojo: con sistemas como {1,3,4} ya no funcionaría.' }
  ];
  B({
    id: 'n3-elegir-justificar', n: 3, e: 'C', dif: 4, c: ['in_paradigma', 'pd_cinco'], tema: 'Elegir y justificar',
    gen(rng, K) {
      const s = rng.pick(ESCEN);
      return {
        tipo: 'abierta', fmt: 'Pregunta de razonamiento', enunciado: 'Problema: ' + s.t + '\n\n**¿Qué paradigma elegirías, por qué (qué propiedad del problema lo justifica) y cuál es el costo aproximado?**', filas: 6,
        criterios: [
          { desc: 'Nombra el **paradigma adecuado**.', claves: s.par.map(x => x.trim()) },
          { desc: 'Justifica con la **propiedad** del problema (' + (s.just.slice(0, 3).join(' / ')) + ').', claves: s.just },
          { desc: 'Menciona el **costo** aproximado (complejidad).', claves: s.cx }
        ],
        modelo: s.model,
        pistas: ['Pregúntate: ¿los subproblemas se repiten? ¿son independientes? ¿hay una decisión local óptima? ¿hay restricciones para podar?', 'Una buena justificación nombra la **propiedad** que hace válido el paradigma (solapados, independientes, poda, óptimo local…).', 'Cierra con el costo (complejidad) y, si ayuda, un contraejemplo del paradigma que descartaste.'],
        explicacion: s.model
      };
    }
  });

  const DEP3 = [
    {
      fn: 'fib_memo', bug: 'La caché nunca se llena: el resultado calculado no se guarda, así que se recalcula todo (sigue siendo exponencial).', start: `def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    return fib_memo(n - 1, cache) + fib_memo(n - 2, cache)`,
      sol: `def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]`, tests: [['fib_memo(10)', '55'], ['fib_memo(30)', '832040'], ['fib_memo(32)', '2178309']], p: ['El resultado es correcto, pero prueba `fib_memo(32)`: ¿tarda demasiado? Revisa si la caché se usa.', 'Se pregunta `if n in cache`, pero ¿en algún momento se **escribe** en la caché?', 'Antes de devolver, guarda: `cache[n] = …` y devuelve `cache[n]`.'], steps: 200000
    },
    {
      fn: 'escalera', bug: 'Falta el caso base n == 0 (solo cubre n == 1): escalera(2) llama a escalera(0), que nunca termina.', start: `def escalera(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n == 1:\n        return 1\n    if n in memo:\n        return memo[n]\n    memo[n] = escalera(n - 1, memo) + escalera(n - 2, memo)\n    return memo[n]`,
      sol: `def escalera(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n <= 1:\n        return 1\n    if n in memo:\n        return memo[n]\n    memo[n] = escalera(n - 1, memo) + escalera(n - 2, memo)\n    return memo[n]`, tests: [['escalera(0)', '1'], ['escalera(1)', '1'], ['escalera(2)', '2'], ['escalera(5)', '8'], ['escalera(20)', '10946']], p: ['Prueba `escalera(2)` en la consola: ¿qué ocurre?', 'escalera(2) necesita escalera(1) y escalera(0). ¿Qué pasa con escalera(0) en este código?', 'El caso base debe cubrir tanto n = 0 como n = 1: `if n <= 1: return 1`.']
    },
    {
      fn: 'min_monedas', bug: 'Falta inicializar dp[0] = 0: todos los valores quedan en infinito y siempre devuelve −1.', start: `def min_monedas(monedas, V):\n    INF = float('inf')\n    dp = [INF] * (V + 1)\n    for v in range(1, V + 1):\n        for c in monedas:\n            if c <= v and dp[v - c] + 1 < dp[v]:\n                dp[v] = dp[v - c] + 1\n    return dp[V] if dp[V] != INF else -1`,
      sol: `def min_monedas(monedas, V):\n    INF = float('inf')\n    dp = [INF] * (V + 1)\n    dp[0] = 0\n    for v in range(1, V + 1):\n        for c in monedas:\n            if c <= v and dp[v - c] + 1 < dp[v]:\n                dp[v] = dp[v - c] + 1\n    return dp[V] if dp[V] != INF else -1`, tests: [['min_monedas([1, 3, 4], 6)', '2'], ['min_monedas([2], 3)', '-1'], ['min_monedas([1, 5, 10, 25], 63)', '6'], ['min_monedas([5, 7], 12)', '2']], p: ['Prueba `min_monedas([1], 3)` en la consola: debería devolver 3.', 'Cada celda depende de `dp[v - c]`. ¿Cuánto vale `dp[0]` al empezar?', 'Falta el caso base de la tabla: `dp[0] = 0` (formar 0 cuesta 0 monedas).']
    },
    {
      fn: 'min_rec', bug: 'La caché por defecto `memo={}` se comparte entre llamadas distintas: guarda resultados de un juego de monedas anterior y los reutiliza con otro.', start: `def min_rec(monedas, V, memo={}):\n    if V == 0:\n        return 0\n    if V in memo:\n        return memo[V]\n    mejor = float('inf')\n    for c in monedas:\n        if c <= V:\n            mejor = min(mejor, 1 + min_rec(monedas, V - c, memo))\n    memo[V] = mejor\n    return mejor`,
      sol: `def min_rec(monedas, V, memo=None):\n    if memo is None:\n        memo = {}\n    if V == 0:\n        return 0\n    if V in memo:\n        return memo[V]\n    mejor = float('inf')\n    for c in monedas:\n        if c <= V:\n            mejor = min(mejor, 1 + min_rec(monedas, V - c, memo))\n    memo[V] = mejor\n    return mejor`, tests: [['min_rec([1, 3, 4], 6)', '2'], ['min_rec([2, 5], 9)', '3'], ['min_rec([1, 5], 10)', '2'], ['min_rec([4, 6], 10)', '2']], p: ['Cada prueba usa monedas distintas. ¿Los resultados de la primera llamada deberían influir en la segunda?', 'Fíjate en `memo={}` en el encabezado: se crea **una sola vez**.', 'Usa `memo=None` y crea el diccionario dentro de la función.']
    },
    {
      fn: 'potencia', bug: 'Se hacen dos llamadas recursivas iguales sobre la mitad: se pierde la ganancia de dividir (cuesta O(n) en vez de O(log n)).', start: `def potencia(x, n):\n    if n == 0:\n        return 1\n    if n % 2 == 0:\n        return potencia(x, n // 2) * potencia(x, n // 2)\n    return x * potencia(x, n // 2) * potencia(x, n // 2)`,
      sol: `def potencia(x, n):\n    if n == 0:\n        return 1\n    m = potencia(x, n // 2)\n    if n % 2 == 0:\n        return m * m\n    return x * m * m`, tests: [['potencia(2, 10)', '1024'], ['potencia(3, 5)', '243'], ['potencia(2, 0)', '1'], ['potencia(1, 20000)', '1']], p: ['El resultado es correcto, pero prueba `potencia(1, 20000)`: ¿cuántas llamadas hace?', 'Calcula `potencia(x, n // 2)` **dos veces** en la misma línea: ¿se puede hacer una sola?', 'Guarda el resultado de la mitad en una variable `m` y reutilízala.'], steps: 120000
    }
  ];
  B({
    id: 'n3-depurar-memo', n: 3, e: 'C', dif: 4, c: ['pd_memo', 'pd_errores', 'rc_cache', 'in_depurar'], tema: 'Depurar DP/memoización',
    gen(rng, K) {
      const d = rng.pick(DEP3);
      return {
        tipo: 'codigo', modoEj: 'depurar', fn: d.fn, enunciado: 'Esta solución de **programación dinámica / divide y vencerás** tiene un error. Encuéntralo y corrígelo. (Algunas pruebas son de **eficiencia**: una solución lenta se rechaza.)', starter: d.start, solucion: d.sol,
        tests: d.tests.map(t => ({ e: t[0], r: t[1] })), maxSteps: d.steps || 400000, ejemploLlamada: d.tests[0][0], pistas: d.p, explicacion: '**Error:** ' + d.bug + '\n```\n' + d.sol + '\n```'
      };
    }
  });

  const greedyJS = (m, V) => { let n = 0; m = m.slice().sort((a, b) => b - a); for (const c of m) { n += Math.floor(V / c); V %= c; } return n; };
  const dpJS = (m, V) => { const dp = [0]; for (let v = 1; v <= V; v++) { dp[v] = Infinity; for (const c of m) if (c <= v && dp[v - c] + 1 < dp[v]) dp[v] = dp[v - c] + 1; } return dp[V]; };
  B({
    id: 'n3-contraejemplo', n: 3, e: 'C', dif: 4, c: ['pd_greedy', 'in_justificar'], tema: 'Contraejemplo de greedy',
    gen(rng, K) {
      const buenos = [[[1, 5, 10, 25], 63], [[1, 2, 5, 10], 38], [[1, 2, 5], 13], [[1, 5, 10], 28], [[1, 10, 100], 273], [[1, 2, 5, 10, 20], 47]];
      const malos = [[[1, 3, 4], 6], [[1, 5, 6], 10], [[1, 7, 10], 14], [[1, 3, 4], 10], [[1, 6, 10], 12]];
      const sel = rng.sample(buenos, 3), mal = rng.pick(malos);
      const fmt = ([m, v]) => '`monedas = ' + JSON.stringify(m) + '`, `V = ' + v + '`';
      const opciones = rng.shuffle(sel.map(p => ({ t: fmt(p), ok: false, why: 'Greedy da ' + greedyJS(...p) + ' monedas y el óptimo también es ' + dpJS(...p) + ': aquí funciona.' })).concat([{ t: fmt(mal), ok: true, why: 'Greedy da ' + greedyJS(...mal) + ' monedas pero el óptimo es ' + dpJS(...mal) + ': ¡contraejemplo!' }]));
      return {
        tipo: 'opcion', multi: false, enunciado: '¿Para cuál de estos casos el algoritmo **greedy** (tomar siempre la mayor moneda que quepa) **NO** da el mínimo de monedas?', opciones,
        pistas: ['Calcula, para cada caso, lo que da greedy y busca si existe otra combinación con menos monedas.', 'Un contraejemplo típico mezcla una moneda grande «incómoda» con dos monedas intermedias que suman justo el valor.', 'En los sistemas canónicos (como las monedas reales) greedy siempre es óptimo; busca el sistema «raro».'],
        explicacion: 'Un solo contraejemplo basta para refutar «greedy siempre es óptimo». Aquí falla el caso ' + fmt(mal) + '.'
      };
    }
  });

  B({
    id: 'n3-mixta', n: 3, e: 'C', dif: 4, c: ['pd_memo', 'pd_dp', 'cx_espacial'], tema: 'Análisis integral de DP',
    gen(rng, K) {
      const n = rng.int(6, 10);
      const code = `def formas(n, memo=None):\n    if memo is None:\n        memo = {}\n    if n <= 1:\n        return 1\n    if n in memo:\n        return memo[n]\n    memo[n] = formas(n - 1, memo) + formas(n - 2, memo)\n    return memo[n]`;
      const llam = K.llamadas(code, `formas(${n})`, 'formas');
      return {
        tipo: 'mixta', enunciado: 'Analiza la función `formas` (formas de subir una escalera de n escalones con pasos de 1 o 2).', codigoVista: code,
        partes: [
          { titulo: 'Paradigma', peso: 1, q: { tipo: 'opcion', enunciado: '¿Qué paradigma y qué enfoque usa?', opciones: rng.shuffle([{ t: 'Programación dinámica **top-down** (memoización).', ok: true, why: 'Recursión natural + caché.' }, { t: 'Programación dinámica **bottom-up** (tabulación).', ok: false, why: 'No es iterativa: es recursiva con caché.' }, { t: 'Divide y vencerás.', ok: false, why: 'Los subproblemas se solapan, no son independientes.' }, { t: 'Greedy.', ok: false, why: 'No toma decisiones locales irreversibles.' }]) } },
          { titulo: 'Llamadas', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuántas veces se ejecuta `formas` al evaluar `formas(' + n + ')`?', esperado: String(llam.n), placeholder: 'Número' } },
          { titulo: 'Complejidad', peso: 1.5, q: { tipo: 'bigo', pideEspacio: true, enunciado: 'Tiempo y espacio (caché + pila):', tiempo: 'n', espacio: 'n', escala: ['1', 'logn', 'n', 'nlogn', 'n2', '2n'], etqS: 'Espacio' } }
        ],
        pistas: ['a) ¿Hay recursión con caché (top-down) o un ciclo que llena una tabla (bottom-up)?', 'b) Cada valor de n se calcula una vez, pero cada cálculo genera dos llamadas; cuenta también las que terminan en el caso base o en la caché.', 'c) Hay n+1 cálculos distintos con trabajo constante; la caché tiene hasta n entradas y la pila llega a profundidad n.'],
        explicacion: 'Memoización: DP top-down. ' + llam.n + ' llamadas (≈ 2n−1). Tiempo O(n), espacio O(n).'
      };
    }
  });

  const ORD3 = [
    { t: 'Divide y vencerás', items: ['**Dividir** el problema en subproblemas independientes', '**Vencer**: resolver cada subproblema (recursivamente)', '**Combinar** las soluciones parciales en la solución final'] },
    { t: 'fib con memoización (top-down)', items: ['Si `n < 2`, devolver `n` (caso base)', 'Si `n` ya está en la caché, devolver `cache[n]`', 'Calcular `fib(n-1) + fib(n-2)` recursivamente', 'Guardar el resultado en `cache[n]`', 'Devolver `cache[n]`'] },
    { t: 'cambio de monedas bottom-up', items: ['Crear `dp` con `dp[0] = 0` y el resto en infinito', 'Recorrer cada valor `v` de 1 a V', 'Para cada moneda `c` con `c <= v`, calcular `dp[v - c] + 1`', 'Actualizar `dp[v]` si el nuevo valor es menor', 'Devolver `dp[V]` (o −1 si sigue en infinito)'] },
    { t: 'backtracking (N-reinas)', items: ['Elegir una columna para la reina de la fila actual', 'Comprobar si la posición ataca a alguna reina ya colocada', 'Si es segura, colocar la reina y avanzar a la fila siguiente', 'Si se llega a una fila sin posiciones seguras, **retroceder** y probar otra columna'] }
  ];
  B({
    id: 'n3-orden-pasos', n: 3, e: 'B', dif: 2, c: ['pd_dyc', 'pd_memo', 'pd_coin', 'pd_bt'], tema: 'Ordenar pasos de un algoritmo',
    gen(rng, K) {
      const o = rng.pick(ORD3); const idx = o.items.map((_, i) => i); let ini = rng.shuffle(idx); if (ini.every((x, i) => x === i)) ini = idx.slice().reverse();
      return {
        tipo: 'orden', enunciado: 'Ordena los pasos del algoritmo: **' + o.t + '**.', items: o.items, correcto: idx, inicial: ini,
        pistas: ['Piensa en qué debe ocurrir primero para que el siguiente paso tenga sentido.', 'Los casos base y las consultas a la caché van antes del cálculo recursivo.', 'Lo que se devuelve o combina va al final.'],
        explicacion: 'Orden correcto: ' + o.items.map((s, i) => (i + 1) + '. ' + s).join(' → ')
      };
    }
  });

  const TB = [
    ['Recursión natural más una caché de resultados', 0, 'Es la memoización (top-down).'], ['Iterativo: llena una tabla empezando desde F₀, F₁, F₂…', 1, 'Tabulación (bottom-up).'], ['Se implementa con `@lru_cache(maxsize=None)`', 0, 'lru_cache memoiza una función recursiva.'],
    ['Calcula Fₙ pidiendo Fₙ₋₁ y Fₙ₋₂ y guardando los resultados', 0, 'Pide los subproblemas bajo demanda (top-down).'], ['Puede reducirse a O(1) de memoria guardando solo los dos últimos valores', 1, 'En bottom-up se descartan los valores que ya no se necesitan.'], ['Resuelve primero los subproblemas más pequeños, en orden', 1, 'Bottom-up: de abajo hacia arriba.'], ['Riesgo de `RecursionError` con n muy grande', 0, 'Depende de la recursión (pila).']
  ];
  B({
    id: 'n3-top-bottom', n: 3, e: 'B', dif: 3, c: ['pd_dp', 'pd_memo'], tema: 'Top-down vs bottom-up',
    gen(rng, K) {
      const items = rng.sample(TB, 5).map(t => ({ t: t[0], cat: t[1], why: t[2] }));
      return {
        tipo: 'clasificar', enunciado: 'Clasifica cada descripción como **top-down (memoización)** o **bottom-up (tabulación)**.', categorias: ['Top-down (memoización)', 'Bottom-up (tabulación)'], items,
        pistas: ['Top-down = parte del problema grande y baja recursivamente; bottom-up = parte de los casos pequeños y sube.', 'Si hay recursión + caché → top-down. Si hay un ciclo que llena una tabla → bottom-up.', 'El ahorro de memoria a O(1) es típico de bottom-up.'],
        explicacion: 'Dos enfoques de DP (S5-C2, diap. 13): top-down (recursión + caché) y bottom-up (iterativo con tabla).'
      };
    }
  });

  B({
    id: 'n3-abierta-dyc-dp', n: 3, e: 'C', dif: 3, c: ['pd_dyc', 'pd_dp', 'pd_errores'], tema: 'Diferenciar DyV y DP',
    gen(rng, K) {
      return {
        tipo: 'abierta', enunciado: '**Diferencie divide y vencerás de programación dinámica** con un ejemplo de cada uno.',
        criterios: [
          { desc: 'Explica que en **divide y vencerás** los subproblemas son **independientes** (no se repiten).', claves: ['independiente', ['no', 'se repiten'], ['no', 'se solapan'], ['sin', 'solapamiento']] },
          { desc: 'Explica que en **programación dinámica** los subproblemas **se solapan** y se resuelven una vez (se reutilizan).', claves: ['solapa', 'se repiten', 'reutiliz', 'recalcul', 'memoiz', 'cache', 'tabla'] },
          { desc: 'Da un **ejemplo de DyV** (merge sort, quicksort, búsqueda binaria).', claves: ['merge', 'quick', 'binaria', 'mergesort'] },
          { desc: 'Da un **ejemplo de DP** (Fibonacci, mochila, cambio de monedas, escalera).', claves: ['fibonacci', 'fib', 'mochila', 'cambio de moneda', 'monedas', 'escalera'] }
        ],
        modelo: 'En **divide y vencerás** el problema se divide en subproblemas **independientes**, que se resuelven (recursivamente) y se combinan; ejemplo: merge sort. En **programación dinámica** los subproblemas **se solapan** (se repiten), por eso se resuelven una sola vez y se reutilizan (memoización o tabla); ejemplo: Fibonacci o la mochila.',
        pistas: ['Piensa en la propiedad clave que diferencia a ambos: ¿los subproblemas se repiten o no?', 'Ejemplo DyV: algoritmo de ordenamiento que parte a la mitad. Ejemplo DP: secuencia donde fib(n) depende de fib(n−1) y fib(n−2).', 'Estructura: definición de DyV + ejemplo; definición de DP + ejemplo.'],
        explicacion: 'S5-C2, diap. 12-13 y verificación formativa 3.'
      };
    }
  });

  B({
    id: 'n3-abierta-greedy', n: 3, e: 'C', dif: 3, c: ['pd_greedy', 'in_justificar'], tema: 'Caso donde greedy falla',
    gen(rng, K) {
      return {
        tipo: 'abierta', enunciado: '**Dé un caso donde un algoritmo greedy falle y explique por qué.** (Pista: usa el problema del cambio con monedas.)',
        criterios: [
          { desc: 'Propone un **contraejemplo concreto** (denominaciones y valor), p. ej. monedas {1, 3, 4} y V = 6.', claves: [['1', '3', '4', '6'], ['1, 3, 4'], ['{1,3,4}'], ['1 5 6', '10'], ['1, 5, 6']] },
          { desc: 'Muestra qué hace greedy (p. ej. 4+1+1 = 3 monedas) y cuál es el óptimo (p. ej. 3+3 = 2 monedas).', claves: [['4', '1', '1'], ['3', '3', 'dos'], ['3 monedas'], ['2 monedas'], ['3+3'], ['3 + 3']] },
          { desc: 'Explica la causa: elegir el **óptimo local** en cada paso (la moneda mayor) no garantiza el óptimo global.', claves: ['optimo local', 'optimo global', 'localmente', 'decision local', 'mejor en ese momento', 'sin reconsiderar', 'no reconsider'] },
          { desc: 'Menciona la alternativa: **programación dinámica** (o backtracking) sí encuentra el óptimo.', claves: ['programacion dinamica', 'dinamica', 'dp', 'backtracking'] }
        ],
        modelo: 'Con monedas {1, 3, 4} y V = 6, greedy toma la mayor que quepa: 4 + 1 + 1 = **3 monedas**, pero 3 + 3 = **2 monedas** es mejor. Greedy elige el **óptimo local** en cada paso sin reconsiderar, y eso no garantiza el óptimo global. La programación dinámica (que explora todas las combinaciones reutilizando subproblemas) sí lo encuentra.',
        pistas: ['Necesitas un ejemplo concreto: denominaciones y un valor.', 'Calcula lo que haría greedy y compáralo con una combinación mejor que encuentres a mano.', 'Cierra explicando por qué: greedy no reconsidera sus decisiones.'],
        explicacion: 'S5-C2, diap. 11 y verificación formativa 4.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
