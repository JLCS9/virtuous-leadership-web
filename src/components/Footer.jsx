import { NAVY, NAVY_DEEP, PAPER, FONT_SLAB, FONT_BODY, GOLD_REF, GOLD_REF_LT, MAX_WIDTH } from '../theme';
import { useT, LocalLink } from '../i18n';
import Seal from './Seal';

const C = {
  blueNight: NAVY_DEEP,
  blueDeep: NAVY,
  gold: GOLD_REF,
  goldLight: GOLD_REF_LT,
  cream: PAPER,
};
const SLAB = FONT_SLAB;
const SANS = FONT_BODY;

export default function Footer() {
  const { t } = useT();

  return (
    <footer style={{ background: C.blueNight, color: '#D9DEE8' }}>
      <div style={{
        maxWidth: MAX_WIDTH, margin: '0 auto', padding: '56px 24px 24px',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px 48px',
      }}>
        <div style={{ flex: '0 1 320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Seal size={56} />
            <div>
              <div style={{ fontFamily: SLAB, fontWeight: 700, fontSize: 18, color: PAPER, letterSpacing: '0.04em' }}>
                Virtuous Leadership<sup style={{ fontSize: '0.55em', verticalAlign: 'super', marginLeft: 1 }}>®</sup>
              </div>
              <div style={{ fontFamily: SLAB, fontSize: 13, fontStyle: 'italic', color: C.goldLight, marginTop: 4 }}>
                {t('footer.tagline')}
              </div>
            </div>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.6, marginTop: 18, color: '#A8B0BF' }}>
            {t('footer.description')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.goldLight, fontWeight: 600, margin: '0 0 14px 0' }}>
              {t('footer.tests_heading')}
            </h4>
            <FootLink to="/tests/temperamento">{t('footer.temperament_test')}</FootLink>
            <FootLink to="/tests/caracter">{t('footer.character_test')}</FootLink>
            <FootLink to="/tests/corazon-libre">{t('footer.heart_test')}</FootLink>
          </div>

          <div>
            <h4 style={{ fontFamily: SANS, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.goldLight, fontWeight: 600, margin: '0 0 14px 0' }}>
              {t('footer.contact_heading')}
            </h4>
            <button
              onClick={() => window.dispatchEvent(new Event('open-contact-modal'))}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                fontFamily: SANS, fontSize: 14, color: PAPER,
                textDecoration: 'underline', textUnderlineOffset: 3,
                display: 'block', marginBottom: 8, textAlign: 'left',
              }}
              onMouseOver={e => e.currentTarget.style.color = C.goldLight}
              onMouseOut={e => e.currentTarget.style.color = PAPER}
            >
              {t('footer.contact_cta')}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        maxWidth: MAX_WIDTH, margin: '0 auto', padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: 12, alignItems: 'center',
        fontFamily: SANS, fontSize: 12, color: '#7C8497',
      }}>
        <div>© {new Date().getFullYear()} Virtuous Leadership. {t('footer.copyright_suffix')}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
          <LegalLink to="/politica-de-privacidad">{t('footer.privacy_link')}</LegalLink>
          <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.16)' }}>·</span>
          <LegalLink to="/cookies">{t('footer.cookies_link')}</LegalLink>
          <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.16)' }}>·</span>
          <LegalLink to="/aviso-legal">{t('footer.legal_notice')}</LegalLink>
        </div>
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
        fontFamily: SANS, fontSize: 14, color: '#D9DEE8',
        textDecoration: 'none', padding: '4px 0',
      }}
      onMouseOver={e => e.currentTarget.style.color = C.goldLight}
      onMouseOut={e => e.currentTarget.style.color = '#D9DEE8'}
    >
      {children}
    </LocalLink>
  );
}

function LegalLink({ to, children }) {
  return (
    <LocalLink
      to={to}
      style={{
        fontFamily: SANS, fontSize: 12, color: '#7C8497',
        textDecoration: 'none',
      }}
      onMouseOver={e => e.currentTarget.style.color = C.goldLight}
      onMouseOut={e => e.currentTarget.style.color = '#7C8497'}
    >
      {children}
    </LocalLink>
  );
}
