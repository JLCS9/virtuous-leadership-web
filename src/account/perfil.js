import { supabase } from './supabase';

export async function leerPerfil(userId) {
  const [profile, tests, personas, camino, consents] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('test_results').select('kind, result, taken_at').eq('user_id', userId).order('taken_at', { ascending: false }),
    supabase.from('personas').select('nombre, grupo, relacion, primario, secundario, estado, estrella, me_cuesta').eq('user_id', userId).order('creado_en'),
    supabase.from('perfil_camino').select('momentos, estado_vida, objetivo, vida_interior, ritmo, hora_manana, hora_examen, inicio').eq('user_id', userId).maybeSingle(),
    supabase.from('consents').select('purpose, granted, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  return {
    profile: profile.data,
    tests: tests.data ?? [],
    personas: personas.data ?? [],
    camino: camino.data,
    consents: consents.data ?? [],
  };
}

export async function cambiarPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
