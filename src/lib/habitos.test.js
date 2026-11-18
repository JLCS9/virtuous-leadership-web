// Tests de la lógica de hábitos (src/lib/habitos.js). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  VIRTUDES_HABITO, avance, cambioDeEstado, decision, fechasDe, inicioSemana, ofrecerAlta, puedeAnadir,
  textoDeHabito, tieneCasilla, virtudDeReto,
} from './habitos.js';
import { sumarDias } from './camino.js';

const CONFIG = { max_activos: 5, dias_prueba: 7, dias_ventana: 30, dias_consolidar: 24, min_semana: 3, semanas_bajo: 2 };
const hab = (extra = {}) => ({ id: 'h1', reto_id: null, estado: 'en_prueba', alta_en: '2027-01-04', estado_desde: '2027-01-04', ...extra });
// Días consecutivos desde `desde`: dias(2027-01-04, 3) → 04, 05, 06
const dias = (desde, n) => new Set(Array.from({ length: n }, (_, i) => sumarDias(desde, i)));

// 2027-01-04 es lunes.

test('virtudes: la lista de seis y la correspondencia de las virtudes-desafío de los retos', () => {
  assert.deepEqual(VIRTUDES_HABITO, ['humildad', 'magnanimidad', 'prudencia', 'dominio_de_si', 'fortaleza', 'justicia']);
  assert.equal(virtudDeReto('Humildad'), 'humildad');
  assert.equal(virtudDeReto('Magnanimidad'), 'magnanimidad');
  assert.equal(virtudDeReto('Audacia'), 'fortaleza');
  assert.equal(virtudDeReto('Resistencia y persistencia'), 'fortaleza');
  assert.equal(virtudDeReto('Dominio de sí'), 'dominio_de_si');
  assert.equal(virtudDeReto('Otra cosa'), null);
  assert.equal(virtudDeReto(undefined), null);
});

test('biblioteca real: todos los retos tienen una virtud de hábito y la configuración sirve', () => {
  const b = JSON.parse(readFileSync(new URL('../data/camino-biblioteca.json', import.meta.url), 'utf8'));
  for (const r of b.retos) assert.ok(VIRTUDES_HABITO.includes(virtudDeReto(r.virtud)), `${r.id}: ${r.virtud}`);
  const e = cambioDeEstado(hab(), new Set(), '2027-01-11', b.habitos);
  assert.equal(e.estado, 'activo');
});

test('textoDeHabito: quita el «Hoy» y deja la frase como acto repetible', () => {
  assert.equal(textoDeHabito('Hoy, antes de cada decisión que afecte a otros, pregunto a alguien qué haría.'),
    'Antes de cada decisión que afecte a otros, pregunto a alguien qué haría.');
  assert.equal(textoDeHabito('Hoy cuento hasta tres antes de responder a cualquiera.'), 'Cuento hasta tres antes de responder a cualquiera.');
  assert.equal(textoDeHabito('Hoy, después de cenar, dedico media hora a leer.'), 'Después de cenar, dedico media hora a leer.');
  assert.equal(textoDeHabito('Pregunto «¿cómo te viene?»'), 'Pregunto «¿cómo te viene?»');
});

test('límite de hábitos: cuentan los de la lista, no los consolidados ni los retirados', () => {
  const lista = (...estados) => estados.map((estado, i) => hab({ id: `h${i}`, estado }));
  assert.equal(puedeAnadir(lista('activo', 'activo', 'activo', 'activo'), CONFIG), true);
  assert.equal(puedeAnadir(lista('activo', 'activo', 'activo', 'activo', 'en_prueba'), CONFIG), false);
  assert.equal(puedeAnadir(lista('en_revision', 'activo', 'activo', 'activo', 'activo'), CONFIG), false);
  assert.equal(puedeAnadir(lista('consolidado', 'consolidado', 'retirado', 'activo', 'activo', 'activo', 'activo'), CONFIG), true);
  assert.equal(puedeAnadir([], { ...CONFIG, max_activos: 1 }), true);
  assert.equal(puedeAnadir(lista('activo'), { ...CONFIG, max_activos: 1 }), false);
  assert.deepEqual(['en_prueba', 'activo', 'en_revision', 'consolidado', 'retirado'].map((estado) => tieneCasilla({ estado })),
    [true, true, true, false, false]);
});

