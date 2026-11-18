// Tests de la racha y la tira de días (src/lib/rachaDias.js). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rachaDeCompromisos, tiraDeDias } from './rachaDias.js';

const acepta = (...fechas) => fechas.map((fecha) => ({ fecha, opcion: 'persona' }));

test('racha: días seguidos con un reto aceptado, contando hoy', () => {
  assert.equal(rachaDeCompromisos([], '2026-12-05'), 0);
  assert.equal(rachaDeCompromisos(acepta('2026-12-05'), '2026-12-05'), 1);
  assert.equal(rachaDeCompromisos(acepta('2026-12-03', '2026-12-04', '2026-12-05'), '2026-12-05'), 3);
});

test('racha: si hoy aún no ha aceptado, no se rompe hasta que acabe el día', () => {
  assert.equal(rachaDeCompromisos(acepta('2026-12-03', '2026-12-04'), '2026-12-05'), 2);
  // Ayer tampoco: la racha se ha roto.
  assert.equal(rachaDeCompromisos(acepta('2026-12-02', '2026-12-03'), '2026-12-05'), 0);
});

test('racha: un hueco corta; solo cuenta lo aceptado y el orden de los datos da igual', () => {
  const dias = [...acepta('2026-12-05', '2026-12-03', '2026-12-02'), { fecha: '2026-12-04', opcion: null }]; // el 4 se abrió pero no se aceptó
  assert.equal(rachaDeCompromisos(dias, '2026-12-05'), 1);
});

test('racha: cruza el cambio de mes y de año', () => {
  assert.equal(rachaDeCompromisos(acepta('2026-12-30', '2026-12-31', '2027-01-01'), '2027-01-01'), 3);
  assert.equal(rachaDeCompromisos(acepta('2027-02-27', '2027-02-28', '2027-03-01'), '2027-03-01'), 3);
});

test('tira: dos días antes, hoy y cinco después, en orden', () => {
  const tira = tiraDeDias([], '2026-12-10'); // jueves
  assert.equal(tira.length, 8);
  assert.deepEqual(tira.map((d) => d.fecha), ['2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11', '2026-12-12', '2026-12-13', '2026-12-14', '2026-12-15']);
  assert.deepEqual(tira.map((d) => d.posicion), ['pasado', 'pasado', 'hoy', 'futuro', 'futuro', 'futuro', 'futuro', 'futuro']);
  assert.deepEqual(tira.map((d) => d.diaSemana), [2, 3, 4, 5, 6, 7, 1, 2]); // martes … martes
  assert.deepEqual(tira.map((d) => d.dia), [8, 9, 10, 11, 12, 13, 14, 15]);
});

test('tira: marca los días con reto aceptado y cruza el fin de mes', () => {
  const tira = tiraDeDias([...acepta('2026-12-30', '2027-01-01'), { fecha: '2026-12-31', opcion: null }], '2027-01-01');
  assert.deepEqual(tira.map((d) => [d.fecha, d.hecho]), [
    ['2026-12-30', true], ['2026-12-31', false], ['2027-01-01', true], ['2027-01-02', false],
    ['2027-01-03', false], ['2027-01-04', false], ['2027-01-05', false], ['2027-01-06', false],
  ]);
});

test('tira: los números de días anteriores y siguientes se pueden cambiar', () => {
  assert.equal(tiraDeDias([], '2026-12-10', { antes: 1, despues: 2 }).length, 4);
  assert.equal(tiraDeDias([], '2026-12-10', { antes: 0, despues: 0 })[0].posicion, 'hoy');
});
