/* teoria_td.js — Biblioteca: área TAD y memoria (fuente: S1-C1 Clase1_TiposDatosAbstractos, 35 diap., y S1-C2 Clase2_MemoriaEstaticaDinamica, 27 diap.). */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'td-estructuras', area: 'td', titulo: 'Estructuras de datos: qué son, por qué importan y cómo se clasifican', fuente: 'S1-C1 · diap. 4-15, 27-29', nivel: 9,
    conceptos: ['td_ed', 'td_clasif'], lab: [{ tab: 'memoria', e: 'contiguo', texto: 'Ver memoria contigua vs enlazada' }], alias: 'estructura de datos lineales no lineales estaticas dinamicas',
    definicion: R`
Un **dato** es un valor individual sin interpretación por sí solo (§37§, §"gato"§, §True§). Un **tipo de dato** es el conjunto de valores posibles más las operaciones válidas sobre ellos (§int§: enteros acotados, con §+§, §−§, §×§). Una **estructura de datos** es una **organización de datos en memoria junto con los algoritmos** que la mantienen válida y permiten consultarla y modificarla (lista, árbol, grafo).

Se **clasifican** en dos ejes: **lineales** (los elementos forman una secuencia: arreglos, listas, pilas, colas) o **no lineales** (jerarquía o red: árboles, heaps, grafos, tablas hash); y **estáticas** (tamaño fijo, memoria contigua) o **dinámicas** (crecen y se reducen en ejecución, memoria dispersa).`,
    intuicion: R`
La estructura **condiciona el rendimiento** del programa. Ejemplo de la clase: buscar una palabra en un vocabulario de **n = 50 000 términos**:

| Estructura elegida | Comparaciones (peor caso) | Consecuencia |
|---|---|---|
| Lista sin ordenar | 50 000 | inaceptable en producción |
| Lista ordenada + búsqueda binaria | ≈ 16 | aceptable |
| Tabla hash | ≈ 1 | óptimo para este caso |

**El algoritmo no cambió: cambió dónde y cómo se guardaron los datos.** Esa decisión vale un factor de 50 000×. El hilo conductor del curso: *toda estructura es un compromiso*; ganar velocidad en una operación casi siempre cuesta memoria o velocidad en otra.`,
    formal: R`
**Definición operativa del curso:** una estructura de datos es una organización de datos en memoria junto con los algoritmos que la mantienen válida y permiten consultarla y modificarla.

**Clasificación:**

- **Lineal**: cada elemento tiene a lo sumo un anterior y un siguiente. **No lineal**: un elemento puede relacionarse con muchos otros.
- **Estática**: tamaño fijo reservado de antemano, memoria **contigua**, acceso directo por índice (§numpy.ndarray§, arreglo de C); riesgo: desperdicio o desbordamiento. **Dinámica**: crece y se reduce en ejecución, memoria **dispersa** (los elementos se enlazan con referencias); ejemplos: lista enlazada, árbol, §dict§; costo: memoria extra por cada enlace.

**Compromiso central:** contiguo ⇒ acceso rápido pero **redimensionar es caro**; enlazado ⇒ **crecer es barato** pero acceder al i-ésimo es lento.

| Estructura | ¿Lineal? | ¿Estática o dinámica? |
|---|---|---|
| §numpy.ndarray§ | lineal | estática (contigua) |
| lista enlazada | lineal | dinámica |
| árbol binario | no lineal | dinámica |
| §dict§ (tabla hash) | no lineal | dinámica |`,
    procedimiento: R`
**Para elegir una estructura de datos** (método de la clase):

1. Escribe **qué operaciones** habrá y **cuáles serán frecuentes** (consultar, insertar, eliminar, recorrer en orden…). *Primero el contrato y el perfil de uso.*
2. Decide si el **tamaño** es conocido y estable (→ estática) o variable (→ dinámica).
3. Pregúntate si importa el **orden** (conservarlo o recorrerlo ordenado).
4. Compara el **costo** de cada operación frecuente en las candidatas y quédate con la que mejor equilibre.
5. Justifica con **una razón o un ejemplo**, no con una palabra.

**Pregunta de análisis (diap. 15):** imágenes de 224 × 224 × 3 píxeles que nunca cambian de cantidad → **estática**: (1) acceso directo por índice en O(1) y (2) memoria contigua, que aprovecha las líneas de caché de la CPU.`,
    codigo: [{
      titulo: 'El mismo problema con tres estructuras: cuántas comparaciones cuesta buscar',
      src: R`
def busqueda_lineal(lista, x):
    comparaciones = 0
    for v in lista:
        comparaciones += 1
        if v == x:
            break
    return comparaciones

def busqueda_binaria(lista, x):
    comparaciones = 0
    lo, hi = 0, len(lista) - 1
    while lo <= hi:
        comparaciones += 1
        mid = (lo + hi) // 2
        if lista[mid] == x:
            break
        if lista[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return comparaciones

vocabulario = list(range(50000))        # n = 50 000 terminos
objetivo = 49999                        # el peor caso: el ultimo
print(busqueda_lineal(vocabulario, objetivo))
print(busqueda_binaria(vocabulario, objetivo))
tabla = {v: True for v in vocabulario}  # tabla hash (dict)
print(objetivo in tabla)                # ~1 comparacion en promedio
`,
      esperado: '50000\n16\nTrue'
    }],
    ejemplo: R`
**Vocabulario de un modelo de lenguaje** (diap. 28): el tokenizador busca, para cada fragmento de texto, su identificador entre ≈ 50 000 entradas, millones de veces.

| Estructura | Búsquedas por segundo | Consecuencia |
|---|---|---|
| Lista sin ordenar | ≈ 10⁴ | tokenizar un corpus tomaría días |
| Árbol balanceado | ≈ 10⁶ | viable; además mantiene el orden |
| Tabla hash (§dict§) | ≈ 10⁷ | elección estándar en la práctica |

Como **TAD**: se necesita el TAD **Conjunto** (o **Mapa** si se guarda el identificador): operaciones §pertenece§ y §obtener§, muy frecuentes; §insertar§ solo al construirlo. Como **implementación**: tabla hash (muchas consultas, pocas inserciones y no se requiere orden). **Si se requiriera orden alfabético: árbol balanceado.**`,
    complejidad: R`
La complejidad no es de «la estructura» sino de **cada operación sobre ella**:

- Arreglo (estático): acceso §O(1)§; búsqueda §O(n)§; insertar/eliminar §O(n)§.
- Lista enlazada (dinámica): acceso §O(n)§; insertar/eliminar al inicio §O(1)§.
- Lista ordenada + búsqueda binaria: buscar §O(log n)§ (≈ 16 para n = 50 000); insertar §O(n)§.
- Tabla hash: buscar/insertar ≈ §O(1)§ promedio; sin orden.

[comp]**Memoria y energía:** la elección de la estructura cambia también la energía consumida y el costo de cómputo del entrenamiento (microcompetencia mCP41 del curso): menos accesos a RAM ⇒ menos tiempo ⇒ menos energía.[/comp]`,
    errores: R`
- **Creer que existe una estructura mejor «en absoluto»**: siempre es mejor **para un perfil de operaciones**.
- **Elegir la estructura antes de saber qué operaciones serán frecuentes.**
- **Confundir el TAD con su implementación**: «pila» es un contrato; una lista de Python es una forma de cumplirlo (ver [[td-tad]]).
- **Suponer que §list§ de Python es un arreglo estático**: es un arreglo **dinámico** (duplica su capacidad cuando se llena).
- **Responder con una sola palabra**: una respuesta válida incluye una **razón o un ejemplo**.`,
    preguntas: [
      ['Define estructura de datos y explica por qué condiciona el rendimiento de un programa.', 'Es una organización de datos en memoria junto con los algoritmos que la mantienen y permiten consultarla. Condiciona el rendimiento porque el costo de cada operación depende de cómo están guardados los datos: buscar una palabra puede costar 50 000 comparaciones (lista sin ordenar), ≈ 16 (ordenada + binaria) o ≈ 1 (tabla hash).'],
      ['Clasifica: §numpy.ndarray§, lista enlazada, árbol binario y §dict§ (lineal/no lineal; estática/dinámica).', 'ndarray: lineal y estática; lista enlazada: lineal y dinámica; árbol binario: no lineal y dinámica; dict (tabla hash): no lineal y dinámica.'],
      ['Un modelo de visión procesa imágenes de 224×224×3 que nunca cambian de cantidad. ¿Estática o dinámica? Dos razones.', 'Estática: (1) acceso por índice en O(1) con la fórmula base + i·tam; (2) memoria contigua, que aprovecha las líneas de caché de 64 bytes que trae la CPU.'],
      ['¿Cuál es el compromiso central entre estructuras contiguas y enlazadas?', 'Contiguo: acceso rápido pero redimensionar es caro. Enlazado: crecer es barato pero acceder al i-ésimo elemento es lento (hay que seguir referencias).']
    ],
    resumen: R`
- **Estructura de datos** = datos en memoria + algoritmos que la mantienen y consultan.
- Ejes: **lineal / no lineal** y **estática / dinámica**.
- **Compromiso**: contiguo ⇒ acceso rápido, redimensionar caro; enlazado ⇒ crecer barato, acceso lento.
- La elección vale factores de **50 000×** (lista vs. hash): primero el **perfil de operaciones**, luego la estructura.`
  });

  B.tema({
    id: 'td-tad', area: 'td', titulo: 'Tipo de dato abstracto (TAD): contrato, operaciones y axiomas', fuente: 'S1-C1 · diap. 16-20, 26', nivel: 9,
    conceptos: ['td_tad', 'td_axiomas'], alias: 'tad abstraccion contrato axiomas pila cola conjunto',
    definicion: R`
**Abstraer** es quedarse con lo esencial y ocultar el detalle: usar algo **sin conocer cómo está hecho**. Un **tipo de dato abstracto (TAD)** es un **modelo matemático de datos** definido por:

1. un **dominio** de valores posibles,
2. un conjunto de **operaciones** con su **firma** (entradas y salidas), y
3. las **reglas de comportamiento** (**axiomas**) que esas operaciones deben cumplir.

Un TAD **deliberadamente no dice** cómo se guardan los datos, qué memoria se usa ni cuánto tarda cada operación: eso lo decide la implementación, por eso un mismo TAD admite muchas.`,
    intuicion: R`
**El TAD es el contrato; la estructura de datos es el cumplimiento del contrato.** Se puede cambiar de proveedor sin cambiar el contrato.

Hay una **frontera de abstracción**: del lado del usuario está el **QUÉ** (las operaciones y su significado); del lado del implementador, el **CÓMO** (la organización en memoria). Tú usas §list.append()§ sin saber que Python duplica el arreglo interno cuando se llena: eso es la abstracción funcionando.

**Por qué no basta con la lista de operaciones:** pila y cola ofrecen las mismas dos operaciones («meter» y «sacar»), pero con **reglas distintas** ⇒ **TAD distintos**. Las reglas fijan el significado y permiten razonar sobre el programa sin leer el código interno.`,
    formal: R`
**Especificación del TAD Conjunto** (diap. 18):

| Operación | Firma | Significado |
|---|---|---|
| §crear§ | → Conjunto | devuelve el conjunto vacío |
| §insertar§ | Conjunto × Elem → Conjunto | añade §x§ si no estaba |
| §pertenece§ | Conjunto × Elem → Bool | ¿está §x§? |
| §eliminar§ | Conjunto × Elem → Conjunto | quita §x§ si estaba |
| §tamaño§ | Conjunto → Entero | cantidad de elementos |

**Reglas (axiomas):**

- §pertenece(crear(), x) = Falso§ para todo §x§
- §pertenece(insertar(C, x), x) = Verdadero§
- §tamaño(insertar(C, x)) = tamaño(C)§ si §x§ ya pertenecía a §C§

**Pila (LIFO):** §desapilar(apilar(P, x)) = P§ y §tope(apilar(P, x)) = x§ — sale el último que entró.
**Cola (FIFO):** §frente(encolar(crear(), x)) = x§ y §frente(encolar(C, x)) = frente(C)§ si C ≠ ∅ — sale el primero que entró.

**Cola de prioridad:** §insertar(C, x, p)§ y §extraer_max(C)§; la regla que la distingue es que §extraer_max§ devuelve el elemento de **mayor prioridad**, **sin depender del orden de llegada**.`,
    procedimiento: R`
**Para especificar un TAD** (actividad de la clase: las k películas mejor puntuadas):

1. **Nombre y dominio**: p. ej., *TopK*: conjuntos de a lo sumo k pares (película, puntaje).
2. **Operaciones con su firma completa**: §crear(k) → TopK§, §calificar(T, pelicula, puntaje) → TopK§, §mejores(T) → Lista§.
3. **Reglas de comportamiento** como axiomas: p. ej., §tamaño(calificar(T, p, s)) ≤ k§; §mejores(T)§ nunca contiene un puntaje menor a otro que quedó fuera.
4. **Dos implementaciones** candidatas y en qué se diferenciarían: lista ordenada de tamaño k (insertar §O(k)§) frente a un **heap** de tamaño k (insertar §O(log k)§).

**Regla de oro:** primero el contrato, después la estructura.`,
    codigo: [{
      titulo: 'Los axiomas de la pila y de la cola, comprobados con una implementación',
      src: R`
class Pila:
    def __init__(self):
        self.d = []
    def apilar(self, x):
        self.d.append(x)
    def desapilar(self):
        return self.d.pop()
    def tope(self):
        return self.d[-1]

class Cola:
    def __init__(self):
        self.d = []
    def encolar(self, x):
        self.d.append(x)
    def desencolar(self):
        return self.d.pop(0)
    def frente(self):
        return self.d[0]

p = Pila()
p.apilar(1)
p.apilar(2)
p.apilar(3)
print(p.tope())                         # tope(apilar(P, x)) = x
p.desapilar()
print(p.d)                              # desapilar(apilar(P, x)) = P  ->  [1, 2]

c = Cola()
c.encolar("a")
print(c.frente())                       # frente(encolar(crear(), x)) = x
c.encolar("b")
print(c.frente())                       # frente(encolar(C, x)) = frente(C)
print(c.desencolar(), c.d)
`,
      esperado: '3\n[1, 2]\na\na\na [\'b\']'
    }],
    ejemplo: R`
**Pila y cola con las mismas operaciones de «meter» y «sacar»**:

| Secuencia | Pila (LIFO) | Cola (FIFO) |
|---|---|---|
| meter 1, meter 2, meter 3 | tope = 3 | frente = 1 |
| sacar | sale **3** | sale **1** |
| sacar | sale **2** | sale **2** |

Las firmas son iguales; los **axiomas** son distintos, y por eso son **TAD distintos**.

**Pregunta de análisis (diap. 26):** historial de las **últimas 1000 acciones** de un usuario para **deshacerlas en orden inverso** ⇒ TAD **Pila** (no sirve un conjunto: no tiene orden). Firmas mínimas, **antes** de pensar en código: §apilar(P, accion) → P§, §desapilar(P) → P§, §tope(P) → accion§, §vacia(P) → Bool§.`,
    complejidad: R`
Un TAD **no** especifica la complejidad: la fija cada **implementación**. El mismo TAD Conjunto:

| Operación | ConjuntoLista | ConjuntoHash |
|---|---|---|
| §pertenece§ | n comparaciones | ≈ 1 |
| §insertar§ | n (verifica duplicado) | ≈ 1 |
| §eliminar§ | n + desplazar | ≈ 1 |
| Memoria | ajustada | mayor (tabla con huecos) |
| Orden de inserción | se conserva | no garantizado |

(Ver el tema [[td-impl]]). Al **especificar** se declara el comportamiento; al **implementar** se elige el costo.`,
    errores: R`
- **Confundir el TAD con su implementación**: «pila» es un contrato; una lista de Python es una forma de cumplirlo.
- **Pensar que dos TAD son el mismo porque tienen los mismos nombres de operaciones**: lo que los distingue son las **reglas**.
- **Escribir la estructura antes que el contrato**: primero qué operaciones y qué reglas.
- **Incluir en el TAD la forma de guardar los datos o el costo**: eso es de la implementación.
- **Exponer atributos internos** (§_datos§) y dejar que el código cliente dependa de ellos: rompe la abstracción.`,
    preguntas: [
      ['Define TAD en una frase y da un ejemplo de algo que un TAD no especifica.', 'Un TAD es un modelo matemático de datos definido por un dominio, un conjunto de operaciones con su firma y las reglas de comportamiento que cumplen. No especifica cómo se guardan los datos, la memoria que usa ni cuánto tarda cada operación.'],
      ['¿Por qué pila y cola son TAD distintos si ambos tienen «meter» y «sacar»?', 'Porque las reglas de comportamiento (axiomas) son distintas: en la pila sale el último que entró (desapilar(apilar(P, x)) = P) y en la cola el primero que entró (frente(encolar(C, x)) = frente(C) si C no está vacía).'],
      ['Formula la regla que distingue a una cola de prioridad de una pila y de una cola.', 'extraer_max(C) devuelve el elemento de mayor prioridad, independientemente del orden de llegada.'],
      ['Debes guardar las últimas 1000 acciones para deshacerlas en orden inverso. ¿Qué TAD especificarías y cuáles son sus operaciones mínimas?', 'Una pila: apilar(P, acción), desapilar(P), tope(P) y vacía(P). Un conjunto no serviría porque no conserva el orden.']
    ],
    resumen: R`
- **TAD** = **dominio + operaciones (firma) + reglas**: el **qué**, nunca el **cómo**.
- **Contrato** (TAD) vs. **cumplimiento** (estructura de datos).
- Las **reglas (axiomas)** distinguen TAD con las mismas operaciones (pila vs. cola).
- Primero el **contrato y el perfil de uso**; después la implementación.`
  });

  B.tema({
    id: 'td-impl', area: 'td', titulo: 'Interfaz e implementaciones: programar contra el contrato', fuente: 'S1-C1 · diap. 21-25', nivel: 9,
    conceptos: ['td_impl'], alias: 'abc abstractmethod interfaz implementacion conjunto lista hash',
    definicion: R`
En Python la **interfaz** de un TAD se declara con una **clase base abstracta** (§ABC§ + §@abstractmethod§): fija el contrato **sin implementarlo**. Cada **implementación** (por ejemplo **ConjuntoLista** sobre una lista y **ConjuntoHash** sobre un §dict§) cumple ese contrato con otro almacenamiento y otro costo.

El **código cliente** que usa el contrato **no cambia ni una línea** al pasar de una implementación a otra: se puede **optimizar la estructura sin reescribir la lógica del programa**.`,
    intuicion: R`
Programar **contra la interfaz, no contra la estructura**: la función §palabras_nuevas(texto, vocabulario)§ solo sabe que §vocabulario§ tiene §pertenece§ e §insertar§; no sabe (ni le importa) si por dentro hay una lista o una tabla hash.

**ConjuntoHash no es «mejor»: es mejor para estas operaciones.** Si necesitaras recorrer los datos en orden, la lista ordenada volvería a ganar. Así se optimiza software real: se perfila qué operaciones son frecuentes y se cambia **la implementación detrás del mismo contrato**.`,
    formal: R`
**Interfaz del TAD Conjunto** (diap. 21): una clase abstracta con métodos §@abstractmethod§ (§insertar§, §pertenece§, §eliminar§, §__len__§). Una clase que **hereda** de ella y **no implementa** todos sus métodos abstractos **no se puede instanciar** (§TypeError§).

**Implementación A (lista):** §insertar§ revisa §x not in self._datos§ (recorre **toda** la lista), §pertenece§ es §x in self._datos§ (n comparaciones en el peor caso), §eliminar§ usa §remove§.

**Implementación B (tabla hash):** §self._datos = {}§; §insertar§ hace §self._datos[x] = True§ (acceso directo), §pertenece§ es §x in self._datos§ (≈ 1 comparación en promedio), §eliminar§ usa §pop(x, None)§.

**El guion bajo** en §_datos§ señala que es un detalle interno: nadie fuera de la clase debería tocarlo.`,
    procedimiento: R`
**Para diseñar con interfaz e implementaciones:**

1. Escribe el **contrato**: operaciones, firmas y reglas (tema [[td-tad]]).
2. Declara la **interfaz** (§class ConjuntoTAD(ABC)§ con §@abstractmethod§).
3. Escribe una implementación **sencilla** que cumpla el contrato (aunque sea lenta).
4. Escribe el **código cliente solo contra la interfaz** (p. ej., §palabras_nuevas(texto, vocabulario: ConjuntoTAD)§).
5. **Mide el perfil de uso** y, si hace falta, escribe **otra implementación**; el cliente no se modifica.`,
    codigo: [{
      titulo: 'La interfaz ConjuntoTAD y dos implementaciones, con el mismo código cliente (diapositivas 21-24)',
      src: R`
from abc import ABC, abstractmethod

class ConjuntoTAD(ABC):
    @abstractmethod
    def insertar(self, x) -> None: ...
    @abstractmethod
    def pertenece(self, x) -> bool: ...
    @abstractmethod
    def eliminar(self, x) -> None: ...
    @abstractmethod
    def __len__(self) -> int: ...

class ConjuntoLista(ConjuntoTAD):
    def __init__(self):
        self._datos = []
    def insertar(self, x):
        if x not in self._datos:        # recorre TODA la lista
            self._datos.append(x)
    def pertenece(self, x):
        return x in self._datos         # n comparaciones en el peor caso
    def eliminar(self, x):
        if x in self._datos:
            self._datos.remove(x)
    def __len__(self):
        return len(self._datos)

class ConjuntoHash(ConjuntoTAD):
    def __init__(self):
        self._datos = {}                # dict: tabla hash de Python
    def insertar(self, x):
        self._datos[x] = True
    def pertenece(self, x):
        return x in self._datos
    def eliminar(self, x):
        self._datos.pop(x, None)
    def __len__(self):
        return len(self._datos)

def palabras_nuevas(texto, vocabulario):
    nuevas = []
    for palabra in texto.split():
        if not vocabulario.pertenece(palabra):
            vocabulario.insertar(palabra)
            nuevas.append(palabra)
    return nuevas

corpus = "el gato ve al gato y el perro ve al gato"
print(palabras_nuevas(corpus, ConjuntoLista()))   # correcto, pero lento
print(palabras_nuevas(corpus, ConjuntoHash()))    # correcto y rapido
v = ConjuntoHash()
v.insertar("a")
v.insertar("a")
print(len(v), v.pertenece("a"), v.pertenece("b"))
try:
    ConjuntoTAD()                       # una interfaz no se instancia
except TypeError:
    print("TypeError: ConjuntoTAD es abstracta")
`,
      esperado: '[\'el\', \'gato\', \'ve\', \'al\', \'y\', \'perro\']\n[\'el\', \'gato\', \'ve\', \'al\', \'y\', \'perro\']\n1 True False\nTypeError: ConjuntoTAD es abstracta'
    }],
    ejemplo: R`
**El mismo cliente con dos implementaciones.** §palabras_nuevas("el gato ve al gato y el perro ve al gato", vocabulario)§ devuelve la lista de términos que no estaban: §['el', 'gato', 've', 'al', 'y', 'perro']§ con **cualquiera** de las dos implementaciones.

**Comparación (diap. 25):**

| Operación | ConjuntoLista | ConjuntoHash | Razón |
|---|---|---|---|
| §pertenece§ | n comparaciones | ≈ 1 | la lista recorre; el hash calcula la posición |
| §insertar§ | n comparaciones | ≈ 1 | insertar exige verificar el duplicado |
| §eliminar§ | n + desplazar | ≈ 1 | la lista debe recolocar elementos |
| Memoria | ajustada | mayor | el hash paga espacio por velocidad |
| Orden de inserción | se conserva | no garantizado | el hash dispersa las posiciones |`,
    complejidad: R`
- **ConjuntoLista**: §pertenece§, §insertar§ y §eliminar§ en §O(n)§; memoria ajustada.
- **ConjuntoHash**: las tres en **≈ §O(1)§ promedio**; memoria mayor (tabla con huecos); orden no garantizado.
- **El código cliente** hereda el costo de la implementación que reciba: §palabras_nuevas§ sobre un corpus de §m§ palabras con vocabulario de tamaño §n§ cuesta §O(m · n)§ con la lista y ≈ §O(m)§ con el hash.
- Usar la interfaz **no añade costo asintótico**; lo que cambia es cuánto cuesta cada llamada a un método.`,
    errores: R`
- **Programar contra la estructura concreta** (usar §_datos§ desde fuera): al cambiar de implementación, hay que reescribir el cliente.
- **No implementar todos los métodos abstractos** y esperar poder instanciar la subclase: §TypeError§.
- **Creer que una implementación es «mejor» en general**: es mejor para un **perfil de operaciones**.
- **Cambiar la implementación sin cambiar el contrato** de los métodos (otra firma o regla): deja de ser el mismo TAD.
- **Olvidar el costo oculto**: §x in lista§ es §O(n)§ aunque se vea como una sola operación.`,
    preguntas: [
      ['¿Qué ventaja tiene programar contra la interfaz de un TAD?', 'El código cliente no cambia al cambiar de implementación: se puede optimizar la estructura de datos (por ejemplo, de lista a tabla hash) sin reescribir la lógica del programa.'],
      ['Compara ConjuntoLista y ConjuntoHash en pertenece, insertar y eliminar, memoria y orden.', 'ConjuntoLista: n comparaciones en las tres operaciones, memoria ajustada, conserva el orden de inserción. ConjuntoHash: ≈ 1 en las tres, mayor memoria, orden no garantizado.'],
      ['¿Cuándo preferirías la implementación con lista aunque sea más lenta?', 'Cuando se necesita recorrer los datos en orden de inserción (o en orden) o la memoria es muy ajustada; el hash no garantiza el orden.'],
      ['¿Qué ocurre si una subclase de una clase abstracta no implementa un método abstracto?', 'No se puede instanciar: Python lanza TypeError al intentar crear el objeto.']
    ],
    resumen: R`
- **Interfaz** (ABC + §@abstractmethod§) = el contrato; **implementaciones** = distintos almacenamientos y costos.
- El **cliente** se escribe contra la interfaz y **no cambia** al cambiar la implementación.
- ConjuntoLista: §O(n)§, ordenado por inserción; ConjuntoHash: ≈ §O(1)§, sin orden, más memoria.
- Una clase con métodos abstractos sin implementar **no se instancia**.`
  });

  B.tema({
    id: 'td-memoria', area: 'td', titulo: 'Memoria de un proceso: pila y montículo, asignación estática y dinámica', fuente: 'S1-C2 · diap. 5-13', nivel: 9, comp: true,
    conceptos: ['td_memoria', 'td_estdin'], lab: [{ tab: 'memoria', e: 'contiguo', texto: 'Ver memoria contigua vs enlazada' }, { tab: 'memoria', e: 'frag', texto: 'Ver fragmentación' }], alias: 'stack heap estatica dinamica fragmentacion garbage collector marco',
    definicion: R`
La memoria principal es una secuencia de **celdas de 1 byte**, cada una con una **dirección numérica única**; toda estructura de datos es una forma de repartir y relacionar esas celdas. Un proceso la organiza así:

- **Pila (stack)**: variables locales, parámetros y retornos; la gestiona **automáticamente** el compilador/intérprete.
- **Montículo (heap)**: objetos creados en ejecución; se gestiona **bajo demanda**.
- **Datos globales y estáticos**: existen durante todo el programa.
- **Código**: las instrucciones (solo lectura).

**Asignación estática**: el tamaño se conoce antes de ejecutar y se reserva un bloque **contiguo**. **Asignación dinámica**: el tamaño se decide en ejecución y los bloques se piden al montículo uno a uno, **no contiguos**, enlazados con referencias.`,
    intuicion: R`
**La pila de llamadas** funciona como una pila de platos: cada llamada a función apila un **marco** con sus parámetros, variables locales y dirección de retorno; al terminar, el marco se **desapila** y su memoria queda libre de inmediato. Es, literalmente, el TAD **pila**. En §factorial(3)§ se apilan §factorial(3)§, §factorial(2)§ y §factorial(1)§ sobre §main()§; el último marco creado es el primero en liberarse. Si la recursión no termina, la pila se **agota**: §RecursionError§ / *stack overflow*.

**Estática vs. dinámica** es un compromiso: lo contiguo permite calcular la dirección con una fórmula (acceso instantáneo); lo disperso permite **crecer** sin mover nada, pero obliga a **seguir enlaces**.

**El montículo se fragmenta**: al pedir y liberar bloques de **tamaños distintos** quedan huecos. Puede haber memoria libre **en total** y aun así fallar una reserva porque no hay un hueco **contiguo** suficientemente grande: la causa típica del error *out of memory* en GPU aunque el monitor muestre memoria libre.`,
    formal: R`
**Cálculo de dirección** (asignación estática, bloque contiguo):

§dir(v[i]) = base + i × tam§ — una multiplicación y una suma: **costo constante** sin importar §i§ ni §n§. Ejemplo: §base = 2000§, §tam = 4§ ⇒ §dir(v[3]) = 2000 + 3 × 4 = 2012§. **Solo es válida en memoria contigua.**

**Cuadro comparativo** (diap. 10):

| Criterio | Estática (contigua) | Dinámica (enlazada) |
|---|---|---|
| Tamaño | fijo, decidido antes | variable en ejecución |
| Acceso a §v[i]§ | directo, costo constante | recorriendo: costo proporcional a §i§ |
| Insertar al inicio | cara: desplazar todo | barata: reasignar una referencia |
| Memoria extra | ninguna | una referencia por nodo |
| Localidad de caché | excelente | pobre |
| Ejemplo | §numpy.ndarray§ | lista enlazada, árbol |

**¿Quién libera la memoria?** (diap. 13)

| Estrategia | Cómo funciona | Riesgo característico |
|---|---|---|
| **Manual** (C, C++) | el programador llama §free§ / §delete§ | **fuga de memoria** si olvida; **puntero colgante** si libera de más |
| **Automática** (Python, Java) | **conteo de referencias** y recolector de basura | menor control; pausas del recolector |

**Conteo de referencias en Python:** cada objeto lleva la cuenta de cuántos nombres lo apuntan; cuando llega a cero, el objeto se destruye y su memoria vuelve al montículo. Consecuencia: **un objeto no se libera cuando deja de usarse, sino cuando nadie lo referencia**; una lista con referencias viejas impide liberar memoria (la fuga típica en Python).`,
    procedimiento: R`
**Para elegir entre estática y dinámica** (regla práctica de la clase):

1. ¿**Domina el acceso por índice** y el tamaño es estable? → **contigua (estática)**.
2. ¿**Dominan inserciones y borrados** en posiciones arbitrarias o los extremos? → **enlazada (dinámica)**.
3. ¿La **localidad de caché** es crítica (cómputo numérico, tensores)? → contigua.
4. ¿La **memoria es escasa**? → ojo con la referencia extra por nodo.

**Pregunta de análisis (diap. 11):** un *dataloader* que lee lotes de 256 imágenes ya cargadas, siempre en orden y completas → **estática** (acceso secuencial y localidad). Un módulo con una cola de tareas donde constantemente se añaden y retiran elementos por los extremos → **dinámica** (enlazada o deque: inserciones y borrados en los extremos).`,
    codigo: [{
      titulo: 'Marcos de la pila de llamadas, RecursionError y la fórmula de direcciones',
      src: R`
profundidad = [0, 0]                    # [actual, maxima]

def factorial(n):
    profundidad[0] += 1
    profundidad[1] = max(profundidad[1], profundidad[0])
    r = 1 if n <= 1 else n * factorial(n - 1)
    profundidad[0] -= 1
    return r

print(factorial(3), "marcos apilados a la vez:", profundidad[1])

def sin_caso_base(n):
    return sin_caso_base(n + 1)         # nunca termina: agota la pila

try:
    sin_caso_base(0)
except RecursionError:
    print("RecursionError: se agoto la pila de llamadas")

def direccion(base, i, tam):
    return base + i * tam               # solo vale en memoria contigua

print(direccion(2000, 3, 4))
print([direccion(2000, i, 4) for i in range(6)])
`,
      esperado: '6 marcos apilados a la vez: 3\nRecursionError: se agoto la pila de llamadas\n2012\n[2000, 2004, 2008, 2012, 2016, 2020]'
    }],
    ejemplo: R`
**Fragmentación (diap. 12).** Un montículo de 10 unidades con tres huecos libres de 1 unidad entre bloques usados: en total hay **3 libres**, pero el **mayor hueco contiguo mide 1**. Pedir un bloque de **2** falla aunque «haya» 3 libres: la memoria está **fragmentada**. Por eso los *frameworks* de IA reservan grandes bloques por adelantado y los reutilizan.

**Estática vs. dinámica en un caso real:**

| Situación | Conviene | Razón dominante |
|---|---|---|
| Tensor de 224×224×3 que no cambia | estática (contigua) | acceso por índice O(1) y localidad de caché |
| Cola de tareas con altas y bajas por los extremos | dinámica (enlazada/deque) | insertar y quitar en los extremos sin desplazar |
| Historial que crece sin tope conocido | dinámica | tamaño impredecible |`,
    complejidad: R`
- **Acceso por índice** en memoria contigua: **§O(1)§**; en memoria enlazada: **§O(n)§** (seguir enlaces).
- **Insertar al inicio**: contigua §O(n)§ (desplazar todo); enlazada §O(1)§.
- **Pedir memoria al sistema es costoso**: por eso §list.append§ reserva capacidad de más y no una casilla por vez (**amortizado §O(1)§**).
- **Costo oculto de la dinámica:** una referencia por nodo, memoria dispersa (mala localidad de caché) y fragmentación.
- **Pila de llamadas:** una recursión de profundidad §n§ usa §O(n)§ de espacio de pila.

[comp]**Python guarda en la pila los *nombres* y en el montículo los *objetos***: casi todo lo que crea un programa de Python (listas, diccionarios, instancias, también los enteros y las cadenas) vive en el montículo; en la pila de llamadas están los marcos con las referencias.[/comp]`,
    errores: R`
- **Pensar que la memoria de las variables locales y la de los objetos es la misma región**: unas viven en la pila (marcos) y otros en el montículo.
- **Creer que hay solo asignación estática o solo dinámica** en un programa: se combinan.
- **Pensar que un objeto se libera al dejar de usarse**: se libera cuando **nadie lo referencia**.
- **Ignorar la fragmentación**: «hay memoria libre» no implica poder reservar un bloque grande.
- **Suponer que la fórmula §base + i × tam§ sirve para una lista enlazada**: solo vale en memoria contigua.
- **Olvidar los costos de la dinámica**: una referencia extra por nodo y pérdida de localidad de caché.`,
    preguntas: [
      ['¿Qué se guarda en la pila y qué en el montículo? Da un ejemplo de cada uno.', 'En la pila (stack): variables locales, parámetros y direcciones de retorno de cada llamada (los marcos de §factorial(3)§). En el montículo (heap): objetos creados en ejecución (los nodos de una lista enlazada, una lista de Python).'],
      ['Explica por qué §dir(v[i]) = base + i × tam§ solo es válida en memoria contigua.', 'Porque supone que los elementos están uno tras otro a distancias fijas de tam bytes; en una estructura enlazada los nodos están dispersos y no hay ninguna relación aritmética entre sus direcciones.'],
      ['¿Puede haber memoria libre suficiente y aun así fallar una reserva? Justifica.', 'Sí: por fragmentación. El total libre puede alcanzar, pero no existir un hueco contiguo lo bastante grande para el bloque pedido (causa típica de out of memory en GPU).'],
      ['Compara estática y dinámica en tamaño, acceso, insertar al inicio, memoria extra y localidad de caché.', 'Estática: fijo / directo O(1) / cara (desplazar todo) / ninguna / excelente. Dinámica: variable en ejecución / O(i) recorriendo / barata (reasignar una referencia) / una referencia por nodo / pobre.']
    ],
    resumen: R`
- Memoria de un proceso: **pila** (marcos de llamadas, automática), **montículo** (objetos, bajo demanda), globales y código.
- **Estática**: tamaño fijo, **contigua**, §dir = base + i × tam§ (§O(1)§). **Dinámica**: tamaño en ejecución, **dispersa**, enlazada; cuesta referencias, localidad y fragmentación.
- **Fragmentación**: libre en total ≠ hueco contiguo suficiente.
- Python libera por **conteo de referencias**: cuando nadie apunta al objeto.`
  });

  B.tema({
    id: 'td-referencias', area: 'td', titulo: 'Referencias, alias, mutabilidad y copias en Python', fuente: 'S1-C2 · diap. 4, 14-17, 21, 23', nivel: 9,
    conceptos: ['td_ref', 'td_copia'], lab: [{ tab: 'memoria', e: 'alias', texto: 'Ver alias (b = a)' }, { tab: 'memoria', e: 'copias', texto: 'Ver copias superficial y profunda' }], alias: 'alias copy deepcopy mutable inmutable referencia id parametro por defecto',
    definicion: R`
En Python **una variable no contiene el objeto**: contiene una **referencia** a un objeto que vive en el montículo. **Asignar con §=§ copia la referencia, nunca el objeto.**

- **Alias**: dos nombres que referencian el **mismo** objeto (§b = a§).
- **Mutables** (§list§, §dict§, §set§, objetos propios): se pueden modificar **en el sitio**; todos los alias ven el cambio.
- **Inmutables** (§int§, §float§, §str§, §tuple§): no se modifican; cualquier «cambio» crea un **objeto nuevo**.
- **Copia superficial** (§copy.copy§): objeto externo nuevo, pero **comparte los objetos internos**. **Copia profunda** (§copy.deepcopy§): copia **todo el árbol**.`,
    intuicion: R`
**Pregunta inicial de la clase:** §a = [1, 2, 3]§, luego §b = a§, luego §b.append(4)§. ¿Cuánto vale §a§? **[1, 2, 3, 4]**. La asignación §b = a§ copió la **referencia**, no el objeto: ambos nombres apuntan al **mismo bloque** del montículo. Como §list§ es mutable, §append§ modificó ese único objeto **en el sitio**, y el cambio es visible desde los dos nombres.

Es como compartir **un enlace a un documento** en lugar de enviar una copia: si alguien lo edita, todos ven la edición. Con un **int** pasa lo contrario: §y = x; y += 1§ crea **otro** objeto 6; §x§ sigue valiendo 5, porque los enteros no se pueden editar.

**Por qué esto causa errores reales:** pasar una lista a una función que la modifica **altera la del que llamó**. Es el origen del error más común al preprocesar datasets: modificar el original creyendo trabajar sobre una copia.`,
    formal: R`
**Resumen de comportamientos:**

| Operación | ¿Objeto nuevo? | Efecto |
|---|---|---|
| §b = a§ (alias) | no | dos nombres, un objeto |
| §y = x; y += 1§ (int) | **sí** (el 6) | §x§ no cambia |
| §a.append(4)§ (list) | no (se modifica en el sitio) | todos los alias ven el cambio |
| §copy.copy(a)§ | sí (solo el externo) | comparte los objetos internos |
| §copy.deepcopy(a)§ | sí (todo el árbol) | independencia total |

**Copia superficial vs. profunda** (diap. 16): con §original = [[1, 2], [3, 4]]§, §alias = original§, §superficial = copy.copy(original)§, §profunda = copy.deepcopy(original)§ y luego §original[0].append(99)§: §alias§ → **[[1, 2, 99], [3, 4]]**; §superficial§ → **[[1, 2, 99], [3, 4]]** (cambió también); §profunda§ → **[[1, 2], [3, 4]]** (intacta).

**Argumento por defecto mutable:** §def f(x, acc=[])§ crea la lista **una sola vez**, al definir la función, y la **comparte entre llamadas**: §f(1)§ → §[1]§ y luego §f(2)§ → §[1, 2]§. Patrón correcto: §acc=None§ y crear la lista dentro.`,
    procedimiento: R`
**Para predecir el resultado de un fragmento con referencias:**

1. Dibuja las **variables** a la izquierda y los **objetos** a la derecha, con **flechas** de cada nombre a su objeto.
2. Cada §=§ solo **mueve una flecha** (no crea objetos); los **literales** y las llamadas (§list(...)§, §copy§) **crean** objetos.
3. Un **método que muta** (§append§, §sort§, §update§…) modifica el objeto **al que apunta la flecha**: todos los nombres que lo apuntan lo ven.
4. Una operación sobre un **inmutable** (§+=§ con un int o str) **crea otro objeto** y **mueve la flecha** del nombre.
5. En estructuras **anidadas**, pregunta: ¿cuántos niveles copia esta operación? (superficial: uno; profunda: todos).

**Corrección de la función que normaliza (diap. 17):** en vez de modificar §datos§ en el sitio, devolver una lista nueva (§[x / 255 for x in datos]§) o copiar al inicio (§datos = datos[:]§).`,
    codigo: [{
      titulo: 'Alias, mutabilidad, copias y el argumento por defecto mutable (diapositivas 14-16 y 23)',
      src: R`
import copy

a = [1, 2, 3]
b = a                                   # copia la REFERENCIA
b.append(4)
print(a, id(a) == id(b))

x = 5
y = x
y += 1                                  # int es inmutable: objeto nuevo
print(x, y)

original = [[1, 2], [3, 4]]
alias = original
superficial = copy.copy(original)
profunda = copy.deepcopy(original)
original[0].append(99)
print(alias)
print(superficial)                      # cambio TAMBIEN (comparte las internas)
print(profunda)                         # intacta

def malo(x, acc=[]):                    # la lista se crea UNA vez
    acc.append(x)
    return acc

def bueno(x, acc=None):
    if acc is None:
        acc = []
    acc.append(x)
    return acc

print(malo(1), malo(2))
print(bueno(1), bueno(2))

def normalizar(datos):
    return [d / 255 for d in datos]     # lista NUEVA: no toca el original

crudo = [255, 510]
limpio = normalizar(crudo)
print(crudo, limpio)
`,
      esperado: '[1, 2, 3, 4] True\n5 6\n[[1, 2, 99], [3, 4]]\n[[1, 2, 99], [3, 4]]\n[[1, 2], [3, 4]]\n[1, 2] [1, 2]\n[1] [2]\n[255, 510] [1.0, 2.0]'
    }],
    ejemplo: R`
**Traza de la copia superficial vs. profunda** con §original = [[1, 2], [3, 4]]§:

| Nombre | Objeto externo | Listas internas |
|---|---|---|
| §original§ | E1 | A = §[1, 2]§, B = §[3, 4]§ |
| §alias§ | **E1** (el mismo) | A, B |
| §superficial§ | **E2** (nuevo) | **A, B** (las mismas) |
| §profunda§ | **E3** (nuevo) | **A′, B′** (copias nuevas) |

Al ejecutar §original[0].append(99)§ se modifica **A**: lo ven §original§, §alias§ y §superficial§. §profunda§ conserva A′ = §[1, 2]§.

**Cuándo usar cada una:** una copia **profunda es imprescindible** cuando se va a **modificar una estructura anidada** sin afectar a la original (p. ej., una matriz como lista de listas); es un **desperdicio** si los elementos son inmutables (una lista de enteros: basta una copia superficial §lista[:]§).`,
    complejidad: R`
- **Asignar un alias**: **§O(1)§** (solo mueve una flecha).
- **Copia superficial** de una lista de §n§ elementos: **§O(n)§** (se copian las referencias).
- **Copia profunda**: **§O(tamaño total del árbol de objetos)§**, es decir, proporcional a **todos** los objetos alcanzables.
- **Pasar una lista a una función** no copia nada: **§O(1)§** (por eso es barato… y peligroso).
- **Memoria**: tres copias de un dataset de 2 millones de reseñas (§list§ de §str§) multiplican el consumo; los alias innecesarios **no** consumen memoria, las copias sí.`,
    errores: R`
- **Creer que §b = a§ copia una lista**: copia una **referencia**.
- **Usar §copy.copy§ esperando independencia total** en estructuras anidadas.
- **Modificar la lista recibida** en una función sin avisar: el que llama ve el cambio.
- **Pensar que un objeto se libera al dejar de usarse**: se libera cuando **nadie lo referencia**.
- **Usar un valor mutable como argumento por defecto** (§def f(x, acc=[])§): se conserva entre llamadas.
- **Suponer que §+=§ siempre crea un objeto nuevo**: en una lista (§lista += [x]§) modifica **en el sitio**; en un §int§ crea otro.`,
    preguntas: [
      ['Con §a = [1, 2, 3]; b = a; b.append(4)§, ¿cuánto vale §a§ y por qué?', 'a vale [1, 2, 3, 4]. La asignación b = a copió la referencia, no el objeto: ambos nombres apuntan al mismo bloque del montículo y, como list es mutable, append modificó ese único objeto en el sitio.'],
      ['Diferencia alias, copia superficial y copia profunda con un ejemplo de estructura anidada.', 'Con original = [[1, 2], [3, 4]]: alias = original no crea objetos; copy.copy crea una lista externa nueva que comparte las internas; copy.deepcopy copia todo. Tras original[0].append(99), el alias y la superficial muestran [[1, 2, 99], [3, 4]]; la profunda sigue [[1, 2], [3, 4]].'],
      ['Una función normaliza una lista modificándola en el sitio y se la llama con §limpio = normalizar(crudo)§. ¿Qué pasa con §crudo§ y cómo lo corregirías sin §deepcopy§?', 'crudo queda modificado (normalizado) porque la función recibió la misma referencia. Se corrige construyendo una lista nueva ([x / 255 for x in datos]) o copiando al inicio (datos = datos[:]).'],
      ['¿Qué ocurre con §def g(x, acc=[])§ al llamar §g(1)§ y luego §g(2)§?', 'La lista por defecto se crea una sola vez al definir la función y se comparte: g(1) devuelve [1] y g(2) devuelve [1, 2]. El patrón correcto es acc=None y crear la lista dentro.']
    ],
    resumen: R`
- Una variable guarda una **referencia**; §=§ **copia la referencia**, no el objeto.
- **Mutables** (list, dict, set, objetos): los alias ven los cambios. **Inmutables** (int, float, str, tuple): «cambiar» crea otro objeto.
- **Superficial** = comparte lo interno; **profunda** = copia todo el árbol.
- Cuidado con pasar listas a funciones y con **argumentos por defecto mutables** (§acc=None§).`
  });

  B.tema({
    id: 'td-cache', area: 'td', titulo: 'Costo en memoria y localidad de caché: por qué los tensores son contiguos', fuente: 'S1-C2 · diap. 18-20, 22, 25', nivel: 9, comp: true,
    conceptos: ['td_cache'], lab: [{ tab: 'memoria', e: 'contiguo', texto: 'Ver acceso contiguo vs enlazado' }], alias: 'cache localidad numpy tensor lista memoria getsizeof',
    definicion: R`
El costo real de una estructura incluye **memoria y localidad de caché**, no solo el conteo de operaciones. La CPU no lee bytes sueltos: trae **líneas de caché de 64 bytes** completas; si los datos siguientes ya vienen en esa línea, el acceso es casi gratis.

Por eso **recorrer un arreglo contiguo** aprovecha cada línea de caché, mientras que **recorrer una lista enlazada** salta a direcciones dispersas y casi todos los accesos van a RAM.

En IA, representar los datos **de forma contigua** es la primera y más rentable optimización: todo *framework* (NumPy, PyTorch, TensorFlow) guarda un tensor como **un solo bloque contiguo** más metadatos de forma.`,
    intuicion: R`
La **jerarquía de memoria** es una cadena de almacenes cada vez más grandes y más lentos:

| Nivel | Latencia aprox. | Comentario |
|---|---|---|
| Registro | < 1 ciclo | dentro del núcleo |
| Caché L1 | ≈ 4 ciclos | pocos KB |
| Caché L3 | ≈ 40 ciclos | compartida |
| Memoria RAM | ≈ 200 ciclos | **50× más lenta que L1** |

Es como **tomar libros de un estante**: si los que necesitas están **juntos**, de un viaje traes varios; si están dispersos por toda la biblioteca, haces un viaje por cada uno. **Dos estructuras con el mismo número de operaciones pueden diferir 10× en tiempo real.**

**Memoria de una lista de Python:** guarda un arreglo de **referencias** y cada entero es un **objeto aparte con encabezado propio**. Un §numpy.ndarray§ guarda los valores **en crudo y contiguos**, sin encabezado por elemento.`,
    formal: R`
**Un millón de enteros** (diap. 18):

| Representación | Qué guarda | Memoria aprox. |
|---|---|---|
| §list§ de Python | arreglo de referencias (8 B × 10⁶) + un objeto §int§ por elemento (≈ 28 B × 10⁶) | ≈ 8 MB + 28 MB = **≈ 36 MB** |
| §numpy.ndarray§ (§int64§) | los valores en crudo (8 B × 10⁶) | **8 MB** |

**Factor ≈ 4,5× en memoria**, y todavía no se habló de velocidad.

**Caso IA (diap. 20):** una multiplicación de matrices 1000 × 1000 recorre millones de elementos de forma predecible.

| Representación | Tiempo relativo | Causa dominante |
|---|---|---|
| Lista de listas de Python | ≈ 400× | referencias dispersas + interpretación |
| §numpy.ndarray§ | 1× | contiguo, vectorizado, en C |

**Conclusión de diseño:** la estructura de datos es la optimización. **Menos accesos a RAM ⇒ menos tiempo ⇒ menos energía**: la eficiencia de memoria tiene impacto ambiental medible (microcompetencia mCP41).

[comp]**Medir el tamaño real:** §sys.getsizeof(lista)§ solo cuenta el arreglo de **referencias**; hay que sumar el tamaño de **los objetos apuntados** (§sys.getsizeof(lista[0]) * n§). El entrenador no incluye §sys.getsizeof§ porque su resultado depende de la versión de Python; aquí se calcula con las cifras de la clase.[/comp]`,
    procedimiento: R`
**Para estimar el costo en memoria de una estructura:**

1. Cuenta **cuántos elementos** hay (§n§) y **cuántos bytes** ocupa cada uno **en crudo**.
2. Suma el **costo por elemento de la estructura**: encabezado de objeto, referencias, punteros (nodos enlazados).
3. Compara con la representación **contigua** equivalente.
4. Pregunta cómo se **recorre**: ¿secuencial (aprovecha caché) o a saltos (no)?
5. **Mide** (con §sys.getsizeof§, §ndarray.nbytes§ o un perfilador) antes de optimizar.

**Auditoría de memoria (actividad de la clase):** un dataset de 2 millones de reseñas como §list§ de §str§ se copia tres veces y agota la RAM. (1) Estima la memoria de cada copia; (2) identifica los **alias innecesarios** (no consumen memoria) y las copias realmente necesarias; (3) propón dos cambios para bajar el pico (procesar por **lotes**, usar **generadores/iteradores**, copiar solo lo que se modifica); (4) di qué medirías para comprobar la mejora (pico de memoria, tiempo por lote).`,
    codigo: [{
      titulo: 'Estimar la memoria de una list frente a un ndarray con las cifras de la clase',
      src: R`
def memoria_lista(n):
    referencias = 8 * n                 # un arreglo de referencias
    objetos = 28 * n                    # un objeto int (con encabezado) por elemento
    return referencias + objetos

def memoria_ndarray(n):
    return 8 * n                        # valores en crudo y contiguos (int64)

n = 1000000
lista = memoria_lista(n)
arr = memoria_ndarray(n)
print(lista, arr)
print(round(lista / arr, 1))            # factor ~4.5x

# acceso secuencial: dos estructuras, mismo numero de operaciones, distinta localidad
lineas_cache = (n * 8) // 64            # lineas de 64 bytes que trae la CPU al recorrer el ndarray
print(lineas_cache, "lineas de cache para recorrer el ndarray")
`,
      esperado: '36000000 8000000\n4.5\n125000 lineas de cache para recorrer el ndarray'
    }],
    ejemplo: R`
**¿Qué estructura para cada módulo de un sistema de IA?** (diap. 27)

| Capa | Estructura típica |
|---|---|
| Datos crudos (texto, imágenes) | listas, arreglos, archivos |
| Preprocesamiento (vocabularios, tokenización) | tablas hash, tries |
| Representación (tensores, *embeddings*) | **arreglos contiguos (NumPy)** |
| Modelo (grafo de cómputo, autograd) | grafos dirigidos acíclicos |
| Inferencia (vecinos, top-k) | **heaps**, k-d trees, HNSW |

Cada capa descansa sobre una estructura distinta. Los **tensores** se guardan contiguos porque el cómputo por lotes **recorre la memoria de forma predecible**; una lista enlazada brillaría en el **control** (colas de tareas), nunca en los datos numéricos.`,
    complejidad: R`
- **Recorrido secuencial de un arreglo contiguo:** §O(n)§ con **pocas fallas de caché** (una por cada 64 bytes).
- **Recorrido de una lista enlazada:** también §O(n)§, pero con una **falla de caché por nodo**, en promedio: puede ser ≈ 10× más lento **con las mismas operaciones**.
- **La notación §O§ no captura la localidad de caché**: ignora constantes que, en la práctica, pueden valer 10× o más.
- **Memoria de una §list§ de §n§ enteros:** ≈ §36 · n§ bytes; de un §ndarray§: §8 · n§ bytes (factor ≈ 4,5×).
- **Matrices 1000 × 1000:** la lista de listas es ≈ 400× más lenta que §ndarray§.`,
    errores: R`
- **Medir el tamaño de una lista con §sys.getsizeof§ y olvidar el peso de los objetos apuntados.**
- **Suponer que el mismo número de operaciones implica el mismo tiempo**: la localidad cambia el resultado.
- **Usar una lista enlazada para datos numéricos «por ahorrar»**: la mala localidad la hace lenta.
- **Pensar que más memoria RAM «libre» elimina el problema de fragmentación** (ver [[td-memoria]]).
- **Creer que la complejidad asintótica es lo único que cuenta**: en la práctica también cuentan las constantes, la memoria y el caché.`,
    preguntas: [
      ['¿Por qué un §ndarray§ de un millón de enteros pesa mucho menos que la §list§ equivalente?', 'Porque el ndarray guarda los valores en crudo y contiguos (8 MB), mientras que la list guarda un arreglo de referencias (≈ 8 MB) y cada entero es un objeto aparte con su encabezado (≈ 28 MB): ≈ 36 MB en total, un factor de ≈ 4,5×.'],
      ['Explica la localidad de caché y por qué favorece a los arreglos.', 'La CPU trae líneas de 64 bytes completas; si los datos siguientes ya vienen en la línea, el acceso es casi gratis. Un arreglo contiguo aprovecha cada línea; una lista enlazada salta a direcciones dispersas y casi cada acceso va a RAM (≈ 50× más lenta que L1).'],
      ['¿Por qué los tensores de NumPy/PyTorch son bloques contiguos y no listas enlazadas?', 'Porque el cómputo por lotes recorre la memoria de forma predecible y la contigüidad aprovecha la caché y la vectorización; una lista de listas puede ser ≈ 400× más lenta en una multiplicación de matrices.'],
      ['Dos algoritmos hacen el mismo número de operaciones. ¿Pueden diferir en tiempo real? Justifica.', 'Sí, hasta ≈ 10×: la notación O ignora la localidad de caché y las constantes; el que accede de forma contigua aprovecha las líneas de caché y el que salta por memoria dispersa falla más veces.']
    ],
    resumen: R`
- Costo real = **operaciones + memoria + localidad de caché**.
- CPU trae **líneas de 64 B**: contiguo ⇒ casi gratis; disperso ⇒ RAM (≈ 50× más lenta que L1).
- §list§ de 10⁶ enteros ≈ **36 MB**; §ndarray§ ≈ **8 MB** (≈ 4,5×); listas de listas ≈ **400×** más lentas en matrices.
- Los **tensores son contiguos**: la estructura de datos es la optimización; menos RAM ⇒ menos tiempo ⇒ menos energía.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
