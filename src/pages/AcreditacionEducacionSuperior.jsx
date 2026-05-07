import { Link } from 'react-router-dom';
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';

export default function AcreditacionEducacionSuperior() {
  const { t } = useT();
  const tipos        = t('edsup.tipos');
  const objetivos    = t('edsup.objetivos');
  const formato      = t('edsup.formato');
  const participantes = t('edsup.participantes');
  const heroTitle    = t('edsup.hero_title');

  return (
    <>
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <Link to="/acreditacion" style={{ fontFamily: FONT_SANS, fontSize: 13, color: MUTED, textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
            {t('common.back_to_accreditation')}
          </Link>
          <div style={styles.eyebrow}>{t('edsup.eyebrow')}</div>
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line' }}>{heroTitle}</h1>
          <p style={{ ...styles.paraLarge, maxWidth: 760, margin: '24px auto 0' }}>{t('edsup.hero_subtitle')}</p>
        </div>
      </section>

      {/* Tipos */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={styles.eyebrow}>{t('edsup.tipos_eyebrow')}</div>
          <h2 style={styles.h2}>{t('edsup.tipos_title')}</h2>
          <p style={{ ...styles.para, fontSize: 17, marginTop: 16 }}>{t('edsup.tipos_subtitle')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {tipos.map((t2, i) => (
            <div key={i} style={{
              padding: '24px 26px', background: BEIGE,
              border: `1px solid ${LINE}`, borderLeft: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, fontSize: 20, marginBottom: 8 }}>{t2.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{t2.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Objetivos navy */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{t('edsup.objetivos_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('edsup.objetivos_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {objetivos.map((o, i) => (
            <div key={i} style={{
              padding: '32px 28px', background: NAVY_DEEP,
              border: `1px solid ${NAVY_SOFT}`, borderTop: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, color: PAPER, fontSize: 22, marginBottom: 10 }}>{o.title}</h3>
              <p style={{ ...styles.para, color: '#C8CFDC', fontSize: 15, margin: 0 }}>{o.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Modalidad */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={styles.eyebrow}>{t('edsup.modalidad_eyebrow')}</div>
          <h2 style={styles.h2}>{t('edsup.modalidad_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {formato.map((f, i) => (
            <div key={i} style={{ padding: '32px 28px', background: BEIGE, border: `1px solid ${LINE}` }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD_DEEP, fontWeight: 600, marginBottom: 14 }}>
                {f.label}
              </div>
              <h3 style={{ ...styles.h3, fontSize: 22, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{f.text}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: '24px 28px', background: BEIGE, borderLeft: `3px solid ${GOLD}` }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD_DEEP, fontWeight: 600 }}>
            {t('edsup.cert_label')}
          </div>
          <p style={{ ...styles.para, marginTop: 8, marginBottom: 0, fontSize: 16 }}>{t('edsup.cert_text')}</p>
        </div>
      </Section>

      {/* Participantes */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{t('edsup.participantes_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('edsup.participantes_title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {participantes.map((p, i) => (
            <div key={i} style={{
              padding: '24px 26px', background: NAVY_DEEP,
              border: `1px solid ${NAVY_SOFT}`, borderLeft: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, color: PAPER, fontSize: 22, marginBottom: 8 }}>{p.title}</h3>
              <p style={{ ...styles.para, color: '#C8CFDC', fontSize: 15, margin: 0 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Diferencia con universidades */}
      <Section background={PAPER} paddingY={64} narrow>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.eyebrow}>{t('edsup.diff_eyebrow')}</div>
          <h2 style={{ ...styles.h2, fontSize: 28 }}>{t('edsup.diff_title')}</h2>
          <p style={{ ...styles.para, marginTop: 16, fontSize: 17 }}>
            {t('edsup.diff_text_1').split(t('edsup.diff_link'))[0]}
            <Link to="/acreditacion/universidades" style={{ color: NAVY, fontWeight: 600 }}>
              {t('edsup.diff_link')}
            </Link>
            {t('edsup.diff_text_1').split(t('edsup.diff_link'))[1] || ''}
          </p>
          <p style={{ ...styles.para, fontSize: 15, color: MUTED }}>
            {t('edsup.diff_text_2')}
          </p>
        </div>
      </Section>

      {/* CTA */}
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
