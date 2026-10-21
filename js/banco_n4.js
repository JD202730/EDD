/* banco_n4.js — Nivel 4: Fundamentos de árboles (S6-C1) */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U, Py = ET.Py, Arb = ET.Arb;

  /* ---------- utilidades de árboles ---------- */
  function padres(t) { const m = {}; (function r(n, p) { if (!n) return; m[String(n.v)] = p === null ? null : String(p.v); r(n.l, n); r(n.r, n); })(t, null); return m; }
  function hijosDe(n) { return [n.l, n.r].filter(Boolean).map(x => String(x.v)); }
  function antepasados(t, v) { const p = padres(t); const out = []; let x = p[String(v)]; while (x != null) { out.push(x); x = p[x]; } return out; }
  function descendientes(n) { const o = []; (function r(x) { if (!x) return; if (x !== n) o.push(String(x.v)); r(x.l); r(x.r); })(n); return o; }
  const profDe = (t, v) => Arb.profundidades(t).get(String(v));
  const altDe = (t, v) => Arb.altura(Arb.hallar(t, v));
  const tipoTexto = ti => [ti.lleno ? 'lleno' : null, ti.completo ? 'completo' : null, ti.perfecto ? 'perfecto' : null].filter(Boolean);

  /* ============ A ============ */
  const VF4 = [
    { a: 'Un árbol con N nodos tiene exactamente N − 1 aristas.', v: true, e: 'Cada nodo, salvo la raíz, tiene exactamente un padre (una arista entrante): N − 1 aristas.', j: ['Cada nodo, excepto la raíz, tiene una única arista que lo une con su padre.', 'Cada nodo tiene exactamente dos aristas.', 'Solo los nodos internos tienen aristas.'] },
    { a: 'En un árbol, un nodo puede tener dos padres distintos.', v: false, e: 'La definición exige que cada nodo (salvo la raíz) tenga exactamente un padre.', j: ['La definición de árbol exige un único padre para cada nodo que no es raíz.', 'Sí puede, siempre que no haya ciclos.', 'Sí puede, pero entonces el nodo es una hoja.'] },
    { a: 'La raíz es el único nodo de un árbol que no tiene padre.', v: true, e: 'Hay un nodo sin arista entrante (la raíz); todos los demás tienen padre.', j: ['Por definición hay un solo nodo sin arista entrante.', 'Todos los nodos de un árbol tienen padre, incluida la raíz.', 'Las hojas tampoco tienen padre.'] },
    { a: 'Un grafo dirigido que contiene un ciclo puede ser un árbol.', v: false, e: 'Un árbol es un grafo dirigido **acíclico**.', j: ['Un árbol es acíclico: un ciclo viola la definición.', 'Los ciclos están permitidos si hay una sola raíz.', 'Un ciclo solo es problema en grafos no dirigidos.'] },
    { a: 'La **altura** de una hoja es 0.', v: true, e: 'Altura = aristas hacia la hoja descendiente más lejana; una hoja no tiene descendientes.', j: ['La altura cuenta aristas hasta la hoja más lejana; para una hoja es 0.', 'La altura de una hoja es 1 porque se cuenta el propio nodo.', 'La altura de una hoja es igual a su profundidad.'] },
    { a: 'La **profundidad** de la raíz es 0.', v: true, e: 'La profundidad cuenta aristas desde la raíz; la raíz está a 0 aristas de sí misma.', j: ['Se cuentan las aristas desde la raíz hasta el nodo.', 'La profundidad de la raíz es 1.', 'La raíz no tiene profundidad definida.'] },
    { a: 'Un nodo junto con todos sus descendientes forma un subárbol.', v: true, e: 'Por eso el árbol es una estructura recursiva (incluso una hoja es un subárbol).', j: ['Cualquier nodo con todos sus descendientes es, por sí mismo, un árbol.', 'Solo la raíz puede formar un subárbol.', 'Un subárbol exige al menos dos hijos.'] },
    { a: 'Si dos nodos tienen el mismo padre, se llaman hermanos.', v: true, e: 'Hermano: otro nodo con el mismo padre.', j: ['Definición de hermano: nodos que comparten padre.', 'Son hermanos si tienen la misma profundidad, aunque tengan padres distintos.', 'Son hermanos si ambos son hojas.'] },
    { a: 'Un grafo con **dos nodos sin padre** (dos raíces) sigue siendo un árbol si cada nodo tiene a lo sumo un padre.', v: false, e: 'Un árbol tiene una **única** raíz; con dos raíces sería un bosque.', j: ['La definición exige un único nodo sin arista entrante (una raíz).', 'Basta con que cada nodo tenga a lo sumo un padre.', 'Dos raíces están permitidas si son hermanas.'] }
  ];
  B({
    id: 'n4-vf', n: 4, e: 'A', dif: 1, c: ['ar_def', 'ar_noarbol', 'ar_vocab', 'ar_profalt'], tema: 'Definiciones (V/F)',
    gen(rng, K) {
      const it = rng.pick(VF4);
      return {
        tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón correcta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
        justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
        pistas: ['Recuerda la definición: grafo dirigido acíclico, una raíz, cada otro nodo con exactamente un padre.', 'Dibuja un ejemplo pequeño y comprueba la afirmación.', 'Profundidad se mide desde la raíz; altura hacia las hojas (se cuentan aristas).']
      };
    }
  });

  function revisaGrafo(nodos, aristas) {
    const indeg = {}; nodos.forEach(n => indeg[n] = 0); aristas.forEach(([a, b]) => indeg[b]++);
    if (aristas.some(([a, b]) => a === b)) return 'Hay un **auto-ciclo** (un nodo se apunta a sí mismo).';
    // ciclo
    const ady = {}; nodos.forEach(n => ady[n] = []); aristas.forEach(([a, b]) => ady[a].push(b));
    const col = {}; let ciclo = false;
    const dfs = u => { col[u] = 1; for (const v of ady[u]) { if (col[v] === 1) ciclo = true; else if (!col[v]) dfs(v); } col[u] = 2; };
    nodos.forEach(n => { if (!col[n]) dfs(n); });
    if (ciclo) return 'Hay un **ciclo**: un árbol debe ser acíclico.';
    const dos = nodos.filter(n => indeg[n] > 1);
    if (dos.length) return 'El nodo **' + dos[0] + '** tiene **dos padres**; en un árbol cada nodo (salvo la raíz) tiene exactamente uno.';
    const raices = nodos.filter(n => indeg[n] === 0);
    if (raices.length !== 1) return 'Hay **' + raices.length + ' nodos sin padre** (' + raices.join(', ') + '); un árbol tiene una única raíz.';
    return null;
  }
  B({
    id: 'n4-es-arbol', n: 4, e: 'A', dif: 2, c: ['ar_def', 'ar_noarbol'], tema: '¿Es un árbol?',
    gen(rng, K) {
      const items = [];
      const tipos = rng.shuffle(['arbol', 'arbol', 'dospadres', 'ciclo', 'autociclo', 'raices']).slice(0, 5);
      tipos.forEach(tipo => {
        let intento = 0, ok = false, edges, nodos;
        while (!ok && intento++ < 60) {
          const n = rng.int(4, 6); nodos = rng.sample('ABCDEFGH'.split(''), n); const par = [-1];
          edges = []; for (let i = 1; i < n; i++) { par[i] = rng.int(0, i - 1); edges.push([nodos[par[i]], nodos[i]]); }
          if (tipo === 'dospadres') { const x = rng.int(2, n - 1); const cand = []; for (let y = 0; y < x; y++) if (y !== par[x]) cand.push(y); if (!cand.length) continue; edges.push([nodos[rng.pick(cand)], nodos[x]]); }
          else if (tipo === 'ciclo') { const x = rng.int(2, n - 1); let a = par[x], s = []; while (a > 0) { s.push(a); a = par[a]; } if (!s.length) continue; edges.push([nodos[x], nodos[rng.pick(s)]]); }
          else if (tipo === 'autociclo') { const x = rng.int(1, n - 1); edges.push([nodos[x], nodos[x]]); }
          else if (tipo === 'raices') { const i = rng.int(1, n - 1); edges.splice(i - 1, 1); }
          const razon = revisaGrafo(nodos, edges);
          ok = (tipo === 'arbol') === (razon === null);
        }
        const razon = revisaGrafo(nodos, edges);
        items.push({ t: 'Nodos {' + nodos.slice().sort().join(', ') + '} con aristas: ' + rng.shuffle(edges).map(e => '`' + e[0] + '→' + e[1] + '`').join(' '), cat: razon === null ? 0 : 1, why: razon || 'Cumple la definición: una raíz, un padre por nodo y sin ciclos.' });
      });
      return {
        tipo: 'clasificar', enunciado: 'Cada arista `X→Y` indica que **X es padre de Y**. Decide si cada grafo es un **árbol** o no (S6-C1: grafo dirigido acíclico, una raíz, cada otro nodo con exactamente un padre, sin auto-ciclos).', categorias: ['Sí es un árbol', 'No es un árbol'], items,
        pistas: ['Cuenta cuántos nodos **no reciben** ninguna arista (candidatos a raíz): debe haber exactamente uno.', 'Comprueba que ningún nodo reciba **dos** aristas (dos padres) y que ningún nodo se apunte a sí mismo.', 'Busca ciclos siguiendo las flechas: si regresas a un nodo ya visitado, no es árbol.'],
        explicacion: 'Un árbol con N nodos tiene exactamente N − 1 aristas, una sola raíz, un padre por nodo y ningún ciclo.'
      };
    }
  });

  B({
    id: 'n4-vocab', n: 4, e: 'A', dif: 2, c: ['ar_vocab'], tema: 'Vocabulario de familia',
    gen(rng, K) {
      const n = rng.int(7, 9); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) });
      const P = padres(t), nodosV = Arb.ino(t).map(String);
      const hijosN = nodosV.filter(v => hijosDe(Arb.hallar(t, v)).length > 0), conPadre = nodosV.filter(v => P[v] !== null);
      const opciones = [
        () => ({ q: 'Escribe las **hojas** del árbol (nodos sin hijos), ordenadas alfabéticamente.', esp: nodosV.filter(v => !hijosDe(Arb.hallar(t, v)).length).sort().join(' ') }),
        () => ({ q: 'Escribe los **nodos internos** (con al menos un hijo, incluida la raíz), ordenados alfabéticamente.', esp: hijosN.slice().sort().join(' ') }),
        () => { const v = rng.pick(conPadre); const h = hijosDe(Arb.hallar(t, P[v])).filter(x => x !== v); return { q: '¿Cuál es el **hermano** de `' + v + '`? (Escribe `ninguno` si no tiene.)', esp: h.length ? h[0] : 'ninguno', alt: h.length ? null : ['ninguno', 'no tiene', 'ninguna', '-'] }; },
        () => { const v = rng.pick(conPadre); return { q: 'Escribe los **ancestros** de `' + v + '`, desde su padre hasta la raíz.', esp: antepasados(t, v).join(' ') }; },
        () => { const v = rng.pick(hijosN); const d = descendientes(Arb.hallar(t, v)).sort(); return { q: 'Escribe los **descendientes** de `' + v + '`, ordenados alfabéticamente.', esp: d.join(' ') }; },
        () => { const v = rng.pick(conPadre.filter(x => P[P[x]] != null)); return v ? { q: '¿Quién es el **abuelo** de `' + v + '` (el padre de su padre)?', esp: P[P[v]] } : null; },
        () => { const v = rng.pick(conPadre); return { q: '¿Quién es el **padre** de `' + v + '`?', esp: P[v] }; }
      ];
      let item = null; for (let i = 0; i < 12 && !item; i++) item = rng.pick(opciones)();
      const esp = item.esp;
      return {
        tipo: 'salida', tokens: true, enunciado: 'Observa el árbol y responde. ' + item.q, arbol: t, esperado: item.alt ? [esp].concat(item.alt) : esp, placeholder: 'Respuesta (letras separadas por espacio)',
        pistas: ['Identifica la raíz (arriba, sin padre) y recorre los niveles anotando los hijos de cada nodo.', 'Hoja = sin hijos · interno = con hijos · hermanos = mismo padre · ancestros = camino hacia la raíz · descendientes = hacia las hojas.', 'Verifica cada nodo uno por uno en el dibujo.'],
        explicacion: 'Respuesta: **' + esp + '**. Vocabulario (S6-C1, diap. 7): padre, hijo, hermano, abuelo, ancestro, descendiente, raíz, hoja, nodo interno.'
      };
    }
  });

  B({
    id: 'n4-prof-alt', n: 4, e: 'A', dif: 2, c: ['ar_profalt'], tema: 'Profundidad y altura',
    gen(rng, K) {
      const n = rng.int(7, 10); const t = Arb.aleatorio(rng, n, { balance: rng.chance(0.4) });
      const vs = Arb.ino(t).map(String);
      const tipo = rng.int(0, 3); let q, esp, ex;
      if (tipo === 0) { const v = rng.pick(vs); esp = profDe(t, v); q = '¿Cuál es la **profundidad** del nodo `' + v + '`? (Aristas desde la raíz; la raíz tiene profundidad 0.)'; ex = 'La profundidad de `' + v + '` es ' + esp + ': camino ' + [...antepasados(t, v).reverse(), v].join('→') + '.'; }
      else if (tipo === 1) { const v = rng.pick(vs); esp = altDe(t, v); q = '¿Cuál es la **altura** del nodo `' + v + '`? (Aristas hasta la hoja descendiente más lejana; las hojas tienen altura 0.)'; ex = 'La altura de `' + v + '` es ' + esp + '.'; }
      else if (tipo === 2) { esp = Arb.altura(t); q = '¿Cuál es la **altura del árbol**?'; ex = 'La altura del árbol es la altura de la raíz: ' + esp + '.'; }
      else { esp = n - 1; q = '¿Cuántas **aristas** tiene el árbol?'; ex = 'N = ' + n + ' nodos → N − 1 = ' + esp + ' aristas.'; }
      return {
        tipo: 'salida', numerico: true, enunciado: q, arbol: t, esperado: String(esp), placeholder: 'Un número entero',
        pistas: ['Se cuentan **aristas**, no nodos (convención del curso).', 'Profundidad: de la raíz hacia el nodo. Altura: del nodo hacia la hoja descendiente más lejana. Aristas del árbol: N − 1.', 'Marca el camino con el dedo y cuenta cuántas líneas (aristas) recorres.'],
        explicacion: ex + ' (Convención: se cuentan aristas; hojas con altura 0 y raíz con profundidad 0.)'
      };
    }
  });

  B({
    id: 'n4-perfecto-formula', n: 4, e: 'A', dif: 2, c: ['ar_perfecto'], tema: 'Árbol perfecto',
    gen(rng, K) {
      const h = rng.int(2, 6); const k = rng.int(1, h);
      const tipo = rng.int(0, 4); let q, esp, ex;
      if (tipo === 0) { esp = Math.pow(2, h + 1) - 1; q = '¿Cuántos nodos tiene un árbol binario **perfecto** de altura **' + h + '**?'; ex = '2^(h+1) − 1 = 2^' + (h + 1) + ' − 1 = ' + esp + '.'; }
      else if (tipo === 1) { esp = Math.pow(2, h); q = '¿Cuántas **hojas** tiene un árbol binario perfecto de altura **' + h + '**? (Todas están en el último nivel.)'; ex = 'El nivel h tiene 2^h nodos: 2^' + h + ' = ' + esp + '.'; }
      else if (tipo === 2) { esp = Math.pow(2, k); q = '¿Cuántos nodos hay en el **nivel ' + k + '** de un árbol binario perfecto? (La raíz está en el nivel 0.)'; ex = 'En cada nivel se duplica: 2^' + k + ' = ' + esp + '.'; }
      else if (tipo === 3) { esp = Math.pow(2, h + 1) - 2; q = '¿Cuántas **aristas** tiene un árbol binario perfecto de altura **' + h + '**?'; ex = 'Nodos = ' + (esp + 1) + ' → aristas = N − 1 = ' + esp + '.'; }
      else { esp = h; const N = Math.pow(2, h + 1) - 1; q = 'Un árbol binario perfecto tiene **' + N + ' nodos**. ¿Cuál es su **altura**?'; ex = 'N = 2^(h+1) − 1 → ' + N + ' + 1 = 2^(h+1) = ' + (N + 1) + ' → h = ' + h + '.'; }
      return {
        tipo: 'salida', numerico: true, enunciado: q, esperado: String(esp), placeholder: 'Un número entero',
        pistas: ['Un árbol perfecto tiene todos los internos con 2 hijos y todas las hojas al mismo nivel.', 'Nivel 0: 1 nodo, nivel 1: 2 nodos, nivel 2: 4 nodos… (se duplica). Total hasta la altura h: 2^(h+1) − 1.', 'Aristas = nodos − 1. Hojas = nodos del último nivel.'],
        explicacion: ex
      };
    }
  });

  B({
    id: 'n4-diagrama-nota', n: 4, e: 'A', dif: 2, c: ['ar_diagrama', 'ar_nodo'], tema: 'Del código/diagrama a la notación',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { valores: rng.distinct(n, 1, 9) });
      const desdeCodigo = rng.chance(0.5);
      if (!desdeCodigo) return {
        tipo: 'arbol', enunciado: 'Escribe este árbol en notación **`valor(izq,der)`** (hijo vacío = en blanco o `_`).', arbol: t, esperado: t, placeholder: 'p. ej. 1(2,3)',
        pistas: ['Empieza por la raíz: se escribe su valor y, entre paréntesis, primero el subárbol izquierdo, una coma y el derecho.', 'Cada subárbol se escribe igual (recursivamente). Una hoja se escribe solo con su valor.', 'Si un nodo tiene solo hijo derecho, deja vacío el lugar del izquierdo: `7(,3)`.'],
        explicacion: 'Notación: **' + Arb.nota(t) + '**.'
      };
      // desde código
      const lineas = ['raiz = NodoArbol(' + t.v + ')'];
      (function rec(nd, ruta) { for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) { if (!h) continue; lineas.push(ruta + '.' + lado + ' = NodoArbol(' + h.v + ')'); } for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) if (h) rec(h, ruta + '.' + lado); })(t, 'raiz');
      return {
        tipo: 'arbol', enunciado: 'Este código construye un árbol con la clase `NodoArbol` (valor, izq, der). Escribe el árbol resultante en notación **`valor(izq,der)`**.', codigoVista: K.CLASE_NODO + '\n' + lineas.join('\n'), esperado: t, placeholder: 'p. ej. 1(2,3)',
        pistas: ['`raiz` es la raíz. `raiz.izq = …` es su hijo izquierdo y `raiz.der = …` el derecho.', '`raiz.izq.der` es el hijo **derecho del hijo izquierdo** de la raíz: sigue la cadena de atributos de izquierda a derecha.', 'Dibuja primero el árbol y luego pásalo a notación.'],
        explicacion: 'Árbol resultante: **' + Arb.nota(t) + '**.'
      };
    }
  });

  /* ============ B ============ */
  function arbolTipo(rng, tipo) {
    let t;
    if (tipo === 'perfecto') t = perfecto(rng.int(1, 3));
    else if (tipo === 'completo') { const n = rng.pick([4, 5, 6, 9, 10, 11, 12]); t = Arb.completoDe(n); }
    else if (tipo === 'lleno') { for (let i = 0; i < 40; i++) { t = Arb.llenoAleatorio(rng, rng.int(2, 4)); const c = cuenta(t); Arb.etiquetarNiveles(t, Arb.LETRAS.slice(0, c).split('')); const ti = Arb.tipoArbol(t); if (!ti.completo) return t; } }
    else { for (let i = 0; i < 60; i++) { t = Arb.aleatorio(rng, rng.int(5, 8), { balance: false }); const ti = Arb.tipoArbol(t); if (!ti.lleno && !ti.completo) return t; } }
    return Arb.etiquetarNiveles(t, Arb.LETRAS.slice(0, cuenta(t)).split(''));
  }
  const cuenta = t => t ? 1 + cuenta(t.l) + cuenta(t.r) : 0;
  const perfecto = h => Arb.perfectoDe(h);
  B({
    id: 'n4-tipos-clasif', n: 4, e: 'B', dif: 3, c: ['ar_tipos'], tema: 'Lleno, completo, perfecto',
    gen(rng, K) {
      const tipo = rng.pick(['perfecto', 'completo', 'lleno', 'ninguno']); const t = arbolTipo(rng, tipo); const ti = Arb.tipoArbol(t);
      const opciones = [
        { t: '**Lleno** (cada nodo tiene 0 o 2 hijos)', ok: ti.lleno, why: ti.lleno ? 'Ningún nodo tiene exactamente un hijo.' : 'Hay al menos un nodo con un solo hijo.' },
        { t: '**Completo** (niveles llenos salvo quizá el último, que se llena de izquierda a derecha)', ok: ti.completo, why: ti.completo ? 'Los niveles están llenos y el último se cubre de izquierda a derecha.' : 'Algún nivel intermedio no está lleno o el último tiene huecos a la izquierda.' },
        { t: '**Perfecto** (internos con 2 hijos y todas las hojas al mismo nivel)', ok: ti.perfecto, why: ti.perfecto ? 'Todos los internos tienen 2 hijos y las hojas están al mismo nivel.' : 'Las hojas no están todas al mismo nivel o hay internos con un solo hijo.' },
        { t: '**Binario** (cada nodo tiene a lo sumo 2 hijos)', ok: true, why: 'Todo árbol dibujado aquí tiene a lo sumo 2 hijos por nodo.' }
      ];
      return {
        tipo: 'opcion', multi: true, enunciado: '¿Cuáles de estas propiedades **cumple** el árbol? (Marca todas las que apliquen.)', arbol: t, opciones,
        pistas: ['Comprueba primero cada nodo: ¿tiene 0, 1 o 2 hijos? (si hay alguno con 1 hijo, no es lleno ni perfecto).', 'Completo: recorre el árbol por niveles de izquierda a derecha; una vez que aparece un hueco, no puede haber más nodos después.', 'Todo árbol perfecto es completo y lleno, pero lo contrario no es cierto.'],
        explicacion: 'Propiedades: ' + (tipoTexto(ti).join(', ') || 'ninguna de las tres') + ' (y es binario). Recuerda: perfecto ⇒ completo y lleno.'
      };
    }
  });

  const FAMN = [
    { fn: 'altura', enun: 'Escribe `altura(nodo)` que devuelva la **altura** del árbol que cuelga de `nodo` (en aristas). Por convención del curso la altura de un árbol **vacío** (`None`) es **−1** y la de una hoja es 0.', sol: `def altura(nodo):\n    if nodo is None:\n        return -1\n    return 1 + max(altura(nodo.izq), altura(nodo.der))`, f: t => Arb.altura(t), pistas: ['Caso base: árbol vacío → −1. Así una hoja da 1 + max(−1, −1) = 0.', 'La altura de un nodo es 1 más la mayor altura de sus dos subárboles.', '`return 1 + max(altura(nodo.izq), altura(nodo.der))`.'] },
    { fn: 'contar_nodos', enun: 'Escribe `contar_nodos(nodo)` que devuelva cuántos nodos tiene el árbol que cuelga de `nodo` (0 si es `None`).', sol: `def contar_nodos(nodo):\n    if nodo is None:\n        return 0\n    return 1 + contar_nodos(nodo.izq) + contar_nodos(nodo.der)`, f: t => cuenta(t), pistas: ['Un árbol vacío tiene 0 nodos.', 'Los nodos de un árbol = 1 (la raíz) + nodos del subárbol izquierdo + nodos del derecho.', '`return 1 + contar_nodos(nodo.izq) + contar_nodos(nodo.der)`.'] },
    { fn: 'contar_hojas', enun: 'Escribe `contar_hojas(nodo)` que devuelva cuántas **hojas** (nodos sin hijos) tiene el árbol que cuelga de `nodo` (0 si es `None`).', sol: `def contar_hojas(nodo):\n    if nodo is None:\n        return 0\n    if nodo.izq is None and nodo.der is None:\n        return 1\n    return contar_hojas(nodo.izq) + contar_hojas(nodo.der)`, f: t => Arb.hojas(t), pistas: ['Hay dos casos base: árbol vacío (0 hojas) y nodo sin hijos (1 hoja).', 'Si el nodo tiene hijos, las hojas son las de sus dos subárboles.', '`return contar_hojas(nodo.izq) + contar_hojas(nodo.der)` después de los casos base.'] },
    { fn: 'suma_valores', enun: 'Escribe `suma_valores(nodo)` que devuelva la **suma de los valores** (números) de todos los nodos del árbol (0 si es `None`).', sol: `def suma_valores(nodo):\n    if nodo is None:\n        return 0\n    return nodo.valor + suma_valores(nodo.izq) + suma_valores(nodo.der)`, f: t => Arb.pre(t).reduce((s, x) => s + x, 0), pistas: ['Un árbol vacío suma 0.', 'La suma = valor de la raíz + suma del subárbol izquierdo + suma del derecho.', '`return nodo.valor + suma_valores(nodo.izq) + suma_valores(nodo.der)`.'] }
  ];
  function arbolesPrueba(rng) {
    const lista = [null, Arb.N(7)];
    for (let i = 0; i < 3; i++) lista.push(Arb.aleatorio(rng, rng.int(3, 8), { valores: rng.distinct(8, 1, 40), balance: rng.chance(0.5) }));
    let ch = null; const vals = rng.distinct(5, 1, 40); for (const v of vals) ch = { v, l: ch, r: null }; lista.push(ch);
    return lista;
  }
  B({
    id: 'n4-impl-recursiva', n: 4, e: 'B', dif: 3, c: ['ar_subarbol', 'ar_nodo', 'ar_profalt'], tema: 'Funciones recursivas sobre árboles',
    gen(rng, K) {
      const f = rng.pick(FAMN); const tests = arbolesPrueba(rng).map(t => ({ e: `${f.fn}(${K.pyN(t)})`, r: String(f.f(t)) }));
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: f.fn, cls_arbol: true, prelude: K.PRE_ARBOL, enunciado: f.enun + '\n\nSe te da la clase de nodo (ya definida):', codigoVista: K.CLASE_NODO,
        starter: `def ${f.fn}(nodo):\n    # tu código aquí\n    pass`, solucion: f.sol, tests, reglas: [{ t: 'recursiva', fn: f.fn }, { t: 'sinBucles', fn: f.fn }], ejemploLlamada: f.fn + '(N(1, N(2), N(3)))',
        pistas: f.pistas, explicacion: 'Esquema recursivo sobre árboles: caso base `nodo is None` y combinación de los resultados de `nodo.izq` y `nodo.der`.\n```\n' + f.sol + '\n```'
      };
    }
  });

  function lineasConstruccion(t) {
    const lineas = [{ ruta: null, lado: null, v: t.v, txt: 'raiz = NodoArbol(' + t.v + ')' }];
    (function rec(nd, ruta) {
      for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) if (h) lineas.push({ ruta, lado, v: h.v });
      for (const [h, lado] of [[nd.l, 'izq'], [nd.r, 'der']]) if (h) rec(h, ruta + '.' + lado);
    })(t, 'raiz');
    return lineas;
  }
  B({
    id: 'n4-nodo-completar', n: 4, e: 'B', dif: 3, c: ['ar_nodo', 'ar_diagrama'], tema: 'Construir con NodoArbol (completar)',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { valores: rng.distinct(n, 1, 9) });
      const L = lineasConstruccion(t);
      const cand = []; L.forEach((l, i) => { if (i === 0) return; cand.push({ i, k: 'lado' }); cand.push({ i, k: 'valor' }); });
      const elegidos = rng.sample(cand, 4).sort((a, b) => a.i - b.i || (a.k === 'lado' ? -1 : 1));
      const resp = {}; let h = 0; const mapa = {};
      elegidos.forEach(c => { h++; mapa[c.i + c.k] = h; });
      const texto = L.map((l, i) => {
        if (i === 0) return l.txt;
        const hl = mapa[i + 'lado'], hv = mapa[i + 'valor'];
        const lado = hl ? '[[' + hl + ']]' : l.lado, val = hv ? '[[' + hv + ']]' : l.v;
        if (hl) resp[hl] = [l.lado]; if (hv) resp[hv] = [String(l.v)];
        return l.ruta + '.' + lado + ' = NodoArbol(' + val + ')';
      }).join('\n');
      const sol = L.map((l, i) => i === 0 ? l.txt : l.ruta + '.' + l.lado + ' = NodoArbol(' + l.v + ')').join('\n');
      return {
        tipo: 'codigo', modoEj: 'completar', fn: null, prelude: K.PRE_ARBOL, enunciado: 'Completa el código para que construya el árbol dibujado usando la clase `NodoArbol`. En los huecos van los **atributos** (`izq` o `der`) o los **valores** de los nodos.', arbol: t, codigoVista: K.CLASE_NODO,
        plantilla: texto, respuestas: resp, solucion: sol, tests: [{ e: 'a_nota(raiz)', r: JSON.stringify(Arb.nota(t)) }], anchos: Object.fromEntries(Object.keys(resp).map(k => [k, 5])),
        pistas: ['`raiz.izq` es el hijo izquierdo de la raíz; `raiz.izq.der` es el hijo derecho de ese hijo, etc.', 'Mira el dibujo: para cada nodo, ¿está a la izquierda o a la derecha de su padre?', 'Los valores de los huecos son los números del dibujo; los lados son `izq` o `der`.'],
        explicacion: 'Código completo:\n```\n' + sol + '\n```'
      };
    }
  });

  B({
    id: 'n4-construye-codigo', n: 4, e: 'B', dif: 3, c: ['ar_nodo', 'ar_diagrama'], tema: 'Construir un árbol en Python',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { valores: rng.distinct(n, 1, 9) });
      const sol = lineasConstruccion(t).map((l, i) => i === 0 ? l.txt : l.ruta + '.' + l.lado + ' = NodoArbol(' + l.v + ')').join('\n');
      return {
        tipo: 'codigo', modoEj: 'codigo', fn: null, prelude: K.PRE_ARBOL, enunciado: 'Escribe el código que **construya el árbol dibujado** y deje su raíz en la variable `raiz`. Usa la clase `NodoArbol` (ya definida):', arbol: t, codigoVista: K.CLASE_NODO,
        starter: 'raiz = None\n# construye el árbol aquí', solucion: sol, tests: [{ e: 'a_nota(raiz)', r: JSON.stringify(Arb.nota(t)) }, { e: 'raiz.valor', r: String(t.v) }],
        pistas: ['Crea primero la raíz: `raiz = NodoArbol(valor)`.', 'Cuelga cada hijo con `padre.izq = NodoArbol(v)` o `padre.der = NodoArbol(v)`. Para un nieto encadena atributos: `raiz.izq.der`.', 'Procede por niveles: primero los hijos de la raíz, luego los nietos.'],
        explicacion: 'Una solución:\n```\n' + sol + '\n```'
      };
    }
  });

  B({
    id: 'n4-contar-nodos', n: 4, e: 'B', dif: 3, c: ['ar_perfecto', 'ar_def'], tema: 'Contar nodos de un perfecto',
    gen(rng, K) {
      const h = rng.int(2, 5); const N = Math.pow(2, h + 1) - 1;
      return {
        tipo: 'tabla', enunciado: 'Un árbol binario **perfecto de altura ' + h + '**. Completa:', cols: ['Cantidad', 'Valor'],
        filas: [[{ t: 'Nodos totales' }, { in: String(N), w: 5 }], [{ t: 'Hojas' }, { in: String(Math.pow(2, h)), w: 5 }], [{ t: 'Nodos internos' }, { in: String(N - Math.pow(2, h)), w: 5 }], [{ t: 'Aristas' }, { in: String(N - 1), w: 5 }]],
        pistas: ['Nodos totales: 2^(h+1) − 1.', 'Las hojas están todas en el último nivel (nivel h): 2^h. Los internos son los demás.', 'Aristas = N − 1.'],
        explicacion: 'h = ' + h + ': total ' + N + ', hojas ' + Math.pow(2, h) + ', internos ' + (N - Math.pow(2, h)) + ', aristas ' + (N - 1) + '.'
      };
    }
  });

  B({
    id: 'n4-acceso-nodo', n: 4, e: 'B', dif: 3, c: ['ar_nodo', 'tv_errores'], tema: 'Navegar con atributos',
    gen(rng, K) {
      const n = rng.int(5, 7); const t = Arb.aleatorio(rng, n, { valores: rng.distinct(n, 1, 9), balance: rng.chance(0.5) });
      const lineas = lineasConstruccion(t).map((l, i) => i === 0 ? l.txt : l.ruta + '.' + l.lado + ' = NodoArbol(' + l.v + ')');
      const lados = []; const len = rng.int(2, 4); for (let i = 0; i < len; i++) lados.push(rng.pick(['izq', 'der']));
      const expr = 'raiz.' + lados.join('.') + '.valor';
      const code = K.CLASE_NODO + '\n' + lineas.join('\n') + '\n\nprint(' + expr + ')';
      const r = Py.ejecutar(code);
      let esp, extra = {};
      if (r.ok) { esp = r.stdout.replace(/\n$/, ''); extra = { stdout: true }; }
      else esp = ['AttributeError', 'error', 'attributeerror'];
      return Object.assign({
        tipo: 'salida', enunciado: '¿Qué ocurre al ejecutar el programa? Escribe lo que **imprime** o, si falla, el **tipo de error** que se produce.', codigoVista: code, esperado: esp, placeholder: 'Un número o el nombre del error',
        pistas: ['Dibuja el árbol que construye el código antes de seguir la expresión.', 'Sigue la cadena de izquierda a derecha: cada `.izq`/`.der` baja un nivel. ¿Existe ese nodo?', 'Si en algún punto la referencia es `None`, al pedir `.izq`, `.der` o `.valor` de `None` Python lanza un error (AttributeError).'],
        explicacion: r.ok ? 'La expresión recorre el árbol hasta un nodo existente: imprime **' + esp + '**.' : 'En algún punto la cadena llega a `None` y pedir un atributo de `None` produce **AttributeError** (`' + (r.error.msg) + '`).'
      }, extra);
    }
  });

  /* ============ C ============ */
  const TR4 = [
    ['Todo árbol **perfecto** es también completo y lleno.', true, 'Perfecto exige internos con 2 hijos y hojas al mismo nivel: cumple las otras dos.'],
    ['Todo árbol **lleno** es también completo.', false, 'Un lleno puede tener hojas en niveles distintos y huecos a la izquierda en el último nivel.'],
    ['Todo árbol **completo** es también lleno.', false, 'En un completo puede haber un nodo con un solo hijo (el último interno).'],
    ['Un árbol perfecto de altura 3 tiene 15 nodos.', true, '2^(3+1) − 1 = 15.'],
    ['Un árbol con N nodos tiene N aristas.', false, 'Tiene N − 1 aristas.'],
    ['La altura de un árbol coincide con la mayor profundidad de sus hojas.', true, 'La altura de la raíz es la distancia a la hoja más lejana, que es la hoja más profunda.'],
    ['La **profundidad** de un nodo es el número de aristas hacia su hoja descendiente más lejana.', false, 'Eso es la altura; la profundidad se mide desde la raíz.'],
    ['Un árbol degenerado (en forma de lista) de n nodos tiene altura n − 1.', true, 'Cada nodo tiene un solo hijo: el camino más largo tiene n − 1 aristas.'],
    ['En un árbol **binario** un nodo puede tener hasta 3 hijos.', false, 'Binario: a lo sumo 2 hijos (izquierdo y derecho).'],
    ['Cualquier hoja, por sí sola, es un subárbol.', true, 'Una hoja es una raíz sin hijos: un árbol de un solo nodo.'],
    ['Un árbol balanceado de n elementos tiene altura ∼ log₂ n.', true, 'Por eso los árboles balanceados son eficientes.'],
    ['El árbol vacío no es un árbol porque no tiene raíz, y en una definición recursiva no puede aparecer como subárbol.', false, 'En la definición recursiva, un subárbol vacío (`None`) es el caso base.']
  ];
  B({
    id: 'n4-trampas', n: 4, e: 'C', dif: 4, c: ['ar_tipos', 'ar_perfecto', 'ar_profalt', 'tv_errores'], tema: 'Trampas conceptuales',
    gen(rng, K) {
      const v = rng.sample(TR4.filter(x => x[1]), 2), f = rng.sample(TR4.filter(x => !x[1]), 2), extra = rng.sample(TR4.filter(x => !v.includes(x) && !f.includes(x)), 1);
      const sel = rng.shuffle(v.concat(f).concat(extra));
      return {
        tipo: 'opcion', multi: true, enunciado: '¿Cuáles de las siguientes afirmaciones son **verdaderas**? (Marca todas.)', opciones: sel.map(s => ({ t: s[0], ok: s[1], why: s[2] })),
        pistas: ['Revisa cada una por separado con un ejemplo y un contraejemplo pequeños.', 'Cuidado con las inversas: «perfecto ⇒ completo» no implica «completo ⇒ perfecto».', 'Profundidad se mide desde la raíz; altura hacia las hojas; ambas en aristas.'],
        explicacion: 'Verdaderas: ' + sel.filter(s => s[1]).map(s => '«' + s[0] + '»').join('; ') + '.'
      };
    }
  });

  B({
    id: 'n4-abierta', n: 4, e: 'C', dif: 3, c: ['ar_profalt', 'ar_subarbol'], tema: 'Explicar con palabras',
    gen(rng, K) {
      const a = rng.chance(0.5);
      if (a) return {
        tipo: 'abierta', enunciado: '**Diferencie profundidad y altura** con un ejemplo.',
        criterios: [
          { desc: 'Define la **profundidad** como la distancia (aristas) **desde la raíz** hasta el nodo (raíz = 0).', claves: [['profundidad', 'raiz'], ['desde la raiz'], ['nivel']] },
          { desc: 'Define la **altura** como la distancia (aristas) **desde el nodo hasta la hoja más lejana** (hoja = 0).', claves: [['altura', 'hoja'], ['hacia las hojas'], ['hoja mas lejana'], ['descendiente mas lejano']] },
          { desc: 'Da un **ejemplo concreto** (un árbol o nodo con sus valores).', claves: [/\b[a-z]\b.*(prof|alt).*\d/, /(prof|alt)[a-z]*\s*(\(?[a-z0-9]\)?)?\s*(=|es|de)\s*\d/, ['ejemplo'], [/[a-z]\(\d+\)/]] },
          { desc: 'Aclara que se cuentan **aristas** (no nodos) o que son medidas en direcciones opuestas.', claves: ['arista', 'opuest', 'direccion', ['arriba', 'abajo']] }
        ],
        modelo: 'La **profundidad** de un nodo es el número de **aristas desde la raíz** hasta él (la raíz tiene profundidad 0). La **altura** de un nodo es el número de aristas **desde el nodo hasta su hoja descendiente más lejana** (las hojas tienen altura 0); la altura del árbol es la de su raíz. Ejemplo: en A(B(D,E),C), prof(D) = 2 y alt(D) = 0; prof(A) = 0 y alt(A) = 2. Una se mide hacia abajo desde la raíz y la otra hacia las hojas.',
        pistas: ['Piensa en dos direcciones: de la raíz hacia el nodo, y del nodo hacia las hojas.', 'Cuenta siempre aristas (no nodos).', 'Pon un ejemplo con un árbol pequeño y da la profundidad y la altura de la raíz y de una hoja.'], explicacion: 'S6-C1, diap. 7 y 9.'
      };
      return {
        tipo: 'abierta', enunciado: '**¿Por qué se dice que un árbol es una estructura recursiva?** ¿Qué consecuencia tiene para los algoritmos que lo recorren?',
        criterios: [
          { desc: 'Explica que un árbol es una raíz con **subárboles** (izquierdo y derecho) que a su vez son árboles.', claves: ['subarbol', ['raiz', 'hijos', 'arbol'], 'se compone'] },
          { desc: 'Menciona que incluso una **hoja** (o el árbol vacío) es un subárbol/caso base.', claves: ['hoja', 'vacio', 'none', 'caso base'] },
          { desc: 'Concluye que los algoritmos se escriben **recursivamente** (recorridos, altura, etc.) con el caso base `nodo is None`.', claves: ['recursi', 'recorrido', 'natural', 'caso base'] }
        ],
        modelo: 'Un árbol es una **raíz con un subárbol izquierdo y uno derecho**, y cada subárbol es a su vez un árbol; incluso una hoja es un subárbol (raíz sin hijos) y el árbol vacío (`None`) es el **caso base**. Por eso los algoritmos (recorridos, altura, conteo…) se escriben de forma natural con **recursión**: tratan la raíz y llaman a la misma función sobre `izq` y `der`.',
        pistas: ['Piensa qué es un subárbol del nodo izquierdo de la raíz.', 'Recuerda cuál es el caso base de las funciones sobre árboles.', 'Cierra con la consecuencia para el diseño de algoritmos.'], explicacion: 'S6-C1, diap. 8.'
      };
    }
  });

  B({
    id: 'n4-mixta', n: 4, e: 'C', dif: 4, c: ['ar_profalt', 'ar_tipos', 'ar_perfecto', 'ar_vocab'], tema: 'Análisis integral de un árbol',
    gen(rng, K) {
      const n = rng.int(7, 10); let t, ti;
      for (let i = 0; i < 20; i++) { t = Arb.aleatorio(rng, n, { balance: rng.chance(0.5) }); ti = Arb.tipoArbol(t); if (!ti.perfecto) break; }
      const vs = Arb.ino(t).map(String); const v = rng.pick(vs.filter(x => Arb.hallar(t, x) !== t));
      const opciones = [
        { t: 'Lleno', ok: ti.lleno, why: ti.lleno ? 'Todo nodo tiene 0 o 2 hijos.' : 'Hay nodos con un solo hijo.' },
        { t: 'Completo', ok: ti.completo, why: ti.completo ? 'Niveles llenos salvo el último, de izquierda a derecha.' : 'Hay huecos antes del final del último nivel.' },
        { t: 'Perfecto', ok: ti.perfecto, why: 'Perfecto exige todas las hojas al mismo nivel y todos los internos con 2 hijos.' }
      ];
      return {
        tipo: 'mixta', enunciado: 'Analiza el árbol dibujado.', arbol: t,
        partes: [
          { titulo: 'Altura', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuál es la **altura del árbol** (en aristas)?', esperado: String(Arb.altura(t)) } },
          { titulo: 'Profundidad', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuál es la **profundidad** del nodo `' + v + '`?', esperado: String(profDe(t, v)) } },
          { titulo: 'Aristas', peso: 1, q: { tipo: 'salida', numerico: true, enunciado: '¿Cuántas **aristas** tiene el árbol?', esperado: String(n - 1) } },
          { titulo: 'Tipo', peso: 1.5, q: { tipo: 'opcion', multi: true, enunciado: '¿Cuáles propiedades cumple? (marca todas las que apliquen; si no cumple ninguna, deja todo sin marcar y avanza)', opciones: opciones.some(o => o.ok) ? opciones : opciones.concat([{ t: 'Ninguna de las tres', ok: true, why: 'No es lleno, ni completo, ni perfecto.' }]) } }
        ],
        pistas: ['Marca el camino de la raíz al nodo para la profundidad; busca la hoja más lejana para la altura.', 'Aristas = N − 1 (cuenta los nodos).', 'Lleno: 0 o 2 hijos en cada nodo. Completo: niveles llenos de izquierda a derecha. Perfecto: todo lleno y hojas a igual nivel.'],
        explicacion: 'Altura ' + Arb.altura(t) + ', prof(' + v + ') = ' + profDe(t, v) + ', ' + (n - 1) + ' aristas; propiedades: ' + (tipoTexto(ti).join(', ') || 'ninguna') + '.'
      };
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
