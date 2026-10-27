/* escena.js — motor de animación de estructuras de datos.
   Una ESCENA es un lienzo SVG cuyo contenido se describe como una lista de elementos con id (cajas, nodos, flechas, etiquetas…).
   Al aplicar un nuevo cuadro, los elementos con el mismo id se MUEVEN (interpolan posición, tamaño y flechas) en lugar de redibujarse;
   los nuevos aparecen con fundido y los que faltan se desvanecen. El REPRODUCTOR encadena cuadros (anterior / siguiente / reproducir)
   y muestra la explicación y la línea de código de cada paso.
   La animación usa requestAnimationFrame con un temporizador de seguridad: si el navegador no entrega cuadros (pestaña oculta) no se cuelga. */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const U = ET.U;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const NUM = ['x', 'y', 'w', 'h', 'r', 'x1', 'y1', 'x2', 'y2', 'cv', 'op'];
  const POR_DEFECTO = { x: 0, y: 0, w: 60, h: 36, r: 18, x1: 0, y1: 0, x2: 0, y2: 0, cv: 0, op: 1 };
  const eas = f => f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
  const CAPA = { rect: 0, lin: 0, fl: 1, caja: 2, circ: 2, nodoL: 2, etq: 3 };
  let uid = 0;

  class Escena {
    /** opts: {W, H, escala} */
    constructor(host, opts) {
      opts = opts || {}; this.host = host; this.W = opts.W || 600; this.H = opts.H || 240; this.escala = opts.escala || 1;
      this.id = ++uid;
      this.svg = el('svg', { class: 'esc-svg', viewBox: '0 0 ' + this.W + ' ' + this.H, role: 'img', 'aria-label': opts.etiqueta || 'Animación de la estructura de datos' });
      const defs = el('defs');
      ['', 'act', 'mal', 'ok', 'tenue'].forEach(c => {
        const m = el('marker', { id: 'esc' + this.id + 'm' + c, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto' });
        m.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'esc-punta' + (c ? ' ' + c : '') })); defs.appendChild(m);
      });
      this.svg.appendChild(defs);
      this.capas = [0, 1, 2, 3].map(() => { const g = el('g'); this.svg.appendChild(g); return g; });
      this.els = new Map(); this.job = null;
      host.classList.add('esc-host'); host.appendChild(this.svg); this.medir();
    }
    medir() { this.svg.setAttribute('viewBox', '0 0 ' + this.W + ' ' + this.H); this.svg.style.width = Math.round(this.W * this.escala) + 'px'; this.svg.style.height = Math.round(this.H * this.escala) + 'px'; }
    tamano(W, H) { if (W) this.W = W; if (H) this.H = H; this.medir(); }
    destruir() { this.parar(); this.svg.remove(); this.els.clear(); }
    parar() { if (this.job) { const f = this.job; this.job = null; f(); } }

    /** muestra un cuadro. items: [{id, k, ...}]. Devuelve una promesa que se cumple al terminar la animación. */
    aplicar(items, o) {
      o = o || {}; const dur = o.dur === undefined ? 520 : o.dur;
      this.parar();
      if (o.W || o.H) this.tamano(o.W, o.H);
      const nuevos = new Map(); items.forEach(it => { if (it && it.id !== undefined) nuevos.set(String(it.id), it); });
      const trabajos = [];
      this.els.forEach((e, id) => { if (!nuevos.has(id) && !e.saliendo) { e.saliendo = true; trabajos.push({ e, desde: { op: e.cur.op }, hasta: { op: 0 }, quitar: true }); } });
      nuevos.forEach((it, id) => {
        let e = this.els.get(id);
        const hasta = {}; NUM.forEach(p => { if (it[p] !== undefined) hasta[p] = Number(it[p]); });
        if (!e || e.saliendo || e.k !== it.k) {
          if (e) { this.quita(id); }
          e = this.crea(id, it); this.els.set(id, e);
          const full = Object.assign({}, POR_DEFECTO, e.cur0 || {}, hasta);
          const desde = Object.assign({}, full, { op: 0 });
          if (it.desde) Object.assign(desde, it.desde);          // aparece moviéndose desde esa posición
          e.cur = Object.assign({}, desde); trabajos.push({ e, desde, hasta: full });
        } else {
          e.saliendo = false;
          const full = Object.assign({}, e.cur, hasta); if (hasta.op === undefined) full.op = 1;
          trabajos.push({ e, desde: Object.assign({}, e.cur), hasta: full });
        }
        const e2 = this.els.get(id); e2.txt = it.txt !== undefined ? String(it.txt) : ''; e2.sub = it.sub !== undefined ? String(it.sub) : ''; e2.cls = it.cls || ''; e2.aux = it; e2.clic = it.clic || null; e2.tipoPunta = it.punta === false ? false : true;
        e2.g.setAttribute('class', 'esc-' + e2.k + (e2.cls ? ' ' + e2.cls : '') + (e2.clic ? ' clic' : ''));
        const t = e2.g.querySelector('text.esc-t'); if (t && t.textContent !== e2.txt) t.textContent = e2.txt;
        const ts = e2.g.querySelector('text.esc-s'); if (ts) ts.textContent = e2.sub;
        if (e2.k === 'nodoL') { e2.partes = it.partes || 2; e2.nulo = it.nulo || ''; }
        if (e2.k === 'circ') { e2.anillo = !!it.anillo; }
      });
      return this.animar(trabajos, dur);
    }
    crea(id, it) {
      const g = el('g', { 'data-id': id }); const e = { id, k: it.k, g, cur: Object.assign({}, POR_DEFECTO), saliendo: false, txt: '', sub: '' };
      const capa = this.capas[it.capa !== undefined ? it.capa : (CAPA[it.k] !== undefined ? CAPA[it.k] : 2)]; capa.appendChild(g);
      const k = it.k;
      if (k === 'caja' || k === 'rect') { e.r1 = el('rect', { rx: k === 'caja' ? 7 : 6 }); g.appendChild(e.r1); }
      if (k === 'circ') { e.c0 = el('circle', { class: 'esc-anillo' }); e.c1 = el('circle'); g.appendChild(e.c0); g.appendChild(e.c1); }
      if (k === 'nodoL') { e.r1 = el('rect', { rx: 7 }); e.l1 = el('line'); e.l2 = el('line'); e.d1 = el('circle', { r: 4, class: 'esc-dot' }); e.d2 = el('circle', { r: 4, class: 'esc-dot' }); e.n1 = el('path', { class: 'esc-nulo' }); e.n2 = el('path', { class: 'esc-nulo' }); [e.r1, e.l1, e.l2, e.d1, e.d2, e.n1, e.n2].forEach(x => g.appendChild(x)); }
      if (k === 'fl' || k === 'lin') { e.p = el('path', { fill: 'none' }); g.appendChild(e.p); }
      if (k === 'caja' || k === 'circ' || k === 'nodoL' || k === 'etq' || k === 'rect') { const t = el('text', { class: 'esc-t' }); g.appendChild(t); e.t = t; }
      if (k === 'caja' || k === 'circ' || k === 'nodoL') { const s = el('text', { class: 'esc-s' }); g.appendChild(s); e.s = s; }
      g.addEventListener('click', () => { if (e.clic) e.clic(); });
      return e;
    }
    quita(id) { const e = this.els.get(id); if (e) { e.g.remove(); this.els.delete(id); } }

    /** dibuja un elemento con los valores numéricos actuales */
    pinta(e) {
      const c = e.cur, a = e.aux || {}; e.g.style.opacity = String(Math.max(0, Math.min(1, c.op)));
      switch (e.k) {
        case 'caja': case 'rect':
          if (e.k === 'caja') e.g.setAttribute('transform', 'translate(' + c.x + ',' + c.y + ')'); else e.g.removeAttribute('transform');
          e.r1.setAttribute('x', e.k === 'rect' ? c.x : 0); e.r1.setAttribute('y', e.k === 'rect' ? c.y : 0); e.r1.setAttribute('width', Math.max(0, c.w)); e.r1.setAttribute('height', Math.max(0, c.h));
          if (e.t) { e.t.setAttribute('x', (e.k === 'rect' ? c.x : 0) + c.w / 2); e.t.setAttribute('y', (e.k === 'rect' ? c.y : 0) + c.h / 2); e.t.setAttribute('text-anchor', 'middle'); e.t.setAttribute('dominant-baseline', 'central'); }
          if (e.s) { e.s.setAttribute('x', c.w / 2); e.s.setAttribute('y', c.h + 13); e.s.setAttribute('text-anchor', 'middle'); }
          break;
        case 'circ':
          e.g.setAttribute('transform', 'translate(' + c.x + ',' + c.y + ')');
          e.c1.setAttribute('r', c.r); e.c0.setAttribute('r', c.r + 5); e.c0.style.display = e.anillo ? '' : 'none';
          if (e.t) { e.t.setAttribute('x', 0); e.t.setAttribute('y', 0); e.t.setAttribute('text-anchor', 'middle'); e.t.setAttribute('dominant-baseline', 'central'); }
          if (e.s) { e.s.setAttribute('x', 0); e.s.setAttribute('y', c.r + 14); e.s.setAttribute('text-anchor', 'middle'); }
          break;
        case 'nodoL': {
          e.g.setAttribute('transform', 'translate(' + c.x + ',' + c.y + ')');
          const w = c.w, h = c.h, tres = e.partes === 3;
          e.r1.setAttribute('width', w); e.r1.setAttribute('height', h);
          const x1 = tres ? w * .27 : w * .62, x2 = tres ? w * .73 : w * .62;
          e.l1.setAttribute('x1', x1); e.l1.setAttribute('x2', x1); e.l1.setAttribute('y1', 0); e.l1.setAttribute('y2', h);
          e.l2.setAttribute('x1', x2); e.l2.setAttribute('x2', x2); e.l2.setAttribute('y1', 0); e.l2.setAttribute('y2', h); e.l2.style.display = tres ? '' : 'none';
          const dsig = tres ? (x2 + w) / 2 : (x1 + w) / 2, dant = x1 / 2, ysig = tres ? h * .3 : h / 2, yant = h * .7;
          const sigNulo = e.nulo === 'sig' || e.nulo === 'ambos', antNulo = tres && (e.nulo === 'ant' || e.nulo === 'ambos');
          e.d1.setAttribute('cx', dsig); e.d1.setAttribute('cy', ysig); e.d1.style.display = sigNulo ? 'none' : '';
          e.d2.setAttribute('cx', dant); e.d2.setAttribute('cy', yant); e.d2.style.display = tres && !antNulo ? '' : 'none';
          const xs = tres ? x2 : x1; e.n1.setAttribute('d', 'M' + (xs + 5) + ' ' + (h - 6) + ' L' + (w - 5) + ' 6'); e.n1.style.display = sigNulo ? '' : 'none';
          e.n2.setAttribute('d', 'M5 ' + (h - 6) + ' L' + (x1 - 5) + ' 6'); e.n2.style.display = antNulo ? '' : 'none';
          if (e.t) { const cx = tres ? (x1 + x2) / 2 : x1 / 2; e.t.setAttribute('x', cx); e.t.setAttribute('y', h / 2); e.t.setAttribute('text-anchor', 'middle'); e.t.setAttribute('dominant-baseline', 'central'); }
          if (e.s) { e.s.setAttribute('x', w / 2); e.s.setAttribute('y', h + 13); e.s.setAttribute('text-anchor', 'middle'); }
          e.g.dataset.nulo = e.nulo || '';
          break;
        }
        case 'fl': case 'lin': {
          const dx = c.x2 - c.x1, dy = c.y2 - c.y1, L = Math.hypot(dx, dy) || 1;
          let d;
          if (Math.abs(c.cv) > .5) { const cx = (c.x1 + c.x2) / 2 - dy / L * c.cv, cy = (c.y1 + c.y2) / 2 + dx / L * c.cv; d = 'M' + c.x1 + ' ' + c.y1 + ' Q' + cx + ' ' + cy + ' ' + c.x2 + ' ' + c.y2; }
          else d = 'M' + c.x1 + ' ' + c.y1 + ' L' + c.x2 + ' ' + c.y2;
          e.p.setAttribute('d', d);
          if (e.k === 'fl' && e.tipoPunta !== false) { const cl = /\bact\b/.test(e.cls) ? 'act' : /\bmal\b/.test(e.cls) ? 'mal' : /\bok\b/.test(e.cls) ? 'ok' : /\btenue\b/.test(e.cls) ? 'tenue' : ''; e.p.setAttribute('marker-end', 'url(#esc' + this.id + 'm' + cl + ')'); } else e.p.removeAttribute('marker-end');
          break;
        }
        case 'etq':
          e.t.setAttribute('x', c.x); e.t.setAttribute('y', c.y); e.t.setAttribute('text-anchor', a.ancla || 'middle'); e.t.setAttribute('dominant-baseline', 'central');
          break;
      }
    }
    animar(trabajos, dur) {
      return new Promise(res => {
        const aplicaFinal = () => { trabajos.forEach(j => { Object.assign(j.e.cur, j.hasta); if (j.quitar) { this.quita(j.e.id); } else this.pinta(j.e); }); };
        if (!trabajos.length) return res();
        trabajos.forEach(j => { j.e.cur = Object.assign({}, j.desde); if (!j.quitar) this.pinta(j.e); });
        if (dur <= 0 || typeof requestAnimationFrame === 'undefined') { aplicaFinal(); return res(); }
        let fin = false, raf = null, to = null; const t0 = performance.now();
        const terminar = () => { if (fin) return; fin = true; if (raf) cancelAnimationFrame(raf); clearTimeout(to); aplicaFinal(); this.job = null; res(); };
        const paso = () => {
          if (fin) return;
          const f = Math.min(1, (performance.now() - t0) / dur), g = eas(f);
          trabajos.forEach(j => { for (const p in j.hasta) j.e.cur[p] = j.desde[p] + (j.hasta[p] - j.desde[p]) * g; this.pinta(j.e); });
          if (f < 1) raf = requestAnimationFrame(paso); else terminar();
        };
        this.job = terminar; raf = requestAnimationFrame(paso); to = setTimeout(terminar, dur + 400);
      });
    }
  }

  /* ===================== reproductor paso a paso ===================== */
  const VELOCIDADES = [['1700', 'lenta'], ['1050', 'normal'], ['560', 'rápida'], ['0', 'solo el resultado']];
  /** cfg: {W, H, escala, codigo:[líneas], tituloCodigo, vacio} */
  function crearReproductor(host, cfg) {
    cfg = cfg || {};
    const h = U.h;
    const S = { frames: [], k: -1, timer: null, vel: 1050, alFinal: null, jugando: false, token: 0 };
    const raiz = h('div', { class: 'rep' });
    const caja = h('div', { class: 'rep-escena', role: 'group', 'aria-label': 'Animación' });
    const escena = new Escena(caja, { W: cfg.W || 700, H: cfg.H || 260, escala: cfg.escala || 1, etiqueta: cfg.etiqueta });
    const msg = h('div', { class: 'rep-msg', 'aria-live': 'polite' });
    const b = (txt, tit, fn) => h('button', { class: 'btn sec peq', type: 'button', title: tit, 'aria-label': tit, onclick: fn }, txt);
    const bPlay = b('▶', 'Reproducir / pausar', () => alternar());
    const slider = h('input', { type: 'range', min: 0, max: 0, value: 0, class: 'cdarb-slider', 'aria-label': 'Paso de la animación' });
    slider.addEventListener('input', () => { pausar(); ir(+slider.value, { dur: 0 }); });
    const cont = h('span', { class: 'peq tenue cdarb-cont', 'aria-live': 'off' });
    const velSel = h('select', { class: 'cdarb-sel', 'aria-label': 'Velocidad de la animación' }, VELOCIDADES.map(([v, t]) => h('option', { value: v, text: t })));
    velSel.value = '1050'; velSel.addEventListener('change', () => { S.vel = +velSel.value; if (S.jugando) { pausar(); alternar(); } });
    const ctl = h('div', { class: 'cdarb-ctl rep-ctl', role: 'toolbar', 'aria-label': 'Control de la animación' },
      b('⏮', 'Al primer paso', () => { pausar(); ir(0); }), b('◀', 'Paso atrás', () => { pausar(); ir(S.k - 1); }), bPlay, b('▶|', 'Paso adelante', () => { pausar(); ir(S.k + 1); }), b('⏭', 'Al último paso', () => { pausar(); ir(S.frames.length - 1); }), slider, cont, velSel);
    let codEl = null, lineas = [], codTit = null;
    const pintaCodigo = (lns) => { U.vaciar(codEl); lineas = []; lns.forEach((ln, i) => { const f = h('div', { class: 'cl', 'data-l': i + 1 }, h('span', { class: 'cl-n', text: String(i + 1) }), h('span', { class: 'cl-m' }), h('span', { class: 'cl-c', html: (U.resaltarPy ? U.resaltarPy(ln) : U.esc(ln)) || ' ' })); codEl.appendChild(f); lineas.push(f); }); };
    raiz.append(caja, msg, ctl);
    if (cfg.codigo) {
      codEl = h('div', { class: 'cdarb-cod rep-cod', role: 'region', 'aria-label': 'Código' }); codTit = h('div', { class: 'cod-titulo', text: cfg.tituloCodigo || 'Código' });
      pintaCodigo(cfg.codigo); raiz.append(codTit, codEl);
    }
    host.appendChild(raiz);

    function marcar(f) {
      if (!codEl) return; const act = new Set([].concat(f && f.linea !== undefined && f.linea !== null ? f.linea : []));
      lineas.forEach((ln, i) => ln.classList.toggle('act', act.has(i + 1)));
      const first = Math.min(...act); if (isFinite(first) && lineas[first - 1]) { const fa = lineas[first - 1], top = fa.offsetTop, bot = top + fa.offsetHeight; if (top < codEl.scrollTop + 4 || bot > codEl.scrollTop + codEl.clientHeight - 4) codEl.scrollTop = Math.max(0, top - codEl.clientHeight / 2); }
    }
    let altoMax = 0;   // la caja de la escena solo crece: así los controles y el código de abajo no saltan al cambiar de paso
    function reservar(H) { const px = Math.ceil((H || escena.H) * escena.escala) + 26; if (px > altoMax) { altoMax = px; caja.style.minHeight = px + 'px'; } }
    function mostrarCuadro(f, o) {
      if (!f) return Promise.resolve();
      reservar(f.H);
      msg.innerHTML = U.mdInline(f.msg || '');
      marcar(f);
      const p = escena.aplicar(f.items || [], Object.assign({ W: f.W, H: f.H }, o));
      if (f.foco !== undefined && caja.scrollWidth > caja.clientWidth) caja.scrollTo({ left: Math.max(0, f.foco * escena.escala - caja.clientWidth / 2), behavior: o && o.dur === 0 ? 'auto' : 'smooth' });
      return p;
    }
    function ir(k, o) {
      if (!S.frames.length) return Promise.resolve();
      S.k = Math.max(0, Math.min(S.frames.length - 1, k));
      slider.value = String(S.k); cont.textContent = 'Paso ' + (S.k + 1) + ' de ' + S.frames.length;
      const p = mostrarCuadro(S.frames[S.k], o || { dur: Math.min(700, S.vel * .75) });
      if (S.k === S.frames.length - 1 && S.alFinal) { const f = S.alFinal; S.alFinal = null; setTimeout(f, 0); }
      return p;
    }
    function pausar() { S.token++; S.jugando = false; bPlay.textContent = '▶'; if (S.timer) { clearTimeout(S.timer); S.timer = null; } }
    function alternar() {
      if (!S.frames.length) return;
      if (S.jugando) { pausar(); return; }
      if (S.k >= S.frames.length - 1) ir(0, { dur: 0 });
      reproducir();
    }
    function reproducir() {
      S.jugando = true; bPlay.textContent = '⏸'; const tk = ++S.token;
      if (S.vel === 0) { pausar(); ir(S.frames.length - 1, { dur: 0 }); return; }
      const sig = () => {
        if (tk !== S.token) return;
        if (S.k >= S.frames.length - 1) { pausar(); return; }
        ir(S.k + 1).then(() => { if (tk !== S.token) return; S.timer = setTimeout(sig, Math.max(120, S.vel - Math.min(700, S.vel * .75) * .6)); });
      };
      S.timer = setTimeout(sig, Math.max(200, S.vel * .35));
    }
    const R = {
      escena, raiz, caja, msg,
      /** muestra un estado fijo (sin pasos) */
      mostrar(items, texto, o) { reservar(o && o.H); pausar(); S.frames = []; S.k = -1; slider.max = '0'; slider.value = '0'; cont.textContent = ''; ctl.classList.add('inactivo'); msg.innerHTML = U.mdInline(texto || ''); marcar(null); return escena.aplicar(items, o || { dur: 0 }); },
      /** reproduce una lista de cuadros: {items, msg, linea?, foco?, W?, H?} */
      cargar(frames, o) {
        o = o || {}; pausar(); S.frames = frames; S.alFinal = o.alFinal || null; ctl.classList.remove('inactivo');
        slider.max = String(Math.max(0, frames.length - 1));
        if (!frames.length) return;
        ir(0, { dur: o.primero === undefined ? 380 : o.primero });
        if (frames.length === 1) return;
        if (o.auto === false) return;
        reproducir();
      },
      irA: ir, pausar, alternar,
      /** cambia el código mostrado (cada operación tiene el suyo) */
      setCodigo(lns, titulo) { if (!codEl) { codEl = h('div', { class: 'cdarb-cod rep-cod', role: 'region', 'aria-label': 'Código' }); codTit = h('div', { class: 'cod-titulo', text: '' }); raiz.append(codTit, codEl); } codTit.textContent = titulo || 'Código'; pintaCodigo(lns || []); codEl.style.display = lns && lns.length ? '' : 'none'; codTit.style.display = codEl.style.display; },
      velocidad(v) { velSel.value = String(v); S.vel = +v; },
      cuadros: () => S.frames, indice: () => S.k,
      destruir() { pausar(); escena.destruir(); raiz.remove(); }
    };
    ctl.classList.add('inactivo');
    return R;
  }

  /* ===================== utilidades de dibujo compartidas ===================== */
  const Dib = {
    /** punto del borde de una caja/nodo hacia otro punto (para que las flechas no atraviesen la figura) */
    caja: (id, x, y, w, h, txt, cls, sub) => ({ id, k: 'caja', x, y, w, h, txt, cls, sub }),
    circ: (id, x, y, r, txt, cls, sub, extra) => Object.assign({ id, k: 'circ', x, y, r, txt, cls, sub }, extra || {}),
    fl: (id, x1, y1, x2, y2, cls, cv) => ({ id, k: 'fl', x1, y1, x2, y2, cls, cv: cv || 0 }),
    lin: (id, x1, y1, x2, y2, cls) => ({ id, k: 'lin', x1, y1, x2, y2, cls }),
    etq: (id, x, y, txt, cls, ancla) => ({ id, k: 'etq', x, y, txt, cls, ancla }),
    rect: (id, x, y, w, h, cls, txt) => ({ id, k: 'rect', x, y, w, h, cls, txt })
  };

  ET.Escena = Escena; ET.Reproductor = { crear: crearReproductor }; ET.Dib = Dib;
})(typeof window !== 'undefined' ? window : globalThis);
