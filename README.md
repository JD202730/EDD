# Entrenador de Estructuras de Datos (UIS · 41336)

Aplicación web **local y sin dependencias** para estudiar, practicar y evaluarte en: **recursión, Big O, paradigmas
algorítmicos, árboles, recorridos, BST, AVL y rojo-negro**. El contenido sale de las diapositivas del profesor Jheyston Serrano
(ver [`docs/TEMARIO.md`](docs/TEMARIO.md): temario organizado, convenciones del curso y qué es complemento).

* **📚 Biblioteca de estudio** (menú *Biblioteca*): teoría completa **escrita dentro de la aplicación** a partir de los seis PDF
  de clase (S2-C1, S2-C2, S5-C2, S6-C1, S6-C2 y S7-C1 completo, 49 diapositivas). **53 temas en 9 áreas** (recursión, complejidad,
  paradigmas, fundamentos de árboles, recorridos, BST, AVL, rojo-negro y temas adicionales); cada tema tiene las **mismas diez
  partes** (definición, explicación intuitiva, teoría formal, procedimiento, código de referencia en Python, ejemplo resuelto,
  complejidad con justificación, errores frecuentes, preguntas de examen y resumen rápido). Lo que **no** está en los PDF aparece
  marcado como *contenido complementario*. Incluye 41 **fórmulas y reglas** (variables, cuándo se usa, ejemplo y condiciones), 15
  **tablas comparativas** (BST/AVL, AVL/rojo-negro, recursión/memoización, fuerza bruta/DP, pre/in/postorden, complejidades temporales
  y espaciales…), un **Repaso antes del examen** compacto con autoevaluación, índice lateral, **buscador de conceptos**, marcar
  *estudiado*, *favoritos* y enlaces a la **práctica guiada** y al **examen de cada tema o área**. Los temas de árboles abren
  **ejemplos interactivos** (más de 12 nodos) con el depurador *Código ↔ Árbol*.
* **💻 Código ↔ Árbol** (*Laboratorio → Código ↔ Árbol* y dentro de la Biblioteca): el árbol que ves **se reconstruye de la
  ejecución real** de tu código Python (objetos creados y atributos asignados), línea por línea, hacia adelante y hacia atrás;
  pausa, paso a paso, reinicio, variables y pila de llamadas; clic en un nodo → qué líneas lo crearon o modificaron; clic en una
  línea → qué cambió. Funciona con inserciones, búsquedas, eliminaciones, recorridos y rotaciones AVL (y rojo-negro con colores).
  Lo que no se puede dibujar (árboles hechos con listas o diccionarios, Python no soportado) **se informa**, nunca se simula.
* **239 plantillas** (222 activas; 17 preguntas «básicas» retiradas, ver más abajo) en 8 niveles × 3 etapas, que generan variantes
  distintas en cada intento (valores, árboles, secuencias de inserción y fragmentos de código cambian).
* **Modelo de parcial del profesor** (pregunta de 1,0 punto con literales): verdadero/falso **con justificación escrita**, tabla de
  complejidades (con «amortizado»), complejidad con **variable + caso + regla + justificación**, algoritmo en 4 literales (trazado,
  resultado, implementación con casos borde —el O(n²) vale la mitad—, argumento amortizado) y programación con casos borde y reglas
  del enunciado. Ver *Parcial simulado*.
* **17 formatos**: selección (una o varias), verdadero/falso con justificación, preguntas abiertas, análisis de código,
  trazado, implementar, completar, depurar, Big O (tiempo y espacio + justificación), construcción de árboles,
  rotaciones AVL, comparaciones, razonamiento, preguntas mixtas, **V/F con justificación**, **complejidad con variable/caso/regla** y **talleres interactivos de árboles** (se resuelven moviendo nodos).
* **Taller interactivo de árboles** (BST y AVL): arrastras el nodo nuevo a su hueco, detectas el primer nodo desbalanceado,
  clasificas el desbalance (LL/RR/LR/RL) y aplicas cada rotación arrastrando un hijo sobre su padre (derecha/izquierda se
  deduce del lado del hijo). Para eliminar: tipo de eliminación y sustituto/papelera. **Modo estricto**: un movimiento
  incorrecto no se acepta, el árbol no cambia y no se muestra el resultado; hay que intentarlo otra vez (pistas de 3 niveles
  dentro del taller, cada una resta crédito). Funciona con mouse, dedo o teclado (tocar nodo + botones). Está en *Laboratorio →
  Taller interactivo* (con ejemplos y operaciones propias, p. ej. `10, 20, 30, 40, 50, 25` o `-30` para eliminar) y como
  ejercicios de práctica en los niveles 6 y 7 (no entran en los exámenes porque requieren arrastrar).
