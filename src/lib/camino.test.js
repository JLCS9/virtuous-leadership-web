// Tests de la lógica del Camino (fechas, racha, siguiente paso). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularInicio, diaDelCamino, diaIso, fechaDelDia, racha, siguientePaso } from './camino.js';

test('día ISO de la semana', () => {
  assert.equal(diaIso('2026-11-02'), 1); // lunes
  assert.equal(diaIso('2026-11-01'), 7); // domingo
});

test('el camino empieza el primer día del vídeo, hoy incluido', () => {
  assert.equal(calcularInicio(7, '2026-11-01'), '2026-11-01');
  assert.equal(calcularInicio(1, '2026-11-01'), '2026-11-02');
  assert.equal(calcularInicio(6, '2026-11-02'), '2026-11-07');
});

test('día del camino', () => {
  assert.equal(diaDelCamino('2026-11-02', '2026-11-01'), 0);
  assert.equal(diaDelCamino('2026-11-02', '2026-11-02'), 1);
  assert.equal(diaDelCamino('2026-11-02', '2026-11-15'), 14);
  assert.equal(diaDelCamino('2026-10-26', '2026-11-02'), 8); // cruza el cambio de hora
  assert.equal(fechaDelDia('2026-11-02', 8), '2026-11-09');
});

test('racha: días seguidos con actividad, desde hoy o ayer', () => {
  const en = (f) => new Date(`${f}T20:00:00`).toISOString();
  const dias = [{ sesion_en: en('2026-11-01') }, { examen_en: en('2026-11-02') }, { sesion_en: en('2026-11-03') }];
  assert.equal(racha(dias, '2026-11-03'), 3);
  assert.equal(racha(dias, '2026-11-04'), 3);
  assert.equal(racha(dias, '2026-11-05'), 0);
  assert.equal(racha([], '2026-11-05'), 0);
});

test('siguiente paso', () => {
  assert.equal(siguientePaso({ diaHoy: 0, porDia: {} }), null);
  assert.deepEqual(siguientePaso({ diaHoy: 2, porDia: {} }), { tipo: 'sesion', dia: 2 });
  assert.deepEqual(siguientePaso({ diaHoy: 2, porDia: { 2: { sesion_en: 'x' } } }), { tipo: 'examen', dia: 2 });
  assert.deepEqual(siguientePaso({ diaHoy: 2, porDia: { 2: { sesion_en: 'x', examen_en: 'x' } } }), { tipo: 'sesion', dia: 1, atrasada: true });
  assert.deepEqual(siguientePaso({ diaHoy: 7, porDia: Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((d) => [d, { sesion_en: 'x' }])) }), { tipo: 'hecho', dia: 7 });
});
