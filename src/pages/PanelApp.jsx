// Panel con pestañas (Hoy · Camino · Formación) para cuentas con la suscripción activa. Solo ES.
// Si no hay sesión o no hay suscripción, se vuelve a «Mi panel» (que tiene el acceso y, sin
// suscripción, el panel de siempre). El servidor repite la comprobación en cada llamada.
import { Navigate } from 'react-router-dom';
import { useLocalPath, useT } from '../i18n';
import SEO from '../components/SEO';
import { useSession } from '../account/useSession';
import { useAcceso } from '../account/useAcceso';
import AppShell, { Cargando } from '../app/AppShell';
import Hoy from '../app/Hoy';
import Camino from '../app/Camino';
import Formacion from '../app/Formacion';

function Pestana({ nombre, ruta, children }) {
  const session = useSession();
  const { lang } = useT();
  const lp = useLocalPath();
  const acceso = useAcceso(Boolean(session) && lang === 'es');

  if (session === undefined) return <Cargando />;
  if (!session || lang !== 'es') return <Navigate to={lp('/mi-panel')} replace />;
  if (acceso === undefined) return <Cargando />;
  if (!acceso) return <Navigate to={lp('/mi-panel')} replace />;

  return (
    <>
      <SEO title={`${nombre} | Virtuous Leadership`} description={nombre} path={ruta} noindex={true} />
      <AppShell user={session.user}>{children(session.user)}</AppShell>
    </>
  );
}

export const PanelHoy = () => <Pestana nombre="Hoy" ruta="/mi-panel">{() => <Hoy />}</Pestana>;
export const PanelCamino = () => <Pestana nombre="Camino" ruta="/mi-panel/camino">{(u) => <Camino user={u} />}</Pestana>;
export const PanelFormacion = () => <Pestana nombre="Formación" ruta="/mi-panel/formacion">{(u) => <Formacion user={u} />}</Pestana>;
