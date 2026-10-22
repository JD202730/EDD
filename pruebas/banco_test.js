/* banco_test.js — valida todas las plantillas del banco (se ejecuta en el navegador desde pruebas.html) */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { out.textContent += s + '\n'; };
  const post = (name, data) => fetch('/' + name, { method: 'POST', body: JSON.stringify(data) }).then(r => r.text()).catch(e => 'sin servidor: ' + e);

  function respuestaEnBlanco(q) {
    switch (q.tipo) {
      case 'opcion': return [];
      case 'vf': return { v: null, j: -1 };
      case 'abierta': return { texto: '', manual: {} };
      case 'salida': return '';
      case 'tabla': return [];
      case 'codigo': return (q.modoEj === 'completar') ? { huecos: {} } : { codigo: q.starter || '' };
      case 'bigo': return {};
      case 'arbol': return '';
      case 'avl': return {};
      case 'clasificar': return [];
      case 'orden': return q.inicial.slice();
      case 'mixta': return q.partes.map(p => respuestaEnBlanco(p.q));
      case 'taller': return { fin: false, fallos: 0, pistas: 0 };
      case 'vfj': return { v: null, texto: '', manual: {} };
      case 'cplx': return { texto: '', manual: {} };
    }
  }
  const sig = q => JSON.stringify((q.opciones || []).map(o => o.t)) + (q.criterios ? 'c' : '') + (q.items ? JSON.stringify(q.items) : '') + (q.enunciado || '') + '|' + (q.codigoVista || '') + '|' + (q.afirmacion || '') + '|' + (q.arbol ? ET.Arb.nota(q.arbol) : '') + '|' + (q.starter || '') + '|' + (q.plantilla || '') + (q.taller ? '|' + ET.Arb.nota(q.taller.arbol) + JSON.stringify(q.taller.ops) : '');

  async function pruebaBanco(nSemillas) {
    nSemillas = nSemillas || 12;
    const T = ET.Banco.plantillas; const fallos = [], variedad = {}, tiempos = {}; const exportar = [];
    const cats = {}, fmts = {}, tipos = {}; let nInst = 0;
    const host = document.createElement('div'); document.body.appendChild(host); host.style.display = 'none';
    for (const t of T) {
      const firmas = new Set(); let tmax = 0;
      for (let s = 1; s <= nSemillas; s++) {
        const seed = 1000 + s * 7919;
        let q;
        const t0 = performance.now();
        try { q = ET.Banco.instanciar(t.id, seed); } catch (e) { fallos.push({ id: t.id, seed, fase: 'instanciar', msg: String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e) }); continue; }
        tmax = Math.max(tmax, performance.now() - t0); nInst++;
        firmas.add(sig(q));
        const M = ET.Tipos[q.tipo];
        if (!M) { fallos.push({ id: t.id, seed, fase: 'tipo', msg: 'tipo desconocido ' + q.tipo }); continue; }
        try {
          if (!q.enunciado) throw new Error('sin enunciado');
          if (!q.pistas || q.pistas.length < 1) throw new Error('sin pistas');
          if (q.tipo === 'opcion' && !q.opciones.some(o => o.ok)) throw new Error('ninguna opción correcta');
          if (q.tipo === 'opcion' && new Set(q.opciones.map(o => o.t)).size !== q.opciones.length) throw new Error('opciones repetidas');
          // solución de referencia => 100 %
          const sol = M.solve(q);
          const g = M.grade(q, sol, { modo: 'practica' });
          if (!(g.score > 0.999 && g.ok)) throw new Error('la solución de referencia NO puntúa 100 %: score=' + g.score + ' ' + JSON.stringify((g.items || []).map(i => i.html).slice(0, 4)));
          // respuesta en blanco => no 100 %
          const gb = M.grade(q, respuestaEnBlanco(q), { modo: 'practica' });
          if (gb.ok || gb.score > 0.999) throw new Error('la respuesta en blanco / código inicial puntúa 100 %');
          // vistas de solución y respuesta
          if (typeof M.solucionHtml(q) !== 'string') throw new Error('solucionHtml');
          if (typeof M.respuestaHtml(q, sol) !== 'string') throw new Error('respuestaHtml');
          // render + ciclo de respuesta
          host.innerHTML = '';
          const ctl = M.render(host, q, { modo: 'practica' });
          ctl.setAnswer(sol);
          const a2 = ctl.getAnswer();
          const g2 = M.grade(q, a2, { modo: 'practica' });
          if (!(g2.score > 0.999)) throw new Error('ciclo render→respuesta→corrección falla: score=' + g2.score + ' ' + JSON.stringify(a2).slice(0, 200));
          if (ctl.isEmpty()) throw new Error('isEmpty() true tras setAnswer');
          ctl.lock(true); ctl.lock(false);
          // media nota: la solución correcta pero lenta (q.lento) debe puntuar ≈ 50 % (criterio del parcial)
          const lentas = []; (function rec(qq) { if (qq.tipo === 'codigo' && qq.lento) lentas.push(qq); if (qq.tipo === 'mixta') qq.partes.forEach(p => rec(p.q)); })(q);
          lentas.forEach(qq => { const gl = ET.Tipos.codigo.grade(qq, { codigo: qq.lento }, { modo: 'practica' }); if (!(gl.score > 0.45 && gl.score < 0.55)) throw new Error('la solución lenta debería valer ≈ 50 %, vale ' + gl.score + ' ' + JSON.stringify((gl.items || []).map(i => i.html).slice(0, 3))); });
          cats[ET.Tipos.categoria(q)] = (cats[ET.Tipos.categoria(q)] || 0) + 1;
          fmts[ET.Tipos.formato(q)] = (fmts[ET.Tipos.formato(q)] || 0) + 1;
          tipos[q.tipo] = (tipos[q.tipo] || 0) + 1;
          // exportación para CPython
          if (s <= 4) {
            const collect = qq => {
              if (qq.tipo === 'codigo') {
                exportar.push({ id: t.id, seed, tipo: 'codigo', prelude: qq.prelude || '', solucion: qq.solucion, modo: qq.modoEj || 'codigo', starter: qq.starter || null, tests: qq.tests });
                if (qq.lento) exportar.push({ id: t.id + '·lento', seed, tipo: 'codigo', prelude: qq.prelude || '', solucion: qq.lento, modo: 'codigo', starter: null, tests: qq.tests.filter(x => !x.ef) });
              }
              else if (qq.tipo === 'salida' && qq.stdout) exportar.push({ id: t.id, seed, tipo: 'salida', codigo: qq.codigoVista, esperado: qq.esperado });
              else if (qq.tipo === 'mixta') qq.partes.forEach(p => collect(p.q));
            };
            collect(q);
          }
        } catch (e) { fallos.push({ id: t.id, seed, fase: 'validar', msg: String(e && e.message || e) }); }
      }
      variedad[t.id] = firmas.size; tiempos[t.id] = Math.round(tmax);
      await new Promise(r => setTimeout(r, 0));
    }
    host.remove();
    const res = { plantillas: T.length, instancias: nInst, fallos, variedad, tiempos, cats, fmts, tipos };
    await post('banco_exportar', exportar);
    await post('banco_resultado', res);
    return res;
  }
  window.pruebaBanco = pruebaBanco;

  /* Complejidades medidas: para cada pregunta «cplx» con `medir`, la razón de pasos entre dos tamaños debe corresponder a la clase declarada */
  const CRECE = { '1': () => 1, 'logn': x => Math.log2(x), 'n': x => x, 'nlogn': x => x * Math.log2(x), 'n2': x => x * x, 'n3': x => x * x * x, '2n': x => Math.pow(2, x) };
  async function pruebaMedir(nSem) {
    nSem = nSem || 12; const fallos = []; let n = 0; const vistos = {};
    for (const t of ET.Banco.plantillas.filter(t => t.slot === 'cplx')) {
      for (let s = 1; s <= nSem; s++) {
        let q; try { q = ET.Banco.instanciar(t.id, 77 + s * 6271); } catch (e) { fallos.push({ id: t.id, msg: String(e) }); continue; }
        q.partes.forEach(p => {
          const m = p.q.medir; if (!m) return;
          const clave = p.q.codigoVista + '|' + m.exprs.join(); if (vistos[clave]) return; vistos[clave] = 1; n++;
          const f = CRECE[p.q.esperado.clase]; if (!f) { fallos.push({ id: t.id, msg: 'clase sin modelo de crecimiento: ' + p.q.esperado.clase }); return; }
          const s1 = ET.Py.sesion((m.pre || '') + '\n' + p.q.codigoVista, { maxSteps: 3e7, maxMs: 30000 });
          if (!s1.ok) { fallos.push({ id: t.id, msg: 'no carga: ' + ET.Py.textoError(s1.error) }); return; }
          const r1 = s1.evaluar(m.exprs[0], { maxSteps: 3e7, cargaOculta: true }), r2 = s1.evaluar(m.exprs[1], { maxSteps: 3e7, cargaOculta: true });
          if (!r1.ok || !r2.ok) { fallos.push({ id: t.id, msg: 'falla al evaluar ' + m.exprs.join(' / ') + ': ' + ET.Py.textoError((r1.ok ? r2 : r1).error) }); return; }
          const razon = r2.pasos / r1.pasos, esp = f(m.ns[1]) / f(m.ns[0]);
          const tol = m.tol || [0.65, 1.45];
          if (razon < esp * tol[0] || razon > esp * tol[1]) fallos.push({ id: t.id, msg: 'razón de pasos ' + razon.toFixed(2) + ' vs esperada ' + esp.toFixed(2) + ' (' + p.q.esperado.clase + ') en ' + m.exprs.join(' / ') });
        });
      }
    }
    return { medidas: n, fallos };
  }
  window.pruebaMedir = pruebaMedir;
  const bm = document.getElementById('btn-medir');
  if (bm) bm.onclick = async () => { out.textContent = 'Midiendo…\n'; const r = await pruebaMedir(12); log('Complejidades verificadas: ' + r.medidas + ' | fallos: ' + r.fallos.length); r.fallos.slice(0, 20).forEach(f => log(' ✗ ' + f.id + ': ' + f.msg)); };
  document.getElementById('btn-todo').onclick = async () => {
    out.textContent = 'Ejecutando…\n';
    const r = await pruebaBanco(12);
    log('Plantillas: ' + r.plantillas + ' | instancias: ' + r.instancias + ' | fallos: ' + r.fallos.length);
    r.fallos.slice(0, 30).forEach(f => log(' ✗ ' + f.id + ' (semilla ' + f.seed + ', ' + f.fase + '): ' + f.msg));
    log('Categorías: ' + JSON.stringify(r.cats));
    log('Tipos: ' + JSON.stringify(r.tipos));
  };
})();
