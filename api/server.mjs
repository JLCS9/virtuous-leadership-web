// brevo-proxy — Mini servidor del sitio Virtuous Leadership.
//
// Dos endpoints:
//   POST /api/submit            → test de adultos, persistido en Brevo.
//   POST /api/submit-children   → test de niños, persistido en Supabase (Postgres).
//
// Variables de entorno:
//   BREVO_API_KEY   → API key de Brevo (xkeysib-...)   — requerido (test adulto)
//   BREVO_LIST_ID   → ID numérico de la lista (adultos) — requerido (test adulto)
//   DATABASE_URL    → connection string de Supabase     — requerido (test niños)
//   PORT            → puerto donde escucha (default 3001)

import http from 'http';
import {
  withTx, upsertSchool, upsertParent, upsertChild, insertSubmission, ping,
} from './db.mjs';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '0', 10);
const PORT          = parseInt(process.env.PORT || '3001', 10);

if (!BREVO_API_KEY) { console.error('[fatal] BREVO_API_KEY env var missing'); process.exit(1); }
if (!BREVO_LIST_ID) { console.error('[fatal] BREVO_LIST_ID env var missing'); process.exit(1); }

// DATABASE_URL es opcional al arrancar — si falta, /api/submit-children
// devolverá 503 hasta que se configure, pero el resto del servidor funciona.
if (!process.env.DATABASE_URL) {
  console.warn('[warn] DATABASE_URL not set — /api/submit-children disabled');
} else {
  // Ping no-bloqueante para detectar config mala pronto.
  ping().then(r => {
    if (r.ok) console.log(`[db] connected (server time: ${r.now})`);
    else      console.error(`[db] connection failed: ${r.error}`);
  });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', c => {
      total += c.length;
      if (total > 64 * 1024) {        // 64 KB cap → no aceptamos payloads gigantes
        req.destroy();
        return reject(new Error('payload too large'));
      }
      chunks.push(c);
    });
    req.on('end',   () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(obj));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ════════════════════════════════════════════════════════════════════════════
