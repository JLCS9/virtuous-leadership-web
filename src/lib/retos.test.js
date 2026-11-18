// Tests de la lógica del Camino diario (src/lib/retos.js). `npm test`.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  CUMPLIDOS, camposDeNutrir, citaDelDia, defectosDe, esValido, filtrarValidos, opcionesDelReto, partesTemperamento,
  pasoDeNoche, preguntasIniciales, preguntasPendientes, retoDelDia, sustituir, valoresDe,
} from './retos.js';

const reto = (id, temperamento, validacion = 'aprobado') => ({
  id, temperamento, validacion,
  opciones: { persona: `A ${id} {persona_trabajo}`, habito: `B ${id}`, situacion: `C ${id} en {reunion}` },
});
const cita = (id, retos = [], extra = {}) => ({ id, retos, libre: false, momento: 'manana', validacion: 'aprobado', ...extra });
const dia = (fecha, reto_id, cita_id) => ({ fecha, reto_id, cita_id });

const DEFECTOS = { persona_trabajo: 'alguien de tu equipo', reunion: 'tu próxima reunión' };

// ───────────── validación ─────────────

test('solo «aprobado» es válido; «pendiente» solo si se pide', () => {
  const lista = ['aprobado', 'pendiente', 'cambiar', 'descartado'].map((validacion) => ({ validacion }));
  assert.deepEqual(filtrarValidos(lista).map((i) => i.validacion), ['aprobado']);
  assert.deepEqual(filtrarValidos(lista, { incluirPendientes: true }).map((i) => i.validacion), ['aprobado', 'pendiente']);
  assert.equal(esValido({ validacion: 'cambiar' }, { incluirPendientes: true }), false);
  assert.equal(esValido({ validacion: 'descartado' }, { incluirPendientes: true }), false);
});

// ───────────── variables ─────────────

test('sustituir: con valor, sin valor y con varias en una frase', () => {
  const t = 'Hoy pido a {persona_trabajo} su opinión en {reunion}.';
  assert.equal(sustituir(t, { persona_trabajo: 'Pedro', reunion: 'la reunión de equipo' }, DEFECTOS),
    'Hoy pido a Pedro su opinión en la reunión de equipo.');
  assert.equal(sustituir(t, {}, DEFECTOS), 'Hoy pido a alguien de tu equipo su opinión en tu próxima reunión.');
  assert.equal(sustituir(t, { persona_trabajo: 'Pedro' }, DEFECTOS), 'Hoy pido a Pedro su opinión en tu próxima reunión.');
});

test('sustituir: vacío o solo espacios cuenta como sin valor; limpia espacios; repite la misma variable', () => {
  assert.equal(sustituir('{persona_trabajo}', { persona_trabajo: '   ' }, DEFECTOS), 'alguien de tu equipo');
  assert.equal(sustituir('{persona_trabajo}', { persona_trabajo: null }, DEFECTOS), 'alguien de tu equipo');
  assert.equal(sustituir('{persona_trabajo}', { persona_trabajo: '  Pedro   Gómez ' }, DEFECTOS), 'Pedro Gómez');
  assert.equal(sustituir('{reunion} y {reunion}', { reunion: 'la comida' }, DEFECTOS), 'la comida y la comida');
});

test('sustituir: una variable desconocida se deja visible y un texto sin llaves no cambia', () => {
  assert.equal(sustituir('Hola {inventada}', {}, DEFECTOS), 'Hola {inventada}');
  assert.equal(sustituir('Hoy hablo el último.', { reunion: 'x' }, DEFECTOS), 'Hoy hablo el último.');
});

test('defectosDe y las tres opciones en orden A, B, C', () => {
  assert.deepEqual(defectosDe([{ id: 'reunion', defecto: 'tu próxima reunión' }]), { reunion: 'tu próxima reunión' });
  const ops = opcionesDelReto(reto('C01', 'COL'), { persona_trabajo: 'Pedro' }, DEFECTOS);
  assert.deepEqual(ops.map((o) => o.clave), ['persona', 'habito', 'situacion']);
  assert.deepEqual(ops.map((o) => o.texto), ['A C01 Pedro', 'B C01', 'C C01 en tu próxima reunión']);
});

