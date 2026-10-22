/* pybuiltins.js — funciones integradas, métodos de tipos y módulos del intérprete de Python del entrenador */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const C = ET.PyCore;
  const { Interp, PyFloat, PyTuple, PyRange, PyDict, PySet, PyDeque, PyFunc, PyBuiltin, PyClass, PyObj, PyBound, PyModule, PyStatic, PyClassM, PyUnsupported, isNumLike, toNum, isFl, mkF, isIntLike, EXC_TREE } = C;
  const proto = Interp.prototype;

  proto.write = function (s) { if (this.outLen > 200000) return; this.out.push(s); this.outLen += s.length; };

  proto.sortArr = function (arr, keyF, reverse) {
    const rev = reverse !== undefined && reverse !== null && this.truth(reverse);
    keyF = keyF === undefined || keyF === null ? null : keyF;
    this.costo(arr.length * Math.ceil(Math.log2(Math.max(2, arr.length))));
    const dec = arr.map(x => ({ x, k: keyF ? this.call(keyF, [x]) : x }));
    dec.sort((p, q) => { const c = this.cmp(p.k, q.k, '<'); return rev ? -c : c; });
    return dec.map(d => d.x);
  };

  function roundHalfEven(x) {
    const f = Math.floor(x), d = x - f;
    if (d === 0.5) return f % 2 === 0 ? f : f + 1;
    return Math.round(x);
  }
  /** round(x, nd) como Python: usa la expansión decimal exacta del double; empates exactos -> par */
  function roundDigits(x, nd) {
    if (!isFinite(x)) return x;
    if (nd < 0) { const f = Math.pow(10, -nd); return roundHalfEven(x / f) * f; }
    const long = Math.abs(x).toFixed(Math.min(100, nd + 30));
    const tail = long.slice(long.indexOf('.') + 1 + nd);
    let r;
    if (/^50*$/.test(tail)) {                 // empate exacto: mitad al par
      const base = long.slice(0, long.indexOf('.') + 1 + nd);   // truncado
      const last = base.replace('.', '').slice(-1);
      const down = parseFloat(base);
      r = (+last) % 2 === 0 ? down : parseFloat(Math.abs(x).toFixed(nd));
    } else r = parseFloat(Math.abs(x).toFixed(nd));
    return x < 0 ? -r : r;
  }

  proto.isInst = function (v, t) {
    if (t instanceof PyTuple) return t.a.some(x => this.isInst(v, x));
    if (t instanceof PyBuiltin && t.pytype) {
      const tn = this.tname(v);
      if (t.pytype === 'int') return tn === 'int' || tn === 'bool';
      if (t.pytype === 'object') return true;
      return tn === t.pytype;
    }
    if (t instanceof PyClass) {
      if (t.name === 'object') return true;
      if (v instanceof PyObj) return this.isSub(v.cls, t);
      return false;
    }
    throw this.mkExc('TypeError', 'isinstance() arg 2 must be a type, a tuple of types');
  };

  proto.strFormat = function (fmt, args, kw) {
    let auto = 0;
    return fmt.replace(/\{\{|\}\}|\{([^{}:!]*)(?:!([rs]))?(?::([^{}]*))?\}/g, (m, name, conv, spec) => {
      if (m === '{{') return '{'; if (m === '}}') return '}';
      let v;
      if (name === '' || name === undefined) v = args[auto++];
      else if (/^\d+$/.test(name)) v = args[+name];
      else if (kw && name in kw) v = kw[name];
      else throw this.mkExc('KeyError', name);
      if (v === undefined) throw this.mkExc('IndexError', 'Replacement index out of range');
      if (conv === 'r') v = this.repr(v);
      return this.fmtSpec(v, spec || '');
    });
  };

  /* ===================== métodos de tipos ===================== */
  const LIST = {
    append(s, [x]) { s.push(x); return null; },
    extend(s, [x]) { const l = this.toList(x); this.costo(l.length); for (const y of l) s.push(y); return null; },
    insert(s, [i, x]) { i = toNum(i); if (i < 0) i = Math.max(0, i + s.length); if (i > s.length) i = s.length; this.costo(s.length - i); s.splice(i, 0, x); return null; },
    pop(s, a) {
      if (!s.length) throw this.mkExc('IndexError', 'pop from empty list');
      let k = a.length ? toNum(a[0]) : s.length - 1; if (k < 0) k += s.length;
      if (k < 0 || k >= s.length) throw this.mkExc('IndexError', 'pop index out of range');
      this.costo(s.length - 1 - k);
      return s.splice(k, 1)[0];
    },
    remove(s, [x]) { const i = s.findIndex(y => this.eq(x, y)); if (i < 0) throw this.mkExc('ValueError', 'list.remove(x): x not in list'); this.costo(s.length); s.splice(i, 1); return null; },
    index(s, [x]) { const i = s.findIndex(y => this.eq(x, y)); if (i < 0) throw this.mkExc('ValueError', this.repr(x) + ' is not in list'); this.costo(i + 1); return i; },
    count(s, [x]) { this.costo(s.length); return s.filter(y => this.eq(x, y)).length; },
    sort(s, a, kw) { const r = this.sortArr(s, kw && kw.key, kw && kw.reverse); s.length = 0; for (const x of r) s.push(x); return null; },
    reverse(s) { this.costo(s.length); s.reverse(); return null; },
    copy(s) { this.costo(s.length); return s.slice(); },
    clear(s) { s.length = 0; return null; }
  };
  const STR = {
    split(s, a) {
      const sep = a.length ? a[0] : null; const max = a.length > 1 ? toNum(a[1]) : -1;
      if (sep === null) { const parts = s.trim().split(/\s+/).filter(x => x.length); if (max >= 0 && parts.length > max + 1) { const head = parts.slice(0, max); const rest = s.trim().split(/\s+/).slice(max).join(' '); return head.concat([rest]); } return parts; }
      if (sep === '') throw this.mkExc('ValueError', 'empty separator');
      const parts = s.split(sep); if (max >= 0 && parts.length > max + 1) return parts.slice(0, max).concat([parts.slice(max).join(sep)]);
      return parts;
    },
    join(s, [it]) { const l = this.toList(it); for (const x of l) if (typeof x !== 'string') throw this.mkExc('TypeError', 'sequence item: expected str instance, ' + this.tname(x) + ' found'); return l.join(s); },
    strip(s, a) { if (!a.length || a[0] === null) return s.trim(); const cs = a[0]; let i = 0, j = s.length; while (i < j && cs.includes(s[i])) i++; while (j > i && cs.includes(s[j - 1])) j--; return s.slice(i, j); },
    lstrip(s, a) { if (!a.length) return s.replace(/^\s+/, ''); const cs = a[0]; let i = 0; while (i < s.length && cs.includes(s[i])) i++; return s.slice(i); },
    rstrip(s, a) { if (!a.length) return s.replace(/\s+$/, ''); const cs = a[0]; let j = s.length; while (j > 0 && cs.includes(s[j - 1])) j--; return s.slice(0, j); },
    upper(s) { return s.toUpperCase(); }, lower(s) { return s.toLowerCase(); },
    title(s) { return s.toLowerCase().replace(/(^|[^a-zA-ZÀ-￿])([a-zA-ZÀ-￿])/g, (m, p, c) => p + c.toUpperCase()); },
    capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); },
    swapcase(s) { return Array.from(s).map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''); },
    startswith(s, [p]) { return (p instanceof PyTuple ? p.a : [p]).some(x => s.startsWith(x)); },
    endswith(s, [p]) { return (p instanceof PyTuple ? p.a : [p]).some(x => s.endsWith(x)); },
    replace(s, [o, n, c]) { if (c === undefined || toNum(c) < 0) return s.split(o).join(n); let out = s, cnt = 0, idx = 0, res = ''; while (cnt < toNum(c)) { const k = out.indexOf(o, idx); if (k < 0) break; res += out.slice(idx, k) + n; idx = k + o.length; cnt++; } return res + out.slice(idx); },
    find(s, [x]) { return s.indexOf(x); }, rfind(s, [x]) { return s.lastIndexOf(x); },
    index(s, [x]) { const i = s.indexOf(x); if (i < 0) throw this.mkExc('ValueError', 'substring not found'); return i; },
    count(s, [x]) { if (x === '') return s.length + 1; return s.split(x).length - 1; },
    isdigit(s) { return /^\d+$/.test(s); }, isalpha(s) { return /^[A-Za-zÀ-￿]+$/.test(s); },
    isalnum(s) { return /^[A-Za-z0-9À-￿]+$/.test(s); }, isspace(s) { return /^\s+$/.test(s); },
    isupper(s) { return s !== s.toLowerCase() && s === s.toUpperCase(); }, islower(s) { return s !== s.toUpperCase() && s === s.toLowerCase(); },
    format(s, a, kw) { return this.strFormat(s, a, kw); },
    ljust(s, [w, f]) { return s.padEnd(toNum(w), f || ' '); }, rjust(s, [w, f]) { return s.padStart(toNum(w), f || ' '); },
    center(s, [w, f]) { w = toNum(w); f = f || ' '; if (s.length >= w) return s; const p = w - s.length, l = Math.floor(p / 2) + (p % 2 && w % 2 ? 1 : 0); return f.repeat(l) + s + f.repeat(p - l); },
    zfill(s, [w]) { w = toNum(w); const sg = /^[+-]/.test(s) ? s[0] : ''; return sg + s.slice(sg.length).padStart(w - sg.length, '0'); },
    splitlines(s) { return s.split(/\r?\n/).filter((x, i, a) => !(i === a.length - 1 && x === '')); }
  };
  const DICT = {
    get(d, [k, def]) { const kv = d.m.get(this.hk(k)); return kv ? kv[1] : (def === undefined ? null : def); },
    items(d) { return Array.from(d.m.values()).map(([k, v]) => new PyTuple([k, v])); },
    keys(d) { return Array.from(d.m.values()).map(kv => kv[0]); },
    values(d) { return Array.from(d.m.values()).map(kv => kv[1]); },
    pop(d, a) { const key = this.hk(a[0]); const kv = d.m.get(key); if (kv) { d.m.delete(key); return kv[1]; } if (a.length > 1) return a[1]; throw this.mkExc('KeyError', a[0]); },
    setdefault(d, [k, def]) { const key = this.hk(k); const kv = d.m.get(key); if (kv) return kv[1]; const v = def === undefined ? null : def; d.m.set(key, [k, v]); return v; },
    update(d, a, kw) { if (a.length) { const o = a[0]; if (o instanceof PyDict) for (const [k, kv] of o.m) d.m.set(k, kv); else for (const p of this.iterOf(o)) { const kv = this.toList(p); d.m.set(this.hk(kv[0]), [kv[0], kv[1]]); } } if (kw) for (const k in kw) d.m.set('s' + k, [k, kw[k]]); return null; },
    copy(d) { const n = new PyDict(); for (const [k, kv] of d.m) n.m.set(k, [kv[0], kv[1]]); n.dflt = d.dflt; return n; },
    clear(d) { d.m.clear(); return null; }
  };
  const SET = {
    add(s, [x]) { s.m.set(this.hk(x), x); return null; },
    remove(s, [x]) { const k = this.hk(x); if (!s.m.has(k)) throw this.mkExc('KeyError', x); s.m.delete(k); return null; },
    discard(s, [x]) { s.m.delete(this.hk(x)); return null; },
    pop(s) { const it = s.m.entries().next(); if (it.done) throw this.mkExc('KeyError', 'pop from an empty set'); s.m.delete(it.value[0]); return it.value[1]; },
    union(s, a) { const r = new PySet(); for (const [k, v] of s.m) r.m.set(k, v); for (const o of a) for (const x of this.iterOf(o)) r.m.set(this.hk(x), x); return r; },
    intersection(s, [o]) { const r = new PySet(); const os = new Set(this.toList(o).map(x => this.hk(x))); for (const [k, v] of s.m) if (os.has(k)) r.m.set(k, v); return r; },
    difference(s, [o]) { const r = new PySet(); const os = new Set(this.toList(o).map(x => this.hk(x))); for (const [k, v] of s.m) if (!os.has(k)) r.m.set(k, v); return r; },
    update(s, a) { for (const o of a) for (const x of this.iterOf(o)) s.m.set(this.hk(x), x); return null; },
    copy(s) { const r = new PySet(); for (const [k, v] of s.m) r.m.set(k, v); return r; },
    clear(s) { s.m.clear(); return null; },
    issubset(s, [o]) { const os = new Set(this.toList(o).map(x => this.hk(x))); for (const k of s.m.keys()) if (!os.has(k)) return false; return true; },
    issuperset(s, [o]) { for (const x of this.iterOf(o)) if (!s.m.has(this.hk(x))) return false; return true; }
  };
  const TUPLE = {
    index(t, [x]) { const i = t.a.findIndex(y => this.eq(x, y)); if (i < 0) throw this.mkExc('ValueError', 'tuple.index(x): x not in tuple'); return i; },
    count(t, [x]) { return t.a.filter(y => this.eq(x, y)).length; }
  };
  const DEQUE = {
    append(d, [x]) { d.a.push(x); return null; }, appendleft(d, [x]) { d.a.unshift(x); return null; },
    pop(d) { if (!d.a.length) throw this.mkExc('IndexError', 'pop from an empty deque'); return d.a.pop(); },
    popleft(d) { if (!d.a.length) throw this.mkExc('IndexError', 'pop from an empty deque'); return d.a.shift(); },
    extend(d, [x]) { for (const y of this.iterOf(x)) d.a.push(y); return null; },
    extendleft(d, [x]) { for (const y of this.iterOf(x)) d.a.unshift(y); return null; },
    clear(d) { d.a.length = 0; return null; }, copy(d) { return new PyDeque(d.a.slice()); },
    count(d, [x]) { return d.a.filter(y => this.eq(x, y)).length; }
  };
  proto.methodsFor = function (o) {
    if (Array.isArray(o)) return LIST;
    if (typeof o === 'string') return STR;
    if (o instanceof PyDict) return DICT;
    if (o instanceof PySet) return SET;
    if (o instanceof PyTuple) return TUPLE;
    if (o instanceof PyDeque) return DEQUE;
    return null;
  };

  /* ===================== funciones integradas ===================== */
  proto.initBuiltins = function () {
    const B = this.builtins, it = this;
    const def = (name, fn) => { const f = new PyBuiltin(name, fn); B.set(name, f); return f; };
    const type = (name, fn) => { const f = new PyBuiltin(name, fn, name); B.set(name, f); return f; };

    const objCls = new PyClass('object', []); B.set('object', objCls);
    for (const nm in EXC_TREE) { const base = EXC_TREE[nm]; B.set(nm, new PyClass(nm, [base ? B.get(base) : objCls])); }
    B.get('BaseException').attrs.set('__init__', new PyBuiltin('__init__', args => { args[0].attrs.set('args', new PyTuple(args.slice(1))); return null; }));

    type('int', args => {
      if (!args.length) return 0; const v = args[0];
      if (typeof v === 'string') {
        const base = args.length > 1 ? toNum(args[1]) : 10; const s = v.trim().replace(/_/g, '');
        const ok = base === 10 ? /^[+-]?\d+$/.test(s) : !isNaN(parseInt(s, base));
        if (!ok) throw it.mkExc('ValueError', 'invalid literal for int() with base ' + base + ': ' + it.repr(v));
        return parseInt(s, base);
      }
      if (isNumLike(v)) { const x = toNum(v); if (!isFinite(x)) throw it.mkExc(isNaN(x) ? 'ValueError' : 'OverflowError', isNaN(x) ? 'cannot convert float NaN to integer' : 'cannot convert float infinity to integer'); return Math.trunc(x); }
      throw it.mkExc('TypeError', "int() argument must be a string, a bytes-like object or a real number, not '" + it.tname(v) + "'");
    });
    type('float', args => {
      if (!args.length) return new PyFloat(0); const v = args[0];
      if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        if (/^[+]?(inf|infinity)$/.test(s)) return Infinity; if (/^-(inf|infinity)$/.test(s)) return -Infinity; if (/^[+-]?nan$/.test(s)) return NaN;
        if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(s)) throw it.mkExc('ValueError', 'could not convert string to float: ' + it.repr(v));
        return mkF(parseFloat(s));
      }
      if (isNumLike(v)) return mkF(toNum(v));
      throw it.mkExc('TypeError', "float() argument must be a string or a real number, not '" + it.tname(v) + "'");
    });
    type('str', args => args.length ? it.str(args[0]) : '');
    type('bool', args => args.length ? it.truth(args[0]) : false);
    type('list', args => { if (!args.length) return []; const l = it.toList(args[0]); it.costo(l.length); return l; });
    type('tuple', args => { if (!args.length) return new PyTuple([]); const l = it.toList(args[0]); it.costo(l.length); return new PyTuple(l); });
    type('set', args => { const s = new PySet(); if (args.length) for (const x of it.iterOf(args[0])) { it.costo(1); s.m.set(it.hk(x), x); } return s; });
    type('dict', (args, kw) => {
      const d = new PyDict();
      if (args.length) { const a = args[0]; if (a instanceof PyDict) for (const [k, kv] of a.m) d.m.set(k, [kv[0], kv[1]]); else for (const p of it.iterOf(a)) { const kv = it.toList(p); if (kv.length !== 2) throw it.mkExc('ValueError', 'dictionary update sequence element has wrong length'); d.m.set(it.hk(kv[0]), [kv[0], kv[1]]); } }
      if (kw) for (const k in kw) d.m.set('s' + k, [k, kw[k]]);
      return d;
    });
    type('range', args => {
      for (const a of args) if (!isIntLike(a)) throw it.mkExc('TypeError', "'" + it.tname(a) + "' object cannot be interpreted as an integer");
      let s = 0, e, st = 1;
      if (args.length === 1) e = toNum(args[0]); else if (args.length >= 2) { s = toNum(args[0]); e = toNum(args[1]); if (args.length > 2) st = toNum(args[2]); }
      else throw it.mkExc('TypeError', 'range expected at least 1 argument, got 0');
      if (st === 0) throw it.mkExc('ValueError', 'range() arg 3 must not be zero');
      return new PyRange(s, e, st);
    });
    B.set('NoneType', new PyBuiltin('NoneType', () => null, 'NoneType'));

    def('print', (args, kw) => {
      const sep = kw && kw.sep !== undefined && kw.sep !== null ? kw.sep : ' ', end = kw && kw.end !== undefined && kw.end !== null ? kw.end : '\n';
      it.write(args.map(a => it.str(a)).join(sep) + end); return null;
    });
    def('len', args => {
      const v = args[0];
      if (typeof v === 'string' || Array.isArray(v)) return v.length;
      if (v instanceof PyTuple || v instanceof PyDeque) return v.a.length;
      if (v instanceof PyDict || v instanceof PySet) return v.m.size;
      if (v instanceof PyRange) return v.length;
      if (v instanceof PyObj) { const m = it.findAttr(v.cls, '__len__'); if (m) return it.call(m, [v]); }
      throw it.mkExc('TypeError', "object of type '" + it.tname(v) + "' has no len()");
    });
    def('abs', ([v]) => { if (!isNumLike(v)) throw it.mkExc('TypeError', "bad operand type for abs(): '" + it.tname(v) + "'"); const x = Math.abs(toNum(v)); return isFl(v) ? mkF(x) : x; });
    const mm = (name, sign) => (args, kw) => {
      const items = args.length === 1 ? it.toList(args[0]) : args; const key = kw && kw.key;
      it.costo(items.length);
      if (!items.length) { if (kw && 'default' in kw) return kw.default; throw it.mkExc('ValueError', name + '() arg is an empty sequence'); }
      let best = items[0], bk = key ? it.call(key, [best]) : best;
      for (let i = 1; i < items.length; i++) { const k = key ? it.call(key, [items[i]]) : items[i]; const c = it.cmp(k, bk, sign < 0 ? '<' : '>'); if (sign < 0 ? c < 0 : c > 0) { best = items[i]; bk = k; } }
      return best;
    };
    def('min', mm('min', -1)); def('max', mm('max', 1));
    def('sum', (args) => { let acc = args.length > 1 ? args[1] : 0; for (const x of it.iterOf(args[0])) { it.costo(1); acc = it.arith('+', acc, x); } return acc; });
    def('sorted', (args, kw) => it.sortArr(it.toList(args[0]), kw && kw.key, kw && kw.reverse));
    def('reversed', ([x]) => it.toList(x).reverse());
    def('enumerate', (args, kw) => { const st = args.length > 1 ? toNum(args[1]) : (kw && kw.start !== undefined ? toNum(kw.start) : 0); return it.toList(args[0]).map((x, i) => new PyTuple([i + st, x])); });
    def('zip', args => { const ls = args.map(a => it.toList(a)); const n = ls.length ? Math.min(...ls.map(l => l.length)) : 0; const out = []; for (let i = 0; i < n; i++) out.push(new PyTuple(ls.map(l => l[i]))); return out; });
    def('map', args => { const f = args[0]; const ls = args.slice(1).map(a => it.toList(a)); const n = Math.min(...ls.map(l => l.length)); const out = []; for (let i = 0; i < n; i++) out.push(it.call(f, ls.map(l => l[i]))); return out; });
    def('filter', ([f, x]) => it.toList(x).filter(v => f === null ? it.truth(v) : it.truth(it.call(f, [v]))));
    def('any', ([x]) => { for (const v of it.iterOf(x)) if (it.truth(v)) return true; return false; });
    def('all', ([x]) => { for (const v of it.iterOf(x)) if (!it.truth(v)) return false; return true; });
    def('isinstance', ([v, t]) => it.isInst(v, t));
    def('type', ([v]) => { const t = it.typeObj(v); return t || B.get('object'); });
    def('repr', ([v]) => it.repr(v));
    def('callable', ([v]) => v instanceof PyFunc || v instanceof PyBuiltin || v instanceof PyBound || v instanceof PyClass);
    def('round', (args) => {
      const v = args[0]; if (!isNumLike(v)) throw it.mkExc('TypeError', "type " + it.tname(v) + " doesn't define __round__ method");
      const x = toNum(v);
      if (args.length < 2 || args[1] === null) return roundHalfEven(x);
      const nd = toNum(args[1]); const r = roundDigits(x, nd);
      return isFl(v) ? mkF(r) : (nd >= 0 ? x : r);
    });
    def('pow', ([a, b, m]) => {
      if (m === undefined) return it.arith('**', a, b);
      let r = 1, base = toNum(a) % toNum(m), e = toNum(b); const md = toNum(m);
      while (e > 0) { if (e & 1) r = (r * base) % md; base = (base * base) % md; e = Math.floor(e / 2); } return r;
    });
    def('divmod', ([a, b]) => new PyTuple([it.arith('//', a, b), it.arith('%', a, b)]));
    def('ord', ([c]) => c.codePointAt(0)); def('chr', ([n]) => String.fromCodePoint(toNum(n)));
    def('hex', ([n]) => (toNum(n) < 0 ? '-0x' : '0x') + Math.abs(toNum(n)).toString(16)); def('bin', ([n]) => (toNum(n) < 0 ? '-0b' : '0b') + Math.abs(toNum(n)).toString(2));
    def('id', ([v]) => { if (v !== null && typeof v === 'object') { if (!v.__id) v.__id = ++it.idc; return 140000000 + v.__id * 16; } return 94000000 + (typeof v === 'number' ? v : 0) * 32; });
    def('hash', ([v]) => { const k = it.hk(v); let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) | 0; return h; });
    def('hasattr', ([o, n]) => { try { it.getAttr(o, n); return true; } catch (e) { if (e instanceof C.PyExc) return false; throw e; } });
    def('getattr', (args) => { try { return it.getAttr(args[0], args[1]); } catch (e) { if (e instanceof C.PyExc && args.length > 2) return args[2]; throw e; } });
    def('setattr', ([o, n, v]) => { it.setAttr(o, n, v); return null; });
    def('format', ([v, s]) => it.fmtSpec(v, s || ''));
    def('input', () => { throw it.mkExc('RuntimeError', 'input() no está disponible en el entrenador'); });
    def('open', () => { throw it.mkExc('OSError', 'open() no está disponible en el entrenador'); });
    def('iter', () => { throw new PyUnsupported('iter()/next() y los generadores no están soportados por el intérprete del entrenador'); });
    def('next', () => { throw new PyUnsupported('iter()/next() y los generadores no están soportados por el intérprete del entrenador'); });
    def('staticmethod', ([f]) => new PyStatic(f)); def('classmethod', ([f]) => new PyClassM(f));
    def('super', () => { throw it.mkExc('RuntimeError', 'super() solo funciona dentro de un método'); });
    // lru_cache / cache
    const makeCached = f => {
      const cache = new Map(); let hits = 0, miss = 0;
      const w = new PyBuiltin(f.name, (args, kw) => {
        let key = args.map(a => it.hk(a)).join('|'); if (kw) for (const k in kw) key += '|' + k + '=' + it.hk(kw[k]);
        if (cache.has(key)) { hits++; return cache.get(key); }
        miss++; const r = it.call(f, args, kw); cache.set(key, r); return r;
      });
      w.extra = { cache_clear: new PyBuiltin('cache_clear', () => { cache.clear(); hits = miss = 0; return null; }), cache_info: new PyBuiltin('cache_info', () => 'CacheInfo(hits=' + hits + ', misses=' + miss + ', maxsize=None, currsize=' + cache.size + ')'), __wrapped__: f };
      return w;
    };
    this._lru = new PyBuiltin('lru_cache', (args, kw) => (args.length === 1 && args[0] instanceof PyFunc && !kw) ? makeCached(args[0]) : new PyBuiltin('decorador', ([f]) => makeCached(f)));
    this._cache = new PyBuiltin('cache', ([f]) => makeCached(f));
  };

  /* ===================== módulos ===================== */
  proto.modules = function () {
    if (this._mods) return this._mods;
    const it = this; const M = {}; const fn = (name, f) => new PyBuiltin(name, f);
    const mk = (name, obj) => { const m = new Map(); for (const k in obj) m.set(k, obj[k]); M[name] = new PyModule(name, m); };
    const num1 = (name, f) => fn(name, ([x]) => { if (!isNumLike(x)) throw it.mkExc('TypeError', 'must be real number, not ' + it.tname(x)); return mkF(f(toNum(x))); });
    const dom = (name, f, ok) => fn(name, ([x]) => { const v = toNum(x); if (!ok(v)) throw it.mkExc('ValueError', 'math domain error'); return mkF(f(v)); });
    const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; };
    mk('math', {
      pi: Math.PI, e: Math.E, inf: Infinity, nan: NaN,
      sqrt: dom('sqrt', Math.sqrt, v => v >= 0), log2: dom('log2', Math.log2, v => v > 0), log10: dom('log10', Math.log10, v => v > 0),
      log: fn('log', ([x, b]) => { const v = toNum(x); if (v <= 0) throw it.mkExc('ValueError', 'math domain error'); return mkF(b === undefined ? Math.log(v) : Math.log(v) / Math.log(toNum(b))); }),
      exp: num1('exp', Math.exp), sin: num1('sin', Math.sin), cos: num1('cos', Math.cos), tan: num1('tan', Math.tan), fabs: num1('fabs', Math.abs),
      floor: fn('floor', ([x]) => Math.floor(toNum(x))), ceil: fn('ceil', ([x]) => Math.ceil(toNum(x))), trunc: fn('trunc', ([x]) => Math.trunc(toNum(x))),
      pow: fn('pow', ([a, b]) => mkF(Math.pow(toNum(a), toNum(b)))), hypot: fn('hypot', ([a, b]) => mkF(Math.hypot(toNum(a), toNum(b)))),
      isqrt: fn('isqrt', ([x]) => Math.floor(Math.sqrt(toNum(x)))),
      gcd: fn('gcd', ([a, b]) => gcd(toNum(a), toNum(b))),
      factorial: fn('factorial', ([n]) => { n = toNum(n); if (n < 0) throw it.mkExc('ValueError', 'factorial() not defined for negative values'); let r = 1; for (let i = 2; i <= n; i++) { r *= i; if (r > C.MAXI) throw new C.PyLimit('factorial demasiado grande para este intérprete (precisión de 53 bits)'); } return r; }),
      isclose: fn('isclose', ([a, b]) => Math.abs(toNum(a) - toNum(b)) <= Math.max(1e-9 * Math.max(Math.abs(toNum(a)), Math.abs(toNum(b))), 0))
    });
    mk('functools', { lru_cache: it._lru, cache: it._cache, reduce: fn('reduce', (args) => { const f = args[0]; const l = it.toList(args[1]); let acc, i = 0; if (args.length > 2) acc = args[2]; else { if (!l.length) throw it.mkExc('TypeError', 'reduce() of empty iterable with no initial value'); acc = l[0]; i = 1; } for (; i < l.length; i++) acc = it.call(f, [acc, l[i]]); return acc; }) });
    const dequeCls = fn('deque', ([x]) => new PyDeque(x === undefined ? [] : it.toList(x)));
    const defaultdict = fn('defaultdict', ([f]) => { const d = new PyDict(); d.dflt = f === undefined || f === null ? null : f; return d; });
    const counter = fn('Counter', ([x]) => { const d = new PyDict(); d.dflt = it.builtins.get('int'); if (x !== undefined) for (const v of it.iterOf(x)) { const k = it.hk(v); const kv = d.m.get(k); if (kv) kv[1]++; else d.m.set(k, [v, 1]); } return d; });
    mk('collections', { deque: dequeCls, defaultdict, Counter: counter });
    mk('time', { perf_counter: fn('perf_counter', () => mkF((typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000)), time: fn('time', () => mkF(Date.now() / 1000)), sleep: fn('sleep', () => null) });
    const rnd = () => { it.seed = (Math.imul(it.seed, 1664525) + 1013904223) >>> 0; return it.seed / 4294967296; };
    mk('random', {
      random: fn('random', () => mkF(rnd())), seed: fn('seed', ([s]) => { it.seed = (s === undefined || s === null ? 1 : Math.abs(toNum(s))) >>> 0 || 1; return null; }),
      randint: fn('randint', ([a, b]) => toNum(a) + Math.floor(rnd() * (toNum(b) - toNum(a) + 1))),
      randrange: fn('randrange', (args) => { const lo = args.length > 1 ? toNum(args[0]) : 0, hi = args.length > 1 ? toNum(args[1]) : toNum(args[0]); return lo + Math.floor(rnd() * (hi - lo)); }),
      uniform: fn('uniform', ([a, b]) => mkF(toNum(a) + rnd() * (toNum(b) - toNum(a)))),
      choice: fn('choice', ([s]) => { const l = it.toList(s); if (!l.length) throw it.mkExc('IndexError', 'Cannot choose from an empty sequence'); return l[Math.floor(rnd() * l.length)]; }),
      shuffle: fn('shuffle', ([l]) => { for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return null; }),
      sample: fn('sample', ([s, k]) => { const l = it.toList(s); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l.slice(0, toNum(k)); })
    });
    mk('sys', { maxsize: C.MAXI, setrecursionlimit: fn('setrecursionlimit', ([n]) => { it.maxDepth = Math.min(toNum(n), 3000); return null; }), getrecursionlimit: fn('getrecursionlimit', () => it.maxDepth) });
    this._mods = M; return M;
  };
})(typeof window !== 'undefined' ? window : globalThis);
