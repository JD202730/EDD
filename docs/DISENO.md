# Diseño del entrenador — decisiones, tokens y reglas del juego

Documento para quien vaya a **mantener o ampliar** la interfaz. El contenido del curso está en [`TEMARIO.md`](TEMARIO.md); aquí solo está cómo se ve y cómo se comporta la app.

## Idea general

Una app de estudio con **ruta, recompensas y lecciones cortas** (la experiencia de una app de idiomas), pero sobria: el contenido de estudio (enunciados, código, árboles) queda legible y sin adornos; el color significa **estado o recompensa**, no decora. Todo lo que se muestra sale de lo que el estudiante hizo: no hay estadísticas inventadas ni botones de adorno.

Principios que se respetaron al rediseñar:

* No se tocó la lógica de ejercicios, evaluaciones, corrección ni progreso del `Motor`; el juego se **monta encima** escuchando sus eventos.
* Funciona sin servidor ni internet (`file://`), sin dependencias; la única fuente (Lexend) va dentro de `fonts/`.
* Cada pantalla se comprueba claro/oscuro, escritorio/teléfono, con teclado y con «reducir movimiento».

## Archivos

| Archivo | Qué contiene |
|---|---|
| `css/estilos.css` | Estilos base de la app (formularios, tarjetas, editor, árboles). Define los tokens originales. |
| `css/juego.css` | **Se carga después** y redefine los tokens (claro, oscuro, paletas) y añade estructura (menú lateral, barra superior, navegación inferior), mapa, lección, resultados, perfil, tienda y animaciones. |
| `fonts/lexend-latin.woff2`, `LEXEND-OFL.txt` | Lexend (licencia OFL), solo el subconjunto latino. |
| `js/ui.js` | `ET.Ico` (iconos SVG), `ET.Mascota` («Nodo»), `ET.Fx` (confeti, números flotantes, contraste automático del color de cada unidad). |
| `js/juego.js` | `ET.Juego`: monedas, vidas, escudos de racha, meta diaria, logros, tienda, retos. Estado en `E.juego` (se guarda con el progreso). |
| `js/vistas_mapa.js` | Pantalla **Aprender**: mapa de unidades, caminos, hoja de información de cada nodo, riel derecho. |
| `js/vistas_perfil.js` | **Perfil**, **Tienda** y la cola de ventanas de logro. |
| `js/vistas_practica.js` | Lección de 10 ejercicios, **Reto del nivel**, repaso, reintento y pantalla de resultados. |
| `js/motor.js` | Se añadió el bus de eventos (`M.on`), fechas locales y la racha con escudos. |
| `pruebas/juego_test.js` | `pruebaJuego()` en `pruebas.html`: 61 comprobaciones de las reglas. |

## Tokens de color

Los componentes **solo leen variables CSS**; cambiar un tema es cambiar sus valores en `juego.css`.

### Claro (verde)

`--bg #f2f4fb`, `--superficie #fff`, `--texto #181d38`, `--acento #15803d` (texto blanco encima: 5,0:1), `--acento2 #16a34a`, `--acento-bg #ebf7ec`, ok `#077a50`, error `#c51d4a`, aviso `#8a5300`, info `#1d4ed8`.

### Oscuro (grises cálidos de Claude + verde)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#262624` | fondo de la app |
| `--superficie` / `--superficie2` | `#30302e` / `#3b3b38` | tarjetas y elementos sobre ellas |
| `--borde` / `--borde-fuerte` | `#43423e` / `#5a5953` | separadores |
| `--borde-control` | `#8c8a82` | borde de campos y botones (3,8:1, WCAG 1.4.11) |
| `--texto` / `--suave` / `--tenue` | `#faf9f5` / `#c2c0b6` / `#a8a69c` | texto principal, secundario y de apoyo |
| `--acento` / `--acento2` | `#58cc02` / `#89e219` | botón principal, enlaces, elemento activo (6,3:1 sobre la tarjeta) |
| `--sobre-acento` | `#12290a` | texto sobre el acento (7,5:1) |
| `--acento-bg` | `#2c3d2a` | fondo de lo activo (pestaña, menú) |
| `--code-bg` / `--code-fg` | `#1f1e1d` / `#eceae0` | bloques de código |
| `--ok`, `--mal`, `--aviso`, `--info` | `#6fd0a0`, `#f58d88`, `#ebb653`, `#86b4f2` | estados (cada uno con su fondo `-bg` cálido) |

