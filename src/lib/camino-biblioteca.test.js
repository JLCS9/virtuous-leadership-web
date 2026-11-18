// Integridad de la biblioteca de retos del Camino (src/data/camino-biblioteca.json, generada con
// scripts/extract-retos-xlsx.py). No fija cuántos retos o citas hay: el contenido crece sin tocar
// código. Comprueba que lo que haya sea coherente. `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const biblioteca = JSON.parse(readFileSync(new URL('../data/camino-biblioteca.json', import.meta.url), 'utf8'));
const { retos, citas, variables, preguntas_iniciales: preguntas, habitos } = biblioteca;

const TEMPS = ['COL', 'MEL', 'SAN', 'FLE'];
const VALIDACIONES = ['aprobado', 'pendiente', 'cambiar', 'descartado'];
const OPCIONES = ['persona', 'habito', 'situacion'];
const llaves = (t) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
const sinRepetidos = (ids) => assert.equal(new Set(ids).size, ids.length);

const idsVariables = new Set(variables.map((v) => v.id));
const idsRetos = new Set(retos.map((r) => r.id));
const idsCitas = new Set(citas.map((c) => c.id));

test('hay contenido para los cuatro temperamentos', () => {
  for (const t of TEMPS) assert.ok(retos.some((r) => r.temperamento === t), `sin retos de ${t}`);
  assert.ok(biblioteca.meta.version && biblioteca.meta.fuente);
});

test('los identificadores no se repiten', () => {
  sinRepetidos(retos.map((r) => r.id));
  sinRepetidos(citas.map((c) => c.id));
  sinRepetidos(variables.map((v) => v.id));
});

test('cada reto tiene sus tres opciones, su noche y una validación conocida', () => {
  for (const r of retos) {
    assert.ok(TEMPS.includes(r.temperamento), r.id);
    assert.ok(VALIDACIONES.includes(r.validacion), r.id);
    for (const o of OPCIONES) assert.ok(r.opciones[o]?.length > 0, `${r.id}: falta la opción ${o}`);
    for (const k of ['reflexion', 'nutrir', 'variable']) assert.ok(r.noche[k]?.length > 0, `${r.id}: falta noche.${k}`);
  }
});

test('las llaves solo aparecen en las opciones y son variables definidas', () => {
  for (const r of retos) {
    for (const o of OPCIONES) for (const v of llaves(r.opciones[o])) assert.ok(idsVariables.has(v), `${r.id}: {${v}} no está definida`);
    for (const t of [r.consigna, r.noche.reflexion, r.noche.nutrir]) assert.deepEqual(llaves(t), [], `${r.id}: llaves fuera de las opciones`);
    assert.ok(idsVariables.has(r.noche.variable), `${r.id}: la variable de la noche no existe`);
  }
});

test('cada variable tiene un texto por defecto y una pregunta que la alimenta', () => {
  const alimentadas = new Set([...retos.map((r) => r.noche.variable), ...preguntas.map((p) => p.variable)]);
  for (const v of variables) {
    assert.ok(v.defecto.length > 0, `${v.id}: sin texto por defecto`);
    assert.ok(alimentadas.has(v.id), `${v.id}: ninguna pregunta la alimenta`);
  }
});

test('las variables de persona son las que empiezan por persona_', () => {
  for (const v of variables) assert.equal(v.persona, v.id.startsWith('persona_'), v.id);
});

test('las citas y los retos se refieren entre sí en los dos sentidos', () => {
  for (const r of retos) {
    for (const q of r.citas) {
      assert.ok(idsCitas.has(q), `${r.id}: cita inexistente ${q}`);
      assert.ok(citas.find((c) => c.id === q).retos.includes(r.id), `${r.id}: ${q} no la liga`);
    }
  }
  for (const c of citas) {
    assert.ok(c.texto.length > 0 && c.autor.length > 0, c.id);
    assert.ok(c.retos.length > 0 || c.libre, `${c.id}: no encaja con ningún reto y no es libre`);
    assert.ok(['manana', 'noche'].includes(c.momento), c.id);
    assert.ok(['alex', 'citado'].includes(c.origen), c.id);
    assert.ok(VALIDACIONES.includes(c.validacion), c.id);
    for (const rid of c.retos) {
      assert.ok(idsRetos.has(rid), `${c.id}: reto inexistente ${rid}`);
      assert.ok(retos.find((r) => r.id === rid).citas.includes(c.id), `${c.id}: ${rid} no la sugiere`);
    }
  }
});

test('las preguntas iniciales: de cada temperamento van numeradas 1, 2, 3… y usan variables definidas', () => {
  for (const t of TEMPS) {
    const ordenes = preguntas.filter((p) => p.temperamento === t).map((p) => p.orden).sort((a, b) => a - b);
    assert.ok(ordenes.length > 0, `sin preguntas de ${t}`);
    assert.deepEqual(ordenes, ordenes.map((_, i) => i + 1), t);
  }
  for (const p of preguntas) {
    assert.ok(idsVariables.has(p.variable), p.variable);
    assert.ok(VALIDACIONES.includes(p.validacion), p.pregunta);
  }
});

test('la configuración de hábitos tiene sus seis números y es coherente', () => {
  const claves = ['max_activos', 'dias_prueba', 'dias_ventana', 'dias_consolidar', 'min_semana', 'semanas_bajo'];
  for (const k of claves) assert.ok(Number.isInteger(habitos[k]) && habitos[k] > 0, k);
  assert.ok(habitos.dias_consolidar <= habitos.dias_ventana, 'no se puede consolidar con más días que la ventana');
  assert.ok(habitos.min_semana <= 7);
});
