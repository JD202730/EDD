/* vistas_panel.js — panel principal, página de nivel y teoría */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, md = U.md;
  const V = ET.Vistas = ET.Vistas || {};
  const pct = x => (x === null || x === undefined) ? '—' : Math.round(x * 100) + ' %';

  function tarjetaNivel(l) {
    const desb = M.nivelDesbloqueado(l.id); const prog = M.progresoNivel(l.id);
    const a = h('a', { class: 'nivel' + (desb ? '' : ' bloq'), href: '#/nivel/' + l.id, 'aria-label': 'Nivel ' + l.id + ': ' + l.nombre + (desb ? '' : ' (bloqueado)') });
    a.style.setProperty('--nc', l.color);
    a.appendChild(h('div', { class: 'fila sep' },
      h('div', { class: 'fila' }, h('div', { class: 'ic', text: l.icono }), h('div', null, h('div', { class: 'tenue peq', text: 'Nivel ' + l.id }), h('h3', { text: l.nombre }))),
      desb ? Vc.anillo(prog, l.color) : h('span', { class: 'chip', text: '🔒' })));
    a.appendChild(h('p', { text: l.resumen }));
    a.appendChild(h('div', { class: 'etapas' }, M.ETAPAS.map(e => {
      const ok = M.etapaCompleta(l.id, e), des = M.etapaDesbloqueada(l.id, e), d = M.dominio(l.id, e);
      return h('div', { class: 'etp ' + (ok ? 'ok' : (des ? (d.n ? 'curso' : '') : 'bloq')), title: Tm.etapas[e].nombre + (d.n ? ' — dominio ' + Math.round(d.dom * 100) + ' %' : '') }, (ok ? '✔ ' : (des ? '' : '🔒 ')) + e + (d.n && !ok ? ' ' + Math.round(d.dom * 100) + '%' : ''));
    })));
    return a;
  }

  V.panel = function (host) {
    const st = M.stats(); const nj = M.nivelJugador(); const prog = M.progresoGlobal();
    const rec = M.recomendaciones(); const primera = rec.find(r => r.boton === 'Continuar');
    const hero = h('section', { class: 'card hero' },
      h('div', { class: 'fila sep' },
        h('div', { style: { maxWidth: '620px' } }, h('h1', { text: 'Estructuras de Datos: entrena, mide y domina' }),
          h('p', { text: 'Recursión, Big O, paradigmas, árboles, BST y AVL con ejercicios que se corrigen de verdad: se ejecuta tu código y se verifican tus árboles.' })),
        h('div', { class: 'fila' }, Vc.anillo(prog, '#fff'))));
    const statsRow = h('div', { class: 'grid g4 espacio', style: { position: 'relative', zIndex: 1 } },
      [['Progreso global', Math.round(prog * 100) + ' %'], ['Respuestas correctas', pct(st.pctCorrectas)], ['Nivel ' + nj.nivel + ' · XP', st.xp], ['Racha (días)', st.racha]].map(([t, v]) => h('div', { class: 'stat' }, h('b', { text: String(v) }), h('span', { style: { color: 'rgba(255,255,255,.85)' }, text: t }))));
    hero.appendChild(statsRow);
    const xpBar = h('div', { style: { position: 'relative', zIndex: 1, marginTop: '10px' } }, Vc.barra(Math.min(1, (st.xp - nj.ant) / Math.max(1, nj.sig - nj.ant))), h('div', { class: 'peq', style: { marginTop: '4px', color: 'rgba(255,255,255,.85)' }, text: (nj.sig - st.xp) + ' XP para el nivel ' + (nj.nivel + 1) }));
    hero.appendChild(xpBar);
    host.appendChild(hero);

    // selector de modo
    const cont = primera ? primera.ruta : '#/practica/1/A';
    host.appendChild(h('h2', { class: 'espacio', text: 'Elige cómo entrenar' }));
    host.appendChild(h('div', { class: 'modos' },
      h('a', { class: 'modo', href: cont }, h('h3', null, h('span', { class: 'ic', text: '🧭' }), 'Práctica guiada'), h('p', { text: 'Una pregunta a la vez, pistas progresivas, explicación de errores y dificultad adaptativa.' }), h('span', { class: 'chip acento', text: primera ? primera.titulo : 'Empezar: Nivel 1 · Etapa A' })),
      h('a', { class: 'modo', href: '#/examen' }, h('h3', null, h('span', { class: 'ic', text: '⏱' }), 'Modo examen'), h('p', { text: 'Sin pistas ni teoría mientras resuelves. Nota, informe por tema y revisión al final. Con o sin tiempo.' }), h('span', { class: 'chip', text: st.examenes ? st.examenes + ' examen(es) realizados' : 'Examen rápido, simulacro o acumulativo' }))));

    // recomendaciones
    host.appendChild(h('div', { class: 'card espacio' }, h('h2', { text: 'Recomendado para ti' }), h('div', { class: 'lista-rec' }, rec.map(r => h('div', { class: 'rec ' + (r.tipo || '') }, h('div', { class: 'ic', text: r.icono }), h('div', null, h('strong', { text: r.titulo }), h('div', { class: 'peq suave', text: r.texto })), h('a', { class: 'btn sec peq', href: r.ruta }, r.boton))))));

    // niveles
    host.appendChild(h('h2', { class: 'espacio', text: 'Ruta de aprendizaje' }));
    host.appendChild(h('div', { class: 'niveles' }, Tm.niveles.map(tarjetaNivel)));
    host.appendChild(h('p', { class: 'peq tenue', text: 'Cada nivel tiene 3 etapas (A Fundamentos · B Aplicación · C Dominio). Se desbloquea la siguiente al alcanzar ' + M.config().umbral + ' % de dominio en las últimas 10 preguntas (mínimo 5). El umbral se cambia en Ajustes.' }));

    // reforzar + actividad
    const deb = M.debiles().slice(0, 6);
    const hist = M.estado().historial.slice(-8).reverse();
    const cols = h('div', { class: 'grid g2 espacio' });
    const cDeb = h('div', { class: 'card' }, h('h2', { text: 'Temas que necesitas reforzar' }));
    if (!deb.length) cDeb.appendChild(h('p', { class: 'suave', text: M.estado().historial.length ? 'Por ahora no hay conceptos débiles detectados. ¡Sigue así!' : 'Aún no hay datos: responde algunas preguntas para detectar tus puntos débiles.' }));
    else {
      deb.forEach(d => { const c = Tm.conceptos[d.id]; cDeb.appendChild(h('div', { class: 'fila-tema' }, h('div', null, h('strong', { text: c.nombre }), h('div', { class: 'peq tenue', text: 'Nivel ' + c.nivel + (d.errores ? ' · ' + d.errores + ' error(es) abiertos' : '') })), Vc.barra(d.mastery === null ? 0 : d.mastery), h('b', { text: pct(d.mastery) }))); });
      cDeb.appendChild(h('a', { class: 'btn peq espacio', href: '#/repaso' }, '🎯 Repaso inteligente'));
    }
    const cAct = h('div', { class: 'card' }, h('h2', { text: 'Actividad reciente' }));
    if (!hist.length) cAct.appendChild(h('p', { class: 'suave', text: 'Todavía no has respondido preguntas.' }));
    else {
      hist.forEach(x => { const t = ET.Banco.porId[x.tpl]; cAct.appendChild(h('div', { class: 'fila sep peq', style: { padding: '5px 0', borderBottom: '1px dashed var(--borde)' } }, h('span', null, (x.ok ? '✔ ' : '✘ ') + (t ? t.tema : x.tpl)), h('span', { class: 'tenue' }, (x.modo === 'examen' ? 'examen · ' : 'N' + x.n + x.e + ' · ') + U.fmtFecha(x.t)))); });
      const exs = M.examenes().slice(0, 5);
      if (exs.length) { cAct.appendChild(h('h3', { class: 'espacio', text: 'Últimos exámenes' })); exs.forEach(x => cAct.appendChild(h('a', { class: 'fila sep peq', style: { padding: '5px 0', textDecoration: 'none', color: 'inherit' }, href: '#/examen/resultado/' + x.id }, h('span', { text: U.fmtFecha(x.t) + ' · ' + x.n + ' preguntas' }), h('strong', { text: x.nota5.toFixed(1) + ' / 5.0' })))); }
    }
    cols.appendChild(cDeb); cols.appendChild(cAct); host.appendChild(cols);

    // historial de errores
    const errs = M.errores().slice(0, 5);
    const cErr = h('div', { class: 'card espacio' }, h('div', { class: 'fila sep' }, h('h2', { style: { margin: 0 }, text: 'Mi historial de errores' }), h('a', { class: 'btn sec peq', href: '#/errores' }, 'Ver todos')));
    if (!errs.length) cErr.appendChild(h('p', { class: 'suave espacio', text: 'Todavía no hay errores registrados. Cuando falles una pregunta (en práctica o examen) quedará aquí con tu respuesta, la esperada y su explicación.' }));
    else errs.forEach(e => cErr.appendChild(h('a', { class: 'fila sep', style: { padding: '8px 0', borderBottom: '1px dashed var(--borde)', textDecoration: 'none', color: 'inherit' }, href: '#/errores' }, h('div', null, h('strong', { text: e.tema || e.tplId }), h('div', { class: 'peq tenue', text: 'Nivel ' + e.nivel + ' · fallado ' + e.veces + ' vez/veces · ' + U.fmtFecha(e.ult) })), h('span', { class: 'chip ' + (e.resuelto ? 'ok' : 'mal'), text: e.resuelto ? '✔ resuelto' : 'pendiente' }))));
    host.appendChild(cErr);

    // estadísticas
    host.appendChild(h('div', { class: 'card espacio' }, h('h2', { text: 'Tus números' }), h('div', { class: 'grid g4' },
      [['Preguntas en práctica', st.respondidas], ['Correctas al primer intento', pct(st.pctCorrectas)], ['Correctas sin pistas', pct(st.pctSinPistas)], ['Pistas usadas', st.pistas], ['Aciertos en exámenes', pct(st.exPct)], ['Preguntas de examen', st.exRespondidas], ['Errores pendientes', st.erroresAbiertos], ['Exámenes', st.examenes]].map(([t, v]) => h('div', { class: 'stat' }, h('b', { text: String(v) }), h('span', { text: t }))))));
  };

  V.nivel = function (host, args) {
    const n = +args[0]; const l = Tm.niveles[n - 1]; if (!l) { location.hash = '#/panel'; return; }
    const desb = M.nivelDesbloqueado(n);
    const cab = h('section', { class: 'card', style: { borderTop: '6px solid ' + l.color } },
      h('div', { class: 'fila sep' }, h('div', { class: 'fila' }, h('div', { class: 'ic logo-ic', style: { background: l.color }, text: l.icono }), h('div', null, h('div', { class: 'tenue peq', text: 'Nivel ' + n + ' · Fuente: ' + l.fuente }), h('h1', { style: { margin: 0 }, text: l.nombre }))), desb ? Vc.anillo(M.progresoNivel(n), l.color) : h('span', { class: 'chip aviso', text: '🔒 Bloqueado' })),
      h('p', { class: 'suave espacio', text: l.resumen }));
    if (!desb) cab.appendChild(h('div', { class: 'rec aviso' }, h('div', { class: 'ic', text: '🔒' }), h('div', null, 'Para desbloquear este nivel completa la **Etapa C** del nivel anterior'.replace(/\*\*/g, '') + ' con ≥ ' + M.config().umbral + ' % de dominio (o activa el desbloqueo libre en Ajustes).'), h('a', { class: 'btn sec peq', href: '#/nivel/' + (n - 1) }, 'Ir al nivel ' + (n - 1))));
    host.appendChild(h('div', { class: 'fila', style: { marginBottom: '10px' } }, h('a', { class: 'btn fantasma peq', href: '#/panel' }, '← Panel')));
    host.appendChild(cab);
    // etapas
    host.appendChild(h('h2', { class: 'espacio', text: 'Etapas' }));
    const g = h('div', { class: 'grid g3' });
    M.ETAPAS.forEach(e => {
      const des = M.etapaDesbloqueada(n, e), ok = M.etapaCompleta(n, e), d = M.dominio(n, e), info = M.etapaInfo(n, e);
      const nPreg = ET.Banco.filtrar({ niveles: [n], etapas: [e] }).length;
      g.appendChild(h('div', { class: 'card', style: { opacity: des ? 1 : .6 } },
        h('div', { class: 'fila sep' }, h('h3', { style: { margin: 0 }, text: 'Etapa ' + e + ' — ' + Tm.etapas[e].nombre }), h('span', { class: 'chip ' + (ok ? 'ok' : (des ? 'acento' : '')), text: ok ? '✔ Completa' : (des ? 'En curso' : '🔒 Bloqueada') })),
        h('p', { class: 'peq suave', text: Tm.etapas[e].desc }),
        Vc.barra(d.dom, M.config().umbral),
        h('div', { class: 'peq tenue espacio' }, d.n ? 'Dominio (últimas ' + d.n + '): ' + Math.round(d.dom * 100) + ' % · meta ' + M.config().umbral + ' % · ' + info.intentos + ' intentos · ' + info.pistas + ' pistas' : 'Sin intentos todavía · ' + nPreg + ' tipos de ejercicio'),
        h('div', { class: 'acciones' }, h('a', { class: 'btn' + (des ? '' : ' sec'), href: des ? '#/practica/' + n + '/' + e : '#/nivel/' + n, 'aria-disabled': des ? null : 'true', onclick: ev => { if (!des) { ev.preventDefault(); Vc.toast('Primero completa la etapa anterior (≥ ' + M.config().umbral + ' %).'); } } }, des ? 'Practicar' : 'Bloqueada'))));
    });
    host.appendChild(g);
    host.appendChild(h('div', { class: 'acciones' }, h('a', { class: 'btn sec', href: '#/examen/config/nivel-' + n }, '⏱ Examen de este nivel'), h('a', { class: 'btn sec', href: '#/teoria/' + n }, '📖 Teoría completa')));
    // conceptos
    host.appendChild(h('h2', { class: 'espacio', text: 'Conceptos del nivel' }));
    const lista = h('div', { class: 'card' });
    Tm.conceptosDeNivel(n).forEach(c => {
      const ma = M.maestria(c.id);
      lista.appendChild(h('div', { class: 'fila-tema' }, h('div', null, h('strong', { text: c.nombre }), h('div', { class: 'peq tenue', text: c.f + (c.comp ? ' · incluye complemento' : '') })), Vc.barra(ma === null ? 0 : ma), h('button', { class: 'mini', title: 'Ver teoría', onclick: () => Vc.teoriaModal([c.id]), text: '📖' })));
    });
    host.appendChild(lista);
  };

  V.teoria = function (host, args) {
    const n = +args[0]; const l = Tm.niveles[n - 1]; if (!l) { location.hash = '#/panel'; return; }
    host.appendChild(h('div', { class: 'fila', style: { marginBottom: '10px' } }, h('a', { class: 'btn fantasma peq', href: '#/nivel/' + n }, '← Nivel ' + n)));
    host.appendChild(h('h1', { text: 'Teoría · ' + l.nombre }));
    host.appendChild(h('p', { class: 'suave', text: 'Resumen de las diapositivas del curso (' + (Tm.fuentes[l.fuente] || l.fuente) + '). Lo marcado como complemento no está en los PDF.' }));
    Tm.conceptosDeNivel(n).forEach((c, i) => {
      const d = h('details', { class: 'rev' }, h('summary', null, h('span', { text: c.nombre }), h('span', { class: 'chip', style: { marginLeft: 'auto' }, text: c.f })), h('div', { class: 'rev-c' }, h('div', { class: 'teo', html: md(c.t) }), h('div', { class: 'cuadro-ej' }, h('strong', { text: 'Ejemplo' }), h('div', { html: md(c.e) }))));
      if (i === 0) d.open = true; host.appendChild(d);
    });
    host.appendChild(h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/practica/' + n + '/' + M.etapaActual(n) }, 'Practicar este nivel')));
  };
})(typeof window !== 'undefined' ? window : globalThis);