Se eligieron los grises cálidos de Claude porque el oscuro anterior (azul noche + violeta) es el aspecto más reconocible de las interfaces generadas con IA; el acento terracota de esa primera versión se cambió por **verde** a petición del usuario, que da una app más viva. La mascota, el logotipo, el favicon, el confeti y la muestra de la paleta «Clásica» usan el mismo verde en los dos temas (`--masc-*`, `--logo-*`, `--def-*` en `:root`).

### Paletas desbloqueables (Tienda, 40 monedas)

`oceano` (azul), `uva` (violeta) y `brasa` (naranja): solo cambian `--acento`, `--acento2` y `--acento-bg` (con variante clara y oscura, texto sobre el acento ≥ 4,5:1). La paleta por defecto se guarda con el id `indigo` (por compatibilidad con progreso ya guardado) y en pantalla se llama **Clásica**: es la verde. La paleta «Bosque» (verde, igual que la clásica) pasó a ser «Uva»; `Juego.estado()` migra sola a quien ya la tenía.

### Color de cada unidad

Cada nivel tiene un color (`js/temario.js` y `js/biblioteca.js`; el nivel 1 es azul para no repetir el verde de la app). `ET.Fx.aplicarUnidad(el, hex)` oscurece el color hasta que el texto del banner (tinta o blanco, el que mejor contraste) llegue a **4,6:1** y fija `--uc` y `--uc-txt`. Así los 14 niveles cumplen contraste sin elegir colores a mano.

## Tipografía y forma

* Lexend 400-800: pensada para legibilidad en lectura; se usa tanto en títulos como en texto.
* Botones principales «en relieve» (borde inferior de color, se hunde al pulsar), tarjetas de 20 px de radio, objetivos táctiles de **44 px** mínimo en pantallas táctiles.
* El código y los árboles no cambian de forma: son contenido de estudio.

## El mapa (pantalla Aprender)

* Una **unidad** por nivel del temario: banner pegajoso con el avance, atajos (Teoría, Biblioteca, Laboratorio, Taller, Quiz a mi medida, Detalles) y un camino con nodos en zigzag unidos por un hilo punteado.
* Nodos de cada unidad: **Etapa A, B, C**, **Reto del nivel** (cofre; se abre al completar la etapa A) y **Examen del nivel**.
* Estados reales: `bloq` (candado), `disp`, `curso` (anillo con el dominio actual), `hecha`. El nodo actual (`App.siguienteEtapa()`) lleva el globo «Empezar/Seguir» y es lo único que pulsa.
* Pulsar un nodo abre una **hoja** (diálogo modal con foco atrapado; `Esc` cierra y devuelve el foco al nodo) con lo que implica y el botón de empezar. Un nodo bloqueado explica qué falta, no se limita a deshabilitarse.
* Los nodos del mapa usan la clase `cnodo` (no `nodo`: esa la usan los árboles SVG de `arboles.js`, `taller.js`, `tipos2.js`, etc., y un selector `.nodo` los rompe).

## Movimiento (sección «vida y movimiento» de `juego.css`)

Cada animación responde a una acción o marca el objetivo; todas se apagan con «reducir movimiento».

| Dónde | Qué hace |
|---|---|
| Botones | Se elevan con rebote al pasar el cursor y se hunden al pulsar (borde inferior de color). |
| Mapa | Los nodos entran en escalón con rebote; el nodo actual late (anillo), su letra menea cada pocos segundos y el globo «Seguir» flota; al pasar el cursor el nodo se inclina; un nodo bloqueado se sacude. |
| Mascota «Nodo» | Parpadea, respira y bota (feliz); salta al pulsarla en el mapa y celebra con dos saltos. |
| Indicadores de arriba | El que cambia de valor «salta» (`App.refrescarChips` marca `.sube`); la llama oscila si hoy ya practicaste; el corazón late si tienes vidas; la moneda gira al pasar el cursor. |
| Lección | Elegir una opción la resalta con un pequeño salto; acertar rebota la tarjeta de retroalimentación, fallar la sacude; la barra de progreso crece con rebote y tiene un destello continuo. |
| Resultados y perfil | Las tarjetas entran en cascada; el riel, los logros y las paletas también. |
| Fondo | Dos resplandores suaves (verde arriba a la derecha, naranja abajo a la izquierda). |

Detalle técnico: las animaciones de entrada usan `animation-fill-mode: backwards` (no `both`); con `both` el último fotograma (`transform: none`) taparía los `transform` de hover y de pulsación después de terminar.

## Reglas del juego (`ET.Juego.PREMIOS`)

