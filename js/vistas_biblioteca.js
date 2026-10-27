/* vistas_biblioteca.js — Biblioteca de estudio: índice, temas (10 partes), fórmulas, comparaciones, repaso, favoritos y búsqueda */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, B = ET.Biblioteca, M = ET.Motor, Vc = ET.Vc, Tm = ET.Temario, Py = ET.Py;
  const V = ET.Vistas = ET.Vistas || {};
  const ruta = id => '#/biblioteca' + (id ? '/' + id : '');
  const txt = html => h('div', { class: 'bib-txt', html: B.html(html) });
  const pctTxt = p => Math.round(p * 100) + ' %';

  /* ---------- resaltado de la búsqueda dentro de una página ---------- */
  function resaltar(raiz, q) {
    const toks = U.norm(q || '').split(' ').filter(w => w.length >= 2); if (!toks.length) return null;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT); const nodos = []; let n;
    while ((n = w.nextNode())) { if (n.parentNode && n.parentNode.closest && n.parentNode.closest('mark, button, summary, select, textarea, .cdarb')) continue; nodos.push(n); }
    let primero = null;
    nodos.forEach(t => {
      const s = t.nodeValue, nn = U.quitaAcentos(s).toLowerCase(); if (nn.length !== s.length) return;
      const rg = []; toks.forEach(tk => { let i = 0; while ((i = nn.indexOf(tk, i)) >= 0) { rg.push([i, i + tk.length]); i += tk.length; } });
      if (!rg.length) return;
      rg.sort((a, b) => a[0] - b[0]); const m = [];
      rg.forEach(r => { const l = m[m.length - 1]; if (l && r[0] <= l[1]) l[1] = Math.max(l[1], r[1]); else m.push(r.slice()); });
      const fr = document.createDocumentFragment(); let p = 0;
      m.forEach(([a, b]) => { fr.appendChild(document.createTextNode(s.slice(p, a))); const mk = h('mark', { text: s.slice(a, b) }); if (!primero) primero = mk; fr.appendChild(mk); p = b; });
      fr.appendChild(document.createTextNode(s.slice(p))); t.parentNode.replaceChild(fr, t);
    });
    return primero;
  }

  /* ---------- caja de búsqueda con resultados en vivo ---------- */
  function cajaBusqueda(valor) {
    const inp = h('input', { type: 'search', class: 'bib-q', placeholder: 'Buscar un concepto: rotación, altura negra, O(n log n)…', 'aria-label': 'Buscar en la biblioteca', autocomplete: 'off', value: valor || '' });
    const res = h('div', { class: 'bib-res oculto', role: 'list' });
    const destino = (x, q) => x.tipo === 'tema' ? ruta(x.id) + '?q=' + encodeURIComponent(q) + '&p=' + x.parte : (x.tipo === 'formula' ? ruta('formulas') + '?f=' + x.id : ruta('tablas') + '?t=' + x.id);
    const etq = { tema: 'Tema', formula: 'Fórmula', tabla: 'Tabla' };
    const pintar = () => {
      const q = inp.value.trim(); U.vaciar(res);
      if (q.length < 2) { res.classList.add('oculto'); return; }
      const r = B.buscar(q); res.classList.remove('oculto');
      if (!r.length) { res.appendChild(h('div', { class: 'peq tenue', style: { padding: '8px' }, text: 'Sin resultados para «' + q + '». Prueba con una sola palabra.' })); return; }
      r.slice(0, 14).forEach(x => res.appendChild(h('a', { class: 'bib-r', href: destino(x, q) }, h('div', { class: 'fila' }, h('strong', { text: x.titulo }), h('span', { class: 'chip', text: etq[x.tipo] + (x.parteNombre ? ' · ' + x.parteNombre : '') })), h('div', { class: 'peq tenue', text: x.frag }))));
      if (r.length > 14) res.appendChild(h('div', { class: 'peq tenue', style: { padding: '6px 8px' }, text: '+ ' + (r.length - 14) + ' resultados más: afina la búsqueda.' }));
    };
    inp.addEventListener('input', U.debounce(pintar, 140));
    inp.addEventListener('keydown', e => { if (e.key === 'Escape') { inp.value = ''; pintar(); } if (e.key === 'Enter') { const a = res.querySelector('a'); if (a) location.hash = a.getAttribute('href'); } });
    if (valor) pintar();
    return h('div', { class: 'bib-busca' }, inp, res);
  }

  /* ---------- menú lateral ---------- */
  const RAPIDOS = [['', '📚 Inicio'], ['formulas', '🧮 Fórmulas y reglas'], ['tablas', '📊 Comparaciones y complejidades'], ['repaso', '⚡ Repaso antes del examen'], ['favoritos', '★ Favoritos']];
  function lado(actual, areaActual) {
    const mq = global.matchMedia ? global.matchMedia('(max-width: 900px)') : null;
    const d = h('details', { class: 'bib-lado', open: !(mq && mq.matches) || null }, h('summary', { text: '☰ Índice y buscador' }));
    if (mq) { const f = e => { if (!d.isConnected) { mq.removeEventListener('change', f); return; } d.open = !e.matches; }; mq.addEventListener('change', f); }   // en pantallas anchas el índice siempre está abierto; en móvil, plegado
    d.appendChild(cajaBusqueda());
    d.appendChild(h('div', { class: 'bib-rap' }, RAPIDOS.map(([k, t]) => h('a', { class: 'bib-rapl' + (actual === k ? ' act' : ''), href: ruta(k), text: t }))));
    B.areas.forEach(a => {
      const ts = B.temasDeArea(a.id); if (!ts.length) return;
      const det = h('details', { class: 'bib-area', open: (a.id === areaActual) || null });
      det.style.setProperty('--ac', a.color);
      det.appendChild(h('summary', null, h('span', { class: 'bib-ico', text: a.icono }), h('span', { class: 'bib-area-t', text: a.nombre }), h('span', { class: 'bib-area-n', 'data-area': a.id })));
      ts.forEach(t => det.appendChild(h('a', { class: 'bib-t' + (t.id === actual ? ' act' : ''), 'data-id': t.id, href: ruta(t.id) }, h('span', { class: 'bib-marca' }), h('span', { text: t.titulo }))));
      d.appendChild(det);
    });
    actualizarLado(d);
    return d;
  }
  function actualizarLado(d) {
    d = d || document.querySelector('.bib-lado'); if (!d) return;
    U.$$('.bib-t', d).forEach(a => { const id = a.dataset.id; a.classList.toggle('est', B.estudiado(id)); a.classList.toggle('fav', B.favorito(id)); U.$('.bib-marca', a).textContent = B.estudiado(id) ? '✔' : (B.favorito(id) ? '★' : '·'); });
    U.$$('.bib-area-n', d).forEach(s => { const p = B.progresoArea(s.dataset.area); s.textContent = p.n + '/' + p.total; });
  }

  /* ---------- ejemplos interactivos (código ↔ árbol) y código ejecutable ---------- */
  function ejemploInteractivo(id, montados) {
    const e = ET.Ejemplos && ET.Ejemplos.porId[id]; if (!e) return null;
    const d = h('details', { class: 'bib-inter' }, h('summary', null, h('span', { text: '▶ Ejemplo interactivo: ' }), h('strong', { text: e.titulo }), h('span', { class: 'chip acento', style: { marginLeft: 'auto' }, text: 'código ↔ árbol' })));
    let hecho = false;
    d.addEventListener('toggle', () => {
      if (!d.open || hecho) return; hecho = true;
      const c = h('div', { class: 'bib-inter-c' }); d.appendChild(c);
      const dep = Vc.codigoArbol(c, { codigo: e.codigo, desc: e.desc, compacto: true, sinEjemplos: true }); montados.push(dep); dep.ejecutar();
      c.appendChild(h('div', { class: 'acciones' }, h('a', { class: 'btn sec peq', href: '#/lab/codigo?ej=' + id }, '🧪 Abrir en el laboratorio (pantalla completa)')));
    });
    return d;
  }
  function bloqueCodigo(c, montados) {
    const caja = h('div', { class: 'bib-cod' }); const src = U.dedent(c.src);
    if (c.titulo) caja.appendChild(h('div', { class: 'cod-titulo', text: c.titulo }));
    caja.appendChild(U.bloqueCodigo(src));
    if (c.nota) caja.appendChild(h('div', { class: 'peq suave', html: U.mdInline(c.nota.replace(/§/g, '`')) }));
    if (c.ejecutable === false) { caja.appendChild(h('div', { class: 'peq tenue', text: 'Este fragmento es de referencia: no se ejecuta con el intérprete del entrenador (usa funciones de la biblioteca estándar).' })); return caja; }
    const salida = h('pre', { class: 'bib-sal oculto', 'aria-label': 'Salida del programa' }); const dbg = h('div', { class: 'bib-dbg oculto' });
    let dep = null;
    const bEj = h('button', { class: 'btn sec peq', type: 'button', onclick: () => {
      const r = Py.ejecutar(src, { maxSteps: 3000000 }); salida.classList.remove('oculto');
      salida.textContent = r.ok ? (r.stdout.trim() ? r.stdout.replace(/\n$/, '') : '(el programa terminó sin imprimir nada)') : ((r.stdout || '') + '✘ ' + Py.textoError(r.error));
    } }, '▶ Ejecutar');
    const bDep = h('button', { class: 'btn sec peq', type: 'button', onclick: () => {
      if (!dep) { dbg.classList.remove('oculto'); dep = Vc.codigoArbol(dbg, { codigo: src, compacto: true, sinEjemplos: true }); montados.push(dep); dep.ejecutar(); bDep.textContent = '✖ Cerrar depurador'; }
      else { const oc = dbg.classList.toggle('oculto'); if (oc) dep.pausar(); bDep.textContent = oc ? '🔍 Depurar paso a paso' : '✖ Cerrar depurador'; }
    } }, '🔍 Depurar paso a paso');
    caja.appendChild(h('div', { class: 'fila' }, bEj, bDep));
    caja.appendChild(salida); caja.appendChild(dbg);
    return caja;
  }

  /* ---------- tema ---------- */
  function parteNodo(t, k, montados) {
    const v = t[k];
    if (k === 'codigo') { const items = Array.isArray(v) ? v : [v]; return h('div', null, items.map(c => bloqueCodigo(typeof c === 'string' ? { src: c } : c, montados))); }
    if (k === 'preguntas') {
      return h('div', { class: 'bib-pre' }, v.map((q, i) => {
        const p = Array.isArray(q) ? q[0] : q.p, r = Array.isArray(q) ? q[1] : q.r;
        return h('details', { class: 'rev' }, h('summary', null, h('span', { class: 'bib-pn', text: String(i + 1) }), h('span', { html: U.mdInline(String(p).replace(/§/g, '`')) })), h('div', { class: 'rev-c' }, txt(r)));
      }));
    }
    const nodo = txt(v);
    if (k === 'ejemplo' && t.lab && t.lab.length) {   // animaciones del Laboratorio (estructuras de datos)
      const bl = h('div', { class: 'bib-inters' }, h('h3', { text: 'Míralo animado' }), h('p', { class: 'peq suave', text: 'Animación paso a paso en el Laboratorio: cada paso muestra la explicación y la línea de código que se ejecuta.' }), h('div', { class: 'acciones' }, t.lab.map(l => h('a', { class: 'btn', href: '#/lab/' + l.tab + (l.e ? '?e=' + l.e : '') }, '▶ ' + (l.texto || 'Ver la animación')))));
      return h('div', null, nodo, bl, t.interactivo.length ? h('div', null, h('h3', { text: 'Compruébalo tú: ejemplos interactivos' }), t.interactivo.map(id => ejemploInteractivo(id, montados))) : null);
    }
    if (k === 'ejemplo' && t.interactivo.length) {
      const bl = h('div', { class: 'bib-inters' }, h('h3', { text: 'Compruébalo tú: ejemplos interactivos' }), h('p', { class: 'peq suave', text: 'El código se ejecuta de verdad; el árbol se reconstruye de esa ejecución (pausa, avanza, retrocede, mira variables y toca un nodo para ver qué líneas lo crearon).' }), t.interactivo.map(id => ejemploInteractivo(id, montados)));
      return h('div', null, nodo, bl);
    }
    return nodo;
  }
  function accionesTema(t) {
    const conc = t.conceptos, f = h('div', { class: 'bib-pract' });
    const ma = B.maestriaTema(t), er = B.erroresTema(t);
    f.appendChild(h('h3', { text: '🎯 Practica este tema' }));
    f.appendChild(h('div', { class: 'peq suave', text: conc.length ? 'Conceptos evaluados: ' + conc.map(c => (Tm.conceptos[c] || { nombre: c }).nombre).join(' · ') : 'Este tema es de apoyo y no tiene ejercicios propios; el resto de la biblioteca sí.' }));
    if (ma !== null) f.appendChild(h('div', { class: 'fila-tema', style: { gridTemplateColumns: '150px 1fr 50px' } }, h('span', { class: 'peq', text: 'Dominio en práctica' }), Vc.barra(ma), h('b', { text: pctTxt(ma) })));
    const ac = h('div', { class: 'acciones' });
    if (conc.length) ac.append(h('a', { class: 'btn', href: '#/repaso?foco=' + encodeURIComponent(conc.join(',')) }, '🧭 Práctica guiada de este tema'), h('a', { class: 'btn sec', href: '#/examen/config/tema-' + t.id }, '⏱ Examen de este tema'), h('a', { class: 'btn sec', href: '#/examen/config/quiz?temas=' + encodeURIComponent(t.id) }, '🎯 Quiz a mi medida'));
    if (er) ac.append(h('a', { class: 'btn sec', href: '#/errores?tema=' + t.id }, '📝 Mis errores aquí (' + er + ')'));
    if (['bs', 'av', 'rn'].includes(t.area)) ac.append(h('a', { class: 'btn sec', href: '#/lab/taller' }, '✋ Taller interactivo'), h('a', { class: 'btn sec', href: '#/lab/arboles' }, '🌳 Visualizador'));
    if (['ar', 'tv'].includes(t.area)) ac.append(h('a', { class: 'btn sec', href: '#/lab/arboles' }, '🌳 Visualizador'));
    (t.lab || []).forEach(l => ac.append(h('a', { class: 'btn sec', href: '#/lab/' + l.tab + (l.e ? '?e=' + l.e : '') }, '▶ ' + (l.texto || 'Animación'))));
    ac.append(h('a', { class: 'btn sec', href: '#/lab/consola' }, '⌨ Editor de código'));
    f.appendChild(ac);
    return f;
  }
  function vistaTema(main, t, query, montados) {
    const a = B.areaPorId[t.area];
    main.appendChild(h('div', { class: 'fila bib-mig' }, h('a', { class: 'btn fantasma peq', href: ruta() }, '← Biblioteca'), h('span', { class: 'tenue', text: '›' }), h('a', { class: 'btn fantasma peq', href: ruta('area/' + a.id) }, a.icono + ' ' + a.nombre)));
    const bEst = h('button', { class: 'btn peq', type: 'button' }), bFav = h('button', { class: 'btn sec peq', type: 'button' });
    const pintaBotones = () => { const e = B.estudiado(t.id); bEst.textContent = e ? '✔ Estudiado' : '☐ Marcar como estudiado'; bEst.className = 'btn peq' + (e ? ' ok' : ' sec'); bFav.textContent = B.favorito(t.id) ? '★ En favoritos' : '☆ Favorito'; };
    bEst.addEventListener('click', () => { M.bibMarcar(t.id, !B.estudiado(t.id)); pintaBotones(); actualizarLado(); });
    bFav.addEventListener('click', () => { M.bibFavorito(t.id, !B.favorito(t.id)); pintaBotones(); actualizarLado(); });
    pintaBotones();
    const cab = h('header', { class: 'bib-cab card' });
    cab.style.setProperty('--ac', a.color);
    cab.append(h('div', { class: 'fila' }, h('span', { class: 'chip acento', text: a.icono + ' ' + a.nombre }), h('span', { class: 'chip', text: 'Fuente: ' + t.fuente }), t.comp ? h('span', { class: 'chip comp', text: 'Incluye contenido complementario' }) : null, t.nivel ? h('span', { class: 'chip', text: 'Nivel ' + t.nivel }) : null),
      h('h1', { text: t.titulo }), h('div', { class: 'acciones' }, bEst, bFav, h('button', { class: 'btn fantasma peq', type: 'button', onclick: () => global.print() }, '🖨 Imprimir')));
    const nav = h('div', { class: 'bib-partes', role: 'navigation', 'aria-label': 'Partes del tema' }, B.PARTES.map(([k, n, ic], i) => h('a', { href: 'javascript:void(0)', class: 'bib-pl', onclick: e => { e.preventDefault(); const el = document.getElementById('p-' + k); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, h('b', { text: String(i + 1) }), h('span', { text: n }))));
    cab.appendChild(nav); main.appendChild(cab);
    B.PARTES.forEach(([k, n, ic], i) => {
      const sec = h('section', { class: 'bib-parte p-' + k, id: 'p-' + k });
      sec.appendChild(h('h2', null, h('span', { class: 'bib-num', text: String(i + 1) }), h('span', { text: n }), h('span', { class: 'bib-ic', text: ic })));
      sec.appendChild(parteNodo(t, k, montados));
      main.appendChild(sec);
    });
    main.appendChild(accionesTema(t));
    const v = B.vecinos(t.id);
    main.appendChild(h('div', { class: 'bib-pie' },
      v.ant ? h('a', { class: 'btn sec', href: ruta(v.ant.id) }, '← ' + v.ant.titulo) : h('span'),
      h('button', { class: 'btn' + (B.estudiado(t.id) ? ' ok' : ''), type: 'button', onclick: e => { M.bibMarcar(t.id, true); pintaBotones(); actualizarLado(); e.target.className = 'btn ok'; e.target.textContent = '✔ Estudiado'; if (v.sig) setTimeout(() => { location.hash = ruta(v.sig.id); }, 350); } }, B.estudiado(t.id) ? '✔ Estudiado' : '✔ Terminé este tema' + (v.sig ? ' y seguir →' : '')),
      v.sig ? h('a', { class: 'btn sec', href: ruta(v.sig.id) }, v.sig.titulo + ' →') : h('span')));
    M.bibUltimo(t.id);
    if (query.q || query.p) setTimeout(() => {
      const mk = query.q ? resaltar(main, query.q) : null; const el = query.p && document.getElementById('p-' + query.p);
      (mk || el) && (mk || el).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  }

  /* ---------- índice, área, favoritos ---------- */
  function tarjetaArea(a) {
    const p = B.progresoArea(a.id), ts = B.temasDeArea(a.id);
    const c = h('section', { class: 'card bib-ac' }); c.style.setProperty('--ac', a.color);
    c.appendChild(h('div', { class: 'fila sep' }, h('div', { class: 'fila' }, h('span', { class: 'bib-ico gde', text: a.icono }), h('div', null, h('div', { class: 'peq tenue', text: 'Fuente: ' + a.fuente }), h('h3', { style: { margin: 0 } }, h('a', { href: ruta('area/' + a.id), text: a.nombre })))), h('span', { class: 'chip', text: p.n + ' / ' + p.total + ' estudiados' })));
    c.appendChild(h('p', { class: 'peq suave', text: a.desc })); c.appendChild(Vc.barra(p.p));
    c.appendChild(h('ul', { class: 'bib-lista' }, ts.map(t => h('li', null, h('a', { href: ruta(t.id), class: B.estudiado(t.id) ? 'est' : '' }, (B.estudiado(t.id) ? '✔ ' : '') + t.titulo), t.comp ? h('span', { class: 'chip comp', text: 'compl.' }) : null))));
    return c;
  }
  function vistaInicio(main) {
    const g = B.progresoGlobal(), sig = B.siguientePendiente();
    main.appendChild(h('h1', { text: '📚 Biblioteca de estudio' }));
    main.appendChild(h('p', { class: 'suave', text: 'Teoría completa del curso, escrita dentro de la aplicación a partir de todas las diapositivas: ' + B.ordenados().length + ' temas en ' + B.areas.length + ' áreas, cada uno con las mismas diez partes (definición, intuición, teoría formal, procedimiento, código, ejemplo resuelto, complejidad, errores, preguntas de examen y resumen). Lo que no está en los PDF aparece marcado como contenido complementario.' }));
    const top = h('div', { class: 'card bib-hero' }, h('div', { class: 'fila sep' }, h('div', null, h('strong', { text: 'Tu avance: ' + g.n + ' de ' + g.total + ' temas estudiados' }), Vc.barra(g.p)), sig ? h('a', { class: 'btn', href: ruta(sig.id) }, (g.n ? '▶ Continuar: ' : '▶ Empezar: ') + sig.titulo) : h('span', { class: 'chip ok', text: '🏁 ¡Biblioteca completa!' })));
    main.appendChild(top);
    main.appendChild(h('div', { class: 'grid g4 bib-acc' }, [['formulas', '🧮', 'Fórmulas, reglas y condiciones', B.formulas.length + ' fórmulas con variables y ejemplo'], ['tablas', '📊', 'Comparaciones y complejidades', B.tablas.length + ' tablas (BST/AVL, pre/in/post, tiempos y espacios…)'], ['repaso', '⚡', 'Repaso antes del examen', 'Todo lo esencial en una sola vista'], ['favoritos', '★', 'Mis favoritos', Object.keys(B.estado().favoritos).length + ' guardados']].map(([k, ic, t, d]) => h('a', { class: 'modo', href: ruta(k) }, h('h3', null, h('span', { class: 'ic', text: ic }), t), h('p', { class: 'peq suave', text: d })))));
    main.appendChild(h('h2', { class: 'espacio', text: 'Las ' + B.areas.length + ' áreas' }));
    main.appendChild(h('div', { class: 'bib-areas' }, B.areas.map(tarjetaArea)));
  }
  function vistaArea(main, a) {
    const ts = B.temasDeArea(a.id), p = B.progresoArea(a.id), conc = B.conceptosDeArea(a.id);
    main.appendChild(h('div', { class: 'fila bib-mig' }, h('a', { class: 'btn fantasma peq', href: ruta() }, '← Biblioteca')));
    const cab = h('div', { class: 'card bib-cab' }); cab.style.setProperty('--ac', a.color);
    cab.append(h('div', { class: 'fila' }, h('span', { class: 'chip acento', text: 'Fuente: ' + a.fuente })), h('h1', { text: a.icono + ' ' + a.nombre }), h('p', { class: 'suave', text: a.desc }), Vc.barra(p.p), h('div', { class: 'peq tenue', text: p.n + ' de ' + p.total + ' temas estudiados' }));
    const ac = h('div', { class: 'acciones' });
    if (conc.length) ac.append(h('a', { class: 'btn', href: '#/repaso?foco=' + encodeURIComponent(conc.join(',')) }, '🧭 Práctica guiada del área'), h('a', { class: 'btn sec', href: '#/examen/config/area-' + a.id }, '⏱ Examen del área'), h('a', { class: 'btn sec', href: '#/examen/config/quiz?areas=' + encodeURIComponent(a.id) }, '🎯 Quiz a mi medida'));
    cab.appendChild(ac); main.appendChild(cab);
    ts.forEach((t, i) => main.appendChild(h('div', { class: 'card bib-fila' }, h('div', null, h('div', { class: 'peq tenue', text: 'Tema ' + (i + 1) + ' · ' + t.fuente }), h('h3', { style: { margin: '2px 0' } }, h('a', { href: ruta(t.id), text: t.titulo })), t.comp ? h('span', { class: 'chip comp', text: 'incluye contenido complementario' }) : null), h('div', { class: 'fila' }, B.estudiado(t.id) ? h('span', { class: 'chip ok', text: '✔ estudiado' }) : null, B.favorito(t.id) ? h('span', { class: 'chip', text: '★' }) : null, h('a', { class: 'btn sec peq', href: ruta(t.id) }, 'Abrir')))));
  }
  function vistaFavoritos(main) {
    main.appendChild(h('h1', { text: '★ Favoritos' }));
    const fav = B.estado().favoritos; const ids = Object.keys(fav).sort((a, b) => fav[b] - fav[a]);
    if (!ids.length) { main.appendChild(Vc.vacio('☆', 'Aún no tienes favoritos', 'Pulsa «☆ Favorito» en un tema (o en una fórmula) para tenerlo aquí a mano antes del examen.')); return; }
    const tem = ids.filter(i => B.porId[i]), fos = ids.filter(i => /^f:/.test(i)).map(i => B.formulas.find(f => f.id === i.slice(2))).filter(Boolean);
    if (tem.length) { main.appendChild(h('h2', { text: 'Temas' })); tem.forEach(id => { const t = B.porId[id]; main.appendChild(h('div', { class: 'card bib-fila' }, h('div', null, h('div', { class: 'peq tenue', text: B.areaPorId[t.area].nombre }), h('h3', { style: { margin: '2px 0' } }, h('a', { href: ruta(id), text: t.titulo }))), h('a', { class: 'btn sec peq', href: ruta(id) }, 'Abrir'))); }); }
    if (fos.length) { main.appendChild(h('h2', { class: 'espacio', text: 'Fórmulas' })); fos.forEach(f => main.appendChild(tarjetaFormula(f))); }
  }

  /* ---------- fórmulas, tablas, repaso ---------- */
  function tarjetaFormula(f) {
    const k = 'f:' + f.id; const c = h('article', { class: 'card bib-fo', id: 'f-' + f.id });
    const bf = h('button', { class: 'btn fantasma peq', type: 'button', title: 'Favorito', onclick: () => { M.bibFavorito(k, !B.favorito(k)); bf.textContent = B.favorito(k) ? '★' : '☆'; } }, B.favorito(k) ? '★' : '☆');
    const t = f.tema && B.porId[f.tema];
    c.appendChild(h('div', { class: 'fila sep' }, h('h3', { style: { margin: 0 }, text: f.nombre }), h('div', { class: 'fila' }, t ? h('a', { class: 'btn sec peq', href: ruta(t.id) }, '📖 ' + t.titulo) : null, bf)));
    c.appendChild(h('div', { class: 'bib-fo-f', html: B.html('§' + f.formula + '§') }));
    const fila = (n, v) => v ? h('div', { class: 'bib-fo-r' }, h('b', { text: n }), h('div', { html: B.html(Array.isArray(v) ? v.map(x => '- ' + x).join('\n') : v) })) : null;
    c.append(fila('Variables', f.variables), fila('Cuándo se usa', f.cuando), fila('Ejemplo', f.ejemplo), fila('Condiciones y ojo con…', f.condiciones));
    return c;
  }
  function vistaFormulas(main, query) {
    main.appendChild(h('h1', { text: '🧮 Fórmulas, reglas y condiciones que debo recordar' }));
    main.appendChild(h('p', { class: 'suave', text: 'Cada fórmula o regla indica sus variables, cuándo se usa, un ejemplo y las condiciones que tienen que cumplirse. Convenciones del curso: la altura se mide en aristas (hoja = 0, árbol vacío = −1); «la complejidad de X» sin más es el peor caso.' }));
    let area = query.a || ''; const lista = h('div'); const filtro = h('input', { type: 'search', class: 'bib-q', placeholder: 'Filtrar fórmulas…', 'aria-label': 'Filtrar fórmulas' });
    const chips = h('div', { class: 'fila bib-chips' });
    const pintar = () => {
      U.vaciar(lista); const q = U.norm(filtro.value);
      let n = 0;
      B.areas.forEach(a => {
        if (area && area !== a.id) return;
        const fs = B.formulas.filter(f => f.area === a.id && (!q || U.norm([f.nombre, f.formula, f.variables, f.cuando, f.ejemplo, f.condiciones].map(B.plano).join(' ')).includes(q)));
        if (!fs.length) return; n += fs.length;
        lista.appendChild(h('h2', { class: 'espacio', text: a.icono + ' ' + a.nombre })); fs.forEach(f => lista.appendChild(tarjetaFormula(f)));
      });
      if (!n) lista.appendChild(Vc.vacio('🔎', 'Sin resultados', 'Prueba con otra palabra o quita el filtro de área.'));
    };
    [['', 'Todas']].concat(B.areas.filter(a => B.formulas.some(f => f.area === a.id)).map(a => [a.id, a.icono + ' ' + a.nombre])).forEach(([k, t]) => { const b = h('button', { type: 'button', class: 'tab' + (k === area ? ' act' : ''), onclick: () => { area = k; U.$$('.tab', chips).forEach(x => x.classList.remove('act')); b.classList.add('act'); pintar(); } }, t); chips.appendChild(b); });
    filtro.addEventListener('input', U.debounce(pintar, 120));
    main.append(filtro, chips, lista); pintar();
    if (query.f) setTimeout(() => { const el = document.getElementById('f-' + query.f); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('bib-flash'); } }, 80);
  }
  function vistaTablas(main, query) {
    main.appendChild(h('h1', { text: '📊 Comparaciones y complejidades' }));
    main.appendChild(h('p', { class: 'suave', text: 'Tablas para comparar de un vistazo. Las celdas marcadas «compl.» o las notas «complementario» no vienen de los PDF.' }));
    main.appendChild(h('div', { class: 'fila bib-chips' }, B.tablas.map(tb => h('a', { class: 'tab', href: 'javascript:void(0)', onclick: e => { e.preventDefault(); const el = document.getElementById('t-' + tb.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, tb.titulo))));
    B.tablas.forEach(tb => {
      const c = h('section', { class: 'card bib-tb', id: 't-' + tb.id }, h('h2', { text: tb.titulo }), h('div', { class: 'bib-tabla', html: B.html(tb.md) }));
      if (tb.nota) c.appendChild(h('div', { class: 'peq suave', html: B.html(tb.nota) }));
      const ts = (tb.temas || []).map(i => B.porId[i]).filter(Boolean);
      c.appendChild(h('div', { class: 'fila peq', style: { marginTop: '8px' } }, h('span', { class: 'tenue', text: 'Fuente: ' + (tb.fuente || '—') }), ts.map(t => h('a', { class: 'btn sec peq', href: ruta(t.id) }, '📖 ' + t.titulo))));
      main.appendChild(c);
    });
    if (query.t) setTimeout(() => { const el = document.getElementById('t-' + query.t); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('bib-flash'); } }, 80);
  }
  function vistaRepaso(main) {
    main.appendChild(h('div', { class: 'fila sep' }, h('h1', { style: { margin: 0 }, text: '⚡ Repaso antes del examen' }), h('button', { class: 'btn sec peq', type: 'button', onclick: () => global.print() }, '🖨 Imprimir')));
    main.appendChild(h('p', { class: 'suave', text: 'Lo esencial en una sola vista: definiciones, propiedades, complejidades, confusiones típicas, pasos de los ejercicios más comunes, casos especiales y preguntas de autoevaluación. Para el detalle, abre el tema correspondiente.' }));
    main.appendChild(h('div', { class: 'fila bib-chips' }, B.repaso.map(s => h('a', { class: 'tab', href: 'javascript:void(0)', onclick: e => { e.preventDefault(); const el = document.getElementById('r-' + s.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, s.icono + ' ' + s.titulo)), h('a', { class: 'tab', href: 'javascript:void(0)', onclick: e => { e.preventDefault(); const el = document.getElementById('r-auto'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, '❓ Autoevaluación')));
    B.repaso.forEach(s => main.appendChild(h('section', { class: 'card bib-rep', id: 'r-' + s.id }, h('h2', { text: s.icono + ' ' + s.titulo }), txt(s.md))));
    const au = h('section', { class: 'card bib-rep', id: 'r-auto' }, h('div', { class: 'fila sep' }, h('h2', { style: { margin: 0 }, text: '❓ Autoevaluación' }), h('button', { class: 'btn peq', type: 'button', onclick: () => { const q = B.autoeval[Math.floor(Math.random() * B.autoeval.length)]; if (!q) return; U.vaciar(azar); azar.appendChild(h('details', { class: 'rev', open: null }, h('summary', null, h('span', { class: 'chip', text: B.areaPorId[q.area].nombre }), h('span', { html: U.mdInline(q.p.replace(/§/g, '`')) })), h('div', { class: 'rev-c' }, txt(q.r)))); } }, '🎲 Pregunta al azar')));
    const azar = h('div', { class: 'espacio' }); au.appendChild(azar);
    B.areas.forEach(a => {
      const qs = B.autoeval.filter(x => x.area === a.id); if (!qs.length) return;
      au.appendChild(h('h3', { class: 'espacio', text: a.icono + ' ' + a.nombre }));
      qs.forEach(q => au.appendChild(h('details', { class: 'rev' }, h('summary', { html: U.mdInline(q.p.replace(/§/g, '`')) }), h('div', { class: 'rev-c' }, txt(q.r)))));
    });
    main.appendChild(au);
  }

  /* ---------- punto de entrada de la ruta #/biblioteca ---------- */
  V.biblioteca = function (host, args, query) {
    query = query || {}; const sub = args[0] || ''; const montados = [];
    const t = B.porId[sub];
    const a = sub === 'area' ? B.areaPorId[args[1]] : null;
    const raiz = h('div', { class: 'bib' }), main = h('div', { class: 'bib-main' });
    raiz.appendChild(lado(t ? t.id : sub, t ? t.area : (a ? a.id : null))); raiz.appendChild(main); host.appendChild(raiz);
    if (t) vistaTema(main, t, query, montados);
    else if (a) vistaArea(main, a);
    else if (sub === 'formulas') vistaFormulas(main, query);
    else if (sub === 'tablas') vistaTablas(main, query);
    else if (sub === 'repaso') vistaRepaso(main);
    else if (sub === 'favoritos') vistaFavoritos(main);
    else if (sub === '' || sub === 'inicio') vistaInicio(main);
    else { main.appendChild(Vc.vacio('🔎', 'Ese tema no existe', 'Vuelve al índice de la biblioteca.', h('a', { class: 'btn', href: ruta() }, 'Ir al índice'))); }
    return () => montados.forEach(d => { try { d.destruir(); } catch (e) { } });
  };
})(typeof window !== 'undefined' ? window : globalThis);
