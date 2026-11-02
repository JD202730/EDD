/* taller_gen_test.js — prueba los talleres interactivos de heap, rojo-negro, listas, pilas/colas y arreglos (js/taller_gen.js):
   (1) resuelve cada plantilla «taller» fase por fase comprobando que un movimiento incorrecto NO se acepta (la estructura no cambia ni avanza el paso),
       que las pistas se cuentan y que el resultado coincide con el esperado;
   (2) compara miles de ejercicios aleatorios con una referencia independiente (Sim.heap, Sim.rn y simulaciones con arreglos de JavaScript). */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { out.textContent += s + '\n'; };
  const TG = ET.TallerGen;
  const corto = e => String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e);

  async function resolver(w) {
    const t = w._t; let pasos = 0, rechazos = 0, penal = 0;
    while (!t.estado().fin && pasos < 3000) {
      let S = t.estado(); if (S.pendiente) { t.avanzar(); continue; }
      const p = t.paso(); if (!p) throw new Error('sin paso y sin terminar');
      const mala = t.accionIncorrecta();
      if (mala) {
        const antes = JSON.stringify(t.modelo()), pi = S.pi, f0 = S.fallos;
        await t.intentar(mala); S = t.estado();
        if (JSON.stringify(t.modelo()) !== antes || S.pi !== pi) throw new Error('un movimiento incorrecto fue aceptado en «' + p.id + '»: ' + JSON.stringify(mala));
        if (S.fallos < f0 || S.fallos > f0 + 1) throw new Error('contador de fallos incoherente en «' + p.id + '»');
        if (S.fallos === f0 + 1) penal++;
        rechazos++;
      }
      if (pasos % 3 === 0) { const p0 = t.estado().pistas; t.pista(); if (t.estado().pistas !== p0 + 1) throw new Error('la pista no se contó en «' + p.id + '»'); }
      const antesM = JSON.stringify(t.modelo()), pi0 = t.estado().pi, op0 = t.estado().op;
      await t.intentar(t.accionCorrecta());
      const S2 = t.estado();
      if (JSON.stringify(t.modelo()) === antesM && S2.pi === pi0 && S2.op === op0 && !S2.fin) throw new Error('la acción correcta no fue aceptada en «' + p.id + '»: ' + JSON.stringify(t.accionCorrecta()));
      pasos++;
    }
    if (!t.estado().fin) throw new Error('no terminó');
    return { pasos, rechazos, penal };
  }

  const RNG = semilla => { let s = semilla >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

  async function pruebaTallerGen(nSem) {
    nSem = nSem || 25; const fallos = []; const cuenta = { plantillas: 0, instancias: 0, pasos: 0, rechazos: 0, aleatorios: 0 };
    const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-9999px;top:0;width:900px'; document.body.appendChild(host);
    const reg = (id, msg) => fallos.push({ id, msg });

    /* ---- (1) plantillas del banco ---- */
    const T = ET.Banco.plantillas.filter(t => t.soloPractica && ET.Banco.instanciar(t.id, 1).taller.familia);
    cuenta.plantillas = T.length;
    for (const t of T) for (let s = 1; s <= nSem; s++) {
      const seed = 700 + s * 104729; cuenta.instancias++; window.__tallerGenActual = t.id + ' semilla ' + seed;
      try {
        const q = ET.Banco.instanciar(t.id, seed); host.innerHTML = '';
        const ctl = ET.Tipos.taller.render(host, q, { modo: 'practica', sinAnimar: true }), w = ctl.taller;
        const r = await resolver(w); cuenta.pasos += r.pasos; cuenta.rechazos += r.rechazos;
        const F = TG.familias[q.taller.familia];
        if (F.textoFinal(w._t.modelo()) !== q.taller.finalEsperado) throw new Error('resultado distinto: ' + F.textoFinal(w._t.modelo()) + ' vs ' + q.taller.finalEsperado);
        const g = ET.Tipos.taller.grade(q, ctl.getAnswer());
        if (!g.ok || g.score <= 0 || g.score > 1) throw new Error('nota incoherente ' + JSON.stringify(g));
        const d = document.createElement('div'); d.innerHTML = ET.Tipos.taller.solucionHtml(q); ET.Tipos.hidratar(d);
        if (!d.querySelector('.tg-sol svg')) throw new Error('la solución no dibuja la figura final');
        if (!d.querySelector('ol li')) throw new Error('la solución no explica el procedimiento');
      } catch (e) { reg(t.id + ' (semilla ' + seed + ')', corto(e)); }
    }

    /* ---- (2) aleatorios contra referencias independientes ---- */
    async function caso(nombre, cfg, esperado) {
      host.innerHTML = ''; cuenta.aleatorios++; window.__tallerGenActual = nombre + ' ' + JSON.stringify(cfg);   // para localizar un caso atascado
      try {
        const w = TG.montar(host, Object.assign({ sinAnimar: true }, cfg)), r = await resolver(w); cuenta.pasos += r.pasos; cuenta.rechazos += r.rechazos;
        const m = w._t.modelo(), F = TG.familias[cfg.familia], real = typeof esperado === 'function' ? esperado(m) : F.textoFinal(m);
        const exp = typeof esperado === 'function' ? true : esperado;
        if (real !== exp) throw new Error('el estado final ' + F.textoFinal(m) + ' no coincide con la referencia' + (typeof esperado === 'function' ? '' : ' (' + esperado + ')'));
      } catch (e) { reg(nombre + ' ' + JSON.stringify(cfg).slice(0, 160), corto(e)); }
    }
    const rnd = RNG(12345), ent = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const distintos = (n, a, b) => { const s = new Set(); while (s.size < n) s.add(ent(a, b)); return [...s]; };
    const SH = ET.Sim.heap, SR = ET.Sim.rn;

    for (let k = 0; k < 40; k++) {   // heap: insertar/extraer/construir contra Sim.heap
      const tipo = k % 2 ? 'max' : 'min'; let m = SH.nuevo([], tipo); distintos(ent(0, 8), 1, 80).forEach(v => { m = SH.insertar(m, v).modelo; });
      const vals = SH.valores(m), ops = []; let sim = m; const usados = new Set(vals);
      for (let i = 0; i < ent(1, 4); i++) { if (rnd() < .5 || sim.a.length < 2) { let v; do { v = ent(1, 90); } while (usados.has(v)); usados.add(v); ops.push({ t: 'ins', v }); sim = SH.insertar(sim, v).modelo; } else { ops.push({ t: 'ext' }); sim = SH.extraer(sim).modelo; } }
      await caso('heap', { familia: 'heap', tipo, vals, ops }, m => JSON.stringify(m.a.map(e => e.v)) === JSON.stringify(SH.valores(sim)));
      const arreglo = distintos(ent(2, 9), 1, 80); await caso('heap-build', { familia: 'heap', tipo, vals: arreglo, ops: [{ t: 'build' }] }, m => JSON.stringify(m.a.map(e => e.v)) === JSON.stringify(SH.valores(SH.construir(arreglo, tipo).modelo)));
    }
    for (let k = 0; k < 120; k++) {   // rojo-negro contra Sim.rn (mismo árbol y mismos colores)
      const vals = distintos(ent(0, 9), 1, 99), usados = new Set(vals), ops = [];
      for (let i = 0; i < ent(1, 3); i++) { let v; do { v = ent(1, 99); } while (usados.has(v)); usados.add(v); ops.push({ t: 'ins', v }); }
      let sim = SR.desde(vals); ops.forEach(o => { sim = SR.insertar(sim, o.v).modelo; });
      await caso('rn', { familia: 'rn', vals, ops }, m => SR.nota(m.raiz) === SR.nota(sim.raiz) && SR.valida(m.raiz).ok);
    }
    for (let k = 0; k < 60; k++) {   // lista enlazada
      const vals = distintos(ent(0, 6), 1, 60), ref = vals.slice(), usados = new Set(vals), ops = [];
      const nuevo = () => { let v; do { v = ent(1, 90); } while (usados.has(v)); usados.add(v); return v; };
      for (let i = 0; i < ent(1, 4); i++) {
        const r = rnd();
        if (r < .3 || !ref.length) { const v = nuevo(); ops.push({ t: 'ini', v }); ref.unshift(v); }
        else if (r < .5) { const v = nuevo(); ops.push({ t: 'fin', v }); ref.push(v); }
        else if (r < .75) { const x = ref[ent(0, ref.length - 1)], v = nuevo(); ops.push({ t: 'tras', x, v }); ref.splice(ref.indexOf(x) + 1, 0, v); }
        else { const x = ref[ent(0, ref.length - 1)]; ops.push({ t: 'elim', v: x }); ref.splice(ref.indexOf(x), 1); }
      }
      await caso('lista', { familia: 'lista', vals, ops }, ref.join(','));
    }
    for (const modo of ['pila', 'cola', 'deque']) for (let k = 0; k < 30; k++) {   // pila, cola, deque
      const vals = distintos(ent(0, 4), 1, 60), ref = vals.slice(), sal = [], ops = [];
      for (let i = 0; i < ent(2, 6); i++) {
        const r = rnd(), vacio = !ref.length, v = ent(1, 90);
        if (modo === 'pila') { if (r < .5 || vacio) { ops.push({ t: 'push', v }); ref.push(v); } else { ops.push({ t: 'pop' }); sal.push(ref.pop()); } }
        else if (modo === 'cola') { if (r < .5 || vacio) { ops.push({ t: 'enc', v }); ref.push(v); } else { ops.push({ t: 'des' }); sal.push(ref.shift()); } }
        else if (r < .25 || vacio) { ops.push({ t: 'addr', v }); ref.push(v); } else if (r < .5) { ops.push({ t: 'addl', v }); ref.unshift(v); } else if (r < .75) { ops.push({ t: 'popl' }); sal.push(ref.shift()); } else { ops.push({ t: 'popr' }); sal.push(ref.pop()); }
      }
      await caso(modo, { familia: 'pc', modo, vals, ops }, '[' + ref.join(', ') + ']' + (sal.length ? ' salieron ' + sal.join(',') : ''));
    }
    for (let k = 0; k < 30; k++) {   // cola circular
      const C = ent(3, 7), frente = ent(0, C - 1), vals = distintos(ent(0, C - 1), 1, 60), ref = vals.slice(), sal = [], ops = [];
      for (let i = 0; i < ent(2, 6); i++) { if ((rnd() < .5 && ref.length < C) || !ref.length) { if (ref.length >= C) continue; const v = ent(1, 90); ops.push({ t: 'enc', v }); ref.push(v); } else { ops.push({ t: 'des' }); sal.push(ref.shift()); } }
      await caso('circ', { familia: 'pc', modo: 'circ', C, frente, vals, ops }, '[' + ref.join(', ') + ']' + (sal.length ? ' salieron ' + sal.join(',') : ''));
    }
    for (let k = 0; k < 80; k++) {   // arreglos: insertar, eliminar y búsqueda binaria
      let ref = distintos(ent(1, 9), 1, 80).sort((a, b) => a - b); const vals = ref.slice(), ops = [];
      for (let i = 0; i < ent(1, 3); i++) {
        const r = rnd();
        if (r < .35) { const v = ent(1, 90), kk = ent(0, ref.length); ops.push({ t: 'ins', v, k: kk }); ref.splice(kk, 0, v); }
        else if (r < .55 && ref.length) { const kk = ent(0, ref.length - 1); ops.push({ t: 'del', k: kk }); ref.splice(kk, 1); }
        else if (ref.length && ref.every((v, i) => i === 0 || ref[i - 1] <= v)) ops.push({ t: 'bin', x: rnd() < .5 ? ref[ent(0, ref.length - 1)] : ent(1, 90) });
      }
      if (ops.length) await caso('arr', { familia: 'arr', vals, ops }, ref.join(','));
    }
    host.remove();
    return Object.assign(cuenta, { fallos });
  }
  window.pruebaTallerGen = pruebaTallerGen;

  const btn = document.getElementById('btn-taller');
  if (btn) {
    const previo = btn.onclick;
    btn.onclick = async () => {
      if (previo) await previo();
      log('\nTalleres de heap, rojo-negro, listas, pilas/colas y arreglos…');
      const r = await pruebaTallerGen(25);
      log('Plantillas: ' + r.plantillas + ' | instancias: ' + r.instancias + ' | aleatorios contra referencia: ' + r.aleatorios + ' | pasos correctos: ' + r.pasos + ' | movimientos incorrectos rechazados: ' + r.rechazos + ' | fallos: ' + r.fallos.length);
      r.fallos.slice(0, 20).forEach(f => log(' ✗ ' + f.id + ': ' + f.msg));
    };
  }
})();
