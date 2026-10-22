/* tipos3.js — tipos de pregunta al estilo del parcial del profesor:
   · vfj  — verdadero/falso con justificación escrita (la justificación vale más que la marca)
   · cplx — complejidad de una función: clase + variable + caso + regla + justificación
   Las justificaciones se evalúan por criterios (palabras clave) y el estudiante puede ajustar cada criterio
   con las casillas «lo expliqué» (autoevaluación). */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tipos = ET.Tipos;
  const md = U.md, mdi = U.mdInline, esc = U.esc;
  const ok = html => ({ ok: true, html }), mal = html => ({ ok: false, html }), info = html => ({ ok: null, html });
  let UIDN = 5000; const nuevoId = () => 'j' + (++UIDN);
  const pts = x => (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');
  Tipos.pts = pts;

  function cabeceraSimple(host, q, ctx) {
    if (q.enunciado || q.codigoVista || q.codigos || q.arbol !== undefined || q.arboles) Tipos.cabecera(host, q, ctx);
  }

  /** ítems de criterios con interruptor manual (el estudiante puede marcar lo que sí explicó) */
  function itemsCriterios(criterios, texto, ans, etq) {
    const manual = (ans && ans.manual) || {}; const t = U.norm(texto || ''); let cum = 0; const items = [];
    criterios.forEach((c, i) => {
      const auto = !!t && Tipos.criterioCumplido(t, c);
      const val = manual[i] !== undefined ? manual[i] : auto;
      if (val) cum++;
      items.push({ ok: val, html: (val ? '**' + (etq && etq[0] || 'Cubierto') + ':** ' : '**' + (etq && etq[1] || 'No detectado') + ':** ') + c.desc, toggle: i, auto, manual: manual[i] !== undefined });
    });
    return { items, cum, n: criterios.length };
  }
  Tipos.itemsCriterios = itemsCriterios;

  /* =============================== V/F con justificación escrita =============================== */
  Tipos.vfj = {
    render(host, q, ctx) {
      cabeceraSimple(host, q, ctx);
      const name = nuevoId();
      host.appendChild(h('blockquote', { class: 'afirmacion', html: mdi(q.afirmacion) }));
      const rv = h('input', { type: 'radio', name, id: name + 'v' }), rf = h('input', { type: 'radio', name, id: name + 'f' });
      const lv = h('label', { class: 'vf-btn v', for: name + 'v' }, rv, h('span', { text: 'Verdadero' }));
      const lf = h('label', { class: 'vf-btn f', for: name + 'f' }, rf, h('span', { text: 'Falso' }));
      host.appendChild(h('div', { class: 'vf-botones', role: 'radiogroup' }, lv, lf));
      const ta = h('textarea', { class: 'respuesta-abierta', rows: 2, placeholder: 'Justifica en una o dos frases (la justificación vale más que la marca)…', 'aria-label': 'Justificación' });
      host.appendChild(ta);
      const get = () => ({ v: rv.checked ? true : (rf.checked ? false : null), texto: ta.value, manual: {} });
      return {
        getAnswer: get,
        setAnswer(a) { if (!a) return; rv.checked = a.v === true; rf.checked = a.v === false; ta.value = a.texto || ''; },
        isEmpty: () => get().v === null && !ta.value.trim(),
        lock(b) { rv.disabled = rf.disabled = !!b; ta.readOnly = !!b; },
        onChange(f) { [rv, rf].forEach(x => x.addEventListener('change', f)); ta.addEventListener('input', f); },
        focus() { rv.focus(); },
        marcar(res) { [lv, lf].forEach(l => l.classList.remove('ok', 'mal')); if (res.vfOk !== undefined && res.vfSel !== null && res.vfSel !== undefined) (res.vfSel ? lv : lf).classList.add(res.vfOk ? 'ok' : 'mal'); },
        limpiarMarcas() { [lv, lf].forEach(l => l.classList.remove('ok', 'mal')); }
      };
    },
    grade(q, ans) {
      ans = ans || { v: null, texto: '' };
      const wm = q.pesoMarca == null ? 0.3 : q.pesoMarca;
      const markOk = ans.v === q.correcta;
      const items = [];
      if (markOk) items.push(ok('Marca correcta: la afirmación es **' + (q.correcta ? 'verdadera' : 'falsa') + '**.'));
      else if (ans.v === null || ans.v === undefined) items.push(mal('No marcaste verdadero ni falso.'));
      else items.push(mal('Marca incorrecta: la afirmación es **' + (q.correcta ? 'verdadera' : 'falsa') + '**. Recuerda que en el parcial la justificación vale más que la marca.'));
      const J = itemsCriterios(q.justif.criterios, ans.texto, ans);
      J.items.forEach(it => items.push(it));
      const jf = J.cum / J.n;
      const score = wm * (markOk ? 1 : 0) + (1 - wm) * jf;
      return { score, ok: markOk && jf >= (q.umbral || 0.67) - 1e-9, items, extra: { modelo: q.justif.modelo }, vfOk: markOk, vfSel: ans.v };
    },
    solve(q) { return { v: q.correcta, texto: q.justif.modelo, manual: {} }; },
    solucionHtml(q) {
      return '<p><strong>' + (q.correcta ? 'Verdadero' : 'Falso') + '.</strong> ' + mdi(q.justif.modelo) + '</p><p class="peq"><strong>Ideas que debía incluir la justificación:</strong></p><ul class="peq">' + q.justif.criterios.map(c => '<li>' + mdi(c.desc) + '</li>').join('') + '</ul>';
    },
    respuestaHtml(q, ans) {
      if (!ans || (ans.v === null && !String(ans.texto || '').trim())) return '<em>Sin respuesta</em>';
      return '<strong>' + (ans.v === null ? '(sin marca)' : ans.v ? 'Verdadero' : 'Falso') + '</strong>' + (ans.texto && ans.texto.trim() ? '<div class="cita">' + esc(ans.texto).replace(/\n/g, '<br>') + '</div>' : '');
    }
  };

  /* =============================== complejidad con variable, caso y regla =============================== */
  const CASOS = { mejor: 'Mejor caso', peor: 'Peor caso', promedio: 'Caso promedio' };
  const REGLAS = {
    suma: 'Regla de la suma (bloques consecutivos)',
    producto: 'Regla del producto (ciclos anidados)',
    oculto: 'Costo oculto de una operación de Python',
    log: 'El índice se duplica / se divide a la mitad (logaritmo)',
    rec: 'Recurrencia (árbol de llamadas)',
    amort: 'Argumento amortizado',
    const: 'Operaciones de costo constante',
    altura: 'El costo depende de la altura del árbol'
  };
  Tipos.REGLAS = REGLAS;
  const PESOS = { clase: 0.4, variable: 0.1, caso: 0.1, regla: 0.2, just: 0.2 };
  Tipos.cplx = {
    REGLAS, CASOS,
    render(host, q, ctx) {
      cabeceraSimple(host, q, ctx);
      const pide = q.pide || ['clase', 'variable', 'caso', 'regla', 'just'];
      const escala = q.escala || ['1', 'logn', 'n', 'nlogn', 'n2', 'n3', '2n'];
      const etqDe = k => (q.etq && q.etq[k]) || Tipos.bigo.ETQ[k] || k;
      const mk = (opts, lbl) => h('select', { class: 'sel-bigo', 'aria-label': lbl }, h('option', { value: '', text: '— elige —' }), opts.map(([v, t]) => h('option', { value: v, text: t })));
      const campos = {}; const fila = h('div', { class: 'bigo-fila' });
      const add = (k, lbl, el) => { campos[k] = el; fila.appendChild(h('label', { class: 'bigo-lab' }, h('span', { text: lbl }), el)); };
      if (pide.includes('clase')) add('clase', q.etqClase || 'Complejidad temporal', mk(escala.map(k => [k, etqDe(k)]), 'Complejidad'));
      if (pide.includes('variable')) add('variable', 'Respecto de la variable', mk((q.variables || ['n', 'h', 'k', 'm']).map(v => [v, v]), 'Variable'));
      if (pide.includes('caso')) add('caso', 'Caso', mk(Object.entries(CASOS), 'Caso'));
      if (pide.includes('regla')) add('regla', 'Regla / argumento que usaste', mk((q.reglasOpc || ['suma', 'producto', 'oculto', 'log', 'rec']).map(k => [k, REGLAS[k]]), 'Regla'));
      host.appendChild(fila);
      let ta = null;
      if (pide.includes('just')) {
        host.appendChild(h('div', { class: 'justif-t', html: mdi(q.justif.pregunta || '**Justifica:** explica en pocas frases cómo llegaste a esa complejidad.') }));
        ta = h('textarea', { class: 'respuesta-abierta', rows: 3, placeholder: 'Tu argumento: qué se repite, cuántas veces y por qué…', 'aria-label': 'Justificación' });
        host.appendChild(ta);
      }
      const todos = () => Object.values(campos).concat(ta ? [ta] : []);
      const get = () => { const a = { texto: ta ? ta.value : '', manual: {} }; Object.keys(campos).forEach(k => a[k] = campos[k].value || null); return a; };
      return {
        getAnswer: get,
        setAnswer(a) { if (!a) return; Object.keys(campos).forEach(k => campos[k].value = a[k] || ''); if (ta) ta.value = a.texto || ''; },
        isEmpty: () => todos().every(x => !String(x.value || '').trim()),
        lock(b) { Object.values(campos).forEach(x => x.disabled = !!b); if (ta) ta.readOnly = !!b; },
        onChange(f) { Object.values(campos).forEach(x => x.addEventListener('change', f)); if (ta) ta.addEventListener('input', f); },
        focus() { const k = Object.values(campos)[0]; if (k) k.focus(); },
        marcar(res) { Object.keys(campos).forEach(k => { campos[k].classList.remove('ok', 'mal'); if (res.campos && res.campos[k] !== undefined) campos[k].classList.add(res.campos[k] ? 'ok' : 'mal'); }); },
        limpiarMarcas() { Object.values(campos).forEach(x => x.classList.remove('ok', 'mal')); }
      };
    },
    grade(q, ans) {
      ans = ans || {}; const E = q.esperado; const pide = q.pide || ['clase', 'variable', 'caso', 'regla', 'just'];
      const items = [], campos = {}; let tot = 0, suma = 0; let todoOk = true;
      const etqDe = k => (q.etq && q.etq[k]) || Tipos.bigo.ETQ[k] || k;
      pide.forEach(k => {
        const w = PESOS[k]; tot += w;
        if (k === 'clase') {
          const o = ans.clase === E.clase; campos.clase = o; if (o) suma += w; else todoOk = false;
          items.push(o ? ok('Complejidad: **' + etqDe(E.clase) + '** ✔.') : mal('La complejidad no es la que elegiste' + (ans.clase ? ' (' + etqDe(ans.clase) + ')' : '') + '. ' + (q.pistaClase || 'Cuenta cuántas veces se ejecuta la operación dominante en función de la variable.')));
        } else if (k === 'variable') {
          const o = ans.variable === E.variable; campos.variable = o; if (o) suma += w; else todoOk = false;
          items.push(o ? ok('Variable: **' + E.variable + '** ✔.') : mal('Variable incorrecta: la complejidad se expresa respecto de **' + E.variable + '**' + (q.varMotivo ? ' (' + q.varMotivo + ')' : '') + '. En el parcial siempre se debe indicar de qué variable se habla.'));
        } else if (k === 'caso') {
          const o = ans.caso === E.caso; campos.caso = o; if (o) suma += w; else todoOk = false;
          items.push(o ? ok('Caso: **' + CASOS[E.caso].toLowerCase() + '** ✔.') : mal('Caso incorrecto: aquí se pide el **' + CASOS[E.caso].toLowerCase() + '**' + (q.casoMotivo ? ' (' + q.casoMotivo + ')' : '') + '.'));
        } else if (k === 'regla') {
          const o = ans.regla === E.regla; campos.regla = o; if (o) suma += w; else todoOk = false;
          items.push(o ? ok('Regla: **' + REGLAS[E.regla] + '** ✔.') : mal('La regla principal es otra: **' + REGLAS[E.regla] + '**.' + (q.reglaMotivo ? ' ' + q.reglaMotivo : '')));
        } else if (k === 'just') {
          const J = itemsCriterios(q.justif.criterios, ans.texto, ans); J.items.forEach(it => items.push(it));
          const f = J.cum / J.n; suma += w * f; if (f < (q.umbral || 0.67) - 1e-9) todoOk = false;
        }
      });
      const score = suma / tot;
      return { score, ok: todoOk && score > 0.9 - 1e-9, items, campos, extra: pide.includes('just') ? { modelo: q.justif.modelo } : undefined };
    },
    solve(q) { const E = q.esperado; return { clase: E.clase, variable: E.variable, caso: E.caso, regla: E.regla, texto: q.justif ? q.justif.modelo : '', manual: {} }; },
    solucionHtml(q) {
      const E = q.esperado; const etqDe = k => (q.etq && q.etq[k]) || Tipos.bigo.ETQ[k] || k;
      return '<ul><li>Complejidad: <strong>' + esc(etqDe(E.clase)) + '</strong></li><li>Variable: <strong>' + esc(E.variable) + '</strong> · ' + CASOS[E.caso].toLowerCase() + '</li><li>Regla: <strong>' + esc(REGLAS[E.regla]) + '</strong></li></ul>' +
        (q.justif ? '<p>' + mdi(q.justif.modelo) + '</p><p class="peq"><strong>Ideas que debía incluir la justificación:</strong></p><ul class="peq">' + q.justif.criterios.map(c => '<li>' + mdi(c.desc) + '</li>').join('') + '</ul>' : '');
    },
    respuestaHtml(q, ans) {
      if (!ans) return '<em>Sin respuesta</em>';
      const etqDe = k => (q.etq && q.etq[k]) || Tipos.bigo.ETQ[k] || k; const p = [];
      if (ans.clase) p.push('Complejidad: <strong>' + esc(etqDe(ans.clase)) + '</strong>'); if (ans.variable) p.push('Variable: <strong>' + esc(ans.variable) + '</strong>');
      if (ans.caso) p.push('Caso: <strong>' + CASOS[ans.caso].toLowerCase() + '</strong>'); if (ans.regla) p.push('Regla: <strong>' + esc(REGLAS[ans.regla]) + '</strong>');
      return (p.length ? p.join(' · ') : '<em>Sin respuesta</em>') + (ans.texto && ans.texto.trim() ? '<div class="cita">' + esc(ans.texto).replace(/\n/g, '<br>') + '</div>' : '');
    }
  };

  /* =============================== autoevaluación manual =============================== */
  const MANUALIZABLE = new Set(['abierta', 'vfj', 'cplx']);
  /** ¿la pregunta tiene criterios que el estudiante puede ajustar con las casillas «lo expliqué»? */
  Tipos.manualizable = q => MANUALIZABLE.has(q.tipo) || (q.tipo === 'mixta' && q.partes.some(p => Tipos.manualizable(p.q)));
})(typeof window !== 'undefined' ? window : globalThis);
