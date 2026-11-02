/* taller_rn.js — taller interactivo del árbol ROJO-NEGRO (S7-C1): insertar con reparación.
   Pasos: colocar el nodo nuevo (siempre ROJO, como en un BST) → elegir el caso (tío rojo / zigzag / línea recta) → recolorear tocando los nodos →
   rotar arrastrando un hijo sobre su padre → comprobar → raíz negra. El orden y los casos son los del algoritmo de Sim.rn (el de la Biblioteca). */
(function (global) {
  'use strict';
  const ET = global.ET, TG = ET.TallerGen, SR = ET.Sim.rn, Dib = ET.Dib;

  const esNodo = dom => /^n\d+$/.test(dom);
  const idDe = dom => Number(dom.slice(1));
  const nodoId = id => 'n' + id;
  const col = c => c === 'r' ? 'rojo' : 'negro';
  const nota = SR.nota;

  const pintar = (p, id, c) => !p ? null : { id: p.id, v: p.v, c: p.id === id ? c : p.c, l: pintar(p.l, id, c), r: pintar(p.r, id, c) };
  const hallar = (p, id) => { if (!p) return null; if (p.id === id) return p; return hallar(p.l, id) || hallar(p.r, id); };
  const padreDe = (p, id) => { if (!p) return null; if ((p.l && p.l.id === id) || (p.r && p.r.id === id)) return p; return padreDe(p.l, id) || padreDe(p.r, id); };
  const snap = T => ({ raiz: SR.aPlano(T), sigId: T.sigId, nuevo: null });
  const conRaiz = (m, raiz) => ({ raiz, sigId: m.sigId, nuevo: null });
  /** modelo plano tras rotar el nodo `id` (hacia 'izq' o 'der') */
  const rotarPlano = (m, id, lado) => {
    const T = SR.construir(m.raiz, m.sigId); let x = null;
    (function rec(n) { if (n.nil || x) return; if (n.id === id) { x = n; return; } rec(n.l); rec(n.r); })(T.raiz);
    SR.rotarT(T, x, lado); return snap(T);
  };

  function iniciar(cfg) { const r = SR.desde(cfg.vals || []); return { raiz: r.raiz, sigId: r.sigId, nuevo: null }; }

  /* ---------- dibujo ---------- */
  function dibujar(m, p, ctx) {
    const L = SR.layout(m.raiz);
    const baseH = SR.Y0 + (L.maxD + 2) * SR.TY + 36, W = Math.max(560, SR.X0 * 2 + Math.max(L.n, 1) * SR.SX + 70), H = baseH + (m.nuevo ? 56 : 0);
    const info = { arbol: m.raiz, sel: {}, etq: {}, mid: true }, extra = [];
    if (p && p.vista) p.vista(info, m, extra, L);
    const it = SR.items(info, { W, H }).filter(x => x.id !== 'estado' && x.id !== 'titulo');   // el estado «válido / inválido» delataría la respuesta
    it.push(Dib.etq('titulo', 8, 14, 'Rojo-negro: raíz negra · sin dos rojos seguidos · misma altura negra en todos los caminos', 'gris', 'start'));
    if (m.nuevo) it.push(Dib.circ(nodoId(m.nuevo.id), 46, baseH + 16, SR.R, m.nuevo.v, 'rojo', 'nuevo (rojo)'));   // abajo a la izquierda: en el celular no hay que desplazar la caja para encontrarlo
    if (ctx && ctx.fin && m.raiz) { const v = SR.valida(m.raiz); it.push(Dib.etq('estado', 8, H - 12, v.ok ? '✔ Válido · altura negra = ' + v.bh : '✖ ' + v.errores.join(' · '), v.ok ? 'ok' : 'mal', 'start')); }
    return { items: it.concat(extra), W, H };
  }
  /** huecos donde puede colgar el nodo nuevo: los dos hijos vacíos de cada nodo */
  function huecos(m, L) {
    const out = [];
    if (!m.raiz) { out.push({ id: 'sraiz', padre: null, lado: null, x: SR.X0 + 4, y: SR.Y0 }); return out; }
    (function rec(n) { if (!n) return; const q = L.pos.get(n.id); [['l', n.l, -1], ['r', n.r, 1]].forEach(([ld, hijo, s]) => { if (hijo) rec(hijo); else out.push({ id: 's' + n.id + ld, padre: n.id, lado: ld, x: q.x + s * SR.SX * .5, y: q.y + SR.TY }); }); })(m.raiz);
    return out;
  }
  const idHueco = pos => pos.padre === null ? 'sraiz' : 's' + pos.padre + pos.lado;

  /* ---------- pasos ---------- */
  function pasoColocar(m, m1, pos, v) {
    const esp = idHueco(pos);
    return {
      id: 'colocar', antes: m, titulo: 'Colocar el nodo nuevo', gestos: 'par',
      instr: 'Arrastra el **nodo nuevo (' + v + ')** al hueco donde se cuelga como **hoja**, igual que en un BST: menor → izquierda, mayor → derecha. Entra siempre **ROJO** (un rojo no cambia la altura negra). Suéltalo en un hueco punteado, o tócalo y luego toca el hueco.',
      ayudaFuente: 'En este paso solo se mueve el **nodo nuevo** (el rojo de abajo a la izquierda).',
      fuente: id => id === nodoId(m.nuevo.id), destino: id => /^s/.test(id),
      vista(info, mm, ex, L) { huecos(mm, L).forEach(s => ex.push(Dib.circ(s.id, s.x, s.y, 15, '+', 'hueco', ''))); },
      acepta(g) {
        if (g.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra el nodo nuevo a un hueco punteado (o tócalo y luego toca el hueco).' };
        if (g.de !== nodoId(m.nuevo.id)) return { ok: false, blando: true, msg1: 'En este paso solo se mueve el nodo nuevo.' };
        if (g.a === esp) return { ok: true, despues: m1, msg: '✔ **' + v + '** se cuelga como hoja y queda **rojo**.' + (pos.padre === null ? ' Es la raíz: habrá que pintarla de negro.' : '') };
        const mt = /^s(\d+)([lr])$/.exec(g.a), p = mt ? hallar(m.raiz, Number(mt[1])) : null;
        if (!p) return { ok: false, blando: true, msg1: 'Suéltalo en un hueco punteado.' };
        const menor = v < p.v;
        return { ok: false, msg1: 'Esa posición no respeta el orden del BST.', msg2: v + ' es ' + (menor ? 'menor' : 'mayor') + ' que ' + p.v + ': ' + ((mt[2] === 'l') === menor ? 'ese hueco no queda al final del camino de comparaciones desde la raíz.' : 'no puede ir a la ' + (mt[2] === 'l' ? 'izquierda' : 'derecha') + ' de ' + p.v + '.') };
      },
      pista: TG.pista3(['Compara **' + v + '** con la raíz: si es menor baja a la izquierda; si es mayor, a la derecha. Repite hasta llegar a un hueco vacío.', pos.padre === null ? 'El árbol está vacío: el nodo será la raíz.' : 'Se cuelga como hijo ' + (pos.lado === 'l' ? 'izquierdo' : 'derecho') + ' del nodo **' + hallar(m.raiz, pos.padre).v + '**.', 'Suelta el nodo nuevo en el hueco señalado.'], [esp], 2),
      correcta: () => ({ tipo: 'par', de: nodoId(m.nuevo.id), a: esp }),
      incorrecta: () => { const otro = huecos(m, SR.layout(m.raiz)).find(s => s.id !== esp); return { tipo: 'par', de: nodoId(m.nuevo.id), a: otro ? otro.id : 's999l' }; }
    };
  }

  const BOTONES = [
    { t: '✔ Ya no hay dos rojos seguidos', v: 'ninguno' },
    { t: 'Caso 1 · tío negro, zigzag', v: 'caso1' },
    { t: 'Caso 2 · tío negro, línea recta', v: 'caso2' },
    { t: 'Caso 3 · tío rojo', v: 'caso3' }
  ];
  /** d = datos del momento (colores y valores ya copiados: el plan sigue mutando el árbol mientras se construyen los pasos) */
  function pasoCaso(m, d, esp) {
    const hay = esp !== 'ninguno', nombreT = d.tNil ? 'NIL (negro)' : d.tv + ' (' + col(d.tc) + ')';
    const forma = esp === 'caso1' ? 'zigzag' : 'línea recta';
    return {
      id: 'caso', antes: m, titulo: hay ? 'Elegir el caso' : 'Comprobar', gestos: 'ninguno', botones: BOTONES,
      instr: hay ? '**N** = **' + d.nv + '** (el nodo que acaba de quedar rojo) y su padre **P** = **' + d.Pv + '** son **rojos**: hay dos rojos seguidos. **Q** = abuelo, **T** = tío. Mira el color de **T** y la forma N-P-Q, y elige el caso.' : '¿Queda algún par de **rojos seguidos**? Mira a **N** = **' + d.nv + '**' + (d.Pv !== undefined ? ' y a su padre **P** = **' + d.Pv + '** (' + col(d.Pc) + ')' : ' (es la raíz)') + '. Elige el caso que corresponde.',
      vista(info, mm, ex, L) {
        info.etq[d.nid] = 'N'; if (d.Pid !== undefined) info.etq[d.Pid] = 'P';
        if (hay) {
          info.etq[d.Qid] = 'Q';
          if (!d.tNil) info.etq[d.tid] = 'T';
          else { const q = L.pos.get(d.Qid), s = d.izq ? 1 : -1; ex.push(Dib.caja('nilT', q.x + s * SR.SX * .5 - 9, q.y + SR.TY - 9, 18, 18, '', 'negro'), Dib.etq('nilTt', q.x + s * SR.SX * .5, q.y + SR.TY + 24, 'T = NIL (negro)', 'gris')); }
        }
      },
      acepta(g) {
        if (g.tipo !== 'boton') return { ok: false, blando: true, msg1: 'Elige el caso con los botones de abajo.' };
        if (g.v === esp) {
          const ms = { ninguno: '✔ Correcto: no hay dos rojos seguidos' + (d.Pv !== undefined ? ' (el padre es **negro**).' : ' (N es la raíz).'), caso3: '✔ Caso 3: el tío es **rojo** → se **recolorea** sin rotar.', caso1: '✔ Caso 1: el tío es negro y N forma un **zigzag** con P y Q → primero se **rota P** para dejar N en línea recta.', caso2: '✔ Caso 2: el tío es negro y N, P y Q están en **línea recta** → se recolorea y se **rota Q**.' };
          return { ok: true, msg: ms[esp] };
        }
        if (esp === 'ninguno') return { ok: false, msg1: 'No hay ninguna reparación pendiente.', msg2: d.Pv !== undefined ? 'El padre de N es **negro**: no hay dos rojos seguidos.' : 'N es la raíz: no tiene padre.' };
        if (g.v === 'ninguno') return { ok: false, msg1: 'Sí hay dos rojos seguidos: **' + d.nv + '** y su padre **' + d.Pv + '** son rojos.', msg2: 'Eso viola la regla «un rojo no tiene hijos rojos»: hay que reparar.' };
        if (esp === 'caso3') return { ok: false, msg1: 'El tío **T** es **rojo** (' + nombreT + '): ese es el caso 3.', msg2: 'Con tío rojo no se rota: se recolorea P y T a negro y Q a rojo.' };
        if (g.v === 'caso3') return { ok: false, msg1: 'El tío **T** es **negro** (' + nombreT + '), no rojo.', msg2: 'El caso 3 es solo para tío rojo. Con tío negro (o NIL) hay que mirar la forma N-P-Q: zigzag o línea recta.' };
        return { ok: false, msg1: 'El tío es negro, pero la forma N-P-Q es **' + forma + '**.', msg2: 'Zigzag: N y P cuelgan de lados contrarios (forma «<»). Línea recta: N y P cuelgan del mismo lado.' };
      },
      pista: TG.pista3(hay ? ['Mira el color del tío T (el hermano de P). NIL cuenta como negro.', 'El tío es **' + (d.tNil ? 'NIL (negro)' : col(d.tc)) + '**.' + (esp === 'caso3' ? ' Tío rojo → caso 3.' : ' Tío negro → mira si N-P-Q forman un zigzag o una línea.'), esp === 'caso3' ? 'Es el **caso 3 (tío rojo)**.' : 'Es el **caso ' + (esp === 'caso1' ? '1 (zigzag)' : '2 (línea recta)') + '**.'] : ['Revisa el color del padre de N: si es negro, no hay dos rojos seguidos.', d.Pv !== undefined ? 'El padre es **' + col(d.Pc) + '**.' : 'N es la raíz y no tiene padre.', 'Pulsa «✔ Ya no hay dos rojos seguidos».']),
      correcta: () => TG.boton(esp),
      incorrecta: () => TG.boton(esp === 'ninguno' ? 'caso3' : (esp === 'caso3' ? 'caso2' : 'ninguno'))
    };
  }
  /** varios toques: cada nodo de `cambios` ({id, c}) se recolorea con un toque; el paso termina al recolorear todos */
  function pasoRecolor(m, cambios, titulo, instr, okFinal) {
    let cur = m; const faltan = cambios.slice(); const nombre = id => hallar(m.raiz, id).v;
    return {
      id: 'recolor', antes: m, titulo, gestos: 'clic', clicable: id => esNodo(id) && !!hallar(cur.raiz, idDe(id)),
      instr,
      acepta(g) {
        if (g.tipo !== 'clic') return { ok: false, blando: true, msg1: 'Toca el nodo que cambia de color.' };
        const id = idDe(g.id), k = faltan.findIndex(c => c.id === id);
        if (!hallar(cur.raiz, id)) return { ok: false, blando: true, msg1: 'Toca un nodo del árbol.' };
        if (k < 0) {
          return cambios.some(c => c.id === id) ? { ok: false, blando: true, msg1: 'Ese nodo ya cambió de color.' }
            : { ok: false, msg1: 'El nodo **' + nombre(id) + '** no cambia de color en este caso.', msg2: 'Cambian: ' + cambios.map(c => nombre(c.id) + ' → ' + col(c.c)).join(', ') + '.' };
        }
        const c = faltan.splice(k, 1)[0]; cur = conRaiz(cur, pintar(cur.raiz, c.id, c.c));
        return { ok: true, despues: cur, continua: faltan.length > 0, msg: faltan.length ? '✔ **' + nombre(c.id) + '** pasa a **' + col(c.c) + '**. Faltan ' + faltan.length + ' nodo(s).' : okFinal };
      },
      pista: k => ({ texto: ['Hay que cambiar el color de ' + cambios.length + ' nodo(s). Toca cada uno.', 'Cambian: ' + cambios.map(c => 'el **' + nombre(c.id) + '** a ' + col(c.c)).join(', ') + '.', 'Toca el nodo **' + nombre(faltan[0].id) + '** (pasa a ' + col(faltan[0].c) + ').'][k - 1], revela: k >= 2 ? faltan.map(c => nodoId(c.id)) : null }),
      correcta: () => ({ tipo: 'clic', id: nodoId(faltan[0].id) }),
      incorrecta: () => { let otro = null; (function rec(n) { if (!n || otro) return; if (!cambios.some(c => c.id === n.id)) otro = n; rec(n.l); rec(n.r); })(cur.raiz); return { tipo: 'clic', id: nodoId(otro.id) }; }
    };
  }
  /** arrastrar un hijo sobre su padre = rotación del padre hacia el lado contrario. hijo/padre = {id, v}; derecha = el hijo es el izquierdo */
  function pasoRotar(m, hijo, padre, derecha, despues, titulo, instr, okMsg) {
    return {
      id: 'rotar', antes: m, titulo, gestos: 'par', instr,
      ayudaFuente: 'Toca (o arrastra) el **hijo** que va a subir.',
      fuente: esNodo, destino: esNodo,
      acepta(g) {
        if (g.tipo !== 'par') return { ok: false, blando: true, msg1: 'Arrastra un hijo sobre su padre.' };
        const a = idDe(g.de), b = idDe(g.a);
        if (a === hijo.id && b === padre.id) return { ok: true, despues, msg: okMsg };
        const pa = padreDe(m.raiz, a);
        if (!pa || pa.id !== b) return { ok: false, msg1: 'Para rotar, arrastra **un hijo sobre su padre**.', msg2: 'Un hijo izquierdo sobre su padre = rotación a la derecha; un hijo derecho = a la izquierda.' };
        return { ok: false, msg1: 'Ese giro no es el que corresponde ahora.', msg2: 'Debe subir **' + hijo.v + '** y bajar **' + padre.v + '**: arrastra **' + hijo.v + '** sobre **' + padre.v + '**.' };
      },
      pista: TG.pista3(['Una rotación sube un hijo y baja a su padre. ¿Qué nodo debe subir?', 'Debe subir **' + hijo.v + '** (hijo ' + (derecha ? 'izquierdo' : 'derecho') + ' de **' + padre.v + '**): es una rotación a la **' + (derecha ? 'derecha' : 'izquierda') + '** sobre ' + padre.v + '.', 'Arrastra **' + hijo.v + '** sobre **' + padre.v + '**.'], [nodoId(hijo.id), nodoId(padre.id)], 2),
      correcta: () => ({ tipo: 'par', de: nodoId(hijo.id), a: nodoId(padre.id) }),
      incorrecta: () => ({ tipo: 'par', de: nodoId(padre.id), a: nodoId(hijo.id) })
    };
  }
  function pasoRaiz(m, raiz, despues) {
    return {
      id: 'raiz', antes: m, titulo: 'La raíz es negra', gestos: 'clic', clicable: esNodo,
      instr: 'La **raíz siempre es negra**, y ahora es **roja**. **Tócala** para pintarla de negro.',
      acepta(g) {
        if (g.tipo !== 'clic') return { ok: false, blando: true, msg1: 'Toca la raíz.' };
        if (idDe(g.id) === raiz.id) return { ok: true, despues, msg: '✔ La raíz (**' + raiz.v + '**) pasa a **negro**: todas las propiedades se cumplen.' };
        return { ok: false, msg1: 'Ese nodo no es la raíz.', msg2: 'La raíz es el nodo de más arriba.' };
      },
      pista: TG.pista3(['La propiedad: la raíz es negra.', 'La raíz es **' + raiz.v + '**.', 'Toca el nodo **' + raiz.v + '**.'], [nodoId(raiz.id)], 2),
      correcta: () => ({ tipo: 'clic', id: nodoId(raiz.id) }),
      incorrecta: () => { const o = (function rec(n) { if (!n) return null; if (n.id !== raiz.id) return n; return rec(n.l) || rec(n.r); })(m.raiz); return o ? { tipo: 'clic', id: nodoId(o.id) } : null; }   // con un solo nodo no hay movimiento equivocado
    };
  }

  /* ---------- plan de una inserción (mismo algoritmo que Sim.rn.insertar) ---------- */
  function planIns(m0, v) {
    const T = SR.construir(m0.raiz, m0.sigId), nil = T.nil;
    let y = nil, x = T.raiz;
    while (x !== nil) { y = x; if (v === x.v) throw new Error('El valor ' + v + ' ya está en el árbol (no se duplican).'); x = v < x.v ? x.l : x.r; }
    const el = { id: T.sigId, v }, lado = y === nil ? null : (v < y.v ? 'l' : 'r');
    const m1a = { raiz: m0.raiz, sigId: T.sigId + 1, nuevo: el };
    const z = { id: T.sigId++, v, c: 'r', l: nil, r: nil, p: y }; if (y === nil) T.raiz = z; else if (v < y.v) y.l = z; else y.r = z;
    let mm = snap(T);
    const pasos = [pasoColocar(m1a, mm, { padre: y === nil ? null : y.id, lado }, v)];
    let n = z; const casos = []; let rot = 0;
    while (n.p !== nil) {
      const P = n.p;
      if (P.c !== 'r') { pasos.push(pasoCaso(mm, { nid: n.id, nv: n.v, Pid: P.id, Pv: P.v, Pc: P.c }, 'ninguno')); break; }
      const Q = P.p, izq = P === Q.l, t = izq ? Q.r : Q.l;
      const esp = t.c === 'r' ? 'caso3' : (n === (izq ? P.r : P.l) ? 'caso1' : 'caso2');
      pasos.push(pasoCaso(mm, { nid: n.id, nv: n.v, Pid: P.id, Pv: P.v, Pc: P.c, Qid: Q.id, Qv: Q.v, tid: t.id, tv: t.v, tc: t.c, tNil: !!t.nil, izq }, esp)); casos.push(esp);
      if (esp === 'caso3') {
        const cambios = [{ id: P.id, c: 'n' }, { id: t.id, c: 'n' }, { id: Q.id, c: 'r' }], pv = P.v, tv = t.v, qv = Q.v;
        P.c = 'n'; t.c = 'n'; Q.c = 'r';
        pasos.push(pasoRecolor(mm, cambios, 'Recolorear (tío rojo)', 'Caso 3: **P** (' + pv + ') y **T** (' + tv + ') pasan a **negro** y el abuelo **Q** (' + qv + ') pasa a **rojo**. **Toca cada uno** de esos tres nodos para cambiarle el color. (Así el problema puede subir hasta Q.)', '✔ Recoloreado: P y T negros, Q rojo. El problema puede haber **subido**: ahora se revisa Q.'));
        mm = snap(T); n = Q; continue;
      }
      let nn = n;   // nodo que queda en línea recta con su padre y su abuelo
      if (esp === 'caso1') {
        // zigzag: se rota P hacia el lado contrario (N sube sobre P): se arrastra N sobre P
        const m2 = rotarPlano(mm, P.id, izq ? 'izq' : 'der'); rot++;
        pasos.push(pasoRotar(mm, { id: n.id, v: n.v }, { id: P.id, v: P.v }, !izq, m2, 'Rotar P (zigzag)', 'Caso 1: para dejar los dos rojos en **línea recta**, **rota P**: arrastra **N** (' + n.v + ') **sobre su padre P** (' + P.v + ').', '✔ Rotación ' + (izq ? 'izquierda' : 'derecha') + ' de ' + P.v + ': ahora los dos rojos están en **línea recta**. Se sigue con el caso 2.'));
        SR.rotarT(T, P, izq ? 'izq' : 'der'); mm = m2; nn = P;   // el nuevo N es el viejo P; su padre es el viejo N
      }
      const P2 = nn.p, Q2 = P2.p, p2v = P2.v, q2v = Q2.v;
      P2.c = 'n'; Q2.c = 'r';
      pasos.push(pasoRecolor(mm, [{ id: P2.id, c: 'n' }, { id: Q2.id, c: 'r' }], 'Recolorear (línea recta)', 'Caso 2: el padre **P** (' + p2v + ') pasa a **negro** y el abuelo **Q** (' + q2v + ') pasa a **rojo**. **Toca esos dos nodos** para cambiarles el color.', '✔ Recoloreado: P negro y Q rojo. Ahora se **rota Q**.'));
      mm = snap(T);
      const m4 = rotarPlano(mm, Q2.id, izq ? 'der' : 'izq'); rot++;
      pasos.push(pasoRotar(mm, { id: P2.id, v: p2v }, { id: Q2.id, v: q2v }, izq, m4, 'Rotar Q', 'Ahora **rota el abuelo Q** (' + q2v + '): arrastra **P** (' + p2v + ') **sobre su padre Q** (' + q2v + ') para que P suba.', '✔ Rotación ' + (izq ? 'derecha' : 'izquierda') + ' de ' + q2v + ': **' + p2v + ' sube** y ' + q2v + ' baja como su hijo rojo. Las reglas se cumplen y la reparación **termina**.'));
      SR.rotarT(T, Q2, izq ? 'der' : 'izq'); mm = m4; n = nn;   // el padre de nn ahora es negro: el bucle pedirá comprobarlo
    }
    if (T.raiz.c === 'r') { const r = { id: T.raiz.id, v: T.raiz.v }; T.raiz.c = 'n'; const mf = snap(T); pasos.push(pasoRaiz(mm, r, mf)); mm = mf; casos.push('raíz negra'); }
    return { pasos, final: mm, texto: '<strong>Insertar ' + v + '</strong>: ' + (casos.length ? 'casos ' + casos.join(' → ') + '; ' : 'sin reparaciones; ') + 'rotaciones: ' + rot + ' → <code>' + nota(mm.raiz) + '</code>.' };
  }

  TG.familias.rn = {
    etiqueta: 'Taller del árbol rojo-negro', iniciar,
    plan(m, op) { return planIns(m, op.v); },
    dibujar,
    nombreOp: o => 'Insertar ' + o.v,
    resumen: m => 'Árbol rojo-negro: ' + (m.raiz ? nota(m.raiz) + ' · ' + (SR.valida(m.raiz).ok ? '✔ válido' : '✖ inválido') : 'vacío'),
    textoFinal: m => m.raiz ? nota(m.raiz) : '_',
    resolucionHtml(cfg) { let m = iniciar(cfg); const out = []; cfg.ops.forEach(o => { const p = planIns(m, o.v); out.push('<li>' + p.texto + '</li>'); m = p.final; }); return '<ol>' + out.join('') + '</ol>'; },
    leerOps(txt) {
      const ops = [];
      for (const raw of txt.split(/[;,]+/).map(s => s.trim()).filter(Boolean)) {
        const mm = /^(?:\+|ins(?:ertar)?\s*)?(-?\d+)$/i.exec(raw);
        if (!mm) throw new Error('No entiendo «' + raw + '». En el rojo-negro el taller practica la inserción: escribe números (25, 40, 10). La eliminación se ve paso a paso en Laboratorio → Rojo-negro.');
        ops.push({ t: 'ins', v: Number(mm[1]) });
      }
      return ops;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
