/* banco_biblioteca.js — ejercicios para los temas de la Biblioteca que no tenían práctica propia:
   medir y contar operaciones (S2-C1), constantes ocultas (S2-C2), problemas clásicos y NP-difíciles (S5-C2) y árboles rojo-negro (S7-C1, d.22-33).
   Estilo del parcial del profesor: verdadero/falso con justificación, clasificar y decidir el caso. */
(function (global) {
  'use strict';
  const ET = global.ET, B = ET.Banco.add, U = ET.U;

  /** V/F con justificación: items = [{a, v, e, j:[correcta, mala1, mala2]}] */
  function vfPlantilla(id, n, e, dif, c, tema, items, pistas) {
    B({
      id, n, e, dif, c, tema,
      gen(rng, K) {
        const it = rng.pick(items);
        return {
          tipo: 'vf', enunciado: 'Decide si la afirmación es verdadera o falsa y elige la razón que la sustenta.', afirmacion: it.a, correcta: it.v, explicacion: it.e,
          justif: { pregunta: '**Justifica:** elige la razón correcta.', opciones: rng.shuffle([{ t: it.j[0], ok: true, why: 'Es la razón correcta.' }, { t: it.j[1], ok: false, why: 'No es la razón.' }, { t: it.j[2], ok: false, why: 'No es la razón.' }]) },
          pistas
        };
      }
    });
  }
  /** clasificar: items = [[texto, categoría, porqué]] */
  function clasificarPlantilla(id, n, e, dif, c, tema, enun, categorias, items, pistas, expl) {
    B({
      id, n, e, dif, c, tema,
      gen(rng, K) {
        return { tipo: 'clasificar', enunciado: enun, categorias, items: rng.sample(items, Math.min(5, items.length)).map(t => ({ t: t[0], cat: categorias.indexOf(t[1]), why: t[2] })), pistas, explicacion: expl };
      }
    });
  }

  /* ===================== Nivel 2 ===================== */
  vfPlantilla('bib-n2-medir-vf', 2, 'A', 2, ['cx_medir', 'cx_python'], 'Medir en segundos y modelo RAM', [
    { a: 'Medir el tiempo de un algoritmo en segundos permite compararlo con otro medido en un computador distinto.', v: false, e: 'El tiempo en segundos mezcla el algoritmo con la máquina (procesador, lenguaje, carga, caché).', j: ['El tiempo mezcla el algoritmo con la máquina: procesador, lenguaje, carga del sistema y caché.', 'Los segundos siempre son comparables si el algoritmo es el mismo.', 'Todos los computadores modernos tienen la misma velocidad.'] },
    { a: 'En el modelo RAM, la operación `x in lista` cuesta una operación elemental.', v: false, e: '`x in lista` recorre la lista: cuesta n, no 1. En un set sí cuesta ≈ 1.', j: ['`x in lista` recorre la lista elemento por elemento: cuesta n (con un set, ≈ 1).', 'Toda operación de Python cuesta 1 en el modelo RAM.', '`in` es un operador aritmético.'] },
    { a: 'En el modelo RAM cada operación elemental (aritmética, comparación, asignación simple, acceso `v[i]`) cuesta una unidad de tiempo.', v: true, e: 'Es el supuesto del modelo: cada operación elemental cuesta 1 unidad sin importar los valores.', j: ['Es el supuesto del modelo RAM: cada operación elemental cuesta una unidad, independientemente de los valores.', 'Porque el procesador ejecuta una instrucción por segundo.', 'Porque las multiplicaciones cuestan más que las sumas.'] },
    { a: 'Contar operaciones elementales en función de n es un análisis independiente de la máquina y del lenguaje.', v: true, e: 'Por eso se cuentan operaciones y no segundos.', j: ['El conteo de operaciones es una propiedad del algoritmo, no de la máquina.', 'Porque Python y C cuestan lo mismo.', 'Porque el tamaño de n no influye.'] },
    { a: 'Si dos algoritmos tardan lo mismo con n = 1000 en una máquina, tienen la misma función de costo.', v: false, e: 'Pueden crecer distinto (suma_formula es constante y suma_iterativa lineal): importa cómo crece el costo con n.', j: ['El costo puede crecer distinto con n: lo que importa es la forma de crecer, no un solo punto medido.', 'Dos medidas iguales siempre implican el mismo algoritmo.', 'La función de costo no depende de n.'] },
    { a: 'Para obtener el costo real de una función de Python basta con contar los ciclos visibles.', v: false, e: 'Las llamadas dentro del ciclo (`in` sobre lista, `insert(0, x)`, `sort`) pueden costar más que O(1).', j: ['Las operaciones que se llaman dentro (`in` sobre una lista, `insert`, `sort`…) pueden recorrer datos y cambiar el orden.', 'Los ciclos siempre son lo único que cuesta.', 'Las funciones de la biblioteca estándar siempre cuestan O(1).'] },
    { a: '`lista.insert(0, x)` cuesta una operación elemental porque solo agrega un elemento.', v: false, e: 'Desplaza todos los elementos: cuesta n.', j: ['Insertar al inicio desplaza todos los elementos de la lista: cuesta n.', 'Agregar siempre cuesta 1.', 'Solo cuesta n si la lista está llena.'] },
    { a: 'Definir qué es n (número de elementos, de bits, de nodos…) es parte del análisis de complejidad.', v: true, e: 'Sin definir el tamaño de entrada, el análisis no significa nada.', j: ['Sin declarar el tamaño de entrada n, el análisis no tiene sentido.', 'n siempre es el número de líneas del programa.', 'n es irrelevante para el costo.'] }
  ], ['Piensa qué mezcla un cronómetro: ¿mide solo el algoritmo?', 'Modelo RAM: operaciones aritméticas, comparaciones, asignación simple, acceso `v[i]`, retorno y llamada cuestan 1.', 'Cuidado con operaciones de Python que recorren datos: `in` sobre lista, `insert(0, x)`, `s1 + s2`.']);

  vfPlantilla('bib-n2-conteo-vf', 2, 'B', 3, ['cx_conteo', 'cx_ciclos'], 'Conteo de operaciones (V/F)', [
    { a: 'En `def sumar(v)` con ciclo de n vueltas y 3 operaciones por vuelta más 1 de control, la función de costo es T(n) = 4n + 2.', v: true, e: '1 + n·(1 + 3) + 1 = 4n + 2: lineal.', j: ['Inicio 1 + n vueltas × (1 de control + 3 del cuerpo) + 1 de retorno = 4n + 2.', 'El costo no depende de n porque solo hay un ciclo.', 'Se multiplica n por n: 4n².'] },
    { a: 'El doble ciclo `for i in range(n): for j in range(i + 1, n)` ejecuta su cuerpo n² veces.', v: false, e: 'Ejecuta (n−1) + (n−2) + … + 1 = n(n−1)/2 veces.', j: ['El interno hace n−1, n−2, …, 1 vueltas: suman n(n−1)/2, no n².', 'Cada ciclo hace n vueltas, así que son n².', 'El interno solo hace una vuelta cada vez.'] },
    { a: 'Un fragmento sin ciclos ni llamadas a funciones que recorran datos tiene costo T(n) constante.', v: true, e: 'Ejemplo de clase: area_rectangulo, T(n) = 4.', j: ['Hace un número fijo de operaciones, sin importar n.', 'Cualquier fragmento depende de n.', 'Porque Python optimiza los fragmentos pequeños.'] },
    { a: 'Un ciclo interno `for j in range(100)` dentro de `for i in range(n)` hace que el costo sea cuadrático.', v: false, e: 'El interno es de tamaño fijo: 100·n = O(n).', j: ['El interno no depende de n: son 100n operaciones, O(n).', 'Dos ciclos anidados siempre dan n².', '100 es mayor que n.'] },
    { a: 'Un ciclo cuyo índice se duplica en cada vuelta (`j *= 2` mientras `j < n`) hace ⌈log₂ n⌉ vueltas.', v: true, e: 'j = 2ᵏ; termina cuando 2ᵏ ≥ n.', j: ['Tras k vueltas j = 2ᵏ y termina cuando 2ᵏ ≥ n, o sea k = ⌈log₂ n⌉.', 'El índice crece de uno en uno, así que hace n vueltas.', 'Hace siempre 2 vueltas.'] },
    { a: 'Dos ciclos de n vueltas, uno después del otro, tienen costo 2n, que es O(n) y no O(n²).', v: true, e: 'Bloques consecutivos se suman (se toma el mayor); solo los anidados se multiplican.', j: ['Bloques consecutivos se suman: n + n = 2n = O(n); solo los anidados se multiplican.', 'Siempre se multiplican las complejidades de los ciclos.', 'Se toma el menor de los dos.'] },
    { a: 'Para n = 10, el cuerpo de `for i in range(n): for j in range(i)` se ejecuta 100 veces.', v: false, e: '0 + 1 + … + 9 = 45 = n(n−1)/2.', j: ['El interno hace i vueltas: 0 + 1 + … + 9 = 45 = n(n−1)/2.', 'Son n·n = 100 porque hay dos ciclos.', 'Son n = 10 porque el interno es corto.'] },
    { a: 'La suma 1 + 2 + … + (n−1) es igual a n(n−1)/2.', v: true, e: 'Se agrupan términos extremos: cada pareja suma n y hay (n−1)/2 parejas.', j: ['Se agrupan primero con último, segundo con penúltimo…: (n−1)/2 parejas de suma n.', 'Porque es n² dividido entre 2 exactamente.', 'Porque cada término vale n/2.'] }
  ], ['Cuenta cuántas veces se ejecuta cada línea en función de n.', 'Anidados se multiplican (con cuidado si el interno depende de i); consecutivos se toma el mayor.', 'Suma aritmética: 1 + 2 + … + m = m(m+1)/2.']);

  vfPlantilla('bib-n2-constantes-vf', 2, 'C', 4, ['cx_constantes', 'cx_formal'], 'Lo que oculta la notación O', [
    { a: 'Un algoritmo O(n log n) es más rápido que uno O(n²) para cualquier tamaño de entrada.', v: false, e: 'O oculta constantes: con n pequeño puede ganar el O(n²) (insertion sort gana con n < 50).', j: ['La notación O oculta constantes: para n pequeño el de mejor orden puede perder.', 'Porque n log n es mayor que n² cuando n es grande.', 'Porque los dos tienen la misma complejidad.'] },
    { a: 'El `sort()` de Python (Timsort) es O(n log n) pero usa insertion sort en subarreglos pequeños (menos de 64 elementos).', v: true, e: 'Porque para n pequeño las constantes deciden.', j: ['Para subarreglos pequeños, las constantes del insertion sort (O(n²)) son menores y ganan.', 'Porque insertion sort es asintóticamente mejor.', 'Porque Timsort no es O(n log n).'] },
    { a: 'La notación O captura el efecto de la localidad de caché de un algoritmo.', v: false, e: 'La ignora; puede valer 10×.', j: ['O solo describe el crecimiento y deliberadamente ignora constantes y localidad de caché.', 'La caché cambia el orden de crecimiento.', 'La localidad de caché es parte de la definición de O.'] },
    { a: 'Duplicar el contexto de un transformer cuadruplica el costo de la atención estándar.', v: true, e: 'La atención es Θ(L²): se compara cada token con todos los demás.', j: ['El costo de la atención es Θ(L²): al duplicar L se multiplica por 4.', 'El costo es lineal en L.', 'El costo es constante en L.'] },
    { a: 'Si un algoritmo es O(n) y otro O(n log n), el primero es siempre más rápido en la práctica.', v: false, e: 'Un O(n) con constante 1000 puede ser más lento que un O(n log n) con constante 2 en el rango de n que se usa.', j: ['Las constantes pueden invertir el orden en el rango práctico de n.', 'O(n) siempre tiene constante menor.', 'n log n es menor que n.'] },
    { a: 'El problema del costo cuadrático de la atención se resuelve comprando hardware más rápido.', v: false, e: 'Es un problema de complejidad: la brecha entre L² y L log L crece sin límite.', j: ['Con costo L² la brecha crece sin límite con L: es un problema de complejidad, no de hardware.', 'Cualquier problema se resuelve con más hardware.', 'La atención ya es lineal.'] },
    { a: 'Un procesador más rápido compensa un algoritmo de peor orden de crecimiento.', v: false, e: 'La tabla de crecimiento muestra que ninguna máquina más rápida cierra esa brecha.', j: ['El orden de crecimiento supera cualquier factor constante de hardware cuando n crece.', 'Un procesador 10× más rápido hace 10× más rápido el crecimiento exponencial.', 'Porque la velocidad del procesador cambia el orden de crecimiento.'] },
    { a: 'Con n = 10⁶ y 10⁹ operaciones por segundo, un algoritmo de 10¹² operaciones (n²) tarda unos 1000 segundos.', v: true, e: '10¹² ÷ 10⁹ = 10³ s ≈ 17 minutos (la diapositiva dice «11 días», pero esa cifra no corresponde a 10¹² operaciones).', j: ['Tiempo = operaciones ÷ operaciones por segundo = 10¹² ÷ 10⁹ = 1000 s.', 'Tarda 11 días porque n² es enorme.', 'Tarda 10⁶ segundos.'] }
  ], ['Pregúntate qué ignora la notación O.', 'Para n pequeño, las constantes y la localidad de caché pueden decidir.', 'Tiempo estimado = operaciones ÷ operaciones por segundo.']);

  /* ===================== Nivel 3 ===================== */
  clasificarPlantilla('bib-n3-clasicos-clasificar', 3, 'B', 3, ['pd_clasicos', 'pd_np', 'pd_cinco'], 'Problemas clásicos',
    'Para cada problema clásico, ¿qué enfoque es el típico (del libro de referencia de la clase)?',
    ['Programación dinámica', 'Backtracking', 'Fuerza bruta O(n!) / heurísticas'],
    [['Mochila 0/1: maximizar valor sin exceder el peso', 'Programación dinámica', 'Subproblemas solapados: dp[i][w]; O(n·W).'],
    ['Cambio de moneda: mínimas monedas para un valor', 'Programación dinámica', 'dp[v] = mín(dp[v − c] + 1); greedy falla con {1, 3, 4}.'],
    ['N-reinas: colocar N reinas sin ataques', 'Backtracking', 'Se abandona la rama en cuanto dos reinas se atacan.'],
    ['Agente viajero (TSP): ruta más corta que visita todas las ciudades', 'Fuerza bruta O(n!) / heurísticas', 'Fuerza bruta O(n!); NP-difícil: se usan heurísticas.'],
    ['Contar de cuántas formas se sube una escalera de n escalones con pasos de 1 o 2', 'Programación dinámica', 'f(n) = f(n−1) + f(n−2): subproblemas solapados.'],
    ['Encontrar todas las formas de colocar 8 reinas sin que se ataquen', 'Backtracking', 'Poda temprana de ramas inválidas.'],
    ['Visitar 40 ciudades minimizando la distancia con poco tiempo disponible', 'Fuerza bruta O(n!) / heurísticas', '40! es inviable: se usan heurísticas y metaheurísticas (recocido simulado, enjambre).']],
    ['Mochila y cambio de moneda: subproblemas solapados → DP.', 'N-reinas: restricciones que permiten podar → backtracking.', 'TSP: la fuerza bruta es O(n!) (NP-difícil) → heurísticas.'],
    'Problemas clásicos (S5-C2, diap. 16): TSP → fuerza bruta O(n!) o heurísticas; mochila 0/1 → programación dinámica; N-reinas → backtracking; cambio de moneda → programación dinámica.');

  vfPlantilla('bib-n3-np-vf', 3, 'C', 4, ['pd_np', 'pd_clasicos', 'pd_greedy'], 'NP-difíciles y heurísticas', [
    { a: 'El agente viajero por fuerza bruta evalúa (n − 1)! rutas, es decir, es O(n!).', v: true, e: 'Cada permutación de las demás ciudades es una ruta.', j: ['Se prueban todas las permutaciones de las n − 1 ciudades restantes: (n − 1)! = O(n!).', 'Solo se prueban n rutas.', 'Se prueban 2ⁿ rutas.'] },
    { a: 'La mochila 0/1 por fuerza bruta examina 2ⁿ subconjuntos de objetos.', v: true, e: 'Cada objeto entra o no entra.', j: ['Cada uno de los n objetos entra o no: 2ⁿ combinaciones.', 'Se examinan n! permutaciones.', 'Se examinan n² combinaciones.'] },
    { a: 'Para TSP y mochila grandes se usan heurísticas porque la fuerza bruta es inviable y son NP-difíciles.', v: true, e: 'Sacrifican optimalidad por tiempo: el compromiso central de la optimización en IA.', j: ['O(n!) y O(2ⁿ) no escalan; las heurísticas buscan buenas soluciones en tiempo razonable.', 'Porque las heurísticas siempre dan el óptimo.', 'Porque la fuerza bruta es O(1).'] },
    { a: 'Una heurística o metaheurística (recocido simulado, enjambre) garantiza la solución óptima.', v: false, e: 'No: sacrifican optimalidad a cambio de tiempo.', j: ['No garantizan el óptimo: sacrifican optimalidad por tiempo.', 'Siempre examinan todas las soluciones.', 'Se usan solo cuando el problema es pequeño.'] },
    { a: 'La mochila 0/1 se resuelve por programación dinámica en O(n·W), con W la capacidad.', v: true, e: 'La tabla tiene n filas y W + 1 columnas.', j: ['La tabla dp[i][w] tiene n × (W + 1) subproblemas, cada uno con trabajo constante.', 'Se resuelve en O(log n).', 'No se puede resolver por DP.'] },
    { a: 'Un algoritmo greedy que toma el objeto de mayor valor por peso siempre resuelve la mochila 0/1 de forma óptima.', v: false, e: 'Greedy no siempre da el óptimo; la mochila 0/1 requiere DP.', j: ['El óptimo local puede impedir la mejor combinación global (no hay subestructura greedy).', 'Greedy siempre es óptimo.', 'La mochila no tiene solución.'] },
    { a: 'Con 15 ciudades, la fuerza bruta del TSP revisa 14! ≈ 8,7 × 10¹⁰ rutas.', v: true, e: '(15 − 1)! = 87 178 291 200.', j: ['Se fija la ciudad de partida y se permutan las otras 14: 14! rutas.', 'Revisa 15 rutas.', 'Revisa 2¹⁵ rutas.'] },
    { a: 'N-reinas se resuelve típicamente con backtracking, que poda ramas en cuanto dos reinas se atacan.', v: true, e: 'Explora mucho menos que la fuerza bruta.', j: ['La poda abandona la rama apenas se viola una restricción: se explora mucho menos espacio.', 'Se resuelve con greedy.', 'Se resuelve con búsqueda binaria.'] }
  ], ['Fuerza bruta: TSP O(n!) y mochila O(2ⁿ).', 'NP-difícil: sin algoritmo eficiente conocido; se usan heurísticas.', 'Heurística = buena solución rápida, sin garantía de óptimo.']);

  /* ===================== Nivel 7: rojo-negro ===================== */
  vfPlantilla('bib-n7-rn-def-vf', 7, 'A', 2, ['rn_def'], 'Reglas del rojo-negro', [
    { a: 'La raíz de un árbol rojo-negro es siempre negra.', v: true, e: 'Regla 2 de la clase: la raíz y las hojas NIL son negras.', j: ['Es una de las reglas: la raíz y las hojas (NIL) son negras.', 'Porque la raíz no tiene padre y por tanto es roja.', 'Porque así queda más bonito el dibujo.'] },
    { a: 'En un rojo-negro un nodo rojo puede tener un hijo rojo siempre que el otro hijo sea negro.', v: false, e: 'Un nodo rojo no puede tener hijos rojos.', j: ['La regla dice que un nodo rojo no puede tener hijos rojos (ninguno).', 'Se permite un hijo rojo si el otro es negro.', 'Los nodos rojos siempre tienen hijos rojos.'] },
    { a: 'Todo camino de un nodo a sus hojas NIL tiene el mismo número de nodos negros.', v: true, e: 'Es la altura negra.', j: ['Es la regla de la altura negra del rojo-negro.', 'Solo se cumple en el camino más corto.', 'Es una propiedad del AVL, no del rojo-negro.'] },
    { a: 'Un árbol rojo-negro siempre tiene exactamente la mitad de sus nodos rojos.', v: false, e: 'No hay una proporción fija de rojos y negros.', j: ['Las reglas no fijan ninguna proporción: solo prohíben dos rojos seguidos y exigen igual altura negra.', 'Es necesario para que el árbol esté balanceado.', 'La mitad son rojos para cumplir la altura negra.'] },
    { a: 'En un rojo-negro el camino más largo de la raíz a una hoja es a lo sumo el doble del más corto.', v: true, e: 'Por la altura negra y porque no hay dos rojos seguidos.', j: ['Misma altura negra y sin rojos seguidos: el camino más largo alterna rojo-negro, a lo sumo el doble.', 'Porque es un árbol perfecto.', 'Porque los caminos tienen la misma longitud.'] },
    { a: 'Las hojas NIL de un rojo-negro cuentan como nodos negros.', v: true, e: 'Así lo indica la clase al contar la altura negra.', j: ['La regla 2 dice que las hojas NIL son negras y se cuentan en la altura negra.', 'Las hojas NIL son rojas.', 'Las hojas NIL no se cuentan.'] },
    { a: 'Un árbol rojo-negro garantiza búsqueda, inserción y eliminación en O(log n) en el peor caso.', v: true, e: 'La altura total es O(log n).', j: ['Como el camino más largo es a lo sumo el doble del más corto, la altura es O(log n).', 'Solo la búsqueda es O(log n).', 'Garantiza O(1).'] },
    { a: 'Un nodo rojo con un único hijo real (negro) es válido en un árbol rojo-negro.', v: false, e: 'Los caminos por el lado vacío (NIL) y por el hijo tendrían distinto número de negros.', j: ['El camino por el lado vacío tiene menos negros que el camino por el hijo negro: se rompe la altura negra.', 'Es válido porque el hijo es negro.', 'Es válido porque el nodo es rojo.'] }
  ], ['Recuerda las cuatro reglas: color, raíz/NIL negros, no dos rojos seguidos, misma altura negra.', 'NIL cuenta como negro.', 'Camino más largo ≤ 2 × camino más corto.']);

  B({
    id: 'bib-n7-rn-violacion', n: 7, e: 'A', dif: 2, c: ['rn_def'], tema: 'Regla violada del rojo-negro',
    gen(rng, K) {
      const a = rng.int(10, 30), b = rng.int(31, 60), c = rng.int(61, 90);
      const R = ['La raíz debe ser negra.', 'Un nodo rojo no puede tener hijos rojos.', 'Todos los caminos a las hojas NIL deben tener el mismo número de nodos negros.', 'Las hojas NIL deben ser negras.'];
      const E = [
        ['El nodo ' + b + ' es la raíz del árbol y está pintado de **rojo**.', 0],
        ['El nodo ' + a + ' es rojo y su hijo izquierdo ' + (a - 5) + ' también es rojo.', 1],
        ['El camino ' + b + ' → ' + a + ' → NIL contiene 3 nodos negros (contando NIL) y el camino ' + b + ' → ' + c + ' → NIL contiene 2.', 2],
        ['Se pintó de **rojo** una hoja NIL (un hijo ausente).', 3]
      ];
      const [txt, k] = rng.pick(E);
      return Object.assign(K.mc(rng, 'En un árbol coloreado se observa lo siguiente: ' + txt + ' ¿Qué regla del rojo-negro se viola?', [[R[k], 'Es exactamente la regla que describe la situación.']], R.filter((_, i) => i !== k).map(x => [x, 'Esa regla no es la violada en este caso.'])), {
        pistas: ['Repasa las cuatro reglas: color rojo/negro, raíz y NIL negros, no dos rojos seguidos, misma altura negra.', 'Fíjate en qué dice la observación: ¿habla de la raíz, de un padre y su hijo, de la cuenta de negros por camino o de las hojas?', 'Compara la observación con cada regla una por una.'],
        explicacion: 'La regla violada es: «' + R[k] + '» (S7-C1, diap. 22).'
      });
    }
  });

  B({
    id: 'bib-n7-rn-ins-caso', n: 7, e: 'B', dif: 3, c: ['rn_ins'], tema: 'Casos de inserción rojo-negro',
    gen(rng, K) {
      const tioRojo = rng.chance(0.4), padreIzq = rng.chance(0.5), zigzag = rng.chance(0.5);
      const lado = x => x ? 'izquierdo' : 'derecho';
      const nIzq = zigzag ? !padreIzq : padreIzq;   // en línea recta N cuelga del mismo lado que P cuelga de Q
      const caso = tioRojo ? 3 : (zigzag ? 1 : 2);
      const OPC = ['**Caso 1** (zigzag): rotar el padre para alinear y pasar al caso 2.', '**Caso 2** (línea recta): padre negro, abuelo rojo y una rotación; termina.', '**Caso 3** (tío rojo): recolorear padre y tío a negro y abuelo a rojo, y continuar desde el abuelo.', 'No hay nada que reparar.'];
      const enun = 'Se inserta un nodo N (rojo) en un árbol rojo-negro. Su padre P es **rojo** y es hijo **' + lado(padreIzq) + '** del abuelo Q; N es hijo **' + lado(nIzq) + '** de P. El otro hijo de Q (el tío) es ' + (tioRojo ? '**rojo**' : '**negro** (o NIL)') + '. ¿Qué caso aplica?';
      const buenas = [[OPC[caso - 1], 'Es el caso que corresponde a esta configuración.']];
      const malas = OPC.filter((_, i) => i !== caso - 1).map(t => [t, 'No corresponde a esta configuración.']);
      return Object.assign(K.mc(rng, enun, buenas, malas), {
        pistas: ['Primero mira el color del tío: ¿es rojo?', 'Si el tío es negro, mira si N y P están del mismo lado (línea recta) o de lados contrarios (zigzag).', 'Tío rojo → caso 3; tío negro y zigzag → caso 1; tío negro y recta → caso 2.'],
        explicacion: 'Tío rojo → caso 3 (recolorear). Tío negro: N en zigzag respecto a P y Q → caso 1; en línea recta → caso 2 (S7-C1, diap. 24-27).'
      });
    }
  });

  B({
    id: 'bib-n7-rn-ins-raiz', n: 7, e: 'C', dif: 4, c: ['rn_ins'], tema: 'Inserción rojo-negro: raíz final',
    gen(rng, K) {
      const vals = rng.distinct(rng.int(5, 8), 5, 60);
      const base = ET.Biblioteca && ET.Biblioteca.codigo && ET.Biblioteca.codigo.RN;
      const real = base + '\narbol = ArbolRN()\nfor v in ' + K.lst(vals) + ':\n    arbol.insertar(v)\nprint(arbol.raiz.v)\n';
      const esp = +K.run(real).trim();   // la raíz se calcula con el código real de la clase (ET.Biblioteca.codigo.RN)
      const malos = rng.sample(vals.filter(v => v !== esp), 3);
      return Object.assign(K.mc(rng, 'Se insertan estos valores, **en este orden**, en un árbol **rojo-negro** vacío: `' + K.lst(vals) + '` (nodo nuevo rojo; casos 1, 2 y 3; la raíz siempre negra). ¿Qué valor queda en la **raíz** al final?',
        [[String(esp), 'Es la raíz que resulta de aplicar los casos de inserción en cada paso.']], malos.map(v => [String(v), 'No: ese valor no queda en la raíz tras las rotaciones y recoloreos.'])), {
        pistas: ['Inserta uno por uno: cada nodo entra rojo; si el padre es rojo, mira al tío (rojo → recolorear; negro → rotar).', 'Al final la raíz se pinta de negro, pero **puede haber cambiado** por una rotación.', 'Dibuja el árbol tras cada inserción y anota los colores.'],
        explicacion: 'Tras insertar ' + K.lst(vals) + ' el valor de la raíz es **' + esp + '**. Cada inserción puede recolorear o rotar; la raíz solo cambia cuando una rotación sube otro nodo o un recoloreo llega a la raíz.'
      });
    }
  });

  B({
    id: 'bib-n7-rn-del-caso', n: 7, e: 'B', dif: 4, c: ['rn_del'], tema: 'Casos de eliminación rojo-negro',
    gen(rng, K) {
      const caso = rng.int(1, 4), dIzq = rng.chance(0.5);
      const lado = x => x ? 'izquierdo' : 'derecho';
      const cerca = dIzq ? 'izquierdo' : 'derecho', lejos = dIzq ? 'derecho' : 'izquierdo';   // si D es hijo izquierdo, H es el derecho y su hijo más próximo a D es el izquierdo
      const desc = [
        'El hermano H es **rojo**.',
        'El hermano H es **negro** y sus dos hijos son **negros** (NIL cuenta como negro).',
        'El hermano H es **negro**, su hijo **cercano** a D es **rojo** y su hijo **lejano** es **negro**.',
        'El hermano H es **negro** y su hijo **más lejano** a D es **rojo** (el cercano puede ser de cualquier color).'
      ];
      const OPC = [
        '**Caso 1**: H negro, padre rojo y rotar el padre hacia el lado de D; pasa a los casos 2, 3 o 4.',
        '**Caso 2**: H rojo y el negro de más sube al padre (si el padre era rojo, termina).',
        '**Caso 3**: intercambiar colores de H y su hijo cercano y rotar H en sentido opuesto a D; pasa al caso 4.',
        '**Caso 4**: H toma el color del padre, padre y sobrino lejano negros, rotar el padre hacia D; termina.'
      ];
      const enun = 'Al eliminar un nodo negro de un rojo-negro queda un **doble negro** D, hijo **' + lado(dIzq) + '** de su padre P. ' + desc[caso - 1] + ' ¿Qué caso de eliminación aplica y qué se hace?';
      return Object.assign(K.mc(rng, enun, [[OPC[caso - 1], 'Es el caso que describe la situación.']], OPC.filter((_, i) => i !== caso - 1).map(t => [t, 'No corresponde a esta situación.'])), {
        pistas: ['Mira primero el color del hermano H.', 'Si H es negro, mira el color de sus hijos (los «sobrinos»): cercano y lejano a D.', 'H rojo → 1; H negro con sobrinos negros → 2; cercano rojo y lejano negro → 3; lejano rojo → 4.'],
        explicacion: 'Caso ' + caso + ' (S7-C1, diap. 28-32). ' + OPC[caso - 1].replace(/\*\*/g, '') + ' (Aquí D es hijo ' + lado(dIzq) + ' de P: el sobrino cercano es el hijo ' + cerca + ' de H y el lejano, el ' + lejos + '.)'
      });
    }
  });

  vfPlantilla('bib-n7-rn-del-vf', 7, 'B', 3, ['rn_del', 'rn_def'], 'Eliminación en el rojo-negro', [
    { a: 'Eliminar un nodo rojo de un árbol rojo-negro exige reparar el árbol.', v: false, e: 'Borrar un nodo rojo no altera nada.', j: ['Un nodo rojo no cuenta en la altura negra ni puede romper la regla de los rojos.', 'Siempre queda un doble negro.', 'Hay que repintar la raíz de rojo.'] },
    { a: 'Eliminar un nodo negro puede dejar un doble negro que se traslada hacia arriba.', v: true, e: 'Borrar un negro quita un negro de ese camino: el hueco queda como doble negro.', j: ['Borrar un negro quita un negro de ese camino; ese negro de más se traslada hacia arriba.', 'El doble negro aparece al borrar un nodo rojo.', 'El doble negro nunca se traslada.'] },
    { a: 'En el caso 4 de la eliminación (sobrino lejano rojo) el rebalanceo termina.', v: true, e: 'El árbol queda equilibrado.', j: ['Tras recolorear y rotar el padre hacia el lado del doble negro, se restablece la altura negra.', 'Siempre hay que repetir el caso 1.', 'El caso 4 nunca termina.'] },
    { a: 'En el caso 1 (hermano rojo) el árbol queda equilibrado de inmediato.', v: false, e: 'Convierte la situación en el caso 2, 3 o 4.', j: ['Tras rotar y recolorear el hermano pasa a ser negro: se pasa a los casos 2, 3 o 4.', 'Termina porque el hermano es rojo.', 'Se elimina el hermano.'] },
    { a: 'En el caso 2 (hermano y sobrinos negros) el hermano se pinta de rojo y el negro de más sube al padre.', v: true, e: 'Si el padre era rojo pasa a negro y termina; si era negro, queda doble negro y se repite más arriba.', j: ['Es la acción del caso 2: H rojo y la deuda sube a P.', 'El hermano se pinta de negro.', 'Se rota el padre.'] },
    { a: 'Si el doble negro llega a la raíz, simplemente se ignora (la raíz queda negra).', v: true, e: 'La clase dice: hasta que lo absorba un nodo rojo o llegue a la raíz.', j: ['Un negro de más en la raíz no rompe la altura negra relativa de ningún camino.', 'Hay que rotar la raíz.', 'El árbol queda inválido.'] },
    { a: 'En el caso 3 el hermano se rota en el mismo sentido en que está el doble negro.', v: false, e: 'Se rota H en sentido **opuesto** a D.', j: ['El caso 3 rota H en sentido opuesto a D para llevar el rojo al lado lejano (caso 4).', 'Siempre se rota hacia D.', 'No se rota en el caso 3.'] },
    { a: 'Al eliminar un nodo con dos hijos en un rojo-negro se usa el sucesor inorden (el mínimo del subárbol derecho).', v: true, e: 'Así lo indica la clase: se intercambia con su sucesor y se borra una hoja.', j: ['La clase usa el sucesor inorden: el mínimo del subárbol derecho.', 'Se usa el mayor del subárbol izquierdo siempre.', 'Se elimina el hijo izquierdo.'] }
  ], ['Borrar un rojo no altera nada; borrar un negro deja un doble negro.', 'Los 4 casos dependen del color del hermano y de sus hijos (sobrinos); NIL cuenta como negro.', 'Casos 1 y 3 no terminan; el 4 sí; el 2 sube el problema.']);

  vfPlantilla('bib-n7-rn-ins-vf', 7, 'A', 3, ['rn_ins', 'rn_def'], 'Inserción en el rojo-negro (V/F)', [
    { a: 'En un rojo-negro el nodo nuevo se inserta de color negro para no romper la altura negra.', v: false, e: 'El nodo nuevo entra **rojo**: un negro nuevo cambiaría de golpe la altura negra de su camino.', j: ['Un rojo no añade nodos negros al camino, así que no rompe la altura negra; solo puede dejar dos rojos seguidos.', 'Un nodo negro nunca rompe nada.', 'Porque la raíz es negra.'] },
    { a: 'Si el padre del nodo nuevo es negro, la inserción termina sin reparar nada.', v: true, e: 'Un rojo bajo un negro no viola ninguna regla.', j: ['No hay dos rojos seguidos ni cambia la altura negra.', 'Siempre hay que rotar.', 'Hay que pintar el padre de rojo.'] },
    { a: 'Con el tío rojo (caso 3) basta recolorear: padre y tío a negro y abuelo a rojo, sin rotaciones.', v: true, e: 'Después se continúa desde el abuelo.', j: ['El caso 3 solo recolorea y traslada el problema al abuelo.', 'Hay que rotar el abuelo.', 'Hay que eliminar el tío.'] },
    { a: 'En el caso 1 (zigzag), una sola rotación del padre deja el árbol equilibrado y termina.', v: false, e: 'Esa rotación solo alinea el zigzag y se pasa al caso 2.', j: ['La rotación del caso 1 convierte el zigzag en línea recta; hay que aplicar después el caso 2.', 'El caso 1 siempre termina.', 'En el caso 1 no se rota.'] },
    { a: 'En el caso 2 (línea recta) el padre pasa a negro, el abuelo a rojo, se rota el abuelo y termina.', v: true, e: 'Una rotación sube el padre a la raíz local.', j: ['Con una rotación y ese recoloreo se restablecen las reglas.', 'Hay que repetir el caso 3.', 'Se rota el hijo.'] },
    { a: 'Al terminar una inserción la raíz puede quedar roja.', v: false, e: 'Siempre se cambia el color del nodo raíz a negro.', j: ['El algoritmo siempre pinta la raíz de negro al final (el caso 3 podría dejarla roja).', 'La raíz es roja si el árbol tiene un solo nodo.', 'La raíz no tiene color.'] },
    { a: 'El caso 3 puede repetirse subiendo por el árbol, porque el abuelo, ahora rojo, puede tener un padre rojo.', v: true, e: 'Se continúa con N = Q.', j: ['Tras recolorear el abuelo queda rojo y puede violar la regla con su propio padre.', 'El caso 3 nunca se repite.', 'El abuelo pasa a negro.'] },
    { a: 'El caso decide por el color del tío: tío rojo → recolorear; tío negro → rotar.', v: true, e: 'El tío negro incluye NIL y nodos negros reales.', j: ['Es el criterio del algoritmo de rebalanceo de la clase.', 'Se decide por el factor de balance.', 'Se decide por el valor insertado.'] }
  ], ['El nodo nuevo entra rojo; el problema son los dos rojos seguidos.', 'Tío rojo → recolorear y subir; tío negro → rotar (caso 1 si zigzag, caso 2 si recta).', 'La raíz queda siempre negra.']);

  clasificarPlantilla('bib-n7-rn-avl-clasificar', 7, 'B', 3, ['rn_vs', 'av_compara'], 'AVL frente a rojo-negro',
    'Clasifica cada característica o situación: ¿corresponde al **AVL** o al **rojo-negro**?',
    ['AVL', 'Rojo-negro'],
    [['Balance más estricto: |hi − hd| ≤ 1', 'AVL', 'El AVL exige diferencia de alturas de a lo sumo 1.'],
    ['Balance más laxo', 'Rojo-negro', 'Permite que un lado sea hasta el doble de alto.'],
    ['Altura más baja: búsquedas más rápidas', 'AVL', 'Por el balance estricto.'],
    ['Menos rotaciones al insertar o eliminar', 'Rojo-negro', 'Invierte menos en rebalancear.'],
    ['Más rotaciones al insertar o eliminar', 'AVL', 'Invierte más en mantenerse bajito.'],
    ['Conviene cuando dominan las búsquedas (índices de bases de datos)', 'AVL', 'Mejor para lectura.'],
    ['Conviene cuando dominan las inserciones y borrados', 'Rojo-negro', 'Mejor para escritura.'],
    ['Lo usan `std::map` de C++, `TreeMap` de Java y el planificador de Linux', 'Rojo-negro', 'Ejemplos de uso real mencionados en la clase.'],
    ['Cada nodo guarda una altura (factor de balance)', 'AVL', 'El criterio es el factor alt(izq) − alt(der).'],
    ['Cada nodo guarda un color y se cuenta la altura negra', 'Rojo-negro', 'El criterio son los colores.']],
    ['AVL = más estricto, más bajo, lecturas; rojo-negro = más laxo, menos rotaciones, escrituras.', 'AVL usa factor de balance; rojo-negro usa colores.', 'Ambos son O(log n).'],
    'AVL: balance estricto, altura baja, más rotaciones, mejor para lectura. Rojo-negro: balance laxo, menos rotaciones, mejor para escritura (S7-C1, diap. 33).');
})(typeof window !== 'undefined' ? window : globalThis);