* **Corrección real**: el código del estudiante **se ejecuta** contra pruebas; los árboles se verifican por estructura y
  propiedades (BST, AVL, inorden, alturas).
* **Dos modos**: *Práctica guiada* (pistas progresivas, explicación de errores, dificultad adaptativa) y *Modo examen*
  (sin pistas ni teoría; nota, informe por tema y revisión al final). Además *simulacros configurables*, *examen acumulativo* y el
  **Parcial simulado**.
* **Parcial simulado** (Examen → Parcial simulado): 5 preguntas de 1,0 punto (V/F con justificación · tabla de complejidades ·
  complejidad de 3 funciones · algoritmo en 4 literales · programación con casos borde) de los temas del próximo parcial
  (recursión, paradigmas, árboles, recorridos, BST, AVL), **120 minutos**, sin pistas y con **puntaje parcial por literal**; al
  entregar ves la nota sobre 5,0 y los puntos por pregunta y literal (`0,23 / 0,45`).
* **Justificaciones escritas**: se evalúan por criterios visibles (palabras clave); tú puedes ajustar cada criterio con las casillas
  «lo expliqué» (autoevaluación). No hay IA ni servicios externos: todo funciona sin internet y sin costo.
* **Laboratorio**: visualizador BST/AVL con animación de inserciones, eliminaciones, rotaciones y recorridos; depurador
  *Código ↔ Árbol*; visor de la pila de recursión; consola de Python.

## Cómo ejecutarlo

**Opción 1 (la más simple):** abre `index.html` con doble clic (probado en Chromium/Edge/Chrome; Firefox y Safari recientes deberían funcionar: se usan `:has()` y `color-mix()`). No hay instalación,
servidor ni internet: todo es HTML + CSS + JavaScript clásico.

**Opción 2 (servidor local, opcional):** desde esta carpeta

```bash
python -m http.server 8000
```

y abre <http://localhost:8000>. (En Windows también puedes ejecutar `iniciar.bat`.)

El progreso se guarda automáticamente en el navegador (`localStorage`); sobrevive a cerrar y reabrir. En **Ajustes** puedes
exportarlo/importarlo (JSON) y reiniciarlo. Si usas dos navegadores o dos modos de apertura (`file://` vs `localhost`)
tendrás dos progresos separados: exporta/importa para pasarlos.

## Cómo funciona el progreso

| Concepto | Regla |
|---|---|
| Etapas | A Fundamentos · B Aplicación · C Dominio, por nivel |
| Dominio de una etapa | promedio del **crédito** de las últimas 10 respuestas (mínimo 5) |
| Crédito de una respuesta | puntaje × factor de pistas (0 pistas 100 %, 1 → 85 %, 2 → 70 %, 3 → 50 %) × 0,6 si hubo fallos previos |
| Desbloqueo | etapa siguiente / nivel siguiente al llegar al **umbral** (80 % por defecto, ajustable 50–100 %) |
| Desbloqueo libre | Ajustes → permite entrar a cualquier etapa (para repasar un tema suelto) |
| Dificultad adaptativa | 3 aciertos seguidos con buen crédito suben la dificultad objetivo; 2 fallos seguidos la bajan; menos preguntas demasiado fáciles si dominas |
| Refuerzo | ~35 % de las preguntas apuntan a conceptos débiles; si confundes casos de rotación (p. ej. LR ↔ RL) se priorizan ejercicios de ese caso |
| Examen | se evalúa **aparte**: no cambia el desbloqueo, pero sus fallos van a *Mis errores* y a la lista de conceptos débiles |

## Estructura del proyecto

