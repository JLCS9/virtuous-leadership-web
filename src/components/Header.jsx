import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { NAVY, NAVY_SOFT, NAVY_DEEP, GOLD, GOLD_SOFT, GOLD_DEEP, PAPER, BEIGE, LINE, MUTED, FONT_SERIF, FONT_SANS, MAX_WIDTH } from '../theme';
import { useT, useLocalPath } from '../i18n';
import LangSwitcher from './LangSwitcher';
import logoUrl from '../assets/logo-1.png';

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
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); setSubmenuOpen(false); }, [location.pathname]);

  const NAV = [
    {
      label: t('nav.programs'),
      children: [
        { to: '/colegios',           label: t('nav.schools') },
        { to: '/universidades',      label: t('nav.universities') },
        { to: '/educacion-superior', label: t('nav.higher_ed') },
      ],
    },
    { to: '/acreditacion/colegios', label: t('nav.accreditation') },
    { to: '/tests',                  label: t('nav.tests') },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: NAVY,
      borderBottom: `1px solid ${NAVY_SOFT}`,
      boxShadow: '0 1px 0 rgba(197,165,90,0.18)',
    }}>
      <div style={{
        maxWidth: MAX_WIDTH, margin: '0 auto',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <Brand />

        <nav style={{ marginLeft: 'auto', display: 'none', alignItems: 'center', gap: 4 }}
             className="nav-desktop">
          {NAV.map((item, i) => item.children ? (
            <Submenu key={i} item={item} />
          ) : (
            <NavLink
              key={i}
              to={lp(item.to)}
              end={item.exact}
              style={({ isActive }) => ({
                fontFamily: FONT_SANS, fontSize: 14,
                color: isActive ? GOLD : PAPER,
                fontWeight: isActive ? 600 : 500,
                padding: '10px 14px', textDecoration: 'none',
                borderBottom: `2px solid ${isActive ? GOLD : 'transparent'}`,
                transition: 'all 160ms ease',
              })}
              onMouseOver={e => { e.currentTarget.style.color = GOLD; }}
              onMouseOut={e => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                e.currentTarget.style.color = isActive ? GOLD : PAPER;
              }}
            >
              {item.label}
            </NavLink>
          ))}

          <Link
            to={lp('/contacto')}
            style={{
              marginLeft: 12, fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: NAVY, background: GOLD, padding: '10px 18px',
              border: `1px solid ${GOLD}`, borderRadius: 2,
              textDecoration: 'none',
              transition: 'all 160ms ease',
            }}
            onMouseOver={e => { e.currentTarget.style.background = GOLD_SOFT; e.currentTarget.style.borderColor = GOLD_SOFT; }}
            onMouseOut={e => { e.currentTarget.style.background = GOLD; e.currentTarget.style.borderColor = GOLD; }}
          >
            {t('nav.contact')}
          </Link>

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
        <div style={{ background: NAVY_DEEP, borderTop: `1px solid ${NAVY_SOFT}` }} className="nav-mobile-panel">
          {NAV.map((item, i) => item.children ? (
            <div key={i}>
              <button
                onClick={() => setSubmenuOpen(s => !s)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '14px 24px', border: 'none', background: 'transparent',
                  fontFamily: FONT_SANS, fontSize: 16, color: PAPER, fontWeight: 600,
                  cursor: 'pointer', borderBottom: `1px solid ${NAVY_SOFT}`,
                }}
              >
                {item.label} {submenuOpen ? '−' : '+'}
              </button>
              {submenuOpen && item.children.map((c, j) => (
                <NavLink
                  key={j}
                  to={lp(c.to)}
                  style={({ isActive }) => ({
                    display: 'block', padding: '12px 36px',
                    fontFamily: FONT_SANS, fontSize: 14,
                    color: isActive ? GOLD : '#D9DEE8', fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none', borderBottom: `1px solid ${NAVY_SOFT}`,
                    background: isActive ? NAVY : 'transparent',
                  })}
                >
                  {c.label}
                </NavLink>
              ))}
            </div>
          ) : (
            <NavLink
              key={i}
              to={lp(item.to)}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'block', padding: '14px 24px',
                fontFamily: FONT_SANS, fontSize: 16,
                color: isActive ? GOLD : PAPER, fontWeight: isActive ? 600 : 500,
                textDecoration: 'none', borderBottom: `1px solid ${NAVY_SOFT}`,
                background: isActive ? NAVY : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to={lp('/contacto')}
            style={{
              display: 'block', padding: '16px 24px', fontFamily: FONT_SANS, fontSize: 16,
              color: NAVY, background: GOLD, textDecoration: 'none', textAlign: 'center',
              fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            {t('nav.contact')}
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-actions { display: none !important; }
          .nav-mobile-panel { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function Submenu({ item }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const lp = useLocalPath();
  const someActive = item.children.some(c => {
    const full = lp(c.to);
    return location.pathname.startsWith(full) && c.to !== '/';
  });

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          fontFamily: FONT_SANS, fontSize: 14,
          color: someActive ? GOLD : PAPER,
          fontWeight: someActive ? 600 : 500,
          padding: '10px 14px', background: 'transparent', border: 'none',
          borderBottom: `2px solid ${someActive ? GOLD : 'transparent'}`,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          transition: 'color 160ms ease',
        }}
        onMouseOver={e => { e.currentTarget.style.color = GOLD; }}
        onMouseOut={e => { e.currentTarget.style.color = someActive ? GOLD : PAPER; }}
      >
        {item.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2 3 L5 7 L8 3 Z"/></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0,
          background: PAPER, border: `1px solid ${LINE}`,
          minWidth: 260, padding: 6, marginTop: 0,
          boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
          borderRadius: 2,
        }}>
          {item.children.map((c, j) => (
            <NavLink
              key={j}
              to={lp(c.to)}
              style={({ isActive }) => ({
                display: 'block', padding: '10px 14px',
                fontFamily: FONT_SANS, fontSize: 14,
                color: isActive ? NAVY : MUTED, fontWeight: isActive ? 600 : 500,
                textDecoration: 'none', borderRadius: 2,
                background: isActive ? BEIGE : 'transparent',
                borderLeft: `2px solid ${isActive ? GOLD : 'transparent'}`,
              })}
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
