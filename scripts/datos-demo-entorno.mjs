// Datos de ejemplo para ver el portal completo sin rellenar la cuenta a mano: personas de «Tu
// entorno» con su estimación y observaciones, y un resultado del test de carácter.
//
// Lo usa scripts/seed-entorno-demo.mjs (línea de comandos) y también puede llamarse desde la propia web
// en desarrollo con la sesión ya iniciada. Escribe SOLO con la sesión de quien lo ejecuta (RLS): nunca
// toca datos de otra cuenta. Es idempotente: no repite personas con el mismo nombre ni un test de
// carácter si ya hay uno.
import { AVATARES, puntuar } from '../src/lib/personas.js';

// Ocho respuestas con `primario` en cinco, `secundario` en dos y un «No lo sé»: da confianza alta.
const respuestasPara = (primario, secundario) => [primario, primario, secundario, primario, primario, secundario, primario, 'nose'];

// [nombre, grupo, relación, avatar, primario, secundario, estrella]
const PERSONAS = [
  ['Ana', 'familia', 'pareja', AVATARES[0], 'MEL', 'SAN', true],
  ['Marta', 'familia', 'hija', AVATARES[10], 'SAN', 'FLE', false],
  ['Papá', 'familia', 'padre', AVATARES[8], 'FLE', 'MEL', false],
  ['Javier', 'amigos', 'amigo', AVATARES[3], 'SAN', 'COL', false],
  ['Carmen', 'amigos', 'amiga', AVATARES[2], 'MEL', 'FLE', false],
  ['Pedro', 'trabajo', 'jefe', AVATARES[5], 'COL', 'MEL', true],
  ['Laura', 'trabajo', 'compañera', AVATARES[4], 'COL', 'SAN', false],
  ['Sergio', 'trabajo', 'compañero', AVATARES[7], 'FLE', 'SAN', false],
];

// [persona, situación, palabra, temperamento de la palabra, línea]
const OBSERVACIONES = [
  ['Pedro', 'critica', 'Se enfadó', 'COL', 'Se lo tomó mal delante del equipo.'],
  ['Pedro', 'cambio_planes', 'Actuó rápido', 'COL', null],
  ['Ana', 'problema', 'Le dio vueltas', 'MEL', 'Lo estuvo pensando varios días.'],
  ['Javier', 'buena_noticia', 'Lo contó', 'SAN', null],
];

// Un resultado de carácter verosímil, con la forma que guarda la web y la app móvil.
export const RESULTADO_CARACTER = {
  self: { magnanimidad: 72, humildad: 48, prudencia: 63, fortaleza: 41, dominio: 58, justicia: 70 },
  facets: {
    magnanimidad: { passive: 68, active: 76 }, humildad: { passive: 52, active: 44 }, prudencia: { passive: 60, active: 66 },
    fortaleza: { passive: 45, active: 37 }, dominio: { passive: 55, active: 61 }, justicia: { passive: 72, active: 68 },
  },
};

/** Lo que se va a crear, sin tocar nada (para `--dry` y para las pruebas). */
export function planDeDatos() {
  return {
    personas: PERSONAS.map(([nombre, grupo, relacion, avatar, primario, secundario, estrella]) => {
      const respuestas = respuestasPara(primario, secundario);
      return { nombre, grupo, relacion, avatar, estrella, respuestas, ...puntuar(respuestas) };
    }),
    observaciones: OBSERVACIONES.map(([persona, situacion, palabra, temperamento, linea]) => ({ persona, situacion, palabra, temperamento, linea })),
    caracter: RESULTADO_CARACTER,
  };
}

const comprobar = ({ data, error }, que) => {
  if (error) throw new Error(`${que}: ${error.message}`);
  return data;
};

/**
 * Crea los datos de ejemplo para `userId` con el cliente de Supabase `supabase` (con la sesión de ese
 * usuario). Devuelve cuántas personas, observaciones y tests de carácter ha creado.
 */
export async function sembrar(supabase, userId) {
  const plan = planDeDatos();
  const hecho = { personas: 0, observaciones: 0, caracter: 0 };

  const existentes = comprobar(await supabase.from('personas').select('id, nombre'), 'leer personas');
  const porNombre = new Map(existentes.map((p) => [p.nombre, p.id]));

  for (const p of plan.personas) {
    if (porNombre.has(p.nombre)) continue;
    const persona = comprobar(await supabase.from('personas').insert({
      user_id: userId, nombre: p.nombre, grupo: p.grupo, relacion: p.relacion, avatar: p.avatar, estrella: p.estrella,
      estado: 'estimado', primario: p.primario, secundario: p.secundario, confianza: p.confianza, puntos: p.puntos,
    }).select('id').single(), `crear ${p.nombre}`);
    comprobar(await supabase.from('persona_estimaciones').insert({
      persona_id: persona.id, user_id: userId, respuestas: p.respuestas, desempate: null,
      puntos: p.puntos, primario: p.primario, secundario: p.secundario, confianza: p.confianza,
    }), `estimación de ${p.nombre}`);
    porNombre.set(p.nombre, persona.id);
    hecho.personas += 1;
  }

  // Las observaciones solo de las personas que acaba de crear este script: no se duplican al repetir.
  const nuevas = new Set(plan.personas.filter((p) => !existentes.some((e) => e.nombre === p.nombre)).map((p) => p.nombre));
  for (const o of plan.observaciones) {
    if (!nuevas.has(o.persona)) continue;
    comprobar(await supabase.from('persona_observaciones').insert({
      persona_id: porNombre.get(o.persona), user_id: userId, situacion: o.situacion, palabra: o.palabra, temperamento: o.temperamento, linea: o.linea,
    }), `observación de ${o.persona}`);
    hecho.observaciones += 1;
  }

  const { count } = await supabase.from('test_results').select('id', { count: 'exact', head: true }).eq('kind', 'character');
  if (!count) {
    comprobar(await supabase.from('test_results').insert({
      user_id: userId, test_id: 'vl-caracter', test_version: '1.0.0', kind: 'character', source: 'self', result: plan.caracter,
    }), 'test de carácter');
    hecho.caracter = 1;
  }
  return hecho;
}
