/* teoria_ay.js — Biblioteca: área Arreglos y técnicas (fuente: S3-C1, Clase1_Arrays, 29 diapositivas). */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'ay-arreglo', area: 'ay', titulo: 'El arreglo: tabla de operaciones y aritmética de direcciones', fuente: 'S3-C1 · diap. 5-7, 26', nivel: 10,
    conceptos: ['ay_def'], lab: [{ tab: 'arreglos', e: 'ops', texto: 'Ver insertar y eliminar con desplazamientos' }], alias: 'array contiguo indice acceso insercion',
    definicion: R`
Un **arreglo** §A§ es una estructura de datos de **tamaño fijo §n§** que almacena los elementos §a₀, a₁, …, aₙ₋₁§ de forma **secuencial y contigua**. Cada elemento §aᵢ§ se accede por su **índice** §i§. Los arreglos se numeran **desde cero** (0-indexados): el elemento «i-ésimo» humano está en el índice §i − 1§ de la máquina.

**Firma del arreglo: acceso instantáneo, modificación estructural cara.** Todo lo que sigue en esta semana explota lo primero y evita lo segundo.`,
    intuicion: R`
Un arreglo es una **fila de casilleros numerados pegados uno al lado del otro**. Como todos tienen el mismo tamaño y están juntos, saber dónde está el casillero §i§ es una **cuenta**, no una búsqueda: se salta §i × tam§ bytes desde el principio. **Acceso inmediato.**

Pero si quieres **meter uno nuevo en el medio**, los de la derecha tienen que **correrse un lugar** (y si no hay lugar, hay que mudar todo el arreglo a uno más grande). Por eso **insertar y eliminar** cuestan lo mismo que el número de elementos que se corren.

En una lista enlazada es al revés: insertar es rápido y llegar al elemento §i§ obliga a seguir §i§ referencias. Por eso el arreglo es la base de NumPy y de todos los tensores de IA.`,
    formal: R`
**Tabla de operaciones** (diap. 6):

| Operación | Tiempo | Descripción |
|---|---|---|
| **Acceso** | §O(1)§ | con el índice §i§ se obtiene §A[i] = aᵢ§ directamente |
| **Búsqueda** | §O(n)§ | se revisa elemento por elemento hasta hallar el valor |
| **Inserción** | §O(n)§ | hay que desplazar a la derecha y quizá crear un arreglo mayor |
| **Eliminación** | §O(n)§ | hay que desplazar a la izquierda los elementos siguientes |

**Por qué el acceso es O(1)** (diap. 7): como el arreglo es contiguo y cada elemento ocupa §tam§ bytes,

§dir(A[i]) = base + i × tam§

Una multiplicación y una suma, sin importar §i§ ni §n§. Con §base = 2000§ y §tam = 8§: §dir(A[3]) = 2000 + 3 × 8 = 2024§.

[comp]**Arreglo dinámico (la §list§ de Python).** Cuando se llena, reserva uno de **doble capacidad** y copia los §n§ elementos: esa operación cuesta §O(n)§, pero ocurre cada vez menos seguido, así que §append§ cuesta **§O(1)§ amortizado**. Insertar al **final** es barato; insertar o eliminar al **inicio o en el medio** sigue siendo §O(n)§.[/comp]`,
    procedimiento: R`
**Insertar §x§ en la posición §i§ (arreglo con espacio):**

1. Si §n = capacidad§: crear un arreglo mayor y **copiar** (§O(n)§).
2. Desde el final hasta §i§: §A[j] = A[j − 1]§ (**desplazar a la derecha**).
3. §A[i] = x§ y §n += 1§. **Desplazamientos: §n − i§.**

**Eliminar la posición §i§:**

1. Para §j§ desde §i§ hasta §n − 2§: §A[j] = A[j + 1]§ (**desplazar a la izquierda**).
2. §n −= 1§ (la última casilla queda libre). **Desplazamientos: §n − 1 − i§.**

**Peor caso** de ambas: la posición **0** (se mueven los §n§ elementos). **Mejor caso**: el final (0 desplazamientos).`,
    codigo: [{
      titulo: 'Insertar y eliminar contando desplazamientos; acceso por aritmética de direcciones',
      src: R`
def insertar(A, i, x):
    desplazamientos = 0
    A.append(None)                      # espacio para un elemento mas
    for j in range(len(A) - 1, i, -1):
        A[j] = A[j - 1]                 # desplazar a la derecha
        desplazamientos += 1
    A[i] = x
    return desplazamientos

def eliminar(A, i):
    desplazamientos = 0
    for j in range(i, len(A) - 1):
        A[j] = A[j + 1]                 # desplazar a la izquierda
        desplazamientos += 1
    A.pop()
    return desplazamientos

def direccion(base, i, tam):
    return base + i * tam

A = [17, 4, 29, 8, 11]
print(insertar(A, 0, 99), A)            # al inicio: se mueven los 5
print(insertar(A, len(A), 7), A)        # al final: ninguno
print(eliminar(A, 1), A)
print(direccion(2000, 3, 8))
`,
      esperado: '5 [99, 17, 4, 29, 8, 11]\n0 [99, 17, 4, 29, 8, 11, 7]\n5 [99, 4, 29, 8, 11, 7]\n2024'
    }],
    ejemplo: R`
**Arreglo §[17, 4, 29, 8, 11]§ con base 2000 y 8 bytes por elemento:**

| índice | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| valor | 17 | 4 | 29 | 8 | 11 |
| dirección | 2000 | 2008 | 2016 | **2024** | 2032 |

**Insertar 99 en la posición 2:** se desplazan los elementos de los índices 4, 3 y 2 una casilla a la derecha (**3 desplazamientos**) y queda §[17, 4, 99, 29, 8, 11]§. **Eliminar la posición 1** del arreglo original desplaza 3 elementos y queda §[17, 29, 8, 11]§.

**Pregunta de la clase (diap. 26):** ¿por qué el acceso a §A[i]§ es O(1) y la inserción al inicio es O(n)? Porque el acceso es una **fórmula** sobre memoria contigua; la inserción al inicio obliga a **mover los n elementos** para dejar libre la casilla 0.`,
    complejidad: R`
| Operación | Mejor | Peor | Observación |
|---|---|---|---|
| Acceso §A[i]§ | §O(1)§ | §O(1)§ | fórmula de direcciones |
| Búsqueda | §O(1)§ | §O(n)§ | el valor está primero / no está |
| Insertar en §i§ | §O(1)§ (al final) | §O(n)§ (al inicio) | §n − i§ desplazamientos |
| Eliminar en §i§ | §O(1)§ (al final) | §O(n)§ (al inicio) | §n − 1 − i§ desplazamientos |

- **Espacio**: §O(n)§; sin referencias extra por elemento.
- **Insertar al final** de un arreglo dinámico: §O(1)§ **amortizado** (§O(n)§ solo cuando hay que crecer).
- **Localidad de caché**: excelente (ver [[td-cache]]).`,
    errores: R`
- **Confundir la posición humana con el índice**: el elemento «i-ésimo» está en el índice §i − 1§.
- **Decir que insertar en un arreglo es §O(1)§** sin precisar: solo lo es **al final** (y amortizado).
- **Modificar el arreglo mientras se recorre con §insert§/§pop(0)§**: cada una cuesta §O(n)§ y arruina la complejidad.
- **Olvidar el caso del arreglo lleno**: hay que crear uno mayor y copiar.
- **Usar la fórmula §base + i × tam§ en una lista enlazada**: solo vale en memoria contigua.`,
    preguntas: [
      ['Completa la tabla de operaciones del arreglo (acceso, búsqueda, inserción, eliminación).', 'Acceso O(1); búsqueda O(n); inserción O(n) (desplazar a la derecha, quizá crear un arreglo mayor); eliminación O(n) (desplazar a la izquierda).'],
      ['¿Por qué el acceso a §A[i]§ es O(1) y la inserción al inicio es O(n)?', 'El acceso usa dir(A[i]) = base + i × tam, una multiplicación y una suma sobre memoria contigua; la inserción al inicio exige desplazar los n elementos una casilla a la derecha.'],
      ['Con base 2000 y 8 bytes por elemento, ¿cuál es la dirección de §A[3]§?', '2000 + 3 × 8 = 2024.'],
      ['¿Por qué §list.append§ es O(1) amortizado aunque a veces cuesta O(n)?', 'Cuando la lista se llena se reserva el doble de capacidad y se copian los n elementos (O(n)), pero eso ocurre cada vez menos seguido; repartido entre todas las inserciones, el costo promedio por inserción es constante.']
    ],
    resumen: R`
- Arreglo: **contiguo**, tamaño fijo, índice desde **0**.
- **Acceso §O(1)§** (§base + i × tam§); **búsqueda §O(n)§**; **insertar/eliminar §O(n)§** (desplazar).
- Firma: acceso instantáneo, modificación estructural cara.
- Dinámico (§list§): crece duplicando ⇒ §append§ §O(1)§ amortizado.`
  });

  B.tema({
    id: 'ay-prefijos', area: 'ay', titulo: 'Suma de prefijos: consultas de rango en O(1)', fuente: 'S3-C1 · diap. 4, 8-10, 24-26', nivel: 10,
    conceptos: ['ay_pref'], lab: [{ tab: 'arreglos', e: 'pre', texto: 'Ver la suma de prefijos' }], alias: 'prefix sum consultas rango acumulada',
    definicion: R`
**Pregunta inicial de la clase:** ventas diarias de un año (§n = 365§) y **miles de consultas** «¿cuánto se vendió entre el día §i§ y el día §j§?». Sumar el rango cada vez cuesta §O(n)§ por consulta. La **suma de prefijos** responde cada una en **§O(1)§**.

Se construye **una sola vez** (en **una pasada O(n)**) el **arreglo de prefijos** §P§:

§P[0] = A[0]§ y §P[i] = P[i − 1] + A[i]§

y cada consulta de suma de rango §q(i, j) = aᵢ + aᵢ₊₁ + … + aⱼ§ se resuelve con §q(i, j) = P[j] − P[i − 1]§ (con §P[−1] = 0§, caso §i = 0§).`,
    intuicion: R`
§P[i]§ guarda **«cuánto llevo acumulado hasta el día i»**, como el cuentakilómetros de un carro. Para saber cuántos kilómetros recorriste **entre dos paradas**, no sumas cada tramo: **restas** dos lecturas del cuentakilómetros.

Se **paga una vez** (construir §P§, §O(n)§ de tiempo y memoria) para que **cada consulta sea una resta**. Es un **compromiso tiempo–espacio**: rentable cuando hay muchas consultas sobre un arreglo fijo.`,
    formal: R`
**Construcción:** §P[0] = A[0]§; para §i ≥ 1§: §P[i] = P[i − 1] + A[i]§. Tiempo y espacio §O(n)§.

**Consulta:** §q(i, j) = P[j] − P[i − 1]§ si §i ≥ 1§; §q(0, j) = P[j]§.

**Demostración:** §P[j] = a₀ + … + aⱼ§ y §P[i − 1] = a₀ + … + aᵢ₋₁§; al restar quedan exactamente §aᵢ + … + aⱼ§.

**Punto de equilibrio** (pregunta de análisis, diap. 10): sin prefijos, §Q§ consultas cuestan §Q · n§ (construir no cuesta nada); con prefijos, §n + Q§ (construir una vez más una resta por consulta). Conviene la suma de prefijos cuando §n + Q < Q · n§ ⇔ §Q > n / (n − 1)§: con §n ≥ 3§ basta **§Q ≥ 2§**, y la ganancia crece con §Q§ (con muchas consultas es enorme).

**Ejemplo (diap. 8):** §A = [5, 4, 9, 0, 1, 3]§ → §P = [5, 9, 18, 18, 19, 22]§. §q(2, 4) = P[4] − P[1] = 19 − 9 = 10 = 9 + 0 + 1§ ✓.`,
    procedimiento: R`
**Para usar prefijos:**

1. **Construye §P§** con una pasada: §P[0] = A[0]§ y §P[i] = P[i − 1] + A[i]§.
2. **Para cada consulta §(i, j)§:** si §i = 0§, responde §P[j]§; si no, §P[j] − P[i − 1]§.
3. **Comprueba** con un caso pequeño: la suma directa debe coincidir.
4. Si el arreglo **cambia** entre consultas, los prefijos dejan de valer (habría que reconstruirlos o usar otra estructura): esta técnica es para arreglos **fijos**.

**Verificación (diap. 26):** prefijos de §[3, 1, 4, 1, 5]§ → §[3, 4, 8, 9, 14]§; §q(1, 3) = P[3] − P[0] = 9 − 3 = 6 = 1 + 4 + 1§.`,
    codigo: [{
      titulo: 'SumaRango (diapositiva 9) comparada con la suma directa',
      src: R`
class SumaRango:
    def __init__(self, A):
        self.P = [0] * len(A)
        self.P[0] = A[0]
        for i in range(1, len(A)):      # O(n): construccion
            self.P[i] = self.P[i - 1] + A[i]

    def consulta(self, i, j):           # O(1): cada consulta
        return self.P[j] if i == 0 else self.P[j] - self.P[i - 1]

sr = SumaRango([5, 4, 9, 0, 1, 3])
print(sr.P)
print(sr.consulta(2, 4))                # 10
print(sr.consulta(0, 5), sr.consulta(3, 3))

A = [3, 1, 4, 1, 5]
s2 = SumaRango(A)
print(s2.P, s2.consulta(1, 3))
# comprobacion contra la suma directa de cada rango
todas_iguales = all(s2.consulta(i, j) == sum(A[i:j + 1]) for i in range(len(A)) for j in range(i, len(A)))
print(todas_iguales)
`,
      esperado: '[5, 9, 18, 18, 19, 22]\n10\n22 0\n[3, 4, 8, 9, 14] 6\nTrue'
    }],
    ejemplo: R`
**Consultas sobre §A = [5, 4, 9, 0, 1, 3]§**, con §P = [5, 9, 18, 18, 19, 22]§:

| Consulta | Cálculo | Resultado | Comprobación |
|---|---|---|---|
| §q(2, 4)§ | §P[4] − P[1] = 19 − 9§ | **10** | 9 + 0 + 1 |
| §q(0, 5)§ | §P[5] = 22§ | **22** | suma de todo |
| §q(3, 3)§ | §P[3] − P[2] = 18 − 18§ | **0** | el elemento 0 |
| §q(1, 2)§ | §P[2] − P[0] = 18 − 5§ | **13** | 4 + 9 |

**Actividad de la clase:** temperatura de una GPU muestreada cada segundo durante una hora (§n = 3600§). *«Temperatura media entre el segundo §i§ y el §j§»* → **prefijos** (suma en O(1), dividida entre §j − i + 1§); *«intervalo con mayor aumento neto»* → **Kadane** (ver [[ay-kadane]]); *«ventana más larga sin superar un umbral»* → **ventana deslizante** (ver [[ay-punteros]]).`,
    complejidad: R`
| | Sin prefijos | Con prefijos |
|---|---|---|
| Construcción | — | §O(n)§ una vez |
| Cada consulta | §O(n)§ | **§O(1)§** |
| Q consultas | §O(Q · n)§ | §O(n + Q)§ |
| Memoria extra | §O(1)§ | §O(n)§ |

- **Ejemplo numérico:** §n = 365§ y §Q = 10 000§ consultas: sin prefijos ≈ 3,65 millones de sumas; con prefijos ≈ 10 365 operaciones.
- **Compromiso tiempo–espacio:** se paga §O(n)§ de memoria y preproceso **una vez** para responder cada consulta en §O(1)§.`,
    errores: R`
- **Olvidar el caso §i = 0§** en la consulta: §P[i − 1]§ sería §P[−1]§ (el **último** elemento en Python).
- **Usar prefijos cuando el arreglo cambia** entre consultas sin reconstruirlos.
- **Calcular §P[j] − P[i]§** en vez de §P[j] − P[i − 1]§ (deja fuera a §A[i]§).
- **Creer que ahorra memoria:** usa §O(n)§ de memoria extra.
- **Aplicarlo a pocas consultas:** con una o dos consultas la construcción no se amortiza.`,
    preguntas: [
      ['Construye el arreglo de prefijos de §[3, 1, 4, 1, 5]§ y responde §q(1, 3)§.', 'P = [3, 4, 8, 9, 14]; q(1, 3) = P[3] − P[0] = 9 − 3 = 6 (= 1 + 4 + 1).'],
      ['¿Cuánto cuestan la construcción y cada consulta de la suma de prefijos?', 'La construcción es una pasada O(n) (una sola vez); cada consulta de suma de rango cuesta O(1): P[j] − P[i − 1].'],
      ['Escribe la desigualdad de costos totales para decidir cuándo conviene la suma de prefijos (n elementos, Q consultas).', 'Sin prefijos: Q·n. Con prefijos: n + Q. Conviene cuando n + Q < Q·n, o sea, con muchas consultas (Q ≥ 2 y n > 1); la ventaja crece con Q.'],
      ['¿Qué compromiso se paga con esta técnica?', 'Se gasta O(n) de memoria y de preproceso, una sola vez, a cambio de responder cada consulta en tiempo constante (compromiso tiempo–espacio).']
    ],
    resumen: R`
- **Prefijos:** §P[i] = P[i − 1] + A[i]§ en una pasada §O(n)§.
- **Consulta:** §q(i, j) = P[j] − P[i − 1]§ en **§O(1)§** (caso §i = 0§: §P[j]§).
- Rentable con **muchas consultas** sobre un arreglo **fijo**: §O(n + Q)§ frente a §O(Q · n)§.
- Compromiso **tiempo–espacio**.`
  });

  B.tema({
    id: 'ay-kadane', area: 'ay', titulo: 'Kadane: el máximo subarreglo contiguo en O(n)', fuente: 'S3-C1 · diap. 11-15, 25', nivel: 10,
    conceptos: ['ay_kad'], lab: [{ tab: 'arreglos', e: 'kad', texto: 'Ver Kadane paso a paso' }], alias: 'kadane maximo subarreglo suma contigua',
    definicion: R`
Dado §A = [a₀, …, aₙ₋₁]§ con valores **positivos y negativos**, hallar la **suma máxima de un subarreglo contiguo no vacío**. El enfoque ingenuo prueba **todos** los subarreglos y suma cada uno: §O(n²)§ (o §O(n³)§ si se suma desde cero). **Kadane** lo resuelve en **una sola pasada: §O(n)§ de tiempo y §O(1)§ de espacio.**

Mantiene dos cantidades:

- §S_act(i)§: mejor suma de un subarreglo que **termina exactamente** en el índice §i§.
- §S_max(i)§: mejor suma vista **hasta** el índice §i§ (la respuesta se acumula aquí).`,
    intuicion: R`
Al llegar a §aᵢ§ te preguntas: **¿me conviene extender el subarreglo anterior o empezar de nuevo en §aᵢ§?**

> **Si lo que traigo acumulado es negativo, me lastra: mejor empiezo de cero en §aᵢ§.**

Es como una **racha de ganancias**: si vienes perdiendo (acumulado negativo), cualquier ganancia nueva vale más **sin** esa carga; si vienes ganando, sumas. En cada paso solo importan **dos números**, no todos los subarreglos posibles.`,
    formal: R`
**Recurrencia:**

§S_act(i) = máx( aᵢ , S_act(i − 1) + aᵢ )§

§S_max(i) = máx( S_max(i − 1) , S_act(i) )§

con §S_act(0) = S_max(0) = a₀§. La respuesta es §S_max(n − 1)§.

**Corrección:** todo subarreglo óptimo termina en algún índice §i§; entre los que terminan en §i§, el mejor es el de §S_act(i)§, que o bien es solo §aᵢ§ o bien extiende al mejor que termina en §i − 1§ (si ese fuera peor que 0, convendría soltarlo). El máximo sobre todos los §i§ es la respuesta.

**Traza (diap. 13)** con §A = [−2, 1, −3, 4, −1, 2, 1, −5, 4]§:

| aᵢ | −2 | 1 | −3 | 4 | −1 | 2 | 1 | −5 | 4 |
|---|---|---|---|---|---|---|---|---|---|
| S_act | −2 | 1 | −2 | 4 | 3 | 5 | 6 | 1 | 5 |
| S_max | −2 | 1 | 1 | 4 | 4 | 5 | 6 | 6 | 6 |

En §i = 3§: como §−2 + 4 = 2 < 4§, **se reinicia** en 4. El máximo **6** corresponde al subarreglo **[4, −1, 2, 1]**.`,
    procedimiento: R`
**Aplicar Kadane a mano:**

1. §s_actual = s_max = A[0]§ (¡no 0!).
2. Para cada §i§ desde 1: §s_actual = máx(A[i], s_actual + A[i])§ (**extender o reiniciar**).
3. §s_max = máx(s_max, s_actual)§.
4. Devuelve §s_max§.

**Para recuperar el subarreglo** (colab de la clase): guarda el índice donde **reinicias** (§inicio§); cuando §s_actual§ supera a §s_max§, anota §mejor_ini = inicio§ y §mejor_fin = i§.

**Caso límite (diap. 15):** si **todos** son negativos (§[−5, −2, −8, −1]§) el resultado correcto es **−1** (el mayor elemento; el subarreglo no puede estar vacío). Una versión que inicializa §s_max = 0§ devolvería **0**, que es **incorrecto** según el enunciado: el **error más común** al programar Kadane.`,
    codigo: [{
      titulo: 'Kadane (diapositiva 14), con reconstrucción del subarreglo y el caso de todos negativos',
      src: R`
def max_subarreglo(A):
    s_actual = s_max = A[0]
    for i in range(1, len(A)):
        # extender el subarreglo previo o empezar de cero en A[i]
        s_actual = max(A[i], s_actual + A[i])
        s_max = max(s_max, s_actual)
    return s_max

def max_subarreglo_indices(A):
    s_actual = s_max = A[0]
    inicio = mejor_ini = mejor_fin = 0
    for i in range(1, len(A)):
        if A[i] > s_actual + A[i]:
            s_actual = A[i]
            inicio = i                  # reinicia aqui
        else:
            s_actual = s_actual + A[i]
        if s_actual > s_max:
            s_max = s_actual
            mejor_ini, mejor_fin = inicio, i
    return s_max, A[mejor_ini:mejor_fin + 1]

datos = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_subarreglo(datos))
print(max_subarreglo_indices(datos))
print(max_subarreglo([-5, -2, -8, -1]))    # -1: todos negativos
print(max_subarreglo([7]))
`,
      esperado: '6\n(6, [4, -1, 2, 1])\n-1\n7'
    }],
    ejemplo: R`
**Todos negativos.** Con §[−5, −2, −8, −1]§: §s_actual§ y §s_max§ empiezan en −5; en §i = 1§: §máx(−2, −5 + (−2)) = −2§ → §s_max = −2§; en §i = 2§: §máx(−8, −2 − 8) = −8§ → §s_max§ sigue −2; en §i = 3§: §máx(−1, −8 − 1) = −1§ → §s_max = −1§. **Respuesta −1** (correcta). Con §s_max = 0§ inicial la respuesta sería 0 (un subarreglo **vacío**, que no es válido).

**Aplicaciones en IA (diap. 14):** el patrón «mantener el mejor acumulado y decidir extender o reiniciar» aparece al detectar la **racha más rentable** en una serie temporal, el **segmento de audio con mayor energía** o el **tramo de una señal con mayor activación**: un barrido de un paso sobre datos secuenciales.`,
    complejidad: R`
- **Kadane:** §O(n)§ de tiempo (una pasada) y **§O(1)§** de espacio (dos variables).
- **Ingenuo:** probar todos los subarreglos sumando cada uno: §O(n²)§ (con sumas acumuladas) o §O(n³)§ (sumando desde cero).
- **Con prefijos:** §O(n)§ también, pero con §O(n)§ de memoria; Kadane es más económico en memoria.
- Con §n = 10⁶§: Kadane ≈ 10⁶ pasos; el ingenuo ≈ 10¹² (≈ 17 minutos a 10⁹ operaciones por segundo).`,
    errores: R`
- **Inicializar §s_max = 0§**: falla cuando todos los valores son negativos.
- **Confundir subarreglo contiguo** (Kadane) con **subsecuencia** (elementos no necesariamente vecinos).
- **No distinguir «mejor que termina en §i§» de «mejor visto hasta §i§»**: son dos variables distintas.
- **Olvidar reiniciar** cuando el acumulado es negativo: se arrastra una carga que empeora todo.
- **Pensar que es §O(n²)§ por «probar extender o reiniciar»**: cada elemento se visita una sola vez.`,
    preguntas: [
      ['Explica la decisión «extender o reiniciar» de Kadane en una frase.', 'En cada elemento, si lo acumulado hasta el anterior es negativo conviene empezar de nuevo en el elemento actual; si no, se extiende el subarreglo anterior: s_actual = máx(A[i], s_actual + A[i]).'],
      ['¿Qué devuelve §max_subarreglo([-5, -2, -8, -1])§ y por qué es correcto? ¿Qué devolvería una versión con §s_max = 0§?', 'Devuelve −1 (el mayor elemento), porque el subarreglo no puede ser vacío. Con s_max = 0 devolvería 0, que corresponde a un subarreglo vacío y es incorrecto.'],
      ['Aplica Kadane a §[−2, 1, −3, 4, −1, 2, 1, −5, 4]§.', 'El máximo es 6, del subarreglo [4, −1, 2, 1]. S_act = −2, 1, −2, 4, 3, 5, 6, 1, 5; S_max = −2, 1, 1, 4, 4, 5, 6, 6, 6.'],
      ['¿Cuál es la complejidad de Kadane y la del enfoque ingenuo?', 'Kadane: O(n) tiempo y O(1) espacio. Ingenuo (probar todos los subarreglos): O(n²).']
    ],
    resumen: R`
- **Kadane**: §S_act = máx(aᵢ, S_act + aᵢ)§ y §S_max = máx(S_max, S_act)§: **extender o reiniciar**.
- **§O(n)§** tiempo, **§O(1)§** espacio (ingenuo: §O(n²)§).
- Inicializar con §A[0]§, **no con 0** (todos negativos).
- Subarreglo **contiguo** ≠ subsecuencia.`
  });

  B.tema({
    id: 'ay-punteros', area: 'ay', titulo: 'Dos punteros y ventana deslizante: de O(n²) a O(n)', fuente: 'S3-C1 · diap. 16-20, 23-25', nivel: 10,
    conceptos: ['ay_dos', 'ay_ven'], lab: [{ tab: 'arreglos', e: 'dos', texto: 'Ver dos punteros' }, { tab: 'arreglos', e: 'ven', texto: 'Ver ventana deslizante' }], alias: 'two pointers sliding window subcadena sin repetir',
    definicion: R`
Dos técnicas que bajan de §O(n²)§ a **§O(n)§** manteniendo un **estado** mientras se recorre el arreglo una sola vez:

- **Dos punteros**: en un arreglo **ordenado** se hallan índices §i < j§ con §aᵢ + aⱼ = S§ moviendo §l§ (desde el inicio) y §r§ (desde el final) según la suma.
- **Ventana deslizante**: se mantiene una **ventana §[l, r]§** que **crece por la derecha** mientras no viole una restricción y **se encoge por la izquierda** cuando la viola, registrando la mejor longitud §r − l + 1§.`,
    intuicion: R`
**Dos punteros.** Como el arreglo está ordenado, el extremo izquierdo es el **menor** y el derecho el **mayor**. Si la suma queda **corta**, el único modo de aumentarla es avanzar §l§ (el menor sube); si **se pasa**, retrocede §r§ (el mayor baja). Cada movimiento **descarta para siempre** un elemento, así que los punteros se encuentran en a lo sumo §n§ pasos.

**Ventana deslizante.** Es una **ventana de tren**: avanzas el borde derecho para ver más paisaje; si aparece algo que no puede estar (un carácter repetido), levantas el borde izquierdo hasta que desaparezca. Cada carácter **entra una vez y sale a lo sumo una vez**.

Esto es distinto de la **ventana de contexto de tamaño fijo §k§** de un tokenizador (que genera fragmentos solapados): aquella tiene **tamaño constante**; la ventana de esta técnica **cambia de tamaño**.`,
    formal: R`
**Dos punteros** (par que suma §S§ en §A§ ordenado):

~~~
l, r = 0, n − 1
mientras l < r:
    suma = A[l] + A[r]
    si suma == S: devolver (l, r)
    si suma < S:  l += 1            # necesito una suma mayor
    sino:         r −= 1            # necesito una suma menor
devolver None
~~~

**Corrección:** si §A[l] + A[r] < S§, para §A[l]§ ningún elemento a su izquierda-de-§r§ lo completa (todos son ≤ §A[r]§), así que §l§ se puede descartar. Simétrico con §r§. **Precondición crucial:** el arreglo debe estar **ordenado**; si no lo está, ordenarlo cuesta §O(n log n)§ y sigue siendo mejor que §O(n²)§.

**Ventana deslizante** (subcadena más larga sin repetir): un §set§ con los caracteres de la ventana; para cada §r§: **mientras §s[r]§ esté en la ventana**, sacar §s[l]§ y avanzar §l§; luego agregar §s[r]§ y actualizar §mejor = máx(mejor, r − l + 1)§.

**Por qué es §O(n)§ y no §O(n²)§** aunque haya un §while§ anidado en el §for§: cada carácter se **agrega una vez** y se **elimina una vez**: **2n operaciones** en total (conteo **amortizado**).`,
    procedimiento: R`
**Dos punteros — a mano** con §A = [1, 3, 4, 6, 8, 11, 15]§ y §S = 14§:

1. §l = 0§ (1), §r = 6§ (15): suma 16 > 14 → §r = 5§.
2. §l = 0§ (1), §r = 5§ (11): suma 12 < 14 → §l = 1§.
3. §l = 1§ (3), §r = 5§ (11): suma **14** = 14 → **(1, 5)**.

**Ventana — a mano** con §"cutebear"§:

1. Ventana vacía; entran §c§, §u§, §t§, §e§, §b§ (longitud 5: «cuteb»).
2. Llega §e§, que ya está: se encoge sacando §c§, §u§, §t§, §e§ hasta que §e§ no esté (ventana «b»), y entra la nueva §e§ → «be».
3. Siguen §a§, §r§: «bear» (4). **La mejor longitud fue 5** («cuteb»).

[ojo]La diapositiva 19 anota el resultado como §5§ (§"uteba"§), pero **«uteba» no es una subcadena de «cutebear»** (tomada con letras contiguas tendría dos veces la §e§). La respuesta numérica **5** es correcta; la ventana que la produce es **«cuteb»** (índices 0 a 4).[/ojo]`,
    codigo: [{
      titulo: 'Dos punteros (diapositiva 17) y ventana deslizante (diapositiva 19)',
      src: R`
def par_que_suma(A, S):
    l, r = 0, len(A) - 1
    while l < r:
        suma = A[l] + A[r]
        if suma == S:
            return (l, r)
        elif suma < S:
            l += 1                      # necesito una suma mayor
        else:
            r -= 1                      # necesito una suma menor
    return None                         # no existe tal par

print(par_que_suma([1, 3, 4, 6, 8, 11, 15], 14))
print(par_que_suma([1, 3, 4, 6, 8, 11, 15], 100))

def subcadena_sin_repetir(s):
    vistos = set()                      # caracteres dentro de la ventana actual
    l = mejor = 0
    for r in range(len(s)):
        while s[r] in vistos:           # restriccion violada: encoger por la izquierda
            vistos.remove(s[l])
            l += 1
        vistos.add(s[r])                # extender por la derecha
        mejor = max(mejor, r - l + 1)
    return mejor

print(subcadena_sin_repetir("cutebear"))
print(subcadena_sin_repetir("abcabcbb"), subcadena_sin_repetir("aaaa"), subcadena_sin_repetir(""))

# ventana de tamano FIJO k (contexto de un tokenizador): fragmentos solapados
def fragmentos(tokens, k):
    return [tokens[i:i + k] for i in range(len(tokens) - k + 1)]

print(fragmentos([1, 2, 3, 4, 5], 3))
`,
      esperado: '(1, 5)\nNone\n5\n3 1 0\n[[1, 2, 3], [2, 3, 4], [3, 4, 5]]'
    }],
    ejemplo: R`
**¿Qué técnica usar?** (actividad de la clase, GPU con §n = 3600§ muestras de temperatura):

| Pregunta | Técnica | Ingenuo | Con la técnica |
|---|---|---|---|
| Temperatura media entre el segundo §i§ y el §j§ | suma de **prefijos** | §O(n)§ por consulta | §O(1)§ por consulta |
| Intervalo continuo con mayor aumento neto | **Kadane** (sobre las diferencias) | §O(n²)§ | §O(n)§ |
| Ventana más larga sin superar un umbral | **ventana deslizante** | §O(n²)§ | §O(n)§ |
| Par de muestras que suma un valor (ordenadas) | **dos punteros** | §O(n²)§ | §O(n)§ |

**Un tokenizador** con un modelo que admite §k§ tokens desliza una ventana de **tamaño fijo** §k§ para generar fragmentos solapados; la ventana deslizante de esta técnica es de tamaño **variable**.`,
    complejidad: R`
- **Dos punteros:** §O(n)§ tiempo (cada puntero recorre el arreglo a lo sumo una vez), §O(1)§ espacio. Si hay que **ordenar antes**: §O(n log n)§ (aún mejor que §O(n²)§).
- **Ventana deslizante:** §O(n)§ amortizado (2n operaciones), §O(min(n, |alfabeto|))§ de espacio para el §set§.
- **Ingenuo** (probar todos los pares/subcadenas): §O(n²)§ o peor.
- El §while§ interno **no** vuelve cuadrática la ventana: los dos punteros solo avanzan.`,
    errores: R`
- **Aplicar dos punteros a un arreglo no ordenado**: la técnica exige orden.
- **Creer que la ventana deslizante es §O(n²)§ por el §while§ interno**: es §O(n)§ amortizado.
- **No actualizar el estado al encoger la ventana** (olvidar quitar §s[l]§ del conjunto).
- **Mover el puntero equivocado** en dos punteros (si la suma es corta, hay que **avanzar §l§**, no retroceder §r§).
- **Confundir la ventana de tamaño variable con la de tamaño fijo** del tokenizador.`,
    preguntas: [
      ['¿Qué precondición necesita la técnica de dos punteros y por qué?', 'Que el arreglo esté ordenado: solo así, si la suma es corta, avanzar l la aumenta, y si se pasa, retroceder r la disminuye, descartando elementos para siempre. Ordenar cuesta O(n log n), todavía mejor que O(n²).'],
      ['¿Por qué la ventana deslizante recorre cada carácter a lo sumo dos veces?', 'Porque cada carácter entra a la ventana una vez (extensión por la derecha) y sale a lo sumo una vez (encogimiento por la izquierda): 2n operaciones, O(n) amortizado.'],
      ['Con §A = [1, 3, 4, 6, 8, 11, 15]§ y §S = 14§, ¿qué devuelve §par_que_suma§ y en cuántos pasos?', '(1, 5), porque 3 + 11 = 14; en tres pasos: 1 + 15 = 16 > 14 (r baja), 1 + 11 = 12 < 14 (l sube) y 3 + 11 = 14.'],
      ['¿En qué se parece y en qué se diferencia la ventana de contexto de un tokenizador de la ventana deslizante variable?', 'Ambas recorren la secuencia con una ventana; la de contexto tiene tamaño fijo k y genera fragmentos solapados, mientras que la variable cambia de tamaño según una restricción (crece por la derecha y se encoge por la izquierda).']
    ],
    resumen: R`
- **Dos punteros** (arreglo **ordenado**): suma corta ⇒ §l += 1§; suma larga ⇒ §r −= 1§ ⇒ **§O(n)§**.
- **Ventana §[l, r]§**: crece a la derecha, **se encoge a la izquierda** al violar la restricción ⇒ **§O(n)§ amortizado**.
- Cada elemento entra y sale **una vez**: el §while§ interno no cuesta §O(n²)§.
- Ventana fija §k§ (tokenizador) ≠ ventana variable.`
  });

  B.tema({
    id: 'ay-intervalos', area: 'ay', titulo: 'Merge intervals y cómo elegir la técnica sobre arreglos', fuente: 'S3-C1 · diap. 21-24, 27-28', nivel: 10,
    conceptos: ['ay_int'], lab: [{ tab: 'arreglos', e: 'mer', texto: 'Ver merge intervals' }], alias: 'merge intervals fusionar intervalos ordenar barrer',
    definicion: R`
**Merge intervals:** dado un conjunto de intervalos posiblemente **solapados**, producir el conjunto **mínimo** de intervalos **no solapados** que cubre lo mismo. Estrategia (**O(n log n)** por el ordenamiento):

1. **Ordenar** los intervalos por su **extremo izquierdo**.
2. **Recorrer**: si el intervalo actual **se solapa** con el último agregado, **extender** ese último; si no, **agregar uno nuevo**.

Es el patrón **ordenar y barrer**.`,
    intuicion: R`
Piensa en **reservas de un salón**: ordenas todas por hora de inicio y las vas «pegando». Si la siguiente empieza **antes de que termine la anterior**, son una sola reserva más larga; si empieza **después**, hay un hueco y arranca una nueva.

El **ordenamiento** es lo que permite el barrido de una sola pasada: una vez ordenados, un intervalo solo puede solaparse con **el último** de la salida (los anteriores ya terminaron antes).

Esta semana hay un **hilo común**: todas las técnicas evitan **recomputar**; mantienen un **estado** (prefijo, mejor acumulado, ventana, último intervalo) que se actualiza en **una sola pasada**. Reconocer **cuándo aplicarlas** es la habilidad central.`,
    formal: R`
**Algoritmo:**

~~~
intervalos.ordenar por extremo izquierdo
salida = [intervalos[0]]
para cada (a, b) en intervalos[1:]:
    (ult_a, ult_b) = salida[-1]
    si a <= ult_b:  salida[-1] = (ult_a, máx(ult_b, b))    # se solapan: extender
    sino:           salida.agregar((a, b))                  # sin solape: nuevo
~~~

**Por qué §máx(ult_b, b)§:** el nuevo intervalo puede estar **contenido** en el último (§b < ult_b§), caso en que el extremo derecho no cambia.

**Resumen de técnicas** (diap. 23):

| Técnica | Para qué sirve | Ingenuo | Con la técnica |
|---|---|---|---|
| **Suma de prefijos** | consultas de suma de rango | §O(n)§ / consulta | **§O(1)§** / consulta |
| **Kadane** | máximo subarreglo contiguo | §O(n²)§ | **§O(n)§** |
| **Dos punteros** | par que cumple una condición (ordenado) | §O(n²)§ | **§O(n)§** |
| **Ventana deslizante** | mejor subsegmento con restricción | §O(n²)§ | **§O(n)§** |
| **Merge intervals** | consolidar intervalos | §O(n²)§ | **§O(n log n)§** |`,
    procedimiento: R`
**Fusionar a mano** §[(1, 3), (2, 6), (8, 10), (15, 18)]§:

1. Ya están ordenados por el extremo izquierdo.
2. §salida = [(1, 3)]§.
3. §(2, 6)§: §2 ≤ 3§ → se solapan → §(1, máx(3, 6)) = (1, 6)§.
4. §(8, 10)§: §8 ≤ 6§? No → nuevo: §[(1, 6), (8, 10)]§.
5. §(15, 18)§: §15 ≤ 10§? No → nuevo. **Resultado §[(1, 6), (8, 10), (15, 18)]§.**

**Para elegir la técnica, busca la señal de alarma:** «muchas consultas de suma de rango» → prefijos; «máximo subarreglo / mejor racha» → Kadane; «par o tripleta que cumple una condición» en datos **ordenados** → dos punteros; «mejor subsegmento con una restricción que se puede mantener» → ventana; «intervalos que se solapan» → ordenar y barrer.`,
    codigo: [{
      titulo: 'fusionar_intervalos (diapositiva 22) y un caso con intervalos contenidos',
      src: R`
def fusionar_intervalos(intervalos):
    intervalos.sort(key=lambda par: par[0])     # O(n log n): por extremo izquierdo
    salida = [intervalos[0]]
    for a, b in intervalos[1:]:
        ultimo_a, ultimo_b = salida[-1]
        if a <= ultimo_b:                       # se solapan: extender
            salida[-1] = (ultimo_a, max(ultimo_b, b))
        else:                                   # sin solape: nuevo intervalo
            salida.append((a, b))
    return salida

print(fusionar_intervalos([(1, 3), (2, 6), (8, 10), (15, 18)]))
print(fusionar_intervalos([(8, 10), (1, 3), (15, 18), (2, 6)]))     # desordenados
print(fusionar_intervalos([(1, 10), (2, 3), (4, 5)]))               # contenidos
print(fusionar_intervalos([(1, 4), (4, 5)]))                        # se tocan
`,
      esperado: '[(1, 6), (8, 10), (15, 18)]\n[(1, 6), (8, 10), (15, 18)]\n[(1, 10)]\n[(1, 5)]'
    }],
    ejemplo: R`
**Reservas de calendario.** Reservas §(9, 11)§, §(10, 12)§, §(14, 15)§, §(11, 13)§: ordenadas → §(9, 11), (10, 12), (11, 13), (14, 15)§; se fusionan las tres primeras en §(9, 13)§ y queda §(14, 15)§ aparte: **[(9, 13), (14, 15)]**.

**Otros usos:** unir **rangos de memoria**, consolidar **segmentos detectados en una señal** (por ejemplo, tramos de audio con voz detectados por ventanas).

**Caso límite:** intervalos que **solo se tocan** (§(1, 4)§ y §(4, 5)§) se fusionan porque §4 ≤ 4§: §[(1, 5)]§. Si el enunciado dijera que los extremos **no cuentan** como solape, la condición sería §a < ultimo_b§.`,
    complejidad: R`
- **Ordenar:** §O(n log n)§ — domina el costo total.
- **Barrer:** §O(n)§ (una pasada, cada intervalo se compara con el último de la salida).
- **Total:** **§O(n log n)§** tiempo y §O(n)§ espacio de salida.
- **Ingenuo** (comparar cada par para fusionar repetidamente): §O(n²)§.
- Si los intervalos **ya vienen ordenados**, el barrido solo cuesta §O(n)§.`,
    errores: R`
- **Olvidar ordenar primero:** sin orden, un intervalo puede solaparse con uno que no es el último.
- **Asignar §b§ en vez de §máx(ultimo_b, b)§** al extender: se encogería el intervalo cuando el nuevo está contenido.
- **Condición de solape equivocada** (§a < ultimo_b§ vs §a <= ultimo_b§): decide si los que «se tocan» se fusionan.
- **Modificar la lista de entrada** sin querer (§sort§ la modifica en el sitio): copiar si hace falta.
- **Aplicar una técnica por costumbre:** primero identifica la señal de alarma (consultas de rango, racha, par ordenado, subsegmento, intervalos).`,
    preguntas: [
      ['Explica el algoritmo de merge intervals y su complejidad.', 'Se ordenan los intervalos por extremo izquierdo (O(n log n)) y se recorren una vez: si el actual se solapa con el último de la salida (a <= ultimo_b), se extiende con máx(ultimo_b, b); si no, se agrega como nuevo. Total O(n log n).'],
      ['Fusiona §[(1, 3), (2, 6), (8, 10), (15, 18)]§.', '[(1, 6), (8, 10), (15, 18)].'],
      ['¿Por qué se usa §máx(ultimo_b, b)§ al extender?', 'Porque el intervalo actual puede estar contenido en el último de la salida (b < ultimo_b); en ese caso el extremo derecho no debe encogerse.'],
      ['Completa la tabla: prefijos, Kadane, dos punteros, ventana y merge intervals (qué resuelven y ambas complejidades).', 'Prefijos: consultas de rango, O(n)→O(1) por consulta. Kadane: máximo subarreglo, O(n²)→O(n). Dos punteros: par en arreglo ordenado, O(n²)→O(n). Ventana deslizante: mejor subsegmento con restricción, O(n²)→O(n). Merge intervals: consolidar intervalos, O(n²)→O(n log n).']
    ],
    resumen: R`
- **Merge intervals:** **ordenar** por extremo izquierdo y **barrer**: si §a <= ultimo_b§ → extender con §máx§; si no → nuevo. **§O(n log n)§**.
- Técnicas: **prefijos** (consultas §O(1)§), **Kadane** (§O(n)§), **dos punteros** y **ventana** (§O(n)§), **intervalos** (§O(n log n)§).
- Hilo común: **no recomputar**; un estado que se actualiza en **una sola pasada**.
- Elige la técnica por la **señal de alarma** del enunciado.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
