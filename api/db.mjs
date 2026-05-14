// db.mjs — Capa de acceso a Postgres (Supabase) para el test infantil.
//
// Sin estado global más allá del Pool. Todas las funciones aceptan un cliente
// opcional para poder encadenarlas dentro de una transacción.
//
// Convenciones:
//   - Importamos pg como default y desestructuramos Pool (pg es CommonJS).
//   - DATABASE_URL viene del entorno; debe llevar ?sslmode=require para Supabase.
//   - Pool pequeño (max=5). Una API tan ligera no necesita más; si lo subimos
//     tocamos el connection limit del free tier de Supabase.

import pg from 'pg';
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

let pool = null;

/**
 * Devuelve el Pool inicializado de forma lazy. Si DATABASE_URL no está
 * definida, devuelve null — el endpoint de submit-children es el único que
 * lo necesita, así que el resto del servidor sigue arrancando aunque falte
 * (útil en local sin DB).
 */
export function getPool() {
  if (pool) return pool;
  if (!DATABASE_URL) return null;

  // Supabase exige SSL pero presenta un cert self-signed en su cadena.
  // En pg 8.13+ `sslmode=require` (en la URL) se trata como `verify-full`
  // y rechaza la cadena → "self-signed certificate in certificate chain".
  // Estrategia robusta: stripamos `sslmode` de la URL y forzamos en código
  // `ssl: { rejectUnauthorized:false }`, que sí encripta sin verificar.
  let cleanUrl = DATABASE_URL;
  try {
    const u = new URL(DATABASE_URL);
    u.searchParams.delete('sslmode');
    cleanUrl = u.toString();
  } catch {
    // Si la URL no se puede parsear, dejamos el connection string tal cual
    // y confiamos en el ssl: del Pool — pg intentará igualmente.
  }

  pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  pool.on('error', (err) => {
    console.error('[db] idle client error:', err);
  });
  return pool;
}

/**
 * Ejecuta `fn` dentro de una transacción. Hace BEGIN/COMMIT/ROLLBACK.
 * `fn` recibe el cliente conectado para encadenar consultas.
 */
export async function withTx(fn) {
  const p = getPool();
  if (!p) throw new Error('DATABASE_URL not configured');
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch {}
    throw e;
  } finally {
    client.release();
  }
}

// ─────────────────────── upserts y queries ───────────────────────

/**
 * Crea o actualiza un colegio. `display_name` empieza igual que `token`
 * (podemos editarlo a mano en Supabase si queremos un nombre humano).
 * También actualiza last_submission_at.
 */
export async function upsertSchool(client, token) {
  if (!token) return null;
  const sql = `
    INSERT INTO schools (token, display_name, last_submission_at)
    VALUES ($1, $1, NOW())
    ON CONFLICT (token) DO UPDATE
      SET last_submission_at = NOW()
    RETURNING token, display_name
  `;
  const { rows } = await client.query(sql, [token]);
  return rows[0];
}

/**
 * Upsert de padre/tutor por email. Si existe, actualiza nombre, relación,
 * idioma, consent. Devuelve el id.
 */
export async function upsertParent(client, { email, firstName, relation, language, consent }) {
  const sql = `
    INSERT INTO parents (email, first_name, relation, language, consent_minors, consent_ts, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (email) DO UPDATE
      SET first_name      = EXCLUDED.first_name,
          relation        = EXCLUDED.relation,
          language        = EXCLUDED.language,
          consent_minors  = EXCLUDED.consent_minors,
          consent_ts      = EXCLUDED.consent_ts,
          updated_at      = NOW()
    RETURNING id
  `;
  const consentTs = consent ? new Date().toISOString() : null;
  const { rows } = await client.query(sql, [email, firstName, relation, language, !!consent, consentTs]);
  return rows[0].id;
}

/**
 * Upsert de hijo. Identificado por (parent_id, first_name, birth_year, sex).
 * Si ya existe el hijo, sólo refresca updated_at y school_token (puede
 * haber cambiado de colegio entre envíos).
 */
export async function upsertChild(client, { parentId, firstName, birthYear, sex, schoolToken }) {
  const sql = `
    INSERT INTO children (parent_id, first_name, birth_year, sex, school_token, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (parent_id, first_name, birth_year, sex) DO UPDATE
      SET school_token = EXCLUDED.school_token,
          updated_at   = NOW()
    RETURNING id
  `;
  const { rows } = await client.query(sql, [parentId, firstName, birthYear, sex, schoolToken]);
  return rows[0].id;
}

/**
 * Inserta una nueva submission (siempre, append-only).
 */
export async function insertSubmission(client, {
  childId, testSet, ageAtSubmission, answers,
  primario, secundario, isPure, margin, scoreS2,
  profileKey, profileName, language,
}) {
  const sql = `
    INSERT INTO submissions (
      child_id, test_set, age_at_submission, answers_json,
      primario, secundario, is_pure, margin, score_s2,
      profile_key, profile_name, language
    )
    VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id
  `;
  const { rows } = await client.query(sql, [
    childId, testSet, ageAtSubmission, JSON.stringify(answers || {}),
    primario, secundario, !!isPure, margin, scoreS2,
    profileKey, profileName, language,
  ]);
  return rows[0].id;
}

/**
 * Test de conectividad — útil al arrancar para detectar config mala.
 */
export async function ping() {
  const p = getPool();
  if (!p) return { ok: false, error: 'DATABASE_URL not configured' };
  try {
    const { rows } = await p.query('SELECT NOW() AS now');
    return { ok: true, now: rows[0].now };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}
