/* editor.js — editor de código ligero: resaltado de Python, números de línea, tabulación y auto-sangría */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const U = ET.U;

  function crear(opts) {
    opts = opts || {};
    const minLineas = opts.minLineas || 8, maxLineas = opts.maxLineas || 26;
    const gut = U.h('pre', { class: 'ed-gut', 'aria-hidden': 'true' });
    const code = U.h('code');
    const hl = U.h('pre', { class: 'ed-hl', 'aria-hidden': 'true' }, code);
    const ta = U.h('textarea', { class: 'ed-ta', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', wrap: 'off', 'aria-label': opts.etiqueta || 'Editor de código Python' });
    const area = U.h('div', { class: 'ed-area' }, hl, ta);
    const el = U.h('div', { class: 'editor' }, U.h('div', { class: 'ed-gutter' }, gut), area);
    const oyentes = [];
    let bloqueado = false;

    function pinta() {
      const v = ta.value;
      code.innerHTML = U.resaltarPy(v) + '\n ';
      const n = v.split('\n').length;
      let g = ''; for (let i = 1; i <= n; i++) g += i + '\n';
      gut.textContent = g;
      const lh = 21; const lineas = Math.max(minLineas, Math.min(maxLineas, n + 1));
      el.style.height = (lineas * lh + 20) + 'px';
      sync();
    }
    function sync() { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; gut.style.transform = 'translateY(' + (-ta.scrollTop) + 'px)'; }
    function cambio() { pinta(); oyentes.forEach(f => f(ta.value)); }

    ta.addEventListener('input', cambio);
    ta.addEventListener('scroll', sync);
    ta.addEventListener('keydown', ev => {
      if (bloqueado) return;
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      if (ev.key === 'Tab') {
        ev.preventDefault();
        const ini = v.lastIndexOf('\n', s - 1) + 1;
        if (s !== e || ev.shiftKey) {
          // sangrar / quitar sangría de las líneas seleccionadas
          const fin = v.indexOf('\n', e); const finReal = fin < 0 ? v.length : fin;
          const bloque = v.slice(ini, finReal).split('\n');
          const nuevo = bloque.map(l => ev.shiftKey ? l.replace(/^( {1,4}|\t)/, '') : '    ' + l).join('\n');
          ta.value = v.slice(0, ini) + nuevo + v.slice(finReal);
          ta.selectionStart = ini; ta.selectionEnd = ini + nuevo.length;
        } else {
          ta.value = v.slice(0, s) + '    ' + v.slice(e);
          ta.selectionStart = ta.selectionEnd = s + 4;
        }
        cambio(); return;
      }
      if (ev.key === 'Enter' && !ev.ctrlKey && !ev.metaKey) {
        ev.preventDefault();
        const ini = v.lastIndexOf('\n', s - 1) + 1;
        const linea = v.slice(ini, s);
        let sang = linea.match(/^ */)[0];
        if (linea.replace(/#.*$/, '').trimEnd().endsWith(':')) sang += '    ';
        ta.value = v.slice(0, s) + '\n' + sang + v.slice(e);
        ta.selectionStart = ta.selectionEnd = s + 1 + sang.length;
        cambio(); return;
      }
      if (ev.key === 'Backspace' && s === e && s > 0) {
        const ini = v.lastIndexOf('\n', s - 1) + 1; const antes = v.slice(ini, s);
        if (antes.length > 0 && /^ +$/.test(antes) && antes.length % 4 === 0) {
          ev.preventDefault();
          ta.value = v.slice(0, s - 4) + v.slice(s); ta.selectionStart = ta.selectionEnd = s - 4; cambio(); return;
        }
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); if (opts.onEjecutar) opts.onEjecutar(); }
    });

    const api = {
      el,
      getValue: () => ta.value,
      setValue(v) { ta.value = v == null ? '' : v; pinta(); },
      onChange(f) { oyentes.push(f); },
      focus() { ta.focus(); },
      lock(b) { bloqueado = !!b; ta.readOnly = !!b; el.classList.toggle('bloqueado', !!b); },
      resaltarLinea(n) { /* marca visual simple: coloca el cursor en la línea */ const ls = ta.value.split('\n'); let pos = 0; for (let i = 0; i < n - 1 && i < ls.length; i++) pos += ls[i].length + 1; ta.focus(); ta.setSelectionRange(pos, pos + (ls[n - 1] || '').length); }
    };
    api.setValue(opts.valor || '');
    return api;
  }

  /** Muestra código con huecos [[1]] como campos de texto en línea. Devuelve {el, getHuecos(), onChange, lock} */
  function crearHuecos(plantilla, opts) {
    opts = opts || {};
    const inputs = {}; const oyentes = [];
    const pre = U.h('pre', { class: 'code huecos' });
    const lines = plantilla.replace(/\n$/, '').split('\n');
    lines.forEach((ln, li) => {
      const row = U.h('div', { class: 'hl-linea' });
      row.appendChild(U.h('span', { class: 'hl-num', text: String(li + 1) }));
      const cont = U.h('span', { class: 'hl-cod' });
      const re = /\[\[(\w+)\]\]/g; let last = 0, m;
      while ((m = re.exec(ln)) !== null) {
        if (m.index > last) cont.appendChild(U.h('span', { html: U.resaltarPy(ln.slice(last, m.index)) }));
        const id = m[1];
        const w = Math.max(5, (opts.anchos && opts.anchos[id]) || 8);
        const inp = U.h('input', { class: 'hueco', type: 'text', size: w, spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', 'aria-label': 'Hueco ' + id, placeholder: '…' });
        inp.addEventListener('input', () => oyentes.forEach(f => f()));
        inputs[id] = inp; cont.appendChild(inp);
        last = m.index + m[0].length;
      }
      if (last < ln.length) cont.appendChild(U.h('span', { html: U.resaltarPy(ln.slice(last)) }));
      if (!ln.length) cont.appendChild(document.createTextNode(' '));
      row.appendChild(cont); pre.appendChild(row);
    });
    return {
      el: pre,
      getHuecos() { const o = {}; for (const k in inputs) o[k] = inputs[k].value; return o; },
      setHuecos(o) { for (const k in o) if (inputs[k]) inputs[k].value = o[k]; },
      onChange(f) { oyentes.push(f); },
      lock(b) { for (const k in inputs) inputs[k].readOnly = !!b; },
      marcar(id, ok) { if (inputs[id]) { inputs[id].classList.toggle('ok', ok === true); inputs[id].classList.toggle('mal', ok === false); } },
      limpiarMarcas() { for (const k in inputs) inputs[k].classList.remove('ok', 'mal'); }
    };
  }

  ET.Editor = { crear, crearHuecos };
})(typeof window !== 'undefined' ? window : globalThis);
