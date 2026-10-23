/* teoria_rec.js — Biblioteca: área Recursión (fuente: S5-C2, Recursión y paradigmas algorítmicos) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'rec-definicion', area: 'rec', titulo: 'Recursión: caso base y fórmula recursiva', fuente: 'S5-C2 · diap. 4-5', nivel: 1, comp: true,
    conceptos: ['rc_def', 'rc_base'], interactivo: [],
    definicion: R`
Un algoritmo **recursivo** es el que **se llama a sí mismo** para resolver un problema más pequeño del mismo tipo. Toda definición recursiva correcta tiene dos componentes:

- **Caso base**: entradas cuya respuesta se conoce directamente; es lo que **detiene** la recursión.
- **Fórmula recursiva** (paso recursivo): expresa la respuesta actual en términos de subproblemas **más pequeños**, que se van acercando al caso base.

Sin caso base la recursión nunca termina: se agota la pila de llamadas y Python lanza §RecursionError§ (desbordamiento de pila, *stack overflow*).`,
    intuicion: R`
Piensa en una fila de personas y quieres saber cuántas hay delante de ti. Le preguntas a la de adelante «¿cuántas hay delante de ti?» y sumas 1 a lo que responda. Ella hace lo mismo con la siguiente. **La primera de la fila** no tiene a nadie delante: responde 0 sin preguntar a nadie (eso es el caso base). Las respuestas vuelven hacia atrás sumando 1 cada vez (eso es la fórmula recursiva).

La pregunta de la clase lo dice así: §n! = 1 × 2 × … × n§ se puede calcular con un ciclo, pero también notando que §n! = n × (n−1)!§. La segunda definición **usa a la primera**; para que no gire infinitamente necesita un punto de parada (§0! = 1§ o §1! = 1§).

La actitud correcta al escribir una función recursiva es **confiar**: supón que la llamada con el problema más pequeño ya funciona y limítate a resolver el pedacito que falta (multiplicar por §n§, sumar 1, combinar dos mitades…).`,
    formal: R`
Una función definida por recursión está **bien definida** cuando se cumplen tres condiciones:

1. **Hay caso base**: al menos una entrada se resuelve sin llamadas recursivas.
2. **Hay progreso**: cada llamada recursiva recibe un argumento estrictamente «menor» según alguna medida que decrece y está acotada inferiormente (por ejemplo §n§ baja de 1 en 1, o se divide entre 2). Así, toda cadena de llamadas termina en un caso base.
3. **Hay cobertura**: todas las entradas posibles caen en algún caso (base o recursivo).

Definición de la clase para la potencia §xⁿ§ **sin usar §**§**:

~~~
x⁰ = 1                                  (caso base)
xⁿ = xⁿ/² × xⁿ/²                        si n es par
xⁿ = x × x⁽ⁿ⁻¹⁾/² × x⁽ⁿ⁻¹⁾/²            si n es impar
~~~

[comp]
**Correctitud por inducción.** Se demuestra igual que una inducción matemática: (base) la función es correcta en el caso base; (paso) si es correcta para todos los subproblemas más pequeños, entonces es correcta para §n§. Por eso «confiar en la recursión» es un argumento válido y no un acto de fe.
[/comp]`,
    procedimiento: R`
Para diseñar una función recursiva:

1. **Escribe el contrato**: qué recibe y qué devuelve (por ejemplo «§factorial(n)§ devuelve §n!§ para §n ≥ 0§»).
2. **Identifica el caso base**: la entrada más pequeña cuya respuesta sabes sin calcular (§n = 0§, lista vacía, nodo §None§…).
3. **Expresa el caso general** usando la misma función sobre una entrada más pequeña (la fórmula recursiva).
4. **Comprueba el progreso**: el argumento de cada llamada recursiva debe acercarse al caso base.
5. **Prueba a mano** con la entrada mínima, una entrada pequeña y un caso límite.
6. Si la fórmula usa el mismo subproblema varias veces, **guárdalo en una variable** en lugar de llamarlo dos veces (ver «potencia» abajo).`,
    codigo: {
      titulo: 'Factorial y potencia sin ** (S5-C2, d.5-6)',
      src: R`
def factorial(n):
    if n <= 1:                    # caso base
        return 1
    return n * factorial(n - 1)   # fórmula recursiva

def potencia(x, n):
    if n == 0:                    # caso base: x^0 = 1
        return 1
    mitad = potencia(x, n // 2)   # un solo subproblema de tamaño n/2
    if n % 2 == 0:
        return mitad * mitad      # n par:   x^n = x^(n/2) * x^(n/2)
    return x * mitad * mitad      # n impar: x^n = x * x^((n-1)/2) * x^((n-1)/2)

print(factorial(5))    # 120
print(potencia(2, 10)) # 1024
print(potencia(3, 5))  # 243
`,
      esperado: '120\n1024\n243'
    },
    ejemplo: R`
**Traza de §potencia(2, 10)§.** Cada llamada reduce §n§ a su mitad entera:

| Llamada | n | ¿caso base? | mitad | resultado |
|---|---|---|---|---|
| potencia(2, 10) | 10 | no | potencia(2, 5) | 32 · 32 = 1024 |
| potencia(2, 5) | 5 | no | potencia(2, 2) | 2 · 4 · 4 = 32 |
| potencia(2, 2) | 2 | no | potencia(2, 1) | 2 · 2 = 4 |
| potencia(2, 1) | 1 | no | potencia(2, 0) | 2 · 1 · 1 = 2 |
| potencia(2, 0) | 0 | **sí** | — | 1 |

Se hicieron **5 llamadas** (§n = 10, 5, 2, 1, 0§). Primero se baja hasta el caso base y luego los resultados **suben** multiplicándose: 1 → 2 → 4 → 32 → 1024.

**Traza de §factorial(4)§:** §4 · factorial(3)§ → §4 · 3 · factorial(2)§ → §4 · 3 · 2 · factorial(1)§ → §factorial(1) = 1§ (base) → §2 · 1 = 2§ → §3 · 2 = 6§ → §4 · 6 = 24§.

[comp]
Si en vez de guardar §mitad§ se escribiera §potencia(x, n // 2) * potencia(x, n // 2)§, se harían **dos** llamadas por nivel y el costo pasaría de §O(log n)§ a §O(n)§ (recurrencia §T(n) = 2T(n/2) + O(1)§). Guardar el subproblema en una variable es la diferencia.
[/comp]`,
    complejidad: R`
**Factorial.** §factorial(n)§ hace una llamada por cada valor de §n§ hasta 1: son §n§ llamadas, cada una con trabajo constante (una comparación y una multiplicación). Recurrencia: §T(n) = T(n−1) + O(1)§ ⇒ **§O(n)§ en tiempo**. Como las llamadas quedan pendientes hasta llegar al caso base, la pila llega a profundidad §n§ ⇒ **§O(n)§ en espacio** (ver [[rec-pila]]).

**Potencia.** En cada llamada §n§ se divide entre 2; tras §k§ pasos §n/2ᵏ§ llega a 0 cuando §k ≈ log₂ n§. Recurrencia: §T(n) = T(n/2) + O(1)§ ⇒ **§O(log n)§ en tiempo y en pila**. Es mucho mejor que multiplicar §n§ veces.

Idea general: **(trabajo por llamada) × (número de llamadas)**, y el espacio es la **profundidad máxima** de la pila.`,
    errores: R`
- **Olvidar el caso base**: la recursión no termina y aparece §RecursionError§.
- **Caso base inalcanzable**: con §if n == 0§, la llamada §factorial(-1)§ baja a −2, −3… sin llegar nunca a 0. §n <= 1§ es más seguro, o se valida la entrada.
- **Subproblema que no se reduce**: llamar §factorial(n)§ (en vez de §n − 1§) repite el mismo problema para siempre.
- **Olvidar el §return§** en la llamada recursiva: la función devuelve §None§ y la multiplicación falla.
- **Recalcular lo mismo dos veces** (el caso de §potencia§, o de Fibonacci en [[rec-ingenua]]).
- **Confundir la fórmula para §n§ impar**: falta el factor extra §x§ y el resultado sale mal.`,
    preguntas: [
      ['¿Qué dos componentes tiene todo algoritmo recursivo?', 'El **caso base** (entradas cuya respuesta se conoce directamente y que detienen la recursión) y la **fórmula recursiva** (expresa la respuesta en términos de subproblemas más pequeños).'],
      ['¿Qué pasa si una función recursiva no tiene caso base?', 'Nunca termina: cada llamada apila un marco nuevo hasta agotar el espacio de pila y Python lanza §RecursionError§ (desbordamiento de pila, *stack overflow*).'],
      ['Escribe §potencia(x, n)§ sin usar §**§ y da su complejidad.', 'Caso base §n == 0 → 1§. Se calcula §mitad = potencia(x, n // 2)§ **una sola vez**; si §n§ es par devuelve §mitad * mitad§ y si es impar §x * mitad * mitad§. Complejidad §O(log n)§ en tiempo y en espacio de pila (T(n) = T(n/2) + O(1)).'],
      ['¿Por qué §factorial(-1)§ no termina si el caso base es §n == 0§?', 'Porque §-1§ baja a §-2§, §-3§… y **nunca** llega a 0: el caso base es inalcanzable. Con §n <= 1§ (o validando la entrada) termina.']
    ],
    resumen: R`
- Recursión = **caso base** + **fórmula recursiva** sobre subproblemas más pequeños.
- Cada llamada debe **acercarse** al caso base; si no, hay recursión infinita (§RecursionError§).
- Confía en la llamada pequeña: resuelve solo el pedacito que falta.
- Si un subproblema se usa dos veces, **guárdalo en una variable**.
- Factorial: §O(n)§ tiempo y pila. Potencia por mitades: §O(log n)§.`
  });

  B.tema({
    id: 'rec-pila', area: 'rec', titulo: 'La pila de llamadas y el desbordamiento de pila', fuente: 'S5-C2 · diap. 6, 19', nivel: 1, comp: true,
    conceptos: ['rc_pila', 'rc_traza', 'rc_overflow'], interactivo: [],
    definicion: R`
Cada llamada a una función **apila un marco** (*frame*) con sus parámetros, variables locales y el punto al que debe volver. El espacio ocupado por las llamadas que aún no han terminado es el **espacio de pila**; se libera cuando cada llamada **retorna**. La recursión se apoya en esta pila (la misma de la semana 1: último en entrar, primero en salir).

Si la recursión es demasiado profunda o no termina, se agota el espacio de pila: **desbordamiento de pila** (§RecursionError§ en Python).`,
    intuicion: R`
Imagina una pila de platos: cada llamada pone un plato encima y **no puede devolverse hasta que los de arriba se quiten**. Al llamar §factorial(4)§ queda pendiente la multiplicación §4 × …§ hasta que §factorial(3)§ conteste; esa espera necesita un plato (marco) por llamada.

Por eso una recursión de profundidad §n§ necesita §n§ platos al mismo tiempo. Python solo permite unos **1000** por defecto: si la entrada exige más, lanza el error aunque el programa sea correcto.

Convertir a un ciclo evita la pila de llamadas, pero la clase advierte que lo que se guarda pasa a estructuras del **montículo** (por ejemplo una pila explícita), que suele ser mayor.`,
    formal: R`
- **Marco de activación**: registro con los parámetros, las variables locales y la dirección de retorno de una llamada.
- **Profundidad de recursión** de una llamada = número de marcos apilados en ese momento. La **profundidad máxima** determina el espacio de pila.
- **Espacio de pila** de una recursión lineal (una llamada por nivel) con profundidad §n§: **§O(n)§**.
- **Límite de Python**: unas 1000 llamadas anidadas por defecto. Superarlo lanza §RecursionError§.
- El orden de las operaciones pendientes es LIFO: la última llamada hecha es la primera en terminar.

Esquema de la clase para §factorial(4)§ (el tope está a la derecha):

~~~
factorial(4) | factorial(3) | factorial(2) | factorial(1)  ← tope
~~~`,
    procedimiento: R`
Para **trazar** una recursión en un examen:

1. Escribe la llamada inicial y su argumento.
2. Mientras no se llegue al caso base, escribe una **nueva llamada debajo/derecha** con el argumento reducido (la pila crece).
3. En el caso base, anota el valor devuelto.
4. **Desapila**: sube por las llamadas completando cada operación pendiente con el valor que acaba de volver.
5. Indica al final: resultado, **número total de llamadas** y **profundidad máxima** (los marcos apilados a la vez).`,
    codigo: {
      titulo: 'Seguir cómo se apila y se desapila (con sangría = profundidad)',
      src: R`
def factorial(n, nivel=0):
    print("  " * nivel + "entra factorial(" + str(n) + ")")
    if n <= 1:
        print("  " * nivel + "caso base -> 1")
        return 1
    r = n * factorial(n - 1, nivel + 1)
    print("  " * nivel + "sale factorial(" + str(n) + ") = " + str(r))
    return r

factorial(4)
`,
      esperado: 'entra factorial(4)\n  entra factorial(3)\n    entra factorial(2)\n      entra factorial(1)\n      caso base -> 1\n    sale factorial(2) = 2\n  sale factorial(3) = 6\nsale factorial(4) = 24',
      nota: 'Pulsa «Depurar paso a paso» para ver la **pila de llamadas y variables** de cada instante: aparece un marco por cada llamada pendiente.'
    },
    ejemplo: R`
**§factorial(4)§ marco a marco** (cada línea es la pila en ese instante):

| Paso | Pila (base → tope) | Qué ocurre |
|---|---|---|
| 1 | f(4) | se llama f(4) |
| 2 | f(4), f(3) | f(4) queda esperando |
| 3 | f(4), f(3), f(2) | f(3) queda esperando |
| 4 | f(4), f(3), f(2), f(1) | **profundidad máxima: 4 marcos**; f(1) es caso base |
| 5 | f(4), f(3), f(2) | f(1) retorna 1; f(2) calcula 2 · 1 = 2 |
| 6 | f(4), f(3) | f(2) retorna 2; f(3) calcula 3 · 2 = 6 |
| 7 | f(4) | f(3) retorna 6; f(4) calcula 4 · 6 = 24 |
| 8 | (vacía) | f(4) retorna 24 |

Total: **4 llamadas** y profundidad máxima **4**. Para §factorial(n)§ son §n§ llamadas y profundidad §n§.

[ojo]
Una función con el caso base mal escrito (o sin él) sigue apilando marcos hasta que Python se detiene: §RecursionError: maximum recursion depth exceeded§. El error es de **profundidad**, no de tiempo.
[/ojo]`,
    complejidad: R`
- **Tiempo**: se multiplica el trabajo por llamada por el número de llamadas (§O(n)§ para el factorial).
- **Espacio**: es la **profundidad máxima** de la pila, no el número total de llamadas. Factorial: §O(n)§. Potencia por mitades: §O(log n)§. Recorrer un árbol: §O(h)§, con §h§ la altura.
- Justificación: los marcos solo existen mientras su llamada está **pendiente**; cuando una llamada retorna se libera su marco, así que lo que importa es cuántas están vivas a la vez.
- Un ciclo equivalente usa §O(1)§ de pila; una recursión de profundidad §n§ usa §O(n)§. Ese es el motivo para preferir el ciclo cuando §n§ puede ser mayor que ~1000.`,
    errores: R`
- **Pensar que cada llamada «termina» antes de llamar a la siguiente**: en realidad quedan **todas pendientes** hasta el caso base.
- **Confundir tiempo con espacio de pila**: dos recursiones pueden hacer muchas llamadas pero tener poca profundidad (por ejemplo Fibonacci ingenuo: tiempo exponencial pero pila de profundidad §n§).
- **Asumir que Python optimiza la recursión de cola**: no lo hace; una recursión profunda siempre consume pila.
- **Ignorar el límite (~1000)** al recorrer listas o árboles degenerados muy largos.
- **Creer que el error de pila indica un error lógico**: a veces el algoritmo es correcto pero la profundidad no cabe; entonces conviene iterar.`,
    preguntas: [
      ['¿Qué relación hay entre la recursión y la pila de llamadas?', 'Cada llamada recursiva apila un marco con sus parámetros y variables locales; el marco se libera al retornar. La recursión funciona gracias a esa pila (LIFO): la última llamada hecha es la primera en terminar.'],
      ['¿Qué espacio de pila usa §factorial(n)§ y por qué?', '§O(n)§: las §n§ llamadas quedan pendientes a la vez hasta llegar al caso base, así que hay §n§ marcos apilados en el punto más profundo.'],
      ['¿Por qué una recursión muy profunda puede fallar en Python aunque sea correcta?', 'Python limita la profundidad (~1000 por defecto). Si la entrada exige más marcos que el límite lanza §RecursionError§. A veces conviene una versión iterativa.'],
      ['¿Qué riesgo tiene la recursión profunda que la iteración no tiene?', 'El desbordamiento de pila (§RecursionError§). El ciclo usa memoria constante de pila; la recursión usa memoria proporcional a la profundidad.']
    ],
    resumen: R`
- Cada llamada = **un marco** apilado; se libera al retornar (LIFO).
- **Espacio de pila = profundidad máxima**, no número total de llamadas.
- Sin caso base o con entradas enormes → §RecursionError§ (límite ~1000 en Python).
- Trazar = bajar apilando hasta el caso base y **subir desapilando** con los valores devueltos.
- El ciclo evita la pila de llamadas; la recursión a cambio suele ser más clara.`
  });

  B.tema({
    id: 'rec-ingenua', area: 'rec', titulo: 'Recursión ingenua: Fibonacci y el árbol de llamadas', fuente: 'S5-C2 · diap. 7', nivel: 1, comp: true,
    conceptos: ['rc_fib', 'rc_conteo'], interactivo: ['fib-llamadas'],
    definicion: R`
La **recursión ingenua** de Fibonacci traduce literalmente la definición §F(n) = F(n−1) + F(n−2)§, con §F(0) = 0§ y §F(1) = 1§. Cada llamada genera **dos** llamadas, y las dos vuelven a calcular subproblemas que ya se calcularon en otra rama: el **árbol de llamadas** es exponencial. El costo de la clase es **§O(2ⁿ)§**.`,
    intuicion: R`
Para calcular §fib(5)§ necesitas §fib(4)§ y §fib(3)§. Pero §fib(4)§ también necesita §fib(3)§, y §fib(3)§ necesita §fib(2)§ varias veces… Es como una persona que, cada vez que le preguntan lo mismo, **olvida la respuesta** y vuelve a calcularla desde cero.

En el diagrama de la clase los nodos repetidos aparecen en rojo: son trabajo desperdiciado. Cada vez que §n§ crece en 1, el número de llamadas **se multiplica** por algo cercano a 1,6 (no suma, **multiplica**): por eso §fib(40)§ tarda y §fib(80)§ es inviable.`,
    formal: R`
Sea §c(n)§ el número de llamadas que hace §fib(n)§ (contándose a sí misma):

~~~
c(0) = c(1) = 1
c(n) = 1 + c(n−1) + c(n−2)
~~~

Se cumple **§c(n) = 2·F(n+1) − 1§**. Valores comprobados: §c(5) = 15§, §c(6) = 25§, §c(10) = 177§, §c(20) = 21 891§.

Cota de la clase: como §c(n) ≤ 2ⁿ§ el costo es **§O(2ⁿ)§** (árbol binario de profundidad §n§ en el peor caso).

[comp]
La cota exacta es §Θ(φⁿ)§ con §φ = (1+√5)/2 ≈ 1,618§: el árbol es **más ralo** que uno perfecto, pero igualmente exponencial. En el curso basta con decir «exponencial, §O(2ⁿ)§».
[/comp]

Profundidad del árbol (espacio de pila): **§O(n)§**, porque la rama más larga es §fib(n) → fib(n−1) → … → fib(1)§.`,
    procedimiento: R`
Para **contar llamadas** o dibujar el árbol de §fib(n)§:

1. Dibuja la raíz §fib(n)§.
2. Si §n < 2§ es una **hoja** (caso base, devuelve §n§). Si no, añade dos hijos: §fib(n−1)§ (izquierda) y §fib(n−2)§ (derecha).
3. Repite hasta que todas las ramas terminen en hojas §fib(1)§ o §fib(0)§.
4. **Marca** los subárboles repetidos (mismo §n§): son el desperdicio.
5. Cuenta los nodos: ese es el número de llamadas.`,
    codigo: {
      titulo: 'Fibonacci ingenuo con contador de llamadas',
      src: R`
llamadas = 0

def fib(n):
    global llamadas
    llamadas += 1
    if n < 2:            # caso base: fib(0) = 0, fib(1) = 1
        return n
    return fib(n - 1) + fib(n - 2)   # recalcula lo mismo una y otra vez

for n in [5, 6, 10, 20]:
    llamadas = 0
    r = fib(n)
    print("fib(" + str(n) + ") =", r, "| llamadas:", llamadas)
`,
      esperado: 'fib(5) = 5 | llamadas: 15\nfib(6) = 8 | llamadas: 25\nfib(10) = 55 | llamadas: 177\nfib(20) = 6765 | llamadas: 21891'
    },
    ejemplo: R`
**Árbol de llamadas de §fib(5)§** (15 llamadas):

~~~
                      fib(5)
               /                 \
          fib(4)                  fib(3)
         /      \                /      \
     fib(3)    fib(2)        fib(2)    fib(1)
     /   \     /   \         /   \
 fib(2) fib(1) fib(1) fib(0) fib(1) fib(0)
  /  \
fib(1) fib(0)
~~~

- §fib(3)§ se calcula **2 veces**, §fib(2)§ **3 veces**, §fib(1)§ **5 veces**.
- Valores: §fib(1)=1§, §fib(2)=1§, §fib(3)=2§, §fib(4)=3§, §fib(5)=5§.
- Hay 15 nodos ⇒ 15 llamadas para obtener un resultado que con 4 sumas bastaba.

Compruébalo abajo con el ejemplo interactivo: el programa construye el árbol de llamadas de §fib(6)§ (25 nodos) con objetos reales y los subárboles repetidos son los mismos que dibuja la clase.`,
    complejidad: R`
- **Tiempo: §O(2ⁿ)§.** Cada llamada con §n ≥ 2§ genera dos llamadas; en el peor caso el árbol es binario de profundidad §n§ y tiene a lo sumo §2ⁿ§ nodos. El número exacto es §2·F(n+1) − 1§.
- **Espacio: §O(n)§** (profundidad máxima de la pila). Aunque se hagan millones de llamadas, solo están **pendientes** a la vez las de una rama, que tiene a lo sumo §n§ marcos.
- Crecimiento: §fib(30)§ ≈ 2,7 millones de llamadas; §fib(40)§ ≈ 331 millones; la tabla de la clase de análisis asintótico muestra que 2ⁿ no escala.
- Por eso el siguiente paso es **recordar** lo ya calculado: [[rec-memo]] lo reduce a §O(n)§.`,
    errores: R`
- **Usar recursión ingenua cuando hay subproblemas solapados**: costo exponencial evitable (error frecuente de la clase).
- **Confundir «muchas llamadas» con «pila grande»**: el tiempo es §O(2ⁿ)§ pero la pila es solo §O(n)§.
- **Decir que el costo es §O(n)§** porque «el argumento baja de uno en uno»: aquí hay **dos** llamadas por nivel.
- **No definir los dos casos base** (§n = 0§ y §n = 1§): con un solo caso base la llamada §fib(n−2)§ puede pasar de largo.
- Olvidar que el resultado es correcto pero **inviable**: «funciona en la prueba pequeña» no justifica un algoritmo exponencial.`,
    preguntas: [
      ['¿Por qué Fibonacci ingenuo es §O(2ⁿ)§?', 'Porque cada llamada con §n ≥ 2§ genera dos llamadas y el árbol de llamadas tiene profundidad §n§; el número de nodos crece exponencialmente (exactamente §2·F(n+1) − 1§). Además recalcula los mismos subproblemas muchas veces.'],
      ['¿Cuántas llamadas hace §fib(5)§?', '**15** llamadas (§2·F(6) − 1 = 2·8 − 1§). §fib(3)§ aparece 2 veces, §fib(2)§ 3 veces y §fib(1)§ 5 veces.'],
      ['¿Qué espacio de pila usa §fib(n)§ ingenuo?', '§O(n)§: aunque haya un número exponencial de llamadas, solo está pendiente una rama a la vez y la más larga tiene §n§ marcos.'],
      ['¿Cómo se elimina el desperdicio?', 'Guardando cada resultado la primera vez (**memoización**) o calculando de abajo hacia arriba (programación dinámica **bottom-up**): pasa de §O(2ⁿ)§ a §O(n)§.']
    ],
    resumen: R`
- §fib(n) = fib(n−1) + fib(n−2)§ con bases §fib(0)=0§, §fib(1)=1§.
- El árbol de llamadas repite subproblemas ⇒ tiempo **§O(2ⁿ)§**, pila **§O(n)§**.
- Número de llamadas: §2·F(n+1) − 1§ (15 para n=5, 25 para n=6).
- Regla: **subproblemas solapados + recursión ingenua = exponencial**. Solución: memoización o DP.`
  });

  B.tema({
    id: 'rec-memo', area: 'rec', titulo: 'Memoización: recordar para no recalcular', fuente: 'S5-C2 · diap. 8, 19', nivel: 1, comp: true,
    conceptos: ['rc_cache', 'pd_memo'], interactivo: ['fib-memo'],
    definicion: R`
**Memoización**: guardar el resultado de cada subproblema **la primera vez** que se calcula y devolver ese valor guardado (la **caché**) cuando se vuelve a pedir. Convierte la recursión exponencial en lineal: **§O(2ⁿ)§ → §O(n)§**. La memoización es el **primer paso de la programación dinámica** y su enfoque *top-down*.`,
    intuicion: R`
Es tener un cuaderno de respuestas. Antes de resolver «¿cuánto es §fib(30)§?» miras en el cuaderno: si está, la copias en tiempo constante; si no, la calculas, **la anotas** y la devuelves. Cada subproblema distinto se calcula **una sola vez**, sin importar cuántas ramas lo pidan.

En el árbol de llamadas del tema anterior, la primera vez que aparece §fib(3)§ se calcula completo; las demás apariciones se convierten en **hojas** (consulta a la caché, §O(1)§) y todo el subárbol repetido desaparece.`,
    formal: R`
- Hay §n + 1§ subproblemas distintos (§fib(0)…fib(n)§). Cada uno se **calcula una vez** con trabajo propio constante (una suma y dos consultas) ⇒ trabajo total §O(n)§.
- Número de llamadas con caché: **§2n − 1§** (n=6 → 11 llamadas frente a 25; n=20 → 39 frente a 21 891). Las llamadas que consultan la caché cuestan §O(1)§.
- **Espacio**: la caché guarda §O(n)§ valores y la pila llega a profundidad §n§ ⇒ **§O(n)§**.
- **Condición para que sirva**: los subproblemas deben **solaparse** (repetirse) y el resultado debe depender solo de los argumentos.

Forma de la clase:

~~~
si n está en cache → devolver cache[n]      # ya calculado: O(1)
si no → calcular, guardar en cache[n], devolver
~~~`,
    procedimiento: R`
Para memoizar una recursión:

1. Escribe primero la recursión ingenua (caso base + fórmula).
2. Crea la **caché** (un diccionario cuya clave es el argumento).
3. Al inicio de la función, **tras el caso base**, consulta la caché: si ya está, devuélvela.
4. Calcula el valor con las llamadas recursivas (pasando la **misma** caché).
5. **Guarda** el valor en la caché antes de devolverlo.
6. Alternativa estándar: decorar con §@lru_cache(maxsize=None)§ de §functools§.`,
    codigo: [
      {
        titulo: 'Fibonacci con memoización (S5-C2, d.8) y número de llamadas',
        src: R`
llamadas = 0

def fib_memo(n, cache=None):
    global llamadas
    llamadas += 1
    if cache is None:         # cada llamada externa crea su propia caché
        cache = {}
    if n < 2:
        return n
    if n in cache:
        return cache[n]       # ya calculado: O(1)
    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    return cache[n]

for n in [6, 20]:
    llamadas = 0
    print("fib(" + str(n) + ") =", fib_memo(n), "| llamadas:", llamadas)
print(fib_memo(70))       # con la recursión ingenua sería imposible de esperar
`,
        esperado: 'fib(6) = 8 | llamadas: 11\nfib(20) = 6765 | llamadas: 39\n190392490709135'
      },
      {
        titulo: 'Versión con la biblioteca estándar (S5-C2, d.8)',
        src: R`
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(30))    # 832040: solo se calculan 31 valores distintos
`,
        esperado: '832040',
        nota: 'El decorador §lru_cache§ guarda automáticamente los resultados. Es la versión «de una línea» de la misma idea.'
      }
    ],
    ejemplo: R`
**Seguimiento de §fib_memo(5)§** (la caché arranca vacía; entre llaves, su contenido al guardar):

1. §fib(5)§ → pide §fib(4)§ → pide §fib(3)§ → pide §fib(2)§ → pide §fib(1)§ (base, 1) y §fib(0)§ (base, 0).
2. §fib(2) = 1§ → se guarda §{2: 1}§.
3. De vuelta en §fib(3)§: pide §fib(1)§ (base) → §fib(3) = 2§ → §{2: 1, 3: 2}§.
4. De vuelta en §fib(4)§: pide §fib(2)§ → **está en la caché** (1, O(1)) → §fib(4) = 3§ → §{2: 1, 3: 2, 4: 3}§.
5. De vuelta en §fib(5)§: pide §fib(3)§ → **está en la caché** → §fib(5) = 3 + 2 = 5§.

Total: **9 llamadas** (frente a 15 de la versión ingenua); en general §2n − 1§. Con §n = 20§: 39 llamadas contra 21 891.

El ejemplo interactivo de abajo construye el árbol de llamadas **con memoización**: observa que los subárboles que antes se repetían ya no existen (las consultas a la caché son hojas).`,
    complejidad: R`
- **Tiempo §O(n)§**: hay §n+1§ subproblemas distintos; cada uno se calcula una vez (trabajo constante) y el resto de las llamadas son consultas §O(1)§. Número total de llamadas §2n − 1§.
- **Espacio §O(n)§**: la caché guarda §n + 1§ valores y la pila alcanza profundidad §n§.
- Se **compra tiempo con memoria**: pasamos de §O(2ⁿ)§ a §O(n)§ gastando §O(n)§ de memoria (compromiso tiempo–espacio de la clase de análisis asintótico).
- La versión iterativa *bottom-up* (ver [[rec-vs-iter]]) también es §O(n)§ en tiempo y puede bajar a §O(1)§ de memoria si solo guarda los dos últimos valores.`,
    errores: R`
- **Caché mutable por defecto**: §def f(n, cache={})§ crea **un único diccionario** que se comparte entre todas las llamadas del programa (los valores por defecto se evalúan una sola vez). Puede dar resultados «mágicos» o erróneos si la función depende de más datos. La forma segura: §cache=None§ y crear el diccionario dentro.
- **No pasar la caché** en las llamadas recursivas: cada nivel crea la suya y se vuelve a la recursión ingenua.
- **Consultar la caché antes del caso base** o **olvidar guardar** el resultado antes de devolver.
- **Memoizar donde no hay solapamiento** (por ejemplo el recorrido de un árbol): no ahorra nada y gasta memoria.
- Creer que la memoización elimina la recursión: **sigue usando pila** (profundidad §n§).`,
    preguntas: [
      ['¿Por qué Fibonacci con memoización es §O(n)§?', 'Porque solo hay §n+1§ subproblemas distintos y cada uno se calcula **una vez** con trabajo constante; las demás llamadas son consultas a la caché en §O(1)§. El número total de llamadas es §2n − 1§.'],
      ['¿Qué riesgo tiene escribir §def f(n, cache={})§?', 'El diccionario por defecto se crea una sola vez y se **comparte entre todas las llamadas** de la función; se usa mejor §cache=None§ y se crea dentro de la función.'],
      ['¿Qué relación hay entre memoización y programación dinámica?', 'La memoización es el enfoque **top-down** de la programación dinámica (recursión natural + caché) y su primer paso; el otro enfoque es *bottom-up* (tabulación).'],
      ['Da la complejidad en tiempo y espacio de Fibonacci memoizado.', 'Tiempo §O(n)§; espacio §O(n)§ (caché de §n+1§ valores + pila de profundidad §n§).']
    ],
    resumen: R`
- **Memoizar** = guardar cada resultado la primera vez y reutilizarlo: §O(2ⁿ) → O(n)§.
- Solo sirve si los subproblemas **se solapan**.
- Llamadas con caché: **§2n − 1§**. Espacio: §O(n)§ (caché + pila).
- Trampa: §cache={}§ por defecto se comparte entre llamadas; usa §None§.
- Es la forma *top-down* de la programación dinámica.`
  });

  B.tema({
    id: 'rec-vs-iter', area: 'rec', titulo: 'Recursión frente a iteración (y la escalera)', fuente: 'S5-C2 · diap. 17-19', nivel: 1, comp: true,
    conceptos: ['rc_iter', 'rc_impl'], interactivo: [],
    definicion: R`
Casi todo problema recursivo se puede resolver también **iterando** (con ciclos). La recursión es más **natural y legible** cuando el problema se define a sí mismo (árboles, divide y vencerás); la iteración es más **eficiente en memoria** y no corre el riesgo de desbordar la pila. Elegir entre ambas es una decisión de diseño.

La clase compara tres versiones de Fibonacci: ingenua §O(2ⁿ)§, memoizada §O(n)§ y *bottom-up* iterativa §O(n)§ que, guardando solo los dos últimos valores, usa **§O(1)§ de memoria**.`,
    intuicion: R`
**Recursión** = «para saber §F(n)§, pregunto por §F(n−1)§ y §F(n−2)§» (de arriba hacia abajo). **Iteración bottom-up** = «empiezo con §F(0)§ y §F(1)§ y voy sumando hasta llegar a §F(n)§» (de abajo hacia arriba).

En el segundo caso nunca hace falta recordar más que los dos últimos números, como cuando cuentas escalones: solo necesitas saber en cuáles dos estabas.

**La escalera** (actividad de la clase): ¿de cuántas formas se sube una escalera de §n§ escalones dando pasos de 1 o 2? Para llegar al escalón §n§ vienes del §n−1§ (paso de 1) o del §n−2§ (paso de 2): §f(n) = f(n−1) + f(n−2)§, con §f(0) = f(1) = 1§. Es Fibonacci desplazado: 1, 1, 2, 3, 5, 8, 13…`,
    formal: R`
| Versión | Tiempo | Espacio extra | Riesgo |
|---|---|---|---|
| Recursiva ingenua | §O(2ⁿ)§ | §O(n)§ de pila | exponencial |
| Recursiva con memoización | §O(n)§ | §O(n)§ (caché + pila) | §RecursionError§ si §n§ ≳ 1000 |
| Iterativa bottom-up con tabla | §O(n)§ | §O(n)§ (tabla) | — |
| Iterativa con dos variables | §O(n)§ | **§O(1)§** | — |

- **Cuándo preferir cada una**: recursión (con memoización) cuando el problema es naturalmente recursivo y claro, sobre todo en árboles; iteración cuando la profundidad pueda superar el límite de pila o la memoria importe.
- **Riesgo exclusivo de la recursión**: el desbordamiento de pila (§RecursionError§); el límite por defecto de Python es ≈ 1000.
- Convertir recursión en ciclo con pila explícita pasa el espacio al montículo (suele ser mayor que el de pila de llamadas).`,
    procedimiento: R`
Para **pasar de recursión a iteración bottom-up**:

1. Identifica **de qué subproblemas depende** cada valor (§F(n)§ depende de §F(n−1)§ y §F(n−2)§).
2. Identifica el **orden**: calcula primero los que no dependen de nadie (los casos base) y avanza hacia §n§.
3. Decide **qué debes recordar**: toda una tabla, o solo los últimos valores.
4. Escribe el ciclo con esas variables y actualízalas en cada vuelta.
5. Comprueba con los mismos valores pequeños que la versión recursiva.`,
    codigo: {
      titulo: 'Escalera: ingenua, con memoización y bottom-up con O(1) de memoria',
      src: R`
def formas_ingenua(n):                 # O(2^n)
    if n <= 1:
        return 1
    return formas_ingenua(n - 1) + formas_ingenua(n - 2)

def formas_memo(n, cache=None):        # O(n) tiempo, O(n) memoria
    if cache is None:
        cache = {}
    if n <= 1:
        return 1
    if n not in cache:
        cache[n] = formas_memo(n - 1, cache) + formas_memo(n - 2, cache)
    return cache[n]

def formas_iter(n):                    # O(n) tiempo, O(1) memoria
    anterior, actual = 1, 1            # f(0), f(1)
    for _ in range(n - 1):
        anterior, actual = actual, anterior + actual
    return actual

print([formas_ingenua(i) for i in range(1, 8)])   # [1, 2, 3, 5, 8, 13, 21]
print(formas_memo(30), formas_iter(30))           # 1346269 1346269
print(formas_iter(60))
`,
      esperado: '[1, 2, 3, 5, 8, 13, 21]\n1346269 1346269\n2504730781961'
    },
    ejemplo: R`
**Escalera de 4 escalones** con la fórmula §f(n) = f(n−1) + f(n−2)§:

- §f(0) = 1§ (una forma: no subir) y §f(1) = 1§ (un paso).
- §f(2) = f(1) + f(0) = 2§ (1+1 ó 2).
- §f(3) = f(2) + f(1) = 3§ (1+1+1, 1+2, 2+1).
- §f(4) = f(3) + f(2) = 5§ (1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2).

**Bottom-up con dos variables** para §n = 4§ (la variable §anterior§ guarda §f(k−1)§ y §actual§ guarda §f(k)§):

| vuelta | anterior | actual |
|---|---|---|
| inicio | 1 | 1 |
| 1 | 1 | 2 |
| 2 | 2 | 3 |
| 3 | 3 | 5 |

Resultado §5§ con solo dos variables: **§O(1)§ de memoria**.

**Medición** (actividad de la clase): con §n = 35§ la versión ingenua hace 29 860 703 llamadas y tarda segundos; la memoizada, unas 69; la bottom-up, 34 sumas.`,
    complejidad: R`
- Ingenua: §O(2ⁿ)§ tiempo (ver [[rec-ingenua]]); §O(n)§ pila.
- Memoización: §O(n)§ tiempo; §O(n)§ memoria (caché y pila).
- Bottom-up con tabla: §O(n)§ tiempo, §O(n)§ memoria. Con dos variables: §O(n)§ tiempo y **§O(1)§** memoria.
- Justificación del §O(1)§: en cada vuelta el ciclo solo necesita los dos valores anteriores; todo lo demás se puede olvidar, y el número de variables no depende de §n§.
- Compromiso: la versión de §O(1)§ gana en memoria pero se pierde la «claridad» de la definición recursiva y no sirve si se necesitan valores arbitrarios del pasado.`,
    errores: R`
- **Preferir recursión por costumbre** en problemas donde la profundidad es grande (listas de miles de elementos): riesgo de §RecursionError§.
- **Creer que iterar siempre es mejor**: en árboles y divide y vencerás la recursión es mucho más clara.
- **Olvidar la actualización simultánea** de las dos variables en el ciclo (§anterior, actual = actual, anterior + actual§); si se actualizan por separado se pierde un valor.
- **Un ciclo de más o de menos**: revisa con §n = 1§ y §n = 2§.
- **Pensar que la bottom-up evita calcular subproblemas**: calcula **todos** los anteriores, pero cada uno una sola vez.`,
    preguntas: [
      ['¿Cuándo preferirías la versión recursiva y cuándo la iterativa de Fibonacci?', 'Recursiva (memoizada) cuando importa la claridad y la profundidad es moderada; iterativa cuando §n§ puede ser muy grande (riesgo de §RecursionError§) o se quiere memoria constante: la bottom-up con dos variables es §O(n)§ en tiempo y §O(1)§ en memoria.'],
      ['¿Qué riesgo tiene la recursión profunda que la iterativa no tiene?', 'El desbordamiento de pila: Python limita la profundidad (~1000) y la recursión usa un marco por llamada pendiente.'],
      ['Escribe la fórmula recursiva y el caso base de la escalera con pasos de 1 o 2. ¿A qué secuencia se parece?', '§f(n) = f(n−1) + f(n−2)§ con §f(0) = f(1) = 1§ (para llegar al escalón §n§ vienes del §n−1§ o del §n−2§). Es la secuencia de **Fibonacci**.'],
      ['¿Cuántas variables necesita Fibonacci *bottom-up* y por qué?', 'Dos (los dos últimos valores), porque §F(k)§ solo depende de §F(k−1)§ y §F(k−2)§; por eso la memoria extra es §O(1)§.']
    ],
    resumen: R`
- Recursión: clara y natural, pero usa **pila** (§O(profundidad)§) y puede desbordarla.
- Iteración bottom-up: sin pila; con dos variables, **§O(1)§** de memoria.
- Tres versiones de Fibonacci/escalera: ingenua §O(2ⁿ)§ → memo §O(n)§ → iterativa §O(n)§ + §O(1)§ memoria.
- Escalera de pasos 1 ó 2: §f(n) = f(n−1) + f(n−2)§, Fibonacci desplazado.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
