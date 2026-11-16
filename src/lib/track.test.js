import test from 'node:test';
import assert from 'node:assert/strict';
import { eventosCompletado, track, trackPaso } from './track.js';

const nombres = (evs) => evs.map((e) => e.event);

test('vídeo → video_viewed, sin tipo ni puntuación', () => {
  const evs = eventosCompletado({ curso: 1, pasoId: 'm1-01', tipo: 'video', modulo: 1 });
  assert.deepEqual(nombres(evs), ['video_viewed']);
  assert.deepEqual(evs[0].params, { curso: 1, paso_id: 'm1-01', modulo: 1, repeticion: false });
});

test('quiz → activity_completed con aciertos, total y aprobado', () => {
  const evs = eventosCompletado({
    curso: 2, pasoId: 'm2-03', tipo: 'quiz', modulo: 2,
    resultado: { aciertos: 3, total: 4 }, aprobado: true,
  });
  assert.deepEqual(nombres(evs), ['activity_completed']);
  assert.equal(evs[0].params.tipo, 'quiz');
  assert.equal(evs[0].params.aciertos, 3);
  assert.equal(evs[0].params.total, 4);
  assert.equal(evs[0].params.aprobado, true);
});

test('aprobado=null (tipo no evaluable) no se envía', () => {
  const evs = eventosCompletado({ curso: 1, pasoId: 'x', tipo: 'lectura', aprobado: null });
  assert.equal('aprobado' in evs[0].params, false);
});

test('repetir un paso ya hecho marca repeticion=true', () => {
  const evs = eventosCompletado({ curso: 1, pasoId: 'x', tipo: 'quiz', previo: { fecha: '2026-11-01' } });
  assert.equal(evs[0].params.repeticion, true);
});

test('conclusion_modulo emite también module_completed', () => {
  const evs = eventosCompletado({ curso: 3, pasoId: 'm3-09', tipo: 'conclusion_modulo', modulo: 3 });
  assert.deepEqual(nombres(evs), ['activity_completed', 'module_completed']);
});

test('cierre emite también course_completed', () => {
  const evs = eventosCompletado({ curso: 5, pasoId: 'm5-cierre', tipo: 'cierre' });
  assert.deepEqual(nombres(evs), ['activity_completed', 'course_completed']);
});

test('proyecto_mision en borrador no emite nada; terminado sí', () => {
  assert.deepEqual(eventosCompletado({ curso: 1, pasoId: 'p', tipo: 'proyecto_mision', resultado: { completado: false } }), []);
  const evs = eventosCompletado({ curso: 1, pasoId: 'p', tipo: 'proyecto_mision', resultado: { completado: true } });
  assert.deepEqual(nombres(evs), ['activity_completed', 'course_completed']);
});

test('proyecto_mision: un borrador previo no cuenta como repetición', () => {
  const evs = eventosCompletado({
    curso: 1, pasoId: 'p', tipo: 'proyecto_mision',
    resultado: { completado: true }, previo: { completado: false },
  });
  assert.equal(evs[0].params.repeticion, false);
});

test('NUNCA viajan textos libres del usuario', () => {
  const evs = eventosCompletado({
    curso: 1, pasoId: 'x', tipo: 'test_profundo',
    resultado: { respuestas: ['texto privado'], proposito: 'mi misión' },
  });
  assert.ok(!JSON.stringify(evs).includes('texto privado'));
  assert.ok(!JSON.stringify(evs).includes('mi misión'));
});

test('track empuja a window.dataLayer', () => {
  globalThis.window = { dataLayer: [] };
  track('video_viewed', { curso: 1 });
  assert.deepEqual(globalThis.window.dataLayer, [{ event: 'video_viewed', curso: 1 }]);
  delete globalThis.window;
});

test('trackPaso ignora irA(null) y emite al entrar en un paso', () => {
  globalThis.window = { dataLayer: [] };
  trackPaso({ curso: 1, pasoId: null, totalPasos: 20 });
  assert.equal(globalThis.window.dataLayer.length, 0);
  trackPaso({ curso: 1, pasoId: 'm1-02', totalPasos: 20, completados: 3 });
  assert.deepEqual(globalThis.window.dataLayer, [
    { event: 'formacion_step_view', curso: 1, paso_id: 'm1-02', total_pasos: 20, completados: 3 },
  ]);
  delete globalThis.window;
});
