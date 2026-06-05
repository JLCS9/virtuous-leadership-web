// Pushea un evento `page_view` al dataLayer en cada cambio de ruta dentro
// de la SPA. GTM lo recoge y dispara la tag GA4 desde el contenedor
// (G-HM6K1685L2). Se debe montar dentro de <BrowserRouter> (como hijo del
// provider) para que useLocation funcione. Lo hacemos antes de <Routes>
// para que el efecto se ejecute aunque la ruta lance un redirect.
//
// page_language se deriva del primer segmento de la URL ('/es/...' → 'es').
// Si la URL no tiene prefijo de idioma, asumimos 'es' como default.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    // Pequeño delay para que react-helmet haya actualizado document.title
    // antes de leerlo para el push.
    const id = setTimeout(() => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'page_view',
        page_path: location.pathname,
        page_title: document.title,
        page_language: location.pathname.split('/')[1] || 'es',
      });
    }, 0);
    return () => clearTimeout(id);
  }, [location]);
  return null;
}
