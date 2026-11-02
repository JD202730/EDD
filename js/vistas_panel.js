/* vistas_panel.js — detalle de un nivel y teoría (la pantalla principal, el mapa, está en vistas_mapa.js) */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, md = U.md;
  const V = ET.Vistas = ET.Vistas || {};
  const pct = x => (x === null || x === undefined) ? '—' : Math.round(x * 100) + ' %';

  /** laboratorio animado de cada nivel de estructuras: [pestaña del lab, texto] */
  const LAB_NIVEL = { 7: ['rn', 'árbol rojo-negro'], 9: ['memoria', 'memoria y referencias'], 10: ['arreglos', 'arreglos y técnicas'], 11: ['pilas', 'pilas y colas'], 12: ['listas', 'listas enlazadas'], 13: ['heap', 'heaps'] };
  V.LAB_NIVEL = LAB_NIVEL;   // el mapa de aprendizaje enlaza el laboratorio de cada nivel
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
    host.appendChild(h('div', { class: 'acciones' }, h('a', { class: 'btn sec', href: '#/examen/config/nivel-' + n }, '⏱ Examen de este nivel'), h('a', { class: 'btn sec', href: '#/teoria/' + n }, '📖 Teoría completa'), (ET.Biblioteca ? ET.Biblioteca.areas.filter(x => x.nivel === n && ET.Biblioteca.temasDeArea(x.id).length).map(a => h('a', { class: 'btn sec', href: '#/biblioteca/area/' + a.id }, '📚 Biblioteca: ' + a.nombre)) : null), (n === 6 || n === 7) ? h('a', { class: 'btn sec', href: '#/lab/taller' }, '✋ Taller interactivo (mover nodos)') : null, LAB_NIVEL[n] ? h('a', { class: 'btn sec', href: '#/lab/' + LAB_NIVEL[n][0] }, '🧪 Laboratorio animado: ' + LAB_NIVEL[n][1]) : null, h('a', { class: 'btn sec', href: '#/examen/config/quiz?areas=' + encodeURIComponent((ET.Biblioteca ? ET.Biblioteca.areas.filter(x => x.nivel === n).map(x => x.id) : []).join(',')) }, '🎯 Quiz a mi medida')));
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
