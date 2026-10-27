/* banco_ext2.js — preguntas de los niveles 11 (pilas y colas) y 12 (listas enlazadas). */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, Sim = ET.Sim, PQ = ET.PQ, B = ET.Banco.add, H = ET.BancoExt;
  const lst = H.lst, dd = H.dd;

  /* =====================================================================================================================================
     NIVEL 11 · Pilas y colas
     ===================================================================================================================================== */
  H.vf('n11-vf', 11, 'A', 1, ['pc_pila', 'pc_apps', 'pc_mon', 'pc_cola', 'pc_deque', 'pc_circ'], 'Pilas y colas (V/F)', [
    { a: 'En una pila, el acceso a un elemento interno cuesta O(1).', v: false, e: 'Solo el tope es accesible de inmediato; un elemento interno exige desapilar hasta n veces: O(n).', j: ['Para llegar a un elemento interno hay que desapilar los que están encima: O(n).', 'Porque la pila es un arreglo contiguo.', 'Porque el tope siempre está en el índice 0.'] },
    { a: 'Sobre una lista de Python, `append` y `pop()` permiten una pila con apilar y desapilar en O(1).', v: true, e: 'Operan en el extremo derecho (el tope es el final).', j: ['append y pop() trabajan en el extremo final sin desplazar elementos.', 'Porque pop() recorre la lista al revés.', 'Porque la lista de Python es una lista enlazada.'] },
    { a: 'Un contador de aperturas y cierres basta para comprobar que los paréntesis, corchetes y llaves están bien anidados.', v: false, e: 'Acepta por error `([)]`: no detecta el mal anidamiento.', j: ['El contador no recuerda cuál fue la última apertura pendiente; `([)]` termina en 0 pero está mal anidado.', 'Porque el contador no puede contar llaves.', 'Porque la pila siempre usa menos memoria.'] },
    { a: 'La pila monótona resuelve «próximo elemento mayor» en O(n) aunque tenga un while dentro del for.', v: true, e: 'Cada índice se apila una vez y se desapila a lo sumo una vez: 2n operaciones.', j: ['Conteo amortizado: cada índice entra y sale una sola vez.', 'Porque el while nunca se ejecuta.', 'Porque la pila solo guarda un elemento.'] },
    { a: '`lista.pop(0)` cuesta O(1) porque quita el primer elemento.', v: false, e: 'Desplaza todos los demás una posición: O(n).', j: ['Tras quitar el primero hay que correr todos los elementos una casilla a la izquierda.', 'Porque Python optimiza pop(0).', 'Porque la lista está ordenada.'] },
    { a: '`collections.deque` permite insertar y quitar en ambos extremos en O(1).', v: true, e: 'Internamente es una lista de bloques doblemente enlazada.', j: ['Está implementada con bloques enlazados en ambos sentidos, no con un arreglo contiguo.', 'Porque es un arreglo de tamaño fijo.', 'Porque ordena sus elementos.'] },
    { a: 'Acceder por índice `d[i]` dentro de un bucle sobre una deque es O(1) por acceso.', v: false, e: 'El acceso por índice en una deque es O(n).', j: ['Los bloques enlazados no permiten una fórmula de direcciones: hay que recorrerlos.', 'Porque la deque es un arreglo contiguo.', 'Porque la deque está ordenada.'] },
    { a: 'En una cola circular, la cola está llena cuando `tam == capacidad`.', v: true, e: 'Llevar el tamaño elimina la ambigüedad entre vacía y llena.', j: ['Con solo frente y final no se distingue llena de vacía; con tam sí.', 'Porque frente es igual a final.', 'Porque el arreglo se llenó de None.'] },
    { a: 'Una cola de prioridad es una cola FIFO.', v: false, e: 'Sale el elemento más urgente (mayor o menor prioridad), no el más antiguo.', j: ['No importa el orden de llegada: sale el de mayor (o menor) prioridad.', 'Porque tiene un solo extremo.', 'Porque usa un arreglo circular.'] },
    { a: 'Un recorrido BFS usa una cola y un recorrido DFS usa una pila.', v: true, e: 'Cola → anchura; pila → profundidad.', j: ['La cola visita nivel por nivel (primero el más antiguo); la pila vuelve al último pendiente.', 'Ambos usan una cola.', 'DFS usa una cola de prioridad.'] }
  ], ['LIFO: el último en entrar sale primero; FIFO: el primero en entrar sale primero.', 'Todo lo que ocurre en los extremos es O(1); mirar adentro es O(n).', 'Una lista de Python sirve de pila (tope al final) pero es mala cola (pop(0) es O(n)).']);

  B({ id: 'n11-tabla-ops', n: 11, e: 'A', dif: 2, c: ['pc_pila', 'pc_cola'], tema: 'Tabla de operaciones de pila y cola',
    gen() {
      const q = H.tablaCx(['Operación', 'Costo'], [['Pila: `tope` (leer sin quitar)', ['O(1)', '1']], ['Pila: acceso a un elemento interno', ['O(n)', 'n']], ['Cola: `encolar` (con deque)', ['O(1)', '1']], ['Cola con `list`: desencolar con `pop(0)`', ['O(n)', 'n']], ['Cola con `deque`: `popleft()`', ['O(1)', '1']]]);
      return Object.assign(q, { enunciado: 'Completa el costo de cada operación (S3-C2, diap. 7 y S4-C1, diap. 6-8).', pistas: ['Todo lo que ocurre en el tope (pila) o en los extremos (cola) es constante.', 'Mirar adentro obliga a desapilar o desencolar hasta n elementos.', '`list.pop(0)` desplaza todos los elementos: O(n).'], explicacion: 'Pila: tope O(1); interior O(n). Cola: encolar O(1); desencolar O(1) con deque y O(n) con list.pop(0).' });
    } });

  B({ id: 'n11-pila-traza', n: 11, e: 'A', dif: 2, c: ['pc_pila'], tema: 'Traza de una pila',
    gen(rng) {
      const n0 = rng.int(2, 4), ini = rng.distinct(n0, 1, 9), pila = ini.slice(), ops = [], extra = rng.distinct(6, 10, 99); let k = 0;
      for (let i = 0; i < rng.int(5, 7); i++) { if (pila.length < 2 || rng.chance(0.55)) { const x = extra[k++]; ops.push('apilar(' + x + ')'); pila.push(x); } else { ops.push('desapilar()'); pila.pop(); } }
      const m = Sim.pila.nueva(ini), f = Sim.pila.cuadro(m, 'Estado inicial');
      const ult = Sim.pila.nueva(pila.slice(0, -1)); const tope = pila[pila.length - 1];
      return { tipo: 'salida', tokens: true, enunciado: 'La pila de la figura (el **tope** es el elemento de **arriba**). Se ejecutan, en orden: `' + ops.join('`, `') + '`. Escribe el **contenido final** de la pila **de la base al tope**.', figura: H.fig(f, 'Pila inicial (base abajo): ' + lst(ini)), esperado: pila.join(' '), placeholder: 'base … tope',
        pistas: ['`apilar(x)` pone `x` en el tope; `desapilar()` quita el último que entró.', 'Escribe el contenido de la pila después de cada operación.', 'El tope final es **' + tope + '**.'],
        explicacion: 'Contenido final (base → tope): **' + lst(pila) + '**; el tope es **' + tope + '**. LIFO: sale el último que entró.', sim: H.sim(Sim.pila.apilar(ult, tope).frames, Sim.pila.CODIGO, 'class Pila', 'apilar y desapilar') };
    } });

  B({ id: 'n11-cola-traza', n: 11, e: 'B', dif: 2, c: ['pc_cola', 'pc_deque'], tema: 'Traza de una cola o deque',
    gen(rng) {
      const esDeque = rng.chance(0.5), n0 = rng.int(2, 4), ini = rng.distinct(n0, 1, 9), q = ini.slice(), ops = [], extra = rng.distinct(8, 10, 99); let k = 0;
      for (let i = 0; i < rng.int(5, 7); i++) {
        const r = rng.next();
        if (q.length < 2 || r < 0.4) { const x = extra[k++]; ops.push(esDeque ? 'append(' + x + ')' : 'encolar(' + x + ')'); q.push(x); }
        else if (esDeque && r < 0.6) { const x = extra[k++]; ops.push('appendleft(' + x + ')'); q.unshift(x); }
        else if (esDeque && r < 0.75) { ops.push('pop()'); q.pop(); }
        else { ops.push(esDeque ? 'popleft()' : 'desencolar()'); q.shift(); }
      }
      const m = Sim.cola.nueva(ini, { modo: 'deque' }), f = Sim.cola.cuadro(m, 'Estado inicial');
      return { tipo: 'salida', tokens: true, enunciado: 'La ' + (esDeque ? '**deque** `d` (frente a la izquierda)' : '**cola** FIFO (frente a la izquierda)') + ' de la figura. Se ejecutan, en orden: `' + ops.join('`, `') + '`. Escribe el **contenido final** del **frente al final**.', figura: H.fig(f, (esDeque ? 'd' : 'cola') + ' = ' + lst(ini)), esperado: q.join(' '), placeholder: 'frente … final',
        pistas: ['FIFO: se entra por el final y se sale por el frente.', esDeque ? '`appendleft` inserta por el frente; `pop()` quita por el final; `popleft()` por el frente.' : '`desencolar()` quita el **primero** que entró (el del frente).', 'Escribe el contenido después de cada operación.'],
        explicacion: 'Contenido final (frente → final): **' + lst(q) + '**.', sim: H.sim(Sim.cola.encolar(Sim.cola.nueva(ini, { modo: 'deque' }), 99).frames, Sim.cola.COLA_DEQUE, 'cola con deque', 'encolar') };
    } });

  const ESTR_E = [
    ['Deshacer los últimos cambios de un editor (Ctrl+Z).', 'Pila', 'Sale primero lo último que se hizo (LIFO).'], ['Atender peticiones en el orden en que llegaron.', 'Cola', 'FIFO: se atiende primero a quien llegó primero.'],
    ['Comprobar que los paréntesis están bien anidados.', 'Pila', 'Hay que recordar la última apertura pendiente.'], ['Recorrer un grafo nivel por nivel (BFS).', 'Cola', 'La cola visita primero lo más antiguo pendiente.'],
    ['Insertar y quitar por **ambos** extremos en O(1).', 'Deque', 'Es la cola doble: O(1) en los dos extremos.'], ['Un búfer de audio de tamaño fijo reutilizando los huecos.', 'Cola circular', 'Arreglo fijo tratado como anillo.'],
    ['Procesar siempre el evento más urgente, no el más antiguo.', 'Cola de prioridad', 'No es FIFO: sale el de mayor prioridad (heap).'], ['Recorrer un grafo en profundidad (DFS) de forma iterativa.', 'Pila', 'La pila recuerda a dónde volver.'],
    ['Precargar los próximos lotes mientras la GPU entrena con el actual.', 'Cola', 'La cola desacopla productor y consumidor.']
  ];
  H.clasif('n11-eleccion', 11, 'A', 2, ['pc_pila', 'pc_cola', 'pc_deque', 'pc_circ', 'pc_apps'], 'Elegir pila, cola, deque…', 'Elige la estructura más adecuada para cada situación.', ['Pila', 'Cola', 'Deque', 'Cola circular', 'Cola de prioridad'], ESTR_E, ['Pregunta quién debe salir primero: el último (pila), el primero (cola) o el más urgente (cola de prioridad).', 'Si hay que operar por ambos extremos: deque. Si el tamaño máximo es fijo y se reutilizan los huecos: cola circular.', 'BFS usa cola; DFS usa pila.'], 'Pila = LIFO (deshacer, paréntesis, DFS). Cola = FIFO (peticiones, BFS, búferes). Deque = ambos extremos. Circular = búfer fijo. Prioridad = el más urgente (heap).');

  const SIMB = [['([]{})', true], ['([)]', false], ['((', false], ['())', false], ['{[()()]}', true], ['()[]{}', true], ['{(})', false], ['[({})]', true], ['(((]]]', false], ['[(])', false], ['{{}}', true], ['(()', false]];
  const balanceado = t => { const p = [], m = { ')': '(', ']': '[', '}': '{' }; for (const c of t) { if ('([{'.includes(c)) p.push(c); else if (')]}'.includes(c)) { if (!p.length || p.pop() !== m[c]) return false; } } return !p.length; };
  const contador = t => { let n = 0; for (const c of t) { if ('([{'.includes(c)) n++; else if (')]}'.includes(c)) { n--; if (n < 0) return false; } } return n === 0; };
  B({ id: 'n11-balanceo-clasif', n: 11, e: 'B', dif: 3, c: ['pc_apps'], tema: 'Balanceo de símbolos',
    gen(rng) {
      const ss = rng.sample(SIMB.map(s => s[0]), 5);
      const categorias = ['Balanceado', 'No balanceado'];
      return { tipo: 'clasificar', enunciado: 'Con el algoritmo de la **pila** (se apila cada apertura; cada cierre debe coincidir con el tope), decide si cada texto está **balanceado y bien anidado**.', categorias,
        items: ss.map(t => ({ t: '`' + t + '`', cat: balanceado(t) ? 0 : 1, why: balanceado(t) ? 'Cada cierre coincide con la última apertura pendiente y la pila queda vacía.' : (contador(t) ? 'Un contador lo aceptaría por error (termina en 0), pero la pila detecta que un cierre no coincide con el tope.' : 'Hay un cierre sin apertura o aperturas que quedan sin cerrar.') })),
        pistas: ['Simula la pila: apila cada `(`, `[`, `{`; ante un cierre, el tope debe ser su pareja.', 'Si un cierre llega con la pila vacía o no coincide con el tope, no está balanceado.', 'Al final la pila debe quedar vacía.'], explicacion: 'Una pila resuelve el balanceo porque lo que importa es cuál fue la última apertura pendiente; un contador no basta.',
        sim: H.sim(Sim.pila.balanceo(ss[0]).frames, Sim.pila.BAL_COD, 'balanceado(texto)', 'balanceo con una pila') };
    } });

  B({ id: 'n11-balanceo-contador', n: 11, e: 'C', dif: 3, c: ['pc_apps'], tema: 'Lo que el contador acepta por error',
    gen(rng, K) {
      const malos = SIMB.filter(s => !s[1] && contador(s[0])).map(s => s[0]), otros = SIMB.filter(s => !contador(s[0])).map(s => s[0]);
      const buenos = rng.sample(malos.length ? malos : ['([)]'], Math.min(2, malos.length || 1)), resto = rng.sample(otros, 3).concat(rng.sample(SIMB.filter(s => s[1]).map(s => s[0]), 1));
      const opc = buenos.map(t => ({ t: '`' + t + '`', ok: true, why: 'Mal anidado, pero el contador termina en 0 y lo acepta.' })).concat(resto.map(t => ({ t: '`' + t + '`', ok: false, why: balanceado(t) ? 'Está bien balanceado: no es un error del contador.' : 'El contador también lo rechaza (cierre de más o aperturas sin cerrar).' })));
      return { tipo: 'opcion', multi: true, enunciado: 'Un **contador** (+1 al abrir, −1 al cerrar, debe terminar en 0 sin bajar de 0) **acepta por error** algunos textos mal anidados. Marca **todos** los textos que están **mal anidados** pero el contador **acepta**.', opciones: rng.shuffle(opc),
        pistas: ['Busca textos donde las aperturas y los cierres estén en igual número pero **no coincidan** entre sí.', 'Un cierre que no corresponde a la última apertura se cuenta igual que uno correcto.', 'Los textos con un cierre de más o con aperturas sin cerrar ya los rechaza el contador.'], explicacion: 'El contador solo sabe **cuántos** símbolos hay abiertos, no **cuáles**: `([)]` queda en 0 aunque el `)` cierre un `[`.' };
    } });

  B({ id: 'n11-balanceo-impl', n: 11, e: 'C', dif: 3, c: ['pc_apps'], tema: 'Implementar el balanceo',
    gen() {
      const sol = dd(`
        def balanceado(texto):
            pila = []
            pares = {")": "(", "]": "[", "}": "{"}
            for c in texto:
                if c in "([{":
                    pila.append(c)
                elif c in ")]}":
                    if not pila or pila.pop() != pares[c]:
                        return False
            return len(pila) == 0
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `balanceado(texto)` que devuelva `True` si los paréntesis `()`, corchetes `[]` y llaves `{}` de `texto` están **balanceados y bien anidados** (ignora los demás caracteres) y `False` en caso contrario. Usa una **pila** (una lista de Python con `append` y `pop()`).', starter: 'def balanceado(texto):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['balanceado("([]{})")', 'balanceado("([)]")', 'balanceado("((")', 'balanceado("())")', 'balanceado("")', 'balanceado("a(b[c]{d})e")', 'balanceado("{[()()]}")', 'balanceado(")(")'], fn: 'balanceado', ejemplo: 'balanceado("([])")' });
      q.pistas = ['Apila cada apertura; ante un cierre, compara con el tope y desapila.', 'Antes de desapilar comprueba que la pila no esté vacía.', 'Al final, la pila debe estar vacía.'];
      q.explicacion = 'Solución con pila:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n11-monotona-traza', n: 11, e: 'B', dif: 3, c: ['pc_mon'], tema: 'Traza de la pila monótona',
    gen(rng, K) {
      const n = rng.int(7, 9), T = Array.from({ length: n }, () => rng.int(1, 9)), r = Sim.pila.monotona(T);
      const code = dd(`
        def dias_hasta_mas_calor(T):
            n = len(T)
            D = [0] * n
            pila = []
            for i in range(n):
                while pila and T[pila[-1]] < T[i]:
                    k = pila.pop()
                    D[k] = i - k
                pila.append(i)
            return D, pila
        print(dias_hasta_mas_calor(${lst(T)}))
      `);
      const esp = K.run(code);
      return { tipo: 'salida', enunciado: 'Para `T = ' + lst(T) + '`, ¿qué imprime este programa? (la pila de **índices** y el arreglo `D` con los días hasta una temperatura **mayor**)', codigoVista: code, esperado: esp, stdout: true, placeholder: '([…], […])',
        pistas: ['La pila guarda índices de días que esperan; al llegar `i`, desapila los de temperatura menor y escribe `D[k] = i − k`.', 'Los días que quedan en la pila nunca encontraron una temperatura mayor (D = 0).', 'Anota la pila después de cada día.'],
        explicacion: 'Resultado: **' + esp + '**. Cada índice se apila una vez y se desapila a lo sumo una vez: **O(n)** amortizado.', sim: H.sim(r.frames, Sim.pila.MON_COD, 'dias_hasta_mas_calor', 'pila monótona') };
    } });

  B({ id: 'n11-monotona-impl', n: 11, e: 'C', dif: 4, c: ['pc_mon'], tema: 'Implementar la pila monótona',
    gen() {
      const sol = dd(`
        def dias_hasta_mas_calor(T):
            n = len(T)
            D = [0] * n
            pila = []
            for i in range(n):
                while pila and T[pila[-1]] < T[i]:
                    k = pila.pop()
                    D[k] = i - k
                pila.append(i)
            return D
      `);
      const lento = dd(`
        def dias_hasta_mas_calor(T):
            D = [0] * len(T)
            for i in range(len(T)):
                for j in range(i + 1, len(T)):
                    if T[j] > T[i]:
                        D[i] = j - i
                        break
            return D
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `dias_hasta_mas_calor(T)`: para cada día `i`, cuántos días faltan hasta una temperatura **mayor** (0 si no la hay). Debe ser **O(n)** con una **pila monótona** de índices.', starter: 'def dias_hasta_mas_calor(T):\n    # complete aquí\n    pass\n', solucion: sol, lento, prelude: '',
        tests: ['dias_hasta_mas_calor([6, 8, 5, 4, 3, 7, 9, 6])', 'dias_hasta_mas_calor([5])', 'dias_hasta_mas_calor([1, 2, 3, 4])', 'dias_hasta_mas_calor([4, 3, 2, 1])', 'dias_hasta_mas_calor([3, 3, 3])', 'dias_hasta_mas_calor([])'], ef: ['dias_hasta_mas_calor(list(range(400, 0, -1)))', 'dias_hasta_mas_calor([5, 1] * 200)'], efDesc: 'dias_hasta_mas_calor con 400 temperaturas  (eficiencia)', fn: 'dias_hasta_mas_calor', ejemplo: 'dias_hasta_mas_calor([6, 8, 5])', factor: 4 });
      q.pistas = ['La pila guarda **índices** (no valores) de los días que aún esperan.', 'Mientras `T[pila[-1]] < T[i]`: `k = pila.pop()` y `D[k] = i - k`.', 'Después de desapilar, apila `i`.'];
      q.explicacion = 'Pila monótona:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n11-monotona-variante', n: 11, e: 'C', dif: 4, c: ['pc_mon'], tema: 'Adaptar la pila monótona',
    gen() {
      const sol = dd(`
        def dias_hasta_mas_frio(T):
            n = len(T)
            D = [0] * n
            pila = []
            for i in range(n):
                while pila and T[pila[-1]] > T[i]:
                    k = pila.pop()
                    D[k] = i - k
                pila.append(i)
            return D
      `);
      const q = PQ.codigoQ({ enun: 'Adapta la técnica: escribe `dias_hasta_mas_frio(T)` que, para cada día `i`, devuelva cuántos días faltan hasta una temperatura **menor** (0 si no la hay). Debe ser O(n).', starter: 'def dias_hasta_mas_frio(T):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['dias_hasta_mas_frio([6, 8, 5, 4, 3, 7, 9, 6])', 'dias_hasta_mas_frio([1, 2, 3])', 'dias_hasta_mas_frio([3, 2, 1])', 'dias_hasta_mas_frio([5])', 'dias_hasta_mas_frio([4, 4, 2])'], ef: ['dias_hasta_mas_frio(list(range(0, 400)))'], efDesc: 'dias_hasta_mas_frio con 400 temperaturas  (eficiencia)', fn: 'dias_hasta_mas_frio', ejemplo: 'dias_hasta_mas_frio([3, 1, 2])', factor: 4 });
      q.pistas = ['Es la misma técnica: solo cambia la comparación del while.', 'Desapila mientras la temperatura del tope sea **mayor** que la de hoy.', 'Los que quedan en la pila al final se quedan con 0.'];
      q.explicacion = 'Basta invertir la comparación:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n11-circular-indice', n: 11, e: 'B', dif: 2, c: ['pc_circ'], tema: 'Índice de encolado en una cola circular',
    gen(rng) {
      const C = rng.int(5, 8), tam = rng.int(2, C - 1), frente = rng.int(0, C - 1), idx = (frente + tam) % C;
      const m = Sim.cola.circ.nueva(C), cm = JSON.parse(JSON.stringify(m)); for (let i = 0; i < tam; i++) cm.datos[(frente + i) % C] = { id: i + 1, v: String.fromCharCode(65 + i) }; cm.frente = frente; cm.tam = tam; cm.sigId = tam + 1;
      const f = Sim.cola.circ.cuadro(cm, 'Cola circular de capacidad ' + C + '.');
      return { tipo: 'salida', numerico: true, tol: 0, enunciado: 'Una **cola circular** de capacidad **C = ' + C + '** tiene `frente = ' + frente + '` y `tam = ' + tam + '`. ¿En qué **índice** del arreglo se guardará el próximo elemento que se encole?', figura: H.fig(f, 'C = ' + C + ' · frente = ' + frente + ' · tam = ' + tam), esperado: String(idx), placeholder: 'Índice',
        pistas: ['`final = (frente + tam) % C`.', 'El módulo hace que el índice dé la vuelta al llegar a C.', 'Calcula `' + frente + ' + ' + tam + ' = ' + (frente + tam) + '` y toma el residuo de dividir entre ' + C + '.'], explicacion: '`final = (' + frente + ' + ' + tam + ') % ' + C + ' = ' + (frente + tam) + ' % ' + C + ' = ' + idx + '`' + (frente + tam >= C ? ' (da la vuelta al inicio del arreglo)' : '') + '.', sim: H.sim(Sim.cola.circ.encolar(cm, 'Z').frames, Sim.cola.circ.CODIGO, 'class ColaCircular', 'encolar en una cola circular') };
    } });

  B({ id: 'n11-circular-traza', n: 11, e: 'C', dif: 3, c: ['pc_circ'], tema: 'Traza de la cola circular',
    gen(rng) {
      const C = 5, letras = rng.sample('ABCDEFGH'.split(''), 8); let m = Sim.cola.circ.nueva(C), k = 0; const filas = [], desc = [];
      const seq = [['E', 3], ['D', 1], ['E', 2]]; if (rng.chance(0.5)) seq.push(['D', 1]); seq.push(['E', rng.int(1, 3)]);
      seq.forEach(([t, cuantos]) => { for (let i = 0; i < cuantos; i++) { const r = t === 'E' ? Sim.cola.circ.encolar(m, letras[k % letras.length]) : Sim.cola.circ.desencolar(m); if (t === 'E' && !r.error) k++; if (!r.error) m = r.modelo; } filas.push([{ t: (t === 'E' ? 'encolar ' + cuantos + ' elemento(s)' : 'desencolar ' + cuantos + ' elemento(s)') }, { in: [String(m.frente)], w: 4 }, { in: [String(m.tam)], w: 4 }, { t: '`[' + m.datos.map(d => d ? d.v : '_').join(',') + ']`' }]); });
      return { tipo: 'tabla', enunciado: 'Cola circular de capacidad **C = 5** (inicia vacía con `frente = 0` y `tam = 0`; `final = (frente + tam) % C`). Completa `frente` y `tam` después de cada operación. (Los elementos encolados son letras: `_` = casilla vacía.)', cols: ['Operación', 'frente', 'tam', 'arreglo'], filas,
        pistas: ['Encolar aumenta `tam` (no mueve `frente`); desencolar avanza `frente` con módulo y reduce `tam`.', '`frente = (frente + 1) % C` al desencolar.', 'La cola está llena cuando `tam = C`.'], explicacion: 'Cada fila se obtiene aplicando las operaciones: encolar escribe en `(frente + tam) % C`; desencolar avanza `frente` con módulo C. El orden FIFO se conserva aunque el arreglo dé la vuelta.', sim: H.sim(Sim.cola.circ.desencolar(m).frames, Sim.cola.circ.CODIGO, 'class ColaCircular', 'desencolar en una cola circular') };
    } });

  B({ id: 'n11-cola-costo', n: 11, e: 'B', dif: 3, c: ['pc_cola', 'pc_deque'], tema: 'Costo de una cola con list.pop(0)',
    gen(rng) {
      const n = rng.int(5, 12), tot = n * (n - 1) / 2;
      return { tipo: 'salida', numerico: true, tol: 0, enunciado: 'Una cola se implementa con una `list`: se **encolan** `n = ' + n + '` elementos con `append` y luego se **desencolan todos** con `lista.pop(0)`. Cada `pop(0)` **desplaza una posición a la izquierda a todos los elementos restantes**. ¿Cuántos **desplazamientos** se hacen en total? (Con `deque.popleft()` no se desplaza nada.)', esperado: String(tot), placeholder: 'Desplazamientos',
        pistas: ['El primer `pop(0)` desplaza n − 1 elementos, el segundo n − 2, …, el último 0.', 'Suma: (n − 1) + (n − 2) + … + 0 = n(n − 1)/2.', 'Por eso una cola de n operaciones con list es O(n²).'], explicacion: '(' + n + '−1) + … + 0 = ' + n + '·' + (n - 1) + '/2 = **' + tot + '**. Con n = 10⁶ serían ≈ 5 × 10¹¹: hay que usar `collections.deque`.', sim: H.sim(Sim.cola.desencolar(Sim.cola.nueva(Array.from({ length: Math.min(n, 6) }, (_, i) => i + 1), { modo: 'lista' })).frames, Sim.cola.COLA_LISTA, 'cola con list', 'pop(0) desplaza todo') };
    } });

  B({ id: 'n11-orden-pasos', n: 11, e: 'B', dif: 2, c: ['pc_apps', 'pc_mon', 'pc_circ'], tema: 'Ordenar pasos (pila y cola)',
    gen(rng) {
      const L = [
        { t: 'balanceo de símbolos con una pila', items: ['Recorrer el texto símbolo por símbolo', 'Si es una **apertura**, apilarla', 'Si es un **cierre**, comprobar que la pila no esté vacía y que el tope sea su pareja (y desapilar)', 'Si algo falla, devolver `False`', 'Al terminar el texto, devolver `True` solo si la **pila quedó vacía**'] },
        { t: 'encolar en una cola circular', items: ['Si `tam == capacidad`, lanzar `OverflowError`', 'Calcular `final = (frente + tam) % capacidad`', 'Guardar el elemento en `datos[final]`', 'Incrementar `tam`'] },
        { t: 'pila monótona (días hasta un día más caluroso)', items: ['Crear `D` con ceros y una pila vacía de índices', 'Para cada día `i`, mientras el tope tenga una temperatura **menor** que `T[i]`: desapilar `k`', 'Escribir `D[k] = i - k`', 'Apilar `i` (también queda en espera)', 'Devolver `D`'] },
        { t: 'desencolar en una cola circular', items: ['Si `tam == 0`, lanzar `IndexError`', 'Leer `x = datos[frente]`', 'Avanzar `frente = (frente + 1) % capacidad`', 'Decrementar `tam` y devolver `x`'] }
      ];
      const o = rng.pick(L), idx = o.items.map((_, i) => i); let ini = rng.shuffle(idx); if (ini.every((x, i) => x === i)) ini = idx.slice().reverse();
      return { tipo: 'orden', enunciado: 'Ordena los pasos del algoritmo: **' + o.t + '**.', items: o.items, correcto: idx, inicial: ini, pistas: ['Piensa qué debe ocurrir primero para que el siguiente paso tenga sentido.', 'Las comprobaciones de error van antes de modificar nada.', 'Lo que se devuelve va al final.'], explicacion: 'Orden correcto: ' + o.items.map((s, i) => (i + 1) + '. ' + s).join(' → ') };
    } });

  B({ id: 'n11-pila-impl', n: 11, e: 'C', dif: 3, c: ['pc_pila', 'pc_apps'], tema: 'Evaluar una expresión postfija con una pila',
    gen() {
      const sol = dd(`
        def evaluar_postfija(expr):
            pila = []
            for t in expr.split():
                if t in "+-*":
                    b = pila.pop()
                    a = pila.pop()
                    if t == "+":
                        pila.append(a + b)
                    elif t == "-":
                        pila.append(a - b)
                    else:
                        pila.append(a * b)
                else:
                    pila.append(int(t))
            return pila.pop()
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `evaluar_postfija(expr)` que evalúe una expresión en **notación postfija** (los operandos van antes del operador) con los operadores `+`, `-` y `*` y enteros separados por espacios. Usa una **pila**: apila los números; con un operador, desapila `b` y luego `a` (en ese orden), calcula `a op b` y apila el resultado. Ej.: `"3 4 + 2 *"` → `14`.', starter: 'def evaluar_postfija(expr):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['evaluar_postfija("3 4 + 2 *")', 'evaluar_postfija("5 1 2 + 4 * + 3 -")', 'evaluar_postfija("7")', 'evaluar_postfija("10 2 -")', 'evaluar_postfija("2 3 4 * +")', 'evaluar_postfija("1 2 - 3 -")'], fn: 'evaluar_postfija', ejemplo: 'evaluar_postfija("3 4 +")' });
      q.pistas = ['Recorre `expr.split()`: si es un número, `pila.append(int(t))`.', 'Con un operador, el **segundo** operando sale primero: `b = pila.pop()`, luego `a = pila.pop()`.', 'La resta importa el orden: `a - b`, no `b - a`.'];
      q.explicacion = 'Evaluación con pila:\n```\n' + sol + '\n```';
      return q;
    } });

  /* =====================================================================================================================================
     NIVEL 12 · Listas enlazadas
     ===================================================================================================================================== */
  H.vf('n12-vf', 12, 'A', 1, ['le_nodo', 'le_ins', 'le_del', 'le_vs'], 'Listas enlazadas (V/F)', [
    { a: 'Insertar al inicio de una lista enlazada cuesta O(1).', v: true, e: 'Solo se reasignan dos referencias, sin desplazar nada.', j: ['Se reasignan dos referencias (nuevo.siguiente y cabeza) sin importar el tamaño de la lista.', 'Porque la lista siempre está vacía al principio.', 'Porque Python optimiza la inserción.'] },
    { a: 'En una lista enlazada se puede acceder al elemento i en O(1).', v: false, e: 'No hay fórmula de direcciones: hay que seguir i referencias, O(n).', j: ['Los nodos están dispersos: para llegar al i-ésimo hay que recorrer desde la cabeza.', 'Porque la lista guarda un índice por nodo.', 'Porque los nodos están en memoria contigua.'] },
    { a: 'Al insertar en el medio, el orden correcto es primero `nuevo.siguiente = actual.siguiente` y después `actual.siguiente = nuevo`.', v: true, e: 'Al revés se pierde el resto de la lista.', j: ['Primero el nuevo se engancha al resto; después el anterior se engancha al nuevo.', 'Da igual el orden.', 'Porque `actual` siempre apunta a `None`.'] },
    { a: 'Eliminar un nodo es O(1) siempre, incluso si hay que buscarlo antes.', v: false, e: 'Es O(1) solo si ya se tiene el nodo anterior; si hay que buscarlo, O(n).', j: ['Localizar el nodo cuesta O(n); solo el puentear es O(1).', 'Porque eliminar no recorre la lista.', 'Porque el recolector de basura es instantáneo.'] },
    { a: 'Eliminar la cabeza se hace con `self.cabeza = actual.siguiente`.', v: true, e: 'Cuando `anterior is None` el nodo es la cabeza.', j: ['Si no hay anterior, la cabeza pasa al siguiente nodo.', 'Hay que recorrer toda la lista.', 'Se hace `anterior.siguiente = None`.'] },
    { a: 'Los tensores de NumPy y PyTorch se implementan como listas enlazadas.', v: false, e: 'Son bloques contiguos: el cómputo por lotes exige memoria predecible.', j: ['El cómputo por lotes necesita recorrer memoria contigua para aprovechar la caché.', 'Porque las listas enlazadas ocupan menos memoria.', 'Porque son más fáciles de programar.'] },
    { a: 'Con un puntero a la cola, insertar al final de una lista enlazada es O(1).', v: true, e: '`self.cola.siguiente = nuevo` y `self.cola = nuevo`.', j: ['No hace falta recorrer la lista para llegar al último nodo.', 'Porque la lista tiene capacidad fija.', 'Porque se inserta siempre en la cabeza.'] },
    { a: 'Un recorrido `while actual is not None` sobre una lista con ciclo termina siempre.', v: false, e: 'Nunca llega a None: bucle infinito.', j: ['Los nodos del ciclo se apuntan entre sí y `actual` nunca vale None.', 'Porque Python detecta los ciclos.', 'Porque el ciclo se rompe solo al llegar a la cola.'] },
    { a: 'El algoritmo de Floyd detecta ciclos en O(n) tiempo y O(1) espacio.', v: true, e: 'Usa solo dos punteros: tortuga (1 paso) y liebre (2 pasos).', j: ['No guarda los nodos visitados: la diferencia de velocidad hace que se encuentren dentro del ciclo.', 'Usa un conjunto con todos los nodos.', 'Es O(n²).'] }
  ], ['Piensa si la operación recorre la lista o solo reasigna referencias.', 'Contiguo ⇒ acceso O(1); enlazado ⇒ modificación barata en extremos o con el nodo en mano.', 'Cuidado con el orden de las reasignaciones y con los casos de lista vacía y cabeza.']);

  B({ id: 'n12-tabla-vs', n: 12, e: 'A', dif: 2, c: ['le_vs'], tema: 'Arreglo vs lista enlazada',
    gen() {
      const q = { tipo: 'tabla', cx: true, cols: ['Operación', 'Arreglo', 'Lista enlazada'], filas: [
        [{ t: 'Acceso a `A[i]`' }, { in: ['O(1)', '1'], w: 8 }, { in: ['O(n)', 'n'], w: 8 }], [{ t: 'Insertar / eliminar al inicio' }, { in: ['O(n)', 'n'], w: 8 }, { in: ['O(1)', '1'], w: 8 }],
        [{ t: 'Insertar / eliminar en el medio (con el nodo en mano)' }, { in: ['O(n)', 'n'], w: 8 }, { in: ['O(1)', '1'], w: 8 }], [{ t: 'Búsqueda por valor' }, { in: ['O(n)', 'n'], w: 8 }, { in: ['O(n)', 'n'], w: 8 }]] };
      return Object.assign(q, { enunciado: 'Completa la tabla comparativa (S4-C2, diap. 9). Asume una lista con cabeza y un arreglo de tamaño n.', pistas: ['El arreglo gana en acceso (fórmula de direcciones); la lista gana en modificación estructural.', 'Insertar al inicio de un arreglo desplaza los n elementos.', 'La búsqueda por valor recorre en ambos.'], explicacion: 'Arreglo: acceso O(1), inicio/medio O(n). Lista: acceso O(n), inicio y medio con el nodo O(1). Búsqueda O(n) en ambos.' });
    } });

  H.clasif('n12-eleccion', 12, 'B', 2, ['le_vs', 'td_estdin'], 'Elegir arreglo o lista enlazada', 'Para cada necesidad, ¿conviene un **arreglo** o una **lista enlazada**?', ['Arreglo', 'Lista enlazada'], [
    ['Leer millones de veces el elemento `i` de un tensor.', 'Arreglo', 'Acceso por índice O(1) y localidad de caché.'], ['Una cola de tareas con inserciones y borrados constantes en los extremos.', 'Lista enlazada', 'Insertar y quitar en los extremos es O(1) sin desplazar.'],
    ['Cómputo numérico por lotes (multiplicación de matrices).', 'Arreglo', 'Memoria contigua y predecible: aprovecha la caché.'], ['Insertar y eliminar frecuentemente en posiciones conocidas (con el nodo en mano).', 'Lista enlazada', 'Modificación estructural O(1).'],
    ['Memoria escasa: cada elemento debe ocupar lo mínimo.', 'Arreglo', 'La lista paga una referencia extra por nodo.'], ['Tamaño muy variable e impredecible, con muchas altas y bajas.', 'Lista enlazada', 'Crece y se reduce sin copiar todo.'], ['Una tabla de consulta que se lee siempre por posición.', 'Arreglo', 'Acceso directo por índice.']
  ], ['¿Domina el acceso por índice o la modificación estructural?', 'Considera también la localidad de caché y la memoria por elemento.', 'Los tensores nunca son listas enlazadas.'], 'Regla: acceso por índice → arreglo; inserciones/eliminaciones en extremos o posiciones conocidas → lista enlazada.');

  const LISTA_COD = () => (ET.Biblioteca && ET.Biblioteca.codigo && ET.Biblioteca.codigo.LISTA) || '';
  B({ id: 'n12-lista-traza', n: 12, e: 'B', dif: 3, c: ['le_nodo', 'le_ins', 'le_del'], tema: 'Traza de operaciones en una lista',
    gen(rng, K) {
      const n0 = rng.int(3, 4), ini = rng.distinct(n0, 1, 9).sort((a, b) => a - b), cur = ini.slice(), lineas = [], vals = rng.distinct(8, 11, 99);
      let k = 0, ultima = null;
      for (let i = 0; i < 4; i++) {
        const r = rng.next();
        if (r < 0.35) { const x = vals[k++]; lineas.push('L.insertar_inicio(' + x + ')'); cur.unshift(x); }
        else if (r < 0.7 && cur.length > 0) { const p = rng.int(1, cur.length); const x = vals[k++]; lineas.push('L.insertar_en(' + x + ', ' + p + ')'); cur.splice(p, 0, x); }
        else if (cur.length > 1) { const v = rng.pick(cur); lineas.push('L.eliminar(' + v + ')'); cur.splice(cur.indexOf(v), 1); }
        else { const x = vals[k++]; lineas.push('L.insertar_final(' + x + ')'); cur.push(x); }
      }
      const code = LISTA_COD() + '\nL = ListaEnlazada()\nfor x in ' + lst(ini.slice().reverse()) + ':\n    L.insertar_inicio(x)\n' + lineas.join('\n') + '\nprint(L.a_lista())';
      const esp = K.run(code), m0 = Sim.lista.desde(ini), f = Sim.lista.cuadro(Sim.lista.vis(m0), 'Lista inicial');
      return { tipo: 'salida', enunciado: 'La lista `L` ya contiene `' + ini.join(' → ') + ' → None`. Se ejecutan, en orden, las operaciones de la clase `ListaEnlazada` (diap. 6-12; `insertar_en(dato, pos)` inserta **en la posición `pos`**, contando desde 0). ¿Qué imprime el programa final `print(L.a_lista())`?', figura: H.fig(f, 'Lista inicial'), codigoVista: lineas.join('\n'), codigoTitulo: 'Operaciones (después de crear la lista inicial)', esperado: esp, stdout: false, placeholder: '[…]',
        pistas: ['Lleva la lista paso a paso, dibujando los nodos.', '`insertar_inicio` pone el dato antes de la cabeza; `insertar_en(x, p)` lo deja en la posición `p` (el primero es la posición 0).', '`eliminar(v)` puentea el primer nodo con dato `v`.'], explicacion: 'Resultado: **' + esp + '**.', sim: H.sim(Sim.lista.insertarEn(m0, 1, 77).frames, Sim.lista.CODIGOS.en, 'insertar_en', 'insertar en una posición') };
    } });

  B({ id: 'n12-orden-pasos', n: 12, e: 'B', dif: 2, c: ['le_ins', 'le_del', 'le_floyd'], tema: 'Ordenar pasos (listas enlazadas)',
    gen(rng) {
      const L = [
        { t: 'insertar un dato en la posición `pos` (con `pos > 0`)', items: ['`actual = self.cabeza`', 'Avanzar `actual` `pos - 1` veces hasta el nodo anterior', '`nuevo = Nodo(dato)`', '`nuevo.siguiente = actual.siguiente` (el nuevo apunta al resto)', '`actual.siguiente = nuevo` (el anterior apunta al nuevo)'] },
        { t: 'eliminar un nodo intermedio por valor', items: ['`actual, anterior = self.cabeza, None`', 'Mientras `actual` no sea `None`, comparar `actual.dato` con el valor', 'Al encontrarlo, `anterior.siguiente = actual.siguiente`', 'Devolver `True`', 'Si se acaba la lista sin encontrarlo, devolver `False`'] },
        { t: 'detectar un ciclo con Floyd', items: ['`tortuga = liebre = cabeza`', 'Mientras `liebre` y `liebre.siguiente` no sean `None`', '`tortuga` avanza 1 paso y `liebre` avanza 2', 'Si `tortuga is liebre`, devolver `True`', 'Al terminar el `while`, devolver `False`'] },
        { t: 'invertir una lista enlazada', items: ['`anterior = None`; `actual = self.cabeza`', 'Guardar `siguiente = actual.siguiente`', 'Dar la vuelta a la flecha: `actual.siguiente = anterior`', 'Avanzar: `anterior = actual`; `actual = siguiente`', 'Al terminar, `self.cabeza = anterior`'] }
      ];
      const o = rng.pick(L), idx = o.items.map((_, i) => i); let ini = rng.shuffle(idx); if (ini.every((x, i) => x === i)) ini = idx.slice().reverse();
      return { tipo: 'orden', enunciado: 'Ordena los pasos para **' + o.t + '**.', items: o.items, correcto: idx, inicial: ini, pistas: ['Antes de reasignar una referencia, asegúrate de no perder lo que apuntaba.', 'En la inserción en medio: primero el nuevo se engancha al resto, después el anterior al nuevo.', 'Las condiciones de término y las devoluciones van al final.'], explicacion: 'Orden correcto: ' + o.items.map((s, i) => (i + 1) + '. ' + s).join(' → ') };
    } });

  const PRE_LISTA = () => LISTA_COD() + '\n' + dd(`
    def armar(valores):
        L = ListaEnlazada()
        for v in reversed(valores):
            L.insertar_inicio(v)
        return L
    def forma(L):
        return L.a_lista()
  `);
  B({ id: 'n12-insertar-impl', n: 12, e: 'C', dif: 3, c: ['le_ins', 'le_nodo'], tema: 'Insertar en una lista ordenada',
    gen() {
      const sol = dd(`
        def insertar_ordenado(L, dato):
            if L.cabeza is None or dato <= L.cabeza.dato:
                L.insertar_inicio(dato)
                return L
            actual = L.cabeza
            while actual.siguiente is not None and actual.siguiente.dato < dato:
                actual = actual.siguiente
            nuevo = Nodo(dato)
            nuevo.siguiente = actual.siguiente
            actual.siguiente = nuevo
            return L
      `);
      const q = PQ.codigoQ({ enun: 'Se te da la clase `ListaEnlazada` (con `cabeza`, `Nodo`, `insertar_inicio` y `a_lista`). Escribe `insertar_ordenado(L, dato)` que inserte `dato` en una lista **ya ordenada de menor a mayor**, dejándola ordenada, y devuelva la misma lista `L`. Cuida: lista vacía, insertar al inicio y al final.', starter: 'def insertar_ordenado(L, dato):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE_LISTA(),
        tests: ['forma(insertar_ordenado(armar([1, 3, 5]), 4))', 'forma(insertar_ordenado(armar([2, 4, 6]), 1))', 'forma(insertar_ordenado(armar([2, 4, 6]), 9))', 'forma(insertar_ordenado(armar([]), 7))', 'forma(insertar_ordenado(armar([5]), 5))', 'forma(insertar_ordenado(armar([1, 2, 3]), 2))'], fn: 'insertar_ordenado', ejemplo: 'forma(insertar_ordenado(armar([1, 3]), 2))' });
      q.pistas = ['Si la lista está vacía o el dato va antes de la cabeza: `insertar_inicio`.', 'Si no, avanza `actual` mientras el siguiente nodo sea menor que `dato`.', 'Enlaza en orden: `nuevo.siguiente = actual.siguiente` y luego `actual.siguiente = nuevo`.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n12-eliminar-impl', n: 12, e: 'C', dif: 3, c: ['le_del'], tema: 'Eliminar todas las apariciones',
    gen() {
      const sol = dd(`
        def eliminar_todos(L, dato):
            while L.cabeza is not None and L.cabeza.dato == dato:
                L.cabeza = L.cabeza.siguiente
            actual = L.cabeza
            while actual is not None and actual.siguiente is not None:
                if actual.siguiente.dato == dato:
                    actual.siguiente = actual.siguiente.siguiente
                else:
                    actual = actual.siguiente
            return L
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `eliminar_todos(L, dato)` que elimine de la lista enlazada **todas** las apariciones de `dato` (no solo la primera) y devuelva la misma lista `L`. Debe funcionar si la cabeza (o varios nodos seguidos) tienen ese dato, y si la lista queda vacía. **No uses `a_lista()`**: reasigna referencias.', starter: 'def eliminar_todos(L, dato):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE_LISTA(),
        tests: ['forma(eliminar_todos(armar([1, 2, 3, 2, 4]), 2))', 'forma(eliminar_todos(armar([5, 5, 5]), 5))', 'forma(eliminar_todos(armar([5, 5, 1, 5, 2, 5]), 5))', 'forma(eliminar_todos(armar([1, 2, 3]), 9))', 'forma(eliminar_todos(armar([]), 1))', 'forma(eliminar_todos(armar([7, 1]), 7))'], fn: 'eliminar_todos', ejemplo: 'forma(eliminar_todos(armar([1, 2, 1]), 1))',
        reglas: [{ t: 'noUsa', re: /a_lista\s*\(/, msg: 'No uses a_lista(): hay que reasignar las referencias de los nodos.' }] });
      q.pistas = ['Primero avanza la cabeza mientras tenga el dato a eliminar.', 'Luego recorre con `actual`: si `actual.siguiente.dato == dato`, puentea con `actual.siguiente = actual.siguiente.siguiente` **sin avanzar**.', 'Solo avanza `actual` cuando no eliminaste nada.'];
      q.explicacion = 'Solución:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n12-invertir-impl', n: 12, e: 'C', dif: 4, c: ['le_nodo', 'le_del', 'le_ins'], tema: 'Invertir una lista enlazada',
    gen() {
      const sol = dd(`
        def invertir(L):
            anterior = None
            actual = L.cabeza
            while actual is not None:
                siguiente = actual.siguiente
                actual.siguiente = anterior
                anterior = actual
                actual = siguiente
            L.cabeza = anterior
            return L
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `invertir(L)` que invierta **en el sitio** la lista enlazada `L` (dando la vuelta a las referencias, con **tres punteros**) y devuelva `L`. **No uses `a_lista()` ni listas auxiliares**: la memoria extra debe ser O(1).', starter: 'def invertir(L):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE_LISTA(),
        tests: ['forma(invertir(armar([1, 2, 3, 4])))', 'forma(invertir(armar([7])))', 'forma(invertir(armar([])))', 'forma(invertir(armar([1, 2])))', 'forma(invertir(invertir(armar([3, 1, 4]))))'], fn: 'invertir', ejemplo: 'forma(invertir(armar([1, 2, 3])))',
        reglas: [{ t: 'noUsa', re: /a_lista\s*\(|\.append\s*\(|\[\s*\]/, msg: 'No uses a_lista() ni listas auxiliares: invierte con tres punteros (anterior, actual, siguiente).' }] });
      q.pistas = ['Necesitas `anterior`, `actual` y `siguiente`.', 'En cada vuelta: guarda `siguiente = actual.siguiente`, da la vuelta `actual.siguiente = anterior`, avanza los dos punteros.', 'Al final la cabeza es `anterior`.'];
      q.explicacion = 'Inversión con tres punteros:\n```\n' + sol + '\n```';
      return q;
    } });

  const PRE_NODOS = dd(`
    class Nodo:
        def __init__(self, dato):
            self.dato = dato
            self.siguiente = None
    def construir(valores, ciclo_a=None):
        nodos = [Nodo(v) for v in valores]
        for i in range(len(nodos) - 1):
            nodos[i].siguiente = nodos[i + 1]
        if ciclo_a is not None:
            nodos[-1].siguiente = nodos[ciclo_a]
        return nodos[0] if nodos else None
  `);
  B({ id: 'n12-floyd-impl', n: 12, e: 'C', dif: 4, c: ['le_floyd'], tema: 'Implementar la detección de ciclos',
    gen() {
      const sol = dd(`
        def tiene_ciclo(cabeza):
            tortuga = liebre = cabeza
            while liebre is not None and liebre.siguiente is not None:
                tortuga = tortuga.siguiente
                liebre = liebre.siguiente.siguiente
                if tortuga is liebre:
                    return True
            return False
      `);
      const q = PQ.codigoQ({ enun: 'Se te dan la clase `Nodo` (con `dato` y `siguiente`) y `construir(valores, ciclo_a)`, que enlaza los nodos y, si `ciclo_a` no es `None`, hace que el **último** apunte al nodo de ese índice. Escribe `tiene_ciclo(cabeza)` con el algoritmo de **Floyd** (liebre y tortuga): **O(n)** tiempo y **O(1)** memoria. Debe funcionar con la lista vacía y con un solo nodo.', starter: 'def tiene_ciclo(cabeza):\n    # complete aquí\n    pass\n', solucion: sol, prelude: PRE_NODOS,
        tests: ['tiene_ciclo(construir([1, 2, 3, 4, 5]))', 'tiene_ciclo(construir([1, 2, 3, 4, 5], 1))', 'tiene_ciclo(construir([]))', 'tiene_ciclo(construir([7]))', 'tiene_ciclo(construir([7], 0))', 'tiene_ciclo(construir([1, 2], 0))', 'tiene_ciclo(construir([1, 2, 3, 4, 5, 6], 5))'], fn: 'tiene_ciclo', ejemplo: 'tiene_ciclo(construir([1, 2, 3], 0))',
        reglas: [{ t: 'noUsa', re: /\bset\s*\(|\{\s*\}|visitados|vistos/, msg: 'Usa solo dos punteros (tortuga y liebre): sin conjuntos de nodos visitados.' }] });
      q.pistas = ['Dos punteros: la tortuga avanza 1 y la liebre 2.', 'El `while` debe comprobar `liebre is not None and liebre.siguiente is not None`.', 'Si `tortuga is liebre`, hay ciclo; si el `while` termina, no lo hay.'];
      q.explicacion = 'Floyd:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n12-floyd-traza', n: 12, e: 'B', dif: 3, c: ['le_floyd'], tema: 'Traza de la liebre y la tortuga',
    gen(rng) {
      const n = rng.int(5, 7), vals = rng.distinct(n, 1, 9), k = rng.int(0, n - 3); const sig = i => i + 1 < n ? i + 1 : k;
      let t = 0, l = 0, it = 0; do { t = sig(t); l = sig(sig(l)); it++; } while (t !== l && it < 50);
      const m = Sim.lista.desde(vals); const mc = Sim.lista.crearCiclo(m, k).modelo, f = Sim.lista.cuadro(Sim.lista.vis(mc), 'Lista con ciclo');
      return { tipo: 'salida', tokens: true, enunciado: 'La lista de la figura tiene un **ciclo**: el último nodo apunta al nodo de valor **' + vals[k] + '**. Se ejecuta Floyd (`tortuga` avanza 1 paso y `liebre` 2 pasos por vuelta, ambas desde la cabeza). ¿**En qué nodo (valor) se encuentran** y **cuántas vueltas** del `while` hicieron falta? Responde `valor vueltas`.', figura: H.fig(f, vals.join(' → ') + ' → (vuelve al ' + vals[k] + ')'), esperado: vals[t] + ' ' + it, placeholder: 'valor vueltas',
        pistas: ['Cada vuelta: la tortuga avanza un nodo y la liebre dos (siguiendo el ciclo).', 'Anota el valor de cada puntero tras cada vuelta, hasta que coincidan.', 'Tras entrar en el ciclo, la liebre gana un nodo por vuelta.'], explicacion: 'Se encuentran en el nodo **' + vals[t] + '** tras **' + it + '** vuelta(s).', sim: H.sim(Sim.lista.floyd(mc).frames, Sim.lista.CODIGOS.floyd, 'tiene_ciclo (liebre y tortuga)', 'Floyd paso a paso') };
    } });

  H.vf('n12-doble-vf', 12, 'A', 2, ['le_doble', 'pc_deque'], 'Lista doble y deque (V/F)', [
    { a: 'En una lista doblemente enlazada se puede eliminar un nodo conocido en O(1) sin buscar a su predecesor.', v: true, e: 'El nodo conoce a su anterior: se actualizan los dos vecinos.', j: ['Cada nodo guarda su `anterior`, así que no hace falta recorrer la lista para encontrarlo.', 'Porque la lista doble está ordenada.', 'Porque elimina todos los nodos a la vez.'] },
    { a: 'Una lista doble ocupa menos memoria por nodo que una lista simple.', v: false, e: 'Guarda dos referencias por nodo en lugar de una.', j: ['Cada nodo lleva `siguiente` y `anterior`: una referencia más que la simple.', 'Porque no necesita el dato.', 'Porque la deque comprime los nodos.'] },
    { a: '`collections.deque` se basa en enlazar bloques en ambos sentidos, por eso ofrece O(1) en ambos extremos.', v: true, e: 'Es la idea de la lista doble.', j: ['Los bloques doblemente enlazados permiten acceder a ambos extremos sin desplazar elementos.', 'Es un arreglo contiguo con capacidad infinita.', 'Se implementa con un heap.'] },
    { a: 'En una lista doble con puntero a la cola, insertar al final es O(1).', v: true, e: 'Se enlaza `cola.siguiente = nuevo` y `nuevo.anterior = cola`.', j: ['El puntero a la cola evita recorrer la lista.', 'Porque se inserta siempre al inicio.', 'Porque la lista tiene tamaño fijo.'] },
    { a: 'Al insertar un nodo en una lista doble basta actualizar los `siguiente`; los `anterior` se corrigen solos.', v: false, e: 'Hay que actualizar ambos sentidos.', j: ['Los `anterior` también son referencias y hay que asignarlas: si no, el recorrido hacia atrás queda roto.', 'Python actualiza los anterior automáticamente.', 'Los anterior solo se usan al borrar.'] }
  ], ['Piensa qué referencias tiene cada nodo y cuáles hay que actualizar.', 'Doble: más memoria por nodo, pero eliminar un nodo conocido es O(1).', 'La deque de Python se basa en la lista doble de bloques.']);

  B({ id: 'n12-doble-referencias', n: 12, e: 'B', dif: 3, c: ['le_doble', 'le_del'], tema: 'Referencias al eliminar en una lista doble',
    gen(rng) {
      const n = rng.int(4, 6), vals = rng.distinct(n, 1, 9), i = rng.int(1, n - 2), x = vals[i], p = vals[i - 1], s = vals[i + 1];
      const correctas = ['`' + p + '.siguiente` pasa a apuntar al ' + s, '`' + s + '.anterior` pasa a apuntar al ' + p], malas = ['`' + x + '.siguiente` pasa a apuntar a `None` (y eso basta)', '`cabeza` pasa a apuntar al ' + s, '`' + p + '.anterior` pasa a apuntar al ' + s, 'Hay que recorrer toda la lista desde la cabeza para encontrar al ' + p];
      const opc = correctas.map(t => ({ t, ok: true, why: 'Es el puenteo en los dos sentidos.' })).concat(rng.sample(malas, 3).map(t => ({ t, ok: false, why: 'No corresponde a eliminar un nodo intermedio conocido de una lista doble.' })));
      const m = Sim.lista.desde(vals, { doble: true }), f = Sim.lista.cuadro(Sim.lista.vis(m), 'Lista doble');
      return { tipo: 'opcion', multi: true, enunciado: 'En la lista **doblemente enlazada** de la figura se **elimina el nodo ' + x + '** (que ya se tiene en mano, y no es ni la cabeza ni la cola). Marca **todas** las referencias que hay que actualizar (y solo esas).', figura: H.fig(f, vals.join(' ⇄ ')), opciones: rng.shuffle(opc),
        pistas: ['El anterior debe saltarse al nodo eliminado, y el siguiente también.', 'Son dos asignaciones: una en cada sentido.', 'No hace falta recorrer la lista: el nodo conoce a sus vecinos.'], explicacion: 'Se puentea en ambos sentidos: `' + p + '.siguiente = ' + s + '` y `' + s + '.anterior = ' + p + '`. Costo **O(1)** (en una lista simple habría que buscar al anterior: O(n)).', sim: H.sim(Sim.lista.eliminar(m, x).frames, Sim.lista.CODIGOS.eliminar, 'eliminar', 'eliminar en una lista doble') };
    } });
})(typeof window !== 'undefined' ? window : globalThis);
