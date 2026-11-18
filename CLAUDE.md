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

3. **Portal privado `/{lang}/app`** (solo ES, solo con suscripción activa):
   Hoy · Formación (7 cursos con ejercicios) · Personas («Tu entorno») ·
   Carácter · Perfil. Es la parte que más cambia: ver la sección
   **«Portal /app»** más abajo antes de tocarla.

---

## Trabajo en equipo — reglas para CUALQUIER sesión

Varias personas y sesiones de Claude trabajan en este repo a la vez. Estas
reglas no son opcionales:

- **Nunca push directo a `main`.** Rama corta (`fix/…`, `feature/…`,
  `docs/…`) → PR → CI verde (`test-and-build`) → merge. Nada de commits ni
  pushes sin que el usuario lo pida explícitamente.
- **Antes de empezar**: `git checkout main && git pull`. Antes de abrir la
  PR, vuelve a traer `main` (otros han podido mergear) y resuelve conflictos.
- **Deploy**: lo hace SIEMPRE el usuario en el VPS. Una sesión de Claude
  nunca ejecuta nada en Hostinger ni se inventa comandos; usa los de la
  sección «Deploy» de este fichero y, si no basta, pregunta.
- **Base de datos (Supabase compartido)**: ninguna sesión aplica
  migraciones ni escribe datos en producción por su cuenta. Se prepara el
  SQL, se guarda en `supabase-migraciones/AAAAMMDD_descripcion.sql` con un
  comentario de qué hace y por qué, y lo aplica la sesión de **Infra/BD**
  (o el usuario). Leer (SELECT) para diagnosticar sí está permitido.
- **Textos de los cursos** (`src/data/curso*.json`): el contenido es de
  Formación y debe salir de las fuentes de Havard (transcripciones,
  cuadernos). No reescribir textos «para que quepan»; si algo no encaja,
  preguntar. Nada de atribuciones tipo «Havard dice».
- **Estilos del portal**: no inventar estilos. Copiar los del Curso 1 y las
  guías de `src/formacion/` (ver «Formación»). Un ajuste de layout es una
  plantilla: se aplica a los 7 cursos y se comprueba en varios.
- **Público mayor**: enunciados 20px, campos 18px, nunca texto de lectura
  por debajo de 16px.
- **No borrar assets ni código «sin usar»** sin preguntar: parte se
  reservará para el panel de administración futuro, y hay módulos aparcados
  a propósito (ver «Código aparcado»).
- **Secretos**: nunca en el repo ni en el front. Viven en
  `/opt/virtuousleadership/.env` del VPS (chmod 600). No pegues emails ni
  datos personales en peticiones a servicios externos.
- **Verifica antes de entregar**: `npm test` + `npm run build` + mirarlo en
  el navegador (dev server en `localhost:5173`).

---

## Stack

- **Frontend**: Vite 5 + React 18, React Router 7, react-helmet-async.
- **Backend**: Node 20 HTTP nativo (no Express), driver `pg` para Supabase,
  Brevo v3 REST vía `fetch`.
- **i18n**: custom (no react-i18next). Archivos JS con dicts anidados.
- **Estilos**: inline styles + tokens en `src/theme.js`. No Tailwind, no CSS
  modules.
