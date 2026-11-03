import { Navigate } from 'react-router-dom';
import { useT, useLocalPath } from '../i18n';
import SEO from '../components/SEO';
import { useSession } from '../account/useSession';
import { useAcceso } from '../account/useAcceso';
import AppShell, { Cargando } from './AppShell';

export default function PortalGuard() {
  const session = useSession();
  const { lang } = useT();
  const lp = useLocalPath();
  const acceso = useAcceso(Boolean(session) && lang === 'es');

  if (session === undefined) return <Cargando />;
  if (!session) return <Navigate to={lp('/login')} replace />;
  if (lang !== 'es') return <Navigate to={lp('/login')} replace />;
  if (acceso === undefined) return <Cargando />;
  if (!acceso) return <Navigate to={lp('/tests/temperamento/gracias')} replace />;

  return (
    <>
      <SEO title="App | Virtuous Leadership" description="Tu espacio" path="/app" noindex={true} />
      <AppShell user={session.user} />
    </>
  );
}
