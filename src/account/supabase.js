// Cliente de Supabase (proyecto de Virtus: la misma cuenta sirve en la app).
// Si faltan las VITE_SUPABASE_* el sitio funciona como antes, sin cuentas:
// el test vuelve a la página de gracias y /mi-panel no ofrece login.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export const accountsEnabled = Boolean(supabase);
