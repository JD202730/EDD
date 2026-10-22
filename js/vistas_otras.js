/* vistas_otras.js — Mis errores, laboratorio (árboles, recursión, consola) y ajustes */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, Tipos = ET.Tipos, Banco = ET.Banco, Arb = ET.Arb, Py = ET.Py, md = U.md;
  const V = ET.Vistas = ET.Vistas || {};

  /* ===================== Mis errores ===================== */
  V.errores = function (host) {
    const todos = M.errores(); const pend = todos.filter(e => !e.resuelto);
    host.appendChild(h('h1', { text: 'Mis errores' }));
    host.appendChild(h('p', { class: 'suave', text: 'Todo lo que has fallado en práctica y exámenes, con tu respuesta, la esperada y una explicación. Practica ejercicios similares hasta dominar el concepto.' }));
    const deb = M.debiles().slice(0, 6); const conf = M.confusiones().filter(c => c.n >= 1).slice(0, 6);
    const resumen = h('div', { class: 'grid g2' });
    const c1 = h('div', { class: 'card' }, h('h2', { text: 'Conceptos que más fallas' }));
    if (!deb.length) c1.appendChild(h('p', { class: 'suave', text: 'Aún no hay suficientes datos para priorizar.' }));
    else { deb.forEach(d => c1.appendChild(h('div', { class: 'fila-tema' }, h('div', null, h('strong', { text: Tm.conceptos[d.id].nombre }), h('div', { class: 'peq tenue', text: d.errores ? d.errores + ' error(es) abiertos' : 'Nivel ' + Tm.conceptos[d.id].nivel })), Vc.barra(d.mastery === null ? 0 : d.mastery), h('b', { text: d.mastery === null ? '—' : Math.round(d.mastery * 100) + ' %' })))); c1.appendChild(h('a', { class: 'btn peq espacio', href: '#/repaso' }, '🎯 Repaso inteligente')); }
    const c2 = h('div', { class: 'card' }, h('h2', { text: 'Confusiones detectadas' }));
    if (!conf.length) c2.appendChild(h('p', { class: 'suave', text: 'Si confundes casos de rotación AVL (p. ej. LR con RL) aparecerán aquí.' }));
    else { const f = h('div', { class: 'fila' }); conf.forEach(c => f.appendChild(h('span', { class: 'conf', text: c.dado + ' en vez de ' + c.correcta + ' × ' + c.n }))); c2.appendChild(f); c2.appendChild(h('a', { class: 'btn peq espacio', href: '#/repaso?foco=' + encodeURIComponent(['av_lr', 'av_rl', 'av_ll', 'av_rr', 'av_primer'].join(',')) }, 'Practicar rotaciones específicas')); }
    resumen.appendChild(c1); resumen.appendChild(c2); host.appendChild(resumen);

    let filtro = 'pend', nivelF = 0;
    const barra = h('div', { class: 'fila espacio', style: { justifyContent: 'space-between' } });
    const tabs = h('div', { class: 'tabs', style: { margin: 0 } });
    const lista = h('div');
    const selN = h('select', { 'aria-label': 'Filtrar por nivel' }, h('option', { value: '0', text: 'Todos los niveles' }), Tm.niveles.map(l => h('option', { value: String(l.id), text: 'Nivel ' + l.id + ' · ' + l.nombre })));
    selN.addEventListener('change', () => { nivelF = +selN.value; pintar(); });
    [['pend', 'Pendientes (' + pend.length + ')'], ['res', 'Resueltos (' + (todos.length - pend.length) + ')'], ['todos', 'Todos (' + todos.length + ')']].forEach(([k, t]) => { const b = h('button', { class: 'tab' + (k === filtro ? ' act' : ''), type: 'button', onclick: () => { filtro = k; U.$$('.tab', tabs).forEach(x => x.classList.remove('act')); b.classList.add('act'); pintar(); } }, t); tabs.appendChild(b); });
    barra.appendChild(tabs); barra.appendChild(h('div', { class: 'fila' }, selN, h('button', { class: 'btn fantasma peq', onclick: () => Vc.confirmar('Limpiar resueltos', 'Se eliminarán de la lista los errores ya resueltos.', 'Limpiar', () => { M.limpiarResueltos(); ET.App.render(); }) }, 'Limpiar resueltos')));
    host.appendChild(barra); host.appendChild(lista);

    function pintar() {
      U.vaciar(lista);
      let datos = M.errores().filter(e => (filtro === 'todos' || (filtro === 'pend') === !e.resuelto) && (!nivelF || e.nivel === nivelF));
      if (!datos.length) { lista.appendChild(Vc.vacio(filtro === 'pend' ? '🎉' : '🗂', filtro === 'pend' ? 'No tienes errores pendientes' : 'Nada por aquí', 'Cuando falles una pregunta aparecerá en esta lista con su explicación.')); return; }
      datos.forEach(e => {
        let q; try { q = Banco.instanciar(e.tplId, e.seed, e.opts); } catch (x) { return; }
        const mod = Tipos.mod(q);
        const card = h('div', { class: 'card err-card' });
        card.appendChild(h('div', { class: 'err-meta' }, Vc.nivelChip(e.nivel), h('span', { class: 'chip', text: e.tema || q.tema }), h('span', { class: 'chip', text: Tipos.formato(q) }), e.resuelto ? h('span', { class: 'chip ok', text: '✔ Resuelto' }) : h('span', { class: 'chip mal', text: 'Pendiente' }), h('span', { class: 'chip', text: 'Fallado ' + e.veces + ' vez/veces' })));
        card.appendChild(h('div', { class: 'peq tenue', text: 'Primer fallo: ' + U.fmtFecha(e.fecha) + ' · Último: ' + U.fmtFecha(e.ult) + ' · Intentos: ' + e.intentos.map(i => (i.ok ? '✔' : '✘') + (i.modo === 'examen' ? 'E' : '')).join(' ') }));
        const enun = h('div', { class: 'espacio' }); Tipos.cabecera(enun, q, {}); card.appendChild(enun);
        if (q.tipo === 'mixta') card.appendChild(h('ol', { type: 'a' }, q.partes.map(p => h('li', { html: U.mdInline(p.q.enunciado || '') }))));
        card.appendChild(h('details', { class: 'espacio' }, h('summary', { text: 'Tu respuesta (último intento)' }), h('div', { class: 'panel', html: e.resp || '<em>No se guardó la respuesta</em>' })));
        const sol = h('details', null, h('summary', { text: 'Respuesta esperada y explicación' }), (() => { const n = Vc.solucionNodo(q); return n; })());
        card.appendChild(sol);
        const concs = (e.conceptos || []).filter(c => Tm.conceptos[c]);
        card.appendChild(h('div', { class: 'peq suave', style: { marginTop: '8px' }, text: 'Concepto asociado: ' + concs.map(c => Tm.conceptos[c].nombre).join(' · ') }));
        card.appendChild(h('div', { class: 'acciones' },
          h('a', { class: 'btn peq', href: '#/reintento/' + encodeURIComponent(e.key) }, '↻ Reintentar este ejercicio'),
          h('a', { class: 'btn sec peq', href: '#/repaso?foco=' + encodeURIComponent(concs.join(',')) }, '🎯 Ejercicios similares'),
          h('button', { class: 'btn sec peq', onclick: () => Vc.teoriaModal(concs) }, '📖 Teoría'),
          h('span', { class: 'esp' }),
          h('button', { class: 'btn fantasma peq', onclick: () => { M.marcarResuelto(e.key, !e.resuelto); ET.App.render(); } }, e.resuelto ? 'Marcar pendiente' : 'Marcar resuelto'),
          h('button', { class: 'btn fantasma peq', onclick: () => { M.borrarError(e.key); ET.App.render(); } }, 'Eliminar')));
        lista.appendChild(card);
      });
    }
    pintar();
  };

  /* ===================== Laboratorio ===================== */
  V.lab = function (host, args) {
    const tab = args[0] || 'arboles';
    host.appendChild(h('h1', { text: 'Laboratorio' }));
    host.appendChild(h('div', { class: 'tabs' }, [['arboles', '🌳 Árboles BST/AVL'], ['taller', '✋ Taller interactivo'], ['recursion', '↻ Pila de recursión'], ['consola', '⌨ Consola Python']].map(([k, t]) => h('a', { class: 'tab' + (k === tab ? ' act' : ''), href: '#/lab/' + k, text: t }))));
    if (tab === 'recursion') return labRecursion(host);
    if (tab === 'consola') return labConsola(host);
    if (tab === 'taller') return labTaller(host);
    return labArboles(host);
  };

  /* ===================== Laboratorio: taller interactivo (mover nodos) ===================== */
  function labTaller(host) {
    host.appendChild(h('p', { class: 'suave', html: U.mdInline('Resuelve **tú** la operación moviendo los nodos: colocas el nodo nuevo, detectas el nodo desbalanceado, clasificas el desbalance y aplicas cada rotación arrastrando un hijo sobre su padre. En modo estricto, lo que esté mal **no se acepta** y el árbol no cambia.') }));
    const PRESETS = [
      ['Caso LL', 'avl', '30(20,)', '10'], ['Caso RR', 'avl', '10(,20)', '30'], ['Caso LR', 'avl', '30(10,)', '20'], ['Caso RL', 'avl', '10(,30)', '20'],
      ['Secuencia de clase', 'avl', '', '10, 20, 30, 40, 50, 25'], ['Eliminar con rotación', 'avl', '20(10,30(,40))', '-10'],
      ['BST: insertar', 'bst', '50(30(20,40),70(60,80))', '45, 65, 10'], ['BST: eliminar', 'bst', '50(30(20,40),70(60,80))', '-30, -50', 'pred']
    ];
    const selTipo = h('select', { 'aria-label': 'Tipo de árbol' }, h('option', { value: 'avl', text: 'AVL (con rotaciones)' }), h('option', { value: 'bst', text: 'BST (sin balanceo)' }));
    const selConv = h('select', { 'aria-label': 'Reemplazo al eliminar un nodo con dos hijos' }, h('option', { value: 'suc', text: 'Eliminar con dos hijos: sucesor inorden' }), h('option', { value: 'pred', text: 'Eliminar con dos hijos: predecesor inorden' }));
    const inArbol = h('input', { type: 'text', class: 'entrada-nota', placeholder: 'Árbol inicial, p. ej. 30(20,) — vacío = árbol vacío', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Árbol inicial' });
    const inOps = h('input', { type: 'text', class: 'entrada-nota', placeholder: 'Operaciones: 25, 10, -30 (el signo − elimina)', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Operaciones' });
    const zona = h('div', { style: { marginTop: '14px' } });
    const presets = h('div', { class: 'fila' }, PRESETS.map(p => h('button', { type: 'button', class: 'btn sec peq', onclick: () => { selTipo.value = p[1]; selConv.value = p[4] || (p[1] === 'bst' ? 'pred' : 'suc'); inArbol.value = p[2]; inOps.value = p[3]; comenzar(); } }, p[0])));
    function leerOps(txt) {
      const ops = [];
      for (const raw of txt.split(/[;,]+/).map(s => s.trim()).filter(Boolean)) {
        let m;
        if ((m = /^(?:\+|ins(?:ertar)?\s*)?(\d+)$/i.exec(raw))) ops.push({ t: 'ins', v: Number(m[1]) });
        else if ((m = /^(?:-|−|del(?:ete)?\s*|eliminar\s*|borrar\s*)(\d+)$/i.exec(raw))) ops.push({ t: 'del', v: Number(m[1]) });
        else if (/^reb(alancear)?$/i.test(raw)) ops.push({ t: 'reb' });
        else throw new Error('No entiendo «' + raw + '». Usa números para insertar (25), con signo − para eliminar (-30) o «reb».');
      }
      return ops;
    }
    function comenzar() {
      U.vaciar(zona);
      try {
        const tipo = selTipo.value, conv = selConv.value; let t = Arb.parse(inArbol.value);
        if (t && !Arb.esBST(t)) throw new Error('El árbol inicial no cumple la propiedad de BST.');
        if (t && Arb.tam(t) > 14) throw new Error('Usa un árbol inicial de hasta 14 nodos.');
        let ops = leerOps(inOps.value); const avisos = [];
        if (!ops.length) throw new Error('Escribe al menos una operación.');
        if (ops.length > 12) throw new Error('Usa hasta 12 operaciones por ejercicio.');
        if (tipo === 'avl' && t && Arb.desbalanceados(t).length) { ops = [{ t: 'reb' }].concat(ops); avisos.push('El árbol inicial no es AVL: primero hay que rebalancearlo (op. «reb»).'); }
        let sim = t; // validación de las operaciones
        for (const o of ops) {
          if (o.t === 'ins') { if (Arb.buscarNodo(sim, o.v)) throw new Error('El valor ' + o.v + ' ya está en el árbol (no se duplican).'); sim = tipo === 'avl' ? Arb.insAVL(sim, o.v).arbol : Arb.insBST(sim, o.v); }
          else if (o.t === 'del') { if (!Arb.buscarNodo(sim, o.v)) throw new Error('No puedes eliminar ' + o.v + ': no está en el árbol en ese momento.'); sim = tipo === 'avl' ? Arb.delAVL(sim, o.v, conv).arbol : Arb.delBST(sim, o.v, conv); if (!sim) throw new Error('El árbol quedaría vacío; usa un ejemplo con más nodos.'); }
          else sim = Arb.rebalancear(sim).arbol;
        }
        avisos.forEach(a => zona.appendChild(h('div', { class: 'panel', text: a })));
        zona.appendChild(h('div', { class: 'card flat', style: { marginTop: '8px' } }, h('div', { class: 'taller-lab' })));
        const w = ET.Taller.montar(U.$('.taller-lab', zona), { tipo, conv, arbol: t, ops, estricto: true });
        w.onCompletar(r => { zona.appendChild(h('div', { class: 'panel', html: U.mdInline('🎉 **Terminaste.** Intentos fallidos: ' + r.fallos + ' · pistas: ' + r.pistas + '. Cambia las operaciones o elige otro ejemplo para seguir practicando.') })); });
      } catch (e) { zona.appendChild(h('div', { class: 'panel', style: { borderColor: 'var(--mal)' }, text: '⚠ ' + e.message })); }
    }
    host.appendChild(h('div', { class: 'card flat' },
      h('div', { class: 'peq suave', style: { marginBottom: '6px' }, text: 'Ejemplos rápidos' }), presets,
      h('div', { class: 'fila', style: { marginTop: '12px' } }, selTipo, selConv),
      h('div', { style: { marginTop: '8px' } }, inArbol), h('div', { style: { marginTop: '8px' } }, inOps),
      h('div', { class: 'fila', style: { marginTop: '10px' } }, h('button', { type: 'button', class: 'btn', onclick: comenzar }, '✋ Comenzar'))));
    host.appendChild(zona);
  }

  function labArboles(host) {
    let modo = 'avl', arbol = null, ocupado = false, vivo = 0, mostrarF = true, anim = null;
    host.appendChild(h('p', { class: 'suave', text: 'Inserta, elimina y busca valores y mira cómo cambia el árbol. En AVL verás los factores de balance, el nodo desbalanceado y las rotaciones animadas.' }));
    const caja = h('div', { class: 'arbol-caja', style: { minHeight: '260px' } }); const draw = h('div', { class: 'arbol-draw' }); caja.appendChild(draw);
    const msg = h('div', { class: 'panel', style: { minHeight: '46px' }, 'aria-live': 'polite', text: 'Inserta un valor para empezar.' });
    const salida = h('div', { class: 'fila', style: { minHeight: '36px' } });
    const log = h('div', { class: 'log' });
    const val = h('input', { type: 'text', inputmode: 'numeric', placeholder: 'valor', 'aria-label': 'Valor', style: { width: '110px' } });
    const seq = h('input', { type: 'text', placeholder: 'p. ej. 10, 20, 30, 40, 50, 25', 'aria-label': 'Secuencia de valores', style: { flex: '1 1 220px' } });
    const selModo = h('select', { 'aria-label': 'Tipo de árbol' }, h('option', { value: 'avl', text: 'AVL (auto-balanceado)' }), h('option', { value: 'bst', text: 'BST (sin balanceo)' }));
    selModo.addEventListener('change', () => { modo = selModo.value; reiniciar(); });
    const chkF = h('input', { type: 'checkbox' }); chkF.checked = true; chkF.addEventListener('change', () => { mostrarF = chkF.checked; dibujar(); });
    const sel = o => ({ etiquetas: (mostrarF && modo === 'avl') ? 'factor' : null, compacto: false }, Object.assign({ etiquetas: (mostrarF && modo === 'avl') ? 'factor' : null }, o || {}));
    const dibujar = (cl) => Arb.dibujar(draw, arbol, sel({ clases: cl }));
    const logAdd = t => { log.insertBefore(h('div', { html: U.mdInline(t) }), log.firstChild); };
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const vel = () => Math.max(250, M.config().animVel || 650);
    function bloquear(b) { ocupado = b; U.$$('button.lab-b', host).forEach(x => x.disabled = b); }
    function reiniciar() { vivo++; arbol = null; bloquear(false); dibujar(); msg.textContent = 'Árbol vacío.'; U.vaciar(log); U.vaciar(salida); }
    function leer() { const t = val.value.trim().replace(',', '.'); if (!t) { Vc.toast('Escribe un valor.'); return null; } const n = Number(t); if (!isFinite(n)) { Vc.toast('Usa números (enteros).'); return null; } return n; }
    async function insertar(v, rapido) {
      const id = ++vivo; U.vaciar(salida);
      if (modo === 'bst') {
        if (Arb.buscarNodo(arbol, v)) { msg.textContent = 'El valor ' + v + ' ya existe: en el BST de clase no se duplica.'; logAdd('Insertar ' + v + ': ya existe.'); return; }
        const nuevo = Arb.insBST(arbol, v); const ruta = Arb.camino(arbol, v);
        if (!rapido) { for (let i = 0; i < ruta.length && id === vivo; i++) { Arb.dibujar(draw, arbol, { clases: { [String(ruta[i])]: 'ruta' } }); msg.textContent = 'Comparo ' + v + ' con ' + ruta[i] + ': ' + (v < ruta[i] ? 'menor → izquierda' : 'mayor → derecha'); await sleep(vel() * .8); } }
        arbol = nuevo; Arb.dibujar(draw, arbol, { clases: { [String(v)]: 'nuevo' } }); msg.textContent = 'Se colgó ' + v + ' como hoja. Altura del árbol: ' + Arb.altura(arbol) + '.'; logAdd('Insertar **' + v + '** → altura ' + Arb.altura(arbol));
        return;
      }
      const r = Arb.insAVL(arbol, v);
      if (r.duplicado) { msg.textContent = 'El valor ' + v + ' ya existe: no se duplica.'; logAdd('Insertar ' + v + ': ya existe.'); return; }
      const bad = Arb.desbalanceados(r.bst); const cl = { [String(v)]: 'nuevo' }; if (bad.length) cl[String(bad[0].v)] = 'desbalanceado';
      Arb.dibujar(draw, r.bst, sel({ clases: cl }));
      msg.innerHTML = U.mdInline('Se insertó **' + v + '** como en un BST. ' + (bad.length ? 'El nodo **' + bad[0].v + '** tiene factor ' + (Arb.factor(bad[0]) > 0 ? '+' : '') + Arb.factor(bad[0]) + ': caso **' + r.caso + ' (' + Arb.NOMBRE_CASO[r.caso] + ')** → ' + Arb.ROT_CASO[r.caso] + '.' : 'Todos los factores están en {−1, 0, +1}: no hace falta rotar.'));
      if (!rapido) await sleep(vel() * 1.6);
      for (const p of r.pasos) {
        if (id !== vivo) return;
        msg.innerHTML = U.mdInline('Rotación **' + p.rot + '** sobre **' + p.sobre + '**' + (p.parte ? ' (paso ' + p.parte + ' de 2 del caso ' + p.caso + ')' : ' (caso ' + p.caso + ')') + '. El inorden no cambia.');
        if (rapido) continue;
        await Arb.animarTransicion(draw, p.antes, p.despues, { dur: vel() * 1.3 }); await sleep(vel() * .5);
      }
      if (id !== vivo) return;
      arbol = r.arbol; dibujar(); logAdd('Insertar **' + v + '**' + (r.pasos.length ? ' → ' + r.pasos.map(p => 'rot. ' + p.rot + ' en ' + p.sobre).join(' + ') + ' (' + r.caso + ')' : ' → sin rotación') + ' · altura ' + Arb.altura(arbol));
      if (r.pasos.length) msg.innerHTML = U.mdInline('Árbol balanceado: `' + Arb.nota(arbol) + '` (altura ' + Arb.altura(arbol) + ').');
    }
    async function eliminar(v) {
      const id = ++vivo; U.vaciar(salida);
      if (!Arb.buscarNodo(arbol, v)) { msg.textContent = 'El valor ' + v + ' no está en el árbol.'; logAdd('Eliminar ' + v + ': no está.'); return; }
      const nd = Arb.buscarNodo(arbol, v); const hijos = (nd.l ? 1 : 0) + (nd.r ? 1 : 0);
      if (modo === 'bst') { arbol = Arb.delBST(arbol, v, 'pred'); dibujar(); msg.textContent = 'Eliminado ' + v + (hijos === 2 ? ' (2 hijos: se usó el predecesor inorden)' : hijos === 1 ? ' (1 hijo: lo reemplaza su hijo)' : ' (hoja)') + '.'; logAdd('Eliminar **' + v + '** (' + hijos + ' hijos)'); return; }
      const r = Arb.delAVL(arbol, v, 'suc'); const bad = Arb.desbalanceados(r.bst); const cl = {}; if (bad.length) cl[String(bad[0].v)] = 'desbalanceado';
      Arb.dibujar(draw, r.bst, sel({ clases: cl }));
      msg.innerHTML = U.mdInline('Se eliminó **' + v + '** como en un BST (' + (hijos === 2 ? '2 hijos: se copia el **sucesor inorden**' : hijos === 1 ? '1 hijo' : 'hoja') + '). ' + (bad.length ? 'Nodo desbalanceado: **' + bad[0].v + '**.' : 'No hay nodos desbalanceados.'));
      await sleep(vel() * 1.6);
      for (const p of r.pasos) { if (id !== vivo) return; msg.innerHTML = U.mdInline('Rotación **' + p.rot + '** sobre **' + p.sobre + '** (caso ' + p.caso + ', decidido por el factor del hijo).'); await Arb.animarTransicion(draw, p.antes, p.despues, { dur: vel() * 1.3 }); await sleep(vel() * .5); }
      if (id !== vivo) return; arbol = r.arbol; dibujar(); logAdd('Eliminar **' + v + '**' + (r.pasos.length ? ' → ' + r.pasos.length + ' rotación(es)' : ' → sin rotaciones') + ' · altura ' + Arb.altura(arbol));
    }
    async function buscar(v) {
      const id = ++vivo; U.vaciar(salida); const ruta = Arb.camino(arbol, v);
      for (let i = 0; i < ruta.length && id === vivo; i++) { Arb.dibujar(draw, arbol, sel({ clases: { [String(ruta[i])]: 'ruta' } })); msg.textContent = 'Comparo ' + v + ' con ' + ruta[i] + (ruta[i] === v ? ': ¡encontrado!' : (v < ruta[i] ? ': menor → izquierda' : ': mayor → derecha')); await sleep(vel() * .8); }
      const ok = !!Arb.buscarNodo(arbol, v); if (id === vivo) { Arb.dibujar(draw, arbol, sel({ clases: ok ? { [String(v)]: 'objetivo' } : {} })); msg.textContent = ok ? 'Encontrado en ' + ruta.length + ' comparaciones (O(h), h = ' + Arb.altura(arbol) + ').' : 'No está: ' + ruta.length + ' comparaciones hasta llegar a un hijo vacío.'; logAdd('Buscar **' + v + '** → ' + (ok ? 'sí' : 'no') + ' (' + ruta.length + ' comparaciones)'); }
    }
    async function ejecutar(fn) { if (ocupado) return; const v = leer(); if (v === null) return; bloquear(true); try { await fn(v); } finally { bloquear(false); val.value = ''; val.focus(); } }
    async function cargarSecuencia() {
      if (ocupado) return; const vs = seq.value.split(/[\s,;]+/).filter(Boolean).map(Number).filter(isFinite); if (!vs.length) { Vc.toast('Escribe números separados por comas.'); return; }
      bloquear(true); reiniciar(); bloquear(true);
      try { for (const v of vs) { await insertar(v, false); await sleep(vel() * .6); } } finally { bloquear(false); }
    }
    function recorrer(k) {
      if (!arbol) { Vc.toast('El árbol está vacío.'); return; }
      const nombre = { pre: 'preorden', ino: 'inorden', post: 'postorden', niv: 'por niveles' }[k]; const orden = { pre: Arb.pre, ino: Arb.ino, post: Arb.post, niv: Arb.niveles }[k](arbol);
      if (anim) anim.parar(); const ctrl = Arb.dibujar(draw, arbol, sel());
      msg.textContent = 'Recorrido ' + nombre + ':'; anim = Arb.animarRecorrido(ctrl, orden, { vel: vel(), salida });
    }
    const btn = (t, fn, cls) => h('button', { class: 'btn ' + (cls || 'sec') + ' peq lab-b', type: 'button', onclick: fn }, t);
    val.addEventListener('keydown', e => { if (e.key === 'Enter') ejecutar(v => insertar(v)); });
    const panelIzq = h('div', null,
      h('div', { class: 'card flat' }, h('div', { class: 'fila' }, selModo, val, btn('Insertar', () => ejecutar(v => insertar(v)), ''), btn('Eliminar', () => ejecutar(eliminar)), btn('Buscar', () => ejecutar(buscar)), btn('Vaciar', reiniciar, 'fantasma')),
        h('div', { class: 'fila', style: { marginTop: '8px' } }, seq, btn('Cargar secuencia', cargarSecuencia), h('label', { class: 'fila peq' }, chkF, 'Mostrar factores')),
        h('div', { class: 'fila', style: { marginTop: '8px' } }, h('span', { class: 'peq suave', text: 'Recorridos:' }), btn('Preorden', () => recorrer('pre')), btn('Inorden', () => recorrer('ino')), btn('Postorden', () => recorrer('post')), btn('Por niveles', () => recorrer('niv')))),
      h('div', { class: 'espacio' }, caja), h('div', { class: 'espacio' }, msg), salida);
    host.appendChild(h('div', { class: 'lab-grid' }, panelIzq, h('div', { class: 'card flat' }, h('h3', { text: 'Registro' }), log)));
    host.appendChild(h('div', { class: 'card espacio' }, h('h3', { text: 'Ideas para probar' }), h('ul', { html: md('- Inserta `10, 20, 30, 40, 50, 25` en AVL: es el ejemplo de clase (termina en `30(20(10,25),40(,50))`).\n- Inserta `1, 2, 3, 4, 5, 6, 7` en BST y luego en AVL y compara las alturas.\n- Elimina la raíz en cada uno y observa qué valor sube (predecesor en BST, sucesor en AVL).\n- Activa los factores y busca el nodo con ±2 antes de que ocurra la rotación.').replace(/^<ul>|<\/ul>$/g, '') })));
    reiniciar();
    return () => { vivo++; if (anim) anim.parar(); };
  }

  const PRESETS = {
    factorial: { code: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)', expr: 'factorial(4)' },
    fib: { code: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)', expr: 'fib(4)' },
    fib_memo: { code: 'def fib_memo(n, cache=None):\n    if cache is None:\n        cache = {}\n    if n < 2:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]', expr: 'fib_memo(5)' },
    potencia: { code: 'def potencia(x, n):\n    if n == 0:\n        return 1\n    m = potencia(x, n // 2)\n    if n % 2 == 0:\n        return m * m\n    return x * m * m', expr: 'potencia(2, 10)' },
    suma_lista: { code: 'def suma_lista(v):\n    if not v:\n        return 0\n    return v[0] + suma_lista(v[1:])', expr: 'suma_lista([3, 1, 4])' },
    hanoi: { code: 'def hanoi(n, a, b, c):\n    if n == 0:\n        return 0\n    return hanoi(n - 1, a, c, b) + 1 + hanoi(n - 1, c, b, a)', expr: 'hanoi(3, "A", "B", "C")' },
    sin_base: { code: 'def sin_base(n):\n    return sin_base(n - 1)', expr: 'sin_base(3)' }
  };
  function labRecursion(host) {
    host.appendChild(h('p', { class: 'suave', text: 'Escribe (o elige) una función recursiva y una llamada. Verás la pila de llamadas paso a paso y el árbol de llamadas. Se ejecuta con el intérprete del entrenador (máx. 800 eventos).' }));
    const sel = h('select', { 'aria-label': 'Ejemplo' }, Object.keys(PRESETS).map(k => h('option', { value: k, text: k })));
    const ed = ET.Editor.crear({ valor: PRESETS.factorial.code, minLineas: 8, maxLineas: 16 });
    const expr = h('input', { type: 'text', value: PRESETS.factorial.expr, 'aria-label': 'Llamada a trazar', style: { flex: '1 1 220px', fontFamily: 'var(--mono)' } });
    sel.addEventListener('change', () => { const p = PRESETS[sel.value]; ed.setValue(p.code); expr.value = p.expr; trazar(); });
    const res = h('div'); let eventos = [], paso = 0, timer = null;
    const resumen = h('div', { class: 'panel' }), pilaBox = h('div', { class: 'pila' }), logBox = h('div', { class: 'log-evt' }), estado = h('div', { class: 'peq suave', style: { minHeight: '22px', margin: '6px 0' } });
    const slider = h('input', { type: 'range', min: 0, max: 0, value: 0, class: 'rango', 'aria-label': 'Paso' });
    function pintarPaso() {
      slider.max = eventos.length; slider.value = paso; U.vaciar(pilaBox);
      const stack = []; let ult = null;
      for (let i = 0; i < paso; i++) { const e = eventos[i]; if (e.tipo === 'call') stack.push(e.nombre + '(' + e.args + ')'); else { stack.pop(); ult = e; } }
      stack.forEach((t, i) => pilaBox.appendChild(h('div', { class: 'marco' + (i === stack.length - 1 ? ' tope' : ''), text: t })));
      if (!stack.length) pilaBox.appendChild(h('div', { class: 'tenue peq', text: '(pila vacía)' }));
      const e = eventos[paso - 1];
      estado.textContent = paso === 0 ? 'Antes de empezar.' : (e.tipo === 'call' ? 'Se APILA ' + e.nombre + '(' + e.args + ')  — profundidad ' + e.depth : 'Se DESAPILA ' + e.nombre + ' y devuelve ' + e.valor);
      logBox.textContent = eventos.slice(0, paso).map((x, i) => '  '.repeat(x.depth - 1) + (x.tipo === 'call' ? x.nombre + '(' + x.args + ')' : '↳ devuelve ' + x.valor)).join('\n') || '(sin eventos)';
      logBox.scrollTop = logBox.scrollHeight;
    }
    function parar() { if (timer) { clearInterval(timer); timer = null; } }
    function trazar() {
      parar(); U.vaciar(res); const s = Py.sesion(ed.getValue(), { trace: true, maxSteps: 400000 });
      if (!s.ok) { res.appendChild(h('div', { class: 'feedback mal' }, Py.textoError(s.error))); return; }
      s.interp.trace.length = 0; const r = s.evaluar(expr.value); const tr = s.interp.trace.slice();
      if (!r.ok) { res.appendChild(h('div', { class: 'feedback mal' }, Py.textoError(r.error) + (tr.length ? ' (se muestran las llamadas hasta el error)' : ''))); }
      eventos = tr; paso = 0;
      const llam = tr.filter(e => e.tipo === 'call').length, prof = Math.max(0, ...tr.map(e => e.depth));
      U.vaciar(resumen); resumen.appendChild(h('div', { class: 'fila' }, h('span', { class: 'chip acento', text: 'Resultado: ' + (r.ok ? r.repr : '—') }), h('span', { class: 'chip', text: 'Llamadas: ' + llam + (tr.length >= 800 ? '+ (recortado)' : '') }), h('span', { class: 'chip', text: 'Profundidad máx. de pila: ' + prof }), r.ok && r.llamadas ? h('span', { class: 'chip', text: 'Conteo por función: ' + Object.entries(r.llamadas).map(([k, v]) => k + '=' + v).join(', ') }) : null));
      res.appendChild(resumen);
      const ctl = h('div', { class: 'fila' }, h('button', { class: 'btn sec peq', onclick: () => { parar(); paso = 0; pintarPaso(); } }, '⏮'), h('button', { class: 'btn sec peq', onclick: () => { parar(); paso = Math.max(0, paso - 1); pintarPaso(); } }, '◀'), h('button', { class: 'btn peq', onclick: () => { if (timer) { parar(); return; } if (paso >= eventos.length) paso = 0; timer = setInterval(() => { if (paso >= eventos.length) { parar(); return; } paso++; pintarPaso(); }, Math.max(150, (M.config().animVel || 650) * .6)); } }, '▶ / ⏸'), h('button', { class: 'btn sec peq', onclick: () => { parar(); paso = Math.min(eventos.length, paso + 1); pintarPaso(); } }, '▶|'), h('button', { class: 'btn sec peq', onclick: () => { parar(); paso = eventos.length; pintarPaso(); } }, '⏭'), slider);
      slider.addEventListener('input', () => { parar(); paso = +slider.value; pintarPaso(); });
      res.appendChild(h('div', { class: 'card flat espacio' }, ctl, estado, h('div', { class: 'grid g2' }, h('div', null, h('h4', { text: 'Pila de llamadas (tope arriba)' }), h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '160px' } }, pilaBox)), h('div', null, h('h4', { text: 'Registro de llamadas y retornos' }), logBox))));
      pintarPaso();
    }
    host.appendChild(h('div', { class: 'card' }, h('div', { class: 'fila' }, h('label', { class: 'fila' }, 'Ejemplo:', sel), expr, h('button', { class: 'btn', onclick: trazar }, 'Trazar')), h('div', { class: 'espacio' }, ed.el)));
    host.appendChild(res); trazar();
    return parar;
  }

  function labConsola(host) {
    host.appendChild(h('p', { class: 'suave', text: 'Escribe Python y ejecútalo con el intérprete del entrenador. Es un subconjunto de Python (no es CPython): sin generadores, `with`, módulos externos ni enteros mayores a 2⁵³.' }));
    const ed = ET.Editor.crear({ valor: 'def cuenta(n):\n    if n == 0:\n        print("listo")\n        return\n    print(n)\n    cuenta(n - 1)\n\ncuenta(3)\nprint(sorted([3, 1, 2], reverse=True))', minLineas: 12, maxLineas: 24, onEjecutar: () => correr() });
    const out = h('div', { class: 'consola-salida', 'aria-live': 'polite' }, h('em', { class: 'peq', text: 'La salida aparecerá aquí (Ctrl+Enter para ejecutar).' }));
    function correr() { const r = Py.ejecutar(ed.getValue(), { maxSteps: 2000000 }); let s = ''; if (r.stdout) s += '<pre class="consola-out">' + U.esc(r.stdout) + '</pre>'; if (r.error) s += '<pre class="consola-err">' + U.esc(Py.textoError(r.error)) + '</pre>'; out.innerHTML = s || '<em class="peq">(sin salida)</em>'; }
    host.appendChild(h('div', { class: 'card' }, ed.el, h('div', { class: 'acciones' }, h('button', { class: 'btn', onclick: correr }, '▶ Ejecutar (Ctrl+Enter)')), h('div', { class: 'consola', style: { marginTop: '10px' } }, out)));
  }

  /* ===================== Ajustes ===================== */
  V.ajustes = function (host) {
    const c = M.config();
    host.appendChild(h('h1', { text: 'Ajustes' }));
    const card = h('div', { class: 'card' });
    const umbral = h('input', { type: 'range', class: 'rango', min: 50, max: 100, step: 5, value: c.umbral, 'aria-label': 'Umbral de desbloqueo' }); const uL = h('b', { text: c.umbral + ' %' });
    umbral.addEventListener('input', () => { uL.textContent = umbral.value + ' %'; M.setConfig('umbral', +umbral.value); });
    card.appendChild(h('div', { class: 'cfg-sec' }, h('h3', { text: 'Umbral para desbloquear' }), h('div', { class: 'fila' }, umbral, uL), h('p', { class: 'peq suave', text: 'Dominio mínimo (promedio ponderado de las últimas 10 respuestas de la etapa, con al menos 5) para pasar a la siguiente etapa o nivel. Las pistas y los reintentos reducen el crédito de cada respuesta.' })));
    const libre = h('input', { type: 'checkbox' }); libre.checked = c.desbloqueoLibre; libre.addEventListener('change', () => M.setConfig('desbloqueoLibre', libre.checked));
    card.appendChild(h('label', { class: 'check' }, libre, h('span', null, h('strong', { text: 'Desbloqueo libre' }), h('div', { class: 'peq suave', text: 'Permite entrar a cualquier nivel y etapa sin cumplir el umbral (útil para repasar un tema suelto).' }))));
    const exc = h('input', { type: 'checkbox' }); exc.checked = c.ejecutarEnExamen; exc.addEventListener('change', () => M.setConfig('ejecutarEnExamen', exc.checked));
    card.appendChild(h('label', { class: 'check' }, exc, h('span', null, h('strong', { text: 'Consola de Python habilitada por defecto en los exámenes' }), h('div', { class: 'peq suave', text: 'Nunca muestra si pasas las pruebas; solo la salida y los errores de tu código.' }))));
    const tema = h('select', { 'aria-label': 'Tema' }, [['auto', 'Automático (según tu sistema)'], ['claro', 'Claro'], ['oscuro', 'Oscuro']].map(([v, t]) => h('option', { value: v, text: t }))); tema.value = c.tema;
    tema.addEventListener('change', () => { M.setConfig('tema', tema.value); document.documentElement.dataset.tema = tema.value; });
    const vel = h('input', { type: 'range', class: 'rango', min: 250, max: 1500, step: 50, value: c.animVel, 'aria-label': 'Duración de las animaciones' }); vel.addEventListener('input', () => M.setConfig('animVel', +vel.value));
    card.appendChild(h('div', { class: 'cfg-sec' }, h('h3', { text: 'Apariencia y animaciones' }), h('div', { class: 'fila' }, h('label', { class: 'fila' }, 'Tema:', tema)), h('div', { class: 'fila espacio' }, h('span', { text: 'Animaciones rápidas' }), vel, h('span', { text: 'lentas' }))));
    host.appendChild(card);
    const datos = h('div', { class: 'card espacio' }, h('h2', { text: 'Tus datos' }), h('p', { class: 'suave', text: 'El progreso se guarda en este navegador (localStorage)' + (U.Store.persistente ? '.' : ' — ¡ojo! el almacenamiento está bloqueado; el progreso se perderá al cerrar la pestaña.') + ' Puedes exportarlo para hacer copia de seguridad o pasarlo a otro dispositivo.' }));
    const file = h('input', { type: 'file', accept: 'application/json', class: 'oculto' });
    file.addEventListener('change', () => { const f = file.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { M.importar(r.result); Vc.toast('Progreso importado.'); location.hash = '#/panel'; setTimeout(() => location.reload(), 300); } catch (e) { Vc.toast('No se pudo importar: ' + e.message); } }; r.readAsText(f); });
    datos.appendChild(h('div', { class: 'acciones' }, h('button', { class: 'btn sec', onclick: () => U.descargar('progreso-entrenador-ed.json', M.exportar()) }, '⬇ Exportar progreso'), h('button', { class: 'btn sec', onclick: () => file.click() }, '⬆ Importar progreso'), file,
      h('button', { class: 'btn mal', onclick: () => Vc.confirmar('Reiniciar todo el progreso', 'Se borrarán el progreso, los errores y los exámenes. **No se puede deshacer.** (Puedes exportar antes una copia.)', 'Borrar todo', () => { M.reiniciar(); location.hash = '#/panel'; location.reload(); }) }, 'Reiniciar progreso')));
    host.appendChild(datos);
    host.appendChild(h('div', { class: 'card espacio' }, h('h2', { text: 'Acerca del contenido y sus límites' }), h('div', { html: md(
      '- **Fuente:** diapositivas del profesor Jheyston Serrano (UIS, 41336): S2-C1, S2-C2, S5-C2, S6-C1, S6-C2 y S7-C1 (diap. 1-20). Lo marcado como *complemento* no está en los PDF.\n' +
      '- **Python:** el código se ejecuta con un **intérprete propio** (subconjunto de Python escrito en JavaScript). No es CPython: no soporta generadores, `with`, clases con herencia múltiple compleja ni enteros mayores a 2⁵³; la recursión máxima efectiva puede ser menor que 1000. Las pruebas se validaron contra CPython real.\n' +
      '- **Preguntas abiertas:** se evalúan por criterios con palabras clave; una respuesta correcta redactada muy distinto puede no detectarse, por eso puedes marcar a mano los criterios que sí cubriste.\n' +
      '- **Rojo-negro:** el PDF de AVL disponible llega hasta la diapositiva 20; lo que se dice de rojo-negro es conocimiento general complementario.\n' +
      '- **Árboles:** se escriben como `valor(izq,der)`; los valores de un árbol son distintos entre sí.') })));
  };
})(typeof window !== 'undefined' ? window : globalThis);
