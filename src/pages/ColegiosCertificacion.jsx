import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useT } from '../i18n';
import SEO from '../components/SEO';
import ColegiosPrograma from './ColegiosPrograma';

import heroImg from '../assets/colegios/escultura-hero.jpg';
import ctaImg from '../assets/colegios/escultura-cta.jpg';
import comunidadImg from '../assets/colegios/comunidad-educativa.jpg';
import selloImg from '../assets/colegios/sello-institucion-certificada.png';
import ruedaImg from '../assets/colegios/rueda-temperamentos.webp';

const CERT_LANGS = new Set(['es']);

const C = {
  blueDeep: '#1a304f',
  blueNight: '#0f1e33',
  blueMid: '#2d5285',
  gold: '#a58b26',
  goldLight: '#c9ab42',
  goldDark: '#786622',
  bruma: '#e0e5ee',
  piedra: '#b8c0cc',
  plomo: '#6e7a8e',
  pizarra: '#2e3744',
  cream: '#faf7ee',
  page: '#f5f6f9',
  white: '#ffffff',
};
const SLAB = "'Roboto Slab', Georgia, serif";
const SANS = "'Roboto', system-ui, sans-serif";
const EASE = 'cubic-bezier(.22,.61,.36,1)';
const PAD_X = 'clamp(20px,5.4vw,48px)';
const SECTION_Y = 'clamp(72px,10vw,136px)';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:ital,wght@0,400;0,600;1,400&display=swap');
.vlc{font-family:${SANS};color:${C.pizarra};background:${C.page};overflow-x:clip;-webkit-font-smoothing:antialiased}
.vlc *:focus-visible{outline:2px solid ${C.goldLight};outline-offset:3px}
.vlc-cta{white-space:nowrap;flex:none;display:inline-flex;align-items:center;justify-content:center;gap:10px;text-align:center;background:${C.gold};color:${C.blueNight};font-family:${SANS};font-weight:600;font-size:16px;line-height:1.25;padding:16px 26px;text-decoration:none;border:0;cursor:pointer;transition:background 200ms ${EASE}}
.vlc-cta:hover{background:${C.goldLight};color:${C.blueNight}}
.vlc-ghost{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:transparent;color:#fff;border:1px solid rgba(250,247,238,.55);font-family:${SANS};font-weight:600;font-size:16px;line-height:1.25;padding:15px 24px;cursor:pointer;text-decoration:none;transition:background 200ms ${EASE},color 200ms ${EASE}}
.vlc-ghost:hover{background:#fff;color:${C.blueDeep}}
.vlc-close{all:unset;position:absolute;top:12px;right:12px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:${C.pizarra}}
.vlc-close:hover{color:${C.blueMid}}
.vlc-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
.vlc-field label{font-size:13px;font-weight:600;color:${C.blueDeep}}
.vlc-field input,.vlc-field select{font:inherit;font-size:16px;color:${C.pizarra};background:#fff;border:1px solid ${C.piedra};border-radius:0;padding:12px 14px;min-height:48px;box-sizing:border-box;width:100%;transition:border-color 200ms ${EASE}}
.vlc-field input:focus,.vlc-field select:focus{outline:none;border-color:${C.blueDeep};box-shadow:0 0 0 2px rgba(45,82,133,.25)}
.vlc-field select{appearance:none;-webkit-appearance:none;background-image:linear-gradient(45deg,transparent 50%,${C.blueDeep} 50%),linear-gradient(135deg,${C.blueDeep} 50%,transparent 50%);background-position:calc(100% - 20px) 50%,calc(100% - 15px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:40px}
.vlc-check{display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.5;cursor:pointer}
.vlc-check input{margin-top:3px;accent-color:${C.gold}}
@media(prefers-reduced-motion:reduce){.vlc [data-reveal]{opacity:1!important;transform:none!important}.vlc .vlc-tl-fill{transform:none!important}.vlc .vlc-tl-n{border-color:${C.gold}!important;color:${C.goldDark}!important;background:#fff!important}}
`;

function useWidth() {
  const [w, setW] = useState(() => (typeof window === 'undefined' ? 1200 : window.innerWidth));
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

function countUp(node) {
  const target = Number(node.dataset.count);
  const prefix = node.dataset.prefix || '';
  const suffix = node.dataset.suffix || '';
  const fmt = (v) => prefix + Math.round(v).toLocaleString('es-ES') + suffix;
  const dur = 1600;
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    node.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step); else node.textContent = fmt(target);
  };
  requestAnimationFrame(step);
}

function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      root.querySelectorAll('.vlc-tl').forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.style.opacity = '1';
        el.style.transform = 'none';
        if (el.classList.contains('vlc-tl')) setTimeout(() => el.classList.add('is-in'), 300);
        el.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    root.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = `opacity 800ms ${EASE}, transform 800ms ${EASE}`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [rootRef]);
}

const ICONS = {
  video: <><path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 10.5" /><rect x="2" y="6" width="14" height="12" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  chat: <><path d="M21 15V3H3v18l4-4h12a2 2 0 0 0 2-2z" /><path d="M8 9h8" /><path d="M8 13h5" /></>,
  award: <><circle cx="12" cy="8" r="6" /><path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  report: <><path d="M14 2H4v20h16V8z" /><path d="M14 2v6h6" /><path d="M8 18v-3M12 18v-6M16 18v-4" /></>,
  chart: <><path d="M3 3v18h18" /><path d="m7 15 4-4 3 3 6-6" /></>,
  trainers: <><path d="M3 10 12 4l9 6-9 6z" /><path d="M7 12.5V17c3 2 7 2 10 0v-4.5" /></>,
  home: <><path d="M3 21h18M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></>,
  monitor: <><rect x="2" y="4" width="20" height="13" /><path d="M8 21h8M12 17v4" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></>,
  check: <><rect x="3" y="3" width="18" height="18" /><path d="m7.5 12.5 3 3 6-7" /></>,
  close: <><path d="M5 5l14 14M19 5L5 19" /></>,
};

function Icon({ name, size = 24, color = C.blueDeep, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.25"
         strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" style={{ flex: 'none', ...style }}>
      {ICONS[name]}
    </svg>
  );
}

function Eyebrow({ children, dark }) {
  return (
    <span style={{
      fontFamily: SANS, fontWeight: 600, fontSize: 13, letterSpacing: '0.16em',
      textTransform: 'uppercase', lineHeight: 1.2, display: 'inline-block',
      color: dark ? C.goldLight : C.goldDark,
    }}>{children}</span>
  );
}

function H2({ children, dark, size = 48, style }) {
  const min = Math.round(size * 0.58);
  const fs = `clamp(${min}px, 3.9vw, ${size}px)`;
  return (
    <h2 style={{
      margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: fs, lineHeight: 1.1,
      letterSpacing: '-0.01em', color: dark ? '#fff' : C.blueDeep, textWrap: 'balance', ...style,
    }}>{children}</h2>
  );
}

function Container({ children, style, max = 1200 }) {
  return (
    <div style={{ maxWidth: max, margin: '0 auto', padding: `0 ${PAD_X}`, boxSizing: 'border-box', ...style }}>
      {children}
    </div>
  );
}

function Stack({ children, gap = 24, style, reveal = true, className }) {
  return (
    <div data-reveal={reveal ? '' : undefined} className={className}
         style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {children}
    </div>
  );
}

function Sup({ text }) {
  const idx = text.indexOf('®');
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<sup style={{ fontSize: '0.4em', verticalAlign: 'super', lineHeight: 1 }}>®</sup>{text.slice(idx + 1)}</>;
}

function FormField({ label, id, type = 'text', required = true, autoComplete, children }) {
  return (
    <div className="vlc-field">
      <label htmlFor={id}>{label}</label>
      {children || <input id={id} name={id} type={type} autoComplete={autoComplete} required={required} />}
    </div>
  );
}

function SelectField({ label, id, options, required = true }) {
  return (
    <div className="vlc-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} required={required} defaultValue="">
        <option value="" disabled hidden></option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ModalShell({ onClose, closeRef, children }) {
  return (
    <div role="dialog" aria-modal="true"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
         style={{
           position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,30,51,.8)',
           display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
         }}>
      <div style={{
        position: 'relative', background: '#fff', width: '100%', maxWidth: 540,
        maxHeight: 'calc(100svh - 40px)', overflow: 'auto',
        padding: 'clamp(28px,5vw,48px)', boxSizing: 'border-box',
        boxShadow: '0 18px 50px rgba(15,30,51,.22)', borderTop: `2px solid ${C.gold}`,
      }}>
        <button type="button" ref={closeRef} className="vlc-close" aria-label="Cerrar" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ColegiosPage() {
  const { lang } = useT();
  return CERT_LANGS.has(lang) ? <ColegiosCertificacion /> : <ColegiosPrograma />;
}

function ColegiosCertificacion() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const k = (key) => t(`colegios_cert.${key}`);
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const w = useWidth();
  const [modal, setModal] = useState(null);
  const [barOpen, setBarOpen] = useState(true);
  useReveal(rootRef);

  useEffect(() => {
    try { if (localStorage.getItem('vl-ce-topbar-closed') === '1') setBarOpen(false); } catch (e) {}
  }, []);

  useEffect(() => {
    const which = location.state?.openModal;
    if (which === 'conversation' || which === 'details') {
      setModal(which === 'details' ? 'dossier' : which);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const closeBar = () => {
    setBarOpen(false);
    try { localStorage.setItem('vl-ce-topbar-closed', '1'); } catch (e) {}
  };

  const openModal = (which) => setModal(which);
  const closeModal = () => setModal(null);

  useEffect(() => {
    if (!modal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = setTimeout(() => closeRef.current && closeRef.current.focus(), 30);
    const onKey = (e) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [modal]);

  const isMobile = w < 760;
  const tablet = w >= 760;
  const wide = w >= 1000;

  const handleViabilidad = async (e) => {
    e.preventDefault();
    const f = e.target;
    const data = {
      nombre: f.querySelector('#ce-nombre')?.value || '',
      cargo: f.querySelector('#ce-cargo')?.value || '',
      institucion: f.querySelector('#ce-inst')?.value || '',
      localidad: f.querySelector('#ce-loc')?.value || '',
      email: f.querySelector('#ce-email')?.value || '',
      telefono: f.querySelector('#ce-tel')?.value || '',
      claustro: f.querySelector('#ce-claustro')?.value || '',
    };
    const url = import.meta.env.VITE_SUBMIT_COLEGIOS_URL;
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error('[colegios] submit error:', err);
      }
    }
    navigate(`/${lang}/colegios/gracias/conversacion`);
  };

  return (
    <div ref={rootRef} className="vlc">
      <SEO title={k('seo_title')} description={k('seo_description')} />
      <style>{CSS}</style>

      {barOpen && (
        <div style={{
          background: C.blueNight, borderBottom: '1px solid rgba(201,171,66,.35)',
          color: C.cream, fontSize: 13, lineHeight: 1.45,
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto', padding: '9px 52px 9px 20px', boxSizing: 'border-box',
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, textAlign: 'center', flexWrap: 'wrap',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.goldLight} strokeWidth="1.5" strokeLinecap="square" aria-hidden="true" style={{ flex: 'none' }}>
              <rect x="3" y="5" width="18" height="16" /><path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
            <span>{k('bar_text')}</span>
            <a href="#solicitud" style={{ color: C.goldLight, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>{k('bar_link')}</a>
            <button type="button" onClick={closeBar} aria-label={k('bar_close')} style={{
              all: 'unset', cursor: 'pointer', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.cream,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <section style={{
        position: 'relative', background: C.blueNight, color: '#fff', overflow: 'hidden',
      }}>
        <Container style={{ paddingTop: 'clamp(80px,10vw,140px)', paddingBottom: 'clamp(72px,9vw,120px)' }}>
          <div style={{
            display: 'grid', gap: wide ? 'clamp(48px,5vw,80px)' : 48, alignItems: 'center',
            gridTemplateColumns: wide ? 'minmax(0,3fr) minmax(0,2fr)' : '1fr',
          }}>
            <Stack gap={26}>
              <span style={{
                display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 10,
                border: '1px solid rgba(201,171,66,.6)', padding: '8px 14px',
                fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldLight,
              }}>{k('hero_badge')}</span>
              <h1 style={{
                margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(38px,5.4vw,68px)',
                lineHeight: 1.04, letterSpacing: '-0.01em', color: '#fff', textWrap: 'balance',
              }}><Sup text={k('hero_title')} /></h1>
              <p style={{
                margin: 0, fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(19px,1.9vw,24px)',
                lineHeight: 1.4, color: '#fff', borderLeft: `2px solid ${C.goldLight}`,
                paddingLeft: 'clamp(18px,2.4vw,28px)', maxWidth: '34ch',
              }}>{k('hero_subtitle')}</p>
              <p style={{
                margin: 0, fontSize: 'clamp(16px,1.3vw,18px)', lineHeight: 1.7, color: C.cream, maxWidth: '62ch',
              }}>{k('hero_text')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                <a href="#solicitud" className="vlc-cta" data-gtm="viabilidad-scroll">
                  {k('cta_viabilidad')}
                </a>
                <button type="button" className="vlc-ghost" onClick={() => openModal('dossier')} data-gtm="dossier-open">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16" /></svg>
                  {k('cta_dossier')}
                </button>
              </div>
              <ul style={{
                display: 'grid', gridTemplateColumns: tablet ? 'repeat(4,minmax(0,1fr))' : 'repeat(2,minmax(0,1fr))',
                gap: '20px 0', margin: 0, padding: '28px 0 0', listStyle: 'none',
                borderTop: '1px solid rgba(250,247,238,.16)',
              }}>
                {k('trust').map((s, i) => (
                  <li key={i} style={{
                    padding: '0 18px',
                    borderLeft: (tablet ? i > 0 : i % 2 !== 0) ? '1px solid rgba(250,247,238,.16)' : 'none',
                    paddingLeft: (tablet ? i > 0 : i % 2 !== 0) ? 18 : 0,
                    fontSize: 14, lineHeight: 1.45, color: C.cream,
                  }}>
                    {s.n ? (
                      <strong data-count={s.n} data-prefix={s.prefix || ''} style={{
                        display: 'block', fontFamily: SLAB, fontWeight: 700, fontSize: 22,
                        color: C.goldLight, marginBottom: 4, fontVariantNumeric: 'tabular-nums',
                      }}>{(s.prefix || '') + Number(s.n).toLocaleString('es-ES')}</strong>
                    ) : (
                      <strong style={{
                        display: 'block', fontFamily: SLAB, fontWeight: 700, fontSize: 22,
                        color: C.goldLight, marginBottom: 4,
                      }}>{s.text}</strong>
                    )}
                    {s.n ? s.text : s.sub}
                  </li>
                ))}
              </ul>
            </Stack>
            <div data-reveal="" style={{ position: 'relative', margin: '0 0 40px' }}>
              <div style={{
                position: 'relative', aspectRatio: '4/5', overflow: 'hidden', background: C.blueDeep,
              }}>
                <img src={comunidadImg} alt={k('hero_img_alt')} style={{
                  display: 'block', width: '100%', height: '100%', objectFit: 'cover',
                  objectPosition: '45% 40%', filter: 'saturate(.55) contrast(1.04)',
                }} />
                <div aria-hidden="true" style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: 'linear-gradient(180deg,rgba(26,48,79,.15) 0%,rgba(15,30,51,.55) 100%),rgba(26,48,79,.2)',
                  mixBlendMode: 'multiply',
                }} />
              </div>
              <div style={{
                position: 'absolute', left: wide ? -40 : -16, right: wide ? 32 : 24, bottom: -40,
                background: '#fff', color: C.pizarra, borderTop: `2px solid ${C.gold}`,
                padding: '20px 22px', display: 'grid', gridTemplateColumns: '56px minmax(0,1fr)',
                gap: 16, alignItems: 'center', boxShadow: '0 18px 50px rgba(15,30,51,.22)',
              }}>
                <img src={selloImg} alt="" aria-hidden="true" style={{ display: 'block', width: 56, height: 56, objectFit: 'contain' }} />
                <div>
                  <b style={{ display: 'block', fontFamily: SLAB, fontWeight: 700, fontSize: 16, lineHeight: 1.25, color: C.blueDeep, marginBottom: 4 }}>
                    {k('hero_sello_title')}
                  </b>
                  <span style={{ fontSize: 14, lineHeight: 1.5 }}>{k('hero_sello_text')}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container>
          <div data-reveal="" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 20, maxWidth: 860, margin: '0 auto' }}>
            <Eyebrow>{k('proof_eyebrow')}</Eyebrow>
            <H2>{k('proof_title')}</H2>
          </div>
          <div data-reveal="" style={{
            margin: 'clamp(40px,5vw,56px) 0 clamp(28px,3vw,36px)',
            background: C.blueDeep, color: C.cream, padding: 'clamp(22px,3vw,32px) clamp(24px,4vw,48px)',
            display: 'flex', alignItems: 'center', gap: 20, borderLeft: `2px solid ${C.goldLight}`,
          }}>
            <Icon name="globe" size={32} color={C.goldLight} />
            <p style={{ margin: 0, fontFamily: SLAB, fontSize: 'clamp(17px,1.7vw,21px)', lineHeight: 1.5 }}>{k('proof_band')}</p>
          </div>
          <div data-reveal="" style={{
            display: 'grid', gap: 24,
            gridTemplateColumns: w >= 900 ? 'repeat(2,minmax(0,1fr))' : '1fr',
          }}>
            {k('proof_cases').map((c) => (
              <article key={c.name} style={{
                background: '#fff', border: `1px solid ${C.bruma}`, borderTop: `2px solid ${C.gold}`,
                padding: 'clamp(28px,3.4vw,44px)', display: 'flex', flexDirection: 'column', gap: 18,
                transition: `box-shadow 240ms ${EASE}, transform 240ms ${EASE}`,
              }}>
                <span style={{
                  alignSelf: 'flex-start', fontSize: 12, fontWeight: 600, letterSpacing: '.14em',
                  textTransform: 'uppercase', color: C.goldDark, background: 'rgba(165,139,38,.1)', padding: '7px 12px',
                }}>{c.tag}</span>
                <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(22px,2.2vw,28px)', lineHeight: 1.2, color: C.blueDeep }}>{c.name}</h3>
                <p style={{ margin: '-8px 0 0', fontSize: 14, color: C.plomo }}>{c.sub}</p>
                {c.text && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>{c.text}</p>}
                {c.quote && (
                  <figure style={{ margin: 0, borderLeft: `1px solid ${C.gold}`, paddingLeft: 'clamp(18px,2.4vw,28px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <blockquote style={{ margin: 0, fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(17px,1.5vw,19px)', lineHeight: 1.55, color: C.blueDeep }}>
                      «{c.quote}»
                    </blockquote>
                    <figcaption style={{ fontSize: 14, color: C.pizarra }}>{c.quote_author}</figcaption>
                  </figure>
                )}
                {c.foot && (
                  <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${C.bruma}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Icon name="award" size={28} color={C.gold} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: C.blueDeep }}>{c.foot}</span>
                  </div>
                )}
                {c.caps && (
                  <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${C.bruma}` }}>
                    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                      {c.caps.map((cap) => (
                        <li key={cap} style={{ border: `1px solid ${C.piedra}`, padding: '7px 12px', fontSize: 13, lineHeight: 1.4, color: C.pizarra }}>{cap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section style={{ background: '#fff', padding: `${SECTION_Y} 0` }}>
        <Container>
          <div data-reveal="" style={{
            display: 'grid', gap: w >= 900 ? 64 : 40, alignItems: 'center',
            gridTemplateColumns: w >= 900 ? 'minmax(0,1fr) 240px' : '1fr',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{
                margin: 0, fontFamily: SLAB, fontWeight: 700,
                fontSize: 'clamp(30px,4.6vw,58px)', lineHeight: 1.1, color: C.blueDeep, textWrap: 'balance',
              }}>{k('fund_quote')}</h2>
              <p style={{
                margin: 0, fontSize: 'clamp(17px,1.4vw,19px)', lineHeight: 1.65,
                borderLeft: `1px solid ${C.gold}`, paddingLeft: 'clamp(18px,2.4vw,28px)', maxWidth: '60ch',
              }}>{k('fund_lead')}</p>
            </div>
            <img src={ruedaImg} alt={k('fund_img_alt')} style={{
              display: 'block', width: 'min(100%,240px)', height: 'auto', aspectRatio: '1/1',
              objectFit: 'contain', justifySelf: 'center',
              filter: 'drop-shadow(0 12px 28px rgba(15,30,51,.16))',
            }} />
          </div>
          <div data-reveal="" style={{
            display: 'grid', gap: tablet ? 'clamp(32px,5vw,72px)' : 32,
            gridTemplateColumns: tablet ? 'repeat(2,minmax(0,1fr))' : '1fr',
            margin: 'clamp(48px,6vw,72px) 0',
          }}>
            <div style={{ borderLeft: `1px solid ${C.gold}`, paddingLeft: 'clamp(18px,2.4vw,28px)' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(20px,2vw,24px)', color: C.blueDeep }}>{k('fund_col1_title')}</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>{k('fund_col1_text')}</p>
            </div>
            <div style={{ borderLeft: `1px solid ${C.gold}`, paddingLeft: 'clamp(18px,2.4vw,28px)' }}>
              <h3 style={{ margin: '0 0 12px', fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(20px,2vw,24px)', color: C.blueDeep }}>{k('fund_col2_title')}</h3>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65 }}>{k('fund_col2_text')}</p>
            </div>
          </div>
          <ul data-reveal="" style={{
            display: 'grid', gap: 16, margin: 0, padding: 0, listStyle: 'none',
            gridTemplateColumns: w >= 1100 ? 'repeat(4,minmax(0,1fr))' : w >= 600 ? 'repeat(2,minmax(0,1fr))' : '1fr',
          }}>
            {k('temperaments').map((tmp) => (
              <li key={tmp.name} style={{
                background: C.page, borderTop: `3px solid ${tmp.color}`, padding: '26px 24px',
                display: 'flex', flexDirection: 'column', gap: 14,
                transition: `background 240ms ${EASE}`,
              }}>
                <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 20, color: C.blueDeep }}>{tmp.name}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{tmp.text}</p>
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.bruma}` }}>
                  <small style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: C.plomo, marginBottom: 6 }}>
                    {k('fund_virtue_label')}
                  </small>
                  <strong style={{ display: 'block', fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(20px,1.9vw,24px)', letterSpacing: '.06em', color: C.goldDark }}>
                    {tmp.virtue}
                  </strong>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container>
          <H2 style={{ maxWidth: '22ch' }}>{k('path_title')}</H2>
          <div data-reveal="" style={{
            background: '#fff', border: `1px solid ${C.bruma}`, display: 'grid',
            gridTemplateColumns: w >= 960 ? 'minmax(0,1fr) minmax(0,1.2fr)' : '1fr',
            marginTop: 'clamp(40px,5vw,56px)',
          }}>
            <ul style={{
              margin: 0, padding: 'clamp(28px,4vw,48px)', listStyle: 'none',
              display: 'flex', flexDirection: 'column', gap: 16, background: C.blueDeep, color: '#fff',
            }}>
              {k('path_pills').map((pill) => (
                <li key={pill.label} style={{
                  display: 'grid', gridTemplateColumns: '44px minmax(0,1fr)', gap: 16, alignItems: 'start',
                  padding: 20, border: '1px solid rgba(250,247,238,.16)', background: 'rgba(255,255,255,.03)',
                }}>
                  <span style={{
                    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(201,171,66,.5)',
                  }}>
                    <Icon name={pill.label === 'Carga lectiva' ? 'video' : pill.label === 'Duración' ? 'clock' : 'users'} size={22} color={C.goldLight} />
                  </span>
                  <div>
                    <b style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldLight, marginBottom: 6 }}>
                      {pill.label}
                    </b>
                    <span style={{ fontSize: 15, lineHeight: 1.6, color: C.cream }}>{pill.text}</span>
                  </div>
                </li>
              ))}
            </ul>
            <ol style={{
              position: 'relative', margin: 0, padding: 'clamp(28px,4vw,48px)', listStyle: 'none',
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              {k('courses').map((course, i) => (
                <li key={course} style={{
                  position: 'relative', display: 'grid', gridTemplateColumns: '44px minmax(0,1fr)',
                  gap: 18, alignItems: 'center', padding: '12px 0',
                }}>
                  {i < k('courses').length - 1 && (
                    <span aria-hidden="true" style={{
                      position: 'absolute', left: 21, top: 'calc(50% + 22px)',
                      height: 'calc(100% - 20px)', width: 1, background: C.gold,
                    }} />
                  )}
                  <span style={{
                    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${C.gold}`, background: '#fff',
                    fontFamily: SLAB, fontWeight: 700, fontSize: 18, color: C.goldDark,
                    position: 'relative', zIndex: 1,
                  }}>{i + 1}</span>
                  <span style={{ fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(16px,1.5vw,18px)', lineHeight: 1.4, color: C.blueDeep }}>
                    {course}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section style={{ background: C.blueDeep, color: '#fff', padding: `${SECTION_Y} 0` }}>
        <Container>
          <H2 dark>{k('del_title')}</H2>
          <div data-reveal="" style={{
            display: 'grid', gap: 16, marginTop: 'clamp(40px,5vw,56px)',
            gridTemplateColumns: w >= 1080 ? 'repeat(6,minmax(0,1fr))' : w >= 700 ? 'repeat(2,minmax(0,1fr))' : '1fr',
          }}>
            {k('deliverables').map((d, i) => (
              <article key={d.title} style={{
                background: 'rgba(255,255,255,.05)', border: '1px solid rgba(250,247,238,.16)',
                padding: 'clamp(26px,3vw,36px)', display: 'flex', flexDirection: 'column', gap: 16,
                gridColumn: w >= 1080 ? `span ${d.span}` : 'auto',
                transition: `background 240ms ${EASE}, border-color 240ms ${EASE}`,
              }}>
                <span style={{
                  width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(201,171,66,.5)',
                }}>
                  <Icon name={['report', 'chart', 'trainers', 'award'][i]} size={24} color={C.goldLight} />
                </span>
                <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(19px,1.8vw,22px)', lineHeight: 1.25, color: '#fff' }}>{d.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.cream }}>{d.text}</p>
              </article>
            ))}
            {k('del_modes').map((m, i) => (
              <article key={m.title} style={{
                background: 'transparent', border: `1px solid ${C.goldLight}`, borderTopWidth: 3,
                padding: 'clamp(26px,3vw,36px)', display: 'flex', flexDirection: 'column', gap: 16,
                gridColumn: w >= 1080 ? 'span 3' : 'auto',
              }}>
                <span style={{
                  width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: C.goldLight, border: `1px solid ${C.goldLight}`,
                }}>
                  <Icon name={i === 0 ? 'home' : 'monitor'} size={24} color={C.blueNight} />
                </span>
                <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(19px,1.8vw,22px)', lineHeight: 1.25, color: '#fff' }}>{m.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.cream }}>{m.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container>
          <H2 style={{ maxWidth: '24ch' }}>{k('road_title')}</H2>
          <ol data-reveal="" className="vlc-tl" style={{
            position: 'relative', margin: 'clamp(48px,6vw,72px) 0 0', padding: 0, listStyle: 'none',
            display: 'grid', gap: w >= 900 ? 24 : 32,
            gridTemplateColumns: w >= 900 ? 'repeat(3,minmax(0,1fr))' : '1fr',
          }}>
            {k('road_phases').map((phase, i) => {
              const numSize = w >= 900 ? 72 : 48;
              return (
                <li key={phase.year} style={{
                  position: 'relative', display: 'grid',
                  gridTemplateColumns: w >= 900 ? '1fr' : '48px minmax(0,1fr)',
                  gap: w >= 900 ? 24 : 20,
                }}>
                  <span className="vlc-tl-n" style={{
                    width: numSize, height: numSize, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: C.page, border: `1px solid ${C.piedra}`,
                    fontFamily: SLAB, fontWeight: 700, fontSize: w >= 900 ? 34 : 24, color: C.plomo,
                    position: 'relative', zIndex: 1,
                    transition: `border-color 400ms ${EASE}, color 400ms ${EASE}, background 400ms ${EASE}`,
                    transitionDelay: `${i * 600}ms`,
                  }}>{i + 1}</span>
                  <div style={{
                    background: '#fff', border: `1px solid ${C.bruma}`, padding: 'clamp(24px,3vw,32px)',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <small style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', color: C.goldDark }}>{phase.year}</small>
                    <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(19px,1.8vw,22px)', lineHeight: 1.25, color: C.blueDeep }}>{phase.title}</h3>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65 }}>{phase.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <style>{`
.vlc-tl.is-in .vlc-tl-n{border-color:${C.gold};color:${C.goldDark};background:#fff}
          `}</style>
        </Container>
      </section>

      <section id="solicitud" style={{ position: 'relative', background: C.blueNight, color: '#fff', overflow: 'hidden', padding: `${SECTION_Y} 0` }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
          <img src={ctaImg} alt="" style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: '50% 25%', filter: 'grayscale(1) contrast(1.05)',
          }} />
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg,rgba(15,30,51,.94) 0%,rgba(15,30,51,.86) 55%,rgba(15,30,51,.78) 100%)',
        }} />
        <Container style={{ position: 'relative' }}>
          <div style={{
            display: 'grid', gap: w >= 980 ? 'clamp(48px,6vw,96px)' : 48, alignItems: w >= 980 ? 'center' : 'start',
            gridTemplateColumns: w >= 980 ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr',
          }}>
            <Stack gap={24}>
              <H2 dark>{k('form_title')}</H2>
              <p style={{
                margin: 0, fontSize: 'clamp(17px,1.4vw,19px)', lineHeight: 1.65, color: C.cream,
                borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 'clamp(18px,2.4vw,28px)',
              }}>{k('form_lead')}</p>
              <ul style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {k('form_checks').map((chk) => (
                  <li key={chk} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr)', gap: 14, fontSize: 16, lineHeight: 1.55, color: C.cream }}>
                    <Icon name="check" size={24} color={C.goldLight} />
                    <span>{chk}</span>
                  </li>
                ))}
              </ul>
            </Stack>
            <div data-reveal="" style={{
              background: '#fff', color: C.pizarra, borderTop: `2px solid ${C.gold}`,
              padding: 'clamp(24px,4vw,40px)', boxShadow: '0 18px 50px rgba(15,30,51,.22)',
            }}>
              <form onSubmit={handleViabilidad}>
                <FormField label={k('form_nombre')} id="ce-nombre" autoComplete="name" />
                <SelectField label={k('form_cargo')} id="ce-cargo" options={k('form_cargo_opts')} />
                <FormField label={k('form_inst')} id="ce-inst" autoComplete="organization" />
                <FormField label={k('form_loc')} id="ce-loc" />
                <FormField label={k('form_email')} id="ce-email" type="email" autoComplete="email" />
                <FormField label={k('form_tel')} id="ce-tel" type="tel" autoComplete="tel" required={false} />
                <div style={{ marginBottom: 24 }}>
                  <SelectField label={k('form_claustro')} id="ce-claustro" options={k('form_claustro_opts')} />
                </div>
                <button type="submit" className="vlc-cta" style={{ width: '100%' }}>{k('form_submit')}</button>
              </form>
            </div>
          </div>
        </Container>
      </section>

      {isMobile && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 55,
          background: 'rgba(15,30,51,.96)', borderTop: '1px solid rgba(201,171,66,.4)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}>
          <a href="#solicitud" className="vlc-cta" style={{ display: 'flex', minHeight: 48, padding: '0 16px' }}>
            Solicitar Informe de Viabilidad
          </a>
        </div>
      )}

      {modal === 'dossier' && (
        <ModalShell onClose={closeModal} closeRef={closeRef}>
          <Stack gap={16} reveal={false}>
            <h2 style={{
              margin: 0, paddingRight: 36, fontFamily: SLAB, fontWeight: 700,
              fontSize: 'clamp(24px,3vw,30px)', lineHeight: 1.15, color: C.blueDeep,
            }}>{k('modal_title')}</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>{k('modal_text')}</p>
            <div id="brevo-form" style={{
              marginTop: 12, minHeight: 220, border: `1px dashed ${C.piedra}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, letterSpacing: '0.16em', color: C.plomo,
            }}>BREVO FORM</div>
          </Stack>
        </ModalShell>
      )}


    </div>
  );
}
