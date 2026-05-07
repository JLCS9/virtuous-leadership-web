import { NAVY, GOLD, GOLD_DEEP, PAPER, BEIGE, MUTED, LINE, FONT_SERIF, FONT_SANS, styles } from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';

export default function Contacto() {
  const { t } = useT();
  const email = t('common.contact_email');

  return (
    <>
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 740, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <div style={styles.eyebrow}>{t('contacto.eyebrow')}</div>
          <h1 style={styles.h1}>{t('contacto.hero_title')}</h1>
          <p style={{ ...styles.paraLarge, marginTop: 16 }}>{t('contacto.hero_subtitle')}</p>
        </div>
      </section>

      <Section background={PAPER} paddingY={64} narrow>
        <div style={{
          padding: '40px 36px', background: BEIGE,
          border: `1px solid ${LINE}`, borderLeft: `3px solid ${GOLD}`,
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD_DEEP, fontWeight: 600 }}>
            {t('contacto.email_label')}
          </div>
          <a href={`mailto:${email}`} style={{
            display: 'inline-block', marginTop: 12,
            fontFamily: FONT_SERIF, fontSize: 'clamp(20px, 3vw, 28px)',
            color: NAVY, textDecoration: 'none', fontWeight: 600,
          }}>
            {email}
          </a>
          <p style={{ ...styles.para, marginTop: 18, fontSize: 14, color: MUTED }}>
            {t('contacto.languages_note')}
          </p>
          <div style={{ marginTop: 24 }}>
            <CTA href={`mailto:${email}`} variant="primary">{t('common.write_email')}</CTA>
          </div>
        </div>
      </Section>
    </>
  );
}