test('alta: solo tras cumplir la opción B con el examen cerrado, sin duplicar y con sitio', () => {
  const reto = { id: 'C01' };
  const dia = { opcion: 'habito', cumplido: 'si', examen_en: '2027-01-04T21:00:00Z' };
  assert.equal(ofrecerAlta({ dia, reto, habitos: [], config: CONFIG }), true);
  assert.equal(ofrecerAlta({ dia: { ...dia, cumplido: 'a_medias' }, reto, habitos: [], config: CONFIG }), true);
  assert.equal(ofrecerAlta({ dia: { ...dia, cumplido: 'no' }, reto, habitos: [], config: CONFIG }), false);
  assert.equal(ofrecerAlta({ dia: { ...dia, opcion: 'persona' }, reto, habitos: [], config: CONFIG }), false);
  assert.equal(ofrecerAlta({ dia: { ...dia, examen_en: null }, reto, habitos: [], config: CONFIG }), false);
  assert.equal(ofrecerAlta({ dia: null, reto, habitos: [], config: CONFIG }), false);
  assert.equal(ofrecerAlta({ dia, reto, habitos: [hab({ reto_id: 'C01', estado: 'activo' })], config: CONFIG }), false);
  assert.equal(ofrecerAlta({ dia, reto, habitos: [hab({ reto_id: 'C01', estado: 'retirado' })], config: CONFIG }), true);
  const llenos = Array.from({ length: 5 }, (_, i) => hab({ id: `x${i}`, estado: 'activo' }));
  assert.equal(ofrecerAlta({ dia, reto, habitos: llenos, config: CONFIG }), false);
});

test('avance: la semana va de lunes a domingo y la ventana es móvil', () => {
  assert.equal(inicioSemana('2027-01-06'), '2027-01-04'); // miércoles → lunes
  assert.equal(inicioSemana('2027-01-10'), '2027-01-04'); // domingo → lunes
  assert.equal(inicioSemana('2027-01-04'), '2027-01-04');
  const fechas = new Set(['2027-01-03', '2027-01-04', '2027-01-05', '2027-01-06']);
  const a = avance(hab(), fechas, '2027-01-06', CONFIG);
  assert.equal(a.semana, 3); // el domingo 3 es de la semana anterior
  assert.equal(a.ventana, 4);
  assert.equal(a.objetivo, 24);
  assert.equal(a.diasDePrueba, 5);
  // La ventana son los últimos 30 días contando hoy: el 3-feb llega hasta el 5-ene (entran el 5 y el 6)…
  assert.equal(avance(hab(), fechas, '2027-02-03', CONFIG).ventana, 2);
  // …y el 6-feb ya no incluye ninguno.
  assert.equal(avance(hab(), fechas, '2027-02-06', CONFIG).ventana, 0);
  assert.equal(avance(hab(), fechas, '2027-02-06', CONFIG).diasDePrueba, 0);
});

test('fechasDe: solo las marcas de ese hábito', () => {
  const marcas = [{ habito_id: 'a', fecha: '2027-01-04' }, { habito_id: 'b', fecha: '2027-01-05' }, { habito_id: 'a', fecha: '2027-01-06' }];
  assert.deepEqual([...fechasDe(marcas, 'a')], ['2027-01-04', '2027-01-06']);
  assert.equal(fechasDe(marcas, 'z').size, 0);
});

test('en prueba pasa a activo al cumplir los días de prueba, con la cuenta marcada o no', () => {
  assert.equal(cambioDeEstado(hab(), new Set(), '2027-01-10', CONFIG), null); // día 6
  assert.deepEqual(cambioDeEstado(hab(), new Set(), '2027-01-11', CONFIG), { estado: 'activo', estado_desde: '2027-01-11' });
  // Abierto días más tarde: sigue contando desde que acabó la prueba, no desde hoy.
  assert.deepEqual(cambioDeEstado(hab(), new Set(), '2027-01-20', CONFIG), { estado: 'activo', estado_desde: '2027-01-11' });
});

test('activo se consolida con los días necesarios dentro de la ventana (los de prueba cuentan)', () => {
  const activo = hab({ estado: 'activo', estado_desde: '2027-01-11' });
  const hoy = '2027-02-02'; // día 30 de la ventana que empieza el 04-ene
  assert.equal(cambioDeEstado(activo, dias('2027-01-04', 23), hoy, CONFIG), null); // 23 < 24
  assert.deepEqual(cambioDeEstado(activo, dias('2027-01-04', 24), hoy, CONFIG), { estado: 'consolidado', estado_desde: hoy });
  // Con 24 marcados pero fuera de la ventana de 30 días no consolida (y sin marcas recientes, pasa a revisión).
  assert.equal(cambioDeEstado(activo, dias('2027-01-04', 24), '2027-03-10', CONFIG).estado, 'en_revision');
  // Cambiar la configuración cambia el resultado sin tocar código.
  assert.equal(cambioDeEstado(activo, dias('2027-01-04', 20), hoy, { ...CONFIG, dias_consolidar: 20 }).estado, 'consolidado');
});

