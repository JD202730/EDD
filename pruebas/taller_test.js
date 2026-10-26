/* taller_test.js — prueba el taller interactivo: resuelve cada plantilla «taller» fase por fase,
   comprobando que un movimiento incorrecto NO se acepta (el árbol no cambia ni avanza la fase)
   y que el resultado final coincide con el AVL/BST calculado por el motor. */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { out.textContent += s + '\n'; };

  function accionIncorrecta(f, S) {
    const plan = S.plan;
    switch (f.id) {
      case 'colocar': return { tipo: 'slot', padre: ET.Arb.kk(S.arbol), lado: plan.pos.padre === ET.Arb.kk(S.arbol) && plan.pos.lado === 'l' ? 'r' : 'l' };
      case 'detectar': return f.nodo === null ? { tipo: 'nodo', key: ET.Arb.kk(S.arbol) } : { tipo: 'ninguno' };
      case 'clasificar': return { tipo: 'caso', v: ['LL', 'RR', 'LR', 'RL'].find(c => c !== f.caso) };
      case 'rotar': return { tipo: 'rot', rot: f.paso.rot === 'derecha' ? 'izquierda' : 'derecha', sobre: String(f.paso.sobre) };
      case 'tipoDel': return { tipo: 'tipoDel', n: (plan.hijos + 1) % 3 };
      case 'quitar': return plan.hijos === 0 ? { tipo: 'papelera', key: ET.Arb.kk(S.arbol) === String(plan.v) ? 'xx' : ET.Arb.kk(S.arbol) } : { tipo: 'papelera', key: String(plan.v) };
    }
  }

  async function resolver(w, fallosEsperados) {
    const t = w._t; let guard = 0, rechazos = 0, penalizados = 0, fases = 0;
    while (!t.estado().fin && guard++ < 500) {
      let S = t.estado();
      if (S.pendiente) { t.avanzar(); continue; }
      const f = t.fase();
      if (!f) throw new Error('sin fase y sin terminar');
      // 1) un movimiento incorrecto no se acepta
      const mala = accionIncorrecta(f, S);
      const antesArbol = S.arbol, antesFi = S.fi, antesF = S.fallos;
      await t.intentar(mala);
      S = t.estado();
      if (S.arbol !== antesArbol) throw new Error('movimiento incorrecto cambió el árbol en la fase ' + f.id);
      if (S.fi !== antesFi) throw new Error('movimiento incorrecto avanzó de fase (' + f.id + ')');
      if (S.fallos < antesF || S.fallos > antesF + 1) throw new Error('contador de fallos incoherente en ' + f.id);
      if (S.fallos === antesF + 1) penalizados++;
      rechazos++;
      // 2) pistas progresivas
      if (fases % 3 === 0) { const p0 = S.pistas; t.pista(); if (t.estado().pistas !== p0 + 1) throw new Error('la pista no se contó en ' + f.id); }
      // 3) la acción correcta sí se acepta
      const buena = t.accionCorrecta();
      const fi0 = t.estado().fi; const op0 = t.estado().op;
      await t.intentar(buena);
      const S2 = t.estado();
      if (S2.fi === fi0 && S2.op === op0 && !S2.fin) throw new Error('la acción correcta no fue aceptada en ' + f.id + ': ' + JSON.stringify(buena));
      fases++;
    }
    return { rechazos, penalizados, fases };
  }

  async function pruebaTaller(nSem) {
    nSem = nSem || 25; const fallos = []; let total = 0, rech = 0, pen = 0, fas = 0;
    const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-9999px;top:0;width:900px'; document.body.appendChild(host);
    const T = ET.Banco.plantillas.filter(t => t.soloPractica);
    for (const t of T) {
      for (let s = 1; s <= nSem; s++) {
        const seed = 500 + s * 104729; total++;
        try {
          const q = ET.Banco.instanciar(t.id, seed);
          host.innerHTML = '';
          const ctl = ET.Tipos.taller.render(host, q, { modo: 'practica', sinAnimar: true });
          const w = ctl.taller;
          const r = await resolver(w);
          rech += r.rechazos; pen += r.penalizados; fas += r.fases;
          const S = w._t.estado();
          if (!S.fin) throw new Error('no terminó');
          if (!ET.Arb.igual(S.arbol, q.taller.finalEsperado)) throw new Error('árbol final distinto: ' + ET.Arb.nota(S.arbol) + ' vs ' + ET.Arb.nota(q.taller.finalEsperado));
          const g = ET.Tipos.taller.grade(q, ctl.getAnswer());
          if (!g.ok || g.score <= 0 || g.score > 1) throw new Error('nota incoherente ' + JSON.stringify(g));
          if (q.taller.tipo === 'avl' && !ET.Arb.esAVL(S.arbol)) throw new Error('el resultado no es AVL');
          if (typeof ET.Tipos.taller.solucionHtml(q) !== 'string') throw new Error('solucionHtml');
        } catch (e) { fallos.push({ id: t.id, seed, msg: String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e) }); }
      }
    }
    // árbol inicial vacío (laboratorio): secuencia de clase
    try {
      host.innerHTML = '';
      const ops = [10, 20, 30, 40, 50, 25].map(v => ({ t: 'ins', v }));
      const w = ET.Taller.montar(host, { tipo: 'avl', conv: 'suc', arbol: null, ops, estricto: true, sinAnimar: true });
      await w._t.autoResolver();
      const S = w._t.estado();
      if (!S.fin || ET.Arb.nota(S.arbol) !== '30(20(10,25),40(,50))') throw new Error('secuencia de clase: ' + ET.Arb.nota(S.arbol));
    } catch (e) { fallos.push({ id: 'vacio', seed: 0, msg: String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e) }); }
    // rebalanceo de un árbol que ya llega desbalanceado
    try {
      host.innerHTML = '';
      const t0 = ET.Arb.parse('30(20(10(5,),),)');
      const w = ET.Taller.montar(host, { tipo: 'avl', conv: 'suc', arbol: t0, ops: [{ t: 'reb' }], estricto: true, sinAnimar: true });
      await w._t.autoResolver();
      if (!w._t.estado().fin || !ET.Arb.esAVL(w._t.estado().arbol)) throw new Error('reb: ' + ET.Arb.nota(w._t.estado().arbol));
    } catch (e) { fallos.push({ id: 'reb', seed: 0, msg: String(e && e.message || e) }); }
    // ejercicios grandes (más de 12 valores): 30 inserciones y 8 eliminaciones, AVL y BST, deben terminar y coincidir con el motor
    for (const [tipo, conv] of [['avl', 'suc'], ['bst', 'pred']]) {
      try {
        host.innerHTML = '';
        const ins = [...new Set(Array.from({ length: 30 }, (_, i) => ((i * 37) % 97) + 3))].map(v => ({ t: 'ins', v }));
        const ops = ins.concat(ins.slice(2, 10).map(o => ({ t: 'del', v: o.v })));
        const w = ET.Taller.montar(host, { tipo, conv, arbol: null, ops, estricto: true, sinAnimar: true });
        await w._t.autoResolver();
        let sim = null; ops.forEach(o => { sim = o.t === 'ins' ? (tipo === 'avl' ? ET.Arb.insAVL(sim, o.v).arbol : ET.Arb.insBST(sim, o.v)) : (tipo === 'avl' ? ET.Arb.delAVL(sim, o.v, conv).arbol : ET.Arb.delBST(sim, o.v, conv)); });
        const S = w._t.estado();
        if (!S.fin || !ET.Arb.igual(S.arbol, sim)) throw new Error('ejercicio grande ' + tipo + ': el árbol final no coincide con el motor');
        if (tipo === 'avl' && !ET.Arb.esAVL(S.arbol)) throw new Error('ejercicio grande avl: no es AVL');
      } catch (e) { fallos.push({ id: 'grande-' + tipo, seed: 0, msg: String(e && e.message || e) }); }
    }
    host.remove();
    return { plantillas: T.length, instancias: total, rechazos: rech, penalizados: pen, fases: fas, fallos };
  }
  window.pruebaTaller = pruebaTaller;
  const btn = document.getElementById('btn-taller');
  if (btn) btn.onclick = async () => {
    out.textContent = 'Probando talleres…\n';
    const r = await pruebaTaller(25);
    log('Plantillas taller: ' + r.plantillas + ' | instancias: ' + r.instancias + ' | fases correctas: ' + r.fases + ' | movimientos incorrectos rechazados: ' + r.rechazos + ' (penalizados: ' + r.penalizados + ') | fallos: ' + r.fallos.length);
    r.fallos.slice(0, 20).forEach(f => log(' ✗ ' + f.id + ' (semilla ' + f.seed + '): ' + f.msg));
  };
})();
