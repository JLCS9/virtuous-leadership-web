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
2. **4 tests de autoconocimiento** basados en la teoría de Alexandre Havard:
   - **Test de temperamento adulto** (4 temperamentos: COL, MEL, SAN, FLE) —
     22 preguntas, público, integra con Brevo.
   - **Test de temperamento infantil** (para padres/tutores, 6-17 años) —
     mismo motor, ~24 preguntas, persistencia en Supabase.
   - **Test de carácter** (6 virtudes de Havard: prudencia, fortaleza,
     dominio de sí, justicia, magnanimidad, humildad) — 68 preguntas escala
     Likert 5 puntos (-1..+1), público, integra con Brevo.
   - **Test del corazón / Corazón Libre** (8 enfermedades espirituales de
     Havard: racionalismo, voluntarismos religioso/machista/ideológico/
     conformista, sentimentalismos voluptuoso/demente/cobarde) — 32 preguntas
     Likert 5 puntos (0..4), público, integra con Brevo, con modal
     milestone cada 4 preguntas.

Empresa: Virtuous Leadership

---

## Stack

- **Frontend**: Vite 5 + React 18, React Router 7, react-helmet-async.
- **Backend**: Node 20 HTTP nativo (no Express), driver `pg` para Supabase,
  Brevo v3 REST vía `fetch`.
- **i18n**: custom (no react-i18next). Archivos JS con dicts anidados.
- **Estilos**: inline styles + tokens en `src/theme.js`. No Tailwind, no CSS
  modules.
- **Tests**: `node --test` (built-in Node 20), sólo módulos puros
  (25 tests: 11 character + 14 heart).
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
  TestCharacter.jsx          Test carácter (~700 líneas).
  TestHeart.jsx              Test del corazón / Corazón Libre (~650 líneas,
                             con MilestoneModal cada 4 preguntas).

  pages/                     Wrappers con SEO + JSON-LD, un fichero por página.
    Home.jsx  Acreditacion.jsx  AcreditacionColegios.jsx  ...
    TestTemperamento.jsx  TestTemperamentoNinos.jsx
    TestCaracter.jsx      TestCorazon.jsx
    Tests.jsx                Índice de los 4 tests (grid de cards).

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
    characterScoring.js      Motor del test de carácter (vector×matriz, 12 facetas).
    characterScoring.test.js `node --test`.
    heartScoring.js          Motor del test del corazón (8 trastornos × 4
                             preguntas 0..4, umbrales 33/66 exportados).
    heartScoring.test.js     14 tests (edge cases + fixtures).
    childPersonalize.js      Motor del test infantil (age/gender placeholders).
    analytics.js             Wrappers de gtag/dataLayer (legacy, ir migrando).

  data/                      JSONs generados o curados (no editar a mano si vienen del xlsx/ods).
    questions-children.{es,en,fr,ru}.json    Banco unificado 6-17.
    character-test.json                       68 ítems × 12 pesos.
    character-support-text.json               Labels + HTMLs largos por virtud.
    character-test-fixtures.json              Fixtures reales del Excel para tests.
    heart-test.json                           32 preguntas × 8 trastornos + umbrales.
    heart-support-text.json                   Labels + 8 HTMLs de diagnóstico+remedio.

  i18n/
    index.jsx                Contexto React + hook useT() + LocalLink + useLocalPath.
    routes.js                ROUTES (slug por lang) + NO_LAYOUT_PAGES (Set) + pathForLang().
    es.js  en.js  fr.js  ru.js                Dicts anidados. UN fichero por idioma.
                             Namespaces por test: tbp_children, tbp_character, tbp_heart.

  assets/                    PNGs + JPGs. Un archivo por idioma cuando el
                             texto va embebido en la imagen.
    tt-{es,en,fr,ru}.png          Emblema del test de temperamento adulto.
    piramida ES.png / Pyramid Eng.png / Pyramide FR.png / Pyramid Ruso.png
                                   Pirámide del test de carácter (PNG con fondo
                                   BLANCO — se corrige con mix-blend-mode; ver
                                   sección "Cosas que NO tocar").
    HRW-{es,en,fr,ru}.png         Imagen destacada del test del corazón
                                   (diagrama Venn Razón/Voluntad/Corazón/Sentim.).
    heart-disorder-{R,VR,VM,VI,VC,SV,SI,SC}.jpeg
                                   Retratos/caritas por enfermedad (Kant, Rivers,
                                   Clint Eastwood, Freedom, Pharisee, Kramskoj,
                                   Rousseau, Rudin). Mismo asset en los 4 idiomas.

