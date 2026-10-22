/* tipos2.js — tipos de pregunta (parte 2): código, árboles, rotaciones AVL y mixtas */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const U = ET.U, h = U.h, Tipos = ET.Tipos, Arb = ET.Arb, Py = ET.Py;
  const md = U.md, mdi = U.mdInline, esc = U.esc;
  const ok = (html) => ({ ok: true, html });
  const mal = (html) => ({ ok: false, html });
  const info = (html) => ({ ok: null, html });
  let UIDN = 1000; const nuevoId = () => 'c' + (++UIDN);

  /* =============================== código =============================== */
  function ensamblar(q, huecos) {
    huecos = huecos || {};
    return q.plantilla.replace(/\[\[(\w+)\]\]/g, (m, id) => (huecos[id] == null ? '' : String(huecos[id]).trim()));
  }
  function consolaHtml(res) {
    // res: {stdout, error, valor}
    let s = '';
    if (res.stdout) s += '<pre class="consola-out">' + esc(res.stdout) + '</pre>';
    if (res.valor !== undefined) s += '<pre class="consola-val">' + esc(res.valor) + '</pre>';
    if (res.error) s += '<pre class="consola-err">' + esc(Py.textoError(res.error)) + '</pre>';
    return s || '<em class="peq">(sin salida)</em>';
  }
  Tipos.codigo = {
    render(host, q, ctx) {
      Tipos.cabecera(host, q, ctx);
      const modo = q.modoEj || 'codigo';
      let editor = null, huecos = null;
      const oyentes = [];
      if (modo === 'completar') {
        huecos = ET.Editor.crearHuecos(q.plantilla, { anchos: q.anchos });
        host.appendChild(h('div', { class: 'ayuda-formato', text: 'Completa los huecos (cada hueco es una expresión o instrucción de Python).' }));
        host.appendChild(huecos.el);
        huecos.onChange(() => oyentes.forEach(f => f()));
      } else {
        if (modo === 'depurar') host.appendChild(h('div', { class: 'ayuda-formato', text: 'Este código tiene al menos un error. Corrígelo directamente en el editor.' }));
        editor = ET.Editor.crear({ valor: q.starter || '', onEjecutar: () => ejecutar(), minLineas: q.lineas || 9 });
        host.appendChild(editor.el);
        editor.onChange(() => oyentes.forEach(f => f()));
      }
      const getCodigo = () => modo === 'completar' ? ensamblar(q, huecos.getHuecos()) : editor.getValue();
      // consola
      const puede = ctx.modo !== 'examen' || ctx.permitirEjecutar;
      let panel = null, salida = null, exprIn = null;
      function ejecutar() {
        if (!puede) return;
        const codigo = getCodigo();
        const r = Py.ejecutar(codigo, { prelude: q.prelude, maxSteps: 1500000 });
        salida.innerHTML = consolaHtml({ stdout: r.stdout, error: r.error });
      }
      function probar() {
        const expr = exprIn.value.trim(); if (!expr) return;
        const s = Py.sesion(getCodigo(), { prelude: q.prelude, maxSteps: 1500000 });
        if (!s.ok) { salida.innerHTML = consolaHtml({ stdout: s.stdout, error: s.error }); return; }
        const r = s.evaluar(expr);
        salida.innerHTML = consolaHtml(r.ok ? { stdout: s.interp.out.join(''), valor: r.repr } : { stdout: s.interp.out.join(''), error: r.error });
      }
      if (puede) {
        exprIn = h('input', { type: 'text', class: 'consola-in', placeholder: 'Prueba una expresión, p. ej. ' + (q.ejemploLlamada || (q.fn ? q.fn + '(…)' : '')), spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Expresión de prueba' });
        exprIn.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); probar(); } });
        salida = h('div', { class: 'consola-salida', 'aria-live': 'polite' }, h('em', { class: 'peq', text: 'Aquí verás lo que imprime tu código y el resultado de tus pruebas. ' + (ctx.modo === 'examen' ? '' : '(Es solo una consola: no te dice si tu solución es correcta; eso lo hace "Comprobar").') }));
        panel = h('div', { class: 'consola' },
          h('div', { class: 'consola-barra' },
            h('button', { type: 'button', class: 'btn sec peq', onclick: ejecutar, title: 'Ctrl+Enter' }, '▶ Ejecutar código'),
            exprIn, h('button', { type: 'button', class: 'btn sec peq', onclick: probar }, 'Probar'),
            (modo !== 'completar') ? h('button', { type: 'button', class: 'btn fantasma peq', onclick: () => { if (confirm('¿Restablecer el código inicial?')) { editor.setValue(q.starter || ''); oyentes.forEach(f => f()); } } }, 'Restablecer') : null),
          salida);
        host.appendChild(panel);
        host.appendChild(h('div', { class: 'ayuda-formato', html: mdi('Intérprete propio del entrenador (subconjunto de Python): no es CPython; los límites están en el README.') }));
      }
      return {
        getAnswer: () => modo === 'completar' ? { huecos: huecos.getHuecos() } : { codigo: editor.getValue() },
        setAnswer(a) { if (!a) return; if (modo === 'completar') huecos.setHuecos(a.huecos || {}); else editor.setValue(a.codigo || ''); },
        isEmpty() { if (modo === 'completar') return Object.values(huecos.getHuecos()).every(x => !String(x).trim()); return !editor.getValue().trim(); },
        lock(b) { if (editor) editor.lock(b); if (huecos) huecos.lock(b); },
        onChange(f) { oyentes.push(f); }, focus() { if (editor) editor.focus(); },
        marcar(res) { if (huecos && res.huecosOk) for (const k in res.huecosOk) huecos.marcar(k, res.huecosOk[k]); },
        limpiarMarcas() { if (huecos) huecos.limpiarMarcas(); }
      };
    },
    grade(q, ans, ctx) {
      ctx = ctx || {};
      const modo = q.modoEj || 'codigo';
      ans = ans || {};
      const items = [];
      let codigo;
      if (modo === 'completar') {
        const hs = ans.huecos || {};
        const ids = Array.from(q.plantilla.matchAll(/\[\[(\w+)\]\]/g)).map(m => m[1]);
        const vacios = ids.filter(id => !String(hs[id] || '').trim());
        if (vacios.length) return { score: 0, ok: false, items: [mal('Hay huecos sin completar (' + vacios.length + ' de ' + ids.length + ').')], huecosOk: Object.fromEntries(vacios.map(i => [i, false])) };
        codigo = ensamblar(q, hs);
      } else codigo = ans.codigo || '';
      if (!codigo.trim()) return { score: 0, ok: false, items: [mal('No has escrito código.')] };
      const r = Py.ejecutarPruebas(codigo, { prelude: q.prelude, tests: q.tests, reglas: q.reglas, fn: q.fn, maxSteps: q.maxSteps });
      const res = { score: 0, ok: false, items, extra: { pruebas: r } };
      if (!r.cargaOk) {
        const e = r.errorCarga;
        if (e && e.sintaxis) items.push(mal('**Error de sintaxis' + (e.linea ? ' (línea ' + e.linea + ')' : '') + ':** ' + e.msg + '.'));
        else items.push(mal('**Tu código falla al cargarse:** ' + Py.textoError(e)));
        if (ctx.modo !== 'examen') Py.diagnosticos(codigo, { fn: q.fn, arbol: q.cls_arbol }).forEach(d => items.push(d.nivel === 'error' ? mal(d.msg) : info(d.msg)));
        return res;
      }
      const reglasMal = r.reglas.filter(x => !x.ok);
      // pruebas de eficiencia (ef): si todas las de corrección pasan pero la solución es lenta, vale la mitad (criterio del parcial)
      const corr = r.pruebas.filter(p => !p.ef), efi = r.pruebas.filter(p => p.ef);
      const corrOk = corr.filter(p => p.ok).length, efiOk = efi.every(p => p.ok);
      const base = corr.length ? corrOk / corr.length : 1;
      const lenta = efi.length > 0 && !efiOk;
      res.score = (reglasMal.length ? Math.min(base, 0.5) * 0.9 : base) * (lenta ? 0.5 : 1);
      res.ok = corrOk === corr.length && reglasMal.length === 0 && !lenta;
      if (corrOk === corr.length) items.push(ok('Pasaste **' + corrOk + ' de ' + corr.length + '** pruebas de corrección' + (efi.length ? (efiOk ? ' y la de eficiencia.' : '.') : '.')));
      else items.push(mal('Pasaste **' + corrOk + ' de ' + corr.length + '** pruebas de corrección.'));
      if (lenta) items.push(mal('**Eficiencia:** ' + (corrOk === corr.length ? 'tu solución es correcta pero **demasiado lenta** (por ejemplo, un doble ciclo O(n²) cuando se pedía O(n)): en el parcial vale **la mitad**.' : 'además, no cumple la eficiencia pedida (el puntaje se reduce a la mitad).')));
      reglasMal.forEach(x => items.push(mal('**Requisito no cumplido:** ' + x.msg)));
      const fallos = r.pruebas.filter(p => !p.ok);
      fallos.slice(0, ctx.modo === 'examen' ? 4 : 3).forEach(p => {
        if (p.interno) { items.push(info('Prueba interna: ' + esc(p.msg))); return; }
        if (p.error) items.push(mal('`' + p.desc + '` produjo un error → ' + (p.msg || '')));
        else if (p.msg) items.push(mal('`' + p.desc + '` → ' + p.msg));
        else items.push(mal('`' + p.desc + '` devolvió `' + p.obtenido + '` pero se esperaba `' + p.esperado + '`.'));
      });
      if (fallos.length > 3) items.push(info('… y ' + (fallos.length - (ctx.modo === 'examen' ? 4 : 3)) + ' prueba(s) más con fallos.'));
      if (!res.ok && ctx.modo !== 'examen') {
        const diag = Py.diagnosticos(codigo, { fn: q.fn, arbol: q.cls_arbol });
        diag.forEach(d => items.push(d.nivel === 'error' ? mal(d.msg) : info(d.msg)));
        if (fallos.some(p => p.obtenido === 'None') && !diag.length) items.push(info('Alguna prueba devolvió `None`: ¿olvidaste un `return` en alguna rama?'));
      }
      if (modo === 'completar' && !res.ok && q.respuestas) {
        res.huecosOk = {};
        for (const id in q.respuestas) {
          const alts = q.respuestas[id].map(U.normCompacto);
          res.huecosOk[id] = alts.includes(U.normCompacto((ans.huecos || {})[id] || ''));
        }
        const malos = Object.keys(res.huecosOk).filter(k => !res.huecosOk[k]);
        if (malos.length && ctx.modo !== 'examen') items.push(info('Los huecos ' + malos.join(', ') + ' no coinciden con la solución de referencia (pueden ser expresiones equivalentes, pero revisa esos primero).'));
      }
      return res;
    },
    solve(q) {
      if ((q.modoEj || 'codigo') === 'completar') { const o = {}; for (const k in q.respuestas) o[k] = q.respuestas[k][0]; return { huecos: o }; }
      return { codigo: q.solucion };
    },
    solucionHtml(q) {
      const modo = q.modoEj || 'codigo';
      let cod = modo === 'completar' ? ensamblar(q, Object.fromEntries(Object.entries(q.respuestas).map(([k, v]) => [k, v[0]]))) : q.solucion;
      return '<p>Una solución de referencia:</p>' + U.htmlCodigo(cod) + (q.explicacionSol ? md(q.explicacionSol) : '');
    },
    respuestaHtml(q, ans) {
      if (!ans) return '<em>Sin respuesta</em>';
      const cod = (q.modoEj === 'completar') ? ensamblar(q, ans.huecos) : (ans.codigo || '');
      return cod.trim() ? U.htmlCodigo(cod) : '<em>Sin respuesta</em>';
    }
  };

  /* =============================== construcción de árboles =============================== */
  function previewArbol(prevHost, errHost, txt, opts) {
    U.vaciar(errHost); U.vaciar(prevHost);
    let t;
    try { t = Arb.parse(txt); } catch (e) { errHost.textContent = e.message; return null; }
    if (!String(txt).trim()) return null;
    Arb.dibujar(prevHost, t, Object.assign({ compacto: true, etiquetas: opts && opts.etiquetas }, opts || {}));
    return t;
  }
  function barraNota(input) {
    const b = h('div', { class: 'barra-nota' });
    [['(', '('], [')', ')'], [',', ','], ['_', '_ (vacío)']].forEach(([c, lab]) => b.appendChild(h('button', { type: 'button', class: 'mini', onclick: () => { const s = input.selectionStart; input.value = input.value.slice(0, s) + c + input.value.slice(input.selectionEnd); input.focus(); input.selectionStart = input.selectionEnd = s + c.length; input.dispatchEvent(new Event('input')); } }, lab)));
    return b;
  }
  Tipos.arbol = {
    render(host, q, ctx) {
      Tipos.cabecera(host, q, ctx);
      host.appendChild(h('div', { class: 'ayuda-formato', html: mdi('Escribe el árbol como `valor(izq,der)`. Ejemplos: `20(10,30)` · `30(20,)` (solo hijo izq.) · `30(,40)` (solo hijo der.) · `_` (árbol vacío). Debajo verás tu dibujo.') }));
      const inp = h('input', { type: 'text', class: 'entrada-nota', placeholder: q.placeholder || 'p. ej. 20(10,30)', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', 'aria-label': 'Árbol en notación valor(izq,der)' });
      const err = h('div', { class: 'nota-err', 'aria-live': 'polite' });
      const prev = h('div', { class: 'arbol-draw previa' });
      host.appendChild(inp); host.appendChild(barraNota(inp)); host.appendChild(err); host.appendChild(h('div', { class: 'arbol-caja previa-caja' }, h('div', { class: 'cod-titulo', text: 'Tu dibujo' }), prev));
      const pintar = U.debounce(() => previewArbol(prev, err, inp.value, { etiquetas: q.previaEtiquetas }), 120);
      inp.addEventListener('input', pintar);
      return {
        getAnswer: () => inp.value, setAnswer(a) { inp.value = a || ''; pintar(); },
        isEmpty: () => !inp.value.trim(), lock(b) { inp.readOnly = !!b; }, onChange(f) { inp.addEventListener('input', f); }, focus() { inp.focus(); },
        marcar(res) { inp.classList.remove('ok', 'mal'); inp.classList.add(res.ok ? 'ok' : 'mal'); }, limpiarMarcas() { inp.classList.remove('ok', 'mal'); }
      };
    },
    grade(q, ans) {
      let t;
      try { t = Arb.parse(ans); } catch (e) { return { score: 0, ok: false, items: [mal('No pude interpretar tu árbol: ' + e.message)] }; }
      if (!String(ans || '').trim()) return { score: 0, ok: false, items: [mal('No escribiste el árbol.')] };
      const items = [];
      if (q.validar) {
        const v = q.validar(t);
        (v.msgs || []).forEach(m => items.push(m.ok ? ok(m.t) : mal(m.t)));
        return { score: v.ok ? 1 : 0, ok: !!v.ok, items };
      }
      const cands = [q.esperado].concat(q.aceptados || []);
      if (cands.some(c => Arb.igual(c, t))) {
        items.push(ok('Tu árbol coincide con el resultado esperado: **' + Arb.nota(t) + '**.'));
        return { score: 1, ok: true, items };
      }
      items.push(mal('Tu árbol no coincide con el resultado esperado.'));
      const E = q.esperado;
      const vs = Arb.ino(t).map(String).sort(), ve = Arb.ino(E).map(String).sort();
      if (vs.join('|') !== ve.join('|')) {
        const faltan = ve.filter(x => !vs.includes(x)), sobran = vs.filter(x => !ve.includes(x));
        if (faltan.length) items.push(info('Faltan ' + faltan.length + ' valor(es) que deberían estar en el árbol.'));
        if (sobran.length) items.push(info('Sobran valores que no pertenecen al resultado: ' + sobran.join(', ') + '.'));
      } else {
        if (q.verificar && q.verificar.bst && !Arb.esBST(t)) items.push(mal('Tu árbol **no cumple la propiedad de BST** (todo el subárbol izquierdo < nodo < todo el subárbol derecho).'));
        else if (q.verificar && q.verificar.bst) items.push(ok('Tu árbol sí es un BST válido con los mismos valores, pero su forma no es la que resulta de aplicar el procedimiento.'));
        if (q.verificar && q.verificar.avl) {
          const bad = Arb.desbalanceados(t);
          if (bad.length) items.push(mal('Tu árbol no es AVL: el nodo **' + bad[0].v + '** tiene factor ' + Arb.factor(bad[0]) + ' (debe cumplirse |factor| ≤ 1 en todos los nodos).'));
        }
        if (String(t.v) !== String(E.v)) items.push(info('La raíz de tu árbol (' + t.v + ') no es la raíz esperada.'));
        if (Arb.altura(t) !== Arb.altura(E)) items.push(info('La altura de tu árbol es ' + Arb.altura(t) + ' y no coincide con la esperada.'));
        if (q.verificar && q.verificar.inorden && Arb.ino(t).join() !== Arb.ino(E).join()) items.push(mal('El recorrido inorden de tu árbol no coincide: las rotaciones **conservan** el inorden.'));
      }
      return { score: 0, ok: false, items };
    },
    solve(q) { return q.ejemploSolucion || Arb.nota(q.esperado); },
    solucionHtml(q) {
      const d = h('div'); const nota = q.ejemploSolucion || Arb.nota(q.esperado);
      return '<p>Resultado esperado: <code>' + esc(nota) + '</code></p><div class="arbol-draw sol" data-nota="' + esc(nota) + '"></div>';
    },
    respuestaHtml(q, ans) { return ans && ans.trim() ? '<code>' + esc(ans) + '</code><div class="arbol-draw sol" data-nota="' + esc(ans) + '"></div>' : '<em>Sin respuesta</em>'; }
  };

  /* =============================== rotaciones AVL =============================== */
  const CASOS = [['LL', 'Izq-Izq (LL)'], ['RR', 'Der-Der (RR)'], ['LR', 'Izq-Der (LR)'], ['RL', 'Der-Izq (RL)']];
  Tipos.avl = {
    render(host, q, ctx) {
      Tipos.cabecera(host, q, ctx);
      const pide = q.pide || ['nodo', 'caso', 'arbol'];
      const name = nuevoId(); const oy = [];
      const ctlArbol = q._ctlArbol; let nodoSel = null;
      const campos = {};
      const fila = h('div', { class: 'avl-campos' });
      if (pide.includes('nodo')) {
        const vals = Arb.ino(q.arbol).map(String);
        const sel = h('select', { class: 'sel-bigo', 'aria-label': 'Primer nodo desbalanceado' }, h('option', { value: '', text: '— elige —' }), vals.map(v => h('option', { value: v, text: v })));
        sel.addEventListener('change', () => { nodoSel = sel.value || null; if (ctlArbol) { ctlArbol.limpiar(['sel']); if (nodoSel) ctlArbol.resaltar(nodoSel, 'sel', true); } oy.forEach(f => f()); });
        campos.nodo = sel;
        fila.appendChild(h('label', { class: 'avl-lab' }, h('span', { html: mdi('Primer nodo desbalanceado (el más profundo con |f| ≥ 2) — también puedes tocarlo en el dibujo') }), sel));
        if (ctlArbol) ctlArbol.nodos.forEach((g, v) => { g.classList.add('clic'); g.addEventListener('click', () => { sel.value = v; sel.dispatchEvent(new Event('change')); }); });
      }
      if (pide.includes('caso')) {
        const grp = h('div', { class: 'avl-casos', role: 'radiogroup', 'aria-label': 'Caso de desbalance' }); const rs = [];
        CASOS.forEach(([k, lab]) => { const r = h('input', { type: 'radio', name, id: name + k, value: k }); r.addEventListener('change', () => oy.forEach(f => f())); rs.push(r); grp.appendChild(h('label', { class: 'caso-btn', for: name + k }, r, h('span', { text: lab }))); });
        campos.caso = rs;
        fila.appendChild(h('div', { class: 'avl-lab' }, h('span', { text: 'Caso de desbalance' }), grp));
      }
      if (pide.includes('nrot')) {
        const s = h('select', { class: 'sel-bigo', 'aria-label': 'Número de rotaciones' }, h('option', { value: '', text: '— elige —' }), h('option', { value: '1', text: '1 rotación (simple)' }), h('option', { value: '2', text: '2 rotaciones (doble)' }));
        s.addEventListener('change', () => oy.forEach(f => f())); campos.nrot = s;
        fila.appendChild(h('label', { class: 'avl-lab' }, h('span', { text: 'Rotaciones necesarias' }), s));
      }
      if (pide.includes('raiz')) {
        const i = h('input', { type: 'text', class: 'entrada-corta', size: 6, placeholder: 'valor', 'aria-label': 'Raíz del subárbol resultante' }); i.addEventListener('input', () => oy.forEach(f => f())); campos.raiz = i;
        fila.appendChild(h('label', { class: 'avl-lab' }, h('span', { text: q.etqRaiz || 'Raíz del subárbol tras rotar' }), i));
      }
      if (pide.includes('alt')) {
        const i = h('input', { type: 'text', class: 'entrada-corta', size: 4, placeholder: 'n', 'aria-label': 'Altura del árbol resultante' }); i.addEventListener('input', () => oy.forEach(f => f())); campos.alt = i;
        fila.appendChild(h('label', { class: 'avl-lab' }, h('span', { text: 'Altura del árbol resultante' }), i));
      }
      host.appendChild(fila);
      let inpArbol = null;
      if (pide.includes('arbol')) {
        host.appendChild(h('div', { class: 'avl-lab' }, h('span', { html: mdi('Árbol completo resultante (notación `valor(izq,der)`)') })));
        inpArbol = h('input', { type: 'text', class: 'entrada-nota', placeholder: 'p. ej. 20(10,30)', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Árbol resultante' });
        const err = h('div', { class: 'nota-err', 'aria-live': 'polite' }); const prev = h('div', { class: 'arbol-draw previa' });
        host.appendChild(inpArbol); host.appendChild(barraNota(inpArbol)); host.appendChild(err); host.appendChild(h('div', { class: 'arbol-caja previa-caja' }, h('div', { class: 'cod-titulo', text: 'Tu dibujo' }), prev));
        const pintar = U.debounce(() => previewArbol(prev, err, inpArbol.value, { etiquetas: 'factor' }), 120);
        inpArbol.addEventListener('input', () => { pintar(); oy.forEach(f => f()); });
      }
      const get = () => ({
        nodo: campos.nodo ? (campos.nodo.value || null) : undefined,
        caso: campos.caso ? ((campos.caso.find(r => r.checked) || {}).value || null) : undefined,
        nrot: campos.nrot ? (campos.nrot.value || null) : undefined,
        raiz: campos.raiz ? campos.raiz.value : undefined,
        alt: campos.alt ? campos.alt.value : undefined,
        arbol: inpArbol ? inpArbol.value : undefined
      });
      const todos = () => [campos.nodo, campos.nrot, campos.raiz, campos.alt, inpArbol, ...(campos.caso || [])].filter(Boolean);
      return {
        getAnswer: get,
        setAnswer(a) { if (!a) return; if (campos.nodo) { campos.nodo.value = a.nodo || ''; campos.nodo.dispatchEvent(new Event('change')); } if (campos.caso) campos.caso.forEach(r => r.checked = r.value === a.caso); if (campos.nrot) campos.nrot.value = a.nrot || ''; if (campos.raiz) campos.raiz.value = a.raiz || ''; if (campos.alt) campos.alt.value = a.alt || ''; if (inpArbol) { inpArbol.value = a.arbol || ''; inpArbol.dispatchEvent(new Event('input')); } },
        isEmpty() { const a = get(); return !((a.nodo) || (a.caso) || (a.nrot) || (a.raiz && a.raiz.trim()) || (a.alt && a.alt.trim()) || (a.arbol && a.arbol.trim())); },
        lock(b) { todos().forEach(x => { x.disabled = !!b; }); if (inpArbol) inpArbol.readOnly = !!b; },
        onChange(f) { oy.push(f); }, focus() { },
        marcar(res) { todos().forEach(x => x.classList && x.classList.remove('ok', 'mal')); const m = res.partes || {}; if (campos.nodo && m.nodo !== undefined) campos.nodo.classList.add(m.nodo ? 'ok' : 'mal'); if (campos.nrot && m.nrot !== undefined) campos.nrot.classList.add(m.nrot ? 'ok' : 'mal'); if (campos.raiz && m.raiz !== undefined) campos.raiz.classList.add(m.raiz ? 'ok' : 'mal'); if (campos.alt && m.alt !== undefined) campos.alt.classList.add(m.alt ? 'ok' : 'mal'); if (inpArbol && m.arbol !== undefined) inpArbol.classList.add(m.arbol ? 'ok' : 'mal'); },
        limpiarMarcas() { todos().forEach(x => x.classList && x.classList.remove('ok', 'mal')); }
      };
    },
    grade(q, ans) {
      ans = ans || {}; const E = q.esperado; const pide = q.pide || ['nodo', 'caso', 'arbol'];
      const items = [], partes = {}; let suma = 0; let confusion = null;
      const norm = v => String(v == null ? '' : v).trim();
      for (const p of pide) {
        if (p === 'nodo') {
          const o = norm(ans.nodo) === norm(E.nodo); partes.nodo = o; suma += o ? 1 : 0;
          items.push(o ? ok('Primer nodo desbalanceado: **' + E.nodo + '** ✔.') : mal('Primer nodo desbalanceado incorrecto. Recuerda: es el nodo **más profundo** con |factor| ≥ 2 (recalcula alturas de las hojas hacia arriba: hoja = 0, vacío = −1).'));
        } else if (p === 'caso') {
          const o = ans.caso === E.caso; partes.caso = o; suma += o ? 1 : 0;
          if (o) items.push(ok('Caso **' + E.caso + ' (' + Arb.NOMBRE_CASO[E.caso] + ')** ✔: ' + Arb.ROT_CASO[E.caso] + '.'));
          else {
            items.push(mal('Caso incorrecto' + (ans.caso ? ' (elegiste ' + ans.caso + ')' : '') + '. ¿Línea recta o zigzag? Mira el signo del factor del nodo desbalanceado y hacia dónde cayó el nodo nuevo respecto a su hijo pesado.'));
            if (ans.caso) confusion = { dado: ans.caso, correcta: E.caso };
          }
        } else if (p === 'nrot') {
          const o = norm(ans.nrot) === norm(E.nrot); partes.nrot = o; suma += o ? 1 : 0;
          items.push(o ? ok('Número de rotaciones: **' + E.nrot + '** ✔.') : mal('Número de rotaciones incorrecto: línea recta → 1 (simple); zigzag → 2 (doble).'));
        } else if (p === 'raiz') {
          const o = norm(ans.raiz) === norm(E.raiz); partes.raiz = o; suma += o ? 1 : 0;
          items.push(o ? ok('Raíz del subárbol resultante: **' + E.raiz + '** ✔.') : mal('La raíz del subárbol resultante no es la que dices. La rotación devuelve la **nueva raíz local** (el nodo que sube).'));
        } else if (p === 'alt') {
          const o = norm(ans.alt) === norm(E.alt); partes.alt = o; suma += o ? 1 : 0;
          items.push(o ? ok('Altura del árbol resultante: **' + E.alt + '** ✔.') : mal('La altura del árbol resultante no es correcta (se cuentan aristas; hoja = 0).'));
        } else if (p === 'arbol') {
          let t = null, perr = null;
          try { t = Arb.parse(ans.arbol); } catch (e) { perr = e.message; }
          if (perr || !norm(ans.arbol)) { partes.arbol = false; items.push(mal('Árbol resultante: ' + (perr ? 'no pude leerlo (' + perr + ')' : 'sin responder') + '.')); continue; }
          const o = Arb.igual(t, E.arbol); partes.arbol = o; suma += o ? 1 : 0;
          if (o) items.push(ok('Árbol resultante correcto: **' + Arb.nota(E.arbol) + '** ✔.'));
          else {
            items.push(mal('El árbol resultante no coincide.'));
            if (q.arbol && Arb.ino(t).join() !== Arb.ino(q.arbol).join()) items.push(mal('El **inorden** de tu árbol cambió respecto al original: una rotación nunca altera el inorden.'));
            const bad = Arb.desbalanceados(t);
            if (bad.length) items.push(mal('Tu árbol aún está desbalanceado en **' + bad[0].v + '** (factor ' + Arb.factor(bad[0]) + ').'));
            if (!Arb.esBST(t)) items.push(mal('Tu árbol no cumple la propiedad de BST.'));
            if (String(t.v) !== String(E.arbol.v)) items.push(info('La raíz de tu árbol (' + t.v + ') no es la esperada tras el rebalanceo.'));
          }
        }
      }
      const score = suma / pide.length;
      return { score, ok: score > 0.999, items, partes, confusion };
    },
    solve(q) {
      const E = q.esperado; return { nodo: String(E.nodo), caso: E.caso, nrot: String(E.nrot), raiz: String(E.raiz), alt: String(E.alt), arbol: E.arbol ? Arb.nota(E.arbol) : '' };
    },
    solucionHtml(q) {
      const E = q.esperado; const pide = q.pide || ['nodo', 'caso', 'arbol'];
      let s = '<ul>';
      if (pide.includes('nodo')) s += '<li>Primer nodo desbalanceado: <strong>' + E.nodo + '</strong></li>';
      if (pide.includes('caso')) s += '<li>Caso: <strong>' + E.caso + ' (' + Arb.NOMBRE_CASO[E.caso] + ')</strong> → ' + Arb.ROT_CASO[E.caso] + '</li>';
      if (pide.includes('nrot')) s += '<li>Rotaciones: <strong>' + E.nrot + '</strong></li>';
      if (pide.includes('raiz')) s += '<li>Raíz del subárbol resultante: <strong>' + E.raiz + '</strong></li>';
      if (pide.includes('alt')) s += '<li>Altura resultante: <strong>' + E.alt + '</strong></li>';
      if (pide.includes('arbol')) s += '<li>Árbol resultante: <code>' + esc(Arb.nota(E.arbol)) + '</code></li>';
      s += '</ul>';
      if (pide.includes('arbol')) s += '<div class="arbol-draw sol" data-nota="' + esc(Arb.nota(E.arbol)) + '"></div>';
      return s;
    },
    respuestaHtml(q, ans) {
      if (!ans) return '<em>Sin respuesta</em>';
      const p = [];
      if (ans.nodo) p.push('Nodo: <strong>' + esc(ans.nodo) + '</strong>'); if (ans.caso) p.push('Caso: <strong>' + ans.caso + '</strong>'); if (ans.nrot) p.push('Rotaciones: <strong>' + esc(ans.nrot) + '</strong>');
      if (ans.raiz) p.push('Raíz: <strong>' + esc(ans.raiz) + '</strong>'); if (ans.alt) p.push('Altura: <strong>' + esc(ans.alt) + '</strong>'); if (ans.arbol) p.push('Árbol: <code>' + esc(ans.arbol) + '</code>');
      return p.length ? p.join(' · ') : '<em>Sin respuesta</em>';
    }
  };

  /* =============================== mixta (varias partes) =============================== */
  /** puntos de una parte cuando la pregunta tiene valor (p. ej. 1,0 como en el parcial) */
  const ptsParte = (q, p) => q.valor ? (p.peso || 1) / q.partes.reduce((s, x) => s + (x.peso || 1), 0) * q.valor : null;
  Tipos.ptsParte = ptsParte;
  Tipos.mixta = {
    render(host, q, ctx) {
      Tipos.cabecera(host, q, ctx);
      const ctls = [];
      q.partes.forEach((p, i) => {
        const pp = ptsParte(q, p);
        const caja = h('section', { class: 'parte' }, h('h4', { class: 'parte-t' }, String.fromCharCode(97 + i) + ') ' + (p.titulo || ''), pp !== null ? h('span', { class: 'pts-parte', text: ' (' + Tipos.pts(pp) + ' pts)' }) : null));
        const sub = Tipos.mod(p.q); const body = h('div', { class: 'parte-cuerpo' }); caja.appendChild(body); host.appendChild(caja);
        ctls.push(sub.render(body, p.q, ctx));
      });
      return {
        getAnswer: () => ctls.map(c => c.getAnswer()), setAnswer(a) { (a || []).forEach((v, i) => ctls[i] && ctls[i].setAnswer(v)); },
        isEmpty: () => ctls.every(c => c.isEmpty()), lock(b) { ctls.forEach(c => c.lock(b)); }, onChange(f) { ctls.forEach(c => c.onChange(f)); }, focus() { ctls[0] && ctls[0].focus(); },
        marcar(res) { (res.sub || []).forEach((r, i) => ctls[i] && ctls[i].marcar && ctls[i].marcar(r)); }, limpiarMarcas() { ctls.forEach(c => c.limpiarMarcas && c.limpiarMarcas()); }
      };
    },
    grade(q, ans, ctx) {
      ans = ans || []; const items = []; let tot = 0, suma = 0; const sub = [];
      q.partes.forEach((p, i) => {
        const r = Tipos.mod(p.q).grade(p.q, ans[i], ctx); sub.push(r);
        const w = p.peso || 1; tot += w; suma += w * r.score;
        const pp = ptsParte(q, p);
        items.push(info('**Parte ' + String.fromCharCode(97 + i) + ')** — ' + Math.round(r.score * 100) + ' %' + (pp !== null ? ' · **' + Tipos.pts(pp * r.score) + ' de ' + Tipos.pts(pp) + ' pts**' : '')));
        r.items.forEach(it => {   // los interruptores de criterios de cada parte escriben en la respuesta de esa parte
          if (it.toggle === undefined) { items.push(it); return; }
          const t = it.toggle; const sa = ans[i];
          items.push(Object.assign({}, it, { toggle: i + ':' + t, alter: v => { if (sa) { sa.manual = sa.manual || {}; sa.manual[t] = v; } } }));
        });
      });
      const score = suma / tot;
      return { score, ok: score > 0.999, items, sub, confusion: (sub.find(s => s.confusion) || {}).confusion };
    },
    solve(q) { return q.partes.map(p => Tipos.mod(p.q).solve(p.q)); },
    solucionHtml(q) { return q.partes.map((p, i) => '<div class="parte-sol"><strong>' + String.fromCharCode(97 + i) + ')</strong> ' + Tipos.mod(p.q).solucionHtml(p.q) + '</div>').join(''); },
    respuestaHtml(q, ans) { return q.partes.map((p, i) => '<div class="parte-sol"><strong>' + String.fromCharCode(97 + i) + ')</strong> ' + Tipos.mod(p.q).respuestaHtml(p.q, (ans || [])[i]) + '</div>').join(''); }
  };

  /* =============================== utilidades de tipos =============================== */
  Tipos.mod = q => Tipos[q.tipo];
  const FORMATO = { vf: 'Verdadero o falso', abierta: 'Pregunta abierta', salida: 'Análisis de código', tabla: 'Trazado manual', bigo: 'Complejidad algorítmica', arbol: 'Construcción de árboles', avl: 'Rotaciones AVL', clasificar: 'Comparación de conceptos', orden: 'Ordenar pasos', mixta: 'Pregunta mixta' };
  Tipos.formato = q => {
    if (q.fmt) return q.fmt;
    if (q.tipo === 'opcion') return q.multi ? 'Selección múltiple (varias)' : 'Selección múltiple';
    if (q.tipo === 'codigo') return ({ codigo: 'Implementación desde cero', completar: 'Completar código', depurar: 'Depuración' })[q.modoEj || 'codigo'];
    return FORMATO[q.tipo] || q.tipo;
  };
  Tipos.categoria = q => {
    if (q.cat) return q.cat;
    switch (q.tipo) {
      case 'opcion': case 'vf': case 'abierta': case 'clasificar': case 'orden': return 'teoria';
      case 'codigo': return 'implementacion';
      default: return 'analisis';
    }
  };
  /** dibuja los árboles "sol" (data-nota) dentro de un contenedor */
  Tipos.hidratar = function (root) {
    U.$$('.arbol-draw.sol', root).forEach(d => {
      if (d.dataset.hid) return; d.dataset.hid = '1';
      try { Arb.dibujar(d, Arb.parse(d.dataset.nota), { compacto: true, etiquetas: d.dataset.etq }); } catch (e) { d.textContent = d.dataset.nota; }
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
