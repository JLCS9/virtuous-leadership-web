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

test('sin ningún reto aceptado: la virtud-desafío espera en el día 0 y las demás, bloqueadas', () => {
  const [primero, ...resto] = bloquesDeLaRuta({ desafio: 'humildad', inicio: null, hoy: '2026-12-01' });
  assert.deepEqual(primero, { virtud: 'humildad', estado: 'actual', dia: 0, total: 30, faltan: 0 });
  for (const b of resto) assert.deepEqual([b.estado, b.faltan], ['bloqueada', 30]);
});

test('durante el mes: día X de 30 en la virtud-desafío y las demás bloqueadas con los días que faltan', () => {
  const bloques = (hoy) => bloquesDeLaRuta({ desafio: 'humildad', inicio: '2026-12-01', hoy });
  assert.deepEqual(bloques('2026-12-01')[0], { virtud: 'humildad', estado: 'actual', dia: 1, total: 30, faltan: 0 });
  assert.equal(bloques('2026-12-05')[0].dia, 5);
  const ultimo = bloques('2026-12-30'); // 29 días transcurridos: aún no ha pasado un mes
  assert.equal(ultimo[0].estado, 'actual');
  assert.equal(ultimo[0].dia, 30);
  assert.deepEqual([ultimo[1].estado, ultimo[1].faltan], ['bloqueada', 1]);
});

test('pasado el mes: la virtud-desafío queda completada y las demás se desbloquean', () => {
  const bloques = bloquesDeLaRuta({ desafio: 'humildad', inicio: '2026-12-01', hoy: '2026-12-31' }); // 30 días transcurridos
  assert.equal(bloques[0].estado, 'completada');
  assert.equal(bloques[0].dia, 30);
  for (const b of bloques.slice(1)) assert.deepEqual([b.estado, b.faltan], ['disponible', 0]);
  // Mucho después, sigue igual (el día no pasa de 30).
  assert.equal(bloquesDeLaRuta({ desafio: 'humildad', inicio: '2026-12-01', hoy: '2027-06-01' })[0].dia, 30);
});

test('la duración de cada virtud es configuración: cambiarla cambia cuándo se desbloquea', () => {
  const args = { desafio: 'humildad', inicio: '2026-12-01', hoy: '2026-12-15' };
  assert.equal(bloquesDeLaRuta(args)[1].estado, 'bloqueada');
  assert.equal(bloquesDeLaRuta({ ...args, config: { dias_por_virtud: 14 } })[1].estado, 'disponible');
  assert.equal(RUTA.dias_por_virtud, 30);
});
