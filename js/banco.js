/* banco.js — registro del banco de preguntas y kit de ayudas para escribir plantillas.
   Una plantilla es {id, n (nivel), e (etapa A|B|C), dif (1-5), c (conceptos), tema, gen(rng, K, opts)}.
   gen devuelve una pregunta concreta; con la misma semilla produce siempre la misma pregunta. */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const U = ET.U, Arb = ET.Arb, Py = ET.Py;

  const Banco = ET.Banco = { plantillas: [], porId: {} };
  Banco.add = function (def) {
    if (Banco.porId[def.id]) throw new Error('Plantilla duplicada: ' + def.id);
    Banco.plantillas.push(def); Banco.porId[def.id] = def; return def;
  };
  /** Crea una pregunta concreta a partir de una plantilla y una semilla. opts se pasa a gen (p. ej. {caso:'LR'}). */
  Banco.instanciar = function (id, seed, opts) {
    const t = Banco.porId[id]; if (!t) throw new Error('Plantilla desconocida: ' + id);
    const rng = new U.RNG(seed);
    const q = t.gen(rng, K, opts || {});
    q.tplId = id; q.seed = seed; q.nivel = t.n; q.etapa = t.e; q.dif = t.dif; q.tema = t.tema;
    q.conceptos = q.conceptos || t.c; q.opts = opts || null;
    if (!q.pistas || !q.pistas.length) q.pistas = K.pistasGenericas(q);
    return q;
  };
  Banco.filtrar = function (f) {
    f = f || {};
    return Banco.plantillas.filter(t =>
      (f.todas || !t.basica) &&   // las preguntas «básicas» retiradas (banco_retiro.js) no se sirven
      (!f.niveles || f.niveles.includes(t.n)) && (!f.etapas || f.etapas.includes(t.e)) &&
      (!f.dif || (t.dif >= f.dif[0] && t.dif <= f.dif[1])) &&
      (!f.conceptos || t.c.some(c => f.conceptos.includes(c))) &&
      (!f.ids || f.ids.includes(t.id)) && (!f.excluir || !f.excluir.includes(t.id)));
  };
  /** categoría de una plantilla sin instanciarla (se cachea al primer uso) */
  Banco.categoriaDe = function (t) {
    if (t._cat) return t._cat;
    const q = Banco.instanciar(t.id, 12345);
    t._cat = ET.Tipos.categoria(q); t._tipo = q.tipo; t._fmt = ET.Tipos.formato(q);
    return t._cat;
  };

  /* ===================== kit ===================== */
  const K = ET.Kit = { U, Arb, Py };
  K.cod = U.dedent;
  K.tpl = (strings, ...v) => U.dedent(String.raw(strings, ...v));

  K.pistasGenericas = function (q) {
    const c = ET.Temario.conceptos[(q.conceptos || [])[0]];
    const nom = c ? c.nombre : 'el concepto de la pregunta';
    return [
      'Identifica de qué trata la pregunta: se relaciona con **' + nom + '**. Léela otra vez e identifica qué te piden exactamente.',
      'Repasa la teoría breve de «' + nom + '» (botón *Teoría breve*) y compárala con lo que dice el enunciado.',
      'Haz un ejemplo pequeño a mano (con valores chicos) y verifica tu razonamiento paso a paso antes de responder.'
    ];
  };

  /** opciones mezcladas: buenas y malas son listas de [texto, porqué] */
  K.mc = (rng, enun, buenas, malas, extra) => Object.assign({
    tipo: 'opcion', enunciado: enun, multi: false,
    opciones: rng.shuffle(buenas.map(b => ({ t: b[0], ok: true, why: b[1] })).concat(malas.map(m => ({ t: m[0], ok: false, why: m[1] }))))
  }, extra || {});
  /** V/F con justificación opcional: just = [[texto, ok, porqué], ...] */
  K.vf = (rng, afirm, correcta, expl, just, extra) => Object.assign({
    tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa.', afirmacion: afirm, correcta, explicacion: expl,
    justif: just ? { opciones: rng.shuffle(just.map(j => ({ t: j[0], ok: !!j[1], why: j[2] }))) } : null
  }, extra || {});
  K.salida = (enun, codigo, esperado, extra) => Object.assign({ tipo: 'salida', enunciado: enun, codigoVista: codigo, esperado }, extra || {});
  K.pick = (rng, arr) => arr[Math.floor(rng.next() * arr.length)];

  /** ejecuta código real con el intérprete y devuelve lo que imprime */
  K.run = (codigo, opts) => Py.salida(codigo, opts);
  K.ev = (codigo, expr, opts) => { const r = Py.evaluar(codigo, expr, opts); if (!r.ok) throw new Error('Referencia falla: ' + Py.textoError(r.error)); return r; };
  K.llamadas = (codigo, expr, fn) => { const s = Py.sesion(codigo, { maxSteps: 4000000 }); if (!s.ok) throw new Error(Py.textoError(s.error)); const r = s.evaluar(expr, { maxSteps: 4000000 }); if (!r.ok) throw new Error(Py.textoError(r.error)); return { valor: r.repr, n: r.llamadas[fn] || 0 }; };

  /* ----- árboles ----- */
  K.pyN = function pyN(t) {
    if (!t) return 'None';
    const v = typeof t.v === 'number' ? String(t.v) : "'" + t.v + "'";
    if (!t.l && !t.r) return 'N(' + v + ')';
    return 'N(' + v + ',' + pyN(t.l) + ',' + pyN(t.r) + ')';
  };
  K.PRE_ARBOL = U.dedent(`
    class NodoArbol:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None
    def N(v, i=None, d=None):
        n = NodoArbol(v)
        n.izq = i
        n.der = d
        return n
    def _sub(n):
        return '' if n is None else a_nota(n)
    def a_nota(n):
        if n is None:
            return '_'
        if n.izq is None and n.der is None:
            return str(n.valor)
        return str(n.valor) + '(' + _sub(n.izq) + ',' + _sub(n.der) + ')'
  `);
  K.CLASE_NODO = U.dedent(`
    class NodoArbol:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None
  `);
  K.PRE_AVL = U.dedent(`
    class NodoAVL:
        def __init__(self, valor):
            self.valor = valor
            self.izq = None
            self.der = None
            self.h = 0
    def NA(v, i=None, d=None):
        n = NodoAVL(v)
        n.izq = i
        n.der = d
        n.h = 1 + max(-1 if i is None else i.h, -1 if d is None else d.h)
        return n
    def _subA(n):
        return '' if n is None else a_notaA(n)
    def a_notaA(n):
        if n is None:
            return '_'
        if n.izq is None and n.der is None:
            return str(n.valor)
        return str(n.valor) + '(' + _subA(n.izq) + ',' + _subA(n.der) + ')'
    def alturas_ok(n):
        if n is None:
            return True
        hi = -1 if n.izq is None else n.izq.h
        hd = -1 if n.der is None else n.der.h
        return n.h == 1 + max(hi, hd) and alturas_ok(n.izq) and alturas_ok(n.der)
  `);
  K.PRE_REC = K.PRE_ARBOL + '\n' + U.dedent(`
    def correr(f, t):
        s = []
        f(t, s)
        return s
  `);
  /** crea huecos [[k]] en una solución. huecos: string | [contexto, fragmento]; alts: {k(1-based): [alternativas]} */
  K.huecos = function (sol, huecos, alts) {
    let pl = sol; const resp = {};
    huecos.forEach((hh, i) => {
      const [ctx, frag] = Array.isArray(hh) ? hh : [hh, hh];
      const p = pl.indexOf(ctx); if (p < 0) throw new Error('Hueco no encontrado: ' + ctx);
      const q = ctx.indexOf(frag);
      pl = pl.slice(0, p) + ctx.slice(0, q) + '' + String.fromCharCode(0xE100 + i) + '' + ctx.slice(q + frag.length) + pl.slice(p + ctx.length);
      resp[String(i + 1)] = [frag].concat((alts && alts[i + 1]) || []);
    });
    pl = pl.replace(/(.)/g, (m, c) => '[[' + (c.charCodeAt(0) - 0xE100 + 1) + ']]');
    return { plantilla: pl, respuestas: resp };
  };
  /** árbol de expresión aleatorio con claves únicas k (permite valores repetidos) */
  K.exprRand = function (rng, prof, ops) {
    let id = 0;
    const rec = d => {
      if (d === 0 || (d < prof && rng.chance(0.3))) return { v: rng.int(1, 9), k: 'n' + (id++), l: null, r: null };
      const nd = { v: rng.pick(ops), k: 'n' + (id++) }; nd.l = rec(d - 1); nd.r = rec(d - 1); return nd;
    };
    return rec(prof);
  };
  K.evalExpr = function ev(n) { if (!n.l && !n.r) return n.v; const a = ev(n.l), b = ev(n.r); return n.v === '+' ? a + b : (n.v === '-' ? a - b : a * b); };
  K.pyNA = function pyNA(t) {
    if (!t) return 'None';
    const v = typeof t.v === 'number' ? String(t.v) : "'" + t.v + "'";
    if (!t.l && !t.r) return 'NA(' + v + ')';
    return 'NA(' + v + ',' + pyNA(t.l) + ',' + pyNA(t.r) + ')';
  };
  K.letrasUsadas = (n) => Arb.LETRAS.slice(0, n).split('');
  K.arbolRand = (rng, n, opts) => Arb.aleatorio(rng, n, opts);
  K.bstRand = (rng, n, lo, hi, bal) => Arb.bstAleatorio(rng, n, lo || 5, hi || 95, bal);

  /** AVL aleatorio (construido insertando valores distintos) */
  K.avlRand = (rng, n, lo, hi) => { const vals = rng.distinct(n, lo || 5, hi || 95); return { arbol: Arb.construirAVL(vals).arbol, secuencia: vals }; };

  /** formatea lista de valores */
  K.lst = a => '[' + a.map(String).join(', ') + ']';
  K.coma = a => a.map(String).join(', ');

  /** escenario de rotación: devuelve {bst, nuevo, ...} tras insertar en AVL aleatorio algo que provoca rotación */
  K.escenarioRot = function (rng, caso, tam) {
    for (let intento = 0; intento < 400; intento++) {
      const n = tam || rng.int(4, 8);
      const vals = rng.distinct(n + 1, 5, 95);
      const base = Arb.construirAVL(vals.slice(0, n)).arbol;
      const v = vals[n];
      const r = Arb.insAVL(base, v);
      if (!r.primerDesbalanceado) continue;
      if (caso && r.caso !== caso) continue;
      return { base, nuevo: v, r, bst: r.bst, secuencia: vals.slice(0, n) };
    }
    // respaldo determinista (no debería usarse casi nunca)
    const c = caso || 'LL';
    const base = Arb.parse({ LL: '30(20,)', RR: '10(,20)', LR: '30(10,)', RL: '10(,30)' }[c]);
    const nuevo = { LL: 10, RR: 30, LR: 20, RL: 20 }[c];
    const r = Arb.insAVL(base, nuevo);
    return { base, nuevo, r, bst: r.bst, secuencia: Arb.pre(base) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
