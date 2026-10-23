/* teoria_ar.js — Biblioteca: área Fundamentos de árboles (fuente: S6-C1, Árboles y recorridos, diap. 4-12, 23-25) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'ar-def', area: 'ar', titulo: 'Definición de árbol: raíz, nodos internos y hojas', fuente: 'S6-C1 · diap. 4-6, 25', nivel: 4, comp: true,
    conceptos: ['ar_def', 'ar_noarbol'], interactivo: [],
    definicion: R`
Un **árbol** es un **grafo dirigido acíclico** donde:

- hay **un nodo sin arista entrante**: la **raíz**;
- **cada otro nodo tiene exactamente un padre**;
- **ningún nodo se apunta a sí mismo**.

Clasificación de nodos: la **raíz** (sin padre), los **nodos internos** (tienen hijos) y las **hojas** (sin hijos). **Un árbol con §N§ nodos tiene exactamente §N − 1§ aristas.**`,
    intuicion: R`
Un árbol modela **jerarquías**: el organigrama de una empresa, las carpetas de tu computador, las jugadas posibles de un juego. Las estructuras lineales (arreglo, lista, pila, cola) tienen **un sucesor** por elemento; en un árbol cada elemento puede tener **varios sucesores** (hijos), pero **un solo predecesor** (padre).

Por eso un árbol es como un árbol genealógico **visto desde un ancestro**: del ancestro común (la raíz) bajan las ramas; cada persona tiene un solo padre en ese dibujo, nadie es su propio padre y no hay bucles de familia.

Una forma práctica de recordar el conteo de aristas: **cada nodo, excepto la raíz, llega con exactamente una arista desde su padre**; por eso §N − 1§.`,
    formal: R`
**Condiciones** (todas a la vez):

1. Existe **exactamente una raíz** (un único nodo con grado de entrada 0).
2. **Todo nodo distinto de la raíz tiene exactamente un padre** (grado de entrada 1).
3. **No hay ciclos** (en particular, ningún auto-ciclo): desde la raíz se alcanza **todo** nodo siguiendo aristas.

**Consecuencia:** §aristas = N − 1§ (las §N − 1§ aristas son los «enlaces al padre» de los nodos que no son raíz).

**Ejemplos de lo que NO es un árbol** (diapositiva 6):

| Caso | Por qué rompe la definición |
|---|---|
| **Auto-ciclo** | un nodo se apunta a sí mismo |
| **Dos padres** | un nodo recibe dos aristas entrantes |
| **Ciclo** | hay un camino que vuelve al mismo nodo |
| **Varias raíces** | más de un nodo sin padre (un bosque, no un árbol) |

[comp]
Un árbol es **un caso particular de grafo**: un grafo conexo **sin ciclos**. (La clase deja como tarea investigar por qué: si hay §N − 1§ aristas y es conexo, no puede haber ciclos; si hay un ciclo, sobra una arista.)
[/comp]`,
    procedimiento: R`
Para **decidir si un grafo dirigido es un árbol:**

1. **Cuenta nodos y aristas**: debe haber §N − 1§ aristas.
2. **Calcula el grado de entrada** de cada nodo: debe haber **exactamente uno con 0** (la raíz) y **todos los demás con 1**.
3. Descarta **auto-ciclos** (aristas §(x, x)§).
4. **Recorre desde la raíz** y verifica que se alcanzan **todos** los nodos (si no, hay un ciclo aparte o un componente suelto).
5. Si todo se cumple, es un árbol; si algo falla, indica **cuál** de las cuatro causas (auto-ciclo, dos padres, ciclo, varias raíces).`,
    codigo: {
      titulo: 'Comprobar la definición de árbol sobre una lista de aristas (padre, hijo)',
      src: R`
def es_arbol(nodos, aristas):
    entrantes = {n: 0 for n in nodos}
    hijos = {n: [] for n in nodos}
    for p, h in aristas:
        if p == h:
            return False, "auto-ciclo"
        entrantes[h] += 1
        hijos[p].append(h)
    raices = [n for n in nodos if entrantes[n] == 0]
    if len(raices) != 1:
        return False, "debe haber exactamente una raíz (hay " + str(len(raices)) + ")"
    if any(entrantes[n] > 1 for n in nodos):
        return False, "un nodo tiene dos padres"
    visitados = []
    pila = [raices[0]]
    while pila:
        n = pila.pop()
        visitados.append(n)
        for h in hijos[n]:
            pila.append(h)
    if len(visitados) != len(nodos):
        return False, "no todos los nodos se alcanzan desde la raíz (hay un ciclo aparte)"
    return True, "es un árbol: raíz " + raices[0] + " y " + str(len(aristas)) + " aristas = N - 1"

A = ["A", "B", "C", "D", "E", "F"]
print(es_arbol(A, [("A", "B"), ("A", "C"), ("B", "D"), ("B", "E"), ("C", "F")]))
print(es_arbol(["A", "B"], [("A", "A"), ("A", "B")]))
print(es_arbol(["A", "B", "C", "D"], [("A", "B"), ("A", "C"), ("B", "D"), ("C", "D")]))
print(es_arbol(["A", "B", "C"], [("A", "B"), ("B", "C"), ("C", "A")]))
print(es_arbol(["A", "B", "C", "D"], [("A", "B"), ("C", "D")]))
print(es_arbol(["A", "B", "C", "D"], [("A", "B"), ("C", "D"), ("D", "C")]))
`,
      esperado: "(True, 'es un árbol: raíz A y 5 aristas = N - 1')\n(False, 'auto-ciclo')\n(False, 'un nodo tiene dos padres')\n(False, 'debe haber exactamente una raíz (hay 0)')\n(False, 'debe haber exactamente una raíz (hay 2)')\n(False, 'no todos los nodos se alcanzan desde la raíz (hay un ciclo aparte)')"
    },
    ejemplo: R`
**El primer caso del código** (§A, B, C, D, E, F§ con aristas §A→B, A→C, B→D, B→E, C→F§):

- **Raíz:** §A§ (grado de entrada 0).
- **Nodos internos:** §A§, §B§, §C§ (tienen hijos).
- **Hojas:** §D§, §E§, §F§.
- **Aristas:** 5 = §6 − 1§ ✔.

**Los cuatro contraejemplos:**

| Aristas | Por qué no es árbol |
|---|---|
| §A→A§, §A→B§ | **auto-ciclo** |
| §A→B§, §A→C§, §B→D§, §C→D§ | **dos padres** (D) |
| §A→B§, §B→C§, §C→A§ | **ciclo** (ni siquiera hay raíz) |
| §A→B§, §C→D§ | **varias raíces** (A y C) |

**Un caso sutil (sexta línea):** §A→B§ y §C↔D§: hay solo una raíz (§A§) y ningún nodo tiene dos padres, pero §C§ y §D§ forman un **ciclo aparte**: desde la raíz **no se alcanzan** todos los nodos. Contar aristas ayuda: aquí son 3 = §4 − 1§, **pero** no es árbol; por eso hay que revisar también la conectividad.`,
    complejidad: R`
- **Verificar la definición** con listas de aristas: §O(N + E)§ (una pasada para calcular grados y un recorrido desde la raíz) y con §E = N − 1§ es §O(N)§.
- **Espacio**: §O(N)§ (grados e hijos).
- **Justificación de §N − 1§ aristas:** se construye el árbol añadiendo un nodo cada vez, conectándolo a su padre con **una** arista; el primer nodo (la raíz) no necesita arista, así que hay §N − 1§.
- **Contar aristas no basta** para decidir si es árbol (sexta línea): es una condición **necesaria**, no suficiente.`,
    errores: R`
- **Dibujar dos flechas hacia un mismo nodo** y seguir llamándolo árbol: «dos padres» rompe la definición.
- **Aceptar un grafo con ciclos** porque «parece un árbol».
- **Confundir «hoja» con «nodo sin padre»**: la hoja no tiene **hijos**; la raíz no tiene **padre**.
- **Contar mal las aristas**: son §N − 1§ (no §N§).
- **Creer que un árbol puede tener varias raíces**: eso es un **bosque**.
- **Pensar que «árbol» exige que cada nodo tenga dos hijos**: eso es un árbol binario lleno; un nodo puede tener 0, 1 o varios hijos.`,
    preguntas: [
      ['Define raíz, nodo interno y hoja. ¿Cuántas aristas tiene un árbol de §N§ nodos?', 'Raíz: el único nodo sin padre. Nodo interno: tiene al menos un hijo. Hoja: no tiene hijos. Un árbol de §N§ nodos tiene exactamente **§N − 1§** aristas.'],
      ['Menciona cuatro situaciones que rompen la definición de árbol.', '**Auto-ciclo**, **dos padres** (un nodo con dos aristas entrantes), **ciclo** y **varias raíces**.'],
      ['¿Cuántas aristas tiene un árbol de 50 nodos y por qué?', '49: cada nodo excepto la raíz tiene exactamente una arista que lo une con su padre.'],
      ['¿Por qué un árbol es un caso particular de grafo?', 'Porque es un grafo dirigido (o no dirigido y conexo) **sin ciclos**; cumple además la restricción de una sola raíz y un padre por nodo.']
    ],
    resumen: R`
- **Árbol** = grafo dirigido acíclico: **una raíz**, **un padre por nodo**, **sin auto-ciclos**.
- **Raíz** (sin padre), **interno** (con hijos), **hoja** (sin hijos).
- **§N§ nodos ⇒ §N − 1§ aristas.**
- No son árboles: auto-ciclo, dos padres, ciclo, varias raíces.
- Contar aristas es necesario, no suficiente: revisa también grados y conectividad.`
  });

  B.tema({
    id: 'ar-vocab', area: 'ar', titulo: 'Vocabulario: profundidad, nivel y altura', fuente: 'S6-C1 · diap. 7, 9, 23-25', nivel: 4,
    conceptos: ['ar_vocab', 'ar_profalt'], interactivo: ['ar-alturas'],
    definicion: R`
Relaciones de **familia**: **padre** (predecesor, a lo sumo uno), **hijo** (sucesor, 0, 1 o varios), **hermano** (otro nodo con el mismo padre), **abuelo** (el padre del padre), **ancestro** y **descendiente** (nodos en el camino hacia la raíz / hacia las hojas).

- **Profundidad(n)**: número de **aristas de la raíz a §n§** (la raíz tiene profundidad 0). Es igual al **nivel** de §n§.
- **Altura(n)**: número de **aristas de §n§ a la hoja más lejana** (las hojas tienen altura 0).
- La **altura del árbol** es la altura de su raíz.`,
    intuicion: R`
**Profundidad** mira **hacia arriba**: «¿a cuántos pasos estoy de la raíz?». **Altura** mira **hacia abajo**: «¿a cuántos pasos queda mi hoja más lejana?».

En un edificio: el piso en el que estás (contado desde la planta baja) es tu **profundidad**; cuántos pisos tiene por encima el edificio es la **altura** de la planta baja. La profundidad de un nodo no cambia aunque el árbol crezca hacia abajo; la altura de la raíz sí.

La confusión típica es mezclarlas: **profundidad = desde la raíz; altura = hacia las hojas**.`,
    formal: R`
**Definiciones** (la clase cuenta **aristas**, no nodos):

~~~
profundidad(raíz) = 0         profundidad(hijo) = profundidad(padre) + 1
altura(hoja)      = 0         altura(n) = 1 + máx(altura(hijos de n))
altura del árbol  = altura(raíz)
~~~

- **Nivel** de un nodo = su profundidad. Hay un nivel 0 (la raíz), un nivel 1…
- **Altura = número de niveles − 1** (el nivel más hondo es el de profundidad máxima).
- **Convención con árbol vacío:** altura §−1§ (cuando se define la altura recursivamente con §None§; ver [[av-factor]]).

**Nota de la clase:** algunos textos cuentan los niveles desde 1 y dirían «altura = 4»; **aquí se cuentan aristas**. Con el árbol del ejemplo: §prof(A) = 0§, §prof(B) = 1§, §prof(H) = 3§; §alt(hoja) = 0§, §alt(A) = 3 = altura del árbol§.`,
    procedimiento: R`
**Para calcular profundidades y alturas en un árbol dibujado:**

1. **Profundidad**: empieza con la raíz = 0 y suma 1 por cada arista que bajas.
2. **Altura**: marca las **hojas** con 0 y sube: la altura de cada nodo es **1 + el máximo de la altura de sus hijos**.
3. **Altura del árbol** = altura de la raíz = **profundidad máxima**.
4. Comprueba la **relación** §profundidad(n) + altura(n) ≤ altura del árbol§ para cada nodo (igualdad si §n§ está en un camino más largo).
5. Si el enunciado cuenta niveles desde 1, **resta 1** (o aclara qué convención usas).`,
    codigo: {
      titulo: 'Profundidad y altura de cada nodo (preorden con profundidad como argumento)',
      src: R`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

def altura(n):
    if n is None:
        return -1                      # árbol vacío: -1; una hoja da 1 + max(-1, -1) = 0
    return 1 + max(altura(n.izq), altura(n.der))

def mostrar(n, prof):
    if n is None:
        return
    print(n.valor, "profundidad =", prof, "| altura =", altura(n))
    mostrar(n.izq, prof + 1)
    mostrar(n.der, prof + 1)

a = NodoArbol("A")
a.izq = NodoArbol("B")
a.der = NodoArbol("C")
a.izq.izq = NodoArbol("D")
a.izq.der = NodoArbol("E")
a.der.der = NodoArbol("F")
a.izq.izq.izq = NodoArbol("G")
a.izq.izq.der = NodoArbol("H")
mostrar(a, 0)
print("altura del árbol:", altura(a))
`,
      esperado: 'A profundidad = 0 | altura = 3\nB profundidad = 1 | altura = 2\nD profundidad = 2 | altura = 1\nG profundidad = 3 | altura = 0\nH profundidad = 3 | altura = 0\nE profundidad = 2 | altura = 0\nC profundidad = 1 | altura = 1\nF profundidad = 2 | altura = 0\naltura del árbol: 3'
    },
    ejemplo: R`
**El árbol del código:**

~~~
            A
          /   \
         B     C
        / \     \
       D   E     F
      / \
     G   H
~~~

| Nodo | Profundidad (nivel) | Altura |
|---|---|---|
| A | 0 | 3 |
| B, C | 1 | 2, 1 |
| D, E, F | 2 | 1, 0, 0 |
| G, H | 3 | 0, 0 |

- **Altura del árbol = 3** (el camino §A → B → D → G§ tiene 3 aristas; con niveles contados desde 1 diríamos «4»).
- **Relaciones:** §B§ y §C§ son **hermanos**; §A§ es **abuelo** de §D§, §E§ y §F§; §A§ y §B§ son **ancestros** de §H§; §G§, §H§ son **descendientes** de §D§.
- **Hojas:** §G, H, E, F§ (altura 0).

El ejemplo interactivo de abajo construye un árbol con **13 nodos**: observa que cada nodo muestra su altura guardada y puedes tocar un nodo para ver qué línea del código lo creó.`,
    complejidad: R`
- **Calcular la altura de un nodo** recorriendo su subárbol: §O(tamaño del subárbol)§; **altura de todo el árbol**: §O(N)§ (se visita cada nodo una vez).
- Mostrar **todas las alturas** como en el código (recalculando §altura(n)§ en cada nodo) es §O(N·h)§ en el peor caso; guardando la altura en el nodo (como hace el AVL, ver [[av-factor]]) baja a §O(N)§.
- **Espacio de pila** del cálculo recursivo: §O(h)§ (altura del árbol).
- **Relación con la eficiencia:** un árbol de §N§ nodos tiene altura entre **~log₂ N** (balanceado) y **§N − 1§** (degenerado). Las operaciones de los BST cuestan §O(h)§ (ver [[bs-complejidad]]).`,
    errores: R`
- **Confundir profundidad (desde la raíz) con altura (hacia las hojas).**
- **Contar nodos en vez de aristas**: una hoja tiene altura 0, no 1; la raíz tiene profundidad 0, no 1.
- **Olvidar la convención del árbol vacío** (§−1§) al escribir la altura recursiva: una hoja debe dar 0.
- **Decir «la altura del árbol es la del nodo más hondo»** sin precisar: es la **altura de la raíz** (= profundidad máxima).
- **Mezclar convenciones** (niveles desde 1 y desde 0) en la misma respuesta.
- **Creer que §B§ y §E§ son hermanos** solo por estar al mismo nivel: hermano = **mismo padre**.`,
    preguntas: [
      ['Diferencia profundidad y altura con un ejemplo.', 'Profundidad(n) = aristas de la raíz a §n§ (raíz = 0); altura(n) = aristas de §n§ a su hoja más lejana (hoja = 0). En el árbol del ejemplo, §H§ tiene profundidad 3 y altura 0; §A§ tiene profundidad 0 y altura 3.'],
      ['¿Cuál es la altura de una hoja? ¿Y de un árbol vacío (en la convención recursiva)?', 'La de una hoja es **0**; la del árbol vacío es **−1**, de modo que la fórmula §1 + máx(altura(izq), altura(der))§ da 0 en una hoja.'],
      ['¿Qué significa que «algunos textos cuenten niveles desde 1»?', 'Que dirían altura = número de **niveles** (4 en el árbol de ejemplo); en este curso se cuentan **aristas**, así que la altura es 3.'],
      ['Define hermano, abuelo, ancestro y descendiente.', 'Hermano: otro nodo con el mismo padre. Abuelo: el padre del padre. Ancestro: nodo en el camino hacia la raíz. Descendiente: nodo en el camino hacia las hojas.']
    ],
    resumen: R`
- **Profundidad(n)** = aristas desde la raíz (raíz 0) = **nivel**.
- **Altura(n)** = aristas hasta la hoja más lejana (hoja 0). **Altura del árbol** = altura de la raíz.
- Fórmula: §altura(n) = 1 + máx(altura(hijos))§, vacío = −1.
- Se cuentan **aristas**; con niveles desde 1 la «altura» sale 1 más.
- Hermano = mismo padre; abuelo = padre del padre.`
  });

  B.tema({
    id: 'ar-subarbol', area: 'ar', titulo: 'Subárboles y la estructura recursiva del árbol', fuente: 'S6-C1 · diap. 8, 17', nivel: 4,
    conceptos: ['ar_subarbol'], interactivo: ['ar-alturas'],
    definicion: R`
Cualquier **nodo junto con todos sus descendientes** forma un **subárbol**. Por eso un árbol es una **estructura recursiva**: una raíz con sus subárboles **izquierdo** y **derecho**, que a su vez son árboles. **Incluso una hoja es un subárbol**: una raíz sin hijos.

Esta recursión es la que hace naturales los **recorridos** y casi todos los algoritmos sobre árboles.`,
    intuicion: R`
Cuando miras una carpeta de tu computador, dentro de ella hay otras carpetas, y cada una es «una carpeta con sus carpetas»: lo mismo en cualquier nivel. Un árbol es igual: **tomar cualquier nodo y mirar hacia abajo es ver otro árbol más pequeño**.

Eso te permite **resolver problemas de árboles con una frase**: «el resultado del árbol = combinar el nodo con el resultado del subárbol izquierdo y el del derecho». El caso base es el árbol vacío (o la hoja). Una vez que lo ves así, tamaño, altura, conteo de hojas, recorridos y búsquedas se escriben en 3-4 líneas.`,
    formal: R`
**Definición recursiva** (árbol binario): un árbol binario es **vacío** (§None§) o una **raíz** con un subárbol izquierdo y un subárbol derecho, que son árboles binarios.

**Plantillas recursivas** (con caso base el árbol vacío):

~~~
tamaño(T)  = 0                                          si T es vacío
           = 1 + tamaño(T.izq) + tamaño(T.der)          en otro caso

altura(T)  = −1                                         si T es vacío
           = 1 + máx(altura(T.izq), altura(T.der))      en otro caso

hojas(T)   = 0 si es vacío; 1 si no tiene hijos; hojas(T.izq) + hojas(T.der) en otro caso
~~~

- Cada **llamada recursiva** corresponde a **bajar a un subárbol**.
- El **caso base** «nodo es §None§» es **obligatorio** en los recorridos: olvidarlo produce §AttributeError§ (acceso a §None.izq§).
- La **profundidad de la recursión** es la **altura** del árbol (espacio de pila §O(h)§).`,
    procedimiento: R`
Para escribir una **función recursiva sobre un árbol:**

1. **Caso base**: ¿qué devuelve para el árbol vacío (§None§)? (0 para tamaño, −1 para altura, §[]§ para recorridos).
2. **Subproblemas**: llama a la función sobre §n.izq§ y §n.der§ (los subárboles).
3. **Combina**: usa el valor del nodo y los dos resultados (§1 + izq + der§, §1 + máx(izq, der)§…).
4. **Devuelve** el resultado.
5. Comprueba con tres casos: **árbol vacío**, **una hoja** y un árbol con un solo hijo.`,
    codigo: {
      titulo: 'Tamaño, altura y hojas por recursión sobre subárboles',
      src: R`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

def tamano(n):
    if n is None:
        return 0
    return 1 + tamano(n.izq) + tamano(n.der)

def altura(n):
    if n is None:
        return -1
    return 1 + max(altura(n.izq), altura(n.der))

def hojas(n):
    if n is None:
        return 0
    if n.izq is None and n.der is None:
        return 1
    return hojas(n.izq) + hojas(n.der)

a = NodoArbol("A")
a.izq = NodoArbol("B")
a.der = NodoArbol("C")
a.izq.izq = NodoArbol("D")
a.izq.der = NodoArbol("E")
a.der.der = NodoArbol("F")
a.izq.izq.izq = NodoArbol("G")
a.izq.izq.der = NodoArbol("H")

print("árbol completo      :", tamano(a), altura(a), hojas(a))
print("subárbol de B       :", tamano(a.izq), altura(a.izq), hojas(a.izq))
print("subárbol de D       :", tamano(a.izq.izq), altura(a.izq.izq), hojas(a.izq.izq))
print("una hoja (E)        :", tamano(a.izq.der), altura(a.izq.der), hojas(a.izq.der))
print("árbol vacío (None)  :", tamano(None), altura(None), hojas(None))
`,
      esperado: 'árbol completo      : 8 3 4\nsubárbol de B       : 5 2 3\nsubárbol de D       : 3 1 2\nuna hoja (E)        : 1 0 1\nárbol vacío (None)  : 0 -1 0'
    },
    ejemplo: R`
**§tamano(A)§ paso a paso** (cada llamada resuelve un subárbol):

~~~
tamano(A) = 1 + tamano(B) + tamano(C)
tamano(B) = 1 + tamano(D) + tamano(E)
tamano(D) = 1 + tamano(G) + tamano(H) = 1 + 1 + 1 = 3        (G, H son hojas)
tamano(E) = 1
tamano(B) = 1 + 3 + 1 = 5
tamano(C) = 1 + tamano(None) + tamano(F) = 1 + 0 + 1 = 2
tamano(A) = 1 + 5 + 2 = 8
~~~

- El **subárbol de §B§** contiene §B, D, E, G, H§: 5 nodos, altura 2.
- El **subárbol de §E§** es una hoja: tamaño 1, altura 0. «Incluso una hoja es un subárbol».
- El **árbol vacío** tiene tamaño 0 y altura −1.

Con el ejemplo interactivo puedes ver cómo se construye un árbol de **13 nodos** y qué líneas crean cada nodo (los subárboles se van «colgando» uno a uno).`,
    complejidad: R`
- **§tamano§, §altura§, §hojas§**: cada nodo se visita **una vez** (más una llamada por cada hijo vacío) ⇒ **§O(N)§** en tiempo.
- **Espacio de pila**: la profundidad de la recursión es la **altura** ⇒ §O(h)§: §O(log N)§ en un árbol balanceado, §O(N)§ en uno degenerado (por eso a veces conviene un DFS iterativo).
- Justificación por la regla de la clase: **(número de llamadas) × (trabajo por llamada)** = §(2N + 1) × O(1)§: hay §N§ llamadas sobre nodos y §N + 1§ sobre hijos vacíos.
- Las operaciones sobre un solo camino (búsqueda en un BST) cuestan §O(h)§ porque solo se baja por **un** subárbol en cada llamada.`,
    errores: R`
- **Olvidar el caso base §n is None§**: produce §AttributeError§ al acceder a §None.izq§.
- **Devolver 0 en la altura del árbol vacío**: con 0 una hoja saldría con altura 1; el vacío debe ser −1 (o la hoja debe tratarse como caso especial).
- **Pensar que un subárbol necesita tener hijos**: una hoja también lo es.
- **Confundir subárbol con «hijo»**: el subárbol de §B§ incluye **todos** sus descendientes.
- **Usar recursión en árboles muy profundos** y desbordar la pila; a veces conviene DFS iterativo con pila.
- **Olvidar combinar con el nodo actual** (sumar el 1 de §1 + izq + der§).`,
    preguntas: [
      ['¿Por qué se dice que un árbol es una estructura recursiva?', 'Porque cualquier nodo con todos sus descendientes forma un subárbol, que es a su vez un árbol: un árbol es una raíz con un subárbol izquierdo y uno derecho. Incluso una hoja es un subárbol (raíz sin hijos).'],
      ['Escribe la fórmula recursiva del tamaño de un árbol binario.', '§tamaño(T) = 0§ si §T§ es vacío; §tamaño(T) = 1 + tamaño(T.izq) + tamaño(T.der)§ en otro caso.'],
      ['¿Qué complejidad en tiempo y espacio tiene calcular la altura recursivamente?', 'Tiempo §O(N)§ (visita cada nodo una vez); espacio de pila §O(h)§ (profundidad de la recursión = altura).'],
      ['¿Qué error aparece si olvidas el caso base §nodo is None§ en un recorrido?', '§AttributeError§: se intenta acceder a un atributo de §None§ (por ejemplo §None.izq§) al llegar al final de una rama.']
    ],
    resumen: R`
- **Subárbol** = nodo + todos sus descendientes; una **hoja** también lo es.
- Árbol = **raíz + subárbol izquierdo + subárbol derecho** (estructura recursiva).
- Plantilla: caso base **vacío** + llamar a §izq§ y §der§ + combinar.
- Tamaño §1 + izq + der§ · altura §1 + máx(izq, der)§ (vacío −1).
- Tiempo §O(N)§, pila §O(h)§. Olvidar §is None§ ⇒ §AttributeError§.`
  });

  B.tema({
    id: 'ar-tipos', area: 'ar', titulo: 'Árboles binarios: lleno, completo y perfecto', fuente: 'S6-C1 · diap. 10-11, 23-25', nivel: 4, comp: true,
    conceptos: ['ar_tipos', 'ar_perfecto'], interactivo: [],
    definicion: R`
Un **árbol binario** es un árbol donde cada nodo tiene **a lo sumo 2 hijos** (izquierdo y derecho). Se clasifican en:

| Tipo | Propiedad |
|---|---|
| **Lleno** (*full*) | cada nodo tiene **0 o 2 hijos** (nunca 1) |
| **Completo** | todos los niveles están llenos **salvo quizá el último**, que se llena **de izquierda a derecha** |
| **Perfecto** | todos los internos tienen **2 hijos** y **todas las hojas están al mismo nivel** |

**Dato clave:** un árbol perfecto de altura §h§ tiene exactamente **§2^(h+1) − 1§ nodos**. Por eso un árbol balanceado guarda §n§ elementos con altura ∼ §log₂ n§: la base de la eficiencia de los árboles de búsqueda y los *heaps*.`,
    intuicion: R`
- **Lleno**: nadie se queda con «un solo hijo»: o es hoja o tiene la pareja completa.
- **Completo**: es como llenar un teatro fila por fila de izquierda a derecha: todas las filas llenas menos quizá la última, y en ella **no hay huecos intermedios**.
- **Perfecto**: el teatro **totalmente lleno**: todas las filas completas.

Todo árbol **perfecto** es completo y lleno. Pero un árbol **lleno** no tiene por qué ser completo (puede tener huecos a la izquierda en el último nivel), y uno **completo** no tiene por qué ser lleno (un nodo puede tener solo un hijo, el izquierdo).`,
    formal: R`
**Ejemplos de la clase** (diapositiva 11):

~~~
Lleno             Completo          Perfecto
   A                 A                 A
  / \               / \               / \
 B   C             B   C             B   C
    / \           / \  /            / \ / \
   F   G         D   E F           D  E F  G
~~~

- **Lleno** (izquierda): cada nodo tiene 0 o 2 hijos. **No es completo**: el último nivel tiene huecos a la izquierda (bajo §B§).
- **Completo** (centro): niveles llenos salvo el último, cubierto de izquierda a derecha. **No es lleno**: §C§ tiene un solo hijo.
- **Perfecto** (derecha): internos con 2 hijos y hojas al mismo nivel.

**Relaciones:** perfecto ⇒ completo y lleno. Hay árboles llenos que no son completos y completos que no son llenos.

**Nodos de un árbol binario de altura §h§:** mínimo §h + 1§ (una cadena); máximo **§2^(h+1) − 1§** (perfecto). De ahí:

~~~
n ≤ 2^(h+1) − 1     ⇒     h ≥ log₂(n + 1) − 1
~~~

[comp]
Para §n = 10⁶§ nodos, la altura **mínima** posible es §⌈log₂(10⁶ + 1)⌉ − 1 = 19§ (porque §2²⁰ − 1 = 1 048 575 ≥ 10⁶§). Un árbol balanceado de un millón de nodos tiene altura ≈ 20; uno degenerado, ≈ 999 999.
[/comp]`,
    procedimiento: R`
**Para clasificar un árbol binario:**

1. **Lleno**: recorre todos los nodos y verifica que **ninguno tenga exactamente un hijo**.
2. **Perfecto**: calcula la altura §h§ y cuenta los nodos; es perfecto **si y solo si** §n = 2^(h+1) − 1§.
3. **Completo**: haz un recorrido **por niveles** (de izquierda a derecha) incluyendo los huecos §None§: una vez que aparece un hueco, **no puede aparecer ningún nodo real después**.
4. Aplica las **relaciones**: si es perfecto, también es completo y lleno.
5. Para decidir cuántos nodos puede tener un árbol de altura §h§, usa **§h + 1 ≤ n ≤ 2^(h+1) − 1§**.`,
    codigo: {
      titulo: 'Predicados: ¿lleno, completo, perfecto?',
      src: R`
class NodoArbol:
    def __init__(self, valor, izq=None, der=None):
        self.valor = valor
        self.izq = izq
        self.der = der

def altura(n):
    return -1 if n is None else 1 + max(altura(n.izq), altura(n.der))

def contar(n):
    return 0 if n is None else 1 + contar(n.izq) + contar(n.der)

def es_lleno(n):
    if n is None:
        return True
    if (n.izq is None) != (n.der is None):       # exactamente un hijo: no es lleno
        return False
    return es_lleno(n.izq) and es_lleno(n.der)

def es_perfecto(n):
    return contar(n) == 2 ** (altura(n) + 1) - 1

def es_completo(raiz):
    cola = [raiz]
    vio_hueco = False
    while cola:
        n = cola.pop(0)
        if n is None:
            vio_hueco = True
        else:
            if vio_hueco:                         # un nodo real después de un hueco
                return False
            cola.append(n.izq)
            cola.append(n.der)
    return True

N = NodoArbol
lleno = N("A", N("B"), N("C", N("F"), N("G")))
completo = N("A", N("B", N("D"), N("E")), N("C", N("F")))
perfecto = N("A", N("B", N("D"), N("E")), N("C", N("F"), N("G")))

for nombre, t in [("lleno", lleno), ("completo", completo), ("perfecto", perfecto)]:
    print(nombre, "->", "lleno:", es_lleno(t), "| completo:", es_completo(t), "| perfecto:", es_perfecto(t))
print([2 ** (h + 1) - 1 for h in range(6)])
`,
      esperado: 'lleno -> lleno: True | completo: False | perfecto: False\ncompleto -> lleno: False | completo: True | perfecto: False\nperfecto -> lleno: True | completo: True | perfecto: True\n[1, 3, 7, 15, 31, 63]'
    },
    ejemplo: R`
**Los tres árboles de la clase** (resultado del código):

| Árbol | Lleno | Completo | Perfecto | Por qué |
|---|---|---|---|---|
| Lleno (§A(B, C(F, G))§) | sí | **no** | no | §B§ es hoja pero §C§ tiene hijos: el último nivel tiene huecos a la izquierda |
| Completo (§A(B(D, E), C(F))§) | **no** | sí | no | §C§ tiene un solo hijo |
| Perfecto (7 nodos, altura 2) | sí | sí | sí | §2³ − 1 = 7§ nodos y hojas al mismo nivel |

**Nodos máximos según la altura:** §h = 0 → 1§, §h = 1 → 3§, §h = 2 → 7§, §h = 3 → 15§, §h = 4 → 31§ (el código imprime §[1, 3, 7, 15, 31, 63]§ hasta §h = 5§).

**Pregunta de verificación:** «¿Cuántos nodos tiene un árbol binario perfecto de altura 3?» → §2⁴ − 1 = **15**§ nodos (1 + 2 + 4 + 8 por niveles).`,
    complejidad: R`
- **§es_lleno§, §es_perfecto§**: §O(N)§ en tiempo (recorren los nodos); espacio de pila §O(h)§.
- **§es_completo§**: §O(N)§ con una cola (recorrido por niveles); la cola puede llegar a contener §O(N)§ elementos.
- **Por qué un perfecto tiene §2^(h+1) − 1§ nodos:** el nivel §k§ tiene §2ᵏ§ nodos; sumando §1 + 2 + 4 + … + 2ʰ = 2^(h+1) − 1§ (serie geométrica).
- **Consecuencia para la eficiencia:** un árbol que mantiene su altura cerca de §log₂ n§ permite búsquedas en §O(log n)§; uno degenerado (altura §n − 1§) las degrada a §O(n)§.`,
    errores: R`
- **Confundir completo con lleno o perfecto**: son propiedades **distintas**.
- **Creer que «lleno» significa que todos los niveles están llenos**: eso es **perfecto**; lleno solo exige 0 o 2 hijos.
- **Decir que un árbol completo tiene todos los niveles llenos**: puede faltar parte del último, pero sin huecos intermedios y llenándose de izquierda a derecha.
- **Olvidar los huecos** al revisar «completo»: no basta contar nodos por nivel; importa el **orden**.
- **Pensar que todo árbol está balanceado**: un árbol degenerado tiene altura §n − 1§, no §log n§.
- **Usar §2^h − 1§** (cuenta niveles desde 1) con altura medida en aristas: la fórmula de la clase es §2^(h+1) − 1§.`,
    preguntas: [
      ['¿Cuántos nodos tiene un árbol binario perfecto de altura 3?', '§2^(3+1) − 1 = 15§ nodos (1 + 2 + 4 + 8).'],
      ['Diferencia árbol lleno, completo y perfecto.', 'Lleno: 0 o 2 hijos por nodo. Completo: niveles llenos salvo quizá el último, llenado de izquierda a derecha. Perfecto: internos con 2 hijos y hojas al mismo nivel (todo perfecto es lleno y completo).'],
      ['Da un árbol lleno que no sea completo y uno completo que no sea lleno.', 'Lleno no completo: §A(B, C(F, G))§ (huecos a la izquierda en el último nivel). Completo no lleno: §A(B(D, E), C(F))§ (§C§ tiene un solo hijo).'],
      ['¿Por qué un árbol balanceado guarda §n§ elementos con altura ≈ §log₂ n§?', 'Porque un árbol perfecto de altura §h§ tiene §2^(h+1) − 1§ nodos; despejando, §h ≈ log₂ n§. Un árbol balanceado se parece a uno perfecto: sus niveles crecen exponencialmente.']
    ],
    resumen: R`
- **Binario** = ≤ 2 hijos por nodo. **Lleno**: 0 o 2 hijos. **Completo**: niveles llenos salvo el último, de izq. a der. **Perfecto**: internos con 2 hijos y hojas al mismo nivel.
- **Perfecto ⇒ completo y lleno**; el recíproco no vale.
- Perfecto de altura §h§: **§2^(h+1) − 1§ nodos** (h=3 → 15).
- Balanceado ⇒ altura ≈ §log₂ n§; degenerado ⇒ §n − 1§.`
  });

  B.tema({
    id: 'ar-nodo', area: 'ar', titulo: 'El nodo en Python y cómo construir un árbol', fuente: 'S6-C1 · diap. 12', nivel: 4,
    conceptos: ['ar_nodo', 'ar_diagrama'], interactivo: ['ar-alturas'],
    definicion: R`
En Python un árbol binario se representa con **objetos nodo**: cada nodo guarda su **valor** y **dos referencias**, §izq§ (subárbol izquierdo) y §der§ (subárbol derecho), que valen §None§ cuando no hay hijo. El árbol entero se identifica con la **referencia a su raíz**.

~~~
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None      # subárbol izquierdo
        self.der = None      # subárbol derecho
~~~`,
    intuicion: R`
Cada nodo es una **cajita con tres compartimentos**: el dato y dos «flechas» (referencias) que apuntan a otras cajitas o a nada (§None§). El árbol no es más que cajitas apuntándose unas a otras; la única que necesitas guardar es la **raíz**, porque desde ella llegas a todo lo demás siguiendo flechas.

Construir un árbol a mano es **crear nodos y enganchar flechas**: §raiz.izq = NodoArbol(2)§ crea una cajita y la cuelga a la izquierda de la raíz. Por eso las asignaciones con puntos (§raiz.izq.der = …§) se leen «desde la raíz, baja a la izquierda, luego a la derecha, y engancha».`,
    formal: R`
- **Atributos**: §valor§ (dato), §izq§, §der§ (referencias a nodos o §None§).
- **Árbol vacío**: la referencia §None§ (no hay nodo).
- **Hoja**: nodo con §izq is None§ y §der is None§.
- **Identidad**: un árbol se **comparte por referencia**: dos variables pueden apuntar al mismo nodo (ver el error de «dos padres» en [[ar-def]]).
- **Notación anidada** de un árbol: §valor(subárbol izq, subárbol der)§, p. ej. §1(2(4,5),3)§.

**Árbol de la clase (diapositiva 12):**

~~~
        1
       / \
      2   3
     / \
    4   5
~~~

Se construye con: §raiz = NodoArbol(1)§; §raiz.izq = NodoArbol(2)§; §raiz.der = NodoArbol(3)§; §raiz.izq.izq = NodoArbol(4)§; §raiz.izq.der = NodoArbol(5)§.`,
    procedimiento: R`
**Para construir un árbol a mano:**

1. **Crea la raíz**: §raiz = NodoArbol(valor)§.
2. Para cada hijo: **crea el nodo y engánchalo** con §padre.izq = …§ o §padre.der = …§.
3. Para llegar a un nodo profundo, **encadena atributos** (§raiz.izq.der§ = hijo derecho del hijo izquierdo).
4. Verifica **dibujando** el árbol: cada flecha debe corresponder a una asignación.
5. **Imprime la notación anidada** con una función recursiva para comprobar.

**Para recorrer sin errores:** todo código que baje por §izq§ o §der§ debe protegerse con §if nodo is None: return§ ([[ar-subarbol]]).`,
    codigo: {
      titulo: 'Construir el árbol de la clase y mostrarlo en notación anidada',
      src: R`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None        # subárbol izquierdo
        self.der = None        # subárbol derecho

def a_nota(n):
    if n is None:
        return "_"
    if n.izq is None and n.der is None:
        return str(n.valor)
    sub = lambda x: "" if x is None else a_nota(x)
    return str(n.valor) + "(" + sub(n.izq) + "," + sub(n.der) + ")"

#       1
#      / \
#     2   3
#    / \
#   4   5
raiz = NodoArbol(1)
raiz.izq = NodoArbol(2)
raiz.der = NodoArbol(3)
raiz.izq.izq = NodoArbol(4)
raiz.izq.der = NodoArbol(5)

print(a_nota(raiz))                       # 1(2(4,5),3)
print(raiz.izq.der.valor)                 # 5: baja a la izquierda y luego a la derecha
print(raiz.der.izq is None, raiz.izq.izq.izq is None)   # True True: no tienen hijo ahí
`,
      esperado: '1(2(4,5),3)\n5\nTrue True'
    },
    ejemplo: R`
**Cada asignación y su efecto:**

| Instrucción | Qué crea / engancha |
|---|---|
| §raiz = NodoArbol(1)§ | nodo 1 (raíz), sin hijos |
| §raiz.izq = NodoArbol(2)§ | nodo 2 como hijo **izquierdo** de 1 |
| §raiz.der = NodoArbol(3)§ | nodo 3 como hijo **derecho** de 1 |
| §raiz.izq.izq = NodoArbol(4)§ | nodo 4 como hijo izquierdo de 2 |
| §raiz.izq.der = NodoArbol(5)§ | nodo 5 como hijo derecho de 2 |

**Preguntas de lectura:**

- §raiz.izq.der.valor§ → **5** (baja izquierda, luego derecha).
- §raiz.der.izq§ → **None** (el nodo 3 no tiene hijo izquierdo).
- Hojas: §4§, §5§ y §3§ (altura 0); la altura del árbol es 2.

**Ejemplo interactivo:** el programa construye un árbol de 13 nodos de esta misma forma; avanza paso a paso y verás aparecer cada nodo en el momento en que se ejecuta su asignación. Toca un nodo para ver las líneas que lo crearon y lo enlazaron.`,
    complejidad: R`
- **Crear un nodo** y **enganchar** una referencia: §O(1)§ cada uno.
- **Construir un árbol de §N§ nodos** a mano: §O(N)§ asignaciones.
- **Espacio**: §O(N)§ nodos, cada uno con tamaño constante (valor + 2 referencias).
- **Acceder a un nodo por su camino** (§raiz.izq.der§): §O(longitud del camino)§ = §O(profundidad)§.
- **Notación anidada** (§a_nota§): una llamada por nodo y por hijo vacío ⇒ §O(N)§.`,
    errores: R`
- **Olvidar poner §None§** en los hijos iniciales: el atributo no existe y aparece §AttributeError§.
- **Asignar el mismo nodo a dos padres**: se rompe la definición de árbol (dos padres) y los recorridos repiten nodos.
- **Perder la raíz** (§raiz = raiz.izq§) y no poder volver: guarda siempre la referencia a la raíz.
- **Acceder a §raiz.izq.izq§ sin comprobar** que §raiz.izq§ existe: §AttributeError§ si es §None§.
- **Confundir el valor con el nodo**: §raiz.izq§ es un **nodo** (o §None§), no un número; el número es §raiz.izq.valor§.
- **Olvidar el caso base §is None§** en los recorridos.`,
    preguntas: [
      ['Escribe la clase §NodoArbol§ y construye el árbol §1(2(4,5),3)§.', 'Clase con §valor§, §izq = None§, §der = None§. Luego: §raiz = NodoArbol(1)§; §raiz.izq = NodoArbol(2)§; §raiz.der = NodoArbol(3)§; §raiz.izq.izq = NodoArbol(4)§; §raiz.izq.der = NodoArbol(5)§.'],
      ['¿Qué vale §raiz.der.izq§ en ese árbol y por qué es importante?', '§None§: el nodo 3 no tiene hijo izquierdo. Por eso los recorridos necesitan el caso base §if nodo is None: return§; intentar acceder a un atributo de §None§ lanza §AttributeError§.'],
      ['¿Cómo se identifica un árbol completo en Python?', 'Con la **referencia a su raíz**; a partir de ella, siguiendo §izq§ y §der§, se alcanza cualquier nodo. El árbol vacío es §None§.'],
      ['¿Cuál es el espacio de un árbol de §N§ nodos?', '§O(N)§: cada nodo ocupa espacio constante (valor y dos referencias).']
    ],
    resumen: R`
- Nodo = **valor + §izq§ + §der§** (referencias o §None§). Árbol = referencia a la **raíz**; vacío = §None§.
- Construir = **crear nodos y enganchar** con §padre.izq = …§ / §padre.der = …§.
- §raiz.izq.der§: baja izquierda y luego derecha.
- Todo recorrido necesita el caso base **§is None§**.
- Un nodo con dos padres rompe la definición de árbol.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
