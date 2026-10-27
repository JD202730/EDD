/* teoria_hp.js — Biblioteca: área Heaps y colas de prioridad (fuente: S7-C2, Clase2_HeapsColasPrioridad, 33 diapositivas).
   Contenido complementario: demostración de por qué heapify es O(n), altura y número de hojas, variante de heapq. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  /* clase MaxHeap de la diapositiva 15-19, completa */
  const MAXHEAP = R`
class MaxHeap:
    def __init__(self):
        self.datos = []                     # el arbol vive aqui, sin nodos ni punteros

    def _padre(self, i):
        return (i - 1) // 2

    def _izq(self, i):
        return 2 * i + 1

    def _der(self, i):
        return 2 * i + 2

    def _intercambiar(self, i, j):
        d = self.datos
        d[i], d[j] = d[j], d[i]

    def insertar(self, x):
        self.datos.append(x)                # 1. ultima hoja
        self._subir(len(self.datos) - 1)    # 2. subir

    def _subir(self, i):                    # bubble up
        d = self.datos
        while i > 0:                        # la raiz no sube
            p = self._padre(i)
            if d[i] <= d[p]:
                break                       # ya esta en su sitio
            self._intercambiar(i, p)
            i = p                           # seguir desde el padre

    def extraer_max(self):
        if not self.datos:
            raise IndexError("heap vacio")
        maximo = self.datos[0]              # la raiz
        ultimo = self.datos.pop()           # ultima hoja
        if self.datos:
            self.datos[0] = ultimo          # a la raiz
            self._bajar(0)                  # bubble down
        return maximo

    def _bajar(self, i):                    # bubble down
        d, n = self.datos, len(self.datos)
        while True:
            mayor = i
            l, r = self._izq(i), self._der(i)
            if l < n and d[l] > d[mayor]:
                mayor = l
            if r < n and d[r] > d[mayor]:
                mayor = r
            if mayor == i:
                break                       # ningun hijo es mayor
            self._intercambiar(i, mayor)
            i = mayor                       # seguir bajando
`;
  B.codigo = B.codigo || {}; B.codigo.MAXHEAP = MAXHEAP;

  B.tema({
    id: 'hp-def', area: 'hp', titulo: 'Heap: árbol completo con orden parcial (max-heap y min-heap)', fuente: 'S7-C2 · diap. 4-5, 21, 29', nivel: 13, comp: true,
    conceptos: ['hp_def'], lab: [{ tab: 'heap', e: 'ins', texto: 'Ver un heap en acción' }], alias: 'montículo monticulo priority',
    definicion: R`
Un **heap** (montículo) es un **árbol binario completo** que cumple una **propiedad de orden**:

- **Max-heap**: cada nodo es **≥** que sus hijos; la **raíz es el máximo**.
- **Min-heap**: cada nodo es **≤** que sus hijos; la **raíz es el mínimo**.

Es un orden **parcial**: la raíz es el extremo, pero **los hermanos no están ordenados entre sí**. A diferencia del BST, **un heap no sirve para buscar por valor**: solo da el extremo.`,
    intuicion: R`
Piensa en la **sala de urgencias**: no hace falta tener a todos los pacientes ordenados de más a menos grave; basta saber **siempre cuál es el más grave** (la raíz). Cuando ese paciente es atendido, se reacomoda lo mínimo para que vuelva a haber un más grave a la vista.

Esa es la idea de la **pregunta inicial** de la clase: de un millón de candidatos solo quieres los 10 más cercanos. Ordenar todo cuesta §O(n log n)§; un heap te deja quedarte con los 10 mejores **sin ordenar el resto**.

Que sea **completo** es lo que permite guardarlo en un arreglo sin punteros (tema [[hp-arreglo]]): los niveles se llenan de arriba hacia abajo y, el último, **de izquierda a derecha**.`,
    formal: R`
**Árbol binario completo**: todos los niveles están llenos excepto, quizá, el último, que se llena **de izquierda a derecha**.

**Propiedad del max-heap**: para todo nodo §v§ con padre §p§: §p ≥ v§. (En el min-heap: §p ≤ v§.)

**Consecuencias** (se demuestran por inducción sobre la profundidad):

- La **raíz es el máximo** (o el mínimo) de todo el heap: cualquier nodo tiene como ancestros una cadena de nodos ≥ él que termina en la raíz.
- Cualquier **subárbol** de un heap es también un heap (importante para el heapify).
- [comp]Un heap de §n§ nodos tiene altura §⌊log₂ n⌋§ (en aristas) y §⌈n/2⌉§ hojas: por eso subir o bajar cuesta a lo sumo §O(log n)§.[/comp]

| | **Heap** | **BST** |
|---|---|---|
| Forma | árbol **completo** | cualquiera (depende del orden de inserción) |
| Orden | **parcial** (padre vs. hijos) | **total** (izq < nodo < der) |
| Máximo / mínimo | **§O(1)§** (la raíz) | §O(h)§ |
| Buscar un valor | §O(n)§ | §O(h)§ |
| Recorrido ordenado | no | sí (inorden) |`,
    procedimiento: R`
**Para comprobar a mano si un arreglo es un max-heap:**

1. Dibuja el árbol leyendo el arreglo **por niveles**, de izquierda a derecha.
2. Para **cada nodo que no es la raíz**, compara con su padre: debe cumplirse §padre ≥ hijo§.
3. Si **una sola** pareja falla, no es un heap (aunque la raíz sea el mayor).
4. No compares hermanos entre sí: **no se exige ningún orden entre ellos**.

**Para min-heap**, lo mismo con §padre ≤ hijo§.`,
    codigo: [{
      titulo: '¿Es un max-heap? Se compara cada nodo con su padre',
      src: R`
def es_max_heap(a):
    for i in range(1, len(a)):
        if a[(i - 1) // 2] < a[i]:      # el padre debe ser >= el hijo
            return False
    return True

print(es_max_heap([8, 5, 6, 4, 2, 3]))    # el de la clase
print(es_max_heap([8, 5, 6, 4, 9, 3]))    # el 9 esta debajo del 5
print(es_max_heap([20, 15, 18, 7, 10, 12, 9, 3]))
print(es_max_heap([5]), es_max_heap([]))
`,
      esperado: 'True\nFalse\nTrue\nTrue True'
    }],
    ejemplo: R`
**El heap de la clase** §[8, 5, 6, 4, 2, 3]§ leído por niveles:

~~~
        8
      /   \
     5     6
    / \   /
   4   2 3
~~~

Cada padre es ≥ sus hijos (§8 ≥ 5, 6§; §5 ≥ 4, 2§; §6 ≥ 3§): es un **max-heap**. Fíjate en que **5 y 6 son hermanos y 5 < 6**: eso está permitido.

**Contraejemplo** §[8, 5, 6, 4, 9, 3]§: el nodo 9 (índice 4) tiene como padre al 5 (índice 1) y §5 < 9§: **no es heap**, aunque la raíz sea 8 y el árbol sea completo.

**Min-heap de los mismos números**: §[2, 3, 4, 8, 5, 6]§ (cada padre ≤ sus hijos; la raíz es el mínimo, 2).`,
    complejidad: R`
- **Ver el extremo** (máx. o mín.): **§O(1)§** (es §datos[0]§).
- **Comprobar** si un arreglo es heap: **§O(n)§** (una comparación por nodo).
- **Altura**: §⌊log₂ n⌋§, por eso las operaciones que suben o bajan por una rama cuestan §O(log n)§ (temas [[hp-insertar]] y [[hp-extraer]]).
- **Buscar un valor cualquiera**: **§O(n)§** — no hay orden entre hermanos, así que no se puede descartar una mitad como en un BST.
- **Espacio**: §O(n)§, sin punteros (tema [[hp-arreglo]]).`,
    errores: R`
- **Creer que un heap sirve para buscar** un valor: solo da el extremo; buscar es §O(n)§.
- **Confundir el orden parcial del heap con el orden total del BST**: en un heap, §hijo izquierdo < hijo derecho§ **no** es una regla.
- **Confundir «completo» con «lleno» o «perfecto»**: completo permite que el último nivel esté a medias, pero llenándose **de izquierda a derecha**.
- **Pensar que la raíz es el máximo en todo árbol que tenga un nodo mayor arriba**: lo que importa es que se cumpla en **todas** las parejas padre-hijo.
- **Olvidar que el min-heap invierte la desigualdad**: la raíz es el **mínimo**.`,
    preguntas: [
      ['Define heap e indica qué propiedad cumple un max-heap y dónde está el máximo.', 'Un heap es un árbol binario completo con una propiedad de orden. En un max-heap cada nodo es ≥ que sus hijos y el máximo está en la raíz (en un min-heap, cada nodo es ≤ que sus hijos y la raíz es el mínimo).'],
      ['¿Qué significa que el orden de un heap sea «parcial»?', 'Que solo se exige la relación padre-hijo: la raíz es el extremo, pero los hermanos no están ordenados entre sí, a diferencia del BST, que tiene orden total (inorden ordenado).'],
      ['¿Por qué un heap no sirve para buscar un valor?', 'Porque no hay orden entre hermanos ni entre ramas: no se puede descartar una mitad del árbol, así que buscar un valor es O(n); solo da el extremo en O(1).'],
      ['¿Es §[8, 5, 6, 4, 9, 3]§ un max-heap?', 'No: el nodo 9 (índice 4) tiene como padre al 5 (índice 1) y 5 < 9, así que no se cumple padre ≥ hijo.']
    ],
    resumen: R`
- **Heap** = árbol binario **completo** + orden **parcial** (padre ≥ hijos en max-heap; ≤ en min-heap).
- La **raíz** es el máximo (o el mínimo): ver el extremo es **§O(1)§**.
- Los **hermanos no están ordenados**; **no** sirve para buscar (§O(n)§).
- Subárboles de un heap son heaps; altura §⌊log₂ n⌋§.`
  });

  B.tema({
    id: 'hp-arreglo', area: 'hp', titulo: 'El heap en un arreglo: padre, hijos y aritmética de índices', fuente: 'S7-C2 · diap. 6-12', nivel: 13,
    conceptos: ['hp_arr'], lab: [{ tab: 'heap', e: 'ins', texto: 'Ver árbol y arreglo a la vez' }], alias: 'indices padre izq der',
    definicion: R`
Como el heap es un **árbol completo**, se guarda en un **arreglo sin punteros**: se numeran los nodos **por niveles, de izquierda a derecha** (0, 1, 2, …) y ese número es la posición en el arreglo. Para el nodo en el índice §i§:

- §padre(i) = ⌊(i − 1) / 2⌋§ (en Python: §(i - 1) // 2§)
- §izq(i) = 2i + 1§
- §der(i) = 2i + 2§

Sin memoria extra por punteros y con **excelente localidad de caché**: por eso el heap es tan eficiente.`,
    intuicion: R`
**El arreglo es el árbol leído como un libro: fila por fila.** La raíz es la fila 0 (una casilla), la fila 1 tiene dos, la fila 2 tiene cuatro…

¿Por qué §2i + 1§? Cada nodo reserva **dos lugares** para sus hijos, en orden. Los nodos 0, 1, …, §i − 1§ (los de antes de §i§) ya ocuparon §2i§ lugares después de la raíz (las posiciones 1 a §2i§). Los hijos de §i§ son los **siguientes**: §2i + 1§ (izquierdo) y §2i + 2§ (derecho).

**El padre** se obtiene despejando: si §i§ es hijo izquierdo, §i = 2p + 1 ⇒ p = (i − 1)/2§; si es derecho, §i = 2p + 2 ⇒ p = (i − 2)/2§. Con el **redondeo hacia abajo** las dos fórmulas se unen en una: §⌊(i − 1)/2⌋§. **Truco**: índice **impar** ⇒ hijo izquierdo; **par** ⇒ hijo derecho.`,
    formal: R`
**Fórmulas** (arreglos 0-indexados) y regla de existencia:

| Qué | Fórmula | Existe si |
|---|---|---|
| padre de §i§ | §(i − 1) // 2§ | §i ≥ 1§ (la raíz no tiene padre) |
| hijo izquierdo | §2i + 1§ | §2i + 1 < n§ |
| hijo derecho | §2i + 2§ | §2i + 2 < n§ |
| ¿hoja? | — | §2i + 1 ≥ n§ ⇔ §i ≥ n // 2§ |

Con §n§ elementos, el hijo en el índice §j§ **existe solo si §j < n§**; los índices válidos son 0 a §n − 1§.

[comp]**Arreglos desde 1.** Algunos libros numeran desde 1: entonces §izq = 2i§, §der = 2i + 1§ y §padre = ⌊i/2⌋§. Es la misma idea desplazada en uno; cuidado al comparar con el código de una fuente.[/comp]`,
    procedimiento: R`
**Pasar del árbol al arreglo** (y al revés):

1. Numera los nodos por **niveles**, de izquierda a derecha: 0, 1, 2, …
2. Escribe los valores en esa **posición** del arreglo.
3. Para moverte: **padre** §(i − 1) // 2§; **hijos** §2i + 1§ y §2i + 2§ (si son menores que §n§).
4. Para saber si un nodo es hoja: ¿§2i + 1 ≥ n§?

**Práctica rápida (diap. 12).** Heap §[20, 15, 18, 7, 10, 12, 9, 3]§ (§n = 8§): hijos del 15 (§i = 1§) → índices 3 y 4 → **7 y 10**; padre del 3 (§i = 7§) → §(7 − 1) // 2 = 3§ → **7**; hojas (índices ≥ 4) → **10, 12, 9, 3**.`,
    codigo: [{
      titulo: 'Las tres fórmulas y su uso (diapositiva 11)',
      src: R`
def padre(i):
    return (i - 1) // 2

def izq(i):
    return 2 * i + 1

def der(i):
    return 2 * i + 2

heap = [8, 5, 6, 4, 2, 3]
n = len(heap)
i = 1
print(heap[padre(i)], heap[izq(i)], heap[der(i)])
print(izq(5) < n)                       # False: el 3 (indice 5) es hoja

h2 = [20, 15, 18, 7, 10, 12, 9, 3]
print(h2[izq(1)], h2[der(1)], h2[padre(7)])
print([h2[k] for k in range(len(h2)) if izq(k) >= len(h2)])   # las hojas
`,
      esperado: '8 4 2\nFalse\n7 10 7\n[10, 12, 9, 3]'
    }],
    ejemplo: R`
**Heap §[8, 5, 6, 4, 2, 3]§** (§n = 6§):

| i | valor | izq = 2i+1 | der = 2i+2 | hijos (valores) |
|---|---|---|---|---|
| 0 | 8 | 1 | 2 | 5 y 6 |
| 1 | 5 | 3 | 4 | 4 y 2 |
| 2 | 6 | 5 | 6 | 3 y — (§6 ≥ n = 6§: no existe) |
| 3 | 4 | 7 | 8 | ninguno: **hoja** |

**Padres:** §i = 1, 2 → 0§ (valor 8); §i = 3, 4 → 1§ (valor 5); §i = 5 → 2§ (valor 6). Los hermanos 3 y 4 dan el mismo padre: el redondeo hacia abajo absorbe la diferencia.`,
    complejidad: R`
- Calcular **padre o hijos** es **§O(1)§** (una resta, una multiplicación y una división entera).
- El arreglo ocupa **§O(n)§** y **no guarda punteros**: un árbol con nodos-objeto gasta una referencia por hijo.
- **Localidad de caché**: padre e hijos están en posiciones cercanas del mismo arreglo; recorrerlos aprovecha las líneas de caché de 64 bytes, a diferencia de seguir punteros por el montículo.`,
    errores: R`
- **Olvidar comprobar §j < n§** antes de leer un hijo: sin esa comprobación se lee fuera del heap (en Python, §IndexError§ o, peor, un dato que ya no pertenece al heap).
- **Usar §i / 2§ en vez de §(i - 1) // 2§** con arreglos desde 0: da un padre equivocado (solo vale en la numeración desde 1).
- **Calcular el padre de la raíz**: §(0 - 1) // 2§ da §-1§, que en Python apunta al **último** elemento: la raíz no tiene padre y el bubble up se detiene en §i = 0§.
- **Mezclar las dos numeraciones** (desde 0 y desde 1) en un mismo programa.`,
    preguntas: [
      ['Dado el índice §i§, ¿cómo se calculan padre e hijos en la representación en arreglo?', 'padre(i) = ⌊(i − 1)/2⌋ (en Python (i - 1) // 2); hijo izquierdo 2i + 1; hijo derecho 2i + 2 (arreglos desde 0). Un hijo existe solo si su índice es menor que n.'],
      ['En §[20, 15, 18, 7, 10, 12, 9, 3]§, ¿quiénes son los hijos del 15 y quién es el padre del 3?', 'El 15 está en el índice 1: sus hijos están en 3 y 4 → 7 y 10. El 3 está en el índice 7: su padre está en (7 − 1)//2 = 3 → 7.'],
      ['¿Qué nodos de un heap de §n§ elementos son hojas?', 'Los que tienen índice i ≥ n // 2, porque sus hijos (2i + 1) tendrían índice ≥ n. En el heap de 8 elementos, las hojas son los índices 4 a 7.'],
      ['¿Por qué se puede guardar un heap en un arreglo sin punteros?', 'Porque es un árbol completo: al numerar los nodos por niveles de izquierda a derecha no quedan huecos, y las posiciones de padre e hijos se obtienen con aritmética de índices.']
    ],
    resumen: R`
- Nodos numerados **por niveles**: el índice es la posición en el arreglo.
- §padre = (i − 1) // 2§, §izq = 2i + 1§, §der = 2i + 2§ (desde 0).
- Un hijo **existe solo si su índice < n**; hoja ⇔ §2i + 1 ≥ n§.
- **Impar** ⇒ hijo izquierdo; **par** ⇒ derecho.
- Sin punteros y con buena localidad de caché.`
  });

  B.tema({
    id: 'hp-insertar', area: 'hp', titulo: 'Insertar en un heap: heapify hacia arriba (bubble up)', fuente: 'S7-C2 · diap. 13, 15-16, 19', nivel: 13,
    conceptos: ['hp_subir'], lab: [{ tab: 'heap', e: 'ins', texto: 'Ver insertar paso a paso' }], alias: 'bubble up subir percolate',
    definicion: R`
**Insertar** en un heap tiene dos pasos:

1. Se agrega el nuevo elemento **al final** del arreglo, es decir, en la **última hoja** (así el árbol sigue siendo completo).
2. Se **sube** (**heapify hacia arriba** o *bubble up*): mientras sea **mayor que su padre** (en un max-heap), se intercambia con él.

Cada vuelta sube **un nivel**: a lo sumo la altura del árbol, **§O(log n)§**.`,
    intuicion: R`
El elemento nuevo entra por la **puerta de atrás** (la última hoja) y va **escalando posiciones** mientras sea más importante que quien tiene encima. Se detiene en cuanto encuentra a un padre que **no** pierde contra él: arriba de ese padre ya había orden y no cambia nada.

Por eso solo se revisa **una rama** (el camino de la hoja hacia la raíz) y no el árbol completo.`,
    formal: R`
**Algoritmo** (max-heap, diapositiva 16):

~~~
insertar(x):
    datos.append(x);  i = n - 1                # n = tamaño antes de insertar → índice de la nueva hoja
    mientras i > 0:                            # la raíz no sube
        p = (i - 1) // 2
        si datos[i] <= datos[p]: parar         # ya está en su sitio
        intercambiar(datos[i], datos[p]);  i = p
~~~

**Corrección** (invariante): antes de cada vuelta, todos los pares padre-hijo cumplen la propiedad **excepto, quizá, el par (padre de i, i)**. Intercambiar con un padre menor la restablece en ese par y solo puede romperla en el par siguiente hacia arriba. Al detenerse o llegar a la raíz, no queda ningún par roto.

**Costo**: a lo sumo §⌊log₂(n + 1)⌋§ intercambios → **§O(log n)§**. En un **min-heap** solo se invierte la comparación (§datos[i] >= datos[p]§ → parar).`,
    procedimiento: R`
**Insertar a mano en un max-heap:**

1. Escribe el valor **al final** del arreglo (última hoja del árbol).
2. Halla su padre: §p = (i − 1) // 2§.
3. ¿El nuevo es **mayor** que el padre? Si sí, **intercambia** y repite con §i = p§; si no, **para**.
4. Termina al detenerte o al llegar a la raíz (§i = 0§).

**Traza (diap. 16):** §[24, 10, 12, 5, 3]§ e §insertar(15)§:

1. append → §[24, 10, 12, 5, 3, 15]§, §i = 5§.
2. Padre §(5 − 1)//2 = 2§ (valor 12): §15 > 12§ → intercambia → §[24, 10, 15, 5, 3, 12]§, §i = 2§.
3. Padre §(2 − 1)//2 = 0§ (valor 24): §15 ≤ 24§ → **para**.`,
    codigo: [{
      titulo: 'MaxHeap: insertar con _subir (diapositivas 15-19)',
      src: MAXHEAP + R`
h = MaxHeap()
for x in [24, 10, 12, 5, 3]:
    h.insertar(x)
print(h.datos)
h.insertar(15)
print(h.datos)                          # [24, 10, 15, 5, 3, 12]
for x in [30, 1, 22]:
    h.insertar(x)
    print("inserto", x, "->", h.datos)
`,
      esperado: '[24, 10, 12, 5, 3]\n[24, 10, 15, 5, 3, 12]\ninserto 30 -> [30, 10, 24, 5, 3, 12, 15]\ninserto 1 -> [30, 10, 24, 5, 3, 12, 15, 1]\ninserto 22 -> [30, 22, 24, 10, 3, 12, 15, 1, 5]'
    }],
    ejemplo: R`
**Construir un max-heap insertando 24, 10, 12, 5, 3** no necesita ningún intercambio: cada elemento nuevo es ≤ su padre. Luego **insertar 15** sube un nivel (intercambio con el 12) y se detiene bajo el 24:

~~~
antes:   24            después:  24
        /  \                    /  \
      10    12                10    15
      / \   /                 / \   /
     5   3 15                5   3 12
~~~

**Caso extremo:** insertar un valor **mayor que todos** (por ejemplo 30 en el heap anterior) sube **hasta la raíz**: se hacen tantos intercambios como niveles tenga el árbol.`,
    complejidad: R`
- **Peor caso**: el nuevo es el nuevo máximo y sube hasta la raíz: **§⌊log₂ n⌋§ intercambios → §O(log n)§**.
- **Mejor caso**: el nuevo es ≤ su padre: **cero intercambios → §O(1)§**.
- **Caso medio** (valores aleatorios): en promedio sube un número **constante** de niveles; por eso insertar en un heap es muy rápido en la práctica.
- **Espacio extra**: §O(1)§ (el arreglo crece en uno).
- Insertar **n** elementos uno por uno: §O(n log n)§ (existe una forma más rápida, tema [[hp-construir]]).`,
    errores: R`
- **No agregar el elemento al final**, sino en otra posición: se rompería la forma completa del árbol.
- **Seguir comparando tras el primer «ya está en su sitio»**: el resto del camino ya cumplía la propiedad.
- **No detenerse en la raíz** (§while i > 0§ evita calcular el padre de la raíz).
- **Comparar con los hermanos** en vez de con el padre: el bubble up solo compara con el **padre**.
- **Intercambiar con un padre igual**: si §d[i] <= d[p]§ se para (con valores repetidos no hace falta subir).`,
    preguntas: [
      ['Describe cómo se inserta un elemento en un max-heap y su costo.', 'Se agrega al final del arreglo (última hoja) y se sube (bubble up) intercambiándolo con su padre mientras sea mayor que él. Cada vuelta sube un nivel, así que cuesta a lo sumo la altura: O(log n).'],
      ['Inserta 15 en §[24, 10, 12, 5, 3]§ (max-heap) y escribe el arreglo resultante.', 'Se agrega: [24, 10, 12, 5, 3, 15]; el padre del índice 5 es el 2 (12) y 15 > 12 → intercambio: [24, 10, 15, 5, 3, 12]; el padre del índice 2 es el 0 (24) y 15 ≤ 24 → se detiene.'],
      ['¿Cuál es el peor caso de la inserción en un heap y por qué?', 'Que el nuevo elemento sea el nuevo extremo (p. ej., mayor que todos en un max-heap): sube hasta la raíz, ⌊log₂ n⌋ intercambios, O(log n).'],
      ['¿Qué cambia al insertar en un min-heap?', 'Solo la comparación: el elemento sube mientras sea menor que su padre (se detiene si d[i] >= d[p]).']
    ],
    resumen: R`
- **Insertar** = *append* en la última hoja + **subir** mientras gane a su padre.
- Cada vuelta sube **un nivel** ⇒ a lo sumo la altura: **§O(log n)§**.
- Se compara **solo con el padre** (§(i − 1) // 2§); se detiene al no ganarle o en la raíz.
- Mejor caso §O(1)§; el elemento nuevo extremo sube hasta la raíz.`
  });

  B.tema({
    id: 'hp-extraer', area: 'hp', titulo: 'Extraer la raíz: heapify hacia abajo (bubble down)', fuente: 'S7-C2 · diap. 14, 17-19', nivel: 13,
    conceptos: ['hp_bajar'], lab: [{ tab: 'heap', e: 'ext', texto: 'Ver extraer paso a paso' }], alias: 'bubble down bajar sift down',
    definicion: R`
**Extraer el máximo** (en un max-heap) o el mínimo (en un min-heap):

1. La raíz es el extremo: se guarda para devolverla (§datos[0]§).
2. Se quita la **última hoja** con §pop()§ (**O(1)** y el árbol sigue completo).
3. Esa hoja se pone **en la raíz**.
4. Se **baja** (**heapify hacia abajo** o *bubble down*): se intercambia con su **hijo mayor** (max-heap) mientras sea necesario.

Costo **§O(log n)§**.`,
    intuicion: R`
La raíz sale y deja un **hueco arriba**. Para taparlo sin romper la forma del árbol se usa **la última hoja** (la que menos estorba). Ese elemento suele ser pequeño, así que **no pertenece arriba**: se va **hundiendo** por el lado del hijo más grande, porque si subiera el menor de los hijos quedaría **encima de su hermano mayor** y se rompería el heap.

**¿Por qué no borrar la raíz directamente?** §del datos[0]§ correría **todos** los elementos un lugar (**O(n)**) y cambiaría todos los índices: padres e hijos quedarían revueltos. Mover la última hoja conserva la forma del árbol.`,
    formal: R`
**Algoritmo** (max-heap, diapositivas 17-18):

~~~
extraer_max():
    si vacío: error
    maximo = datos[0];  ultimo = datos.pop()
    si datos no vacío:  datos[0] = ultimo;  bajar(0)
    devolver maximo

bajar(i):
    mientras verdadero:
        mayor = i;  l = 2i + 1;  r = 2i + 2
        si l < n y datos[l] > datos[mayor]: mayor = l
        si r < n y datos[r] > datos[mayor]: mayor = r
        si mayor == i: parar                     # ningún hijo gana
        intercambiar(datos[i], datos[mayor]);  i = mayor
~~~

**Detalle clave:** solo se compara con un hijo si **existe** (§l < n§, §r < n§). Si falta el hijo derecho (caso frecuente), el izquierdo es el único candidato.

**Costo**: a lo sumo §⌊log₂ n⌋§ vueltas con 2 comparaciones cada una → **§O(log n)§**. En un **min-heap**: se elige el hijo **menor** y se baja si es **menor** que el nodo.`,
    procedimiento: R`
**Extraer a mano en un max-heap:**

1. **Guarda la raíz** (el resultado).
2. **Saca la última hoja** y **ponla en la raíz**.
3. Mira sus hijos (si existen). ¿Alguno es **mayor** que ella? Intercambia con el **mayor de los dos** y repite en la nueva posición.
4. **Para** cuando ningún hijo sea mayor o cuando no tenga hijos (hoja).

**Traza (diap. 18):** §[2, 10, 15, 5, 3, 12]§ (el 2 ya está en la raíz):

1. §i = 0§: hijos 10 y 15; el mayor es 15 → intercambia → §[15, 10, 2, 5, 3, 12]§, §i = 2§.
2. §i = 2§: hijos en 5 y 6; solo existe el 5 (valor 12), porque §6 ≥ n§. §12 > 2§ → intercambia → §[15, 10, 12, 5, 3, 2]§, §i = 5§.
3. §i = 5§: hijos en 11 y 12 (≥ n) → **para**.`,
    codigo: [{
      titulo: 'MaxHeap: extraer_max con _bajar (diapositivas 17-19)',
      src: MAXHEAP + R`
h = MaxHeap()
for x in [24, 10, 12, 5, 3]:
    h.insertar(x)
h.insertar(15)
h.insertar(2)
print(h.datos)
print(h.extraer_max())                  # 24
print(h.datos)                          # el 2 baja hasta su sitio
print([h.extraer_max() for _ in range(6)])   # sale de mayor a menor: la idea de heapsort
try:
    h.extraer_max()
except IndexError as e:
    print("IndexError:", e)
`,
      esperado: '[24, 10, 15, 5, 3, 12, 2]\n24\n[15, 10, 12, 5, 3, 2]\n[15, 12, 10, 5, 3, 2]\nIndexError: heap vacio'
    }],
    ejemplo: R`
**Extraer el máximo de §[24, 10, 15, 5, 3, 12, 2]§** (max-heap):

1. La raíz es **24**: se guarda.
2. §pop()§ quita el **2** (última hoja): queda §[24, 10, 15, 5, 3, 12]§.
3. El 2 va a la raíz: §[2, 10, 15, 5, 3, 12]§.
4. **Bajar**: hijos de la raíz 10 y 15 → gana 15 → §[15, 10, 2, 5, 3, 12]§. Luego el 2 (índice 2) tiene como único hijo al 12 → §[15, 10, 12, 5, 3, 2]§. Fin.

**Devuelve 24** y el heap queda §[15, 10, 12, 5, 3, 2]§. Si se extrae **todo**, sale de mayor a menor: §15, 12, 10, 5, 3, 2§.`,
    complejidad: R`
- **Peor caso**: la hoja que sube a la raíz baja hasta el último nivel: **§⌊log₂ n⌋§ vueltas → §O(log n)§** (2 comparaciones por vuelta).
- **Mejor caso**: la hoja ya es ≥ sus hijos y se queda arriba: **§O(1)§** tras el §pop()§.
- **Extraer n veces** (extraer todo): **§O(n log n)§** — es la base de heapsort (tema [[hp-topk]]).
- **Espacio extra**: §O(1)§.
- El §pop()§ del final es **§O(1)§** porque no hay que correr nada; borrar la raíz con §del§ sería §O(n)§.`,
    errores: R`
- **Borrar la raíz con §del datos[0]§** (O(n) y revuelve los índices) en vez de mover la última hoja.
- **Comparar con un hijo que no existe**: hay que verificar §l < n§ y §r < n§.
- **Intercambiar con el hijo menor** (en un max-heap): el hermano mayor quedaría debajo de él y se rompería el heap.
- **Suponer que, tras extraer la raíz, la nueva raíz es el segundo mayor sin hacer heapify hacia abajo**: la que queda en la raíz es la **última hoja**, no el segundo mayor.
- **Olvidar el caso del heap con un solo elemento**: tras el §pop()§ no queda nada que bajar (§if self.datos:§).`,
    preguntas: [
      ['Describe cómo se extrae el máximo de un max-heap y su costo.', 'Se guarda la raíz, se quita la última hoja con pop() (O(1)), se coloca en la raíz y se baja intercambiándola con su hijo mayor mientras sea necesario. Cada vuelta baja un nivel: O(log n).'],
      ['¿Por qué se mueve la última hoja a la raíz y no se borra la raíz directamente?', 'Porque del datos[0] correría todos los elementos un lugar (O(n)) y cambiaría todos los índices, revolviendo padres e hijos; mover la última hoja conserva la forma del árbol completo.'],
      ['¿Por qué se intercambia con el hijo mayor?', 'Si subiera el hijo menor quedaría encima de su hermano mayor y se rompería el max-heap; con el mayor, el nuevo padre es ≥ que ambos hijos.'],
      ['Extrae el máximo de §[2, 10, 15, 5, 3, 12]§… ¿qué arreglo queda al bajar el 2? (el 2 ya está en la raíz)', '[15, 10, 12, 5, 3, 2]: el 2 baja primero por el 15 (mayor de 10 y 15) y luego por el 12 (único hijo existente), y se detiene en una hoja.']
    ],
    resumen: R`
- **Extraer** = guardar la raíz + **mover la última hoja a la raíz** + **bajar** por el hijo **mayor** (max) / **menor** (min).
- Cada vuelta baja un nivel: **§O(log n)§**.
- Comprueba que el hijo **exista** (§l < n§, §r < n§).
- No se usa §del datos[0]§ (O(n)).
- Extraer todo da los datos **ordenados** (idea de heapsort).`
  });

  B.tema({
    id: 'hp-construir', area: 'hp', titulo: 'Construir un heap desde un arreglo: heapify en O(n)', fuente: 'S7-C2 · diap. 20, 29 (la demostración es complementaria)', nivel: 13, comp: true,
    conceptos: ['hp_build'], lab: [{ tab: 'heap', e: 'con', texto: 'Ver heapify paso a paso' }], alias: 'heapify build heap lineal',
    definicion: R`
Convertir una lista **ya existente** en heap se hace con **§heapify§**: se recorren los nodos **desde el último que tiene hijos** (índice §n // 2 − 1§) **hasta la raíz** y se **baja** cada uno (*bubble down*). Cuesta **§O(n)§**, más rápido que hacer **n inserciones** (**§O(n log n)§**).

En Python: §heapq.heapify(datos)§.`,
    intuicion: R`
Las **hojas ya son heaps** de un solo elemento, así que no hay que tocarlas (son la mitad de los nodos). Subiendo por los niveles, cuando se baja un nodo **sus dos subárboles ya son heaps**, y solo falta decidir cuánto debe hundirse ese nodo.

Lo sorprendente es que sea **lineal**: casi todos los nodos están **cerca de las hojas**, así que bajan muy poco; los pocos nodos cercanos a la raíz sí pueden bajar mucho, pero son muy pocos. La mayor parte del trabajo es barato.

La clase lo señala como **error frecuente**: «construir el heap con n inserciones (O(n log n)) cuando heapify lo hace en O(n)».`,
    formal: R`
**Algoritmo** (max-heap):

~~~
heapify(a):
    para i desde n // 2 - 1 hasta 0:        # de derecha a izquierda, de abajo hacia arriba
        bajar(a, i)                          # la misma bajada de extraer
~~~

**Corrección:** al llegar a §i§, los subárboles de sus hijos ya son heaps (se procesaron antes, porque los índices mayores se tratan primero). Bajar §a[i]§ restablece la propiedad en todo el subárbol de §i§.

[comp]**Por qué es §O(n)§.** Un nodo a altura §k§ (contada desde las hojas) baja a lo sumo §k§ niveles. En un árbol de §n§ nodos hay a lo sumo §⌈n / 2^(k+1)⌉§ nodos de altura §k§. El trabajo total es

§T(n) ≤ Σₖ ⌈n / 2^(k+1)⌉ · k = O(n · Σₖ k / 2^k) = O(n)§

porque la serie §Σ k / 2^k§ converge a 2. En cambio, **n inserciones** cuestan §Σ log i = O(n log n)§: cada elemento puede subir hasta la raíz.[/comp]`,
    procedimiento: R`
**Heapify a mano** (max-heap) sobre §[3, 1, 6, 5, 2, 4]§ (§n = 6§):

1. Primer nodo con hijos: §n // 2 − 1 = 2§ (valor 6; sus hijos están en 5 → 4). **6 ≥ 4**: no cambia.
2. §i = 1§ (valor 1; hijos 5 y 2): el mayor es **5** → intercambia → §[3, 5, 6, 1, 2, 4]§.
3. §i = 0§ (valor 3; hijos 5 y 6): el mayor es **6** → intercambia → §[6, 5, 3, 1, 2, 4]§; el 3 está en el índice 2 y su hijo (índice 5) es 4 > 3 → intercambia → §[6, 5, 4, 1, 2, 3]§.

Resultado: **max-heap §[6, 5, 4, 1, 2, 3]§**.`,
    codigo: [{
      titulo: 'heapify manual y con heapq, y comparación del número de intercambios con n inserciones',
      src: R`
import heapq

def bajar(a, i, n):
    cambios = 0
    while True:
        mayor = i
        l, r = 2 * i + 1, 2 * i + 2
        if l < n and a[l] > a[mayor]:
            mayor = l
        if r < n and a[r] > a[mayor]:
            mayor = r
        if mayor == i:
            return cambios
        a[i], a[mayor] = a[mayor], a[i]
        i = mayor
        cambios += 1

def heapify_max(a):
    total = 0
    for i in range(len(a) // 2 - 1, -1, -1):
        total += bajar(a, i, len(a))
    return total

datos = [3, 1, 6, 5, 2, 4]
c = heapify_max(datos)
print(datos, "intercambios:", c)

# con heapq (min-heap): O(n), mas rapido que n inserciones
m = [8, 3, 5, 1, 9, 2]
heapq.heapify(m)
print(m, m[0])

# n inserciones en un min-heap: mismo conjunto, pero O(n log n)
h = []
for x in [8, 3, 5, 1, 9, 2]:
    heapq.heappush(h, x)
print(h, h[0])
`,
      esperado: '[6, 5, 4, 1, 2, 3] intercambios: 3\n[1, 3, 2, 8, 9, 5] 1\n[1, 3, 2, 8, 9, 5] 1'
    }],
    ejemplo: R`
**Heapify de §[3, 1, 6, 5, 2, 4]§** (max-heap):

| paso | i | árbol/arreglo tras el paso |
|---|---|---|
| inicio | — | §[3, 1, 6, 5, 2, 4]§ |
| 1 | 2 | §[3, 1, 6, 5, 2, 4]§ (6 ≥ 4: sin cambio) |
| 2 | 1 | §[3, 5, 6, 1, 2, 4]§ (baja el 1 por el 5) |
| 3 | 0 | §[6, 5, 4, 1, 2, 3]§ (baja el 3 por el 6 y luego por el 4) |

**Comparación:** insertar uno por uno 3, 1, 6, 5, 2, 4 en un max-heap vacío daría §[6, 5, 4, 1, 2, 3]§ en este caso, pero el **costo** en el peor caso crece como §n log n§; el heapify siempre es lineal. En Python, §heapq.heapify§ construye un **min-heap**.`,
    complejidad: R`
| Construcción | Costo |
|---|---|
| **Heapify** (bajar desde §n//2 − 1§ hasta 0) | **§O(n)§** |
| **n inserciones** (subir cada una) | **§O(n log n)§** |

- Más preciso: heapify hace a lo sumo §2n§ comparaciones y §n§ intercambios.
- El **espacio** extra es §O(1)§ (se reorganiza el mismo arreglo).
- Heapify es la primera fase de **heapsort** (tema [[hp-topk]]).`,
    errores: R`
- **Construir el heap con n inserciones** cuando ya se tiene la lista: §O(n log n)§ en vez de §O(n)§.
- **Empezar a bajar desde la raíz hacia las hojas** (orden inverso): no garantiza que los subárboles ya sean heaps.
- **Recorrer desde §n − 1§** en vez de desde §n // 2 − 1§: las hojas no necesitan bajar.
- **Olvidar que §heapq.heapify§ hace un min-heap**: para max-heap hay que negar los valores.
- **Creer que el resultado del heapify es único**: puede haber varios heaps válidos con los mismos datos; lo que cambia con el algoritmo es la disposición exacta.`,
    preguntas: [
      ['¿Cómo se construye un heap a partir de un arreglo cualquiera y cuánto cuesta?', 'Con heapify: se recorren los nodos desde el último con hijos (n // 2 − 1) hasta la raíz y se baja cada uno. Cuesta O(n), más rápido que n inserciones (O(n log n)).'],
      ['¿Por qué heapify empieza en §n // 2 − 1§ y no en el último elemento?', 'Porque las hojas (índices ≥ n // 2) ya son heaps de un solo elemento y no tienen hijos con los que intercambiar.'],
      ['Explica con tus palabras por qué heapify es lineal.', 'Porque la mayoría de los nodos están cerca de las hojas y bajan muy pocos niveles; solo unos pocos nodos cercanos a la raíz bajan mucho. La suma de las alturas de todos los nodos es O(n).'],
      ['Aplica heapify (max-heap) a §[3, 1, 6, 5, 2, 4]§.', '[6, 5, 4, 1, 2, 3]: se baja el índice 2 (sin cambio), el índice 1 (el 1 baja por el 5) y el índice 0 (el 3 baja por el 6 y luego por el 4).']
    ],
    resumen: R`
- **Heapify**: bajar cada nodo desde §n // 2 − 1§ hasta §0§ ⇒ **§O(n)§**.
- Mejor que **n inserciones** (§O(n log n)§): casi todos los nodos están cerca de las hojas y bajan poco.
- Las hojas no se tocan; al bajar el nodo §i§, sus subárboles ya son heaps.
- §heapq.heapify§ → **min-heap** en §O(n)§.`
  });

  B.tema({
    id: 'hp-cola-prioridad', area: 'hp', titulo: 'Cola de prioridad, tabla de operaciones y heapq', fuente: 'S7-C2 · diap. 20-22, 26, 29', nivel: 13,
    conceptos: ['hp_pq'], lab: [{ tab: 'pilas', e: 'cola', texto: 'Comparar con la cola FIFO' }], alias: 'priority queue heappush heappop',
    definicion: R`
Una **cola de prioridad** es el TAD que entrega siempre el elemento de **mayor (o menor) prioridad**, **no el más antiguo**. Operaciones: §insertar(x, prioridad)§ y §extraer_prioritario()§.

El **heap** la implementa de forma eficiente: ambas operaciones en **§O(log n)§**. En Python, la biblioteca estándar trae §heapq§: un **min-heap** sobre una lista.`,
    intuicion: R`
Una **fila de banco** (cola FIFO) atiende por orden de llegada; una **sala de urgencias** atiende por gravedad: eso es una cola de prioridad. Se necesita, para cada paciente, *insertarlo* y *sacar al más grave*, sin tener que ordenar a todos cada vez.

¿Por qué el heap y no una lista? Con una **lista sin ordenar** insertar es rápido pero encontrar al más urgente obliga a recorrer todo; con una **lista ordenada** sacar es rápido pero insertar obliga a desplazar. **El heap equilibra ambas** en §O(log n)§.`,
    formal: R`
**Comparación de implementaciones** (diapositiva 22):

| Implementación | Insertar | Extraer prioritario |
|---|---|---|
| Lista **sin ordenar** | §O(1)§ | §O(n)§ |
| Lista **ordenada** | §O(n)§ | §O(1)§ |
| **Heap** | §O(log n)§ | §O(log n)§ |

**Tabla de operaciones del heap** (diapositiva 21):

| Operación | Tiempo | Descripción |
|---|---|---|
| Ver el máximo (o mín.) | §O(1)§ | es la raíz: §h[0]§ |
| Insertar | §O(log n)§ | añadir hoja + heapify hacia arriba |
| Extraer máx./mín. | §O(log n)§ | quitar la raíz + heapify hacia abajo |
| Construir desde arreglo | §O(n)§ | heapify |
| Buscar un valor | §O(n)§ | no hay orden por valor |

**Heap vs. BST:** el heap da el extremo en §O(1)§ y lo extrae en §O(log n)§, pero **no busca por valor ni recorre en orden**; el BST busca cualquier valor y recorre ordenado, pero no da el máximo más rápido. Herramientas distintas para necesidades distintas.

**§heapq§ de Python:** §heappush(h, x)§ §O(log n)§; §heappop(h)§ §O(log n)§; §h[0]§ §O(1)§; §heapify(lista)§ §O(n)§; **max-heap negando los valores**: §maxh = [-x for x in datos]§ y §-heappop(maxh)§.

[comp]El código de §heapq§ usa una variante de la bajada (lleva el elemento hasta una hoja y luego lo sube). Los resultados son heaps válidos, pero el **orden interno exacto** de la lista puede diferir del de la implementación «de libro» de las diapositivas; la **extracción** sí devuelve siempre el mismo orden de valores.[/comp]`,
    procedimiento: R`
**Para resolver con una cola de prioridad:**

1. Decide qué es la **prioridad** (el número que ordena) y si manda el **mayor** o el **menor**.
2. En Python: min-heap con §heapq§. Si manda el mayor, **niega** la prioridad al insertar y vuelve a negarla al extraer.
3. Para guardar datos asociados, inserta **tuplas** §(prioridad, dato)§ (se comparan por la primera componente).
4. Extrae con §heappop§ hasta que se acabe o hasta tener lo necesario.

**Ejemplo de la clase (diap. 22):** tareas A (prioridad 2), B (9), C (5): sale **B** primero (la de prioridad 9), luego C y luego A.`,
    codigo: [{
      titulo: 'heapq: min-heap, max-heap con valores negados y cola de prioridad con tuplas',
      src: R`
import heapq

h = []
heapq.heappush(h, 8)
heapq.heappush(h, 3)
heapq.heappush(h, 5)
print(heapq.heappop(h))                 # 3 (el minimo)
print(h[0])                             # el minimo sin extraer: O(1)

# max-heap: se niegan los valores
datos = [8, 3, 5, 1, 9, 2]
maxh = [-x for x in datos]
heapq.heapify(maxh)
print(-heapq.heappop(maxh))             # 9 (el maximo)

# cola de prioridad: sale la de mayor prioridad, no la mas antigua
cola = []
for prioridad, tarea in [(2, "A"), (9, "B"), (5, "C")]:
    heapq.heappush(cola, (-prioridad, tarea))
orden = []
while cola:
    p, tarea = heapq.heappop(cola)
    orden.append((tarea, -p))
print(orden)
`,
      esperado: '3\n5\n9\n[(\'B\', 9), (\'C\', 5), (\'A\', 2)]'
    }],
    ejemplo: R`
**Cola de prioridad con tres tareas.** Insertamos A (prioridad 2), B (9) y C (5). Como §heapq§ es un min-heap, guardamos §(−prioridad, tarea)§:

| Paso | Heap (mínimo arriba) | Sale |
|---|---|---|
| insertar A | §[(−2, A)]§ | — |
| insertar B | §[(−9, B), (−2, A)]§ | — |
| insertar C | §[(−9, B), (−2, A), (−5, C)]§ | — |
| extraer | §[(−5, C), (−2, A)]§ | **B** (prioridad 9) |
| extraer | §[(−2, A)]§ | **C** (prioridad 5) |
| extraer | §[]§ | **A** (prioridad 2) |

**No salió en el orden de llegada (A, B, C)** sino por prioridad: esa es la diferencia con una cola FIFO.`,
    complejidad: R`
- Insertar y extraer: **§O(log n)§** cada uno; ver el prioritario: **§O(1)§**.
- Procesar **n** tareas (insertar todas y extraerlas todas): **§O(n log n)§**.
- Con **lista sin ordenar**: n inserciones §O(n)§ + n extracciones §O(n²)§ → §O(n²)§. Con **lista ordenada**: §O(n²)§ en inserciones. El heap gana en ambos casos.
- **Dónde se usa:** Dijkstra y A* (semana 12), planificadores de tareas, simuladores de eventos (siempre el evento de menor tiempo), el problema top-k.`,
    errores: R`
- **Creer que una cola de prioridad es FIFO**: sale el más urgente, no el más antiguo.
- **Olvidar que §heapq§ es un min-heap**: para que salga el mayor hay que negar los valores.
- **Usar un heap para buscar un valor**: §O(n)§; da el extremo, no la búsqueda.
- **Olvidar negar de vuelta** al extraer de un max-heap simulado con valores negativos.
- **Insertar datos no comparables** en el heap (por ejemplo, tuplas cuyo segundo elemento no se puede comparar cuando hay empate en la prioridad).`,
    preguntas: [
      ['¿Qué es una cola de prioridad y qué estructura la implementa eficientemente?', 'Un TAD que entrega siempre el elemento de mayor (o menor) prioridad, no el más antiguo. Se implementa con un heap: insertar y extraer en O(log n).'],
      ['Compara lista sin ordenar, lista ordenada y heap para una cola de prioridad.', 'Lista sin ordenar: insertar O(1), extraer O(n). Lista ordenada: insertar O(n), extraer O(1). Heap: ambas O(log n); equilibra las dos operaciones.'],
      ['¿Cómo se obtiene un max-heap con §heapq§?', 'heapq es un min-heap; para un max-heap se niegan los valores al insertar (maxh = [-x for x in datos]; heapify) y se vuelve a negar al extraer (-heappop(maxh)).'],
      ['Da dos usos de las colas de prioridad en IA.', 'Dijkstra y A* (elegir el nodo más cercano no visitado), búsqueda de vecinos/top-k, beam search y planificación de eventos con un min-heap.']
    ],
    resumen: R`
- **Cola de prioridad**: sale el más urgente; el **heap** lo logra con insertar y extraer en **§O(log n)§**.
- Tabla del heap: extremo §O(1)§, insertar §O(log n)§, extraer §O(log n)§, construir §O(n)§, buscar §O(n)§.
- §heapq§ = **min-heap**; max-heap negando valores; datos asociados con tuplas §(prioridad, dato)§.
- Heap ≠ BST: extremo rápido, pero **sin búsqueda ni inorden**.`
  });

  B.tema({
    id: 'hp-topk', area: 'hp', titulo: 'Top-k, heapsort y los heaps en sistemas de IA', fuente: 'S7-C2 · diap. 4, 23-29', nivel: 13,
    conceptos: ['hp_topk'], lab: [{ tab: 'heap', e: 'topk', texto: 'Ver top-k con un heap' }, { tab: 'heap', e: 'sort', texto: 'Ver heapsort' }], alias: 'top-k heapsort vecinos beam search',
    definicion: R`
**Top-k**: obtener los **k mejores** de n elementos **sin ordenar todo**. Para los **k menores** se usa un **max-heap de tamaño k**: si el máximo del heap (el peor de los k elegidos) es **mayor** que el elemento nuevo, se **reemplaza**. Así el heap siempre contiene los **k menores vistos**. Costo **§O(n log k)§** en tiempo y **§O(k)§** en memoria.

**Heapsort**: construir un max-heap (§O(n)§) y extraer el máximo **n veces**, colocando cada uno **al final**: ordenamiento en **§O(n log n)§**.`,
    intuicion: R`
**Top-k**: es como una **lista de finalistas** con k puestos. El heap te dice al instante quién es el **peor de los finalistas** (la raíz): cada candidato nuevo se compara **solo con él**; si no lo mejora, se descarta; si lo mejora, lo reemplaza y se reacomoda el heap en §O(log k)§. Nunca necesitas guardar el millón de candidatos.

**Heapsort**: se arma un heap y se **va sacando al campeón** una y otra vez; como cada extracción deja libre la última casilla, el campeón se guarda ahí. Al final el arreglo queda ordenado **sin memoria extra**.

**Con n = 10⁶ y k = 10**: §O(n log k)§ son ≈ n × 3; ordenar todo son ≈ n × 20.`,
    formal: R`
**Top-k de los k menores** (heap de tamaño k):

~~~
para cada x del flujo:
    si el heap tiene < k elementos:  insertar(x)                 # O(log k)
    sino si x < raiz del heap:       reemplazar la raíz por x y bajar   # O(log k)
    sino:                            descartar x                 # O(1)
~~~

**Corrección:** el heap contiene siempre los k menores vistos; la raíz es el **mayor** de ellos, es decir, el candidato a salir. **Costo:** n pasos de §O(log k)§ → §O(n log k)§; memoria §O(k)§. La biblioteca lo trae hecho: §heapq.nsmallest(k, datos)§ y §heapq.nlargest(k, datos)§.

**Heapsort** (diapositiva 25):

| Algoritmo | Mejor | Promedio | Peor | Espacio |
|---|---|---|---|---|
| Heapsort | §O(n log n)§ | §O(n log n)§ | §O(n log n)§ | §O(1)§ |

Ventaja única: es §O(n log n)§ **garantizado** (quicksort puede degenerar a §O(n²)§) y usa §O(1)§ de memoria extra (merge sort usa §O(n)§).

**En sistemas de IA** (diapositiva 26): **búsqueda de vecinos** (top-k: recuperar los k documentos/vectores más similares a una consulta: base de los sistemas de recuperación y RAG), ***beam search*** (se mantienen las k secuencias más probables con un heap en cada paso; para descartar rápido la peor conviene un **min-heap de tamaño k**, cuya raíz es la menos probable), **Dijkstra y A\*** (cola de prioridad) y **planificación de eventos** (siempre el evento de menor tiempo con un min-heap).`,
    procedimiento: R`
**Actividad de la clase (flujo de 20 puntajes, mantener los 5 mejores):**

1. Elige el **tipo de heap**: para los **5 mejores (mayores)** usa un **min-heap de tamaño 5** (la raíz es el peor de los mejores); para los **k menores**, un **max-heap**.
2. Llena el heap con los primeros 5.
3. Para cada puntaje nuevo: ¿mejora a la raíz? Si sí, §heapreplace§ (reemplaza y baja); si no, descártalo.
4. Al final, el heap contiene los 5 mejores (no ordenados); ordénalos si hace falta (§O(k log k)§).
5. **Compara**: ordenar los 20 y tomar 5 cuesta §O(n log n)§ y guarda todo; con 10⁶ puntajes el heap sigue usando solo 5 casillas.

**Heapsort a mano:** (1) construye el max-heap; (2) intercambia la raíz con la última casilla del heap; (3) reduce el tamaño del heap en 1; (4) baja la nueva raíz; (5) repite hasta que el heap tenga 1 elemento.`,
    codigo: [{
      titulo: 'Top-k con un heap de tamaño k (heapq) y heapsort con el MaxHeap de la clase',
      src: MAXHEAP + R`
import heapq

def k_mayores(flujo, k):
    h = []                                  # min-heap de tamano k: la raiz es el peor de los mejores
    for x in flujo:
        if len(h) < k:
            heapq.heappush(h, x)
        elif x > h[0]:
            heapq.heapreplace(h, x)         # saca la raiz y mete x en O(log k)
    return sorted(h, reverse=True)

print(k_mayores([8, 3, 5, 1, 9, 2, 7, 10, 4], 3))
print(heapq.nsmallest(3, [8, 3, 5, 1, 9, 2, 7]))     # [1, 2, 3]
print(heapq.nlargest(3, [8, 3, 5, 1, 9, 2, 7]))      # [9, 8, 7]

def heapsort(a):
    h = MaxHeap()
    for x in a:
        h.insertar(x)
    salida = []
    while h.datos:
        salida.append(h.extraer_max())      # sale de mayor a menor
    salida.reverse()
    return salida

print(heapsort([9, 4, 7, 1, 8, 2]))
`,
      esperado: '[10, 9, 8]\n[1, 2, 3]\n[9, 8, 7]\n[1, 2, 4, 7, 8, 9]'
    }],
    ejemplo: R`
**Top-3 menores de §[8, 3, 5, 1, 9, 2, 7]§** con un max-heap de tamaño 3:

| llega | acción | heap (raíz = mayor) |
|---|---|---|
| 8 | entra (tiene < 3) | §[8]§ |
| 3 | entra | §[8, 3]§ |
| 5 | entra | §[8, 3, 5]§ |
| 1 | §1 < 8§: reemplaza la raíz | §[5, 3, 1]§ |
| 9 | §9 ≥ 5§: se descarta | §[5, 3, 1]§ |
| 2 | §2 < 5§: reemplaza la raíz | §[3, 2, 1]§ |
| 7 | §7 ≥ 3§: se descarta | §[3, 2, 1]§ |

**Resultado:** los 3 menores son **1, 2, 3**. Se hicieron 7 pasos de §O(log 3)§ cada uno y nunca hubo más de 3 elementos en memoria.`,
    complejidad: R`
- **Top-k con heap de tamaño k:** §O(n log k)§ tiempo, §O(k)§ memoria. Si se usa un heap de tamaño **n** se gasta memoria de más.
- **Ordenar todo y tomar k:** §O(n log n)§ tiempo, §O(n)§ memoria.
- **Heapsort:** §O(n log n)§ en **todos** los casos, §O(1)§ de memoria extra; no es estable.
- **Operación clave:** cada extracción o reemplazo cuesta §O(log k)§ (altura del heap de tamaño k).
- Con **n = 10⁶ y k = 10:** ≈ 3 · 10⁶ operaciones frente a ≈ 2 · 10⁷ (ordenar todo).`,
    errores: R`
- **Usar un heap de tamaño n para top-k**: basta uno de tamaño **k**; el de tamaño n gasta memoria de más.
- **Elegir el tipo de heap al revés**: para los k **menores** hace falta un **max-heap** (la raíz es el peor de los elegidos); para los k **mayores**, un **min-heap**.
- **Olvidar que §heapq§ es un min-heap**: para un max-heap se niegan los valores.
- **Suponer que heapsort es estable** o que usa memoria auxiliar: es **en el sitio** y **no estable**.
- **Creer que top-k obliga a ordenar los k elegidos** durante el recorrido: solo se ordenan al final, si hace falta.`,
    preguntas: [
      ['Para obtener los 10 vecinos más cercanos de un millón de candidatos, ¿qué heap usarías y qué complejidad tiene?', 'Un max-heap de tamaño 10 sobre la distancia (la raíz es el peor de los 10 mejores): si un candidato es más cercano que la raíz, la reemplaza. Cuesta O(n log k) con k = 10 (≈ 3n) frente a O(n log n) de ordenar (≈ 20n), y solo guarda 10 elementos en memoria.'],
      ['¿Por qué un heap de tamaño k resuelve top-k en O(n log k)?', 'Porque cada uno de los n elementos se compara con la raíz en O(1) y, si entra, se inserta o reemplaza con un heapify de O(log k) (altura de un heap de k elementos).'],
      ['Explica heapsort y su ventaja frente a quicksort y merge sort.', 'Se construye un max-heap en O(n) y se extrae el máximo n veces colocándolo al final: O(n log n). Es O(n log n) garantizado (quicksort puede degenerar a O(n²)) y usa O(1) de memoria extra (merge sort usa O(n)).'],
      ['Dos usos de los heaps en sistemas de IA.', 'Búsqueda de vecinos (top-k, RAG), beam search (mantener las k secuencias más probables), Dijkstra y A* (cola de prioridad) y planificación de eventos con un min-heap.']
    ],
    resumen: R`
- **Top-k**: heap de tamaño **k** ⇒ **§O(n log k)§** y memoria **§O(k)§** (para los k **menores**: max-heap; para los k **mayores**: min-heap).
- **Heapsort**: heapify §O(n)§ + n extracciones §O(log n)§ ⇒ **§O(n log n)§** garantizado y **§O(1)§** extra.
- En IA: **vecinos/RAG, beam search, Dijkstra/A\*, planificación de eventos**.
- Errores: heap de tamaño n, heap al revés, olvidar que §heapq§ es min-heap.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
