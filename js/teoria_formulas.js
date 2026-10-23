/* teoria_formulas.js — Biblioteca: «Fórmulas, reglas y condiciones que debo recordar».
   Cada entrada: nombre, fórmula, variables, cuándo se usa, ejemplo y condiciones (con las convenciones del curso). */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;
  const F = (id, area, nombre, formula, variables, cuando, ejemplo, condiciones, tema, alias) => B.formula({ id, area, nombre, formula, variables, cuando, ejemplo, condiciones, tema, alias });

  /* ---------------- Recursión ---------------- */
  F('rec-fib-llamadas', 'rec', 'Número de llamadas de Fibonacci ingenuo', 'c(n) = 1 + c(n−1) + c(n−2) = 2·F(n+1) − 1',
    ['§n§: argumento de §fib(n)§', '§c(n)§: llamadas totales (con la propia)', '§F(k)§: k-ésimo número de Fibonacci (§F(0)=0§, §F(1)=1§)'],
    'Contar los nodos del árbol de llamadas de §fib(n)§ ingenuo y justificar que es exponencial.',
    '§fib(6)§: §F(7) = 13§ ⇒ §c = 2·13 − 1 = 25§ llamadas. §fib(20)§: 21 891.',
    ['Cuenta **todas** las llamadas (también las hojas).', 'Cota de la clase: §c(n) ≤ 2ⁿ§ ⇒ §O(2ⁿ)§.', 'Espacio de pila: **§O(n)§**, no exponencial.'], 'rec-ingenua');
  F('rec-fib-memo', 'rec', 'Llamadas de Fibonacci con memoización', 'llamadas = 2n − 1   (tiempo O(n))',
    ['§n§: argumento (§n ≥ 1§)', 'hay §n + 1§ subproblemas distintos (§fib(0)…fib(n)§)'],
    'Comparar la versión memoizada con la ingenua y justificar §O(n)§.',
    '§n = 6§: 11 llamadas (frente a 25); §n = 20§: 39 (frente a 21 891).',
    ['Cada subproblema se calcula **una vez**; el resto son consultas §O(1)§ a la caché.', 'Espacio: §O(n)§ (caché + pila).', 'No vale con caché mutable por defecto (§cache={}§): se comparte entre llamadas.'], 'rec-memo');
  F('rec-pila', 'rec', 'Espacio de pila de una recursión', 'espacio de pila = profundidad máxima de la recursión',
    ['profundidad = marcos apilados a la vez (no el total de llamadas)'],
    'Calcular el espacio de una función recursiva o decidir si puede desbordar la pila.',
    '§factorial(n)§: §n§ marcos ⇒ §O(n)§; potencia por mitades: §⌊log₂ n⌋ + 1§ ⇒ §O(log n)§; recorrido de árbol: §O(h)§; §fib§ ingenuo: §O(n)§.',
    ['Python limita la profundidad (~1000): §RecursionError§.', 'Distingue **número de llamadas** (tiempo) de **profundidad** (espacio).'], 'rec-pila');
  F('rec-potencia', 'rec', 'Potencia por mitades', 'x⁰ = 1;  xⁿ = (xⁿ/²)²  si n par;  xⁿ = x·(x⁽ⁿ⁻¹⁾/²)²  si n impar   →  T(n) = T(n/2) + O(1) = O(log n)',
    ['§x§: base', '§n§: exponente entero ≥ 0', '§mitad§: resultado del subproblema de tamaño §n // 2§'],
    'Calcular potencias sin §**§ y justificar §O(log n)§.',
    '§potencia(2, 10)§: §n = 10, 5, 2, 1, 0§ ⇒ 5 llamadas; resultado 1024.',
    ['Calcula §mitad§ **una sola vez** (guardada en una variable); si se llama dos veces, el costo es §O(n)§.', 'Caso base §n = 0§.'], 'rec-definicion');

  /* ---------------- Complejidad ---------------- */
  F('cx-suma-aritmetica', 'cx', 'Suma aritmética (ciclos dependientes)', '1 + 2 + … + m = m(m+1)/2        (n−1) + (n−2) + … + 1 = n(n−1)/2',
    ['§m§: último sumando', '§n§: tamaño de la entrada'],
    'Contar las vueltas de un ciclo interno que depende del externo (§range(i)§, §range(i+1, n)§).',
    '§for i in range(n): for j in range(i)§: §0 + 1 + … + (n−1) = n(n−1)/2§; con §n = 10§: 45.',
    ['Si el interno es independiente de §i§ son §n·n§, no §n(n−1)/2§.', 'Ambos son §O(n²)§: difieren en un factor 2.'], 'cx-conteo');
  F('cx-tn-ciclo', 'cx', 'Función de costo de un ciclo simple', 'T(n) = inicio + n·(control + cuerpo) + retorno   →   sumar(v): 1 + n·(1 + 3) + 1 = 4n + 2',
    ['§n§: número de vueltas', 'control = comparación e incremento por vuelta', 'cuerpo = operaciones por vuelta'],
    'Obtener §T(n)§ exacto en el modelo RAM (cada operación elemental cuesta 1).',
    '§sumar(v)§ con §v[i]§, suma y asignación (3) en el cuerpo: §T(n) = 4n + 2§; para §n = 10§: 42.',
    ['Sin ciclos §T(n)§ es constante (§area_rectangulo§: 4).', 'Declara **qué es §n§** y el **caso** (peor, por convenio).'], 'cx-conteo');
  F('cx-def-o', 'cx', 'Definición de O (cota superior)', 'T(n) ∈ O(g(n)) ⇔ ∃ c > 0, n₀ > 0 : 0 ≤ T(n) ≤ c·g(n)  ∀ n ≥ n₀',
    ['§c§: constante multiplicativa', '§n₀§: umbral desde el que vale la desigualdad', '§g(n)§: función de comparación'],
    'Demostrar que una función pertenece a §O(g)§ **exhibiendo §c§ y §n₀§**.',
    '§3n² + 10n + 7 ≤ 20n²§ para §n ≥ 1§ ⇒ §c = 20§, §n₀ = 1§. §7n + 200 ≤ 207n§ ⇒ §c = 207§, §n₀ = 1§.',
    ['§O§ es un **conjunto**: escribe §T(n) ∈ O(n)§.', 'Cualquier cota mayor también sirve (§O(n³)§ para algo cuadrático es correcto pero inútil): usa la más ajustada.', 'No es lo mismo que el «peor caso».'], 'cx-formal');
  F('cx-def-omega-theta', 'cx', 'Definición de Ω y Θ', 'Ω: T(n) ≥ c·g(n) ≥ 0 ∀ n ≥ n₀        Θ: T ∈ O(g) y T ∈ Ω(g)  (c₁·g ≤ T ≤ c₂·g)',
    ['§Ω§: cota inferior', '§Θ§: orden exacto', '§c₁, c₂§: constantes de la cota inferior y superior'],
    'Afirmar que un problema no puede resolverse mejor (§Ω§) o que se conoce el orden exacto (§Θ§).',
    '§T(n) = 5n log n + 300n + 10⁶§: §O(n²)§ (inútil), §Ω(n)§ (floja), §Θ(n log n)§ (la útil); **no** es §Θ(n²)§.',
    ['§Θ§ exige las dos cotas.', 'Todo algoritmo de ordenamiento por comparaciones es §Ω(n log n)§ (semana 10).'], 'cx-formal');
  F('cx-reglas-o', 'cx', 'Reglas de cálculo de O', 'O(c·f) = O(f) · O(f) + O(g) = O(máx(f, g)) · O(f)·O(g) = O(f·g) · polinomio → grado mayor',
    ['bloques **consecutivos** → máximo', 'bloques **anidados** → producto'],
    'Simplificar la complejidad de un programa sin demostrar cada constante.',
    'Un §for§ de §n§, luego dos §for§ anidados de §n§: §O(n) + O(n²) = O(n²)§.',
    ['El interno de tamaño **fijo** (§range(100)§) no multiplica por §n§.', 'Revisa costos ocultos (§in§ de lista, §insert(0, x)§…).'], 'cx-reglas');
  F('cx-cambio-base', 'cx', 'Cambio de base del logaritmo', 'logₐ n = log_b n / log_b a',
    ['§a, b§: bases', '§1 / log_b a§: constante'],
    'Justificar que la base del logaritmo es irrelevante en §O§.',
    '§log₂ n = log₁₀ n / log₁₀ 2 ≈ 3,32·log₁₀ n§.',
    ['Vale para §a, b > 1§.', 'En §O§ se escribe §O(log n)§ sin base.'], 'cx-reglas');
  F('cx-pasos-log', 'cx', 'Vueltas de un ciclo que divide o duplica', 'dividir hasta 1: ⌊log₂ n⌋ pasos     duplicar hasta ≥ n: ⌈log₂ n⌉ pasos',
    ['§i = n; while i > 1: i //= 2§', '§j = 1; while j < n: j *= 2§'],
    'Determinar cuántas veces se ejecuta un ciclo cuyo índice se multiplica o se divide.',
    '§n = 1024§: 10 pasos en ambos; §n = 1000§: dividir 9, duplicar 10.',
    ['Índice que **suma** → lineal; que **multiplica o divide** → logarítmico.', 'Para la notación §O§ no importa piso/techo; para contar, sí.'], 'cx-ciclos');
  F('cx-razon', 'cx', 'Razón de duplicación', 'T(2n)/T(n) ≈ 2ᵏ   ⇒   k = log₂(razón)',
    ['§k§: exponente estimado', '≈1 constante · ≈1+ε log · ≈2 lineal · ≈2,1–2,3 n log n · ≈4 cuadrático · ≈8 cúbico'],
    'Diagnosticar experimentalmente la complejidad de código desconocido.',
    '§unicos_A§: 0,043 s y 0,172 s con §n = 2000§ y §4000§ ⇒ razón ≈ 4 ⇒ cuadrático.',
    ['Mide varias veces y con §n§ grande.', 'Es un diagnóstico (no una demostración): confirma leyendo el código.'], 'cx-razon');
  F('cx-tiempo-estimado', 'cx', 'Tiempo estimado de un algoritmo', 'tiempo = operaciones ÷ operaciones por segundo   (la clase usa 10⁹ op/s)',
    ['operaciones = §T(n)§ evaluada en el §n§ dado'],
    'Decidir si un algoritmo es viable para un tamaño dado.',
    '§n = 10⁶§: §n§ → 0,001 s; §n log₂ n ≈ 2 × 10⁷§ → 0,02 s; §n² = 10¹²§ → 10³ s ≈ **17 min** (las diapositivas dicen «11 días», pero eso corresponde a ≈ 10¹⁵ operaciones).',
    ['Una máquina más rápida solo cambia el factor constante, no el orden de crecimiento.', '§2ⁿ§ es inalcanzable ya con §n§ de unas decenas.'], 'cx-dominante');
  F('cx-promedio-busqueda', 'cx', 'Búsqueda secuencial: mejor, peor y promedio', 'mejor = 1 · peor = n · promedio = (n + 1)/2',
    ['§n§: elementos de la lista', 'promedio con posición uniforme'],
    'Dar el costo de la búsqueda secuencial en cada caso.',
    '§n = 8§: 1, 8 y 4,5 comparaciones.',
    ['Por convenio, «la complejidad» sin aclarar es el **peor caso**.', 'El promedio exige declarar la distribución de las entradas.'], 'cx-casos');
  F('cx-triple-ciclo', 'cx', 'Triple ciclo dependiente', 'for i, for j < i, for k < j  →  n(n−1)(n−2)/6 = C(n, 3) = Θ(n³)',
    ['§n§: tamaño del ciclo externo'],
    'Contar un triple ciclo anidado donde cada límite depende del anterior.',
    '§n = 16§: §16·15·14/6 = 560§; §n = 30§: 4 060.',
    ['Si los límites fueran todos §n§ serían §n³§ (constante 1, no 1/6).'], 'cx-ciclos');
  F('cx-atencion', 'cx', 'Costo de la atención de los transformers', 'tiempo Θ(L²·d)  y  memoria Θ(L²)  →  duplicar L cuadruplica el costo',
    ['§L§: número de tokens (longitud del contexto)', '§d§: dimensión del modelo'],
    'Estimar cómo crece el costo al ampliar el contexto.',
    '4 096 → 32 768 tokens (§×8§): §8² = 64§ veces más con §Θ(L²)§; con §Θ(L log L)§ solo §≈ 10§.',
    ['Es un problema de **complejidad**, no de hardware.'], 'cx-constantes');
  F('cx-cruce-constantes', 'cx', 'Punto de cruce entre dos costos con constantes', 'c₁·f₁(n) = c₂·f₂(n)   ⇒   n*',
    ['§c₁, c₂§: constantes de cada algoritmo', '§n*§: tamaño donde empatan'],
    'Decidir qué algoritmo conviene en el rango real de tamaños (la notación §O§ oculta las constantes).',
    '§1000·n§ frente a §2·n·log₂ n§: el lineal solo gana si §log₂ n > 500§, es decir §n > 2⁵⁰⁰§.',
    ['Para §n§ pequeño manda la constante (insertion sort gana a merge sort con §n < 50§).', 'Mide en tu rango de §n§.'], 'cx-constantes');
  F('cx-amortizado', 'cx', 'Costo amortizado', 'costo amortizado = (costo total de m operaciones) / m',
    ['§m§: número de operaciones consecutivas'],
    'Justificar que §append§ es §O(1)§ amortizado o que una pila monótona es §O(n)§ aunque tenga un §while§ dentro de un §for§.',
    'Pila monótona: cada índice se apila una vez y se desapila a lo sumo una ⇒ total §≤ 2n§ operaciones ⇒ §O(n)§.',
    ['**Amortizado** ≠ promedio probabilístico: es una cota del peor caso sobre una secuencia.', 'Escribe «amortizado» explícitamente en las tablas.'], 'ad-parcial');

  /* ---------------- Paradigmas ---------------- */
  F('pd-monedas', 'pd', 'Cambio de moneda por programación dinámica', 'dp[0] = 0;  dp[v] = mín_{c ≤ v} (dp[v − c] + 1)   →  O(V·m) tiempo, O(V) espacio',
    ['§V§: valor objetivo', '§m§: número de denominaciones', '§dp[v]§: mínimo de monedas para formar §v§'],
    'Hallar el mínimo de monedas con denominaciones arbitrarias (greedy puede fallar).',
    '{1, 3, 4}, §V = 6§: §dp = [0, 1, 2, 1, 1, 2, 2]§ ⇒ 2 monedas (3 + 3); greedy da 3.',
    ['Inicializa con ∞ (no con 0); devuelve −1 si §dp[V]§ sigue en ∞.', 'Es pseudo-polinomial (depende del **valor** de §V§).'], 'pd-dp');
  F('pd-escalera', 'pd', 'Escalera de pasos 1 o 2', 'f(n) = f(n−1) + f(n−2),  f(0) = f(1) = 1   (Fibonacci desplazado)',
    ['§n§: escalones', '§f(n)§: formas de subir'],
    'Contar formas de subir una escalera (actividad de la clase) y ver DP en acción.',
    '§f(2..8) = 2, 3, 5, 8, 13, 21, 34§; §f(4) = 5§.',
    ['Ingenua §O(2ⁿ)§; memoizada §O(n)§; bottom-up con dos variables §O(n)§ tiempo y §O(1)§ memoria.'], 'rec-vs-iter');
  F('pd-recurrencias', 'pd', 'Recurrencias de divide y vencerás', 'T(n) = T(n/2) + O(1) → O(log n) · T(n) = 2T(n/2) + O(n) → O(n log n)',
    ['§T(n)§: costo para tamaño §n§', 'búsqueda binaria · merge sort'],
    'Obtener la complejidad de un algoritmo que divide el problema a la mitad.',
    'Merge sort con entrada decreciente: §n/2·log₂ n§ comparaciones (§n = 1024§: 5 120).',
    ['Costo = (niveles) × (trabajo por nivel).', 'En D&C los subproblemas son **independientes** (en DP se solapan).'], 'pd-dyc');
  F('pd-espacios', 'pd', 'Tamaño del espacio de búsqueda (fuerza bruta)', 'pares n(n−1)/2 · subconjuntos 2ⁿ · permutaciones n! · tableros de N reinas Nᴺ',
    ['§n§: elementos o ciudades', '§N§: lado del tablero'],
    'Estimar si la fuerza bruta es viable.',
    'TSP con 15 ciudades: §14! = 87 178 291 200§ rutas; 8 reinas: §8⁸ = 16 777 216§ tableros (el backtracking visita 2 057 nodos).',
    ['El backtracking **no** mejora el peor caso asintótico; reduce el trabajo real con la poda.'], 'pd-fb-bt');
  F('pd-mochila', 'pd', 'Mochila 0/1 por programación dinámica', 'tabla[i][w] = máx(tabla[i−1][w], tabla[i−1][w − pᵢ] + vᵢ)   →  O(n·W)',
    ['§n§: objetos', '§W§: capacidad', '§pᵢ, vᵢ§: peso y valor del objeto §i§'],
    'Maximizar valor sin exceder el peso (cada objeto entra o no).',
    'Pesos [5, 4, 6, 3], valores [10, 40, 30, 50], §W = 10§ ⇒ 90 (objetos de peso 4 y 3).',
    ['Fuerza bruta §O(2ⁿ)§; greedy por valor/peso puede fallar.', 'NP-difícil en general (la DP es pseudo-polinomial).'], 'pd-clasicos');

  /* ---------------- Árboles ---------------- */
  F('ar-aristas', 'ar', 'Aristas de un árbol', 'aristas = N − 1',
    ['§N§: nodos'],
    'Verificar la definición de árbol o contar enlaces.',
    '6 nodos ⇒ 5 aristas.',
    ['Es **necesaria pero no suficiente**: hay grafos con §N − 1§ aristas que no son árbol (ciclo aparte).', 'Un nodo sin padre es la raíz; todos los demás tienen exactamente un padre.'], 'ar-def');
  F('ar-altura', 'ar', 'Altura y profundidad', 'profundidad(raíz) = 0 · altura(hoja) = 0 · altura(vacío) = −1 · altura(n) = 1 + máx(altura(izq), altura(der))',
    ['profundidad = aristas desde la raíz (= nivel)', 'altura = aristas hasta la hoja más lejana'],
    'Medir un árbol o escribir la altura recursiva.',
    'Árbol de la clase: §prof(H) = 3§, §alt(A) = 3§ = altura del árbol.',
    ['Se cuentan **aristas** (con niveles desde 1 la «altura» sale 1 más).', 'No confundas profundidad (desde la raíz) con altura (hacia las hojas).'], 'ar-vocab');
  F('ar-perfecto', 'ar', 'Nodos de un árbol perfecto', 'nodos = 2^(h+1) − 1   (nivel k tiene 2ᵏ nodos)',
    ['§h§: altura (en aristas)'],
    'Saber cuántos nodos caben en una altura dada y por qué un árbol balanceado tiene altura ≈ §log₂ n§.',
    '§h = 3§ ⇒ 15 nodos (1 + 2 + 4 + 8); §h = 5§ ⇒ 63.',
    ['Es el **máximo** de nodos para esa altura; el mínimo es §h + 1§ (una cadena).', 'Con §n§ nodos: §h ≥ ⌈log₂(n + 1)⌉ − 1§ y §h ≤ n − 1§.'], 'ar-tipos');
  F('tv-recorridos', 'tv', 'Recorridos en profundidad', 'preorden: raíz, izq, der · inorden: izq, raíz, der · postorden: izq, der, raíz   (todos O(n) tiempo, O(h) pila)',
    ['§n§: nodos', '§h§: altura'],
    'Escribir el recorrido de un árbol o elegir el adecuado.',
    '§1(2(4,5),3)§: pre 1 2 4 5 3 · in 4 2 5 1 3 · post 4 5 2 3 1.',
    ['Un solo recorrido no determina el árbol (se necesitan dos).', 'En un BST el inorden sale **ordenado**.', 'Falta el caso base §is None§ ⇒ §AttributeError§.'], 'tv-profundidad');
  F('tv-reconstruir', 'tv', 'Reconstrucción con preorden e inorden', 'raíz = pre[0];  k = posición de la raíz en el inorden;  izq: pre[1:k+1], ino[:k];  der: pre[k+1:], ino[k+1:]',
    ['§pre§: preorden', '§ino§: inorden', '§k§: tamaño del subárbol izquierdo'],
    'Reconstruir un árbol a partir de dos recorridos.',
    'pre ABDEC, in DBEAC ⇒ raíz A, izquierda §[D, B, E]§, derecha §[C]§ ⇒ §A(B(D,E),C)§.',
    ['Valores **distintos**.', 'En el postorden la raíz es el **último**.', 'Preorden + postorden no bastan en general.'], 'tv-reconstruir');
  F('tv-expresion', 'tv', 'Árbol de expresión', 'hojas = (n + 1)/2 · operadores = (n − 1)/2   (postorden → notación postfija y evaluación)',
    ['§n§: nodos de un árbol de expresión binario lleno'],
    'Convertir expresiones y evaluarlas.',
    '§(3 + 4) × 2§: postfija §3 4 + 2 *§ ⇒ 14.',
    ['Evaluar = **postorden** (hijos antes que el padre).', 'El inorden necesita paréntesis.'], 'tv-expresion');

  /* ---------------- BST ---------------- */
  F('bs-propiedad', 'bs', 'Propiedad del BST', '∀ nodo de valor v:  todo el subárbol izquierdo < v  y  todo el subárbol derecho > v',
    ['§v§: valor del nodo'],
    'Verificar si un árbol binario es un BST.',
    '§10(5(,15),20)§ **no** es BST: 15 está a la izquierda de 10 pero es mayor.',
    ['Debe valer con **todo el subárbol**, no solo con los hijos inmediatos.', 'Sin duplicados (desigualdades estrictas).', 'Verificación: intervalo §(lo, hi)§ por llamada, o inorden estrictamente creciente.'], 'bs-prop');
  F('bs-costo', 'bs', 'Costo de las operaciones del BST', 'búsqueda, inserción, eliminación, mín/máx: O(h);   ⌊log₂ n⌋ ≤ h ≤ n − 1;   inorden: O(n)',
    ['§h§: altura', '§n§: nodos'],
    'Dar la complejidad de una operación en un BST.',
    'Balanceado: §O(log n)§; insertar §1…n§ en orden: lista de altura §n − 1§ ⇒ §O(n)§.',
    ['La complejidad es **§O(h)§, no §O(log n)§**.', 'Construir con datos ordenados cuesta §Σ k = n(n−1)/2 = O(n²)§.'], 'bs-complejidad');
  F('bs-eliminar-casos', 'bs', 'Casos de eliminación en un BST', '0 hijos: quitar · 1 hijo: reemplazar por el hijo · 2 hijos: copiar el predecesor (mayor de la izq.) o el sucesor (menor de la der.) y eliminarlo',
    ['predecesor inorden = mayor del subárbol izquierdo', 'sucesor inorden = menor del subárbol derecho'],
    'Eliminar un valor sin romper la propiedad del BST.',
    '§12(5(3,10),24(15,30))§, eliminar 12 ⇒ sube 10 ⇒ §10(5(3,),24(15,30))§.',
    ['**Hay que eliminar el sustituto** de su posición original.', 'El sustituto tiene a lo sumo un hijo.', 'BST de la clase: predecesor; AVL: sucesor.'], 'bs-eliminar');

  /* ---------------- AVL ---------------- */
  F('av-factor', 'av', 'Factor de balance y condición AVL', 'factor(n) = altura(n.izq) − altura(n.der);   AVL ⇔ |factor(n)| ≤ 1 en todos los nodos',
    ['altura(vacío) = −1, altura(hoja) = 0', '§+2§: pesa a la izquierda; §−2§: pesa a la derecha'],
    'Decidir si un árbol es AVL y dónde hay que rotar.',
    '§8(4(2,),)§: §f(8) = 1 − (−1) = +2§ ⇒ no es AVL.',
    ['Se rota en el **primer** nodo (el más profundo) con §|f| ≥ 2§ al subir por el camino.', 'El hijo vacío cuenta **−1**.'], 'av-factor');
  F('av-caso-insercion', 'av', 'Caso de desbalance en la inserción', 'b>1 y v<n.izq.v → Izq-Izq (rot. der.) · b<−1 y v>n.der.v → Der-Der (rot. izq.) · b>1 y v>n.izq.v → Izq-Der · b<−1 y v<n.der.v → Der-Izq',
    ['§b = balance(n)§', '§v§: valor insertado', 'Izq-Der: rot. izq. del hijo y luego der.; Der-Izq: rot. der. del hijo y luego izq.'],
    'Aplicar la corrección correcta tras insertar.',
    'Insertar §30, 10, 20§: §b > 1§ y §20 > 10§ ⇒ Izq-Der ⇒ doble rotación ⇒ §20(10,30)§.',
    ['Recta ⇒ rotación **simple**; zigzag ⇒ **doble**.', 'Una inserción necesita **a lo sumo una** corrección.'], 'av-casos');
  F('av-caso-eliminacion', 'av', 'Caso de desbalance en la eliminación', 'b>1 y balance(izq) ≥ 0 → rot. der. · b>1 y balance(izq) < 0 → izq. del hijo + der. · b<−1 y balance(der) ≤ 0 → rot. izq. · b<−1 y balance(der) > 0 → der. del hijo + izq.',
    ['el caso se decide por el **factor del hijo**'],
    'Rebalancear tras eliminar.',
    'Árbol de Fibonacci de 12 nodos, eliminar 12: 2 rotaciones (derecha en 11 y derecha en 8).',
    ['Un borrado puede necesitar **varias** rotaciones (hasta §O(log n)§).', 'Con factor del hijo = 0 se trata como recto (una rotación).'], 'av-eliminacion');
  F('av-rotacion', 'av', 'Rotación derecha de y (la izquierda es el espejo)', 'x = y.izq;  t = x.der;  x.der = y;  y.izq = t;  actualizar(y);  actualizar(x);  devolver x',
    ['§y§: nodo desbalanceado', '§x§: su hijo izquierdo, que sube', '§t§: subárbol interior que cambia de padre'],
    'Rebalancear en O(1) preservando el inorden.',
    '§4(2,8(6,10))§ con rotación izquierda en 4 ⇒ §8(4(2,6),10)§, inorden idéntico.',
    ['Recalcula **primero** la altura del que baja y luego la del que sube.', 'Reasigna el retorno: §n.izq = rotar_…(n.izq)§ y §raiz = insertar(raiz, v)§.'], 'av-rotaciones');
  F('av-min-nodos', 'av', 'Mínimo de nodos de un AVL de altura h', 'N(−1) = 0, N(0) = 1, N(h) = N(h−1) + N(h−2) + 1  →  1, 2, 4, 7, 12, 20, 33, …   ⇒   h < 1,44·log₂(n + 2)',
    ['§N(h)§: mínimo de nodos', 'crece como Fibonacci'],
    'Justificar que la altura del AVL es §O(log n)§.',
    'Con 1000 nodos la altura está entre 9 y 13 (§N(13) = 986 ≤ 1000 < N(14) = 1596§).',
    ['Resultado **complementario**: no está en las diapositivas, pero justifica el §O(log n)§.'], 'av-complejidad');

  /* ---------------- Rojo-negro ---------------- */
  F('rn-reglas', 'rn', 'Reglas del rojo-negro', 'raíz y NIL negros · rojo sin hijos rojos · mismo número de negros en todo camino (altura negra)   ⇒   altura ≤ 2·log₂(n + 1)',
    ['altura negra: nodos negros de un camino a NIL (NIL cuenta)'],
    'Verificar un árbol coloreado o justificar §O(log n)§.',
    '§13n(8r(1n,11n),17n(,25r))§: cada camino tiene 3 negros (con NIL).',
    ['Un nodo rojo tiene 0 o 2 hijos reales.', 'El camino más largo es a lo sumo el doble del más corto.'], 'rn-def');
  F('rn-insercion', 'rn', 'Casos de inserción en el rojo-negro', 'nodo nuevo rojo; padre P rojo, abuelo Q, tío T:  T rojo → caso 3 (recolorear);  T negro y zigzag → caso 1 (rotar P);  T negro y recta → caso 2 (recolorear y rotar Q)',
    ['al final: la raíz siempre negra'],
    'Reparar «dos rojos seguidos» tras insertar.',
    'Insertar §1§ en §10n(5r,15r)§: tío 15 rojo ⇒ caso 3 ⇒ §10n(5n(1r,),15n)§.',
    ['El caso 3 solo recolorea y sube; los casos 1 y 2 terminan.', 'Casos simétricos (espejo) si P es hijo derecho.'], 'rn-insercion');
  F('rn-eliminacion', 'rn', 'Casos de eliminación en el rojo-negro', 'doble negro D, hermano H:  1) H rojo · 2) H y sobrinos negros · 3) sobrino cercano rojo · 4) sobrino lejano rojo (termina)',
    ['NIL cuenta como negro', 'borrar un rojo no altera nada; borrar un negro deja un doble negro'],
    'Reparar el negro de más tras borrar un nodo negro.',
    '§2n(1n,3n(,4r))§, eliminar 1 ⇒ caso 4 ⇒ §3n(2n,4n)§.',
    ['Caso 1 y 3 no terminan; caso 2 sube la deuda al padre.', 'Doble negro en la raíz se ignora.'], 'rn-eliminacion');

  /* ---------------- Adicionales ---------------- */
  F('ad-corte-lista', 'ad', 'Costo de cortar listas en una recursión', 'copias totales = (n − 1) + (n − 2) + … + 1 = n(n − 1)/2 = O(n²)',
    ['§v[1:]§ copia §n − 1§ elementos en cada llamada'],
    'Analizar recursiones que usan §v[1:]§.',
    'Sumar §list(range(100))§ con cortes: 4 950 elementos copiados.',
    ['Con índices en lugar de cortes vuelve a §O(n)§.', '§lista.pop(0)§ y §x in lista§ también son §O(n)§.'], 'ad-python');
})(typeof window !== 'undefined' ? window : globalThis);
