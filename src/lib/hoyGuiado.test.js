// Tests de Hoy guiado (src/lib/hoyGuiado.js). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aMinutos, examenToca, pasoActual, pasosDeHoy } from './hoyGuiado.js';

const a = (h, m = 0) => new Date(2026, 11, 1, h, m);
const base = { hayContenido: true, inicialesPendientes: 0, hayCita: true, retoAceptado: false, examenHecho: false, examenToca: false };

test('aMinutos: acepta HH:MM y HH:MM:SS, y rechaza lo que no es una hora', () => {
  assert.equal(aMinutos('21:30'), 21 * 60 + 30);
  assert.equal(aMinutos('08:00:00'), 480);
  assert.equal(aMinutos('00:00'), 0);
  for (const malo of ['24:00', '8:00', '', null, undefined, 'tarde']) assert.equal(aMinutos(malo), null, String(malo));
});

test('examenToca: a partir de la hora elegida, y no antes', () => {
  assert.equal(examenToca(a(21, 29), '21:30'), false);
  assert.equal(examenToca(a(21, 30), '21:30'), true);
  assert.equal(examenToca(a(23, 59), '21:30'), true);
  assert.equal(examenToca(a(8, 0), '21:30'), false);
  assert.equal(examenToca(a(0, 10), '21:30'), false); // pasada la medianoche empieza otro día
  assert.equal(examenToca(a(20, 0), '20:00:00'), true); // como lo devuelve Postgres
});

test('examenToca: sin hora válida usa la de por defecto (21:30)', () => {
  assert.equal(examenToca(a(21, 29), undefined), false);
  assert.equal(examenToca(a(21, 30), undefined), true);
  assert.equal(examenToca(a(22, 0), 'rara'), true);
  assert.equal(examenToca(a(21, 0), 'rara'), false);
});

test('por la mañana, sin nada hecho: la frase y el reto, por ese orden', () => {
  assert.deepEqual(pasosDeHoy(base), ['frase', 'reto']);
});

test('con las preguntas iniciales pendientes van primero', () => {
  assert.deepEqual(pasosDeHoy({ ...base, inicialesPendientes: 3 }), ['iniciales', 'frase', 'reto']);
});

test('con el reto aceptado y antes de la hora del examen, está al día', () => {
  assert.deepEqual(pasosDeHoy({ ...base, retoAceptado: true }), []);
});

test('por la noche: con el reto aceptado solo falta el examen; sin aceptarlo, la frase, el reto y el examen', () => {
  assert.deepEqual(pasosDeHoy({ ...base, retoAceptado: true, examenToca: true }), ['examen']);
  assert.deepEqual(pasosDeHoy({ ...base, examenToca: true }), ['frase', 'reto', 'examen']);
});

test('con el examen hecho no vuelve a salir', () => {
  assert.deepEqual(pasosDeHoy({ ...base, retoAceptado: true, examenToca: true, examenHecho: true }), []);
});

test('sin cita no hay paso de frase; sin contenido no hay pasos', () => {
  assert.deepEqual(pasosDeHoy({ ...base, hayCita: false }), ['reto']);
  assert.deepEqual(pasosDeHoy({ ...base, hayContenido: false, inicialesPendientes: 5, examenToca: true }), []);
});

test('pasoActual: el primero que falta, saltando la frase ya leída; null cuando está al día', () => {
  assert.equal(pasoActual(['frase', 'reto']), 'frase');
  assert.equal(pasoActual(['frase', 'reto'], { fraseVista: true }), 'reto');
  assert.equal(pasoActual(['iniciales', 'frase', 'reto'], { fraseVista: true }), 'iniciales');
  assert.equal(pasoActual(['frase'], { fraseVista: true }), null);
  assert.equal(pasoActual([]), null);
  assert.equal(pasoActual(['reto', 'examen'], { fraseVista: true }), 'reto');
});
