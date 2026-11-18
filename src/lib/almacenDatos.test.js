// Tests de la caché de datos (src/lib/almacenDatos.js). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearAlmacen } from './almacenDatos.js';

const esperar = () => new Promise((r) => setTimeout(r, 0));
// Una petición que se resuelve cuando se le dice.
function pendiente() {
  let resolver; let rechazar;
  const promesa = new Promise((res, rej) => { resolver = res; rechazar = rej; });
  return { promesa, resolver, rechazar };
}

test('sin datos al principio; al cargar quedan guardados', async () => {
  const a = crearAlmacen();
  assert.deepEqual(a.leer('x'), { datos: undefined, listo: false, error: null });
  await a.cargar('x', async () => [1, 2]);
  assert.deepEqual(a.leer('x'), { datos: [1, 2], listo: true, error: null });
});

test('al volver a pedir se siguen viendo los datos de antes mientras llegan los nuevos', async () => {
  const a = crearAlmacen();
  await a.cargar('x', async () => 'viejo');
  const p = pendiente();
  const nueva = a.cargar('x', () => p.promesa, { forzar: true });
  assert.equal(a.leer('x').datos, 'viejo'); // no se vacía
  p.resolver('nuevo');
  await nueva;
  assert.equal(a.leer('x').datos, 'nuevo');
});

test('varias peticiones seguidas comparten la misma; con `forzar` se lanza otra', async () => {
  const a = crearAlmacen();
  let llamadas = 0;
  const p = pendiente();
  const f = () => { llamadas += 1; return p.promesa; };
  a.cargar('x', f); a.cargar('x', f); a.cargar('x', f);
  await esperar();
  assert.equal(llamadas, 1);
  a.cargar('x', f, { forzar: true });
  await esperar();
  assert.equal(llamadas, 2);
  p.resolver(1);
  await esperar();
});

test('tras guardar algo (forzar), un resultado anterior que llega tarde no pisa el nuevo', async () => {
  const a = crearAlmacen();
  const lenta = pendiente();
  const rapida = pendiente();
  a.cargar('x', () => lenta.promesa); // se lanzó antes de guardar
  a.cargar('x', () => rapida.promesa, { forzar: true }); // se lanza después de guardar
  rapida.resolver('con lo guardado');
  await esperar();
  lenta.resolver('sin lo guardado'); // llega tarde
  await esperar();
  assert.equal(a.leer('x').datos, 'con lo guardado');
});

test('un fallo guarda el error y conserva los datos que ya había', async () => {
  const a = crearAlmacen();
  await a.cargar('x', async () => 'bien');
  await a.cargar('x', async () => { throw new Error('sin red'); }, { forzar: true });
  assert.equal(a.leer('x').datos, 'bien');
  assert.equal(a.leer('x').error.message, 'sin red');
  // Y el siguiente intento que sale bien limpia el error.
  await a.cargar('x', async () => 'otra vez', { forzar: true });
  assert.deepEqual(a.leer('x'), { datos: 'otra vez', listo: true, error: null });
});

test('un fallo sin datos previos deja la entrada sin datos y con error', async () => {
  const a = crearAlmacen();
  await a.cargar('x', async () => { throw new Error('mal'); });
  assert.equal(a.leer('x').listo, false);
  assert.equal(a.leer('x').error.message, 'mal');
});

test('los oyentes se avisan en cada cambio y dejan de avisarse al darse de baja', async () => {
  const a = crearAlmacen();
  let avisos = 0;
  const baja = a.suscribir('x', () => { avisos += 1; });
  await a.cargar('x', async () => 1);
  assert.equal(avisos, 1);
  baja();
  await a.cargar('x', async () => 2, { forzar: true });
  assert.equal(avisos, 1);
});

test('cada clave va por separado y limpiar lo olvida todo y avisa', async () => {
  const a = crearAlmacen();
  let avisos = 0;
  a.suscribir('x', () => { avisos += 1; });
  await a.cargar('x', async () => 'x'); // 1 aviso
  await a.cargar('y', async () => 'y');
  assert.equal(a.leer('y').datos, 'y');
  a.limpiar();
  assert.equal(a.leer('x').listo, false);
  assert.equal(a.leer('y').listo, false);
  assert.equal(avisos, 2); // el de cargar y el de limpiar
});

test('limpiar descarta lo que llegue después de una petición ya lanzada (no se cuela en la cuenta siguiente)', async () => {
  const a = crearAlmacen();
  const p = pendiente();
  a.cargar('x', () => p.promesa);
  a.limpiar(); // cierra sesión
  p.resolver('de la cuenta anterior');
  await esperar();
  assert.equal(a.leer('x').listo, false);
  assert.equal(a.leer('x').datos, undefined);
});