api/
  server.mjs                 HTTP server. 4 endpoints: /api/submit,
                             /api/submit-children, /api/submit-character,
                             /api/submit-heart.
  db.mjs                     pg Pool + queries de schools/parents/children/submissions.
  migrations/                001_init_children.sql (schema del test infantil).
  Dockerfile

scripts/
  extract-character-xlsx.py  One-shot: xlsx oficial → 3 JSONs en src/data/.
                             Verifica que denominadores del Excel = briefing.
  extract-heart-ods.py       One-shot: ods oficial → heart-test.json +
                             heart-support-text.json. 5 langs en el ODS
                             (EN/RU/FR/ES/PT); solo exponemos 4 (PT queda
                             en JSON pero no se expone en la UI).
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

### Escala Likert por test

Cada test usa una escala distinta — no confundir:

| Test | Rango | Semántica |
|---|---|---|
| Temperamento (adulto/infantil) | binario SI/NO | 1 pto al temperamento del ítem |
| **Carácter** | `-1, -0.5, 0, +0.5, +1` | ítems pueden negar/afirmar la virtud |
| **Corazón** | `0, 1, 2, 3, 4` | todos afirmaciones-síntoma (acuerdo alto = síntoma alto) |

En UI, orden visual descendente en ambos Likert: "Totalmente de acuerdo"
arriba, "Totalmente en desacuerdo" abajo. Los valores NO cambian aunque
cambies el orden visual.

### Tests

```bash
npm test              # node --test src/lib/*.test.js
```

Sólo módulos puros. Total actual: **25 tests** (11 character + 14 heart).
Si tocas un scoring engine y los tests fallan, NO regeneres las fixtures
como reacción — el script Python que las genera implementa el mismo
algoritmo; si divergen, revisa qué de los dos está mal.

### Estilos

Inline styles + constantes de `src/theme.js`. Colores: `NAVY`, `NAVY_SOFT`,
`GOLD`, `GOLD_SOFT`, `BEIGE`, `PAPER`, `INK`, `MUTED`, `LINE`. Fuentes:
`FONT_SERIF` (Cormorant Garamond), `FONT_SANS` (Inter). Cada test tiene su
propia paleta local calcada de theme.js (para que evolucionen independientes).

### Miniaturas de tests en `/tests`

Layout de card en `Tests.jsx`: **círculo pequeño arriba** (128×128px,
`object-fit: contain` al 86%) + título/label/CTA centrados debajo.
Consistente para los 3 tests visibles. Un asset por idioma via
`TEST_IMAGES[key][lang]`.

Las imágenes con **fondo blanco intrínseco** (ej. `piramida ES.png` del
carácter) llevan `style={{ mixBlendMode: 'multiply' }}` para que el blanco
se camufle con el BEIGE del contenedor sin editar el asset. Aplicado en
`Tests.jsx` (miniatura circular) y en `TestCharacter.jsx` (Welcome +
SummaryCard del Result). NO se aplica a `tt-*.png` (temperamento, fondo
transparente) ni a `HRW-*.png` (corazón, fondo forma parte del diseño).

---

## Test del corazón — especificidades

El test más "narrativo" del sitio. Detalles que no son obvios leyendo el
código a bote pronto:

### Sin shuffle — orden fijo por bloques

`TestHeart.jsx` tiene una constante `CANONICAL_ORDER` calculada UNA vez al
cargar el módulo. Las 32 preguntas van en **8 bloques consecutivos de 4**,
en el orden semántico del ODS (R → VR → VM → VI → VC → SV → SI → SC).

**Razón**: el modal milestone (ver siguiente punto) aparece cada 4
preguntas, y sólo tiene sentido si esas 4 son del MISMO trastorno. Si
volvieras a shufflear las preguntas, el modal quedaría descoordinado.

### Modal milestone cada 4 preguntas

`MilestoneModal` en `TestHeart.jsx` aparece automáticamente al completar
las 4 preguntas de cada trastorno (índices 4, 8, 12, 16, 20, 24, 28 — NO
la 32, porque después va al Gate). Muestra:

- Carita del trastorno recién completado (imagen circular).
- Nombre del trastorno.
- **% solamente** (sin badge de nivel — se quitó a petición del usuario).
- Nota explicativa i18n.
- Botón "Continuar" (bloquea, hasta clickar no avanza).

