/* temario.js — niveles, etapas y conceptos (teoría breve, ejemplo resuelto y fuente) */
(function (global) {
  'use strict';
  const ET = global.ET = global.ET || {};

  const fuentes = {
    'S2-C1': 'Clase1_AnalisisAsintotico (Semana 2, Clase 1)',
    'S2-C2': 'Clase2_NotacionBigO (Semana 2, Clase 2)',
    'S5-C2': 'Clase2_RecursionParadigmas (Semana 5, Clase 2)',
    'S6-C1': 'Clase1_ArbolesRecorridos (Semana 6, Clase 1)',
    'S6-C2': 'Clase2_BST (Semana 6, Clase 2)',
    'S7-C1': 'Clase1_BalanceoAVL (Semana 7, Clase 1: AVL y rojo-negro, 49 diapositivas)'
  };

  const niveles = [
    { id: 1, nombre: 'Fundamentos de recursión', icono: '↻', color: '#6366f1', fuente: 'S5-C2', resumen: 'Caso base, fórmula recursiva, pila de llamadas, trazas, errores típicos y número de llamadas.' },
    { id: 2, nombre: 'Complejidad y Big O', icono: '∿', color: '#0ea5e9', fuente: 'S2-C1 · S2-C2', resumen: 'Conteo de operaciones, O/Ω/Θ, reglas de cálculo, ciclos, costos de Python y complejidad espacial.' },
    { id: 3, nombre: 'Paradigmas algorítmicos', icono: '◇', color: '#10b981', fuente: 'S5-C2', resumen: 'Fuerza bruta, backtracking, greedy, divide y vencerás, programación dinámica y memoización.' },
    { id: 4, nombre: 'Fundamentos de árboles', icono: '⌥', color: '#84cc16', fuente: 'S6-C1', resumen: 'Definición, vocabulario, profundidad y altura, tipos de árboles binarios, nodos en Python.' },
    { id: 5, nombre: 'Recorridos de árboles', icono: '⇣', color: '#f59e0b', fuente: 'S6-C1', resumen: 'Preorden, inorden, postorden, por niveles, reconstrucción y árboles de expresión.' },
    { id: 6, nombre: 'Árboles BST', icono: '⌕', color: '#ef4444', fuente: 'S6-C2', resumen: 'Propiedad de orden, búsqueda, inserción, eliminación (0/1/2 hijos), O(h) y degeneración.' },
    { id: 7, nombre: 'Árboles AVL y balanceo', icono: '⚖', color: '#d946ef', fuente: 'S7-C1', resumen: 'Factor de balance, rotaciones, los cuatro casos, inserción y eliminación AVL, y árboles rojo-negro (reglas, inserción y eliminación).' },
    { id: 8, nombre: 'Retos integradores', icono: '★', color: '#8b5cf6', fuente: 'Todos', resumen: 'Problemas que combinan recursión, complejidad, paradigmas, BST y AVL.' }
  ];

  const etapas = {
    A: { nombre: 'Fundamentos', desc: 'Preguntas básicas y ejercicios directos.' },
    B: { nombre: 'Aplicación', desc: 'Implementación, análisis de código y problemas de dificultad media.' },
    C: { nombre: 'Dominio', desc: 'Problemas complejos, trampas conceptuales e integración.' }
  };

  const K = {};   // conceptos
  const add = (id, nivel, nombre, f, t, e, comp) => { K[id] = { id, nivel, nombre, f, t, e, comp: !!comp }; };

  /* ===================== NIVEL 1 ===================== */
  add('rc_def', 1, 'Definición de recursión', 'S5-C2 · diap. 5',
    `Un algoritmo **recursivo** se llama a sí mismo. Tiene siempre dos componentes:
- **Caso base**: entradas cuya respuesta se conoce directamente; detiene la recursión.
- **Fórmula recursiva**: expresa la respuesta actual en términos de subproblemas **más pequeños**.

Ejemplo de clase: n! = n · (n−1)! con 0! = 1. Para calcular xⁿ sin \`**\`: x⁰ = 1 (base); xⁿ = xⁿ/² · xⁿ/² si n es par; xⁿ = x · x⁽ⁿ⁻¹⁾/² · x⁽ⁿ⁻¹⁾/² si n es impar.`,
    `Suma de 1 a n: base \`suma(0) = 0\`; fórmula \`suma(n) = n + suma(n-1)\`.

\`suma(3) = 3 + suma(2) = 3 + (2 + suma(1)) = 3 + (2 + (1 + 0)) = 6\``);
  add('rc_base', 1, 'Caso base', 'S5-C2 · diap. 5 y 19',
    `El **caso base** es lo que hace que la recursión termine.
- Debe existir al menos uno.
- Cada llamada recursiva debe **acercarse** al caso base (argumento más pequeño).
- Se comprueba **antes** de hacer la llamada recursiva.

Sin caso base la recursión nunca termina: *stack overflow* (\`RecursionError\` en Python).`,
    `\`def cuenta(n): print(n); cuenta(n-1)\` nunca se detiene (no hay caso base).

Con \`if n == 0: return\` al inicio, \`cuenta(3)\` imprime 3, 2, 1 y termina.`);
  add('rc_pila', 1, 'Pila de llamadas', 'S5-C2 · diap. 6',
    `Cada llamada **apila un marco** (parámetros, variables locales, punto de retorno). El espacio usado por las llamadas activas es el **espacio de pila**; se libera al retornar. En \`factorial(4)\` se apilan factorial(4), (3), (2), (1); el **tope** es la llamada más reciente. Después se desapila devolviendo valores. Con profundidad n, la pila usa **O(n)** de espacio.`,
    `\`factorial(3)\`: la pila (de abajo hacia arriba) es \`f(3)\`, \`f(2)\`, \`f(1)\`. \`f(1)\` devuelve 1 y se desapila; \`f(2)\` calcula 2·1 = 2 y se desapila; \`f(3)\` calcula 3·2 = 6.`);
  add('rc_traza', 1, 'Seguimiento paso a paso', 'S5-C2 · diap. 6',
    `Para **trazar** una función recursiva:
1. Escribe cada llamada con su argumento hasta el caso base (fase de *ida*, se apila).
2. Al llegar al caso base empieza el *regreso*: cada llamada usa el valor que devolvió la siguiente.
3. Anota qué se imprime **antes** y qué **después** de la llamada recursiva: el orden cambia.`,
    `\`\`\`
def f(n):
    if n == 0: return
    print(n)
    f(n - 1)
    print(n)
\`\`\`
\`f(2)\` imprime 2, llama a f(1) (imprime 1, llama a f(0) que no hace nada, imprime 1) y al volver imprime 2: la salida es **2 1 1 2**.`);
  add('rc_overflow', 1, 'Desbordamiento de pila', 'S5-C2 · diap. 6 y 19',
    `Si la recursión es demasiado profunda (o no termina) se agota la pila y Python lanza \`RecursionError\`. El límite por defecto ronda **1000** llamadas anidadas. La versión iterativa evita ese riesgo, aunque usa memoria del montículo (heap), que suele ser mayor. En árboles muy profundos a veces conviene un DFS iterativo con pila.`,
    `\`def suma(n): return n if n == 0 else n + suma(n-1)\` es correcta, pero \`suma(5000)\` falla por **profundidad** (más de ~1000 marcos), aunque la lógica esté bien.`);
  add('rc_fib', 1, 'Fibonacci recursivo ingenuo', 'S5-C2 · diap. 7',
    `\`fib(n) = fib(n-1) + fib(n-2)\`, con fib(0)=0 y fib(1)=1. El árbol de llamadas **recalcula lo mismo** una y otra vez (nodos repetidos): costo **O(2ⁿ)**. Número de llamadas de \`fib(n)\` para n = 0, 1, 2, 3, 4, 5, 6, 7: 1, 1, 3, 5, 9, 15, 25, 41. Cada llamada hace trabajo O(1).`,
    `\`fib(4)\` llama a fib(3) y fib(2); fib(3) llama a fib(2) y fib(1)… Así \`fib(2)\` se calcula **2 veces**. En total son **9 llamadas**.`);
  add('rc_conteo', 1, 'Contar llamadas y complejidad', 'S5-C2 · diap. 5 y 7 (análisis de la potencia: complemento)',
    `Contar llamadas permite hallar la complejidad.
- \`factorial(n)\`: n llamadas → O(n) en tiempo y O(n) en pila.
- \`fib(n)\` ingenuo: del orden de 2ⁿ llamadas.
- Si cada llamada **divide el problema a la mitad** y hace **una sola** llamada recursiva (p. ej. \`m = potencia(x, n//2)\`), son ~log₂ n llamadas.

Ojo: si llamas **dos veces** a la recursión sobre la mitad, pierdes la ventaja (≈ n llamadas).`,
    `\`def mitad(n): return 0 if n <= 1 else 1 + mitad(n // 2)\`

Con n = 16 las llamadas son para 16, 8, 4, 2, 1: **5 llamadas** (⌊log₂ 16⌋ + 1).`, true);
  add('rc_iter', 1, 'Recursión vs. iteración', 'S5-C2 · diap. 6 y 17',
    `La recursión es más **elegante** y natural para estructuras recursivas (árboles). La iteración evita el **riesgo de recursión profunda**. Para Fibonacci: recursiva ingenua O(2ⁿ); con memoización O(n); iterativa *bottom-up* O(n) y **O(1) de memoria** si solo guarda los dos últimos valores.`,
    `\`\`\`
def fib_iter(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\``);
  add('rc_impl', 1, 'Escribir funciones recursivas', 'S5-C2 · diap. 5-6',
    `Plantilla para escribir una función recursiva:
1. Decide qué devuelve para el caso más pequeño (**base**).
2. Supón que la función ya funciona para un problema más pequeño.
3. Escribe cómo construir la respuesta a partir de esa llamada.

Esquema: \`if base: return valor\` y luego \`return combinar(f(más_pequeño))\`. Cuidado: \`v[1:]\` crea una copia de la lista.`,
    `Suma de una lista: base, lista vacía → 0. Recursivo: \`v[0] + suma(v[1:])\`.`);
  add('rc_cache', 1, 'Error del caché mutable por defecto', 'S5-C2 · diap. 8 y 19',
    `\`def f(n, cache={})\` es un error clásico: el valor por defecto mutable se crea **una sola vez** al definir la función y se **comparte entre llamadas**. Patrón correcto: \`def f(n, cache=None): if cache is None: cache = {}\`.`,
    `\`def g(x, acc=[]): acc.append(x); return acc\` → \`g(1)\` devuelve [1] y después \`g(2)\` devuelve [1, 2] (¡no [2]!).`);

  /* ===================== NIVEL 2 ===================== */
  add('cx_medir', 2, 'Por qué contar operaciones', 'S2-C1 · diap. 5-7',
    `Medir en segundos mezcla el algoritmo con la máquina (procesador, lenguaje, carga, caché). Por eso se cuentan **operaciones elementales** en función del **tamaño de la entrada n** y se estudia su **tasa de crecimiento**: es el *análisis asintótico*. Modelo RAM: operaciones aritméticas, comparaciones, asignaciones simples, acceso \`v[i]\`, retorno y llamada cuestan 1 unidad. Definir qué es n (elementos, bits, nodos…) es parte del análisis.`,
    `\`suma_iterativa(n)\` y \`suma_formula(n) = n*(n+1)//2\` calculan lo mismo, pero la segunda cuesta una cantidad constante sin importar n.`);
  add('cx_conteo', 2, 'Conteo de operaciones T(n)', 'S2-C1 · diap. 8-11',
    `Sin ciclos, T(n) es constante. Ciclo simple de n vueltas con 4 operaciones por vuelta más 2 de inicio/retorno: **T(n) = 4n + 2** (lineal). Ciclos anidados con interno \`range(i+1, n)\`: (n−1)+(n−2)+…+1 = **n(n−1)/2** (cuadrático). Interno independiente de i: n·n = n².`,
    `\`for i in range(n): for j in range(i): x += 1\` ejecuta la línea 0+1+2+…+(n−1) = n(n−1)/2 veces. Para n = 5: **10** veces.`);
  add('cx_dominante', 2, 'Término dominante', 'S2-C1 · diap. 12',
    `Al crecer n solo importa el **término dominante**: constantes y términos de menor grado se desvanecen. En T(n) = n²/2 − n/2 el término n/2 pesa 9,1 % con n = 10, 1 % con n = 100 y 0,0001 % con n = 10⁶. Por eso decimos que es **cuadrático**: T(n) ∼ n².`,
    `T(n) = 3n² + 10n + 7: para n grande domina 3n². La clase es n².`);
  add('cx_tasas', 2, 'Tasas de crecimiento', 'S2-C1 · diap. 13; S2-C2 · diap. 15-16',
    `Las tasas de crecimiento separan lo viable de lo inviable más que cualquier hardware. Con n = 10⁶ a 10⁹ operaciones/s: log₂ n ≈ 20; n → 0,001 s; n log₂ n ≈ 2×10⁷ → 0,02 s; n² = 10¹² → 10³ s ≈ 17 minutos (las diapositivas dicen «≈ 11 días», pero 11 días son ≈ 10¹⁵ operaciones: la cuenta correcta es 10¹² ÷ 10⁹ = 10³ s); 2ⁿ es inalcanzable. Jerarquía: **1 < log n < n < n log n < n² < 2ⁿ**. Hasta n log n se procesan millones de datos en segundos; desde n² el límite ronda las decenas de miles; desde 2ⁿ, unas pocas decenas.`,
    `Con 10⁹ op/s y n = 10⁵: n² = 10¹⁰ operaciones → 10 s; n log n ≈ 1,7×10⁶ → ≈ 0,0017 s.`);
  add('cx_casos', 2, 'Mejor, peor y caso promedio', 'S2-C1 · diap. 14-17',
    `**Mejor caso**: entrada que minimiza el trabajo. **Peor caso**: la que lo maximiza. **Promedio**: valor esperado sobre una distribución. En búsqueda secuencial: mejor 1 comparación, peor n, promedio (n+1)/2.

**Convenio del curso:** "la complejidad de X" sin aclarar = **peor caso** (es la única garantía). El mejor caso casi nunca sirve; el promedio exige suponer una distribución. Quicksort con pivote \`v[0]\`: n log n en promedio, pero **n²** con datos ya ordenados.`,
    `Detección de fraude (< 50 ms siempre): se elige el algoritmo con mejor **peor caso**. En un proceso nocturno por lotes podría convenir el de mejor promedio.`);
  add('cx_formal', 2, 'Notación O, Ω y Θ', 'S2-C2 · diap. 5-9 y 24',
    `- **O** (cota superior): T(n) ∈ O(g(n)) si existen c > 0 y n₀ tales que 0 ≤ T(n) ≤ c·g(n) para todo n ≥ n₀.
- **Ω** (cota inferior): T(n) ≥ c·g(n) para n ≥ n₀.
- **Θ** (orden exacto): T ∈ O(g) y T ∈ Ω(g).

Demostrar una pertenencia = exhibir c y n₀ válidos. Ejemplo de clase: 3n² + 10n + 7 ∈ O(n²) con c = 20, n₀ = 1. Decir O(n³) para algo cuadrático es **correcto pero inútil**: se usa la cota más ajustada. O es un **conjunto**: lo riguroso es T(n) ∈ O(n), no "T(n) = O(n)"; si se conoce el orden exacto, lo riguroso es Θ.`,
    `Demostrar 7n + 200 ∈ O(n): para n ≥ 1, 200 ≤ 200n, luego 7n + 200 ≤ 207n. Basta **c = 207 y n₀ = 1** (también sirve c = 8 con n₀ = 200).`);
  add('cx_reglas', 2, 'Reglas de cálculo', 'S2-C2 · diap. 11-12',
    `- **Constantes**: O(c·f) = O(f).
- **Suma** (bloques consecutivos): O(f) + O(g) = O(máx(f, g)).
- **Producto** (bloques anidados): O(f)·O(g) = O(f·g).
- **Polinomios**: solo el grado mayor.
- **Logaritmos**: la base no importa (logₐ n = log_b n / log_b a, y 1/log_b a es una constante).`,
    `Un \`for\` de n, luego dos \`for\` anidados de n, luego una asignación: O(n) + O(n²) + O(1) = **O(n²)**. Optimizar el primer bloque no mejora nada.`);
  add('cx_ciclos', 2, 'Análisis de ciclos', 'S2-C2 · diap. 13-15; S2-C1 · diap. 23',
    `- Interno **independiente** de i: n·n = O(n²).
- Interno **dependiente** (\`range(i)\`): n(n−1)/2 = O(n²) (difiere solo en un factor 2).
- Interno de tamaño **fijo** (\`range(100)\`): 100n = O(n).
- Índice que **suma** → lineal. Índice que **multiplica o divide** → logarítmico: \`while i > 1: i //= 2\` hace log₂ n pasos; \`while j < n: j *= 2\` hace ⌈log₂ n⌉.
- Ciclo lineal por ciclo logarítmico → **n log n**. Tres ciclos anidados dependientes (i, j<i, k<j) → O(n³).`,
    `\`for i in range(n): j = 1; while j < n: j *= 2\` → n · log₂ n pasos → O(n log n).`);
  add('cx_python', 2, 'Costos reales de Python', 'S2-C1 · diap. 7 y 18; S2-C2 · diap. 17',
    `En Python no todo lo que parece elemental lo es:
- \`x in lista\`: **O(n)**; en \`set\`/\`dict\`: **O(1)**.
- \`v[i]\`: O(1). \`append\`: O(1) amortizado. \`pop()\` final: O(1).
- \`insert(0, x)\` y \`pop(0)\`: **O(n)** (desplazan todo).
- \`sort()\`: O(n log n). \`min/max\`: O(n).
- \`s1 + s2\` copia ambas cadenas.

Cambiar \`lista.pop(0)\` por \`deque.popleft()\` convierte O(n²) en O(n).`,
    `\`unicos_A\` usa \`if x not in salida\` (lista) → O(n²). \`unicos_B\` usa un \`set\` de vistos → O(n) en tiempo y O(n) de memoria extra.`);
  add('cx_espacial', 2, 'Complejidad espacial', 'S2-C1 · diap. 21; S5-C2 · diap. 17',
    `**Complejidad espacial**: memoria adicional que necesita el algoritmo más allá de la entrada, en función de n. Suma de un arreglo: O(1). \`unicos_B\`: O(n) (el conjunto). Merge sort: O(n) (arreglo auxiliar). Quicksort en el sitio: O(log n) (pila de llamadas). Una recursión de profundidad d usa O(d) de pila.

**Compromiso tiempo–espacio:** casi toda optimización de tiempo se paga con memoria, y viceversa.`,
    `Fibonacci con memoización: O(n) tiempo y O(n) espacio (caché + pila). Bottom-up con dos variables: O(n) tiempo y **O(1)** espacio.`);
  add('cx_razon', 2, 'Razón de duplicación', 'S2-C1 · diap. 19-20; S2-C2 · diap. 19',
    `Mide T(n) y T(2n) y calcula T(2n)/T(n):
- ≈ 1 → constante
- ≈ 1+ε → logarítmico
- ≈ 2 → lineal
- ≈ 2,1–2,3 → n log n
- ≈ 4 → cuadrático
- ≈ 8 → cúbico

Si T(2n)/T(n) = 2ᵏ, el exponente estimado es k = log₂(razón).`,
    `Tiempos 0,043 s (n = 2000) y 0,172 s (n = 4000): razón ≈ 4 → **cuadrático**.`);
  add('cx_recursivo', 2, 'Complejidad de funciones recursivas', 'S5-C2 · diap. 7-8; S6-C1 · diap. 17 (recurrencias: complemento)',
    `Complejidad de una recursiva = (número de llamadas) × (trabajo por llamada).
- \`factorial\`: n llamadas × O(1) = O(n).
- \`fib\` ingenuo: O(2ⁿ). \`fib\` con memoización: n+1 cálculos × O(1) = O(n).
- Recorridos de árboles: cada nodo se visita una vez → O(n).
- Operaciones de un BST: O(h).

*Complemento (recurrencias típicas):* T(n) = T(n−1) + O(1) → O(n); T(n) = T(n/2) + O(1) → O(log n); T(n) = 2T(n/2) + O(n) → O(n log n); T(n) = 2T(n−1) → O(2ⁿ).`,
    `Búsqueda binaria: una llamada sobre la mitad con trabajo O(1) → O(log n).`, true);
  add('cx_constantes', 2, 'Lo que O oculta', 'S2-C2 · diap. 20',
    `La notación O oculta **constantes** y **localidad de caché**. Para n pequeño la constante manda: un algoritmo asintóticamente peor puede ganar en la práctica. Ejemplos de clase: insertion sort gana con n < 50; el \`sort()\` de Python (Timsort) es O(n log n) pero cambia a insertion sort en subarreglos de menos de 64 elementos.`,
    `Un algoritmo O(n) con constante 1000 puede ser más lento que uno O(n log n) con constante 2 en el rango de n que se usa en la práctica.`);

  /* ===================== NIVEL 3 ===================== */
  add('pd_cinco', 3, 'Los cinco paradigmas y cómo elegir', 'S5-C2 · diap. 9 y 15',
    `**Fuerza bruta** (prueba todo) · **Backtracking** (poda temprano) · **Greedy** (óptimo local) · **Divide y vencerás** (subproblemas independientes) · **Programación dinámica** (subproblemas solapados).

Cómo elegir:
- ¿Subproblemas **independientes**? → divide y vencerás (merge sort, quicksort).
- ¿Subproblemas **solapados**? → programación dinámica (Fibonacci, mochila).
- ¿Las decisiones locales dan el óptimo? → greedy. Si no, backtracking o DP.`,
    `Ordenar partiendo por la mitad → divide y vencerás. Formas de subir una escalera de n pasos (1 o 2) → DP. Colocar 8 reinas sin que se ataquen → backtracking.`);
  add('pd_fb', 3, 'Fuerza bruta', 'S5-C2 · diap. 10 y 16',
    `**Fuerza bruta**: enumera todas las soluciones candidatas y verifica cuáles cumplen. Simple pero costoso. Ejemplo: hallar dos elementos que sumen S probando todos los pares → O(n²). Agente viajero (TSP) por fuerza bruta → O(n!).`,
    `\`for i in range(n): for j in range(i+1, n): if v[i] + v[j] == S\` revisa n(n−1)/2 pares.`);
  add('pd_bt', 3, 'Backtracking', 'S5-C2 · diap. 10; S6-C1 · diap. 20',
    `**Backtracking** es fuerza bruta que **poda** las ramas inválidas apenas se detectan. Ejemplo: N-reinas: coloca una reina por fila y abandona la rama en cuanto dos se atacan. Explora mucho menos que la fuerza bruta pura. También explora árboles de juegos con poda.`,
    `En 4-reinas, si la reina de la fila 1 ataca a la de la fila 0, no se colocan más reinas por esa rama: se retrocede y se prueba otra columna.`);
  add('pd_greedy', 3, 'Algoritmos voraces (greedy)', 'S5-C2 · diap. 11 y 19',
    `**Greedy**: en cada paso elige lo que parece mejor ahora, sin reconsiderar. Rápido, pero **no siempre da el óptimo global**.
- Funciona al dar cambio con un sistema de monedas *canónico* (tomar siempre la mayor que quepa).
- Falla con monedas {1, 3, 4} y objetivo 6: greedy da 4+1+1 = 3 monedas, pero 3+3 = 2 es mejor.

Solo funciona en problemas con subestructura greedy.`,
    `Monedas {1, 5, 10, 25}, objetivo 63: greedy da 25+25+10+1+1+1 = 6 monedas (óptimo en ese sistema).`);
  add('pd_dyc', 3, 'Divide y vencerás', 'S5-C2 · diap. 12',
    `Tres pasos: (1) **Dividir** el problema en subproblemas **independientes**; (2) **Vencer**: resolver cada subproblema (recursivamente); (3) **Combinar** las soluciones parciales. Ejemplos: merge sort, quicksort, búsqueda binaria. A diferencia de la DP, aquí los subproblemas **no se repiten**.`,
    `Merge sort: dividir el arreglo en dos mitades, ordenar cada mitad, mezclar (combinar).`);
  add('pd_dp', 3, 'Programación dinámica', 'S5-C2 · diap. 13',
    `Se aplica cuando los subproblemas **se solapan**: cada uno se resuelve **una vez** y se reutiliza. Dos enfoques:
- **Top-down (memoización)**: recursión natural + caché.
- **Bottom-up (tabulación)**: iterativo; se calcula F₀, F₁, F₂, … en orden guardando en una tabla hasta Fₙ.`,
    `\`\`\`
tabla = [0, 1] + [0] * (n - 1)
for i in range(2, n + 1):
    tabla[i] = tabla[i-1] + tabla[i-2]
\`\`\``);
  add('pd_memo', 3, 'Memoización', 'S5-C2 · diap. 8',
    `**Memoización**: guardar el resultado de cada subproblema la primera vez y devolverlo desde la caché cuando se vuelva a pedir. Convierte O(2ⁿ) en **O(n)** en Fibonacci. Se implementa con un diccionario (\`if n in cache: return cache[n]\`) o con \`@lru_cache(maxsize=None)\`. Es el primer paso de la programación dinámica.`,
    `En \`fib_memo(5)\`, \`fib(2)\` se calcula una sola vez; las demás peticiones salen de la caché en O(1).`);
  add('pd_coin', 3, 'Cambio de monedas (DP)', 'S5-C2 · diap. 14',
    `Mínimo de monedas para formar V con DP *bottom-up*: \`dp[v]\` = mínimo de monedas para v. \`dp[0] = 0\`; para cada v y cada moneda c ≤ v: \`dp[v] = min(dp[v], dp[v-c] + 1)\`. Costo **O(V × monedas)**. Con {1, 3, 4} y V = 6 da 2 (3+3), donde greedy da 3.`,
    `Monedas {1, 3, 4}, V = 6: dp = [0, 1, 2, 1, 1, 2, 2]. dp[6] = min(dp[5]+1, dp[3]+1, dp[2]+1) = min(3, 2, 3) = **2**.`);
  add('pd_escalera', 3, 'Escalera (pasos de 1 o 2)', 'S5-C2 · diap. 17-18',
    `Formas de subir n escalones con pasos de 1 o 2: \`formas(n) = formas(n-1) + formas(n-2)\` con formas(0) = formas(1) = 1. Es la secuencia de **Fibonacci**. Versiones: recursiva ingenua O(2ⁿ); con memoización O(n); *bottom-up* guardando solo los dos últimos valores: O(n) tiempo y **O(1)** memoria.`,
    `formas(1)=1, formas(2)=2, formas(3)=3, formas(4)=5, formas(5)=8.`);
  add('pd_clasicos', 3, 'Problemas clásicos', 'S5-C2 · diap. 16',
    `- **Agente viajero (TSP)**: ruta más corta que visita todas las ciudades → fuerza bruta O(n!) o heurísticas.
- **Mochila 0/1**: maximizar valor sin exceder peso → programación dinámica.
- **N-reinas**: colocar N reinas sin ataques → backtracking.
- **Cambio de moneda**: mínimas monedas para un valor → programación dinámica.`,
    `Mochila 0/1 → DP; N-reinas → backtracking; TSP exacto → fuerza bruta O(n!), inviable para n grande.`);
  add('pd_np', 3, 'NP-difíciles y heurísticas', 'S5-C2 · diap. 16 y 21',
    `El TSP y la mochila son **NP-difíciles**: la fuerza bruta es O(n!) o O(2ⁿ), inviable. En la industria se usan **heurísticas y metaheurísticas** (recocido simulado, enjambre) que sacrifican optimalidad por tiempo. Es el compromiso central de la optimización en IA: optimalidad vs. tiempo.`,
    `Para 20 ciudades hay 20! ≈ 2,4×10¹⁸ rutas: se usa una heurística en vez de fuerza bruta.`);
  add('pd_errores', 3, 'Errores frecuentes en paradigmas', 'S5-C2 · diap. 19',
    `Olvidar el caso base · usar recursión ingenua donde hay **subproblemas solapados** · **confundir divide y vencerás (independientes) con DP (solapados)** · asumir que greedy siempre da el óptimo · poner un caché mutable por defecto · recursión muy profunda en Python.`,
    `Merge sort no necesita memoización (sus mitades no se repiten). Fibonacci sí (sus subproblemas se solapan).`);

  /* ===================== NIVEL 4 ===================== */
  add('ar_def', 4, 'Definición de árbol', 'S6-C1 · diap. 5',
    `Un **árbol** es un grafo dirigido acíclico donde: hay un nodo sin arista entrante (la **raíz**); cada otro nodo tiene **exactamente un padre**; y ningún nodo se apunta a sí mismo. Un árbol con N nodos tiene exactamente **N − 1 aristas**.`,
    `Un árbol de 7 nodos tiene 6 aristas. Un árbol de 1 solo nodo tiene 0.`);
  add('ar_noarbol', 4, 'Lo que NO es un árbol', 'S6-C1 · diap. 6',
    `No son árboles: un **auto-ciclo** (un nodo que se apunta a sí mismo), un nodo con **dos padres**, un **ciclo**, o **varias raíces** (otro nodo sin padre además de la raíz).`,
    `Si A→B, A→C y D→C, entonces C tiene dos padres (y D es una segunda raíz): no es un árbol.`);
  add('ar_vocab', 4, 'Vocabulario de familia', 'S6-C1 · diap. 5, 7 y 8',
    `**Raíz** (sin padre) · **nodo interno** (tiene hijos) · **hoja** (sin hijos) · **padre** (predecesor, a lo sumo uno) · **hijo** (sucesor: 0, 1 o varios) · **hermano** (mismo padre) · **abuelo** (padre del padre) · **ancestro** (en el camino hacia la raíz) · **descendiente** (hacia las hojas). Un nodo con todos sus descendientes forma un **subárbol**.`,
    `En \`A(B(D,E),C)\`: raíz A; internos A y B; hojas D, E y C; D y E son hermanos; A es abuelo de D.`);
  add('ar_profalt', 4, 'Profundidad, nivel y altura', 'S6-C1 · diap. 7 y 9; S7-C1 · diap. 7',
    `- **Profundidad(n)**: aristas de la raíz a n (la raíz tiene profundidad 0). Es su **nivel**.
- **Altura(n)**: aristas de n a la hoja descendiente más lejana (las hojas tienen altura 0).
- La **altura del árbol** es la altura de su raíz.

Convención del curso: se cuentan **aristas**. Algunos textos cuentan niveles desde 1 y dirían altura = 4 donde aquí es 3. (En AVL, además, el árbol vacío tiene altura −1.)`,
    `Camino A–B–C–D (4 nodos en fila): prof(D) = 3, alt(A) = 3, alt(D) = 0, altura del árbol = 3.`);
  add('ar_subarbol', 4, 'Estructura recursiva', 'S6-C1 · diap. 8',
    `Un árbol es una estructura **recursiva**: una raíz con un subárbol izquierdo y uno derecho, que a su vez son árboles. Incluso una hoja es un subárbol. Esta recursión hace naturales los recorridos y casi todos los algoritmos: el caso base es \`nodo is None\`.`,
    `altura(n) = −1 si n es None; en otro caso 1 + máx(altura(n.izq), altura(n.der)).`);
  add('ar_tipos', 4, 'Árboles lleno, completo y perfecto', 'S6-C1 · diap. 10-11 y 23',
    `Árbol **binario**: cada nodo tiene a lo sumo 2 hijos (izq. y der.).
- **Lleno (full)**: cada nodo tiene 0 o 2 hijos (nunca 1).
- **Completo**: todos los niveles llenos salvo quizá el último, que se cubre de izquierda a derecha.
- **Perfecto**: todos los internos con 2 hijos y todas las hojas al mismo nivel.

Todo perfecto es también completo y lleno. Un lleno puede no ser completo; un completo puede no ser lleno.`,
    `\`A(B,C(D,E))\` es **lleno** (0 o 2 hijos en cada nodo), pero no es completo ni perfecto: las hojas están en niveles distintos y el último nivel no se llena de izquierda a derecha.`);
  add('ar_perfecto', 4, 'Árbol perfecto y altura ∼ log n', 'S6-C1 · diap. 10 y 23',
    `Un árbol **perfecto de altura h** tiene exactamente **2^(h+1) − 1** nodos (h = 3 → 15). Un árbol balanceado guarda n elementos con altura ∼ log₂ n: es la base de la eficiencia de los árboles de búsqueda y de los heaps. Un árbol **degenerado** (en forma de lista) tiene altura n−1: no log n.`,
    `Perfecto de altura 2: 1 + 2 + 4 = 7 nodos = 2³ − 1.`);
  add('ar_nodo', 4, 'Nodos en Python', 'S6-C1 · diap. 12',
    `En Python un nodo guarda su valor y referencias a sus hijos; \`None\` representa ausencia de hijo. Un árbol se construye enlazando nodos.

\`\`\`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None   # subárbol izquierdo
        self.der = None   # subárbol derecho
\`\`\``,
    `\`\`\`
raiz = NodoArbol(1)
raiz.izq = NodoArbol(2)
raiz.der = NodoArbol(3)
raiz.izq.izq = NodoArbol(4)
raiz.izq.der = NodoArbol(5)
\`\`\`
Representa \`1(2(4,5),3)\`.`);
  add('ar_diagrama', 4, 'Leer y construir diagramas', 'S6-C1 · diap. 5-11; S7-C1 · diap. 11 y 15',
    `Para interpretar un diagrama identifica la raíz (arriba, sin padre), anota para cada nodo su hijo izquierdo y derecho, y cuenta niveles y aristas. En este entrenador un árbol se escribe **\`valor(izq,der)\`**: \`A(B(D,E),C)\`. Un hijo vacío se deja en blanco o se escribe \`_\`: \`A(B(,E),C)\`.`,
    `\`20(10,30)\` es la raíz 20 con hijo izquierdo 10 y derecho 30. \`30(20(10,25),40(,50))\` es el AVL final del ejemplo de clase.`);

  /* ===================== NIVEL 5 ===================== */
  add('tv_pre', 5, 'Recorrido en preorden', 'S6-C1 · diap. 13-14 y 17',
    `**Preorden: raíz → izq → der.** Visita la raíz primero, luego todo el subárbol izquierdo y después el derecho. Útil para copiar/serializar un árbol y procesar el padre antes que los hijos (exportar un menú anidado).

\`\`\`
def preorden(nodo, salida):
    if nodo is None: return
    salida.append(nodo.valor)      # 1) raíz
    preorden(nodo.izq, salida)     # 2) izquierda
    preorden(nodo.der, salida)     # 3) derecha
\`\`\`
Cada nodo se visita una vez: **O(n)**. La recursión usa la pila de llamadas.`,
    `\`A(B(D,E),C)\` en preorden: **A B D E C**.`);
  add('tv_in', 5, 'Recorrido en inorden', 'S6-C1 · diap. 13, 15 y 17',
    `**Inorden: izq → raíz → der.** Visita primero el subárbol izquierdo, luego la raíz y por último el derecho. En un **BST** entrega los valores en orden ascendente. Es O(n).`,
    `\`A(B(D,E),C)\` en inorden: **D B E A C**.`);
  add('tv_post', 5, 'Recorrido en postorden', 'S6-C1 · diap. 13, 16 y 17',
    `**Postorden: izq → der → raíz.** Se visitan ambos subárboles antes que la raíz. Útil para evaluar expresiones, liberar memoria, calcular tamaños o la retropropagación (autograd). Es O(n).`,
    `\`A(B(D,E),C)\` en postorden: **D E B C A**.`);
  add('tv_bfs', 5, 'Recorrido por niveles (BFS)', 'S6-C1 · diap. 18',
    `El recorrido por **anchura (nivel por nivel)** usa una **cola** en vez de la pila de llamadas del DFS. Visita la raíz, luego sus hijos, luego los nietos… Los tres recorridos en profundidad (pre/in/post) son variantes de **DFS**; cambia cuándo se visita la raíz respecto a sus subárboles.`,
    `\`A(B(D,E),C)\` por niveles: **A B C D E**.

\`\`\`
from collections import deque
cola = deque([raiz])
while cola:
    n = cola.popleft()
    print(n.valor)
    if n.izq: cola.append(n.izq)
    if n.der: cola.append(n.der)
\`\`\``);
  add('tv_usos', 5, 'Aplicaciones de los recorridos', 'S6-C1 · diap. 18 y 20-21',
    `- **Preorden**: copiar/serializar; el padre antes que los hijos; imprimir la arquitectura de arriba hacia abajo; sistemas de archivos y JSON.
- **Inorden**: en un BST entrega los datos ordenados.
- **Postorden**: hijos antes que el padre: liberar memoria, evaluar expresiones, calcular tamaños, **retropropagación (autograd)**: el gradiente de una operación necesita los de las operaciones que dependen de ella.`,
    `Para calcular el tamaño de una carpeta (suma de sus archivos y subcarpetas) conviene **postorden**: primero se conocen los tamaños de los hijos.`);
  add('tv_reconstruir', 5, 'Reconstruir un árbol', 'S6-C1 · diap. 19 y 23 (postorden+inorden: complemento)',
    `Un solo recorrido **no** determina el árbol; se necesitan dos (p. ej. **preorden + inorden**).
1. En el preorden, la **raíz es el primer elemento**.
2. Búscala en el inorden: lo que queda a su izquierda es el subárbol izquierdo; a su derecha, el derecho.
3. Repite recursivamente con las partes correspondientes del preorden.

*Complemento:* con postorden + inorden la raíz es el **último** del postorden; preorden + postorden no siempre determina el árbol.`,
    `pre = [A, B, D, E, C], in = [D, B, E, A, C]. Raíz A. Inorden izquierdo [D, B, E] → raíz B (siguiente del preorden) con hijos D y E. Derecho [C]. Árbol: **A(B(D,E),C)**.`, true);
  add('tv_expr', 5, 'Árboles de expresión', 'S6-C1 · diap. 22',
    `En un **árbol de expresión** las hojas son números y los nodos internos son operadores. Para (3 + 4) * 2 la raíz es \`*\` con hijos \`+\`(3,4) y 2. Preorden: \`* + 3 4 2\`; inorden: \`3 + 4 * 2\` (sin paréntesis se pierde la prioridad); **postorden: \`3 4 + 2 *\` = notación postfija (RPN)**. Se evalúa con **postorden** porque hay que conocer los valores de los dos hijos antes de aplicar el operador del padre.`,
    `Árbol \`-(*(2,3),4)\`: postorden \`2 3 * 4 -\` = (2·3) − 4 = **2**.`);
  add('tv_errores', 5, 'Errores frecuentes en árboles', 'S6-C1 · diap. 23',
    `- Confundir profundidad (desde la raíz) con altura (hacia las hojas).
- Olvidar el caso base \`nodo is None\`: \`AttributeError\`.
- Creer que un solo recorrido determina el árbol.
- Confundir completo con lleno o perfecto.
- Usar recursión en árboles muy profundos y desbordar la pila (a veces conviene DFS iterativo con pila).
- Pensar que todo árbol está balanceado: uno degenerado tiene altura n−1, no log n.`,
    `En \`def preorden(nodo): print(nodo.valor); preorden(nodo.izq)\` falta el caso base: al llegar a una hoja, \`nodo.izq\` es \`None\` y \`None.valor\` lanza AttributeError.`);

  /* ===================== NIVEL 6 ===================== */
  add('bs_prop', 6, 'Propiedad de orden del BST', 'S6-C2 · diap. 5 y 16',
    `Un **árbol binario de búsqueda** es un árbol binario donde, para cada nodo con valor v: **todos** los valores del subárbol izquierdo son **< v** y **todos** los del subárbol derecho son **> v**. Vale recursivamente. Error frecuente: verificar solo con los hijos inmediatos; la propiedad debe valer con **todo el subárbol** (se verifica pasando un rango (mín, máx)).`,
    `\`10(5(3,12),15)\` NO es un BST: 12 está en el subárbol izquierdo de 10 y 12 > 10, aunque 12 > 5 (su padre).`);
  add('bs_buscar', 6, 'Búsqueda en un BST', 'S6-C2 · diap. 6',
    `Cada comparación descarta un subárbol: igual → encontrado; menor → izquierda; mayor → derecha; \`None\` → no está. Sigue un solo camino raíz–hoja: **O(h)**.

\`\`\`
def buscar(nodo, v):
    if nodo is None: return False
    if v == nodo.valor: return True
    if v < nodo.valor: return buscar(nodo.izq, v)
    else: return buscar(nodo.der, v)
\`\`\``,
    `En \`12(5(3,10),24(15,30))\`, buscar 10: 10 < 12 (izq), 10 > 5 (der), encontrado. Solo **3 comparaciones** en un árbol de 7 nodos.`);
  add('bs_inorden', 6, 'El inorden entrega orden', 'S6-C2 · diap. 7',
    `El recorrido inorden de un BST visita los valores en **orden ascendente**: en cada nodo primero se visita todo lo menor (izquierda), luego el nodo y luego todo lo mayor (derecha). Un BST es, en esencia, un arreglo ordenado que permite inserción eficiente.`,
    `\`12(5(3,10),24(15,30))\` → inorden = [3, 5, 10, 12, 15, 24, 30].`);
  add('bs_insertar', 6, 'Inserción en un BST', 'S6-C2 · diap. 8',
    `Se busca el valor como si fuera a encontrarse; al llegar a \`None\` se cuelga el nuevo nodo como **hoja** (izquierda si es menor, derecha si es mayor). **O(h)**: un solo camino. Convención de clase: si el valor ya existe, **no se duplica**.

\`\`\`
def insertar(nodo, v):
    if nodo is None: return NodoArbol(v)
    if v < nodo.valor: nodo.izq = insertar(nodo.izq, v)
    elif v > nodo.valor: nodo.der = insertar(nodo.der, v)
    return nodo
\`\`\``,
    `Insertar 11 en \`12(5(3,10),24(15,30))\`: 11 < 12, 11 > 5, 11 > 10 → se cuelga a la derecha de 10.`);
  add('bs_eliminar', 6, 'Eliminación en un BST', 'S6-C2 · diap. 10-11 y 16',
    `Tres casos:
- **0 hijos**: se elimina el nodo (era una hoja).
- **1 hijo**: se reemplaza el nodo por su único hijo.
- **2 hijos**: se reemplaza el valor por el **mayor del subárbol izquierdo** (predecesor inorden; también vale el menor del derecho) y luego se elimina ese sustituto de su posición original.

Errores: olvidar eliminar el sustituto; confundir el predecesor inorden con el hijo izquierdo.

\`\`\`
pred = nodo.izq
while pred.der is not None: pred = pred.der
nodo.valor = pred.valor
nodo.izq = eliminar(nodo.izq, pred.valor)
\`\`\``,
    `Eliminar 12 (2 hijos) en \`12(5(3,10),24(15,30))\`: el mayor del subárbol izquierdo es 10, sube a la raíz y se elimina de su lugar: **10(5(3,),24(15,30))**.`);
  add('bs_minmax', 6, 'Mínimo y máximo', 'S6-C2 · diap. 13',
    `El **mínimo** de un BST está bajando siempre por la izquierda; el **máximo**, bajando por la derecha: O(h). El **predecesor inorden** de un nodo con hijo izquierdo es el máximo de su subárbol izquierdo; el **sucesor inorden**, el mínimo de su subárbol derecho.`,
    `En \`12(5(3,10),24(15,30))\`: mínimo = 3, máximo = 30, predecesor de 12 = 10, sucesor de 12 = 15.`);
  add('bs_ordenins', 6, 'El orden de inserción importa', 'S6-C2 · diap. 9, 12 y 15',
    `Insertar [1, 2, 3, 4, 5] en un BST vacío produce una **lista** hacia la derecha de altura 4. Insertar [3, 2, 4, 1, 5] produce un árbol de altura 2. Los datos ya ordenados **degeneran** el árbol y las operaciones pasan de O(log n) a O(n).`,
    `[50, 30, 70, 20, 40, 60, 80] → \`50(30(20,40),70(60,80))\`, perfecto de altura 2. Si llegan ordenados [20, 30, 40, 50, 60, 70, 80], la altura es 6.`);
  add('bs_altura', 6, 'Complejidad O(h)', 'S6-C2 · diap. 12-13',
    `La complejidad de un BST es **O(h)**, no O(log n): con árbol balanceado h ≈ log n; degenerado h = n−1.

| Operación | Balanceado | Degenerado |
|---|---|---|
| Búsqueda / inserción / eliminación | O(log n) | O(n) |
| Mínimo / máximo | O(log n) | O(n) |
| Recorrido inorden | O(n) | O(n) |

*Complemento:* las versiones recursivas usan O(h) de espacio de pila.`,
    `Un BST de 1023 nodos perfecto tiene altura 9: buscar cuesta ≤ 10 comparaciones. Degenerado, hasta 1023.`, true);
  add('bs_hash', 6, 'BST vs. tabla hash', 'S6-C2 · diap. 13-14',
    `La **tabla hash** da búsqueda más rápida en promedio (≈ O(1)) pero no mantiene el orden. El **BST balanceado** da O(log n) y permite listar en orden (inorden) sin costo extra, y obtener mínimo/máximo. Si no importa el orden y solo se consulta pertenencia, la hash suele ser mejor. Si se necesitan ambas cosas, se elige el BST balanceado sacrificando algo de velocidad.`,
    `Vocabulario de IA que debe poder listarse alfabéticamente → BST balanceado. Solo comprobar si una palabra existe → tabla hash.`);
  add('bs_errores', 6, 'Errores frecuentes en BST', 'S6-C2 · diap. 16',
    `- Verificar la propiedad solo con los hijos inmediatos.
- Olvidar que la complejidad es O(h), no O(log n).
- Insertar datos ya ordenados sin notar el árbol degenerado.
- En eliminación con 2 hijos, olvidar eliminar el nodo sustituto de su posición original.
- Permitir duplicados sin una política clara (en clase: no se insertan).
- Confundir el predecesor inorden (mayor del subárbol izquierdo) con el hijo izquierdo.`,
    `En \`nodo.valor = pred.valor\` sin la línea \`nodo.izq = eliminar(nodo.izq, pred.valor)\`, el valor del predecesor queda **duplicado** en el árbol.`);

  /* ===================== NIVEL 7 ===================== */
  add('av_prob', 7, 'El problema y la meta', 'S7-C1 · diap. 4-5',
    `Un BST puede **degenerar**: insertar [1, 2, 3, 4, 5] produce una lista de altura 4 y todo vuelve a ser O(n). Un **árbol auto-balanceado** es un BST que mantiene su altura en **O(log n)** ajustando su forma tras cada inserción o eliminación, y garantiza esas operaciones en O(log n). **AVL** = Adelson-Velskii y Landis (1962), el primer BST auto-balanceable.`,
    `Insertar 1, 2, 3 en un AVL no deja la lista 1→2→3: tras insertar 3 se rota y queda \`2(1,3)\`.`);
  add('av_factor', 7, 'Factor de balance', 'S7-C1 · diap. 6-7',
    `**Factor de balance** de un nodo = altura(izq) − altura(der). Un árbol es AVL si en **todo** nodo |factor| ≤ 1. Si algún nodo llega a ±2 deja de ser AVL. Convención: **árbol vacío = −1**, **hoja = 0**, altura(n) = 1 + máx(alt(izq), alt(der)).`,
    `En \`8(4(2,),12(,14))\`: f(2) = 0; f(4) = alt(2) − alt(None) = 0 − (−1) = **+1**; f(12) = −1 − 0 = **−1**; f(8) = 1 − 1 = 0. Todos |f| ≤ 1: es AVL.`);
  add('av_altura', 7, 'Altura y recalculo por el camino', 'S7-C1 · diap. 7',
    `Tras insertar o eliminar se vuelve por el camino hacia la raíz **recalculando altura y factor** de cada nodo. El **primer nodo (el más profundo) con |factor| ≥ 2** es donde se rota. Al insertar 10 en \`30(20)\`, el factor de 30 pasa a +2 y se rota en 30.

\`\`\`
def altura(n): return -1 if n is None else n.h
def actualizar(n): n.h = 1 + max(altura(n.izq), altura(n.der))
def factor(n): return 0 if n is None else altura(n.izq) - altura(n.der)
\`\`\``,
    `Hoja nueva: h = 0. Su padre (con un solo hijo hoja): h = 1 + max(0, −1) = 1.`);
  add('av_rotsimple', 7, 'Rotaciones simples', 'S7-C1 · diap. 8-9 y 17',
    `Una **rotación** cambia la forma del árbol conservando la propiedad de BST (el **inorden no cambia**). Solo reengancha punteros: **O(1)**.

**Rotación derecha** de y (corrige Izq-Izq):
1. x = y.izq
2. y.izq = x.der
3. x.der = y
4. recalcular alturas de y y luego de x
5. **devolver x** (nueva raíz local)

**Rotación izquierda** de x (corrige Der-Der), simétrica: y = x.der; x.der = y.izq; y.izq = x; recalcular alturas de x y luego y; devolver y.

Como la raíz local cambia, hay que usar lo que devuelve: \`raiz = insertar(raiz, v)\`.`,
    `\`\`\`
def rot_der(y):
    x = y.izq
    y.izq = x.der
    x.der = y
    actualizar(y); actualizar(x)
    return x
\`\`\`
Sobre \`30(20(10,),)\` devuelve \`20(10,30)\`.`);
  add('av_ll', 7, 'Caso Izq-Izq (LL)', 'S7-C1 · diap. 10-12',
    `**Izq-Izq**: el nodo nuevo cayó en el subárbol izquierdo del hijo izquierdo (factor > 1 y el hijo izquierdo pesa a la izquierda). Es una **línea recta** → **una rotación derecha** del nodo desbalanceado.`,
    `Insertar 30, 20, 10 → desbalance LL en 30 → rotación derecha → \`20(10,30)\`.`);
  add('av_rr', 7, 'Caso Der-Der (RR)', 'S7-C1 · diap. 10-12',
    `**Der-Der**: el nodo nuevo cayó en el subárbol derecho del hijo derecho (factor < −1). **Línea recta** → **una rotación izquierda** del nodo desbalanceado. Ejemplo de clase: insertar 10, 20, 30.`,
    `Insertar 10, 20, 30 → desbalance RR en 10 → rotación izquierda → \`20(10,30)\`.`);
  add('av_lr', 7, 'Caso Izq-Der (LR)', 'S7-C1 · diap. 10-11 y 13',
    `**Izq-Der**: el nodo nuevo cayó en el subárbol derecho del hijo izquierdo (**zigzag**). Una sola rotación no basta. **Doble rotación**: (1) rotación **izquierda** del hijo izquierdo (convierte el zigzag en una línea recta Izq-Izq); (2) rotación **derecha** del nodo desbalanceado.`,
    `Insertar 30, 10, 20: 30 queda con f = +2 y su hijo 10 pesa a la derecha. Rotación izquierda en 10 → \`30(20(10,),)\`; rotación derecha en 30 → \`20(10,30)\`.`);
  add('av_rl', 7, 'Caso Der-Izq (RL)', 'S7-C1 · diap. 10-11 y 14',
    `**Der-Izq**: el nodo nuevo cayó en el subárbol izquierdo del hijo derecho (**zigzag**). **Doble rotación**: (1) rotación **derecha** del hijo derecho (lo convierte en Der-Der); (2) rotación **izquierda** del nodo desbalanceado. Simétrico a LR: solo cambian las direcciones.`,
    `Insertar 10, 30, 20: rotación derecha en 30 → \`10(,20(,30))\`; rotación izquierda en 10 → \`20(10,30)\`.`);
  add('av_insertar', 7, 'Inserción AVL', 'S7-C1 · diap. 15-16, 18 y 20',
    `1. **Insertar como en un BST** (si el valor ya existe, no insertar).
2. Volver por el camino hacia la raíz: en cada nodo recalcular altura y factor. Si |factor| ≤ 1, seguir subiendo; si no, rotar según el caso.

Cada inserción dispara **a lo sumo una** rotación (simple o doble). Siempre se escribe \`raiz = insertar(raiz, v)\`.`,
    `Insertar 10, 20, 30, 40, 50, 25: tras 30 → rot. izq → \`20(10,30)\`; tras 50 → rot. izq en 30 → \`20(10,40(30,50))\`; tras 25 → desbalance en 20 (Der-Izq) → doble rotación → **30(20(10,25),40(,50))**.`);
  add('av_primer', 7, 'Primer nodo desbalanceado', 'S7-C1 · diap. 7 y 18',
    `El **primer nodo desbalanceado** es el más profundo, en el camino de inserción, con |factor| ≥ 2 (no siempre es la raíz). Para decidir el caso:
1. Signo del factor: + → pesado a la izquierda; − → a la derecha.
2. ¿Hacia dónde cayó el nodo nuevo respecto al hijo pesado? Misma dirección → **simple** (LL o RR). Dirección contraria → **doble** (LR o RL).`,
    `Si al insertar el factor de 30 es +2 y el nuevo nodo quedó a la derecha del hijo izquierdo (10 → 20), es **Izq-Der**: doble rotación.`);
  add('av_eliminar', 7, 'Eliminación AVL', 'S7-C1 · diap. 19',
    `1. **Borrar como en un BST:** hoja → quitar; un hijo → reemplazar por ese hijo; dos hijos → copiar el **sucesor inorden** (mínimo del subárbol derecho) y borrar ese sucesor.
2. **Rebalancear por el camino:** si |factor| ≥ 2 el caso se decide por el **factor del hijo**:
- factor > 1 y balance(hijo izq) ≥ 0 → rotación derecha (si es < 0: izquierda del hijo y luego derecha).
- factor < −1 y balance(hijo der) ≤ 0 → rotación izquierda (si es > 0: derecha del hijo y luego izquierda).

A diferencia de la inserción, un borrado puede requerir **varias rotaciones** subiendo por el camino (hasta O(log n)).`,
    `En \`20(10,30(,40))\` eliminar 10: f(20) = −2, el hijo derecho 30 tiene balance −1 (≤ 0) → rotación izquierda en 20 → \`30(20,40)\`.`);
  add('av_complejidad', 7, 'Complejidad del AVL', 'S7-C1 · diap. 5 y 9',
    `En un AVL la altura es O(log n), así que búsqueda, inserción y eliminación cuestan **O(log n)** en el peor caso. Cada rotación es O(1); rebalancear tras una inserción requiere a lo sumo O(log n) de trabajo (subir por el camino).`,
    `Un AVL de 1 000 000 de nodos tiene altura ≈ 20: buscar cuesta unas 20 comparaciones, aunque se haya insertado en orden creciente.`);
  add('av_codigo', 7, 'Implementación en Python', 'S7-C1 · diap. 17-18 y 20',
    `Piezas: \`altura(n)\` (−1 si es None), \`factor(n)\`, \`actualizar(n)\`, \`rot_der\`, \`rot_izq\` e \`insertar\` que, tras insertar recursivamente, actualiza la altura y rebalancea con los cuatro casos. Errores típicos: actualizar alturas en el orden equivocado (primero el nodo que **bajó**, luego el que **subió**), no devolver la nueva raíz local, y no reasignar \`raiz = insertar(raiz, v)\`.`,
    `Si \`rot_der\` termina con \`return y\` en vez de \`return x\`, el árbol conserva la raíz vieja y el nodo \`x\` queda desconectado.`);
  add('av_compara', 7, 'AVL vs. BST vs. rojo-negro', 'S7-C1 · diap. 5, 22-23 y 33-34',
    `- **BST**: sin garantía de balance (altura hasta n−1): O(n) en el peor caso.
- **AVL**: balance estricto (|f| ≤ 1): altura ≈ log₂ n, búsquedas muy rápidas, pero más rotaciones al insertar/eliminar. Para **lectura**.
- **Rojo-negro**: balance más laxo (altura ≤ 2·log₂(n+1)), menos rotaciones al insertar/eliminar; lo usan \`std::map\` de C++, \`TreeMap\` de Java y el planificador de Linux. Para **escritura**.

Ambos garantizan O(log n); la diferencia es el compromiso lectura/escritura.`,
    `Diccionario que casi no cambia y se consulta mucho → AVL. Estructura con inserciones y borrados constantes → rojo-negro.`);

  add('rn_def', 7, 'Reglas del árbol rojo-negro y altura negra', 'S7-C1 · diap. 22-23',
    `Un **árbol rojo-negro** es un BST auto-balanceado cuyos nodos son **rojos o negros** con estas reglas:
- la **raíz** y las **hojas NIL** son **negras**;
- un **nodo rojo no puede tener hijos rojos**;
- **todo camino** de un nodo a sus hojas NIL tiene el **mismo número de nodos negros** (**altura negra**).

Como no hay dos rojos seguidos, el camino más largo es a lo sumo el **doble** del más corto: la altura es O(log n) y también buscar, insertar y eliminar.`,
    `En 13(8(1,11),17(,25)) con 13, 1, 11 y 17 negros y 8 y 25 rojos, cada camino a NIL tiene **3 nodos negros** (contando la hoja NIL): es válido.`);
  add('rn_ins', 7, 'Inserción en un rojo-negro (3 casos)', 'S7-C1 · diap. 24-27',
    `El nodo nuevo entra **rojo**. Si su padre P también es rojo (Q = abuelo):
- **Caso 3 (el otro hijo de Q, el tío, es rojo):** recolorear (P y tío → negro, Q → rojo) y continuar desde Q.
- **Caso 1 (zigzag, tío negro):** rotar P para alinear y pasar al caso 2.
- **Caso 2 (línea recta, tío negro):** Q → rojo, P → negro y rotar; termina.

Al final, la **raíz** se pinta siempre de **negro**.`,
    `Insertar 1 en \`10n(5r,15r)\`: padre 5 rojo y tío 15 rojo → caso 3: 5 y 15 negros, 10 rojo (y la raíz vuelve a negro): \`10n(5n(1r,),15n)\`.`);
  add('rn_del', 7, 'Eliminación en un rojo-negro (doble negro)', 'S7-C1 · diap. 28-32',
    `Se borra como en un BST (con el sucesor si hay dos hijos). **Borrar un rojo no altera nada**; borrar un **negro** deja un **doble negro** que se traslada hacia arriba con 4 casos según el hermano H y sus hijos:
1. **H rojo:** H negro, padre rojo, rotar el padre; pasa a 2, 3 o 4.
2. **H negro y sobrinos negros:** H rojo; el negro de más sube al padre (si era rojo, termina).
3. **Sobrino cercano rojo:** intercambiar colores de H y el sobrino y rotar H; pasa al caso 4.
4. **Sobrino lejano rojo:** H toma el color del padre, padre y sobrino lejano negros, rotar el padre; **termina**.`,
    `Eliminar 1 en \`2n(1n,3n(,4r))\`: hermano 3 negro con sobrino lejano 4 rojo → caso 4 → \`3n(2n,4n)\`.`);
  add('rn_vs', 7, 'Rojo-negro frente a AVL', 'S7-C1 · diap. 33-34',
    `**AVL:** balance más estricto, altura más baja (búsquedas más rápidas), más rotaciones; para cuando dominan las búsquedas (bases de datos, índices). **Rojo-negro:** balance más laxo, altura algo mayor, menos rotaciones; para cuando dominan las modificaciones (\`std::map\`, \`TreeMap\`, planificador de Linux). Ambos garantizan O(log n).`,
    `Índice consultado millones de veces y casi sin cambios → AVL. Inserciones y borrados constantes → rojo-negro.`);

  /* ===================== NIVEL 8 ===================== */
  add('in_paradigma', 8, 'Elegir y justificar un paradigma', 'S5-C2 · diap. 9, 11 y 15',
    `Para elegir: ¿los subproblemas se repiten (solapados)? → DP/memoización. ¿Son independientes? → divide y vencerás. ¿Las decisiones locales garantizan el óptimo? → greedy (hay que justificarlo; un contraejemplo lo refuta). ¿Hay restricciones que permiten podar? → backtracking. Si nada de lo anterior aplica y n es pequeño → fuerza bruta.`,
    `Mínimo de monedas con {1, 3, 4}: greedy falla (contraejemplo V = 6); DP acierta.`);
  add('in_analisis', 8, 'Analizar e implementar con complejidad', 'S2-C1 · S2-C2 · S5-C2',
    `Pasos: (1) define n; (2) cuenta llamadas/iteraciones y el trabajo por cada una; (3) combina con las reglas (suma/producto); (4) da el orden con la cota más ajustada y di si es peor caso; (5) calcula también el espacio (estructuras auxiliares + pila).`,
    `\`fib_memo\`: n+1 cálculos × O(1) = O(n) tiempo; la caché ocupa O(n) y la pila O(n): espacio O(n).`);
  add('in_depurar', 8, 'Detectar errores en código recursivo', 'S5-C2 · diap. 19; S6-C1 · diap. 23; S6-C2 · diap. 16',
    `Revisa en este orden: (1) ¿hay caso base y se comprueba antes de la llamada? (2) ¿cada llamada se acerca al caso base? (3) ¿se usa el valor devuelto (return / asignación a nodo.izq)? (4) ¿hay estado compartido mutable (caché por defecto)? (5) ¿se devuelve la nueva raíz local?`,
    `\`nodo.izq = insertar(nodo.izq, v)\` es correcto; \`insertar(nodo.izq, v)\` sin asignar pierde el nodo nuevo.`);
  add('in_bst_avl', 8, 'Construir y balancear árboles', 'S6-C2 · S7-C1',
    `Construir un BST por inserciones sucesivas y comparar con el AVL de la misma secuencia: el BST depende del orden (altura hasta n−1); el AVL rota para mantener |f| ≤ 1. Hay que poder dar: forma final, alturas, factores, rotaciones aplicadas y costo.`,
    `Secuencia [1, 2, 3, 4, 5]: BST altura 4 (lista); AVL → \`2(1,4(3,5))\`, altura 2.`);
  add('in_justificar', 8, 'Justificar decisiones algorítmicas', 'Varias',
    `Una buena justificación nombra la **propiedad** que hace válida la elección (p. ej. "subproblemas solapados", "|factor| ≤ 1 garantiza altura O(log n)"), el **costo** resultante y, si corresponde, un **contraejemplo** de la alternativa descartada.`,
    `"Uso DP porque hay subproblemas solapados; greedy no sirve porque con {1,3,4} y V=6 da 3 monedas y el óptimo es 2."`);

  /* ===================== utilidades ===================== */
  const nivelDeConcepto = id => (K[id] ? K[id].nivel : null);
  const conceptosDeNivel = n => Object.values(K).filter(c => c.nivel === n);

  ET.Temario = { fuentes, niveles, etapas, conceptos: K, nivelDeConcepto, conceptosDeNivel };
})(typeof window !== 'undefined' ? window : globalThis);
