/* pyparse.js — tokenizador y parser de un subconjunto de Python 3 (para el intérprete del entrenador) */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};

  class PySyntaxError extends Error {
    constructor(msg, line, tipo) { super(msg); this.pyType = tipo || 'SyntaxError'; this.line = line; this.pyMsg = msg; }
  }

  const RESERVED = new Set(['False', 'None', 'True', 'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']);
  const NO_START = new Set(['in', 'is', 'and', 'or', 'if', 'else', 'elif', 'for', 'while', 'def', 'class', 'return', 'import', 'from', 'as', 'pass', 'break', 'continue', 'try', 'except', 'finally', 'raise', 'global', 'nonlocal', 'assert', 'del', 'with', 'yield']);
  const OPS3 = ['**=', '//=', '>>=', '<<=', '...'];
  const OPS2 = ['**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '->', ':=', '<<', '>>', '@='];
  const OPS1 = '+-*/%<>=()[]{},:.;@&|^~!';
  const AUG = new Set(['+=', '-=', '*=', '/=', '//=', '%=', '**=', '&=', '|=', '^=', '<<=', '>>=']);
  const PREC = { '|': 1, '^': 2, '&': 3, '<<': 4, '>>': 4, '+': 5, '-': 5, '*': 6, '/': 6, '//': 6, '%': 6, '@': 6 };

  /* ===================== tokenizador ===================== */
  function unescapeStr(s, line) {
    return s.replace(/\\(x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|[\s\S])/g, (m, c) => {
      switch (c[0]) {
        case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r'; case '0': return '\0';
        case '\\': return '\\'; case "'": return "'"; case '"': return '"'; case '\n': return '';
        case 'x': case 'u': return c.length > 1 ? String.fromCharCode(parseInt(c.slice(1), 16)) : m;
        default: return m;
      }
    });
  }

  function tokenize(src) {
    src = String(src).replace(/\r\n?/g, '\n');
    if (!src.endsWith('\n')) src += '\n';
    const n = src.length;
    const toks = [];
    const indents = [0];
    let i = 0, line = 1, paren = 0, atStart = true;
    const push = (t, v, extra) => { const tk = { t, v, line }; if (extra) Object.assign(tk, extra); toks.push(tk); return tk; };

    while (i < n) {
      if (atStart && paren === 0) {
        let j = i, ind = 0;
        while (j < n && (src[j] === ' ' || src[j] === '\t')) { ind += src[j] === '\t' ? 4 : 1; j++; }
        if (j >= n) { i = j; break; }
        if (src[j] === '\n') { i = j + 1; line++; continue; }
        if (src[j] === '#') { while (j < n && src[j] !== '\n') j++; i = j; continue; }
        const top = indents[indents.length - 1];
        if (ind > top) { indents.push(ind); push('INDENT', ind); }
        else if (ind < top) {
          while (ind < indents[indents.length - 1]) { indents.pop(); push('DEDENT', 0); }
          if (ind !== indents[indents.length - 1]) throw new PySyntaxError('la sangría no coincide con ningún nivel anterior', line, 'IndentationError');
        }
        atStart = false; i = j;
      }
      const c = src[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '\\' && src[i + 1] === '\n') { i += 2; line++; continue; }
      if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '\n') {
        i++;
        if (paren > 0) { line++; continue; }
        push('NEWLINE', '\n'); line++; atStart = true; continue;
      }
      // números
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        const m = /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*)?\.?\d[\d_]*(?:[eE][+-]?\d+)?|\d[\d_]*\.)/.exec(src.slice(i, i + 64));
        let txt = m ? m[0] : c;
        const clean = txt.replace(/_/g, '');
        let isFloat = /[.eE]/.test(clean) && !/^0[xXbBoO]/.test(clean);
        push('NUM', isFloat ? parseFloat(clean) : Number(clean), { isFloat });
        i += txt.length; continue;
      }
      // nombres y prefijos de cadena
      if (/[A-Za-z_À-￿]/.test(c)) {
        let j = i;
        while (j < n && /[\wÀ-￿]/.test(src[j])) j++;
        const word = src.slice(i, j);
        if (/^(?:[rRbBuUfF]|[rR][bBfF]|[bBfF][rR])$/.test(word) && (src[j] === '"' || src[j] === "'")) {
          i = j; // cae a la lectura de cadena con prefijo
          readString(word.toLowerCase());
          continue;
        }
        push('NAME', word); i = j; continue;
      }
      if (c === '"' || c === "'") { readString(''); continue; }
      // operadores
      const s3 = src.substr(i, 3), s2 = src.substr(i, 2);
      if (OPS3.includes(s3)) { push('OP', s3); i += 3; continue; }
      if (OPS2.includes(s2)) { push('OP', s2); i += 2; continue; }
      if (OPS1.includes(c)) {
        if (c === '(' || c === '[' || c === '{') paren++;
        else if (c === ')' || c === ']' || c === '}') paren = Math.max(0, paren - 1);
        push('OP', c); i++; continue;
      }
      throw new PySyntaxError("carácter no válido '" + c + "'", line);
    }
    if (toks.length && toks[toks.length - 1].t !== 'NEWLINE') push('NEWLINE', '\n');
    while (indents.length > 1) { indents.pop(); push('DEDENT', 0); }
    push('EOF', null);
    return toks;

    function readString(prefix) {
      const q = src[i];
      const triple = src.substr(i, 3) === q.repeat(3);
      const raw = prefix.includes('r'), isF = prefix.includes('f');
      const startLine = line;
      i += triple ? 3 : 1;
      let body = '';
      for (; ;) {
        if (i >= n) throw new PySyntaxError('cadena sin cerrar', startLine);
        const ch = src[i];
        if (triple ? src.substr(i, 3) === q.repeat(3) : ch === q) { i += triple ? 3 : 1; break; }
        if (ch === '\n') {
          if (!triple) throw new PySyntaxError('cadena sin cerrar (falta la comilla de cierre)', startLine);
          line++;
        }
        if (ch === '\\' && i + 1 < n) { body += ch + src[i + 1]; if (src[i + 1] === '\n') line++; i += 2; continue; }
        body += ch; i++;
      }
      push('STR', raw ? body : (isF ? body : unescapeStr(body, startLine)), { f: isF, raw, rawBody: body });
      toks[toks.length - 1].line = startLine;
    }
  }

  /* ===================== parser ===================== */
  class Parser {
    constructor(toks) { this.toks = toks; this.i = 0; }
    get tok() { return this.toks[this.i]; }
    peekIs(t, v) { const k = this.toks[this.i]; return k.t === t && (v === undefined || k.v === v); }
    isOp(v) { const k = this.toks[this.i]; return k.t === 'OP' && k.v === v; }
    isKw(v) { const k = this.toks[this.i]; return k.t === 'NAME' && k.v === v; }
    eatOp(v) { if (this.isOp(v)) { this.i++; return true; } return false; }
    eatKw(v) { if (this.isKw(v)) { this.i++; return true; } return false; }
    fail(msg, tipo) { throw new PySyntaxError(msg, this.tok.line, tipo); }
    expectOp(v, extra) { if (!this.eatOp(v)) this.fail("se esperaba '" + v + "'" + (extra ? ' ' + extra : '')); }
    expectKw(v) { if (!this.eatKw(v)) this.fail("se esperaba '" + v + "'"); }
    expectName() {
      const k = this.tok;
      if (k.t !== 'NAME' || RESERVED.has(k.v)) this.fail('se esperaba un nombre válido' + (k.t === 'NAME' ? " (no se puede usar la palabra reservada '" + k.v + "')" : ''));
      this.i++; return k.v;
    }

    parseModule() {
      const body = [];
      while (!this.peekIs('EOF')) {
        if (this.peekIs('NEWLINE')) { this.i++; continue; }
        this.parseStatementInto(body);
      }
      return { k: 'Module', body };
    }

    parseStatementInto(body) {
      const k = this.tok;
      if (k.t === 'INDENT') this.fail('sangría inesperada', 'IndentationError');
      if (k.t === 'NAME') {
        switch (k.v) {
          case 'if': body.push(this.parseIf()); return;
          case 'while': body.push(this.parseWhile()); return;
          case 'for': body.push(this.parseFor()); return;
          case 'def': body.push(this.parseDef([])); return;
          case 'class': body.push(this.parseClass([])); return;
          case 'try': body.push(this.parseTry()); return;
          case 'with': this.fail("'with' no está soportado por el intérprete del entrenador", 'NoSoportado'); return;
          case 'async': case 'await': case 'yield': this.fail("'" + k.v + "' no está soportado por el intérprete del entrenador", 'NoSoportado'); return;
        }
      }
      if (k.t === 'OP' && k.v === '@') { body.push(this.parseDecorated()); return; }
      this.parseSimpleStmtsInto(body);
    }

    parseBlock() {
      this.expectOp(':');
      const body = [];
      if (this.peekIs('NEWLINE')) {
        this.i++;
        if (!this.peekIs('INDENT')) this.fail('se esperaba un bloque con sangría', 'IndentationError');
        this.i++;
        while (!this.peekIs('DEDENT') && !this.peekIs('EOF')) {
          if (this.peekIs('NEWLINE')) { this.i++; continue; }
          this.parseStatementInto(body);
        }
        if (this.peekIs('DEDENT')) this.i++;
      } else this.parseSimpleStmtsInto(body);
      return body;
    }

    parseSimpleStmtsInto(body) {
      for (; ;) {
        body.push(this.parseSimple());
        if (this.eatOp(';')) { if (this.peekIs('NEWLINE') || this.peekIs('EOF')) break; continue; }
        break;
      }
      if (!this.peekIs('NEWLINE') && !this.peekIs('EOF')) this.fail('sintaxis inválida');
      if (this.peekIs('NEWLINE')) this.i++;
    }

    endOfSimple() { return this.peekIs('NEWLINE') || this.peekIs('EOF') || this.isOp(';'); }

    parseSimple() {
      const k = this.tok, line = k.line;
      if (k.t === 'NAME') {
        switch (k.v) {
          case 'return': { this.i++; const v = this.endOfSimple() ? null : this.parseTestlistStar(); return { k: 'Return', v, line }; }
          case 'pass': this.i++; return { k: 'Pass', line };
          case 'break': this.i++; return { k: 'Break', line };
          case 'continue': this.i++; return { k: 'Continue', line };
          case 'global': case 'nonlocal': {
            this.i++; const names = [this.expectName()];
            while (this.eatOp(',')) names.push(this.expectName());
            return { k: k.v === 'global' ? 'Global' : 'Nonlocal', names, line };
          }
          case 'import': {
            this.i++; const names = [];
            do { let nm = this.expectName(); while (this.eatOp('.')) nm += '.' + this.expectName(); let as = null; if (this.eatKw('as')) as = this.expectName(); names.push({ name: nm, as }); } while (this.eatOp(','));
            return { k: 'Import', names, line };
          }
          case 'from': {
            this.i++; let mod = this.expectName(); while (this.eatOp('.')) mod += '.' + this.expectName();
            this.expectKw('import'); const names = [];
            if (this.eatOp('*')) names.push({ name: '*', as: null });
            else {
              const par = this.eatOp('(');
              do { if (par && this.isOp(')')) break; const nm = this.expectName(); let as = null; if (this.eatKw('as')) as = this.expectName(); names.push({ name: nm, as }); } while (this.eatOp(','));
              if (par) this.expectOp(')');
            }
            return { k: 'ImportFrom', mod, names, line };
          }
          case 'assert': { this.i++; const test = this.parseTest(); let msg = null; if (this.eatOp(',')) msg = this.parseTest(); return { k: 'Assert', test, msg, line }; }
          case 'raise': { this.i++; let exc = null; if (!this.endOfSimple()) { exc = this.parseTest(); if (this.eatKw('from')) this.parseTest(); } return { k: 'Raise', exc, line }; }
          case 'del': { this.i++; const targets = [this.parseBin(1)]; while (this.eatOp(',')) targets.push(this.parseBin(1)); return { k: 'Del', targets, line }; }
          case 'yield': this.fail("'yield' no está soportado por el intérprete del entrenador", 'NoSoportado'); break;
        }
      }
      // expresión / asignación
      const first = this.parseTestlistStar();
      if (this.isOp('=')) {
        const targets = []; let lhs = first;
        while (this.eatOp('=')) { targets.push(lhs); lhs = this.parseTestlistStar(); }
        for (const t of targets) this.checkTarget(t, line);
        return { k: 'Assign', targets, v: lhs, line };
      }
      const t = this.tok;
      if (t.t === 'OP' && AUG.has(t.v)) {
        this.i++; this.checkTarget(first, line, true);
        const v = this.parseTestlistStar();
        return { k: 'AugAssign', t: first, op: t.v.slice(0, -1), v, line };
      }
      if (this.isOp(':') && (first.k === 'Name' || first.k === 'Attr' || first.k === 'Sub')) {
        this.i++; this.parseTest();                       // anotación: se ignora
        let v = null; if (this.eatOp('=')) v = this.parseTestlistStar();
        if (v) return { k: 'Assign', targets: [first], v, line };
        return { k: 'Pass', line };
      }
      return { k: 'ExprStmt', x: first, line };
    }

    checkTarget(t, line, aug) {
      switch (t.k) {
        case 'Name': case 'Attr': case 'Sub': return;
        case 'Tuple': case 'List': if (aug) break; t.elts.forEach(e => this.checkTarget(e, line)); return;
        case 'Starred': return this.checkTarget(t.x, line);
      }
      throw new PySyntaxError('no se puede asignar a esa expresión' + (t.k === 'Compare' ? " (¿quisiste usar '==' para comparar?)" : ''), line);
    }

    parseIf() {
      const line = this.tok.line; this.i++;
      const test = this.parseNamedTest();
      const body = this.parseBlockOrHint();
      let orelse = [];
      if (this.isKw('elif')) orelse = [this.parseIf()];
      else if (this.isKw('else')) { this.i++; orelse = this.parseBlock(); }
      return { k: 'If', test, body, orelse, line };
    }
    parseBlockOrHint() {
      if (this.isOp('=')) this.fail("se esperaba ':' (¿quisiste usar '==' para comparar en vez de '='?)");
      return this.parseBlock();
    }
    parseNamedTest() { return this.parseTest(); }
    parseWhile() {
      const line = this.tok.line; this.i++;
      const test = this.parseTest(); const body = this.parseBlockOrHint(); let orelse = [];
      if (this.isKw('else')) { this.i++; orelse = this.parseBlock(); }
      return { k: 'While', test, body, orelse, line };
    }
    parseFor() {
      const line = this.tok.line; this.i++;
      const target = this.parseTargetList();
      this.checkTarget(target, line);
      this.expectKw('in');
      const iter = this.parseTestlistStar();
      const body = this.parseBlock(); let orelse = [];
      if (this.isKw('else')) { this.i++; orelse = this.parseBlock(); }
      return { k: 'For', target, iter, body, orelse, line };
    }
    parseTargetList() {
      const line = this.tok.line;
      const first = this.parseStarOrBin();
      if (!this.isOp(',')) return first;
      const elts = [first];
      while (this.eatOp(',')) { if (this.isKw('in') || this.isOp('=')) break; elts.push(this.parseStarOrBin()); }
      return { k: 'Tuple', elts, line };
    }
    parseStarOrBin() { if (this.eatOp('*')) return { k: 'Starred', x: this.parseBin(1) }; return this.parseBin(1); }

    parseParams(endOp) {
      const params = [];
      while (!this.isOp(endOp)) {
        if (this.eatOp('**')) { params.push({ name: this.expectName(), kind: 'dstar', def: null }); }
        else if (this.eatOp('*')) { if (this.isOp(',')) { this.i++; continue; } params.push({ name: this.expectName(), kind: 'star', def: null }); }
        else if (this.eatOp('/')) { /* parámetros solo posicionales: se ignora */ }
        else {
          const name = this.expectName(); let def = null;
          if (endOp === ')' && this.eatOp(':')) this.parseTest();          // anotación
          if (this.eatOp('=')) def = this.parseTest();
          params.push({ name, kind: 'pos', def });
        }
        if (!this.eatOp(',')) break;
      }
      return params;
    }
    parseDef(decos) {
      const line = this.tok.line; this.i++;
      const name = this.expectName();
      this.expectOp('(');
      const params = this.parseParams(')');
      this.expectOp(')');
      if (this.eatOp('->')) this.parseTest();
      const body = this.parseBlock();
      return { k: 'FuncDef', name, params, body, decos, line };
    }
    parseClass(decos) {
      const line = this.tok.line; this.i++;
      const name = this.expectName(); const bases = [];
      if (this.eatOp('(')) {
        while (!this.isOp(')')) { bases.push(this.parseTest()); if (!this.eatOp(',')) break; }
        this.expectOp(')');
      }
      const body = this.parseBlock();
      return { k: 'ClassDef', name, bases, body, decos, line };
    }
    parseDecorated() {
      const decos = [];
      while (this.isOp('@')) {
        this.i++; decos.push(this.parseTest());
        if (!this.peekIs('NEWLINE')) this.fail('sintaxis inválida en el decorador');
        this.i++;
      }
      if (this.isKw('def')) return this.parseDef(decos);
      if (this.isKw('class')) return this.parseClass(decos);
      this.fail("después de un decorador debe ir 'def' o 'class'");
    }
    parseTry() {
      const line = this.tok.line; this.i++;
      const body = this.parseBlock(); const handlers = []; let orelse = [], finalbody = [];
      while (this.isKw('except')) {
        const hl = this.tok.line; this.i++;
        let type = null, name = null;
        if (!this.isOp(':')) { type = this.parseTest(); if (this.eatKw('as')) name = this.expectName(); }
        handlers.push({ type, name, body: this.parseBlock(), line: hl });
      }
      if (this.isKw('else')) { this.i++; orelse = this.parseBlock(); }
      if (this.isKw('finally')) { this.i++; finalbody = this.parseBlock(); }
      if (!handlers.length && !finalbody.length) this.fail("'try' necesita al menos un 'except' o 'finally'");
      return { k: 'Try', body, handlers, orelse, finalbody, line };
    }

    /* ---------- expresiones ---------- */
    startsExpr() {
      const k = this.tok;
      if (k.t === 'NUM' || k.t === 'STR') return true;
      if (k.t === 'NAME') return !NO_START.has(k.v);
      if (k.t === 'OP') return ['(', '[', '{', '-', '+', '~', '*', '**', '...'].includes(k.v);
      return false;
    }
    parseStarOrTest() {
      const line = this.tok.line;
      if (this.eatOp('*')) return { k: 'Starred', x: this.parseBin(1), line };
      return this.parseTest();
    }
    parseTestlistStar() {
      const line = this.tok.line;
      const first = this.parseStarOrTest();
      if (!this.isOp(',')) return first;
      const elts = [first];
      while (this.eatOp(',')) { if (!this.startsExpr()) break; elts.push(this.parseStarOrTest()); }
      return { k: 'Tuple', elts, line };
    }
    parseTest() {
      if (this.isKw('lambda')) return this.parseLambda();
      const line = this.tok.line;
      const x = this.parseOr();
      if (this.isKw('if')) {
        this.i++;
        const test = this.parseOr();
        if (!this.eatKw('else')) this.fail("se esperaba 'else' en la expresión condicional");
        const orelse = this.parseTest();
        return { k: 'IfExp', test, body: x, orelse, line };
      }
      return x;
    }
    parseLambda() {
      const line = this.tok.line; this.i++;
      const params = this.parseParams(':');
      this.expectOp(':');
      const body = this.parseTest();
      return { k: 'Lambda', params, body, line };
    }
    parseOr() {
      const line = this.tok.line; let x = this.parseAnd();
      if (!this.isKw('or')) return x;
      const vals = [x]; while (this.eatKw('or')) vals.push(this.parseAnd());
      return { k: 'BoolOp', op: 'or', vals, line };
    }
    parseAnd() {
      const line = this.tok.line; let x = this.parseNot();
      if (!this.isKw('and')) return x;
      const vals = [x]; while (this.eatKw('and')) vals.push(this.parseNot());
      return { k: 'BoolOp', op: 'and', vals, line };
    }
    parseNot() {
      const line = this.tok.line;
      if (this.eatKw('not')) return { k: 'UnaryOp', op: 'not', x: this.parseNot(), line };
      return this.parseComparison();
    }
    parseComparison() {
      const line = this.tok.line;
      const l = this.parseBin(1);
      const ops = [], rs = [];
      for (; ;) {
        const k = this.tok; let op = null;
        if (k.t === 'OP' && ['<', '>', '==', '>=', '<=', '!='].includes(k.v)) { op = k.v; this.i++; }
        else if (k.t === 'NAME' && k.v === 'in') { op = 'in'; this.i++; }
        else if (k.t === 'NAME' && k.v === 'not' && this.toks[this.i + 1].t === 'NAME' && this.toks[this.i + 1].v === 'in') { op = 'not in'; this.i += 2; }
        else if (k.t === 'NAME' && k.v === 'is') { this.i++; op = this.eatKw('not') ? 'is not' : 'is'; }
        else break;
        ops.push(op); rs.push(this.parseBin(1));
      }
      return ops.length ? { k: 'Compare', l, ops, rs, line } : l;
    }
    parseBin(min) {
      const line = this.tok.line;
      let l = this.parseUnary();
      for (; ;) {
        const k = this.tok;
        if (k.t !== 'OP') break;
        const p = PREC[k.v];
        if (!p || p < min) break;
        this.i++;
        const r = this.parseBin(p + 1);
        l = { k: 'BinOp', op: k.v, l, r, line };
      }
      return l;
    }
    parseUnary() {
      const k = this.tok;
      if (k.t === 'OP' && (k.v === '-' || k.v === '+' || k.v === '~')) { this.i++; return { k: 'UnaryOp', op: k.v, x: this.parseUnary(), line: k.line }; }
      return this.parsePower();
    }
    parsePower() {
      const line = this.tok.line;
      const base = this.parsePostfix();
      if (this.eatOp('**')) return { k: 'BinOp', op: '**', l: base, r: this.parseUnary(), line };
      return base;
    }
    parsePostfix() {
      let x = this.parseAtom();
      for (; ;) {
        const k = this.tok;
        if (k.t !== 'OP') break;
        if (k.v === '(') { this.i++; x = this.parseCall(x, k.line); }
        else if (k.v === '[') { this.i++; x = { k: 'Sub', x, idx: this.parseSubscript(), line: k.line }; }
        else if (k.v === '.') { this.i++; const nm = this.tok; if (nm.t !== 'NAME') this.fail('se esperaba un nombre de atributo después de "."'); this.i++; x = { k: 'Attr', x, name: nm.v, line: k.line }; }
        else break;
      }
      return x;
    }
    parseCall(f, line) {
      const args = [], kwargs = [];
      while (!this.isOp(')')) {
        if (this.eatOp('*')) args.push({ k: 'Starred', x: this.parseTest() });
        else if (this.eatOp('**')) kwargs.push({ name: null, v: this.parseTest() });
        else if (this.tok.t === 'NAME' && this.toks[this.i + 1].t === 'OP' && this.toks[this.i + 1].v === '=' && !RESERVED.has(this.tok.v)) {
          const name = this.tok.v; this.i += 2; kwargs.push({ name, v: this.parseTest() });
        } else {
          const e = this.parseTest();
          if (this.isKw('for')) args.push({ k: 'GenExp', elt: e, gens: this.parseCompFor(), line });
          else args.push(e);
        }
        if (!this.eatOp(',')) break;
      }
      this.expectOp(')', '(falta cerrar el paréntesis de la llamada)');
      return { k: 'Call', f, args, kwargs, line };
    }
    parseSubscript() {
      const items = []; let trailing = false;
      do {
        trailing = false;
        if (this.isOp(']')) break;
        items.push(this.parseSliceItem());
        if (this.isOp(',')) trailing = true;
      } while (this.eatOp(','));
      this.expectOp(']');
      if (items.length === 1 && !trailing) return items[0];
      return { k: 'Tuple', elts: items };
    }
    parseSliceItem() {
      let lo = null;
      if (!this.isOp(':')) lo = this.parseTest();
      if (this.isOp(':')) {
        this.i++; let hi = null, st = null;
        if (!this.isOp(':') && !this.isOp(']') && !this.isOp(',')) hi = this.parseTest();
        if (this.eatOp(':')) { if (!this.isOp(']') && !this.isOp(',')) st = this.parseTest(); }
        return { k: 'Slice', lo, hi, st };
      }
      return lo;
    }
    parseCompFor() {
      const gens = [];
      while (this.isKw('for')) {
        this.i++;
        const target = this.parseTargetList(); this.checkTarget(target, this.tok.line);
        this.expectKw('in');
        const iter = this.parseOr();
        const ifs = [];
        while (this.isKw('if')) { this.i++; ifs.push(this.parseOrNoTernary()); }
        gens.push({ target, iter, ifs });
      }
      return gens;
    }
    parseOrNoTernary() { return this.parseOr(); }

    parseAtom() {
      const k = this.tok, line = k.line;
      switch (k.t) {
        case 'NUM': this.i++; return { k: 'Num', v: k.v, isFloat: k.isFloat, line };
        case 'STR': return this.parseStrings();
        case 'NAME':
          if (k.v === 'True') { this.i++; return { k: 'Const', v: true, line }; }
          if (k.v === 'False') { this.i++; return { k: 'Const', v: false, line }; }
          if (k.v === 'None') { this.i++; return { k: 'Const', v: null, line }; }
          if (k.v === 'lambda') return this.parseLambda();
          if (RESERVED.has(k.v)) this.fail("sintaxis inválida cerca de '" + k.v + "'");
          this.i++; return { k: 'Name', id: k.v, line };
        case 'OP':
          if (k.v === '(') {
            this.i++;
            if (this.eatOp(')')) return { k: 'Tuple', elts: [], line };
            const first = this.parseStarOrTest();
            if (this.isKw('for')) { const gens = this.parseCompFor(); this.expectOp(')'); return { k: 'GenExp', elt: first, gens, line }; }
            if (this.isOp(',')) {
              const elts = [first];
              while (this.eatOp(',')) { if (this.isOp(')')) break; elts.push(this.parseStarOrTest()); }
              this.expectOp(')'); return { k: 'Tuple', elts, line };
            }
            this.expectOp(')', '(falta cerrar el paréntesis)'); return first;
          }
          if (k.v === '[') {
            this.i++;
            if (this.eatOp(']')) return { k: 'List', elts: [], line };
            const first = this.parseStarOrTest();
            if (this.isKw('for')) { const gens = this.parseCompFor(); this.expectOp(']'); return { k: 'ListComp', elt: first, gens, line }; }
            const elts = [first];
            while (this.eatOp(',')) { if (this.isOp(']')) break; elts.push(this.parseStarOrTest()); }
            this.expectOp(']', '(falta cerrar el corchete)'); return { k: 'List', elts, line };
          }
          if (k.v === '{') {
            this.i++;
            if (this.eatOp('}')) return { k: 'Dict', keys: [], vals: [], line };
            if (this.eatOp('**')) { // dict con desempaquetado
              const keys = [null], vals = [this.parseBin(1)];
              while (this.eatOp(',')) { if (this.isOp('}')) break; if (this.eatOp('**')) { keys.push(null); vals.push(this.parseBin(1)); } else { keys.push(this.parseTest()); this.expectOp(':'); vals.push(this.parseTest()); } }
              this.expectOp('}'); return { k: 'Dict', keys, vals, line };
            }
            const first = this.parseTest();
            if (this.eatOp(':')) {
              const v = this.parseTest();
              if (this.isKw('for')) { const gens = this.parseCompFor(); this.expectOp('}'); return { k: 'DictComp', key: first, val: v, gens, line }; }
              const keys = [first], vals = [v];
              while (this.eatOp(',')) {
                if (this.isOp('}')) break;
                if (this.eatOp('**')) { keys.push(null); vals.push(this.parseBin(1)); continue; }
                keys.push(this.parseTest()); this.expectOp(':'); vals.push(this.parseTest());
              }
              this.expectOp('}', '(falta cerrar la llave)'); return { k: 'Dict', keys, vals, line };
            }
            if (this.isKw('for')) { const gens = this.parseCompFor(); this.expectOp('}'); return { k: 'SetComp', elt: first, gens, line }; }
            const elts = [first];
            while (this.eatOp(',')) { if (this.isOp('}')) break; elts.push(this.parseTest()); }
            this.expectOp('}', '(falta cerrar la llave)'); return { k: 'Set', elts, line };
          }
          if (k.v === '...') { this.i++; return { k: 'Const', v: null, line }; }
      }
      if (k.t === 'NEWLINE' || k.t === 'EOF') this.fail('la expresión está incompleta');
      this.fail('sintaxis inválida cerca de ' + (k.v === '\n' ? 'el final de la línea' : "'" + k.v + "'"));
    }

    parseStrings() {
      const line = this.tok.line; const parts = []; let anyF = false;
      while (this.peekIs('STR')) {
        const t = this.tok; this.i++;
        if (t.f) { anyF = true; parts.push(...this.parseFString(t.raw ? t.rawBody : t.rawBody, t.raw, t.line)); }
        else parts.push({ s: t.v });
      }
      if (!anyF) return { k: 'Str', v: parts.map(p => p.s).join(''), line };
      return { k: 'FStr', parts, line };
    }
    /** divide el cuerpo de un f-string en literales y expresiones */
    parseFString(body, raw, line) {
      const parts = []; let lit = '', i = 0; const n = body.length;
      const flush = () => { if (lit) { parts.push({ s: raw ? lit : unescapeStr(lit, line) }); lit = ''; } };
      while (i < n) {
        const c = body[i];
        if (c === '{') {
          if (body[i + 1] === '{') { lit += '{'; i += 2; continue; }
          flush();
          let j = i + 1, depth = 0, q = null;
          let exprEnd = -1, convPos = -1, specPos = -1;
          for (; j < n; j++) {
            const ch = body[j];
            if (q) { if (ch === q) q = null; continue; }
            if (ch === '"' || ch === "'") { q = ch; continue; }
            if ('([{'.includes(ch)) depth++;
            else if (')]'.includes(ch)) depth--;
            else if (ch === '}') { if (depth === 0) break; depth--; }
            else if (depth === 0 && ch === '!' && body[j + 1] !== '=' && convPos < 0 && specPos < 0) convPos = j;
            else if (depth === 0 && ch === ':' && specPos < 0) specPos = j;
          }
          if (j >= n) throw new PySyntaxError("f-string: falta '}'", line);
          const endExpr = convPos >= 0 ? convPos : (specPos >= 0 ? specPos : j);
          const exprSrc = body.slice(i + 1, endExpr).trim();
          if (!exprSrc) throw new PySyntaxError('f-string: expresión vacía', line);
          let conv = null; if (convPos >= 0) conv = body[convPos + 1];
          let spec = null;
          if (specPos >= 0) spec = this.parseFString(body.slice(specPos + 1, j), raw, line);
          parts.push({ e: parseExpressionSrc(exprSrc.replace(/=$/, ''), line), conv, spec });
          i = j + 1; continue;
        }
        if (c === '}') { if (body[i + 1] === '}') { lit += '}'; i += 2; continue; } throw new PySyntaxError("f-string: '}' suelta", line); }
        lit += c; i++;
      }
      flush();
      return parts;
    }
  }

  function parseExpressionSrc(src, line) {
    const toks = tokenize(src.replace(/\n/g, ' '));
    toks.forEach(t => { if (line) t.line = line; });
    const p = new Parser(toks);
    const e = p.parseTestlistStar();
    if (!p.peekIs('NEWLINE') && !p.peekIs('EOF')) p.fail('sintaxis inválida en la expresión');
    return e;
  }
  function parseModule(src) { return new Parser(tokenize(src)).parseModule(); }

  /** recorre el AST llamando a fn(nodo, padre) */
  function walk(node, fn, parent) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { for (const n of node) walk(n, fn, parent); return; }
    if (node.k) { if (fn(node, parent) === false) return; }
    for (const key in node) {
      if (key === 'k' || key === 'line') continue;
      const v = node[key];
      if (v && typeof v === 'object') walk(v, fn, node.k ? node : parent);
    }
  }

  ET.PyParse = { tokenize, parseModule, parseExpressionSrc, PySyntaxError, walk };
})(typeof window !== 'undefined' ? window : globalThis);
