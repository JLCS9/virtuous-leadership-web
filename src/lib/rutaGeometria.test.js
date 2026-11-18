// Tests de la geometría del camino (src/lib/rutaGeometria.js). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dParcial, dTramo, longitudTramo, puntoEnTramo } from './rutaGeometria.js';

const A = { x: 90, y: 110 };
const B = { x: 240, y: 190 };
const cerca = (p, q, tol = 0.01) => assert.ok(Math.hypot(p.x - q.x, p.y - q.y) <= tol, `${JSON.stringify(p)} ≠ ${JSON.stringify(q)}`);

test('el tramo empieza en un bloque, termina en el otro y es más largo que la línea recta', () => {
  cerca(puntoEnTramo(A, B, 0), A);
  cerca(puntoEnTramo(A, B, longitudTramo(A, B)), B);
  assert.ok(longitudTramo(A, B) > Math.hypot(B.x - A.x, B.y - A.y));
});

test('fuera de rango la distancia se queda en los extremos', () => {
  cerca(puntoEnTramo(A, B, -50), A);
  cerca(puntoEnTramo(A, B, 99999), B);
});

test('avanzar por el tramo va siempre hacia la derecha y nunca retrocede', () => {
  const largo = longitudTramo(A, B);
  let anterior = puntoEnTramo(A, B, 0);
  for (let d = 5; d <= largo; d += 5) {
    const p = puntoEnTramo(A, B, d);
    assert.ok(p.x >= anterior.x - 1e-9, `retrocede en ${d}`);
    anterior = p;
  }
});

test('la distancia se mide por longitud: la mitad del camino está a la mitad de su longitud', () => {
  const largo = longitudTramo(A, B);
  const medio = puntoEnTramo(A, B, largo / 2);
  // El tramo en «S» es simétrico: su punto medio está en el centro del recuadro.
  cerca(medio, { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }, 1);
});

test('trazos: el completo es una curva y el parcial empieza en el inicio y acaba en el punto pedido', () => {
  assert.match(dTramo(A, B), /^M 90 110 C /);
  const d = dParcial(A, B, 80);
  assert.match(d, /^M 90 110 L /);
  const ultimo = d.trim().split(' L ').pop().split(' ').map(Number);
  cerca({ x: ultimo[0], y: ultimo[1] }, puntoEnTramo(A, B, 80), 0.01);
  // Distancia 0: solo el punto inicial.
  assert.match(dParcial(A, B, 0), /^M 90 110 L 90\.00 110\.00$/);
});

test('un tramo recto horizontal mide lo que separa a los bloques', () => {
  const p = { x: 0, y: 100 };
  const q = { x: 150, y: 100 };
  assert.ok(Math.abs(longitudTramo(p, q) - 150) < 0.01);
});
