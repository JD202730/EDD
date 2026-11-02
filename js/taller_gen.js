/* taller_gen.js — motor de los talleres interactivos de las demás estructuras (heap, rojo-negro, listas, pilas y colas, arreglos).
   Igual que el taller de árboles: el estudiante hace cada movimiento (arrastrando un elemento sobre otro, tocando o con botones) y en MODO ESTRICTO
   lo incorrecto no se acepta: la estructura no cambia y hay que intentarlo otra vez. Los pasos esperados salen del algoritmo real de cada
   estructura, así que coinciden con las animaciones del laboratorio y con las diapositivas.

   Una FAMILIA (ET.TallerGen.familias[nombre]) aporta:
     iniciar(cfg) → modelo inicial        plan(modelo, op, cfg) → { pasos, final }
     dibujar(modelo, paso, ctx) → { items, W, H }   (items de ET.Escena: los mismos del laboratorio)
     nombreOp(op, cfg), resumen(modelo), resolucionHtml(cfg), textoFinal(modelo), figuraFinal(modelo)
   Un PASO es: { id, titulo, instr, gestos: 'clic' | 'par' | 'ninguno', fuente(id), destino(id), clicable(id), botones: [{t, v, cls}],
                 acepta(gesto) → {ok, despues?, continua?, msg?, msg1?, msg2?, blando?}, despues?, okMsg?, pista(k), correcta(), incorrecta() }
   Gestos que recibe acepta(): {tipo:'clic', id} · {tipo:'par', de, a} (arrastrar o tocar uno y luego otro) · {tipo:'boton', v}.        */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h;
  const TG = ET.TallerGen = { familias: {}, NOMBRES: {} };

  TG.montar = function (host, cfg) {
    const F = TG.familias[cfg.familia];
    if (!F) throw new Error('Familia de taller desconocida: ' + cfg.familia);
    const S = { modelo: F.iniciar(cfg), op: 0, plan: null, pi: 0, fallos: 0, pistas: 0, ff: 0, hf: 0, sel: null, revela: null, anim: false, fin: false, pendiente: false, bloq: false, cbs: [], alto: 0 };
    const raiz = h('div', { class: 'taller taller-gen' });
    const cabOps = h('div', { class: 'taller-ops' }), cabFases = h('div', { class: 'taller-fases', role: 'list' }), instr = h('div', { class: 'taller-instr' });
    const lienzo = h('div', { class: 'tg-lienzo' });
    const msg = h('div', { class: 'taller-msg', role: 'status', 'aria-live': 'polite' });
    const ctrls = h('div', { class: 'taller-ctrls' }), pie = h('div', { class: 'taller-pie' });
    raiz.append(cabOps, cabFases, instr, lienzo, msg, ctrls, pie);
    host.appendChild(raiz);
    const escena = new ET.Escena(lienzo, { W: 560, H: 240, etiqueta: F.etiqueta || 'Taller interactivo' });
    const svg = escena.svg; svg.classList.add('taller-svg');

    const paso = () => (S.plan && !S.fin && !S.pendiente) ? S.plan.pasos[S.pi] : null;
    const mostrar = (texto, tipo) => { msg.className = 'taller-msg ' + (tipo || ''); msg.innerHTML = U.mdInline(texto || ''); };
    const btn = (t, fn, cls, dis) => h('button', { type: 'button', class: 'btn peq ' + (cls || 'sec'), onclick: fn, disabled: dis || null }, t);
    const dur = d => cfg.sinAnimar ? 0 : d;

    /* ---------- cabeceras ---------- */
    function pintarCab() {
      U.vaciar(cabOps); U.vaciar(cabFases); U.vaciar(instr);
      if (cfg.ops.length > 1) cfg.ops.forEach((o, i) => cabOps.appendChild(h('span', { class: 'chip ' + (i < S.op ? 'ok' : (i === S.op ? 'acento' : '')), text: (i < S.op ? '✔ ' : '') + F.nombreOp(o, cfg) })));
      const P = S.plan ? S.plan.pasos : [];
      P.forEach((p, i) => cabFases.appendChild(h('span', { class: 'fase-chip ' + (i < S.pi ? 'hecha' : (i === S.pi ? 'actual' : '')), role: 'listitem', title: p.titulo, text: i < S.pi ? '✔' : String(i + 1) })));
      const p = paso();
      if (S.fin) { instr.appendChild(h('strong', { text: '¡Ejercicio completado!' })); return; }
      if (S.pendiente || !p) { instr.appendChild(h('strong', { text: 'Operación completada.' })); instr.appendChild(h('span', { text: ' Revisa el resultado y continúa con la siguiente operación.' })); return; }
      instr.appendChild(h('div', { class: 'peq tenue', text: (cfg.ops.length > 1 ? 'Operación ' + (S.op + 1) + ' de ' + cfg.ops.length + ' · ' : '') + F.nombreOp(cfg.ops[S.op], cfg) + ' · Paso ' + (S.pi + 1) + ' de ' + P.length }));
      instr.appendChild(h('div', null, h('strong', { text: p.titulo + ': ' }), h('span', { html: U.mdInline(p.instr || '') })));
    }

    /* ---------- dibujo ---------- */
    const esFuente = (p, id) => !!p && p.gestos === 'par' && !!p.fuente && p.fuente(id);
    const esDestino = (p, id) => !!p && p.gestos === 'par' && !!p.destino && p.destino(id);
    function interactivo(p, id) {
      if (!p || S.anim || S.fin || S.bloq) return false;
      if (p.gestos === 'clic') return p.clicable ? !!p.clicable(id) : false;
      return esFuente(p, id) || esDestino(p, id);
    }
    function accesos() {
      const p = paso();
      svg.querySelectorAll('g[data-id]').forEach(g => {
        const id = g.getAttribute('data-id');
        if (interactivo(p, id)) {
          const t = g.querySelector('text.esc-t'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
          g.setAttribute('aria-label', (p.etiqueta && p.etiqueta(id)) || (t && t.textContent ? 'Elemento ' + t.textContent : id));
          g.classList.add('tg-act'); if (esFuente(p, id)) g.classList.add('tg-fuente');
        } else { g.removeAttribute('tabindex'); g.removeAttribute('role'); g.removeAttribute('aria-label'); g.classList.remove('tg-act', 'tg-fuente'); }
      });
    }
    function dibujar(ms) {
      const p = paso();
      const r = F.dibujar((p && p.antes) || S.modelo, p, { fin: S.fin, pendiente: S.pendiente, cfg });
      const rev = S.revela ? new Set([].concat(S.revela).map(String)) : null;
      r.items.forEach(it => { let c = it.cls || ''; if (S.sel && String(it.id) === S.sel) c += ' sel'; if (rev && rev.has(String(it.id))) c += ' pista'; it.cls = c.trim(); });
      if (r.H) { const px = Math.ceil(r.H) + 24; if (px > S.alto) { S.alto = px; lienzo.style.minHeight = px + 'px'; } }   // la caja solo crece: la página no salta
      svg.style.touchAction = (p && p.gestos === 'par') ? 'none' : '';
      const pr = escena.aplicar(r.items, { W: r.W, H: r.H, dur: ms === undefined ? 0 : ms });
      accesos();
      return pr;
    }

    /* ---------- gestos ---------- */
    function punto(e) { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }
    function destinoBajo(ev, srcId, p) {
      const pila = document.elementsFromPoint ? document.elementsFromPoint(ev.clientX, ev.clientY) : [];
      for (const el of pila) {
        const g = el.closest && el.closest('g[data-id]'); if (!g || !svg.contains(g)) continue;
        const id = g.getAttribute('data-id'); if (id !== srcId && esDestino(p, id)) return id;
      }
      return null;
    }
    svg.addEventListener('pointerdown', e => {
      if (S.anim || S.fin || S.bloq || S.pendiente || e.button > 0) return;
      const p = paso(); if (!p) return;
      const g = e.target.closest ? e.target.closest('g[data-id]') : null; if (!g) return;
      const id = g.getAttribute('data-id'); if (!interactivo(p, id)) return;
      const arrastrable = esFuente(p, id), inicio = punto(e); let movido = false, fantasma = null;
      try { svg.setPointerCapture(e.pointerId); } catch (x) { }
      const mover = ev => {
        if (!arrastrable) return;
        const q = punto(ev);
        if (!movido && Math.hypot(q.x - inicio.x, q.y - inicio.y) > 7) {
          movido = true; fantasma = g.cloneNode(true); fantasma.removeAttribute('data-id'); fantasma.removeAttribute('tabindex'); fantasma.setAttribute('class', (fantasma.getAttribute('class') || '') + ' tg-fantasma');
          svg.appendChild(fantasma); g.classList.add('tg-arrastrando');
        }
        if (movido) { const bb = g.getBBox(); fantasma.setAttribute('transform', 'translate(' + (q.x - (bb.x + bb.width / 2)) + ',' + (q.y - (bb.y + bb.height / 2)) + ')'); }
      };
      const limpiar = () => { svg.removeEventListener('pointermove', mover); svg.removeEventListener('pointerup', soltar); svg.removeEventListener('pointercancel', cancelar); try { svg.releasePointerCapture(e.pointerId); } catch (x) { } if (fantasma) fantasma.remove(); g.classList.remove('tg-arrastrando'); };
      const cancelar = () => limpiar();
      const soltar = ev => {
        limpiar();
        if (movido) { const dest = destinoBajo(ev, id, p); if (dest) intentar({ tipo: 'par', de: id, a: dest }); else mostrar('Suéltalo sobre otro elemento de la estructura para que cuente como movimiento.', 'info'); }
        else tap(id);
      };
      svg.addEventListener('pointermove', mover); svg.addEventListener('pointerup', soltar); svg.addEventListener('pointercancel', cancelar);
    });
    svg.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const g = e.target.closest ? e.target.closest('g[data-id]') : null; if (!g) return;
      e.preventDefault(); tap(g.getAttribute('data-id'));
    });
    function tap(id) {
      const p = paso(); if (!p || S.anim || S.fin || S.bloq) return;
      if (p.gestos === 'clic') { if (interactivo(p, id)) intentar({ tipo: 'clic', id }); return; }
      if (p.gestos !== 'par') return;
      if (S.sel === null) {
        if (esFuente(p, id)) { S.sel = id; dibujar(0); mostrar(p.ayudaSel || 'Seleccionado. Ahora toca el elemento de destino (o arrástralo).', 'info'); }
        else mostrar(p.ayudaFuente || 'Primero toca el elemento que quieres mover.', 'info');
        return;
      }
      if (S.sel === id) { S.sel = null; dibujar(0); mostrar('', ''); return; }
      const de = S.sel; S.sel = null;
      if (!esDestino(p, id)) { dibujar(0); mostrar('Ese no es un destino válido para este paso.', 'info'); return; }
      intentar({ tipo: 'par', de, a: id });
    }

    /* ---------- controles ---------- */
    function pintarControles() {
      U.vaciar(ctrls); const p = paso(); if (!p || S.fin) return;
      (p.botones || []).forEach(b => ctrls.appendChild(btn(b.t, () => intentar({ tipo: 'boton', v: b.v }), b.cls || 'sec')));
    }
    function pintarPie() {
      U.vaciar(pie); if (S.fin) { pie.appendChild(btn('↺ Repetir el ejercicio', reiniciar, 'sec')); return; }
      pie.appendChild(btn('💡 Pista (' + S.hf + '/3)', pista, 'sec', S.hf >= 3));
      pie.appendChild(btn('↺ Reiniciar', () => { if (confirm('¿Reiniciar el ejercicio desde el principio?')) reiniciar(); }, 'fantasma'));
      pie.appendChild(h('span', { class: 'peq tenue', style: { marginLeft: 'auto' }, text: 'Intentos fallidos: ' + S.fallos + ' · Pistas: ' + S.pistas }));
    }

    /* ---------- validación y avance ---------- */
    async function intentar(g) {
      const p = paso(); if (!p || S.anim || S.bloq) return;
      const v = p.acepta(g);
      if (!v.ok) {
        if (!v.blando) { S.fallos++; S.ff++; if (cfg.onError) cfg.onError({ fase: p.id }); }
        const extra = (!v.blando && S.ff >= 2 && v.msg2) ? ' ' + v.msg2 : '';
        const sug = (!v.blando && S.ff >= 3) ? ' Si te atascas, usa **💡 Pista**.' : '';
        mostrar('✘ ' + v.msg1 + extra + (v.blando ? '' : ' **Inténtalo de nuevo:** nada cambió.') + sug, 'mal');
        raiz.classList.remove('sacudir'); void raiz.offsetWidth; raiz.classList.add('sacudir');
        S.sel = null; dibujar(0); pintarControles(); pintarPie();
        return;
      }
      await aceptar(p, v);
    }
    async function aceptar(p, v) {
      S.ff = 0; S.hf = 0; S.revela = null; S.sel = null;
      mostrar(v.msg || p.okMsg || '✔ Correcto.', 'ok');
      const nuevo = v.despues || p.despues;
      if (nuevo) { S.modelo = nuevo; if (v.continua) p.antes = nuevo; S.anim = true; try { await dibujar(dur(480)); } finally { S.anim = false; } }   // si el paso sigue (varios toques), parte del modelo nuevo
      if (v.continua) { pintarCab(); dibujar(0); pintarControles(); pintarPie(); return; }
      S.pi++;
      if (S.pi >= S.plan.pasos.length) { terminarOp(); return; }
      pintarCab(); dibujar(0); pintarControles(); pintarPie();
    }
    function terminarOp() {
      S.modelo = S.plan.final; S.sel = null; S.revela = null;
      if (S.op + 1 < cfg.ops.length) {
        S.op++; S.pendiente = true; S.pi = S.plan.pasos.length;
        mostrar('✔ Operación completada. ' + F.resumen(S.modelo), 'ok');
        pintarCab(); dibujar(0); U.vaciar(ctrls); U.vaciar(pie);
        ctrls.appendChild(btn('Siguiente operación ▶', siguienteOp, ''));
      } else terminarTodo();
    }
    function siguienteOp() { if (!S.pendiente) return; S.pendiente = false; cargarOp(); }
    function terminarTodo() {
      S.fin = true; S.op = cfg.ops.length; S.pendiente = false; S.sel = null; S.revela = null;
      pintarCab(); dibujar(0); U.vaciar(ctrls); pintarPie();
      const res = { ok: true, fallos: S.fallos, pistas: S.pistas, ops: cfg.ops.length };
      mostrar('🎉 **¡Listo!** ' + F.resumen(S.modelo) + ' · ' + S.fallos + ' intento(s) fallido(s) · ' + S.pistas + ' pista(s).', 'ok');
      if (cfg.onFin) cfg.onFin(res); S.cbs.forEach(fn => { try { fn(res); } catch (e) { console.error(e); } });
    }

    /* ---------- pistas ---------- */
    function pista() {
      const p = paso(); if (!p || S.hf >= 3 || S.fin || S.anim) return;
      S.hf++; S.pistas++;
      const r = p.pista(S.hf) || { texto: '' };
      S.revela = r.revela || null; mostrar('💡 **Pista ' + S.hf + '/3:** ' + r.texto, 'info'); dibujar(0); pintarControles(); pintarPie();
    }

    /* ---------- ciclo de vida ---------- */
    function cargarOp() {
      while (S.op < cfg.ops.length) {
        const plan = F.plan(S.modelo, cfg.ops[S.op], cfg);
        if (plan.pasos.length) {
          S.plan = plan; S.pi = 0; S.ff = 0; S.hf = 0; S.sel = null; S.revela = null;
          mostrar('', ''); pintarCab(); dibujar(0); pintarControles(); pintarPie(); return;
        }
        S.modelo = plan.final; S.op++;   // operación sin decisiones que tomar
      }
      S.plan = S.plan || { pasos: [], final: S.modelo }; terminarTodo();
    }
    function reiniciar() {
      S.modelo = F.iniciar(cfg); S.op = 0; S.fallos = 0; S.pistas = 0; S.fin = false; S.pendiente = false; S.plan = null; S.pi = 0;
      cargarOp();
    }
    async function autoResolver() {
      let guard = 0;
      while (!S.fin && guard++ < 2000) {
        if (S.pendiente) { siguienteOp(); continue; }
        const p = paso(); if (!p) break;
        await intentar(p.correcta());
      }
      return S.fin;
    }

    cargarOp();

    return {
      el: raiz, escena,
      resultado: () => ({ fin: S.fin, fallos: S.fallos, pistas: S.pistas, ops: cfg.ops.length }),
      onCompletar(fn) { S.cbs.push(fn); if (S.fin) fn({ ok: true, fallos: S.fallos, pistas: S.pistas }); },
      lock(b) { S.bloq = !!b; raiz.classList.toggle('bloqueado', !!b); },
      forzarFin(res) { S.fin = true; S.pendiente = false; S.fallos = res.fallos || 0; S.pistas = res.pistas || 0; S.op = cfg.ops.length; if (S.plan && S.plan.final) S.modelo = S.plan.final; pintarCab(); dibujar(0); U.vaciar(ctrls); pintarPie(); mostrar('Ejercicio completado.', 'ok'); },
      reiniciar, destruir() { escena.destruir(); raiz.remove(); },
      /** ganchos para las pruebas automáticas */
      _t: { intentar, paso, estado: () => S, accionCorrecta: () => { const p = paso(); return p ? p.correcta() : null; }, accionIncorrecta: () => { const p = paso(); return p && p.incorrecta ? p.incorrecta() : null; }, autoResolver, avanzar: siguienteOp, pista, tap, modelo: () => S.modelo }
    };
  };

  /* ===================== utilidades compartidas por las familias ===================== */
  /** texto de una lista de valores: [1, 2, 3] */
  TG.lst = a => '[' + a.join(', ') + ']';
  /** copia del modelo vía JSON (los modelos son datos planos) */
  TG.clon = m => JSON.parse(JSON.stringify(m));
  /** gesto de botón */
  TG.boton = v => ({ tipo: 'boton', v });
  /** pista de 3 niveles: arr = [texto1, texto2, texto3]; rev = ids a resaltar desde el nivel `desde` */
  TG.pista3 = (arr, rev, desde) => k => ({ texto: arr[k - 1] || '', revela: (rev && k >= (desde || 2)) ? rev : null });

  /** la lista que ve el estudiante al terminar: texto + figura estática (se dibuja al hidratar la solución) */
  TG.solucionHtml = function (q) {
    const cfg = q.taller, F = TG.familias[cfg.familia];
    return '<p>Procedimiento correcto:</p>' + F.resolucionHtml(cfg) + '<div class="tg-sol" data-fam="' + U.esc(cfg.familia) + '" data-cfg="' + U.esc(JSON.stringify(cfg)) + '"></div>';
  };
  TG.hidratar = function (root) {
    U.$$('.tg-sol', root).forEach(d => {
      if (d.dataset.hid) return; d.dataset.hid = '1';
      try {
        const cfg = JSON.parse(d.dataset.cfg), F = TG.familias[cfg.familia]; let m = F.iniciar(cfg);
        cfg.ops.forEach(op => { m = F.plan(m, op, cfg).final; });
        const esc = new ET.Escena(d, { W: 560, H: 200, escala: 1, etiqueta: 'Estado final' });
        const r = F.dibujar(m, null, { fin: true, cfg }); esc.aplicar(r.items, { W: r.W, H: r.H, dur: 0 });
        d.classList.add('tg-sol-fig');
      } catch (e) { d.textContent = ''; }
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
