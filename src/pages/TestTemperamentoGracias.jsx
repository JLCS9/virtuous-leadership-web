// Página de agradecimiento tras completar el test de temperamento (adultos).
// Mensaje breve: gracias + aviso de que el resultado llegará por email.
//
// Va SIN Layout (en NO_LAYOUT_PAGES de routes.js) — sin header/menu/footer
// del sitio. La página es full-bleed: fondo BEIGE cubriendo todo el viewport,
// contenido centrado verticalmente. Los CTAs internos cubren la navegación.
//
// SEO: noindex porque es una landing post-formulario sin valor para
// buscadores.

import { LocalLink as Link } from '../i18n';
import { useT } from '../i18n';
import SEO from '../components/SEO';
import {
  NAVY, NAVY_SOFT, GOLD, GOLD_DEEP,
  PAPER, BEIGE, INK, LINE,
  styles,
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

      {/* Full-bleed wrapper: ocupa al menos toda la altura del viewport,
          centrado vertical. Sin Layout encima. */}
      <main style={{
        minHeight: '100vh',
        background: BEIGE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>

          {/* Eyebrow */}
          <div style={{ ...styles.eyebrow, color: GOLD_DEEP, marginBottom: 18 }}>
            {t('test_gracias.eyebrow')}
          </div>

          {/* Sin h1 "Gracias" por petición. La intro asume el rol de
              encabezado principal — tamaño un poco mayor para compensar
              y dar peso visual a la página. */}
          <h1 style={{
            ...styles.h2,
            fontSize: 'clamp(28px, 4.4vw, 44px)',
            margin: '0 auto',
            maxWidth: 640,
            lineHeight: 1.2,
          }}>
            {t('test_gracias.intro')}
          </h1>

          {/* Email note card — todo centrado */}
          <div style={{
            marginTop: 36,
            padding: '24px 28px',
            background: PAPER,
            border: `1px solid ${LINE}`,
            borderLeft: `3px solid ${GOLD}`,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: 580,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <div style={{
              fontSize: 20, lineHeight: 1, marginBottom: 12,
            }} aria-hidden="true">
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
      </main>
    </>
  );
}
