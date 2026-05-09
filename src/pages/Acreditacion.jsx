import { Link } from 'react-router-dom';
import {
  NAVY, NAVY_DEEP, NAVY_SOFT, GOLD, GOLD_SOFT, GOLD_DEEP,
  PAPER, BEIGE, INK, MUTED, LINE,
  FONT_SERIF, FONT_SANS, styles,
} from '../theme';
import { useT } from '../i18n';
import Section from '../components/Section';
import CTA from '../components/CTA';
import Seal from '../components/Seal';
import SEO from '../components/SEO';
const PAGE_SEO = {
  es: { title: 'Acreditación oficial en Liderazgo Virtuoso', description: 'Sello internacional firmado por Alexandre Havard. Building character en la cultura de tu institución educativa: programas para colegios, universidades y centros superiores.' },
  en: { title: 'Official Virtuous Leadership Certification',  description: 'International seal signed by Alexandre Havard. Building character in your institution\'s culture: programs for schools, universities and higher education centers.' },
  fr: { title: 'Accréditation officielle en Leadership Vertueux', description: 'Sceau international signé par Alexandre Havard. Building character dans la culture de ton institution éducative.' },
};

export default function Acreditacion() {
  const { t, lang } = useT();
  const diff_items = t('acreditacion.diff_items');
  const audiences  = t('acreditacion.audiences');
  const heroTitle  = t('acreditacion.hero_title');
  const seo = PAGE_SEO[lang] || PAGE_SEO.es;

  return (
    <>
      <SEO title={seo.title} description={seo.description} path="/acreditacion" />
      <section style={{ background: BEIGE, borderBottom: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '72px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Seal size={120} />
          </div>
          <div style={styles.eyebrow}>{t('acreditacion.eyebrow')}</div>
          <h1 style={{ ...styles.h1, whiteSpace: 'pre-line' }}>{heroTitle}</h1>
          <p style={{ ...styles.paraLarge, maxWidth: 720, margin: '24px auto 0' }}>
            {t('acreditacion.hero_subtitle')}
          </p>
        </div>
      </section>

      {/* Diferenciadores */}
      <Section background={PAPER} paddingY={88}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={styles.eyebrow}>{t('acreditacion.diff_eyebrow')}</div>
          <h2 style={styles.h2}>{t('acreditacion.diff_title')}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {diff_items.map((c, i) => (
            <div key={i} style={{
              padding: '28px 24px', background: BEIGE,
              border: `1px solid ${LINE}`, borderTop: `3px solid ${GOLD}`,
            }}>
              <h3 style={{ ...styles.h3, fontSize: 22, marginBottom: 10 }}>{c.title}</h3>
              <p style={{ ...styles.para, fontSize: 15, margin: 0 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Selector */}
      <Section background={NAVY} paddingY={88} style={{ color: PAPER }}>
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div style={{ ...styles.eyebrow, color: GOLD_SOFT }}>{t('acreditacion.selector_eyebrow')}</div>
          <h2 style={{ ...styles.h2, color: PAPER }}>{t('acreditacion.selector_title')}</h2>
          <p style={{ ...styles.paraLarge, color: '#D9DEE8' }}>{t('acreditacion.selector_subtitle')}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {audiences.map((a, i) => (
            <Link key={i} to={a.to} style={{
              display: 'block', padding: '36px 32px',
              background: NAVY_DEEP, border: `1px solid ${NAVY_SOFT}`,
              textDecoration: 'none', transition: 'all 200ms ease',
              borderTop: `3px solid ${GOLD}`,
            }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.25)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: GOLD_SOFT, fontWeight: 600 }}>
                {a.sub}
              </div>
              <h3 style={{ ...styles.h3, color: PAPER, fontSize: 26, marginTop: 8, marginBottom: 14 }}>{a.label}</h3>
              <p style={{ ...styles.para, color: '#C8CFDC', fontSize: 15, margin: 0 }}>{a.text}</p>
              <div style={{ marginTop: 22, fontFamily: FONT_SANS, fontSize: 13, color: GOLD, fontWeight: 600, letterSpacing: '0.04em' }}>
                {a.cta} →
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA contacto */}
      <Section background={BEIGE} paddingY={72}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={styles.h2}>{t('acreditacion.contact_title')}</h2>
          <p style={{ ...styles.para, marginTop: 16, fontSize: 17 }}>{t('acreditacion.contact_text')}</p>
          <div style={{ marginTop: 24 }}>
            <CTA href={`mailto:${t('common.contact_email')}`} variant="primary">
              {t('common.request_meeting')}
            </CTA>
          </div>
        </div>
      </Section>
    </>
  );
}

