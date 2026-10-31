// Retos diarios de carácter (método Havard), compartidos con la app Virtus.
// Toda la lógica vive en las Edge Functions retos-* del proyecto Supabase de Virtus;
// aquí solo se llaman. La web va tras la puerta 'retos_web' (feature_access): por ahora
// solo cuentas autorizadas. La cabecera x-virtus-cliente: web hace que el servidor lo exija.
import { supabase } from './supabase';

export class RetosError extends Error {
  constructor(code) { super(code); this.code = code; }
}

/** ¿Tiene esta cuenta acceso a los retos en la web? (RLS: cada uno solo ve sus filas.) */
export async function tieneAccesoRetos() {
  if (!supabase) return false;
  const { data } = await supabase.from('feature_access').select('feature').eq('feature', 'retos_web').maybeSingle();
  return Boolean(data);
}

/** Fecha local YYYY-MM-DD: el día del usuario, no el de UTC. */
export function fechaLocal(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function llamar(fn, body) {
  const { data, error } = await supabase.functions.invoke(fn, { body, headers: { 'x-virtus-cliente': 'web' } });
  if (error) {
    const status = error.context?.status;
    throw new RetosError(status === 403 ? 'forbidden' : status === 503 ? 'unavailable' : 'failed');
  }
  return data;
}

export const retoDeHoy = () => llamar('retos-manana', { fecha: fechaLocal() });
export const turnoNoche = (entrada) => llamar('retos-noche', { fecha: fechaLocal(), entrada });
export const turnoOnboarding = (texto) => llamar('retos-onboarding', { fecha: fechaLocal(), texto });
