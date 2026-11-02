/* vistas_perfil.js — perfil del estudiante (nivel, racha, logros, estadísticas, actividad), tienda de monedas y avisos de logros.
   Aquí viven también los bloques del panel anterior (números, actividad reciente, errores, temas a reforzar) para no perder ninguna función. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, J = ET.Juego, Ico = ET.Ico, Fx = ET.Fx;
  const V = ET.Vistas = ET.Vistas || {};
  const pct = x => (x === null || x === undefined) ? '—' : Math.round(x * 100) + ' %';
  const TIER = { 1: ['bronce', 'Bronce'], 2: ['plata', 'Plata'], 3: ['oro', 'Oro'] };
  const MEDALLA_IC = { llama: 'fuego', rayo: 'rayoT', estrellaLlena: 'estrella' };   // dentro de la medalla se usan íconos de trazo (blancos)

  /** medalla de un logro: disco del color de su categoría, con candado si aún no se logra */
  function medalla(def, ok, tam) {
    const m = h('span', { class: 'medalla t' + def.tier + (ok ? ' ok' : ' bloq'), style: { width: tam + 'px', height: tam + 'px' } }, Ico(ok ? (MEDALLA_IC[def.icono] || def.icono) : 'candado', { tam: Math.round(tam * 0.5) }));
    return m;
  }

  /* ---------- aviso de logro desbloqueado (cola: uno detrás de otro) ---------- */
  let cola = [], mostrando = false;
  function siguienteAviso() {
    if (mostrando || !cola.length) return;
    mostrando = true; const l = cola.shift();
    const n = h('div', { class: 'logro-pop', role: 'status' }, medalla(l, true, 54), h('div', null, h('div', { class: 'peq tenue', text: 'Logro desbloqueado' }), h('strong', { text: l.nombre }), h('div', { class: 'peq suave', text: l.desc + ' +' + J.PREMIOS.logro + ' monedas.' })));
    document.body.appendChild(n); Fx.confeti(30);
    setTimeout(() => { n.classList.add('sale'); setTimeout(() => { n.remove(); mostrando = false; siguienteAviso(); }, 350); }, 3400);
    ET.App.refrescarChips();
  }
  /** muestra los logros nuevos que aún no se han celebrado */
  Vc.celebrarLogros = function () { J.tomarNuevos().forEach(l => cola.push(l)); siguienteAviso(); };

  /* ---------- perfil ---------- */
  function cabecera() {
    const st = M.stats(), nj = M.nivelJugador(), rv = M.rachaVigente();
    const p = Math.min(1, (st.xp - nj.ant) / Math.max(1, nj.sig - nj.ant));
    return h('section', { class: 'card perfil-cab' },
      h('div', { class: 'perfil-m' }, ET.Mascota(rv.hoyHecha ? 'feliz' : 'neutral', 110)),
      h('div', { class: 'perfil-t' }, h('div', { class: 'peq tenue', text: 'Tu perfil' }), h('h1', { text: 'Nivel ' + nj.nivel }),
        h('div', { class: 'perfil-xp' }, Vc.barra(p), h('div', { class: 'peq tenue', text: st.xp + ' XP · faltan ' + (nj.sig - st.xp) + ' para el nivel ' + (nj.nivel + 1) }))),
      h('div', { class: 'perfil-cifras' },
        cifra('llama', rv.dias, 'días de racha'), cifra('moneda', J.monedas(), 'monedas'), cifra('rayo', st.xp, 'XP en total'), cifra('check', st.respondidas, 'ejercicios respondidos')));
  }
  const cifra = (ico, v, t) => h('div', { class: 'cifra' }, Ico(ico, { tam: 26 }), h('b', { text: String(v) }), h('span', { text: t }));

  function seccionLogros() {
    const est = J.logrosEstado(), hechos = est.filter(x => x.ok).length;
    const g = h('div', { class: 'logros' }, est.map(x => h('div', { class: 'logro' + (x.ok ? ' ok' : '') },
      medalla(x.def, x.ok, 58),
      h('div', { class: 'logro-t' }, h('strong', { text: x.def.nombre }), h('div', { class: 'peq suave', text: x.def.desc }),
        x.ok ? h('div', { class: 'peq tenue', text: 'Logrado el ' + U.fmtFecha(x.cuando || Date.now()) + ' · ' + TIER[x.def.tier][1] }) : h('div', { class: 'logro-prog' }, Vc.barra(x.valor / x.meta), h('span', { class: 'peq tenue', text: x.valor + ' / ' + x.meta }))))));
    return h('section', { class: 'card' }, h('div', { class: 'fila sep' }, h('h2', { style: { margin: 0 }, text: 'Logros' }), h('span', { class: 'chip acento', text: hechos + ' de ' + est.length })), g);
  }
  function seccionProgreso() {
    const prog = M.progresoGlobal(), ext = M.progresoExtra(), Bib = ET.Biblioteca, bg = Bib && Bib.temas.length ? Bib.progresoGlobal() : null;
    const aros = h('div', { class: 'aros' }, aro(prog, 'Ruta principal'), aro(ext, 'Temas libres'), bg ? aro(bg.p, 'Biblioteca') : null);
    const lista = h('div', { class: 'prog-niveles' }, Tm.niveles.map(l => { const desb = M.nivelDesbloqueado(l.id), a = h('a', { class: 'prog-n' + (desb ? '' : ' bloq'), href: '#/nivel/' + l.id }, h('span', { class: 'prog-ic', text: l.icono }), h('span', { class: 'prog-nom', text: l.nombre }), Vc.barra(desb ? M.progresoNivel(l.id) : 0), h('b', { text: desb ? pct(M.progresoNivel(l.id)) : '🔒' })); Fx.aplicarUnidad(a, l.color); return a; }));
    return h('section', { class: 'card' }, h('h2', { text: 'Progreso general' }), aros, lista);
  }
  const aro = (p, t) => h('div', { class: 'aro' }, Vc.anillo(p, 'var(--acento)'), h('span', { text: t }));

  function seccionNumeros() {
    const st = M.stats();
    return h('section', { class: 'card' }, h('h2', { text: 'Estadísticas de aprendizaje' }), h('div', { class: 'grid g4' },
      [['Preguntas en práctica', st.respondidas], ['Correctas al primer intento', pct(st.pctCorrectas)], ['Correctas sin pistas', pct(st.pctSinPistas)], ['Pistas usadas', st.pistas], ['Aciertos en exámenes', pct(st.exPct)], ['Preguntas de examen', st.exRespondidas], ['Errores pendientes', st.erroresAbiertos], ['Exámenes', st.examenes], ['Lecciones terminadas', J.estado().lecciones.n], ['Retos superados', J.estado().retos.superados]].map(([t, v]) => h('div', { class: 'stat' }, h('b', { text: String(v) }), h('span', { text: t })))));
  }
  function seccionActividad() {
    const deb = M.debiles().slice(0, 6), hist = M.estado().historial.slice(-8).reverse();
    const cols = h('div', { class: 'grid g2' });
    const cDeb = h('div', { class: 'card' }, h('h2', { text: 'Temas que necesitas reforzar' }));
    if (!deb.length) cDeb.appendChild(h('p', { class: 'suave', text: M.estado().historial.length ? 'Por ahora no hay conceptos débiles detectados. Sigue así.' : 'Aún no hay datos: responde algunas preguntas para detectar tus puntos débiles.' }));
    else { deb.forEach(d => { const c = Tm.conceptos[d.id]; cDeb.appendChild(h('div', { class: 'fila-tema' }, h('div', null, h('strong', { text: c.nombre }), h('div', { class: 'peq tenue', text: 'Nivel ' + c.nivel + (d.errores ? ' · ' + d.errores + ' error(es) abiertos' : '') })), Vc.barra(d.mastery === null ? 0 : d.mastery), h('b', { text: pct(d.mastery) }))); }); cDeb.appendChild(h('a', { class: 'btn peq espacio', href: '#/repaso' }, Ico('jugar', { tam: 16 }), 'Repaso inteligente')); }
    const cAct = h('div', { class: 'card' }, h('h2', { text: 'Actividad reciente' }));
    if (!hist.length) cAct.appendChild(h('p', { class: 'suave', text: 'Todavía no has respondido preguntas.' }));
    else {
      hist.forEach(x => { const t = ET.Banco.porId[x.tpl]; cAct.appendChild(h('div', { class: 'fila sep peq fila-act' }, h('span', null, (x.ok ? '✔ ' : '✘ ') + (t ? t.tema : x.tpl)), h('span', { class: 'tenue', text: (x.modo === 'examen' ? 'examen · ' : 'N' + x.n + x.e + ' · ') + U.fmtFecha(x.t) }))); });
      const exs = M.examenes().slice(0, 5);
      if (exs.length) { cAct.appendChild(h('h3', { class: 'espacio', text: 'Últimos exámenes' })); exs.forEach(x => cAct.appendChild(h('a', { class: 'fila sep peq fila-act', style: { textDecoration: 'none', color: 'inherit' }, href: '#/examen/resultado/' + x.id }, h('span', { text: U.fmtFecha(x.t) + ' · ' + x.n + ' preguntas' }), h('strong', { text: x.nota5.toFixed(1) + ' / 5.0' })))); }
    }
    cols.appendChild(cDeb); cols.appendChild(cAct); return cols;
  }
  function seccionErrores() {
    const errs = M.errores().slice(0, 5);
    const c = h('section', { class: 'card' }, h('div', { class: 'fila sep' }, h('h2', { style: { margin: 0 }, text: 'Mi historial de errores' }), h('a', { class: 'btn sec peq', href: '#/errores' }, 'Ver todos')));
    if (!errs.length) c.appendChild(h('p', { class: 'suave espacio', text: 'Todavía no hay errores registrados. Cuando falles una pregunta (en práctica o examen) quedará aquí con tu respuesta, la esperada y su explicación.' }));
    else errs.forEach(e => c.appendChild(h('a', { class: 'fila sep fila-act', style: { textDecoration: 'none', color: 'inherit' }, href: '#/errores' }, h('div', null, h('strong', { text: e.tema || e.tplId }), h('div', { class: 'peq tenue', text: 'Nivel ' + e.nivel + ' · fallado ' + e.veces + ' vez/veces · ' + U.fmtFecha(e.ult) })), h('span', { class: 'chip ' + (e.resuelto ? 'ok' : 'mal'), text: e.resuelto ? '✔ resuelto' : 'pendiente' }))));
    return c;
  }
  function seccionMeta() {
    const c = h('section', { class: 'card' }, h('h2', { text: 'Meta diaria' }), h('p', { class: 'suave', text: 'XP que quieres sumar cada día. Se cuenta con lo que resuelves en práctica, retos y exámenes.' }));
    const fila = h('div', { class: 'segmento', role: 'group', 'aria-label': 'Meta diaria de XP' });
    [20, 30, 50, 80].forEach(v => fila.appendChild(h('button', { type: 'button', class: 'seg' + (J.metaDiaria() === v ? ' act' : ''), 'aria-pressed': J.metaDiaria() === v ? 'true' : 'false', onclick: () => { J.setMeta(v); ET.App.render(); } }, v + ' XP')));
    c.appendChild(fila); c.appendChild(h('div', { class: 'peq tenue espacio', text: 'Hoy: ' + J.xpHoy() + ' XP.' })); return c;
  }

  V.perfil = function (host) {
    host.appendChild(cabecera());
    host.appendChild(h('div', { class: 'perfil-atajos' },
      h('a', { class: 'atajo', href: '#/tienda' }, Ico('tienda', { tam: 24 }), h('div', null, h('strong', { text: 'Tienda' }), h('span', { text: J.monedas() + ' monedas' }))),
      h('a', { class: 'atajo', href: '#/errores' }, Ico('errores', { tam: 24 }), h('div', null, h('strong', { text: 'Mis errores' }), h('span', { text: M.stats().erroresAbiertos + ' pendientes' }))),
      h('a', { class: 'atajo', href: '#/ajustes' }, Ico('ajustes', { tam: 24 }), h('div', null, h('strong', { text: 'Ajustes' }), h('span', { text: 'Tema, umbral y copia del progreso' })))));
    host.appendChild(seccionLogros());
    host.appendChild(seccionProgreso());
    host.appendChild(seccionMeta());
    host.appendChild(seccionNumeros());
    host.appendChild(seccionActividad());
    host.appendChild(seccionErrores());
  };

  /* ---------- tienda ---------- */
  function articulo(a, motivoNo, onBuy) {
    const comprable = !motivoNo && J.monedas() >= a.precio;
    return h('div', { class: 'articulo' }, h('div', { class: 'articulo-ic' }, Ico(a.icono, { tam: 40 })), h('div', { class: 'articulo-t' }, h('strong', { text: a.nombre }), h('div', { class: 'peq suave', text: a.desc }), motivoNo ? h('div', { class: 'peq tenue', text: motivoNo }) : null),
      h('button', { type: 'button', class: 'btn' + (comprable ? '' : ' sec'), disabled: !!motivoNo || null, onclick: onBuy }, Ico('moneda', { tam: 18 }), String(a.precio)));
  }
  V.tienda = function (host) {
    const j = J.estado();
    const cab = h('section', { class: 'card tienda-cab' }, h('div', null, h('div', { class: 'peq tenue', text: 'Tus monedas' }), h('div', { class: 'tienda-saldo' }, Ico('moneda', { tam: 40 }), h('b', { id: 'saldo', text: String(J.monedas()) }))), h('p', { class: 'suave', text: 'Las monedas se ganan estudiando. Aquí se gastan en cosas que te ayudan a seguir (escudos y vidas) y en colores para personalizar la app.' }));
    host.appendChild(cab);
    const comprar = id => { const r = J.comprar(id); Vc.toast((r.ok ? '✔ ' : '') + r.msg); if (r.ok) { Fx.confeti(24); Vc.celebrarLogros(); } ET.App.render(); };
    const cA = h('section', { class: 'card' }, h('h2', { text: 'Ayudas' }));
    J.ARTICULOS.forEach(a => cA.appendChild(articulo(a, a.puede(), () => comprar(a.id))));
    cA.appendChild(h('div', { class: 'peq tenue espacio', text: 'Escudos: ' + J.escudos() + ' de ' + J.MAX_ESCUDOS + ' · Vidas: ' + J.vidas().n + ' de ' + J.MAX_VIDAS }));
    host.appendChild(cA);
    const cP = h('section', { class: 'card' }, h('h2', { text: 'Paletas de color' }), h('p', { class: 'suave', text: 'Cambian el color principal de botones, camino y barras. El modo claro u oscuro se elige en Ajustes.' }));
    const grid = h('div', { class: 'paletas' });
    J.PALETAS.forEach(pa => {
      const tengo = J.tienePaleta(pa.id), activa = J.paletaActiva() === pa.id;
      const m = h('span', { class: 'paleta-m' }); m.style.background = 'linear-gradient(135deg,' + pa.muestra[0] + ',' + pa.muestra[1] + ')';
      grid.appendChild(h('div', { class: 'paleta' + (activa ? ' act' : '') }, m, h('strong', { text: pa.nombre }),
        tengo ? h('button', { type: 'button', class: 'btn peq ' + (activa ? 'ok' : 'sec'), disabled: activa || null, onclick: () => { J.activarPaleta(pa.id); ET.App.render(); } }, activa ? 'En uso' : 'Usar')
          : h('button', { type: 'button', class: 'btn peq' + (J.monedas() >= pa.precio ? '' : ' sec'), onclick: () => comprar('paleta_' + pa.id) }, Ico('moneda', { tam: 16 }), String(pa.precio))));
    });
    cP.appendChild(grid); host.appendChild(cP);
    const P = J.PREMIOS, R = J.RETO;
    host.appendChild(h('section', { class: 'card' }, h('h2', { text: 'Cómo se ganan las monedas' }), h('ul', { class: 'reglas' },
      h('li', null, Ico('moneda', { tam: 18 }), h('span', { text: '+' + P.ejercicio + ' por cada ejercicio resuelto, y +' + P.sinAyuda + ' más si lo resuelves a la primera y sin pistas.' })),
      h('li', null, Ico('moneda', { tam: 18 }), h('span', { text: '+' + P.leccion + ' al terminar una lección con 80 % de aciertos o más, y +' + P.leccionPerfecta + ' si no fallas ninguno.' })),
      h('li', null, Ico('moneda', { tam: 18 }), h('span', { text: '+' + P.etapa + ' al completar una etapa y +' + P.nivel + ' al completar un nivel.' })),
      h('li', null, Ico('moneda', { tam: 18 }), h('span', { text: '+' + P.reto + ' (y +' + R.xpBonus + ' XP) la primera vez que superas el reto de un nivel.' })),
      h('li', null, Ico('moneda', { tam: 18 }), h('span', { text: '+' + P.logro + ' por cada logro desbloqueado.' })),
      h('li', null, Ico('moneda', { tam: 18 }), h('span', { text: 'En un examen: ' + P.examenPorPunto + ' por cada punto de la nota sobre 5 (hasta ' + P.examenTope + ').' })))));
    const movs = j.movs.slice(0, 12);
    host.appendChild(h('section', { class: 'card' }, h('h2', { text: 'Últimos movimientos' }), movs.length ? movs.map(m => h('div', { class: 'fila sep peq fila-act' }, h('span', { text: m.motivo }), h('b', { class: m.n > 0 ? 'ganado' : 'gastado', text: (m.n > 0 ? '+' : '') + m.n }), h('span', { class: 'tenue', text: U.fmtFecha(m.t) }))) : h('p', { class: 'suave', text: 'Todavía no hay movimientos: resuelve un ejercicio para ganar tu primera moneda.' })));
  };
})(typeof window !== 'undefined' ? window : globalThis);
