/* banco_pq_tabla.js — «Complete la tabla con la complejidad en el peor caso de cada operación» (pregunta 2 del parcial):
   celdas con complejidades escritas a mano (se aceptan O(n²), O(n^2), O(n log n)…; «amortizado» hay que escribirlo cuando corresponde)
   y justificación de las filas menos evidentes. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, B = ET.Banco.add, PQ = ET.PQ, cr = PQ.cr;

  /** celda: alternativas aceptadas */
  const C = (...alts) => alts;
  const FILAS = {};

  /* ---------- BST sin balancear · AVL · arreglo ordenado ---------- */
  FILAS.estructuras = {
    cols: ['Operación (peor caso, n elementos)', 'BST sin balancear', 'AVL', 'Arreglo ordenado (list)'],
    filas: [
      { t: 'Buscar un valor', c: [C('O(n)', 'O(h)'), C('O(log n)'), C('O(log n)')] },
      { t: 'Insertar un valor nuevo', c: [C('O(n)', 'O(h)'), C('O(log n)'), C('O(n)')],
        why: cr('Insertar: en el arreglo hay que **desplazar** elementos (O(n)); en el BST el peor caso es el árbol degenerado (h = n − 1)', 'desplaz', 'mover', 'corr', 'degenerad', 'h = n', 'n-1'), m: '**Insertar:** en el arreglo ordenado hay que **desplazar** elementos para abrir el hueco (O(n)); en el BST sin balancear el peor caso es el árbol **degenerado** (h = n − 1); el AVL rebalancea y mantiene h = O(log n).' },
      { t: 'Eliminar un valor', c: [C('O(n)', 'O(h)'), C('O(log n)'), C('O(n)')] },
      { t: 'Obtener el mínimo', c: [C('O(n)', 'O(h)'), C('O(log n)'), C('O(1)')],
        why: cr('Mínimo: en el arreglo ordenado está en la posición 0 (O(1)); en el árbol hay que bajar siempre a la izquierda (O(h))', 'posicion 0', 'primer', 'indice 0', 'a la izquierda', 'izquierda'), m: '**Mínimo:** en el arreglo ordenado es el elemento de la **posición 0** (O(1)); en un árbol hay que **bajar siempre a la izquierda** hasta el final: O(h), es decir O(n) en el degenerado y O(log n) en el AVL.' },
      { t: 'Recorrer todos los valores en orden', c: [C('O(n)'), C('O(n)'), C('O(n)')] },
      { t: 'Hallar el siguiente valor mayor a uno dado', c: [C('O(n)', 'O(h)'), C('O(log n)'), C('O(log n)')],
        why: cr('Siguiente mayor: en el arreglo se halla el valor por búsqueda binaria (O(log n)) y el siguiente está en la posición siguiente', 'binaria', 'log', 'posicion siguiente', 'siguiente posicion', 'i+1'), m: '**Siguiente mayor:** en el arreglo basta una **búsqueda binaria** (O(log n)) y tomar la posición siguiente; en el árbol se baja por un camino (O(h)).' },
      { t: 'Construir insertando n valores que llegan ya ordenados', c: [C('O(n^2)', 'O(n²)'), C('O(n log n)'), C('O(n)')],
        why: cr('Valores ordenados: el BST queda degenerado y la k-ésima inserción cuesta O(k) (suma = O(n²)); el AVL paga O(log n) por inserción', 'degenerad', 'cadena', 'o(k)', 'suma', 'n²', 'n2', 'log'), m: '**Construir con valores ordenados:** el BST queda **degenerado** y la k-ésima inserción baja k niveles (1 + 2 + … + n = O(n²)); el AVL paga O(log n) por inserción (O(n log n)); en el arreglo cada valor ya llega en su sitio (se agrega al final, O(1) amortizado cada uno → O(n)).' }
    ]
  };

  /* ---------- costos ocultos de Python en recursión y recorridos ---------- */
  FILAS.costos = {
    cols: ['Operación (peor caso, n elementos)', 'list de Python', 'collections.deque'],
    filas: [
      { t: 'Acceder al elemento i-ésimo', c: [C('O(1)'), C('O(n)')],
        why: cr('Acceso: la lista es un arreglo contiguo (O(1)); la deque está enlazada por bloques y para llegar a la mitad hay que recorrer (O(n))', 'contiguo', 'arreglo', 'bloques', 'enlazad', 'recorrer'), m: '**Acceso por índice:** la lista de Python es un **arreglo contiguo** (O(1)); la deque se implementa por **bloques enlazados** y acceder al medio exige recorrer: O(n).' },
      { t: 'Agregar un elemento al final', c: [C('O(1) amortizado', 'O(1) amort'), C('O(1)')],
        why: cr('append en list: cuando el arreglo se llena se redimensiona y se copian los elementos (O(n)), pero repartido entre muchas operaciones es O(1) amortizado', 'redimension', 'copia', 'se llena', 'crece', 'amortiz', 'cada tanto'), m: '**append en list:** cuando el arreglo se llena hay que **redimensionarlo y copiar** (O(n)), pero repartido entre muchas operaciones resulta **O(1) amortizado**; en deque es O(1) estricto.' },
      { t: 'Insertar un elemento al inicio', c: [C('O(n)'), C('O(1)')] },
      { t: 'Quitar el primer elemento (`pop(0)` / `popleft()`)', c: [C('O(n)'), C('O(1)')],
        why: cr('pop(0) en list: hay que desplazar todos los elementos restantes una posición (O(n)); popleft() en deque solo ajusta el extremo (O(1))', 'desplaz', 'mover', 'corr', 'todos los elementos', 'extremo'), m: '**pop(0) en list:** hay que **desplazar todos los elementos** una posición (O(n)); `popleft()` en deque solo ajusta el extremo: O(1). Por eso una cola con `list.pop(0)` vuelve cuadrático un BFS.' },
      { t: 'Quitar el último elemento', c: [C('O(1)'), C('O(1)')] },
      { t: 'Comprobar si un valor está (`x in …`)', c: [C('O(n)'), C('O(n)')] },
      { t: 'Crear la rebanada `A[1:]`', c: [C('O(n)'), C('No soportado', 'no existe', 'no se puede', 'n/a')],
        why: cr('Rebanada A[1:]: copia los n − 1 elementos a una lista nueva (O(n)); por eso la recursión con A[1:] sale O(n²)', 'copia', 'nueva lista', 'o(n)', 'n-1', 'n − 1'), m: '**Rebanada `A[1:]`:** **copia** n − 1 elementos en una lista nueva (O(n)); por eso una recursión que se llama con `A[1:]` resulta O(n²). (Una deque no admite rebanadas.)' }
    ]
  };

  /* ---------- funciones recursivas: tiempo y pila ---------- */
  FILAS.rec = {
    cols: ['Función', 'Tiempo (peor caso)', 'Espacio de pila (extra)'],
    filas: [
      { t: '`factorial(n)` con `n * factorial(n-1)`', c: [C('O(n)'), C('O(n)')] },
      { t: '`fib(n)` ingenua (`fib(n-1) + fib(n-2)`)', c: [C('O(2^n)', 'O(2ⁿ)'), C('O(n)')],
        why: cr('fib ingenua: el tiempo es exponencial por el árbol de llamadas, pero la pila solo guarda un camino de profundidad n (O(n))', 'exponencial', '2^n', '2ⁿ', 'camino', 'profundidad', 'rama'), m: '**fib ingenua:** el **tiempo** es exponencial (árbol de llamadas con subproblemas repetidos) pero la **pila** solo guarda **un camino** de profundidad n: espacio O(n), no O(2ⁿ).' },
      { t: '`fib(n)` con memoización (diccionario)', c: [C('O(n)'), C('O(n)')] },
      { t: '`potencia(x, n)` con `n // 2` (una llamada por nivel)', c: [C('O(log n)'), C('O(log n)')] },
      { t: 'búsqueda binaria recursiva sobre un arreglo de n elementos', c: [C('O(log n)'), C('O(log n)')] },
      { t: 'recorrido preorden de un árbol de n nodos y altura h', c: [C('O(n)'), C('O(h)')],
        why: cr('Recorrido: se visita cada nodo una vez (O(n)) pero solo están activas las llamadas del camino raíz–nodo actual (O(h))', 'una vez', 'cada nodo', 'camino', 'h+1', 'activas', 'altura'), m: '**Recorrido recursivo de un árbol:** cada nodo se visita **una vez** (tiempo O(n)), pero la pila solo guarda las llamadas del **camino raíz–nodo actual**: espacio O(h) (O(n) solo en el degenerado).' },
      { t: '`suma(A)` recursiva con `A[1:]` (trabajo O(1) aparte de la rebanada)', c: [C('O(n^2)', 'O(n²)'), C('O(n)')],
        why: cr('Con A[1:]: cada llamada copia la lista (O(n) oculto) → tiempo O(n²); la pila tiene n marcos (O(n))', 'copia', 'oculto', 'rebanada', 'slice', 'n²', 'n2'), m: '**Con `A[1:]`:** cada llamada **copia** el resto de la lista (costo oculto O(n)), así que el tiempo es O(n²); la pila tiene n marcos: espacio de pila O(n).' }
    ]
  };

  /* ---------- paradigmas ---------- */
  FILAS.par = {
    cols: ['Algoritmo (peor caso)', 'Tiempo', 'Espacio extra'],
    filas: [
      { t: 'Fibonacci con DP bottom-up (dos variables)', c: [C('O(n)'), C('O(1)')] },
      { t: 'Cambio de monedas por DP (monto V, m monedas) con tabla', c: [C('O(V·m)', 'O(V*m)', 'O(m·V)'), C('O(V)')],
        why: cr('Cambio por DP: tabla de V + 1 entradas y, por cada entrada, se prueban las m monedas → tiempo O(V·m), espacio O(V)', 'v+1', 'v + 1', 'tabla', 'cada moneda', 'm monedas', 'producto'), m: '**Cambio por DP:** la tabla tiene **V + 1** entradas y para cada una se prueban las **m** monedas: tiempo O(V·m); el espacio es la tabla, O(V).' },
      { t: 'Viajante (TSP) por fuerza bruta con n ciudades', c: [C('O(n!)', 'O((n-1)!)', 'O((n−1)!)'), C('O(n)')] },
      { t: 'Generar todos los subconjuntos de n elementos (cada uno impreso)', c: [C('O(n·2^n)', 'O(n*2^n)', 'O(2^n·n)'), C('O(n)')],
        why: cr('Hay 2ⁿ subconjuntos y construir/imprimir cada uno cuesta hasta O(n) → O(n·2ⁿ); la recursión usa pila O(n)', '2^n', '2ⁿ', 'cada subconjunto', 'o(n)', 'n·2'), m: '**Subconjuntos:** hay **2ⁿ** subconjuntos y cada uno cuesta hasta O(n) construirlo o imprimirlo: O(n·2ⁿ); la recursión usa una pila de profundidad n (O(n)).' },
      { t: 'Merge sort sobre n elementos', c: [C('O(n log n)'), C('O(n)')],
        why: cr('Merge sort: T(n) = 2T(n/2) + O(n) → O(n log n); la mezcla usa una lista auxiliar de tamaño n (espacio O(n))', '2t(n/2)', '2·t(n/2)', 'dos mitades', 'mezcla', 'merge', 'auxiliar', 'niveles', 'n log n'), m: '**Merge sort:** T(n) = 2·T(n/2) + O(n) → O(n log n) en tiempo; la mezcla necesita una **lista auxiliar** de tamaño n: espacio O(n).' },
      { t: 'Búsqueda binaria (iterativa) en un arreglo ordenado', c: [C('O(log n)'), C('O(1)')] },
      { t: 'Mochila 0/1 por DP (n objetos, capacidad W)', c: [C('O(n·W)', 'O(n*W)', 'O(W·n)'), C('O(n·W)', 'O(n*W)', 'O(W)')],
        why: cr('Mochila 0/1: la tabla tiene n × W celdas y cada una se calcula en O(1) → tiempo O(n·W)', 'n×w', 'n*w', 'n·w', 'celdas', 'tabla', 'n por w', 'producto'), m: '**Mochila 0/1:** la tabla tiene **n × W** celdas y cada una se calcula en O(1): tiempo O(n·W) (el espacio es la tabla, O(n·W), reducible a O(W)).' }
    ]
  };

  const TEMAS = {
    estructuras: { c: ['bs_altura', 'bs_eliminar', 'av_complejidad', 'bs_minmax'], nombre: 'BST, AVL y arreglo ordenado', intro: 'Suponga **n elementos** almacenados. Para el BST sin balancear piense en el peor caso (árbol degenerado, h = n − 1); el AVL mantiene h = O(log n).' },
    costos: { c: ['cx_python', 'tv_bfs', 'cx_recursivo'], nombre: 'costos de Python en recursión y recorridos', intro: 'Suponga **n elementos** almacenados.' },
    rec: { c: ['rc_conteo', 'rc_pila', 'cx_recursivo', 'rc_fib'], nombre: 'funciones recursivas', intro: 'Complete la tabla con el **tiempo** y el **espacio de pila** en el peor caso.' },
    par: { c: ['pd_coin', 'pd_dp', 'pd_dyc', 'pd_fb'], nombre: 'paradigmas algorítmicos', intro: 'Complete la tabla con el **tiempo** y el **espacio extra** en el peor caso.' }
  };
  // [nivel, etapa, dificultad, filas, ¿versión de parcial?]
  const VARIANTES = { estructuras: [[6, 'B', 3, 4, false], [7, 'C', 4, 5, true]], costos: [[5, 'B', 3, 4, false], [5, 'C', 4, 5, true]], rec: [[1, 'A', 2, 3, false], [1, 'B', 3, 4, false], [1, 'C', 4, 5, true]], par: [[3, 'B', 3, 4, false], [3, 'C', 4, 5, true]] };

  Object.keys(TEMAS).forEach(k => {
    VARIANTES[k].forEach(([nivel, e, dif, nFilas, parcial]) => {
      const T = TEMAS[k], D = FILAS[k];
      B({
        id: 'pq-tabla-' + k + '-' + e, n: nivel, e, dif, c: T.c, tema: 'Parcial: tabla de complejidades — ' + T.nombre, parcial, slot: 'tabla',
        gen(rng) {
          const reducida = k === 'estructuras' && !parcial;       // en el nivel 6 todavía no se estudia el AVL: se omite esa columna
          const idxCols = reducida ? [0, 1, 3] : D.cols.map((_, i) => i);
          const celdasDe = f => reducida ? [f.c[0], f.c[2]] : f.c;
          const filas = rng.shuffle(D.filas);
          const dificiles = filas.filter(f => f.why), faciles = filas.filter(f => !f.why);
          const nJ = parcial ? 2 : 1;
          const justif = dificiles.slice(0, nJ);
          const resto = rng.shuffle(dificiles.slice(nJ).concat(faciles)).slice(0, nFilas - justif.length);
          const sel = rng.shuffle(justif.concat(resto));
          const cuerpo = sel.map(f => [{ t: f.t }].concat(celdasDe(f).map(alts => ({ in: alts, w: 12 }))));
          const partes = [
            { titulo: 'Tabla', peso: 4, q: { tipo: 'tabla', cx: true, enunciado: '(' + PQ.fmt('0.2') + ' por fila.) Escribe la complejidad como `O(n)`, `O(n^2)`, `O(log n)`… **En las casillas donde la respuesta correcta sea amortizada y no estricta, escríbelo explícitamente** (por ejemplo `O(1) amortizado`).', cols: idxCols.map(i => D.cols[i]), filas: cuerpo } },
            { titulo: 'Justificación', peso: 1, q: { tipo: 'abierta', enunciado: 'Justifique brevemente ' + (justif.length > 1 ? 'las filas «' : 'la fila «') + justif.map(f => f.t.replace(/`/g, '')).join('» y «') + '» (las menos evidentes).', criterios: justif.map(f => f.why), modelo: justif.map(f => f.m).join('\n\n'), filas: 4 } }
          ];
          return {
            tipo: 'mixta', fmt: 'Parcial · Tabla de complejidades', cat: 'analisis', valor: nFilas * 0.2, enunciado: T.intro,
            partes,
            pistas: ['Para cada fila piensa **qué hay que recorrer o mover** en el peor caso (¿todo el arreglo?, ¿un camino raíz–hoja?, ¿una sola posición?).', 'Recuerda: BST degenerado → h = n − 1; AVL → h = O(log n); `list`: insertar o quitar al inicio desplaza n elementos; `append` es **amortizado**.', 'No olvides **escribir «amortizado»** en la celda que lo requiera y justificar las filas pedidas.'],
            explicacion: sel.map(f => '- **' + f.t + ':** ' + celdasDe(f).map((c, i) => D.cols[idxCols[i + 1]] + ' → ' + c[0]).join(' · ')).join('\n') + '\n\n' + justif.map(f => f.m).join('\n\n')
          };
        }
      });
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
