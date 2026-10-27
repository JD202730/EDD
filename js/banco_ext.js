/* banco_ext.js — preguntas de los niveles 9 (TAD y memoria) y 10 (arreglos y técnicas).
   Mismo estilo del banco: verdadero/falso con justificación, clasificar, predicción de salida (el programa se ejecuta con el intérprete y se
   verifica con CPython), tablas de complejidad, preguntas con figura (dibujo de la estructura) y animación en la explicación, y ejercicios de código
   con pruebas (la solución lenta vale la mitad). */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, Py = ET.Py, Sim = ET.Sim, PQ = ET.PQ, B = ET.Banco.add;
  const H = ET.BancoExt = {};

  /* ---------- utilidades compartidas por los bancos de los niveles 9-14 ---------- */
  H.dd = U.dedent;
  H.fig = (f, titulo) => ({ titulo, items: f.items, W: f.W, H: f.H });
  H.sim = (frames, codigo, tituloCodigo, titulo) => ({ frames, codigo: codigo || null, tituloCodigo, titulo });
  /** V/F con justificación: items = [{a, v, e, j:[correcta, mala1, mala2]}] */
  H.vf = function (id, n, e, dif, c, tema, items, pistas) {
    B({ id, n, e, dif, c, tema, gen(rng) {
      const it = rng.pick(items);
      return { tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón que la sustenta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) }, pistas };
    } });
  };
  /** clasificar: items = [[texto, categoría, porqué]] (se toman hasta 5 al azar) */
  H.clasif = function (id, n, e, dif, c, tema, enun, categorias, items, pistas, expl, cuantos) {
    B({ id, n, e, dif, c, tema, gen(rng) {
      return { tipo: 'clasificar', enunciado: enun, categorias, items: rng.sample(items, Math.min(cuantos || 5, items.length)).map(t => ({ t: t[0], cat: categorias.indexOf(t[1]), why: t[2] })), pistas, explicacion: expl };
    } });
  };
  /** tabla de complejidades: filas = [[texto, [alternativas]...]] */
  H.tablaCx = (cols, filas) => ({ tipo: 'tabla', cx: true, cols, filas: filas.map(f => f.map((c, i) => i === 0 ? { t: c } : { in: Array.isArray(c) ? c : [c], w: 14 })) });
  H.lst = a => '[' + a.join(', ') + ']';

  /* =====================================================================================================================================
     NIVEL 9 · TAD y memoria
     ===================================================================================================================================== */
  H.vf('n9-vf', 9, 'A', 1, ['td_ed', 'td_clasif', 'td_tad', 'td_axiomas', 'td_impl'], 'TAD y estructuras (V/F)', [
    { a: 'Un TAD especifica cómo se guardan los datos en memoria.', v: false, e: 'El TAD define dominio, operaciones y reglas; el cómo lo decide la implementación.', j: ['El TAD define el qué (operaciones y reglas); el cómo se almacenan los datos lo decide la implementación.', 'El TAD siempre usa una lista de Python por debajo.', 'El TAD fija el costo de cada operación.'] },
    { a: 'Pila y cola son el mismo TAD porque ambos tienen las operaciones «meter» y «sacar».', v: false, e: 'Las reglas de comportamiento son distintas (LIFO frente a FIFO).', j: ['Tienen las mismas operaciones pero reglas distintas: en la pila sale el último; en la cola, el primero.', 'Porque las dos usan memoria contigua.', 'Porque la pila es un caso especial de la cola.'] },
    { a: 'Un mismo TAD puede tener varias implementaciones con rendimientos muy distintos.', v: true, e: 'El TAD es el contrato; cada implementación lo cumple con otra estructura y otro costo.', j: ['El contrato no fija cómo se guardan los datos ni cuánto cuesta cada operación.', 'Porque el TAD obliga a usar una tabla hash.', 'Solo ocurre en lenguajes con herencia.'] },
    { a: 'Si el código cliente está escrito contra la interfaz del TAD, hay que reescribirlo al cambiar de ConjuntoLista a ConjuntoHash.', v: false, e: 'Programar contra la interfaz permite cambiar la implementación sin tocar el cliente.', j: ['El cliente solo usa las operaciones del contrato, que ambas implementaciones cumplen.', 'Porque ConjuntoHash tiene operaciones distintas.', 'Porque la lista y el hash guardan tipos de datos distintos.'] },
    { a: '`numpy.ndarray` es una estructura lineal y estática.', v: true, e: 'Es una secuencia de tamaño fijo en memoria contigua.', j: ['Es una secuencia de tamaño fijo guardada en un bloque contiguo.', 'Porque se puede recorrer con un for.', 'Porque no admite números decimales.'] },
    { a: 'Un árbol binario es una estructura lineal.', v: false, e: 'Un nodo puede tener dos hijos: es una estructura no lineal (jerarquía).', j: ['Un elemento puede relacionarse con varios (dos hijos): no forman una secuencia.', 'Porque tiene una sola raíz.', 'Porque se guarda siempre en un arreglo.'] },
    { a: 'Una lista enlazada es una estructura dinámica: crece y se reduce en ejecución pidiendo o liberando nodos.', v: true, e: 'Los nodos se piden al montículo uno a uno y se enlazan con referencias.', j: ['Cada nodo se pide al montículo cuando hace falta y se enlaza con referencias.', 'Porque ocupa un bloque contiguo del tamaño final.', 'Porque no usa referencias.'] },
    { a: 'En general, contiguo implica acceso rápido pero redimensionar es caro; enlazado implica crecer barato pero acceder al i-ésimo es lento.', v: true, e: 'Es el compromiso central entre memoria contigua y enlazada.', j: ['Es el compromiso entre la fórmula de direcciones (contiguo) y los enlaces (enlazado).', 'Porque el enlazado siempre es más rápido.', 'Porque lo contiguo nunca puede crecer.'] },
    { a: 'ConjuntoHash es mejor que ConjuntoLista para cualquier perfil de uso.', v: false, e: 'Es mejor para estas operaciones; si se necesita conservar el orden de inserción, la lista gana.', j: ['Ninguna estructura es mejor en absoluto: depende del perfil de operaciones (la lista conserva el orden).', 'Porque el hash usa menos memoria.', 'Porque el hash también conserva el orden.'] },
    { a: 'La regla «tamaño(insertar(C, x)) = tamaño(C) cuando x ya pertenecía a C» es un axioma del TAD Conjunto.', v: true, e: 'Insertar un elemento repetido no cambia el tamaño del conjunto.', j: ['Un conjunto no admite repetidos: insertar uno existente no cambia su tamaño.', 'Es un axioma de la pila.', 'Es el costo de la inserción en una lista.'] }
  ], ['El TAD es el contrato (qué hace); la estructura es el cumplimiento (cómo lo hace).', 'Compara las reglas de comportamiento, no solo los nombres de las operaciones.', 'Piensa en el compromiso: contiguo ⇒ acceso rápido; enlazado ⇒ modificación barata.']);

  H.clasif('n9-clasif-estructuras', 9, 'A', 2, ['td_clasif'], 'Clasificar estructuras', 'Clasifica cada estructura como **lineal y estática**, **lineal y dinámica** o **no lineal** (S1-C1, diap. 13-14).', ['Lineal y estática', 'Lineal y dinámica', 'No lineal'], [
    ['`numpy.ndarray`', 'Lineal y estática', 'Secuencia de tamaño fijo en memoria contigua.'], ['Arreglo de C de tamaño fijo', 'Lineal y estática', 'Bloque contiguo reservado de antemano.'], ['Lista enlazada', 'Lineal y dinámica', 'Secuencia que crece con nodos enlazados.'], ['Pila implementada con nodos enlazados', 'Lineal y dinámica', 'Es una secuencia (un solo sucesor) con nodos dinámicos.'],
    ['Cola circular de capacidad fija', 'Lineal y estática', 'Arreglo de tamaño fijo tratado como anillo.'], ['Árbol binario de búsqueda', 'No lineal', 'Cada nodo puede tener dos hijos: jerarquía.'], ['Heap (montículo)', 'No lineal', 'Árbol completo: un elemento se relaciona con varios.'], ['Grafo', 'No lineal', 'Red de relaciones entre elementos.'], ['Tabla hash (`dict`)', 'No lineal', 'Los elementos se dispersan por una función hash.']
  ], ['Lineal: cada elemento tiene a lo sumo un anterior y un siguiente.', 'Estática: tamaño fijo y memoria contigua; dinámica: crece con enlaces.', 'Árboles, heaps, grafos y tablas hash son no lineales.'], 'Lineales: arreglos, listas, pilas, colas. No lineales: árboles, heaps, grafos, hash. Estáticas: tamaño fijo y contiguas; dinámicas: enlazadas.');

  H.clasif('n9-clasif-memoria', 9, 'A', 2, ['td_memoria'], 'Pila o montículo', 'Para cada elemento de un programa, indica en qué región de la memoria se guarda (S1-C2, diap. 6-7): **pila (stack)** o **montículo (heap)**.', ['Pila (stack)', 'Montículo (heap)'], [
    ['El parámetro `n` de una llamada a `factorial(3)`', 'Pila (stack)', 'Los parámetros viven en el marco de la llamada.'], ['La dirección de retorno de una llamada a función', 'Pila (stack)', 'Cada marco guarda su dirección de retorno.'], ['El marco de `factorial(2)` con sus variables locales', 'Pila (stack)', 'Cada llamada apila un marco.'],
    ['Un nodo de lista enlazada creado con `Nodo(5)`', 'Montículo (heap)', 'Los objetos creados en ejecución viven en el montículo.'], ['El objeto lista creado con `[1, 2, 3]`', 'Montículo (heap)', 'La referencia está en la pila, pero el objeto está en el montículo.'], ['Una instancia de una clase propia', 'Montículo (heap)', 'Los objetos se piden al montículo bajo demanda.'], ['Los nodos de un árbol creados en tiempo de ejecución', 'Montículo (heap)', 'Son objetos dinámicos enlazados.'], ['La variable local `contador` dentro de una función', 'Pila (stack)', 'Las variables locales se guardan en el marco.']
  ], ['Pila: variables locales, parámetros y retornos; se libera sola al terminar la función.', 'Montículo: objetos creados en ejecución; se piden bajo demanda.', 'Si algo «se crea» con una clase o un literal de lista, el objeto vive en el montículo.'], 'Pila = marcos de llamadas (automática). Montículo = objetos creados en ejecución (bajo demanda).');

  B({ id: 'n9-direccion', n: 9, e: 'A', dif: 2, c: ['td_estdin', 'ay_def'], tema: 'Dirección de un elemento',
    gen(rng) {
      const base = rng.pick([1000, 2000, 4096, 5000]), tam = rng.pick([1, 2, 4, 8]), i = rng.int(3, 14), tipoN = rng.pick(['v', 'A', 'datos']);
      return { tipo: 'salida', numerico: true, tol: 0, enunciado: 'Un arreglo `' + tipoN + '` está guardado en un bloque **contiguo** que empieza en la dirección **' + base + '**, y cada elemento ocupa **' + tam + ' byte' + (tam > 1 ? 's' : '') + '**. ¿En qué dirección está `' + tipoN + '[' + i + ']`?', esperado: String(base + i * tam), placeholder: 'Dirección', unidad: 'dirección en bytes',
        pistas: ['En memoria contigua: `dir(v[i]) = base + i × tam`.', 'Calcula `i × tam` y súmaselo a la base.', 'El elemento 0 está en la base; cada elemento siguiente, `tam` bytes más adelante.'],
        explicacion: '`dir(' + tipoN + '[' + i + ']) = ' + base + ' + ' + i + ' × ' + tam + ' = ' + (base + i * tam) + '`. Una multiplicación y una suma: costo constante, solo válido en memoria **contigua**.' };
    } });

  const PC = H.dd(`
    class Pila:
        def __init__(self):
            self.d = []
        def apilar(self, x):
            self.d.append(x)
        def desapilar(self):
            return self.d.pop()
        def tope(self):
            return self.d[-1]
    class Cola:
        def __init__(self):
            self.d = []
        def encolar(self, x):
            self.d.append(x)
        def desencolar(self):
            return self.d.pop(0)
        def frente(self):
            return self.d[0]
  `);
  B({ id: 'n9-tad-traza', n: 9, e: 'B', dif: 3, c: ['td_tad', 'td_axiomas', 'pc_pila', 'pc_cola'], tema: 'Pila y cola con las mismas operaciones',
    gen(rng, K) {
      const esPila = rng.chance(0.5), nombre = esPila ? 'p' : 'c', ent = esPila ? 'apilar' : 'encolar', sal = esPila ? 'desapilar' : 'desencolar', mira = esPila ? 'tope' : 'frente';
      const vals = rng.distinct(8, 1, 9); let k = 0, tam = 0; const lineas = [];
      const nOps = rng.int(7, 9);
      for (let i = 0; i < nOps; i++) {
        const r = rng.next();
        if (tam < 2 || r < 0.5) { lineas.push(nombre + '.' + ent + '(' + vals[k++ % vals.length] + ')'); tam++; }
        else if (r < 0.8) { lineas.push('print(' + nombre + '.' + sal + '())'); tam--; }
        else lineas.push('print(' + nombre + '.' + mira + '())');
      }
      lineas.push('print(' + nombre + '.d)');
      const code = PC + '\n' + nombre + ' = ' + (esPila ? 'Pila' : 'Cola') + '()\n' + lineas.join('\n');
      const esp = K.run(code);
      return { tipo: 'salida', multilinea: true, filas: 6, enunciado: 'Con las clases `Pila` (**LIFO**) y `Cola` (**FIFO**) de abajo, ¿qué imprime este programa? (una línea por cada `print`)', codigoVista: code, esperado: esp, stdout: true,
        pistas: ['`' + sal + '` quita un elemento y `print` lo muestra; `' + mira + '` lo muestra sin quitarlo.', esPila ? 'En la **pila** sale siempre el último que entró (el del final de la lista).' : 'En la **cola** sale siempre el primero que entró (el del inicio de la lista).', 'Lleva el contenido de la lista `.d` paso a paso después de cada operación.'],
        explicacion: 'Se aplican las reglas del TAD **' + (esPila ? 'Pila' : 'Cola') + '**: ' + (esPila ? '`desapilar(apilar(P, x)) = P` y `tope(apilar(P, x)) = x` (sale el último que entró).' : '`frente(encolar(C, x)) = frente(C)` si C no está vacía (sale el primero que entró).') + '\n\nSalida:\n```\n' + esp + '\n```' };
    } });

  B({ id: 'n9-tabla-conjunto', n: 9, e: 'B', dif: 3, c: ['td_impl', 'td_tad'], tema: 'Costos de dos implementaciones del TAD Conjunto',
    gen(rng) {
      const q = H.tablaCx(['Operación', 'ConjuntoLista (lista)', 'ConjuntoHash (dict)'], [
        ['`pertenece(x)`', ['O(n)', 'n'], ['O(1)', '1']], ['`insertar(x)` (verifica duplicado)', ['O(n)', 'n'], ['O(1)', '1']], ['`eliminar(x)`', ['O(n)', 'n'], ['O(1)', '1']]]);
      return Object.assign(q, { enunciado: 'Completa el costo **típico** de cada operación del TAD Conjunto con cada implementación de la clase (S1-C1, diap. 22-25). Usa la notación `O(...)` y el caso promedio para el hash.',
        pistas: ['La lista debe recorrer los datos para verificar si `x` está.', 'En el `dict` la posición se calcula con la función hash: ≈ 1 comparación en promedio.', 'Insertar en la lista cuesta n porque primero verifica que el elemento no esté repetido.'],
        explicacion: 'ConjuntoLista: `pertenece`, `insertar` y `eliminar` recorren la lista: O(n). ConjuntoHash: ≈ O(1) en promedio (a cambio de más memoria y sin garantizar el orden).' });
    } });

  const ESCEN = [
    { t: 'Un *dataloader* lee lotes de 256 imágenes ya cargadas, siempre en orden y siempre completas.', ok: 'Estática (contigua)', r: 'acceso secuencial por índice y localidad de caché' },
    { t: 'Un módulo mantiene una cola de tareas en la que constantemente se añaden y retiran elementos por los extremos.', ok: 'Dinámica (enlazada)', r: 'insertar y quitar en los extremos sin desplazar elementos' },
    { t: 'Un modelo de visión procesa imágenes de 224 × 224 × 3 píxeles cuya cantidad nunca cambia.', ok: 'Estática (contigua)', r: 'tamaño fijo, acceso directo por índice y localidad de caché' },
    { t: 'Un historial que crece sin tope conocido y al que se le insertan y eliminan elementos en posiciones conocidas.', ok: 'Dinámica (enlazada)', r: 'el tamaño es impredecible y domina la modificación estructural' },
    { t: 'Una matriz de pesos de una red neuronal sobre la que se hacen multiplicaciones de matrices millones de veces.', ok: 'Estática (contigua)', r: 'el cómputo recorre la memoria de forma predecible y se aprovecha la caché' }
  ];
  B({ id: 'n9-estdin-eleccion', n: 9, e: 'B', dif: 3, c: ['td_estdin', 'td_cache'], tema: 'Estática o dinámica',
    gen(rng, K) {
      const s = rng.pick(ESCEN), otra = s.ok.startsWith('Estática') ? 'Dinámica (enlazada)' : 'Estática (contigua)';
      return K.mc(rng, '**¿Qué tipo de asignación de memoria conviene?** ' + s.t + '\n\nElige la respuesta con la **razón dominante** correcta.', [[s.ok + ': ' + s.r + '.', 'Es la elección de la clase para este caso.']], [
        [otra + ': ' + (otra.startsWith('Estática') ? 'acceso directo por índice y localidad de caché' : 'insertar y quitar sin desplazar elementos') + '.', 'Esa razón corresponde al otro tipo de memoria, no al de este caso.'],
        [s.ok + ': porque ocupa menos memoria que cualquier otra estructura.', 'No es la razón dominante.'], [otra + ': porque Python no permite lo contrario.', 'Python permite ambas.']
      ], { pistas: ['Pregúntate qué domina: ¿el acceso por índice o las inserciones y borrados?', 'Contigua ⇒ acceso O(1) y buena localidad; enlazada ⇒ modificación barata en los extremos.', 'Piensa también si el tamaño es estable o impredecible.'], explicacion: 'Regla práctica de la clase: si domina el acceso y el tamaño es estable → **contigua**; si dominan inserciones/borrados en posiciones arbitrarias o los extremos → **enlazada**.' });
    } });

  const ALIAS = [
    r => { const a = r.distinct(3, 1, 9), x = r.int(10, 99); return { c: `a = [${a.join(', ')}]\nb = a\nb.append(${x})\nprint(a)\nprint(len(b))`, e: '`b = a` copia la **referencia**: hay un solo objeto; `append` lo modifica en el sitio y `a` lo ve.' }; },
    r => { const a = r.distinct(3, 1, 9), x = r.int(10, 99); return { c: `a = [${a.join(', ')}]\nb = a[:]\nb.append(${x})\nprint(a)\nprint(b)`, e: '`a[:]` crea una **copia** (objeto nuevo): modificar `b` no cambia `a`.' }; },
    r => { const n = r.int(3, 9), k = r.int(2, 6); return { c: `x = ${n}\ny = x\ny += ${k}\nprint(x, y)`, e: 'Los `int` son **inmutables**: `y += k` crea otro objeto y `y` apunta a él; `x` no cambia.' }; },
    r => { const a = r.distinct(2, 1, 9), v = r.int(10, 99); return { c: `def agrega(lista):\n    lista.append(${v})\n    lista = [0]\n    return lista\n\na = [${a.join(', ')}]\nr = agrega(a)\nprint(a)\nprint(r)`, e: '`lista.append(v)` modifica el objeto compartido (`a` lo ve); luego `lista = [0]` solo mueve la referencia **local**.' }; },
    r => { const s = r.pick(['uno', 'luz', 'sol', 'mar']), t = r.pick(['!', '?', '.']); return { c: `s = "${s}"\nt = s\nt += "${t}"\nprint(s)\nprint(t)`, e: 'Los `str` son **inmutables**: `t += ...` crea una cadena nueva; `s` no cambia.' }; },
    r => { const a = r.distinct(2, 1, 9), x = r.int(10, 99); return { c: `a = [${a.join(', ')}]\nb = [a, a]\na.append(${x})\nprint(b)\nprint(b[0] is b[1])`, e: '`b` contiene **dos referencias al mismo objeto** `a`: al modificar `a`, ambas posiciones ven el cambio.' }; }
  ];
  B({ id: 'n9-alias-salida', n: 9, e: 'B', dif: 3, c: ['td_ref'], tema: 'Alias y mutabilidad: ¿qué imprime?',
    gen(rng, K) {
      const p = rng.pick(ALIAS)(rng), esp = K.run(p.c);
      return { tipo: 'salida', multilinea: true, filas: 4, enunciado: 'Recuerda: **asignar con `=` copia la referencia, no el objeto**. ¿Qué imprime este programa? (una línea por cada `print`)', codigoVista: p.c, esperado: esp, stdout: true,
        pistas: ['Dibuja los nombres y los objetos: ¿cada asignación crea un objeto nuevo o solo mueve una flecha?', 'Mutables (`list`, `dict`): los alias ven el cambio. Inmutables (`int`, `str`, `tuple`): «cambiar» crea otro objeto.', 'Sigue el programa línea a línea y anota hacia dónde apunta cada nombre.'],
        explicacion: p.e + '\n\nSalida:\n```\n' + esp + '\n```',
        sim: H.sim(Sim.memoria.escenario('alias').frames, Sim.memoria.escenario('alias').codigo, 'Programa', 'alias de una lista (b = a)') };
    } });

  const COPIAS = [
    r => { const a = r.distinct(2, 1, 9), b = r.distinct(2, 1, 9), x = r.int(10, 99); return { c: `import copy\no = [[${a.join(', ')}], [${b.join(', ')}]]\ns = copy.copy(o)\np = copy.deepcopy(o)\no[0].append(${x})\nprint(s)\nprint(p)\nprint(o)`, e: 'La copia **superficial** comparte las listas internas (ve el `append`); la **profunda** tiene las suyas.' }; },
    r => { const a = r.distinct(2, 1, 9), b = r.distinct(2, 1, 9), x = r.int(10, 99); return { c: `import copy\no = [[${a.join(', ')}], [${b.join(', ')}]]\ns = copy.copy(o)\no.append([${x}])\no[1] = [0]\nprint(s)\nprint(o)`, e: 'La copia superficial copió la **lista externa**: agregar o reemplazar elementos de `o` no la afecta (solo mutar una lista interna compartida sí).' }; },
    r => { const a = r.distinct(3, 1, 9), x = r.int(10, 99); return { c: `a = [${a.join(', ')}]\nb = list(a)\nc = a\nb.append(${x})\nc.append(0)\nprint(a)\nprint(b)`, e: '`list(a)` crea un objeto nuevo (copia superficial); `c = a` es un alias.' }; },
    r => { const v = r.distinct(2, 1, 9), x = r.int(10, 99); return { c: `d = {"x": [${v.join(', ')}], "n": 1}\ne = d.copy()\ne["x"].append(${x})\ne["n"] = 2\nprint(d)\nprint(e)`, e: '`dict.copy()` es **superficial**: la lista interna es compartida, pero reasignar la clave `"n"` en `e` no afecta a `d`.' }; },
    r => { const a = r.distinct(2, 1, 9), x = r.int(10, 99); return { c: `import copy\no = [[${a.join(', ')}]]\np = copy.deepcopy(o)\np[0].append(${x})\ns = o[:]\ns[0].append(7)\nprint(o)\nprint(p)`, e: '`o[:]` es una copia superficial (comparte la lista interna); `deepcopy` es independiente.' }; }
  ];
  B({ id: 'n9-copia-salida', n: 9, e: 'C', dif: 4, c: ['td_copia', 'td_ref'], tema: 'Copia superficial y profunda: ¿qué imprime?',
    gen(rng, K) {
      const p = rng.pick(COPIAS)(rng), esp = K.run(p.c);
      return { tipo: 'salida', multilinea: true, filas: 4, enunciado: 'Distingue **alias**, **copia superficial** (comparte lo de adentro) y **copia profunda** (copia todo el árbol). ¿Qué imprime este programa?', codigoVista: p.c, esperado: esp, stdout: true,
        pistas: ['Cuenta cuántos objetos nuevos crea cada línea y cuáles se comparten.', 'Una copia superficial duplica solo el objeto externo; las listas internas siguen siendo las mismas.', 'Reasignar un elemento (`o[1] = ...`) no es lo mismo que mutar una lista interna compartida (`o[0].append(...)`).'],
        explicacion: p.e + '\n\nSalida:\n```\n' + esp + '\n```',
        sim: H.sim(Sim.memoria.escenario('copias').frames, Sim.memoria.escenario('copias').codigo, 'Programa', 'copia superficial y profunda') };
    } });

  B({ id: 'n9-defecto-mutable', n: 9, e: 'C', dif: 4, c: ['td_copia', 'td_ref', 'rc_cache'], tema: 'Argumento por defecto mutable',
    gen(rng, K) {
      const v = rng.distinct(3, 1, 9), uso = rng.int(0, 2);
      const lib = uso === 0 ? `def g(x, acc=[]):\n    acc.append(x)\n    return acc\n\nprint(g(${v[0]}))\nprint(g(${v[1]}))\nprint(g(${v[2]}, []))\nprint(g(${v[0]}))`
        : uso === 1 ? `def h(x, acc=None):\n    if acc is None:\n        acc = []\n    acc.append(x)\n    return acc\n\nprint(h(${v[0]}))\nprint(h(${v[1]}))\nprint(h(${v[2]}, [9]))\nprint(h(${v[0]}))`
          : `def f(x, d={}):\n    d[x] = len(d)\n    return len(d)\n\nprint(f(${v[0]}))\nprint(f(${v[1]}))\nprint(f(${v[0]}))\nprint(f(${v[2]}, {}))`;
      const esp = K.run(lib);
      return { tipo: 'salida', multilinea: true, filas: 4, enunciado: 'Un valor por defecto **mutable** se crea **una sola vez** al definir la función. ¿Qué imprime este programa?', codigoVista: lib, esperado: esp, stdout: true,
        pistas: ['¿Se pasó el argumento opcional en cada llamada? Si no, se usa el objeto por defecto (el mismo siempre).', 'Con `acc=None`, cada llamada crea su propia lista; con `acc=[]`, la lista se conserva entre llamadas.', 'Anota el contenido del objeto por defecto después de cada llamada.'],
        explicacion: 'Salida:\n```\n' + esp + '\n```\nPatrón correcto: `acc=None` y crear la lista **dentro** de la función.',
        sim: H.sim(Sim.memoria.escenario('defecto').frames, Sim.memoria.escenario('defecto').codigo, 'Programa', 'argumento por defecto mutable') };
    } });

  B({ id: 'n9-cache-estimar', n: 9, e: 'B', dif: 3, c: ['td_cache'], tema: 'Memoria de una lista y de un ndarray',
    gen(rng) {
      const n = rng.pick([100000, 200000, 500000, 1000000, 2000000]), esLista = rng.chance(0.5), mb = esLista ? n * 36 / 1e6 : n * 8 / 1e6;
      return { tipo: 'salida', numerico: true, tol: 0.001, enunciado: 'Con las cifras de la clase (S1-C2, diap. 18): una `list` de Python guarda un arreglo de **referencias de 8 bytes** y cada entero es un objeto de **≈ 28 bytes**; un `numpy.ndarray` de `int64` guarda **8 bytes** por valor. ¿Cuántos **megabytes** (1 MB = 10⁶ bytes) ocupa ' + (esLista ? 'una **list**' : 'un **ndarray**') + ' de **' + n.toLocaleString('es-CO') + '** enteros?', esperado: String(mb), placeholder: 'Megabytes', unidad: 'MB',
        pistas: [esLista ? 'Por elemento: 8 B de referencia + 28 B del objeto int = 36 B.' : 'Por elemento: solo los 8 bytes del valor en crudo.', 'Multiplica por n y divide entre 10⁶.', 'Con n = 10⁶ la list ocupa ≈ 36 MB y el ndarray 8 MB (factor ≈ 4,5×).'],
        explicacion: (esLista ? n + ' × 36 B = ' + n * 36 + ' B = **' + mb + ' MB**' : n + ' × 8 B = ' + n * 8 + ' B = **' + mb + ' MB**') + '. La lista pesa ≈ 4,5× más que el ndarray por las referencias y los encabezados de objeto.' };
    } });

  H.vf('n9-vf-memoria', 9, 'A', 2, ['td_memoria', 'td_estdin', 'td_ref', 'td_copia', 'td_cache'], 'Memoria, referencias y caché (V/F)', [
    { a: 'Puede haber memoria libre suficiente en total y aun así fallar la reserva de un bloque grande.', v: true, e: 'Por fragmentación: no existe un hueco contiguo suficientemente grande.', j: ['La memoria libre puede estar repartida en huecos pequeños y no contiguos (fragmentación).', 'Porque la memoria libre siempre se agota antes de tiempo.', 'Porque el recolector de basura bloquea la memoria.'] },
    { a: 'En Python, `b = a` con `a` una lista crea una copia independiente de la lista.', v: false, e: 'Solo copia la referencia: `a` y `b` son alias del mismo objeto.', j: ['La asignación copia la referencia, no el objeto: los dos nombres apuntan al mismo bloque.', 'Python copia siempre los objetos pequeños.', 'Solo las listas vacías se copian.'] },
    { a: 'La fórmula `dir(v[i]) = base + i × tam` es válida también para los nodos de una lista enlazada.', v: false, e: 'Solo vale en memoria contigua; los nodos enlazados están dispersos.', j: ['En memoria enlazada no hay relación aritmética entre las direcciones de los nodos.', 'Porque los nodos son más grandes que los elementos de un arreglo.', 'Porque la lista enlazada siempre empieza en la dirección 0.'] },
    { a: 'Una copia superficial de una lista de listas garantiza independencia total entre la copia y el original.', v: false, e: 'Comparte las listas internas; solo `deepcopy` las copia.', j: ['La copia superficial duplica solo la lista externa y comparte las internas.', 'Porque copy.copy solo funciona con enteros.', 'Porque deepcopy es igual que copy.copy.'] },
    { a: 'Un `numpy.ndarray` de un millón de enteros ocupa menos memoria que la `list` equivalente.', v: true, e: '≈ 8 MB frente a ≈ 36 MB: guarda los valores en crudo y contiguos.', j: ['Guarda los valores en crudo (8 B) sin encabezado por elemento; la list guarda además una referencia y un objeto por entero.', 'Porque numpy comprime los números.', 'Porque usa enteros más pequeños de 1 byte.'] },
    { a: 'Dos programas con el mismo número de operaciones tardan siempre lo mismo.', v: false, e: 'La localidad de caché puede cambiar el tiempo real hasta ≈ 10×.', j: ['La notación O ignora la localidad de caché: recorrer memoria contigua es mucho más barato que saltar por memoria dispersa.', 'Porque el reloj de la CPU cambia.', 'Porque Python siempre tarda lo mismo.'] },
    { a: 'En Python un objeto se libera en cuanto deja de usarse.', v: false, e: 'Se libera cuando nadie lo referencia (conteo de referencias llega a cero).', j: ['Un objeto se libera cuando su contador de referencias llega a cero, no cuando «deja de usarse».', 'Se libera siempre al terminar la función.', 'Python nunca libera objetos.'] },
    { a: '`def f(x, acc=[])` crea una lista nueva en cada llamada que no pase `acc`.', v: false, e: 'La lista por defecto se crea una sola vez al definir la función y se comparte.', j: ['Los valores por defecto se evalúan una sola vez, al definir la función.', 'Porque Python copia la lista en cada llamada.', 'Porque acc es una variable global.'] }
  ], ['Piensa si cada operación copia un **objeto** o solo una **referencia**.', 'Contiguo ≠ enlazado: la fórmula de direcciones solo vale en bloques contiguos.', 'La notación O no mide la localidad de caché.']);

  /* =====================================================================================================================================
     NIVEL 10 · Arreglos y técnicas
     ===================================================================================================================================== */
  H.vf('n10-vf', 10, 'A', 1, ['ay_def', 'ay_pref', 'ay_kad', 'ay_dos', 'ay_ven', 'ay_int'], 'Arreglos y técnicas (V/F)', [
    { a: 'Insertar un elemento al inicio de un arreglo de n elementos cuesta O(1).', v: false, e: 'Hay que desplazar los n elementos una posición: O(n).', j: ['Hay que desplazar los n elementos para dejar libre la casilla 0: costo O(n).', 'Porque el arreglo es contiguo y no hay que mover nada.', 'Porque la inserción siempre es O(1) en Python.'] },
    { a: 'El acceso `A[i]` en un arreglo cuesta O(1) porque `dir(A[i]) = base + i × tam`.', v: true, e: 'Una multiplicación y una suma sobre memoria contigua.', j: ['La dirección se calcula con una fórmula, sin recorrer elementos.', 'Porque el arreglo está siempre ordenado.', 'Porque Python guarda un índice por elemento.'] },
    { a: 'La suma de prefijos permite responder cada consulta de rango en O(1) tras un preproceso O(n).', v: true, e: 'q(i, j) = P[j] − P[i−1].', j: ['Cada consulta es una resta de dos prefijos; el preproceso se hace una sola vez.', 'Porque ordena el arreglo antes de consultar.', 'Porque solo funciona con arreglos de un elemento.'] },
    { a: 'Kadane inicializado con `s_max = 0` también funciona cuando todos los números son negativos.', v: false, e: 'Devolvería 0 (subarreglo vacío) en vez del mayor elemento negativo.', j: ['Con todos negativos la respuesta correcta es el mayor de ellos; s_max = 0 devolvería 0, un subarreglo vacío.', 'Porque Kadane solo funciona con números positivos.', 'Porque cero es siempre el máximo.'] },
    { a: 'La técnica de dos punteros para hallar un par que suma S exige que el arreglo esté ordenado.', v: true, e: 'La regla de movimiento (suma corta → avanza l; larga → retrocede r) solo es válida si está ordenado.', j: ['Solo con orden se sabe en qué dirección cambia la suma al mover cada puntero.', 'Porque los punteros no pueden cruzarse.', 'Porque Python exige arreglos ordenados.'] },
    { a: 'La ventana deslizante es O(n²) porque tiene un `while` dentro de un `for`.', v: false, e: 'Cada elemento entra y sale una vez: 2n operaciones, O(n) amortizado.', j: ['Cada carácter entra una vez y sale a lo sumo una vez, así que el total es lineal.', 'Porque el while recorre siempre todo el arreglo.', 'Porque usa un conjunto.'] },
    { a: 'Merge intervals necesita ordenar los intervalos por su extremo izquierdo antes de recorrerlos.', v: true, e: 'Tras ordenar, un intervalo solo puede solaparse con el último de la salida.', j: ['Con el orden, basta comparar con el último intervalo de la salida.', 'Para que los intervalos sean más cortos.', 'Porque Python no admite intervalos sin ordenar.'] },
    { a: 'Un subarreglo contiguo y una subsecuencia son lo mismo.', v: false, e: 'La subsecuencia puede saltar elementos; el subarreglo debe ser contiguo.', j: ['El subarreglo exige elementos vecinos; la subsecuencia no.', 'Son lo mismo cuando el arreglo tiene más de 3 elementos.', 'La subsecuencia exige elementos ordenados.'] },
    { a: 'Las técnicas de la clase comparten la idea de no recomputar: mantienen un estado que se actualiza en una sola pasada.', v: true, e: 'Prefijo, mejor acumulado, ventana o último intervalo.', j: ['Todas guardan un estado (prefijo, acumulado, ventana…) y lo actualizan al recorrer el arreglo.', 'Todas ordenan el arreglo primero.', 'Todas usan recursión.'] },
    { a: '`list.append` es O(1) amortizado aunque a veces cueste O(n).', v: true, e: 'Cuando se llena, se reserva el doble y se copia; ocurre cada vez menos seguido.', j: ['El crecimiento duplica la capacidad: el costo de copiar se reparte entre muchas inserciones.', 'Porque append nunca copia nada.', 'Porque la lista de Python es una lista enlazada.'] }
  ], ['Piensa en qué hace la operación con los elementos: ¿los desplaza, los recorre o los salta?', 'Una pasada con un estado que se actualiza ⇒ O(n).', 'Recuerda las precondiciones: dos punteros exige orden; merge intervals ordena primero.']);

  B({ id: 'n10-acceso', n: 10, e: 'A', dif: 2, c: ['ay_def'], tema: 'Acceso y dirección en un arreglo',
    gen(rng) {
      const n = rng.int(5, 8), base = rng.pick([2000, 1000, 3000, 4000]), tam = rng.pick([4, 8]), i = rng.int(2, n - 1);
      const vals = rng.distinct(n, 3, 60), m = Sim.arreglo.nuevo(vals, n + 1, { base, tam });
      const f = Sim.arreglo.cuadro(Object.assign({}, m, { a: m.a }), 'Arreglo de ' + n + ' elementos.');
      const a = Sim.arreglo.acceso(m, i);
      return { tipo: 'salida', numerico: true, tol: 0, enunciado: 'El arreglo `A` (de la figura) está en memoria **contigua** desde la dirección **' + base + '** y cada elemento ocupa **' + tam + ' bytes**. ¿En qué **dirección** está `A[' + i + ']` (que vale **' + vals[i] + '**)?', figura: H.fig(f, 'A = ' + H.lst(vals)), esperado: String(base + i * tam), placeholder: 'Dirección',
        pistas: ['`dir(A[i]) = base + i × tam`.', 'El primer elemento (índice 0) está en la base.', 'Calcula `' + i + ' × ' + tam + '` y súmalo a ' + base + '.'],
        explicacion: '`dir(A[' + i + ']) = ' + base + ' + ' + i + ' × ' + tam + ' = ' + (base + i * tam) + '`: una multiplicación y una suma, **O(1)**.', sim: H.sim(a.frames, null, null, 'acceso por índice') };
    } });

  B({ id: 'n10-tabla-ops', n: 10, e: 'A', dif: 2, c: ['ay_def'], tema: 'Tabla de operaciones del arreglo',
    gen() {
      const q = H.tablaCx(['Operación', 'Costo en el peor caso'], [['Acceso `A[i]`', ['O(1)', '1']], ['Búsqueda de un valor (sin orden)', ['O(n)', 'n']], ['Insertar en una posición arbitraria', ['O(n)', 'n']], ['Eliminar una posición arbitraria', ['O(n)', 'n']], ['Agregar al final de un arreglo dinámico (`append`)', ['O(1) amortizado', '1 amortizado', 'O(1) amortizada']]]);
      return Object.assign(q, { enunciado: 'Completa la tabla de operaciones de un **arreglo** (S3-C1, diap. 6). En el último caso escribe «amortizado».', pistas: ['El acceso usa una fórmula de direcciones; la búsqueda, la inserción y la eliminación recorren o desplazan elementos.', 'Insertar/eliminar obliga a desplazar los elementos siguientes.', '`append` duplica la capacidad cuando se llena: costo amortizado.'], explicacion: 'Acceso O(1); búsqueda, inserción y eliminación O(n); `append` O(1) amortizado.' });
    } });

  B({ id: 'n10-desplazamientos', n: 10, e: 'B', dif: 2, c: ['ay_def'], tema: 'Desplazamientos al insertar o eliminar',
    gen(rng) {
      const n = rng.int(5, 8), vals = rng.distinct(n, 3, 60), ins = rng.chance(0.5), m = Sim.arreglo.nuevo(vals, n + 2);
      const i = ins ? rng.int(0, n) : rng.int(0, n - 1), x = rng.int(70, 99), r = ins ? Sim.arreglo.insertar(m, i, x) : Sim.arreglo.eliminar(m, i), d = r.desplazamientos;
      const f = Sim.arreglo.cuadro(m, 'Arreglo con ' + n + ' elementos.');
      return { tipo: 'salida', numerico: true, tol: 0, enunciado: ins ? 'En el arreglo `A` de la figura (con espacio libre al final), se **inserta ' + x + ' en la posición ' + i + '**. ¿Cuántos elementos hay que **desplazar** una casilla a la derecha?' : 'En el arreglo `A` de la figura, se **elimina el elemento de la posición ' + i + '**. ¿Cuántos elementos hay que **desplazar** una casilla a la izquierda?', figura: H.fig(f, 'A = ' + H.lst(vals) + ' (n = ' + n + ')'), esperado: String(d), placeholder: 'Desplazamientos',
        pistas: [ins ? 'Se desplazan todos los elementos desde la posición `i` hasta el final: `n − i`.' : 'Se desplazan los que están después de la posición eliminada: `n − 1 − i`.', 'La posición 0 es el peor caso: se mueven todos.', 'Cuenta cuántos elementos quedan a la derecha de la posición.'],
        explicacion: ins ? 'Insertar en `i = ' + i + '` con `n = ' + n + '`: se desplazan `n − i = ' + d + '` elementos (peor caso: i = 0, n desplazamientos).' : 'Eliminar la posición `i = ' + i + '` con `n = ' + n + '`: se desplazan `n − 1 − i = ' + d + '` elementos.', sim: H.sim(r.frames, Sim.arreglo.ARR_COD[ins ? 'insertar' : 'eliminar'], ins ? 'insertar' : 'eliminar', ins ? 'insertar con desplazamientos' : 'eliminar con desplazamientos') };
    } });

  B({ id: 'n10-prefijos-calc', n: 10, e: 'B', dif: 2, c: ['ay_pref'], tema: 'Construir el arreglo de prefijos',
    gen(rng) {
      const n = rng.int(6, 8), A = Array.from({ length: n }, () => rng.int(0, 9)), P = []; A.forEach((v, i) => P.push((i ? P[i - 1] : 0) + v));
      const r = Sim.tecnicas.prefijos(A, [[1, n - 2]]), f = r.frames[0];
      return { tipo: 'salida', tokens: true, enunciado: 'Dado `A = ' + H.lst(A) + '`, escribe su **arreglo de prefijos** `P` (`P[0] = A[0]` y `P[i] = P[i−1] + A[i]`), con los valores separados por espacios o comas.', esperado: P.join(' '), placeholder: 'P[0] P[1] …', figura: H.fig(f, 'Arreglo A'),
        pistas: ['`P[0]` es igual a `A[0]`.', 'Cada `P[i]` suma el elemento nuevo al prefijo anterior.', 'El último prefijo debe ser la suma de todo el arreglo (' + A.reduce((s, x) => s + x, 0) + ').'],
        explicacion: '`P = ' + H.lst(P) + '`. Con él, `q(i, j) = P[j] − P[i−1]` responde cada consulta de rango en **O(1)**.', sim: H.sim(r.frames, Sim.tecnicas.PRE_COD, 'SumaRango', 'suma de prefijos') };
    } });

  B({ id: 'n10-prefijos-consulta', n: 10, e: 'B', dif: 3, c: ['ay_pref'], tema: 'Consulta de rango con prefijos',
    gen(rng) {
      const n = rng.int(6, 9), A = Array.from({ length: n }, () => rng.int(0, 9)), P = []; A.forEach((v, i) => P.push((i ? P[i - 1] : 0) + v));
      const i = rng.chance(0.25) ? 0 : rng.int(1, n - 3), j = rng.int(i + 1, n - 1), val = i === 0 ? P[j] : P[j] - P[i - 1];
      return { tipo: 'salida', numerico: true, tol: 0, enunciado: 'Se construyó el arreglo de prefijos `P = ' + H.lst(P) + '` a partir de un arreglo `A`. Usando **solo `P`** (no `A`), calcula la suma de rango `q(' + i + ', ' + j + ')` = `A[' + i + '] + … + A[' + j + ']`.', esperado: String(val), placeholder: 'Suma',
        pistas: ['`q(i, j) = P[j] − P[i−1]`.', i === 0 ? 'Cuando `i = 0` no hay `P[−1]`: la respuesta es simplemente `P[j]`.' : 'Resta el prefijo que termina justo antes de `i`.', 'Costo: dos lecturas y una resta: O(1).'],
        explicacion: i === 0 ? '`q(0, ' + j + ') = P[' + j + '] = ' + P[j] + '`.' : '`q(' + i + ', ' + j + ') = P[' + j + '] − P[' + (i - 1) + '] = ' + P[j] + ' − ' + P[i - 1] + ' = ' + val + '`.' };
    } });

  B({ id: 'n10-prefijos-impl', n: 10, e: 'C', dif: 3, c: ['ay_pref'], tema: 'Implementar consultas con prefijos',
    gen(rng) {
      const sol = H.dd(`
        def sumas_de_rango(A, consultas):
            P = [0] * len(A)
            P[0] = A[0]
            for i in range(1, len(A)):
                P[i] = P[i - 1] + A[i]
            return [P[j] if i == 0 else P[j] - P[i - 1] for i, j in consultas]
      `);
      const lento = H.dd(`
        def sumas_de_rango(A, consultas):
            return [sum(A[i:j + 1]) for i, j in consultas]
      `);
      const grande = 'list(range(1, 301))', cons = '[(0, 299), (5, 250), (100, 101)] * 60';
      const q = PQ.codigoQ({ enun: 'Escribe `sumas_de_rango(A, consultas)` que reciba un arreglo `A` y una lista de consultas `(i, j)` (con `i ≤ j`) y devuelva la lista con la suma de `A[i..j]` de cada una. Debe usar **suma de prefijos**: una pasada para construir y **O(1)** por consulta.', vista: null, starter: 'def sumas_de_rango(A, consultas):\n    # complete aquí\n    pass\n', solucion: sol, lento, prelude: '',
        tests: ['sumas_de_rango([5, 4, 9, 0, 1, 3], [(2, 4), (0, 5), (3, 3)])', 'sumas_de_rango([7], [(0, 0)])', 'sumas_de_rango([3, 1, 4, 1, 5], [(1, 3), (0, 0), (0, 4)])', 'sumas_de_rango([-2, 5, -1], [(0, 2), (1, 1)])'], ef: ['sumas_de_rango(' + grande + ', ' + cons + ')'], efDesc: 'sumas_de_rango(300 elementos, 180 consultas)  (eficiencia)', fn: 'sumas_de_rango', ejemplo: 'sumas_de_rango([5, 4, 9, 0, 1, 3], [(2, 4)])', factor: 4 });
      q.pistas = ['Construye `P` con una pasada: `P[0] = A[0]` y `P[i] = P[i-1] + A[i]`.', 'Para cada `(i, j)`: si `i == 0` responde `P[j]`; si no, `P[j] - P[i-1]`.', 'Sumar el rango con `sum(A[i:j+1])` en cada consulta es correcto pero cuesta O(n) por consulta.'];
      q.explicacion = 'Solución O(n + Q):\n```\n' + sol + '\n```\nLa versión con `sum(A[i:j+1])` es correcta pero O(n) por consulta.';
      return q;
    } });

  B({ id: 'n10-kadane-traza', n: 10, e: 'B', dif: 3, c: ['ay_kad'], tema: 'Traza de Kadane',
    gen(rng) {
      const n = rng.int(6, 8), A = Array.from({ length: n }, () => rng.int(-6, 7)); while (A.every(x => x >= 0)) A[rng.int(0, n - 1)] = -rng.int(1, 6);
      const act = [A[0]], mx = [A[0]]; for (let i = 1; i < n; i++) { act.push(Math.max(A[i], act[i - 1] + A[i])); mx.push(Math.max(mx[i - 1], act[i])); }
      const idx = rng.sample(Array.from({ length: n - 1 }, (_, i) => i + 1), 3).sort((a, b) => a - b), r = Sim.tecnicas.kadane(A);
      const filas = Array.from({ length: n }, (_, i) => [{ t: String(i) }, { t: String(A[i]) }, idx.includes(i) ? { in: [String(act[i])], w: 5 } : { t: String(act[i]) }, idx.includes(i) ? { in: [String(mx[i])], w: 5 } : { t: String(mx[i]) }]);
      return { tipo: 'tabla', enunciado: 'Aplica **Kadane** a `A = ' + H.lst(A) + '`: `S_act[i] = máx(A[i], S_act[i−1] + A[i])` y `S_max[i] = máx(S_max[i−1], S_act[i])`. Completa las celdas vacías de la traza.', cols: ['i', 'A[i]', 'S_act', 'S_max'], filas,
        pistas: ['`S_act[0] = S_max[0] = A[0]`.', 'En cada paso decide: ¿extiendo (`S_act[i−1] + A[i]`) o reinicio (`A[i]`)?', '`S_max` es el mayor `S_act` visto hasta ese índice.'],
        explicacion: 'S_act = ' + H.lst(act) + '; S_max = ' + H.lst(mx) + '. El máximo es **' + mx[n - 1] + '**.', sim: H.sim(r.frames, Sim.tecnicas.KAD_COD, 'max_subarreglo', 'Kadane') };
    } });

  B({ id: 'n10-kadane-impl', n: 10, e: 'C', dif: 4, c: ['ay_kad'], tema: 'Implementar Kadane',
    gen() {
      const sol = H.dd(`
        def max_subarreglo(A):
            s_actual = s_max = A[0]
            for i in range(1, len(A)):
                s_actual = max(A[i], s_actual + A[i])
                s_max = max(s_max, s_actual)
            return s_max
      `);
      const lento = H.dd(`
        def max_subarreglo(A):
            mejor = A[0]
            for i in range(len(A)):
                for j in range(i, len(A)):
                    mejor = max(mejor, sum(A[i:j + 1]))
            return mejor
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `max_subarreglo(A)` que devuelva la **suma máxima de un subarreglo contiguo no vacío** de `A` en **una sola pasada** (O(n) tiempo, O(1) espacio). Ojo con los casos en que **todos** los números son negativos.', starter: 'def max_subarreglo(A):\n    # complete aquí\n    pass\n', solucion: sol, lento, prelude: '',
        tests: ['max_subarreglo([-2, 1, -3, 4, -1, 2, 1, -5, 4])', 'max_subarreglo([-5, -2, -8, -1])', 'max_subarreglo([7])', 'max_subarreglo([1, 2, 3])', 'max_subarreglo([-1, 5, -1, 5, -1])'], ef: ['max_subarreglo(list(range(-40, 120)) * 2)'], efDesc: 'max_subarreglo(320 elementos)  (eficiencia)', fn: 'max_subarreglo', ejemplo: 'max_subarreglo([-2, 1, -3, 4])', factor: 4 });
      q.pistas = ['Lleva dos variables: la mejor suma que **termina** en `i` y la mejor suma vista.', 'Inicializa con `A[0]` (no con 0).', 's_actual = max(A[i], s_actual + A[i]): extender o reiniciar.'];
      q.explicacion = 'Kadane:\n```\n' + sol + '\n```\nInicializar `s_max = 0` falla con todos negativos.';
      return q;
    } });

  B({ id: 'n10-dos-punteros-traza', n: 10, e: 'B', dif: 3, c: ['ay_dos'], tema: 'Traza de dos punteros',
    gen(rng, K) {
      const n = rng.int(6, 8), A = rng.distinct(n, 1, 40).sort((a, b) => a - b), existe = rng.chance(0.6);
      let S; if (existe) { const i = rng.int(0, n - 2), j = rng.int(i + 1, n - 1); S = A[i] + A[j]; } else S = A[0] + A[1] - 1;
      const code = H.dd(`
        def par_que_suma(A, S):
            l, r = 0, len(A) - 1
            while l < r:
                suma = A[l] + A[r]
                print(l, r, suma)
                if suma == S:
                    return (l, r)
                elif suma < S:
                    l += 1
                else:
                    r -= 1
            return None
        print(par_que_suma(${H.lst(A)}, ${S}))
      `);
      const esp = K.run(code), r = Sim.tecnicas.dosPunteros(A, S);
      return { tipo: 'salida', multilinea: true, filas: 5, enunciado: 'Con el arreglo **ordenado** `A = ' + H.lst(A) + '` y `S = ' + S + '`, ¿qué imprime este programa? (cada línea del bucle muestra `l r suma`; la última línea es el valor devuelto)', codigoVista: code, esperado: esp, stdout: true,
        pistas: ['Empieza con `l = 0` y `r = ' + (n - 1) + '`.', 'Si la suma es menor que S, avanza `l`; si es mayor, retrocede `r`.', 'Para cuando la suma sea igual a S o `l` alcance a `r`.'],
        explicacion: 'Cada vuelta descarta un elemento: ' + r.pasos + ' pasos como máximo n−1 (**O(n)**).\n```\n' + esp + '\n```', sim: H.sim(r.frames, Sim.tecnicas.DOS_COD, 'par_que_suma', 'dos punteros') };
    } });

  B({ id: 'n10-dos-impl', n: 10, e: 'C', dif: 4, c: ['ay_dos'], tema: 'Implementar dos punteros',
    gen() {
      const sol = H.dd(`
        def par_que_suma(A, S):
            l, r = 0, len(A) - 1
            while l < r:
                suma = A[l] + A[r]
                if suma == S:
                    return (l, r)
                elif suma < S:
                    l += 1
                else:
                    r -= 1
            return None
      `);
      const lento = H.dd(`
        def par_que_suma(A, S):
            for i in range(len(A)):
                for j in range(i + 1, len(A)):
                    if A[i] + A[j] == S:
                        return (i, j)
            return None
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `par_que_suma(A, S)` para un arreglo **ordenado** `A`: devuelve la tupla de índices `(i, j)` con `i < j` y `A[i] + A[j] == S`, o `None` si no existe. Usa **dos punteros** (O(n)).', starter: 'def par_que_suma(A, S):\n    # complete aquí\n    pass\n', solucion: sol, lento, prelude: '',
        tests: ['par_que_suma([1, 3, 4, 6, 8, 11, 15], 14)', 'par_que_suma([1, 3, 4, 6, 8, 11, 15], 100)', 'par_que_suma([2, 5], 7)', 'par_que_suma([2], 4)', 'par_que_suma([], 3)', 'par_que_suma([1, 2, 3, 4, 5], 9)'], ef: ['par_que_suma(list(range(0, 600)), 1)', 'par_que_suma(list(range(0, 300, 2)), 1001)'], efDesc: 'par_que_suma con 300-600 elementos  (eficiencia)', fn: 'par_que_suma', ejemplo: 'par_que_suma([1, 3, 4, 6], 7)', factor: 4 });
      q.pistas = ['Empieza con un puntero en cada extremo: `l = 0`, `r = len(A) - 1`.', 'Suma corta → avanza `l`; suma larga → retrocede `r`.', 'El `while` debe parar cuando `l >= r` (devuelve `None`).'];
      q.explicacion = 'Dos punteros:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n10-ventana-salida', n: 10, e: 'B', dif: 3, c: ['ay_ven'], tema: 'Ventana deslizante: ¿qué devuelve?',
    gen(rng, K) {
      const letras = rng.sample('abcdefg'.split(''), rng.int(3, 4)), len = rng.int(7, 10); let s = ''; for (let i = 0; i < len; i++) s += rng.pick(letras);
      const code = H.dd(`
        def subcadena_sin_repetir(s):
            vistos = set()
            l = mejor = 0
            for r in range(len(s)):
                while s[r] in vistos:
                    vistos.remove(s[l])
                    l += 1
                vistos.add(s[r])
                mejor = max(mejor, r - l + 1)
            return mejor
        print(subcadena_sin_repetir("${s}"))
      `);
      const esp = K.run(code), r = Sim.tecnicas.ventana(s);
      return { tipo: 'salida', numerico: true, tol: 0, enunciado: '¿Qué imprime este programa? (longitud de la subcadena **más larga sin caracteres repetidos** de `"' + s + '"`)', codigoVista: code, esperado: esp, stdout: true, placeholder: 'Número',
        pistas: ['La ventana crece por la derecha mientras no haya repetidos.', 'Si el carácter nuevo ya está en la ventana, se sacan caracteres por la izquierda hasta que desaparezca.', 'Anota la longitud `r − l + 1` máxima.'],
        explicacion: 'Resultado: **' + esp + '**. Cada carácter entra y sale a lo sumo una vez: O(n) amortizado.', sim: H.sim(r.frames, Sim.tecnicas.VEN_COD, 'subcadena_sin_repetir', 'ventana deslizante') };
    } });

  B({ id: 'n10-ventana-impl', n: 10, e: 'C', dif: 4, c: ['ay_ven'], tema: 'Implementar la ventana deslizante',
    gen() {
      const sol = H.dd(`
        def subcadena_sin_repetir(s):
            vistos = set()
            l = mejor = 0
            for r in range(len(s)):
                while s[r] in vistos:
                    vistos.remove(s[l])
                    l += 1
                vistos.add(s[r])
                mejor = max(mejor, r - l + 1)
            return mejor
      `);
      const lento = H.dd(`
        def subcadena_sin_repetir(s):
            mejor = 0
            for i in range(len(s)):
                for j in range(i, len(s)):
                    if len(set(s[i:j + 1])) == j - i + 1:
                        mejor = max(mejor, j - i + 1)
            return mejor
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `subcadena_sin_repetir(s)` que devuelva la **longitud** de la subcadena contigua **más larga sin caracteres repetidos**. Usa una **ventana deslizante** (O(n)) con un `set` de los caracteres de la ventana.', starter: 'def subcadena_sin_repetir(s):\n    # complete aquí\n    pass\n', solucion: sol, lento, prelude: '',
        tests: ['subcadena_sin_repetir("cutebear")', 'subcadena_sin_repetir("abcabcbb")', 'subcadena_sin_repetir("aaaa")', 'subcadena_sin_repetir("")', 'subcadena_sin_repetir("abcdef")', 'subcadena_sin_repetir("pwwkew")'], ef: ['subcadena_sin_repetir("abcdefghij" * 40)', 'subcadena_sin_repetir("ab" * 200)'], efDesc: 'subcadena_sin_repetir con 400 caracteres  (eficiencia)', fn: 'subcadena_sin_repetir', ejemplo: 'subcadena_sin_repetir("abcabc")', factor: 4 });
      q.pistas = ['Mantén `l` (borde izquierdo), un `set` `vistos` y `mejor`.', 'Mientras `s[r]` esté en `vistos`: quita `s[l]` y avanza `l`.', 'Luego agrega `s[r]` y actualiza `mejor = max(mejor, r - l + 1)`.'];
      q.explicacion = 'Ventana deslizante:\n```\n' + sol + '\n```';
      return q;
    } });

  B({ id: 'n10-intervalos-salida', n: 10, e: 'B', dif: 3, c: ['ay_int'], tema: 'Merge intervals: ¿qué devuelve?',
    gen(rng, K) {
      const n = rng.int(4, 5), iv = []; for (let i = 0; i < n; i++) { const a = rng.int(1, 18); iv.push([a, a + rng.int(1, 5)]); }
      const code = H.dd(`
        def fusionar_intervalos(intervalos):
            intervalos.sort(key=lambda par: par[0])
            salida = [intervalos[0]]
            for a, b in intervalos[1:]:
                ultimo_a, ultimo_b = salida[-1]
                if a <= ultimo_b:
                    salida[-1] = (ultimo_a, max(ultimo_b, b))
                else:
                    salida.append((a, b))
            return salida
        print(fusionar_intervalos([${iv.map(p => '(' + p[0] + ', ' + p[1] + ')').join(', ')}]))
      `);
      const esp = K.run(code), r = Sim.tecnicas.fusionar(iv);
      return { tipo: 'salida', enunciado: '¿Qué imprime este programa? (fusión de intervalos solapados)', codigoVista: code, esperado: esp, stdout: true, placeholder: '[(a, b), …]',
        pistas: ['Primero se ordenan por el extremo izquierdo.', 'Si `a <= ultimo_b` se extiende el último con `max(ultimo_b, b)`; si no, se agrega uno nuevo.', 'Los intervalos que solo se «tocan» (a == ultimo_b) también se fusionan.'],
        explicacion: 'Resultado: **' + esp + '**. Ordenar cuesta O(n log n); el barrido, O(n).', sim: H.sim(r.frames, Sim.tecnicas.MER_COD, 'fusionar_intervalos', 'merge intervals') };
    } });

  B({ id: 'n10-intervalos-impl', n: 10, e: 'C', dif: 3, c: ['ay_int'], tema: 'Implementar merge intervals',
    gen() {
      const sol = H.dd(`
        def fusionar_intervalos(intervalos):
            intervalos.sort(key=lambda par: par[0])
            salida = [intervalos[0]]
            for a, b in intervalos[1:]:
                ultimo_a, ultimo_b = salida[-1]
                if a <= ultimo_b:
                    salida[-1] = (ultimo_a, max(ultimo_b, b))
                else:
                    salida.append((a, b))
            return salida
      `);
      const q = PQ.codigoQ({ enun: 'Escribe `fusionar_intervalos(intervalos)`: recibe una lista de tuplas `(inicio, fin)` posiblemente solapadas y **desordenadas**, y devuelve la lista **ordenada** de intervalos fusionados. Dos intervalos que se solapan **o se tocan** (el inicio de uno es ≤ el fin del anterior) se fusionan. Asume que la lista no está vacía.', starter: 'def fusionar_intervalos(intervalos):\n    # complete aquí\n    pass\n', solucion: sol, prelude: '',
        tests: ['fusionar_intervalos([(1, 3), (2, 6), (8, 10), (15, 18)])', 'fusionar_intervalos([(8, 10), (1, 3), (15, 18), (2, 6)])', 'fusionar_intervalos([(1, 10), (2, 3), (4, 5)])', 'fusionar_intervalos([(1, 4), (4, 5)])', 'fusionar_intervalos([(5, 6)])', 'fusionar_intervalos([(1, 2), (3, 4), (5, 6)])'], fn: 'fusionar_intervalos', ejemplo: 'fusionar_intervalos([(1, 3), (2, 6)])' });
      q.pistas = ['Ordena primero por el extremo izquierdo: `intervalos.sort(key=lambda par: par[0])`.', 'Recorre dejando en `salida` los intervalos ya fusionados y compara con el último.', 'Al extender usa `max(ultimo_b, b)`: el nuevo puede estar contenido en el último.'];
      q.explicacion = 'Ordenar y barrer:\n```\n' + sol + '\n```';
      return q;
    } });

  H.clasif('n10-eleccion-tecnica', 10, 'B', 2, ['ay_pref', 'ay_kad', 'ay_dos', 'ay_ven', 'ay_int'], 'Elegir la técnica', 'Para cada problema, elige la **técnica** que lo resuelve mejor (S3-C1, diap. 23-24).', ['Suma de prefijos', 'Kadane', 'Dos punteros', 'Ventana deslizante', 'Merge intervals'], [
    ['Temperatura media entre el segundo `i` y el `j`, muchas consultas sobre un arreglo fijo.', 'Suma de prefijos', 'Consultas de suma de rango: O(n) → O(1) por consulta.'], ['Intervalo continuo de mayor aumento neto de temperatura.', 'Kadane', 'Máximo subarreglo contiguo (sobre las variaciones).'],
    ['Par de elementos de un arreglo **ordenado** que suma un objetivo.', 'Dos punteros', 'Par que cumple una condición en datos ordenados: O(n²) → O(n).'], ['Ventana más larga en la que nunca se superó un umbral crítico.', 'Ventana deslizante', 'Mejor subsegmento con una restricción que se mantiene.'],
    ['Fusionar las reservas de un calendario que se solapan.', 'Merge intervals', 'Ordenar por inicio y barrer: consolidar intervalos.'], ['Subcadena más larga sin caracteres repetidos.', 'Ventana deslizante', 'La ventana crece y se encoge según la restricción.'], ['Suma máxima de un tramo de la señal (racha más rentable).', 'Kadane', 'Decidir en cada paso extender o reiniciar.'], ['Cuánto se vendió entre el día `i` y el `j` (miles de consultas).', 'Suma de prefijos', 'Preproceso O(n) y consultas O(1).']
  ], ['Busca la «señal de alarma» del enunciado: consultas de rango, racha, par ordenado, subsegmento con restricción o intervalos.', 'Todas evitan recomputar: mantienen un estado que se actualiza en una pasada.', 'Merge intervals ordena primero (O(n log n)).'], 'Prefijos: consultas de rango. Kadane: máximo subarreglo. Dos punteros: par en ordenado. Ventana: subsegmento con restricción. Merge intervals: ordenar y barrer.');

  B({ id: 'n10-tabla-tecnicas', n: 10, e: 'B', dif: 3, c: ['ay_pref', 'ay_kad', 'ay_dos', 'ay_ven', 'ay_int'], tema: 'Complejidad de cada técnica',
    gen() {
      const q = H.tablaCx(['Técnica', 'Con la técnica'], [['Suma de prefijos (cada consulta)', ['O(1)', '1']], ['Kadane (máximo subarreglo)', ['O(n)', 'n']], ['Dos punteros (arreglo ordenado)', ['O(n)', 'n']], ['Ventana deslizante', ['O(n)', 'n']], ['Merge intervals', ['O(n log n)', 'n log n']]]);
      return Object.assign(q, { enunciado: 'Completa la complejidad **con la técnica** (S3-C1, diap. 23). Sin la técnica, las cuatro últimas eran O(n²) y las consultas de rango O(n) cada una.', pistas: ['Prefijos: el preproceso es O(n) pero cada consulta es constante.', 'Kadane, dos punteros y ventana: una sola pasada.', 'Merge intervals incluye un ordenamiento.'], explicacion: 'Prefijos O(1) por consulta; Kadane, dos punteros y ventana O(n); merge intervals O(n log n).' });
    } });
})(typeof window !== 'undefined' ? window : globalThis);
