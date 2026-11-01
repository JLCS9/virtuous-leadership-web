// Camino · los 14 primeros días. Se guarda en el Supabase de Virtus (camino_perfil, camino_dias,
// camino_linea_base); RLS: cada cuenta solo lee y escribe sus filas.
import { supabase } from './supabase';

export class CaminoError extends Error {}

const comprobar = ({ data, error }) => {
  if (error) throw new CaminoError(error.message);
  return data;
};

export async function leerCamino() {
  const [perfil, dias, lineaBase] = await Promise.all([
    supabase.from('camino_perfil').select('*').maybeSingle(),
    supabase.from('camino_dias').select('*').order('dia'),
    supabase.from('camino_linea_base').select('*').maybeSingle(),
  ]);
  return { perfil: comprobar(perfil), dias: comprobar(dias) ?? [], lineaBase: comprobar(lineaBase) };
}

const ahora = () => new Date().toISOString();

export async function guardarPerfil(userId, campos) {
  return comprobar(await supabase.from('camino_perfil')
    .upsert({ user_id: userId, ...campos, actualizado_en: ahora() }).select().single());
}

export async function guardarSesion(userId, dia, { juego, conQuien }) {
  return comprobar(await supabase.from('camino_dias')
    .upsert({ user_id: userId, dia, sesion_en: ahora(), juego: juego ?? null, con_quien: conQuien ?? null, actualizado_en: ahora() })
    .select().single());
}

export async function guardarExamen(userId, dia, examen) {
  return comprobar(await supabase.from('camino_dias')
    .upsert({ user_id: userId, dia, examen_en: ahora(), examen, actualizado_en: ahora() })
    .select().single());
}

export async function guardarLineaBase(userId, campos) {
  return comprobar(await supabase.from('camino_linea_base')
    .upsert({ user_id: userId, ...campos, actualizado_en: ahora() }).select().single());
}