```
index.html            aplicación
pruebas.html          página de pruebas automáticas (ver más abajo)
css/estilos.css       estilos (claro/oscuro, responsive)
js/util.js            RNG con semilla, DOM, almacenamiento, resaltado de Python
js/pyparse.js         tokenizador y parser de un subconjunto de Python
js/pyinterp.js        intérprete (recorrido del AST)
js/pybuiltins.js      funciones integradas, métodos y módulos (math, functools, collections, time, random, sys)
js/pyapi.js           ejecutar, sesiones de prueba, análisis estático y diagnósticos
js/arboles.js         árboles: BST/AVL, notación, generadores, dibujo SVG y animaciones
js/traza.js           traza de ejecución (eventos de objetos y atributos) y reconstrucción del árbol en cada paso
js/ejemplos_codigo.js programas de ejemplo (BST, AVL, rojo-negro, recorridos, recursión…) para el depurador
js/temario.js         niveles, etapas y conceptos (teoría breve + ejemplo + fuente)
js/editor.js          editor de código con resaltado, números de línea y auto-sangría
js/codigo_arbol.js    depurador «Código ↔ Árbol» (se usa en el Laboratorio y dentro de la Biblioteca)
js/biblioteca.js      registro de la Biblioteca: temas, fórmulas, tablas, repaso, búsqueda y progreso
js/teoria_*.js        contenido de la Biblioteca (rec, cx1/cx2, pd, ar, tv, bs, av, rn, ad, formulas, tablas, repaso)
js/vistas_biblioteca.js  pantallas de la Biblioteca (índice, tema, fórmulas, tablas, repaso, favoritos, búsqueda)
js/banco_biblioteca.js   ejercicios de los temas que no tenían práctica propia (medir/contar, constantes, clásicos/NP, rojo-negro)
js/tipos.js, tipos2.js   tipos de pregunta: render + corrección + solución
js/tipos3.js          tipos «vfj» (V/F con justificación) y «cplx» (complejidad con variable/caso/regla)
js/taller.js          taller interactivo de árboles (arrastrar nodos, fases, validación estricta) y su tipo de pregunta «taller»
js/banco.js           registro del banco y utilidades para escribir plantillas
js/banco_n1.js … n8.js   plantillas de cada nivel
js/banco_taller.js    plantillas de los talleres interactivos (solo práctica)
js/banco_pq*.js       banco «tipo parcial»: V/F con justificación (pq), complejidades (pq_cplx), tablas (pq_tabla),
                      algoritmo en 4 literales (pq_alg) y programación con casos borde (pq_prog)
js/banco_retiro.js    lista de preguntas «básicas» retiradas (siguen registradas pero no se sirven)
js/motor.js           estado, dominio, desbloqueos, selección adaptativa, errores, exámenes, recomendaciones
js/vistas_*.js, app.js   pantallas y enrutador
docs/TEMARIO.md       análisis de los PDF y temario organizado
pruebas/              snippets, arneses y scripts de comparación con CPython
```

## Cómo agregar preguntas

Cada pregunta es una **plantilla** registrada con `ET.Banco.add({...})` en `js/banco_nX.js`:

```js
B({
  id: 'n3-mi-pregunta',      // único
  n: 3, e: 'B', dif: 3,      // nivel 1-8, etapa A|B|C, dificultad 1-5
  c: ['pd_memo', 'pd_dp'],   // conceptos (ids de js/temario.js)
  tema: 'Texto corto',
  gen(rng, K, opts) {        // rng: generador con semilla; K: utilidades; opts: p. ej. {caso:'LR'}
    const n = rng.int(5, 9);
    return {
      tipo: 'salida', numerico: true,
      enunciado: 'Texto en markdown ligero (**negrita**, `código`, listas con "- ")',
      codigoVista: 'def f(n): ...',          // opcional: código mostrado
      arbol: Arb.parse('20(10,30)'),         // opcional: árbol dibujado
      esperado: '42',
      pistas: ['orienta', 'más específica', 'casi la respuesta'],
      explicacion: 'Por qué…'
    };
  }
});
```

Con la misma semilla una plantilla produce siempre la misma pregunta (así *Mis errores* puede reintentarla).

**Tipos y campos principales** (el *tipo* decide cómo se corrige):

