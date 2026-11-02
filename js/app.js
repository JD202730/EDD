/* app.js — enrutador por hash, navegación (lateral en escritorio, inferior en celular) y arranque */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, M = ET.Motor, V = ET.Vistas, Tm = ET.Temario, J = ET.Juego, Ico = ET.Ico;
  const App = ET.App = {};
  // [ruta, ícono, etiqueta, ¿va en la barra inferior del celular?]
  const NAV = [['panel', 'mapa', 'Aprender', 1], ['biblioteca', 'libro', 'Biblioteca', 1], ['lab', 'lab', 'Laboratorio', 1], ['examen', 'examen', 'Examen', 1], ['errores', 'errores', 'Mis errores', 0], ['tienda', 'tienda', 'Tienda', 0], ['perfil', 'perfil', 'Perfil', 1], ['ajustes', 'ajustes', 'Ajustes', 0]];
  const ACTIVO = { panel: 'panel', nivel: 'panel', teoria: 'panel', reto: 'panel', biblioteca: 'biblioteca', practica: 'panel', repaso: 'panel', reintento: 'errores', examen: 'examen', errores: 'errores', lab: 'lab', ajustes: 'ajustes', perfil: 'perfil', tienda: 'tienda' };
  const INMERSIVO = new Set(['practica', 'repaso', 'reintento', 'reto']);   // pantallas de lección: sin menús, solo la lección
  let limpiar = null;

  function parseHash() {
    let hs = (location.hash || '#/panel').replace(/^#\/?/, '');
    const qi = hs.indexOf('?'); let query = {};
    if (qi >= 0) { hs.slice(qi + 1).split('&').forEach(p => { const [k, v] = p.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); hs = hs.slice(0, qi); }
    const partes = hs.split('/').filter(Boolean).map(decodeURIComponent);
    return { ruta: partes[0] || 'panel', args: partes.slice(1), query };
  }
  /** siguiente etapa por completar de la ruta (la «actual» del mapa) */
  App.siguienteEtapa = function () {
    for (const l of Tm.niveles) { if (!M.nivelDesbloqueado(l.id)) break; const e = M.etapaActual(l.id); if (!M.etapaCompleta(l.id, e)) return { n: l.id, e }; }
    return null;
  };
  function continuar() { const s = App.siguienteEtapa(); return s ? '#/practica/' + s.n + '/' + s.e : '#/panel'; }

  /** dibuja los indicadores de arriba; el que cambió de valor «salta» (clase .sube) */
  function pintarChips() {
    const c = document.getElementById('chips'); if (!c) return;
    const antes = Array.from(c.children).map(x => x.textContent); U.vaciar(c);
    App.chips().forEach((x, i) => { if (antes[i] !== undefined && antes[i] !== x.textContent) x.classList.add('sube'); c.appendChild(x); });
  }

  /** indicadores del juego (racha, monedas, vidas, nivel): arriba en todas las pantallas */
  App.chips = function () {
    const rv = M.rachaVigente(), nj = M.nivelJugador(), vd = J.vidas(), st = M.stats();
    const chip = (href, ico, valor, cls, titulo) => h('a', { class: 'chip-j ' + cls, href, title: titulo, 'aria-label': titulo }, Ico(ico, { tam: 20 }), h('b', { text: String(valor) }));
    return [
      chip('#/perfil', 'llama', rv.dias, 'llama' + (rv.hoyHecha ? ' hoy' : (rv.dias ? ' riesgo' : ' apagada')), rv.dias ? 'Racha de ' + rv.dias + ' día' + (rv.dias === 1 ? '' : 's') + (rv.hoyHecha ? '. Hoy ya practicaste.' : '. Practica hoy para mantenerla.') : 'Sin racha: practica hoy para empezarla.'),
      chip('#/tienda', 'moneda', J.monedas(), 'moneda', J.monedas() + ' monedas. Abre la Tienda.'),
      chip('#/perfil', 'corazon', vd.n, 'vida' + (vd.n === 0 ? ' sin' : ''), vd.n + ' de ' + vd.max + ' vidas (se usan en los retos de nivel).'),
      chip('#/perfil', 'rayo', st.xp, 'xp', 'Nivel ' + nj.nivel + ' · ' + st.xp + ' XP')
    ];
  };
  function pintarNav(ruta) {
    const nav = document.getElementById('nav'), inf = document.getElementById('nav-inf'); U.vaciar(nav); U.vaciar(inf);
    NAV.forEach(([k, ic, t, movil]) => {
      const act = ACTIVO[ruta] === k, atr = { href: '#/' + k, class: act ? 'act' : '', 'aria-current': act ? 'page' : null };
      nav.appendChild(h('a', atr, Ico(ic, { tam: 24 }), h('span', { text: t })));
      if (movil) inf.appendChild(h('a', atr, Ico(ic, { tam: 24 }), h('span', { text: t })));
    });
    ['marca-ic', 'marca-ic-m'].forEach(id => { const e = document.getElementById(id); if (e && !e.firstChild) e.appendChild(Ico('logo', { tam: 34 })); });
    pintarChips();
    // pie del menú lateral: nivel del jugador + botón de práctica
    const pie = document.getElementById('lateral-pie'), nj = M.nivelJugador(), st = M.stats(); U.vaciar(pie);
    pie.appendChild(h('div', { class: 'lat-nivel' }, h('div', { class: 'fila sep' }, h('strong', { text: 'Nivel ' + nj.nivel }), h('span', { class: 'peq tenue', text: st.xp + ' XP' })), ET.Vc.barra(Math.min(1, (st.xp - nj.ant) / Math.max(1, nj.sig - nj.ant))), h('div', { class: 'peq tenue', text: (nj.sig - st.xp) + ' XP para el nivel ' + (nj.nivel + 1) })));
    pie.appendChild(h('a', { class: 'btn grande lat-cta', href: continuar() }, Ico('jugar', { tam: 18 }), 'Continuar'));
  }
  App.render = function () {
    if (limpiar) { try { limpiar(); } catch (e) { } limpiar = null; }
    document.querySelectorAll('.modal-f').forEach(m => m.remove());
    const { ruta, args, query } = parseHash();
    if (ruta === 'practica' && !args.length) { location.replace(continuar()); return; }
    const host = document.getElementById('app'); U.vaciar(host);
    document.body.classList.toggle('en-leccion', INMERSIVO.has(ruta));
    pintarNav(ruta);
    try {
      let fn = null;
      switch (ruta) {
        case 'panel': fn = V.panel; break; case 'nivel': fn = V.nivel; break; case 'teoria': fn = V.teoria; break;
        case 'practica': fn = V.practica; break; case 'repaso': fn = V.repaso; break; case 'reintento': fn = V.reintento; break; case 'reto': fn = V.reto; break;
        case 'examen':
          if (!args.length) fn = V.examenHub;
          else if (args[0] === 'config') fn = (hh, a, q) => V.examenConfig(hh, a.slice(1), q);
          else if (args[0] === 'curso') fn = V.examenCurso;
          else if (args[0] === 'resultado') fn = (hh, a, q) => V.examenResultado(hh, a.slice(1), q);
          else fn = V.examenHub; break;
        case 'biblioteca': fn = V.biblioteca; break;
        case 'perfil': fn = V.perfil; break; case 'tienda': fn = V.tienda; break;
        case 'errores': fn = V.errores; break; case 'lab': fn = V.lab; break; case 'ajustes': fn = V.ajustes; break;
        default: location.replace('#/panel'); return;
      }
      const r = fn(host, args, query);
      if (typeof r === 'function') limpiar = r;
      host.classList.remove('entra'); void host.offsetWidth; host.classList.add('entra');   // transición de entrada entre pantallas
    } catch (e) {
      console.error(e);
      U.vaciar(host);
      host.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Ups, algo falló al mostrar esta pantalla' }), h('pre', { class: 'code', text: String(e && e.stack || e) }), h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/panel' }, 'Ir al mapa'))));
    }
    if (ruta !== 'examen' || args[0] !== 'curso') window.scrollTo({ top: 0 });
    // logros que se desbloquearon fuera de una lección (p. ej. al estudiar un tema o abrir el laboratorio)
    setTimeout(() => { if (ET.Vc.celebrarLogros) ET.Vc.celebrarLogros(); }, 450);
  };
  /** refresca solo los indicadores de arriba (tras ganar XP o monedas sin cambiar de pantalla) */
  App.refrescarChips = pintarChips;
  let iniciado = false;
  App.iniciar = function () {
    if (iniciado) return; iniciado = true;
    U.Store.del('ed_ia_v1');   // el lector con IA se quitó: borra cualquier clave de API que hubiera quedado guardada en este navegador
    document.documentElement.dataset.tema = M.config().tema || 'auto';
    J.iniciar();
    window.addEventListener('hashchange', App.render);
    App.render();
    if (!U.Store.persistente) setTimeout(() => ET.Vc.toast('⚠ El navegador bloquea el almacenamiento: el progreso no se guardará.', 6000), 800);
  };
  document.addEventListener('DOMContentLoaded', App.iniciar);
  if (document.readyState !== 'loading') App.iniciar();
})(typeof window !== 'undefined' ? window : globalThis);
