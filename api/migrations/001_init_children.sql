-- Migración 001 — Esquema inicial para el Test de Temperamento de Niños (TBP-Kids)
--
-- Crea 4 tablas: schools, parents, children, submissions.
-- No toca nada relacionado con el test de adultos.
--
-- Cómo aplicar (desde el VPS, una sola vez):
--   docker run --rm -i postgres:16-alpine psql "$DATABASE_URL" < /opt/virtuousleadership/api/migrations/001_init_children.sql
--
-- Idempotente: usa IF NOT EXISTS / IF EXISTS donde es seguro. Se puede correr
-- de nuevo sin romper nada — útil si la primera aplicación se interrumpe.

BEGIN;

-- ──────────────────────────── schools ────────────────────────────
-- Una fila por colegio detectado a través del query param `?colegio=`.
-- No hay gating: cualquier slug entrante crea su fila automáticamente.
-- `display_name` se rellena igual que `token` por defecto; en el futuro
-- podemos sobreescribirlo manualmente con un nombre humano cuando lo
-- necesitemos (por ejemplo "Colegio San Patricio" en lugar de "san-patricio").

CREATE TABLE IF NOT EXISTS schools (
  token              TEXT PRIMARY KEY,
  display_name       TEXT NOT NULL,
  first_seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_submission_at TIMESTAMPTZ
);

-- ──────────────────────────── parents ────────────────────────────
-- Un padre/madre/tutor por email. El email es la clave funcional.
-- Si el mismo email vuelve a rellenar el formulario, hacemos UPSERT
-- (actualizamos nombre/relación/idioma/consent_ts).

CREATE TABLE IF NOT EXISTS parents (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  first_name      TEXT,
  relation        TEXT CHECK (relation IN ('Padre','Madre','Tutor')),
  language        TEXT NOT NULL DEFAULT 'es',
  consent_minors  BOOLEAN NOT NULL DEFAULT FALSE,
  consent_ts      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────── children ────────────────────────────
-- Un hijo por (parent_id, first_name, birth_year, sex). Si el mismo
-- padre vuelve a testar al mismo niño, se reutiliza la fila (mismo
-- child_id) y se inserta una nueva fila en `submissions` con el resultado
-- del nuevo test. Así mantenemos historial de retests.
--
-- sex:  'M' = Niño · 'F' = Niña · 'X' = Prefiero no especificar
-- school_token nullable: si el padre llega sin `?colegio=` queda en NULL.

CREATE TABLE IF NOT EXISTS children (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id    BIGINT NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  first_name   TEXT NOT NULL,
  birth_year   INT NOT NULL CHECK (birth_year BETWEEN 1900 AND 2100),
  sex          CHAR(1) NOT NULL CHECK (sex IN ('M','F','X')),
  school_token TEXT REFERENCES schools(token),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, first_name, birth_year, sex)
);

CREATE INDEX IF NOT EXISTS idx_children_parent_id    ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_school_token ON children(school_token);

-- ──────────────────────────── submissions ────────────────────────────
-- Una fila por envío (= un test completado).
-- Append-only: nunca se borran ni actualizan resultados, así tenemos
-- historial completo si un niño hace el test más de una vez.
--
-- test_set:    'A' = 6-11 años · 'B' = 12-17 años
-- primario:    siempre uno de {COL, MEL, SAN, FLE}
-- secundario:  NULL si is_pure=true; uno de {COL, MEL, SAN, FLE} si is_pure=false
-- answers_json: respuestas crudas {COL1: "SI"|"NO", SAN1: ..., ...}
--               JSONB para poder indexar/consultar en el futuro

CREATE TABLE IF NOT EXISTS submissions (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  child_id           BIGINT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  test_set           CHAR(1) NOT NULL CHECK (test_set IN ('A','B')),
  age_at_submission  INT,
  answers_json       JSONB NOT NULL,
  primario           TEXT NOT NULL CHECK (primario IN ('COL','SAN','MEL','FLE')),
  secundario         TEXT CHECK (secundario IN ('COL','SAN','MEL','FLE')),
  is_pure            BOOLEAN NOT NULL,
  margin             REAL,
  score_s2           REAL,
  profile_key        TEXT NOT NULL,
  profile_name       TEXT,
  language           TEXT NOT NULL DEFAULT 'es',
  submitted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_child_id  ON submissions(child_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted ON submissions(submitted_at DESC);

COMMIT;

-- ──────────────────────────── verificación ────────────────────────────
-- Opcional: descomenta para ver el estado tras aplicar.
-- SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
