/* vistas_comunes.js — componentes de interfaz compartidos */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tipos = ET.Tipos, Arb = ET.Arb, Tm = ET.Temario, M = ET.Motor;
  const Vc = ET.Vc = ET.Vc || {};
  const md = U.md, mdi = U.mdInline;

  Vc.toast = function (msg, ms) {
    const c = document.getElementById('toasts'); const t = h('div', { class: 'toast', role: 'status', text: msg });
    c.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, ms || 2600);
  };
  Vc.modal = function (titulo, contenido, opts) {
    opts = opts || {};
    const prevFoco = document.activeElement;
    const cerrar = () => { f.remove(); document.removeEventListener('keydown', esc); if (prevFoco && prevFoco.focus) prevFoco.focus(); if (opts.alCerrar) opts.alCerrar(); };
    const esc = e => { if (e.key === 'Escape') cerrar(); };
    const x = h('button', { class: 'btn fantasma peq', 'aria-label': 'Cerrar', onclick: cerrar, text: '✕' });
    const f = h('div', { class: 'modal-f', onclick: e => { if (e.target === f) cerrar(); } }, h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo }, h('h2', null, h('span', { text: titulo }), x), contenido));
    document.body.appendChild(f); document.addEventListener('keydown', esc); x.focus();
    return { cerrar };
  };
  Vc.confirmar = function (titulo, texto, textoOk, cb) {
    const nodo = h('div', null, h('p', { html: md(texto) }), h('div', { class: 'acciones' }, h('button', { class: 'btn', onclick: () => { m.cerrar(); cb(); } }, textoOk || 'Aceptar'), h('button', { class: 'btn sec', onclick: () => m.cerrar() }, 'Cancelar')));
    const m = Vc.modal(titulo, nodo);
  };

  /* ---------- teoría ---------- */
  Vc.teoriaNodo = function (ids) {
    const cont = h('div');
    Array.from(new Set(ids)).forEach(id => {
      const c = Tm.conceptos[id]; if (!c) return;
      cont.appendChild(h('section', { class: 'teo' },
        h('h3', { text: c.nombre }),
        h('div', { class: 'fila' }, h('span', { class: 'chip', text: 'Fuente: ' + c.f }), c.comp ? h('span', { class: 'chip comp', text: 'Incluye complemento (no está en los PDF)' }) : null),
        h('div', { html: md(c.t) }),
        h('div', { class: 'cuadro-ej' }, h('strong', { text: 'Ejemplo' }), h('div', { html: md(c.e) })),
        Vc.enlacesBiblioteca(id)));
    });
    return cont;
  };
  /** enlaces «📚 Biblioteca» de un concepto (null si ningún tema de la Biblioteca lo trata) */
  Vc.enlacesBiblioteca = function (concepto) {
    const ts = ET.Biblioteca ? ET.Biblioteca.temasDeConcepto(concepto).slice(0, 2) : []; if (!ts.length) return null;
    return h('div', { class: 'fila', style: { marginTop: '8px' } }, h('span', { class: 'peq tenue', text: 'Más a fondo en la Biblioteca:' }), ts.map(t => h('a', { class: 'btn sec peq', href: '#/biblioteca/' + t.id }, '📚 ' + t.titulo)));
  };
  Vc.teoriaModal = function (ids) { Vc.modal('Teoría breve', Vc.teoriaNodo(ids.slice(0, 3))); };

  /* ---------- componentes visuales ---------- */
  Vc.anillo = (p, color) => { const a = h('div', { class: 'anillo' }, h('b', { text: Math.round(p * 100) + '%' })); a.style.setProperty('--p', Math.round(p * 100)); if (color) a.style.setProperty('--c', color); return a; };
  Vc.barra = (p, meta) => { const b = h('div', { class: 'barra', role: 'progressbar', 'aria-valuenow': Math.round(p * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: Math.round(p * 100) + '%' } })); if (meta) b.appendChild(h('span', { class: 'meta', style: { left: meta + '%' }, title: 'Meta ' + meta + ' %' })); return b; };
  Vc.dif = d => h('span', { class: 'dif', title: 'Dificultad ' + d + '/5', 'aria-label': 'Dificultad ' + d + ' de 5' }, [1, 2, 3, 4, 5].map(i => h('i', { class: i <= d ? 'on' : '' })));
  Vc.chipsPregunta = function (q, ctx) {
    const nv = Tm.niveles[q.nivel - 1]; const f = h('div', { class: 'q-cab' });
    if (!ctx || ctx.modo !== 'examen') { f.appendChild(h('span', { class: 'chip acento', text: 'Nivel ' + q.nivel + ' · ' + nv.nombre })); if (q.tema) f.appendChild(h('span', { class: 'chip', text: q.tema })); }
    f.appendChild(h('span', { class: 'chip', text: Tipos.formato(q) }));
    if (!ctx || ctx.modo !== 'examen') f.appendChild(Vc.dif(q.dif));
    return f;
  };
  Vc.montarPregunta = function (host, q, ctx) {
    const body = h('div', { class: 'q-cuerpo' });
    host.appendChild(Vc.chipsPregunta(q, ctx)); host.appendChild(body);
    const ctl = Tipos.mod(q).render(body, q, ctx);
    return ctl;
  };

  /* ---------- feedback ---------- */
  const IC = { true: '✔', false: '✘', null: 'ℹ' };
  Vc.feedbackNodo = function (res, ans, regrade) {
    const pct = Math.round(res.score * 100);
    const cls = res.ok ? 'ok' : (res.score >= 0.5 ? 'parcial' : 'mal');
    const titulo = res.ok ? '¡Correcto!' : (res.score > 0 ? 'Parcialmente correcto (' + pct + ' %)' : 'Aún no es correcto');
    const nodo = h('div', { class: 'feedback ' + cls, role: 'status' }, h('div', { class: 'fb-t', text: (res.ok ? '🎉 ' : (res.score > 0 ? '🟡 ' : '🔎 ')) + titulo }));
    (res.items || []).forEach(it => {
      const fila = h('div', { class: 'fb-it' }, h('span', { class: 'ic ' + (it.ok === true ? 'ok' : it.ok === false ? 'mal' : 'info'), text: IC[it.ok] }), h('p', { html: mdi(it.html) }));
      if (it.toggle !== undefined && regrade) {
        const cb = h('input', { type: 'checkbox' }); cb.checked = !!it.ok;
        cb.addEventListener('change', () => { if (it.alter) it.alter(cb.checked); else { ans.manual = ans.manual || {}; ans.manual[it.toggle] = cb.checked; } regrade(); });
        fila.appendChild(h('label', null, cb, ' lo expliqué'));
      }
      nodo.appendChild(fila);
    });
    return nodo;
  };
  Vc.solucionNodo = function (q) {
    const mod = Tipos.mod(q);
    const n = h('div', { class: 'panel' }, h('h4', { text: 'Respuesta de referencia' }), h('div', { html: mod.solucionHtml(q) }));
    if (q.explicacion) n.appendChild(h('div', { class: 'espacio' }, h('h4', { text: 'Explicación' }), h('div', { html: md(q.explicacion) })));
    Tipos.hidratar(n);
    return n;
  };

  /* ---------- animaciones ---------- */
  function ordenClaves(t, nombre) {
    const o = [], kk = Arb.kk;
    if (nombre === 'por niveles') { const q = t ? [t] : []; while (q.length) { const x = q.shift(); o.push({ k: kk(x), t: x.v }); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } return o; }
    (function r(n) { if (!n) return; const it = { k: kk(n), t: n.v }; if (nombre === 'preorden') o.push(it); r(n.l); if (nombre === 'inorden') o.push(it); r(n.r); if (nombre === 'postorden') o.push(it); })(t);
    return o;
  }
  Vc.animacionRecorrido = function (anim) {
    const box = h('div', { class: 'panel' }, h('h4', { text: 'Animación del recorrido: ' + anim.nombre }));
    const draw = h('div', { class: 'arbol-draw' }); const salida = h('div', { class: 'fila', style: { minHeight: '34px', marginTop: '8px' } });
    let ctrl = Arb.dibujar(draw, anim.arbol, { compacto: true }); let ani = null;
    const play = () => { if (ani) ani.parar(); ctrl = Arb.dibujar(draw, anim.arbol, { compacto: true }); ani = Arb.animarRecorrido(ctrl, ordenClaves(anim.arbol, anim.nombre), { vel: M.config().animVel || 650, salida }); };
    const bar = h('div', { class: 'fila' }, h('button', { class: 'btn sec peq', onclick: play }, '▶ Reproducir'), h('button', { class: 'btn fantasma peq', onclick: () => { if (ani) ani.parar(); } }, '⏹ Detener'));
    box.appendChild(bar); box.appendChild(h('div', { class: 'arbol-caja' }, draw)); box.appendChild(salida);
    return box;
  };
  Vc.animacionRotaciones = function (arbolBase, titulo) {
    const rb = Arb.rebalancear(arbolBase);
    const box = h('div', { class: 'panel' }, h('h4', { text: titulo || 'Animación del rebalanceo' }));
    const draw = h('div', { class: 'arbol-draw' }), msg = h('div', { class: 'peq suave', style: { minHeight: '22px', margin: '6px 0' } });
    const mostrarBase = () => { const bad = Arb.desbalanceados(arbolBase); const cl = {}; bad.slice(0, 1).forEach(n => cl[String(n.v)] = 'desbalanceado'); Arb.dibujar(draw, arbolBase, { compacto: true, etiquetas: 'factor', clases: cl }); msg.textContent = bad.length ? 'Nodo desbalanceado (|factor| = 2): ' + bad[0].v : 'El árbol ya está balanceado.'; };
    let vivo = 0;
    const play = async () => {
      const id = ++vivo; mostrarBase(); await new Promise(r => setTimeout(r, 900));
      for (const p of rb.pasos) {
        if (id !== vivo) return;
        msg.textContent = 'Rotación ' + p.rot + ' sobre ' + p.sobre + (p.parte ? ' (parte ' + p.parte + ' de 2 — caso ' + p.caso + ')' : ' (caso ' + p.caso + ')');
        await Arb.animarTransicion(draw, p.antes, p.despues, { compacto: true, dur: 1000 });
        if (id !== vivo) return; await new Promise(r => setTimeout(r, 500));
      }
      if (id === vivo) { Arb.dibujar(draw, rb.arbol, { compacto: true, etiquetas: 'factor' }); msg.textContent = rb.pasos.length ? 'Árbol balanceado: ' + Arb.nota(rb.arbol) : msg.textContent; }
    };
    mostrarBase();
    box.appendChild(h('div', { class: 'fila' }, h('button', { class: 'btn sec peq', onclick: play }, '▶ Reproducir rotaciones'), h('button', { class: 'btn fantasma peq', onclick: () => { vivo++; mostrarBase(); } }, '↺ Restablecer')));
    box.appendChild(msg); box.appendChild(h('div', { class: 'arbol-caja' }, draw));
    return box;
  };
  Vc.animacionDe = function (q) {
    if (q.animacion) return Vc.animacionRecorrido(q.animacion);
    if (q.tipo === 'avl' && q.arbol && Arb.desbalanceados(q.arbol).length) return Vc.animacionRotaciones(q.arbol);
    return null;
  };

  /* ---------- pie de preguntas: "Mis errores", etc. ---------- */
  Vc.fecha = t => U.fmtFecha(t);
  Vc.nivelChip = n => { const l = Tm.niveles[n - 1]; const c = h('span', { class: 'chip', text: l.icono + ' ' + l.nombre }); c.style.borderColor = l.color; return c; };
  Vc.vacio = (icono, titulo, texto, accion) => h('div', { class: 'vacio' }, h('div', { class: 'big', text: icono }), h('h3', { text: titulo }), h('p', { text: texto }), accion || null);
})(typeof window !== 'undefined' ? window : globalThis);
