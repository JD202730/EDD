/* banco_pq.js — banco «tipo parcial»: ayudas comunes + preguntas de verdadero/falso con justificación.
   Modelo de examen del profesor (parcial 1): 5 preguntas de 1,0 punto; cada una con literales de puntaje parcial,
   justificación obligatoria (vale más que la marca), variable + caso + regla en las complejidades, casos borde en
   el código y media nota si la solución funciona pero es O(n²) cuando se pedía O(n). */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, Arb = ET.Arb, B = ET.Banco.add;
  const PQ = ET.PQ = {};

  /** criterio de rúbrica: descripción + alternativas de palabras clave (string | [todas]) */
  PQ.cr = (desc, ...claves) => ({ desc, claves });
  PQ.PISTAS_GEN = [
    'En el parcial **toda respuesta debe estar justificada**: escribe la razón, no solo la marca o el resultado.',
    'Estructura tu justificación: **regla o definición** → **aplicación al caso** → **consecuencia** (y menciona la variable y el caso si hablas de complejidad).',
    'Prueba con un caso pequeño o extremo (lista vacía, un solo nodo, árbol degenerado) para comprobar si tu afirmación se sostiene.'
  ];
  PQ.coma = a => a.join(', ');
  PQ.fmt = x => String(x).replace('.', ',');

  /* ===================== afirmaciones V/F con justificación ===================== */
  const S = (a, v, m, ...crit) => ({ a, v, m, c: crit.map(x => PQ.cr(x[0], ...x.slice(1))) });

  const POOLS = {};

  POOLS.rec = [
    S('En Python, una función recursiva «de cola» (la llamada recursiva es lo último que hace) no consume pila adicional porque el intérprete optimiza esa llamada.', false,
      'Falso: Python **no optimiza** la recursión de cola; cada llamada apila un marco nuevo y la profundidad crece hasta el límite de recursión (RecursionError, ≈ 1000).',
      ['Python no optimiza la recursión de cola', 'no optimiza', 'sin optimiz', 'tail'], ['Cada llamada apila un marco: la pila crece con la profundidad', 'marco', 'apila', ['pila', 'crece'], ['pila', 'consume']], ['Existe un límite de recursión (RecursionError, ≈ 1000)', 'recursionerror', '1000', 'limite']),
    rng => { const n = rng.int(25, 40); return S('La función `fib(n) = fib(n-1) + fib(n-2)` (con `fib(0)=0` y `fib(1)=1`), sin memoria, hace del orden de n llamadas; por eso `fib(' + n + ')` es rápida.', false,
      'Falso: sin memoria los mismos subproblemas se **recalculan** una y otra vez y el árbol de llamadas crece de forma **exponencial** (≈ 2ⁿ), no lineal.',
      ['Se recalculan los mismos subproblemas (solapados)', 'recalcula', 'repet', 'solapad'], ['El número de llamadas es exponencial (≈ 2ⁿ), no lineal', 'exponencial', '2^n', '2ⁿ', 'phi']); },
    S('Agregar memoización a `fib` reduce el tiempo de O(2ⁿ) a O(n) porque cada valor de `fib(k)` se calcula una sola vez.', true,
      'Verdadero: con memoria cada subproblema distinto (hay n+1) se **resuelve una sola vez** y las demás veces se consulta en O(1), así que el total es O(n).',
      ['Cada subproblema se calcula una sola vez y se guarda', 'una sola vez', 'una vez', 'guarda', 'memori'], ['Hay solo n subproblemas distintos → O(n) en total', 'n subproblemas', 'n+1', 'o(n)', 'lineal']),
    S('La profundidad máxima de la pila de llamadas de `factorial(n)` (recursivo, con caso base `n == 0`) es O(1), porque cada llamada termina rápidamente.', false,
      'Falso: las llamadas se **van apilando** y ninguna termina hasta llegar al caso base, así que hay n+1 marcos activos a la vez: espacio de pila O(n).',
      ['Los marcos se acumulan: ninguna llamada termina hasta el caso base', 'acumul', 'apila', 'simult', 'hasta el caso base', 'hasta llegar'], ['El espacio de pila es O(n)', 'o(n)', 'n marcos', 'n+1', 'lineal']),
    S('Una función recursiva es siempre más eficiente en tiempo que su versión iterativa equivalente, porque evita escribir ciclos.', false,
      'Falso: la recursión tiene el **mismo orden** de operaciones (o peor) y añade el costo de las llamadas y de la **pila**; la versión iterativa suele usar O(1) memoria extra.',
      ['Mismo orden de tiempo o peor: no es siempre más eficiente', 'mismo orden', 'no es siempre', 'no siempre', 'peor', 'igual'], ['Las llamadas cuestan y usan pila (espacio extra); la iterativa usa O(1)', 'pila', 'llamadas', 'espacio', 'memoria']),
    rng => { const n = rng.int(100, 1000); return S('La función `potencia(x, n)` que calcula `xⁿ` con `potencia(x, n // 2)` (y multiplica por `x` si `n` es impar) hace O(log n) llamadas; para `n = ' + n + '` son del orden de ' + Math.ceil(Math.log2(n)) + '.', true,
      'Verdadero: en cada llamada el exponente se **divide a la mitad**, así que se llega al caso base en ≈ log₂ n pasos (' + Math.ceil(Math.log2(n)) + ' para n = ' + n + ').',
      ['El exponente se divide a la mitad en cada llamada', 'mitad', '//2', 'divide'], ['Se llega al caso base en ≈ log₂ n llamadas', 'log', 'logaritm']); },
    S('Una función recursiva sobre una lista que se llama con `A[1:]` y hace trabajo O(1) en cada llamada tiene un costo total O(n).', false,
      'Falso: cada **rebanada `A[1:]` copia** la lista (costo oculto O(n)), así que el total es n + (n−1) + … + 1 = O(n²).',
      ['La rebanada A[1:] copia la lista: costo oculto O(n) por llamada', 'copia', 'oculto', 'slice', 'rebanada', 'nueva lista'], ['La suma n + (n−1) + … + 1 da O(n²)', 'o(n^2)', 'n²', 'n2', 'cuadr']),
    S('En `def f(n, cache={})` el diccionario `cache` se crea de nuevo en cada llamada a `f`, así que no sirve para recordar resultados entre llamadas.', false,
      'Falso: el valor por defecto mutable se crea **una sola vez** al definir la función y se **comparte** entre todas las llamadas (por eso «recuerda» resultados, para bien o para mal).',
      ['El valor por defecto se crea una sola vez (al definir la función)', 'una sola vez', 'una vez', 'al definir', 'definicion'], ['Se comparte entre las llamadas', 'compart', 'persiste', 'mismo diccionario', 'mismo objeto']),
    S('Una función recursiva que se llama a sí misma con exactamente los mismos argumentos que recibió (sin leer ni modificar estado global) nunca llega a su caso base.', true,
      'Verdadero: con los mismos argumentos repite **exactamente el mismo cómputo**, no hay **progreso** hacia el caso base y la recursión es infinita (RecursionError en Python).',
      ['No hay progreso hacia el caso base: se repite el mismo cómputo', 'progreso', 'mismo computo', 'mismos argumentos', 'se repite'], ['La recursión es infinita (RecursionError)', 'infinita', 'recursionerror', 'no termina']),
    S('En Python, el límite de recursión (≈ 1000) existe para proteger la memoria: cada llamada activa ocupa un marco en la pila de llamadas.', true,
      'Verdadero: cada llamada activa guarda un **marco** (variables locales y punto de retorno) en la **pila**; limitar la profundidad evita agotar la memoria.',
      ['Cada llamada activa ocupa un marco en la pila', 'marco', 'pila'], ['El límite evita agotar la memoria / desbordar la pila', 'agot', 'desbord', 'memoria', 'proteg', 'limite'])
  ];

  POOLS.par = [
    rng => { const casos = [[[1, 3, 4], 6, '4 + 1 + 1 (3 monedas) frente a 3 + 3 (2 monedas)'], [[1, 5, 6], 10, '6 + 1 + 1 + 1 + 1 (5 monedas) frente a 5 + 5 (2 monedas)'], [[1, 4, 6], 8, '6 + 1 + 1 (3 monedas) frente a 4 + 4 (2 monedas)']]; const c = rng.pick(casos);
      return S('Para cualquier conjunto de monedas, tomar siempre la moneda más grande que cabe en el monto restante (estrategia voraz) da el mínimo número de monedas.', false,
        'Falso: sirve en sistemas «canónicos», pero no siempre. Contraejemplo con {' + c[0].join(', ') + '} y monto ' + c[1] + ': la estrategia voraz usa ' + c[2] + '.',
        ['No siempre es óptima: depende del sistema de monedas', 'no siempre', 'depende', 'canonic', 'no garantiza'], ['Contraejemplo concreto (monedas y monto)', 'contraejemplo', 'ejemplo', 'monedas ' + c[0].join(',')]); },
    S('Divide y vencerás y programación dinámica dividen el problema en subproblemas; la diferencia clave es que en programación dinámica los subproblemas **se solapan** (se repiten).', true,
      'Verdadero: en D&C (p. ej. merge sort) los subproblemas son **independientes**; en DP se **repiten**, y por eso se guardan sus resultados (memoria o tabla) para no recalcular.',
      ['En DP los subproblemas se solapan/repiten', 'solap', 'repit', 'repetid'], ['Se guardan los resultados (memoización o tabla) / en D&C son independientes', 'guarda', 'memori', 'tabla', 'independ']),
    S('La búsqueda binaria recursiva es un caso de divide y vencerás cuyo costo es O(log n) porque en cada paso descarta la mitad del arreglo y no necesita combinar resultados.', true,
      'Verdadero: cada llamada **descarta una mitad** (solo continúa con un subproblema de tamaño n/2) y combinar es O(1), así que hay ≈ log₂ n pasos.',
      ['En cada paso se descarta una mitad (un solo subproblema de tamaño n/2)', 'mitad', 'n/2', 'descarta'], ['Hay ≈ log₂ n pasos / combinar es O(1)', 'log', 'o(1)', 'no combina', 'sin combinar']),
    S('El tiempo de merge sort cumple T(n) = 2·T(n/2) + O(n), lo que da O(n log n).', true,
      'Verdadero: hay **dos** subproblemas de tamaño n/2 y **combinar (mezclar) cuesta O(n)** por nivel; con ≈ log₂ n niveles resulta O(n log n).',
      ['Dos subproblemas de tamaño n/2 y mezcla O(n) por nivel', 'mezcla', 'merge', 'combinar', 'dos subproblemas', '2 subproblemas'], ['Hay ≈ log₂ n niveles → n por nivel × log n niveles', 'log', 'niveles', 'altura']),
    S('El backtracking con poda siempre explora todas las combinaciones posibles, igual que la fuerza bruta.', false,
      'Falso: la **poda descarta ramas** que ya no pueden llevar a una solución válida, así que explora menos; aun así, el **peor caso** puede seguir siendo exponencial.',
      ['La poda descarta ramas que no llevan a solución', 'poda', 'descarta', 'ramas'], ['Explora menos, pero el peor caso puede seguir siendo exponencial', 'peor caso', 'exponencial', 'menos']),
    S('En programación dinámica, el enfoque bottom-up (tabulación) calcula únicamente los subproblemas que la solución final realmente necesita.', false,
      'Falso: bottom-up llena **toda la tabla** (incluso subproblemas innecesarios); el enfoque **top-down con memoización** calcula solo los que se piden.',
      ['Bottom-up llena toda la tabla (también lo innecesario)', 'toda la tabla', 'todos los subproblemas', 'todo'], ['Top-down con memoización calcula solo los necesarios', 'top-down', 'memoiz', 'necesarios', 'se piden']),
    S('Resolver el problema del viajante (TSP) probando todas las rutas posibles tiene costo O(n!).', true,
      'Verdadero: la fuerza bruta prueba **todas las permutaciones** de las ciudades, (n−1)! rutas, que crece más rápido que cualquier exponencial.',
      ['Prueba todas las permutaciones/rutas', 'permutacion', 'todas las rutas', 'todas las'], ['El número de rutas es (n−1)! ≈ n!', 'factorial', 'n!', '(n-1)!', '(n−1)!']),
    S('Una estrategia voraz siempre es mejor que la programación dinámica porque es más rápida y siempre encuentra la solución óptima.', false,
      'Falso: es más rápida, pero **no siempre es óptima** (solo cuando el problema tiene la propiedad de elección voraz); la DP sí garantiza el óptimo cuando hay subestructura óptima.',
      ['La voraz no siempre da el óptimo', 'no siempre', 'no garantiza', 'no es optim'], ['La DP garantiza el óptimo (subestructura óptima) / la voraz solo con elección voraz', 'garantiza', 'subestructura', 'optim']),
    S('Fibonacci con programación dinámica bottom-up puede calcularse en tiempo O(n) y espacio extra O(1).', true,
      'Verdadero: basta un ciclo de n iteraciones guardando **solo los dos valores anteriores**, sin tabla completa.',
      ['Un ciclo de n iteraciones: tiempo O(n)', 'o(n)', 'lineal', 'n iteraciones', 'ciclo'], ['Solo se necesitan los dos valores anteriores: espacio O(1)', 'dos valores', 'dos anteriores', 'o(1)', 'constante']),
    S('El algoritmo de cambio de monedas por programación dinámica (monto V, m denominaciones) cuesta O(V·m).', true,
      'Verdadero: la tabla tiene V+1 entradas y para **cada entrada** se prueba **cada una de las m monedas**: V·m operaciones.',
      ['La tabla tiene V+1 entradas', 'v+1', 'tabla', 'v entradas', 'monto'], ['Para cada entrada se prueban las m monedas → producto V·m', 'm monedas', 'cada moneda', 'producto', 'v·m', 'v*m'])
  ];

  POOLS.arb = [
    S('Un árbol con n nodos tiene exactamente n − 1 aristas.', true,
      'Verdadero: todo nodo **excepto la raíz tiene exactamente un padre**, y cada nodo-hijo aporta una arista: n − 1.',
      ['Todo nodo salvo la raíz tiene un único padre', 'padre', 'excepto la raiz', 'salvo la raiz'], ['Cada nodo-hijo aporta una arista: n − 1', 'n-1', 'n − 1', 'una arista']),
    rng => { const h = rng.int(3, 6); return S('Un árbol binario de altura h = ' + h + ' (la altura cuenta aristas) tiene a lo sumo 2^' + h + ' = ' + Math.pow(2, h) + ' nodos.', false,
      'Falso: el máximo es el árbol **perfecto**, con 1 + 2 + … + 2^h = **2^(h+1) − 1 = ' + (Math.pow(2, h + 1) - 1) + '** nodos.',
      ['El máximo es el árbol perfecto (todos los niveles llenos)', 'perfecto', 'lleno', 'todos los niveles'], ['La suma 1 + 2 + … + 2^h = 2^(h+1) − 1', '2^(h+1)', '2^' + (h + 1), String(Math.pow(2, h + 1) - 1), 'suma']); },
    S('Un árbol binario lleno (cada nodo tiene 0 o 2 hijos) es siempre un árbol perfecto.', false,
      'Falso: **lleno** solo pide 0 o 2 hijos; **perfecto** exige además que **todas las hojas estén en el mismo nivel**. Ejemplo: raíz con una hoja y un subárbol de 3 nodos.',
      ['Lleno = cada nodo tiene 0 o 2 hijos', '0 o 2', 'cero o dos'], ['Perfecto exige todas las hojas en el mismo nivel / contraejemplo', 'mismo nivel', 'contraejemplo', 'ejemplo', 'perfecto']),
    S('La altura de un árbol vacío se define como 0 y la de una hoja como 1.', false,
      'Falso: con la convención del curso (altura = número de **aristas**) la hoja tiene altura **0** y el árbol vacío **−1**.',
      ['La altura cuenta aristas: la hoja vale 0', 'aristas', 'hoja', 'hoja vale 0', 'hoja = 0'], ['El árbol vacío vale −1', '-1', '−1', 'menos uno']),
    S('En un árbol binario con n nodos, la profundidad de un nodo siempre es menor o igual que n − 1.', true,
      'Verdadero: la profundidad es el número de **aristas desde la raíz**; el caso más largo es el árbol **degenerado** (una cadena) con n − 1 aristas.',
      ['La profundidad cuenta aristas desde la raíz', 'aristas', 'desde la raiz', 'raiz'], ['El peor caso es el árbol degenerado (cadena) con n − 1 aristas', 'degenerad', 'cadena', 'n-1', 'n − 1']),
    S('Si un grafo dirigido tiene dos nodos sin padre pero cada nodo tiene a lo sumo un padre, sigue siendo un árbol.', false,
      'Falso: un árbol tiene **una única raíz** (un solo nodo sin padre); con dos nodos sin padre es un **bosque** (dos árboles), no un árbol.',
      ['Un árbol tiene una sola raíz', 'una sola raiz', 'una unica raiz', 'una raiz', '1 raiz'], ['Con dos nodos sin padre es un bosque / dos árboles', 'bosque', 'dos arboles', 'dos raices']),
    S('Un nodo de un árbol binario puede tener como máximo dos hijos, pero un árbol (general) también puede tener nodos con más de dos hijos.', true,
      'Verdadero: «binario» **restringe** a ≤ 2 hijos (izquierdo y derecho); el concepto general de árbol **no limita** el número de hijos.',
      ['Binario restringe a un máximo de dos hijos', 'dos hijos', 'maximo dos', 'binario'], ['El árbol general no limita el número de hijos', 'no limita', 'sin limite', 'general', 'mas de dos']),
    S('Un árbol binario completo con n nodos tiene altura O(log n).', true,
      'Verdadero: en un árbol **completo** todos los niveles están llenos salvo quizá el último, así que cada nivel **duplica** los nodos y la altura es ⌊log₂ n⌋.',
      ['Todos los niveles están llenos salvo quizá el último', 'niveles llenos', 'completo', 'llenos'], ['Cada nivel duplica los nodos → altura ⌊log₂ n⌋ = O(log n)', 'duplica', 'log', 'logaritm'])
  ];

  POOLS.trv = [
    S('El recorrido inorden de cualquier árbol binario produce sus valores en orden creciente.', false,
      'Falso: solo ocurre si el árbol es un **BST**; en un árbol binario cualquiera el inorden sigue «izquierda–raíz–derecha» sin garantía de orden. Ejemplo: `5(9,1)` da 9, 5, 1.',
      ['Solo es cierto si el árbol es un BST', 'solo en un bst', 'bst', 'busqueda'], ['Contraejemplo o explicación: el inorden solo visita izquierda–raíz–derecha', 'contraejemplo', 'ejemplo', 'izquierda', 'sin garantia']),
    S('Con el recorrido preorden y el recorrido postorden se puede reconstruir siempre un único árbol binario.', false,
      'Falso: **no es único** cuando un nodo tiene un solo hijo (no se sabe si es izquierdo o derecho). Con **preorden + inorden** (o postorden + inorden) sí se reconstruye de forma única.',
      ['Es ambiguo cuando un nodo tiene un solo hijo (¿izquierdo o derecho?)', 'un solo hijo', 'un unico hijo', 'ambig', 'no es unico'], ['Con preorden + inorden (o postorden + inorden) sí es único', 'inorden', 'preorden + inorden', 'preorden y inorden']),
    S('El recorrido por niveles (BFS) de un árbol se implementa con una pila, igual que el recorrido en profundidad.', false,
      'Falso: BFS usa una **cola** (FIFO) para procesar los nodos nivel por nivel; la **pila** corresponde al recorrido en profundidad (DFS).',
      ['BFS usa una cola (FIFO)', 'cola', 'fifo'], ['La pila corresponde a la profundidad (DFS)', 'pila', 'profundidad', 'dfs']),
    S('Un recorrido recursivo preorden de un árbol con N nodos visita cada nodo exactamente una vez y su tiempo es O(N).', true,
      'Verdadero: cada nodo se **visita una sola vez** (una llamada por nodo, más una por cada hijo vacío) y el trabajo por llamada es O(1): O(N) en total.',
      ['Una llamada por nodo: cada nodo se visita una sola vez', 'una vez', 'una llamada por nodo', 'cada nodo'], ['Trabajo O(1) por llamada → total O(N)', 'o(n)', 'lineal', 'o(1)']),
    S('El espacio de pila que usa un recorrido recursivo de un árbol binario de altura h es O(h), no O(n), aunque el árbol tenga n nodos.', true,
      'Verdadero: en cada instante solo están activas las llamadas del **camino raíz–nodo actual** (a lo sumo h + 1 marcos); solo en el árbol degenerado h ≈ n.',
      ['Solo están activas las llamadas del camino desde la raíz', 'camino', 'raiz', 'h+1', 'h + 1'], ['Espacio O(h); en el degenerado h ≈ n', 'o(h)', 'altura', 'degenerad']),
    S('El postorden de un árbol de expresión aritmética produce la notación postfija (RPN) de esa expresión.', true,
      'Verdadero: postorden visita **hijos izquierdo y derecho antes que el operador** (raíz), que es exactamente el orden de la notación postfija.',
      ['Postorden: primero los operandos (hijos), después el operador (raíz)', 'hijos', 'operandos', 'raiz al final', 'despues'], ['Ese orden es el de la notación postfija', 'postfij', 'rpn', 'polaca']),
    S('En el recorrido preorden la raíz siempre es el último nodo visitado.', false,
      'Falso: en **preorden la raíz se visita primero** (raíz–izquierda–derecha); es en el **postorden** donde la raíz es la última.',
      ['En preorden la raíz se visita primero', 'primero', 'raiz-izq-der', 'raiz primero'], ['La raíz es la última en postorden', 'postorden', 'ultima', 'ultimo']),
    S('En el preorden de un árbol, el primer elemento es la raíz; ese dato, junto con el inorden, permite separar el subárbol izquierdo del derecho.', true,
      'Verdadero: la raíz es el primero del preorden; **buscándola en el inorden**, lo que queda a su izquierda es el subárbol izquierdo y lo que queda a su derecha, el derecho.',
      ['La raíz es el primero del preorden', 'primero', 'raiz'], ['Al ubicarla en el inorden se separan los subárboles izquierdo y derecho', 'inorden', 'separa', 'izquierda', 'subarbol'])
  ];

  POOLS.bst = [
    S('En un BST, el nodo con el valor máximo siempre es una hoja.', false,
      'Falso: el máximo es el nodo al que se llega **siguiendo siempre a la derecha**; no tiene hijo derecho pero **puede tener hijo izquierdo**. Ejemplo: `10(5)`: el máximo 10 tiene un hijo.',
      ['El máximo se halla yendo siempre a la derecha', 'derecha', 'sin hijo derecho', 'no tiene hijo derecho'], ['Puede tener hijo izquierdo, así que no siempre es hoja', 'hijo izquierdo', 'contraejemplo', 'ejemplo', 'no siempre']),
    rng => { const n = rng.int(5, 9); const v = Array.from({ length: n }, (_, i) => i + 1); return S('Al insertar los valores ' + v.join(', ') + ' (en ese orden) en un BST vacío se obtiene un árbol de altura O(log n).', false,
      'Falso: cada valor es mayor que todos los anteriores y se cuelga a la derecha: queda un árbol **degenerado** (una lista) de altura **' + (n - 1) + '**, es decir O(n), y buscar cuesta O(n).',
      ['Cada valor es mayor que los anteriores: siempre va a la derecha', 'derecha', 'mayor que', 'orden creciente', 'ordenad'], ['El árbol queda degenerado (como una lista): altura n − 1, O(n)', 'degenerad', 'lista', 'cadena', String(n - 1), 'o(n)', 'lineal']); },
    S('La búsqueda de un valor en un BST de n nodos tiene costo O(log n) en el peor caso.', false,
      'Falso: cuesta **O(h)**, con h la altura; el peor caso es el árbol **degenerado**, con h = n − 1, y entonces cuesta **O(n)**. Solo es O(log n) si el árbol está balanceado.',
      ['El costo es O(h), proporcional a la altura', 'o(h)', 'altura', 'h '], ['En el peor caso (degenerado) h = n − 1 → O(n); O(log n) solo si está balanceado', 'degenerad', 'o(n)', 'balancead', 'n-1']),
    S('Al eliminar un nodo con dos hijos de un BST se puede reemplazar su valor por el de su predecesor inorden o por el de su sucesor inorden.', true,
      'Verdadero: el **predecesor** (mayor del subárbol izquierdo) o el **sucesor** (menor del derecho) conservan la propiedad del BST, y luego se elimina ese nodo sustituto, que tiene a lo sumo un hijo.',
      ['Predecesor = mayor del subárbol izquierdo; sucesor = menor del derecho', 'mayor del subarbol izquierdo', 'menor del subarbol derecho', 'predecesor', 'sucesor'], ['Se conserva la propiedad del BST y luego se elimina el sustituto (0 o 1 hijo)', 'propiedad', 'conserva', 'mantiene', 'sustituto', 'a lo sumo un hijo']),
    S('El recorrido inorden de un BST siempre produce los valores en orden creciente.', true,
      'Verdadero: inorden visita **izquierda, raíz, derecha** y en un BST todo el subárbol izquierdo es menor que la raíz y todo el derecho mayor, así que sale ordenado.',
      ['Inorden visita izquierda, raíz, derecha', 'izquierda', 'izq'], ['En un BST izquierda < raíz < derecha en todo el subárbol, por eso sale ordenado', 'menor', 'mayor', 'propiedad', 'ordenad', 'creciente']),
    S('Dos BST con exactamente los mismos valores siempre tienen la misma forma.', false,
      'Falso: la forma depende del **orden de inserción**. Con {1,2,3}: insertar 2,1,3 da un árbol de altura 1 y insertar 1,2,3 una cadena de altura 2.',
      ['La forma depende del orden de inserción', 'orden de insercion', 'orden en que', 'orden'], ['Contraejemplo con los mismos valores y distinta forma', 'contraejemplo', 'ejemplo', 'cadena', 'altura']),
    S('Para saber que un árbol binario es un BST basta con comprobar que cada nodo es mayor que su hijo izquierdo y menor que su hijo derecho.', false,
      'Falso: la propiedad debe cumplirse para **todo el subárbol**, no solo para los hijos. Contraejemplo `10(5(,15),20)`: 15 es hijo derecho de 5 pero está en el subárbol izquierdo de 10 y es mayor que 10.',
      ['La propiedad debe cumplirse en todo el subárbol, no solo con los hijos', 'todo el subarbol', 'subarbol completo', 'subarbol', 'no solo'], ['Contraejemplo (un nodo mayor que un ancestro en su subárbol izquierdo)', 'contraejemplo', 'ejemplo', 'ancestro', '10(5']),
    S('En el BST del curso, insertar un valor que ya existe crea un segundo nodo con ese valor en el subárbol derecho.', false,
      'Falso: en el BST del curso **no se insertan duplicados**: si el valor ya está, el árbol no cambia.',
      ['No se permiten duplicados', 'no se insert', 'duplicad', 'ya existe', 'ya esta'], ['El árbol no cambia / se ignora la inserción', 'no cambia', 'se ignora', 'ignora', 'no hace nada', 'igual']),
    S('El predecesor inorden de un nodo que tiene hijo izquierdo es simplemente ese hijo izquierdo.', false,
      'Falso: es el **mayor del subárbol izquierdo**, que se halla bajando al hijo izquierdo y **después siempre a la derecha** hasta que no haya hijo derecho.',
      ['El predecesor es el mayor del subárbol izquierdo', 'mayor del subarbol izquierdo', 'maximo del subarbol izquierdo', 'mayor'], ['Se llega yendo a la izquierda una vez y luego siempre a la derecha', 'siempre a la derecha', 'derecha', 'hasta que no haya']),
    S('Eliminar un valor de un BST de altura h cuesta O(h) en el peor caso: hay que localizar el nodo y, si tiene dos hijos, buscar su sustituto.', true,
      'Verdadero: localizar el nodo baja a lo sumo h niveles y buscar el sustituto baja a lo sumo h más; el resto son cambios de punteros O(1): **O(h)**.',
      ['Localizar el nodo y buscar el sustituto bajan a lo sumo h niveles', 'h niveles', 'altura', 'baja'], ['Los cambios de punteros son O(1): total O(h)', 'o(h)', 'o(1)', 'punteros'])
  ];

  POOLS.avl = [
    S('En un AVL, una inserción puede necesitar varias rotaciones en cadena (una por cada nivel hasta la raíz) para restablecer el balance.', false,
      'Falso: en la **inserción basta una rotación** (simple o doble): al corregir el primer nodo desbalanceado el subárbol recupera su altura anterior. Es la **eliminación** la que puede requerir varias.',
      ['En inserción basta una rotación (simple o doble)', 'una rotacion', 'una sola', 'basta', '1 rotacion'], ['El subárbol recupera su altura anterior / solo la eliminación puede necesitar varias', 'eliminacion', 'altura', 'varias']),
    rng => { const c = rng.pick([['+2', '+1', 'simple', true, 'Izq-Izq (LL): una rotación simple a la derecha'], ['+2', '−1', 'simple', false, 'Izq-Der (LR): doble rotación (izquierda sobre el hijo y luego derecha)'], ['−2', '−1', 'simple', true, 'Der-Der (RR): una rotación simple a la izquierda'], ['−2', '+1', 'simple', false, 'Der-Izq (RL): doble rotación (derecha sobre el hijo y luego izquierda)'], ['+2', '−1', 'doble', true, 'Izq-Der (LR): doble rotación (izquierda sobre el hijo y luego derecha)'], ['−2', '+1', 'doble', true, 'Der-Izq (RL): doble rotación (derecha sobre el hijo y luego izquierda)'], ['+2', '+1', 'doble', false, 'Izq-Izq (LL): basta una rotación simple a la derecha']]);
      const lado = c[0] === '+2' ? 'izquierdo' : 'derecho';
      return S('Un nodo con factor de balance ' + c[0] + ' cuyo hijo ' + lado + ' tiene factor ' + c[1] + ' se corrige con una rotación **' + c[2] + '**.', c[3],
        (c[3] ? 'Verdadero' : 'Falso') + ': el caso es **' + c[4] + '**. Se mira el factor del hijo pesado: mismo signo → recta (una rotación); signo contrario → zigzag (dos).',
        ['Identifica el caso (LL, RR, LR o RL) a partir de los signos del nodo y de su hijo', 'caso', 'izq-izq', 'izq-der', 'der-der', 'der-izq', 'll', 'lr', 'rr', 'rl'], ['Mismo signo → rotación simple; signo contrario → doble', 'signo', 'recta', 'zigzag', 'doble', 'simple']); },
    S('Una rotación simple en un AVL cuesta O(n) porque hay que mover subárboles enteros.', false,
      'Falso: una rotación solo **cambia unos pocos punteros** (el subárbol «del medio» cambia de padre) y recalcula dos alturas: **O(1)**, sin importar el tamaño de los subárboles.',
      ['Solo cambia unos pocos punteros', 'punteros', 'enlaces', 'pocos'], ['Cuesta O(1): los subárboles no se recorren ni se copian', 'o(1)', 'constante', 'no se recorren', 'no se copian']),
    S('Toda rotación en un AVL conserva el recorrido inorden del árbol.', true,
      'Verdadero: una rotación **reorganiza la jerarquía** (quién es padre de quién) pero no el **orden relativo** de los valores, así que el inorden (y la propiedad de BST) se conserva.',
      ['No cambia el orden relativo de los valores', 'orden relativo', 'orden', 'ordenados'], ['El inorden y la propiedad del BST se conservan', 'inorden', 'propiedad', 'bst', 'conserva']),
    S('La altura de un AVL con n nodos es O(log n).', true,
      'Verdadero: con |factor| ≤ 1 en todo nodo, un AVL de altura h necesita **al menos ≈ φ^h nodos** (crece como Fibonacci), de donde h ≤ ≈ 1,44·log₂ n = O(log n).',
      ['La condición |factor| ≤ 1 limita el desbalance en cada nodo', 'factor', 'balance', 'desbalance'], ['Eso obliga a que la altura sea ≈ 1,44·log₂ n = O(log n)', 'log', 'logaritm', 'fibonacci']),
    S('Todo árbol AVL es un árbol binario perfecto.', false,
      'Falso: un AVL solo exige |factor| ≤ 1 en cada nodo; no pide que todos los niveles estén llenos. Ejemplo: `20(10,)` es AVL y no es perfecto.',
      ['AVL solo exige |factor| ≤ 1', 'factor', 'balance', 'diferencia de altura'], ['Contraejemplo: un AVL con un nodo sin un hijo no es perfecto', 'contraejemplo', 'ejemplo', 'perfecto', 'niveles llenos']),
    S('La inserción en un AVL de n nodos cuesta O(log n) en el peor caso.', true,
      'Verdadero: bajar hasta la hoja cuesta O(h) = O(log n); luego subir actualizando alturas es O(log n) y a lo sumo hay **una** rotación de costo O(1).',
      ['Bajar y subir recorren la altura del árbol, que es O(log n)', 'altura', 'o(log n)', 'log'], ['A lo sumo una rotación de costo O(1)', 'una rotacion', 'o(1)', 'rotacion']),
    S('Tras insertar en un AVL, el nodo desbalanceado que hay que corregir es el que está más cerca de la raíz.', false,
      'Falso: se corrige el **primer nodo desbalanceado** que se encuentra al subir desde el nodo nuevo, es decir el **más profundo** (más cerca de la hoja nueva).',
      ['Se corrige el primer nodo desbalanceado al subir desde el nodo nuevo', 'primer', 'subir', 'desde el nodo nuevo'], ['Es el más profundo (el más cercano a la hoja), no el más cercano a la raíz', 'mas profundo', 'profundo', 'cerca de la hoja', 'cercano a la hoja']),
    rng => { const n = rng.int(7, 15); return S('Si se insertan en un AVL vacío los valores 1, 2, 3, …, ' + n + ' (en ese orden), la altura final es O(log n), a diferencia del BST sin balanceo.', true,
      'Verdadero: el AVL **rota** cuando algún nodo llega a |factor| = 2, así que nunca se degenera; el BST sin balanceo, en cambio, queda como una cadena de altura ' + (n - 1) + '.',
      ['El AVL rota cuando un nodo llega a |factor| = 2', 'rota', 'rotacion', 'rebalancea', 'balancea'], ['Por eso no se degenera: altura O(log n); el BST quedaría como una cadena', 'degenera', 'cadena', 'log', 'lista']); },
    S('En un AVL, eliminar un nodo puede requerir una rotación en cada nivel del camino hasta la raíz, es decir hasta O(log n) rotaciones.', true,
      'Verdadero: al eliminar, un subárbol puede **perder altura** y el desbalance se propaga hacia arriba; hay que revisar todo el camino hasta la raíz (O(log n) niveles) y corregir donde haga falta.',
      ['Al eliminar, el subárbol puede perder altura y el desbalance sube', 'pierde altura', 'perder altura', 'sube', 'propaga', 'camino'], ['Puede haber hasta O(log n) rotaciones (una por nivel)', 'log', 'varias', 'cada nivel', 'niveles'])
  ];

  PQ.POOLS = POOLS;
  const TEMAS = {
    rec: { n: 1, c: ['rc_pila', 'rc_fib', 'rc_overflow', 'rc_cache', 'rc_conteo'], nombre: 'recursión' },
    par: { n: 3, c: ['pd_greedy', 'pd_dyc', 'pd_dp', 'pd_memo', 'pd_bt'], nombre: 'paradigmas algorítmicos' },
    arb: { n: 4, c: ['ar_def', 'ar_tipos', 'ar_profalt', 'ar_perfecto'], nombre: 'árboles binarios' },
    trv: { n: 5, c: ['tv_pre', 'tv_in', 'tv_post', 'tv_bfs', 'tv_reconstruir'], nombre: 'recorridos' },
    bst: { n: 6, c: ['bs_prop', 'bs_eliminar', 'bs_altura', 'bs_ordenins'], nombre: 'BST' },
    avl: { n: 7, c: ['av_factor', 'av_rotsimple', 'av_insertar', 'av_eliminar', 'av_complejidad'], nombre: 'AVL' }
  };
  PQ.TEMAS = TEMAS;

  /** elige n afirmaciones mezclando verdaderas y falsas (en el parcial suele haber 2 o 3 falsas de 5) */
  function elegir(rng, pool, n) {
    const items = pool.map(s => typeof s === 'function' ? s(rng) : s);
    const T = rng.shuffle(items.filter(s => s.v)), F = rng.shuffle(items.filter(s => !s.v));
    const nf = Math.min(F.length, Math.max(1, n === 2 ? 1 : n === 3 ? rng.int(1, 2) : rng.int(2, 3)));
    const nt = Math.min(T.length, n - nf);
    return rng.shuffle(F.slice(0, nf).concat(T.slice(0, nt)));
  }

  [['A', 2, 2, 'puntual'], ['B', 3, 3, 'corta'], ['C', 4, 5, 'de parcial']].forEach(([e, dif, n, tipo]) => {
    Object.keys(TEMAS).forEach(k => {
      const T = TEMAS[k];
      B({
        id: 'pq-vf-' + k + '-' + e, n: T.n, e, dif, c: T.c, tema: 'Parcial: V/F con justificación — ' + T.nombre + (e === 'C' ? '' : ' (' + tipo + ')'), parcial: e === 'C', slot: 'vf',
        gen(rng) {
          const sel = elegir(rng, POOLS[k], n);
          const valor = n * 0.2;
          return {
            tipo: 'mixta', fmt: 'Parcial · V/F con justificación', cat: 'teoria', valor,
            enunciado: 'Indique si cada afirmación es **verdadera o falsa** y **justifique en una frase**. (' + PQ.fmt((valor / n).toFixed(1)) + ' cada una; **la justificación vale más que la marca**.)',
            partes: sel.map(s => ({ titulo: '', peso: 1, q: { tipo: 'vfj', afirmacion: s.a, correcta: s.v, justif: { criterios: s.c, modelo: s.m } } })),
            pistas: PQ.PISTAS_GEN,
            explicacion: sel.map((s, i) => '**' + String.fromCharCode(97 + i) + ')** ' + s.m).join('\n\n')
          };
        }
      });
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
