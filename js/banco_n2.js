/* banco_n2.js — Nivel 2: Complejidad y Big O (S2-C1, S2-C2) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py;
  const ind = (s, n) => s.split('\n').map(l => ' '.repeat(n) + l).join('\n');

  /* ---------- familias de ciclos ---------- */
  const LOOPS = [
    { k: 'n', nmin: 4, nmax: 15, body: N => `for i in range(${N}):\n    c += 1`, j: ['Un solo ciclo de n iteraciones con trabajo constante en cada vuelta.', 'Hay dos ciclos anidados, por eso crece al cuadrado.', 'El índice se divide a la mitad en cada vuelta.'] },
    { k: 'n2', nmin: 4, nmax: 12, body: N => `for i in range(${N}):\n    for j in range(${N}):\n        c += 1`, j: ['Dos ciclos anidados que recorren n elementos cada uno: n · n.', 'El ciclo interno es de tamaño fijo, así que solo cuenta el externo.', 'Los ciclos se ejecutan uno después del otro: n + n.'] },
    { k: 'n2', nmin: 4, nmax: 12, body: N => `for i in range(${N}):\n    for j in range(i):\n        c += 1`, j: ['El interno depende de i: 0 + 1 + … + (n−1) = n(n−1)/2, cuadrático.', 'Como el interno llega solo hasta i, el total es lineal.', 'El interno se acorta cada vez, así que el total es logarítmico.'] },
    { k: 'n2', nmin: 4, nmax: 12, body: N => `for i in range(${N}):\n    for j in range(i + 1, ${N}):\n        c += 1`, j: ['Comparaciones (n−1) + (n−2) + … + 1 = n(n−1)/2, que es cuadrático.', 'Cada ciclo recorre la mitad, por lo tanto es lineal.', 'El interno empieza en i + 1, así que es logarítmico.'] },
    { k: 'n', nmin: 4, nmax: 15, body: N => `for i in range(${N}):\n    for j in range(100):\n        c += 1`, j: ['El interno es de tamaño fijo (100): total 100·n, que es O(n).', 'Dos ciclos anidados siempre dan n².', 'El interno es logarítmico.'] },
    { k: 'logn', nmin: 8, nmax: 1000, body: N => `i = ${N}\nwhile i > 1:\n    i = i // 2\n    c += 1`, j: ['El índice se divide a la mitad en cada vuelta: log₂ n pasos.', 'El índice baja de uno en uno: n pasos.', 'Hay un solo while, así que es constante.'] },
    { k: 'logn', nmin: 8, nmax: 1000, body: N => `j = 1\nwhile j < ${N}:\n    j *= 2\n    c += 1`, j: ['El índice se multiplica por 2 en cada vuelta: ⌈log₂ n⌉ pasos.', 'El índice crece de uno en uno: n pasos.', 'Es constante porque el índice empieza en 1.'] },
    { k: 'nlogn', nmin: 4, nmax: 40, body: N => `for i in range(${N}):\n    j = 1\n    while j < ${N}:\n        j *= 2\n        c += 1`, j: ['Ciclo lineal (n) por ciclo logarítmico (log n): n log n.', 'Dos ciclos anidados siempre dan n².', 'El while hace n pasos, por eso el total es n².'] },
    { k: 'n', nmin: 4, nmax: 15, body: N => `for i in range(${N}):\n    c += 1\nfor j in range(${N}):\n    c += 1`, j: ['Bloques consecutivos: se toma el mayor, no se multiplican. n + n = O(n).', 'Dos ciclos siempre se multiplican: n · n.', 'Dos ciclos suman y por eso son cuadráticos.'] },
    { k: 'n2', nmin: 4, nmax: 12, body: N => `for i in range(${N}):\n    c += 1\nfor i in range(${N}):\n    for j in range(${N}):\n        c += 1`, j: ['Bloques consecutivos: O(n) + O(n²) = O(máx) = O(n²).', 'Se multiplican los tres ciclos: n³.', 'Solo importa el primer bloque: O(n).'] },
    { k: 'n3', nmin: 3, nmax: 8, body: N => `for i in range(${N}):\n    for j in range(i):\n        for k in range(j):\n            c += 1`, j: ['Tres ciclos anidados dependientes: del orden de n³/6, que es cúbico.', 'Cada ciclo interno es más corto, así que baja a n².', 'Tres ciclos suman: n + n + n = O(n).'] }
  ];
  const LOOPS_BIGO = LOOPS.filter(l => l.k !== 'n3' || true);

  B({
    id: 'n2-conteo', n: 2, e: 'A', dif: 2, c: ['cx_conteo', 'cx_ciclos'], tema: 'Conteo de operaciones',
    gen(rng, K) {
      const L = rng.pick(LOOPS); const n = rng.int(L.nmin, L.nmax);
      const code = `n = ${n}\nc = 0\n${L.body('n')}\nprint(c)`; const esp = K.run(code);
      return {
        tipo: 'salida', enunciado: '¿Cuántas veces se ejecuta la línea `c += 1`? (Es el número que imprime el programa.)', codigoVista: code, esperado: esp, stdout: true, numerico: true, placeholder: 'Número de veces',
        pistas: ['Analiza cada ciclo por separado y cuántas vueltas da **con n = ' + n + '**.', 'Si el ciclo interno depende de `i`, cuenta cuántas vueltas da en cada valor de `i` y suma. Si un índice se multiplica o divide, cuenta cuántos pasos hasta salir.', 'Haz una tabla con i = 0, 1, 2, … y las vueltas del interno; luego suma la columna.'],
        explicacion: 'El resultado es **' + esp + '**. Recuerda: ciclos independientes se multiplican, bloques consecutivos se suman, y un índice que se divide/multiplica da ≈ log₂ n pasos.'
      };
    }
  });

  B({
    id: 'n2-bigo-ciclo', n: 2, e: 'A', dif: 2, c: ['cx_ciclos', 'cx_reglas'], tema: 'Big O de ciclos',
    gen(rng, K) {
      const L = rng.pick(LOOPS_BIGO); const v = rng.int(0, 1); const fn = rng.pick(['procesar', 'analizar', 'f', 'calcular']);
      const cab = v === 0 ? `def ${fn}(n):\n    c = 0\n` : `def ${fn}(v):\n    n = len(v)\n    c = 0\n`;
      const code = cab + ind(L.body('n'), 4) + '\n    return c';
      const opciones = rng.shuffle([{ t: L.j[0], ok: true }, { t: L.j[1], ok: false, why: 'Ese razonamiento no corresponde a este código.' }, { t: L.j[2], ok: false, why: 'Ese razonamiento no corresponde a este código.' }]);
      return {
        tipo: 'bigo', enunciado: 'Determina la **complejidad temporal (peor caso)** de `' + fn + '` en función de **n' + (v === 1 ? ' = len(v)' : '') + '** y elige la justificación correcta.', codigoVista: code,
        tiempo: L.k, justif: { opciones },
        pistas: ['Identifica el tamaño de entrada n y cuenta cuántas veces se ejecuta la línea más interna.', 'Reglas: **anidados → se multiplican**; **consecutivos → se toma el mayor**; índice que se **divide o multiplica** → logarítmico; ciclo interno **fijo** → constante.', 'Comprueba tu respuesta con un n pequeño (p. ej. n = 4) y cuenta a mano.'],
        explicacion: 'Respuesta: **' + ET.Tipos.bigo.ETQ[L.k] + '**. ' + L.j[0]
      };
    }
  });

  B({
    id: 'n2-tasas-orden', n: 2, e: 'A', dif: 2, c: ['cx_tasas'], tema: 'Jerarquía de complejidades',
    gen(rng, K) {
      const todos = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(n!)'];
      const idx = rng.sample(todos.map((_, i) => i), 5).sort((a, b) => a - b);
      const items = idx.map(i => '`' + todos[i] + '`');
      const orden = items.map((_, i) => i); let ini = rng.shuffle(orden); if (ini.every((x, i) => x === i)) ini = orden.slice().reverse();
      return {
        tipo: 'orden', enunciado: 'Ordena estas complejidades de la que **menos crece** (más eficiente) a la que **más crece** cuando n es grande.', items, correcto: orden, inicial: ini,
        pistas: ['Piensa en n = 10⁶: ¿cuántas operaciones daría cada una?', 'Jerarquía de clase: 1 < log n < n < n log n < n² < n³ < 2ⁿ < n!.', 'Los exponenciales y factoriales dejan atrás a cualquier polinomio.'],
        explicacion: 'Jerarquía: ' + todos.join(' < ') + '. Hasta n log n el algoritmo "escala"; desde n² solo decenas de miles de datos; desde 2ⁿ solo unas decenas.'
      };
    }
  });

  const VFN = [
    { a: 'Si T(n) = 3n² + 10n + 7, entonces T(n) ∈ O(n²).', v: true, e: 'Con c = 20 y n₀ = 1 se cumple T(n) ≤ c·n² (ejemplo de clase).', j: ['Para n ≥ 1, 10n ≤ 10n² y 7 ≤ 7n², luego T(n) ≤ 20n².', 'Los términos 10n y 7 son mayores que n², por eso no cuentan.', 'Porque 3n² es mayor que 10n + 7 para cualquier n.'] },
    { a: 'T(n) = n²/2 − n/2 pertenece a O(n³).', v: true, e: 'O es una cota superior: n²/2 − n/2 ≤ n³ para n ≥ 1. Es correcta pero inútil (no ajustada).', j: ['O es una cota superior, no una igualdad: cualquier cota mayor también es válida (aunque poco informativa).', 'Es falsa porque n³ solo sirve para algoritmos cúbicos.', 'Es falsa porque la función es cuadrática y por eso no está en O(n³).'] },
    { a: 'Ω(g) describe el orden de crecimiento exacto de T(n).', v: false, e: 'El orden exacto es Θ; Ω es solo una cota inferior.', j: ['Ω es la cota inferior; la que atrapa el orden exacto es Θ (O y Ω a la vez).', 'Ω y Θ son lo mismo.', 'Ω es la cota superior.'] },
    { a: 'O(log₂ n) y O(log₁₀ n) son la misma clase de complejidad.', v: true, e: 'Cambian por una constante: logₐ n = log_b n / log_b a, que O absorbe.', j: ['La base del logaritmo solo introduce una constante multiplicativa, que O absorbe.', 'Porque log₂ n = log₁₀ n para n grande.', 'Porque ambos son constantes.'] },
    { a: 'Por convenio del curso, cuando se dice «la complejidad de un algoritmo» sin aclarar, se refiere al **mejor caso**.', v: false, e: 'El convenio es el **peor caso**: da una garantía.', j: ['El peor caso es una garantía: el algoritmo nunca será peor que eso.', 'El mejor caso es el más fácil de calcular y por eso se prefiere.', 'El caso promedio siempre es igual al mejor caso.'] },
    { a: 'La expresión O(2n² + 3n) es la forma simplificada correcta; no debe reducirse más.', v: false, e: 'Constantes y términos menores se absorben: se escribe O(n²).', j: ['Las constantes y los términos de menor grado están absorbidos por O: queda O(n²).', 'Se simplifica a O(n) porque 3n domina a 2n².', 'Se simplifica a O(2n²) porque el 2 es importante.'] },
    { a: 'En T(n) = O(n), el signo «=» indica que T(n) es **igual** a una función lineal.', v: false, e: 'O(n) es un **conjunto** de funciones; lo riguroso es T(n) ∈ O(n).', j: ['O(n) es un conjunto de funciones y por eso se escribe T(n) ∈ O(n).', 'T(n) es siempre exactamente n.', 'El signo «=» es obligatorio por convenio.'] },
    { a: 'Un algoritmo O(n²) puede ser preferible a uno O(n log n) cuando n es pequeño.', v: true, e: 'O oculta constantes: para n pequeño las constantes deciden (insertion sort gana a merge sort con n < 50).', j: ['La notación O ignora constantes, y con n pequeño estas pueden dominar.', 'Porque n² es siempre menor que n log n.', 'Porque O(n²) es más preciso que O(n log n).'] },
    { a: 'Si al duplicar n el tiempo de un algoritmo se multiplica aproximadamente por 4, su crecimiento es cuadrático.', v: true, e: 'T(2n)/T(n) ≈ 4 indica orden cuadrático.', j: ['Si T(n) = c·n², entonces T(2n) = 4·c·n² = 4·T(n).', 'Una razón 4 indica complejidad exponencial.', 'Una razón 4 indica complejidad lineal.'] },
    { a: 'Dos bloques de código **consecutivos** (uno O(n) y otro O(n²)) tienen complejidad total O(n³), porque se multiplican.', v: false, e: 'Bloques consecutivos: se toma el mayor → O(n²). Se multiplican solo los anidados.', j: ['Consecutivos se suman y la suma se queda con el mayor: O(máx(n, n²)) = O(n²).', 'Siempre se multiplican las complejidades de bloques distintos.', 'Se toma el menor porque se ejecuta primero.'] }
  ];
  B({
    id: 'n2-vf-notacion', n: 2, e: 'A', dif: 2, c: ['cx_formal', 'cx_reglas', 'cx_casos'], tema: 'Notación y reglas (V/F)',
    gen(rng, K) {
      const it = rng.pick(VFN);
      return {
        tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón que la sustenta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Recuerda las definiciones: O = cota superior, Ω = cota inferior, Θ = orden exacto.', 'Aplica las reglas de cálculo: constantes se ignoran, consecutivos → mayor, anidados → producto.', 'Prueba con valores concretos de n para ver si la afirmación se sostiene.']
      };
    }
  });

  B({
    id: 'n2-dominante', n: 2, e: 'A', dif: 2, c: ['cx_dominante', 'cx_reglas'], tema: 'Término dominante',
    gen(rng, K) {
      const a = rng.int(2, 9), b = rng.int(3, 50), c = rng.int(10, 900);
      const F = [
        { s: `T(n) = ${a}n² + ${b}n + ${c}`, k: 'n2', why: 'Domina el término de mayor grado: n².' },
        { s: `T(n) = ${a}n log₂ n + ${b}n + ${c}`, k: 'nlogn', why: 'n log n crece más que n; domina n log n.' },
        { s: `T(n) = ${a}·2ⁿ + ${b}n³ + ${c}`, k: '2n', why: 'Una exponencial supera a cualquier polinomio.' },
        { s: `T(n) = ${a}n³ + ${b}n² log₂ n + ${c}n`, k: 'n3', why: 'El mayor grado (n³) domina.' },
        { s: `T(n) = ${a}n + ${b} log₂ n + ${c}`, k: 'n', why: 'n domina a log n y a la constante.' },
        { s: `T(n) = ${a}n² + ${b}n³ + ${c}n`, k: 'n3', why: 'El mayor grado (n³) domina, aunque aparezca después.' }
      ];
      const f = rng.pick(F); const E = ET.Tipos.bigo.ETQ;
      const todas = ['1', 'logn', 'n', 'nlogn', 'n2', 'n3', '2n'];
      const malas = rng.sample(todas.filter(x => x !== f.k), 3);
      return Object.assign(K.mc(rng, 'Para n muy grande, ¿a qué clase **Θ** pertenece `' + f.s + '`?', [['`' + E[f.k] + '`', f.why]], malas.map(m => ['`' + E[m] + '`', 'No es el término dominante.'])), {
        pistas: ['Al crecer n, constantes y términos de menor grado «se desvanecen».', 'Compara los términos: ¿cuál crece más rápido cuando n → ∞? (1 < log n < n < n log n < n² < n³ < 2ⁿ).', 'La clase la determina únicamente ese término dominante (sin su coeficiente).'],
        explicacion: f.s + ': ' + f.why + ' Por eso T(n) ∈ Θ(' + E[f.k].slice(2, -1) + ').'
      });
    }
  });

  const CASOS = [
    ['x está en la posición 0 de la lista', 0, 'Una sola comparación.'], ['x está en la última posición', 1, 'Hay que revisar las n posiciones.'], ['x no está en la lista', 1, 'Se recorre toda la lista sin encontrarlo: n comparaciones.'],
    ['x aparece en una posición uniformemente aleatoria', 2, 'En promedio se hacen (n+1)/2 comparaciones.'], ['La búsqueda termina tras 1 sola comparación', 0, 'Es el mínimo trabajo posible.'], ['Se examinan las n posiciones', 1, 'Es el máximo trabajo posible.'],
    ['Se hacen en promedio (n+1)/2 comparaciones', 2, 'Esperanza sobre una distribución uniforme.'], ['Quicksort (pivote v[0]) con datos desordenados al azar', 2, 'Caso promedio: n log n.'], ['Quicksort (pivote v[0]) con datos ya ordenados', 1, 'Es su peor caso: n².']
  ];
  B({
    id: 'n2-casos', n: 2, e: 'A', dif: 2, c: ['cx_casos'], tema: 'Mejor / peor / promedio',
    gen(rng, K) {
      const items = rng.sample(CASOS, 5).map(c => ({ t: c[0], cat: c[1], why: c[2] }));
      return {
        tipo: 'clasificar', enunciado: 'Clasifica cada situación según el caso que describe (búsqueda secuencial y quicksort con pivote `v[0]`).', categorias: ['Mejor caso', 'Peor caso', 'Caso promedio'], items,
        pistas: ['Mejor caso: la entrada que minimiza el trabajo. Peor caso: la que lo maximiza. Promedio: valor esperado sobre una distribución.', 'Pregúntate cuántas comparaciones se hacen en cada situación.', 'Recuerda: por convenio la complejidad «a secas» es el peor caso.'],
        explicacion: 'Mejor caso = mínimo trabajo; peor caso = máximo trabajo (el que se reporta por convenio); promedio = esperanza bajo una distribución supuesta.'
      };
    }
  });

  const PYC = [
    { code: `def unicos(v):\n    salida = []\n    for x in v:\n        if x not in salida:\n            salida.append(x)\n    return salida`, t: 'n2', s: 'n', j: ['`x not in salida` recorre la lista (hasta n comparaciones) dentro de un ciclo de n.', 'Hay un único ciclo visible, por lo tanto es lineal.', '`append` es lo que cuesta n en cada iteración.'], c: 'cx_python' },
    { code: `def unicos(v):\n    vistos = set()\n    salida = []\n    for x in v:\n        if x not in vistos:\n            vistos.add(x)\n            salida.append(x)\n    return salida`, t: 'n', s: 'n', j: ['`x in set` cuesta ≈ O(1): un ciclo de n con trabajo constante; el conjunto ocupa O(n).', '`in` siempre recorre la colección, también en un set.', 'El conjunto hace que no se use memoria extra.'], c: 'cx_python' },
    { code: `def vaciar(v):\n    total = 0\n    while v:\n        total += v.pop(0)\n    return total`, t: 'n2', s: '1', j: ['`pop(0)` desplaza todos los elementos: O(n) por llamada, n llamadas.', '`pop(0)` cuesta O(1) igual que `pop()`.', 'El while hace log n vueltas.'], c: 'cx_python' },
    { code: `from collections import deque\n\ndef vaciar(v):\n    q = deque(v)\n    total = 0\n    while q:\n        total += q.popleft()\n    return total`, t: 'n', s: 'n', j: ['`popleft()` cuesta O(1): n extracciones constantes; la deque copia v (O(n) de memoria).', '`popleft()` desplaza todo y cuesta O(n).', 'La deque ordena los datos, por eso es n log n.'], c: 'cx_python' },
    { code: `def invertida(v):\n    r = []\n    for x in v:\n        r.insert(0, x)\n    return r`, t: 'n2', s: 'n', j: ['`insert(0, x)` desplaza todo: O(n) por inserción, n inserciones.', '`insert` siempre cuesta O(1).', 'Es lineal porque hay un solo ciclo.'], c: 'cx_python' },
    { code: `def hay_dup(v):\n    w = sorted(v)\n    for i in range(len(w) - 1):\n        if w[i] == w[i + 1]:\n            return True\n    return False`, t: 'nlogn', s: 'n', j: ['`sorted` cuesta O(n log n) y domina sobre el ciclo lineal (O(n)); además copia la lista (O(n)).', 'El ciclo for hace n² comparaciones.', 'El ordenamiento es lineal en Python.'], c: 'cx_python' },
    { code: `def cuantos_maximos(v):\n    c = 0\n    for x in v:\n        if x == max(v):\n            c += 1\n    return c`, t: 'n2', s: '1', j: ['`max(v)` recorre toda la lista (O(n)) y se llama en cada una de las n iteraciones.', '`max(v)` es una operación elemental O(1).', 'El ciclo es lineal y `max` es logarítmico.'], c: 'cx_python' },
    { code: `def hay_duplicados(v):\n    n = len(v)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if v[i] == v[j]:\n                return True\n    return False`, t: 'n2', s: '1', j: ['En el peor caso (sin duplicados) se hacen n(n−1)/2 comparaciones; no usa memoria extra.', 'Es lineal porque `return True` corta el ciclo.', 'Es n log n porque el interno empieza en i + 1.'], c: 'cx_ciclos' }
  ];
  B({
    id: 'n2-python-costos', n: 2, e: 'B', dif: 3, c: ['cx_python', 'cx_espacial'], tema: 'Costos reales de Python',
    gen(rng, K) {
      const p = rng.pick(PYC);
      return {
        tipo: 'bigo', pideEspacio: true, enunciado: 'Determina la **complejidad temporal (peor caso)** y la **espacial extra** de la función (sin contar la entrada), y justifica. Ojo con el costo real de las operaciones de Python.', codigoVista: p.code,
        tiempo: p.t, espacio: p.s, etqS: 'Memoria extra', justif: { opciones: rng.shuffle([{ t: p.j[0], ok: true }, { t: p.j[1], ok: false, why: 'No es el razonamiento correcto.' }, { t: p.j[2], ok: false, why: 'No es el razonamiento correcto.' }]) },
        conceptos: [p.c, 'cx_espacial'],
        pistas: ['Busca operaciones que **parecen** O(1) pero no lo son: `x in lista`, `insert(0, …)`, `pop(0)`, `max(v)`, `sorted`.', 'Recuerda: `in` sobre `set`/`dict` ≈ O(1); sobre `list` O(n). `append` y `pop()` final: O(1).', 'Para el espacio, pregúntate qué estructuras nuevas se crean y cuánto crecen con n.'],
        explicacion: 'Tiempo **' + ET.Tipos.bigo.ETQ[p.t] + '**, espacio extra **' + ET.Tipos.bigo.ETQ[p.s] + '**. ' + p.j[0]
      };
    }
  });

  const ESP = [
    { code: `def suma(v):\n    total = 0\n    for x in v:\n        total += x\n    return total`, t: 'n', s: '1', j: ['Solo usa un acumulador, sin importar el tamaño de v.', 'Crea una copia de v.', 'Su pila de llamadas crece con n.'] },
    { code: `def doble(v):\n    return [2 * x for x in v]`, t: 'n', s: 'n', j: ['Construye una lista nueva con n elementos.', 'Solo usa un acumulador.', 'La lista nueva tiene tamaño constante.'] },
    { code: `def tabla(n):\n    return [[0] * n for _ in range(n)]`, t: 'n2', s: 'n2', j: ['Crea una matriz de n × n celdas: tiempo y memoria cuadráticos.', 'Crea solo una lista de n elementos.', 'Usa memoria constante porque todas valen 0.'] },
    { code: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)`, t: 'n', s: 'n', j: ['Hace n llamadas y la pila llega a n marcos simultáneos.', 'No usa memoria extra porque no crea listas.', 'La pila solo tiene 1 marco a la vez.'] },
    { code: `def fib_iter(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a`, t: 'n', s: '1', j: ['Guarda solo los dos últimos valores: memoria constante (bottom-up con O(1) de memoria).', 'Necesita una tabla de n valores.', 'Su pila de llamadas crece con n.'] },
    { code: `def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]`, t: 'n', s: 'n', j: ['La caché guarda hasta n valores y la pila llega a profundidad n.', 'Solo guarda dos valores.', 'Es exponencial en memoria.'] },
    { code: `def busqueda_binaria(v, x):\n    lo, hi = 0, len(v) - 1\n    while lo <= hi:\n        m = (lo + hi) // 2\n        if v[m] == x:\n            return m\n        if v[m] < x:\n            lo = m + 1\n        else:\n            hi = m - 1\n    return -1`, t: 'logn', s: '1', j: ['Descarta la mitad en cada vuelta (log n) y solo usa tres variables.', 'Recorre toda la lista: n vueltas.', 'Crea sublistas de la mitad de tamaño.'] },
    { code: `def busq(v, x, lo, hi):\n    if lo > hi:\n        return -1\n    m = (lo + hi) // 2\n    if v[m] == x:\n        return m\n    if v[m] < x:\n        return busq(v, x, m + 1, hi)\n    return busq(v, x, lo, m - 1)`, t: 'logn', s: 'logn', j: ['Divide el rango a la mitad en cada llamada: log n llamadas y log n marcos en la pila.', 'Usa memoria constante porque no crea listas.', 'Hace n llamadas.'] }
  ];
  B({
    id: 'n2-espacial', n: 2, e: 'B', dif: 3, c: ['cx_espacial', 'cx_recursivo'], tema: 'Complejidad espacial',
    gen(rng, K) {
      const p = rng.pick(ESP);
      return {
        tipo: 'bigo', pideEspacio: true, enunciado: 'Determina la complejidad **temporal** y la **espacial** (memoria adicional, incluyendo la pila de llamadas si hay recursión; no cuentes la entrada) en función de n.', codigoVista: p.code,
        tiempo: p.t, espacio: p.s, etqS: 'Memoria extra', justif: { opciones: rng.shuffle([{ t: p.j[0], ok: true }, { t: p.j[1], ok: false, why: 'No es el razonamiento correcto.' }, { t: p.j[2], ok: false, why: 'No es el razonamiento correcto.' }]) },
        pistas: ['Espacio extra = memoria adicional que necesita más allá de la entrada.', 'Pregúntate: ¿se crean listas/matrices/diccionarios nuevos? ¿cuántos marcos de pila se apilan a la vez?', 'Recuerda los ejemplos de clase: suma O(1); `unicos_B` O(n); merge sort O(n); quicksort en el sitio O(log n) (pila).'],
        explicacion: 'Tiempo **' + ET.Tipos.bigo.ETQ[p.t] + '**, espacio **' + ET.Tipos.bigo.ETQ[p.s] + '**. ' + p.j[0]
      };
    }
  });

  B({
    id: 'n2-razon', n: 2, e: 'B', dif: 3, c: ['cx_razon'], tema: 'Razón de duplicación',
    gen(rng, K) {
      const M = [
        { k: 'constante', f: n => 1, razon: '≈ 1' }, { k: 'logarítmico', f: n => Math.log2(n), razon: '≈ 1 + ε (algo mayor que 1)' },
        { k: 'lineal', f: n => n, razon: '≈ 2' }, { k: 'n log n', f: n => n * Math.log2(n), razon: '≈ 2,1–2,3' },
        { k: 'cuadrático', f: n => n * n, razon: '≈ 4' }, { k: 'cúbico', f: n => n * n * n, razon: '≈ 8' }
      ];
      const m = rng.pick(M); const base = rng.pick([1000, 2000, 500, 4000]); const ns = [base, base * 2, base * 4, base * 8];
      const scale = rng.pick([1e-7, 3e-8, 5e-9]); const ts = ns.map(n => m.f(n) * scale * (1 + (rng.next() - 0.5) * 0.04));
      const fmt = t => t < 0.001 ? (t * 1000).toFixed(4) + ' ms' : (t < 1 ? (t * 1000).toFixed(2) + ' ms' : t.toFixed(3) + ' s');
      const tabla = '| n | tiempo medido |\n|---|---|\n' + ns.map((n, i) => '| ' + n + ' | ' + fmt(ts[i]) + ' |').join('\n');
      const ops = M.map(x => [x.k, x.k === m.k]);
      return Object.assign(K.mc(rng, 'Se midió el tiempo de una función desconocida duplicando n (técnica de la **razón de duplicación**):\n\n' + tabla + '\n\n¿Qué crecimiento sugiere T(2n)/T(n)?', [[m.k, 'La razón T(2n)/T(n) es ' + m.razon + '.']],
        rng.sample(M.filter(x => x.k !== m.k), 3).map(x => [x.k, 'Ese crecimiento daría una razón ' + x.razon + '.'])), {
        pistas: ['Divide cada tiempo entre el tiempo de la fila anterior (cada vez n se duplica).', 'Guía: ≈1 constante · ≈1+ε logarítmico · ≈2 lineal · ≈2,1–2,3 n log n · ≈4 cuadrático · ≈8 cúbico.', 'Calcula la razón con las dos últimas filas: ' + fmt(ts[3]) + ' / ' + fmt(ts[2]) + '.'],
        explicacion: 'La razón T(2n)/T(n) ≈ ' + (ts[3] / ts[2]).toFixed(2) + ' corresponde a un crecimiento **' + m.k + '** (' + m.razon + ').'
      });
    }
  });

  B({
    id: 'n2-pred-tiempo', n: 2, e: 'B', dif: 3, c: ['cx_razon', 'cx_tasas'], tema: 'Predecir tiempos',
    gen(rng, K) {
      const M = [{ k: 'lineal', e: 1, sym: 'c·n' }, { k: 'cuadrático', e: 2, sym: 'c·n²' }, { k: 'cúbico', e: 3, sym: 'c·n³' }];
      const m = rng.pick(M); const n = rng.pick([1000, 2000, 5000]); const mult = rng.pick([2, 3, 4, 5, 10]); const t = rng.pick([1, 2, 3, 5]);
      const esp = t * Math.pow(mult, m.e);
      return {
        tipo: 'salida', numerico: true, unidad: 'segundos', esperado: String(esp), placeholder: 'Segundos',
        enunciado: 'Un algoritmo de tiempo **' + m.k + '** (T(n) = ' + m.sym + ') tarda **' + t + ' s** con n = ' + n + '. ¿Cuántos **segundos** tardará con n = **' + (n * mult) + '**? (Supón que la constante c no cambia.)',
        pistas: ['Si T(n) = c·nᵏ, ¿por cuánto se multiplica el tiempo cuando n se multiplica por ' + mult + '?', 'Factor de n: ' + mult + '. Factor de tiempo: (' + mult + ')^' + m.e + ' (el exponente del crecimiento).', 'Tiempo nuevo = ' + t + ' × factor de tiempo.'],
        explicacion: 'n se multiplica por ' + mult + ', luego el tiempo se multiplica por ' + mult + '^' + m.e + ' = ' + Math.pow(mult, m.e) + ': ' + t + ' × ' + Math.pow(mult, m.e) + ' = **' + esp + ' s**.'
      };
    }
  });

  B({
    id: 'n2-demostrar', n: 2, e: 'B', dif: 4, c: ['cx_formal'], tema: 'Exhibir c y n₀',
    gen(rng, K) {
      const cuad = rng.chance(0.4);
      const a = rng.int(2, 9), b = rng.int(20, 300), c0 = cuad ? rng.int(10, 200) : 0;
      const T = n => cuad ? a * n * n + b * n + c0 : a * n + b;
      const G = n => cuad ? n * n : n;
      const valido = (c, n0) => { for (let n = n0; n <= n0 + 4000; n++) if (T(n) > c * G(n)) return false; return n0 >= 1; };
      const pares = [];
      const k1 = rng.int(1, 4), k2 = rng.int(5, 12);
      const need = (k) => cuad ? Math.ceil((b + Math.sqrt(b * b + 4 * k * c0)) / (2 * k)) + 1 : Math.ceil(b / k);
      let cand = [[a + k1, need(a + k1 > a ? k1 : 1) + rng.int(0, 3)], [a + k2, need(k2) + rng.int(0, 3)], [a, rng.int(1, 100)], [a + k1, Math.max(1, Math.floor(need(k1) / 2) - 1)], [a - 1, rng.int(50, 400)], [a + k2, 1]];
      cand = cand.filter(p => p[0] >= 1);
      const uniq = []; const seen = new Set(); cand.forEach(p => { const key = p.join(','); if (!seen.has(key)) { seen.add(key); uniq.push(p); } });
      const buenas = uniq.filter(p => valido(p[0], p[1])), malas = uniq.filter(p => !valido(p[0], p[1]));
      const sel = rng.shuffle(buenas).slice(0, Math.min(2, buenas.length)).concat(rng.shuffle(malas).slice(0, 4 - Math.min(2, buenas.length)));
      const gTxt = cuad ? 'n²' : 'n', Ttxt = cuad ? a + 'n² + ' + b + 'n + ' + c0 : a + 'n + ' + b;
      const opciones = rng.shuffle(sel).map(p => { const v = valido(p[0], p[1]); return { t: '**c = ' + p[0] + ', n₀ = ' + p[1] + '**', ok: v, why: v ? 'Para todo n ≥ ' + p[1] + ' se cumple T(n) ≤ ' + p[0] + '·' + gTxt + '.' : (p[0] <= a ? 'c debe ser mayor que el coeficiente principal (' + a + ') para absorber los términos menores.' : 'Con ese n₀ hay valores de n ≥ n₀ donde T(n) > c·' + gTxt + '.') }; });
      if (!opciones.some(o => o.ok)) return this.gen(new U.RNG(rng.int(1, 1e9)), K);
      return {
        tipo: 'opcion', multi: true, enunciado: 'Se quiere demostrar que **T(n) = ' + Ttxt + ' ∈ O(' + gTxt + ')**, es decir, exhibir c y n₀ tales que **T(n) ≤ c·' + gTxt + ' para todo n ≥ n₀**. ¿Cuáles de estos pares sirven?', opciones,
        pistas: ['Sustituye el par en la desigualdad T(n) ≤ c·' + gTxt + ' y comprueba con n = n₀ y con un n mayor.', 'c tiene que ser mayor que el coeficiente de ' + gTxt + ' en T(n) (si no, no alcanza para los términos menores).', 'Para el n₀: despeja cuándo (c − ' + a + ')·' + gTxt + ' alcanza a cubrir los términos restantes.'],
        explicacion: 'Un par (c, n₀) sirve si T(n) ≤ c·' + gTxt + ' para **todo** n ≥ n₀. Hay muchos pares válidos; cualquiera que cumpla la desigualdad demuestra la pertenencia (ejemplo de clase: 3n² + 10n + 7 ∈ O(n²) con c = 20, n₀ = 1).'
      };
    }
  });

  const OPT = [
    {
      fn: 'hay_duplicados', start: `def hay_duplicados(v):\n    n = len(v)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if v[i] == v[j]:\n                return True\n    return False`,
      sol: `def hay_duplicados(v):\n    vistos = set()\n    for x in v:\n        if x in vistos:\n            return True\n        vistos.add(x)\n    return False`,
      enun: 'La función `hay_duplicados(v)` compara todos los pares (fuerza bruta, **O(n²)**). Reescríbela con un **`set`** para que sea **O(n)** (a costa de O(n) de memoria).',
      tests: rng => [{ e: 'hay_duplicados([])', r: 'False' }, { e: 'hay_duplicados([1, 2, 3, 1])', r: 'True' }, { e: 'hay_duplicados([5, 6, 7])', r: 'False' }, { e: 'hay_duplicados(list(range(6000)))', r: 'False' }, { e: 'hay_duplicados(list(range(5000)) + [4999])', r: 'True' }]
    },
    {
      fn: 'unicos', start: `def unicos(v):\n    salida = []\n    for x in v:\n        if x not in salida:\n            salida.append(x)\n    return salida`,
      sol: `def unicos(v):\n    vistos = set()\n    salida = []\n    for x in v:\n        if x not in vistos:\n            vistos.add(x)\n            salida.append(x)\n    return salida`,
      enun: 'La función `unicos(v)` devuelve los elementos sin repetir y en orden de aparición, pero `x not in salida` recorre una **lista** (**O(n²)**). Reescríbela en **O(n)** usando un `set` para los elementos ya vistos.',
      tests: rng => [{ e: 'unicos([])', r: '[]' }, { e: 'unicos([3, 1, 3, 2, 1])', r: '[3, 1, 2]' }, { e: 'unicos(["a", "b", "a"])', r: '["a", "b"]' }, { e: 'len(unicos(list(range(6000)) * 2))', r: '6000' }]
    },
    {
      fn: 'hay_suma', start: `def hay_suma(v, S):\n    n = len(v)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if v[i] + v[j] == S:\n                return True\n    return False`,
      sol: `def hay_suma(v, S):\n    vistos = set()\n    for x in v:\n        if S - x in vistos:\n            return True\n        vistos.add(x)\n    return False`,
      enun: 'La función `hay_suma(v, S)` prueba todos los pares para saber si **dos elementos en posiciones distintas suman S** (**O(n²)**, fuerza bruta). Reescríbela en **O(n)** usando un `set`.',
      tests: rng => [{ e: 'hay_suma([1, 2, 3], 5)', r: 'True' }, { e: 'hay_suma([1, 2, 3], 7)', r: 'False' }, { e: 'hay_suma([4], 8)', r: 'False' }, { e: 'hay_suma([4, 4], 8)', r: 'True' }, { e: 'hay_suma(list(range(6000)), 99999)', r: 'False' }]
    }
  ];
  B({
    id: 'n2-optimizar', n: 2, e: 'C', dif: 4, c: ['cx_python', 'cx_espacial', 'pd_fb'], tema: 'Optimizar código',
    gen(rng, K) {
      const o = rng.pick(OPT);
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: o.fn, enunciado: o.enun + '\n\nTu solución no debe usar ciclos anidados y debe seguir funcionando con listas grandes (se probará con miles de elementos).',
        starter: o.start, solucion: o.sol, tests: o.tests(rng), maxSteps: 700000,
        reglas: [{ t: 'sinAnidados', fn: o.fn }, { t: 'usa', re: /set\s*\(|\{[^}]*\}/, msg: 'Usa un `set` para recordar lo ya visto (búsqueda ≈ O(1)).' }],
        pistas: ['El cuello de botella es la comparación con todos los demás elementos. ¿Qué estructura permite preguntar «¿ya lo vi?» en O(1)?', 'Un `set` permite `x in vistos` en O(1) promedio. Recorre la lista **una sola vez** y recuerda lo que vas viendo.', 'Esquema: `vistos = set()`; en cada vuelta consulta `vistos` y luego `vistos.add(x)`.'],
        explicacion: 'Compromiso **tiempo–espacio**: pasas de O(n²) a O(n) en tiempo pagando O(n) de memoria extra.\n```\n' + o.sol + '\n```'
      };
    }
  });

  B({
    id: 'n2-trampas-formal', n: 2, e: 'C', dif: 4, c: ['cx_formal'], tema: 'O, Ω y Θ (trampas)',
    gen(rng, K) {
      const a = rng.int(2, 9), b = rng.int(100, 500), c = rng.int(1, 9);
      const exp = '10^' + rng.int(4, 8);
      const T = `${a}n log₂ n + ${b}n + ${exp}`;
      const S = [['T(n) ∈ O(n²)', true, 'O es una cota superior; n log n ≤ n² para n grande (correcta pero no ajustada).'], ['T(n) ∈ Θ(n²)', false, 'T crece más despacio que n²: no es Ω(n²), así que no es Θ(n²).'], ['T(n) ∈ Ω(n)', true, 'T(n) ≥ b·n para n grande: n es una cota inferior.'], ['T(n) ∈ Θ(n log n)', true, 'Es la cota ajustada: O(n log n) y Ω(n log n).'], ['T(n) ∈ O(n)', false, 'n log n crece más rápido que n: T no está acotada por c·n.'], ['T(n) ∈ Ω(n²)', false, 'T(n) no crece al menos como n².'], ['T(n) ∈ O(n log n)', true, 'Cota superior ajustada.'], ['T(n) ∈ Θ(n)', false, 'El término n log n supera a cualquier c·n.']];
      const verd = rng.sample(S.filter(s => s[1]), 2), fal = rng.sample(S.filter(s => !s[1]), 2);
      const pick = rng.shuffle(verd.concat(fal).concat(rng.sample(S.filter(s => !verd.includes(s) && !fal.includes(s)), 1)));
      return {
        tipo: 'opcion', multi: true, enunciado: 'Sea **T(n) = ' + T + '**. ¿Cuáles de las siguientes afirmaciones son **verdaderas**? (Marca todas.)',
        opciones: pick.map(s => ({ t: '`' + s[0] + '`', ok: s[1], why: s[2] })),
        pistas: ['Primero encuentra el término dominante de T(n) (las constantes y términos menores no cuentan).', 'O es cota superior (↗ cualquier cota mayor sirve), Ω cota inferior (↘ cualquier cota menor sirve), Θ solo el orden exacto.', 'T(n) ∈ Θ(g) exige O(g) **y** Ω(g) a la vez.'],
        explicacion: 'El término dominante es n log₂ n. Por tanto T ∈ Θ(n log n); además T ∈ O(n²) y T ∈ Ω(n) (cotas correctas pero no ajustadas), pero no T ∈ Θ(n²) ni T ∈ O(n).'
      };
    }
  });

  B({
    id: 'n2-abierta-compromiso', n: 2, e: 'C', dif: 3, c: ['cx_espacial', 'cx_python'], tema: 'Compromiso tiempo–espacio',
    gen(rng, K) {
      return {
        tipo: 'abierta', enunciado: 'Se tienen dos funciones que devuelven los elementos sin repetir de una lista: `unicos_A` (usa una **lista** `salida` y pregunta `x not in salida`) y `unicos_B` (usa además un **set** `vistos`). **Explica el compromiso tiempo–espacio** entre ambas: ¿cuál es más rápida, por qué, y qué se paga a cambio?',
        codigos: [{ titulo: 'unicos_A', codigo: 'def unicos_A(v):\n    salida = []\n    for x in v:\n        if x not in salida:\n            salida.append(x)\n    return salida' }, { titulo: 'unicos_B', codigo: 'def unicos_B(v):\n    vistos, salida = set(), []\n    for x in v:\n        if x not in vistos:\n            vistos.add(x)\n            salida.append(x)\n    return salida' }],
        criterios: [
          { desc: 'Indica que **`unicos_A` es O(n²)** (o cuadrática) porque `x not in lista` recorre la lista.', claves: [['a', 'n2'], ['cuadr'], ['n^2'], ['n²'], ['recorre', 'lista'], ['lista', 'o(n)']] },
          { desc: 'Indica que **`unicos_B` es O(n)** (lineal) porque `in` sobre un set cuesta ≈ O(1).', claves: [['b', 'lineal'], ['set', 'o(1)'], ['hash', 'o(1)'], ['set', 'constante'], ['conjunto', 'constante'], ['tabla hash'], ['b', 'o(n)']] },
          { desc: 'Señala que `unicos_B` **gasta memoria extra** O(n) (el set).', claves: [['memoria', 'extra'], ['memoria', 'adicional'], ['o(n)', 'memoria'], ['espacio', 'extra'], ['espacio', 'adicional'], ['gasta', 'memoria'], ['usa mas memoria'], ['mas memoria']] },
          { desc: 'Enuncia el **compromiso**: se gana tiempo a cambio de espacio (y viceversa); elegir depende de las restricciones.', claves: ['compromiso', 'trade', ['tiempo', 'a cambio', 'memoria'], ['optimizacion', 'tiempo', 'memoria'], ['gana', 'tiempo', 'pierde'], ['sacrific']] }
        ],
        modelo: '`unicos_A` es **O(n²)** porque `x not in salida` recorre una lista (hasta n comparaciones) dentro de un ciclo de n. `unicos_B` es **O(n)** porque consultar un `set` cuesta ≈ O(1). La mejora se paga con **memoria extra O(n)** (el set `vistos`). Es el compromiso tiempo–espacio: casi toda optimización de tiempo se paga con memoria; se elige según las restricciones (si la memoria es muy limitada podría convenir A con n pequeño).',
        pistas: ['Compara el costo de `in` en una lista con el costo de `in` en un set.', 'Calcula el tiempo y la memoria extra de cada función y compáralos.', 'Cierra con la idea general: qué ganas y qué pierdes.'],
        explicacion: 'Idea de clase (S2-C1, diap. 21): unicos_B es n veces más rápida que unicos_A pero gasta O(n) de memoria extra.'
      };
    }
  });

  const REC2 = [
    { code: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)`, t: 'n', s: 'n', j: ['Una llamada por nivel y profundidad n: n llamadas × O(1) y pila de n marcos.', 'Cada llamada genera dos más: del orden de 2ⁿ llamadas.', 'Divide n a la mitad en cada llamada.'] },
    { code: `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`, t: '2n', s: 'n', j: ['Cada llamada genera dos llamadas (recalcula subproblemas): ~2ⁿ llamadas; la profundidad máxima de pila es n.', 'Es lineal porque solo hay una suma.', 'Tiene n llamadas, una por cada valor de n.'] },
    { code: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)`, t: 'n', s: 'n', j: ['Cada subproblema se calcula una vez (n+1 cálculos × O(1)); la caché y la pila ocupan O(n).', 'Sigue siendo exponencial porque la función es recursiva.', 'Es constante porque la caché evita todo el trabajo.'] },
    { code: `def pot(x, n):\n    if n == 0:\n        return 1\n    m = pot(x, n // 2)\n    return m * m if n % 2 == 0 else x * m * m`, t: 'logn', s: 'logn', j: ['Una sola llamada sobre la mitad del problema: ≈ log₂ n llamadas y pila de log n marcos.', 'Hace n llamadas porque n baja de uno en uno.', 'Hace dos llamadas por nivel: n llamadas.'] },
    { code: `def suma_hasta(n):\n    if n == 0:\n        return 0\n    return n + suma_hasta(n - 1)`, t: 'n', s: 'n', j: ['n llamadas con trabajo constante cada una y n marcos apilados.', 'Es constante porque solo suma.', 'Es logarítmica: n se reduce rápido.'] },
    { code: `def contar_ceros(v, i=0):\n    if i == len(v):\n        return 0\n    return (v[i] == 0) + contar_ceros(v, i + 1)`, t: 'n', s: 'n', j: ['Avanza el índice de uno en uno: n llamadas y profundidad n (no copia la lista).', 'Divide la lista a la mitad en cada llamada.', 'Cada llamada recorre toda la lista: n².'] }
  ];
  B({
    id: 'n2-recursivas', n: 2, e: 'B', dif: 3, c: ['cx_recursivo', 'rc_conteo', 'cx_espacial'], tema: 'Complejidad de recursivas',
    gen(rng, K) {
      const p = rng.pick(REC2);
      return {
        tipo: 'bigo', pideEspacio: true, enunciado: 'Determina la complejidad **temporal** de la función recursiva y la **espacial** (pila de llamadas incluida), y justifica.', codigoVista: p.code, tiempo: p.t, espacio: p.s,
        etqS: 'Espacio (pila + estructuras)', escala: ['1', 'logn', 'n', 'nlogn', 'n2', '2n'],
        justif: { opciones: rng.shuffle([{ t: p.j[0], ok: true }, { t: p.j[1], ok: false, why: 'No es el razonamiento correcto.' }, { t: p.j[2], ok: false, why: 'No es el razonamiento correcto.' }]) },
        pistas: ['Complejidad de una recursiva = (número de llamadas) × (trabajo por llamada).', 'Cuenta cuántas llamadas se generan y cuánto baja el argumento en cada una (¿resta 1, divide a la mitad?). ¿Cuántas llamadas hace cada llamada?', 'El espacio de pila es la **profundidad máxima** de la recursión (más lo que guarden las estructuras auxiliares).'],
        explicacion: 'Tiempo **' + ET.Tipos.bigo.ETQ[p.t] + '**, espacio **' + ET.Tipos.bigo.ETQ[p.s] + '**. ' + p.j[0]
      };
    }
  });

  B({
    id: 'n2-mixta-cuello', n: 2, e: 'C', dif: 5, c: ['cx_python', 'cx_ciclos', 'cx_espacial'], tema: 'Encontrar el cuello de botella',
    gen(rng, K) {
      const etq = { dp: 'O(d·p)', dpV: 'O(d·p·|V|)', d2: 'O(d²)', V: 'O(|V|)', dp2: 'O((d·p)²)' };
      const A = 'def construir_vocab(docs):\n    vocab = []\n    for doc in docs:\n        for palabra in doc.split():\n            if palabra not in vocab:\n                vocab.append(palabra)\n    return vocab';
      return {
        tipo: 'mixta', enunciado: 'Sea **d** el número de documentos, **p** las palabras por documento y **|V|** el tamaño del vocabulario final. Analiza `construir_vocab`.', codigoVista: A,
        partes: [
          { titulo: 'Complejidad actual', peso: 1.5, q: { tipo: 'bigo', enunciado: '¿Cuál es la complejidad temporal (peor caso) de `construir_vocab`?', tiempo: 'dpV', escala: ['dp', 'dpV', 'd2', 'dp2', 'V'], etq, justif: { opciones: [{ t: 'Se recorren d·p palabras y `palabra not in vocab` recorre una lista de hasta |V| elementos en cada una.', ok: true }, { t: 'Solo hay dos ciclos y `in` cuesta O(1), así que es O(d·p).', ok: false, why: '`in` sobre una lista cuesta O(n), no O(1).' }, { t: 'El `append` cuesta |V| cada vez.', ok: false, why: '`append` es O(1) amortizado.' }] } } },
          { titulo: 'Cambio de una línea', peso: 1, q: { tipo: 'opcion', enunciado: '¿Qué cambio **mínimo** reduce la complejidad temporal?', opciones: rng.shuffle([{ t: 'Usar `vocab = set()` y `vocab.add(palabra)` en lugar de lista y `append`.', ok: true, why: '`in` en un set cuesta ≈ O(1).' }, { t: 'Ordenar `docs` antes del ciclo.', ok: false, why: 'Ordenar documentos no cambia el costo de `in` sobre una lista.' }, { t: 'Cambiar `for` por `while`.', ok: false, why: 'El tipo de ciclo no cambia la complejidad.' }, { t: 'Usar `insert(0, palabra)`.', ok: false, why: '`insert(0, …)` es O(n): empeora.' }]) } },
          { titulo: 'Complejidad corregida', peso: 1.5, q: { tipo: 'bigo', pideEspacio: true, enunciado: 'Con el cambio, ¿cuál es el **tiempo** y cuál la **memoria extra**?', tiempo: 'dp', espacio: 'V', escala: ['dp', 'dpV', 'd2', 'dp2', 'V'], etq, etqS: 'Memoria extra' } }
        ],
        pistas: ['Parte a): ¿cuántas veces se ejecuta la línea `if palabra not in vocab` y cuánto cuesta cada ejecución?', 'Parte b): busca estructura de datos con membresía en O(1).', 'Parte c): tiempo = d·p operaciones O(1); memoria = lo que guarda la estructura nueva.'],
        explicacion: 'Esta es la «pregunta de análisis 2» de la clase (S2-C2, diap. 18): O(d·p·|V|) → O(d·p) con un `set`, pagando O(|V|) de memoria (compromiso tiempo–espacio).'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
