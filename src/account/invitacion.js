// Lado de la persona invitada: llega al test de temperamento con ?inv=<token> (enlace que le ha
// compartido alguien desde «Tu entorno»). El token se recuerda en este navegador hasta que decide si
// comparte su resultado y, si dice que sí, hasta que el servidor lo acepta (necesita sesión y un
// resultado de temperamento guardado). Nada de esto toca el flujo del test.
import { supabase } from './supabase';

const API_BASE = (import.meta.env.VITE_ACCOUNT_URL || '/api/account').replace(/\/account$/, '');
const CLAVE = 'vl-invitacion';
const TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;

/** { token, compartir: null | true | false } o null. */
export function leerInvitacion() {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    return v && TOKEN_RE.test(v.token) ? v : null;
  } catch {
    return null;
  }
}

function escribir(v) {
  try {
    if (v) localStorage.setItem(CLAVE, JSON.stringify(v));
    else localStorage.removeItem(CLAVE);
  } catch { /* sin almacenamiento: la invitación solo vive en esta página */ }
}

export const olvidarInvitacion = () => escribir(null);

// «Ha llegado por invitación» en esta pestaña, comparta o no su resultado. El test lo usa para
// saltarse la pregunta «¿cómo has llegado?» y anotar el origen como referido.
const CLAVE_REFERIDO = 'vl-referido';
export const ORIGEN_REFERIDO = 'referido';
export function esReferido() {
  try { return sessionStorage.getItem(CLAVE_REFERIDO) === '1'; } catch { return false; }
}
function marcarReferido() {
  try { sessionStorage.setItem(CLAVE_REFERIDO, '1'); } catch { /* sin almacenamiento */ }
}

/** Guarda el token de ?inv= (si es nuevo, la decisión vuelve a estar pendiente). Devuelve la invitación. */
export function capturarInvitacion(search) {
  const token = new URLSearchParams(search).get('inv');
  const actual = leerInvitacion();
  if (token && TOKEN_RE.test(token)) marcarReferido();
  if (!token || !TOKEN_RE.test(token) || actual?.token === token) return actual;
  const nueva = { token, compartir: null };
  escribir(nueva);
  return nueva;
}

export function decidirInvitacion(compartir) {
  const actual = leerInvitacion();
  if (!actual) return null;
  if (!compartir) { escribir(null); return null; }
  const nueva = { ...actual, compartir: true };
  escribir(nueva);
  return nueva;
}

/** { status: 'ok', de } | { status: 'invalida' | 'usada' | 'caducada' } | null si no se pudo consultar. */
export async function infoInvitacion(token) {
  try {
    const res = await fetch(`${API_BASE}/invitacion?token=${encodeURIComponent(token)}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

/**
 * Comparte el temperamento con quien invitó. Devuelve el estado del servidor ('ok', 'usada',
 * 'invalida', 'caducada', 'propia', 'sin_resultado') o null si no hay sesión o falló la red.
 */
export async function aceptarInvitacion(token) {
  try {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    const acceso = data.session?.access_token;
    if (!acceso) return null;
    const res = await fetch(`${API_BASE}/invitacion/aceptar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${acceso}` },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    return (await res.json()).status ?? null;
  } catch {
    return null;
  }
}
