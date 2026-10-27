/* sim_rn.js — animación del árbol rojo-negro (S7-C1, d.22-33 y código de apoyo d.45-49): inserción (casos 1-3) y eliminación (doble negro,
   casos 1-4) con recoloreos y rotaciones paso a paso. Es el MISMO algoritmo del código de la Biblioteca (ArbolRN), portado a JavaScript y
   registrando cada paso; las pruebas comparan el árbol final con el que produce ese código en Python. */
(function (global) {
  'use strict';
  const ET = global.ET, Dib = ET.Dib;
  const Sim = ET.Sim = ET.Sim || {};
  const SX = 58, TY = 70, X0 = 44, Y0 = 44, R = 20;

  /* ---------- árbol mutable con centinela NIL (como ArbolRN de la Biblioteca) ---------- */
  function construir(plano, sigId) {
    const nil = { nil: true, c: 'n', v: null, id: 0 }; nil.l = nil.r = nil.p = nil;
    const T = { nil, raiz: nil, sigId: sigId || 1 };
    const rec = (p, padre) => { if (!p) return nil; const n = { id: p.id, v: p.v, c: p.c, l: nil, r: nil, p: padre }; n.l = rec(p.l, n); n.r = rec(p.r, n); return n; };
    T.raiz = rec(plano, nil); return T;
  }
  function aPlano(T) { const rec = n => n.nil ? null : { id: n.id, v: n.v, c: n.c, l: rec(n.l), r: rec(n.r) }; return rec(T.raiz); }
  const copiaPlano = p => p ? { id: p.id, v: p.v, c: p.c, l: copiaPlano(p.l), r: copiaPlano(p.r) } : null;
  const nota = p => !p ? '_' : (!p.l && !p.r ? p.v + p.c : p.v + p.c + '(' + (p.l ? nota(p.l) : '') + ',' + (p.r ? nota(p.r) : '') + ')');
  const valores = p => { const r = []; (function rec(n) { if (!n) return; rec(n.l); r.push(n.v); rec(n.r); })(p); return r; };
  const tam = p => p ? 1 + tam(p.l) + tam(p.r) : 0;
  /** propiedades de la clase: raíz negra, sin dos rojos seguidos, igual altura negra (NIL cuenta como negro) */
  function valida(p) {
    const err = [];
    const bh = n => { if (!n) return 1; if (n.c === 'r' && ((n.l && n.l.c === 'r') || (n.r && n.r.c === 'r'))) err.push('dos rojos seguidos en ' + n.v); const a = bh(n.l), b = bh(n.r); if (a !== b) err.push('distinto número de negros bajo ' + n.v); return Math.max(a, b) + (n.c === 'n' ? 1 : 0); };
    if (p && p.c !== 'n') err.push('la raíz es roja');
    const h = bh(p); return { ok: !err.length, bh: h, errores: err };
  }

  /* ---------- código de referencia y líneas ---------- */
  const codigoRN = () => ((ET.Biblioteca && ET.Biblioteca.codigo && ET.Biblioteca.codigo.RN) || '').replace(/^\n+/, '').replace(/\s+$/, '').split('\n');
  const lineaDe = (texto, occ) => { const c = codigoRN(); let k = 0; for (let i = 0; i < c.length; i++) if (c[i].includes(texto)) { if (k === (occ || 0)) return i + 1; k++; } return undefined; };

  /* ---------- dibujo ---------- */
  function layout(raiz) {
    const pos = new Map(); let k = 0, maxD = 0;
    (function rec(n, d) { if (!n) return; rec(n.l, d + 1); pos.set(n.id, { x: X0 + k * SX, y: Y0 + d * TY, d }); k++; maxD = Math.max(maxD, d); rec(n.r, d + 1); })(raiz, 0);
    return { pos, n: k, maxD };
  }
  function items(paso, dims) {
    const L = layout(paso.arbol), it = [];
    const etiquetas = paso.etq || {};
    const rec = n => {
      if (!n) return; const p = L.pos.get(n.id);
      if (n.l) { const q = L.pos.get(n.l.id); it.push(Dib.lin('e' + n.l.id, p.x, p.y, q.x, q.y, '')); rec(n.l); }
      if (n.r) { const q = L.pos.get(n.r.id); it.push(Dib.lin('e' + n.r.id, p.x, p.y, q.x, q.y, '')); rec(n.r); }
    };
    rec(paso.arbol);
    const nodos = n => { if (!n) return; const p = L.pos.get(n.id); const resalte = paso.sel && paso.sel[n.id] || ''; it.push(Dib.circ('n' + n.id, p.x, p.y, R, n.v, (n.c === 'r' ? 'rojo' : 'negro') + (resalte ? ' ' + resalte : ''), etiquetas[n.id] || '', { anillo: paso.doble === n.id })); nodos(n.l); nodos(n.r); };
    nodos(paso.arbol);
    if (paso.nilMarca) {
      const p = L.pos.get(paso.nilMarca.id);
      if (p) { const dx = paso.nilMarca.lado === 'l' ? -SX * .5 : SX * .5; it.push(Dib.caja('nilx', p.x + dx - 9, p.y + TY - 9, 18, 18, '', 'negro sel'), Dib.etq('nilt', p.x + dx, p.y + TY + 22, 'NIL (doble negro)', 'mal')); }
    }
    const v = valida(paso.arbol);
    it.push(Dib.etq('estado', 8, dims.H - 14, paso.mid ? '… reparando: todavía no se cumplen todas las reglas' : (paso.arbol ? (v.ok ? '✔ Válido · altura negra = ' + v.bh + ' (NIL cuenta como negro)' : '✖ ' + v.errores.join(' · ')) : 'árbol vacío'), paso.mid ? 'gris' : (v.ok ? 'ok' : 'mal'), 'start'));
    it.push(Dib.etq('titulo', 8, 14, 'Rojo-negro: raíz negra · sin dos rojos seguidos · misma altura negra en todos los caminos', 'gris', 'start'));
    return it;
  }
  function aCuadros(pasos) {
    let maxN = 1, maxD = 0; pasos.forEach(p => { const L = layout(p.arbol); maxN = Math.max(maxN, L.n); maxD = Math.max(maxD, L.maxD); });
    const dims = { W: Math.max(560, X0 * 2 + maxN * SX), H: Y0 + (maxD + 1) * TY + 50 };
    return pasos.map(p => { const f = { items: items(p, dims), msg: p.msg, W: dims.W, H: dims.H }; if (p.linea) f.linea = p.linea; return f; });
  }

  /* ---------- registro de pasos ---------- */
  function registro(T) {
    const pasos = [], casos = []; let rot = 0;
    const R_ = {
      casos, get rot() { return rot; },
      snap(msg, o) { o = o || {}; pasos.push({ arbol: copiaPlano(aPlano(T)), msg, linea: o.linea, sel: o.sel, doble: o.doble, nilMarca: o.nilMarca, mid: o.mid, etq: o.etq }); },
      rotado() { rot++; }
    };
    return { R: R_, pasos };
  }
  const colorTxt = n => n.nil ? 'NIL (negro)' : (n.c === 'r' ? 'rojo' : 'negro');
  const nom = n => n.nil ? 'NIL' : String(n.v);

  function rotar(T, x, lado, R_, msg, o) {   // lado: 'izq' | 'der'
    const nil = T.nil; R_.rotado();
    if (lado === 'izq') {
      const y = x.r; x.r = y.l; if (y.l !== nil) y.l.p = x; y.p = x.p;
      if (x.p === nil) T.raiz = y; else if (x === x.p.l) x.p.l = y; else x.p.r = y;
      y.l = x; x.p = y;
    } else {
      const y = x.l; x.l = y.r; if (y.r !== nil) y.r.p = x; y.p = x.p;
      if (x.p === nil) T.raiz = y; else if (x === x.p.r) x.p.r = y; else x.p.l = y;
      y.r = x; x.p = y;
    }
    R_.snap(msg, o);
  }

  /* ===================== inserción ===================== */
  function insertar(modelo, v) {
    const T = construir(modelo.raiz, modelo.sigId), nil = T.nil, { R: R_, pasos } = registro(T);
    R_.snap('Árbol rojo-negro actual: **' + (modelo.raiz ? nota(modelo.raiz) : 'vacío') + '**. Vamos a insertar **' + v + '**.', { linea: lineaDe('def insertar') });
    let y = nil, x = T.raiz;
    while (x !== nil) { y = x; if (v === x.v) { R_.snap('El valor **' + v + '** ya está en el árbol: no se duplica (`return`).', { sel: { [x.id]: 'sel' }, linea: lineaDe('sin duplicados') }); return { frames: aCuadros(pasos), modelo: { raiz: modelo.raiz, sigId: modelo.sigId }, duplicado: true, casos: [], rotaciones: 0 }; } x = v < x.v ? x.l : x.r; }
    const z = { id: T.sigId++, v, c: 'r', l: nil, r: nil, p: y };
    if (y === nil) T.raiz = z; else if (v < y.v) y.l = z; else y.r = z;
    R_.snap('**1.** Se inserta **' + v + '** como en un BST, siempre como hoja y **pintado de ROJO** (un rojo no cambia la altura negra, así que es la forma más barata de insertar).' + (y === nil ? ' Es la raíz: quedará negra.' : (y.c === 'n' ? ' Su padre (' + y.v + ') es **negro**: no se rompió ninguna regla.' : ' Su padre (' + y.v + ') es **rojo**: hay **dos rojos seguidos**, hay que reparar.')), { sel: { [z.id]: 'nuevo' }, mid: y !== nil && y.c === 'r', linea: lineaDe('z = Nodo(v, ROJO)') });
    let n = z;
    while (n.p.c === 'r') {
      const P = n.p, Q = P.p, izq = P === Q.l, t = izq ? Q.r : Q.l, occ = izq ? 0 : 1;
      R_.snap('**Dos rojos seguidos:** N = **' + n.v + '** y su padre P = **' + P.v + '** son rojos. El abuelo es Q = **' + Q.v + '** y el **tío** T = ' + (t.nil ? '**NIL** (cuenta como negro)' : '**' + t.v + '** (' + colorTxt(t) + ')') + '. Se mira el color del tío.', { sel: { [n.id]: 'sel', [P.id]: 'ruta', [Q.id]: 'ruta', [t.id]: 'act' }, etq: { [n.id]: 'N', [P.id]: 'P', [Q.id]: 'Q', [t.id]: 'T' }, mid: true, linea: lineaDe('while z.padre.color == ROJO') });
      if (t.c === 'r') {
        R_.casos.push('caso 3 (tío rojo)');
        P.c = 'n'; t.c = 'n'; Q.c = 'r';
        R_.snap('**Caso 3 (tío rojo):** se **recolorea** sin rotar: P (' + P.v + ') y T (' + t.v + ') pasan a **negro** y Q (' + Q.v + ') a **rojo**. El problema puede haber subido: ahora se revisa Q.', { sel: { [Q.id]: 'sel', [P.id]: 'ruta', [t.id]: 'ruta' }, mid: true, linea: lineaDe("'caso 3 (tío rojo)'", occ) });
        n = Q;
      } else {
        if (n === (izq ? P.r : P.l)) {
          R_.casos.push('caso 1 (zigzag)');
          R_.snap('**Caso 1 (zigzag):** el tío es negro y N es el hijo ' + (izq ? 'derecho' : 'izquierdo') + ' de P (forma de «<»). Se **rota P hacia el lado contrario** para dejar N en **línea recta** con su padre.', { sel: { [n.id]: 'sel', [P.id]: 'act' }, etq: { [n.id]: 'N', [P.id]: 'P' }, mid: true, linea: lineaDe("'caso 1 (zigzag)'", occ) });
          n = P; rotar(T, n, izq ? 'izq' : 'der', R_, 'Rotación ' + (izq ? 'izquierda' : 'derecha') + ' de ' + P.v + ': ahora los dos rojos están en **línea recta**. Se aplica el caso 2 con N = ' + P.v + '.', { sel: { [n.id]: 'sel' }, mid: true, linea: lineaDe(izq ? 'self.rotar_izq(z)' : 'self.rotar_der(z)', 0) });
        }
        R_.casos.push('caso 2 (recta)');
        const P2 = n.p, Q2 = P2.p;
        P2.c = 'n'; Q2.c = 'r';
        R_.snap('**Caso 2 (línea recta):** el tío es negro y N, P y Q están alineados. Se **recolorea**: P (' + P2.v + ') a **negro** y Q (' + Q2.v + ') a **rojo**; después se rota Q.', { sel: { [P2.id]: 'sel', [Q2.id]: 'sel', [n.id]: 'ruta' }, mid: true, linea: lineaDe("'caso 2 (recta)'", occ) });
        rotar(T, Q2, izq ? 'der' : 'izq', R_, 'Rotación ' + (izq ? 'derecha' : 'izquierda') + ' de ' + Q2.v + ': **P (' + P2.v + ') sube** y Q (' + Q2.v + ') baja como su hijo rojo. Las reglas se cumplen y la reparación **termina**.', { sel: { [P2.id]: 'nuevo' }, linea: lineaDe(izq ? 'self.rotar_der(z.padre.padre)' : 'self.rotar_izq(z.padre.padre)', 0) });
      }
    }
    if (T.raiz.c === 'r') { T.raiz.c = 'n'; R_.snap('**La raíz siempre es negra:** se pinta de negro (el caso 3 puede dejarla roja).', { sel: { [T.raiz.id]: 'sel' }, linea: lineaDe('self.raiz.color = NEGRO') }); }
    else R_.snap('**Listo.** ' + (R_.casos.length ? 'Casos aplicados: ' + R_.casos.join(', ') + '. ' : 'No hizo falta reparar. ') + 'Rotaciones: **' + R_.rot + '** (a lo sumo 2 por inserción). Árbol: **' + nota(aPlano(T)) + '**.', { sel: { [z.id]: 'nuevo' } });
    return { frames: aCuadros(pasos), modelo: { raiz: aPlano(T), sigId: T.sigId }, casos: R_.casos.slice(), rotaciones: R_.rot };
  }

  /* ===================== eliminación ===================== */
  function eliminar(modelo, v) {
    const T = construir(modelo.raiz, modelo.sigId), nil = T.nil, { R: R_, pasos } = registro(T);
    R_.snap('Árbol rojo-negro actual: **' + (modelo.raiz ? nota(modelo.raiz) : 'vacío') + '**. Vamos a eliminar **' + v + '**.', { linea: lineaDe('def eliminar') });
    let z = T.raiz; const ruta = [];
    while (z !== nil && z.v !== v) { ruta.push(z.v); z = v < z.v ? z.l : z.r; }
    if (z === nil) { R_.snap('El valor **' + v + '** no está en el árbol (recorrido: ' + ruta.join(' → ') + ' → NIL).', { linea: lineaDe('if z is self.nil') }); return { frames: aCuadros(pasos), modelo: { raiz: modelo.raiz, sigId: modelo.sigId }, noEsta: true, casos: [], rotaciones: 0 }; }
    R_.snap('Se encontró **' + v + '** (' + colorTxt(z) + ')' + (ruta.length ? ' tras recorrer ' + ruta.join(' → ') : '') + '. **Lo que importa es el color del nodo que realmente desaparece**: si es rojo no pasa nada; si es negro se pierde un negro en ese camino.', { sel: { [z.id]: 'sel' } });
    let y = z, yc = y.c, x, xPos = null;
    const trans = (u, w) => { if (u.p === nil) T.raiz = w; else if (u === u.p.l) u.p.l = w; else u.p.r = w; w.p = u.p; };
    const lado = u => (u.p === nil ? null : (u === u.p.l ? 'l' : 'r'));
    if (z.l === nil) {
      x = z.r; xPos = z.p === nil ? null : { id: z.p.id, lado: lado(z) }; trans(z, z.r);
      R_.snap('**' + v + '** no tiene hijo izquierdo: lo reemplaza su hijo derecho (' + (x.nil ? 'NIL' : x.v) + '). Se quitó un nodo **' + (yc === 'r' ? 'rojo' : 'negro') + '**.' + (yc === 'r' ? ' Quitar un rojo no rompe ninguna regla: **terminó**.' : ' Se perdió un negro: el hueco queda marcado como **doble negro**.'), { nilMarca: x.nil && yc === 'n' ? xPos : null, sel: x.nil ? {} : { [x.id]: 'sel' }, doble: !x.nil && yc === 'n' ? x.id : null, mid: yc === 'n' });
    } else if (z.r === nil) {
      x = z.l; xPos = z.p === nil ? null : { id: z.p.id, lado: lado(z) }; trans(z, z.l);
      R_.snap('**' + v + '** no tiene hijo derecho: lo reemplaza su hijo izquierdo (' + (x.nil ? 'NIL' : x.v) + '). Se quitó un nodo **' + (yc === 'r' ? 'rojo' : 'negro') + '**.' + (yc === 'r' ? ' Quitar un rojo no rompe ninguna regla: **terminó**.' : ' Se perdió un negro: el hueco queda marcado como **doble negro**.'), { nilMarca: x.nil && yc === 'n' ? xPos : null, sel: x.nil ? {} : { [x.id]: 'sel' }, doble: !x.nil && yc === 'n' ? x.id : null, mid: yc === 'n' });
    } else {
      y = z.r; while (y.l !== nil) y = y.l; yc = y.c; x = y.r;
      R_.snap('**' + v + '** tiene **dos hijos**: lo reemplaza su **sucesor inorden** (el menor de su subárbol derecho): **' + y.v + '** (' + colorTxt(y) + '). El nodo que desaparece de su sitio es el sucesor, de color **' + (yc === 'r' ? 'rojo' : 'negro') + '**.', { sel: { [z.id]: 'sel', [y.id]: 'act' }, etq: { [z.id]: 'z', [y.id]: 'y' } });
      if (y.p === z) { xPos = { id: y.id, lado: 'r' }; x.p = y; }
      else { xPos = { id: y.p.id, lado: 'l' }; trans(y, y.r); y.r = z.r; y.r.p = y; }
      trans(z, y); y.l = z.l; y.l.p = y; y.c = z.c;
      R_.snap('**' + y.v + '** ocupa el lugar de ' + v + ' y **hereda su color** (' + colorTxt(y) + '). Como el sucesor era **' + (yc === 'r' ? 'rojo' : 'negro') + '**, ' + (yc === 'r' ? 'no se rompió nada: **terminó**.' : 'se perdió un negro en el sitio del sucesor: queda un **doble negro**.'), { sel: { [y.id]: 'nuevo' }, nilMarca: x.nil && yc === 'n' ? xPos : null, doble: !x.nil && yc === 'n' ? x.id : null, mid: yc === 'n' });
    }
    if (yc === 'n') arreglarDel(T, x, xPos, R_);
    if (!T.raiz.nil) T.raiz.c = 'n';
    R_.snap('**Listo.** ' + (yc === 'r' ? 'Se quitó un nodo rojo: sin reparaciones. ' : (R_.casos.length ? 'Casos aplicados: ' + R_.casos.join(' → ') + '. ' : '')) + 'Rotaciones: **' + R_.rot + '** (a lo sumo 3 en una eliminación). Árbol: **' + (T.raiz.nil ? 'vacío' : nota(aPlano(T))) + '**.', {});
    return { frames: aCuadros(pasos), modelo: { raiz: aPlano(T), sigId: T.sigId }, casos: R_.casos.slice(), rotaciones: R_.rot };
  }

  function arreglarDel(T, x, xPos, R_) {
    const nil = T.nil;
    while (x !== T.raiz && x.c === 'n') {
      const izq = x === x.p.l, occ = izq ? 0 : 1, P = x.p;
      let w = izq ? P.r : P.l;
      const cercano = () => izq ? w.l : w.r, lejano = () => izq ? w.r : w.l;
      const info = (extra) => Object.assign({ sel: Object.assign({ [w.id]: 'act' }, x.nil ? {} : { [x.id]: 'sel' }, { [P.id]: 'ruta' }), etq: Object.assign({ [w.id]: 'H', [P.id]: 'P' }, x.nil ? {} : { [x.id]: 'D' }), doble: x.nil ? null : x.id, nilMarca: x.nil ? xPos : null, mid: true }, extra || {});
      R_.snap('**Doble negro en D** (' + (x.nil ? 'NIL' : x.v) + '). Su padre es P = **' + P.v + '** (' + colorTxt(P) + ') y su **hermano H = ' + nom(w) + '** (' + colorTxt(w) + ') con sobrinos ' + nom(cercano()) + ' (' + colorTxt(cercano()) + ') y ' + nom(lejano()) + ' (' + colorTxt(lejano()) + '). Se mira el color de H y de sus hijos.', info({ linea: lineaDe('while x is not self.raiz and x.color == NEGRO') }));
      if (w.c === 'r') {
        R_.casos.push('caso 1 (hermano rojo)');
        w.c = 'n'; P.c = 'r';
        R_.snap('**Caso 1 (hermano rojo):** H pasa a **negro** y P a **rojo**; después se rota P hacia el lado de D.', info({ linea: lineaDe("'caso 1 (hermano rojo)'", occ), sel: { [w.id]: 'sel', [P.id]: 'sel' } }));
        rotar(T, P, izq ? 'izq' : 'der', R_, 'Rotación ' + (izq ? 'izquierda' : 'derecha') + ' de P (' + P.v + '): el doble negro **no desapareció**, pero ahora su hermano es **negro** (el antiguo sobrino): se pasa a los casos 2, 3 o 4.', { sel: { [x.nil ? P.id : x.id]: 'sel' }, doble: x.nil ? null : x.id, nilMarca: x.nil ? xPos : null, mid: true, linea: lineaDe(izq ? 'self.rotar_izq(x.padre)' : 'self.rotar_der(x.padre)', 0) });
        w = izq ? P.r : P.l;
      }
      if (cercano().c === 'n' && lejano().c === 'n') {
        R_.casos.push('caso 2 (hermano y sobrinos negros)');
        w.c = 'r';
        const sube = P;
        R_.snap('**Caso 2 (hermano y sobrinos negros):** H pasa a **rojo** y el **negro de más sube al padre** P (' + P.v + '): ' + (P.c === 'r' ? 'como P era **rojo**, absorbe el negro (pasará a negro) y se **termina**.' : 'P era negro: queda **doble negro** y se repite más arriba.'), info({ linea: lineaDe("'caso 2 (hermano y sobrinos negros)'", occ), sel: { [w.id]: 'sel', [P.id]: 'sel' } }));
        x = sube; xPos = null;
        if (x.c === 'n' && x !== T.raiz) R_.snap('Ahora **P (' + x.v + ') es el doble negro**: se repite con su hermano.', { sel: { [x.id]: 'sel' }, doble: x.id, mid: true });
      } else {
        if (lejano().c === 'n') {
          R_.casos.push('caso 3 (sobrino cercano rojo)');
          const c = cercano(); c.c = 'n'; w.c = 'r';
          R_.snap('**Caso 3 (sobrino cercano rojo):** el hijo de H más cercano a D (' + nom(c) + ') es rojo y el lejano negro. Se **intercambian los colores** de H y de ese sobrino (queda H rojo, sobrino negro) y se rota H en sentido opuesto a D: el rojo pasa al lado **lejano** (→ caso 4).', info({ linea: lineaDe("'caso 3 (sobrino cercano rojo)'", occ), sel: { [w.id]: 'sel', [c.id]: 'sel' } }));
          rotar(T, w, izq ? 'der' : 'izq', R_, 'Rotación ' + (izq ? 'derecha' : 'izquierda') + ' de H: ahora el sobrino **lejano** es rojo → **caso 4**.', { sel: { [x.nil ? P.id : x.id]: 'sel' }, doble: x.nil ? null : x.id, nilMarca: x.nil ? xPos : null, mid: true, linea: lineaDe(izq ? 'self.rotar_der(w)' : 'self.rotar_izq(w)', 0) });
          w = izq ? P.r : P.l;
        }
        R_.casos.push('caso 4 (sobrino lejano rojo)');
        const lej = lejano(); w.c = P.c; P.c = 'n'; lej.c = 'n';
        R_.snap('**Caso 4 (sobrino lejano rojo):** H toma el **color de P**; P pasa a **negro**; el sobrino lejano (' + nom(lej) + ') pasa a **negro**. Después se rota P hacia el lado de D: **el doble negro desaparece**.', info({ linea: lineaDe("'caso 4 (sobrino lejano rojo)'", occ), sel: { [w.id]: 'sel', [P.id]: 'sel', [lej.id]: 'sel' } }));
        rotar(T, P, izq ? 'izq' : 'der', R_, 'Rotación ' + (izq ? 'izquierda' : 'derecha') + ' de P (' + P.v + '): el negro de más se absorbió. El árbol vuelve a cumplir las reglas y la reparación **termina**.', { sel: { [w.id]: 'nuevo' }, linea: lineaDe(izq ? 'self.rotar_izq(x.padre)' : 'self.rotar_der(x.padre)', 0) });
        x = T.raiz; xPos = null;
      }
    }
    if (x !== nil && x.c === 'r') { x.c = 'n'; R_.snap('D es **rojo**: absorbe el negro de más y pasa a **negro** (`x.color = NEGRO`). Se **terminó**.', { sel: { [x.id]: 'sel' }, linea: lineaDe('x.color = NEGRO') }); }
  }

  const nuevo = () => ({ raiz: null, sigId: 1 });
  function desde(valsOps) { let m = nuevo(); valsOps.forEach(v => { m = insertar(m, v).modelo; }); return m; }
  Sim.rn = { cuadro: (modelo, msg) => aCuadros([{ arbol: modelo.raiz, msg }])[0], nuevo, desde, insertar, eliminar, nota, valores, valida, tam, escena: (modelo) => { const dims = { W: 560, H: 300 }; return items({ arbol: modelo.raiz }, dims); }, codigoRN };
})(typeof window !== 'undefined' ? window : globalThis);
