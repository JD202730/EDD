/* util.js — utilidades generales: RNG con semilla, DOM, almacenamiento, resaltado de Python */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};

  /* ---------- RNG determinista (mulberry32) ---------- */
  class RNG {
    constructor(seed) { this.s = (seed >>> 0) || 1; }
    next() {
      this.s = (this.s + 0x6D2B79F5) >>> 0;
      let t = this.s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    int(lo, hi) { return lo + Math.floor(this.next() * (hi - lo + 1)); }       // inclusivo
    chance(p) { return this.next() < p; }
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    }
    sample(arr, k) { return this.shuffle(arr).slice(0, k); }
    /** k enteros distintos en [lo,hi] */
    distinct(k, lo, hi) {
      const pool = []; for (let i = lo; i <= hi; i++) pool.push(i);
      return this.sample(pool, k);
    }
    weighted(items, wf) {
      let tot = 0; const ws = items.map(it => { const w = Math.max(0, wf(it)); tot += w; return w; });
      if (tot <= 0) return this.pick(items);
      let r = this.next() * tot;
      for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
      return items[items.length - 1];
    }
  }
  const newSeed = () => (Math.floor(Math.random() * 2147483647) + 1);

  /* ---------- texto ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const quitaAcentos = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
  /** normaliza respuestas cortas: minúsculas, sin acentos, sin espacios sobrantes */
  const norm = s => quitaAcentos(String(s == null ? '' : s)).toLowerCase().replace(/\s+/g, ' ').trim();
  const normCompacto = s => norm(s).replace(/[\s"'`]/g, '');
  const fmtTiempo = ms => {
    const s = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  };
  const fmtFecha = t => {
    const d = new Date(t);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const pct = x => Math.round(x * 100);
  const sum = a => a.reduce((s, x) => s + x, 0);
  const avg = a => a.length ? sum(a) / a.length : 0;
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  /* ---------- DOM ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'value') el.value = v;
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      el.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  function vaciar(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ---------- almacenamiento (con respaldo en memoria) ---------- */
  const Store = (() => {
    const mem = {}; let ok = true;
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); } catch (e) { ok = false; }
    return {
      persistente: ok,
      get(k, def) {
        try { const v = ok ? localStorage.getItem(k) : mem[k]; return v == null ? def : JSON.parse(v); } catch (e) { return def; }
      },
      set(k, v) {
        const s = JSON.stringify(v);
        try { if (ok) localStorage.setItem(k, s); else mem[k] = s; return true; } catch (e) { mem[k] = s; return false; }
      },
      del(k) { try { if (ok) localStorage.removeItem(k); delete mem[k]; } catch (e) { } }
    };
  })();

  /* ---------- resaltado de sintaxis de Python ---------- */
  const KW = new Set('def class if elif else while for in return import from as and or not is None True False break continue pass try except finally raise lambda global nonlocal assert del with yield'.split(' '));
  const BI = new Set('print len range int float str list dict set tuple max min sum abs sorted enumerate zip isinstance bool reversed any all map filter round self cls super type repr'.split(' '));
  const TOK = /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?''')|([fFrRbB]{0,2}"(?:\\.|[^"\\\n])*"|[fFrRbB]{0,2}'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_À-￿][\wÀ-￿]*)|([\s\S])/g;
  function resaltarPy(src) {
    let out = '', prev = '', m;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(src)) !== null) {
      if (m[1]) out += '<span class="tk-c">' + esc(m[1]) + '</span>';
      else if (m[2] || m[3]) out += '<span class="tk-s">' + esc(m[0]) + '</span>';
      else if (m[4]) out += '<span class="tk-n">' + esc(m[0]) + '</span>';
      else if (m[5]) {
        const w = m[5];
        if (KW.has(w)) out += '<span class="tk-k">' + w + '</span>';
        else if (prev === 'def' || prev === 'class') out += '<span class="tk-f">' + esc(w) + '</span>';
        else if (BI.has(w)) out += '<span class="tk-b">' + w + '</span>';
        else out += esc(w);
        prev = w; continue;
      } else out += esc(m[0]);
      if (!/^\s$/.test(m[0])) prev = '';
    }
    return out;
  }
  /** bloque de código de solo lectura */
  function bloqueCodigo(src, opts) {
    opts = opts || {};
    const pre = h('pre', { class: 'code' + (opts.small ? ' small' : '') });
    const code = h('code', { html: resaltarPy(src.replace(/\n$/, '')) });
    pre.appendChild(code);
    return pre;
  }
  const htmlCodigo = (src) => '<pre class="code"><code>' + resaltarPy(String(src).replace(/\n$/, '')) + '</code></pre>';
  /** quita sangría común y espacios finales de plantillas de código */
  function dedent(s) {
    const lines = String(s).replace(/\t/g, '    ').split('\n');
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    let min = Infinity;
    for (const l of lines) if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length);
    if (!isFinite(min)) min = 0;
    return lines.map(l => l.slice(min).replace(/\s+$/, '')).join('\n');
  }

  /* ---------- markdown ligero: **negrita**, `código`, ```bloques```, listas "- ", párrafos ---------- */
  function inline(s) {
    const codes = [];
    let t = String(s).replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0001' + (codes.length - 1) + '\u0002'; });
    t = esc(t).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
    return t.replace(/\u0001(\d+)\u0002/g, (m, i) => '<code>' + esc(codes[+i]) + '</code>');
  }
  function md(src) {
    if (src == null) return '';
    const parts = String(src).replace(/\r/g, '').split(/```[a-z]*\n?/);
    let out = '';
    parts.forEach((p, i) => {
      if (i % 2 === 1) { out += htmlCodigo(dedent(p)); return; }
      const blocks = p.split(/\n{2,}/);
      for (let b of blocks) {
        b = b.replace(/^\n+|\n+$/g, '');
        if (!b.trim()) continue;
        const lines = b.split('\n');
        if (lines.length > 1 && lines.every(l => /^\s*\|/.test(l))) {
          const filas = lines.filter(l => !/^\s*\|[\s:|-]+\|\s*$/.test(l)).map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
          out += '<div class="tabla-md"><table><thead><tr>' + filas[0].map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
            filas.slice(1).map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
        } else if (lines.every(l => /^\s*-\s+/.test(l))) out += '<ul>' + lines.map(l => '<li>' + inline(l.replace(/^\s*-\s+/, '')) + '</li>').join('') + '</ul>';
        else if (lines.every(l => /^\s*\d+[.)]\s+/.test(l))) out += '<ol>' + lines.map(l => '<li>' + inline(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>').join('') + '</ol>';
        else {
          // mezcla: líneas "- " dentro de un párrafo
          let html = '', buf = [], ul = [];
          const flushP = () => { if (buf.length) { html += '<p>' + buf.map(inline).join('<br>') + '</p>'; buf = []; } };
          const flushU = () => { if (ul.length) { html += '<ul>' + ul.map(x => '<li>' + inline(x) + '</li>').join('') + '</ul>'; ul = []; } };
          for (const l of lines) {
            if (/^\s*-\s+/.test(l)) { flushP(); ul.push(l.replace(/^\s*-\s+/, '')); }
            else { flushU(); buf.push(l); }
          }
          flushP(); flushU(); out += html;
        }
      }
    });
    return out;
  }
  const mdInline = s => inline(s);

  /* ---------- varios ---------- */
  function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
  function descargar(nombre, texto, mime) {
    const blob = new Blob([texto], { type: mime || 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  ET.U = { RNG, newSeed, esc, quitaAcentos, norm, normCompacto, fmtTiempo, fmtFecha, clamp, pct, sum, avg, uid, h, $, $$, vaciar, svgEl, Store, resaltarPy, bloqueCodigo, htmlCodigo, dedent, md, mdInline, deepEq, debounce, descargar };
})(typeof window !== 'undefined' ? window : globalThis);
