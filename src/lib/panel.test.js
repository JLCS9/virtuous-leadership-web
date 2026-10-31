// Tests de la lógica del panel (formación y virtudes). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  progresoCurso, siguienteLeccion, continuar, resumenGlobal, formatoDuracion, buscarLeccion, urlVimeo,
} from './formacion.js';
import {
  VIRTUDES, etapa, resultadoCaracter, extremos, geometriaRadar, claveTemperamento, resultadoParaGuardar,
} from './virtudes.js';

const lec = (id, dur = 600) => ({ id, titulo: `L${id}`, vimeoId: `v${id}`, duracion: dur, miniatura: null, virtudes: [], temperamentos: [] });
const cursos = [
  { id: 'curso-1', numero: 1, titulo: 'Uno', lecciones: [lec('1.0'), lec('1.1'), lec('1.2'), lec('1.3')] },
  { id: 'curso-2', numero: 2, titulo: 'Dos', lecciones: [lec('2.0'), lec('2.1')] },
];
const vistas = (...ids) => Object.fromEntries(ids.map((i) => [i, '2026-10-31T10:00:00Z']));

test('progreso de un curso', () => {
  assert.deepEqual(progresoCurso(cursos[0], {}), { hechas: 0, total: 4, completo: false, porcentaje: 0 });
  assert.deepEqual(progresoCurso(cursos[0], vistas('1.0', '1.1')), { hechas: 2, total: 4, completo: false, porcentaje: 50 });
  assert.equal(progresoCurso(cursos[1], vistas('2.0', '2.1')).completo, true);
});

test('siguiente lección: la primera sin ver después de la última vista', () => {
  assert.equal(siguienteLeccion(cursos[0], {}).id, '1.0');
  assert.equal(siguienteLeccion(cursos[0], vistas('1.0', '1.1')).id, '1.2');
  // vio la 1.2 saltándose la 1.1: sigue la 1.3, no vuelve atrás
  assert.equal(siguienteLeccion(cursos[0], vistas('1.0', '1.2')).id, '1.3');
  // vio la última pero le queda una atrás: vuelve a la primera sin ver
  assert.equal(siguienteLeccion(cursos[0], vistas('1.0', '1.3')).id, '1.1');
  assert.equal(siguienteLeccion(cursos[1], vistas('2.0', '2.1')), null);
});

test('continuar donde lo dejó', () => {
  assert.equal(continuar(cursos, {}, null).leccion.id, '1.0');
  // abrió la 1.2 y no la vio: se retoma esa misma
  const r = continuar(cursos, vistas('1.0', '1.1'), '1.2');
  assert.equal(r.leccion.id, '1.2'); assert.equal(r.retomada, true);
  // ya vio la 1.1: toca la siguiente
  assert.equal(continuar(cursos, vistas('1.0', '1.1'), '1.1').leccion.id, '1.2');
  // el curso 1 está completo: pasa al 2
  assert.equal(continuar(cursos, vistas('1.0', '1.1', '1.2', '1.3'), '1.3').leccion.id, '2.0');
  // todo visto
  assert.equal(continuar(cursos, vistas('1.0', '1.1', '1.2', '1.3', '2.0', '2.1'), '2.1'), null);
  // una «última» que ya no existe en el catálogo no rompe nada
  assert.equal(continuar(cursos, {}, '9.9').leccion.id, '1.0');
});

test('resumen global y duraciones', () => {
  const r = resumenGlobal(cursos, vistas('1.0', '2.0'));
  assert.deepEqual([r.hechas, r.total, r.porcentaje, r.segundosVistos, r.segundosTotal], [2, 6, 33, 1200, 3600]);
  assert.equal(formatoDuracion(0), '0 min');
  assert.equal(formatoDuracion(undefined), '0 min');
  assert.equal(formatoDuracion(45), '45 s');
  assert.equal(formatoDuracion(720), '12 min');
  assert.equal(formatoDuracion(6312), '1 h 45 min');
  assert.equal(formatoDuracion(7200), '2 h');
  assert.equal(buscarLeccion(cursos, '2.1').curso.id, 'curso-2');
  assert.equal(buscarLeccion(cursos, 'x'), null);
  assert.match(urlVimeo('123'), /player\.vimeo\.com\/video\/123\?.*dnt=1/);
});

