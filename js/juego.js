/* juego.js — gamificación: monedas, vidas, escudos de racha, meta diaria, logros y tienda.
   Se apoya en el estado del Motor (E.juego, se guarda con el resto del progreso) y escucha sus eventos (M.on): practica, examen.
   NO inventa datos: cada cifra sale de lo que el estudiante hizo; las reglas de premio están en PREMIOS y se explican en la Tienda. */
(function (global) {
  'use strict';
  const ET = global.ET, M = ET.Motor, Tm = ET.Temario;
  const Juego = ET.Juego = {};

  /* ===================== reglas (se muestran tal cual en la pantalla «Tienda») ===================== */
  const MAX_VIDAS = 5, REGEN_MS = 20 * 60 * 1000;
  const PREMIOS = { ejercicio: 1, sinAyuda: 1, etapa: 10, nivel: 25, leccion: 5, leccionPerfecta: 5, reto: 20, logro: 10, examenPorPunto: 3, examenTope: 15 };
  const RETO = { preguntas: 10, xpBonus: 30, aciertosMin: 7 };   // el reto gasta las vidas de siempre (hasta MAX_VIDAS)
  Juego.MAX_VIDAS = MAX_VIDAS; Juego.REGEN_MS = REGEN_MS; Juego.PREMIOS = PREMIOS; Juego.RETO = RETO;

  const base = () => ({
    monedas: 0, movs: [], vidas: { n: MAX_VIDAS, t: Date.now() }, escudos: 0, mejorRacha: 0, escudosUsados: [], diario: {}, logros: {}, nuevos: [],
    paleta: 'indigo', paletas: ['indigo'], metaDiaria: 30, visto: { labs: {}, talleres: 0 }, compras: 0, lecciones: { n: 0, perfectas: 0 }, retos: { intentos: 0, superados: 0, porNivel: {} }
  });
  /** el bloque del juego dentro del estado del Motor (se completa con valores por defecto si falta algo: partidas guardadas antes de existir el juego) */
  const J = Juego.estado = function () {
    const e = M.estado(); if (!e.juego) e.juego = base();
    const b = base(), j = e.juego; Object.keys(b).forEach(k => { if (j[k] === undefined) j[k] = b[k]; });
    ['visto', 'lecciones', 'retos'].forEach(k => Object.keys(b[k]).forEach(s => { if (j[k][s] === undefined) j[k][s] = b[k][s]; }));
    if (j.paleta === 'bosque') j.paleta = 'uva';                                   // la paleta «Bosque» pasó a ser «Uva» (la clásica ya es verde)
    j.paletas = j.paletas.map(p => p === 'bosque' ? 'uva' : p);
    return j;
  };
  const guardar = () => M.guardar();

  /* ===================== monedas ===================== */
  Juego.monedas = () => J().monedas;
  Juego.dar = function (n, motivo) {
    n = Math.round(n); if (!(n > 0)) return 0; const j = J(); j.monedas += n;
    j.movs.unshift({ t: Date.now(), n, motivo }); if (j.movs.length > 80) j.movs.length = 80;
    if (Juego.ultimoPremio) Juego.ultimoPremio.monedas += n;
    return n;
  };
  Juego.gastar = function (n, motivo) {
    const j = J(); if (j.monedas < n) return false; j.monedas -= n;
    j.movs.unshift({ t: Date.now(), n: -n, motivo }); if (j.movs.length > 80) j.movs.length = 80; return true;
  };

  /* ===================== vidas (solo en los retos) ===================== */
  /** recarga perezosa: 1 vida cada REGEN_MS mientras no estén completas */
  Juego.vidas = function () {
    const v = J().vidas, ahora = Date.now();
    if (v.n < MAX_VIDAS) { const ganadas = Math.floor((ahora - v.t) / REGEN_MS); if (ganadas > 0) { v.n = Math.min(MAX_VIDAS, v.n + ganadas); v.t = v.n >= MAX_VIDAS ? ahora : v.t + ganadas * REGEN_MS; } }
    else v.t = ahora;
    return { n: v.n, max: MAX_VIDAS, completa: v.n >= MAX_VIDAS, proximaMs: v.n >= MAX_VIDAS ? 0 : Math.max(0, REGEN_MS - (ahora - v.t)) };
  };
  Juego.perderVida = function () {
    const est = Juego.vidas(), v = J().vidas; if (est.n <= 0) return 0;
    if (est.n >= MAX_VIDAS) v.t = Date.now();   // empieza a contar la recarga desde que se pierde la primera
    v.n--; guardar(); return v.n;
  };
  Juego.recargarVidas = function () { const v = J().vidas; v.n = MAX_VIDAS; v.t = Date.now(); guardar(); };

  /* ===================== día, semana y meta diaria ===================== */
  Juego.xpHoy = () => J().diario[M.hoy()] || 0;
  Juego.metaDiaria = () => J().metaDiaria;
  Juego.setMeta = n => { J().metaDiaria = n; guardar(); };
  /** últimos 7 días (terminando hoy): activo = hubo práctica o examen ese día (según el historial real) */
  Juego.semana = function () {
    const e = M.estado(), dias = new Set(e.historial.map(x => M.fechaLocal(new Date(x.t))));
    Object.keys(J().diario).forEach(f => { if (J().diario[f] > 0) dias.add(f); });
    const out = [], nombres = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const f = M.fechaLocal(d); out.push({ fecha: f, letra: nombres[d.getDay()], activo: dias.has(f), hoy: i === 0 }); }
    return out;
  };

  /* ===================== logros ===================== */
  const etapasHechas = () => { let n = 0; Tm.niveles.forEach(l => M.ETAPAS.forEach(e => { if (M.etapaCompleta(l.id, e)) n++; })); return n; };
  const nivelesHechos = () => Tm.niveles.filter(l => !l.libre && M.nivelCompleto(l.id)).length;
  const bibLeidos = () => (ET.Biblioteca && ET.Biblioteca.progresoGlobal) ? ET.Biblioteca.progresoGlobal().n : Object.keys(M.biblioteca().estudiados).length;
  const erroresResueltos = () => Object.values(M.estado().errores).filter(x => x.resuelto).length;
  const mejorExamen = () => M.estado().examenes.reduce((m, x) => Math.max(m, x.nota5 || 0), 0);
  const nRutaPrincipal = () => Tm.niveles.filter(l => !l.libre).length;
  const LOGROS = [
    { id: 'primer_acierto', nombre: 'Primer acierto', desc: 'Resuelve un ejercicio a la primera.', icono: 'check', tier: 1, valor: () => M.estado().stats.ok1, meta: 1 },
    { id: 'racha_3', nombre: 'Tres días seguidos', desc: 'Practica tres días consecutivos.', icono: 'llama', tier: 1, valor: () => J().mejorRacha, meta: 3 },
    { id: 'racha_7', nombre: 'Semana completa', desc: 'Siete días seguidos de práctica.', icono: 'llama', tier: 2, valor: () => J().mejorRacha, meta: 7 },
    { id: 'racha_30', nombre: 'Un mes sin faltar', desc: 'Treinta días seguidos de práctica.', icono: 'llama', tier: 3, valor: () => J().mejorRacha, meta: 30 },
    { id: 'resp_50', nombre: '50 ejercicios', desc: 'Responde 50 ejercicios de práctica.', icono: 'rayo', tier: 1, valor: () => M.estado().stats.resp, meta: 50 },
    { id: 'resp_250', nombre: '250 ejercicios', desc: 'Responde 250 ejercicios de práctica.', icono: 'rayo', tier: 2, valor: () => M.estado().stats.resp, meta: 250 },
    { id: 'resp_1000', nombre: '1 000 ejercicios', desc: 'Responde 1 000 ejercicios de práctica.', icono: 'rayo', tier: 3, valor: () => M.estado().stats.resp, meta: 1000 },
    { id: 'sin_ayuda', nombre: 'Sin ayuda', desc: 'Resuelve 25 ejercicios a la primera y sin pistas.', icono: 'estrellaLlena', tier: 2, valor: () => M.estado().stats.sinPistas, meta: 25 },
    { id: 'etapa_1', nombre: 'Primera etapa', desc: 'Completa tu primera etapa.', icono: 'mapa', tier: 1, valor: etapasHechas, meta: 1 },
    { id: 'etapa_10', nombre: 'Diez etapas', desc: 'Completa diez etapas.', icono: 'mapa', tier: 2, valor: etapasHechas, meta: 10 },
    { id: 'nivel_1', nombre: 'Primer nivel', desc: 'Completa un nivel de la ruta.', icono: 'trofeo', tier: 2, valor: nivelesHechos, meta: 1 },
    { id: 'ruta', nombre: 'Ruta completa', desc: 'Completa todos los niveles de la ruta principal.', icono: 'trofeo', tier: 3, valor: nivelesHechos, meta: nRutaPrincipal },
    { id: 'leccion_perfecta', nombre: 'Lección perfecta', desc: 'Termina una lección sin ningún error.', icono: 'estrellaLlena', tier: 2, valor: () => J().lecciones.perfectas, meta: 1 },
    { id: 'reto_1', nombre: 'Reto superado', desc: 'Supera un reto de nivel.', icono: 'cofre', tier: 2, valor: () => J().retos.superados, meta: 1 },
    { id: 'reto_5', nombre: 'Cazador de retos', desc: 'Supera el reto de cinco niveles distintos.', icono: 'cofre', tier: 3, valor: () => Object.keys(J().retos.porNivel).length, meta: 5 },
    { id: 'examen_1', nombre: 'Primer examen', desc: 'Termina un examen o simulacro.', icono: 'examen', tier: 1, valor: () => M.estado().examenes.length, meta: 1 },
    { id: 'examen_4', nombre: 'Nota de 4,0 o más', desc: 'Saca 4,0 o más en un examen.', icono: 'examen', tier: 3, valor: () => mejorExamen() >= 4 ? 1 : 0, meta: 1 },
    { id: 'lector_10', nombre: 'Lector', desc: 'Estudia 10 temas de la Biblioteca.', icono: 'libro', tier: 1, valor: bibLeidos, meta: 10 },
    { id: 'lector_40', nombre: 'Biblioteca a fondo', desc: 'Estudia 40 temas de la Biblioteca.', icono: 'libro', tier: 3, valor: bibLeidos, meta: 40 },
    { id: 'lab_5', nombre: 'Explorador del laboratorio', desc: 'Abre cinco secciones distintas del Laboratorio.', icono: 'lab', tier: 1, valor: () => Object.keys(J().visto.labs).length, meta: 5 },
    { id: 'taller_1', nombre: 'Manos a la obra', desc: 'Resuelve un taller interactivo.', icono: 'pista', tier: 2, valor: () => J().visto.talleres, meta: 1 },
    { id: 'errores_10', nombre: 'Aprender del error', desc: 'Resuelve 10 ejercicios que habías fallado.', icono: 'errores', tier: 2, valor: erroresResueltos, meta: 10 },
    { id: 'tienda_1', nombre: 'Primera compra', desc: 'Compra algo en la Tienda.', icono: 'tienda', tier: 1, valor: () => J().compras, meta: 1 }
  ];
  Juego.LOGROS = LOGROS;
  const metaDe = l => typeof l.meta === 'function' ? l.meta() : l.meta;
  /** estado de todos los logros: {def, valor, meta, ok, cuando} */
  Juego.logrosEstado = () => LOGROS.map(l => { const v = l.valor(), m = metaDe(l), t = J().logros[l.id]; return { def: l, valor: Math.min(v, m), meta: m, ok: !!t || v >= m, cuando: t || null }; });
  /** desbloquea los que ya se cumplen; devuelve los nuevos (con +monedas) */
  Juego.revisarLogros = function () {
    const nuevos = []; const j = J();
    LOGROS.forEach(l => { if (!j.logros[l.id] && l.valor() >= metaDe(l)) { j.logros[l.id] = Date.now(); Juego.dar(PREMIOS.logro, 'Logro: ' + l.nombre); nuevos.push(l); j.nuevos.push(l.id); } });
    if (nuevos.length && Juego.ultimoPremio) Juego.ultimoPremio.logros = (Juego.ultimoPremio.logros || []).concat(nuevos);
    return nuevos;
  };
  /** logros desbloqueados que la interfaz aún no ha mostrado (se vacía al leerlos) */
  Juego.tomarNuevos = function () { const j = J(), ids = j.nuevos.splice(0); if (ids.length) guardar(); return ids.map(id => LOGROS.find(l => l.id === id)).filter(Boolean); };

  /* ===================== tienda ===================== */
  const PALETAS = [
    { id: 'indigo', nombre: 'Clásica', precio: 0, muestra: ['var(--def-1)', 'var(--def-2)'] },
    { id: 'oceano', nombre: 'Océano', precio: 40, muestra: ['#1d8fe6', '#12c2b8'] },
    { id: 'uva', nombre: 'Uva', precio: 40, muestra: ['#7c4dff', '#d946ef'] },
    { id: 'brasa', nombre: 'Brasa', precio: 40, muestra: ['#e5542f', '#f2a33a'] }
  ];
  Juego.PALETAS = PALETAS;
  const MAX_ESCUDOS = 2;
  const ARTICULOS = [
    { id: 'escudo', nombre: 'Escudo de racha', precio: 30, desc: 'Protege la racha si un día no practicas. Se usa solo, una vez por día perdido. Máximo ' + MAX_ESCUDOS + '.', icono: 'escudo', puede: () => J().escudos < MAX_ESCUDOS ? null : 'Ya tienes el máximo (' + MAX_ESCUDOS + ').' },
    { id: 'vidas', nombre: 'Recarga de vidas', precio: 20, desc: 'Devuelve las ' + MAX_VIDAS + ' vidas para los retos de nivel.', icono: 'corazon', puede: () => Juego.vidas().completa ? 'Tus vidas ya están completas.' : null }
  ];
  Juego.ARTICULOS = ARTICULOS; Juego.MAX_ESCUDOS = MAX_ESCUDOS;
  Juego.escudos = () => J().escudos;
  Juego.paletaActiva = () => J().paleta;
  Juego.tienePaleta = id => J().paletas.includes(id);
  Juego.activarPaleta = function (id) { if (!Juego.tienePaleta(id)) return false; J().paleta = id; document.documentElement.dataset.paleta = id; guardar(); return true; };
  /** compra un artículo o una paleta: devuelve {ok, msg} */
  Juego.comprar = function (id) {
    const j = J();
    if (id.indexOf('paleta_') === 0) {
      const pa = PALETAS.find(x => 'paleta_' + x.id === id); if (!pa) return { ok: false, msg: 'Artículo desconocido.' };
      if (Juego.tienePaleta(pa.id)) return { ok: false, msg: 'Ya la tienes.' };
      if (!Juego.gastar(pa.precio, 'Paleta ' + pa.nombre)) return { ok: false, msg: 'Te faltan ' + (pa.precio - j.monedas) + ' monedas.' };
      j.paletas.push(pa.id); j.compras++; Juego.activarPaleta(pa.id); Juego.revisarLogros(); guardar(); return { ok: true, msg: 'Paleta «' + pa.nombre + '» desbloqueada y activada.' };
    }
    const a = ARTICULOS.find(x => x.id === id); if (!a) return { ok: false, msg: 'Artículo desconocido.' };
    const no = a.puede(); if (no) return { ok: false, msg: no };
    if (!Juego.gastar(a.precio, a.nombre)) return { ok: false, msg: 'Te faltan ' + (a.precio - j.monedas) + ' monedas.' };
    if (id === 'escudo') j.escudos++; else Juego.recargarVidas();
    j.compras++; Juego.revisarLogros(); guardar(); return { ok: true, msg: a.nombre + ': comprado.' };
  };
  Juego.aplicarPaleta = () => { document.documentElement.dataset.paleta = J().paleta || 'indigo'; };

  /* ===================== lecciones y retos ===================== */
  /** r = {total, ok1, xp, ms} al terminar una lección de 10; devuelve las monedas del cierre */
  Juego.cerrarLeccion = function (r) {
    const j = J(); j.lecciones.n++; let m = 0;
    if (r.total > 0 && r.ok1 / r.total >= 0.8) m += Juego.dar(PREMIOS.leccion, 'Lección terminada');
    if (r.total > 0 && r.ok1 === r.total) { j.lecciones.perfectas++; m += Juego.dar(PREMIOS.leccionPerfecta, 'Lección perfecta'); }
    Juego.revisarLogros(); guardar(); return m;
  };
  Juego.retoDisponible = n => !!(Tm.niveles[n - 1]) && M.nivelDesbloqueado(n) && (M.config().desbloqueoLibre || M.etapaCompleta(n, 'A'));
  Juego.retoSuperado = n => !!J().retos.porNivel[n];
  Juego.iniciarReto = function () { J().retos.intentos++; guardar(); };
  /** al terminar el reto: r = {nivel, ok1, total, vidas}; supera si acierta RETO.aciertosMin y conserva al menos una vida */
  Juego.cerrarReto = function (r) {
    const j = J(), ok = r.vidas > 0 && r.ok1 >= RETO.aciertosMin; let monedas = 0, xp = 0, primera = false;
    if (ok) {
      primera = !j.retos.porNivel[r.nivel]; j.retos.superados++; j.retos.porNivel[r.nivel] = { t: Date.now(), ok1: r.ok1, total: r.total, vidas: r.vidas };
      if (primera) { M.estado().xp += RETO.xpBonus; xp = RETO.xpBonus; j.diario[M.hoy()] = (j.diario[M.hoy()] || 0) + xp; monedas += Juego.dar(PREMIOS.reto, 'Reto del nivel ' + r.nivel); }
    }
    Juego.revisarLogros(); guardar(); return { ok, primera, xp, monedas };
  };

  /* ===================== visitas (para los logros del laboratorio y los talleres) ===================== */
  Juego.visto = function (clave, id) { const v = J().visto; if (clave === 'lab') { if (!v.labs[id]) { v.labs[id] = Date.now(); Juego.revisarLogros(); guardar(); } } };

  /* ===================== eventos del Motor ===================== */
  Juego.ultimoPremio = { monedas: 0, logros: [] };
  const nuevoPremio = () => (Juego.ultimoPremio = { monedas: 0, logros: [] });
  M.on(function (tipo, d) {
    const j = J();
    if (tipo === 'practica') {
      nuevoPremio();
      if (d.xp) j.diario[M.hoy()] = (j.diario[M.hoy()] || 0) + d.xp;
      if (d.resuelta) {
        Juego.dar(PREMIOS.ejercicio, 'Ejercicio resuelto');
        if (!d.info.pistas && !d.info.fallosPrevios) Juego.dar(PREMIOS.sinAyuda, 'Sin pistas ni fallos');
        if (d.q.tipo === 'taller') j.visto.talleres++;
      }
      if (d.etapaNueva) Juego.dar(d.nivelNuevo ? PREMIOS.nivel : PREMIOS.etapa, d.nivelNuevo ? 'Nivel completado' : 'Etapa completada');
      Juego.revisarLogros();
    } else if (tipo === 'examen') {
      nuevoPremio();
      j.diario[M.hoy()] = (j.diario[M.hoy()] || 0) + (d.xp || 0);
      Juego.dar(Math.min(PREMIOS.examenTope, Math.round((d.entry.nota5 || 0) * PREMIOS.examenPorPunto)), 'Examen terminado');
      Juego.revisarLogros();
    } else if (tipo === 'racha') {
      if (d.dias > j.mejorRacha) j.mejorRacha = d.dias;
      if (d.escudo) { j.escudos = Math.max(0, j.escudos - d.escudo); j.escudosUsados.push(M.hoy()); }
    }
  });
  Juego.iniciar = function () { J(); Juego.aplicarPaleta(); };
})(typeof window !== 'undefined' ? window : globalThis);