| `tipo` | Campos clave |
|---|---|
| `opcion` | `opciones:[{t, ok, why}]`, `multi` · usa `K.mc(rng, enunciado, buenas, malas)` |
| `vf` | `afirmacion`, `correcta`, `justif:{opciones}` · `K.vf(...)` |
| `abierta` | `criterios:[{desc, claves:[…]}]` (claves = alternativas; un array interno = todas deben aparecer; admite `RegExp`), `modelo` |
| `salida` | `esperado` (string o lista de alternativas), `tokens`, `numerico`, `multilinea` |
| `tabla` | `cols`, `filas:[[{t:'texto'},{in:'esperado' ó ['alt1','alt2']}]]` |
| `codigo` | `modoEj: 'codigo'|'completar'|'depurar'`, `starter`/`plantilla`+`respuestas`, `solucion`, `tests:[{e,r}]`, `prelude`, `reglas`, `maxSteps` |
| `bigo` | `tiempo`, `espacio`, `pideEspacio`, `escala`, `etq`, `justif` |
| `arbol` | `esperado` (árbol) + `aceptados`, `verificar:{bst,avl,inorden}` ó `validar(t)` |
| `avl` | `pide:['nodo','caso','nrot','raiz','arbol','alt']`, `esperado:{…}` |
| `clasificar` | `categorias`, `items:[{t, cat, why}]` |
| `orden` | `items`, `correcto`, `inicial` |
| `mixta` | `partes:[{titulo, peso, q:{…cualquier tipo…}}]` |
| `taller` | `taller:{tipo:'avl'\|'bst', conv:'suc'\|'pred', arbol, ops:[{t:'ins',v}\|{t:'del',v}\|{t:'reb'}], finalEsperado}`, `pistasInternas:true` · ver `js/banco_taller.js`; la plantilla lleva `soloPractica:true` para quedar fuera de los exámenes |
| `vfj` | `afirmacion`, `correcta`, `justif:{criterios:[{desc, claves}], modelo}`, `pesoMarca` (0,3 por defecto: la justificación vale más que la marca) |
| `cplx` | `esperado:{clase, variable, caso, regla}`, `escala`, `variables`, `reglasOpc`, `justif`, `medir` (la prueba mide los pasos para verificar la clase) |
| `tabla` + `cx:true` | las celdas se comparan como complejidades: `O(n²)`=`O(n^2)`, `O(n log n)`=`n*log n`; «amortizado» debe escribirse cuando la celda lo pide |

Las plantillas «de parcial» llevan `parcial:true` y `slot:'vf'\|'tabla'\|'cplx'\|'alg'\|'prog'` (así el *Parcial simulado* elige una de cada tipo)
y devuelven una `mixta` con `valor` (puntos totales) y `peso` por literal; mira `js/banco_pq*.js`.

Ejercicios de código: `tests` son **expresiones de Python** (`e` se evalúa y se compara con `r`); `reglas` pueden ser
`recursiva`, `sinBucles`, `conBucle`, `noRecursiva`, `sinAnidados`, `usa`/`noUsa` (regex); `maxLlamadas`/`maxSteps` sirven
para exigir eficiencia (una solución exponencial se rechaza). `K.huecos(sol, huecos)` crea los `[[1]]` de *completar*.
**Media nota por ineficiencia** (como en el parcial): una prueba con `ef:true` y `maxPasos` (presupuesto de pasos) se ejecuta con los
*costos ocultos* de Python activados (`x in lista`, `A[1:]`, `pop(0)`, `insert`, `list + list`, `sorted`, `sum`… cuestan lo que
recorren); si todas las pruebas de corrección pasan pero la de eficiencia no, el puntaje es la mitad. `PQ.codigoQ({…})`
(en `banco_pq_alg.js`) genera las pruebas con una solución de referencia y calibra el presupuesto (×6 los pasos de la referencia).

**Para validarla:** abre `pruebas.html` → *Banco completo*. Comprueba que la solución de referencia puntúa 100 %, que la
respuesta en blanco / el código inicial **no**, que el tipo se renderiza y que el ciclo respuesta→corrección funciona.

**Agregar un concepto o un nivel:** `add('id', nivel, 'Nombre', 'fuente', 'teoría', 'ejemplo')` en `js/temario.js`; los
niveles están en la lista `niveles` del mismo archivo.

## Pruebas realizadas

* **Intérprete de Python** (el que ejecuta el código del estudiante): 58 fragmentos (aritmética con int/float, cadenas,
  listas, dicts, comprensiones, f-strings, clases y herencia, excepciones, `lru_cache`, `deque`, recursión, errores de
  ejecución…) comparados **tal cual contra CPython 3.12**: salida estándar y tipo de excepción idénticos.
