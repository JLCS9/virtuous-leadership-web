// Tests de las preferencias de trabajo diario y avisos. `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HORAS_SUGERIDAS, PREFERENCIAS_POR_DEFECTO, diaValido, horaCorta, horaValida, normalizar, sonValidas,
  textoFormacion, textoReflexion, textoReto, textoZona, zonaDelDispositivo,
} from './preferencias.js';

test('horas: solo HH:MM de verdad', () => {
  for (const h of ['00:00', '08:00', '21:30', '23:59']) assert.equal(horaValida(h), true);
  for (const h of ['24:00', '8:00', '08:60', '08:00:00', '', null, 800]) assert.equal(horaValida(h), false);
  assert.equal(horaCorta('08:00:00'), '08:00'); // lo que devuelve Postgres para un `time`
  assert.equal(horaCorta('nada'), null);
  assert.equal(horaCorta(null), null);
});

test('días ISO: 1 lunes … 7 domingo', () => {
  assert.equal(diaValido(1), true);
  assert.equal(diaValido(7), true);
  for (const d of [0, 8, 1.5, '3', null]) assert.equal(diaValido(d), false);
});

test('las horas sugeridas y los valores por defecto son válidos', () => {
  for (const lista of Object.values(HORAS_SUGERIDAS)) for (const h of lista) assert.equal(horaValida(h), true);
  assert.equal(sonValidas(PREFERENCIAS_POR_DEFECTO), true);
});

test('sin fila: valores por defecto con la zona del dispositivo', () => {
  const p = normalizar(null, 'America/Bogota');
  assert.equal(p.hora_reto, '08:00');
  assert.equal(p.hora_reflexion, '21:30');
  assert.equal(p.dia_formacion, 7);
  assert.equal(p.zona_horaria, 'America/Bogota');
  assert.equal(p.avisos_email, true);
  assert.equal(sonValidas(p), true);
});

test('con fila: respeta lo guardado (y su zona, no la del dispositivo) y repara lo que no vale', () => {
  const p = normalizar({
    hora_reto: '07:15:00', hora_reflexion: 'mal', dia_formacion: 3, hora_formacion: '18:00:00',
    zona_horaria: 'Europe/Paris', avisos_email: false,
  }, 'America/Bogota');
  assert.equal(p.hora_reto, '07:15');
  assert.equal(p.hora_reflexion, '21:30'); // no valía: por defecto
  assert.equal(p.dia_formacion, 3);
  assert.equal(p.hora_formacion, '18:00');
  assert.equal(p.zona_horaria, 'Europe/Paris');
  assert.equal(p.avisos_email, false);
  assert.equal(p.avisos_push, true);
});

test('no se guarda nada que la tabla rechazaría', () => {
  const base = normalizar(null);
  assert.equal(sonValidas({ ...base, hora_reto: '25:00' }), false);
  assert.equal(sonValidas({ ...base, dia_formacion: 0 }), false);
  assert.equal(sonValidas({ ...base, zona_horaria: '' }), false);
  assert.equal(sonValidas(null), false);
});

test('textos de resumen', () => {
  const p = normalizar({ hora_reto: '07:00', hora_reflexion: '22:00', dia_formacion: 6, hora_formacion: '11:00' });
  assert.equal(textoReto(p), 'Cada día a las 07:00');
  assert.equal(textoReflexion(p), 'Cada día a las 22:00');
  assert.equal(textoFormacion(p), 'Los sábados a las 11:00');
  assert.equal(textoFormacion({ ...p, dia_formacion: 1 }), 'Los lunes a las 11:00');
  assert.equal(textoZona('America/Argentina/Buenos_Aires'), 'Buenos Aires');
  assert.equal(textoZona('Europe/Madrid'), 'Madrid');
});

test('zona del dispositivo: la que diga el sistema (también «UTC»), nunca vacía', () => {
  const zona = zonaDelDispositivo();
  assert.equal(typeof zona, 'string');
  assert.ok(zona.length > 0 && zona.length <= 64);
  assert.equal(zona, Intl.DateTimeFormat().resolvedOptions().timeZone);
});
