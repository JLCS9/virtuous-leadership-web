// Pagina /educacion-superior (Formacion Profesional). Estructura clonada de
// /universidades a partir de la foto: hero propio + foto class + Contenido
// (reusa universidades.conceptos) + Modalidad (reusa universidades.modalidad)
// + CTA final propia de edsup.
//
// Las claves antiguas (edsup.tipos, edsup.objetivos, edsup.formato,
// edsup.participantes, edsup.diff_*, edsup.cert_*) siguen en i18n por si en
// el futuro se quiere reactivar algun bloque, pero no se renderizan.
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, LINE, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import { FactRow } from './AcreditacionColegios';
import classImg from '../assets/class.jpeg';

export default function AcreditacionEducacionSuperior() {
  const { t } = useT();
  // Comparte contenido con la pagina /universidades.
  const conceptos = t('universidades.conceptos');
  const modalidad = t('universidades.modalidad');
  const heroTitle = t('edsup.hero_title');

  return (
    <>
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          {t('edsup.eyebrow') && (
            <div style={styles.eyebrow}>{t('edsup.eyebrow')}</div>
          )}
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line', fontSize: 'clamp(26px, 4vw, 44px)' }}>
            {heroTitle}
          </h1>
          <p style={{ ...styles.paraLarge, maxWidth: 760, margin: '24px auto 0', whiteSpace: 'pre-line' }}>
            {t('edsup.hero_subtitle')}
          </p>
        </div>
        {/* Foto full-width tras el hero (igual que /universidades) */}
        <div style={{ width: '100%', lineHeight: 0 }}>
          <img src={classImg} alt=""
               loading="lazy"
               style={{
                 width: '100%',
                 aspectRatio: '10 / 4',
                 objectFit: 'cover',
                 objectPosition: 'center',
                 display: 'block',
               }} />
        </div>
      </section>

      {/* Contenido (reusa universidades.conceptos — 7 cards) */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          {t('universidades.conceptos_eyebrow') && (
            <div style={styles.eyebrow}>{t('universidades.conceptos_eyebrow')}</div>
          )}
          <h2 style={{ ...styles.h2, fontSize: 'clamp(34px, 4.6vw, 52px)' }}>{t('universidades.conceptos_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {conceptos.map((c, i) => (
            <div key={i} style={{
              padding: '24px 26px', background: BEIGE,
              border: `1px solid ${LINE}`, borderTop: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, fontSize: 20, marginBottom: 8 }}>{c.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Modalidad — FactRow filas (reusa universidades.modalidad) */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{t('universidades.modalidad_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('universidades.modalidad_title')}</h2>
        </div>
        <div style={{ background: NAVY_DEEP, border: `1px solid ${NAVY_SOFT}`, maxWidth: 820, margin: '0 auto' }}>
          {modalidad.map((m, i) => (
            <FactRow key={i} dark
                     label={m.label} value={m.value} detail={m.detail}
                     last={i === modalidad.length - 1} />
          ))}
        </div>
      </Section>

      {/* CTA final — texto propio de edsup */}
      <Section background={NAVY} paddingY={64} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('edsup.cta_title')}</h2>
          <p style={{ ...styles.paraLarge, color: '#D9DEE8' }}>{t('edsup.cta_text')}</p>
          <div style={{ marginTop: 24 }}>
            <CTA href={`mailto:${t('common.contact_email')}`} variant="primary"
                 style={{ background: GOLD, color: NAVY, borderColor: GOLD }}>
              {t('common.request_meeting')}
            </CTA>
          </div>
        </div>
      </Section>
    </>
  );
}
