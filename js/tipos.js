/* tipos.js — tipos de pregunta (parte 1): render, corrección, solución y resumen de respuesta.
   Interfaz de cada tipo:
     render(host, q, ctx)      -> controlador {getAnswer, setAnswer, isEmpty, lock, onChange, focus, marcar}
     grade(q, ans, ctx)        -> {score 0..1, ok, items:[{ok,html,toggle?}], extra?}
     solve(q)                  -> respuesta que se corrige como correcta
     solucionHtml(q)           -> HTML de la respuesta esperada
     respuestaHtml(q, ans)     -> HTML de la respuesta dada                                              */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const U = ET.U, h = U.h;
  const Tipos = ET.Tipos = {};
  let UIDN = 0;
  const nuevoId = () => 'q' + (++UIDN);
  const md = U.md, mdi = U.mdInline, esc = U.esc;
  const ok = (html) => ({ ok: true, html });
  const mal = (html) => ({ ok: false, html });
  const info = (html) => ({ ok: null, html });

  /* ---------- cabecera común: enunciado + código + árbol ---------- */
  function cabecera(host, q, ctx) {
    host.appendChild(h('div', { class: 'enunciado', html: md(q.enunciado) }));
    if (q.codigoVista) {
      const w = h('div', { class: 'bloque-cod' });
      if (q.codigoTitulo) w.appendChild(h('div', { class: 'cod-titulo', text: q.codigoTitulo }));
      w.appendChild(U.bloqueCodigo(q.codigoVista));
      host.appendChild(w);
    }
    if (q.codigos) q.codigos.forEach(c => {
      const w = h('div', { class: 'bloque-cod' });
      if (c.titulo) w.appendChild(h('div', { class: 'cod-titulo', text: c.titulo }));
      w.appendChild(U.bloqueCodigo(c.codigo)); host.appendChild(w);
    });
    if (q.arbol !== undefined) {
      const caja = h('div', { class: 'arbol-caja' });
      if (q.arbolTitulo) caja.appendChild(h('div', { class: 'cod-titulo', text: q.arbolTitulo }));
      const d = h('div', { class: 'arbol-draw' }); caja.appendChild(d); host.appendChild(caja);
      q._ctlArbol = ET.Arb.dibujar(d, q.arbol, Object.assign({}, q.arbolOpts || {}));
      if (ctx && ctx.modo !== 'examen' && q.animarRecorrido) {
        // (los botones de animación los pone el tipo concreto)
      }
    }
    if (q.arboles) q.arboles.forEach(a => {
      const caja = h('div', { class: 'arbol-caja' });
      if (a.titulo) caja.appendChild(h('div', { class: 'cod-titulo', text: a.titulo }));
      const d = h('div', { class: 'arbol-draw' }); caja.appendChild(d); host.appendChild(caja);
      ET.Arb.dibujar(d, a.arbol, Object.assign({ compacto: true }, a.opts || {}));
    });
    if (q.figura && ET.Escena) {   // figura de una estructura (lista, pila, heap…) dibujada con el motor de escenas: {titulo, items, W, H}
      const caja = h('div', { class: 'arbol-caja fig-escena' });
      if (q.figura.titulo) caja.appendChild(h('div', { class: 'cod-titulo', text: q.figura.titulo }));
      host.appendChild(caja);
      const esc = new ET.Escena(h('div'), { W: q.figura.W, H: q.figura.H, etiqueta: q.figura.titulo || 'Figura' }); caja.appendChild(esc.host); esc.aplicar(q.figura.items, { dur: 0 });
    }
    if (q.pregunta) host.appendChild(h('div', { class: 'pregunta', html: md(q.pregunta) }));
  }
  Tipos.cabecera = cabecera;

  /* =============================== opción múltiple =============================== */
  Tipos.opcion = {
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      const multi = !!q.multi, name = nuevoId();
      if (multi) host.appendChild(h('div', { class: 'ayuda-formato', text: 'Puede haber más de una respuesta correcta. Marca todas las que apliquen.' }));
      const lista = h('div', { class: 'opciones', role: multi ? 'group' : 'radiogroup' });
      const labs = [], inputs = [];
      q.opciones.forEach((o, i) => {
        const inp = h('input', { type: multi ? 'checkbox' : 'radio', name, id: name + '_' + i });
        const lab = h('label', { class: 'opcion', for: name + '_' + i }, inp, h('span', { class: 'op-marca' }), h('span', { class: 'op-txt', html: mdi(o.t) }));
        inputs.push(inp); labs.push(lab); lista.appendChild(lab);
      });
      host.appendChild(lista);
      const ctl = {
        getAnswer: () => inputs.map((x, i) => x.checked ? i : -1).filter(i => i >= 0),
        setAnswer(a) { inputs.forEach((x, i) => x.checked = (a || []).includes(i)); },
        isEmpty: () => !inputs.some(x => x.checked),
        lock(b) { inputs.forEach(x => x.disabled = !!b); },
        onChange(f) { inputs.forEach(x => x.addEventListener('change', f)); },
        focus() { inputs[0] && inputs[0].focus(); },
        marcar(res) {
          labs.forEach((l, i) => { l.classList.remove('ok', 'mal'); if (res.marcas && res.marcas[i] !== undefined) l.classList.add(res.marcas[i] ? 'ok' : 'mal'); });
        },
        limpiarMarcas() { labs.forEach(l => l.classList.remove('ok', 'mal')); }
      };
      return ctl;
    },
    grade(q, ans) {
      const sel = new Set(ans || []);
      const corr = q.opciones.map((o, i) => o.ok ? i : -1).filter(i => i >= 0);
      const aciertos = corr.filter(i => sel.has(i)).length;
      const errores = [...sel].filter(i => !q.opciones[i].ok);
      const exacto = aciertos === corr.length && errores.length === 0;
      const items = [], marcas = {};
      [...sel].sort().forEach(i => {
        const o = q.opciones[i];
        marcas[i] = !!o.ok;
        if (o.ok) items.push(ok('**Correcto:** ' + o.t + (o.why ? ' — ' + o.why : '')));
        else items.push(mal('**Incorrecto:** ' + o.t + (o.why ? ' — ' + o.why : ' — esta opción no es correcta.')));
      });
      if (q.multi && !exacto && errores.length === 0 && aciertos < corr.length) items.push(info('Te faltan opciones correctas por marcar (' + (corr.length - aciertos) + ').'));
      let score = exacto ? 1 : (q.multi ? Math.max(0, (aciertos - errores.length) / corr.length) : 0);
      return { score, ok: exacto, items, marcas };
    },
    solve(q) { return q.opciones.map((o, i) => o.ok ? i : -1).filter(i => i >= 0); },
    solucionHtml(q) {
      return '<ul>' + q.opciones.map(o => o.ok ? '<li><strong>' + mdi(o.t) + '</strong>' + (o.why ? ' — ' + mdi(o.why) : '') + '</li>' : '').join('') + '</ul>' +
        (q.opciones.some(o => !o.ok && o.why) ? '<p class="peq"><em>Las demás opciones no son correctas:</em></p><ul class="peq">' + q.opciones.map(o => !o.ok && o.why ? '<li>' + mdi(o.t) + ' — ' + mdi(o.why) + '</li>' : '').join('') + '</ul>' : '');
    },
    respuestaHtml(q, ans) {
      if (!ans || !ans.length) return '<em>Sin respuesta</em>';
      return '<ul>' + ans.map(i => '<li>' + mdi(q.opciones[i].t) + '</li>').join('') + '</ul>';
    }
  };

  /* =============================== verdadero / falso =============================== */
  Tipos.vf = {
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      const name = nuevoId();
      host.appendChild(h('blockquote', { class: 'afirmacion', html: mdi(q.afirmacion) }));
      const fila = h('div', { class: 'vf-botones', role: 'radiogroup' });
      const rv = h('input', { type: 'radio', name, id: name + 'v' }), rf = h('input', { type: 'radio', name, id: name + 'f' });
      const lv = h('label', { class: 'vf-btn v', for: name + 'v' }, rv, h('span', { text: 'Verdadero' }));
      const lf = h('label', { class: 'vf-btn f', for: name + 'f' }, rf, h('span', { text: 'Falso' }));
      fila.appendChild(lv); fila.appendChild(lf); host.appendChild(fila);
      let jin = [], jlabs = [];
      if (q.justif) {
        host.appendChild(h('div', { class: 'justif-t', html: md(q.justif.pregunta || '**Justifica:** ¿qué razón sustenta tu respuesta?') }));
        const jl = h('div', { class: 'opciones' });
        q.justif.opciones.forEach((o, i) => {
          const inp = h('input', { type: 'radio', name: name + 'j', id: name + 'j' + i });
          const lab = h('label', { class: 'opcion', for: name + 'j' + i }, inp, h('span', { class: 'op-marca' }), h('span', { class: 'op-txt', html: mdi(o.t) }));
          jin.push(inp); jlabs.push(lab); jl.appendChild(lab);
        });
        host.appendChild(jl);
      }
      const get = () => ({ v: rv.checked ? true : (rf.checked ? false : null), j: jin.findIndex(x => x.checked) });
      return {
        getAnswer: get,
        setAnswer(a) { if (!a) return; rv.checked = a.v === true; rf.checked = a.v === false; jin.forEach((x, i) => x.checked = a.j === i); },
        isEmpty: () => get().v === null,
        lock(b) { [rv, rf, ...jin].forEach(x => x.disabled = !!b); },
        onChange(f) { [rv, rf, ...jin].forEach(x => x.addEventListener('change', f)); },
        focus() { rv.focus(); },
        marcar(res) { [lv, lf].forEach(l => l.classList.remove('ok', 'mal')); jlabs.forEach(l => l.classList.remove('ok', 'mal')); if (res.vfOk !== undefined) (res.vfSel ? lv : lf).classList.add(res.vfOk ? 'ok' : 'mal'); if (res.jOk !== undefined && res.jSel >= 0) jlabs[res.jSel].classList.add(res.jOk ? 'ok' : 'mal'); },
        limpiarMarcas() { [lv, lf].forEach(l => l.classList.remove('ok', 'mal')); jlabs.forEach(l => l.classList.remove('ok', 'mal')); }
      };
    },
    grade(q, ans) {
      ans = ans || { v: null, j: -1 };
      const vfOk = ans.v === q.correcta;
      const items = [];
      let score = 0, extra = { vfOk, vfSel: ans.v };
      if (vfOk) items.push(ok('La afirmación es **' + (q.correcta ? 'verdadera' : 'falsa') + '**: tu veredicto es correcto.'));
      else if (ans.v === null) items.push(mal('No elegiste **Verdadero** ni **Falso**.'));
      else items.push(mal('Tu veredicto no es correcto: la afirmación es **' + (ans.v ? 'falsa, no verdadera' : 'verdadera, no falsa') + '**. Revisa el concepto y vuelve a leerla con cuidado.'));
      if (q.justif) {
        const jok = ans.j >= 0 && q.justif.opciones[ans.j].ok;
        extra.jOk = ans.j >= 0 ? jok : undefined; extra.jSel = ans.j;
        if (ans.j < 0) items.push(mal('No elegiste una justificación.'));
        else if (jok) items.push(ok('Justificación correcta' + (q.justif.opciones[ans.j].why ? ': ' + q.justif.opciones[ans.j].why : '.')));
        else items.push(mal('Justificación incorrecta' + (q.justif.opciones[ans.j].why ? ': ' + q.justif.opciones[ans.j].why : '.')));
        score = (vfOk ? 0.5 : 0) + (jok ? 0.5 : 0);
      } else score = vfOk ? 1 : 0;
      return Object.assign({ score, ok: score > 0.999, items }, extra);
    },
    solve(q) { return { v: q.correcta, j: q.justif ? q.justif.opciones.findIndex(o => o.ok) : -1 }; },
    solucionHtml(q) {
      return '<p><strong>' + (q.correcta ? 'Verdadero' : 'Falso') + '.</strong></p>' + (q.justif ? '<p>' + mdi(q.justif.opciones.find(o => o.ok).t) + '</p>' : '');
    },
    respuestaHtml(q, ans) {
      if (!ans || ans.v === null) return '<em>Sin respuesta</em>';
      return '<strong>' + (ans.v ? 'Verdadero' : 'Falso') + '</strong>' + (q.justif && ans.j >= 0 ? '<br>' + mdi(q.justif.opciones[ans.j].t) : '');
    }
  };

  /* =============================== pregunta abierta =============================== */
  function criterioCumplido(textoNorm, c) {
    return c.claves.some(alt => (Array.isArray(alt) ? alt : [alt]).every(tok => tok instanceof RegExp ? tok.test(textoNorm) : textoNorm.includes(U.norm(tok))));
  }
  Tipos.criterioCumplido = criterioCumplido;
  Tipos.abierta = {
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      const ta = h('textarea', { class: 'respuesta-abierta', rows: q.filas || 5, placeholder: 'Escribe tu respuesta con tus propias palabras…', 'aria-label': 'Respuesta abierta' });
      host.appendChild(ta);
      host.appendChild(h('div', { class: 'ayuda-formato', text: 'Se evalúa por criterios (ideas clave), no por redacción exacta. Explica el porqué, no solo el qué.' }));
      return {
        getAnswer: () => ({ texto: ta.value, manual: {} }), setAnswer(a) { ta.value = a ? a.texto : ''; },
        isEmpty: () => ta.value.trim().length < 3, lock(b) { ta.readOnly = !!b; },
        onChange(f) { ta.addEventListener('input', f); }, focus() { ta.focus(); },
        marcar() { }, limpiarMarcas() { }
      };
    },
    grade(q, ans) {
      ans = ans || { texto: '', manual: {} };
      const J = Tipos.itemsCriterios(q.criterios, ans.texto, ans);
      const items = J.items;
      const score = J.cum / q.criterios.length;
      const umbral = q.umbral || 0.67;
      return { score, ok: score >= umbral - 1e-9, items, extra: { modelo: q.modelo, abierta: true } };
    },
    solve(q) { return { texto: q.modelo, manual: {} }; },
    solucionHtml(q) { return '<p><strong>Respuesta modelo:</strong></p>' + md(q.modelo) + '<p class="peq"><strong>Ideas clave evaluadas:</strong></p><ul class="peq">' + q.criterios.map(c => '<li>' + mdi(c.desc) + '</li>').join('') + '</ul>'; },
    respuestaHtml(q, ans) { return ans && ans.texto && ans.texto.trim() ? '<div class="cita">' + esc(ans.texto).replace(/\n/g, '<br>') + '</div>' : '<em>Sin respuesta</em>'; }
  };

  /* =============================== salida de código / secuencia =============================== */
  function lineasNorm(s) {
    return String(s == null ? '' : s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+/g, '').replace(/["`]/g, "'").toLowerCase()).filter(l => l !== '');
  }
  function tokensNorm(s) {
    return String(s == null ? '' : s).replace(/[\[\]\(\)\{\}"'`]/g, ' ').replace(/→|->|-->|=>/g, ' ').split(/[\s,;]+/).filter(Boolean).map(x => x.toLowerCase());
  }
  Tipos.salida = {
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      const multi = !!q.multilinea;
      const el = multi ? h('textarea', { class: 'resp-salida', rows: q.filas || 4, placeholder: q.placeholder || 'Una línea por cada línea de salida…', spellcheck: 'false', 'aria-label': 'Respuesta' })
        : h('input', { class: 'resp-salida', type: 'text', placeholder: q.placeholder || 'Escribe tu respuesta…', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Respuesta' });
      host.appendChild(el);
      if (q.ayudaFormato) host.appendChild(h('div', { class: 'ayuda-formato', html: mdi(q.ayudaFormato) }));
      return {
        getAnswer: () => el.value, setAnswer(a) { el.value = a || ''; },
        isEmpty: () => !el.value.trim(), lock(b) { el.readOnly = !!b; },
        onChange(f) { el.addEventListener('input', f); }, focus() { el.focus(); },
        marcar(res) { el.classList.remove('ok', 'mal'); el.classList.add(res.ok ? 'ok' : 'mal'); },
        limpiarMarcas() { el.classList.remove('ok', 'mal'); }
      };
    },
    grade(q, ans) {
      const esp = Array.isArray(q.esperado) ? q.esperado : [q.esperado];
      const items = [];
      if (q.numerico) {   // respuesta numérica con tolerancia relativa
        const m = String(ans == null ? '' : ans).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
        const val = m ? parseFloat(m[0]) : NaN; const tol = q.tol === undefined ? 1e-6 : q.tol;
        const okn = esp.some(e => { const x = parseFloat(String(e).replace(',', '.')); return isFinite(val) && Math.abs(val - x) <= tol * Math.max(1, Math.abs(x)); });
        items.push(okn ? ok('Valor correcto.') : mal(isFinite(val) ? 'El valor ' + val + ' no es el esperado' + (q.unidad ? ' (' + q.unidad + ')' : '') + '.' : 'Escribe un número.'));
        return { score: okn ? 1 : 0, ok: okn, items };
      }
      let coincide = false, mejorPrefijo = 0, total = 0;
      for (const e of esp) {
        const A = q.tokens ? tokensNorm(ans) : lineasNorm(ans), E = q.tokens ? tokensNorm(e) : lineasNorm(e);
        total = E.length;
        if (A.length === E.length && A.every((x, i) => x === E[i])) { coincide = true; break; }
        let k = 0; while (k < A.length && k < E.length && A[k] === E[k]) k++;
        if (k > mejorPrefijo) { mejorPrefijo = k; total = E.length; }
        if (!items.length) items.push(null);
      }
      items.length = 0;
      if (coincide) items.push(ok('Tu respuesta coincide con lo que produce el programa.'));
      else {
        const A = q.tokens ? tokensNorm(ans) : lineasNorm(ans);
        if (!A.length) items.push(mal('No escribiste nada.'));
        else {
          const unidad = q.tokens ? 'elementos' : 'líneas';
          if (mejorPrefijo > 0) items.push(mal('Tu respuesta no coincide. Los primeros **' + mejorPrefijo + '** ' + unidad + ' son correctos; a partir del siguiente hay una diferencia.'));
          else items.push(mal('Tu respuesta no coincide con el resultado. Ya el primero de los ' + unidad + ' difiere.'));
          if (A.length !== total) items.push(info('Tu respuesta tiene ' + A.length + ' ' + unidad + ' y el resultado tiene ' + (A.length > total ? 'menos' : 'más') + '.'));
          else items.push(info('Cantidad de ' + unidad + ' correcta (' + total + '): revisa el orden o los valores.'));
        }
      }
      return { score: coincide ? 1 : 0, ok: coincide, items };
    },
    solve(q) { const e = Array.isArray(q.esperado) ? q.esperado[0] : q.esperado; return q.tokens ? String(e).replace(/\s*\n\s*/g, ', ') : e; },
    solucionHtml(q) { const e = Array.isArray(q.esperado) ? q.esperado[0] : q.esperado; return '<pre class="code"><code>' + esc(e) + '</code></pre>' + (q.traza ? md(q.traza) : ''); },
    respuestaHtml(q, ans) { return ans && String(ans).trim() ? '<pre class="code"><code>' + esc(ans) + '</code></pre>' : '<em>Sin respuesta</em>'; }
  };

  /* =============================== tabla de trazado =============================== */
  Tipos.tabla = {
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      const tb = h('table', { class: 'tabla-traza' });
      tb.appendChild(h('thead', null, h('tr', null, q.cols.map(c => h('th', { html: mdi(c) })))));
      const body = h('tbody'); const inputs = [];
      q.filas.forEach(fila => {
        const tr = h('tr');
        fila.forEach(cel => {
          const td = h('td');
          if (cel.in !== undefined) {
            const inp = h('input', { type: 'text', class: 'celda', size: cel.w || 6, spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Celda a completar' });
            td.appendChild(inp); inputs.push(inp); td._inp = inp;
          } else td.innerHTML = mdi(cel.t);
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      tb.appendChild(body); host.appendChild(h('div', { class: 'tabla-caja' }, tb));
      return {
        getAnswer: () => inputs.map(i => i.value), setAnswer(a) { (a || []).forEach((v, i) => { if (inputs[i]) inputs[i].value = v; }); },
        isEmpty: () => inputs.every(i => !i.value.trim()), lock(b) { inputs.forEach(i => i.readOnly = !!b); },
        onChange(f) { inputs.forEach(i => i.addEventListener('input', f)); }, focus() { inputs[0] && inputs[0].focus(); },
        marcar(res) { inputs.forEach((i, k) => { i.classList.remove('ok', 'mal'); if (res.celdas && res.celdas[k] !== undefined) i.classList.add(res.celdas[k] ? 'ok' : 'mal'); }); },
        limpiarMarcas() { inputs.forEach(i => i.classList.remove('ok', 'mal')); }
      };
    },
    esperados(q) { const out = []; q.filas.forEach(f => f.forEach(c => { if (c.in !== undefined) out.push(Array.isArray(c.in) ? c.in : [c.in]); })); return out; },
    grade(q, ans) {
      const esp = Tipos.tabla.esperados(q); ans = ans || [];
      const nc = s => U.normCompacto(s).replace(/[,;→]|->/g, '');
      const celdas = esp.map((alts, i) => alts.some(a => q.cx ? U.igualCx(a, ans[i] || '') : nc(a) === nc(ans[i] || '')));
      const n = celdas.filter(Boolean).length, tot = esp.length;
      const items = [];
      if (n === tot) items.push(ok('Todas las celdas son correctas.'));
      else {
        items.push(mal('Celdas correctas: **' + n + ' de ' + tot + '**. Las celdas en rojo tienen un error; revisa esas filas.'));
        if (q.cx) {   // ayuda específica: la celda era amortizada y no se escribió (o al revés)
          let amortFalta = 0, amortSobra = 0;
          esp.forEach((alts, i) => { if (celdas[i]) return; const pe = U.parseCx(alts[0]), pa = U.parseCx(ans[i] || ''); if (pe.base === pa.base && pe.amort && !pa.amort) amortFalta++; if (pe.base === pa.base && !pe.amort && pa.amort) amortSobra++; });
          if (amortFalta) items.push(info('En ' + amortFalta + ' celda(s) la complejidad es correcta pero **debía decir «amortizado»** (el parcial exige escribirlo explícitamente).'));
          if (amortSobra) items.push(info('En ' + amortSobra + ' celda(s) escribiste «amortizado» pero el costo en el peor caso es **estricto**.'));
        }
      }
      return { score: n / tot, ok: n === tot, items, celdas };
    },
    solve(q) { return Tipos.tabla.esperados(q).map(a => a[0]); },
    solucionHtml(q) {
      let k = 0; const sol = Tipos.tabla.esperados(q).map(a => a[0]);
      return '<div class="tabla-caja"><table class="tabla-traza"><thead><tr>' + q.cols.map(c => '<th>' + mdi(c) + '</th>').join('') + '</tr></thead><tbody>' +
        q.filas.map(f => '<tr>' + f.map(c => c.in !== undefined ? '<td><strong>' + esc(sol[k++]) + '</strong></td>' : '<td>' + mdi(c.t) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    },
    respuestaHtml(q, ans) {
      let k = 0; ans = ans || [];
      return '<div class="tabla-caja"><table class="tabla-traza"><thead><tr>' + q.cols.map(c => '<th>' + mdi(c) + '</th>').join('') + '</tr></thead><tbody>' +
        q.filas.map(f => '<tr>' + f.map(c => c.in !== undefined ? '<td>' + (esc(ans[k++]) || '<em>—</em>') + '</td>' : '<td>' + mdi(c.t) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    }
  };

  /* =============================== ordenar pasos =============================== */
  Tipos.orden = {
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      host.appendChild(h('div', { class: 'ayuda-formato', text: 'Usa las flechas ▲ ▼ para ordenar los pasos de primero a último.' }));
      let orden = q.inicial.slice(); const lista = h('ol', { class: 'lista-orden' }); const oyentes = [];
      const pinta = () => {
        U.vaciar(lista);
        orden.forEach((idx, pos) => {
          const li = h('li', { class: 'it-orden' },
            h('span', { class: 'it-txt', html: mdi(q.items[idx]) }),
            h('span', { class: 'it-btn' },
              h('button', { type: 'button', class: 'mini', 'aria-label': 'Subir', disabled: pos === 0 || undefined, onclick: () => mueve(pos, -1) }, '▲'),
              h('button', { type: 'button', class: 'mini', 'aria-label': 'Bajar', disabled: pos === orden.length - 1 || undefined, onclick: () => mueve(pos, 1) }, '▼')));
          li.dataset.pos = pos; lista.appendChild(li);
        });
      };
      const mueve = (pos, d) => { const j = pos + d; if (j < 0 || j >= orden.length) return; [orden[pos], orden[j]] = [orden[j], orden[pos]]; pinta(); oyentes.forEach(f => f()); ctl.movido = true; };
      const ctl = {
        movido: false,
        getAnswer: () => orden.slice(), setAnswer(a) { if (a) { orden = a.slice(); pinta(); ctl.movido = true; } },
        isEmpty: () => false, lock(b) { lista.classList.toggle('bloqueado', !!b); lista.querySelectorAll('button').forEach(x => x.disabled = !!b); },
        onChange(f) { oyentes.push(f); }, focus() { }, marcar(res) { lista.querySelectorAll('li').forEach((li, p) => { li.classList.remove('ok', 'mal'); if (res.posOk) li.classList.add(res.posOk[p] ? 'ok' : 'mal'); }); }, limpiarMarcas() { lista.querySelectorAll('li').forEach(li => li.classList.remove('ok', 'mal')); }
      };
      pinta(); host.appendChild(lista); return ctl;
    },
    grade(q, ans) {
      ans = ans || q.inicial;
      const posOk = ans.map((idx, p) => idx === q.correcto[p]);
      const n = posOk.filter(Boolean).length;
      const items = [n === ans.length ? ok('El orden es correcto.') : mal('Pasos en la posición correcta: **' + n + ' de ' + ans.length + '**. Los pasos en rojo están mal ubicados.')];
      return { score: n === ans.length ? 1 : n / ans.length * 0.5, ok: n === ans.length, items, posOk };
    },
    solve(q) { return q.correcto.slice(); },
    solucionHtml(q) { return '<ol>' + q.correcto.map(i => '<li>' + mdi(q.items[i]) + '</li>').join('') + '</ol>'; },
    respuestaHtml(q, ans) { return '<ol>' + (ans || q.inicial).map(i => '<li>' + mdi(q.items[i]) + '</li>').join('') + '</ol>'; }
  };

  /* =============================== clasificar / comparar =============================== */
  Tipos.clasificar = {
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      const lista = h('div', { class: 'clasif' }); const sels = [];
      q.items.forEach((it, i) => {
        const sel = h('select', { class: 'sel-clasif', 'aria-label': 'Categoría' }, h('option', { value: '-1', text: '— elige —' }), q.categorias.map((c, k) => h('option', { value: String(k), text: c })));
        sels.push(sel);
        lista.appendChild(h('div', { class: 'clasif-fila' }, h('div', { class: 'clasif-txt', html: mdi(it.t) }), sel));
      });
      host.appendChild(lista);
      return {
        getAnswer: () => sels.map(s => +s.value), setAnswer(a) { (a || []).forEach((v, i) => sels[i] && (sels[i].value = String(v))); },
        isEmpty: () => sels.every(s => s.value === '-1'), lock(b) { sels.forEach(s => s.disabled = !!b); },
        onChange(f) { sels.forEach(s => s.addEventListener('change', f)); }, focus() { sels[0].focus(); },
        marcar(res) { sels.forEach((s, i) => { s.classList.remove('ok', 'mal'); if (res.filas && res.filas[i] !== undefined) s.classList.add(res.filas[i] ? 'ok' : 'mal'); }); }, limpiarMarcas() { sels.forEach(s => s.classList.remove('ok', 'mal')); }
      };
    },
    grade(q, ans) {
      ans = ans || [];
      const filas = q.items.map((it, i) => ans[i] === it.cat);
      const n = filas.filter(Boolean).length; const items = [];
      if (n === filas.length) items.push(ok('Todas las clasificaciones son correctas.'));
      else {
        items.push(mal('Clasificaciones correctas: **' + n + ' de ' + filas.length + '**.'));
        q.items.forEach((it, i) => { if (!filas[i] && ans[i] !== undefined && ans[i] >= 0 && it.why) items.push(mal('«' + it.t + '»: ' + it.why)); });
      }
      return { score: n / filas.length, ok: n === filas.length, items, filas };
    },
    solve(q) { return q.items.map(it => it.cat); },
    solucionHtml(q) { return '<ul>' + q.items.map(it => '<li>' + mdi(it.t) + ' → <strong>' + esc(q.categorias[it.cat]) + '</strong>' + (it.why ? ' — ' + mdi(it.why) : '') + '</li>').join('') + '</ul>'; },
    respuestaHtml(q, ans) { return '<ul>' + q.items.map((it, i) => '<li>' + mdi(it.t) + ' → ' + (ans && ans[i] >= 0 ? '<strong>' + esc(q.categorias[ans[i]]) + '</strong>' : '<em>—</em>') + '</li>').join('') + '</ul>'; }
  };

  /* =============================== complejidad (Big O) =============================== */
  const ETQ = {
    '1': 'O(1)', 'logn': 'O(log n)', 'n': 'O(n)', 'nlogn': 'O(n log n)', 'n2': 'O(n²)', 'n3': 'O(n³)', '2n': 'O(2ⁿ)', 'nfact': 'O(n!)',
    'h': 'O(h)', 'Vm': 'O(V·m)', 'sqrtn': 'O(√n)', 'nm': 'O(n·m)', 'n2logn': 'O(n² log n)', 'logn2': 'O(log² n)', 'd': 'O(d)', 'n4': 'O(n⁴)'
  };
  const ESCALA = ['1', 'logn', 'n', 'nlogn', 'n2', 'n3', '2n', 'nfact'];
  Tipos.bigo = {
    ETQ,
    render(host, q, ctx) {
      cabecera(host, q, ctx);
      const esc_ = q.escala || ESCALA; const name = nuevoId();
      const etqDe = k => (q.etq && q.etq[k]) || ETQ[k] || k;
      const mkSel = (lbl) => h('select', { class: 'sel-bigo', 'aria-label': lbl }, h('option', { value: '', text: '— elige —' }), esc_.map(k => h('option', { value: k, text: etqDe(k) })));
      const sT = mkSel('Complejidad temporal'), sS = q.pideEspacio ? mkSel('Complejidad espacial') : null;
      const fila = h('div', { class: 'bigo-fila' },
        h('label', { class: 'bigo-lab' }, h('span', { text: q.etqT || 'Tiempo (peor caso)' }), sT),
        sS ? h('label', { class: 'bigo-lab' }, h('span', { text: q.etqS || 'Espacio extra' }), sS) : null);
      host.appendChild(fila);
      const jin = [], jlabs = [];
      if (q.justif) {
        host.appendChild(h('div', { class: 'justif-t', html: md(q.justif.pregunta || '**Justifica:** ¿cuál es la razón de ese resultado?') }));
        const jl = h('div', { class: 'opciones' });
        q.justif.opciones.forEach((o, i) => {
          const inp = h('input', { type: 'radio', name: name + 'j', id: name + 'j' + i });
          const lab = h('label', { class: 'opcion', for: name + 'j' + i }, inp, h('span', { class: 'op-marca' }), h('span', { class: 'op-txt', html: mdi(o.t) }));
          jin.push(inp); jlabs.push(lab); jl.appendChild(lab);
        });
        host.appendChild(jl);
      }
      const get = () => ({ t: sT.value, s: sS ? sS.value : null, j: jin.findIndex(x => x.checked) });
      return {
        getAnswer: get, setAnswer(a) { if (!a) return; sT.value = a.t || ''; if (sS) sS.value = a.s || ''; jin.forEach((x, i) => x.checked = a.j === i); },
        isEmpty: () => !sT.value, lock(b) { [sT, sS, ...jin].forEach(x => x && (x.disabled = !!b)); },
        onChange(f) { [sT, sS, ...jin].forEach(x => x && x.addEventListener('change', f)); }, focus() { sT.focus(); },
        marcar(res) { sT.classList.remove('ok', 'mal'); if (sS) sS.classList.remove('ok', 'mal'); jlabs.forEach(l => l.classList.remove('ok', 'mal')); if (res.tOk !== undefined) sT.classList.add(res.tOk ? 'ok' : 'mal'); if (sS && res.sOk !== undefined) sS.classList.add(res.sOk ? 'ok' : 'mal'); if (res.jSel >= 0 && res.jOk !== undefined) jlabs[res.jSel].classList.add(res.jOk ? 'ok' : 'mal'); },
        limpiarMarcas() { sT.classList.remove('ok', 'mal'); if (sS) sS.classList.remove('ok', 'mal'); jlabs.forEach(l => l.classList.remove('ok', 'mal')); }
      };
    },
    grade(q, ans) {
      ans = Object.assign({}, ans || {}); const items = [];
      if (ans.j === undefined || ans.j === null) ans.j = -1;
      const tOk = ans.t === q.tiempo; const sOk = q.pideEspacio ? ans.s === q.espacio : undefined;
      const jOk = q.justif ? (ans.j >= 0 && q.justif.opciones[ans.j].ok) : undefined;
      const wT = q.pideEspacio ? 0.4 : 0.5, wS = q.pideEspacio ? 0.2 : 0, wJ = q.justif ? (q.pideEspacio ? 0.4 : 0.5) : 0;
      let tot = wT + wS + wJ, score = (tOk ? wT : 0) + (sOk ? wS : 0) + (jOk ? wJ : 0);
      score = score / tot;
      items.push(tOk ? ok('Tiempo: **' + ((q.etq && q.etq[q.tiempo]) || ETQ[q.tiempo] || q.tiempo) + '** es correcto.') : mal('Tiempo: ' + (ans.t ? '«' + ((q.etq && q.etq[ans.t]) || ETQ[ans.t] || ans.t) + '» no es la cota ajustada.' : 'sin responder.') + (q.pistaT ? ' ' + q.pistaT : '')));
      if (q.pideEspacio) items.push(sOk ? ok('Espacio: **' + ((q.etq && q.etq[q.espacio]) || ETQ[q.espacio] || q.espacio) + '** es correcto.') : mal('Espacio: ' + (ans.s ? '«' + ((q.etq && q.etq[ans.s]) || ETQ[ans.s] || ans.s) + '» no es correcto.' : 'sin responder.') + (q.pistaS ? ' ' + q.pistaS : '')));
      if (q.justif) {
        if (ans.j < 0) items.push(mal('No elegiste una justificación.'));
        else items.push(jOk ? ok('Justificación correcta' + (q.justif.opciones[ans.j].why ? ': ' + q.justif.opciones[ans.j].why : '.')) : mal('Justificación incorrecta' + (q.justif.opciones[ans.j].why ? ': ' + q.justif.opciones[ans.j].why : '.')));
      }
      return { score, ok: score > 0.999, items, tOk, sOk, jOk, jSel: ans.j };
    },
    solve(q) { return { t: q.tiempo, s: q.pideEspacio ? q.espacio : null, j: q.justif ? q.justif.opciones.findIndex(o => o.ok) : -1 }; },
    solucionHtml(q) {
      return '<p>Tiempo: <strong>' + ((q.etq && q.etq[q.tiempo]) || ETQ[q.tiempo] || q.tiempo) + '</strong>' + (q.pideEspacio ? ' · Espacio extra: <strong>' + ((q.etq && q.etq[q.espacio]) || ETQ[q.espacio] || q.espacio) + '</strong>' : '') + '</p>' + (q.justif ? '<p>' + mdi(q.justif.opciones.find(o => o.ok).t) + '</p>' : '');
    },
    respuestaHtml(q, ans) {
      if (!ans || !ans.t) return '<em>Sin respuesta</em>';
      return 'Tiempo: <strong>' + ((q.etq && q.etq[ans.t]) || ETQ[ans.t] || ans.t) + '</strong>' + (q.pideEspacio ? ' · Espacio: <strong>' + (ans.s ? ((q.etq && q.etq[ans.s]) || ETQ[ans.s] || ans.s) : '—') + '</strong>' : '') + (q.justif && ans.j >= 0 ? '<br>' + mdi(q.justif.opciones[ans.j].t) : '');
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
