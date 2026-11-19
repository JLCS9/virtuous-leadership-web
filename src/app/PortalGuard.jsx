import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useT, useLocalPath } from '../i18n';
import SEO from '../components/SEO';
import { useSession } from '../account/useSession';
import { useAcceso } from '../account/useAcceso';
import { onboardingEnMemoria, onboardingHecho } from '../account/onboarding';
import AppShell, { Cargando } from './AppShell';

// ¿Ha terminado el onboarding del portal? undefined mientras se comprueba. Se vuelve a mirar en cada cambio
// de pantalla (de la memoria, sin red): al terminar la bienvenida se marca como hecho y, si no, al navegar
// a /app este guardia seguiría con el «no» del principio y le devolvería a la bienvenida en bucle.
function useOnboardingHecho(userId, pathname) {
  const [hecho, setHecho] = useState(undefined);
  useEffect(() => {
    if (!userId) return undefined;
    let vivo = true;
    onboardingHecho(userId).then((v) => { if (vivo) setHecho(v); });
    return () => { vivo = false; };
  }, [userId, pathname]);
  if (!userId) return undefined;
  // Lo que hay en memoria manda sobre el estado (que se actualiza un render después).
  return onboardingEnMemoria(userId) ?? hecho;
}

export default function PortalGuard() {
  const session = useSession();
  const { lang } = useT();
  const lp = useLocalPath();
  const { pathname } = useLocation();
  const acceso = useAcceso(Boolean(session) && lang === 'es');
  const onboarding = useOnboardingHecho(acceso ? session?.user?.id : null, pathname);

  if (session === undefined) return <Cargando />;
  if (!session) return <Navigate to={lp('/login')} replace />;
  if (lang !== 'es') return <Navigate to={lp('/login')} replace />;
  if (acceso === undefined) return <Cargando />;
  if (!acceso) return <Navigate to={lp('/tests/temperamento/gracias')} replace />;
  // Onboarding obligatorio: quien no lo ha terminado va a la bienvenida, entre por donde entre.
  const enBienvenida = pathname === lp('/app/bienvenida');
  if (onboarding === undefined && !enBienvenida) return <Cargando />;
  if (onboarding === false && !enBienvenida) return <Navigate to={lp('/app/bienvenida')} replace />;

  return (
    <>
      <SEO title="App | Virtuous Leadership" description="Tu espacio" path="/app" noindex={true} />
      <AppShell user={session.user} />
    </>
  );
}
