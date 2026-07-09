# CLAUDE.md — Contexto del proyecto para futuras sesiones

Este fichero se auto-carga en cada sesión de Claude Code. Contiene lo que
suelo redescubrir cada vez que abro el repo: convenciones, patrones,
gotchas. **Léelo antes de tocar código.**

---

## Qué es

Sitio de **Virtuous Leadership** (virtuousleadership.com), SPA multi-idioma
(ES/EN/FR/RU) con:

1. Contenido comercial: acreditación para colegios, universidades y centros
   de educación superior; contacto; páginas legales.
2. **3 tests de autoconocimiento** basados en la teoría de Alexandre Havard:
   - **Test de temperamento adulto** (4 temperamentos: COL, MEL, SAN, FLE) —
     22 preguntas, público, integra con Brevo.
   - **Test de temperamento infantil** (para padres/tutores, 6-17 años) —
     mismo motor, ~24 preguntas, persistencia en Supabase.
   - **Test de carácter** (6 virtudes de Havard: prudencia, fortaleza,
     dominio de sí, justicia, magnanimidad, humildad) — 68 preguntas escala
     Likert 5 puntos, público, integra con Brevo.

Empresa: Virtuous Leadership 

---

## Stack

- **Frontend**: Vite 5 + React 18, React Router 7, react-helmet-async.
- **Backend**: Node 20 HTTP nativo (no Express), driver `pg` para Supabase,
  Brevo v3 REST vía `fetch`.
- **i18n**: custom (no react-i18next). Archivos JS con dicts anidados.
- **Estilos**: inline styles + tokens en `src/theme.js`. No Tailwind, no CSS
  modules.
- **Tests**: `node --test` (built-in Node 20), sólo módulos puros.
- **Deploy**: Docker Compose en VPS Hostinger `/opt/virtuousleadership/`.
- **Analytics**: GTM (GTM-W9P5BPF9) + GA4 (G-HM6K1685L2) desde el contenedor
  GTM. Consentimiento: banner propio (`src/components/CookieConsent.jsx`) +
  Consent Mode v2 con default DENEGADO fijado en `index.html` antes de cargar
  GTM (ya NO usamos Cookiebot). dataLayer pushes desde React (PageTracker).

---

## Mapa de directorios

```
src/
  App.jsx                    Registro de páginas: pageId → componente.
                             Añade aquí cualquier página nueva + a routes.js.
  main.jsx                   Entrypoint Vite. Carga i18n context, router.
  theme.js                   NAVY, GOLD, BEIGE, PAPER, LINE + tipos + styles.

  TestTBP.jsx                Test temperamento adulto (~1050 líneas, todo inline).
  TestTBPChildren.jsx        Test infantil (~900 líneas).
  TestCharacter.jsx          Test carácter (~600 líneas).

  pages/                     Wrappers con SEO + JSON-LD, un fichero por página.
    Home.jsx  Acreditacion.jsx  AcreditacionColegios.jsx  ...
    TestTemperamento.jsx  TestTemperamentoNinos.jsx  TestCaracter.jsx
    Tests.jsx                Índice de los 3 tests (grid de cards).

  components/                Reutilizables.
    Layout.jsx  Header.jsx  Footer.jsx  LangSwitcher.jsx
    CTA.jsx  Section.jsx  SEO.jsx  Seal.jsx  PasosBlock.jsx
    PageTracker.jsx          dataLayer.push({event:'page_view',...}) por ruta.
                             Ignora rutas sin idioma (evita page_view doble en
                             el redirect / → /es).
    CookieConsent.jsx        Banner de cookies propio (es/en/fr/ru), montado a
                             nivel raíz en App.jsx. Persiste elección en cookie
                             `vl_consent` y actualiza Consent Mode. NO
                             reintroducir Cookiebot.

  lib/                       Módulos puros, testeables. NO importan React.
    characterScoring.js      Motor del test de carácter (vector×matriz).
    characterScoring.test.js `node --test` — corre con `npm test`.
    childPersonalize.js      Motor del test infantil (age/gender placeholders).
    analytics.js             Wrappers de gtag/dataLayer (legacy, ir migrando).

  data/                      JSONs generados o curados (no editar a mano si vienen del Excel).
    questions-children.{es,en,fr,ru}.json    Banco unificado 6-17.
    character-test.json                       68 ítems × 12 pesos.
    character-support-text.json               Labels + HTMLs largos por virtud.
    character-test-fixtures.json              Fixtures reales del Excel para tests.

  i18n/
    index.jsx                Contexto React + hook useT() + LocalLink + useLocalPath.
    routes.js                ROUTES (slug por lang) + NO_LAYOUT_PAGES (Set) + pathForLang().
    es.js  en.js  fr.js  ru.js                Dicts anidados. UN fichero por idioma.

  assets/                    PNGs + JPGs. Un archivo por idioma cuando el
                             texto va embebido en la imagen (tt-es, tt-en, ...).

api/
  server.mjs                 HTTP server. 3 endpoints: /api/submit,
                             /api/submit-children, /api/submit-character.
  db.mjs                     pg Pool + queries de schools/parents/children/submissions.
  migrations/                001_init_children.sql (schema del test infantil).
  Dockerfile

scripts/
  extract-character-xlsx.py  One-shot: xlsx oficial → 3 JSONs en src/data/.
                             Verifica que denominadores del Excel = briefing.
```