test('valoresDe: la ficha manda sobre el texto, y si se borra queda el texto guardado', () => {
  const filas = [
    { variable: 'persona_trabajo', valor: 'Pedro', persona_id: 'p1' },
    { variable: 'persona_cercana', valor: 'Ana', persona_id: 'p2' },
    { variable: 'proyecto', valor: 'el informe', persona_id: null },
    { variable: 'reunion', valor: null, persona_id: null },
    { variable: 'talento', valor: '  ', persona_id: null },
  ];
  const valores = valoresDe(filas, { p1: { nombre: 'Pedro Gómez' } }); // p2 se borró
  assert.deepEqual(valores, { persona_trabajo: 'Pedro Gómez', persona_cercana: 'Ana', proyecto: 'el informe' });
  assert.deepEqual(valoresDe(), {});
});

// ───────────── preguntas iniciales ─────────────

test('preguntas iniciales: del primario, válidas y ordenadas; pendientes las que faltan', () => {
  const p = (temperamento, orden, variable, validacion = 'aprobado') => ({ temperamento, orden, variable, validacion });
  const todas = [p('COL', 2, 'b'), p('MEL', 1, 'x'), p('COL', 1, 'a'), p('COL', 3, 'c', 'descartado')];
  const col = preguntasIniciales(todas, 'COL');
  assert.deepEqual(col.map((q) => q.variable), ['a', 'b']);
  assert.deepEqual(preguntasPendientes(col, new Set(['a'])).map((q) => q.variable), ['b']);
  assert.deepEqual(preguntasPendientes(col, new Set(['a', 'b'])), []);
});

// ───────────── temperamento ─────────────

test('partesTemperamento: puro, mixto y claves no válidas', () => {
  assert.deepEqual(partesTemperamento('SAN-COL'), { primario: 'SAN', secundario: 'COL' });
  assert.deepEqual(partesTemperamento('COL'), { primario: 'COL', secundario: null });
  assert.deepEqual(partesTemperamento('COL-COL'), { primario: 'COL', secundario: null });
  assert.equal(partesTemperamento('XXX'), null);
  assert.equal(partesTemperamento(null), null);
});

// ───────────── reto del día ─────────────

const RETOS = [
  reto('C01', 'COL'), reto('C02', 'COL'), reto('C03', 'COL'),
  reto('S01', 'SAN'), reto('S02', 'SAN'),
];

test('reto del día: el primero de la biblioteca si no hay historial, y es siempre el mismo', () => {
  assert.equal(retoDelDia({ retos: RETOS, clave: 'COL', fecha: '2026-12-01' }).id, 'C01');
  assert.equal(retoDelDia({ retos: RETOS, clave: 'COL', fecha: '2026-12-01' }).id, 'C01');
  assert.equal(retoDelDia({ retos: RETOS, clave: 'SAN', fecha: '2026-12-01' }).id, 'S01');
});

test('reto del día: no repite hasta agotar el temperamento y luego vuelve al que lleva más sin salir', () => {
  const historial = [];
  const salidos = [];
  for (let d = 1; d <= 7; d += 1) {
    const fecha = `2026-12-${String(d).padStart(2, '0')}`;
    const r = retoDelDia({ retos: RETOS, clave: 'COL', historial, fecha });
    salidos.push(r.id);
    historial.push(dia(fecha, r.id));
  }
  assert.deepEqual(salidos, ['C01', 'C02', 'C03', 'C01', 'C02', 'C03', 'C01']);
});

