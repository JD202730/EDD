/* teoria_av.js — Biblioteca: área Árboles AVL (fuente: S7-C1, diap. 1-21, 34-39 y código de apoyo 42-44) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  /* Código de apoyo de la clase (S7-C1, d.42-43), común a varios temas. Con contador de rotaciones: añadido para poder contar. */
  const NODO = R`
class Nodo:
    def __init__(self, v):
        self.v = v
        self.izq = self.der = None
        self.altura = 0

def alt(n):                          # altura (-1 si el nodo es None)
    return n.altura if n else -1

def balance(n):                      # factor de equilibrio
    return alt(n.izq) - alt(n.der) if n else 0

def actualizar(n):                   # recalcula la altura desde los hijos
    n.altura = 1 + max(alt(n.izq), alt(n.der))

def N(v, izq=None, der=None):        # atajo para armar árboles a mano
    n = Nodo(v)
    n.izq = izq
    n.der = der
    actualizar(n)
    return n

def nota(n):                         # notación anidada: valor(izq,der)
    if n is None:
        return "_"
    if n.izq is None and n.der is None:
        return str(n.v)
    sub = lambda x: "" if x is None else nota(x)
    return str(n.v) + "(" + sub(n.izq) + "," + sub(n.der) + ")"
`;
  const ROTAR = R`
rotaciones = [0]                     # cuenta cuántas rotaciones simples se hacen

def rotar_derecha(y):                # corrige el caso Izq-Izq
    rotaciones[0] += 1
    x = y.izq
    t = x.der
    x.der = y
    y.izq = t
    actualizar(y)
    actualizar(x)
    return x                         # x sube como nueva raíz local

def rotar_izquierda(x):              # corrige el caso Der-Der
    rotaciones[0] += 1
    y = x.der
    t = y.izq
    y.izq = x
    x.der = t
    actualizar(x)
    actualizar(y)
    return y
`;
  const INSERTAR = R`
def insertar(n, v):
    if n is None:
        return Nodo(v)
    if v < n.v:
        n.izq = insertar(n.izq, v)
    elif v > n.v:
        n.der = insertar(n.der, v)
    else:
        return n                     # sin duplicados
    actualizar(n)
    b = balance(n)
    if b > 1 and v < n.izq.v:        # Izq-Izq (recta)
        return rotar_derecha(n)
    if b < -1 and v > n.der.v:       # Der-Der (recta)
        return rotar_izquierda(n)
    if b > 1 and v > n.izq.v:        # Izq-Der (zigzag)
        n.izq = rotar_izquierda(n.izq)
        return rotar_derecha(n)
    if b < -1 and v < n.der.v:       # Der-Izq (zigzag)
        n.der = rotar_derecha(n.der)
        return rotar_izquierda(n)
    return n
`;
  const ELIMINAR = R`
def eliminar(n, v):
    if n is None:
        return None
    if v < n.v:
        n.izq = eliminar(n.izq, v)
    elif v > n.v:
        n.der = eliminar(n.der, v)
    else:                            # nodo encontrado
        if n.izq is None:
            return n.der             # 0 o 1 hijo
        if n.der is None:
            return n.izq
        suc = n.der                  # 2 hijos: sucesor inorden
        while suc.izq:
            suc = suc.izq
        n.v = suc.v
        n.der = eliminar(n.der, suc.v)
    actualizar(n)
    b = balance(n)                   # el caso depende del balance de los hijos
    if b > 1 and balance(n.izq) >= 0:
        return rotar_derecha(n)
    if b > 1 and balance(n.izq) < 0:
        n.izq = rotar_izquierda(n.izq)
        return rotar_derecha(n)
    if b < -1 and balance(n.der) <= 0:
        return rotar_izquierda(n)
    if b < -1 and balance(n.der) > 0:
        n.der = rotar_derecha(n.der)
        return rotar_izquierda(n)
    return n
`;
  const BASE = NODO + ROTAR + INSERTAR;

  B.tema({
    id: 'av-problema', area: 'av', titulo: 'El problema del BST degenerado y la meta del AVL', fuente: 'S7-C1 · diap. 4-5, 36-38', nivel: 7, comp: true,
    conceptos: ['av_prob'], interactivo: ['bst-degenerado', 'avl-insertar'],
    definicion: R`
Un **árbol auto-balanceado** es un BST que **mantiene su altura en §O(log n)§** ajustando su forma **tras cada inserción o eliminación**, garantizando esas operaciones en **§O(log n)§**.

**AVL** son las iniciales de sus creadores, los matemáticos soviéticos **Adelson-Velskii y Landis (1962)**: el **primer** árbol binario de búsqueda auto-balanceable de la historia.

La motivación (pregunta inicial de la clase): insertar §[1, 2, 3, 4, 5]§ en un BST produce una **lista de altura 4** y todas las operaciones vuelven a ser §O(n)§. ¿Cómo podría el árbol reorganizarse **solo** tras cada inserción para mantenerse bajito, **sin dejar de ser un BST válido**?`,
    intuicion: R`
Un BST es como una pila de cajas que se acomoda como le llegan las cosas: si llegan en orden, se apilan en una torre inestable y alta. Un AVL es **la misma estantería con un ayudante que, cada vez que se desbalancea, la reacomoda localmente** (con rotaciones) para que ningún lado pese mucho más que el otro.

La clave: el reacomodo es **barato** (una rotación toca unos pocos punteros, §O(1)§) y **no daña el orden** (preserva el inorden). Así, se paga un poco en cada inserción para **garantizar** que las búsquedas nunca se degraden.`,
    formal: R`
**Meta y garantía**

- **BST degenerado**: altura §n − 1§ (una lista) ⇒ operaciones §O(n)§.
- **Árbol auto-balanceado (AVL)**: altura §O(log n)§ ⇒ búsqueda, inserción y eliminación en **§O(log n)§**.
- Mantiene la propiedad de BST: el reacomodo usa **rotaciones**, que preservan el inorden ([[av-rotaciones]]).

**Qué comparar** (síntesis de la clase):

1. Un BST puede degenerar a altura §n§; un auto-balanceado garantiza altura §O(log n)§.
2. El **factor de balance** mide la diferencia de alturas de los subárboles ([[av-factor]]).
3. Una **rotación** reorganiza en §O(1)§ preservando el orden.
4. El AVL corrige **cuatro casos**: dos con rotación simple y dos con doble ([[av-casos]]).
5. El árbol rojo-negro balancea de forma más laxa: menos rotaciones, mejor para escritura ([[rn-vs-avl]]).

**Ojo con la diapositiva 4:** «una lista de altura 4» se refiere a 5 nodos con altura medida en **aristas**.`,
    procedimiento: R`
**Para razonar si necesitas un árbol balanceado:**

1. ¿Los datos pueden llegar **ordenados o casi ordenados**? Si sí, un BST simple es un riesgo.
2. ¿Necesitas **garantía** de §O(log n)§ en el peor caso (no solo en promedio)? Entonces AVL o rojo-negro.
3. ¿Dominan las **lecturas** (búsquedas)? → **AVL** (más bajito). ¿Dominan las **escrituras**? → **rojo-negro** (menos rotaciones).
4. Si no te importa el orden y solo consultas pertenencia → **tabla hash** ([[ad-hash]]).`,
    codigo: {
      titulo: 'BST sin balancear frente a AVL con datos ordenados (alturas)',
      src: NODO + ROTAR + INSERTAR + R`
def insertar_bst(n, v):              # BST sin balancear
    if n is None:
        return Nodo(v)
    if v < n.v:
        n.izq = insertar_bst(n.izq, v)
    elif v > n.v:
        n.der = insertar_bst(n.der, v)
    return n

def altura(n):
    return -1 if n is None else 1 + max(altura(n.izq), altura(n.der))

for n in [5, 15, 31, 100]:
    bst = None
    avl = None
    for v in range(1, n + 1):        # datos ya ordenados: el peor caso del BST
        bst = insertar_bst(bst, v)
        avl = insertar(avl, v)
    print(n, "valores -> altura BST:", altura(bst), "| altura AVL:", alt(avl))
`,
      esperado: '5 valores -> altura BST: 4 | altura AVL: 2\n15 valores -> altura BST: 14 | altura AVL: 3\n31 valores -> altura BST: 30 | altura AVL: 4\n100 valores -> altura BST: 99 | altura AVL: 6'
    },
    ejemplo: R`
**La pregunta de la clase.** Insertar §[1, 2, 3, 4, 5]§:

~~~
BST (degenerado, h = 4)          AVL (h = 2)
1                                      2
 \                                    / \
  2                                  1   4
   \                                    / \
    3                                  3   5
     \
      4
       \
        5
~~~

(El AVL de la figura, §2(1,4(3,5))§, es el que produce el código de la clase al insertar §1, 2, 3, 4, 5§ con rotaciones; la diapositiva 5 compara la lista con un AVL de 4 nodos.)

**Datos del código:** con 100 valores ordenados el BST tiene altura **99** (buscar el último cuesta 100 comparaciones) y el AVL **6** (≤ 7 comparaciones).

**El ejemplo interactivo «AVL: insertar…»** construye un AVL de 18 nodos mostrando en cada nodo su altura (§h§) y su factor (§f§); el de «BST degenerado» muestra la lista de altura 15.`,
    complejidad: R`
- **BST**: operaciones §O(h)§ con §h§ entre §log n§ y §n − 1§ (ver [[bs-complejidad]]).
- **AVL**: §h = O(log n)§ **garantizado** ⇒ búsqueda, inserción y eliminación en **§O(log n)§**, peor caso.
- **Costo del reacomodo**: cada rotación es §O(1)§; tras una inserción se sube por el camino (§O(log n)§) recalculando alturas; una inserción necesita **a lo sumo una** rotación (simple o doble).
- **Espacio**: §O(n)§ nodos, cada uno con **un campo extra** (la altura).
- **Compromiso**: el AVL «paga» en cada escritura (alturas + rotaciones) para evitar el peor caso en las lecturas.`,
    errores: R`
- **Creer que el BST siempre es §O(log n)§**: depende del orden de inserción.
- **Usar un BST sin balancear en producción** con datos que llegan casi ordenados.
- **Pensar que balancear cambia el orden de los datos**: una rotación **preserva el inorden**.
- **Confundir «auto-balanceado» con «perfecto»**: el AVL permite pequeñas diferencias (|f| ≤ 1).
- **Olvidar que AVL no es el único**: el rojo-negro también garantiza §O(log n)§ con otro criterio.`,
    preguntas: [
      ['¿Qué garantiza un árbol auto-balanceado sobre la altura y por qué importa?', 'Garantiza altura §O(log n)§, y con ella búsqueda, inserción y eliminación en §O(log n)§ aun en el peor caso; sin eso un BST puede degenerar en lista (altura §n − 1§) y volver a §O(n)§.'],
      ['¿Qué significa AVL?', 'Son las iniciales de sus creadores, Adelson-Velskii y Landis (1962): el primer BST auto-balanceable.'],
      ['¿Qué altura tiene el BST resultante de insertar §[1, 2, 3, 4, 5]§ y cuál el AVL?', 'BST: 4 (lista). AVL: 2 (árbol de 5 nodos balanceado).'],
      ['¿Una rotación puede cambiar el orden de los datos? Justifica.', 'No: una rotación solo reengancha punteros y **preserva el inorden**, así que la propiedad de BST sigue valiendo.']
    ],
    resumen: R`
- Un **BST** puede degenerar (altura §n − 1§ ⇒ §O(n)§); un **auto-balanceado** garantiza altura §O(log n)§.
- **AVL** = Adelson-Velskii y Landis (1962), el primero.
- Se reorganiza tras cada inserción/eliminación con **rotaciones** (§O(1)§, preservan el inorden).
- Datos ordenados: BST altura §n − 1§; AVL ≈ §log n§.
- AVL ↔ lecturas; rojo-negro ↔ escrituras. Ambos §O(log n)§.`
  });

  B.tema({
    id: 'av-factor', area: 'av', titulo: 'Altura y factor de balance', fuente: 'S7-C1 · diap. 6-7, 38', nivel: 7,
    conceptos: ['av_factor', 'av_altura'], interactivo: ['avl-insertar'],
    definicion: R`
- **Altura**: §altura(n) = 1 + máx(alt(n.izq), alt(n.der))§; un árbol **vacío** tiene altura **−1** y una **hoja**, **0**.
- **Factor de balance (equilibrio)**: **§factor(n) = alt(n.izq) − alt(n.der)§**.
- **AVL**: para **cada nodo**, las alturas de los subárboles izquierdo y derecho difieren en **a lo sumo 1**: **§|hizq − hder| ≤ 1§**. Si algún nodo llega a **±2**, el árbol deja de ser AVL y se **rebalancea con rotaciones**.`,
    intuicion: R`
El factor es una **balanza**: positivo significa que el lado izquierdo es más alto («pesa a la izquierda»), negativo que pesa a la derecha, 0 que está parejo. Para ser AVL, ningún nodo puede inclinarse más de un «dedo»: **−1, 0 o +1**.

Tras insertar o eliminar, solo se desbalancean los nodos del **camino hacia la raíz**; por eso se **regresa por ese camino** recalculando altura y factor, y el **primero** (el más profundo) que llegue a ±2 es donde se rota. En la clase: al insertar 10 en la cadena 30 → 20, el 30 pasa a **+2** y ahí se rota.`,
    formal: R`
**Definiciones** (S7-C1, d.6-7):

~~~
altura(vacío) = −1          altura(hoja) = 0
altura(n)     = 1 + máx(altura(n.izq), altura(n.der))
factor(n)     = altura(n.izq) − altura(n.der)
AVL           ⇔  |factor(n)| ≤ 1  para TODO nodo n
~~~

**Ejemplos de la clase** (diapositiva 6):

| Árbol | Factores | ¿AVL? |
|---|---|---|
| §8(4(2,),12(,14))§ | §8: 0§; §4: +1§; §12: −1§ | **sí** (todo §|f| ≤ 1§) |
| §8(4(2,),)§ | §8: +2§; §4: +1§; §2: 0§ | **no** (raíz con §+2§) |

**Signos:** §+2§ ⇒ muy pesado a la **izquierda**; §−2§ ⇒ muy pesado a la **derecha**. Cada nodo guarda su **altura** (campo extra) para no recalcularla recorriendo el subárbol.

**Después de insertar:** se regresa por el camino actualizando altura y factor; el **primer** nodo (el más profundo) con §|factor| ≥ 2§ es donde se rota.`,
    procedimiento: R`
**Para calcular alturas y factores a mano:**

1. Marca las **hojas** con altura **0** (y los hijos vacíos con −1).
2. Sube: §altura = 1 + máx(altura de los hijos)§.
3. En cada nodo: §factor = altura(izq) − altura(der)§ (recuerda: el hijo vacío cuenta −1).
4. **¿Algún §|factor| ≥ 2§?** Entonces el árbol no es AVL; el nodo **más profundo** con ese problema es donde se rota.
5. **En código**: después de cada inserción o eliminación, recalcula §altura§ con §actualizar(n)§ **al regresar de la recursión** y luego calcula §balance(n)§.`,
    codigo: {
      titulo: 'Alturas y factores de los árboles de la clase (S7-C1, d.6)',
      src: NODO + R`
def mostrar_factores(n):
    if n is None:
        return
    print(n.v, "altura", n.altura, "factor", balance(n))
    mostrar_factores(n.izq)
    mostrar_factores(n.der)

def es_avl(n):
    if n is None:
        return True
    return abs(balance(n)) <= 1 and es_avl(n.izq) and es_avl(n.der)

bueno = N(8, N(4, N(2)), N(12, None, N(14)))
malo = N(8, N(4, N(2)))
mostrar_factores(bueno)
print("es AVL:", es_avl(bueno))
mostrar_factores(malo)
print("es AVL:", es_avl(malo))
`,
      esperado: '8 altura 2 factor 0\n4 altura 1 factor 1\n2 altura 0 factor 0\n12 altura 1 factor -1\n14 altura 0 factor 0\nes AVL: True\n8 altura 2 factor 2\n4 altura 1 factor 1\n2 altura 0 factor 0\nes AVL: False'
    },
    ejemplo: R`
**Árbol balanceado** §8(4(2,),12(,14))§:

~~~
          8    f = 0
        /   \
   f=+1 4     12  f = −1
       /        \
      2          14
~~~

- §alt(2) = 0§, §alt(4) = 1 + máx(0, −1) = 1§: §f(4) = 0 − (−1) = +1§.
- §alt(14) = 0§, §alt(12) = 1§: §f(12) = −1 − 0 = −1§.
- §alt(8) = 2§: §f(8) = 1 − 1 = 0§. **Todos en {−1, 0, +1}: es AVL.**

**Desbalanceado** §8(4(2,),)§: §alt(4) = 1§, el hijo derecho de §8§ está vacío (§−1§) ⇒ §f(8) = 1 − (−1) = **+2**§: **no es AVL**.

**Insertar 10 en 30 → 20** (diapositiva 7): cadena §30(20(10,),)§. Al regresar: §f(10) = 0§ (nuevo), §f(20) = +1§, §f(30) = **+2**§ ⇒ se detecta en el 30 y se rota ahí (caso Izq-Izq).

En el ejemplo interactivo cada nodo muestra §h§ (altura guardada) y §f§ (factor); el factor aparece en **rojo** cuando llega a ±2, justo antes de rotar.`,
    complejidad: R`
- **Calcular la altura de un nodo recorriendo su subárbol**: §O(tamaño del subárbol)§; **guardada** en el nodo: **§O(1)§** (por eso el AVL tiene el campo §altura§).
- **Recalcular alturas y factores tras una inserción**: se recorre el camino hacia la raíz ⇒ **§O(log n)§** (altura del árbol).
- **Verificar que un árbol es AVL** (§es_avl§): §O(n)§ con alturas guardadas.
- **Espacio**: un entero extra por nodo (§O(n)§ en total).`,
    errores: R`
- **Restar al revés** (§alt(der) − alt(izq)§): la clase define §factor = alt(izq) − alt(der)§.
- **Olvidar que el hijo vacío cuenta −1** (no 0): una hoja tiene factor 0, un nodo con un solo hijo hoja tiene ±1.
- **Mezclar altura en aristas con altura en nodos**: aquí hoja = 0 y vacío = −1.
- **Olvidar recalcular las alturas tras rotar.**
- **Rebalancear solo en el nodo insertado** y no subir por el camino hacia la raíz.
- **Confundir «factor +2» con «derecha pesada»**: §+2§ es **izquierda** pesada.`,
    preguntas: [
      ['Define el factor de balance de un AVL y la condición que debe cumplir.', '§factor(n) = alt(n.izq) − alt(n.der)§; un AVL exige §|factor| ≤ 1§ en **todos** los nodos (alturas de los subárboles que difieren en a lo sumo 1).'],
      ['¿Cuál es la altura de un árbol vacío y de una hoja?', 'Vacío: −1. Hoja: 0 (§1 + máx(−1, −1) = 0§).'],
      ['Calcula los factores de §8(4(2,),12(,14))§ y di si es AVL.', '§f(8) = 0§, §f(4) = +1§, §f(12) = −1§, §f(2) = f(14) = 0§: todos en {−1, 0, +1}, **es AVL**.'],
      ['¿Dónde se rota tras una inserción?', 'En el **primer** nodo (el más profundo, al subir por el camino hacia la raíz) con §|factor| ≥ 2§.']
    ],
    resumen: R`
- §altura = 1 + máx(alt(izq), alt(der))§; vacío **−1**, hoja **0**.
- **§factor = alt(izq) − alt(der)§**; AVL ⇔ §|factor| ≤ 1§ en todos los nodos.
- §+2§ = pesa a la izquierda; §−2§ = pesa a la derecha.
- Tras insertar/eliminar: subir por el camino actualizando altura y factor; rotar en el **primer** nodo con §|f| ≥ 2§.
- La altura se **guarda** en el nodo (§O(1)§).`
  });

  B.tema({
    id: 'av-rotaciones', area: 'av', titulo: 'Rotaciones: la operación que rebalancea', fuente: 'S7-C1 · diap. 8-9, 17, 36-37, 42', nivel: 7,
    conceptos: ['av_rotsimple', 'av_codigo'], interactivo: ['avl-cuatro-casos'],
    definicion: R`
Una **rotación** cambia la **forma** del árbol **manteniendo la propiedad de BST**. Es una operación **local** y de costo **§O(1)§**:

- **Rotación izquierda**: el **hijo derecho sube** y se convierte en raíz local; la raíz baja a la izquierda. Corrige árboles **pesados a la derecha**.
- **Rotación derecha**: el **hijo izquierdo sube**; la raíz baja a la derecha. Corrige árboles **pesados a la izquierda**.

**Propiedad esencial:** una rotación **preserva el recorrido inorden** (el orden de los datos), así que se puede rebalancear libremente sin corromper el BST.`,
    intuicion: R`
Imagina un colgante con tres bolitas colgado de una rama hacia la derecha. Tomas la bolita del medio y la **subes**, haciendo que la de arriba baje a su izquierda: el peso queda repartido y **el orden izquierda-a-derecha de las bolitas no cambia**.

En el dibujo de la clase: raíz §r§ pesada a la derecha, con hijo derecho §p§. Tras la rotación izquierda **§p§ sube, §r§ baja y el subárbol §B§ cambia de padre** (era hijo izquierdo de §p§ y pasa a ser hijo derecho de §r§). El inorden antes y después es el mismo: **A < r < B < p < C**.`,
    formal: R`
**Algoritmos** (S7-C1, d.17):

*Rotación derecha de un nodo §y§* (corrige Izq-Izq):

1. Sea §x§ el hijo izquierdo de §y§.
2. El hijo derecho de §x§ pasa a ser el hijo **izquierdo** de §y§.
3. §y§ pasa a ser el hijo **derecho** de §x§.
4. **Recalcular la altura de §y§ y luego la de §x§** (primero el de abajo).
5. Devolver §x§ como nueva raíz local.

*Rotación izquierda de un nodo §x§* (corrige Der-Der): simétrica. Sea §y§ el hijo derecho de §x§; el hijo izquierdo de §y§ pasa a ser el derecho de §x§; §x§ pasa a ser el hijo izquierdo de §y§; recalcular alturas de §x§ y luego de §y§; devolver §y§.

**Propiedades:**

- **Preserva el inorden**: solo reengancha unos pocos punteros ⇒ **§O(1)§**.
- Hay que **actualizar el puntero al padre** de la raíz local (en el código recursivo se hace con la asignación del retorno: §n.izq = rotar_…(n.izq)§).
- Rebalancear tras una inserción exige a lo sumo §O(log n)§ de trabajo (subir por el camino).`,
    procedimiento: R`
**Para rotar a mano** (rotación izquierda sobre §x§):

1. Identifica §y§ = hijo **derecho** de §x§ (sube).
2. Identifica §t§ = hijo **izquierdo** de §y§ (cambia de padre).
3. §y.izq = x§ y §x.der = t§.
4. Recalcula la altura de §x§ (ahora abajo) **y luego** la de §y§.
5. El subárbol resultante tiene raíz §y§; engánchalo donde estaba §x§ (en el padre).
6. **Comprueba** que el inorden no cambió.

**Para la rotación derecha**, intercambia izquierda y derecha en todos los pasos.

**Memoria visual:** «el hijo que sube pasa su hijo interior al que baja».`,
    codigo: {
      titulo: 'Rotaciones del código de apoyo (S7-C1, d.42): el inorden no cambia',
      src: NODO + ROTAR + R`
def inorden(n, s):
    if n is not None:
        inorden(n.izq, s)
        s.append(n.v)
        inorden(n.der, s)
    return s

t = N(4, N(2), N(8, N(6), N(10)))               # r = 4, A = 2, p = 8, B = 6, C = 10
print("antes      :", nota(t), inorden(t, []))
t = rotar_izquierda(t)                          # p = 8 sube; B = 6 cambia de padre
print("rot. izq.  :", nota(t), inorden(t, []))
t = rotar_derecha(t)                            # la inversa
print("rot. der.  :", nota(t), inorden(t, []))

cadena = N(10, None, N(20, None, N(30)))        # 10 -> 20 -> 30 (pesada a la derecha)
print("cadena     :", nota(cadena), "factor de la raíz:", balance(cadena))
cadena = rotar_izquierda(cadena)
print("tras rotar :", nota(cadena), "factor de la raíz:", balance(cadena), "| altura:", cadena.altura)
`,
      esperado: 'antes      : 4(2,8(6,10)) [2, 4, 6, 8, 10]\nrot. izq.  : 8(4(2,6),10) [2, 4, 6, 8, 10]\nrot. der.  : 4(2,8(6,10)) [2, 4, 6, 8, 10]\ncadena     : 10(,20(,30)) factor de la raíz: -2\ntras rotar : 20(10,30) factor de la raíz: 0 | altura: 1'
    },
    ejemplo: R`
**Rotación izquierda sobre §r§** (figura de la clase, S7-C1 d.8):

~~~
antes (pesado a la derecha)           después (balanceado)
         r                                  p
        / \                                / \
       A   p            ⟹                 r   C
          / \                            / \
         B   C                          A   B
~~~

**Inorden antes:** §A, r, B, p, C§. **Inorden después:** §A, r, B, p, C§ ✔ (**p sube, r baja y B cambia de padre**).

**Con números** (código de arriba): §4(2,8(6,10))§, inorden §2, 4, 6, 8, 10§. Al rotar a la izquierda sobre 4 sube el 8, el 4 baja a su izquierda y el 6 pasa a ser hijo derecho de 4: §8(4(2,6),10)§, inorden **idéntico**.

**La cadena 10 → 20 → 30:** el factor de la raíz es −2 (derecha pesada). Una sola rotación izquierda deja §20(10,30)§: altura 1 y factor 0.

El ejemplo interactivo «los cuatro casos» aplica estas mismas funciones: observa cómo cambian los punteros paso a paso.`,
    complejidad: R`
- **Una rotación**: §O(1)§ (reasigna unos 3 punteros y recalcula 2 alturas).
- **Rebalancear tras una inserción**: subir por el camino §O(log n)§ + una rotación simple o doble §O(1)§ ⇒ **§O(log n)§**.
- **Tras una eliminación**: hasta §O(log n)§ rotaciones (una por nivel en el peor caso) ⇒ **§O(log n)§** en total.
- **Por qué preserva el inorden**: sólo cambia quién es padre de quién entre §r§, §p§ y §B§, y el orden entre §A < r < B < p < C§ no se altera: lo que estaba a la izquierda sigue a la izquierda.
- **Espacio extra**: §O(1)§ (solo variables temporales).`,
    errores: R`
- **Creer que una rotación cambia el orden de los datos**: preserva el inorden.
- **Olvidar recalcular las alturas tras rotar**, o hacerlo en el orden equivocado (primero la del nodo que baja, luego la del que sube).
- **No reasignar el resultado** (§n.izq = rotar_derecha(n.izq)§ o §raiz = insertar(raiz, v)§): una rotación puede cambiar la raíz y si no reasignas pierdes el árbol.
- **Rotar en la dirección equivocada**: izquierda corrige derecha pesada; derecha corrige izquierda pesada.
- **Perder el subárbol §B§** (el hijo interior): hay que reubicarlo como hijo del nodo que baja.
- **Olvidar actualizar el puntero al padre** de la nueva raíz local.`,
    preguntas: [
      ['¿Por qué una rotación preserva la propiedad de BST?', 'Porque preserva el inorden: solo reengancha punteros entre tres nodos y el orden relativo de A < r < B < p < C no cambia, así que todo lo que estaba a la izquierda de un nodo sigue allí. Además cuesta §O(1)§.'],
      ['Describe la rotación derecha de un nodo §y§.', '§x = y.izq§; §t = x.der§; §x.der = y§; §y.izq = t§; recalcular altura de §y§ y luego de §x§; devolver §x§ como nueva raíz local.'],
      ['¿Qué corrige cada rotación simple?', 'La derecha corrige árboles pesados a la izquierda (caso Izq-Izq); la izquierda, pesados a la derecha (Der-Der).'],
      ['¿Qué complejidad tiene una rotación y qué pasa si no reasignas el resultado?', '§O(1)§. Si no reasignas, pierdes el subárbol (o el árbol entero si cambió la raíz): hay que escribir §raiz = insertar(raiz, v)§.']
    ],
    resumen: R`
- **Rotación** = cambio local de forma, §O(1)§, que **preserva el inorden**.
- **Izquierda**: sube el hijo derecho (Der-Der). **Derecha**: sube el hijo izquierdo (Izq-Izq).
- Pasos: §x = y.izq; t = x.der; x.der = y; y.izq = t§; recalcular alturas (**primero la de abajo**); devolver §x§.
- Siempre **reasignar** el retorno.
- Una inserción: ≤ 1 rotación (simple o doble); una eliminación: hasta §O(log n)§.`
  });

  B.tema({
    id: 'av-casos', area: 'av', titulo: 'Los cuatro casos de desbalance del AVL', fuente: 'S7-C1 · diap. 10-14, 21, 36-37', nivel: 7,
    conceptos: ['av_ll', 'av_rr', 'av_lr', 'av_rl'], interactivo: ['avl-cuatro-casos'],
    definicion: R`
Cuando un nodo llega a factor **±2**, el desbalance es de uno de **cuatro casos**, según dónde se insertó el nuevo nodo:

| Caso | Situación (nuevo nodo insertado en…) | Corrección |
|---|---|---|
| **Izq-Izq** | subárbol izquierdo del hijo izquierdo | **1 rotación derecha** |
| **Der-Der** | subárbol derecho del hijo derecho | **1 rotación izquierda** |
| **Izq-Der** | subárbol derecho del hijo izquierdo | rotación **izq. del hijo**, luego **der.** |
| **Der-Izq** | subárbol izquierdo del hijo derecho | rotación **der. del hijo**, luego **izq.** |

**Regla mnemotécnica:** si el desbalance está en **línea recta** (Izq-Izq o Der-Der): **una rotación simple**. Si está en **zigzag** (Izq-Der o Der-Izq): **doble rotación**.`,
    intuicion: R`
Mira el camino desde el nodo desbalanceado hasta donde cayó el nuevo valor. Si **siempre tuerce hacia el mismo lado** (izquierda-izquierda, derecha-derecha), la cadena es una «escalera recta» y **una rotación del nodo de arriba** la endereza. Si **cambia de dirección** (izquierda-derecha, derecha-izquierda), la cadena hace un «codo»: una sola rotación solo movería el codo de un lado a otro; primero hay que **enderezar el codo con una rotación en el hijo** (que lo convierte en una escalera recta) y luego aplicar la rotación simple arriba.

Los cuatro casos terminan igual en las figuras de la clase: **§20(10,30)§**, el valor del medio arriba.`,
    formal: R`
**Los cuatro casos en figuras** (S7-C1, d.11; cada fila va de «desbalanceado» a «balanceado»):

~~~
Izq-Izq → 1 rot. derecha      Der-Der → 1 rot. izquierda
   30           20               10             20
   /           /  \               \            /  \
  20      ⇒   10  30               20    ⇒   10  30
 /                                   \
10                                    30

Izq-Der → doble (izq., der.)   Der-Izq → doble (der., izq.)
   30           20               10             20
   /           /  \               \            /  \
  10      ⇒   10  30               30    ⇒   10  30
    \                              /
     20                           20
~~~

**Doble rotación Izq-Der paso a paso** (inserto 30, 10, 20):

1. **Rotación izquierda en el hijo (10)**: §30(10(,20),)§ → §30(20(10,),)§ (ahora es Izq-Izq, línea recta).
2. **Rotación derecha en la raíz (30)**: §30(20(10,),)§ → §20(10,30)§ ✔.

**Der-Izq** es **simétrico**: (1) rotación derecha en el hijo (30), (2) rotación izquierda en la raíz (10). Solo cambian las direcciones.

**Cómo decidir el caso en la inserción** (código de la clase): con §b = balance(n)§ y el valor insertado §v§:

~~~
b > 1  y v < n.izq.v   → Izq-Izq        b < -1 y v > n.der.v   → Der-Der
b > 1  y v > n.izq.v   → Izq-Der        b < -1 y v < n.der.v   → Der-Izq
~~~`,
    procedimiento: R`
**Para identificar y corregir el caso** (a mano):

1. Localiza el **primer nodo** (de abajo hacia arriba) con factor **±2**: es el pivote §z§.
2. Mira el **hijo más alto** de §z§ (§y§) y el **hijo más alto de §y§** (§x§, por donde cayó el valor).
3. ¿Mismo lado dos veces? → **Izq-Izq** o **Der-Der**: **una rotación simple** en §z§ (hacia el lado contrario al peso).
4. ¿Lados distintos? → **Izq-Der** o **Der-Izq**: **rotación en §y§** hacia el lado contrario a §x§ y luego **rotación simple en §z§**.
5. **Comprueba** que el subárbol termina con **la misma altura que tenía antes de insertar** (por eso una inserción necesita una sola corrección).
6. Confirma factores y **inorden** del resultado.`,
    codigo: {
      titulo: 'Los cuatro casos por inserción, y la doble rotación Izq-Der paso a paso',
      src: BASE + R`
def construir(valores):
    raiz = None
    for v in valores:
        raiz = insertar(raiz, v)
    return raiz

for nombre, valores in [("Izq-Izq", [30, 20, 10]), ("Der-Der", [10, 20, 30]), ("Izq-Der", [30, 10, 20]), ("Der-Izq", [10, 30, 20])]:
    rotaciones[0] = 0
    arbol = construir(valores)
    print(nombre, valores, "->", nota(arbol), "| rotaciones simples:", rotaciones[0])

zigzag = N(30, N(10, None, N(20)))              # Izq-Der: 30 -> 10 -> 20 (en zigzag)
print("zigzag Izq-Der           :", nota(zigzag), "factor de la raíz:", balance(zigzag))
zigzag.izq = rotar_izquierda(zigzag.izq)        # 1) rotación izquierda en el hijo (10)
print("1) rot. izq. en el hijo  :", nota(zigzag))
zigzag = rotar_derecha(zigzag)                  # 2) rotación derecha en la raíz (30)
print("2) rot. der. en la raíz  :", nota(zigzag), "factor de la raíz:", balance(zigzag))
`,
      esperado: 'Izq-Izq [30, 20, 10] -> 20(10,30) | rotaciones simples: 1\nDer-Der [10, 20, 30] -> 20(10,30) | rotaciones simples: 1\nIzq-Der [30, 10, 20] -> 20(10,30) | rotaciones simples: 2\nDer-Izq [10, 30, 20] -> 20(10,30) | rotaciones simples: 2\nzigzag Izq-Der           : 30(10(,20),) factor de la raíz: 2\n1) rot. izq. en el hijo  : 30(20(10,),)\n2) rot. der. en la raíz  : 20(10,30) factor de la raíz: 0'
    },
    ejemplo: R`
**Pregunta de análisis (1) de la clase:**

- Insertar §[30, 20, 10]§ en un AVL vacío: el 10 queda a la izquierda del hijo izquierdo ⇒ **Izq-Izq** ⇒ **una rotación derecha** (sobre 30).
- Insertar §[30, 10, 20]§: el 20 queda a la derecha del hijo izquierdo ⇒ **Izq-Der** ⇒ **dos rotaciones** (izquierda sobre 10 y derecha sobre 30).

**Ejemplo Der-Der de la clase (d.12):** inserto 10,20,30 ⇒ desbalance Der-Der en el 10 (factor −2) ⇒ una rotación izquierda ⇒ §20(10,30)§; el 20 sube a la raíz.\n\n**Resumen visual** (resultado del código): los cuatro casos terminan en **§20(10,30)§**; las rectas usan **1** rotación y los zigzag **2**.

**Entrenar la decisión:** dado §n = 40§ con §f = −2§ y su hijo derecho §50§ con §f = +1§ (el nuevo nodo cayó a la izquierda de 50): la derecha es pesada (**R**) y el hijo derecho pesa a la izquierda (**L**) ⇒ **Der-Izq** ⇒ rotación **derecha** en 50 y luego **izquierda** en 40.

El ejemplo interactivo construye los cuatro árboles con las funciones de la clase; observa que en los zigzag aparecen dos rotaciones seguidas.`,
    complejidad: R`
- **Cada caso se corrige en §O(1)§**: una o dos rotaciones, cada una §O(1)§.
- **Una inserción** puede desbalancear varios ancestros, pero **solo el primero** necesita corrección: tras rotar, el subárbol recupera la altura que tenía antes de la inserción, así que sus ancestros quedan equilibrados. Por eso **una inserción necesita a lo sumo una corrección (simple o doble)**.
- **Costo total de la inserción**: subir por el camino §O(log n)§ + §O(1)§ de rotación ⇒ **§O(log n)§**.
- Los zigzag cuestan 2 rotaciones simples, pero se cuentan como **una sola corrección** (doble rotación) en el límite «a lo sumo una».`,
    errores: R`
- **Confundir los casos zigzag (Izq-Der / Der-Izq, doble rotación) con los rectos (rotación simple).**
- **Usar una sola rotación en un zigzag**: el desbalance cambia de lado pero no se corrige.
- **Invertir el orden de la doble rotación**: primero en el **hijo**, luego en el **nodo desbalanceado**.
- **Rotar en el nodo equivocado**: se rota en el primer nodo desbalanceado (el más profundo), no en el insertado ni en la raíz.
- **Decidir el caso con el valor equivocado**: en la inserción se compara con §n.izq.v§ o §n.der.v§; en la eliminación se decide por el **balance del hijo**.
- **Confundir «Izq-Der» con «rotación izquierda»**: el nombre describe **dónde cayó** el nodo, no la rotación.`,
    preguntas: [
      ['Nombra los cuatro casos de desbalance y su corrección.', 'Izq-Izq: rotación derecha. Der-Der: rotación izquierda. Izq-Der: rotación izquierda del hijo y luego derecha. Der-Izq: rotación derecha del hijo y luego izquierda.'],
      ['Se inserta §[30, 20, 10]§ en un AVL vacío: ¿qué caso ocurre y con qué rotación se corrige? ¿Y con §[30, 10, 20]§?', '§[30, 20, 10]§: Izq-Izq, una rotación derecha. §[30, 10, 20]§: Izq-Der, dos rotaciones (izquierda del hijo 10 y derecha de la raíz 30). Ambos terminan en §20(10,30)§.'],
      ['¿Cómo distingues un caso recto de uno zigzag?', 'Siguiendo el camino desde el nodo desbalanceado hasta el valor insertado: si tuerce dos veces hacia el mismo lado es recto (rotación simple); si cambia de lado es zigzag (doble rotación).'],
      ['¿Por qué basta una sola corrección tras una inserción?', 'Porque al corregir el primer nodo desbalanceado, su subárbol recupera la altura que tenía antes de insertar y los ancestros no se ven afectados.']
    ],
    resumen: R`
- **Izq-Izq** → 1 rot. derecha · **Der-Der** → 1 rot. izquierda · **Izq-Der** → izq. del hijo + der. · **Der-Izq** → der. del hijo + izq.
- **Recta = rotación simple; zigzag = doble.**
- Todos terminan en §20(10,30)§ en los ejemplos de la clase.
- En la inserción el caso se decide con el **valor insertado**; en la eliminación, con el **balance del hijo**.
- Una inserción necesita **a lo sumo una** corrección.`
  });

  B.tema({
    id: 'av-insercion', area: 'av', titulo: 'Inserción en un AVL: el algoritmo y un ejemplo completo', fuente: 'S7-C1 · diap. 15-16, 18, 20, 35, 43', nivel: 7,
    conceptos: ['av_insertar', 'av_primer', 'in_bst_avl'], interactivo: ['avl-insertar'],
    definicion: R`
**Insertar en un AVL** tiene **dos pasos**:

1. **Insertar como en un BST**: descender comparando; si el valor ya existe, no insertar; si no, colgar la nueva hoja. Luego **volver por el camino hacia la raíz**.
2. **En cada nodo §n§ del camino**: recalcular su **altura** y su **factor** (§alt(izq) − alt(der)§). Si §|factor| ≤ 1§, seguir subiendo; si no, **rotar según el caso** (el valor insertado indica dónde cayó).

**Propiedad:** cada inserción dispara **a lo sumo una** corrección (rotación simple o doble).`,
    intuicion: R`
Es una inserción de BST con **un chequeo al regresar**: cuando la recursión «sube» de vuelta, cada nodo se pregunta «¿sigo equilibrado?». Casi siempre sí; cuando el nodo detecta ±2, **se arregla a sí mismo con las rotaciones** y devuelve a su padre la nueva raíz del subárbol (que puede ser un nodo distinto).

Ese «devuelve la nueva raíz» es la clave del código: la función §insertar§ **devuelve el subárbol corregido**, y el llamador lo **reasigna**. La clase lo subraya: «escribe siempre §raiz = insertar(raiz, v)§; una rotación puede cambiar la raíz».`,
    formal: R`
**Algoritmo** (S7-C1, d.18):

1. §n = None§ → crear el nodo.
2. §v < n.v§ → §n.izq = insertar(n.izq, v)§; §v > n.v§ → §n.der = insertar(n.der, v)§; igual → devolver §n§ (sin duplicados).
3. **Al volver**: §actualizar(n)§ y §b = balance(n)§.
4. Según el caso:

| Condición | Caso | Acción |
|---|---|---|
| §b > 1§ y §v < n.izq.v§ | Izq-Izq | §rotar_derecha(n)§ |
| §b < −1§ y §v > n.der.v§ | Der-Der | §rotar_izquierda(n)§ |
| §b > 1§ y §v > n.izq.v§ | Izq-Der | §n.izq = rotar_izquierda(n.izq)§; luego §rotar_derecha(n)§ |
| §b < −1§ y §v < n.der.v§ | Der-Izq | §n.der = rotar_derecha(n.der)§; luego §rotar_izquierda(n)§ |

5. Devolver §n§ (o la nueva raíz local).

**Resultado:** el árbol mantiene altura §∼ log₂ n§ **en todo momento**.`,
    procedimiento: R`
**Para construir un AVL a mano** (actividad de la clase con §[10, 20, 30, 40, 50]§):

1. **Inserta** el valor como en un BST (cuélgalo como hoja).
2. **Recalcula alturas y factores** desde la hoja hacia la raíz. Anota los factores en el dibujo.
3. **Busca el primer nodo** (más profundo) con §|f| = 2§. Si no hay, pasa al siguiente valor.
4. **Identifica el caso** (Izq-Izq, Der-Der, Izq-Der, Der-Izq) y **aplica la rotación** ([[av-casos]]).
5. **Dibuja el árbol resultante** y verifica que es BST y AVL.
6. Cuenta rotaciones y compara la **altura final** con la del BST sin balancear.`,
    codigo: {
      titulo: 'Insertar 10, 20, 30, 40, 50, 25 (S7-C1, d.15-16): árbol tras cada inserción y vista de lado',
      src: BASE + R`
def mostrar(n, prof=0):                  # imprime el árbol "de lado" (raíz a la izquierda)
    if n is None:
        return
    mostrar(n.der, prof + 1)
    print("    " * prof + str(n.v))
    mostrar(n.izq, prof + 1)

raiz = None
for v in [10, 20, 30, 40, 50, 25]:
    raiz = insertar(raiz, v)             # reasigna la raíz: una rotación puede cambiarla
    print("inserto", v, "->", nota(raiz), "| rotaciones simples acumuladas:", rotaciones[0])
print("altura final:", alt(raiz))
mostrar(raiz)
`,
      esperado: 'inserto 10 -> 10 | rotaciones simples acumuladas: 0\ninserto 20 -> 10(,20) | rotaciones simples acumuladas: 0\ninserto 30 -> 20(10,30) | rotaciones simples acumuladas: 1\ninserto 40 -> 20(10,30(,40)) | rotaciones simples acumuladas: 1\ninserto 50 -> 20(10,40(30,50)) | rotaciones simples acumuladas: 2\ninserto 25 -> 30(20(10,25),40(,50)) | rotaciones simples acumuladas: 4\naltura final: 2\n        50\n    40\n30\n        25\n    20\n        10'
    },
    ejemplo: R`
**El ejemplo completo de la clase (d.15-16), inserción por inserción:**

| Inserto | Árbol antes de rotar | ¿Desbalance? | Árbol resultante |
|---|---|---|---|
| 10 | §10§ | no | §10§ |
| 20 | §10(,20)§ | no (§f(10) = −1§) | §10(,20)§ |
| 30 | §10(,20(,30))§ | **sí, en 10** (§f = −2§): **Der-Der** | **rot. izquierda** → §20(10,30)§ |
| 40 | §20(10,30(,40))§ | no (§f(20) = −1§) | §20(10,30(,40))§ |
| 50 | §20(10,30(,40(,50)))§… | **sí, en 30** (§f = −2§): **Der-Der** | **rot. izquierda en 30** → §20(10,40(30,50))§ |
| 25 | §20(10,40(30(25,),50))§ | **sí, en 20** (§f = −2§): **Der-Izq** | **doble**: der. en 40, izq. en 20 → **§30(20(10,25),40(,50))§** |

- **Altura final 2** (§∼ log₂ n§) frente a **4** de un BST con el mismo orden de inserción (la cadena §10→20→30→40→50§, con el 25 colgado a la izquierda del 30).
- **Rotaciones**: 3 correcciones (2 simples + 1 doble = 4 rotaciones simples en total). **Cada inserción disparó a lo sumo una corrección.**

**Actividad en parejas (§[10, 20, 30, 40, 50]§):** altura final **2** (el BST sin balanceo da una lista de altura 4); **2 rotaciones** (ambas simples a la izquierda).

El ejemplo interactivo inserta **18 valores**; avanza paso a paso y verás el factor de cada nodo (en rojo en ±2) justo antes de cada rotación.`,
    complejidad: R`
- **Inserción**: descenso §O(log n)§ + regreso actualizando alturas §O(log n)§ + una corrección §O(1)§ ⇒ **§O(log n)§** en el peor caso, **garantizado** porque la altura es §O(log n)§.
- **Construir un AVL de §n§ valores**: §O(n log n)§ en el peor caso (frente a §O(n²)§ de un BST con datos ordenados).
- **Espacio**: §O(n)§ nodos + §O(log n)§ de pila.
- **Por qué «a lo sumo una corrección»**: tras la rotación, el subárbol vuelve a tener la altura que tenía **antes** de la inserción; ningún ancestro ve cambiar su altura y por tanto ninguno se desbalancea.
- **Cada rotación es §O(1)§**; la doble son dos.`,
    errores: R`
- **No reasignar la raíz** (§raiz = insertar(raiz, v)§): se pierde el árbol cuando una rotación cambia la raíz.
- **Rebalancear solo en el nodo insertado** y no subir por el camino hacia la raíz.
- **Olvidar recalcular alturas tras rotar** o antes de calcular el balance.
- **Elegir el caso con el balance equivocado** o comparar con el hijo equivocado (§n.izq.v§ frente a §n.der.v§).
- **Rotar en el nodo insertado** en vez de en el **primer nodo desbalanceado**.
- **Creer que la inserción puede requerir varias correcciones**: eso ocurre en la **eliminación**, no en la inserción.`,
    preguntas: [
      ['Describe el algoritmo de inserción en un AVL.', 'Se inserta como en un BST (colgando la hoja) y se regresa por el camino hacia la raíz; en cada nodo se recalcula altura y factor; si §|factor| ≥ 2§ se corrige según el caso (Izq-Izq: rotación derecha; Der-Der: izquierda; Izq-Der: izquierda del hijo y derecha; Der-Izq: derecha del hijo e izquierda).'],
      ['Inserta §[10, 20, 30, 40, 50]§ en un AVL: dibuja el árbol tras cada inserción, indica dónde hay desbalance, la altura final y cuántas rotaciones se hicieron.', 'Tras 30: desbalance Der-Der en 10 ⇒ rot. izquierda ⇒ §20(10,30)§. Tras 50: Der-Der en 30 ⇒ rot. izquierda ⇒ §20(10,40(30,50))§. Altura final 2 (el BST sin balancear daría altura 4). Total: 2 rotaciones.'],
      ['¿Qué ocurre al insertar 25 en §20(10,40(30,50))§?', 'Desbalance **Der-Izq** en 20 (§f = −2§): rotación derecha en 40 y luego izquierda en 20 ⇒ §30(20(10,25),40(,50))§.'],
      ['¿Cuántas rotaciones puede necesitar una inserción?', 'A lo sumo una corrección (una rotación simple o una doble).']
    ],
    resumen: R`
- **Insertar** = BST + subir por el camino: **actualizar altura y factor**, rotar en el **primer** nodo con §|f| ≥ 2§.
- Caso por el **valor insertado** (§v < n.izq.v§…).
- Siempre **§raiz = insertar(raiz, v)§**.
- **A lo sumo una corrección** por inserción; §O(log n)§.
- §[10,20,30,40,50]§ → altura 2, 2 rotaciones; +25 → doble rotación → §30(20(10,25),40(,50))§.`
  });

  B.tema({
    id: 'av-eliminacion', area: 'av', titulo: 'Eliminación en un AVL: sucesor, rebalanceo y varias rotaciones', fuente: 'S7-C1 · diap. 19, 37, 44', nivel: 7,
    conceptos: ['av_eliminar'], interactivo: ['avl-eliminar'],
    definicion: R`
**Eliminar de un AVL** también tiene **dos pasos**:

1. **Borrar como en un BST**: hoja → quitarla; un solo hijo → reemplazar el nodo por ese hijo; **dos hijos** → copiar en el nodo el valor del **sucesor inorden** (el **mínimo del subárbol derecho**) y borrar ese sucesor (que tiene a lo sumo un hijo).
2. **Rebalancear por el camino**: en cada nodo hacia la raíz, recalcular altura y factor; si §|factor| ≥ 2§, rotar. **Aquí el caso se decide por el factor del hijo** (no por un valor insertado).

**A diferencia de la inserción, un borrado puede requerir varias rotaciones** subiendo por el camino (hasta §O(log n)§).`,
    intuicion: R`
Borrar un nodo puede **acortar** un subárbol y hacer que su padre quede pesado hacia el otro lado. Esa corrección **puede acortar a su vez** el subárbol, desbalanceando al abuelo, y así hasta la raíz: por eso la eliminación puede encadenar varias rotaciones, mientras que en la inserción la primera corrección «devuelve la altura que había» y se acaba el problema.

Como no hay un «valor insertado» que indique por dónde cayó el desbalance, se mira **al hijo más pesado**: su propio factor dice si el desbalance es recto o zigzag.`,
    formal: R`
**Decisión del caso en la eliminación** (S7-C1, d.19 y 44), con §b = balance(n)§:

| Condición | Caso | Acción |
|---|---|---|
| §b > 1§ y §balance(n.izq) ≥ 0§ | Izq-Izq | §rotar_derecha(n)§ |
| §b > 1§ y §balance(n.izq) < 0§ | Izq-Der | §n.izq = rotar_izquierda(n.izq)§; luego §rotar_derecha(n)§ |
| §b < −1§ y §balance(n.der) ≤ 0§ | Der-Der | §rotar_izquierda(n)§ |
| §b < −1§ y §balance(n.der) > 0§ | Der-Izq | §n.der = rotar_derecha(n.der)§; luego §rotar_izquierda(n)§ |

- **Nota**: el factor del hijo **puede ser 0** en la eliminación (no ocurre en la inserción); en ese caso se trata como **recto** y basta **una** rotación simple.
- **Sustituto**: en el **AVL** se usa el **sucesor** inorden (mínimo del derecho); en el **BST** de la clase se usó el predecesor. Ambos son válidos.
- **Número de rotaciones**: hasta una **por nivel** del camino de regreso ⇒ hasta §O(log n)§ rotaciones en total.`,
    procedimiento: R`
**Para eliminar §v§ de un AVL a mano:**

1. **Borra como en un BST**: hoja, un hijo, o dos hijos con el **sucesor** (el menor del subárbol derecho: baja a la derecha una vez y luego siempre a la izquierda).
2. **Sube por el camino** desde donde se quitó el nodo: en cada ancestro recalcula **altura y factor**.
3. Si aparece §|f| = 2§ en un nodo §z§, mira el **factor de su hijo más pesado** §y§:
   - mismo signo o §0§ → **rotación simple en §z§**;
   - signo contrario → **doble rotación**.
4. **Sigue subiendo** tras rotar: la altura del subárbol pudo bajar y desbalancear a un ancestro.
5. Termina cuando llegues a la raíz. Verifica que sea BST y AVL.`,
    codigo: {
      titulo: 'Eliminación AVL con el sucesor (S7-C1, d.44) sobre un árbol de Fibonacci donde se encadenan 2 rotaciones',
      src: BASE + ELIMINAR + R`
def fib_avl():                           # AVL de 12 nodos con el mínimo de nodos para altura 4 (todo factor +1 o 0)
    return N(8, N(5, N(3, N(2, N(1)), N(4)), N(7, N(6))), N(11, N(10, N(9)), N(12)))

arbol = fib_avl()
print("árbol inicial:", nota(arbol), "| altura:", alt(arbol))
for v in [12, 8, 1]:
    arbol = fib_avl()
    rotaciones[0] = 0
    arbol = eliminar(arbol, v)
    print("eliminar", v, "->", nota(arbol), "| rotaciones:", rotaciones[0], "| altura:", alt(arbol))
`,
      esperado: 'árbol inicial: 8(5(3(2(1,),4),7(6,)),11(10(9,),12)) | altura: 4\neliminar 12 -> 5(3(2(1,),4),8(7(6,),10(9,11))) | rotaciones: 2 | altura: 3\neliminar 8 -> 5(3(2(1,),4),9(7(6,),11(10,12))) | rotaciones: 1 | altura: 3\neliminar 1 -> 8(5(3(2,4),7(6,)),11(10(9,),12)) | rotaciones: 0 | altura: 3'
    },
    ejemplo: R`
**Eliminar 12 del árbol de Fibonacci §8(5(3(2(1,),4),7(6,)),11(10(9,),12))§** (cada nodo tiene factor §+1§ o §0§):

1. Se borra la hoja §12§: §11§ queda con un solo hijo §10(9,)§ ⇒ §f(11) = +2§. Su hijo §10§ tiene §f = +1 ≥ 0§ ⇒ **Izq-Izq**: **rotación derecha en 11** ⇒ §10(9,11)§, que ahora tiene altura 1 (antes 2).
2. Al subir, la raíz §8§ tiene izquierda de altura 3 y derecha de altura 1 ⇒ §f(8) = +2§. Su hijo §5§ tiene §f = +1 ≥ 0§ ⇒ **Izq-Izq**: **rotación derecha en 8** ⇒ §5(3(2(1,),4),8(7(6,),10(9,11)))§.

**Total: 2 rotaciones** (una por nivel afectado) y la altura bajó de 4 a 3. En la inserción esto **nunca** ocurre.

- **Eliminar 8** (raíz con dos hijos): el sucesor es **9** (mínimo del subárbol derecho); se copia en la raíz y se borra el 9 de abajo, con lo que el subárbol derecho baja a altura 1 y la raíz queda con §f = +2§ ⇒ **1 rotación derecha** (sube el 5).
- **Eliminar 1** (hoja sin consecuencias): **0 rotaciones**: nadie queda desbalanceado.

**Caso con factor del hijo = 0** (propio de la eliminación): si el hijo más pesado tiene §f = 0§ se trata como **recto** (una rotación simple) y, tras rotar, el subárbol conserva la altura que tenía antes de borrar, así que el rebalanceo **se detiene** ahí.

El ejemplo interactivo elimina cinco valores de un AVL de 14 nodos; los borrados del lado derecho desbalancean la raíz.`,
    complejidad: R`
- **Eliminación**: buscar §O(log n)§ + localizar el sucesor §O(log n)§ + subir por el camino §O(log n)§ con **hasta §O(log n)§ rotaciones** (cada una §O(1)§) ⇒ **§O(log n)§** en el peor caso.
- **Comparación con la inserción**: la inserción hace **a lo sumo 1** corrección; la eliminación, **hasta una por nivel**.
- **Por qué pueden encadenarse**: una rotación puede **acortar** el subárbol (altura −1), lo que desbalancea al ancestro siguiente; en la inserción la corrección restaura la altura previa.
- **Peor caso típico**: el árbol de Fibonacci (mínimo de nodos para una altura dada), donde cada nodo está justo al límite de balance.
- **Espacio**: §O(log n)§ de pila.`,
    errores: R`
- **Decidir el caso con un «valor insertado»** (no existe en la eliminación): se decide con el **balance del hijo**.
- **Detenerse tras la primera rotación**: puede hacer falta seguir subiendo.
- **Tratar §balance(hijo) = 0§ como zigzag**: en la eliminación se trata como **recto** (una sola rotación).
- **Usar el predecesor** en un AVL sin avisar: la clase usa el **sucesor** (aunque el predecesor también es válido, el código de referencia usa el sucesor).
- **Olvidar eliminar el nodo sucesor de su posición original.**
- **No recalcular alturas** al regresar de la recursión.`,
    preguntas: [
      ['¿En qué se diferencia el rebalanceo tras una eliminación del de una inserción?', 'El caso se decide por el **factor del hijo** (no por el valor insertado) y un borrado puede requerir **varias rotaciones** subiendo por el camino (hasta §O(log n)§), mientras que una inserción necesita a lo sumo una corrección.'],
      ['¿Qué sustituto se usa en el AVL para eliminar un nodo con dos hijos?', 'El **sucesor inorden**: el mínimo del subárbol derecho. Se copia su valor y se elimina ese sucesor (que tiene a lo sumo un hijo).'],
      ['Con §b > 1§ y §balance(n.izq) = 0§, ¿qué rotación se aplica?', 'Una **rotación derecha** simple en §n§ (se trata como Izq-Izq: §balance(n.izq) ≥ 0§).'],
      ['¿Por qué la eliminación puede encadenar rotaciones y la inserción no?', 'Porque la corrección tras eliminar puede acortar el subárbol y desbalancear al ancestro siguiente; tras insertar, la corrección restaura la altura que había antes y los ancestros quedan equilibrados.']
    ],
    resumen: R`
- **Eliminar** = borrado BST (con **sucesor** si hay dos hijos) + subir rebalanceando.
- Caso por el **factor del hijo**: §balance(izq) ≥ 0§ → derecha; §< 0§ → izq. del hijo + derecha; análogo a la derecha (§≤ 0§ / §> 0§).
- Puede requerir **varias rotaciones** (hasta §O(log n)§); la inserción solo una corrección.
- Árbol de Fibonacci: borrar 12 → 2 rotaciones, altura 4 → 3.
- Costo total §O(log n)§.`
  });

  B.tema({
    id: 'av-complejidad', area: 'av', titulo: 'Complejidad del AVL: por qué la altura es O(log n)', fuente: 'S7-C1 · diap. 5, 9, 18-19, 38', nivel: 7, comp: true,
    conceptos: ['av_complejidad'], interactivo: ['avl-insertar'],
    definicion: R`
Un AVL con §n§ nodos tiene **altura §O(log n)§**; por eso **búsqueda, inserción y eliminación cuestan §O(log n)§ en el peor caso**. Las rotaciones cuestan §O(1)§ cada una; una inserción necesita a lo sumo **una corrección** y una eliminación hasta §O(log n)§.

| Operación | Costo en el AVL |
|---|---|
| Búsqueda | §O(log n)§ |
| Inserción | §O(log n)§ (a lo sumo una corrección: simple o doble) |
| Eliminación | §O(log n)§ (hasta §O(log n)§ rotaciones) |
| Rotación | §O(1)§ |
| Recorrido inorden | §O(n)§ |`,
    intuicion: R`
La regla «|f| ≤ 1» obliga a que cada subárbol sea «casi tan alto» como su hermano. ¿Cuántos nodos necesita, como mínimo, un AVL de altura §h§? Para que sea **lo más flaco posible** debe usar un subárbol de altura §h − 1§ y **el más flaco** del otro lado, de altura §h − 2§: la cantidad mínima de nodos crece como **Fibonacci** (se multiplica por ≈ 1,6 con cada nivel). Si con altura §h§ necesitas **al menos** una cantidad exponencial de nodos, entonces con §n§ nodos la altura **no puede pasar de §≈ log n§**.

Es la idea inversa de la de un árbol degenerado, donde cada nivel solo añade un nodo.`,
    formal: R`
[comp]
**Cota de la altura.** Sea §N(h)§ el **mínimo** de nodos de un AVL de altura §h§. Un AVL mínimo de altura §h§ tiene un subárbol de altura §h − 1§ y otro de altura §h − 2§ (ambos mínimos):

~~~
N(−1) = 0,   N(0) = 1,   N(h) = N(h−1) + N(h−2) + 1
N(h):  1, 2, 4, 7, 12, 20, 33, 54, 88, …   (h = 0, 1, 2, …)
~~~

§N(h)§ crece como Fibonacci (§N(h) + 1 = F(h+3)§), es decir, exponencialmente (≈ §φʰ§ con §φ ≈ 1,618§). Por tanto §n ≥ N(h)§ implica **§h < 1,44 · log₂(n + 2)§**: la altura de un AVL **nunca excede ≈ 1,44 veces** la de un árbol perfecto.
[/comp]

**Lo que dice la clase (diapositivas 5, 9, 18-19):**

- La altura se mantiene en §O(log n)§ tras cada inserción o eliminación.
- **Una rotación es §O(1)§**; rebalancear tras una inserción requiere a lo sumo §O(log n)§ de trabajo (subir por el camino).
- **Inserción**: a lo sumo una rotación (simple o doble). **Eliminación**: puede requerir varias, hasta §O(log n)§.
- **Compromiso AVL vs. rojo-negro**: el AVL es más estricto (mejor para lectura) y hace **más rotaciones** (peor para escritura).`,
    procedimiento: R`
**Para justificar la complejidad de una operación AVL** en un examen:

1. **Búsqueda**: un camino raíz–hoja, §h = O(log n)§ ⇒ §O(log n)§.
2. **Inserción**: descenso §O(log n)§ + regreso actualizando §O(log n)§ + **una** corrección §O(1)§ ⇒ §O(log n)§.
3. **Eliminación**: descenso + sucesor + regreso con **hasta §O(log n)§** correcciones §O(1)§ ⇒ §O(log n)§.
4. **Justifica la altura**: «el AVL mantiene |f| ≤ 1, lo que fuerza que con altura §h§ haya un número exponencial de nodos; por eso §h = O(log n)§».
5. Declara **variable y caso** («peor caso, respecto de §n§ = número de nodos»).`,
    codigo: {
      titulo: 'Altura del AVL con datos ordenados y número mínimo de nodos N(h)',
      src: BASE + R`
for n in [5, 15, 31, 100, 1000]:
    raiz = None
    for v in range(1, n + 1):             # datos ordenados: el peor caso del BST simple
        raiz = insertar(raiz, v)
    print(n, "valores ordenados -> altura del AVL:", alt(raiz))

def minimo_nodos(h):                      # N(h) = N(h-1) + N(h-2) + 1, con N(-1) = 0 y N(0) = 1
    a, b = 0, 1
    for _ in range(h):
        a, b = b, a + b + 1
    return b

print("N(h) para h = 0..8:", [minimo_nodos(h) for h in range(9)])

def altura_maxima(n):                     # la mayor altura posible de un AVL con n nodos
    h = 0
    while minimo_nodos(h + 1) <= n:
        h += 1
    return h

print("altura máxima de un AVL de 1000 nodos:", altura_maxima(1000), "| altura de un árbol perfecto:", 9)
`,
      esperado: '5 valores ordenados -> altura del AVL: 2\n15 valores ordenados -> altura del AVL: 3\n31 valores ordenados -> altura del AVL: 4\n100 valores ordenados -> altura del AVL: 6\n1000 valores ordenados -> altura del AVL: 9\nN(h) para h = 0..8: [1, 2, 4, 7, 12, 20, 33, 54, 88]\naltura máxima de un AVL de 1000 nodos: 13 | altura de un árbol perfecto: 9'
    },
    ejemplo: R`
**Cuántos nodos mínimo para cada altura** (el árbol de Fibonacci):

| Altura §h§ | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| Mín. nodos §N(h)§ | 1 | 2 | 4 | 7 | 12 | 20 | 33 | 54 | 88 |

Con **1000 nodos**: la altura de un AVL está entre **9** (árbol casi perfecto) y **13** (el más flaco permitido, porque §N(13) = 986 ≤ 1000 < N(14) = 1596§). Un BST sin balancear podría llegar a **999**.

**Con 10⁶ nodos:** altura ≤ §1,44 · log₂(10⁶ + 2) ≈ 28,7§, o sea **≤ 28**; un árbol perfecto tendría 19. Buscar cuesta **a lo sumo 29 comparaciones**.

**Ejemplo interactivo:** el AVL de 18 nodos tiene altura 4 (un árbol perfecto de 18 nodos tendría altura 4).

**Pregunta de la clase:** «¿Por qué es §O(log n)§ rebalancear tras una inserción?» → porque se sube por el camino (altura §O(log n)§) y cada nodo hace trabajo constante; solo hay a lo sumo una corrección §O(1)§.`,
    complejidad: R`
- **Altura**: §⌊log₂ n⌋ ≤ h < 1,44 · log₂(n + 2)§ ⇒ **§Θ(log n)§**.
- **Búsqueda** §Θ(log n)§ en el peor caso; **inserción** y **eliminación** §O(log n)§.
- **Rotaciones por operación**: inserción ≤ 1 corrección; eliminación ≤ §O(log n)§.
- **Memoria extra**: un entero (altura) por nodo ⇒ §O(n)§.
- **Costo de construir un AVL de §n§ nodos**: §O(n log n)§.
- **Justificación de la cota**: §N(h)§ crece exponencialmente (Fibonacci); invertir esa relación da §h = O(log n)§ con constante ≈ 1,44.`,
    errores: R`
- **Decir que el AVL es «perfecto»**: solo exige |f| ≤ 1; su altura puede ser hasta ≈ 1,44 veces la de un perfecto.
- **Olvidar la diferencia inserción/eliminación en el número de rotaciones.**
- **Dar «O(log n)» sin justificar la altura.**
- **Confundir §O(log n)§ amortizado con peor caso**: en el AVL es peor caso.
- **Creer que el AVL elimina el costo del reacomodo**: lo traslada a cada escritura (alturas y rotaciones).`,
    preguntas: [
      ['Da la complejidad de buscar, insertar y eliminar en un AVL y justifica.', 'Todas §O(log n)§ en el peor caso: la altura es §O(log n)§ porque |f| ≤ 1 fuerza un número exponencial de nodos por altura; cada rotación es §O(1)§; la inserción hace a lo sumo una corrección y la eliminación hasta §O(log n)§.'],
      ['¿Cuántas rotaciones puede necesitar una inserción y cuántas una eliminación?', 'Inserción: a lo sumo una corrección (simple o doble). Eliminación: hasta §O(log n)§ rotaciones, una por nivel en el peor caso.'],
      ['¿Cuál es el mínimo de nodos de un AVL de altura 4?', '**12** (§N(4) = N(3) + N(2) + 1 = 7 + 4 + 1§).'],
      ['¿Cuánto vale, como máximo, la altura de un AVL de 1000 nodos?', '13 (porque §N(13) = 986 ≤ 1000 < N(14) = 1596§); es mayor que el 9 del árbol perfecto, pero mucho menor que 999 de un BST degenerado.']
    ],
    resumen: R`
- AVL: **altura §Θ(log n)§** (≤ ≈ 1,44 · log₂ n) ⇒ búsqueda/inserción/eliminación **§O(log n)§**.
- Rotación §O(1)§; inserción ≤ **1** corrección; eliminación ≤ §O(log n)§.
- Mínimo de nodos §N(h) = N(h−1) + N(h−2) + 1§: 1, 2, 4, 7, 12, 20, 33…
- Con 1000 nodos: altura entre 9 y 13 (BST degenerado: 999).
- Cuesta un campo extra (la altura) por nodo.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
