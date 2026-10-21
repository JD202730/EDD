/* banco_n1.js — Nivel 1: Fundamentos de recursión (S5-C2) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py;
  const cod = U.dedent;

  /* ---------- familias de funciones recursivas lineales (para trazar y contar) ---------- */
  const NOMBRES = ['f', 'calcular', 'g', 'resultado', 'mister'];
  const LIN = [
    { id: 'fact', desc: 'n!', code: (f) => `def ${f}(n):\n    if n <= 1:\n        return 1\n    return n * ${f}(n - 1)`, nmin: 3, nmax: 7, base: 1 },
    { id: 'suma', desc: '1+…+n', code: (f) => `def ${f}(n):\n    if n == 0:\n        return 0\n    return n + ${f}(n - 1)`, nmin: 3, nmax: 9, base: 0 },
    { id: 'dos', desc: '2^n', code: (f) => `def ${f}(n):\n    if n == 0:\n        return 1\n    return 2 * ${f}(n - 1)`, nmin: 3, nmax: 8, base: 0 },
    { id: 'cuad', desc: 'suma de cuadrados', code: (f) => `def ${f}(n):\n    if n == 0:\n        return 0\n    return n * n + ${f}(n - 1)`, nmin: 3, nmax: 6, base: 0 },
    { id: 'paso2', desc: 'paso 2', code: (f) => `def ${f}(n):\n    if n <= 0:\n        return 0\n    return n + ${f}(n - 2)`, nmin: 4, nmax: 9, base: 0 },
    { id: 'dig', desc: 'dígitos', code: (f) => `def ${f}(n):\n    if n < 10:\n        return 1\n    return 1 + ${f}(n // 10)`, nmin: 100, nmax: 99999, base: 0, rnd: true },
    { id: 'sdig', desc: 'suma de dígitos', code: (f) => `def ${f}(n):\n    if n < 10:\n        return n\n    return n % 10 + ${f}(n // 10)`, nmin: 100, nmax: 99999, base: 0, rnd: true }
  ];
  const pickFam = (rng, solo) => { const l = solo ? LIN.filter(x => solo.includes(x.id)) : LIN; return rng.pick(l); };
  const argDe = (rng, fam) => fam.rnd ? rng.int(fam.nmin, fam.nmax) : rng.int(fam.nmin, fam.nmax);

  /* ============ A ============ */
  B({
    id: 'n1-comp', n: 1, e: 'A', dif: 1, c: ['rc_def'], tema: 'Definición',
    gen(rng, K) {
      return Object.assign(K.mc(rng, '¿Cuáles son los **dos componentes** que tiene todo algoritmo recursivo?',
        [['Un **caso base** y una **fórmula (caso) recursiva**', 'El caso base detiene la recursión; la fórmula expresa la respuesta en términos de subproblemas más pequeños.']],
        [['Un ciclo `while` y un contador', 'Eso describe una solución iterativa; la repetición en la recursión la producen las llamadas.'],
        ['Una variable global y una función auxiliar', 'No son necesarias para que una función se llame a sí misma.'],
        ['Un caso base y un ciclo `for`', 'El ciclo no forma parte de la definición recursiva.']]), {
        pistas: ['Piensa: ¿qué hace que la recursión **pare** y qué hace que **continúe**?', 'Uno de los componentes se conoce «directamente» (no necesita más llamadas); el otro reduce el problema a uno más pequeño.', 'Los nombres que se usan en clase son «caso ___» y «fórmula ___».'],
        explicacion: 'Todo algoritmo recursivo necesita (1) un **caso base** que se resuelve sin recursión y (2) una **fórmula recursiva** que reduce el problema a subproblemas más pequeños (S5-C2, diap. 5).'
      });
    }
  });

  const VF1 = [
    { a: 'Si una función recursiva no tiene caso base, la recursión nunca termina y Python acaba lanzando `RecursionError`.', v: true, e: 'Cada llamada genera otra sin condición de parada hasta agotar la pila.', j: ['Cada llamada genera otra llamada sin condición de parada, y la pila de llamadas se agota.', 'Python no permite que una función se llame a sí misma.', 'El caso base solo se usa para imprimir el resultado final.'] },
    { a: 'En `factorial(n)`, el caso base es la llamada `factorial(n - 1)`.', v: false, e: 'La llamada `factorial(n-1)` es el caso **recursivo**; el caso base es la entrada con respuesta conocida (p. ej. n ≤ 1).', j: ['El caso base es una entrada cuya respuesta se conoce directamente; `factorial(n-1)` es la parte recursiva.', 'El caso base siempre es la última llamada que se ejecuta.', '`factorial(n-1)` no usa recursión.'] },
    { a: 'Cada llamada recursiva debe trabajar con un subproblema más pequeño (más cercano al caso base).', v: true, e: 'Si el argumento no se acerca al caso base, la recursión no termina.', j: ['Si el subproblema no se reduce, nunca se alcanza el caso base.', 'Así Python usa menos memoria que con un ciclo.', 'Es solo una convención de estilo sin efecto en la ejecución.'] },
    { a: 'Cuando una llamada recursiva retorna, su marco se libera de la pila de llamadas.', v: true, e: 'El espacio de pila se libera al retornar (S5-C2, diap. 6).', j: ['Los marcos se apilan al llamar y se desapilan al retornar.', 'Los marcos permanecen hasta el final del programa.', 'Solo se liberan cuando ocurre un `RecursionError`.'] },
    { a: 'Una solución recursiva siempre es más rápida que su equivalente iterativa.', v: false, e: 'La recursión suele costar igual o más (llamadas y pila) y puede desbordar la pila; su ventaja es la claridad.', j: ['Cada llamada tiene un costo y ocupa pila; no hay ganancia automática de velocidad.', 'Python optimiza siempre la recursión convirtiéndola en ciclo.', 'La recursión evita comparar valores.'] },
    { a: 'La función `def f(n): return n * f(n)` termina para cualquier n positivo.', v: false, e: 'La llamada usa el mismo argumento: nunca se acerca a un caso base (y ni siquiera tiene uno).', j: ['La llamada recursiva usa el mismo n y no existe caso base: nunca termina.', 'Termina porque la multiplicación reduce el valor de n.', 'Termina cuando n sea par.'] },
    { a: 'Calcular `fib(n)` con la recursión ingenua hace aproximadamente tantas llamadas como `factorial(n)`.', v: false, e: '`factorial(n)` hace n llamadas; `fib(n)` ingenuo hace del orden de 2ⁿ (recalcula subproblemas).', j: ['`fib` recalcula los mismos subproblemas y su árbol de llamadas crece exponencialmente.', 'Ambas funciones hacen exactamente n llamadas.', '`factorial` hace más llamadas porque multiplica.'] },
    { a: 'El límite de recursión por defecto de Python es del orden de 1000 llamadas anidadas.', v: true, e: 'Superarlo provoca `RecursionError` (S5-C2, diap. 19).', j: ['Python limita la profundidad de la pila para evitar agotar la memoria.', 'Python no tiene límite: usa toda la memoria disponible.', 'El límite es de 10 llamadas.'] }
  ];
  B({
    id: 'n1-vf', n: 1, e: 'A', dif: 1, c: ['rc_base', 'rc_pila'], tema: 'Verdadero/Falso',
    gen(rng, K) {
      const it = rng.pick(VF1);
      return Object.assign(K.vf(rng, it.a, it.v, it.e, [[it.j[0], true, 'Es la razón correcta.'], [it.j[1], false, 'Esa razón no es correcta.'], [it.j[2], false, 'Esa razón no es correcta.']]), {
        justif: { pregunta: '**Justifica:** elige la razón que sustenta tu respuesta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Recuerda la definición: caso base + fórmula recursiva, y que cada marco se apila al llamar y se desapila al retornar.', 'Piensa en un ejemplo pequeño (por ejemplo `factorial(3)`) y comprueba si la afirmación se cumple.', 'Busca palabras absolutas como «siempre» o «nunca»: suelen ser la trampa.']
      });
    }
  });

  B({
    id: 'n1-pila-prof', n: 1, e: 'A', dif: 2, c: ['rc_pila'], tema: 'Pila de llamadas',
    gen(rng, K) {
      const fam = pickFam(rng, ['fact', 'suma', 'dos', 'cuad']); const f = rng.pick(NOMBRES); const n = rng.int(3, 7);
      const code = fam.code(f);
      const r = Py.ejecutar(code + `\n${f}(${n})`, { trace: true });
      const prof = Math.max(...r.trace.filter(e => e.tipo === 'call').map(e => e.depth));
      return {
        tipo: 'salida', enunciado: 'Observa la función. Al ejecutar `' + f + '(' + n + ')`, ¿cuál es el **máximo número de marcos de `' + f + '`** apilados al mismo tiempo (contando la llamada inicial)?',
        codigoVista: code, esperado: String(prof), placeholder: 'Un número entero',
        pistas: ['Dibuja la pila: cada llamada recursiva apila un marco nuevo y los marcos se liberan al retornar.', 'La profundidad máxima se alcanza justo cuando se ejecuta el **caso base**. Cuenta cuántas llamadas hay apiladas en ese momento.', 'Fíjate en la condición del caso base: ¿con qué valor de n se detiene? Cuenta las llamadas desde n = ' + n + ' hasta ese valor.'],
        explicacion: 'Cada llamada espera a la siguiente, así que al llegar al caso base están apiladas **' + prof + '** llamadas: ' + r.trace.filter(e => e.tipo === 'call').map(e => f + '(' + e.args + ')').join(' → ') + '. El espacio de pila es proporcional a la profundidad: O(n).'
      };
    }
  });

  B({
    id: 'n1-traza-valor', n: 1, e: 'A', dif: 2, c: ['rc_traza', 'rc_def'], tema: 'Trazado',
    gen(rng, K) {
      const fam = pickFam(rng); const f = rng.pick(NOMBRES); const n = argDe(rng, fam);
      const code = fam.code(f); const esp = K.run(code + `\nprint(${f}(${n}))`);
      return {
        tipo: 'salida', enunciado: 'Sigue la ejecución paso a paso. ¿Qué imprime el siguiente programa?', codigoVista: code + `\n\nprint(${f}(${n}))`,
        esperado: esp, stdout: true, placeholder: 'Resultado',
        pistas: ['Escribe las llamadas hasta llegar al caso base: ' + f + '(' + n + ') llama a ' + f + '(…), y así sucesivamente.', 'En el caso base ya conoces el valor. Luego «regresa» resolviendo cada llamada con el valor de la que apiló.', 'Anota la cadena: ' + f + '(' + n + ') = (operación con n) y ' + f + '(siguiente).'],
        explicacion: 'Traza (ida y regreso):\n```\n' + Py.ejecutar(code + `\n${f}(${n})`, { trace: true }).trace.map(e => '  '.repeat(e.depth - 1) + (e.tipo === 'call' ? f + '(' + e.args + ')' : '→ ' + e.valor)).join('\n') + '\n```\nResultado: **' + esp + '**.'
      };
    }
  });

  const IDA = [
    { id: 'antes', code: (f) => `def ${f}(n):\n    if n == 0:\n        return\n    print(n)\n    ${f}(n - 1)`, ns: [3, 5] },
    { id: 'despues', code: (f) => `def ${f}(n):\n    if n == 0:\n        return\n    ${f}(n - 1)\n    print(n)`, ns: [3, 5] },
    { id: 'ambos', code: (f) => `def ${f}(n):\n    if n == 0:\n        return\n    print(n)\n    ${f}(n - 1)\n    print(n)`, ns: [2, 4] },
    { id: 'paso2', code: (f) => `def ${f}(n):\n    if n <= 0:\n        return\n    print(n)\n    ${f}(n - 2)`, ns: [5, 9] },
    { id: 'dosramas', code: (f) => `def ${f}(n):\n    if n == 0:\n        return\n    print("A", n)\n    ${f}(n - 1)\n    print("B", n)`, ns: [2, 3] }
  ];
  B({
    id: 'n1-ida-vuelta', n: 1, e: 'B', dif: 3, c: ['rc_traza', 'rc_pila'], tema: 'Ida y vuelta',
    gen(rng, K) {
      const v = rng.pick(IDA); const f = rng.pick(['contar', 'mostrar', 'f', 'imprime']); const n = rng.int(v.ns[0], v.ns[1]);
      const code = v.code(f) + `\n\n${f}(${n})`; const esp = K.run(code);
      return {
        tipo: 'salida', enunciado: '¿Qué **imprime** este programa? Escribe los valores en orden de salida, separados por espacios o comas (una línea por `print`; si un `print` muestra varios valores, escríbelos juntos).',
        codigoVista: code, esperado: esp, stdout: true, tokens: true, placeholder: 'p. ej.  3 2 1',
        pistas: ['Fíjate en **dónde** está el `print` respecto a la llamada recursiva: ¿antes o después?', 'Lo que está **antes** de la llamada se ejecuta en la fase de ida (al apilar); lo que está **después**, en el regreso (al desapilar), en orden inverso.', 'Haz la pila con n = ' + n + ': anota qué se imprime al bajar y qué al subir.'],
        explicacion: 'Salida: `' + esp.replace(/\n/g, ' | ') + '`. Los `print` antes de la llamada salen en el orden de ida (de mayor a menor n); los que están después, al regresar (en orden inverso).'
      };
    }
  });

  B({
    id: 'n1-base-linea', n: 1, e: 'A', dif: 1, c: ['rc_base'], tema: 'Caso base',
    gen(rng, K) {
      const fam = pickFam(rng, ['fact', 'suma', 'dos', 'cuad', 'dig']); const f = rng.pick(NOMBRES);
      const code = fam.code(f); const ls = code.split('\n');
      const base = ls[1].trim() + ' ' + ls[2].trim(); const rec = ls[3].trim();
      return Object.assign(K.mc(rng, '¿Cuál es el **caso base** de esta función?', [['`' + base + '`', 'Es la entrada cuya respuesta se conoce directamente: detiene la recursión.']],
        [['`' + rec + '`', 'Esta línea contiene la llamada recursiva: es la **fórmula recursiva**, no el caso base.'], ['`' + ls[0].trim() + '`', 'Es solo el encabezado de la función.'], ['`' + ls[1].trim().replace(/[<=]+.*/, '') + '`', 'Es solo la condición, sin el resultado que devuelve.']]),
        { codigoVista: code, pistas: ['El caso base **no** llama a la función de nuevo.', 'Busca la línea que devuelve un valor sin volver a llamar a `' + f + '`.', 'Es la combinación de la condición del `if` y su `return`.'], explicacion: 'El caso base es `' + base + '`: ahí la respuesta se conoce sin más llamadas. La línea `' + rec + '` es la fórmula recursiva.' });
    }
  });

  /* ============ B: implementación ============ */
  const FAM_IMPL = [
    {
      fn: 'suma_lista', par: 'v', enun: 'Escribe `suma_lista(v)` que devuelva la **suma de los elementos** de la lista `v` usando **recursión** (sin `sum` ni bucles). La suma de una lista vacía es 0.',
      sol: `def suma_lista(v):\n    if not v:\n        return 0\n    return v[0] + suma_lista(v[1:])`, huecos: ['not v', ['return 0', '0'], 'v[1:]'], alts: { 1: ['len(v) == 0', 'v == []'] },
      tests: (rng) => { const a = [[], [7], [1, 2, 3, 4], rng.distinct(5, 1, 30), [-3, 3, -3]]; return a.map(x => ({ e: `suma_lista(${JSON.stringify(x)})`, r: String(x.reduce((s, y) => s + y, 0)) })); },
      pistas: ['¿Cuál es la suma de una lista **vacía**? Ese es tu caso base.', 'Para una lista no vacía: el primer elemento `v[0]` más la suma del **resto** `v[1:]`.', 'Estructura: `if ...: return 0` y luego `return v[0] + suma_lista(...)`.'],
      ejemplo: 'suma_lista([1, 2, 3])'
    },
    {
      fn: 'contar_digitos', par: 'n', enun: 'Escribe `contar_digitos(n)` que devuelva cuántos **dígitos** tiene el entero `n ≥ 1`, con recursión (no uses `len` ni `str`). Ejemplo: `contar_digitos(4096)` → 4.',
      sol: `def contar_digitos(n):\n    if n < 10:\n        return 1\n    return 1 + contar_digitos(n // 10)`, huecos: ['n < 10', ['return 1', '1'], 'n // 10'],
      tests: (rng) => [7, 10, 99, 100, 4096, rng.int(1000, 999999)].map(x => ({ e: `contar_digitos(${x})`, r: String(String(x).length) })),
      pistas: ['¿Cuántos dígitos tiene un número de **una sola cifra**? Eso es el caso base.', 'Quitar la última cifra equivale a dividir entre 10 con `//`. Cada llamada cuenta una cifra.', '`return 1 + contar_digitos(n // 10)` después de comprobar si `n < 10`.'],
      ejemplo: 'contar_digitos(4096)'
    },
    {
      fn: 'suma_digitos', par: 'n', enun: 'Escribe `suma_digitos(n)` que devuelva la **suma de los dígitos** de `n ≥ 0` recursivamente. Ejemplo: `suma_digitos(1234)` → 10.',
      sol: `def suma_digitos(n):\n    if n < 10:\n        return n\n    return n % 10 + suma_digitos(n // 10)`, huecos: ['n < 10', 'n % 10', 'n // 10'],
      tests: (rng) => [0, 5, 10, 99, 1234, rng.int(1000, 99999)].map(x => ({ e: `suma_digitos(${x})`, r: String(String(x).split('').reduce((s, d) => s + +d, 0)) })),
      pistas: ['La última cifra de n es `n % 10`; el resto del número es `n // 10`.', 'Caso base: si `n < 10`, la suma de sus dígitos es el propio n.', '`return n % 10 + suma_digitos(n // 10)`.'],
      ejemplo: 'suma_digitos(1234)'
    },
    {
      fn: 'potencia', par: 'x, n', enun: 'Escribe `potencia(x, n)` que calcule x elevado a n (n entero ≥ 0) **sin usar `**`**, con recursión: `x⁰ = 1` y `xⁿ = x · xⁿ⁻¹`.',
      sol: `def potencia(x, n):\n    if n == 0:\n        return 1\n    return x * potencia(x, n - 1)`, huecos: ['n == 0', ['return 1', '1'], 'n - 1'],
      tests: (rng) => [[2, 0], [2, 10], [3, 4], [5, 1], [rng.int(2, 9), rng.int(2, 6)]].map(([x, n]) => ({ e: `potencia(${x}, ${n})`, r: String(Math.pow(x, n)) })),
      pistas: ['¿Cuánto vale cualquier número elevado a 0? Ese es el caso base.', 'Reduce el exponente en 1 en cada llamada y multiplica por x.', '`return x * potencia(x, n - 1)`.'],
      ejemplo: 'potencia(2, 5)'
    },
    {
      fn: 'invertir', par: 'cad', enun: 'Escribe `invertir(cad)` que devuelva la cadena `cad` **al revés**, con recursión. Ejemplo: `invertir("hola")` → `"aloh"`.',
      sol: `def invertir(cad):\n    if cad == "":\n        return ""\n    return invertir(cad[1:]) + cad[0]`, huecos: ['cad == ""', ['return ""', '""'], 'cad[1:]'], alts: { 1: ["cad == ''", 'len(cad) == 0'], 2: ["''"] },
      tests: (rng) => ['', 'a', 'hola', 'recursion', rng.pick(['arbol', 'pila', 'cola'])].map(x => ({ e: `invertir("${x}")`, r: JSON.stringify(x.split('').reverse().join('')) })),
      pistas: ['¿Cómo se invierte la cadena vacía? Ese es el caso base.', 'Invierte el **resto** (`cad[1:]`) y coloca el primer carácter **al final**.', '`return invertir(cad[1:]) + cad[0]`.'],
      ejemplo: 'invertir("hola")'
    },
    {
      fn: 'maximo', par: 'v', enun: 'Escribe `maximo(v)` que devuelva el **mayor elemento** de la lista `v` (no vacía) con recursión, sin usar `max`.',
      sol: `def maximo(v):\n    if len(v) == 1:\n        return v[0]\n    m = maximo(v[1:])\n    return v[0] if v[0] > m else m`, huecos: ['len(v) == 1', 'v[1:]', 'v[0] > m'],
      tests: (rng) => [[5], [1, 9, 3], [4, 4, 4], rng.distinct(6, -20, 50), [10, 9, 8, 7]].map(x => ({ e: `maximo(${JSON.stringify(x)})`, r: String(Math.max(...x)) })),
      pistas: ['¿Cuál es el máximo de una lista con **un solo** elemento? Ese es el caso base.', 'Calcula el máximo del resto de la lista y compáralo con el primer elemento.', '`m = maximo(v[1:])` y devuelve el mayor entre `v[0]` y `m`.'],
      ejemplo: 'maximo([3, 8, 2])'
    },
    {
      fn: 'es_palindromo', par: 's', enun: 'Escribe `es_palindromo(s)` que devuelva `True` si la cadena `s` se lee igual al derecho y al revés (usa recursión: compara los extremos y analiza lo de en medio).',
      sol: `def es_palindromo(s):\n    if len(s) < 2:\n        return True\n    return s[0] == s[-1] and es_palindromo(s[1:-1])`, huecos: ['len(s) < 2', 's[0] == s[-1]', 's[1:-1]'],
      tests: (rng) => ['', 'a', 'oso', 'reconocer', 'abca', 'ab', rng.pick(['anilina', 'casa', 'rotor'])].map(x => ({ e: `es_palindromo("${x}")`, r: String(x === x.split('').reverse().join('')).replace(/^t/, 'T').replace(/^f/, 'F') })),
      pistas: ['Una cadena de 0 o 1 caracteres, ¿es palíndromo? Ese es el caso base.', 'Compara el primero con el último; si coinciden, falta revisar lo de **en medio**.', '`s[0] == s[-1] and es_palindromo(s[1:-1])`.'],
      ejemplo: 'es_palindromo("oso")'
    },
    {
      fn: 'mcd', par: 'a, b', enun: 'Escribe `mcd(a, b)` (máximo común divisor) con el algoritmo de Euclides **recursivo**: `mcd(a, 0) = a` y `mcd(a, b) = mcd(b, a % b)`.',
      sol: `def mcd(a, b):\n    if b == 0:\n        return a\n    return mcd(b, a % b)`, huecos: ['b == 0', ['return a', 'a'], 'a % b'],
      tests: (rng) => { const g = (a, b) => b ? g(b, a % b) : a; return [[12, 18], [7, 5], [100, 25], [48, 0], [rng.int(10, 200), rng.int(10, 200)]].map(([a, b]) => ({ e: `mcd(${a}, ${b})`, r: String(g(a, b)) })); },
      pistas: ['El caso base te lo da el enunciado: ¿cuándo se detiene el algoritmo de Euclides?', 'Cada llamada intercambia: el nuevo primer argumento es `b` y el segundo es el resto de dividir.', '`return mcd(b, a % b)`.'],
      ejemplo: 'mcd(12, 18)'
    }
  ];
  const mkReglasRec = fn => [{ t: 'recursiva', fn }, { t: 'sinBucles', fn }];
  B({
    id: 'n1-impl', n: 1, e: 'B', dif: 3, c: ['rc_impl', 'rc_base'], tema: 'Implementar',
    gen(rng, K, opts) {
      const fam = opts && opts.fam ? FAM_IMPL.find(x => x.fn === opts.fam) : rng.pick(FAM_IMPL);
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: fam.fn, enunciado: fam.enun + '\n\nDebe ser **recursiva**: no se permiten `for` ni `while`.',
        starter: `def ${fam.fn}(${fam.par}):\n    # tu código aquí\n    pass`, solucion: fam.sol, tests: fam.tests(rng), reglas: mkReglasRec(fam.fn), ejemploLlamada: fam.ejemplo,
        pistas: fam.pistas, explicacion: 'Solución de referencia:\n```\n' + fam.sol + '\n```\nCaso base + llamada sobre un subproblema más pequeño.', _fam: fam.fn
      };
    }
  });
  B({
    id: 'n1-completar', n: 1, e: 'B', dif: 2, c: ['rc_impl', 'rc_base', 'rc_def'], tema: 'Completar código',
    gen(rng, K, opts) {
      const fam = rng.pick(FAM_IMPL.filter(f => f.huecos));
      let plantilla = fam.sol; const respuestas = {};
      fam.huecos.forEach((hh, i) => {
        const [ctx, frag] = Array.isArray(hh) ? hh : [hh, hh];
        const p = plantilla.indexOf(ctx); if (p < 0) throw new Error('Hueco no encontrado en ' + fam.fn + ': ' + ctx);
        const q = ctx.indexOf(frag);
        const marca = '' + String.fromCharCode(0xE100 + i) + '';
        plantilla = plantilla.slice(0, p) + ctx.slice(0, q) + marca + ctx.slice(q + frag.length) + plantilla.slice(p + ctx.length);
        respuestas[String(i + 1)] = [frag].concat((fam.alts && fam.alts[i + 1]) || []);
      });
      plantilla = plantilla.replace(/(.)/g, (m, c) => '[[' + (c.charCodeAt(0) - 0xE100 + 1) + ']]');
      return {
        tipo: 'codigo', modoEj: 'completar', fn: fam.fn, enunciado: 'Completa la función recursiva. ' + fam.enun.split('.')[0] + '.',
        plantilla, respuestas, solucion: fam.sol, tests: fam.tests(rng), reglas: mkReglasRec(fam.fn), ejemploLlamada: fam.ejemplo,
        pistas: ['Identifica cuál hueco es la **condición del caso base**, cuál el **valor** que devuelve y cuál el **argumento** de la llamada recursiva.', fam.pistas[1], fam.pistas[2]],
        explicacion: 'Código completo:\n```\n' + fam.sol + '\n```'
      };
    }
  });

  const DEP = [
    { fn: 'factorial', bug: 'Falta el caso base', start: `def factorial(n):\n    return n * factorial(n - 1)`, sol: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)`, tests: [[0, 1], [1, 1], [5, 120], [6, 720]], p: ['Ejecuta `factorial(3)` en la consola: ¿qué error aparece y por qué?', 'La función se llama a sí misma **sin parar**: falta una condición de parada.', 'Agrega `if n <= 1: return 1` antes de la llamada recursiva.'] },
    { fn: 'factorial', bug: 'La llamada usa el mismo argumento', start: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n)`, sol: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)`, tests: [[0, 1], [1, 1], [4, 24], [6, 720]], p: ['La función tiene caso base, pero ¿llega alguna vez a ejecutarse?', 'Mira el argumento de la llamada recursiva: ¿se acerca al caso base?', 'Debe ser `factorial(n - 1)`.'] },
    { fn: 'suma_hasta', bug: 'Falta el return', start: `def suma_hasta(n):\n    if n == 0:\n        return 0\n    n + suma_hasta(n - 1)`, sol: `def suma_hasta(n):\n    if n == 0:\n        return 0\n    return n + suma_hasta(n - 1)`, tests: [[0, 0], [1, 1], [4, 10], [10, 55]], p: ['Prueba `suma_hasta(3)` en la consola: ¿qué devuelve?', 'Si ves `None`, alguna rama no devuelve nada.', 'En la última línea falta la palabra `return`.'] },
    { fn: 'suma_hasta', bug: 'El caso base devuelve un valor incorrecto', start: `def suma_hasta(n):\n    if n == 0:\n        return 1\n    return n + suma_hasta(n - 1)`, sol: `def suma_hasta(n):\n    if n == 0:\n        return 0\n    return n + suma_hasta(n - 1)`, tests: [[0, 0], [1, 1], [4, 10], [10, 55]], p: ['Prueba `suma_hasta(0)`: ¿qué esperarías que devuelva?', 'El caso base se propaga hasta el resultado final: si es incorrecto, todo sale mal.', 'La suma de 1 a 0 es 0, no 1.'] },
    { fn: 'potencia', bug: 'La recursión no reduce el exponente', start: `def potencia(x, n):\n    if n == 0:\n        return 1\n    return x * potencia(x, n)`, sol: `def potencia(x, n):\n    if n == 0:\n        return 1\n    return x * potencia(x, n - 1)`, tests: [[2, 0, 1], [2, 5, 32], [3, 3, 27], [5, 1, 5]], p: ['¿Qué argumento cambia en la llamada recursiva?', 'El exponente debe acercarse al caso base `n == 0`.', 'Debe ser `potencia(x, n - 1)`.'] },
    { fn: 'suma_lista', bug: 'Se pasa la lista completa en la llamada', start: `def suma_lista(v):\n    if not v:\n        return 0\n    return v[0] + suma_lista(v)`, sol: `def suma_lista(v):\n    if not v:\n        return 0\n    return v[0] + suma_lista(v[1:])`, tests: [[[], 0], [[5], 5], [[1, 2, 3], 6], [[4, 4, 4, 4], 16]], p: ['¿La lista de la llamada recursiva es más pequeña que la original?', 'Hay que pasar el **resto** de la lista, sin el primer elemento.', 'Usa `suma_lista(v[1:])`.'] },
    { fn: 'cuenta_atras', bug: 'El caso base no cubre el valor de entrada', start: `def cuenta_atras(n):\n    if n == 0:\n        return []\n    return [n] + cuenta_atras(n - 2)`, sol: `def cuenta_atras(n):\n    if n <= 0:\n        return []\n    return [n] + cuenta_atras(n - 2)`, tests: [[0, []], [4, [4, 2]], [5, [5, 3, 1]], [1, [1]]], p: ['Prueba `cuenta_atras(5)`: el argumento va 5, 3, 1, −1, … ¿llega a 0 alguna vez?', 'El caso base con `==` se «salta» cuando n baja de a 2.', 'Cambia la condición del caso base a `n <= 0`.'] }
  ];
  B({
    id: 'n1-depurar', n: 1, e: 'B', dif: 3, c: ['rc_base', 'in_depurar'], tema: 'Depuración',
    gen(rng, K) {
      const d = rng.pick(DEP);
      const tests = d.tests.map(t => {
        const arg = t.slice(0, -1).map(x => JSON.stringify(x)).join(', '); const res = t[t.length - 1];
        return { e: `${d.fn}(${arg})`, r: JSON.stringify(res).replace('true', 'True').replace('false', 'False') };
      });
      return {
        tipo: 'codigo', modoEj: 'depurar', fn: d.fn, enunciado: 'Esta función recursiva **no funciona**. Encuentra el error y corrígelo. (Tipo de fallo para el informe: **recursión**).',
        starter: d.start, solucion: d.sol, tests, reglas: [{ t: 'recursiva', fn: d.fn }], pistas: d.p, ejemploLlamada: d.fn + '(3)',
        explicacion: '**Error:** ' + d.bug + '.\nVersión corregida:\n```\n' + d.sol + '\n```'
      };
    }
  });

  B({
    id: 'n1-tabla-llamadas', n: 1, e: 'B', dif: 2, c: ['rc_traza', 'rc_pila'], tema: 'Tabla de llamadas',
    gen(rng, K) {
      const fam = pickFam(rng, ['fact', 'suma', 'dos', 'cuad']); const f = rng.pick(NOMBRES); const n = rng.int(3, 5);
      const code = fam.code(f); const s = Py.sesion(code);
      const filas = [];
      for (let k = n; k >= (fam.base === 1 ? 1 : 0); k--) filas.push([{ t: '`' + f + '(' + k + ')`' }, { in: s.evaluar(f + '(' + k + ')').repr, w: 5 }]);
      return {
        tipo: 'tabla', enunciado: 'Se llama a `' + f + '(' + n + ')`. Completa **qué valor devuelve** cada una de las llamadas que se generan (de la más externa a la del caso base).', codigoVista: code,
        cols: ['Llamada', 'Valor que devuelve'], filas,
        pistas: ['Empieza por la **última** llamada (el caso base): su valor se conoce directamente.', 'Cada llamada usa el valor devuelto por la siguiente (la que está debajo en la tabla).', 'De abajo hacia arriba: aplica la fórmula recursiva con el valor ya calculado.'],
        explicacion: 'Se resuelve desde el caso base hacia arriba: cada llamada combina su n con lo que devolvió la llamada siguiente.'
      };
    }
  });

  B({
    id: 'n1-contar-llamadas', n: 1, e: 'B', dif: 3, c: ['rc_conteo', 'rc_fib'], tema: 'Contar llamadas',
    gen(rng, K) {
      const opc = rng.int(0, 2);
      let code, expr, fn, n, texto;
      if (opc === 0) { n = rng.int(3, 7); fn = 'fib'; code = `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)`; expr = `fib(${n})`; texto = 'la función `fib`'; }
      else if (opc === 1) { const fam = pickFam(rng, ['fact', 'suma']); fn = rng.pick(NOMBRES); n = rng.int(4, 9); code = fam.code(fn); expr = `${fn}(${n})`; texto = 'la función `' + fn + '`'; }
      else { n = rng.pick([8, 16, 32, 64, 20, 50]); fn = 'mitad'; code = `def mitad(n):\n    if n <= 1:\n        return 0\n    return 1 + mitad(n // 2)`; expr = `mitad(${n})`; texto = 'la función `mitad`'; }
      const r = K.llamadas(code, expr, fn);
      return {
        tipo: 'salida', enunciado: 'Al evaluar `' + expr + '`, ¿cuántas veces se **ejecuta ' + texto + ' en total**? Cuenta también la llamada inicial.', codigoVista: code, esperado: String(r.n), placeholder: 'Número de llamadas',
        pistas: ['Dibuja el árbol de llamadas (o la lista de llamadas) hasta los casos base.', opc === 0 ? 'En `fib` cada llamada con n ≥ 2 genera **dos** llamadas más. Cuenta hoja por hoja.' : 'Cuenta cuántos valores distintos de n se reciben hasta alcanzar el caso base.', 'Cuenta todos los nodos del árbol de llamadas, no solo las hojas.'],
        explicacion: 'Se hacen **' + r.n + '** llamadas en total (incluida la inicial)' + (opc === 0 ? '. Observa cómo crece: 1, 1, 3, 5, 9, 15, 25, 41… (≈ 2ⁿ), porque se recalculan subproblemas.' : '.')
      };
    }
  });

  const OVF = [
    { f: 'def a(n):\n    return a(n - 1)', arg: 5 },
    { f: 'def b(n):\n    return 0 if n == 0 else b(n - 1)', arg: 5 },
    { f: 'def c(n):\n    return 0 if n == 0 else c(n - 2)', arg: 5 },
    { f: 'def d(n):\n    return 1 if n <= 1 else d(n - 1) + 1', arg: 6 },
    { f: 'def e(n):\n    return n if n == 0 else e(n + 1)', arg: 3 },
    { f: 'def g(n):\n    if n < 0:\n        return 0\n    return g(n - 3) + 1', arg: 7 },
    { f: 'def h(n):\n    if n == 10:\n        return 0\n    return h(n + 1)', arg: 4 },
    { f: 'def k(n):\n    if n == 10:\n        return 0\n    return k(n + 1)', arg: 12 },
    { f: 'def m(n):\n    return 1 if n == 1 else m(n // 2)', arg: 0 },
    { f: 'def p(n):\n    return 1 if n == 1 else p(n // 2)', arg: 9 }
  ];
  B({
    id: 'n1-overflow', n: 1, e: 'B', dif: 3, c: ['rc_overflow', 'rc_base'], tema: 'RecursionError',
    gen(rng, K) {
      const pool = rng.sample(OVF, 8);
      const marcados = pool.map(o => {
        const nm = o.f.match(/def (\w+)/)[1]; const r = Py.ejecutar(o.f + `\nprint(${nm}(${o.arg}))`, { maxDepth: 400 });
        return { o, nm, rec: !r.ok && r.error.tipo === 'RecursionError' };
      });
      const malas = marcados.filter(m => !m.rec), buenas = marcados.filter(m => m.rec);
      if (!buenas.length || !malas.length) return Object.assign({}, this.gen(new U.RNG(rng.int(1, 1e9)), K));
      const nb = Math.min(buenas.length, rng.int(1, 2)), nm = Math.min(malas.length, 4 - nb);
      const sel = rng.shuffle(buenas).slice(0, nb).concat(rng.shuffle(malas).slice(0, nm));
      const opciones = rng.shuffle(sel).map(m => ({ t: '`' + m.o.f.replace(/\n/g, ' ⏎ ') + '`  →  llamada: `' + m.nm + '(' + m.o.arg + ')`', ok: m.rec, why: m.rec ? 'Nunca alcanza su caso base: la pila se agota (`RecursionError`).' : 'Sí alcanza su caso base y termina normalmente.' }));
      return {
        tipo: 'opcion', multi: true, enunciado: '¿Cuáles de estas llamadas terminan con **`RecursionError`**? (Marca todas las que apliquen. Fíjate en si el argumento llega a cumplir el caso base.)', opciones,
        pistas: ['Para cada función, sigue la secuencia de valores de `n` en las llamadas sucesivas.', '¿La secuencia de valores llega **exactamente** a la condición del caso base, o se la salta / se aleja?', 'Ojo con las condiciones `==`: si el argumento salta por encima del valor, la recursión no para.'],
        explicacion: 'Una recursión termina solo si cada llamada se acerca al caso base **y** lo alcanza. Si el argumento se aleja (n+1) o se salta la igualdad (n−2 hacia 0 desde un impar), se agota la pila.'
      };
    }
  });

  /* ============ C ============ */
  B({
    id: 'n1-cache', n: 1, e: 'C', dif: 4, c: ['rc_cache'], tema: 'Caché mutable',
    gen(rng, K) {
      const v = rng.int(0, 2); let code, enun;
      const a = rng.int(1, 5), b = rng.int(6, 9), c = rng.int(2, 4);
      if (v === 0) code = `def agregar(x, lista=[]):\n    lista.append(x)\n    return lista\n\nprint(agregar(${a}))\nprint(agregar(${b}))\nprint(agregar(${c}, []))\nprint(agregar(${a + b}))`;
      else if (v === 1) code = `def contar(n, cache={}):\n    cache[n] = cache.get(n, 0) + 1\n    return cache[n]\n\nprint(contar(${a}))\nprint(contar(${a}))\nprint(contar(${b}))\nprint(contar(${a}))`;
      else code = `def acumula(x, acc=None):\n    if acc is None:\n        acc = []\n    acc.append(x)\n    return acc\n\nprint(acumula(${a}))\nprint(acumula(${b}))\nprint(acumula(${c}))`;
      const esp = K.run(code);
      return {
        tipo: 'salida', enunciado: '¿Qué imprime este programa? (Cuidado con los **valores por defecto** de los parámetros.) Escribe una línea por cada `print`.', codigoVista: code, esperado: esp, stdout: true, multilinea: true, filas: 4,
        pistas: ['Los valores por defecto se evalúan **una sola vez**, cuando se define la función.', 'Si el valor por defecto es mutable (lista o diccionario) se comparte entre llamadas que no pasan ese argumento.', 'Sigue el estado de ese objeto compartido llamada por llamada. ¿Qué cambia con `acc=None`?'],
        explicacion: 'Salida:\n```\n' + esp + '\n```\nUn parámetro por defecto mutable (`[]`, `{}`) se crea una vez y se comparte entre llamadas; el patrón correcto es `acc=None` y crearlo dentro (S5-C2, diap. 8 y 19).'
      };
    }
  });

  B({
    id: 'n1-orden-pila', n: 1, e: 'C', dif: 3, c: ['rc_pila', 'rc_traza'], tema: 'Orden de apilado',
    gen(rng, K) {
      const f = rng.pick(['factorial', 'fact', 'f']); const n = rng.int(3, 4);
      const code = `def ${f}(n):\n    if n <= 1:\n        return 1\n    return n * ${f}(n - 1)`;
      const items = []; for (let k = n; k >= 1; k--) items.push('Se apila `' + f + '(' + k + ')`');
      let acc = 1; const vals = {}; for (let k = 1; k <= n; k++) { acc *= k; vals[k] = acc; }
      items.push('`' + f + '(1)` devuelve 1 (caso base) y se desapila');
      for (let k = 2; k <= n; k++) items.push('`' + f + '(' + k + ')` calcula ' + k + ' × ' + vals[k - 1] + ' = ' + vals[k] + ', devuelve y se desapila');
      const idx = items.map((_, i) => i); let inicial = rng.shuffle(idx); if (inicial.every((x, i) => x === i)) inicial = idx.slice().reverse();
      return {
        tipo: 'orden', enunciado: 'Ordena, de primero a último, los eventos que ocurren al ejecutar `' + f + '(' + n + ')`.', codigoVista: code, items, correcto: idx, inicial,
        pistas: ['Primero ocurre toda la fase de **ida**: se apilan las llamadas hasta el caso base.', 'Después viene el **regreso**: cada llamada se resuelve cuando la que estaba encima de ella termina.', 'La última llamada apilada es la primera en desapilarse (pila LIFO).'],
        explicacion: 'La pila es LIFO: se apila ' + f + '(' + n + '), ..., ' + f + '(1) y luego se desapila en orden inverso, calculando los valores al regresar.'
      };
    }
  });

  B({
    id: 'n1-abierta-iter', n: 1, e: 'C', dif: 3, c: ['rc_iter', 'rc_overflow'], tema: 'Recursión vs iteración',
    gen(rng, K) {
      return {
        tipo: 'abierta', enunciado: 'La versión recursiva de Fibonacci es elegante, pero también existe una versión iterativa *bottom-up*. **¿Cuándo preferirías cada una?** ¿Qué riesgo tiene la recursiva profunda que la iterativa no tiene?',
        criterios: [
          { desc: 'Menciona el riesgo de **recursión profunda**: desbordamiento de pila / `RecursionError` / límite de ~1000 llamadas.', claves: ['recursionerror', 'desbordamiento', 'overflow', ['pila', 'agota'], ['profund'], ['limite', 'recursion']] },
          { desc: 'Relaciona la recursión con el uso de **memoria de pila** (frente a la iterativa, que puede usar O(1) memoria).', claves: [['memoria', 'pila'], ['o(1)'], ['espacio', 'pila'], ['ocupa', 'pila'], ['marcos']] },
          { desc: 'Indica cuándo conviene la **recursiva**: claridad/elegancia o estructuras naturalmente recursivas (p. ej. árboles) o problemas pequeños.', claves: ['elegan', 'claridad', 'legible', 'natural', 'arbol', 'sencill', 'simple', 'facil de leer'] },
          { desc: 'Indica cuándo conviene la **iterativa**: entradas grandes/muy profundas o cuando importa la memoria.', claves: [['iterativ', 'grande'], ['iterativ', 'memoria'], ['iterativ', 'profund'], ['iterativ', 'eficien'], ['iterativ', 'seguro'], ['ciclo', 'grande'], ['bottom', 'memoria']] }
        ],
        modelo: 'La recursiva es más clara y natural cuando el problema (o la estructura, como un árbol) es recursivo, y es suficiente si la profundidad es pequeña. Su riesgo es la **recursión profunda**: cada llamada ocupa un marco en la pila (O(n) de espacio) y en Python el límite (~1000) provoca `RecursionError`. La iterativa *bottom-up* guardando solo los dos últimos valores usa **O(1) de memoria** y no tiene ese riesgo: es preferible con n grande o cuando importa la memoria.',
        pistas: ['Piensa en dos ejes: **claridad** del código y **recursos** (pila/memoria).', 'Recuerda qué pasa en Python si la recursión es muy profunda, y cuánta memoria extra necesita la versión iterativa que solo guarda los dos últimos valores.', 'Estructura sugerida: (1) cuándo recursiva y por qué, (2) cuándo iterativa y por qué, (3) el riesgo de la recursiva profunda.'],
        explicacion: 'Idea central (S5-C2, diap. 17): recursión = elegancia, pero riesgo de pila; iteración bottom-up = O(1) de memoria.'
      };
    }
  });

  B({
    id: 'n1-pot-llamadas', n: 1, e: 'C', dif: 4, c: ['rc_conteo', 'rc_def'], tema: 'Potencia: una vs dos llamadas',
    gen(rng, K) {
      const n = rng.pick([8, 16, 32, 15, 31, 20, 40]);
      const una = `def pot1(x, n):\n    if n == 0:\n        return 1\n    m = pot1(x, n // 2)\n    if n % 2 == 0:\n        return m * m\n    return x * m * m`;
      const dos = `def pot2(x, n):\n    if n == 0:\n        return 1\n    if n % 2 == 0:\n        return pot2(x, n // 2) * pot2(x, n // 2)\n    return x * pot2(x, n // 2) * pot2(x, n // 2)`;
      const a = K.llamadas(una, `pot1(2, ${n})`, 'pot1'), b = K.llamadas(dos, `pot2(2, ${n})`, 'pot2');
      return {
        tipo: 'tabla', enunciado: 'Dos versiones de `x**n` por divide-y-vence (S5-C2, diap. 5). Ambas dan el mismo resultado. Cuenta **cuántas veces se ejecuta cada función** al evaluar con n = ' + n + ' (incluye la llamada inicial).',
        codigos: [{ titulo: 'Versión 1', codigo: una }, { titulo: 'Versión 2', codigo: dos }],
        cols: ['Versión', 'Llamadas en total'], filas: [[{ t: '`pot1(2, ' + n + ')`' }, { in: String(a.n), w: 5 }], [{ t: '`pot2(2, ' + n + ')`' }, { in: String(b.n), w: 5 }]],
        pistas: ['Cuenta primero los valores de n que se reciben en la versión 1: n, n//2, n//4… hasta llegar a 0.', 'En la versión 2 cada llamada con n > 0 hace **dos** llamadas sobre la mitad: el número se duplica en cada nivel.', 'Versión 1: una por nivel. Versión 2: suma de 1 + 2 + 4 + … niveles.'],
        explicacion: 'La versión 1 guarda `m` y hace **una** llamada por nivel: ≈ log₂ n + 2 llamadas → **O(log n)**. La versión 2 llama **dos veces** sobre la mitad: el número de llamadas casi se duplica en cada nivel y resulta ≈ n → **O(n)**. Moraleja: si repites la misma subllamada, pierdes la ganancia de dividir a la mitad.'
      };
    }
  });

  B({
    id: 'n1-mixta', n: 1, e: 'C', dif: 4, c: ['rc_traza', 'rc_conteo', 'rc_pila'], tema: 'Análisis integral',
    gen(rng, K) {
      const fam = pickFam(rng, ['fact', 'suma', 'dos', 'cuad']); const f = rng.pick(NOMBRES); const n = rng.int(4, 7);
      const code = fam.code(f); const val = K.run(code + `\nprint(${f}(${n}))`); const cl = K.llamadas(code, `${f}(${n})`, f);
      return {
        tipo: 'mixta', enunciado: 'Analiza la función y responde las tres partes.', codigoVista: code,
        partes: [
          { titulo: 'Valor', peso: 1, q: { tipo: 'salida', enunciado: '¿Qué valor devuelve `' + f + '(' + n + ')`?', esperado: val, placeholder: 'Valor' } },
          { titulo: 'Llamadas', peso: 1, q: { tipo: 'salida', enunciado: '¿Cuántas llamadas a `' + f + '` se ejecutan en total (con la inicial)?', esperado: String(cl.n), placeholder: 'Número' } },
          {
            titulo: 'Complejidad', peso: 1.5, q: {
              tipo: 'bigo', enunciado: 'Complejidad de `' + f + '(n)` en función de n:', tiempo: 'n', espacio: 'n', pideEspacio: true, etqS: 'Espacio (pila)', escala: ['1', 'logn', 'n', 'nlogn', 'n2', '2n'],
              justif: { opciones: [{ t: 'Hace n llamadas con trabajo O(1) cada una, y la pila llega a n marcos.', ok: true }, { t: 'Hace dos llamadas por nivel, por eso es exponencial.', ok: false, why: 'Aquí solo hay una llamada recursiva por nivel.' }, { t: 'Divide n a la mitad en cada llamada.', ok: false, why: 'Resta 1 (o un valor fijo), no divide.' }] }
            }
          }
        ],
        pistas: ['Resuelve cada parte por separado; la traza de la parte a) te ayuda con las otras dos.', 'El número de llamadas depende de cuánto baja n en cada llamada y de en qué valor está el caso base.', 'Una llamada por nivel y profundidad lineal → tiempo y pila O(n).'],
        explicacion: 'Valor ' + val + ', ' + cl.n + ' llamadas; una sola llamada recursiva que resta 1 a n → tiempo O(n) y pila O(n).'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);

