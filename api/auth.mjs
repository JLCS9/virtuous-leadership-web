// Cuentas de usuario en el Supabase de Virtus (la misma cuenta sirve en la app).
//
// La web crea la cuenta al terminar el test de temperamento. Se usa la Admin
// API de Supabase Auth (GoTrue) con la service role key para dar la cuenta por
// confirmada y que el usuario entre a su panel sin esperar un email. Los datos
// del formulario van en user_metadata; el trigger handle_new_user de Virtus
// los copia a public.profiles.
//
// Variables de entorno:
//   SUPABASE_URL               → https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  → service role key (solo servidor, nunca al front)

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const accountsEnabled = Boolean(SUPABASE_URL && SERVICE_KEY);

const LANGS = new Set(['es', 'en', 'fr', 'ru']);

// Devuelve { status: 'created' } | { status: 'exists' } | { status: 'error', detail }.
export async function createAccount({ email, password, name, birthYear, sex, language, consentAt }) {
  const body = {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: name,
      birth_year: birthYear ? String(birthYear) : undefined,
      sex: sex === 'mujer' || sex === 'hombre' ? sex : undefined,
      locale: LANGS.has(language) ? language : 'es',
      consent_at: consentAt,
      signup_source: 'web-test-temperamento',
    },
  };

  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    return { status: 'error', detail: err.message };
  }

  if (res.ok) return { status: 'created' };

  let data = {};
  try { data = await res.json(); } catch {}
  // GoTrue responde 422 con error_code "email_exists" (versiones recientes)
  // o un mensaje "already been registered" (versiones antiguas).
  const msg = `${data.error_code || ''} ${data.msg || data.message || ''}`;
  if (res.status === 422 && /email_exists|already/i.test(msg)) return { status: 'exists' };
  return { status: 'error', detail: `HTTP ${res.status} ${msg.trim()}` };
}

// Límite simple en memoria: N intentos por IP en una ventana deslizante.
// Basta para frenar abusos del alta; el proceso es único (un contenedor).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map();

export function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(ts => now - ts < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some(ts => now - ts < WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}
