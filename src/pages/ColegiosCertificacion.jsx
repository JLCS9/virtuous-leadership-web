// Pagina /colegios — version "Certificacion" (rediseño nov-2026). v3
// Traslada a React el HTML de diseño "Certificacion Liderazgo Virtuoso".
// Usa el sistema visual nuevo de Liderazgo Virtuoso (Roboto Slab + Roboto,
// azul profundo + oro, esquinas rectas), con tokens LOCALES a esta pagina
// (constante C) para no alterar theme.js ni el resto del sitio.
//
// Secciones: Hero · Barra confianza · El porque · Institucion Certificada ·
// Fundamentos · Como funciona · La experiencia · FAQ · CTA final.
// Header y Footer son los del Layout del sitio.
// Textos en i18n `colegios_cert` (solo ES de momento: ver CERT_LANGS).
import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import SEO from '../components/SEO';
import ColegiosPrograma from './ColegiosPrograma';

import heroImg from '../assets/colegios/escultura-hero.jpg';
import ctaImg from '../assets/colegios/escultura-cta.jpg';
import havardImg from '../assets/colegios/alexandre-havard.jpg';
import logoFullWhite from '../assets/colegios/logo-full-white.png';
import ruedaImg from '../assets/colegios/rueda-temperamentos.webp';

