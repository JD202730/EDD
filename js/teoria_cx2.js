/* teoria_cx2.js — Biblioteca: área Complejidad (2/2). Fuentes: S2-C1 y S2-C2 */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'cx-reglas', area: 'cx', titulo: 'Reglas de cálculo: suma, producto, polinomios y logaritmos', fuente: 'S2-C2 · diap. 11-13, 18', nivel: 2, comp: true,
    conceptos: ['cx_reglas', 'cx_recursivo'], interactivo: [],
    definicion: R`
Para obtener la complejidad de un programa **sin demostrar cada constante**, se aplican reglas de simplificación de §O§:

- **Constantes**: §O(c·f) = O(f)§.
- **Suma (bloques consecutivos)**: §O(f) + O(g) = O(máx(f, g))§.
- **Producto (bloques anidados)**: §O(f) · O(g) = O(f·g)§.
- **Polinomios**: solo cuenta el grado mayor.
- **Logaritmos**: la base es irrelevante.

**Traducción al código:** bloques **consecutivos** → se toma el **mayor**; bloques **anidados** → se **multiplican**.`,
    intuicion: R`
Una receta con tres pasos seguidos tarda lo que tarde el **paso más lento**: si el paso 2 tarda una hora y los demás minutos, optimizar los minutos no cambia el total. Eso es la **regla de la suma**.

Si por cada una de las §n§ mesas debes hacer §m§ cosas, trabajas §n × m§: es la **regla del producto**.

Y el logaritmo: pasar de §log₂ n§ a §log₁₀ n§ solo cambia la unidad (como metros frente a centímetros), así que la base **no importa** para el crecimiento.`,
    formal: R`
| Regla | Enunciado | Ejemplo |
|---|---|---|
| Constantes | §O(c·f) = O(f)§ | §O(5n) = O(n)§ |
| Suma (secuencia) | §O(f) + O(g) = O(máx(f, g))§ | §O(n) + O(n²) = O(n²)§ |
| Producto (anidamiento) | §O(f) · O(g) = O(f·g)§ | §O(n) · O(n) = O(n²)§ |
| Polinomios | solo el grado mayor | §O(3n³ + n²) = O(n³)§ |
| Logaritmos | la base es irrelevante | §O(log₂ n) = O(log₁₀ n)§ |

**Por qué la base del logaritmo no importa:** §logₐ n = log_b n / log_b a§, y §1 / log_b a§ es una **constante**, que §O§ absorbe.

**Complejidad de funciones recursivas:** (número de llamadas) × (trabajo por llamada). §factorial§: §n§ llamadas × §O(1)§ = §O(n)§. Recorrer un árbol: cada nodo una vez ⇒ §O(n)§. Operaciones de un BST: §O(h)§.

[comp]
**Recurrencias típicas** (para recursiones que dividen el problema): §T(n) = T(n−1) + O(1)§ → §O(n)§; §T(n) = T(n/2) + O(1)§ → §O(log n)§ (búsqueda binaria); §T(n) = 2T(n/2) + O(n)§ → §O(n log n)§ (merge sort); §T(n) = 2T(n−1) → O(2ⁿ)§ (Fibonacci ingenuo, como cota).
[/comp]`,
    procedimiento: R`
1. **Divide** el código en bloques: consecutivos (uno tras otro) y anidados (uno dentro de otro).
2. **Calcula** la complejidad de cada bloque simple (un ciclo, una llamada, una operación).
3. **Anidados**: multiplica las complejidades del ciclo externo y del interno (cuidado con que el interno dependa de §i§).
4. **Consecutivos**: toma el **máximo**.
5. **Revisa costos ocultos**: ¿hay §in§ sobre una lista, §insert(0, …)§, §sort§…? Multiplícalos por las veces que se ejecutan.
6. **Simplifica** (constantes y términos menores) y **escribe variable y caso**.`,
    codigo: [
      {
        titulo: 'Tres bloques en secuencia (S2-C2, d.12): el cuello de botella es el segundo',
        src: R`
def procesar(v):
    n = len(v)
    ops = [0, 0, 0]               # operaciones de los bloques 1, 2 y 3
    total = 0
    for x in v:                   # bloque 1: O(n)
        total += x
        ops[0] += 1
    for i in range(n):            # bloque 2: O(n^2)
        for j in range(n):
            if v[i] == v[j]:
                total += 1
            ops[1] += 1
    ops[2] += 1                   # bloque 3: return, O(1)
    return total, ops

for n in [10, 100]:
    print(n, procesar(list(range(n)))[1])
`,
        esperado: '10 [10, 100, 1]\n100 [100, 10000, 1]'
      },
      {
        titulo: 'La base del logaritmo solo cambia una constante',
        src: R`
import math

for n in [10, 1000, 10 ** 6]:
    print(n, round(math.log2(n) / math.log10(n), 4))   # siempre log2(10) = 3.3219...
`,
        esperado: '10 3.3219\n1000 3.3219\n1000000 3.3219'
      }
    ],
    ejemplo: R`
**Tres bloques consecutivos** (§procesar§):

§T(n) = O(n) + O(n²) + O(1) = O(máx(n, n², 1)) = O(n²)§.

Optimizar el bloque 1 (el ciclo lineal) no mejoraría nada: el cuello de botella es el bloque 2.

**Tres ciclos anidados con límites distintos** (S2-C2, d.13):

~~~
# (a) interno independiente de i  ->  n · n
for i in range(n):
    for j in range(n):
        x += 1                  # se ejecuta n² veces        -> O(n²)

# (b) interno dependiente de i    ->  n(n-1)/2
for i in range(n):
    for j in range(i):
        x += 1                  # se ejecuta n(n-1)/2 veces  -> O(n²)

# (c) interno de tamaño FIJO      ->  n · 100
for i in range(n):
    for j in range(100):
        x += 1                  # se ejecuta 100n veces      -> O(n)
~~~

(a) y (b) difieren en un factor 2 y ambos son §O(n²)§: la constante no cambia el orden. En (c) el ciclo interno **no depende de §n§**, no aporta: es §O(n)§.

**Pregunta de análisis (construir_vocab).** Con §d§ documentos, §p§ palabras por documento y §|V|§ palabras distintas:

~~~
def construir_vocab(docs):
    vocab = []
    for doc in docs:
        for palabra in doc.split():
            if palabra not in vocab:      # recorre vocab: O(|V|)
                vocab.append(palabra)
    return vocab
~~~

El cuerpo se ejecuta §d·p§ veces y cada §in§ de lista cuesta hasta §|V|§: **§O(d·p·|V|)§**. Cambiar **una línea** (§vocab = set()§ y §vocab.add(palabra)§) deja el §in§ en §O(1)§ y todo en **§O(d·p)§**.`,
    complejidad: R`
- **Suma**: justificada porque §f + g ≤ 2·máx(f, g)§, y la constante 2 se absorbe.
- **Producto**: un ciclo que hace §f(n)§ vueltas y en cada una un trabajo §g(n)§ hace §f·g§ operaciones.
- **Polinomios**: §a₀ + a₁n + … + a_kn^k ≤ (|a₀| + … + |a_k|)·n^k§ para §n ≥ 1§, por tanto es §O(n^k)§.
- **Logaritmos**: cambio de base con constante §1/log_b a§ ⇒ §Θ(log₂ n) = Θ(log₁₀ n) = Θ(ln n)§.
- **Cuando el interno depende del externo**, suma en vez de multiplicar a ciegas (§Σ i = n(n−1)/2§); el resultado suele ser igual al del producto, pero con otra constante.
- **Funciones recursivas**: (llamadas) × (trabajo por llamada).`,
    errores: R`
- **Sumar cuando son anidados** (o multiplicar cuando son consecutivos): consecutivos → máximo, anidados → producto.
- **Contar solo los ciclos visibles** y olvidar el costo real de lo que se llama dentro (§in§ sobre lista, §insert(0, …)§).
- **Dejar constantes y términos menores**: §O(2n² + 3n)§ → §O(n²)§.
- **Creer que el interno de tamaño fijo (§range(100)§) multiplica por «n»**: no depende de §n§, solo aporta una constante.
- **Pensar que la base del logaritmo importa** en §O§.
- **Optimizar el bloque equivocado**: mejorar el bloque lineal cuando el cuello de botella es el cuadrático.`,
    preguntas: [
      ['Un §for§ de §n§, luego dos §for§ anidados de §n§ y luego una asignación. ¿Qué complejidad tiene y qué regla usaste?', '§O(n) + O(n²) + O(1) = O(n²)§: regla de la **suma** para los bloques consecutivos (se toma el mayor) y regla del **producto** dentro del anidado (§n · n§).'],
      ['Un ciclo externo de §n§ y uno interno de 1 a 100: ¿qué complejidad tiene? ¿Y si el interno fuera de 1 a §i§?', 'Con interno fijo: §n · 100 = O(n)§. Con interno de 1 a §i§: §n(n−1)/2 = O(n²)§.'],
      ['¿Por qué §log₂ n§ y §log₁₀ n§ pertenecen a la misma clase?', 'Porque §log₂ n = log₁₀ n / log₁₀ 2§ y §1 / log₁₀ 2§ es una constante, que la notación §O§ absorbe.'],
      ['Analiza §construir_vocab§ y propón un cambio de una línea que la mejore.', '§O(d·p·|V|)§ porque §palabra not in vocab§ recorre una lista de hasta §|V|§ elementos. Usar §vocab = set()§ y §vocab.add(palabra)§ hace §in§ de §O(1)§ y reduce todo a §O(d·p)§.']
    ],
    resumen: R`
- **Consecutivos → máximo; anidados → producto.**
- Constantes y términos menores se descartan; en polinomios manda el grado mayor.
- La **base del log** es irrelevante (cambio de base = constante).
- Interno **fijo** no multiplica por §n§; interno **dependiente** de §i§ suma §n(n−1)/2§.
- Recursión: (nº de llamadas) × (trabajo por llamada).
- Vigila los **costos ocultos** (§in§ en listas, §insert§, §sort§).`
  });

  B.tema({
    id: 'cx-ciclos', area: 'cx', titulo: 'Análisis de ciclos: de dónde sale el log n', fuente: 'S2-C2 · diap. 13-15; S2-C1 · diap. 23', nivel: 2,
    conceptos: ['cx_ciclos'], interactivo: [],
    definicion: R`
Para analizar un ciclo hay que preguntarse **cómo cambia el índice** en cada vuelta:

- Si el índice **suma** (§i += 1§, §i += 2§…), el ciclo es **lineal**.
- Si el índice **se multiplica o se divide** (§j *= 2§, §i //= 2§), el ciclo es **logarítmico**: tarda §log₂ n§ pasos.

Combinar ciclos da: lineal × lineal = §n²§; **lineal × logarítmico = §n log n§**; tres ciclos anidados dependientes = §n³§.`,
    intuicion: R`
**Dividir a la mitad** es lo que haces al buscar una palabra en un diccionario: abres a la mitad, descartas una mitad, vuelves a abrir… ¿cuántas veces puedes partir §n§ páginas por la mitad hasta quedar con una? **§log₂ n§**. Con 1 000 000 de páginas bastan **20** cortes.

**Duplicar** es lo mismo mirado al revés: ¿cuántas veces debes duplicar §1§ para alcanzar §n§? También **§log₂ n§**.

Regla mnemotécnica de la clase: «si el índice **suma**, es lineal; si **multiplica o divide**, es logarítmico».`,
    formal: R`
**Dividir hasta llegar a 1** (§i = n; while i > 1: i = i // 2§): tras §k§ pasos §i = n/2ᵏ§; termina cuando §n/2ᵏ = 1§, o sea **§k = log₂ n§**.

**Duplicar hasta alcanzar §n§** (§j = 1; while j < n: j *= 2§): tras §k§ pasos §j = 2ᵏ§; termina cuando §2ᵏ ≥ n§, o sea **§k = ⌈log₂ n⌉§**.

Ambos son **§Θ(log n)§**.

**Los cuatro fragmentos del laboratorio guiado (S2-C1, d.23):**

| Fragmento | Veces que se ejecuta la línea interna | Clase |
|---|---|---|
| §for i in range(n): for j in range(n): x += 1§ | §n · n = n²§ | §Θ(n²)§ |
| §i = n; while i > 1: i = i // 2§ | §⌊log₂ n⌋§ | §Θ(log n)§ |
| §for i in range(n): j = 1; while j < n: j *= 2§ | §n · ⌈log₂ n⌉§ | §Θ(n log n)§ |
| §for i in range(n): for j in range(i): for k in range(j): x += 1§ | §Σ Σ j = n(n−1)(n−2)/6§ | §Θ(n³)§ |

**Por qué §n log n§ importa:** es la complejidad de merge sort, heapsort, quicksort en promedio y de construir un árbol balanceado. Es la **frontera práctica** entre lo que escala y lo que no.

[comp]
**El triple ciclo dependiente:** el número de ejecuciones de §x += 1§ es §Σ_{i} Σ_{j<i} j = Σ_{i} i(i−1)/2 = C(n, 3) = n(n−1)(n−2)/6§, que es §Θ(n³)§ (con coeficiente 1/6).
[/comp]`,
    procedimiento: R`
1. Para cada ciclo escribe **la variable de control**, su **valor inicial**, su **condición de parada** y **cómo cambia**.
2. Si **suma una constante**: número de vueltas ≈ (límite − inicio)/paso ⇒ lineal en el límite.
3. Si **se multiplica/divide por una constante**: número de vueltas ≈ §log(límite)§ (la base no importa).
4. Si el **límite del ciclo interno depende** del índice del externo, calcula la suma exacta (§Σ i = n(n−1)/2§).
5. **Combina** los ciclos: anidados se multiplican, consecutivos se toma el mayor ([[cx-reglas]]).
6. **Verifica con un §n§ pequeño** (por ejemplo §n = 8§ o §n = 16§) contando a mano.`,
    codigo: {
      titulo: 'Contar las ejecuciones de los cuatro fragmentos del laboratorio guiado',
      src: R`
def f1(n):                      # doble ciclo independiente
    c = 0
    for i in range(n):
        for j in range(n):
            c += 1
    return c

def f2(n):                      # se divide a la mitad
    c, i = 0, n
    while i > 1:
        i = i // 2
        c += 1
    return c

def f3(n):                      # lineal por logarítmico
    c = 0
    for i in range(n):
        j = 1
        while j < n:
            j *= 2
            c += 1
    return c

def f4(n):                      # triple ciclo dependiente
    c = 0
    for i in range(n):
        for j in range(i):
            for k in range(j):
                c += 1
    return c

for n in [8, 16, 64]:
    print(n, f1(n), f2(n), f3(n), f4(n))
print(f4(30), 30 * 29 * 28 // 6)
`,
      esperado: '8 64 3 24 56\n16 256 4 64 560\n64 4096 6 384 41664\n4060 4060'
    },
    ejemplo: R`
**§n = 16§:**

- §f1§: §16 × 16 = 256§.
- §f2§: §16 → 8 → 4 → 2 → 1§ ⇒ **4** pasos = §log₂ 16§.
- §f3§: cada una de las 16 vueltas del externo hace 4 pasos internos (§j = 1, 2, 4, 8§, y al llegar a 16 se detiene) ⇒ §16 × 4 = 64§.
- §f4§: §16·15·14 / 6 = 560§.

**Combinando:** en el patrón «lineal por logarítmico» (§f3§) el ciclo externo es §O(n)§ y el interno §O(log n)§; el total es §O(n) · O(log n) = O(n log n)§.

**Tabla de comparación** (a 10⁹ operaciones por segundo, §n = 10⁶§): §n§ → 0,001 s; §n log n§ → 0,02 s; §n²§ → 1000 s (≈ 17 min) — ver [[cx-dominante]].

**Pregunta del parcial (3.b):**

~~~
def g(n):
    j = 1
    c = 0
    while j < n:
        c += 1
        j *= 2
    return c
~~~

La variable §j§ **se duplica** en cada vuelta: §j = 2ᵏ§ ⇒ termina cuando §2ᵏ ≥ n§ ⇒ **§⌈log₂ n⌉§ vueltas** ⇒ **§O(log n)§** en el peor caso, respecto de §n§ (regla del **producto/multiplicación del índice**).`,
    complejidad: R`
- **Ciclo lineal**: §Θ(n)§. **Ciclo que divide/duplica**: §Θ(log n)§. **Lineal × logarítmico**: §Θ(n log n)§. **Doble ciclo independiente**: §Θ(n²)§. **Triple dependiente**: §Θ(n³)§.
- Justificación del log: el número de pasos §k§ cumple §n/2ᵏ ≤ 1§ ⇒ §k ≥ log₂ n§; así que el ciclo termina en §⌈log₂ n⌉§ vueltas, y como la base del log no importa, es §Θ(log n)§.
- Justificación de §n log n§: producto del externo (§n§ vueltas) por el interno (§⌈log₂ n⌉§ vueltas), por la regla del producto.
- **Método**: cuenta cada ciclo por separado (cómo cambia su índice y cuántas vueltas da) y solo después combínalos: anidados se multiplican, consecutivos se toma el mayor.`,
    errores: R`
- **Creer que todo ciclo es lineal**: si el índice se multiplica o se divide, es logarítmico.
- **Confundir §⌊log₂ n⌋§ con §⌈log₂ n⌉§**: dividir hasta 1 da §⌊log₂ n⌋§ pasos; duplicar hasta superar §n§ da §⌈log₂ n⌉§. Para la notación §O§ no importa, pero para contar sí.
- **Olvidar que el interno depende de §i§** y multiplicar §n·n§ en vez de sumar §n(n−1)/2§.
- **Ignorar el costo de las operaciones del cuerpo** (por ejemplo un §in§ de lista dentro del ciclo).
- **Escribir «O(log n)» sin declarar el caso ni la variable**.
- **Pensar que §n log n§ es casi lineal siempre**: lo es en la práctica (frontera de lo que escala), pero **no** es lineal en sentido asintótico.`,
    preguntas: [
      ['¿Cuántas veces se ejecuta el cuerpo de §i = n; while i > 1: i = i // 2§? Justifícalo.', '§⌊log₂ n⌋§ veces: tras §k§ pasos §i = n/2ᵏ§ y termina cuando §n/2ᵏ = 1§, o sea §k = log₂ n§. Es §Θ(log n)§.'],
      ['¿Qué complejidad tiene §for i in range(n): j = 1; while j < n: j *= 2§?', '§O(n) · O(log n) = O(n log n)§: el externo hace §n§ vueltas y el interno §⌈log₂ n⌉§ (el índice se duplica).'],
      ['Da una regla práctica para saber si un ciclo es lineal o logarítmico.', 'Mira cómo cambia el índice: si **suma**, el ciclo es lineal; si **multiplica o divide**, es logarítmico.'],
      ['¿Qué complejidad tiene un triple ciclo §for i in range(n): for j in range(i): for k in range(j)§?', '§Θ(n³)§: ejecuta §n(n−1)(n−2)/6§ veces el cuerpo (combinaciones de §n§ tomadas de 3 en 3).']
    ],
    resumen: R`
- Índice que **suma** → lineal. Índice que **multiplica o divide** → **log n**.
- Dividir hasta 1: **⌊log₂ n⌋** pasos. Duplicar hasta ≥ n: **⌈log₂ n⌉** pasos.
- Lineal × log = **n log n** (merge sort, heapsort, quicksort promedio, árbol balanceado).
- Triple ciclo dependiente: **n(n−1)(n−2)/6 = Θ(n³)**.
- Prueba siempre con un **n pequeño** a mano.`
  });

  B.tema({
    id: 'cx-python', area: 'cx', titulo: 'Costos reales de las operaciones de Python', fuente: 'S2-C1 · diap. 7, 18-19, 24; S2-C2 · diap. 17-18', nivel: 2,
    conceptos: ['cx_python'], interactivo: [],
    definicion: R`
En Python **no todo lo que parece una operación elemental lo es**: algunas operaciones recorren o copian datos. Conocer el **costo real** de las operaciones de §list§, §set§ y §dict§ es tan importante como contar ciclos, porque un solo §in§ sobre una lista puede convertir un ciclo lineal en uno cuadrático **sin que se note**.`,
    intuicion: R`
Dos versiones de «lista de valores únicos» parecen equivalentes: ambas tienen **un solo ciclo visible**. La diferencia está en el costo de §in§: en una **lista** hay que mirar elemento por elemento (hasta §n§ comparaciones); en un **set** o **dict** se calcula una posición con una función hash y se mira ahí (≈ 1 comparación).

Es la diferencia entre buscar un nombre leyendo toda la agenda (lista) o abriendo directamente en la letra correcta (tabla hash).`,
    formal: R`
**Costo real de las operaciones** (S2-C2, d.17):

| Operación | §list§ | §set§ / §dict§ | Causa |
|---|---|---|---|
| §v[i]§ | O(1) | — | memoria contigua |
| §x in c§ | **O(n)** | **O(1)** | recorrido frente a hash |
| §append(x)§ | O(1)* | O(1) | amortizado |
| §insert(0, x)§ | **O(n)** | — | desplaza todo |
| §pop()§ final | O(1) | — | sin desplazar |
| §pop(0)§ | **O(n)** | — | desplaza todo |
| §sort()§ | O(n log n) | — | Timsort |
| §min§ / §max§ | O(n) | O(n) | recorre todo |

\*Amortizado: casi siempre §O(1)§; ocasionalmente §O(n)§ al redimensionar el arreglo (se verá en la semana 3).

**Consecuencia inmediata:** cambiar §lista.pop(0)§ por §collections.deque.popleft()§ convierte un algoritmo §O(n²)§ en uno §O(n)§ **sin tocar la lógica**.

Otros costos ocultos: §s1 + s2§ (cadenas) copia ambas (suma de longitudes); §x in lista§ dentro de un ciclo multiplica por §n§.`,
    procedimiento: R`
Para **auditar el rendimiento** de un código (actividad de la clase):

1. **Identifica la operación cuyo costo real no es constante** (§in§ sobre lista, §insert(0, …)§, §pop(0)§, concatenación de cadenas dentro de ciclos).
2. **Escribe §T(n)§** de la versión actual **incluyendo** ese costo.
3. **Propón la reescritura** (un §set§ o §dict§ para pertenencia; un §deque§ para colas; acumular en lista y §join§ para cadenas).
4. **Escribe la nueva §T(n)§** y estima la mejora con la razón de crecimiento.
5. **Declara la memoria extra** que cuesta el cambio (el §set§ guarda §n§ elementos) y decide si vale la pena ([[cx-espacial]]).`,
    codigo: {
      titulo: 'unicos_A (cuadrático oculto) frente a unicos_B (lineal), contando comparaciones',
      src: R`
def unicos_A(v):
    salida, comparaciones = [], 0
    for x in v:
        esta = False
        for y in salida:           # esto es lo que hace "x in salida": recorrer la lista
            comparaciones += 1
            if y == x:
                esta = True
                break
        if not esta:
            salida.append(x)
    return salida, comparaciones

def unicos_B(v):
    vistos, salida, comparaciones = set(), [], 0
    for x in v:
        comparaciones += 1         # "x in vistos": una consulta a la tabla hash
        if x not in vistos:
            vistos.add(x)
            salida.append(x)
    return salida, comparaciones

for n in [250, 500, 1000]:
    datos = list(range(n))         # n valores distintos: peor caso de A
    a, ca = unicos_A(datos)
    b, cb = unicos_B(datos)
    print(n, a == b, ca, cb)
`,
      esperado: '250 True 31125 250\n500 True 124750 500\n1000 True 499500 1000',
      nota: 'Al duplicar §n§, A pasa de 31 125 a 124 750 comparaciones (**×4**: cuadrático) y B de 250 a 500 (**×2**: lineal).'
    },
    ejemplo: R`
**Pregunta de análisis (construir_vocab)** — ver [[cx-reglas]]: §O(d·p·|V|)§ con lista; §O(d·p)§ con §set§.

**Verificación empírica de la clase (S2-C1, d.19):**

| n | §unicos_A§ | factor | §unicos_B§ |
|---|---|---|---|
| 1 000 | 0,011 s | — | 0,0001 s |
| 2 000 | 0,043 s | 3,9× | 0,0002 s |
| 4 000 | 0,172 s | 4,0× | 0,0004 s |
| 8 000 | 0,690 s | 4,0× | 0,0008 s |

El factor ≈ 4 al duplicar §n§ delata el **crecimiento cuadrático** de A; B se duplica (lineal).

**Auditoría de rendimiento (actividad de la clase).** Una función construye la lista de términos distintos de 200 000 documentos y tarda **40 minutos**. La operación cuyo costo no es constante es §palabra in lista§ (§O(|V|)§). Con un §set§, la complejidad pasa de §O(N·|V|)§ a §O(N)§, y el tiempo baja en un factor del orden de §|V|§: de **minutos a segundos**. A cambio se paga **memoria extra §O(|V|)§** (el conjunto), un precio casi siempre razonable.

**Cola con §pop(0)§:** procesar §n§ elementos con §lista.pop(0)§ es §O(n²)§ (cada extracción desplaza el resto); con §deque.popleft()§ es §O(n)§.`,
    complejidad: R`
- **§unicos_A§**: el cuerpo se ejecuta §n§ veces y cada §in§ recorre hasta §n§ elementos ⇒ §O(n²)§ en tiempo; §O(n)§ de espacio (la salida).
- **§unicos_B§**: §n§ consultas de §O(1)§ (en promedio) ⇒ §O(n)§ en tiempo; §O(n)§ de espacio **extra** (el conjunto de vistos).
- **Compromiso**: §unicos_B§ es ≈ §n§ veces más rápido pero gasta memoria extra; es una decisión de diseño (ver [[cx-espacial]]).
- **Amortizado**: §append§ es §O(1)§ amortizado porque aunque a veces redimensiona (§O(n)§), repartido entre todas las inserciones el costo promedio por operación es constante.
- Los costos de §set§/§dict§ son §O(1)§ **en promedio** (supone una buena función hash); el peor caso de una tabla hash se estudia en la semana 8.`,
    errores: R`
- **Suponer que §x in lista§ cuesta 1**: cuesta §n§ (con §set§ sí cuesta ≈ 1).
- **Contar solo los ciclos visibles** e ignorar el costo de las funciones que se llaman dentro.
- **Usar §lista.insert(0, x)§ o §lista.pop(0)§ como cola** sin saber que desplazan todos los elementos (§O(n)§).
- **Olvidar el costo de §s1 + s2§** al construir una cadena grande en un ciclo.
- **Optimizar el tiempo sin declarar la memoria extra** que cuesta.
- **Decir «O(1)» para §append§** sin añadir «amortizado».`,
    preguntas: [
      ['¿Por qué §unicos_A§ es §O(n²)§ si tiene un solo ciclo visible?', 'Porque §x not in salida§ recorre la lista §salida§ (hasta §n§ comparaciones) y se ejecuta dentro del ciclo de §n§ vueltas: §n · n = O(n²)§.'],
      ['Da el costo de §x in c§ para una lista y para un set, y de §insert(0, x)§ y §pop(0)§ en una lista.', '§x in lista§: §O(n)§; §x in set§: §O(1)§ en promedio; §insert(0, x)§ y §pop(0)§: §O(n)§ (desplazan todo).'],
      ['Cambiar §lista.pop(0)§ por §deque.popleft()§, ¿qué cambio de complejidad produce?', 'Convierte un algoritmo §O(n²)§ en uno §O(n)§ sin tocar la lógica, porque §popleft§ es §O(1)§.'],
      ['¿Qué memoria extra cuesta pasar de §unicos_A§ a §unicos_B§ y por qué vale la pena?', '§O(n)§ (el conjunto de vistos). Vale la pena porque el tiempo baja de §O(n²)§ a §O(n)§: casi siempre es un buen trato.'],
      ['¿Por qué §append§ se llama «§O(1)§ amortizado»?', 'Casi siempre es §O(1)§, pero cuando el arreglo se llena hay que redimensionarlo (§O(n)§); repartido entre muchas operaciones, el costo medio por §append§ es constante.']
    ],
    resumen: R`
- **§x in lista§ = O(n)**; **§x in set/dict§ = O(1)**; §insert(0, x)§ y §pop(0)§ = **O(n)**; §sort§ = O(n log n); §append§ = O(1) **amortizado**.
- Un §in§ de lista dentro de un ciclo hace **cuadrático** el código sin que se note.
- §deque.popleft()§ en lugar de §pop(0)§: de §O(n²)§ a §O(n)§.
- Optimizar tiempo suele costar **memoria extra**: decláralo.`
  });

  B.tema({
    id: 'cx-espacial', area: 'cx', titulo: 'Complejidad espacial y compromiso tiempo–espacio', fuente: 'S2-C1 · diap. 21-22', nivel: 2, comp: true,
    conceptos: ['cx_espacial'], interactivo: [],
    definicion: R`
La **complejidad espacial** es la **memoria adicional** que necesita un algoritmo **más allá de la entrada**, en función de §n§. El **compromiso tiempo–espacio** dice que casi toda optimización de tiempo se paga con memoria, y viceversa: **elegir es diseñar**.`,
    intuicion: R`
Si quieres encontrar rápido un libro en una biblioteca, puedes **hacer un índice**: ocupa espacio (papel) pero ahorra tiempo (búsqueda). Si prefieres no gastar papel, buscas estante por estante: ahorras espacio, pierdes tiempo.

Con las redes neuronales pasa lo mismo: durante la retropropagación puedes **recalcular** las activaciones intermedias (ahorras memoria, gastas tiempo) o **guardarlas todas** (ahorras tiempo, gastas memoria). Esa técnica de recalcular se llama *gradient checkpointing*, y es exactamente el compromiso tiempo–espacio.`,
    formal: R`
| Algoritmo | Espacio extra | Comentario |
|---|---|---|
| Suma de un arreglo | **1** | solo un acumulador |
| §unicos_B§ | **n** | el conjunto de vistos |
| Merge sort | **n** | arreglo auxiliar de mezcla |
| Quicksort (en el sitio) | **log n** | solo la pila de llamadas |

- El espacio extra **no cuenta la entrada** (y a veces tampoco la salida, según se declare).
- **Recursión**: una recursión de profundidad §d§ usa §O(d)§ de pila ([[rec-pila]]).
- **Memoización**: caché §O(n)§ + pila §O(n)§ ⇒ §O(n)§; **bottom-up con dos variables**: §O(1)§ ([[rec-vs-iter]]).
- **Compromiso**: §unicos_B§ es §n§ veces más rápido que §unicos_A§ pero gasta §n§ de memoria extra.

[comp]
**Cómo contar espacio.** Suma (a) las estructuras auxiliares que crecen con §n§ (listas, conjuntos, diccionarios, tablas de DP), y (b) la **profundidad máxima de la pila** de llamadas × el tamaño de cada marco (que suele ser constante). Las variables simples (contadores, índices) son §O(1)§.
[/comp]`,
    procedimiento: R`
1. Define **qué se considera entrada** y qué salida (para no contarlas).
2. **Lista las estructuras auxiliares** y cómo crecen con §n§ (¿se llena un set de hasta §n§ elementos? ¿una tabla §n × m§?).
3. Si hay **recursión**, calcula la **profundidad máxima** de la pila.
4. **Suma** y simplifica (lo dominante manda, igual que en tiempo).
5. Compara **tiempo y espacio** de las alternativas y decide qué recurso es el limitante en el contexto (por ejemplo, una GPU con poca memoria).`,
    codigo: {
      titulo: 'Memoización (caché + pila) frente a bottom-up (2 variables)',
      src: R`
profundidad = 0
maxima = 0

def fib_memo(n, cache):
    global profundidad, maxima
    profundidad += 1
    maxima = max(maxima, profundidad)
    if n < 2:
        resultado = n
    elif n in cache:
        resultado = cache[n]
    else:
        cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
        resultado = cache[n]
    profundidad -= 1
    return resultado

cache = {}
print(fib_memo(30, cache), "| valores en la caché:", len(cache), "| profundidad máxima de la pila:", maxima)

def fib_iter(n):
    a, b = 0, 1                      # solo 2 variables: O(1) de memoria extra
    for _ in range(n):
        a, b = b, a + b
    return a

print(fib_iter(30))
`,
      esperado: '832040 | valores en la caché: 29 | profundidad máxima de la pila: 30\n832040'
    },
    ejemplo: R`
**Caso de IA (S2-C1, d.22).** Al entrenar, se pueden (A) **recalcular** las activaciones intermedias durante la retropropagación o (B) **guardarlas todas** en memoria durante la pasada hacia adelante.

- **B ahorra tiempo** (no recalcula) pero **gasta memoria** (guarda todo).
- **A ahorra memoria** pero **gasta tiempo** (recalcula).
- Con una GPU de **poca memoria** se elige A (*gradient checkpointing*); con **mucha memoria y tiempo escaso**, B.

**Tabla de la clase:** §unicos_B§ usa memoria §n§ para un tiempo §n§; §unicos_A§ usa §O(1)§ extra (solo la salida) con tiempo §n²§.

**Fibonacci §n = 30§** (código de arriba): memoización → 29 valores en la caché + pila de profundidad 30 ⇒ §O(n)§; bottom-up → 2 variables ⇒ **§O(1)§**; ambos §O(n)§ en tiempo.`,
    complejidad: R`
- **Espacio de una recursión lineal** de profundidad §n§: §O(n)§ (pila). **Recursión que divide a la mitad**: §O(log n)§ (por ejemplo, la pila del quicksort en el sitio, si siempre se recursa primero en la mitad menor).
- **Justificación del §n§ de merge sort**: durante la mezcla de dos mitades necesita un arreglo auxiliar de tamaño proporcional a §n§.
- **Justificación del §O(1)§ de la suma**: un solo acumulador, independientemente de §n§.
- **Tiempo y espacio no son excluyentes en las respuestas**: reporta ambos y di cuál optimizaste.
- La complejidad espacial **también** se expresa con §O§, §Ω§ y §Θ§ y se suele reportar en el peor caso.`,
    errores: R`
- **Contar la entrada como espacio extra**: la definición dice «más allá de la entrada».
- **Olvidar la pila de llamadas** en las recursiones: aunque no declares estructuras, una recursión de profundidad §n§ gasta §O(n)§.
- **Creer que optimizar tiempo es gratis**: suele costar memoria (cachés, tablas, índices).
- **Confundir el número total de llamadas con la profundidad**: el espacio depende de la profundidad máxima.
- **No decir qué recurso es el limitante** (tiempo, memoria) al elegir entre alternativas.`,
    preguntas: [
      ['Explica el compromiso tiempo–espacio con el ejemplo de §unicos_A§ y §unicos_B§.', '§unicos_B§ es ≈ §n§ veces más rápido (§O(n)§ frente a §O(n²)§) pero gasta §O(n)§ de memoria extra (el set de vistos); §unicos_A§ no gasta memoria extra pero es cuadrático. Optimizar un recurso se paga con el otro.'],
      ['¿Cuál ahorra tiempo y cuál memoria: recalcular o guardar las activaciones en la retropropagación? ¿Bajo qué restricción eliges cada una?', 'Guardarlas ahorra **tiempo** y gasta memoria; recalcularlas ahorra **memoria** y gasta tiempo (*gradient checkpointing*). Con poca memoria de GPU se recalcula; con memoria de sobra y poco tiempo, se guarda.'],
      ['Da el espacio extra de la suma de un arreglo, merge sort y quicksort en el sitio.', 'Suma: §O(1)§ (un acumulador). Merge sort: §O(n)§ (arreglo auxiliar). Quicksort en el sitio: §O(log n)§ (la pila de llamadas).'],
      ['¿Qué espacio usa Fibonacci con memoización y con bottom-up de dos variables?', 'Memoización: §O(n)§ (caché + pila). Bottom-up con dos variables: §O(1)§.']
    ],
    resumen: R`
- **Espacio** = memoria **extra** más allá de la entrada, en función de §n§.
- Suma §1§ · §unicos_B§ §n§ · merge sort §n§ · quicksort en el sitio §log n§ (pila).
- Recursión de profundidad §d§ → §O(d)§ de pila.
- **Casi toda mejora de tiempo se paga con memoria** (y al revés): elegir es diseñar.
- Memoización §O(n)§ · bottom-up con dos variables §O(1)§.`
  });

  B.tema({
    id: 'cx-razon', area: 'cx', titulo: 'Estimar la complejidad experimentalmente: razón de duplicación', fuente: 'S2-C1 · diap. 19-20; S2-C2 · diap. 19', nivel: 2,
    conceptos: ['cx_razon'], interactivo: [],
    definicion: R`
La **razón de duplicación** es un método para **diagnosticar la complejidad de código ajeno sin leerlo**: se mide el costo para un tamaño §n§ y para §2n§ y se calcula el cociente **§T(2n)/T(n)§**. Ese número revela el crecimiento. Si §T(2n)/T(n) = 2ᵏ§, el exponente estimado es **§k = log₂(razón)§**.`,
    intuicion: R`
Si al doblar el trabajo el tiempo también se dobla, el algoritmo es **proporcional** a §n§ (lineal). Si el tiempo se **cuadruplica**, depende de §n²§. Si casi no cambia, es constante o logarítmico. Es como diagnosticar un motor escuchando cómo cambia el ruido al acelerar: **mides, duplicas y comparas**.

La clase lo llama el «uso profesional»: es la forma más rápida de diagnosticar código ajeno.`,
    formal: R`
| §T(2n)/T(n)§ | Crecimiento | Interpretación |
|---|---|---|
| ≈ 1 | constante | el tamaño no influye |
| ≈ 1 + ε | logarítmico | descarta la mitad en cada paso |
| ≈ 2 | lineal | recorre los datos una vez |
| ≈ 2,1 – 2,3 | §n log n§ | divide y vencerás |
| ≈ 4 | cuadrático | ciclos anidados |
| ≈ 8 | cúbico | triple anidamiento |

**Estimación del exponente:** si §T(n) ≈ a·nᵏ§, entonces §T(2n)/T(n) = 2ᵏ§, luego §k = log₂(T(2n)/T(n))§: §k ≈ 0§ constante, §k ≈ 1§ lineal, §k ≈ 1,1§ §n log n§, §k ≈ 2§ cuadrático.

**Advertencias:** el método da el orden **observado** (no una cota demostrada), requiere tamaños suficientemente grandes y varias repeticiones, y las mediciones en segundos **dependen de la máquina**; por eso conviene medir **operaciones** cuando se pueda.`,
    procedimiento: R`
1. Elige un tamaño inicial §n§ razonablemente grande (que el tiempo no sea ruido: > milisegundos).
2. Mide **§T(n)§** (varias repeticiones y toma la mediana/mínimo).
3. Duplica el tamaño y mide **§T(2n)§**; repite para §4n§, §8n§…
4. Calcula la **razón** §T(2n)/T(n)§ y/o el **exponente** §k = log₂(razón)§.
5. Compáralo con la tabla (≈ 4 → cuadrático…).
6. **Confirma leyendo el código** (¿cuáles son los ciclos? ¿qué operaciones ocultas hay?).`,
    codigo: [
      {
        titulo: 'La misma técnica contando operaciones (resultado exacto, sin cronómetro)',
        src: R`
import math

def logaritmico(n):
    c, i = 0, n
    while i > 1:
        i //= 2
        c += 1
    return c

def lineal(n):
    c = 0
    for i in range(n):
        c += 1
    return c

def nlogn(n):
    c = 0
    for i in range(n):
        j = 1
        while j < n:
            j *= 2
            c += 1
    return c

def cuadratico(n):
    c = 0
    for i in range(n):
        for j in range(n):
            c += 1
    return c

n = 128
for nombre, f in [("log n", logaritmico), ("n", lineal), ("n log n", nlogn), ("n^2", cuadratico)]:
    razon = f(2 * n) / f(n)
    print(nombre, "| razón =", round(razon, 2), "| exponente k =", round(math.log2(razon), 2))
`,
        esperado: 'log n | razón = 1.14 | exponente k = 0.19\nn | razón = 2.0 | exponente k = 1.0\nn log n | razón = 2.29 | exponente k = 1.19\nn^2 | razón = 4.0 | exponente k = 2.0',
        nota: 'Con §n = 128§ las razones son 1,14 (log n), 2,0 (lineal), 2,29 (n log n) y 4,0 (cuadrático): justo los rangos de la tabla.'
      },
      {
        titulo: 'Estimador con cronómetro de la clase (S2-C2, d.19). No determinista: los segundos dependen de la máquina',
        ejecutable: false,
        src: R`
import time, random, math

def estimar_orden(funcion, n_inicial=1000, repeticiones=5):
    n, anterior = n_inicial, None
    for _ in range(repeticiones):
        datos = [random.random() for _ in range(n)]
        inicio = time.perf_counter()
        funcion(datos)
        actual = time.perf_counter() - inicio
        if anterior:
            razon = actual / anterior          # T(2n)/T(n) = 2^k  =>  k = log2(razon)
            print(f"n={n:7d}  t={actual:.4f}s  razon={razon:.2f}  exponente estimado k={math.log2(razon):.2f}")
        anterior, n = actual, n * 2

estimar_orden(sorted)                          # espera k ~ 1.05 (n log n)
estimar_orden(lambda v: [x for x in v if x])   # espera k ~ 1.00 (n)
`,
        nota: 'No se ejecuta aquí porque depende del reloj de tu equipo; puedes pegarlo en la **consola de Python** del laboratorio.'
      }
    ],
    ejemplo: R`
**Tabla de la clase (S2-C1, d.19).** Tiempos de §unicos_A§ y §unicos_B§ al duplicar §n§:

| n | §unicos_A§ | factor | §unicos_B§ |
|---|---|---|---|
| 1 000 | 0,011 s | — | 0,0001 s |
| 2 000 | 0,043 s | 3,9× | 0,0002 s |
| 4 000 | 0,172 s | 4,0× | 0,0004 s |
| 8 000 | 0,690 s | 4,0× | 0,0008 s |

- §unicos_A§: razón ≈ **4** ⇒ §k = log₂ 4 = 2§ ⇒ **cuadrático**.
- §unicos_B§: razón ≈ **2** ⇒ §k = 1§ ⇒ **lineal**.

**Pregunta de análisis (3) de la clase: complejidad de la atención.** Un modelo con contexto de 4 096 tokens tarda **1 s** por muestra.

1. Con costo §Θ(L²)§ y 32 768 tokens (8× más): §8² = 64§ ⇒ **64 s**.
2. Con §Θ(L log L)§: factor §8 × (15/12) = 10§ ⇒ **10 s**.
3. Mejora: §64 / 10 = 6,4×§. Aunque 6,4× podría conseguirse con hardware, a 128 000 tokens la brecha entre §L²§ y §L log L§ es de §L / log L ≈ 7 500×§: **es un problema de complejidad, no de hardware**.`,
    complejidad: R`
- **Por qué funciona**: si §T(n) ≈ a·nᵏ§, entonces §T(2n)/T(n) = (2n)ᵏ / nᵏ = 2ᵏ§, independiente de la constante §a§ y de la máquina (mientras la medición sea limpia).
- **Margen de error**: §n log n§ da razón ≈ 2,1–2,3 (ligeramente mayor que 2), por eso el exponente estimado sale ≈ 1,05–1,2.
- **Límites**: términos de menor orden y constantes distorsionan las razones para §n§ pequeño; el caché y el recolector de basura añaden ruido. Se necesitan §n§ grandes y varias mediciones.
- **Complementar con el análisis**: el experimento **sugiere** el orden; la **demostración** sale de contar operaciones ([[cx-conteo]], [[cx-reglas]]).`,
    errores: R`
- **Medir una sola vez** y con tiempos de microsegundos: es ruido, no información.
- **Comparar con tamaños que no se duplican** y aplicar la tabla igual.
- **Creer que la razón ≈ 2 prueba §Θ(n)§**: §n log n§ también da ≈ 2,1–2,3; confirma con el código.
- **Usar §n§ demasiado pequeño**, donde la constante domina (ver [[cx-constantes]]).
- **Olvidar que el experimento es del caso medido** (no del peor caso): elige entradas del caso que quieres evaluar.
- **Confundir el exponente §k§ con la complejidad exacta**: §k = 1,1§ no es «§O(n¹·¹)§», es §n log n§.`,
    preguntas: [
      ['Si al duplicar §n§ el tiempo se multiplica por 4, ¿qué crecimiento tiene el algoritmo?', '**Cuadrático** (§2ᵏ = 4§ ⇒ §k = 2§ ⇒ §Θ(n²)§): típico de ciclos anidados.'],
      ['¿Cómo se estima el exponente §k§ con la razón de duplicación?', '§T(2n)/T(n) = 2ᵏ§, luego §k = log₂(T(2n)/T(n))§: §k ≈ 0§ constante, §≈ 1§ lineal, §≈ 1,1§ §n log n§, §≈ 2§ cuadrático.'],
      ['Un modelo con contexto 4096 tarda 1 s con costo §Θ(L²)§. ¿Cuánto tardaría con 32 768 tokens? ¿Y con §Θ(L log L)§?', '§Θ(L²)§: §(32 768/4096)² = 64§ ⇒ 64 s. §Θ(L log L)§: §8 × 15/12 = 10§ ⇒ 10 s. Mejora de 6,4×; es un problema de complejidad, no de hardware.'],
      ['¿Por qué la razón de §n log n§ sale entre 2,1 y 2,3 y no 2?', 'Porque §(2n·log 2n)/(n·log n) = 2·(1 + 1/log n)§, ligeramente mayor que 2 (con §n = 1024§ vale 2,2).']
    ],
    resumen: R`
- **Razón de duplicación** §T(2n)/T(n)§: ≈1 constante · ≈1+ε log · ≈2 lineal · ≈2,1–2,3 n log n · ≈4 cuadrático · ≈8 cúbico.
- Exponente §k = log₂(razón)§.
- Es **diagnóstico experimental** (no demostración): mide varias veces, con §n§ grande, y confirma leyendo el código.
- Mejor medir **operaciones** que segundos cuando se pueda.
- Atención: 4096 → 32 768 tokens = ×64 con §L²§, ×10 con §L log L§.`
  });

  B.tema({
    id: 'cx-constantes', area: 'cx', titulo: 'Lo que la notación O oculta: constantes y localidad', fuente: 'S2-C2 · diap. 20-24', nivel: 2, comp: true,
    conceptos: ['cx_constantes'], interactivo: [],
    definicion: R`
La notación §O§ **oculta deliberadamente** las **constantes** y la **localidad de caché**. Para §n§ pequeño (o en el rango de tamaños que se usa en la práctica) **la constante manda**: un algoritmo asintóticamente peor puede ser el más rápido. §O§ describe el **comportamiento límite**, no el rendimiento en todos los tamaños.`,
    intuicion: R`
Un camión (algoritmo §O(n)§ con constante enorme) y una moto (algoritmo §O(n log n)§ con constante pequeña) compiten llevando paquetes. Para pocos paquetes la moto gana: el camión tarda en arrancar. Solo cuando son millones de paquetes el camión supera a la moto. **¿Cuántos paquetes tienes tú?** Esa es la pregunta que §O§ no responde.

Por eso el §sort()§ de Python (**Timsort**) es §O(n log n)§ pero **cambia a *insertion sort*** en subarreglos de menos de 64 elementos: allí, un algoritmo §O(n²)§ de constante pequeña es más rápido.`,
    formal: R`
| Situación | Qué dice §O§ | Qué ocurre en realidad |
|---|---|---|
| §n§ pequeño (< 100) | nada útil | domina la constante |
| Localidad de caché | la ignora | puede valer **10×** |
| Insertion sort vs merge sort | §n²§ pierde | **gana con §n < 50§** |
| **Ejemplo real: Timsort** | §O(n log n)§ | cambia a insertion sort en subarreglos < 64 |

**Constantes frente a orden:** un algoritmo §O(n)§ con constante 1000 es **más lento** que uno §O(n log n)§ con constante 2 mientras §1000n > 2n·log₂ n§, es decir, para todo §n < 2⁵⁰⁰§ (≈ 3 × 10¹⁵⁰; la diapositiva dice «< 10³⁰», que también es cierto aunque no es el valor ajustado).

**Caso IA: la atención de los transformers.** Compara cada token con todos los demás: con §L§ tokens realiza §L²§ productos escalares: **§Θ(L² · d)§ en tiempo y §Θ(L²)§ en memoria**.

| Longitud §L§ | Operaciones ∝ §L²§ | Factor respecto a 1K |
|---|---|---|
| 1 024 | 1,0 × 10⁶ | 1× |
| 8 192 | 6,7 × 10⁷ | 64× |
| 128 000 | 1,6 × 10¹⁰ | 15 625× |

Duplicar el contexto **cuadruplica** el costo. Toda la investigación en atención eficiente (FlashAttention, atención dispersa, modelos de espacio de estados) busca bajar de §L²§ a §L log L§ o §L§: es un **problema de complejidad, no de hardware**.`,
    procedimiento: R`
Para decidir entre dos algoritmos **más allá de la notación §O§**:

1. Escribe las **funciones de costo con constantes** (§T₁(n) = c₁·f₁(n)§ y §T₂(n) = c₂·f₂(n)§).
2. Encuentra el **punto de cruce §n*§** donde empiezan a valer lo mismo.
3. Compara **§n*§ con el rango real de tamaños** de tus datos.
4. Considera **la localidad de caché** y la **memoria extra**.
5. **Mide** en tu caso real (con varias repeticiones) para confirmar.
6. Si eres autor de una biblioteca, considera una **estrategia híbrida** como Timsort.`,
    codigo: {
      titulo: 'Punto de cruce de dos modelos de costo con constantes distintas (valores de ejemplo)',
      src: R`
import math

def costo_insercion(n):          # modelo de ejemplo: ~ n^2 / 4 operaciones, constante pequeña
    return n * n / 4

def costo_mezcla(n):             # modelo de ejemplo: ~ 4 n log2 n operaciones, constante mayor
    return 4 * n * math.log2(n)

n = 2
while costo_mezcla(n) >= costo_insercion(n):
    n += 1
print("la mezcla empieza a ganar en n =", n)
for tam in [16, 64, 256, 1024]:
    ganador = "inserción" if costo_insercion(tam) < costo_mezcla(tam) else "mezcla"
    print(tam, "->", ganador)
`,
      esperado: 'la mezcla empieza a ganar en n = 109\n16 -> inserción\n64 -> inserción\n256 -> mezcla\n1024 -> mezcla',
      nota: 'Las constantes (1/4 y 4) son **ilustrativas**, no medidas; lo importante es la forma de razonar: el algoritmo asintóticamente peor gana para §n§ pequeño.'
    },
    ejemplo: R`
**§O(n)§ con constante 1000 frente a §O(n log n)§ con constante 2.**
§T₁(n) = 1000n§ y §T₂(n) = 2n·log₂ n§. Con §n = 10⁶§: §T₁ = 10⁹§ y §T₂ ≈ 4 × 10⁷§ ⇒ **el «peor» §O(n log n)§ gana por 25×**. Solo con §n > 2⁵⁰⁰§ ganaría §T₁§.

**Insertion sort frente a merge sort.** Con 20 elementos, insertion sort ejecuta pocas comparaciones y casi no tiene gasto fijo; merge sort necesita arreglos auxiliares y llamadas. Por eso las bibliotecas reales usan **estrategias híbridas** (Timsort: insertion sort por debajo de 64).

**Atención con §L = 128 000§:** §1,6 × 10¹⁰§ productos por capa y por cabeza: aunque cada uno sea rápido, la cuadrática manda — por eso se investiga bajar la complejidad.

**Actividad de la clase (23): clasificar y corregir.** Cuatro funciones reales (búsqueda de duplicados, índice invertido, normalización de una matriz, filtrado de un dataset): para cada una, escribir §T(n)§ y la cota §Θ§ ajustada, señalar la operación de Python subestimada, proponer una reescritura y **predecir y medir el factor de mejora para §n = 10⁵§**.`,
    complejidad: R`
- **Qué se justifica con §O§**: el comportamiento **a partir de un §n₀§ suficientemente grande**. Antes de §n₀§ la constante decide.
- **Punto de cruce**: para §c₁·f₁ = c₂·f₂§. Si el cruce está muy por encima de los tamaños reales, el algoritmo «mejor» asintóticamente **no sirve en la práctica**.
- **Atención**: §Θ(L²·d)§ en tiempo y §Θ(L²)§ en memoria; el factor al duplicar §L§ es 4 (razón de duplicación 4 ⇒ cuadrático, ver [[cx-razon]]).
- **Localidad de caché**: recorrer un arreglo contiguo puede ser hasta 10× más rápido que saltar por la memoria con el mismo número de operaciones; §O§ no lo captura.
- **Moraleja**: la notación §O§ es **necesaria pero no suficiente**: se complementa con **medición** y conocimiento del rango de §n§.`,
    errores: R`
- **Elegir siempre el algoritmo de mejor orden** sin mirar el rango real de §n§.
- **Ignorar las constantes** cuando §n§ es pequeño: ahí son lo único que importa.
- **Creer que §O(n²)§ siempre pierde frente a §O(n log n)§**: insertion sort gana con §n < 50§.
- **Olvidar la localidad de caché**: dos algoritmos con el mismo §O§ pueden diferir 10×.
- **Concluir «es §O(n)§, por tanto es rápido»**: con constante 1000 puede ser más lento que uno §O(n log n)§.
- **Pensar que el problema de la atención se arregla comprando hardware**: es de complejidad (§L²§).`,
    preguntas: [
      ['¿Puede un algoritmo §O(n²)§ ser preferible a uno §O(n log n)§? Da un caso concreto.', 'Sí, para §n§ pequeño donde la constante domina: insertion sort (§O(n²)§) gana a merge sort con §n < 50§ y por eso el §sort()§ de Python (Timsort) usa insertion sort en subarreglos de menos de 64 elementos.'],
      ['¿Qué oculta deliberadamente la notación §O§?', 'Las **constantes** y la **localidad de caché**: para §n§ pequeño o en el rango práctico de tamaños, esos factores pueden decidir cuál algoritmo es más rápido.'],
      ['Duplicar el contexto de un transformer, ¿cómo afecta el costo de la atención y por qué?', 'Lo **cuadruplica**: la atención compara cada token con todos los demás (§L²§ productos). Es un problema de complejidad (§Θ(L²)§ en tiempo y memoria), no de hardware.'],
      ['Un algoritmo §O(n)§ con constante 1000 y otro §O(n log n)§ con constante 2: ¿cuál es más rápido con §n = 10⁶§?', 'El §O(n log n)§: §10⁹§ operaciones frente a §≈ 4 × 10⁷§. Solo para §n > 2⁵⁰⁰§ ganaría el lineal.']
    ],
    resumen: R`
- §O§ oculta **constantes** y **localidad de caché**; para §n§ pequeño manda la constante.
- Insertion sort gana con §n < 50§; Timsort usa insertion sort por debajo de 64 elementos.
- §O(n)§ con c = 1000 pierde frente a §O(n log n)§ con c = 2 hasta §n ≈ 2⁵⁰⁰§.
- Atención de transformers: §Θ(L²)§: duplicar el contexto cuadruplica el costo (problema de complejidad).
- §O§ es necesaria pero no suficiente: **mide** en tu rango de §n§.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
