// Página de agradecimiento tras completar el test de temperamento (adultos).
// Mensaje breve: gracias + aviso de que el resultado llegará por email.
// Va con Layout normal (no NO_LAYOUT) — el usuario probablemente quiera
// navegar al resto del sitio desde aquí, así que mantenemos la cabecera.
//
// SEO: noindex porque es una landing post-formulario sin valor para
// buscadores.

import { LocalLink as Link } from '../i18n';
import { useT } from '../i18n';
import SEO from '../components/SEO';
import Section from '../components/Section';
import {
  NAVY, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';

const PAGE_PATH_FALLBACK = '/tests/temperamento/gracias';

export default function TestTemperamentoGracias() {
  const { t } = useT();

  return (
    <>
      <SEO
        title={`${t('test_gracias.title')} | Virtuous Leadership`}
        description={t('test_gracias.intro')}
        path={PAGE_PATH_FALLBACK}
        noindex={true}
      />

      <Section background={BEIGE} paddingY={96}>
        <div style={{
          maxWidth: 720, margin: '0 auto', textAlign: 'center',
          padding: '24px',
        }}>
          {/* Eyebrow */}
          <div style={{ ...styles.eyebrow, color: GOLD_DEEP, marginBottom: 18 }}>
            {t('test_gracias.eyebrow')}
          </div>

          {/* Big title */}
          <h1 style={{
            ...styles.h1,
            fontSize: 'clamp(40px, 6vw, 64px)',
            margin: 0,
          }}>
            {t('test_gracias.title')}
          </h1>

          {/* Intro */}
          <p style={{
            ...styles.paraLarge,
            margin: '20px auto 0',
            maxWidth: 580,
          }}>
            {t('test_gracias.intro')}
          </p>

          {/* Email note inside a soft card */}
          <div style={{
            marginTop: 36,
            padding: '24px 28px',
            background: PAPER,
            border: `1px solid ${LINE}`,
            borderLeft: `3px solid ${GOLD}`,
            borderRadius: 2,
            textAlign: 'left',
            maxWidth: 580,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <div style={{
              fontFamily: FONT_SANS, fontSize: 11,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: GOLD_DEEP, fontWeight: 600, marginBottom: 10,
            }}>
              {/* small label icon-like — uses email_label conceptually */}
              📧
            </div>
            <p style={{
              ...styles.para,
              margin: 0, fontSize: 15, color: INK,
            }}>
              {t('test_gracias.email_note')}
            </p>
          </div>

          {/* CTAs */}
          <div style={{
            marginTop: 40,
            display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <Link to="/" style={{ ...styles.buttonPrimary, textDecoration: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.background = NAVY_SOFT)}
                  onMouseOut={e => (e.currentTarget.style.background = NAVY)}>
              {t('test_gracias.cta_home')}
            </Link>
            <Link to="/tests" style={{ ...styles.buttonSecondary, textDecoration: 'none' }}
                  onMouseOver={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = PAPER; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}>
              {t('test_gracias.cta_other_tests')}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
