/* biblioteca.js — registro y utilidades de la Biblioteca de estudio (teoría completa del curso).
   Cada tema tiene 10 partes uniformes (B.PARTES). El texto se escribe con String.raw y un markdown mínimo:
     §código§      → `código`            ~~~ … ~~~  → bloque de código
     [comp]…[/comp] → recuadro «Contenido complementario (no está en los PDF)»
     [ojo]…[/ojo]   → recuadro de advertencia / trampa
     [[id|texto]]   → enlace a otro tema (sin texto usa el título del tema) */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};
  const U = ET.U;

  const B = ET.Biblioteca = { areas: [], temas: [], porId: {}, formulas: [], tablas: [], repaso: [], autoeval: [], problemas: [] };

  /** las diez partes de cada tema, en este orden */
  B.PARTES = [
    ['definicion', 'Definición', '📘'], ['intuicion', 'Explicación intuitiva', '💡'], ['formal', 'Teoría formal', '📐'],
    ['procedimiento', 'Procedimiento', '🪜'], ['codigo', 'Código de referencia (Python)', '🐍'], ['ejemplo', 'Ejemplo resuelto', '✍'],
    ['complejidad', 'Complejidad y justificación', '⏱'], ['errores', 'Errores frecuentes', '⚠'], ['preguntas', 'Preguntas de examen', '🎓'], ['resumen', 'Resumen rápido', '⚡']
  ];

  B.areas = [
    { id: 'rec', nombre: 'Recursión', icono: '↻', color: '#6366f1', nivel: 1, fuente: 'S5-C2', desc: 'Caso base, fórmula recursiva, pila de llamadas, el costo exponencial de la recursión ingenua y cómo la memoización lo vuelve lineal.' },
    { id: 'cx', nombre: 'Complejidad y notación asintótica', icono: '∿', color: '#0ea5e9', nivel: 2, fuente: 'S2-C1 · S2-C2', desc: 'Modelo de costo, conteo de operaciones T(n), mejor/peor/promedio, O, Ω y Θ con sus demostraciones, reglas de cálculo, ciclos con log n, costos reales de Python y complejidad espacial.' },
    { id: 'pd', nombre: 'Paradigmas algorítmicos', icono: '◇', color: '#10b981', nivel: 3, fuente: 'S5-C2', desc: 'Fuerza bruta, backtracking, greedy, divide y vencerás y programación dinámica: qué resuelve cada uno, cuándo falla y cómo elegir.' },
    { id: 'ar', nombre: 'Fundamentos de árboles', icono: '⌥', color: '#84cc16', nivel: 4, fuente: 'S6-C1', desc: 'Definición de árbol, vocabulario, profundidad y altura, subárboles, árboles binarios (lleno, completo, perfecto) y el nodo en Python.' },
    { id: 'tv', nombre: 'Recorridos de árboles', icono: '⇣', color: '#f59e0b', nivel: 5, fuente: 'S6-C1', desc: 'Preorden, inorden, postorden, por niveles, para qué sirve cada uno, reconstrucción del árbol y evaluación de expresiones.' },
    { id: 'bs', nombre: 'Árboles binarios de búsqueda (BST)', icono: '⌕', color: '#ef4444', nivel: 6, fuente: 'S6-C2', desc: 'Propiedad de orden, búsqueda, inserción, eliminación con los tres casos, inorden ordenado y por qué la complejidad es O(h) y no O(log n).' },
    { id: 'av', nombre: 'Árboles AVL', icono: '⚖', color: '#d946ef', nivel: 7, fuente: 'S7-C1', desc: 'Factor de balance, rotaciones, los cuatro casos, inserción (una rotación como máximo) y eliminación (posiblemente varias) con el código completo de la clase.' },
    { id: 'rn', nombre: 'Árboles rojo-negro', icono: '●', color: '#475569', nivel: 7, fuente: 'S7-C1', desc: 'Reglas de color, altura negra, inserción en tres casos, eliminación con el nodo doble negro en cuatro casos, código de referencia y comparación con el AVL.' },
    { id: 'ad', nombre: 'Temas adicionales', icono: '✚', color: '#8b5cf6', nivel: 8, fuente: 'Todos', desc: 'BST frente a tabla hash, conexiones con IA, trampas de Python para el examen y cómo responder preguntas tipo parcial.' }
  ];
  B.areaPorId = {}; B.areas.forEach(a => { B.areaPorId[a.id] = a; });

  /* ---------- registro ---------- */
  /** def: {id, area, titulo, fuente, nivel?, conceptos[], interactivo[], comp?, + una propiedad por cada parte de B.PARTES} */
  B.tema = function (def) {
    if (B.porId[def.id]) { B.problemas.push('Tema duplicado: ' + def.id); return def; }
    if (!B.areaPorId[def.area]) B.problemas.push('Tema ' + def.id + ': área desconocida «' + def.area + '»');
    B.PARTES.forEach(([k]) => { if (def[k] === undefined || def[k] === null || (typeof def[k] === 'string' && !def[k].trim()) || (Array.isArray(def[k]) && !def[k].length)) B.problemas.push('Tema ' + def.id + ': falta la parte «' + k + '»'); });
    def.conceptos = def.conceptos || []; def.interactivo = def.interactivo || [];
    def.orden = B.temas.length;
    B.temas.push(def); B.porId[def.id] = def; B._ord = null; B._ind = null;
    return def;
  };
  B.formula = function (def) { B.formulas.push(def); B._ind = null; return def; };
  B.tabla = function (def) { B.tablas.push(def); B._ind = null; return def; };
  B.repasoSec = function (def) { B.repaso.push(def); return def; };
  B.autoevalua = function (area, lista) { lista.forEach(([p, r]) => B.autoeval.push({ area, p, r })); };

  /** temas en el orden del temario (por área y por orden de registro) */
  B.ordenados = function () {
    if (B._ord) return B._ord;
    const o = []; B.areas.forEach(a => B.temas.filter(t => t.area === a.id).sort((x, y) => x.orden - y.orden).forEach(t => o.push(t)));
    return (B._ord = o);
  };
  B.temasDeArea = id => B.ordenados().filter(t => t.area === id);
  B.vecinos = function (id) { const o = B.ordenados(), i = o.findIndex(t => t.id === id); return { ant: i > 0 ? o[i - 1] : null, sig: i >= 0 && i < o.length - 1 ? o[i + 1] : null }; };
  B.temasDeConcepto = c => B.ordenados().filter(t => t.conceptos.includes(c));
  B.conceptosDeArea = id => Array.from(new Set(B.temasDeArea(id).flatMap(t => t.conceptos)));
  B.temasDeEjemplo = ej => B.ordenados().filter(t => t.interactivo.includes(ej));
  /** configuración de examen/práctica centrada en un tema o un área: {titulo, niveles, conceptos} (o null) */
  B.preset = function (clave) {
    let m;
    if ((m = /^tema-(.+)$/.exec(clave))) { const t = B.porId[m[1]]; if (!t || !t.conceptos.length) return null; return { titulo: 'Examen del tema: ' + t.titulo, conceptos: t.conceptos.slice(), niveles: nivelesDe(t.conceptos, t.nivel) }; }
    if ((m = /^area-(.+)$/.exec(clave))) { const a = B.areaPorId[m[1]]; const cs = a ? B.conceptosDeArea(a.id) : []; if (!cs.length) return null; return { titulo: 'Examen del área: ' + a.nombre, conceptos: cs, niveles: nivelesDe(cs, a.nivel) }; }
    return null;
  };
  function nivelesDe(cs, def) { const Tm = ET.Temario; const s = new Set(); cs.forEach(c => { if (Tm && Tm.conceptos[c]) s.add(Tm.conceptos[c].nivel); }); return s.size ? Array.from(s).sort((a, b) => a - b) : [def || 1]; }

  /* ---------- progreso (se guarda con el resto del estado en el motor) ---------- */
  const M = () => ET.Motor;
  B.estado = () => M().biblioteca();
  B.estudiado = id => !!B.estado().estudiados[id];
  B.favorito = id => !!B.estado().favoritos[id];
  B.progresoArea = function (id) { const ts = B.temasDeArea(id); const n = ts.filter(t => B.estudiado(t.id)).length; return { n, total: ts.length, p: ts.length ? n / ts.length : 0 }; };
  B.progresoGlobal = function () { const ts = B.ordenados(); const n = ts.filter(t => B.estudiado(t.id)).length; return { n, total: ts.length, p: ts.length ? n / ts.length : 0 }; };
  B.siguientePendiente = function () { const est = B.estado(); const u = est.ultimo && B.porId[est.ultimo]; const o = B.ordenados(); const desde = u ? o.indexOf(u) + 1 : 0; return o.slice(desde).concat(o.slice(0, desde)).find(t => !B.estudiado(t.id)) || null; };
  /** maestría media en práctica de los conceptos de un tema (null si no hay datos) */
  B.maestriaTema = function (t) { const v = t.conceptos.map(c => M().maestria(c)).filter(x => x !== null); return v.length ? U.avg(v) : null; };
  B.erroresTema = function (t) { if (!t.conceptos.length) return 0; return M().errores().filter(e => !e.resuelto && (e.conceptos || []).some(c => t.conceptos.includes(c))).length; };

  /* ---------- texto → HTML ---------- */
  const fix = s => String(s).replace(/\r/g, '').replace(/§/g, '`').replace(/^~~~(.*)$/gm, '```$1');
  function nucleo(t) {
    let out = '';
    t.split(/(```[\s\S]*?```)/g).forEach((p, i) => {
      if (i % 2 === 1) { out += U.md(p); return; }
      p.split(/\n{2,}/).forEach(b => { b = b.replace(/^\n+|\n+$/g, ''); if (b.trim()) out += U.md(b); });
    });
    return out;
  }
  const CAJAS = { comp: ['bib-comp', 'Contenido complementario · no está en los PDF del curso'], ojo: ['bib-ojo', 'Ojo'] };
  function enlaces(html) {
    return html.replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, txt) => { const t = B.porId[id]; return '<a class="bib-enl" href="#/biblioteca/' + id + '">' + (txt || (t ? t.titulo : id)) + '</a>'; });
  }
  B.html = function (src) {
    if (src === undefined || src === null) return '';
    const t = fix(src); let out = '', last = 0, m; const re = /\[(comp|ojo)\]([\s\S]*?)\[\/\1\]/g;
    while ((m = re.exec(t)) !== null) {
      out += nucleo(t.slice(last, m.index));
      out += '<div class="' + CAJAS[m[1]][0] + '"><div class="bib-caja-t">' + CAJAS[m[1]][1] + '</div>' + nucleo(m[2]) + '</div>';
      last = re.lastIndex;
    }
    out += nucleo(t.slice(last));
    return enlaces(out);
  };
  /** texto plano (para búsqueda y pruebas) */
  B.plano = function (src) {
    if (src === undefined || src === null) return '';
    if (Array.isArray(src)) return src.map(B.plano).join(' ');
    if (typeof src === 'object') return Object.values(src).map(B.plano).join(' ');
    return fix(src).replace(/\[\/?(comp|ojo)\]/g, ' ').replace(/\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g, (m, id, t) => t || id).replace(/```[a-z]*/g, ' ').replace(/[`*|]/g, ' ').replace(/\s+/g, ' ').trim();
  };

  /* ---------- búsqueda ---------- */
  const PESO = { titulo: 8, definicion: 4, formal: 3, intuicion: 2, resumen: 2 };
  function indice() {
    if (B._ind) return B._ind;
    const quita = s => U.quitaAcentos(s).toLowerCase();
    const mk = txt => { const plano = B.plano(txt); return { plano, n: quita(plano) }; };
    const ind = { temas: {}, formulas: [], tablas: [] };
    B.ordenados().forEach(t => {
      const partes = {}; B.PARTES.forEach(([k]) => { partes[k] = mk(t[k]); }); partes.titulo = mk(t.titulo + ' ' + (t.alias || ''));
      ind.temas[t.id] = partes;
    });
    B.formulas.forEach(f => ind.formulas.push({ f, x: mk([f.nombre, f.formula, f.variables, f.cuando, f.ejemplo, f.condiciones, f.alias || ''])}));
    B.tablas.forEach(tb => ind.tablas.push({ tb, x: mk([tb.titulo, tb.md, tb.nota || '', tb.alias || ''])}));
    return (B._ind = ind);
  }
  function fragmento(x, toks) {
    let p = -1; for (const tk of toks) { const i = x.n.indexOf(tk); if (i >= 0 && (p < 0 || i < p)) p = i; }
    if (p < 0) return x.plano.slice(0, 110);
    const a = Math.max(0, p - 40), b = Math.min(x.plano.length, p + 90);
    return (a > 0 ? '…' : '') + x.plano.slice(a, b) + (b < x.plano.length ? '…' : '');
  }
  /** todas las palabras de la consulta deben aparecer; resultados ordenados por relevancia */
  B.buscar = function (q) {
    const toks = U.norm(q || '').split(' ').filter(w => w.length >= 2); if (!toks.length) return [];
    const ind = indice(); const res = [];
    const nombres = Object.fromEntries(B.PARTES.map(([k, n]) => [k, n])); nombres.titulo = 'Título';
    B.ordenados().forEach(t => {
      const P = ind.temas[t.id]; const todo = Object.values(P).map(x => x.n).join(' ');
      if (!toks.every(tk => todo.includes(tk))) return;
      let score = 0, mejor = null, mejorS = -1;
      Object.keys(P).forEach(k => { const hits = toks.filter(tk => P[k].n.includes(tk)).length; if (!hits) return; const s = hits * (PESO[k] || 1) + (hits === toks.length ? 3 : 0); score += s; if (s > mejorS) { mejorS = s; mejor = k; } });
      res.push({ tipo: 'tema', id: t.id, titulo: t.titulo, area: t.area, parte: mejor, parteNombre: nombres[mejor], frag: fragmento(P[mejor], toks), score });
    });
    ind.formulas.forEach(({ f, x }) => { if (toks.every(tk => x.n.includes(tk))) res.push({ tipo: 'formula', id: f.id, titulo: f.nombre, area: f.area, frag: f.formula, score: 6 + toks.filter(tk => U.norm(f.nombre).includes(tk)).length * 3 }); });
    ind.tablas.forEach(({ tb, x }) => { if (toks.every(tk => x.n.includes(tk))) res.push({ tipo: 'tabla', id: tb.id, titulo: tb.titulo, area: tb.area, frag: fragmento(x, toks), score: 4 + toks.filter(tk => U.norm(tb.titulo).includes(tk)).length * 3 }); });
    return res.sort((a, b) => b.score - a.score).slice(0, 40);
  };
})(typeof window !== 'undefined' ? window : globalThis);
