// Pushea un evento `page_view` al dataLayer en cada cambio de ruta dentro
// de la SPA. GTM lo recoge y dispara la tag GA4 desde el contenedor
// (G-HM6K1685L2). Se debe montar dentro de <BrowserRouter> (como hijo del
// provider) para que useLocation funcione. Lo hacemos antes de <Routes>
// para que el efecto se ejecute aunque la ruta lance un redirect.
//
// page_language se deriva del primer segmento de la URL ('/es/...' → 'es').
// Si la URL NO tiene prefijo de idioma valido (p.ej. '/' justo antes de que
// LegacyRedirect la reemplace por '/{lang}'), NO se pushea: eso evita el
// page_view fantasma con page_path '/' que duplicaba la vista en GA4.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { langFromPath } from '../i18n';

export default function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    // Solo medimos rutas con prefijo de idioma valido (/es/…, /en/…, /fr/…,
    // /ru/…). Las rutas sin idioma (p.ej. '/') son transitorias: LegacyRedirect
    // las reemplaza al instante por '/{lang}'. Si las midieramos, cada entrada
    // por el dominio pelado generaria un page_view fantasma (page_path '/').
    const lang = langFromPath(location.pathname);
    if (!lang) return;
    // Pequeño delay para que react-helmet haya actualizado document.title
    // antes de leerlo para el push.
    const id = setTimeout(() => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'page_view',
        page_path: location.pathname,
        page_title: document.title,
        page_language: lang,
      });
    }, 0);
    return () => clearTimeout(id);
  }, [location]);
  return null;
}
