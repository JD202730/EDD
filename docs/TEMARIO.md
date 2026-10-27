# Temario organizado — Entrenador de Estructuras de Datos (UIS 41336)

Análisis previo a la programación. Fuente principal: los PDF de clase del profesor Jheyston Serrano.

| Sigla | PDF | Diapositivas | Uso |
|---|---|---|---|
| **S2-C1** | Clase1_AnalisisAsintotico | 29 | Nivel 2 (conteo de operaciones, casos, espacio) |
| **S2-C2** | Clase2_NotacionBigO | 28 | Nivel 2 (O, Ω, Θ, reglas, ciclos, costos de Python) |
| **S5-C2** | Clase2_RecursionParadigmas | 23 | Niveles 1 y 3 |
| **S6-C1** | Clase1_ArbolesRecorridos | 27 | Niveles 4 y 5 |
| **S6-C2** | Clase2_BST | 20 | Nivel 6 |
| **S7-C1** | Clase1_BalanceoAVL | 49 (completo) | Nivel 7: AVL (d.1-21, 34-39, código 42-44) y rojo-negro (d.22-33, código 45-49) |
| **S1-C1** | Clase1_TiposDatosAbstractos | — | Nivel 9 (estructura de datos, clasificación, TAD, axiomas, implementaciones) |
| **S1-C2** | Clase2_MemoriaEstaticaDinamica | — | Nivel 9 (pila y montículo, memoria estática y dinámica, referencias, copias, caché) |
| **S3-C1** | Clase1_Arrays | — | Nivel 10 (arreglo, prefijos, Kadane, dos punteros, ventana, merge intervals) |
| **S3-C2** | Clase2_Pilas | — | Nivel 11 (pila, balanceo de símbolos, pila monótona) |
| **S4-C1** | Clase1_ColasDeques | — | Nivel 11 (cola, deque, cola circular) |
| **S4-C2** | Clase2_ListasEnlazadas | 24 | Nivel 12 (lista simple y doble, insertar, eliminar, Floyd) |
| **S7-C2** | Clase2_HeapsColasPrioridad | — | Nivel 13 (heap min/max, bubble up/down, heapify, cola de prioridad, top-k, heapsort) |
| **AP-S3-C1** | Clase1_Condicionales (Algoritmos y Programación 41333) | — | Nivel 14 (booleanas, if/elif/else, anidados, ternario) |

> Los dos PDF de S2 no estaban en tu lista, pero están en la misma carpeta y el Nivel 2 (Big O) casi no tiene
> contenido en los 4 adjuntos; los usé solo para alinear la terminología de ese nivel.
> El PDF de S7-C1 ya está completo (49 diapositivas): incluye **rojo-negro** (reglas, inserción en 3 casos, eliminación con doble negro en 4 casos, código de apoyo). Las ramas espejo del código, que la clase deja como «…», y las cotas de rotaciones/altura son *complemento* y se marcan como tal.
> **Ojo con una cifra:** S2-C1 d.13 y S2-C2 d.15 dicen «n² con n = 10⁶ tarda ≈ 11 días» a 10⁹ op/s; la cuenta correcta es 10¹² ÷ 10⁹ = 1000 s ≈ 17 min.
> La **Biblioteca de estudio** (`js/teoria_*.js`) desarrolla todo este temario en 53 temas con diez partes cada uno; `pruebas/cobertura_pdf.js` lista las frases clave de cada diapositiva que la prueba verifica.

## Convenciones del curso (la app las respeta en enunciados y correcciones)

