# Virtuous Leadership — sitio y tests

Sitio multi-idioma (ES/EN/FR/RU) de **Virtuous Leadership** con cuatro tests
de autoconocimiento basados en la teoría de Alexandre Havard:

- **Test de temperamento adulto** — 4 temperamentos clásicos (colérico,
  melancólico, sanguíneo, flemático).
- **Test de temperamento infantil** — versión para padres/tutores (6-17 años).
- **Test de carácter** — 6 virtudes de Havard, 68 preguntas Likert.
- **Test del corazón (Corazón Libre)** — 8 enfermedades espirituales,
  32 preguntas Likert.

Producción: [virtuousleadership.com](https://virtuousleadership.com).

## Stack

Vite 5 + React 18 + React Router 7 · i18n custom · Node 20 HTTP + pg
(Supabase) · Brevo v3 REST · Docker Compose (VPS Hostinger).

## Requisitos

- Node 20+
- npm 10+

## Desarrollo local

```bash
npm install
npm run dev            # localhost:5173, HMR
npm test               # tests unitarios del motor de scoring
npm run build          # bundle a dist/
npm run lint           # eslint
```

En dev el backend `api/` no arranca — las variables `VITE_SUBMIT_*` quedan
vacías y los formularios de test hacen stub (log en consola en vez de
llamar a Brevo). Para probar el flujo completo hace falta desplegar en
Docker o levantar `api/server.mjs` a mano con el `.env` correspondiente.

## Estructura

```
src/                Frontend React (Vite)
  TestTBP.jsx           Test de temperamento adulto
  TestTBPChildren.jsx   Test de temperamento infantil
  TestCharacter.jsx     Test de carácter (6 virtudes)
  TestHeart.jsx         Test del corazón (8 enfermedades espirituales)
  i18n/                 es.js, en.js, fr.js, ru.js + routes.js
  data/                 Bancos de preguntas + textos largos (JSON)
  lib/                  Motores puros (scoring, personalize) + tests
  pages/                Wrappers de página con SEO
  components/           Layout, Header, Footer, CTA, PageTracker...
  assets/               Imágenes (localizadas por idioma cuando aplica)
api/                Backend Node HTTP + pg + Brevo proxy
  server.mjs            Endpoints /api/submit, /api/submit-children,
                        /api/submit-character, /api/submit-heart
  db.mjs                pg pool + queries del test infantil (Supabase)
  migrations/           SQL
scripts/            Utilidades one-shot (extracción xlsx/ods → JSON)
```

## Contribuir

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para el flujo de PRs, testing y
deploy.

## Documentación completa

Ver [CLAUDE.md](./CLAUDE.md) para arquitectura detallada, convenciones,
patrón para añadir un test nuevo, gotchas conocidos, mapeo de env vars y
proceso de deploy.

## Licencia

Propietario · **CSO Digital SL**.