test('reto del día: si hoy ya tiene reto, no cambia aunque cambie el historial anterior', () => {
  const historial = [dia('2026-12-01', 'C01'), dia('2026-12-02', 'C03')];
  assert.equal(retoDelDia({ retos: RETOS, clave: 'COL', historial, fecha: '2026-12-02' }).id, 'C03');
});

test('reto del día: el historial puede venir desordenado', () => {
  const historial = [dia('2026-12-03', 'C03'), dia('2026-12-01', 'C01'), dia('2026-12-02', 'C02')];
  assert.equal(retoDelDia({ retos: RETOS, clave: 'COL', historial, fecha: '2026-12-04' }).id, 'C01');
});

test('reto del día, mixtos: dos del primario y el tercero del secundario', () => {
  const historial = [];
  const temps = [];
  for (let d = 1; d <= 9; d += 1) {
    const fecha = `2026-12-${String(d).padStart(2, '0')}`;
    const r = retoDelDia({ retos: RETOS, clave: 'SAN-COL', historial, fecha });
    temps.push(r.temperamento);
    historial.push(dia(fecha, r.id));
  }
  assert.deepEqual(temps, ['SAN', 'SAN', 'COL', 'SAN', 'SAN', 'COL', 'SAN', 'SAN', 'COL']);
});

test('reto del día, mixtos: se cuenta por días con reto, no por calendario', () => {
  // Faltan los días 2 y 3 del calendario: solo hay dos días con reto, así que el tercero es del secundario.
  const historial = [dia('2026-12-01', 'S01'), dia('2026-12-10', 'S02')];
  assert.equal(retoDelDia({ retos: RETOS, clave: 'SAN-COL', historial, fecha: '2026-12-20' }).temperamento, 'COL');
  // Un día sin reto elegido (fila sin reto_id) no cuenta.
  const conHueco = [dia('2026-12-01', 'S01'), dia('2026-12-02', null), dia('2026-12-03', 'S02')];
  assert.equal(retoDelDia({ retos: RETOS, clave: 'SAN-COL', historial: conHueco, fecha: '2026-12-04' }).temperamento, 'COL');
});

test('reto del día: sin retos del que toca usa el otro; sin ninguno o sin temperamento, null', () => {
  const soloCol = RETOS.filter((r) => r.temperamento === 'COL');
  assert.equal(retoDelDia({ retos: soloCol, clave: 'SAN-COL', fecha: '2026-12-01' }).temperamento, 'COL');
  assert.equal(retoDelDia({ retos: RETOS, clave: 'MEL', fecha: '2026-12-01' }), null);
  assert.equal(retoDelDia({ retos: [], clave: 'COL', fecha: '2026-12-01' }), null);
  assert.equal(retoDelDia({ retos: RETOS, clave: null, fecha: '2026-12-01' }), null);
});

test('reto del día: un reto ya no válido que estaba fijado hoy se sustituye', () => {
  const sinC02 = RETOS.filter((r) => r.id !== 'C02');
  const historial = [dia('2026-12-02', 'C02')];
  assert.notEqual(retoDelDia({ retos: sinC02, clave: 'COL', historial, fecha: '2026-12-02' }).id, 'C02');
});

// ───────────── cita del día ─────────────

const CITAS = [
  cita('Q01', ['C02']), cita('Q02', ['C01']), cita('Q03', ['C01']),
  cita('Q04', [], { libre: true }), cita('Q05', ['C01'], { momento: 'noche' }),
];

test('cita del día: una sugerida para el reto, sin repetir, y las libres solo cuando se agotan las sugeridas', () => {
  const c1 = RETOS[0];
  assert.equal(citaDelDia({ citas: CITAS, reto: c1, fecha: '2026-12-01' }).id, 'Q02');
  const h1 = [dia('2026-12-01', 'C01', 'Q02')];
  assert.equal(citaDelDia({ citas: CITAS, reto: c1, historial: h1, fecha: '2026-12-02' }).id, 'Q03');
  const h2 = [...h1, dia('2026-12-02', 'C01', 'Q03')];
  assert.equal(citaDelDia({ citas: CITAS, reto: c1, historial: h2, fecha: '2026-12-03' }).id, 'Q04'); // libre
  const h3 = [...h2, dia('2026-12-03', 'C01', 'Q04')];
  assert.equal(citaDelDia({ citas: CITAS, reto: c1, historial: h3, fecha: '2026-12-04' }).id, 'Q02'); // la más antigua
});