* **Altura** = número de *aristas* hacia la hoja más lejana; hoja = 0. **Árbol vacío = −1** (AVL, S7-C1 diap. 7).
* **Profundidad** = aristas desde la raíz; raíz = 0. Nivel = profundidad.
* Árbol de N nodos → **N − 1 aristas**. Perfecto de altura h → **2^(h+1) − 1** nodos.
* **BST**: izq < v < der **para todo el subárbol**, no solo los hijos. **Duplicados: no se insertan.**
* **Eliminación BST** (S6-C2, código de clase): 0 hijos → quitar; 1 hijo → subir el hijo; 2 hijos → **predecesor inorden** (mayor del subárbol izquierdo), copiar valor y eliminar el sustituto. También es válido el sucesor (menor del derecho).
* **Eliminación AVL** (S7-C1): usa el **sucesor inorden** (mínimo del subárbol derecho) y rebalancea por el camino; puede requerir varias rotaciones.
* **Factor de balance** = altura(izq) − altura(der); AVL exige |f| ≤ 1. Casos: Izq-Izq → rot. derecha; Der-Der → rot. izquierda; Izq-Der → izq. del hijo + der.; Der-Izq → der. del hijo + izq. En inserción basta **una** rotación (simple o doble).
* **Complejidad**: por convenio del curso "la complejidad de X" = **peor caso**. O(h) en BST. Se escribe T(n) ∈ O(g(n)) (conjunto, no igualdad); si se conoce el orden exacto lo riguroso es Θ.
* Notación de árboles en la app (igual que S7-C1): `20(10,30)`; hijo vacío = nada o `_`, p. ej. `40(,50)`.

## Ruta de aprendizaje (8 niveles × 3 etapas)

Etapa **A** = fundamentos · **B** = aplicación · **C** = dominio / trampas / integración. Cada etapa se desbloquea al superar el umbral (80 % por defecto, configurable) en la anterior.

### Nivel 1 — Fundamentos de recursión (S5-C2 diap. 4-8, 17, 19)
| Concepto | Contenido | Fuente |
|---|---|---|
| `rc_def` | Algoritmo recursivo = caso base + fórmula recursiva (n! = n·(n−1)!, xⁿ par/impar) | S5-C2 d.5 |
| `rc_base` | Caso base; sin él → recursión infinita / `RecursionError` | d.5, 19 |
| `rc_pila` | Pila de llamadas: un marco por llamada, tope, se libera al retornar; espacio de pila | d.6 |
| `rc_traza` | Seguimiento paso a paso (factorial(4)…) | d.6 |
| `rc_overflow` | Desbordamiento de pila; límite ≈1000 en Python; iterar a veces conviene | d.6, 19 |
| `rc_fib` | Fibonacci ingenuo: árbol de llamadas, nodos repetidos, O(2ⁿ) | d.7 |
| `rc_conteo` | Contar llamadas y complejidad (factorial n, potencia log n, fib 2ⁿ) | d.5, 7 |
| `rc_iter` | Recursión vs iteración: cuándo cada una; riesgo de recursión profunda; O(1) memoria | d.6, 17 |
| `rc_impl` | Implementar funciones recursivas (suma, potencia, reverso, etc.) | d.5 |
| `rc_cache` | Error del caché mutable por defecto `def f(n, cache={})` | d.19 |

### Nivel 2 — Complejidad y Big O (S2-C1, S2-C2)
| Concepto | Contenido |
|---|---|
| `cx_medir` | Por qué no medir en segundos; modelo RAM; n = tamaño de entrada |
| `cx_conteo` | T(n): 4n+2, n(n−1)/2; ciclos simples/anidados |
| `cx_dominante` | Solo el término dominante (n²/2 − n/2 ∼ n²) |
| `cx_tasas` | Tabla log n, n, n log n, n², 2ⁿ; 10⁹ op/s |
| `cx_casos` | Mejor / peor / promedio; convenio: peor caso; quicksort |
| `cx_formal` | O, Ω, Θ; exhibir c y n₀; O(n³) correcto pero inútil; O es conjunto |
| `cx_reglas` | Constantes, suma (bloques consecutivos → mayor), producto (anidados), polinomios, base del log |
| `cx_ciclos` | Interno independiente / dependiente de i / fijo; índice que suma vs multiplica/divide; n log n |
| `cx_python` | Costos reales: `x in lista` O(n), set O(1), `insert(0,x)`, `pop(0)`, append amortizado |
| `cx_espacial` | Memoria extra: suma O(1), `unicos_B` O(n), merge sort O(n), quicksort log n; compromiso tiempo-espacio |
| `cx_razon` | Razón de duplicación T(2n)/T(n) |
| `cx_recursivo` | Complejidad de recursivas (fib 2ⁿ, memo n, potencia log n, recorridos O(n), BST O(h)) |
| `cx_constantes` | Lo que O oculta: constantes, n pequeño, Timsort |

