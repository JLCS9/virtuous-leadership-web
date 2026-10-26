// Pagina /colegios — version "Certificacion" (rediseño oct-2026).
// Traslada a React el HTML de diseño "Certificacion Liderazgo Virtuoso".
// Usa el sistema visual nuevo de Liderazgo Virtuoso (Roboto Slab + Roboto,
// azul profundo + oro, esquinas rectas), con tokens LOCALES a esta pagina
// (constante C) para no alterar theme.js ni el resto del sitio.
//
// Secciones: Hero · Barra de confianza · El porque · Delmar · La
// certificacion · Fundamentos · Participantes · Que incluye · El recorrido ·
// Resultados · La experiencia · El autor · Siguiente paso · FAQ · CTA final.
// Header y Footer son los del Layout del sitio (el footer del diseño no se
// usa). Textos en i18n `colegios_cert` (solo ES de momento: ver CERT_LANGS).
//
// CTAs:
//   "Solicite una conversacion inicial" → mailto a colegios_cert.contact_email.
//   "Reciba la presentacion completa"   → modal. Si BREVO_FORM_URL esta
//     definido se incrusta el formulario de Brevo (iframe); si no, el modal
//     ofrece pedir la presentacion por email.
import { useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import SEO from '../components/SEO';
import ColegiosPrograma from './ColegiosPrograma';

import heroImg from '../assets/colegios/escultura-hero.jpg';
import ctaImg from '../assets/colegios/escultura-cta.jpg';
import comunidadImg from '../assets/colegios/comunidad-educativa.jpg';
import delmarDocentesImg from '../assets/colegios/delmar-docentes.jpg';
import delmarLogo from '../assets/colegios/logo-delmar.png';
import havardImg from '../assets/colegios/alexandre-havard.jpg';
import isotipoWhite from '../assets/colegios/logo-isotipo-white.png';
import logoFullWhite from '../assets/colegios/logo-full-white.png';
import selloImg from '../assets/colegios/sello-institucion-certificada.png';
import certificadoImg from '../assets/colegios/certificado-oficial.png';
import ruedaImg from '../assets/colegios/rueda-temperamentos.webp';

// Idiomas con la copia `colegios_cert` traducida. El resto sigue viendo la
// pagina de Programa anterior.
const CERT_LANGS = new Set(['es']);

// URL del formulario de Brevo (la del iframe del "embed" de Brevo). Vacia =
// el modal cae al mailto.
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
const PAD_X = 'clamp(20px,5vw,48px)';
const SECTION_Y = 'clamp(88px,12vw,168px)';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&family=Roboto:ital,wght@0,400;0,600;1,400&display=swap');
.vlc { font-family: ${SANS}; color: ${C.pizarra}; background: ${C.page}; overflow-x: clip; -webkit-font-smoothing: antialiased; }
.vlc *:focus-visible { outline: 2px solid ${C.goldLight}; outline-offset: 3px; }
.vlc-cta { white-space: nowrap; flex: none; display: inline-flex; align-items: center; justify-content: center; background: ${C.gold}; color: #fff; font-family: ${SANS}; font-weight: 600; font-size: 16px; padding: 16px 28px; text-decoration: none; transition: background 200ms ${EASE}; }
.vlc-cta:hover { background: ${C.goldLight}; color: #fff; }
.vlc-btn { font-family: ${SANS}; font-weight: 600; font-size: 16px; padding: 14px 26px; cursor: pointer; display: inline-flex; align-items: center; gap: 9px; border-radius: 0; line-height: 1.2; background: transparent; transition: background 200ms ${EASE}, color 200ms ${EASE}; }
.vlc-btn--light { color: #fff; border: 2px solid rgba(255,255,255,.55); }
.vlc-btn--light:hover { background: rgba(255,255,255,.08); border-color: #fff; }
.vlc-btn--dark { color: ${C.blueDeep}; border: 2px solid ${C.blueDeep}; font-size: 15px; padding: 13px 24px; }
.vlc-btn--dark:hover { background: ${C.blueDeep}; color: #fff; }
.vlc-review { transition: background 240ms ${EASE}, box-shadow 240ms ${EASE}; }
.vlc-review:hover { background: #fff !important; box-shadow: 0 2px 8px rgba(15,30,51,0.10); }
.vlc-faq-btn { all: unset; box-sizing: border-box; width: 100%; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 26px 0; font-family: ${SLAB}; font-weight: 700; font-size: 21px; line-height: 1.35; color: ${C.blueDeep}; transition: color 200ms ${EASE}; }
.vlc-faq-btn:hover { color: ${C.blueMid}; }
.vlc-link { color: ${C.cream}; font-size: 16px; text-underline-offset: 4px; }
.vlc-link:hover { color: ${C.goldLight}; }
.vlc-close { all: unset; position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: ${C.pizarra}; }
.vlc-close:hover { color: ${C.blueMid}; }
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

// Aparicion suave de los bloques [data-reveal] + contador de [data-count].
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
  hourglass: <path d="M6 2h12M6 22h12M7 2v4l5 6-5 6v4M17 2v4l-5 6 5 6v4" />,
  calcheck: <><rect x="3" y="5" width="18" height="16" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
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

function Stars({ color, size }) {
  const { t } = useT();
  return (
    <span role="img" aria-label={t('colegios_cert.rating_label')}
          style={{ color, letterSpacing: '0.14em', fontSize: size, whiteSpace: 'nowrap' }}>★★★★★</span>
  );
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

// Lista con separadores finos (Que incluye / Resultados).
function RuleList({ items, render }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li key={i} style={{
          padding: '16px 0', borderBottom: i < items.length - 1 ? `1px solid ${C.bruma}` : 'none', fontSize: 18, lineHeight: 1.55,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>{render(it)}</li>
      ))}
    </ul>
  );
}

// ---------- pagina ----------

export default function ColegiosPage() {
  const { lang } = useT();
  return CERT_LANGS.has(lang) ? <ColegiosCertificacion /> : <ColegiosPrograma />;
}

function ColegiosCertificacion() {
  const { t } = useT();
  const k = (key) => t(`colegios_cert.${key}`);
  const rootRef = useRef(null);
  const closeRef = useRef(null);
  const w = useWidth();
  const [modal, setModal] = useState(false);
  const [faq, setFaq] = useState(-1);
  useReveal(rootRef);

  const isMobile = w < 760;
  const tablet = w >= 760;
  const wide = w >= 1000;
  const cols4 = wide ? 'repeat(4,minmax(0,1fr))' : w >= 560 ? 'repeat(2,minmax(0,1fr))' : '1fr';
  const nw = tablet ? 'nowrap' : 'normal';

  const email = k('contact_email');
  const mailConversation = `mailto:${email}?subject=${encodeURIComponent(k('mail_subject_conversation'))}`;
  const mailPresentation = `mailto:${email}?subject=${encodeURIComponent(k('mail_subject_presentation'))}`;

  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);
  useEffect(() => {
    if (!modal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = setTimeout(() => closeRef.current && closeRef.current.focus(), 30);
    const onKey = (e) => { if (e.key === 'Escape') setModal(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
    };
  }, [modal]);

  const CtaConversation = ({ block }) => (
    <a href={mailConversation} className="vlc-cta" data-gtm="contact-lead"
       style={block ? { display: 'flex', minHeight: 48, padding: '0 16px' } : undefined}>
      {k('cta_conversation')}
    </a>
  );
  const BtnPresentation = () => (
    <button type="button" className="vlc-btn vlc-btn--light" onClick={openModal} data-gtm="presentation-open">
      {k('cta_presentation')}
    </button>
  );

  // Linea de tiempo (semanas) y recorrido (cursos): horizontales en ancho,
  // verticales en estrecho.
  const tl = tablet
    ? { dir: 'row', gap: 8, line: null, itemDir: 'column', itemAlign: 'flex-start' }
    : { dir: 'column', gap: 22, line: null, itemDir: 'row', itemAlign: 'center' };
  const path = wide
    ? { mode: 'flex', dir: 'row', gap: 20, line: { top: 30, left: 0, right: 0, height: 1 }, itemDir: 'column', numW: 'auto', numPad: '0 14px 0 0', titlePad: 0, scroll: false }
    : tablet
      ? { mode: 'flex', dir: 'row', gap: 20, line: { top: 30, left: 0, right: 0, height: 1 }, itemDir: 'column', numW: 'auto', numPad: '0 14px 0 0', titlePad: 0, scroll: true }
      : { mode: 'flex', dir: 'column', gap: 28, line: { top: 0, bottom: 0, left: 13, width: 1 }, itemDir: 'row', numW: 50, numPad: '0 0 6px', titlePad: 12, scroll: false };

  const statNum = (color, size) => ({
    fontFamily: SLAB, fontWeight: 700, fontSize: size, lineHeight: 0.9, color, fontVariantNumeric: 'tabular-nums',
  });
  const fmtNum = (s) => `${s.prefix || ''}${Number(s.n).toLocaleString('es-ES')}${s.suffix || ''}`;

  return (
    <div ref={rootRef} className="vlc">
      <SEO title={k('seo_title')} description={k('seo_description')} />
      <style>{CSS}</style>

      {/* 01 Hero */}
      <section style={{
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
              margin: '0 0 2px', fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(42px,6.4vw,80px)', lineHeight: 1.02,
              letterSpacing: '-0.01em', color: '#fff', textWrap: 'balance',
            }}>{(() => {
              const raw = isMobile ? k('hero_title').replace(/ /g, ' ') : k('hero_title');
              const idx = raw.indexOf('®');
              if (idx === -1) return raw;
              return <>{raw.slice(0, idx)}<sup style={{ fontSize: '0.4em', verticalAlign: 'super', lineHeight: 1 }}>®</sup>{raw.slice(idx + 1)}</>;
            })()}</h1>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: C.cream, maxWidth: '56ch', textWrap: 'pretty' }}>
              {k('hero_text')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 8 }}>
              <CtaConversation />
              <BtnPresentation />
            </div>
          </Stack>
        </Container>
      </section>

      {/* Barra de confianza */}
      <section aria-label="Barra de confianza" style={{ background: C.blueDeep, color: C.cream, borderTop: '1px solid rgba(201,171,66,.35)' }}>
        <Container style={{ padding: `26px ${PAD_X}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px 40px' }}>
          {k('trust').map((s) => (
            <p key={s} style={{ margin: 0, paddingLeft: 18, borderLeft: `1px solid ${C.goldLight}`, fontSize: 15, letterSpacing: '0.02em' }}>{s}</p>
          ))}
        </Container>
      </section>

      {/* 02 El porque */}
      <section style={{ background: C.page, paddingTop: wide ? SECTION_Y : 'clamp(40px,6vw,80px)' }}>
        <Container style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Stack style={{ alignItems: 'center', textAlign: 'center' }}>
            <span aria-hidden="true" style={{ display: 'block', width: 1, height: 64, background: C.gold }} />
            <Eyebrow>{k('why_eyebrow')}</Eyebrow>
            <H2 style={{ maxWidth: 1100, textWrap: 'balance' }}>{k('why_title')}</H2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, maxWidth: 1000, textWrap: 'balance' }}>{k('why_text')}</p>
          </Stack>
        </Container>
        <figure data-reveal="" style={{
          margin: 'clamp(56px,7vw,88px) 0 0', position: 'relative', width: '100%', overflow: 'hidden', background: C.blueNight,
          aspectRatio: isMobile ? '4/3' : w >= 1400 ? '21/8' : '2/1',
        }}>
          <img src={comunidadImg} alt={k('why_img_alt')} loading="lazy" style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '45% 40%', filter: 'saturate(.5) contrast(1.03)',
          }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(26,48,79,.28)', mixBlendMode: 'multiply', pointerEvents: 'none' }} />
        </figure>
      </section>

      {/* 03 Ya esta ocurriendo — Delmar */}
      <section style={{ position: 'relative', background: C.blueDeep, color: '#fff', padding: `${SECTION_Y} 0`, overflow: 'hidden' }}>
        <img src={isotipoWhite} alt="" aria-hidden="true" style={{
          position: 'absolute', right: '-6%', top: '50%', transform: 'translateY(-50%)', height: '120%', width: 'auto', opacity: 0.05, pointerEvents: 'none',
        }} />
        <Container style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'clamp(48px,6vw,72px)' }}>
          {wide ? (
            <div data-reveal="" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <img src={delmarLogo} alt={k('delmar_logo_alt')} loading="lazy" style={{ display: 'block', width: 80, height: 'auto', flex: 'none', filter: 'brightness(0) invert(1)' }} />
              <span style={{ width: 1, alignSelf: 'stretch', background: C.goldLight, opacity: 0.4 }} />
              <Stack gap={10}>
                <Eyebrow dark>{k('delmar_eyebrow')}</Eyebrow>
                <H2 dark size={40} style={{ lineHeight: 1.15 }}>{k('delmar_title')}</H2>
              </Stack>
            </div>
          ) : (
            <Stack data-reveal="" gap={24}>
              <Eyebrow dark>{k('delmar_eyebrow')}</Eyebrow>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <img src={delmarLogo} alt={k('delmar_logo_alt')} loading="lazy" style={{ display: 'block', width: 80, height: 'auto', flex: 'none', filter: 'brightness(0) invert(1)' }} />
                <H2 dark size={40} style={{ lineHeight: 1.15 }}>{k('delmar_title')}</H2>
              </div>
            </Stack>
          )}
          <div data-reveal="" style={{
            display: 'grid', gridTemplateColumns: tablet ? 'minmax(0,5fr) minmax(0,6fr)' : '1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'stretch',
          }}>
            <figure style={{ margin: 0, position: 'relative', aspectRatio: tablet ? undefined : '3/2', overflow: 'hidden', background: C.blueNight, minHeight: tablet ? 0 : undefined }}>
              <img src={delmarDocentesImg} alt={k('delmar_img_alt')} loading="lazy" style={{
                display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 40%', filter: 'saturate(.55) contrast(1.03)',
              }} />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(26,48,79,.22)', mixBlendMode: 'multiply', pointerEvents: 'none' }} />
            </figure>
            <figure style={{ margin: 0, borderLeft: `2px solid ${C.goldLight}`, paddingLeft: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: 32 }}>
              <blockquote style={{
                margin: 0, fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(22px,2.4vw,32px)', lineHeight: 1.4, color: C.cream, maxWidth: '34ch', textWrap: 'pretty',
              }}>
                «{k('delmar_quote')} <span style={{ color: C.goldLight }}>{k('delmar_quote_highlight')}</span>»
              </blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 16, lineHeight: 1.5, color: C.cream }}>
                <GoldTick color={C.goldLight} />
                <span>{k('delmar_author')}</span>
              </figcaption>
            </figure>
          </div>
          <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: tablet ? 'repeat(2,1fr)' : '1fr', gap: 40, maxWidth: 820 }}>
            {k('delmar_stats').map((s) => (
              <div key={s.n} style={{ display: 'flex', flexDirection: 'column', gap: 12, ...(wide ? { borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 28 } : {}) }}>
                <span data-count={s.n} style={statNum(C.goldLight, 'clamp(72px,9vw,120px)')}>{fmtNum(s)}</span>
                <span style={{ fontSize: 18, lineHeight: 1.5, color: C.cream, maxWidth: '24ch' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 04 La certificacion */}
      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: wide ? 'clamp(56px,7vw,96px)' : 'clamp(20px,3vw,32px)' }}>
          {wide ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 48, alignItems: 'center' }}>
              <Stack>
                <Eyebrow>{k('cert_eyebrow')}</Eyebrow>
                <H2 style={{ maxWidth: '18ch', textWrap: 'balance' }}>{k('cert_title')}</H2>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, maxWidth: '56ch', textWrap: 'pretty' }}>{k('cert_text')}</p>
              </Stack>
              <div data-reveal="" style={{ display: 'flex', justifyContent: 'center' }}>
                <img src={selloImg} alt={k('cert_seal_alt')} loading="lazy" style={{ display: 'block', width: 'min(100%,300px)', aspectRatio: '1/1', objectFit: 'contain' }} />
              </div>
            </div>
          ) : (
            <>
              <Stack gap={16}>
                <Eyebrow>{k('cert_eyebrow')}</Eyebrow>
                <H2>{k('cert_title')}</H2>
              </Stack>
              <div style={{ display: 'grid', gridTemplateColumns: tablet ? 'minmax(0,1.6fr) minmax(0,1fr)' : '1fr', gap: 'clamp(16px,3vw,32px)', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, maxWidth: '56ch', textWrap: 'pretty' }}>{k('cert_text')}</p>
                {!isMobile && (
                  <div data-reveal="" style={{ display: 'flex', justifyContent: 'center' }}>
                    <img src={selloImg} alt={k('cert_seal_alt')} loading="lazy" style={{ display: 'block', width: 'min(100%,200px)', aspectRatio: '1/1', objectFit: 'contain' }} />
                  </div>
                )}
              </div>
            </>
          )}
          <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: cols4, gap: '32px 0' }}>
            {k('pillars').map((p) => (
              <article key={p.title} style={{ padding: '32px 28px', borderLeft: `1px solid ${C.bruma}`, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Icon name={p.icon} size={32} />
                <GoldTick />
                <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 21, lineHeight: 1.25, color: C.blueDeep }}>{p.title}</h3>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>{p.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 05 Fundamentos */}
      <section style={{ background: C.white, padding: `${SECTION_Y} 0` }}>
        <Container style={{
          display: 'grid', gridTemplateColumns: tablet ? 'minmax(0,1.6fr) minmax(0,1fr)' : '1fr', gap: 'clamp(48px,6vw,80px)', alignItems: 'center',
        }}>
          <Stack>
            <Eyebrow>{k('fund_eyebrow')}</Eyebrow>
            <H2 size={40} style={{ lineHeight: 1.12 }}>
              {k('fund_title_lines').map((l, i) => (
                <span key={i}>{i > 0 && <br />}<span style={{ whiteSpace: nw }}>{l}</span></span>
              ))}
            </H2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, maxWidth: '52ch' }}>{k('fund_text')}</p>
            <p style={{
              margin: '8px 0 0', borderLeft: `2px solid ${C.gold}`, padding: '4px 0 4px 24px', fontFamily: SLAB, fontWeight: 400,
              fontSize: 'clamp(18px,1.7vw,22px)', lineHeight: 1.45, color: C.blueDeep,
            }}>
              {k('fund_quote_lines').map((l, i) => (
                <span key={i}>{i > 0 && <br />}<span style={{ whiteSpace: nw }}>{l}</span></span>
              ))}
            </p>
            <div style={{ marginTop: 16 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.goldDark }}>
                {k('fund_table_title')}
              </h3>
              <dl style={{ margin: 0, borderTop: `1px solid ${C.blueDeep}` }}>
                {k('fund_table').map(([temp, virtue]) => (
                  <div key={temp} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 0', borderBottom: `1px solid ${C.bruma}` }}>
                    <dt style={{ fontSize: 18 }}>{temp}</dt>
                    <dd style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 18, color: C.blueDeep }}>{virtue}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Stack>
          <div data-reveal="" style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={ruedaImg} alt={k('fund_img_alt')} loading="lazy" style={{
              display: 'block', width: isMobile ? 'min(100%,280px)' : 'min(100%,540px)', aspectRatio: '1/1', objectFit: 'contain', filter: 'drop-shadow(0 18px 36px rgba(15,30,51,.18))',
            }} />
          </div>
        </Container>
      </section>

      {/* 06 Participantes */}
      <section style={{ background: C.blueDeep, color: '#fff', padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(48px,6vw,72px)' }}>
          <Stack>
            <Eyebrow dark>{k('part_eyebrow')}</Eyebrow>
            <H2 dark style={{ lineHeight: 1.06, maxWidth: 1000, textWrap: 'balance' }}>{k('part_title')}</H2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: C.cream }}>{k('part_text')}</p>
            <ul aria-label={k('part_roles_label')} style={{ listStyle: 'none', margin: '8px 0 0', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {k('part_roles').map((r) => (
                <li key={r} style={{ border: '1px solid rgba(250,247,238,.4)', padding: '10px 18px', fontSize: 15, color: C.cream }}>{r}</li>
              ))}
            </ul>
          </Stack>
          <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : cols4, gap: '28px 32px' }}>
            {k('part_facts').map((f, i) => (
              <div key={f.text} style={{ ...(isMobile ? (i % 2 === 1 ? { borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 20 } : {}) : { borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 20 }), display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Icon name={f.icon} size={28} color={C.goldLight} />
                <p style={{ margin: 0, fontFamily: SLAB, fontSize: 21, lineHeight: 1.35, color: '#fff' }}>{f.text}</p>
              </div>
            ))}
          </div>
          {/* Timeline de semanas — oculto temporalmente
          <ol data-reveal="" aria-label={k('timeline_label')} style={{
            listStyle: 'none', margin: 0, padding: 0, position: 'relative', display: 'flex', flexDirection: tl.dir, gap: tl.gap,
          }}>
            <li aria-hidden="true" style={{ position: 'absolute', ...tl.line, background: 'rgba(201,171,66,.55)' }} />
            {k('weeks').map((wk) => (
              <li key={wk} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: tl.itemDir, alignItems: tl.itemAlign, gap: 14 }}>
                <span aria-hidden="true" style={{ display: 'block', width: 11, height: 11, flex: 'none', background: C.blueDeep, border: `1px solid ${C.goldLight}`, boxSizing: 'border-box' }} />
                <span style={{ fontSize: 15, color: C.cream, lineHeight: 1 }}>{wk}</span>
              </li>
            ))}
            <li style={{ position: 'relative', flex: 1.4, display: 'flex', flexDirection: tl.itemDir, alignItems: tl.itemAlign, gap: 14 }}>
              <span aria-hidden="true" style={{ display: 'block', width: 11, height: 11, flex: 'none', background: C.goldLight }} />
              <span style={{ fontFamily: SLAB, fontWeight: 700, fontSize: 18, color: C.goldLight, lineHeight: 1 }}>{k('timeline_end')}</span>
            </li>
          </ol>
          */}
        </Container>
      </section>

      {/* 07 Que incluye */}
      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(48px,6vw,72px)' }}>
          <Stack>
            <Eyebrow>{k('inc_eyebrow')}</Eyebrow>
            <H2>{k('inc_title')}</H2>
          </Stack>
          <div style={{
            display: 'grid', gap: 48, alignItems: 'start',
            gridTemplateColumns: wide ? 'minmax(0,1fr) minmax(0,1fr) minmax(0,.8fr)' : tablet ? 'repeat(2,minmax(0,1fr))' : '1fr',
          }}>
            {[['inc_participant_title', 'inc_participant'], ['inc_direction_title', 'inc_direction']].map(([title, list]) => (
              <Stack key={list} gap={16}>
                <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 21, color: C.blueDeep }}>{k(title)}</h3>
                <GoldTick />
                <RuleList items={k(list)} render={(it) => <><Icon name={it.icon} /><span>{it.text}</span></>} />
              </Stack>
            ))}
            {!wide && (
              <div data-reveal="" style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px', borderTop: `1px solid ${C.bruma}`, paddingTop: 32 }}>
                <p style={{ margin: 0, fontSize: 18 }}>{k('inc_more')}</p>
                <button type="button" className="vlc-btn vlc-btn--dark" onClick={openModal} data-gtm="presentation-open">
                  {k('cta_presentation')} →
                </button>
              </div>
            )}
            <div data-reveal="" style={{ display: 'flex', justifyContent: 'center', gridColumn: wide ? 'auto' : '1 / -1' }}>
              <img src={certificadoImg} alt={k('inc_cert_alt')} loading="lazy" style={{
                display: 'block', width: isMobile ? 'min(100%,200px)' : 'min(100%,340px)', height: 'auto', aspectRatio: '1748/2250', boxShadow: '0 8px 28px rgba(15,30,51,0.14)',
              }} />
            </div>
          </div>
          {wide && (
            <div data-reveal="" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px', borderTop: `1px solid ${C.bruma}`, paddingTop: 32 }}>
              <p style={{ margin: 0, fontSize: 18 }}>{k('inc_more')}</p>
              <button type="button" className="vlc-btn vlc-btn--dark" onClick={openModal} data-gtm="presentation-open">
                {k('cta_presentation')} →
              </button>
            </div>
          )}
        </Container>
      </section>

      {/* 08 El recorrido */}
      <section style={{ background: C.blueDeep, color: '#fff', padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(56px,7vw,88px)' }}>
          <Stack>
            <Eyebrow dark>{k('path_eyebrow')}</Eyebrow>
            <H2 dark style={{ lineHeight: 1.06 }}>{k('path_title')}</H2>
          </Stack>
          {path.scroll ? (
            <div data-reveal="" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
              <ol style={{
                listStyle: 'none', margin: 0, padding: 0, position: 'relative',
                display: 'flex', flexDirection: path.dir, gap: path.gap, minWidth: 'max-content',
              }}>
                {path.line && <li aria-hidden="true" style={{ position: 'absolute', ...path.line, background: C.goldLight, opacity: 0.6 }} />}
                {k('courses').map((title, i) => (
                  <li key={title} style={{ position: 'relative', flex: '0 0 auto', minWidth: 140, display: 'flex', flexDirection: path.itemDir, gap: 20, alignItems: 'flex-start' }}>
                    <span style={{
                      display: 'block', flex: 'none', width: path.numW, background: C.blueDeep, fontFamily: SLAB, fontWeight: 700,
                      fontSize: 'clamp(44px,4.6vw,60px)', lineHeight: 1, color: C.goldLight, fontVariantNumeric: 'tabular-nums', padding: path.numPad,
                    }}>{i + 1}</span>
                    <span style={{ fontFamily: SLAB, fontWeight: 400, fontSize: 17, lineHeight: 1.3, color: C.cream, maxWidth: '16ch', paddingTop: path.titlePad }}>{title}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <ol data-reveal="" style={{
              listStyle: 'none', margin: 0, padding: 0, position: 'relative',
              display: 'flex', flexDirection: path.dir, gap: path.gap,
            }}>
              {path.line && <li aria-hidden="true" style={{ position: 'absolute', ...path.line, background: C.goldLight, opacity: 0.6 }} />}
              {k('courses').map((title, i) => (
                <li key={title} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: path.itemDir, gap: 20, alignItems: 'flex-start' }}>
                  <span style={{
                    display: 'block', flex: 'none', width: path.numW, background: C.blueDeep, fontFamily: SLAB, fontWeight: 700,
                    fontSize: 'clamp(44px,4.6vw,60px)', lineHeight: 1, color: C.goldLight, fontVariantNumeric: 'tabular-nums', padding: path.numPad,
                  }}>{i + 1}</span>
                  <span style={{ fontFamily: SLAB, fontWeight: 400, fontSize: isMobile ? 21 : 17, lineHeight: 1.3, color: C.cream, maxWidth: '16ch', paddingTop: path.titlePad }}>{title}</span>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </section>

      {/* 09 Resultados */}
      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(48px,6vw,72px)' }}>
          <Stack>
            <Eyebrow>{k('res_eyebrow')}</Eyebrow>
            <H2>{k('res_title')}</H2>
          </Stack>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: '48px 0' }}>
            {[
              ['person', 'res_participant_title', 'res_participant', { paddingRight: 'clamp(0px,4vw,56px)' }],
              ['building', 'res_institution_title', 'res_institution', isMobile ? {} : { borderLeft: `1px solid ${C.gold}`, paddingLeft: 'clamp(24px,4vw,56px)' }],
            ].map(([icon, title, list, extra]) => (
              <Stack key={list} gap={20} style={extra}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Icon name={icon} size={32} />
                  <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 21, color: C.blueDeep }}>{k(title)}</h3>
                </div>
                <RuleList items={k(list)} render={(it) => it} />
              </Stack>
            ))}
          </div>
        </Container>
      </section>

      {/* 09B La experiencia */}
      <section style={{ background: C.white, padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(56px,7vw,88px)' }}>
          <Stack>
            <Eyebrow>{k('rev_eyebrow')}</Eyebrow>
            <H2>{k('rev_title')}</H2>
          </Stack>
          <div data-reveal="" style={{
            display: 'grid', gap: '40px 32px', alignItems: 'start',
            gridTemplateColumns: wide ? 'minmax(0,1fr) minmax(0,1fr) minmax(0,1.5fr)' : tablet ? 'repeat(2,minmax(0,1fr))' : '1fr',
          }}>
            {k('rev_stats').map((s) => (
              <div key={s.n} style={{ borderLeft: `1px solid ${C.gold}`, paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span data-count={s.n} data-suffix={s.suffix} style={statNum(C.gold, 'clamp(64px,8vw,104px)')}>{fmtNum(s)}</span>
                <span style={{ fontSize: 18, lineHeight: 1.5, maxWidth: '24ch' }}>{s.label}</span>
              </div>
            ))}
            <div style={{
              borderLeft: `1px solid ${C.gold}`, paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 12,
              gridColumn: tablet && !wide ? '1 / -1' : 'auto',
            }}>
              <Icon name="award" size={32} />
              <span style={{ fontFamily: SLAB, fontWeight: 700, fontSize: 'clamp(20px,2vw,24px)', lineHeight: 1.3, color: C.blueDeep }}>{k('rev_top_courses')}</span>
              <span style={{ fontSize: 18, lineHeight: 1.5 }}>{k('rev_top_label')}</span>
            </div>
          </div>
          <figure data-reveal="" style={{
            margin: 0, position: 'relative', background: C.blueDeep, padding: 'clamp(36px,6vw,80px)', display: 'flex', flexDirection: 'column', gap: 32, overflow: 'hidden',
          }}>
            <img src={isotipoWhite} alt="" aria-hidden="true" style={{ position: 'absolute', right: '-4%', bottom: '-18%', height: '130%', width: 'auto', opacity: 0.05, pointerEvents: 'none' }} />
            <span aria-hidden="true" style={{ position: 'relative', display: 'block', width: 48, height: 2, background: C.goldLight }} />
            <blockquote style={{
              position: 'relative', margin: 0, fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(20px,2.2vw,28px)', lineHeight: 1.5, color: C.cream, maxWidth: '60ch', textWrap: 'pretty',
            }}>«{k('rev_featured').text}»</blockquote>
            <figcaption style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px', fontSize: 16, color: C.cream }}>
              <GoldTick color={C.goldLight} />
              <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{k('rev_featured').author}</span>
              <Stars color={C.goldLight} size={16} />
            </figcaption>
          </figure>
          <div data-reveal="" style={{ display: 'grid', gridTemplateColumns: wide ? 'repeat(3,minmax(0,1fr))' : tablet ? 'repeat(2,minmax(0,1fr))' : '1fr', gap: 24 }}>
            {k('reviews').map((r) => (
              <figure key={r.author} className="vlc-review" style={{
                margin: 0, background: C.page, borderTop: `2px solid ${C.gold}`, padding: 'clamp(28px,3vw,36px)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28,
              }}>
                <blockquote style={{ margin: 0, fontSize: 18, lineHeight: 1.65, textWrap: 'pretty' }}>«{r.text}»</blockquote>
                <figcaption style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px', fontSize: 15 }}>
                  <GoldTick />
                  <span style={{ fontWeight: 600, color: C.blueDeep, whiteSpace: 'nowrap' }}>{r.author}</span>
                  <Stars color={C.gold} size={15} />
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* 10 El autor */}
      <section style={{ background: C.blueDeep, color: '#fff', padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'grid', gridTemplateColumns: tablet ? 'minmax(0,1fr) minmax(0,1.2fr)' : '1fr', gap: 'clamp(48px,7vw,96px)', alignItems: tablet ? 'start' : 'center' }}>
          <div data-reveal="" style={{ position: tablet ? 'sticky' : 'relative', top: tablet ? 101 : undefined, alignSelf: 'start', aspectRatio: '4/5', width: '100%' }}>
            <img src={havardImg} alt={k('author_img_alt')} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '54% 30%' }} />
          </div>
          <Stack>
            <Eyebrow dark>{k('author_eyebrow')}</Eyebrow>
            <H2 dark style={{ lineHeight: 1.04 }}>{k('author_name')}</H2>
            <p style={{ margin: 0, fontFamily: SLAB, fontWeight: 400, fontSize: 'clamp(19px,1.8vw,22px)', lineHeight: 1.35, color: C.goldLight }}>{k('author_role')}</p>
            <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, borderTop: '1px solid rgba(250,247,238,.2)' }}>
              {k('author_bio').map((b) => {
                const parts = b.em ? b.text.split(b.em) : [b.text];
                return (
                  <li key={b.icon} style={{
                    padding: '18px 0', borderBottom: '1px solid rgba(250,247,238,.2)', fontSize: 18, lineHeight: 1.6, color: C.cream,
                    display: 'flex', alignItems: 'flex-start', gap: 16,
                  }}>
                    <Icon name={b.icon} color={C.goldLight} style={{ marginTop: 2 }} />
                    <span style={{ maxWidth: '56ch' }}>
                      {parts[0]}{b.em && <em style={{ fontStyle: 'italic' }}>{b.em}</em>}{parts[1]}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 24, marginTop: 20 }}>
              {k('author_stats').map((s) => (
                <div key={s.n} style={{ borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span data-count={s.n} data-prefix={s.prefix} style={{ ...statNum(C.goldLight, 'clamp(34px,4.2vw,58px)'), lineHeight: 0.95, whiteSpace: 'nowrap' }}>{fmtNum(s)}</span>
                  <span style={{ fontSize: 16, color: C.cream }}>{s.label}</span>
                </div>
              ))}
            </div>
          </Stack>
        </Container>
      </section>

      {/* 11 Como se pone en marcha */}
      <section style={{ background: C.page, padding: `${SECTION_Y} 0` }}>
        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(48px,6vw,72px)' }}>
          <Stack>
            <Eyebrow>{k('steps_eyebrow')}</Eyebrow>
            <H2>{k('steps_title')}</H2>
          </Stack>
          <ol data-reveal="" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: cols4, gap: '40px 32px' }}>
            {k('steps').map((s, i) => (
              <li key={s.title} style={{ borderTop: `1px solid ${C.gold}`, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <span aria-hidden="true" style={{ fontFamily: SLAB, fontWeight: 700, fontSize: isMobile ? 44 : 64, lineHeight: 1, color: C.gold }}>{i + 1}</span>
                <h3 style={{ margin: 0, fontFamily: SLAB, fontWeight: 700, fontSize: 21, color: C.blueDeep }}>{s.title}</h3>
                <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>{s.text}</p>
              </li>
            ))}
          </ol>
          <aside data-reveal="" style={{
            background: C.blueDeep, padding: 'clamp(28px,4vw,48px)', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: '20px 48px', alignItems: 'center',
          }}>
            <Eyebrow dark>{k('steps_highlight_eyebrow')}</Eyebrow>
            <p style={{
              margin: 0, borderLeft: `1px solid ${C.goldLight}`, paddingLeft: 24, fontFamily: SLAB, fontWeight: 400,
              fontSize: 'clamp(19px,2vw,24px)', lineHeight: 1.4, color: C.cream, gridColumn: w >= 560 ? 'span 2' : 'auto', minWidth: 0,
            }}>{k('steps_highlight')}</p>
          </aside>
        </Container>
      </section>

      {/* 12 Preguntas frecuentes */}
      <section style={{ background: C.white, padding: `${SECTION_Y} 0` }}>
        <Container max={820} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <div data-reveal=""><H2>{k('faq_title')}</H2></div>
          <div data-reveal="" style={{ borderTop: `1px solid ${C.blueDeep}` }}>
            {k('faqs').map((f, i) => {
              const open = faq === i;
              const panelId = `faq-panel-${i}`;
              return (
                <div key={f.q} style={{ borderBottom: `1px solid ${C.bruma}` }}>
                  <h3 style={{ margin: 0, fontSize: 21 }}>
                    <button type="button" className="vlc-faq-btn" aria-expanded={open} aria-controls={panelId}
                            onClick={() => setFaq(open ? -1 : i)}>
                      <span>{f.q}</span>
                      <span aria-hidden="true" style={{
                        flex: 'none', width: 28, height: 28, border: `1px solid ${C.piedra}`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontFamily: SANS, fontWeight: 400, fontSize: 18, color: C.goldDark,
                      }}>{open ? '−' : '+'}</span>
                    </button>
                  </h3>
                  {open && (
                    <div id={panelId} role="region" style={{ padding: '0 52px 28px 0' }}>
                      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, maxWidth: '62ch' }}>{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 13 CTA final */}
      <section style={{
        position: 'relative', minHeight: wide ? '100svh' : 'auto', background: C.blueNight, color: '#fff', display: 'flex', alignItems: 'center', overflow: 'hidden',
        paddingBottom: isMobile ? 72 : 0,
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <img src={ctaImg} alt={k('final_img_alt')} loading="lazy" style={{
            display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 25%', filter: 'grayscale(.4)',
          }} />
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(15,30,51,.74)' }} />
        <Container max={880} style={{ position: 'relative', width: '100%', paddingTop: 120, paddingBottom: 120 }}>
          <Stack style={{ alignItems: 'center', textAlign: 'center' }}>
            <img src={logoFullWhite} alt={k('final_logo_alt')} loading="lazy" style={{ width: 200, height: 'auto', display: 'block', marginBottom: 16 }} />
            <H2 dark style={{ lineHeight: 1.06, textWrap: 'balance' }}>{k('final_title')}</H2>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: C.cream, maxWidth: '48ch' }}>{k('final_text')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingTop: 8 }}>
              <CtaConversation />
              <BtnPresentation />
            </div>
            <a href={mailConversation} className="vlc-link" data-gtm="contact-lead">{email}</a>
            <GoldTick color={C.goldLight} style={{ marginTop: 12 }} />
            <span style={{ fontFamily: SANS, fontStyle: 'italic', fontWeight: 400, fontSize: 22, letterSpacing: '0.005em', color: C.goldLight, lineHeight: 1.2 }}>
              Igniting Hearts for Greatness
            </span>
          </Stack>
        </Container>
      </section>

      {/* Barra CTA fija en movil */}
      {isMobile && (
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, background: 'rgba(15,30,51,.96)',
          borderTop: '1px solid rgba(201,171,66,.4)', padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        }}>
          <CtaConversation block />
        </div>
      )}

      {/* Modal "Reciba la presentacion completa" */}
      {modal && (
        <div role="dialog" aria-modal="true" aria-labelledby="vlc-modal-title"
             onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
             style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,30,51,.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{
            position: 'relative', background: '#fff', width: '100%', maxWidth: 540, maxHeight: 'calc(100svh - 40px)', overflow: 'auto',
            padding: 'clamp(28px,5vw,48px)', boxSizing: 'border-box', boxShadow: '0 18px 50px rgba(15,30,51,0.20)', borderTop: `2px solid ${C.gold}`,
          }}>
            <button type="button" ref={closeRef} className="vlc-close" aria-label={k('modal_close')} onClick={closeModal}>
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
                  <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6 }}>{k('modal_fallback_text')}</p>
                  <div style={{ marginTop: 12 }}>
                    <a href={mailPresentation} className="vlc-cta" data-gtm="presentation-request">{k('modal_fallback_button')}</a>
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