---

## Convenciones críticas

### i18n

- `useT()` devuelve `{t, lang, setLang}`. `t('a.b.c')` navega el dict.
- Interpolación: `t('key', { n: 5 })` sustituye `{n}` en la string.
- Las 4 lenguas soportadas están en `SUPPORTED_LANGS = ['es','en','fr','ru']`.
- Rutas localizadas: fuente única en `src/i18n/routes.js` (ROUTES). Añade una
  entrada nueva ahí para que App.jsx la mounte automáticamente.
- Páginas sin Layout (mini-apps de test): añádelas a `NO_LAYOUT_PAGES` Set.

### Placeholders de género (motor infantil y carácter)

- **Formato**: `{X/Y}` — X para M/X, Y para F. Genérico, lang-agnostic.
  Ej: `{he/she}`, `{él/ella}`, `{он/она}`, `{il/elle}`.
- Motor: `src/lib/childPersonalize.js` (aplica también al carácter).
- Orden de resolución: **género → edad → nombre** (no invertir; el regex de
  edad se rompe si aparecen `}` internos de género sin resolver).

### Escala Likert (test de carácter)

Valores numéricos internos: `-1, -0.5, 0, +0.5, +1`. En UI, orden visual
descendente: "Totalmente de acuerdo" arriba → "Totalmente en desacuerdo"
abajo. Los valores NO cambian aunque cambies el orden visual.

### Tests

```bash
npm test              # node --test src/lib/*.test.js
```

Sólo módulos puros. Si tocas `characterScoring.js` y los tests fallan, NO
regeneres las fixtures como reacción — el script Python que las genera
implementa el mismo algoritmo; si divergen, revisa qué de los dos está mal.

### Estilos

Inline styles + constantes de `src/theme.js`. Colores: `NAVY`, `NAVY_SOFT`,
`GOLD`, `GOLD_SOFT`, `BEIGE`, `PAPER`, `INK`, `MUTED`, `LINE`. Fuentes:
`FONT_SERIF` (Cormorant Garamond), `FONT_SANS` (Inter). Cada test tiene su
propia paleta local calcada de theme.js (para que evolucionen independientes).

---

## Env vars — build-time vs runtime

Distinción CRÍTICA. Suele confundir:

### Build-time (Vite, incrustadas en el bundle)

Viven en **`.env.production` DENTRO del repo**. Se leen al `vite build`.
Cambiarlas requiere REBUILD del contenedor `web`.

```env
VITE_SUBMIT_URL=/api/submit
VITE_SUBMIT_CHARACTER_URL=/api/submit-character
VITE_GA_ID=G-HM6K1685L2
```

