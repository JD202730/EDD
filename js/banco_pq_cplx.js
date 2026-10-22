/* banco_pq_cplx.js — «Determine la complejidad de cada función: variable, caso, regla y justificación» (pregunta 3 del parcial).
   Cada familia genera una función con su complejidad esperada y una rúbrica; donde es posible se incluye `medir`,
   que las pruebas usan para comprobar con el intérprete que el crecimiento de pasos coincide con la clase declarada. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, Arb = ET.Arb, B = ET.Banco.add, PQ = ET.PQ;
  const cod = U.dedent;
  const cr = PQ.cr;

  const PRE_NODO = cod(`
    class NodoArbol:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None
    def construir(lo, hi):
        if lo > hi:
            return None
        m = (lo + hi) // 2
        n = NodoArbol(m)
        n.izq = construir(lo, m - 1)
        n.der = construir(m + 1, hi)
        return n
    def cadena(lo, hi):
        raiz = None
        for v in range(hi, lo - 1, -1):
            n = NodoArbol(v)
            n.der = raiz
            raiz = n
        return raiz
    T1 = construir(1, 63)
    T2 = construir(1, 127)
    C1 = cadena(1, 32)
    C2 = cadena(1, 64)
  `);
  const NODO = ET.Kit.CLASE_NODO;

  /** construye la pregunta de una función */
  function cq(o) {
    let reglas = o.reglas || ['suma', 'producto', 'oculto', 'log', 'rec'];
    if (!reglas.includes(o.e.regla)) reglas = reglas.slice(0, reglas.length - 1).concat([o.e.regla]);
    return {
      tipo: 'cplx', codigoVista: o.codigo, enunciado: o.enun || '', esperado: o.e,
      escala: o.escala || ['1', 'logn', 'n', 'nlogn', 'n2', 'n3', '2n'], variables: o.vars || ['n', 'k', 'm', 'V'], reglasOpc: reglas,
      justif: { criterios: o.crit.map(c => cr(c[0], ...c.slice(1))), modelo: o.m },
      medir: o.medir || null, varMotivo: o.varMotivo, casoMotivo: o.casoMotivo, reglaMotivo: o.reglaMotivo, pistaClase: o.pista, etq: o.etq
    };
  }
  const E = (clase, variable, caso, regla) => ({ clase, variable, caso, regla });

  const FAM = {};

  /* ---------------- recursión (nivel 1) ---------------- */
  FAM.rec = [
    rng => { const f = rng.pick(['suma', 'total', 'acumula']);
      return cq({ codigo: cod(`
          def ${f}(A, i):
              if i == len(A):
                  return 0
              return A[i] + ${f}(A, i + 1)
        `), e: E('n', 'n', 'peor', 'rec'), vars: ['n', 'i', 'k', 'm'], varMotivo: 'n = len(A)',
        crit: [['Cuenta las llamadas: una por elemento (n + 1 llamadas)', 'n+1', 'n + 1', 'n llamadas', 'una por', 'una llamada por', 'cada elemento', 'n veces'], ['Cada llamada hace trabajo constante O(1), así que el total es O(n)', 'o(1)', 'constante', 'lineal', 'o(n)']],
        m: 'Hay **una llamada por elemento** (n + 1 llamadas, con n = len(A)) y cada una hace trabajo **constante** O(1): el total es O(n).',
        medir: { pre: '', exprs: [f + '(list(range(40)), 0)', f + '(list(range(80)), 0)'], ns: [40, 80] } }); },
    rng => { const f = rng.pick(['fib', 'f', 'serie']); const n = rng.int(20, 35);
      return cq({ codigo: cod(`
          def ${f}(n):
              if n <= 1:
                  return n
              return ${f}(n - 1) + ${f}(n - 2)
        `), e: E('2n', 'n', 'peor', 'rec'), vars: ['n', 'k', 'm', 'V'], reglaMotivo: 'Se plantea la recurrencia del número de llamadas T(n) = T(n−1) + T(n−2) + 1.',
        crit: [['Cada llamada genera dos llamadas (árbol de llamadas que se ramifica)', 'dos llamadas', 'se ramifica', 'arbol', 'dos subproblemas', 'dos'], ['Los subproblemas se repiten y el número de llamadas crece como 2ⁿ (exponencial)', 'exponencial', '2^n', '2ⁿ', 'repet', 'duplica']],
        m: 'Cada llamada genera **dos llamadas** (el árbol de llamadas se ramifica) y los subproblemas se **repiten**: el número de llamadas crece de forma **exponencial**, O(2ⁿ).',
        medir: { pre: '', exprs: [f + '(15)', f + '(16)'], ns: [15, 16] } }); },
    rng => { const f = rng.pick(['pot', 'potencia', 'elevar']);
      return cq({ codigo: cod(`
          def ${f}(x, n):
              if n == 0:
                  return 1
              r = ${f}(x, n // 2)
              if n % 2 == 0:
                  return r * r
              return r * r * x
        `), e: E('logn', 'n', 'peor', 'log'), varMotivo: 'n es el exponente', reglaMotivo: 'El exponente se divide a la mitad en cada llamada.',
        crit: [['El exponente n se divide a la mitad en cada llamada (una sola llamada recursiva)', 'mitad', 'n // 2', 'n//2', 'divide', '/2'], ['Se llega a 0 tras ≈ log₂ n llamadas, cada una con trabajo O(1)', 'log', 'o(1)', 'constante']],
        m: 'En cada llamada el exponente se **divide a la mitad** y hay una sola llamada recursiva: se llega al caso base en ≈ **log₂ n** llamadas, cada una con trabajo O(1).',
        medir: { pre: '', exprs: [f + '(1, 1024)', f + '(1, 1048576)'], ns: [1024, 1048576] } }); },
    rng => { const f = rng.pick(['contar_pos', 'cuenta', 'positivos']);
      return cq({ codigo: cod(`
          def ${f}(A):
              if len(A) == 0:
                  return 0
              return (1 if A[0] > 0 else 0) + ${f}(A[1:])
        `), e: E('n2', 'n', 'peor', 'oculto'), varMotivo: 'n = len(A)', reglaMotivo: 'La rebanada A[1:] copia la lista en cada llamada.',
        crit: [['La rebanada A[1:] copia la lista: costo oculto O(n) en cada llamada', 'copia', 'oculto', 'rebanada', 'slice', 'nueva lista'], ['Suma n + (n−1) + … + 1 = O(n²) (hay n llamadas)', 'n²', 'n2', 'n^2', 'cuadr', 'n(n+1)/2', 'suma']],
        m: 'Hay n llamadas, pero cada **rebanada `A[1:]` copia** la lista (costo oculto O(n)); la suma n + (n−1) + … + 1 da **O(n²)**.',
        medir: { pre: '', exprs: [f + '(list(range(40)))', f + '(list(range(80)))'], ns: [40, 80] } }); },
    rng => { const f = rng.pick(['mitad', 'pasos', 'cuenta']);
      return cq({ codigo: cod(`
          def ${f}(n):
              c = 0
              while n > 1:
                  n = n // 2
                  c += 1
              return c
        `), e: E('logn', 'n', 'peor', 'log'), reglaMotivo: 'n se divide a la mitad en cada iteración.',
        crit: [['En cada iteración n se divide a la mitad', 'mitad', 'n // 2', 'n//2', 'divide', '/2'], ['El ciclo se ejecuta ≈ log₂ n veces', 'log', 'logaritm']],
        m: 'En cada iteración n se **divide a la mitad**, así que el ciclo se ejecuta ≈ **log₂ n** veces (cada una con trabajo O(1)).',
        medir: { pre: '', exprs: [f + '(1024)', f + '(1048576)'], ns: [1024, 1048576] } }); },
    rng => { const f = rng.pick(['g', 'suma_tri', 'trabajo']);
      return cq({ codigo: cod(`
          def ${f}(n):
              if n == 0:
                  return 0
              c = 0
              for i in range(n):
                  c += 1
              return c + ${f}(n - 1)
        `), e: E('n2', 'n', 'peor', 'rec'), reglaMotivo: 'La recurrencia es T(n) = T(n−1) + n.',
        crit: [['Cada llamada hace un ciclo de n iteraciones y luego llama con n − 1', 'ciclo', 'n iteraciones', 'n−1', 'n-1'], ['La suma n + (n−1) + … + 1 = n(n+1)/2 → O(n²)', 'n²', 'n2', 'n^2', 'cuadr', 'suma']],
        m: 'Cada llamada hace un **ciclo de n iteraciones** y llama con n − 1: T(n) = n + (n−1) + … + 1 = n(n+1)/2 → **O(n²)**.',
        medir: { pre: '', exprs: [f + '(30)', f + '(60)'], ns: [30, 60] } }); },
    rng => { const f = rng.pick(['bb', 'busca', 'bin']);
      return cq({ codigo: cod(`
          def ${f}(A, x, lo, hi):
              if lo > hi:
                  return -1
              m = (lo + hi) // 2
              if A[m] == x:
                  return m
              if A[m] < x:
                  return ${f}(A, x, m + 1, hi)
              return ${f}(A, x, lo, m - 1)
        `), e: E('logn', 'n', 'peor', 'log'), varMotivo: 'n = hi − lo + 1 = len(A)', casoMotivo: 'el mejor caso sería O(1): el elemento está en la mitad',
        crit: [['En cada llamada el intervalo [lo, hi] se reduce a la mitad (una sola llamada recursiva)', 'mitad', 'reduce', 'descarta', '/2', 'divide'], ['Peor caso: ≈ log₂ n llamadas; cada una con trabajo O(1)', 'log', 'o(1)']],
        m: 'En cada llamada el intervalo se **reduce a la mitad** y solo hay una llamada recursiva: en el **peor caso** (no está o está al final de la búsqueda) son ≈ **log₂ n** llamadas de trabajo O(1).',
        medir: { pre: 'LA = list(range(1024))\nLB = list(range(65536))', exprs: [f + '(LA, -1, 0, 1023)', f + '(LB, -1, 0, 65535)'], ns: [1024, 65536] } }); }
  ];

  /* ---------------- paradigmas (nivel 3) ---------------- */
  FAM.par = [
    rng => { const f = rng.pick(['fib', 'fibm', 'f']);
      return cq({ codigo: cod(`
          def ${f}(n, memo=None):
              if memo is None:
                  memo = {}
              if n <= 1:
                  return n
              if n not in memo:
                  memo[n] = ${f}(n - 1, memo) + ${f}(n - 2, memo)
              return memo[n]
        `), e: E('n', 'n', 'peor', 'rec'), reglaMotivo: 'Hay n subproblemas distintos y cada uno se calcula una sola vez.',
        crit: [['Cada subproblema ${f}(k) se calcula una sola vez y se guarda en memo'.replace('${f}', f), 'una sola vez', 'una vez', 'guarda', 'memo'], ['Hay solo n subproblemas distintos con trabajo O(1) cada uno → O(n)', 'n subproblemas', 'o(n)', 'lineal', 'o(1)']],
        m: 'Cada subproblema se calcula **una sola vez** y se guarda en `memo`; hay solo **n subproblemas distintos** con trabajo O(1) cada uno: O(n).',
        medir: { pre: '', exprs: [f + '(30)', f + '(60)'], ns: [30, 60] } }); },
    rng => { const f = rng.pick(['cambio', 'monedas_min', 'min_monedas']);
      return cq({ codigo: cod(`
          def ${f}(monedas, V):
              dp = [0] + [V + 1] * V
              for v in range(1, V + 1):
                  for m in monedas:
                      if m <= v and dp[v - m] + 1 < dp[v]:
                          dp[v] = dp[v - m] + 1
              return dp[V]
        `), e: E('Vm', 'V y m', 'peor', 'producto'), escala: ['logn', 'n', 'nlogn', 'n2', 'Vm', '2n'], vars: ['V', 'm', 'V y m', 'n'], varMotivo: 'V es el monto y m = len(monedas)', reglaMotivo: 'Ciclo externo de V iteraciones × ciclo interno de m iteraciones.', etq: { Vm: 'O(V·m)' },
        crit: [['El ciclo externo hace V iteraciones y el interno m (el número de monedas)', 'v iteraciones', 'externo', 'interno', 'anidad', 'm monedas', 'cada moneda'], ['Regla del producto: V · m operaciones', 'producto', 'v·m', 'v*m', 'v por m', 'multipl']],
        m: 'El ciclo externo hace **V** iteraciones y, dentro, el interno recorre las **m** monedas: por la **regla del producto**, O(V·m).' }); },
    rng => { const f = rng.pick(['cuenta', 'subconj', 'sumas']);
      return cq({ codigo: cod(`
          def ${f}(A, i, resto):
              if i == len(A):
                  return 1 if resto == 0 else 0
              return ${f}(A, i + 1, resto) + ${f}(A, i + 1, resto - A[i])
        `), e: E('2n', 'n', 'peor', 'rec'), varMotivo: 'n = len(A)', reglaMotivo: 'Cada elemento se incluye o no: dos llamadas por nivel.',
        crit: [['Cada elemento genera dos llamadas (incluirlo o no)', 'dos llamadas', 'incluir', 'incluirlo', 'dos'], ['La profundidad es n, así que hay ≈ 2ⁿ hojas: O(2ⁿ)', '2^n', '2ⁿ', 'exponencial', 'profundidad']],
        m: 'Cada elemento genera **dos llamadas** (se incluye o no) y la profundidad es n: hay ≈ **2ⁿ** hojas, O(2ⁿ).',
        medir: { pre: '', exprs: [f + '(list(range(10)), 0, 20)', f + '(list(range(11)), 0, 20)'], ns: [10, 11] } }); },
    rng => { const f = rng.pick(['ordenar', 'msort', 'mezcla_ord']);
      return cq({ codigo: cod(`
          def mezclar(izq, der):
              res = []
              i = j = 0
              while i < len(izq) and j < len(der):
                  if izq[i] <= der[j]:
                      res.append(izq[i])
                      i += 1
                  else:
                      res.append(der[j])
                      j += 1
              return res + izq[i:] + der[j:]

          def ${f}(A):
              if len(A) <= 1:
                  return A
              m = len(A) // 2
              return mezclar(${f}(A[:m]), ${f}(A[m:]))
        `), e: E('nlogn', 'n', 'peor', 'rec'), varMotivo: 'n = len(A)', reglaMotivo: 'T(n) = 2T(n/2) + O(n).',
        crit: [['Dos llamadas sobre mitades (n/2) y mezclar cuesta O(n) en cada nivel', 'mitades', 'n/2', 'dos llamadas', 'mezclar', 'mezcla', 'o(n)'], ['Hay ≈ log₂ n niveles de n trabajo cada uno → O(n log n)', 'log', 'niveles', 'n log n', 'nlogn']],
        m: 'T(n) = 2·T(n/2) + O(n): **dos llamadas sobre mitades** y **mezclar cuesta O(n)** por nivel; con ≈ **log₂ n niveles** resulta O(n log n).' }); },
    rng => { const f = rng.pick(['pares', 'dos_suma', 'busca_par']);
      return cq({ codigo: cod(`
          def ${f}(A, objetivo):
              n = len(A)
              for i in range(n):
                  for j in range(i + 1, n):
                      if A[i] + A[j] == objetivo:
                          return (i, j)
              return None
        `), e: E('n2', 'n', 'peor', 'producto'), varMotivo: 'n = len(A)', casoMotivo: 'en el mejor caso el par está al inicio (O(1))',
        crit: [['Dos ciclos anidados: el interno depende de i (n−1, n−2, …, 1 iteraciones)', 'anidad', 'dos ciclos', 'depende de i', 'n-1', 'n−1'], ['Suma n(n−1)/2 pares → O(n²) (regla del producto/ciclos anidados)', 'n²', 'n2', 'n^2', 'cuadr', 'n(n-1)/2', 'producto']],
        m: 'Dos ciclos **anidados**: el interno hace n−1, n−2, … iteraciones, en total n(n−1)/2 pares → **O(n²)** en el peor caso (regla del producto).',
        medir: { pre: '', exprs: [f + '(list(range(40)), -1)', f + '(list(range(80)), -1)'], ns: [40, 80] } }); },
    rng => { const f = rng.pick(['escalera', 'maneras', 'pasos_dp']);
      return cq({ codigo: cod(`
          def ${f}(n):
              a, b = 1, 1
              for _ in range(n - 1):
                  a, b = b, a + b
              return b
        `), e: E('n', 'n', 'peor', 'producto'), varMotivo: 'n es el número de escalones', reglaMotivo: 'n iteraciones × trabajo constante.',
        crit: [['El ciclo hace n − 1 iteraciones', 'n iteraciones', 'n-1', 'n−1', 'ciclo', 'for'], ['Cada iteración cuesta O(1): total O(n) (y espacio O(1))', 'o(1)', 'constante', 'lineal', 'o(n)']],
        m: 'Un solo ciclo de **n − 1 iteraciones** con trabajo **O(1)** en cada una: O(n) en tiempo y O(1) en espacio.',
        medir: { pre: '', exprs: [f + '(30)', f + '(60)'], ns: [30, 60] } }); }
  ];

  /* ---------------- árboles (nivel 4) ---------------- */
  FAM.arb = [
    rng => { const f = rng.pick(['contar', 'cuenta_nodos', 'tamano']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(nodo):
              if nodo is None:
                  return 0
              return 1 + ${f}(nodo.izq) + ${f}(nodo.der)
        `), e: E('n', 'n', 'peor', 'rec'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'],
        crit: [['Se hace una llamada por nodo (y una por cada hijo vacío): cada nodo se visita una vez', 'una vez', 'cada nodo', 'una llamada por nodo', 'una por nodo'], ['Trabajo O(1) por llamada → O(n) con n = número de nodos', 'o(1)', 'constante', 'o(n)', 'lineal']],
        m: 'Se hace **una llamada por nodo** (más una por cada hijo vacío): cada nodo se visita **una sola vez** y cada llamada cuesta O(1): **O(n)**, con n = número de nodos.',
        medir: { pre: PRE_NODO, exprs: [f + '(T1)', f + '(T2)'], ns: [63, 127] } }); },
    rng => { const f = rng.pick(['altura', 'prof_max', 'alt']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(nodo):
              if nodo is None:
                  return -1
              return 1 + max(${f}(nodo.izq), ${f}(nodo.der))
        `), e: E('n', 'n', 'peor', 'rec'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos: hay que mirar todos los nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'],
        crit: [['Para conocer la altura hay que visitar todos los nodos, una vez cada uno', 'todos los nodos', 'cada nodo', 'una vez', 'visita'], ['Trabajo O(1) por llamada → O(n), no O(h)', 'o(1)', 'o(n)', 'lineal', 'constante']],
        m: 'Calcular la altura **visita todos los nodos una vez** (una llamada por nodo, trabajo O(1) cada una): **O(n)**, no O(h).',
        medir: { pre: PRE_NODO, exprs: [f + '(T1)', f + '(T2)'], ns: [63, 127] } }); },
    rng => { const mejor = rng.chance(0.5); const f = rng.pick(['hay', 'existe', 'contiene']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(nodo, x):
              if nodo is None:
                  return False
              if nodo.valor == x:
                  return True
              return ${f}(nodo.izq, x) or ${f}(nodo.der, x)
        `), enun: mejor ? 'En esta función se pide el **mejor caso**.' : '', e: mejor ? E('1', 'n', 'mejor', 'const') : E('n', 'n', 'peor', 'rec'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos (el árbol no es BST: no se puede descartar ningún lado)', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'],
        reglas: ['suma', 'producto', 'oculto', 'rec', 'const'],
        crit: mejor ? [['En el mejor caso el valor está en la raíz', 'raiz', 'primer'], ['Solo se hace una comparación: O(1)', 'o(1)', 'una comparacion', 'constante', 'una sola']]
          : [['El árbol no es un BST: no se puede descartar un lado, en el peor caso se visitan todos los nodos', 'no es un bst', 'no es bst', 'todos los nodos', 'cada nodo', 'sin orden', 'no se puede descartar'], ['Trabajo O(1) por nodo → O(n)', 'o(n)', 'lineal', 'o(1)']],
        m: mejor ? 'En el **mejor caso** el valor está en la **raíz**: una sola comparación, **O(1)**.' : 'Como el árbol **no es un BST** no se puede descartar ningún lado: en el **peor caso** (el valor no está) se visitan **todos los nodos**, O(1) por nodo: **O(n)**.',
        medir: mejor ? null : { pre: PRE_NODO, exprs: [f + '(T1, -5)', f + '(T2, -5)'], ns: [63, 127] } }); },
    rng => { const f = rng.pick(['hojas', 'cuenta_hojas', 'n_hojas']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(nodo):
              if nodo is None:
                  return 0
              if nodo.izq is None and nodo.der is None:
                  return 1
              return ${f}(nodo.izq) + ${f}(nodo.der)
        `), e: E('n', 'n', 'peor', 'rec'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'],
        crit: [['Cada nodo se visita una sola vez', 'una vez', 'cada nodo', 'una sola'], ['Cada visita cuesta O(1): O(n)', 'o(1)', 'o(n)', 'lineal', 'constante']],
        m: 'Cada nodo se visita **una sola vez** y cada visita cuesta O(1): **O(n)** con n = número de nodos.',
        medir: { pre: PRE_NODO, exprs: [f + '(T1)', f + '(T2)'], ns: [63, 127] } }); }
  ];

  /* ---------------- recorridos (nivel 5) ---------------- */
  FAM.trv = [
    rng => { const f = rng.pick(['por_niveles', 'bfs', 'niveles']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(raiz):
              cola = [raiz]
              res = []
              while cola:
                  nodo = cola.pop(0)
                  res.append(nodo.valor)
                  if nodo.izq is not None:
                      cola.append(nodo.izq)
                  if nodo.der is not None:
                      cola.append(nodo.der)
              return res
        `), e: E('n2', 'n', 'peor', 'oculto'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'], reglaMotivo: 'cola.pop(0) desplaza todos los elementos de la lista.',
        crit: [['El ciclo procesa n nodos (cada nodo entra y sale una vez)', 'n nodos', 'cada nodo', 'una vez', 'n iteraciones'], ['`pop(0)` en una lista de Python cuesta O(n) (costo oculto): total O(n²); con deque sería O(n)', 'pop(0)', 'oculto', 'o(n)', 'desplaza', 'deque', 'n²', 'n2']],
        m: 'El ciclo procesa **n nodos**, pero `cola.pop(0)` sobre una lista de Python **desplaza todos los elementos** (costo oculto O(n)): O(n²) en total. Con `collections.deque` y `popleft()` sería O(n).',
        medir: { pre: PRE_NODO, exprs: [f + '(T1)', f + '(T2)'], ns: [63, 127], tol: [0.5, 1.4] } }); },
    rng => { const f = rng.pick(['inorden', 'ino_iter', 'recorre']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(raiz):
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
        `), e: E('n', 'n', 'peor', 'amort'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'], reglas: ['suma', 'producto', 'oculto', 'amort', 'rec'], reglaMotivo: 'Hay un while anidado en otro while, pero cada nodo se apila y se desapila una sola vez.',
        crit: [['Hay un while dentro de otro while, pero cada nodo se apila una sola vez', 'una vez', 'una sola vez', 'cada nodo', 'apila'], ['Total de apilar/desapilar ≤ 2n operaciones O(1): O(n) (argumento amortizado, no n²)', 'amortiz', 'o(n)', '2n', 'lineal', 'no es n²', 'no n²']],
        m: 'Aunque hay un `while` dentro de otro, **cada nodo se apila una sola vez y se desapila una sola vez**: en total ≤ 2n operaciones O(1), es decir **O(n)** (argumento amortizado, no O(n²)).',
        medir: { pre: PRE_NODO, exprs: [f + '(T1)', f + '(T2)'], ns: [63, 127] } }); },
    rng => { const f = rng.pick(['preorden', 'pre', 'visita_pre']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(nodo, res):
              if nodo is None:
                  return
              res.append(nodo.valor)
              ${f}(nodo.izq, res)
              ${f}(nodo.der, res)
        `), e: E('n', 'n', 'peor', 'rec'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'],
        crit: [['Una llamada por nodo (y una por hijo vacío): cada nodo se visita una vez', 'una vez', 'cada nodo', 'una llamada por nodo'], ['`append` es O(1) amortizado: O(1) por llamada → O(n)', 'o(1)', 'o(n)', 'lineal', 'constante', 'append']],
        m: 'Cada nodo se visita **una sola vez** (una llamada por nodo) y `append` cuesta O(1): **O(n)**. El espacio de pila es O(h).',
        medir: { pre: PRE_NODO + '\n' + 'def ps(f, T):\n    r = []\n    f(T, r)\n    return r', exprs: ['ps(' + f + ', T1)', 'ps(' + f + ', T2)'], ns: [63, 127] } }); },
    rng => { const f = rng.pick(['nivel_k', 'en_nivel', 'valores_nivel']); const k = rng.int(2, 4);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(nodo, k):
              if nodo is None:
                  return []
              if k == 0:
                  return [nodo.valor]
              return ${f}(nodo.izq, k - 1) + ${f}(nodo.der, k - 1)
        `), e: E('n', 'n', 'peor', 'rec'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos (en el peor caso k ≥ h y se recorre todo el árbol)', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'], reglaMotivo: 'No se pide la variable k: aun con k grande se visita cada nodo a lo sumo una vez.',
        crit: [['Se visita cada nodo a lo sumo una vez (hasta el nivel k)', 'una vez', 'cada nodo', 'a lo sumo', 'nodos'], ['En el peor caso (k grande) se recorre todo el árbol: O(n)', 'o(n)', 'lineal', 'todo el arbol', 'peor caso']],
        m: 'Cada nodo se visita **a lo sumo una vez** (la recursión se detiene al llegar al nivel k o a un hijo vacío); en el **peor caso** se recorre todo el árbol: **O(n)**.' }); }
  ];

  /* ---------------- BST (nivel 6) ---------------- */
  FAM.bst = [
    rng => { const mejor = rng.chance(0.4); const f = rng.pick(['buscar', 'esta', 'localiza']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(raiz, x):
              nodo = raiz
              while nodo is not None:
                  if x == nodo.valor:
                      return True
                  if x < nodo.valor:
                      nodo = nodo.izq
                  else:
                      nodo = nodo.der
              return False
        `), enun: 'El árbol es un **BST**.' + (mejor ? ' Aquí se pide el **mejor caso**.' : ''), e: mejor ? E('1', 'h', 'mejor', 'const') : E('h', 'h', 'peor', 'altura'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'h = altura del árbol (en el peor caso h = n − 1)', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2'], reglas: ['suma', 'producto', 'oculto', 'altura', 'const'],
        casoMotivo: mejor ? 'el valor está en la raíz' : 'el valor no está, o es la hoja más profunda', pista: 'En un BST cada iteración baja un nivel: ¿cuántos niveles puede haber?',
        crit: mejor ? [['El valor buscado está en la raíz', 'raiz', 'primer'], ['Una sola comparación: O(1)', 'o(1)', 'una comparacion', 'constante']] : [['Cada iteración baja un nivel: a lo sumo h + 1 iteraciones', 'baja un nivel', 'nivel', 'a lo sumo h', 'h+1', 'cada iteracion'], ['Costo O(h); solo es O(log n) si el árbol está balanceado (en el degenerado h = n − 1)', 'o(h)', 'altura', 'balancead', 'degenerad', 'n-1']],
        m: mejor ? 'En el **mejor caso** el valor está en la **raíz**: una comparación, **O(1)**.' : 'Cada iteración **baja un nivel**: como mucho h + 1 iteraciones, es decir **O(h)** (con h la altura). Es O(log n) solo si el árbol está balanceado; en el degenerado h = n − 1.' }); },
    rng => { const f = rng.pick(['insertar', 'inserta', 'agregar']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def ${f}(nodo, v):
              if nodo is None:
                  return NodoArbol(v)
              if v < nodo.valor:
                  nodo.izq = ${f}(nodo.izq, v)
              elif v > nodo.valor:
                  nodo.der = ${f}(nodo.der, v)
              return nodo
        `), enun: 'El árbol es un **BST** con n nodos y altura h.', e: E('h', 'h', 'peor', 'altura'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'h = altura del árbol', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2'], reglas: ['suma', 'producto', 'oculto', 'altura', 'const'],
        crit: [['Una sola llamada recursiva por nivel: se baja por un único camino', 'un solo camino', 'un camino', 'una llamada', 'nivel', 'camino'], ['Como mucho h + 1 llamadas, cada una O(1): O(h)', 'o(h)', 'h+1', 'altura', 'o(1)']],
        m: 'Se desciende por **un solo camino** (una llamada por nivel, a lo sumo h + 1) con trabajo O(1) en cada una: **O(h)**; O(n) si el árbol es degenerado.' }); },
    rng => { const f = rng.pick(['es_bst', 'valido', 'chequea']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def maximo(nodo):
              if nodo is None:
                  return -10**9
              return max(nodo.valor, maximo(nodo.izq), maximo(nodo.der))

          def minimo(nodo):
              if nodo is None:
                  return 10**9
              return min(nodo.valor, minimo(nodo.izq), minimo(nodo.der))

          def ${f}(nodo):
              if nodo is None:
                  return True
              if maximo(nodo.izq) >= nodo.valor or minimo(nodo.der) <= nodo.valor:
                  return False
              return ${f}(nodo.izq) and ${f}(nodo.der)
        `), enun: 'Considere el **peor caso** (árbol degenerado: cada nodo tiene un solo hijo).', e: E('n2', 'n', 'peor', 'producto'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'], reglas: ['suma', 'producto', 'oculto', 'rec', 'const'],
        crit: [['En cada nodo se llama a maximo/minimo, que recorren todo un subárbol: O(n) por nodo', 'maximo', 'minimo', 'subarbol', 'recorr', 'o(n) por'], ['n nodos × O(n) cada uno (regla del producto) → O(n²) en el degenerado', 'n²', 'n2', 'n^2', 'cuadr', 'producto', 'n nodos']],
        m: 'En **cada nodo** se llama a `maximo`/`minimo`, que **recorren un subárbol entero** (O(n) en el degenerado); por la **regla del producto**, n nodos × O(n) = **O(n²)**.',
        medir: { pre: PRE_NODO, exprs: [f + '(C1)', f + '(C2)'], ns: [32, 64] } }); },
    rng => { const f = rng.pick(['construir_bst', 'arma', 'cargar']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def insertar(nodo, v):
              if nodo is None:
                  return NodoArbol(v)
              if v < nodo.valor:
                  nodo.izq = insertar(nodo.izq, v)
              elif v > nodo.valor:
                  nodo.der = insertar(nodo.der, v)
              return nodo

          def ${f}(valores):
              raiz = None
              for v in valores:
                  raiz = insertar(raiz, v)
              return raiz
        `), enun: 'Los valores llegan **ya ordenados** de menor a mayor. Considere el peor caso.', e: E('n2', 'n', 'peor', 'producto'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = len(valores)', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'], reglas: ['suma', 'producto', 'oculto', 'rec', 'const'],
        crit: [['Con valores ordenados el árbol queda degenerado: la inserción k-ésima cuesta O(k)', 'degenerad', 'cadena', 'lista', 'o(k)', 'cada insercion'], ['Suma 1 + 2 + … + n = O(n²) (n inserciones × O(n))', 'n²', 'n2', 'n^2', 'cuadr', 'suma', 'producto']],
        m: 'Con valores ordenados el árbol queda **degenerado** (una cadena): la k-ésima inserción baja k niveles. La suma 1 + 2 + … + n da **O(n²)**.',
        medir: { pre: '', exprs: [f + '(list(range(30)))', f + '(list(range(60)))'], ns: [30, 60] } }); },
    rng => { const f = rng.pick(['esta_ordenado_bst', 'inorden_ok', 'valida']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def inorden(nodo, res):
              if nodo is None:
                  return
              inorden(nodo.izq, res)
              res.append(nodo.valor)
              inorden(nodo.der, res)

          def ${f}(raiz):
              res = []
              inorden(raiz, res)
              for i in range(1, len(res)):
                  if res[i - 1] >= res[i]:
                      return False
              return True
        `), e: E('n', 'n', 'peor', 'suma'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'], reglaMotivo: 'Dos bloques consecutivos: recorrido O(n) y luego un ciclo O(n).',
        crit: [['Dos bloques consecutivos: el recorrido inorden O(n) y luego un ciclo de n − 1 comparaciones O(n)', 'consecutiv', 'dos bloques', 'recorrido', 'luego', 'despues'], ['Regla de la suma: O(n) + O(n) = O(n) (y espacio extra O(n) por la lista)', 'suma', 'o(n)', 'lineal', 'mayor']],
        m: 'Dos bloques **consecutivos**: el recorrido inorden O(n) y luego un ciclo de n − 1 comparaciones O(n). Por la **regla de la suma**, O(n) + O(n) = **O(n)** (con espacio extra O(n) por la lista).' }); }
  ];

  /* ---------------- AVL (nivel 7) ---------------- */
  const NODO_AVL = cod(`
    class NodoAVL:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None
            self.h = 0
  `);
  FAM.avl = [
    rng => { const der = rng.chance(0.5);
      return cq({ codigo: NODO_AVL + '\n\n' + cod(`
          def altura(n):
              return -1 if n is None else n.h

          def rotar_${der ? 'derecha' : 'izquierda'}(y):
              x = y.${der ? 'izq' : 'der'}
              y.${der ? 'izq' : 'der'} = x.${der ? 'der' : 'izq'}
              x.${der ? 'der' : 'izq'} = y
              y.h = 1 + max(altura(y.izq), altura(y.der))
              x.h = 1 + max(altura(x.izq), altura(x.der))
              return x
        `), e: E('1', 'n', 'peor', 'const'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos del árbol (la rotación no depende de él)', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2'], reglas: ['suma', 'producto', 'oculto', 'rec', 'const'],
        crit: [['Solo se reasignan unos pocos punteros y se recalculan dos alturas (sin ciclos ni recursión)', 'punteros', 'sin ciclos', 'sin bucles', 'dos alturas', 'asignaciones'], ['Cada operación es O(1): la rotación cuesta O(1), sin importar el tamaño de los subárboles', 'o(1)', 'constante', 'no depende']],
        m: 'Solo se **reasignan unos pocos punteros** y se **recalculan dos alturas** (acceso a `.h`, sin ciclos ni recursión): cada operación es O(1), así que la rotación cuesta **O(1)**.' }); },
    rng => { const f = rng.pick(['insertar_avl', 'ins', 'agregar_avl']);
      return cq({ codigo: NODO_AVL + '\n\n' + cod(`
          def ${f}(nodo, v):
              if nodo is None:
                  return NodoAVL(v)
              if v < nodo.valor:
                  nodo.izq = ${f}(nodo.izq, v)
              elif v > nodo.valor:
                  nodo.der = ${f}(nodo.der, v)
              nodo.h = 1 + max(altura(nodo.izq), altura(nodo.der))
              return rebalancear(nodo)
        `), enun: '`altura`, `rebalancear` y las rotaciones cuestan **O(1)**. El árbol es un **AVL** con n nodos.', e: E('logn', 'n', 'peor', 'altura'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos (la altura h de un AVL es O(log n))', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2'], reglas: ['suma', 'producto', 'oculto', 'altura', 'const'],
        crit: [['Se baja por un solo camino (a lo sumo h + 1 llamadas) y al volver se hace trabajo O(1)', 'un solo camino', 'un camino', 'h+1', 'una llamada', 'camino'], ['En un AVL h = O(log n): O(log n) en total', 'log', 'logaritm', 'o(log n)']],
        m: 'Se desciende por **un solo camino** (a lo sumo h + 1 llamadas) y en el regreso se hace trabajo O(1). Como en un AVL **h = O(log n)**, el total es **O(log n)**.' }); },
    rng => { const f = rng.pick(['es_avl', 'balanceado', 'chequea_avl']);
      return cq({ codigo: NODO + '\n\n' + cod(`
          def altura(nodo):
              if nodo is None:
                  return -1
              return 1 + max(altura(nodo.izq), altura(nodo.der))

          def ${f}(nodo):
              if nodo is None:
                  return True
              a = ${f}(nodo.izq)
              b = ${f}(nodo.der)
              d = abs(altura(nodo.izq) - altura(nodo.der))
              return a and b and d <= 1
        `), enun: 'Considere el **peor caso** (árbol degenerado).', e: E('n2', 'n', 'peor', 'producto'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = número de nodos', escala: ['1', 'logn', 'h', 'n', 'nlogn', 'n2', '2n'], reglas: ['suma', 'producto', 'oculto', 'rec', 'const'],
        crit: [['En cada nodo se recalcula la altura de sus subárboles, que recorre un subárbol completo (O(n))', 'altura', 'recalcula', 'recorre', 'subarbol', 'o(n) por'], ['n nodos × O(n) = O(n²) (se puede lograr O(n) devolviendo altura y validez a la vez)', 'n²', 'n2', 'n^2', 'cuadr', 'producto', 'n nodos']],
        m: 'En **cada nodo** se llama a `altura`, que recorre **un subárbol completo** (O(n) en el degenerado): n nodos × O(n) = **O(n²)**. Se puede lograr O(n) si la recursión devuelve la altura y la validez a la vez.',
        medir: { pre: PRE_NODO, exprs: [f + '(C1)', f + '(C2)'], ns: [32, 64] } }); },
    rng => { const f = rng.pick(['construir_avl', 'arma_avl', 'cargar_avl']);
      return cq({ codigo: cod(`
          def ${f}(valores):
              raiz = None
              for v in valores:
                  raiz = insertar_avl(raiz, v)
              return raiz
        `), enun: '`insertar_avl` cuesta **O(log n)** en el peor caso (n = número de nodos presentes).', e: E('nlogn', 'n', 'peor', 'producto'), vars: ['n', 'h', 'k', 'm'], varMotivo: 'n = len(valores)', escala: ['1', 'logn', 'n', 'nlogn', 'n2', 'n3', '2n'],
        crit: [['El ciclo hace n inserciones', 'n inserciones', 'n veces', 'ciclo', 'for'], ['Cada inserción cuesta O(log n): regla del producto, O(n log n)', 'producto', 'log', 'n log n', 'nlogn', 'multipl']],
        m: 'El ciclo hace **n inserciones** y cada una cuesta **O(log n)**: por la **regla del producto**, O(n log n) (incluso con valores ordenados, a diferencia del BST sin balanceo).' }); }
  ];

  PQ.FAM_CPLX = FAM;
  const TEMAS = {
    rec: { n: 1, c: ['rc_conteo', 'rc_fib', 'rc_pila', 'cx_recursivo'], nombre: 'recursión' },
    par: { n: 3, c: ['pd_memo', 'pd_dp', 'pd_dyc', 'pd_coin', 'cx_recursivo'], nombre: 'paradigmas' },
    arb: { n: 4, c: ['ar_nodo', 'ar_profalt', 'cx_recursivo'], nombre: 'árboles' },
    trv: { n: 5, c: ['tv_pre', 'tv_in', 'tv_bfs', 'cx_python'], nombre: 'recorridos' },
    bst: { n: 6, c: ['bs_buscar', 'bs_insertar', 'bs_altura', 'bs_ordenins'], nombre: 'BST' },
    avl: { n: 7, c: ['av_rotsimple', 'av_insertar', 'av_complejidad'], nombre: 'AVL' }
  };
  [['A', 2, 1, 0.34], ['B', 3, 2, 0.5], ['C', 4, 3, 1]].forEach(([e, dif, nPartes]) => {
    Object.keys(TEMAS).forEach(k => {
      const T = TEMAS[k];
      B({
        id: 'pq-cx-' + k + '-' + e, n: T.n, e, dif, c: T.c, tema: 'Parcial: complejidad con variable, caso y regla — ' + T.nombre, parcial: e === 'C', slot: 'cplx',
        gen(rng) {
          const fams = rng.shuffle(FAM[k].map((_, i) => i)).slice(0, nPartes);
          const partes = fams.map((i, j) => ({ titulo: 'Función ' + String.fromCharCode(97 + j), peso: 1, q: FAM[k][i](rng) }));
          return {
            tipo: 'mixta', fmt: 'Parcial · Complejidad', cat: 'analisis', valor: nPartes === 3 ? 1 : (nPartes === 2 ? 0.67 : 0.34),
            enunciado: 'Determine la **complejidad temporal en el peor caso** de ' + (nPartes === 1 ? 'la función' : 'cada función') + ' en términos de la variable que corresponda, e indique **qué regla usó** (regla de la suma, regla del producto, costo oculto de una operación de Python, etc.). Indique siempre **respecto de qué variable** y **de qué caso** habla, y **justifique**.',
            partes,
            pistas: ['Identifica qué operación se repite más y **cuántas veces** (en función de la variable que se indica).', 'Ciclos anidados → producto; bloques consecutivos → suma (domina el mayor); si el índice se divide o duplica → logaritmo; cuidado con los **costos ocultos** (`pop(0)`, `A[1:]`, `x in lista`).', 'Si es recursiva, escribe la **recurrencia** (cuántas llamadas y cuánto trabajo por llamada) o cuenta el árbol de llamadas.'],
            explicacion: partes.map((p, i) => '**' + String.fromCharCode(97 + i) + ')** ' + p.q.justif.modelo).join('\n\n')
          };
        }
      });
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
