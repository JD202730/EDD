/* pyapi.js — API pública del intérprete: ejecutar, sesiones de prueba, análisis estático y diagnósticos */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const C = ET.PyCore, P = ET.PyParse;

  function errorInfo(e, it) {
    if (e instanceof C.PyExc) {
      const o = e.obj, args = o.attrs.get('args');
      const msg = (o.cls.name === 'KeyError' && args && args.a.length === 1) ? it.repr(args.a[0]) : it.str(o);
      return { tipo: o.cls.name, msg, linea: e.line, archivo: e.file };
    }
    if (e instanceof P.PySyntaxError) return { tipo: e.pyType, msg: e.pyMsg, linea: e.line, archivo: 'codigo', sintaxis: true };
    if (e instanceof C.PyLimit) return { tipo: 'Limite', msg: e.pyMsg, linea: it && it.line, archivo: it && it.file };
    if (e instanceof C.PyUnsupported) return { tipo: 'NoSoportado', msg: e.pyMsg, linea: it && it.line, archivo: it && it.file };
    if (e instanceof RangeError) return { tipo: 'RecursionError', msg: 'maximum recursion depth exceeded', linea: it && it.line, archivo: it && it.file };
    return { tipo: 'ErrorInterno', msg: String((e && e.message) || e), linea: it && it.line, archivo: it && it.file };
  }
  function textoError(err) {
    if (!err) return '';
    const donde = err.linea && err.archivo !== 'prelude' ? ' (línea ' + err.linea + ')' : '';
    if (err.tipo === 'Limite') return 'Límite de ejecución: ' + err.msg;
    if (err.tipo === 'NoSoportado') return 'No soportado por el intérprete del entrenador: ' + err.msg;
    if (err.tipo === 'ErrorInterno') return 'Error interno del intérprete (no es tu código): ' + err.msg;
    return err.tipo + ': ' + err.msg + donde;
  }

  /** Crea un intérprete, carga prelude y código; devuelve una sesión para evaluar expresiones. */
  function sesion(codigo, opts) {
    opts = opts || {};
    const it = new C.Interp({ maxSteps: opts.maxSteps || 3000000, maxDepth: opts.maxDepth || 1000, maxMs: opts.maxMs || 4000, trace: opts.trace });
    const s = { interp: it, ok: true, error: null, stdout: '' };
    const fin = () => { s.stdout = it.out.join(''); };
    try { if (opts.prelude) it.load(opts.prelude, 'prelude'); }
    catch (e) { s.ok = false; s.error = errorInfo(e, it); s.error.prelude = true; fin(); return s; }
    try { it.load(codigo, 'codigo'); }
    catch (e) { s.ok = false; s.error = errorInfo(e, it); }
    fin();
    s.evaluar = function (expr, o) {
      o = o || {};
      it.steps = 0; it.depth = 0; it.t0 = Date.now(); it.calls = Object.create(null); it.file = 'prueba';
      it.cargaOculta = !!o.cargaOculta;   // costos ocultos de Python (x in lista, A[1:], pop(0)…) solo en pruebas de eficiencia
      if (o.maxSteps) it.maxSteps = o.maxSteps;
      try {
        const v = it.evalExpr(expr);
        return { ok: true, v, repr: it.repr(v), llamadas: Object.assign({}, it.calls), pasos: it.steps };
      } catch (e) { return { ok: false, error: errorInfo(e, it), llamadas: Object.assign({}, it.calls) }; }
    };
    return s;
  }
  function ejecutar(codigo, opts) {
    const s = sesion(codigo, opts);
    return { ok: s.ok, error: s.error, stdout: s.stdout, interp: s.interp, trace: s.interp.trace };
  }
  /** Evalúa una expresión sobre código fuente y devuelve el repr (para generar respuestas esperadas) */
  function evaluar(codigo, expr, opts) {
    const s = sesion(codigo, opts);
    if (!s.ok) return { ok: false, error: s.error };
    const r = s.evaluar(expr);
    return r.ok ? { ok: true, repr: r.repr, v: r.v, interp: s.interp, stdout: s.interp.out.join('') } : { ok: false, error: r.error };
  }
  /** Ejecuta código y devuelve lo que imprime (stdout sin salto final) */
  function salida(codigo, opts) {
    const r = ejecutar(codigo, opts);
    if (!r.ok) throw new Error('El fragmento de referencia falla: ' + textoError(r.error));
    return r.stdout.replace(/\n$/, '');
  }

  /* ---------- análisis estático ---------- */
  function analizar(codigo) {
    let ast;
    try { ast = P.parseModule(codigo); } catch (e) { return { ok: false, error: errorInfo(e, null) }; }
    const funcs = [];
    P.walk(ast, (n, parent) => { if (n.k === 'FuncDef') funcs.push(n); });
    return { ok: true, ast, funcs, codigo };
  }
  function buscarFn(an, nombre) { return an.funcs.find(f => f.name === nombre) || null; }
  function llamaA(nodo, nombre) {
    let hay = false;
    P.walk(nodo, n => { if (n.k === 'Call' && ((n.f.k === 'Name' && n.f.id === nombre) || (n.f.k === 'Attr' && n.f.name === nombre))) { hay = true; return false; } });
    return hay;
  }
  function tieneBucle(nodo) {
    let hay = false;
    P.walk(nodo, n => { if (n.k === 'While' || n.k === 'For' || n.k === 'ListComp' || n.k === 'GenExp' || n.k === 'SetComp' || n.k === 'DictComp') hay = true; });
    return hay;
  }
  function nombresAsignados(nodos) {
    const set = new Set();
    P.walk(nodos, n => {
      const tg = [];
      if (n.k === 'Assign') tg.push(...n.targets); else if (n.k === 'AugAssign') tg.push(n.t); else if (n.k === 'For') tg.push(n.target);
      for (const t of tg) P.walk([t], m => { if (m.k === 'Name') set.add(m.id); });
    });
    return set;
  }
  function nombresUsados(nodo) { const set = new Set(); P.walk(nodo, n => { if (n.k === 'Name') set.add(n.id); }); return set; }

  /** Evalúa reglas estáticas sobre el código del estudiante. */
  function evaluarReglas(an, reglas, src) {
    const out = [];
    for (const r of (reglas || [])) {
      let ok = true, msg = r.msg || '';
      switch (r.t) {
        case 'recursiva': { const f = buscarFn(an, r.fn); ok = !!f && llamaA(f, r.fn); msg = msg || 'La función ' + r.fn + ' debe ser recursiva (llamarse a sí misma).'; break; }
        case 'sinBucles': { const f = r.fn ? buscarFn(an, r.fn) : an.ast; ok = !f || !tieneBucle(f); msg = msg || 'No debes usar bucles (for/while): hazlo con recursión.'; break; }
        case 'noRecursiva': { const f = buscarFn(an, r.fn); ok = !!f && !llamaA(f, r.fn); msg = msg || 'Esta versión debe ser iterativa (bottom-up): no llames a ' + r.fn + ' dentro de sí misma.'; break; }
        case 'sinAnidados': {
          const f = r.fn ? buscarFn(an, r.fn) : an.ast; let anid = false;
          const rec = (n, dentro) => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) { n.forEach(x => rec(x, dentro)); return; } const esB = n.k === 'For' || n.k === 'While'; if (esB && dentro) anid = true; for (const k in n) { if (k === 'k' || k === 'line') continue; const v = n[k]; if (v && typeof v === 'object') rec(v, dentro || esB); } };
          rec(f, false); ok = !anid; msg = msg || 'No uses ciclos anidados: la solución debe ser lineal.'; break;
        }
        case 'conBucle': { const f = r.fn ? buscarFn(an, r.fn) : an.ast; ok = !!f && tieneBucle(f); msg = msg || 'Debe resolverse con un bucle (enfoque iterativo/bottom-up).'; break; }
        case 'sinLlamada': { ok = !llamaA(an.ast, r.nombre); break; }
        case 'usa': ok = r.re.test(src); break;
        case 'noUsa': ok = !r.re.test(src); break;
        case 'defineFn': { const f = buscarFn(an, r.nombre); ok = !!f && (r.params === undefined || f.params.filter(p => p.kind === 'pos').length === r.params); msg = msg || 'Debe existir la función ' + r.nombre + (r.params !== undefined ? ' con ' + r.params + ' parámetro(s)' : '') + '.'; break; }
      }
      out.push({ ok, msg });
    }
    return out;
  }

  /** Ejecuta las pruebas de un ejercicio de código. spec: {prelude, fn, tests:[{e,r,maxLlamadas,desc}], reglas, maxSteps} */
  function ejecutarPruebas(codigo, spec) {
    const res = { cargaOk: true, errorCarga: null, pruebas: [], reglas: [], aprobadas: 0, total: (spec.tests || []).length, stdout: '' };
    const an = analizar(codigo);
    if (!an.ok) { res.cargaOk = false; res.errorCarga = an.error; return res; }
    res.reglas = evaluarReglas(an, spec.reglas, codigo);
    const s = sesion(codigo, { prelude: spec.prelude, maxSteps: spec.maxSteps || 1500000, maxDepth: spec.maxDepth });
    res.stdout = s.stdout;
    if (!s.ok) { res.cargaOk = false; res.errorCarga = s.error; return res; }
    for (const t of spec.tests || []) {
      const got = s.evaluar(t.e, { maxSteps: t.maxPasos || spec.maxSteps || 1500000, cargaOculta: !!t.ef });
      const p = { e: t.e, desc: t.desc || t.e, ok: false, ef: !!t.ef };
      if (!got.ok) { p.error = got.error; p.msg = textoError(got.error); if (t.ef && got.error && got.error.tipo === 'Limite') p.msg = 'Se agotó el presupuesto de pasos: la solución es demasiado lenta para este tamaño de entrada (¿ciclo doble?).'; }
      else {
        const want = s.evaluar(t.r);
        if (!want.ok) { p.ok = false; p.msg = 'Error interno en la prueba: ' + textoError(want.error); p.interno = true; }
        else {
          p.obtenido = got.repr; p.esperado = want.repr;
          p.ok = s.interp.eq(got.v, want.v) && (typeof got.v === typeof want.v || (C.isNumLike(got.v) && C.isNumLike(want.v)));
          if (p.ok && t.maxLlamadas) {
            for (const k in t.maxLlamadas) if ((got.llamadas[k] || 0) > t.maxLlamadas[k]) { p.ok = false; p.msg = 'El resultado es correcto, pero ' + k + ' se llamó ' + got.llamadas[k] + ' veces (máximo esperado: ' + t.maxLlamadas[k] + '). Revisa la eficiencia.'; p.eficiencia = true; }
          }
          if (p.ok && t.minLlamadas) {
            for (const k in t.minLlamadas) if ((got.llamadas[k] || 0) < t.minLlamadas[k]) { p.ok = false; p.msg = 'Se esperaba una solución recursiva que llame a ' + k + ' al menos ' + t.minLlamadas[k] + ' veces.'; }
          }
        }
      }
      if (p.ok) res.aprobadas++;
      res.pruebas.push(p);
    }
    return res;
  }

  /* ---------- diagnósticos para la práctica guiada ---------- */
  const ATRIBUTOS_RAROS = { izquierdo: 'izq', izquierda: 'izq', derecho: 'der', derecha: 'der', left: 'izq', right: 'der', val: 'valor', value: 'valor', data: 'valor', dato: 'valor', key: 'valor', hijo_izq: 'izq', hijo_der: 'der' };
  function diagnosticos(codigo, ctx) {
    ctx = ctx || {};
    const out = []; const an = analizar(codigo);
    if (!an.ok) {
      const e = an.error;
      out.push({ nivel: 'error', msg: 'Error de sintaxis' + (e.linea ? ' en la línea ' + e.linea : '') + ': ' + e.msg + '.' });
      return out;
    }
    if (!codigo.trim()) { out.push({ nivel: 'error', msg: 'Todavía no has escrito código.' }); return out; }
    if (ctx.fn) {
      const f = buscarFn(an, ctx.fn);
      if (!f) out.push({ nivel: 'error', msg: 'No encuentro la función "' + ctx.fn + '". Revisa el nombre exacto que pide el enunciado.' });
    }
    for (const f of an.funcs) {
      const params = f.params.filter(p => p.kind === 'pos').map(p => p.name);
      const esRec = llamaA(f, f.name);
      if (esRec) {
        // caso base: debe existir un return cuyo valor no incluya una llamada recursiva
        let hayBase = false, hayReturn = false;
        P.walk(f.body, n => { if (n.k === 'Return') { hayReturn = true; if (!n.v || !llamaA(n.v, f.name)) hayBase = true; } });
        if (!hayReturn || !hayBase) out.push({ nivel: 'error', msg: 'En ' + f.name + '() no veo un caso base: debe existir un "return" que NO llame de nuevo a ' + f.name + ' (la recursión no terminaría).' });
        // llamada con los mismos argumentos
        P.walk(f.body, n => {
          if (n.k === 'Call' && n.f.k === 'Name' && n.f.id === f.name && params.length && n.args.length === params.length && n.args.every((a, i) => a.k === 'Name' && a.id === params[i]) && !n.kwargs.length && !f.params.some(p => p.def))
            out.push({ nivel: 'error', msg: 'En ' + f.name + '(): la llamada recursiva usa exactamente los mismos argumentos que recibió, así que nunca se acerca al caso base.' });
        });
        // resultado de la llamada recursiva descartado
        P.walk(f.body, n => {
          if (n.k === 'ExprStmt' && n.x.k === 'Call' && ((n.x.f.k === 'Name' && n.x.f.id === f.name) || (n.x.f.k === 'Attr' && n.x.f.name === f.name)))
            out.push({ nivel: 'aviso', msg: 'Línea ' + n.line + ': llamas a ' + f.name + '() pero descartas lo que devuelve. Si la función devuelve un valor (o un nodo/subárbol), debes usarlo: "return ...", o asignarlo (p. ej. nodo.izq = ...).' });
        });
      }
      // while sin actualización
      P.walk(f.body, n => {
        if (n.k === 'While') {
          const usados = nombresUsados(n.test); const asig = nombresAsignados(n.body);
          let sale = false; P.walk(n.body, m => { if (m.k === 'Break' || m.k === 'Return') sale = true; });
          const cambia = [...usados].some(u => asig.has(u));
          let llamaMetodo = false; P.walk(n.test, m => { if (m.k === 'Call') llamaMetodo = true; });
          if (!cambia && !sale && !llamaMetodo && usados.size) out.push({ nivel: 'aviso', msg: 'Línea ' + n.line + ': el bucle while depende de {' + [...usados].join(', ') + '} pero ninguna se actualiza dentro del bucle: podría no terminar nunca.' });
        }
      });
      // argumentos por defecto mutables
      for (const p of f.params) if (p.def && (p.def.k === 'Dict' || p.def.k === 'List' || p.def.k === 'Set')) out.push({ nivel: 'aviso', msg: 'En ' + f.name + '(): el parámetro "' + p.name + '" tiene un valor por defecto mutable. Se crea UNA sola vez y se comparte entre llamadas (usa None y créalo dentro).' });
    }
    // comparaciones con "is" contra literales
    P.walk(an.ast, n => {
      if (n.k === 'Compare') n.ops.forEach((op, i) => { if ((op === 'is' || op === 'is not') && (n.rs[i].k === 'Num' || n.rs[i].k === 'Str')) out.push({ nivel: 'aviso', msg: 'Línea ' + n.line + ': "is" compara identidad; para comparar valores usa == / !=. ("is" se reserva para None.)' }); });
    });
    // nombres de atributos distintos a los de clase
    if (ctx.arbol) {
      const vistos = new Set();
      P.walk(an.ast, n => { if (n.k === 'Attr' && ATRIBUTOS_RAROS[n.name] && !vistos.has(n.name)) { vistos.add(n.name); out.push({ nivel: 'aviso', msg: 'Usas ".' + n.name + '", pero en clase el nodo se define con los atributos valor, izq y der (aquí: ".' + ATRIBUTOS_RAROS[n.name] + '").' }); } });
    }
    return out;
  }

  ET.Py = { ejecutar, sesion, evaluar, salida, analizar, buscarFn, llamaA, tieneBucle, nombresAsignados, nombresUsados, evaluarReglas, ejecutarPruebas, diagnosticos, errorInfo, textoError, P, C };
})(typeof window !== 'undefined' ? window : globalThis);