test('activo pasa a revisión tras dos semanas completas seguidas por debajo del mínimo', () => {
  const activo = hab({ estado: 'activo', estado_desde: '2027-01-11' });
  // Hoy lunes 25: las semanas completas son la del 18-24 y la del 11-17.
  const hoy = '2027-01-25';
  assert.deepEqual(cambioDeEstado(activo, new Set(), hoy, CONFIG), { estado: 'en_revision', estado_desde: hoy });
  // Una semana buena (3 días) entre las dos: no pregunta.
  assert.equal(cambioDeEstado(activo, dias('2027-01-18', 3), hoy, CONFIG), null);
  // Dos días en cada semana (por debajo de 3): pregunta.
  const bajos = new Set([...dias('2027-01-11', 2), ...dias('2027-01-18', 2)]);
  assert.equal(cambioDeEstado(activo, bajos, hoy, CONFIG).estado, 'en_revision');
  // Una sola semana por debajo no basta: la anterior era buena.
  const unaMala = new Set([...dias('2027-01-11', 3), ...dias('2027-01-18', 1)]);
  assert.equal(cambioDeEstado(activo, unaMala, hoy, CONFIG), null);
  // La semana actual no cuenta, aunque vaya vacía.
  assert.equal(cambioDeEstado(activo, dias('2027-01-11', 3), '2027-01-21', CONFIG), null);
});

test('la semana por debajo solo cuenta si empezó cuando el hábito ya estaba activo', () => {
  // Activo desde el 18: la semana del 11 no cuenta, y solo hay una semana completa posterior.
  const activo = hab({ estado: 'activo', estado_desde: '2027-01-18' });
  assert.equal(cambioDeEstado(activo, new Set(), '2027-01-25', CONFIG), null);
  assert.equal(cambioDeEstado(activo, new Set(), '2027-02-01', CONFIG).estado, 'en_revision');
});

test('consolidar manda sobre revisar, y los demás estados no cambian solos', () => {
  const activo = hab({ estado: 'activo', estado_desde: '2027-01-11' });
  // 24 marcados hace casi un mes y nada las dos últimas semanas.
  assert.equal(cambioDeEstado(activo, dias('2027-01-04', 24), '2027-02-02', CONFIG).estado, 'consolidado');
  for (const estado of ['consolidado', 'en_revision', 'retirado']) {
    assert.equal(cambioDeEstado(hab({ estado }), new Set(), '2027-06-01', CONFIG), null, estado);
  }
});

test('decisiones del usuario: dejar, mantener, ajustar y recuperar', () => {
  const hoy = '2027-02-01';
  assert.deepEqual(decision('dejar', hoy), { estado: 'retirado', estado_desde: hoy });
  assert.deepEqual(decision('mantener', hoy), { estado: 'activo', estado_desde: hoy });
  assert.deepEqual(decision('ajustar', hoy, '  Cuento hasta tres  '), { estado: 'activo', estado_desde: hoy, texto: 'Cuento hasta tres' });
  assert.deepEqual(decision('recuperar', hoy), { estado: 'en_prueba', alta_en: hoy, estado_desde: hoy });
  assert.throws(() => decision('otra', hoy));
});

test('mantener evita volver a preguntar enseguida: las semanas bajas anteriores ya no cuentan', () => {
  const hoy = '2027-01-25';
  const revision = hab({ estado: 'en_revision', estado_desde: hoy });
  const mantenido = { ...revision, ...decision('mantener', hoy) };
  assert.equal(cambioDeEstado(mantenido, new Set(), '2027-01-26', CONFIG), null);
  assert.equal(cambioDeEstado(mantenido, new Set(), '2027-02-08', CONFIG).estado, 'en_revision'); // dos semanas completas después
});

test('un hábito recuperado vuelve a «en prueba» y repite el ciclo', () => {
  const recuperado = { ...hab({ estado: 'retirado' }), ...decision('recuperar', '2027-03-01') };
  assert.equal(recuperado.estado, 'en_prueba');
  assert.equal(cambioDeEstado(recuperado, new Set(), '2027-03-07', CONFIG), null);
  assert.equal(cambioDeEstado(recuperado, new Set(), '2027-03-08', CONFIG).estado, 'activo');
});
