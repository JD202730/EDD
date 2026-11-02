/* taller_lineal.js — talleres interactivos de las estructuras LINEALES: lista enlazada (reasignar referencias en el orden correcto),
   pilas, colas, deques y cola circular (por qué extremo se entra y se sale) y arreglos (desplazar para insertar/eliminar y búsqueda binaria). */
(function (global) {
  'use strict';
  const ET = global.ET, TG = ET.TallerGen, Dib = ET.Dib;
  const cp = m => JSON.parse(JSON.stringify(m));
  const txtOps = (o, tabla) => (tabla[o.t] || (() => o.t))(o);

  /* ====================================================================== */
  /*  LISTA ENLAZADA                                                        */
  /* ====================================================================== */
  const LD = { NW: 72, NH: 38, STEP: 112, X0: 34, Y1: 92, Y2: 196 };
  const esNL = id => /^N\d+$/.test(id), idN = id => Number(id.slice(1));
  const nod = (m, id) => m.ns.find(n => n.id === id);
  const asig = (m, id, sig) => { const r = cp(m); nod(r, id).sig = sig; return r; };
  const cabez = (m, id) => { const r = cp(m); r.cab = id; return r; };
  function cadena(m) { const vis = new Set(), out = []; let c = m.cab; while (c !== null && !vis.has(c)) { const n = nod(m, c); if (!n) break; vis.add(c); out.push(n); c = n.sig; } return { cad: out, vis }; }
  const valoresL = m => cadena(m).cad.map(n => n.v);
  const txtLista = m => { const v = valoresL(m); return v.join(' → ') + (v.length ? ' → ' : '') + 'None'; };

  function iniciarL(cfg) { return { ns: (cfg.vals || []).map((v, i) => ({ id: i + 1, v, sig: i + 1 < cfg.vals.length ? i + 2 : null })), cab: (cfg.vals || []).length ? 1 : null, sigId: (cfg.vals || []).length + 1, pend: null }; }
  function flechaL(id, A, B) {
    const x1 = A.x + LD.NW * .81, y1 = A.y + LD.NH / 2;
    if (B.y === A.y) {
      const salto = Math.abs(B.x - A.x) / LD.STEP;
      if (B.x > A.x && salto < 1.3) return Dib.fl(id, x1, y1, B.x, B.y + LD.NH / 2, '');
      return Dib.fl(id, x1, A.y, B.x + LD.NW / 2, B.y, '', B.x > A.x ? -38 : 38);
    }
    return Dib.fl(id, x1, y1, B.x + LD.NW / 2, B.y < A.y ? B.y + LD.NH : B.y, '');
  }
  function dibujarL(m, p) {
    const { cad, vis } = cadena(m), sueltos = m.ns.filter(n => !vis.has(n.id)), pos = new Map(), cls = {};
    cad.forEach((n, i) => pos.set(n.id, { x: LD.X0 + i * LD.STEP, y: LD.Y1 }));
    sueltos.forEach((n, k) => pos.set(n.id, { x: LD.X0 + (k + .5) * LD.STEP, y: LD.Y2 }));
    if (p && p.vista) p.vista(cls, m);
    const it = [];
    m.ns.forEach(n => { const q = pos.get(n.id); it.push({ id: 'N' + n.id, k: 'nodoL', x: q.x, y: q.y, w: LD.NW, h: LD.NH, txt: n.v, cls: cls['N' + n.id] || (vis.has(n.id) ? '' : (m.pend === n.id ? 'nuevo' : 'viejo')), nulo: n.sig === null ? 'sig' : '', partes: 2 }); });
    m.ns.forEach(n => { if (n.sig !== null && pos.get(n.sig)) it.push(flechaL('F' + n.id, pos.get(n.id), pos.get(n.sig))); });
    it.push(Dib.caja('CAB', LD.X0, 22, LD.NW, 26, 'cabeza', 'var'));
    if (m.cab === null) it.push(Dib.etq('cabNone', LD.X0 + LD.NW + 10, 35, '= None', 'gris', 'start'));
    else { const B = pos.get(m.cab); if (B) it.push(Dib.fl('Fcab', LD.X0 + LD.NW / 2, 48, B.x + LD.NW / 2, B.y, '')); }
    it.push(Dib.caja('NONE', LD.X0 + cad.length * LD.STEP + 6, LD.Y1 + 5, 56, 28, 'None', 'zona'));
    const H = LD.Y2 + LD.NH + 60, W = Math.max(560, LD.X0 * 2 + (Math.max(cad.length, sueltos.length) + 1) * LD.STEP + 40);
    it.push(Dib.etq('estado', LD.X0, H - 14, 'lista: ' + txtLista(m), 'gris', 'start'));
    return { items: it, W, H };
  }
  /** esp = {k: 'sig'|'cab', de, a}: una asignación de referencia. o = {instr, desc, ok, trampas, h:[3 pistas], revela} */
  function pasoEnlace(m, esp, despues, o) {
    const parse = g => ({ k: g.de === 'CAB' ? 'cab' : 'sig', de: g.de === 'CAB' ? null : idN(g.de), a: g.a === 'NONE' ? null : idN(g.a) });
    const gesto = e => ({ tipo: 'par', de: e.k === 'cab' ? 'CAB' : 'N' + e.de, a: e.a === null ? 'NONE' : 'N' + e.a });
    const igual = (x, y) => x.k === y.k && x.de === y.de && x.a === y.a;
    const rev = [esp.k === 'cab' ? 'CAB' : 'N' + esp.de, esp.a === null ? 'NONE' : 'N' + esp.a];
    return {
      id: 'enlazar', antes: m, titulo: o.titulo || 'Reasignar una referencia', gestos: 'par',
      instr: o.instr + ' Arrastra **el nodo (o «cabeza») que cambia** sobre **aquel al que va a apuntar** (o sobre «None»); también puedes tocar uno y luego el otro.',
      ayudaFuente: 'Toca primero el nodo (o la caja «cabeza») **cuya referencia cambia**, y luego el nodo al que apuntará.',
      fuente: id => id === 'CAB' || esNL(id), destino: id => id === 'NONE' || esNL(id),
      vista(cls) { if (o.marcar) o.marcar.forEach(([id, c]) => { cls[id] = c; }); },
      acepta(g) {
        if (g.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra un nodo sobre otro para reasignar la referencia.' };
        const r = parse(g);
        if (igual(r, esp)) return { ok: true, despues, msg: o.ok };
        const t = (o.trampas || []).find(x => igual(x, r));
        if (t) return { ok: false, msg1: t.msg, msg2: 'Ahora toca: **' + o.desc + '**.' };
        return { ok: false, msg1: 'Esa no es la asignación que toca ahora.', msg2: 'Ahora toca: **' + o.desc + '**.' };
      },
      pista: TG.pista3(o.h, rev, 2),
      correcta: () => gesto(esp),
      incorrecta: () => {
        if (o.trampas && o.trampas.length) return gesto(o.trampas[0]);
        const otros = m.ns.map(n => n.id).filter(id => id !== esp.a && (esp.k === 'cab' || id !== esp.de));
        return gesto({ k: esp.k, de: esp.de, a: otros.length ? otros[0] : null });
      }
    };
  }
  function planIni(m0, v) {
    const nuevo = { id: m0.sigId, v, sig: null }, m1 = cp(m0); m1.ns.push(nuevo); m1.sigId++; m1.pend = nuevo.id;
    const pasos = []; let mm = m1;
    if (m0.cab !== null) {
      const hv = nod(m0, m0.cab).v, m2 = asig(mm, nuevo.id, m0.cab);
      pasos.push(pasoEnlace(mm, { k: 'sig', de: nuevo.id, a: m0.cab }, m2, { titulo: 'Enlazar el nuevo con la cabeza', desc: 'nuevo.siguiente = self.cabeza', instr: 'El nodo **' + v + '** ya está creado pero suelto. Primero hay que **conservar el resto de la lista**: `nuevo.siguiente = self.cabeza` (el nuevo apunta al que hoy es el primero, **' + hv + '**).',
        ok: '✔ **' + v + '** ahora apunta a **' + hv + '**: ya nada se pierde.', trampas: [{ k: 'cab', de: null, a: nuevo.id, msg: 'Si mueves la **cabeza** primero, el resto de la lista **se pierde**: nadie apuntaría al viejo primero (' + hv + ').' }],
        h: ['Insertar al inicio son **dos referencias**, y el orden importa: primero el nuevo apunta a la lista, después la cabeza apunta al nuevo.', 'Hay que enlazar **' + v + '** con **' + hv + '** (el primero actual).', 'Arrastra el nodo **' + v + '** sobre el nodo **' + hv + '**.'] }));
      mm = m2;
    }
    const m3 = cabez(mm, nuevo.id); m3.pend = null;
    pasos.push(pasoEnlace(mm, { k: 'cab', de: null, a: nuevo.id }, m3, { titulo: 'Mover la cabeza', desc: 'self.cabeza = nuevo', instr: 'Ahora la lista empieza en el nodo nuevo: `self.cabeza = nuevo`.', ok: '✔ La cabeza apunta a **' + v + '**: lista **' + txtLista(m3) + '**.',
      h: ['La cabeza es la referencia al primer nodo: ahora debe ser el nuevo.', 'Arrastra la caja **cabeza** sobre el nodo **' + v + '**.', 'Caja «cabeza» → nodo **' + v + '**.'] }));
    return { pasos, final: m3, texto: '<strong>Insertar ' + v + ' al inicio</strong> (O(1)): <code>nuevo.siguiente = cabeza</code> y luego <code>cabeza = nuevo</code> → <code>' + txtLista(m3) + '</code>.' };
  }
  function planTras(m0, op) {
    const { cad } = cadena(m0);
    let ant = op.t === 'fin' ? cad[cad.length - 1] : cad.find(n => n.v === op.x);
    if (op.t === 'fin' && !cad.length) return planIni(m0, op.v);
    if (!ant) throw new Error('No hay un nodo con el valor ' + op.x + ' en la lista en ese momento.');
    const v = op.v, nuevo = { id: m0.sigId, v, sig: null }, m1 = cp(m0); m1.ns.push(nuevo); m1.sigId++; m1.pend = nuevo.id;
    const pasos = []; let mm = m1; const sg = ant.sig === null ? null : nod(m0, ant.sig);
    if (sg) {
      const m2 = asig(mm, nuevo.id, sg.id);
      pasos.push(pasoEnlace(mm, { k: 'sig', de: nuevo.id, a: sg.id }, m2, { titulo: 'Enlazar el nuevo con el siguiente', desc: 'nuevo.siguiente = actual.siguiente', instr: 'Se inserta **' + v + '** después de **' + ant.v + '**. Primero el **nuevo apunta al que sigue**: `nuevo.siguiente = actual.siguiente` (**' + sg.v + '**), para no perder el resto de la lista.',
        ok: '✔ **' + v + '** apunta a **' + sg.v + '**: el resto de la lista está a salvo.', trampas: [{ k: 'sig', de: ant.id, a: nuevo.id, msg: 'Si haces `actual.siguiente = nuevo` primero, **se pierde el resto de la lista**: nadie apuntaría a **' + sg.v + '**.' }],
        h: ['Son dos pasos y **el orden importa**: primero el nuevo apunta al sucesor, luego el anterior apunta al nuevo.', 'El nuevo (**' + v + '**) debe apuntar a **' + sg.v + '** (el que hoy sigue a ' + ant.v + ').', 'Arrastra **' + v + '** sobre **' + sg.v + '**.'] }));
      mm = m2;
    }
    const m3 = asig(mm, ant.id, nuevo.id); m3.pend = null;
    pasos.push(pasoEnlace(mm, { k: 'sig', de: ant.id, a: nuevo.id }, m3, { titulo: 'Enlazar el anterior con el nuevo', desc: 'actual.siguiente = nuevo', instr: 'Ahora **' + ant.v + '** apunta al nuevo: `actual.siguiente = nuevo`.', ok: '✔ Insertado: lista **' + txtLista(m3) + '**.',
      h: ['El nodo anterior debe pasar a apuntar al nuevo.', 'Arrastra **' + ant.v + '** sobre **' + v + '**.', 'Nodo **' + ant.v + '** → nodo **' + v + '**.'] }));
    return { pasos, final: m3, texto: '<strong>Insertar ' + v + ' después de ' + ant.v + '</strong>' + (op.t === 'fin' ? ' (al final: recorrer hasta la cola, O(n))' : '') + ': ' + (sg ? '<code>nuevo.siguiente = actual.siguiente</code> y luego ' : '') + '<code>actual.siguiente = nuevo</code> → <code>' + txtLista(m3) + '</code>.' };
  }
  function planElim(m0, v) {
    const { cad } = cadena(m0), i = cad.findIndex(n => n.v === v);
    if (i < 0) throw new Error('No hay un nodo con el valor ' + v + ' en la lista en ese momento.');
    const x = cad[i], sg = x.sig === null ? null : nod(m0, x.sig);
    const sv = sg ? sg.v : 'None';
    let esp, m2, o;
    if (i === 0) {
      esp = { k: 'cab', de: null, a: sg ? sg.id : null }; m2 = cabez(m0, esp.a);
      o = { titulo: 'Mover la cabeza', desc: 'self.cabeza = actual.siguiente', instr: 'Se elimina **' + v + '**, que es la **cabeza**: `self.cabeza = actual.siguiente` (la lista pasa a empezar en **' + sv + '**).', ok: '✔ La cabeza ahora es **' + sv + '**; el nodo ' + v + ' quedó sin referencias (el recolector lo libera).',
        h: ['Si el nodo a eliminar es el primero, no hay «anterior»: lo que cambia es la **cabeza**.', 'La cabeza debe apuntar a **' + sv + '** (el siguiente de ' + v + ').', 'Arrastra la caja **cabeza** sobre ' + (sg ? 'el nodo **' + sv + '**' : '**None**') + '.'] };
    } else {
      const pr = cad[i - 1]; esp = { k: 'sig', de: pr.id, a: sg ? sg.id : null }; m2 = asig(m0, pr.id, esp.a);
      o = { titulo: 'Puentear el nodo', desc: 'anterior.siguiente = actual.siguiente', instr: 'Se elimina **' + v + '**: el **anterior** (**' + pr.v + '**) deja de apuntarle y apunta al **siguiente** de ' + v + ' (**' + sv + '**): `anterior.siguiente = actual.siguiente`.', ok: '✔ **' + pr.v + '** salta a **' + sv + '**: el nodo ' + v + ' quedó sin referencias (el recolector lo libera).',
        h: ['Eliminar es **puentear** el nodo: el anterior deja de apuntarle y apunta al siguiente.', 'El anterior es **' + pr.v + '** y debe apuntar a **' + sv + '**.', 'Arrastra **' + pr.v + '** sobre ' + (sg ? 'el nodo **' + sv + '**' : '**None**') + '.'] };
    }
    const fin = cp(m2); fin.ns = fin.ns.filter(n => n.id !== x.id);
    return { pasos: [pasoEnlace(m0, esp, m2, o)], final: fin, texto: '<strong>Eliminar ' + v + '</strong>: ' + (i === 0 ? '<code>cabeza = actual.siguiente</code>' : '<code>anterior.siguiente = actual.siguiente</code>') + ' (O(1) si ya se tiene el anterior; O(n) si hay que buscarlo) → <code>' + txtLista(fin) + '</code>.' };
  }
  TG.familias.lista = {
    etiqueta: 'Taller de la lista enlazada', iniciar: iniciarL,
    plan(m, op) { return op.t === 'ini' ? planIni(m, op.v) : (op.t === 'elim' ? planElim(m, op.v) : planTras(m, op)); },
    dibujar: dibujarL,
    nombreOp: o => txtOps(o, { ini: o => 'Insertar ' + o.v + ' al inicio', fin: o => 'Insertar ' + o.v + ' al final', tras: o => 'Insertar ' + o.v + ' tras ' + o.x, elim: o => 'Eliminar ' + o.v }),
    resumen: m => 'Lista: ' + txtLista(m),
    textoFinal: m => valoresL(m).join(','),
    resolucionHtml(cfg) { let m = iniciarL(cfg); const out = []; cfg.ops.forEach(o => { const p = TG.familias.lista.plan(m, o); out.push('<li>' + p.texto + '</li>'); m = p.final; }); return '<ol>' + out.join('') + '</ol>'; },
    /** «ini 5», «fin 9», «tras 20 7» (inserta 7 después del nodo 20), «-20» o «elim 20» */
    leerOps(txt) {
      const ops = [];
      for (const raw of txt.split(/[;,]+/).map(s => s.trim()).filter(Boolean)) {
        let mm;
        if ((mm = /^(?:ini|inicio|\+)\s*(-?\d+)$/i.exec(raw))) ops.push({ t: 'ini', v: Number(mm[1]) });
        else if ((mm = /^(?:fin|final)\s*(-?\d+)$/i.exec(raw))) ops.push({ t: 'fin', v: Number(mm[1]) });
        else if ((mm = /^(?:tras|despues|después)\s*(-?\d+)\s+(-?\d+)$/i.exec(raw))) ops.push({ t: 'tras', x: Number(mm[1]), v: Number(mm[2]) });
        else if ((mm = /^(?:-|elim(?:inar)?\s*)(-?\d+)$/i.exec(raw))) ops.push({ t: 'elim', v: Number(mm[1]) });
        else throw new Error('No entiendo «' + raw + '». Usa «ini 5» (al inicio), «fin 9» (al final), «tras 20 7» (7 después del nodo 20) o «-20» (eliminar el 20).');
      }
      return ops;
    }
  };

  /* ====================================================================== */
  /*  PILAS, COLAS, DEQUES Y COLA CIRCULAR                                  */
  /* ====================================================================== */
  const PC = { BW: 96, BH: 30, GV: 4, SH: 64, X0: 40 };
  const esItem = id => /^I\d+$/.test(id), idI = id => Number(id.slice(1));
  const esCelda = id => /^C\d+$/.test(id), idC = id => Number(id.slice(1));
  function iniciarPC(cfg) {
    const vals = cfg.vals || [];
    if (cfg.modo === 'circ') { const C = cfg.C, f = cfg.frente || 0, datos = new Array(C).fill(null); vals.forEach((v, i) => { datos[(f + i) % C] = { v }; }); return { modo: 'circ', C, datos, frente: f, tam: vals.length, pend: null, sal: [] }; }
    return { modo: cfg.modo, items: vals.map((v, i) => ({ id: i + 1, v })), sigId: vals.length + 1, pend: null, sal: [] };
  }
  function dibujarPC(m, p) {
    const cls = {}, it = []; if (p && p.vista) p.vista(cls, m);
    if (m.modo === 'circ') {
      const X0 = PC.X0, Y = 100, W = Math.max(560, X0 * 2 + m.C * 62 + 30);
      m.datos.forEach((d, i) => it.push(Dib.caja('C' + i, X0 + i * 62, Y, 54, 40, d ? d.v : '', cls['C' + i] || (d ? '' : 'vacio'), String(i))));
      if (m.tam > 0) { const q = m.frente; it.push(Dib.etq('lblF', X0 + q * 62 + 27, Y - 12, 'frente', 'gris')); }
      if (m.pend) it.push(Dib.caja('PEND', X0, 22, 54, 34, m.pend.v, 'nuevo', 'nuevo'));
      it.push(Dib.etq('vars', X0, Y + 78, 'frente = ' + m.frente + ' · tam = ' + m.tam + ' · C = ' + m.C, 'grande', 'start'));
      if (m.sal.length) it.push(Dib.etq('sal', X0, Y + 104, 'salieron: ' + m.sal.join(', '), 'ok', 'start'));
      return { items: it, W, H: Y + 130 };
    }
    const n = m.items.length;
    if (m.modo === 'pila') {
      const H = Math.max(200, 100 + (n + 1) * (PC.BH + PC.GV)), yB = H - 60, X = 130;
      m.items.forEach((e, i) => it.push(Dib.caja('I' + e.id, X, yB - (i + 1) * (PC.BH + PC.GV), PC.BW, PC.BH, e.v, cls['I' + e.id] || '')));
      const yTop = yB - (n + 1) * (PC.BH + PC.GV);
      if (p && p.zonas) { it.push(Dib.caja('ZTOPE', X, yTop, PC.BW, PC.BH, 'tope ↓', 'zona'), Dib.caja('ZFONDO', X, yB + 8, PC.BW, PC.BH, 'fondo ↑', 'zona')); }
      if (n) it.push(Dib.etq('lblT', X - 10, yB - n * (PC.BH + PC.GV) + PC.BH / 2, 'tope →', 'gris', 'end'));
      if (m.pend) it.push(Dib.caja('PEND', 24, yTop, 80, PC.BH, m.pend.v, 'nuevo', 'nuevo'));   // a la izquierda del tope: en el celular se ve sin desplazar la caja
      if (m.sal.length) it.push(Dib.etq('sal', 14, H - 8, 'salieron: ' + m.sal.join(', '), 'ok', 'start'));
      it.push(Dib.etq('estado', 14, 16, 'pila (LIFO)', 'gris', 'start'));
      return { items: it, W: 560, H };
    }
    const S = PC.SH, X0 = PC.X0, Y = 112, W = Math.max(560, X0 * 2 + (n + 3) * S);
    m.items.forEach((e, i) => it.push(Dib.caja('I' + e.id, X0 + (i + 1) * S, Y, 54, 36, e.v, cls['I' + e.id] || '')));
    if (p && p.zonas) it.push(Dib.caja('ZFRENTE', X0, Y, 54, 36, '', 'zona', 'frente'), Dib.caja('ZFINAL', X0 + (n + 1) * S, Y, 54, 36, '', 'zona', 'final'));
    if (n) it.push(Dib.etq('lblF', X0 + S + 27, Y - 12, 'frente', 'gris'), Dib.etq('lblR', X0 + n * S + 27, Y - 12, 'final', 'gris'));
    if (m.pend) it.push(Dib.caja('PEND', X0, 24, 54, 34, m.pend.v, 'nuevo', 'nuevo'));
    if (m.sal.length) it.push(Dib.etq('sal', X0 + 110, 40, 'salieron: ' + m.sal.join(', '), 'ok', 'start'));
    it.push(Dib.etq('estado', X0, Y + 78, m.modo === 'cola' ? 'cola (FIFO): se entra por el final y se sale por el frente' : 'deque: se entra y se sale por los dos extremos', 'gris', 'start'));
    return { items: it, W, H: Y + 100 };
  }
  const NOMBRE_MODO = { pila: 'pila', cola: 'cola', deque: 'deque', circ: 'cola circular' };
  const EXTREMO = { push: 'tope', pop: 'tope', enc: 'final', des: 'frente', addr: 'final', addl: 'frente', popr: 'final', popl: 'frente' };
  const COD = { push: 'push(x) → append', pop: 'pop()', enc: 'encolar(x) → append', des: 'desencolar() → popleft', addr: 'append(x)', addl: 'appendleft(x)', popr: 'pop()', popl: 'popleft()' };

  function pasoMeter(m, op, despues, zona) {
    const modo = m.modo, v = op.v, extremo = EXTREMO[op.t];
    const ZON = { tope: 'ZTOPE', final: 'ZFINAL', frente: 'ZFRENTE' }, esp = ZON[extremo];
    const lado = id => id === 'ZTOPE' ? 'tope' : (id === 'ZFONDO' ? 'fondo' : (id === 'ZFINAL' ? 'final' : 'frente'));
    return {
      id: 'meter', antes: m, titulo: 'Meter el elemento', gestos: 'par', zonas: true,
      instr: modo === 'pila' ? 'Operación **push(' + v + ')**: arrastra el **elemento nuevo (' + v + ')** a la zona punteada del extremo por donde **se agrega** en una pila (o tócalo y luego toca la zona).' : (modo === 'cola' ? 'Operación **encolar(' + v + ')**: arrastra el **elemento nuevo (' + v + ')** a la zona del extremo por donde **entra** en una cola (o tócalo y luego toca la zona).' : 'Operación **' + COD[op.t] + '** con ' + v + ': arrastra el **elemento nuevo** a la zona del **extremo** que corresponde a esa operación.'),
      ayudaFuente: 'En este paso solo se mueve el **elemento nuevo**.',
      fuente: id => id === 'PEND', destino: id => /^Z/.test(id),
      acepta(g) {
        if (g.tipo !== 'par' || g.de !== 'PEND') return { ok: false, blando: true, msg1: 'Arrastra el elemento nuevo a una zona punteada.' };
        if (!/^Z/.test(g.a)) return { ok: false, blando: true, msg1: 'Suéltalo en una zona punteada.' };
        if (g.a === esp) return { ok: true, despues, msg: '✔ **' + v + '** entra por el **' + extremo + '**. Costo **O(1)**.' };
        return { ok: false, msg1: modo === 'pila' ? 'En una pila se entra por el **tope**, no por el fondo.' : (modo === 'cola' ? 'En una cola se entra por el **final**, no por el frente.' : 'Esa operación agrega por el **' + extremo + '**, no por el ' + lado(g.a) + '.'),
          msg2: modo === 'pila' ? 'LIFO: el último en entrar es el primero en salir, así que se opera siempre por el mismo extremo.' : (modo === 'cola' ? 'FIFO: el primero en entrar es el primero en salir; los nuevos se forman al final de la fila.' : '`append` agrega al final y `appendleft` al frente.') };
      },
      pista: TG.pista3([modo === 'pila' ? 'Pila = LIFO: se agrega y se quita por el mismo extremo.' : (modo === 'cola' ? 'Cola = FIFO: entra por un extremo y sale por el opuesto.' : 'Una deque opera por los dos extremos; la operación dice cuál.'), 'El elemento entra por el **' + extremo + '**.', 'Suéltalo en la zona del **' + extremo + '**.'], ['PEND', esp], 2),
      correcta: () => ({ tipo: 'par', de: 'PEND', a: esp }),
      incorrecta: () => ({ tipo: 'par', de: 'PEND', a: modo === 'pila' ? 'ZFONDO' : (esp === 'ZFINAL' ? 'ZFRENTE' : 'ZFINAL') })
    };
  }
  function pasoSacar(m, op, despues) {
    const modo = m.modo, extremo = EXTREMO[op.t], n = m.items.length;
    const objetivo = extremo === 'frente' ? m.items[0] : m.items[n - 1];
    return {
      id: 'sacar', antes: m, titulo: 'Sacar un elemento', gestos: 'clic', clicable: esItem,
      instr: modo === 'pila' ? 'Operación **pop()**: **toca el elemento** que sale de la pila.' : (modo === 'cola' ? 'Operación **desencolar()**: **toca el elemento** que sale de la cola.' : 'Operación **' + COD[op.t] + '**: **toca el elemento** que sale (quita del ' + extremo + ').'),
      acepta(g) {
        if (g.tipo !== 'clic' || !esItem(g.id)) return { ok: false, blando: true, msg1: 'Toca el elemento que sale.' };
        if (idI(g.id) === objetivo.id) return { ok: true, despues, msg: '✔ Sale **' + objetivo.v + '** (el del **' + extremo + '**). Costo **O(1)**.' };
        return { ok: false, msg1: modo === 'pila' ? 'En una pila solo sale el **tope** (el último que entró).' : (modo === 'cola' ? 'En una cola sale el **primero que entró** (el del frente).' : 'Esa operación quita el elemento del **' + extremo + '**.'), msg2: modo === 'pila' ? 'LIFO: el tope es el de arriba (el más reciente).' : (modo === 'cola' ? 'FIFO: el frente es el más antiguo.' : '`popleft` quita del frente y `pop` del final.') };
      },
      pista: TG.pista3([modo === 'pila' ? 'LIFO: sale el último que entró.' : (modo === 'cola' ? 'FIFO: sale el primero que entró.' : 'La operación indica el extremo: ' + extremo + '.'), 'Sale el del **' + extremo + '**.', 'Toca el elemento **' + objetivo.v + '**.'], ['I' + objetivo.id], 2),
      correcta: () => ({ tipo: 'clic', id: 'I' + objetivo.id }),
      incorrecta: () => { const otro = m.items.find(e => e.id !== objetivo.id); return otro ? { tipo: 'clic', id: 'I' + otro.id } : null; }
    };
  }
  function planPC(m0, op) {
    const modo = m0.modo, quita = /^(pop|des|popl|popr)$/.test(op.t);
    if (modo === 'circ') return planCirc(m0, op);
    const n = m0.items.length;
    if (quita) {
      if (!n) throw new Error('La ' + NOMBRE_MODO[modo] + ' está vacía: no se puede sacar nada.');
      const ext = EXTREMO[op.t], x = ext === 'frente' ? m0.items[0] : m0.items[n - 1];
      const m1 = cp(m0); m1.items = m1.items.filter(e => e.id !== x.id); m1.sal.push(x.v);
      return { pasos: [pasoSacar(m0, op, m1)], final: m1, texto: '<strong>' + COD[op.t] + '</strong>: sale <strong>' + x.v + '</strong> (' + ext + ') → <code>' + TG.lst(m1.items.map(e => e.v)) + '</code>.' };
    }
    const nuevo = { id: m0.sigId, v: op.v }, m1 = cp(m0); m1.pend = nuevo; m1.sigId++;
    const m2 = cp(m1); m2.pend = null; if (EXTREMO[op.t] === 'frente') m2.items.unshift(nuevo); else m2.items.push(nuevo);
    return { pasos: [pasoMeter(m1, op, m2)], final: m2, texto: '<strong>' + COD[op.t].replace('(x)', '(' + op.v + ')') + '</strong>: entra ' + op.v + ' por el ' + EXTREMO[op.t] + ' → <code>' + TG.lst(m2.items.map(e => e.v)) + '</code>.' };
  }
  /* --- cola circular --- */
  function planCirc(m0, op) {
    const C = m0.C;
    if (op.t === 'enc') {
      if (m0.tam >= C) throw new Error('La cola circular está llena (tam = C = ' + C + ').');
      const idx = (m0.frente + m0.tam) % C, v = op.v, m1 = cp(m0); m1.pend = { v };
      const m2 = cp(m0); m2.datos[idx] = { v }; m2.tam++;
      const wrap = m0.frente + m0.tam >= C;
      const paso = {
        id: 'celda', antes: m1, titulo: 'Elegir la casilla', gestos: 'clic', clicable: esCelda,
        instr: 'Operación **encolar(' + v + ')**: ¿en qué casilla del arreglo va? `final = (frente + tam) % C`. **Toca esa casilla.**',
        acepta(g) {
          if (g.tipo !== 'clic' || !esCelda(g.id)) return { ok: false, blando: true, msg1: 'Toca una casilla del arreglo.' };
          const i = idC(g.id);
          if (i === idx) return { ok: true, despues: m2, msg: '✔ `(' + m0.frente + ' + ' + m0.tam + ') % ' + C + ' = ' + idx + '`: **' + v + '** va en la casilla **' + idx + '** y `tam` pasa a ' + m2.tam + '.' };
          return { ok: false, msg1: 'No es la casilla ' + i + '.', msg2: 'Calcula `(frente + tam) % C = (' + m0.frente + ' + ' + m0.tam + ') % ' + C + '`.' + (wrap ? ' Da la vuelta: pasa del final del arreglo al principio.' : '') };
        },
        pista: TG.pista3(['La posición de entrada es `(frente + tam) % C`: el módulo hace que dé la vuelta al llegar al final del arreglo.', '(' + m0.frente + ' + ' + m0.tam + ') % ' + C + ' = **' + idx + '**.', 'Toca la casilla **' + idx + '**.'], ['C' + idx], 2),
        correcta: () => ({ tipo: 'clic', id: 'C' + idx }), incorrecta: () => ({ tipo: 'clic', id: 'C' + ((idx + 1) % C) })
      };
      return { pasos: [paso], final: m2, texto: '<strong>encolar(' + v + ')</strong>: <code>final = (frente + tam) % C = (' + m0.frente + ' + ' + m0.tam + ') % ' + C + ' = ' + idx + '</code>; <code>tam = ' + m2.tam + '</code>.' };
    }
    if (m0.tam === 0) throw new Error('La cola circular está vacía: no se puede desencolar.');
    const f = m0.frente, x = m0.datos[f], m2 = cp(m0); m2.datos[f] = null; m2.frente = (f + 1) % C; m2.tam--; m2.sal.push(x.v);
    const paso = {
      id: 'celda', antes: m0, titulo: 'Elegir la casilla', gestos: 'clic', clicable: esCelda,
      instr: 'Operación **desencolar()**: sale el elemento del **frente** (`datos[frente]`). **Toca su casilla.**',
      acepta(g) {
        if (g.tipo !== 'clic' || !esCelda(g.id)) return { ok: false, blando: true, msg1: 'Toca una casilla del arreglo.' };
        const i = idC(g.id);
        if (i === f) return { ok: true, despues: m2, msg: '✔ Sale **' + x.v + '** de la casilla ' + f + '; `frente = (' + f + ' + 1) % ' + C + ' = ' + m2.frente + '` y `tam` pasa a ' + m2.tam + '. No se desplaza nada: **O(1)**.' };
        return { ok: false, msg1: 'Esa no es la casilla del frente.', msg2: 'El frente está en `frente = ' + f + '` (marcado en el arreglo): el primero en entrar es el primero en salir.' };
      },
      pista: TG.pista3(['FIFO: sale el que lleva más tiempo, el del frente.', 'El frente está en la casilla **' + f + '**.', 'Toca la casilla **' + f + '**.'], ['C' + f], 2),
      correcta: () => ({ tipo: 'clic', id: 'C' + f }), incorrecta: () => ({ tipo: 'clic', id: 'C' + ((f + 1) % C) })
    };
    return { pasos: [paso], final: m2, texto: '<strong>desencolar()</strong>: sale <strong>' + x.v + '</strong> de la casilla ' + f + '; <code>frente = (frente + 1) % C = ' + m2.frente + '</code>; <code>tam = ' + m2.tam + '</code>.' };
  }
  const valoresPC = m => m.modo === 'circ' ? Array.from({ length: m.tam }, (_, i) => m.datos[(m.frente + i) % m.C].v) : m.items.map(e => e.v);
  TG.familias.pc = {
    etiqueta: 'Taller de pilas y colas', iniciar: iniciarPC, plan: planPC, dibujar: dibujarPC,
    nombreOp: (o, cfg) => txtOps(o, { push: o => 'push(' + o.v + ')', pop: () => 'pop()', enc: o => 'encolar(' + o.v + ')', des: () => 'desencolar()', addr: o => 'append(' + o.v + ')', addl: o => 'appendleft(' + o.v + ')', popr: () => 'pop()', popl: () => 'popleft()' }),
    resumen: m => NOMBRE_MODO[m.modo].replace(/^./, c => c.toUpperCase()) + ': ' + TG.lst(valoresPC(m)) + (m.modo === 'circ' ? ' · frente = ' + m.frente + ', tam = ' + m.tam : '') + (m.sal.length ? ' · salieron: ' + m.sal.join(', ') : ''),
    textoFinal: m => TG.lst(valoresPC(m)) + (m.sal.length ? ' salieron ' + m.sal.join(',') : ''),
    resolucionHtml(cfg) { let m = iniciarPC(cfg); const out = []; cfg.ops.forEach(o => { const p = planPC(m, o); out.push('<li>' + p.texto + '</li>'); m = p.final; }); return '<ol>' + out.join('') + '</ol>'; },
    /** pila: «push 5, pop»; cola y cola circular: «enc 5, des»; deque: «addr 5, addl 6, popr, popl» (también se acepta un número solo = meter) */
    leerOps(txt, cfg) {
      const ops = [], modo = cfg.modo;
      for (const raw of txt.split(/[;,]+/).map(s => s.trim()).filter(Boolean)) {
        let mm;
        if ((mm = /^(push|enc|encolar|addr|addl|append|appendleft)\s*\(?\s*(-?\d+)\s*\)?$/i.exec(raw))) { const w = mm[1].toLowerCase(); ops.push({ t: ({ encolar: 'enc', append: 'addr', appendleft: 'addl' })[w] || w, v: Number(mm[2]) }); }
        else if ((mm = /^\+?\s*(-?\d+)$/.exec(raw))) ops.push({ t: modo === 'pila' ? 'push' : (modo === 'deque' ? 'addr' : 'enc'), v: Number(mm[1]) });
        else if (/^(pop|des|desencolar|popl|popleft|popr|-|x)$/i.test(raw)) {
          const w = raw.toLowerCase();
          ops.push({ t: (w === 'popl' || w === 'popleft') ? 'popl' : (w === 'popr' ? 'popr' : ((w === 'des' || w === 'desencolar') ? 'des' : (modo === 'pila' ? 'pop' : (modo === 'deque' ? 'popr' : 'des')))) });
        }
        else throw new Error('No entiendo «' + raw + '». ' + (modo === 'pila' ? 'Usa «push 5» y «pop».' : (modo === 'deque' ? 'Usa «addr 5», «addl 6», «popr» y «popl».' : 'Usa «enc 5» y «des».')));
      }
      const validas = { pila: ['push', 'pop'], cola: ['enc', 'des'], circ: ['enc', 'des'], deque: ['addr', 'addl', 'popr', 'popl'] }[modo];
      ops.forEach(o => { if (!validas.includes(o.t)) throw new Error('La operación «' + o.t + '» no existe en ' + (modo === 'circ' ? 'la cola circular' : 'esta estructura') + '.'); });
      return ops;
    }
  };

  /* ====================================================================== */
  /*  ARREGLOS: desplazar para insertar o eliminar, y búsqueda binaria      */
  /* ====================================================================== */
  const AD = { W: 52, H: 40, STEP: 58, X0: 36, Y: 92 };
  function iniciarA(cfg) { return { a: (cfg.vals || []).slice(), n: (cfg.vals || []).length, pend: null, lo: null, hi: null, mid: null, x: null }; }
  function dibujarA(m, p) {
    const cls = {}, it = []; if (p && p.vista) p.vista(cls, m);
    const cap = m.a.length, W = Math.max(560, AD.X0 * 2 + cap * AD.STEP + 20), busq = m.lo !== null;
    m.a.forEach((v, i) => {
      const fuera = busq && (i < m.lo || i > m.hi);
      it.push(Dib.caja('C' + i, AD.X0 + i * AD.STEP, AD.Y, AD.W, AD.H, v === null ? '' : v, cls['C' + i] || (v === null ? 'vacio' : (fuera ? 'viejo' : '')), String(i)));
    });
    if (busq) m.a.forEach((v, i) => { const t = (i === m.lo ? 'lo' : '') + (i === m.hi ? (i === m.lo ? '=' : '') + 'hi' : '') + (i === m.mid ? ' mid' : ''); if (t) it.push(Dib.etq('t' + i, AD.X0 + i * AD.STEP + AD.W / 2, AD.Y - 14, t.trim(), 'gris')); });
    if (m.pend !== null) it.push(Dib.caja('PEND', AD.X0, 22, AD.W, AD.H - 6, m.pend, 'nuevo', 'nuevo'));
    if (m.x !== null) it.push(Dib.etq('obj', AD.X0, 28, 'buscar x = ' + m.x, 'grande', 'start'));
    it.push(Dib.etq('estado', AD.X0, AD.Y + 78, 'arreglo de ' + m.n + ' elemento(s) · acceso por índice O(1)', 'gris', 'start'));
    return { items: it, W, H: AD.Y + 100 };
  }
  const arr = m => TG.lst(m.a.filter(v => v !== null));
  function pasoCopiar(m, j, k, despues, orden) {
    const v = m.a[j];
    return {
      id: 'copiar', antes: m, titulo: 'Desplazar un elemento', gestos: 'par',
      instr: orden === 'der' ? 'Para abrir un hueco se **corren a la derecha** los elementos, **empezando por el último**. Copia **A[' + j + '] = ' + v + '** a la casilla **' + k + '**: arrastra la casilla ' + j + ' sobre la casilla ' + k + ' (o tócalas en ese orden).' : 'Para cerrar el hueco se **corren a la izquierda** los elementos, **empezando por el primero después del eliminado**. Copia **A[' + j + '] = ' + v + '** a la casilla **' + k + '**: arrastra la casilla ' + j + ' sobre la casilla ' + k + '.',
      fuente: esCelda, destino: esCelda,
      acepta(g) {
        if (g.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra una casilla sobre otra.' };
        const a = idC(g.de), b = idC(g.a);
        if (a === j && b === k) return { ok: true, despues, msg: '✔ `A[' + k + '] = A[' + j + ']`: ahora las casillas ' + j + ' y ' + k + ' valen ' + v + ' (la ' + j + ' se sobrescribirá después).' };
        if (Math.abs(a - b) !== 1 || (orden === 'der' ? b < a : b > a)) return { ok: false, msg1: 'Cada elemento se corre **una** posición ' + (orden === 'der' ? 'a la **derecha**' : 'a la **izquierda**') + '.', msg2: 'Se copia `A[i]` sobre `A[i ' + (orden === 'der' ? '+' : '−') + ' 1]`.' };
        return { ok: false, msg1: 'Todavía no: ese orden **sobrescribe** el valor de la casilla ' + b + ' (' + m.a[b] + ') antes de moverlo, y se **pierde**.', msg2: orden === 'der' ? 'Se empieza por el **último** elemento (casilla ' + j + ') y se retrocede.' : 'Se empieza por el primero que sigue al eliminado (casilla ' + j + ') y se avanza.' };
      },
      pista: TG.pista3([orden === 'der' ? 'Si empiezas por el principio, cada copia pisa un valor que todavía no se movió: se empieza por el **final**.' : 'Si empiezas por el final, cada copia pisa un valor que todavía no se movió: se empieza por el **principio**.', 'Ahora toca copiar la casilla **' + j + '** sobre la **' + k + '**.', 'Arrastra la casilla **' + j + '** (' + v + ') sobre la casilla **' + k + '**.'], ['C' + j, 'C' + k], 2),
      correcta: () => ({ tipo: 'par', de: 'C' + j, a: 'C' + k }),
      incorrecta: () => ({ tipo: 'par', de: 'C' + k, a: 'C' + j })
    };
  }
  function planInsA(m0, op) {
    const n = m0.n, k = op.k === undefined ? n : op.k, v = op.v;
    if (k < 0 || k > n) throw new Error('La posición ' + k + ' no es válida: debe estar entre 0 y ' + n + '.');
    const m1 = cp(m0); m1.a.push(null); m1.pend = v; const pasos = []; let mm = m1;
    for (let j = n - 1; j >= k; j--) { const m2 = cp(mm); m2.a[j + 1] = m2.a[j]; pasos.push(pasoCopiar(mm, j, j + 1, m2, 'der')); mm = m2; }
    const m3 = cp(mm); m3.a[k] = v; m3.pend = null; m3.n = n + 1;
    pasos.push({
      id: 'colocar', antes: mm, titulo: 'Escribir el valor nuevo', gestos: 'par', fuente: id => id === 'PEND', destino: esCelda,
      instr: 'El hueco ya está en la casilla **' + k + '**. Arrastra el **valor nuevo (' + v + ')** a esa casilla: `A[' + k + '] = ' + v + '`.',
      ayudaFuente: 'Solo se mueve el **valor nuevo**.',
      acepta(g) {
        if (g.tipo !== 'par' || g.de !== 'PEND') return { ok: false, blando: true, msg1: 'Arrastra el valor nuevo a una casilla.' };
        if (!esCelda(g.a)) return { ok: false, blando: true, msg1: 'Suéltalo sobre una casilla.' };
        if (idC(g.a) === k) return { ok: true, despues: m3, msg: '✔ `A[' + k + '] = ' + v + '`: arreglo **' + arr(m3) + '**. Costo **O(n)** por los desplazamientos (' + (n - k) + ' en este caso).' };
        return { ok: false, msg1: 'Esa no es la posición pedida.', msg2: 'El valor va en la casilla **' + k + '**, la que quedó libre al desplazar.' };
      },
      pista: TG.pista3(['El valor nuevo va en la casilla que quedó libre tras desplazar.', 'Es la casilla **' + k + '**.', 'Arrastra **' + v + '** sobre la casilla **' + k + '**.'], ['PEND', 'C' + k], 2),
      correcta: () => ({ tipo: 'par', de: 'PEND', a: 'C' + k }), incorrecta: () => ({ tipo: 'par', de: 'PEND', a: 'C' + (k === 0 ? 1 : 0) })
    });
    return { pasos, final: m3, texto: '<strong>Insertar ' + v + ' en la posición ' + k + '</strong>: se desplazan ' + (n - k) + ' elemento(s) a la derecha (del último al primero) y se escribe el valor → <code>' + arr(m3) + '</code>.' };
  }
  function planDelA(m0, op) {
    const n = m0.n, k = op.k, x = m0.a[k];
    if (k === undefined || k < 0 || k >= n) throw new Error('La posición ' + k + ' no es válida: debe estar entre 0 y ' + (n - 1) + '.');
    const pasos = []; let mm = m0;
    for (let j = k + 1; j < n; j++) { const m2 = cp(mm); m2.a[j - 1] = m2.a[j]; pasos.push(pasoCopiar(mm, j, j - 1, m2, 'izq')); mm = m2; }
    const m3 = cp(mm); m3.a[n - 1] = null; m3.n = n - 1;
    pasos.push({
      id: 'liberar', antes: mm, titulo: 'Reducir el tamaño', gestos: 'clic', clicable: esCelda,
      instr: 'Los elementos ya están corridos: la **última casilla (' + (n - 1) + ')** quedó repetida y sobra. **Tócala** para liberarla (`tam = tam − 1`).',
      acepta(g) {
        if (g.tipo !== 'clic' || !esCelda(g.id)) return { ok: false, blando: true, msg1: 'Toca una casilla.' };
        if (idC(g.id) === n - 1) return { ok: true, despues: m3, msg: '✔ Eliminado el ' + x + ': arreglo **' + arr(m3) + '**. Costo **O(n)** por los desplazamientos (' + (n - 1 - k) + ' en este caso).' };
        return { ok: false, msg1: 'No es esa casilla.', msg2: 'La que sobra es la **última** (' + (n - 1) + '): el arreglo se acorta por el final.' };
      },
      pista: TG.pista3(['Tras correr todo a la izquierda, ¿qué casilla quedó repetida?', 'La última, la **' + (n - 1) + '**.', 'Toca la casilla **' + (n - 1) + '**.'], ['C' + (n - 1)], 2),
      correcta: () => ({ tipo: 'clic', id: 'C' + (n - 1) }), incorrecta: () => ({ tipo: 'clic', id: 'C' + (n - 1 === 0 ? 1 : 0) })
    });
    return { pasos, final: m3, texto: '<strong>Eliminar la posición ' + k + ' (' + x + ')</strong>: se desplazan ' + (n - 1 - k) + ' elemento(s) a la izquierda (del primero al último) y se reduce el tamaño → <code>' + arr(m3) + '</code>.' };
  }
  function planBin(m0, op) {
    const a = m0.a, n = m0.n, x = op.x;
    for (let i = 1; i < n; i++) if (a[i] < a[i - 1]) throw new Error('La búsqueda binaria necesita un arreglo **ordenado**.');
    let lo = 0, hi = n - 1; const pasos = []; let mm = Object.assign(cp(m0), { lo, hi, mid: null, x }); let hallado = -1, vuelta = 0;
    while (lo <= hi) {
      vuelta++; const mid = (lo + hi) >> 1, antes = mm, conMid = Object.assign(cp(mm), { mid });
      pasos.push({
        id: 'mitad', antes: mm, titulo: 'Elegir la mitad', gestos: 'clic', clicable: esCelda,
        instr: 'Vuelta **' + vuelta + '**: busca **x = ' + x + '** entre las posiciones **lo = ' + lo + '** y **hi = ' + hi + '**. ¿Qué casilla se compara? `mid = (lo + hi) // 2`. **Tócala.**',
        acepta(g) {
          if (g.tipo !== 'clic' || !esCelda(g.id)) return { ok: false, blando: true, msg1: 'Toca una casilla.' };
          const i = idC(g.id);
          if (i === mid) return { ok: true, despues: conMid, msg: '✔ `mid = (' + lo + ' + ' + hi + ') // 2 = ' + mid + '`: se compara **A[' + mid + '] = ' + a[mid] + '** con x = ' + x + '.' };
          return { ok: false, msg1: 'No es la casilla del medio.', msg2: 'Calcula `(lo + hi) // 2 = (' + lo + ' + ' + hi + ') // 2`.' };
        },
        pista: TG.pista3(['La casilla del medio del rango [lo, hi] es `(lo + hi) // 2` (división entera).', '(' + lo + ' + ' + hi + ') // 2 = **' + mid + '**.', 'Toca la casilla **' + mid + '**.'], ['C' + mid], 2),
        correcta: () => ({ tipo: 'clic', id: 'C' + mid }), incorrecta: () => { const o = a.findIndex((_, i) => i !== mid); return o < 0 ? null : { tipo: 'clic', id: 'C' + (mid === lo && hi !== lo ? hi : (o)) }; }
      });
      const v = a[mid], esp = v === x ? 'igual' : (v < x ? 'der' : 'izq');
      const sig = esp === 'igual' ? Object.assign(cp(conMid), { fin: true }) : (esp === 'der' ? Object.assign(cp(conMid), { lo: mid + 1, mid: null }) : Object.assign(cp(conMid), { hi: mid - 1, mid: null }));
      pasos.push({
        id: 'decidir', antes: conMid, titulo: 'Decidir', gestos: 'ninguno',
        botones: [{ t: '= ¡Encontrado!', v: 'igual' }, { t: '◀ Está a la izquierda (hi = mid − 1)', v: 'izq' }, { t: 'Está a la derecha (lo = mid + 1) ▶', v: 'der' }],
        instr: 'Compara **A[' + mid + '] = ' + v + '** con **x = ' + x + '**: ¿es igual, mayor o menor? Con el arreglo **ordenado**, eso dice hacia dónde seguir.',
        acepta(g) {
          if (g.tipo !== 'boton') return { ok: false, blando: true, msg1: 'Elige con los botones.' };
          if (g.v === esp) return { ok: true, despues: sig, msg: esp === 'igual' ? '✔ **A[' + mid + '] = ' + v + ' = x**: ¡encontrado en la posición ' + mid + '!' : '✔ ' + v + (esp === 'der' ? ' < ' : ' > ') + x + ': x solo puede estar a la ' + (esp === 'der' ? 'derecha → `lo = ' + (mid + 1) + '`' : 'izquierda → `hi = ' + (mid - 1) + '`') + '. Se descarta la mitad contraria.' };
          return { ok: false, msg1: g.v === 'igual' ? 'A[' + mid + '] = ' + v + ' no es igual a ' + x + '.' : (v === x ? 'Son iguales: ya se encontró.' : 'Revisa la comparación: ' + v + (v < x ? ' < ' : ' > ') + x + '.'), msg2: v < x ? 'Si A[mid] < x, todo lo que está a la izquierda de mid también es menor (está ordenado): x solo puede estar a la derecha.' : 'Si A[mid] > x, todo lo que está a la derecha de mid también es mayor: x solo puede estar a la izquierda.' };
        },
        pista: TG.pista3(['Compara el valor del medio con x.', v + ' ' + (v === x ? '=' : (v < x ? '<' : '>')) + ' ' + x + '.', esp === 'igual' ? 'Pulsa «¡Encontrado!».' : (esp === 'der' ? 'Pulsa «Está a la derecha».' : 'Pulsa «Está a la izquierda».')], ['C' + mid], 2),
        correcta: () => TG.boton(esp), incorrecta: () => TG.boton(esp === 'igual' ? 'izq' : (esp === 'izq' ? 'der' : 'izq'))
      });
      mm = sig;
      if (esp === 'igual') { hallado = mid; break; }
      if (esp === 'der') lo = mid + 1; else hi = mid - 1;
    }
    let final = Object.assign(cp(mm), { mid: hallado >= 0 ? hallado : null });
    if (hallado < 0) {
      const lim = Object.assign(cp(mm), { lo, hi });
      pasos.push({
        id: 'fin', antes: lim, titulo: 'Terminar', gestos: 'ninguno', botones: [{ t: '= ¡Encontrado!', v: 'igual' }, { t: '✘ x no está en el arreglo', v: 'no' }],
        instr: 'Ahora **lo = ' + lo + '** y **hi = ' + hi + '**: el rango quedó vacío (lo > hi). ¿Qué se concluye?',
        acepta(g) { if (g.tipo !== 'boton') return { ok: false, blando: true, msg1: 'Elige con los botones.' }; return g.v === 'no' ? { ok: true, msg: '✔ `lo > hi`: no queda ninguna casilla por mirar, así que **' + x + ' no está** en el arreglo.' } : { ok: false, msg1: 'No se encontró en ninguna comparación.', msg2: 'Cuando lo > hi el rango está vacío: x no está.' }; },
        pista: TG.pista3(['Si lo > hi no queda nada por revisar.', 'Ninguna comparación dio igualdad.', 'Pulsa «x no está en el arreglo».']),
        correcta: () => TG.boton('no'), incorrecta: () => TG.boton('igual')
      });
      final = Object.assign(cp(lim), { mid: null });
    }
    return { pasos, final, texto: '<strong>Búsqueda binaria de ' + x + '</strong>: ' + vuelta + ' comparación(es) (≤ log₂ n + 1) → ' + (hallado >= 0 ? 'está en la posición ' + hallado + '.' : 'no está.') };
  }
  TG.familias.arr = {
    etiqueta: 'Taller de arreglos', iniciar: iniciarA,
    plan(m, op) { const limpio = Object.assign(cp(m), { lo: null, hi: null, mid: null, x: null }); return op.t === 'ins' ? planInsA(limpio, op) : (op.t === 'del' ? planDelA(limpio, op) : planBin(limpio, op)); },
    dibujar: dibujarA,
    nombreOp: o => txtOps(o, { ins: o => 'Insertar ' + o.v + ' en la posición ' + (o.k === undefined ? 'final' : o.k), del: o => 'Eliminar la posición ' + o.k, bin: o => 'Buscar ' + o.x + ' (búsqueda binaria)' }),
    resumen: m => 'Arreglo: ' + arr(m),
    textoFinal: m => m.a.filter(v => v !== null).join(','),
    resolucionHtml(cfg) { let m = iniciarA(cfg); const out = []; cfg.ops.forEach(o => { const p = TG.familias.arr.plan(m, o); out.push('<li>' + p.texto + '</li>'); m = p.final; m = Object.assign(cp(m), { lo: null, hi: null, mid: null, x: null }); }); return '<ol>' + out.join('') + '</ol>'; },
    /** «ins 7 2» = insertar 7 en la posición 2; «ins 7» = al final; «del 3» = eliminar la posición 3; «bin 40» = buscar 40 */
    leerOps(txt) {
      const ops = [];
      for (const raw of txt.split(/[;,]+/).map(s => s.trim()).filter(Boolean)) {
        let mm;
        if ((mm = /^ins(?:ertar)?\s*(-?\d+)(?:\s+(?:en\s*)?(\d+))?$/i.exec(raw))) ops.push(mm[2] === undefined ? { t: 'ins', v: Number(mm[1]) } : { t: 'ins', v: Number(mm[1]), k: Number(mm[2]) });
        else if ((mm = /^(?:del|eliminar|borrar)\s*(\d+)$/i.exec(raw))) ops.push({ t: 'del', k: Number(mm[1]) });
        else if ((mm = /^(?:bin|buscar)\s*(-?\d+)$/i.exec(raw))) ops.push({ t: 'bin', x: Number(mm[1]) });
        else throw new Error('No entiendo «' + raw + '». Usa «ins 7 2» (insertar 7 en la posición 2), «ins 7» (al final), «del 3» (eliminar la posición 3) o «bin 40» (búsqueda binaria de 40).');
      }
      return ops;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