* **Talleres interactivos:** 6 plantillas × 25 semillas (150 ejercicios) resueltos fase por fase por un robot: en cada fase se
  intenta primero un movimiento incorrecto (784 rechazos: el árbol no cambió ni avanzó la fase) y luego el correcto; el resultado
  final coincide con el AVL/BST calculado por el motor. Además se probaron a mano, con arrastre real del mouse, la inserción
  con rotación doble (LR), la eliminación con dos hijos, la papelera y el modo táctil (375 px, sin desbordes).
* **Banco «tipo parcial»** (74 plantillas nuevas): todas las plantillas `pq-*` se instancian con varias semillas; la solución
  de referencia puntúa 100 %, la respuesta en blanco no, el tipo se renderiza y completa su ciclo, y **la solución lenta
  (O(n²)/exponencial) de cada pregunta de código puntúa ≈ 50 %**. Además, **60 complejidades se midieron con el intérprete**
  (razón de pasos entre dos tamaños frente a la clase declarada: n, n², log n, 2ⁿ, …; botón «Complejidades medidas») y las soluciones
  de referencia **y** las lentas (240 ejercicios de código) se re-ejecutaron en **CPython real** sin diferencias.
* **Parcial simulado:** configuración → 5 preguntas (una por tipo) → entrega → nota sobre 5,0 con puntos por literal; probado de
  punta a punta (incluida la nota parcial: marca invertida, justificaciones vacías, solución lenta) y con 30 parciales generados
  y calificados con las soluciones de referencia (150 preguntas, todas al 100 %).
* **Banco de preguntas (primera versión):** cada plantilla se instancia con 30 semillas (146 plantillas × 30 = 4 380 instancias): la solución de referencia
  puntúa 100 %, el código inicial / respuesta en blanco no, y cada tipo se **renderiza y completa su ciclo** respuesta →
  corrección. Todos los ejercicios de código y las salidas esperadas se re-ejecutaron en **CPython real** (solo difieren,
  a propósito, los ejercicios de eficiencia: la fuerza bruta es correcta en CPython pero el entrenador la rechaza por lenta).
* **Árboles AVL** (inserción y eliminación): 600 casos aleatorios comparados con una implementación AVL estándar en CPython.
* **Interfaz:** recorrido de todas las pantallas, práctica guiada de punta a punta (pista, error, reintento, solución,
  código real, rotaciones AVL), examen completo (configuración, ejecución, entrega, informe, revisión, recarga a mitad
  de examen), laboratorio con animaciones, vista móvil (375 px) y tema claro/oscuro; simulación de 288 respuestas y 18
  configuraciones de examen sin errores.

* **Código ↔ Árbol:** 78 comprobaciones sobre los ejemplos (el árbol final coincide con el motor de AVL/BST, las propiedades
  rojo-negro se cumplen, el avance y el retroceso son deterministas, el historial de cada nodo apunta a las líneas reales, un árbol de
  60 nodos, nombres de atributo personalizados y errores/límites informados).
* **Biblioteca:** 3 469 comprobaciones: las diez partes de los 53 temas, enlaces internos, conceptos del temario ↔ temas,
  búsqueda, 59 bloques de código ejecutados con el intérprete del entrenador **y** con **CPython 3.12** (salida idéntica a la
  declarada), 41 fórmulas y 15 tablas bien formadas, las 67 pantallas se dibujan, el examen y la práctica de **cada tema** se generan,
  los ejemplos de BST/AVL/rojo-negro llegan a más de 12 nodos y una **lista de 419 frases clave de los 6 PDF** (diapositiva por
  diapositiva) aparece en el texto. El rojo-negro (con ramas espejo completas) se verificó con 24 555 operaciones aleatorias en CPython
  (raíz negra, sin rojos seguidos, misma altura negra, inorden, punteros al padre y altura ≤ 2·log₂(n+1)).

Para repetirlas: `python pruebas/servidor_pruebas.py`, abre <http://127.0.0.1:8765/pruebas.html>, pulsa los botones
(intérprete, banco completo, AVL, talleres interactivos, complejidades medidas, Código ↔ árbol, **Biblioteca**) y luego
`python pruebas/comparar_con_cpython.py` y `python pruebas/comparar_biblioteca.py`. (Para escribir contenido nuevo con salida
verificada: pon `esperado: '@@id#n'`, corre «Biblioteca» y ejecuta `python pruebas/fijar_esperados.py`.)

## Preguntas «básicas» retiradas

