/* taller.js — Taller interactivo de árboles (BST / AVL).
   El estudiante MUEVE los nodos fase por fase: colocar el nodo nuevo, detectar el primer nodo desbalanceado,
   clasificar el desbalance (LL/RR/LR/RL) y aplicar cada rotación arrastrando un hijo sobre su padre.
   En modo estricto, un movimiento incorrecto NO se acepta: el árbol no cambia, no se muestra el resultado
   y hay que intentarlo otra vez.                                                                                */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Arb = ET.Arb, kk = Arb.kk;
  const Taller = ET.Taller = {};
  const GEO = { dx: 58, dy: 66, r: 21, pad: 22 };
  const MARGEN_X = 46, OFFSET_Y = 74;
  const NOMBRES = { LL: 'Izq-Izq (LL)', RR: 'Der-Der (RR)', LR: 'Izq-Der (LR)', RL: 'Der-Izq (RL)' };
  const lado = l => l === 'l' ? 'izquierdo' : 'derecho';

  /* ===================== plan de una operación ===================== */
  function agrupar(pasos) {
    const g = [];
    pasos.forEach(p => {
      if (p.parte === 2 && g.length) { g[g.length - 1].pasos.push(p); return; }
      g.push({ nodo: String(p.nodoDesbalanceado !== undefined ? p.nodoDesbalanceado : p.sobre), caso: p.caso, pasos: [p] });
    });
    return g;
  }
  function posicionBST(t, v) {
    let p = null, ld = null, n = t;
    while (n) { p = n; if (Arb.lt(v, n.v)) { ld = 'l'; n = n.l; } else { ld = 'r'; n = n.r; } }
    return { padre: p ? kk(p) : null, lado: ld };
  }
  function planOp(t, op, cfg) {
    const avl = cfg.tipo === 'avl';
    if (op.t === 'ins') {
      const bst = Arb.insBST(t, op.v); const reb = avl ? Arb.rebalancear(bst) : { arbol: bst, pasos: [] };
      return { t: 'ins', v: op.v, pos: posicionBST(t, op.v), bst, ciclos: agrupar(reb.pasos), final: reb.arbol };
    }
    if (op.t === 'del') {
      const nd = Arb.buscarNodo(t, op.v); const hijos = (nd.l ? 1 : 0) + (nd.r ? 1 : 0); const modo = cfg.conv || 'suc';
      let reemplazo = null; if (hijos === 1) reemplazo = kk(nd.l || nd.r); if (hijos === 2) reemplazo = kk(modo === 'suc' ? Arb.minimo(nd.r) : Arb.maximo(nd.l));
      const bst = Arb.delBST(t, op.v, modo); const reb = avl ? Arb.rebalancear(bst) : { arbol: bst, pasos: [] };
      return { t: 'del', v: op.v, hijos, reemplazo, modo, bst, ciclos: agrupar(reb.pasos), final: reb.arbol };
    }
    const reb = Arb.rebalancear(t);
    return { t: 'reb', bst: t, ciclos: agrupar(reb.pasos), final: reb.arbol };
  }
  function construirFases(plan, cfg) {
    const F = [];
    if (plan.t === 'ins') F.push({ id: 'colocar', titulo: 'Colocar el nodo nuevo', instr: 'Arrastra el **nodo nuevo (' + plan.v + ')** al hueco donde se cuelga como hoja. Sigue las comparaciones desde la raíz: menor → izquierda, mayor → derecha.' });
    if (plan.t === 'del') {
      F.push({ id: 'tipoDel', titulo: 'Tipo de eliminación', instr: '¿Cuántos hijos tiene el nodo **' + plan.v + '** que se va a eliminar? De eso depende qué se hace.' });
      const instr = plan.hijos === 0 ? 'Es una hoja: arrastra el nodo **' + plan.v + '** a la papelera 🗑.' : (plan.hijos === 1 ? 'Tiene un solo hijo: arrastra **ese hijo** sobre el nodo ' + plan.v + ' para que ocupe su lugar.' : 'Tiene dos hijos: se reemplaza por el **' + (plan.modo === 'suc' ? 'sucesor inorden (el menor del subárbol derecho)' : 'predecesor inorden (el mayor del subárbol izquierdo)') + '**. Arrástralo sobre el nodo ' + plan.v + '.');
      F.push({ id: 'quitar', titulo: 'Eliminar como en un BST', instr });
    }
    if (cfg.tipo === 'avl') {
      plan.ciclos.forEach((c, i) => {
        F.push({ id: 'detectar', nodo: c.nodo, ciclo: i, titulo: 'Detectar el desbalance', instr: 'Calcula altura y factor de balance (altura(izq) − altura(der)) de abajo hacia arriba. Haz clic en el **primer nodo desbalanceado** (el más profundo con |factor| = 2) o pulsa «Ningún nodo».' });
        F.push({ id: 'clasificar', caso: c.caso, nodo: c.nodo, ciclo: i, titulo: 'Clasificar el desbalance', instr: '¿Qué **tipo de desbalance** tiene el nodo **' + c.nodo + '**?' });
        c.pasos.forEach((p, j) => F.push({ id: 'rotar', paso: p, ciclo: i, j, de: c.pasos.length, titulo: 'Rotar' + (c.pasos.length > 1 ? ' (paso ' + (j + 1) + ' de ' + c.pasos.length + ')' : ''), instr: 'Aplica la rotación: **arrastra un hijo sobre su padre** (un hijo izquierdo sobre su padre = rotación a la derecha; un hijo derecho = a la izquierda), o toca el nodo pivote y usa los botones.' }));
      });
      if (plan.t !== 'ins' || !plan.ciclos.length) F.push({ id: 'detectar', nodo: null, ciclo: -1, titulo: plan.ciclos.length ? 'Verificar' : 'Detectar el desbalance', instr: plan.ciclos.length ? '¿Queda algún nodo desbalanceado? Haz clic en él, o pulsa «Ningún nodo» si el árbol ya está balanceado.' : 'Calcula los factores de balance de abajo hacia arriba. Haz clic en el **primer nodo desbalanceado** o pulsa «Ningún nodo» si todo está balanceado.' });
    }
    return F;
  }

  /* ===================== widget ===================== */
  /** cfg: {tipo:'avl'|'bst', conv:'suc'|'pred', arbol, ops:[{t:'ins',v}|{t:'del',v}|{t:'reb'}], estricto:true, onFin(res)} */
  Taller.montar = function (host, cfg) {
    const S = { arbol: cfg.arbol, op: 0, plan: null, fases: [], fi: 0, fallos: 0, pistas: 0, ff: 0, hf: 0, factores: false, factoresContados: false, anim: false, sel: null, marca: null, revela: null, fin: false, cbs: [], ctrl: null, bloq: false, ult: null };
    const raiz = h('div', { class: 'taller' });
    const cabOps = h('div', { class: 'taller-ops' }), cabFases = h('div', { class: 'taller-fases', role: 'list' });
    const instr = h('div', { class: 'taller-instr' });
    const lienzo = h('div', { class: 'arbol-draw taller-lienzo' }), caja = h('div', { class: 'arbol-caja taller-caja' }, lienzo);
    const msg = h('div', { class: 'taller-msg', role: 'status', 'aria-live': 'polite' });
    const ctrls = h('div', { class: 'taller-ctrls' }), pie = h('div', { class: 'taller-pie' }), fin = h('div', { class: 'taller-fin oculto' });
    raiz.append(cabOps, cabFases, instr, caja, msg, ctrls, pie, fin);
    host.appendChild(raiz);

    const fase = () => S.fases[S.fi];
    const mostrar = (texto, tipo) => { msg.className = 'taller-msg ' + (tipo || ''); msg.innerHTML = U.mdInline(texto || ''); };
    const btn = (t, fn, cls, dis) => h('button', { type: 'button', class: 'btn peq ' + (cls || 'sec'), onclick: fn, disabled: dis || null }, t);
    const padreDe = key => { let r = null; (function rec(n) { if (!n || r) return; if (n.l && kk(n.l) === key) r = { padre: n, lado: 'l' }; else if (n.r && kk(n.r) === key) r = { padre: n, lado: 'r' }; else { rec(n.l); rec(n.r); } })(S.arbol); return r; };

    /* ---------- cabeceras ---------- */
    function pintarCab() {
      U.vaciar(cabOps); U.vaciar(cabFases);
      const ops = cfg.ops;
      if (ops.length > 1) ops.forEach((o, i) => cabOps.appendChild(h('span', { class: 'chip ' + (i < S.op ? 'ok' : (i === S.op ? 'acento' : '')), text: (i < S.op ? '✔ ' : '') + (o.t === 'ins' ? 'Insertar ' + o.v : (o.t === 'del' ? 'Eliminar ' + o.v : 'Rebalancear')) })));
      S.fases.forEach((f, i) => cabFases.appendChild(h('span', { class: 'fase-chip ' + (i < S.fi ? 'hecha' : (i === S.fi ? 'actual' : '')), role: 'listitem', title: f.titulo, text: (i < S.fi ? '✔' : String(i + 1)) })));
      const f = fase(); const op = S.plan;
      U.vaciar(instr);
      if (S.fin) { instr.appendChild(h('strong', { text: '¡Ejercicio completado!' })); return; }
      if (S.pendiente || !f) { instr.appendChild(h('strong', { text: 'Operación completada.' })); instr.appendChild(h('span', { text: ' Revisa el árbol resultante y continúa con la siguiente operación.' })); return; }
      const nombreOp = op.t === 'ins' ? 'Insertar ' + op.v : (op.t === 'del' ? 'Eliminar ' + op.v : 'Corregir el desbalance');
      instr.appendChild(h('div', { class: 'peq tenue', text: (cfg.ops.length > 1 ? 'Operación ' + (S.op + 1) + ' de ' + cfg.ops.length + ' · ' : '') + nombreOp + ' · Fase ' + (S.fi + 1) + ' de ' + S.fases.length }));
      instr.appendChild(h('div', null, h('strong', { text: f.titulo + ': ' }), h('span', { html: U.mdInline(f.instr || (f.id === 'clasificar' ? '¿Qué **tipo de desbalance** tiene el nodo **' + f.nodo + '**?' : '')) })));
    }

    /* ---------- dibujo interactivo ---------- */
    function pintar() {
      const f = fase(); const clases = {};
      if (S.marca) clases[S.marca] = 'desbalanceado';
      if (S.sel && S.sel !== '__nuevo') clases[S.sel] = 'sel';
      if (S.revela && S.revela.nodo) clases[S.revela.nodo] = (clases[S.revela.nodo] ? clases[S.revela.nodo] + ' ' : '') + 'pista-nodo';
      const bandeja = !!(f && f.id === 'colocar' && !S.fin && !S.pendiente);
      const papelera = !!(f && f.id === 'quitar' && S.plan.hijos === 0 && !S.fin && !S.pendiente);
      S.dopts = { geom: GEO, margenX: MARGEN_X, offsetY: (bandeja || papelera) ? OFFSET_Y : 0, extraNiveles: bandeja ? 1 : 0, clases, etiquetas: (cfg.tipo === 'avl' && (S.factores || S.fin || S.pendiente)) ? 'factor' : null, maxAncho: 900 };
      const ctrl = Arb.dibujar(lienzo, S.arbol, S.dopts);
      S.ctrl = ctrl; if (!ctrl.svg) return;
      const svg = ctrl.svg; svg.classList.add('taller-svg');
      const arrastrable = !!f && !S.fin && ['colocar', 'rotar', 'quitar'].includes(f.id);
      svg.style.touchAction = arrastrable ? 'none' : '';
      const capa = U.svgEl('g', { class: 'capa-taller' }); svg.appendChild(capa);
      S.dianas = [];
      ctrl.nodos.forEach((g, key) => {
        const p = ctrl.L.pos.get(key); S.dianas.push({ tipo: 'nodo', key, x: ctrl.X(p), y: ctrl.Y(p) });
        g.classList.add('clic'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'Nodo ' + key);
        g.addEventListener('pointerdown', e => iniciarArrastre(e, key, g));
        g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clicNodo(key); } });
      });
      if (bandeja) {
        const bx = GEO.pad + GEO.r + 8, by = GEO.pad + GEO.r;
        const g = U.svgEl('g', { class: 'nodo nuevo bandeja' + (S.sel === '__nuevo' ? ' sel' : '') + (S.revela && S.revela.slot ? ' pista-nodo' : ''), transform: 'translate(' + bx + ',' + by + ')', tabindex: '0', role: 'button', 'aria-label': 'Nodo nuevo ' + S.plan.v });
        g.appendChild(U.svgEl('circle', { r: GEO.r })); const t = U.svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }); t.textContent = String(S.plan.v); g.appendChild(t);
        const lb = U.svgEl('text', { x: GEO.r + 8, y: 4, class: 'etq-bandeja', 'text-anchor': 'start' }); lb.textContent = '← nodo nuevo'; g.appendChild(lb);
        g.addEventListener('pointerdown', e => iniciarArrastre(e, '__nuevo', g)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clicNodo('__nuevo'); } });
        capa.appendChild(g); S.bandeja = { x: bx, y: by };
        ctrl.L.pos.forEach((p, key) => {
          const n = p.node; const x = ctrl.X(p), y = ctrl.Y(p);
          [['l', n.l, x - GEO.dx * .5], ['r', n.r, x + GEO.dx * .5]].forEach(([ld, hijo, sx]) => {
            if (hijo) return; const sy = y + GEO.dy; const rev = S.revela && S.revela.slot && S.revela.slot.padre === key && S.revela.slot.lado === ld;
            const sg = U.svgEl('g', { class: 'slot' + (rev ? ' pista-slot' : ''), transform: 'translate(' + sx + ',' + sy + ')', tabindex: '0', role: 'button', 'aria-label': 'Hueco ' + lado(ld) + ' de ' + key });
            sg.appendChild(U.svgEl('circle', { r: GEO.r * .72 })); const tx = U.svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }); tx.textContent = '+'; sg.appendChild(tx);
            sg.addEventListener('click', () => clicSlot(key, ld)); sg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clicSlot(key, ld); } });
            capa.appendChild(sg); S.dianas.push({ tipo: 'slot', padre: key, lado: ld, x: sx, y: sy, el: sg });
          });
        });
      }
      if (papelera) {
        const px = ctrl.W - GEO.pad - GEO.r - 8, py = GEO.pad + GEO.r;
        const pg = U.svgEl('g', { class: 'papelera', transform: 'translate(' + px + ',' + py + ')' });
        pg.appendChild(U.svgEl('circle', { r: GEO.r + 4 })); const t = U.svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }); t.textContent = '🗑'; pg.appendChild(t);
        capa.appendChild(pg); S.dianas.push({ tipo: 'papelera', x: px, y: py, el: pg });
      }
    }
    function punto(e) { const svg = S.ctrl.svg; const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    function cercana(p, excluirKey) {
      let mejor = null, d0 = GEO.r * 1.9;
      (S.dianas || []).forEach(d => { if (d.tipo === 'nodo' && d.key === excluirKey) return; const d1 = dist(p, d); if (d1 < d0) { d0 = d1; mejor = d; } });
      return mejor;
    }
    function puedeArrastrar(key) {
      const f = fase(); if (!f || S.fin || S.anim || S.bloq) return false;
      if (f.id === 'colocar') return key === '__nuevo';
      return f.id === 'rotar' || f.id === 'quitar';
    }
    function iniciarArrastre(e, key, g) {
      if (S.anim || S.fin || S.bloq || e.button > 0) return;
      const inicio = punto(e); let movido = false, fantasma = null, prev = null;
      const drag = puedeArrastrar(key);
      try { g.setPointerCapture(e.pointerId); } catch (x) { }
      const mover = ev => {
        const p = punto(ev);
        if (!drag) return;
        if (!movido && dist(p, inicio) > 7) {
          movido = true; fantasma = U.svgEl('g', { class: 'nodo fantasma' }); fantasma.appendChild(U.svgEl('circle', { r: GEO.r })); const t = U.svgEl('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }); t.textContent = key === '__nuevo' ? String(S.plan.v) : key; fantasma.appendChild(t);
          S.ctrl.svg.appendChild(fantasma); g.classList.add('arrastrando');
        }
        if (movido) {
          fantasma.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
          const c = cercana(p, key); if (prev !== c) { if (prev) marcarDiana(prev, false); if (c) marcarDiana(c, true); prev = c; }
        }
      };
      const soltar = ev => {
        g.removeEventListener('pointermove', mover); g.removeEventListener('pointerup', soltar); g.removeEventListener('pointercancel', soltar);
        try { g.releasePointerCapture(e.pointerId); } catch (x) { }
        if (prev) marcarDiana(prev, false);
        if (movido) { const p = punto(ev); const dest = cercana(p, key); fantasma.remove(); g.classList.remove('arrastrando'); if (dest) soltarSobre(key, dest); else mostrar('Suéltalo sobre un nodo o un hueco para que cuente como movimiento.', 'info'); }
        else clicNodo(key);
      };
      g.addEventListener('pointermove', mover); g.addEventListener('pointerup', soltar); g.addEventListener('pointercancel', soltar);
    }
    function marcarDiana(d, on) {
      if (d.tipo === 'nodo') { const g = S.ctrl.nodos.get(d.key); if (g) g.classList.toggle('objetivo', on); }
      else if (d.el) d.el.classList.toggle('cerca', on);
    }

    /* ---------- gestos -> acciones ---------- */
    function clicNodo(key) {
      const f = fase(); if (!f || S.fin || S.anim || S.bloq) return;
      if (f.id === 'detectar') { intentar({ tipo: 'nodo', key }); return; }
      if (f.id === 'colocar') { if (key === '__nuevo') { S.sel = S.sel === '__nuevo' ? null : '__nuevo'; pintar(); mostrar(S.sel ? 'Nodo nuevo seleccionado: toca el hueco donde va (o arrástralo).' : '', 'info'); } else mostrar('En esta fase mueve el **nodo nuevo** a un hueco (círculo punteado).', 'info'); return; }
      if (f.id === 'rotar' || f.id === 'quitar') { S.sel = S.sel === key ? null : key; pintar(); pintarControles(); return; }
      mostrar('Ahora responde con los botones de abajo.', 'info');
    }
    function clicSlot(padre, ld) {
      const f = fase(); if (!f || f.id !== 'colocar' || S.anim || S.fin || S.bloq) return;
      if (S.sel !== '__nuevo') { mostrar('Primero toca el **nodo nuevo** (o arrástralo) y luego el hueco.', 'info'); return; }
      intentar({ tipo: 'slot', padre, lado: ld });
    }
    function soltarSobre(src, dest) {
      const f = fase(); if (!f) return;
      if (f.id === 'colocar') { if (dest.tipo === 'slot') intentar({ tipo: 'slot', padre: dest.padre, lado: dest.lado }); else mostrar('Suelta el nodo nuevo en un **hueco** (círculo punteado), no sobre otro nodo.', 'info'); return; }
      if (f.id === 'rotar') {
        if (dest.tipo !== 'nodo') return;
        const rel = padreDe(src);
        if (!rel || kk(rel.padre) !== dest.key) { mostrar('Para rotar, arrastra **un hijo sobre su padre**.', 'info'); return; }
        intentar({ tipo: 'rot', rot: rel.lado === 'l' ? 'derecha' : 'izquierda', sobre: dest.key }); return;
      }
      if (f.id === 'quitar') {
        if (dest.tipo === 'papelera') intentar({ tipo: 'papelera', key: src });
        else if (dest.tipo === 'nodo') intentar({ tipo: 'reemplazo', src, dest: dest.key });
      }
    }

    /* ---------- controles por fase ---------- */
    function pintarControles() {
      U.vaciar(ctrls); const f = fase(); if (!f || S.fin) return;
      if (f.id === 'detectar') ctrls.appendChild(btn('✔ Ningún nodo desbalanceado', () => intentar({ tipo: 'ninguno' })));
      if (f.id === 'clasificar') ['LL', 'RR', 'LR', 'RL'].forEach(c => ctrls.appendChild(btn(NOMBRES[c], () => intentar({ tipo: 'caso', v: c }))));
      if (f.id === 'tipoDel') [0, 1, 2].forEach(n => ctrls.appendChild(btn(n === 0 ? 'Hoja (0 hijos)' : n + (n === 1 ? ' hijo' : ' hijos'), () => intentar({ tipo: 'tipoDel', n }))));
      if (f.id === 'rotar') {
        const ok = !!S.sel && S.sel !== '__nuevo';
        ctrls.appendChild(h('span', { class: 'peq suave', text: ok ? 'Pivote seleccionado: ' + S.sel : 'Toca el nodo pivote para usar los botones →' }));
        ctrls.appendChild(btn('↻ Rotar a la derecha', () => intentar({ tipo: 'rot', rot: 'derecha', sobre: S.sel }), 'sec', !ok));
        ctrls.appendChild(btn('↺ Rotar a la izquierda', () => intentar({ tipo: 'rot', rot: 'izquierda', sobre: S.sel }), 'sec', !ok));
      }
      if (f.id === 'quitar') {
        const ok = !!S.sel && S.sel !== '__nuevo';
        ctrls.appendChild(h('span', { class: 'peq suave', text: ok ? 'Seleccionado: ' + S.sel : 'Toca un nodo (o arrástralo) →' }));
        if (S.plan.hijos === 0) ctrls.appendChild(btn('🗑 Eliminar el nodo seleccionado', () => intentar({ tipo: 'papelera', key: S.sel }), 'sec', !ok));
        else ctrls.appendChild(btn('⇢ Colocar sobre ' + S.plan.v, () => intentar({ tipo: 'reemplazo', src: S.sel, dest: String(S.plan.v) }), 'sec', !ok));
      }
    }
    function pintarPie() {
      U.vaciar(pie); if (S.fin) { pie.appendChild(btn('↺ Repetir el ejercicio', reiniciar, 'sec')); return; }
      const f = fase();
      pie.appendChild(btn('💡 Pista (' + S.hf + '/3)', pista, 'sec', S.hf >= 3));
      if (cfg.tipo === 'avl') pie.appendChild(btn(S.factores ? '🙈 Ocultar factores' : '👁 Mostrar factores', () => { if (!S.factores && !S.factoresContados) { S.factoresContados = true; S.pistas++; } S.factores = !S.factores; pintar(); pintarPie(); }, 'fantasma'));
      pie.appendChild(btn('↺ Reiniciar', () => { if (confirm('¿Reiniciar el ejercicio desde el principio?')) reiniciar(); }, 'fantasma'));
      pie.appendChild(h('span', { class: 'peq tenue', style: { marginLeft: 'auto' }, text: 'Intentos fallidos: ' + S.fallos + ' · Pistas: ' + S.pistas }));
    }

    /* ---------- validación ---------- */
    function validar(f, a) {
      const plan = S.plan;
      switch (f.id) {
        case 'colocar': {
          if (a.tipo !== 'slot') return { ok: false, blando: true, msg1: 'Suelta el nodo nuevo en un hueco.' };
          if (a.padre === plan.pos.padre && a.lado === plan.pos.lado) return { ok: true };
          const p = Arb.hallar(S.arbol, a.padre); const menor = Arb.lt(plan.v, p.v); const debe = menor ? 'l' : 'r';
          return { ok: false, msg1: 'Esa posición no es la correcta: no respeta el orden del BST.', msg2: debe !== a.lado ? plan.v + ' es ' + (menor ? 'menor' : 'mayor') + ' que ' + p.v + ': no puede ir a la ' + (a.lado === 'l' ? 'izquierda' : 'derecha') + ' de ' + p.v + '.' : 'Compara ' + plan.v + ' con la raíz y baja siguiendo las comparaciones: ese hueco no queda al final del camino.' };
        }
        case 'detectar': {
          const esp = f.nodo;
          if (a.tipo === 'ninguno') return esp === null ? { ok: true } : { ok: false, msg1: 'Sí hay un nodo desbalanceado.', msg2: 'Calcula los factores desde las hojas hacia arriba (hoja = 0, vacío = −1).' };
          if (esp === null) return { ok: false, msg1: 'El nodo ' + a.key + ' no está desbalanceado.', msg2: 'Todos los nodos cumplen |factor| ≤ 1.' };
          if (a.key === esp) return { ok: true };
          const n = Arb.hallar(S.arbol, a.key);
          if (Math.abs(Arb.factor(n)) < 2) return { ok: false, msg1: 'El nodo ' + a.key + ' está balanceado (|factor| ≤ 1).', msg2: 'Busca un nodo con |factor| = 2.' };
          return { ok: false, msg1: 'El nodo ' + a.key + ' también está desbalanceado, pero no es el primero.', msg2: 'El primero es el más profundo: se corrige de abajo hacia arriba.' };
        }
        case 'clasificar': {
          if (a.v === f.caso) return { ok: true };
          const recta = c => c === 'LL' || c === 'RR';
          return { ok: false, msg1: 'Ese no es el tipo de desbalance.', msg2: recta(a.v) === recta(f.caso) ? 'La forma (línea recta o zigzag) coincide, pero revisa hacia qué lado pesa el nodo (+2 = izquierda, −2 = derecha).' : 'Revisa si el camino hacia el nodo nuevo es una línea recta o un zigzag desde el nodo desbalanceado.' };
        }
        case 'rotar': {
          const e = f.paso; const n = Arb.hallar(S.arbol, a.sobre);
          if (!n) return { ok: false, blando: true, msg1: 'Selecciona primero un nodo.' };
          if (a.rot === 'derecha' ? !n.l : !n.r) return { ok: false, blando: true, msg1: 'No se puede rotar a la ' + a.rot + ' sobre ' + a.sobre + ': no tiene hijo ' + (a.rot === 'derecha' ? 'izquierdo' : 'derecho') + '.' };
          if (a.rot === e.rot && String(a.sobre) === String(e.sobre)) return { ok: true };
          return { ok: false, msg1: 'Ese giro no es el que corresponde ahora.', msg2: String(a.sobre) === String(e.sobre) ? 'El nodo pivote es correcto, pero la dirección no.' : (a.rot === e.rot ? 'La dirección es correcta, pero ese no es el nodo pivote.' : 'Ni el pivote ni la dirección son los que corresponden.') };
        }
        case 'tipoDel': return a.n === plan.hijos ? { ok: true } : { ok: false, msg1: 'Revisa los hijos del nodo ' + plan.v + '.', msg2: 'Cuenta cuántos hijos tiene (izquierdo y/o derecho).' };
        case 'quitar': {
          if (plan.hijos === 0) return (a.tipo === 'papelera' && String(a.key) === String(plan.v)) ? { ok: true } : { ok: false, msg1: 'Eso no elimina el nodo ' + plan.v + '.', msg2: 'Una hoja se quita llevándola a la papelera.' };
          if (a.tipo === 'reemplazo' && a.dest === String(plan.v) && a.src === plan.reemplazo) return { ok: true };
          if (a.tipo !== 'reemplazo') return { ok: false, msg1: 'Un nodo con hijos no se quita sin más: hay que reemplazarlo.', msg2: 'Arrastra el sustituto sobre ' + plan.v + '.' };
          if (a.dest !== String(plan.v)) return { ok: false, msg1: 'El sustituto debe colocarse sobre el nodo que se elimina (' + plan.v + ').' };
          return { ok: false, msg1: 'Ese no es el sustituto correcto.', msg2: plan.hijos === 1 ? 'Con un solo hijo, ese hijo ocupa su lugar.' : 'Es el ' + (plan.modo === 'suc' ? 'menor valor del subárbol derecho (sucesor inorden)' : 'mayor valor del subárbol izquierdo (predecesor inorden)') + '.' };
        }
      }
      return { ok: false, msg1: 'Acción no reconocida.' };
    }

    async function intentar(acc) {
      const f = fase(); if (!f || S.fin || S.anim || S.bloq) return;
      const v = validar(f, acc);
      if (!v.ok) {
        if (!v.blando) {
          S.fallos++; S.ff++;
          if (cfg.onError) cfg.onError(f.id === 'clasificar' && acc.v !== f.caso ? { fase: f.id, confusion: { dado: acc.v, correcta: f.caso } } : { fase: f.id });
        }
        const extra = (!v.blando && S.ff >= 2 && v.msg2) ? ' ' + v.msg2 : '';
        const sug = (!v.blando && S.ff >= 3) ? ' Si te atascas, usa **💡 Pista**.' : '';
        mostrar('✘ ' + v.msg1 + extra + (v.blando ? '' : ' **Inténtalo de nuevo:** el árbol no cambió.') + sug, 'mal');
        raiz.classList.remove('sacudir'); void raiz.offsetWidth; raiz.classList.add('sacudir');
        S.sel = (f.id === 'rotar' || f.id === 'quitar') ? null : S.sel; pintar(); pintarControles(); pintarPie();
        return;
      }
      await aceptar(f, acc);
    }
    const animar = async (A, B) => {
      S.anim = true;
      try { await Arb.animarTransicion(lienzo, A, B, { geom: GEO, margenX: MARGEN_X, offsetY: S.dopts ? S.dopts.offsetY : 0, extraNiveles: S.dopts ? S.dopts.extraNiveles : 0, maxAncho: 900, dur: 750, espera: 60, sinAnimar: !!cfg.sinAnimar }); }
      finally { S.anim = false; }
    };
    async function aceptar(f, acc) {
      const plan = S.plan; S.ff = 0; S.hf = 0; S.revela = null; S.sel = null;
      if (f.id === 'colocar') { mostrar('✔ Bien: se cuelga como hoja.', 'ok'); await animar(S.arbol, plan.bst); S.arbol = plan.bst; }
      else if (f.id === 'detectar') { S.marca = f.nodo; mostrar(f.nodo === null ? '✔ Correcto: todos los nodos están balanceados.' : '✔ Correcto: el primer nodo desbalanceado es **' + f.nodo + '**.', 'ok'); }
      else if (f.id === 'clasificar') mostrar('✔ Correcto: **' + NOMBRES[f.caso] + '**. ' + (f.caso === 'LL' || f.caso === 'RR' ? 'Es una línea recta: una rotación.' : 'Es un zigzag: dos rotaciones, primero en el hijo.'), 'ok');
      else if (f.id === 'rotar') {
        mostrar('✔ Rotación a la ' + f.paso.rot + ' sobre ' + f.paso.sobre + '.', 'ok'); await animar(S.arbol, f.paso.despues); S.arbol = f.paso.despues;
        if (f.j === f.de - 1) S.marca = null;
      }
      else if (f.id === 'tipoDel') mostrar('✔ Correcto: ' + (plan.hijos === 0 ? 'es una hoja' : (plan.hijos === 1 ? 'tiene un solo hijo' : 'tiene dos hijos')) + '.', 'ok');
      else if (f.id === 'quitar') { mostrar('✔ Nodo eliminado correctamente.', 'ok'); await animar(S.arbol, plan.bst); S.arbol = plan.bst; }
      S.fi++;
      if (S.fi >= S.fases.length) { terminarOp(); return; }
      pintarCab(); pintar(); pintarControles(); pintarPie();
    }
    function terminarOp() {
      S.arbol = S.plan.final; S.marca = null;
      if (S.op + 1 < cfg.ops.length) {
        S.op++; mostrar('✔ Operación completada. Árbol: `' + Arb.nota(S.arbol) + '`', 'ok');
        S.pendiente = true; S.fi = S.fases.length; S.sel = null; S.revela = null;
        pintarCab(); pintar(); U.vaciar(ctrls); U.vaciar(pie);
        ctrls.appendChild(btn('Siguiente operación ▶', siguienteOp, ''));
      } else terminarTodo();
    }
    function siguienteOp() { if (!S.pendiente) return; S.factores = false; S.factoresContados = false; S.pendiente = false; cargarOp(); }
    function terminarTodo() {
      S.fin = true; S.op = cfg.ops.length; S.marca = null;
      pintarCab(); pintar(); U.vaciar(ctrls); pintarPie();
      const res = { ok: true, fallos: S.fallos, pistas: S.pistas, ops: cfg.ops.length };
      mostrar('🎉 **¡Listo!** Árbol final: `' + Arb.nota(S.arbol) + '` · altura ' + Arb.altura(S.arbol) + ' · ' + S.fallos + ' intento(s) fallido(s) · ' + S.pistas + ' pista(s).', 'ok');
      if (cfg.onFin) cfg.onFin(res); S.cbs.forEach(fn => { try { fn(res); } catch (e) { console.error(e); } });
    }

    /* ---------- pistas ---------- */
    function pista() {
      const f = fase(); if (!f || S.hf >= 3 || S.fin || S.anim) return;
      S.hf++; S.pistas++; const plan = S.plan;
      let t = '', rev = null;
      switch (f.id) {
        case 'colocar': t = [
          'Compara el valor nuevo con la raíz: si es menor baja a la izquierda; si es mayor, a la derecha. Repite en cada nodo hasta llegar a un hueco vacío.',
          'Se cuelga como hijo ' + lado(plan.pos.lado) + ' de un nodo del camino de comparaciones (no de la raíz si hay más niveles).',
          'Va como hijo ' + lado(plan.pos.lado) + ' del nodo **' + plan.pos.padre + '**.'][S.hf - 1]; if (S.hf === 3) rev = { slot: { padre: plan.pos.padre, lado: plan.pos.lado } }; break;
        case 'detectar': t = [
          'Calcula las alturas empezando por las hojas (hoja = 0, hijo vacío = −1) y luego el factor = altura(izq) − altura(der) de cada nodo.',
          f.nodo === null ? 'Revisa todos los nodos del camino hacia la raíz: ¿alguno llega a ±2?' : 'El desbalance está en un ancestro del último nodo que cambió, sobre el camino hacia la raíz.',
          f.nodo === null ? 'Ningún nodo está desbalanceado: pulsa «Ningún nodo».' : 'El nodo es **' + f.nodo + '**.'][S.hf - 1]; if (S.hf === 3 && f.nodo !== null) rev = { nodo: f.nodo }; break;
        case 'clasificar': t = [
          'Mira el signo del factor del nodo desbalanceado: +2 pesa a la izquierda, −2 a la derecha. Luego mira hacia dónde pesa su hijo.',
          'Es ' + (f.caso === 'LL' || f.caso === 'RR' ? 'una **línea recta** (el hijo pesa hacia el mismo lado que el nodo).' : 'un **zigzag** (el hijo pesa hacia el lado contrario).'),
          'Es el caso **' + NOMBRES[f.caso] + '**.'][S.hf - 1]; break;
        case 'rotar': t = [
          'Línea recta: una rotación sobre el nodo desbalanceado. Zigzag: primero se rota el hijo (para enderezarlo) y luego el nodo desbalanceado.',
          'El pivote de este giro es el nodo **' + f.paso.sobre + '**.',
          'Rota a la **' + f.paso.rot + '** sobre **' + f.paso.sobre + '** (arrastra su hijo ' + (f.paso.rot === 'derecha' ? 'izquierdo' : 'derecho') + ' sobre él).'][S.hf - 1]; if (S.hf >= 2) rev = { nodo: String(f.paso.sobre) }; break;
        case 'tipoDel': t = ['Cuenta los hijos del nodo en el dibujo.', 'Piensa: ¿tiene hijo izquierdo? ¿hijo derecho?', 'Tiene **' + plan.hijos + '** hijo(s).'][S.hf - 1]; if (S.hf === 3) rev = { nodo: String(plan.v) }; break;
        case 'quitar': t = ['Hoja: se quita. Un hijo: lo reemplaza su hijo. Dos hijos: lo reemplaza el ' + (plan.modo === 'suc' ? 'sucesor' : 'predecesor') + ' inorden.', plan.hijos === 0 ? 'Llévalo a la papelera.' : 'El sustituto está en el subárbol del nodo ' + plan.v + '.', plan.hijos === 0 ? 'Arrastra **' + plan.v + '** a la papelera.' : 'El sustituto es el nodo **' + plan.reemplazo + '**.'][S.hf - 1]; if (S.hf >= 2) rev = { nodo: plan.hijos === 0 ? String(plan.v) : plan.reemplazo }; break;
      }
      S.revela = rev; mostrar('💡 **Pista ' + S.hf + '/3:** ' + t, 'info'); pintar(); pintarControles(); pintarPie();
    }

    /* ---------- ciclo de vida ---------- */
    function cargarOp() {
      // en un árbol vacío la primera inserción no tiene decisión: el nodo es la raíz
      while (S.op < cfg.ops.length && !S.arbol && cfg.ops[S.op].t === 'ins') { S.arbol = Arb.N(cfg.ops[S.op].v); S.op++; }
      if (S.op >= cfg.ops.length) { S.plan = S.plan || { t: 'ins', v: null, ciclos: [], final: S.arbol }; S.fases = []; terminarTodo(); return; }
      const op = cfg.ops[S.op]; S.plan = planOp(S.arbol, op, cfg); S.fases = construirFases(S.plan, cfg); S.fi = 0; S.ff = 0; S.hf = 0; S.sel = null; S.marca = null; S.revela = null;
      if (!S.fases.length) { terminarOp(); return; }
      mostrar('', ''); pintarCab(); pintar(); pintarControles(); pintarPie();
    }
    function reiniciar() {
      S.arbol = cfg.arbol; S.op = 0; S.fallos = 0; S.pistas = 0; S.fin = false; S.factores = false; S.factoresContados = false; S.pendiente = false; S.plan = null;
      cargarOp();
    }
    /** (solo pruebas) acción correcta para la fase actual */
    function accionCorrecta() {
      const f = fase(), plan = S.plan; if (!f) return null;
      switch (f.id) {
        case 'colocar': return { tipo: 'slot', padre: plan.pos.padre, lado: plan.pos.lado };
        case 'detectar': return f.nodo === null ? { tipo: 'ninguno' } : { tipo: 'nodo', key: f.nodo };
        case 'clasificar': return { tipo: 'caso', v: f.caso };
        case 'rotar': return { tipo: 'rot', rot: f.paso.rot, sobre: String(f.paso.sobre) };
        case 'tipoDel': return { tipo: 'tipoDel', n: plan.hijos };
        case 'quitar': return plan.hijos === 0 ? { tipo: 'papelera', key: String(plan.v) } : { tipo: 'reemplazo', src: plan.reemplazo, dest: String(plan.v) };
      }
      return null;
    }
    async function autoResolver() {
      let guard = 0;
      while (!S.fin && guard++ < 400) {
        if (S.pendiente) { siguienteOp(); continue; }
        const a = accionCorrecta(); if (!a) break; await intentar(a);
      }
      return S.fin;
    }

    cargarOp();

    return {
      el: raiz,
      resultado: () => ({ fin: S.fin, fallos: S.fallos, pistas: S.pistas, ops: cfg.ops.length }),
      onCompletar(fn) { S.cbs.push(fn); if (S.fin) fn({ ok: true, fallos: S.fallos, pistas: S.pistas }); },
      lock(b) { S.bloq = !!b; raiz.classList.toggle('bloqueado', !!b); },
      forzarFin(res) { S.fin = true; S.pendiente = false; S.fallos = res.fallos || 0; S.pistas = res.pistas || 0; S.op = cfg.ops.length; S.arbol = S.plan && S.plan.final ? S.plan.final : S.arbol; pintarCab(); pintar(); U.vaciar(ctrls); pintarPie(); mostrar('Ejercicio completado.', 'ok'); },
      reiniciar,
      /** ganchos para las pruebas automáticas */
      _t: { intentar, fase, estado: () => S, accionCorrecta, autoResolver, avanzar: siguienteOp, clicNodo, pista }
    };
  };

  /* ===================== tipo de pregunta «taller» ===================== */
  const Tipos = ET.Tipos;
  const nombreOp = o => o.t === 'ins' ? 'insertar ' + o.v : (o.t === 'del' ? 'eliminar ' + o.v : 'rebalancear');
  /** explicación escrita (paso a paso) de lo que hace el taller; sirve de solución */
  function resolucionHtml(q) {
    const cfg = q.taller; let t = cfg.arbol; const out = [];
    cfg.ops.forEach(op => {
      if (!t && op.t === 'ins') { t = Arb.N(op.v); out.push('<li><strong>Insertar ' + op.v + '</strong>: árbol vacío, el nodo es la raíz.</li>'); return; }
      const p = planOp(t, op, cfg); let s = '<li><strong>' + nombreOp(op).replace(/^./, c => c.toUpperCase()) + '</strong>';
      if (p.t === 'ins') s += ': ' + (p.pos.padre === null ? 'raíz' : 'se cuelga como hijo ' + lado(p.pos.lado) + ' de ' + p.pos.padre) + '.';
      if (p.t === 'del') s += ': el nodo tiene ' + p.hijos + ' hijo(s)' + (p.hijos === 0 ? ' → se quita.' : (p.hijos === 1 ? ' → lo reemplaza su hijo ' + p.reemplazo + '.' : ' → lo reemplaza el ' + (p.modo === 'suc' ? 'sucesor' : 'predecesor') + ' inorden, ' + p.reemplazo + '.'));
      if (cfg.tipo === 'avl') {
        if (!p.ciclos.length) s += ' Todos los factores quedan en {−1, 0, +1}: no hay rotación.';
        p.ciclos.forEach(c => { s += '<br>Desbalance en <strong>' + c.nodo + '</strong>: caso <strong>' + NOMBRES[c.caso] + '</strong> → ' + c.pasos.map(x => 'rotación a la ' + x.rot + ' sobre ' + x.sobre).join(', luego ') + '.'; });
      }
      s += '<br>Árbol: <code>' + U.esc(Arb.nota(p.final)) + '</code></li>'; out.push(s); t = p.final;
    });
    return '<ol>' + out.join('') + '</ol>';
  }
  Taller.planOp = planOp; Taller.construirFases = construirFases; Taller.resolucionHtml = resolucionHtml;

  Tipos.taller = {
    render(host, q, ctx) {
      Tipos.cabecera(host, q, ctx);
      host.appendChild(h('div', { class: 'ayuda-formato', html: U.mdInline('**Modo estricto:** si tu movimiento no es correcto **no se acepta**, el árbol no cambia y no se muestra el resultado: inténtalo de nuevo. Puedes arrastrar con el mouse/dedo o tocar el nodo y usar los botones. Las pistas del ejercicio están dentro del taller (cuestan puntos).') }));
      const caja = h('div'); host.appendChild(caja);
      const cfg = Object.assign({}, q.taller, { onError: (info) => { if (ET.Motor && ET.Motor.registrarConfusion && info && info.confusion) ET.Motor.registrarConfusion(info.confusion.dado, info.confusion.correcta); } });
      if (ctx && ctx.sinAnimar) cfg.sinAnimar = true;
      const w = Taller.montar(caja, cfg); const cbs = [];
      w.onCompletar(r => cbs.forEach(f => f(r)));
      return {
        getAnswer: () => w.resultado(),
        setAnswer(a) { if (a && a.fin) w.forzarFin(a); },
        isEmpty: () => !w.resultado().fin,
        lock: b => w.lock(b),
        onChange: f => { cbs.push(f); }, onCompletar: f => w.onCompletar(f),
        focus() { }, marcar() { }, limpiarMarcas() { },
        taller: w
      };
    },
    grade(q, ans) {
      if (!ans || !ans.fin) return { score: 0, ok: false, items: [{ ok: false, html: 'Aún no terminas el ejercicio: completa todas las fases.' }] };
      const f = ans.fallos || 0, p = ans.pistas || 0;
      const score = Math.max(0.3, 1 - 0.06 * f - 0.1 * p);
      const items = [{ ok: true, html: 'Completaste todas las fases del ejercicio.' }];
      items.push({ ok: f === 0 ? true : null, html: f === 0 ? 'Sin intentos fallidos.' : 'Intentos fallidos: **' + f + '** (cada uno resta un poco de crédito).' });
      if (p) items.push({ ok: null, html: 'Pistas usadas dentro del taller: **' + p + '** (cada una resta crédito).' });
      return { score, ok: true, items };
    },
    solve(q) { return { fin: true, fallos: 0, pistas: 0 }; },
    solucionHtml(q) {
      const nota = Arb.nota(q.taller.finalEsperado);
      return '<p>Procedimiento correcto:</p>' + resolucionHtml(q) + '<div class="arbol-draw sol" data-nota="' + U.esc(nota) + '" data-etq="' + (q.taller.tipo === 'avl' ? 'factor' : '') + '"></div>';
    },
    respuestaHtml(q, ans) { return ans && ans.fin ? 'Ejercicio completado con <strong>' + (ans.fallos || 0) + '</strong> intento(s) fallido(s) y <strong>' + (ans.pistas || 0) + '</strong> pista(s).' : '<em>No terminaste el ejercicio.</em>'; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
