// brevo-proxy — Mini servidor que recibe el formulario del test y crea/actualiza
// el contacto en Brevo + lo añade a la lista configurada.
//
// Sin dependencias externas — usa http nativo y fetch (Node 20+).
//
// Variables de entorno:
//   BREVO_API_KEY  → API key de Brevo (xkeysib-...)
//   BREVO_LIST_ID  → ID numérico de la lista donde añadir el contacto
//   PORT           → puerto donde escucha (default 3001)

import http from 'http';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || '0', 10);
const PORT          = parseInt(process.env.PORT || '3001', 10);

if (!BREVO_API_KEY) { console.error('[fatal] BREVO_API_KEY env var missing'); process.exit(1); }
if (!BREVO_LIST_ID) { console.error('[fatal] BREVO_LIST_ID env var missing'); process.exit(1); }

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

const server = http.createServer(async (req, res) => {
  // CORS — siempre devolvemos cabeceras (en producción Caddy sirve mismo origen,
  // pero en local te puede hacer falta).
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.writeHead(204).end();

  if (req.method === 'GET' && (req.url === '/health' || req.url === '/healthz')) {
    return res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
  }

  if (req.method !== 'POST' || req.url !== '/api/submit') {
    return res.writeHead(404, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({ error: 'Not found' }));
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (e) {
    return res.writeHead(400, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({ error: 'Invalid JSON' }));
  }

  const c = payload?.contact || {};
  const r = payload?.result  || {};

  // Validación mínima
  const emailOk = typeof c.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email);
  if (!emailOk || !c.name || !c.consent) {
    return res.writeHead(400, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({ error: 'Missing required fields' }));
  }

  // Fecha del test en formato YYYY-MM-DD (lo que entiende Brevo para campos DATE).
  // Usamos consentTimestamp si viene, si no la fecha de hoy.
  const fechaTest = (c.consentTimestamp && /^\d{4}-\d{2}-\d{2}/.test(c.consentTimestamp))
    ? c.consentTimestamp.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  // Cuerpo para Brevo. Los nombres de atributos van EN MAYÚSCULAS por convención.
  // Asegúrate de que estos atributos existen en tu cuenta de Brevo
  // (Contacts → Settings → Contact attributes) con los tipos:
  //   FIRSTNAME                    (TEXT — viene de fábrica en Brevo)
  //   BIRTHYEAR                    (NUMBER)
  //   SEX                          (TEXT)
  //   TEMP1                        (TEXT) — temperamento primario (COL/MEL/SAN/FLE)
  //   TEMP2                        (TEXT) — secundario (COL/MEL/SAN/FLE/"")
  //   IDIOMA                       (TEXT) — idioma del test (es/en/fr)
  //   ACEPTACION_POLITICAS         (BOOLEAN o NUMBER) — siempre 1
  //   FECHA_TEST_TEMPERAMENTO      (DATE) — formato YYYY-MM-DD
  //   PERFIL                       (TEXT) — nombre humano del perfil (opcional)
  const brevoBody = {
    email: c.email.toLowerCase().trim(),
    attributes: {
      FIRSTNAME:               c.name,
      BIRTHYEAR:               c.birthYear,
      SEX:                     c.sex,
      TEMP1:                   r.primario || '',
      TEMP2:                   r.secundario || '',
      IDIOMA:                  c.language || 'es',
      ACEPTACION_POLITICAS:    c.consent ? 1 : 0,
      FECHA_TEST_TEMPERAMENTO: fechaTest,
      PERFIL:                  r.profileName || '',
    },
    listIds: [BREVO_LIST_ID],
    updateEnabled: true, // si el contacto ya existe, actualiza sus atributos
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
    console.log(`[brevo] ${brevoRes.status} ${text.slice(0, 200)}`);

    if (!brevoRes.ok) {
      return res.writeHead(502, { 'Content-Type': 'application/json' })
                .end(JSON.stringify({ error: 'Brevo API error', status: brevoRes.status }));
    }
    return res.writeHead(200, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({ ok: true }));
  } catch (e) {
    console.error('[brevo] fetch error:', e);
    return res.writeHead(500, { 'Content-Type': 'application/json' })
              .end(JSON.stringify({ error: 'Internal error' }));
  }
});

server.listen(PORT, () => {
  console.log(`brevo-proxy listening on :${PORT} (list=${BREVO_LIST_ID})`);
});
