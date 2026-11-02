/* vistas_mapa.js — pantalla principal: el mapa de aprendizaje.
   Cada nivel del temario es una UNIDAD con su propio color; su camino une las etapas A, B y C, el reto del nivel y el examen del nivel.
   Los estados salen del progreso real (M.dominio, M.etapaCompleta, M.etapaDesbloqueada…); nada de esto es decorativo. */
(function (global) {
  'use strict';
  const ET = global.ET, U = ET.U, h = U.h, Tm = ET.Temario, M = ET.Motor, Vc = ET.Vc, J = ET.Juego, Ico = ET.Ico, Fx = ET.Fx;
  const V = ET.Vistas = ET.Vistas || {};
  const pct = x => Math.round(x * 100) + ' %';

  const DX = [0, 60, 84, 44, -22];            // desplazamiento horizontal de cada nodo (zigzag del camino)
  const PASO = 118, ARRIBA = 100, ABAJO = 112, ANCHO = 320;   // ARRIBA deja sitio al globo «Empezar» del nodo actual
  const NOMBRE_ETAPA = { A: 'Fundamentos', B: 'Aplicación', C: 'Dominio' };

  /** nodos de una unidad: etapas A, B, C + reto + examen. Cada uno con su estado real */
  function nodosDe(l, actual) {
    const n = l.id, desb = M.nivelDesbloqueado(n), out = [];
    M.ETAPAS.forEach(e => {
      const des = desb && M.etapaDesbloqueada(n, e), ok = M.etapaCompleta(n, e), d = M.dominio(n, e);
      out.push({ clave: 'e' + e, tipo: 'etapa', etapa: e, titulo: NOMBRE_ETAPA[e], estado: !des ? 'bloq' : ok ? 'hecha' : (d.n ? 'curso' : 'disp'), dominio: d, esActual: !!actual && actual.n === n && actual.e === e });
    });
    const retoOk = J.retoDisponible(n);
    out.push({ clave: 'reto', tipo: 'reto', titulo: 'Reto del nivel', estado: J.retoSuperado(n) ? 'hecha' : (retoOk ? 'disp' : 'bloq') });
    out.push({ clave: 'examen', tipo: 'examen', titulo: 'Examen del nivel', estado: desb ? 'disp' : 'bloq' });
    return out;
  }
  const ICONO_NODO = { reto: 'cofre', examen: 'examen' };
  const ESTADO_TXT = { bloq: 'bloqueado', disp: 'disponible', curso: 'en curso', hecha: 'completado' };

  function nodoBoton(nd, l, x, y) {
    const disco = h('span', { class: 'nodo-disco' });
    if (nd.estado === 'bloq') disco.appendChild(Ico('candado', { tam: 28 }));
    else if (nd.estado === 'hecha') disco.appendChild(Ico('check', { tam: 34 }));
    else if (nd.tipo === 'etapa') disco.appendChild(h('b', { class: 'nodo-letra', text: nd.etapa }));
    else disco.appendChild(Ico(ICONO_NODO[nd.tipo], { tam: 32 }));
    const p = nd.tipo === 'etapa' ? (nd.estado === 'hecha' ? 100 : (nd.dominio.n ? Math.round(nd.dominio.dom * Math.min(1, nd.dominio.n / 5) * 100) : 0)) : (nd.estado === 'hecha' ? 100 : 0);
    const anillo = h('span', { class: 'nodo-anillo' }, disco); anillo.style.setProperty('--p', p);
    const b = h('button', { type: 'button', class: 'cnodo estado-' + nd.estado + ' tipo-' + nd.tipo + (nd.esActual ? ' actual' : ''), 'aria-label': (nd.tipo === 'etapa' ? 'Etapa ' + nd.etapa + ', ' + nd.titulo + ' del nivel ' + l.id : nd.titulo + ' ' + l.id) + ': ' + ESTADO_TXT[nd.estado] + (nd.esActual ? ', tu siguiente objetivo' : ''), onclick: () => abrirNodo(nd, l) });
    b.style.left = 'calc(50% + ' + x + 'px)'; b.style.top = y + 'px';
    if (nd.esActual) b.appendChild(h('span', { class: 'nodo-globo', text: nd.dominio.n ? 'Seguir' : 'Empezar' }));
    b.appendChild(anillo);
    b.appendChild(h('span', { class: 'nodo-etq', text: nd.tipo === 'etapa' ? nd.titulo : nd.titulo.replace(' del nivel', '') }));
    return b;
  }

  /** camino de una unidad: nodos posicionados + hilo curvo entre ellos */
  function camino(l, nodos) {
    const alto = ARRIBA + (nodos.length - 1) * PASO + ABAJO;
    const c = h('div', { class: 'camino' }); c.style.height = alto + 'px';
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'camino-hilo'); svg.setAttribute('viewBox', '0 0 ' + ANCHO + ' ' + alto); svg.setAttribute('width', ANCHO); svg.setAttribute('height', alto); svg.setAttribute('aria-hidden', 'true');
    const pos = nodos.map((nd, i) => ({ x: ANCHO / 2 + DX[i % DX.length], y: ARRIBA + i * PASO }));
    for (let i = 0; i < nodos.length - 1; i++) {
      const a = pos[i], b = pos[i + 1], m = (a.y + b.y) / 2, seg = document.createElementNS(NS, 'path');
      seg.setAttribute('d', 'M' + a.x + ' ' + a.y + ' C' + a.x + ' ' + m + ' ' + b.x + ' ' + m + ' ' + b.x + ' ' + b.y);
      seg.setAttribute('class', 'hilo' + (nodos[i].estado === 'hecha' ? ' hecho' : '')); svg.appendChild(seg);
    }
    c.appendChild(svg);
    nodos.forEach((nd, i) => { const bt = nodoBoton(nd, l, DX[i % DX.length], pos[i].y); bt.style.setProperty('--i', i); c.appendChild(bt); });
    return c;
  }

  /** atajos de la unidad: teoría, laboratorio, biblioteca, quiz, detalles */
  function atajos(l) {
    const n = l.id, a = [];
    const pil = (href, ico, txt) => h('a', { class: 'pildora', href }, Ico(ico, { tam: 16 }), h('span', { text: txt }));
    a.push(pil('#/teoria/' + n, 'libro', 'Teoría'));
    const lab = V.LAB_NIVEL && V.LAB_NIVEL[n]; if (lab) a.push(pil('#/lab/' + lab[0], 'lab', 'Laboratorio'));
    if (n === 6 || n === 7) a.push(pil('#/lab/taller', 'pista', 'Taller'));
    const areas = ET.Biblioteca ? ET.Biblioteca.areas.filter(x => x.nivel === n && ET.Biblioteca.temasDeArea(x.id).length) : [];
    if (areas.length) a.push(pil('#/biblioteca/area/' + areas[0].id, 'libro', 'Biblioteca'));
    a.push(pil('#/examen/config/quiz?areas=' + encodeURIComponent((ET.Biblioteca ? ET.Biblioteca.areas.filter(x => x.nivel === n).map(x => x.id) : []).join(',')), 'jugar', 'Quiz a mi medida'));
    a.push(pil('#/nivel/' + n, 'mas', 'Detalles'));
    return h('div', { class: 'unidad-atajos' }, a);
  }

  function unidad(l, actual) {
    const n = l.id, desb = M.nivelDesbloqueado(n), nodos = nodosDe(l, actual), prog = desb ? M.progresoNivel(n) : 0;
    const sec = h('section', { class: 'unidad' + (desb ? '' : ' bloq'), id: 'u' + n, 'aria-labelledby': 'ut' + n });
    Fx.aplicarUnidad(sec, l.color);
    const hechas = M.ETAPAS.filter(e => M.etapaCompleta(n, e)).length;
    sec.appendChild(h('header', { class: 'unidad-cab' },
      h('span', { class: 'unidad-ic', 'aria-hidden': 'true', text: l.icono }),
      h('div', { class: 'unidad-t' }, h('div', { class: 'unidad-n', text: 'Nivel ' + n + (l.libre ? ' · tema libre' : '') }), h('h2', { id: 'ut' + n, text: l.nombre })),
      desb ? h('div', { class: 'unidad-prog', title: hechas + ' de 3 etapas completas' }, h('b', { text: pct(prog) }), h('span', { text: hechas + '/3 etapas' })) : h('span', { class: 'unidad-cand' }, Ico('candado', { tam: 18 }), h('span', { text: 'Bloqueada' }))));
    sec.appendChild(h('p', { class: 'unidad-res', text: l.resumen }));
    sec.appendChild(atajos(l));
    sec.appendChild(camino(l, nodos));
    return sec;
  }

  /* ---------- hoja de información de un nodo ---------- */
  function abrirNodo(nd, l) {
    const n = l.id, cont = h('div', { class: 'hoja' }); Fx.aplicarUnidad(cont, l.color);
    const cab = h('div', { class: 'hoja-cab' }, h('span', { class: 'hoja-ic', text: l.icono }), h('div', null, h('div', { class: 'peq tenue', text: 'Nivel ' + n + ' · ' + l.nombre }), h('strong', { class: 'hoja-t', text: nd.tipo === 'etapa' ? 'Etapa ' + nd.etapa + ' · ' + nd.titulo : nd.titulo })), h('span', { class: 'chip ' + ({ hecha: 'ok', curso: 'acento', disp: 'acento', bloq: '' })[nd.estado], text: nd.estado === 'hecha' ? 'Completada' : nd.estado === 'curso' ? 'En curso' : nd.estado === 'bloq' ? 'Bloqueada' : (nd.tipo === 'etapa' ? 'Disponible' : 'Disponible') }));
    cont.appendChild(cab);
    let cta = null, extra = [];
    const umbral = M.config().umbral;
    if (nd.tipo === 'etapa') {
      const e = nd.etapa, d = nd.dominio, info = M.etapaInfo(n, e);
      cont.appendChild(h('p', { class: 'suave', text: Tm.etapas[e].desc }));
      cont.appendChild(Vc.barra(d.dom, umbral));
      cont.appendChild(h('div', { class: 'peq tenue hoja-datos', text: d.n ? 'Dominio de las últimas ' + d.n + ' respuestas: ' + pct(d.dom) + ' · meta ' + umbral + ' % · ' + info.intentos + ' intentos · ' + info.pistas + ' pistas' : 'Aún sin intentos. Se completa con ' + umbral + ' % de dominio en las últimas 10 respuestas (mínimo 5).' }));
      if (nd.estado === 'bloq') {
        const ant = !M.nivelDesbloqueado(n) ? 'Completa la etapa C del nivel ' + (n - 1) + ' con ' + umbral + ' % de dominio (o activa el desbloqueo libre en Ajustes).' : 'Completa la etapa anterior con ' + umbral + ' % de dominio (o activa el desbloqueo libre en Ajustes).';
        cont.appendChild(h('div', { class: 'rec aviso' }, Ico('candado', { tam: 22 }), h('div', { text: ant })));
        cta = h('a', { class: 'btn grande hoja-cta sec', href: '#/nivel/' + (M.nivelDesbloqueado(n) ? n : n - 1) }, M.nivelDesbloqueado(n) ? 'Ver el nivel' : 'Ir al nivel ' + (n - 1));
      } else cta = h('a', { class: 'btn grande hoja-cta', href: '#/practica/' + n + '/' + e }, Ico('jugar', { tam: 18 }), nd.estado === 'hecha' ? 'Practicar de nuevo' : (d.n ? 'Seguir practicando' : 'Comenzar'));
      extra.push(h('a', { class: 'btn sec hoja-sec', href: '#/teoria/' + n }, Ico('libro', { tam: 18 }), 'Repasar la teoría'));
    } else if (nd.tipo === 'reto') {
      const R = J.RETO, vd = J.vidas();
      cont.appendChild(h('p', { class: 'suave', text: R.preguntas + ' ejercicios mezclados de las tres etapas del nivel. Gastas tus vidas (hasta ' + J.MAX_VIDAS + ') y cada ejercicio fallado te quita una. Lo superas acertando ' + R.aciertosMin + ' o más a la primera sin quedarte sin vidas.' }));
      cont.appendChild(h('ul', { class: 'hoja-lista' }, h('li', null, Ico('rayo', { tam: 18 }), h('span', { text: 'La primera vez que lo superas: +' + R.xpBonus + ' XP y +' + J.PREMIOS.reto + ' monedas.' })), h('li', null, Ico('corazon', { tam: 18 }), h('span', { text: 'Tus vidas ahora: ' + vd.n + ' de ' + vd.max + (vd.n < vd.max ? ' (la próxima en ' + Math.ceil(vd.proximaMs / 60000) + ' min).' : '.') })), h('li', null, Ico('check', { tam: 18 }), h('span', { text: 'Cada ejercicio cuenta para tu dominio, como en la práctica normal.' }))));
      if (nd.estado === 'bloq') { cont.appendChild(h('div', { class: 'rec aviso' }, Ico('candado', { tam: 22 }), h('div', { text: 'Se desbloquea al completar la etapa A de este nivel.' }))); cta = h('a', { class: 'btn grande hoja-cta sec', href: '#/nivel/' + n }, 'Ver el nivel'); }
      else if (vd.n < 1) { cont.appendChild(h('div', { class: 'rec mal' }, Ico('corazon', { tam: 22 }), h('div', { text: 'No te quedan vidas. Espera ' + Math.ceil(vd.proximaMs / 60000) + ' min a la próxima o recárgalas en la Tienda.' }))); cta = h('a', { class: 'btn grande hoja-cta', href: '#/tienda' }, Ico('tienda', { tam: 18 }), 'Ir a la Tienda'); }
      else cta = h('a', { class: 'btn grande hoja-cta', href: '#/reto/' + n }, Ico('cofre', { tam: 20 }), nd.estado === 'hecha' ? 'Repetir el reto' : 'Aceptar el reto');
    } else {
      cont.appendChild(h('p', { class: 'suave', text: 'Sin pistas ni teoría mientras resuelves. Al final recibes tu nota, el informe por tema y la revisión de cada pregunta. Elige cuántas preguntas y si quieres tiempo.' }));
      const exs = M.examenes().filter(x => x.cfg && x.cfg.niveles && x.cfg.niveles.length === 1 && x.cfg.niveles[0] === n);
      if (exs.length) cont.appendChild(h('div', { class: 'peq tenue hoja-datos', text: 'Exámenes de este nivel: ' + exs.length + ' · mejor nota ' + Math.max.apply(null, exs.map(x => x.nota5 || 0)).toFixed(1).replace('.', ',') + ' / 5,0' }));
      if (nd.estado === 'bloq') { cont.appendChild(h('div', { class: 'rec aviso' }, Ico('candado', { tam: 22 }), h('div', { text: 'Primero desbloquea este nivel completando el anterior.' }))); cta = h('a', { class: 'btn grande hoja-cta sec', href: '#/nivel/' + (n - 1) }, 'Ir al nivel ' + (n - 1)); }
      else cta = h('a', { class: 'btn grande hoja-cta', href: '#/examen/config/nivel-' + n }, Ico('examen', { tam: 20 }), 'Configurar el examen');
    }
    cont.appendChild(h('div', { class: 'hoja-acc' }, cta, extra));
    const m = Vc.modal(nd.tipo === 'etapa' ? 'Etapa ' + nd.etapa : nd.titulo, cont, { clase: 'hoja-f' });
    cont.querySelectorAll('a').forEach(a => a.addEventListener('click', () => m.cerrar()));
  }

  /* ---------- saludo y panel lateral ---------- */
  function semanaNodo() {
    return h('div', { class: 'semana', role: 'list', 'aria-label': 'Últimos siete días' }, J.semana().map(d => h('div', { class: 'dia' + (d.activo ? ' on' : '') + (d.hoy ? ' hoy' : ''), role: 'listitem', 'aria-label': d.fecha + (d.activo ? ': practicaste' : ': sin práctica') + (d.hoy ? ' (hoy)' : '') }, h('span', { class: 'dia-pt' }, d.activo ? Ico('check', { tam: 14 }) : null), h('span', { class: 'dia-l', text: d.letra }))));
  }
  function metaNodo() {
    const hoy = J.xpHoy(), meta = J.metaDiaria(), p = Math.min(1, hoy / meta);
    return h('div', { class: 'meta-dia' }, h('div', { class: 'fila sep' }, h('strong', { text: 'Meta de hoy' }), h('span', { class: 'peq tenue', text: hoy + ' / ' + meta + ' XP' })), Vc.barra(p), h('div', { class: 'peq tenue', text: hoy >= meta ? 'Meta cumplida. Todo lo que sumes ahora es extra.' : 'Te faltan ' + (meta - hoy) + ' XP para cumplirla.' }));
  }
  function saludo(actual) {
    const rv = M.rachaVigente(), hoy = J.xpHoy(), meta = J.metaDiaria(), hecho = M.estado().historial.length > 0;
    const humor = hoy >= meta ? 'celebra' : (rv.hoyHecha ? 'feliz' : (rv.enRiesgo ? 'neutral' : 'feliz'));
    let titulo, texto;
    if (!hecho) { titulo = 'Empecemos por el nivel 1'; texto = 'Cada ejercicio resuelto suma XP y monedas. Con uno al día empiezas una racha.'; }
    else if (hoy >= meta) { titulo = 'Meta del día cumplida'; texto = 'Llevas ' + hoy + ' XP hoy. Sigue si quieres adelantar la ruta.'; }
    else if (rv.hoyHecha) { titulo = 'Buen ritmo hoy'; texto = 'Llevas ' + hoy + ' de ' + meta + ' XP. ' + (actual ? 'Tu siguiente objetivo está marcado en el mapa.' : 'Ya completaste toda la ruta: prueba un examen acumulativo.'); }
    else if (rv.enRiesgo) { titulo = rv.protegida ? 'Hoy te cubre un escudo' : 'Tu racha de ' + rv.dias + ' día' + (rv.dias === 1 ? '' : 's') + ' te espera'; texto = rv.protegida ? 'No practicaste ayer, pero tu escudo de racha mantiene los ' + rv.dias + ' días. Practica hoy para no gastarlo otra vez.' : 'Practica hoy para no perderla. Un ejercicio basta.'; }
    else { titulo = 'Hoy puedes empezar una racha'; texto = 'Practica un ejercicio y la llama se enciende.'; }
    const sa = h('section', { class: 'saludo' }, h('div', { class: 'saludo-m' }, ET.Mascota(humor, 92)), h('div', { class: 'saludo-t' }, h('h1', { text: titulo }), h('p', { text: texto }), actual ? h('a', { class: 'btn saludo-cta', href: '#/practica/' + actual.n + '/' + actual.e }, Ico('jugar', { tam: 18 }), 'Continuar: nivel ' + actual.n + ', etapa ' + actual.e) : h('a', { class: 'btn saludo-cta', href: '#/examen/config/acumulativo' }, 'Examen acumulativo')));
    sa.appendChild(h('div', { class: 'saludo-d' }, semanaNodo(), metaNodo()));
    return sa;
  }
  function riel() {
    const r = h('aside', { class: 'riel', 'aria-label': 'Resumen del día' });
    const rv = M.rachaVigente();
    r.appendChild(h('section', { class: 'riel-card' }, h('div', { class: 'riel-t' }, Ico('llama', { tam: 26 }), h('div', null, h('strong', { text: rv.dias ? rv.dias + ' día' + (rv.dias === 1 ? '' : 's') + ' de racha' : 'Sin racha todavía' }), h('div', { class: 'peq tenue', text: 'Mejor racha: ' + Math.max(J.estado().mejorRacha, rv.dias) + ' · Escudos: ' + J.escudos() + '/' + J.MAX_ESCUDOS }))), semanaNodo()));
    const vd = J.vidas();
    r.appendChild(h('section', { class: 'riel-card' }, h('div', { class: 'riel-t' }, Ico('corazon', { tam: 26 }), h('div', null, h('strong', { text: 'Vidas: ' + vd.n + ' de ' + vd.max }), h('div', { class: 'peq tenue', text: 'Solo se gastan en los retos de nivel.' }))), h('div', { class: 'vidas' }, Array.from({ length: vd.max }, (_, i) => Ico(i < vd.n ? 'corazon' : 'corazonVacio', { tam: 26 }))), vd.n < vd.max ? h('div', { class: 'peq tenue', text: 'Próxima vida en ' + Math.ceil(vd.proximaMs / 60000) + ' min.' }) : null));
    const Bib = ET.Biblioteca;
    if (Bib && Bib.temas.length) {
      const g = Bib.progresoGlobal(), sig = Bib.siguientePendiente();
      r.appendChild(h('section', { class: 'riel-card' }, h('div', { class: 'riel-t' }, Ico('libro', { tam: 26 }), h('div', null, h('strong', { text: 'Biblioteca de estudio' }), h('div', { class: 'peq tenue', text: g.n + ' de ' + g.total + ' temas estudiados' }))), Vc.barra(g.p), sig ? h('a', { class: 'btn sec peq', href: '#/biblioteca/' + sig.id }, (g.n ? 'Continuar: ' : 'Empezar: ') + sig.titulo) : h('a', { class: 'btn sec peq', href: '#/biblioteca' }, 'Abrir la Biblioteca')));
    }
    const rec = M.recomendaciones().filter(x => x.boton !== 'Continuar').slice(0, 3);
    if (rec.length) r.appendChild(h('section', { class: 'riel-card' }, h('strong', { text: 'Recomendado para ti' }), h('div', { class: 'lista-rec' }, rec.map(x => h('div', { class: 'rec ' + (x.tipo || '') }, h('div', { class: 'ic', text: x.icono }), h('div', null, h('strong', { text: x.titulo }), h('div', { class: 'peq suave', text: x.texto })), h('a', { class: 'btn sec peq', href: x.ruta }, x.boton))))));
    return r;
  }

  V.panel = function (host) {
    const actual = ET.App.siguienteEtapa();
    const mapa = h('div', { class: 'mapa' });
    const col = h('div', { class: 'mapa-col' });
    col.appendChild(saludo(actual));
    col.appendChild(h('details', { class: 'mas-hoy' }, h('summary', { text: 'Más para hoy' }), riel()));
    const principal = Tm.niveles.filter(l => !l.libre), libres = Tm.niveles.filter(l => l.libre);
    // índice de unidades (salta a cada una)
    col.appendChild(h('nav', { class: 'indice-u', 'aria-label': 'Ir a una unidad' }, Tm.niveles.map(l => { const a = h('a', { href: '#/panel', class: M.nivelDesbloqueado(l.id) ? '' : 'bloq', title: l.nombre, 'aria-label': 'Ir al nivel ' + l.id + ': ' + l.nombre, onclick: ev => { ev.preventDefault(); const u = document.getElementById('u' + l.id); if (u) u.scrollIntoView({ behavior: Fx.reducido() ? 'auto' : 'smooth', block: 'start' }); } }, h('span', { text: String(l.id) })); Fx.aplicarUnidad(a, l.color); return a; })));
    col.appendChild(h('h2', { class: 'grupo-t', text: 'Ruta principal' }));
    principal.forEach(l => col.appendChild(unidad(l, actual)));
    if (libres.length) {
      col.appendChild(h('h2', { class: 'grupo-t', text: libres[0].grupo || 'Más temas' }));
      col.appendChild(h('p', { class: 'grupo-d', text: 'El resto de las diapositivas del curso. No dependen de los niveles anteriores: siempre están abiertas. Progreso: ' + pct(M.progresoExtra()) + '.' }));
      libres.forEach(l => col.appendChild(unidad(l, actual)));
    }
    col.appendChild(h('p', { class: 'peq tenue grupo-pie', text: 'Cada nivel tiene 3 etapas. La siguiente se abre al alcanzar ' + M.config().umbral + ' % de dominio en las últimas 10 respuestas (mínimo 5). El umbral se cambia en Ajustes.' }));
    mapa.appendChild(col); mapa.appendChild(riel());
    host.appendChild(mapa);
    // lleva la vista a la unidad actual (sin saltos bruscos si el usuario prefiere menos movimiento)
    const objetivo = document.getElementById('u' + (actual ? actual.n : 1));
    if (objetivo && (actual && (actual.n > 1 || M.dominio(actual.n, actual.e).n > 0))) requestAnimationFrame(() => { const y = objetivo.getBoundingClientRect().top + window.scrollY - 70; window.scrollTo({ top: Math.max(0, y), behavior: 'auto' }); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
