/* teoria_tablas.js — Biblioteca: tablas comparativas (BST/AVL, AVL/rojo-negro, recursión/memoización, fuerza bruta/DP,
   preorden/inorden/postorden, complejidades temporales y espaciales, y otras de apoyo). Las celdas no deben contener «|». */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;
  const T = (id, titulo, md, nota, fuente, temas) => B.tabla({ id, titulo, md: md.trim(), nota, fuente, temas });

  T('bst-avl', 'BST frente a AVL', R`
| Aspecto | BST | AVL |
|---|---|---|
| Propiedad de orden | izquierda < nodo < derecha | la misma (es un BST) |
| Garantía de altura | ninguna: entre §⌊log₂ n⌋§ y §n − 1§ | **§O(log n)§** garantizada (factor en {−1, 0, +1} en todo nodo) |
| Búsqueda (peor caso) | §O(h)§ = §O(n)§ si degenera | **§O(log n)§** |
| Inserción (peor caso) | §O(h)§ = §O(n)§ | **§O(log n)§** (a lo sumo una corrección) |
| Eliminación (peor caso) | §O(h)§ = §O(n)§ | **§O(log n)§** (hasta §O(log n)§ rotaciones) |
| Datos ya ordenados | degenera en **lista** (altura §n − 1§) | las rotaciones mantienen altura ≈ §log₂ n§ |
| Construir §n§ valores ordenados | §O(n²)§ | §O(n log n)§ |
| Dato extra por nodo | ninguno | la **altura** (o el factor) |
| Reorganización | ninguna | rotaciones (O(1) cada una) |
| Sustituto al eliminar con 2 hijos | predecesor (mayor de la izquierda) en la clase | **sucesor** (menor de la derecha) en la clase |
| Inorden | datos ordenados | datos ordenados |
| Conviene | datos mezclados y simplicidad | garantía de peor caso y muchas lecturas |`,
    'Ambos son BST: lo que cambia es la **garantía de altura** y el costo de mantenerla. Con datos ordenados, la diferencia es §n − 1§ frente a ≈ §log₂ n§.', 'S6-C2 · d.12-13; S7-C1 · d.5-9, 36-38', ['bs-complejidad', 'av-problema']);

  T('av-rn', 'AVL frente a rojo-negro', R`
| Criterio | AVL | Rojo-negro |
|---|---|---|
| Balance | **más estricto** (diferencia de alturas ≤ 1) | más laxo |
| Altura | **más baja** ⇒ búsquedas más rápidas | un poco mayor |
| Inserción y eliminación | **más rotaciones** | menos rotaciones |
| Uso típico | cuando **dominan las búsquedas** | cuando **dominan las modificaciones** |
| En la práctica | bases de datos, índices | §std::map§ de C++, §TreeMap§ de Java, planificador de Linux |
| Garantía | ambos §O(log n)§ | ambos §O(log n)§ |
| Criterio de rebalanceo | **factor de balance** (alturas) | **colores** y altura negra |
| Dato extra por nodo | un entero (altura) | un bit (color) |
| Cota de altura (complementario) | §< 1,44·log₂(n + 2)§ | §≤ 2·log₂(n + 1)§ |
| Rotaciones en el peor caso (complementario) | inserción ≤ 1 corrección; eliminación hasta §O(log n)§ | inserción ≤ 2; eliminación ≤ 3 |`,
    'Las cinco primeras filas son la tabla de la clase (diapositiva 33). La diferencia es el **compromiso**: el AVL invierte más en mantenerse bajito (lectura); el rojo-negro, menos en rebalancear (escritura). Las dos últimas filas son complementarias.', 'S7-C1 · d.33-34', ['rn-vs-avl']);

  T('rec-memo', 'Recursión simple frente a memoización', R`
| Aspecto | Recursión ingenua | Con memoización |
|---|---|---|
| Idea | recalcula los subproblemas cada vez | guarda cada resultado la primera vez y lo reutiliza |
| Tiempo de Fibonacci | **§O(2ⁿ)§** | **§O(n)§** |
| Llamadas de §fib(n)§ | §2·F(n+1) − 1§ | §2n − 1§ |
| §fib(20)§ | 21 891 llamadas | 39 llamadas |
| Espacio | §O(n)§ (pila) | §O(n)§ (caché + pila) |
| Condición | — | subproblemas **solapados** y resultado que depende solo de los argumentos |
| Riesgos | tiempo exponencial | caché mutable por defecto (§cache={}§); §RecursionError§ si §n§ ≳ 1000 |
| Relación con DP | — | enfoque **top-down** de la programación dinámica |`,
    'Con memoización se paga memoria (§O(n)§) para ahorrar tiempo (de exponencial a lineal): el compromiso tiempo–espacio.', 'S5-C2 · d.7-8, 19', ['rec-ingenua', 'rec-memo', 'rec-vs-iter']);

  T('fb-dp', 'Fuerza bruta frente a programación dinámica', R`
| Aspecto | Fuerza bruta | Programación dinámica |
|---|---|---|
| Idea | enumerar **todas** las soluciones candidatas y verificar | resolver **una vez** cada subproblema solapado y reutilizarlo |
| Subproblemas | no los aprovecha | **solapados** (se repiten) |
| Costo típico | §O(n²)§ pares · §O(2ⁿ)§ subconjuntos · §O(n!)§ permutaciones | polinomial en el número de subproblemas: §O(V·m)§, §O(n·W)§, §O(n)§ |
| Memoria | poca | una tabla o caché (§O(V)§, §O(n·W)§…) |
| Garantía de óptimo | sí (revisa todo) | sí, si hay **subestructura óptima** |
| Ejemplos | TSP §O(n!)§, mochila por subconjuntos | cambio de moneda, mochila 0/1, escalera |
| Cuándo | espacio de candidatos pequeño o sin estructura | recursión natural con subproblemas repetidos |`,
    'La DP no «salta» soluciones: explora **todas las combinaciones relevantes sin recalcular**. Ver también la tabla de paradigmas.', 'S5-C2 · d.9-14, 16', ['pd-cinco', 'pd-dp', 'pd-fb-bt']);

  T('recorridos', 'Preorden, inorden, postorden y por niveles', R`
| Aspecto | Preorden | Inorden | Postorden | Por niveles (BFS) |
|---|---|---|---|---|
| Orden de visita | raíz → izq → der | izq → raíz → der | izq → der → raíz | nivel por nivel |
| Estructura | pila (recursión) | pila (recursión) | pila (recursión) | **cola** |
| En §1(2(4,5),3)§ | 1 2 4 5 3 | 4 2 5 1 3 | 4 5 2 3 1 | 1 2 3 4 5 |
| Posición de la raíz | **primero** | en medio | **último** | primero |
| En un BST | no ordenado | **ascendente** | no ordenado | no ordenado |
| Usos | copiar/serializar; padre antes que hijos | datos ordenados en un BST | hijos antes que el padre: evaluar expresiones, liberar memoria, tamaños, autograd | recorrer por capas |
| Notación de expresiones | prefija | infija | **postfija (RPN)** | — |
| Tiempo / espacio | §O(n)§ / §O(h)§ | §O(n)§ / §O(h)§ | §O(n)§ / §O(h)§ | §O(n)§ / §O(ancho)§ |`,
    'Los tres primeros son variantes de DFS: solo cambia **cuándo** se visita la raíz. Un solo recorrido no determina el árbol: se necesitan dos (p. ej. inorden + preorden). La columna BFS es complementaria (la clase solo la nombra).', 'S6-C1 · d.13-18', ['tv-profundidad', 'tv-niveles', 'tv-usos']);

  T('complejidades', 'Complejidades temporales y espaciales (resumen)', R`
| Algoritmo u operación | Tiempo (peor caso salvo que se indique) | Espacio extra |
|---|---|---|
| §factorial(n)§ recursivo | §O(n)§ | §O(n)§ (pila) |
| §fib(n)§ ingenuo | §O(2ⁿ)§ | §O(n)§ (pila) |
| §fib(n)§ con memoización | §O(n)§ | §O(n)§ (caché + pila) |
| §fib(n)§ bottom-up con 2 variables | §O(n)§ | **§O(1)§** |
| potencia por mitades | §O(log n)§ | §O(log n)§ (pila) |
| búsqueda secuencial | §O(n)§ (mejor 1; promedio (n+1)/2) | §O(1)§ |
| búsqueda binaria (iterativa) | §O(log n)§ | §O(1)§ |
| merge sort | §O(n log n)§ | §O(n)§ |
| quicksort con pivote §v[0]§ | promedio §O(n log n)§; **peor §O(n²)§** | §O(log n)§ (pila, en el sitio) |
| cambio de moneda (DP) | §O(V·m)§ | §O(V)§ |
| mochila 0/1 (DP) | §O(n·W)§ | §O(n·W)§ (tabla) |
| N-reinas (backtracking) | exponencial (poda reduce el trabajo real) | §O(N)§ |
| TSP por fuerza bruta | §O(n!)§ | §O(n)§ |
| recorridos DFS de un árbol | §O(n)§ | §O(h)§ |
| recorrido por niveles (BFS) | §O(n)§ | §O(ancho)§ |
| BST: buscar, insertar, eliminar | §O(h)§: §O(log n)§ balanceado, §O(n)§ degenerado | §O(h)§ (pila recursiva) |
| AVL: buscar, insertar, eliminar | §O(log n)§ | §O(log n)§ (pila) |
| rojo-negro: buscar, insertar, eliminar | §O(log n)§ | §O(log n)§ (pila) |
| una rotación | §O(1)§ | §O(1)§ |
| construir un BST con §n§ valores ordenados | §O(n²)§ | §O(n)§ |
| construir un AVL con §n§ valores | §O(n log n)§ | §O(n)§ |`,
    'Los costos de las estructuras de árboles son del **peor caso** respecto de §n§ (nodos) o §h§ (altura). Cuando la clase no da el espacio de un algoritmo (por ejemplo BFS o los recorridos de AVL/rojo-negro), el valor mostrado es el estándar: la columna de espacio **no** incluye la entrada.', 'S2-C1 · d.21; S2-C2 · d.16-17; S5-C2 · d.7-14, 16; S6-C1 · d.17; S6-C2 · d.13; S7-C1 · d.9, 38', ['cx-espacial', 'cx-reglas', 'bs-complejidad', 'av-complejidad']);

  T('python-costos', 'Costo de las operaciones de Python', R`
| Operación | list | set / dict | Causa |
|---|---|---|---|
| §v[i]§ | §O(1)§ | — | memoria contigua |
| §x in c§ | **§O(n)§** | **§O(1)§** | recorrido frente a hash |
| §append(x)§ | §O(1)§ amortizado | §O(1)§ | amortizado |
| §insert(0, x)§ | **§O(n)§** | — | desplaza todo |
| §pop()§ final | §O(1)§ | — | sin desplazar |
| §pop(0)§ | **§O(n)§** | — | desplaza todo |
| §sort()§ | §O(n log n)§ | — | Timsort |
| §min§ / §max§ | §O(n)§ | §O(n)§ | recorre todo |
| §s1 + s2§ (cadenas) | copia ambas | — | suma de longitudes |
| §v[1:]§ (corte) | copia §n − 1§ elementos | — | en recursión da §O(n²)§ |`,
    'Cambiar §lista.pop(0)§ por §collections.deque.popleft()§ convierte un algoritmo §O(n²)§ en uno §O(n)§. La fila del corte §v[1:]§ es complementaria.', 'S2-C2 · d.17; S2-C1 · d.7, 18', ['cx-python', 'ad-python']);

  T('tipos-binarios', 'Árboles binarios: lleno, completo y perfecto', R`
| Tipo | Propiedad | Ejemplo | Relación |
|---|---|---|---|
| Lleno | cada nodo tiene 0 o 2 hijos | §A(B,C(F,G))§ | puede **no** ser completo |
| Completo | niveles llenos salvo quizá el último, de izquierda a derecha | §A(B(D,E),C(F))§ | puede **no** ser lleno |
| Perfecto | internos con 2 hijos y todas las hojas al mismo nivel | §A(B(D,E),C(F,G))§ | **es** lleno y completo |
| Nodos de un perfecto de altura h | §2^(h+1) − 1§ | §h = 3§ ⇒ 15 | máximo para esa altura |`,
    'Un árbol balanceado guarda §n§ elementos con altura ≈ §log₂ n§; uno degenerado, con altura §n − 1§.', 'S6-C1 · d.10-11', ['ar-tipos']);

  T('avl-casos', 'Los cuatro casos de desbalance del AVL', R`
| Caso | El nuevo nodo cayó en… | Factor del nodo | Corrección | Rotaciones simples |
|---|---|---|---|---|
| Izq-Izq (LL) | subárbol izquierdo del hijo izquierdo | §+2§ | rotación **derecha** del nodo | 1 |
| Der-Der (RR) | subárbol derecho del hijo derecho | §−2§ | rotación **izquierda** del nodo | 1 |
| Izq-Der (LR) | subárbol derecho del hijo izquierdo | §+2§ | rotación **izquierda del hijo** y luego **derecha** del nodo | 2 |
| Der-Izq (RL) | subárbol izquierdo del hijo derecho | §−2§ | rotación **derecha del hijo** y luego **izquierda** del nodo | 2 |`,
    'Recta ⇒ rotación simple; zigzag ⇒ doble rotación. En la **eliminación** el caso se decide por el factor del hijo (§≥ 0§ / §< 0§ a la izquierda; §≤ 0§ / §> 0§ a la derecha). Los cuatro ejemplos de la clase terminan en §20(10,30)§.', 'S7-C1 · d.10-14, 18-19', ['av-casos', 'av-insercion', 'av-eliminacion']);

  T('paradigmas', 'Los cinco paradigmas algorítmicos', R`
| Paradigma | Idea | Subproblemas | Costo típico | Ejemplo | Falla o riesgo |
|---|---|---|---|---|---|
| Fuerza bruta | probar todo | — | §O(n²)§, §O(2ⁿ)§, §O(n!)§ | pares que suman §S§, TSP | inviable para §n§ grande |
| Backtracking | fuerza bruta con **poda** | — | exponencial (poda reduce el trabajo) | N-reinas | peor caso sigue siendo exponencial |
| Greedy | **óptimo local** sin reconsiderar | — | §O(n log n)§ | cambio con monedas canónicas | **no siempre óptimo** ({1,3,4}, 6) |
| Divide y vencerás | dividir, vencer, combinar | **independientes** | §O(n log n)§, §O(log n)§ | merge sort, búsqueda binaria | confundirlo con DP |
| Programación dinámica | resolver una vez y reutilizar | **solapados** | polinomial (§O(V·m)§, §O(n)§…) | Fibonacci, mochila, cambio de moneda | memoria; definir mal el subproblema |`,
    'Cómo elegir: independientes → divide y vencerás; solapados → programación dinámica; decisiones locales óptimas → greedy (justificarlo); si no, backtracking o DP.', 'S5-C2 · d.9-14', ['pd-cinco']);

  T('crecimiento', 'Tasas de crecimiento y tiempo estimado', R`
| Crecimiento | n = 10 | n = 100 | n = 10⁴ | n = 10⁶ | Tiempo con n = 10⁶ a 10⁹ op/s |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | instantáneo |
| log₂ n | 3 | 7 | 13 | 20 | instantáneo |
| n | 10 | 100 | 10⁴ | 10⁶ | 0,001 s |
| n log₂ n | 33 | 664 | 1,3 × 10⁵ | 2 × 10⁷ | 0,02 s |
| n² | 100 | 10⁴ | 10⁸ | 10¹² | 1 000 s ≈ 17 min |
| 2ⁿ | 1024 | 10³⁰ | — | — | inalcanzable |`,
    'La columna de tiempo es **operaciones ÷ 10⁹**. La diapositiva 13 de S2-C1 dice «≈ 11 días» para §n² con n = 10⁶§, pero §10¹² ÷ 10⁹ = 10³§ s; once días corresponden a ≈ §10¹⁵§ operaciones. Frontera práctica: hasta §n log n§ millones de datos; §n²§ decenas de miles; §2ⁿ§ unas decenas.', 'S2-C1 · d.13; S2-C2 · d.15-16', ['cx-dominante']);

  T('rn-ins-casos', 'Rojo-negro: casos de inserción', R`
| Caso | Situación (padre P rojo, abuelo Q) | Acción | ¿Termina? |
|---|---|---|---|
| 3 | el otro hijo de Q (tío) es **rojo** | P y tío → negro; Q → rojo; seguir desde Q | no |
| 1 (zigzag) | tío negro (o NIL) y N en lado contrario a P | rotar P para alinear; pasar al caso 2 | no |
| 2 (recta) | tío negro (o NIL) y N del mismo lado que P | Q → rojo, P → negro; rotar Q hacia el lado contrario | **sí** |
| final | siempre | pintar la raíz de negro | — |`,
    'El nodo nuevo entra **rojo**. Los casos simétricos (P hijo derecho de Q) son el espejo.', 'S7-C1 · d.24-27', ['rn-insercion']);

  T('rn-del-casos', 'Rojo-negro: casos de eliminación (doble negro D, hermano H)', R`
| Caso | Situación | Acción | ¿Termina? |
|---|---|---|---|
| 1 | H **rojo** | H → negro; P → rojo; rotar P hacia el lado de D | no (pasa a 2, 3 o 4) |
| 2 | H negro y sus **dos hijos negros** (NIL cuenta) | H → rojo; el negro de más sube a P | solo si P era rojo (pasa a negro) |
| 3 | H negro, hijo **cercano** a D rojo y **lejano** negro | intercambiar colores de H y el cercano; rotar H en sentido **opuesto** a D | no (pasa al caso 4) |
| 4 | H negro y su hijo **más lejano** a D rojo | H toma el color de P; P y el lejano → negro; rotar P hacia D | **sí** |`,
    'Borrar un nodo **rojo** no altera nada; borrar uno **negro** deja un doble negro. Si el doble negro llega a la raíz, se ignora.', 'S7-C1 · d.28-32', ['rn-eliminacion']);

  T('bst-hash', 'BST balanceado frente a tabla hash', R`
| Operación | BST balanceado | Tabla hash |
|---|---|---|
| Buscar | §O(log n)§ (peor caso) | §O(1)§ promedio |
| Insertar / eliminar | §O(log n)§ | §O(1)§ promedio |
| Listar en orden | **§O(n)§** (inorden) | §O(n log n)§ (ordenar) |
| Mínimo, máximo, siguiente | §O(log n)§ | §O(n)§ |
| Mantiene el orden | **sí** | no |
| Peor caso | §O(log n)§ garantizado | §O(n)§ (colisiones) |`,
    'Si no importa el orden y solo se consulta pertenencia, la tabla hash suele ser mejor (semana 8). Si se necesita a la vez búsqueda eficiente y datos ordenados, un BST balanceado (se sacrifica el §O(1)§ promedio).', 'S6-C2 · d.13-14', ['ad-hash']);

  T('fib-versiones', 'Cuatro versiones de Fibonacci (y la escalera)', R`
| Versión | Tiempo | Espacio extra | Riesgo |
|---|---|---|---|
| Recursiva ingenua | §O(2ⁿ)§ | §O(n)§ de pila | exponencial |
| Recursiva con memoización | §O(n)§ | §O(n)§ (caché + pila) | §RecursionError§ si §n§ ≳ 1000 |
| Bottom-up con tabla | §O(n)§ | §O(n)§ | — |
| Bottom-up con dos variables | §O(n)§ | **§O(1)§** | — |`,
    'Para la escalera de pasos 1 o 2: §f(n) = f(n−1) + f(n−2)§ con §f(0) = f(1) = 1§ (Fibonacci desplazado). Con §n = 35§: 29 860 703 llamadas (ingenua), 69 (memoizada), 34 sumas (bottom-up).', 'S5-C2 · d.7-8, 13, 17-18', ['rec-vs-iter']);
})(typeof window !== 'undefined' ? window : globalThis);
