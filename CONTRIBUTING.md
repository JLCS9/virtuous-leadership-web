# Contributing

Guía práctica para colaborar en el repo. Lee [CLAUDE.md](./CLAUDE.md) antes
para entender la arquitectura completa.

## Setup local

```bash
git clone git@github.com:JLCS9/virtuous-leadership-web.git
cd virtuous-leadership-web       # (o el nombre del clone)
npm install
npm run dev                       # localhost:5173
```

En dev, las variables `VITE_SUBMIT_*` están vacías → los formularios de
test hacen **stub** (log en consola en vez de POST real a Brevo).

## Flujo de trabajo

### Ramas

- `main` — producción. **Protegida**: no se pushea directamente. Deploy
  automático a virtuousleadership.com al mergear.
- `staging` — pre-producción. Deploy automático a dev.virtuousleadership.com.
- `feature/<slug-corto>` — features nuevas (ej. `feature/quinto-test`).
- `fix/<slug-corto>` — bug fixes.
- Vida corta: horas/días, no semanas. PRs pequeños > PRs grandes.

### Abrir un PR

```bash
git checkout -b feature/mi-cambio
# ...trabajas...
git add ...
git commit -m "Descripción imperativa corta"
git push -u origin feature/mi-cambio
```

Después:
1. Abre PR contra `main` (o `staging` si es un cambio de riesgo).
2. Rellena el template (aparece automáticamente).
3. El CI corre `npm test` y `npm run build` — espera a que estén ✅ en verde.
4. Pide review a otro colaborador (o al owner).
5. Al mergear, se despliega automáticamente. Verifica en producción y ojea
   los logs (`docker compose logs --tail=30 api` en el VPS).

### Commits

Estilo del historial existente: mensaje imperativo corto en la primera
línea + cuerpo detallado si el cambio no es trivial. Ejemplos reales:

```
Test infantil: banco único 6-17 con placeholder de edad inline
Medición GTM: Cookiebot CMP + page_view por dataLayer + eventos test
Fix Brevo: VITE_SUBMIT_CHARACTER_URL en .env.production
```

En el cuerpo del commit explica el **por qué**, no el **qué** (el diff ya
cuenta el qué).

Si colaboras con Claude Code, incluye la línea `Co-Authored-By:` al final.

## Testing

```bash
npm test                # unit tests (motor de scoring)
```

Actualmente sólo hay tests unitarios de los módulos puros
(`src/lib/*.test.js`). Los componentes React no tienen tests todavía —
la verificación se hace manualmente en `npm run dev` o vía preview del PR.

## Qué NO tocar sin discutir

Ver la sección "Cosas que NO tocar sin entender" en [CLAUDE.md](./CLAUDE.md).
En resumen:
- `api/db.mjs` (config SSL de Supabase).
- `src/lib/characterScoring.js` (validado contra fixtures del Excel).
- Orden de resolución de placeholders en `childPersonalize.js`.
- Slugs de `routes.js` que ya estén indexados por Google.
- `SUPPORTED_LANGS`.

## Deploy

Automático al mergear a `main` o `staging`. Ver
`.github/workflows/deploy-prod.yml` para detalles.

Si el auto-deploy falla, puedes re-lanzarlo desde la pestaña **Actions**
del repo (workflow "Deploy production" → botón "Run workflow"). Si sigue
fallando, deploy manual desde el VPS:

```bash
ssh <user>@<vps>
cd /opt/virtuousleadership
git pull && docker compose build web api && docker compose up -d web api
docker compose logs --tail=30 api
```

## Cómo pedir ayuda

- Bug en producción: crea issue con label `bug` y captura de pantalla / logs.
- Feature request: crea issue con label `enhancement`.
- Duda sobre arquitectura: revisa CLAUDE.md primero; si no está, pregunta.
