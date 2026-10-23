/* traza.js — ejecución REAL con registro paso a paso para sincronizar el código con el árbol.
   El código del estudiante se ejecuta con el intérprete de Python del entrenador; los ganchos del intérprete registran:
     · cada sentencia ejecutada (línea, marco de pila, variables, salida impresa hasta ese momento),
     · la creación de objetos de clases propias y cada asignación de atributo (p. ej. nodo.izq = otro),
     · llamadas y retornos de funciones.
   De ese registro (no de una animación predefinida) se reconstruye el estado del árbol en cualquier paso, hacia adelante y hacia atrás.
   Límite: se visualizan objetos de clases propias con atributos de hijo izquierdo/derecho; árboles hechos con listas, tuplas o
   diccionarios no se dibujan (se informa en la interfaz). */
(function (global) {
  'use strict';
  const ET = global.ET, C = ET.PyCore, Py = ET.Py, Arb = ET.Arb;
  const Traza = ET.Traza = {};

  /* nombres de atributos que se reconocen por defecto (se pueden cambiar en la interfaz) */
  Traza.ATR = {
    izq: ['izq', 'izquierdo', 'izquierda', 'left', 'l', 'hijo_izq', 'hijo_izquierdo', 'hi'],
    der: ['der', 'derecho', 'derecha', 'right', 'r', 'hijo_der', 'hijo_derecho', 'hd'],
    val: ['valor', 'v', 'val', 'value', 'dato', 'key', 'clave', 'data', 'x', 'k'],
    alt: ['altura', 'h', 'height', 'alt'],
    col: ['color', 'col']
  };
  const MAX_PASOS = 60000, MAX_EVENTOS = 600000;

  /* ===================== registro ===================== */
  Traza.ejecutar = function (codigo, opts) {
    opts = opts || {};
    const maxPasos = opts.maxPasos || MAX_PASOS;
    const it = new C.Interp({ maxSteps: opts.maxSteps || 6000000, maxDepth: opts.maxDepth || 900, maxMs: opts.maxMs || 9000 });
    const T = { codigo, lineas: String(codigo).replace(/\r/g, '').split('\n'), pasos: [], eventos: [], marcos: { 0: { fn: '(programa)', args: [], padre: -1, lc: 0, depth: 0 } }, salida: '', error: null, truncada: false, nNodos: 0, pasosDeMarco: {}, hist: new Map() };
    const ids = new Map(); let nid = 0;
    const BASE_EXC = () => it.builtins.get('BaseException');
    const esExc = o => { try { return it.isSub(o.cls, BASE_EXC()); } catch (e) { return false; } };
    const idDe = o => ids.get(o);
    const topFid = () => it.stack.length ? it.stack[it.stack.length - 1].fid : 0;

    const valTxt = o => {
      for (const a of Traza.ATR.val) if (o.attrs.has(a)) { const x = o.attrs.get(a); if (!(x instanceof C.PyObj)) return it.repr(x); }
      return '';
    };
    const etiqueta = o => o.cls.name + (valTxt(o) !== '' ? '(' + valTxt(o) + ')' : '#' + idDe(o));
    function preview(v, prof) {
      if (v instanceof C.PyObj) return esExc(v) ? it.repr(v) : etiqueta(v);
      if (Array.isArray(v) || v instanceof C.PyTuple || v instanceof C.PyDeque) {
        const arr = Array.isArray(v) ? v : v.a; const ab = v instanceof C.PyTuple ? ['(', ')'] : (v instanceof C.PyDeque ? ['deque([', '])'] : ['[', ']']);
        if (prof > 1) return ab[0] + '…' + ab[1];
        const parts = arr.slice(0, 8).map(x => preview(x, (prof || 0) + 1));
        return ab[0] + parts.join(', ') + (arr.length > 8 ? ', …(+' + (arr.length - 8) + ')' : '') + ab[1];
      }
      if (v instanceof C.PyDict) { const e = [...v.m.values()].slice(0, 6).map(([k, x]) => preview(k, 2) + ': ' + preview(x, 2)); return '{' + e.join(', ') + (v.m.size > 6 ? ', …' : '') + '}'; }
      if (v instanceof C.PySet) { const e = [...v.m.values()].slice(0, 8).map(x => preview(x, 2)); return '{' + e.join(', ') + (v.m.size > 8 ? ', …' : '') + '}'; }
      let s; try { s = it.repr(v); } catch (e) { s = '?'; }
      return s.length > 60 ? s.slice(0, 57) + '…' : s;
    }
    function ids_de(v, acc, prof) {
      if (v instanceof C.PyObj) { if (ids.has(v)) acc.push(idDe(v)); return acc; }
      if ((Array.isArray(v) || v instanceof C.PyTuple || v instanceof C.PyDeque) && (prof || 0) < 2) (Array.isArray(v) ? v : v.a).slice(0, 40).forEach(x => ids_de(x, acc, (prof || 0) + 1));
      return acc;
    }
    function enc(v) {
      if (v instanceof C.PyObj) return esExc(v) || !ids.has(v) ? { s: preview(v) } : { o: idDe(v) };
      if (v === null) return { s: 'None' };
      if (v instanceof C.PyFunc || v instanceof C.PyBuiltin || v instanceof C.PyClass || v instanceof C.PyModule || v instanceof C.PyBound) return { f: 1, s: '<' + (v.name || 'función') + '>' };
      const e = { s: preview(v, 0) }; const l = ids_de(v, [], 0); if (l.length) e.ids = l;
      return e;
    }
    const marcoDe = scope => { let sc = scope; while (sc && sc.fid === undefined && sc !== it.globalScope) sc = sc.parent; return sc && sc.fid !== undefined ? sc : null; };
    const snapVars = sc => { const o = {}; if (!sc) return o; for (const [k, v] of sc.vars) { if (k.startsWith('__')) continue; const e = enc(v); if (e.f) continue; o[k] = e; } return o; };
    let ultG = null, ultGk = '';
    function snapGlobales() {
      const o = snapVars(it.globalScope); const k = JSON.stringify(o);
      if (k === ultGk) return ultG; ultGk = k; ultG = o; return o;
    }
    const nuevoPaso = (tipo, linea, fid, scope, extra) => {
      const idx = T.pasos.length;
      const p = Object.assign({ l: linea, f: fid, tipo, ev: T.eventos.length, v: fid ? snapVars(scope) : {}, g: snapGlobales(), o: it.outLen }, extra || {});
      T.pasos.push(p); (T.pasosDeMarco[fid] = T.pasosDeMarco[fid] || []).push(idx); return p;
    };
    const lleno = () => { if (T.pasos.length >= maxPasos || T.eventos.length >= MAX_EVENTOS) { T.truncada = true; return true; } return false; };
    const evento = e => { if (T.eventos.length >= MAX_EVENTOS) { T.truncada = true; return; } e.p = T.pasos.length - 1; e.l = it.line; e.f = topFid(); const i = T.eventos.push(e) - 1; let h = T.hist.get(e.id); if (!h) T.hist.set(e.id, h = []); h.push(i); };

    it.onStep = (s, scope) => {
      if (lleno()) return;
      const sc = marcoDe(scope); const fid = sc && sc !== it.globalScope ? sc.fid : 0;
      nuevoPaso('sent', s.line, fid, fid ? sc : null);
    };
    it.onNew = obj => { if (esExc(obj)) return; if (T.eventos.length >= MAX_EVENTOS) return; ids.set(obj, ++nid); T.nNodos = nid; evento({ k: 'n', id: nid, c: obj.cls.name }); };
    it.onSet = (o, name, v) => { if (!ids.has(o)) return; if (T.truncada && T.eventos.length >= MAX_EVENTOS) return; evento({ k: 's', id: idDe(o), a: name, v: enc(v) }); };
    it.onCall = (fr, args) => {
      const pad = it.stack.length >= 2 ? it.stack[it.stack.length - 2].fid : 0;
      const ps = fr.f.params.filter(p => p.kind === 'pos').map(p => p.name);
      T.marcos[fr.fid] = { fn: fr.f.name, args: ps.map(n => [n, enc(fr.scope.vars.get(n))]), padre: pad, lc: fr.lineaLlamada, depth: fr.depth };
    };
    it.onRet = (fr, ret) => {
      const m = T.marcos[fr.fid]; if (m) m.ret = enc(ret);
      if (lleno()) return;
      const cal = it.stack.length >= 2 ? it.stack[it.stack.length - 2] : null;
      nuevoPaso('ret', fr.lineaLlamada, cal ? cal.fid : 0, cal ? cal.scope : null, { r: enc(ret), fn: fr.f.name, de: fr.fid });
    };
    let error = null;
    try { it.load(codigo, 'codigo'); }
    catch (e) { error = Py.errorInfo(e, it); }
    // paso final: estado al terminar (o en el punto del error)
    nuevoPaso(error ? 'err' : 'fin', error ? (error.linea || it.line) : null, 0, null, error ? { msg: Py.textoError(error) } : {});
    T.error = error; T.salida = it.out.join('');
    it.onStep = it.onNew = it.onSet = it.onCall = it.onRet = null;
    return T;
  };

  /* ===================== reconstrucción del estado ===================== */
  class Modelo {
    constructor(T) { this.T = T; this.cp = []; this.reset(); this.paso = -1; }
    reset() { this.nodos = new Map(); this.pe = 0; }
    aplicar(ev) {
      if (ev.k === 'n') this.nodos.set(ev.id, { id: ev.id, c: ev.c, a: new Map() });
      else { const n = this.nodos.get(ev.id); if (n) n.a.set(ev.a, ev.v); }
    }
    copia() { const m = new Map(); this.nodos.forEach((n, id) => m.set(id, { id, c: n.c, a: new Map(n.a) })); return m; }
    irAEventos(t) {
      const E = this.T.eventos; t = Math.max(0, Math.min(E.length, t));
      if (t < this.pe) {
        let mejor = null; for (const c of this.cp) if (c.ev <= t) mejor = c;
        this.reset(); if (mejor) { this.nodos = new Map(); mejor.nodos.forEach((n, id) => this.nodos.set(id, { id, c: n.c, a: new Map(n.a) })); this.pe = mejor.ev; }
      }
      while (this.pe < t) {
        this.aplicar(E[this.pe]); this.pe++;
        if (this.pe % 400 === 0 && !this.cp.some(c => c.ev === this.pe)) this.cp.push({ ev: this.pe, nodos: this.copia() });
      }
    }
    /** estado ANTES de ejecutar el paso k (k puede ser = pasos.length - 1, el paso final) */
    irA(k) { k = Math.max(0, Math.min(this.T.pasos.length - 1, k)); this.paso = k; this.irAEventos(this.T.pasos[k].ev); return this; }
  }
  Traza.Modelo = Modelo;

  /** variables visibles en el paso k: pila de marcos (del actual hacia el programa) con las variables de cada uno */
  Traza.pila = function (T, k) {
    const p = T.pasos[k]; const out = []; let fid = p.f;
    const ultimoPaso = f => { const l = T.pasosDeMarco[f]; if (!l) return null; let lo = 0, hi = l.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (l[m] <= k) { r = m; lo = m + 1; } else hi = m - 1; } return r >= 0 ? T.pasos[l[r]] : null; };
    let guard = 0;
    while (fid !== undefined && fid !== null && fid >= 0 && guard++ < 2000) {
      const m = T.marcos[fid]; if (!m) break;
      const ps = fid === p.f ? p : ultimoPaso(fid);
      out.push({ fid, fn: m.fn, args: m.args, vars: ps ? ps.v : {}, linea: ps ? ps.l : null, ret: m.ret });
      if (fid === 0) break; fid = m.padre;
    }
    return out;
  };

  /* ===================== construcción del bosque de árboles ===================== */
  const primero = (n, nombres) => { for (const a of nombres) if (n.a.has(a)) return a; return null; };
  /** cfg: {izq:[..], der:[..], val:[..], alt:[..], col:[..]} → {raices:[{id, arbol, vars}], info} */
  Traza.bosque = function (T, mod, k, cfg) {
    cfg = Object.assign({}, Traza.ATR, cfg || {});
    const N = mod.nodos; const pila = Traza.pila(T, k); const p = T.pasos[k];
    const esNodo = n => !!(primero(n, cfg.izq) || primero(n, cfg.der));
    const valDe = n => { const a = primero(n, cfg.val); if (!a) return null; const e = n.a.get(a); return e; };
    const hijo = (n, nombres) => { const a = primero(n, nombres); if (!a) return null; const e = n.a.get(a); return e && e.o !== undefined ? N.get(e.o) || null : null; };
    const esNil = n => { const v = valDe(n); const sinHijos = !hijo(n, cfg.izq) && !hijo(n, cfg.der); return sinHijos && (!v || v.s === 'None' || v.s === ''); };
    // variables → nodos referenciados (marco actual y globales; también los otros marcos para alcanzabilidad)
    const raicesVar = new Set(); const etiquetasNodo = new Map();
    const marca = (nombre, e, prefijo) => { const l = e.o !== undefined ? [e.o] : (e.ids || []); l.forEach(id => { raicesVar.add(id); if (prefijo !== null) { const t = etiquetasNodo.get(id) || []; if (!t.includes(nombre)) t.push(nombre); etiquetasNodo.set(id, t); } }); };
    pila.forEach((m, i) => { Object.entries(m.vars).forEach(([nom, e]) => marca(nom, e, i === 0 ? '' : null)); });
    Object.entries(p.g || {}).forEach(([nom, e]) => marca(nom, e, ''));
    // alcanzables por cualquier atributo
    const alc = new Set(); const cola = [...raicesVar];
    while (cola.length) { const id = cola.pop(); if (alc.has(id)) continue; const n = N.get(id); if (!n) continue; alc.add(id); n.a.forEach(e => { if (e.o !== undefined) cola.push(e.o); if (e.ids) e.ids.forEach(x => cola.push(x)); }); }
    const nodos = [...alc].map(id => N.get(id)).filter(n => n && esNodo(n) && !esNil(n));
    const esHijo = new Set(); nodos.forEach(n => { const l = hijo(n, cfg.izq), r = hijo(n, cfg.der); if (l) esHijo.add(l.id); if (r) esHijo.add(r.id); });
    let raices = nodos.filter(n => !esHijo.has(n.id));
    if (!raices.length && nodos.length) raices = [nodos[0]];            // ciclo: se parte del primero
    const vistos = new Set();
    const alturaDe = n => { if (!n) return -1; const a = primero(n, cfg.alt); if (!a) return null; const e = n.a.get(a); const x = e && e.s !== undefined ? Number(e.s) : NaN; return isNaN(x) ? null : x; };
    function construir(n, prof) {
      if (!n || esNil(n)) return null;
      if (vistos.has(n.id) || prof > 3000) return { v: '↺', l: null, r: null, k: 'c' + n.id + '_' + prof };
      vistos.add(n.id);
      const ve = valDe(n); const col = primero(n, cfg.col) ? n.a.get(primero(n, cfg.col)) : null;
      const nodo = { v: ve ? ve.s.replace(/^'(.*)'$/, '$1') : '#' + n.id, k: String(n.id), l: construir(hijo(n, cfg.izq), prof + 1), r: construir(hijo(n, cfg.der), prof + 1), meta: { id: n.id, clase: n.c, h: alturaDe(n), col: col ? col.s : null, tags: etiquetasNodo.get(n.id) || [] } };
      const hl = alturaDe(hijo(n, cfg.izq)), hr = alturaDe(hijo(n, cfg.der));
      nodo.meta.factor = (hl !== null && hr !== null && nodo.meta.h !== null) ? hl - hr : null;
      return nodo;
    }
    const arboles = raices.map(r => ({ id: r.id, arbol: construir(r, 0), tags: etiquetasNodo.get(r.id) || [] }));
    // nodos tocados por los últimos eventos (los que produjo el paso anterior) y creados
    const ini = k > 0 ? T.pasos[k - 1].ev : 0; const fin = p.ev; const nuevos = new Set(), tocados = new Set();
    for (let i = ini; i < fin; i++) { const e = T.eventos[i]; if (e.k === 'n') nuevos.add(e.id); else tocados.add(e.id); }
    const vv = pila[0] && pila[0].fid !== 0 ? pila[0].vars : (p.g || {});
    const visitando = new Set(Object.values(vv).flatMap(e => e.o !== undefined ? [e.o] : []));
    return { arboles, nuevos, tocados, visitando, etiquetas: etiquetasNodo, nNodos: nodos.length, pila };
  };

  /** descripción legible de un evento (para el historial de un nodo) */
  Traza.describir = function (T, ev) {
    if (ev.k === 'n') return 'se crea el objeto ' + ev.c;
    const v = ev.v ? (ev.v.o !== undefined ? 'el nodo #' + ev.v.o : ev.v.s) : '';
    return ev.a + ' = ' + v;
  };
})(typeof window !== 'undefined' ? window : globalThis);
