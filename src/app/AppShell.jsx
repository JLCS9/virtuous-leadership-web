import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LocalLink as Link, useLocalPath } from '../i18n';
import { supabase } from '../account/supabase';
import { fetchFirstName } from '../account/account';
import { olvidarAcceso } from '../account/useAcceso';
import { olvidarCatalogo } from './useFormacion';
import logoUrl from '../assets/logo-1.png';
import { NAVY, BEIGE, MUTED, FONT_SLAB, FONT_BODY, GOLD_REF } from '../theme';
import { eyebrow, fechaLarga } from './estilos';
import { IconoHoy, IconoCamino, IconoFormacion } from './Iconos';

const PESTANAS = [
  { ruta: '/app', etiqueta: 'Hoy', Icono: IconoHoy },
  { ruta: '/app/camino', etiqueta: 'Camino', Icono: IconoCamino },
  { ruta: '/app/formacion', etiqueta: 'Formación', Icono: IconoFormacion },
];

function indicePestana(pathname, lp) {
  return PESTANAS.findIndex(({ ruta }) => pathname === lp(ruta));
}

export default function AppShell({ user }) {
  const lp = useLocalPath();
  const { pathname } = useLocation();
  const [nombre, setNombre] = useState('');
  const prevIdx = useRef(indicePestana(pathname, lp));
  const idx = indicePestana(pathname, lp);
  const dir = idx >= 0 && prevIdx.current >= 0 ? (idx > prevIdx.current ? 'der' : idx < prevIdx.current ? 'izq' : '') : '';

  useEffect(() => { prevIdx.current = idx; }, [idx]);

  useEffect(() => {
    let vivo = true;
    fetchFirstName(user).then((n) => { if (vivo) setNombre(n); }).catch(() => {});
    return () => { vivo = false; };
  }, [user]);

  async function salir() {
    olvidarAcceso();
    olvidarCatalogo();
    await supabase.auth.signOut({ scope: 'local' });
  }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, fontFamily: FONT_BODY, WebkitFontSmoothing: 'antialiased', paddingBottom: 132 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:ital,wght@0,400;0,600;1,400&display=swap');
        .vl-app { --vl-pad: clamp(18px, 4vw, 56px); --vl-max: 1600px; }
        .vl-app * { box-sizing: border-box; }
        .vl-app a:focus-visible, .vl-app button:focus-visible, .vl-app textarea:focus-visible { outline: 2px solid ${GOLD_REF}; outline-offset: 2px; }

        @keyframes vl-puntos { 0%, 80%, 100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }

        /* Transición de página: absorción + dirección */
        @keyframes vl-entra {
          from { opacity: 0; transform: translateY(8px) scale(0.985); filter: blur(4px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        @keyframes vl-entra-der {
          from { opacity: 0; transform: translateX(40px) scale(0.98); filter: blur(3px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        @keyframes vl-entra-izq {
          from { opacity: 0; transform: translateX(-40px) scale(0.98); filter: blur(3px); }
          to   { opacity: 1; transform: none; filter: blur(0); }
        }
        .vl-entra     { animation: vl-entra     380ms cubic-bezier(.22,.61,.36,1) both; }
        .vl-entra-der { animation: vl-entra-der 380ms cubic-bezier(.22,.61,.36,1) both; }
        .vl-entra-izq { animation: vl-entra-izq 380ms cubic-bezier(.22,.61,.36,1) both; }

        /* Grid responsive */
        .vl-cols { display: flex; flex-direction: column; gap: 18px; }
        @media (min-width: 768px) {
          .vl-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
          .vl-cols > .vl-ancho { grid-column: 1 / -1; }
        }
        @media (min-width: 1500px) { .vl-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (min-width: 2000px) { .vl-cols-3 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

        /* Desktop: cabecera más espaciosa */
        @media (min-width: 960px) {
          .vl-header { padding-top: 40px !important; padding-bottom: 12px !important; }
          .vl-main   { padding-top: 32px !important; }
        }
        @media (min-width: 1920px) {
          .vl-app { --vl-max: 1700px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vl-entra, .vl-entra-der, .vl-entra-izq { animation: none; }
        }
      `}</style>
      <div className="vl-app">
        <header className="vl-header" style={{ maxWidth: 'var(--vl-max)', margin: '0 auto', padding: '32px var(--vl-pad) 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link to="/" aria-label="Virtuous Leadership" style={{ display: 'flex' }}>
            <img src={logoUrl} alt="" width="40" height="40" style={{ display: 'block', borderRadius: '50%' }} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={eyebrow}>{fechaLarga()}</div>
            <div style={{ fontFamily: FONT_SLAB, fontSize: 21, fontWeight: 700, color: NAVY, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nombre ? `Hola, ${nombre}` : 'Hola'}
            </div>
          </div>
          <button type="button" onClick={salir} style={{ background: 'none', border: 'none', color: MUTED, fontFamily: FONT_BODY, fontSize: 13, textDecoration: 'underline', cursor: 'pointer', padding: 6 }}>
            Salir
          </button>
        </header>

        <main className={`vl-main ${dir ? `vl-entra-${dir}` : 'vl-entra'}`} key={pathname}
              style={{ maxWidth: 'var(--vl-max)', margin: '0 auto', padding: '20px var(--vl-pad) 0' }}>
          <Outlet context={{ user }} />
        </main>

        <NavBurbuja pathname={pathname} lp={lp} />
      </div>
    </div>
  );
}

function NavBurbuja({ pathname, lp }) {
  const contenedorRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const indiceActivo = indicePestana(pathname, lp);

  useEffect(() => {
    const nav = contenedorRef.current;
    if (!nav || indiceActivo < 0) return;
    const enlaces = nav.querySelectorAll('[data-tab]');
    const el = enlaces[indiceActivo];
    if (!el) return;
    setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [indiceActivo]);

  return (
    <nav aria-label="Navegación principal" style={{
      position: 'fixed', left: 0, right: 0, bottom: 'max(16px, env(safe-area-inset-bottom))',
      display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50,
    }}>
      <div ref={contenedorRef} style={{
        pointerEvents: 'auto', display: 'flex', gap: 4, padding: 6, borderRadius: 999,
        background: 'rgba(255,255,255,0.82)', boxShadow: '0 4px 24px rgba(15,29,56,0.18)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
      }}>
        {indiceActivo >= 0 && pill.width > 0 && (
          <span aria-hidden style={{
            position: 'absolute', top: 6, height: 'calc(100% - 12px)',
            left: pill.left, width: pill.width,
            borderRadius: 999, background: 'rgba(165,139,38,0.14)',
            transition: 'left 320ms cubic-bezier(.4,0,.2,1), width 320ms cubic-bezier(.4,0,.2,1)',
            pointerEvents: 'none',
          }} />
        )}
        {PESTANAS.map(({ ruta, etiqueta, Icono }) => {
          const activa = pathname === lp(ruta);
          return (
            <Link key={ruta} to={ruta} data-tab aria-current={activa ? 'page' : undefined} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 84,
              padding: '9px 14px 8px', borderRadius: 999, textDecoration: 'none',
              color: activa ? NAVY : MUTED, background: 'transparent',
              fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: activa ? 700 : 500, letterSpacing: '0.02em',
              transition: 'color 200ms ease', position: 'relative', zIndex: 1,
            }}>
              <Icono />
              {etiqueta}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'grid', placeItems: 'center', color: MUTED, fontFamily: FONT_BODY, fontSize: 15 }}>
      <span style={{ color: NAVY }}>{texto}</span>
    </div>
  );
}