### Nivel 3 — Paradigmas algorítmicos (S5-C2 d.8-16, 18-19)
`pd_cinco` (cómo elegir) · `pd_fb` fuerza bruta (pares O(n²), TSP O(n!)) · `pd_bt` backtracking (N-reinas, poda) · `pd_greedy` (óptimo local; cambio canónico; falla con {1,3,4} y 6) · `pd_dyc` divide y vencerás (dividir-vencer-combinar; independientes) · `pd_dp` DP (solapados; top-down vs bottom-up) · `pd_memo` (fib_memo, `lru_cache`, O(2ⁿ)→O(n)) · `pd_coin` (coin change DP O(V·monedas)) · `pd_escalera` (n pasos de 1 o 2 ≈ Fibonacci, versión O(1) memoria) · `pd_clasicos` (TSP, mochila 0/1, N-reinas, cambio) · `pd_np` (NP-difícil, heurísticas) · `pd_errores`.

### Nivel 4 — Fundamentos de árboles (S6-C1 d.5-12, 23)
`ar_def` (grafo dirigido acíclico, una raíz, un padre por nodo, N−1 aristas) · `ar_noarbol` (auto-ciclo, dos padres, ciclo, varias raíces) · `ar_vocab` (raíz, interno, hoja, padre, hijo, hermano, abuelo, ancestro, descendiente) · `ar_profalt` (profundidad vs altura vs nivel) · `ar_subarbol` (estructura recursiva) · `ar_tipos` (binario, lleno, completo, perfecto y sus relaciones) · `ar_perfecto` (2^(h+1)−1; altura ∼ log n; degenerado h = n) · `ar_nodo` (`NodoArbol`: valor, izq, der) · `ar_diagrama` (leer/construir diagramas).

### Nivel 5 — Recorridos (S6-C1 d.13-22)
`tv_pre` · `tv_in` · `tv_post` (orden, implementación recursiva, O(n), caso base `None`) · `tv_bfs` (por niveles, cola) · `tv_usos` (copiar/serializar, ordenar en BST, evaluar/liberar/autograd) · `tv_reconstruir` (preorden+inorden: la raíz es el primero del preorden; un solo recorrido no basta) · `tv_expr` (árbol de expresión `(3+4)*2`: postorden = notación postfija/RPN) · `tv_errores`.
*Complemento (no está en el PDF):* reconstrucción con postorden+inorden; preorden+postorden no es único.

### Nivel 6 — BST (S6-C2 completo)
`bs_prop` (propiedad en todo el subárbol; verificación) · `bs_buscar` (O(h)) · `bs_inorden` (inorden ordenado) · `bs_insertar` (cuelga hoja; sin duplicados) · `bs_eliminar` (0/1/2 hijos; predecesor) · `bs_minmax` · `bs_ordenins` (orden de inserción; [1..5] → h=4; [3,2,4,1,5] → h=2) · `bs_altura` (O(h): log n vs n; tabla de operaciones) · `bs_hash` (BST vs tabla hash) · `bs_errores`.

### Nivel 7 — AVL, balanceo y rojo-negro (S7-C1 completo)
Conceptos de rojo-negro: `rn_def` (reglas, altura negra) · `rn_ins` (3 casos) · `rn_del` (doble negro, 4 casos) · `rn_vs` (AVL frente a rojo-negro).
`av_prob` (BST degenerado; auto-balanceado = O(log n)) · `av_factor` (altura, factor, |f|≤1) · `av_altura` (recalcular por el camino) · `av_rotsimple` (rot. izq./der., O(1), conserva inorden, devuelve nueva raíz local) · `av_ll` `av_rr` `av_lr` `av_rl` (los cuatro casos, conceptos separados para detectar confusiones LR↔RL) · `av_insertar` (BST + rebalanceo; `raiz = insertar(raiz, v)`) · `av_primer` (primer nodo desbalanceado = el más profundo del camino) · `av_eliminar` (sucesor, decisión por el factor del hijo, varias rotaciones) · `av_complejidad` · `av_codigo` (alturas/rotaciones en Python) · `av_compara` (AVL vs BST vs rojo-negro: *complemento*).