i18n en `tbp_heart.milestone.{eyebrow, note, continue}` en los 4 idiomas.

### Subtítulo "Remedio" en el HTML expandido del Result

Los HTMLs del ODS vienen como **texto plano sin marcado** (`0 <p>`, `0
<strong>`), con los párrafos separados por `\n` (algunos casos) o por
"punto-Mayúscula" pegados sin espacio (patrón del ODS entre diagnóstico y
remedio).

El helper `formatDiagnosisHtml(raw, remedyLabel)` en `TestHeart.jsx`:
1. Split por `\n+` — si sale más de un chunk, cada uno es un `<p>`.
2. Si no, split por regex `/([\.!?»])([A-Z...А-Я...])/` (mayúscula pegada
   a punto o cierre de comillas `»`).
3. **Inserta `<h4 class="heart-remedy-heading">Remedio</h4>`** entre el
   1er y 2º párrafo (siempre que haya al menos 2).
4. `remedyLabel` viene del i18n (`tbp_heart.result.remedy_heading`):
   Remedio / Remedy / Remède / Средство исцеления.

Los estilos del `.heart-remedy-heading` viven en el `<style>` global del
componente (fondo scoped por className): color GOLD, uppercase, borde
superior LINE.

### Imagen destacada HRW por idioma

`HRW-{es,en,fr,ru}.png` es el diagrama Venn "Razón / Voluntad / Corazón /
Sentimentalismo". Aparece en 3 sitios (mismo asset):

- **Miniatura circular** en `/tests` (Tests.jsx).
- **Welcome** del test (arriba, max-width 320px).
- **Result** del test (encima del veredicto).

### 8 caritas por trastorno

`heart-disorder-{R,VR,VM,VI,VC,SV,SI,SC}.jpeg` — retratos con las figuras
que Havard asocia a cada enfermedad. Se usan como:

- **Emblema circular** en las cards del Result (reemplazan al emblema con
  letra que había antes).
- **Retrato central** en el MilestoneModal cada 4.
- (NO en el Welcome — se probó un grid 4×2, se quitó por ruido visual.)

Mapeo estable en la constante `DISORDER_FACES` de `TestHeart.jsx`.

### Umbrales de stage (33/66) — configurables

`heartScoring.js` exporta `HEART_THRESHOLD_LOW = 33` y `HEART_THRESHOLD_HIGH
= 66`. Debajo de LOW → `none`; entre LOW y HIGH → `stage1`; ≥ HIGH →
`stage2`. Cambio requiere rebuild (Vite bundle), pero es one-line.

También hay un tercer parámetro opcional a `scoreHeart(answers, data,
{thresholds: {LOW_PCT, HIGH_PCT}})` para experimentación sin rebuild.

---

## Env vars — build-time vs runtime

Distinción CRÍTICA. Suele confundir:

### Build-time (Vite, incrustadas en el bundle)

Viven en **`.env.production` DENTRO del repo**. Se leen al `vite build`.
Cambiarlas requiere REBUILD del contenedor `web`.

