/* biblioteca_test.js — pruebas de la Biblioteca de estudio (estructura, enlaces, código ejecutable, búsqueda, práctica/examen por tema) */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { out.textContent += s + '\n'; };
  const post = (name, data) => fetch('/' + name, { method: 'POST', body: JSON.stringify(data) }).then(r => r.text()).catch(e => 'sin servidor: ' + e);

  async function pruebaBiblioteca() {
    out.textContent = 'Probando la Biblioteca de estudio…\n';
    const ET = window.ET, B = ET.Biblioteca, Tm = ET.Temario, Py = ET.Py, Banco = ET.Banco, M = ET.Motor, U = ET.U;
    let ok = 0, fallos = 0; const t0 = performance.now();
    const check = (c, msg) => { if (c) ok++; else { fallos++; log('  ✘ ' + msg); } };

    /* ---- 1. estructura ---- */
    check(B.problemas.length === 0, 'problemas de registro: ' + B.problemas.join(' | '));
    check(B.areas.length === 15, 'debe haber 15 áreas (hay ' + B.areas.length + ')');
    B.areas.forEach(a => check(B.temasDeArea(a.id).length > 0, 'área sin temas: ' + a.id));
    const ids = new Set();
    B.temas.forEach(t => {
      check(!ids.has(t.id), 'id duplicado ' + t.id); ids.add(t.id);
      B.PARTES.forEach(([k]) => {
        const v = t[k]; const txt = B.plano(v);
        check(txt.length > 20, t.id + ': parte «' + k + '» vacía o demasiado corta');
      });
      check(B.plano(t.definicion).length >= 120, t.id + ': definición muy corta');
      check(B.plano(t.formal).length >= 200, t.id + ': teoría formal muy corta');
      check(Array.isArray(t.preguntas) && t.preguntas.length >= 3, t.id + ': necesita ≥ 3 preguntas de examen');
      check(!!t.fuente, t.id + ': sin fuente');
      t.conceptos.forEach(c => check(!!Tm.conceptos[c], t.id + ': concepto inexistente ' + c));
      t.interactivo.forEach(e => check(!!ET.Ejemplos.porId[e], t.id + ': ejemplo interactivo inexistente ' + e));
      // el texto se renderiza sin marcas sobrantes y con etiquetas equilibradas
      B.PARTES.forEach(([k]) => {
        const src = [].concat(t[k]).map(x => typeof x === 'string' ? x : JSON.stringify(x)).join('\n');
        const abre = (src.match(/\[comp\]/g) || []).length, cierra = (src.match(/\[\/comp\]/g) || []).length, a2 = (src.match(/\[ojo\]/g) || []).length, c2 = (src.match(/\[\/ojo\]/g) || []).length;
        check(abre === cierra && a2 === c2, t.id + '/' + k + ': etiquetas [comp]/[ojo] desbalanceadas');
        let dentro = false;   // cada línea (fuera de bloques ~~~) debe tener un número par de § (código en línea bien cerrado)
        src.split('\n').forEach(l => { if (/^\s*~~~/.test(l)) { dentro = !dentro; return; } if (!dentro && ((l.match(/§/g) || []).length % 2)) check(false, t.id + '/' + k + ': § sin cerrar en «' + l.trim().slice(0, 70) + '»'); });
        check(!dentro, t.id + '/' + k + ': bloque ~~~ sin cerrar');
        const enl = src.match(/\[\[([a-z0-9-]+)(?:\|[^\]]+)?\]\]/g) || [];
        enl.forEach(m => { const id = /\[\[([a-z0-9-]+)/.exec(m)[1]; check(!!B.porId[id], t.id + '/' + k + ': enlace roto a ' + id); });
        if (k !== 'codigo' && k !== 'preguntas') { const html = B.html(t[k]); check(!/§|~~~|\[comp\]|\[ojo\]|\[\[[a-z0-9-]+(\|[^\]]*)?\]\]/.test(html), t.id + '/' + k + ': quedan marcas sin convertir'); }
      });
    });
    // un tema nunca queda fuera de su área ni del orden global
    check(B.ordenados().length === B.temas.length, 'orden global incompleto');

    /* ---- 2. código de referencia ejecutable (se compara con lo esperado y se exporta para CPython) ---- */
    const codigos = []; let nCod = 0;
    B.ordenados().forEach(t => [].concat(t.codigo).forEach((c, i) => {
      if (!c || typeof c !== 'object') { fallos++; log('  ✘ ' + t.id + ': código mal formado'); return; }
      nCod++;
      if (c.ejecutable === false) return;
      const r = Py.ejecutar(c.src, { maxSteps: 3000000 });
      check(r.ok, t.id + '#' + i + ': el código falla: ' + (r.ok ? '' : Py.textoError(r.error)));
      const so = r.ok ? r.stdout.replace(/\s+$/, '') : '';
      if (c.esperado !== undefined) check(so === c.esperado.replace(/\s+$/, ''), t.id + '#' + i + ': salida distinta. Obtenida «' + so.slice(0, 160) + '»');
      else check(false, t.id + '#' + i + ': el código ejecutable no declara «esperado»');
      codigos.push({ id: t.id, i, src: c.src, esperado: c.esperado, stdout: so });
    }));
    const w = await post('biblioteca_codigo', codigos);

    /* ---- 3. ejemplos interactivos (código ↔ árbol): todos corren sin error y construyen árboles ---- */
    ET.Ejemplos.lista.forEach(e => {
      const T = ET.Traza.ejecutar(e.codigo);
      check(!T.error, 'ejemplo ' + e.id + ': error de ejecución');
      check(T.pasos.length > 10, 'ejemplo ' + e.id + ': traza demasiado corta');
    });

    /* ---- 4. fórmulas y tablas ---- */
    const fid = new Set();
    B.formulas.forEach(f => {
      check(!fid.has(f.id), 'fórmula duplicada ' + f.id); fid.add(f.id);
      ['nombre', 'formula', 'variables', 'cuando', 'ejemplo', 'condiciones'].forEach(k => check(B.plano(f[k]).length > 3, 'fórmula ' + f.id + ': falta «' + k + '»'));
      check(!!B.areaPorId[f.area], 'fórmula ' + f.id + ': área inválida');
      if (f.tema) check(!!B.porId[f.tema], 'fórmula ' + f.id + ': tema inexistente ' + f.tema);
    });
    const tid = new Set();
    B.tablas.forEach(tb => {
      check(!tid.has(tb.id), 'tabla duplicada ' + tb.id); tid.add(tb.id);
      check(/\|.*\|/.test(tb.md) && tb.md.split('\n').length >= 3, 'tabla ' + tb.id + ': no parece una tabla markdown');
      const filas = tb.md.trim().split('\n').filter(l => /^\s*\|/.test(l) && !/^\s*\|[\s:|-]+\|\s*$/.test(l)); const nc = filas[0].split('|').length;
      check(filas.every(l => l.split('|').length === nc), 'tabla ' + tb.id + ': filas con distinto número de columnas');
      (tb.temas || []).forEach(i => check(!!B.porId[i], 'tabla ' + tb.id + ': tema inexistente ' + i));
    });
    B.repaso.forEach(s => check(B.plano(s.md).length > 100, 'repaso ' + s.id + ' vacío'));
    B.autoeval.forEach(q => check(!!B.areaPorId[q.area] && q.p.length > 8 && B.plano(q.r).length > 8, 'autoevaluación mal formada: ' + q.p.slice(0, 40)));

    /* ---- 5. búsqueda ---- */
    [['recursión', 'rec-definicion'], ['memoización', 'rec-memo'], ['razón de duplicación', 'cx-razon'], ['rotación', null], ['altura negra', 'rn-def'], ['doble negro', 'rn-eliminacion'], ['predecesor', 'bs-eliminar'], ['postorden', null], ['factor de balance', null], ['Timsort', null]].forEach(([q, id]) => {
      const r = B.buscar(q);
      if (!B.temas.some(t => t.id === (id || '#')) && id) return;   // el tema aún no existe (contenido en construcción)
      check(r.length > 0, 'la búsqueda «' + q + '» no devuelve nada');
      if (id) check(r.slice(0, 8).some(x => x.id === id), 'la búsqueda «' + q + '» no encuentra ' + id + ' entre los 8 primeros');
    });
    check(B.buscar('zzzqqq').length === 0, 'la búsqueda sin sentido debe dar 0 resultados');

    /* ---- 6. práctica y examen por tema/área ---- */
    let conEj = 0;
    B.ordenados().forEach(t => {
      if (!t.conceptos.length) return;
      const pl = Banco.filtrar({ conceptos: t.conceptos });
      check(pl.length >= 1, t.id + ': ningún ejercicio del banco cubre sus conceptos');
      const p = B.preset('tema-' + t.id); check(!!p && p.conceptos.length === t.conceptos.length, t.id + ': preset de examen');
      try { const items = M.generarExamen({ niveles: p.niveles, conceptos: p.conceptos, n: 6, dificultad: 'mixta', dist: { teoria: 30, analisis: 40, implementacion: 30 }, incluirVF: true, incluirBigO: true, incluirArboles: true, incluirIntegradoras: true }, []); check(items.length === 6, t.id + ': el examen por tema no genera 6 preguntas'); conEj++; } catch (e) { check(false, t.id + ': examen por tema lanza ' + e.message); }
    });
    B.areas.forEach(a => { const p = B.preset('area-' + a.id); if (B.temasDeArea(a.id).some(t => t.conceptos.length)) check(!!p, 'preset de área ' + a.id); });

    /* ---- 7. render de todas las páginas (sin tocar el progreso guardado) ---- */
    const ultimo = M.bibUltimo; M.bibUltimo = () => { };
    const V = ET.Vistas; let paginas = 0;
    try {
      const rutas = [[], ['formulas'], ['tablas'], ['repaso'], ['favoritos']].concat(B.areas.map(a => ['area', a.id])).concat(B.temas.map(t => [t.id]));
      rutas.forEach(args => {
        const host = document.createElement('div');
        try { const lim = V.biblioteca(host, args, {}); paginas++; if (args.length === 1 && B.porId[args[0]]) check(host.querySelectorAll('.bib-parte').length === 10, args[0] + ': la página no tiene 10 partes'); if (typeof lim === 'function') lim(); }
        catch (e) { check(false, 'render ' + args.join('/') + ' lanza: ' + e.message); }
      });
    } finally { M.bibUltimo = ultimo; }

    /* ---- 8. cobertura frente a las diapositivas (lista de frases clave por diapositiva) ---- */
    const limpia = s => U.norm(String(s).replace(/[`*|]/g, ' '));
    const bolsa = limpia([B.ordenados().map(t => t.titulo + ' ' + B.PARTES.map(([k]) => B.plano(t[k])).join(' ')).join(' '), B.formulas.map(f => B.plano(f)).join(' '), B.tablas.map(tb => B.plano(tb)).join(' '), B.repaso.map(r => B.plano(r.md)).join(' '), B.autoeval.map(q => B.plano(q)).join(' ')].join(' '));
    let nClaves = 0; const faltan = [];
    (window.COBERTURA_PDF || []).forEach(([pdf, d, ks]) => ks.forEach(k => { nClaves++; if (!bolsa.includes(limpia(k))) faltan.push(pdf + ' d.' + d + ' «' + k + '»'); }));
    check(nClaves > 150, 'la lista de cobertura debería tener > 150 frases (tiene ' + nClaves + ')');
    check(faltan.length === 0, 'faltan ' + faltan.length + ' frases de las diapositivas: ' + faltan.join(' · '));

    /* ---- 9. concepto ↔ tema, y ejemplos interactivos con más de 12 nodos en BST/AVL/rojo-negro ---- */
    Object.keys(Tm.conceptos).forEach(c => check(B.temasDeConcepto(c).length > 0, 'concepto del temario sin tema en la Biblioteca: ' + c));
    ['bs', 'av', 'rn'].forEach(a => B.temasDeArea(a).forEach(t => check(t.interactivo.length > 0, t.id + ': los temas de BST, AVL y rojo-negro deben abrir un ejemplo interactivo')));
    ET.Ejemplos.lista.filter(e => ['BST', 'AVL', 'Rojo-negro'].includes(e.grupo) && e.id !== 'avl-cuatro-casos').forEach(e => {
      const T = ET.Traza.ejecutar(e.codigo); const m = new ET.Traza.Modelo(T); let max = 0;
      for (let k = 0; k < T.pasos.length; k += Math.max(1, Math.floor(T.pasos.length / 120))) { m.irA(k); max = Math.max(max, ET.Traza.bosque(T, m, k).nNodos); }
      check(max > 12, 'ejemplo ' + e.id + ': debería llegar a más de 12 nodos (llega a ' + max + ')');
      check(!!B.temasDeEjemplo(e.id).length, 'ejemplo ' + e.id + ' no está enlazado desde ningún tema de la Biblioteca');
    });

    /* ---- 10. quiz a la medida: reparto por modalidades, preguntas válidas y pantalla de configuración ---- */
    let quizzes = 0;
    const mezclas = [{ teoria: 35, practica: 40, interaccion: 25 }, { teoria: 100, practica: 0, interaccion: 0 }, { teoria: 0, practica: 100, interaccion: 0 }, { teoria: 0, practica: 0, interaccion: 100 }];
    B.areas.forEach(a => {
      const cs = B.conceptosDeArea(a.id); if (!cs.length) return;
      mezclas.forEach(mz => {
        try {
          const items = M.generarQuiz({ conceptos: cs, n: 9, dificultad: 'mixta', mezcla: mz }, []);
          check(items.length === 9, 'quiz ' + a.id + ': no genera 9 preguntas (' + items.length + ')');
          const cl = { teoria: 0, practica: 0, interaccion: 0 };
          items.forEach(it => { const tp = Banco.porId[it.tplId]; check(!!tp && !tp.soloPractica, 'quiz: plantilla inválida ' + it.tplId); const q = Banco.instanciar(it.tplId, it.seed, it.opts); check(!!q.enunciado || q.tipo === 'mixta', 'quiz: pregunta sin enunciado ' + it.tplId); cl[M.claseQuiz(tp)]++; });
          const k = Object.keys(mz).find(x => mz[x] === 100);   // si el área tiene plantillas de esa modalidad, todas las preguntas deben ser de ella
          if (k && Banco.filtrar({ conceptos: cs }).some(t => !t.soloPractica && M.claseQuiz(t) === k)) check(cl[k] === 9, 'quiz ' + a.id + ' (' + k + ' 100 %): salió ' + JSON.stringify(cl));
          quizzes++;
        } catch (e) { check(false, 'quiz ' + a.id + ' lanza: ' + e.message); }
      });
    });
    try {
      const host = document.createElement('div'); ET.Vistas.examenConfig(host, ['quiz'], { areas: 'hp,pc' });
      check(host.querySelectorAll('.quiz-tema').length >= 60, 'la pantalla del quiz debería listar los temas de la Biblioteca (' + host.querySelectorAll('.quiz-tema').length + ')');
      check(host.querySelectorAll('.quiz-tema input:checked').length >= B.temasDeArea('hp').length + B.temasDeArea('pc').length, 'el quiz no preselecciona los temas pedidos en la URL');
    } catch (e) { check(false, 'la pantalla del quiz lanza: ' + e.message); }

    /* ---- 11. el simulador rojo-negro (animaciones y preguntas) produce el mismo árbol que la clase ArbolRN de la Biblioteca ---- */
    const preRN = p => !p ? [] : [p.v + (p.c === 'n' ? 'N' : 'R')].concat(preRN(p.l), preRN(p.r));
    const rr = new U.RNG(2468); let casosRN = 0;
    for (let t = 0; t < 40; t++) {
      const n = rr.int(3, 14), vals = rr.distinct(n, 1, 90), dels = rr.sample(vals, rr.int(0, Math.min(5, n - 1)));
      let m = ET.Sim.rn.desde(vals); dels.forEach(v => { m = ET.Sim.rn.eliminar(m, v).modelo; });
      const code = B.codigo.RN + '\narbol = ArbolRN()\nfor v in ' + JSON.stringify(vals) + ':\n    arbol.insertar(v)\nfor v in ' + JSON.stringify(dels) + ':\n    arbol.eliminar(v)\nres = []\ndef pre(x):\n    if x is arbol.nil:\n        return\n    res.append(str(x.v) + ("N" if x.color == NEGRO else "R"))\n    pre(x.izq)\n    pre(x.der)\npre(arbol.raiz)\nprint(" ".join(res))\n';
      const s = Py.salida(code).trim(); casosRN++;
      check(s === preRN(m.raiz).join(' '), 'rojo-negro: el simulador difiere de ArbolRN con insertar ' + JSON.stringify(vals) + ' y eliminar ' + JSON.stringify(dels));
    }
    log('Simulador rojo-negro frente a ArbolRN: ' + casosRN + ' secuencias');
    log('Quizzes generados: ' + quizzes);
    log('Cobertura de diapositivas: ' + nClaves + ' frases verificadas en ' + (window.COBERTURA_PDF || []).length + ' bloques.');
    log('Temas: ' + B.temas.length + ' | fórmulas: ' + B.formulas.length + ' | tablas: ' + B.tablas.length + ' | bloques de código: ' + nCod + ' (ejecutados ' + codigos.length + ') | páginas renderizadas: ' + paginas + ' | exámenes por tema: ' + conEj + ' | servidor: ' + w);
    log('Comprobaciones: ' + (ok + fallos) + ' | fallos: ' + fallos + ' | ' + Math.round(performance.now() - t0) + ' ms');
    return { ok, fallos };
  }
  window.pruebaBiblioteca = pruebaBiblioteca;
  const b = document.getElementById('btn-bib'); if (b) b.onclick = pruebaBiblioteca;
})();
