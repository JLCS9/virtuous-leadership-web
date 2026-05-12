// Dispara un page_view de Google Analytics cada vez que cambia la ruta
// dentro de la SPA. Se debe montar dentro de <BrowserRouter> (como hijo
// del provider) para que useLocation funcione. Lo hacemos antes de <Routes>
// para que el efecto se ejecute aunque la ruta lance un redirect.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics';

export default function PageTracker() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    // Pequeño delay para que react-helmet haya actualizado document.title.
    const id = setTimeout(() => {
      trackPageview(pathname + search);
    }, 0);
    return () => clearTimeout(id);
  }, [pathname, search]);
  return null;
}
