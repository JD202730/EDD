/* teoria_cd.js — Biblioteca: área Condicionales (Algoritmos y Programación 41333; Clase1_Condicionales, 19 diapositivas, Semana 3, Clase 1).
   Estas diapositivas son de OTRO curso (Algoritmos y Programación), no de Estructura de Datos: sirven de base para las condiciones de todos los algoritmos. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'cd-booleanas', area: 'cd', titulo: 'Expresiones booleanas, operadores lógicos y tablas de verdad', fuente: 'AP-S3-C1 · diap. 4-6, 14, 17', nivel: 14,
    conceptos: ['cd_bool'], alias: 'booleanas and or not tabla de verdad comparacion igualdad',
    definicion: R`
Una **expresión booleana** combina valores, variables y operadores, y se evalúa a **§True§** o **§False§**: son **preguntas con respuesta Sí/No**. Es la **condición de toda decisión** de un programa.

- **Operadores de comparación:** §==§ (igual), §!=§ (distinto), §<§, §<=§, §>§, §>=§. Se pueden **encadenar**: §3 < edad < 25§.
- **Operadores lógicos:** §and§ (todas las condiciones deben cumplirse), §or§ (basta una), §not§ (invierte el valor).
- **Clásico:** §=§ **asigna**; §==§ **compara**. Confundirlos es error de sintaxis en un §if§.`,
    intuicion: R`
Cada condición es una **pregunta** a la que el computador responde «sí» o «no»: «¿la edad es mayor o igual a 18?», «¿la nota está entre 0 y 5?». Los operadores lógicos **combinan** preguntas: §and§ es como exigir **todos los requisitos** de una beca; §or§ como aceptar **cualquiera** de dos documentos; §not§ es **negar** la pregunta.

**Traducción del lenguaje natural:** «entre 0 y 5» → §0 <= nota and nota <= 5§ (o §0 <= nota <= 5§); «ni sábado ni domingo» → §not (dia == "sabado" or dia == "domingo")§.`,
    formal: R`
**Tabla de verdad** (diap. 6):

| §p§ | §q§ | §p and q§ | §p or q§ | §not p§ |
|---|---|---|---|---|
| V | V | V | V | F |
| V | F | F | V | F |
| F | V | F | V | V |
| F | F | F | F | V |

**Lectura:** §and§ es verdadero **solo si ambos** lo son; §or§ es falso **solo si ambos** son falsos; §not§ invierte.

**Precedencia** (de mayor a menor): comparaciones, §not§, §and§, §or§. Cuando dudes, usa **paréntesis**.

**Ejemplos en Python** (diap. 5): con §edad = 19§: §edad >= 18§ → §True§; §edad == 18§ → §False§; §3 < edad < 25§ → §True§. Con §nota = 4.2§: §nota >= 3 and edad < 20§ → §True§.`,
    procedimiento: R`
**Para evaluar a mano una expresión:**

1. Resuelve primero lo que está entre **paréntesis**.
2. Evalúa las **comparaciones** a §True§/§False§.
3. Aplica §not§, luego §and§, luego §or§.
4. Escribe el valor en cada paso.

**Verificación (diap. 17):** evalúe §not (4 > 2 or 1 == 1) and 5 != 3§:

1. §4 > 2§ → True; §1 == 1§ → True.
2. §True or True§ → True.
3. §not True§ → False.
4. §5 != 3§ → True.
5. §False and True§ → **False**.

**Pausa de recuperación (diap. 14):** tabla de verdad de §p or not q§: (V,V) → V; (V,F) → V; (F,V) → F; (F,F) → V.`,
    codigo: [{
      titulo: 'Expresiones booleanas y tablas de verdad generadas con código',
      src: R`
edad = 19
print(edad >= 18, edad == 18, 3 < edad < 25)
nota = 4.2
print(nota >= 3 and edad < 20)
print(not (4 > 2 or 1 == 1) and 5 != 3)

print("p     q     p and q   p or q   not p")
for p in [True, False]:
    for q in [True, False]:
        print(p, " ", q, " ", p and q, " ", p or q, " ", not p)

print([(p, q, p or not q) for p in [True, False] for q in [True, False]])

# traducciones del lenguaje natural
def entre_0_y_5(x):
    return 0 <= x <= 5

def ni_sabado_ni_domingo(dia):
    return not (dia == "sabado" or dia == "domingo")

print(entre_0_y_5(4.5), entre_0_y_5(5.1))
print(ni_sabado_ni_domingo("lunes"), ni_sabado_ni_domingo("domingo"))
`,
      esperado: 'True False True\nTrue\nFalse\np     q     p and q   p or q   not p\nTrue   True   True   True   False\nTrue   False   False   True   False\nFalse   True   False   True   True\nFalse   False   False   False   True\n[(True, True, True), (True, False, True), (False, True, False), (False, False, True)]\nTrue False\nTrue False'
    }],
    ejemplo: R`
**El parqueadero de la clase** (pregunta inicial): moto cuesta $2 000, carro $4 000 y si la permanencia pasa de 8 horas hay **recargo del 50 %**. Las **decisiones** son dos preguntas booleanas: «¿es moto?» (§vehiculo == "moto"§) y «¿pasó de 8 horas?» (§horas > 8§). El camino se bifurca en cada una; cada pregunta es una expresión booleana.

**Comparar cadenas:** §"Moto" != "moto"§ (la comparación distingue mayúsculas); conviene **normalizar** con §.lower()§ antes de comparar.`,
    complejidad: R`
- Evaluar una expresión booleana simple: **§O(1)§**.
- **Cortocircuito:** en §p and q§, si §p§ es falso, §q§ **no se evalúa**; en §p or q§, si §p§ es verdadero, §q§ **no se evalúa**. Es útil para evitar errores (§x != 0 and 10 / x > 2§).
- Una expresión con §k§ condiciones tiene **§2ᵏ§** combinaciones en su tabla de verdad (por eso conviene simplificar).`,
    errores: R`
- **Usar §=§ en la condición** en lugar de §==§.
- **Escribir §nota >= 3 and <= 5§** (falta repetir la variable: §nota <= 5§).
- **Comparar cadenas sin normalizar:** §"Moto" != "moto"§ (usa §.lower()§).
- **Olvidar los paréntesis** al mezclar §and§ y §or§ (la precedencia puede sorprender).
- **Confundir §not (a or b)§ con §(not a) or (not b)§:** no son iguales (leyes de De Morgan: §not (a or b)§ = §(not a) and (not b)§).`,
    preguntas: [
      ['Construye la tabla de verdad de §p or not q§.', '(V,V) → V; (V,F) → V; (F,V) → F; (F,F) → V.'],
      ['Evalúa a mano §not (4 > 2 or 1 == 1) and 5 != 3§.', 'False: (4 > 2 or 1 == 1) es True, not True es False, y False and True es False.'],
      ['Traduce a Python: «la nota está entre 0 y 5» y «ni sábado ni domingo».', '0 <= nota <= 5 (o 0 <= nota and nota <= 5); not (dia == "sabado" or dia == "domingo").'],
      ['¿Qué diferencia hay entre §=§ y §==§ y qué ocurre si se confunden en un §if§?', '= asigna un valor; == compara. Usar = en una condición es un error de sintaxis en Python.']
    ],
    resumen: R`
- **Expresión booleana** → §True§/§False§; comparaciones §== != < <= > >=§; lógicos §and or not§.
- §and§: todas; §or§: basta una; §not§: invierte. **Precedencia:** comparación, §not§, §and§, §or§.
- §=§ asigna, §==§ compara. «Entre 0 y 5» → §0 <= nota <= 5§.
- **Cortocircuito** y leyes de De Morgan.`
  });

  B.tema({
    id: 'cd-if', area: 'cd', titulo: 'if, if-else e if-elif-else: decidir y clasificar', fuente: 'AP-S3-C1 · diap. 7-9, 14, 16-17', nivel: 14,
    conceptos: ['cd_if'], alias: 'if else elif condicional decision clasificar notas',
    definicion: R`
- **§if§**: abre un camino **opcional** (decisión simple): el bloque se ejecuta **solo si** la condición es verdadera.
- **§if-else§**: **bifurca**: **exactamente uno** de los dos bloques se ejecuta; luego los caminos se reúnen.
- **§if-elif-else§**: **clasifica** entre varias opciones: se evalúa **de arriba hacia abajo**; la **primera condición verdadera** ejecuta su bloque y el resto se **ignora**; el §else§ final captura lo que no encajó.

En Python el **bloque** de un §if§ se define por la **sangría** (4 espacios): lo no indentado ocurre **siempre**.`,
    intuicion: R`
Un §if§ es una **bifurcación en el camino**: ¿sigues por el desvío o no? Con §if-else§ la bifurcación tiene **dos salidas** que luego vuelven a unirse. Con §if-elif-else§ es una **rotonda con varias salidas**, pero se toma **la primera que corresponde**: por eso el **orden** importa.

**El orden importa:** si en el clasificador de notas la condición §nota >= 3.0§ estuviera **antes** que §nota >= 4.5§, el «Excelente» **jamás** se alcanzaría con 4.8: quedaría atrapada por «Aprobado». **Pon primero la condición más específica** (o la que descarta casos inválidos).`,
    formal: R`
**Decisión simple** (pseudocódigo y Python, diap. 7):

~~~
SI temperatura > 38 ENTONCES           if temp > 38:
    ESCRIBIR "Alerta de fiebre"            print("Alerta de fiebre")
FIN-SI                                 print("Registro guardado")   # siempre
~~~

**Dos caminos, ¿par o impar?** §if n % 2 == 0:§ → «es par» §else:§ → «es impar». El operador §%§ da el **residuo** de la división entera (§7 % 2 = 1§, §8 % 2 = 0§).

**Clasificador de nota** (diap. 9):

~~~
if nota < 0 or nota > 5:    print("Nota inválida")
elif nota >= 4.5:           print("Excelente")
elif nota >= 3.0:           print("Aprobado")
else:                       print("Reprobado")
~~~

**Dos §if§ seguidos vs. un §if-elif§:** dos §if§ **evalúan ambas** condiciones (pueden cumplirse las dos); en un §if-elif§ solo se ejecuta **el primer bloque verdadero**.`,
    procedimiento: R`
**Para escribir una decisión:**

1. Identifica las **preguntas** (condiciones) y los **casos** (cada camino posible).
2. Ordena las condiciones **de la más específica o restrictiva a la más general**; coloca **primero el caso inválido**.
3. Termina con un §else§ que cubra «todo lo demás».
4. Prueba con **un caso por camino** y con los **valores frontera** (3.0, 4.5, 5.0, 5.1, −1).

**Verificación formativa (diap. 17):** ¿qué imprime el clasificador con §nota = 4.5§? **«Excelente»** (§4.5 >= 4.5§). ¿Y con §5.1§? **«Nota inválida»** (§nota > 5§ es verdadero y es la primera condición).`,
    codigo: [{
      titulo: 'Clasificador de notas y la diferencia entre dos if seguidos y un if-elif',
      src: R`
def clasificar(nota):
    if nota < 0 or nota > 5:
        return "Nota invalida"
    elif nota >= 4.5:
        return "Excelente"
    elif nota >= 3.0:
        return "Aprobado"
    else:
        return "Reprobado"

for n in [4.5, 5.1, 3.0, 2.9, 4.8, -1, 5.0]:
    print(n, clasificar(n))

def mal_orden(nota):                    # el orden de los elif importa
    if nota >= 3.0:
        return "Aprobado"
    elif nota >= 4.5:
        return "Excelente"              # inalcanzable
    return "Reprobado"

print(mal_orden(4.8))                   # atrapada por la condicion mas amplia

def par_o_impar(n):
    return "par" if n % 2 == 0 else "impar"
print(par_o_impar(8), par_o_impar(7))

n = 6
c = []
if n > 2:                               # dos if seguidos: se evaluan los dos
    c.append("mayor que 2")
if n > 4:
    c.append("mayor que 4")
print(c)
d = []
if n > 4:                               # if-elif: solo el primero verdadero
    d.append("mayor que 4")
elif n > 2:
    d.append("mayor que 2")
print(d)
`,
      esperado: '4.5 Excelente\n5.1 Nota invalida\n3.0 Aprobado\n2.9 Reprobado\n4.8 Excelente\n-1 Nota invalida\n5.0 Excelente\nAprobado\npar impar\n[\'mayor que 2\', \'mayor que 4\']\n[\'mayor que 4\']'
    }],
    ejemplo: R`
**Tabla de pruebas del clasificador:**

| nota | condición que se cumple primero | resultado |
|---|---|---|
| −1 | §nota < 0§ | Nota inválida |
| 5.1 | §nota > 5§ | Nota inválida |
| 5.0 | §nota >= 4.5§ | Excelente |
| 4.5 | §nota >= 4.5§ | **Excelente** |
| 3.0 | §nota >= 3.0§ | Aprobado |
| 2.9 | ninguna → §else§ | Reprobado |

**Fiebre** (decisión simple): con §temp = 39§ imprime «Alerta de fiebre» y luego «Registro guardado»; con §temp = 36.5§ solo imprime «Registro guardado» (**lo no indentado ocurre siempre**).`,
    complejidad: R`
- Una decisión §if-elif-else§ con §k§ ramas evalúa **a lo sumo §k§ condiciones**: **§O(k)§**, constante respecto al tamaño de la entrada.
- **Ordenar las condiciones de la más probable a la menos probable** reduce el número medio de comparaciones (pero **el orden también define el significado**: primero el caso inválido o más específico).
- Casos de prueba para cubrir un clasificador de §k§ clases: al menos **§k§ casos** (uno por camino) más los **valores frontera**.`,
    errores: R`
- **Ordenar mal los §elif§:** la condición más amplia atrapa a las demás.
- **Olvidar el caso inválido:** toda entrada del usuario puede venir fuera de rango.
- **Dos §if§ seguidos cuando se quería §if-elif§** (se ejecutan ambos bloques).
- **Indentación incorrecta:** lo que debía ser parte del bloque se ejecuta siempre.
- **Usar §=§ en la condición.**`,
    preguntas: [
      ['¿Qué imprime el clasificador de notas con §nota = 4.5§? ¿Y con §5.1§?', 'Con 4.5 imprime «Excelente» (nota >= 4.5); con 5.1 imprime «Nota inválida» (nota > 5 es la primera condición y es verdadera).'],
      ['¿Qué diferencia hay entre dos §if§ seguidos y un §if-elif§?', 'Dos if seguidos evalúan ambas condiciones y pueden ejecutar los dos bloques; en un if-elif se ejecuta solo el primer bloque cuya condición sea verdadera y el resto se ignora.'],
      ['¿Por qué importa el orden de los §elif§?', 'Porque se evalúan de arriba hacia abajo y la primera verdadera gana: si la condición más amplia va antes, atrapa casos que debían caer en una condición más específica.'],
      ['¿Qué significa que lo «no indentado ocurre siempre»?', 'En Python el bloque de un if se define por la sangría; las instrucciones sin sangría adicional no pertenecen al if y se ejecutan siempre, sea cual sea la condición.']
    ],
    resumen: R`
- §if§ = camino opcional; §if-else§ = **una** de dos; §if-elif-else§ = **la primera** condición verdadera.
- El **orden** de las condiciones cambia el comportamiento: lo más específico/inválido primero.
- La **sangría** define el bloque; lo no indentado ocurre siempre.
- Prueba **un caso por camino** y los **valores frontera**.`
  });

  B.tema({
    id: 'cd-anidados', area: 'cd', titulo: 'Condicionales anidados, aplanado y operador ternario', fuente: 'AP-S3-C1 · diap. 10-13, 15-16, 18', nivel: 14,
    conceptos: ['cd_anid'], alias: 'anidados ternario bisiesto parqueadero aplanar',
    definicion: R`
- **Condicional anidado:** un §if§ **dentro** de otro; útil cuando la **segunda pregunta solo tiene sentido tras la primera**. En cambio, las decisiones son **secuenciales** cuando son **independientes**, una tras otra.
- **Aplanar:** reescribir un anidado combinando condiciones con §and§/§or§ (o usando §elif§) para mejorar la **lectura**.
- **Operador ternario:** la decisión **en una línea**: §valor_si_verdadero if condición else valor_si_falso§.

**Regla de estilo:** más de **3 niveles** de anidación es señal de **rediseño**.`,
    intuicion: R`
**Anidado vs. secuencial.** En el parqueadero, «¿es moto o carro?» y «¿pasó de 8 horas?» son preguntas **independientes**: se resuelven una tras otra (secuencial). En el **año bisiesto**, preguntar «¿es múltiplo de 400?» solo tiene sentido **si ya es múltiplo de 100**, y eso solo **si ya es múltiplo de 4**: la segunda pregunta depende de la primera (anidado).

**Ambas versiones del bisiesto son correctas:** la **anidada sigue el razonamiento**; la **aplanada es compacta**. Elige la más **legible** para tu equipo.

**El ternario** es para **asignaciones simples con dos alternativas claras**; si necesitas ejecutar varias instrucciones o anidar ternarios, vuelve al §if-else§ clásico.`,
    formal: R`
**Tarifa del parqueadero** (secuencial, diap. 10):

~~~
if vehiculo == "moto":   tarifa = 2000
else:                    tarifa = 4000
if horas > 8:            tarifa = tarifa * 1.5
~~~

**Año bisiesto** (anidado, diap. 11) y **aplanado**:

~~~
if anio % 4 == 0:
    if anio % 100 == 0:
        if anio % 400 == 0:  bisiesto            # 2000
        else:                no bisiesto         # 1900
    else:                    bisiesto            # 2024
else:                        no bisiesto         # 2023

bis = (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0
~~~

**Ternario** (diap. 12): §estado = "mayor" if edad >= 18 else "menor"§; §absoluto = n if n >= 0 else -n§; §paridad = "par" if n % 2 == 0 else "impar"§.

**Ejercicio guiado:** ordenar tres números en orden descendente con comparaciones: **3 casos** según quién es el mayor (§a§, §b§ o §c§) y, dentro de cada uno, **otro §if§** para ordenar los dos restantes (6 órdenes posibles en total: se necesitan **6 casos de prueba** para cubrirlos).`,
    procedimiento: R`
**Para decidir entre anidar y aplanar:**

1. ¿La segunda pregunta **solo tiene sentido** si la primera fue verdadera? → anidado (o aplana con §and§).
2. ¿Hay **más de 3 niveles**? → aplana con §and§/§or§ o usa §elif§.
3. ¿La decisión solo asigna **un valor** entre dos? → **ternario**.
4. Verifica **que la versión aplanada y la anidada den lo mismo** con casos frontera (1900, 2000, 2023, 2024).

**Trazado con (4, 9, 2)** (ordenar descendente): §a >= b§ falso → salta al §elif§; §b >= a and b >= c§ verdadero: mayor = 9; §a >= c§ verdadero: medio = 4, menor = 2; imprime **9 4 2**.

**Ejercicios de la clase:** descuento de frutas (0-3 manzanas: 10 %, 4-7: 20 %, 8 o más: 30 %); hora militar (12 h → 24 h); número romano para valores entre 1000 y 2000 (divisiones enteras por millares y centenas).`,
    codigo: [{
      titulo: 'Bisiesto anidado vs. aplanado, tarifa del parqueadero, ternario y ordenar tres números',
      src: R`
def bisiesto_anidado(anio):
    if anio % 4 == 0:
        if anio % 100 == 0:
            if anio % 400 == 0:
                return True
            else:
                return False
        else:
            return True
    else:
        return False

def bisiesto_aplanado(anio):
    return (anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0

for a in [1900, 2000, 2023, 2024]:
    print(a, bisiesto_anidado(a), bisiesto_aplanado(a))
print(all(bisiesto_anidado(a) == bisiesto_aplanado(a) for a in range(1, 3001)))

def tarifa(vehiculo, horas):
    t = 2000 if vehiculo == "moto" else 4000
    if horas > 8:
        t = t * 1.5
    return t

print(tarifa("moto", 5), tarifa("carro", 5), tarifa("moto", 10), tarifa("carro", 10))

edad = 17
estado = "mayor" if edad >= 18 else "menor"
n = -7
absoluto = n if n >= 0 else -n
paridad = "par" if n % 2 == 0 else "impar"
print(estado, absoluto, paridad)

def ordenar3(a, b, c):
    if a >= b and a >= c:
        mayor = a
        if b >= c:
            medio, menor = b, c
        else:
            medio, menor = c, b
    elif b >= a and b >= c:
        mayor = b
        if a >= c:
            medio, menor = a, c
        else:
            medio, menor = c, a
    else:
        mayor = c
        if a >= b:
            medio, menor = a, b
        else:
            medio, menor = b, a
    return mayor, medio, menor

print(ordenar3(4, 9, 2), ordenar3(1, 2, 3), ordenar3(5, 5, 1))
`,
      esperado: '1900 False False\n2000 True True\n2023 False False\n2024 True True\nTrue\n2000 4000 3000.0 6000.0\nmenor 7 impar\n(9, 4, 2) (3, 2, 1) (5, 5, 1)'
    }],
    ejemplo: R`
**Tarifas del parqueadero** (secuencial):

| Vehículo | Horas | Cálculo | Tarifa |
|---|---|---|---|
| moto | 5 | 2 000 | **2 000** |
| carro | 5 | 4 000 | **4 000** |
| moto | 10 | 2 000 × 1,5 | **3 000** |
| carro | 10 | 4 000 × 1,5 | **6 000** |

**Bisiesto:** 1900 (múltiplo de 4 y de 100, no de 400) → **no**; 2000 (múltiplo de 400) → **sí**; 2023 → no; 2024 → **sí**.

**Ternario:** §"mayor" if edad >= 18 else "menor"§ con §edad = 17§ → §"menor"§; §n if n >= 0 else -n§ con §n = −7§ → §7§.`,
    complejidad: R`
- Un condicional anidado de profundidad §d§ evalúa a lo sumo §d§ condiciones: **§O(d)§** (constante respecto a la entrada).
- Aplanar **no cambia la complejidad**; mejora la **legibilidad** y suele reducir errores.
- **Casos de prueba para el ordenamiento de tres números:** 6 (los 6 órdenes posibles) más los empates.`,
    errores: R`
- **Anidar más de 3 niveles** en lugar de aplanar con §and§/§or§ o usar §elif§.
- **Anidar ternarios** o usarlos para ejecutar varias instrucciones: vuelve al §if-else§.
- **Olvidar un caso** (p. ej., no contemplar los empates al ordenar).
- **Aplanar mal el bisiesto** (§% 4 == 0 and % 100 != 0 or % 400 == 0§ sin repetir la variable en cada comparación).
- **Cambiar la semántica al aplanar:** prueba siempre ambas versiones con los mismos casos.`,
    preguntas: [
      ['Convierte a ternario: §if x > 0: signo = 1 / else: signo = -1§.', 'signo = 1 if x > 0 else -1.'],
      ['Escribe la versión aplanada del año bisiesto.', '(anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0.'],
      ['¿Cuándo conviene anidar condicionales y cuándo aplanarlos?', 'Se anida cuando la segunda pregunta solo tiene sentido si la primera fue verdadera; se aplana (con and/or o elif) para mejorar la lectura, sobre todo cuando hay más de 3 niveles de anidación.'],
      ['¿Cuántos casos de prueba se necesitan para cubrir los órdenes posibles de tres números distintos?', 'Seis, uno por cada permutación (3! = 6), más los casos con valores iguales.']
    ],
    resumen: R`
- **Anidado:** la segunda pregunta depende de la primera; **secuencial:** decisiones independientes.
- **Más de 3 niveles** ⇒ aplana con §and§/§or§ o §elif§. Ambas versiones del bisiesto son correctas: elige la más legible.
- **Ternario:** §a if cond else b§ para asignaciones simples de dos alternativas.
- Prueba con casos frontera (1900, 2000, 2023, 2024).`
  });
})(typeof window !== 'undefined' ? window : globalThis);
