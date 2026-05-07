import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BEIGE, INK, FONT_SANS } from '../theme';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  const { pathname, hash } = useLocation();

  // Si hay #anchor → scroll al elemento; si no → scroll-to-top.
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      // Esperamos a que la nueva ruta haya pintado el contenido.
      const t = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0 });
      }, 80);
      return () => clearTimeout(t);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, hash]);

  return (
    <div style={{
      minHeight: '100vh', background: BEIGE, color: INK, fontFamily: FONT_SANS,
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        html, body, #root { margin: 0; padding: 0; }
        * { box-sizing: border-box; }
        a { color: inherit; }
        button:focus-visible, a:focus-visible { outline: 2px solid #C5A55A; outline-offset: 2px; }
      `}</style>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
