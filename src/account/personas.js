// Fichas de personas del Camino (personas, persona_estimaciones, persona_observaciones en el Supabase
// de Virtus). RLS: cada cuenta solo ve y toca sus fichas. Son datos de terceros: solo los ve la cuenta.
import { supabase } from './supabase';

export class PersonasError extends Error {}

const comprobar = ({ data, error }) => {
  if (error) throw new PersonasError(error.message);
  return data;
};
const ahora = () => new Date().toISOString();

export async function listarPersonas() {
  return comprobar(await supabase.from('personas').select('*').order('creado_en')) ?? [];
}

export async function leerPersona(id) {
  const [persona, observaciones] = await Promise.all([
    supabase.from('personas').select('*').eq('id', id).maybeSingle(),
    supabase.from('persona_observaciones').select('*').eq('persona_id', id).order('creado_en', { ascending: false }),
  ]);
  return { persona: comprobar(persona), observaciones: comprobar(observaciones) ?? [] };
}

/** Crea la ficha y, si hubo test, guarda la estimación. Devuelve la ficha. */
export async function crearPersona(userId, datos, estimacion) {
  const persona = comprobar(await supabase.from('personas').insert({
    user_id: userId, ...datos, ...camposDeEstimacion(estimacion),
  }).select().single());
  if (estimacion) await guardarEstimacion(userId, persona.id, estimacion, { soloHistorial: true });
  return persona;
}

function camposDeEstimacion(e) {
  if (!e) return {};
  return {
    estado: e.primario ? 'estimado' : 'sin_estimar',
    primario: e.primario, secundario: e.secundario, confianza: e.confianza, puntos: e.puntos,
  };
}

/** Guarda un test sobre la persona (historial) y actualiza su temperamento estimado. */
export async function guardarEstimacion(userId, personaId, e, { soloHistorial = false } = {}) {
  comprobar(await supabase.from('persona_estimaciones').insert({
    persona_id: personaId, user_id: userId, respuestas: e.respuestas, desempate: e.desempate ?? null,
    puntos: e.puntos, primario: e.primario, secundario: e.secundario, confianza: e.confianza,
  }));
  if (!soloHistorial) await actualizarPersona(personaId, camposDeEstimacion(e));
}

export async function actualizarPersona(id, campos) {
  return comprobar(await supabase.from('personas').update({ ...campos, actualizado_en: ahora() }).eq('id', id).select().single());
}

export async function borrarPersona(id) {
  comprobar(await supabase.from('personas').delete().eq('id', id));
}

export async function borrarTodasLasPersonas(userId) {
  comprobar(await supabase.from('personas').delete().eq('user_id', userId));
}

export async function anotarObservacion(userId, personaId, { situacion, palabra, temperamento, linea }) {
  return comprobar(await supabase.from('persona_observaciones').insert({
    persona_id: personaId, user_id: userId, situacion, palabra, temperamento, linea: linea || null,
  }).select().single());
}

export async function borrarObservacion(id) {
  comprobar(await supabase.from('persona_observaciones').delete().eq('id', id));
}

export async function observacionesDe(personaId) {
  return comprobar(await supabase.from('persona_observaciones').select('*').eq('persona_id', personaId)) ?? [];
}

export async function anioNacimiento(userId) {
  const { data } = await supabase.from('profiles').select('birth_year').eq('id', userId).maybeSingle();
  return data?.birth_year ?? null;
}
