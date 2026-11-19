-- Onboarding obligatorio del portal.
--
-- Qué hace:
--   1. Añade profiles.first_portal_access_at: la primera vez que el usuario entra al portal.
--      El front la escribe (UPDATE) solo si está a null; una vez puesta no se toca.
--   2. profiles.onboarded_at pasa a significar «terminó el onboarding del portal» (/app/bienvenida).
--      No cambia su definición (ya es timestamptz null). Lo escribe el front al pulsar «Entrar al portal».
--   3. Pone a null onboarded_at en las 2 cuentas de PRUEBA que lo tenían de antes, para que
--      vean el nuevo onboarding.
--
-- Permisos:
--   profiles tiene grant ALL a nivel tabla para authenticated (y anon — pendiente de revocar en
--   20261119_auditoria_correctivos.sql). La política RLS es `id = auth.uid()` para ALL.
--   La columna nueva hereda esos permisos: authenticated puede SELECT y UPDATE en su propia fila.
--
-- Sobre la app móvil:
--   Ninguna función de BD (public, metodo, identidad) referencia onboarded_at.
--   La app móvil usa el esquema metodo.perfil para su propio estado; no lee profiles.onboarded_at.
--
-- Estado: APLICADO en producción el 2026-11-19 (aprobado por Álvaro).

begin;

-- 1. Columna nueva
alter table public.profiles
  add column if not exists first_portal_access_at timestamptz;

-- 2. Resetear onboarded_at en cuentas de prueba
update public.profiles
set onboarded_at = null
where id = '804685f7-e8f9-4ec6-831e-83431a59704b';  -- jose123@csodigital.tech

update public.profiles
set onboarded_at = null
where id = '2fda982d-da5a-489a-84b9-48a517e45c3e';  -- alvaro.test@virtuousleadership.com

commit;
