/* traza_test.js — prueba la sincronización código ↔ árbol: el árbol debe salir de la ejecución real del código */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { out.textContent += s + '\n'; };
  const Arb = ET.Arb, Traza = ET.Traza;

  /** convierte el árbol reconstruido ({v:texto,k,l,r}) en un árbol de Arb para compararlo con el motor */
  const aArb = n => n ? { v: isNaN(Number(n.v)) ? n.v : Number(n.v), l: aArb(n.l), r: aArb(n.r) } : null;
  const estadoFinal = (T, cfg) => { const m = new Traza.Modelo(T); const k = T.pasos.length - 1; m.irA(k); return Traza.bosque(T, m, k, cfg); };
  const nota = b => b.arboles.map(a => Arb.nota(aArb(a.arbol)));
  const cuenta = n => n ? 1 + cuenta(n.l) + cuenta(n.r) : 0;
  const alt = n => n ? 1 + Math.max(alt(n.l), alt(n.r)) : -1;
  const ordenado = a => a.every((x, i) => i === 0 || a[i - 1] < x);

  async function pruebaTraza() {
    const fallos = []; let comprobaciones = 0;
    const ok = (cond, msg) => { comprobaciones++; if (!cond) fallos.push(msg); };
    const T0 = performance.now();

    /* 1) todos los ejemplos corren sin error y sin truncar */
    const R = {};
    ET.Ejemplos.lista.forEach(e => {
      const t0 = performance.now(); const T = Traza.ejecutar(e.codigo); R[e.id] = T;
      ok(!T.error, e.id + ': error ' + (T.error && T.error.msg));
      ok(!T.truncada, e.id + ': traza truncada');
      ok(T.pasos.length > 10, e.id + ': pocos pasos');
      log('  ' + e.id + ': ' + T.pasos.length + ' pasos, ' + T.eventos.length + ' eventos, ' + T.nNodos + ' objetos, ' + Math.round(performance.now() - t0) + ' ms');
    });

    /* 2) estados finales coinciden con el motor de árboles */
    {
      const vals = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 55, 65, 75, 85, 5, 15, 28, 38, 48, 58, 68];
      const b = estadoFinal(R['bst-insertar']); const esp = Arb.nota(Arb.insertarSecuencia(vals));
      ok(b.arboles.length === 1, 'bst-insertar: debería haber 1 árbol, hay ' + b.arboles.length);
      ok(nota(b)[0] === esp, 'bst-insertar: árbol final distinto: ' + nota(b)[0] + ' vs ' + esp);
      ok(b.nNodos === 22, 'bst-insertar: 22 nodos, hay ' + b.nNodos);
      ok(R['bst-insertar'].salida.trim() === 'inorden: [' + vals.slice().sort((a, c) => a - c).join(', ') + ']', 'bst-insertar: salida inorden: ' + R['bst-insertar'].salida);
    }
    {
      const b = estadoFinal(R['bst-degenerado']);
      ok(b.arboles.length === 2, 'bst-degenerado: 2 árboles, hay ' + b.arboles.length);
      const hs = b.arboles.map(a => alt(aArb(a.arbol))).sort((x, y) => x - y);
      ok(hs[1] === 15, 'bst-degenerado: altura 15 esperada, hay ' + hs);
      ok(/altura con datos ordenados: 15/.test(R['bst-degenerado'].salida), 'bst-degenerado: salida ' + R['bst-degenerado'].salida);
    }
    {
      const vals = [10, 20, 30, 40, 50, 25, 60, 70, 80, 65, 5, 3, 1, 90, 85, 95, 27, 26];
      const b = estadoFinal(R['avl-insertar']); const esp = Arb.nota(Arb.construirAVL(vals).arbol);
      ok(nota(b)[0] === esp, 'avl-insertar: árbol distinto del motor: ' + nota(b)[0] + ' vs ' + esp);
      ok(Arb.esAVL(aArb(b.arboles[0].arbol)), 'avl-insertar: el resultado no es AVL');
      ok(cuenta(b.arboles[0].arbol) === 18, 'avl-insertar: 18 nodos');
      // las alturas guardadas por el código coinciden con las calculadas
      let malas = 0; (function rec(n) { if (!n) return; if (n.meta.h !== alt(n)) malas++; rec(n.l); rec(n.r); })(b.arboles[0].arbol);
      ok(malas === 0, 'avl-insertar: ' + malas + ' alturas guardadas no coinciden con la altura real');
    }
    {
      const b = estadoFinal(R['avl-cuatro-casos']);
      ok(b.arboles.length === 4 && nota(b).every(x => x === '20(10,30)'), 'avl-cuatro-casos: ' + nota(b).join(' | '));
    }
    {
      const base = [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45, 65, 85, 5]; let t = Arb.construirAVL(base).arbol;
      [60, 65, 80, 70, 85].forEach(v => { t = Arb.delAVL(t, v, 'suc').arbol; });
      const b = estadoFinal(R['avl-eliminar']);
      ok(nota(b)[0] === Arb.nota(t), 'avl-eliminar: ' + nota(b)[0] + ' vs ' + Arb.nota(t));
      ok(Arb.esAVL(aArb(b.arboles[0].arbol)), 'avl-eliminar: resultado no AVL');
    }
    {
      const b = estadoFinal(R['rn-insertar']); const t = b.arboles[0].arbol;
      ok(b.arboles.length === 1 && cuenta(t) === 14, 'rn-insertar: 14 nodos en un árbol, hay ' + cuenta(t));
      const col = n => /^(1|NEGRO)$/.test(String(n.meta.col)) ? 'N' : 'R';
      ok(col(t) === 'N', 'rn-insertar: la raíz debe ser negra');
      let dosRojos = 0, bh = new Set(); (function rec(n, negros) { if (!n) { bh.add(negros); return; } if (col(n) === 'R') { [n.l, n.r].forEach(x => { if (x && col(x) === 'R') dosRojos++; }); } const nn = negros + (col(n) === 'N' ? 1 : 0); rec(n.l, nn); rec(n.r, nn); })(t, 0);
      ok(dosRojos === 0, 'rn-insertar: hay ' + dosRojos + ' pares de rojos seguidos');
      ok(bh.size === 1, 'rn-insertar: caminos con distinto número de negros: ' + [...bh]);
      ok(Arb.ino(aArb(t)).join() === [1, 3, 5, 10, 20, 25, 30, 40, 45, 50, 60, 70, 80, 90].join(), 'rn-insertar: inorden');
    }
    {
      const T = R['recorridos']; const sal = T.salida.trim().split('\n');
      ok(sal[0] === 'preorden : [1, 2, 4, 8, 9, 5, 10, 3, 6, 13, 7, 12, 11]', 'recorridos: preorden ' + sal[0]);
      ok(sal[1] === 'inorden  : [8, 4, 9, 2, 10, 5, 1, 6, 13, 3, 12, 7, 11]', 'recorridos: inorden ' + sal[1]);
      ok(sal[2] === 'postorden: [8, 9, 4, 10, 5, 2, 13, 6, 12, 11, 7, 3, 1]', 'recorridos: postorden ' + sal[2]);
      ok(sal[3] === 'niveles  : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 13, 12, 11]', 'recorridos: niveles ' + sal[3]);
    }
    {
      const b = estadoFinal(R['fib-llamadas']);
      ok(b.arboles.length >= 1 && cuenta(b.arboles[0].arbol) === 25, 'fib-llamadas: fib(6) tiene 25 llamadas, hay ' + cuenta(b.arboles[0].arbol));
      ok(/fib\(6\) = 8/.test(R['fib-llamadas'].salida), 'fib-llamadas: salida');
    }

    /* 3) avance y retroceso coinciden; los saltos aleatorios dan el mismo estado que el avance secuencial */
    for (const id of ['bst-insertar', 'avl-insertar', 'bst-eliminar', 'rn-insertar']) {
      const T = R[id]; const N = T.pasos.length; const m = new Traza.Modelo(T); const seq = [];
      for (let k = 0; k < N; k += 7) { m.irA(k); seq[k] = JSON.stringify(nota(Traza.bosque(T, m, k))); }
      let difs = 0; for (let k = Math.floor((N - 1) / 7) * 7; k >= 0; k -= 7) { m.irA(k); if (JSON.stringify(nota(Traza.bosque(T, m, k))) !== seq[k]) difs++; }
      ok(difs === 0, id + ': ' + difs + ' estados distintos al retroceder');
      const m2 = new Traza.Modelo(T); let d2 = 0; for (let i = 0; i < 40; i++) { const k = Math.floor(Math.random() * N); if (seq[k] === undefined) continue; m2.irA(k); if (JSON.stringify(nota(Traza.bosque(T, m2, k))) !== seq[k]) d2++; }
      ok(d2 === 0, id + ': ' + d2 + ' saltos aleatorios con estado distinto');
    }

    /* 4) historial de un nodo: sus eventos remiten a líneas reales del código */
    {
      const T = R['bst-insertar']; const lineasIns = T.lineas.map((l, i) => /nodo\.(izq|der) = insertar/.test(l) ? i + 1 : -1).filter(x => x > 0);
      const m = new Traza.Modelo(T); m.irA(T.pasos.length - 1); const b = Traza.bosque(T, m, T.pasos.length - 1);
      const raizId = +b.arboles[0].arbol.k; const h = (T.hist.get(raizId) || []).map(i => T.eventos[i]);
      ok(h[0] && h[0].k === 'n', 'historial: el primer evento de la raíz debe ser su creación');
      ok(h.some(e => e.k === 's' && e.a === 'izq') && h.some(e => e.k === 's' && e.a === 'der'), 'historial: la raíz debe tener asignaciones de izq y der');
      ok(h.filter(e => e.k === 's' && (e.a === 'izq' || e.a === 'der') && e.v.o !== undefined).every(e => lineasIns.includes(e.l)), 'historial: las asignaciones deben venir de las líneas nodo.izq/der = insertar(...)');
    }

    /* 5) la visualización depende del código: cambiar el código cambia el árbol */
    {
      const e = ET.Ejemplos.porId['bst-insertar'];
      const roto = e.codigo.replace('if v < nodo.valor:', 'if v > nodo.valor:').replace('elif v > nodo.valor:', 'elif v < nodo.valor:');
      const T = Traza.ejecutar(roto); const b = estadoFinal(T);
      const t = aArb(b.arboles[0].arbol);
      ok(Arb.ino(t).join() === Arb.ino(t).slice().sort((x, y) => y - x).join(), 'código con comparación invertida: el árbol debe quedar con inorden DESCENDENTE');
      ok(nota(b)[0] !== nota(estadoFinal(R['bst-insertar']))[0], 'el árbol no cambió al cambiar el código');
    }

    /* 6) nombres de atributos distintos y mapeo configurable */
    {
      const cod = "class Node:\n    def __init__(self, key):\n        self.key = key\n        self.left = None\n        self.right = None\ndef add(n, k):\n    if n is None:\n        return Node(k)\n    if k < n.key:\n        n.left = add(n.left, k)\n    else:\n        n.right = add(n.right, k)\n    return n\nr = None\nfor k in [5, 3, 8, 1, 4]:\n    r = add(r, k)\n";
      const T = Traza.ejecutar(cod); const b = estadoFinal(T);
      ok(!T.error && nota(b)[0] === '5(3(1,4),8)', 'left/right/key: ' + nota(b)[0]);
      const cod2 = cod.replace(/left/g, 'hijoA').replace(/right/g, 'hijoB');
      const T2 = Traza.ejecutar(cod2); const b2 = estadoFinal(T2);
      ok(b2.arboles.length === 0, 'atributos desconocidos: no debería dibujarse árbol');
      const b3 = estadoFinal(T2, { izq: ['hijoA'], der: ['hijoB'] });
      ok(nota(b3)[0] === '5(3(1,4),8)', 'con mapeo configurado debería dibujarse: ' + nota(b3)[0]);
    }

    /* 7) más de 12 nodos (60) y un árbol grande */
    {
      let cod = ET.Ejemplos.porId['bst-insertar'].codigo.split('raiz = None')[0] + 'raiz = None\nimport random\nvalores = [(i * 37) % 101 for i in range(1, 61)]\nfor v in valores:\n    raiz = insertar(raiz, v)\n';
      cod = cod.replace('import random\n', '');
      const T = Traza.ejecutar(cod); const b = estadoFinal(T);
      ok(!T.error, '60 nodos: error ' + (T.error && T.error.msg));
      ok(b.nNodos === new Set((function () { const a = []; for (let i = 1; i <= 60; i++) a.push((i * 37) % 101); return a; })()).size, '60 nodos: nNodos ' + b.nNodos);
      ok(b.nNodos >= 55, '60 nodos: se esperaban ≥ 55 nodos distintos, hay ' + b.nNodos);
    }

    /* 8) errores y límites: se informan, no se simulan */
    {
      const T = Traza.ejecutar('x = 1\ny = x + z\n'); ok(T.error && T.error.tipo === 'NameError' && T.pasos[T.pasos.length - 1].tipo === 'err', 'NameError debe informarse en el último paso');
      const T2 = Traza.ejecutar('def g():\n    yield 1\nfor a in g():\n    pass\n'); ok(!!T2.error, 'generadores: debe informarse como no soportado');
      const T3 = Traza.ejecutar('while True:\n    pass\n', { maxSteps: 20000, maxPasos: 500 }); ok(T3.truncada && !!T3.error, 'bucle infinito: debe truncar e informar el límite');
      const T4 = Traza.ejecutar('def f(n):\n    return f(n + 1)\nf(0)\n'); ok(T4.error && T4.error.tipo === 'RecursionError', 'recursión infinita: RecursionError');
    }

    log('Comprobaciones: ' + comprobaciones + ' | fallos: ' + fallos.length + ' | ' + Math.round(performance.now() - T0) + ' ms');
    return { comprobaciones, fallos };
  }
  window.pruebaTraza = pruebaTraza;
  const btn = document.getElementById('btn-traza');
  if (btn) btn.onclick = async () => { out.textContent = 'Probando la sincronización código ↔ árbol…\n'; const r = await pruebaTraza(); r.fallos.slice(0, 25).forEach(f => log(' ✗ ' + f)); };
})();
