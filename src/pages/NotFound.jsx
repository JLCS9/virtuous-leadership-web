import { Link } from 'react-router-dom';
import { NAVY, GOLD, BEIGE, PAPER, MUTED, FONT_SERIF, FONT_SANS, styles } from '../theme';
import { useT } from '../i18n';

export default function NotFound() {
  const { t } = useT();
  return (
    <section style={{ background: BEIGE, padding: '96px 24px', textAlign: 'center', minHeight: '60vh' }}>
      <div style={{ fontFamily: FONT_SERIF, fontSize: 96, fontWeight: 700, color: GOLD, lineHeight: 1 }}>404</div>
      <h1 style={{ ...styles.h1, fontSize: 32, marginTop: 16 }}>{t('not_found.title')}</h1>
      <p style={{ fontFamily: FONT_SANS, color: MUTED, marginTop: 12 }}>{t('not_found.text')}</p>
      <div style={{ marginTop: 28 }}>
        <Link to="/" style={{ ...styles.buttonPrimary }}>{t('not_found.button')}</Link>
      </div>
    </section>
  );
}
