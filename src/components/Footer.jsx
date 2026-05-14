import { NAVY, GOLD, PAPER, BEIGE, LINE, MUTED, FONT_SERIF, FONT_SANS, MAX_WIDTH } from '../theme';
import { useT, LocalLink } from '../i18n';
import Seal from './Seal';

export default function Footer() {
  const { t } = useT();
  const email = t('common.contact_email');

  return (
    <footer style={{ background: NAVY, color: '#D9DEE8' }}>
      <div style={{
        maxWidth: MAX_WIDTH, margin: '0 auto', padding: '56px 24px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Seal size={56} />
            <div>
              <div style={{ fontFamily: FONT_SERIF, fontWeight: 700, fontSize: 18, color: PAPER, letterSpacing: '0.04em' }}>
                Virtuous Leadership<sup style={{ fontSize: '0.55em', verticalAlign: 'super', marginLeft: 1 }}>®</sup>
              </div>
              <div style={{ fontFamily: FONT_SERIF, fontSize: 13, fontStyle: 'italic', color: GOLD, marginTop: 4 }}>
                {t('footer.tagline')}
              </div>
            </div>
          </div>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, lineHeight: 1.6, marginTop: 18, color: '#A8B0BF' }}>
            {t('footer.description')}
          </p>
        </div>

        <div>
          <h4 style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, margin: '0 0 14px 0' }}>
            {t('nav.programs')}
          </h4>
          <FootLink to="/acreditacion/colegios">{t('nav.schools')}</FootLink>
          <FootLink to="/universidades">{t('nav.universities')}</FootLink>
          <FootLink to="/educacion-superior">{t('nav.higher_ed')}</FootLink>
        </div>

        <div>
          <h4 style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, margin: '0 0 14px 0' }}>
            {t('footer.tests_heading')}
          </h4>
          <FootLink to="/tests">{t('footer.all_tests')}</FootLink>
          <FootLink to="/tests/temperamento">{t('footer.temperament_test')}</FootLink>
        </div>

        <div>
          <h4 style={{ fontFamily: FONT_SANS, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD, fontWeight: 600, margin: '0 0 14px 0' }}>
            {t('footer.contact_heading')}
          </h4>
          <a href={`mailto:${email}`}
             style={{ fontFamily: FONT_SANS, fontSize: 14, color: PAPER, textDecoration: 'none', display: 'block', marginBottom: 8 }}>
            {email}
          </a>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: '#A8B0BF', margin: '6px 0 0 0', lineHeight: 1.6 }}>
            {t('footer.languages_note')}
          </p>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        maxWidth: MAX_WIDTH, margin: '0 auto', padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 12, alignItems: 'center',
        fontFamily: FONT_SANS, fontSize: 12, color: '#7C8497',
      }}>
        <div>© {new Date().getFullYear()} Virtuous Leadership. {t('footer.copyright_suffix')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <LegalLink to="/politica-de-privacidad">{t('footer.privacy_link')}</LegalLink>
          <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.16)' }}>·</span>
          <LegalLink to="/cookies">{t('footer.cookies_link')}</LegalLink>
        </div>
        <div>{t('footer.havard_credit')}</div>
      </div>
    </footer>
  );
}

function FootLink({ to, children }) {
  return (
    <LocalLink
      to={to}
      style={{
        display: 'block',
        fontFamily: FONT_SANS, fontSize: 14, color: '#D9DEE8',
        textDecoration: 'none', padding: '4px 0',
      }}
      onMouseOver={e => e.currentTarget.style.color = GOLD}
      onMouseOut={e => e.currentTarget.style.color = '#D9DEE8'}
    >
      {children}
    </LocalLink>
  );
}

// Estilo más discreto para enlaces legales en la barra inferior — color
// muted en línea con el copyright. Usa LocalLink para que el slug se
// traduzca automáticamente al idioma activo.
function LegalLink({ to, children }) {
  return (
    <LocalLink
      to={to}
      style={{
        fontFamily: FONT_SANS, fontSize: 12, color: '#7C8497',
        textDecoration: 'none',
      }}
      onMouseOver={e => e.currentTarget.style.color = GOLD}
      onMouseOut={e => e.currentTarget.style.color = '#7C8497'}
    >
      {children}
    </LocalLink>
  );
}
