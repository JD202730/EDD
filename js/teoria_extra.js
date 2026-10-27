/* teoria_extra.js — Biblioteca: fórmulas, tablas comparativas, repaso y autoevaluación de las áreas nuevas
   (TAD y memoria, arreglos, pilas y colas, listas enlazadas, heaps y condicionales). Se carga después de teoria_repaso.js. */
(function (global) {
  'use strict';
  const B = global.ET.Biblioteca, R = String.raw;
  const F = (id, area, nombre, formula, variables, cuando, ejemplo, condiciones, tema, alias) => B.formula({ id, area, nombre, formula, variables, cuando, ejemplo, condiciones, tema, alias });
  const T = (id, titulo, md, nota, fuente, temas) => B.tabla({ id, titulo, md: md.trim(), nota, fuente, temas });

  /* ===================================================== FÓRMULAS ===================================================== */
  /* ---------------- TAD y memoria ---------------- */
  F('td-direccion', 'td', 'Dirección de un elemento en memoria contigua', 'dir(v[i]) = base + i × tam',
    ['§base§: dirección del primer elemento (índice 0)', '§i§: índice del elemento (desde 0)', '§tam§: bytes que ocupa cada elemento'],
    'Calcular dónde está un elemento de un arreglo y justificar que el acceso por índice es §O(1)§.',
    '§base = 2000§, §tam = 4§, §i = 3§: §dir = 2000 + 3 × 4 = 2012§.',
    ['Solo vale en memoria **contigua** y con elementos del **mismo tamaño**.', 'Una multiplicación y una suma: costo constante, sin importar §i§.', 'En una estructura enlazada no hay fórmula: para llegar al elemento §i§ se siguen §i§ referencias (§O(n)§).'], 'td-memoria', 'arreglo contiguo base indice acceso directo');
  F('td-memoria-lista', 'td', 'Memoria de una list frente a un ndarray', 'list de n enteros ≈ n × (8 + 28) bytes        ndarray ≈ n × 8 bytes',
    ['§n§: cantidad de enteros', '8 bytes: la referencia de cada posición de la §list§', '28 bytes: cada objeto entero de Python (aproximado)'],
    'Estimar cuánto más ocupa una §list§ de enteros que un arreglo de NumPy.',
    '§n = 10⁶§: §list§ ≈ 8 MB de referencias + 28 MB de objetos ≈ **36 MB**; §ndarray§ ≈ **8 MB**: factor ≈ 4,5.',
    ['Son cifras **aproximadas** de CPython en 64 bits.', 'El §ndarray§ guarda los valores en crudo y contiguos: además aprovecha mejor la caché.', 'Por eso los tensores de NumPy, PyTorch y TensorFlow son un solo bloque contiguo.'], 'td-cache', 'ndarray numpy 36 MB 8 MB');

  /* ---------------- Arreglos y técnicas ---------------- */
  F('ay-prefijos', 'ay', 'Suma de prefijos y consulta de rango', 'P[0] = A[0];  P[i] = P[i−1] + A[i]      ⇒      q(i, j) = P[j] − P[i−1]   (con P[−1] = 0)',
    ['§A§: arreglo fijo de §n§ elementos', '§P§: arreglo de prefijos (se construye una vez, §O(n)§)', '§q(i, j)§: suma de §A[i]§ a §A[j]§ (ambos incluidos)'],
    'Responder muchas consultas de suma de rango sobre un arreglo que no cambia.',
    '§A = [5, 4, 9, 0, 1, 3]§ ⇒ §P = [5, 9, 18, 18, 19, 22]§; §q(2, 4) = P[4] − P[1] = 19 − 9 = 10§ (= 9 + 0 + 1).',
    ['Caso §i = 0§: §q(0, j) = P[j]§ (no existe §P[−1]§).', 'Preproceso §O(n)§ y memoria §O(n)§; cada consulta §O(1)§.', 'Con §Q§ consultas: §Q·n§ sin prefijos frente a §n + Q§ con prefijos.'], 'ay-prefijos', 'suma acumulada rango');
  F('ay-kadane', 'ay', 'Kadane: máximo subarreglo contiguo', 's_actual = max(A[i], s_actual + A[i]);   s_max = max(s_max, s_actual)',
    ['§s_actual§: mejor suma de un subarreglo que **termina** en §i§', '§s_max§: mejor suma vista hasta §i§'],
    'Hallar la mayor suma de un subarreglo contiguo no vacío en una sola pasada.',
    '§[−2, 1, −3, 4, −1, 2, 1, −5, 4]§ ⇒ **6** (subarreglo §[4, −1, 2, 1]§). §[−5, −2, −8, −1]§ ⇒ **−1**.',
    ['Inicializa §s_actual = s_max = A[0]§, **no 0**: con todos negativos la respuesta es el mayor de ellos.', '«¿Extiendo o empiezo de nuevo?»: si lo acumulado es negativo, lastra.', 'Tiempo §O(n)§ y memoria §O(1)§ (frente a §O(n²)§ del ingenuo).'], 'ay-kadane', 'maximo subarreglo');
  F('ay-dos-punteros', 'ay', 'Dos punteros y ventana deslizante', 'dos punteros: A[l] + A[r] < S ⇒ l += 1;  > S ⇒ r −= 1      ventana: mejor = máx(mejor, r − l + 1)',
    ['§l§, §r§: extremos (o límites de la ventana)', '§S§: suma objetivo (par que suma §S§ en un arreglo **ordenado**)'],
    'Pasar de §O(n²)§ a §O(n)§ al buscar un par que cumpla una condición, o el mejor subsegmento con una restricción.',
    '§par_que_suma([1, 3, 4, 6, 8, 11, 15], 14)§ ⇒ §(1, 5)§ (3 + 11). §subcadena_sin_repetir("cutebear")§ ⇒ 5.',
    ['Dos punteros exige el arreglo **ordenado** (ordenar cuesta §O(n log n)§ y aun así gana a §O(n²)§).', 'Ventana: aunque haya un §while§ dentro del §for§, cada elemento entra y sale una vez: ≤ §2n§ operaciones, **§O(n)§ amortizado**.'], 'ay-punteros', 'two pointers sliding window');
  F('ay-merge-intervalos', 'ay', 'Merge intervals', 'ordenar por el extremo izquierdo;  si a ≤ ultimo_b:  ultimo_b = max(ultimo_b, b)  si no: agregar [a, b]',
    ['§(a, b)§: intervalo actual', '§ultimo_b§: extremo derecho del último intervalo agregado'],
    'Fusionar intervalos que se solapan.',
    '§[(1, 3), (2, 6), (8, 10), (15, 18)]§ ⇒ §[(1, 6), (8, 10), (15, 18)]§.',
    ['El costo lo domina el ordenamiento: **§O(n log n)§** (el recorrido es §O(n)§).', 'Extiende con §max(ultimo_b, b)§: un intervalo puede quedar **contenido** en el anterior.', 'Tocarse en un extremo (§a == ultimo_b§) cuenta como solape según la condición §a <= ultimo_b§.'], 'ay-intervalos', 'fusionar intervalos');

  /* ---------------- Pilas y colas ---------------- */
  F('pc-circular', 'pc', 'Cola circular: índices con módulo', 'final = (frente + tam) % C;   frente = (frente + 1) % C;   llena ⇔ tam == C;   vacía ⇔ tam == 0',
    ['§C§: capacidad del arreglo', '§frente§: índice del primero', '§tam§: cantidad de elementos guardados'],
    'Encolar y desencolar sin desplazar elementos en un arreglo de tamaño fijo.',
    '§C = 5§, §frente = 3§, §tam = 4§: se encola en §(3 + 4) % 5 = 2§ (da la vuelta). Desencolar deja §frente = (3 + 1) % 5 = 4§.',
    ['Se lleva **§tam§** porque con solo §frente§ y §final§ no se distingue una cola llena de una vacía.', 'Ambas operaciones son §O(1)§; los huecos se reutilizan.', 'Si está llena: §OverflowError§, esperar o descartar el más viejo.'], 'pc-circular', 'anillo buffer modulo');
  F('pc-monotona', 'pc', 'Pila monótona: días hasta un día más caluroso', 'al llegar el día i, mientras T[tope] < T[i]:  k = pop();  D[k] = i − k      operaciones ≤ 2n',
    ['§T§: temperaturas', '§D[k]§: días de espera del día §k§ (0 si no hay día más caluroso)', 'la pila guarda **índices**'],
    'Resolver «próximo elemento mayor» en una pasada.',
    '§T = [6, 8, 5, 4, 3, 7, 9, 6]§ ⇒ §D = [1, 5, 3, 2, 1, 1, 0, 0]§; en la pila quedan los índices 6 y 7.',
    ['Cada índice se apila una vez y se desapila a lo sumo una vez: **§O(n)§ amortizado** aunque haya un §while§ dentro del §for§.', 'Guarda **índices**, no valores: el resultado depende de las posiciones.', 'Los que quedan en la pila nunca hallaron un día más caluroso (§D = 0§).'], 'pc-monotona', 'next greater element');
  F('pc-pop0', 'pc', 'Costo de list.pop(0) frente a deque.popleft()', 'desplazamientos de n desencolados con list.pop(0) ≈ n(n−1)/2 = O(n²)        con deque.popleft(): n = O(n)',
    ['§n§: cantidad de elementos que se desencolan', 'cada §pop(0)§ desplaza todos los restantes una casilla'],
    'Justificar por qué una §list§ es mala cola y estimar el ahorro de la §deque§.',
    '§n = 10⁶§: ≈ 5 × 10¹¹ desplazamientos con §list§; 10⁶ con §deque§.',
    ['Encolar con §append§ es §O(1)§ en ambas; el problema es **desencolar**.', 'Una deque no es un arreglo contiguo: es una lista de **bloques** doblemente enlazada (por eso §d[i]§ es §O(n)§).'], 'pc-cola', 'popleft list deque');

  /* ---------------- Listas enlazadas ---------------- */
  F('le-insertar-en', 'le', 'Insertar en la posición pos', 'avanzar pos − 1 veces (O(n));  luego:  nuevo.siguiente = actual.siguiente;  actual.siguiente = nuevo  (O(1))',
    ['§pos§: posición donde queda el dato (0 = al inicio)', '§actual§: nodo en la posición §pos − 1§', '§nuevo§: nodo creado con el dato'],
    'Enlazar un nodo en medio de una lista sin perder el resto.',
    '§30 → 20 → 10§, §insertar_en(99, 2)§: §actual§ = 20; §99.siguiente = 10§; §20.siguiente = 99§ ⇒ §30 → 20 → 99 → 10§.',
    ['El **orden importa**: si se hace §actual.siguiente = nuevo§ primero, se pierde el resto de la lista.', 'Buscar el nodo cuesta §O(n)§; enlazar, §O(1)§. Al inicio todo es §O(1)§.', 'Comprueba la lista vacía y la posición fuera de rango (§actual is None§).'], 'le-insertar', 'insertar medio enlazar');
  F('le-floyd', 'le', 'Floyd: la liebre y la tortuga', 'tortuga avanza 1, liebre avanza 2;   hay ciclo ⇔ tortuga is liebre en algún momento   (tiempo O(n), memoria O(1))',
    ['§tortuga§: puntero que da 1 paso por vuelta', '§liebre§: puntero que da 2 pasos por vuelta', 'el §while§ requiere §liebre§ y §liebre.siguiente§ distintos de §None§'],
    'Detectar un ciclo en una lista enlazada con memoria constante.',
    '§1 → 2 → 3 → 4 → 5§ con §5§ apuntando al §3§: se encuentran en el nodo **4** tras 3 vueltas. Sin ciclo la liebre llega a §None§.',
    ['Un recorrido ingenuo §while actual is not None§ no termina si hay ciclo.', 'Alternativa: un §set§ de nodos visitados (§O(n)§ de memoria).', 'Comprueba §liebre.siguiente§ antes de avanzar dos pasos.'], 'le-floyd', 'ciclo tortuga liebre');

  /* ---------------- Heaps ---------------- */
  F('hp-indices', 'hp', 'Aritmética de índices del heap', 'padre(i) = (i − 1) // 2;   izq(i) = 2i + 1;   der(i) = 2i + 2;   último con hijos = n // 2 − 1;   hojas = n − n // 2',
    ['§i§: índice del nodo (desde 0)', '§n§: cantidad de elementos', 'el hijo §j§ existe solo si §j < n§'],
    'Moverse por el árbol completo guardado en un arreglo sin punteros.',
    '§[20, 15, 18, 7, 10, 12, 9, 3]§ (§n = 8§): hijos del 15 (§i = 1§) en 3 y 4 ⇒ 7 y 10; padre del 3 (§i = 7§) = §(7 − 1) // 2 = 3§ ⇒ 7; último con hijos = 3; hojas = 4.',
    ['Algunos libros numeran desde 1: §izq = 2i§, §der = 2i + 1§, §padre = i // 2§ (misma idea desplazada).', 'Índice impar ⇒ hijo izquierdo; par ⇒ derecho.', 'Un nodo es **hoja** si §2i + 1 ≥ n§.'], 'hp-arreglo', 'padre hijo izquierdo derecho indice');
  F('hp-altura', 'hp', 'Altura y costo de insertar y extraer', 'altura de un heap de n nodos = ⌊log₂ n⌋        insertar y extraer: a lo sumo ⌊log₂ n⌋ intercambios = O(log n)',
    ['§n§: cantidad de elementos', 'cada intercambio sube o baja **un nivel**'],
    'Justificar la complejidad de insertar (bubble up) y extraer (bubble down).',
    '§n = 1000§: altura 9; §n = 10⁶§: altura 19. Insertar sube como máximo 19 niveles.',
    ['Se cuenta en **intercambios** o niveles; la altura se mide en aristas.', 'Ver el mínimo (o máximo) es §O(1)§; buscar un valor cualquiera, §O(n)§.'], 'hp-insertar', 'log n altura heap');
  F('hp-heapify', 'hp', 'Construir un heap: heapify frente a n inserciones', 'heapify: bajar i = n // 2 − 1, …, 0   ⇒   O(n)        n inserciones: O(n log n)',
    ['§n // 2 − 1§: último nodo que tiene hijos', 'cada nodo se **baja** hasta su lugar'],
    'Convertir una lista cualquiera en un heap con el menor costo.',
    '§[3, 1, 6, 5, 2, 4]§ ⇒ max-heap §[6, 5, 4, 1, 2, 3]§ (se baja i = 2 sin cambios, i = 1 por el 5, i = 0 por el 6 y luego el 4).',
    ['Es lineal porque casi todos los nodos están cerca de las hojas y bajan muy poco: la suma de las alturas es §O(n)§.', 'En Python: §heapq.heapify(lista)§.', 'Hacer n inserciones es el error de rendimiento que señala la clase.'], 'hp-construir', 'build heap');
  F('hp-topk', 'hp', 'Top-k con un heap de tamaño k', 'costo = O(n log k)   memoria = O(k)        (ordenar todo: O(n log n))',
    ['§n§: elementos del flujo', '§k§: cuántos se conservan', 'para los **k menores** se usa un **max-heap** (la raíz es el peor de los elegidos)'],
    'Obtener los k mayores o menores sin ordenar todo.',
    '§n = 10⁶§, §k = 10§: ≈ §3,3·n§ comparaciones frente a ≈ §20·n§ de ordenar: unas 6 veces menos.',
    ['k menores ⇒ **max-heap**; k mayores ⇒ **min-heap** (la raíz es lo primero que se descarta).', '§heapq.nsmallest§ y §nlargest§ usan esta idea.', 'Error típico: usar un heap de tamaño §n§.'], 'hp-topk', 'k mayores k menores nlargest');

  /* ---------------- Condicionales ---------------- */
  F('cd-precedencia', 'cd', 'Precedencia de los operadores booleanos', 'paréntesis  >  comparaciones (==, !=, <, <=, >, >=)  >  not  >  and  >  or',
    ['§p§, §q§: expresiones booleanas', '§not§ invierte; §and§ exige todas; §or§ basta una'],
    'Evaluar una expresión booleana sin ambigüedad.',
    '§not (4 > 2 or 1 == 1) and 5 != 3§ ⇒ §not (True or True) and True§ ⇒ §False and True§ ⇒ **False**. §True or False and False§ ⇒ **True** (el §and§ va primero).',
    ['Ante la duda, **usa paréntesis**.', 'En Python se permite encadenar: §3 < edad < 25§ equivale a §3 < edad and edad < 25§.', '§=§ asigna y §==§ compara.'], 'cd-booleanas', 'and or not orden precedencia');
  F('cd-bisiesto', 'cd', 'Año bisiesto (anidado y aplanado)', 'bisiesto(a) = (a % 4 == 0 and a % 100 != 0) or a % 400 == 0',
    ['§a§: año', 'múltiplo de 4 **excepto** los múltiplos de 100, salvo los múltiplos de 400'],
    'Escribir la condición del año bisiesto con §if§ anidados o con una sola expresión.',
    '2024 ⇒ sí; 1900 ⇒ no (múltiplo de 100, no de 400); 2000 ⇒ sí; 2023 ⇒ no.',
    ['Anidado (§% 4§ ⇒ §% 100§ ⇒ §% 400§) y aplanado son equivalentes: elige el más legible.', 'Más de 3 niveles de anidación pide rediseñar con §and§/§or§ o §elif§.'], 'cd-anidados', 'bisiesto 4 100 400');
  F('cd-demorgan', 'cd', 'Negar condiciones compuestas (De Morgan)', 'not (A and B) = (not A) or (not B)        not (A or B) = (not A) and (not B)',
    ['§A§, §B§: condiciones', 'se niega cada término y se **cambia** §and§ por §or§ (o al revés)'],
    'Aplanar o simplificar una condición negada, o comprobar que dos condiciones son equivalentes.',
    '§not (x > 0 and x < 10)§ ⇔ §x <= 0 or x >= 10§ (al negar §>§ queda §<=§).',
    ['**Complemento** (no aparece en las diapositivas): es una propiedad general de la lógica útil para aplanar condiciones.', 'Al negar una comparación se invierte: §<§ ⇒ §>=§, §==§ ⇒ §!=§.', 'Trampa: §dia == "sabado" or "domingo"§ es **siempre verdadero** (la cadena no vacía es verdadera).'], 'cd-booleanas', 'de morgan negar');

  /* ===================================================== TABLAS ===================================================== */
  T('td-estatica-dinamica', 'Memoria estática frente a dinámica', R`
| Aspecto | Estática | Dinámica |
|---|---|---|
| Tamaño | se conoce **antes** de ejecutar | se decide **en ejecución** |
| Disposición | un bloque **contiguo** | bloques **dispersos** enlazados con referencias |
| Acceso | por índice: §base + i × tam§ (constante) | sin índice: seguir referencias |
| Liberación | automática al salir del ámbito | hay que liberarla (manual en C y C++, automática en Python y Java) |
| Ventaja | acceso rápido y buena localidad de caché | crece y se reduce con facilidad |
| Costo | desperdicio o desbordamiento si el tamaño falla | memoria extra por referencia y costo de pedir memoria |
| Ejemplo | §numpy.ndarray§, arreglo de C | lista enlazada, árbol, §dict§ |`,
    'Compromiso central: **contiguo ⇒ acceso rápido pero redimensionar es caro; enlazado ⇒ crecer es barato pero acceder al i-ésimo es lento.** El montículo puede **fragmentarse**: memoria libre suficiente en total pero sin un hueco contiguo bastante grande.', 'S1-C1 · d.13-14; S1-C2 · d.8-13', ['td-memoria', 'td-estructuras']);
  T('td-pila-monticulo', 'Pila (stack) frente a montículo (heap)', R`
| Aspecto | Pila (stack) | Montículo (heap) |
|---|---|---|
| Qué guarda | variables locales, parámetros y direcciones de retorno | objetos creados en ejecución (listas, instancias, nodos) |
| Gestión | automática (un marco por llamada) | bajo demanda |
| Liberación | al terminar la función, al instante | cuando **nadie referencia** el objeto |
| Orden | LIFO: el último marco es el primero en liberarse | sin orden |
| Falla típica | §RecursionError§ (stack overflow) | fragmentación, fugas (en C) |`,
    'No confundir con el **heap** (montículo binario de la semana 7): es otro uso de la palabra. En Python la variable vive en la pila y el objeto que referencia, en el montículo.', 'S1-C2 · d.5-7', ['td-memoria']);
  T('ay-tecnicas', 'Técnicas sobre arreglos: de qué a qué', R`
| Técnica | Problema | Costo ingenuo | Costo con la técnica |
|---|---|---|---|
| Suma de prefijos | muchas consultas de suma de rango | §Q·n§ | §n + Q§ (consulta §O(1)§) |
| Kadane | máximo subarreglo contiguo | §O(n²)§ | **§O(n)§** |
| Dos punteros | par de un arreglo **ordenado** que suma §S§ | §O(n²)§ | **§O(n)§** |
| Ventana deslizante | mejor subsegmento con una restricción | §O(n²)§ | **§O(n)§** amortizado |
| Merge intervals | fusionar intervalos solapados | §O(n²)§ | §O(n log n)§ |`,
    'Hilo común: **no recomputar**; mantener un estado (prefijo, mejor acumulado, ventana) que se actualiza en una sola pasada.', 'S3-C1 · d.8-23', ['ay-prefijos', 'ay-kadane', 'ay-punteros', 'ay-intervalos']);
  T('pc-pila-cola', 'Pila, cola, deque y cola circular', R`
| Estructura | Disciplina | Extremos | Operaciones | Costo | En Python |
|---|---|---|---|---|---|
| Pila | LIFO | uno (tope) | apilar, desapilar, tope | §O(1)§ | §list§ con §append§ y §pop()§ |
| Cola | FIFO | dos (final entra, frente sale) | encolar, desencolar, frente | §O(1)§ con deque; §O(n)§ el desencolar con §list.pop(0)§ | §collections.deque§ |
| Deque | ambas | dos | append, appendleft, pop, popleft | §O(1)§ en los dos extremos (§d[i]§ es §O(n)§) | §collections.deque§ |
| Cola circular | FIFO | dos | encolar, desencolar | §O(1)§, tamaño fijo | arreglo con §% C§ |
| Cola de prioridad | por prioridad | — | insertar, extraer el más prioritario | §O(log n)§ con heap | §heapq§ |`,
    'Pila: deshacer, pila de llamadas, DFS, balanceo de símbolos. Cola: BFS, peticiones, *data loaders*. Cola circular: búferes de tamaño fijo. Cola de prioridad: Dijkstra, top-k, planificadores.', 'S3-C2 · d.5-10; S4-C1 · d.5-15', ['pc-pila', 'pc-cola', 'pc-deque', 'pc-circular']);
  T('le-arreglo-lista', 'Arreglo frente a lista enlazada', R`
| Operación | Arreglo | Lista enlazada |
|---|---|---|
| Acceso §A[i]§ | **§O(1)§** | §O(n)§ |
| Búsqueda por valor | §O(n)§ | §O(n)§ |
| Insertar o eliminar al inicio | §O(n)§ | **§O(1)§** |
| Insertar o eliminar al final | §O(1)§ amortizado | §O(1)§ si hay puntero a la cola; §O(n)§ si no |
| Insertar o eliminar en el medio (con el nodo) | §O(n)§ | **§O(1)§** |
| Memoria por elemento | ajustada | +1 referencia por nodo |
| Localidad de caché | excelente | pobre |`,
    'Regla: ¿domina el acceso por índice? **Arreglo**. ¿Dominan inserciones o eliminaciones en extremos o posiciones conocidas? **Lista enlazada**. Los tensores nunca son listas enlazadas.', 'S4-C2 · d.9, 13, 18', ['le-vs-arreglo', 'ay-arreglo']);
  T('le-simple-doble', 'Lista simple frente a lista doble', R`
| Aspecto | Simple | Doble |
|---|---|---|
| Referencias por nodo | una (§siguiente§) | dos (§siguiente§ y §anterior§) |
| Recorrido | un solo sentido | ambos sentidos |
| Eliminar un nodo dado | necesita el **anterior** (§O(n)§ si hay que buscarlo) | **§O(1)§** sin conocer su predecesor |
| Al insertar o eliminar | actualizar un enlace | actualizar los dos sentidos de los vecinos |
| Memoria | menor | mayor |
| Uso | pilas, colas simples | base de §collections.deque§ |`,
    'En la lista doble hay que mantener **ambos** sentidos coherentes: olvidar un §anterior§ deja enlaces rotos.', 'S4-C2 · d.14', ['le-doble']);
  T('hp-cola-prioridad', 'Cola de prioridad según su implementación', R`
| Implementación | Insertar | Extraer el más prioritario | Ver el más prioritario |
|---|---|---|---|
| Lista sin ordenar | §O(1)§ | §O(n)§ | §O(n)§ |
| Lista ordenada | §O(n)§ | §O(1)§ | §O(1)§ |
| **Heap** | **§O(log n)§** | **§O(log n)§** | §O(1)§ |`,
    'El heap equilibra las dos operaciones. Construir un heap desde un arreglo: §O(n)§; buscar un valor cualquiera: §O(n)§. En Python, §heapq§ es un **min-heap**; para un max-heap se niegan los valores.', 'S7-C2 · d.20-22', ['hp-cola-prioridad', 'hp-def']);
  T('hp-heap-bst', 'Heap frente a árbol binario de búsqueda', R`
| Aspecto | Heap | BST balanceado |
|---|---|---|
| Forma | árbol binario **completo** | cualquiera (balanceado: altura §log n§) |
| Orden | **parcial**: padre ≥ hijos (max) o ≤ (min) | total por subárboles: izquierda < nodo < derecha |
| Almacenamiento | arreglo, sin punteros | nodos con punteros |
| El extremo | **§O(1)§** en la raíz | §O(log n)§ |
| Buscar un valor | §O(n)§ | **§O(log n)§** |
| Insertar | §O(log n)§ (hoja y subir) | §O(log n)§ (bajar hasta una hoja) |
| Recorrido inorden | no da los datos ordenados | **da los datos ordenados** |
| Sirve para | cola de prioridad, top-k, heapsort | búsqueda, rangos, datos ordenados |`,
    'Los hermanos de un heap **no** están ordenados entre sí: solo se ordena cada padre con sus hijos.', 'S7-C2 · d.5, 22', ['hp-def', 'hp-cola-prioridad']);
  T('cd-tabla-verdad', 'Tabla de verdad de and, or y not', R`
| p | q | p and q | p or q | not p | p != q |
|---|---|---|---|---|---|
| True | True | True | True | False | False |
| True | False | False | True | False | True |
| False | True | False | True | True | True |
| False | False | False | False | True | False |`,
    '§and§ es verdadero **solo si ambos** lo son; §or§ es falso **solo si ambos** son falsos; §not§ invierte. La columna §p != q§ es verdadera cuando los dos valores son distintos.', 'AP-S3-C1 · d.5-6', ['cd-booleanas']);
  T('cd-estructuras', 'Estructuras condicionales: cuál usar', R`
| Estructura | Cuántos caminos | Qué ejecuta | Ejemplo |
|---|---|---|---|
| §if§ | uno, opcional | el bloque solo si la condición es verdadera | advertencia si la temperatura supera 40 |
| §if-else§ | dos | exactamente uno de los dos bloques | mayor o menor de edad |
| §if-elif-else§ | varios, excluyentes | el **primer** bloque con condición verdadera; el §else§ final recoge el resto | letra según el rango de la nota |
| §if§ seguidos | independientes | cada §if§ se evalúa por su cuenta | dos avisos que pueden darse a la vez |
| Anidado | la segunda pregunta depende de la primera | el interno solo si pasó el externo | año bisiesto |
| Ternario | dos valores | elige un valor en una asignación | §estado = "mayor" if edad >= 18 else "menor"§ |`,
    'En un §elif§ el **orden importa**: de la condición más restrictiva a la más general. Más de 3 niveles de anidación ⇒ rediseñar.', 'AP-S3-C1 · d.7-13', ['cd-if', 'cd-anidados']);

  /* ===================================================== REPASO ===================================================== */
  B.repasoSec({ id: 'estructuras-def', icono: '🧱', titulo: 'Estructuras lineales, heaps y condicionales: definiciones', md: R`
**Estructura de datos y TAD.** Estructura = organización en memoria **más** los algoritmos que la mantienen. **TAD** = dominio + operaciones + **reglas** (axiomas); no dice cómo se guarda ni cuánto cuesta (eso es la implementación). Pila y cola tienen las mismas operaciones y **reglas distintas**.

**Memoria.** **Pila**: marcos de llamadas (automática, LIFO). **Montículo**: objetos creados en ejecución. **Estática** = contigua y de tamaño fijo (§dir = base + i × tam§); **dinámica** = enlazada. Asignar con §=§ **copia la referencia**; §copy.copy§ comparte lo interno, §deepcopy§ copia todo; argumento por defecto mutable (§acc=[]§) se conserva entre llamadas.

**Arreglo.** Contiguo, acceso §O(1)§, búsqueda/inserción/eliminación §O(n)§. **Técnicas**: prefijos (consulta §O(1)§), Kadane (§s_actual = max(A[i], s_actual + A[i])§), dos punteros (ordenado), ventana (§O(n)§ amortizado), merge intervals (§O(n log n)§).

**Pila y cola.** Pila **LIFO** (tope = final de la §list§); cola **FIFO** (§deque§: §popleft§ §O(1)§; §list.pop(0)§ §O(n)§). **Balanceo**: apilar aperturas y comparar con el tope; un contador acepta §([)]§ por error. **Pila monótona**: guarda índices, §O(n)§ amortizado. **Cola circular**: §final = (frente + tam) % C§; llena ⇔ §tam == C§.

**Lista enlazada.** Nodos dispersos con §siguiente§; §cabeza§ marca el primero y el último apunta a §None§. Insertar al inicio §O(1)§; en una posición: buscar §O(n)§ y enlazar en el orden **nuevo.siguiente primero, actual.siguiente después**. Eliminar = **puentear**. Doble: §siguiente§ y §anterior§. **Floyd**: tortuga (1 paso) y liebre (2) detectan ciclos con §O(1)§ de memoria.

**Heap.** Árbol binario **completo** con orden **parcial** (max: padre ≥ hijos; min: padre ≤ hijos); se guarda en un arreglo: hijos §2i + 1§, §2i + 2§; padre §(i − 1) // 2§. Insertar = última hoja y **subir**; extraer = última hoja a la raíz y **bajar** por el hijo mayor (max) o menor (min). **heapify** §O(n)§; §heapq§ es un **min-heap**; top-k §O(n log k)§; heapsort §O(n log n)§ y §O(1)§ de memoria extra.

**Condicionales.** §=§ asigna, §==§ compara; precedencia §not§ > §and§ > §or§. §if-elif-else§ ejecuta el **primer** bloque verdadero; el orden importa. Anidar o aplanar con §and§/§or§; ternario §A if cond else B§.` });

  B.repasoSec({ id: 'estructuras-cx', icono: '⏱', titulo: 'Complejidades de las estructuras nuevas', md: R`
| Qué | Tiempo | Notas |
|---|---|---|
| Arreglo: acceso §A[i]§ | §O(1)§ | búsqueda, inserción y eliminación: §O(n)§ |
| Pila (tope al final de una §list§) | §O(1)§ | apilar, desapilar y tope; el acceso interno es §O(n)§ |
| Cola con §deque§ | §O(1)§ | con §list.pop(0)§ desencolar es §O(n)§ |
| Deque | §O(1)§ | ambos extremos; §d[i]§ es §O(n)§ |
| Cola circular | §O(1)§ | tamaño fijo; la usa un búfer |
| Lista enlazada: insertar al inicio | §O(1)§ | acceso y búsqueda: §O(n)§ |
| Lista enlazada: insertar en una posición | §O(n)§ | buscar §O(n)§ + enlazar §O(1)§ |
| Lista enlazada: eliminar con el nodo anterior | §O(1)§ | si hay que buscarlo: §O(n)§ |
| Floyd (detectar ciclo) | §O(n)§ | memoria §O(1)§ |
| Heap: ver el extremo | §O(1)§ | buscar un valor: §O(n)§ |
| Heap: insertar, extraer | §O(log n)§ | altura §⌊log₂ n⌋§ |
| Heap: heapify | §O(n)§ | n inserciones: §O(n log n)§ |
| Top-k con un heap de tamaño k | §O(n log k)§ | memoria §O(k)§ |
| Heapsort | §O(n log n)§ | memoria extra §O(1)§ |
| Prefijos, Kadane, dos punteros, ventana | §O(n)§ | prefijos: cada consulta §O(1)§ |
| Merge intervals | §O(n log n)§ | lo domina el ordenamiento |
| Balanceo de símbolos, pila monótona | §O(n)§ | amortizado |` });

  B.repasoSec({ id: 'estructuras-pasos', icono: '🪜', titulo: 'Pasos de los ejercicios de las estructuras nuevas', md: R`
- **Insertar en la posición §pos§ de una lista:** si §pos == 0§, insertar al inicio; si no, avanzar §actual§ §pos − 1§ veces; §nuevo = Nodo(dato)§; **§nuevo.siguiente = actual.siguiente§**; **§actual.siguiente = nuevo§**.
- **Eliminar por valor:** §actual, anterior = cabeza, None§; avanzar los **dos** punteros hasta hallarlo; si §anterior is None§ → §cabeza = actual.siguiente§; si no → §anterior.siguiente = actual.siguiente§.
- **Invertir una lista:** §siguiente = actual.siguiente§; §actual.siguiente = anterior§; §anterior = actual§; §actual = siguiente§; al final §cabeza = anterior§.
- **Floyd:** §tortuga = liebre = cabeza§; mientras §liebre§ y §liebre.siguiente§ no sean §None§: tortuga +1, liebre +2; si son iguales → ciclo.
- **Balancear:** apilar cada apertura; ante un cierre, la pila no puede estar vacía y el tope debe ser su pareja; al final la pila debe quedar **vacía**.
- **Pila monótona:** para cada §i§, mientras §T[tope] < T[i]§: desapilar §k§ y §D[k] = i − k§; luego apilar §i§.
- **Cola circular:** encolar en §(frente + tam) % C§; desencolar en §frente§ y §frente = (frente + 1) % C§; comprobar §tam§ antes.
- **Insertar en un heap:** añadir al final; mientras §i > 0§ y el elemento gane a su padre §(i − 1) // 2§, intercambiar y §i = padre§.
- **Extraer de un heap:** guardar la raíz; §pop()§ de la última hoja; ponerla en la raíz; bajarla intercambiándola con el hijo que **gane** mientras haga falta.
- **heapify:** desde §i = n // 2 − 1§ hasta 0, bajar cada nodo.
- **Top-k (los k menores):** max-heap de tamaño k; si el nuevo es menor que la raíz, reemplazar la raíz y bajar.
- **Kadane:** §s_actual = s_max = A[0]§; para el resto, §s_actual = max(A[i], s_actual + A[i])§ y actualizar §s_max§.` });

  B.repasoSec({ id: 'estructuras-confusiones', icono: '⚠', titulo: 'Confusiones frecuentes (estructuras nuevas y condicionales)', md: R`
- **Heap ≠ BST:** los hermanos del heap **no** están ordenados; el heap **no** busca en §O(log n)§ y su inorden no sale ordenado.
- **«heap» tiene dos sentidos:** el montículo de memoria (semana 1) y el montículo binario (semana 7).
- **§heapq§ es min-heap:** para el máximo se guardan los valores **negados**.
- **Extraer la raíz con §del datos[0]§:** es §O(n)§ y rompe la estructura; se usa la última hoja.
- **§list.pop(0)§ como desencolar:** §O(n)§; usa §deque§.
- **Cola circular sin §tam§:** no se distingue llena de vacía.
- **Contador en vez de pila** para paréntesis: acepta §([)]§.
- **Pila monótona con valores en vez de índices:** se pierde la distancia §i − k§.
- **Insertar en una lista enlazada:** reasignar §actual.siguiente§ **antes** que §nuevo.siguiente§ pierde el resto de la lista; olvidar la lista vacía o la cabeza.
- **Alias y copias:** §b = a§ no copia; §copy.copy§ comparte los objetos internos.
- **Kadane con §s_max = 0§:** falla cuando todos los valores son negativos.
- **Dos punteros en un arreglo sin ordenar:** la técnica no es válida.
- **Condicionales:** §=§ por §==§; §nota >= 3 and <= 5§ (falta repetir la variable); §elif§ en mal orden (el más general primero); olvidar el caso inválido; §dia == "a" or "b"§ siempre verdadero; comparar cadenas sin §.lower()§.` });

  /* ===================================================== AUTOEVALUACIÓN ===================================================== */
  B.autoevalua('td', [
    ['Define TAD y di qué NO especifica.', 'Dominio + operaciones + reglas de comportamiento. No especifica cómo se guardan los datos, la memoria que usa ni el costo de cada operación (eso es la implementación).'],
    ['Pila y cola tienen «meter» y «sacar». ¿Son el mismo TAD? Justifica.', 'No: las operaciones coinciden pero las reglas (axiomas) son distintas: LIFO en la pila (§desapilar(apilar(P, x)) = P§) y FIFO en la cola.'],
    ['Un arreglo empieza en la dirección 2000 y cada elemento ocupa 4 bytes. ¿Dónde está §v[3]§? ¿Y por qué es §O(1)§?', '§2000 + 3 × 4 = 2012§; una multiplicación y una suma, sin importar el índice (memoria contigua).'],
    ['§a = [1, 2, 3]; b = a; b.append(4); print(a)§: ¿qué imprime y por qué?', '§[1, 2, 3, 4]§: la asignación copia la **referencia**, no el objeto; hay un solo objeto y dos nombres.'],
    ['¿En qué difieren §copy.copy§ y §copy.deepcopy§ con §[[1, 2], [3, 4]]§?', 'La superficial comparte las listas internas (un cambio en una se ve en la otra); la profunda copia todo el árbol de objetos.'],
    ['¿Por qué un §ndarray§ es más rápido que una §list§ para sumar un millón de números?', 'Valores contiguos y en crudo (≈ 8 MB frente a ≈ 36 MB): aprovecha las líneas de caché de 64 bytes; la lista salta entre objetos dispersos.']
  ]);
  B.autoevalua('ay', [
    ['Con §A = [5, 4, 9, 0, 1, 3]§ construye el arreglo de prefijos y calcula §q(2, 4)§.', '§P = [5, 9, 18, 18, 19, 22]§; §q(2, 4) = P[4] − P[1] = 19 − 9 = 10§.'],
    ['¿Por qué Kadane no debe inicializar §s_max = 0§? Da un ejemplo.', 'Con todos los valores negativos (§[−5, −2, −8, −1]§) la respuesta correcta es −1, no 0.'],
    ['¿Qué precondición exige la técnica de dos punteros para la suma objetivo y qué costo tiene?', 'El arreglo debe estar **ordenado**; §O(n)§ de tiempo y §O(1)§ de memoria (cada puntero recorre una vez).'],
    ['¿Por qué la ventana deslizante es §O(n)§ aunque haya un §while§ dentro del §for§?', 'Argumento amortizado: cada elemento entra una vez y sale a lo sumo una vez, ≤ 2n operaciones.'],
    ['Fusiona §[(1, 3), (2, 6), (8, 10), (15, 18)]§ y da el costo.', '§[(1, 6), (8, 10), (15, 18)]§; §O(n log n)§ por el ordenamiento.']
  ]);
  B.autoevalua('pc', [
    ['¿Qué significa LIFO y qué estructura lo cumple? ¿Dónde va el tope en una §list§ de Python?', 'Último en entrar, primero en salir: la pila. El tope es el **final** de la lista (§append§ y §pop()§ son §O(1)§).'],
    ['¿Por qué un contador de paréntesis no basta para validar §([)]§?', 'Termina en 0 pero está mal anidado; la pila recuerda **cuál** fue la última apertura pendiente.'],
    ['Calcula los días de espera para §T = [6, 8, 5, 4, 3, 7, 9, 6]§ con una pila monótona.', '§D = [1, 5, 3, 2, 1, 1, 0, 0]§; en la pila quedan los índices 6 y 7. Es §O(n)§ amortizado.'],
    ['¿Por qué §lista.pop(0)§ es mala cola y qué usar?', 'Desplaza todos los elementos (§O(n)§, una cola de n operaciones se vuelve §O(n²)§); §collections.deque§ con §popleft()§ es §O(1)§.'],
    ['En una cola circular con §C = 5§, §frente = 3§, §tam = 4§: ¿dónde se encola y cuándo está llena?', 'En §(3 + 4) % 5 = 2§ (da la vuelta); está llena cuando §tam == C§ (por eso se lleva §tam§).']
  ]);
  B.autoevalua('le', [
    ['Escribe los dos pasos de §insertar_en(dato, pos)§ y explica por qué van en ese orden.', '§nuevo.siguiente = actual.siguiente§ y luego §actual.siguiente = nuevo§; al revés se pierde el resto de la lista.'],
    ['¿Cómo se elimina un nodo intermedio y qué pasa con el nodo eliminado?', 'Se puentea: §anterior.siguiente = actual.siguiente§; queda sin referencias y el recolector de basura lo libera. Eliminar es §O(1)§ si ya se tiene el anterior.'],
    ['Compara arreglo y lista enlazada en acceso por índice, insertar al inicio y memoria por elemento.', 'Arreglo: §O(1)§, §O(n)§, ajustada. Lista: §O(n)§, §O(1)§, +1 referencia.'],
    ['¿Qué ventaja tiene la lista doble al eliminar?', 'Elimina un nodo en §O(1)§ **sin conocer su predecesor** (tiene §anterior§); cuesta una referencia más por nodo.'],
    ['Explica Floyd y su costo.', 'Tortuga (1 paso) y liebre (2 pasos); hay ciclo si se encuentran, no lo hay si la liebre llega a §None§. §O(n)§ tiempo, §O(1)§ memoria.']
  ]);
  B.autoevalua('hp', [
    ['Dada la posición §i§, ¿dónde están el padre y los hijos en el arreglo? ¿Cuál es el último nodo con hijos?', 'Padre §(i − 1) // 2§; hijos §2i + 1§ y §2i + 2§ (si son menores que §n§); último con hijos §n // 2 − 1§.'],
    ['Inserta 15 en el max-heap §[24, 10, 12, 5, 3]§.', 'Se añade al final (posición 5); su padre es la posición 2 (12) y 15 > 12: se intercambian ⇒ §[24, 10, 15, 5, 3, 12]§; 15 ≤ 24: termina.'],
    ['¿Por qué al extraer la raíz se usa la última hoja y no se borra la raíz directamente?', 'Quitar la última hoja es §O(1)§ y mantiene el árbol completo; §del datos[0]§ correría todo (§O(n)§) y revolvería padres e hijos. Luego se baja la nueva raíz por el hijo mayor.'],
    ['¿Cuánto cuesta construir un heap de §n§ elementos y por qué?', '§O(n)§ con heapify (casi todos los nodos están cerca de las hojas y bajan poco); n inserciones costarían §O(n log n)§.'],
    ['Para los 10 menores de 10⁶ números, ¿qué heap usas y cuánto cuesta?', 'Un **max-heap de tamaño 10**: §O(n log k)§ de tiempo y §O(k)§ de memoria (≈ 6 veces menos comparaciones que ordenar todo).'],
    ['¿Qué diferencia hay entre un heap y un BST?', 'El heap da el extremo en §O(1)§ pero no busca ni recorre ordenado; el BST busca en §O(log n)§ (balanceado) y su inorden sale ordenado.']
  ]);
  B.autoevalua('cd', [
    ['Evalúa §not (4 > 2 or 1 == 1) and 5 != 3§.', '§not (True or True) and True§ ⇒ §False and True§ ⇒ **False**.'],
    ['¿Qué diferencia hay entre dos §if§ seguidos y un §if-elif§?', 'Los dos §if§ evalúan ambas condiciones por separado; el §if-elif§ ejecuta solo el primer bloque cuya condición es verdadera.'],
    ['¿Por qué importa el orden de los §elif§ en un clasificador de notas?', 'Gana la primera condición verdadera: si §nota >= 3.0§ va antes que §nota >= 4.5§, «Excelente» nunca se alcanza. Se ordena de lo más restrictivo a lo más general (y el caso inválido primero).'],
    ['Escribe la condición del año bisiesto en una sola expresión.', '§(anio % 4 == 0 and anio % 100 != 0) or anio % 400 == 0§ (1900 no; 2000 sí; 2024 sí).'],
    ['Corrige §if nota >= 3 and <= 5:§ y §if edad = 18:§.', '§if 3 <= nota <= 5:§ (o repetir la variable) y §if edad == 18:§.']
  ]);
})(typeof window !== 'undefined' ? window : globalThis);
