/* banco_taller.js — talleres interactivos de árboles (se resuelven moviendo nodos; modo estricto).
   Solo de práctica (soloPractica): no entran en exámenes porque requieren arrastrar. */
(function (global) {
  'use strict';
  const ET = global.ET, Arb = ET.Arb, B = ET.Banco.add;
  const CID = { LL: 'av_ll', RR: 'av_rr', LR: 'av_lr', RL: 'av_rl' };
  const PIST = ['Las pistas de este ejercicio están dentro del taller (botón «💡 Pista»): cada una resta un poco de crédito.'];
  const coma = a => a.join(', ');

  /** árbol que resulta de aplicar las operaciones (misma lógica que usa el taller para validar) */
  function finalDe(arbol, ops, tipo, conv) {
    let t = arbol;
    ops.forEach(o => {
      if (o.t === 'ins') t = tipo === 'avl' ? Arb.insAVL(t, o.v).arbol : Arb.insBST(t, o.v);
      else if (o.t === 'del') t = tipo === 'avl' ? Arb.delAVL(t, o.v, conv).arbol : Arb.delBST(t, o.v, conv);
      else t = Arb.rebalancear(t).arbol;
    });
    return t;
  }
  function base(extra) { return Object.assign({ tipo: 'taller', fmt: 'Taller interactivo de árboles', cat: 'analisis', pistasInternas: true, pistas: PIST }, extra); }
  function taller(tipo, conv, arbol, ops) { return { tipo, conv, arbol, ops, estricto: true, finalEsperado: finalDe(arbol, ops, tipo, conv) }; }
  const cuentaRot = (ops, arbol, conv) => { let t = arbol, n = 0; ops.forEach(o => { const r = o.t === 'ins' ? Arb.insAVL(t, o.v) : Arb.delAVL(t, o.v, conv); n += r.pasos.length; t = r.arbol; }); return n; };

  /* -------------------------- AVL -------------------------- */
  B({
    id: 'n7-taller-rot3', n: 7, e: 'A', dif: 2, c: ['av_ll', 'av_rr', 'av_lr', 'av_rl', 'av_rotsimple', 'av_primer'], tema: 'Taller: rotar con tres nodos', soloPractica: true,
    gen(rng, K, opts) {
      const caso = (opts && opts.caso) || rng.pick(['LL', 'RR', 'LR', 'RL']);
      const seq = Arb.secuenciaCaso(caso, rng); const arbol = Arb.insertarSecuencia(seq.slice(0, 2)); const ops = [{ t: 'ins', v: seq[2] }];
      return base({
        enunciado: 'Tienes este **AVL** de dos nodos y vas a insertar el **' + seq[2] + '**. Hazlo tú moviendo los nodos: **(1)** cuelga el nodo nuevo donde corresponde, **(2)** encuentra el nodo desbalanceado, **(3)** clasifica el desbalance y **(4)** aplica la rotación (o las dos rotaciones).',
        taller: taller('avl', 'suc', arbol, ops), conceptos: [CID[caso], 'av_rotsimple', 'av_primer'],
        explicacion: 'Insertar ' + coma(seq) + ' en ese orden produce el caso **' + caso + ' (' + Arb.NOMBRE_CASO[caso] + ')**: ' + Arb.ROT_CASO[caso] + '. El valor del medio queda en la raíz.'
      });
    }
  });

  B({
    id: 'n7-taller-insercion', n: 7, e: 'B', dif: 3, c: ['av_primer', 'av_insertar', 'av_rotsimple', 'av_ll', 'av_rr', 'av_lr', 'av_rl'], tema: 'Taller: insertar y rebalancear', soloPractica: true,
    gen(rng, K, opts) {
      const caso = (opts && opts.caso) || null;
      const s = K.escenarioRot(rng, caso, rng.int(4, 7)); const ops = [{ t: 'ins', v: s.nuevo }];
      return base({
        enunciado: 'Inserta el **' + s.nuevo + '** en este **AVL** (balanceado). Primero ubícalo como en un BST; luego decide si algún nodo se desbalancea, de qué tipo es y rota. Si el árbol quedara balanceado, dilo.',
        taller: taller('avl', 'suc', s.base, ops), conceptos: ['av_primer', 'av_insertar', CID[s.r.caso]],
        explicacion: 'El primer nodo desbalanceado es **' + s.r.primerDesbalanceado + '** y el caso es **' + s.r.caso + '** (' + Arb.NOMBRE_CASO[s.r.caso] + '): ' + Arb.ROT_CASO[s.r.caso] + '. Árbol final: **' + Arb.nota(s.r.arbol) + '**.'
      });
    }
  });

  B({
    id: 'n7-taller-secuencia', n: 7, e: 'C', dif: 4, c: ['av_insertar', 'av_primer', 'av_ll', 'av_rr', 'av_lr', 'av_rl'], tema: 'Taller: varias inserciones seguidas', soloPractica: true,
    gen(rng, K) {
      let arbol, ops;
      for (let i = 0; i < 300; i++) {
        const k = rng.int(3, 5); const vals = rng.distinct(k + 3, 5, 95);
        arbol = Arb.construirAVL(vals.slice(0, k)).arbol; ops = vals.slice(k).map(v => ({ t: 'ins', v }));
        if (cuentaRot(ops, arbol) >= 2 || i === 299) break;
      }
      return base({
        enunciado: 'Inserta, **en este orden**, los valores **' + coma(ops.map(o => o.v)) + '** en el AVL. Para cada uno: colócalo, revisa los factores y, si hace falta, rota.',
        taller: taller('avl', 'suc', arbol, ops), conceptos: ['av_insertar', 'av_primer', 'av_rotsimple'],
        explicacion: 'Árbol final: **' + Arb.nota(finalDe(arbol, ops, 'avl')) + '**. En cada inserción se revisan los factores desde el nodo nuevo hacia la raíz y se corrige el primer nodo con |factor| = 2 que se encuentre.'
      });
    }
  });

  B({
    id: 'n7-taller-eliminar', n: 7, e: 'C', dif: 5, c: ['av_eliminar', 'av_primer', 'av_rotsimple', 'bs_eliminar'], tema: 'Taller: eliminar y rebalancear', soloPractica: true,
    gen(rng, K) {
      let arbol, x;
      for (let i = 0; i < 400; i++) {
        const n = rng.int(6, 9); arbol = Arb.construirAVL(rng.distinct(n, 5, 95)).arbol; x = rng.pick(Arb.ino(arbol));
        if (Arb.delAVL(arbol, x, 'suc').pasos.length || i === 399) break;
      }
      const ops = [{ t: 'del', v: x }]; const r = Arb.delAVL(arbol, x, 'suc');
      return base({
        enunciado: 'Elimina el **' + x + '** de este **AVL**. Convención: si tiene dos hijos se reemplaza por su **sucesor inorden**. Después de quitarlo como en un BST, revisa los factores desde donde cambió el árbol hasta la raíz: la eliminación puede necesitar **más de una rotación**.',
        taller: taller('avl', 'suc', arbol, ops), conceptos: ['av_eliminar', 'bs_eliminar', 'av_primer'],
        explicacion: 'Primero se elimina como en un BST y luego se rebalancea. Rotaciones necesarias: **' + r.pasos.length + '**. Árbol final: **' + Arb.nota(r.arbol) + '**.'
      });
    }
  });

  /* -------------------------- BST -------------------------- */
  B({
    id: 'n6-taller-bst-insertar', n: 6, e: 'B', dif: 2, c: ['bs_insertar', 'bs_prop'], tema: 'Taller: insertar en un BST', soloPractica: true,
    gen(rng, K) {
      const vals = rng.distinct(8, 5, 95); const arbol = Arb.insertarSecuencia(vals.slice(0, 6)); const ops = vals.slice(6).map(v => ({ t: 'ins', v }));
      return base({
        enunciado: 'Inserta, **en este orden**, los valores **' + coma(ops.map(o => o.v)) + '** en este **BST**. Arrastra cada nodo nuevo al hueco donde queda como hoja (en un BST **no** se rota).',
        taller: taller('bst', 'pred', arbol, ops), conceptos: ['bs_insertar', 'bs_prop'],
        explicacion: 'Se compara con la raíz y se baja a la izquierda (menor) o a la derecha (mayor) hasta llegar a un hueco. Árbol final: **' + Arb.nota(finalDe(arbol, ops, 'bst')) + '**.'
      });
    }
  });

  B({
    id: 'n6-taller-bst-eliminar', n: 6, e: 'B', dif: 3, c: ['bs_eliminar', 'bs_minmax'], tema: 'Taller: eliminar en un BST', soloPractica: true,
    gen(rng, K) {
      const vals = rng.distinct(8, 5, 95); const arbol = Arb.insertarSecuencia(vals);
      const nds = Arb.nodos(arbol); const dos = nds.filter(n => n.l && n.r), uno = nds.filter(n => (!n.l) !== (!n.r)), hoja = nds.filter(n => !n.l && !n.r);
      const pick = (lst) => lst.length ? rng.pick(lst).v : null; const primero = pick(dos) !== null ? pick(dos) : pick(uno);
      const ops = [{ t: 'del', v: primero }];
      const t1 = Arb.delBST(arbol, primero, 'pred'); const n1 = Arb.nodos(t1);
      const cand = n1.filter(n => (rng.chance(0.5) ? (!n.l && !n.r) : ((!n.l) !== (!n.r)) || (n.l && n.r)));
      if (cand.length) ops.push({ t: 'del', v: rng.pick(cand).v });
      return base({
        enunciado: 'Elimina, **en este orden**, los valores **' + coma(ops.map(o => o.v)) + '** de este **BST**. Convención: si el nodo tiene dos hijos se reemplaza por su **predecesor inorden** (el mayor del subárbol izquierdo).',
        taller: taller('bst', 'pred', arbol, ops), conceptos: ['bs_eliminar', 'bs_minmax'],
        explicacion: 'Tres casos: hoja (se quita), un hijo (lo reemplaza su hijo) y dos hijos (lo reemplaza el predecesor inorden). Árbol final: **' + Arb.nota(finalDe(arbol, ops, 'bst', 'pred')) + '**.'
      });
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
