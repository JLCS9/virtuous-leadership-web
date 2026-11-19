// Onboarding del portal (/app/bienvenida). Dos columnas de `profiles`:
//  · onboarded_at            — cuándo terminó el onboarding del portal. Mientras sea null, el portal le
//                              manda a /app/bienvenida (lo comprueba PortalGuard).
//  · first_portal_access_at  — la primera vez que entró al portal. Se rellena sola la primera vez.
// Si la consulta falla (red, o la columna aún no existe), NO se bloquea el portal: se da por hecho.
import { supabase } from './supabase';

let cache; // { userId, hecho }: se recuerda entre pantallas para no preguntar en cada navegación

/** ¿Ha terminado el onboarding? true · false. Registra además la primera entrada al portal. */
export async function onboardingHecho(userId) {
  if (cache?.userId === userId) return cache.hecho;
  const { data, error } = await supabase.from('profiles').select('onboarded_at, first_portal_access_at').eq('id', userId).maybeSingle();
  if (error) {
    console.warn('[onboarding] no se pudo comprobar; no se bloquea el portal:', error.message);
    return true;
  }
  if (data && !data.first_portal_access_at) {
    supabase.from('profiles').update({ first_portal_access_at: new Date().toISOString() }).eq('id', userId)
      .then(({ error: e }) => { if (e) console.warn('[onboarding] primera entrada sin guardar:', e.message); });
  }
  cache = { userId, hecho: Boolean(data?.onboarded_at) };
  return cache.hecho;
}

/**
 * Marca el onboarding como terminado. Solo la primera vez: repetirlo desde Perfil no cambia la fecha.
 * Lanza si no se puede guardar (si no, el portal le volvería a mandar al onboarding).
 */
export async function marcarOnboardingHecho(userId) {
  const { error } = await supabase.from('profiles').update({ onboarded_at: new Date().toISOString() })
    .eq('id', userId).is('onboarded_at', null);
  if (error) throw error;
  cache = { userId, hecho: true };
}

/** Lo que se sabe ya, sin preguntar: true · false · undefined si aún no se ha comprobado. */
export const onboardingEnMemoria = (userId) => (cache?.userId === userId ? cache.hecho : undefined);

/** Al cerrar sesión. */
export const olvidarOnboarding = () => { cache = undefined; };
