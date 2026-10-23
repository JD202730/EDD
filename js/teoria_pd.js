/* teoria_pd.js — Biblioteca: área Paradigmas algorítmicos (fuente: S5-C2, Recursión y paradigmas algorítmicos) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'pd-cinco', area: 'pd', titulo: 'Los cinco paradigmas y cómo elegir', fuente: 'S5-C2 · diap. 9, 15, 19-21', nivel: 3, comp: true,
    conceptos: ['pd_cinco', 'pd_errores', 'in_paradigma'], interactivo: [],
    definicion: R`
Un **paradigma algorítmico** es una **estrategia general** para diseñar algoritmos. La clase distingue cinco:

- **Fuerza bruta**: prueba todo.
- **Backtracking**: fuerza bruta que **poda** temprano.
- **Greedy** (voraz): elige el **óptimo local** en cada paso.
- **Divide y vencerás**: subproblemas **independientes**.
- **Programación dinámica (DP)**: subproblemas **solapados**.`,
    intuicion: R`
Imagina que tienes que armar la mejor ruta de un viaje:

- **Fuerza bruta**: revisas **todas** las rutas posibles y te quedas con la mejor. Segura pero carísima.
- **Backtracking**: igual, pero abandonas una ruta apenas ves que ya no puede servir (se pasó del presupuesto).
- **Greedy**: en cada ciudad vas a la más cercana sin pensarlo más. Rápido, pero puede dejarte en un callejón.
- **Divide y vencerás**: partes el viaje en dos tramos que no se tocan y resuelves cada uno por separado.
- **Programación dinámica**: los tramos **se repiten** entre distintas rutas; resuelves cada tramo **una sola vez** y reutilizas la respuesta.`,
    formal: R`
**Cómo elegir** (diapositiva 9):

- ¿Los subproblemas son **independientes**? → **Divide y vencerás** (merge sort, quicksort).
- ¿Los subproblemas se **solapan**? → **Programación dinámica** (Fibonacci, mochila).
- ¿Las decisiones **locales** dan el óptimo? → **Greedy**. Si no, **backtracking** o **DP**.

| Paradigma | Idea | Ejemplo | Riesgo / costo típico |
|---|---|---|---|
| Fuerza bruta | enumera todos los candidatos y verifica | dos elementos que sumen §S§: todos los pares §O(n²)§ | costoso; TSP §O(n!)§ |
| Backtracking | fuerza bruta + poda de ramas inválidas | N-reinas | explora mucho menos, pero sigue siendo exponencial en el peor caso |
| Greedy | mejor opción *ahora*, sin reconsiderar | cambio de monedas canónico | **no siempre da el óptimo** |
| Divide y vencerás | dividir, vencer, combinar | merge sort, quicksort, búsqueda binaria | requiere subproblemas independientes |
| Programación dinámica | resolver una vez cada subproblema solapado y guardarlo | Fibonacci, mochila 0/1, cambio de moneda | memoria para la tabla |

**Síntesis de la clase:** (1) la recursión ingenua con subproblemas solapados es exponencial; la memoización la vuelve lineal; (2) divide y vencerás: subproblemas independientes; DP: solapados; (3) greedy es rápido pero no siempre óptimo; la DP explora sin recalcular.`,
    procedimiento: R`
Para **clasificar un problema** (pregunta de análisis de la clase):

1. Plantea el problema como **decisiones o subproblemas** (¿qué se decide en cada paso?).
2. **¿Los subproblemas se repiten** (mismos argumentos aparecen varias veces)? → **DP**.
3. **¿Son disjuntos** (cada mitad se resuelve sin mirar la otra)? → **divide y vencerás**.
4. **¿Una decisión local nunca se lamenta** (se puede demostrar o es un sistema canónico)? → **greedy**.
5. **¿Hay restricciones que permiten descartar ramas** temprano? → **backtracking**.
6. Si nada de lo anterior aplica, **fuerza bruta** (y estima su costo para saber si es viable).`,
    codigo: {
      titulo: 'El mismo problema (monedas {1, 3, 4} para formar 6) con tres paradigmas',
      src: R`
llamadas = [0]

def monedas_fb(monedas, V):                 # fuerza bruta: prueba todas las combinaciones
    llamadas[0] += 1
    if V == 0:
        return 0
    mejor = float('inf')
    for c in monedas:
        if c <= V:
            mejor = min(mejor, 1 + monedas_fb(monedas, V - c))
    return mejor

def monedas_greedy(monedas, V):             # greedy: siempre la moneda mayor que quepa
    usadas = []
    for c in sorted(monedas, reverse=True):
        while V >= c:
            V -= c
            usadas.append(c)
    return usadas

def min_monedas(monedas, V):                # programación dinámica bottom-up
    INF = float('inf')
    dp = [0] + [INF] * V
    for v in range(1, V + 1):
        for c in monedas:
            if c <= v and dp[v - c] + 1 < dp[v]:
                dp[v] = dp[v - c] + 1
    return dp[V] if dp[V] != INF else -1

print("fuerza bruta:", monedas_fb([1, 3, 4], 6), "monedas | llamadas:", llamadas[0])
g = monedas_greedy([1, 3, 4], 6)
print("greedy:", g, "->", len(g), "monedas")
print("DP:", min_monedas([1, 3, 4], 6), "monedas")
`,
      esperado: 'fuerza bruta: 2 monedas | llamadas: 24\ngreedy: [4, 1, 1] -> 3 monedas\nDP: 2 monedas',
      nota: 'Greedy da 3 monedas (4+1+1) pero el óptimo es 2 (3+3): **el óptimo local no siempre es el global**. La fuerza bruta acierta pero hace 24 llamadas para un valor tan pequeño; la DP acierta sin recalcular.'
    },
    ejemplo: R`
**Pregunta de análisis (1) de la clase:** ¿qué paradigma usarías y por qué?

| Problema | Paradigma | Justificación |
|---|---|---|
| Ordenar un arreglo grande partiendo por la mitad | **Divide y vencerás** | dividir en dos mitades **independientes**, ordenar cada una y combinar (merge sort) |
| Camino más corto tomando siempre la arista más barata disponible | **Greedy** | elige el óptimo local en cada paso (cuidado: solo es correcto si el problema tiene subestructura greedy, p. ej. pesos no negativos en Dijkstra) |
| Contar de cuántas formas se sube una escalera de §n§ pasos dando 1 o 2 | **Programación dinámica** | §f(n) = f(n−1) + f(n−2)§: los subproblemas se **solapan** |
| Todas las formas de colocar 8 reinas sin que se ataquen | **Backtracking** | se coloca una reina por fila y se **abandona** la rama en cuanto dos se atacan |

**Boleto de salida de la clase:** escribe la señal que te dice «aquí va DP» (**subproblemas que se repiten**; la recursión ingenua es exponencial por recalcular) y la que dice «aquí va divide y vencerás» (**subproblemas independientes**: las mitades no se comparten).

**Verificación formativa:** diferenciar divide y vencerás de DP con un ejemplo de cada uno → merge sort (mitades independientes) frente a Fibonacci/mochila (subproblemas solapados).`,
    complejidad: R`
- **Fuerza bruta**: depende del espacio de candidatos: pares §O(n²)§, subconjuntos §O(2ⁿ)§, permutaciones §O(n!)§.
- **Backtracking**: en el peor caso igual que la fuerza bruta, pero la poda suele reducir mucho el trabajo real (N-reinas con §N = 8§: 2 057 nodos frente a §8⁸ = 16 777 216§ colocaciones).
- **Greedy**: casi siempre §O(n log n)§ (ordenar) o §O(n)§; muy rápido.
- **Divide y vencerás**: típicamente §O(n log n)§ (merge sort) o §O(log n)§ (búsqueda binaria).
- **Programación dinámica**: (número de subproblemas) × (trabajo por subproblema); Fibonacci §O(n)§, cambio de moneda §O(V·|monedas|)§.
- **Criterio de elección**: el paradigma no cambia la dificultad del problema; cambia **cuánto de ese espacio de soluciones se explora**.`,
    errores: R`
- **Confundir divide y vencerás (subproblemas independientes) con DP (subproblemas solapados).**
- **Asumir que greedy siempre da el óptimo**: solo funciona en problemas con subestructura greedy (p. ej. monedas {1, 3, 4} y valor 6 lo desmiente).
- **Usar recursión ingenua donde hay subproblemas solapados**: costo exponencial evitable.
- **Poner un caché mutable por defecto** (§def f(n, cache={})§): se comparte entre llamadas.
- **Recursión muy profunda en Python**: el límite por defecto (~1000) provoca error; a veces conviene iterar.
- **Olvidar el caso base** de la recursión: recursión infinita y §RecursionError§.`,
    preguntas: [
      ['Clasifica el paradigma: (1) ordenar partiendo por la mitad; (2) camino más corto tomando la arista más barata; (3) formas de subir una escalera con pasos de 1 o 2; (4) colocar 8 reinas sin ataques.', '(1) Divide y vencerás; (2) greedy; (3) programación dinámica; (4) backtracking. Justificación: mitades independientes; óptimo local; subproblemas solapados; poda al detectar que dos reinas se atacan.'],
      ['Diferencia divide y vencerás de programación dinámica con un ejemplo de cada uno.', 'Divide y vencerás: subproblemas **independientes** (merge sort: cada mitad se ordena sin mirar la otra). DP: subproblemas **solapados** que se resuelven una vez y se reutilizan (Fibonacci, mochila, cambio de moneda).'],
      ['Da un caso donde greedy falle y explica por qué.', 'Monedas §{1, 3, 4}§ y objetivo 6: greedy toma 4 + 1 + 1 = 3 monedas, pero 3 + 3 = 2 es mejor. Falla porque la decisión local (la moneda mayor) no lleva al óptimo global: el problema no tiene subestructura greedy.'],
      ['¿Qué señal te dice «aquí va DP»?', 'Que la recursión natural **recalcula los mismos subproblemas** (árbol de llamadas con nodos repetidos) y el problema tiene subestructura óptima; guardar los resultados (memoización o tabla) lo reduce de exponencial a polinomial.']
    ],
    resumen: R`
- Cinco paradigmas: **fuerza bruta** (todo), **backtracking** (poda), **greedy** (óptimo local), **divide y vencerás** (independientes), **DP** (solapados).
- Elegir: independientes → D&C; solapados → DP; decisiones locales óptimas → greedy; si no, backtracking o DP.
- **Greedy no siempre es óptimo** ({1,3,4}, 6 → 4+1+1 frente a 3+3).
- Recursión ingenua + subproblemas solapados = exponencial; memoización/DP lo arregla.`
  });

  B.tema({
    id: 'pd-fb-bt', area: 'pd', titulo: 'Fuerza bruta y backtracking', fuente: 'S5-C2 · diap. 10, 16', nivel: 3, comp: true,
    conceptos: ['pd_fb', 'pd_bt'], interactivo: [],
    definicion: R`
**Fuerza bruta**: enumera **todas** las soluciones candidatas y verifica cuáles cumplen. Es simple pero costosa. Ejemplo: para hallar dos elementos que sumen §S§, probar **todos los pares**: §O(n²)§.

**Backtracking** (vuelta atrás): es una fuerza bruta que **poda ramas inválidas** tan pronto como se detectan. Ejemplo: **N-reinas** — se coloca una reina por fila y se abandona la rama en cuanto dos reinas se atacan.`,
    intuicion: R`
Fuerza bruta es probar **todas las combinaciones de un candado** de cuatro dígitos (10 000). Backtracking es probar combinaciones pero **parar apenas notas que un dígito ya no puede ser** (por ejemplo, sabes que el primero es 7).

En las N-reinas, si ya pusiste dos reinas que se atacan, **no tiene sentido** colocar las demás: toda la rama que cuelga de esa decisión es inválida. Podarla evita explorar miles de tableros que **seguro** no son solución. En el diagrama de la clase el backtracking corta (en rojo) ramas que ya violan una restricción: explora mucho menos.`,
    formal: R`
- **Espacio de búsqueda**: el conjunto de todos los candidatos. Fuerza bruta recorre **todo** el espacio.
- **Backtracking** construye la solución **paso a paso** (un árbol de decisiones) y en cada paso:
  1. comprueba si la solución parcial **ya viola** una restricción;
  2. si la viola, **retrocede** (poda esa rama);
  3. si no, continúa con la siguiente decisión.
- El backtracking **no cambia el peor caso** (sigue siendo exponencial), pero en la práctica visita muchos menos nodos.
- **Esquema general:**

~~~
resolver(solucion_parcial):
    si solucion_parcial es completa: registrarla; volver
    para cada opción posible:
        si la opción es válida (no viola restricciones):
            añadirla; resolver(...); quitarla      # deshacer = "vuelta atrás"
~~~`,
    procedimiento: R`
Para resolver con **backtracking** (ejemplo N-reinas):

1. **Modela las decisiones**: una decisión por fila (¿en qué columna va la reina?).
2. **Define la condición de «segura»**: ninguna reina en la misma columna ni en la misma diagonal (§|col₁ − col₂| = |fila₁ − fila₂|§).
3. **Recursión**: si ya llenaste todas las filas, cuenta una solución; si no, prueba cada columna **segura** de la fila actual.
4. **Poda**: no llames recursivamente con columnas inseguras.
5. **Deshacer**: como pasas una copia de la solución parcial (o quitas la última decisión), «vuelves atrás» automáticamente.
6. Compara con la fuerza bruta para ver cuánto ahorra la poda.`,
    codigo: [
      {
        titulo: 'Fuerza bruta: dos elementos que sumen S (todos los pares, O(n²))',
        src: R`
def dos_suman(v, S):
    comparaciones = 0
    for i in range(len(v)):
        for j in range(i + 1, len(v)):
            comparaciones += 1
            if v[i] + v[j] == S:
                return (v[i], v[j]), comparaciones
    return None, comparaciones

print(dos_suman([8, 3, 11, 5, 9, 1, 7], 12))     # encuentra un par
print(dos_suman([8, 3, 11, 5, 9, 1, 7], 100))    # no hay: prueba los 21 pares
`,
        esperado: '((3, 9), 9)\n(None, 21)'
      },
      {
        titulo: 'N-reinas: fuerza bruta (todos los tableros) frente a backtracking (con poda)',
        src: R`
def reinas_fb(n):
    total, validas = [0], [0]
    def rec(fila, cols):
        if fila == n:
            total[0] += 1
            ok = True
            for i in range(n):
                for j in range(i + 1, n):
                    if cols[i] == cols[j] or abs(cols[i] - cols[j]) == j - i:
                        ok = False
            if ok:
                validas[0] += 1
            return
        for c in range(n):
            rec(fila + 1, cols + [c])
    rec(0, [])
    return validas[0], total[0]

def reinas_bt(n):
    nodos, soluciones = [0], [0]
    def segura(cols, c):
        fila = len(cols)
        for i in range(fila):
            if cols[i] == c or abs(cols[i] - c) == fila - i:
                return False
        return True
    def rec(cols):
        nodos[0] += 1
        if len(cols) == n:
            soluciones[0] += 1
            return
        for c in range(n):
            if segura(cols, c):          # poda: solo se continúa con columnas seguras
                rec(cols + [c])
    rec([])
    return soluciones[0], nodos[0]

for n in [4, 5]:
    print(n, "reinas -> fuerza bruta (soluciones, tableros):", reinas_fb(n), "| backtracking (soluciones, nodos):", reinas_bt(n))
for n in [6, 8]:                       # la fuerza bruta de estos tamaños ya es demasiado lenta: se muestra solo n^n
    print(n, "reinas -> tableros posibles:", n ** n, "| backtracking (soluciones, nodos):", reinas_bt(n))
`,
        esperado: '4 reinas -> fuerza bruta (soluciones, tableros): (2, 256) | backtracking (soluciones, nodos): (2, 17)\n5 reinas -> fuerza bruta (soluciones, tableros): (10, 3125) | backtracking (soluciones, nodos): (10, 54)\n6 reinas -> tableros posibles: 46656 | backtracking (soluciones, nodos): (4, 153)\n8 reinas -> tableros posibles: 16777216 | backtracking (soluciones, nodos): (92, 2057)'
      }
    ],
    ejemplo: R`
**N-reinas con §N = 4§** (columnas 0-3, una reina por fila):

1. Fila 0: reina en columna 0.
2. Fila 1: columnas 0 (misma columna) y 1 (diagonal) **no son seguras**; la columna 2 sí → reina en (1, 2).
3. Fila 2: ninguna columna es segura (las columnas 0 y 2 repiten columna con una reina; las 1 y 3 quedan en diagonal con la reina de la fila 1) → **retrocede** a la fila 1 y prueba la columna 3.
4. Sigue hasta encontrar la solución §[1, 3, 0, 2]§ (y su simétrica §[2, 0, 3, 1]§): **2 soluciones**.

**Comparación (código de arriba):**

| N | soluciones | tableros que revisa la fuerza bruta (§Nᴺ§) | nodos del backtracking |
|---|---|---|---|
| 4 | 2 | 256 | 17 |
| 5 | 10 | 3 125 | 54 |
| 6 | 4 | 46 656 | 153 |
| 8 | 92 | 16 777 216 | 2 057 |

La poda reduce el trabajo **en varios órdenes de magnitud** conforme crece §N§.

**Dos que sumen §S§ (fuerza bruta):** con 7 elementos hay §7·6/2 = 21§ pares; el algoritmo recorre todos si no encuentra la suma. Para §n§ elementos son §n(n−1)/2 = O(n²)§ comparaciones.`,
    complejidad: R`
- **Pares (fuerza bruta)**: §n(n−1)/2§ comparaciones en el peor caso ⇒ **§O(n²)§** (respecto de §n = len(v)§, peor caso).
- **Subconjuntos**: §2ⁿ§ candidatos ⇒ §O(2ⁿ)§. **Permutaciones**: §n!§ candidatos ⇒ §O(n!)§ (TSP).
- **N-reinas, fuerza bruta**: §Nᴺ§ tableros (una reina por fila, cualquier columna).
- **N-reinas, backtracking**: el peor caso sigue siendo exponencial, pero la poda reduce drásticamente el trabajo medido (2 057 nodos para §N = 8§).
- **Espacio de backtracking**: la profundidad de la recursión (§O(N)§ en N-reinas), porque solo se guarda la solución parcial.
- Regla: el backtracking mejora **constantes enormes**, no necesariamente el orden asintótico del peor caso.`,
    errores: R`
- **Pensar que backtracking siempre es polinomial**: la poda ayuda, pero el peor caso sigue siendo exponencial.
- **Olvidar deshacer la decisión** al retroceder (o no copiar la lista parcial): las ramas se contaminan unas a otras.
- **Podar demasiado tarde** (verificar solo al final): eso es fuerza bruta disfrazada.
- **No verificar las diagonales** en N-reinas: la condición es §|col₁ − col₂| = |fila₁ − fila₂|§.
- **Elegir fuerza bruta sin estimar el costo**: para §n = 15§ ciudades en el TSP serían §14! ≈ 8,7 × 10¹⁰§ rutas.
- **Confundir backtracking con greedy**: el greedy **nunca retrocede**; el backtracking sí.`,
    preguntas: [
      ['¿Qué es fuerza bruta? Da un ejemplo y su complejidad.', 'Enumerar todas las soluciones candidatas y verificar cuáles cumplen. Ejemplo: dos elementos que sumen §S§ probando todos los pares: §O(n²)§.'],
      ['¿En qué se diferencia el backtracking de la fuerza bruta?', 'El backtracking **poda** las ramas inválidas apenas detecta que violan una restricción (N-reinas: se abandona cuando dos reinas se atacan), así que explora mucho menos espacio de búsqueda.'],
      ['¿Cuántos nodos visita el backtracking para 8 reinas y cuántas soluciones hay?', '2 057 nodos y 92 soluciones (frente a §8⁸ = 16 777 216§ tableros de la fuerza bruta).'],
      ['¿El backtracking mejora el peor caso asintótico? Justifica.', 'No necesariamente: en el peor caso podría explorar casi todo el espacio y seguiría siendo exponencial; pero con restricciones fuertes la poda reduce enormemente el trabajo real.']
    ],
    resumen: R`
- **Fuerza bruta** = enumerar todo y verificar; pares §O(n²)§, subconjuntos §O(2ⁿ)§, permutaciones §O(n!)§.
- **Backtracking** = fuerza bruta + **poda** al detectar ramas inválidas (vuelta atrás).
- N-reinas: una reina por fila, se abandona la rama cuando dos se atacan.
- 8 reinas: 92 soluciones, 2 057 nodos (frente a 16,7 millones de tableros).
- El peor caso sigue siendo exponencial; la ganancia está en las constantes.`
  });

  B.tema({
    id: 'pd-greedy', area: 'pd', titulo: 'Greedy: el óptimo local', fuente: 'S5-C2 · diap. 11, 19', nivel: 3, comp: true,
    conceptos: ['pd_greedy'], interactivo: [],
    definicion: R`
**Greedy** (voraz): en cada paso elige la opción que **parece mejor ahora**, sin reconsiderar. Es **rápido**, pero **no siempre da el óptimo global**.

- **Cuándo funciona**: dar cambio con monedas de un sistema **canónico** (p. ej. 1, 5, 10, 25): tomar siempre la mayor moneda que quepa.
- **Cuándo falla**: con monedas §{1, 3, 4}§ y objetivo 6, greedy toma §4 + 1 + 1§ = 3 monedas, pero §3 + 3§ = 2 es mejor.`,
    intuicion: R`
Es como elegir siempre la fila más corta en el supermercado: en cada momento la decisión parece la mejor… pero a veces la fila corta tiene a alguien con un carrito problemático. **Una decisión que parece óptima hoy puede cerrar caminos mejores mañana**, y greedy **nunca mira atrás**.

Funciona cuando el problema tiene «subestructura greedy»: la mejor decisión local siempre es parte de una solución óptima. Si eso no se cumple, hay que explorar más (backtracking) o resolver todos los subproblemas (DP). Por eso muchos problemas de optimización requieren **programación dinámica y no greedy**.`,
    formal: R`
- **Estrategia**: en cada paso, tomar la opción localmente óptima; no se deshacen decisiones.
- **Cuándo es correcto**: si el problema tiene la **propiedad de elección greedy** (existe una solución óptima que contiene la decisión greedy) y **subestructura óptima**. En un sistema de monedas se cumple para los sistemas **canónicos**.
- **Costo típico**: §O(n log n)§ (ordenar las opciones) + §O(n)§ de recorrido.
- **Contraejemplo clásico de la clase:** monedas §{1, 3, 4}§, objetivo 6. Greedy → 4+1+1 (3 monedas); óptimo → 3+3 (2 monedas). Los primeros valores donde greedy falla son 6, 10, 14, 18, 22…

[comp]
Hay otros problemas donde greedy **sí** es correcto y se demuestra (selección de actividades, árboles de expansión mínima, Dijkstra con pesos no negativos). En este curso lo esencial es saber que **hay que justificar** por qué greedy da el óptimo; si no hay justificación, desconfía.
[/comp]`,
    procedimiento: R`
Para **aplicar y verificar** un algoritmo greedy:

1. Define **la opción localmente mejor** (la moneda mayor que quepa).
2. Ordena las opciones por ese criterio.
3. Repite: toma la mejor opción **compatible** con lo que ya llevas.
4. Termina cuando completes la solución.
5. **Verifica con contraejemplos**: pruébalo con casos pequeños y compáralo con la solución óptima (fuerza bruta o DP).
6. Si encuentras un contraejemplo, cambia a **DP** (o backtracking).`,
    codigo: {
      titulo: 'Greedy frente a la solución óptima (DP): ¿dónde falla?',
      src: R`
def optimo(monedas, V):                      # DP bottom-up (S5-C2, d.14)
    INF = float('inf')
    dp = [0] + [INF] * V
    for v in range(1, V + 1):
        for c in monedas:
            if c <= v and dp[v - c] + 1 < dp[v]:
                dp[v] = dp[v - c] + 1
    return dp[V]

def greedy(monedas, V):                      # siempre la moneda mayor que quepa
    n = 0
    for c in sorted(monedas, reverse=True):
        n += V // c
        V = V % c
    return n

for sistema in ([1, 5, 10, 25], [1, 3, 4]):
    fallos = [V for V in range(1, 101) if greedy(sistema, V) != optimo(sistema, V)]
    print(sistema, "primeros fallos:", fallos[:5], "| total de fallos hasta 100:", len(fallos))
`,
      esperado: '[1, 5, 10, 25] primeros fallos: [] | total de fallos hasta 100: 0\n[1, 3, 4] primeros fallos: [6, 10, 14, 18, 22] | total de fallos hasta 100: 24'
    },
    ejemplo: R`
**Sistema canónico {1, 5, 10, 25}, valor 63:** greedy toma 25, 25 (50), 10 (60), 1, 1, 1 → **6 monedas**, que es el óptimo (el código lo confirma: no hay ningún fallo hasta 100).

**Sistema {1, 3, 4}, valor 6:**

| Método | Monedas | Resultado |
|---|---|---|
| Greedy | 4 + 1 + 1 | **3** |
| Óptimo (DP) | 3 + 3 | **2** |

Greedy elige 4 porque es la mayor que cabe, y eso lo condena: después solo quedan monedas de 1. El óptimo necesita **renunciar** a la moneda mayor.

**Problema de la clase (camino más corto):** «tomar siempre la arista más barata disponible» es una estrategia greedy. Será correcta solo si el problema tiene la estructura adecuada (por ejemplo, Dijkstra con pesos no negativos); con aristas arbitrarias puede dar un camino subóptimo.`,
    complejidad: R`
- **Greedy de monedas**: ordenar las §m§ denominaciones §O(m log m)§ y recorrerlas §O(m)§ ⇒ **§O(m log m)§**, independiente del valor §V§ (con el §//§ y §%§ de arriba).
- **DP de monedas**: §O(V · m)§ tiempo y §O(V)§ espacio.
- Compromiso: greedy es **mucho más rápido** pero **solo correcto en sistemas canónicos**; DP es correcto siempre pero más lento y con memoria extra.
- **No hay una prueba general**: cada algoritmo greedy exige su propia demostración de optimalidad (o un contraejemplo).`,
    errores: R`
- **Asumir que greedy siempre da el óptimo**: solo funciona en problemas con subestructura greedy.
- **Dar por bueno el greedy tras probar un par de casos**: con {1, 3, 4} funciona para 1-5, 7-9… y falla en 6, 10, 14…
- **Confundir greedy con backtracking**: greedy **no retrocede nunca**.
- **Usar greedy en problemas de optimización «tipo mochila»**: la mochila 0/1 requiere DP.
- **Olvidar el costo de ordenar** (§O(n log n)§) al analizar un greedy.`,
    preguntas: [
      ['Da un caso donde greedy falle y explica por qué.', 'Monedas §{1, 3, 4}§ y objetivo 6: greedy → 4+1+1 (3 monedas); óptimo → 3+3 (2 monedas). Falla porque tomar la mayor moneda disponible (óptimo local) impide la mejor combinación global.'],
      ['¿Cuándo funciona greedy para el cambio de monedas?', 'Con sistemas de monedas **canónicos** (por ejemplo 1, 5, 10, 25): tomar siempre la mayor moneda que quepa da el óptimo.'],
      ['¿Por qué muchos problemas de optimización requieren DP y no greedy?', 'Porque la decisión localmente óptima puede no llevar al óptimo global; la DP explora todas las combinaciones relevantes sin recalcular, gracias a su tabla de subproblemas.'],
      ['¿Qué diferencia a greedy de backtracking?', 'Greedy elige una opción y **no reconsidera**; backtracking prueba opciones y **retrocede** cuando una rama no sirve.']
    ],
    resumen: R`
- **Greedy** = elegir el **óptimo local** en cada paso, **sin reconsiderar**.
- Rápido (§O(n log n)§ típico) pero **no siempre óptimo**.
- Correcto en monedas **canónicas**; **falla** con {1,3,4} y V = 6 (4+1+1 frente a 3+3).
- Si hay un contraejemplo → **DP** (o backtracking).
- Cada algoritmo greedy necesita su propia justificación de optimalidad.`
  });

  B.tema({
    id: 'pd-dyc', area: 'pd', titulo: 'Divide y vencerás', fuente: 'S5-C2 · diap. 9, 12', nivel: 3, comp: true,
    conceptos: ['pd_dyc'], interactivo: [],
    definicion: R`
**Divide y vencerás** resuelve un problema en **tres pasos**:

1. **Dividir**: partir el problema en subproblemas **independientes**.
2. **Vencer**: resolver cada subproblema (recursivamente).
3. **Combinar**: unir las soluciones parciales en la solución final.

Ejemplos de la clase: **merge sort** y **quicksort** (semana 10) y **búsqueda binaria** (semana 9).`,
    intuicion: R`
Para ordenar una baraja enorme, la partes en dos montones, le pides a dos amigos que ordenen cada uno el suyo (sin hablar entre ellos: son **independientes**) y luego **mezclas** los dos montones ordenados. Cada amigo hace lo mismo con su mitad hasta que el montón tiene una sola carta (caso base).

La clave: los subproblemas **no se comparten**, así que no hay nada que memorizar. Si compartieran subproblemas (como las llamadas repetidas de Fibonacci), ya no sería divide y vencerás sino **programación dinámica**.`,
    formal: R`
- **Estructura**: caso base (problema pequeño) + división en subproblemas independientes + combinación.
- **Independencia**: los subproblemas **no se solapan**; por eso no hace falta caché.
- **Costos típicos** (recurrencias; ver [[cx-reglas]]):

| Algoritmo | Recurrencia | Costo |
|---|---|---|
| Búsqueda binaria | §T(n) = T(n/2) + O(1)§ | §O(log n)§ |
| Merge sort | §T(n) = 2T(n/2) + O(n)§ | §O(n log n)§ |

[comp]
**Por qué merge sort es §n log n§.** El árbol de llamadas tiene §log₂ n§ niveles (se divide a la mitad cada vez); en cada nivel la mezcla recorre en total §n§ elementos ⇒ §n × log₂ n§. Para entrada ordenada al revés, §n = 8§ hace 12 comparaciones, §n = 16§ hace 32 y §n = 1024§ hace 5 120 (= §n/2 · log₂ n§).
[/comp]

**Cuándo elegirlo:** cuando el problema se parte en subproblemas independientes del mismo tipo y existe una forma barata de **combinar**.`,
    procedimiento: R`
Para diseñar un algoritmo de divide y vencerás:

1. **Caso base**: ¿cuándo el problema es tan pequeño que se resuelve directo? (lista de 0 o 1 elementos).
2. **Dividir**: ¿cómo se parte en subproblemas de tamaño menor e **independientes**? (mitad izquierda y derecha).
3. **Vencer**: llamar recursivamente a cada subproblema.
4. **Combinar**: ¿cómo se unen los resultados? (merge sort: **mezclar** dos listas ordenadas).
5. **Analiza**: escribe la recurrencia y resuélvela por niveles (trabajo por nivel × niveles).`,
    codigo: [
      {
        titulo: 'Merge sort: dividir, vencer y combinar (contando comparaciones)',
        src: R`
def mezclar(a, b, c):                  # COMBINAR: dos listas ordenadas -> una lista ordenada
    r = []
    i = j = 0
    while i < len(a) and j < len(b):
        c[0] += 1                      # una comparación
        if a[i] <= b[j]:
            r.append(a[i])
            i += 1
        else:
            r.append(b[j])
            j += 1
    return r + a[i:] + b[j:]

def merge_sort(v, c):
    if len(v) <= 1:                    # caso base
        return v
    m = len(v) // 2
    izq = merge_sort(v[:m], c)         # DIVIDIR y VENCER la mitad izquierda
    der = merge_sort(v[m:], c)         # ... y la mitad derecha (independientes)
    return mezclar(izq, der, c)

c = [0]
print(merge_sort([38, 27, 43, 3, 9, 82, 10, 5], c), c[0])
for n in [8, 16, 1024]:
    c = [0]
    merge_sort(list(range(n, 0, -1)), c)
    print(n, c[0])
`,
        esperado: '[3, 5, 9, 10, 27, 38, 43, 82] 17\n8 12\n16 32\n1024 5120'
      },
      {
        titulo: 'Búsqueda binaria: se descarta la mitad en cada paso (O(log n))',
        src: R`
def busqueda_binaria(v, x):
    lo, hi, pasos = 0, len(v) - 1, 0
    while lo <= hi:
        pasos += 1
        m = (lo + hi) // 2
        if v[m] == x:
            return m, pasos
        if v[m] < x:
            lo = m + 1                 # descartar la mitad izquierda
        else:
            hi = m - 1                 # descartar la mitad derecha
    return -1, pasos

v = list(range(0, 2000, 2))            # 1000 valores pares, ordenados
print(busqueda_binaria(v, 1000), busqueda_binaria(v, 1), len(v))
`,
        esperado: '(500, 9) (-1, 10) 1000'
      }
    ],
    ejemplo: R`
**Merge sort de §[38, 27, 43, 3]§ (4 elementos):**

~~~
                [38, 27, 43, 3]
               /               \
         [38, 27]             [43, 3]          <- dividir
         /     \              /     \
      [38]    [27]         [43]     [3]        <- caso base
         \     /              \     /
        [27, 38]             [3, 43]           <- combinar (mezclar)
               \               /
              [3, 27, 38, 43]                  <- combinar
~~~

Niveles: §log₂ 4 = 2§ de divisiones; en cada nivel de mezcla se recorren los 4 elementos.

**Búsqueda binaria en 1000 elementos:** como mucho §⌊log₂ 1000⌋ + 1 = 10§ pasos (el código de arriba: 9 pasos para hallar §1000§ y 10 para concluir que §1§ no está). Una búsqueda secuencial haría hasta 1000.

**Diferencia con DP:** en merge sort las dos mitades **nunca** se vuelven a necesitar; en Fibonacci, §fib(3)§ se pide una y otra vez.`,
    complejidad: R`
- **Búsqueda binaria**: cada paso descarta la mitad: §n → n/2 → n/4 → … → 1§ ⇒ **§O(log n)§** en tiempo (peor caso), §O(1)§ de espacio (versión iterativa).
- **Merge sort**: **§O(n log n)§** en el mejor, peor y promedio (siempre divide por la mitad). **§O(n)§** de espacio extra (el arreglo auxiliar de mezcla).
- **Quicksort** (pivote §v[0]§): §O(n log n)§ promedio, **§O(n²)§** en el peor caso (datos ya ordenados); en el sitio gasta §O(log n)§ de pila ([[cx-espacial]]).
- Justificación general: **(niveles de la recursión) × (trabajo por nivel)** = §log₂ n × n§ para merge sort.
- Para la entrada ordenada al revés, el código confirma §n/2 · log₂ n§ comparaciones (12, 32, 5 120).`,
    errores: R`
- **Confundir divide y vencerás con DP**: aquí los subproblemas son **independientes**; en DP **se solapan**.
- **Olvidar el costo de combinar**: dividir es barato, pero mezclar cuesta §O(n)§ y determina el total.
- **Dividir sin garantizar tamaños menores** (caso base mal puesto): recursión infinita.
- **Hacer copias innecesarias** al dividir (en Python §v[:m]§ copia): suma §O(n)§ por nivel, aceptable aquí pero hay que tenerlo en cuenta.
- **Aplicar búsqueda binaria a datos no ordenados**: exige un arreglo ordenado (y contiguo).
- **Creer que quicksort siempre es §O(n log n)§**: con pivote malo y datos ordenados es §O(n²)§.`,
    preguntas: [
      ['¿Cuáles son los tres pasos de divide y vencerás?', '**Dividir** el problema en subproblemas independientes, **vencer** (resolver cada uno recursivamente) y **combinar** las soluciones parciales en la final.'],
      ['¿Por qué merge sort es §O(n log n)§?', 'Hay §log₂ n§ niveles de división y en cada nivel la mezcla recorre en total §n§ elementos: §n · log₂ n§. Recurrencia §T(n) = 2T(n/2) + O(n)§.'],
      ['¿Por qué la búsqueda binaria es §O(log n)§?', 'Porque en cada paso descarta la mitad del arreglo ordenado: §n → n/2 → … → 1§ tarda §log₂ n§ pasos.'],
      ['Diferencia divide y vencerás de programación dinámica con un ejemplo de cada uno.', 'D&C: subproblemas independientes (merge sort). DP: subproblemas solapados que se resuelven una vez (Fibonacci con memoización, mochila).']
    ],
    resumen: R`
- **Dividir → vencer → combinar**; subproblemas **independientes**.
- Ejemplos: merge sort, quicksort (semana 10), búsqueda binaria (semana 9).
- Merge sort §O(n log n)§ (§O(n)§ de espacio); búsqueda binaria §O(log n)§.
- Costo = (niveles) × (trabajo por nivel).
- Si los subproblemas se **repiten**, usa DP, no divide y vencerás.`
  });

  B.tema({
    id: 'pd-dp', area: 'pd', titulo: 'Programación dinámica: top-down, bottom-up y cambio de moneda', fuente: 'S5-C2 · diap. 13-14, 18, 21', nivel: 3, comp: true,
    conceptos: ['pd_dp', 'pd_memo', 'pd_coin', 'pd_escalera'], interactivo: [],
    definicion: R`
La **programación dinámica (DP)** (clase: *coin change: greedy falla, DP acierta*) se aplica cuando los subproblemas **se solapan**: a diferencia de divide y vencerás, aquí los subproblemas **se repiten**; se resuelven **una vez** y se **reutilizan**. Tiene dos enfoques:

- **Top-down (memoización)**: recursión natural + caché. Se calcula §Fₙ§ pidiendo §Fₙ₋₁§, §Fₙ₋₂§ y guardando resultados.
- **Bottom-up (tabulación)**: iterativo; se calcula §F₀, F₁, F₂, …§ en orden, guardando en una tabla, hasta §Fₙ§.`,
    intuicion: R`
Cuando haces cuentas del mes, no vuelves a sumar desde el enero de hace tres años cada vez: **guardas subtotales**. DP es esa disciplina: cada subproblema se resuelve una vez y su respuesta queda en una tabla.

En **cambio de moneda**, «¿cuál es el mínimo de monedas para formar §v§?» se responde mirando «¿cuál es el mínimo para §v − c§?» para cada moneda §c§ y sumando 1. La tabla se llena de 1 hasta §V§, y cuando llegas al valor objetivo ya tienes todo lo que necesitabas, **sin recalcular nada**.`,
    formal: R`
- **Propiedades necesarias**: **subestructura óptima** (la solución óptima se construye con óptimos de subproblemas) y **subproblemas solapados**.
- **Top-down**: recursión + caché; solo calcula los subproblemas **necesarios**; usa pila de recursión.
- **Bottom-up**: orden explícito (de los casos base hacia el objetivo); sin recursión; permite reducir memoria (guardar solo lo necesario).
- **Costo** = (número de subproblemas) × (trabajo por subproblema).

**Cambio de moneda** (mínimo número de monedas para formar un valor §V§ con denominaciones dadas), bottom-up en §O(V × monedas)§:

~~~
dp[0] = 0
dp[v] = mín sobre las monedas c ≤ v de ( dp[v − c] + 1 )     para v = 1, …, V
respuesta = dp[V]   (si dp[V] = ∞ → imposible → −1)
~~~

**Escalera:** formas de subir §n§ escalones con pasos de 1 o 2: §f(n) = f(n−1) + f(n−2)§, §f(0) = f(1) = 1§ (Fibonacci; ver [[rec-vs-iter]]).`,
    procedimiento: R`
Para resolver un problema con **DP**:

1. **Define el subproblema** y su significado (§dp[v]§ = mínimo de monedas para formar §v§).
2. **Escribe la relación de recurrencia** (cómo se obtiene un subproblema de otros más pequeños).
3. Identifica los **casos base** (§dp[0] = 0§).
4. Elige el enfoque: **top-down** (recursión + caché) o **bottom-up** (ciclo en el orden correcto).
5. **Responde** con el subproblema que corresponde al problema original (§dp[V]§) y maneja el caso «imposible».
6. **Analiza**: subproblemas × trabajo por subproblema; memoria de la tabla (¿se puede reducir?).`,
    codigo: {
      titulo: 'Cambio de moneda por DP bottom-up (S5-C2, d.14) con la tabla completa',
      src: R`
def min_monedas(monedas, V):
    INF = float('inf')
    dp = [0] + [INF] * V               # dp[v] = mínimo de monedas para formar v
    for v in range(1, V + 1):
        for c in monedas:
            if c <= v and dp[v - c] + 1 < dp[v]:
                dp[v] = dp[v - c] + 1
    return dp, (dp[V] if dp[V] != INF else -1)

tabla, resp = min_monedas([1, 3, 4], 6)
print(tabla, "->", resp)               # 2 monedas (3 + 3); greedy habría dado 3
print(min_monedas([5, 7], 3)[1])       # -1: imposible formar 3 con 5 y 7
print(min_monedas([1, 5, 10, 25], 63)[1])
`,
      esperado: '[0, 1, 2, 1, 1, 2, 2] -> 2\n-1\n6'
    },
    ejemplo: R`
**Tabla de §dp§ para monedas §{1, 3, 4}§ y §V = 6§:**

| v | opciones (§dp[v − c] + 1§) | §dp[v]§ |
|---|---|---|
| 0 | caso base | **0** |
| 1 | c=1: dp[0]+1 = 1 | **1** |
| 2 | c=1: dp[1]+1 = 2 | **2** |
| 3 | c=1: 3; c=3: dp[0]+1 = 1 | **1** |
| 4 | c=1: 2; c=3: dp[1]+1 = 2; c=4: dp[0]+1 = 1 | **1** |
| 5 | c=1: dp[4]+1 = 2; c=3: dp[2]+1 = 3; c=4: dp[1]+1 = 2 | **2** |
| 6 | c=1: dp[5]+1 = 3; c=3: dp[3]+1 = 2; c=4: dp[2]+1 = 3 | **2** |

La respuesta §dp[6] = 2§ corresponde a §3 + 3§: la DP «ve» la combinación que greedy se pierde, porque compara **todas** las opciones sin recalcular.

**Escalera con §n = 4§:** §f(0)=1, f(1)=1, f(2)=2, f(3)=3, f(4)=5§ (cinco formas: 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2).

**Actividad de la clase:** escribir la fórmula y el caso base de la escalera; implementarla de forma recursiva ingenua y medir con §n = 35§; agregar memoización y medir de nuevo; escribir la versión bottom-up con §O(1)§ de memoria ([[rec-vs-iter]]).`,
    complejidad: R`
- **Cambio de moneda bottom-up**: §V§ subproblemas × §m§ monedas por subproblema ⇒ **§O(V · m)§** en tiempo y **§O(V)§** en espacio.
- **Fibonacci/escalera con memoización**: §n§ subproblemas × §O(1)§ ⇒ §O(n)§ tiempo; caché + pila ⇒ §O(n)§ espacio. Bottom-up con dos variables: §O(1)§ espacio.
- Justificación: sin DP el árbol de llamadas es exponencial porque repite subproblemas; con DP hay un número **polinomial** de subproblemas distintos y cada uno se resuelve una vez.
- Observación: §O(V · m)§ es **pseudo-polinomial** (depende del **valor** de §V§, no del número de bits de §V§); por eso el cambio de moneda y la mochila siguen siendo NP-difíciles en general ([[pd-clasicos]]).`,
    errores: R`
- **Aplicar DP donde no hay solapamiento** (usa divide y vencerás).
- **Definir mal el subproblema** o su orden de llenado (usar §dp[v − c]§ antes de calcularlo).
- **Olvidar el valor «imposible»** (∞ o −1) y devolver un número falso.
- **Inicializar §dp§ con 0** en vez de ∞ para las mínimas.
- **Pensar que greedy y DP son equivalentes en el cambio de moneda**: greedy falla con {1, 3, 4} y DP no.
- **Caché mutable por defecto** en la versión top-down (§cache={}§).
- **Memoizar sin pasar la caché** en las llamadas recursivas.`,
    preguntas: [
      ['Explica los dos enfoques de programación dinámica.', '**Top-down (memoización)**: recursión natural más una caché que guarda cada resultado. **Bottom-up (tabulación)**: iterativo; se llena una tabla desde los casos base hasta el valor objetivo. Ambos resuelven cada subproblema una sola vez.'],
      ['Escribe la recurrencia del cambio de moneda y su complejidad.', '§dp[0] = 0§; §dp[v] = mín(dp[v − c] + 1)§ para cada moneda §c ≤ v§. Complejidad §O(V · m)§ en tiempo y §O(V)§ en espacio.'],
      ['Con monedas §{1, 3, 4}§ y §V = 6§, ¿cuál es la tabla y la respuesta?', '§dp = [0, 1, 2, 1, 1, 2, 2]§; respuesta **2** (3 + 3). Greedy habría dado 3.'],
      ['¿Qué condiciones debe cumplir un problema para aplicar DP?', 'Subestructura óptima y **subproblemas solapados** (si no se solapan basta divide y vencerás).'],
      ['¿Qué relación hay entre memoización y programación dinámica?', 'La memoización es el enfoque top-down de la DP y su primer paso; la tabulación es el bottom-up.']
    ],
    resumen: R`
- **DP** = subproblemas **solapados** resueltos **una vez** y reutilizados.
- **Top-down** = recursión + caché (memoización); **bottom-up** = tabla en orden (tabulación).
- Cambio de moneda: §dp[v] = mín(dp[v − c] + 1)§, §O(V·m)§ tiempo, §O(V)§ espacio; {1,3,4}, V=6 → **2**.
- Escalera de 1 o 2 pasos: Fibonacci desplazado.
- Siempre: subproblema, recurrencia, casos base, orden, respuesta, análisis.`
  });

  B.tema({
    id: 'pd-clasicos', area: 'pd', titulo: 'Problemas clásicos y NP-difíciles: la conexión con IA', fuente: 'S5-C2 · diap. 16, 21', nivel: 3, comp: true,
    conceptos: ['pd_clasicos', 'pd_np'], interactivo: [],
    definicion: R`
La clase resume cuatro problemas clásicos (del libro de referencia) y el enfoque típico de cada uno:

| Problema | Descripción | Enfoque típico |
|---|---|---|
| **Agente viajero (TSP)** | ruta más corta que visita todas las ciudades | fuerza bruta §O(n!)§; heurísticas |
| **Mochila 0/1** | maximizar valor sin exceder el peso | programación dinámica |
| **N-reinas** | colocar §N§ reinas sin ataques | backtracking |
| **Cambio de moneda** | mínimas monedas para un valor | programación dinámica |

El **TSP** y la **mochila** son **NP-difíciles**: la fuerza bruta es §O(n!)§ o §O(2ⁿ)§, **inviable**. Por eso en la industria se usan **heurísticas y metaheurísticas** (recocido simulado, enjambre), que **sacrifican optimalidad por tiempo**: es el compromiso central de la optimización en IA.`,
    intuicion: R`
Un repartidor con 15 ciudades tiene §14! ≈ 87 000 millones§ rutas posibles (≈ 87 mil millones). Si revisas un millón por segundo, tardas casi **un día**; con 20 ciudades, **miles de años**. No hay computador que arregle eso: el problema **explota** con el tamaño.

Cuando el problema es así de difícil, en vez del mejor recorrido posible buscas **uno muy bueno rápido**: una **heurística**. Aceptas una solución «casi óptima» a cambio de obtenerla en segundos. Entrenar redes neuronales, planificar rutas o asignar recursos en IA se basa en ese compromiso **optimalidad ↔ tiempo**.`,
    formal: R`
- **Mochila 0/1:** dados §n§ objetos con peso §pᵢ§ y valor §vᵢ§ y capacidad §W§, maximizar el valor total sin exceder §W§ (cada objeto se toma o no). **DP** en §O(n · W)§. Por fuerza bruta: §2ⁿ§ subconjuntos.
- **TSP:** visitar todas las ciudades una vez y volver al inicio con distancia mínima. Fuerza bruta: §(n − 1)!§ rutas ⇒ §O(n!)§.
- **N-reinas:** backtracking (ver [[pd-fb-bt]]).
- **Cambio de moneda:** DP en §O(V · m)§ (ver [[pd-dp]]).
- **NP-difícil** (idea de la clase): problemas para los que **no se conoce** un algoritmo eficiente (polinomial) en el caso general; la fuerza bruta es exponencial o factorial.
- **Heurísticas** y **metaheurísticas** (recocido simulado, enjambre de partículas): buscan soluciones **buenas, no necesariamente óptimas**, en tiempo razonable.

[comp]
La DP de la mochila es **pseudo-polinomial**: depende del **valor numérico** de §W§, no del número de bits que lo escriben; eso es compatible con que el problema sea NP-difícil.
[/comp]`,
    procedimiento: R`
Para decidir **cómo atacar** un problema de optimización:

1. **Estima el tamaño del espacio de soluciones** (§n!§, §2ⁿ§, §Nᴺ§…) y si la fuerza bruta es viable para los §n§ reales.
2. ¿Hay **subproblemas solapados** y subestructura óptima? → **DP** (mochila, cambio de moneda).
3. ¿Hay **restricciones que permitan podar**? → **backtracking** (N-reinas).
4. ¿Una **estrategia local** da el óptimo (y se puede justificar)? → **greedy**.
5. Si el problema es **NP-difícil** y §n§ es grande → **heurística o metaheurística**; decide cuánta optimalidad sacrificas por tiempo.
6. **Mide** la calidad de la solución heurística frente a un óptimo conocido en instancias pequeñas.`,
    codigo: [
      {
        titulo: 'Mochila 0/1: DP frente a fuerza bruta (mismo resultado)',
        src: R`
def mochila_dp(pesos, valores, W):                   # DP: O(n * W)
    n = len(pesos)
    tabla = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            tabla[i][w] = tabla[i - 1][w]            # no tomar el objeto i
            if pesos[i - 1] <= w:                    # o tomarlo si cabe
                tabla[i][w] = max(tabla[i][w], tabla[i - 1][w - pesos[i - 1]] + valores[i - 1])
    return tabla[n][W]

def mochila_fb(pesos, valores, W, i=0):              # fuerza bruta: 2^n subconjuntos
    if i == len(pesos):
        return 0
    sin = mochila_fb(pesos, valores, W, i + 1)
    if pesos[i] <= W:
        con = valores[i] + mochila_fb(pesos, valores, W - pesos[i], i + 1)
        return max(sin, con)
    return sin

pesos, valores = [5, 4, 6, 3], [10, 40, 30, 50]
print(mochila_dp(pesos, valores, 10), mochila_fb(pesos, valores, 10))
`,
        esperado: '90 90'
      },
      {
        titulo: 'Agente viajero (5 ciudades): fuerza bruta con las (n−1)! rutas',
        src: R`
D = [[0, 2, 9, 10, 7],
     [2, 0, 6, 4, 3],
     [9, 6, 0, 8, 5],
     [10, 4, 8, 0, 6],
     [7, 3, 5, 6, 0]]
mejor = [10 ** 9, None]
cont = [0]

def tsp(ruta, resto, largo):
    if not resto:                                    # ruta completa: volver a la ciudad 0
        total = largo + D[ruta[-1]][0]
        cont[0] += 1
        if total < mejor[0]:
            mejor[0] = total
            mejor[1] = ruta + [0]
        return
    for c in resto:
        tsp(ruta + [c], [x for x in resto if x != c], largo + D[ruta[-1]][c])

tsp([0], [1, 2, 3, 4], 0)
print("mejor ruta:", mejor[1], "| largo:", mejor[0], "| rutas revisadas:", cont[0])

f = 1
for k in range(2, 15):
    f *= k
print("con 15 ciudades serían", f, "rutas")
`,
        esperado: 'mejor ruta: [0, 1, 3, 2, 4, 0] | largo: 26 | rutas revisadas: 24\ncon 15 ciudades serían 87178291200 rutas'
      }
    ],
    ejemplo: R`
**Mochila 0/1 con capacidad 10:**

| Objeto | Peso | Valor |
|---|---|---|
| A | 5 | 10 |
| B | 4 | 40 |
| C | 6 | 30 |
| D | 3 | 50 |

La mejor combinación es **B + D** (peso 7, valor **90**). Alternativas: B + C (peso 10, valor 70), C + D (peso 9, valor 80), A + B (peso 9, valor 50). El código lo confirma con DP y con fuerza bruta.

**TSP con 5 ciudades:** hay §(5 − 1)! = 24§ rutas; la mejor mide **26** (§0 → 1 → 3 → 2 → 4 → 0§). Con 15 ciudades serían §14! = 87 178 291 200§ rutas: la fuerza bruta es inviable.

**Conexión con IA (mCP41 en la clase):** como TSP y mochila son NP-difíciles, se usan **heurísticas y metaheurísticas** (recocido simulado, enjambre), que sacrifican optimalidad por tiempo. Es el **compromiso central de la optimización en IA**.`,
    complejidad: R`
- **TSP fuerza bruta**: §(n − 1)!§ rutas ⇒ **§O(n!)§**.
- **Mochila 0/1**: fuerza bruta **§O(2ⁿ)§** (cada objeto entra o no); DP **§O(n · W)§** en tiempo y espacio.
- **N-reinas**: backtracking; peor caso exponencial pero la poda reduce el trabajo (92 soluciones para §N = 8§ con 2 057 nodos).
- **Cambio de moneda**: DP **§O(V · m)§**.
- **Crecimiento** (10⁹ op/s): §n = 20§: §20! ≈ 2,4 × 10¹⁸§ operaciones ≈ **77 años**; §2²⁰ ≈ 10⁶§ operaciones ≈ 1 ms. Por eso conviene saber si un problema es «de tipo 2ⁿ» o «de tipo n!».
- **Compromiso de IA**: una heurística da una solución en tiempo polinomial, pero **sin garantía de óptimo**; la fuerza bruta da el óptimo, pero **no escala**.`,
    errores: R`
- **Intentar fuerza bruta en TSP o mochila grandes**: §O(n!)§ y §O(2ⁿ)§ son inviables.
- **Resolver la mochila con greedy** (tomar el de mayor valor/peso) y creer que es óptimo: puede fallar.
- **Confundir NP-difícil con «imposible»**: significa que no se conoce algoritmo eficiente general; hay heurísticas, DP pseudo-polinomial y casos particulares tratables.
- **Decir que DP es siempre polinomial**: la DP de la mochila es §O(n·W)§, que depende del valor de §W§.
- **Olvidar el compromiso optimalidad ↔ tiempo** al justificar una heurística.`,
    preguntas: [
      ['¿Qué enfoque usarías para TSP, mochila 0/1, N-reinas y cambio de moneda?', 'TSP: fuerza bruta §O(n!)§ (o heurísticas); mochila 0/1: programación dinámica; N-reinas: backtracking; cambio de moneda: programación dinámica.'],
      ['¿Por qué se usan heurísticas y metaheurísticas para TSP y mochila?', 'Porque son NP-difíciles: la fuerza bruta es §O(n!)§ o §O(2ⁿ)§ y no escala; las heurísticas (recocido simulado, enjambre) sacrifican optimalidad por tiempo, que es el compromiso central de la optimización en IA.'],
      ['¿Cuántas rutas evalúa la fuerza bruta del TSP con 5 y con 15 ciudades?', '§(n − 1)!§: 24 rutas con 5 ciudades y §14! = 87 178 291 200§ con 15.'],
      ['Da la complejidad de la mochila 0/1 por fuerza bruta y por DP.', 'Fuerza bruta §O(2ⁿ)§; DP §O(n · W)§ (con §W§ la capacidad).']
    ],
    resumen: R`
- **TSP** → fuerza bruta §O(n!)§ / heurísticas. **Mochila 0/1** → DP §O(n·W)§ (fuerza bruta §2ⁿ§). **N-reinas** → backtracking. **Cambio de moneda** → DP.
- TSP y mochila son **NP-difíciles**: la fuerza bruta es inviable.
- En IA: **heurísticas y metaheurísticas** (recocido simulado, enjambre): **optimalidad ↔ tiempo**.
- Ejemplos verificados: mochila → 90; TSP de 5 ciudades → 26 (24 rutas); 15 ciudades → 87 178 291 200 rutas.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