const CERT_LANGS = new Set(['es']);
const BREVO_FORM_URL = '';

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
const SECTION_Y = 'clamp(88px,12vw,168px)';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:ital,wght@0,400;0,600;1,400&display=swap');
.vlc { font-family: ${SANS}; color: ${C.pizarra}; background: ${C.page}; overflow-x: clip; -webkit-font-smoothing: antialiased; }
.vlc *:focus-visible { outline: 2px solid ${C.goldLight}; outline-offset: 3px; }
.vlc-cta { white-space: nowrap; flex: none; display: inline-flex; align-items: center; justify-content: center; background: ${C.gold}; color: #fff; font-family: ${SANS}; font-weight: 600; font-size: 16px; padding: 16px 28px; text-decoration: none; transition: background 200ms ${EASE}; cursor: pointer; border: none; }
.vlc-cta:hover { background: ${C.goldLight}; color: #fff; }
.vlc-btn { font-family: ${SANS}; font-weight: 600; font-size: 16px; padding: 14px 26px; cursor: pointer; display: inline-flex; align-items: center; gap: 9px; border-radius: 0; line-height: 1.2; background: transparent; transition: background 200ms ${EASE}, color 200ms ${EASE}; }
.vlc-btn--light { color: #fff; border: 2px solid rgba(255,255,255,.55); }
.vlc-btn--light:hover { background: rgba(255,255,255,.08); border-color: #fff; }
.vlc-btn--dark { color: ${C.blueDeep}; border: 2px solid ${C.blueDeep}; font-size: 15px; padding: 13px 24px; }
.vlc-btn--dark:hover { background: ${C.blueDeep}; color: #fff; }
.vlc-faq-btn { all: unset; box-sizing: border-box; width: 100%; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 26px 0; font-family: ${SLAB}; font-weight: 700; font-size: 21px; line-height: 1.35; color: ${C.blueDeep}; transition: color 200ms ${EASE}; }
@media (max-width: 759px) { .vlc-faq-btn { font-size: 18px; padding: 22px 0; } }
.vlc-faq-btn:hover { color: ${C.blueMid}; }
.vlc-faq-icon { flex: none; width: 28px; height: 28px; border: 1px solid ${C.piedra}; display: flex; align-items: center; justify-content: center; font-family: ${SANS}; font-weight: 400; font-size: 18px; color: ${C.goldDark}; }
.vlc-link { all: unset; cursor: pointer; display: inline-block; font-size: 15px; font-weight: 500; color: ${C.blueDeep}; text-decoration: underline; text-decoration-color: ${C.gold}; text-decoration-thickness: 1px; text-underline-offset: 6px; transition: color 200ms ${EASE}; }
.vlc-link:hover { color: ${C.blueMid}; }
.vlc-close { all: unset; position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${C.pizarra}; }
.vlc-close:hover { color: ${C.blueMid}; }
.vlc-tbl { width: 100%; min-width: 320px; border-collapse: collapse; }
.vlc-tbl th, .vlc-tbl td { padding: 16px 12px; border-bottom: 1px solid rgba(250,247,238,.12); vertical-align: middle; }
.vlc-tbl thead th { font-family: ${SLAB}; font-weight: 700; font-size: clamp(14px,1.5vw,20px); color: #fff; text-align: center; padding: 22px 8px; }
.vlc-tbl thead td, .vlc-tbl thead th { border-bottom: 1px solid ${C.goldLight}; }
.vlc-tbl tbody th { text-align: left; font-weight: 400; font-size: clamp(15px,1.3vw,17px); line-height: 1.5; color: ${C.cream}; padding-left: 0; }
.vlc-tbl td { text-align: center; width: clamp(84px,17vw,190px); }
.vlc-tbl-hl { background: rgba(201,171,66,.09); }
.vlc-tbl thead .vlc-tbl-hl { border-top: 2px solid ${C.goldLight}; }
.vlc-ttbl { width: 100%; border-collapse: collapse; font-size: 16px; }
.vlc-ttbl th, .vlc-ttbl td { padding: 14px 12px; border-bottom: 1px solid ${C.bruma}; text-align: left; }
.vlc-ttbl tr:first-child th, .vlc-ttbl tr:first-child td { border-top: 1px solid ${C.blueDeep}; }
.vlc-ttbl th { font-size: 12px; font-weight: 600; letter-spacing: .16em; text-transform: uppercase; color: ${C.goldDark}; white-space: nowrap; width: 1%; padding-right: 28px; }
.vlc-ttbl-strong td { font-family: ${SLAB}; font-weight: 700; color: ${C.blueDeep}; }
@media (prefers-reduced-motion: reduce) { .vlc [data-reveal] { opacity: 1 !important; transform: none !important; } }
`;

// ---------- hooks ----------

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.style.opacity = '1';
        el.style.transform = 'none';
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

// ---------- piezas ----------

const ICONS = {
  video: <><path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 10.5" /><rect x="2" y="6" width="14" height="12" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  chat: <><path d="M21 15V3H3v18l4-4h12a2 2 0 0 0 2-2z" /><path d="M8 9h8" /><path d="M8 13h5" /></>,
  award: <><circle cx="12" cy="8" r="6" /><path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  tick: <path d="m4.5 12.5 5 5 10-11" />,
  hourglass: <path d="M6 2h12M6 22h12M7 2v4l5 6-5 6v4M17 2v4l-5 6 5 6v4" />,
  calcheck: <><rect x="3" y="5" width="18" height="16" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
  calendarCheck: <><rect x="3" y="5" width="18" height="16" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
  notebook: <><rect x="5" y="2" width="15" height="20" /><path d="M2 6h5M2 10h5M2 14h5M2 18h5M10 7h6M10 11h6" /></>,
  clipboard: <><rect x="8" y="2" width="8" height="4" /><path d="M16 4h4v18H4V4h4" /><path d="m9 14 2 2 4-4" /></>,
  report: <><path d="M14 2H4v20h16V8z" /><path d="M14 2v6h6" /><path d="M8 18v-3M12 18v-6M16 18v-4" /></>,
  dashboard: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  usercheck: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m16 11 2 2 4-4" /></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
  person: <><circle cx="12" cy="7" r="4" /><path d="M5 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" /></>,
  building: <><path d="M3 22h18M4 10h16M12 2 3 7v3h18V7z" /><path d="M6 10v9M10 10v9M14 10v9M18 10v9M4 19h16" /></>,
  cap: <><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 2.5 9 2.5 12 0v-5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  book: <><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></>,
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
      fontFamily: SANS, fontWeight: 600, fontSize: 14, letterSpacing: '0.16em',
      textTransform: 'uppercase', lineHeight: 1.2, display: 'inline-block', whiteSpace: 'nowrap',
      color: dark ? C.goldLight : C.goldDark,
    }}>{children}</span>
  );
}

function H2({ children, dark, size = 48, style }) {
  const min = Math.round(size * 0.63);
  const fs = `clamp(${min}px, ${(size / 10).toFixed(1)}vw + ${Math.round(size * 0.3)}px, ${size}px)`;
  return (
    <h2 style={{
      margin: '0 0 2px', fontFamily: SLAB, fontWeight: 700, fontSize: fs, lineHeight: 1.08,
      color: dark ? '#fff' : C.blueDeep, ...style,
    }}>{children}</h2>
  );
}

function GoldTick({ color = C.gold, style }) {
  return <span aria-hidden="true" style={{ display: 'block', width: 24, height: 1, background: color, flex: 'none', ...style }} />;
}

function Container({ children, style, max = 1200 }) {
  return (
    <div style={{ maxWidth: max, margin: '0 auto', padding: `0 ${PAD_X}`, boxSizing: 'border-box', ...style }}>
      {children}
    </div>
  );
}

function Stack({ children, gap = 24, style, reveal = true }) {
  return (
    <div data-reveal={reveal ? '' : undefined} style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {children}
    </div>
  );
}

// ---------- pagina ----------

export default function ColegiosPage() {
  const { lang } = useT();
  return CERT_LANGS.has(lang) ? <ColegiosCertificacion /> : <ColegiosPrograma />;
}

function ColegiosCertificacion() {
  const { t, lang } = useT();
  const k = (key) => t(`colegios_cert.${key}`);
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const closeRef = useRef(null);
  const w = useWidth();
  const [modal, setModal] = useState(false);
  const [faq, setFaq] = useState(-1);
  const [cardIdx, setCardIdx] = useState(0);
  const [form, setForm] = useState({});
  const [showSticky, setShowSticky] = useState(false);
  useReveal(rootRef);

  const isMobile = w < 760;
  const tablet = w >= 760;
  const wide = w >= 1000;
  const cols4 = wide ? 'repeat(4,minmax(0,1fr))' : w >= 560 ? 'repeat(2,minmax(0,1fr))' : '1fr';

  const email = k('contact_email');
  const mailPresentation = `mailto:${email}?subject=${encodeURIComponent(k('mail_subject_presentation'))}`;

  const openModal = (type) => setModal(type);
  const closeModal = () => { setModal(false); setForm({}); };
  useEffect(() => {
    if (!modal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = setTimeout(() => closeRef.current && closeRef.current.focus(), 30);
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [modal]);

  useEffect(() => {
    if (!isMobile) { setShowSticky(false); return; }
    const hero = heroRef.current;
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => {
      setShowSticky(!entry.isIntersecting);
    }, { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const cards = k('exp_cards') || [];
    const perPage = w >= 700 ? 2 : 1;
    const maxIdx = Math.max(0, cards.length - perPage);
    if (maxIdx <= 0) return;
    const id = setInterval(() => {
      setCardIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(id);
  }, [w]);

  const upd = (field) => (e) => setForm((prev) => ({
    ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));
  const handleConversation = (e) => {
    e.preventDefault();
    const lines = [
      form.nombre && `Nombre: ${form.nombre}`,
      form.email && `Email: ${form.email}`,
      form.tel && `Teléfono: ${form.tel}`,
      form.centro && `Centro: ${form.centro}`,
      form.pais && `País: ${form.pais}`,
      form.cargo && `Cargo: ${form.cargo}`,
      form.num && `Participantes: ${form.num}`,
      form.interes && `Interés: ${form.interes}`,
    ].filter(Boolean).join('\n');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(k('mail_subject_conversation'))}&body=${encodeURIComponent(lines)}`;
    closeModal();
  };

  const CtaScroll = ({ block }) => (
    <button type="button" className="vlc-cta" onClick={() => openModal('conversation')} data-gtm="contact-lead"
       style={block ? { display: 'flex', minHeight: 48, padding: '0 16px' } : undefined}>
      {k('cta_conversation')}
    </button>
  );
  const BtnPresentation = () => (
    <button type="button" className="vlc-btn vlc-btn--light" onClick={() => openModal('dossier')} data-gtm="presentation-open">
      {k('cta_presentation')}
    </button>
  );

  const sup = (raw) => {
    const idx = raw.indexOf('®');
    if (idx === -1) return raw;
    return <>{raw.slice(0, idx)}<sup style={{ fontSize: '0.4em', verticalAlign: 'super', lineHeight: 1 }}>®</sup>{raw.slice(idx + 1)}</>;
  };

  const statNum = (color, size) => ({
    fontFamily: SLAB, fontWeight: 700, fontSize: size, lineHeight: 0.9, color, fontVariantNumeric: 'tabular-nums',
  });

  const fld = {
    display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 14px',
    border: `1px solid ${C.bruma}`, fontFamily: SANS, fontSize: 16, color: C.blueDeep,
    background: '#fff', outline: 'none', borderRadius: 0,
  };

  return (
    <div ref={rootRef} className="vlc">
      <SEO title={k('seo_title')} description={k('seo_description')} />
      <style>{CSS}</style>

      {/* 01 Hero */}
      <section ref={heroRef} style={{
        position: 'relative', minHeight: wide || isMobile ? 'calc(100svh - 81px)' : 'auto', background: C.blueNight, color: '#fff',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: isMobile ? '100%' : '52%' }}>
          <img src={heroImg} alt={k('hero_img_alt')} style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: isMobile ? '62% 30%' : '50% 40%', mixBlendMode: 'screen', filter: 'grayscale(1) contrast(1.05)',
          }} />
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: isMobile
            ? 'rgba(15,30,51,.68)'
            : 'linear-gradient(90deg, #0f1e33 0%, #0f1e33 44%, rgba(15,30,51,.35) 62%, rgba(15,30,51,0) 80%)',
        }} />
        <Container style={{ position: 'relative', width: '100%', paddingTop: 112, paddingBottom: 96 }}>
          <Stack style={{ maxWidth: 640 }}>
            <Eyebrow dark>{k('hero_eyebrow')}</Eyebrow>
            <h1 style={{
              margin: '0 0 2px', fontFamily: SLAB, fontWeight: 700,
              fontSize: isMobile ? 'clamp(32px,9.2vw,42px)' : 'clamp(42px,6.4vw,80px)',
              lineHeight: 1.02, letterSpacing: '-0.01em', color: '#fff',
              textWrap: isMobile ? 'pretty' : 'balance',
            }}>{sup(isMobile ? k('hero_title').replace(/ /g, ' ') : k('hero_title'))}</h1>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: C.cream, maxWidth: '56ch', textWrap: 'pretty' }}>
              {k('hero_text')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 4 }}>
              <CtaScroll />
            </div>
            <ul aria-label="Barra de confianza" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 36px', margin: '28px 0 0', padding: 0, listStyle: 'none' }}>
              {(k('trust') || []).map((s, i) => {
                const m = typeof s === 'string' && s.match(/^([+\d.%]+)\s+(.+)$/);
                return (
                  <li key={i} style={{ borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 16, fontSize: 16, color: C.cream, lineHeight: 1.3 }}>
                    {m
                      ? <><strong style={{ fontFamily: SLAB, fontWeight: 700, fontSize: 24, color: C.goldLight, fontVariantNumeric: 'tabular-nums', display: 'block' }}>{m[1]}</strong>{m[2]}</>
                      : String(s)}
                  </li>
                );
              })}
            </ul>
          </Stack>
        </Container>
      </section>

      {/* 02 El porqué */}
      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container>
          <div data-reveal="" style={{
            display: 'grid', gridTemplateColumns: w >= 900 ? '1.15fr 1fr' : '1fr',
            gap: 'clamp(48px,7vw,96px)', alignItems: w >= 900 ? 'end' : 'start',
          }}>
            <H2 size={42} style={{ lineHeight: 1.08 }}>{k('why_title')}</H2>
            <p style={{
              margin: 0, borderLeft: `2px solid ${C.gold}`, paddingLeft: 'clamp(20px,3vw,32px)',
              fontSize: 'clamp(17px,1.45vw,20px)', lineHeight: 1.7, maxWidth: '52ch',
            }}>{k('why_text')}</p>
          </div>
        </Container>
      </section>

      {/* 03 Institución Certificada */}
      <section style={{ background: C.blueDeep, color: '#fff', padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(56px,7vw,88px)' }}>
          <div data-reveal="" style={{
            display: 'grid', gridTemplateColumns: w >= 900 ? '1fr 1fr' : '1fr',
            gap: 'clamp(48px,6vw,88px)', alignItems: 'end',
          }}>
            <Stack gap={20}>
              <H2 dark>{k('cert_title')}</H2>
              <p style={{
                margin: 0, borderLeft: `2px solid ${C.goldLight}`, paddingLeft: 'clamp(20px,3vw,28px)',
                fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(19px,1.9vw,24px)', lineHeight: 1.45, color: C.cream,
              }}>{k('cert_subtitle')}</p>
            </Stack>
            <Stack gap={24} reveal={false}>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: C.cream }}>{k('cert_text_1')}</p>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: C.cream }}>{k('cert_text_2')}</p>
            </Stack>
          </div>

          <div data-reveal="" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="vlc-tbl">
              <thead>
                <tr>
                  <td />
                  <th>{k('cert_col_cap')}</th>
                  <th className="vlc-tbl-hl">{k('cert_col_cert')}</th>
                </tr>
              </thead>
              <tbody>
                {(k('cert_rows') || []).map((r) => (
                  <tr key={r.t}>
                    <th>{r.t}</th>
                    <td>{r.cap && <Icon name="tick" size={20} color={C.goldLight} style={{ display: 'block', margin: '0 auto' }} />}</td>
                    <td className="vlc-tbl-hl"><Icon name="tick" size={20} color={C.goldLight} style={{ display: 'block', margin: '0 auto' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div data-reveal="" style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" className="vlc-btn vlc-btn--light" onClick={() => openModal('dossier')} data-gtm="presentation-open">
              {k('cert_cta')}
            </button>
          </div>
        </Container>
      </section>

      {/* 04 Fundamentos */}
      <section style={{ background: C.white, padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column' }}>
          <div data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 'clamp(40px,5vw,64px)' }}>
            <Eyebrow>{k('fund_eyebrow')}</Eyebrow>
            <H2>{(() => { const parts = k('fund_title').split('. '); return parts.length > 1 ? <>{parts[0]}.<br />{parts[1]}</> : k('fund_title'); })()}</H2>
          </div>

          <div data-reveal="" style={{
            display: 'grid',
            gridTemplateColumns: wide ? 'repeat(3,1fr)' : tablet ? 'repeat(2,1fr)' : '1fr',
            gap: 'clamp(32px,4vw,48px)',
          }}>
            {(k('fund_pillars') || []).map((p, i) => (
              <div key={p.title} style={{
                borderLeft: `2px solid ${C.gold}`, paddingLeft: 'clamp(20px,2.5vw,28px)',
                ...(tablet && !wide && i === 1 ? { order: 2, gridColumn: '1 / -1' } : {}),
                ...(tablet && !wide && i === 2 ? { order: 1 } : {}),
              }}>
                <h3 style={{ margin: '0 0 14px', fontFamily: SLAB, fontWeight: 700, fontSize: 20, color: C.blueDeep }}>{p.title}</h3>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, maxWidth: '40ch' }}>{p.text}</p>
              </div>
            ))}
          </div>

          <div data-reveal="" style={{
            display: 'grid', gridTemplateColumns: wide ? '1fr 180px' : '1fr',
            gap: 'clamp(32px,5vw,56px)', marginTop: 'clamp(48px,6vw,72px)', paddingTop: 'clamp(40px,5vw,56px)',
            borderTop: `1px solid ${C.bruma}`, alignItems: 'center',
          }}>
            <div>
              {isMobile ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                  {(k('fund_temps') || []).map((temp, i) => (
                    <div key={temp} style={{
                      border: `1px solid ${C.bruma}`, padding: '16px 14px',
                      display: 'flex', flexDirection: 'column', gap: 6,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: C.goldDark }}>{temp}</span>
                      <span style={{ fontFamily: SLAB, fontWeight: 700, fontSize: 16, color: C.blueDeep }}>{(k('fund_virtues') || [])[i]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table className="vlc-ttbl">
                    <tbody>
                      <tr>
                        <th>{k('fund_temp_label')}</th>
                        {(k('fund_temps') || []).map((t) => <td key={t}>{t}</td>)}
                      </tr>
                      <tr className="vlc-ttbl-strong">
                        <th>{k('fund_virtue_label')}</th>
                        {(k('fund_virtues') || []).map((v) => <td key={v}>{v}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <a href="https://alexhavard.com" target="_blank" rel="noopener noreferrer" className="vlc-link" style={{ marginTop: 24, display: 'inline-block' }}>
                {k('fund_academic_link')}
              </a>
            </div>
            {wide && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img src={ruedaImg} alt={k('fund_img_alt')} loading="lazy" style={{
                  display: 'block', width: 180, height: 'auto', aspectRatio: '1/1', objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 20px rgba(15,30,51,.12))',
                }} />
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 05 Cómo funciona */}
      <section style={{ background: C.blueDeep, color: '#fff', padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(48px,6vw,72px)' }}>
          <Stack>
            <Eyebrow dark>{k('how_eyebrow')}</Eyebrow>
            <H2 dark style={{ marginBottom: 28 }}>{k('how_title')}</H2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {(k('how_roles') || []).map((r) => (
                <span key={r} style={{
                  border: '1px solid rgba(250,247,238,.36)', padding: '10px 18px', fontSize: 15, color: C.cream,
                }}>{r}</span>
              ))}
            </div>
          </Stack>

          <div data-reveal="" style={{
            display: 'grid', gridTemplateColumns: w >= 960 ? '1.35fr 1fr' : '1fr', gap: 'clamp(48px,6vw,72px)', alignItems: 'center',
          }}>
            {/* Cascade diagram */}
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 0 }}>
              <div style={{ position: 'relative' }}>
                <div aria-hidden="true" style={{ position: 'absolute', left: 13, top: 0, bottom: 20, width: 1, background: C.gold, opacity: 0.6 }} />
                <div aria-hidden="true" style={{
                  position: 'absolute', left: 8, bottom: 8, width: 0, height: 0,
                  borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `8px solid ${C.gold}`,
                }} />
                <span style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(180deg)',
                  writingMode: 'vertical-rl', fontSize: 12, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: C.goldLight, whiteSpace: 'nowrap', background: C.blueDeep, padding: '12px 0',
                }}>{k('how_cascade')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 16 }}>
                {(k('how_levels') || []).map((l, i) => (
                  <div key={i} style={{
                    marginLeft: `${i * (isMobile ? 5 : 8)}%`,
                    borderLeft: `2px solid ${C.gold}`, padding: '14px 20px',
                    transition: `margin-left 400ms ${EASE}`,
                  }}>
                    <h4 style={{ margin: '0 0 4px', fontFamily: SLAB, fontWeight: 700, fontSize: 18, color: '#fff' }}>{l.title}</h4>
                    <p style={{ margin: 0, fontSize: 16, color: C.cream, lineHeight: 1.5 }}>{l.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Facts list */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: tablet && !wide ? 'repeat(2,1fr)' : '1fr',
              gap: tablet && !wide ? '16px 28px' : 28,
            }}>
              {(k('how_facts') || []).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <Icon name={f.icon} size={24} color={C.goldLight} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, fontSize: tablet && !wide ? 15 : 17, lineHeight: 1.5, color: C.cream }}>
                    {f.n != null && (
                      <strong data-count={f.n} style={{ fontFamily: SLAB, fontWeight: 700, color: C.goldLight, marginRight: 6 }}>{f.n}</strong>
                    )}
                    {f.text}
                  </p>
                </div>
              ))}
              <p style={{ margin: 0, fontSize: 15, color: C.cream, opacity: 0.7, ...(tablet && !wide ? { gridColumn: '1 / -1' } : {}) }}>{k('how_fundae')}</p>
            </div>
          </div>

          {/* Cómo se pone en marcha */}
          <div data-reveal="">
            <h3 style={{ margin: '0 0 clamp(32px,4vw,48px)', fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(24px,2.5vw,32px)', color: '#fff' }}>
              {k('how_steps_title')}
            </h3>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: cols4, gap: '40px 32px' }}>
              {(k('how_steps') || []).map((s, i) => (
                <li key={s.title} style={{ borderTop: `1px solid ${C.gold}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span aria-hidden="true" style={{ fontFamily: SLAB, fontWeight: 700, fontSize: 48, lineHeight: 1, color: C.goldLight }}>{i + 1}</span>
                  <h4 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 18, color: '#fff' }}>{s.title}</h4>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: C.cream }}>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div data-reveal="" style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" className="vlc-cta" onClick={() => openModal('conversation')} data-gtm="contact-lead">{k('cta_conversation')}</button>
          </div>
        </Container>
      </section>

      {/* 06 La experiencia */}
      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(56px,7vw,88px)' }}>
          {/* Quote + big numbers */}
          <div data-reveal="" style={{
            display: 'grid', gridTemplateColumns: w >= 960 ? '1.6fr 1fr' : '1fr', gap: 'clamp(40px,5vw,64px)',
          }}>
            <figure style={{ margin: 0 }}>
              <blockquote style={{
                margin: 0, borderLeft: `2px solid ${C.gold}`, paddingLeft: 'clamp(20px,3vw,32px)',
                fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(21px,2.3vw,30px)', lineHeight: 1.45, color: C.blueDeep,
                textWrap: 'pretty',
              }}>{k('exp_quote')}</blockquote>
              <figcaption style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16, fontSize: 16, color: C.plomo }}>
                <GoldTick />
                <span>{k('exp_quote_author')}</span>
              </figcaption>
            </figure>
            <div style={{ display: 'flex', flexDirection: w >= 960 ? 'column' : 'row', gap: 'clamp(32px,4vw,48px)' }}>
              {(k('exp_nums') || []).map((s) => (
                <div key={s.text} style={{ borderLeft: `1px solid ${C.gold}`, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span data-count={s.n} style={statNum(C.gold, 'clamp(56px,7vw,96px)')}>{Number(s.n).toLocaleString('es-ES')}</span>
                  <span style={{ fontSize: 18, lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div data-reveal="" style={{
            display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr 1.6fr' : '1fr',
            gap: 'clamp(32px,4vw,40px)', borderTop: `1px solid ${C.bruma}`, paddingTop: 'clamp(32px,4vw,48px)',
          }}>
            {(k('exp_stats') || []).map((s, i) => (
              <div key={i} style={{ borderLeft: `1px solid ${C.gold}`, paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {s.n != null ? (
                  <span data-count={s.n} data-suffix={s.suffix || ''} style={statNum(C.gold, 'clamp(48px,6vw,80px)')}>{s.n}{s.suffix || ''}</span>
                ) : (
                  <span style={{ fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(17px,1.7vw,22px)', lineHeight: 1.3, color: C.blueDeep }}>{s.title}</span>
                )}
                <span style={{ fontSize: 16, lineHeight: 1.5 }}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial carousel */}
          {(() => {
            const cards = k('exp_cards') || [];
            const perPage = w >= 700 ? 2 : 1;
            const maxIdx = Math.max(0, cards.length - perPage);
            const visible = cards.slice(cardIdx, cardIdx + perPage);
            return (
              <div data-reveal="" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: perPage === 2 ? 'repeat(2,1fr)' : '1fr', gap: 20, height: perPage === 2 ? 300 : 320 }}>
                  {visible.map((c) => (
                    <figure key={c.author} style={{
                      margin: 0, background: C.white, borderTop: `2px solid ${C.gold}`, padding: 'clamp(24px,3vw,32px)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24,
                      overflow: 'hidden',
                    }}>
                      <blockquote style={{ margin: 0, fontSize: 15, lineHeight: 1.65, textWrap: 'pretty' }}>{c.quote}</blockquote>
                      <figcaption style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600, color: C.blueDeep }}>
                        <GoldTick />
                        <span>{c.author}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {cards.length > perPage && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <button type="button" aria-label="Anterior" onClick={() => setCardIdx((p) => Math.max(0, p - 1))}
                      style={{ width: 40, height: 40, border: `1px solid ${C.bruma}`, background: 'none', cursor: cardIdx === 0 ? 'default' : 'pointer', opacity: cardIdx === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blueDeep} strokeWidth="1.5" strokeLinecap="square"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button type="button" aria-label="Siguiente" onClick={() => setCardIdx((p) => Math.min(maxIdx, p + 1))}
                      style={{ width: 40, height: 40, border: `1px solid ${C.bruma}`, background: 'none', cursor: cardIdx >= maxIdx ? 'default' : 'pointer', opacity: cardIdx >= maxIdx ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.blueDeep} strokeWidth="1.5" strokeLinecap="square"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Author */}
          <div data-reveal="" style={{
            display: 'grid',
            gridTemplateColumns: wide ? '160px 1fr auto' : tablet ? '120px 1fr' : '80px 1fr',
            gap: '16px 24px', alignItems: 'center',
            marginTop: 'clamp(48px,6vw,64px)', paddingTop: 32, borderTop: `1px solid ${C.bruma}`,
          }}>
            <img src={havardImg} alt={k('exp_author_name')} loading="lazy" style={{
              display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '54% 25%',
              filter: 'saturate(.6)', aspectRatio: '1/1',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 18, color: C.blueDeep }}>
                {k('exp_author_name')} <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 15, color: C.plomo }}>· {k('exp_author_role')}</span>
              </p>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, maxWidth: '80ch' }}>{k('exp_author_bio')}</p>
              <a href="https://alexhavard.com" target="_blank" rel="noopener noreferrer" className="vlc-link" style={{ fontSize: 15, marginTop: 8, alignSelf: 'flex-start' }}>
                {k('exp_author_link')}
              </a>
            </div>
            {wide && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {(k('exp_author_nums') || []).map((s) => (
                  <div key={s.text} style={{ borderLeft: `1px solid ${C.gold}`, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span data-count={s.n} data-prefix={s.prefix || ''} style={statNum(C.blueDeep, 28)}>
                      {(s.prefix || '') + Number(s.n).toLocaleString('es-ES')}
                    </span>
                    <span style={{ fontSize: 14, color: C.plomo }}>{s.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 07a FAQ */}
      <section style={{ background: C.white, padding: `${SECTION_Y} 0` }}>
        <Container max={820} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <div data-reveal=""><H2>{k('faq_title')}</H2></div>
          <div data-reveal="" style={{ borderTop: `1px solid ${C.blueDeep}` }}>
            {(k('faqs') || []).map(([q, a], i) => {
              const isOpen = faq === i;
              const panelId = `faq-panel-${i}`;
              return (
                <div key={q} style={{ borderBottom: `1px solid ${C.bruma}` }}>
                  <h3 style={{ margin: 0, fontSize: 21 }}>
                    <button type="button" className="vlc-faq-btn" aria-expanded={isOpen} aria-controls={panelId}
                            onClick={() => setFaq(isOpen ? -1 : i)}>
                      <span>{q}</span>
                      <span className="vlc-faq-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={panelId} role="region" style={{ padding: '0 52px 28px 0' }}>
                      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, maxWidth: '62ch' }}>{a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 07b ¿Y si empieza por usted? */}
      <section style={{ background: C.white, padding: `0 0 ${SECTION_Y}` }}>
        <Container max={820}>
          <div data-reveal="" style={{ borderTop: `2px solid ${C.gold}`, paddingTop: 'clamp(40px,5vw,56px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Eyebrow>{k('self_eyebrow')}</Eyebrow>
            <H2 size={36}>{k('self_title')}</H2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, maxWidth: '52ch' }}>{k('self_text')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 24px', paddingTop: 8 }}>
              <a href={`/${lang}/tests/temperamento`} className="vlc-btn vlc-btn--dark">{k('self_cta')}</a>
              <a href="https://alexhavard.com" target="_blank" rel="noopener noreferrer" className="vlc-link">{k('self_link')}</a>
            </div>
          </div>
        </Container>
      </section>

      {/* 07c CTA final */}
      <section id="conversacion" style={{
        position: 'relative', minHeight: wide ? '100svh' : 'auto', background: C.blueNight, color: '#fff',
        display: 'flex', alignItems: 'center', overflow: 'hidden', paddingBottom: isMobile ? 72 : 0,
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={ctaImg} alt="" loading="lazy" style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%',
            filter: 'grayscale(1)',
          }} />
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(15,30,51,.86) 0%, rgba(15,30,51,.78) 50%, rgba(15,30,51,.9) 100%)',
        }} />
        <Container max={880} style={{ position: 'relative', width: '100%', paddingTop: 120, paddingBottom: 120 }}>
          <Stack style={{ alignItems: 'center', textAlign: 'center' }}>
            <img src={logoFullWhite} alt="Virtuous Leadership" loading="lazy" style={{ width: 190, height: 'auto', display: 'block', marginBottom: 16 }} />
            <H2 dark style={{ lineHeight: 1.06, textWrap: 'balance' }}>{sup(k('final_title'))}</H2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: C.cream, maxWidth: '48ch' }}>{k('final_text')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 6 }}>
              <button type="button" className="vlc-cta" onClick={() => openModal('conversation')} data-gtm="contact-lead">
                {k('cta_conversation')}
              </button>
              <button type="button" className="vlc-link" onClick={() => openModal('dossier')} data-gtm="presentation-open"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.cream, textDecoration: 'underline', textDecorationColor: C.goldLight, textUnderlineOffset: '6px', fontSize: 16, fontWeight: 500 }}>
                {k('final_presentation')}
              </button>
            </div>
            <a href={`mailto:${email}`} style={{ color: C.cream, fontSize: 16, textDecoration: 'underline', textUnderlineOffset: '4px' }} data-gtm="contact-lead">{email}</a>
            <GoldTick color={C.goldLight} style={{ marginTop: 12 }} />
            <span style={{ fontFamily: SANS, fontStyle: 'italic', fontWeight: 400, fontSize: 22, letterSpacing: '0.005em', color: C.goldLight, lineHeight: 1.2 }}>
              {k('final_tagline')}
            </span>
          </Stack>
        </Container>
      </section>

      {/* Barra CTA fija en móvil — aparece al pasar el hero */}
      {isMobile && showSticky && (
        <button type="button" onClick={() => openModal('conversation')} data-gtm="contact-lead"
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
            background: C.gold, color: '#fff', border: 'none',
            fontFamily: SANS, fontWeight: 600, fontSize: 16,
            padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
            cursor: 'pointer', textAlign: 'center',
          }}>
          {k('cta_conversation')}
        </button>
      )}

      {/* Modal Conversación */}
      {modal === 'conversation' && (
        <div role="dialog" aria-modal="true" aria-labelledby="vlc-conv-title"
             onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
             style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,30,51,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{
            position: 'relative', background: C.white, width: '100%', maxWidth: 680, maxHeight: 'calc(100svh - 40px)', overflow: 'auto',
            padding: 'clamp(28px,5vw,48px)', boxSizing: 'border-box', boxShadow: '0 18px 50px rgba(15,30,51,0.20)', borderTop: `2px solid ${C.gold}`,
          }}>
            <button type="button" ref={closeRef} className="vlc-close" aria-label="Cerrar" onClick={closeModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
            <form onSubmit={handleConversation} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <h2 id="vlc-conv-title" style={{
                margin: '0 0 8px', paddingRight: 36, fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(24px,3vw,30px)', lineHeight: 1.15, color: C.blueDeep,
              }}>{k('conv_title')}</h2>
              <p style={{ margin: '0 0 24px', fontSize: 16, lineHeight: 1.6, color: C.plomo }}>{k('conv_text')}</p>

              {/* Fila 1: Nombre | Apellidos */}
              <div style={{ display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_nombre')}</span>
                  <input type="text" required value={form.nombre || ''} onChange={upd('nombre')} style={fld} />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_apellidos')}</span>
                  <input type="text" required value={form.apellidos || ''} onChange={upd('apellidos')} style={fld} />
                </label>
              </div>
              {/* Fila 2: Email | Teléfono */}
              <div style={{ display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_email')}</span>
                  <input type="email" required value={form.email || ''} onChange={upd('email')} style={fld} />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_tel')}</span>
                  <input type="tel" value={form.tel || ''} onChange={upd('tel')} style={fld} />
                </label>
              </div>
              {/* Fila 3: País (ancho completo) */}
              <label style={{ display: 'block', marginBottom: 16 }}>
                <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_pais')}</span>
                <input type="text" value={form.pais || ''} onChange={upd('pais')} style={fld} />
              </label>
              {/* Fila 4: Colegio | Cargo */}
              <div style={{ display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_colegio')}</span>
                  <input type="text" required value={form.colegio || ''} onChange={upd('colegio')} style={fld} />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_cargo')}</span>
                  <select value={form.cargo || ''} onChange={upd('cargo')} required style={{ ...fld, appearance: 'auto' }}>
                    <option value="" disabled>—</option>
                    {(k('conv_cargo_opts') || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              </div>
              {/* Fila 5: Nº profesionales | ¿Qué le interesa? */}
              <div style={{ display: 'grid', gridTemplateColumns: tablet ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_num')}</span>
                  <input type="text" value={form.num || ''} onChange={upd('num')} style={fld} />
                </label>
                <label style={{ display: 'block' }}>
                  <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: C.blueDeep }}>{k('conv_interes')}</span>
                  <select value={form.interes || ''} onChange={upd('interes')} required style={{ ...fld, appearance: 'auto' }}>
                    <option value="" disabled>—</option>
                    {(k('conv_interes_opts') || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.5, cursor: 'pointer', marginBottom: 12 }}>
                <input type="checkbox" required checked={form.rgpd || false} onChange={upd('rgpd')} style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{k('conv_rgpd')}</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.5, cursor: 'pointer', marginBottom: 24 }}>
                <input type="checkbox" required checked={form.privacy || false} onChange={upd('privacy')} style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{k('conv_rgpd_privacy')}</span>
              </label>
              <button type="submit" className="vlc-cta" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                {k('conv_submit')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Presentación */}
      {modal === 'dossier' && (
        <div role="dialog" aria-modal="true" aria-labelledby="vlc-modal-title"
             onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
             style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,30,51,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{
            position: 'relative', background: '#fff', width: '100%', maxWidth: 540, maxHeight: 'calc(100svh - 40px)', overflow: 'auto',
            padding: 'clamp(28px,5vw,48px)', boxSizing: 'border-box', boxShadow: '0 18px 50px rgba(15,30,51,0.20)', borderTop: `2px solid ${C.gold}`,
          }}>
            <button type="button" ref={closeRef} className="vlc-close" aria-label="Cerrar" onClick={closeModal}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
            <Stack gap={16} reveal={false}>
              <h2 id="vlc-modal-title" style={{
                margin: 0, paddingRight: 36, fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(24px,3vw,30px)', lineHeight: 1.15, color: C.blueDeep,
              }}>{k('modal_title')}</h2>
              {BREVO_FORM_URL ? (
                <>
                  <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>{k('modal_text')}</p>
                  <iframe title={k('modal_title')} src={BREVO_FORM_URL} frameBorder="0" scrolling="auto" allowFullScreen
                          style={{ display: 'block', width: '100%', minHeight: 420, border: 0, marginTop: 12 }} />
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>{k('modal_text')}</p>
                  <div style={{ marginTop: 12 }}>
                    <a href={mailPresentation} className="vlc-cta" data-gtm="presentation-request">{k('cta_presentation')}</a>
                  </div>
                </>
              )}
            </Stack>
          </div>
        </div>
      )}
    </div>
  );
}
