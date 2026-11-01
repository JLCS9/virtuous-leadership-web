// Tests de la lógica del Camino (fechas, racha, siguiente paso). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DESLIZA_2, DESLIZA_4, ESCENAS_11, RASGOS_13, calcularInicio, diaDelCamino, diaIso, fechaDelDia, quienCorrige, racha,
  resumenSemana1, siguientePaso, textoElige3,
} from './camino.js';

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
  assert.equal(fechaDelDia('2026-10-19', 8), '2026-10-26'); // cruza el cambio de hora (25-oct)
  assert.equal(calcularInicio(1, '2026-10-20'), '2026-10-26');
});

test('racha: días seguidos con actividad, desde hoy o ayer', () => {
  const en = (f) => new Date(`${f}T20:00:00`).toISOString();
  const dias = [{ sesion_en: en('2026-11-01') }, { examen_en: en('2026-11-02') }, { sesion_en: en('2026-11-03') }];
  assert.equal(racha(dias, '2026-11-03'), 3);
  assert.equal(racha(dias, '2026-11-04'), 3);
  assert.equal(racha(dias, '2026-11-05'), 0);
  assert.equal(racha([], '2026-11-05'), 0);
  const otoño = [{ sesion_en: en('2026-10-24') }, { sesion_en: en('2026-10-25') }, { sesion_en: en('2026-10-26') }];
  assert.equal(racha(otoño, '2026-10-26'), 3);
});

test('siguiente paso', () => {
  assert.equal(siguientePaso({ diaHoy: 0, porDia: {} }), null);
  assert.deepEqual(siguientePaso({ diaHoy: 2, porDia: {} }), { tipo: 'sesion', dia: 2 });
  assert.deepEqual(siguientePaso({ diaHoy: 2, porDia: { 2: { sesion_en: 'x' } } }), { tipo: 'examen', dia: 2 });
  assert.deepEqual(siguientePaso({ diaHoy: 2, porDia: { 2: { sesion_en: 'x', examen_en: 'x' } } }), { tipo: 'sesion', dia: 1, atrasada: true });
  assert.deepEqual(siguientePaso({ diaHoy: 7, porDia: Object.fromEntries([1, 2, 3, 4, 5, 6, 7].map((d) => [d, { sesion_en: 'x' }])) }), { tipo: 'hecho', dia: 7 });
});

test('contenido de los juegos según la especificación', () => {
  assert.equal(DESLIZA_4.length, 12);
  for (const k of ['COL', 'MEL', 'SAN', 'FLE']) assert.equal(DESLIZA_4.filter(([, r]) => r === k).length, 3);
  assert.equal(DESLIZA_2.length, 10);
  assert.equal(RASGOS_13.length, 12);
  for (const e of ESCENAS_11) assert.deepEqual(Object.keys(e.sale).sort(), ['COL', 'FLE', 'MEL', 'SAN']);
});

test('día 3: texto según coincidencias con el primario', () => {
  assert.match(textoElige3(4, 'colérico'), /confirman tu temperamento colérico/);
  assert.match(textoElige3(2, 'colérico'), /se reparten/);
  assert.match(textoElige3(1, 'colérico'), /primera reacción/);
});

test('día 11: quién te corrige según el momento vital', () => {
  assert.equal(quienCorrige(['estudio', 'trabajo']), 'un profesor');
  assert.equal(quienCorrige(['trabajo']), 'tu jefe');
  assert.equal(quienCorrige(['familia']), 'un familiar');
  assert.equal(quienCorrige([]), 'alguien');
});

test('día 14: resumen de la semana 1', () => {
  const porDia = {
    8: { examen: { reto: 'si', con_quien: 'amigos', reconocio: 'si' } },
    9: { examen: { reto: 'a_medias', con_quien: 'familia', reconocio: 'no' } },
    10: { examen: { reto: 'no' } },
    11: { examen: { reto: 'si', con_quien: 'solo' } },
  };
  assert.deepEqual(resumenSemana1(porDia), { contado: 2, reconocieron: 1, retos: 3 });
});
