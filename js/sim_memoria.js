/* sim_memoria.js — animaciones guiadas de memoria y referencias (S1-C2): una variable guarda una REFERENCIA a un objeto del montículo;
   alias, mutabilidad, copia superficial y profunda, argumentos por defecto mutables, memoria contigua vs enlazada y fragmentación.
   Son escenarios escritos a mano (no ejecutan tu código): cada uno trae el programa Python que ilustra y su salida esperada;
   las pruebas ejecutan ese programa con el intérprete y comprueban que imprime lo mismo que la animación dice. */
(function (global) {
  'use strict';
  const ET = global.ET, Dib = ET.Dib;
  const Sim = ET.Sim = ET.Sim || {};
  const CW = 44, CH = 36;

  /* ---------- dibujo de variables → objetos ---------- */
  function itemsEstado(S) {
    const it = [];
    it.push(Dib.etq('t1', 30, 16, 'PILA (nombres)', 'tit', 'start'), Dib.etq('t2', 250, 16, 'MONTÍCULO (objetos)', 'tit', 'start'));
    const nomsVar = Object.keys(S.vars || {}), pos = {};
    const objs = S.objs || {};
    Object.keys(objs).forEach(id => { const o = objs[id]; pos[id] = { x: o.x, y: o.y, w: o.tipo === 'lista' ? Math.max(60, o.vals.length * (CW + 4) + 10) : (o.tipo === 'func' ? 190 : 64), h: o.tipo === 'lista' ? CH + 14 : (o.tipo === 'func' ? 112 : 40) }; });
    Object.keys(objs).forEach(id => {
      const o = objs[id], p = pos[id], cls = o.cls || '';
      if (o.tipo === 'lista') {
        it.push(Dib.rect('o' + id, p.x, p.y, p.w, p.h, (cls === 'nuevo' ? 'ok' : 'zona')));
        it.push(Dib.etq('oe' + id, p.x + 2, p.y - 10, (o.etq || 'list') + (o.idTxt ? ' · ' + o.idTxt : ''), 'gris', 'start'));
        o.vals.forEach((v, i) => {
          const esRef = v && typeof v === 'object' && v.ref;
          it.push(Dib.caja('c' + id + '_' + i, p.x + 7 + i * (CW + 4), p.y + 7, CW, CH, esRef ? '•' : v, (o.celdas && o.celdas[i]) || (esRef ? 'suave' : ''), String(i)));
          if (esRef && pos[v.ref]) { const q = pos[v.ref]; it.push(Dib.fl('r' + id + '_' + i, p.x + 7 + i * (CW + 4) + CW / 2, p.y + 7 + CH, q.x + 12, q.y - 2, 'act', 0)); }
        });
      } else if (o.tipo === 'int') it.push(Dib.caja('o' + id, p.x, p.y, 64, 40, o.v, cls || ''), Dib.etq('oe' + id, p.x + 32, p.y - 10, o.etq || 'int', 'gris'));
      else if (o.tipo === 'func') { it.push(Dib.rect('o' + id, p.x, p.y, p.w, p.h, 'zona')); it.push(Dib.etq('oe' + id, p.x + 2, p.y - 10, 'función ' + o.nombre, 'gris', 'start')); it.push(Dib.etq('od' + id, p.x + 10, p.y + 20, 'valor por defecto de acc:', 'gris', 'start')); }
    });
    nomsVar.forEach((n, i) => {
      const y = 50 + i * 58, dest = S.vars[n];
      it.push(Dib.caja('v_' + n, 30, y, 96, 38, n, 'pie'));
      if (dest && pos[dest]) { const q = pos[dest]; it.push(Dib.fl('fv_' + n, 126, y + 19, q.x - 3, q.y + Math.min(q.h / 2, 28) + (S.offs && S.offs[n] ? S.offs[n] : 0), 'act', 0)); }
    });
    if (S.salida) it.push(Dib.etq('salida', 30, (S.H || 300) - 14, '→ ' + S.salida, 'grande', 'start'));
    return it;
  }
  const L = (x, y, vals, o) => Object.assign({ tipo: 'lista', x, y, vals }, o || {});
  const I = (x, y, v, o) => Object.assign({ tipo: 'int', x, y, v }, o || {});
  const paso = (linea, msg, vars, objs, extra) => Object.assign({ linea, msg, vars, objs }, extra || {});

  const ESCENARIOS = [
    { id: 'alias', titulo: 'b = a: dos nombres, un solo objeto (alias)',
      codigo: ['a = [1, 2, 3]', 'b = a                      # copia la REFERENCIA, no la lista', 'b.append(4)                # modifica ese único objeto', 'print(a)                   # a "cambió" sin tocarlo', 'print(id(a) == id(b))      # misma dirección de memoria'],
      salida: '[1, 2, 3, 4]\nTrue',
      pasos: [
        paso(1, '`a = [1, 2, 3]`: Python crea la lista **en el montículo** y `a` guarda una **referencia** (la flecha), no la lista.', { a: 'o1' }, { o1: L(280, 60, [1, 2, 3]) }),
        paso(2, '`b = a` **copia la referencia**, nunca el objeto: ahora hay **un solo objeto** y **dos nombres** que lo apuntan.', { a: 'o1', b: 'o1' }, { o1: L(280, 60, [1, 2, 3]) }, { offs: { b: 14 } }),
        paso(3, '`b.append(4)`: como `list` es **mutable**, el objeto se modifica **en el sitio**: sigue siendo el mismo objeto, con un elemento más.', { a: 'o1', b: 'o1' }, { o1: L(280, 60, [1, 2, 3, 4], { cls: 'nuevo' }) }, { offs: { b: 14 } }),
        paso(4, '`print(a)` → **[1, 2, 3, 4]**. El cambio se ve desde **los dos nombres** porque es el mismo objeto.', { a: 'o1', b: 'o1' }, { o1: L(280, 60, [1, 2, 3, 4]) }, { offs: { b: 14 }, salida: '[1, 2, 3, 4]' }),
        paso(5, '`id(a) == id(b)` → **True**: misma dirección de memoria. (Respuesta a la pregunta de la clase: `a` vale [1, 2, 3, 4].)', { a: 'o1', b: 'o1' }, { o1: L(280, 60, [1, 2, 3, 4]) }, { offs: { b: 14 }, salida: 'True' })
      ] },
    { id: 'inmutable', titulo: 'int es inmutable: y += 1 crea otro objeto',
      codigo: ['x = 5', 'y = x                      # los dos apuntan al mismo 5', 'y += 1                     # int es inmutable: se crea un objeto nuevo', 'print(x, y)'],
      salida: '5 6',
      pasos: [
        paso(1, '`x = 5`: `x` referencia un objeto `int` con el valor 5.', { x: 'o1' }, { o1: I(300, 50, 5) }),
        paso(2, '`y = x`: `y` referencia **el mismo** objeto 5.', { x: 'o1', y: 'o1' }, { o1: I(300, 50, 5) }, { offs: { y: 8 } }),
        paso(3, '`y += 1`: los `int` **no se modifican**. Se crea un **objeto nuevo** con el valor 6 y `y` pasa a apuntarlo. `x` sigue apuntando al 5.', { x: 'o1', y: 'o2' }, { o1: I(300, 50, 5), o2: I(300, 130, 6, { cls: 'nuevo' }) }),
        paso(4, '`print(x, y)` → **5 6**. Con objetos inmutables (int, float, str, tuple) un «cambio» siempre crea otro objeto: por eso los alias no se ven afectados.', { x: 'o1', y: 'o2' }, { o1: I(300, 50, 5), o2: I(300, 130, 6) }, { salida: '5 6' })
      ] },
    { id: 'copias', titulo: 'Alias, copia superficial y copia profunda',
      codigo: ['import copy', 'original = [[1, 2], [3, 4]]', 'alias = original                 # 0 objetos nuevos', 'superficial = copy.copy(original)  # copia la lista externa', 'profunda = copy.deepcopy(original) # copia todo el árbol', 'original[0].append(99)', 'print(alias)', 'print(superficial)             # cambió TAMBIÉN', 'print(profunda)                # intacta'],
      salida: '[[1, 2, 99], [3, 4]]\n[[1, 2, 99], [3, 4]]\n[[1, 2], [3, 4]]',
      pasos: [
        paso(2, '`original` es una lista **de listas**: la externa guarda dos **referencias** a las internas [1, 2] y [3, 4].', { original: 'e1' }, { e1: L(250, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'list (externa)' }), a1: L(250, 120, [1, 2]), b1: L(390, 120, [3, 4]) }),
        paso(3, '`alias = original`: otra flecha al **mismo** objeto externo. Ningún objeto nuevo.', { original: 'e1', alias: 'e1' }, { e1: L(250, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'list (externa)' }), a1: L(250, 120, [1, 2]), b1: L(390, 120, [3, 4]) }, { offs: { alias: 10 } }),
        paso(4, '`copy.copy(original)`: crea una **lista externa nueva**, pero con **las mismas referencias** a [1, 2] y [3, 4]: **comparte las listas internas**.', { original: 'e1', alias: 'e1', superficial: 'e2' }, { e1: L(250, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'list (externa)' }), e2: L(470, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'copia superficial', cls: 'nuevo' }), a1: L(250, 120, [1, 2]), b1: L(390, 120, [3, 4]) }, { offs: { alias: 10 } }),
        paso(5, '`copy.deepcopy(original)`: copia **todo el árbol**: una lista externa nueva **y** copias nuevas de [1, 2] y [3, 4].', { original: 'e1', alias: 'e1', superficial: 'e2', profunda: 'e3' }, { e1: L(250, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'list (externa)' }), e2: L(470, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'copia superficial' }), a1: L(250, 120, [1, 2]), b1: L(390, 120, [3, 4]), e3: L(250, 210, [{ ref: 'a2' }, { ref: 'b2' }], { etq: 'copia profunda', cls: 'nuevo' }), a2: L(250, 270, [1, 2], { cls: 'nuevo' }), b2: L(390, 270, [3, 4], { cls: 'nuevo' }) }, { offs: { alias: 10 }, H: 340 }),
        paso(6, '`original[0].append(99)`: se modifica la lista interna [1, 2] → [1, 2, 99]. Esa lista la ven **original, alias y la copia superficial**; la copia profunda tiene la suya.', { original: 'e1', alias: 'e1', superficial: 'e2', profunda: 'e3' }, { e1: L(250, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'list (externa)' }), e2: L(470, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'copia superficial' }), a1: L(250, 120, [1, 2, 99], { cls: 'nuevo' }), b1: L(390, 120, [3, 4]), e3: L(250, 210, [{ ref: 'a2' }, { ref: 'b2' }], { etq: 'copia profunda' }), a2: L(250, 270, [1, 2]), b2: L(390, 270, [3, 4]) }, { offs: { alias: 10 }, H: 340 }),
        paso([7, 8, 9], 'Resultado: `alias` y `superficial` muestran **[[1, 2, 99], [3, 4]]**; `profunda` sigue **[[1, 2], [3, 4]]**. **Copia superficial ≠ independencia total** en estructuras anidadas.', { original: 'e1', alias: 'e1', superficial: 'e2', profunda: 'e3' }, { e1: L(250, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'list (externa)' }), e2: L(470, 40, [{ ref: 'a1' }, { ref: 'b1' }], { etq: 'copia superficial' }), a1: L(250, 120, [1, 2, 99]), b1: L(390, 120, [3, 4]), e3: L(250, 210, [{ ref: 'a2' }, { ref: 'b2' }], { etq: 'copia profunda' }), a2: L(250, 270, [1, 2]), b2: L(390, 270, [3, 4]) }, { offs: { alias: 10 }, H: 340 })
      ] },
    { id: 'funcion', titulo: 'Pasar una lista a una función que la modifica',
      codigo: ['def normalizar(datos):', '    for i in range(len(datos)):', '        datos[i] = datos[i] / 255     # modifica el ORIGINAL', '    return datos', 'crudo = [255, 510]', 'limpio = normalizar(crudo)', 'print(crudo)                     # ¡el original quedó normalizado!', '# arreglo: trabajar sobre una copia', 'def normalizar2(datos):', '    return [x / 255 for x in datos]'],
      salida: '[1.0, 2.0]',
      pasos: [
        paso(5, '`crudo = [255, 510]`: la lista vive en el montículo y `crudo` la referencia.', { crudo: 'o1' }, { o1: L(280, 60, [255, 510]) }),
        paso([6, 1], 'Al llamar `normalizar(crudo)` el parámetro `datos` **recibe la misma referencia**: no se copia la lista (por eso pasar una lista grande es barato… y peligroso).', { crudo: 'o1', datos: 'o1' }, { o1: L(280, 60, [255, 510]) }, { offs: { datos: 14 } }),
        paso(3, '`datos[i] = datos[i] / 255`: la función **modifica el objeto en el sitio**; el de afuera es **el mismo**.', { crudo: 'o1', datos: 'o1' }, { o1: L(280, 60, [1.0, 2.0], { cls: 'nuevo' }) }, { offs: { datos: 14 } }),
        paso([4, 6], '`return datos` devuelve la misma referencia: `limpio`, `datos` y `crudo` apuntan al **mismo** objeto. Al terminar la función desaparece el nombre `datos`.', { crudo: 'o1', limpio: 'o1' }, { o1: L(280, 60, [1.0, 2.0]) }, { offs: { limpio: 14 } }),
        paso(7, '`print(crudo)` → **[1.0, 2.0]**: el original **ya no se puede reutilizar sin normalizar**. Corrección sin `deepcopy`: construir una lista nueva (`[x / 255 for x in datos]`) o hacer `datos = datos[:]` al inicio.', { crudo: 'o1', limpio: 'o1' }, { o1: L(280, 60, [1.0, 2.0]) }, { offs: { limpio: 14 }, salida: '[1.0, 2.0]' })
      ] },
    { id: 'defecto', titulo: 'El argumento por defecto mutable se crea UNA vez',
      codigo: ['def g(x, acc=[]):               # acc=[] se crea al DEFINIR la función', '    acc.append(x)', '    return acc', 'print(g(1))', 'print(g(2))                       # ¡no es [2]!', '# patrón correcto', 'def h(x, acc=None):', '    if acc is None:', '        acc = []', '    acc.append(x)', '    return acc'],
      salida: '[1]\n[1, 2]',
      pasos: [
        paso(1, '`def g(x, acc=[])`: al **definir** la función Python crea **una sola** lista vacía y la guarda como valor por defecto de `acc`.', { g: 'f1' }, { f1: { tipo: 'func', x: 250, y: 50, nombre: 'g' }, d1: L(270, 84, []) }),
        paso([2, 4], '`g(1)`: `acc` no se pasó, así que usa **esa misma lista**; `append(1)` la deja en **[1]**.', { g: 'f1' }, { f1: { tipo: 'func', x: 250, y: 50, nombre: 'g' }, d1: L(270, 84, [1], { cls: 'nuevo' }) }, { salida: '[1]' }),
        paso([2, 5], '`g(2)`: vuelve a usar la **misma** lista, que ya contenía el 1: queda **[1, 2]** (¡no [2]!). La lista **se conserva entre llamadas**.', { g: 'f1' }, { f1: { tipo: 'func', x: 250, y: 50, nombre: 'g' }, d1: L(270, 84, [1, 2], { cls: 'nuevo' }) }, { salida: '[1, 2]' }),
        paso([7, 8, 9], 'Patrón correcto: `acc=None` y crear la lista **dentro** de la función: cada llamada obtiene su propia lista nueva.', { g: 'f1' }, { f1: { tipo: 'func', x: 250, y: 50, nombre: 'g' }, d1: L(270, 84, [1, 2]) }, { salida: '[1, 2]' })
      ] }
  ];
  ESCENARIOS.forEach(e => e.pasos.forEach(p => { p.W = 640; p.H = p.H || 300; }));
  function framesEscenario(id) {
    const e = ESCENARIOS.find(x => x.id === id); if (!e) throw new Error('Escenario desconocido: ' + id);
    return { frames: e.pasos.map(p => ({ items: itemsEstado({ vars: p.vars, objs: p.objs, offs: p.offs, salida: p.salida, H: p.H }), msg: p.msg, linea: p.linea, W: p.W, H: p.H })), codigo: e.codigo, salida: e.salida, titulo: e.titulo };
  }

  /* ---------- memoria contigua vs enlazada ---------- */
  function contiguoVsEnlazado() {
    const F = [], W = 700, H = 320;
    const arr = (n, cls) => { const it = []; it.push(Dib.etq('ta', 30, 16, 'ARREGLO: bloque contiguo (base = 2000, tam = 4 bytes)', 'tit', 'start')); for (let i = 0; i < 6; i++) { it.push(Dib.caja('A' + i, 40 + i * 70, 60, 64, 40, 10 * (i + 1), cls && cls.includes(i) ? 'act' : '', 'v[' + i + ']')); it.push(Dib.etq('Ad' + i, 40 + i * 70 + 32, 46, String(2000 + 4 * i), 'gris')); } return it; };
    const lista = (cls, flechas) => { const it = []; it.push(Dib.etq('tl', 30, 156, 'LISTA ENLAZADA: nodos dispersos por el montículo, unidos por referencias', 'tit', 'start')); const dir = [3040, 2096, 4120]; const xs = [60, 300, 540], ys = [200, 250, 200]; [10, 20, 30].forEach((v, i) => { it.push(Dib.caja('N' + i, xs[i], ys[i], 100, 40, v, cls && cls.includes(i) ? 'act' : '', 'dir ' + dir[i])); if (i < 2) it.push(Dib.fl('Nf' + i, xs[i] + 100, ys[i] + 20, xs[i + 1] - 2, ys[i + 1] + 20, flechas ? 'act' : '', 0)); }); return it; };
    F.push({ items: arr(6).concat(lista()), msg: 'Dos formas de repartir la memoria. El **arreglo** (asignación **estática**) ocupa un **bloque contiguo**; la **lista enlazada** (asignación **dinámica**) pide cada nodo al montículo y los **enlaza con referencias**.', W, H });
    const it2 = arr(6, [3]); it2.push(Dib.etq('f', 30, 124, 'dir(v[3]) = base + 3 × tam = 2000 + 3 × 4 = 2012  →  una multiplicación y una suma: O(1)', 'ok', 'start'));
    F.push({ items: it2.concat(lista()), msg: '**Acceso al elemento i del arreglo:** `dir(v[i]) = base + i × tam`. Solo **una multiplicación y una suma**, sin importar i ni n: **costo constante**. La fórmula **solo vale en memoria contigua**.', W, H });
    const it3 = arr(6); F.push({ items: it3.concat(lista([0, 1, 2], true)), msg: '**Acceso al elemento i de la lista:** no hay fórmula (las direcciones 3040, 2096, 4120 no siguen ningún patrón). Hay que **seguir i referencias** desde la cabeza: **O(n)**. A cambio, insertar o quitar un nodo no exige mover nada.', W, H });
    F.push({ items: arr(6, [0, 1, 2, 3, 4, 5]).concat(lista()), msg: '**Localidad de caché:** la CPU trae **líneas de 64 bytes** completas. Recorrer el arreglo aprovecha cada línea; recorrer la lista salta a direcciones dispersas y casi todos los accesos van a la RAM (~50× más lenta que L1). Por eso los **tensores** de NumPy/PyTorch son **bloques contiguos**.', W, H });
    return { frames: F, titulo: 'Memoria contigua vs enlazada' };
  }

  /* ---------- fragmentación del montículo ---------- */
  function fragmentacion() {
    const F = [], W = 700, H = 230, X = 30, ANCHO = 640;
    const bloque = (id, a, b, cls, txt) => Dib.rect(id, X + a * ANCHO / 10, 70, (b - a) * ANCHO / 10, 44, 'barra ' + (cls || ''), txt);
    const items = (bloques, msg2) => { const it = [Dib.etq('t', X, 18, 'Montículo (10 unidades de memoria)', 'tit', 'start')]; bloques.forEach((b, i) => it.push(bloque('b' + i, b[0], b[1], b[2], b[3]))); if (msg2) it.push(Dib.etq('m2', X, 160, msg2, 'grande', 'start')); return it; };
    F.push({ items: items([[0, 1, 'ok', 'usado'], [1, 2, '', 'libre'], [2, 4, 'ok', 'usado'], [4, 5, '', 'libre'], [5, 7, 'ok', 'usado'], [7, 8, '', 'libre'], [8, 10, 'ok', 'usado']]), msg: 'Tras pedir y liberar bloques de **tamaños distintos** quedan **huecos** entre los bloques usados.', W, H });
    F.push({ items: items([[0, 1, 'ok', 'usado'], [1, 2, 'act', 'libre 1'], [2, 4, 'ok', 'usado'], [4, 5, 'act', 'libre 1'], [5, 7, 'ok', 'usado'], [7, 8, 'act', 'libre 1'], [8, 10, 'ok', 'usado']], 'Memoria libre en total: 3 · hueco contiguo mayor: 1'), msg: 'En total hay **3 unidades libres**, pero el **mayor hueco contiguo** es de **1**.', W, H });
    F.push({ items: items([[0, 1, 'ok', 'usado'], [1, 2, 'act', 'libre 1'], [2, 4, 'ok', 'usado'], [4, 5, 'act', 'libre 1'], [5, 7, 'ok', 'usado'], [7, 8, 'act', 'libre 1'], [8, 10, 'ok', 'usado']], '✖ pedir un bloque de 2 → falla (out of memory) aunque «haya» 3 libres'), msg: '**Pedir un bloque de 2 unidades falla** aunque haya memoria libre suficiente en total: está **fragmentada**. Es la causa típica del error *out of memory* en GPU con memoria «libre»: por eso los frameworks reservan **grandes bloques por adelantado** y los reutilizan.', W, H });
    return { frames: F, titulo: 'Fragmentación del montículo' };
  }

  Sim.memoria = { ESCENARIOS, escenario: framesEscenario, contiguoVsEnlazado, fragmentacion, itemsEstado };
})(typeof window !== 'undefined' ? window : globalThis);
