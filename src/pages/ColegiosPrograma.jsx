// Pagina /colegios — version "Programa".
// Estructura especifica de Programas:
//   Hero (eyebrow + h1 + subtitle + foto colegios full-width corta) — SIN sello
//   Modalidad (FactRow * N)
//   Conceptos clave del programa
//   Destinatarios (sincronizado con la pagina de Acreditacion)
//   Testimonios (carousel)
//   Proximos pasos
//
// Las secciones Objetivos y "Que incluye la acreditacion" NO se muestran aqui
// — viven en la pagina /acreditacion/colegios. Si en algun momento se quiere
// añadirlas aqui, copiar los bloques desde AcreditacionColegios.jsx.
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, LINE,
  FONT_SERIF, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import { TestimoniosCarousel, FactRow } from './AcreditacionColegios';
import fondoAlexImg from '../assets/fondo-alex.jpeg';

export default function ColegiosPrograma() {
  const { t } = useT();
  const k = (key) => t(`colegios_prog.${key}`);
  const modalidad     = k('modalidad');
  const conceptos     = k('conceptos');
  const testimonios   = k('testimonios');
  const proceso       = k('proceso');
  const heroTitle     = k('hero_title');

  return (
    <>
      {/* Hero — sin sello */}
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          {k('eyebrow') && (
            <div style={styles.eyebrow}>{k('eyebrow')}</div>
          )}
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line' }}>{heroTitle}</h1>
          <p style={{ ...styles.paraLarge, maxWidth: 720, margin: '24px auto 0', whiteSpace: 'pre-line' }}>
            {k('hero_subtitle')}
          </p>
        </div>
        {/* Imagen fondo-alex, misma que en /acreditacion/colegios */}
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


      {/* Conceptos clave — fondo claro, sin eyebrow */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <h2 style={styles.h2}>{k('conceptos_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {conceptos.map((c, i) => (
            <div key={i} style={{
              padding: '24px 26px', background: BEIGE,
              border: `1px solid ${LINE}`, borderLeft: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, fontSize: 20, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
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
          {k('proceso_eyebrow') && (
            <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{k('proceso_eyebrow')}</div>
          )}
          <h2 style={{ ...styles.h2, color: PAPER, fontSize: 'clamp(34px, 4.6vw, 52px)' }}>{k('proceso_title')}</h2>
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