- **Tests**: `node --test` (built-in Node 20), sólo módulos puros
  (103 tests; ver «Tests»).
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
    curso1.json … curso7.json                 Contenido de los 7 cursos del portal
                                              (pasos: vídeos, quizzes, reflexiones…).
                                              Ver «Portal /app → Formación».

  account/                   Cliente de Supabase y acceso a datos (sin UI salvo RetosCard/ui).
    supabase.js              Cliente (null si faltan VITE_SUPABASE_*).
    useSession.js            Sesión: undefined = cargando, null = sin sesión.
    useAcceso.js             ¿Suscripción activa? (suscripciones_retos).
    account.js               Alta, login, consentimientos, test_results (guardar/leer).
    perfil.js                Datos de Perfil (profiles, tests, personas, perfil_camino, consents).
    personas.js              CRUD de personas, estimaciones y observaciones.
    camino.js  retos.js      Camino (aparcado) y llamadas a Edge Functions retos-* / catálogo.

  app/                       Portal /app (marco + pestañas). Ver «Portal /app».
    PortalGuard.jsx          Guardia de sesión + suscripción; pinta AppShell.
    AppShell.jsx             Cabecera, burbuja inferior (Hoy · Camino🔒 · Formación), <Outlet/>.
    Hoy.jsx  Perfil.jsx  Personas.jsx  ResultadoCaracter.jsx  MapaCaracter.jsx  Radar.jsx
    personas/                CrearFicha (test de 8 preguntas sobre otra persona), comun (Avatar,
                             MapaPersonas, FichaContenido…), Observacion, MisPersonas…
    camino/                  Piezas del Camino (aparcado). Juegos.jsx y ui.jsx SÍ se usan
                             desde personas/CrearFicha: no borrar.
    estilos.js  Iconos.jsx   Estilos compartidos (tarjeta, eyebrow, parrafo…) e iconos.

  formacion/                 Cursos del portal. Ver «Portal /app → Formación».
    Formacion.jsx            Listado de los 7 cursos con progreso.
    Modulo.jsx               Un curso: listado de pasos, reproductor, cuaderno, plan.
    Actividad.jsx            TODOS los tipos de ejercicio (~5500 líneas) + CARATULA_TEXTOS
                             + REFLEXION_IMAGENES.
    flujoModulo.js           Orden de pasos y filtrado por temperamento.
    useModulo.js useNotas.js Persistencia (Supabase; localStorage si no hay cliente).
    BlocDeNotas.jsx NotaTexto.jsx CuadernoPersonal.jsx PlanPersonal.jsx
    GUIA-ESTILOS-FORMACION.md  CHECKLIST-NUEVO-CURSO.md  AUDITORIA-ESTILOS.md
                             LEER antes de tocar estilos o añadir un curso.

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
  server.mjs                 HTTP server. 5 endpoints: /api/submit,
                             /api/submit-children, /api/submit-character,
                             /api/submit-heart, /api/account.
  auth.mjs                   Alta de cuentas en el Supabase de Virtus (Admin API).
  db.mjs                     pg Pool + queries de schools/parents/children/submissions.
  migrations/                001_init_children.sql (schema del test infantil).

supabase-migraciones/        Registro de los cambios SQL del Supabase compartido (los aplica
                             Infra/BD, no se ejecutan solos). Nombre: AAAAMMDD_descripcion.sql.
docs/                        FICHA_INTEGRACION_BD_FORMACION.md: tablas de Formación en detalle.
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

Sólo módulos puros (`src/lib/*.test.js` + `src/formacion/**/*.test.js`).
Total actual: **103 tests** (carácter, corazón, personas, camino, panel,
track, modulo1). CI los corre en cada PR junto al build; si los rompes, la
PR no debe mergearse.
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
# Converflow (CRM propio) — opcional. Si está, cada envío del test de
# temperamento adulto se replica en Converflow (POST /leads/upsert) tras
# guardarse en Brevo. Listas por idioma: default TT-ES / TT-EN / TT-FR / TT-RU
# (sobrescribibles con CONVERFLOW_TT_LIST_{ES,EN,FR,RU}).
CONVERFLOW_API_KEY=cfai_...
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
- **Eventos por envío** (`sendTestEvent()` en server.mjs, mismas reglas
  fire-and-forget que el contador): cada submit registra en Brevo
  `test_temperamento_completado` / `test_caracter_completado` /
  `test_corazon_completado` (con `idioma` y datos del resultado como
  propiedades). Las automatizaciones de resultados disparan con este evento
  (trigger "se registra un evento" + re-entrada permitida) para que las
  RETOMAS también reciban email — el antiguo trigger "contacto añadido a una
  lista" sólo salta la primera vez. OJO al migrar una automatización:
  sustituir el trigger de lista por el de evento (no dejar ambos: la primera
  vez entraría dos veces = email duplicado).
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

