// Invitaciones de «Tu entorno»: quien crea una ficha comparte un enlace al test de temperamento;
// cuando la persona invitada hace el test y acepta compartirlo, su ficha queda verificada con su
// resultado real.
//
// La invitación (public.persona_invitaciones) la crea el front con la sesión de quien invita. Aquí
// solo se lee y se acepta, con la service role key, porque quien acepta no es dueño de la ficha.
// Al dueño de la ficha solo le llega el temperamento (primario y secundario), nunca las respuestas.

import { rest } from './auth.mjs';

const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;
const TEMPS = new Set(['COL', 'MEL', 'SAN', 'FLE']);

async function buscar(token) {
  if (typeof token !== 'string' || !TOKEN_RE.test(token)) return null;
  const rows = await rest('GET', `persona_invitaciones?token=eq.${token}&select=id,persona_id,user_id,caduca_en,aceptada_en`);
  return rows?.[0] ?? null;
}

const estadoDe = (inv) => {
  if (!inv) return 'invalida';
  if (inv.aceptada_en) return 'usada';
  if (inv.caduca_en && new Date(inv.caduca_en) < new Date()) return 'caducada';
  return 'ok';
};

// Temperamento de un test_results.result, en el formato actual ({ primario, secundario }) o en el
// antiguo ({ profileKey | type | profile: 'SAN-COL' }). null si no se reconoce.
export function temperamentoDe(result) {
  if (!result || typeof result !== 'object') return null;
  let [primario, secundario] = [result.primario, result.secundario];
  if (!TEMPS.has(primario)) {
    const clave = [result.profileKey, result.type, result.profile].find((v) => typeof v === 'string') || '';
    [primario, secundario] = clave.toUpperCase().split('-');
  }
  if (!TEMPS.has(primario)) [primario, secundario] = [result.dominant, result.secondary]; // app móvil
  if (!TEMPS.has(primario)) return null;
  return { primario, secundario: TEMPS.has(secundario) && secundario !== primario ? secundario : null };
}

// Lo que ve la persona invitada antes de empezar: quién la invita (solo el nombre de pila).
// → { status: 'ok', de } | { status: 'invalida' | 'usada' | 'caducada' }
export async function infoInvitacion(token) {
  const inv = await buscar(token);
  const status = estadoDe(inv);
  if (status !== 'ok') return { status };
  const perfil = await rest('GET', `profiles?id=eq.${inv.user_id}&select=first_name`);
  return { status, de: String(perfil?.[0]?.first_name || '').slice(0, 80) };
}

// La persona invitada (con sesión) comparte su temperamento con quien la invitó.
// → 'ok' | 'invalida' | 'usada' | 'caducada' | 'propia' | 'sin_resultado'
export async function aceptarInvitacion(token, userId) {
  const inv = await buscar(token);
  const status = estadoDe(inv);
  if (status !== 'ok') return status;
  if (inv.user_id === userId) return 'propia';

  const resultados = await rest('GET', `test_results?user_id=eq.${userId}&kind=eq.temperament&select=result&order=taken_at.desc&limit=1`);
  const temp = temperamentoDe(resultados?.[0]?.result);
  if (!temp) return 'sin_resultado';

  // Primero se consume la invitación (solo si sigue libre): así dos peticiones a la vez no la usan dos veces.
  const ahora = new Date().toISOString();
  const usada = await rest('PATCH', `persona_invitaciones?id=eq.${inv.id}&aceptada_en=is.null`, { aceptada_en: ahora, aceptada_por: userId });
  if (!usada?.length) return 'usada';

  await rest('PATCH', `personas?id=eq.${inv.persona_id}&user_id=eq.${inv.user_id}`, {
    estado: 'confirmado',
    primario: temp.primario,
    secundario: temp.secundario,
    confianza: 'alta',
    verificado_en: ahora,
    actualizado_en: ahora,
  });
  return 'ok';
}
