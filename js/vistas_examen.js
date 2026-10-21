/* vistas_examen.js — modo examen: hub, configuración de simulacros, ejecución y resultados */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, Tipos = ET.Tipos, Banco = ET.Banco, md = U.md;
  const V = ET.Vistas = ET.Vistas || {};
  const fmtNota = x => x.toFixed(1);
  const CAT_N = { teoria: 'Teoría', analisis: 'Análisis y problemas', implementacion: 'Implementación' };

  /* ===================== hub ===================== */
  V.examenHub = function (host) {
    host.appendChild(h('h1', { text: 'Modo examen' }));
    host.appendChild(h('p', { class: 'suave', text: 'Simula una evaluación real: durante el examen no hay pistas, teoría ni explicaciones, y las respuestas correctas solo se muestran al entregar. Al terminar recibes nota, informe por tema y retroalimentación completa.' }));
    const act = M.examenActivo();
    if (act) {
      host.appendChild(h('div', { class: 'rec aviso', style: { marginBottom: '16px' } }, h('div', { class: 'ic', text: '⏳' }), h('div', null, h('strong', { text: 'Tienes un examen en curso' }), h('div', { class: 'peq suave', text: act.items.length + ' preguntas · iniciado ' + U.fmtFecha(act.inicio) + (act.fin ? ' · termina ' + U.fmtFecha(act.fin) : ' · sin límite de tiempo') })),
        h('a', { class: 'btn peq', href: '#/examen/curso' }, 'Continuar'), h('button', { class: 'btn sec peq', onclick: () => Vc.confirmar('Descartar examen', 'Se perderá el examen en curso y sus respuestas.', 'Descartar', () => { M.limpiarExamenActivo(); location.reload(); }) }, 'Descartar')));
    }
    const des = M.nivelesDesbloqueados();
    host.appendChild(h('div', { class: 'grid g3' },
      h('a', { class: 'modo', href: '#/examen/config/rapido' }, h('h3', null, h('span', { class: 'ic', text: '⚡' }), 'Examen rápido'), h('p', { text: '10 preguntas variadas de los niveles desbloqueados, sin tiempo. Ideal para medirte hoy.' })),
      h('a', { class: 'modo', href: '#/examen/config/simulacro' }, h('h3', null, h('span', { class: 'ic', text: '🎛' }), 'Simulacro configurable'), h('p', { text: 'Elige temas, cantidad, dificultad, duración y la proporción entre teoría, análisis e implementación.' })),
      h('a', { class: 'modo', href: '#/examen/config/acumulativo' }, h('h3', null, h('span', { class: 'ic', text: '🎓' }), 'Examen acumulativo'), h('p', { text: 'Mezcla todos los niveles desbloqueados (' + des.length + ' de 8): una evaluación final de la asignatura.' }))));
    const ex = M.examenes();
    host.appendChild(h('h2', { class: 'espacio', text: 'Historial de exámenes' }));
    if (!ex.length) host.appendChild(h('div', { class: 'card' }, Vc.vacio('🗒', 'Aún no has presentado exámenes', 'Tu historial y el informe por tema aparecerán aquí.')));
    else {
      const c = h('div', { class: 'card' });
      ex.slice(0, 12).forEach(x => c.appendChild(h('a', { class: 'fila sep', style: { padding: '10px 0', borderBottom: '1px dashed var(--borde)', textDecoration: 'none', color: 'inherit' }, href: '#/examen/resultado/' + x.id },
        h('div', null, h('strong', { text: U.fmtFecha(x.t) }), h('div', { class: 'peq tenue', text: x.n + ' preguntas · ' + (x.cfg && x.cfg.acumulativo ? 'acumulativo' : 'niveles ' + (x.cfg ? x.cfg.niveles.join(', ') : '')) + (x.cfg && x.cfg.tiempo ? ' · con tiempo' : ''), })),
        h('div', { class: 'fila' }, h('span', { class: 'chip', text: x.aciertos + '/' + x.n + ' correctas' }), h('strong', { text: fmtNota(x.nota5) + ' / 5.0' })))));
      host.appendChild(c);
    }
  };

  /* ===================== configuración ===================== */
  V.examenConfig = function (host, args) {
    const preset = args[0] || 'simulacro'; const cfg = M.cfgExamenDefault(); let minManual = false;
    const des = M.nivelesDesbloqueados();
    let titulo = 'Simulacro configurable';
    if (preset === 'rapido') { titulo = 'Examen rápido'; cfg.n = 10; }
    else if (preset === 'acumulativo') { titulo = 'Examen acumulativo'; cfg.acumulativo = true; cfg.n = 20; cfg.tiempo = true; cfg.minutos = 50; cfg.niveles = des.slice(); cfg.dist = { teoria: 30, analisis: 40, implementacion: 30 }; minManual = true; }
    else if (/^nivel-\d$/.test(preset)) { const n = +preset.slice(6); titulo = 'Examen del nivel ' + n; cfg.niveles = [n]; cfg.n = 8; }
    if (!cfg.minutos || !minManual) cfg.minutos = Math.max(10, Math.round(cfg.n * 3));
    const sel = {};
    host.appendChild(h('div', { class: 'fila', style: { marginBottom: '10px' } }, h('a', { class: 'btn fantasma peq', href: '#/examen' }, '← Modo examen')));
    host.appendChild(h('h1', { text: titulo }));
    const card = h('div', { class: 'card' });

    const secNiv = h('div', { class: 'cfg-sec' }, h('h3', { text: '1. Temas (niveles) que entran' }));
    const chk = h('div', { class: 'chk-niveles' });
    Tm.niveles.forEach(l => {
      const bloq = !M.nivelDesbloqueado(l.id);
      const inp = h('input', { type: 'checkbox', checked: cfg.niveles.includes(l.id) || null, disabled: bloq || cfg.acumulativo || null });
      inp.checked = cfg.niveles.includes(l.id) && !bloq; sel[l.id] = inp;
      inp.addEventListener('change', () => { cfg.niveles = Object.entries(sel).filter(([k, v]) => v.checked).map(([k]) => +k); });
      chk.appendChild(h('label', { class: 'chk-niv' + (bloq ? ' bloq' : '') }, inp, h('span', { text: l.icono + ' ' + l.id + '. ' + l.nombre + (bloq ? ' 🔒' : '') })));
    });
    secNiv.appendChild(chk);
    secNiv.appendChild(h('div', { class: 'peq tenue', text: cfg.acumulativo ? 'El examen acumulativo incluye automáticamente todos los niveles desbloqueados.' : 'Solo se pueden elegir niveles desbloqueados (o todos si activas el desbloqueo libre en Ajustes).' }));
    card.appendChild(secNiv);

    const secN = h('div', { class: 'cfg-sec' }, h('h3', { text: '2. Cantidad y dificultad' }));
    let nInRef = null;
    const nIn = h('input', { type: 'number', class: 'num', min: 3, max: 40, value: cfg.n, 'aria-label': 'Número de preguntas' });
    const dif = h('select', { 'aria-label': 'Dificultad' }, [['mixta', 'Mixta (de fácil a difícil)'], ['basica', 'Básica'], ['media', 'Media'], ['dificil', 'Difícil']].map(([v, t]) => h('option', { value: v, text: t })));
    dif.value = cfg.dificultad;
    nIn.addEventListener('input', () => { if (!minManual && document.getElementById('cfg-min')) document.getElementById('cfg-min').value = Math.max(10, Math.round((parseInt(nIn.value) || 10) * 3)); });
    secN.appendChild(h('div', { class: 'fila' }, h('label', { class: 'fila' }, 'Preguntas:', nIn), h('label', { class: 'fila' }, 'Dificultad:', dif)));
    card.appendChild(secN);

    const secT = h('div', { class: 'cfg-sec' }, h('h3', { text: '3. Tiempo' }));
    const cTiempo = h('input', { type: 'checkbox' }); cTiempo.checked = cfg.tiempo;
    const min = h('input', { type: 'number', class: 'num', id: 'cfg-min', min: 5, max: 240, value: cfg.minutos, 'aria-label': 'Minutos' });
    min.addEventListener('input', () => { minManual = true; });
    const cRev = h('input', { type: 'checkbox' }); cRev.checked = cfg.revisar;
    const cCons = h('input', { type: 'checkbox' }); cCons.checked = cfg.consola;
    secT.appendChild(h('label', { class: 'check' }, cTiempo, h('span', null, h('strong', { text: 'Examen con tiempo' }), h('div', { class: 'peq suave', text: 'Cuenta regresiva; al llegar a 0 se entrega automáticamente.' }))));
    secT.appendChild(h('div', { class: 'fila', style: { marginLeft: '28px' } }, h('label', { class: 'fila' }, 'Duración (minutos):', min), h('span', { class: 'peq tenue', text: 'Sugerido: ≈ 3 min por pregunta' })));
    secT.appendChild(h('label', { class: 'check' }, cRev, h('span', null, h('strong', { text: 'Permitir avanzar, retroceder y revisar antes de entregar' }), h('div', { class: 'peq suave', text: 'Si lo desactivas, solo podrás avanzar y no volver a una pregunta anterior.' }))));
    secT.appendChild(h('label', { class: 'check' }, cCons, h('span', null, h('strong', { text: 'Consola de Python en las preguntas de código' }), h('div', { class: 'peq suave', text: 'Permite ejecutar tu código (solo muestra salida y errores; no dice si pasa las pruebas). Desactivado = como en papel.' }))));
    card.appendChild(secT);

    const secD = h('div', { class: 'cfg-sec' }, h('h3', { text: '4. Distribución de tipos de pregunta' }));
    const sliders = {};
    ['teoria', 'analisis', 'implementacion'].forEach(k => {
      const lab = h('span', { class: 'peq', text: cfg.dist[k] + ' %' });
      const r = h('input', { type: 'range', class: 'rango', min: 0, max: 100, step: 5, value: cfg.dist[k], 'aria-label': CAT_N[k] });
      r.addEventListener('input', () => { cfg.dist[k] = +r.value; lab.textContent = r.value + ' %'; });
      sliders[k] = r;
      secD.appendChild(h('div', { class: 'fila-tema', style: { gridTemplateColumns: '210px 1fr 60px' } }, h('strong', { text: CAT_N[k] }), r, lab));
    });
    secD.appendChild(h('div', { class: 'peq tenue', text: 'Se normaliza automáticamente. Teoría: selección, V/F, abiertas, comparaciones. Análisis: salida de código, trazado, Big O, árboles y AVL. Implementación: escribir, completar y depurar código.' }));
    card.appendChild(secD);

    const secI = h('div', { class: 'cfg-sec' }, h('h3', { text: '5. Qué incluir' }));
    const incl = [['incluirVF', 'Preguntas de verdadero/falso'], ['incluirBigO', 'Ejercicios de Big O (complejidad)'], ['incluirArboles', 'Árboles BST y AVL (niveles 6 y 7)'], ['incluirIntegradoras', 'Preguntas integradoras (nivel 8 y preguntas mixtas)']];
    const ch = {};
    incl.forEach(([k, t]) => { const c = h('input', { type: 'checkbox' }); c.checked = cfg[k]; ch[k] = c; secI.appendChild(h('label', { class: 'check' }, c, h('span', { text: t }))); });
    card.appendChild(secI);

    const msg = h('div', { class: 'peq', style: { color: 'var(--mal)', minHeight: '1.3em' } });
    const iniciar = h('button', { class: 'btn grande', onclick: () => {
      cfg.n = U.clamp(parseInt(nIn.value) || 10, 3, 40); cfg.dificultad = dif.value; cfg.tiempo = cTiempo.checked; cfg.minutos = U.clamp(parseInt(min.value) || 30, 5, 240); cfg.revisar = cRev.checked; cfg.consola = cCons.checked;
      incl.forEach(([k]) => cfg[k] = ch[k].checked);
      if (!cfg.acumulativo) { cfg.niveles = Object.entries(sel).filter(([k, v]) => v.checked).map(([k]) => +k); if (!cfg.niveles.length) { msg.textContent = 'Elige al menos un nivel.'; return; } }
      if (U.sum(Object.values(cfg.dist)) === 0) { msg.textContent = 'La distribución no puede ser 0 en todos los tipos.'; return; }
      const items = M.generarExamen(cfg, []);
      const ex = { id: U.uid(), cfg, items, resp: items.map(() => null), marcas: items.map(() => false), resp_ok: items.map(() => false), idx: 0, maxIdx: 0, inicio: Date.now(), fin: cfg.tiempo ? Date.now() + cfg.minutos * 60000 : null };
      M.setExamenActivo(ex); location.hash = '#/examen/curso';
    } }, 'Comenzar examen ▶');
    card.appendChild(msg); card.appendChild(h('div', { class: 'acciones' }, iniciar, h('a', { class: 'btn fantasma', href: '#/examen' }, 'Cancelar')));
    host.appendChild(card);
  };

  /* ===================== ejecución ===================== */
  V.examenCurso = function (host) {
    const ex = M.examenActivo();
    if (!ex) { location.hash = '#/examen'; return; }
    const cfg = ex.cfg; const qs = ex.items.map(it => Banco.instanciar(it.tplId, it.seed, it.opts));
    const N = qs.length; let ctl = null, timer = null, guardando = null, terminado = false;
    const ctxEx = { modo: 'examen', permitirEjecutar: !!cfg.consola };
    const barra = h('div', { class: 'ex-barra' }), zona = h('div'), pie = h('div', { class: 'acciones' });
    host.appendChild(barra); host.appendChild(zona);

    const timerEl = h('span', { class: 'timer', 'aria-live': 'off' });
    const nav = h('div', { class: 'nav-q', role: 'navigation', 'aria-label': 'Preguntas' });
    const btnEntregar = h('button', { class: 'btn ok', onclick: pedirEntrega }, 'Entregar examen');
    barra.appendChild(timerEl); barra.appendChild(nav); barra.appendChild(btnEntregar);

    function pintarNav() {
      U.vaciar(nav);
      for (let i = 0; i < N; i++) {
        const b = h('button', { class: 'dot' + (i === ex.idx ? ' act' : '') + (ex.resp_ok[i] ? ' resp' : '') + (ex.marcas[i] ? ' marca' : ''), type: 'button', 'aria-label': 'Pregunta ' + (i + 1) + (ex.resp_ok[i] ? ' respondida' : '') + (ex.marcas[i] ? ' marcada' : ''), disabled: (!cfg.revisar && i < ex.maxIdx) || (!cfg.revisar && i > ex.idx) || null, onclick: () => ir(i) }, String(i + 1));
        nav.appendChild(b);
      }
    }
    function guardarActual() {
      if (!ctl) return;
      ex.resp[ex.idx] = ctl.getAnswer(); ex.resp_ok[ex.idx] = !ctl.isEmpty();
      M.setExamenActivo(ex);
    }
    function ir(i) {
      if (terminado) return; guardarActual();
      if (!cfg.revisar && i < ex.idx) return;
      ex.idx = i; ex.maxIdx = Math.max(ex.maxIdx || 0, i); M.setExamenActivo(ex);
      pintar();
    }
    function pintar() {
      U.vaciar(zona); const q = qs[ex.idx];
      const card = h('section', { class: 'card' });
      card.appendChild(h('div', { class: 'fila sep', style: { marginBottom: '8px' } }, h('strong', { text: 'Pregunta ' + (ex.idx + 1) + ' de ' + N }), h('span', { class: 'chip', text: 'Valor: ' + M.pesoPregunta(q).toFixed(1) + ' pts' })));
      ctl = Vc.montarPregunta(card, q, ctxEx);
      if (ex.resp[ex.idx] != null) ctl.setAnswer(ex.resp[ex.idx]);
      ctl.onChange(() => { clearTimeout(guardando); guardando = setTimeout(() => { guardarActual(); pintarNav(); }, 400); });
      const flag = h('button', { class: 'btn sec', type: 'button', onclick: () => { ex.marcas[ex.idx] = !ex.marcas[ex.idx]; M.setExamenActivo(ex); flag.textContent = ex.marcas[ex.idx] ? '⚑ Marcada para revisar' : '⚐ Marcar para revisar'; pintarNav(); } }, ex.marcas[ex.idx] ? '⚑ Marcada para revisar' : '⚐ Marcar para revisar');
      const ultimo = ex.idx === N - 1;
      card.appendChild(h('div', { class: 'acciones' },
        cfg.revisar && ex.idx > 0 ? h('button', { class: 'btn sec', type: 'button', onclick: () => ir(ex.idx - 1) }, '← Anterior') : null,
        cfg.revisar ? flag : null, h('span', { class: 'esp' }),
        ultimo ? h('button', { class: 'btn ok', type: 'button', onclick: pedirEntrega }, 'Revisar y entregar') : h('button', { class: 'btn', type: 'button', onclick: () => ir(ex.idx + 1) }, 'Siguiente →')));
      if (!cfg.revisar && !ultimo) card.appendChild(h('div', { class: 'peq tenue', text: 'En este examen no se puede volver a una pregunta anterior.' }));
      zona.appendChild(card); pintarNav();
      window.scrollTo({ top: 0 });
    }
    function tick() {
      if (!ex.fin) { timerEl.textContent = 'Sin límite · ' + U.fmtTiempo(Date.now() - ex.inicio); return; }
      const rest = ex.fin - Date.now();
      timerEl.textContent = '⏱ ' + U.fmtTiempo(rest); timerEl.classList.toggle('alerta', rest < 60000);
      if (rest <= 0 && !terminado) { Vc.toast('⏰ Se acabó el tiempo: se entrega el examen.', 4000); entregar(true); }
    }
    timer = setInterval(tick, 500); tick();

    function pedirEntrega() {
      guardarActual();
      const sin = ex.resp_ok.map((v, i) => v ? null : i + 1).filter(Boolean); const marc = ex.marcas.map((v, i) => v ? i + 1 : null).filter(Boolean);
      const txt = '<p>Vas a entregar el examen. Después de entregar no podrás cambiar tus respuestas.</p>' + (sin.length ? '<p><strong>Sin responder:</strong> ' + sin.join(', ') + '.</p>' : '<p>Respondiste todas las preguntas.</p>') + (marc.length ? '<p><strong>Marcadas para revisar:</strong> ' + marc.join(', ') + '.</p>' : '');
      const nodo = h('div', null, h('div', { html: txt }), h('div', { class: 'acciones' }, h('button', { class: 'btn ok', onclick: () => { m.cerrar(); entregar(false); } }, 'Sí, entregar'), h('button', { class: 'btn sec', onclick: () => m.cerrar() }, 'Seguir revisando')));
      const m = Vc.modal('¿Entregar el examen?', nodo);
    }
    function entregar(auto) {
      if (terminado) return; terminado = true; clearInterval(timer); guardarActual();
      U.vaciar(zona); barra.classList.add('oculto');
      const prog = h('div', { class: 'card centro' }, h('h2', { text: 'Calificando tu examen…' }), h('p', { class: 'suave', id: 'cal-p', text: 'Pregunta 0 de ' + N }), Vc.barra(0));
      zona.appendChild(prog);
      const resultados = []; let i = 0;
      const paso = () => {
        if (i >= N) { terminar(); return; }
        const q = qs[i]; let r;
        try { r = Tipos.mod(q).grade(q, ex.resp[i], { modo: 'examen' }); } catch (e) { r = { score: 0, ok: false, items: [{ ok: false, html: 'Error al corregir: ' + e.message }] }; }
        resultados.push({ score: r.score, ok: r.ok, confusion: r.confusion || null }); i++;
        const p = document.getElementById('cal-p'); if (p) p.textContent = 'Pregunta ' + i + ' de ' + N;
        const b = prog.querySelector('.barra > i'); if (b) b.style.width = Math.round(i / N * 100) + '%';
        setTimeout(paso, 5);
      };
      const terminar = () => {
        const entry = construirEntrada(ex, qs, resultados);
        M.registrarExamen(entry, qs, resultados);
        location.hash = '#/examen/resultado/' + entry.id;
      };
      setTimeout(paso, 30);
    }
    pintar();
    return () => { clearInterval(timer); clearTimeout(guardando); if (!terminado) guardarActual(); };
  };

  function construirEntrada(ex, qs, resultados) {
    const pesos = qs.map(q => M.pesoPregunta(q)); const tot = U.sum(pesos);
    const puntaje = U.sum(resultados.map((r, i) => r.score * pesos[i])) / tot * 100;
    const porNivel = {}, porConcepto = {}, porCat = {};
    qs.forEach((q, i) => {
      const r = resultados[i]; const pn = porNivel[q.nivel] || (porNivel[q.nivel] = { w: 0, s: 0, n: 0, ok: 0 }); pn.w += pesos[i]; pn.s += pesos[i] * r.score; pn.n++; if (r.ok) pn.ok++;
      const cat = Tipos.categoria(q); const pc = porCat[cat] || (porCat[cat] = { w: 0, s: 0, n: 0 }); pc.w += pesos[i]; pc.s += pesos[i] * r.score; pc.n++;
      (q.conceptos || []).forEach(c => { const x = porConcepto[c] || (porConcepto[c] = { s: 0, n: 0 }); x.s += r.score; x.n++; });
    });
    const nivelPct = {}; Object.keys(porNivel).forEach(k => nivelPct[k] = { pct: porNivel[k].s / porNivel[k].w, n: porNivel[k].n, ok: porNivel[k].ok });
    const catPct = {}; Object.keys(porCat).forEach(k => catPct[k] = { pct: porCat[k].s / porCat[k].w, n: porCat[k].n });
    const concPct = {}; Object.keys(porConcepto).forEach(k => concPct[k] = { pct: porConcepto[k].s / porConcepto[k].n, n: porConcepto[k].n });
    return { id: ex.id, t: Date.now(), cfg: ex.cfg, items: ex.items, resp: ex.resp, marcas: ex.marcas, n: qs.length, puntaje, nota5: puntaje / 100 * 5, aciertos: resultados.filter(r => r.ok).length, scores: resultados.map(r => +r.score.toFixed(3)), oks: resultados.map(r => !!r.ok), tiempoMs: Date.now() - ex.inicio, nivelPct, catPct, concPct };
  }

  /* ===================== resultados ===================== */
  function enunciadoRevision(q) {
    const d = h('div'); Tipos.cabecera(d, q, {});
    if (q.tipo === 'mixta') d.appendChild(h('ol', { type: 'a' }, q.partes.map(p => h('li', { html: U.mdInline(p.titulo ? '**' + p.titulo + ':** ' : '') + U.mdInline(p.q.enunciado || '') }))));
    return d;
  }
  V.examenResultado = function (host, args) {
    const e = M.examenPorId(args[0]);
    if (!e) { host.appendChild(Vc.vacio('🤷', 'No encuentro ese examen', '', h('a', { class: 'btn', href: '#/examen' }, 'Modo examen'))); return; }
    const qs = e.items.map(it => Banco.instanciar(it.tplId, it.seed, it.opts));
    host.appendChild(h('div', { class: 'fila', style: { marginBottom: '10px' } }, h('a', { class: 'btn fantasma peq', href: '#/examen' }, '← Modo examen')));
    const nota = e.nota5; const msg = nota >= 4.5 ? '¡Excelente dominio!' : nota >= 3.5 ? 'Muy bien: afina los puntos débiles.' : nota >= 3 ? 'Aprobado justo: hay conceptos por reforzar.' : 'Hay que reforzar varios temas antes del examen real.';
    const tarj = h('div', { class: 'card res-grande' }, h('div', { class: 'tenue', text: 'Resultado · ' + U.fmtFecha(e.t) }), h('div', { class: 'nota', id: 'nota-g', text: fmtNota(nota) + ' / 5.0' }), h('div', { id: 'nota-p', class: 'suave', text: 'Puntaje ' + Math.round(e.puntaje) + ' % · ' + e.aciertos + ' de ' + e.n + ' preguntas totalmente correctas · tiempo ' + U.fmtTiempo(e.tiempoMs) }), h('p', { style: { marginTop: '8px' }, text: msg }));
    host.appendChild(tarj);

    // por nivel y tipo
    const g = h('div', { class: 'grid g2 espacio' });
    const cN = h('div', { class: 'card' }, h('h2', { text: 'Informe por tema (nivel)' }));
    Object.keys(e.nivelPct).sort((a, b) => a - b).forEach(k => { const x = e.nivelPct[k]; const l = Tm.niveles[k - 1]; cN.appendChild(h('div', { class: 'fila-tema', style: { gridTemplateColumns: '1fr 1.2fr 54px' } }, h('div', null, h('strong', { text: l.icono + ' ' + l.nombre }), h('div', { class: 'peq tenue', text: x.ok + ' de ' + x.n + ' correctas' })), Vc.barra(x.pct), h('b', { text: Math.round(x.pct * 100) + ' %' }))); });
    const cC = h('div', { class: 'card' }, h('h2', { text: 'Por tipo de pregunta' }));
    Object.keys(e.catPct).forEach(k => { const x = e.catPct[k]; cC.appendChild(h('div', { class: 'fila-tema', style: { gridTemplateColumns: '1fr 1.2fr 54px' } }, h('div', null, h('strong', { text: CAT_N[k] }), h('div', { class: 'peq tenue', text: x.n + ' pregunta(s)' })), Vc.barra(x.pct), h('b', { text: Math.round(x.pct * 100) + ' %' }))); });
    g.appendChild(cN); g.appendChild(cC); host.appendChild(g);

    // conceptos a estudiar
    const flojos = Object.entries(e.concPct).filter(([c, x]) => Tm.conceptos[c] && x.pct < 0.7).sort((a, b) => a[1].pct - b[1].pct);
    const cE = h('div', { class: 'card espacio' }, h('h2', { text: 'Conceptos para estudiar de nuevo' }));
    if (!flojos.length) cE.appendChild(h('p', { class: 'suave', text: '¡Ningún concepto quedó por debajo del 70 %!' }));
    else {
      flojos.slice(0, 10).forEach(([c, x]) => { const k = Tm.conceptos[c]; cE.appendChild(h('div', { class: 'fila-tema' }, h('div', null, h('strong', { text: k.nombre }), h('div', { class: 'peq tenue', text: 'Nivel ' + k.nivel + ' · ' + k.f })), Vc.barra(x.pct), h('button', { class: 'mini', onclick: () => Vc.teoriaModal([c]), title: 'Ver teoría', text: '📖' }))); });
      cE.appendChild(h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/repaso?foco=' + encodeURIComponent(flojos.slice(0, 5).map(f => f[0]).join(',')) }, '🎯 Practicar estos conceptos')));
    }
    host.appendChild(cE);

    // revisión
    host.appendChild(h('h2', { class: 'espacio', text: 'Revisión pregunta por pregunta' }));
    host.appendChild(h('p', { class: 'suave peq', text: 'Se muestran tu respuesta, la respuesta correcta y la explicación. En las preguntas abiertas puedes ajustar los criterios que sí cubriste (autoevaluación).' }));
    const lista = h('div');
    qs.forEach((q, i) => {
      const sc = e.scores[i]; const ok = e.oks[i];
      const pt = h('span', { class: 'pt ' + (ok ? 'ok' : sc > 0 ? 'med' : 'mal'), text: Math.round(sc * 100) + ' %' });
      const det = h('details', { class: 'rev' }, h('summary', null, h('span', { class: 'chip', text: String(i + 1) }), h('span', { text: q.tema || Tipos.formato(q) }), h('span', { class: 'chip', text: Tipos.formato(q) }), pt));
      let cargado = false;
      det.addEventListener('toggle', () => {
        if (!det.open || cargado) return; cargado = true;
        const c = h('div', { class: 'rev-c' }); det.appendChild(c);
        const ans = e.resp ? e.resp[i] : null; const mod = Tipos.mod(q);
        c.appendChild(h('h4', { text: 'Enunciado' })); c.appendChild(enunciadoRevision(q));
        c.appendChild(h('div', { class: 'panel' }, h('h4', { text: 'Tu respuesta' }), h('div', { html: e.resp ? mod.respuestaHtml(q, ans) : '<em>No disponible</em>' })));
        const fbHost = h('div'); c.appendChild(fbHost);
        const pintarFb = () => {
          U.vaciar(fbHost); let res;
          try { res = mod.grade(q, ans, { modo: 'revision' }); } catch (x) { res = { score: 0, ok: false, items: [{ ok: false, html: 'Error: ' + x.message }] }; }
          const fb = Vc.feedbackNodo(res, ans || {}, q.tipo === 'abierta' ? () => { const r2 = mod.grade(q, ans, { modo: 'revision' }); e.resp[i] = ans; actualizarPregunta(r2); pintarFb(); } : null);
          fbHost.appendChild(fb); Tipos.hidratar(fb);
          if (q.tipo === 'abierta' && res.extra) fbHost.appendChild(h('div', { class: 'panel' }, h('h4', { text: 'Respuesta modelo' }), h('div', { html: md(res.extra.modelo) })));
        };
        const actualizarPregunta = (r2) => {
          e.scores[i] = +r2.score.toFixed(3); e.oks[i] = !!r2.ok;
          pt.className = 'pt ' + (r2.ok ? 'ok' : r2.score > 0 ? 'med' : 'mal'); pt.textContent = Math.round(r2.score * 100) + ' %';
          const nuevo = construirEntrada({ id: e.id, cfg: e.cfg, items: e.items, resp: e.resp, marcas: e.marcas, inicio: Date.now() - e.tiempoMs }, qs, e.scores.map((s, k) => ({ score: s, ok: e.oks[k] })));
          M.actualizarExamen(e.id, { puntaje: nuevo.puntaje, nota5: nuevo.nota5, aciertos: nuevo.aciertos, scores: e.scores, oks: e.oks, resp: e.resp, nivelPct: nuevo.nivelPct, catPct: nuevo.catPct, concPct: nuevo.concPct });
          document.getElementById('nota-g').textContent = fmtNota(nuevo.nota5) + ' / 5.0'; document.getElementById('nota-p').textContent = 'Puntaje ' + Math.round(nuevo.puntaje) + ' % · ' + nuevo.aciertos + ' de ' + e.n + ' preguntas totalmente correctas (ajustado por autoevaluación) · tiempo ' + U.fmtTiempo(e.tiempoMs);
        };
        if (e.resp) pintarFb(); else fbHost.appendChild(h('p', { class: 'peq tenue', text: 'Las respuestas de exámenes antiguos no se conservan; solo se muestra la solución.' }));
        c.appendChild(h('div', { class: 'panel' }, h('h4', { text: 'Respuesta correcta' }), h('div', { html: mod.solucionHtml(q) })));
        if (q.explicacion) c.appendChild(h('div', { class: 'panel' }, h('h4', { text: 'Explicación' }), h('div', { html: md(q.explicacion) })));
        const an = Vc.animacionDe(q); if (an) c.appendChild(an);
        c.appendChild(h('div', { class: 'fila' }, h('button', { class: 'btn sec peq', onclick: () => Vc.teoriaModal(q.conceptos || []) }, '📖 Teoría relacionada')));
        Tipos.hidratar(c);
      });
      if (!ok) det.classList.add('mal');
      lista.appendChild(det);
    });
    host.appendChild(lista);
    host.appendChild(h('div', { class: 'acciones' },
      h('button', { class: 'btn', onclick: () => { const cfg = JSON.parse(JSON.stringify(e.cfg)); const items = M.generarExamen(cfg, e.items.map(x => x.tplId)); const ex = { id: U.uid(), cfg, items, resp: items.map(() => null), marcas: items.map(() => false), resp_ok: items.map(() => false), idx: 0, maxIdx: 0, inicio: Date.now(), fin: cfg.tiempo ? Date.now() + cfg.minutos * 60000 : null }; M.setExamenActivo(ex); location.hash = '#/examen/curso'; } }, '🔁 Repetir con preguntas nuevas'),
      h('a', { class: 'btn sec', href: '#/errores' }, '📝 Ver Mis errores'), h('a', { class: 'btn fantasma', href: '#/panel' }, 'Panel')));
  };
})(typeof window !== 'undefined' ? window : globalThis);
