import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import selloImg    from '../assets/sello.jpeg';
import colegiosImg from '../assets/colegios.jpeg';

/**
 * Renderiza la pagina de Colegios usando el namespace i18n indicado en `ns`.
 * Por defecto usa 'colegios' (pagina /acreditacion/colegios). Para /colegios
 * (Programas) se pasa ns="colegios_prog" — los textos viven en una rama i18n
 * separada para poder editarlos de forma independiente.
 */
export default function AcreditacionColegios({ ns = 'colegios' } = {}) {
  const { t } = useT();
  const k = (key) => t(`${ns}.${key}`);
  const objetivos     = k('objetivos');
  const modalidad     = k('modalidad');
  const entregables   = k('entregables');
  const conceptos     = k('conceptos');
  const destinatarios = k('destinatarios');
  const testimonios   = k('testimonios');
  const proceso       = k('proceso');
  const heroTitle     = k('hero_title');

  return (
    <>
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          {k('eyebrow') && (
            <div style={styles.eyebrow}>{k('eyebrow')}</div>
          )}
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line' }}>{heroTitle}</h1>
          <p style={{ ...styles.paraLarge, maxWidth: 720, margin: '24px auto 0' }}>
            {k('hero_subtitle')}
          </p>
          {/* Sello, justo debajo del texto del hero */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <img src={selloImg} alt="Sello Liderazgo Virtuoso"
                 style={{ width: 'min(160px, 40vw)', height: 'auto', display: 'block' }} />
          </div>
        </div>
        {/* Imagen colegios, centrada (no full-width) tras el bloque hero */}
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px 56px' }}>
          <img src={colegiosImg} alt=""
               loading="lazy"
               style={{ width: '100%', maxHeight: 460, objectFit: 'cover', display: 'block' }} />
        </div>
      </section>

      {/* Objetivos */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          {k('objetivos_eyebrow') && (
            <div style={styles.eyebrow}>{k('objetivos_eyebrow')}</div>
          )}
          <h2 style={{ ...styles.h2, fontSize: 'clamp(34px, 4.6vw, 52px)' }}>{k('objetivos_title')}</h2>
        </div>
        <div className="grid-2x2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{ padding: '28px 26px', background: BEIGE, border: `1px solid ${LINE}` }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 32, fontWeight: 700, color: GOLD_DEEP, lineHeight: 1 }}>{o.n}</div>
              <h3 style={{ ...styles.h3, fontSize: 22, marginTop: 12, marginBottom: 10 }}>{o.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{o.text}</p>
            </div>
          ))}
        </div>
        <style>{`@media (min-width: 720px) { .grid-2x2 { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; } }`}</style>
      </Section>

      {/* Modalidad — fondo navy */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{k('modalidad_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{k('modalidad_title')}</h2>
        </div>
        <div style={{ background: NAVY_DEEP, border: `1px solid ${NAVY_SOFT}`, maxWidth: 820, margin: '0 auto' }}>
          {modalidad.map((m, i) => (
            <FactRow key={i} dark
                     label={m.label} value={m.value} detail={m.detail}
                     last={i === modalidad.length - 1} />
          ))}
        </div>
      </Section>

      {/* Entregables */}
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
            }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 28, fontWeight: 700, color: GOLD_DEEP }}>0{i + 1}</div>
              <div style={{ ...styles.para, fontSize: 15, margin: 0, alignSelf: 'center' }}>{e}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Cuerpo doctrinal */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{k('conceptos_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{k('conceptos_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {conceptos.map((c, i) => (
            <div key={i} style={{
              padding: '24px 26px', background: NAVY_DEEP,
              border: `1px solid ${NAVY_SOFT}`, borderLeft: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, color: PAPER, fontSize: 20, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ ...styles.para, color: '#C8CFDC', fontSize: 15, margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Destinatarios */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 16px' }}>
          <div style={styles.eyebrow}>{k('destinatarios_eyebrow')}</div>
          <h2 style={styles.h2}>{k('destinatarios_title')}</h2>
          <p style={styles.paraLarge}>{k('destinatarios_subtitle')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 32 }}>
          {destinatarios.map((d, i) => (
            <div key={i} style={{
              padding: '24px 22px', background: BEIGE, border: `1px solid ${LINE}`,
              borderTop: `3px solid ${GOLD}`, textAlign: 'center',
            }}>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 24, fontWeight: 700, color: GOLD_DEEP }}>{d.n}</div>
              <h3 style={{ ...styles.h3, fontSize: 22, marginTop: 8, marginBottom: 6 }}>{d.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{d.text}</p>
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

      {/* Próximos pasos */}
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

function FactRow({ label, value, detail, last, dark }) {
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

function TestimoniosCarousel({ items }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const INTERVAL_MS = 4000;

  useEffect(() => {
    setIdx(0); // reset cuando cambian los items (ej. al cambiar de idioma)
  }, [items]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  const tt = items[idx];
  if (!tt) return null;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ maxWidth: 820, margin: '0 auto' }}
    >
      <div style={{ position: 'relative', minHeight: 260 }}>
        <blockquote
          key={idx}
          style={{
            margin: 0,
            padding: '40px 44px',
            background: BEIGE,
            borderLeft: `3px solid ${GOLD}`,
            fontFamily: FONT_SERIF, fontStyle: 'italic',
            fontSize: 'clamp(18px, 2.2vw, 22px)', lineHeight: 1.5, color: NAVY,
            animation: 'fade-in-up 480ms ease',
          }}
        >
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
