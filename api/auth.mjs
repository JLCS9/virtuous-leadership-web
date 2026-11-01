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
//   BREVO_SENDER_EMAIL / BREVO_SENDER_NAME
//                              → remitente verificado en Brevo para el email al
//                                tutor de un menor de 14. Sin él, el alta de
//                                menores responde 503 (no se crea nada).

import crypto from 'crypto';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const accountsEnabled = Boolean(SUPABASE_URL && SERVICE_KEY);

const LANGS = new Set(['es', 'en', 'fr', 'ru']);

// Versión vigente de los textos de consentimiento del formulario del test.
// Cambiarla cada vez que cambie la redacción de las casillas (i18n gate.*).
export const CONSENT_TEXT_VERSION = 'v1-2026-11-01';

// Edad mínima para consentir sin tutor (LOPDGDD art. 7).
export const MIN_AGE_OWN_CONSENT = 14;

// Menor de 14 según el año de nacimiento. Si este año cumple justo 14, decide
// la respuesta a «¿Has cumplido ya 14 años?» (turned14); sin respuesta, menor.
export function isUnder14(birthYear, turned14) {
  const age = new Date().getFullYear() - Number(birthYear);
  if (age < MIN_AGE_OWN_CONSENT) return true;
  if (age === MIN_AGE_OWN_CONSENT) return turned14 !== true;
  return false;
}

const adminHeaders = () => ({
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
});

// PostgREST con la service role key (salta RLS: solo para escrituras del servidor).
async function rest(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { ...adminHeaders(), Prefer: 'return=representation' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path.split('?')[0]} → HTTP ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

async function updateAuthUser(userId, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`update user → HTTP ${res.status}`);
}