## Cuentas de usuario y «Mi panel» (Supabase de Virtus)

Al terminar el test de temperamento adulto se crea una cuenta. La antigua
`/{lang}/mi-panel` (es `mi-panel`, en `my-dashboard`, fr `mon-espace`, ru
`kabinet`) **ya no pinta nada**: redirige a `/{lang}/app` (portal), y
`/mi-panel/camino|formacion|retos` redirigen a sus equivalentes en `/app`.
Sin suscripción, el portal manda a `/tests/temperamento/gracias`, que
muestra el resultado + la tarjeta «Tu virtud-desafío» (mapa en
`src/account/challengeVirtues.js`).

- **Proyecto**: el Supabase de Virtus (`~/virtus`), ref
  `qyuxmqvqmgqcsduzljkd`, para que la misma cuenta sirva en la app. Es el
  MISMO proyecto donde viven las tablas del portal (personas, respuestas…). Esquema en `~/virtus/supabase/migrations` (`profiles`,
  `test_results`; la migración `20261031000000_web_accounts.sql` añade los
  campos del formulario y el trigger que los copia desde user_metadata).
- **Alta**: `POST /api/account` crea el usuario con la service role key y
  `email_confirm: true` (acceso inmediato). 201 creada, 409 ya existía → el
  front intenta entrar con esa contraseña; si falla, ofrece recuperarla.
- **Resultado**: lo inserta el front con la sesión del usuario en
  `test_results` (RLS: solo el propio usuario), con las respuestas en bruto.
- **Brevo/Converflow** siguen igual, pero con cuentas ya no bloquean: si
  Brevo falla, el usuario llega a su panel igualmente.
- **Interruptor**: sin `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` el sitio
  funciona como antes (página de gracias / resultado in-page en RU).
- **Contraseña olvidada**: `resetPasswordForEmail` → `/{lang}/restablecer`
  (slugs por idioma en `routes.js`); esas URLs deben estar en las redirect
  URLs del proyecto Supabase.