| Concepto | Regla |
|---|---|
| XP | Ya existía en el `Motor`; el juego solo lo muestra y suma la **meta diaria** (15 / 30 / 50 XP, se elige en Perfil). |
| Monedas | +1 por ejercicio resuelto, +1 más si fue sin pistas ni fallos; +5 lección con ≥ 80 %; +5 lección perfecta; +10 etapa; +25 nivel; +20 reto superado por primera vez (+30 XP); +10 por logro; examen: `round(nota/5 × 15)` con tope 15. |
| Vidas | Máximo 5, +1 cada 20 min (recarga calculada al mirar, no hay temporizador). **Solo se gastan en el Reto**: la primera falla de cada ejercicio, o ver la solución sin haber fallado. Con 0 vidas el reto termina («Te quedaste sin vidas»). Recargar todas cuesta 20 monedas. |
| Reto del nivel | 10 ejercicios mezclados de las tres etapas; se supera con **7 o más a la primera** sin quedarte sin vidas. Sin pistas del juego ni «Saltar». |
| Racha | Días seguidos con práctica o examen, con **fecha local** (antes se usaba UTC y se rompía a las 7 p. m. en Colombia). Si pasan días sin practicar y no hay escudos, vale 0. |
| Escudos | Máximo 2, 30 monedas cada uno; se gasta solo, uno por día perdido. |
| Logros | 23, con progreso real (`valor / meta`) y 3 niveles de medalla (bronce, plata, oro). Cada uno da +10 monedas y una ventana de celebración. |
| Tienda | Escudo (30), recarga de vidas (20), paletas (40). Todo se compra con monedas ganadas estudiando. |

Los números que aparecen en la Tienda se leen de `PREMIOS`, `RETO` y `MAX_VIDAS`: si cambias una regla en `juego.js`, el texto de la pantalla cambia solo.

## Lección y resultados

* Barra superior con cerrar (con confirmación si hay avance), barra de progreso, contador «Ejercicio n de 10» y los corazones (solo en el reto).
* Barra de acciones fija abajo: Pista, Teoría, Comprobar / Continuar. La retroalimentación (correcto/incorrecto) usa color **y** texto **y** icono; las explicaciones de los errores no se tocaron.
* Resultados: XP, aciertos a la primera, tiempo, monedas, vidas (en reto) y avance de la etapa. La mascota cambia de humor (feliz, celebra, triste).

## Accesibilidad (comprobado)

* Contraste: todos los pares de tokens claro y oscuro ≥ 4,5:1 para texto y ≥ 3:1 para bordes de control e iconos (script de comprobación en el historial de trabajo; los valores de la tabla de arriba son los verificados).
* Teclado: enlace «Saltar al contenido», orden lógico (menú → contenido), foco visible, hojas y diálogos con foco atrapado y retorno del foco, `Esc` para cerrar. Cada nodo del mapa es un `button` con nombre accesible («Etapa A, Fundamentos del nivel 1: en curso, tu siguiente objetivo»).
* Movimiento: con «reducir movimiento» se desactivan confeti, pulsos y transiciones; la única animación continua es el pulso del nodo actual.
* Los chips de racha, monedas y vidas son enlaces con descripción completa para lectores de pantalla.

## Cómo ampliar

* **Un logro nuevo:** añade una entrada a `LOGROS` en `juego.js` (`id`, `nombre`, `desc`, `icono`, `tier`, `valor()`, `meta`). Aparece solo en el Perfil y se concede en el siguiente evento.
* **Un artículo de la Tienda:** entrada en `ARTICULOS` con `precio` y `puede()`; la compra se implementa en `Juego.comprar`.
* **Una paleta:** entrada en `PALETAS`, y sus variables `--acento*` (claro y oscuro) en `juego.css`; comprueba el contraste del texto sobre el acento.
* **Un icono:** función en `TRAZO` o `RELLENO` de `ui.js`.
* **Un tema nuevo:** redefine los tokens de la sección «oscuro» (hay dos copias idénticas: `data-tema="oscuro"` y la de `data-tema="auto"` dentro de `prefers-color-scheme`).

## Trampas conocidas

* No reutilices nombres de clase genéricos (`nodo`, `arista`…) en `juego.css`: `estilos.css` y los dibujos SVG ya los usan.
* Las capturas del panel del navegador de pruebas a veces salen recortadas (relación de píxeles 1,5); no es un fallo de la app.
* `Motor.reiniciar()` borra también `E.juego` (monedas, logros, compras): la confirmación de **Ajustes** lo dice.