```env
VITE_SUBMIT_URL=/api/submit
VITE_SUBMIT_CHARACTER_URL=/api/submit-character
VITE_SUBMIT_HEART_URL=/api/submit-heart
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
# Temperamento
BREVO_LIST_ID_ES=104
BREVO_LIST_ID_EN=106
BREVO_LIST_ID_FR=105
BREVO_LIST_ID_RU=107
# Carácter
BREVO_LIST_ID_CHARACTER_ES=123
BREVO_LIST_ID_CHARACTER_EN=124
BREVO_LIST_ID_CHARACTER_FR=125
BREVO_LIST_ID_CHARACTER_RU=122
# Corazón
BREVO_LIST_ID_HEART_ES=133
BREVO_LIST_ID_HEART_EN=136
BREVO_LIST_ID_HEART_FR=135
BREVO_LIST_ID_HEART_RU=134
DATABASE_URL=postgres://...@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

---

## Brevo — integración

- v3 REST, api-key en header `api-key: xkeys-...`.
- Endpoint principal: `POST /v3/contacts` con `updateEnabled: true` (upsert
  por email).
- Cada test tiene sus PROPIAS listas por idioma:
  - **Temperamento**: ES=104, FR=105, EN=106, RU=107
    (`BREVO_LIST_ID_{ES,EN,FR,RU}`, elegida con `pickListForLang()`).
  - **Carácter**: ES=123, EN=124, FR=125, RU=122
    (`BREVO_LIST_ID_CHARACTER_{ES,EN,FR,RU}`, elegida con
    `pickCharacterListForLang()`; si falta la de un idioma cae a la lista
    de temperamento de ese idioma).
  - **Corazón**: ES=133, EN=136, FR=135, RU=134
    (`BREVO_LIST_ID_HEART_{ES,EN,FR,RU}`, elegida con
    `pickHeartListForLang()`; mismo fallback: si falta la lista del
    corazón para un idioma, cae a la del temperamento de ese idioma).
  (Los IDs reales viven en el `.env` del VPS y en la cuenta de Brevo; si
  dudas, esa es la fuente de verdad, no este doc.)
- **Sexo**: siempre "Male"/"Female" hacia Brevo, NUNCA "mujer"/"hombre"
  (mapeo en el frontend antes de mandar).
- **Atributos custom deben existir en Brevo ANTES del primer submit**. Si no,
  Brevo responde 400 y el contacto no se crea:
  - **Temperamento**: YEAR, GENDER, TEMP1, TEMP2, IDIOMA,
    ACEPTACION_POLITICAS, TEST_TEMPERAMENTO, CONTACT_SOURCE,
    FECHA_TEST_TEMPERAMENTO, PERFIL, PAIS, CIUDAD, COD_DESCUENTO,
    TEST_TEMPERAMENTO_VECES (Number).
- **TEST_TEMPERAMENTO_VECES** = contador de retomas del test de temperamento
  (segmento "repetidores" en Brevo: VECES ≥ 2, desde 2026-08-21, no
  retroactivo). Brevo no incrementa: `bumpTemperamentTimes()` en server.mjs
  lee el valor y reescribe +1, fire-and-forget DESPUÉS de guardar el lead y
  responder al usuario. Si falla, log `[veces]` y no sube esa vez. NUNCA
  mover esa llamada antes del upsert del lead.
  - **Carácter**: TEST_CARACTER, FECHA_TEST_CARACTER + los 18 P/C/S/J/M/H
    × _GLOBAL/_PASSIVE/_ACTIVE.
  - **Corazón**: TEST_CORAZON, FECHA_TEST_CORAZON, HEART_TOP,
    HEART_BALANCED + los 16 HEART_{R,VR,VM,VI,VC,SV,SI,SC}_{SCORE,STAGE}.
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

## Operaciones — SSL / certificados

Certs Let's Encrypt gestionados por certbot en el HOST (no en Docker).
Nginx del HOST hace de reverse-proxy + termina TLS, luego reenvía a los
puertos 8081 (web) / 3001 (api) de los contenedores.

### Renovación automática

`certbot.timer` de systemd corre 2×/día. Los dominios activos son:
- virtuousleadership.com (authenticator=**nginx**)
- converflow.ai, api.converflow.tech, focuson.education, n8n.alexhavard.com

### Deploy hook

`/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh` corre tras cada
renovación exitosa. Hace `nginx -t && systemctl reload nginx`.

### Gotcha resuelto (2026-08-05)

`virtuousleadership.com` caducó porque su `renewal/*.conf` tenía
`authenticator = manual` con `pref_challs = dns-01` — plugin que exige
input humano (poner TXT records DNS a mano) en cada renovación. Nadie los
ponía → nunca renovaba → caducó a los 90 días silenciosamente (los otros
4 dominios sí renovaban y el fallo se perdía entre los éxitos).

Fix aplicado:

```bash
sudo certbot --nginx -d virtuousleadership.com --cert-name virtuousleadership.com --force-renewal
```

Esto reescribió el conf con `authenticator = nginx` (HTTP-01 automático).
Verificado con `sudo certbot renew --dry-run` — los 5 renuevan sin fallo.

**Si vuelve a pasar**: revisa `sudo cat /etc/letsencrypt/renewal/<dominio>.conf`
— si `authenticator = manual`, aplica el mismo fix. Y sube un monitor
externo en Uptime Robot con alerta 14 días antes de caducidad (mucho más
robusto que confiar en logs internos).

---

## Cómo añadir un test nuevo (patrón validado)

Aprendido de temperamento adulto/infantil/carácter/corazón. Orden sugerido:

1. `src/data/{name}-*.json` — banco de preguntas (a mano o extraído por
   script; ver `extract-*-{xlsx,ods}.py` para el patrón).
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
12. `docker-compose.yml` — si necesitas listas Brevo propias, añade env vars
    `BREVO_LIST_ID_{NAME}_{ES,EN,FR,RU}`.
13. Documentar en este CLAUDE.md los nuevos atributos Brevo a crear.

Si el test tiene bloques narrativos (grupos de N preguntas del mismo tema),
el `MilestoneModal` de `TestHeart.jsx` es reutilizable como patrón — copia
la estructura pero adapta el partial score calc.

---

## Cosas que NO tocar sin entender

- **`api/db.mjs`** — el bloque `ssl: { rejectUnauthorized: false }` es
  mínimo funcional. Cambiarlo rompe la conexión a Supabase pooler.
- **`characterScoring.js` / `heartScoring.js`** — validados contra fixtures
  reales del Excel/ODS. Cambios en el algoritmo requieren revalidación.
- **`CANONICAL_ORDER` en `TestHeart.jsx`** — el corazón NO shufflea a
  propósito (el modal milestone cada 4 depende de bloques consecutivos por
  trastorno). Si añades shuffle rompes la coherencia narrativa.
- **Orden de resolución de placeholders en `childPersonalize.js`** —
  género → edad → nombre. Invertirlo rompe EN/FR/RU (donde `{he/she}` vive
  dentro de `{6-11:... | 12-17:...}`).
- **`formatDiagnosisHtml` en `TestHeart.jsx`** — el ODS trae texto plano
  sin `<p>` ni `<strong>`; los detecta por `\n` o por punto-Mayúscula
  pegado. Si cambian el ODS a un formato con markup, revisa el helper.
- **Slugs de `routes.js`** — cambiarlos rompe URLs indexadas. Si necesitas,
  añade slugs nuevos y mantén los viejos como redirect antes de retirarlos.
- **`SUPPORTED_LANGS`** — orden importa para el LangSwitcher y para hreflang.
- **`.env.production` en git** — sí, la commiteamos (no lleva secretos, sólo
  URLs relativas y el GA ID que es público). Los secretos viven en el VPS.
- **`mix-blend-mode: multiply`** en las imágenes de pirámide (carácter) —
  compensa el fondo blanco del PNG. Si algún día editas el asset para que
  tenga fondo transparente, puedes quitar el estilo. Sin eso, se ve un
  cuadrado blanco antiestético dentro del círculo BEIGE.

---

## Preguntas frecuentes (auto-resueltas)

**"¿Dónde está la config del proyecto?"** → `package.json`, `vite.config.js`,
`.env.production`, `docker-compose.yml`.

**"¿Cómo pruebo en local?"** → `npm install && npm run dev` (localhost:5173).
Backend `api/` no arranca en dev; el front usa VITE_SUBMIT_* vacías = stub.

**"¿Cómo hago un test?"** → `npm test`. Sólo `src/lib/*.test.js`. React no.

**"¿Qué idiomas soportamos?"** → es, en, fr, ru. Todos deben quedar
sincronizados: rutas, i18n dicts, assets si van localizados. (El ODS del
test corazón trae también PT, pero el sitio no lo expone — queda en el
JSON por si algún día se activa.)

**"¿Qué lista de Brevo va con qué idioma?"** → Temperamento: ES=104,
FR=105, EN=106, RU=107. Carácter: ES=123, EN=124, FR=125, RU=122.
Corazón: ES=133, EN=136, FR=135, RU=134. La selección la hacen
`pickListForLang()` / `pickCharacterListForLang()` / `pickHeartListForLang()`
en `server.mjs`; los IDs viven en el `.env` del VPS.

**"¿Por qué el test del corazón no shufflea las preguntas?"** → Porque el
modal milestone cada 4 preguntas necesita que ese bloque de 4 sean del
MISMO trastorno para dar feedback coherente ("acabas de completar
Racionalismo: 75%"). Ver `CANONICAL_ORDER` en `TestHeart.jsx`.

**"¿Los HTMLs del ODS del corazón no tienen `<p>` ni `<strong>`?"** →
Correcto, son texto plano. El helper `formatDiagnosisHtml` los formatea
en runtime insertando `<p>` por línea o por "punto-Mayúscula" pegados, más
un `<h4>Remedio</h4>` intermedio entre diagnóstico y remedio.