test('cita del día: no usa las de noche por la mañana, y sí por la noche', () => {
  const c1 = RETOS[0];
  const manana = new Set();
  let historial = [];
  for (let d = 1; d <= 6; d += 1) {
    const fecha = `2026-12-0${d}`;
    const c = citaDelDia({ citas: CITAS, reto: c1, historial, fecha });
    manana.add(c.id);
    historial = [...historial, dia(fecha, 'C01', c.id)];
  }
  assert.ok(!manana.has('Q05'));
  assert.equal(citaDelDia({ citas: CITAS, reto: c1, fecha: '2026-12-01', momento: 'noche' }).id, 'Q05');
});

test('cita del día: la de hoy se mantiene, y sin ninguna disponible devuelve null', () => {
  const historial = [dia('2026-12-01', 'C01', 'Q03')];
  assert.equal(citaDelDia({ citas: CITAS, reto: RETOS[0], historial, fecha: '2026-12-01' }).id, 'Q03');
  assert.equal(citaDelDia({ citas: [], reto: RETOS[0], fecha: '2026-12-01' }), null);
  // Un reto sin sugeridas y sin libres: null, y el reto se enseña igual.
  assert.equal(citaDelDia({ citas: [cita('Q01', ['C02'])], reto: RETOS[0], fecha: '2026-12-01' }), null);
});

test('cita del día: sin reto solo salen las libres', () => {
  assert.equal(citaDelDia({ citas: CITAS, reto: null, fecha: '2026-12-01' }).id, 'Q04');
});

// ───────────── con la biblioteca real ─────────────

const biblioteca = JSON.parse(readFileSync(new URL('../data/camino-biblioteca.json', import.meta.url), 'utf8'));
const defectos = defectosDe(biblioteca.variables);
const dev = { incluirPendientes: true };

test('biblioteca real, en producción: con todo pendiente no hay nada que enseñar y no falla', () => {
  const retos = filtrarValidos(biblioteca.retos);
  if (retos.length) return; // cuando se vayan aprobando, esta prueba deja de aplicar
  assert.equal(retoDelDia({ retos, clave: 'COL', fecha: '2026-12-01' }), null);
  assert.deepEqual(preguntasIniciales(biblioteca.preguntas_iniciales, 'COL'), []);
});

test('biblioteca real: 60 días con cada temperamento y un mixto, sin llaves sin sustituir ni repeticiones antes de tiempo', () => {
  const retos = filtrarValidos(biblioteca.retos, dev);
  const citas = filtrarValidos(biblioteca.citas, dev);
  for (const clave of ['COL', 'MEL', 'SAN', 'FLE', 'SAN-COL', 'FLE-MEL']) {
    const historial = [];
    for (let d = 0; d < 60; d += 1) {
      const fecha = new Date(Date.UTC(2027, 0, 1 + d)).toISOString().slice(0, 10);
      const r = retoDelDia({ retos, clave, historial, fecha });
      assert.ok(r, `${clave} ${fecha}: sin reto`);
      const c = citaDelDia({ citas, reto: r, historial, fecha });
      for (const o of opcionesDelReto(r, {}, defectos)) assert.doesNotMatch(o.texto, /[{}]/, `${r.id} ${o.clave}`);
      if (c) assert.ok(c.retos.includes(r.id) || c.libre, `${c.id} no encaja con ${r.id}`);
      historial.push(dia(fecha, r.id, c?.id ?? null));
    }
    const { primario, secundario } = partesTemperamento(clave);
    const ids = historial.map((h) => h.reto_id);
    const poolPrimario = retos.filter((r) => r.temperamento === primario).length;
    const delPrimario = ids.filter((id) => retos.find((r) => r.id === id).temperamento === primario);
    // Los primeros retos del primario no se repiten hasta agotar su lista.
    const primeros = delPrimario.slice(0, poolPrimario);
    assert.equal(new Set(primeros).size, primeros.length, clave);
    if (secundario) assert.equal(delPrimario.length, 40, `${clave}: dos de cada tres días`);
    // Nunca la misma cita dos días seguidos.
    for (let i = 1; i < historial.length; i += 1) {
      if (historial[i].cita_id) assert.notEqual(historial[i].cita_id, historial[i - 1].cita_id, `${clave} día ${i}`);
    }
  }
});