Si el frontend "no llama al backend", casi siempre es que la VITE_* falta y
la función usa el stub (log en consola, no fetch real).

### Runtime (backend Node, container)

Viven en **`/opt/virtuousleadership/.env` en el VPS** (fuera del repo, con
chmod 600). Se leen al arrancar el contenedor `api`. Cambiarlas requiere
`docker compose up -d api` (no build).

```env
BREVO_API_KEY=xkeys-...
BREVO_LIST_ID_ES=123
BREVO_LIST_ID_EN=124
BREVO_LIST_ID_FR=125
BREVO_LIST_ID_RU=122
DATABASE_URL=postgres://...@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

---

## Brevo — integración

- v3 REST, api-key en header `api-key: xkeys-...`.
- Endpoint principal: `POST /v3/contacts` con `updateEnabled: true` (upsert
  por email).
- Cada test tiene sus PROPIAS listas por idioma:
  - **Test de temperamento**: ES=104, FR=105, EN=106, RU=107
    (`BREVO_LIST_ID_{ES,EN,FR,RU}`, elegida con `pickListForLang()`).
  - **Test de carácter**: ES=123, EN=124, FR=125, RU=122
    (`BREVO_LIST_ID_CHARACTER_{ES,EN,FR,RU}`, elegida con
    `pickCharacterListForLang()`; si falta la de un idioma cae a la lista
    de temperamento de ese idioma).
  (Los IDs reales viven en el `.env` del VPS y en la cuenta de Brevo; si
  dudas, esa es la fuente de verdad, no este doc.)
- **Sexo**: siempre "Male"/"Female" hacia Brevo, NUNCA "mujer"/"hombre"
  (mapeo en el frontend antes de mandar).
- **Atributos custom deben existir en Brevo ANTES del primer submit**. Si no,
  Brevo responde 400 y el contacto no se crea. Los del test de temperamento:
  YEAR, GENDER, TEMP1, TEMP2, IDIOMA, ACEPTACION_POLITICAS,
  TEST_TEMPERAMENTO, CONTACT_SOURCE, FECHA_TEST_TEMPERAMENTO, PERFIL, PAIS,
  CIUDAD, COD_DESCUENTO. Del carácter: TEST_CARACTER, FECHA_TEST_CARACTER, y
  los 18 P/C/S/J/M/H × _GLOBAL/_PASSIVE/_ACTIVE.
- Geolocalización IP → PAIS/CIUDAD via `ip-api.com` (HTTP, 45 req/min, sin
  key). Fire-and-forget con timeout 1.5s.

---

## Supabase — test infantil

- Session pooler (IPv4) — el VPS Hostinger NO tiene IPv6, la conexión
  directa a Supabase falla.
- URL formato: `postgres://postgres.{ref}:PASSWORD@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`.
- **`sslmode=require` en URL NO funciona** — pg lo interpreta como
  verify-full y rechaza el cert self-signed de Supabase. `db.mjs` strippea
  sslmode del URL y fuerza `ssl: { rejectUnauthorized: false }` en Pool.
- Tablas: `schools`, `parents`, `children`, `submissions` (`api/migrations/001_init_children.sql`).

---

## Deploy

Repo remote: **github.com/JLCS9/virtuous-leadership-web**.

### Ramas

- `main` → producción (**virtuousleadership.com**). Por convención no se
  pushea directamente: el código entra vía PR. (Ojo: la branch protection de
  GitHub NO está aplicada de hecho — repo privado en plan free — así que es
  disciplina, no regla técnica. CI sí corre en cada PR: `npm test` + build.)
- `feature/*`, `fix/*` — ramas cortas para trabajo en curso.
- (`staging` — reservado por si en el futuro se monta pre-producción; hoy
  no existe ni el subdominio ni el docker compose asociado.)

### Deploy — manual desde el VPS

Tras mergear a `main`, cualquier colaborador con acceso al VPS Hostinger
lo despliega manualmente:

