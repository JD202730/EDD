/* vistas_practica.js — práctica guiada (una pregunta a la vez), repaso inteligente y reintento de errores */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, Tipos = ET.Tipos, Banco = ET.Banco, md = U.md;
  const V = ET.Vistas = ET.Vistas || {};

  function sesionPractica(host, cfg) {
    const S = { q: null, ctl: null, pistas: 0, fallos: 0, t0: 0, resuelta: false, registrado: false, resActual: null, ansActual: null, ultimos: [], sesionN: 0, sesionOk: 0, vioSolucion: false, ejemploMostrado: false };
    const nivel = cfg.nivel, etapa = cfg.etapa;
    const cab = h('div'), zona = h('div');
    host.appendChild(cab); host.appendChild(zona);

    function pintarCab() {
      U.vaciar(cab);
      const titulo = cfg.titulo || ('Nivel ' + nivel + ' · Etapa ' + etapa + ' — ' + Tm.etapas[etapa].nombre);
      const sub = nivel ? Tm.niveles[nivel - 1].nombre : (cfg.subtitulo || 'Conceptos que más fallas');
      const fila = h('div', { class: 'fila sep', style: { marginBottom: '12px' } },
        h('div', null, h('a', { class: 'btn fantasma peq', href: cfg.volver || (nivel ? '#/nivel/' + nivel : '#/panel') }, '← Salir'), h('span', { class: 'chip acento', style: { marginLeft: '8px' }, text: '🧭 Práctica guiada' })),
        h('div', { class: 'peq suave', text: 'En esta sesión: ' + S.sesionOk + ' / ' + S.sesionN + ' resueltas' + (S.sesionN ? ' sin ver la solución' : '') }));
      cab.appendChild(fila);
      const izq = h('div', null, h('strong', { text: titulo }), h('div', { class: 'peq tenue', text: sub }));
      let der = null;
      if (nivel) {
        const d = M.dominio(nivel, etapa);
        const txt = 'Dominio de la etapa: ' + Math.round(d.dom * 100) + ' % (meta ' + M.config().umbral + ' %) · ' + d.n + ' respuestas';
        der = h('div', { style: { minWidth: '220px', flex: '1 1 220px', maxWidth: '360px' } }, Vc.barra(d.dom, M.config().umbral), h('div', { class: 'peq tenue', text: txt }));
      }
      const caja = h('div', { class: 'card flat', style: { padding: '12px 16px', marginBottom: '14px' } }, h('div', { class: 'fila sep' }, izq, der));
      cab.appendChild(caja);
    }

    function nueva(sel) {
      S.q = Banco.instanciar(sel.tplId, sel.seed, sel.opts);
      S.pistas = 0; S.fallos = 0; S.t0 = Date.now(); S.resuelta = false; S.registrado = false; S.resActual = null; S.ansActual = null; S.vioSolucion = false; S.ejemploMostrado = false;
      S.ultimos.push(sel.tplId); if (S.ultimos.length > 6) S.ultimos.shift();
      pintarCab(); pintarPregunta();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function siguienteSel() {
      if (cfg.fijoTerminado) return { sel: null };
      return M.siguiente(nivel, etapa, { ultimos: S.ultimos, foco: cfg.foco });
    }

    function pintarPregunta() {
      U.vaciar(zona);
      const q = S.q; const ctx = { modo: 'practica' };
      const card = h('section', { class: 'card' });
      const refuerzo = (q.conceptos || []).find(c => M.debiles(nivel || undefined).some(d => d.id === c));
      if (refuerzo && (cfg.foco || Math.random() < 2)) card.appendChild(h('div', { class: 'peq', style: { marginBottom: '8px', color: 'var(--aviso)' }, text: '🎯 Refuerzo: esta pregunta practica «' + Tm.conceptos[refuerzo].nombre + '», un concepto que te cuesta.' }));
      S.ctl = Vc.montarPregunta(card, q, ctx);
      const btnPista = h('button', { class: 'btn sec', type: 'button', onclick: pedirPista }, '💡 Pista (0/' + q.pistas.length + ')');
      const btnTeo = h('button', { class: 'btn sec', type: 'button', onclick: () => Vc.teoriaModal(q.conceptos || []) }, '📖 Teoría breve');
      const btnOk = h('button', { class: 'btn', type: 'button', onclick: comprobar }, 'Comprobar ✓');
      const btnSalta = h('button', { class: 'btn fantasma', type: 'button', onclick: saltar }, 'Saltar');
      const acciones = h('div', { class: 'acciones' }, btnPista, btnTeo, h('span', { class: 'esp' }), btnSalta, btnOk);
      const pistasP = h('div'), fbP = h('div'), extraP = h('div'), finP = h('div');
      card.appendChild(acciones); card.appendChild(pistasP); card.appendChild(fbP); card.appendChild(extraP); card.appendChild(finP);
      zona.appendChild(card);
      S.ui = { card, btnPista, btnOk, btnSalta, btnTeo, acciones, pistasP, fbP, extraP, finP };

      function pedirPista() {
        if (S.pistas >= q.pistas.length) { Vc.toast('Ya usaste todas las pistas. Prueba la teoría breve o un ejemplo parecido.'); return; }
        S.pistas++;
        U.vaciar(pistasP);
        const p = h('div', { class: 'panel pista' }, h('h4', { text: 'Pistas (' + S.pistas + '/' + q.pistas.length + ') — te orientan, no te dan la respuesta' }), h('ol', null, q.pistas.slice(0, S.pistas).map(t => h('li', { html: md(t).replace(/^<p>|<\/p>$/g, '') }))));
        pistasP.appendChild(p); Tipos.hidratar(p);
        btnPista.textContent = '💡 Pista (' + S.pistas + '/' + q.pistas.length + ')';
        if (S.pistas >= q.pistas.length) btnPista.disabled = true;
      }

      function comprobar() {
        if (S.resuelta || S.vioSolucion) return;
        if (S.ctl.isEmpty()) { Vc.toast('Escribe o elige una respuesta antes de comprobar.'); return; }
        btnOk.disabled = true; btnOk.textContent = 'Corrigiendo…';
        setTimeout(() => {
          try {
            const ans = S.ctl.getAnswer(); const mod = Tipos.mod(q);
            const res = mod.grade(q, ans, ctx);
            aplicar(res, ans, true);
          } catch (e) { console.error(e); Vc.toast('Error al corregir: ' + e.message); }
          btnOk.disabled = S.resuelta; btnOk.textContent = 'Comprobar ✓';
        }, 20);
      }

      function aplicar(res, ans, primera) {
        S.resActual = res; S.ansActual = ans;
        const mod = Tipos.mod(q);
        const regrade = () => { const r2 = mod.grade(q, ans, ctx); aplicar(r2, ans, false); };
        U.vaciar(fbP); const fb = Vc.feedbackNodo(res, ans, q.tipo === 'abierta' ? regrade : null);
        if (q.tipo === 'abierta' && res.extra) fb.appendChild(h('div', { class: 'panel', style: { marginTop: '8px' } }, h('h4', { text: 'Respuesta modelo' }), h('div', { html: md(res.extra.modelo) })));
        fbP.appendChild(fb); Tipos.hidratar(fb);
        if (S.ctl.marcar) S.ctl.marcar(res);
        if (res.ok && !S.resuelta) resolver(res, ans);
        else if (!res.ok && primera) fallar(res, ans);
        fbP.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      function resolver(res, ans) {
        S.resuelta = true; S.ctl.lock(true); btnOk.disabled = true; btnPista.disabled = true; btnSalta.classList.add('oculto');
        const r = registrar(true);
        S.sesionN++; if (!S.vioSolucion && S.fallos === 0) S.sesionOk++;
        const info = h('div', { class: 'panel' }, h('h4', { text: 'Por qué' }), h('div', { html: md(q.explicacion || 'Muy bien.') }));
        extraP.appendChild(info); Tipos.hidratar(info);
        const an = Vc.animacionDe(q); if (an) extraP.appendChild(an);
        mostrarFin(r);
      }
      function fallar(res, ans) {
        S.fallos++;
        M.registrarError(q, ans, res, 'practica');
        const concs = (q.conceptos || []).map(c => Tm.conceptos[c] ? Tm.conceptos[c].nombre : c);
        U.vaciar(extraP);
        extraP.appendChild(h('div', { class: 'panel teo' }, h('h4', { text: 'Qué concepto revisar' }), h('p', { html: md('Repasa: **' + concs.slice(0, 3).join('**, **') + '**.') }),
          h('div', { class: 'fila' }, h('button', { class: 'btn sec peq', onclick: () => Vc.teoriaModal(q.conceptos || []) }, '📖 Teoría breve'), h('button', { class: 'btn sec peq', onclick: verEjemplo }, '🧩 Ver un ejemplo parecido'))));
        if (S.fallos >= 2) {
          const det = h('div', { class: 'panel' }, h('h4', { text: 'Explicación más detallada (después de varios intentos)' }), h('div', { html: md(q.explicacion || '') }));
          Tipos.hidratar(det); extraP.appendChild(det);
          extraP.appendChild(h('div', { class: 'fila' }, h('button', { class: 'btn peq', onclick: () => { registrar(false); nueva(M.masSencilla(q)); } }, '⬇ Probar un ejercicio más sencillo del mismo tema'), h('button', { class: 'btn sec peq', onclick: () => Vc.teoriaModal(q.conceptos || []) }, 'Leer la teoría')));
        }
        U.vaciar(finP);
        finP.appendChild(h('div', { class: 'acciones' }, h('button', { class: 'btn sec', onclick: reintentar }, '↻ Corregir y reintentar'), h('button', { class: 'btn fantasma', onclick: verSolucion }, '👁 Ver la solución'), h('span', { class: 'esp' }), h('span', { class: 'peq tenue', text: 'Intentos fallidos: ' + S.fallos })));
      }
      function reintentar() { U.vaciar(fbP); if (S.ctl.limpiarMarcas) S.ctl.limpiarMarcas(); S.ctl.focus && S.ctl.focus(); }
      function verEjemplo() {
        const c = (q.conceptos || []).map(id => Tm.conceptos[id]).filter(Boolean)[0]; if (!c) return;
        S.ejemploMostrado = true;
        Vc.modal('Un ejemplo parecido (no es tu ejercicio)', h('div', null, h('p', { class: 'peq suave', text: 'Concepto: ' + c.nombre + ' · ' + c.f }), h('div', { class: 'cuadro-ej', html: md(c.e) })));
      }
      function verSolucion() {
        if (S.resuelta || S.vioSolucion) return;
        S.vioSolucion = true; S.ctl.lock(true); btnOk.disabled = true; btnPista.disabled = true; btnSalta.classList.add('oculto');
        const r = registrar(false); S.sesionN++;
        const sol = Vc.solucionNodo(q); extraP.appendChild(sol);
        const an = Vc.animacionDe(q); if (an) extraP.appendChild(an);
        mostrarFin(r, true);
      }
      function saltar() {
        if (!S.resuelta && !S.vioSolucion) { if (S.registrado === false && (S.fallos > 0 || S.pistas > 0)) registrar(false); }
        nueva(siguienteSel());
      }
      function registrar(resuelta) {
        if (S.registrado) return null;
        S.registrado = true;
        const res = S.resActual || { score: 0, ok: false };
        return M.registrarPractica(q, res, { pistas: S.pistas, fallosPrevios: S.fallos, resuelta: resuelta && !S.vioSolucion, verSolucion: S.vioSolucion, ms: Date.now() - S.t0 });
      }
      function mostrarFin(r, abandono) {
        U.vaciar(finP);
        const filas = [];
        if (r) {
          if (!abandono) filas.push(h('div', { class: 'chip ok', text: '+' + r.xp + ' XP' }), h('div', { class: 'chip', text: 'Crédito de dominio: ' + Math.round(r.credito * 100) + ' %' + (S.pistas ? ' (usaste ' + S.pistas + ' pista' + (S.pistas > 1 ? 's' : '') + ')' : '') }));
          else filas.push(h('div', { class: 'chip mal', text: 'Se registró como no resuelta' }));
        }
        const fin = h('div', { class: 'acciones' }, ...filas, h('span', { class: 'esp' }),
          cfg.fijo ? h('a', { class: 'btn sec', href: '#/errores' }, 'Volver a Mis errores') : null,
          h('button', { class: 'btn sec', onclick: () => nueva({ tplId: q.tplId, seed: U.newSeed(), opts: q.opts || null }) }, '🔁 Otro parecido'),
          h('button', { class: 'btn', onclick: () => { if (cfg.fijo) { cfg.fijoTerminado = false; cfg.fijo = null; } nueva(M.siguiente(nivel, etapa, { ultimos: S.ultimos, foco: cfg.foco })); } }, 'Siguiente ▶'));
        finP.appendChild(fin);
        if (r && r.etapaNueva) {
          const sig = nivel && etapa !== 'C' ? { n: nivel, e: M.ETAPAS[M.ETAPAS.indexOf(etapa) + 1] } : null;
          finP.appendChild(h('div', { class: 'rec', style: { marginTop: '12px' } }, h('div', { class: 'ic', text: '🏆' }), h('div', null, h('strong', { text: r.nivelNuevo ? '¡Nivel ' + nivel + ' completado!' : '¡Etapa ' + etapa + ' completada!' }), h('div', { class: 'peq suave', text: r.nivelNuevo ? (nivel < 8 ? 'Se desbloqueó el nivel ' + (nivel + 1) + '.' : 'Terminaste toda la ruta. Prueba un examen acumulativo.') : 'Se desbloqueó la etapa ' + sig.e + '.' })), h('a', { class: 'btn peq', href: r.nivelNuevo ? (nivel < 8 ? '#/nivel/' + (nivel + 1) : '#/examen/config/acumulativo') : '#/practica/' + sig.n + '/' + sig.e }, 'Continuar')));
          Vc.toast(r.nivelNuevo ? '🏆 ¡Nivel completado!' : '🏆 ¡Etapa completada!', 3500);
        }
        pintarCab();
      }
    }

    nueva(cfg.fijo || cfg.inicial || M.siguiente(nivel, etapa, { ultimos: S.ultimos, foco: cfg.foco }));
  }

  V.practica = function (host, args, query) {
    const nivel = +args[0], etapa = args[1];
    if (!Tm.niveles[nivel - 1] || !M.ETAPAS.includes(etapa)) { location.hash = '#/panel'; return; }
    if (!M.etapaDesbloqueada(nivel, etapa)) {
      host.appendChild(Vc.vacio('🔒', 'Esta etapa aún está bloqueada', 'Completa la etapa anterior con al menos ' + M.config().umbral + ' % de dominio (o activa el desbloqueo libre en Ajustes).', h('a', { class: 'btn', href: '#/nivel/' + nivel }, 'Volver al nivel')));
      return;
    }
    const inicial = (query.tpl && Banco.porId[query.tpl]) ? { tplId: query.tpl, seed: query.seed ? +query.seed : U.newSeed(), opts: query.caso ? { caso: query.caso } : null } : null;
    sesionPractica(host, { nivel, etapa, foco: query.foco ? query.foco.split(',') : null, inicial });
  };
  V.repaso = function (host, args, query) {
    let foco = query.foco ? query.foco.split(',') : M.debiles().slice(0, 4).map(d => d.id);
    if (!foco.length) { host.appendChild(Vc.vacio('🎯', 'Todavía no hay conceptos débiles', 'Practica algunas preguntas y el entrenador detectará lo que necesitas repasar.', h('a', { class: 'btn', href: '#/panel' }, 'Ir al panel'))); return; }
    const nombres = foco.map(c => Tm.conceptos[c] ? Tm.conceptos[c].nombre : c);
    const lv = foco.map(c => Tm.conceptos[c] && Tm.conceptos[c].nivel).filter(Boolean);
    sesionPractica(host, { nivel: null, etapa: 'B', foco, titulo: 'Repaso inteligente', subtitulo: 'Enfocado en: ' + nombres.join(' · '), volver: '#/panel' });
  };
  V.reintento = function (host, args) {
    const key = decodeURIComponent(args[0] || ''); const e = M.estado().errores[key];
    if (!e) { host.appendChild(Vc.vacio('🤷', 'No encuentro ese ejercicio', 'Puede que ya lo hayas eliminado.', h('a', { class: 'btn', href: '#/errores' }, 'Mis errores'))); return; }
    sesionPractica(host, { nivel: e.nivel, etapa: e.etapa, fijo: { tplId: e.tplId, seed: e.seed, opts: e.opts }, titulo: 'Reintento de un ejercicio fallado', volver: '#/errores' });
  };
})(typeof window !== 'undefined' ? window : globalThis);
