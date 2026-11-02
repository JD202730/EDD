/* ui.js — identidad visual del entrenador: íconos SVG propios (ET.Ico), la mascota «Nodo» y los efectos de celebración (ET.Fx).
   Todo es vectorial y no depende de nada externo. Los colores salen de las variables CSS (--llama, --moneda, --vida, --xp…), así que siguen el tema claro/oscuro. */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const NS = 'http://www.w3.org/2000/svg';
  const s = (tag, attrs, hijos) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (hijos || []).forEach(h => e.appendChild(h)); return e; };
  const p = (d, extra) => s('path', Object.assign({ d }, extra || {}));
  const estrella = (cx, cy, R, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ' ' + (cy + rr * Math.sin(a)).toFixed(2); } return d + 'Z'; };

  /* ---------- íconos ---------- */
  // trazo: íconos de navegación y de interfaz (24×24, trazo redondeado). relleno: íconos del juego (con color propio).
  const TRAZO = {
    mapa: () => [p('M6.5 17.5C6.5 11 17.5 13 17.5 6.5'), s('circle', { cx: 6.5, cy: 18, r: 2.6 }), s('circle', { cx: 17.5, cy: 6, r: 2.6 })],
    libro: () => [p('M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5z'), p('M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5z')],
    lab: () => [p('M9.5 3h5M10.5 3v6.2L5.2 18a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3L13.5 9.2V3'), p('M8 14.5h8')],
    examen: () => [s('circle', { cx: 12, cy: 13.5, r: 7.5 }), p('M12 13.5V9.5M9.5 2.5h5M18.4 5.6l1.4 1.4')],
    errores: () => [p('M6 3.5h12v17H6z'), p('M9 8h6M9 12h6M9 16h3.5')],
    perfil: () => [s('circle', { cx: 12, cy: 8, r: 3.8 }), p('M4.5 20.5c.6-4 3.6-6.2 7.5-6.2s6.9 2.2 7.5 6.2')],
    tienda: () => [p('M5 8h14l-1.1 12H6.1z'), p('M9 8V6.5a3 3 0 0 1 6 0V8')],
    ajustes: () => [p('M4 7h9M17 7h3M4 17h3M11 17h9'), s('circle', { cx: 15, cy: 7, r: 2 }), s('circle', { cx: 9, cy: 17, r: 2 })],
    candado: () => [s('rect', { x: 5, y: 10.5, width: 14, height: 10, rx: 2.5 }), p('M8 10.5V8a4 4 0 0 1 8 0v2.5')],
    check: () => [p('M5 12.8l4.4 4.4L19 7.6', { 'stroke-width': 3 })],
    cerrar: () => [p('M6 6l12 12M18 6L6 18', { 'stroke-width': 2.6 })],
    flecha: () => [p('M5 12h14M13 6l6 6-6 6')],
    atras: () => [p('M19 12H5M11 6l-6 6 6 6')],
    jugar: () => [p('M8 5.5v13l11-6.5z', { fill: 'currentColor' })],
    trofeo: () => [p('M7.5 4h9v5.2a4.5 4.5 0 0 1-9 0z'), p('M7.5 6H4.5v1.6A3 3 0 0 0 7.5 10.6M16.5 6h3v1.6a3 3 0 0 1-3 3'), p('M12 13.7V17M8.5 20.5h7M10 17h4')],
    cofre: () => [p('M4 11V9.5A4.5 4.5 0 0 1 8.5 5h7A4.5 4.5 0 0 1 20 9.5V11'), s('rect', { x: 4, y: 11, width: 16, height: 9, rx: 1.8 }), s('rect', { x: 10.4, y: 12.4, width: 3.2, height: 3.6, rx: .8 })],
    pista: () => [p('M9 18.5h6M10 21h4'), p('M12 3a6 6 0 0 0-3.4 10.9c.5.4.9 1 .9 1.6v.5h5v-.5c0-.6.4-1.2.9-1.6A6 6 0 0 0 12 3z')],
    reloj: () => [s('circle', { cx: 12, cy: 12, r: 9 }), p('M12 7v5l3.5 2')],
    mas: () => [p('M12 5v14M5 12h14', { 'stroke-width': 2.6 })],
    enlace: () => [p('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1')],
    fuego: () => [p('M12 3c.6 3.2 5 5 5 10a5 5 0 0 1-10 0c0-2 .8-3.3 1.8-4.3.2 1.6 1 2.4 2 2.6C10.4 8.2 11 5.6 12 3z')],
    rayoT: () => [p('M13 2.5 5.5 13.5h5.8l-.9 8L18.5 10.5h-5.8z')],
    estrella: () => [p(estrella(12, 12.5, 9, 4), { 'stroke-linejoin': 'round' })]
  };
  const RELLENO = {
    llama: () => [p('M12 1.8c.7 3.6 5.9 5.6 5.9 11.4A5.9 5.9 0 0 1 6.1 13.2c0-2.3 1-3.9 2.3-5 .1 1.9 1 2.9 2.1 3.2C10 8.2 10.9 5 12 1.8z', { fill: 'var(--llama)' }), p('M12 22a3.2 3.2 0 0 1-3.2-3.3c0-1.8 1.4-2.6 2.1-4.1.5 1 2 1.3 3 2.4a3.4 3.4 0 0 1 1.3 2.7A3.2 3.2 0 0 1 12 22z', { fill: 'var(--llama-claro)' })],
    corazon: () => [p('M12 21.4s-8.4-5.3-8.4-11.5A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 8.4 2.7c0 6.2-8.4 11.5-8.4 11.5z', { fill: 'var(--vida)' }), p('M7.2 9.6a2 2 0 0 1 2-1.7', { fill: 'none', stroke: 'rgba(255,255,255,.55)', 'stroke-width': 1.6, 'stroke-linecap': 'round' })],
    corazonVacio: () => [p('M12 21.4s-8.4-5.3-8.4-11.5A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 8.4 2.7c0 6.2-8.4 11.5-8.4 11.5z', { fill: 'none', stroke: 'var(--borde-fuerte)', 'stroke-width': 2, 'stroke-dasharray': '3 3' })],
    moneda: () => [s('circle', { cx: 12, cy: 12, r: 10, fill: 'var(--moneda)' }), s('circle', { cx: 12, cy: 12, r: 6.6, fill: 'none', stroke: 'var(--moneda-oscuro)', 'stroke-width': 1.8 }), p('M12 8.6v6.8M9.4 12h5.2', { stroke: 'var(--moneda-oscuro)', 'stroke-width': 1.8, 'stroke-linecap': 'round', fill: 'none' })],
    rayo: () => [p('M13.4 1.8 4.6 13.5h6l-1.2 8.7 9-12.2h-6.2z', { fill: 'var(--xp)', 'stroke-linejoin': 'round' })],
    estrellaLlena: () => [p(estrella(12, 12.5, 10, 4.4), { fill: 'var(--moneda)', stroke: 'var(--moneda-oscuro)', 'stroke-width': 1.2, 'stroke-linejoin': 'round' })],
    escudo: () => [p('M12 2.5 4.5 5.4v6c0 4.8 3.1 8.2 7.5 10.1 4.4-1.9 7.5-5.3 7.5-10.1v-6z', { fill: 'var(--xp)' }), p('M8.6 12.2l2.5 2.5 4.4-4.9', { fill: 'none', stroke: '#fff', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })],
    logo: () => [s('rect', { x: 1, y: 1, width: 22, height: 22, rx: 6.5, fill: 'url(#etg)' }), p('M12 8.4 7.6 15.4M12 8.4l4.4 7', { stroke: '#fff', 'stroke-width': 1.7, 'stroke-linecap': 'round', fill: 'none' }), s('circle', { cx: 12, cy: 7.4, r: 2.6, fill: '#fff' }), s('circle', { cx: 7, cy: 16.6, r: 2.6, fill: '#fff' }), s('circle', { cx: 17, cy: 16.6, r: 2.6, fill: '#fff' })]
  };
  /** ET.Ico('mapa', {tam: 22, cls: '…', titulo: '…'}) → <svg> */
  const Ico = ET.Ico = function (nombre, o) {
    o = o || {}; const tam = o.tam || 22, relleno = !!RELLENO[nombre], def = (relleno ? RELLENO : TRAZO)[nombre];
    const svg = s('svg', Object.assign({ viewBox: '0 0 24 24', width: tam, height: tam, class: 'ico ico-' + nombre + (o.cls ? ' ' + o.cls : ''), focusable: 'false' }, relleno ? {} : { fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    if (o.titulo) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', o.titulo); } else svg.setAttribute('aria-hidden', 'true');
    if (nombre === 'logo') svg.appendChild(s('defs', {}, [s('linearGradient', { id: 'etg', x1: 0, y1: 0, x2: 1, y2: 1 }, [s('stop', { offset: 0, style: 'stop-color:var(--logo-1)' }), s('stop', { offset: 1, style: 'stop-color:var(--logo-2)' })])]));
    (def ? def() : []).forEach(n => svg.appendChild(n));
    return svg;
  };
  Ico.existe = n => !!(TRAZO[n] || RELLENO[n]);

  /* ---------- mascota «Nodo»: un nodo de árbol con dos hijos como patas ---------- */
  let uidM = 0;
  ET.Mascota = function (humor, tam) {
    humor = humor || 'feliz'; tam = tam || 96; const id = 'nm' + (++uidM);
    const svg = s('svg', { viewBox: '0 0 120 124', width: tam, height: Math.round(tam * 124 / 120), class: 'mascota mascota-' + humor, role: 'img', 'aria-label': 'Nodo, la mascota del entrenador (' + humor + ')' });
    svg.appendChild(s('defs', {}, [s('radialGradient', { id: id + 'g', cx: '35%', cy: '28%', r: '85%' }, [s('stop', { offset: 0, style: 'stop-color:var(--masc-1)' }), s('stop', { offset: .62, style: 'stop-color:var(--masc-2)' }), s('stop', { offset: 1, style: 'stop-color:var(--masc-3)' })])]));
    svg.appendChild(s('g', { class: 'm-patas' }, [p('M46 82 36 104M74 82 84 104', { stroke: 'var(--masc-pata)', 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }), s('circle', { cx: 34, cy: 108, r: 10, fill: 'var(--masc-pie)' }), s('circle', { cx: 86, cy: 108, r: 10, fill: 'var(--masc-pie)' })]));
    svg.appendChild(s('g', { class: 'm-cuerpo' }, [s('circle', { cx: 60, cy: 54, r: 42, fill: 'url(#' + id + 'g)' }), s('ellipse', { cx: 44, cy: 33, rx: 13, ry: 7, fill: 'rgba(255,255,255,.28)', transform: 'rotate(-28 44 33)' })]));
    const ojo = (cx) => humor === 'duerme' ? p('M' + (cx - 8) + ' 52q8 6 16 0', { stroke: 'var(--masc-tinta)', 'stroke-width': 3.4, 'stroke-linecap': 'round', fill: 'none' }) : s('g', { class: 'm-ojo' }, [s('ellipse', { cx, cy: 50, rx: 9, ry: humor === 'celebra' ? 10 : 11, fill: '#fff' }), s('circle', { cx: cx + (humor === 'triste' ? 0 : 1.5), cy: humor === 'triste' ? 54 : 51, r: 5.2, fill: 'var(--masc-tinta)' }), s('circle', { cx: cx + 3, cy: 48, r: 1.8, fill: '#fff' })]);
    svg.appendChild(ojo(44)); svg.appendChild(ojo(76));
    svg.appendChild(s('ellipse', { cx: 31, cy: 66, rx: 6.5, ry: 4, fill: 'rgba(255,120,160,.42)' })); svg.appendChild(s('ellipse', { cx: 89, cy: 66, rx: 6.5, ry: 4, fill: 'rgba(255,120,160,.42)' }));
    const boca = { feliz: p('M48 68q12 11 24 0', { stroke: 'var(--masc-tinta)', 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }), celebra: p('M46 66q14 22 28 0z', { fill: 'var(--masc-tinta)' }), triste: p('M50 76q10-9 20 0', { stroke: 'var(--masc-tinta)', 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }), duerme: s('ellipse', { cx: 60, cy: 72, rx: 4, ry: 3.4, fill: 'var(--masc-tinta)' }), neutral: p('M50 71h20', { stroke: 'var(--masc-tinta)', 'stroke-width': 3.6, 'stroke-linecap': 'round', fill: 'none' }) };
    svg.appendChild(boca[humor] || boca.feliz);
    if (humor === 'celebra') svg.appendChild(p('M50 74q10 7 20 0', { fill: '#ff7a95' }));
    if (humor === 'triste') svg.appendChild(p('M84 56q4 8 0 10q-4-2 0-10z', { fill: '#6fd3ff' }));
    if (humor === 'duerme') { const t = s('text', { x: 96, y: 22, fill: 'var(--tenue)', 'font-size': 18, 'font-weight': 700, 'font-family': 'inherit' }); t.textContent = 'z'; svg.appendChild(t); const t2 = s('text', { x: 106, y: 10, fill: 'var(--tenue)', 'font-size': 12, 'font-weight': 700, 'font-family': 'inherit' }); t2.textContent = 'z'; svg.appendChild(t2); }
    if (humor === 'celebra') { svg.appendChild(p(estrella(100, 22, 8, 3.4), { fill: 'var(--moneda)' })); svg.appendChild(p(estrella(18, 30, 6, 2.6), { fill: 'var(--xp)' })); }
    return svg;
  };

  /* ---------- efectos ---------- */
  const reducido = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Fx = ET.Fx = { reducido };
  const COLORES = ['var(--acento2)', '#ffc93c', '#ff5d73', '#4cc9f0', '#3ddc97', '#ff8a3d'];
  /** lluvia breve de confeti sobre la pantalla (se elimina sola) */
  Fx.confeti = function (n) {
    if (reducido()) return; n = n || 46;
    const c = document.createElement('div'); c.className = 'confeti'; c.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < n; i++) {
      const e = document.createElement('i'); const w = 6 + Math.random() * 7;
      e.style.cssText = 'left:' + (Math.random() * 100).toFixed(1) + '%;width:' + w.toFixed(1) + 'px;height:' + (w * (Math.random() > .5 ? 1 : 1.8)).toFixed(1) + 'px;background:' + COLORES[i % COLORES.length] + ';animation-delay:' + (Math.random() * .35).toFixed(2) + 's;animation-duration:' + (1.5 + Math.random() * 1.1).toFixed(2) + 's;--dx:' + ((Math.random() - .5) * 220).toFixed(0) + 'px;--giro:' + ((Math.random() - .5) * 900).toFixed(0) + 'deg';
      c.appendChild(e);
    }
    document.body.appendChild(c); setTimeout(() => c.remove(), 3200);
  };
  /** texto que sube y se desvanece: «+12 XP» junto a un elemento (o al centro) */
  Fx.flotar = function (texto, cerca, color) {
    const e = document.createElement('div'); e.className = 'flotante'; e.textContent = texto; if (color) e.style.color = color;
    const r = cerca && cerca.getBoundingClientRect ? cerca.getBoundingClientRect() : null;
    e.style.left = (r ? r.left + r.width / 2 : innerWidth / 2) + 'px'; e.style.top = (r ? r.top : innerHeight / 2) + 'px';
    e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); setTimeout(() => e.remove(), 1500);
  };
  /** cuenta de `desde` a `hasta` en el elemento (la última cifra siempre queda en `hasta`) */
  Fx.contar = function (el, desde, hasta, ms, fmt) {
    fmt = fmt || (x => String(Math.round(x)));
    if (reducido() || desde === hasta) { el.textContent = fmt(hasta); return; }
    const t0 = performance.now(); ms = ms || 800;
    const paso = t => { const f = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - f, 3); el.textContent = fmt(desde + (hasta - desde) * e); if (f < 1) requestAnimationFrame(paso); else el.textContent = fmt(hasta); };
    requestAnimationFrame(paso); setTimeout(() => { el.textContent = fmt(hasta); }, ms + 120);
  };
  Fx.animar = (el, clase, ms) => { if (!el || reducido()) return; el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase); setTimeout(() => el.classList.remove(clase), ms || 700); };
  const luminancia = hex => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 1; const v = [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4)); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const TINTA = '#0f1226', BLANCO = '#ffffff';
  const contraste = (a, b) => { const x = luminancia(a), y = luminancia(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  /** color de texto legible (blanco o tinta) sobre un fondo hexadecimal: el de mayor contraste */
  Fx.textoSobre = hex => contraste(TINTA, hex) >= contraste(BLANCO, hex) ? TINTA : BLANCO;
  Fx.contraste = contraste;
  /** oscurece un poco el color si ni la tinta ni el blanco llegan a 4,6:1 sobre él (accesibilidad AA del título de la unidad) */
  Fx.colorUnidad = function (hex) {
    let c = hex;
    for (let i = 0; i < 10 && contraste(Fx.textoSobre(c), c) < 4.6; i++) {
      const v = [1, 3, 5].map(k => parseInt(c.substr(k, 2), 16)); c = '#' + v.map(x => Math.round(x * .94).toString(16).padStart(2, '0')).join('');
    }
    return { fondo: c, texto: Fx.textoSobre(c) };
  };
  /** pone --uc (fondo) y --uc-txt (texto) de una unidad en un elemento */
  Fx.aplicarUnidad = function (el, hex) { const u = Fx.colorUnidad(hex); el.style.setProperty('--uc', u.fondo); el.style.setProperty('--uc-txt', u.texto); };
})(typeof window !== 'undefined' ? window : globalThis);
