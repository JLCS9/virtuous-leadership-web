// Pagina /acreditacion/colegios — version "Acreditacion".
// Estructura de secciones especifica de esta pagina:
//   Hero (eyebrow opcional + h1 + subtitle + sello + foto full-width corta)
//   Objetivos (lista numerada de 4)
//   Que incluye la acreditacion (lista)
//   Destinatarios
//   Testimonios (carousel)
//   Proximos pasos
//
// Las secciones Modalidad y Conceptos clave NO se muestran aqui — viven en
// la pagina /colegios (Programas). Si se necesitan ver fundirse, editar
// ColegiosPrograma.jsx por separado.
import { useEffect, useState } from 'react';
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';
import { useT, LocalLink } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import selloImg     from '../assets/sello.png';
import fondoAlexImg from '../assets/fondo-alex.jpeg';

export default function AcreditacionColegios() {
  const { t } = useT();
  const k = (key) => t(`colegios.${key}`);
  const objetivos     = k('objetivos');
  const entregables   = k('entregables');
  const destinatarios = k('destinatarios');
  const testimonios   = k('testimonios');
  const proceso       = k('proceso');
  const heroTitle     = k('hero_title');

  return (
    <>
      {/* Hero */}
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          {k('eyebrow') && (
            <div style={styles.eyebrow}>{k('eyebrow')}</div>
          )}
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line' }}>{heroTitle}</h1>
          <p style={{ ...styles.paraLarge, maxWidth: 720, margin: '24px auto 0', whiteSpace: 'pre-line' }}>
            {k('hero_subtitle')}
          </p>
          {/* Sello, justo debajo del texto del hero */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <img src={selloImg} alt="Sello Liderazgo Virtuoso"
                 style={{ width: 'min(160px, 40vw)', height: 'auto', display: 'block' }} />
          </div>
        </div>
        {/* Imagen fondo-alex, full-width.
            La foto original es 1600x785 (≈2:1). Para que no recorte la cara de
            Alex pero siga siendo un banner horizontal, fijamos un aspect ratio
            de banner amplio (10/3) y biasamos la cara hacia arriba con
            objectPosition. Asi el alto queda ~360px en pantallas de 1200px y
            la cara queda visible. */}
        <div style={{ width: '100%', lineHeight: 0 }}>
          <img src={fondoAlexImg} alt=""
               loading="lazy"
               style={{
                 width: '100%',
                 aspectRatio: '10 / 4',
                 objectFit: 'cover',
                 objectPosition: 'center top',
                 display: 'block',
               }} />
        </div>
      </section>

      {/* Objetivos — fondo navy */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          {k('objetivos_eyebrow') && (
            <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{k('objetivos_eyebrow')}</div>
          )}
          <h2 style={{ ...styles.h2, color: PAPER, fontSize: 'clamp(34px, 4.6vw, 52px)' }}>{k('objetivos_title')}</h2>
        </div>
        <div className="grid-2x2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{
              padding: '28px 26px',
              background: NAVY_DEEP,
              border: `1px solid ${NAVY_SOFT}`,
              borderTop: `3px solid ${GOLD}`,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 700, color: GOLD, lineHeight: 1 }}>{o.n}</div>
              <h3 style={{ ...styles.h3, color: PAPER, fontSize: 22, marginTop: 12, marginBottom: 10 }}>{o.title}</h3>
              <p style={{ ...styles.para, color: '#C8CFDC', fontSize: 15, margin: 0, flex: 1 }}>{o.text}</p>
              {o.cta && o.cta_to && (
                <LocalLink to={o.cta_to} style={{
                  marginTop: 18,
                  fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600,
                  letterSpacing: '0.04em', color: GOLD,
                  textDecoration: 'none', alignSelf: 'flex-start',
                  borderBottom: `2px solid ${GOLD}`, paddingBottom: 2,
                }}>
                  {o.cta}
                </LocalLink>
              )}
            </div>
          ))}
        </div>
        <style>{`@media (min-width: 720px) { .grid-2x2 { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; } }`}</style>
      </Section>

      {/* Que incluye la acreditacion */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          {k('entregables_eyebrow') && (
            <div style={styles.eyebrow}>{k('entregables_eyebrow')}</div>
          )}
          <h2 style={styles.h2}>{k('entregables_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, maxWidth: 820, margin: '0 auto' }}>
          {entregables.map((e, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr', gap: 20,
              padding: '20px 24px', background: BEIGE, border: `1px solid ${LINE}`,
              alignItems: 'center',
            }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: GOLD_DEEP }}>0{i + 1}</div>
              <div>
                <div style={{ ...styles.para, fontSize: 15, margin: 0 }}>{e}</div>
                {/* CTA solo en item 01: cross-link a la pagina Programa */}
                {i === 0 && k('entregables_cta_label') && k('entregables_cta_to') && (
                  <LocalLink to={k('entregables_cta_to')} style={{
                    display: 'inline-block', marginTop: 10,
                    fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600,
                    letterSpacing: '0.04em', color: NAVY,
                    textDecoration: 'none',
                    borderBottom: `2px solid ${GOLD}`, paddingBottom: 2,
                  }}>
                    {k('entregables_cta_label')}
                  </LocalLink>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Destinatarios — fondo navy */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 16px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{k('destinatarios_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{k('destinatarios_title')}</h2>
          {k('destinatarios_subtitle') && (
            <p style={{ ...styles.paraLarge, color: '#D9DEE8' }}>{k('destinatarios_subtitle')}</p>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 32 }}>
          {destinatarios.map((d, i) => (
            <div key={i} style={{
              padding: '24px 22px',
              background: NAVY_DEEP,
              border: `1px solid ${NAVY_SOFT}`,
              borderTop: `3px solid ${GOLD}`,
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: GOLD }}>{d.n}</div>
              <h3 style={{ ...styles.h3, color: PAPER, fontSize: 22, marginTop: 8, marginBottom: d.text ? 6 : 0 }}>{d.title}</h3>
              {d.text && (
                <p style={{ ...styles.para, color: '#C8CFDC', fontSize: 15, margin: 0 }}>{d.text}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonios */}
      <Section background={PAPER} paddingY={72}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          <div style={styles.eyebrow}>{k('testimonios_eyebrow')}</div>
          <h2 style={styles.h2}>{k('testimonios_title')}</h2>
        </div>
        <TestimoniosCarousel items={testimonios} />
      </Section>

      {/* Proximos pasos */}
      <Section background={NAVY} paddingY={80} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{k('proceso_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{k('proceso_title')}</h2>
        </div>
        <ol style={{ maxWidth: 720, margin: '0 auto', padding: 0, listStyle: 'none' }}>
          {proceso.map((p, i) => (
            <li key={i} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr', gap: 24,
              padding: '20px 0',
              borderBottom: i < proceso.length - 1 ? `1px solid ${NAVY_SOFT}` : 'none',
            }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: GOLD }}>{p.n}</div>
              <div style={{ ...styles.para, color: '#D9DEE8', fontSize: 16, margin: 0, alignSelf: 'center' }}>{p.text}</div>
            </li>
          ))}
        </ol>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <CTA href={`mailto:${t('common.contact_email')}`} variant="primary"
               style={{ background: GOLD, color: NAVY, borderColor: GOLD }}>
            {t('common.request_meeting')}
          </CTA>
        </div>
      </Section>
    </>
  );
}

// ──────────── Carousel de testimonios (reusable) ────────────
function TestimoniosCarousel({ items }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const INTERVAL_MS = 4000;

  useEffect(() => { setIdx(0); }, [items]);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const tt = items[idx];
  if (!tt) return null;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
         style={{ maxWidth: 820, margin: '0 auto' }}>
      <div style={{ position: 'relative', minHeight: 260 }}>
        <blockquote key={idx} style={{
          margin: 0, padding: '40px 44px',
          background: BEIGE, borderLeft: `3px solid ${GOLD}`,
          fontFamily: FONT_SERIF, fontStyle: 'italic',
          fontSize: 'clamp(18px, 2.2vw, 22px)', lineHeight: 1.5, color: NAVY,
          animation: 'fade-in-up 480ms ease',
        }}>
          «{tt.text}»
          <footer style={{
            fontFamily: FONT_SANS, fontStyle: 'normal', fontSize: 13,
            color: MUTED, marginTop: 18, letterSpacing: '0.04em',
          }}>
            — <strong style={{ color: NAVY }}>{tt.author}</strong>, {tt.role}
          </footer>
        </blockquote>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22 }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
                  aria-label={`Testimonio ${i + 1}`}
                  style={{
                    width: i === idx ? 24 : 8, height: 8,
                    border: 'none', padding: 0,
                    background: i === idx ? GOLD : LINE,
                    borderRadius: 4, cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }} />
        ))}
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Reusable por si alguna pagina vuelve a necesitar Modalidad (Programas)
export function FactRow({ label, value, detail, last, dark }) {
  const labelColor  = dark ? GOLD : GOLD_DEEP;
  const valueColor  = dark ? PAPER : NAVY;
  const detailColor = dark ? '#C8CFDC' : MUTED;
  const borderColor = dark ? NAVY_SOFT : LINE;
  return (
    <div className="fact-row" style={{
      display: 'grid', gridTemplateColumns: '1fr', gap: 8,
      padding: '20px 24px',
      borderBottom: last ? 'none' : `1px solid ${borderColor}`,
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: labelColor, fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 600, color: valueColor, marginTop: 2 }}>
          {value}
        </div>
      </div>
      <div style={{ fontFamily: FONT_SANS, fontSize: 14, color: detailColor, lineHeight: 1.55 }}>
        {detail}
      </div>
      <style>{`
        @media (min-width: 720px) {
          .fact-row { grid-template-columns: 220px 1fr !important; gap: 32px !important; padding: 22px 32px !important; }
        }
      `}</style>
    </div>
  );
}

export { TestimoniosCarousel };
