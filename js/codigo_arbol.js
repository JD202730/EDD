/* codigo_arbol.js — depurador «Código ↔ Árbol»: el código Python y el árbol comparten el mismo estado de ejecución.
   Escribes o ejecutas código; el árbol que ves se reconstruye de lo que ese código HIZO (traza.js), paso a paso, hacia adelante y
   hacia atrás. Haz clic en un nodo para ver qué instrucciones lo crearon o modificaron, o en una línea para ver qué cambió. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Arb = ET.Arb, Traza = ET.Traza;
  const Vc = ET.Vc = ET.Vc || {};
  const esc = U.esc;

  const AVISO = 'El código se ejecuta de verdad con el intérprete del entrenador (un subconjunto de Python) y el árbol se reconstruye a partir de lo que ese código hizo: objetos creados y atributos asignados. Solo se dibujan objetos de clases propias con atributos de hijo izquierdo/derecho (izq/der, left/right… configurables en «Atributos»); un árbol hecho con listas, tuplas o diccionarios no se dibuja (aparecerá en las variables, pero no como árbol). Si tu programa usa algo no soportado, se informa el error en lugar de simular la ejecución.';

  function lineaTxt(T, n) { return (T.lineas[n - 1] || '').trim(); }
  const claseDe = m => (m && m.col) ? (/^(0|rojo|r|red|roja|false)$/i.test(m.col.replace(/['"]/g, '')) ? 'rn-rojo' : (/^(1|negro|n|b|black|negra|true)$/i.test(m.col.replace(/['"]/g, '')) ? 'rn-negro' : '')) : '';

  /** cfg: {codigo, titulo, desc, compacto, sinEditor, alIniciar} → {ejecutar, irA, destruir} */
  Vc.codigoArbol = function (host, cfg) {
    cfg = cfg || {};
    const S = { T: null, mod: null, k: 0, timer: null, vel: 700, sel: null, lineaSel: null, attrs: {}, editando: true };
    const raiz = h('div', { class: 'cdarb' + (cfg.compacto ? ' compacto' : '') });
    host.appendChild(raiz);

    /* ---------- barra superior ---------- */
    const editor = ET.Editor.crear({ valor: cfg.codigo || '', minLineas: cfg.compacto ? 8 : 14, maxLineas: 30, onEjecutar: () => ejecutar(), etiqueta: 'Código Python a depurar' });
    const btnEjec = h('button', { class: 'btn', type: 'button', onclick: () => ejecutar() }, '▶ Ejecutar y depurar');
    const btnEdit = h('button', { class: 'btn sec', type: 'button', onclick: () => modoEditar() }, '✏ Editar código');
    const selEj = ET.Ejemplos && !cfg.sinEjemplos ? h('select', { 'aria-label': 'Ejemplos', class: 'cdarb-sel' }, h('option', { value: '', text: 'Ejemplos…' }), ET.Ejemplos.lista.map(e => h('option', { value: e.id, text: e.grupo + ' · ' + e.titulo }))) : null;
    if (selEj) selEj.addEventListener('change', () => { if (selEj.value) { cargarEjemplo(selEj.value); selEj.value = ''; } });
    const barra = h('div', { class: 'cdarb-barra' }, selEj, btnEjec, btnEdit);
    const info = h('div', { class: 'cdarb-info peq suave' });
    const avisoCaja = h('details', { class: 'cdarb-aviso' }, h('summary', { text: 'ℹ Cómo se sincronizan el código y el árbol (y sus límites)' }), h('p', { class: 'peq', text: AVISO }));
    const atrIn = {};
    const atributos = h('details', { class: 'cdarb-aviso' }, h('summary', { text: '⚙ Atributos que se interpretan como nodo' }),
      h('div', { class: 'cdarb-atr' }, [['izq', 'Hijo izquierdo'], ['der', 'Hijo derecho'], ['val', 'Valor'], ['alt', 'Altura (opcional)'], ['col', 'Color (opcional)']].map(([k, t]) => {
        const i = h('input', { type: 'text', value: Traza.ATR[k].join(', '), 'aria-label': t, spellcheck: 'false' }); atrIn[k] = i;
        i.addEventListener('change', () => { S.attrs[k] = i.value.split(/[,\s]+/).filter(Boolean); if (S.T) pintar(); });
        return h('label', { class: 'peq' }, t, i);
      })));

    /* ---------- zona de depuración ---------- */
    const ctl = h('div', { class: 'cdarb-ctl', role: 'toolbar', 'aria-label': 'Control de la ejecución' });
    const b = (txt, tit, fn) => h('button', { class: 'btn sec peq', type: 'button', title: tit, 'aria-label': tit, onclick: fn }, txt);
    const bPlay = b('▶', 'Reproducir / pausar', () => alternar());
    const slider = h('input', { type: 'range', min: 0, max: 0, value: 0, class: 'cdarb-slider', 'aria-label': 'Paso de la ejecución' });
    slider.addEventListener('input', () => { pausar(); irA(+slider.value); });
    const contador = h('span', { class: 'peq tenue cdarb-cont', 'aria-live': 'polite' });
    const velSel = h('select', { 'aria-label': 'Velocidad', class: 'cdarb-sel' }, [['1400', 'lenta'], ['700', 'normal'], ['300', 'rápida'], ['90', 'muy rápida']].map(([v, t]) => h('option', { value: v, text: t })));
    velSel.value = '700'; velSel.addEventListener('change', () => { S.vel = +velSel.value; if (S.timer) { pausar(); alternar(); } });
    ctl.append(b('⏮', 'Reiniciar (paso 1)', () => { pausar(); irA(0); }), b('⏪', 'Cambio anterior en el árbol', () => { pausar(); saltoCambio(-1); }), b('◀', 'Paso atrás', () => { pausar(); irA(S.k - 1); }), bPlay, b('▶|', 'Paso adelante', () => { pausar(); irA(S.k + 1); }), b('⏩', 'Siguiente cambio en el árbol', () => { pausar(); saltoCambio(1); }), b('⏭', 'Al final', () => { pausar(); irA(S.T.pasos.length - 1); }), slider, contador, velSel);
    const estado = h('div', { class: 'cdarb-estado', 'aria-live': 'polite' });
    const codigoEl = h('div', { class: 'cdarb-cod', role: 'region', 'aria-label': 'Código en ejecución' });
    const arbolesEl = h('div', { class: 'cdarb-arboles' });
    const nodoEl = h('div', { class: 'cdarb-nodo' });
    const varsEl = h('div', { class: 'cdarb-vars' });
    const salidaEl = h('pre', { class: 'cdarb-salida consola-out', 'aria-label': 'Salida impresa' });
    const dep = h('div', { class: 'cdarb-dep oculto' }, ctl, estado, h('div', { class: 'cdarb-grid' }, h('div', { class: 'cdarb-col' }, h('div', { class: 'cod-titulo', text: 'Código' }), codigoEl, h('div', { class: 'cod-titulo', text: 'Salida (print)' }), salidaEl),
      h('div', { class: 'cdarb-col' }, h('div', { class: 'cod-titulo', text: 'Árbol (reconstruido de la ejecución)' }), arbolesEl, nodoEl, h('div', { class: 'cod-titulo', text: 'Pila de llamadas y variables' }), varsEl)));
    raiz.append(barra, info, avisoCaja, atributos, h('div', { class: 'cdarb-ed' }, editor.el), dep);
    if (cfg.desc) info.textContent = cfg.desc;

    /* ---------- ejecución ---------- */
    function cargarEjemplo(id) { const e = ET.Ejemplos.porId[id]; if (!e) return; editor.setValue(e.codigo); info.textContent = e.desc; ejecutar(); }
    function ejecutar() {
      pausar(); S.sel = null; S.lineaSel = null;
      const T = Traza.ejecutar(editor.getValue());
      S.T = T; S.mod = new Traza.Modelo(T); S.k = 0; S.editando = false;
      construirCodigo();
      dep.classList.remove('oculto'); raiz.querySelector('.cdarb-ed').classList.add('oculto');
      slider.max = String(T.pasos.length - 1);
      pintar();
      if (cfg.alIniciar) cfg.alIniciar(T);
      return T;
    }
    function modoEditar() { pausar(); S.editando = true; dep.classList.add('oculto'); raiz.querySelector('.cdarb-ed').classList.remove('oculto'); editor.focus(); }

    function construirCodigo() {
      U.vaciar(codigoEl);
      const lineasConCambio = new Set(S.T.eventos.map(e => e.l));
      S.T.lineas.forEach((ln, i) => {
        const n = i + 1;
        const fila = h('div', { class: 'cl' + (lineasConCambio.has(n) ? ' cam' : ''), 'data-l': n, title: lineasConCambio.has(n) ? 'Esta línea modifica objetos (clic para ver los cambios)' : 'Clic para ver cuántas veces se ejecutó', onclick: () => seleccionarLinea(n) },
          h('span', { class: 'cl-n', text: String(n) }), h('span', { class: 'cl-m', text: lineasConCambio.has(n) ? '●' : '' }), h('span', { class: 'cl-c', html: U.resaltarPy(ln) || ' ' }));
        codigoEl.appendChild(fila);
      });
    }

    /* ---------- reproducción ---------- */
    function pausar() { if (S.timer) { clearInterval(S.timer); S.timer = null; } bPlay.textContent = '▶'; }
    function alternar() {
      if (!S.T) return;
      if (S.timer) { pausar(); return; }
      if (S.k >= S.T.pasos.length - 1) irA(0);
      bPlay.textContent = '⏸';
      S.timer = setInterval(() => { if (S.k >= S.T.pasos.length - 1) { pausar(); return; } irA(S.k + 1); }, S.vel);
    }
    function irA(k) { if (!S.T) return; S.k = Math.max(0, Math.min(S.T.pasos.length - 1, k)); pintar(); }
    function saltoCambio(dir) {
      const P = S.T.pasos; let k = S.k;
      if (dir > 0) { const ev0 = P[k].ev; while (k < P.length - 1 && P[k].ev === ev0) k++; }
      else { const ev0 = P[k].ev; while (k > 0 && P[k].ev === ev0) k--; const ev1 = P[k].ev; while (k > 0 && P[k - 1].ev === ev1) k--; }
      irA(k);
    }
    function seleccionarNodo(id) { S.sel = S.sel === id ? null : id; S.lineaSel = null; pintar(); }
    function seleccionarLinea(n) { S.lineaSel = S.lineaSel === n ? null : n; S.sel = null; pintar(); }

    /* ---------- pintado ---------- */
    function refTxt(e) { return e.o !== undefined ? h('a', { class: 'ref-nodo', href: 'javascript:void(0)', onclick: ev => { ev.preventDefault(); seleccionarNodo(e.o); } }, '→ ' + nombreNodo(e.o)) : h('span', { class: 'cdarb-val', text: e.s }); }
    function nombreNodo(id) {
      const n = S.mod.nodos.get(id); if (!n) return '#' + id;
      const a = Traza.ATR.val.find(x => n.a.has(x)); const v = a ? n.a.get(a) : null;
      return n.c + (v && v.s !== undefined ? '(' + v.s + ')' : '') + ' #' + id;
    }
    function pintar() {
      const T = S.T, k = S.k, p = T.pasos[k];
      S.mod.irA(k);
      slider.value = String(k); contador.textContent = 'Paso ' + (k + 1) + ' de ' + T.pasos.length;
      // línea actual
      const filas = codigoEl.children;
      const relac = new Set(); if (S.sel !== null) (T.hist.get(S.sel) || []).forEach(i => relac.add(T.eventos[i].l));
      if (S.lineaSel !== null) relac.add(S.lineaSel);
      const prev = k > 0 ? T.pasos[k - 1].l : null;
      for (let i = 0; i < filas.length; i++) { const n = i + 1; const f = filas[i]; f.classList.toggle('act', p.l === n); f.classList.toggle('pas', prev === n && p.l !== n); f.classList.toggle('rel', relac.has(n)); f.classList.toggle('lsel', S.lineaSel === n); }
      const fa = p.l ? filas[p.l - 1] : null;
      if (fa) { const top = fa.offsetTop, bot = top + fa.offsetHeight; if (top < codigoEl.scrollTop + 4 || bot > codigoEl.scrollTop + codigoEl.clientHeight - 4) codigoEl.scrollTop = Math.max(0, top - codigoEl.clientHeight / 2); }
      // estado
      U.vaciar(estado);
      let msg;
      if (p.tipo === 'fin') msg = 'Fin del programa: este es el estado final.';
      else if (p.tipo === 'err') msg = '⚠ ' + p.msg;
      else if (p.tipo === 'ret') msg = '← retorna de ' + p.fn + '() con ' + p.r.s + (p.r.o !== undefined ? ' (' + nombreNodo(p.r.o) + ')' : '');
      else msg = (p.tipo === 'iter' ? '↻ vuelta del ciclo · ' : 'a punto de ejecutar · ');
      estado.appendChild(h('div', null, h('strong', { text: 'Línea ' + (p.l || '—') + ': ' }), h('code', { text: p.l ? lineaTxt(T, p.l) : '' })));
      estado.appendChild(h('div', { class: 'peq ' + (p.tipo === 'err' ? 'mal' : 'suave'), text: msg }));
      // cambios que produjo el paso anterior
      const ini = k > 0 ? T.pasos[k - 1].ev : 0, fin = p.ev;
      if (fin > ini) {
        const l = h('ul', { class: 'cdarb-cambios' });
        for (let i = ini; i < Math.min(fin, ini + 6); i++) { const e = T.eventos[i]; l.appendChild(h('li', null, h('a', { href: 'javascript:void(0)', onclick: ev => { ev.preventDefault(); seleccionarNodo(e.id); } }, nombreNodo(e.id)), ' · ' + Traza.describir(T, e) + ' ', h('span', { class: 'tenue', text: '(línea ' + e.l + ')' }))); }
        if (fin - ini > 6) l.appendChild(h('li', { class: 'tenue', text: '… y ' + (fin - ini - 6) + ' cambio(s) más' }));
        estado.appendChild(h('div', { class: 'peq' }, h('strong', { text: 'Lo que cambió justo antes de este paso: ' }), l));
      }
      pintarArboles(); pintarNodo(); pintarVars(p);
      salidaEl.textContent = T.salida.slice(0, p.o) || '(todavía no se imprimió nada)';
      if (T.error && k === T.pasos.length - 1) salidaEl.textContent += (salidaEl.textContent ? '\n' : '') + Py_texto(T.error);
    }
    const Py_texto = e => ET.Py.textoError(e);

    function pintarArboles() {
      U.vaciar(arbolesEl);
      const cfgA = Object.assign({}, S.attrs);
      const B = Traza.bosque(S.T, S.mod, S.k, cfgA);
      if (S.T.truncada) arbolesEl.appendChild(h('div', { class: 'peq', style: { color: 'var(--aviso)' }, text: '⚠ La traza se truncó (demasiados pasos): lo que ves a partir de aquí no es el final del programa.' }));
      if (!B.arboles.length) { arbolesEl.appendChild(h('div', { class: 'arbol-vacio', text: S.T.nNodos ? 'Todavía no hay ningún nodo alcanzable desde las variables (o la clase no tiene atributos izq/der reconocidos).' : 'Este programa aún no creó objetos con hijos izquierdo/derecho. Ejecuta paso a paso: el árbol aparece cuando el código crea nodos.' })); return; }
      const total = B.nNodos;
      B.arboles.forEach(a => {
        if (!a.arbol) return;
        const caja = h('div', { class: 'arbol-caja cdarb-arbol' }); const draw = h('div', { class: 'arbol-draw' });
        if (B.arboles.length > 1 || a.tags.length) caja.appendChild(h('div', { class: 'peq tenue', text: 'Árbol raíz #' + a.id + (a.tags.length ? ' · apuntado por ' + a.tags.join(', ') : '') }));
        caja.appendChild(draw); arbolesEl.appendChild(caja);
        const clases = {}, tags = {};
        (function rec(n) {
          if (!n) return; const m = n.meta || {}; const c = [];
          if (B.nuevos.has(m.id)) c.push('nuevo'); else if (B.tocados.has(m.id)) c.push('ruta');
          if (B.visitando.has(m.id)) c.push('visitando');
          if (m.factor !== null && m.factor !== undefined && Math.abs(m.factor) >= 2) c.push('desbalanceado');
          const rn = claseDe(m); if (rn) c.push(rn);
          if (S.sel === m.id) c.push('sel');
          if (c.length) clases[n.k] = c.join(' ');
          if (m.tags && m.tags.length) tags[n.k] = m.tags.slice(0, 3).join(', ') + (m.tags.length > 3 ? '…' : '');
          rec(n.l); rec(n.r);
        })(a.arbol);
        const g = total <= 30 ? null : (total <= 60 ? { dx: 34, dy: 46, r: 14, pad: 18 } : { dx: 26, dy: 40, r: 11, pad: 14 });
        Arb.dibujar(draw, a.arbol, {
          sinReducir: true, offsetY: 14, geom: g || undefined, clases, tags,
          etqNodo: n => { const m = n.meta || {}; if (m.h === null || m.h === undefined) return ''; const f = m.factor; return 'h=' + m.h + (f !== null && f !== undefined ? ' f=' + (f > 0 ? '+' : '') + f : '') + (f !== null && f !== undefined && Math.abs(f) >= 2 ? '!' : ''); },
          onClick: (v, key) => { const id = +String(key).replace(/^c?(\d+).*/, '$1'); seleccionarNodo(id); }
        });
      });
      arbolesEl.appendChild(h('div', { class: 'peq tenue', text: total + ' nodo(s) visibles. ' + 'Amarillo: creado justo antes de este paso · azul: modificado · borde punteado: referenciado por una variable del marco actual · clic en un nodo: qué instrucciones lo produjeron.' }));
    }

    function pintarNodo() {
      U.vaciar(nodoEl); const T = S.T;
      if (S.sel !== null) {
        const id = S.sel; const lista = T.hist.get(id) || [];
        const caja = h('div', { class: 'panel' }, h('h4', { text: 'Historia de ' + nombreNodo(id) }));
        if (!lista.length) caja.appendChild(h('p', { class: 'peq', text: 'Este nodo no tiene eventos registrados.' }));
        const ul = h('ul', { class: 'cdarb-hist' });
        lista.forEach(i => {
          const e = T.eventos[i]; const paso = e.p;
          ul.appendChild(h('li', { class: i < T.pasos[S.k].ev ? 'hecho' : 'futuro' }, h('a', { href: 'javascript:void(0)', onclick: ev => { ev.preventDefault(); pausar(); irA(Math.min(T.pasos.length - 1, paso + 1)); } }, 'paso ' + (paso + 1)), ' · línea ' + e.l + ': ', h('code', { text: Traza.describir(T, e) }), e.l ? h('span', { class: 'tenue', text: '   ' + lineaTxt(T, e.l).slice(0, 60) }) : null));
        });
        caja.appendChild(ul); caja.appendChild(h('p', { class: 'peq tenue', text: 'Las líneas que lo tocaron están marcadas en el código. Clic en «paso N» para ir al momento justo después de ese cambio. Los eventos en gris todavía no ocurrieron en este paso.' }));
        nodoEl.appendChild(caja);
      } else if (S.lineaSel !== null) {
        const n = S.lineaSel; const vezes = T.pasos.filter(x => x.l === n).length; const evs = T.eventos.map((e, i) => [e, i]).filter(([e]) => e.l === n);
        const caja = h('div', { class: 'panel' }, h('h4', { text: 'Línea ' + n + ': ' + lineaTxt(T, n).slice(0, 70) }), h('p', { class: 'peq', text: 'Se ejecutó ' + vezes + ' vez/veces y produjo ' + evs.length + ' cambio(s) en objetos.' }));
        const ul = h('ul', { class: 'cdarb-hist' });
        evs.slice(0, 14).forEach(([e]) => ul.appendChild(h('li', null, h('a', { href: 'javascript:void(0)', onclick: ev => { ev.preventDefault(); pausar(); irA(Math.min(T.pasos.length - 1, e.p + 1)); } }, 'paso ' + (e.p + 1)), ' · ' + nombreNodo(e.id) + ' · ' + Traza.describir(T, e))));
        if (evs.length > 14) ul.appendChild(h('li', { class: 'tenue', text: '… y ' + (evs.length - 14) + ' más' }));
        caja.appendChild(ul); nodoEl.appendChild(caja);
      } else nodoEl.appendChild(h('div', { class: 'peq tenue', style: { margin: '6px 0' }, text: 'Toca un nodo del árbol o una línea del código para ver qué instrucciones producen cada cambio.' }));
    }

    function pintarVars(p) {
      U.vaciar(varsEl); const T = S.T; const pila = Traza.pila(T, S.k);
      pila.forEach((m, i) => {
        const caja = h('div', { class: 'cdarb-marco' + (i === 0 ? ' actual' : '') });
        const args = m.fid ? m.args.map(([n, e]) => n + '=' + (e.o !== undefined ? '#' + e.o : e.s)).join(', ') : '';
        caja.appendChild(h('div', { class: 'cdarb-marco-t' }, h('strong', { text: m.fid ? m.fn + '(' + args + ')' : 'programa (variables globales)' }), m.fid ? h('span', { class: 'tenue peq', text: ' · llamada en línea ' + T.marcos[m.fid].lc }) : null));
        const vars = m.fid ? m.vars : (T.pasos[S.k].g || {});
        const ent = Object.entries(vars);
        if (!ent.length) caja.appendChild(h('div', { class: 'peq tenue', text: '(sin variables todavía)' }));
        else { const tb = h('table', { class: 'cdarb-tabla' }); ent.forEach(([n, e]) => tb.appendChild(h('tr', null, h('td', { text: n }), h('td', null, refTxt(e), e.ids ? h('span', { class: 'tenue peq', text: '  ' }, e.ids.slice(0, 4).map(id => h('a', { class: 'ref-nodo', href: 'javascript:void(0)', onclick: ev => { ev.preventDefault(); seleccionarNodo(id); } }, '#' + id + ' '))) : null)))); caja.appendChild(tb); }
        varsEl.appendChild(caja);
        if (i === 0 && m.fid === 0 && pila.length === 1) { /* solo el programa */ }
      });
      // globales cuando el marco actual es una función
      if (pila.length && pila[0].fid !== 0) { /* ya aparece el marco 0 al final de la pila con las globales */ }
    }

    // atajos de teclado dentro del depurador
    raiz.addEventListener('keydown', ev => {
      if (!S.T || S.editando || /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
      if (ev.key === 'ArrowRight') { ev.preventDefault(); pausar(); irA(S.k + 1); }
      else if (ev.key === 'ArrowLeft') { ev.preventDefault(); pausar(); irA(S.k - 1); }
      else if (ev.key === ' ') { ev.preventDefault(); alternar(); }
    });

    return {
      ejecutar, irA, pausar, modoEditar, cargarEjemplo, setCodigo(c) { editor.setValue(c); },
      estado: () => S, destruir() { pausar(); raiz.remove(); }
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