- **Env**: build-time `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_ACCOUNT_URL`; runtime `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  (en `/opt/virtuousleadership/.env`, nunca en el front).
- **Local**: `node api/server.mjs` (puerto 3001; Vite hace proxy de `/api`)
  + `npm run dev` con las VITE_SUPABASE_* en `.env.development.local`.

### Consentimientos y menores de 14

- **Casillas del formulario**: una obligatoria (cuenta + resultados por email) y otra **opcional y
  desmarcada** para el boletín. Sin boletín: el contacto se crea en Brevo **sin lista** (recibe el
  email de resultados por el evento) y **no** se envía a Converflow.
- **Registro**: `public.consents` (append-only: finalidad `cuenta`/`newsletter`/`tutor`, sí/no,
  `text_version`, idioma, fecha). Lo escribe solo el servidor: `POST /api/consents` (con el token de
  sesión) tras iniciar sesión. Vista `consents_current` = estado vigente. Si cambias la redacción de
  las casillas, sube `CONSENT_TEXT_VERSION` en `api/auth.mjs`.
- **Menores de 14** (LOPDGDD art. 7; la edad la decide el servidor con `isUnder14`): si el año da
  justo 14, el formulario pregunta si ya los ha cumplido. Menor → pide el email del tutor, la cuenta
  nace **bloqueada** (ban en Auth), el servidor guarda el resultado, crea `guardian_requests` (token
  con hash, caduca a 30 días) y envía el email al tutor con Brevo (`BREVO_SENDER_EMAIL`). El tutor
  autoriza en `/{lang}/consentimiento-tutor` → `POST /api/guardian/confirm` desbloquea la cuenta.
  Si el email falla, se borra el alta. Los menores no van a Brevo ni a Converflow.
- **Pendiente**: borrar a los 30 días las cuentas no autorizadas (no hay tarea programada).
- Para probar en local sin enviar emails: `BREVO_API_URL` apunta el envío a un simulador.

---

## Retos diarios (beta privada, solo ES)

Retos de carácter según el método de Havard: reto por la mañana y examen guiado por la noche.
Lo mismo corre en la app móvil de Virtus; **toda la lógica vive en las Edge Functions
`retos-manana`, `retos-noche` y `retos-onboarding`** del Supabase de Virtus (repo `~/virtus`, rama
`feat/retos-havard`). Esta web solo las llama.

- **Acceso**: solo cuentas con **suscripción activa a Retos** (`public.suscripciones_retos`, `activa = true`
  y sin caducar). Por defecto toda cuenta nueva (también la del test) nace **desactivada**; de momento
  solo se activa a mano (SQL en Supabase). El servidor lo exige en todas las funciones `retos-*` para
  web y app (403 `sin_suscripcion`); la web solo lee su fila para mostrar u ocultar la interfaz.
  No se usa `subscriptions` (la de la app, que escribe RevenueCat).
- **Piezas**: `src/account/retos.js` (cliente de las funciones y `tieneAccesoRetos()`),
  `src/account/RetosCard.jsx` (tarjeta en la landing de resultados `TestTemperamentoGracias`).
- La interfaz de Retos (`pages/Retos.jsx`, `Conversacion`) está **aparcada**: hoy la suscripción a
  Retos se usa como **llave de acceso al portal** `/app` (ver abajo).
- Una cuenta nueva **no** tiene acceso hasta activarle la suscripción.

---

## Portal /app (suscriptores, solo ES)

Producto: suscripción de pago (beta). Es una SPA dentro de la SPA, sin el Layout del sitio.

### Rutas y acceso

Definidas en `src/App.jsx` (bloque «Portal /app»), slug en `routes.js` (`app: { es: 'app' }`):

| Ruta | Componente | Qué es |
|---|---|---|
| `/es/app` | `app/Hoy.jsx` | Resultado de temperamento, mapa de carácter y bloque «Tu entorno» |
| `/es/app/formacion` | `formacion/Formacion.jsx` | Los 7 cursos con su progreso |
| `/es/app/formacion/curso-N` | `formacion/Modulo.jsx` | Un curso (slug `curso-1` … `curso-7`) |
| `/es/app/personas` | `app/Personas.jsx` | Lista «Tu entorno» (mapa + fichas) |
| `/es/app/personas/nueva` | `app/Personas.jsx` → `NuevaPersona` | Crear ficha (usa `personas/CrearFicha`, los 4 grupos) |
| `/es/app/personas/:id` | `app/Personas.jsx` → `PersonaDetalle` | Ficha de una persona |
| `/es/app/caracter` | `app/ResultadoCaracter.jsx` | Resultado del test de carácter (radar) |
| `/es/app/perfil` | `app/Perfil.jsx` | Pestañas: datos/«Mis resultados», «Mis notas», configuración |
| `/es/app/camino` | — | **Bloqueado**: `Navigate` a Hoy. En la burbuja sale con candado |

- `PortalGuard.jsx`: sin sesión → `/login`; idioma ≠ es → `/login`; sin suscripción activa
  (`useAcceso` → `suscripciones_retos`) → `/tests/temperamento/gracias`. Si pasa, pinta
  `AppShell` (cabecera + burbuja inferior Hoy · Camino🔒 · Formación + `<Outlet/>`). Perfil se abre
  desde la cabecera.
- Enlaces internos: siempre `LocalLink` / `useLocalPath()` (`lp('/app/personas')`), nunca rutas con
  idioma a mano. **No uses rutas `/mi-panel/...`** para navegar dentro del portal: redirigen y, en el
  caso de `camino`, acaban en Hoy (este fue el bug de «Añadir persona», nov-2026).

### Tablas de Supabase que usa el portal

Todas con RLS por `user_id = auth.uid()`; el front escribe con la sesión del usuario.

| Tabla | Para qué | Notas |
|---|---|---|
| `profiles` | Nombre, apellidos, año de nacimiento… | `account/perfil.js` |
| `test_results` | Resultados de tests (`kind`: `temperament`, `character`, `heart`) | Ver formatos abajo |
| `suscripciones_retos` | Llave de acceso al portal | Se activa a mano (SQL) |
| `personas` | Fichas de «Tu entorno» | CHECKs abajo |
| `persona_estimaciones` | Cada test de 8 preguntas hecho sobre una persona | `respuestas` (array de 8), `puntos`, `primario`, `secundario`, `confianza` |
| `persona_observaciones` | Notas/observaciones sobre una persona | CHECKs abajo |
| `contenidos` | Copia en BD de cada paso de los cursos | **FK** de `respuestas.contenido_id` |
| `respuestas` | Respuesta del usuario a cada paso | UNIQUE (`user_id`, `contenido_id`) → upsert |
| `progreso_curso` | Paso actual y nº de completados por curso | UNIQUE (`user_id`, `curso`) |
| `notas_formacion` | Bloc de notas por paso | `texto` es HTML (ver «Notas») |
| `perfil_camino`, `actividad_diaria`, `preguntas_respuestas_ejercicios` | Camino (aparcado) | Perfil lee `perfil_camino.estado_vida` |
| `consents` | Consentimientos | Solo lectura en el front |
| `preferencias_notificaciones` | Horas del reto, la reflexión y la formación + zona horaria | Compartida con la app móvil; una fila por usuario |
| `persona_invitaciones` | Enlace para que la persona de una ficha verifique su temperamento | Una por ficha; aceptarla es cosa del servidor |

Restricciones que ya han roto cosas (comprobar antes de insertar):

- `personas.grupo` ∈ `familia, amigos, trabajo, comunidad, pendiente` · `estado` ∈ `sin_estimar,
  estimado, confirmado, invitado, registrado` · `nombre` 1–40 caracteres · `relacion` ≤ 30 ·
  `avatar` ≤ 8 · `primario`/`secundario` ∈ `COL, MEL, SAN, FLE` o null.
- `persona_observaciones.situacion` ∈ `critica, cambio_planes, problema, buena_noticia, desacuerdo,
  otro, nota_formacion` · `linea` ≤ 280 · `palabra` y `temperamento` pueden ser null.
- `respuestas.contenido_id` **debe existir en `contenidos`**. Si añades o renombras un paso en un
  `cursoN.json`, hay que dar de alta su fila en `contenidos` (SQL en `supabase-migraciones/`, lo
  aplica Infra). Si no, el progreso de ese paso falla en silencio por FK.
- `respuestas.modulo` es integer: pasos como el proyecto final van con `null` (`moduloBD()` en
  `useModulo.js`).

Detalle de columnas y ejemplos: `docs/FICHA_INTEGRACION_BD_FORMACION.md`.

### Formatos de `test_results.result` (leer SIEMPRE ambos)

- **Temperamento** actual: `{ primario, secundario, profileKey: 'SAN-COL', answers: {stage1, stage2,
  tie}, … }`. Antiguo: `{ profile | type, scores, … }`. Usa `claveTemperamento(result)` de
  `lib/virtudes.js` (acepta `profileKey`/`type`/`profile`) y, si devuelve null, cae a
  `primario-secundario`. Las barras por temperamento solo existen en el formato antiguo (`scores`):
  no las derives de `stage1`, contradice al temperamento principal en ~1/3 de los tests reales.
- **Carácter** actual: `{ self: { prudencia: 0..100, … }, facets: { v: {active, passive} } }`.
  Antiguo: `{ virtues: { v: { global: 0..1 } } }` → multiplicar por 100. Ver `pctVirtud` en
  `Perfil.jsx` y `resultadoCaracter()` en `lib/virtudes.js`.

### Personas («Tu entorno»)

- Lógica pura en `src/lib/personas.js` (testeada): `GRUPOS`, `gruposPara(estadoVida)` (comunidad solo
  si `estado_vida === 'religioso'`; en `/app/personas/nueva` se muestran los 4 con
  `todosLosGrupos`), `PREGUNTAS` (8), `DESEMPATE`, `puntuar()`, `SITUACIONES`, `PALABRAS_3P`,
  `FICHA` por temperamento.
- Acceso a datos en `src/account/personas.js` (`crearPersona`, `guardarEstimacion`,
  `anotarObservacion`…). Hook `app/usePersonas.js` (`{ cargando, lista, menor }`).
- El bloque de Hoy y la lista se llaman **«Tu entorno»** (antes «Tu entorno magnánimo»; no volver al
  nombre viejo).
- Desde Formación también se crean personas: `SelectorCirculoOro` (curso 2, test de magnanimidad)
  pide nombre + grupo y crea la ficha en BD **antes** de marcarla; `CirculoPersonas` guarda notas
  como observación `situacion: 'otro'`.

### Añadir persona: test corto + «comparte el test» (verificación)

Es el bucle de crecimiento del onboarding (nov-2026). Solo en `/app/personas/nueva` (botón «Añadir
persona» de Hoy y de la lista); Formación y el Camino aparcado siguen con sus flujos.

- **Test corto**: 4 de las 8 preguntas (`PREGUNTAS_CORTO_IDX` en `lib/personas.js`, sin textos
  nuevos) + desempate si hay empate. `puntuarCorto()`: nunca da confianza alta; con 2 «No lo sé» no
  hay resultado. `CrearFicha` lo activa con la prop `corto`; con `compartir` la ficha se guarda sola
  al llegar al resultado (un `ref` evita la doble alta del modo estricto) y debajo sale
  `personas/CompartirTest.jsx`.
- **Enlace**: `/es/tests/temperamento?inv=<token>&utm_source=invitacion&utm_medium=<canal>`. El
  token vive en `persona_invitaciones` (una por ficha; la crea el front con RLS, `invitacionDe()`
  en `account/personas.js`). Nunca se envía nada desde el servidor: comparte el usuario (WhatsApp,
  correo, menú del móvil o copiar).
- **Invitado**: `components/Invitacion.jsx` (montado en `App.jsx`) guarda el
  token, pregunta UNA vez si quiere compartir su temperamento (decisión expresa; textos en
  `invitacion.*` de los 4 idiomas) y, con sesión y resultado guardado, llama a
  `POST /api/invitacion/aceptar`. `GET /api/invitacion?token=` devuelve solo el nombre de pila de
  quien invita.
- **Verificación** (`api/invitaciones.mjs`, service role): lee el último `test_results` de
  temperamento del invitado y pone la ficha en `estado: 'confirmado'`, con su primario/secundario,
  `confianza: 'alta'` y `verificado_en`. La invitación se consume una sola vez. En el portal se ve
  la insignia «Verificado por X» (`Verificado` / `estaVerificada` en `personas/comun.jsx`).
- **Test**: quien llega por invitación no ve «¿cómo has llegado?»; el origen se anota como
  `referido` (`esReferido()` en `account/invitacion.js`, usado en `answerQualify` de `TestTBP.jsx`).
- **Si repite el test**: el trigger `test_results_sincroniza_fichas` actualiza las fichas que
  verificó (también con tests hechos desde la app móvil).
- **Enlace siempre al dominio real** (`VITE_SITE_URL`, por defecto virtuousleadership.com), también
  en local; en desarrollo `CompartirTest` añade un enlace al servidor local para probar.
- **SQL**: `supabase-migraciones/20261118_persona_invitaciones.sql` (aplicado en producción).
- Si añades un fichero `.mjs` a `api/`, añádelo también al `COPY` de `api/Dockerfile`.

### Horarios y avisos («Tu día a día»)

Cuándo quiere el usuario su reto diario, su reflexión y su formación semanal (nov-2026). Es la
**configuración primaria de notificaciones**: una sola tabla que leerán la web (correo del reto) y
la app móvil (push). Quien envíe debe leer de aquí, no guardar copias.

- **Tabla**: `preferencias_notificaciones` (una fila por usuario): `hora_reto`, `hora_reflexion`,
  `dia_formacion` (ISO 1 lunes … 7 domingo), `hora_formacion`, `zona_horaria` (IANA),
  `avisos_email`, `avisos_push`. Las horas son hora local del usuario en su zona; un trigger
  rechaza zonas que Postgres no conozca. SQL en
  `supabase-migraciones/20261118_preferencias_notificaciones.sql`.
- **Front**: `lib/preferencias.js` (puro, testeado: valores por defecto, `normalizar`, textos),
  `account/preferencias.js` (leer / upsert), `app/Horarios.jsx` (`ConfigurarHorarios`: tres
  pantallas, reutilizable en el onboarding; la página es `/es/app/horarios`). El resumen sale en
  Perfil → Configuración (`SeccionHorarios`).
- Sin fila, el usuario aún no ha configurado nada (`configurado: false`): sirve para saber si le
  falta ese paso del onboarding. La zona se toma del dispositivo la primera vez.
- `perfil_camino.hora_manana` / `hora_examen` son del Camino aparcado: no usarlos para avisos.

### Formación (cursos del portal)

- **Contenido**: `src/data/curso1.json` … `curso7.json` → `{ id: 'cursoN', titulo, curso, pasos[] }`.
  Cada paso: `{ id: 'mN-XX', tipo, titulo, visible, modulo, … datos del tipo }`. Los IDs no se
  renombran nunca (son la clave de `respuestas`, `notas_formacion` y `contenidos`).
- **Tipos** (`tipo`): `video`, `lectura`, `quiz`, `define`, `desliza`, `identifica`,
  `test_profundo`, `reflexion_piramide`, `reflexion_guiada`, `conclusion_modulo`, `cierre`,
  `circulo_personas`, `temperamento_perfil`, `temperamento_magnanimidad`, `retos_temperamento`,
  `test_caracter`, `plan_crecimiento`, `armonia_temperamento`, `objetivos_corazon`,
  `proyecto_mision`. El `switch` que elige componente está en `PasoActividad` (`Modulo.jsx`); los
  componentes, en `Actividad.jsx`. Tipo nuevo = componente + `case` + texto en `CARATULA_TEXTOS`.
- **Visibles vs. de flujo**: `visible: true` = aparece en el listado del curso (vídeos que abren
  módulo). El resto se encadena detrás. `test_profundo` con `temperamento` solo se muestra a quien
  tiene ese temperamento como primario o secundario (`flujoModulo.js`).
- **Evaluables**: `quiz`, `define`, `desliza` → `aprobado = aciertos/total ≥ 0.70`; el resto,
  `aprobado = null`.
- **Persistencia** (`useModulo.js`): si hay cliente de Supabase, lee `respuestas` +
  `progreso_curso` y hace upsert; si no, localStorage `vl-modulo:<user>:<cursoId>`. Cada fila se
  expone como `completados[pasoId] = { fecha, ...respuesta, aprobado }`.
- **Plan de crecimiento** (`m2-17`, `plan_crecimiento`): se guarda como `respuesta: { plan: {…} }`,
  pero hay filas antiguas con las claves sueltas. Quien lo lea debe aceptar los dos (desanidar
  `plan` y mezclar con las sueltas), como `PlanCrecimiento` (`Actividad.jsx`) y `VistaResumenPlan`
  (`Modulo.jsx`). Si ya está hecho, el ejercicio abre en el resumen.
- **Notas** (`useNotas.js`, `notas_formacion`): el editor es `contentEditable` y guarda HTML
  sencillo (`<b>`, `<i>`, `<u>`, `<div>`, `<br>`, `&nbsp;`). Algunas notas (cargadas a mano) usan
  `**negrita**`. Para pintarlas usa **siempre** `notaAHtml()` / `<NotaTexto>`
  (`formacion/NotaTexto.jsx`), que sanea (solo esas etiquetas, sin atributos) y entiende ambos
  formatos. Para el PDF, `notaATexto()`. Nunca `dangerouslySetInnerHTML` con el texto en bruto.
  No se muestra el número de notas en ningún sitio (decisión de producto).
- **Perfil → «Mis notas»** recorre los 7 cursos (`MODULOS` en `Perfil.jsx`); los títulos de pasos
  de vídeo ocultos se muestran como «Módulo › paso».
- **Catálogo de vídeos**: `useCatalogo()` llama a la función `formacion-catalogo` (gated). En dev, si
  existe `public/__dev_cursos.json` (sin versionar), se usa ese.
- **Estilos**: `GUIA-ESTILOS-FORMACION.md` + `CHECKLIST-NUEVO-CURSO.md` en `src/formacion/`.
  Resumen de normas de producto: el usuario nunca ve etiquetas internas (VIDEO/QUIZ/CUADERNO);
  carátulas breves con el texto genérico de `CARATULA_TEXTOS`; ejemplos siempre plegables («Ver
  ejemplo» + lupa); las reflexiones/ideas clave de Perfil aparecen al completar su paso, nunca
  todas de golpe; `borderRadius: 0` en todo.
- **Analítica**: `lib/track.js` (`trackCompletado`, `trackPaso`) empuja eventos al dataLayer.

### Código aparcado (no borrar sin preguntar)

No está enrutado hoy pero se reutilizará: `pages/PanelApp.jsx`, `pages/MiPanel.jsx`,
`pages/Retos.jsx`, `app/Camino.jsx`, `app/useCamino.js`, `app/camino/*` (ojo: `Juegos.jsx` y
`ui.jsx` sí se usan en Personas), `account/camino.js`. Roadmap: Camino, algoritmo IA, panel de
administración interno.

### Usuario de demo

`luis.demo@virtuousleadership.com` (para enseñar el producto): nacido en 1996, temperamento
**SAN-COL**, carácter con magnanimidad y justicia altas; 12 personas en los 4 grupos con
estimaciones y observaciones; cursos 1 y 2 completos con respuestas coherentes (incluido el plan de
crecimiento); notas en el bloc. Si cambias formatos de `respuestas`, comprueba que su cuenta se sigue
viendo bien. Sus datos se regeneran con SQL que aplica Infra, no a mano desde el portal.

### Probar el portal en local

1. `npm install && npm run dev` → `http://localhost:5173/es/app` (el `.env.local`, sin versionar,
   lleva las `VITE_SUPABASE_*`; pídeselo al usuario si no lo tienes).
2. Entra con una cuenta con suscripción activa (p. ej. la de demo). **Ojo**: en local escribes en
   la base de datos de PRODUCCIÓN con esa cuenta: no hagas pruebas destructivas con la de demo.
3. Antes de la PR: `npm test` y `npm run build`.

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
El portal sí funciona en local contra el Supabase real (ver «Portal /app →
Probar el portal en local»). En la app de escritorio de Claude, el servidor
está en `.claude/launch.json` como `vl-dev`.

**"¿Dónde se guarda el progreso de los cursos?"** → En Supabase
(`respuestas`, `progreso_curso`, `notas_formacion`). localStorage solo si no
hay cliente de Supabase. Ver «Portal /app → Formación».

**"He añadido un paso a un curso y no guarda"** → Falta su fila en
`contenidos` (FK). Prepara el INSERT en `supabase-migraciones/` y pásalo a
Infra.

**"¿Por qué hay código que no se usa (Camino, Retos, MiPanel)?"** → Está
aparcado a propósito. Ver «Código aparcado». No borrarlo.

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
