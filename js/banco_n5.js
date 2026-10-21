/* banco_n5.js — Nivel 5: Recorridos de árboles (S6-C1) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py, Arb = ET.Arb;
  const TR = {
    pre: { n: 'preorden', f: Arb.pre, o: 'raíz → izq → der', cid: 'tv_pre' },
    in: { n: 'inorden', f: Arb.ino, o: 'izq → raíz → der', cid: 'tv_in' },
    post: { n: 'postorden', f: Arb.post, o: 'izq → der → raíz', cid: 'tv_post' }
  };
  const J = a => a.map(String).join(' ');

  B({
    id: 'n5-recorrido', n: 5, e: 'A', dif: 2, c: ['tv_pre', 'tv_in', 'tv_post'], tema: 'Calcular un recorrido',
    gen(rng, K) {
      const n = rng.int(5, 8); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) }); const k = rng.pick(['pre', 'in', 'post']); const T = TR[k];
      return {
        tipo: 'salida', tokens: true, enunciado: 'Escribe el recorrido en **' + T.n + '** (' + T.o + ') del árbol, con los nodos separados por espacios.', arbol: t, esperado: J(T.f(t)), placeholder: 'p. ej. A B C …',
        conceptos: [T.cid], animacion: { arbol: t, orden: T.f(t), nombre: T.n },
        pistas: ['Recuerda el orden de visita: **' + T.o + '**. Se aplica a cada subárbol, no solo a la raíz.', k === 'pre' ? 'Escribe la raíz y luego recorre en preorden todo el subárbol izquierdo y después todo el derecho.' : (k === 'in' ? 'Baja primero por todo lo que cuelga a la izquierda; cuando no haya más, visita el nodo y pasa a su subárbol derecho.' : 'Visita completos los subárboles izquierdo y derecho; la raíz de cada subárbol es lo último que se escribe.'), 'Hazlo de forma recursiva: resuelve primero un subárbol pequeño (una hoja con su padre) y arma el resultado.'],
        explicacion: T.n + ': **' + J(T.f(t)) + '**. Cada nodo se visita una sola vez (O(n)).'
      };
    }
  });

  const CODIGOS_TR = {
    pre: f => `def ${f}(nodo):\n    if nodo is None:\n        return\n    print(nodo.valor)\n    ${f}(nodo.izq)\n    ${f}(nodo.der)`,
    in: f => `def ${f}(nodo):\n    if nodo is None:\n        return\n    ${f}(nodo.izq)\n    print(nodo.valor)\n    ${f}(nodo.der)`,
    post: f => `def ${f}(nodo):\n    if nodo is None:\n        return\n    ${f}(nodo.izq)\n    ${f}(nodo.der)\n    print(nodo.valor)`,
    niv: f => `from collections import deque\n\ndef ${f}(raiz):\n    cola = deque([raiz])\n    while cola:\n        nodo = cola.popleft()\n        print(nodo.valor)\n        if nodo.izq:\n            cola.append(nodo.izq)\n        if nodo.der:\n            cola.append(nodo.der)`
  };
  B({
    id: 'n5-identifica-codigo', n: 5, e: 'A', dif: 2, c: ['tv_pre', 'tv_in', 'tv_post', 'tv_bfs'], tema: 'Identificar el recorrido en código',
    gen(rng, K) {
      const k = rng.pick(['pre', 'in', 'post', 'niv']); const f = rng.pick(['recorrer', 'visitar', 'f', 'mostrar']);
      const nombres = { pre: 'Preorden', in: 'Inorden', post: 'Postorden', niv: 'Por niveles (BFS)' };
      const por = { pre: 'La raíz se imprime **antes** de las llamadas sobre los hijos.', in: 'La raíz se imprime **entre** la llamada sobre el hijo izquierdo y la del derecho.', post: 'La raíz se imprime **después** de ambas llamadas recursivas.', niv: 'Usa una **cola** y visita nivel por nivel; no hay recursión.' };
      return Object.assign(K.mc(rng, '¿Qué recorrido implementa esta función?', [[nombres[k], por[k]]], Object.keys(nombres).filter(x => x !== k).map(x => [nombres[x], 'No: ' + por[x].replace(/\*\*/g, '') + ' (en este código no ocurre así).'])), {
        codigoVista: CODIGOS_TR[k](f), conceptos: [k === 'niv' ? 'tv_bfs' : TR[k].cid],
        pistas: ['Fíjate en **dónde** está el `print` respecto a las llamadas recursivas.', 'Antes de las llamadas = preorden; entre ellas = inorden; después = postorden; con cola y sin recursión = por niveles.', 'Si hay `deque` y `popleft`, el recorrido es por niveles.'],
        explicacion: por[k]
      });
    }
  });

  const USOS = [
    ['Copiar o serializar un árbol', 0, 'Se necesita la raíz antes que sus hijos para reconstruirlo.'], ['Imprimir la arquitectura de una red de arriba hacia abajo', 0, 'El padre se procesa antes que los hijos.'],
    ['Exportar un menú anidado (cada padre antes que sus hijos)', 0, 'Padre primero: preorden.'], ['Obtener los valores de un BST en orden ascendente', 1, 'En un BST el inorden entrega los datos ordenados.'],
    ['Listar en orden alfabético las palabras guardadas en un BST', 1, 'Inorden sobre un BST = orden.'], ['Liberar la memoria de un árbol (hijos antes que el padre)', 2, 'Hay que procesar los hijos antes que el padre.'],
    ['Evaluar un árbol de expresión aritmética', 2, 'Se necesitan los valores de los dos operandos antes de aplicar el operador.'], ['Calcular el tamaño de una carpeta a partir de las subcarpetas', 2, 'Primero se conocen los tamaños de los hijos.'],
    ['Retropropagación (autograd): los gradientes de los hijos antes que los del padre', 2, 'Postorden: hijos primero (S6-C1, diap. 20-21).'], ['Producir la notación postfija (RPN) de una expresión', 2, 'El postorden de un árbol de expresión es la notación postfija.']
  ];
  B({
    id: 'n5-usos', n: 5, e: 'A', dif: 2, c: ['tv_usos'], tema: 'Aplicaciones de los recorridos',
    gen(rng, K) {
      const items = rng.sample(USOS, 5).map(u => ({ t: u[0], cat: u[1], why: u[2] }));
      return {
        tipo: 'clasificar', enunciado: '¿Qué recorrido (preorden, inorden o postorden) es el adecuado para cada tarea?', categorias: ['Preorden', 'Inorden', 'Postorden'], items,
        pistas: ['Pregúntate: ¿se necesita el padre **antes** que los hijos, o los hijos **antes** que el padre?', 'Inorden se asocia con el **orden** de los datos en un BST.', 'Evaluar, liberar memoria, calcular tamaños y retropropagar necesitan primero a los hijos: postorden.'],
        explicacion: 'Preorden: copiar/serializar; inorden: datos ordenados en un BST; postorden: evaluar expresiones, liberar memoria, calcular tamaños, autograd (S6-C1, diap. 18).'
      };
    }
  });

  const VF5 = [
    { a: 'El recorrido inorden de un BST entrega los valores en orden ascendente.', v: true, e: 'Primero lo menor (izquierda), luego el nodo, luego lo mayor (derecha).', j: ['Se visita todo lo menor, luego el nodo y luego todo lo mayor.', 'El inorden visita la raíz primero.', 'El inorden solo funciona con árboles perfectos.'] },
    { a: 'En el recorrido **postorden** la raíz se visita primero.', v: false, e: 'En postorden la raíz se visita al final (izq → der → raíz).', j: ['El postorden visita ambos subárboles antes que la raíz.', 'Postorden y preorden son el mismo recorrido.', 'La raíz se visita al principio porque es la más importante.'] },
    { a: 'Preorden, inorden y postorden son variantes de DFS (búsqueda en profundidad).', v: true, e: 'Solo cambia cuándo se visita la raíz respecto a sus subárboles.', j: ['Los tres bajan por un subárbol hasta el fondo antes de pasar al siguiente: solo cambia cuándo se visita la raíz.', 'Los tres recorren el árbol nivel por nivel.', 'Solo el preorden es DFS.'] },
    { a: 'El recorrido por niveles (BFS) utiliza una **pila**.', v: false, e: 'BFS usa una **cola**; el DFS recursivo usa la pila de llamadas.', j: ['BFS visita en orden de llegada (FIFO): una cola.', 'BFS necesita una pila para volver atrás.', 'BFS no necesita ninguna estructura auxiliar.'] },
    { a: 'Los recorridos recursivos pre/in/postorden visitan cada nodo una sola vez, por lo que cuestan O(n).', v: true, e: 'Trabajo constante por nodo.', j: ['Cada nodo se visita una vez con trabajo O(1).', 'Cuestan O(n²) porque cada nodo llama a sus dos hijos.', 'Cuestan O(log n) porque dividen el árbol.'] },
    { a: 'Con solo el recorrido preorden se puede reconstruir de forma única cualquier árbol binario.', v: false, e: 'Un solo recorrido no determina el árbol: se necesitan dos (p. ej. preorden + inorden).', j: ['Dos árboles distintos pueden tener el mismo preorden.', 'El preorden contiene la altura del árbol.', 'El preorden siempre coincide con el inorden.'] },
    { a: 'En el preorden de un árbol, el **primer** elemento es siempre la raíz.', v: true, e: 'Preorden: raíz → izq → der.', j: ['La raíz se visita antes que cualquiera de sus descendientes.', 'El primer elemento es siempre una hoja.', 'El primer elemento es el nodo más a la izquierda.'] },
    { a: 'En el postorden de un árbol, el **último** elemento es siempre la raíz.', v: true, e: 'Postorden: izq → der → raíz.', j: ['La raíz se visita después de ambos subárboles.', 'El último elemento es la hoja más a la derecha.', 'El último elemento es el menor valor.'] },
    { a: 'Si en un recorrido recursivo se omite el caso base `nodo is None`, al llegar a una hoja se produce un `AttributeError`.', v: true, e: 'Al llamar con `nodo.izq` (=None) se intentaría leer `None.valor`.', j: ['Las hojas tienen hijos `None` y luego se accede a `None.valor`.', 'Python rellena automáticamente el caso base.', 'Se produce un bucle infinito.'] }
  ];
  B({
    id: 'n5-vf', n: 5, e: 'A', dif: 2, c: ['tv_pre', 'tv_in', 'tv_post', 'tv_usos', 'tv_bfs'], tema: 'Recorridos (V/F)',
    gen(rng, K) {
      const it = rng.pick(VF5);
      return {
        tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón correcta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Recuerda: preorden raíz→izq→der; inorden izq→raíz→der; postorden izq→der→raíz.', 'Prueba la afirmación con un árbol de 3 nodos.', 'BFS usa cola; DFS (recursivo) usa la pila de llamadas.']
      };
    }
  });

  B({
    id: 'n5-bfs', n: 5, e: 'A', dif: 2, c: ['tv_bfs'], tema: 'Recorrido por niveles',
    gen(rng, K) {
      const n = rng.int(5, 8); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) });
      return {
        tipo: 'salida', tokens: true, enunciado: 'Escribe el recorrido **por niveles (BFS)** del árbol: nivel por nivel, de izquierda a derecha.', arbol: t, esperado: J(Arb.niveles(t)), placeholder: 'p. ej. A B C …', animacion: { arbol: t, orden: Arb.niveles(t), nombre: 'por niveles' },
        pistas: ['Primero la raíz (nivel 0), luego todos los nodos del nivel 1 de izquierda a derecha, después el nivel 2…', 'Esto es lo que hace una **cola**: los hijos entran al final y se atienden en orden de llegada.', 'Anota los nodos nivel por nivel y concatena.'],
        explicacion: 'Por niveles: **' + J(Arb.niveles(t)) + '**. (BFS usa una cola; se formaliza con grafos en la semana 12.)'
      };
    }
  });

  B({
    id: 'n5-orden-visita', n: 5, e: 'B', dif: 3, c: ['tv_pre', 'tv_in', 'tv_post'], tema: 'Posición de visita',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) }); const k = rng.pick(['pre', 'in', 'post']); const T = TR[k]; const ord = T.f(t).map(String);
      const filas = Arb.ino(t).map(String).sort().map(v => [{ t: '`' + v + '`' }, { in: String(ord.indexOf(v) + 1), w: 4 }]);
      return {
        tipo: 'tabla', enunciado: 'En el recorrido **' + T.n + '** (' + T.o + '), ¿en qué **posición** (1.º, 2.º, …) se visita cada nodo?', arbol: t, cols: ['Nodo', 'Posición de visita'], filas, conceptos: [T.cid], animacion: { arbol: t, orden: T.f(t), nombre: T.n },
        pistas: ['Primero escribe el recorrido completo en una línea; luego numera sus elementos.', 'Aplica el orden ' + T.o + ' en cada subárbol.', 'La posición de un nodo es su lugar dentro de la lista del recorrido (empezando en 1).'],
        explicacion: 'Recorrido ' + T.n + ': ' + J(T.f(t)) + '. La posición de cada nodo es su índice (desde 1) en esa lista.'
      };
    }
  });

  /* ---------- implementación ---------- */
  function arbolesN5(rng) {
    const l = [null, Arb.N('A')];
    for (let i = 0; i < 4; i++) l.push(Arb.aleatorio(rng, rng.int(3, 8), { balance: rng.chance(0.5) }));
    return l;
  }
  const IMPL5 = [
    { fn: 'preorden', t: 'lista', k: 'pre', enun: 'Escribe `preorden(nodo)` que **devuelva una lista** con los valores del árbol en **preorden** (raíz → izq → der). Para un árbol vacío (`None`) devuelve `[]`.', sol: `def preorden(nodo):\n    if nodo is None:\n        return []\n    return [nodo.valor] + preorden(nodo.izq) + preorden(nodo.der)`, pistas: ['Caso base: árbol vacío → lista vacía.', 'Preorden = [valor de la raíz] + preorden del izquierdo + preorden del derecho.', '`return [nodo.valor] + preorden(nodo.izq) + preorden(nodo.der)`.'] },
    { fn: 'inorden', t: 'lista', k: 'in', enun: 'Escribe `inorden(nodo)` que **devuelva una lista** con los valores en **inorden** (izq → raíz → der). Para `None` devuelve `[]`.', sol: `def inorden(nodo):\n    if nodo is None:\n        return []\n    return inorden(nodo.izq) + [nodo.valor] + inorden(nodo.der)`, pistas: ['Caso base: árbol vacío → lista vacía.', 'Inorden = inorden del izquierdo + [valor de la raíz] + inorden del derecho.', '`return inorden(nodo.izq) + [nodo.valor] + inorden(nodo.der)`.'] },
    { fn: 'postorden', t: 'lista', k: 'post', enun: 'Escribe `postorden(nodo)` que **devuelva una lista** con los valores en **postorden** (izq → der → raíz). Para `None` devuelve `[]`.', sol: `def postorden(nodo):\n    if nodo is None:\n        return []\n    return postorden(nodo.izq) + postorden(nodo.der) + [nodo.valor]`, pistas: ['Caso base: árbol vacío → lista vacía.', 'Postorden = postorden del izquierdo + postorden del derecho + [valor de la raíz].', '`return postorden(nodo.izq) + postorden(nodo.der) + [nodo.valor]`.'] },
    { fn: 'preorden', t: 'salida', k: 'pre', enun: 'Escribe `preorden(nodo, salida)` (como en clase) que **agregue** a la lista `salida` los valores en **preorden**. No devuelve nada.', sol: `def preorden(nodo, salida):\n    if nodo is None:\n        return\n    salida.append(nodo.valor)\n    preorden(nodo.izq, salida)\n    preorden(nodo.der, salida)`, pistas: ['El caso base `nodo is None` simplemente hace `return`.', 'Agrega primero el valor de la raíz con `salida.append(…)` y luego recorre izquierda y derecha.', 'Recuerda pasar `salida` en cada llamada recursiva.'] },
    { fn: 'inorden', t: 'salida', k: 'in', enun: 'Escribe `inorden(nodo, salida)` (como en clase) que **agregue** a la lista `salida` los valores en **inorden**. No devuelve nada.', sol: `def inorden(nodo, salida):\n    if nodo is None:\n        return\n    inorden(nodo.izq, salida)\n    salida.append(nodo.valor)\n    inorden(nodo.der, salida)`, pistas: ['El caso base `nodo is None` simplemente hace `return`.', 'Recorre primero la izquierda, luego agrega el valor y por último la derecha.', 'Recuerda pasar `salida` en cada llamada recursiva.'] },
    { fn: 'postorden', t: 'salida', k: 'post', enun: 'Escribe `postorden(nodo, salida)` (como en clase) que **agregue** a la lista `salida` los valores en **postorden**. No devuelve nada.', sol: `def postorden(nodo, salida):\n    if nodo is None:\n        return\n    postorden(nodo.izq, salida)\n    postorden(nodo.der, salida)\n    salida.append(nodo.valor)`, pistas: ['El caso base `nodo is None` simplemente hace `return`.', 'Recorre izquierda, luego derecha, y al final agrega el valor.', 'Recuerda pasar `salida` en cada llamada recursiva.'] },
    { fn: 'por_niveles', t: 'niveles', k: 'niv', enun: 'Escribe `por_niveles(raiz)` que devuelva una lista con los valores del árbol **nivel por nivel** (de izquierda a derecha) usando una **cola** (no recursión). Para `None` devuelve `[]`.', sol: `from collections import deque\n\ndef por_niveles(raiz):\n    if raiz is None:\n        return []\n    salida = []\n    cola = deque([raiz])\n    while cola:\n        nodo = cola.popleft()\n        salida.append(nodo.valor)\n        if nodo.izq is not None:\n            cola.append(nodo.izq)\n        if nodo.der is not None:\n            cola.append(nodo.der)\n    return salida`, pistas: ['Empieza con una cola que contenga la raíz (cuidado con el árbol vacío).', 'Mientras la cola no esté vacía: saca el primero, visita su valor y encola sus hijos no vacíos.', 'Usa `deque` con `popleft()` (O(1)); `pop(0)` en una lista sería O(n).'] }
  ];
  B({
    id: 'n5-impl', n: 5, e: 'B', dif: 3, c: ['tv_pre', 'tv_in', 'tv_post', 'tv_bfs'], tema: 'Implementar recorridos',
    gen(rng, K, opts) {
      const f = rng.pick(IMPL5); const T = f.k === 'niv' ? { f: Arb.niveles } : TR[f.k];
      const tests = arbolesN5(rng).map(t => {
        const arb = K.pyN(t);
        return f.t === 'salida' ? { e: `correr(${f.fn}, ${arb})`, r: JSON.stringify(T.f(t)) } : { e: `${f.fn}(${arb})`, r: JSON.stringify(T.f(t)) };
      });
      const rec = f.t !== 'niveles';
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: f.fn, cls_arbol: true, prelude: K.PRE_REC, enunciado: f.enun + '\n\nLa clase de nodo ya está definida:', codigoVista: K.CLASE_NODO,
        starter: f.t === 'salida' ? `def ${f.fn}(nodo, salida):\n    # tu código aquí\n    pass` : `def ${f.fn}(${f.k === 'niv' ? 'raiz' : 'nodo'}):\n    # tu código aquí\n    pass`,
        solucion: f.sol, tests, reglas: rec ? [{ t: 'recursiva', fn: f.fn }, { t: 'sinBucles', fn: f.fn }] : [{ t: 'conBucle', fn: f.fn }, { t: 'noRecursiva', fn: f.fn }],
        ejemploLlamada: f.t === 'salida' ? 'correr(' + f.fn + ', N("A", N("B"), N("C")))' : f.fn + '(N("A", N("B"), N("C")))', pistas: f.pistas,
        explicacion: '```\n' + f.sol + '\n```\nCada nodo se visita una vez: O(n).'
      };
    }
  });

  const SOL5 = {
    pre: `def preorden(nodo, salida):\n    if nodo is None:\n        return\n    salida.append(nodo.valor)\n    preorden(nodo.izq, salida)\n    preorden(nodo.der, salida)`,
    in: `def inorden(nodo, salida):\n    if nodo is None:\n        return\n    inorden(nodo.izq, salida)\n    salida.append(nodo.valor)\n    inorden(nodo.der, salida)`,
    post: `def postorden(nodo, salida):\n    if nodo is None:\n        return\n    postorden(nodo.izq, salida)\n    postorden(nodo.der, salida)\n    salida.append(nodo.valor)`
  };
  B({
    id: 'n5-completar', n: 5, e: 'B', dif: 2, c: ['tv_pre', 'tv_in', 'tv_post', 'tv_errores'], tema: 'Completar recorridos',
    gen(rng, K) {
      const k = rng.pick(['pre', 'in', 'post']); const fn = TR[k].n; const sol = SOL5[k];
      const H = [['nodo is None', 'nodo is None', ['not nodo', 'nodo == None']], ['append(nodo.valor)', 'nodo.valor', ['nodo.valor']], [fn + '(nodo.izq, salida)', 'nodo.izq', ['nodo.izq']], [fn + '(nodo.der, salida)', 'nodo.der', ['nodo.der']], ['return', 'return', []]];
      const ids = rng.sample([0, 1, 2, 3], 3).sort((a, b) => a - b); const alts = {};
      const r = K.huecos(sol, ids.map(i => [H[i][0], H[i][1]]), Object.fromEntries(ids.map((hi, ix) => [ix + 1, H[hi][2]])));
      const tests = arbolesN5(rng).slice(1).map(t => ({ e: `correr(${fn}, ${K.pyN(t)})`, r: JSON.stringify(TR[k].f(t)) }));
      return {
        tipo: 'codigo', modoEj: 'completar', fn, cls_arbol: true, prelude: K.PRE_REC, enunciado: 'Completa la función que recorre un árbol en **' + TR[k].n + '** (' + TR[k].o + ') agregando los valores a `salida`.', codigoVista: K.CLASE_NODO,
        plantilla: r.plantilla, respuestas: r.respuestas, solucion: sol, tests, anchos: { 1: 12, 2: 10, 3: 10 }, conceptos: [TR[k].cid, 'tv_errores'],
        pistas: ['Identifica qué debe hacer cada hueco: caso base, valor que se agrega, o hijo sobre el que se llama.', 'Recuerda el orden: ' + TR[k].o + '. Mira dónde está la línea `salida.append(...)` respecto a las llamadas.', 'Los atributos de un nodo son `valor`, `izq` y `der`.'],
        explicacion: '```\n' + sol + '\n```'
      };
    }
  });

  const DEP5 = [
    { fn: 'preorden', k: 'pre', bug: 'Falta el caso base `nodo is None`: al llegar a una hoja se intenta leer `None.valor` (AttributeError).', start: `def preorden(nodo, salida):\n    salida.append(nodo.valor)\n    preorden(nodo.izq, salida)\n    preorden(nodo.der, salida)`, p: ['Ejecuta `correr(preorden, N(1))` en la consola: ¿qué error aparece?', 'Las hojas llaman a la función con `None`. ¿Qué pasa al leer `None.valor`?', 'Agrega al inicio `if nodo is None: return`.'] },
    { fn: 'inorden', k: 'in', bug: 'La raíz se agrega después de ambos hijos: eso es postorden, no inorden.', start: `def inorden(nodo, salida):\n    if nodo is None:\n        return\n    inorden(nodo.izq, salida)\n    inorden(nodo.der, salida)\n    salida.append(nodo.valor)`, p: ['Prueba con un árbol de 3 nodos y compara con el orden izq → raíz → der.', 'Mira en qué posición se agrega el valor respecto a las dos llamadas.', 'El valor debe agregarse **entre** la llamada izquierda y la derecha.'] },
    { fn: 'postorden', k: 'post', bug: 'En la llamada recursiva derecha se olvida pasar `salida`.', start: `def postorden(nodo, salida):\n    if nodo is None:\n        return\n    postorden(nodo.izq, salida)\n    postorden(nodo.der)\n    salida.append(nodo.valor)`, p: ['Ejecuta `correr(postorden, N(1, N(2), N(3)))`: ¿qué mensaje de error ves?', 'Compara cómo se hacen las dos llamadas recursivas: ¿llevan los mismos argumentos?', 'Debe ser `postorden(nodo.der, salida)`.'] },
    { fn: 'preorden', k: 'pre', bug: 'Se recorre dos veces el subárbol izquierdo y nunca el derecho.', start: `def preorden(nodo, salida):\n    if nodo is None:\n        return\n    salida.append(nodo.valor)\n    preorden(nodo.izq, salida)\n    preorden(nodo.izq, salida)`, p: ['Prueba con un árbol cuya raíz tenga hijo derecho: ¿aparece en la salida?', 'Las dos llamadas recursivas deben ir a hijos distintos.', 'La segunda llamada debe usar `nodo.der`.'] },
    { fn: 'inorden', k: 'in', bug: 'Se devuelve una lista nueva pero se ignora el resultado de las llamadas: la lista `salida` nunca se llena para hojas con caso base mal ubicado (el `return` está antes de agregar).', start: `def inorden(nodo, salida):\n    if nodo is None:\n        return\n    inorden(nodo.izq, salida)\n    return\n    salida.append(nodo.valor)\n    inorden(nodo.der, salida)`, p: ['Ejecuta `correr(inorden, N(2, N(1), N(3)))`: ¿qué lista sale?', 'Hay un `return` en medio de la función. ¿Qué líneas quedan sin ejecutarse?', 'Elimina ese `return` extra.'] }
  ];
  B({
    id: 'n5-depurar', n: 5, e: 'B', dif: 3, c: ['tv_errores', 'in_depurar', 'tv_pre', 'tv_in', 'tv_post'], tema: 'Depurar recorridos',
    gen(rng, K) {
      const d = rng.pick(DEP5); const sol = SOL5[d.k];
      const tests = arbolesN5(rng).slice(1).map(t => ({ e: `correr(${d.fn}, ${K.pyN(t)})`, r: JSON.stringify(TR[d.k].f(t)) }));
      return {
        tipo: 'codigo', modoEj: 'depurar', fn: d.fn, cls_arbol: true, prelude: K.PRE_REC, enunciado: 'Esta función debería recorrer el árbol en **' + TR[d.k].n + '**, pero tiene un error. Encuéntralo y corrígelo.', codigoVista: K.CLASE_NODO,
        starter: d.start, solucion: sol, tests, reglas: [{ t: 'recursiva', fn: d.fn }], ejemploLlamada: 'correr(' + d.fn + ', N(1, N(2), N(3)))', pistas: d.p, explicacion: '**Error:** ' + d.bug + '\n```\n' + sol + '\n```'
      };
    }
  });

  B({
    id: 'n5-reconstruir', n: 5, e: 'B', dif: 3, c: ['tv_reconstruir'], tema: 'Reconstruir desde preorden + inorden',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) }); const pr = Arb.pre(t), io = Arb.ino(t);
      return {
        tipo: 'arbol', enunciado: 'Un árbol binario tiene estos recorridos:\n\n- **Preorden:** `' + J(pr) + '`\n- **Inorden:** `' + J(io) + '`\n\nReconstruye el árbol y escríbelo en notación `valor(izq,der)`.', esperado: t, placeholder: 'p. ej. A(B,C)',
        pistas: ['La **raíz** es el primer elemento del preorden.', 'Ubica esa raíz en el inorden: lo que queda a su izquierda forma el subárbol izquierdo; lo de su derecha, el derecho.', 'Repite con cada parte: la siguiente raíz es el primer elemento (del preorden) que pertenece a ese subárbol.'],
        explicacion: 'Árbol: **' + Arb.nota(t) + '**. Raíz = primer elemento del preorden (' + pr[0] + '); el inorden separa los subárboles izquierdo y derecho.'
      };
    }
  });

  B({
    id: 'n5-reconstruir-post', n: 5, e: 'B', dif: 4, c: ['tv_reconstruir', 'tv_post'], tema: 'Obtener otro recorrido',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) }); const pr = Arb.pre(t), io = Arb.ino(t), po = Arb.post(t);
      const pideP = rng.chance(0.65);
      return pideP ? {
        tipo: 'salida', tokens: true, enunciado: 'Un árbol binario tiene **preorden** `' + J(pr) + '` e **inorden** `' + J(io) + '`. Escribe su **postorden**.', esperado: J(po), placeholder: 'recorrido en postorden',
        pistas: ['Reconstruye el árbol: la raíz es el primer elemento del preorden y el inorden separa izquierda de derecha.', 'Una vez dibujado, escribe izq → der → raíz recursivamente.', 'La raíz del árbol será el **último** elemento del postorden.'],
        explicacion: 'Árbol: ' + Arb.nota(t) + ' → postorden **' + J(po) + '**.'
      } : {
        tipo: 'salida', tokens: true, enunciado: 'Un árbol binario tiene **postorden** `' + J(po) + '` e **inorden** `' + J(io) + '`. Escribe su **preorden**.  *(Complemento: aquí la raíz es el último elemento del postorden.)*', esperado: J(pr), placeholder: 'recorrido en preorden',
        pistas: ['En el postorden la raíz es el **último** elemento.', 'Ubica la raíz en el inorden para separar los subárboles izquierdo y derecho.', 'Reconstruye y luego escribe raíz → izq → der.'],
        explicacion: 'Árbol: ' + Arb.nota(t) + ' → preorden **' + J(pr) + '**.'
      };
    }
  });

  B({
    id: 'n5-un-recorrido', n: 5, e: 'B', dif: 3, c: ['tv_reconstruir', 'tv_errores'], tema: 'Un solo recorrido no basta',
    gen(rng, K) {
      const [X, Y, Z] = rng.sample('ABCDEFGH'.split(''), 3);
      const var1 = rng.chance(0.5);
      const t1 = var1 ? Arb.parse(`${X}(${Y}(${Z},),)`) : Arb.parse(`${X}(${Y}(,${Z}),)`);
      const t2 = var1 ? Arb.parse(`${X}(,${Y}(,${Z}))`) : Arb.parse(`${X}(${Y},${Z})`);
      return {
        tipo: 'tabla', enunciado: 'Los dos árboles de abajo son **distintos**. Calcula sus recorridos (separa los nodos con espacios) y responde la última fila.', arboles: [{ titulo: 'Árbol 1', arbol: t1 }, { titulo: 'Árbol 2', arbol: t2 }],
        cols: ['Recorrido', 'Resultado'], filas: [[{ t: 'Preorden del árbol 1' }, { in: J(Arb.pre(t1)), w: 10 }], [{ t: 'Preorden del árbol 2' }, { in: J(Arb.pre(t2)), w: 10 }], [{ t: 'Inorden del árbol 1' }, { in: J(Arb.ino(t1)), w: 10 }], [{ t: 'Inorden del árbol 2' }, { in: J(Arb.ino(t2)), w: 10 }], [{ t: '¿El preorden por sí solo basta para distinguir ambos árboles? (sí/no)' }, { in: ['no', 'No', 'NO'], w: 4 }]],
        pistas: ['Escribe cada recorrido por separado; los dos preórdenes te darán una sorpresa.', 'Si dos árboles distintos producen el mismo preorden, ese recorrido no los distingue.', 'Compara ahora los inórdenes: ¿qué recorrido sí los diferencia?'],
        explicacion: 'Ambos árboles tienen el mismo preorden **' + J(Arb.pre(t1)) + '**, pero distinto inorden. Un solo recorrido no determina el árbol: se necesitan dos (p. ej. preorden + inorden).'
      };
    }
  });

  /* ============ C ============ */
  function exprNodos(rng, K) {
    for (let i = 0; i < 40; i++) { const t = K.exprRand(rng, 2, ['+', '-', '*']); const c = (function cnt(n) { return n ? 1 + cnt(n.l) + cnt(n.r) : 0; })(t); if (c >= 5 && c <= 7) return t; }
    return K.exprRand(rng, 2, ['+', '*']);
  }
  B({
    id: 'n5-expr', n: 5, e: 'C', dif: 4, c: ['tv_expr', 'tv_post', 'tv_pre'], tema: 'Árbol de expresión',
    gen(rng, K) {
      const t = exprNodos(rng, K); const pre = J(Arb.pre(t)), ino = J(Arb.ino(t)), post = J(Arb.post(t)); const val = K.evalExpr(t);
      return {
        tipo: 'mixta', enunciado: 'El árbol representa una **expresión aritmética** (hojas = números, nodos internos = operadores).', arbol: t,
        partes: [
          { titulo: 'Preorden', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Escribe el **preorden** (tokens separados por espacio).', esperado: pre } },
          { titulo: 'Postorden', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Escribe el **postorden** (notación postfija).', esperado: post } },
          { titulo: 'Valor', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuál es el **valor** de la expresión?', esperado: String(val) } },
          { titulo: 'Concepto', peso: 1, q: { tipo: 'opcion', enunciado: '¿Qué recorrido produce la **notación postfija (RPN)** y por qué es el adecuado para **evaluar**?', opciones: rng.shuffle([{ t: 'Postorden: se necesitan los valores de ambos hijos antes de aplicar el operador del padre.', ok: true, why: 'Es la razón correcta.' }, { t: 'Preorden: el operador debe conocerse antes que los operandos.', ok: false, why: 'Eso da la notación prefija, no sirve para evaluar directamente con una pila.' }, { t: 'Inorden: respeta siempre la prioridad de los operadores.', ok: false, why: 'Sin paréntesis, el inorden pierde la prioridad.' }, { t: 'Por niveles: evalúa primero los operadores de arriba.', ok: false, why: 'No tiene relación con la dependencia entre operandos.' }]) } }
        ],
        animacion: { arbol: t, orden: Arb.post(t), nombre: 'postorden' }, conceptos: ['tv_expr', 'tv_post'],
        pistas: ['Preorden: operador, luego operando izquierdo, luego derecho. Postorden: operandos y al final el operador.', 'Para evaluar: resuelve de abajo hacia arriba (los subárboles más profundos primero).', 'El inorden (sin paréntesis) puede cambiar la prioridad; por eso se evalúa con postorden.'],
        explicacion: 'Preorden: ' + pre + ' · Inorden (sin paréntesis): ' + ino + ' · Postorden: ' + post + ' · Valor = ' + val + '.'
      };
    }
  });

  const EXPR_IMPL = [
    {
      fn: 'evaluar', enun: 'Un árbol de expresión guarda en las **hojas** números y en los **nodos internos** los operadores `"+"`, `"-"`, `"*"` (cadenas). Escribe `evaluar(nodo)` que calcule el valor de la expresión con un recorrido en **postorden**.', sol: `def evaluar(nodo):\n    if nodo.izq is None and nodo.der is None:\n        return nodo.valor\n    a = evaluar(nodo.izq)\n    b = evaluar(nodo.der)\n    if nodo.valor == "+":\n        return a + b\n    if nodo.valor == "-":\n        return a - b\n    return a * b`, f: t => K_.evalExpr(t), pistas: ['Caso base: una hoja devuelve su número.', 'Evalúa primero el hijo izquierdo y el derecho (postorden) y guarda los resultados.', 'Luego aplica el operador del nodo (`"+"`, `"-"` o `"*"`) a esos dos valores.']
    },
    {
      fn: 'postfija', enun: 'Escribe `postfija(nodo)` que devuelva la **notación postfija** de un árbol de expresión como una cadena con los elementos separados por un espacio (por ejemplo `"3 4 + 2 *"`).', sol: `def postfija(nodo):\n    if nodo.izq is None and nodo.der is None:\n        return str(nodo.valor)\n    return postfija(nodo.izq) + " " + postfija(nodo.der) + " " + str(nodo.valor)`, f: t => J(Arb.post(t)), str: true, pistas: ['Caso base: una hoja devuelve su valor como texto.', 'Postfija = postfija(izq) + " " + postfija(der) + " " + operador.', 'Usa `str(nodo.valor)` para convertir números en texto.']
    }
  ];
  let K_ = null;
  B({
    id: 'n5-expr-impl', n: 5, e: 'C', dif: 4, c: ['tv_expr', 'tv_post', 'in_analisis'], tema: 'Evaluar con postorden',
    gen(rng, K) {
      K_ = K; const f = rng.pick(EXPR_IMPL);
      const ts = []; for (let i = 0; i < 4; i++) ts.push(exprNodos(rng, K)); ts.push({ v: 7, l: null, r: null });
      const tests = ts.map(t => ({ e: `${f.fn}(${K.pyN(t)})`, r: f.str ? JSON.stringify(f.f(t)) : String(f.f(t)) }));
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: f.fn, cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: f.enun + '\n\nLa clase de nodo ya está definida:', codigoVista: K.CLASE_NODO,
        starter: `def ${f.fn}(nodo):\n    # tu código aquí\n    pass`, solucion: f.sol, tests, reglas: [{ t: 'recursiva', fn: f.fn }, { t: 'sinBucles', fn: f.fn }], ejemploLlamada: f.fn + '(N("*", N("+", N(3), N(4)), N(2)))',
        pistas: f.pistas, explicacion: 'Se usa **postorden** porque hay que conocer los valores de los hijos antes de combinarlos (S6-C1, diap. 22).\n```\n' + f.sol + '\n```'
      };
    }
  });

  B({
    id: 'n5-reconstruir-impos', n: 5, e: 'C', dif: 4, c: ['tv_reconstruir'], tema: '¿Existe un árbol con esos recorridos?',
    gen(rng, K) {
      const n = rng.int(5, 6); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) }); const pr = Arb.pre(t); let io = Arb.ino(t).slice();
      const inconsistente = rng.chance(0.5); let existe = true;
      if (inconsistente) {
        for (let i = 0; i < 30; i++) { const a = rng.int(0, n - 1), b = rng.int(0, n - 1); if (a === b) continue; const c = io.slice(); [c[a], c[b]] = [c[b], c[a]]; let ok = true; try { const r = Arb.desdePreIn(pr, c); ok = Arb.pre(r).join() === pr.join() && Arb.ino(r).join() === c.join(); } catch (e) { ok = false; } if (!ok) { io = c; existe = false; break; } }
        if (existe) existe = true;
      }
      let raiz = null; if (existe) { const r = Arb.desdePreIn(pr, io); raiz = String(r.v); }
      const opciones = existe
        ? [{ t: 'Sí existe, y su raíz es `' + raiz + '`.', ok: true, why: 'La raíz es el primer elemento del preorden y el inorden es consistente.' }, { t: 'No existe: los recorridos son incompatibles.', ok: false, why: 'Sí existe: puede reconstruirse.' }, { t: 'Existen varios árboles distintos con esos dos recorridos.', ok: false, why: 'Con preorden + inorden de valores distintos el árbol es único.' }, { t: 'Sí existe, y su raíz es `' + (String(io[0]) === raiz ? io[io.length - 1] : io[0]) + '`.', ok: false, why: 'La raíz es el primer elemento del preorden.' }]
        : [{ t: 'No existe ningún árbol con esos dos recorridos.', ok: true, why: 'Al dividir el inorden con la raíz del preorden, los subárboles no son compatibles con el resto de los recorridos.' }, { t: 'Sí existe, y su raíz es `' + pr[0] + '`.', ok: false, why: 'La raíz sería ' + pr[0] + ' pero los subárboles resultantes no reproducen los recorridos dados.' }, { t: 'Existen varios árboles distintos con esos recorridos.', ok: false, why: 'No existe ninguno.' }, { t: 'Sí existe, y su raíz es `' + (String(io[0]) !== String(pr[0]) ? io[0] : io[io.length - 1]) + '`.', ok: false, why: 'La raíz es el primer elemento del preorden.' }];
      return {
        tipo: 'opcion', enunciado: 'Se dan los recorridos de un supuesto árbol binario con nodos distintos:\n\n- **Preorden:** `' + J(pr) + '`\n- **Inorden:** `' + J(io) + '`\n\n¿Cuál afirmación es correcta?', opciones: rng.shuffle(opciones), fmt: 'Razonamiento',
        pistas: ['Intenta reconstruir: raíz = primer elemento del preorden; sepárala en el inorden en parte izquierda y derecha.', 'Comprueba que cada parte tenga los mismos elementos en ambos recorridos y repite el proceso.', 'Si en algún momento los elementos del preorden de un subárbol no coinciden con los del inorden, los recorridos son incompatibles.'],
        explicacion: existe ? 'El árbol existe y es único: ' + Arb.nota(Arb.desdePreIn(pr, io)) + '.' : 'Los recorridos son incompatibles: no puede construirse un árbol que reproduzca ambos.'
      };
    }
  });

  B({
    id: 'n5-complejidad', n: 5, e: 'B', dif: 3, c: ['tv_pre', 'cx_recursivo', 'cx_espacial'], tema: 'Complejidad de un recorrido',
    gen(rng, K) {
      const f = 'preorden';
      return {
        tipo: 'bigo', pideEspacio: true, enunciado: 'Un árbol binario tiene **n nodos** y altura **h**. ¿Cuál es la complejidad **temporal** del recorrido recursivo y el **espacio extra** (pila de llamadas, sin contar la lista de salida)?', codigoVista: SOL5.pre,
        tiempo: 'n', espacio: 'h', escala: ['1', 'logn', 'n', 'h', 'n2'], etqS: 'Espacio (pila)', etq: {},
        justif: { opciones: rng.shuffle([{ t: 'Cada nodo se visita una vez con trabajo O(1); la pila llega a tantos marcos como la altura h.', ok: true }, { t: 'Cada nodo llama a sus dos hijos, por eso es O(n²) y la pila ocupa O(n²).', ok: false, why: 'Cada nodo se visita una sola vez.' }, { t: 'Solo se recorre un camino raíz–hoja, por eso es O(h).', ok: false, why: 'Se recorren todos los nodos, no un solo camino.' }]) },
        pistas: ['Cuenta cuántas veces se ejecuta la función: una por nodo (y una por cada `None`).', 'La pila de llamadas se llena mientras se desciende por un camino raíz–hoja.', 'En el peor caso h puede ser n−1 (árbol degenerado), en un balanceado h ≈ log n.'],
        explicacion: 'Tiempo **O(n)**; espacio de pila **O(h)** (hasta O(n) si el árbol es degenerado). (S6-C1, diap. 17.)'
      };
    }
  });

  B({
    id: 'n5-abierta-autograd', n: 5, e: 'C', dif: 3, c: ['tv_usos', 'tv_post', 'tv_pre'], tema: 'Elegir el recorrido',
    gen(rng, K) {
      return {
        tipo: 'abierta', fmt: 'Pregunta de razonamiento', enunciado: 'La **retropropagación** necesita el gradiente de cada operación **después** de tener los de las operaciones que dependen de ella. **¿Qué recorrido (preorden, inorden o postorden) corresponde a esa dependencia y por qué?** ¿Qué recorrido usarías para imprimir la arquitectura de la red de arriba hacia abajo?',
        criterios: [
          { desc: 'Elige **postorden** para la retropropagación.', claves: ['postorden'] },
          { desc: 'Justifica: se procesan/calculan los **hijos antes que el padre** (dependencias).', claves: [['hijos', 'antes'], ['hijo', 'antes', 'padre'], ['dependen'], ['primero', 'hijos']] },
          { desc: 'Elige **preorden** para imprimir de arriba hacia abajo.', claves: ['preorden'] },
          { desc: 'Justifica: el **padre se procesa antes que los hijos** (la raíz primero).', claves: [['padre', 'antes'], ['raiz', 'primero'], ['arriba', 'abajo'], ['raiz', 'antes']] }
        ],
        modelo: 'La retropropagación usa **postorden**: el gradiente de un nodo se calcula cuando ya se tienen los de los nodos que dependen de él, es decir, se procesan los **hijos antes que el padre** (izq → der → raíz). Para imprimir la arquitectura de **arriba hacia abajo** se usa **preorden**, porque el **padre se procesa antes que los hijos** (raíz primero).',
        pistas: ['Pregúntate qué debe estar calculado antes: ¿el padre o los hijos?', 'Postorden procesa a los hijos antes que al padre; preorden, al revés.', 'Responde las dos partes con el recorrido y su justificación.'], explicacion: 'S6-C1, diap. 20-21 (pregunta de análisis 2).'
      };
    }
  });

  B({
    id: 'n5-orden-pasos', n: 5, e: 'A', dif: 2, c: ['tv_pre', 'tv_in', 'tv_post'], tema: 'Ordenar las visitas',
    gen(rng, K) {
      const n = rng.int(4, 6); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) }); const k = rng.pick(['pre', 'in', 'post']); const T = TR[k];
      const ord = T.f(t).map(String); const idx = ord.map((_, i) => i); let ini = rng.shuffle(idx); if (ini.every((x, i) => x === i)) ini = idx.slice().reverse();
      return {
        tipo: 'orden', enunciado: 'Ordena los nodos en el **orden en que se visitan** en el recorrido **' + T.n + '** (' + T.o + ').', arbol: t, items: ord.map(x => '`' + x + '`'), correcto: idx, inicial: ini, conceptos: [T.cid],
        pistas: ['Aplica el orden ' + T.o + ' empezando por la raíz.', 'Si es difícil, escribe el recorrido en papel primero y luego ordena las fichas.', 'Cada subárbol se recorre igual que el árbol completo.'],
        explicacion: T.n + ': ' + ord.join(' → ') + '.'
      };
    }
  });

  B({
    id: 'n5-mixta', n: 5, e: 'C', dif: 4, c: ['tv_pre', 'tv_in', 'tv_post', 'tv_bfs'], tema: 'Los cuatro recorridos',
    gen(rng, K) {
      const n = rng.int(6, 8); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.4) });
      return {
        tipo: 'mixta', enunciado: 'Escribe los recorridos del árbol (nodos separados por espacios).', arbol: t,
        partes: [
          { titulo: 'Preorden', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Preorden (raíz → izq → der):', esperado: J(Arb.pre(t)) } },
          { titulo: 'Inorden', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Inorden (izq → raíz → der):', esperado: J(Arb.ino(t)) } },
          { titulo: 'Postorden', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Postorden (izq → der → raíz):', esperado: J(Arb.post(t)) } },
          { titulo: 'Por niveles', peso: 1, q: { tipo: 'salida', tokens: true, enunciado: 'Por niveles (BFS):', esperado: J(Arb.niveles(t)) } }
        ],
        pistas: ['Resuelve un recorrido a la vez; los tres DFS cambian solo cuándo se escribe la raíz.', 'Verifica: el primer elemento del preorden y el último del postorden deben ser la raíz.', 'El BFS se lee nivel por nivel de izquierda a derecha.'],
        explicacion: 'Pre: ' + J(Arb.pre(t)) + ' · In: ' + J(Arb.ino(t)) + ' · Post: ' + J(Arb.post(t)) + ' · Niveles: ' + J(Arb.niveles(t))
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