El parcial del profesor no pregunta «¿qué imprime este programa?» ni vocabulario suelto, así que 17 plantillas se retiraron del
entrenamiento (`js/banco_retiro.js`: `n1-pila-prof`, `n1-traza-valor`, `n1-ida-vuelta`, `n1-contar-llamadas`, `n1-cache`, `n1-comp`,
`n1-base-linea`, `n1-vf`, `n2-conteo`, `n2-pred-tiempo`, `n4-vocab`, `n4-prof-alt`, `n4-perfecto-formula`, `n4-acceso-nodo`, `n4-vf`,
`n7-altura-vacio`, `n8-lee-codigo-arbol`). Siguen registradas (los errores guardados se pueden abrir) pero ya no se sirven; para
reactivarlas basta quitar su id de esa lista.

## Limitaciones conocidas (honestas)

* **El código se ejecuta con un intérprete propio**, no con CPython (el navegador no tiene Python). Soporta funciones, clases
  (con herencia simple y `super()`), listas, tuplas, dicts, sets, comprensiones, f-strings, excepciones, `lru_cache`, `deque`,
  `defaultdict`, `math`, etc. **No** soporta generadores/`yield`, `with`, `async`, módulos externos ni `input()`; los enteros son exactos solo
  hasta 2⁵³ (más allá se avisa con error); los `set` se imprimen en orden de inserción (CPython usa el orden del hash).
  La profundidad máxima de recursión efectiva puede ser menor que 1000.
  Lo no soportado se **informa** (nunca se simula).
* **Preguntas abiertas:** se corrigen por criterios con palabras clave; puede haber falsos negativos con redacciones muy
  distintas (por eso puedes marcar a mano los criterios que sí cubriste) y falsos positivos si nombras las palabras sin
  explicar. Úsalas como autoevaluación guiada.
* **Rojo-negro:** la Biblioteca y el banco usan ya el PDF de S7-C1 **completo** (49 diapositivas): reglas, inserción (3 casos),
  eliminación con doble negro (4 casos) y el código de apoyo. La clase deja las ramas espejo del código como «…»; están escritas
  completas y marcadas como complementarias. Las cotas de rotaciones del rojo-negro (≤ 2 por inserción, ≤ 3 por eliminación) y la
  del AVL (< 1,44·log₂(n+2)) también son complementarias.
* **Cifra de las diapositivas a corregir:** S2-C1 d.13 y S2-C2 d.15 dicen que con n = 10⁶ y 10⁹ op/s un algoritmo n² tarda
  «≈ 11 días»; la cuenta correcta es 10¹² ÷ 10⁹ = 10³ s ≈ 17 minutos (11 días son ≈ 10¹⁵ operaciones). El entrenador usa la
  cuenta correcta y lo indica.
* **Código ↔ Árbol:** solo se dibujan objetos de clases propias con atributos de hijo izquierdo/derecho (configurables); las
  trazas muy largas se truncan (60 000 pasos / 600 000 eventos) y se avisa. La biblioteca no usa IA ni servicios externos.
* **Eficiencia como prueba:** se mide con un límite de *pasos* del intérprete, no con tiempo real. Los *costos ocultos* de Python se
  modelan solo para las operaciones listadas arriba (en las pruebas de eficiencia); otras operaciones ocultas cuentan como un paso.
* **Justificaciones escritas:** se evalúan por palabras clave y criterios visibles (puedes ajustarlos a mano con «lo expliqué»); una
  redacción muy distinta puede quedar sin detectar y mencionar palabras sin explicarlas puede dar un falso positivo. Compara siempre
  tu texto con la respuesta modelo que se muestra al corregir.
* **Parcial simulado:** reproduce el *modelo* del parcial del profesor (tipos de pregunta, puntajes por literal, justificaciones,
  media nota por O(n²)) con contenido de recursión, paradigmas, árboles, recorridos, BST y AVL; **no** son preguntas del examen real
  ni incluyen tablas hash (el profesor aún no las ve) ni material de las semanas 1–4.
* **Taller interactivo:** si cambias de pestaña mientras se anima un giro, la animación se completa al volver. En pantallas
  táctiles el dibujo del taller captura el gesto (no se desplaza la página mientras arrastras sobre él); desplázate desde los márgenes.
* **Un solo usuario por navegador:** no hay cuentas ni sincronización (por diseño); usa exportar/importar progreso.
