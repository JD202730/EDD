/* teoria_bs.js — Biblioteca: área Árboles binarios de búsqueda (fuente: S6-C2, BST, diap. 4-18) */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  B.tema({
    id: 'bs-prop', area: 'bs', titulo: 'La propiedad del BST y cómo verificarla', fuente: 'S6-C2 · diap. 4-5, 16', nivel: 6, comp: true,
    conceptos: ['bs_prop', 'bs_errores'], interactivo: ['bst-verificar'],
    definicion: R`
Un **árbol binario de búsqueda (BST)** es un árbol binario donde, para **cada nodo con valor §v§**:

- **todos** los valores del subárbol **izquierdo** son **< §v§**;
- **todos** los valores del subárbol **derecho** son **> §v§**.

La propiedad vale **recursivamente** en cada subárbol. Nace de una pregunta de la clase: la búsqueda binaria descarta la mitad del arreglo en cada paso (§O(log n)§) pero exige un arreglo **ordenado y contiguo**, caro de mantener al insertar. ¿Y si los datos estuvieran en un árbol donde en cada nodo se decide **izquierda o derecha**?`,
    intuicion: R`
Es un **fichero ordenado en forma de árbol**: en cada nodo, todo lo menor queda a un lado y todo lo mayor al otro. Buscar es como adivinar un número con pistas «más alto/más bajo»: en cada comparación **descartas un subárbol completo**.

El detalle que más se pierde: la propiedad **no es solo con los hijos inmediatos**. Un nodo en el subárbol derecho de la raíz debe ser mayor que la raíz **aunque esté muy abajo y su padre inmediato sí lo deje pasar**. Es la trampa de la lista de errores de la clase: «verificar la propiedad de BST solo con los hijos inmediatos: debe valer con **todo el subárbol**».`,
    formal: R`
**Definición** (S6-C2, d.5). Para todo nodo §x§ con valor §v§:

~~~
∀ y ∈ subárbol_izq(x):  y.valor < v
∀ y ∈ subárbol_der(x):  y.valor > v
~~~

**Árbol de la clase:** §12(5(3,10),24(15,30))§: todo lo que está a la izquierda de 12 (§5, 3, 10§) es menor; todo lo de la derecha (§24, 15, 30§) es mayor, y la propiedad se repite en §5§ y §24§.

**Convenio del curso:** **sin duplicados** (si §v == nodo.valor§ el valor ya existe y no se inserta de nuevo). Permitir duplicados sin una política clara rompe la unicidad de la búsqueda.

**Consecuencia clave:** el **recorrido inorden** de un BST visita los valores en **orden ascendente** ([[bs-inorden]]).

[comp]
**Verificación correcta con límites.** Para comprobar que un árbol es un BST se pasa a cada llamada el **intervalo abierto permitido** §(lo, hi)§: la raíz admite cualquier valor; al bajar a la izquierda el límite superior pasa a ser el valor del nodo; al bajar a la derecha, el límite inferior. Alternativa equivalente: el **inorden debe ser estrictamente creciente**.
[/comp]`,
    procedimiento: R`
**Para verificar si un árbol es BST (a mano):**

1. Para **cada nodo §x§**, mira **todo** su subárbol izquierdo: ¿todos son menores que §x§?
2. Mira **todo** su subárbol derecho: ¿todos son mayores?
3. Una forma práctica: escribe el **inorden**; si **no** es estrictamente creciente, no es BST.
4. O anota para cada nodo el **intervalo permitido** §(lo, hi)§ heredado de sus ancestros y comprueba que su valor cae dentro.

**Para verificarlo en código:**

1. Función §es_bst(n, lo, hi)§; el caso base (§n is None§) devuelve §True§.
2. Si §n.valor§ sale del intervalo, devuelve §False§.
3. Recursa: izquierda con §(lo, n.valor)§ y derecha con §(n.valor, hi)§.`,
    codigo: {
      titulo: 'Verificar el BST: solo hijos inmediatos (incorrecto) frente a límites (correcto)',
      src: R`
class NodoArbol:
    def __init__(self, valor, izq=None, der=None):
        self.valor = valor
        self.izq = izq
        self.der = der

def es_bst_ingenuo(n):                       # INCORRECTO: solo mira a los hijos inmediatos
    if n is None:
        return True
    if n.izq is not None and n.izq.valor >= n.valor:
        return False
    if n.der is not None and n.der.valor <= n.valor:
        return False
    return es_bst_ingenuo(n.izq) and es_bst_ingenuo(n.der)

def es_bst(n, lo=None, hi=None):             # CORRECTO: intervalo permitido (lo, hi)
    if n is None:
        return True
    if lo is not None and n.valor <= lo:
        return False
    if hi is not None and n.valor >= hi:
        return False
    return es_bst(n.izq, lo, n.valor) and es_bst(n.der, n.valor, hi)

N = NodoArbol
clase = N(12, N(5, N(3), N(10)), N(24, N(15), N(30)))       # árbol de la clase
falso = N(10, N(5, None, N(15)), N(20))                      # 15 está a la izquierda de 10 pero es mayor
print("árbol de la clase:", es_bst_ingenuo(clase), es_bst(clase))
print("árbol falso      :", es_bst_ingenuo(falso), es_bst(falso))
`,
      esperado: 'árbol de la clase: True True\nárbol falso      : True False'
    },
    ejemplo: R`
**El árbol «falso»** §10(5(,15),20)§:

~~~
      10
     /  \
    5    20
     \
      15       <- 15 > 5 (cumple con su padre) pero 15 > 10 y está a la IZQUIERDA de 10
~~~

- **Verificación ingenua** (solo hijos inmediatos): §10§ con §5 < 10§ y §20 > 10§ ✔; §5§ con hijo derecho §15 > 5§ ✔ ⇒ dice «sí es BST». **Incorrecto.**
- **Verificación con límites:** al llegar a §15§ el intervalo permitido es §(5, 10)§ (viene de la izquierda de §10§ y de la derecha de §5§); como §15 ≥ 10§ **viola** el límite ⇒ **no es BST**. ✔
- **Con inorden:** §5, 15, 10, 20§ **no es creciente** ⇒ no es BST.

**El ejemplo interactivo** construye un BST de 13 nodos, lo verifica, luego cuelga un nodo §55§ en un lugar donde cumple con su padre inmediato (§55 > 45§) pero viola el intervalo (§< 50§), y muestra qué intervalo se rompe.`,
    complejidad: R`
- **Verificación con límites**: cada nodo se visita **una vez** con trabajo constante ⇒ **§O(n)§** en tiempo; pila §O(h)§.
- **Verificación vía inorden**: §O(n)§ en tiempo (un recorrido) y §O(n)§ de espacio si se guarda la lista (se puede reducir a §O(h)§ recordando solo el valor anterior).
- La **propiedad de orden** es lo que hace que búsqueda e inserción cuesten §O(h)§ en lugar de §O(n)§: en cada nodo se descarta un subárbol completo.
- Un árbol que **no** cumple la propiedad no se puede buscar por comparaciones: el algoritmo de búsqueda daría respuestas erróneas.`,
    errores: R`
- **Verificar la propiedad solo con los hijos inmediatos**: debe valer con **todo** el subárbol.
- **Permitir duplicados sin una política clara** (rompe la unicidad de la búsqueda; el curso no admite duplicados).
- **Confundir BST con árbol binario cualquiera**: un árbol binario no tiene por qué cumplir la propiedad de orden.
- **Usar §<=§ y §>=§ en la verificación** cuando no se admiten duplicados (la desigualdad es **estricta**).
- **Creer que «izquierda menor, derecha mayor» se comprueba con una sola comparación por nodo**.
- **Olvidar que la propiedad es recursiva**: cada subárbol es también un BST.`,
    preguntas: [
      ['Enuncia la propiedad de orden del BST. ¿Vale solo con los hijos o con todo el subárbol?', 'Para cada nodo con valor §v§: todo el subárbol izquierdo es < §v§ y todo el derecho es > §v§. Vale con **todo el subárbol**, de forma recursiva, no solo con los hijos inmediatos.'],
      ['Un árbol §10(5(,15),20)§, ¿es BST? Justifica.', 'No: el 15 está en el subárbol izquierdo de 10 pero es mayor que 10, aunque cumpla con su padre inmediato (15 > 5). El inorden §5, 15, 10, 20§ no es creciente.'],
      ['¿Cómo se verifica correctamente que un árbol es BST en código?', 'Pasando un intervalo permitido §(lo, hi)§ a cada llamada recursiva: a la izquierda el límite superior pasa a ser el valor del nodo; a la derecha, el inferior. Complejidad §O(n)§.'],
      ['¿Por qué no se permiten duplicados en el curso?', 'Porque sin una política clara rompen la unicidad de la búsqueda; si §v == nodo.valor§ el valor ya existe y no se inserta.']
    ],
    resumen: R`
- **BST**: izquierda < nodo < derecha, **para todo el subárbol** y de forma recursiva.
- Sin duplicados en el curso (desigualdades estrictas).
- El **inorden** de un BST es creciente.
- Verificar: **intervalo (lo, hi)** por llamada, §O(n)§. Solo mirar hijos inmediatos es un error.
- La propiedad permite descartar un subárbol por comparación: búsqueda/inserción §O(h)§.`
  });

  B.tema({
    id: 'bs-buscar', area: 'bs', titulo: 'Búsqueda en un BST (y mínimo / máximo)', fuente: 'S6-C2 · diap. 6, 13', nivel: 6, comp: true,
    conceptos: ['bs_buscar', 'bs_minmax'], interactivo: ['bst-buscar'],
    definicion: R`
**Buscar** en un BST es **decidir izquierda o derecha** en cada nodo: si el valor buscado es **menor**, se baja por el hijo izquierdo; si es **mayor**, por el derecho; si es **igual**, se encontró; si se llega a §None§, **no está**. Cada comparación **descarta un subárbol completo**: costo **§O(h)§**.

El **mínimo** de un BST está en el nodo **más a la izquierda**; el **máximo**, en el **más a la derecha**: también §O(h)§.`,
    intuicion: R`
Es el juego de adivinar un número: «¿es mayor o menor que 12?». Con cada respuesta eliminas medio árbol (no medio arreglo: **todo un subárbol**). En el árbol de la clase, para hallar 10: §10 < 12§ ⇒ izquierda; §10 > 5§ ⇒ derecha; ¡encontrado! **Solo 3 comparaciones** en un árbol de 7 nodos.

Para el mínimo no hace falta comparar: la propiedad del BST garantiza que **lo menor está siempre hacia la izquierda**; solo bajas hasta que ya no haya hijo izquierdo. Lo mismo hacia la derecha para el máximo.`,
    formal: R`
**Código de la clase** (S6-C2, d.6):

~~~
def buscar(nodo, v):
    if nodo is None:   return False          # no está
    if v == nodo.valor: return True          # encontrado
    if v < nodo.valor:  return buscar(nodo.izq, v)
    else:               return buscar(nodo.der, v)
~~~

- **Correctitud** (por la propiedad del BST): si §v < nodo.valor§, **todo** valor igual a §v§ (si existe) está en el subárbol izquierdo; análogo a la derecha.
- Se sigue **un solo camino** raíz → (hoja o nodo): como máximo §h + 1§ comparaciones.
- **Mínimo/Máximo:** izquierda/derecha extrema, §O(h)§ (tabla de operaciones de la clase).

[comp]
**Versión iterativa:** el mismo recorrido con un §while§ (sin pila de llamadas, §O(1)§ de espacio extra): §actual = raiz; mientras actual no sea None: comparar y moverse§. Útil cuando el árbol es muy profundo.
[/comp]`,
    procedimiento: R`
**Para buscar §v§ a mano:**

1. Empieza en la **raíz**.
2. Compara §v§ con el valor del nodo actual:
   - **igual** → encontrado, fin;
   - **menor** → ve al **hijo izquierdo**;
   - **mayor** → ve al **hijo derecho**.
3. Si el hijo al que debes ir es **None**, **no está** (fin).
4. Anota el **camino** y cuenta las comparaciones.

**Para el mínimo/máximo:** baja siempre por la izquierda (mínimo) o por la derecha (máximo) hasta que no haya más hijos.`,
    codigo: {
      titulo: 'Búsqueda con camino recorrido, y mínimo / máximo',
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

def buscar(nodo, v, camino):
    if nodo is None:
        return False                          # no está
    camino.append(nodo.valor)
    if v == nodo.valor:
        return True                           # encontrado
    if v < nodo.valor:
        return buscar(nodo.izq, v, camino)    # está (si está) a la izquierda
    else:
        return buscar(nodo.der, v, camino)    # está (si está) a la derecha

def minimo(nodo):
    while nodo.izq is not None:
        nodo = nodo.izq
    return nodo.valor

def maximo(nodo):
    while nodo.der is not None:
        nodo = nodo.der
    return nodo.valor

raiz = None
for v in [12, 5, 24, 3, 10, 15, 30]:          # árbol de la clase
    raiz = insertar(raiz, v)

for x in [10, 15, 13]:
    c = []
    print("buscar", x, "->", buscar(raiz, x, c), "| camino:", c)
print("mínimo:", minimo(raiz), "| máximo:", maximo(raiz))
`,
      esperado: 'buscar 10 -> True | camino: [12, 5, 10]\nbuscar 15 -> True | camino: [12, 24, 15]\nbuscar 13 -> False | camino: [12, 24, 15]\nmínimo: 3 | máximo: 30'
    },
    ejemplo: R`
**Buscar 10 en §12(5(3,10),24(15,30))§** (diapositiva 6):

| Nodo visitado | Comparación | Decisión |
|---|---|---|
| 12 | 10 < 12 | ir a la **izquierda** |
| 5 | 10 > 5 | ir a la **derecha** |
| 10 | 10 == 10 | **encontrado** |

**3 comparaciones** en un árbol de 7 nodos (una búsqueda secuencial haría hasta 7).

**Buscar 13 (no está):** §12 → 24 → 15§; como §13 < 15§ hay que ir a la izquierda de 15, que es §None§ ⇒ **no está**. Camino de 3 nodos.

**Mínimo y máximo:** mínimo = bajar por la izquierda desde 12: §12 → 5 → 3§ ⇒ **3**; máximo = por la derecha: §12 → 24 → 30§ ⇒ **30**.

En el ejemplo interactivo, el programa construye un BST de 17 nodos y ejecuta tres búsquedas; el nodo resaltado es el que visita la llamada actual.`,
    complejidad: R`
- **Búsqueda**: se desciende por **un solo camino** raíz → hoja ⇒ como máximo §h + 1§ comparaciones ⇒ **§O(h)§** en el peor caso.
- **Balanceado** (§h ≈ log₂ n§): **§O(log n)§**. **Degenerado** (§h = n − 1§): **§O(n)§**.
- **Mínimo/máximo**: **§O(h)§** (se baja por un borde).
- **Espacio**: recursiva §O(h)§ de pila; iterativa §O(1)§.
- La clase insiste: la complejidad es **§O(h)§, no §O(log n)§**: el árbol puede estar desbalanceado ([[bs-complejidad]]).`,
    errores: R`
- **Decir que la búsqueda es siempre §O(log n)§**: es §O(h)§; con datos ordenados el BST degenera y cuesta §O(n)§.
- **Olvidar el caso base §nodo is None§**: §AttributeError§.
- **Comparar al revés** (ir a la derecha cuando §v < nodo.valor§).
- **Olvidar el §return§** en las llamadas recursivas (devuelve §None§ en vez de §True/False§).
- **Buscar el mínimo comparando todos los nodos** (§O(n)§): basta bajar por la izquierda.
- **Confundir «predecesor inorden»** (mayor del subárbol izquierdo) con el hijo izquierdo.`,
    preguntas: [
      ['¿Cuántas comparaciones hace buscar 10 en §12(5(3,10),24(15,30))§?', '3: §10 < 12§ (izquierda), §10 > 5§ (derecha), §10 == 10§ (encontrado).'],
      ['¿Por qué la búsqueda en un BST es §O(h)§ y no siempre §O(log n)§?', 'Porque sigue un solo camino raíz-hoja de longitud a lo sumo §h§; si el árbol está balanceado §h ≈ log n§, pero si se inserta en orden creciente degenera en una lista (§h = n − 1§) y todo vuelve a ser §O(n)§.'],
      ['¿Dónde está el mínimo y el máximo de un BST y cuánto cuesta hallarlos?', 'El mínimo en el nodo más a la izquierda, el máximo en el más a la derecha; §O(h)§.'],
      ['Escribe la búsqueda recursiva en un BST.', 'Si §nodo is None§ → §False§; si §v == nodo.valor§ → §True§; si §v < nodo.valor§ → §buscar(nodo.izq, v)§; si no → §buscar(nodo.der, v)§.']
    ],
    resumen: R`
- **Buscar**: comparar y bajar a la izquierda (menor) o derecha (mayor); §None§ ⇒ no está.
- Un solo camino: **§O(h)§** (log n balanceado, n degenerado).
- **Mínimo** = extremo izquierdo; **máximo** = extremo derecho: §O(h)§.
- Ejemplo de clase: buscar 10 → 3 comparaciones.
- Caso base §is None§ y §return§ en cada llamada.`
  });

  B.tema({
    id: 'bs-insertar', area: 'bs', titulo: 'Inserción en un BST y por qué importa el orden', fuente: 'S6-C2 · diap. 8-9, 15-16, 19', nivel: 6,
    conceptos: ['bs_insertar', 'bs_ordenins'], interactivo: ['bst-insertar', 'bst-degenerado'],
    definicion: R`
**Insertar** en un BST es buscar el valor «como si fuera a encontrarse»; al llegar a un §None§, **ahí se cuelga el nuevo nodo como hoja** (izquierda si es menor, derecha si es mayor). Recorre **un solo camino raíz-hoja**: **§O(h)§**. Si el valor ya existe, no se duplica.

El **orden de inserción** determina la forma del árbol: insertar §[1, 2, 3, 4, 5]§ en orden crea una **lista** (altura 4); §[3, 2, 4, 1, 5]§ crea un árbol **balanceado** (altura 2).`,
    intuicion: R`
Insertar es **buscar el hueco donde debería estar** el valor: bajas comparando igual que en la búsqueda hasta un hijo vacío, y ahí lo cuelgas. **El árbol nunca se reorganiza**: los nodos viejos quedan donde estaban, y el nuevo es siempre una hoja.

Por eso importa el orden de llegada: si los datos llegan **ya ordenados**, cada valor nuevo es mayor que todos los anteriores y siempre se cuelga **a la derecha del último**: el árbol queda como una lista enlazada. Si llegan «mezclados», el árbol se reparte a ambos lados. Es la razón de que existan los **árboles auto-balanceados** (AVL, rojo-negro; [[av-problema]]).`,
    formal: R`
**Código de la clase** (S6-C2, d.8):

~~~
def insertar(nodo, v):
    if nodo is None:
        return NodoArbol(v)              # se cuelga aquí como hoja
    if v < nodo.valor:
        nodo.izq = insertar(nodo.izq, v)
    elif v > nodo.valor:
        nodo.der = insertar(nodo.der, v)
    # si v == nodo.valor: ya existe, no se duplica
    return nodo
~~~

- **Siempre se reasigna** el hijo (§nodo.izq = insertar(nodo.izq, v)§) y la raíz (§raiz = insertar(raiz, v)§): la función devuelve la raíz del subárbol.
- Se **preserva la propiedad del BST**: el valor se coloca exactamente donde la búsqueda lo habría hallado.
- La **forma final depende del orden** de inserción: §n§ valores distintos pueden dar hasta §Catalan(n)§ formas diferentes (de altura §⌊log₂ n⌋§ a §n − 1§).
- **Insertar datos ya ordenados** produce un árbol **degenerado**: altura §n − 1§.`,
    procedimiento: R`
**Para insertar §v§ a mano:**

1. Empieza en la raíz (si el árbol está vacío, §v§ es la raíz).
2. Compara: **menor** → izquierda; **mayor** → derecha; **igual** → ya existe, **no insertes**.
3. Repite hasta que el hijo al que debes ir sea §None§.
4. **Cuelga** el nuevo nodo ahí (como hoja).

**Para construir un BST con una secuencia:** inserta los valores **en el orden dado**, uno por uno. **Dibuja el árbol tras cada inserción** si piden el proceso.

**Para el «boleto de salida» de la clase** (insertar §[8, 3, 10, 1, 6, 14]§ y dar el inorden): árbol §8(3(1,6),10(,14))§ e inorden §1, 3, 6, 8, 10, 14§.`,
    codigo: {
      titulo: 'Insertar, mostrar el árbol y comparar el orden de inserción',
      src: R`
class NodoArbol:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

def insertar(nodo, v):
    if nodo is None:
        return NodoArbol(v)              # se cuelga aquí como hoja
    if v < nodo.valor:
        nodo.izq = insertar(nodo.izq, v)
    elif v > nodo.valor:
        nodo.der = insertar(nodo.der, v)
    return nodo                          # si v == nodo.valor: ya existe, no se duplica

def altura(n):
    return -1 if n is None else 1 + max(altura(n.izq), altura(n.der))

def a_nota(n):
    if n is None:
        return "_"
    if n.izq is None and n.der is None:
        return str(n.valor)
    sub = lambda x: "" if x is None else a_nota(x)
    return str(n.valor) + "(" + sub(n.izq) + "," + sub(n.der) + ")"

def construir(valores):
    raiz = None
    for v in valores:
        raiz = insertar(raiz, v)          # siempre se reasigna la raíz
    return raiz

for valores in ([1, 2, 3, 4, 5], [3, 2, 4, 1, 5], [8, 3, 10, 1, 6, 14], [12, 5, 24, 3, 10, 15, 30]):
    t = construir(valores)
    print(valores, "->", a_nota(t), "| altura:", altura(t))
print(a_nota(construir([5, 3, 5, 3, 8])))      # los duplicados no se insertan
`,
      esperado: '[1, 2, 3, 4, 5] -> 1(,2(,3(,4(,5)))) | altura: 4\n[3, 2, 4, 1, 5] -> 3(2(1,),4(,5)) | altura: 2\n[8, 3, 10, 1, 6, 14] -> 8(3(1,6),10(,14)) | altura: 2\n[12, 5, 24, 3, 10, 15, 30] -> 12(5(3,10),24(15,30)) | altura: 2\n5(3,8)'
    },
    ejemplo: R`
**Insertar 11 en §12(5(3,10),24(15,30))§** (diapositiva 8): §11 < 12§ → izquierda; §11 > 5§ → derecha; §11 > 10§ → derecha de §10§, que es §None§ ⇒ **se cuelga a la derecha de 10**.

**Pregunta de análisis (1) de la clase:**

| Orden de inserción | Árbol | Altura |
|---|---|---|
| §[1, 2, 3, 4, 5]§ | §1(,2(,3(,4(,5))))§ (una **lista**) | **4** |
| §[3, 2, 4, 1, 5]§ | §3(2(1,),4(,5))§ (balanceado) | **2** |

**Qué cambia y por qué importa:** con datos ordenados cada inserción recorre **todo el árbol** (§O(n)§); con datos mezclados recorre §≈ log n§. La **complejidad** pasa de §O(n)§ a §O(log n)§ por operación; de ahí que haya que balancear.

**Construcción paso a paso de §[8, 3, 10, 1, 6, 14]§** (boleto de salida): 8 raíz; 3 < 8 → izq; 10 > 8 → der; 1 < 8, < 3 → izq de 3; 6 < 8, > 3 → der de 3; 14 > 8, > 10 → der de 10. Inorden: **1, 3, 6, 8, 10, 14**.

El ejemplo interactivo inserta **22 valores** y el de «degenerado» compara 16 valores ordenados con 16 mezclados.`,
    complejidad: R`
- **Inserción**: un solo camino raíz → hoja ⇒ **§O(h)§**: §O(log n)§ balanceado, §O(n)§ degenerado.
- **Construir un BST con §n§ inserciones**: §O(n·h)§ ⇒ §O(n log n)§ en promedio con datos mezclados, **§O(n²)§** con datos ordenados (suma §1 + 2 + … + n§).
- **Espacio de pila**: §O(h)§ (versión recursiva).
- **Justificación de §O(n²)§ con datos ordenados:** el valor §k§-ésimo recorre §k − 1§ nodos para colgarse ⇒ §Σ (k − 1) = n(n − 1)/2§.
- Por eso, **no se debe usar un BST sin balancear** con datos que llegan casi ordenados (error de la lista de la clase).`,
    errores: R`
- **Insertar datos ya ordenados** y obtener un árbol degenerado sin darse cuenta.
- **No reasignar la raíz** (§raiz = insertar(raiz, v)§) o el hijo: se pierde el nodo nuevo.
- **Insertar duplicados**: el curso no los permite; hay que ignorarlos.
- **Colgar el nodo en una posición intermedia** (reemplazando a otro): la inserción siempre crea una **hoja**.
- **Creer que el orden de inserción no afecta la forma**: afecta la altura y, con ella, la complejidad.
- **Olvidar que cada inserción es §O(h)§**, no §O(1)§.`,
    preguntas: [
      ['Inserta §[1, 2, 3, 4, 5]§ en un BST vacío. ¿Qué forma tiene y cuál es su altura? Compara con §[3, 2, 4, 1, 5]§.', 'Con §[1,2,3,4,5]§ queda una **lista** hacia la derecha, de altura **4**. Con §[3,2,4,1,5]§ queda balanceado, de altura **2**. La complejidad de las operaciones pasa de §O(n)§ a §O(log n)§: el orden de inserción importa.'],
      ['Dibuja el BST de insertar §[8, 3, 10, 1, 6, 14]§ y da su inorden.', '§8(3(1,6),10(,14))§; inorden: 1, 3, 6, 8, 10, 14.'],
      ['¿Qué complejidad tiene insertar en un BST y por qué?', '§O(h)§: se recorre un solo camino raíz-hoja y se cuelga el nodo como hoja; §O(log n)§ balanceado y §O(n)§ degenerado.'],
      ['¿Qué ocurre si insertas un valor que ya existe?', 'No se inserta de nuevo (§v == nodo.valor§: ya existe, no se duplica): el árbol no cambia.']
    ],
    resumen: R`
- **Insertar** = buscar el hueco y **colgar una hoja**; §O(h)§; los duplicados se ignoran.
- Siempre **reasignar**: §raiz = insertar(raiz, v)§ y §nodo.izq/der = insertar(…)§.
- El **orden de inserción** define la forma: ordenado ⇒ lista (altura §n − 1§); mezclado ⇒ ≈ §log n§.
- Construir §n§ valores: §O(n log n)§ típico, §O(n²)§ con datos ordenados.
- [1,2,3,4,5] → altura 4; [3,2,4,1,5] → altura 2.`
  });

  B.tema({
    id: 'bs-inorden', area: 'bs', titulo: 'Por qué el inorden de un BST entrega los datos ordenados', fuente: 'S6-C2 · diap. 7, 14', nivel: 6, comp: true,
    conceptos: ['bs_inorden'], interactivo: ['bst-insertar'],
    definicion: R`
El recorrido **inorden** (izquierda → raíz → derecha) de un BST visita los valores en **orden ascendente**. En cada nodo, primero se visita **todo lo menor** (subárbol izquierdo), luego el nodo, luego **todo lo mayor** (subárbol derecho). **Un BST es, en esencia, un arreglo ordenado que permite inserción eficiente.**

Para el árbol §12(5(3,10),24(15,30))§: inorden = **[3, 5, 10, 12, 15, 24, 30]**.`,
    intuicion: R`
Piensa en una biblioteca con una estantería en el centro: a la izquierda está todo lo que va **antes** (alfabéticamente), a la derecha todo lo que va **después**. Si recorres leyendo primero toda la estantería de la izquierda, luego la del centro y luego la de la derecha, **lees en orden**. Y como cada estantería lateral es a su vez una biblioteca igual, la regla se repite recursivamente.

La pregunta de la clase anterior (S6-C1) decía: «piensa por qué su recorrido inorden entrega los datos ordenados». La respuesta es **la propiedad del BST** más **el orden izq → raíz → der** del inorden.`,
    formal: R`
**Proposición.** El inorden de un BST es estrictamente creciente.

**Demostración (por inducción sobre el número de nodos).**

- *Base*: árbol vacío o con un nodo: trivialmente ordenado.
- *Paso*: sea §T§ un BST con raíz §r§ y subárboles §L§, §R§ (BST más pequeños). Por hipótesis, §inorden(L)§ e §inorden(R)§ son crecientes. Por la propiedad del BST todo valor de §L§ es **< §r§** y todo valor de §R§ es **> §r§**. Entonces §inorden(T) = inorden(L), r, inorden(R)§ es creciente. ∎

**Consecuencias:**

- El inorden permite **listar los datos en orden** con costo **§O(n)§** (la tabla de la clase: «recorrido inorden: §O(n)§, entrega los datos ordenados»).
- Un árbol binario cuyo inorden **no** es creciente **no** es BST (criterio de verificación).
- **Cuándo usar un BST:** cuando se necesita a la vez **búsqueda eficiente** y **datos ordenados** con inserciones y eliminaciones. Si solo importa la pertenencia, una tabla hash suele ser mejor ([[ad-hash]]).

[comp]
**Ordenar con un BST («tree sort»):** insertar los §n§ elementos y recorrer en inorden ordena la lista: §O(n log n)§ en promedio y §O(n²)§ si los datos ya vienen ordenados (BST degenerado).
[/comp]`,
    procedimiento: R`
**Para escribir el inorden de un BST:**

1. Empieza en la raíz y baja siempre por la **izquierda** hasta no poder más: el primero es el **mínimo**.
2. Escribe el nodo, luego procesa su **subárbol derecho** con la misma regla.
3. Al terminar un subárbol, **sube** al padre y escríbelo.
4. Comprueba que la lista sale **estrictamente creciente**; si no, revisa si el árbol es un BST.

**Truco de examen:** para obtener el inorden de un BST **no necesitas recorrerlo**: basta **ordenar** los valores. Para construir el BST necesitas el orden de inserción.`,
    codigo: {
      titulo: 'El inorden de un BST sale ordenado (y ordenar con un BST)',
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

def inorden(nodo, salida):
    if nodo is None:
        return
    inorden(nodo.izq, salida)            # primero todo lo menor
    salida.append(nodo.valor)            # luego el nodo
    inorden(nodo.der, salida)            # luego todo lo mayor

def ordenar_con_bst(valores):            # tree sort
    raiz = None
    for v in valores:
        raiz = insertar(raiz, v)
    salida = []
    inorden(raiz, salida)
    return salida

raiz = None
for v in [12, 5, 24, 3, 10, 15, 30]:
    raiz = insertar(raiz, v)
s = []
inorden(raiz, s)
print(s)                                 # [3, 5, 10, 12, 15, 24, 30]
print(ordenar_con_bst([40, 7, 93, 18, 55, 2, 71, 18]))     # el 18 repetido se descarta
print(s == sorted(s))
`,
      esperado: '[3, 5, 10, 12, 15, 24, 30]\n[2, 7, 18, 40, 55, 71, 93]\nTrue'
    },
    ejemplo: R`
**Inorden de §12(5(3,10),24(15,30))§** (diapositiva 7):

~~~
inorden(12) = inorden(5), 12, inorden(24)
inorden(5)  = inorden(3), 5, inorden(10) = 3, 5, 10
inorden(24) = inorden(15), 24, inorden(30) = 15, 24, 30
resultado   = 3, 5, 10, 12, 15, 24, 30
~~~

**Actividad en parejas de la clase (ranking de puntajes):** inserta §[50, 30, 70, 20, 40, 60, 80]§ y escribe el inorden: **20, 30, 40, 50, 60, 70, 80**, ordenado ✔.

**Ordenar con un BST** (código): se insertan §40, 7, 93, 18, 55, 2, 71, 18§ (el segundo 18 se ignora) y el inorden entrega §2, 7, 18, 40, 55, 71, 93§.

**Por qué es útil:** un ranking dinámico que se consulta ordenado y recibe puntajes con frecuencia se mantiene en un BST: cada puntaje nuevo cuesta §O(h)§ y listar el ranking cuesta §O(n)§ **sin ordenar de nuevo**.`,
    complejidad: R`
- **Inorden de un BST con §n§ nodos**: **§O(n)§** en tiempo (cada nodo una vez) y §O(h)§ de pila. Entrega los datos ordenados **sin costo de ordenamiento adicional**.
- **Tree sort**: §n§ inserciones (§O(n log n)§ en promedio) + un inorden (§O(n)§) ⇒ **§O(n log n)§** promedio; **§O(n²)§** en el peor caso (datos ordenados). Con un árbol balanceado (AVL) sería §O(n log n)§ garantizado.
- **Comparación con otras estructuras:** un arreglo ordenado lista los datos en §O(n)§ pero insertar cuesta §O(n)§ (desplaza); un BST balanceado hace ambas cosas en §O(log n)§ y §O(n)§ respectivamente.
- **Justificación de la prueba:** cada llamada visita primero todo lo menor, luego el nodo y luego todo lo mayor ⇒ la lista de salida queda creciente por inducción.`,
    errores: R`
- **Creer que el inorden entrega datos ordenados en cualquier árbol binario**: solo en un BST.
- **Confundir inorden con preorden** al escribir la salida (preorden en un BST no sale ordenado).
- **Olvidar que los duplicados no se insertan** al ordenar con BST: no es un ordenamiento estable ni conserva repetidos.
- **Pensar que el BST «guarda los datos en el orden de inserción»**: guarda la **estructura de orden**; el inorden los lista ordenados.
- **Usar un BST cuando solo se necesita pertenencia**: una tabla hash puede ser mejor.`,
    preguntas: [
      ['¿Por qué el recorrido inorden de un BST entrega los valores ordenados?', 'Porque en cada nodo primero se visita todo lo menor (subárbol izquierdo), luego el nodo y luego todo lo mayor (subárbol derecho); por la propiedad del BST y por inducción la lista queda ascendente. Un BST es un arreglo ordenado que permite inserción eficiente.'],
      ['Inserta §[50, 30, 70, 20, 40, 60, 80]§ y da el inorden.', 'Inorden: 20, 30, 40, 50, 60, 70, 80 (ordenado).'],
      ['¿Qué complejidad tiene listar los datos ordenados de un BST?', '§O(n)§ con el inorden, sin ordenar de nuevo.'],
      ['¿Qué complejidad tiene ordenar con un BST (tree sort)?', '§O(n log n)§ promedio; §O(n²)§ si los datos ya vienen ordenados (BST degenerado).']
    ],
    resumen: R`
- **Inorden de un BST = valores en orden ascendente** (izq → raíz → der).
- Se prueba por inducción con la propiedad del BST.
- Listar ordenado: **§O(n)§**; BST ≈ arreglo ordenado con inserción eficiente.
- Si el inorden no es creciente, **no es BST**.
- Tree sort: §O(n log n)§ promedio, §O(n²)§ con datos ordenados.`
  });

  B.tema({
    id: 'bs-eliminar', area: 'bs', titulo: 'Eliminación en un BST: los tres casos', fuente: 'S6-C2 · diap. 10-11, 15-16', nivel: 6,
    conceptos: ['bs_eliminar'], interactivo: ['bst-eliminar'],
    definicion: R`
Eliminar un valor de un BST depende de **cuántos hijos** tiene el nodo:

| Caso | Acción |
|---|---|
| **0 hijos** (hoja) | se elimina directamente |
| **1 hijo** | se reemplaza el nodo por su único hijo |
| **2 hijos** | se reemplaza el **valor** por el **mayor del subárbol izquierdo** (**predecesor inorden**) o el menor del derecho (sucesor); luego se elimina ese sustituto |

El árbol **sigue siendo un BST válido** y la operación cuesta **§O(h)§**. (En el curso, el BST usa el **predecesor**; el AVL usa el **sucesor**.)`,
    intuicion: R`
Quitar una hoja no afecta a nadie. Quitar un nodo con **un solo hijo** es como sacar un eslabón de una cadena: el hijo ocupa su lugar y el orden se preserva.

El caso difícil son los **dos hijos**: si quitas el nodo, quedan dos subárboles huérfanos. La solución elegante es **no quitar el nodo, sino su valor**: lo reemplazas por el valor que **va justo antes** en el orden (el **predecesor**: el mayor de la izquierda) o **justo después** (el **sucesor**: el menor de la derecha). Ese valor está en un nodo con **a lo sumo un hijo**, así que el segundo paso es uno de los casos fáciles. El inorden queda exactamente igual, sin ese valor.`,
    formal: R`
**Código de la clase** (S6-C2, d.11), con predecesor:

~~~
def eliminar(nodo, v):
    if nodo is None: return None
    if v < nodo.valor:   nodo.izq = eliminar(nodo.izq, v)
    elif v > nodo.valor: nodo.der = eliminar(nodo.der, v)
    else:                                        # nodo a eliminar
        if nodo.izq is None: return nodo.der     # 0 o 1 hijo
        if nodo.der is None: return nodo.izq
        pred = nodo.izq                          # 2 hijos: mayor del subárbol izquierdo
        while pred.der is not None: pred = pred.der
        nodo.valor = pred.valor
        nodo.izq = eliminar(nodo.izq, pred.valor)
    return nodo
~~~

- **Predecesor inorden** = el mayor del subárbol izquierdo (el último nodo siguiendo siempre §der§). **Sucesor inorden** = el menor del subárbol derecho.
- El sustituto **no tiene hijo derecho** (si es el predecesor) o **no tiene hijo izquierdo** (si es el sucesor): tiene a lo sumo un hijo ⇒ su eliminación es el caso 0 o 1.
- **Se debe eliminar el nodo sustituto de su posición original** (error frecuente de la clase).
- Como §nodo.valor§ se **copia**, la estructura del nodo con dos hijos no cambia: solo se elimina un nodo más abajo.`,
    procedimiento: R`
**Para eliminar §v§ a mano:**

1. **Busca §v§** (como en [[bs-buscar]]). Si no está, no hay nada que hacer.
2. Identifica **cuántos hijos** tiene:
   - **0** → quita la hoja;
   - **1** → sustitúyelo por su hijo;
   - **2** → localiza el **predecesor** (baja una vez a la izquierda y luego siempre a la derecha hasta el final); **copia su valor** en el nodo; **elimina ese predecesor** del subárbol izquierdo (es una hoja o tiene solo hijo izquierdo).
3. Comprueba que el **inorden** del resultado es el inorden anterior **sin §v§**.

**Pregunta clásica de la clase:** eliminar §12§ (raíz con dos hijos) en §12(5(3,10),24(15,30))§ ⇒ **sube el 10** (mayor del subárbol izquierdo).`,
    codigo: {
      titulo: 'Eliminar con los tres casos (predecesor para dos hijos)',
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

def eliminar(nodo, v):
    if nodo is None:
        return None
    if v < nodo.valor:
        nodo.izq = eliminar(nodo.izq, v)
    elif v > nodo.valor:
        nodo.der = eliminar(nodo.der, v)
    else:                                  # nodo a eliminar
        if nodo.izq is None:
            return nodo.der                # 0 o 1 hijo
        if nodo.der is None:
            return nodo.izq
        pred = nodo.izq                    # 2 hijos: mayor del subárbol izquierdo (predecesor inorden)
        while pred.der is not None:
            pred = pred.der
        nodo.valor = pred.valor
        nodo.izq = eliminar(nodo.izq, pred.valor)   # y se elimina el sustituto de su posición original
    return nodo

def a_nota(n):
    if n is None:
        return "_"
    if n.izq is None and n.der is None:
        return str(n.valor)
    sub = lambda x: "" if x is None else a_nota(x)
    return str(n.valor) + "(" + sub(n.izq) + "," + sub(n.der) + ")"

raiz = None
for v in [12, 5, 24, 3, 10, 15, 30]:
    raiz = insertar(raiz, v)
print("inicial      :", a_nota(raiz))
raiz = eliminar(raiz, 3)
print("sin 3 (hoja) :", a_nota(raiz))
raiz = eliminar(raiz, 5)
print("sin 5 (1 hijo):", a_nota(raiz))
raiz = eliminar(raiz, 12)
print("sin 12 (raíz, 2 hijos):", a_nota(raiz))

r2 = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    r2 = insertar(r2, v)
print("ranking      :", a_nota(r2))
r2 = eliminar(r2, 30)
print("sin 30       :", a_nota(r2))
`,
      esperado: 'inicial      : 12(5(3,10),24(15,30))\nsin 3 (hoja) : 12(5(,10),24(15,30))\nsin 5 (1 hijo): 12(10,24(15,30))\nsin 12 (raíz, 2 hijos): 10(,24(15,30))\nranking      : 50(30(20,40),70(60,80))\nsin 30       : 50(20(,40),70(60,80))'
    },
    ejemplo: R`
**Eliminar 12 en §12(5(3,10),24(15,30))§ (dos hijos, diapositiva 10):**

1. Predecesor de 12: bajar a la izquierda (§5§) y luego siempre a la derecha (§10§) ⇒ **10**.
2. Copiar §10§ en la raíz: §10(5(3,10),24(15,30))§ (temporalmente hay dos 10).
3. Eliminar el §10§ del subárbol izquierdo: es una hoja ⇒ se quita: §10(5(3,),24(15,30))§.

Resultado: **§10(5(3,),24(15,30))§**, inorden §3, 5, 10, 15, 24, 30§ ✔ (el de antes sin el 12).

**Actividad en parejas (ranking §[50, 30, 70, 20, 40, 60, 80]§), eliminar 30:** tiene dos hijos (20 y 40). Predecesor = mayor del subárbol izquierdo (§20§, no tiene derecho) ⇒ sube §20§: **§50(20(,40),70(60,80))§**. Con el **sucesor** (menor del derecho, §40§) quedaría §50(40(20,),70(60,80))§: **ambos son válidos**.

**¿Qué pasaría si los puntajes llegaran ya ordenados?** El BST sería una lista de altura §n − 1§ (6 para 7 puntajes) y todas las operaciones serían §O(n)§.

En el ejemplo interactivo se eliminan una hoja, un nodo con un hijo y dos nodos con dos hijos (incluida la raíz) en un árbol de 17 nodos.`,
    complejidad: R`
- **Eliminación**: buscar el nodo (§O(h)§) + localizar el predecesor (≤ §h§ pasos más) + eliminar el sustituto (§O(h)§) ⇒ **§O(h)§** en total (a lo sumo un camino raíz–hoja dos veces).
- **Balanceado** §O(log n)§; **degenerado** §O(n)§.
- **Espacio de pila**: §O(h)§.
- **Justificación de que el sustituto es un caso fácil:** el predecesor es el nodo más a la derecha del subárbol izquierdo, por tanto **no tiene hijo derecho**: tiene 0 o 1 hijo (izquierdo).
- El **inorden se conserva** (menos el valor eliminado), por eso la propiedad del BST sigue valiendo.`,
    errores: R`
- **En el caso de 2 hijos, olvidar eliminar el nodo sustituto de su posición original** (queda duplicado).
- **Confundir el predecesor inorden** (mayor del subárbol izquierdo) **con el hijo izquierdo**.
- **Usar el menor del subárbol izquierdo** o el mayor del derecho como sustituto: rompen la propiedad.
- **No reasignar** (§nodo.izq = eliminar(nodo.izq, v)§): el árbol no cambia.
- **Olvidar el caso «el valor no está»** (§nodo is None§ devuelve §None§).
- **Pensar que eliminar es siempre §O(1)§**: hay que buscar el nodo y, con dos hijos, el sustituto.`,
    preguntas: [
      ['Describe los tres casos de eliminación en un BST.', '0 hijos: se elimina el nodo. 1 hijo: se reemplaza el nodo por su único hijo. 2 hijos: se reemplaza su valor por el mayor del subárbol izquierdo (predecesor inorden) o el menor del derecho (sucesor) y luego se elimina ese sustituto.'],
      ['Elimina el 12 de §12(5(3,10),24(15,30))§. ¿Qué valor sube?', 'Sube el **10** (mayor del subárbol izquierdo). Resultado §10(5(3,),24(15,30))§.'],
      ['Elimina 30 del BST de §[50, 30, 70, 20, 40, 60, 80]§. ¿Qué valor sube?', 'El predecesor, **20** (o el sucesor 40). Con predecesor: §50(20(,40),70(60,80))§.'],
      ['¿Qué complejidad tiene eliminar y por qué?', '§O(h)§: se busca el nodo y, si tiene dos hijos, se localiza y elimina el predecesor, a lo sumo dos recorridos de un camino raíz-hoja.']
    ],
    resumen: R`
- **0 hijos** → quitar; **1 hijo** → sustituir por el hijo; **2 hijos** → copiar el **predecesor** (mayor de la izq.; o el sucesor) y **eliminarlo** de su sitio.
- El predecesor tiene a lo sumo un hijo (no tiene derecho).
- Eliminar 12 en el árbol de clase ⇒ sube el **10**.
- Costo §O(h)§. En el BST del curso: predecesor; en el AVL: sucesor.
- Error clásico: olvidar eliminar el sustituto de su posición original.`
  });

  B.tema({
    id: 'bs-complejidad', area: 'bs', titulo: 'Complejidad O(h): balanceado frente a degenerado', fuente: 'S6-C2 · diap. 9, 12-13, 16-18', nivel: 6,
    conceptos: ['bs_altura'], interactivo: ['bst-degenerado'],
    definicion: R`
Todas las operaciones de un BST (búsqueda, inserción, eliminación, mínimo, máximo) cuestan **§O(h)§**, la **altura**. La complejidad de un BST es **§O(h)§, no §O(log n)§**:

- **Balanceado** (§h ≈ log₂ n§): todo es rápido, **§O(log n)§**.
- **Degenerado** (§h = n − 1§, p. ej. al insertar en orden creciente): el árbol se vuelve una **lista** y todo vuelve a ser **§O(n)§**.

Por eso se estudian los **árboles auto-balanceados** (AVL y rojo-negro).`,
    intuicion: R`
El BST es una **apuesta sobre el orden de llegada** de los datos: si llegan «revueltos», el árbol se reparte y buscar es como adivinar un número en 20 preguntas; si llegan **ordenados**, el árbol es una escalera de caracol y buscar es subir peldaño por peldaño.

Es el mismo peligro del quicksort con pivote malo: la estructura es buena **en promedio** pero tiene un caso **patológico** frecuente (datos ya ordenados) que acaba con la ventaja. Los árboles AVL y rojo-negro eliminan ese caso patológico reorganizándose tras cada inserción.`,
    formal: R`
**Tabla de operaciones del BST** (diapositiva 13):

| Operación | Balanceado | Degenerado | Comentario |
|---|---|---|---|
| Búsqueda | §O(log n)§ | §O(n)§ | sigue un camino raíz-hoja |
| Inserción | §O(log n)§ | §O(n)§ | cuelga como hoja |
| Eliminación | §O(log n)§ | §O(n)§ | puede requerir el predecesor |
| Mínimo/Máximo | §O(log n)§ | §O(n)§ | izquierda/derecha extrema |
| Recorrido inorden | §O(n)§ | §O(n)§ | entrega los datos ordenados |

**Altura según la forma:**

- **Balanceado/perfecto**: §n ≤ 2^(h+1) − 1§ ⇒ §h ≥ ⌈log₂(n + 1)⌉ − 1§ (mínimo posible).
- **Degenerado**: §h = n − 1§ (una cadena).
- En general: **§⌊log₂ n⌋ ≤ h ≤ n − 1§**.

**Cuándo usar un BST:** cuando se necesita **a la vez** búsqueda eficiente y mantener los datos **ordenados** con inserciones y eliminaciones. Si no importa el orden y solo se consulta pertenencia, una tabla hash (semana 8) suele ser mejor ([[ad-hash]]).`,
    procedimiento: R`
**Para razonar sobre la complejidad de un BST:**

1. Identifica **qué operación** (búsqueda, inserción, eliminación…): todas siguen un camino ⇒ §O(h)§.
2. **Estima §h§**: ¿los datos llegan mezclados (§h ≈ log n§) o ordenados (§h = n − 1§)?
3. Responde con **la forma «O(h), que es O(log n) si balanceado y O(n) si degenerado»**.
4. Para el **peor caso** de una búsqueda: §h + 1§ comparaciones.
5. Si necesitas garantía de §O(log n)§ → **AVL o rojo-negro**.`,
    codigo: {
      titulo: 'La altura según el orden de inserción: ordenado frente a «mediana primero»',
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

def altura(n):
    return -1 if n is None else 1 + max(altura(n.izq), altura(n.der))

def construir(valores):
    raiz = None
    for v in valores:
        raiz = insertar(raiz, v)
    return raiz

def orden_equilibrado(lo, hi):          # inserta primero la mediana: el BST queda lo más bajo posible
    if lo > hi:
        return []
    m = (lo + hi) // 2
    return [m] + orden_equilibrado(lo, m - 1) + orden_equilibrado(m + 1, hi)

print("n    altura(ordenado)  altura(equilibrado)")
for n in [7, 15, 31, 127]:
    a = altura(construir(list(range(1, n + 1))))
    b = altura(construir(orden_equilibrado(1, n)))
    print(n, "  ", a, "          ", b)
`,
      esperado: 'n    altura(ordenado)  altura(equilibrado)\n7    6            2\n15    14            3\n31    30            4\n127    126            6'
    },
    ejemplo: R`
**Comparación para §n = 127§ valores** (código de arriba):

- **Insertados en orden creciente** §1, 2, …, 127§: altura **126** ⇒ buscar el 127 cuesta **127 comparaciones**.
- **Insertados «mediana primero»**: altura **6** ⇒ buscar cualquier valor cuesta **≤ 7 comparaciones**.

Mismos datos, distinta forma: **la altura la decide el orden de inserción**.

**Ejemplo interactivo («degenerado»):** inserta §1…16§ en orden (altura 15) y luego los mismos valores mezclados (altura mucho menor), y compara.

**Preguntas de verificación de la clase:**

- «¿Por qué la complejidad es §O(h)§? ¿Cuándo §h = log n§ y cuándo §h = n§?» → Toda operación sigue **un** camino raíz-hoja de longitud §≤ h§; §h = log n§ si el árbol está balanceado y §h = n − 1§ si degenera en lista (inserción en orden).
- «¿En qué caso preferirías una tabla hash?» → Cuando solo importa la pertenencia (búsqueda promedio §O(1)§) y no el orden.`,
    complejidad: R`
- **Operaciones de un BST**: **§O(h)§**; §Θ(log n)§ si está balanceado, §Θ(n)§ si degenera.
- **Construir con §n§ inserciones**: datos mezclados §O(n log n)§ (promedio); datos ordenados §O(n²)§ (§Σ k = n(n−1)/2§).
- **Inorden**: §O(n)§ siempre.
- **Justificación de §h ≥ log₂ n§**: un árbol binario de altura §h§ tiene a lo sumo §2^(h+1) − 1§ nodos ⇒ para guardar §n§ hace falta §h ≥ log₂(n + 1) − 1§.
- **Cómo se evita el peor caso**: AVL y rojo-negro garantizan §h = O(log n)§ con rotaciones ([[av-problema]]).`,
    errores: R`
- **Olvidar que la complejidad es §O(h)§, no §O(log n)§**: en el peor caso §h = n − 1§.
- **Insertar datos ya ordenados y obtener un árbol degenerado sin darse cuenta.**
- **Usar un BST sin balancear en producción** con datos que llegan casi ordenados.
- **Creer que el BST siempre es mejor que un arreglo ordenado**: con datos ordenados es igual de lento (§O(n)§).
- **Dar «O(log n)» sin indicar la hipótesis de balance.**
- **Confundir la altura con el número de nodos** (§h = n − 1§ para la lista, no §n§).`,
    preguntas: [
      ['¿Por qué la complejidad de un BST es §O(h)§? ¿Cuándo §h = log n§ y cuándo §h = n§?', 'Porque cada operación sigue un solo camino raíz-hoja. §h ≈ log n§ si el árbol está balanceado (datos mezclados) y §h = n − 1§ si degenera en una lista (datos insertados en orden).'],
      ['Completa la tabla: búsqueda, inserción y eliminación en un BST balanceado y degenerado.', 'Balanceado: §O(log n)§ las tres. Degenerado: §O(n)§ las tres. (Mínimo/máximo igual; inorden §O(n)§ en ambos.)'],
      ['¿En qué caso preferirías una tabla hash sobre un BST?', 'Cuando solo se necesita consultar pertenencia (§O(1)§ promedio) y no importa el orden. Si se necesita a la vez búsqueda eficiente y datos ordenados, el BST (balanceado).'],
      ['¿Qué altura tiene un BST de 127 valores insertados en orden creciente y cuál si se insertan «mediana primero»?', '126 (lista) frente a 6 (equilibrado).']
    ],
    resumen: R`
- Búsqueda, inserción, eliminación, mín./máx.: **§O(h)§**; inorden §O(n)§.
- **Balanceado**: §h ≈ log n§ ⇒ §O(log n)§. **Degenerado**: §h = n − 1§ ⇒ §O(n)§.
- Datos ya ordenados ⇒ **árbol degenerado** (error típico).
- §⌊log₂ n⌋ ≤ h ≤ n − 1§.
- Solución: árboles **auto-balanceados** (AVL, rojo-negro); alternativa sin orden: tabla hash.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