// HANDLER — Test de ADULTOS (sin cambios respecto a la versión previa).
// Toda la lógica vive aquí dentro para que el handler de niños no la pueda
// afectar.
// ════════════════════════════════════════════════════════════════════════════
async function handleSubmitAdult(req, res) {
  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid JSON' });
  }

  const c = payload?.contact || {};
  const r = payload?.result  || {};

  const emailOk = typeof c.email === 'string' && EMAIL_RE.test(c.email);
  if (!emailOk || !c.name || !c.consent) {
    return sendJson(res, 400, { error: 'Missing required fields' });
  }

  const fechaTest = (c.consentTimestamp && /^\d{4}-\d{2}-\d{2}/.test(c.consentTimestamp))
    ? c.consentTimestamp.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const SEXO_MAP = { mujer: 'Female', hombre: 'Male' };
  const sexoBrevo = SEXO_MAP[String(c.sex || '').toLowerCase().trim()];

  console.log(`[submit] received contact: email=${c.email} birthYear=${JSON.stringify(c.birthYear)} sex=${JSON.stringify(c.sex)} → mapped sexoBrevo=${JSON.stringify(sexoBrevo)}`);

  // Atributos que deben existir en Brevo:
  //   FIRSTNAME, YEAR, SEXO (Multi-choice Female/Male), TEMP1, TEMP2,
  //   IDIOMA, ACEPTACION_POLITICAS, FECHA_TEST_TEMPERAMENTO, PERFIL.
  const brevoBody = {
    email: c.email.toLowerCase().trim(),
    attributes: {
      FIRSTNAME:               c.name,
      YEAR:                    c.birthYear,
      ...(sexoBrevo ? { SEXO: sexoBrevo } : {}),
      TEMP1:                   r.primario || '',
      TEMP2:                   r.secundario || '',
      IDIOMA:                  String(c.language || 'es').toUpperCase(),
      ACEPTACION_POLITICAS:    c.consent ? 1 : 0,
      FECHA_TEST_TEMPERAMENTO: fechaTest,
      PERFIL:                  r.profileName || '',
    },
    listIds: [BREVO_LIST_ID],
    updateEnabled: true,
  };

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key':      BREVO_API_KEY,
        'Content-Type': 'application/json',
        'accept':       'application/json',
      },
      body: JSON.stringify(brevoBody),
    });
    const text = await brevoRes.text();
    console.log(`[brevo] attrs sent: ${JSON.stringify(brevoBody.attributes)}`);
    console.log(`[brevo] ${brevoRes.status} ${text.slice(0, 400)}`);

    if (!brevoRes.ok) {
      return sendJson(res, 502, { error: 'Brevo API error', status: brevoRes.status });
    }
    return sendJson(res, 200, { ok: true });
  } catch (e) {
    console.error('[brevo] fetch error:', e);
    return sendJson(res, 500, { error: 'Internal error' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HANDLER — Test de NIÑOS (nuevo). Persiste en Supabase, NO toca Brevo.
// ════════════════════════════════════════════════════════════════════════════

// Sanitiza el slug del colegio: lowercase, sólo [a-z0-9-_], máx 60 chars.
// Devuelve null si no queda nada utilizable.
function sanitizeSchoolToken(raw) {
  if (typeof raw !== 'string') return null;
  const clean = raw.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '').slice(0, 60);
  return clean.length > 0 ? clean : null;
}

const VALID_TEMPS = new Set(['COL', 'SAN', 'MEL', 'FLE']);
const VALID_SETS  = new Set(['A', 'B']);
const VALID_SEX   = new Set(['M', 'F', 'X']);
const VALID_REL   = new Set(['Padre', 'Madre', 'Tutor']);

function validateChildrenPayload(p) {
  if (!p || typeof p !== 'object') return 'Invalid payload';
  const { school, child, parent, result, language } = p;

  if (!child || typeof child !== 'object') return 'Missing child';
  if (typeof child.firstName !== 'string' || child.firstName.trim().length === 0) return 'Invalid child.firstName';
  if (child.firstName.length > 60) return 'child.firstName too long';
  if (!Number.isInteger(child.birthYear) || child.birthYear < 1900 || child.birthYear > 2100) return 'Invalid child.birthYear';
  if (!VALID_SEX.has(child.sex)) return 'Invalid child.sex';

  if (!parent || typeof parent !== 'object') return 'Missing parent';
  if (typeof parent.firstName !== 'string' || parent.firstName.trim().length === 0) return 'Invalid parent.firstName';
  if (parent.firstName.length > 80) return 'parent.firstName too long';
  if (typeof parent.email !== 'string' || !EMAIL_RE.test(parent.email)) return 'Invalid parent.email';
  if (!VALID_REL.has(parent.relation)) return 'Invalid parent.relation';
  if (parent.consent !== true) return 'Missing parent.consent';

  if (!result || typeof result !== 'object') return 'Missing result';
  if (!VALID_SETS.has(result.testSet)) return 'Invalid result.testSet';
  if (!VALID_TEMPS.has(result.primario)) return 'Invalid result.primario';
  if (result.secundario != null && !VALID_TEMPS.has(result.secundario)) return 'Invalid result.secundario';
  if (typeof result.isPure !== 'boolean') return 'Invalid result.isPure';
  if (typeof result.profileKey !== 'string' || result.profileKey.length === 0) return 'Invalid result.profileKey';

  if (school && typeof school !== 'object') return 'Invalid school';
  if (language && typeof language !== 'string') return 'Invalid language';
  return null; // ok
}

async function handleSubmitChildren(req, res) {
  if (!process.env.DATABASE_URL) {
    return sendJson(res, 503, { error: 'Database not configured' });
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid JSON' });
  }

  const err = validateChildrenPayload(payload);
  if (err) {
    console.warn(`[submit-children] validation error: ${err}`);
    return sendJson(res, 400, { error: err });
  }

  const { school, child, parent, result, language } = payload;
  const schoolToken = sanitizeSchoolToken(school?.token);
  const lang = (language && /^[a-z]{2}$/.test(language)) ? language : 'es';

  const ageAtSubmission = new Date().getFullYear() - child.birthYear;

  try {
    const submissionId = await withTx(async (client) => {
      // 1. school (opcional). Si llega el token, crea/actualiza la fila.
      if (schoolToken) {
        await upsertSchool(client, schoolToken);
      }

      // 2. parent — upsert por email.
      const parentId = await upsertParent(client, {
        email:     parent.email.toLowerCase().trim(),
        firstName: parent.firstName.trim(),
        relation:  parent.relation,
        language:  lang,
        consent:   parent.consent === true,
      });

      // 3. child — upsert por (parent_id, first_name, birth_year, sex).
      const childId = await upsertChild(client, {
        parentId,
        firstName:   child.firstName.trim(),
        birthYear:   child.birthYear,
        sex:         child.sex,
        schoolToken: schoolToken,
      });

      // 4. submission — siempre INSERT (append-only).
      return await insertSubmission(client, {
        childId,
        testSet:          result.testSet,
        ageAtSubmission,
        answers:          result.answers || {},
        primario:         result.primario,
        secundario:       result.secundario || null,
        isPure:           result.isPure === true,
        margin:           typeof result.margin === 'number' ? result.margin : null,
        scoreS2:          typeof result.scoreS2 === 'number' ? result.scoreS2 : null,
        profileKey:       result.profileKey,
        profileName:      result.profileName || null,
        language:         lang,
      });
    });

    console.log(`[submit-children] saved submission=${submissionId} school=${schoolToken || '-'} parent=${parent.email} child="${child.firstName}" year=${child.birthYear} sex=${child.sex} → ${result.profileKey}`);
    return sendJson(res, 200, { ok: true, submissionId: String(submissionId) });
  } catch (e) {
    console.error('[submit-children] db error:', e);
    return sendJson(res, 500, { error: 'Internal error' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HTTP server — routing
// ════════════════════════════════════════════════════════════════════════════
const server = http.createServer(async (req, res) => {
  // CORS — siempre devolvemos cabeceras.
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/healthz')) {
    return res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
  }

  if (req.method === 'POST' && req.url === '/api/submit') {
    return handleSubmitAdult(req, res);
  }

  if (req.method === 'POST' && req.url === '/api/submit-children') {
    return handleSubmitChildren(req, res);
  }

  return sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`brevo-proxy listening on :${PORT} (list=${BREVO_LIST_ID})`);
});