test('biblioteca real: la sustitución con respuestas de ejemplo usa el ejemplo de la hoja', () => {
  const ejemplos = Object.fromEntries(biblioteca.variables.map((v) => [v.id, v.ejemplo]));
  const c01 = biblioteca.retos.find((r) => r.id === 'C01');
  const [a] = opcionesDelReto(c01, ejemplos, defectos);
  assert.equal(a.texto, 'Hoy pido a Pedro su opinión sobre el cambio de proveedor antes de decidir.');
});

// ───────────── noche ─────────────

test('pasoDeNoche: sin opción no hay examen; luego cumplido, reflexión y hecho', () => {
  assert.equal(pasoDeNoche(null), null);
  assert.equal(pasoDeNoche({ reto_id: 'C01', opcion: null }), null);
  assert.equal(pasoDeNoche({ opcion: 'persona' }), 'cumplido');
  assert.equal(pasoDeNoche({ opcion: 'persona', cumplido: 'quizá' }), 'cumplido');
  for (const cumplido of CUMPLIDOS) assert.equal(pasoDeNoche({ opcion: 'habito', cumplido }), 'reflexion');
  assert.equal(pasoDeNoche({ opcion: 'persona', cumplido: 'no', examen_en: '2026-12-01T21:00:00Z' }), 'hecho');
});

test('camposDeNutrir: la variable del reto y la respuesta limpia; vacío no toca nada', () => {
  const r = reto('C01', 'COL');
  r.noche = { variable: 'decision_pendiente' };
  assert.deepEqual(camposDeNutrir(r, '  el   cambio de proveedor '), { nutrir_variable: 'decision_pendiente', nutrir_respuesta: 'el cambio de proveedor' });
  assert.deepEqual(camposDeNutrir(r, '   '), {});
  assert.deepEqual(camposDeNutrir(r, null), {});
  assert.equal(camposDeNutrir(r, 'x'.repeat(300)).nutrir_respuesta.length, 120);
});

test('biblioteca real: la pregunta de nutrir de cada reto alimenta una variable definida', () => {
  const ids = new Set(biblioteca.variables.map((v) => v.id));
  for (const r of biblioteca.retos) assert.ok(ids.has(camposDeNutrir(r, 'x').nutrir_variable), r.id);
});

test('biblioteca real, en producción: cada temperamento con retos aprobados tiene reto del día, preguntas iniciales y citas', () => {
  const retos = filtrarValidos(biblioteca.retos);
  const citas = filtrarValidos(biblioteca.citas);
  for (const t of ['COL', 'MEL', 'SAN', 'FLE']) {
    if (!retos.some((r) => r.temperamento === t)) continue; // aún sin aprobar: nada que comprobar
    const r = retoDelDia({ retos, clave: t, fecha: '2027-01-01' });
    assert.equal(r.temperamento, t);
    assert.ok(citaDelDia({ citas, reto: r, fecha: '2027-01-01' }), `${t}: sin cita de mañana`);
    assert.ok(preguntasIniciales(biblioteca.preguntas_iniciales, t).length > 0, `${t}: sin preguntas iniciales aprobadas`);
  }
});
