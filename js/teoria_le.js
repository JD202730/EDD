/* teoria_le.js — Biblioteca: área Listas enlazadas (fuente: S4-C2, Clase2_ListasEnlazadas, 24 diapositivas).
   Contenido complementario: la comprobación de rango después del bucle en insertar_en (la de la clase solo comprueba dentro del bucle). */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;

  const LISTA = R`
class Nodo:
    def __init__(self, dato):
        self.dato = dato
        self.siguiente = None               # referencia al proximo nodo

class ListaEnlazada:
    def __init__(self):
        self.cabeza = None

    def insertar_inicio(self, dato):        # O(1)
        nuevo = Nodo(dato)
        nuevo.siguiente = self.cabeza       # el nuevo apunta al antiguo primero
        self.cabeza = nuevo                 # la cabeza pasa a ser el nuevo

    def insertar_final(self, dato):         # O(n): hay que llegar al ultimo
        nuevo = Nodo(dato)
        if self.cabeza is None:
            self.cabeza = nuevo
            return
        actual = self.cabeza
        while actual.siguiente is not None:
            actual = actual.siguiente
        actual.siguiente = nuevo

    def insertar_en(self, dato, pos):       # pos = 0 es el frente
        if pos == 0:
            self.insertar_inicio(dato)
            return
        actual = self.cabeza                # buscar el nodo en pos - 1 (O(n))
        for _ in range(pos - 1):
            if actual is None:
                raise IndexError("posicion fuera de rango")
            actual = actual.siguiente
        if actual is None:                  # complemento: comprobar tambien despues del bucle
            raise IndexError("posicion fuera de rango")
        nuevo = Nodo(dato)
        nuevo.siguiente = actual.siguiente  # (1) el nuevo apunta al que estaba en pos
        actual.siguiente = nuevo            # (2) el nodo pos - 1 apunta al nuevo

    def eliminar(self, dato):
        actual, anterior = self.cabeza, None
        while actual is not None:
            if actual.dato == dato:
                if anterior is None:        # el nodo es la CABEZA
                    self.cabeza = actual.siguiente
                else:                       # nodo intermedio o final
                    anterior.siguiente = actual.siguiente
                return True
            anterior = actual               # avanzar los dos punteros
            actual = actual.siguiente
        return False                        # el dato no estaba en la lista

    def buscar(self, dato):
        actual = self.cabeza
        while actual is not None:
            if actual.dato == dato:
                return actual
            actual = actual.siguiente
        return None

    def invertir(self):
        anterior = None
        actual = self.cabeza
        while actual is not None:
            siguiente = actual.siguiente
            actual.siguiente = anterior     # darle la vuelta a la flecha
            anterior = actual
            actual = siguiente
        self.cabeza = anterior

    def a_lista(self):                      # O(n): los datos en orden
        datos = []
        actual = self.cabeza
        while actual is not None:
            datos.append(actual.dato)
            actual = actual.siguiente
        return datos

    def recorrer(self):                     # O(n)
        actual = self.cabeza
        while actual is not None:
            print(actual.dato, end=" -> ")
            actual = actual.siguiente
        print("None")
`;
  B.codigo = B.codigo || {}; B.codigo.LISTA = LISTA;

  B.tema({
    id: 'le-nodo', area: 'le', titulo: 'El nodo y la lista enlazada simple', fuente: 'S4-C2 · diap. 4-7, 18, 20', nivel: 12,
    conceptos: ['le_nodo'], lab: [{ tab: 'listas', e: 'ini', texto: 'Ver insertar al inicio' }], alias: 'nodo cabeza siguiente lista enlazada referencia none',
    definicion: R`
Una **lista enlazada** almacena los elementos en **nodos dispersos por la memoria**. Cada nodo guarda:

- un **dato**, y
- una **referencia al siguiente nodo**.

Un puntero **cabeza** marca el primero; el **último apunta a §None§**. Es una **estructura dinámica** (semana 1): no es contigua, crece y se reduce en ejecución pidiendo o liberando nodos. El precio: una **referencia extra por nodo** y la **pérdida del acceso por índice**.`,
    intuicion: R`
Es una **búsqueda del tesoro**: cada pista (nodo) tiene su premio (el dato) y te dice **dónde está la siguiente**. No puedes saltar a la pista número 7: debes seguir las anteriores. A cambio, **agregar una pista nueva al principio** es solo cambiar a dónde apunta la primera.

**Pregunta inicial de la clase:** en un arreglo, insertar al inicio obliga a desplazar todos los demás (§O(n)§). ¿Y si cada elemento, en vez de estar en una casilla contigua, solo **apuntara al siguiente**? Entonces insertar al inicio cuesta **§O(1)§**: se reasignan dos referencias y **nada se desplaza**.`,
    formal: R`
**Definición en Python** (diap. 6):

~~~
class Nodo:
    def __init__(self, dato):
        self.dato = dato
        self.siguiente = None      # referencia al próximo nodo

class ListaEnlazada:
    def __init__(self):
        self.cabeza = None
~~~

**Inserción al inicio (§O(1)§):** (1) §nuevo = Nodo(dato)§; (2) §nuevo.siguiente = self.cabeza§ (el nuevo apunta al **antiguo primero**); (3) §self.cabeza = nuevo§ (la cabeza pasa a ser el nuevo). **Solo se reasignan dos referencias**; el costo es constante sin importar el tamaño de la lista.

**Recorrido (§O(n)§):** §actual = self.cabeza§ y, mientras §actual is not None§, procesar §actual.dato§ y §actual = actual.siguiente§.

**Contraste con el arreglo:** insertar al inicio de un arreglo es §O(n)§ (desplaza todo); en una lista enlazada es §O(1)§. **Ese es el intercambio central entre contiguo y enlazado.**

**Cuándo brillan** las listas (diap. 18): inserciones/eliminaciones frecuentes en extremos, tamaño muy variable e impredecible, implementar pilas, colas y deques. **Cuándo evitarlas:** cuando domina el acceso por índice, cuando la localidad de caché es crítica (cómputo numérico, tensores) o cuando la memoria es escasa.`,
    procedimiento: R`
**Para trabajar con listas enlazadas, siempre:**

1. **Dibuja** los nodos como cajas con una flecha al siguiente, y la **cabeza** como una flecha desde fuera.
2. Antes de cada reasignación, pregúntate **«¿perdí la referencia a algo?»** (lo que no se apunta se pierde).
3. Considera siempre el caso de la **lista vacía** (§cabeza is None§).
4. Para recorrer, usa un puntero auxiliar (§actual§) y **no muevas la cabeza**.

**Traza de la clase:** lista §10 → 20 → None§; §insertar_inicio(5)§:

1. §nuevo = Nodo(5)§, con §nuevo.siguiente = None§.
2. §nuevo.siguiente = self.cabeza§ → §5 → 10 → 20 → None§ (la cabeza aún apunta al 10).
3. §self.cabeza = nuevo§ → la lista visible es §5 → 10 → 20 → None§.`,
    codigo: [{
      titulo: 'Nodo y ListaEnlazada (diapositivas 6-12): construir y recorrer',
      src: LISTA + R`
lista = ListaEnlazada()
for x in [30, 20, 10]:
    lista.insertar_inicio(x)            # cada uno pasa a ser la cabeza
lista.recorrer()
print(lista.a_lista())
lista.insertar_inicio(5)
lista.recorrer()

vacia = ListaEnlazada()
print(vacia.cabeza, vacia.a_lista())    # caso de la lista vacia
vacia.insertar_inicio(1)
print(vacia.a_lista())
`,
      esperado: '10 -> 20 -> 30 -> None\n[10, 20, 30]\n5 -> 10 -> 20 -> 30 -> None\nNone []\n[1]'
    }],
    ejemplo: R`
**Construir §10 → 20 → 30§ con §insertar_inicio§** (se inserta en orden inverso, porque cada nuevo pasa a ser la cabeza):

| Paso | Operación | Lista |
|---|---|---|
| 1 | §insertar_inicio(30)§ | §30 → None§ |
| 2 | §insertar_inicio(20)§ | §20 → 30 → None§ |
| 3 | §insertar_inicio(10)§ | §10 → 20 → 30 → None§ |

**Arreglo vs. lista al insertar al inicio un elemento** (n = 1000 elementos): el arreglo desplaza **1000** elementos; la lista reasigna **2 referencias**. **Nota para IA (diap. 18):** los tensores de NumPy/PyTorch **nunca** son listas enlazadas: son bloques contiguos, porque el cómputo por lotes exige recorrer memoria de forma predecible. La lista enlazada brilla en el **control** (colas de tareas), no en los **datos numéricos**.`,
    complejidad: R`
| Operación | Costo |
|---|---|
| Insertar al inicio | **§O(1)§** |
| Recorrer / buscar por valor | §O(n)§ |
| Acceso al elemento §i§ | §O(n)§ (seguir §i§ referencias) |
| Memoria | §n§ nodos, cada uno con **una referencia extra** |

- **Localidad de caché:** pobre (nodos dispersos).
- **Costo de pedir cada nodo** al montículo: pedir memoria al sistema es costoso.`,
    errores: R`
- **Perder la cabeza al reasignar referencias en la inserción:** la lista se pierde.
- **Olvidar el caso de lista vacía** (§cabeza is None§) en inserción y eliminación.
- **Creer que se puede acceder a §lista[i]§:** no hay índice; hay que recorrer.
- **Recorrer una lista con ciclo mediante un §while§ ingenuo:** bucle infinito (ver [[le-floyd]]).
- **Usar una lista enlazada para datos numéricos «por ahorrar»:** la mala localidad la hace lenta.`,
    preguntas: [
      ['¿Qué guarda cada nodo de una lista simple?', 'Un dato y una referencia al siguiente nodo; el último apunta a None y un puntero cabeza marca el primero.'],
      ['¿Por qué insertar al inicio es O(1) en una lista enlazada y O(n) en un arreglo?', 'En la lista solo se reasignan dos referencias (nuevo.siguiente = cabeza; cabeza = nuevo) sin mover ningún nodo; en el arreglo hay que desplazar los n elementos una posición.'],
      ['¿Por qué el acceso a §A[i]§ es O(n) en una lista enlazada?', 'Porque no hay fórmula de direcciones: los nodos están dispersos, y para llegar al i-ésimo hay que seguir i referencias desde la cabeza.'],
      ['Da un caso en el que prefieras una lista enlazada y uno en el que la evites.', 'Se prefiere para inserciones/eliminaciones frecuentes en los extremos o para implementar pilas, colas y deques; se evita cuando domina el acceso por índice, la localidad de caché es crítica (tensores) o la memoria es escasa.']
    ],
    resumen: R`
- **Lista enlazada** = nodos (**dato + referencia**) dispersos; **cabeza** al primero; el último apunta a §None§.
- **Insertar al inicio §O(1)§** (dos referencias); **recorrer/buscar/acceso §O(n)§**.
- Gana en modificación estructural; el **arreglo** gana en acceso y localidad.
- Brilla en el **control** (colas de tareas), no en datos numéricos.`
  });

  B.tema({
    id: 'le-insertar', area: 'le', titulo: 'Insertar en una posición arbitraria: el orden de las dos reasignaciones', fuente: 'S4-C2 · diap. 7-9, 20', nivel: 12, comp: true,
    conceptos: ['le_ins'], lab: [{ tab: 'listas', e: 'en', texto: 'Ver insertar en el medio' }, { tab: 'listas', e: 'fin', texto: 'Ver insertar al final' }], alias: 'insertar_en posicion insertar final puntero cola',
    definicion: R`
Insertar **«en el frente»** es §O(1)§. Insertar en una **posición arbitraria §pos§** exige **encontrar el nodo anterior** (en la posición §pos − 1§), lo que cuesta **§O(n)§**, y luego **enlazar** el nodo nuevo con **dos reasignaciones, en este orden**:

1. §nuevo.siguiente = actual.siguiente§ — el nuevo apunta a quien estaba en §pos§.
2. §actual.siguiente = nuevo§ — el nodo §pos − 1§ apunta al nuevo.

**El orden (1) antes que (2) es clave:** si se reasigna §actual.siguiente§ primero, **se pierde el resto de la lista**.`,
    intuicion: R`
Para **colar una persona en medio de una fila de la mano**: primero haces que la persona nueva **tome de la mano a quien iba a quedar detrás** (paso 1); **después** la persona de adelante suelta a ese de atrás y toma a la nueva (paso 2). Si primero sueltas a todos los de atrás, nadie sabe quiénes eran.

El costo se reparte: **buscar el sitio es §O(n)§**; **enlazar** es solo **§O(1)§**. Si ya se tuviera el nodo anterior (un puntero a donde insertar), insertar sería §O(1)§.

**Insertar al final:** sin más información hay que recorrer toda la lista hasta el último nodo (**§O(n)§**); si la lista guarda además un **puntero a la cola**, es **§O(1)§**: §self.cola.siguiente = nuevo§ y §self.cola = nuevo§.`,
    formal: R`
**Código** (diap. 8):

~~~
def insertar_en(self, dato, pos):          # pos = 0 es el frente
    if pos == 0:
        self.insertar_inicio(dato); return
    actual = self.cabeza                    # buscar el nodo en pos - 1  (O(n))
    for _ in range(pos - 1):
        if actual is None:
            raise IndexError("posicion fuera de rango")
        actual = actual.siguiente
    nuevo = Nodo(dato)
    nuevo.siguiente = actual.siguiente      # (1) el nuevo apunta al que estaba en pos
    actual.siguiente = nuevo                # (2) el nodo pos-1 apunta al nuevo
~~~

[comp]**Comprobación de rango.** La versión de la clase comprueba §actual is None§ **dentro** del bucle, pero si la lista tiene §n§ nodos y §pos = n + 1§, el bucle termina con §actual§ igual a §None§ y la línea §actual.siguiente§ lanza §AttributeError§. En la clase de este tema se añade **una comprobación después del bucle**: así toda posición fuera de rango produce §IndexError§. (Insertar en §pos = n§, **al final**, es válido: §actual§ es el último nodo.)[/comp]

**Insertar al final** (sin puntero a la cola): si §cabeza is None§, §cabeza = nuevo§; si no, recorrer hasta que §actual.siguiente is None§ y hacer §actual.siguiente = nuevo§.`,
    procedimiento: R`
**Insertar §99§ en la posición 2 de §30 → 20 → 10§:**

1. §pos ≠ 0§: §actual = cabeza§ (30). El bucle corre §pos − 1 = 1§ vez: §actual§ pasa a **20** (el nodo en la posición 1).
2. §nuevo = Nodo(99)§.
3. **(1)** §nuevo.siguiente = actual.siguiente§ → 99 apunta a **10**.
4. **(2)** §actual.siguiente = nuevo§ → 20 apunta a **99**.
5. Resultado: §30 → 20 → 99 → 10§.

**Si se invirtiera el orden:** primero §actual.siguiente = nuevo§ (20 apunta a 99) y luego §nuevo.siguiente = actual.siguiente§ **= nuevo** (porque §actual.siguiente§ ya es el 99): el 99 se apuntaría a sí mismo (un **ciclo**) y el 10 se **pierde**.`,
    codigo: [{
      titulo: 'insertar_en, el orden de las reasignaciones y la posición fuera de rango',
      src: LISTA + R`
lista = ListaEnlazada()
for x in [10, 20, 30]:
    lista.insertar_inicio(x)            # 30 -> 20 -> 10
print(lista.a_lista())
lista.insertar_en(99, 2)                # entre 20 y 10
print(lista.a_lista())
lista.insertar_en(7, 0)                 # al frente
lista.insertar_en(8, len(lista.a_lista()))   # al final (pos = n es valida)
print(lista.a_lista())
try:
    lista.insertar_en(1, 99)
except IndexError as e:
    print("IndexError:", e)

# el ORDEN importa: si se reasigna actual.siguiente primero, se pierde el resto
mala = ListaEnlazada()
for x in [10, 20, 30]:
    mala.insertar_inicio(x)
actual = mala.cabeza.siguiente          # el nodo 20
nuevo = Nodo(99)
actual.siguiente = nuevo                # (2) primero: se pierde el 10
nuevo.siguiente = actual.siguiente      # (1) despues: nuevo.siguiente = nuevo mismo
print(nuevo.siguiente is nuevo)         # True: el 99 se apunta a si mismo
`,
      esperado: '[30, 20, 10]\n[30, 20, 99, 10]\n[7, 30, 20, 99, 10, 8]\nIndexError: posicion fuera de rango\nTrue'
    }],
    ejemplo: R`
**Costos al insertar en una lista de §n = 1000§ nodos:**

| Dónde | Hacer | Costo |
|---|---|---|
| al inicio | reasignar 2 referencias | §O(1)§ |
| en la posición §pos§ | recorrer §pos − 1§ nodos + reasignar 2 | §O(pos)§ |
| al final, sin puntero a la cola | recorrer 999 nodos | §O(n)§ |
| al final, **con puntero a la cola** | §cola.siguiente = nuevo§; §cola = nuevo§ | **§O(1)§** |

**Errores de enlace típicos:**

- Intercambiar los pasos (1) y (2): se pierde el resto de la lista.
- Olvidar actualizar la **cabeza** al insertar en la posición 0.
- No considerar la **lista vacía** al insertar al final.`,
    complejidad: R`
- **Buscar la posición** §pos − 1§: **§O(pos)§** ≤ §O(n)§.
- **Enlazar** (2 reasignaciones): **§O(1)§**.
- **Total insertar en una posición:** **§O(n)§** en el peor caso.
- **Al final:** §O(n)§ sin puntero a la cola; **§O(1)§** con él (y en una lista **doble** con cola, también).
- **Espacio extra:** §O(1)§ (un nodo nuevo).`,
    errores: R`
- **Reasignar §actual.siguiente§ antes que §nuevo.siguiente§:** se pierde el resto de la lista (o se crea un ciclo).
- **Olvidar el caso §pos == 0§** (cambiar la cabeza) y el de la **lista vacía**.
- **No comprobar la posición fuera de rango:** §AttributeError§ por §None§.
- **Creer que insertar en el medio es §O(1)§ siempre:** buscar el nodo anterior cuesta §O(n)§ (solo es §O(1)§ si ya se tiene el nodo).
- **Contar mal las vueltas del bucle:** para llegar al nodo en §pos − 1§ se avanzan §pos − 1§ veces (desde la cabeza).`,
    preguntas: [
      ['¿Por qué en §insertar_en§ la asignación §nuevo.siguiente = actual.siguiente§ debe hacerse antes que §actual.siguiente = nuevo§?', 'Porque si se reasigna actual.siguiente primero, se pierde la única referencia al resto de la lista (y nuevo.siguiente quedaría apuntando a sí mismo). Primero el nuevo se engancha al resto; después el anterior se engancha al nuevo.'],
      ['Inserta 99 en la posición 2 de §30 → 20 → 10§ y escribe el resultado y las dos reasignaciones.', '30 → 20 → 99 → 10. Con actual = nodo 20: (1) nuevo.siguiente = actual.siguiente (99 → 10); (2) actual.siguiente = nuevo (20 → 99).'],
      ['¿Cuál es el costo de insertar en una posición arbitraria y de insertar al final?', 'En una posición: O(n) (buscar el nodo anterior) + O(1) (enlazar). Al final: O(n) sin puntero a la cola, O(1) si se mantiene un puntero a la cola.'],
      ['¿Qué ocurre si se intenta insertar en una posición mayor que la longitud de la lista?', 'Hay que lanzar IndexError (posición fuera de rango); sin la comprobación, el recorrido llega a None y acceder a actual.siguiente produce un AttributeError.']
    ],
    resumen: R`
- **En la posición §pos§:** avanzar §pos − 1§ veces (§O(n)§) y enlazar con dos pasos **en orden**: **(1)** §nuevo.siguiente = actual.siguiente§, **(2)** §actual.siguiente = nuevo§.
- **Al final:** §O(n)§ sin puntero a la cola; **§O(1)§** con él.
- Cuidado con: orden de las reasignaciones, lista vacía, posición fuera de rango.`
  });

  B.tema({
    id: 'le-eliminar', area: 'le', titulo: 'Eliminar un nodo: puentear y los casos de la cabeza', fuente: 'S4-C2 · diap. 10-12, 20', nivel: 12,
    conceptos: ['le_del'], lab: [{ tab: 'listas', e: 'elim', texto: 'Ver eliminar un nodo' }], alias: 'eliminar nodo puentear anterior actual cabeza',
    definicion: R`
**Eliminar** un nodo de una lista enlazada es **puentearlo**: el **anterior** deja de apuntar al nodo eliminado y pasa a apuntar al **siguiente**. El nodo eliminado queda **sin referencias entrantes** y el **recolector de basura libera su memoria** (semana 1).

**Cuidado:** eliminar es §O(1)§ **si ya se tiene el nodo anterior**; si hay que **buscarlo** primero, el costo total es **§O(n)§** por la búsqueda.`,
    intuicion: R`
Es **sacar un eslabón de una cadena**: el eslabón anterior se engancha directamente con el siguiente, y el que sacaste cae. Hay **dos casos** porque el primer eslabón no tiene anterior:

- **Nodo intermedio o final:** §anterior.siguiente = actual.siguiente§.
- **La cabeza** (§anterior is None§): §self.cabeza = actual.siguiente§: la cabeza pasa al siguiente.

Por eso el recorrido lleva **dos punteros que avanzan juntos**: §anterior§ (el nodo de atrás) y §actual§ (el que se examina).`,
    formal: R`
**Recorrido paso a paso para eliminar el 20** de §30 → 20 → 10§ (diap. 11):

1. §actual = cabeza§ (30), §anterior = None§. ¿§30 == 20§? No → avanzar.
2. §anterior = 30§, §actual = 20§. ¿§20 == 20§? Sí.
3. §anterior.siguiente = actual.siguiente§ → 30 apunta a 10. El nodo 20 queda sin referencias y se libera.

**Código** (diap. 12):

~~~
def eliminar(self, dato):
    actual, anterior = self.cabeza, None
    while actual is not None:
        if actual.dato == dato:
            if anterior is None:                 # el nodo es la CABEZA
                self.cabeza = actual.siguiente
            else:                                # nodo intermedio o final
                anterior.siguiente = actual.siguiente
            return True
        anterior = actual                        # avanzar los dos punteros
        actual = actual.siguiente
    return False                                 # el dato no estaba en la lista
~~~

**Devuelve §True§** si lo eliminó y **§False§** si el dato no estaba. Elimina **la primera aparición** del dato.`,
    procedimiento: R`
**Casos a cubrir siempre:**

| Caso | Condición | Acción |
|---|---|---|
| Lista vacía | §cabeza is None§ | el §while§ no corre → §False§ |
| Eliminar la **cabeza** | §anterior is None§ al encontrarlo | §cabeza = actual.siguiente§ |
| Nodo **intermedio** | §anterior§ no es §None§ | §anterior.siguiente = actual.siguiente§ |
| Nodo **final** | §actual.siguiente is None§ | §anterior.siguiente = None§ (mismo código) |
| El dato **no está** | §actual§ llega a §None§ | §False§ |

**Boleto de salida de la clase:** dibuja el estado de una lista **antes y después** de eliminar el nodo del medio: §30 → 20 → 10§ → §30 → 10§, con el nodo 20 sin referencias entrantes.`,
    codigo: [{
      titulo: 'eliminar (diapositiva 12): cabeza, medio, final y dato ausente',
      src: LISTA + R`
lista = ListaEnlazada()
for x in [50, 40, 30, 20, 10]:
    lista.insertar_inicio(x)            # 10 -> 20 -> 30 -> 40 -> 50
print(lista.a_lista())
print(lista.eliminar(30), lista.a_lista())      # intermedio
print(lista.eliminar(10), lista.a_lista())      # la cabeza
print(lista.eliminar(50), lista.a_lista())      # el ultimo
print(lista.eliminar(99), lista.a_lista())      # no estaba
vacia = ListaEnlazada()
print(vacia.eliminar(1))                        # lista vacia
`,
      esperado: '[10, 20, 30, 40, 50]\nTrue [10, 20, 40, 50]\nTrue [20, 40, 50]\nTrue [20, 40]\nFalse [20, 40]\nFalse'
    }],
    ejemplo: R`
**Eliminar de §10 → 20 → 30 → 40 → 50§:**

| Se elimina | Caso | Referencia que cambia | Lista resultante |
|---|---|---|---|
| 30 | intermedio | §20.siguiente = 40§ | §10 → 20 → 40 → 50§ |
| 10 | **cabeza** | §cabeza = 20§ | §20 → 40 → 50§ |
| 50 | final | §40.siguiente = None§ | §20 → 40§ |
| 99 | no está | — | sin cambios, §False§ |

**Error de la clase:** eliminar un nodo **sin actualizar la referencia del anterior** deja un **puntero colgante** (el anterior sigue apuntando a un nodo «borrado»).`,
    complejidad: R`
- **Con el nodo anterior ya en mano:** **§O(1)§** (una reasignación).
- **Buscando por valor:** **§O(n)§** (recorrido hasta hallarlo).
- **Eliminar la cabeza:** §O(1)§.
- **Eliminar el final** (lista simple, sin puntero al penúltimo): §O(n)§ para llegar al penúltimo; en una lista **doble**, §O(1)§ con puntero a la cola (ver [[le-doble]]).
- **Memoria:** el nodo eliminado se libera cuando nadie lo referencia.`,
    errores: R`
- **Eliminar sin actualizar la referencia del anterior:** deja un puntero colgante.
- **Olvidar el caso de la cabeza** (§anterior is None§): intentar §anterior.siguiente§ falla.
- **Olvidar la lista vacía.**
- **Avanzar un solo puntero:** hay que avanzar **los dos** (§anterior§ y §actual§).
- **Creer que eliminar es siempre §O(1)§:** solo si ya se tiene el nodo anterior.`,
    preguntas: [
      ['Explica cómo se elimina un nodo intermedio y cómo se elimina la cabeza.', 'Intermedio: anterior.siguiente = actual.siguiente (se puentea el nodo). Cabeza (anterior es None): self.cabeza = actual.siguiente. En ambos casos el nodo eliminado queda sin referencias y se libera.'],
      ['¿Cuál es el costo de eliminar un nodo si ya se tiene el anterior y si hay que buscarlo?', 'O(1) con el nodo anterior en mano; O(n) si hay que buscarlo recorriendo la lista.'],
      ['Dibuja (o escribe) el estado de §30 → 20 → 10§ antes y después de eliminar el 20.', 'Antes: 30 → 20 → 10 → None. Después: 30 → 10 → None; el nodo 20 queda sin referencias entrantes y se libera.'],
      ['¿Por qué el recorrido para eliminar lleva dos punteros (anterior y actual)?', 'Porque una lista simple no permite retroceder: para puentear el nodo hay que conocer el que está justo antes, así que ambos punteros avanzan juntos.']
    ],
    resumen: R`
- **Eliminar = puentear:** §anterior.siguiente = actual.siguiente§; si es la **cabeza**, §cabeza = actual.siguiente§.
- Dos punteros (§anterior§, §actual§) que **avanzan juntos**; devuelve §True§/§False§.
- **§O(1)§** con el anterior; **§O(n)§** buscando por valor.
- Casos: vacía, cabeza, intermedio, final, ausente.`
  });

  B.tema({
    id: 'le-vs-arreglo', area: 'le', titulo: 'Arreglo o lista enlazada: la tabla de decisión', fuente: 'S4-C2 · diap. 9, 13, 17-18, 21', nivel: 12,
    conceptos: ['le_vs'], lab: [{ tab: 'arreglos', e: 'ops', texto: 'Ver el arreglo desplazando' }, { tab: 'listas', e: 'ini', texto: 'Ver la lista sin desplazar' }], alias: 'arreglo vs lista enlazada comparacion decision cache',
    definicion: R`
**Arreglo** y **lista enlazada** resuelven el mismo problema (guardar una secuencia) con compromisos opuestos:

- El **arreglo** gana en **acceso por índice** y en **localidad de caché**.
- La **lista enlazada** gana en **modificación estructural** (insertar/eliminar en extremos o en posiciones conocidas).

**Regla de decisión:** ¿domina el **acceso por índice**? **Arreglo.** ¿Dominan las **inserciones/eliminaciones** en extremos o posiciones conocidas? **Lista enlazada.**`,
    intuicion: R`
**Estantería con casilleros numerados** (arreglo): ir al casillero 500 es inmediato; meter uno nuevo entre el 3 y el 4 obliga a correr todos los demás. **Cadena de eslabones** (lista): meter un eslabón nuevo es solo cambiar dos enganches; llegar al eslabón 500 obliga a contar desde el primero.

Y hay un tercer factor invisible: la **localidad de caché**. El arreglo tiene sus datos **pegados**, así que la CPU trae muchos de un solo viaje; la lista los tiene **dispersos**. Por eso, **para datos numéricos** (tensores) **nunca** se usan listas enlazadas, aunque en el papel insertar sea más barato.`,
    formal: R`
**Tabla comparativa** (diap. 9):

| Operación | Arreglo | Lista enlazada |
|---|---|---|
| Acceso a §A[i]§ | §O(1)§ | §O(n)§ |
| Búsqueda por valor | §O(n)§ | §O(n)§ |
| Insertar/eliminar **al inicio** | §O(n)§ | **§O(1)§** |
| Insertar/eliminar **al final** | §O(1)§ ∗ | §O(1)§ † |
| Insertar/eliminar **en el medio (con el nodo)** | §O(n)§ | **§O(1)§** |
| Memoria por elemento | ajustada | + una referencia |
| Localidad de caché | excelente | pobre |

∗ arreglo **dinámico**, amortizado. † **si se mantiene un puntero a la cola**.

**Pregunta de análisis (diap. 13):** el historial de **deshacer** de un editor: se agrega y se quita **siempre por el mismo extremo** y **nunca** se accede al elemento i-ésimo. ¿Arreglo, lista enlazada o deque? Cualquiera de las tres da §O(1)§ en ese extremo; la mejor opción práctica es una **pila** sobre una §list§ de Python (tope en el final: contigua, buena localidad y §O(1)§ amortizado) o una **deque**.`,
    procedimiento: R`
**Para decidir:**

1. Haz la lista de **operaciones frecuentes** y su **posición** (inicio, final, medio, por índice).
2. Mira la tabla: ¿qué estructura tiene el **mejor costo para cada una**?
3. Añade los factores **no asintóticos**: memoria por elemento, **localidad de caché**, tamaño variable/impredecible.
4. **Justifica con la razón dominante**, no con una palabra.

**Pregunta de verificación (diap. 21):** «Dé un caso en el que prefiera un arreglo pese a insertar a veces al inicio». **Ejemplo:** un arreglo de 1000 datos que se **lee por índice millones de veces** y solo muy rara vez recibe una inserción al inicio: la lectura domina, y la rara inserción §O(n)§ no pesa.`,
    codigo: [{
      titulo: 'Contar movimientos: insertar al inicio en un arreglo (n desplazamientos) frente a una lista (2 referencias)',
      src: LISTA + R`
def insertar_inicio_arreglo(A, x):
    movimientos = len(A)                # hay que desplazar todos los elementos
    A.insert(0, x)
    return movimientos

def insertar_inicio_lista(lista, x):
    lista.insertar_inicio(x)
    return 2                            # dos referencias: nuevo.siguiente y cabeza

arreglo = []
lista = ListaEnlazada()
total_a = total_l = 0
for i in range(1000):
    total_a += insertar_inicio_arreglo(arreglo, i)
    total_l += insertar_inicio_lista(lista, i)
print("movimientos con arreglo:", total_a)
print("movimientos con lista  :", total_l)

# acceso por indice: arreglo O(1); lista O(i) (hay que seguir i referencias)
def elemento(lista, i):
    actual = lista.cabeza
    saltos = 0
    for _ in range(i):
        actual = actual.siguiente
        saltos += 1
    return actual.dato, saltos

print(arreglo[500], elemento(lista, 500))
`,
      esperado: 'movimientos con arreglo: 499500\nmovimientos con lista  : 2000\n499 (499, 500)'
    }],
    ejemplo: R`
**¿Qué estructura para cada módulo?**

| Situación | Estructura | Razón dominante |
|---|---|---|
| Cola de tareas con altas y bajas por los extremos | **deque / lista doble** | insertar y quitar en los extremos en O(1) |
| Tensor de datos que se lee siempre por índice | **arreglo (ndarray)** | acceso O(1) + localidad de caché |
| Historial de deshacer | **pila** (list con tope al final) | un solo extremo, O(1) |
| Lista que crece sin tope conocido y se inserta en el medio con el nodo en mano | **lista enlazada** | modificación estructural barata |

**Regla de las señales:** el **acceso por índice** (§A[i]§ muchas veces) → arreglo; las **inserciones y eliminaciones frecuentes en extremos o posiciones conocidas** → lista enlazada o deque.`,
    complejidad: R`
- **Arreglo:** acceso §O(1)§; inserción/eliminación al inicio o medio §O(n)§; al final §O(1)§ amortizado.
- **Lista enlazada:** acceso §O(n)§; inserción/eliminación al inicio §O(1)§; en el medio con el nodo §O(1)§; al final §O(1)§ con puntero a la cola.
- **Insertar §n§ elementos al inicio:** arreglo §O(n²)§ (suma de §0 + 1 + … + n − 1§); lista §O(n)§.
- **Recorrer completo:** ambos §O(n)§, pero el arreglo suele ser **mucho más rápido en la práctica** por la caché.`,
    errores: R`
- **Elegir lista enlazada «porque insertar es O(1)»** sin ver que lo que domina es el acceso por índice.
- **Ignorar la localidad de caché:** una lista de §10⁶§ números puede ser ≈ 10× más lenta que un arreglo con las mismas operaciones.
- **Creer que insertar en el medio de una lista es siempre §O(1)§:** hay que **encontrar** el nodo (§O(n)§).
- **Olvidar la referencia extra por nodo** al estimar la memoria.
- **Usar una lista enlazada para tensores/datos numéricos.**`,
    preguntas: [
      ['Compara arreglo y lista enlazada en acceso, inserción al inicio, inserción en el medio (con el nodo), memoria y caché.', 'Acceso: O(1) vs O(n). Insertar al inicio: O(n) vs O(1). En el medio con el nodo: O(n) vs O(1). Memoria: ajustada vs una referencia extra por nodo. Caché: excelente vs pobre.'],
      ['Debes implementar el historial de deshacer de un editor (siempre por el mismo extremo, nunca el i-ésimo). ¿Qué estructura y por qué?', 'Una pila (por ejemplo una list con el tope al final) o una deque: todas las operaciones son O(1) en un solo extremo y no hace falta acceso por índice.'],
      ['Da un caso en el que prefieras un arreglo pese a insertar a veces al inicio.', 'Un arreglo que se lee por índice millones de veces y rara vez recibe una inserción al inicio: la lectura domina, y la localidad de caché también favorece al arreglo.'],
      ['¿Por qué los tensores de IA no son listas enlazadas?', 'Porque el cómputo por lotes recorre la memoria de forma predecible; los bloques contiguos aprovechan la caché y la vectorización, mientras que una lista enlazada salta por direcciones dispersas.']
    ],
    resumen: R`
- **Arreglo:** acceso §O(1)§, excelente caché; insertar/eliminar §O(n)§.
- **Lista enlazada:** insertar/eliminar §O(1)§ en extremos o con el nodo; acceso §O(n)§; +1 referencia por nodo; caché pobre.
- Regla: **¿acceso por índice? arreglo; ¿inserciones/eliminaciones en extremos o posiciones conocidas? lista.**
- Las listas brillan en el **control**, no en datos numéricos.`
  });

  B.tema({
    id: 'le-doble', area: 'le', titulo: 'Lista doblemente enlazada y su relación con collections.deque', fuente: 'S4-C2 · diap. 14, 22', nivel: 12, comp: true,
    conceptos: ['le_doble'], lab: [{ tab: 'listas', e: 'ini', texto: 'Ver la lista doble (elige «Lista doble»)' }], alias: 'lista doble anterior siguiente cola deque bidireccional',
    definicion: R`
En una **lista doblemente enlazada** cada nodo guarda referencias al **siguiente** y al **anterior** (más un puntero a la **cabeza** y otro a la **cola**). Permite **recorrer en ambos sentidos** y **eliminar un nodo en §O(1)§ sin conocer su predecesor**.

El costo: **dos referencias por nodo** en lugar de una, y más cuidado al enlazar (hay que actualizar los dos sentidos).

Es la **base de §collections.deque§**: por eso la deque ofrece §O(1)§ en **ambos extremos** (internamente enlaza bloques en las dos direcciones).`,
    intuicion: R`
En la lista simple solo puedes ir «hacia adelante»; si estás parado en un nodo, **no sabes quién está detrás**, y para eliminarlo necesitas haber recordado al anterior. En la **doble**, cada nodo **conoce a su vecino de atrás**: puedes eliminarte a ti mismo diciendo a tu anterior «mi siguiente ahora es el tuyo» y a tu siguiente «mi anterior ahora es el tuyo».

Con un puntero a la **cola** se puede **insertar y quitar por ambos extremos** en §O(1)§: exactamente lo que hace una deque.`,
    formal: R`
**Nodo doble:** §dato§, §siguiente§, §anterior§. **Lista doble:** §cabeza§, §cola§ (y, opcionalmente, §tam§).

**Eliminar un nodo §n§ conocido** (sin recorrer):

~~~
si n.anterior no es None:  n.anterior.siguiente = n.siguiente
sino:                      cabeza = n.siguiente            # era la cabeza
si n.siguiente no es None: n.siguiente.anterior = n.anterior
sino:                      cola = n.anterior               # era la cola
~~~

**Insertar al final** (con cola): §nuevo.anterior = cola§; §cola.siguiente = nuevo§; §cola = nuevo§.
**Insertar al inicio:** §nuevo.siguiente = cabeza§; §cabeza.anterior = nuevo§; §cabeza = nuevo§.

| Operación | Lista simple | Lista doble |
|---|---|---|
| Insertar/eliminar al inicio | §O(1)§ | §O(1)§ |
| Insertar al final | §O(n)§ (sin cola) | **§O(1)§** (con cola) |
| Eliminar un nodo conocido | §O(n)§ (buscar el anterior) | **§O(1)§** |
| Recorrer hacia atrás | no | **sí**, §O(n)§ |
| Memoria por nodo | 1 referencia | **2 referencias** |`,
    procedimiento: R`
**Para implementar y probar una lista doble:**

1. **Cada inserción/eliminación** actualiza **dos sentidos** (§siguiente§ y §anterior§) en cada vecino afectado.
2. Cuida los **extremos**: cabeza (§anterior = None§) y cola (§siguiente = None§).
3. **Prueba** recorriendo **hacia adelante** y **hacia atrás**: ambos recorridos deben dar la misma secuencia (una invertida de la otra). Si no, hay un enlace sin actualizar.
4. Con una deque de Python, no se escribe esto a mano: §append§, §appendleft§, §pop§, §popleft§ son §O(1)§.

**Compruébalo en el laboratorio:** elige «Lista doble» y mira cómo, al insertar o eliminar, se actualizan **las dos flechas** de los vecinos.`,
    codigo: [{
      titulo: 'Lista doblemente enlazada con cabeza y cola: insertar por ambos extremos y eliminar un nodo en O(1)',
      src: R`
class NodoD:
    def __init__(self, dato):
        self.dato = dato
        self.siguiente = None
        self.anterior = None

class ListaDoble:
    def __init__(self):
        self.cabeza = None
        self.cola = None

    def insertar_inicio(self, dato):
        nuevo = NodoD(dato)
        nuevo.siguiente = self.cabeza
        if self.cabeza is not None:
            self.cabeza.anterior = nuevo
        else:
            self.cola = nuevo
        self.cabeza = nuevo

    def insertar_final(self, dato):     # O(1) gracias a la cola
        nuevo = NodoD(dato)
        nuevo.anterior = self.cola
        if self.cola is not None:
            self.cola.siguiente = nuevo
        else:
            self.cabeza = nuevo
        self.cola = nuevo

    def eliminar_nodo(self, n):         # O(1): no hace falta buscar al anterior
        if n.anterior is not None:
            n.anterior.siguiente = n.siguiente
        else:
            self.cabeza = n.siguiente
        if n.siguiente is not None:
            n.siguiente.anterior = n.anterior
        else:
            self.cola = n.anterior

    def adelante(self):
        r, a = [], self.cabeza
        while a is not None:
            r.append(a.dato)
            a = a.siguiente
        return r

    def atras(self):
        r, a = [], self.cola
        while a is not None:
            r.append(a.dato)
            a = a.anterior
        return r

L = ListaDoble()
for x in [2, 3, 4]:
    L.insertar_final(x)
L.insertar_inicio(1)
print(L.adelante(), L.atras())
nodo3 = L.cabeza.siguiente.siguiente    # el nodo 3, ya en mano
L.eliminar_nodo(nodo3)
print(L.adelante(), L.atras())
L.eliminar_nodo(L.cabeza)
L.eliminar_nodo(L.cola)
print(L.adelante(), L.atras())
`,
      esperado: '[1, 2, 3, 4] [4, 3, 2, 1]\n[1, 2, 4] [4, 2, 1]\n[2] [2]'
    }],
    ejemplo: R`
**Eliminar el nodo 20 de §10 ⇄ 20 ⇄ 30§** teniéndolo ya en mano (sin recorrer):

1. §20.anterior§ (el 10) → §10.siguiente = 30§.
2. §20.siguiente§ (el 30) → §30.anterior = 10§.
3. Resultado: §10 ⇄ 30§, con el nodo 20 sin referencias entrantes.

En una lista **simple** habría que **recorrer desde la cabeza** hasta encontrar el nodo anterior (§O(n)§). **La deque de Python** usa esta idea (bloques enlazados en ambos sentidos): por eso §popleft()§ y §pop()§ son §O(1)§.`,
    complejidad: R`
- **Insertar/eliminar en ambos extremos:** **§O(1)§** (con cabeza y cola).
- **Eliminar un nodo conocido:** **§O(1)§** (frente a §O(n)§ en la simple, que debe buscar al anterior).
- **Buscar por valor / acceso por índice:** §O(n)§ (se puede empezar por el extremo más cercano, pero sigue siendo lineal).
- **Memoria:** dos referencias por nodo (≈ el doble de enlaces que la simple).`,
    errores: R`
- **Actualizar solo un sentido** (§siguiente§ pero no §anterior§): el recorrido hacia atrás queda roto.
- **Olvidar actualizar §cola§ o §cabeza§** al insertar/eliminar en un extremo.
- **No contemplar la lista vacía** al insertar (cabeza y cola deben apuntar al mismo primer nodo).
- **Creer que la lista doble acelera el acceso por índice:** sigue siendo §O(n)§.
- **Olvidar el costo extra de memoria** (dos referencias por nodo).`,
    preguntas: [
      ['¿Qué guarda cada nodo de una lista doble y qué ventaja da frente a la simple?', 'El dato y referencias al siguiente y al anterior. Permite recorrer en ambos sentidos y eliminar un nodo en O(1) sin conocer su predecesor.'],
      ['¿Qué relación tiene la lista doble con §collections.deque§?', 'La deque se basa en enlazar bloques en ambos sentidos, lo que da O(1) en ambos extremos; el costo es dos referencias por nodo en vez de una.'],
      ['Al eliminar un nodo intermedio de una lista doble, ¿qué dos referencias se actualizan?', 'anterior.siguiente = nodo.siguiente y siguiente.anterior = nodo.anterior (y cabeza/cola si el nodo era un extremo).'],
      ['¿Cuánto cuesta eliminar un nodo conocido en una lista simple y en una doble?', 'En la simple, O(n) (hay que recorrer para encontrar el anterior); en la doble, O(1).']
    ],
    resumen: R`
- **Lista doble:** cada nodo con §siguiente§ y §anterior§; **cabeza** y **cola**.
- **Eliminar un nodo conocido §O(1)§**; insertar/eliminar en **ambos extremos §O(1)§**; acceso por índice §O(n)§.
- Costo: **2 referencias por nodo**; hay que actualizar **ambos sentidos**.
- Es la base de §collections.deque§.`
  });

  B.tema({
    id: 'le-floyd', area: 'le', titulo: 'Detectar ciclos: el algoritmo de la liebre y la tortuga (Floyd)', fuente: 'S4-C2 · diap. 15-17, 19-20', nivel: 12,
    conceptos: ['le_floyd'], lab: [{ tab: 'listas', e: 'floyd', texto: 'Ver Floyd paso a paso' }], alias: 'floyd ciclo liebre tortuga tiene_ciclo cycle detection',
    definicion: R`
**El problema:** ¿la lista tiene un **ciclo** (un nodo apunta a uno anterior) o termina en §None§? Detectarlo importa: un **recorrido ingenuo** (§while actual is not None§) sobre una lista cíclica **nunca termina**.

**Algoritmo de Floyd** (**§O(n)§ tiempo, §O(1)§ espacio**): dos punteros, la **tortuga** avanza **1** paso y la **liebre** avanza **2**. Si hay ciclo, **la liebre alcanza a la tortuga** (se encuentran dentro del ciclo). Si la liebre llega a §None§, **no hay ciclo**.`,
    intuicion: R`
Dos corredores en una **pista**: si la pista es una **recta** que termina, el más rápido llega al final y se acabó. Si la pista es **circular** (tiene un tramo cerrado), el más rápido **da vueltas** y acaba **alcanzando por detrás** al más lento: dentro del ciclo la distancia entre ellos cambia en **1 paso por vuelta** (la liebre gana un paso por iteración), así que tarde o temprano vale 0.

**Por qué usa solo dos punteros:** no necesita recordar los nodos visitados; la velocidad distinta hace el trabajo. La alternativa con un **conjunto de nodos visitados** (si un nodo se repite, hay ciclo) usa **§O(n)§ de memoria**.`,
    formal: R`
**Implementación** (diap. 16):

~~~
def tiene_ciclo(cabeza):
    tortuga = liebre = cabeza
    while liebre is not None and liebre.siguiente is not None:
        tortuga = tortuga.siguiente              # 1 paso
        liebre = liebre.siguiente.siguiente      # 2 pasos
        if tortuga is liebre:                    # se encontraron: hay ciclo
            return True
    return False                                 # la liebre llegó a None: sin ciclo
~~~

**Por qué funciona:** si hay ciclo, tras entrar ambos al ciclo (longitud §c§), cada iteración la liebre se acerca **1 nodo** a la tortuga (se mueve 2, ella 1); la brecha módulo §c§ decrece en 1 por iteración y llega a **0**. **Cota:** a lo sumo §O(n)§ iteraciones.

**Comparación con el conjunto de visitados** (pregunta de análisis, diap. 17):

| | **Floyd** | **Conjunto de visitados** |
|---|---|---|
| Tiempo | §O(n)§ | §O(n)§ |
| Espacio | **§O(1)§** | §O(n)§ |
| Cuándo preferirla | memoria escasa, listas enormes | más fácil de entender y de depurar; listas pequeñas |

**Un §while§ ingenuo** sobre una lista con ciclo da **bucle infinito**.`,
    procedimiento: R`
**A mano** con la lista §1 → 2 → 3 → 4 → 5§ y el último apuntando al 2 (ciclo):

| paso | tortuga | liebre |
|---|---|---|
| inicio | 1 | 1 |
| 1 | 2 | 3 |
| 2 | 3 | 5 |
| 3 | 4 | 3 |
| 4 | 5 | 5 → **se encuentran** |

**Actividad de la clase (12 min):** (1) escribe §tiene_ciclo§ con Floyd y pruébalo con una lista **sin ciclo** y una **con ciclo**; (2) escribe la versión con **conjunto de visitados**; (3) compara espacio y tiempo; (4) di qué pasaría con un **§while§ ingenuo** en la lista cíclica (**no termina**).

**Para explicar con tus palabras** por qué la liebre alcanza a la tortuga: dentro del ciclo la liebre la persigue ganando **un paso por turno**; no puede «saltársela» porque la brecha baja de a uno.`,
    codigo: [{
      titulo: 'Floyd (diapositiva 16), versión con conjunto de visitados y el while ingenuo con tope de seguridad',
      src: R`
class Nodo:
    def __init__(self, dato):
        self.dato = dato
        self.siguiente = None

def construir(valores, ciclo_a=None):
    nodos = [Nodo(v) for v in valores]
    for i in range(len(nodos) - 1):
        nodos[i].siguiente = nodos[i + 1]
    if ciclo_a is not None:
        nodos[-1].siguiente = nodos[ciclo_a]    # el ultimo apunta a un nodo anterior
    return nodos[0] if nodos else None

def tiene_ciclo(cabeza):
    tortuga = liebre = cabeza
    while liebre is not None and liebre.siguiente is not None:
        tortuga = tortuga.siguiente             # 1 paso
        liebre = liebre.siguiente.siguiente     # 2 pasos
        if tortuga is liebre:                   # se encontraron: hay ciclo
            return True
    return False                                # la liebre llego a None: sin ciclo

def tiene_ciclo_conjunto(cabeza):               # O(n) de memoria
    vistos = set()
    actual = cabeza
    while actual is not None:
        if id(actual) in vistos:
            return True
        vistos.add(id(actual))
        actual = actual.siguiente
    return False

sin = construir([1, 2, 3, 4, 5])
con = construir([1, 2, 3, 4, 5], ciclo_a=1)
print(tiene_ciclo(sin), tiene_ciclo(con))
print(tiene_ciclo_conjunto(sin), tiene_ciclo_conjunto(con))
print(tiene_ciclo(None), tiene_ciclo(construir([7])), tiene_ciclo(construir([7], ciclo_a=0)))

def recorrido_ingenuo(cabeza, tope):
    pasos = 0
    actual = cabeza
    while actual is not None and pasos < tope:  # sin el tope, no terminaria
        pasos += 1
        actual = actual.siguiente
    return pasos

print(recorrido_ingenuo(sin, 1000), recorrido_ingenuo(con, 1000))
`,
      esperado: 'False True\nFalse True\nFalse False True\n5 1000'
    }],
    ejemplo: R`
**Sin ciclo** (§1 → 2 → 3 → None§): tras la primera vuelta la tortuga está en el 2 y la liebre en el 3 (el último nodo); como §liebre.siguiente§ es §None§, ya no puede dar dos pasos y el §while§ termina: **no se encontraron** → §False§.

**Con ciclo** (§1 → 2 → 3 → 4 → 5§ con el 5 apuntando al 2): se encuentran en el nodo **5** (según la tabla del procedimiento) → §True§.

**Notas de uso real:** una lista que «quedó enredada» con un ciclo por un error de código (por ejemplo, un enlace mal asignado al insertar) hace que los recorridos nunca terminen; Floyd la detecta sin gastar memoria extra. El mismo algoritmo sirve para detectar ciclos en **secuencias iteradas** (una función aplicada una y otra vez) y para **hallar el inicio del ciclo**.`,
    complejidad: R`
- **Floyd:** **§O(n)§** tiempo (a lo sumo del orden de §n§ iteraciones), **§O(1)§** espacio (dos punteros).
- **Conjunto de visitados:** §O(n)§ tiempo y **§O(n)§** espacio.
- **Recorrido ingenuo** sobre una lista con ciclo: **no termina**.
- La tortuga recorre a lo sumo §n§ nodos antes de que la liebre la alcance (si hay ciclo).`,
    errores: R`
- **Recorrer una lista con ciclo con un §while§ ingenuo:** bucle infinito.
- **Avanzar la liebre sin comprobar §liebre.siguiente§:** §AttributeError§ por §None.siguiente§ (hay que comprobar §liebre is not None and liebre.siguiente is not None§).
- **Comparar valores en vez de nodos:** hay que usar §is§ (identidad): dos nodos distintos pueden tener el mismo dato.
- **Creer que el conjunto de visitados es mejor siempre:** gasta §O(n)§ de memoria.
- **Olvidar la lista vacía o de un solo nodo.**`,
    preguntas: [
      ['Explica con tus palabras por qué la liebre alcanza a la tortuga si hay ciclo.', 'Dentro del ciclo la liebre avanza dos nodos por vuelta y la tortuga uno, así que la distancia entre ambas disminuye en uno en cada iteración; no puede saltarse a la tortuga y acaba encontrándola.'],
      ['¿Qué complejidad de espacio tiene la versión con conjunto de visitados frente a la de Floyd? ¿Cuándo preferirías cada una?', 'Conjunto: O(n) de memoria; Floyd: O(1). Floyd cuando la memoria es escasa o la lista es enorme; el conjunto cuando se prioriza la simplicidad y la lista es pequeña.'],
      ['¿Qué pasaría si recorrieras una lista cíclica con un §while actual is not None§ ingenuo?', 'Un bucle infinito: actual nunca llega a None porque los nodos del ciclo se apuntan entre sí.'],
      ['¿Qué condición debe cumplir el §while§ de Floyd para no fallar al final de la lista?', 'liebre is not None and liebre.siguiente is not None, para poder avanzar dos pasos sin acceder a un atributo de None.']
    ],
    resumen: R`
- **Floyd:** **tortuga** (1 paso) y **liebre** (2 pasos); si se encuentran (§is§) ⇒ **ciclo**; si la liebre llega a §None§ ⇒ **sin ciclo**.
- **§O(n)§** tiempo, **§O(1)§** espacio (el conjunto de visitados usa §O(n)§).
- El §while§ ingenuo sobre un ciclo **no termina**.
- Comprobar §liebre is not None and liebre.siguiente is not None§.`
  });
})(typeof window !== 'undefined' ? window : globalThis);