// Usuario dueño de un access token de Supabase (o null si no es válido).
export async function userFromToken(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

// Registra consentimientos (append-only). rows: [{ purpose, granted, guardian_email? }]
export async function recordConsents(userId, rows, { locale, source }) {
  await rest('POST', 'consents', rows.map(r => ({
    user_id: userId,
    purpose: r.purpose,
    granted: r.granted,
    text_version: CONSENT_TEXT_VERSION,
    locale: LANGS.has(locale) ? locale : 'es',
    source,
    guardian_email: r.guardian_email || null,
  })));
}

// Devuelve { status: 'created', userId } | { status: 'exists' } | { status: 'error', detail }.
// pendingGuardian: la cuenta nace bloqueada hasta que el tutor la autorice.
export async function createAccount({ email, password, name, birthYear, sex, language, consentAt, pendingGuardian = false }) {
  const body = {
    email,
    password,
    email_confirm: true,
    ...(pendingGuardian ? { ban_duration: '876000h' } : {}),
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

  if (res.ok) {
    const user = await res.json();
    return { status: 'created', userId: user.id };
  }

  let data = {};
  try { data = await res.json(); } catch {}
  // GoTrue responde 422 con error_code "email_exists" (versiones recientes)
  // o un mensaje "already been registered" (versiones antiguas).
  const msg = `${data.error_code || ''} ${data.msg || data.message || ''}`;
  if (res.status === 422 && /email_exists|already/i.test(msg)) return { status: 'exists' };
  return { status: 'error', detail: `HTTP ${res.status} ${msg.trim()}` };
}

// ───────── Autorización del tutor (menores de 14) ─────────

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || '';
const SENDER_NAME  = process.env.BREVO_SENDER_NAME || 'Virtuous Leadership';
// Solo para pruebas locales: permite apuntar el envío a un simulador.
const BREVO_API_URL = (process.env.BREVO_API_URL || 'https://api.brevo.com').replace(/\/+$/, '');
export const guardianEmailEnabled = Boolean(SENDER_EMAIL);

const GUARDIAN_DAYS = 30;
const sha256 = v => crypto.createHash('sha256').update(v).digest('hex');

const GUARDIAN_SLUG = { es: 'consentimiento-tutor', en: 'guardian-consent', fr: 'consentement-parental', ru: 'soglasie-roditelya' };

const GUARDIAN_MAIL = {
  es: {
    subject: '{name} necesita tu autorización en Virtuous Leadership',
    body: '<p>Hola:</p><p><strong>{name}</strong> ha hecho el test de temperamento en virtuousleadership.com y ha indicado que eres su padre, madre o tutor. Como tiene menos de 14 años, necesitamos tu autorización para crear su cuenta y guardar su resultado.</p><p><a href="{link}">Revisar y autorizar la cuenta</a></p><p>Si no autorizas la cuenta en {days} días, la borraremos junto con sus datos. Si no conoces a esta persona, ignora este email.</p><p>Virtuous Leadership</p>',
  },
  en: {
    subject: '{name} needs your permission on Virtuous Leadership',
    body: '<p>Hello,</p><p><strong>{name}</strong> took the temperament test on virtuousleadership.com and said you are their parent or guardian. As they are under 14, we need your permission to create their account and keep their result.</p><p><a href="{link}">Review and authorise the account</a></p><p>If you do not authorise it within {days} days, we will delete the account and its data. If you do not know this person, please ignore this email.</p><p>Virtuous Leadership</p>',
  },
  fr: {
    subject: '{name} a besoin de votre autorisation sur Virtuous Leadership',
    body: '<p>Bonjour,</p><p><strong>{name}</strong> a passé le test de tempérament sur virtuousleadership.com et a indiqué que vous êtes son parent ou tuteur. Comme il ou elle a moins de 14 ans, nous avons besoin de votre autorisation pour créer son compte et conserver son résultat.</p><p><a href="{link}">Vérifier et autoriser le compte</a></p><p>Sans autorisation sous {days} jours, nous supprimerons le compte et ses données. Si vous ne connaissez pas cette personne, ignorez cet email.</p><p>Virtuous Leadership</p>',
  },
  ru: {
    subject: '{name} нужно ваше разрешение на Virtuous Leadership',
    body: '<p>Здравствуйте!</p><p><strong>{name}</strong> прошёл(-ла) тест темперамента на virtuousleadership.com и указал(-а), что вы его/её родитель или опекун. Так как ему/ей меньше 14 лет, нам нужно ваше разрешение, чтобы создать аккаунт и сохранить результат.</p><p><a href="{link}">Проверить и разрешить аккаунт</a></p><p>Если вы не дадите разрешение в течение {days} дней, мы удалим аккаунт и его данные. Если вы не знаете этого человека, просто проигнорируйте это письмо.</p><p>Virtuous Leadership</p>',
  },
};

const escapeHtml = v => String(v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

async function sendGuardianEmail({ brevoApiKey, guardianEmail, childName, lang, link }) {
  const tpl = GUARDIAN_MAIL[lang] || GUARDIAN_MAIL.es;
  const fill = str => str.replace(/\{name\}/g, escapeHtml(childName)).replace(/\{link\}/g, link).replace(/\{days\}/g, GUARDIAN_DAYS);
  const res = await fetch(`${BREVO_API_URL}/v3/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: guardianEmail }],
      subject: tpl.subject.replace('{name}', String(childName).slice(0, 80)),
      htmlContent: fill(tpl.body),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`brevo smtp → HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
}

// Crea la solicitud de autorización, marca el perfil como pendiente y envía el
// email al tutor. siteOrigin: https://virtuousleadership.com (o el de pruebas).
export async function requestGuardianConsent({ userId, guardianEmail, childName, lang, siteOrigin, brevoApiKey }) {
  const token = crypto.randomBytes(32).toString('base64url');
  const locale = LANGS.has(lang) ? lang : 'es';
  await rest('POST', 'guardian_requests', {
    user_id: userId,
    guardian_email: guardianEmail,
    token_hash: sha256(token),
    locale,
    expires_at: new Date(Date.now() + GUARDIAN_DAYS * 86400000).toISOString(),
  });
  await rest('PATCH', `profiles?id=eq.${userId}`, { guardian_status: 'pendiente' });
  const link = `${siteOrigin}/${locale}/${GUARDIAN_SLUG[locale]}?token=${token}`;
  await sendGuardianEmail({ brevoApiKey, guardianEmail, childName, lang: locale, link });
}

// Confirma la autorización: desbloquea la cuenta y registra el consentimiento.
// Devuelve 'ok' | 'invalid' | 'expired' | 'already'.
export async function confirmGuardianConsent(token) {
  if (typeof token !== 'string' || token.length < 20) return 'invalid';
  const rows = await rest('GET', `guardian_requests?token_hash=eq.${sha256(token)}&select=*`);
  const req = rows?.[0];
  if (!req) return 'invalid';
  if (req.confirmed_at) return 'already';
  if (new Date(req.expires_at) < new Date()) return 'expired';

  await updateAuthUser(req.user_id, { ban_duration: 'none' });
  await rest('PATCH', `guardian_requests?user_id=eq.${req.user_id}`, { confirmed_at: new Date().toISOString() });
  await rest('PATCH', `profiles?id=eq.${req.user_id}`, { guardian_status: 'confirmado' });
  await recordConsents(req.user_id, [
    { purpose: 'tutor', granted: true, guardian_email: req.guardian_email },
  ], { locale: req.locale, source: 'email-tutor' });
  return 'ok';
}

// Deshace un alta que no se ha podido completar (p. ej. falló el email al tutor):
// borra el usuario y, en cascada, su perfil, consentimientos y resultados.
export async function deleteAccount(userId) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: adminHeaders(),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`delete user → HTTP ${res.status}`);
}

// Guarda el resultado de un menor pendiente (no tiene sesión: lo escribe el servidor).
export async function saveResultAsServer(userId, result) {
  await rest('POST', 'test_results', {
    user_id: userId,
    test_id: 'vl-temperamento',
    test_version: 'tbp-v1',
    kind: 'temperament',
    result,
  });
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
