import { NAVY, GOLD, GOLD_DEEP, PAPER, BEIGE, LINE, FONT_SERIF, FONT_SANS } from '../theme';
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
          {/* Sólo eyebrow "CONTACT/CONTACTO/..." un poco más grande.
              Quitamos hero_title (Hablemos/Let's talk/...) y hero_subtitle
              (largo explicativo). Las claves i18n se mantienen por si
              hace falta restaurar la versión anterior. */}
          <div style={{
            fontFamily: FONT_SERIF,
            fontSize: 'clamp(28px, 4.5vw, 44px)',
            color: NAVY,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {t('contacto.eyebrow')}
          </div>
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
          {/* Nota de idiomas ("Disponible en español, francés, ...") quitada. */}
          <div style={{ marginTop: 24 }}>
            <CTA href={`mailto:${email}`} variant="primary" dataGtm="contact-lead">{t('common.write_email')}</CTA>
          </div>
        </div>
      </Section>
    </>
  );
}
