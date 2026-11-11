import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { NAVY, NAVY_DEEP, PAPER, FONT_BODY, GOLD_REF, GOLD_REF_LT, MAX_WIDTH } from '../theme';
import { useT, useLocalPath } from '../i18n';
import LangSwitcher from './LangSwitcher';
import { accountsEnabled } from '../account/supabase';
import { useSession } from '../account/useSession';
import logoUrl from '../assets/logo-1.png';

const C = {
  blueDeep: NAVY,
  blueNight: NAVY_DEEP,
  gold: GOLD_REF,
  goldLight: GOLD_REF_LT,
  cream: PAPER,
  white: '#ffffff',
};
const SANS = FONT_BODY;

function Brand() {
  const lp = useLocalPath();
  return (
    <Link to={lp('/')} aria-label="Virtuous Leadership"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
      <img src={logoUrl} alt="Virtuous Leadership" width="52" height="52"
           style={{ display: 'block', borderRadius: '50%' }} />
    </Link>
  );
}

export default function Header() {
  const { t } = useT();
  const lp = useLocalPath();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const session = useSession();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  const NAV = [
    { to: '/tests',                  label: t('nav.tests') },
    ...(accountsEnabled ? [{ to: session ? '/app' : '/login', label: session ? t('nav.my_panel') : t('nav.login') }] : []),
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: C.blueNight,
      borderBottom: `1px solid rgba(255,255,255,0.08)`,
      boxShadow: '0 1px 0 rgba(165,139,38,0.18)',
    }}>
      <div className="header-inner" style={{
        maxWidth: MAX_WIDTH, margin: '0 auto',
        padding: '14px 14px',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <Brand />

        <nav style={{ marginLeft: 'auto', display: 'none', alignItems: 'center', gap: 4 }}
             className="nav-desktop">
          {NAV.map((item, i) => (
            <NavLink
              key={i}
              to={lp(item.to)}
              end={item.exact}
              style={({ isActive }) => ({
                fontFamily: SANS, fontSize: 14,
                color: isActive ? C.gold : PAPER,
                fontWeight: isActive ? 600 : 500,
                padding: '10px 14px', textDecoration: 'none',
                borderBottom: `2px solid ${isActive ? C.gold : 'transparent'}`,
                transition: 'all 160ms ease',
              })}
              onMouseOver={e => { e.currentTarget.style.color = C.gold; }}
              onMouseOut={e => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                e.currentTarget.style.color = isActive ? C.gold : PAPER;
              }}
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('open-contact-modal'))}
            style={{
              marginLeft: 12, fontFamily: SANS, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: C.white, background: C.gold, padding: '10px 18px',
              border: `1px solid ${C.gold}`, borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = C.goldLight; e.currentTarget.style.borderColor = C.goldLight; }}
            onMouseOut={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.borderColor = C.gold; }}
          >
            {t('nav.contact')}
          </button>

          <div style={{ marginLeft: 10 }}>
            <LangSwitcher inverted />
          </div>
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }} className="nav-mobile-actions">
          <LangSwitcher inverted />
          <button
            aria-label="Open menu"
            onClick={() => setOpen(o => !o)}
            style={{
              background: 'transparent', border: 'none',
              padding: 8, cursor: 'pointer', color: PAPER,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open
                ? <><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div style={{ background: C.blueDeep, borderTop: `1px solid rgba(255,255,255,0.08)` }} className="nav-mobile-panel">
          {NAV.map((item, i) => (
            <NavLink
              key={i}
              to={lp(item.to)}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'block', padding: '14px 24px',
                fontFamily: SANS, fontSize: 16,
                color: isActive ? C.gold : PAPER, fontWeight: isActive ? 600 : 500,
                textDecoration: 'none', borderBottom: `1px solid rgba(255,255,255,0.06)`,
                background: isActive ? C.blueNight : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => { setOpen(false); window.dispatchEvent(new Event('open-contact-modal')); }}
            style={{
              display: 'block', width: '100%', padding: '16px 24px', fontFamily: SANS, fontSize: 16,
              color: C.white, background: C.gold, border: 'none', textAlign: 'center',
              fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {t('nav.contact')}
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .header-inner { padding-left: 0 !important; padding-right: 0 !important; }
          .nav-desktop { display: flex !important; }
          .nav-mobile-actions { display: none !important; }
          .nav-mobile-panel { display: none !important; }
        }
      `}</style>
    </header>
  );
}
