/* juego_test.js — prueba el motor del juego (js/juego.js + los eventos del Motor): monedas, vidas con recarga, racha con escudo, meta diaria,
   logros, tienda, retos, lecciones y persistencia. Trabaja sobre una copia: al terminar restaura el progreso que había en el navegador. */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = s => { out.textContent += s + '\n'; };

  async function pruebaJuego() {
    const M = ET.Motor, J = ET.Juego, fallos = []; let n = 0;
    const ok = (cond, msg) => { n++; if (!cond) fallos.push(msg); };
    const copia = M.exportar();
    const dia = (delta) => { const d = new Date(); d.setDate(d.getDate() + delta); return M.fechaLocal(d); };
    const q = id => ET.Banco.instanciar(id || 'n1-comp', 777);
    const res = { score: 1, ok: true, items: [] };
    try {
      /* ---------- monedas ---------- */
      M.reiniciar(); J.estado();
      ok(J.monedas() === 0, 'empieza con 0 monedas');
      ok(J.dar(5, 'prueba') === 5 && J.monedas() === 5, 'dar suma monedas');
      ok(J.gastar(3, 'prueba') === true && J.monedas() === 2, 'gastar resta monedas');
      ok(J.gastar(9, 'prueba') === false && J.monedas() === 2, 'no se puede gastar más de lo que se tiene');
      ok(J.dar(-4, 'x') === 0 && J.dar(0, 'x') === 0 && J.monedas() === 2, 'dar ignora cantidades no positivas');
      ok(J.estado().movs[0].n === -3 && J.estado().movs.length === 2, 'el registro de movimientos guarda cada cambio');

      /* ---------- vidas ---------- */
      M.reiniciar(); J.estado();
      let v = J.vidas(); ok(v.n === 5 && v.max === 5 && v.completa, 'empieza con 5 vidas completas');
      J.perderVida(); J.perderVida(); v = J.vidas(); ok(v.n === 3 && !v.completa && v.proximaMs > 0 && v.proximaMs <= J.REGEN_MS, 'perder vidas las descuenta y empieza el reloj de recarga');
      J.estado().vidas.t -= J.REGEN_MS * 2 + 5000; v = J.vidas(); ok(v.n === 5 && v.completa, 'tras 2 periodos se recuperan 2 vidas (y no pasa de 5)');
      J.estado().vidas.n = 1; J.estado().vidas.t = Date.now() - J.REGEN_MS * 10; ok(J.vidas().n === 5, 'la recarga nunca supera el máximo');
      J.estado().vidas.n = 0; J.estado().vidas.t = Date.now(); ok(J.perderVida() === 0 && J.vidas().n === 0, 'con 0 vidas no se puede perder otra');
      J.recargarVidas(); ok(J.vidas().n === 5, 'recargarVidas devuelve las 5');

      /* ---------- racha y escudo ---------- */
      M.reiniciar(); J.estado();
      const resolver = (id) => M.registrarPractica(q(id), res, { pistas: 0, fallosPrevios: 0, resuelta: true, verSolucion: false, ms: 1000 });
      ok(M.rachaVigente().dias === 0 && !M.rachaVigente().hoyHecha, 'sin práctica: racha 0');
      resolver(); ok(M.rachaVigente().dias === 1 && M.rachaVigente().hoyHecha, 'la primera práctica enciende la racha');
      M.estado().racha = { dias: 5, ultimo: dia(-1) }; ok(M.rachaVigente().dias === 5 && M.rachaVigente().enRiesgo && !M.rachaVigente().protegida, 'ayer practicó: la racha sigue pero hoy está en riesgo');
      resolver(); ok(M.rachaVigente().dias === 6, 'practicar hoy sube la racha a 6');
      M.estado().racha = { dias: 5, ultimo: dia(-3) }; ok(M.rachaVigente().dias === 0, 'tres días sin practicar y sin escudo: la racha mostrada es 0 (no la cifra vieja)');
      resolver(); ok(M.rachaVigente().dias === 1, 'al volver tras perderla, la racha empieza en 1');
      M.estado().racha = { dias: 5, ultimo: dia(-2) }; J.estado().escudos = 1; ok(M.rachaVigente().dias === 5 && M.rachaVigente().protegida, 'con escudo, un día perdido no rompe la racha');
      resolver(); ok(M.rachaVigente().dias === 6 && J.escudos() === 0, 'el escudo se gasta al cubrir el día perdido y la racha sigue');
      M.estado().racha = { dias: 9, ultimo: dia(-3) }; J.estado().escudos = 1; resolver(); ok(M.rachaVigente().dias === 1 && J.escudos() === 1, 'faltaron 2 días con 1 escudo: la racha se rompe y el escudo no se gasta');
      ok(J.estado().mejorRacha >= 6, 'se recuerda la mejor racha (' + J.estado().mejorRacha + ')');
      ok(M.fechaLocal(new Date(2026, 10, 2, 23, 30)) === '2026-11-02', 'la fecha es LOCAL: las 11:30 p. m. siguen siendo el mismo día');

      /* ---------- recompensas por práctica ---------- */
      M.reiniciar(); J.estado(); M.reiniciar();
      const r1 = resolver(); ok(r1.xp > 0, 'resolver da XP');
      ok(J.monedas() === 2 + J.PREMIOS.logro, 'ejercicio resuelto: +1, sin ayuda: +1 y el logro «Primer acierto»: +' + J.PREMIOS.logro + ' (hay ' + J.monedas() + ')');
      ok(J.xpHoy() === r1.xp, 'la meta diaria cuenta el XP de hoy');
      ok(J.estado().logros.primer_acierto > 0, 'se desbloqueó «Primer acierto»');
      const antes = J.monedas(); resolver(); ok(J.monedas() === antes + 2, 'un logro ya ganado no vuelve a dar monedas');
      M.registrarPractica(q(), { score: 0, ok: false, items: [] }, { pistas: 1, fallosPrevios: 1, resuelta: false, verSolucion: true, ms: 500 }); const m2 = J.monedas(); ok(m2 === antes + 2, 'una pregunta no resuelta no da monedas');
      ok(J.tomarNuevos().length === 1 && J.tomarNuevos().length === 0, 'los logros nuevos se entregan una sola vez a la interfaz');

      /* ---------- logros: progreso ---------- */
      const est = J.logrosEstado(); ok(est.length === J.LOGROS.length && est.every(x => x.meta > 0 && x.valor >= 0 && x.valor <= x.meta), 'cada logro tiene meta y progreso coherentes');
      ok(new Set(J.LOGROS.map(l => l.id)).size === J.LOGROS.length, 'los ids de los logros son únicos');
      ok(est.find(x => x.def.id === 'racha_3').ok === false, '«Tres días seguidos» no se cumple con 1 día');
      M.estado().stats.resp = 60; J.revisarLogros(); ok(!!J.estado().logros.resp_50, '«50 ejercicios» se desbloquea al llegar a 50');

      /* ---------- tienda ---------- */
      M.reiniciar(); J.estado();
      ok(J.comprar('escudo').ok === false, 'sin monedas no se compra un escudo');
      J.dar(200, 'prueba'); let c = J.comprar('escudo'); ok(c.ok && J.escudos() === 1 && J.monedas() === 200 - 30 + J.PREMIOS.logro, 'comprar un escudo cuesta 30, suma 1 y desbloquea «Primera compra» (+' + J.PREMIOS.logro + ')');
      J.comprar('escudo'); ok(J.escudos() === 2 && J.comprar('escudo').ok === false, 'el máximo de escudos es 2');
      ok(J.comprar('vidas').ok === false, 'no se recargan vidas si ya están completas');
      J.perderVida(); const mAntes = J.monedas(); c = J.comprar('vidas'); ok(c.ok && J.vidas().n === 5 && J.monedas() === mAntes - 20, 'la recarga de vidas cuesta 20 y las completa');
      c = J.comprar('paleta_oceano'); ok(c.ok && J.tienePaleta('oceano') && J.paletaActiva() === 'oceano' && document.documentElement.dataset.paleta === 'oceano', 'una paleta comprada se activa y cambia el tema');
      ok(J.comprar('paleta_oceano').ok === false, 'no se compra dos veces la misma paleta');
      ok(J.activarPaleta('uva') === false && J.paletaActiva() === 'oceano', 'no se puede activar una paleta que no se tiene');
      ok(J.activarPaleta('indigo') === true && J.paletaActiva() === 'indigo', 'la paleta inicial siempre se puede volver a usar');
      ok(J.comprar('inexistente').ok === false, 'un artículo desconocido se rechaza');
      ok(!!J.estado().logros.tienda_1, '«Primera compra» se desbloquea al comprar');
      J.aplicarPaleta(); document.documentElement.dataset.paleta = 'indigo';

      /* ---------- lecciones y retos ---------- */
      M.reiniciar(); J.estado(); const m0 = J.monedas();
      ok(J.cerrarLeccion({ total: 10, ok1: 10 }) === J.PREMIOS.leccion + J.PREMIOS.leccionPerfecta && J.estado().lecciones.perfectas === 1, 'lección perfecta: premio base + premio de perfecta');
      ok(J.cerrarLeccion({ total: 10, ok1: 8 }) === J.PREMIOS.leccion, 'lección con 80 %: solo el premio base');
      ok(J.cerrarLeccion({ total: 10, ok1: 5 }) === 0, 'lección con menos de 80 %: sin premio');
      ok(J.monedas() > m0, 'las monedas de lección se acumulan');
      ok(J.retoDisponible(1) === false, 'el reto está bloqueado sin completar la etapa A');
      M.setConfig('desbloqueoLibre', true); ok(J.retoDisponible(1) === true && J.retoDisponible(99) === false, 'con el desbloqueo libre el reto se abre; un nivel inexistente no');
      M.setConfig('desbloqueoLibre', false);
      let xp0 = M.estado().xp, mon0 = J.monedas(); let cr = J.cerrarReto({ nivel: 3, ok1: 8, total: 10, vidas: 2 });
      ok(cr.ok && cr.primera && cr.xp === J.RETO.xpBonus && M.estado().xp === xp0 + J.RETO.xpBonus && J.monedas() >= mon0 + J.PREMIOS.reto, 'primer reto superado: bonus de XP y monedas');
      xp0 = M.estado().xp; cr = J.cerrarReto({ nivel: 3, ok1: 9, total: 10, vidas: 3 }); ok(cr.ok && !cr.primera && cr.xp === 0 && M.estado().xp === xp0, 'repetir un reto ya superado no da bonus');
      cr = J.cerrarReto({ nivel: 4, ok1: 6, total: 10, vidas: 3 }); ok(!cr.ok && !J.retoSuperado(4), 'con menos aciertos de los necesarios no se supera');
      cr = J.cerrarReto({ nivel: 4, ok1: 10, total: 10, vidas: 0 }); ok(!cr.ok && !J.retoSuperado(4), 'sin vidas el reto no se supera aunque haya aciertos');
      ok(J.retoSuperado(3), 'el reto superado queda registrado');

      /* ---------- examen ---------- */
      M.reiniciar(); J.estado(); const entry = { id: 'x', t: Date.now(), cfg: {}, puntaje: 80, nota5: 4, resp: [], n: 1, items: [], aciertos: 1, scores: [1], oks: [true] };
      M.registrarExamen(entry, [q()], [res]); ok(J.monedas() >= Math.min(J.PREMIOS.examenTope, Math.round(4 * J.PREMIOS.examenPorPunto)), 'un examen con nota 4,0 da monedas por la nota');
      ok(!!J.estado().logros.examen_1 && !!J.estado().logros.examen_4, 'los logros de examen se desbloquean');

      /* ---------- semana ---------- */
      const sem = J.semana(); ok(sem.length === 7 && sem[6].hoy && sem[6].activo && sem.filter(x => x.hoy).length === 1, 'la semana tiene 7 días, el último es hoy y hoy aparece activo tras practicar');

      /* ---------- persistencia ---------- */
      M.reiniciar(); J.estado(); J.dar(33, 'x'); J.estado().escudos = 2; J.estado().paletas.push('brasa'); J.estado().metaDiaria = 50;
      const txt = M.exportar(); M.reiniciar(); M.importar(txt);
      ok(J.monedas() === 33 && J.escudos() === 2 && J.tienePaleta('brasa') && J.metaDiaria() === 50, 'exportar e importar conserva monedas, escudos, paletas y meta');
      const viejo = JSON.parse(M.exportar()); delete viejo.juego; M.reiniciar(); M.importar(JSON.stringify(viejo));
      ok(J.monedas() === 0 && J.vidas().n === 5 && J.metaDiaria() === 30 && Array.isArray(J.estado().movs), 'un progreso guardado antes de existir el juego se completa con valores por defecto');
    } catch (e) { fallos.push('excepción: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e)); }
    finally { M.importar(copia); J.iniciar(); }
    return { comprobaciones: n, fallos };
  }
  window.pruebaJuego = pruebaJuego;
  const btn = document.getElementById('btn-juego');
  if (btn) btn.onclick = async () => {
    out.textContent = 'Probando el motor del juego…\n';
    const r = await pruebaJuego();
    log('Comprobaciones: ' + r.comprobaciones + ' | fallos: ' + r.fallos.length);
    r.fallos.forEach(f => log(' ✗ ' + f));
  };
})();
