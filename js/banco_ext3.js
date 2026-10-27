/* banco_ext3.js — preguntas del nivel 13 (heaps y colas de prioridad), del nivel 14 (condicionales) y ejercicios con figura y animación
   del árbol rojo-negro (nivel 7). Las respuestas esperadas se calculan con el simulador (que replica el algoritmo de las diapositivas) y, donde
   hay otra implementación independiente, se comprueba que coincidan; el código de referencia de los ejercicios se ejecuta con el intérprete. */
(function (global) {
  'use strict';
  const ET = global.ET, Sim = ET.Sim, PQ = ET.PQ, B = ET.Banco.add, H = ET.BancoExt;
  const lst = H.lst, dd = H.dd;

  /* =====================================================================================================================================
     Utilidades del heap (arreglos de valores, sin identificadores)
     ===================================================================================================================================== */
  const mejorV = (tipo, a, b) => tipo === 'max' ? a > b : a < b;
  function subirJS(a, i, tipo) { while (i > 0) { const p = (i - 1) >> 1; if (!mejorV(tipo, a[i], a[p])) break; const t = a[i]; a[i] = a[p]; a[p] = t; i = p; } }
  function bajarJS(a, i, n, tipo) {
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2; let g = i;
      if (l < n && mejorV(tipo, a[l], a[g])) g = l;
      if (r < n && mejorV(tipo, a[r], a[g])) g = r;
      if (g === i) break;
      const t = a[i]; a[i] = a[g]; a[g] = t; i = g;
    }
  }
  const insertarJS = (a, x, tipo) => { const b = a.slice(); b.push(x); subirJS(b, b.length - 1, tipo); return b; };
  const extraerJS = (a, tipo) => { const b = a.slice(), raiz = b[0], ult = b.pop(); if (b.length) { b[0] = ult; bajarJS(b, 0, b.length, tipo); } return { a: b, raiz }; };
  const heapifyJS = (v, tipo) => { const b = v.slice(); for (let i = (b.length >> 1) - 1; i >= 0; i--) bajarJS(b, i, b.length, tipo); return b; };
  const esHeapJS = (a, tipo) => a.every((x, i) => i === 0 || !mejorV(tipo, x, a[(i - 1) >> 1]));
  const igualA = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  const chequeo = (a, b, que) => { if (!igualA(a, b)) throw new Error('Heap: el cálculo y el simulador discrepan en ' + que + ': ' + lst(a) + ' frente a ' + lst(b)); };
  const valoresH = m => m.a.map(e => e.v);
  const NOMBRE = t => t === 'max' ? 'max-heap' : 'min-heap';
  const CLASE = t => t === 'max' ? 'class MaxHeap' : 'class MinHeap';
  /** figura del árbol completo que representa un arreglo (sin el título del simulador, que revelaría si es un heap) */
  const figHeap = (a, tipo, titulo) => { const f = Sim.heap.cuadro(Sim.heap.nuevo(a, tipo || 'max'), ''); f.items = f.items.filter(i => i.id !== 'tit'); return H.fig(f, titulo); };
  const simHeap = (frames, tipo, titulo) => H.sim(frames, Sim.heap.codigo(tipo), CLASE(tipo), titulo);

  /* =====================================================================================================================================
     NIVEL 13 · Heaps y colas de prioridad
     ===================================================================================================================================== */
  H.vf('n13-vf', 13, 'A', 1, ['hp_def', 'hp_arr', 'hp_subir', 'hp_bajar', 'hp_build', 'hp_pq', 'hp_topk'], 'Heaps (V/F)', [
    { a: 'En un max-heap, el segundo mayor elemento siempre es hijo directo de la raíz.', v: true, e: 'Su padre debe ser mayor o igual que él; el único elemento mayor es la raíz.', j: ['Su padre tiene que ser mayor que él, y solo la raíz lo es.', 'Porque los hijos de la raíz siempre son los dos mayores.', 'Porque el heap está ordenado de mayor a menor por niveles.'] },
    { a: 'En un heap, los dos hijos de un mismo nodo están ordenados entre sí (el izquierdo menor que el derecho).', v: false, e: 'El heap es un orden parcial: solo se compara cada padre con sus hijos; los hermanos no tienen orden.', j: ['La propiedad del heap relaciona a cada nodo con su padre, no a los hermanos entre sí.', 'Porque el hijo izquierdo se inserta siempre primero.', 'Porque el heap es un árbol de búsqueda.'] },
    { a: 'Buscar un valor cualquiera en un heap cuesta O(log n).', v: false, e: 'El heap no sirve para buscar: hay que revisar los elementos, O(n). Solo el extremo se obtiene en O(1).', j: ['No hay un criterio que indique hacia qué lado ir: en el peor caso se revisan todos los nodos.', 'Porque el heap tiene altura log n y se baja por un solo camino.', 'Porque el heap está ordenado por niveles.'] },
    { a: 'Un heap puede guardarse en un arreglo sin punteros porque es un árbol binario completo.', v: true, e: 'Un árbol completo se lee por niveles y los índices de padre e hijos se calculan con aritmética.', j: ['Al ser completo no hay huecos: el índice de cada nodo determina su padre y sus hijos.', 'Porque los nodos del heap se guardan ordenados.', 'Porque el heap tiene como máximo log n nodos.'] },
    { a: 'En un heap guardado en un arreglo desde el índice 0, el padre del nodo i es (i − 1) // 2.', v: true, e: 'Los hijos de i están en 2i + 1 y 2i + 2; el padre es el cociente entero inverso.', j: ['Es la inversa de «hijo izquierdo = 2i + 1» e «hijo derecho = 2i + 2».', 'Porque el padre siempre está en i // 2.', 'Porque el padre siempre está en el índice 0.'] },
    { a: 'Extraer la raíz de un heap con `del datos[0]` y dejar el resto como está mantiene la propiedad del heap en O(log n).', v: false, e: 'Correr todos los elementos cuesta O(n) y revuelve padres e hijos. Se quita la última hoja, se pone en la raíz y se baja.', j: ['`del datos[0]` desplaza todo el arreglo (O(n)) y destruye la relación padre-hijo por índices.', 'Porque la nueva raíz siempre es el segundo mayor.', 'Porque `del` es O(log n).'] },
    { a: 'Insertar en un heap cuesta O(log n) porque el elemento nuevo sube, como mucho, tantos niveles como la altura del árbol.', v: true, e: 'Cada intercambio sube un nivel y la altura de un árbol completo es log n.', j: ['El elemento entra como última hoja y sube un nivel por intercambio: a lo sumo la altura.', 'Porque primero se ordena todo el arreglo.', 'Porque se recorre todo el arreglo hasta encontrar su lugar.'] },
    { a: 'Construir un heap con `heapify` a partir de un arreglo de n elementos cuesta O(n).', v: true, e: 'Casi todos los nodos están cerca de las hojas y bajan muy poco: la suma de las alturas es lineal.', j: ['La mayoría de los nodos están cerca de las hojas y bajan pocos niveles: suma lineal.', 'Porque hay que ordenar el arreglo, que cuesta n.', 'Porque cada elemento baja log n niveles, pero hay solo n/2 elementos, así que cuesta n/2 log n = O(n).'] },
    { a: 'El módulo `heapq` de Python implementa un max-heap.', v: false, e: '`heapq` es un min-heap sobre una lista: `h[0]` es el mínimo. Para un max-heap se niegan los valores.', j: ['`heappop` siempre devuelve el menor; para simular un máximo se guardan los valores negados.', 'Porque `heappop` devuelve el último elemento insertado.', 'Porque `heapq` ordena la lista de mayor a menor.'] },
    { a: 'Para hallar los k menores de n elementos conviene un max-heap de tamaño k: el costo es O(n log k) y la memoria O(k).', v: true, e: 'La raíz es el peor de los k elegidos: cada elemento nuevo solo se compara con ella y, si mejora, reemplaza y baja.', j: ['La raíz del max-heap es el mayor de los k elegidos, el primero que se descarta.', 'Porque hay que ordenar los n elementos, que cuesta n log k.', 'Porque el heap guarda siempre los n elementos.'] },
    { a: 'Heapsort necesita un arreglo auxiliar de tamaño n.', v: false, e: 'Ordena en el sitio: intercambia la raíz con la última posición del heap y lo acorta. Memoria extra O(1).', j: ['El heap vive en el mismo arreglo y la parte ordenada crece al final: memoria extra O(1).', 'Porque heapsort copia el arreglo para ordenarlo.', 'Porque cada extracción crea un arreglo nuevo.'] },
    { a: 'Un arreglo ordenado de menor a mayor es un min-heap válido.', v: true, e: 'Todo elemento es menor o igual que los de índices mayores, en particular que sus hijos.', j: ['Cada hijo tiene un índice mayor que su padre, así que es mayor o igual que él.', 'Porque un min-heap siempre está ordenado.', 'No es válido porque el heap exige que los hermanos estén ordenados.'] },
    { a: 'Con una lista sin ordenar como cola de prioridad, extraer el elemento más prioritario cuesta O(n).', v: true, e: 'Hay que recorrer toda la lista para encontrarlo; insertar sí es O(1).', j: ['No se sabe dónde está el mayor: hay que revisar todos los elementos.', 'Porque la lista sin ordenar tiene el mayor al principio.', 'Porque extraer siempre es O(1).'] }
  ], ['Heap = árbol binario completo + orden solo entre padre e hijos (los hermanos no se ordenan).', 'En el arreglo: hijos de i en 2i + 1 y 2i + 2; padre en (i − 1) // 2.', 'Solo el extremo es O(1): insertar y extraer son O(log n); buscar un valor cualquiera es O(n).']);

  B({
    id: 'n13-indices', n: 13, e: 'A', dif: 2, c: ['hp_arr', 'hp_def'], tema: 'Índices del heap en el arreglo',
    gen(rng) {
      const n = rng.int(8, 12), tipo = rng.pick(['max', 'min']), a = heapifyJS(rng.distinct(n, 1, 99), tipo);
      const ultimoPadre = (n >> 1) - 1;
      const conIzq = [], conDer = []; for (let i = 0; i < n; i++) { if (2 * i + 1 < n) conIzq.push(i); if (2 * i + 2 < n) conDer.push(i); }
      const modo = rng.pick(['padre', 'izq', 'der', 'hojas', 'ultimo', 'valorHijo', 'valorPadre']);
      let enun, esp, expl;
      if (modo === 'padre') { const i = rng.int(1, n - 1); esp = (i - 1) >> 1; enun = '¿Cuál es el **índice del padre** del nodo que está en la posición **' + i + '** del arreglo?'; expl = '`padre(i) = (i − 1) // 2 = (' + i + ' − 1) // 2 = ' + esp + '`.'; }
      else if (modo === 'izq') { const i = rng.pick(conIzq); esp = 2 * i + 1; enun = '¿Cuál es el **índice del hijo izquierdo** del nodo de la posición **' + i + '**?'; expl = '`izq(i) = 2i + 1 = 2·' + i + ' + 1 = ' + esp + '`.'; }
      else if (modo === 'der') { const i = rng.pick(conDer); esp = 2 * i + 2; enun = '¿Cuál es el **índice del hijo derecho** del nodo de la posición **' + i + '**?'; expl = '`der(i) = 2i + 2 = 2·' + i + ' + 2 = ' + esp + '`.'; }
      else if (modo === 'hojas') { esp = n - (n >> 1); enun = 'El arreglo tiene **' + n + '** elementos. ¿Cuántas **hojas** tiene el árbol? (Un nodo es hoja si su hijo izquierdo `2i + 1` cae fuera del arreglo.)'; expl = 'El último nodo con hijos es `n // 2 − 1 = ' + ultimoPadre + '`; los índices ' + (ultimoPadre + 1) + ' a ' + (n - 1) + ' son hojas: **' + esp + '**.'; }
      else if (modo === 'ultimo') { esp = ultimoPadre; enun = 'El arreglo tiene **' + n + '** elementos. ¿Cuál es el **índice del último nodo que tiene hijos**? (Es desde donde empieza `heapify`.)'; expl = '`n // 2 − 1 = ' + n + ' // 2 − 1 = ' + esp + '`.'; }
      else if (modo === 'valorHijo') { const i = rng.pick(conDer); esp = a[2 * i + 2]; enun = '¿Qué **valor** tiene el **hijo derecho** del nodo cuyo valor es **' + a[i] + '**?'; expl = 'El nodo con valor ' + a[i] + ' está en el índice ' + i + '; su hijo derecho está en `2·' + i + ' + 2 = ' + (2 * i + 2) + '`, que guarda **' + esp + '**.'; }
      else { const i = rng.int(1, n - 1); esp = a[(i - 1) >> 1]; enun = '¿Qué **valor** tiene el **padre** del nodo cuyo valor es **' + a[i] + '**?'; expl = 'El nodo con valor ' + a[i] + ' está en el índice ' + i + '; su padre está en `(' + i + ' − 1) // 2 = ' + ((i - 1) >> 1) + '`, que guarda **' + esp + '**.'; }
      return {
        tipo: 'salida', fmt: 'Aritmética de índices del heap', numerico: true, tol: 0, enunciado: 'El arreglo `' + lst(a) + '` guarda un **' + NOMBRE(tipo) + '** (posiciones desde 0). ' + enun, figura: figHeap(a, tipo, NOMBRE(tipo) + ' · arreglo ' + lst(a)), esperado: String(esp), placeholder: 'Número',
        pistas: ['Hijos del nodo i: izquierdo `2i + 1`, derecho `2i + 2`; padre: `(i − 1) // 2`.', 'En la figura, el número debajo de cada nodo es su índice en el arreglo.', 'Un hijo existe solo si su índice es menor que n.'], explicacion: expl
      };
    }
  });

  B({
    id: 'n13-es-heap', n: 13, e: 'A', dif: 2, c: ['hp_def', 'hp_arr'], tema: '¿Es un heap?',
    gen(rng) {
      const n = rng.int(6, 8), vals = rng.distinct(n, 1, 99), quiere = rng.pick(['max', 'min', 'ninguno', 'ordenado']);
      let a, resp;
      if (quiere === 'max' || quiere === 'min') { a = heapifyJS(vals, quiere); resp = quiere; }
      else if (quiere === 'ordenado') { const asc = rng.chance(0.5); a = vals.slice().sort((x, y) => asc ? x - y : y - x); resp = asc ? 'min' : 'max'; }
      else { do { a = heapifyJS(vals, rng.pick(['max', 'min'])); const i = rng.int(1, n - 1), p = (i - 1) >> 1, t = a[i]; a[i] = a[p]; a[p] = t; } while (esHeapJS(a, 'max') || esHeapJS(a, 'min')); resp = 'ninguno'; }
      const T = { max: 'Es un **max-heap**', min: 'Es un **min-heap**', ninguno: '**No** es un heap (ni max-heap ni min-heap)' };
      let expl;
      const viol = tipo => { for (let i = 1; i < n; i++) { const p = (i - 1) >> 1; if (mejorV(tipo, a[i], a[p])) return { i, p }; } return null; };
      if (resp === 'ninguno') { const vx = viol('max'), vn = viol('min'); expl = 'No es max-heap: el nodo ' + a[vx.i] + ' (índice ' + vx.i + ') es **mayor** que su padre ' + a[vx.p] + ' (índice ' + vx.p + '). No es min-heap: el nodo ' + a[vn.i] + ' (índice ' + vn.i + ') es **menor** que su padre ' + a[vn.p] + ' (índice ' + vn.p + ').'; }
      else expl = 'Cada nodo es ' + (resp === 'max' ? 'mayor o igual' : 'menor o igual') + ' que sus hijos (se compara el elemento de cada índice i > 0 con el de `(i − 1) // 2`): es un **' + NOMBRE(resp) + '**.' + (quiere === 'ordenado' ? ' Un arreglo ordenado ' + (resp === 'min' ? 'ascendente' : 'descendente') + ' siempre es un ' + NOMBRE(resp) + ': cada padre tiene índice menor que sus hijos.' : '');
      return Object.assign(ET.Kit.mc(rng, 'El arreglo `' + lst(a) + '` se interpreta como un **árbol binario completo** (figura). ¿Qué es?', [[T[resp], 'Es lo que resulta de comparar cada nodo con su padre.']], ['max', 'min', 'ninguno'].filter(x => x !== resp).map(x => [T[x], 'No: compara cada nodo con su padre y verás que no se cumple.'])), {
        figura: figHeap(a, 'max', 'Árbol completo del arreglo ' + lst(a)),
        pistas: ['Compara cada nodo (menos la raíz) con su padre, en el índice `(i − 1) // 2`.', 'Max-heap: ningún hijo es mayor que su padre. Min-heap: ningún hijo es menor que su padre.', 'Basta una pareja padre-hijo que rompa la regla para descartar ese tipo.'], explicacion: expl
      });
    }
  });

  B({
    id: 'n13-insertar-traza', n: 13, e: 'B', dif: 3, c: ['hp_subir', 'hp_arr'], tema: 'Insertar en un heap (bubble up)',
    gen(rng) {
      const tipo = rng.pick(['max', 'min']), n = rng.int(5, 8), todos = rng.distinct(n + 2, 1, 99), a0 = heapifyJS(todos.slice(0, n), tipo), xs = todos.slice(n);
      const a1 = insertarJS(a0, xs[0], tipo), a2 = insertarJS(a1, xs[1], tipo);
      const s1 = Sim.heap.insertar(Sim.heap.nuevo(a0, tipo), xs[0]); chequeo(a1, valoresH(s1.modelo), 'insertar');
      chequeo(a2, valoresH(Sim.heap.insertar(Sim.heap.nuevo(a1, tipo), xs[1]).modelo), 'insertar (2)');
      return {
        tipo: 'salida', fmt: 'Trazado de un heap', tokens: true, enunciado: 'El **' + NOMBRE(tipo) + '** de la figura está guardado en un arreglo. Se ejecutan, en orden, `insertar(' + xs[0] + ')` e `insertar(' + xs[1] + ')` (se añade al final y se **sube** mientras ' + (tipo === 'max' ? 'sea mayor' : 'sea menor') + ' que su padre). Escribe el **arreglo final**.',
        figura: figHeap(a0, tipo, NOMBRE(tipo) + ' inicial: ' + lst(a0)), esperado: a2.join(' '), placeholder: 'a[0] a[1] a[2] …',
        pistas: ['`insertar(x)`: `datos.append(x)` y luego repite: si `x` ' + (tipo === 'max' ? 'es mayor' : 'es menor') + ' que su padre `(i − 1) // 2`, intercambia y sube.', 'Hazlo con la primera inserción, escribe el arreglo y recién entonces haz la segunda.', 'Detente cuando el padre ' + (tipo === 'max' ? 'sea mayor o igual' : 'sea menor o igual') + ', o al llegar a la raíz.'],
        explicacion: 'Tras `insertar(' + xs[0] + ')`: **' + lst(a1) + '** (' + s1.intercambios + ' intercambio(s)). Tras `insertar(' + xs[1] + ')`: **' + lst(a2) + '**. Cada inserción sube a lo sumo la altura: **O(log n)**.',
        sim: simHeap(s1.frames, tipo, 'insertar ' + xs[0] + ' (bubble up)')
      };
    }
  });

  B({
    id: 'n13-extraer-traza', n: 13, e: 'B', dif: 3, c: ['hp_bajar', 'hp_arr'], tema: 'Extraer de un heap (bubble down)',
    gen(rng) {
      const tipo = rng.pick(['max', 'min']), n = rng.int(6, 9), a0 = heapifyJS(rng.distinct(n, 1, 99), tipo), veces = rng.int(1, 2);
      let a = a0; const salen = [];
      for (let k = 0; k < veces; k++) { const r = extraerJS(a, tipo); salen.push(r.raiz); a = r.a; }
      const s1 = Sim.heap.extraer(Sim.heap.nuevo(a0, tipo)); chequeo(extraerJS(a0, tipo).a, valoresH(s1.modelo), 'extraer');
      const ext = tipo === 'max' ? 'extraer_max' : 'extraer_min', quien = tipo === 'max' ? 'mayor' : 'menor';
      return {
        tipo: 'salida', fmt: 'Trazado de un heap', tokens: true, enunciado: 'El **' + NOMBRE(tipo) + '** de la figura está en un arreglo. Se ejecuta `' + ext + '()` ' + (veces === 1 ? '**una vez**' : '**dos veces seguidas**') + ' (se quita la última hoja con `pop()`, se pone en la raíz y se **baja** intercambiándola con su hijo ' + quien + ' mientras haga falta). Escribe el **arreglo final**.',
        figura: figHeap(a0, tipo, NOMBRE(tipo) + ' inicial: ' + lst(a0)), esperado: a.join(' '), placeholder: 'a[0] a[1] a[2] …',
        pistas: ['La raíz es ' + (tipo === 'max' ? 'el máximo' : 'el mínimo') + ' (`datos[0]`): es lo que se devuelve. Luego la última hoja ocupa su lugar.', 'Baja la nueva raíz intercambiándola con su hijo ' + quien + ' (si le gana); repite desde esa posición.', 'Si solo hay un hijo (índice < n), compara solo con ese.'],
        explicacion: 'Salen, en orden: **' + salen.join(', ') + '**. Arreglo final: **' + lst(a) + '**. Cada extracción baja a lo sumo la altura: **O(log n)**.',
        sim: simHeap(s1.frames, tipo, 'extraer la raíz (bubble down)')
      };
    }
  });

  B({
    id: 'n13-heapify-traza', n: 13, e: 'B', dif: 3, c: ['hp_build', 'hp_bajar'], tema: 'Construir un heap con heapify',
    gen(rng) {
      const tipo = rng.pick(['max', 'min']), n = rng.int(6, 8); let vals;
      do { vals = rng.distinct(n, 1, 99); } while (esHeapJS(vals, tipo));
      const esp = heapifyJS(vals, tipo), s = Sim.heap.construir(vals, tipo); chequeo(esp, valoresH(s.modelo), 'heapify');
      return {
        tipo: 'salida', fmt: 'Trazado de un heap', tokens: true, enunciado: 'El arreglo de la figura **todavía no es un heap**. Aplica `heapify` para convertirlo en un **' + NOMBRE(tipo) + '**: recorre desde el último nodo con hijos (`n // 2 − 1 = ' + ((n >> 1) - 1) + '`) hasta la raíz, **bajando** cada nodo. Escribe el **arreglo resultante**.',
        figura: figHeap(vals, tipo, 'Arreglo inicial (no es un heap): ' + lst(vals)), esperado: esp.join(' '), placeholder: 'a[0] a[1] a[2] …',
        pistas: ['Empieza en el índice `n // 2 − 1` y retrocede hasta 0; los nodos de la segunda mitad son hojas y ya cumplen.', 'Para bajar un nodo, intercámbialo con su hijo ' + (tipo === 'max' ? 'mayor' : 'menor') + ' mientras ese hijo le gane, y sigue bajando.', 'Cuando bajes el nodo i, sus subárboles ya son heaps.'],
        explicacion: 'Heap resultante: **' + lst(esp) + '** (' + s.intercambios + ' intercambio(s)). `heapify` cuesta **O(n)**; n inserciones cuestan O(n log n).',
        sim: simHeap(s.frames, tipo, 'heapify: construir un ' + NOMBRE(tipo))
      };
    }
  });

  B({
    id: 'n13-heapq-salida', n: 13, e: 'B', dif: 3, c: ['hp_pq', 'hp_arr'], tema: 'Salida de un programa con heapq',
    gen(rng, K) {
      const modo = rng.pick(['min', 'max', 'heapify']), vals = rng.distinct(rng.int(6, 8), 1, 40);
      let code, filas;
      if (modo === 'min') {
        code = dd(`
          import heapq
          h = []
          for x in ${lst(vals)}:
              heapq.heappush(h, x)
          print(h)
          print(heapq.heappop(h), heapq.heappop(h))
          print(h)
        `); filas = 3;
      } else if (modo === 'max') {
        code = dd(`
          import heapq
          h = []
          for x in ${lst(vals)}:
              heapq.heappush(h, -x)
          print(-h[0])
          m1 = -heapq.heappop(h)
          m2 = -heapq.heappop(h)
          print(m1, m2)
          print(-h[0], len(h))
        `); filas = 3;
      } else {
        code = dd(`
          import heapq
          h = ${lst(vals)}
          heapq.heapify(h)
          print(h)
          print(heapq.heappop(h))
          print(h)
        `); filas = 3;
      }
      const esp = K.run(code);
      return {
        tipo: 'salida', multilinea: true, filas, enunciado: '`heapq` implementa un **min-heap** sobre una lista de Python. ¿Qué imprime este programa? (una línea por cada `print`; las listas se imprimen tal como quedan **en memoria**)', codigoVista: code, esperado: esp, stdout: true,
        pistas: ['`heappush` añade al final y sube; `heappop` quita el mínimo (la raíz), pone la última hoja en su lugar y la baja.', modo === 'max' ? 'Para obtener el máximo se guardan los valores **negados**: el mínimo de los negados es el máximo de los originales.' : 'Lleva el arreglo del heap después de cada operación.', modo === 'heapify' ? '`heapify(h)` baja los nodos desde `n // 2 − 1` hasta la raíz.' : 'Imprime la lista tal como está (no está ordenada, solo cumple la propiedad del heap).'],
        explicacion: 'Salida:\n```\n' + esp + '\n```\n`heapq` es un min-heap: `h[0]` es siempre el menor. La lista **no** está ordenada: solo cada padre es menor o igual que sus hijos.'
      };
    }
  });

  B({
    id: 'n13-tabla-pq', n: 13, e: 'A', dif: 3, c: ['hp_pq', 'hp_def'], tema: 'Costos de la cola de prioridad',
    gen() {
      const q = H.tablaCx(['Operación', 'Costo'], [
        ['Lista **sin ordenar**: insertar', ['O(1)', '1']], ['Lista **sin ordenar**: extraer el de mayor prioridad', ['O(n)', 'n']],
        ['Lista **ordenada**: insertar (conservando el orden)', ['O(n)', 'n']], ['Lista **ordenada**: extraer el de mayor prioridad (al final)', ['O(1)', '1']],
        ['Heap: ver el mínimo (`h[0]`)', ['O(1)', '1']], ['Heap: `heappush` / `heappop`', ['O(log n)', 'log n']],
        ['Heap: `heapify` de una lista de n elementos', ['O(n)', 'n']], ['Heap: buscar un valor cualquiera', ['O(n)', 'n']]]);
      return Object.assign(q, {
        enunciado: 'Completa el costo de cada operación de una **cola de prioridad** según su implementación (S7-C2, diap. 20-22). Usa la notación `O(...)`.',
        pistas: ['Con una lista sin ordenar hay que buscar el mayor recorriéndola; con una ordenada hay que desplazar elementos al insertar.', 'El heap equilibra: insertar y extraer cuestan log n (la altura del árbol).', 'Solo el extremo es inmediato; cualquier otro valor exige recorrer los nodos.'],
        explicacion: 'Lista sin ordenar: insertar O(1), extraer O(n). Lista ordenada: insertar O(n), extraer O(1). Heap: ver el extremo O(1); insertar y extraer O(log n); construir O(n); buscar un valor O(n).'
      });
    }
  });

  H.clasif('n13-clasif-heap-bst', 13, 'A', 2, ['hp_def', 'hp_pq'], 'Heap o árbol binario de búsqueda', 'Clasifica cada propiedad: ¿corresponde al **heap** o al **árbol binario de búsqueda (BST)**?', ['Heap', 'BST (balanceado)'], [
    ['El mínimo (o el máximo) se obtiene en O(1) en la raíz', 'Heap', 'La raíz es el extremo.'], ['Buscar un valor cualquiera cuesta O(log n)', 'BST (balanceado)', 'El BST decide a qué lado ir en cada nodo; el heap no.'],
    ['El recorrido inorden entrega los valores ordenados', 'BST (balanceado)', 'El orden izquierda < nodo < derecha da el inorden ordenado.'], ['Se guarda en un arreglo sin punteros', 'Heap', 'Árbol completo: índices 2i + 1, 2i + 2.'],
    ['Los dos hijos de un nodo no tienen orden entre sí', 'Heap', 'Solo se ordena cada padre con sus hijos.'], ['El hijo izquierdo es menor y el derecho mayor que el padre', 'BST (balanceado)', 'Es la regla del BST.'],
    ['Es un árbol binario completo', 'Heap', 'Se llena por niveles de izquierda a derecha.'], ['Sirve de base para una cola de prioridad', 'Heap', 'Extraer el extremo cuesta O(log n).'],
    ['Insertar: el elemento entra como última hoja y sube', 'Heap', 'Bubble up.'], ['Insertar: se baja desde la raíz comparando hasta una posición vacía', 'BST (balanceado)', 'Se compara en cada nodo para decidir izquierda o derecha.']
  ], ['Heap: orden parcial, árbol completo, arreglo, extremo en O(1).', 'BST: orden total por subárboles, busca en O(log n) si está balanceado, inorden ordenado.', 'Pregúntate: ¿se puede decidir hacia qué lado ir al buscar?'], 'Heap: árbol completo con orden parcial; extremo en O(1); no busca. BST: busca en O(log n) y recorre ordenado (S7-C2, diap. 22).');

  H.clasif('n13-eleccion', 13, 'B', 2, ['hp_pq', 'pc_pila', 'pc_cola'], 'Pila, cola o cola de prioridad', 'Para cada situación, elige la estructura adecuada: **pila**, **cola** (FIFO) o **cola de prioridad** (heap).', ['Pila', 'Cola (FIFO)', 'Cola de prioridad (heap)'], [
    ['Atender emergencias según su gravedad, no según el orden de llegada', 'Cola de prioridad (heap)', 'Sale siempre el más urgente.'], ['Procesar peticiones en el orden exacto en que llegaron', 'Cola (FIFO)', 'Primero en entrar, primero en salir.'],
    ['Deshacer la última acción de un editor', 'Pila', 'Sale primero lo último que se hizo.'], ['Un planificador que siempre ejecuta el evento más próximo en el tiempo', 'Cola de prioridad (heap)', 'Se extrae el mínimo por tiempo.'],
    ['Dijkstra: tomar siempre el nodo pendiente de menor distancia', 'Cola de prioridad (heap)', 'Extrae el mínimo de las distancias.'], ['Obtener los 10 mejores resultados de entre 10 millones', 'Cola de prioridad (heap)', 'Un heap de tamaño k: O(n log k).'],
    ['Recorrer un grafo nivel por nivel (BFS)', 'Cola (FIFO)', 'Visita primero lo más antiguo pendiente.'], ['Comprobar que los paréntesis están balanceados', 'Pila', 'Recuerda la última apertura pendiente.'],
    ['Un búfer que entrega los datos en el orden en que se produjeron', 'Cola (FIFO)', 'FIFO.'], ['Recorrer un grafo en profundidad (DFS) de forma iterativa', 'Pila', 'La pila recuerda a dónde volver.']
  ], ['¿Importa la urgencia (prioridad) o solo el orden de llegada?', 'Pila → lo último que entró; cola → lo primero que entró; heap → el más prioritario.', 'Dijkstra, planificadores y top-k son los usos clásicos del heap.'], 'Pila: LIFO. Cola: FIFO. Cola de prioridad: sale el más prioritario (heap), sin importar el orden de llegada.');

  B({
    id: 'n13-topk-traza', n: 13, e: 'C', dif: 3, c: ['hp_topk', 'hp_def'], tema: 'Los k menores con un heap de tamaño k',
    gen(rng) {
      const n = rng.int(8, 10), flujo = rng.distinct(n, 1, 60), k = rng.int(3, 4), r = Sim.heap.topk(flujo, k);
      const esp = flujo.slice().sort((x, y) => x - y).slice(0, k); chequeo(esp, r.resultado, 'top-k');
      return {
        tipo: 'salida', fmt: 'Trazado de un heap', tokens: true, enunciado: 'Se leen, en este orden, los números `' + lst(flujo) + '` (un flujo: no se guardan todos). Con un **max-heap de tamaño k = ' + k + '** se conservan los **' + k + ' menores** vistos: mientras no esté lleno se inserta; después, si el nuevo es **menor que la raíz**, reemplaza la raíz y baja; si no, se descarta. Escribe los **' + k + ' menores en orden ascendente**.',
        esperado: esp.join(' '), placeholder: 'de menor a mayor',
        pistas: ['La raíz del max-heap es el **mayor de los k elegidos**: el primero en ser descartado.', 'Cada elemento nuevo solo se compara con la raíz: si es mayor o igual, se descarta sin tocar el heap.', 'Al final el heap contiene los k menores; escríbelos ordenados de menor a mayor.'],
        explicacion: 'Los ' + k + ' menores son **' + esp.join(', ') + '**. Cada elemento costó a lo sumo O(log k): **O(n log k)** en total y memoria **O(k)**, frente a O(n log n) de ordenar todo.',
        sim: H.sim(r.frames, Sim.heap.codigo('max'), CLASE('max'), 'top-' + k + ' con un heap de tamaño ' + k)
      };
    }
  });

  B({
    id: 'n13-heapsort-paso', n: 13, e: 'C', dif: 4, c: ['hp_topk', 'hp_build', 'hp_bajar'], tema: 'Heapsort paso a paso',
    gen(rng) {
      const n = rng.int(6, 7); let vals;
      do { vals = rng.distinct(n, 1, 99); } while (esHeapJS(vals, 'max'));
      const mh = heapifyJS(vals, 'max'), j = rng.int(2, 3); const a = mh.slice(); let tam = a.length;
      for (let t = 0; t < j; t++) { const fin = tam - 1, x = a[0]; a[0] = a[fin]; a[fin] = x; tam = fin; bajarJS(a, 0, tam, 'max'); }
      const s = Sim.heap.heapsort(vals); chequeo(vals.slice().sort((x, y) => x - y), s.resultado, 'heapsort');
      return {
        tipo: 'salida', fmt: 'Trazado de un heap', tokens: true, enunciado: 'Se ordena `' + lst(vals) + '` con **heapsort**: primero se construye un **max-heap** con `heapify`; luego, **' + j + ' veces**, se intercambia la raíz con la última posición del heap, el heap se acorta en 1 y se baja la nueva raíz. Escribe el **arreglo completo** (heap + parte ya ordenada) después de esas **' + j + ' extracciones**.',
        esperado: a.join(' '), placeholder: 'a[0] a[1] a[2] …',
        pistas: ['Primero el max-heap: `heapify` desde el índice `n // 2 − 1` hasta 0.', 'En cada paso, el máximo (raíz) pasa a la última posición del heap y ya no se toca.', 'Después de intercambiar, el heap tiene un elemento menos: baja la raíz solo dentro de ese tamaño.'],
        explicacion: 'Max-heap inicial: ' + lst(mh) + '. Tras ' + j + ' extracción(es): **' + lst(a) + '** (los últimos ' + j + ' ya están en su lugar). Heapsort: **O(n log n)** garantizado y **O(1)** de memoria extra.',
        sim: H.sim(s.frames, Sim.heap.codigo('max'), CLASE('max'), 'heapsort')
      };
    }
  });

  B({
    id: 'n13-complejidad', n: 13, e: 'C', dif: 3, c: ['hp_topk', 'hp_build', 'hp_pq'], tema: 'Complejidad con heaps',
    gen(rng, K) {
      const P = [
        { q: 'Se quieren los **k menores** de entre **n** elementos con un max-heap de tamaño k. ¿Cuánto cuesta en tiempo?', ok: 'O(n log k)', m: ['O(n log n)', 'O(k log n)', 'O(n + k)'], why: 'Cada uno de los n elementos cuesta a lo sumo log k (comparar con la raíz y, si mejora, reemplazar y bajar).' },
        { q: '¿Cuánto cuesta **construir un heap** con `heapify` a partir de una lista de n elementos?', ok: 'O(n)', m: ['O(n log n)', 'O(log n)', 'O(n²)'], why: 'Casi todos los nodos están cerca de las hojas y bajan poco: la suma de alturas es lineal.' },
        { q: '¿Cuánta **memoria extra** usa heapsort (ordenando en el arreglo dado)?', ok: 'O(1)', m: ['O(n)', 'O(log n)', 'O(n log n)'], why: 'El heap y la parte ordenada comparten el mismo arreglo: solo se usan unas pocas variables.' },
        { q: '¿Cuánto cuesta el tiempo total de **heapsort** de n elementos?', ok: 'O(n log n)', m: ['O(n)', 'O(n²)', 'O(log n)'], why: 'Construir el heap cuesta O(n) y luego n extracciones de O(log n) cada una.' },
        { q: 'Con n = 10⁶ y k = 10, ¿cuántas veces más rápido es (aprox.) hallar los k menores con un heap de tamaño k que ordenando todo, en número de comparaciones?', ok: 'Unas 6 veces (≈ 3n frente a ≈ 20n)', m: ['Unas 100 000 veces', 'Son iguales', 'Unas 1000 veces'], why: 'log₂ 10 ≈ 3,3 frente a log₂ 10⁶ ≈ 20: el cociente es ≈ 6.' },
        { q: '¿Cuánto cuesta **insertar** un elemento en un heap de n elementos?', ok: 'O(log n)', m: ['O(1)', 'O(n)', 'O(n log n)'], why: 'El elemento sube un nivel por intercambio, como mucho la altura del árbol.' }
      ];
      const it = rng.pick(P);
      return Object.assign(K.mc(rng, it.q, [[it.ok, it.why]], it.m.map(x => [x, 'No es ese costo.'])), {
        pistas: ['Piensa en la altura del heap: un árbol completo de n nodos tiene altura ≈ log₂ n.', 'Heap de tamaño k: su altura es log k, no log n.', 'Construir de abajo hacia arriba es más barato que n inserciones.'], explicacion: it.why
      });
    }
  });

  B({
    id: 'n13-orden-pasos', n: 13, e: 'B', dif: 2, c: ['hp_subir', 'hp_bajar', 'hp_build', 'hp_topk'], tema: 'Ordenar pasos (heaps)',
    gen(rng) {
      const L = [
        { t: 'insertar un elemento en un max-heap', items: ['Agregar `x` al final del arreglo (última hoja)', 'Calcular el índice del padre `p = (i − 1) // 2`', 'Comparar el elemento con su padre', 'Si es mayor que su padre, intercambiarlos y repetir desde la posición del padre', 'Detenerse cuando el padre es mayor o igual (o al llegar a la raíz)'] },
        { t: 'extraer el máximo de un max-heap', items: ['Guardar la raíz `datos[0]` para devolverla', 'Quitar la última hoja con `pop()`', 'Poner esa hoja en la raíz (`datos[0] = ultimo`)', 'Compararla con sus hijos y elegir el mayor', 'Intercambiarla con el hijo mayor si le gana y repetir hacia abajo', 'Devolver la raíz guardada'] },
        { t: 'construir un heap con `heapify` (O(n))', items: ['Empezar en el último nodo que tiene hijos: `n // 2 − 1`', 'Bajar ese nodo (bubble down) hasta su lugar', 'Pasar al índice anterior', 'Repetir hasta llegar a la raíz', 'Bajar también la raíz: el arreglo ya es un heap'] },
        { t: 'hallar los k menores con un max-heap de tamaño k', items: ['Crear un max-heap vacío', 'Mientras el heap tenga menos de k elementos, insertar cada elemento', 'Con el heap lleno, comparar cada nuevo elemento con la raíz', 'Si el nuevo es menor que la raíz, reemplazar la raíz y bajarla', 'Al terminar, el heap contiene los k menores'] },
        { t: 'ordenar con heapsort', items: ['Construir un max-heap con el arreglo (O(n))', 'Intercambiar la raíz (el máximo) con la última posición del heap', 'Reducir en uno el tamaño del heap', 'Bajar la nueva raíz para reparar el heap', 'Repetir hasta que el heap quede con un solo elemento'] }
      ];
      const o = rng.pick(L), idx = o.items.map((_, i) => i); let ini = rng.shuffle(idx); if (ini.every((x, i) => x === i)) ini = idx.slice().reverse();
      return { tipo: 'orden', enunciado: 'Ordena los pasos para **' + o.t + '**.', items: o.items, correcto: idx, inicial: ini, pistas: ['Piensa en qué debe existir antes de poder comparar o intercambiar.', 'Al extraer, primero se guarda la raíz y recién después se reemplaza.', 'La condición de parada y la devolución van al final.'], explicacion: 'Orden correcto: ' + o.items.map((s, i) => (i + 1) + '. ' + s).join(' → ') };
    }
  });

  /* ---------- ejercicios de código del nivel 13 ---------- */
  B({
    id: 'n13-impl-es-heap', n: 13, e: 'B', dif: 2, c: ['hp_arr', 'hp_def'], tema: 'Comprobar la propiedad del min-heap',
    gen() {
      const sol = dd(`
        def es_min_heap(a):
            for i in range(1, len(a)):
                if a[i] < a[(i - 1) // 2]:
                    return False
            return True
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `es_min_heap(a)` que devuelva `True` si la lista `a` (un **árbol completo guardado por niveles**, índices desde 0) cumple la propiedad del **min-heap**: cada elemento es mayor o igual que su padre, que está en el índice `(i - 1) // 2`. Una lista vacía o de un elemento es un min-heap.', starter: 'def es_min_heap(a):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['es_min_heap([1, 3, 2, 7, 4, 5])', 'es_min_heap([2, 1])', 'es_min_heap([])', 'es_min_heap([5])', 'es_min_heap([1, 2, 3, 4, 5, 6, 7])', 'es_min_heap([1, 3, 2, 0])', 'es_min_heap([1, 1, 1])', 'es_min_heap([4, 5, 6, 3])', 'es_min_heap([1, 5, 2, 6, 7, 3, 4])'], fn: 'es_min_heap', ejemplo: 'es_min_heap([1, 3, 2])'
      });
      q.pistas = ['El elemento de la posición `i` (con `i > 0`) tiene su padre en `(i - 1) // 2`.', 'Recorre desde `i = 1` y devuelve `False` apenas un hijo sea **menor** que su padre.', 'No basta con que la lista esté ordenada: `[1, 3, 2]` es un min-heap aunque no esté ordenada.'];
      q.explicacion = 'Se compara cada elemento con su padre:\n```\n' + sol + '\n```\nCosto **O(n)**: se visita cada nodo una vez.';
      return q;
    }
  });

  B({
    id: 'n13-impl-kmenores', n: 13, e: 'B', dif: 3, c: ['hp_pq', 'hp_topk'], tema: 'Los k menores con heapq',
    gen() {
      const sol = dd(`
        import heapq

        def k_menores(datos, k):
            h = list(datos)
            heapq.heapify(h)
            return [heapq.heappop(h) for _ in range(min(k, len(h)))]
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `k_menores(datos, k)` que devuelva una lista con los **k menores** valores de `datos`, de menor a mayor (si hay menos de k, devuelve todos). **Usa `heapq`** (`heapify`, `heappop`…): no se permite `sorted`, `.sort()`, `nsmallest` ni `nlargest`.', starter: 'import heapq\n\ndef k_menores(datos, k):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['k_menores([8, 3, 5, 1, 9, 2, 7], 3)', 'k_menores([5, 5, 1], 2)', 'k_menores([4], 3)', 'k_menores([], 2)', 'k_menores([9, 8, 7], 0)', 'k_menores([3, 1, 2], 3)', 'k_menores([10, -4, 7, 0, -4], 4)'], fn: 'k_menores', ejemplo: 'k_menores([5, 2, 8, 1], 2)',
        reglas: [{ t: 'noUsa', re: /sorted|\.sort\s*\(|nsmallest|nlargest/, msg: 'No uses sorted, .sort(), nsmallest ni nlargest: la idea es usar el heap (heapify y heappop).' }]
      });
      q.pistas = ['`heapq.heapify(h)` convierte la lista en un min-heap en O(n).', '`heapq.heappop(h)` devuelve cada vez el menor de los que quedan: llámalo k veces.', 'Cuida el caso en que `k` sea mayor que `len(datos)` o igual a 0.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCosto O(n + k log n). (Con un max-heap de tamaño k sería O(n log k) y memoria O(k).)';
      return q;
    }
  });

  B({
    id: 'n13-impl-minheap', n: 13, e: 'C', dif: 4, c: ['hp_subir', 'hp_bajar', 'hp_arr'], tema: 'Implementar un min-heap',
    gen() {
      const sol = dd(`
        class MinHeap:
            def __init__(self):
                self.datos = []

            def insertar(self, x):
                d = self.datos
                d.append(x)
                i = len(d) - 1
                while i > 0:
                    p = (i - 1) // 2
                    if d[i] >= d[p]:
                        break
                    d[i], d[p] = d[p], d[i]
                    i = p

            def extraer_min(self):
                d = self.datos
                raiz = d[0]
                ultimo = d.pop()
                if d:
                    d[0] = ultimo
                    i, n = 0, len(d)
                    while True:
                        menor = i
                        l, r = 2 * i + 1, 2 * i + 2
                        if l < n and d[l] < d[menor]:
                            menor = l
                        if r < n and d[r] < d[menor]:
                            menor = r
                        if menor == i:
                            break
                        d[i], d[menor] = d[menor], d[i]
                        i = menor
                return raiz
      `);
      const pre = dd(`
        def construir(vals):
            h = MinHeap()
            for v in vals:
                h.insertar(v)
            return h.datos

        def vaciar(vals):
            h = MinHeap()
            for v in vals:
                h.insertar(v)
            salida = []
            while h.datos:
                salida.append(h.extraer_min())
            return salida

        def estado_tras(vals, k):
            h = MinHeap()
            for v in vals:
                h.insertar(v)
            sacados = [h.extraer_min() for _ in range(k)]
            return sacados, h.datos
      `);
      const q = PQ.codigoQ({
        enun: 'Implementa la clase `MinHeap` con un arreglo `self.datos`. `insertar(x)` añade `x` **al final** y lo **sube** mientras sea menor que su padre `(i - 1) // 2`. `extraer_min()` devuelve la raíz: quita la **última hoja** con `pop()`, la pone en la raíz y la **baja** intercambiándola con su hijo **menor** mientras haga falta. **No uses `heapq`.** (Las pruebas comparan el arreglo `datos` interno, así que sigue exactamente el algoritmo de la clase.)', starter: 'class MinHeap:\n    def __init__(self):\n        self.datos = []\n\n    def insertar(self, x):\n        # complete aquí: agregue x al final y súbalo\n        pass\n\n    def extraer_min(self):\n        # complete aquí: devuelva la raíz y repare el heap bajando\n        pass\n', solucion: sol, prelude: pre,
        tests: ['construir([5, 3, 8, 1, 9, 2])', 'construir([1, 2, 3, 4, 5])', 'construir([5, 4, 3, 2, 1])', 'construir([])', 'vaciar([7, 2, 9, 4, 1, 8])', 'vaciar([5])', 'estado_tras([6, 2, 7, 3, 9, 1, 5], 2)', 'estado_tras([4, 8, 6, 9, 7], 3)'], fn: 'MinHeap', ejemplo: 'construir([3, 1, 2])', lineas: 24,
        reglas: [{ t: 'noUsa', re: /heapq/, msg: 'No uses heapq: implementa tú el heap con bubble up y bubble down.' }]
      });
      q.pistas = ['Subir: mientras `i > 0`, calcula el padre `p = (i - 1) // 2`; si `d[i] >= d[p]` termina; si no, intercambia y haz `i = p`.', 'Extraer: guarda `raiz = d[0]`, saca la última hoja con `pop()`, y si quedan elementos ponla en `d[0]` y bájala.', 'Bajar: elige entre `i`, el hijo izquierdo `2i + 1` y el derecho `2i + 2` el menor (solo si el índice es menor que `n`); si es distinto de `i`, intercambia y sigue.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nAmbas operaciones cuestan **O(log n)**.';
      return q;
    }
  });

  B({
    id: 'n13-impl-kesimo', n: 13, e: 'C', dif: 4, c: ['hp_topk', 'hp_pq'], tema: 'El k-ésimo mayor con un heap de tamaño k',
    gen() {
      const sol = dd(`
        import heapq

        def k_esimo_mayor(datos, k):
            h = []
            for x in datos:
                if len(h) < k:
                    heapq.heappush(h, x)
                elif x > h[0]:
                    heapq.heappop(h)
                    heapq.heappush(h, x)
            return h[0]
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `k_esimo_mayor(datos, k)` que devuelva el **k-ésimo elemento mayor** de `datos` (`k = 1` es el máximo; hay al menos k elementos; los repetidos cuentan por separado). Mantén un **min-heap de tamaño k** con `heapq`: su raíz es el menor de los k mayores vistos. No se permite `sorted`, `.sort()`, `nlargest` ni `nsmallest`.', starter: 'import heapq\n\ndef k_esimo_mayor(datos, k):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['k_esimo_mayor([3, 2, 1, 5, 6, 4], 2)', 'k_esimo_mayor([3, 2, 3, 1, 2, 4, 5, 5, 6], 4)', 'k_esimo_mayor([1], 1)', 'k_esimo_mayor([7, 7, 7], 2)', 'k_esimo_mayor([-1, -5, -3], 1)', 'k_esimo_mayor([9, 4, 6, 8, 2], 5)'], fn: 'k_esimo_mayor', ejemplo: 'k_esimo_mayor([5, 1, 9, 3], 2)',
        reglas: [{ t: 'noUsa', re: /sorted|\.sort\s*\(|nlargest|nsmallest/, msg: 'No uses sorted, .sort(), nlargest ni nsmallest: mantén un min-heap de tamaño k.' }]
      });
      q.pistas = ['Para los **k mayores** conviene un **min-heap**: su raíz es el menor de los k elegidos, el primero que hay que descartar.', 'Mientras el heap tenga menos de k elementos, haz `heappush`; después, si `x > h[0]`, reemplaza la raíz (`heappop` y `heappush`).', 'Al final, `h[0]` es el k-ésimo mayor.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCada elemento cuesta O(log k): **O(n log k)** en tiempo y **O(k)** de memoria.';
      return q;
    }
  });

  B({
    id: 'n13-impl-fusionar', n: 13, e: 'C', dif: 5, c: ['hp_pq', 'hp_topk'], tema: 'Fusionar listas ordenadas con un heap',
    gen() {
      const sol = dd(`
        import heapq

        def fusionar(listas):
            h = []
            for i, lista in enumerate(listas):
                if lista:
                    heapq.heappush(h, (lista[0], i, 0))
            res = []
            while h:
                v, i, j = heapq.heappop(h)
                res.append(v)
                if j + 1 < len(listas[i]):
                    heapq.heappush(h, (listas[i][j + 1], i, j + 1))
            return res
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `fusionar(listas)` que reciba una lista de listas **ya ordenadas** de menor a mayor y devuelva **una sola lista ordenada** con todos sus elementos. Usa un **min-heap** (`heapq`) que guarde, para cada lista, su próximo elemento: en cada paso se extrae el menor y se inserta el siguiente de su lista. No se permite `sorted`, `.sort()` ni `heapq.merge`.', starter: 'import heapq\n\ndef fusionar(listas):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['fusionar([[1, 4, 7], [2, 5], [3, 6, 9]])', 'fusionar([[], [1]])', 'fusionar([])', 'fusionar([[5, 6], [1, 2], [3]])', 'fusionar([[1, 1], [1]])', 'fusionar([[2], [1], [0]])'], fn: 'fusionar', ejemplo: 'fusionar([[1, 3], [2, 4]])',
        reglas: [{ t: 'noUsa', re: /sorted|\.sort\s*\(|heapq\s*\.\s*merge/, msg: 'No uses sorted, .sort() ni heapq.merge: usa el heap (heappush y heappop).' }]
      });
      q.pistas = ['El heap guarda tuplas `(valor, índice_de_lista, posición)`: Python compara por el primer elemento.', 'Inicia el heap con el primer elemento de cada lista que no esté vacía.', 'Tras extraer `(v, i, j)`, si la lista `i` tiene un elemento en `j + 1`, insértalo.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```\nCon N elementos en total y k listas: **O(N log k)**; el heap nunca tiene más de k elementos.';
      return q;
    }
  });

  /* =====================================================================================================================================
     NIVEL 14 · Condicionales
     ===================================================================================================================================== */
  H.vf('n14-vf', 14, 'A', 1, ['cd_bool', 'cd_if', 'cd_anid'], 'Condicionales (V/F)', [
    { a: 'En un `if-elif-else`, si la primera condición es verdadera, Python igualmente evalúa las demás.', v: false, e: 'Se ejecuta el primer bloque cuya condición es verdadera y el resto se ignora.', j: ['El `if-elif-else` es excluyente: tras ejecutar un bloque, el resto se salta.', 'Python evalúa todas las condiciones y ejecuta la última verdadera.', 'Python evalúa todas y ejecuta todos los bloques verdaderos.'] },
    { a: 'Dos `if` seguidos (sin `elif`) evalúan ambas condiciones aunque la primera sea verdadera.', v: true, e: 'Son decisiones independientes: cada `if` se evalúa por su cuenta.', j: ['Cada `if` es una decisión aparte, sin relación con el anterior.', 'El segundo `if` solo se evalúa si el primero fue falso.', 'Python los trata como un único `if-elif`.'] },
    { a: 'En Python, `=` compara dos valores y `==` los asigna.', v: false, e: '`=` asigna y `==` compara.', j: ['`=` es la asignación; la comparación de igualdad es `==`.', 'Ambos operadores hacen lo mismo.', 'Depende de si estás dentro de un `if`.'] },
    { a: 'La expresión `3 < edad < 25` es válida en Python y equivale a `3 < edad and edad < 25`.', v: true, e: 'Python admite comparaciones encadenadas.', j: ['Las comparaciones encadenadas se evalúan como una conjunción de cada par.', 'Es un error de sintaxis: hay que escribir `and`.', 'Equivale a `3 < edad or edad < 25`.'] },
    { a: '`p or q` es falsa solamente cuando `p` y `q` son ambas falsas.', v: true, e: 'Según la tabla de verdad del `or`: basta una verdadera para que sea verdadera.', j: ['El `or` es verdadero si al menos una de las dos es verdadera.', 'El `or` es verdadero solo si las dos son verdaderas.', 'El `or` es falso cuando alguna es falsa.'] },
    { a: 'En Python, un bloque `if` se delimita con llaves `{ }`.', v: false, e: 'El bloque lo define la sangría (4 espacios): lo que no está indentado ocurre siempre.', j: ['Python usa la sangría para agrupar las instrucciones del bloque.', 'Python usa `begin` y `end`.', 'Python usa los dos puntos y un `end if`.'] },
    { a: 'El orden de los `elif` no importa aunque sus condiciones se solapen, como `nota >= 3.0` y `nota >= 4.5`.', v: false, e: 'Gana la primera condición verdadera: con `>= 3.0` primero, «Excelente» nunca se alcanza.', j: ['Con condiciones solapadas manda la primera verdadera: hay que ordenar de la más específica a la más general.', 'Python reordena los `elif` por sí mismo.', 'Se ejecutan todos los `elif` verdaderos.'] },
    { a: 'Más de tres niveles de anidación es señal de que conviene rediseñar con `and`/`or` o con `elif`.', v: true, e: 'El código anidado profundo es difícil de leer y propenso a errores.', j: ['Muchos niveles dificultan la lectura; se combinan condiciones con `and`/`or` o se usa `elif`.', 'Python no permite más de tres niveles.', 'Más niveles hacen el programa más rápido.'] },
    { a: '`not (a or b)` es equivalente a `not a and not b`.', v: true, e: 'Es la ley de De Morgan: la negación de un `or` es un `and` de negaciones.', j: ['Es la ley de De Morgan: se niegan los términos y se cambia `or` por `and`.', 'Es equivalente a `not a or not b`.', 'No son equivalentes: `not` solo afecta a `a`.'] },
    { a: 'El operador ternario `x if cond else y` sirve para elegir entre dos valores en una asignación simple.', v: true, e: 'Es una forma compacta de un `if-else` que produce un valor.', j: ['Evalúa a `x` si la condición es verdadera y a `y` en caso contrario.', 'Sirve para ejecutar varias instrucciones.', 'Solo puede usarse dentro de un `while`.'] },
    { a: 'La comparación `"Moto" == "moto"` es verdadera.', v: false, e: 'Las cadenas distinguen mayúsculas de minúsculas; conviene normalizar con `.lower()`.', j: ['Python distingue mayúsculas y minúsculas al comparar cadenas.', 'Python ignora las mayúsculas al comparar.', 'Es un error de sintaxis comparar cadenas.'] },
    { a: 'Un año es bisiesto si y solo si es múltiplo de 4.', v: false, e: 'Los múltiplos de 100 no lo son, salvo que también sean múltiplos de 400 (1900 no; 2000 sí).', j: ['Hay excepciones: múltiplo de 100 no es bisiesto salvo que lo sea de 400.', 'Todos los múltiplos de 4 son bisiestos sin excepción.', 'Solo son bisiestos los múltiplos de 400.'] }
  ], ['`==` compara, `=` asigna. El bloque lo marca la sangría.', 'En un `if-elif-else` se ejecuta el primer bloque cuya condición es verdadera; el orden importa.', 'Tabla de verdad: `and` verdadero solo si ambas lo son; `or` falso solo si ambas son falsas.']);

  const OPS_CMP = ['<', '>', '<=', '>=', '==', '!='];
  function atomoB(rng) {
    const t = rng.int(0, 3), x = rng.pick(['a', 'b', 'c']);
    if (t === 0) return x + ' ' + rng.pick(OPS_CMP) + ' ' + rng.pick(['a', 'b', 'c'].filter(v => v !== x));
    if (t === 1) return x + ' ' + rng.pick(OPS_CMP) + ' ' + rng.int(0, 9);
    if (t === 2) return x + ' % ' + rng.int(2, 3) + ' == ' + rng.int(0, 1);
    return rng.pick(['0', '1', '2']) + ' <= ' + x + ' <= ' + rng.pick(['5', '6', '8']);
  }
  const FORMAS_B = [(A, Bb, C) => A + ' and ' + Bb + ' or ' + C, (A, Bb, C) => A + ' or ' + Bb + ' and ' + C, (A, Bb, C) => 'not (' + A + ' or ' + Bb + ') and ' + C, (A, Bb, C) => '(' + A + ' or ' + Bb + ') and not ' + C, (A, Bb, C) => 'not ' + A + ' or ' + Bb + ' and not ' + C, (A, Bb, C) => A + ' and (' + Bb + ' or ' + C + ')'];
  const VERD = ['True', 'Verdadero', 'V', 'T'], FALS = ['False', 'Falso', 'F'];

  B({
    id: 'n14-bool-eval', n: 14, e: 'A', dif: 2, c: ['cd_bool'], tema: 'Evaluar expresiones booleanas',
    gen(rng, K) {
      let A, Bb, C;
      do { A = atomoB(rng); Bb = atomoB(rng); C = atomoB(rng); } while (A === Bb || Bb === C || A === C);
      const expr = rng.pick(FORMAS_B)(A, Bb, C), v = { a: rng.int(0, 9), b: rng.int(0, 9), c: rng.int(0, 9) };
      const code = 'a = ' + v.a + '\nb = ' + v.b + '\nc = ' + v.c + '\nprint(' + expr + ')';
      const esp = K.run(code).trim(), sust = expr.replace(/\b[abc]\b/g, m => String(v[m]));
      return {
        tipo: 'salida', enunciado: 'Con `a = ' + v.a + '`, `b = ' + v.b + '` y `c = ' + v.c + '`, ¿qué imprime `print(' + expr + ')`? (Recuerda la precedencia: `not` primero, luego `and`, luego `or`.)', esperado: esp === 'True' ? VERD : FALS, placeholder: 'True o False',
        pistas: ['Sustituye los valores y resuelve primero las comparaciones: cada una da `True` o `False`.', 'Precedencia: `not` > `and` > `or`; los paréntesis mandan sobre todo lo demás.', 'En una comparación encadenada `x <= y <= z` deben cumplirse ambas desigualdades.'],
        explicacion: 'Sustituyendo: `' + sust + '` → **' + esp + '**.'
      };
    }
  });

  B({
    id: 'n14-tabla-verdad', n: 14, e: 'A', dif: 2, c: ['cd_bool'], tema: 'Tabla de verdad',
    gen(rng) {
      const FUN = [
        { t: 'p and q', f: (p, q) => p && q }, { t: 'p or q', f: (p, q) => p || q }, { t: 'not p or q', f: (p, q) => !p || q }, { t: 'not (p and q)', f: (p, q) => !(p && q) },
        { t: 'not p and not q', f: (p, q) => !p && !q }, { t: 'p != q', f: (p, q) => p !== q }, { t: 'p == q', f: (p, q) => p === q }, { t: 'not (p or q)', f: (p, q) => !(p || q) }
      ];
      const [f1, f2] = rng.sample(FUN, 2), combos = [[true, true], [true, false], [false, true], [false, false]];
      const tv = b => b ? 'True' : 'False', alts = b => b ? VERD : FALS;
      return {
        tipo: 'tabla', cols: ['p', 'q', '`' + f1.t + '`', '`' + f2.t + '`'],
        filas: combos.map(([p, q]) => [{ t: tv(p) }, { t: tv(q) }, { in: alts(f1.f(p, q)), w: 7 }, { in: alts(f2.f(p, q)), w: 7 }]),
        enunciado: 'Completa la **tabla de verdad**: escribe `True` o `False` en cada celda.',
        pistas: ['Evalúa cada fila por separado, sustituyendo `p` y `q` por sus valores.', '`and` es verdadero solo si ambos lo son; `or` es falso solo si ambos son falsos; `not` invierte.', 'Para `p != q`: es verdadero cuando los dos valores son distintos.'],
        explicacion: 'Se evalúa cada expresión para las cuatro combinaciones de `p` y `q` (S: AP-S3-C1, diap. 5-6).'
      };
    }
  });

  const NAT = [
    { t: 'la nota está **entre 0 y 5, ambos incluidos**', ok: '`0 <= nota <= 5`', m: ['`nota >= 0 or nota <= 5`', '`0 < nota < 5`', '`nota >= 0 and <= 5`'], why: 'Debe cumplirse la cota inferior **y** la superior, incluyendo los extremos.' },
    { t: 'el día **no es sábado ni domingo**', ok: '`dia != "sabado" and dia != "domingo"`', m: ['`dia != "sabado" or dia != "domingo"`', '`dia == "sabado" and dia == "domingo"`', '`dia != "sabado" or "domingo"`'], why: '«Ni… ni» exige que ambas diferencias se cumplan a la vez (`and`). Con `or` sería siempre verdadero.' },
    { t: '`n` es **múltiplo de 3 pero no de 5**', ok: '`n % 3 == 0 and n % 5 != 0`', m: ['`n % 3 == 0 or n % 5 != 0`', '`n % 3 != 0 and n % 5 == 0`', '`n % 15 == 0`'], why: 'Se necesitan las dos cosas a la vez: divisible por 3 **y** no divisible por 5.' },
    { t: '`x` está **fuera del intervalo [10, 20]**', ok: '`x < 10 or x > 20`', m: ['`x < 10 and x > 20`', '`x <= 10 or x >= 20`', '`10 > x > 20`'], why: 'Está fuera si es menor que 10 **o** mayor que 20; un número no puede ser ambas cosas a la vez.' },
    { t: 'la persona **puede entrar si tiene al menos 18 años o lleva permiso**', ok: '`edad >= 18 or permiso`', m: ['`edad > 18 or permiso`', '`edad >= 18 and permiso`', '`edad >= 18 or not permiso`'], why: '«Al menos 18» es `>= 18`; «o» es `or`.' },
    { t: '**exactamente una** de las dos variables lógicas `a` y `b` es verdadera', ok: '`a != b`', m: ['`a and b`', '`a or b`', '`a == b`'], why: 'Distintas significa que una es verdadera y la otra falsa (`or` incluye el caso de ambas verdaderas).' },
    { t: '**ninguno** de los tres números `a`, `b`, `c` es cero', ok: '`a != 0 and b != 0 and c != 0`', m: ['`a != 0 or b != 0 or c != 0`', '`a == 0 and b == 0 and c == 0`', '`a * b * c == 0`'], why: 'Cada uno debe ser distinto de cero a la vez (`and`).' },
    { t: 'el carácter `c` es una **vocal minúscula**', ok: '`c in "aeiou"`', m: ['`c == "a" or "e" or "i" or "o" or "u"`', '`c == "aeiou"`', '`c in "AEIOU"`'], why: '`c == "a" or "e"…` es siempre verdadero porque `"e"` es verdadero por sí solo; hay que repetir `c ==` o usar `in`.' }
  ];
  B({
    id: 'n14-natural', n: 14, e: 'A', dif: 2, c: ['cd_bool', 'cd_anid'], tema: 'Del lenguaje natural a la condición',
    gen(rng, K) {
      const it = rng.pick(NAT);
      return Object.assign(K.mc(rng, 'Elige la condición de Python que expresa: ' + it.t + '.', [[it.ok, it.why]], it.m.map(x => [x, 'No expresa lo pedido.'])), {
        pistas: ['Traduce cada parte a una comparación y decide cómo se unen: `and` (todas), `or` (basta una).', 'En una comparación hay que repetir la variable: `nota >= 3 and nota <= 5`, no `nota >= 3 and <= 5`.', 'Prueba la condición con un valor que debería cumplirla y con otro que no.'], explicacion: it.why
      });
    }
  });

  H.clasif('n14-clasif-estructura', 14, 'A', 2, ['cd_if', 'cd_anid'], 'Elegir la estructura condicional', 'Para cada situación, elige la estructura: **if** (camino opcional), **if-else** (dos caminos), **if-elif-else** (varios caminos excluyentes) u **operador ternario** (elegir un valor).', ['if', 'if-else', 'if-elif-else', 'operador ternario'], [
    ['Imprimir una advertencia solo si la temperatura supera 40 °C', 'if', 'Hay un único camino opcional: si no se cumple, no se hace nada.'], ['Decidir si una persona es «mayor» o «menor» de edad e imprimirlo', 'if-else', 'Exactamente dos caminos: uno u otro.'],
    ['Asignar la letra A, B, C, D o F según el rango de la nota', 'if-elif-else', 'Varios rangos excluyentes: se clasifica de arriba hacia abajo.'], ['`estado = "mayor" if edad >= 18 else "menor"`, en una sola línea', 'operador ternario', 'Se elige entre dos valores en una asignación simple.'],
    ['Sumar un recargo solo cuando el cliente no es socio', 'if', 'El recargo es opcional.'], ['Elegir la tarifa: niño, adulto o jubilado', 'if-elif-else', 'Tres categorías excluyentes.'],
    ['Escoger entre `"par"` e `"impar"` al construir una cadena', 'operador ternario', 'Dos valores posibles dentro de una expresión.'], ['Aprobar o reprobar un examen según el puntaje mínimo', 'if-else', 'Dos resultados posibles.']
  ], ['¿Cuántos caminos distintos hay? Uno opcional → `if`; dos → `if-else`; varios excluyentes → `elif`.', 'Si solo se elige un **valor** para una variable, piensa en el ternario.', 'En `if-elif-else` se ejecuta solo el primer bloque verdadero.'], 'if: camino opcional. if-else: dos caminos. if-elif-else: varios caminos excluyentes, se evalúa de arriba hacia abajo. Ternario: elige un valor en una expresión (AP-S3-C1, diap. 7-13).');

  B({
    id: 'n14-if-seguidos', n: 14, e: 'A', dif: 2, c: ['cd_if'], tema: 'if seguidos frente a if-elif',
    gen(rng, K) {
      const x = rng.int(1, 20), t1 = rng.int(3, 12), t2 = rng.int(3, 12), conElif = rng.chance(0.5);
      const code = dd(`
        x = ${x}
        if x > ${t1}:
            print("A")
        ${conElif ? 'elif' : 'if'} x > ${t2}:
            print("B")
        else:
            print("C")
      `);
      const esp = K.run(code);
      return {
        tipo: 'salida', multilinea: true, filas: 2, enunciado: '¿Qué imprime este programa? (una línea por cada `print` que se ejecute)', codigoVista: code, esperado: esp, stdout: true,
        pistas: [conElif ? 'Es un `if-elif-else`: solo se ejecuta el primer bloque cuya condición es verdadera.' : 'Son **dos** estructuras: un `if` solo y, aparte, un `if-else`. Cada una se evalúa por su cuenta.', 'Evalúa `x > ' + t1 + '` y `x > ' + t2 + '` con x = ' + x + '.', 'Anota qué `print` se ejecutan, en orden.'],
        explicacion: 'Con x = ' + x + ': `x > ' + t1 + '` es ' + (x > t1 ? 'verdadero' : 'falso') + ' y `x > ' + t2 + '` es ' + (x > t2 ? 'verdadero' : 'falso') + '. ' + (conElif ? 'Como es `if-elif-else`, solo corre el primer bloque verdadero.' : 'Como son dos estructuras independientes, ambas se evalúan.') + '\n\nSalida:\n```\n' + esp + '\n```'
      };
    }
  });

  B({
    id: 'n14-elif-salida', n: 14, e: 'B', dif: 3, c: ['cd_if'], tema: 'Salida de un if-elif-else',
    gen(rng, K) {
      const c1 = rng.int(8, 14), c2 = rng.int(c1 + 2, 20), c3 = rng.int(c2 + 8, 70), etq = rng.pick([['invalida', 'nino', 'joven', 'adulto', 'mayor'], ['invalida', 'baja', 'media', 'alta', 'extrema']]);
      const entradas = rng.shuffle([-1, c1 - 1, c1, c2 - 1, c2, c3 - 1, c3, c3 + 5]).slice(0, 4);
      const code = dd(`
        def categoria(x):
            if x < 0:
                return "${etq[0]}"
            elif x < ${c1}:
                return "${etq[1]}"
            elif x < ${c2}:
                return "${etq[2]}"
            elif x < ${c3}:
                return "${etq[3]}"
            else:
                return "${etq[4]}"

            for v in ${lst(entradas)}:
                print(v, categoria(v))
      `).replace(/\n\s+for v in/, '\nfor v in').replace(/\n\s+print\(v, categoria\(v\)\)/, '\n    print(v, categoria(v))');
      const esp = K.run(code);
      return {
        tipo: 'salida', multilinea: true, filas: 4, enunciado: '¿Qué imprime este programa? (una línea por cada valor)', codigoVista: code, esperado: esp, stdout: true,
        pistas: ['Para cada valor, recorre las condiciones de arriba hacia abajo y detente en la **primera verdadera**.', 'Cuidado con los límites: `x < ' + c1 + '` es falso cuando x vale exactamente ' + c1 + '.', '`print(v, categoria(v))` muestra el valor y luego la etiqueta, separados por un espacio.'],
        explicacion: 'Cada valor cae en el primer tramo cuya condición se cumple. Salida:\n```\n' + esp + '\n```'
      };
    }
  });

  const ELIF_ESC = [
    { v: 'nota', f: 4.8, a: ['>= 3.0', '>= 4.5'], p: ['Aprobado', 'Excelente'], lit: 'imprime «Aprobado» con nota = 4.8 en lugar de «Excelente»' },
    { v: 'puntaje', f: 95, a: ['>= 60', '>= 90'], p: ['Regular', 'Sobresaliente'], lit: 'imprime «Regular» con puntaje = 95 en lugar de «Sobresaliente»' },
    { v: 'edad', f: 70, a: ['>= 18', '>= 65'], p: ['Adulto', 'Adulto mayor'], lit: 'imprime «Adulto» con edad = 70 en lugar de «Adulto mayor»' }
  ];
  B({
    id: 'n14-elif-orden', n: 14, e: 'B', dif: 3, c: ['cd_if', 'cd_anid'], tema: 'El orden de los elif',
    gen(rng, K) {
      const s = rng.pick(ELIF_ESC);
      const code = dd(`
        if ${s.v} ${s.a[0]}:
            print("${s.p[0]}")
        elif ${s.v} ${s.a[1]}:
            print("${s.p[1]}")
        else:
            print("Otro")
      `);
      return Object.assign(K.mc(rng, 'Este código ' + s.lit + '. ¿Cuál es la **corrección**?', [['Poner primero la condición más restrictiva (`' + s.v + ' ' + s.a[1] + '`) y después la más general', 'Gana la primera condición verdadera: la más específica debe ir antes.']], [
        ['Cambiar `elif` por `if` en la segunda condición', 'Con dos `if` se imprimirían ambos mensajes cuando se cumplen las dos condiciones.'], ['Cambiar `' + s.a[0].split(' ')[0] + '` por `>` en la primera condición', 'No resuelve el solapamiento: 4.8 sigue cumpliendo la primera condición.'], ['Agregar un `else` al final', 'Ya existe un `else`, y no se alcanza antes que las condiciones anteriores.']]), {
        codigoVista: code, pistas: ['Con ' + s.v + ' = ' + s.f + ' se cumplen **las dos** condiciones; ¿cuál se evalúa primero?', 'En `if-elif`, la primera condición verdadera ejecuta su bloque y el resto se ignora.', 'Ordena de la condición más restrictiva a la más general.'],
        explicacion: 'Con ' + s.v + ' = ' + s.f + ' ambas condiciones son verdaderas, pero solo se ejecuta la primera. Hay que evaluar antes la más restrictiva (`' + s.v + ' ' + s.a[1] + '`).'
      });
    }
  });

  H.clasif('n14-errores', 14, 'B', 3, ['cd_anid', 'cd_if'], 'Errores típicos con condicionales', 'Cada fragmento tiene un error típico. Clasifícalo.', ['`=` en vez de `==`', 'Falta repetir la variable', 'Orden incorrecto de los `elif`', 'Sangría incorrecta', 'Caso no contemplado'], [
    ['`if edad = 18:`', '`=` en vez de `==`', '`=` asigna; para comparar se usa `==`.'], ['`if n = 0:`', '`=` en vez de `==`', 'Falta el segundo `=` de la comparación.'],
    ['`if nota >= 3 and <= 5:`', 'Falta repetir la variable', 'Debe ser `nota >= 3 and nota <= 5` (o `3 <= nota <= 5`).'], ['`if edad > 12 or < 18:`', 'Falta repetir la variable', 'Cada comparación necesita su variable.'],
    ['`if nota >= 3.0:` seguido de `elif nota >= 4.5:` (el segundo bloque nunca se ejecuta)', 'Orden incorrecto de los `elif`', 'La condición más restrictiva debe ir primero.'], ['`if edad >= 18:` y luego `elif edad >= 65:`, donde nunca sale «jubilado»', 'Orden incorrecto de los `elif`', 'Quien cumple `>= 65` ya cumplió `>= 18` en la primera.'],
    ['El `print` que debe ir dentro del `if` está escrito sin sangría debajo de él', 'Sangría incorrecta', 'Sin sangría, el `print` se ejecuta siempre.'], ['El cuerpo de un `else` está en la misma columna que el propio `else`', 'Sangría incorrecta', 'El cuerpo de un bloque debe ir indentado.'],
    ['Un clasificador de notas que no dice nada para 7.5 ni para −2', 'Caso no contemplado', 'Falta el caso de nota inválida.'], ['`signo(n)` con `if n > 0` y `elif n < 0` que devuelve `None` cuando n vale 0', 'Caso no contemplado', 'Falta el caso `n == 0`.']
  ], ['`=` asigna y `==` compara.', 'En cada comparación debe aparecer la variable: `x > 3 and x < 9`.', 'Ordena los `elif` de lo más específico a lo más general y piensa si falta algún caso (inválido, cero, vacío…).'], 'Errores frecuentes (AP-S3-C1, diap. 12-13): `=` por `==`; omitir la variable en la segunda comparación; mal orden de los `elif`; sangría incorrecta; olvidar casos extremos o inválidos.', 5);

  B({
    id: 'n14-ternario', n: 14, e: 'B', dif: 3, c: ['cd_anid'], tema: 'Salida con operador ternario',
    gen(rng, K) {
      const x = rng.int(0, 12), y = rng.int(0, 12), t1 = rng.int(5, 9), t2 = rng.int(2, t1 - 1), valores = rng.sample([0, 1, 3, 4, 6, 8, 10, 12], 3);
      const code = dd(`
        def etiqueta(n):
            return "par" if n % 2 == 0 else "impar"

        x = ${x}
        y = ${y}
        mayor = x if x >= y else y
        print(etiqueta(x), etiqueta(y), mayor)
        for v in ${lst(valores)}:
            r = "alto" if v > ${t1} else "medio" if v > ${t2} else "bajo"
            print(v, r)
      `);
      const esp = K.run(code);
      return {
        tipo: 'salida', multilinea: true, filas: 4, enunciado: '¿Qué imprime este programa? (`valor_si_verdadero if condición else valor_si_falso`)', codigoVista: code, esperado: esp, stdout: true,
        pistas: ['En `A if cond else B`, primero se evalúa `cond`: si es verdadera el resultado es `A`, si no `B`.', 'El ternario encadenado `A if c1 else B if c2 else C` se lee como `A if c1 else (B if c2 else C)`.', 'Hay una línea de salida para `x`/`y` y una por cada valor de la lista.'],
        explicacion: 'Salida:\n```\n' + esp + '\n```'
      };
    }
  });

  const EQUIV = [
    { code: 'if edad >= 18:\n    if tiene_licencia:\n        print("puede conducir")', ok: '`if edad >= 18 and tiene_licencia:`', m: ['`if edad >= 18 or tiene_licencia:`', '`if edad >= 18 and not tiene_licencia:`', '`if edad >= 18 or not tiene_licencia:`'], why: 'El `print` se ejecuta solo si se cumplen las dos condiciones: dos `if` anidados equivalen a un `and`.' },
    { code: 'if not (x > 0 and x < 10):\n    print("fuera")', ok: '`if x <= 0 or x >= 10:`', m: ['`if x <= 0 and x >= 10:`', '`if x < 0 or x > 10:`', '`if x > 0 or x < 10:`'], why: 'Ley de De Morgan: la negación de «0 < x < 10» es «x <= 0 o x >= 10».' },
    { code: 'if not (a == b or a == c):\n    print("distinto")', ok: '`if a != b and a != c:`', m: ['`if a != b or a != c:`', '`if a == b and a == c:`', '`if a != b and a == c:`'], why: 'De Morgan: `not (A or B)` equivale a `not A and not B`.' },
    { code: 'if dia == "sabado":\n    print("descanso")\nelif dia == "domingo":\n    print("descanso")\nelse:\n    print("trabajo")', ok: '`if dia == "sabado" or dia == "domingo":` con `print("descanso")`, y `else` con `print("trabajo")`', m: ['`if dia == "sabado" and dia == "domingo":` con `print("descanso")`, y `else` con `print("trabajo")`', '`if dia == "sabado" or "domingo":` con `print("descanso")`, y `else` con `print("trabajo")`', '`if dia != "sabado" or dia != "domingo":` con `print("descanso")`, y `else` con `print("trabajo")`'], why: 'Dos ramas con el mismo resultado se unen con `or`. Ojo: `dia == "sabado" or "domingo"` es siempre verdadero porque `"domingo"` es una cadena no vacía.' }
  ];
  B({
    id: 'n14-equivalencia', n: 14, e: 'B', dif: 3, c: ['cd_anid', 'cd_bool'], tema: 'Aplanar condiciones equivalentes',
    gen(rng, K) {
      const it = rng.pick(EQUIV);
      return Object.assign(K.mc(rng, 'Elige la versión **equivalente** a este código:', [[it.ok, it.why]], it.m.map(x => [x, 'No es equivalente.'])), {
        codigoVista: it.code, pistas: ['Escribe una tabla de verdad con los casos posibles y compara qué hace cada versión.', 'Dos `if` anidados equivalen a un `and`; dos ramas con el mismo resultado se pueden unir con un `or`.', 'Ley de De Morgan: `not (A and B)` = `not A or not B`; `not (A or B)` = `not A and not B`.'], explicacion: it.why
      });
    }
  });

  B({
    id: 'n14-anidado-salida', n: 14, e: 'B', dif: 3, c: ['cd_anid', 'cd_if'], tema: 'Salida con condicionales anidados',
    gen(rng, K) {
      const esAnio = rng.chance(0.5);
      let code, expl;
      if (esAnio) {
        const anios = rng.shuffle([1900, 2000, 2024, 2023, 2100, 2400, 1996, 2026]).slice(0, 4);
        code = dd(`
          def tipo_anio(anio):
              if anio % 4 == 0:
                  if anio % 100 == 0:
                      if anio % 400 == 0:
                          return "bisiesto"
                      else:
                          return "no bisiesto"
                  else:
                      return "bisiesto"
              else:
                  return "no bisiesto"

          for a in ${lst(anios)}:
              print(a, tipo_anio(a))
        `);
        expl = 'Un año es bisiesto si es múltiplo de 4 y no de 100, o si es múltiplo de 400.';
      } else {
        const lim = rng.pick([60, 65]), pares = rng.sample([[lim + 5, true], [lim + 5, false], [lim - 10, true], [lim - 10, false], [lim, true], [lim - 1, false]], 4);
        const d = rng.pick([[50, 30, 20, 0], [40, 25, 10, 0]]);
        code = dd(`
          def descuento(edad, es_socio):
              if edad >= ${lim}:
                  if es_socio:
                      return ${d[0]}
                  else:
                      return ${d[1]}
              else:
                  if es_socio:
                      return ${d[2]}
                  else:
                      return ${d[3]}
        `) + '\n\n' + pares.map(([e, s]) => 'print(descuento(' + e + ', ' + (s ? 'True' : 'False') + '))').join('\n');
        expl = 'Primero se decide por la edad (`>= ' + lim + '`) y, dentro de cada rama, por la condición de socio.';
      }
      const esp = K.run(code);
      return {
        tipo: 'salida', multilinea: true, filas: 4, enunciado: '¿Qué imprime este programa? (una línea por cada `print`)', codigoVista: code, esperado: esp, stdout: true,
        pistas: ['Sigue cada llamada por el camino de condiciones, de afuera hacia adentro.', 'Un `else` se refiere al `if` de su misma sangría.', 'Anota la rama que se toma en cada nivel.'], explicacion: expl + '\n\nSalida:\n```\n' + esp + '\n```'
      };
    }
  });

  /* ---------- ejercicios de código del nivel 14 ---------- */
  B({
    id: 'n14-impl-bisiesto', n: 14, e: 'B', dif: 2, c: ['cd_anid', 'cd_bool'], tema: 'Año bisiesto',
    gen() {
      const sol = dd(`
        def es_bisiesto(anio):
            return (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `es_bisiesto(anio)` que devuelva `True` si el año es **bisiesto** y `False` si no. Un año es bisiesto si es múltiplo de 4, **excepto** los múltiplos de 100, que solo lo son si también son múltiplos de 400. Puedes hacerlo con condicionales anidados o con una sola expresión booleana.', starter: 'def es_bisiesto(anio):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['es_bisiesto(2024)', 'es_bisiesto(2023)', 'es_bisiesto(1900)', 'es_bisiesto(2000)', 'es_bisiesto(2100)', 'es_bisiesto(2400)', 'es_bisiesto(1996)', 'es_bisiesto(1)'], fn: 'es_bisiesto', ejemplo: 'es_bisiesto(2024)'
      });
      q.pistas = ['Tres casos: múltiplo de 400 → bisiesto; múltiplo de 100 (y no de 400) → no; múltiplo de 4 → sí.', 'Aplanado: `(anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0`.', 'Prueba con 1900 (no), 2000 (sí), 2024 (sí) y 2023 (no).'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```';
      return q;
    }
  });

  B({
    id: 'n14-impl-clasificar', n: 14, e: 'B', dif: 3, c: ['cd_if', 'cd_anid'], tema: 'Clasificar una nota con caso inválido',
    gen(rng) {
      const exc = rng.pick(['4.5', '4.6', '4.0']), apr = rng.pick(['3.0', '3.5', '2.5']);
      const sol = dd(`
        def clasificar_nota(nota):
            if nota < 0 or nota > 5:
                return "Nota invalida"
            elif nota >= ${exc}:
                return "Excelente"
            elif nota >= ${apr}:
                return "Aprobado"
            else:
                return "Reprobado"
      `);
      const f = x => (+x).toFixed(1), tests = [-0.1, 0, 5, 5.1, +exc, +exc - 0.1, +apr, +apr - 0.1, 4.8, 1.2].map(x => 'clasificar_nota(' + f(x) + ')');
      const q = PQ.codigoQ({
        enun: 'Escribe `clasificar_nota(nota)` que devuelva: `"Nota invalida"` si `nota` es menor que 0 o mayor que 5; `"Excelente"` si `nota >= ' + exc + '`; `"Aprobado"` si `nota >= ' + apr + '`; y `"Reprobado"` en los demás casos. Cuida el **orden** de las condiciones y el caso inválido.', starter: 'def clasificar_nota(nota):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests, fn: 'clasificar_nota', ejemplo: 'clasificar_nota(4.8)'
      });
      q.pistas = ['El caso inválido va **primero**: así 5.1 no se confunde con «Excelente».', 'Después, las condiciones de la más restrictiva (`>= ' + exc + '`) a la más general (`>= ' + apr + '`).', 'Termina con un `else` para «Reprobado».'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```';
      return q;
    }
  });

  B({
    id: 'n14-impl-triangulo', n: 14, e: 'C', dif: 3, c: ['cd_anid', 'cd_if', 'cd_bool'], tema: 'Tipo de triángulo',
    gen() {
      const sol = dd(`
        def tipo_triangulo(a, b, c):
            if a <= 0 or b <= 0 or c <= 0 or a + b <= c or a + c <= b or b + c <= a:
                return "invalido"
            if a == b == c:
                return "equilatero"
            if a == b or b == c or a == c:
                return "isosceles"
            return "escaleno"
      `);
      const q = PQ.codigoQ({
        enun: 'Escribe `tipo_triangulo(a, b, c)` con los tres lados (números enteros). Devuelve `"invalido"` si algún lado no es positivo o si no se cumple la **desigualdad triangular** (cada lado debe ser **menor** que la suma de los otros dos; si es igual, el triángulo es degenerado y también es inválido); si es válido, `"equilatero"` (tres lados iguales), `"isosceles"` (exactamente dos iguales) o `"escaleno"` (los tres distintos).', starter: 'def tipo_triangulo(a, b, c):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['tipo_triangulo(3, 3, 3)', 'tipo_triangulo(3, 3, 5)', 'tipo_triangulo(3, 4, 5)', 'tipo_triangulo(1, 2, 3)', 'tipo_triangulo(0, 1, 1)', 'tipo_triangulo(2, 2, 4)', 'tipo_triangulo(5, 5, 8)', 'tipo_triangulo(-1, 2, 2)', 'tipo_triangulo(7, 10, 5)', 'tipo_triangulo(5, 3, 5)'], fn: 'tipo_triangulo', ejemplo: 'tipo_triangulo(3, 4, 5)'
      });
      q.pistas = ['Primero descarta lo inválido: lados no positivos o `a + b <= c` (y las otras dos combinaciones).', 'Luego, de lo más específico a lo más general: equilátero, isósceles, escaleno.', 'Un triángulo equilátero también tiene dos lados iguales: comprueba el equilátero **antes** que el isósceles.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```';
      return q;
    }
  });

  B({
    id: 'n14-impl-etiqueta', n: 14, e: 'B', dif: 3, c: ['cd_if', 'cd_bool'], tema: 'Múltiplos con prioridad',
    gen(rng) {
      const [p, q2] = rng.pick([[3, 5], [2, 3], [3, 4], [2, 5]]);
      const sol = dd(`
        def etiqueta(n):
            if n % ${p} == 0 and n % ${q2} == 0:
                return "TicTac"
            elif n % ${p} == 0:
                return "Tic"
            elif n % ${q2} == 0:
                return "Tac"
            else:
                return str(n)
      `);
      const ns = [1, p, q2, p * q2, p * q2 * 2, p + 1, q2 + 1, 7, 0, p * 3].map(x => 'etiqueta(' + x + ')');
      const q = PQ.codigoQ({
        enun: 'Escribe `etiqueta(n)` que devuelva el texto `"TicTac"` si `n` es múltiplo de **' + p + ' y de ' + q2 + '**; `"Tic"` si es múltiplo de ' + p + ' (pero no de ' + q2 + '); `"Tac"` si es múltiplo de ' + q2 + ' (pero no de ' + p + '); y en cualquier otro caso el número convertido a texto con `str(n)`. Cuida el **orden** de las condiciones.', starter: 'def etiqueta(n):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ns, fn: 'etiqueta', ejemplo: 'etiqueta(' + p + ')'
      });
      q.pistas = ['El caso «múltiplo de los dos» debe ir **primero**: si no, nunca se alcanzaría.', 'Un número es múltiplo de `k` si `n % k == 0`.', 'El último caso devuelve `str(n)`.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```';
      return q;
    }
  });

  /* =====================================================================================================================================
     NIVEL 7 · Árbol rojo-negro con figura y animación (complementa banco_biblioteca.js)
     ===================================================================================================================================== */
  const copiaRN = p => p ? { id: p.id, v: p.v, c: p.c, l: copiaRN(p.l), r: copiaRN(p.r) } : null;
  const nodosRN = p => p ? [p].concat(nodosRN(p.l), nodosRN(p.r)) : [];
  const tiposErrRN = p => { const s = new Set(); Sim.rn.valida(p).errores.forEach(e => s.add(/raíz/.test(e) ? 'raiz' : (/dos rojos/.test(e) ? 'rojos' : 'altura'))); return s; };
  const preRN = (p, out) => { if (!p) return out; out.push(p.v + (p.c === 'n' ? 'N' : 'R')); preRN(p.l, out); preRN(p.r, out); return out; };
  /** figura del árbol; el estado «✔ válido / ✖ error» del simulador se omite cuando sería la respuesta, y el título (que en un árbol pequeño se corta) también */
  const figRN = (m, titulo, conEstado) => { const f = Sim.rn.cuadro(m, ''); f.items = f.items.filter(i => i.id !== 'titulo' && (conEstado || i.id !== 'estado')); return H.fig(f, titulo); };
  const arbolRN = (rng, n) => Sim.rn.desde(rng.distinct(n, 5, 95));

  B({
    id: 'n7-rn-fig-valido', n: 7, e: 'B', dif: 3, c: ['rn_def'], tema: 'Validar un árbol rojo-negro dibujado',
    gen(rng, K) {
      const m = arbolRN(rng, rng.int(6, 9)), quiere = rng.pick(['ok', 'ok', 'raiz', 'otro', 'otro']);
      let p = copiaRN(m.raiz);
      if (quiere === 'raiz') p.c = p.c === 'n' ? 'r' : 'n';
      else if (quiere === 'otro') { const ns = nodosRN(p), k = rng.int(1, 2); rng.sample(ns, k).forEach(x => { x.c = x.c === 'n' ? 'r' : 'n'; }); }
      const err = tiposErrRN(p), val = Sim.rn.valida(p);
      const O = {
        raiz: 'La **raíz es roja** (debe ser negra)', rojos: 'Hay **dos nodos rojos seguidos** (un padre rojo con un hijo rojo)',
        altura: 'Los caminos hasta NIL tienen **distinta cantidad de nodos negros** (altura negra)', ninguna: '**Ninguna**: el árbol cumple todas las reglas'
      };
      const claves = err.size ? ['raiz', 'rojos', 'altura'].filter(k => err.has(k)) : ['ninguna'];
      const buenas = claves.map(k => [O[k], 'Se comprueba en la figura.']), malas = Object.keys(O).filter(k => !claves.includes(k)).map(k => [O[k], 'No se viola esta regla (o el árbol es válido).']);
      return Object.assign(K.mc(rng, 'Observa el árbol de la figura (**rojo** = rojo, **oscuro** = negro; los hijos ausentes son NIL y cuentan como negros). Marca **todas** las reglas del rojo-negro que se **violan**; si las cumple todas, marca «Ninguna».', buenas, malas), {
        multi: true, figura: figRN(m && { raiz: p, sigId: m.sigId }, 'Árbol coloreado'),
        pistas: ['Las reglas: la raíz es negra; un nodo rojo no tiene hijos rojos; todos los caminos hasta NIL tienen los mismos nodos negros.', 'Mira primero el color de la raíz y luego busca una pareja padre-hijo ambos rojos.', 'Para la altura negra cuenta los nodos negros (incluido el NIL final) en un camino corto y en uno largo.'],
        explicacion: err.size ? 'Violaciones: ' + val.errores.join('; ') + '.' : 'Es válido: raíz negra, sin rojos seguidos y altura negra = ' + val.bh + ' en todos los caminos (contando NIL).'
      });
    }
  });

  const CAT_INS = { 'caso 3 (tío rojo)': 'c3', 'caso 1 (zigzag)': 'c1', 'caso 2 (recta)': 'c2' };
  B({
    id: 'n7-rn-fig-ins-caso', n: 7, e: 'B', dif: 3, c: ['rn_ins'], tema: 'Primer caso al insertar en un rojo-negro',
    gen(rng, K) {
      const objetivo = rng.pick(['ninguno', 'c1', 'c2', 'c3', 'c3', 'c2']); let sel = null, resp = null;
      for (let t = 0; t < 10 && !sel; t++) {
        const vals = rng.distinct(rng.int(6, 9), 5, 95), m = Sim.rn.desde(vals), usados = new Set(vals);
        const cand = rng.sample(Array.from({ length: 95 }, (_, i) => i + 3).filter(x => !usados.has(x)), 25);
        for (const v of cand) {
          const r = Sim.rn.insertar(m, v), cat = r.casos.length ? CAT_INS[r.casos[0]] : 'ninguno';
          if (!resp) resp = { m, v, r, cat };
          if (cat === objetivo) { sel = { m, v, r, cat }; break; }
        }
      }
      sel = sel || resp;
      const T = {
        ninguno: '**Nada que reparar**: el padre del nodo nuevo es negro (el rojo nuevo no rompe ninguna regla)', c3: '**Caso 3** (tío rojo): recolorear padre y tío a negro y el abuelo a rojo, y seguir desde el abuelo',
        c1: '**Caso 1** (zigzag): rotar el padre para alinear y pasar al caso 2', c2: '**Caso 2** (línea recta): padre a negro, abuelo a rojo y rotar el abuelo'
      };
      const W = { ninguno: 'El padre es negro: no hay dos rojos seguidos.', c3: 'Padre y tío son rojos: solo se recolorea.', c1: 'El tío es negro y el nuevo está en zigzag con su padre y su abuelo.', c2: 'El tío es negro y el nuevo está en línea recta con su padre y su abuelo.' };
      return Object.assign(K.mc(rng, 'Se inserta el valor **' + sel.v + '** en el árbol rojo-negro de la figura (el nodo nuevo entra **rojo**, como en un BST). ¿Qué ocurre **primero** al reparar el árbol?', [[T[sel.cat], W[sel.cat]]], Object.keys(T).filter(k => k !== sel.cat).map(k => [T[k], 'No es lo que ocurre primero con este árbol.'])), {
        figura: figRN(sel.m, 'Árbol antes de insertar ' + sel.v),
        pistas: ['Baja desde la raíz como en un BST hasta ver dónde cuelga el ' + sel.v + ' y de quién es hijo.', 'Mira el color de su **padre**: si es negro, no hay nada que reparar. Si es rojo, mira el color del **tío**.', 'Tío rojo → caso 3; tío negro: zigzag → caso 1, línea recta → caso 2.'],
        explicacion: sel.r.frames.length ? 'Casos aplicados: ' + (sel.r.casos.length ? sel.r.casos.join(' → ') : 'ninguno') + '. Rotaciones: ' + sel.r.rotaciones + '. Mira la animación.' : '',
        sim: H.sim(sel.r.frames, Sim.rn.codigoRN(), 'class ArbolRN', 'insertar ' + sel.v + ' en el rojo-negro')
      });
    }
  });

  const corto = c => c;
  B({
    id: 'n7-rn-fig-del-caso', n: 7, e: 'C', dif: 4, c: ['rn_del'], tema: 'Casos al eliminar en un rojo-negro',
    gen(rng, K) {
      const vals = rng.distinct(rng.int(7, 10), 5, 95), m = Sim.rn.desde(vals), res = new Map();
      vals.forEach(v => { const r = Sim.rn.eliminar(m, v), s = r.casos.length ? r.casos.map(corto).join(' → ') : 'Ninguno de los 4 casos (se quitó un rojo, o un hijo rojo absorbe el negro de más)'; res.set(v, { s, r }); });
      const v = rng.pick(vals), { s: esp, r } = res.get(v);
      const otras = Array.from(new Set(Array.from(res.values()).map(x => x.s))).filter(x => x !== esp);
      const rellenos = ['caso 2 (hermano y sobrinos negros)', 'caso 4 (sobrino lejano rojo)', 'caso 1 (hermano rojo) → caso 2 (hermano y sobrinos negros)', 'caso 3 (sobrino cercano rojo) → caso 4 (sobrino lejano rojo)', 'caso 2 (hermano y sobrinos negros) → caso 2 (hermano y sobrinos negros)'].filter(x => x !== esp && !otras.includes(x));
      const malas = rng.shuffle(otras).concat(rellenos).slice(0, 3);
      return Object.assign(K.mc(rng, 'Se **elimina el ' + v + '** del árbol rojo-negro de la figura. Según el algoritmo de la clase (con sucesor inorden cuando tiene dos hijos), ¿qué casos de reparación del **doble negro** se aplican, en orden?', [[esp, 'Es la secuencia que produce el algoritmo.']], malas.map(x => [x, 'No es la secuencia que se obtiene con este árbol.'])), {
        figura: figRN(m, 'Árbol antes de eliminar ' + v),
        pistas: ['Primero identifica qué nodo desaparece de verdad (el propio ' + v + ' si tiene a lo sumo un hijo; su sucesor si tiene dos) y su color.', 'Si el nodo que desaparece es **rojo**, no hay reparación. Si es negro, queda un doble negro.', 'Mira el color del hermano y de los sobrinos: hermano rojo → caso 1; sobrinos negros → caso 2; cercano rojo → caso 3; lejano rojo → caso 4.'],
        explicacion: 'Casos: ' + esp + '. Rotaciones: ' + r.rotaciones + '. Mira la animación.',
        sim: H.sim(r.frames, Sim.rn.codigoRN(), 'class ArbolRN', 'eliminar ' + v + ' en el rojo-negro')
      });
    }
  });

  B({
    id: 'n7-rn-rotaciones', n: 7, e: 'C', dif: 4, c: ['rn_ins', 'rn_del'], tema: 'Contar las rotaciones',
    gen(rng) {
      const vals = rng.distinct(rng.int(7, 10), 5, 95), m = Sim.rn.desde(vals), inserta = rng.chance(0.5);
      let v, r;
      if (inserta) { const usados = new Set(vals), cand = rng.sample(Array.from({ length: 95 }, (_, i) => i + 3).filter(x => !usados.has(x)), 20); const obj = rng.int(0, 2); let hallado = null; for (const c of cand) { const rr = Sim.rn.insertar(m, c); if (!hallado) hallado = { c, rr }; if (rr.rotaciones === obj) { hallado = { c, rr }; break; } } v = hallado.c; r = hallado.rr; }
      else { v = rng.pick(vals); r = Sim.rn.eliminar(m, v); }
      return {
        tipo: 'salida', fmt: 'Trazado rojo-negro', numerico: true, tol: 0, enunciado: 'En el árbol rojo-negro de la figura se ' + (inserta ? '**inserta** el ' + v : '**elimina** el ' + v) + '. Con el algoritmo de la clase, ¿cuántas **rotaciones** (simples) se realizan en total? (Los recoloreos no cuentan.)', figura: figRN(m, 'Árbol antes de ' + (inserta ? 'insertar ' : 'eliminar ') + v), esperado: String(r.rotaciones), placeholder: 'Número de rotaciones',
        pistas: ['Los recoloreos no son rotaciones. En la inserción: caso 1 → 1 rotación y pasa al caso 2 (otra); caso 2 → 1; caso 3 → ninguna.', 'En la eliminación: caso 1 → 1 rotación; caso 3 → 1 rotación; caso 4 → 1 rotación; caso 2 → ninguna.', 'Una inserción hace como máximo 2 rotaciones; una eliminación, como máximo 3.'],
        explicacion: 'Casos: ' + (r.casos.length ? r.casos.join(' → ') : 'ninguno (solo recoloreo o nada)') + '. Rotaciones: **' + r.rotaciones + '**.',
        sim: H.sim(r.frames, Sim.rn.codigoRN(), 'class ArbolRN', (inserta ? 'insertar ' : 'eliminar ') + v)
      };
    }
  });

  B({
    id: 'n7-rn-preorden', n: 7, e: 'C', dif: 5, c: ['rn_ins', 'rn_def'], tema: 'Insertar una secuencia y leer el árbol con colores',
    gen(rng) {
      const vals = rng.distinct(rng.int(5, 7), 5, 80), m = Sim.rn.desde(vals), tok = preRN(m.raiz, []);
      const ult = Sim.rn.insertar(Sim.rn.desde(vals.slice(0, -1)), vals[vals.length - 1]);
      return {
        tipo: 'salida', fmt: 'Trazado rojo-negro', tokens: true, enunciado: 'Se insertan, **en este orden**, los valores `' + lst(vals) + '` en un árbol rojo-negro **vacío** (nodo nuevo rojo; casos 1, 2 y 3; la raíz siempre negra). Escribe el **recorrido preorden** (raíz, izquierda, derecha) con cada valor seguido de su color: **N** (negro) o **R** (rojo). Ejemplo de formato: `20N 10R 30R`.',
        esperado: tok.join(' '), placeholder: '20N 10R 30R',
        pistas: ['Inserta uno por uno y dibuja el árbol (con colores) después de cada inserción.', 'Si el padre es rojo, mira el tío: rojo → recolorea y sube; negro → rota (caso 1 si hay zigzag, y luego caso 2).', 'Al final repasa las reglas: raíz negra, sin rojos seguidos, igual altura negra.'],
        explicacion: 'Árbol final (preorden con colores): **' + tok.join(' ') + '**. Mira la animación de la última inserción.',
        sim: H.sim(ult.frames, Sim.rn.codigoRN(), 'class ArbolRN', 'última inserción: ' + vals[vals.length - 1])
      };
    }
  });

  B({
    id: 'n7-rn-orden-pasos', n: 7, e: 'B', dif: 3, c: ['rn_ins', 'rn_del'], tema: 'Ordenar pasos del rojo-negro',
    gen(rng) {
      const L = [
        { t: 'insertar un valor en un árbol rojo-negro', items: ['Insertar el valor como en un BST, como hoja', 'Pintar el nodo nuevo de rojo', 'Si el padre es negro, terminar (no hay dos rojos seguidos)', 'Si el padre es rojo, mirar el color del tío y aplicar el caso 1, 2 o 3', 'Pintar la raíz de negro'] },
        { t: 'reparar un doble negro con el hermano rojo (caso 1) y luego el hermano negro con sobrino lejano rojo (caso 4)', items: ['Detectar que el hermano H es rojo', 'Pintar H de negro y el padre P de rojo', 'Rotar P hacia el lado del doble negro', 'Con el nuevo hermano negro y su hijo lejano rojo, H toma el color de P', 'Pintar P y el sobrino lejano de negro y rotar P: el doble negro desaparece'] },
        { t: 'eliminar un nodo con dos hijos en un rojo-negro', items: ['Buscar el nodo y localizar su sucesor inorden (el menor del subárbol derecho)', 'Poner el sucesor en el lugar del nodo, heredando su color', 'Observar el color del nodo que realmente desapareció (el sucesor)', 'Si era rojo, terminar; si era negro, queda un doble negro', 'Reparar el doble negro con los casos 1 a 4'] }
      ];
      const o = rng.pick(L), idx = o.items.map((_, i) => i); let ini = rng.shuffle(idx); if (ini.every((x, i) => x === i)) ini = idx.slice().reverse();
      return { tipo: 'orden', enunciado: 'Ordena los pasos para **' + o.t + '**.', items: o.items, correcto: idx, inicial: ini, pistas: ['Piensa en qué hay que saber antes de decidir el caso.', 'Un recoloreo suele preceder a la rotación en el mismo caso.', 'La corrección de la raíz va al final.'], explicacion: 'Orden correcto: ' + o.items.map((s, i) => (i + 1) + '. ' + s).join(' → ') };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