### Nivel 8 — Retos integradores
Combinan 1-7: elegir paradigma + complejidad, depurar recursión, BST→AVL, justificar decisiones, análisis completo de un algoritmo (preguntas "mixtas").

## Niveles libres 9-14 (resto de las diapositivas y condicionales)

Siempre desbloqueados: el avance y el umbral de la ruta principal solo cuentan los niveles 1-8. Cada nivel tiene su laboratorio animado y su banco (`js/banco_ext*.js`).

### Nivel 9 — TAD y memoria (S1-C1, S1-C2)
`td_ed` (dato, tipo y estructura) · `td_clasif` (lineales/no lineales, estáticas/dinámicas) · `td_tad` (dominio, operaciones, reglas) · `td_axiomas` (pila, cola, conjunto) · `td_impl` (interfaz con ABC; ConjuntoLista frente a ConjuntoHash) · `td_memoria` (pila y montículo) · `td_estdin` (asignación estática y dinámica; `dir = base + i × tam`) · `td_ref` (referencias, alias, mutabilidad) · `td_copia` (copia superficial y profunda; argumento por defecto mutable) · `td_cache` (list frente a ndarray, localidad de caché).

### Nivel 10 — Arreglos y técnicas (S3-C1)
`ay_def` (tabla de operaciones) · `ay_pref` (prefijos) · `ay_kad` (Kadane) · `ay_dos` (dos punteros) · `ay_ven` (ventana deslizante) · `ay_int` (merge intervals y elección de la técnica).

### Nivel 11 — Pilas y colas (S3-C2, S4-C1)
`pc_pila` (LIFO) · `pc_apps` (aplicaciones y balanceo) · `pc_mon` (pila monótona) · `pc_cola` (FIFO; por qué `list` es mala cola) · `pc_deque` (`collections.deque` y cola de prioridad) · `pc_circ` (cola circular con módulo).

### Nivel 12 — Listas enlazadas (S4-C2)
`le_nodo` (nodo y lista simple) · `le_ins` (insertar; el orden de los enlaces) · `le_del` (puentear un nodo) · `le_vs` (arreglo frente a lista enlazada) · `le_doble` (lista doble) · `le_floyd` (ciclos con la liebre y la tortuga).

### Nivel 13 — Heaps y colas de prioridad (S7-C2)
`hp_def` (árbol completo con orden parcial) · `hp_arr` (índices `2i+1`, `2i+2`, `(i−1)//2`) · `hp_subir` (bubble up) · `hp_bajar` (bubble down) · `hp_build` (heapify en O(n); *complemento*: la demostración) · `hp_pq` (cola de prioridad, tabla de operaciones, `heapq`) · `hp_topk` (top-k, heapsort, usos en IA). El nivel 13 entra en el parcial simulado.

### Nivel 14 — Condicionales (Algoritmos y Programación, AP-S3-C1)
`cd_bool` (expresiones booleanas, tablas de verdad) · `cd_if` (if, if-else, if-elif-else) · `cd_anid` (anidados, aplanado, operador ternario). *Complemento*: las leyes de De Morgan se usan para aplanar condiciones y se marcan como tal.

### Quiz a mi medida
Ruta `#/examen/config/quiz`: el usuario elige temas de la Biblioteca (y por tanto sus conceptos) y la mezcla de modalidades. **Teoría** = selección, V/F, abiertas; **interacción** = clasificar, ordenar, árboles/rotaciones y toda pregunta con figura o animación; **práctica** = el resto (código, salidas, tablas, complejidad). Los talleres de arrastrar nodos quedan fuera (son solo de práctica).

## Modelo de parcial del profesor (analizado del Parcial 1, semanas 1–4)

Se leyó `estructuras_de_datos_p1.pdf` para reconocer **cómo pregunta** el profesor (el contenido del próximo parcial, semanas 5–8, es
recursión, paradigmas, árboles, BST y AVL; no incluye tablas hash ni material de las semanas 1–4). Rasgos del modelo y cómo los
reproduce el entrenador:

| Rasgo del parcial | Qué hace el entrenador |
|---|---|
| 5 preguntas × 1,0 punto, 120 minutos, individual, sin IA ni apuntes | **Parcial simulado**: 5 preguntas (una de cada tipo), 120 min, sin pistas ni teoría |
| «Toda respuesta debe estar justificada» | V/F con **justificación escrita** (`vfj`, marca 30 % + justificación 70 %) y rúbricas visibles |
| P1: V/F con justificación (0,2 c/u; la justificación vale más que la marca) | `pq-vf-*` (afirmaciones con trampa, por tema) |
| P2: tabla de complejidades del peor caso, «amortizado» explícito, justificar las dos filas menos evidentes | `pq-tabla-*` (celdas de complejidad con normalización, avisa si faltó/sobró «amortizado») |
| P3: complejidad de funciones: **variable**, **caso** y **regla** (suma, producto, costo oculto) | `pq-cx-*` (`cplx`): clase + variable + caso + regla + justificación; crecimiento verificado midiendo pasos |
| P4: pila monótona en 4 literales (traza 0,35 · resultado 0,10 · implementación O(n) 0,45 · argumento amortizado 0,10); el O(n²) vale la mitad; caso borde (orden decreciente) | `pq-alg-*`: traza, resultado, código con casos borde y **media nota si es lento**, argumento (memoización, mezcla, backtracking, cambio de monedas, validar BST, inorden con pila, AVL) |
| P5: listas enlazadas (insertar al final, eliminar en 4 casos «sin listas auxiliares», estado de enlaces + nº de comparaciones, por qué no O(1)) | `pq-prog-*` (BST insertar/eliminar con las mismas ideas, recursión, árboles, recorridos, AVL, backtracking) |
| Sin «¿qué imprime?» ni definiciones sueltas | 17 plantillas básicas retiradas (`js/banco_retiro.js`) |

## Formatos de pregunta (17) → motor de corrección

| Formato | Tipo interno | Corrección |
|---|---|---|
| Selección múltiple (1 o varias) | `opcion` | conjunto exacto; explicación por distractor |
| Verdadero/falso (+ justificación) | `vf` | V/F y opción de justificación |
| Pregunta abierta | `abierta` | criterios con sinónimos; checklist visible y **ajustable por el estudiante** |
| Análisis de código / salida | `salida` | valor esperado **calculado ejecutando** el fragmento con el intérprete |
| Trazado manual | `tabla` / `salida` | celdas / secuencia esperadas |
| Implementación desde cero | `codigo` | **pruebas ejecutadas** + reglas estáticas (recursivo, sin bucles, nº de llamadas) |
| Completar código | `completar` | huecos → se ensambla y se ejecutan las pruebas |
| Depuración | `depurar` | pruebas sobre el código corregido |
| Complejidad (T y S + justificación) | `bigo` | selección de T, S y justificación |
| Construcción de árboles | `arbol` | estructura canónica + propiedades (BST/AVL/alturas) |
| Rotaciones AVL | `avl` | nodo, caso, raíz resultante y árbol final |
| Comparación de conceptos | `clasificar` | cada afirmación a su categoría |
| Razonamiento / contraejemplo | `opcion` / `abierta` | selección de contraejemplo o criterios |
| Mixtas | `mixta` | partes de distinto tipo, ponderadas (con `valor` muestra los puntos por literal) |
| V/F con justificación escrita | `vfj` | marca (30 %) + criterios de la justificación (70 %), ajustables por el estudiante |
| Complejidad con variable, caso y regla | `cplx` | clase, variable, caso y regla (selección) + justificación por criterios |
| Taller interactivo de árboles | `taller` | movimientos validados fase por fase (modo estricto) |

## Distribución de la evaluación
* **Teoría**: opcion, vf, abierta, clasificar. **Análisis y problemas**: salida, tabla, bigo, árboles, AVL. **Implementación**: codigo, completar, depurar.
* El examen reparte por categoría (configurable) y por tema, para no concentrarse en lo fácil de autocorregir.
