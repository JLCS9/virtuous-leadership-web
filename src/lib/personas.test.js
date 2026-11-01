// Tests de las fichas de personas (puntuación, combinaciones, observaciones). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NO_SE, PREGUNTAS, combinacion, esMenorDe18, idDeClave, claveFicha, necesitaDesempate, ordenAleatorio,
  propuestaPorObservaciones, puntuar,
} from './personas.js';

const N = NO_SE;

test('8 preguntas con una respuesta por temperamento', () => {
  assert.equal(PREGUNTAS.length, 8);
  for (const [, r] of PREGUNTAS) assert.deepEqual(Object.keys(r).sort(), ['COL', 'FLE', 'MEL', 'SAN']);
  const orden = ordenAleatorio();
  assert.equal(orden.length, 8);
  for (const o of orden) assert.deepEqual([...o].sort(), ['COL', 'FLE', 'MEL', 'SAN']);
});

test('primario, secundario y confianza', () => {
  assert.deepEqual(puntuar(['COL', 'COL', 'COL', 'COL', 'COL', 'MEL', 'MEL', 'SAN']).primario, 'COL');
  const alta = puntuar(['COL', 'COL', 'COL', 'COL', 'COL', 'MEL', 'MEL', N]);
  assert.equal(alta.confianza, 'alta');
  assert.equal(alta.secundario, 'MEL');
  const media = puntuar(['COL', 'COL', 'COL', 'COL', 'MEL', 'SAN', N, N]);
  assert.equal(media.confianza, 'media');
  assert.equal(media.secundario, null); // el segundo solo tiene 1 punto
  assert.equal(puntuar(['COL', 'COL', 'COL', 'MEL', 'MEL', 'SAN', 'FLE', N]).confianza, 'baja');
});

test('con 4 o más «No lo sé» no hay resultado', () => {
  const r = puntuar(['COL', 'COL', 'COL', 'MEL', N, N, N, N]);
  assert.equal(r.primario, null);
  assert.equal(necesitaDesempate(['COL', 'MEL', N, N, N, N, 'SAN', 'FLE']), false);
});

test('empate: decide el desempate y si no, la pregunta 1', () => {
  const resp = ['MEL', 'COL', 'COL', 'COL', 'MEL', 'MEL', 'SAN', 'FLE'];
  assert.equal(necesitaDesempate(resp), true);
  assert.equal(puntuar(resp, { rapidez: 'rapido', duracion: 'mucho' }).primario, 'COL');
  assert.equal(puntuar(resp, { rapidez: 'lento', duracion: 'mucho' }).primario, 'MEL');
  // El desempate apunta a uno que no está empatado: gana la pregunta 1.
  assert.equal(puntuar(resp, { rapidez: 'rapido', duracion: 'pronto' }).primario, 'MEL');
  assert.equal(puntuar(resp, { rapidez: 'lento', duracion: 'mucho' }).secundario, 'COL');
});

test('combinaciones en cualquier orden', () => {
  assert.match(combinacion('MEL', 'COL'), /decide rápido/);
  assert.equal(combinacion('COL', 'MEL'), combinacion('MEL', 'COL'));
  assert.match(combinacion('FLE', 'FLE'), /Paz asegurada/);
  assert.equal(combinacion('COL', null), null);
  for (const a of ['COL', 'MEL', 'SAN', 'FLE']) for (const b of ['COL', 'MEL', 'SAN', 'FLE']) assert.ok(combinacion(a, b));
});

test('observaciones: proponen cambio solo si la nueva cambia el temperamento en cabeza', () => {
  const persona = { estado: 'estimado', primario: 'COL', puntos: { COL: 3, MEL: 2, SAN: 2, FLE: 1 } };
  const mel = (id) => ({ id, temperamento: 'MEL' });
  assert.equal(propuestaPorObservaciones(persona, [mel(1)]), null); // 3 – 2,5
  assert.equal(propuestaPorObservaciones(persona, [mel(1), mel(2)]), null); // 3 – 3: empate
  assert.equal(propuestaPorObservaciones(persona, [mel(1), mel(2), mel(3)]), 'MEL');
  // Si dijo «Dejarla como está», la siguiente del mismo temperamento no vuelve a preguntar.
  assert.equal(propuestaPorObservaciones(persona, [mel(1), mel(2), mel(3), mel(4)]), null);
  assert.equal(propuestaPorObservaciones({ ...persona, estado: 'confirmado' }, [mel(1), mel(2), mel(3)]), null);
  // Sin test: la primera observación propone su temperamento.
  assert.equal(propuestaPorObservaciones({ estado: 'sin_estimar', primario: null, puntos: null }, [mel(1)]), 'MEL');
  // Test sin resultado con 4 puntos sanguíneos: una reacción flemática no propone sanguíneo.
  const luis = { estado: 'sin_estimar', primario: null, puntos: { COL: 0, MEL: 0, SAN: 4, FLE: 0 } };
  assert.equal(propuestaPorObservaciones(luis, [{ id: 1, temperamento: 'FLE' }]), null);
});

test('menores de 18 y claves de ficha', () => {
  const hoy = new Date(2026, 10, 2);
  assert.equal(esMenorDe18(2010, hoy), true);
  assert.equal(esMenorDe18(2008, hoy), true); // cumple 18 este año: se trata como menor
  assert.equal(esMenorDe18(2007, hoy), false);
  assert.equal(esMenorDe18(null, hoy), false);
  assert.equal(idDeClave(claveFicha('abc')), 'abc');
  assert.equal(idDeClave('familia'), null);
});
