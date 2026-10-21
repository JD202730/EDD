/* pruebas.js — arneses de prueba (se ejecutan en el navegador) */
(function () {
  'use strict';
  const out = document.getElementById('out');
  const log = (s) => { out.textContent += s + '\n'; };
  const post = (name, data) => fetch('/' + name, { method: 'POST', body: JSON.stringify(data) }).then(r => r.text()).catch(e => 'sin servidor: ' + e);

  async function pruebaPython() {
    out.textContent = '';
    const res = [];
    for (let i = 0; i < window.SNIPPETS.length; i++) {
      const code = window.SNIPPETS[i];
      const t0 = performance.now();
      const r = ET.Py.ejecutar(code, { maxSteps: 4000000 });
      res.push({ i, stdout: r.stdout, err: r.ok ? null : r.error.tipo, msg: r.ok ? '' : r.error.msg, ms: Math.round(performance.now() - t0) });
    }
    const w = await post('resultados_py', res);
    log('Fragmentos ejecutados: ' + res.length + ' | servidor: ' + w);
    window.__py = res;
  }
  document.getElementById('btn-py').onclick = pruebaPython;
  window.pruebaPython = pruebaPython;

  async function pruebaAVL() {
    const rng = new ET.U.RNG(424242); const casos = [];
    for (let i = 0; i < 600; i++) {
      const n = rng.int(1, 14); const vals = rng.distinct(n, 1, 60); const av = ET.Arb.construirAVL(vals); const x = rng.pick(vals);
      const d = ET.Arb.delAVL(av.arbol, x, 'suc');
      casos.push({ vals, x, ins: ET.Arb.nota(av.arbol), del: ET.Arb.nota(d.arbol), esAVL: ET.Arb.esAVL(d.arbol) });
    }
    const w = await post('avl_casos', casos);
    out.textContent = 'AVL: ' + casos.length + ' casos | todos AVL tras eliminar: ' + casos.every(c => c.esAVL) + ' | servidor: ' + w + '\n(ejecuta python pruebas/comparar_con_cpython.py para compararlos con CPython)\n';
    return casos.length;
  }
  window.pruebaAVL = pruebaAVL;
  const b = document.getElementById('btn-avl'); if (b) b.onclick = pruebaAVL;})();
