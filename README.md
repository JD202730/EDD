# Entrenador de Estructuras de Datos (UIS · 41336)

Aplicación web **local y sin dependencias** para estudiar, practicar y evaluarte en: **recursión, Big O, paradigmas
algorítmicos, árboles, recorridos, BST y AVL**. El contenido sale de las diapositivas del profesor Jheyston Serrano
(ver [`docs/TEMARIO.md`](docs/TEMARIO.md): temario organizado, convenciones del curso y qué es complemento).

* **146 plantillas de ejercicio** en 8 niveles × 3 etapas, que generan variantes distintas en cada intento (valores,
  árboles, secuencias de inserción y fragmentos de código cambian).
* **14 formatos**: selección (una o varias), verdadero/falso con justificación, preguntas abiertas, análisis de código,
  trazado, implementar, completar, depurar, Big O (tiempo y espacio + justificación), construcción de árboles,
  rotaciones AVL, comparaciones, razonamiento y preguntas mixtas.
* **Corrección real**: el código del estudiante **se ejecuta** contra pruebas; los árboles se verifican por estructura y
  propiedades (BST, AVL, inorden, alturas).
* **Dos modos**: *Práctica guiada* (pistas progresivas, explicación de errores, dificultad adaptativa) y *Modo examen*
  (sin pistas ni teoría; nota, informe por tema y revisión al final). Además *simulacros configurables* y *examen acumulativo*.
* **Laboratorio**: visualizador BST/AVL con animación de inserciones, eliminaciones, rotaciones y recorridos; visor de la
  pila de recursión; consola de Python.

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
js/temario.js         niveles, etapas y conceptos (teoría breve + ejemplo + fuente)
js/editor.js          editor de código con resaltado, números de línea y auto-sangría
js/tipos.js, tipos2.js   tipos de pregunta: render + corrección + solución
js/banco.js           registro del banco y utilidades para escribir plantillas
js/banco_n1.js … n8.js   plantillas de cada nivel
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

Ejercicios de código: `tests` son **expresiones de Python** (`e` se evalúa y se compara con `r`); `reglas` pueden ser
`recursiva`, `sinBucles`, `conBucle`, `noRecursiva`, `sinAnidados`, `usa`/`noUsa` (regex); `maxLlamadas`/`maxSteps` sirven
para exigir eficiencia (una solución exponencial se rechaza). `K.huecos(sol, huecos)` crea los `[[1]]` de *completar*.

**Para validarla:** abre `pruebas.html` → *Banco completo*. Comprueba que la solución de referencia puntúa 100 %, que la
respuesta en blanco / el código inicial **no**, que el tipo se renderiza y que el ciclo respuesta→corrección funciona.

**Agregar un concepto o un nivel:** `add('id', nivel, 'Nombre', 'fuente', 'teoría', 'ejemplo')` en `js/temario.js`; los
niveles están en la lista `niveles` del mismo archivo.

## Pruebas realizadas

* **Intérprete de Python** (el que ejecuta el código del estudiante): 58 fragmentos (aritmética con int/float, cadenas,
  listas, dicts, comprensiones, f-strings, clases y herencia, excepciones, `lru_cache`, `deque`, recursión, errores de
  ejecución…) comparados **tal cual contra CPython 3.12**: salida estándar y tipo de excepción idénticos.
* **Banco de preguntas:** cada plantilla se instancia con 30 semillas (146 plantillas × 30 = 4 380 instancias): la solución de referencia
  puntúa 100 %, el código inicial / respuesta en blanco no, y cada tipo se **renderiza y completa su ciclo** respuesta →
  corrección. Todos los ejercicios de código y las salidas esperadas se re-ejecutaron en **CPython real** (solo difieren,
  a propósito, los ejercicios de eficiencia: la fuerza bruta es correcta en CPython pero el entrenador la rechaza por lenta).
* **Árboles AVL** (inserción y eliminación): 600 casos aleatorios comparados con una implementación AVL estándar en CPython.
* **Interfaz:** recorrido de todas las pantallas, práctica guiada de punta a punta (pista, error, reintento, solución,
  código real, rotaciones AVL), examen completo (configuración, ejecución, entrega, informe, revisión, recarga a mitad
  de examen), laboratorio con animaciones, vista móvil (375 px) y tema claro/oscuro; simulación de 288 respuestas y 18
  configuraciones de examen sin errores.

Para repetirlas: `python pruebas/servidor_pruebas.py`, abre <http://127.0.0.1:8765/pruebas.html>, pulsa los tres botones y
luego `python pruebas/comparar_con_cpython.py`.

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
* **Rojo-negro:** el PDF de AVL disponible llega hasta la diapositiva 20; lo que se dice de rojo-negro es complemento
  general (marcado como tal). Los dos PDF de la Semana 2 se usaron para el nivel 2 (Big O).
* **Eficiencia como prueba:** se mide con un límite de *pasos* del intérprete, no con tiempo real.
* **Un solo usuario por navegador:** no hay cuentas ni sincronización (por diseño); usa exportar/importar progreso.
