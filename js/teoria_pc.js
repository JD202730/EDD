/* teoria_pc.js — Biblioteca: área Pilas y colas (fuentes: S3-C2 Clase2_Pilas, 22 diap., y S4-C1 Clase1_ColasDeques, 22 diap.). */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  const PILA = R`
class Pila:
    def __init__(self):
        self._datos = []

    def apilar(self, x):                    # push
        self._datos.append(x)               # O(1) amortizado

    def desapilar(self):                    # pop
        if self.vacia():
            raise IndexError("desapilar de una pila vacia")
        return self._datos.pop()            # O(1): quita el ultimo

    def tope(self):                         # peek
        return self._datos[-1]              # O(1)

    def vacia(self):
        return len(self._datos) == 0
`;

  B.tema({
    id: 'pc-pila', area: 'pc', titulo: 'La pila (LIFO): TAD, costos e implementación sobre una lista', fuente: 'S3-C2 · diap. 4-9, 16, 18-19', nivel: 11,
    conceptos: ['pc_pila'], lab: [{ tab: 'pilas', e: 'pila', texto: 'Ver apilar y desapilar' }], alias: 'stack lifo push pop peek tope apilar desapilar',
    definicion: R`
Una **pila** organiza elementos §s₁, …, sₙ§ con disciplina **LIFO** (*Last In, First Out*): el **último en entrar es el primero en salir**. Dos operaciones fundamentales:

- §apilar(x)§ (*push*): pone §x§ en el **tope**.
- §desapilar()§ (*pop*): quita y devuelve el **tope**.

Y una de consulta: §tope()§ (*peek*): lee el elemento superior **sin quitarlo**. **El único elemento accesible de inmediato es el tope**: para llegar a los de abajo hay que ir desapilando.`,
    intuicion: R`
Una **pila de platos**: lavas primero el último que pusieron arriba. Cuando presionas **Ctrl+Z** repetidamente, las acciones se deshacen **en orden inverso** al de ejecución: la última acción es la primera que se deshace. La **pila de llamadas** de la semana 1 (cada llamada apila un marco, y al retornar se desapila) y esta estructura son **la misma idea**.

La pregunta que resuelve una pila es siempre: **¿cuál fue lo último que hice y aún debo resolver?**`,
    formal: R`
**Tabla de operaciones** (diap. 7):

| Operación | Tiempo | Descripción |
|---|---|---|
| Acceso al tope | §O(1)§ | leer el elemento superior sin quitarlo (*tope/peek*) |
| Acceso interno | §O(n)§ | un elemento cualquiera exige desapilar hasta §n§ veces |
| Búsqueda | §O(n)§ | puede requerir desapilar toda la pila |
| Inserción en el tope | §O(1)§ | *apilar*: se coloca el nuevo elemento arriba |
| Eliminación del tope | §O(1)§ | *desapilar*: se quita el elemento superior |

**La firma de la pila:** todo lo que ocurre **en el tope es §O(1)§**; todo lo que exige **mirar adentro es §O(n)§**. La pila premia a quien solo necesita el último elemento.

**Implementación sobre una lista de Python:** §list.append§ y §list.pop()§ operan en el **extremo derecho**: §O(1)§. **Clave:** se usa el **final** de la lista como tope; usar el inicio (§insert(0, x)§, §pop(0)§) sería §O(n)§.

**Aplicaciones clásicas** (diap. 9): **deshacer / rehacer**; **balanceo de paréntesis** (tema [[pc-balanceo]]); **pila de llamadas** (la recursión es una pila); **recorrido DFS** (la búsqueda en profundidad usa una pila, explícita o la de llamadas); **pila monótona** (tema [[pc-monotona]]).`,
    procedimiento: R`
**Para trabajar con una pila:**

1. **Decide qué extremo es el tope** (el final de la lista).
2. **Antes de desapilar**, comprueba que **no esté vacía** (si no, §IndexError§).
3. Distingue **tope** (mira sin quitar) de **desapilar** (quita y devuelve).
4. Para **trazar** una secuencia, escribe el contenido tras cada operación, con el tope a la derecha.

**Traza (diap. 19):** apile 3, 7, 1; desapile; apile 9; ¿cuál es el tope?

1. apilar 3 → §[3]§; apilar 7 → §[3, 7]§; apilar 1 → §[3, 7, 1]§.
2. desapilar → sale **1**, §[3, 7]§.
3. apilar 9 → §[3, 7, 9]§. **El tope es 9.**`,
    codigo: [{
      titulo: 'La clase Pila de la diapositiva 8 y la traza de la verificación formativa',
      src: PILA + R`
p = Pila()
for x in [3, 7, 1]:
    p.apilar(x)
print(p.tope(), p._datos)
print(p.desapilar(), p._datos)          # sale 1
p.apilar(9)
print(p.tope(), p._datos)

vacia = Pila()
try:
    vacia.desapilar()
except IndexError as e:
    print("IndexError:", e)

# usar el INICIO de la lista como tope seria O(n): cada insert(0, x) desplaza todo
movimientos = 0
mala = []
for x in range(10):
    movimientos += len(mala)            # insert(0, x) desplaza len(mala) elementos
    mala.insert(0, x)
print("desplazamientos con insert(0):", movimientos)
`,
      esperado: '1 [3, 7, 1]\n1 [3, 7]\n9 [3, 7, 9]\nIndexError: desapilar de una pila vacia\ndesplazamientos con insert(0): 45'
    }],
    ejemplo: R`
**Pila de acciones de un editor.** El usuario escribe «a», «b», «c» y pulsa Ctrl+Z dos veces:

| Acción | Pila de acciones (tope a la derecha) | Efecto |
|---|---|---|
| escribir a | §[a]§ | — |
| escribir b | §[a, b]§ | — |
| escribir c | §[a, b, c]§ | — |
| Ctrl+Z | §[a, b]§ | deshace **c** |
| Ctrl+Z | §[a]§ | deshace **b** |

**Justifica la elección (diap. 13):** un historial de deshacer se agrega y se quita **siempre por el mismo extremo** y **nunca** se accede al i-ésimo elemento ⇒ **pila** (sobre arreglo o lista de Python: tope en el final), no una lista enlazada ni un arreglo con inserciones al inicio.`,
    complejidad: R`
- **apilar, desapilar, tope, vacía:** **§O(1)§** (§append§ es amortizado).
- **Acceso al elemento interno, búsqueda:** **§O(n)§** (hay que desapilar).
- **Espacio:** §O(n)§ para §n§ elementos.
- **Con el tope en el inicio de una lista de Python:** apilar y desapilar pasan a §O(n)§ y una secuencia de §n§ operaciones a §O(n²)§.
- **Pila de llamadas:** una recursión de profundidad §n§ usa §O(n)§ de espacio de pila.`,
    errores: R`
- **Implementar la pila con §insert(0, x)§ / §pop(0)§:** eso es §O(n)§; usa el **final** de la lista.
- **Desapilar sin verificar si está vacía:** §IndexError§.
- **Confundir §tope§ (mira sin quitar) con §desapilar§ (quita y devuelve).**
- **Creer que se puede acceder a la posición §i§ en §O(1)§:** solo el tope es accesible de inmediato.
- **Confundir pila (LIFO) con cola (FIFO):** en la cola sale el primero que entró.`,
    preguntas: [
      ['Enuncia la disciplina LIFO y da la firma de apilar, desapilar y tope.', 'LIFO: el último en entrar es el primero en salir. apilar(x) pone x en el tope; desapilar() quita y devuelve el tope; tope() lo lee sin quitarlo.'],
      ['¿Por qué el acceso al tope es O(1) y el acceso a un elemento interno es O(n)?', 'Porque el tope es el único extremo accesible directamente; para llegar a un elemento interno hay que desapilar todos los que están encima (hasta n veces).'],
      ['Traza: apila 3, 7, 1; desapila; apila 9; ¿cuál es el tope?', 'Tras apilar 3, 7, 1 la pila es [3, 7, 1]; desapilar saca el 1 → [3, 7]; apilar 9 → [3, 7, 9]; el tope es 9.'],
      ['¿Por qué sobre una lista de Python el tope debe ser el final?', 'Porque append y pop() operan en el extremo derecho en O(1); usar el inicio (insert(0, x), pop(0)) desplazaría todos los elementos: O(n).']
    ],
    resumen: R`
- **Pila = LIFO:** §apilar§, §desapilar§, §tope§; solo el tope es accesible.
- **Tope §O(1)§**, apilar §O(1)§, desapilar §O(1)§; **interior §O(n)§**.
- Sobre una §list§: tope = **final** (§append§/§pop()§).
- Usos: deshacer, balanceo de símbolos, pila de llamadas, DFS, pila monótona.`
  });

  B.tema({
    id: 'pc-balanceo', area: 'pc', titulo: 'Balanceo de símbolos con una pila (y por qué un contador no basta)', fuente: 'S3-C2 · diap. 9-10, 18, 21', nivel: 11,
    conceptos: ['pc_apps'], lab: [{ tab: 'pilas', e: 'bal', texto: 'Ver el balanceo animado' }], alias: 'parentesis balanceo anidamiento llaves corchetes',
    definicion: R`
**Balanceo de símbolos:** un editor de código debe validar que los paréntesis §()§, corchetes §[]§ y llaves §{}§ estén **correctamente balanceados y anidados**: §([]{})§ es válido; §([)]§ **no** lo es.

Con una **pila**: se **apila cada apertura**; ante cada **cierre**, el tope debe ser **su apertura correspondiente** y se **desapila**; si al final **la pila no está vacía** (o un cierre llega con la pila vacía o con otra apertura en el tope), hay desbalance.`,
    intuicion: R`
Los símbolos se **anidan como cajas dentro de cajas**: la última caja que abriste es la **primera que debes cerrar**. Eso es exactamente **LIFO**.

Un **contador** (sumar 1 al abrir, restar 1 al cerrar) solo sabe **cuántos** hay abiertos, no **cuáles** ni en qué orden. Por eso acepta por error §([)]§: termina en 0, aunque el §]§ cierra a un §(§ y el §)§ cierra a un §[§. **La pila recuerda cuál fue la última apertura pendiente.**`,
    formal: R`
**Algoritmo:**

~~~
pila = vacía;  pares = {")": "(", "]": "[", "}": "{"}
para cada símbolo c del texto:
    si c es apertura:      apilar c
    si c es cierre:
        si la pila está vacía  O  desapilar() ≠ pares[c]:  devolver Falso
devolver (la pila está vacía)
~~~

**Corrección:** el invariante es que la pila contiene, de base a tope, las aperturas pendientes **en el orden en que deben cerrarse al revés**. **Costo:** cada símbolo se apila y desapila a lo sumo una vez: **§O(n)§** tiempo y §O(n)§ espacio (en el peor caso, solo aperturas).

**Los tres modos de fallar:** (1) cierre con la pila **vacía** (§())§: falta una apertura); (2) cierre que **no coincide** con el tope (§([)]§); (3) **quedan aperturas** sin cerrar al terminar (§((§).`,
    procedimiento: R`
**A mano** con §"([)]"§:

1. §(§ → apilar → §[(]§.
2. §[§ → apilar → §[(, []§.
3. §)§ → es cierre; el tope es §[§ y debería ser §(§ → **mal anidado** → Falso.

**A mano** con §"{[()()]}"§: aperturas §{§, §[§, §(§ → cierre §)§ coincide con §(§ (desapila) → §(§ de nuevo → §)§ → §]§ coincide con §[§ → §}§ coincide con §{§ → la pila queda vacía → **Verdadero**.

**Pregunta de análisis (diap. 10):** ¿por qué una pila resuelve esto y un contador no? Da un ejemplo que el contador aceptaría por error: §([)]§ (cuatro símbolos, dos aperturas y dos cierres, pero mal anidados).`,
    codigo: [{
      titulo: 'Balanceo con una pila y la versión incorrecta con un contador',
      src: R`
def balanceado(texto):
    pila = []
    pares = {")": "(", "]": "[", "}": "{"}
    for c in texto:
        if c in "([{":
            pila.append(c)              # abre: se apila
        elif c in ")]}":
            if not pila or pila.pop() != pares[c]:
                return False            # cierra sin abrir, o no coincide
    return len(pila) == 0               # quedo algo abierto?

def contador_ingenuo(texto):            # INCORRECTO: no detecta el mal anidamiento
    cuenta = 0
    for c in texto:
        if c in "([{":
            cuenta += 1
        elif c in ")]}":
            cuenta -= 1
            if cuenta < 0:
                return False
    return cuenta == 0

for t in ["([]{})", "([)]", "((", "())", "{[()()]}", ""]:
    print(repr(t), balanceado(t), contador_ingenuo(t))
`,
      esperado: '\'([]{})\' True True\n\'([)]\' False True\n\'((\' False False\n\'())\' False False\n\'{[()()]}\' True True\n\'\' True True'
    }],
    ejemplo: R`
**Comparación pila vs. contador:**

| Texto | Pila | Contador | ¿Quién tiene razón? |
|---|---|---|---|
| §([]{})§ | ✔ | ✔ | los dos |
| §([)]§ | **✘** | ✔ (¡error!) | la pila (mal anidado) |
| §((§ | ✘ | ✘ | los dos (faltan cierres) |
| §())§ | ✘ | ✘ | los dos (cierre sin apertura) |
| §""§ | ✔ | ✔ | los dos (nada que balancear) |

**El contador solo sirve cuando hay un único tipo de símbolo** (por ejemplo, solo paréntesis redondos); con **varios tipos** hace falta la pila, porque importa **cuál** se abrió.`,
    complejidad: R`
- **Tiempo:** **§O(n)§** (cada símbolo se procesa una vez; apilar/desapilar son §O(1)§).
- **Espacio:** **§O(n)§** en el peor caso (una cadena de solo aperturas); §O(profundidad de anidamiento)§ en general.
- **Contador:** §O(n)§ tiempo y §O(1)§ espacio, pero **incorrecto** con varios tipos de símbolos.
- El mismo patrón sirve para **evaluar expresiones** y comprobar etiquetas HTML/XML anidadas.`,
    errores: R`
- **Resolver el balanceo con un contador:** no detecta el mal anidamiento (§([)]§).
- **Desapilar sin comprobar si la pila está vacía:** §IndexError§ con un cierre de más.
- **Olvidar la comprobación final** (§len(pila) == 0§): §((§ quedaría como válido.
- **No comparar el tope con la apertura correspondiente** (solo desapilar): acepta §([)]§.
- **Ignorar los caracteres que no son símbolos** (letras, números): deben saltarse.`,
    preguntas: [
      ['¿Por qué una pila resuelve el balanceo de símbolos y un contador no? Da un ejemplo que el contador aceptaría por error.', 'Porque lo que importa es cuál fue la última apertura pendiente (LIFO), no solo cuántas hay. El contador acepta ([)] (termina en 0) aunque esté mal anidado; la pila detecta que el tope es [ cuando llega ).'],
      ['Describe el algoritmo de balanceo con una pila y su complejidad.', 'Se apila cada apertura; ante un cierre se verifica que la pila no esté vacía y que el tope sea la apertura correspondiente (se desapila); al final la pila debe quedar vacía. O(n) tiempo y O(n) espacio.'],
      ['¿Qué tres situaciones hacen que un texto esté desbalanceado?', 'Un cierre con la pila vacía; un cierre que no coincide con el tope (mal anidado); aperturas que quedan sin cerrar al terminar.'],
      ['¿Es válido §{[()()]}§? Justifica con la pila.', 'Sí: se apilan {, [, (; el primer ) desapila (, se apila ( otra vez y ) la desapila; ] desapila [; } desapila {; la pila queda vacía.']
    ],
    resumen: R`
- **Pila de aperturas:** cierre ⇒ el tope debe ser **su** apertura; al final, **pila vacía**.
- **Contador** ✘: acepta §([)]§; solo vale con **un** tipo de símbolo.
- Fallos: cierre con pila vacía, cierre que no coincide, aperturas sin cerrar.
- **§O(n)§** tiempo y espacio.`
  });

  B.tema({
    id: 'pc-monotona', area: 'pc', titulo: 'La pila monótona: próximo elemento mayor en O(n)', fuente: 'S3-C2 · diap. 11-15, 17-18', nivel: 11,
    conceptos: ['pc_mon'], lab: [{ tab: 'pilas', e: 'mon', texto: 'Ver la pila monótona animada' }], alias: 'pila monotona temperaturas proximo mayor stack monotonic',
    definicion: R`
**Problema (días hasta un día más caluroso):** dado un arreglo de temperaturas §T = [t₀, …, tₙ₋₁]§, hallar para cada día §i§ **cuántos días §dᵢ§ faltan** hasta encontrar una temperatura **mayor**; si no la hay, §dᵢ = 0§. El enfoque ingenuo (mirar hacia adelante desde cada día) es §O(n²)§.

La **pila monótona** lo resuelve en **§O(n)§**: la pila guarda los **índices de los días que todavía esperan** un día más caluroso, de modo que sus temperaturas queden en **orden no creciente de la base al tope**.`,
    intuicion: R`
Imagina una **fila de personas** esperando que llegue alguien **más alto** que ellas. Cada vez que llega una persona nueva, **todas las que son más bajas que ella** en el frente de la fila **ya encontraron lo que esperaban**: se van (se desapilan) y se anota **cuánto esperaron** (§i − k§). La persona nueva se suma a la fila de los que esperan.

**¿Por qué es §O(n)§ y no §O(n²)§?** Hay un §while§ dentro del §for§, pero **cada índice se apila una vez y se desapila a lo sumo una vez**: **2n** operaciones en total. Es un **conteo amortizado**.`,
    formal: R`
**Regla al llegar al día §i§:** mientras la pila no esté vacía y §T[tope] < T[i]§:

- el día en espera §k = tope§ **ya encontró** su día más caluroso: es §i§;
- se **desapila** §k§ y se escribe §D[k] = i − k§.

Luego se **apila §i§** (aún espera su propio día más caluroso). Los índices que **quedan en la pila** al final **nunca** encontraron un día más caluroso: §D = 0§.

**Traza** con §T = [6, 8, 5, 4, 3, 7, 9, 6]§ (diap. 13):

| Día §i§ (tᵢ) | Acción | Pila (índices) |
|---|---|---|
| 0 (6) | apilar 0 | §[0]§ |
| 1 (8) | §8 > 6§: desapilar 0, §D[0] = 1§; apilar 1 | §[1]§ |
| 2 (5) | apilar 2 | §[1, 2]§ |
| 3 (4) | apilar 3 | §[1, 2, 3]§ |
| 4 (3) | apilar 4 | §[1, 2, 3, 4]§ |
| 5 (7) | §7 > 3, 4, 5§: pop 4, 3, 2 (§D[4]=1, D[3]=2, D[2]=3§); apilar 5 | §[1, 5]§ |
| 6 (9) | §9 > 7, 8§: pop 5 (§D[5]=1§), pop 1 (§D[1]=5§); apilar 6 | §[6]§ |
| 7 (6) | apilar 7 | §[6, 7]§ |

**Resultado:** §D = [1, 5, 3, 2, 1, 1, 0, 0]§. Los índices 6 y 7 quedan en la pila: nunca hallaron un día más caluroso.`,
    procedimiento: R`
**Adaptar la técnica** (pregunta de análisis, diap. 15):

1. **Próximo día más frío:** cambia la comparación: desapila mientras §T[tope] > T[i]§.
2. **Día más caluroso anterior** (mirando hacia atrás): recorre **de derecha a izquierda**, o bien, recorriendo hacia adelante, **el índice que queda en el tope antes de apilar §i§** (tras desapilar los menores o iguales) es el anterior mayor.
3. Si se necesitan **índices**, guarda **índices** (no valores) en la pila: el valor se recupera con §T[índice]§.

**Señal de que conviene una pila monótona:** «para cada elemento, el **próximo/anterior** elemento **mayor/menor**» (histogramas, precios de acciones, señales). **Señal de que basta una pila simple:** «el **último** elemento pendiente» (deshacer, paréntesis).`,
    codigo: [{
      titulo: 'dias_hasta_mas_calor (diapositiva 14), con traza de la pila y la variante «próximo más frío»',
      src: R`
def dias_hasta_mas_calor(T):
    n = len(T)
    D = [0] * n
    pila = []                           # guarda INDICES en espera
    for i in range(n):
        # mientras el tope tenga temperatura menor que la de hoy ...
        while pila and T[pila[-1]] < T[i]:
            k = pila.pop()              # ese dia ya encontro su dia mas caluroso
            D[k] = i - k
        pila.append(i)                  # hoy tambien queda en espera
    return D

T = [6, 8, 5, 4, 3, 7, 9, 6]
print(dias_hasta_mas_calor(T))

def traza(T):
    pila = []
    for i in range(len(T)):
        while pila and T[pila[-1]] < T[i]:
            pila.pop()
        pila.append(i)
        print("dia", i, "T =", T[i], "pila =", pila)

traza(T)

def dias_hasta_mas_frio(T):             # variante: cambia solo la comparacion
    n = len(T)
    D = [0] * n
    pila = []
    for i in range(n):
        while pila and T[pila[-1]] > T[i]:
            k = pila.pop()
            D[k] = i - k
        pila.append(i)
    return D

print(dias_hasta_mas_frio(T))
`,
      esperado: '[1, 5, 3, 2, 1, 1, 0, 0]\ndia 0 T = 6 pila = [0]\ndia 1 T = 8 pila = [1]\ndia 2 T = 5 pila = [1, 2]\ndia 3 T = 4 pila = [1, 2, 3]\ndia 4 T = 3 pila = [1, 2, 3, 4]\ndia 5 T = 7 pila = [1, 5]\ndia 6 T = 9 pila = [6]\ndia 7 T = 6 pila = [6, 7]\n[2, 1, 1, 1, 0, 2, 1, 0]'
    }],
    ejemplo: R`
**Actividad de la clase:** niveles de activación de una neurona en 10 pasos de tiempo; hallar, en cada paso, cuántos pasos faltan hasta una activación **mayor**. Por ejemplo, con §A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3]§:

1. Se aplica la pila monótona (índices en espera).
2. El resultado es §D = [2, 1, 2, 1, 1, 0, 1, 0, 0, 0]§ (en el índice 5, el 9, nunca llega uno mayor).
3. Al final quedan en la pila los pasos §5, 7, 8, 9§… **no hallaron** una activación mayor después.
4. **¿Por qué no es cuadrático?** Cada índice entra una vez y sale a lo sumo una vez: 2n operaciones.

**El patrón reaparece** en histogramas (rectángulo más grande), precios de acciones (días hasta una cotización mayor) y señales (siguiente pico).`,
    complejidad: R`
- **Tiempo:** **§O(n)§** (amortizado): cada índice se apila una vez y se desapila a lo sumo una vez → a lo sumo **2n** operaciones.
- **Espacio:** **§O(n)§** (la pila puede llegar a guardar todos los índices, p. ej., con temperaturas decrecientes) más el arreglo de resultados.
- **Ingenuo:** §O(n²)§ (para cada día se mira hacia adelante hasta hallar uno mayor).
- El §while§ interno **no** multiplica el costo: lo que se desapila no se vuelve a apilar.`,
    errores: R`
- **Creer que es §O(n²)§ por el §while§:** es §O(n)§ amortizado.
- **Guardar valores en la pila cuando se necesitan índices** (o al revés): no se puede calcular §i − k§.
- **Desapilar con la comparación equivocada** (§<§ vs §<=§): cambia cómo se tratan los valores **iguales**.
- **Olvidar apilar §i§ después del §while§:** el día actual también espera.
- **No inicializar §D§ con ceros:** los días que nunca hallan un mayor deben quedar en 0.`,
    preguntas: [
      ['Explica por qué la pila monótona recorre cada índice a lo sumo dos veces.', 'Cada índice se apila exactamente una vez y se desapila a lo sumo una vez, de modo que hay a lo sumo 2n operaciones de pila en total (conteo amortizado), aunque haya un while dentro del for.'],
      ['Dado §T = [6, 8, 5, 4, 3, 7, 9, 6]§, ¿cuál es §D§ y qué índices quedan en la pila?', 'D = [1, 5, 3, 2, 1, 1, 0, 0]. Quedan en la pila los índices 6 y 7, que nunca hallaron un día más caluroso.'],
      ['¿Qué cambio mínimo haría que calcule el próximo día más frío?', 'Invertir la comparación del while: desapilar mientras T[tope] > T[i] (en vez de <).'],
      ['Da un caso de IA donde interese el próximo valor mayor de una secuencia.', 'Detectar el próximo pico en una señal o en una serie de activaciones de una neurona, el próximo precio mayor en una serie financiera, o histogramas (rectángulo más grande).']
    ],
    resumen: R`
- Pila de **índices** de días que aún **esperan** un día más caluroso.
- Al llegar §i§: **desapila** los de temperatura menor (§D[k] = i − k§) y **apila** §i§.
- Cada índice entra y sale **una vez**: **§O(n)§** amortizado (ingenuo §O(n²)§).
- Patrón «próximo mayor/menor»; los índices que quedan en la pila no tuvieron respuesta (§D = 0§).`
  });

  B.tema({
    id: 'pc-cola', area: 'pc', titulo: 'La cola (FIFO) y por qué una lista de Python es una mala cola', fuente: 'S4-C1 · diap. 4-7, 9, 18-19', nivel: 11,
    conceptos: ['pc_cola'], lab: [{ tab: 'pilas', e: 'cola', texto: 'Comparar list.pop(0) con deque' }], alias: 'queue fifo encolar desencolar enqueue dequeue pop(0)',
    definicion: R`
Una **cola** organiza elementos §q₁, …, qₙ§ con disciplina **FIFO** (*First In, First Out*): el **primero en entrar es el primero en salir**. Tiene dos extremos: el **frente** (*head*, de donde se saca) y el **final** (*tail*, por donde se entra). Operaciones fundamentales:

- §encolar(x)§ (*enqueue*): añade §x§ al **final**.
- §desencolar()§ (*dequeue*): quita y devuelve el **frente**.

La **firma de la cola**: igual que la pila, todo ocurre en los **extremos en §O(1)§**; mirar adentro es §O(n)§. La diferencia con la pila es **cuál extremo entrega el elemento**: el **opuesto** al de entrada.`,
    intuicion: R`
La **fila del banco** es una cola (se atiende primero a quien llegó primero); la **pila de platos** no. Ambas guardan y sacan elementos, pero con **disciplinas opuestas**.

**¿Por qué una §list§ es mala cola?** Si el frente es el índice 0, desencolar es §lista.pop(0)§, que **desplaza todos los elementos una posición**: §O(n)§. Una cola de §n§ operaciones se vuelve §O(n²)§: con §n = 10⁶§ son del orden de **10¹²** movimientos. Encolar con §append§ sí es §O(1)§; el problema es **sacar del frente**. La solución es §collections.deque§ (tema [[pc-deque]]).`,
    formal: R`
**Tabla de operaciones de la cola** (diap. 6):

| Operación | Tiempo | Descripción |
|---|---|---|
| Acceso al frente | §O(1)§ | leer el primer elemento sin quitarlo |
| Acceso interno | §O(n)§ | un elemento cualquiera exige desencolar hasta §n§ veces |
| Búsqueda | §O(n)§ | puede requerir recorrer toda la cola |
| Encolar (al final) | §O(1)§ | se agrega el nuevo elemento en el final |
| Desencolar (del frente) | §O(1)§ | se quita el elemento del frente |

**Con una §list§:** §cola.append(x)§ → §O(1)§ (bien); §cola.pop(0)§ → **§O(n)§** (mal).

**Pila vs. cola** (diap. 16 de la clase de pilas):

| | **Pila (LIFO)** | **Cola (FIFO)** |
|---|---|---|
| Sale primero | el último que entró | el primero que entró |
| Se opera en | un solo extremo (tope) | dos extremos (frente y final) |
| Recorrido de grafos | **DFS** (profundidad) | **BFS** (anchura) |
| Ejemplo cotidiano | pila de platos | fila del banco |`,
    procedimiento: R`
**Para decidir si usar cola o pila:** pregunta **¿quién sale primero?**

- «El **más antiguo**» (atender en orden de llegada, BFS, búfer, *data loader*) → **cola**.
- «El **más reciente**» (deshacer, DFS, paréntesis) → **pila**.

**Pregunta de análisis (diap. 9):** un servidor recibe peticiones y las atiende en orden de llegada, miles por segundo. **¿list o deque?** Con §list§ y §pop(0)§, procesar §n§ peticiones cuesta §O(n²)§; con §deque§ y §popleft()§, §O(n)§. Con §n = 10⁶§ la diferencia es de **10¹² frente a 10⁶** operaciones elementales.

**Boleto de salida:** escribe una señal que te diga «aquí va una cola» (orden de llegada, el más antiguo primero) y otra «aquí va una pila» (lo último que hice y aún debo resolver).`,
    codigo: [{
      titulo: 'Contar los desplazamientos de list.pop(0) frente a deque.popleft()',
      src: R`
from collections import deque

def procesar_con_lista(n):
    cola = []
    desplazamientos = 0
    for i in range(n):
        cola.append(i)                  # O(1)
    while cola:
        desplazamientos += len(cola) - 1    # pop(0) desplaza a todos los demas
        cola.pop(0)
    return desplazamientos

def procesar_con_deque(n):
    cola = deque()
    movimientos = 0
    for i in range(n):
        cola.append(i)
    while cola:
        cola.popleft()                  # O(1): nada se desplaza
        movimientos += 1
    return movimientos

for n in [10, 100, 1000]:
    print(n, procesar_con_lista(n), procesar_con_deque(n))
print("para n = 10**6:", 10**6 * (10**6 - 1) // 2, "desplazamientos con list frente a", 10**6)
`,
      esperado: '10 45 10\n100 4950 100\n1000 499500 1000\npara n = 10**6: 499999500000 desplazamientos con list frente a 1000000'
    }],
    ejemplo: R`
**Costo total de atender §n§ peticiones**

| §n§ | §list§ con §pop(0)§ | §deque§ con §popleft()§ |
|---|---|---|
| 10 | 45 | 10 |
| 100 | 4 950 | 100 |
| 1 000 | 499 500 | 1 000 |
| 10⁶ | ≈ 5 × 10¹¹ | 10⁶ |

La suma de desplazamientos es §(n − 1) + (n − 2) + … + 0 = n(n − 1)/2§: **cuadrática**. Con la deque, cada desencolar cuesta una operación.

**Aplicaciones de las colas:** recorrido **BFS** (semana 12: nivel por nivel con una cola de nodos por visitar), **búferes y *streaming*** (audio, paquetes de red, *frames* de video), **planificación de tareas** (el sistema operativo encola procesos listos), **IA: *data loaders* y *prefetching*** (la cola desacopla la lectura de disco del cómputo de la GPU).`,
    complejidad: R`
- **Encolar y desencolar** (con deque o cola circular): **§O(1)§**. Frente: §O(1)§. Interior y búsqueda: §O(n)§.
- **Con §list§:** encolar §O(1)§ amortizado, **desencolar §O(n)§** → una cola de §n§ operaciones cuesta **§O(n²)§**.
- **Espacio:** §O(n)§.
- **Recorridos de grafos:** pila → DFS; cola → BFS (ambos §O(V + E)§ con la estructura adecuada).`,
    errores: R`
- **Implementar una cola con §list§ y §pop(0)§:** convierte §n§ operaciones en §O(n²)§.
- **Confundir cola con pila:** la cola saca al **primero** que entró.
- **Creer que una cola de prioridad es una cola FIFO:** no lo es: sale el más urgente (ver [[hp-cola-prioridad]]).
- **Acceder por índice** a una cola/deque en un bucle: §O(n)§.
- **Olvidar comprobar que la cola no esté vacía** antes de desencolar.`,
    preguntas: [
      ['Enuncia FIFO y da la firma de encolar y desencolar.', 'FIFO: el primero en entrar es el primero en salir. encolar(x) añade x al final; desencolar() quita y devuelve el frente.'],
      ['¿Por qué §list.pop(0)§ es O(n) y §deque.popleft()§ es O(1)?', 'pop(0) quita el primer elemento y desplaza todos los demás una posición a la izquierda (n − 1 movimientos); la deque es una lista de bloques doblemente enlazada y quitar el frente solo mueve un puntero.'],
      ['Un servidor atiende miles de peticiones por segundo en orden de llegada. ¿list o deque? Compara la complejidad total con n = 10⁶.', 'Una deque. Con list y pop(0) procesar n peticiones es O(n²) (≈ 5 × 10¹¹ desplazamientos para n = 10⁶); con deque y popleft es O(n) (≈ 10⁶).'],
      ['¿Qué recorrido de grafos usa una cola y cuál usa una pila?', 'BFS (anchura) usa una cola; DFS (profundidad) usa una pila.']
    ],
    resumen: R`
- **Cola = FIFO:** entra por el **final**, sale por el **frente**; ambos extremos §O(1)§, interior §O(n)§.
- **§list§ es mala cola:** §pop(0)§ es §O(n)§ ⇒ §O(n²)§ en total. Usa **§collections.deque§** (§popleft()§ §O(1)§).
- Pila → DFS; cola → **BFS**, búferes, planificación, *data loaders*.
- La cola de prioridad **no** es FIFO.`
  });

  B.tema({
    id: 'pc-deque', area: 'pc', titulo: 'collections.deque: O(1) en ambos extremos', fuente: 'S4-C1 · diap. 8, 14-15, 18, 20', nivel: 11,
    conceptos: ['pc_deque'], lab: [{ tab: 'pilas', e: 'cola', texto: 'Ver deque: appendleft y pop' }], alias: 'deque cola doble extremos appendleft popleft cola prioridad bfs',
    definicion: R`
Una **deque** (*double-ended queue*, «cola doble») permite **insertar y eliminar en ambos extremos en §O(1)§**. Internamente es una **lista de bloques doblemente enlazada**, no un arreglo contiguo. En Python vive en §collections.deque§:

- §append(x)§ / §appendleft(x)§: insertar por el final / por el frente.
- §pop()§ / §popleft()§: quitar por el final / por el frente.

Con la deque se obtiene una **cola FIFO correcta** (§append§ + §popleft§) y también una **pila** (§append§ + §pop§).`,
    intuicion: R`
La deque es como una **fila con puerta en cada extremo**: puedes entrar o salir por cualquiera de los dos lados sin que nadie tenga que correrse. Se logra porque no es un arreglo (donde mover el extremo izquierdo obliga a correr todo), sino **bloques enlazados** por ambos lados.

**Una advertencia:** acceder por **índice** a una deque en un bucle (§d[i]§) es §O(n)§: la deque está pensada para **extremos**, no para acceso aleatorio.

**La cola de prioridad** es otra cosa: no es FIFO; sale el de mayor (o menor) prioridad y se implementa con un **heap** (tema [[hp-cola-prioridad]]).`,
    formal: R`
**Comparación §list§ vs. §deque§:**

| Operación | §list§ | §deque§ |
|---|---|---|
| insertar/quitar **al final** | §O(1)§ | §O(1)§ |
| insertar/quitar **al inicio** | §O(n)§ | **§O(1)§** |
| acceso por índice §d[i]§ | §O(1)§ | §O(n)§ |
| memoria | arreglo contiguo | bloques enlazados |

**Cola FIFO correcta** (diap. 8):

~~~
from collections import deque
cola = deque()
cola.append("a")        # encolar al final   O(1)
cola.append("b")
cola.popleft()          # desencolar del frente O(1)  -> "a"
d = deque([1, 2, 3])
d.appendleft(0)         # 0 1 2 3   O(1)
d.pop()                 # quita 3   O(1)
~~~

**Cola de prioridad (adelanto, diap. 14):** una cola donde no sale el que llegó primero sino el de mayor o menor **prioridad**; «no es FIFO: sale el más urgente». Es la estructura detrás de **Dijkstra**, del **top-k** y de los **planificadores de tareas**, y se construye sobre un **montículo (heap)**.`,
    procedimiento: R`
**Para elegir entre las estructuras de «secuencia con extremos»:**

1. ¿Solo agregas y quitas **por el final**? → §list§ (o pila).
2. ¿Quitas por el **frente** y agregas por el final (cola)? → **§deque§**.
3. ¿Necesitas insertar/quitar **por ambos extremos**? → **§deque§**.
4. ¿Necesitas **acceso por índice** frecuente? → §list§ (¡no deque!).
5. ¿Necesitas que salga **el más urgente**? → **heap** (cola de prioridad).

**Aplicaciones de las colas** (diap. 15): **BFS** (grafo nivel por nivel), **búferes y *streaming*** (datos que llegan a un ritmo y se consumen a otro), **planificación de tareas** (cola de procesos listos), **IA: *data loaders* y *prefetching*** (un *dataloader* precarga los próximos lotes en una cola mientras la GPU entrena con el actual).`,
    codigo: [{
      titulo: 'deque como cola, como pila y como cola doble',
      src: R`
from collections import deque

cola = deque()
cola.append("a")                        # encolar al final: O(1)
cola.append("b")
cola.append("c")
print(cola.popleft(), cola)             # desencolar del frente: O(1) -> a

d = deque([1, 2, 3])
d.appendleft(0)                         # 0 1 2 3
print(d)
print(d.pop(), d)                       # quita 3

pila = deque()                          # como pila: append + pop
for x in [3, 7, 1]:
    pila.append(x)
print(pila.pop(), list(pila))

# BFS en un arbol pequeno con una cola: nivel por nivel
arbol = {"A": ["B", "C"], "B": ["D", "E"], "C": ["F"], "D": [], "E": [], "F": []}
por_visitar = deque(["A"])
orden = []
while por_visitar:
    nodo = por_visitar.popleft()
    orden.append(nodo)
    por_visitar.extend(arbol[nodo])
print(orden)
`,
      esperado: 'a deque([\'b\', \'c\'])\ndeque([0, 1, 2, 3])\n3 deque([0, 1, 2])\n1 [3, 7]\n[\'A\', \'B\', \'C\', \'D\', \'E\', \'F\']'
    }],
    ejemplo: R`
**Un *data loader* con un búfer.** Un productor genera lotes numerados y un consumidor los procesa a otro ritmo; una cola entre ambos **desacopla** los dos procesos. Si el productor es más rápido, el búfer se llena; si el consumidor es más rápido, se vacía y espera.

**BFS con una cola** (diap. 15): para recorrer un grafo (o árbol) **nivel por nivel** se usa una cola de nodos por visitar: se saca el frente, se visita y se **encolan sus vecinos**. Con una **pila** el mismo esquema da **DFS**.

| Quiero… | Estructura |
|---|---|
| atender en orden de llegada | **deque** (cola FIFO) |
| deshacer la última acción | pila (§list§ o deque) |
| procesar por niveles (BFS) | **deque** |
| sacar siempre el más urgente | **heap** |`,
    complejidad: R`
- **§append§, §appendleft§, §pop§, §popleft§:** **§O(1)§** (en una deque).
- **Acceso por índice §d[i]§:** §O(n)§ en una deque.
- **Recorrer** una deque: §O(n)§.
- **Memoria:** bloques enlazados; algo más que un arreglo contiguo, pero crece sin copiar todo.
- **Cola con §list§:** §popleft§ equivale a §pop(0)§ = §O(n)§.`,
    errores: R`
- **Usar deque y luego acceder por índice §d[i]§ en un bucle:** eso es §O(n)§ por acceso.
- **Usar §list§ y §pop(0)§** para una cola: §O(n²)§ en total.
- **Confundir cola de prioridad con cola FIFO.**
- **Creer que una deque es un arreglo contiguo:** es una lista de bloques doblemente enlazada.
- **Olvidar vaciar condición** (§while cola:§) al hacer BFS: bucle infinito o error al desencolar de una cola vacía.`,
    preguntas: [
      ['¿Qué es una deque y qué complejidad tienen sus operaciones en los extremos?', 'Una cola doble que permite insertar y eliminar en ambos extremos en O(1); internamente es una lista de bloques doblemente enlazada.'],
      ['¿Por qué es un error acceder por índice §d[i]§ en un bucle sobre una deque?', 'Porque el acceso por índice en una deque cuesta O(n) (no es un arreglo contiguo), lo que puede volver cuadrático el bucle.'],
      ['¿Qué estructura de datos está detrás de una cola de prioridad eficiente?', 'Un heap (montículo): inserción y extracción en O(log n). Es la base de Dijkstra, del top-k y de los planificadores de tareas.'],
      ['Da un caso de IA donde una cola desacople dos procesos a ritmos distintos.', 'Un data loader que precarga los próximos lotes en una cola mientras la GPU entrena con el actual: desacopla la lectura de disco del cómputo.']
    ],
    resumen: R`
- **deque:** **§O(1)§** en ambos extremos (§append§, §appendleft§, §pop§, §popleft§); bloques doblemente enlazados.
- Sirve como **cola** (§append§ + §popleft§) y como **pila** (§append§ + §pop§).
- **No** uses §d[i]§ en bucles (§O(n)§).
- Cola de prioridad ≠ FIFO: se hace con un **heap**.`
  });

  B.tema({
    id: 'pc-circular', area: 'pc', titulo: 'Cola circular sobre un arreglo de tamaño fijo', fuente: 'S4-C1 · diap. 10-13, 16-17', nivel: 11,
    conceptos: ['pc_circ'], lab: [{ tab: 'pilas', e: 'circ', texto: 'Ver la cola circular animada' }], alias: 'cola circular buffer anillo modulo frente final overflow',
    definicion: R`
Con un **arreglo de tamaño fijo §C§** y dos valores §frente§ y §tam§ que **dan la vuelta usando módulo §C§**, se logra una cola **§O(1)§ sin desplazar nada**:

- **Encolar:** §final = (frente + tam) % C§; §datos[final] = x§; §tam += 1§.
- **Desencolar:** §x = datos[frente]§; §frente = (frente + 1) % C§; §tam −= 1§.
- **Vacía** ⇔ §tam == 0§; **llena** ⇔ §tam == C§.

**Ventaja:** memoria **fija y sin fragmentación**: ideal para **búferes de tiempo real** (audio, video, sensores), donde se sabe de antemano el tamaño máximo.`,
    intuicion: R`
**Defecto de la cola lineal:** tras varios §desencolar§, el frente avanza y deja **huecos al inicio** que no se reutilizan: se declara llena aunque quede espacio libre. La **cola circular** trata el arreglo como un **anillo**: cuando el final llega a la última casilla, **da la vuelta al índice 0** con el módulo.

**¿Por qué se lleva el tamaño?** Con solo §frente§ y §final§, cuando coinciden **no se sabe** si la cola está **vacía** o **llena**. Llevar §tam§ elimina la ambigüedad: llena ⇔ §tam == C§.`,
    formal: R`
**Traza paso a paso (C = 5), diapositiva 12:**

| Operación | frente | final | Contenido (índices 0-4) |
|---|---|---|---|
| inicial (vacía) | −1 | −1 | §[_, _, _, _, _]§ |
| encolar A, B, C | 0 | 2 | §[A, B, C, _, _]§ |
| desencolar → A | 1 | 2 | §[_, B, C, _, _]§ |
| desencolar → B | 2 | 2 | §[_, _, C, _, _]§ |
| encolar D, E | 2 | 4 | §[_, _, C, D, E]§ |
| encolar F | 2 | 0 | §[F, _, C, D, E]§ (**da la vuelta**) |
| encolar G | 2 | 1 | §[F, G, C, D, E]§ **llena** |
| encolar H | — | — | **OverflowError** |

**Condiciones (todo mód C):** encolar: §final ← (final + 1) mód C§; desencolar: §frente ← (frente + 1) mód C§. En el código con §frente + tam§ la condición «llena» es §tam == C§ (sin ambigüedad entre vacía y llena).

**Política cuando se llena:** **esperar** (el productor se bloquea), **descartar el más viejo** (sobrescribir) o lanzar un error. Por ejemplo, un micrófono con **16 000 muestras por segundo** y un búfer de 1 s: una **cola circular de tamaño fijo** tiene memoria acotada; una deque que crece sin límite podría agotar la memoria si el consumidor se atrasa.`,
    procedimiento: R`
**A mano** con §C = 5§, §frente = 3§, §tam = 4§: ¿en qué índice se encola?

1. §final = (frente + tam) % C = (3 + 4) % 5 = 7 % 5 = 2§.
2. Se escribe en §datos[2]§ y §tam§ pasa a 5: la cola queda **llena**.

**Para implementar:** (1) arreglo de §C§ casillas y §frente = 0§, §tam = 0§; (2) §encolar§: si §tam == C§ → §OverflowError§; si no, calcular §final§ con el módulo, escribir y §tam += 1§; (3) §desencolar§: si §tam == 0§ → §IndexError§; leer §datos[frente]§, avanzar §frente§ con módulo y §tam −= 1§.

**Actividad de la clase (data loader con búfer de 5 lotes):** (1) modela el búfer como cola circular de capacidad 5; (2) traza qué ocurre cuando el productor va más rápido (se llena); (3) decide una política (esperar o descartar el más viejo); (4) di la complejidad: encolar y desencolar son §O(1)§.`,
    codigo: [{
      titulo: 'ColaCircular (diapositiva 13) y la traza de la diapositiva 12',
      src: R`
class ColaCircular:
    def __init__(self, capacidad):
        self._datos = [None] * capacidad
        self._cap = capacidad
        self._frente = 0
        self._tam = 0

    def encolar(self, x):
        if self._tam == self._cap:
            raise OverflowError("cola llena")
        final = (self._frente + self._tam) % self._cap     # da la vuelta
        self._datos[final] = x
        self._tam += 1

    def desencolar(self):
        if self._tam == 0:
            raise IndexError("cola vacia")
        x = self._datos[self._frente]
        self._frente = (self._frente + 1) % self._cap
        self._tam -= 1
        return x

c = ColaCircular(5)
for x in "ABC":
    c.encolar(x)
print(c._datos, c._frente, c._tam)
print(c.desencolar(), c.desencolar())
for x in "DEFG":
    c.encolar(x)
print(c._datos, "frente =", c._frente, "tam =", c._tam)    # da la vuelta: llena
try:
    c.encolar("H")
except OverflowError as e:
    print("OverflowError:", e)
print([c.desencolar() for _ in range(5)])
# verificacion formativa: capacidad 5, frente en 3 y tamano 4 -> indice donde se encola
print((3 + 4) % 5)
`,
      esperado: '[\'A\', \'B\', \'C\', None, None] 0 3\nA B\n[\'F\', \'G\', \'C\', \'D\', \'E\'] frente = 2 tam = 5\nOverflowError: cola llena\n[\'C\', \'D\', \'E\', \'F\', \'G\']\n2'
    }],
    ejemplo: R`
**Cola circular de capacidad 5** (la traza de la clase, en código): tras encolar A, B, C y desencolar dos veces, quedan §frente = 2§, §tam = 1§ (solo la C). Al encolar D, E, F y G el índice **da la vuelta**: F cae en el índice 0 y G en el 1, y la cola queda **llena** con §[F, G, C, D, E]§. Encolar H lanza §OverflowError§. Desencolar cinco veces entrega **C, D, E, F, G**: el orden FIFO se conserva aunque el arreglo «dé la vuelta».

**Búfer de audio:** 16 000 muestras por segundo y un modelo que consume bloques; el búfer guarda a lo sumo 1 s. La cola circular de tamaño fijo da **memoria acotada**; si el consumidor se atrasa y el búfer se llena, se **descarta lo más viejo** o se **bloquea al productor**, según lo que importe (latencia o completitud).`,
    complejidad: R`
- **Encolar y desencolar:** **§O(1)§** (una suma, un módulo y una asignación; nada se desplaza).
- **Espacio:** **§O(C)§** fijo, reservado de antemano; **sin fragmentación** ni crecimiento.
- **Comparación:** cola lineal sobre arreglo: desperdicia huecos; §list.pop(0)§: §O(n)§ por desencolar; deque: §O(1)§ pero crece sin tope; **circular: §O(1)§ y memoria acotada**.`,
    errores: R`
- **Olvidar el §%§ (módulo)** en la cola circular: los índices se salen del arreglo.
- **Confundir cola llena con cola vacía** cuando §frente§ y §final§ coinciden: hay que llevar el **tamaño**.
- **No decidir la política de desbordamiento** (esperar, descartar el más viejo, error).
- **Usar una cola circular cuando no se conoce el tamaño máximo:** una deque que crece es más adecuada.
- **Calcular §final§ como §frente + tam§ sin módulo:** se sale del arreglo al dar la vuelta.`,
    preguntas: [
      ['En una cola circular de capacidad 5 con §frente = 3§ y §tam = 4§, ¿en qué índice se encola?', '(3 + 4) % 5 = 2.'],
      ['¿Por qué una cola circular es ideal para un búfer de tiempo real y no una deque que crece sin límite?', 'Porque usa memoria fija y acotada, sin fragmentación ni crecimiento; si el consumidor se atrasa y el búfer se llena, se aplica una política (esperar o descartar lo más viejo) en vez de agotar la memoria.'],
      ['¿Por qué se lleva el tamaño además de frente y final?', 'Porque con solo frente y final no se distingue una cola llena de una vacía cuando coinciden; con el tamaño: llena ⇔ tam == C, vacía ⇔ tam == 0.'],
      ['Tras encolar A, B, C, desencolar dos, y encolar D, E, F, G en una cola circular de capacidad 5, ¿cómo queda el arreglo y qué pasa al encolar H?', 'El arreglo queda [F, G, C, D, E] (llena, frente = 2). Encolar H lanza OverflowError porque tam == C.']
    ],
    resumen: R`
- **Cola circular:** arreglo fijo de tamaño §C§ + §frente§ + §tam§; **módulo** para dar la vuelta.
- Encolar: §final = (frente + tam) % C§; desencolar: §frente = (frente + 1) % C§ ⇒ **§O(1)§**.
- **Llena** ⇔ §tam == C§; **vacía** ⇔ §tam == 0§.
- Ideal para **búferes de tamaño fijo**; hay que decidir la política al llenarse.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
