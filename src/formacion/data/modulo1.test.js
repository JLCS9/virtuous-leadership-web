// Tests del Módulo 1 — datos + flujoModulo.js. `npm test`.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { MODULO_1 } from './modulo1.js';
import {
  pasosDelUsuario, pasosVisibles, indicePaso, siguientePaso,
  pasoAnterior, videoAnterior, progresoModulo, progresoActividad,
  continuarModulo, moduloDelPaso,
} from '../flujoModulo.js';

const PASOS = MODULO_1.pasos;
const TIPOS_VALIDOS = new Set(['video', 'quiz', 'define', 'desliza', 'identifica', 'test_profundo', 'test_caracter', 'noop', 'cierre']);
const TEMPERAMENTOS = ['COL', 'MEL', 'SAN', 'FLE'];

// ── Integridad de datos ──

describe('modulo1 — estructura', () => {
  test('tiene 28 pasos', () => {
    assert.equal(PASOS.length, 28);
  });

  test('todos los pasos tienen id y tipo válido', () => {
    for (const p of PASOS) {
      assert.ok(p.id, `paso sin id: ${JSON.stringify(p)}`);
      assert.ok(TIPOS_VALIDOS.has(p.tipo), `tipo inválido '${p.tipo}' en ${p.id}`);
    }
  });

  test('ids únicos', () => {
    const ids = PASOS.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('9 vídeos visibles', () => {
    const videos = PASOS.filter((p) => p.tipo === 'video');
    assert.equal(videos.length, 9);
    assert.ok(videos.every((v) => v.visible === true));
  });

  test('paso de cierre al final', () => {
    assert.equal(PASOS[PASOS.length - 1].tipo, 'cierre');
  });
});

describe('modulo1 — quizzes', () => {
  const quizzes = PASOS.filter((p) => p.tipo === 'quiz');

  test('7 quizzes + 1 identifica = 8 actividades con preguntas', () => {
    assert.equal(quizzes.length, 7);
    const identificas = PASOS.filter((p) => p.tipo === 'identifica');
    assert.equal(identificas.length, 1);
  });

  test('cada quiz tiene 4 preguntas con 4 opciones y correcta válida', () => {
    for (const q of quizzes) {
      assert.ok(q.preguntas, `quiz ${q.id} sin preguntas`);
      assert.equal(q.preguntas.length, 4, `quiz ${q.id}: esperaba 4 preguntas, tiene ${q.preguntas.length}`);
      for (const preg of q.preguntas) {
        assert.ok(preg.texto, `pregunta sin texto en quiz ${q.id}`);
        assert.equal(preg.opciones.length, 4, `pregunta '${preg.texto.slice(0, 30)}' sin 4 opciones`);
        const letras = preg.opciones.map((o) => o.letra);
        assert.deepEqual(letras, ['A', 'B', 'C', 'D']);
        assert.ok(letras.includes(preg.correcta), `correcta '${preg.correcta}' no está entre las opciones`);
      }
    }
  });

  test('quizzes no son visibles', () => {
    assert.ok(quizzes.every((q) => q.visible === false));
  });
});

describe('modulo1 — define', () => {
  const defines = PASOS.filter((p) => p.tipo === 'define');

  test('2 pasos define', () => {
    assert.equal(defines.length, 2);
  });

  test('cada concepto tiene correctas y distractores no vacíos, sin duplicados', () => {
    for (const d of defines) {
      assert.ok(d.conceptos.length > 0, `define ${d.id} sin conceptos`);
      for (const c of d.conceptos) {
        assert.ok(c.nombre, 'concepto sin nombre');
        assert.ok(c.correctas.length > 0, `${c.nombre}: correctas vacías`);
        assert.ok(c.distractores.length > 0, `${c.nombre}: distractores vacías`);
        const todas = [...c.correctas, ...c.distractores];
        assert.equal(new Set(todas).size, todas.length, `${c.nombre}: palabras duplicadas`);
      }
    }
  });

  test('define temperamentos tiene 5 conceptos', () => {
    assert.equal(defines[0].conceptos.length, 5);
  });

  test('define virtudes tiene 6 conceptos', () => {
    assert.equal(defines[1].conceptos.length, 6);
  });
});

describe('modulo1 — desliza', () => {
  const deslizas = PASOS.filter((p) => p.tipo === 'desliza');

  test('1 paso desliza', () => {
    assert.equal(deslizas.length, 1);
  });

  test('6 escenas con correcta válida', () => {
    const d = deslizas[0];
    assert.equal(d.escenas.length, 6);
    const claves = new Set(d.opciones.map((o) => o.clave));
    for (const e of d.escenas) {
      assert.ok(e.texto, 'escena sin texto');
      assert.ok(claves.has(e.correcta), `correcta '${e.correcta}' no está en opciones`);
    }
  });

  test('4 opciones de temperamento', () => {
    const d = deslizas[0];
    assert.equal(d.opciones.length, 4);
    assert.deepEqual(d.opciones.map((o) => o.clave).sort(), [...TEMPERAMENTOS].sort());
  });
});

describe('modulo1 — test_profundo', () => {
  const tests = PASOS.filter((p) => p.tipo === 'test_profundo');

  test('4 tests profundos, uno por temperamento', () => {
    assert.equal(tests.length, 4);
    const temps = tests.map((t) => t.temperamento).sort();
    assert.deepEqual(temps, [...TEMPERAMENTOS].sort());
  });

  test('cada test tiene num_preguntas > 0 y preguntas cargadas', () => {
    for (const t of tests) {
      assert.ok(t.num_preguntas > 0, `${t.id} sin num_preguntas`);
      assert.equal(t.preguntas.length, t.num_preguntas, `${t.id}: num_preguntas (${t.num_preguntas}) ≠ preguntas.length (${t.preguntas.length})`);
      for (const p of t.preguntas) {
        assert.ok(p.texto && p.texto.length > 10, `pregunta vacía en ${t.id}`);
      }
    }
  });

  test('cada test tiene virtud_desafio', () => {
    for (const t of tests) {
      assert.ok(t.virtud_desafio, `${t.id} sin virtud_desafio`);
    }
  });
});

// ── flujoModulo.js con datos reales ──

describe('flujoModulo — pasosDelUsuario', () => {
  test('filtra noops', () => {
    const pasos = pasosDelUsuario(MODULO_1, { primary: 'COL', secondary: 'SAN' });
    assert.ok(pasos.every((p) => p.tipo !== 'noop'));
  });

  test('COL+SAN ve test_profundo COL y SAN, no MEL ni FLE', () => {
    const pasos = pasosDelUsuario(MODULO_1, { primary: 'COL', secondary: 'SAN' });
    const profundos = pasos.filter((p) => p.tipo === 'test_profundo');
    assert.equal(profundos.length, 2);
    assert.deepEqual(profundos.map((p) => p.temperamento).sort(), ['COL', 'SAN']);
  });

  test('MEL+FLE ve test_profundo MEL y FLE', () => {
    const pasos = pasosDelUsuario(MODULO_1, { primary: 'MEL', secondary: 'FLE' });
    const profundos = pasos.filter((p) => p.tipo === 'test_profundo');
    assert.equal(profundos.length, 2);
    assert.deepEqual(profundos.map((p) => p.temperamento).sort(), ['FLE', 'MEL']);
  });

  test('sin temperamento, no ve ningún test_profundo', () => {
    const pasos = pasosDelUsuario(MODULO_1, null);
    assert.ok(pasos.every((p) => p.tipo !== 'test_profundo'));
  });

  test('todos los pasos no-condicionales se mantienen', () => {
    const pasos = pasosDelUsuario(MODULO_1, { primary: 'COL', secondary: 'SAN' });
    const sinCondicionales = PASOS.filter((p) => p.tipo !== 'noop' && p.tipo !== 'test_profundo');
    for (const p of sinCondicionales) {
      assert.ok(pasos.find((x) => x.id === p.id), `falta paso ${p.id}`);
    }
  });
});

describe('flujoModulo — pasosVisibles', () => {
  test('solo devuelve pasos con visible: true', () => {
    const pasos = pasosDelUsuario(MODULO_1, { primary: 'COL', secondary: 'SAN' });
    const visibles = pasosVisibles(pasos);
    assert.ok(visibles.every((p) => p.visible === true));
    assert.equal(visibles.length, 10); // 9 videos + cierre
  });
});

describe('flujoModulo — navegación', () => {
  const pasos = pasosDelUsuario(MODULO_1, { primary: 'COL', secondary: 'MEL' });

  test('siguientePaso del primer paso es el segundo', () => {
    const sig = siguientePaso(pasos, pasos[0].id);
    assert.equal(sig.id, pasos[1].id);
  });

  test('siguientePaso del último es null', () => {
    const sig = siguientePaso(pasos, pasos[pasos.length - 1].id);
    assert.equal(sig, null);
  });

  test('pasoAnterior del primero es null', () => {
    const ant = pasoAnterior(pasos, pasos[0].id);
    assert.equal(ant, null);
  });

  test('indicePaso encuentra el paso correcto', () => {
    assert.equal(indicePaso(pasos, 'm1-01'), 0);
    assert.equal(indicePaso(pasos, 'inexistente'), -1);
  });
});

describe('flujoModulo — videoAnterior', () => {
  const pasos = pasosDelUsuario(MODULO_1, { primary: 'SAN', secondary: 'FLE' });

  test('desde el primer paso no hay video anterior', () => {
    assert.equal(videoAnterior(pasos, pasos[0].id), null);
  });

  test('desde paso 3 (quiz) el video anterior es paso 1', () => {
    assert.equal(videoAnterior(pasos, 'm1-03')?.id, 'm1-01');
  });
});

describe('flujoModulo — progresoModulo', () => {
  const pasos = pasosDelUsuario(MODULO_1, { primary: 'COL', secondary: 'SAN' });

  test('sin completados, 0%', () => {
    const p = progresoModulo(pasos, {});
    assert.equal(p.hechos, 0);
    assert.equal(p.porcentaje, 0);
    assert.equal(p.completo, false);
  });

  test('con todos completados, 100%', () => {
    const completados = {};
    for (const paso of pasos) completados[paso.id] = true;
    const p = progresoModulo(pasos, completados);
    assert.equal(p.porcentaje, 100);
    assert.equal(p.completo, true);
  });
});

describe('flujoModulo — progresoActividad', () => {
  test('quiz devuelve nº preguntas', () => {
    const quiz = PASOS.find((p) => p.id === 'm1-03');
    assert.equal(progresoActividad(quiz), 4);
  });

  test('define devuelve nº conceptos', () => {
    const def = PASOS.find((p) => p.id === 'm1-02');
    assert.equal(progresoActividad(def), 5);
  });

  test('desliza devuelve nº escenas', () => {
    const des = PASOS.find((p) => p.id === 'm1-11');
    assert.equal(progresoActividad(des), 6);
  });

  test('test_profundo devuelve num_preguntas', () => {
    const tp = PASOS.find((p) => p.id === 'm1-17');
    assert.equal(progresoActividad(tp), 14);
  });

  test('video devuelve 0', () => {
    const vid = PASOS.find((p) => p.id === 'm1-01');
    assert.equal(progresoActividad(vid), 0);
  });
});

describe('flujoModulo — continuarModulo', () => {
  const pasos = pasosDelUsuario(MODULO_1, { primary: 'COL', secondary: 'SAN' });

  test('sin completados, continúa desde el primer paso', () => {
    assert.equal(continuarModulo(pasos, {})?.id, pasos[0].id);
  });

  test('con primer paso hecho, continúa desde el segundo', () => {
    assert.equal(continuarModulo(pasos, { [pasos[0].id]: true })?.id, pasos[1].id);
  });
});

describe('flujoModulo — moduloDelPaso', () => {
  const pasos = pasosDelUsuario(MODULO_1, { primary: 'MEL', secondary: 'FLE' });

  test('primer video es módulo 1 de 9', () => {
    const l = moduloDelPaso(pasos, 'm1-01');
    assert.deepEqual(l, { numero: 1, total: 9 });
  });

  test('paso no-video devuelve null', () => {
    assert.equal(moduloDelPaso(pasos, 'm1-03'), null);
  });
});
