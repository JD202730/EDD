/* vistas_practica.js — lecciones de práctica guiada (una pregunta a la vez), reto de nivel, repaso inteligente y reintento de errores.
   Una LECCIÓN son varias preguntas seguidas (10 por defecto) con barra de progreso y una pantalla de resultados al final.
   La lógica de corrección, pistas, teoría, reintento, solución y dificultad adaptativa es la de siempre: aquí solo cambia cómo se ve y se vive. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, Tipos = ET.Tipos, Banco = ET.Banco, J = ET.Juego, Ico = ET.Ico, Fx = ET.Fx, md = U.md;
  const V = ET.Vistas = ET.Vistas || {};
  const LARGO = 10;
  const fmtTiempo = ms => { const s = Math.max(1, Math.round(ms / 1000)), m = Math.floor(s / 60); return m ? m + ' min ' + String(s % 60).padStart(2, '0') + ' s' : s + ' s'; };

  /** cfg: {nivel, etapa, titulo, subtitulo, volver, fijo, inicial, foco, largo, reto} */
  function sesionPractica(host, cfg) {
    const S = { q: null, ctl: null, pistas: 0, fallos: 0, t0: 0, resuelta: false, registrado: false, resActual: null, ansActual: null, ultimos: [], sesionN: 0, sesionOk: 0, vioSolucion: false, ejemploMostrado: false,
      iniciada: Date.now(), xp: 0, monedas: 0, log: [], nPreg: 0, terminada: false, dom0: cfg.nivel ? M.dominio(cfg.nivel, cfg.etapa).dom : null, perdidas: 0, vidasIni: cfg.reto ? J.vidas().n : null };
    const nivel = cfg.nivel, etapa = cfg.etapa, largo = cfg.largo || (cfg.fijo ? 1 : LARGO);
    const salida = cfg.volver || '#/panel';
    const raiz = h('div', { class: 'leccion' }), top = h('header', { class: 'leccion-top' }), meta = h('div', { class: 'leccion-meta' }), zona = h('div');
    raiz.append(top, meta, zona); host.appendChild(raiz);

    /* ---------- cabecera: salir, progreso, vidas ---------- */
    const barraI = h('i'); const vidasN = h('div', { class: 'leccion-vidas', 'aria-live': 'polite' });
    const salir = h('button', { type: 'button', class: 'leccion-x', 'aria-label': 'Salir de la lección', onclick: () => { if (S.terminada || !S.sesionN) location.hash = salida; else Vc.confirmar('¿Salir de la lección?', 'Lo que ya respondiste **quedó guardado** en tu progreso. Podrás empezar otra lección cuando quieras.', 'Salir', () => { location.hash = salida; }); } }, Ico('cerrar', { tam: 22 }));
    top.append(salir, h('div', { class: 'leccion-barra', role: 'progressbar', 'aria-label': 'Progreso de la lección', 'aria-valuemin': 0, 'aria-valuemax': largo, 'aria-valuenow': 0 }, barraI), vidasN);
    function pintarVidas(perdida) {
      U.vaciar(vidasN); if (!cfg.reto) { vidasN.appendChild(h('span', { class: 'premio-xp', title: 'XP de esta lección' }, Ico('rayo', { tam: 20 }), '+' + S.xp)); return; }
      const v = J.vidas(); for (let i = 0; i < v.max; i++) { const c = Ico(i < v.n ? 'corazon' : 'corazonVacio', { tam: 24 }); if (perdida && i === v.n) c.classList.add('perdida'); vidasN.appendChild(c); }
      vidasN.setAttribute('aria-label', v.n + ' de ' + v.max + ' vidas');
    }
    function pintarProgreso() {
      const p = Math.min(1, S.sesionN / largo); barraI.style.width = Math.round(p * 100) + '%';
      const b = top.querySelector('.leccion-barra'); b.setAttribute('aria-valuenow', S.sesionN);
    }
    function pintarCab() {
      pintarProgreso(); pintarVidas(false); U.vaciar(meta);
      const titulo = cfg.titulo || ('Nivel ' + nivel + ' · Etapa ' + etapa + ' — ' + Tm.etapas[etapa].nombre);
      const sub = nivel ? Tm.niveles[nivel - 1].nombre : (cfg.subtitulo || 'Conceptos que más fallas');
      meta.appendChild(h('div', null, h('strong', { role: 'heading', 'aria-level': '1', text: titulo }), h('div', { class: 'peq tenue', text: sub })));
      if (largo > 1) meta.appendChild(h('span', { text: 'Ejercicio ' + Math.min(S.sesionN + (S.resuelta || S.vioSolucion ? 0 : 1), largo) + ' de ' + largo }));
    }

    function nueva(sel) {
      if (!sel) { mostrarResultados(); return; }
      S.q = Banco.instanciar(sel.tplId, sel.seed, sel.opts); S.nPreg++;
      S.pistas = 0; S.fallos = 0; S.t0 = Date.now(); S.resuelta = false; S.registrado = false; S.resActual = null; S.ansActual = null; S.vioSolucion = false; S.ejemploMostrado = false; S.perdidaEsta = false;
      S.ultimos.push(sel.tplId); if (S.ultimos.length > 6) S.ultimos.shift();
      pintarCab(); pintarPregunta();
      window.scrollTo({ top: 0, behavior: Fx.reducido() ? 'auto' : 'smooth' });
    }
    function siguienteSel() {
      if (cfg.fijoTerminado) return null;
      const e = cfg.reto ? M.ETAPAS[S.nPreg % M.ETAPAS.length] : etapa;   // el reto mezcla las tres etapas del nivel
      return M.siguiente(nivel, e, { ultimos: S.ultimos, foco: cfg.foco });
    }
    const terminaLeccion = () => S.sesionN >= largo && !cfg.fijo;
    function avanzar() { if (terminaLeccion()) mostrarResultados(); else { if (cfg.fijo) { cfg.fijoTerminado = false; cfg.fijo = null; } nueva(siguienteSel()); } }

    function pintarPregunta() {
      U.vaciar(zona);
      const q = S.q; const ctx = { modo: 'practica' };
      const card = h('section', { class: 'card' });
      const refuerzo = (q.conceptos || []).find(c => M.debiles(nivel || undefined).some(d => d.id === c));
      if (refuerzo && (cfg.foco || Math.random() < 2)) card.appendChild(h('div', { class: 'peq', style: { marginBottom: '8px', color: 'var(--aviso)' }, text: '🎯 Refuerzo: esta pregunta practica «' + Tm.conceptos[refuerzo].nombre + '», un concepto que te cuesta.' }));
      S.ctl = Vc.montarPregunta(card, q, ctx);
      const txtPista = h('span', { class: 't', text: 'Pista (0/' + q.pistas.length + ')' });
      const btnPista = h('button', { class: 'btn sec', type: 'button', title: 'Pista', 'aria-label': 'Pedir una pista (0 de ' + q.pistas.length + ' usadas)', onclick: pedirPista }, Ico('pista', { tam: 18 }), txtPista);
      const btnTeo = h('button', { class: 'btn sec', type: 'button', title: 'Teoría breve', 'aria-label': 'Teoría breve', onclick: () => Vc.teoriaModal(q.conceptos || []) }, Ico('libro', { tam: 18 }), h('span', { class: 't', text: 'Teoría breve' }));
      const btnOk = h('button', { class: 'btn', type: 'button', onclick: comprobar }, 'Comprobar');
      const btnSalta = h('button', { class: 'btn fantasma', type: 'button', onclick: saltar }, 'Saltar');
      if (cfg.reto) btnSalta.classList.add('oculto');   // en un reto no se puede saltar un ejercicio para esquivar la vida
      const acciones = h('div', { class: 'acciones fijo' }, btnPista, btnTeo, h('span', { class: 'esp' }), btnSalta, btnOk);
      const pistasP = h('div'), fbP = h('div'), extraP = h('div'), finP = h('div');
      card.appendChild(acciones); card.appendChild(pistasP); card.appendChild(fbP); card.appendChild(extraP); card.appendChild(finP);
      zona.appendChild(card);
      S.ui = { card, btnPista, btnOk, btnSalta, btnTeo, acciones, pistasP, fbP, extraP, finP };
      if (q.pistasInternas) {   // taller interactivo: lleva sus propias pistas y se corrige solo al terminar
        btnPista.classList.add('oculto'); btnOk.classList.add('oculto');
        if (S.ctl.onCompletar) S.ctl.onCompletar(() => { if (!S.resuelta && !S.vioSolucion) comprobar(); });
      }

      function pedirPista() {
        if (S.pistas >= q.pistas.length) { Vc.toast('Ya usaste todas las pistas. Prueba la teoría breve o un ejemplo parecido.'); return; }
        S.pistas++;
        U.vaciar(pistasP);
        const p = h('div', { class: 'panel pista' }, h('h4', { text: 'Pistas (' + S.pistas + '/' + q.pistas.length + '): te orientan, no te dan la respuesta' }), h('ol', null, q.pistas.slice(0, S.pistas).map(t => h('li', { html: md(t).replace(/^<p>|<\/p>$/g, '') }))));
        pistasP.appendChild(p); Tipos.hidratar(p);
        txtPista.textContent = 'Pista (' + S.pistas + '/' + q.pistas.length + ')'; btnPista.setAttribute('aria-label', 'Pedir una pista (' + S.pistas + ' de ' + q.pistas.length + ' usadas)');
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
          btnOk.disabled = S.resuelta; btnOk.textContent = 'Comprobar';
        }, 20);
      }

      function aplicar(res, ans, primera) {
        S.resActual = res; S.ansActual = ans;
        const mod = Tipos.mod(q);
        const regrade = () => { const r2 = mod.grade(q, ans, ctx); aplicar(r2, ans, false); };
        U.vaciar(fbP); const fb = Vc.feedbackNodo(res, ans, Tipos.manualizable(q) ? regrade : null);
        if (res.extra && res.extra.modelo) fb.appendChild(h('div', { class: 'panel', style: { marginTop: '8px' } }, h('h4', { text: 'Respuesta modelo' }), h('div', { html: md(res.extra.modelo) })));
        fbP.appendChild(fb); Tipos.hidratar(fb);        if (S.ctl.marcar) S.ctl.marcar(res);
        if (res.ok && !S.resuelta) resolver(res, ans);
        else if (!res.ok && primera) fallar(res, ans);
        fbP.scrollIntoView({ block: 'nearest', behavior: Fx.reducido() ? 'auto' : 'smooth' });
      }

      /** vida perdida en el reto: solo la primera vez que falla cada ejercicio */
      function costarVida() {
        if (!cfg.reto || S.perdidaEsta) return; S.perdidaEsta = true;
        J.perderVida(); S.perdidas++; pintarVidas(true);
        if (J.vidas().n <= 0) setTimeout(() => derrota(), 900);
      }

      function resolver(res, ans) {
        S.resuelta = true; S.ctl.lock(true); btnOk.disabled = true; btnPista.disabled = true; btnSalta.classList.add('oculto');
        const r = registrar(true);
        S.sesionN++; if (!S.vioSolucion && S.fallos === 0) S.sesionOk++;
        const info = h('div', { class: 'panel' }, h('h4', { text: 'Por qué' }), h('div', { html: md(q.explicacion || 'Muy bien.') }));
        extraP.appendChild(info); Tipos.hidratar(info);
        const an = Vc.animacionDe(q); if (an) extraP.appendChild(an);
        mostrarFin(r);
        if (r && r.xp) Fx.flotar('+' + r.xp + ' XP', S.ui.finP, 'var(--xp)');
        card.classList.add('pop');
      }
      function fallar(res, ans) {
        S.fallos++;
        M.registrarError(q, ans, res, 'practica');
        costarVida();
        const concs = (q.conceptos || []).map(c => Tm.conceptos[c] ? Tm.conceptos[c].nombre : c);
        U.vaciar(extraP);
        extraP.appendChild(h('div', { class: 'panel teo' }, h('h4', { text: 'Qué concepto revisar' }), h('p', { html: md('Repasa: **' + concs.slice(0, 3).join('**, **') + '**.') }),
          h('div', { class: 'fila' }, h('button', { class: 'btn sec peq', onclick: () => Vc.teoriaModal(q.conceptos || []) }, Ico('libro', { tam: 16 }), 'Teoría breve'), h('button', { class: 'btn sec peq', onclick: verEjemplo }, 'Ver un ejemplo parecido'))));
        if (S.fallos >= 2) {
          const det = h('div', { class: 'panel' }, h('h4', { text: 'Explicación más detallada (después de varios intentos)' }), h('div', { html: md(q.explicacion || '') }));
          Tipos.hidratar(det); extraP.appendChild(det);
          extraP.appendChild(h('div', { class: 'fila' }, cfg.reto ? null : h('button', { class: 'btn peq', onclick: () => { registrar(false); nueva(M.masSencilla(q)); } }, 'Probar un ejercicio más sencillo del mismo tema'), h('button', { class: 'btn sec peq', onclick: () => Vc.teoriaModal(q.conceptos || []) }, 'Leer la teoría')));
        }
        U.vaciar(finP);
        finP.appendChild(h('div', { class: 'acciones' }, h('button', { class: 'btn sec', onclick: reintentar }, 'Corregir y reintentar'), h('button', { class: 'btn fantasma', onclick: verSolucion }, 'Ver la solución'), h('span', { class: 'esp' }), h('span', { class: 'peq tenue', text: 'Intentos fallidos: ' + S.fallos })));
        acciones.classList.add('incorrecto'); Fx.animar(card, 'sacude', 460);
      }
      function reintentar() { U.vaciar(fbP); acciones.classList.remove('incorrecto'); if (S.ctl.limpiarMarcas) S.ctl.limpiarMarcas(); S.ctl.focus && S.ctl.focus(); }
      function verEjemplo() {
        const c = (q.conceptos || []).map(id => Tm.conceptos[id]).filter(Boolean)[0]; if (!c) return;
        S.ejemploMostrado = true;
        Vc.modal('Un ejemplo parecido (no es tu ejercicio)', h('div', null, h('p', { class: 'peq suave', text: 'Concepto: ' + c.nombre + ' · ' + c.f }), h('div', { class: 'cuadro-ej', html: md(c.e) })));
      }
      function verSolucion() {
        if (S.resuelta || S.vioSolucion) return;
        S.vioSolucion = true; S.ctl.lock(true); btnOk.disabled = true; btnPista.disabled = true; btnSalta.classList.add('oculto');
        if (S.fallos === 0) costarVida();
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
        const r = M.registrarPractica(q, res, { pistas: S.pistas, fallosPrevios: S.fallos, resuelta: resuelta && !S.vioSolucion, verSolucion: S.vioSolucion, ms: Date.now() - S.t0 });
        const premio = J.ultimoPremio || { monedas: 0 };
        S.xp += r.xp; S.monedas += premio.monedas; S.log.push({ ok1: resuelta && !S.vioSolucion && S.fallos === 0, xp: r.xp, ms: Date.now() - S.t0 });
        S.premioUltimo = premio; pintarVidas(false); Vc.celebrarLogros();
        return r;
      }
      function mostrarFin(r, abandono) {
        U.vaciar(finP);
        const filas = []; const prem = S.premioUltimo || { monedas: 0 };
        if (r) {
          if (!abandono) filas.push(h('span', { class: 'chip ok' }, Ico('rayo', { tam: 14 }), '+' + r.xp + ' XP'), prem.monedas ? h('span', { class: 'chip aviso' }, Ico('moneda', { tam: 14 }), '+' + prem.monedas) : null, h('span', { class: 'chip', text: 'Dominio: ' + Math.round(r.credito * 100) + ' %' + (S.pistas ? ' · ' + S.pistas + ' pista' + (S.pistas > 1 ? 's' : '') : '') }));
          else filas.push(h('span', { class: 'chip mal', text: 'Se registró como no resuelta' }));
        }
        const ultima = terminaLeccion();
        const fin = h('div', { class: 'acciones fijo ' + (abandono ? 'incorrecto' : 'correcto') }, ...filas, h('span', { class: 'esp' }),
          cfg.fijo ? h('a', { class: 'btn sec', href: '#/errores' }, 'Volver a Mis errores') : null,
          cfg.reto ? null : h('button', { class: 'btn sec', onclick: () => nueva({ tplId: q.tplId, seed: U.newSeed(), opts: q.opts || null }) }, 'Otro parecido'),
          h('button', { class: 'btn', onclick: avanzar }, ultima ? 'Ver resultados' : 'Continuar', Ico('flecha', { tam: 18 })));
        acciones.classList.add('oculto'); acciones.classList.remove('fijo');
        finP.appendChild(fin);
        if (r && r.etapaNueva) {
          const sig = nivel && etapa !== 'C' ? { n: nivel, e: M.ETAPAS[M.ETAPAS.indexOf(etapa) + 1] } : null;
          finP.appendChild(h('div', { class: 'rec', style: { marginTop: '12px' } }, Ico('trofeo', { tam: 28 }), h('div', null, h('strong', { text: r.nivelNuevo ? 'Nivel ' + nivel + ' completado' : 'Etapa ' + etapa + ' completada' }), h('div', { class: 'peq suave', text: r.nivelNuevo ? (nivel < 8 ? 'Se desbloqueó el nivel ' + (nivel + 1) + '.' : 'Terminaste toda la ruta. Prueba un examen acumulativo.') : 'Se desbloqueó la etapa ' + sig.e + '.' })), h('a', { class: 'btn peq', href: r.nivelNuevo ? (nivel < 8 ? '#/nivel/' + (nivel + 1) : '#/examen/config/acumulativo') : '#/practica/' + sig.n + '/' + sig.e }, 'Continuar')));
          Fx.confeti(60); Vc.toast(r.nivelNuevo ? 'Nivel completado' : 'Etapa completada', 3500);
        }
        pintarProgreso(); pintarCab();
      }
    }

    /* ---------- fin de la lección ---------- */
    function celda(clase, ico, valor, texto) { return h('div', { class: 'res-card ' + clase }, Ico(ico, { tam: 28 }), h('b', { text: valor }), h('span', { text: texto })); }
    function mostrarResultados(derrotado) {
      if (S.terminada) return; S.terminada = true;
      const total = S.log.length, ok1 = S.log.filter(x => x.ok1).length, ms = Date.now() - S.iniciada;
      const acierto = total ? ok1 / total : 0;
      let cierre = null, monedasCierre = 0;
      if (cfg.reto) cierre = J.cerrarReto({ nivel, ok1, total, vidas: J.vidas().n });
      else if (!cfg.fijo && total >= Math.min(largo, 5)) monedasCierre = J.cerrarLeccion({ total, ok1 });
      const logros = J.tomarNuevos(); const monedasTotal = S.monedas + monedasCierre + (cierre ? cierre.monedas : 0), xpTotal = S.xp + (cierre ? cierre.xp : 0);
      U.vaciar(top); U.vaciar(meta); U.vaciar(zona); top.appendChild(salir); top.appendChild(h('div', { class: 'leccion-barra' }, h('i', { style: { width: '100%' } })));
      const bien = cfg.reto ? !!(cierre && cierre.ok) : acierto >= 0.8;
      const humor = derrotado ? 'triste' : (bien ? 'celebra' : (acierto >= 0.5 ? 'feliz' : 'neutral'));
      let titulo, texto;
      if (cfg.reto) { titulo = cierre.ok ? 'Reto superado' : (derrotado ? 'Te quedaste sin vidas' : 'Reto no superado'); texto = cierre.ok ? (cierre.primera ? 'Primera vez que superas el reto de este nivel: +' + J.RETO.xpBonus + ' XP y +' + J.PREMIOS.reto + ' monedas.' : 'Ya habías superado este reto: lo repetiste para practicar.') : (derrotado ? 'Tus vidas llegaron a cero. Se recargan solas (1 cada ' + Math.round(J.REGEN_MS / 60000) + ' min) o con monedas en la Tienda.' : 'Necesitabas ' + J.RETO.aciertosMin + ' aciertos a la primera. Repasa la teoría del nivel e inténtalo de nuevo.'); }
      else if (total === 0) { titulo = 'Lección sin ejercicios resueltos'; texto = 'Saliste antes de resolver alguno. Cuando quieras, empieza otra.'; }
      else { titulo = acierto >= 0.8 ? 'Lección completada' : 'Lección terminada'; texto = acierto === 1 ? 'Sin ningún error. Así se hace.' : acierto >= 0.8 ? 'Muy buen trabajo: ' + ok1 + ' de ' + total + ' a la primera.' : 'Resolviste ' + ok1 + ' de ' + total + ' a la primera. Los errores quedaron en «Mis errores» para repasarlos.'; }
      const res = h('section', { class: 'resultados' + (cfg.reto ? ' reto-fin' : '') }, ET.Mascota(humor, 130), h('h1', { text: titulo }), h('p', { text: texto }),
        h('div', { class: 'res-grid' }, celda('xp', 'rayo', '+' + xpTotal, 'XP ganados'), celda('aciertos', 'check', total ? Math.round(acierto * 100) + ' %' : '—', 'aciertos a la primera'), celda('tiempo', 'reloj', fmtTiempo(ms), 'tiempo empleado'), celda('moneda', 'moneda', '+' + monedasTotal, 'monedas ganadas'), cfg.reto ? celda('vida', 'corazon', J.vidas().n + ' / ' + J.vidas().max, 'vidas restantes (gastaste ' + S.perdidas + ')') : null));
      if (nivel && S.dom0 !== null) { const d = M.dominio(nivel, etapa), nu = M.etapaCompleta(nivel, etapa); res.appendChild(h('div', { class: 'res-prog' }, h('div', { class: 'fila sep' }, h('strong', { text: 'Etapa ' + etapa + ' del nivel ' + nivel }), h('span', { class: 'peq tenue', text: nu ? 'Completa' : 'Dominio ' + Math.round(S.dom0 * 100) + ' % → ' + Math.round(d.dom * 100) + ' %' })), Vc.barra(d.dom, M.config().umbral), h('div', { class: 'peq tenue', text: 'Meta ' + M.config().umbral + ' % · progreso del nivel: ' + Math.round(M.progresoNivel(nivel) * 100) + ' %' + (!nu && d.n < 5 ? ' · la etapa se completa con al menos 5 respuestas' : '') }))); }
      if (logros.length) res.appendChild(h('div', { class: 'res-logros' }, h('strong', { text: 'Logros desbloqueados' }), logros.map(l => h('div', { class: 'rec' }, Ico('trofeo', { tam: 24 }), h('div', null, h('strong', { text: l.nombre }), h('div', { class: 'peq suave', text: l.desc }))))));
      const siguiente = cfg.fijo ? h('a', { class: 'btn grande', href: salida }, 'Continuar') : h('button', { class: 'btn grande', onclick: () => { location.hash = salida; } }, 'Continuar');
      res.appendChild(h('div', { class: 'res-acc' }, siguiente, cfg.fijo ? null : h('button', { class: 'btn sec', onclick: () => { ET.App.render(); } }, cfg.reto ? 'Reintentar el reto' : 'Otra lección')));
      zona.appendChild(res); ET.App.refrescarChips();
      if (bien) Fx.confeti(80);
      window.scrollTo({ top: 0 });
    }
    function derrota() { if (!S.terminada) mostrarResultados(true); }

    pintarVidas(false);
    nueva(cfg.fijo || cfg.inicial || M.siguiente(nivel, cfg.reto ? 'A' : etapa, { ultimos: S.ultimos, foco: cfg.foco }));
  }

  V.practica = function (host, args, query) {
    const nivel = +args[0], etapa = args[1];
    if (!Tm.niveles[nivel - 1] || !M.ETAPAS.includes(etapa)) { location.hash = '#/panel'; return; }
    if (!M.etapaDesbloqueada(nivel, etapa)) {
      document.body.classList.remove('en-leccion');
      host.appendChild(Vc.vacio('🔒', 'Esta etapa aún está bloqueada', 'Completa la etapa anterior con al menos ' + M.config().umbral + ' % de dominio (o activa el desbloqueo libre en Ajustes).', h('a', { class: 'btn', href: '#/panel' }, 'Volver al mapa')));
      return;
    }
    const inicial = (query.tpl && Banco.porId[query.tpl]) ? { tplId: query.tpl, seed: query.seed ? +query.seed : U.newSeed(), opts: query.caso ? { caso: query.caso } : null } : null;
    sesionPractica(host, { nivel, etapa, foco: query.foco ? query.foco.split(',') : null, inicial, largo: query.largo ? Math.max(1, Math.min(30, +query.largo || LARGO)) : undefined });
  };
  V.reto = function (host, args, query) {
    const nivel = +args[0];
    if (!Tm.niveles[nivel - 1] || !J.retoDisponible(nivel)) { document.body.classList.remove('en-leccion'); host.appendChild(Vc.vacio('🔒', 'Este reto aún no está disponible', 'Se desbloquea al completar la etapa A del nivel.', h('a', { class: 'btn', href: '#/panel' }, 'Volver al mapa'))); return; }
    if (J.vidas().n < 1) { document.body.classList.remove('en-leccion'); host.appendChild(Vc.vacio('💔', 'No te quedan vidas', 'Se recargan solas (1 cada ' + Math.round(J.REGEN_MS / 60000) + ' min) o con monedas en la Tienda.', h('a', { class: 'btn', href: '#/tienda' }, 'Ir a la Tienda'))); return; }
    J.iniciarReto();
    const inicial = (query && query.tpl && Banco.porId[query.tpl]) ? { tplId: query.tpl, seed: query.seed ? +query.seed : U.newSeed(), opts: null } : null;   // ?tpl=… sirve para probar un ejercicio concreto
    sesionPractica(host, { nivel, etapa: 'A', reto: true, largo: J.RETO.preguntas, titulo: 'Reto del nivel ' + nivel, subtitulo: Tm.niveles[nivel - 1].nombre, inicial });
  };
  V.repaso = function (host, args, query) {
    let foco = query.foco ? query.foco.split(',') : M.debiles().slice(0, 4).map(d => d.id);
    if (!foco.length) { document.body.classList.remove('en-leccion'); host.appendChild(Vc.vacio('🎯', 'Todavía no hay conceptos débiles', 'Practica algunas preguntas y el entrenador detectará lo que necesitas repasar.', h('a', { class: 'btn', href: '#/panel' }, 'Volver al mapa'))); return; }
    const nombres = foco.map(c => Tm.conceptos[c] ? Tm.conceptos[c].nombre : c);
    sesionPractica(host, { nivel: null, etapa: 'B', foco, titulo: 'Repaso inteligente', subtitulo: 'Enfocado en: ' + nombres.join(' · '), volver: '#/panel' });
  };
  V.reintento = function (host, args) {
    const key = decodeURIComponent(args[0] || ''); const e = M.estado().errores[key];
    if (!e) { document.body.classList.remove('en-leccion'); host.appendChild(Vc.vacio('🤷', 'No encuentro ese ejercicio', 'Puede que ya lo hayas eliminado.', h('a', { class: 'btn', href: '#/errores' }, 'Mis errores'))); return; }
    sesionPractica(host, { nivel: e.nivel, etapa: e.etapa, fijo: { tplId: e.tplId, seed: e.seed, opts: e.opts }, titulo: 'Reintento de un ejercicio fallado', volver: '#/errores' });
  };
})(typeof window !== 'undefined' ? window : globalThis);