test('etapas del carácter con los umbrales del test (40 y 70)', () => {
  assert.equal(etapa(39.9).clave, 'bajo');
  assert.equal(etapa(40).clave, 'moderado');
  assert.equal(etapa(69.9).clave, 'moderado');
  assert.equal(etapa(70).clave, 'alto');
});

const self = { magnanimidad: 72, humildad: 55, prudencia: 63, fortaleza: 48, dominio: 60, justicia: 70 };

test('resultado del carácter: valida y normaliza', () => {
  const r = resultadoCaracter({ self, facets: { prudencia: { passive: 58, active: 71 } } });
  assert.equal(r.valores.humildad, 55);
  assert.ok(r.facetas.prudencia);
  assert.equal(resultadoCaracter({ self: { ...self, humildad: 140 } }).valores.humildad, 100);
  assert.equal(resultadoCaracter({ self: { ...self, humildad: -5 } }).valores.humildad, 0);
  assert.equal(resultadoCaracter(null), null);
  assert.equal(resultadoCaracter({ self: { ...self, justicia: 'x' } }), null);
  assert.equal(resultadoCaracter({ self: { magnanimidad: 1 } }), null);
  assert.deepEqual([extremos(self).mayor.clave, extremos(self).menor.clave], ['magnanimidad', 'fortaleza']);
});

test('geometría del radar: seis ejes, el valor 100 toca el borde y 0 el centro', () => {
  const g = geometriaRadar(self, { tamano: 320, margen: 64 });
  assert.equal(g.ejes.length, 6); assert.equal(g.poligono.length, 6); assert.equal(g.anillos.length, 4);
  assert.deepEqual(g.centro, 160); assert.equal(g.radio, 96);
  const lleno = geometriaRadar(Object.fromEntries(VIRTUDES.map((v) => [v.clave, 100])));
  assert.deepEqual(lleno.poligono[0], [160, 64]); // el primer eje apunta arriba
  const vacio = geometriaRadar(Object.fromEntries(VIRTUDES.map((v) => [v.clave, 0])));
  assert.ok(vacio.poligono.every(([x, y]) => x === 160 && y === 160));
  // el polígono nunca sale del borde
  for (const [x, y] of g.poligono) assert.ok(Math.hypot(x - 160, y - 160) <= 96.01);
});

test('clave del temperamento desde la web o la app', () => {
  assert.equal(claveTemperamento({ profileKey: 'COL-SAN' }), 'COL-SAN');
  assert.equal(claveTemperamento({ type: 'MEL' }), 'MEL');
  assert.equal(claveTemperamento({ profileKey: 'XX' }), null);
  assert.equal(claveTemperamento(null), null);
});

test('guardar el resultado de la web con la forma de la app', () => {
  const p = (g, a, b) => ({ global: g, passive: a, active: b });
  const g = resultadoParaGuardar({ P: p(63.4, 58.3, 71.2), C: p(48, 40, 56), S: p(60, 55, 65), J: p(70.5, 68, 73), M: p(72, 70, 74), H: p(55, 50, 60) });
  assert.deepEqual(g.self, { magnanimidad: 72, humildad: 55, prudencia: 63, fortaleza: 48, dominio: 60, justicia: 71 });
  assert.deepEqual(g.facets.prudencia, { passive: 58.3, active: 71.2 });
  assert.equal(resultadoParaGuardar({ P: p(1, 1, 1) }), null);
  assert.equal(resultadoParaGuardar(null), null);
});
