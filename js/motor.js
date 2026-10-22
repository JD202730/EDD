/* motor.js — estado persistente, dominio por etapa, desbloqueos, selección adaptativa,
   banco de errores, generación de exámenes y recomendaciones. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, Banco = ET.Banco, Tipos = ET.Tipos, Tm = ET.Temario;
  const KEY = 'ed_trainer_v1';
  const ETAPAS = ['A', 'B', 'C'];
  const RANGO = { A: [1, 3], B: [2, 4], C: [3, 5] };
  const PISTA_F = [1, 0.85, 0.7, 0.5];
  const CASO_TPLS = ['n7-caso-3', 'n7-primer-nodo', 'n7-rotacion-arbol', 'n7-taller-insercion'];
  const kEt = (n, e) => 'N' + n + e;
  const hoy = () => new Date().toISOString().slice(0, 10);

  const vacio = () => ({
    v: 1, creado: Date.now(),
    config: { umbral: 80, desbloqueoLibre: false, tema: 'auto', animVel: 650, ejecutarEnExamen: false },
    xp: 0, racha: { dias: 0, ultimo: null },
    stats: { resp: 0, ok1: 0, sinPistas: 0, pistas: 0, exResp: 0, exOk: 0 },
    etapas: {}, conceptos: {}, tpls: {}, confusiones: {}, errores: {}, historial: [], examenes: [], examenActivo: null, objetivos: {}
  });
  let E = cargar();
  function cargar() {
    const s = U.Store.get(KEY, null);
    if (!s || s.v !== 1) return vacio();
    const base = vacio();
    return Object.assign(base, s, { config: Object.assign(base.config, s.config || {}), stats: Object.assign(base.stats, s.stats || {}) });
  }
  let guardando = null;
  function guardar() { U.Store.set(KEY, E); }
  const guardarDif = () => { clearTimeout(guardando); guardando = setTimeout(guardar, 150); };

  const M = ET.Motor = {};
  M.estado = () => E;
  M.guardar = guardar;
  M.reiniciar = () => { E = vacio(); guardar(); };
  M.exportar = () => JSON.stringify(E, null, 1);
  M.importar = (txt) => { const s = JSON.parse(txt); if (!s || s.v !== 1) throw new Error('Archivo de progreso no válido'); E = Object.assign(vacio(), s); guardar(); };
  M.config = () => E.config;
  M.setConfig = (k, v) => { E.config[k] = v; guardar(); };
  M.ETAPAS = ETAPAS; M.RANGO = RANGO;

  /* ============ dominio y desbloqueos ============ */
  const eta = (n, e) => E.etapas[kEt(n, e)] || (E.etapas[kEt(n, e)] = { hist: [], intentos: 0, ok1: 0, pistas: 0 });
  M.etapaInfo = (n, e) => { const x = E.etapas[kEt(n, e)]; return x || { hist: [], intentos: 0, ok1: 0, pistas: 0 }; };
  M.dominio = (n, e) => { const h = M.etapaInfo(n, e).hist.slice(-10); return { n: h.length, dom: h.length ? U.avg(h) : 0 }; };
  M.etapaCompleta = (n, e) => { const d = M.dominio(n, e); return d.n >= 5 && d.dom * 100 >= E.config.umbral - 1e-9; };
  M.nivelCompleto = n => M.etapaCompleta(n, 'C');
  M.nivelDesbloqueado = n => E.config.desbloqueoLibre || n === 1 || M.nivelCompleto(n - 1);
  M.etapaDesbloqueada = (n, e) => {
    if (E.config.desbloqueoLibre) return true;
    if (!M.nivelDesbloqueado(n)) return false;
    if (e === 'A') return true;
    return M.etapaCompleta(n, e === 'B' ? 'A' : 'B');
  };
  M.avanceEtapa = (n, e) => { const d = M.dominio(n, e); if (M.etapaCompleta(n, e)) return 1; return d.n ? Math.min(0.97, d.dom * Math.min(1, d.n / 5)) : 0; };
  M.progresoNivel = n => U.avg(ETAPAS.map(e => M.avanceEtapa(n, e)));
  M.progresoGlobal = () => U.avg(Tm.niveles.map(l => M.progresoNivel(l.id)));
  M.etapaActual = n => { for (const e of ETAPAS) if (!M.etapaCompleta(n, e)) return e; return 'C'; };
  M.nivelesDesbloqueados = () => Tm.niveles.map(l => l.id).filter(M.nivelDesbloqueado);

  /* ============ conceptos ============ */
  const conc = id => E.conceptos[id] || (E.conceptos[id] = { n: 0, recent: [], ex: [], ult: 0, pistas: 0 });
  M.maestria = id => {
    const c = E.conceptos[id]; if (!c) return null;
    const todo = (c.recent || []).concat(c.ex || []).slice(-10);
    return todo.length ? U.avg(todo) : null;
  };
  M.conceptoN = id => { const c = E.conceptos[id]; return c ? c.n + (c.ex ? c.ex.length : 0) : 0; };
  M.erroresPorConcepto = () => {
    const m = {};
    Object.values(E.errores).forEach(e => { if (!e.resuelto) (e.conceptos || []).forEach(c => m[c] = (m[c] || 0) + 1); });
    return m;
  };
  /** conceptos a reforzar ordenados por prioridad */
  M.debiles = (nivel) => {
    const errs = M.erroresPorConcepto(); const out = [];
    Object.keys(Tm.conceptos).forEach(id => {
      if (nivel && Tm.conceptos[id].nivel !== nivel) return;
      const ma = M.maestria(id), n = M.conceptoN(id), er = errs[id] || 0;
      if (ma === null && !er) return;
      const base = ma === null ? 0.5 : ma;
      const prio = (1 - base) * (0.5 + Math.min(1, n / 4)) + er * 0.18;
      if ((ma !== null && ma < 0.7 && n >= 2) || er >= 2) out.push({ id, mastery: ma, n, errores: er, prio });
    });
    return out.sort((a, b) => b.prio - a.prio);
  };

  /* ============ estadísticas ============ */
  M.stats = () => {
    const s = E.stats;
    return {
      respondidas: s.resp, pctCorrectas: s.resp ? s.ok1 / s.resp : null, pctSinPistas: s.resp ? s.sinPistas / s.resp : null, pistas: s.pistas, xp: E.xp, racha: E.racha.dias,
      exRespondidas: s.exResp, exPct: s.exResp ? s.exOk / s.exResp : null, erroresAbiertos: Object.values(E.errores).filter(e => !e.resuelto).length, examenes: E.examenes.length
    };
  };
  M.nivelJugador = () => ({ nivel: Math.floor(Math.sqrt(E.xp / 60)) + 1, sig: Math.pow(Math.floor(Math.sqrt(E.xp / 60)) + 1, 2) * 60, ant: Math.pow(Math.floor(Math.sqrt(E.xp / 60)), 2) * 60 });
  function tocarRacha() {
    const h = hoy(); if (E.racha.ultimo === h) return;
    const ayer = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    E.racha.dias = E.racha.ultimo === ayer ? E.racha.dias + 1 : 1; E.racha.ultimo = h;
  }

  /* ============ registro de resultados ============ */
  /** info: {pistas, fallosPrevios, resuelta, verSolucion, ms, resp} */
  M.registrarPractica = function (q, res, info) {
    const k = kEt(q.nivel, q.etapa); const et = eta(q.nivel, q.etapa);
    const resuelta = !!info.resuelta && !info.verSolucion;
    let credito = resuelta ? res.score * PISTA_F[Math.min(3, info.pistas || 0)] * (info.fallosPrevios ? 0.6 : 1) : Math.min(res.score || 0, 0.99) * 0.3;
    const antes = M.etapaCompleta(q.nivel, q.etapa);
    et.hist.push(+credito.toFixed(3)); if (et.hist.length > 24) et.hist.shift();
    et.intentos++; if (resuelta && !info.fallosPrevios) et.ok1++; et.pistas += info.pistas || 0;
    (q.conceptos || []).forEach(c => { const x = conc(c); x.n++; x.recent.push(+credito.toFixed(2)); if (x.recent.length > 10) x.recent.shift(); x.ult = Date.now(); x.pistas += info.pistas || 0; });
    const t = E.tpls[q.tplId] || (E.tpls[q.tplId] = { n: 0, ok: 0, ult: 0 }); t.n++; t.ult = Date.now(); if (resuelta) t.ok++;
    E.stats.resp++; if (resuelta && !info.fallosPrevios) E.stats.ok1++; if (resuelta && !info.pistas && !info.fallosPrevios) E.stats.sinPistas++; E.stats.pistas += info.pistas || 0;
    let xp = 0; if (resuelta) xp = Math.round(10 * q.dif * credito) + (!info.fallosPrevios && !info.pistas ? 5 : 0);
    E.xp += xp; tocarRacha();
    E.historial.push({ t: Date.now(), modo: 'practica', tpl: q.tplId, seed: q.seed, ok: resuelta, score: +(res.score || 0).toFixed(2), pistas: info.pistas || 0, ms: info.ms || 0, n: q.nivel, e: q.etapa });
    if (E.historial.length > 1500) E.historial.splice(0, E.historial.length - 1500);
    // dificultad objetivo
    const ob = E.objetivos[k] || (E.objetivos[k] = { obj: (RANGO[q.etapa][0] + RANGO[q.etapa][1]) / 2, buenas: 0, malas: 0 });
    if (resuelta && credito >= 0.85) { ob.buenas++; ob.malas = 0; } else if (!resuelta || credito < 0.5) { ob.malas++; ob.buenas = 0; } else { ob.buenas = 0; ob.malas = 0; }
    if (ob.buenas >= 3) { ob.obj = Math.min(RANGO[q.etapa][1], ob.obj + 0.5); ob.buenas = 0; }
    if (ob.malas >= 2) { ob.obj = Math.max(RANGO[q.etapa][0], ob.obj - 0.5); ob.malas = 0; }
    // resolver error pendiente si era un reintento
    const ek = q.tplId + ':' + q.seed; if (E.errores[ek] && resuelta) { E.errores[ek].aciertos = (E.errores[ek].aciertos || 0) + 1; E.errores[ek].intentos.push({ t: Date.now(), modo: 'practica', ok: true }); if (!info.pistas) E.errores[ek].resuelto = true; }
    guardar();
    const despues = M.etapaCompleta(q.nivel, q.etapa);
    return { credito, xp, etapaNueva: !antes && despues, nivelNuevo: !antes && despues && q.etapa === 'C' };
  };
  M.registrarError = function (q, resp, res, modo) {
    const key = q.tplId + ':' + q.seed; const mod = Tipos.mod(q);
    const e = E.errores[key] || (E.errores[key] = { key, tplId: q.tplId, seed: q.seed, opts: q.opts || null, nivel: q.nivel, etapa: q.etapa, tema: q.tema, conceptos: q.conceptos, fecha: Date.now(), veces: 0, intentos: [], resuelto: false });
    e.veces++; e.ult = Date.now(); e.resuelto = false; e.aciertos = 0;
    e.intentos.push({ t: Date.now(), modo, ok: false, score: +(res.score || 0).toFixed(2) });
    if (e.intentos.length > 12) e.intentos.shift();
    try { e.resp = mod.respuestaHtml(q, resp); } catch (x) { e.resp = ''; }
    if (res.confusion) { const key2 = res.confusion.dado + '>' + res.confusion.correcta; E.confusiones[key2] = (E.confusiones[key2] || 0) + 1; }   // se cuenta en cada intento fallido (práctica o examen)
    guardar();
  };
  M.errores = () => Object.values(E.errores).sort((a, b) => (b.ult || 0) - (a.ult || 0));
  M.marcarResuelto = (key, v) => { if (E.errores[key]) { E.errores[key].resuelto = v; guardar(); } };
  M.borrarError = key => { delete E.errores[key]; guardar(); };
  M.limpiarResueltos = () => { Object.keys(E.errores).forEach(k => { if (E.errores[k].resuelto) delete E.errores[k]; }); guardar(); };
  /** confusión de caso (p. ej. elegir LR cuando era RL) detectada fuera de una corrección normal, como en el taller interactivo */
  M.registrarConfusion = (dado, correcta) => { const k = dado + '>' + correcta; E.confusiones[k] = (E.confusiones[k] || 0) + 1; guardarDif(); };
  M.confusiones = () => Object.entries(E.confusiones).map(([k, n]) => { const [a, b] = k.split('>'); return { dado: a, correcta: b, n }; }).sort((x, y) => y.n - x.n);

  /* ============ selección adaptativa (práctica) ============ */
  M.objetivo = (n, e) => (E.objetivos[kEt(n, e)] || { obj: (RANGO[e][0] + RANGO[e][1]) / 2 }).obj;
  /** ctx: {ultimos:[tplId...], foco:[conceptos], nivel,etapa} -> {tplId, seed, opts} */
  M.siguiente = function (nivel, etapa, ctx) {
    ctx = ctx || {};
    let pool = nivel ? Banco.filtrar({ niveles: [nivel], etapas: [etapa] }) : Banco.filtrar({ niveles: M.nivelesDesbloqueados() });
    let foco = ctx.foco && ctx.foco.length ? ctx.foco : null;
    if (!foco && nivel) {
      const d = M.debiles(nivel).slice(0, 3).map(x => x.id);
      if (d.length && Math.random() < 0.35) foco = d;
    }
    if (foco) { const sub = pool.filter(t => t.c.some(c => foco.includes(c))); if (sub.length) pool = sub; else if (!nivel) pool = Banco.filtrar({}); }
    if (!pool.length) pool = Banco.filtrar({ niveles: [nivel || 1] });
    const obj = nivel ? M.objetivo(nivel, etapa) : 3; const ult = ctx.ultimos || [];
    const t = new U.RNG(U.newSeed()).weighted(pool, tp => {
      let w = 1; const deb = tp.c.map(c => { const m = M.maestria(c); return m === null ? 0.5 : 1 - m; });
      w *= 0.5 + 1.5 * U.avg(deb);
      const i = ult.lastIndexOf(tp.id); if (i >= 0) w *= (ult.length - i <= 1 ? 0.03 : (ult.length - i <= 3 ? 0.3 : 0.7));
      w *= Math.exp(-0.45 * Math.abs(tp.dif - obj));
      const dom = nivel ? M.dominio(nivel, etapa) : { dom: 0, n: 0 };
      if (dom.n >= 5 && dom.dom > 0.85 && tp.dif < obj - 0.9) w *= 0.3;   // dominio alto: menos preguntas demasiado sencillas
      if (!E.tpls[tp.id]) w *= 1.3;
      if (foco && CASO_TPLS.includes(tp.id) && foco.some(c => /^av_(ll|rr|lr|rl)$/.test(c))) w *= 4;   // rotaciones específicas: prioridad a los ejercicios con caso forzado
      return w;
    });
    let opts = null;
    if (CASO_TPLS.includes(t.id)) {
      const conf = M.confusiones().filter(c => c.n >= 2 && ['LL', 'RR', 'LR', 'RL'].includes(c.dado));
      const casoDebil = ((foco || []).map(c => ({ av_ll: 'LL', av_rr: 'RR', av_lr: 'LR', av_rl: 'RL' }[c])).filter(Boolean));
      const cand = casoDebil.concat(conf.flatMap(c => [c.dado, c.correcta]));
      if (cand.length && Math.random() < (casoDebil.length ? 0.9 : 0.7)) opts = { caso: cand[Math.floor(Math.random() * cand.length)] };
    }
    return { tplId: t.id, seed: U.newSeed(), opts };
  };
  /** pregunta más sencilla del mismo tema (tras varios errores) */
  M.masSencilla = function (q) {
    const pool = Banco.filtrar({ niveles: [q.nivel], conceptos: q.conceptos, excluir: [q.tplId] }).filter(t => t.dif <= q.dif);
    if (pool.length) { const t = new U.RNG(U.newSeed()).pick(pool.sort((a, b) => a.dif - b.dif).slice(0, Math.max(2, Math.ceil(pool.length / 2)))); return { tplId: t.id, seed: U.newSeed(), opts: null }; }
    return { tplId: q.tplId, seed: U.newSeed(), opts: q.opts || null };
  };
  M.similar = function (q) {
    const mismo = { tplId: q.tplId, seed: U.newSeed(), opts: q.opts || null };
    return mismo;
  };

  /* ============ exámenes ============ */
  const CAT_PESO = { teoria: 1, analisis: 1.5, implementacion: 2.5 };
  M.catDe = t => { Banco.categoriaDe(t); return t._cat; };
  M.pesoPregunta = q => CAT_PESO[Tipos.categoria(q)] * (0.8 + 0.1 * q.dif);
  M.cfgExamenDefault = () => ({ niveles: M.nivelesDesbloqueados(), n: 10, dificultad: 'mixta', tiempo: false, minutos: 30, revisar: true, dist: { teoria: 30, analisis: 40, implementacion: 30 }, incluirVF: true, incluirBigO: true, incluirArboles: true, incluirIntegradoras: true, consola: !!E.config.ejecutarEnExamen, acumulativo: false });
  function repartir(n, pesos) {
    const tot = U.sum(Object.values(pesos)); if (!tot) return {};
    const raw = Object.entries(pesos).map(([k, v]) => [k, v / tot * n]); const out = {}; let usados = 0;
    raw.forEach(([k, v]) => { out[k] = Math.floor(v); usados += out[k]; });
    raw.sort((a, b) => (b[1] % 1) - (a[1] % 1)); for (let i = 0; usados < n; i = (i + 1) % raw.length) { out[raw[i][0]]++; usados++; }
    return out;
  }
  M.generarExamen = function (cfg, evitar) {
    evitar = evitar || [];
    const difR = { basica: [1, 2], media: [2, 4], dificil: [4, 5], mixta: [1, 5] }[cfg.dificultad] || [1, 5];
    let niveles = cfg.acumulativo ? M.nivelesDesbloqueados() : cfg.niveles;
    if (!niveles || !niveles.length) niveles = [1];
    let pool = Banco.filtrar({ niveles, dif: difR }).filter(t => !t.soloPractica);   // los talleres interactivos son solo de práctica
    pool.forEach(t => Banco.categoriaDe(t));
    if (!cfg.incluirVF) pool = pool.filter(t => t._tipo !== 'vf');
    if (!cfg.incluirBigO) pool = pool.filter(t => t._tipo !== 'bigo');
    if (!cfg.incluirArboles) pool = pool.filter(t => t.n !== 6 && t.n !== 7);
    if (!cfg.incluirIntegradoras) pool = pool.filter(t => t.n !== 8 && t._tipo !== 'mixta');
    if (!pool.length) pool = Banco.filtrar({ niveles }).filter(t => !t.soloPractica);
    if (!pool.length) pool = Banco.filtrar({}).filter(t => !t.soloPractica);
    pool.forEach(t => Banco.categoriaDe(t));
    const porCat = { teoria: [], analisis: [], implementacion: [] }; pool.forEach(t => porCat[t._cat].push(t));
    const pesos = {}; Object.keys(porCat).forEach(c => { if (porCat[c].length) pesos[c] = cfg.dist && cfg.dist[c] !== undefined ? cfg.dist[c] : 1; });
    if (!U.sum(Object.values(pesos))) Object.keys(porCat).forEach(c => { if (porCat[c].length) pesos[c] = 1; });
    const cuotas = repartir(cfg.n, pesos); const rng = new U.RNG(U.newSeed());
    const usadoNivel = {}, usadoTpl = {}; const items = [];
    const orden = Object.keys(cuotas).sort((a, b) => cuotas[b] - cuotas[a]);
    // se rellenan los huecos alternando categorías para repartir niveles
    const faltan = Object.assign({}, cuotas);
    while (Object.values(faltan).some(v => v > 0)) {
      for (const cat of orden) {
        if (faltan[cat] <= 0) continue;
        const cand = porCat[cat]; if (!cand.length) { faltan[cat] = 0; continue; }
        const t = rng.weighted(cand, tp => 1 / (1 + 2 * (usadoNivel[tp.n] || 0) + 30 * (usadoTpl[tp.id] || 0) + (evitar.includes(tp.id) ? 6 : 0)));
        usadoNivel[t.n] = (usadoNivel[t.n] || 0) + 1; usadoTpl[t.id] = (usadoTpl[t.id] || 0) + 1;
        items.push({ tplId: t.id, seed: U.newSeed(), opts: null, dif: t.dif }); faltan[cat]--;
      }
    }
    items.sort((a, b) => (a.dif + rng.next() * 1.4) - (b.dif + rng.next() * 1.4));
    return items.map(({ tplId, seed, opts }) => ({ tplId, seed, opts }));
  };
  /** Parcial simulado: una pregunta de cada tipo del parcial del profesor (V/F con justificación, tabla de complejidades,
      complejidad con variable/caso/regla, algoritmo en 4 literales, programación con casos borde), 1,0 punto cada una. */
  M.PARCIAL_SLOTS = ['vf', 'tabla', 'cplx', 'alg', 'prog'];
  M.PARCIAL_NIVELES = [1, 3, 4, 5, 6, 7];
  M.generarParcial = function (cfg, evitar) {
    evitar = evitar || [];
    const niveles = cfg && cfg.niveles && cfg.niveles.length ? cfg.niveles : M.PARCIAL_NIVELES;
    const rng = new U.RNG(U.newSeed()); const usadoNivel = {}; const items = [];
    M.PARCIAL_SLOTS.forEach(slot => {
      let pool = Banco.filtrar({ niveles }).filter(t => t.parcial && t.slot === slot);
      if (!pool.length) pool = Banco.filtrar({}).filter(t => t.parcial && t.slot === slot);
      const t = rng.weighted(pool, tp => 1 / (1 + 3 * (usadoNivel[tp.n] || 0) + (evitar.includes(tp.id) ? 4 : 0)));
      usadoNivel[t.n] = (usadoNivel[t.n] || 0) + 1;
      items.push({ tplId: t.id, seed: U.newSeed(), opts: null });
    });
    return items;
  };
  M.examenActivo = () => E.examenActivo;
  M.setExamenActivo = ex => { E.examenActivo = ex; guardarDif(); };
  M.limpiarExamenActivo = () => { E.examenActivo = null; guardar(); };
  M.examenes = () => E.examenes;
  M.examenPorId = id => E.examenes.find(x => x.id === id);
  /** guarda un examen calificado: entry = {id,t,cfg,items,resp,puntaje,porNivel,porConcepto,...} */
  M.registrarExamen = function (entry, qs, resultados) {
    entry.id = entry.id || U.uid();
    E.examenes.unshift(entry); if (E.examenes.length > 40) E.examenes.length = 40;
    E.examenes.slice(20).forEach(x => { if (x.resp) x.resp = null; });   // solo se conservan respuestas de los 20 más recientes
    let ok = 0;
    qs.forEach((q, i) => {
      const r = resultados[i]; if (!r) return; const credito = r.score;
      if (r.ok) ok++;
      (q.conceptos || []).forEach(c => { const x = conc(c); x.ex.push(+credito.toFixed(2)); if (x.ex.length > 8) x.ex.shift(); x.ult = Date.now(); });
      if (!r.ok) M.registrarError(q, entry.resp ? entry.resp[i] : null, r, 'examen');
      E.historial.push({ t: Date.now(), modo: 'examen', tpl: q.tplId, seed: q.seed, ok: !!r.ok, score: +r.score.toFixed(2), pistas: 0, ms: 0, n: q.nivel, e: q.etapa });
    });
    E.stats.exResp += qs.length; E.stats.exOk += ok; E.xp += Math.round(entry.puntaje / 100 * qs.length * 8); tocarRacha();
    E.examenActivo = null; guardar();
    return entry;
  };
  M.actualizarExamen = (id, patch) => { const x = M.examenPorId(id); if (x) { Object.assign(x, patch); guardar(); } };

  /* ============ recomendaciones ============ */
  M.recomendaciones = function () {
    const out = [];
    const conf = M.confusiones().filter(c => c.n >= 2 && ['LL', 'RR', 'LR', 'RL'].includes(c.dado)).slice(0, 1);
    conf.forEach(c => out.push({ tipo: 'mal', icono: '🔀', titulo: 'Confundes ' + c.dado + ' con ' + c.correcta, texto: 'Has elegido ' + c.dado + ' cuando correspondía ' + c.correcta + ' (' + c.n + ' veces). Antes de avanzar, practica rotaciones específicas.', ruta: '#/repaso?foco=' + encodeURIComponent(['av_' + c.dado.toLowerCase(), 'av_' + c.correcta.toLowerCase(), 'av_primer'].join(',')), boton: 'Reforzar rotaciones' }));
    const deb = M.debiles().slice(0, 3);
    if (deb.length) out.push({ tipo: 'aviso', icono: '🎯', titulo: 'Conceptos a reforzar', texto: deb.map(d => Tm.conceptos[d.id].nombre + (d.mastery !== null ? ' (' + Math.round(d.mastery * 100) + ' %)' : '')).join(' · '), ruta: '#/repaso', boton: 'Repaso inteligente' });
    const pend = Object.values(E.errores).filter(e => !e.resuelto).length;
    if (pend) out.push({ tipo: '', icono: '📝', titulo: pend + ' error' + (pend > 1 ? 'es' : '') + ' pendiente' + (pend > 1 ? 's' : ''), texto: 'Revísalos y practica ejercicios similares.', ruta: '#/errores', boton: 'Ir a Mis errores' });
    if (!E.examenes.some(x => x.cfg && x.cfg.parcial)) out.push({ tipo: '', icono: '📝', titulo: 'Parcial simulado', texto: '5 preguntas de 1,0 como el parcial del profe (justificar, tablas de complejidad, algoritmo y programación con casos borde), 120 minutos y puntaje por literal.', ruta: '#/examen/config/parcial', boton: 'Hacer el parcial' });
    let cont = null;
    for (const l of Tm.niveles) { if (!M.nivelDesbloqueado(l.id)) break; const e = M.etapaActual(l.id); if (!M.etapaCompleta(l.id, e)) { cont = { n: l.id, e }; break; } }
    if (cont) out.push({ tipo: '', icono: '▶', titulo: 'Continuar: Nivel ' + cont.n + ' · Etapa ' + cont.e, texto: Tm.niveles[cont.n - 1].nombre + ' — ' + Tm.etapas[cont.e].nombre + '.', ruta: '#/practica/' + cont.n + '/' + cont.e, boton: 'Continuar' });
    else if (!out.length) out.push({ tipo: '', icono: '🏁', titulo: '¡Ruta completa!', texto: 'Domina el temario: haz un examen acumulativo para comprobarlo.', ruta: '#/examen/config/acumulativo', boton: 'Examen acumulativo' });
    return out;
  };
})(typeof window !== 'undefined' ? window : globalThis);
