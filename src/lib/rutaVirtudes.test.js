// Tests del camino de virtudes (src/lib/rutaVirtudes.js). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGE_VIRTUE } from '../account/challengeVirtues.js';
import { ORDEN_VIRTUDES, RUTA, bloquesDeLaRuta, inicioDeLaRuta, virtudDeDesafio } from './rutaVirtudes.js';
import { VIRTUDES_HABITO } from './habitos.js';

test('las virtudes-desafío de los 12 perfiles pertenecen a una de las seis virtudes', () => {
  for (const [perfil, desafio] of Object.entries(CHALLENGE_VIRTUE)) {
    assert.ok(VIRTUDES_HABITO.includes(virtudDeDesafio(desafio)), `${perfil}: ${desafio}`);
  }
  assert.equal(virtudDeDesafio('humildad_fraterna'), 'humildad');
  assert.equal(virtudDeDesafio('audacia'), 'fortaleza');
  assert.equal(virtudDeDesafio('resistencia'), 'fortaleza');
  assert.equal(virtudDeDesafio('otra'), null);
  assert.equal(virtudDeDesafio(undefined), null);
});

test('el orden de la ruta contiene las seis virtudes sin repetir', () => {
  assert.deepEqual([...ORDEN_VIRTUDES].sort(), [...VIRTUDES_HABITO].sort());
});

test('inicio: el primer día con un reto aceptado, aunque los días vengan desordenados', () => {
  assert.equal(inicioDeLaRuta([]), null);
  assert.equal(inicioDeLaRuta([{ fecha: '2026-11-18', opcion: null }]), null); // reto abierto pero no aceptado
  const dias = [{ fecha: '2026-11-20', opcion: 'habito' }, { fecha: '2026-11-18', opcion: null }, { fecha: '2026-11-19', opcion: 'persona' }];
  assert.equal(inicioDeLaRuta(dias), '2026-11-19');
});

test('la virtud-desafío va primero y las demás siguen el orden de la propuesta', () => {
  const orden = (desafio) => bloquesDeLaRuta({ desafio, inicio: null, hoy: '2026-12-01' }).map((b) => b.virtud);
  assert.deepEqual(orden('humildad'), ['humildad', 'magnanimidad', 'prudencia', 'fortaleza', 'dominio_de_si', 'justicia']);
  assert.deepEqual(orden('fortaleza'), ['fortaleza', 'magnanimidad', 'humildad', 'prudencia', 'dominio_de_si', 'justicia']);
  assert.deepEqual(orden('magnanimidad'), ['magnanimidad', 'humildad', 'prudencia', 'fortaleza', 'dominio_de_si', 'justicia']);
  assert.deepEqual(bloquesDeLaRuta({ desafio: null, inicio: null, hoy: '2026-12-01' }), []);
});

test('sin ningún reto aceptado: la virtud-desafío espera sin avance y las demás, bloqueadas', () => {
  const [primero, ...resto] = bloquesDeLaRuta({ desafio: 'humildad', inicio: null, hoy: '2026-12-01' });
  assert.deepEqual(primero, { virtud: 'humildad', estado: 'actual', avance: 0 });
  for (const b of resto) assert.deepEqual([b.estado, b.avance], ['bloqueada', 0]);
});

test('durante el mes la virtud-desafío avanza y las demás siguen bloqueadas', () => {
  const bloques = (hoy) => bloquesDeLaRuta({ desafio: 'humildad', inicio: '2026-12-01', hoy });
  assert.equal(bloques('2026-12-01')[0].avance, 0);
  assert.equal(bloques('2026-12-16')[0].avance, 0.5); // 15 de 30 días transcurridos
  const ultimo = bloques('2026-12-30'); // 29 días transcurridos: aún no ha pasado un mes
  assert.deepEqual([ultimo[0].estado, +ultimo[0].avance.toFixed(3)], ['actual', 0.967]);
  assert.equal(ultimo[1].estado, 'bloqueada');
});

test('pasado el mes: la virtud-desafío queda completada y las demás se desbloquean', () => {
  const bloques = bloquesDeLaRuta({ desafio: 'humildad', inicio: '2026-12-01', hoy: '2026-12-31' }); // 30 días transcurridos
  assert.deepEqual([bloques[0].estado, bloques[0].avance], ['completada', 1]);
  for (const b of bloques.slice(1)) assert.equal(b.estado, 'disponible');
  // Mucho después, sigue igual (el avance no pasa de 1).
  assert.equal(bloquesDeLaRuta({ desafio: 'humildad', inicio: '2026-12-01', hoy: '2027-06-01' })[0].avance, 1);
});

test('la duración de cada virtud es configuración: cambiarla cambia cuándo se desbloquea', () => {
  const args = { desafio: 'humildad', inicio: '2026-12-01', hoy: '2026-12-15' };
  assert.equal(bloquesDeLaRuta(args)[1].estado, 'bloqueada');
  assert.equal(bloquesDeLaRuta({ ...args, config: { dias_por_virtud: 14 } })[1].estado, 'disponible');
  assert.equal(RUTA.dias_por_virtud, 30);
});

test('la pantalla no necesita plazos: los bloques solo llevan virtud, estado y avance', () => {
  for (const b of bloquesDeLaRuta({ desafio: 'humildad', inicio: '2026-12-01', hoy: '2026-12-05' })) {
    assert.deepEqual(Object.keys(b).sort(), ['avance', 'estado', 'virtud']);
  }
});
