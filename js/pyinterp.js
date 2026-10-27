/* pyinterp.js — intérprete de un subconjunto de Python 3 (recorrido del AST).
   NO es CPython: soporta lo necesario para el curso (funciones, clases, listas, dicts, recursión,
   lru_cache, deque, f-strings, comprensiones, excepciones). Lo no soportado se informa, no se simula. */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const P = ET.PyParse;
  const MAXI = 9007199254740991;

  /* ---------- tipos de valores ---------- */
  class PyFloat { constructor(v) { this.v = v; } }
  class PyTuple { constructor(a) { this.a = a; } }
  class PyRange { constructor(s, e, st) { this.s = s; this.e = e; this.st = st; } get length() { const n = this.st > 0 ? Math.ceil((this.e - this.s) / this.st) : Math.ceil((this.s - this.e) / -this.st); return Math.max(0, n); } }
  class PyDict { constructor() { this.m = new Map(); this.dflt = null; } }
  class PySet { constructor() { this.m = new Map(); } }
  class PyDeque { constructor(a) { this.a = a || []; } }
  class PyFunc { constructor(name, params, body, closure, defaults, file) { this.name = name; this.params = params; this.body = body; this.closure = closure; this.defaults = defaults; this.file = file; this.isLambda = false; this.home = null; } }
  class PyBuiltin { constructor(name, fn, pytype) { this.name = name; this.fn = fn; this.pytype = pytype || null; } }
  class PyClass { constructor(name, bases) { this.name = name; this.bases = bases; this.attrs = new Map(); this._mro = null; } }
  class PyObj { constructor(cls) { this.cls = cls; this.attrs = new Map(); } }
  class PyBound { constructor(self, fn) { this.self = self; this.fn = fn; } }
  class PyModule { constructor(name, attrs) { this.name = name; this.attrs = attrs; } }
  class PySuper { constructor(obj, start) { this.obj = obj; this.start = start; } }
  class PyStatic { constructor(fn) { this.fn = fn; } }
  class PyClassM { constructor(fn) { this.fn = fn; } }
  class PyExc extends Error { constructor(obj) { super('PyExc'); this.obj = obj; } }
  class PyLimit extends Error { constructor(msg) { super(msg); this.pyType = 'Limite'; this.pyMsg = msg; } }
  class PyUnsupported extends Error { constructor(msg) { super(msg); this.pyType = 'NoSoportado'; this.pyMsg = msg; } }

  class Scope {
    constructor(parent, isClass) { this.vars = new Map(); this.parent = parent || null; this.isClass = !!isClass; this.globals = null; this.nonlocals = null; this.fn = null; this.self0 = undefined; }
  }
  const BRK = { t: 'break' }, CNT = { t: 'continue' };

  const isNumLike = v => typeof v === 'number' || typeof v === 'boolean' || v instanceof PyFloat;
  const toNum = v => typeof v === 'number' ? v : (typeof v === 'boolean' ? (v ? 1 : 0) : v.v);
  const isFl = v => v instanceof PyFloat || (typeof v === 'number' && !Number.isInteger(v));
  const mkF = r => Number.isInteger(r) ? new PyFloat(r) : r;
  const isIntLike = v => (typeof v === 'number' && Number.isInteger(v)) || typeof v === 'boolean';

  const EXC_TREE = {
    BaseException: null, Exception: 'BaseException', ArithmeticError: 'Exception', ZeroDivisionError: 'ArithmeticError', OverflowError: 'ArithmeticError',
    LookupError: 'Exception', IndexError: 'LookupError', KeyError: 'LookupError', ValueError: 'Exception', TypeError: 'Exception',
    AttributeError: 'Exception', NameError: 'Exception', UnboundLocalError: 'NameError', RuntimeError: 'Exception', RecursionError: 'RuntimeError',
    NotImplementedError: 'RuntimeError', AssertionError: 'Exception', StopIteration: 'Exception', ImportError: 'Exception', ModuleNotFoundError: 'ImportError',
    OSError: 'Exception', MemoryError: 'Exception', KeyboardInterrupt: 'BaseException'
  };

  /* ===================== formato ===================== */
  function groupDigits(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function reprFloat(x) {
    if (x === Infinity) return 'inf'; if (x === -Infinity) return '-inf'; if (isNaN(x)) return 'nan';
    if (Number.isInteger(x) && Math.abs(x) < 1e16) return (Object.is(x, -0) ? '-0' : String(x)) + '.0';
    const ax = Math.abs(x);
    if (ax >= 1e16 || (ax < 1e-4 && ax !== 0)) {
      let s = x.toExponential(); // 1e+21, 1.5e-7
      s = s.replace(/e([+-])(\d)$/, 'e$10$2');
      return s.replace(/^(-?\d+)e/, '$1e');
    }
    return String(x);
  }
  function reprStr(s) {
    const q = (s.includes("'") && !s.includes('"')) ? '"' : "'";
    let out = q;
    for (const ch of s) {
      if (ch === '\\') out += '\\\\';
      else if (ch === '\n') out += '\\n'; else if (ch === '\t') out += '\\t'; else if (ch === '\r') out += '\\r';
      else if (ch === q) out += '\\' + q;
      else out += ch;
    }
    return out + q;
  }

  class Interp {
    constructor(opts) {
      opts = opts || {};
      this.maxSteps = opts.maxSteps || 3000000;
      this.maxDepth = opts.maxDepth || 1000;
      this.maxMs = opts.maxMs || 4000;
      this.t0 = Date.now();
      this.steps = 0; this.depth = 0; this.line = 0; this.file = 'codigo'; this.idc = 0;
      // ganchos de depuración (traza.js): sentencia ejecutada, objeto creado, atributo asignado, llamada y retorno de funciones propias
      this.onStep = null; this.onNew = null; this.onSet = null; this.onCall = null; this.onRet = null; this.stack = []; this.frameN = 0;
      this.out = []; this.outLen = 0; this.calls = Object.create(null);
      this.trace = opts.trace ? [] : null; this.traceMax = opts.traceMax || 800;
      this.globalScope = new Scope(null);
      this.globalScope.vars.set('__name__', '__main__');
      this.builtins = new Map();
      this.seed = 12345;
      this.initBuiltins();
    }

    /* ---------- errores ---------- */
    mkExc(clsName, msg) {
      const cls = this.builtins.get(clsName);
      const o = new PyObj(cls);
      o.attrs.set('args', new PyTuple(msg === undefined ? [] : [msg]));
      const e = new PyExc(o); e.line = this.line; e.file = this.file; return e;
    }
    tick() {
      if (++this.steps > this.maxSteps) throw new PyLimit('Se superó el límite de pasos de ejecución (¿bucle infinito o recursión sin fin?)');
      if ((this.steps & 4095) === 0 && Date.now() - this.t0 > this.maxMs) throw new PyLimit('Se superó el tiempo máximo de ejecución (' + (this.maxMs / 1000) + ' s)');
    }
    /** modo «costos ocultos» (cargaOculta): las operaciones de Python que recorren o copian una secuencia cuestan lo que recorren
        (x in lista, A[1:], pop(0), insert, list + list, sorted, sum…). Se activa solo en las pruebas de eficiencia. */
    costo(n) {
      if (!this.cargaOculta || !(n > 0)) return;
      this.steps += n;
      if (this.steps > this.maxSteps) throw new PyLimit('Se superó el límite de pasos de ejecución (¿bucle infinito o recursión sin fin?)');
    }
    tname(v) {
      if (v === null) return 'NoneType'; if (typeof v === 'boolean') return 'bool';
      if (typeof v === 'number') return Number.isInteger(v) ? 'int' : 'float';
      if (v instanceof PyFloat) return 'float'; if (typeof v === 'string') return 'str';
      if (Array.isArray(v)) return 'list'; if (v instanceof PyTuple) return 'tuple'; if (v instanceof PyDict) return 'dict';
      if (v instanceof PySet) return 'set'; if (v instanceof PyDeque) return 'deque'; if (v instanceof PyRange) return 'range';
      if (v instanceof PyFunc || v instanceof PyBound || (v instanceof PyBuiltin && !v.pytype)) return 'function';
      if (v instanceof PyBuiltin || v instanceof PyClass) return 'type';
      if (v instanceof PyModule) return 'module';
      if (v instanceof PyObj) return v.cls.name;
      return 'object';
    }

    /* ---------- clases ---------- */
    mro(cls) {
      if (cls._mro) return cls._mro;
      const out = [cls];
      for (const b of cls.bases) for (const c of this.mro(b)) if (!out.includes(c)) out.push(c);
      cls._mro = out; return out;
    }
    findAttr(cls, name) { for (const c of this.mro(cls)) if (c.attrs.has(name)) return c.attrs.get(name); return undefined; }
    isSub(cls, base) { return this.mro(cls).includes(base); }
    typeObj(v) {
      if (v instanceof PyObj) return v.cls;
      const nm = this.tname(v); const b = this.builtins.get(nm);
      return b || null;
    }

    /* ---------- hash / igualdad / orden ---------- */
    hk(v) {
      if (v === null) return 'N';
      switch (typeof v) { case 'number': return 'n' + v; case 'boolean': return 'n' + (v ? 1 : 0); case 'string': return 's' + v; }
      if (v instanceof PyFloat) return 'n' + v.v;
      if (v instanceof PyTuple) return 't(' + v.a.map(x => this.hk(x)).join(',') + ')';
      if (Array.isArray(v) || v instanceof PyDict || v instanceof PySet || v instanceof PyDeque) throw this.mkExc('TypeError', "unhashable type: '" + this.tname(v) + "'");
      if (v instanceof PyObj) { const h = this.findAttr(v.cls, '__hash__'); if (h) return 'h' + this.str(this.call(h, [v])); }
      if (!v.__id) v.__id = ++this.idc;
      return 'o' + v.__id;
    }
    eq(a, b) {
      if (a === b) return true;
      const na = isNumLike(a), nb = isNumLike(b);
      if (na || nb) return na && nb && toNum(a) === toNum(b);
      if (a === null || b === null || typeof a === 'string' || typeof b === 'string') return false;
      if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => this.eq(x, b[i]));
      if (a instanceof PyTuple) return b instanceof PyTuple && a.a.length === b.a.length && a.a.every((x, i) => this.eq(x, b.a[i]));
      if (a instanceof PyDict) { if (!(b instanceof PyDict) || a.m.size !== b.m.size) return false; for (const [k, kv] of a.m) { const o = b.m.get(k); if (!o || !this.eq(kv[1], o[1])) return false; } return true; }
      if (a instanceof PySet) { if (!(b instanceof PySet) || a.m.size !== b.m.size) return false; for (const k of a.m.keys()) if (!b.m.has(k)) return false; return true; }
      if (a instanceof PyDeque) return b instanceof PyDeque && this.eq(a.a, b.a);
      if (a instanceof PyObj) { const m = this.findAttr(a.cls, '__eq__'); if (m) return this.truth(this.call(m, [a, b])); }
      return false;
    }
    cmp(a, b, op) {
      if (isNumLike(a) && isNumLike(b)) { const x = toNum(a), y = toNum(b); return x < y ? -1 : (x > y ? 1 : (x === y ? 0 : NaN)); }
      if (typeof a === 'string' && typeof b === 'string') return a < b ? -1 : (a > b ? 1 : 0);
      if (Array.isArray(a) && Array.isArray(b)) return this.seqCmp(a, b, op);
      if (a instanceof PyTuple && b instanceof PyTuple) return this.seqCmp(a.a, b.a, op);
      if (a instanceof PyObj) {
        const nm = { '<': '__lt__', '>': '__gt__', '<=': '__le__', '>=': '__ge__' }[op];
        const m = nm && this.findAttr(a.cls, nm);
        if (m) { const r = this.truth(this.call(m, [a, b])); return op === '<' || op === '<=' ? (r ? -1 : 1) : (r ? 1 : -1); }
      }
      throw this.mkExc('TypeError', "'" + op + "' not supported between instances of '" + this.tname(a) + "' and '" + this.tname(b) + "'");
    }
    seqCmp(a, b, op) {
      const n = Math.min(a.length, b.length);
      for (let i = 0; i < n; i++) { if (!this.eq(a[i], b[i])) return this.cmp(a[i], b[i], op); }
      return a.length < b.length ? -1 : (a.length > b.length ? 1 : 0);
    }
    truth(v) {
      if (v === null || v === false) return false; if (v === true) return true;
      switch (typeof v) { case 'number': return v !== 0; case 'string': return v.length > 0; }
      if (v instanceof PyFloat) return v.v !== 0;
      if (Array.isArray(v)) return v.length > 0;
      if (v instanceof PyTuple || v instanceof PyDeque) return v.a.length > 0;
      if (v instanceof PyDict || v instanceof PySet) return v.m.size > 0;
      if (v instanceof PyRange) return v.length > 0;
      if (v instanceof PyObj) {
        let m = this.findAttr(v.cls, '__bool__'); if (m) return this.truth(this.call(m, [v]));
        m = this.findAttr(v.cls, '__len__'); if (m) return this.truth(this.call(m, [v]));
      }
      return true;
    }
    contains(c, x) {
      if (typeof c === 'string') { if (typeof x !== 'string') throw this.mkExc('TypeError', "'in <string>' requires string as left operand, not " + this.tname(x)); this.costo(c.length); return c.includes(x); }
      if (Array.isArray(c)) { if (this.cargaOculta) { const i = c.findIndex(y => this.eq(x, y)); this.costo(i < 0 ? c.length : i + 1); return i >= 0; } return c.some(y => this.eq(x, y)); }
      if (c instanceof PyTuple || c instanceof PyDeque) { this.costo(c.a.length); return c.a.some(y => this.eq(x, y)); }
      if (c instanceof PyDict) return c.m.has(this.hk(x));
      if (c instanceof PySet) return c.m.has(this.hk(x));
      if (c instanceof PyRange) { if (!isIntLike(x)) return false; const v = toNum(x); const d = v - c.s; return (c.st > 0 ? v >= c.s && v < c.e : v <= c.s && v > c.e) && d % c.st === 0; }
      if (c instanceof PyObj) { const m = this.findAttr(c.cls, '__contains__'); if (m) return this.truth(this.call(m, [c, x])); }
      throw this.mkExc('TypeError', "argument of type '" + this.tname(c) + "' is not iterable");
    }

    /* ---------- repr / str ---------- */
    repr(v, d) {
      d = d || 0; if (d > 12) return '...';
      if (v === null) return 'None'; if (v === true) return 'True'; if (v === false) return 'False';
      if (typeof v === 'number') return Number.isInteger(v) ? String(v) : reprFloat(v);
      if (v instanceof PyFloat) return reprFloat(v.v);
      if (typeof v === 'string') return reprStr(v);
      if (Array.isArray(v)) return '[' + v.map(x => this.repr(x, d + 1)).join(', ') + ']';
      if (v instanceof PyTuple) return v.a.length === 1 ? '(' + this.repr(v.a[0], d + 1) + ',)' : '(' + v.a.map(x => this.repr(x, d + 1)).join(', ') + ')';
      if (v instanceof PyDict) return '{' + Array.from(v.m.values()).map(([k, x]) => this.repr(k, d + 1) + ': ' + this.repr(x, d + 1)).join(', ') + '}';
      if (v instanceof PySet) return v.m.size ? '{' + Array.from(v.m.values()).map(x => this.repr(x, d + 1)).join(', ') + '}' : 'set()';
      if (v instanceof PyDeque) return 'deque([' + v.a.map(x => this.repr(x, d + 1)).join(', ') + '])';
      if (v instanceof PyRange) return 'range(' + v.s + ', ' + v.e + (v.st !== 1 ? ', ' + v.st : '') + ')';
      if (v instanceof PyFunc) return '<function ' + v.name + '>';
      if (v instanceof PyBuiltin) return v.pytype ? "<class '" + v.pytype + "'>" : '<built-in function ' + v.name + '>';
      if (v instanceof PyClass) return "<class '__main__." + v.name + "'>";
      if (v instanceof PyBound) return '<bound method ' + (v.fn.name || '') + '>';
      if (v instanceof PyModule) return "<module '" + v.name + "'>";
      if (v instanceof PyObj) {
        const m = this.findAttr(v.cls, '__repr__');
        if (m) return this.str(this.call(m, [v]));
        if (this.isSub(v.cls, this.builtins.get('BaseException'))) { const a = v.attrs.get('args'); return v.cls.name + '(' + (a ? a.a.map(x => this.repr(x)).join(', ') : '') + ')'; }
        if (!v.__id) v.__id = ++this.idc;
        return '<__main__.' + v.cls.name + ' object at 0x7f' + (0x1000 + v.__id * 16).toString(16).padStart(8, '0') + '>';
      }
      return String(v);
    }
    str(v) {
      if (typeof v === 'string') return v;
      if (v instanceof PyObj) {
        const m = this.findAttr(v.cls, '__str__');
        if (m) return this.str(this.call(m, [v]));
        if (this.isSub(v.cls, this.builtins.get('BaseException'))) {
          const a = v.attrs.get('args');
          if (!a || !a.a.length) return '';
          if (a.a.length === 1) return v.cls.name === 'KeyError' || this.isSub(v.cls, this.builtins.get('KeyError')) ? this.repr(a.a[0]) : this.str(a.a[0]);
          return this.repr(a);
        }
      }
      return this.repr(v);
    }
    fmtSpec(v, spec) {
      if (!spec) return this.str(v);
      const m = /^(?:(.)?([<>^=]))?([+\- ])?(#)?(0)?(\d+)?(,)?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/.exec(spec);
      if (!m) throw this.mkExc('ValueError', 'Invalid format specifier');
      let [, fill, align, sign, alt, zero, width, comma, prec, type] = m;
      const isNum = isNumLike(v) && typeof v !== 'boolean';
      let s, neg = false;
      if (isNum && type !== 's') {
        let x = toNum(v);
        if (type === 'd' || type === 'n') { if (isFl(v)) throw this.mkExc('ValueError', "Unknown format code 'd' for object of type 'float'"); }
        neg = x < 0 || Object.is(x, -0); const ax = Math.abs(x);
        if (type === 'f' || type === 'F') s = ax.toFixed(prec === undefined ? 6 : +prec);
        else if (type === 'e' || type === 'E') { s = ax.toExponential(prec === undefined ? 6 : +prec).replace(/e([+-])(\d)$/, 'e$10$2'); if (type === 'E') s = s.toUpperCase(); }
        else if (type === '%') s = (ax * 100).toFixed(prec === undefined ? 6 : +prec) + '%';
        else if (type === 'x') s = Math.floor(ax).toString(16); else if (type === 'X') s = Math.floor(ax).toString(16).toUpperCase();
        else if (type === 'o') s = Math.floor(ax).toString(8); else if (type === 'b') s = Math.floor(ax).toString(2);
        else if (type === 'g' || type === 'G') s = String(+ax.toPrecision(prec === undefined ? 6 : (+prec || 1)));
        else if (type === 'd' || type === 'n' || (!type && isIntLike(v))) s = String(ax);
        else s = prec !== undefined ? String(+ax.toPrecision(+prec || 1)) : (v instanceof PyFloat ? reprFloat(ax) : this.repr(ax));
        if (comma) { const [ip, fp] = s.split('.'); s = groupDigits(ip) + (fp !== undefined ? '.' + fp : ''); }
        s = (neg ? '-' : (sign === '+' ? '+' : (sign === ' ' ? ' ' : ''))) + s;
        if (zero && !align) { align = '='; fill = '0'; }
        if (!align) align = '>';
      } else {
        s = this.str(v); if (prec !== undefined) s = s.slice(0, +prec);
        if (!align) align = '<';
        if (zero && !align) { fill = '0'; }
      }
      const w = width ? +width : 0;
      if (s.length >= w) return s;
      const pad = w - s.length; fill = fill || ' ';
      if (align === '<') return s + fill.repeat(pad);
      if (align === '>') return fill.repeat(pad) + s;
      if (align === '^') { const l = Math.floor(pad / 2); return fill.repeat(l) + s + fill.repeat(pad - l); }
      if (align === '=') { const sg = /^[+\- ]/.test(s) ? s[0] : ''; return sg + fill.repeat(pad) + s.slice(sg.length); }
      return s;
    }
    fstr(parts, scope) {
      let out = '';
      for (const p of parts) {
        if (p.s !== undefined) { out += p.s; continue; }
        let v = this.eval(p.e, scope);
        if (p.conv === 'r') v = this.repr(v); else if (p.conv === 's') v = this.str(v);
        const spec = p.spec ? this.fstr(p.spec, scope) : '';
        out += this.fmtSpec(v, spec);
      }
      return out;
    }

    /* ---------- iteración y secuencias ---------- */
    iterOf(v) {
      if (Array.isArray(v)) return (function* () { for (let i = 0; i < v.length; i++) yield v[i]; })();
      if (v instanceof PyTuple) return v.a;
      if (typeof v === 'string') return Array.from(v);
      if (v instanceof PyDict) return Array.from(v.m.values()).map(kv => kv[0]);
      if (v instanceof PySet) return Array.from(v.m.values());
      if (v instanceof PyDeque) return v.a.slice();
      if (v instanceof PyRange) return (function* () { if (v.st > 0) for (let i = v.s; i < v.e; i += v.st) yield i; else for (let i = v.s; i > v.e; i += v.st) yield i; })();
      if (v instanceof PyObj) {
        const m = this.findAttr(v.cls, '__iter__');
        if (m) { const it = this.call(m, [v]); if (Array.isArray(it) || it instanceof PyTuple) return this.iterOf(it); throw new PyUnsupported('Los iteradores/generadores propios (__iter__/__next__/yield) no están soportados'); }
      }
      throw this.mkExc('TypeError', "'" + this.tname(v) + "' object is not iterable");
    }
    toList(v) { return Array.isArray(v) ? v.slice() : Array.from(this.iterOf(v)); }
    sliceIdx(len, lo, hi, st) {
      const ints = [lo, hi, st];
      for (const x of ints) if (x !== null && !isIntLike(x)) throw this.mkExc('TypeError', 'slice indices must be integers or None');
      st = st === null ? 1 : toNum(st);
      if (st === 0) throw this.mkExc('ValueError', 'slice step cannot be zero');
      const idx = [];
      let a, b;
      if (st > 0) {
        a = lo === null ? 0 : toNum(lo); b = hi === null ? len : toNum(hi);
        if (a < 0) a = Math.max(0, a + len); else a = Math.min(a, len);
        if (b < 0) b = Math.max(0, b + len); else b = Math.min(b, len);
        for (let i = a; i < b; i += st) idx.push(i);
      } else {
        a = lo === null ? len - 1 : toNum(lo); b = hi === null ? -1 : toNum(hi);
        if (lo !== null) { if (a < 0) a = Math.max(-1, a + len); else a = Math.min(a, len - 1); }
        if (hi !== null) { if (b < 0) b = Math.max(-1, b + len); else b = Math.min(b, len - 1); }
        for (let i = a; i > b; i += st) idx.push(i);
      }
      return idx;
    }
    getItem(o, k) {
      if (k && k.__slice) {
        const sl = k;
        if (Array.isArray(o)) { const ix = this.sliceIdx(o.length, sl.lo, sl.hi, sl.st); this.costo(ix.length); return ix.map(i => o[i]); }
        if (typeof o === 'string') { const ix = this.sliceIdx(o.length, sl.lo, sl.hi, sl.st); this.costo(ix.length); return ix.map(i => o[i]).join(''); }
        if (o instanceof PyTuple) { const ix = this.sliceIdx(o.a.length, sl.lo, sl.hi, sl.st); this.costo(ix.length); return new PyTuple(ix.map(i => o.a[i])); }
        throw this.mkExc('TypeError', "'" + this.tname(o) + "' object is not subscriptable");
      }
      if (Array.isArray(o) || typeof o === 'string' || o instanceof PyTuple || o instanceof PyDeque || o instanceof PyRange) {
        if (!isIntLike(k)) throw this.mkExc('TypeError', (Array.isArray(o) ? 'list' : this.tname(o)) + ' indices must be integers or slices, not ' + this.tname(k));
        let i = toNum(k);
        if (o instanceof PyRange) { const n = o.length; if (i < 0) i += n; if (i < 0 || i >= n) throw this.mkExc('IndexError', 'range object index out of range'); return o.s + i * o.st; }
        const arr = (o instanceof PyTuple || o instanceof PyDeque) ? o.a : o;
        if (i < 0) i += arr.length;
        if (i < 0 || i >= arr.length) throw this.mkExc('IndexError', (typeof o === 'string' ? 'string' : (o instanceof PyTuple ? 'tuple' : (o instanceof PyDeque ? 'deque' : 'list'))) + ' index out of range');
        return arr[i];
      }
      if (o instanceof PyDict) {
        const key = this.hk(k); const kv = o.m.get(key);
        if (kv) return kv[1];
        if (o.dflt) { const v = this.call(o.dflt, []); o.m.set(key, [k, v]); return v; }
        throw this.mkExc('KeyError', k);
      }
      if (o instanceof PyObj) { const m = this.findAttr(o.cls, '__getitem__'); if (m) return this.call(m, [o, k]); }
      throw this.mkExc('TypeError', "'" + this.tname(o) + "' object is not subscriptable");
    }
    setItem(o, k, v) {
      if (Array.isArray(o) || o instanceof PyDeque) {
        if (k && k.__slice) {
          const arr = Array.isArray(o) ? o : o.a;
          const vals = this.toList(v);
          if (k.st === null || toNum(k.st) === 1) {
            const idx = this.sliceIdx(arr.length, k.lo, k.hi, null);
            const a = idx.length ? idx[0] : (k.lo === null ? 0 : Math.min(arr.length, Math.max(0, toNum(k.lo) < 0 ? toNum(k.lo) + arr.length : toNum(k.lo))));
            arr.splice(a, idx.length, ...vals); return;
          }
          throw new PyUnsupported('Asignación a slices con paso no soportada');
        }
        if (!isIntLike(k)) throw this.mkExc('TypeError', 'list indices must be integers or slices, not ' + this.tname(k));
        const arr = Array.isArray(o) ? o : o.a; let i = toNum(k);
        if (i < 0) i += arr.length;
        if (i < 0 || i >= arr.length) throw this.mkExc('IndexError', 'list assignment index out of range');
        arr[i] = v; return;
      }
      if (o instanceof PyDict) { o.m.set(this.hk(k), [k, v]); return; }
      if (o instanceof PyObj) { const m = this.findAttr(o.cls, '__setitem__'); if (m) { this.call(m, [o, k, v]); return; } }
      throw this.mkExc('TypeError', "'" + this.tname(o) + "' object does not support item assignment");
    }
    delItem(o, k) {
      if (Array.isArray(o)) { let i = toNum(k); if (i < 0) i += o.length; if (i < 0 || i >= o.length) throw this.mkExc('IndexError', 'list assignment index out of range'); o.splice(i, 1); return; }
      if (o instanceof PyDict) { const key = this.hk(k); if (!o.m.has(key)) throw this.mkExc('KeyError', k); o.m.delete(key); return; }
      throw this.mkExc('TypeError', "'" + this.tname(o) + "' object doesn't support item deletion");
    }

    /* ---------- atributos ---------- */
    getAttr(o, name) {
      if (o instanceof PyObj) {
        if (o.attrs.has(name)) return o.attrs.get(name);
        const v = this.findAttr(o.cls, name);
        if (v !== undefined) {
          if (v instanceof PyFunc) return new PyBound(o, v);
          if (v instanceof PyBuiltin && !v.pytype) return new PyBound(o, v);
          if (v instanceof PyStatic) return v.fn;
          if (v instanceof PyClassM) return new PyBound(o.cls, v.fn);
          return v;
        }
        throw this.mkExc('AttributeError', "'" + o.cls.name + "' object has no attribute '" + name + "'");
      }
      if (o instanceof PyClass) {
        const v = this.findAttr(o, name);
        if (v !== undefined) { if (v instanceof PyStatic) return v.fn; if (v instanceof PyClassM) return new PyBound(o, v.fn); return v; }
        if (name === '__name__') return o.name;
        throw this.mkExc('AttributeError', "type object '" + o.name + "' has no attribute '" + name + "'");
      }
      if (o instanceof PyModule) { if (o.attrs.has(name)) return o.attrs.get(name); throw this.mkExc('AttributeError', "module '" + o.name + "' has no attribute '" + name + "'"); }
      if (o instanceof PySuper) {
        const mro = this.mro(o.obj instanceof PyObj ? o.obj.cls : o.obj); const i = mro.indexOf(o.start);
        for (let j = i + 1; j < mro.length; j++) if (mro[j].attrs.has(name)) { const v = mro[j].attrs.get(name); return (v instanceof PyFunc || (v instanceof PyBuiltin && !v.pytype)) ? new PyBound(o.obj, v) : v; }
        throw this.mkExc('AttributeError', "'super' object has no attribute '" + name + "'");
      }
      if (o instanceof PyFunc || o instanceof PyBuiltin) {
        if (name === '__name__') return o.name;
        if (o.extra && o.extra[name]) return o.extra[name];
      }
      const tbl = this.methodsFor(o);
      if (tbl && tbl[name]) { const fn = tbl[name]; return new PyBuiltin(name, (args, kw) => fn.call(this, o, args, kw)); }
      if (o instanceof PyFloat || typeof o === 'number') { if (name === 'real') return o; if (name === 'is_integer') return new PyBuiltin(name, () => Number.isInteger(toNum(o))); }
      throw this.mkExc('AttributeError', "'" + this.tname(o) + "' object has no attribute '" + name + "'");
    }
    setAttr(o, name, v) {
      if (o instanceof PyObj) { o.attrs.set(name, v); if (this.onSet !== null) this.onSet(o, name, v); return; }
      if (o instanceof PyClass) { o.attrs.set(name, v); return; }
      if (o instanceof PyFunc || o instanceof PyBuiltin) { (o.extra = o.extra || {})[name] = v; return; }
      throw this.mkExc('AttributeError', "'" + this.tname(o) + "' object has no attribute '" + name + "' (no se puede asignar)");
    }

    /* ---------- llamadas ---------- */
    call(f, args, kw) {
      if (f instanceof PyFunc) return this.callFunc(f, args, kw);
      if (f instanceof PyBound) return this.call(f.fn, [f.self].concat(args), kw);
      if (f instanceof PyBuiltin) return f.fn(args, kw || null);
      if (f instanceof PyClass) return this.instantiate(f, args, kw);
      if (f instanceof PyObj) { const m = this.findAttr(f.cls, '__call__'); if (m) return this.call(m, [f].concat(args), kw); }
      throw this.mkExc('TypeError', "'" + this.tname(f) + "' object is not callable");
    }
    /** nombres de métodos abstractos (@abstractmethod) sin implementar, solo para clases que heredan de abc.ABC */
    abstractos(cls) {
      if (!this._ABC || !this.mro(cls).includes(this._ABC)) return [];
      const nombres = new Set();
      for (const c of this.mro(cls)) for (const [k, v] of c.attrs) if (v instanceof PyFunc && v.abstract) nombres.add(k);
      return [...nombres].filter(k => { const r = this.findAttr(cls, k); return r instanceof PyFunc && r.abstract; }).sort();
    }
    instantiate(cls, args, kw) {
      const abs = this.abstractos(cls);
      if (abs.length) throw this.mkExc('TypeError', "Can't instantiate abstract class " + cls.name + ' without an implementation for abstract method' + (abs.length > 1 ? 's ' : ' ') + abs.map(n => "'" + n + "'").join(', '));
      const obj = new PyObj(cls);
      if (this.onNew !== null) this.onNew(obj);
      const init = this.findAttr(cls, '__init__');
      if (init) { const r = this.call(init, [obj].concat(args), kw); if (r !== null && r !== undefined) throw this.mkExc('TypeError', '__init__() should return None, not ' + this.tname(r)); }
      else if (args.length || (kw && Object.keys(kw).length)) throw this.mkExc('TypeError', cls.name + '() takes no arguments');
      return obj;
    }
    bindArgs(f, args, kw) {
      const scope = new Scope(f.closure);
      if (f.globalNames) scope.globals = f.globalNames;
      if (f.nonlocalNames) scope.nonlocals = f.nonlocalNames;
      scope.fn = f;
      const ps = f.params; let ai = 0; const used = kw ? new Set() : null;
      let npos = 0; for (const p of ps) if (p.kind === 'pos') npos++;
      let hasStar = false, dstar = null;
      for (let pi = 0; pi < ps.length; pi++) {
        const p = ps[pi];
        if (p.kind === 'pos') {
          let v;
          if (ai < args.length) v = args[ai++];
          else if (kw && Object.prototype.hasOwnProperty.call(kw, p.name)) { v = kw[p.name]; used.add(p.name); }
          else if (f.defaults[pi] !== undefined) v = f.defaults[pi];
          else throw this.mkExc('TypeError', f.name + "() missing 1 required positional argument: '" + p.name + "'");
          scope.vars.set(p.name, v);
        } else if (p.kind === 'star') { hasStar = true; scope.vars.set(p.name, new PyTuple(args.slice(ai))); ai = args.length; }
        else dstar = p;
      }
      if (ai < args.length) throw this.mkExc('TypeError', f.name + '() takes ' + npos + ' positional argument' + (npos === 1 ? '' : 's') + ' but ' + args.length + (args.length === 1 ? ' was' : ' were') + ' given');
      if (kw) {
        const rest = new PyDict();
        for (const k in kw) if (!used.has(k)) {
          if (dstar) rest.m.set('s' + k, [k, kw[k]]);
          else throw this.mkExc('TypeError', f.name + "() got an unexpected keyword argument '" + k + "'");
        }
        if (dstar) scope.vars.set(dstar.name, rest);
      } else if (dstar) scope.vars.set(dstar.name, new PyDict());
      return scope;
    }
    callFunc(f, args, kw) {
      this.depth++;
      const savedFile = this.file, savedLine = this.line;
      let fr = null;
      try {
        if (this.depth > this.maxDepth) throw this.mkExc('RecursionError', 'maximum recursion depth exceeded');
        this.tick();
        const scope = this.bindArgs(f, args, kw);
        this.calls[f.name] = (this.calls[f.name] || 0) + 1;
        if (this.onCall !== null && f.file === 'codigo' && !f.isLambda) {   // marco de pila para el depurador
          fr = { f, scope, fid: ++this.frameN, depth: this.depth, lineaLlamada: savedLine }; scope.fid = fr.fid;
          this.stack.push(fr); this.onCall(fr, args);
        }
        this.file = f.file;
        let tr = null;
        if (this.trace && f.file === 'codigo' && !f.isLambda && this.trace.length < this.traceMax) {
          tr = { tipo: 'call', nombre: f.name, args: args.map(a => this.repr(a)).join(', '), depth: this.depth };
          this.trace.push(tr);
        }
        let ret = null;
        if (f.isLambda) ret = this.eval(f.body, scope);
        else { const r = this.execBlock(f.body, scope); if (r && r.t === 'return') ret = r.v; }
        if (tr && this.trace.length < this.traceMax + 1) this.trace.push({ tipo: 'ret', nombre: f.name, valor: this.repr(ret), depth: this.depth });
        if (fr !== null && this.onRet !== null) this.onRet(fr, ret);
        return ret;
      } finally { if (fr !== null) this.stack.pop(); this.depth--; this.file = savedFile; this.line = savedLine; }
    }

    /* ---------- aritmética ---------- */
    arith(op, a, b) {
      if (op === '+') {
        if (typeof a === 'string' && typeof b === 'string') return a + b;
        if (Array.isArray(a) && Array.isArray(b)) { this.costo(a.length + b.length); return a.concat(b); }
        if (a instanceof PyTuple && b instanceof PyTuple) { this.costo(a.a.length + b.a.length); return new PyTuple(a.a.concat(b.a)); }
      } else if (op === '*') {
        if ((typeof a === 'string' || Array.isArray(a) || a instanceof PyTuple) && isIntLike(b)) return this.rep(a, toNum(b));
        if (isIntLike(a) && (typeof b === 'string' || Array.isArray(b) || b instanceof PyTuple)) return this.rep(b, toNum(a));
      } else if (op === '%' && typeof a === 'string') {
        return this.pctFormat(a, b);
      } else if ((op === '|' || op === '&' || op === '-' || op === '^') && a instanceof PySet && b instanceof PySet) {
        const r = new PySet();
        if (op === '|') { for (const [k, v] of a.m) r.m.set(k, v); for (const [k, v] of b.m) r.m.set(k, v); }
        else if (op === '&') { for (const [k, v] of a.m) if (b.m.has(k)) r.m.set(k, v); }
        else if (op === '-') { for (const [k, v] of a.m) if (!b.m.has(k)) r.m.set(k, v); }
        else { for (const [k, v] of a.m) if (!b.m.has(k)) r.m.set(k, v); for (const [k, v] of b.m) if (!a.m.has(k)) r.m.set(k, v); }
        return r;
      }
      if (a instanceof PyObj) {
        const nm = { '+': '__add__', '-': '__sub__', '*': '__mul__', '/': '__truediv__', '//': '__floordiv__', '%': '__mod__' }[op];
        const m = nm && this.findAttr(a.cls, nm); if (m) return this.call(m, [a, b]);
      }
      if (!isNumLike(a) || !isNumLike(b)) {
        if (op === '+' && typeof a === 'string') throw this.mkExc('TypeError', 'can only concatenate str (not "' + this.tname(b) + '") to str');
        if (op === '+' && Array.isArray(a)) throw this.mkExc('TypeError', 'can only concatenate list (not "' + this.tname(b) + '") to list');
        throw this.mkExc('TypeError', 'unsupported operand type(s) for ' + op + ": '" + this.tname(a) + "' and '" + this.tname(b) + "'");
      }
      const x = toNum(a), y = toNum(b), fl = isFl(a) || isFl(b);
      let r;
      switch (op) {
        case '+': r = x + y; break;
        case '-': r = x - y; break;
        case '*': r = x * y; break;
        case '/': if (y === 0) throw this.mkExc('ZeroDivisionError', 'division by zero'); return mkF(x / y);
        case '//': if (y === 0) throw this.mkExc('ZeroDivisionError', fl ? 'float floor division by zero' : 'integer division or modulo by zero'); r = Math.floor(x / y); break;
        case '%': if (y === 0) throw this.mkExc('ZeroDivisionError', fl ? 'float modulo' : 'integer division or modulo by zero'); r = x - y * Math.floor(x / y); if (!fl) r = ((x % y) + y) % y; break;
        case '**':
          if (!fl && y >= 0) { r = Math.pow(x, y); break; }
          if (x === 0 && y < 0) throw this.mkExc('ZeroDivisionError', '0.0 cannot be raised to a negative power');
          return mkF(Math.pow(x, y));
        case '&': case '|': case '^': case '<<': case '>>':
          if (fl) throw this.mkExc('TypeError', 'unsupported operand type(s) for ' + op + ": 'float' and 'int'");
          r = op === '&' ? (x & y) : op === '|' ? (x | y) : op === '^' ? (x ^ y) : op === '<<' ? x * Math.pow(2, y) : Math.floor(x / Math.pow(2, y)); break;
        default: throw new PyUnsupported('Operador no soportado: ' + op);
      }
      if (!fl && (r > MAXI || r < -MAXI)) throw new PyLimit('Entero demasiado grande: este intérprete usa precisión de 53 bits (Python real tiene enteros ilimitados)');
      return fl ? mkF(r) : r;
    }
    rep(s, n) {
      if (n <= 0) return typeof s === 'string' ? '' : (Array.isArray(s) ? [] : new PyTuple([]));
      if (typeof s === 'string') return s.repeat(n);
      if (Array.isArray(s)) { let out = []; for (let i = 0; i < n; i++) out = out.concat(s); return out; }
      let out = []; for (let i = 0; i < n; i++) out = out.concat(s.a); return new PyTuple(out);
    }
    pctFormat(fmt, args) {
      const list = args instanceof PyTuple ? args.a : [args]; let i = 0;
      return fmt.replace(/%([-+0 ]*)(\d+)?(?:\.(\d+))?([sdifrx%])/g, (m, fl, w, pr, t) => {
        if (t === '%') return '%';
        if (i >= list.length) throw this.mkExc('TypeError', 'not enough arguments for format string');
        const v = list[i++]; let s;
        if (t === 's') s = this.str(v); else if (t === 'r') s = this.repr(v);
        else if (t === 'd' || t === 'i') s = String(Math.trunc(toNum(v)));
        else if (t === 'f') s = toNum(v).toFixed(pr === undefined ? 6 : +pr);
        else s = Math.trunc(toNum(v)).toString(16);
        if (w) s = fl.includes('-') ? s.padEnd(+w) : s.padStart(+w, fl.includes('0') ? '0' : ' ');
        return s;
      });
    }
    binop(op, a, b) { return this.arith(op, a, b); }

    /* ===================== evaluación de expresiones ===================== */
    lookup(scope, name) {
      for (let s = scope; s; s = s.parent) { const v = s.vars.get(name); if (v !== undefined) return v; }
      const v = this.builtins.get(name);
      if (v !== undefined) return v;
      throw this.mkExc('NameError', "name '" + name + "' is not defined");
    }
    assignName(scope, name, v) {
      if (scope.globals && scope.globals.has(name)) { this.globalScope.vars.set(name, v); return; }
      if (scope.nonlocals && scope.nonlocals.has(name)) {
        for (let s = scope.parent; s && s !== this.globalScope; s = s.parent) if (s.vars.has(name)) { s.vars.set(name, v); return; }
        throw new P.PySyntaxError("no hay una variable '" + name + "' en el ámbito exterior para 'nonlocal'", this.line);
      }
      scope.vars.set(name, v);
    }
    evalIndex(n, scope) {
      if (n.k === 'Slice') return { __slice: true, lo: n.lo ? this.eval(n.lo, scope) : null, hi: n.hi ? this.eval(n.hi, scope) : null, st: n.st ? this.eval(n.st, scope) : null };
      return this.eval(n, scope);
    }
    eval(n, scope) {
      switch (n.k) {
        case 'Num': return n.isFloat ? mkF(n.v) : n.v;
        case 'Str': return n.v;
        case 'Const': return n.v;
        case 'Name': {
          for (let s = scope; s; s = s.parent) { const v = s.vars.get(n.id); if (v !== undefined) return v; }
          this.line = n.line; return this.lookup(scope, n.id);
        }
        case 'BinOp': { const a = this.eval(n.l, scope), b = this.eval(n.r, scope); this.line = n.line; return this.arith(n.op, a, b); }
        case 'Compare': return this.evalCompare(n, scope);
        case 'BoolOp': {
          let v;
          if (n.op === 'and') { for (const x of n.vals) { v = this.eval(x, scope); if (!this.truth(v)) return v; } return v; }
          for (const x of n.vals) { v = this.eval(x, scope); if (this.truth(v)) return v; } return v;
        }
        case 'UnaryOp': {
          const v = this.eval(n.x, scope);
          this.line = n.line;
          if (n.op === 'not') return !this.truth(v);
          if (!isNumLike(v)) {
            if (v instanceof PyObj && n.op === '-') { const m = this.findAttr(v.cls, '__neg__'); if (m) return this.call(m, [v]); }
            throw this.mkExc('TypeError', "bad operand type for unary " + n.op + ": '" + this.tname(v) + "'");
          }
          const x = toNum(v);
          if (n.op === '-') return v instanceof PyFloat ? new PyFloat(-x) : -x;
          if (n.op === '+') return typeof v === 'boolean' ? x : v;
          return ~x;
        }
        case 'Call': return this.evalCall(n, scope);
        case 'Attr': { const o = this.eval(n.x, scope); this.line = n.line; return this.getAttr(o, n.name); }
        case 'Sub': { const o = this.eval(n.x, scope); const k = this.evalIndex(n.idx, scope); this.line = n.line; return this.getItem(o, k); }
        case 'IfExp': return this.truth(this.eval(n.test, scope)) ? this.eval(n.body, scope) : this.eval(n.orelse, scope);
        case 'List': return this.evalSeq(n.elts, scope);
        case 'Tuple': return new PyTuple(this.evalSeq(n.elts, scope));
        case 'Set': { const s = new PySet(); for (const x of this.evalSeq(n.elts, scope)) s.m.set(this.hk(x), x); return s; }
        case 'Dict': {
          const d = new PyDict();
          for (let i = 0; i < n.keys.length; i++) {
            if (n.keys[i] === null) { const o = this.eval(n.vals[i], scope); if (o instanceof PyDict) for (const [k, kv] of o.m) d.m.set(k, kv); continue; }
            const k = this.eval(n.keys[i], scope); d.m.set(this.hk(k), [k, this.eval(n.vals[i], scope)]);
          }
          return d;
        }
        case 'FStr': return this.fstr(n.parts, scope);
        case 'ListComp': case 'GenExp': { const out = []; this.comp(n.gens, 0, scope, new Scope(scope), s => out.push(this.eval(n.elt, s))); return out; }
        case 'SetComp': { const st = new PySet(); this.comp(n.gens, 0, scope, new Scope(scope), s => { const v = this.eval(n.elt, s); st.m.set(this.hk(v), v); }); return st; }
        case 'DictComp': { const d = new PyDict(); this.comp(n.gens, 0, scope, new Scope(scope), s => { const k = this.eval(n.key, s); d.m.set(this.hk(k), [k, this.eval(n.val, s)]); }); return d; }
        case 'Lambda': {
          const defaults = n.params.map(p => p.def ? this.eval(p.def, scope) : undefined);
          const f = new PyFunc('<lambda>', n.params, n.body, scope, defaults, this.file); f.isLambda = true; return f;
        }
        case 'Starred': throw new P.PySyntaxError('el operador * no se puede usar aquí', n.line);
        case 'Slice': throw new P.PySyntaxError('slice fuera de un índice', n.line);
      }
      throw new PyUnsupported('Expresión no soportada: ' + n.k);
    }
    evalSeq(elts, scope) {
      const out = [];
      for (const e of elts) {
        if (e.k === 'Starred') { for (const x of this.iterOf(this.eval(e.x, scope))) out.push(x); }
        else out.push(this.eval(e, scope));
      }
      return out;
    }
    comp(gens, gi, outer, scope, emit) {
      if (gi === gens.length) { emit(scope); return; }
      const g = gens[gi];
      const it = this.eval(g.iter, gi === 0 ? outer : scope);
      for (const x of this.iterOf(it)) {
        this.tick();
        this.bindTarget(g.target, x, scope);
        let ok = true;
        for (const c of g.ifs) if (!this.truth(this.eval(c, scope))) { ok = false; break; }
        if (ok) this.comp(gens, gi + 1, outer, scope, emit);
      }
    }
    evalCompare(n, scope) {
      let l = this.eval(n.l, scope);
      for (let i = 0; i < n.ops.length; i++) {
        const r = this.eval(n.rs[i], scope);
        this.line = n.line;
        let res;
        switch (n.ops[i]) {
          case '==': res = this.eq(l, r); break;
          case '!=': res = !this.eq(l, r); break;
          case '<': { const c = this.cmp(l, r, '<'); res = c < 0; break; }
          case '>': { const c = this.cmp(l, r, '>'); res = c > 0; break; }
          case '<=': { const c = this.cmp(l, r, '<='); res = c <= 0; break; }
          case '>=': { const c = this.cmp(l, r, '>='); res = c >= 0; break; }
          case 'in': res = this.contains(r, l); break;
          case 'not in': res = !this.contains(r, l); break;
          case 'is': res = this.isSame(l, r); break;
          case 'is not': res = !this.isSame(l, r); break;
        }
        if (!res) return false;
        l = r;
      }
      return true;
    }
    isSame(a, b) {
      if (a === b) return true;
      if (a instanceof PyFloat && b instanceof PyFloat) return a.v === b.v;
      return false;
    }
    evalCall(n, scope) {
      const fn = n.f;
      if (fn.k === 'Name' && fn.id === 'super' && n.args.length === 0) {
        let s = scope; while (s && !s.fn) s = s.parent;
        const fo = s && s.fn;
        if (!fo || !fo.home) throw this.mkExc('RuntimeError', 'super(): sin clase asociada');
        const first = s.vars.get(fo.params[0].name);
        return new PySuper(first, fo.home);
      }
      const f = this.eval(fn, scope);
      const args = [];
      for (const a of n.args) {
        if (a.k === 'Starred') { for (const x of this.iterOf(this.eval(a.x, scope))) args.push(x); }
        else args.push(this.eval(a, scope));
      }
      let kw = null;
      if (n.kwargs.length) {
        kw = Object.create(null);
        for (const k of n.kwargs) {
          if (k.name === null) { const d = this.eval(k.v, scope); if (d instanceof PyDict) for (const [, kv] of d.m) kw[kv[0]] = kv[1]; }
          else kw[k.name] = this.eval(k.v, scope);
        }
      }
      this.line = n.line;
      return this.call(f, args, kw);
    }

    /* ===================== ejecución de sentencias ===================== */
    bindTarget(t, v, scope) {
      switch (t.k) {
        case 'Name': this.assignName(scope, t.id, v); return;
        case 'Attr': this.setAttr(this.eval(t.x, scope), t.name, v); return;
        case 'Sub': { const o = this.eval(t.x, scope); const k = this.evalIndex(t.idx, scope); this.line = t.line; this.setItem(o, k, v); return; }
        case 'Tuple': case 'List': {
          const vals = this.toList(v);
          const si = t.elts.findIndex(e => e.k === 'Starred');
          if (si < 0) {
            if (vals.length !== t.elts.length) throw this.mkExc('ValueError', vals.length > t.elts.length ? 'too many values to unpack (expected ' + t.elts.length + ')' : 'not enough values to unpack (expected ' + t.elts.length + ', got ' + vals.length + ')');
            for (let i = 0; i < vals.length; i++) this.bindTarget(t.elts[i], vals[i], scope);
          } else {
            const after = t.elts.length - si - 1;
            for (let i = 0; i < si; i++) this.bindTarget(t.elts[i], vals[i], scope);
            this.bindTarget(t.elts[si].x, vals.slice(si, vals.length - after), scope);
            for (let i = 0; i < after; i++) this.bindTarget(t.elts[si + 1 + i], vals[vals.length - after + i], scope);
          }
          return;
        }
      }
      throw new P.PySyntaxError('destino de asignación no válido', t.line);
    }
    execBlock(stmts, scope) {
      for (let i = 0; i < stmts.length; i++) {
        const r = this.exec(stmts[i], scope);
        if (r !== undefined) return r;
      }
      return undefined;
    }
    declsOf(body, kind, acc) {
      for (const s of body) {
        if (s.k === kind) s.names.forEach(nm => acc.add(nm));
        else if (s.k === 'If' || s.k === 'While' || s.k === 'For') { this.declsOf(s.body, kind, acc); this.declsOf(s.orelse, kind, acc); }
        else if (s.k === 'Try') { this.declsOf(s.body, kind, acc); s.handlers.forEach(h => this.declsOf(h.body, kind, acc)); this.declsOf(s.orelse, kind, acc); this.declsOf(s.finalbody, kind, acc); }
      }
      return acc;
    }
    exec(s, scope) {
      this.tick(); this.line = s.line;
      if (this.onStep !== null && this.file === 'codigo') this.onStep(s, scope, 'sent');
      switch (s.k) {
        case 'ExprStmt': this.eval(s.x, scope); return;
        case 'Assign': {
          const v = this.eval(s.v, scope);
          for (const t of s.targets) this.bindTarget(t, v, scope);
          return;
        }
        case 'AugAssign': {
          const t = s.t;
          const rhs = this.eval(s.v, scope);
          if (t.k === 'Name') {
            const cur = this.lookup(scope, t.id); this.line = s.line;
            this.assignName(scope, t.id, this.augApply(s.op, cur, rhs));
          } else if (t.k === 'Attr') {
            const o = this.eval(t.x, scope); const cur = this.getAttr(o, t.name); this.line = s.line;
            this.setAttr(o, t.name, this.augApply(s.op, cur, rhs));
          } else {
            const o = this.eval(t.x, scope), k = this.evalIndex(t.idx, scope); const cur = this.getItem(o, k); this.line = s.line;
            this.setItem(o, k, this.augApply(s.op, cur, rhs));
          }
          return;
        }
        case 'If': {
          if (this.truth(this.eval(s.test, scope))) return this.execBlock(s.body, scope);
          if (s.orelse.length) return this.execBlock(s.orelse, scope);
          return;
        }
        case 'While': {
          let broke = false, primera = true;
          while (true) {
            if (!primera && this.onStep !== null && this.file === 'codigo') { this.line = s.line; this.onStep(s, scope, 'iter'); }   // cada reevaluación de la condición es un paso
            primera = false;
            if (!this.truth(this.eval(s.test, scope))) break;
            this.tick();
            const r = this.execBlock(s.body, scope);
            if (r !== undefined) { if (r === BRK) { broke = true; break; } if (r === CNT) continue; return r; }
          }
          if (!broke && s.orelse.length) return this.execBlock(s.orelse, scope);
          return;
        }
        case 'For': {
          const it = this.eval(s.iter, scope); let broke = false;
          this.line = s.line;
          for (const x of this.iterOf(it)) {
            this.tick();
            this.bindTarget(s.target, x, scope);
            if (this.onStep !== null && this.file === 'codigo') { this.line = s.line; this.onStep(s, scope, 'iter'); }   // una vuelta del for = un paso con la variable ya actualizada
            const r = this.execBlock(s.body, scope);
            if (r !== undefined) { if (r === BRK) { broke = true; break; } if (r === CNT) continue; return r; }
          }
          if (!broke && s.orelse.length) return this.execBlock(s.orelse, scope);
          return;
        }
        case 'Return': return { t: 'return', v: s.v ? this.eval(s.v, scope) : null };
        case 'Break': return BRK;
        case 'Continue': return CNT;
        case 'Pass': return;
        case 'FuncDef': {
          let cs = scope; while (cs.isClass) cs = cs.parent;
          const defaults = s.params.map(p => p.def ? this.eval(p.def, scope) : undefined);
          let f = new PyFunc(s.name, s.params, s.body, cs, defaults, this.file);
          if (!s._g) { s._g = this.declsOf(s.body, 'Global', new Set()); s._n = this.declsOf(s.body, 'Nonlocal', new Set()); }
          if (s._g.size) f.globalNames = s._g; if (s._n.size) f.nonlocalNames = s._n;
          for (let i = s.decos.length - 1; i >= 0; i--) {
            const d = this.eval(s.decos[i], scope);
            f = this.call(d, [f]);
          }
          this.assignName(scope, s.name, f);
          return;
        }
        case 'ClassDef': {
          const bases = s.bases.map(b => this.eval(b, scope));
          for (const b of bases) if (!(b instanceof PyClass)) throw this.mkExc('TypeError', 'la clase base debe ser una clase');
          const cls = new PyClass(s.name, bases.length ? bases : [this.builtins.get('object')]);
          const cscope = new Scope(scope, true);
          const r = this.execBlock(s.body, cscope);
          for (const [k, v] of cscope.vars) { cls.attrs.set(k, v); if (v instanceof PyFunc) v.home = cls; else if (v instanceof PyStatic || v instanceof PyClassM) v.fn.home = cls; }
          let c = cls;
          for (let i = s.decos.length - 1; i >= 0; i--) c = this.call(this.eval(s.decos[i], scope), [c]);
          this.assignName(scope, s.name, c);
          return;
        }
        case 'Global': case 'Nonlocal': return;
        case 'Import': {
          for (const nm of s.names) {
            const mod = this.importMod(nm.name);
            this.assignName(scope, nm.as || nm.name.split('.')[0], mod);
          }
          return;
        }
        case 'ImportFrom': {
          const mod = this.importMod(s.mod);
          for (const nm of s.names) {
            if (nm.name === '*') { for (const [k, v] of mod.attrs) this.assignName(scope, k, v); continue; }
            if (!mod.attrs.has(nm.name)) throw this.mkExc('ImportError', "cannot import name '" + nm.name + "' from '" + s.mod + "'");
            this.assignName(scope, nm.as || nm.name, mod.attrs.get(nm.name));
          }
          return;
        }
        case 'Assert': {
          if (!this.truth(this.eval(s.test, scope))) throw this.mkExc('AssertionError', s.msg ? this.str(this.eval(s.msg, scope)) : undefined);
          return;
        }
        case 'Raise': {
          if (!s.exc) throw this.mkExc('RuntimeError', 'No active exception to reraise');
          let e = this.eval(s.exc, scope);
          if (e instanceof PyClass) e = this.instantiate(e, [], null);
          if (!(e instanceof PyObj) || !this.isSub(e.cls, this.builtins.get('BaseException'))) throw this.mkExc('TypeError', 'exceptions must derive from BaseException');
          const x = new PyExc(e); x.line = s.line; x.file = this.file; throw x;
        }
        case 'Del': {
          for (const t of s.targets) {
            if (t.k === 'Name') { if (!scope.vars.delete(t.id)) throw this.mkExc('NameError', "name '" + t.id + "' is not defined"); }
            else if (t.k === 'Sub') this.delItem(this.eval(t.x, scope), this.evalIndex(t.idx, scope));
            else throw new PyUnsupported('del solo soporta variables e índices');
          }
          return;
        }
        case 'Try': return this.execTry(s, scope);
      }
      throw new PyUnsupported('Sentencia no soportada: ' + s.k);
    }
    augApply(op, cur, rhs) {
      if (op === '+' && Array.isArray(cur)) { for (const x of this.iterOf(rhs)) cur.push(x); return cur; }
      return this.arith(op, cur, rhs);
    }
    execTry(s, scope) {
      let result;
      try {
        try {
          result = this.execBlock(s.body, scope);
        } catch (e) {
          let ex = e;
          if (e instanceof RangeError) { ex = this.mkExc('RecursionError', 'maximum recursion depth exceeded'); }
          else if (e instanceof P.PySyntaxError) ex = e;
          if (!(ex instanceof PyExc)) throw e;
          const exCls = ex.obj.cls;
          let handled = false;
          for (const h of s.handlers) {
            let match = h.type === null;
            if (!match) {
              const t = this.eval(h.type, scope);
              const list = t instanceof PyTuple ? t.a : [t];
              match = list.some(c => c instanceof PyClass && this.isSub(exCls, c));
            }
            if (match) {
              if (h.name) this.assignName(scope, h.name, ex.obj);
              handled = true;
              result = this.execBlock(h.body, scope);
              break;
            }
          }
          if (!handled) throw ex;
          return result;
        }
        if (s.orelse.length && result === undefined) result = this.execBlock(s.orelse, scope);
        return result;
      } finally {
        if (s.finalbody.length) {
          const fr = this.execBlock(s.finalbody, scope);
          if (fr !== undefined) return fr;
        }
      }
    }

    /* ---------- carga de módulos de código ---------- */
    load(src, fileTag) {
      const ast = P.parseModule(src);
      const prevFile = this.file; this.file = fileTag || 'codigo';
      try {
        const r = this.execBlock(ast.body, this.globalScope);
        return r;
      } finally { this.file = prevFile; }
    }
    evalExpr(src) {
      const e = P.parseExpressionSrc(src);
      return this.eval(e, this.globalScope);
    }

    importMod(name) {
      const mods = this.modules();
      const root = name;
      if (mods[root]) return mods[root];
      throw this.mkExc('ModuleNotFoundError', "No module named '" + name + "' (este intérprete solo incluye math, functools, collections, heapq, copy, abc, time, random, sys)");
    }
  }

  ET.PyCore = { Interp, PyFloat, PyTuple, PyRange, PyDict, PySet, PyDeque, PyFunc, PyBuiltin, PyClass, PyObj, PyBound, PyModule, PySuper, PyStatic, PyClassM, PyExc, PyLimit, PyUnsupported, Scope, isNumLike, toNum, isFl, mkF, isIntLike, EXC_TREE, reprFloat, reprStr, MAXI };
})(typeof window !== 'undefined' ? window : globalThis);
