// Marco del panel con pestañas: cabecera, contenido y una «burbuja» de navegación fija abajo con
// tres opciones: Hoy · Camino · Formación. Móvil primero; en escritorio ocupa todo el ancho con rejillas.
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LocalLink as Link, useLocalPath } from '../i18n';
import { supabase } from '../account/supabase';
import { fetchFirstName } from '../account/account';
import { olvidarAcceso } from '../account/useAcceso';
import { olvidarCatalogo } from './useFormacion';
import logoUrl from '../assets/logo-1.png';
import { NAVY, GOLD, GOLD_SOFT, BEIGE, INK, MUTED, FONT_SERIF, FONT_SANS } from '../theme';
import { eyebrow, fechaLarga } from './estilos';
import { IconoHoy, IconoCamino, IconoFormacion } from './Iconos';

const PESTANAS = [
  { ruta: '/mi-panel', etiqueta: 'Hoy', Icono: IconoHoy },
  { ruta: '/mi-panel/camino', etiqueta: 'Camino', Icono: IconoCamino },
  { ruta: '/mi-panel/formacion', etiqueta: 'Formación', Icono: IconoFormacion },
];

export default function AppShell({ user, children }) {
  const lp = useLocalPath();
  const { pathname } = useLocation();
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    let vivo = true;
    fetchFirstName(user).then((n) => { if (vivo) setNombre(n); }).catch(() => {});
    return () => { vivo = false; };
  }, [user]);

  async function salir() {
    olvidarAcceso();
    olvidarCatalogo();
    // Solo este navegador: no cierra la sesión de la app móvil.
    await supabase.auth.signOut({ scope: 'local' });
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, fontFamily: FONT_SANS, WebkitFontSmoothing: 'antialiased', paddingBottom: 132 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap');
        .vl-app { --vl-pad: clamp(16px, 3.2vw, 56px); }
        .vl-app * { box-sizing: border-box; }
        .vl-app a:focus-visible, .vl-app button:focus-visible, .vl-app textarea:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 2px; }
        @keyframes vl-puntos { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
        @keyframes vl-entra { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .vl-entra { animation: vl-entra 320ms ease both; }
        .vl-cols { display: flex; flex-direction: column; gap: 18px; }
        @media (min-width: 960px) {
          .vl-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
          .vl-cols > .vl-ancho { grid-column: 1 / -1; }
        }
        @media (min-width: 1500px) { .vl-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (prefers-reduced-motion: reduce) { .vl-entra { animation: none; } }
      `}</style>
      <div className="vl-app">
        <header style={{ maxWidth: 1480, margin: '0 auto', padding: '18px var(--vl-pad) 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" aria-label="Virtuous Leadership" style={{ display: 'flex' }}>
            <img src={logoUrl} alt="" width="40" height="40" style={{ display: 'block', borderRadius: '50%' }} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={eyebrow}>{fechaLarga()}</div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 21, fontWeight: 700, color: NAVY, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nombre ? `Hola, ${nombre}` : 'Hola'}
            </div>
          </div>
          <button type="button" onClick={salir} style={{ background: 'none', border: 'none', color: MUTED, fontFamily: FONT_SANS, fontSize: 13, textDecoration: 'underline', cursor: 'pointer', padding: 6 }}>
            Salir
          </button>
        </header>

        <main style={{ maxWidth: 1480, margin: '0 auto', padding: '20px var(--vl-pad) 0' }} className="vl-entra" key={pathname}>
          {children}
        </main>

        <nav aria-label="Navegación principal" style={{
          position: 'fixed', left: 0, right: 0, bottom: 'max(16px, env(safe-area-inset-bottom))',
          display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50,
        }}>
          <div style={{
            pointerEvents: 'auto', display: 'flex', gap: 4, padding: 6, borderRadius: 999,
            background: 'rgba(27,42,74,0.97)', boxShadow: '0 14px 34px rgba(15,29,56,0.38)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          }}>
            {PESTANAS.map(({ ruta, etiqueta, Icono }) => {
              const activa = pathname === lp(ruta);
              return (
                <Link key={ruta} to={ruta} aria-current={activa ? 'page' : undefined} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 84,
                  padding: '9px 14px 8px', borderRadius: 999, textDecoration: 'none',
                  color: activa ? GOLD_SOFT : 'rgba(251,248,241,0.66)',
                  background: activa ? 'rgba(197,165,90,0.20)' : 'transparent',
                  fontFamily: FONT_SANS, fontSize: 11.5, fontWeight: activa ? 700 : 500, letterSpacing: '0.02em',
                  transition: 'background 200ms ease, color 200ms ease',
                }}>
                  <Icono />
                  {etiqueta}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'grid', placeItems: 'center', color: MUTED, fontFamily: FONT_SANS, fontSize: 15 }}>
      <span style={{ color: INK }}>{texto}</span>
    </div>
  );
}

