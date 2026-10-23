/* app.js — enrutador por hash, navegación y arranque */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, M = ET.Motor, V = ET.Vistas, Tm = ET.Temario;
  const App = ET.App = {};
  const NAV = [['panel', '🏠', 'Panel'], ['biblioteca', '📚', 'Biblioteca'], ['practica', '🧭', 'Práctica'], ['examen', '⏱', 'Examen'], ['errores', '📝', 'Errores'], ['lab', '🧪', 'Lab'], ['ajustes', '⚙', 'Ajustes']];
  const ACTIVO = { panel: 'panel', nivel: 'panel', teoria: 'panel', biblioteca: 'biblioteca', practica: 'practica', repaso: 'practica', reintento: 'errores', examen: 'examen', errores: 'errores', lab: 'lab', ajustes: 'ajustes' };
  let limpiar = null;

  function parseHash() {
    let hs = (location.hash || '#/panel').replace(/^#\/?/, '');
    const qi = hs.indexOf('?'); let query = {};
    if (qi >= 0) { hs.slice(qi + 1).split('&').forEach(p => { const [k, v] = p.split('='); if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || ''); }); hs = hs.slice(0, qi); }
    const partes = hs.split('/').filter(Boolean).map(decodeURIComponent);
    return { ruta: partes[0] || 'panel', args: partes.slice(1), query };
  }
  function pintarNav(ruta) {
    const nav = document.getElementById('nav'); U.vaciar(nav);
    NAV.forEach(([k, ic, t]) => nav.appendChild(h('a', { href: k === 'practica' ? '#/practica' : '#/' + k, class: ACTIVO[ruta] === k ? 'act' : '', 'aria-current': ACTIVO[ruta] === k ? 'page' : null }, h('span', { class: 'ic', text: ic }), h('span', { text: t }))));
    const nj = M.nivelJugador(); const st = M.stats();
    document.getElementById('xp-pill').textContent = '⭐ Nv ' + nj.nivel + ' · ' + st.xp + ' XP';
  }
  function continuar() {
    for (const l of Tm.niveles) { if (!M.nivelDesbloqueado(l.id)) break; const e = M.etapaActual(l.id); if (!M.etapaCompleta(l.id, e)) return '#/practica/' + l.id + '/' + e; }
    return '#/panel';
  }
  App.render = function () {
    if (limpiar) { try { limpiar(); } catch (e) { } limpiar = null; }
    document.querySelectorAll('.modal-f').forEach(m => m.remove());
    const { ruta, args, query } = parseHash();
    if (ruta === 'practica' && !args.length) { location.replace(continuar()); return; }
    const host = document.getElementById('app'); U.vaciar(host);
    pintarNav(ruta);
    try {
      let fn = null;
      switch (ruta) {
        case 'panel': fn = V.panel; break; case 'nivel': fn = V.nivel; break; case 'teoria': fn = V.teoria; break;
        case 'practica': fn = V.practica; break; case 'repaso': fn = V.repaso; break; case 'reintento': fn = V.reintento; break;
        case 'examen':
          if (!args.length) fn = V.examenHub;
          else if (args[0] === 'config') fn = (hh, a, q) => V.examenConfig(hh, a.slice(1), q);
          else if (args[0] === 'curso') fn = V.examenCurso;
          else if (args[0] === 'resultado') fn = (hh, a, q) => V.examenResultado(hh, a.slice(1), q);
          else fn = V.examenHub; break;
        case 'biblioteca': fn = V.biblioteca; break;
        case 'errores': fn = V.errores; break; case 'lab': fn = V.lab; break; case 'ajustes': fn = V.ajustes; break;
        default: location.replace('#/panel'); return;
      }
      const r = fn(host, args, query);
      if (typeof r === 'function') limpiar = r;
    } catch (e) {
      console.error(e);
      U.vaciar(host);
      host.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Ups, algo falló al mostrar esta pantalla' }), h('pre', { class: 'code', text: String(e && e.stack || e) }), h('div', { class: 'acciones' }, h('a', { class: 'btn', href: '#/panel' }, 'Ir al panel'))));
    }
    if (ruta !== 'examen' || args[0] !== 'curso') window.scrollTo({ top: 0 });
  };
  let iniciado = false;
  App.iniciar = function () {
    if (iniciado) return; iniciado = true;
    U.Store.del('ed_ia_v1');   // el lector con IA se quitó: borra cualquier clave de API que hubiera quedado guardada en este navegador
    document.documentElement.dataset.tema = M.config().tema || 'auto';
    window.addEventListener('hashchange', App.render);
    App.render();
    if (!U.Store.persistente) setTimeout(() => ET.Vc.toast('⚠ El navegador bloquea el almacenamiento: el progreso no se guardará.', 6000), 800);
  };
  document.addEventListener('DOMContentLoaded', App.iniciar);
  if (document.readyState !== 'loading') App.iniciar();
})(typeof window !== 'undefined' ? window : globalThis);
