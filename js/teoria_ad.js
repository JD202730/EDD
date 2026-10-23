/* teoria_ad.js — Biblioteca: área Temas adicionales (BST frente a tabla hash, IA, trampas de Python y cómo responder preguntas tipo parcial) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'ad-hash', area: 'ad', titulo: 'BST frente a tabla hash: cuál elegir', fuente: 'S6-C2 · diap. 4, 13-14, 17 (la tabla hash se estudia en la semana 8)', nivel: 6, comp: true,
    conceptos: ['bs_hash'], interactivo: [],
    definicion: R`
Un **BST balanceado** mantiene los datos **ordenados** y busca en **§O(log n)§**. Una **tabla hash** busca en **§O(1)§ en promedio** pero **no conserva el orden**.

Regla de la clase (S6-C2, d.13): usa un BST **cuando se necesita a la vez búsqueda eficiente y mantener los datos ordenados** con inserciones y eliminaciones. **Si no importa el orden y solo se consulta pertenencia, una tabla hash (semana 8) suele ser mejor.**`,
    intuicion: R`
- **Tabla hash** = un **casillero con cerraduras inteligentes**: una función calcula directamente en qué casilla debe estar tu dato; por eso abrir la casilla es casi instantáneo, pero **las casillas no están en orden alfabético**.
- **BST balanceado** = una **agenda ordenada** organizada en forma de árbol: encontrar un nombre toma unos cuantos pasos (decidir izquierda o derecha), y **leer toda la agenda en orden** es gratis (inorden).

¿Qué necesitas más? Si solo preguntas «¿está esta palabra?», la tabla hash gana. Si además quieres «listame las palabras en orden alfabético» o «la siguiente palabra mayor», el BST gana.`,
    formal: R`
**Pregunta de análisis (2) de S6-C2:** vocabulario de IA con un BST balanceado y una tabla hash.

1. **¿Cuál da búsqueda más rápida en promedio?** La **tabla hash** (§O(1)§ promedio frente a §O(log n)§).
2. **¿Cuál permite listar las palabras en orden alfabético sin costo extra?** El **BST** (un recorrido inorden, §O(n)§).
3. **Si necesita ambas cosas, ¿qué elegiría y qué sacrificaría?** Un **BST balanceado (AVL o rojo-negro)**: se sacrifica la búsqueda §O(1)§ promedio a cambio de §O(log n)§ garantizado y orden gratis. (La alternativa es una tabla hash y **ordenar cuando haga falta**, con costo §O(n log n)§ en cada listado.)

| Operación | BST balanceado | Tabla hash |
|---|---|---|
| Buscar | §O(log n)§ (peor caso) | §O(1)§ promedio |
| Insertar / eliminar | §O(log n)§ | §O(1)§ promedio |
| Listar en orden | **§O(n)§** (inorden) | §O(n log n)§ (ordenar) |
| Mínimo / máximo / siguiente | §O(log n)§ | §O(n)§ |
| Mantiene el orden | **sí** | no |

[comp]
**Tabla hash en una línea.** Se calcula §índice = hash(clave) % m§ y el dato se guarda (o se busca) en esa casilla; si dos claves caen en la misma casilla hay una **colisión** y se resuelve (encadenamiento o sondeo). Con buena función hash y factor de carga controlado el costo medio es §O(1)§; **en el peor caso** (muchas colisiones) puede degradarse a §O(n)§. En Python: §dict§ y §set§.
[/comp]`,
    procedimiento: R`
**Para elegir la estructura:**

1. ¿Solo necesitas **pertenencia** o **claves → valores** sin orden? → **tabla hash** (§dict§/§set§).
2. ¿Necesitas **orden**, **rangos**, **mínimo/máximo** o «el siguiente mayor»? → **BST balanceado**.
3. ¿Necesitas **garantía de peor caso**? → BST balanceado (§O(log n)§ garantizado); la hash es §O(1)§ solo en promedio.
4. ¿Necesitas **ambas**? → BST balanceado (y se sacrifica el §O(1)§), o hash + ordenar cuando se necesite.
5. Si el árbol puede recibir datos ordenados, **no uses un BST sin balancear**.`,
    codigo: {
      titulo: 'Buscar en un BST sin balancear frente a un diccionario, y listar en orden',
      src: R`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

def insertar(nodo, v):
    if nodo is None:
        return NodoArbol(v)
    if v < nodo.valor:
        nodo.izq = insertar(nodo.izq, v)
    elif v > nodo.valor:
        nodo.der = insertar(nodo.der, v)
    return nodo

def buscar(nodo, v):
    visitados = 0
    while nodo is not None:
        visitados += 1
        if v == nodo.valor:
            return True, visitados
        nodo = nodo.izq if v < nodo.valor else nodo.der
    return False, visitados

def inorden(nodo, salida):
    if nodo is not None:
        inorden(nodo.izq, salida)
        salida.append(nodo.valor)
        inorden(nodo.der, salida)
    return salida

palabras = ["modelo", "dato", "red", "gradiente", "nodo", "arbol", "tensor", "epoca", "capa", "sesgo", "peso", "lote"]
raiz = None
tabla = {}
for p in palabras:
    raiz = insertar(raiz, p)
    tabla[p] = True

for p in ["gradiente", "peso", "inexistente"]:
    print(p, "| BST:", buscar(raiz, p), "| diccionario:", p in tabla, "(una consulta)")
print("listar en orden con el BST (inorden):", inorden(raiz, []))
print("listar en orden con el diccionario   :", sorted(tabla))
`,
      esperado: 'gradiente | BST: (True, 3) | diccionario: True (una consulta)\npeso | BST: (True, 4) | diccionario: True (una consulta)\ninexistente | BST: (False, 4) | diccionario: False (una consulta)\nlistar en orden con el BST (inorden): [\'arbol\', \'capa\', \'dato\', \'epoca\', \'gradiente\', \'lote\', \'modelo\', \'nodo\', \'peso\', \'red\', \'sesgo\', \'tensor\']\nlistar en orden con el diccionario   : [\'arbol\', \'capa\', \'dato\', \'epoca\', \'gradiente\', \'lote\', \'modelo\', \'nodo\', \'peso\', \'red\', \'sesgo\', \'tensor\']'
    },
    ejemplo: R`
**Caso de la clase: ranking dinámico de puntajes** (se consulta ordenado y recibe puntajes con frecuencia). Un BST balanceado cumple las dos necesidades: insertar un puntaje nuevo cuesta §O(log n)§ y **listar el ranking** cuesta §O(n)§ sin ordenar de nuevo (inorden). Una tabla hash insertaría en §O(1)§ pero cada vez que se pida el ranking habría que **ordenar** (§O(n log n)§).

**Caso opuesto: corrector ortográfico** (¿está esta palabra en el diccionario?). Solo se necesita pertenencia: la tabla hash (§O(1)§ promedio) es la elección natural.

**Con el código:** buscar «gradiente» en el BST sin balancear visita varios nodos (el número depende del orden de inserción) y en el diccionario cuesta una consulta; listar en orden es un inorden (BST) o un §sorted§ (diccionario).

**Advertencia:** si las palabras llegaran **ya ordenadas** alfabéticamente, el BST sin balancear degeneraría en lista (§O(n)§); por eso en un BST real se usa un AVL o un rojo-negro ([[av-problema]]).`,
    complejidad: R`
- **BST balanceado**: búsqueda, inserción y eliminación §O(log n)§ (peor caso), listado en orden §O(n)§.
- **BST sin balancear**: §O(h)§, hasta §O(n)§ con datos ordenados.
- **Tabla hash**: búsqueda/inserción/eliminación §O(1)§ **promedio**, §O(n)§ en el peor caso (colisiones); **no conserva el orden**; listar ordenado cuesta §O(n log n)§.
- **Espacio**: ambos §O(n)§; la tabla hash suele reservar espacio extra para mantener bajo el factor de carga.
- **Compromiso**: velocidad promedio frente a garantía de peor caso y orden.`,
    errores: R`
- **Elegir un BST cuando solo se necesita pertenencia**: una tabla hash suele ser mejor.
- **Elegir una tabla hash cuando se necesita orden, mínimo o rangos**: no los da.
- **Decir que la tabla hash es siempre §O(1)§**: lo es en promedio; el peor caso es §O(n)§.
- **Usar un BST sin balancear** si los datos pueden llegar ordenados.
- **No declarar qué se sacrifica** al pedir ambas ventajas (orden y búsqueda rápida).`,
    preguntas: [
      ['Para un vocabulario de IA con un BST balanceado y una tabla hash: ¿cuál da búsqueda más rápida en promedio, cuál lista en orden alfabético sin costo extra y qué elegirías si necesitas ambas?', 'Búsqueda más rápida en promedio: la tabla hash (§O(1)§). Listar en orden sin costo extra: el BST (inorden). Si necesito ambas: un BST balanceado (AVL/rojo-negro), sacrificando el §O(1)§ promedio por §O(log n)§ garantizado (o hash + ordenar cada vez).'],
      ['¿En qué caso preferirías una tabla hash sobre un BST?', 'Cuando no importa el orden y solo se consulta pertenencia (o se buscan claves): la hash da §O(1)§ promedio.'],
      ['¿Cuándo usar un BST según la clase?', 'Cuando se necesita a la vez búsqueda eficiente y mantener los datos ordenados con inserciones y eliminaciones.'],
      ['¿Qué pasa con la tabla hash en el peor caso?', 'Con muchas colisiones se degrada a §O(n)§; el promedio es §O(1)§.']
    ],
    resumen: R`
- **BST balanceado**: orden gratis (inorden), §O(log n)§ garantizado, mínimo/máximo/rangos.
- **Tabla hash**: §O(1)§ promedio, **sin orden**, peor caso §O(n)§.
- Solo pertenencia → hash. Orden y búsqueda → BST balanceado (sacrificas el §O(1)§).
- Nunca un BST sin balancear con datos que pueden llegar ordenados.`
  });

  B.tema({
    id: 'ad-ia', area: 'ad', titulo: 'Conexiones con la inteligencia artificial', fuente: 'S2-C1 · diap. 22; S2-C2 · diap. 21-22; S5-C2 · diap. 16, 21; S6-C1 · diap. 20-22', nivel: 8, comp: true,
    conceptos: [], interactivo: [],
    definicion: R`
Los temas del curso aparecen en la IA de formas muy concretas. Este tema las reúne:

| Tema del curso | Conexión con IA |
|---|---|
| **Recorridos de árboles** | **autograd** (retropropagación: postorden), grafo de cómputo |
| **Árboles** | **árboles de decisión** (recorrido raíz → hoja), búsqueda en juegos (MCTS) |
| **Complejidad (Big O)** | el costo **cuadrático de la atención** en transformers (§Θ(L²)§) |
| **Compromiso tiempo–espacio** | *gradient checkpointing* (recalcular o guardar activaciones) |
| **Paradigmas y NP-difícil** | TSP y mochila: **heurísticas y metaheurísticas** (recocido simulado, enjambre) |
| **Backtracking con poda** | exploración del árbol de jugadas (ajedrez, Go) |`,
    intuicion: R`
La IA moderna **trabaja con estructuras y costos**: una red neuronal es un grafo de operaciones que se recorre en un orden preciso (hacia adelante y hacia atrás); un clasificador por árbol es un árbol que se baja de la raíz a una hoja; un modelo de lenguaje enorme es posible o no según su **complejidad** (¿crece como §L²§ o como §L log L§?) y según cuánta **memoria** cuesta.

Por eso la complejidad y las estructuras de datos no son un tema «previo»: **determinan qué modelos se pueden entrenar y usar**. Muchas investigaciones actuales (atención eficiente) son, en el fondo, problemas de complejidad.`,
    formal: R`
**1. Autograd y recorridos (S6-C1, d.20-22).** La retropropagación hace un recorrido **postorden** del grafo de cómputo: calcula los gradientes de los hijos antes que los del padre. Imprimir la arquitectura de arriba hacia abajo es un **preorden**.

**2. Árboles de decisión (S6-C1, d.20).** Cada nodo interno prueba una característica y cada hoja da una predicción; clasificar una muestra recorre **un camino raíz → hoja**: §O(h)§.

**3. Búsqueda en juegos (S6-C1, d.20; S5-C2, d.10).** El árbol de jugadas se explora con **backtracking y poda**; Monte Carlo Tree Search lo recorre para elegir la mejor jugada.

**4. Complejidad de la atención (S2-C2, d.21).** Cada token se compara con todos los demás: §Θ(L²·d)§ en tiempo y §Θ(L²)§ en memoria. Duplicar el contexto **cuadruplica** el costo; la investigación en atención eficiente busca bajar de §L²§ a §L log L§ o §L§. **Es un problema de complejidad, no de hardware.**

**5. Compromiso tiempo–espacio (S2-C1, d.22).** *Gradient checkpointing*: **recalcular** las activaciones (ahorra memoria, gasta tiempo) frente a **guardarlas** (ahorra tiempo, gasta memoria).

**6. NP-difíciles (S5-C2, d.16).** TSP y mochila: la fuerza bruta es §O(n!)§ o §O(2ⁿ)§; se usan **heurísticas y metaheurísticas**, que sacrifican optimalidad por tiempo: **el compromiso central de la optimización en IA.**`,
    procedimiento: R`
**Para responder preguntas «de IA» del curso:**

1. Identifica **qué estructura o algoritmo** del curso aparece (árbol, recorrido, costo, paradigma).
2. Nombra la **propiedad** que importa (dependencia hijos → padre, camino raíz → hoja, §L²§, óptimo local…).
3. Da el **costo** (§O(h)§, §O(n)§, §Θ(L²)§…).
4. Si hay un **compromiso**, dilo explícitamente: tiempo ↔ espacio, optimalidad ↔ tiempo.
5. Concluye con la **decisión** (qué recorrido, qué paradigma, qué recurso se prioriza) y por qué.`,
    codigo: {
      titulo: 'Un árbol de decisión clasifica bajando un camino raíz → hoja (O(h))',
      src: R`
class Nodo:
    def __init__(self, caracteristica=None, umbral=None, izq=None, der=None, prediccion=None):
        self.caracteristica = caracteristica
        self.umbral = umbral
        self.izq = izq                    # si muestra[caracteristica] <= umbral
        self.der = der                    # si muestra[caracteristica] >  umbral
        self.prediccion = prediccion      # solo las hojas tienen predicción

def predecir(nodo, muestra):
    pasos = 0
    while nodo.prediccion is None:        # baja un solo camino: O(altura)
        pasos += 1
        if muestra[nodo.caracteristica] <= nodo.umbral:
            nodo = nodo.izq
        else:
            nodo = nodo.der
    return nodo.prediccion, pasos

arbol = Nodo("edad", 30,
             Nodo("ingreso", 2000, Nodo(prediccion="rechazar"), Nodo(prediccion="aprobar")),
             Nodo("deuda", 500, Nodo(prediccion="aprobar"), Nodo(prediccion="rechazar")))

for muestra in [{"edad": 25, "ingreso": 1500, "deuda": 0}, {"edad": 25, "ingreso": 3000, "deuda": 0}, {"edad": 45, "ingreso": 0, "deuda": 800}]:
    print(muestra, "->", predecir(arbol, muestra))
`,
      esperado: '{\'edad\': 25, \'ingreso\': 1500, \'deuda\': 0} -> (\'rechazar\', 2)\n{\'edad\': 25, \'ingreso\': 3000, \'deuda\': 0} -> (\'aprobar\', 2)\n{\'edad\': 45, \'ingreso\': 0, \'deuda\': 800} -> (\'rechazar\', 2)'
    },
    ejemplo: R`
**Costo de la atención con el contexto** (S2-C2): con §L = 1 024§ → 1,0 × 10⁶ productos; con §L = 8 192§ → 6,7 × 10⁷ (**64×**); con §L = 128 000§ → 1,6 × 10¹⁰ (**15 625×**). Un modelo que tarda 1 s con 4 096 tokens necesitaría 64 s con 32 768 si el costo es §Θ(L²)§, y solo 10 s con §Θ(L log L)§.

**Elegir el recorrido para el autograd** (pregunta de la clase): la retropropagación necesita el gradiente de cada operación **después** de tener los de las operaciones que dependen de ella ⇒ **postorden**. Para imprimir la arquitectura de arriba hacia abajo ⇒ **preorden**.

**Árbol de decisión (código):** cada muestra recorre un camino de a lo sumo §h = 2§ preguntas; no se visita el resto del árbol.

**Mochila y TSP:** con 15 ciudades hay §14! = 87 178 291 200§ rutas: se usa una **heurística** que da una buena ruta en segundos, sin garantía de ser la óptima.`,
    complejidad: R`
- **Clasificar con un árbol de decisión**: §O(h)§ por muestra.
- **Autograd**: una pasada por el grafo, §O(operaciones)§.
- **Atención estándar**: §Θ(L²·d)§ tiempo y §Θ(L²)§ memoria; atención eficiente: §O(L log L)§ o §O(L)§.
- **Fuerza bruta** de TSP §O(n!)§ y mochila §O(2ⁿ)§: inviable ⇒ heurísticas.
- **Gradient checkpointing**: tiempo extra a cambio de menos memoria (el compromiso de [[cx-espacial]]).`,
    errores: R`
- **Pensar que un problema de complejidad se arregla con hardware**: con §L²§ el factor crece sin límite.
- **Confundir el recorrido de autograd** (postorden: hijos antes que el padre) con el de impresión de la arquitectura (preorden).
- **Creer que clasificar con un árbol de decisión cuesta §O(n)§**: cuesta §O(h)§.
- **Usar fuerza bruta en TSP o mochila grandes.**
- **Olvidar el compromiso optimalidad ↔ tiempo** al justificar una heurística.`,
    preguntas: [
      ['¿Qué recorrido hace la retropropagación y por qué?', 'Un postorden: calcula los gradientes de los hijos (operaciones de las que depende) antes que los del padre.'],
      ['¿Por qué la atención de los transformers es un problema de complejidad y no de hardware?', 'Porque su costo es §Θ(L²)§: duplicar el contexto cuadruplica el costo y ningún hardware cierra esa brecha para §L§ grande; por eso se investiga bajar a §L log L§ o §L§.'],
      ['¿Qué relación hay entre el *gradient checkpointing* y el compromiso tiempo–espacio?', 'Recalcular las activaciones ahorra memoria pero gasta tiempo; guardarlas ahorra tiempo pero gasta memoria. Es exactamente ese compromiso.'],
      ['¿Por qué se usan heurísticas en TSP y mochila?', 'Porque son NP-difíciles (fuerza bruta §O(n!)§ y §O(2ⁿ)§); las heurísticas dan buenas soluciones en tiempo razonable sacrificando optimalidad.']
    ],
    resumen: R`
- **Autograd = postorden**; arquitectura de arriba abajo = preorden.
- **Árbol de decisión**: camino raíz → hoja, §O(h)§. **Juegos**: backtracking con poda, MCTS.
- **Atención**: §Θ(L²)§: complejidad, no hardware.
- **Checkpointing**: tiempo ↔ espacio. **TSP y mochila**: NP-difíciles ⇒ heurísticas (optimalidad ↔ tiempo).`
  });

  B.tema({
    id: 'ad-python', area: 'ad', titulo: 'Trampas de Python que cuestan puntos en el examen', fuente: 'S5-C2 · diap. 19; S2-C1 · diap. 7, 25; S2-C2 · diap. 17, 24; S6-C1 · diap. 23; S6-C2 · diap. 16', nivel: 8, comp: true,
    conceptos: ['in_depurar'], interactivo: [],
    definicion: R`
Varios errores del curso no son de algoritmos sino de **cómo funciona Python**: valores mutables por defecto, copias superficiales, el límite de recursión, el costo oculto de cortes (§v[1:]§) y de §pop(0)§, y el §None§ de los recorridos. Este tema las agrupa para detectarlas rápido en preguntas de «¿qué imprime?» y de «encuentra el error».`,
    intuicion: R`
Python hace muchas cosas **por ti** y por eso parece «gratis»: copiar una lista con §[:]§, cortar un arreglo con §v[1:]§, preguntar §x in lista§. Pero cada una **hace trabajo real** o **comparte objetos** de forma no evidente. El examen premia a quien sabe **qué ocurre por debajo**: ¿se copia o se comparte? ¿cuánto cuesta? ¿cuántas veces se evalúa el valor por defecto?`,
    formal: R`
| Trampa | Qué pasa | Consecuencia |
|---|---|---|
| **Valor mutable por defecto** (§def f(n, cache={})§) | el valor por defecto se evalúa **una sola vez** al definir la función | se **comparte** entre llamadas; usar §cache=None§ y crear dentro |
| **Copia superficial** (§b = a[:]§) | copia la lista externa, **no** los objetos internos | con listas anidadas §b[0].append(9)§ **modifica también §a[0]§** |
| **Límite de recursión** (~1000) | Python no optimiza recursión de cola | §RecursionError§ en recursiones profundas; conviene iterar |
| **§v[1:]§ en una recursión** | cada corte **copia** §n − 1§ elementos | el costo pasa de §O(n)§ a §O(n²)§ |
| **§lista.pop(0)§ / §insert(0, x)§** | desplazan todos los elementos | §O(n)§ cada uno; usar §deque§ |
| **§x in lista§** | recorre la lista | §O(n)§; usar §set§ para §O(1)§ |
| **Olvidar §return§** en la llamada recursiva | la función devuelve §None§ | resultados erróneos o §TypeError§ |
| **Olvidar §nodo is None§** | se accede a atributos de §None§ | §AttributeError§ |
| **No reasignar** (§insertar(raiz, v)§ sin asignar) | se pierde el nodo nuevo / la nueva raíz | el árbol no cambia |
| **§==§ frente a §is§** | §is§ compara identidad, §==§ igualdad | usa §is None§ para comprobar §None§ |`,
    procedimiento: R`
**Para detectar errores en código de Python** (pregunta «encuentra el error»):

1. ¿Hay **caso base** y se comprueba antes de la llamada?
2. ¿Cada llamada **se acerca** al caso base?
3. ¿Se **usa el valor devuelto** (§return§, asignación a §nodo.izq§)?
4. ¿Hay **estado compartido mutable** (valor por defecto, copia superficial)?
5. ¿Se **devuelve y reasigna la nueva raíz** (árboles)?
6. ¿Hay un **costo oculto** (§in§, corte, §pop(0)§, concatenación) que cambia la complejidad?
7. Prueba con **un caso mínimo** (vacío, un elemento) y un **caso límite**.`,
    codigo: {
      titulo: 'Cuatro trampas: valor por defecto, copia superficial, RecursionError y cortes',
      src: R`
def agregar(x, lista=[]):                    # el [] se crea UNA vez, al definir la función
    lista.append(x)
    return lista
print(agregar(1), agregar(2))                # [1, 2] [1, 2]: la MISMA lista compartida

def agregar_ok(x, lista=None):
    if lista is None:
        lista = []                            # una lista nueva en cada llamada
    lista.append(x)
    return lista
print(agregar_ok(1), agregar_ok(2))          # [1] [2]

a = [[1, 2], [3, 4]]
b = a[:]                                      # copia SUPERFICIAL: las listas internas se comparten
b[0].append(9)
print(a, "| a is b:", a is b, "| a[0] is b[0]:", a[0] is b[0])

def profundidad(n):
    return 0 if n == 0 else 1 + profundidad(n - 1)
try:
    profundidad(5000)
except RecursionError:
    print("RecursionError: la recursión de profundidad 5000 supera el límite de Python")

copiados = [0]
def suma_con_cortes(v):
    if not v:
        return 0
    copiados[0] += len(v) - 1                 # v[1:] copia n - 1 elementos
    return v[0] + suma_con_cortes(v[1:])
suma_con_cortes(list(range(100)))
print("elementos copiados:", copiados[0], "= n(n-1)/2 =", 100 * 99 // 2)
`,
      esperado: '[1, 2] [1, 2]\n[1] [2]\n[[1, 2, 9], [3, 4]] | a is b: False | a[0] is b[0]: True\nRecursionError: la recursión de profundidad 5000 supera el límite de Python\nelementos copiados: 4950 = n(n-1)/2 = 4950'
    },
    ejemplo: R`
**Pregunta del parcial del profesor (1.c, primer corte):** «Si §a = [[1,2],[3,4]]§ y §b = a[:]§, entonces ejecutar §b[0].append(9)§ **no** modifica §a[0]§.» → **Falso**: §a[:]§ es una **copia superficial**; las listas internas son las mismas, así que §a[0]§ pasa a ser §[1, 2, 9]§ (el código lo muestra).

**«Encuentra el error» (de la clase):**

~~~
def fib_memo(n, cache={}):      # error: caché mutable por defecto, compartida entre llamadas
    if n < 2: return n
    if n in cache: return cache[n]
    cache[n] = fib_memo(n - 1) + fib_memo(n - 2)   # error: no se pasa la caché
    return cache[n]
~~~

**Corrección:** §cache=None§ y crear el diccionario dentro, y pasar §cache§ en las llamadas recursivas ([[rec-memo]]).

**Insertar sin reasignar:** §insertar(raiz, v)§ (sin §raiz = …§) pierde el nodo nuevo cuando la raíz era §None§ o cuando una rotación la cambia ([[av-insercion]]).`,
    complejidad: R`
- **Corte §v[1:]§**: §O(n)§ por llamada ⇒ una recursión que corta en cada paso es **§O(n²)§** en tiempo (suma §n(n−1)/2§ copias, como muestra el código) y §O(n²)§ de memoria transitoria. Con índices (§suma(v, i)§) vuelve a §O(n)§.
- **§pop(0)§ en lista**: §O(n)§; **§deque.popleft()§**: §O(1)§.
- **§x in lista§**: §O(n)§; **§x in set§**: §O(1)§ promedio.
- **Recursión de profundidad §d§**: §O(d)§ de pila (y el límite es ~1000 en Python).
- **Copia superficial**: copiar la lista externa cuesta §O(n)§ pero **no** copia los elementos.`,
    errores: R`
- **Creer que §b = a[:]§ copia todo** (listas anidadas se comparten).
- **Usar §cache={}§ o §lista=[]§ como valor por defecto.**
- **Escribir recursiones con §v[1:]§** sin darse cuenta del costo cuadrático.
- **Usar §==§ para comparar con §None§** (se prefiere §is None§).
- **Olvidar que Python no optimiza la recursión de cola.**
- **Confundir «asignar» con «copiar»**: §b = a§ solo crea otro nombre para el mismo objeto.`,
    preguntas: [
      ['¿Qué imprime §a = [[1,2],[3,4]]; b = a[:]; b[0].append(9); print(a)§ y por qué?', '§[[1, 2, 9], [3, 4]]§: §a[:]§ es una copia superficial, las listas internas son las mismas.'],
      ['¿Qué riesgo tiene §def f(n, cache={})§?', 'El diccionario por defecto se crea una sola vez y se comparte entre todas las llamadas; se usa §cache=None§ y se crea dentro.'],
      ['¿Qué complejidad tiene una recursión que usa §v[1:]§ en cada llamada?', '§O(n²)§: cada corte copia §n − 1§ elementos y hay §n§ llamadas (§n(n−1)/2§ copias).'],
      ['¿Por qué una recursión muy profunda falla en Python aunque sea correcta?', 'El límite de profundidad por defecto (~1000) provoca §RecursionError§; Python no optimiza recursión de cola y a veces conviene iterar.']
    ],
    resumen: R`
- **Valor mutable por defecto** → compartido: usa §None§.
- **§a[:]§ es copia superficial**: lo anidado se comparte.
- **~1000** llamadas máx. → §RecursionError§; Python no optimiza la cola.
- **§v[1:]§** copia §n − 1§ elementos (recursión §O(n²)§); **§pop(0)§** y **§x in lista§** son §O(n)§.
- Siempre: caso base, §return§, §is None§, reasignar la raíz.`
  });

  B.tema({
    id: 'ad-parcial', area: 'ad', titulo: 'Cómo responder una pregunta tipo parcial', fuente: 'Parcial 1 del profesor (estructuras_de_datos_p1.pdf) y criterios de S2-C1/S2-C2', nivel: 8, comp: true,
    conceptos: ['in_analisis', 'in_justificar'], interactivo: [],
    definicion: R`
El parcial del profesor (Parcial 1, primer corte) fija el **estilo de respuesta** que se espera en toda la asignatura:

- **5 preguntas de 1,0** (5,0 en total), 120 minutos, individual.
- **Toda respuesta debe estar justificada**: una complejidad sin argumento, o un resultado sin trazado, **no recibe puntaje completo**.
- Programación: **Python legible** con nombres significativos y **sin usar funciones de la biblioteca estándar que resuelvan el ejercicio**.
- Al reportar una complejidad, indicar **siempre respecto de qué variable (§n§, §k§…) y de qué caso** (mejor, peor o promedio).

Esta ficha convierte esos criterios en un procedimiento para cada **tipo de pregunta**.`,
    intuicion: R`
El profesor no califica solo el resultado: califica **tu razonamiento**. «La justificación vale más que la marca», dice el enunciado de verdadero/falso. Responde como si le explicaras a alguien que **no ve tu cabeza**: afirma, justifica en una frase con la **regla o propiedad** que usas y, si aplica, muestra el **cálculo**.

Un buen examen tiene tres cosas: **respuesta**, **razón** y **evidencia** (traza, tabla, constantes §c§ y §n₀§, contraejemplo).`,
    formal: R`
**Tipos de pregunta del Parcial 1 y cómo responderlos**

| Tipo | Qué piden | Cómo responder |
|---|---|---|
| **1. V/F con justificación** (0,2 c/u) | decidir y justificar **en una frase** | marca V/F **y** da la propiedad: «falso: §a[:]§ es copia superficial» |
| **2. Tabla de complejidades** (0,2 por fila) | peor caso de cada operación; **amortizado** donde corresponda | llena todas las celdas; marca «amortizado» explícitamente; justifica las **2 filas menos evidentes** |
| **3. Complejidad de funciones** | §T(n)§ del peor caso **y la regla usada** | di la regla: **suma**, **producto** o **costo oculto** de una operación de Python |
| **4. Algoritmo en literales** (trazado + vector + programación + explicación) | trazar, escribir el resultado, implementar en §O(n)§, explicar por qué el §while§ anidado es §O(n)§ | tabla de trazado completa; código legible; **argumento amortizado** |
| **5. Programación con casos borde** | implementar con **lista vacía**, valor en la cabeza/medio/final y ausente; dibujar enlaces; dar complejidad | cubre **todos** los casos; no uses listas auxiliares si lo prohíben; justifica por qué no puede ser §O(1)§ |

**Criterios de puntaje que se repiten:** solución correcta pero §O(n²)§ cuando se pedía §O(n)§ ⇒ **la mitad** del puntaje; la **justificación** vale más que la marca; indicar **variable y caso** de la complejidad.`,
    procedimiento: R`
**Plantilla para justificar una complejidad** (úsala siempre):

1. **Define §n§** («§n = len(A)§»).
2. **Cuenta o identifica la regla**: ciclo simple §O(n)§; anidados dependientes §n(n−1)/2§; índice que se **duplica/divide** §O(log n)§; bloques consecutivos → **mayor**.
3. **Revisa costos ocultos** (§in§ en lista §O(n)§, §insert(0, …)§…).
4. **Escribe la conclusión con variable y caso**: «**§O(n²)§ en el peor caso respecto de §n = len(A)§**, por la regla del producto».

**Plantilla para «¿por qué es §O(n)§ aunque haya un §while§ dentro de un §for§?»** (argumento amortizado): «cada elemento **entra una vez y sale a lo sumo una vez** de la pila; el §while§ total hace §≤ n§ desapilados a lo largo de **todo** el §for§, luego el costo total es §O(n)§ y no §O(n²)§.»

**Plantilla para programación con casos borde:** (1) lista **vacía**, (2) **un** elemento, (3) valor en la **cabeza**, el **medio** y el **final**, (4) valor **ausente**, (5) entradas **ya ordenadas / decrecientes**.`,
    codigo: {
      titulo: 'Las tres funciones de la pregunta 3 del Parcial 1, con cuentas y pila monótona de la pregunta 4',
      src: R`
def f(A):                                  # (a): bloque O(n) + bloque O(n^2) -> regla de la suma y del producto
    n = len(A)
    s = 0
    ops = [0, 0]
    for x in A:
        s += x
        ops[0] += 1
    for i in range(n):
        for j in range(n):
            s += A[i] * A[j]
            ops[1] += 1
    return s, ops

def g(n):                                  # (b): j se duplica -> ceil(log2 n) vueltas
    j = 1
    c = 0
    while j < n:
        j *= 2
        c += 1
    return c

def h(A):                                  # (c): "x not in vistos" recorre la lista -> costo oculto
    vistos = []
    comparaciones = 0
    for x in A:
        esta = False
        for y in vistos:
            comparaciones += 1
            if y == x:
                esta = True
                break
        if not esta:
            vistos.append(x)
    return vistos, comparaciones

print("f:", f(list(range(10)))[1], f(list(range(20)))[1])       # [10, 100] [20, 400]
print("g:", g(8), g(1000), g(1024))                                # 3 10 10
print("h:", h(list(range(50)))[1], h(list(range(100)))[1])       # 1225 4950 (cuadrático)

def dias_hasta_mas_calido(T):               # pila monótona: O(n) amortizado
    R = [0] * len(T)
    pila = []                               # guarda ÍNDICES, de base a tope con temperaturas decrecientes
    for i in range(len(T)):
        while pila and T[i] > T[pila[-1]]:
            j = pila.pop()
            R[j] = i - j
        pila.append(i)
    return R

print(dias_hasta_mas_calido([73, 74, 75, 71, 69, 72, 76]))     # [1, 1, 4, 2, 1, 1, 0]
print(dias_hasta_mas_calido([5, 4, 3, 2, 1]))                  # orden decreciente: [0, 0, 0, 0, 0]
`,
      esperado: 'f: [10, 100] [20, 400]\ng: 3 10 10\nh: 1225 4950\n[1, 1, 4, 2, 1, 1, 0]\n[0, 0, 0, 0, 0]'
    },
    ejemplo: R`
**Pregunta 3 del parcial — respuestas modelo:**

- **(a) §f(A)§**: bloque 1 (§for x in A§) §O(n)§; bloque 2 (dos ciclos de §n§) §O(n²)§. **Regla de la suma**: §O(n) + O(n²) = O(n²)§ **en el peor caso respecto de §n = len(A)§** (el producto de los ciclos anidados da §n·n§).
- **(b) §g(n)§**: §j§ se **duplica** (§j = 2ᵏ§) y termina cuando §2ᵏ ≥ n§: **§⌈log₂ n⌉§ vueltas** ⇒ **§O(log n)§** en el peor caso respecto de §n§.
- **(c) §h(A)§**: un solo ciclo visible, pero **§x not in vistos§ recorre la lista** (costo oculto de una operación de Python): §n·|vistos| ≤ n²§ ⇒ **§O(n²)§** en el peor caso (todos distintos). Con un §set§ sería §O(n)§.

**Pregunta 4 — pila monótona** con §T = [73, 74, 75, 71, 69, 72, 76]§:

| i | T[i] | Pila (índices, base → tope) | Posiciones resueltas |
|---|---|---|---|
| 0 | 73 | [0] | — |
| 1 | 74 | [1] | 0 |
| 2 | 75 | [2] | 1 |
| 3 | 71 | [2, 3] | — |
| 4 | 69 | [2, 3, 4] | — |
| 5 | 72 | [2, 5] | 4, 3 |
| 6 | 76 | [6] | 5, 2 |

**R = [1, 1, 4, 2, 1, 1, 0]**. Es §O(n)§ aunque haya un §while§ dentro de un §for§ porque **cada índice se apila una vez y se desapila a lo sumo una vez** (argumento amortizado: el total de iteraciones del §while§ es §≤ n§). Debe funcionar con la lista **decreciente** (todo ceros).`,
    complejidad: R`
- **Cómo se reporta**: siempre **«§O(…)§ en el peor caso respecto de §n§»** (o la variable que corresponda).
- **Pila monótona**: tiempo §O(n)§ amortizado, espacio §O(n)§ (la pila en el peor caso, entrada decreciente).
- **Plantillas de arriba**: cada una indica explícitamente **regla usada** (suma, producto, costo oculto, amortizado).
- **Puntaje**: una solución correcta pero §O(n²)§ cuando se pide §O(n)§ vale la **mitad**; sin justificación no hay puntaje completo.`,
    errores: R`
- **Dar la complejidad sin argumento** ni regla: no recibe puntaje completo.
- **No indicar variable ni caso** (§n§, §k§; mejor, peor, promedio).
- **Marcar V/F sin justificar**: la justificación vale más que la marca.
- **Dejar la tabla de complejidades sin marcar lo amortizado** donde corresponde.
- **Programar sin casos borde** (lista vacía, valor ausente, entrada decreciente).
- **Usar funciones de la biblioteca que resuelven el ejercicio** (si el enunciado lo prohíbe).
- **Ignorar el costo oculto** de una operación de Python al analizar.`,
    preguntas: [
      ['¿Qué debe llevar toda complejidad que reportes en el parcial?', 'La **justificación** (regla usada: suma, producto o costo oculto), la **variable** respecto de la cual se mide (§n§, §k§…) y el **caso** (mejor, peor o promedio).'],
      ['¿Cómo justificas que la pila monótona es §O(n)§ si hay un §while§ dentro de un §for§?', 'Argumento amortizado: cada índice se apila una vez y se desapila a lo sumo una vez, así que el total de iteraciones del §while§ a lo largo de todo el §for§ es §≤ n§: el costo total es §O(n)§.'],
      ['Da el resultado de la pila monótona para §[73, 74, 75, 71, 69, 72, 76]§.', '§R = [1, 1, 4, 2, 1, 1, 0]§.'],
      ['¿Qué casos borde debes cubrir en un ejercicio de programación?', 'Entrada vacía, un solo elemento, valor en la cabeza/medio/final, valor ausente y entradas ya ordenadas o decrecientes (según el problema).']
    ],
    resumen: R`
- Parcial: **5 × 1,0**, 120 min; **todo justificado**; Python legible, **sin** funciones de biblioteca que resuelvan el ejercicio.
- Complejidad = **resultado + regla + variable + caso**.
- Tabla de complejidades: marca **amortizado**; justifica las 2 filas menos evidentes.
- Programación: **casos borde**; §O(n²)§ en vez de §O(n)§ = mitad del puntaje.
- Pila monótona: §O(n)§ por argumento **amortizado**.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
