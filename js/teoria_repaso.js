/* teoria_repaso.js — Biblioteca: «Repaso antes del examen» (compacto) y preguntas de autoevaluación. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.repasoSec({ id: 'definiciones', icono: '📘', titulo: 'Definiciones clave', md: R`
**Recursión.** Se llama a sí misma; **caso base** (se sabe la respuesta, detiene) + **fórmula recursiva** (subproblemas más pequeños). Cada llamada apila un marco: espacio de pila = **profundidad máxima**; sin caso base → §RecursionError§. **Memoización**: guardar el resultado de cada subproblema (§O(2ⁿ) → O(n)§ en Fibonacci).

**Complejidad.** §T(n)§ = número de operaciones elementales (modelo RAM: cada una cuesta 1). **Mejor / peor / promedio**: «la complejidad» sin aclarar es el **peor caso**. §O§ cota superior, §Ω§ cota inferior, §Θ§ orden exacto; demostrar = exhibir §c§ y §n₀§. §O(g)§ es un **conjunto** (§T(n) ∈ O(n)§). Espacio = memoria extra más allá de la entrada.

**Paradigmas.** **Fuerza bruta** (todo) · **backtracking** (poda) · **greedy** (óptimo local, no siempre óptimo) · **divide y vencerás** (subproblemas independientes) · **DP** (subproblemas solapados; top-down = memoización, bottom-up = tabla).

**Árboles.** Raíz sin padre, un padre por nodo, sin ciclos; §N§ nodos ⇒ §N − 1§ aristas. **Profundidad** = aristas desde la raíz; **altura** = aristas hasta la hoja más lejana (hoja 0, vacío −1). **Lleno** (0 o 2 hijos) · **completo** (niveles llenos salvo el último, de izq. a der.) · **perfecto** (hojas al mismo nivel; §2^(h+1) − 1§ nodos).

**Recorridos.** Preorden (raíz-izq-der) · inorden (izq-raíz-der) · postorden (izq-der-raíz); por niveles con **cola**. DFS: §O(n)§ tiempo, §O(h)§ pila.

**BST.** izq < nodo < der para **todo el subárbol**; sin duplicados; el inorden sale **ordenado**; operaciones §O(h)§.

**AVL.** §factor = alt(izq) − alt(der)§, §|factor| ≤ 1§ en todo nodo; **rotación** = cambio local §O(1)§ que preserva el inorden; cuatro casos (LL, RR, LR, RL).

**Rojo-negro.** Raíz y NIL negros; rojo sin hijos rojos; **misma altura negra** en todo camino; camino más largo ≤ 2× el más corto. Nodo nuevo entra rojo; borrar un negro deja **doble negro**.` });

  B.repasoSec({ id: 'propiedades', icono: '🔑', titulo: 'Propiedades y resultados que se preguntan', md: R`
- **Árbol:** §N − 1§ aristas (necesario, no suficiente). **Perfecto:** §2^(h+1) − 1§ nodos; altura balanceada ≈ §log₂ n§; degenerada §n − 1§.
- **Un recorrido no basta** para reconstruir: se necesitan dos (inorden + preorden/postorden), valores distintos. Preorden: raíz primero; postorden: raíz último.
- **Postorden** evalúa expresiones (hijos antes que el padre) y es el de la retropropagación; **inorden de un BST** = datos ordenados.
- **BST:** buscar/insertar/eliminar §O(h)§ (§O(log n)§ balanceado, §O(n)§ degenerado). Insertar datos ordenados ⇒ lista de altura §n − 1§.
- **Eliminación BST:** 0 hijos → quitar; 1 hijo → reemplazar; 2 hijos → copiar predecesor (mayor de la izq.) o sucesor y eliminarlo. Ej.: eliminar 12 de §12(5(3,10),24(15,30))§ ⇒ sube el **10**.
- **AVL:** inserción ≤ **1** corrección (simple o doble); eliminación hasta §O(log n)§ rotaciones; recta ⇒ simple, zigzag ⇒ doble; todos los ejemplos de la clase terminan en §20(10,30)§. Insertar §10, 20, 30, 40, 50§ ⇒ 2 rotaciones, altura 2.
- **Rojo-negro:** caso 3 (tío rojo) recolorea; caso 1 (zigzag) rota el padre; caso 2 (recta) rota el abuelo y termina. Eliminación: caso 4 termina; casos 1 y 3 no; caso 2 sube la deuda.
- **AVL ↔ RN:** AVL balance estricto, altura menor, más rotaciones (**lectura**); RN balance laxo, menos rotaciones (**escritura**); ambos §O(log n)§.
- **Fibonacci:** ingenuo §O(2ⁿ)§ (llamadas §2F(n+1) − 1§); memoizado §O(n)§ (§2n − 1§ llamadas); bottom-up §O(n)§ con §O(1)§ de memoria.
- **Greedy falla:** {1, 3, 4}, §V = 6§ → 4+1+1 frente a 3+3. **DP monedas:** §O(V·m)§.
- **Convenciones del curso:** altura en **aristas**; «la complejidad» = **peor caso**; declarar **variable** y **caso**.` });

  B.repasoSec({ id: 'complejidades', icono: '⏱', titulo: 'Complejidades para memorizar', md: R`
| Qué | Tiempo | Espacio extra |
|---|---|---|
| factorial recursivo / fib memoizado | §O(n)§ | §O(n)§ |
| fib ingenuo | §O(2ⁿ)§ | §O(n)§ |
| fib bottom-up (2 variables) | §O(n)§ | §O(1)§ |
| potencia por mitades / búsqueda binaria | §O(log n)§ | §O(log n)§ / §O(1)§ |
| merge sort | §O(n log n)§ | §O(n)§ |
| quicksort (pivote §v[0]§) | prom. §O(n log n)§, peor §O(n²)§ | §O(log n)§ |
| recorridos de un árbol | §O(n)§ | §O(h)§ |
| BST: operaciones | §O(h)§ | §O(h)§ |
| AVL / rojo-negro: operaciones | §O(log n)§ | §O(log n)§ |
| rotación | §O(1)§ | §O(1)§ |
| §x in lista§ · §x in set§ | §O(n)§ · §O(1)§ | — |
| §append§ · §insert(0, x)§ · §pop(0)§ | §O(1)§ amortizado · §O(n)§ · §O(n)§ | — |
| cambio de moneda DP · mochila DP | §O(V·m)§ · §O(n·W)§ | §O(V)§ · §O(n·W)§ |
| TSP fuerza bruta · mochila fuerza bruta | §O(n!)§ · §O(2ⁿ)§ | — |

**Jerarquía:** §1 < log n < n < n log n < n² < 2ⁿ§. Con 10⁹ op/s y §n = 10⁶§: §n§ → 0,001 s; §n log n§ → 0,02 s; §n²§ → 1000 s (≈ 17 min).` });

  B.repasoSec({ id: 'confusiones', icono: '⚠', titulo: 'Confusiones frecuentes', md: R`
- **Profundidad** (desde la raíz) ≠ **altura** (hacia las hojas). Se cuentan **aristas**.
- **Lleno** ≠ **completo** ≠ **perfecto** (perfecto ⇒ lleno y completo).
- **Divide y vencerás** (independientes) ≠ **DP** (solapados). **Greedy** no retrocede; **backtracking** sí.
- **Número de llamadas** (tiempo) ≠ **profundidad** (espacio de pila).
- **§O§ no es «peor caso»**: son ejes distintos. Usa §Θ§ si conoces el orden exacto; §T(n) = O(n)§ es un abuso, escribe §T(n) ∈ O(n)§.
- **BST ≠ árbol binario cualquiera**: la propiedad vale con **todo** el subárbol, no solo con los hijos.
- **La complejidad del BST es §O(h)§**, no §O(log n)§.
- **Predecesor** (mayor de la izq.) ≠ **hijo izquierdo**; en la eliminación hay que **borrar el sustituto** de su posición original.
- **Rotación** ≠ cambio del orden de los datos: preserva el inorden. **Recta** ⇒ rotación simple; **zigzag** ⇒ doble.
- **Insertar en AVL**: el caso se decide por el **valor insertado**; **eliminar**: por el **factor del hijo**.
- **Factor** = alt(izq) − alt(der): **+2** pesa a la izquierda.
- **Rojo-negro** no es «mejor» que el AVL en absoluto: lectura ↔ AVL, escritura ↔ RN. NIL cuenta como **negro**.
- **Memoización** no elimina la recursión (sigue usando pila); **bottom-up** sí.
- **Valor mutable por defecto** (§cache={}§) se comparte entre llamadas; §b = a[:]§ es copia **superficial**.` });

  B.repasoSec({ id: 'pasos', icono: '🪜', titulo: 'Pasos de los ejercicios más comunes', md: R`
**Trazar una recursión:** (1) llamada inicial; (2) baja apilando hasta el caso base; (3) sube desapilando con los valores devueltos; (4) indica resultado, **nº de llamadas** y **profundidad máxima**.

**Obtener la complejidad de un código:** (1) define §n§; (2) cuenta/identifica ciclos y cómo cambian sus índices (suma → lineal; multiplica/divide → log); (3) anidados **se multiplican**, consecutivos **el mayor**; (4) revisa **costos ocultos** (§in§ de lista, §insert(0, …)§, cortes); (5) escribe **variable, caso y regla usada**.

**Demostrar §T(n) ∈ O(g(n))§:** acota cada término por un múltiplo de §g§ para §n ≥ n₀§, suma los múltiplos y escribe «basta §c = …§ y §n₀ = …§».

**Escribir un recorrido o reconstruir:** aplica la regla recursivamente en cada subárbol; para reconstruir: raíz = primero del preorden, §k§ = posición en el inorden, parte en izq./der. y repite.

**Insertar en BST:** compara y baja hasta §None§, cuelga hoja, ignora duplicados. **Eliminar:** 0 hijos / 1 hijo / 2 hijos (predecesor o sucesor, y eliminarlo).

**Insertar en AVL:** BST + subir actualizando altura y factor; **primer** nodo con §|f| = 2§ ⇒ identificar el caso (LL, RR, LR, RL) y rotar; reasignar la raíz. **Eliminar en AVL:** borrado BST con **sucesor**, subir, decidir por el factor del hijo, **seguir subiendo**.

**Insertar en rojo-negro:** nodo rojo; si el padre es rojo mira al **tío**: rojo → recolorear y subir (caso 3); negro → zigzag: rotar padre (caso 1) y luego caso 2; recta: caso 2. Raíz negra. **Eliminar:** doble negro y los 4 casos según el hermano y los sobrinos.

**Resolver con DP:** subproblema, recurrencia, casos base, orden, respuesta, análisis (subproblemas × trabajo por subproblema).

**Justificar una decisión:** nombra la **propiedad** (subproblemas solapados, |f| ≤ 1…), el **costo** y, si hay, un **contraejemplo** de la alternativa.` });

  B.repasoSec({ id: 'especiales', icono: '🧪', titulo: 'Casos especiales y errores típicos', md: R`
- **Árbol vacío:** altura −1, tamaño 0, recorridos devuelven vacío; el caso base §nodo is None§ es obligatorio (§AttributeError§).
- **Un solo nodo / hoja:** altura 0, factor 0, es perfecto, lleno y completo.
- **Datos ya ordenados:** BST degenerado (altura §n − 1§); quicksort con pivote §v[0]§ en §O(n²)§; el AVL rota y se mantiene bajo.
- **Duplicados:** no se insertan (si §v == nodo.valor§ ya existe).
- **Reasignar:** §raiz = insertar(raiz, v)§ y §nodo.izq = insertar(nodo.izq, v)§; una rotación puede cambiar la raíz.
- **Alturas:** recalcular tras rotar (primero el nodo que baja, luego el que sube).
- **Eliminar la raíz con dos hijos** y **borrar un valor ausente** (no hace nada).
- **Factor del hijo = 0 en una eliminación AVL:** se trata como recto (una rotación).
- **Rojo-negro:** raíz siempre negra tras insertar; borrar un nodo rojo no repara; doble negro en la raíz se ignora; **NIL = negro**.
- **Recursión profunda:** límite ~1000 (§RecursionError§); Python no optimiza la recursión de cola.
- **Cortes §v[1:]§ en recursión:** §O(n²)§. **§pop(0)§**: §O(n)§.
- **Mochila y TSP:** NP-difíciles ⇒ heurísticas; **greedy** puede fallar.
- **Reportar el mejor caso** como complejidad, **no declarar §n§ ni el caso**, o **dar §O(n³)§ para algo cuadrático** (correcto pero inútil).` });

  /* ---------------- autoevaluación ---------------- */
  B.autoevalua('rec', [
    ['¿Qué dos componentes tiene todo algoritmo recursivo?', 'El **caso base** y la **fórmula recursiva** (subproblemas más pequeños).'],
    ['¿Por qué Fibonacci ingenuo es §O(2ⁿ)§ y con memoización §O(n)§?', 'Porque el árbol de llamadas repite subproblemas (hasta §2ⁿ§ nodos); con caché hay §n + 1§ subproblemas distintos, cada uno calculado una vez.'],
    ['¿Qué relación hay entre recursión y pila de llamadas?', 'Cada llamada apila un marco; el espacio de pila es la profundidad máxima; sin caso base o con demasiada profundidad hay §RecursionError§.'],
    ['¿Cuántas llamadas hace §fib(5)§ ingenuo y memoizado?', '15 (ingenuo, §2F(6) − 1§) y 9 (memoizado, §2n − 1§).']
  ]);
  B.autoevalua('cx', [
    ['Escribe §T(n)§ de un ciclo de §n§ vueltas con 3 operaciones por vuelta.', '§T(n) = 1 + n·(1 + 3) + 1 = 4n + 2§ (lineal).'],
    ['¿Por qué §n²/2 − n/2§ es cuadrático? Justifica con números.', 'El término §n/2§ pesa 9,1 % con §n = 10§, 1 % con 100 y 0,0001 % con §10⁶§; manda §n²/2§ y la constante no cambia el orden.'],
    ['Da mejor, peor y promedio de la búsqueda secuencial y cuál se reporta.', '1, §n§, §(n+1)/2§; se reporta el peor caso.'],
    ['Si al duplicar §n§ el tiempo se multiplica por 4, ¿qué crecimiento tiene?', 'Cuadrático.'],
    ['Demuestra que §7n + 200 ∈ O(n)§.', '§200 ≤ 200n§ para §n ≥ 1§ ⇒ §7n + 200 ≤ 207n§: §c = 207§, §n₀ = 1§.'],
    ['¿Qué complejidad tiene un ciclo externo de §n§ con uno interno de 1 a 100? ¿Y si el interno va de 1 a §i§?', '§O(n)§ (100·n) y §O(n²)§ (§n(n−1)/2§).'],
    ['¿Cuántas vueltas hace §j = 1; while j < n: j *= 2§?', '§⌈log₂ n⌉§ ⇒ §O(log n)§.'],
    ['Ordena: §n log n, 2ⁿ, n², log n, n, 1§.', '§1 < log n < n < n log n < n² < 2ⁿ§.'],
    ['¿Puede un §O(n²)§ ser preferible a un §O(n log n)§?', 'Sí, con §n§ pequeño (constantes): insertion sort gana con §n < 50§; Timsort lo usa por debajo de 64.'],
    ['Explica el compromiso tiempo–espacio con §unicos_A§ y §unicos_B§.', '§unicos_B§ es §n§ veces más rápido (§O(n)§ frente a §O(n²)§) pero gasta §O(n)§ de memoria extra (el set).']
  ]);
  B.autoevalua('pd', [
    ['Diferencia divide y vencerás de DP con un ejemplo de cada uno.', 'D&C: subproblemas independientes (merge sort). DP: solapados (Fibonacci, mochila).'],
    ['Da un caso donde greedy falle y explica por qué.', '{1, 3, 4}, §V = 6§: 4+1+1 (3) frente a 3+3 (2): el óptimo local no lleva al global.'],
    ['Clasifica: ordenar partiendo por la mitad; camino más corto con la arista más barata; formas de subir una escalera; 8 reinas.', 'Divide y vencerás; greedy; DP; backtracking.'],
    ['¿Por qué se usan heurísticas en TSP y mochila?', 'Son NP-difíciles (fuerza bruta §O(n!)§ y §O(2ⁿ)§): las heurísticas sacrifican optimalidad por tiempo.']
  ]);
  B.autoevalua('ar', [
    ['Define raíz, nodo interno y hoja. ¿Cuántas aristas tiene un árbol de §N§ nodos?', 'Raíz: sin padre; interno: con hijos; hoja: sin hijos; §N − 1§ aristas.'],
    ['Diferencia profundidad y altura con un ejemplo.', 'En el árbol de ejemplo §H§ tiene profundidad 3 y altura 0; §A§ tiene profundidad 0 y altura 3.'],
    ['¿Cuántos nodos tiene un árbol binario perfecto de altura 3?', '§2⁴ − 1 = 15§.'],
    ['Da un árbol lleno que no sea completo.', '§A(B,C(F,G))§: §B§ es hoja pero §C§ tiene hijos, el último nivel tiene huecos a la izquierda.']
  ]);
  B.autoevalua('tv', [
    ['Da los tres recorridos de §1(2(4,5),3)§.', 'Pre 1 2 4 5 3; in 4 2 5 1 3; post 4 5 2 3 1.'],
    ['¿Qué recorrido usa la retropropagación y por qué?', 'Postorden: gradientes de los hijos antes que los del padre.'],
    ['Preorden ABDEC e inorden DBEAC: ¿qué árbol es? ¿Basta el preorden?', '§A(B(D,E),C)§; no basta un solo recorrido.'],
    ['¿Por qué se evalúa una expresión con postorden?', 'Porque los operandos deben estar listos antes de aplicar el operador (hijos antes que el padre).']
  ]);
  B.autoevalua('bs', [
    ['¿Vale la propiedad del BST solo con los hijos o con todo el subárbol?', 'Con **todo el subárbol**, de forma recursiva.'],
    ['¿Por qué el inorden de un BST sale ordenado?', 'Primero todo lo menor, luego el nodo, luego todo lo mayor (inducción con la propiedad).'],
    ['Describe los tres casos de eliminación.', '0 hijos: quitar; 1 hijo: reemplazar; 2 hijos: copiar predecesor (o sucesor) y eliminarlo de su posición.'],
    ['¿Por qué la complejidad es §O(h)§? ¿Cuándo §h = log n§ y cuándo §h = n§?', 'Un solo camino raíz-hoja; balanceado ⇒ §log n§; insertar datos ordenados ⇒ lista (§n − 1§).'],
    ['Inserta §[8, 3, 10, 1, 6, 14]§ y da el inorden.', '§8(3(1,6),10(,14))§; inorden 1, 3, 6, 8, 10, 14.'],
    ['¿Cuándo preferirías una tabla hash sobre un BST?', 'Cuando solo importa la pertenencia y no el orden.']
  ]);
  B.autoevalua('av', [
    ['Define el factor de balance y la condición AVL.', '§alt(izq) − alt(der)§; §|factor| ≤ 1§ en todos los nodos.'],
    ['Nombra los cuatro casos y su corrección.', 'LL: rot. derecha; RR: izquierda; LR: izq. del hijo + der.; RL: der. del hijo + izq.'],
    ['¿Por qué una rotación preserva la propiedad de BST?', 'Preserva el inorden: solo reengancha punteros (§O(1)§).'],
    ['Inserta §[10, 20, 30, 40, 50]§: altura final y número de rotaciones.', 'Altura 2; 2 rotaciones (simples a la izquierda) frente a una lista de altura 4 en el BST.'],
    ['¿En qué se diferencia la eliminación de la inserción en el rebalanceo?', 'El caso se decide por el factor del hijo y puede haber varias rotaciones.'],
    ['¿Qué complejidad tienen búsqueda, inserción y eliminación en el AVL y por qué?', '§O(log n)§: la altura es §O(log n)§ y cada rotación es §O(1)§.']
  ]);
  B.autoevalua('rn', [
    ['Enumera las reglas del rojo-negro.', 'Rojo/negro; raíz y NIL negros; rojo sin hijos rojos; misma altura negra en todo camino.'],
    ['¿Por qué queda balanceado?', 'Mismo número de negros por camino y sin rojos seguidos: el camino más largo ≤ doble del más corto ⇒ altura §O(log n)§.'],
    ['Describe los tres casos de inserción.', 'Tío rojo: recolorear y subir; tío negro y zigzag: rotar el padre y pasar al caso 2; tío negro y recta: recolorear y rotar el abuelo (termina).'],
    ['¿Qué es el doble negro y cómo se resuelve?', 'El negro de más al borrar un negro; se traslada hacia arriba con los 4 casos según hermano y sobrinos.'],
    ['AVL o rojo-negro: (1) índice casi sin cambios; (2) inserciones y borrados constantes.', '(1) AVL (lectura); (2) rojo-negro (escritura).']
  ]);
  B.autoevalua('ad', [
    ['BST balanceado frente a tabla hash: ¿cuál busca más rápido en promedio y cuál lista en orden sin costo extra?', 'Hash (§O(1)§ promedio); BST (inorden).'],
    ['¿Qué imprime §a = [[1,2],[3,4]]; b = a[:]; b[0].append(9); print(a)§?', '§[[1, 2, 9], [3, 4]]§: copia superficial.'],
    ['¿Qué debe llevar toda complejidad que reportes en el parcial?', 'Justificación (regla), variable (§n§, §k§…) y caso (mejor, peor, promedio).'],
    ['¿Cómo justificas que la pila monótona es §O(n)§ con un §while§ dentro de un §for§?', 'Argumento amortizado: cada índice entra y sale a lo sumo una vez.']
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
