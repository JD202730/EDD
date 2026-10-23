/* teoria_cx1.js — Biblioteca: área Complejidad (1/2). Fuentes: S2-C1 (Análisis asintótico y rendimiento) y S2-C2 (Notación O, Ω y Θ) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'cx-medir', area: 'cx', titulo: 'Por qué no medir en segundos: el modelo de costo', fuente: 'S2-C1 · diap. 4-7, 25', nivel: 2,
    conceptos: ['cx_medir'], interactivo: [],
    definicion: R`
El **análisis asintótico** estudia cuántas **operaciones elementales** ejecuta un algoritmo en función del **tamaño de la entrada §n§** y **cómo crece** ese número cuando §n§ crece (su **crecimiento asintótico**). Se usa en lugar de medir segundos porque el conteo es **independiente de la máquina y del lenguaje**.

El modelo de costo de la clase es el **modelo RAM**: cada operación elemental cuesta **una unidad de tiempo**, sin importar los valores con que se opera.`,
    intuicion: R`
Cronometras un algoritmo: tarda 2 s con 1000 datos. Un compañero lo ejecuta en su equipo y tarda 0,5 s con los mismos datos. ¿Cuál algoritmo es mejor? **No se puede decir**: puede ser el mismo código en máquinas distintas. Falta saber qué hace cada uno, con qué entrada y en qué equipo.

Ahora dos algoritmos que resuelven lo mismo, sumar §1…n§: un ciclo que suma uno a uno, y la fórmula §n(n+1)/2§. Con §n = 10⁹§ el ciclo tarda unos 42 s y la fórmula 0,0000002 s. **La fórmula no corre en una máquina mejor: crece distinto.** Esa diferencia de «forma de crecer» es la que queremos capturar, y para eso hay que **contar operaciones**, no segundos.`,
    formal: R`
**Qué hace inservible una medición en segundos** (depende de factores ajenos al algoritmo):

- la velocidad del procesador y de la memoria,
- el lenguaje, el compilador y el intérprete,
- la carga del sistema en ese momento,
- el estado de la caché.

**Lo que sí pertenece al algoritmo**: cuántas operaciones ejecuta y cómo crece ese número al crecer la entrada.

**Supuestos del modelo RAM** (cada uno cuesta 1 unidad):

- operaciones aritméticas y comparaciones (§+§, §*§, §<§, §==§),
- asignación a una variable simple,
- acceso indexado a memoria contigua §v[i]§,
- retorno de una función, llamada y salto.

**Cuidado: en Python no todo lo que parece elemental lo es.**

| Operación | Costo real |
|---|---|
| §x in lista§ | recorre la lista: **n**, no 1 |
| §lista.insert(0, x)§ | desplaza todo: **n**, no 1 |
| §s1 + s2§ (cadenas) | copia ambas: suma de sus longitudes |

**Definir §n§ es parte del análisis**: número de elementos, de bits, de nodos…`,
    procedimiento: R`
1. **Define §n§** (¿elementos de la lista? ¿bits? ¿nodos?).
2. **Marca las operaciones elementales** del código (aritmética, comparación, asignación, acceso, retorno).
3. **Cuenta cuántas veces se ejecuta cada línea** en función de §n§.
4. **Revisa los costos ocultos**: ¿alguna línea llama a una función o a un operador de Python que recorre datos (§in§, §insert§, §+§ de cadenas, §sort§…)?
5. **Suma** para obtener §T(n)§.
6. **Describe el crecimiento**: constante, lineal, cuadrático… (se formaliza en [[cx-dominante]] y [[cx-formal]]).`,
    codigo: {
      titulo: 'Contar operaciones en vez de segundos (la misma suma de dos formas)',
      src: R`
def suma_iterativa(n):
    ops = 0
    total = 0
    for i in range(1, n + 1):
        total += i
        ops += 1                    # una suma por vuelta
    return total, ops

def suma_formula(n):
    return n * (n + 1) // 2, 1      # un número fijo de operaciones, sin importar n

for n in [10, 1000, 100000]:
    a, ops_a = suma_iterativa(n)
    b, ops_b = suma_formula(n)
    print("n =", n, "| mismo resultado:", a == b, "| sumas del ciclo:", ops_a, "| fórmula:", ops_b)
`,
      esperado: 'n = 10 | mismo resultado: True | sumas del ciclo: 10 | fórmula: 1\nn = 1000 | mismo resultado: True | sumas del ciclo: 1000 | fórmula: 1\nn = 100000 | mismo resultado: True | sumas del ciclo: 100000 | fórmula: 1',
      nota: 'Con el contador de operaciones el resultado **no cambia entre computadores**: es una propiedad del algoritmo. Un cronómetro (§time.perf_counter§) sí cambia.'
    },
    ejemplo: R`
**Tabla de la clase** (tiempos medidos para sumar §1…n§):

| n | §suma_iterativa§ | §suma_formula§ |
|---|---|---|
| 10³ | 0,00004 s | 0,0000002 s |
| 10⁶ | 0,042 s | 0,0000002 s |
| 10⁹ | ≈ 42 s | 0,0000002 s |

**Lectura.** Cada vez que §n§ se multiplica por 1000, el tiempo del ciclo también se multiplica por ≈ 1000: **crece proporcionalmente a §n§** (lineal). La fórmula se queda en 0,0000002 s: **no crece** (constante).

**La pregunta inicial.** «2 s frente a 0,5 s» no permite decidir: faltan la entrada (¿el mismo §n§?), el código de cada uno y las condiciones de medición. Con conteo de operaciones sí: si el mismo código hace, digamos, 4·10⁶ operaciones, son iguales sin importar el segundero.`,
    complejidad: R`
- **§suma_iterativa§**: el ciclo ejecuta §n§ vueltas con un número fijo de operaciones cada una ⇒ §T(n)§ proporcional a §n§: **lineal**, §Θ(n)§.
- **§suma_formula§**: una multiplicación, una suma y una división, sin ciclos ⇒ §T(n)§ constante, **§Θ(1)§**.
- Justificación: el conteo de operaciones **no depende** de la velocidad del procesador, del lenguaje ni de la carga: solo del algoritmo y de §n§. Por eso dos programas se comparan por su **función de costo** y no por sus cronometrajes.
- Matiz: el modelo RAM supone que las operaciones cuestan lo mismo aunque los números sean enormes; para valores gigantes (enteros de miles de dígitos) esa suposición deja de ser razonable, pero en este curso se acepta.`,
    errores: R`
- **Comparar algoritmos por segundos medidos en máquinas distintas.**
- **Suponer que §x in lista§ cuesta 1**: cuesta §n§. Con un §set§ sí cuesta ≈ 1.
- **Contar solo los ciclos visibles** e ignorar el costo de las funciones que se llaman dentro.
- **Reportar el mejor caso** como si fuera la complejidad del algoritmo (ver [[cx-casos]]).
- **Olvidar declarar qué es §n§**: sin definir el tamaño de entrada, el análisis no significa nada.
- **Creer que un procesador más rápido compensa un crecimiento peor**: la tabla de crecimiento de [[cx-dominante]] muestra que no.`,
    preguntas: [
      ['¿Por qué no basta con cronometrar un algoritmo?', 'Porque el tiempo en segundos mezcla el algoritmo con la máquina: velocidad del procesador y la memoria, lenguaje, compilador, carga del sistema y estado de la caché. El conteo de operaciones en función de §n§ es propio del algoritmo e independiente de la máquina.'],
      ['Un algoritmo tarda 2 s con 1000 datos y otro (el mismo) 0,5 s en otro equipo. ¿Cuál es mejor? ¿Qué falta saber?', 'No se puede responder: falta saber si es el mismo código y la misma entrada y en qué máquinas se midió. Para comparar algoritmos se cuentan operaciones elementales en función de §n§ y se estudia su crecimiento.'],
      ['¿Qué supone el modelo RAM? Nombra operaciones de Python que **no** son elementales.', 'Que cada operación elemental (aritmética, comparación, asignación simple, acceso §v[i]§, retorno, llamada, salto) cuesta una unidad. No son elementales §x in lista§ (O(n)), §lista.insert(0, x)§ (O(n)) y §s1 + s2§ (copia ambas cadenas).'],
      ['¿Por qué §suma_formula§ es constante y §suma_iterativa§ lineal?', 'La fórmula hace un número fijo de operaciones sin importar §n§; el ciclo hace §n§ vueltas con trabajo fijo cada una, así que su costo crece proporcionalmente a §n§.']
    ],
    resumen: R`
- Medir en segundos **mezcla** el algoritmo con la máquina; contar operaciones lo **aísla**.
- Modelo RAM: operaciones elementales cuestan **1** (aritmética, comparación, asignación, §v[i]§, retorno, llamada).
- En Python cuidado con §in§ sobre listas, §insert(0, x)§ y §+§ de cadenas: **no** son O(1).
- Siempre declara **qué es §n§**.`
  });

  B.tema({
    id: 'cx-conteo', area: 'cx', titulo: 'Conteo de operaciones y función de costo T(n)', fuente: 'S2-C1 · diap. 8-11, 23', nivel: 2,
    conceptos: ['cx_conteo'], interactivo: [],
    definicion: R`
La **función de costo §T(n)§** es el número de operaciones elementales que ejecuta un algoritmo con una entrada de tamaño §n§. Se obtiene **anotando el costo de cada línea y cuántas veces se ejecuta**, y sumando.

Resultados de la clase: sin ciclos, §T(n)§ es **constante**; un ciclo simple da §T(n) = 4n + 2§ (**lineal**); dos ciclos anidados con el interno dependiente del externo dan §n(n−1)/2§ (**cuadrático**).`,
    intuicion: R`
Contar operaciones es como calcular lo que cuesta una receta: precio de cada paso × cuántas veces lo repites. Una línea fuera de los ciclos se paga **una vez**; una línea dentro de un ciclo de §n§ vueltas se paga **§n§ veces**; si ese ciclo está dentro de otro ciclo de §n§ vueltas, se paga **§n × n§**.

En el doble ciclo de duplicados el interno hace menos vueltas cada vez (§n−1§, luego §n−2§, … hasta 1): como en una tabla de «parejas», solo se mira cada par **una vez**, y por eso la suma es §n(n−1)/2§ y no §n²§.`,
    formal: R`
**Reglas de conteo:**

- **Secuencia**: el costo es la suma de los costos.
- **Ciclo**: (número de vueltas) × (costo del cuerpo) + el costo de control (comparación e incremento en cada vuelta).
- **§if§**: costo de la condición + costo de la rama ejecutada (en el peor caso, el de la más cara).
- **Llamada a función**: costo de la llamada + costo de lo que esa función hace.

**Resultados de la clase:**

1. Código sin ciclos (§area_rectangulo§): §a = base * altura§ (multiplicación + asignación = 2), §if a < 0§ (1 comparación), §return a§ (1) ⇒ **§T(n) = 4§**, constante.
2. Ciclo simple (§sumar(v)§): §1 + n·(1 + 3) + 1§ ⇒ **§T(n) = 4n + 2§**.
3. Ciclos anidados (§hay_duplicados§): el interno hace §(n−1) + (n−2) + … + 1§ comparaciones:

~~~
  n−1
   Σ  k = n(n−1)/2 = (n² − n)/2
  k=1
~~~

Si el ciclo interno **no** depende de §i§ (§range(n)§), se ejecuta §n · n = n²§ veces.`,
    procedimiento: R`
1. Escribe el código y **numera las líneas**.
2. A cada línea asígnale su **costo por ejecución** (en el modelo RAM, 1 por operación elemental).
3. Determina **cuántas veces se ejecuta** cada línea (1, §n§, §n²§…). En los ciclos anidados dependientes usa la suma aritmética: §1 + 2 + … + m = m(m+1)/2§.
4. Multiplica costo × veces y **suma**.
5. **Simplifica**: si hace falta, conserva el término dominante (ver [[cx-dominante]]).
6. Anota **qué es §n§** y **qué caso** analizas (peor, por convenio).`,
    codigo: {
      titulo: 'Contar con un contador explícito (S2-C1, d.9-10)',
      src: R`
def sumar(v):
    ops = 1                      # total = 0
    total = 0
    for i in range(len(v)):
        ops += 4                 # 1 de control del ciclo + 3 (acceso v[i], suma, asignación)
        total += v[i]
    ops += 1                     # return
    return total, ops

def hay_duplicados(v):
    comparaciones = 0
    n = len(v)
    for i in range(n):
        for j in range(i + 1, n):        # (n-1) + (n-2) + ... + 1 vueltas en total
            comparaciones += 1
            if v[i] == v[j]:
                return True, comparaciones
    return False, comparaciones

for n in [10, 100]:
    print("sumar, n =", n, "-> T(n) =", sumar(list(range(n)))[1], "= 4n + 2 =", 4 * n + 2)
for n in [10, 100, 1000]:
    print("duplicados, n =", n, "-> comparaciones:", hay_duplicados(list(range(n)))[1], "= n(n-1)/2 =", n * (n - 1) // 2)
`,
      esperado: 'sumar, n = 10 -> T(n) = 42 = 4n + 2 = 42\nsumar, n = 100 -> T(n) = 402 = 4n + 2 = 402\nduplicados, n = 10 -> comparaciones: 45 = n(n-1)/2 = 45\nduplicados, n = 100 -> comparaciones: 4950 = n(n-1)/2 = 4950\nduplicados, n = 1000 -> comparaciones: 499500 = n(n-1)/2 = 499500'
    },
    ejemplo: R`
**Pregunta de análisis de la clase.** Para

~~~
def f(v):
    c = 0
    for i in range(len(v)):
        for j in range(len(v)):
            c += v[i] * v[j]
    return c
~~~

la línea §c += v[i] * v[j]§ se ejecuta **§n · n = n²§ veces** (el interno no depende de §i§): §T(n)§ es del orden de §n²§.
En §hay_duplicados§ el interno empezaba en §i+1§ y la línea se ejecuta **§n(n−1)/2§** veces; la diferencia es un factor ≈ 2, y ambos son cuadráticos.

| n | doble ciclo completo (§n²§) | interno desde §i+1§ (§n(n−1)/2§) | interno §range(i)§ |
|---|---|---|---|
| 5 | 25 | 10 | 10 |
| 10 | 100 | 45 | 45 |
| 100 | 10 000 | 4 950 | 4 950 |

**Con §n = 10⁵§** el doble ciclo de duplicados hace §≈ 5 × 10⁹§ comparaciones: minutos u horas de ejecución.

**Código sin ciclos.** En §area_rectangulo§ el costo es **4** aunque se duplique la entrada: es el comportamiento más deseable que puede tener un algoritmo.`,
    complejidad: R`
- §sumar§: §T(n) = 4n + 2§ ⇒ **lineal** (§Θ(n)§). Si §n§ se duplica, §T(n)§ se duplica (aprox.).
- §hay_duplicados§: §T(n) ≈ n(n−1)/2§ ⇒ **cuadrático** (§Θ(n²)§). Si §n§ se duplica, el costo se multiplica por ≈ 4.
- **Por qué §1 + 2 + … + (n−1) = n(n−1)/2§**: sumas el primer y el último término (§1 + (n−1) = n§), el segundo y el penúltimo (§2 + (n−2) = n§)… hay §(n−1)/2§ parejas que valen §n§ cada una.
- Este conteo es el **peor caso** de §hay_duplicados§ (no hay duplicados y recorre todos los pares). En el mejor caso (§v[0] == v[1]§) basta **1** comparación.`,
    errores: R`
- **Contar solo los ciclos visibles** y olvidar el costo de lo que se llama dentro del ciclo (§x in lista§, §insert§…).
- **Poner §n²§ en el doble ciclo dependiente**: si el interno es §range(i)§ o §range(i+1, n)§, son §n(n−1)/2§ (aunque ambos sean §O(n²)§).
- **Olvidar el costo de control** del ciclo (comparación e incremento) cuando se pide el §T(n)§ exacto: por eso §4n + 2§ y no §3n + 2§.
- **Confundir «veces que se ejecuta la línea» con «costo de la línea»**: son dos factores que se multiplican.
- **Mezclar casos**: contar el mejor caso (sale temprano con §return True§) y llamarlo «la complejidad».`,
    preguntas: [
      ['Escribe §T(n)§ para un ciclo que recorre §n§ elementos con 3 operaciones por iteración.', 'Con el costo de control del ciclo (1 por vuelta) y las 3 operaciones del cuerpo: §T(n) = 1 + n·(1 + 3) + 1 = 4n + 2§ (más constantes de inicio/retorno). Es lineal: §Θ(n)§.'],
      ['¿Cuántas veces se ejecuta §c += v[i] * v[j]§ en un doble ciclo §range(n)§ × §range(n)§? ¿Y si el interno es §range(i)§?', 'En el primero §n · n = n²§ veces; en el segundo §0 + 1 + … + (n−1) = n(n−1)/2§. Ambos son cuadráticos; difieren en un factor 2.'],
      ['Demuestra que §(n−1) + (n−2) + … + 1 = n(n−1)/2§.', 'Se agrupan términos extremos: §(n−1) + 1 = n§, §(n−2) + 2 = n§, …; hay §(n−1)/2§ parejas de valor §n§, luego la suma es §n(n−1)/2§.'],
      ['¿Qué pasa con el costo de §area_rectangulo§ si se duplica la entrada?', 'Nada: §T(n) = 4§ constante, no depende de §n§.']
    ],
    resumen: R`
- §T(n)§ = suma de (costo de la línea) × (veces que se ejecuta).
- Sin ciclos: constante. Ciclo simple: §4n + 2§ (lineal). Doble ciclo dependiente: **§n(n−1)/2§**. Doble ciclo independiente: §n²§.
- Suma aritmética: §1 + 2 + … + m = m(m+1)/2§.
- No olvides los **costos ocultos** de las funciones llamadas y declara **n** y **el caso**.`
  });

  B.tema({
    id: 'cx-dominante', area: 'cx', titulo: 'Término dominante y tasas de crecimiento', fuente: 'S2-C1 · diap. 12-13; S2-C2 · diap. 15-16', nivel: 2, comp: true,
    conceptos: ['cx_dominante', 'cx_tasas'], interactivo: [],
    definicion: R`
Al crecer §n§, **solo importa el término dominante** de §T(n)§: las constantes y los términos de menor grado se vuelven irrelevantes. Por eso §T(n) = n²/2 − n/2§ se dice **cuadrático** y se escribe §T(n) ∼ n²§.

Las **tasas de crecimiento** (1, log n, n, n log n, n², 2ⁿ) separan lo viable de lo inviable **más que cualquier mejora de hardware**.`,
    intuicion: R`
Si pagas §$500.000.000§ por una casa más §$500§ de papelería, nadie discute los §$500§. Con §T(n) = n²/2 − n/2§ pasa igual: con §n = 1000§ el término §n/2§ vale 500 frente a 500 000 del término cuadrático; con §n = 10⁶§ es el 0,0001 %. **Para §n§ grande, lo que decide es la potencia más alta.**

Y esa potencia decide más que el computador: con §n = 10⁶§, un algoritmo cuadrático necesita §10¹²§ operaciones y uno §n log n§ solo §2 × 10⁷§; ningún procesador más rápido cierra una brecha de **cinco órdenes de magnitud**.`,
    formal: R`
**Peso del término §n/2§** en §T(n) = n²/2 − n/2§ (tabla de la clase):

| n | n²/2 | n/2 | Peso del término n/2 |
|---|---|---|---|
| 10 | 50 | 5 | 9,1 % |
| 100 | 5 000 | 50 | 1,0 % |
| 1 000 | 500 000 | 500 | 0,1 % |
| 1 000 000 | 5 × 10¹¹ | 5 × 10⁵ | 0,0001 % |

**Jerarquía de complejidades** (de menor a mayor crecimiento):

~~~
1  <  log n  <  n  <  n log n  <  n²  <  2ⁿ
~~~

**Crecimiento** (tabla de la clase):

| Crecimiento | n = 10 | n = 100 | n = 10⁴ | n = 10⁶ |
|---|---|---|---|---|
| 1 (constante) | 1 | 1 | 1 | 1 |
| log₂ n | 3 | 7 | 13 | 20 |
| n (lineal) | 10 | 100 | 10⁴ | 10⁶ |
| n log₂ n | 33 | 664 | 1,3 × 10⁵ | 2 × 10⁷ |
| n² (cuadrático) | 100 | 10⁴ | 10⁸ | 10¹² |
| 2ⁿ (exponencial) | 1024 | 10³⁰ | — | — |

**Frontera práctica** (S2-C2): hasta §O(n log n)§ un algoritmo procesa **millones** de datos en segundos; desde §O(n²)§ el límite ronda las **decenas de miles**; desde §O(2ⁿ)§, unas **pocas decenas**. Etiquetas: *escala sin problema* (1, log n, n), *escala con cuidado* (n log n, n²), *no escala* (2ⁿ).

[ojo]
**Cifra de las diapositivas a corregir.** La clase afirma que con §n = 10⁶§ y 10⁹ operaciones por segundo §n²§ tarda «≈ 11 días». La cuenta es **§10¹² ÷ 10⁹ = 10³§ s ≈ 17 minutos**. Once días son ≈ §10¹⁵§ operaciones (§n ≈ 3 × 10⁷§). La conclusión no cambia (§n log n§ tarda 0,02 s y §n²§ es miles de veces peor), pero conviene **usar la cuenta correcta** en un examen.
[/ojo]`,
    procedimiento: R`
Para obtener el **orden de crecimiento** de §T(n)§:

1. Escribe §T(n)§ como suma de términos (§3n² + 10n + 7§).
2. **Descarta los términos de menor orden** (§10n§ y §7§).
3. **Descarta el coeficiente constante** del término que queda (§3n² → n²§).
4. Ubica el resultado en la jerarquía (§1 < log n < n < n log n < n² < 2ⁿ§).
5. Para estimar tiempos: **operaciones ÷ operaciones por segundo** (la clase usa 10⁹ op/s).
6. Para comparar dos algoritmos, mira **qué pasa al multiplicar §n§ por 10** (o por 2).`,
    codigo: [
      {
        titulo: 'El término n/2 pierde peso (tabla de la clase)',
        src: R`
for n in [10, 100, 1000, 1000000]:
    cuadratico = n * n / 2
    lineal = n / 2
    print(n, round(100 * lineal / (cuadratico + lineal), 4), "%")
`,
        esperado: '10 9.0909 %\n100 0.9901 %\n1000 0.0999 %\n1000000 0.0001 %'
      },
      {
        titulo: 'Tiempo estimado con 10^9 operaciones por segundo (n = 10^6)',
        src: R`
import math

OPS_POR_SEGUNDO = 10 ** 9
n = 10 ** 6
for nombre, ops in [("n", n), ("n log2 n", n * math.log2(n)), ("n^2", n * n)]:
    print(nombre, "->", round(ops / OPS_POR_SEGUNDO, 4), "segundos")
`,
        esperado: 'n -> 0.001 segundos\nn log2 n -> 0.0199 segundos\nn^2 -> 1000.0 segundos',
        nota: '1000 s son ≈ 17 minutos, no 11 días (ver el recuadro «Ojo»).'
      }
    ],
    ejemplo: R`
**Ejemplo 1.** §T(n) = 3n² + 10n + 7§. Para §n = 100§: §3n² = 30 000§, §10n = 1 000§, §7§; el término dominante aporta el 96,8 %. La clase de crecimiento es §n²§.

**Ejemplo 2 (comparar).** ¿Cuánto tarda cada algoritmo con §n = 10⁵§ a 10⁹ op/s?

- §n²§: §10¹⁰§ operaciones ⇒ **10 s**.
- §n log₂ n§: §10⁵ × 16,6 ≈ 1,7 × 10⁶§ ⇒ **≈ 0,0017 s**.
- §2ⁿ§: ni siquiera con §n = 100§ (§10³⁰§ operaciones).

**Ejemplo 3 (hardware).** Si compras un computador **10 veces** más rápido, un algoritmo §n²§ puede resolver entradas §√10 ≈ 3,2§ veces más grandes en el mismo tiempo; uno §n log n§ casi 10 veces más grandes; uno §2ⁿ§ solo **3 elementos más** (§2ⁿ × 10 ≈ 2ⁿ⁺³,³§).`,
    complejidad: R`
- **Justificar «el término dominante manda»**: el cociente §(términos menores)/(término mayor)§ tiende a 0 cuando §n§ crece; en el ejemplo es §1/(n+1)§ (9,1 %, 1,0 %, 0,1 %, 0,0001 %).
- **Justificar una clase de crecimiento**: se da el término dominante y se formaliza con §O§, §Ω§, §Θ§ ([[cx-formal]]).
- Ordenar por crecimiento: §log n§ crece más despacio que cualquier potencia de §n§; §n log n§ está entre §n§ y §n²§; cualquier potencia de §n§ crece más despacio que §2ⁿ§.
- Tiempo estimado = (operaciones) ÷ (operaciones por segundo); con 10⁹ op/s: §n = 10⁶§ → 0,001 s (§n§), 0,02 s (§n log n§) y 1000 s (§n²§).`,
    errores: R`
- **Dejar términos menores y constantes** en la respuesta final: §O(2n² + 3n)§ debe escribirse §O(n²)§.
- **Creer que un procesador más rápido compensa un crecimiento peor.**
- **Confundir §log₂ n§ con §n§** o §n log n§ con §n²§: son clases distintas (tabla de arriba).
- **Aplicar la jerarquía a valores pequeños de §n§**: para §n§ chico las constantes pueden decidir (ver [[cx-constantes]]).
- **Usar la cifra «11 días»** de las diapositivas sin comprobarla: el cálculo correcto es ≈ 17 minutos.`,
    preguntas: [
      ['¿Por qué §n²/2 − n/2§ se considera cuadrático? Justifica con números.', 'Porque al crecer §n§ el término §n/2§ pierde peso: 9,1 % con §n = 10§, 1 % con §n = 100§, 0,1 % con §n = 1000§ y 0,0001 % con §n = 10⁶§. Solo importa el término dominante §n²/2§ y la constante §1/2§ no cambia el orden: es §Θ(n²)§.'],
      ['Ordena de menor a mayor: §n log n§, §2ⁿ§, §n²§, §log n§, §n§, §1§.', '§1 < log n < n < n log n < n² < 2ⁿ§.'],
      ['Con 10⁹ operaciones por segundo y §n = 10⁶§, ¿cuánto tardan un algoritmo §n log n§ y uno §n²§?', '§n log₂ n ≈ 2 × 10⁷§ operaciones ⇒ ≈ **0,02 s**. §n² = 10¹²§ operaciones ⇒ 10³ s ≈ **17 minutos** (la diapositiva dice 11 días, pero esa cifra no corresponde a §10¹²§ operaciones). Ningún hardware cierra esa brecha.'],
      ['¿A partir de qué clase de complejidad un algoritmo deja de escalar a millones de datos?', 'Hasta §O(n log n)§ procesa millones de datos en segundos; desde §O(n²)§ el límite ronda las decenas de miles; desde §O(2ⁿ)§, unas pocas decenas.']
    ],
    resumen: R`
- Solo importa el **término dominante**; se descartan constantes y términos menores.
- Jerarquía: **1 < log n < n < n log n < n² < 2ⁿ**.
- Frontera práctica: hasta §n log n§ millones de datos; §n²§ decenas de miles; §2ⁿ§ decenas.
- Con 10⁹ op/s y §n = 10⁶§: §n§ → 0,001 s; §n log n§ → 0,02 s; **§n²§ → 1000 s (≈ 17 min), no 11 días**.
- El hardware no compensa un mal orden de crecimiento.`
  });

  B.tema({
    id: 'cx-casos', area: 'cx', titulo: 'Mejor, peor y caso promedio', fuente: 'S2-C1 · diap. 14-17', nivel: 2,
    conceptos: ['cx_casos'], interactivo: [],
    definicion: R`
El costo de un algoritmo puede depender de **qué entrada** se le da (no solo de su tamaño). Se distinguen tres casos:

- **Mejor caso**: la entrada que **minimiza** el trabajo.
- **Peor caso**: la entrada que lo **maximiza**.
- **Caso promedio**: el valor **esperado** sobre una distribución de entradas.

**Convenio del curso:** cuando se dice «la complejidad de X» sin aclarar, se refiere al **peor caso**.`,
    intuicion: R`
Buscas tu nombre en una lista no ordenada. Si está de primero, una comparación (suerte). Si está de último —o no está—, las revisas todas. En promedio, a mitad de camino.

Si un sistema de detección de fraude **debe responder en menos de 50 ms siempre**, no sirve un algoritmo «rápido casi siempre»: necesitas la **garantía** del peor caso. Reportar solo el mejor caso es la forma más común de engañar con un análisis.`,
    formal: R`
**Búsqueda secuencial** (cuenta de comparaciones):

| Caso | Situación | Comparaciones |
|---|---|---|
| Mejor | §x§ está en la posición 0 | **1** |
| Peor | §x§ está al final o **no está** | **n** |
| Promedio | §x§ en posición uniforme | **(n + 1)/2** |

**Cuál usar:**

- **Peor caso** (el estándar): da una garantía («nunca será peor»), no exige suponer nada sobre los datos y es lo que importa en sistemas críticos y de tiempo real.
- **Caso promedio**: útil pero frágil; requiere suponer una distribución de entradas, si la suposición falla la estimación se derrumba y es más difícil de calcular.
- **Mejor caso**: casi nunca sirve; un algoritmo que a veces es rápido no da ninguna garantía.

**Mismo código, costos muy distintos (quicksort con pivote §v[0]§):** con datos desordenados cuesta §n log n§ (mejor/promedio); con datos **ya ordenados** cuesta **§n²§** (peor). Ordenar datos ya ordenados es el peor caso de esta versión.

Dos preguntas distintas que no se deben mezclar: **qué caso** se analiza (mejor, peor, promedio) y **qué cota** se da (§O§, §Ω§, §Θ§). Se puede dar §O§, §Ω§ y §Θ§ del mejor, del peor o del promedio.`,
    procedimiento: R`
Para obtener los tres casos de un algoritmo:

1. Identifica **qué en la entrada** cambia el trabajo (posición de §x§, orden de los datos…).
2. **Mejor caso**: construye la entrada que hace la menor cantidad de trabajo y cuéntalo.
3. **Peor caso**: construye la que hace el máximo y cuéntalo.
4. **Promedio**: suma el costo de cada posible entrada multiplicado por su probabilidad (con supuesto de distribución explícito).
5. **Reporta el peor caso** como «la complejidad», salvo que te pidan otro, e **indica la variable y el caso** («peor caso, respecto de §n§»).`,
    codigo: {
      titulo: 'Búsqueda secuencial: mejor, peor y promedio medidos en comparaciones',
      src: R`
def buscar(v, x):
    comparaciones = 0
    for i in range(len(v)):
        comparaciones += 1
        if v[i] == x:
            return i, comparaciones
    return -1, comparaciones

v = [7, 3, 9, 1, 5, 8, 2, 6]
n = len(v)
print("mejor   :", buscar(v, 7)[1])        # x en la posición 0: 1 comparación
print("peor    :", buscar(v, 99)[1])       # x no está: n comparaciones
promedio = sum(buscar(v, x)[1] for x in v) / n
print("promedio:", promedio, "= (n+1)/2 =", (n + 1) / 2)
`,
      esperado: 'mejor   : 1\npeor    : 8\npromedio: 4.5 = (n+1)/2 = 4.5'
    },
    ejemplo: R`
**Pregunta de análisis de la clase (fraude).** Debe responder en menos de 50 ms **siempre**, o la transacción se rechaza. El algoritmo A tiene caso promedio §n§ y peor caso §n²§; el algoritmo B tiene peor caso §n log n§ garantizado pero es 3 veces más lento en promedio.

Con §n = 10⁴§ y 10⁹ op/s:

- A en el **peor caso**: §10⁸§ operaciones ≈ **0,1 s = 100 ms** > 50 ms ⇒ **falla**.
- B en el peor caso: §10⁴ × 13,3 × 3 ≈ 4 × 10⁵§ ≈ **0,0004 s** ⇒ cumple.

**Se elige B**: la restricción es «siempre», y solo el peor caso da garantía. En un **proceso nocturno por lotes** podría convenir A (mejor promedio), porque un retraso ocasional no importa.

**Promedio de la búsqueda con §n = 8§** (código de arriba): posiciones 0…7 cuestan 1…8 comparaciones; media §(1+2+…+8)/8 = 4,5 = (8+1)/2§.`,
    complejidad: R`
- **Búsqueda secuencial**: mejor §Θ(1)§, peor §Θ(n)§, promedio §Θ(n)§ (§(n+1)/2§ es lineal). La complejidad que se reporta es la del **peor caso**: §O(n)§.
- **Quicksort (pivote §v[0]§)**: mejor y promedio §Θ(n log n)§; peor §Θ(n²)§ (datos ya ordenados: los subproblemas quedan de tamaños §n−1§ y 0).
- Justificación de por qué el promedio es §(n+1)/2§: si §x§ puede estar con igual probabilidad en cada una de las §n§ posiciones, el número esperado de comparaciones es §(1+2+…+n)/n = (n+1)/2§.
- **Nunca** reportes el mejor caso como si fuera la complejidad del algoritmo.`,
    errores: R`
- **Reportar el mejor caso** como la complejidad: no da ninguna garantía.
- **Confundir «peor caso» con «notación O»**: son dos cosas distintas; se puede dar O, Ω y Θ de cualquier caso.
- **Usar el caso promedio sin declarar la distribución** de las entradas.
- **Olvidar que «no está»** es un caso de la búsqueda (suele ser el peor): también cuesta §n§.
- **Creer que el caso promedio es el «normal»** para cualquier dato real: los datos casi ordenados pueden dar el peor caso de algoritmos como el quicksort ingenuo.
- **No indicar variable y caso** al reportar una complejidad (el parcial del profesor lo exige: «respecto de qué variable y de qué caso»).`,
    preguntas: [
      ['Da el mejor, peor y caso promedio de la búsqueda secuencial y di cuál se reporta.', 'Mejor: 1 comparación (§x§ en la posición 0). Peor: §n§ (§x§ al final o ausente). Promedio: §(n+1)/2§. Se reporta el **peor caso**: §O(n)§, por convenio del curso (es la única garantía).'],
      ['¿Por qué el mejor caso casi nunca sirve?', 'Porque un algoritmo que a veces es rápido no da ninguna garantía; reportar solo el mejor caso es la forma más común de engañar con un análisis.'],
      ['Un sistema debe responder siempre en menos de 50 ms. A: promedio §n§, peor §n²§. B: peor §n log n§, 3 veces más lento en promedio. ¿Cuál eliges?', 'B, porque la restricción es «siempre» y solo el peor caso da garantía. En un proceso nocturno por lotes podría preferirse A por su mejor promedio.'],
      ['¿Cuándo el quicksort con pivote §v[0]§ es §n²§?', 'Cuando los datos ya están ordenados: cada partición deja un subproblema de tamaño §n−1§ y otro vacío. Con datos desordenados es §n log n§.']
    ],
    resumen: R`
- **Mejor**: entrada que minimiza el trabajo. **Peor**: lo maximiza. **Promedio**: valor esperado (exige distribución).
- Búsqueda secuencial: **1**, **n**, **(n+1)/2**.
- Convenio: «la complejidad de X» = **peor caso** (única garantía).
- Quicksort (pivote §v[0]§): §n log n§ en promedio, §n²§ con datos ordenados.
- Al reportar: indica **la variable (n, k…) y el caso**.`
  });

  B.tema({
    id: 'cx-formal', area: 'cx', titulo: 'Notación O, Ω y Θ: definición y demostración', fuente: 'S2-C2 · diap. 4-10, 24', nivel: 2, comp: true,
    conceptos: ['cx_formal'], interactivo: [],
    definicion: R`
Las notaciones asintóticas describen **cómo crece §T(n)§** sin fijarse en constantes ni en términos menores:

- **§O(g)§ — cota superior**: «no crece más rápido que §g§». Es una garantía: el costo nunca superará esa curva (salvo constante).
- **§Ω(g)§ — cota inferior**: «crece al menos tan rápido como §g§». Sirve para afirmar que un problema no puede resolverse mejor que cierto límite.
- **§Θ(g)§ — orden exacto**: «crece exactamente como §g§». Es la afirmación más fuerte y precisa.`,
    intuicion: R`
Piensa en una carretera con límite de velocidad. §O§ es el **tope máximo** («nunca irás por encima de esto»), §Ω§ el **mínimo** («al menos irás a esto») y §Θ§ dice «tu velocidad queda **atrapada entre dos curvas** del mismo tipo».

§O§ solo pide una cota por arriba, así que **cualquier cota mayor también sirve**: decir que un algoritmo cuadrático es §O(n³)§ es verdad, pero equivale a decir «este viaje cuesta menos de 100 millones de pesos»: **verdadero e informativamente vacío**. Por eso **se usa siempre la cota superior más ajustada posible**, y cuando se conoce el orden exacto, lo riguroso es escribir §Θ§ (en la práctica la industria escribe §O§ queriendo decir §Θ§).`,
    formal: R`
**Definiciones formales** (§T§ y §g§ funciones de §n§):

~~~
T(n) ∈ O(g(n))  ⇔  ∃ c > 0, n₀ > 0 :  0 ≤ T(n) ≤ c · g(n)        ∀ n ≥ n₀
T(n) ∈ Ω(g(n))  ⇔  ∃ c > 0, n₀ > 0 :  T(n) ≥ c · g(n) ≥ 0         ∀ n ≥ n₀
T(n) ∈ Θ(g(n))  ⇔  T(n) ∈ O(g(n))  y  T(n) ∈ Ω(g(n))
~~~

Equivalencia de §Θ§: existen §c₁, c₂ > 0§ y §n₀§ con **§c₁·g(n) ≤ T(n) ≤ c₂·g(n)§** para todo §n ≥ n₀§ (§T§ queda encerrada entre dos curvas).

**Demostrar una pertenencia consiste en exhibir las constantes §c§ y §n₀§** que cumplen la desigualdad.

**Notas de rigor del curso:**

- §O(g)§ es un **conjunto** de funciones: lo riguroso es §T(n) ∈ O(n)§, **no** «§T(n) = O(n)§».
- §n²/2 − n/2 ∈ O(n³)§ es **correcto** (§O§ es una cota superior, no una igualdad) pero inútil: usa la cota más ajustada.
- **Resultado que se verá en la semana 10:** todo algoritmo de ordenamiento basado en comparaciones es §Ω(n log n)§; no es que no se haya encontrado algo mejor, está demostrado que no existe (por eso merge sort y heapsort son óptimos en su clase).
- Peor caso ≠ notación §O§: se puede dar §O§, §Ω§ y §Θ§ del mejor, del peor o del caso promedio.`,
    procedimiento: R`
**Demostrar §T(n) ∈ O(g(n))§:**

1. Escribe §T(n)§ y §g(n)§ explícitos.
2. Elige un **§n₀§** cómodo (casi siempre 1) y usa que para §n ≥ n₀§ se cumple §1 ≤ n ≤ n² ≤ …§.
3. **Acota cada término** de §T§ por un múltiplo de §g§.
4. **Suma los múltiplos**: el resultado es la constante §c§.
5. Escribe la conclusión: «basta tomar §c = …§ y §n₀ = …§».

**Demostrar §Ω§:** el mismo procedimiento pero acotando por **debajo** (normalmente quedándote con el término dominante y descartando los demás, que son ≥ 0).

**Demostrar §Θ§:** demuestra §O§ y §Ω§ (o encuentra §c₁§ y §c₂§).

**Refutar §Θ(g)§:** muestra que ninguna constante sirve para la cota que falla (por ejemplo §n log n ∉ Ω(n²)§ porque §n log n / n² → 0§).`,
    codigo: {
      titulo: 'Comprobar numéricamente un par (c, n0) (no sustituye a la demostración)',
      src: R`
def cumple_cota(T, g, c, n0, n_max=10000):
    """Comprueba que T(n) <= c * g(n) para n0 <= n <= n_max (no es una demostración)."""
    for n in range(n0, n_max + 1):
        if T(n) > c * g(n):
            return False, n          # el primer n donde falla
    return True, None

T1 = lambda n: 3 * n * n + 10 * n + 7
g1 = lambda n: n * n
print(cumple_cota(T1, g1, 20, 1))     # (True, None): c = 20, n0 = 1 (ejemplo de la clase)
print(cumple_cota(T1, g1, 3, 1))      # (False, 1): c = 3 no alcanza

T2 = lambda n: 7 * n + 200
g2 = lambda n: n
print(cumple_cota(T2, g2, 207, 1))    # (True, None): c = 207, n0 = 1
print(cumple_cota(T2, g2, 8, 1))      # (False, 1)
print(cumple_cota(T2, g2, 8, 200))    # (True, None): c = 8 sirve si n0 = 200
`,
      esperado: '(True, None)\n(False, 1)\n(True, None)\n(False, 1)\n(True, None)',
      nota: 'Una comprobación numérica **no demuestra** nada (solo prueba hasta §n_max§); sirve para detectar constantes mal elegidas antes de escribir la demostración.'
    },
    ejemplo: R`
**1. §n²/2 − n/2 ∈ O(n²)§.** Para todo §n ≥ 1§: §n²/2 − n/2 ≤ n²/2 ≤ 1 · n²§. Basta **§c = 1§ y §n₀ = 1§**. ∎

**2. §3n² + 10n + 7 ∈ O(n²)§.** Para §n ≥ 1§ se cumple §n ≤ n²§ y §1 ≤ n²§, luego
§3n² + 10n + 7 ≤ 3n² + 10n² + 7n² = 20n²§. Con **§c = 20§ y §n₀ = 1§** queda demostrado. ∎

**3. §7n + 200 ∈ O(n)§.** Para §n ≥ 1§: §200 ≤ 200n§, así que §7n + 200 ≤ 207n§: **§c = 207§, §n₀ = 1§**. (También sirve §c = 8§ con §n₀ = 200§: §7n + 200 ≤ 8n ⇔ n ≥ 200§.) ∎

**4. Pregunta de la clase: §T(n) = 5n log n + 300n + 10⁶§.**

| Afirmación | ¿Verdadera? | Razón |
|---|---|---|
| §T ∈ O(n²)§ | **Sí** (inútil) | §n log n ≤ n²§, §n ≤ n²§, constantes absorbidas |
| §T ∈ Θ(n²)§ | **No** | §T/n² → 0§: no está acotada **por debajo** por §c·n²§ |
| §T ∈ Ω(n)§ | **Sí** (floja) | §T(n) ≥ 5n log n ≥ n§ para §n ≥ 2§ |
| §T ∈ Θ(n log n)§ | **Sí** | es la respuesta útil: cota superior e inferior |

«Solo dos son la respuesta útil»: las de §Θ(n log n)§ y (como cota superior ajustada) §O(n log n)§.`,
    complejidad: R`
- **Cómo justificar una complejidad** en un examen: (1) cuenta o plantea §T(n)§; (2) elige la cota §g(n)§ más ajustada; (3) **exhibe §c§ y §n₀§** (o usa las reglas de [[cx-reglas]]) y (4) indica **variable y caso**.
- **§O§ vs. §Θ§**: §O§ da una garantía por arriba; §Θ§ además dice que no se puede mejorar la cota. Si solo demuestras §O(n²)§ no puedes afirmar que el algoritmo es cuadrático (podría ser lineal).
- **Relación entre clases**: §Θ(g) = O(g) ∩ Ω(g)§; todo §Θ(n²)§ es §O(n²)§, §O(n³)§…, y §Ω(n²)§, §Ω(n)§…
- **Cómo elegir §n₀§**: el menor valor desde el cual la desigualdad es cierta; si la desigualdad ya vale para §n = 1§ se toma §n₀ = 1§.`,
    errores: R`
- **Escribir §O(2n² + 3n)§**: constantes y términos menores ya están absorbidos; se escribe §O(n²)§.
- **Decir «§T(n) = O(n)§» como igualdad**: §O(n)§ es un conjunto; lo riguroso es §T(n) ∈ O(n)§.
- **Usar §O§ cuando se conoce el orden exacto**: en ese caso corresponde §Θ§.
- **Dar una cota superior no ajustada** (§O(n³)§ para algo cuadrático): correcta pero inútil.
- **Confundir el peor caso con la notación §O§**: son cosas distintas.
- **Demostrar con ejemplos numéricos**: un par de valores de §n§ no prueba que valga **para todo** §n ≥ n₀§.
- **Olvidar que las constantes importan para §n§ pequeño**: §O§ las oculta (ver [[cx-constantes]]).`,
    preguntas: [
      ['Define formalmente §O§, §Ω§ y §Θ§.', '§T(n) ∈ O(g(n))§ si existen §c > 0§ y §n₀§ tales que §0 ≤ T(n) ≤ c·g(n)§ para todo §n ≥ n₀§. §T ∈ Ω(g)§ si §T(n) ≥ c·g(n) ≥ 0§ para §n ≥ n₀§. §T ∈ Θ(g)§ si §T ∈ O(g)§ y §T ∈ Ω(g)§ (equivale a §c₁·g ≤ T ≤ c₂·g§).'],
      ['Demuestra que §7n + 200 ∈ O(n)§ exhibiendo §c§ y §n₀§.', 'Para §n ≥ 1§: §200 ≤ 200n§ ⇒ §7n + 200 ≤ 207n§. Basta §c = 207§ y §n₀ = 1§ (también sirve §c = 8§ con §n₀ = 200§).'],
      ['¿Es correcto decir que §n²/2 − n/2 ∈ O(n³)§? ¿Es útil?', 'Es **correcto**, porque §O§ es una cota superior y §n²/2 ≤ n³§ para §n ≥ 1§; pero es **informativamente vacío**. Se usa la cota más ajustada (§O(n²)§) o, si se conoce el orden exacto, §Θ(n²)§.'],
      ['¿Por qué «§T(n) = O(n)§» es un abuso de notación?', 'Porque §O(n)§ es un **conjunto** de funciones; lo riguroso es §T(n) ∈ O(n)§.'],
      ['Sea §T(n) = 5n log n + 300n + 10⁶§. ¿Cuáles de §O(n²)§, §Θ(n²)§, §Ω(n)§, §Θ(n log n)§ son verdaderas?', 'Verdaderas: §O(n²)§ (inútil), §Ω(n)§ (floja) y §Θ(n log n)§ (la útil). Falsa: §Θ(n²)§, porque §T/n² → 0§ y §T§ no está acotada inferiormente por §c·n²§.']
    ],
    resumen: R`
- **§O§** cota superior, **§Ω§** cota inferior, **§Θ§** orden exacto (§O§ y §Ω§).
- Demostrar = **exhibir §c§ y §n₀§** (§T ≤ c·g§ para §n ≥ n₀§).
- Ejemplos de clase: §3n² + 10n + 7 ∈ O(n²)§ con §c = 20, n₀ = 1§; §7n + 200 ∈ O(n)§ con §c = 207, n₀ = 1§.
- §O§ es un **conjunto**: escribe §T(n) ∈ O(…)§. Usa la cota **más ajustada**; si sabes el orden exacto, §Θ§.
- Peor caso ≠ §O§: son ejes distintos.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
