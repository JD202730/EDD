/* banco_retiro.js — preguntas «básicas» retiradas del entrenamiento.
   El parcial del profesor no pregunta «¿qué imprime este código?» ni vocabulario suelto: pide justificar, trazar con tablas,
   decidir complejidades con variable/caso/regla y programar con casos borde. Estas plantillas siguen registradas (los errores
   guardados de sesiones anteriores se pueden abrir y la validación del banco las sigue probando), pero ya no se sirven en
   práctica ni en exámenes. Para volver a activarlas: quita su id de esta lista (o borra este archivo). */
(function (global) {
  'use strict';
  const ET = global.ET;
  const RETIRADAS = [
    // nivel 1: leer código y adivinar la salida, definiciones sueltas
    'n1-pila-prof', 'n1-traza-valor', 'n1-ida-vuelta', 'n1-contar-llamadas', 'n1-cache', 'n1-comp', 'n1-base-linea', 'n1-vf',
    // nivel 2
    'n2-conteo', 'n2-pred-tiempo',
    // nivel 4: vocabulario y lectura de datos de un diagrama
    'n4-vocab', 'n4-prof-alt', 'n4-perfecto-formula', 'n4-acceso-nodo', 'n4-vf',
    // niveles 7 y 8
    'n7-altura-vacio', 'n8-lee-codigo-arbol'
  ];
  ET.Banco.RETIRADAS = RETIRADAS;
  RETIRADAS.forEach(id => { if (ET.Banco.porId[id]) ET.Banco.porId[id].basica = true; });
})(typeof window !== 'undefined' ? window : globalThis);