```bash
ssh <user>@<vps>
cd /opt/virtuousleadership && \
  git pull && \
  docker compose build web api && \
  docker compose up -d web api && \
  docker compose logs --tail=30 api
```

- **`build web`**: obligatorio si has tocado código React o `.env.production`.
- **`build api`**: obligatorio si has tocado `server.mjs`, `db.mjs`,
  migrations, o `api/Dockerfile`.
- **Sólo `up -d`** (sin build): OK si el único cambio es un env var runtime.

---

## Cómo añadir un test nuevo (patrón validado)

Aprendido de temperamento adulto/infantil/carácter. Orden sugerido:

1. `src/data/{name}-*.json` — banco de preguntas (a mano o extraído por
   script).
2. `src/lib/{name}Scoring.js` puro + `.test.js` con fixtures.
3. `src/Test{Name}.jsx` — componente con fases Welcome → Question → Gate → Result.
4. `src/pages/Test{Name}.jsx` — wrapper con SEO por idioma.
5. `src/i18n/routes.js` — entrada en `ROUTES` (slug por lang) + añadir a
   `NO_LAYOUT_PAGES` Set si el test se renderiza fullscreen.
6. `src/App.jsx` — import + registro en `PAGE_ELEMENTS`.
7. `src/i18n/{es,en,fr,ru}.js` — namespace `tbp_{name}` con welcome, question,
   gate, result.
8. `src/pages/Tests.jsx` — activar card (i18n `tests.cards[i]`) con
   `available: true`, `to: '/tests/...'`, `image: '{name}'`.
9. Si necesita miniatura nueva: import en Tests.jsx + entrada en `TEST_IMAGES`.
10. `api/server.mjs` — nuevo handler `handleSubmit{Name}` + routing.
11. `.env.production` — nueva `VITE_SUBMIT_{NAME}_URL=/api/submit-{name}`.
12. Documentar en este CLAUDE.md los nuevos atributos Brevo a crear.

---

## Cosas que NO tocar sin entender

- **`api/db.mjs`** — el bloque `ssl: { rejectUnauthorized: false }` es
  mínimo funcional. Cambiarlo rompe la conexión a Supabase pooler.
- **`characterScoring.js`** — validado contra 9 fixtures reales del Excel.
  Cambios en el algoritmo requieren revalidación.
- **Orden de resolución de placeholders en `childPersonalize.js`** —
  género → edad → nombre. Invertirlo rompe EN/FR/RU (donde `{he/she}` vive
  dentro de `{6-11:... | 12-17:...}`).
- **Slugs de `routes.js`** — cambiarlos rompe URLs indexadas. Si necesitas,
  añade slugs nuevos y mantén los viejos como redirect antes de retirarlos.
- **`SUPPORTED_LANGS`** — orden importa para el LangSwitcher y para hreflang.
- **`.env.production` en git** — sí, la commiteamos (no lleva secretos, sólo
  URLs relativas y el GA ID que es público). Los secretos viven en el VPS.

---

## Preguntas frecuentes (auto-resueltas)

**"¿Dónde está la config del proyecto?"** → `package.json`, `vite.config.js`,
`.env.production`, `docker-compose.yml`.

**"¿Cómo pruebo en local?"** → `npm install && npm run dev` (localhost:5173).
Backend `api/` no arranca en dev; el front usa VITE_SUBMIT_* vacías = stub.

**"¿Cómo hago un test?"** → `npm test`. Sólo `src/lib/*.test.js`. React no.

**"¿Qué idiomas soportamos?"** → es, en, fr, ru. Todos deben quedar
sincronizados: rutas, i18n dicts, assets si van localizados.

**"¿Qué lista de Brevo va con qué idioma?"** → Temperamento: ES=104,
FR=105, EN=106, RU=107. Carácter: ES=123, EN=124, FR=125, RU=122. La
selección la hacen `pickListForLang()` / `pickCharacterListForLang()` en
`server.mjs`; los IDs viven en el `.env` del VPS (`BREVO_LIST_ID_*` y
`BREVO_LIST_ID_CHARACTER_*`).
